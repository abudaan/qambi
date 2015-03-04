(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sequencer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/abudaan/workspace/qambi/src/sequencer.js":[function(require,module,exports){
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

},{"./settings.js":"/home/abudaan/workspace/qambi/src/settings.js","./song.js":"/home/abudaan/workspace/qambi/src/song.js","./track.js":"/home/abudaan/workspace/qambi/src/track.js"}],"/home/abudaan/workspace/qambi/src/settings.js":[function(require,module,exports){
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

},{}],"/home/abudaan/workspace/qambi/src/song.js":[function(require,module,exports){
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

},{"./song_add_eventlistener":"/home/abudaan/workspace/qambi/src/song_add_eventlistener.js"}],"/home/abudaan/workspace/qambi/src/song_add_eventlistener.js":[function(require,module,exports){
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
    init: function init() {
        var id = "T" + trackId++ + new Date().getTime();
        Object.defineProperty(this, "id", {
            value: id
        });
    }
};

module.exports = Track;

},{}]},{},["/home/abudaan/workspace/qambi/src/sequencer.js"])("/home/abudaan/workspace/qambi/src/sequencer.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvc2VxdWVuY2VyLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3NldHRpbmdzLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3NvbmcuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvc29uZ19hZGRfZXZlbnRsaXN0ZW5lci5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy90cmFjay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7SUNFTyxXQUFXLDJCQUFNLGVBQWU7O0lBQ2hDLElBQUksMkJBQU0sV0FBVzs7SUFDckIsS0FBSywyQkFBTSxZQUFZOztBQUU5QixJQUFJLFNBQVMsR0FBRztBQUNkLE1BQUksRUFBRSxPQUFPO0FBQ2IsSUFBRSxFQUFFLEVBQUU7QUFDTixNQUFJLEVBQUUsRUFBRTtBQUNSLGFBQVcsRUFBRSxFQUFFO0FBQ2YsWUFBVSxFQUFFLEVBQUU7QUFDZCxhQUFXLEVBQUUsRUFBRTtBQUNmLE1BQUksRUFBRSxnQkFBVTs7O0FBR2QsV0FBTyxJQUFJLE9BQU8sQ0FBQyxTQUFTLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFDO0FBQ25ELFVBQUksUUFBUSxHQUFHLFdBQVcsRUFBRSxDQUFDO0FBQzdCLFVBQUcsUUFBUSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUM7O0FBRTlCLGNBQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDeEIsTUFBSTtBQUNILGlCQUFTLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUM7QUFDM0IsaUJBQVMsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQzs7QUFFckMsWUFBRyxTQUFT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RUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDO0NBQzFCOztBQUVELFNBQVMsbUJBQW1CLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBQztBQUN4QyxTQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUN0Qjs7QUFFRCxTQUFTLGFBQWEsQ0FBQyxFQUFFLEVBQUM7QUFDeEIsT0FBSSxJQUFJLEdBQUcsSUFBSSxTQUFTLEVBQUM7QUFDdkIsUUFBRyxHQUFHLEtBQUssRUFBRSxJQUFJLFNBQVMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUM7QUFDN0MsZUFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3BCO0dBQ0Y7Q0FDRjs7UUFFMkIsZ0JBQWdCLEdBQXBDLGdCQUFnQjtRQUNPLG1CQUFtQixHQUExQyxtQkFBbUI7UUFDRixhQUFhLEdBQTlCLGFBQWE7Ozs7Ozs7O0FDbEJyQixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7O0FBR2hCLElBQUksS0FBSyxHQUFHO0FBQ1IsUUFBSSxFQUFFLGdCQUFVO0FBQ1osWUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLE9BQU8sRUFBRSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEQsY0FBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQzlCLGlCQUFLLEVBQUUsRUFBRTtTQUNaLENBQUMsQ0FBQztLQUNOO0NBQ0osQ0FBQTs7aUJBRWMsS0FBSyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBnZXRTZXR0aW5ncyBmcm9tICcuL3NldHRpbmdzLmpzJztcbmltcG9ydCBTb25nIGZyb20gJy4vc29uZy5qcyc7XG5pbXBvcnQgVHJhY2sgZnJvbSAnLi90cmFjay5qcyc7XG5cbmxldCBzZXF1ZW5jZXIgPSB7XG4gIG5hbWU6ICdxYW1iaScsXG4gIHVpOiB7fSwgLy8gdWkgZnVuY3Rpb25zXG4gIHV0aWw6IHt9LCAvLyB1dGlsIGZ1bmN0aW9uc1xuICBhY3RpdmVTb25nczoge30sIC8vIHRoZSBzb25ncyB0aGF0IGFyZSBjdXJyZW50bHkgbG9hZGVkIGluIG1lbW9yeVxuICBtaWRpSW5wdXRzOiBbXSxcbiAgbWlkaU91dHB1dHM6IFtdLFxuICBpbml0OiBmdW5jdGlvbigpe1xuICAgIC8vIGFkZCBtb3JlIHByb21pc2VzIGhlcmU6IGZvciBpbml0IG1pZGkgc3lzdGVtLCB0ZXN0aW5nIGF1ZGlvIHN1cHBvcnQsIGFuZCBwYXJzaW5nIG1ldHJvbm9tZSBzYW1wbGVzXG4gICAgLy8gLT4gc2VlIGluaXQgbWV0aG9kIGluIHNlcXVlbmNlci5qcyBhdCBsaW5lIDkwIG9mIGhlYXJ0YmVhdCFcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgIGxldCBzZXR0aW5ncyA9IGdldFNldHRpbmdzKCk7XG4gICAgICBpZihzZXR0aW5ncy5lcnJvciAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgLy9hbGVydChzZXR0aW5ncy5lcnJvcik7XG4gICAgICAgIHJlamVjdChzZXR0aW5ncy5lcnJvcik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgc2VxdWVuY2VyLm9zID0gc2V0dGluZ3Mub3M7XG4gICAgICAgIHNlcXVlbmNlci5icm93c2VyID0gc2V0dGluZ3MuYnJvd3NlcjtcblxuICAgICAgICBpZihzZXF1ZW5jZXIub3MgIT09ICdpb3MnKXtcbiAgICAgICAgICBzZXF1ZW5jZXIudW5sb2NrV2ViQXVkaW8gPSBmdW5jdGlvbigpe307XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHNlcXVlbmNlci51bmxvY2tXZWJBdWRpbyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsZXQgc3JjID0gc2V0dGluZ3MuY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCksXG4gICAgICAgICAgICAgIGdhaW5Ob2RlID0gc2V0dGluZ3MuY29udGV4dC5jcmVhdGVHYWluTm9kZSgpO1xuICAgICAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDA7XG4gICAgICAgICAgICBzcmMuY29ubmVjdChnYWluTm9kZSk7XG4gICAgICAgICAgICBnYWluTm9kZS5jb25uZWN0KHNldHRpbmdzLmNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgICAgICAgaWYoc3JjLm5vdGVPbiAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgc3JjLnN0YXJ0ID0gc3JjLm5vdGVPbjtcbiAgICAgICAgICAgICAgc3JjLnN0b3AgPSBzcmMubm90ZU9mZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNyYy5zdGFydCgwKTtcbiAgICAgICAgICAgIHNyYy5zdG9wKDAuMDAxKTtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIGZ1bmN0aW9uIGFmdGVyIGZpcnN0IHVzZVxuICAgICAgICAgICAgc2VxdWVuY2VyLnVubG9ja1dlYkF1ZGlvID0gZnVuY3Rpb24oKXt9O1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5zZXF1ZW5jZXIuY3JlYXRlU29uZyA9IGZ1bmN0aW9uKGNvbmZpZyl7XG4gIHJldHVybiBuZXcgU29uZyhjb25maWcpO1xufTtcblxuc2VxdWVuY2VyLmNyZWF0ZVRyYWNrID0gZnVuY3Rpb24oKXtcbiAgdmFyIHQgPSBPYmplY3QuY3JlYXRlKFRyYWNrKTtcbiAgdC5pbml0KCk7XG4gIHJldHVybiB0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgc2VxdWVuY2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5sZXRcbiAgc2V0dGluZ3MsXG4gIGNvbnRleHQsXG4gIHVhLFxuICBvcyxcbiAgYnJvd3NlcixcbiAgZ2Fpbk5vZGUsXG4gIGNvbXByZXNzb3IsXG4gIHNyYztcblxuXG5mdW5jdGlvbiBnZXRTZXR0aW5ncygpe1xuXG4gIGlmKHNldHRpbmdzICE9PSB1bmRlZmluZWQpe1xuICAgIHJldHVybiBzZXR0aW5ncztcbiAgfVxuXG4gIHNldHRpbmdzID0ge1xuICAgIHVhOiAnJyxcbiAgICBvczogJycsXG4gICAgYnJvd3NlcjogJycsXG4gICAgbGVnYWN5OiBmYWxzZSwgLy8gdHJ1ZSBpZiB0aGUgYnJvd3NlciB1c2VzIGFuIG9sZGVyIHZlcnNpb24gb2YgdGhlIFdlYkF1ZGlvIEFQSSwgc291cmNlLm5vdGVPbigpIGFuZCBzb3VyY2Uubm90ZU9mZiBpbnN0ZWFkIG9mIHNvdXJjZS5zdGFydCgpIGFuZCBzb3VyY2Uuc3RvcCgpXG4gICAgcmVjb3JkX2F1ZGlvOiBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhICE9PSB1bmRlZmluZWQsXG4gICAgbWlkaTogZmFsc2UsXG4gICAgd2VibWlkaTogZmFsc2UsXG4gICAgd2ViYXVkaW86IHRydWUsXG4gICAgamF6ejogZmFsc2UsXG4gICAgb2dnOiBmYWxzZSxcbiAgICBtcDM6IGZhbHNlLFxuICAgIGJpdHJhdGVfbXAzX2VuY29kaW5nOiAxMjgsXG4gICAgZGVidWc6IDQsIC8vIDAgPSBvZmYsIDEgPSBlcnJvciwgMiA9IHdhcm4sIDMgPSBpbmZvLCA0ID0gbG9nXG4gICAgZGVidWdMZXZlbDogNCwgLy8gMCA9IG9mZiwgMSA9IGVycm9yLCAyID0gd2FybiwgMyA9IGluZm8sIDQgPSBsb2dcbiAgICBwaXRjaDogNDQwLFxuICAgIGJ1ZmZlclRpbWU6IDM1MC8xMDAwLCAvL3NlY29uZHNcbiAgICBhdXRvQWRqdXN0QnVmZmVyVGltZTogZmFsc2UsXG4gICAgbm90ZU5hbWVNb2RlOiAnc2hhcnAnLFxuICAgIG1pbmltYWxTb25nTGVuZ3RoOiA2MDAwMCwgLy9taWxsaXNcbiAgICBwYXVzZU9uQmx1cjogZmFsc2UsXG4gICAgcmVzdGFydE9uRm9jdXM6IHRydWUsXG4gICAgZGVmYXVsdFBQUTogOTYwLFxuICAgIG92ZXJydWxlUFBROiB0cnVlLFxuICAgIHByZWNpc2lvbjogMywgLy8gbWVhbnMgZmxvYXQgd2l0aCBwcmVjaXNpb24gMywgZS5nLiAxMC40MzdcbiAgfTtcblxuXG4gIC8vIGdldCBicm93c2VyIGFuZCBvc1xuICBnZXRFbnZpcm9ubWVudCgpO1xuXG5cbiAgLy8gY2hlY2sgZm9yIG1vZGVybiBBUEknc1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICB3aW5kb3cuQmxvYiA9IHdpbmRvdy5CbG9iIHx8IHdpbmRvdy53ZWJraXRCbG9iIHx8IHdpbmRvdy5tb3pCbG9iO1xuICAvL2NvbnNvbGUubG9nKCdpT1MnLCBvcywgY29udGV4dCwgd2luZG93LkJsb2IsIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpO1xuXG5cbiAgLy8gY2hlY2sgaWYgYXVkaW8gY2FuIGJlIHJlY29yZGVkXG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSAoXG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fFxuICAgIG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHxcbiAgICBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8XG4gICAgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhXG4gICk7XG5cblxuICAvLyBhdWRpbyBjb250ZXh0XG4gIGlmKHdpbmRvdy5BdWRpb0NvbnRleHQpe1xuICAgIGNvbnRleHQgPSBuZXcgd2luZG93LkF1ZGlvQ29udGV4dCgpO1xuICAgIGlmKGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluO1xuICAgIH1cbiAgfWVsc2UgaWYod2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCl7XG4gICAgY29udGV4dCA9IG5ldyB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0KCk7XG4gIH1lbHNlIGlmKHdpbmRvdy5vQXVkaW9Db250ZXh0KXtcbiAgICBjb250ZXh0ID0gbmV3IHdpbmRvdy5vQXVkaW9Db250ZXh0KCk7XG4gIH1lbHNlIGlmKHdpbmRvdy5tc0F1ZGlvQ29udGV4dCl7XG4gICAgY29udGV4dCA9IG5ldyB3aW5kb3cubXNBdWRpb0NvbnRleHQoKTtcbiAgfWVsc2V7XG4gICAgbGV0IGVycm9yID0gJ1RoZSBXZWJBdWRpbyBBUEkgaGFzblxcJ3QgYmVlbiBpbXBsZW1lbnRlZCBpbiAnICsgYnJvd3NlciArICcsIHBsZWFzZSB1c2UgYW55IG90aGVyIGJyb3dzZXInO1xuICAgIHJldHVybiB7ZXJyb3J9O1xuICB9XG5cblxuICAvLyBjaGVjayBmb3Igb2xkZXIgaW1wbGVtZW50YXRpb25zIG9mIFdlYkF1ZGlvXG4gIHNyYyA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gIHNldHRpbmdzLmxlZ2FjeSA9IGZhbHNlO1xuICBpZihzcmMuc3RhcnQgPT09IHVuZGVmaW5lZCl7XG4gICAgc2V0dGluZ3MubGVnYWN5ID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIHNldCB1cCB0aGUgZWxlbWVudGFyeSBhdWRpbyBub2Rlc1xuICBjb21wcmVzc29yID0gY29udGV4dC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcbiAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICBnYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUoKTtcbiAgZ2Fpbk5vZGUuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDE7XG5cblxuICAvLyBhZGQgdG8gc2V0dGluZ3Mgb2JqZWN0XG4gIHNldHRpbmdzLmNvbnRleHQgPSBjb250ZXh0O1xuICBzZXR0aW5ncy5tYXN0ZXJHYWluTm9kZSA9IGdhaW5Ob2RlO1xuICBzZXR0aW5ncy5tYXN0ZXJDb21wcmVzc29yID0gY29tcHJlc3NvcjtcblxuICBzZXR0aW5ncy51YSA9IHVhO1xuICBzZXR0aW5ncy5vcyA9IG9zO1xuICBzZXR0aW5ncy5icm93c2VyID0gYnJvd3NlcjsgLy8gdGhlIG5hbWUgb2YgdGhlYnJvd3NlciBpbiBsb3dlcmNhc2UsIGUuZy4gZmlyZWZveCwgb3BlcmEsIHNhZmFyaSwgY2hyb21pdW0sIGV0Yy5cbiAgc2V0dGluZ3MucmVjb3JkX2F1ZGlvID0gbmF2aWdhdG9yLmdldFVzZXJNZWRpYSAhPT0gdW5kZWZpbmVkO1xuXG4gIHJldHVybiBzZXR0aW5ncztcbn1cblxuXG5mdW5jdGlvbiBnZXRFbnZpcm9ubWVudCgpe1xuICBpZihuYXZpZ2F0b3IgPT09IHVuZGVmaW5lZCl7XG4gICAgdWEgPSAnTkEnO1xuICAgIGJyb3dzZXIgPSAnTkEnO1xuICAgIG9zID0gJ3Vua25vd24nOyAvLyBUT0RPOiBjaGVjayBvcyBoZXJlIHdpdGggTm9kZWpzJyByZXF1aXJlKCdvcycpXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gIGlmKHVhLm1hdGNoKC8oaVBhZHxpUGhvbmV8aVBvZCkvZykpe1xuICAgIG9zID0gJ2lvcyc7XG4gIH1lbHNlIGlmKHVhLmluZGV4T2YoJ0FuZHJvaWQnKSAhPT0gLTEpe1xuICAgIG9zID0gJ2FuZHJvaWQnO1xuICB9ZWxzZSBpZih1YS5pbmRleE9mKCdMaW51eCcpICE9PSAtMSl7XG4gICAgIG9zID0gJ2xpbnV4JztcbiAgfWVsc2UgaWYodWEuaW5kZXhPZignTWFjaW50b3NoJykgIT09IC0xKXtcbiAgICAgb3MgPSAnb3N4JztcbiAgfWVsc2UgaWYodWEuaW5kZXhPZignV2luZG93cycpICE9PSAtMSl7XG4gICAgIG9zID0gJ3dpbmRvd3MnO1xuICB9XG5cbiAgaWYodWEuaW5kZXhPZignQ2hyb21lJykgIT09IC0xKXtcbiAgICAvLyBjaHJvbWUsIGNocm9taXVtIGFuZCBjYW5hcnlcbiAgICBicm93c2VyID0gJ2Nocm9tZSc7XG5cbiAgICBpZih1YS5pbmRleE9mKCdPUFInKSAhPT0gLTEpe1xuICAgICAgYnJvd3NlciA9ICdvcGVyYSc7XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignQ2hyb21pdW0nKSAhPT0gLTEpe1xuICAgICAgYnJvd3NlciA9ICdjaHJvbWl1bSc7XG4gICAgfVxuICB9ZWxzZSBpZih1YS5pbmRleE9mKCdTYWZhcmknKSAhPT0gLTEpe1xuICAgIGJyb3dzZXIgPSAnc2FmYXJpJztcbiAgfWVsc2UgaWYodWEuaW5kZXhPZignRmlyZWZveCcpICE9PSAtMSl7XG4gICAgYnJvd3NlciA9ICdmaXJlZm94JztcbiAgfWVsc2UgaWYodWEuaW5kZXhPZignVHJpZGVudCcpICE9PSAtMSl7XG4gICAgYnJvd3NlciA9ICdJbnRlcm5ldCBFeHBsb3Jlcic7XG4gIH1cblxuICBpZihvcyA9PT0gJ2lvcycpe1xuICAgIGlmKHVhLmluZGV4T2YoJ0NyaU9TJykgIT09IC0xKXtcbiAgICAgIGJyb3dzZXIgPSAnY2hyb21lJztcbiAgICB9XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhvcywgYnJvd3NlciwgJy0tLScsIHVhKTtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBnZXRTZXR0aW5nczsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7YWRkRXZlbnRMaXN0ZW5lciwgcmVtb3ZlRXZlbnRMaXN0ZW5lciwgZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9zb25nX2FkZF9ldmVudGxpc3RlbmVyJztcblxubGV0IHNvbmdJZCA9IDA7XG5cblxuY2xhc3MgU29uZ3tcblxuICBjb25zdHJ1Y3Rvcihjb25maWcpe1xuICAgIHRoaXMuaWQgPSAnUycgKyBzb25nSWQrKyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgLy8gYWRkIHNhbXBsZXMgdG8gdGhlIGluc3RydW1lbnQgYWZ0ZXIgaXQgaGFzIGJlZW4gY3JlYXRlZCwgdGhpcyBhbGxvd3MgeW91IHRvIGppdCBsb2FkIHRoZSBzYW1wbGVzIG9mIGFuIGluc3RydW1lbnRcbiAgYWRkU2FtcGxlcyhzYW1wbGVzKXtcbiAgICBjb25zb2xlLmxvZygnYWRkZWQnLCBzYW1wbGVzKTtcbiAgfVxuXG4gIHN0b3AoKXtcbiAgICBkaXNwYXRjaEV2ZW50KCdzdG9wJyk7XG4gIH1cblxuICBwbGF5KCl7XG4gICAgZGlzcGF0Y2hFdmVudCgncGxheScpO1xuICB9XG59XG5cblNvbmcucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyO1xuU29uZy5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50TGlzdGVuZXI7XG5Tb25nLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZGlzcGF0Y2hFdmVudDtcblxuZXhwb3J0IGRlZmF1bHQgU29uZzsiLCJsZXQgbGlzdGVuZXJzID0ge307XG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoaWQsIGNhbGxiYWNrKXtcbiAgbGlzdGVuZXJzW2lkXSA9IGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKGlkLCBjYWxsYmFjayl7XG4gIGRlbGV0ZSBsaXN0ZW5lcnNbaWRdO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGlkKXtcbiAgZm9yKGxldCBrZXkgaW4gbGlzdGVuZXJzKXtcbiAgICBpZihrZXkgPT09IGlkICYmIGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgIGxpc3RlbmVyc1trZXldKGlkKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHthZGRFdmVudExpc3RlbmVyIGFzIGFkZEV2ZW50TGlzdGVuZXJ9O1xuZXhwb3J0IHtyZW1vdmVFdmVudExpc3RlbmVyIGFzIHJlbW92ZUV2ZW50TGlzdGVuZXJ9O1xuZXhwb3J0IHtkaXNwYXRjaEV2ZW50IGFzIGRpc3BhdGNoRXZlbnR9OyIsIid1c2Ugc3RyaWN0JztcblxubGV0IHRyYWNrSWQgPSAwO1xuXG5cbmxldCBUcmFjayA9IHtcbiAgICBpbml0OiBmdW5jdGlvbigpe1xuICAgICAgICBsZXQgaWQgPSAnVCcgKyB0cmFja0lkKysgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZCcsIHtcbiAgICAgICAgICAgIHZhbHVlOiBpZFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYWNrOyJdfQ==
