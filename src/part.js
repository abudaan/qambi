'use strict';

import {warn} from './util.js';
import {MIDIEvent} from './midi_event.js';
import {AudioEvent} from './audio_event.js';

let partId = 0;


export class Part{

  constructor(config){
    this.id = 'P' + partId++ + Date.now();
    this.events = [];
    this.needsUpdate = false;
    this.ticks = 0;

    this._eventsMap = new Map();
    this._changedEvents = new Map();
    this._numberOfEventsChanged = false;

    if(config.events){
      this.addEvents(config.events);
    }
    this.name = config.name || this.id;
    config = null;
  }

  addEvent(event){
    if(event instanceof MIDIEvent === false && event instanceof AudioEvent === false){
      return;
    }
    event.state = 'new';
    this.needsUpdate = true;
    this._eventsMap.set(event.id, event);
    this._changedEvents.set(event.id, event);
    this._numberOfEventsChanged = true;
  }

  addEvents(events){
    for(let event of events){
      this.addEvent(event);
    }
  }


  removeEvent(event){
    if(this._eventsMap.has(event.id)){
      event.state = 'removed';
      this.needsUpdate = true;
      this._eventsMap.delete(event.id, event);
      this._changedEvents.set(event.id, event);
      this._numberOfEventsChanged = true;
    }
  }

  removeEvents(events){
    for(let event of events){
      this.removeEvent(event);
    }
  }


  moveEvent(event, ticks){
    if(this._eventsMap.has(event.id)){
      if(event.state !== 'new'){
        event.state = 'moved';
      }
      event.ticks += ticks;
      this.needsUpdate = true;
      this._changedEvents.set(event.id, event);
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
      if(event.state !== 'new'){
        event.state = 'transposed';
      }
      event.transpose(semitones);
      this._changedEvents.set(event.id, event);
      // no need to set needsUpdate to true!
    }
  }

  transposeEvents(events){
    for(let event of events){
      this.transposeEvent(event);
    }
  }

  update(){

    // repopulate the events array if necessary
    if(this._numEventsChanged === true){

      // tell the track that the number of events has changed
      if(this.track){
        this._numberOfEventsChanged = true;
      }

      // filter out the events that have been removed
      let events = this._eventsMap.values();
      this.events = events.filter(function(event){
        return event.state !== 'removed';
      });

      this._numberOfEventsChanged = false;
    }

    // always sort the events
    this.events.sort((a, b) => (a.ticks <= b.ticks) ? 1 : -1);
    // start of part is the ticks value of its first note
    this.ticks = this.events[0].ticks;
    this.durationTicks = this.events[this.events.length - 1].ticks - this.ticks;

    let notes = {};
    for(let event of this.events){
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

    this.needsUpdate = false;
  }
}

export function createPart(config){
  return new Part(config);
}