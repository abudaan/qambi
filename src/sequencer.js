/*
  This is the main module of the library: it creates the sequencer object and functionality from other modules gets mixed in
*/

'use strict';

// required by babelify for transpiling es6
require('babelify/polyfill');

import getConfig from './config.js';
//import polyFill from './polyfill.js';
import initAudio from './init_audio.js';
import initMidi from './init_midi.js';
import createSong from './song.js';
import createTrack from './track.js';
import createMIDIEvent from './midi_event.js';
import createInstrument from './instrument.js';
import {start} from './heartbeat.js';
import {createNote, getNoteNumber, getNoteName, getNoteOctave, getFullNoteName, getFrequency, isBlackKey} from './note.js';

let sequencer = {};
let config;
let debugLevel;


function init(){
  return new Promise(executor);
}

function executor(resolve, reject){
  //polyfill();
  config = getConfig();
  // the debug level has been set before sequencer.init() so add it to the config object
  if(debugLevel !== undefined){
    config.debugLevel = debugLevel;
  }

  if(config === false){
    reject(`The WebAudio API hasn\'t been implemented in ${config.browser}, please use any other browser`);
  }else{
    // create the context and share it internally via the config object
    config.context = new window.AudioContext();
    config.destination = config.context.destination;
    // add unlock method for ios devices
    // unlockWebAudio is called when the user called Song.play(), because we assume that the user presses a button to start the song.
    if(config.os !== 'ios'){
      Object.defineProperty(sequencer, 'unlockWebAudio', {value: function(){}});
    }else{
      Object.defineProperty(sequencer, 'unlockWebAudio', {
        value: function(){
          let src = config.context.createOscillator(),
            gainNode = config.context.createGain();
          gainNode.gain.value = 0;
          src.connect(gainNode);
          gainNode.connect(config.context.destination);
          if(src.noteOn !== undefined){
            src.start = src.noteOn;
            src.stop = src.noteOff;
          }
          src.start(0);
          src.stop(0.001);
          // remove function after first use
          Object.defineProperty(sequencer, 'unlockWebAudio', {value: function(){}});
        },
        configurable: true
      });
    }

    initAudio(config.context).then(
      function onFulfilled(data){

        config.legacy = data.legacy; // true if the browser uses an older version of the WebAudio API, source.noteOn() and source.noteOff instead of source.start() and source.stop()
        config.lowtick = data.lowtick; // metronome sample
        config.hightick = data.hightick; //metronome sample
        config.masterGainNode = data.gainNode;
        config.masterCompressor = data.compressor;
        config.getTime = data.getTime;

        Object.defineProperty(sequencer, 'time', {get: data.getTime});
        Object.defineProperty(sequencer, 'audioContext', {get: data.getAudioContext});
        Object.defineProperty(sequencer, 'masterVolume', {get: data.getMasterVolume, set: data.setMasterVolume});
        Object.defineProperty(sequencer, 'enableMasterCompressor', {value: data.enableMasterCompressor});
        Object.defineProperty(sequencer, 'configureMasterCompressor', {value: data.configureMasterCompressor});

        initMidi().then(
          function onFulfilled(midi){

            Object.defineProperty(sequencer, 'midiInputs', {value: midi.inputs});
            Object.defineProperty(sequencer, 'midiOutputs', {value: midi.outputs});

            //Object.seal(sequencer);
            start(); // start heartbeat
            resolve();
          },
          function onRejected(e){
            if(e !== undefined && typeof e === 'string'){
              reject(e);
            }else if(config.browser === 'chrome' || config.browser === 'chromium'){
              reject('Web MIDI API not enabled');
            }else{
              reject('Web MIDI API not supported');
            }
          }
        );
      },
      function onRejected(e){
        reject(e);
      }
    );
  }
}

Object.defineProperty(sequencer, 'name', {value: 'qambi'});
Object.defineProperty(sequencer, 'init', {value: init});
Object.defineProperty(sequencer, 'ui', {value: {}, writable: true}); // ui functions
Object.defineProperty(sequencer, 'util', {value: {}, writable: true}); // util functions

//TODO: create methods getSongs, removeSong and so on
//Object.defineProperty(sequencer, 'activeSongs', {activeSongs: {}, writable: true}); // the songs that are currently loaded in memory

Object.defineProperty(sequencer, 'debugLevel', {
  get: function(){
    return config.debugLevel;
  },
  set: function(value){
    if(config !== undefined){
      config.debugLevel = value;
    }else{
      // allow the debugLevel to be set before sequencer.init();
      debugLevel = value;
    }
  }
});



Object.defineProperty(sequencer, 'createMIDIEvent', {value: createMIDIEvent});
Object.defineProperty(sequencer, 'createTrack', {value: createTrack});
Object.defineProperty(sequencer, 'createSong', {value: createSong});
Object.defineProperty(sequencer, 'createInstrument', {value: createInstrument});


Object.defineProperty(sequencer, 'createNote', {value: createNote});
Object.defineProperty(sequencer, 'getNoteNumber', {value: getNoteNumber});
Object.defineProperty(sequencer, 'getNoteName', {value: getNoteName});
Object.defineProperty(sequencer, 'getNoteOctave', {value: getNoteOctave});
Object.defineProperty(sequencer, 'getFullNoteName', {value: getFullNoteName});
Object.defineProperty(sequencer, 'getFrequency', {value: getFrequency});
Object.defineProperty(sequencer, 'isBlackKey', {value: isBlackKey});



// note name modi
Object.defineProperty(sequencer, 'SHARP', {value: 'sharp'});
Object.defineProperty(sequencer, 'FLAT', {value: 'flat'});
Object.defineProperty(sequencer, 'ENHARMONIC_SHARP', {value: 'enharmonic-sharp'});
Object.defineProperty(sequencer, 'ENHARMONIC_FLAT', {value: 'enharmonic-flat'});


// standard MIDI events
Object.defineProperty(sequencer, 'NOTE_OFF', {value: 0x80}); //128
Object.defineProperty(sequencer, 'NOTE_ON', {value: 0x90}); //144
Object.defineProperty(sequencer, 'POLY_PRESSURE', {value: 0xA0}); //160
Object.defineProperty(sequencer, 'CONTROL_CHANGE', {value: 0xB0}); //176
Object.defineProperty(sequencer, 'PROGRAM_CHANGE', {value: 0xC0}); //192
Object.defineProperty(sequencer, 'CHANNEL_PRESSURE', {value: 0xD0}); //208
Object.defineProperty(sequencer, 'PITCH_BEND', {value: 0xE0}); //224
Object.defineProperty(sequencer, 'SYSTEM_EXCLUSIVE', {value: 0xF0}); //240
Object.defineProperty(sequencer, 'MIDI_TIMECODE', {value: 241});
Object.defineProperty(sequencer, 'SONG_POSITION', {value: 242});
Object.defineProperty(sequencer, 'SONG_SELECT', {value: 243});
Object.defineProperty(sequencer, 'TUNE_REQUEST', {value: 246});
Object.defineProperty(sequencer, 'EOX', {value: 247});
Object.defineProperty(sequencer, 'TIMING_CLOCK', {value: 248});
Object.defineProperty(sequencer, 'START', {value: 250});
Object.defineProperty(sequencer, 'CONTINUE', {value: 251});
Object.defineProperty(sequencer, 'STOP', {value: 252});
Object.defineProperty(sequencer, 'ACTIVE_SENSING', {value: 254});
Object.defineProperty(sequencer, 'SYSTEM_RESET', {value: 255});


Object.defineProperty(sequencer, 'TEMPO', {value: 0x51});
Object.defineProperty(sequencer, 'TIME_SIGNATURE', {value: 0x58});
Object.defineProperty(sequencer, 'END_OF_TRACK', {value: 0x2F});


export default sequencer;
