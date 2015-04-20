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

    let numberOfPartsHasChanged = false;
    let updateParts = false;
/*
    Array.from(this._eventsMap.values()).forEach((part) => {
      if(part.state === 'removed'){
        this._partsMap.delete(part.id);
        this._removedParts.set(part.id, part);
        numberOfPartsHasChanged = true;
      }else if(part.state === 'new'){
        this._partsMap.set(part.id, part);
        this._newParts.set(part.id, part);
        numberOfPartsHasChanged = true;
      }else if(part.state === 'moved'){
        this._movedParts.set(part.id, part);
      }else if(part.state === 'transposed'){
        this._transposedParts.set(part.id, part);
      }
      part.state = 'clean';
    });
*/
    for(let part of this._partsMap.values()){

      // part.getEvents() triggers part.update();
      let events = part.getEvents();
      // @TODO: get part._newEvents;


      if(part.state === 'removed'){
        this._partsMap.delete(part.id);
        // in case a new part gets deleted before track.update() is called
        this._newParts.delete(part.id);
        numberOfPartsHasChanged = true;
      }else if(part.state === 'new'){
        this._partsMap.set(part.id, part);
        this._newParts.set(part.id, part);
        numberOfPartsHasChanged = true;
      }else if(part.state !== 'clean'){
        updateParts = true;
      }
    }

    if(numberOfPartsHasChanged === true){
      this._parts = [];
      this._events = [];
      for(let part of this._partsMap.values()){
        this._parts.push(part);
        this._events = this._events.concat(part.getEvents());
      };
      this._events.forEach(function(event){
        this._eventsMap.set(event.id, event);
      });
    }

    if(numberOfPartsHasChanged === true || updateParts === true){
      this._parts.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);
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