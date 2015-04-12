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

    this._timeEvents = []; // all tempo and time signature events
    this._allEvents = []; // all tempo and time signature events, plus all MIDI and audio events

    this.needsUpdate = false;
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

    this.scheduler = new Scheduler(this);
  }


  stop(){
    removeTask('repetitive', this.id);
    this.millis = 0;
    dispatchEvent('stop');
  }

  play(){
    sequencer.unlockWebAudio();
    this.scheduler.firstRun = true;
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
      track.state = 'new';
      this.needsUpdate = true;
      this._tracksMap.set(track.id, track);
      this._numberOfTracksChanged = true;
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
      track.state = 'removed';
      this.needsUpdate = true;
      this._numberOfTracksChanged = true;
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
    if(this.needsUpdate){
      this.update();
    }
    return this._tracks;
  }

  getTrack(idOrName){

  }

  getParts(){
    if(this.needsUpdate){
      this.update();
    }
    return this._parts;
  }

  getEvents(){
    if(this.needsUpdate){
      this.update();
    }
    return this._events;
  }

  getAudioEvents(){
    if(this.needsUpdate){
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
    debugger
    return this;
  }

  update(){

    // update _tracks array and _tracksMap map
    if(this._numberOfTracksChanged === true){
      this._tracks = [];
      Array.from(this._tracksMap.values()).forEach((track) => {
        if(track.state === 'removed'){
          this._tracksMap.delete(track.id);
        }else{
          track.state = 'clean';
          this._tracks.push(track);
        }
      });
      this._numberOfTracksChanged = false;
    }



    // add all new events and parts to the array and the map in question
    for(let track of this._tracks){
      if(track.needsUpdate === true){
        track.update();
      }
      for(let event of track._newEvents.values()){
        this._events.push(event);
        this._eventsMap.set(event.id, event);
      }
      // we can clear the _newEvents map now; it will be populated again as soon as new events are added
      track._newEvents.clear();

      for(let part of track._newParts.values()){
        this._parts.push(part);
        this._partsMap.set(part.id, part);
      }
      // we can clear the _newParts map now; it will be populated again as soon as new parts are added
      track._newParts.clear();
    }



    // update _parts array and _partsMap map
    if(this._numberOfPartsChanged === true){
      this._parts = [];
      Array.from(this._partsMap.values()).forEach((part) => {
        // the state of a part gets set to 'removed' when track.removePart() is called
        if(part.state === 'removed'){
          this._partsMap.delete(part.id);
        }else{
          part.state = 'clean';
          this._parts.push(part);
        }
      });
      this._numberOfPartsChanged = false;
    }



    // update _events array and _eventsMap map
    if(this._numberOfEventsChanged === true){
      this._events = [];
      Array.from(this._eventsMap.values()).forEach((event) => {
        if(event.state === 'removed'){
        // the state of a event gets set to 'removed' when part.removeEvent() or track.removeEvent() is called
          this._eventsMap.delete(event.id);
        }else{
          event.state = 'clean';
          this._events.push(event);
        }
      });
      this._numberOfEventsChanged = false;
    }
    this._parts.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);
    this._events.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);

    this._audioEvents = this._events.filter(function(event){
      return event instanceof AudioEvent;
    });

    this.needsUpdate = false;
    this.scheduler.updateSong();
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