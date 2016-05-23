// @ flow

import {sortEvents} from './util'

let partIndex = 0

export class Part{

  constructor(name: string = null){
    this.id = `MP_${partIndex++}_${new Date().getTime()}`
    this.name = name || this.id
    this.muted = false
    this._track = null
    this._song = null
    this._events = []
    this._eventsById = new Map()
    this._needsUpdate = false
    this._createEventArray = false
    this._start = {millis: 0, ticks: 0}
    this._end = {millis: 0, ticks: 0}
  }

  copy(){
    let p = new Part(this.name + '_copy') // implement getNameOfCopy() in util (see heartbeat)
    let events = []
    this._events.forEach(function(event){
      let copy = event.copy()
      console.log(copy)
      events.push(copy)
    })
    p.addEvents(...events)
    p.update()
    return p
  }

  transpose(amount: number){
    this._events.forEach((event) => {
      event.transpose(amount)
    })
    this._needsUpdate = true
  }

  move(ticks: number){
    this._events.forEach((event) => {
      event.move(ticks)
    })
    if(this._song){
      this._song._movedEvents.push(...this._events)
    }
    this._needsUpdate = true
  }

  moveTo(ticks: number){
    this._events.forEach((event) => {
      event.moveTo(ticks)
    })
    if(this._song){
      this._song._movedEvents.push(...this._events)
    }
    this._needsUpdate = true
  }

  addEvents(...events){
    //console.log(events)
    let track = this._track
    events.forEach((event) => {
      event._part = this
      this._eventsById.set(event.id, event)
      this._events.push(event)
      if(track){
        event._track = track
      }
    })
    if(track){
      track._events.push(...events)
      track._needsUpdate = true
    }
    if(this._song){
      this._song._events.push(...events)
      track._songUpdate = true
    }
    this._needsUpdate = true
  }

  removeEvents(...events){
    let track = this._track
    events.forEach((event) => {
      event._part = null
      this._eventsById.delete(event.id)
      if(track){
        event._track = null
        track._eventsById.delete(event.id)
      }
    })
    if(track){
      track._needsUpdate = true
      track._createEventArray = true
    }
    if(this._song){
      this._song._removedEvents.push(...events)
    }
    this._createEventArray = true
    this._needsUpdate = true
  }

  moveEvents(ticks: number, ...events){
    events.forEach((event) => {
      event.move(ticks)
    })
    if(this._song){
      this._song._movedEvents.push(...this._events)
    }
    this._needsUpdate = true
  }

  moveEventsTo(ticks: number, ...events){
    events.forEach((event) => {
      event.moveTo(ticks)
    })
    if(this._song){
      this._song._movedEvents.push(...this._events)
    }
    this._needsUpdate = true
  }


  getEvents(filter: string[] = null){ // can be use as findEvents
    if(this._needsUpdate){
      this.update()
    }
    return [...this._events] //@TODO implement filter -> filterEvents() should be a utility function (not a class method)
  }

  mute(flag: boolean = null){
    if(flag){
      this.muted = flag
    }else{
      this.muted = !this.muted
    }
  }

  update(){
    if(this._needsUpdate === false){
      return
    }
    if(this._createEventArray){
      this._events = Array.from(this._eventsById.values())
      this._createEventArray = false
    }
    sortEvents(this._events)
    this._needsUpdate = false
    //@TODO: calculate part start and end, and highest and lowest note
  }
}
