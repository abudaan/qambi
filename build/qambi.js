(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sequencer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/abudaan/workspace/qambi/src/module.js":[function(require,module,exports){
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

},{"./song.js":"/home/abudaan/workspace/qambi/src/song.js","./track.js":"/home/abudaan/workspace/qambi/src/track.js"}],"/home/abudaan/workspace/qambi/src/song.js":[function(require,module,exports){
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

},{"./song_addeventlistener":"/home/abudaan/workspace/qambi/src/song_addeventlistener.js"}],"/home/abudaan/workspace/qambi/src/song_addeventlistener.js":[function(require,module,exports){
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

},{}],"/home/abudaan/workspace/qambi/src/track.js":[function(require,module,exports){
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

},{}]},{},["/home/abudaan/workspace/qambi/src/module.js"])("/home/abudaan/workspace/qambi/src/module.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvbW9kdWxlLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3NvbmcuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvc29uZ19hZGRldmVudGxpc3RlbmVyLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3RyYWNrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsWUFBWSxDQUFDOzs7O0lBRU4sSUFBSSwyQkFBTSxXQUFXOztJQUNyQixLQUFLLDJCQUFNLFlBQVk7O0FBRTlCLElBQUksU0FBUyxHQUFHO0FBQ1osUUFBSSxFQUFFLE9BQU87QUFDYixNQUFFLEVBQUUsRUFBRTtBQUNOLFFBQUksRUFBRSxFQUFFO0FBQ1IsTUFBRSxFQUFFLEVBQUU7QUFDTixNQUFFLEVBQUUsRUFBRTtBQUNOLFdBQU8sRUFBRSxFQUFFO0FBQ1gsVUFBTSxFQUFFLEtBQUs7QUFDYixnQkFBWSxFQUFFLFNBQVMsQ0FBQyxZQUFZLEtBQUssU0FBUztBQUNsRCxRQUFJLEVBQUUsS0FBSztBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLElBQUk7QUFDZCxRQUFJLEVBQUUsS0FBSztBQUNYLE9BQUcsRUFBRSxLQUFLO0FBQ1YsT0FBRyxFQUFFLEtBQUs7QUFDVix3QkFBb0IsRUFBRSxHQUFHO0FBQ3pCLFNBQUssRUFBRSxDQUFDO0FBQ1IsY0FBVSxFQUFFLENBQUM7QUFDYixTQUFLLEVBQUUsR0FBRztBQUNWLGNBQVUsRUFBRSxHQUFHLEdBQUMsSUFBSTtBQUNwQix3QkFBb0IsRUFBRSxLQUFLO0FBQzNCLGdCQUFZLEVBQUUsT0FBTztBQUNyQixxQkFBaUIsRUFBRSxLQUFLO0FBQ3hCLGVBQVcsRUFBRSxLQUFL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Q0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUM5QixpQkFBSyxFQUFFLEVBQUU7U0FDWixDQUFDLENBQUM7S0FDTjtDQUNKLENBQUE7O2lCQUVjLEtBQUsiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgU29uZyBmcm9tICcuL3NvbmcuanMnO1xuaW1wb3J0IFRyYWNrIGZyb20gJy4vdHJhY2suanMnO1xuXG5sZXQgc2VxdWVuY2VyID0ge1xuICAgIG5hbWU6ICdxYW1iaScsXG4gICAgdWk6IHt9LFxuICAgIHV0aWw6IHt9LFxuICAgIHVhOiAnJyxcbiAgICBvczogJycsXG4gICAgYnJvd3NlcjogJycsXG4gICAgbGVnYWN5OiBmYWxzZSwgLy8gdHJ1ZSBpZiB0aGUgYnJvd3NlciB1c2VzIGFuIG9sZGVyIHZlcnNpb24gb2YgdGhlIFdlYkF1ZGlvIEFQSSwgc291cmNlLm5vdGVPbigpIGFuZCBzb3VyY2Uubm90ZU9mZiBpbnN0ZWFkIG9mIHNvdXJjZS5zdGFydCgpIGFuZCBzb3VyY2Uuc3RvcCgpXG4gICAgcmVjb3JkX2F1ZGlvOiBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhICE9PSB1bmRlZmluZWQsXG4gICAgbWlkaTogZmFsc2UsXG4gICAgd2VibWlkaTogZmFsc2UsXG4gICAgd2ViYXVkaW86IHRydWUsXG4gICAgamF6ejogZmFsc2UsXG4gICAgb2dnOiBmYWxzZSxcbiAgICBtcDM6IGZhbHNlLFxuICAgIGJpdHJhdGVfbXAzX2VuY29kaW5nOiAxMjgsXG4gICAgZGVidWc6IDQsIC8vIDAgPSBvZmYsIDEgPSBlcnJvciwgMiA9IHdhcm4sIDMgPSBpbmZvLCA0ID0gbG9nXG4gICAgZGVidWdMZXZlbDogNCwgLy8gMCA9IG9mZiwgMSA9IGVycm9yLCAyID0gd2FybiwgMyA9IGluZm8sIDQgPSBsb2dcbiAgICBwaXRjaDogNDQwLFxuICAgIGJ1ZmZlclRpbWU6IDM1MC8xMDAwLCAvL3NlY29uZHNcbiAgICBhdXRvQWRqdXN0QnVmZmVyVGltZTogZmFsc2UsXG4gICAgbm90ZU5hbWVNb2RlOiAnc2hhcnAnLFxuICAgIG1pbmltYWxTb25nTGVuZ3RoOiA2MDAwMCwgLy9taWxsaXNcbiAgICBwYXVzZU9uQmx1cjogZmFsc2UsXG4gICAgcmVzdGFydE9uRm9jdXM6IHRydWUsXG4gICAgZGVmYXVsdFBQUTogOTYwLFxuICAgIG92ZXJydWxlUFBROiB0cnVlLFxuICAgIHByZWNpc2lvbjogMywgLy8gbWVhbnMgZmxvYXQgd2l0aCBwcmVjaXNpb24gMywgZS5nLiAxMC40MzdcblxuICAgIGFjdGl2ZVNvbmdzOiB7fSwgLy8gdGhlIHNvbmdzIHRoYXQgYXJlIGN1cnJlbnRseSBsb2FkZWQgaW4gbWVtb3J5XG4gICAgbWlkaUlucHV0czogW10sXG4gICAgbWlkaU91dHB1dHM6IFtdXG59O1xuXG5zZXF1ZW5jZXIuY3JlYXRlU29uZyA9IGZ1bmN0aW9uKGNvbmZpZyl7XG4gICAgcmV0dXJuIG5ldyBTb25nKGNvbmZpZyk7XG59XG5cbnNlcXVlbmNlci5jcmVhdGVUcmFjayA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHQgPSBPYmplY3QuY3JlYXRlKFRyYWNrKTtcbiAgICB0LmluaXQoKTtcbiAgICByZXR1cm4gdDtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBzZXF1ZW5jZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7YWRkRXZlbnRMaXN0ZW5lciwgcmVtb3ZlRXZlbnRMaXN0ZW5lciwgZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9zb25nX2FkZGV2ZW50bGlzdGVuZXInO1xuXG5sZXQgc29uZ0lkID0gMDtcblxuY2xhc3MgU29uZ3tcblxuICBjb25zdHJ1Y3Rvcihjb25maWcpe1xuICAgIHRoaXMuaWQgPSAnUycgKyBzb25nSWQrKyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgLy8gYWRkIHNhbXBsZXMgdG8gdGhlIGluc3RydW1lbnQgYWZ0ZXIgaXQgaGFzIGJlZW4gY3JlYXRlZCwgdGhpcyBhbGxvd3MgeW91IHRvIGppdCBsb2FkIHRoZSBzYW1wbGVzIG9mIGFuIGluc3RydW1lbnRcbiAgYWRkU2FtcGxlcyhzYW1wbGVzKXtcbiAgICBjb25zb2xlLmxvZygnYWRkZWQnLCBzYW1wbGVzKTtcbiAgfVxuXG4gIHN0b3AoKXtcbiAgICBkaXNwYXRjaEV2ZW50KCdzdG9wJyk7XG4gIH1cblxuICBwbGF5KCl7XG4gICAgZGlzcGF0Y2hFdmVudCgncGxheScpO1xuICB9XG59XG5cblNvbmcucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyO1xuU29uZy5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50TGlzdGVuZXI7XG5Tb25nLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZGlzcGF0Y2hFdmVudDtcblxuZXhwb3J0IGRlZmF1bHQgU29uZzsiLCJsZXQgbGlzdGVuZXJzID0ge307XG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoaWQsIGNhbGxiYWNrKXtcbiAgbGlzdGVuZXJzW2lkXSA9IGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKGlkLCBjYWxsYmFjayl7XG4gIGRlbGV0ZSBsaXN0ZW5lcnNbaWRdO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGlkKXtcbiAgZm9yKGxldCBrZXkgaW4gbGlzdGVuZXJzKXtcbiAgICBpZihrZXkgPT09IGlkICYmIGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgIGxpc3RlbmVyc1trZXldKGlkKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHthZGRFdmVudExpc3RlbmVyIGFzIGFkZEV2ZW50TGlzdGVuZXJ9O1xuZXhwb3J0IHtyZW1vdmVFdmVudExpc3RlbmVyIGFzIHJlbW92ZUV2ZW50TGlzdGVuZXJ9O1xuZXhwb3J0IHtkaXNwYXRjaEV2ZW50IGFzIGRpc3BhdGNoRXZlbnR9OyIsIid1c2Ugc3RyaWN0JztcblxubGV0IHRyYWNrSWQgPSAwO1xuXG5cbmxldCBUcmFjayA9IHtcbiAgICBpbml0OiBmdW5jdGlvbigpe1xuICAgICAgICBsZXQgaWQgPSAnVCcgKyB0cmFja0lkKysgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZCcsIHtcbiAgICAgICAgICAgIHZhbHVlOiBpZFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWNrOyJdfQ==
