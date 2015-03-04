(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sequencer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var getSettings = _interopRequire(require("./settings.js"));

var Song = _interopRequire(require("./song.js"));

var Track = _interopRequire(require("./track.js"));

var sequencer = {
  name: "qambi",
  ui: {}, // ui functions
  util: {}, // util functions
  activeSongs: {}, // the songs that are currently loaded in memory
  midiInputs: [],
  midiOutputs: [],
  init: function init() {
    // add more promises here: for init midi system, testing audio support, and parsing metronome samples
    // -> see init method in sequencer.js at line 90 of heartbeat!
    return new Promise(function executor(resolve, reject) {
      var settings = getSettings();
      if (settings.error !== undefined) {
        //alert(settings.error);
        reject(settings.error);
      } else {
        sequencer.os = settings.os;
        sequencer.browser = settings.browser;

        if (sequencer.os !== "ios") {
          sequencer.unlockWebAudio = function () {};
        } else {
          sequencer.unlockWebAudio = function () {
            var src = settings.context.createOscillator(),
                gainNode = settings.context.createGainNode();
            gainNode.gain.value = 0;
            src.connect(gainNode);
            gainNode.connect(settings.context.destination);
            if (src.noteOn !== undefined) {
              src.start = src.noteOn;
              src.stop = src.noteOff;
            }
            src.start(0);
            src.stop(0.001);

            // remove function after first use
            sequencer.unlockWebAudio = function () {};
          };
        }
        resolve();
      }
    });
  }
};

sequencer.createSong = function (config) {
  return new Song(config);
};

sequencer.createTrack = function () {
  var t = Object.create(Track);
  t.init();
  return t;
};

module.exports = sequencer;

},{"./settings.js":2,"./song.js":3,"./track.js":5}],2:[function(require,module,exports){
"use strict";

var settings = undefined,
    context = undefined,
    ua = undefined,
    os = undefined,
    browser = undefined,
    gainNode = undefined,
    compressor = undefined,
    src = undefined;

function getSettings() {

  if (settings !== undefined) {
    return settings;
  }

  settings = {
    ua: "",
    os: "",
    browser: "",
    legacy: false, // true if the browser uses an older version of the WebAudio API, source.noteOn() and source.noteOff instead of source.start() and source.stop()
    record_audio: navigator.getUserMedia !== undefined,
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
    bufferTime: 350 / 1000, //seconds
    autoAdjustBufferTime: false,
    noteNameMode: "sharp",
    minimalSongLength: 60000, //millis
    pauseOnBlur: false,
    restartOnFocus: true,
    defaultPPQ: 960,
    overrulePPQ: true,
    precision: 3 };

  // get browser and os
  getEnvironment();

  // check for modern API's
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  window.Blob = window.Blob || window.webkitBlob || window.mozBlob;
  //console.log('iOS', os, context, window.Blob, window.requestAnimationFrame);

  // check if audio can be recorded
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  // audio context
  if (window.AudioContext) {
    context = new window.AudioContext();
    if (context.createGainNode === undefined) {
      context.createGainNode = context.createGain;
    }
  } else if (window.webkitAudioContext) {
    context = new window.webkitAudioContext();
  } else if (window.oAudioContext) {
    context = new window.oAudioContext();
  } else if (window.msAudioContext) {
    context = new window.msAudioContext();
  } else {
    var error = "The WebAudio API hasn't been implemented in " + browser + ", please use any other browser";
    return { error: error };
  }

  // check for older implementations of WebAudio
  src = context.createBufferSource();
  settings.legacy = false;
  if (src.start === undefined) {
    settings.legacy = true;
  }

  // set up the elementary audio nodes
  compressor = context.createDynamicsCompressor();
  compressor.connect(context.destination);
  gainNode = context.createGainNode();
  gainNode.connect(context.destination);
  gainNode.gain.value = 1;

  // add to settings object
  settings.context = context;
  settings.masterGainNode = gainNode;
  settings.masterCompressor = compressor;

  settings.ua = ua;
  settings.os = os;
  settings.browser = browser; // the name of thebrowser in lowercase, e.g. firefox, opera, safari, chromium, etc.
  settings.record_audio = navigator.getUserMedia !== undefined;

  return settings;
}

function getEnvironment() {
  if (navigator === undefined) {
    ua = "NA";
    browser = "NA";
    os = "unknown"; // TODO: check os here with Nodejs' require('os')
    return;
  }

  ua = navigator.userAgent;

  if (ua.match(/(iPad|iPhone|iPod)/g)) {
    os = "ios";
  } else if (ua.indexOf("Android") !== -1) {
    os = "android";
  } else if (ua.indexOf("Linux") !== -1) {
    os = "linux";
  } else if (ua.indexOf("Macintosh") !== -1) {
    os = "osx";
  } else if (ua.indexOf("Windows") !== -1) {
    os = "windows";
  }

  if (ua.indexOf("Chrome") !== -1) {
    // chrome, chromium and canary
    browser = "chrome";

    if (ua.indexOf("OPR") !== -1) {
      browser = "opera";
    } else if (ua.indexOf("Chromium") !== -1) {
      browser = "chromium";
    }
  } else if (ua.indexOf("Safari") !== -1) {
    browser = "safari";
  } else if (ua.indexOf("Firefox") !== -1) {
    browser = "firefox";
  } else if (ua.indexOf("Trident") !== -1) {
    browser = "Internet Explorer";
  }

  if (os === "ios") {
    if (ua.indexOf("CriOS") !== -1) {
      browser = "chrome";
    }
  }
  //console.log(os, browser, '---', ua);
}

module.exports = getSettings;
// means float with precision 3, e.g. 10.437

},{}],3:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _song_add_eventlistener = require("./song_add_eventlistener");

var addEventListener = _song_add_eventlistener.addEventListener;
var removeEventListener = _song_add_eventlistener.removeEventListener;
var dispatchEvent = _song_add_eventlistener.dispatchEvent;

var songId = 0;

var Song = (function () {
  function Song(config) {
    _classCallCheck(this, Song);

    this.id = "S" + songId++ + new Date().getTime();
    this.config = config;
  }

  _prototypeProperties(Song, null, {
    addSamples: {

      // add samples to the instrument after it has been created, this allows you to jit load the samples of an instrument

      value: function addSamples(samples) {
        console.log("added", samples);
      },
      writable: true,
      configurable: true
    },
    stop: {
      value: function stop() {
        dispatchEvent("stop");
      },
      writable: true,
      configurable: true
    },
    play: {
      value: function play() {
        dispatchEvent("play");
      },
      writable: true,
      configurable: true
    }
  });

  return Song;
})();

Song.prototype.addEventListener = addEventListener;
Song.prototype.removeEventListener = removeEventListener;
Song.prototype.dispatchEvent = dispatchEvent;

module.exports = Song;

},{"./song_add_eventlistener":4}],4:[function(require,module,exports){
"use strict";

var listeners = {};

function addEventListener(id, callback) {
  listeners[id] = callback;
}

function removeEventListener(id, callback) {
  delete listeners[id];
}

function dispatchEvent(id) {
  for (var key in listeners) {
    if (key === id && listeners.hasOwnProperty(key)) {
      listeners[key](id);
    }
  }
}

exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
exports.dispatchEvent = dispatchEvent;
Object.defineProperty(exports, "__esModule", {
  value: true
});

},{}],5:[function(require,module,exports){
"use strict";

var trackId = 0;

var Track = {
    init: function init() {
        var id = "T" + trackId++ + new Date().getTime();
        Object.defineProperty(this, "id", {
            value: id
        });
    }
};

module.exports = Track;

},{}]},{},[1])(1)
});


//# sourceMappingURL=qambi.js.map