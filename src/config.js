/*
  Creates the config object that is used for internally sharing settings, information and the state. Other modules may add keys to this object.
*/

'use strict';

let
  config,
  ua = 'NA',
  os = 'unknown',
  browser = 'NA';


function getConfig(){
  if(config !== undefined){
    return config;
  }

  config = {
    legacy: false, // true if the browser uses an older version of the WebAudio API, source.noteOn() and source.noteOff instead of source.start() and source.stop()
    midi: false, // true if the browser has MIDI support either via WebMIDI or Jazz
    webmidi: false, // true if the browser has WebMIDI
    webaudio: true, // true if the browser has WebAudio
    jazz: false, // true if the browser has the Jazz plugin
    ogg: false, // true if WebAudio supports ogg
    mp3: false, // true if WebAudio supports mp3
    bitrate_mp3_encoding: 128, // default bitrate for audio recordings
    debugLevel: 4, // 0 = off, 1 = error, 2 = warn, 3 = info, 4 = log
    pitch: 440, // basic pitch that is used when generating samples
    bufferTime: 350/1000, // time in seconds that events are scheduled ahead
    autoAdjustBufferTime: false,
    noteNameMode: 'sharp',
    minimalSongLength: 60000, //millis
    pauseOnBlur: false, // pause the AudioContext when page or tab looses focus
    restartOnFocus: true, // if song was playing at the time the page or tab lost focus, it will start playing automatically as soon as the page/tab gets focus again
    defaultPPQ: 960,
    overrulePPQ: true,
    precision: 3, // means float with precision 3, e.g. 10.437
  };


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
  config.ua = ua;
  config.os = os;
  config.browser = browser;

  // check if we have an audio context
  window.AudioContext = (
    window.AudioContext ||
    window.webkitAudioContext ||
    window.oAudioContext ||
    window.msAudioContext
  );
  config.record_audio = navigator.getUserMedia !== undefined;


  // no webaudio, return
  if(config.audio_context === false){
    return false;
  }


  // check if audio can be recorded
  navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  );
  config.audio_context = window.AudioContext !== undefined;


  // check for other 'modern' API's
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  window.Blob = window.Blob || window.webkitBlob || window.mozBlob;
  //console.log('iOS', os, context, window.Blob, window.requestAnimationFrame);

  return config;
}


export default getConfig;