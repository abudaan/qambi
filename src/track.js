'use strict';

import sequencer from './sequencer';
import getConfig from './config';
import {createState, warn} from './util';
import {createInstrument, Instrument} from './instrument';
import {Part} from './part';

let trackId = 0,
  config = getConfig();


export class Track{

  constructor(config = {}){
    this.id = 'T' + trackId++ + Date.now();
    this._parts = [];
    this._events = [];

    this._partsMap = new Map();
    this._eventsMap = new Map();
    this._newParts = new Map();
    this._newEvents = new Map();

    this._needsUpdate = false;
    this._state = createState();

    //@TODO: do something useful here
    this._midiInputs = {};
    this._midiOutputs = {};
    this.routeToMidiOut = false;

    this._volume = 0.5;

    // instrument -> sample -> track._input
    this._input = sequencer.audioContext.createGainNode();
    this._input.gain.value = this._volume; // this._volume is controlled by track.setVolume();

    this._output = sequencer.audioContext.createGainNode();
    this._output.gain.value = 0; // volume of output is controlled by velocity of note

    // track._input -> fx1 -> fx2 -> fxn -> panner -> track._output
    this._input.connect(this._output);

    this._instrument = createInstrument();
    this.setInstrument(this._instrument);


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
      part._state.track = 'new';
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
      part._state.track = 'removed';
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
      if(part._state.track !== 'new'){
        part._state.track = 'moved';
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
      if(part._state.track !== 'new'){
        part._state.track = 'transposed';
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

    let numberOfEventsHasChanged = false;
    let numberOfPartsHasChanged = false;
    let sortEvents = false;
    let sortParts = false;

    let parts = this._partsMap.values();
    for(let part of parts){

      if(part._state.track === 'removed'){
        this._partsMap.delete(part.id);
        // in case a new or changed part gets deleted before track.update() is called
        this._newParts.delete(part.id);
        numberOfPartsHasChanged = true;
        continue;
      }else if(part._state.track === 'new'){
        this._newParts.set(part.id, part);
        numberOfPartsHasChanged = true;
      }else if(part._state.track !== 'clean'){
        sortParts = true;
      }

      part.update();
      if(part._newEvents.size > 0){
        let newEvents = part._newEvents.values();
        for(let newEvent of newEvents){
          newEvent.track = this;
          this._newEvents.set(newEvent.id, newEvent);
          this._eventsMap.set(newEvent.id, newEvent);
        }
        numberOfEventsHasChanged = true;
        part._newEvents.clear();
      }

      part._state.track = 'clean';
    }

    if(numberOfPartsHasChanged === true){
      this._parts = [];
      let parts = this._partsMap.values();
      for(let part of parts){
        this._parts.push(part);
      }
      this._parts.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);
    }


    let events = this._eventsMap.values();
    for(let evt of events){
      if(evt._state.track === 'removed'){
        this._eventsMap.delete(evt.id);
        numberOfEventsHasChanged = true;
      }else{
        this._events.push(evt);
      }
      evt._state.track = 'clean';
    }


    if(numberOfEventsHasChanged === true){
      this._events = [];
      let events = this._eventsMap.values();
      for(let evt of events){
        this._events.push(evt);
      }
      this._events.sort((a, b) => (a._sortIndex <= b._sortIndex) ? -1 : 1);
    }

    this._needsUpdate = false;
  }

  setInstrument(instrument){
    if(instrument instanceof Instrument === false){
      warn(instrument, 'is not an instrument');
    }
    // disconnect
    this._instrument._track = null;
    this._instrument._output = config.masterGainNode;

    // connect
    this._instrument = instrument;
    this._instrument._track = this;
    this._instrument._output = this._output;

    return this;
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