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
    midi: false,
    webmidi: false,
    webaudio: true,
    jazz: false,
    ogg: false,
    mp3: false,
    bitrate_mp3_encoding: 128,
    debug: 4, // 0 = off, 1 = error, 2 = warn, 3 = info, 4 = log
    debugLevel: 4, // 0 = off, 1 = error, 2 = warn, 3 = info, 4 = log
    pitch: 440,
    bufferTime: 350/1000, //seconds
    autoAdjustBufferTime: false,
    noteNameMode: 'sharp',
    minimalSongLength: 60000, //millis
    pauseOnBlur: false,
    restartOnFocus: true,
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