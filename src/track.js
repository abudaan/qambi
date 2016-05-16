import {Part} from './part'
import {MIDIEvent} from './midi_event'
import {MIDINote} from './midi_note'
import {getMIDIInputById, getMIDIOutputById} from './init_midi'
import {sortEvents} from './util'
import {context} from './init_audio'
import {Instrument} from './instrument'
import {MIDIEventTypes} from './qambi'


let trackIndex = 0

export class Track{

  constructor(name: string = null){
    this.id = `TR_${trackIndex++}_${new Date().getTime()}`
    this.name = name || this.id
    this.channel = 0
    this.muted = false
    this.volume = 0.5
    this._output = context.createGain()
    this._output.gain.value = this.volume
    this._midiInputs = new Map()
    this._midiOutputs = new Map()
    this._song = null
    this._parts = []
    this._partsById = new Map()
    this._events = []
    this._eventsById = new Map()
    this._needsUpdate = false
    this._createEventArray = false
    this.latency = 100
    this._instrument = null
    this._tmpRecordedNotes = new Map()
    this._recordedEvents = []
    //this.setInstrument(new Instrument('sinewave'))
  }

  setInstrument(instrument = null){
    if(this._instrument !== null){
      this._instrument.allNotesOff()
      this._instrument.disconnect()
    }
    this._instrument = instrument
    if(this._instrument !== null){
      this._instrument.connect(this._output)
    }
  }

  getInstrument(){
    return this._instrument
  }

  connect(output){
    this._output.connect(output)
  }

  disconnect(){
    this._output.disconnect()
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

        let note, midiEvent
        input.addEventListener('midimessage', e => {

          midiEvent = new MIDIEvent(this._song._ticks, ...e.data)
          midiEvent.time = 0 // play immediately
          midiEvent.recordMillis = context.currentTime * 1000

          if(midiEvent.type === MIDIEventTypes.NOTE_ON){
            note = new MIDINote(midiEvent)
            this._tmpRecordedNotes.set(midiEvent.data1, note)
          }else if(midiEvent.type === MIDIEventTypes.NOTE_OFF){
            note = this._tmpRecordedNotes.get(midiEvent.data1)
            note.addNoteOff(midiEvent)
            this._tmpRecordedNotes.delete(midiEvent.data1)
          }

          if(this._recordEnabled === 'midi' && this._song._recording === true){
            this._recordedEvents.push(midiEvent)
          }
          this.processMIDIEvent(midiEvent)
        })
      }
    })
    //console.log(this._midiInputs)
  }

  disconnectMIDIInputs(...inputs){
    if(inputs.length === 0){
      this._midiInputs.clear()
    }
    inputs.forEach(port => {
      if(port instanceof MIDIInput){
        port = port.id
      }
      if(this._midiOutputs.has(port)){
        this._midiOutputs.delete(port)
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
      this._recordId = recordId
      this._recordedEvents = []
      this._recordPart = new Part(this._recordId)
    }
  }

  _stopRecording(recordId){
    if(this._recordId !== recordId){
      return
    }
    this._recordPart.addEvents(...this._recordedEvents)
    this.addParts(this._recordPart)
  }

  undoRecording(recordId){
    if(this._recordId !== recordId){
      return
    }
    this.removeParts(this._recordPart)
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
      this._partsById.set(part.id, part)
      this._parts.push(part)
      if(song){
        part._song = song
        song._newParts.push(part)
      }

      let events = part._events
      events.forEach((event) => {
        event._track = this
        if(song){
          event._song = song
          //song._newEvents.push(event)
        }
        this._eventsById.set(event.id, event)
      })
      this._events.push(...events)
    })
    this._needsUpdate = true
  }

  removeParts(...parts){
    let song = this._song

    parts.forEach((part) => {
      part._track = null
      this._partsById.delete(part.id, part)
      if(song){
        song._removedParts.push(part)
      }

      let events = part._events
      events.forEach(event => {
        event._track = null
        if(song){
          event._song = null
          //song._deletedEvents.push(event)
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

  addEvents(...events){
    let p = new Part()
    p.addEvents(...events)
    this.addParts(p)
  }

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
      this._song._changedParts.push(...Array.from(parts.entries()))
      this._song._removedEvents.push(...events)
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
      this._song._changedParts.push(...Array.from(parts.entries()))
      this._song._movedEvents.push(...events)
    }
  }

  moveEventsTo(ticks: number, ...events){
    let parts = new Set()
    events.forEach((event) => {
      event.moveTo(ticks)
      parts.set(event.part)
    })
    if(this._song){
      this._song._changedParts.push(...Array.from(parts.entries()))
      this._song._movedEvents.push(...events)
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

  allNotesOff(){
    if(this._instrument !== null){
      this._instrument.allNotesOff()
    }

    let timeStamp = (context.currentTime * 1000) + this.latency
    for(let output of this._midiOutputs.values()){
      output.send([0xB0, 0x7B, 0x00], timeStamp) // stop all notes
      output.send([0xB0, 0x79, 0x00], timeStamp) // reset all controllers
    }
  }

  processMIDIEvent(event, useLatency = false){

    let latency = useLatency ? this.latency : 0
    //console.log(latency)

    // send to javascript instrument
    if(this._instrument !== null){
      this._instrument.processMIDIEvent(event, event.time / 1000)
    }

    // send to external hardware or software instrument
    for(let port of this._midiOutputs.values()){
      if(port){
        if(event.type === 128 || event.type === 144 || event.type === 176){
          port.send([event.type + this.channel, event.data1, event.data2], event.time + latency)
        }else if(event.type === 192 || event.type === 224){
          port.send([event.type + this.channel, event.data1], event.time + latency)
        }
      }
    }
  }
}

