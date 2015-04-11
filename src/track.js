'use strict';

import {Part} from './part';

let trackId = 0;


export class Track{

  constructor(config = {}){
    this.id = 'P' + trackId++ + Date.now();
    this._parts = [];
    this._events = [];
    this.state = 'clean';

    this._partsMap = new Map();
    this._eventsMap = new Map();
    this._newEvents = new Map();
    this._newParts = new Map();

    this.needsUpdate = false;
    this._numberOfPartsChanged = false;
    this._numberOfEventsChanged = false;

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
    this.needsUpdate = true;
  }

  addEvents(events){
    let part = new Part();
    part.track = this;
    part.addEvents(events);
    this._partsMap.set(part.id, part);
    this.numberOfPartsChanged = true;
    this.needsUpdate = true;
  }
*/

  addPart(part){
    if(part instanceof Part){
      part.track = this;
      part.state = 'new';
      this._partsMap.set(part.id, part);
      this._numberOfEventsChanged = true;
      this._numberOfPartsChanged = true;
      this.needsUpdate = true;
      return this; // make it chainable
    }
  }

  addParts(parts){
    for(let part in parts){
      this.addPart(part);
    }
  }


  removePart(part){
    if(this._partsMap.has(part.id)){
      //@todo: part.reset() here, just like event.reset()?
      part.state = 'removed';
      this._numberOfEventsChanged = true;
      this._numberOfPartsChanged = true;
      this.needsUpdate = true;
      return this; // make it chainable
    }
  }

  removeParts(parts){
    for(let part in parts){
      this.removePart(part);
    }
  }


  movePart(part, ticks){
    if(this._partsMap.has(part.id)){
      part.moveEvents(part.events, ticks);
      if(part.state !== 'new'){
        part.state = 'moved';
      }
      this.needsUpdate = true;
      return this; // make it chainable
    }
  }

  moveParts(parts, ticks){
    for(let part in parts){
      this.movePart(part, ticks);
    }_numberOfEventsChanged
  }


  transposePart(part, semitones){
    if(this._partsMap.has(part.id)){
      part.transposeEvents(part.events, semitones);
      if(part.state !== 'new'){
        part.state = 'transposed';
      }
      // no need to set needsUpdate to true!
      return this; // make it chainable
    }
  }

  transposeParts(parts, semitones){
    for(let part in parts){
      this.transposePart(part, semitones);
    }
  }


  getEvents(){
    if(this.needsUpdate){
      update();
    }
    return this._events;
  }

  getParts(){
    if(this.needsUpdate){
      update();
    }
    return this._parts;
  }

  update(){

    if(this._numberOfPartsChanged === true){
      this._parts = [];
      Array.from(this._partsMap.values()).every((part) => {
        if(part.state === 'removed'){
          this._partsMap.delete(part.id);
        }else{
          this._parts.push(part);
        }
      });

      if(this.song !== undefined){
        this.song._numberOfPartsChanged = true;
      }
      this._numberOfPartsChanged = false;
    }

    this._parts.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);



    for(let part of this._parts){
      // part.getEvents() also triggers part.update() if necessary
      let newEvents = part.getEvents().filter(fuction(event){
        return event.state === 'new';
      });
      for(let event in newEvents){
        this._eventsMap.set(event.id, event);
        this._newEvents.set(event.id, event);
      }
      if(part.state === 'new'){
        this._newParts.set(part.id, part);
      }
    }



    if(this._numberOfEventsChanged === true){
      this._events = [];
      Array.from(this._eventsMap.values()).every((event) => {
        if(event.state === 'removed'){
          this._eventsMap.delete(event.id);
        }else{
          this._events.push(event);
        }
      });

      if(this.song !== undefined){
        this.song._numberOfEventsChanged = true;
      }
      this._numberOfEventsChanged = false;
    }

    this._events.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);


    this.needsUpdate = false;
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