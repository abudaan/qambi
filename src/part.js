'use strict';

import {info} from './util.js';
import {MIDIEvent} from './midi_event.js';
import {AudioEvent} from './audio_event.js';

let partId = 0;


export class Part{

  constructor(config = {}){
    this.id = 'P' + partId++ + Date.now();
    this._events = [];
    this.needsUpdate = false;
    this.ticks = 0;

    this._eventsMap = new Map();
    this._numberOfEventsChanged = false;

    if(config.events){
      this.addEvents(config.events);
    }
    this.name = config.name || this.id;
    config = null;
  }

  addEvent(event){
    if(event instanceof MIDIEvent || event instanceof AudioEvent){
      event.state = 'new';
      this.needsUpdate = true;
      this._numberOfEventsChanged = true;
      this._eventsMap.set(event.id, event);
      return this; // make it chainable
    }
  }

  addEvents(events){
    for(let event of events){
      this.addEvent(event);
    }
  }


  removeEvent(event){
    if(this._eventsMap.has(event.id)){
      event.reset(true, false, false);
      this.needsUpdate = true;
      this._numberOfEventsChanged = true;
      return this; // make it chainable
    }
  }

  removeEvents(events){
    for(let event of events){
      this.removeEvent(event);
    }
  }


  moveEvent(event, ticks){
    if(this._eventsMap.has(event.id)){
      event.move(ticks);
      this.needsUpdate = true;
      return this; // make it chainable
    }
  }

  moveEvents(events){
    for(let event of events){
      this.moveEvent(event);
    }
  }


  transposeEvent(event, semitones){
    if(this._eventsMap.has(event.id)){
      if(event.type !== 128 && event.type !== 144){
        return;
      }
      event.transpose(semitones);
      // no need to set needsUpdate to true!
      return this; // make it chainable
    }
  }

  transposeEvents(events){
    for(let event of events){
      this.transposeEvent(event);
    }
  }

  getEvents(){
    if(this.needsUpdate){
      this.update();
    }
    return this._events;
  }

  update(){

    if(this._numberOfEventsChanged === true){
      this._events = [];
      Array.from(this._eventsMap.values()).every((event) => {
        if(event.state === 'removed'){
          this._eventsMap.delete(event.id);
        }else{
          this._events.push(event);
        }
      });

      if(this.track !== undefined){
        this.track._numberOfEventsChanged = true;
      }
      this._numberOfEventsChanged = false;
    }

    this._events.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);

    // create notes
    let notes = {};
    let n = 0;
    for(let event of this._events){
      if(event.type === 144){
        notes[event.noteNumber] = event;
      }else if(event.type === 128){
        let noteOn = notes[event.noteNumber];
        //console.log(event.noteNumber, noteOn);
        let noteOff = event;
        if(noteOn === undefined){
          info('no note on event!', n++);
          continue;
        }
        noteOn.noteOff = noteOff;
        noteOff.noteOn = noteOn;
        noteOn.durationTicks = noteOff.ticks - noteOn.ticks;
        delete notes[event.noteNumber];
      }
    }

    this.needsUpdate = false;
  }
}

export function createPart(config){
  return new Part(config);
}