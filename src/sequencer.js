'use strict';

require('babelify/polyfill');

import getConfig from './config.js';
import initAudio from './init_audio.js';
import initMidi from './init_midi.js';
import Song from './song.js';
import Track from './track.js';

let sequencer = {
  name: 'qambi',
  ui: {}, // ui functions
  util: {}, // util functions
  activeSongs: {}, // the songs that are currently loaded in memory
  midiInputs: [],
  midiOutputs: [],
  init: function(){
    return new Promise(executor);
  }
};


function executor(resolve, reject){
  let config = getConfig();

  if(config === false){
    reject(`The WebAudio API hasn\'t been implemented in ${config.browser}, please use any other browser`);
  }else{
    // add unlock method for ios devices
    // unlockWebAudio is called when the user called Song.play(), because we assume that the user presses a button to start the song.
    if(sequencer.os === 'ios'){
      sequencer.unlockWebAudio = function(){};
    }else{
      config.context = new window.AudioContext();
      sequencer.unlockWebAudio = function(){
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
        sequencer.unlockWebAudio = function(){};
      };
    }

    initAudio(config.context).then(
      function onFulfilled(data){

        config.lowtick = data.lowtick; // metronome sample
        config.hightick = data.hightick; //metronome sample
        config.masterGainNode = data.gainNode;
        config.masterCompressor = data.compressor;

        sequencer.getTime = data.getTime;
        sequencer.getAudioContext = data.getAudioContext;
        sequencer.setMasterVolume = data.setMasterVolume;
        sequencer.getMasterVolume = data.getMasterVolume;
        sequencer.enableMasterCompressor = data.enableMasterCompressor;
        sequencer.configureMasterCompressor = data.configureMasterCompressor;

        initMidi().then(
          function onFulfilled(midi){

            sequencer.midiInputs = midi.midiInputs;
            sequencer.midiOutputs = midi.midiOutputs;

            resolve();
          },
          function onRejected(){
            if(config.browser === 'chrome'){
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


sequencer.createSong = function(config){
  return new Song(config);
};

sequencer.createTrack = function(){
  var t = Object.create(Track);
  t.init();
  return t;
};

export default sequencer;
