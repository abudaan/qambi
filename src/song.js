  'use strict';

import sequencer from './sequencer';
import {addEventListener, removeEventListener, dispatchEvent} from './song_add_eventlistener';
import {log, info, warn, error, typeString} from './util';
import getConfig from './config';
import {Track} from './track';
import {Part} from './part';
import {MIDIEvent} from './midi_event';
import {AudioEvent} from './audio_event';
import Scheduler from './scheduler';
import {initMidiSong, setMidiInputSong, setMidiOutputSong} from './init_midi';
import {addTask, removeTask} from './heartbeat';
import {parseTimeEvents, parseEvents} from './parse_events';


let songId = 0,
  config = getConfig(),
  defaultSong = config.get('defaultSong');


export class Song{

  /*
    @param settings is a Map or an Object
  */
  constructor(settings){

    this.id = 'S' + songId++ + Date.now();
    this.name = this.id;
    this._events = []; // all MIDI and audio events
    this._audioEvents = []; // only audio events
    this._parts = [];
    this._tracks = [];
    this._eventsMap = new Map();
    this._partsMap = new Map();
    this._tracksMap = new Map();

    this._newTracks = [];
    this._removedTracks = [];
    //this._changedTracks = [];

    this._newParts = [];
    this._removedParts = [];
    this._changedParts = [];

    this._newEvents = [];
    this._removedEvents = [];
    this._changedEvents = [];


    this._timeEvents = []; // all tempo and time signature events
    this._allEvents = []; // all tempo and time signature events, plus all MIDI and audio events

    this._needsUpdate = false;
    this.millis = 0;

    // first add all settings from the default song
    defaultSong.forEach(function(value, key){
      this[key] = value;
    }, this);
/*
    // or:
    for(let[value, key] of defaultSong.entries()){
      ((key, value) => {
        this[key] = value;
      })(key, value);
    }
*/

    if(settings.timeEvents){
      this.addTimeEvents(settings.timeEvents);
      delete settings.timeEvents;
    }

    if(settings.tracks){
      this.addTracks(settings.tracks);
      delete settings.tracks;
    }


    // then override settings by provided settings
    if(typeString(settings) === 'object'){
      Object.keys(settings).forEach(function(key){
        this[key] = settings[key];
      }, this);
    }else if(settings !== undefined){
      settings.forEach(function(value, key){
        this[key] = value;
      }, this);
    }

    // initialize midi for this song: add Maps for midi in- and outputs, and add eventlisteners to the midi inputs
    this.midiInputs = new Map();
    this.midiOutputs = new Map();
    initMidiSong(this); // @see: init_midi.js

    this.lastBar = this.bars;
    this.pitchRange = this.highestNote - this.lowestNote + 1;
    this.factor = 4/this.denominator;
    this.ticksPerBeat = this.ppq * this.factor;
    this.ticksPerBar = this.ticksPerBeat * this.nominator;
    this.millisPerTick = (60000/this.bpm/this.ppq);
    this.recordId = -1;
    this.doLoop = false;
    this.illegalLoop = true;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.loopDuration = 0;
    this.audioRecordingLatency = 0;
    this.grid = undefined;

    config.get('activeSongs')[this.id] = this;

    this._scheduler = new Scheduler(this);
  }


  stop(){
    removeTask('repetitive', this.id);
    this.millis = 0;
    dispatchEvent('stop');
  }

  play(){
    sequencer.unlockWebAudio();
    this._scheduler.firstRun = true;
    this.timeStamp = sequencer.time * 1000;
    //this.startMillis = this.millis; // this.millis is set by playhead, use 0 for now
    this.startMillis = 0;
    addTask('repetitive', this.id, () => {pulse(this);});
    dispatchEvent('play');
  }

  setMidiInput(id, flag = true){
    setMidiInputSong(this, id, flag);
  }

  setMidiOutput(id, flag = true){
    setMidiOutputSong(this, id, flag);
  }

  addMidiEventListener(...args){
    addMidiEventListener(this, ...args);
  }


  addTrack(track){
    if(track instanceof Track){
      track.song = this;
      track._state.song = 'new';
      this._tracksMap.set(track.id, track);
    }
    return this; // make it chainable
  }

  addTracks(tracks){
    for(let track of tracks){
      this.addTrack(track);
    }
    return this; // make it chainable
  }

  removeTrack(track){
    if(this._tracksMap.has(track.id)){
      track._state.song = 'removed';
      track.reset();
    }
    return this; // make it chainable
  }

  removeTracks(tracks){
    for(let track of tracks){
      this.removeTrack(track);
    }
    return this; // make it chainable
  }

  getTracks(){
    if(this._needsUpdate){
      this.update();
    }
    return this._tracks;
  }

  getTrack(idOrName){

  }

  getParts(){
    if(this._needsUpdate){
      this.update();
    }
    return this._parts;
  }

  getEvents(){
    if(this._needsUpdate){
      this.update();
    }
    return this._events;
  }

  getAudioEvents(){
    if(this._needsUpdate){
      this.update();
    }
    return this._audioEvents;
  }

  getTimeEvents(){
    return this._timeEvents;
  }

  addTimeEvent(event, parse = true){
    // 1) check if event is time event
    // 2) set time signature event on the first count
    // 3) parse time events
    this._timeEvents.push(event);
    if(parse === true){
      parseTimeEvents(this);
    }
  }

  addTimeEvents(events){
    for(let event of events){
      this.addTimeEvent(event, false);
    }
    parseTimeEvents(this);
    return this;
  }

  update(){

    this._newTracks = [];
    //this._changedTracks = [];
    this._removedTracks = [];

    this._newParts = [];
    this._changedParts = [];
    this._removedParts = [];

    this._newEvents = [];
    this._changedEvents = [];
    this._removedEvents = [];

    let sortEvents = false;
    let sortParts = false;
    let numberOfPartsHasChanged = false;
    let numberOfEventsHasChanged = false;
    let eventsToBeParsed = [].concat(this._timeEvents);
    let partsToBeParsed = [];

    let tracks = this._tracksMap.values();
    for(let track of tracks){
      if(track._state.song === 'removed'){
        this._removedTracks.push(track.id);
        this._tracksMap.delete(track.id);
        continue;
      }else if(track._state.song === 'new'){
        this._newTracks.push(track);
      }

      track.update();

      // get all the new parts
      if(track._newParts.size > 0){
        let newParts = track._newParts.values();
        for(let newPart of newParts){
          this._partsMap.set(newPart.id, newPart);
          this._newParts.push(newPart);
          partsToBeParsed.push(newPart);
        }
        track._newParts.clear();
        numberOfPartsHasChanged = true;
      }

      // get all the new events
      if(track._newEvents.size > 0){
        let newEvents = track._newEvents.values();
        for(let newEvent of newEvents){
          this._eventsMap.set(newEvent.id, newEvent);
          this._newEvents.push(newEvent);
          eventsToBeParsed.push(newEvent);
        }
        track._newEvents.clear();
        numberOfEventsHasChanged = true;
      }

      track._state.song = 'clean';
    }

    for(let part of this._partsMap.values()){
      if(part._state.song === 'removed'){
        this._removedParts.push(part);
        this._partsMap.delete(part.id);
        numberOfPartsHasChanged = true;
      }else if(part_state.song !== 'new'){
        this._changedParts.push(part);
      }
      part._state.song = 'clean';
    }


    if(numberOfPartsHasChanged === true){
      this._parts = [];

      let parts = this._partsMap.values();
      for(let part of parts){
        this._parts.push(part);
      }
    }

    if(numberOfPartsHasChanged === true || sortParts === true){
      this._parts.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);
    }


    for(let event of this._eventsMap.values()){
      if(event._state.song === 'removed'){
        this._removedEvents.push(event);
        this._eventsMap.delete(event.id);
        numberOfEventsHasChanged = true;
      }else if(event_state.song !== 'new'){
        this._changedEvents.push(events);
      }
      event._state.song = 'clean';
    }

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

    this._audioEvents = this._events.filter(function(event){
      return event instanceof AudioEvent;
    });

    parseEvents(this, eventsToBeParsed);
    this._scheduler.updateSong();
    this._needsUpdate = false;
  }
}

Song.prototype.addEventListener = addEventListener;
Song.prototype.removeEventListener = removeEventListener;
Song.prototype.dispatchEvent = dispatchEvent;


export function createSong(settings){
  return new Song(settings);
}


function pulse(song){
  let
    now = sequencer.time * 1000,
    diff = now - song.timeStamp;

  song.millis += diff;
  song.timeStamp = now;
  song.scheduler.update();
}