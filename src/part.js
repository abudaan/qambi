'use strict';

import {info} from './util.js';
import {MIDIEvent} from './midi_event.js';
import {AudioEvent} from './audio_event.js';

let partId = 0;


export class Part{

  constructor(config = {}){
    this.id = 'P' + partId++ + Date.now();
    this._events = [];
    this._needsUpdate = false;
    this.ticks = 0;

    this._eventsMap = new Map();
    this._newEvents = new Map();
    //this._movedEvents = new Map();
    //this._removedEvents = new Map();
    //this._transposedEvents = new Map();

    if(config.events){
      this.addEvents(config.events);
    }
    this.name = config.name || this.id;
    config = null;
  }

  addEvent(event){
    if(event instanceof MIDIEvent || event instanceof AudioEvent){
      event.state = 'new';
      this._needsUpdate = true;
      this._eventsMap.set(event.id, event);
      return this; // make it chainable
    }
  }

  addEvents(events){
    for(let event of events){
      this.addEvent(event);
    }
    return this; // make it chainable
  }


  removeEvent(event){
    if(this._eventsMap.has(event.id)){
      event.reset(true, false, false);
      this._needsUpdate = true;
      return this; // make it chainable
    }
  }

  removeEvents(events){
    for(let event of events){
      this.removeEvent(event);
    }
    return this; // make it chainable
  }


  moveEvent(event, ticks){
    if(this._eventsMap.has(event.id)){
      event.move(ticks);
      this._needsUpdate = true;
      return this; // make it chainable
    }
  }

  moveEvents(events){
    for(let event of events){
      this.moveEvent(event);
    }
    return this; // make it chainable
  }


  transposeEvent(event, semitones){
    if(this._eventsMap.has(event.id)){
      if(event.type !== 128 && event.type !== 144){
        return;
      }
      event.transpose(semitones);
      this._needsUpdate = true;
      return this; // make it chainable
    }
  }

  transposeEvents(events){
    for(let event of events){
      this.transposeEvent(event);
    }
    return this; // make it chainable
  }

  getEvents(){
    if(this._needsUpdate){
      this.update();
    }
    return this._events;
  }

  update(){

    if(this._needsUpdate === false){
      return;
    }

    let numberOfEventsHasChanged = false;
    let updateEvents = false;
/*
    Array.from(this._eventsMap.values()).forEach((event) => {
      if(event.state === 'removed'){
        this._eventsMap.delete(event.id);
        this._removedEvents.set(event.id, event);
        numberOfEventsHasChanged = true;
      }else if(event.state === 'new'){
        this._eventsMap.set(event.id, event);
        this._newEvents.set(event.id, event);
        numberOfEventsHasChanged = true;
      }else if(event.state === 'moved'){
        this._movedEvents.set(event.id, event);
      }else if(event.state === 'transposed'){
        this._transposedEvents.set(event.id, event);
      }
      event.state = 'clean';
    });
*/
    Array.from(this._eventsMap.values()).forEach((event) => {
      if(event.state === 'removed'){
        this._eventsMap.delete(event.id);
        // in case a new event gets deleted before part.update() is called
        this._newEvents.delete(event.id);
        numberOfEventsHasChanged = true;
      }else if(event.state === 'new'){
        this._eventsMap.set(event.id, event);
        this._newEvents.set(event.id, event);
        numberOfEventsHasChanged = true;
      }else if(event.state !== 'clean'){
        updateEvents = true;
      }
    });

    // if number of events has changed update the _events array and the _eventsMap map
    if(numberOfEventsHasChanged === true){
      this._events = [];
      Array.from(this._eventsMap.values()).forEach((event) => {
        this._events.push(event);
      });
    }


    if(numberOfEventsHasChanged === true || updateEvents === true){
      this._events.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);
    }

    // create notes -> @TODO: only necessary if number of events has changed
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

    this._needsUpdate = false;
  }
}

export function createPart(config){
  return new Part(config);
}