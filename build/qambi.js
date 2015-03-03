(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sequencer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/abudaan/workspace/qambi/src/module.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Song = _interopRequire(require("./song.js"));

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


module.exports = sequencer;

},{"./song.js":"/home/abudaan/workspace/qambi/src/song.js"}],"/home/abudaan/workspace/qambi/src/song.js":[function(require,module,exports){
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

},{}]},{},["/home/abudaan/workspace/qambi/src/module.js"])("/home/abudaan/workspace/qambi/src/module.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvbW9kdWxlLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3NvbmcuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvc29uZ19hZGRldmVudGxpc3RlbmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsWUFBWSxDQUFDOzs7O0lBRU4sSUFBSSwyQkFBTSxXQUFXOztBQUU1QixJQUFJLFNBQVMsR0FBRztBQUNaLFFBQUksRUFBRSxPQUFPO0FBQ2IsTUFBRSxFQUFFLEVBQUU7QUFDTixRQUFJLEVBQUUsRUFBRTtBQUNSLE1BQUUsRUFBRSxFQUFFO0FBQ04sTUFBRSxFQUFFLEVBQUU7QUFDTixXQUFPLEVBQUUsRUFBRTtBQUNYLFVBQU0sRUFBRSxLQUFLO0FBQ2IsZ0JBQVksRUFBRSxTQUFTLENBQUMsWUFBWSxLQUFLLFNBQVM7QUFDbEQsUUFBSSxFQUFFLEtBQUs7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxJQUFJO0FBQ2QsUUFBSSxFQUFFLEtBQUs7QUFDWCxPQUFHLEVBQUUsS0FBSztBQUNWLE9BQUcsRUFBRSxLQUFLO0FBQ1Ysd0JBQW9CLEVBQUUsR0FBRztBQUN6QixTQUFLLEVBQUUsQ0FBQztBQUNSLGNBQVUsRUFBRSxDQUFDO0FBQ2IsU0FBSyxFQUFFLEdBQUc7QUFDVixjQUFVLEVBQUUsR0FBRyxHQUFDLElBQUk7QUFDcEIsd0JBQW9CLEVBQUUsS0FBSztBQUMzQixnQkFBWSxFQUFFLE9BQU87QUFDckIscUJBQWlCLEVBQUUsS0FBSztBQUN4QixlQUFXLEVBQUUsS0FBSztBQUNsQixrQkFBYyxFQUFFLElBQUk7QUFDcEIsY0FBVSxFQUFFLEdBQUc7QUFDZixlQUFXLEVBQUUsSUFBSTtBQUNqQixhQUFTLEVBQUUsQ0FBQzs7QUFFWixlQUFXLEVBQUUsRUFBRTtBQUNmLGNBQVUsRUFBRSxFQUFFO0FBQ2QsZUFBVyxFQUFFLEVBQUU7Q0FDbEIsQ0FBQzs7QUFFRixTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVMsTUFBTSxFQUFDO0FBQ25DLFdBQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDM0IsQ0FBQTs7O2lCQUdjLFNBQVM7OztBQzNDeEIsWUFBWSxDQUFDOzs7Ozs7cUNBRXNELHlCQUF5Qjs7SUFBcEYsZ0JBQWdCLDBCQUFoQixnQkFBZ0I7SUFBRSxtQkFBbUIsMEJBQW5CLG1CQUFtQjtJQUFFLGFBQWEsMEJBQWIsYUFBYTs7O0FBRTVELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQzs7SUFFVCxJQUFJO0FBRUcsV0FGUCxJQUFJLENBRUksTUFBTTswQkFGZCxJQUFJOztBQUdOLFFBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEQsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7R0FDdEI7O3VCQUxHLElBQUk7QUFRUixjQUFVOzs7YUFBQSxvQkFBQyxPQUFPLEVBQUM7QUFDakIsZUFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDL0I7Ozs7QUFFRCxRQUFJO2FBQUEsZ0JBQUU7QUFDSixxQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3ZCOzs7O0FBRUQsUUFBSTthQUFBLGdCQUFFO0FBQ0oscUJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUN2Qjs7Ozs7O1NBbEJHLElBQUk7OztBQXFCVixJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBQ25ELElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7QUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDOztpQkFFOUIsSUFBSTs7Ozs7QUMvQm5CLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsU0FBUyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFDO0FBQ3JDLFdBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUM7Q0FDMUI7O0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFDO0FBQ3hDLFNBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3RCOztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQUUsRUFBQztBQUN4QixPQUFJLElBQUksR0FBRyxJQUFJLFNBQVMsRUFBQztBQUN2QixRQUFHLEdBQUcsS0FBSyxFQUFFLElBQUksU0FBUyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBQztBQUM3QyxlQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDcEI7R0FDRjtDQUNGOztRQUUyQixnQkFBZ0IsR0FBcEMsZ0JBQWdCO1FBQ08sbUJBQW1CLEdBQTFDLG1CQUFtQjtRQUNGLGFBQWEsR0FBOUIsYUFBYSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBTb25nIGZyb20gJy4vc29uZy5qcyc7XG5cbmxldCBzZXF1ZW5jZXIgPSB7XG4gICAgbmFtZTogJ3FhbWJpJyxcbiAgICB1aToge30sXG4gICAgdXRpbDoge30sXG4gICAgdWE6ICcnLFxuICAgIG9zOiAnJyxcbiAgICBicm93c2VyOiAnJyxcbiAgICBsZWdhY3k6IGZhbHNlLCAvLyB0cnVlIGlmIHRoZSBicm93c2VyIHVzZXMgYW4gb2xkZXIgdmVyc2lvbiBvZiB0aGUgV2ViQXVkaW8gQVBJLCBzb3VyY2Uubm90ZU9uKCkgYW5kIHNvdXJjZS5ub3RlT2ZmIGluc3RlYWQgb2Ygc291cmNlLnN0YXJ0KCkgYW5kIHNvdXJjZS5zdG9wKClcbiAgICByZWNvcmRfYXVkaW86IG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgIT09IHVuZGVmaW5lZCxcbiAgICBtaWRpOiBmYWxzZSxcbiAgICB3ZWJtaWRpOiBmYWxzZSxcbiAgICB3ZWJhdWRpbzogdHJ1ZSxcbiAgICBqYXp6OiBmYWxzZSxcbiAgICBvZ2c6IGZhbHNlLFxuICAgIG1wMzogZmFsc2UsXG4gICAgYml0cmF0ZV9tcDNfZW5jb2Rpbmc6IDEyOCxcbiAgICBkZWJ1ZzogNCwgLy8gMCA9IG9mZiwgMSA9IGVycm9yLCAyID0gd2FybiwgMyA9IGluZm8sIDQgPSBsb2dcbiAgICBkZWJ1Z0xldmVsOiA0LCAvLyAwID0gb2ZmLCAxID0gZXJyb3IsIDIgPSB3YXJuLCAzID0gaW5mbywgNCA9IGxvZ1xuICAgIHBpdGNoOiA0NDAsXG4gICAgYnVmZmVyVGltZTogMzUwLzEwMDAsIC8vc2Vjb25kc1xuICAgIGF1dG9BZGp1c3RCdWZmZXJUaW1lOiBmYWxzZSxcbiAgICBub3RlTmFtZU1vZGU6ICdzaGFycCcsXG4gICAgbWluaW1hbFNvbmdMZW5ndGg6IDYwMDAwLCAvL21pbGxpc1xuICAgIHBhdXNlT25CbHVyOiBmYWxzZSxcbiAgICByZXN0YXJ0T25Gb2N1czogdHJ1ZSxcbiAgICBkZWZhdWx0UFBROiA5NjAsXG4gICAgb3ZlcnJ1bGVQUFE6IHRydWUsXG4gICAgcHJlY2lzaW9uOiAzLCAvLyBtZWFucyBmbG9hdCB3aXRoIHByZWNpc2lvbiAzLCBlLmcuIDEwLjQzN1xuXG4gICAgYWN0aXZlU29uZ3M6IHt9LCAvLyB0aGUgc29uZ3MgdGhhdCBhcmUgY3VycmVudGx5IGxvYWRlZCBpbiBtZW1vcnlcbiAgICBtaWRpSW5wdXRzOiBbXSxcbiAgICBtaWRpT3V0cHV0czogW11cbn07XG5cbnNlcXVlbmNlci5jcmVhdGVTb25nID0gZnVuY3Rpb24oY29uZmlnKXtcbiAgICByZXR1cm4gbmV3IFNvbmcoY29uZmlnKTtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBzZXF1ZW5jZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7YWRkRXZlbnRMaXN0ZW5lciwgcmVtb3ZlRXZlbnRMaXN0ZW5lciwgZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9zb25nX2FkZGV2ZW50bGlzdGVuZXInO1xuXG5sZXQgc29uZ0lkID0gMDtcblxuY2xhc3MgU29uZ3tcblxuICBjb25zdHJ1Y3Rvcihjb25maWcpe1xuICAgIHRoaXMuaWQgPSAnUycgKyBzb25nSWQrKyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgLy8gYWRkIHNhbXBsZXMgdG8gdGhlIGluc3RydW1lbnQgYWZ0ZXIgaXQgaGFzIGJlZW4gY3JlYXRlZCwgdGhpcyBhbGxvd3MgeW91IHRvIGppdCBsb2FkIHRoZSBzYW1wbGVzIG9mIGFuIGluc3RydW1lbnRcbiAgYWRkU2FtcGxlcyhzYW1wbGVzKXtcbiAgICBjb25zb2xlLmxvZygnYWRkZWQnLCBzYW1wbGVzKTtcbiAgfVxuXG4gIHN0b3AoKXtcbiAgICBkaXNwYXRjaEV2ZW50KCdzdG9wJyk7XG4gIH1cblxuICBwbGF5KCl7XG4gICAgZGlzcGF0Y2hFdmVudCgncGxheScpO1xuICB9XG59XG5cblNvbmcucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyO1xuU29uZy5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50TGlzdGVuZXI7XG5Tb25nLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZGlzcGF0Y2hFdmVudDtcblxuZXhwb3J0IGRlZmF1bHQgU29uZzsiLCJsZXQgbGlzdGVuZXJzID0ge307XG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoaWQsIGNhbGxiYWNrKXtcbiAgbGlzdGVuZXJzW2lkXSA9IGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKGlkLCBjYWxsYmFjayl7XG4gIGRlbGV0ZSBsaXN0ZW5lcnNbaWRdO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGlkKXtcbiAgZm9yKGxldCBrZXkgaW4gbGlzdGVuZXJzKXtcbiAgICBpZihrZXkgPT09IGlkICYmIGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgIGxpc3RlbmVyc1trZXldKGlkKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHthZGRFdmVudExpc3RlbmVyIGFzIGFkZEV2ZW50TGlzdGVuZXJ9O1xuZXhwb3J0IHtyZW1vdmVFdmVudExpc3RlbmVyIGFzIHJlbW92ZUV2ZW50TGlzdGVuZXJ9O1xuZXhwb3J0IHtkaXNwYXRjaEV2ZW50IGFzIGRpc3BhdGNoRXZlbnR9OyJdfQ==
