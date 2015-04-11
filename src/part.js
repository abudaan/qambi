'use strict';

import {info} from './util.js';
import {MIDIEvent} from './midi_event.js';
import {AudioEvent} from './audio_event.js';

let partId = 0;


export class Part{

  constructor(config = {}){
    this.id = 'P' + partId++ + Date.now();
    this.events = [];
    this.needsUpdate = false;
    this.ticks = 0;

    this._eventsMap = new Map();
    this._changedEvents = new Map();
    this._removedEvents = new Map();
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
      this._changedEvents.set(event.id, event);
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
      this._eventsMap.delete(event.id);
      this._changedEvents.set(event.id, event);
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
      this._changedEvents.set(event.id, event);
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
      this._changedEvents.set(event.id, event);
      // no need to set needsUpdate to true!
      return this; // make it chainable
    }
  }

  transposeEvents(events){
    for(let event of events){
      this.transposeEvent(event);
    }
  }

  update(){

    // notify the track that there have been changes: this is only necessary if part.update is called before track.update or song.update
    if(this.track !== undefined){
      // tell the track that the part has changed
      if(this._changedEvents.size !== 0){
        this.track._changedParts.set(this.id, this);
      }
      // tell the track that the number of events has changed
      if(this._numberOfEventsChanged === true){
        this.track._numberOfEventsChanged = true;
      }
    }

    if(this.needsUpdate === false){
      return;
    }

    // repopulate the events array if necessary
    if(this._numberOfEventsChanged === true){
      this.events = Array.from(this._eventsMap.values());
    }

    // always sort the events
    this.events.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);

    // set the duration of the part based on its first and last event
    this.ticks = this.events[0].ticks;
    let lastEvent = this.events[this.events.length - 1];
    this.durationTicks = lastEvent.ticks - this.ticks;

    // create notes
    let notes = {};
    let n = 0;
    for(let event of this.events){
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

    this._numberOfEventsChanged = false;
    this.needsUpdate = false;
  }
}

export function createPart(config){
  return new Part(config);
}