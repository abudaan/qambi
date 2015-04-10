'use strict'

import {warn} from './util.js';

let partId = 0;


export class Part{

  constructor(...args){
    let id = 'P' + partId++ + Date.now();
    this.events = [];
    this.eventsMap = new Map();
  }

  addEvents(events){
    for(let event of events){
      this.events.push(event);
      this.eventsMap.set(event.id, event);
      if(this.track !== undefined){
        this.track.newEventsMap.set(event.id, event);
      }
      if(this.song !== undefined){
        this.song.newEventsMap.set(event.id, event);
      }
    }
  }

  removeEvents(events){
    for(let event of events){
      event.state = 'removed';
      if(this.track !== undefined){
        this.track.removedEventsMap.set(event.id, event);
      }
      if(this.song !== undefined){
        this.song.removedEventsMap.set(event.id, event);
      }
    }
  }

  update(){
    let events = this.eventsMap.values();
    this.events = [];
    for(let event of events){
      if(event.state !== 'removed'){
        this.events.push(event);
      }
    }
    this.events.sort((a, b) => (a.ticks <= b.ticks) ? 1 : -1);

    let notes = {};
    for(let event of this.events){
      let type = event.type;
      if(event.type === 144){
        notes[event.noteNumber] = event;
      }else if(event.type === 128){
        let noteOn = notes[event.noteNumber];
        let noteOff = event;
        if(noteOn === undefined){
          warn('no note on event!');
          continue;
        }
        noteOn.noteOff = noteOff;
        noteOff.noteOn = noteOn;
        noteOn.durationTicks = noteOff.ticks - noteOn.ticks;
        delete notes[event.noteNumber];
      }
    }
  }
}

export function createPart(){
  return new Part(...arguments);
}