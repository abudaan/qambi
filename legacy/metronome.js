
'use strict';

import sequencer from './sequencer';
import {createMIDINote} from './midi_note';
import {checkMIDINumber, warn} from './util';
import {getPosition} from './position';
import {parseEvents} from './parse_events';
import {createInstrument} from './instrument';
import getConfig from './config';


let
  config = getConfig(),

  methodMap = new Map([
    ['volume', 'setVolume'],
    ['instrument', 'setInstrument'],
    ['noteNumberAccentedTick', 'setNoteNumberAccentedTick'],
    ['noteNumberNonAccentedTick', 'setNoteNumberNonAccentedTick'],
    ['velocityAccentedTick', 'setVelocityAccentedTick'],
    ['velocityNonAccentedTick', 'setVelocityNonAccentedTick'],
    ['noteLengthAccentedTick', 'setNoteLengthAccentedTick'],
    ['noteLengthNonAccentedTick', 'setNoteLengthNonAccentedTick']
  ]);


export class Metronome{

  constructor(song){
    this._song = song;
    this._track = sequencer.createTrack(this.song.id + '_metronome', 'metronome');
    this._part = sequencer.createPart();
    this._track.addPart(this._part);
    this._track.connect(this._song._gainNode);
    this._events = [];
    this._precountEvents = [];
    this._noteNumberAccented = 61;
    this._noteNumberNonAccented = 60;
    this._volume = 1;
    this._velocityNonAccented = 100;
    this._velocityAccented = 100;
    this._noteLengthNonAccented = song.ppq/4; // sixteenth notes -> don't make this too short if your sample has a long attack!
    this._noteLengthAccented = song.ppq/4;
    this._track._instrument = createInstrument();
    this._precountDurationInMillis = 0;
    this._bars = 0;
    //this.reset();
  }


  createEvents(startBar, endBar, id = 'init'){
    let i, j,
      data,
      velocity,
      noteLength,
      noteNumber,
      beatsPerBar,
      ticksPerBeat,
      ticks = 0,
      noteOn, noteOff, note;

    //console.log(startBar, endBar);

    for(i = startBar; i <= endBar; i++){
      data = getPosition(this.song, ['barsbeats', i]);
      beatsPerBar = data.nominator;
      ticksPerBeat = data.ticksPerBeat;

      for(j = 0; j < beatsPerBar; j++){
        noteNumber = j === 0 ? this.noteNumberAccented : this.noteNumberNonAccented;
        noteLength = j === 0 ? this.noteLengthAccented : this.noteLengthNonAccented;
        velocity = j === 0 ? this.velocityAccented : this.velocityNonAccented;

        noteOn = sequencer.createMIDIEvent(ticks, 144, noteNumber, velocity);
        noteOff = sequencer.createMIDIEvent(ticks + noteLength, 128, noteNumber, 0);

        if(id === 'precount'){
          noteOn.part = {id: 'precount'};
          noteOn.track = this._track;
          noteOff.part = {id: 'precount'};
          noteOff.track = this._track;
        }

        this._part.addEvents(noteOn, noteOff);
        ticks += ticksPerBeat;
      }
    }
  }


  init(startBar, endBar){
    if(this._part.numEvents > 0){
      this._part.removeEvents(this._part.getEvents());
      this._track.update();
    }
    this.createEvents(startBar, endBar);
    this.bars = this.song.bars;
    parseEvents(this.song, this.events);
  }


  update(startBar, endBar){
    if(startBar === 0){
      startBar = 1;
    }
    //console.log('metronome', this.song.bars, startBar, endBar);
    // for now, just re-init the metronome
    if(startBar !== undefined && endBar !== undefined){
      this.init('update', startBar, endBar);
    }else{
      this.init('update', 1, this.song.bars);
    }

    //this.allNotesOff();
    //this.song.scheduler.updateSong();

    // let events = createEvents(this, startBar, endBar, 'update');
    // this.events = this.events.concat(events);
    // parseMetronomeEvents(this.song, this.events);
  }


  updateConfig(){
    this.init('configure', 1, this.bars);
    this.allNotesOff();
    this.song.scheduler.updateSong();
  }


  configure(config){

    Object.keys(config).forEach(function(key){
      this[methodMap.get(key)](config.key);
    }, this);

    // objectForEach(config, function(value, key){
    //   me[methodMap[key]](value);
    // });
    this.updateConfig();
  }


  setInstrument(instrument){
    if(instrument.className !== 'Instrument'){
      instrument = sequencer.createInstrument(instrument);
    }
    if(instrument !== false){
      this.track.setInstrument(instrument);
    }else{
      this.track.setInstrument('heartbeat/metronome');
    }
    this.updateConfig();
  }


  setNoteLengthAccentedTick(value){
    if(isNaN(value)){
      warn('please provide a number');
    }
    this.noteLengthAccented = value;
    this.updateConfig();
  }


  setNoteLengthNonAccentedTick(value){
    if(isNaN(value)){
      warn('please provide a number');
    }
    this.noteLengthNonAccented = value;
    this.updateConfig();
  }


  setVelocityAccentedTick(value){
    value = checkMIDINumber(value);
    if(value !== false){
      this.velocityAccented = value;
    }else{
      warn('please provide a number');
    }
    this.updateConfig();
  }


  setVelocityNonAccentedTick(value){
    value = checkMIDINumber(value);
    if(value !== false){
      this.velocityNonAccented = value;
    }else{
      warn('please provide a number');
    }
    this.updateConfig();
  }


  setNoteNumberAccentedTick(value){
    value = checkMIDINumber(value);
    if(value !== false){
      this.noteNumberAccented = value;
    }else{
      warn('please provide a number');
    }
    this.updateConfig();
  }


  setNoteNumberNonAccentedTick(value){
    value = checkMIDINumber(value);
    if(value !== false){
      this.noteNumberNonAccented = value;
    }else{
      warn('please provide a number');
    }
    this.updateConfig();
  }


  reset(){
    this.volume = 1;
    this.track.setInstrument('heartbeat/metronome');

    this.noteNumberAccented = 61;
    this.noteNumberNonAccented = 60;

    this.velocityAccented = 100;
    this.velocityNonAccented = 100;

    this.noteLengthAccented = this.song.ppq/4;
    this.noteLengthNonAccented = this.song.ppq/4;
  }


  allNotesOff(){
    if(this.track.instrument){
      this.track.instrument.allNotesOff();
    }
  }


  createPrecountEvents(precount){
    if(precount <= 0){
      return;
    }
    let endPos = getPosition(this.song, 'barsbeats', this.song.bar + precount);

    this.index = 0;
    this.millis = 0;
    this.startMillis = this.song.millis;
    this.precountDurationInMillis = endPos.millis - this.startMillis;
    this.precountEvents = this.createEvents(this, this.song.bar, endPos.bar - 1, 'precount');
    parseEvents(this.song, this.precountEvents);
    //console.log(this.song.bar, endPos.bar, precount, this.precountEvents.length);
    //console.log(this.precountEvents, this.precountDurationInMillis, startTicks, endTicks);
  }


  // called by scheduler.js
  getPrecountEvents(maxtime){
    let events = this.precountEvents,
      maxi = events.length, i, evt,
      result = [];

    //console.log(maxtime, maxi, this.index, this.millis);

    for(i = this.index; i < maxi; i++){
      evt = events[i];
      //console.log(event.millis, maxtime, this.millis);
      if(evt.millis < maxtime){
        evt.time = this.startTime + evt.millis;
        result.push(evt);
        this.index++;
      }else{
        break;
      }
    }
    return result;
  }

  setVolume(value){
    this.track.setVolume(value);
  }
}

export function createMetronome(song){
  return new Metronome(song);
}