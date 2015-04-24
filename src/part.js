'use strict';

import {info, createState} from './util.js';
import {MIDIEvent} from './midi_event.js';
import {MIDINote} from './midi_note.js';
import {AudioEvent} from './audio_event.js';

let partId = 0;


export class Part{

  constructor(config = {}){
    this.id = 'P' + partId++ + Date.now();
    this._events = [];
    this._needsUpdate = false;
    this.ticks = 0;

    this._eventsMap = new Map();
    this._notesMap = new Map();
    this._newEvents = new Map();
    this._state = createState();

    if(config.events){
      this.addEvents(config.events);
    }
    this.name = config.name || this.id;
    config = null;
  }

  addEvent(event){
    if(event instanceof MIDIEvent || event instanceof AudioEvent){
      event._state.part = 'new';
      event.part = this;
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
    let sortEvents = false;

    let events = this._eventsMap.values();
    for(let event of events){
      if(event._state.part === 'removed'){
        this._eventsMap.delete(event.id);
        // in case a new event gets deleted before part.update() is called
        if(this._newEvents.has(event.id)){
          this._newEvents.delete(event.id);
        }
        numberOfEventsHasChanged = true;
      }else if(event._state.part === 'new'){
        this._newEvents.set(event.id, event);
        numberOfEventsHasChanged = true;
      }else if(event._state.part !== 'clean'){
        sortEvents = true;
      }
      event._state.part = 'clean';
    }

    // if number of events has changed update the _events array and the _eventsMap map
    if(numberOfEventsHasChanged === true){
      this._events = [];
      let events = this._eventsMap.values();
      for(let event of events){
        this._events.push(event);
      }
    }


    if(numberOfEventsHasChanged === true || sortEvents === true){
      this._events.sort((a, b) => (a._sortIndex <= b._sortIndex) ? -1 : 1);
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
        let midiNote = new MIDINote(noteOn, noteOff);
        this._notesMap.set(midiNote.id, midiNote);
        delete notes[event.noteNumber];
      }
    }

    this._needsUpdate = false;
  }
}

export function createPart(config){
  return new Part(config);
}