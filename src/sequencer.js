'use strict';

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
      sequencer.unlockWebAudio = function(){
        let src = config.context.createOscillator(),
          gainNode = config.context.createGainNode();
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

    initAudio(config).then(
      function onFulfilled(){
        console.log(config);
        resolve();
      },
      function onRejected(e){
        reject(e);
      }
    );
/*
    initAudio().then(
      function onFulfilled(audio){
        settings.context = audio.context;
        initMidi().then(
          function onFulfilled(midi){
            sequencer.midiInputs = midi.inputs;
            sequencer.midiOutputs = midi.outputs;
          },
          function onRejected(e){
            //'Something went wrong while initializing MIDI'
            reject(e);
          }
        );
      },
      function onRejected(e){
        reject(e);
      }
    );
*/
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
