// @ flow

import {sortEvents} from './util'

let partIndex = 0

export class Part{

  constructor(name: string = null){
    this.id = `MP_${partIndex++}_${new Date().getTime()}`
    this.name = name || this.id
    this.mute = false
    this._track = null
    this._events = []
    this._eventsById = new Map()
    this._needsUpdate = false
    this._createEventArray = false
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
  }

  moveTo(ticks: number){
    this._events.forEach((event) => {
      event.moveTo(ticks)
    })
    this._needsUpdate = true
  }

  addEvents(...events){
    console.log(events)
    events.forEach((event) => {
      event._part = this
      this._eventsById.set(event.id, event)
      this._events.push(event)
    })
    if(this._track){
      this._track.addEvents(...events)
    }
    this._needsUpdate = true
  }

  moveEvents(ticks: number, ...events){
    events.forEach((event) => {
      event.move(ticks)
    })
    this._needsUpdate = true
  }

  moveEventsTo(ticks: number, ...events){
    events.forEach((event) => {
      event.moveTo(ticks)
    })
    this._needsUpdate = true
  }

  removeEvents(...events){
    events.forEach((event) => {
      event._part = null
      this._eventsById.delete(event.id)
    })
    this._needsUpdate = true
    this._createEventArray = true
    if(this._track){
      this._track.removeEvents(...events)
    }
  }

  findEvents(filter: string[]){ // same as getEvents
    if(this._needsUpdate){
      this.update()
    }
    return [...this._events] //@TODO implement filter -> filterEvents() should be a utility function (not a class method)
  }

  update(){
    if(this._createEventArray){
      this._events = Array.from(this._eventsById.values())
      this._createEventArray = false
    }
    sortEvents(this._events)
    this._needsUpdate = false
    //@TODO: calculate part start and end, and highest and lowest note
  }
}
