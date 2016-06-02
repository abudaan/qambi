import {Part} from './part'
import {MIDIEvent} from './midi_event'
import {MIDINote} from './midi_note'
import {getMIDIInputById, getMIDIOutputById} from './init_midi'
import {sortEvents} from './util'
import {context} from './init_audio'
import {MIDIEventTypes} from './qambi'
import {dispatchEvent} from './eventlistener'

const zeroValue = 0.00000000000000001
let instanceIndex = 0

export class Track{

  constructor(settings = {}){
    this.id = `${this.constructor.name}_${instanceIndex++}_${new Date().getTime()}`;

    ({
      name: this.name = this.id,
      channel: this.channel = 0,
      muted: this.muted = false,
      volume: this.volume = 0.5,
    } = settings);

    //console.log(this.name, this.channel, this.muted, this.volume)

    this._panner = context.createPanner()
    this._panner.panningModel = 'equalpower'
    this._panner.setPosition(zeroValue, zeroValue, zeroValue)
    this._output = context.createGain()
    this._output.gain.value = this.volume
    this._panner.connect(this._output)
    //this._output.connect(this._panner)
    this._midiInputs = new Map()
    this._midiOutputs = new Map()
    this._song = null
    this._parts = []
    this._partsById = new Map()
    this._events = []
    this._eventsById = new Map()
    this._needsUpdate = false
    this._createEventArray = false
    this._instrument = null
    this._tmpRecordedNotes = new Map()
    this._recordedEvents = []
    this.scheduledSamples = new Map()
    this.sustainedSamples = []
    this.sustainPedalDown = false
    this.monitor = false
    this._songInput = null
    this._effects = []

    let {parts, instrument} = settings
    if(typeof parts !== 'undefined'){
      this.addParts(...parts)
    }
    if(typeof instrument !== 'undefined'){
      this.setInstrument(instrument)
    }
  }

  setInstrument(instrument = null){
    if(instrument !== null
      // check if the mandatory functions of an instrument are present (Interface Instrument)
      && typeof instrument.connect === 'function'
      && typeof instrument.disconnect === 'function'
      && typeof instrument.processMIDIEvent === 'function'
      && typeof instrument.allNotesOff === 'function'
      && typeof instrument.unschedule === 'function'
    ){
      this.removeInstrument()
      this._instrument = instrument
      this._instrument.connect(this._panner)
    }else if(instrument === null){
      // if you pass null as argument the current instrument will be removed, same as removeInstrument
      this.removeInstrument()
    }else{
      console.log('Invalid instrument, and instrument should have the methods "connect", "disconnect", "processMIDIEvent", "unschedule" and "allNotesOff"')
    }
  }

  removeInstrument(){
    if(this._instrument !== null){
      this._instrument.allNotesOff()
      this._instrument.disconnect()
      this._instrument = null
    }
  }

  getInstrument(){
    return this._instrument
  }

  connectMIDIOutputs(...outputs){
    //console.log(outputs)
    outputs.forEach(output => {
      if(typeof output === 'string'){
        output = getMIDIOutputById(output)
      }
      if(output instanceof MIDIOutput){
        this._midiOutputs.set(output.id, output)
      }
    })
    //console.log(this._midiOutputs)
  }

  disconnectMIDIOutputs(...outputs){
    //console.log(outputs)
    if(outputs.length === 0){
      this._midiOutputs.clear()
    }
    outputs.forEach(port => {
      if(port instanceof MIDIOutput){
        port = port.id
      }
      if(this._midiOutputs.has(port)){
        //console.log('removing', this._midiOutputs.get(port).name)
        this._midiOutputs.delete(port)
      }
    })
    //this._midiOutputs = this._midiOutputs.filter(...outputs)
    //console.log(this._midiOutputs)
  }

  connectMIDIInputs(...inputs){
    inputs.forEach(input => {
      if(typeof input === 'string'){
        input = getMIDIInputById(input)
      }
      if(input instanceof MIDIInput){

        this._midiInputs.set(input.id, input)

        input.onmidimessage = e => {
          if(this.monitor === true){
            //console.log(...e.data)
            this._preprocessMIDIEvent(new MIDIEvent(this._song._ticks, ...e.data))
          }
        }
      }
    })
    //console.log(this._midiInputs)
  }

  // you can pass both port and port ids
  disconnectMIDIInputs(...inputs){
    if(inputs.length === 0){
      this._midiInputs.forEach(port => {
        port.onmidimessage = null
      })
      this._midiInputs.clear()
      return
    }
    inputs.forEach(port => {
      if(port instanceof MIDIInput){
        port = port.id
      }
      if(this._midiInputs.has(port)){
        this._midiInputs.get(port).onmidimessage = null
        this._midiInputs.delete(port)
      }
    })
    //this._midiOutputs = this._midiOutputs.filter(...outputs)
    //console.log(this._midiInputs)
  }

  getMIDIInputs(){
    return Array.from(this._midiInputs.values())
  }

  getMIDIOutputs(){
    return Array.from(this._midiOutputs.values())
  }

  setRecordEnabled(type){ // 'midi', 'audio', empty or anything will disable recording
    this._recordEnabled = type
  }

  _startRecording(recordId){
    if(this._recordEnabled === 'midi'){
      //console.log(recordId)
      this._recordId = recordId
      this._recordedEvents = []
      this._recordPart = new Part(this._recordId)
    }
  }

  _stopRecording(recordId){
    if(this._recordId !== recordId){
      return
    }
    if(this._recordedEvents.length === 0){
      return
    }
    this._recordPart.addEvents(...this._recordedEvents)
    //this._song._newEvents.push(...this._recordedEvents)
    this.addParts(this._recordPart)
  }

  undoRecording(recordId){
    if(this._recordId !== recordId){
      return
    }
    this.removeParts(this._recordPart)
    //this._song._removedEvents.push(...this._recordedEvents)
  }

  redoRecording(recordId){
    if(this._recordId !== recordId){
      return
    }
    this.addParts(this._recordPart)
  }

  copy(){
    let t = new Track(this.name + '_copy') // implement getNameOfCopy() in util (see heartbeat)
    let parts = []
    this._parts.forEach(function(part){
      let copy = part.copy()
      console.log(copy)
      parts.push(copy)
    })
    t.addParts(...parts)
    t.update()
    return t
  }

  transpose(amount: number){
    this._events.forEach((event) => {
      event.transpose(amount)
    })
  }

  addParts(...parts){
    let song = this._song

    parts.forEach((part) => {

      part._track = this
      this._parts.push(part)
      this._partsById.set(part.id, part)

      let events = part._events
      this._events.push(...events)

      if(song){
        part._song = song
        song._newParts.push(part)
        song._newEvents.push(...events)
      }

      events.forEach((event) => {
        event._track = this
        if(song){
          event._song = song
        }
        this._eventsById.set(event.id, event)
      })
    })
    this._needsUpdate = true
  }

  removeParts(...parts){
    let song = this._song

    parts.forEach((part) => {
      part._track = null
      this._partsById.delete(part.id, part)

      let events = part._events

      if(song){
        song._removedParts.push(part)
        song._removedEvents.push(...events)
      }

      events.forEach(event => {
        event._track = null
        if(song){
          event._song = null
        }
        this._eventsById.delete(event.id, event)
      })
    })
    this._needsUpdate = true
    this._createEventArray = true
  }

  getParts(){
    if(this._needsUpdate){
      this._parts = Array.from(this._partsById.values())
      this._events = Array.from(this._eventsById.values())
      this._needsUpdate = false
    }
    return [...this._parts]
  }


  transposeParts(amount: number, ...parts){
    parts.forEach(function(part){
      part.transpose(amount)
    })
  }

  moveParts(ticks: number, ...parts){
    parts.forEach(function(part){
      part.move(ticks)
    })
  }

  movePartsTo(ticks: number, ...parts){
    parts.forEach(function(part){
      part.moveTo(ticks)
    })
  }
/*
  addEvents(...events){
    let p = new Part()
    p.addEvents(...events)
    this.addParts(p)
  }
*/
  removeEvents(...events){
    let parts = new Set()
    events.forEach((event) => {
      parts.set(event._part)
      event._part = null
      event._track = null
      event._song = null
      this._eventsById.delete(event.id)
    })
    if(this._song){
      this._song._removedEvents.push(...events)
      this._song._changedParts.push(...Array.from(parts.entries()))
    }
    this._needsUpdate = true
    this._createEventArray = true
  }

  moveEvents(ticks: number, ...events){
    let parts = new Set()
    events.forEach((event) => {
      event.move(ticks)
      parts.set(event.part)
    })
    if(this._song){
      this._song._movedEvents.push(...events)
      this._song._changedParts.push(...Array.from(parts.entries()))
    }
  }

  moveEventsTo(ticks: number, ...events){
    let parts = new Set()
    events.forEach((event) => {
      event.moveTo(ticks)
      parts.set(event.part)
    })
    if(this._song){
      this._song._movedEvents.push(...events)
      this._song._changedParts.push(...Array.from(parts.entries()))
    }
  }

  getEvents(filter: string[] = null){ // can be use as findEvents
    if(this._needsUpdate){
      this.update()
    }
    return [...this._events] //@TODO implement filter -> filterEvents() should be a utility function (not a class method)
  }

  mute(flag: boolean = null){
    if(flag){
      this._muted = flag
    }else{
      this._muted = !this._muted
    }
  }

  update(){ // you should only use this in huge songs (>100 tracks)
    if(this._createEventArray){
      this._events = Array.from(this._eventsById.values())
      this._createEventArray = false
    }
    sortEvents(this._events)
    this._needsUpdate = false
  }

  /*
    routing: sample source -> panner -> gain -> [...fx] -> song output
    @TODO: needs some rethinking!
  */
  connect(songOutput){
    this._songOutput = songOutput
    this._output.connect(this._songOutput)
  }

  disconnect(){
    this._output.disconnect(this._songOutput)
    this._songOutput = null
  }

  _checkEffect(effect){
    if(typeof effect.setInput !== 'function' || typeof effect.setOutput !== 'function' || typeof effect.getOutput !== 'function' || typeof effect.disconnect !== 'function'){
      console.log('Invalid channel fx, and channel fx should have the methods "setInput", "setOutput", "getOutput" and "disconnect"')
      return false
    }
    return true
  }

  addEffect(effect){
    if(this._checkEffect(effect) === false){
      return
    }
    let numFX = this._effects.length
    let lastFX
    let output
    if(numFX === 0){
      lastFX = this._output
      lastFX.disconnect(this._songOutput)
      output = this._output
    }else{
      lastFX = this._effects[numFX - 1]
      lastFX.disconnect()
      output = lastFX.getOutput()
    }

    effect.setInput(output)
    effect.setOutput(this._songOutput)

    this._effects.push(effect)
  }

  addEffectAt(effect, index: number){
    if(this._checkEffect(effect) === false){
      return
    }
    this._effects.splice(index, 0, effect)
  }

  removeEffect(index: number){
    if(isNaN(index)){
      return
    }
    this._effects.forEach(fx => {
      fx.disconnect()
    })
    this._effects.splice(index, 1)

    let numFX = this._effects.length

    if(numFX === 0){
      this._output.connect(this._songOutput)
      return
    }

    let lastFX = this._output
    this._effects.forEach((fx, i) => {
      fx.setInput(lastFX)
      if(i === numFX - 1){
        fx.setOutput(this._songOutput)
      }else{
        fx.setOutput(this._effects[i + 1])
      }
      lastFX = fx
    })
  }

  getEffects(){
    return this._effects
  }

  getEffectAt(index: number){
    if(isNaN(index)){
      return null
    }
    return this._effects[index]
  }

  getOutput(){
    return this._output
  }

  getInput(){
    return this._songOutput
  }

  // method is called when a MIDI events is send by an external or on-screen keyboard
  _preprocessMIDIEvent(midiEvent){
    let time = context.currentTime * 1000
    midiEvent.time = time
    midiEvent.time2 = 0//performance.now() -> passing 0 has the same effect as performance.now() so we choose the former
    midiEvent.recordMillis = time
    let note

    if(midiEvent.type === MIDIEventTypes.NOTE_ON){
      note = new MIDINote(midiEvent)
      this._tmpRecordedNotes.set(midiEvent.data1, note)
      dispatchEvent({
        type: 'noteOn',
        data: midiEvent
      })
    }else if(midiEvent.type === MIDIEventTypes.NOTE_OFF){
      note = this._tmpRecordedNotes.get(midiEvent.data1)
      if(typeof note === 'undefined'){
        return
      }
      note.addNoteOff(midiEvent)
      this._tmpRecordedNotes.delete(midiEvent.data1)
      dispatchEvent({
        type: 'noteOff',
        data: midiEvent
      })
    }

    if(this._recordEnabled === 'midi' && this._song.recording === true){
      this._recordedEvents.push(midiEvent)
    }
    this.processMIDIEvent(midiEvent)
  }

  // method is called by scheduler during playback
  processMIDIEvent(event){

    if(typeof event.time === 'undefined'){
      this._preprocessMIDIEvent(event)
      return
    }

    // send to javascript instrument
    if(this._instrument !== null){
      //console.log(this.name, event)
      this._instrument.processMIDIEvent(event)
    }

    // send to external hardware or software instrument
    this._sendToExternalMIDIOutputs(event)
  }

  _sendToExternalMIDIOutputs(event){
    //console.log(event.time, event.millis)
    for(let port of this._midiOutputs.values()){
      if(port){
        if(event.data2 !== -1){
          port.send([event.type + this.channel, event.data1, event.data2], event.time2)
        }else{
          port.send([event.type + this.channel, event.data1], event.time2)
        }
        // if(event.type === 128 || event.type === 144 || event.type === 176){
        //   port.send([event.type + this.channel, event.data1, event.data2], event.time + latency)
        // }else if(event.type === 192 || event.type === 224){
        //   port.send([event.type, event.data1], event.time + latency)
        // }
      }
    }
  }

  unschedule(midiEvent){

    if(this._instrument !== null){
      this._instrument.unschedule(midiEvent)
    }

    if(this._midiOutputs.size === 0){
      return
    }

    if(midiEvent.type === 144){
      let midiNote = midiEvent.midiNote
      let noteOff = new MIDIEvent(0, 128, midiEvent.data1, 0)
      noteOff.midiNoteId = midiNote.id
      noteOff.time = context.currentTime
      this._sendToExternalMIDIOutputs(noteOff, true)
    }
  }

  allNotesOff(){
    if(this._instrument !== null){
      this._instrument.allNotesOff()
    }

    // let timeStamp = (context.currentTime * 1000) + this.latency
    // for(let output of this._midiOutputs.values()){
    //   output.send([0xB0, 0x7B, 0x00], timeStamp) // stop all notes
    //   output.send([0xB0, 0x79, 0x00], timeStamp) // reset all controllers
    // }
  }

  setPanning(value){
    if(value < -1 || value > 1){
      console.log('Track.setPanning() accepts a value between -1 (full left) and 1 (full right), you entered:', value)
      return
    }
    let x = value
    let y = 0
    let z = 1 - Math.abs(x)

    x = x === 0 ? zeroValue : x
    y = y === 0 ? zeroValue : y
    z = z === 0 ? zeroValue : z

    this._panner.setPosition(x, y, z)
    this._panningValue = value
  }

  getPanning(){
    return this._panningValue
  }

}
