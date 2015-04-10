'use strict';

import {Part} from './part';

let trackId = 0;


export class Track{

  constructor(config){
    this.id = 'P' + trackId++ + Date.now();
    this.parts = [];
    this.events = [];

    this._partsMap = new Map();
    this._changedParts = new Map();

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
    this.partsMap.set(part.id, part);
    this.numberOfPartsChanged = true;
    this.needsUpdate = true;
  }

  addEvents(events){
    let part = new Part();
    part.track = this;
    part.addEvents(events);
    this.partsMap.set(part.id, part);
    this.numberOfPartsChanged = true;
    this.needsUpdate = true;
  }
*/

  addPart(part){
    if(this._partsMap.has(part.id)){
      part.track = this;
      part.state = 'new';
      this._partsMap.set(part.id, part);
      this._changedParts.set(part.id, part);
      this._numberOfPartsChanged = true;
      this.needsUpdate = true;
    }
  }

  addParts(parts){
    for(let part in parts){
      this.addPart(part);
    }
  }


  removePart(part){
    if(this._partsMap.has(part.id)){
      part.state = 'removed';
      this._partsMap.delete(part.id, part);
      this._changedParts.set(part.id, part);
      this._numberOfPartsChanged = true;
      this.needsUpdate = true;
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
      this._changedParts.set(part.id, part);
      this.needsUpdate = true;
    }
  }

  moveParts(parts, ticks){
    for(let part in parts){
      this.movePart(part, ticks);
    }
  }


  transposePart(part, semitones){
    if(this._partsMap.has(part.id)){
      part.transposeEvents(part.events, semitones);
      if(part.state !== 'new'){
        part.state = 'transposed';
      }
      this._changedParts.set(part.id, part);
      // no need to set needsUpdate to true!
    }
  }

  transposeParts(parts, semitones){
    for(let part in parts){
      this.transposePart(part, semitones);
    }
  }


  update(){
    // first update all changed parts so the events in the part.events array are up-to-date
    // part.update() also sets track._numberOfEventsChanged to true if necessary
    for(let part of this._changedParts.values()){
      if(part.state === 'removed'){
        // do this in case only one or more parts have been removed before update was called
        this._numberOfEventsChanged = true;
      }else if(part.needsUpdate){
        part.update();
      }
    }


    // repopulate the parts array if necessary
    if(this._numberOfPartsChanged){

      // tell the song that the number of parts has changed
      if(this.song){
        this.song._numberOfPartsChanged = true;
      }

      // filter out the parts that have been removed
      let parts = this._partsMap.values();
      this.parts = parts.filter(function(part){
        return part.state !== 'removed';
      });
    }

    // always sort parts
    this.parts.sort((a, b) => (a.ticks <= b.ticks) ? 1 : -1);


    // repopulate the parts array if necessary
    if(this._numberOfEventsChanged){

      // tell the song that the number of parts has changed
      if(this.song){
        this.song._numberOfPartsChanged = true;
      }

      this.events = [];
      let parts = this.parts.values();
      for(let part in parts){
        this.events.concat(part.events);
      }
      this._numberOfEventsChanged = false;
    }

    // always sort events
    this.events.sort((a, b) => (a.ticks <= b.ticks) ? 1 : -1);

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