(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sequencer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Song = _interopRequire(require("./song.js"));

var Track = _interopRequire(require("./track.js"));

var sequencer = {
    name: "qambi",
    ui: {},
    util: {},
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
    precision: 3, // means float with precision 3, e.g. 10.437

    activeSongs: {}, // the songs that are currently loaded in memory
    midiInputs: [],
    midiOutputs: []
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

},{"./song.js":2,"./track.js":4}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _song_addeventlistener = require("./song_addeventlistener");

var addEventListener = _song_addeventlistener.addEventListener;
var removeEventListener = _song_addeventlistener.removeEventListener;
var dispatchEvent = _song_addeventlistener.dispatchEvent;


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

},{"./song_addeventlistener":3}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";

var trackId = 0;


var Track = {
    init: function () {
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