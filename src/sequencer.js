'use strict';

import getSettings from './settings.js';
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
    // add more promises here: for init midi system, testing audio support, and parsing metronome samples
    // -> see init method in sequencer.js at line 90 of heartbeat!
    return new Promise(function executor(resolve, reject){
      let settings = getSettings();
      if(settings.audio_context === false){
        reject(`The WebAudio API hasn\'t been implemented in ${settings.browser}, please use any other browser`);
      }else{
        sequencer.os = settings.os;
        sequencer.browser = settings.browser;

        if(sequencer.os !== 'ios'){
          sequencer.unlockWebAudio = function(){};
        }else{
          sequencer.unlockWebAudio = function(){
            let src = settings.context.createOscillator(),
              gainNode = settings.context.createGainNode();
            gainNode.gain.value = 0;
            src.connect(gainNode);
            gainNode.connect(settings.context.destination);
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
        resolve();
      }
    });
  }
};

sequencer.createSong = function(config){
  return new Song(config);
};

sequencer.createTrack = function(){
  var t = Object.create(Track);
  t.init();
  return t;
};

export default sequencer;
