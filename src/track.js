'use strict';

import {Part} from './part';

let trackId = 0;


export class Track{

  constructor(config = {}){
    this.id = 'P' + trackId++ + Date.now();
    this.parts = [];
    this.events = [];
    this.state = 'clean';

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
    if(part instanceof Part){
      part.track = this;
      part.state = 'new';
      this._partsMap.set(part.id, part);
      this._changedParts.set(part.id, part);
      this._numberOfEventsChanged = true;
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
      this._numberOfEventsChanged = true;
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

    if(this.needsUpdate === false){
      return;
    }

    // first update all parts that need to be updated so the events in the part.events array are up-to-date
    // part.update() also sets track._numberOfEventsChanged to true if necessary
    for(let part of this._changedParts.values()){
      if(part.needsUpdate){
        part.update();
      }
    }

    // repopulate the parts array if necessary
    if(this._numberOfPartsChanged){
      this.parts = Array.from(this._partsMap.values());
      this._numberOfPartsChanged = false;
      // tell the song that the number of parts has changed
      if(this.song){
        this.song._numberOfPartsChanged = true;
      }
    }

    // always sort parts
    this.parts.sort((a, b) => (a.ticks <= b.ticks) ? 1 : -1);


    // repopulate the events array if necessary
    if(this._numberOfEventsChanged){
      this.events = [];
      let parts = this.parts.values();
      for(let part in parts){
        this.events.concat(part.events);
      }
      this._numberOfEventsChanged = false;
      // tell the song that the number of events has changed
      if(this.song){
        this.song._numberOfEventsChanged = true;
      }
    }

    // always sort events
    this.events.sort((a, b) => (a.ticks <= b.ticks) ? 1 : -1);

    // tell the song that the track has changed, this is only necessary if track.update is called before song.update
    if(this._changedParts.size !== 0 && this.song !== undefined){
      this.song._changedTracks.set(this.id, this);
    }

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