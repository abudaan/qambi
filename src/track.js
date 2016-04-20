import {Part} from './part'
import {sortEvents} from './util'
import {context, masterGain} from './init_audio'
import {Instrument} from './instrument'


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
    this._output.connect(masterGain)
    this._midiOutputIds = []
    this._song = null
    this._parts = []
    this._partsById = new Map()
    this._events = []
    this._eventsById = new Map()
    this._needsUpdate = false
    this._createEventArray = false
  }

  setInstrument(instrument){
    this._instrument = instrument
    instrument.connect(this._output)
  }

  setMIDIOutputs(...outputIds){
    //console.log(outputIds)
    this._midiOutputIds.push(...outputIds)
  }

  removeMIDIOutputs(...outputs){
    //this._midiOutputs = this._midiOutputs.filter(...outputs)
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
        song._deletedParts.push(part)
      }

      let events = part._events
      events.forEach(function(event){
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
}

