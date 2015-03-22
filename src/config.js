/*
  Creates the config object that is used for internally sharing settings, information and the state. Other modules may add keys to this object.
*/

'use strict';

let
  config,
  defaultSong,
  ua = 'NA',
  os = 'unknown',
  browser = 'NA';


function getConfig(){
  if(config !== undefined){
    return config;
  }

  config = new Map();
  config.set('legacy', false); // true if the browser uses an older version of the WebAudio API, source.noteOn() and source.noteOff instead of source.start() and source.stop()
  config.set('midi', false); // true if the browser has MIDI support either via WebMIDI or Jazz
  config.set('webmidi', false); // true if the browser has WebMIDI
  config.set('webaudio', true); // true if the browser has WebAudio
  config.set('jazz', false); // true if the browser has the Jazz plugin
  config.set('ogg', false); // true if WebAudio supports ogg
  config.set('mp3', false); // true if WebAudio supports mp3
  config.set('bitrate_mp3_encoding', 128); // default bitrate for audio recordings
  config.set('debugLevel', 4); // 0 = off, 1 = error, 2 = warn, 3 = info, 4 = log
  config.set('pitch', 440); // basic pitch that is used when generating samples
  config.set('bufferTime', 350/1000); // time in seconds that events are scheduled ahead
  config.set('autoAdjustBufferTime', false);
  config.set('noteNameMode', 'sharp');
  config.set('minimalSongLength', 60000); //millis
  config.set('pauseOnBlur', false); // pause the AudioContext when page or tab looses focus
  config.set('restartOnFocus', true); // if song was playing at the time the page or tab lost focus, it will start playing automatically as soon as the page/tab gets focus again
  config.set('defaultPPQ', 960);
  config.set('overrulePPQ', true);
  config.set('precision', 3); // means float with precision 3, e.g. 10.437
  config.set('activeSongs', {});// the songs currently loaded in memory


  defaultSong = new Map();
  defaultSong.set('bpm', 120);
  defaultSong.set('ppq', config.get('defaultPPQ'));
  defaultSong.set('bars', 30);
  defaultSong.set('lowestNote', 0);
  defaultSong.set('highestNote', 127);
  defaultSong.set('nominator', 4);
  defaultSong.set('denominator', 4);
  defaultSong.set('quantizeValue', 8);
  defaultSong.set('fixedLengthValue', false);
  defaultSong.set('positionType', 'all');
  defaultSong.set('useMetronome', false);
  defaultSong.set('autoSize', true);
  defaultSong.set('loop', false);
  defaultSong.set('playbackSpeed', 1);
  defaultSong.set('autoQuantize', false);
  config.set('defaultSong', defaultSong);


  // get browser and os
  if(navigator !== undefined){
    ua = navigator.userAgent;

    if(ua.match(/(iPad|iPhone|iPod)/g)){
      os = 'ios';
    }else if(ua.indexOf('Android') !== -1){
      os = 'android';
    }else if(ua.indexOf('Linux') !== -1){
       os = 'linux';
    }else if(ua.indexOf('Macintosh') !== -1){
       os = 'osx';
    }else if(ua.indexOf('Windows') !== -1){
       os = 'windows';
    }

    if(ua.indexOf('Chrome') !== -1){
      // chrome, chromium and canary
      browser = 'chrome';

      if(ua.indexOf('OPR') !== -1){
        browser = 'opera';
      }else if(ua.indexOf('Chromium') !== -1){
        browser = 'chromium';
      }
    }else if(ua.indexOf('Safari') !== -1){
      browser = 'safari';
    }else if(ua.indexOf('Firefox') !== -1){
      browser = 'firefox';
    }else if(ua.indexOf('Trident') !== -1){
      browser = 'Internet Explorer';
    }

    if(os === 'ios'){
      if(ua.indexOf('CriOS') !== -1){
        browser = 'chrome';
      }
    }
  }else{
    // TODO: check os here with Nodejs' require('os')
  }
  config.set('ua', ua);
  config.set('os', os);
  config.set('browser', browser);

  // check if we have an audio context
  window.AudioContext = (
    window.AudioContext ||
    window.webkitAudioContext ||
    window.oAudioContext ||
    window.msAudioContext
  );
  config.set('audio_context', navigator.getUserMedia !== undefined);
  config.set('record_audio', navigator.getUserMedia !== undefined);


  // check if audio can be recorded
  navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  );
  config.set('audio_context', window.AudioContext !== undefined);


  // no webaudio, return
  if(config.get('audio_context') === false){
    return false;
  }

  // check for other 'modern' API's
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  window.Blob = window.Blob || window.webkitBlob || window.mozBlob;
  //console.log('iOS', os, context, window.Blob, window.requestAnimationFrame);

  return config;
}


export default getConfig;