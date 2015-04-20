'use strict';

import {Part} from './part';

let trackId = 0;


export class Track{

  constructor(config = {}){
    this.id = 'T' + trackId++ + Date.now();
    this._parts = [];
    this._events = [];
    this.state = 'clean';

    this._partsMap = new Map();
    this._eventsMap = new Map();
    this._newParts = new Map();
    this._changedParts = new Map();
    this._newEvents = new Map();
    this._changedEvents = new Map();
    //this._movedParts = new Map();
    //this._removedParts = new Map();
    //this._transposedParts = new Map();

    this._needsUpdate = false;

    if(config.parts){
      this.addParts(config.parts);
      config.parts = null;
    }
    this.name = config.name || this.id;
    config = null;
  }

/*
  addEvent(event){
    let part = new Part();
    part.track = this;
    part.addEvent(event);
    this._partsMap.set(part.id, part);
    this.numberOfPartsChanged = true;
    this._needsUpdate = true;
  }

  addEvents(events){
    let part = new Part();
    part.track = this;
    part.addEvents(events);
    this._partsMap.set(part.id, part);
    this.numberOfPartsChanged = true;
    this._needsUpdate = true;
  }
*/

  addPart(part){
    if(part instanceof Part){
      part.track = this;
      part.state = 'new';
      this._partsMap.set(part.id, part);
      this._needsUpdate = true;
    }
    return this; // make it chainable
  }

  addParts(parts){
    for(let part in parts){
      this.addPart(part);
    }
    return this; // make it chainable
  }


  removePart(part){
    if(this._partsMap.has(part.id)){
      //@todo: part.reset() here, just like event.reset() -> YES!
      part.state = 'removed';
      this._needsUpdate = true;
    }
    return this; // make it chainable
  }

  removeParts(parts){
    for(let part in parts){
      this.removePart(part);
    }
    return this; // make it chainable
  }


  movePart(part, ticks){
    if(this._partsMap.has(part.id)){
      part.moveEvents(part.events, ticks);
      if(part.state !== 'new'){
        part.state = 'moved';
      }
      this._needsUpdate = true;
    }
    return this; // make it chainable
  }

  moveParts(parts, ticks){
    for(let part in parts){
      this.movePart(part, ticks);
    }
    return this; // make it chainable
  }


  transposePart(part, semitones){
    if(this._partsMap.has(part.id)){
      part.transposeEvents(part.events, semitones);
      if(part.state !== 'new'){
        part.state = 'transposed';
      }
      this._needsUpdate = true;
    }
    return this; // make it chainable
  }

  transposeParts(parts, semitones){
    for(let part in parts){
      this.transposePart(part, semitones);
    }
    return this; // make it chainable
  }


  getEvents(){
    if(this._needsUpdate){
      this.update();
    }
    return this._events;
  }

  getParts(){
    if(this._needsUpdate){
      this.update();
    }
    return this._parts;
  }


  reset(){

  }

  update(){

    // if(this._needsUpdate === false){
    //   return;
    // }

    let numberOfEventsHasChanged = false;
    let numberOfPartsHasChanged = false;
    let sortEvents = false;
    let sortParts = false;

    let parts = this._partsMap.values();
    for(let part of parts){

      part.update();

      if(part._newEvents.size > 0){
        let newEvents = part._newEvents.values();
        for(let newEvent in newEvents){
          this._newEvents.set(newEvent.id, newEvent);
          this._eventsMap.set(newEvent.id, newEvent);
        }
        numberOfEventsHasChanged = true;
        part._newEvents.clear();
      }

      if(part._changedEvents.size > 0){
        let changedEvents = part._changedEvents.values();
        for(let changedEvent in changedEvents){
          this._changedEvents.set(changedEvent.id, changedEvent);
        }
        sortEvents = true;
        part._changedEvents.clear();
      }


      if(part.state === 'removed'){
        this._partsMap.delete(part.id);
        // in case a new or changed part gets deleted before track.update() is called
        this._newParts.delete(part.id);
        this._changedParts.delete(part.id);
        numberOfPartsHasChanged = true;
      }else if(part.state === 'new'){
        this._partsMap.set(part.id, part);
        this._newParts.set(part.id, part);
        numberOfPartsHasChanged = true;
      }else if(part.state !== 'clean'){
        this._changedParts.set(part.id, part);
        sortParts = true;
      }
    }

    if(numberOfPartsHasChanged === true){
      this._parts = [];
      this._events = [];
      for(let part of this._partsMap.values()){
        this._parts.push(part);
        this._events = this._events.concat(part.getEvents());
      }
      this._eventsMap.clear();

      for(let event in this._events){
        this._eventsMap.set(event.id, event);
      }
    }else if(numberOfEventsHasChanged === true){
      for(let part of this._partsMap.values()){
        this._parts.push(part);
        this._events = this._events.concat(part.getEvents());
      }
      this._eventsMap.clear();
      for(let event in this._events){
        this._eventsMap.set(event.id, event);
      }
    }

    if(numberOfPartsHasChanged === true || sortParts === true){
      this._parts.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);
      this._events.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);
    }else if(numberOfEventsHasChanged === true || sortEvents === true){
      this._events.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);
    }

    this._needsUpdate = false;
  }
}

export function createTrack(config){
  return new Track(config);
}


/*
let Track = {
    init: function(){
        let id = 'T' + trackId++ + new Date().getTime();
        Object.defineProperty(this, 'id', {
            value: id
        });
    }
};

export default function createTrack(){
  var t = Object.create(Track);
  t.init(arguments);
  return t;
}

*/