(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/abudaan/workspace/qambi/src/config.js":[function(require,module,exports){
"use strict";

var config = undefined,
    defaultSong = undefined,
    ua = "NA",
    os = "unknown",
    browser = "NA";

function getConfig() {
  if (config !== undefined) {
    return config;
  }

  config = new Map();
  config.set("legacy", false); // true if the browser uses an older version of the WebAudio API, source.noteOn() and source.noteOff instead of source.start() and source.stop()
  config.set("midi", false); // true if the browser has MIDI support either via WebMIDI or Jazz
  config.set("webmidi", false); // true if the browser has WebMIDI
  config.set("webaudio", true); // true if the browser has WebAudio
  config.set("jazz", false); // true if the browser has the Jazz plugin
  config.set("ogg", false); // true if WebAudio supports ogg
  config.set("mp3", false); // true if WebAudio supports mp3
  config.set("bitrate_mp3_encoding", 128); // default bitrate for audio recordings
  config.set("debugLevel", 4); // 0 = off, 1 = error, 2 = warn, 3 = info, 4 = log
  config.set("pitch", 440); // basic pitch that is used when generating samples
  config.set("bufferTime", 350 / 1000); // time in seconds that events are scheduled ahead
  config.set("autoAdjustBufferTime", false);
  config.set("noteNameMode", "sharp");
  config.set("minimalSongLength", 60000); //millis
  config.set("pauseOnBlur", false); // pause the AudioContext when page or tab looses focus
  config.set("restartOnFocus", true); // if song was playing at the time the page or tab lost focus, it will start playing automatically as soon as the page/tab gets focus again
  config.set("defaultPPQ", 960);
  config.set("overrulePPQ", true);
  config.set("precision", 3); // means float with precision 3, e.g. 10.437
  config.set("activeSongs", {}); // the songs currently loaded in memory

  defaultSong = new Map();
  defaultSong.set("bpm", 120);
  defaultSong.set("ppq", config.get("defaultPPQ"));
  defaultSong.set("bars", 30);
  defaultSong.set("lowestNote", 0);
  defaultSong.set("highestNote", 127);
  defaultSong.set("nominator", 4);
  defaultSong.set("denominator", 4);
  defaultSong.set("quantizeValue", 8);
  defaultSong.set("fixedLengthValue", false);
  defaultSong.set("positionType", "all");
  defaultSong.set("useMetronome", false);
  defaultSong.set("autoSize", true);
  defaultSong.set("loop", false);
  defaultSong.set("playbackSpeed", 1);
  defaultSong.set("autoQuantize", false);
  config.set("defaultSong", defaultSong);

  // get browser and os
  if (navigator !== undefined) {
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
  } else {}
  config.set("ua", ua);
  config.set("os", os);
  config.set("browser", browser);

  // check if we have an audio context
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.oAudioContext || window.msAudioContext;
  config.set("audio_context", navigator.getUserMedia !== undefined);
  config.set("record_audio", navigator.getUserMedia !== undefined);

  // check if audio can be recorded
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  config.set("audio_context", window.AudioContext !== undefined);

  // no webaudio, return
  if (config.get("audio_context") === false) {
    return false;
  }

  // check for other 'modern' API's
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  window.Blob = window.Blob || window.webkitBlob || window.mozBlob;
  //console.log('iOS', os, context, window.Blob, window.requestAnimationFrame);

  return config;
}

module.exports = getConfig;
/*
  Creates the config object that is used for internally sharing settings, information and the state. Other modules may add keys to this object.
*/

// TODO: check os here with Nodejs' require('os')

},{}],"/home/abudaan/workspace/qambi/src/init_midi.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

exports.initMidiSong = initMidiSong;
exports.setMidiInputSong = setMidiInputSong;
exports.setMidiOutputSong = setMidiOutputSong;

var _util = require("./util");

var log = _util.log;
var info = _util.info;
var warn = _util.warn;
var error = _util.error;
var typeString = _util.typeString;

var MidiEvent = _interopRequire(require("./midi_event"));

var data = {};
var inputs = new Map();
var outputs = new Map();

var songMidiEventListener = undefined;
var midiEventListenerId = 0;

function initMidi() {

  return new Promise(function executor(resolve, reject) {

    var tmp = undefined;

    if (navigator.requestMIDIAccess !== undefined) {

      navigator.requestMIDIAccess().then(function onFulFilled(midi) {
        if (midi._jazzInstances !== undefined) {
          data.jazz = midi._jazzInstances[0]._Jazz.version;
          data.midi = true;
        } else {
          data.webmidi = true;
          data.midi = true;
        }

        // old implementation of WebMIDI
        if (typeof midi.inputs.values !== "function") {
          reject("You browser is using an old implementation of the WebMIDI API, please update your browser.");
          return;
        }

        // get inputs
        tmp = Array.from(midi.inputs.values());

        //sort ports by name ascending
        tmp.sort(function (a, b) {
          return a.name.toLowerCase() <= b.name.toLowerCase() ? 1 : -1;
        });

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = tmp[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var port = _step.value;

            inputs.set(port.id, port);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        // get outputs
        tmp = Array.from(midi.outputs.values());

        //sort ports by name ascending
        tmp.sort(function (a, b) {
          return a.name.toLowerCase() <= b.name.toLowerCase() ? 1 : -1;
        });

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = tmp[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var port = _step2.value;

            outputs.set(port.id, port);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        // onconnect and ondisconnect are not yet implemented in Chrome and Chromium
        midi.addEventListener("onconnect", function (e) {
          log("device connected", e);
        }, false);

        midi.addEventListener("ondisconnect", function (e) {
          log("device disconnected", e);
        }, false);

        // export
        data.inputs = inputs;
        data.outputs = outputs;

        resolve(data);
      }, function onReject(e) {
        //console.log(e);
        reject("Something went wrong while requesting MIDIAccess");
      });
      // browsers without WebMIDI API
    } else {
      data.midi = false;
      resolve(data);
    }
  });
}

function initMidiSong(song) {

  songMidiEventListener = function (e) {
    //console.log(e);
    handleMidiMessageSong(song, e, this);
  };

  // by default a song listens to all available midi-in ports
  inputs.forEach(function (port) {
    port.addEventListener("midimessage", songMidiEventListener);
    song.midiInputs.set(port.id, port);
  });

  outputs.forEach(function (port) {
    song.midiOutputs.set(port.id, port);
  });
}

function setMidiInputSong(song, id, flag) {
  var input = inputs.get(id);

  if (input === undefined) {
    warn("no midi input with id", id, "found");
    return;
  }

  if (flag === false) {
    song.midiInputs["delete"](id);
    input.removeEventListener("midimessage", songMidiEventListener);
  } else {
    song.midiInputs.set(id, input);
    input.addEventListener("midimessage", songMidiEventListener);
  }

  var tracks = song.tracks;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tracks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var track = _step.value;

      track.setMidiInput(id, flag);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"]) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function setMidiOutputSong(song, id, flag) {
  var output = outputs.get(id);

  if (output === undefined) {
    warn("no midi output with id", id, "found");
    return;
  }

  if (flag === false) {
    song.midiOutputs["delete"](id);
    var time = song.scheduler.lastEventTime + 100;
    output.send([176, 123, 0], time); // stop all notes
    output.send([176, 121, 0], time); // reset all controllers
  } else {
    song.midiOutputs.set(id, output);
  }

  var tracks = song.tracks;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tracks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var track = _step.value;

      track.setMidiOutput(id, flag);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"]) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function handleMidiMessageSong(song, midiMessageEvent, input) {
  var midiEvent = _applyConstructor(MidiEvent, [song.ticks].concat(_toConsumableArray(midiMessageEvent.data)));

  //console.log(midiMessageEvent.data);

  var tracks = song.tracks;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tracks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var track = _step.value;

      //console.log(track.midiInputs, input);
      /*
      if(midiEvent.channel === track.channel || track.channel === 0 || track.channel === 'any'){
        handleMidiMessageTrack(midiEvent, track);
      }
      */
      // like in Cubase, midi events from all devices, sent on any midi channel are forwarded to all tracks
      // set track.monitor to false if you don't want to receive midi events on a certain track
      // note that track.monitor is by default set to false and that track.monitor is automatically set to true
      // if you are recording on that track
      //console.log(track.monitor, track.id, input.id);
      if (track.monitor === true && track.midiInputs.get(input.id) !== undefined) {
        handleMidiMessageTrack(midiEvent, track, input);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"]) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var listeners = song.midiEventListeners.get(midiEvent.type);
  if (listeners !== undefined) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = listeners[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var listener = _step2.value;

        listener(midiEvent, input);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }
}

function handleMidiMessageTrack(track, midiEvent, input) {
  var song = track.song,
      note = undefined,
      listeners = undefined,
      channel = undefined;
  //data = midiMessageEvent.data,
  //midiEvent = createMidiEvent(song.ticks, data[0], data[1], data[2]);

  //midiEvent.source = midiMessageEvent.srcElement.name;
  //console.log(midiMessageEvent)
  //console.log('---->', midiEvent.type);

  // add the exact time of this event so we can calculate its ticks position
  midiEvent.recordMillis = context.currentTime * 1000; // millis
  midiEvent.state = "recorded";

  if (midiEvent.type === 144) {
    note = createMidiNote(midiEvent);
    track.recordingNotes[midiEvent.data1] = note;
    //track.song.recordingNotes[note.id] = note;
  } else if (midiEvent.type === 128) {
    note = track.recordingNotes[midiEvent.data1];
    // check if the note exists: if the user plays notes on her keyboard before the midi system has
    // been fully initialized, it can happen that the first incoming midi event is a NOTE OFF event
    if (note === undefined) {
      return;
    }
    note.addNoteOff(midiEvent);
    delete track.recordingNotes[midiEvent.data1];
    //delete track.song.recordingNotes[note.id];
  }

  //console.log(song.preroll, song.recording, track.recordEnabled);

  if ((song.prerolling || song.recording) && track.recordEnabled === "midi") {
    if (midiEvent.type === 144) {
      track.song.recordedNotes.push(note);
    }
    track.recordPart.addEvent(midiEvent);
    // song.recordedEvents is used in the key editor
    track.song.recordedEvents.push(midiEvent);
  } else if (track.enableRetrospectiveRecording) {
    track.retrospectiveRecording.push(midiEvent);
  }

  // call all midi event listeners
  listeners = track.midiEventListeners[midiEvent.type];
  if (listeners !== undefined) {
    objectForEach(listeners, function (listener) {
      listener(midiEvent, input);
    });
  }

  channel = track.channel;
  if (channel === "any" || channel === undefined || isNaN(channel) === true) {
    channel = 0;
  }

  objectForEach(track.midiOutputs, function (output) {
    //console.log('midi out', output, midiEvent.type);
    if (midiEvent.type === 128 || midiEvent.type === 144 || midiEvent.type === 176) {
      //console.log(midiEvent.type, midiEvent.data1, midiEvent.data2);
      output.send([midiEvent.type, midiEvent.data1, midiEvent.data2]);
      // }else if(midiEvent.type === 192){
      //     output.send([midiEvent.type + channel, midiEvent.data1]);
    }
    //output.send([midiEvent.status + channel, midiEvent.data1, midiEvent.data2]);
  });

  // @TODO: maybe a track should be able to send its event to both a midi-out port and an internal heartbeat song?
  //console.log(track.routeToMidiOut);
  if (track.routeToMidiOut === false) {
    midiEvent.track = track;
    track.instrument.processEvent(midiEvent);
  }
}

function addMidiEventListener() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  // caller can be a track or a song

  var id = midiEventListenerId++;
  var listener = undefined;
  types = {}, ids = [], loop;

  // should I inline this?
  loop = function (args) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var arg = _step.value;

        var type = typeString(arg);
        //console.log(type);
        if (type === "array") {
          loop(arg);
        } else if (type === "function") {
          listener = arg;
        } else if (isNaN(arg) === false) {
          arg = parseInt(arg, 10);
          if (sequencer.checkEventType(arg) !== false) {
            types[arg] = arg;
          }
        } else if (type === "string") {
          if (sequencer.checkEventType(arg) !== false) {
            arg = sequencer.midiEventNumberByName(arg);
            types[arg] = arg;
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"]) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };

  loop(args, 0, args.length);
  //console.log('types', types, 'listener', listener);

  objectForEach(types, function (type) {
    //console.log(type);
    if (obj.midiEventListeners[type] === undefined) {
      obj.midiEventListeners[type] = {};
    }
    obj.midiEventListeners[type][id] = listener;
    ids.push(type + "_" + id);
  });

  //console.log(obj.midiEventListeners);
  return ids.length === 1 ? ids[0] : ids;
}

function removeMidiEventListener(id, obj) {
  var type;
  id = id.split("_");
  type = id[0];
  id = id[1];
  delete obj.midiEventListeners[type][id];
}

function removeMidiEventListeners() {}

exports["default"] = initMidi;
Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
  Requests MIDI access, queries all inputs and outputs and stores them in alphabetical order
*/

},{"./midi_event":"/home/abudaan/workspace/qambi/src/midi_event.js","./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/midi_event.js":[function(require,module,exports){
"use strict";

var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

var _slice = Array.prototype.slice;

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = createMIDIEvent;

var _util = require("./util");

var log = _util.log;
var info = _util.info;
var warn = _util.warn;
var error = _util.error;
var typeString = _util.typeString;

var createNote = require("./note.js").createNote;

var midiEventId = 0;

/*
  arguments:
   - [ticks, type, data1, data2, channel]
   - ticks, type, data1, data2, channel

  data2 and channel are optional but must be numbers if provided
*/

var MIDIEvent = (function () {
  function MIDIEvent() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, MIDIEvent);

    var note = undefined;

    this.id = "M" + midiEventId++ + new Date().getTime();
    this.eventNumber = midiEventId;
    this.time = 0;
    this.muted = false;

    if (args === undefined || args.length === 0) {
      // bypass contructor for cloning
      return;
    } else if (typeString(args[0]) === "midimessageevent") {
      info("midimessageevent");
      return;
    } else if (typeString(args[0]) === "array") {
      // support for un-spreaded parameters
      args = args[0];
      if (typeString(args[0]) === "array") {
        // support for passing parameters in an array
        args = args[0];
      }
    }

    args.forEach(function (data, i) {
      if (isNaN(data) && i < 5) {
        error("please provide numbers for ticks, type, data1 and optionally for data2 and channel");
      }
    });

    this.ticks = args[0];
    this.status = args[1];
    this.type = (this.status >> 4) * 16;
    //console.log(this.type, this.status);
    if (this.type >= 128 && this.type <= 224) {
      //the higher 4 bits of the status byte is the command
      this.command = this.type;
      //the lower 4 bits of the status byte is the channel number
      this.channel = (this.status & 15) + 1; // from zero-based to 1-based
    } else {
      this.type = this.status;
      this.channel = args[4] || 1;
    }

    this.sortIndex = this.type + this.ticks; // note off events come before note on events

    switch (this.type) {
      case 0:
        break;
      case 128:
        this.data1 = args[2];
        note = createNote(this.data1);
        this.note = note;
        this.noteName = note.fullName;
        this.noteNumber = note.number;
        this.octave = note.octave;
        this.frequency = note.frequency;
        this.data2 = 0; //data[3];
        this.velocity = this.data2;
        break;
      case 144:
        this.data1 = args[2]; //note number
        this.data2 = args[3]; //velocity
        if (this.data2 === 0) {
          //if velocity is 0, this is a NOTE OFF event
          this.type = 128;
        }
        note = createNote(this.data1);
        this.note = note;
        this.noteName = note.fullName;
        this.noteNumber = note.number;
        this.octave = note.octave;
        this.frequency = note.frequency;
        this.velocity = this.data2;
        break;
      case 81:
        this.bpm = args[2];
        break;
      case 88:
        this.nominator = args[2];
        this.denominator = args[3];
        break;
      case 176:
        // control change
        this.data1 = args[2];
        this.data2 = args[3];
        this.controllerType = args[2];
        this.controllerValue = args[3];
        break;
      case 192:
        // program change
        this.data1 = args[2];
        this.programNumber = args[2];
        break;
      case 208:
        // channel pressure
        this.data1 = args[2];
        this.data2 = args[3];
        break;
      case 224:
        // pitch bend
        this.data1 = args[2];
        this.data2 = args[3];
        break;
      case 47:
        break;
      default:
        warn("not a recognized type of midi event!");
    }
  }

  _createClass(MIDIEvent, {
    clone: {
      value: function clone() {
        var event = new MidiEvent();

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var property = _step.value;

            if (property !== "id" && property !== "eventNumber" && property !== "midiNote") {
              event[property] = this[property];
            }
            event.song = undefined;
            event.track = undefined;
            event.trackId = undefined;
            event.part = undefined;
            event.partId = undefined;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return event;
      }
    },
    transpose: {
      value: function transpose(semi) {
        if (this.type !== 128 && this.type !== 144) {
          error("you can only transpose note on and note off events");
          return;
        }

        //console.log('transpose', semi);
        if (typeString(semi) === "array") {
          var type = semi[0];
          if (type === "hertz") {} else if (type === "semi" || type === "semitone") {
            semi = semi[1];
          }
        } else if (isNaN(semi) === true) {
          error("please provide a number");
          return;
        }

        var tmp = this.data1 + parseInt(semi, 10);
        if (tmp < 0) {
          tmp = 0;
        } else if (tmp > 127) {
          tmp = 127;
        }
        this.data1 = tmp;
        var note = createNote(this.data1);
        this.note = note;
        this.noteName = note.fullName;
        this.noteNumber = note.number;
        this.octave = note.octave;
        this.frequency = note.frequency;

        if (this.midiNote !== undefined) {
          this.midiNote.pitch = this.data1;
        }

        if (this.state !== "new") {
          this.state = "changed";
        }
        if (this.part !== undefined) {
          this.part.needsUpdate = true;
        }
      }
    },
    setPitch: {
      value: function setPitch(pitch) {
        if (this.type !== 128 && this.type !== 144) {
          error("you can only set the pitch of note on and note off events");
          return;
        }
        if (typeString(pitch) === "array") {
          var type = pitch[0];
          if (type === "hertz") {} else if (type === "semi" || type === "semitone") {
            pitch = pitch[1];
          }
        } else if (isNaN(pitch) === true) {
          error("please provide a number");
          return;
        }

        this.data1 = parseInt(pitch, 10);
        var note = createNote(this.data1);
        this.note = note;
        this.noteName = note.fullName;
        this.noteNumber = note.number;
        this.octave = note.octave;
        this.frequency = note.frequency;

        if (this.midiNote !== undefined) {
          this.midiNote.pitch = this.data1;
        }
        if (this.state !== "new") {
          this.state = "changed";
        }
        if (this.part !== undefined) {
          this.part.needsUpdate = true;
        }
      }
    },
    move: {
      value: function move(ticks) {
        if (isNaN(ticks)) {
          error("please provide a number");
          return;
        }
        this.ticks += parseInt(ticks, 10);
        if (this.state !== "new") {
          this.state = "changed";
        }
        if (this.part !== undefined) {
          this.part.needsUpdate = true;
        }
      }
    },
    moveTo: {
      value: function moveTo() {
        for (var _len = arguments.length, position = Array(_len), _key = 0; _key < _len; _key++) {
          position[_key] = arguments[_key];
        }

        if (position[0] === "ticks" && isNaN(position[1]) === false) {
          this.ticks = parseInt(position[1], 10);
        } else if (this.song === undefined) {
          console.error("The midi event has not been added to a song yet; you can only move to ticks values");
        } else {
          position = this.song.getPosition(position);
          if (position === false) {
            console.error("wrong position data");
          } else {
            this.ticks = position.ticks;
          }
        }

        if (this.state !== "new") {
          this.state = "changed";
        }
        if (this.part !== undefined) {
          this.part.needsUpdate = true;
        }
      }
    },
    reset: {
      value: function reset(fromPart, fromTrack, fromSong) {

        fromPart = fromPart === undefined ? true : false;
        fromTrack = fromTrack === undefined ? true : false;
        fromSong = fromSong === undefined ? true : false;

        if (fromPart) {
          this.part = undefined;
          this.partId = undefined;
        }
        if (fromTrack) {
          this.track = undefined;
          this.trackId = undefined;
          this.channel = 0;
        }
        if (fromSong) {
          this.song = undefined;
        }
      }
    },
    update: {

      // implemented because of the common interface of midi and audio events

      value: function update() {}
    }
  });

  return MIDIEvent;
})();

function createMIDIEvent() {
  return _applyConstructor(MIDIEvent, _slice.call(arguments));
}

/**
  @public
  @class MidiEvent
  @param time {int} the time that the event is scheduled
  @param type {int} type of MidiEvent, e.g. NOTE_ON, NOTE_OFF or, 144, 128, etc.
  @param data1 {int} if type is 144 or 128: note number
  @param [data2] {int} if type is 144 or 128: velocity
  @param [channel] {int} channel


  @example
  // plays the central c at velocity 100
  let event = sequencer.createMidiEvent(120, sequencer.NOTE_ON, 60, 100);

  // pass arguments as array
  let event = sequencer.createMidiEvent([120, sequencer.NOTE_ON, 60, 100]);

*/

//convert hertz to semi

//convert hertz to pitch

},{"./note.js":"/home/abudaan/workspace/qambi/src/note.js","./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/midi_parse.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = parseMIDIFile;

var createMIDIStream = _interopRequire(require("./midi_stream"));

var lastEventTypeByte = undefined,
    trackName = undefined;

function readChunk(stream) {
  var id = stream.read(4, true);
  var length = stream.readInt32();
  //console.log(length);
  return {
    id: id,
    length: length,
    data: stream.read(length, false)
  };
}

function readEvent(stream) {
  var event = {};
  var length;
  event.deltaTime = stream.readVarInt();
  var eventTypeByte = stream.readInt8();
  //console.log(eventTypeByte, eventTypeByte & 0x80, 146 & 0x0f);
  if ((eventTypeByte & 240) == 240) {
    /* system / meta event */
    if (eventTypeByte == 255) {
      /* meta event */
      event.type = "meta";
      var subtypeByte = stream.readInt8();
      length = stream.readVarInt();
      switch (subtypeByte) {
        case 0:
          event.subtype = "sequenceNumber";
          if (length !== 2) {
            throw "Expected length for sequenceNumber event is 2, got " + length;
          }
          event.number = stream.readInt16();
          return event;
        case 1:
          event.subtype = "text";
          event.text = stream.read(length);
          return event;
        case 2:
          event.subtype = "copyrightNotice";
          event.text = stream.read(length);
          return event;
        case 3:
          event.subtype = "trackName";
          event.text = stream.read(length);
          trackName = event.text;
          return event;
        case 4:
          event.subtype = "instrumentName";
          event.text = stream.read(length);
          return event;
        case 5:
          event.subtype = "lyrics";
          event.text = stream.read(length);
          return event;
        case 6:
          event.subtype = "marker";
          event.text = stream.read(length);
          return event;
        case 7:
          event.subtype = "cuePoint";
          event.text = stream.read(length);
          return event;
        case 32:
          event.subtype = "midiChannelPrefix";
          if (length !== 1) {
            throw "Expected length for midiChannelPrefix event is 1, got " + length;
          }
          event.channel = stream.readInt8();
          return event;
        case 47:
          event.subtype = "endOfTrack";
          if (length !== 0) {
            throw "Expected length for endOfTrack event is 0, got " + length;
          }
          return event;
        case 81:
          event.subtype = "setTempo";
          if (length !== 3) {
            throw "Expected length for setTempo event is 3, got " + length;
          }
          event.microsecondsPerBeat = (stream.readInt8() << 16) + (stream.readInt8() << 8) + stream.readInt8();
          return event;
        case 84:
          event.subtype = "smpteOffset";
          if (length !== 5) {
            throw "Expected length for smpteOffset event is 5, got " + length;
          }
          var hourByte = stream.readInt8();
          event.frameRate = ({
            0: 24, 32: 25, 64: 29, 96: 30
          })[hourByte & 96];
          event.hour = hourByte & 31;
          event.min = stream.readInt8();
          event.sec = stream.readInt8();
          event.frame = stream.readInt8();
          event.subframe = stream.readInt8();
          return event;
        case 88:
          event.subtype = "timeSignature";
          if (length !== 4) {
            throw "Expected length for timeSignature event is 4, got " + length;
          }
          event.numerator = stream.readInt8();
          event.denominator = Math.pow(2, stream.readInt8());
          event.metronome = stream.readInt8();
          event.thirtyseconds = stream.readInt8();
          return event;
        case 89:
          event.subtype = "keySignature";
          if (length !== 2) {
            throw "Expected length for keySignature event is 2, got " + length;
          }
          event.key = stream.readInt8(true);
          event.scale = stream.readInt8();
          return event;
        case 127:
          event.subtype = "sequencerSpecific";
          event.data = stream.read(length);
          return event;
        default:
          //if(sequencer.debug >= 2){
          //    console.warn('Unrecognised meta event subtype: ' + subtypeByte);
          //}
          event.subtype = "unknown";
          event.data = stream.read(length);
          return event;
      }
      event.data = stream.read(length);
      return event;
    } else if (eventTypeByte == 240) {
      event.type = "sysEx";
      length = stream.readVarInt();
      event.data = stream.read(length);
      return event;
    } else if (eventTypeByte == 247) {
      event.type = "dividedSysEx";
      length = stream.readVarInt();
      event.data = stream.read(length);
      return event;
    } else {
      throw "Unrecognised MIDI event type byte: " + eventTypeByte;
    }
  } else {
    /* channel event */
    var param1 = undefined;
    if ((eventTypeByte & 128) === 0) {
      /* running status - reuse lastEventTypeByte as the event type.
        eventTypeByte is actually the first parameter
      */
      //console.log('running status');
      param1 = eventTypeByte;
      eventTypeByte = lastEventTypeByte;
    } else {
      param1 = stream.readInt8();
      //console.log('last', eventTypeByte);
      lastEventTypeByte = eventTypeByte;
    }
    var eventType = eventTypeByte >> 4;
    event.channel = eventTypeByte & 15;
    event.type = "channel";
    switch (eventType) {
      case 8:
        event.subtype = "noteOff";
        event.noteNumber = param1;
        event.velocity = stream.readInt8();
        return event;
      case 9:
        event.noteNumber = param1;
        event.velocity = stream.readInt8();
        if (event.velocity === 0) {
          event.subtype = "noteOff";
        } else {
          event.subtype = "noteOn";
          //console.log('noteOn');
        }
        return event;
      case 10:
        event.subtype = "noteAftertouch";
        event.noteNumber = param1;
        event.amount = stream.readInt8();
        return event;
      case 11:
        event.subtype = "controller";
        event.controllerType = param1;
        event.value = stream.readInt8();
        return event;
      case 12:
        event.subtype = "programChange";
        event.programNumber = param1;
        return event;
      case 13:
        event.subtype = "channelAftertouch";
        event.amount = param1;
        //if(trackName === 'SH-S1-44-C09 L=SML IN=3'){
        //    console.log('channel pressure', trackName, param1);
        //}
        return event;
      case 14:
        event.subtype = "pitchBend";
        event.value = param1 + (stream.readInt8() << 7);
        return event;
      default:
        /*
        throw 'Unrecognised MIDI event type: ' + eventType;
        console.log('Unrecognised MIDI event type: ' + eventType);
        */

        event.value = stream.readInt8();
        event.subtype = "unknown";
        //console.log(event);
        /*
                event.noteNumber = param1;
                event.velocity = stream.readInt8();
                event.subtype = 'noteOn';
                console.log('weirdo', trackName, param1, event.velocity);
        */

        return event;
    }
  }
}

function parseMIDIFile(buffer) {
  var tracks = new Map();
  var stream = createMIDIStream(new Uint8Array(buffer));

  var headerChunk = readChunk(stream);
  if (headerChunk.id !== "MThd" || headerChunk.length !== 6) {
    throw "Bad .mid file - header not found";
  }

  var headerStream = createMIDIStream(headerChunk.data);
  var formatType = headerStream.readInt16();
  var trackCount = headerStream.readInt16();
  var timeDivision = headerStream.readInt16();

  if (timeDivision & 32768) {
    throw "Expressing time division in SMTPE frames is not supported yet";
  }

  var header = {
    formatType: formatType,
    trackCount: trackCount,
    ticksPerBeat: timeDivision
  };

  for (var i = 0; i < trackCount; i++) {
    trackName = "track_" + i;
    var track = [];
    var trackChunk = readChunk(stream);
    if (trackChunk.id !== "MTrk") {
      throw "Unexpected chunk - expected MTrk, got " + trackChunk.id;
    }
    var trackStream = createMIDIStream(trackChunk.data);
    while (!trackStream.eof()) {
      var _event = readEvent(trackStream);
      track.push(_event);
    }
    tracks.set(trackName, track);
  }

  return {
    header: header,
    tracks: tracks
  };
}

/*
  Extracts all midi events from a binary midi file, uses midi_stream.js

  based on: https://github.com/gasman/jasmid
*/

},{"./midi_stream":"/home/abudaan/workspace/qambi/src/midi_stream.js"}],"/home/abudaan/workspace/qambi/src/midi_stream.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = createMIDIStream;

var fcc = String.fromCharCode;

var MIDIStream = (function () {

  // buffer is Uint8Array

  function MIDIStream(buffer) {
    _classCallCheck(this, MIDIStream);

    this.buffer = buffer;
    this.position = 0;
  }

  _createClass(MIDIStream, {
    read: {

      /* read string or any number of bytes */

      value: function read(length) {
        var toString = arguments[1] === undefined ? true : arguments[1];

        var result = undefined;

        if (toString) {
          result = "";
          for (var i = 0; i < length; i++, this.position++) {
            result += fcc(this.buffer[this.position]);
          }
          return result;
        } else {
          result = [];
          for (var i = 0; i < length; i++, this.position++) {
            result.push(this.buffer[this.position]);
          }
          return result;
        }
      }
    },
    readInt32: {

      /* read a big-endian 32-bit integer */

      value: function readInt32() {
        var result = (this.buffer[this.position] << 24) + (this.buffer[this.position + 1] << 16) + (this.buffer[this.position + 2] << 8) + this.buffer[this.position + 3];
        this.position += 4;
        return result;
      }
    },
    readInt16: {

      /* read a big-endian 16-bit integer */

      value: function readInt16() {
        var result = (this.buffer[this.position] << 8) + this.buffer[this.position + 1];
        this.position += 2;
        return result;
      }
    },
    readInt8: {

      /* read an 8-bit integer */

      value: function readInt8(signed) {
        var result = this.buffer[this.position];
        if (signed && result > 127) {
          result -= 256;
        }
        this.position += 1;
        return result;
      }
    },
    eof: {
      value: function eof() {
        return this.position >= this.buffer.length;
      }
    },
    readVarInt: {

      /* read a MIDI-style letiable-length integer
        (big-endian value in groups of 7 bits,
        with top bit set to signify that another byte follows)
      */

      value: function readVarInt() {
        var result = 0;
        while (true) {
          var b = this.readInt8();
          if (b & 128) {
            result += b & 127;
            result <<= 7;
          } else {
            /* b is the last byte */
            return result + b;
          }
        }
      }
    }
  });

  return MIDIStream;
})();

function createMIDIStream(buffer) {
  return new MIDIStream(buffer);
}

/*
  Wrapper for accessing bytes through sequential reads

  based on: https://github.com/gasman/jasmid
  adapted to work with ArrayBuffer -> Uint8Array
*/

},{}],"/home/abudaan/workspace/qambi/src/note.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
  arguments
  - noteNumber: 60
  - noteNumber and notename mode: 60, 'sharp'
  - noteName: 'C#4'
  - name and octave: 'C#', 4
  - note name, octave, note name mode: 'D', 4, 'sharp'
  - data object:
    {
      name: 'C',
      octave: 4
    }
    or
    {
      frequency: 234.16
    }
*/

exports.createNote = createNote;
exports.getNoteNumber = getNoteNumber;
exports.getNoteName = getNoteName;
exports.getNoteOctave = getNoteOctave;
exports.getFullNoteName = getFullNoteName;
exports.getFrequency = getFrequency;
exports.isBlackKey = isBlackKey;

var getConfig = _interopRequire(require("./config"));

var _util = require("./util");

var log = _util.log;
var info = _util.info;
var warn = _util.warn;
var error = _util.error;
var typeString = _util.typeString;

var errorMsg = undefined,
    warningMsg = undefined,
    config = getConfig(),
    pow = Math.pow,
    floor = Math.floor;

var noteNames = {
  sharp: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  flat: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
  "enharmonic-sharp": ["B#", "C#", "C##", "D#", "D##", "E#", "F#", "F##", "G#", "G##", "A#", "A##"],
  "enharmonic-flat": ["Dbb", "Db", "Ebb", "Eb", "Fb", "Gbb", "Gb", "Abb", "Ab", "Bbb", "Bb", "Cb"]
};
function createNote() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var numArgs = args.length,
      data = undefined,
      octave = undefined,
      noteName = undefined,
      noteNumber = undefined,
      noteNameMode = undefined,
      arg0 = args[0],
      arg1 = args[1],
      arg2 = args[2],
      type0 = typeString(arg0),
      type1 = typeString(arg1),
      type2 = typeString(arg2);

  errorMsg = "";
  warningMsg = "";

  // argument: note number
  if (numArgs === 1 && type0 === "number") {
    if (arg0 < 0 || arg0 > 127) {
      errorMsg = "please provide a note number >= 0 and <= 127 " + arg0;
    } else {
      noteNumber = arg0;
      data = _getNoteName(noteNumber);
      noteName = data[0];
      octave = data[1];
    }

    // arguments: full note name
  } else if (numArgs === 1 && type0 === "string") {
    data = _checkNoteName(arg0);
    if (errorMsg === "") {
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName, octave);
    }

    // arguments: note name, octave
  } else if (numArgs === 2 && type0 === "string" && type1 === "number") {
    data = _checkNoteName(arg0, arg1);
    if (errorMsg === "") {
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName, octave);
    }

    // arguments: full note name, note name mode -> for converting between note name modes
  } else if (numArgs === 2 && type0 === "string" && type1 === "string") {
    data = _checkNoteName(arg0);
    if (errorMsg === "") {
      noteNameMode = _checkNoteNameMode(arg1);
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName, octave);
    }

    // arguments: note number, note name mode
  } else if (numArgs === 2 && typeString(arg0) === "number" && typeString(arg1) === "string") {
    if (arg0 < 0 || arg0 > 127) {
      errorMsg = "please provide a note number >= 0 and <= 127 " + arg0;
    } else {
      noteNameMode = _checkNoteNameMode(arg1);
      noteNumber = arg0;
      data = _getNoteName(noteNumber, noteNameMode);
      noteName = data[0];
      octave = data[1];
    }

    // arguments: note name, octave, note name mode
  } else if (numArgs === 3 && type0 === "string" && type1 === "number" && type2 === "string") {
    data = _checkNoteName(arg0, arg1);
    if (errorMsg === "") {
      noteNameMode = _checkNoteNameMode(arg2);
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName, octave);
    }
  } else {
    errorMsg = "wrong arguments, please consult documentation";
  }

  if (errorMsg) {
    error(errorMsg);
    return false;
  }

  if (warningMsg) {
    warn(warningMsg);
  }

  var note = {
    name: noteName,
    octave: octave,
    fullName: noteName + octave,
    number: noteNumber,
    frequency: _getFrequency(noteNumber),
    blackKey: _isBlackKey(noteNumber)
  };
  Object.freeze(note);
  return note;
}

function _getNoteName(number) {
  var mode = arguments[1] === undefined ? config.get("noteNameMode") : arguments[1];

  //let octave = Math.floor((number / 12) - 2), // → in Cubase central C = C3 instead of C4
  var octave = floor(number / 12 - 1);
  var noteName = noteNames[mode][number % 12];
  return [noteName, octave];
}

function _getNoteNumber(name, octave) {
  var keys = Object.keys(noteNames);
  var index = undefined;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      var mode = noteNames[key];
      index = mode.findIndex(function (x) {
        return x === name;
      });
      if (index !== -1) {
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"]) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  //number = (index + 12) + (octave * 12) + 12; // → in Cubase central C = C3 instead of C4
  var number = index + 12 + octave * 12; // → midi standard + scientific naming, see: http://en.wikipedia.org/wiki/Middle_C and http://en.wikipedia.org/wiki/Scientific_pitch_notation

  if (number < 0 || number > 127) {
    errorMsg = "please provide a note between C0 and G10";
    return;
  }
  return number;
}

function _getFrequency(number) {
  return config.get("pitch") * pow(2, (number - 69) / 12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
}

// TODO: calculate note from frequency
function _getPitch(hertz) {}

function _checkNoteNameMode(mode) {
  var keys = Object.keys(noteNames);
  var result = keys.find(function (x) {
    return x === mode;
  }) !== undefined;
  if (result === false) {
    mode = config.get("noteNameMode");
    warningMsg = mode + " is not a valid note name mode, using \"" + mode + "\" instead";
  }
  return mode;
}

function _checkNoteName() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var numArgs = args.length,
      arg0 = args[0],
      arg1 = args[1],
      char = undefined,
      name = "",
      octave = "";

  // extract octave from note name
  if (numArgs === 1) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = arg0[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        char = _step.value;

        if (isNaN(char) && char !== "-") {
          name += char;
        } else {
          octave += char;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"]) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (octave === "") {
      octave = 0;
    }
  } else if (numArgs === 2) {
    name = arg0;
    octave = arg1;
  }

  // check if note name is valid
  var keys = Object.keys(noteNames);
  var index = -1;

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var key = _step2.value;

      var mode = noteNames[key];
      index = mode.findIndex(function (x) {
        return x === name;
      });
      if (index !== -1) {
        break;
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  if (index === -1) {
    errorMsg = arg0 + " is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb, followed by a number for the octave";
    return;
  }

  if (octave < -1 || octave > 9) {
    errorMsg = "please provide an octave between -1 and 9";
    return;
  }

  octave = parseInt(octave, 10);
  name = name.substring(0, 1).toUpperCase() + name.substring(1);

  //console.log(name,'|',octave);
  return [name, octave];
}

function _isBlackKey(noteNumber) {
  var black = undefined;

  switch (true) {
    case noteNumber % 12 === 1: //C#
    case noteNumber % 12 === 3: //D#
    case noteNumber % 12 === 6: //F#
    case noteNumber % 12 === 8: //G#
    case noteNumber % 12 === 10:
      //A#
      black = true;
      break;
    default:
      black = false;
  }

  return black;
}

function getNoteNumber() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.number;
  }
  return errorMsg;
}

function getNoteName() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.name;
  }
  return false;
}

function getNoteOctave() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.octave;
  }
  return false;
}

function getFullNoteName() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.fullName;
  }
  return false;
}

function getFrequency() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.frequency;
  }
  return false;
}

function isBlackKey() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.blackKey;
  }
  return false;
}

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
  Adds a function to create a note object that contains information about a musical note:
    - name, e.g. 'C'
    - octave,  -1 - 9
    - fullName: 'C1'
    - frequency: 234.16, based on the basic pitch
    - number: 60 midi note number

  Adds several utility methods organised around the note object
*/

//fm  =  2(m−69)/12(440 Hz).

},{"./config":"/home/abudaan/workspace/qambi/src/config.js","./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/part.js":[function(require,module,exports){
"use strict";

var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

var _slice = Array.prototype.slice;

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = createPart;

var partId = 0;

var Part = function Part() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  _classCallCheck(this, Part);

  var id = "P" + partId++ + Date.now();
};

function createPart() {
  return _applyConstructor(Part, _slice.call(arguments));
}

},{}],"/home/abudaan/workspace/qambi/src/song.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = createSong;

var _song_add_eventlistener = require("./song_add_eventlistener");

var addEventListener = _song_add_eventlistener.addEventListener;
var removeEventListener = _song_add_eventlistener.removeEventListener;
var dispatchEvent = _song_add_eventlistener.dispatchEvent;

var _util = require("./util");

var log = _util.log;
var info = _util.info;
var warn = _util.warn;
var error = _util.error;
var typeString = _util.typeString;

var getConfig = _interopRequire(require("./config"));

var createMidiEvent = _interopRequire(require("./midi_event"));

var _init_midi = require("./init_midi");

var initMidiSong = _init_midi.initMidiSong;
var setMidiInputSong = _init_midi.setMidiInputSong;
var setMidiOutputSong = _init_midi.setMidiOutputSong;

var songId = 0,
    config = getConfig(),
    defaultSong = config.get("defaultSong");

var Song = (function () {

  /*
    @param settings is a Map or an Object
  */

  function Song(settings) {
    _classCallCheck(this, Song);

    this.id = "S" + songId++ + Date.now();
    this.name = this.id;
    this.tracks = new Map();
    this.parts = new Map();
    this.events = []; // all midi and audio events
    this.allEvents = []; //
    this.timeEvents = []; // all tempo and time signature events

    // first add all settings from the default song
    ///*
    defaultSong.forEach(function (value, key) {
      this[key] = value;
    }, this);
    //*/
    /*
        // or:
        for(let[value, key] of defaultSong.entries()){
          ((key, value) => {
            this[key] = value;
          })(key, value);
        }
    */

    // then override settings by provided settings
    if (typeString(settings) === "object") {
      Object.keys(settings).forEach(function (key) {
        this[key] = settings[key];
      }, this);
    } else if (settings !== undefined) {
      settings.forEach(function (value, key) {
        this[key] = value;
      }, this);
    }

    // initialize midi for this song: add Maps for midi in- and outputs, and add eventlisteners to the midi inputs
    this.midiInputs = new Map();
    this.midiOutputs = new Map();
    initMidiSong(this); // @see: init_midi.js

    this.lastBar = this.bars;
    this.pitchRange = this.highestNote - this.lowestNote + 1;
    this.factor = 4 / this.denominator;
    this.ticksPerBeat = this.ppq * this.factor;
    this.ticksPerBar = this.ticksPerBeat * this.nominator;
    this.millisPerTick = 60000 / this.bpm / this.ppq;
    this.recordId = -1;
    this.doLoop = false;
    this.illegalLoop = true;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.loopDuration = 0;
    this.audioRecordingLatency = 0;
    this.grid = undefined;

    config.get("activeSongs")[this.id] = this;

    //console.log(this);
    /*
        if(settings.timeEvents && settings.timeEvents.length > 0){
          this.timeEvents = [].concat(settings.timeEvents);
    
          this.tempoEvent = getTimeEvents(sequencer.TEMPO, this)[0];
          this.timeSignatureEvent = getTimeEvents(sequencer.TIME_SIGNATURE, this)[0];
    
          if(this.tempoEvent === undefined){
            this.tempoEvent = createMidiEvent(0, sequencer.TEMPO, this.bpm);
            this.timeEvents.unshift(this.tempoEvent);
          }else{
            this.bpm = this.tempoEvent.bpm;
          }
          if(this.timeSignatureEvent === undefined){
            this.timeSignatureEvent = createMidiEvent(0, sequencer.TIME_SIGNATURE, this.nominator, this.denominator);
            this.timeEvents.unshift(this.timeSignatureEvent);
          }else{
            this.nominator = this.timeSignatureEvent.nominator;
            this.denominator = this.timeSignatureEvent.denominator;
          }
          //console.log(1, this.nominator, this.denominator, this.bpm);
        }else{
          // there has to be a tempo and time signature event at ticks 0, otherwise the position can't be calculated, and moreover, it is dictated by the MIDI standard
          this.tempoEvent = createMidiEvent(0, sequencer.TEMPO, this.bpm);
          this.timeSignatureEvent = createMidiEvent(0, sequencer.TIME_SIGNATURE, this.nominator, this.denominator);
          this.timeEvents = [
            this.tempoEvent,
            this.timeSignatureEvent
          ];
        }
    
        // TODO: A value for bpm, nominator and denominator in the config overrules the time events specified in the config -> maybe this should be the other way round
    
        // if a value for bpm is set in the config, and this value is different from the bpm value of the first
        // tempo event, all tempo events will be updated to the bpm value in the config.
        if(config.timeEvents !== undefined && config.bpm !== undefined){
          if(this.bpm !== config.bpm){
            this.setTempo(config.bpm, false);
          }
        }
    
        // if a value for nominator and/or denominator is set in the config, and this/these value(s) is/are different from the values
        // of the first time signature event, all time signature events will be updated to the values in the config.
        // @TODO: maybe only the first time signature event should be updated?
        if(config.timeEvents !== undefined && (config.nominator !== undefined || config.denominator !== undefined)){
          if(this.nominator !== config.nominator || this.denominator !== config.denominator){
            this.setTimeSignature(config.nominator || this.nominator, config.denominator || this.denominator, false);
          }
        }
    
        //console.log(2, this.nominator, this.denominator, this.bpm);
    
        this.tracks = [];
        this.parts = [];
        this.notes = [];
        this.events = [];//.concat(this.timeEvents);
        this.allEvents = []; // all events plus metronome ticks
    
        this.tracksById = {};
        this.tracksByName = {};
        this.partsById = {};
        this.notesById = {};
        this.eventsById = {};
    
        this.activeEvents = null;
        this.activeNotes = null;
        this.activeParts = null;
    
        this.recordedNotes = [];
        this.recordedEvents = [];
        this.recordingNotes = {}; // notes that don't have their note off events yet
    
        this.numTracks = 0;
        this.numParts = 0;
        this.numNotes = 0;
        this.numEvents = 0;
        this.instruments = [];
    
        this.playing = false;
        this.paused = false;
        this.stopped = true;
        this.recording = false;
        this.prerolling = false;
        this.precounting = false;
        this.preroll = true;
        this.precount = 0;
        this.listeners = {};
    
        this.playhead = createPlayhead(this, this.positionType, this.id, this);//, this.position);
        this.playheadRecording = createPlayhead(this, 'all', this.id + '_recording');
        this.scheduler = createScheduler(this);
        this.followEvent = createFollowEvent(this);
    
        this.volume = 1;
        this.gainNode = context.createGainNode();
        this.gainNode.gain.value = this.volume;
        this.metronome = createMetronome(this, dispatchEvent);
        this.connect();
    
    
        if(config.className === 'MidiFile' && config.loaded === false){
          if(sequencer.debug){
            console.warn('midifile', config.name, 'has not yet been loaded!');
          }
        }
    
        //if(config.tracks && config.tracks.length > 0){
        if(config.tracks){
          this.addTracks(config.tracks);
        }
    
        if(config.parts){
          this.addParts(config.parts);
        }
    
        if(config.events){
          this.addEvents(config.events);
        }
    
        if(config.events || config.parts || config.tracks){
          //console.log(config.events, config.parts, config.tracks)
          // the length of the song will be determined by the events, parts and/or tracks that are added to the song
          if(config.bars === undefined){
            this.lastBar = 0;
          }
          this.lastEvent = createMidiEvent([this.lastBar, sequencer.END_OF_TRACK]);
        }else{
          this.lastEvent = createMidiEvent([this.bars * this.ticksPerBar, sequencer.END_OF_TRACK]);
        }
        //console.log('update');
        this.update(true);
    
        this.numTimeEvents = this.timeEvents.length;
        this.playhead.set('ticks', 0);
        this.midiEventListeners = {};
        //console.log(this.timeEvents);
    
    */
  }

  _createClass(Song, {
    stop: {
      value: function stop() {
        dispatchEvent("stop");
      }
    },
    play: {
      value: function play() {
        dispatchEvent("play");
      }
    },
    setMidiInput: {
      value: function setMidiInput(id) {
        var flag = arguments[1] === undefined ? true : arguments[1];

        setMidiInputSong(this, id, flag);
      }
    },
    setMidiOutput: {
      value: function setMidiOutput(id) {
        var flag = arguments[1] === undefined ? true : arguments[1];

        setMidiOutputSong(this, id, flag);
      }
    },
    addMidiEventListener: {
      value: (function (_addMidiEventListener) {
        var _addMidiEventListenerWrapper = function addMidiEventListener(_x) {
          return _addMidiEventListener.apply(this, arguments);
        };

        _addMidiEventListenerWrapper.toString = function () {
          return _addMidiEventListener.toString();
        };

        return _addMidiEventListenerWrapper;
      })(function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        addMidiEventListener.apply(undefined, [this].concat(args));
      })
    }
  });

  return Song;
})();

Song.prototype.addEventListener = addEventListener;
Song.prototype.removeEventListener = removeEventListener;
Song.prototype.dispatchEvent = dispatchEvent;

function createSong(settings) {
  return new Song(settings);
}

},{"./config":"/home/abudaan/workspace/qambi/src/config.js","./init_midi":"/home/abudaan/workspace/qambi/src/init_midi.js","./midi_event":"/home/abudaan/workspace/qambi/src/midi_event.js","./song_add_eventlistener":"/home/abudaan/workspace/qambi/src/song_add_eventlistener.js","./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/song_add_eventlistener.js":[function(require,module,exports){
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

},{}],"/home/abudaan/workspace/qambi/src/song_from_midifile.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = createSongFromMIDIFile;

var _utilJs = require("./util.js");

var log = _utilJs.log;
var info = _utilJs.info;
var warn = _utilJs.warn;
var error = _utilJs.error;
var base64ToBinary = _utilJs.base64ToBinary;
var ajax = _utilJs.ajax;

var parseMIDIFile = _interopRequire(require("./midi_parse"));

var createMIDIEvent = _interopRequire(require("./midi_event"));

var createPart = _interopRequire(require("./part"));

var createTrack = _interopRequire(require("./track"));

var createSong = _interopRequire(require("./song"));

function createSongFromMIDIFile(config) {
  var buffer = undefined;

  if (config.arraybuffer !== undefined) {
    buffer = new Uint8Array(config.arraybuffer);
    return toSong(parseMIDIFile(buffer));
  } else if (config.base64 !== undefined) {
    buffer = new Uint8Array(base64ToBinary(config.base64));
    return toSong(parseMIDIFile(buffer));
  } else if (config.parsed !== undefined) {
    return toSong(config.parsed);
    /*
      }else if(config.url !== undefined){
        ajax({url: config.url, responseType: 'arraybuffer'}).then(
          function onFulfilled(data){
            buffer = new Uint8Array(data);
            return toSong(parseMIDIFile(buffer));
          },
          function onRejected(e){
            error(e);
          }
        );
    */
  }
}

function toSong(parsed) {
  var tracks = parsed.tracks;
  var ppq = parsed.header.ticksPerBeat;
  var timeEvents = [];
  var config = {
    tracks: []
  };
  var events = undefined;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tracks.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var track = _step.value;

      var lastTicks = undefined,
          lastType = undefined;
      var ticks = 0;
      var type = undefined;
      var channel = -1;
      events = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = track[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _event = _step2.value;

          ticks += _event.deltaTime * ppq;
          //console.log(event.subtype, event.deltaTime, tmpTicks);

          if (channel === -1 && _event.channel !== undefined) {
            channel = _event.channel;
            track.channel = channel;
          }
          type = _event.subtype;

          switch (_event.subtype) {

            case "trackName":
              track.name = _event.text;
              //console.log('name', track.name, numTracks);
              break;

            case "instrumentName":
              if (_event.text) {
                track.instrumentName = _event.text;
              }
              break;

            case "noteOn":
              events.push(createMIDIEvent(ticks, 144, _event.noteNumber, _event.velocity));
              break;

            case "noteOff":
              events.push(createMIDIEvent(ticks, 128, _event.noteNumber, _event.velocity));
              break;

            case "setTempo":
              // sometimes 2 tempo events have the same position in ticks
              // we use the last in these cases (same as Cubase)
              var bpm = 60000000 / _event.microsecondsPerBeat;

              if (ticks === lastTicks && type === lastType) {
                info("tempo events on the same tick", ticks, bpm);
                timeEvents.pop();
              }

              if (config.bpm === undefined) {
                config.bpm = bpm;
              }
              timeEvents.push(createMIDIEvent(ticks, 81, bpm));
              break;

            case "timeSignature":
              // sometimes 2 time signature events have the same position in ticks
              // we use the last in these cases (same as Cubase)
              if (lastTicks === ticks && lastType === type) {
                info("time signature events on the same tick", ticks, _event.numerator, _event.denominator);
                timeEvents.pop();
              }

              if (config.nominator === undefined) {
                config.nominator = _event.numerator;
                config.denominator = _event.denominator;
              }
              timeEvents.push(createMIDIEvent(ticks, 88, _event.numerator, _event.denominator));
              break;

            case "controller":
              events.push(createMIDIEvent(ticks, 176, _event.controllerType, _event.value));
              break;

            case "programChange":
              events.push(createMIDIEvent(ticks, 192, _event.programNumber));
              break;

            case "pitchBend":
              events.push(createMIDIEvent(ticks, 224, _event.value));
              break;

            default:
            //console.log(track.name, event.type);
          }

          lastType = type;
          lastTicks = ticks;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (parsed.length > 0) {
        var _track = createTrack();
        var part = createPart();
        _track.addPart(part);
        part.addEvents(parsed);
        config.tracks.push(_track);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"]) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  config.ppq = ppq;
  config.timeEvents = timeEvents;
  var song = createSong(config);
  song.timeEvents = timeEvents;

  song.eventsMidiAudioMetronome = parsed;

  //return createSong(config);
}

},{"./midi_event":"/home/abudaan/workspace/qambi/src/midi_event.js","./midi_parse":"/home/abudaan/workspace/qambi/src/midi_parse.js","./part":"/home/abudaan/workspace/qambi/src/part.js","./song":"/home/abudaan/workspace/qambi/src/song.js","./track":"/home/abudaan/workspace/qambi/src/track.js","./util.js":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/track.js":[function(require,module,exports){
"use strict";

var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

var _slice = Array.prototype.slice;

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

module.exports = createTrack;

var trackId = 0;

var Track = function Track() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  _classCallCheck(this, Track);

  var id = "P" + trackId++ + Date.now();
};

function createTrack() {
  return _applyConstructor(Track, _slice.call(arguments));
}

/*
let Track = {
    init: function(){
        let id = 'T' + trackId++ + new Date().getTime();
        Object.defineProperty(this, 'id', {
            value: id
        });
    }
};

export default function createTrack(){
  var t = Object.create(Track);
  t.init(arguments);
  return t;
}

*/

},{}],"/home/abudaan/workspace/qambi/src/util.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slice = Array.prototype.slice;
exports.typeString = typeString;
exports.ajax = ajax;
exports.parseSamples = parseSamples;
exports.error = error;
exports.warn = warn;
exports.info = info;
exports.log = log;
exports.getNiceTime = getNiceTime;

var getConfig = _interopRequire(require("./config"));

var console = window.console,
    mPow = Math.pow,
    mRound = Math.round,
    mFloor = Math.floor,
    mRandom = Math.random,
    config = getConfig();
// context = config.context,
// floor = function(value){
//  return value | 0;
// },

var noteLengthNames = {
  1: "quarter",
  2: "eighth",
  4: "sixteenth",
  8: "32th",
  16: "64th"
};

function typeString(o) {
  if (typeof o != "object") {
    return typeof o;
  }

  if (o === null) {
    return "null";
  }

  //object, array, function, date, regexp, string, number, boolean, error
  var internalClass = Object.prototype.toString.call(o).match(/\[object\s(\w+)\]/)[1];
  return internalClass.toLowerCase();
}

function ajax(config) {
  var request = new XMLHttpRequest(),
      method = config.method === undefined ? "GET" : config.method,
      fileSize = undefined;

  function executor(resolve, reject) {

    reject = reject || function () {};
    resolve = resolve || function () {};

    request.onload = function () {
      if (request.status !== 200) {
        reject(request.status);
        return;
      }

      if (config.responseType === "json") {
        fileSize = request.response.length;
        resolve(JSON.parse(request.response), fileSize);
        request = null;
      } else {
        resolve(request.response);
        request = null;
      }
    };

    request.onerror = function (e) {
      config.onError(e);
    };

    request.open(method, config.url, true);

    if (config.overrideMimeType) {
      request.overrideMimeType(config.overrideMimeType);
    }

    if (config.responseType) {
      if (config.responseType === "json") {
        request.responseType = "text";
      } else {
        request.responseType = config.responseType;
      }
    }

    if (method === "POST") {
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }

    if (config.data) {
      request.send(config.data);
    } else {
      request.send();
    }
  }

  return new Promise(executor);
}

function parseSample(sample, id, every) {
  return new Promise(function (resolve, reject) {
    try {
      config.context.decodeAudioData(sample, function onSuccess(buffer) {
        //console.log(id, buffer);
        if (id !== undefined) {
          resolve({ id: id, buffer: buffer });
          if (every) {
            every({ id: id, buffer: buffer });
          }
        } else {
          resolve(buffer);
          if (every) {
            every(buffer);
          }
        }
      }, function onError(e) {
        //console.log('error decoding audiodata', id, e);
        //reject(e); // don't use reject because we use this as a nested promise and we don't want the parent promise to reject
        if (id !== undefined) {
          resolve({ id: id, buffer: undefined });
        } else {
          resolve(undefined);
        }
      });
    } catch (e) {
      //console.log('error decoding audiodata', id, e);
      //reject(e);
      if (id !== undefined) {
        resolve({ id: id, buffer: undefined });
      } else {
        resolve(undefined);
      }
    }
  });
}

function loadAndParseSample(url, id, every) {
  return new Promise(function executor(resolve, reject) {
    ajax({ url: url, responseType: "arraybuffer" }).then(function onFulfilled(data) {
      parseSample(data, id, every).then(resolve, reject);
    }, function onRejected() {
      if (id !== undefined) {
        resolve({ id: id, buffer: undefined });
      } else {
        resolve(undefined);
      }
    });
  });
}

function parseSamples(mapping, every) {
  var key = undefined,
      sample = undefined,
      promises = [],
      type = typeString(mapping);

  every = typeString(every) === "function" ? every : false;
  //console.log(type, mapping)
  if (type === "object") {
    for (key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        sample = mapping[key];
        if (sample.indexOf("http://") === -1) {
          promises.push(parseSample(base64ToBinary(sample), key, every));
        } else {
          promises.push(loadAndParseSample(sample, key, every));
        }
      }
    }
  } else if (type === "array") {
    mapping.forEach(function (sample) {
      if (sample.indexOf("http://") === -1) {
        promises.push(parseSample(base64ToBinary(sample), every));
      } else {
        promises.push(loadAndParseSample(sample, every));
      }
    });
  }

  return new Promise(function (resolve, reject) {
    Promise.all(promises).then(function onFulfilled(values) {
      if (type === "object") {
        (function () {
          var mapping = {};
          values.forEach(function (value) {
            mapping[value.id] = value.buffer;
          });
          //console.log(mapping);
          resolve(mapping);
        })();
      } else if (type === "array") {
        resolve(values);
      }
    }, function onRejected(e) {
      reject(e);
    });
  });
}

// adapted version of https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js
function base64ToBinary(input) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      bytes = undefined,
      uarray = undefined,
      buffer = undefined,
      lkey1 = undefined,
      lkey2 = undefined,
      chr1 = undefined,
      chr2 = undefined,
      chr3 = undefined,
      enc1 = undefined,
      enc2 = undefined,
      enc3 = undefined,
      enc4 = undefined,
      i = undefined,
      j = 0;

  bytes = Math.ceil(3 * input.length / 4);
  buffer = new ArrayBuffer(bytes);
  uarray = new Uint8Array(buffer);

  lkey1 = keyStr.indexOf(input.charAt(input.length - 1));
  lkey2 = keyStr.indexOf(input.charAt(input.length - 1));
  if (lkey1 == 64) bytes--; //padding chars, so skip
  if (lkey2 == 64) bytes--; //padding chars, so skip

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

  for (i = 0; i < bytes; i += 3) {
    //get the 3 octects in 4 ascii chars
    enc1 = keyStr.indexOf(input.charAt(j++));
    enc2 = keyStr.indexOf(input.charAt(j++));
    enc3 = keyStr.indexOf(input.charAt(j++));
    enc4 = keyStr.indexOf(input.charAt(j++));

    chr1 = enc1 << 2 | enc2 >> 4;
    chr2 = (enc2 & 15) << 4 | enc3 >> 2;
    chr3 = (enc3 & 3) << 6 | enc4;

    uarray[i] = chr1;
    if (enc3 != 64) uarray[i + 1] = chr2;
    if (enc4 != 64) uarray[i + 2] = chr3;
  }
  //console.log(buffer);
  return buffer;
}

function error() {
  if (config.get("debugLevel") >= 1) {
    console.error.apply(console, arguments);
    //console.trace();
  }
}

function warn() {
  if (config.get("debugLevel") >= 2) {
    //console.warn(...arguments);
    console.trace.apply(console, ["WARNING"].concat(_slice.call(arguments)));
  }
}

function info() {
  if (config.get("debugLevel") >= 3) {
    //console.info(...arguments);
    console.trace.apply(console, ["INFO"].concat(_slice.call(arguments)));
  }
}

function log() {
  if (config.get("debugLevel") >= 4) {
    //console.log(...arguments);
    console.trace.apply(console, ["LOG"].concat(_slice.call(arguments)));
  }
}

function getNiceTime(millis) {
  var h = undefined,
      m = undefined,
      s = undefined,
      ms = undefined,
      seconds = undefined,
      timeAsString = "";

  seconds = millis / 1000; // → millis to seconds
  h = mFloor(seconds / (60 * 60));
  m = mFloor(seconds % (60 * 60) / 60);
  s = mFloor(seconds % 60);
  ms = mRound((seconds - h * 3600 - m * 60 - s) * 1000);

  timeAsString += h + ":";
  timeAsString += m < 10 ? "0" + m : m;
  timeAsString += ":";
  timeAsString += s < 10 ? "0" + s : s;
  timeAsString += ":";
  timeAsString += ms === 0 ? "000" : ms < 10 ? "00" + ms : ms < 100 ? "0" + ms : ms;

  //console.log(h, m, s, ms);
  return {
    hour: h,
    minute: m,
    second: s,
    millisecond: ms,
    timeAsString: timeAsString,
    timeAsArray: [h, m, s, ms]
  };
}

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
  An unorganised collection of various utility functions that are used across the library
*/

},{"./config":"/home/abudaan/workspace/qambi/src/config.js"}],"/home/abudaan/workspace/qambi/test/main.js":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var ajax = require("../src/util").ajax;

var parseMIDIFile = _interopRequire(require("../src/midi_parse"));

var createSongFromMIDIFile = _interopRequire(require("../src/song_from_midifile"));

window.onload = function () {
  /*
    ajax({url:'../data/JN-3-44.mid', responseType: 'arraybuffer'}).then(
      function onFulfilled(data){
        //console.log(data);
        let result = parseMIDIFile(data);
        console.log(result);
      },
  
      function onRejected(e){
        console.error(e);
      }
    );
  */

  ajax({ url: "../data/JN-3-44.mid", responseType: "arraybuffer" }).then(function onFulfilled(data) {
    //console.log(data);
    var song = createSongFromMIDIFile({ arraybuffer: data });
    console.log(song);
  }, function onRejected(e) {
    console.error(e);
  });
};

},{"../src/midi_parse":"/home/abudaan/workspace/qambi/src/midi_parse.js","../src/song_from_midifile":"/home/abudaan/workspace/qambi/src/song_from_midifile.js","../src/util":"/home/abudaan/workspace/qambi/src/util.js"}]},{},["/home/abudaan/workspace/qambi/test/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvY29uZmlnLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL2luaXRfbWlkaS5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9taWRpX2V2ZW50LmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL21pZGlfcGFyc2UuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvbWlkaV9zdHJlYW0uanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvbm90ZS5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9wYXJ0LmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3NvbmcuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvc29uZ19hZGRfZXZlbnRsaXN0ZW5lci5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9zb25nX2Zyb21fbWlkaWZpbGUuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvdHJhY2suanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvdXRpbC5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3Rlc3QvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDTUEsSUFDRSxNQUFNLFlBQUE7SUFDTixXQUFXLFlBQUE7SUFDWCxFQUFFLEdBQUcsSUFBSTtJQUNULEVBQUUsR0FBRyxTQUFTO0lBQ2QsT0FBTyxHQUFHLElBQUksQ0FBQzs7QUFHakIsU0FBUyxTQUFTLEdBQUU7QUFDbEIsTUFBRyxNQUFNLEtBQUssU0FBUyxF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QUUsQ0FBQztBQUNULGVBQVcsRUFBRSxFQUFFO0FBQ2YsZ0JBQVksRUFBRSxZQUFZO0FBQzFCLGVBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztHQUM3QixDQUFDO0NBQ0g7Ozs7Ozs7Ozs7Ozs7O0lDdlRPLElBQUksV0FBTyxhQUFhLEVBQXhCLElBQUk7O0lBQ0wsYUFBYSwyQkFBTSxtQkFBbUI7O0lBQ3RDLHNCQUFzQiwyQkFBTSwyQkFBMkI7O0FBRTlELE1BQU0sQ0FBQyxNQUFNLEdBQUcsWUFBVzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0J6QixNQUFJLENBQUMsRUFBQyxHQUFHLEVBQUMscUJBQXFCLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUNqRSxTQUFTLFdBQVcsQ0FBQyxJQUFJLEVBQUM7O0FBRXhCLFFBQUksSUFBSSxHQUFHLHNCQUFzQixDQUFDLEVBQUMsV0FBVyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7QUFDdEQsV0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNuQixFQUVELFNBQVMsVUFBVSxDQUFDLENBQUMsRUFBQztBQUNwQixXQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ2xCLENBQ0YsQ0FBQztDQUNILENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAgQ3JlYXRlcyB0aGUgY29uZmlnIG9iamVjdCB0aGF0IGlzIHVzZWQgZm9yIGludGVybmFsbHkgc2hhcmluZyBzZXR0aW5ncywgaW5mb3JtYXRpb24gYW5kIHRoZSBzdGF0ZS4gT3RoZXIgbW9kdWxlcyBtYXkgYWRkIGtleXMgdG8gdGhpcyBvYmplY3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmxldFxuICBjb25maWcsXG4gIGRlZmF1bHRTb25nLFxuICB1YSA9ICdOQScsXG4gIG9zID0gJ3Vua25vd24nLFxuICBicm93c2VyID0gJ05BJztcblxuXG5mdW5jdGlvbiBnZXRDb25maWcoKXtcbiAgaWYoY29uZmlnICE9PSB1bmRlZmluZWQpe1xuICAgIHJldHVybiBjb25maWc7XG4gIH1cblxuICBjb25maWcgPSBuZXcgTWFwKCk7XG4gIGNvbmZpZy5zZXQoJ2xlZ2FjeScsIGZhbHNlKTsgLy8gdHJ1ZSBpZiB0aGUgYnJvd3NlciB1c2VzIGFuIG9sZGVyIHZlcnNpb24gb2YgdGhlIFdlYkF1ZGlvIEFQSSwgc291cmNlLm5vdGVPbigpIGFuZCBzb3VyY2Uubm90ZU9mZiBpbnN0ZWFkIG9mIHNvdXJjZS5zdGFydCgpIGFuZCBzb3VyY2Uuc3RvcCgpXG4gIGNvbmZpZy5zZXQoJ21pZGknLCBmYWxzZSk7IC8vIHRydWUgaWYgdGhlIGJyb3dzZXIgaGFzIE1JREkgc3VwcG9ydCBlaXRoZXIgdmlhIFdlYk1JREkgb3IgSmF6elxuICBjb25maWcuc2V0KCd3ZWJtaWRpJywgZmFsc2UpOyAvLyB0cnVlIGlmIHRoZSBicm93c2VyIGhhcyBXZWJNSURJXG4gIGNvbmZpZy5zZXQoJ3dlYmF1ZGlvJywgdHJ1ZSk7IC8vIHRydWUgaWYgdGhlIGJyb3dzZXIgaGFzIFdlYkF1ZGlvXG4gIGNvbmZpZy5zZXQoJ2phenonLCBmYWxzZSk7IC8vIHRydWUgaWYgdGhlIGJyb3dzZXIgaGFzIHRoZSBKYXp6IHBsdWdpblxuICBjb25maWcuc2V0KCdvZ2cnLCBmYWxzZSk7IC8vIHRydWUgaWYgV2ViQXVkaW8gc3VwcG9ydHMgb2dnXG4gIGNvbmZpZy5zZXQoJ21wMycsIGZhbHNlKTsgLy8gdHJ1ZSBpZiBXZWJBdWRpbyBzdXBwb3J0cyBtcDNcbiAgY29uZmlnLnNldCgnYml0cmF0ZV9tcDNfZW5jb2RpbmcnLCAxMjgpOyAvLyBkZWZhdWx0IGJpdHJhdGUgZm9yIGF1ZGlvIHJlY29yZGluZ3NcbiAgY29uZmlnLnNldCgnZGVidWdMZXZlbCcsIDQpOyAvLyAwID0gb2ZmLCAxID0gZXJyb3IsIDIgPSB3YXJuLCAzID0gaW5mbywgNCA9IGxvZ1xuICBjb25maWcuc2V0KCdwaXRjaCcsIDQ0MCk7IC8vIGJhc2ljIHBpdGNoIHRoYXQgaXMgdXNlZCB3aGVuIGdlbmVyYXRpbmcgc2FtcGxlc1xuICBjb25maWcuc2V0KCdidWZmZXJUaW1lJywgMzUwLzEwMDApOyAvLyB0aW1lIGluIHNlY29uZHMgdGhhdCBldmVudHMgYXJlIHNjaGVkdWxlZCBhaGVhZFxuICBjb25maWcuc2V0KCdhdXRvQWRqdXN0QnVmZmVyVGltZScsIGZhbHNlKTtcbiAgY29uZmlnLnNldCgnbm90ZU5hbWVNb2RlJywgJ3NoYXJwJyk7XG4gIGNvbmZpZy5zZXQoJ21pbmltYWxTb25nTGVuZ3RoJywgNjAwMDApOyAvL21pbGxpc1xuICBjb25maWcuc2V0KCdwYXVzZU9uQmx1cicsIGZhbHNlKTsgLy8gcGF1c2UgdGhlIEF1ZGlvQ29udGV4dCB3aGVuIHBhZ2Ugb3IgdGFiIGxvb3NlcyBmb2N1c1xuICBjb25maWcuc2V0KCdyZXN0YXJ0T25Gb2N1cycsIHRydWUpOyAvLyBpZiBzb25nIHdhcyBwbGF5aW5nIGF0IHRoZSB0aW1lIHRoZSBwYWdlIG9yIHRhYiBsb3N0IGZvY3VzLCBpdCB3aWxsIHN0YXJ0IHBsYXlpbmcgYXV0b21hdGljYWxseSBhcyBzb29uIGFzIHRoZSBwYWdlL3RhYiBnZXRzIGZvY3VzIGFnYWluXG4gIGNvbmZpZy5zZXQoJ2RlZmF1bHRQUFEnLCA5NjApO1xuICBjb25maWcuc2V0KCdvdmVycnVsZVBQUScsIHRydWUpO1xuICBjb25maWcuc2V0KCdwcmVjaXNpb24nLCAzKTsgLy8gbWVhbnMgZmxvYXQgd2l0aCBwcmVjaXNpb24gMywgZS5nLiAxMC40MzdcbiAgY29uZmlnLnNldCgnYWN0aXZlU29uZ3MnLCB7fSk7Ly8gdGhlIHNvbmdzIGN1cnJlbnRseSBsb2FkZWQgaW4gbWVtb3J5XG5cblxuICBkZWZhdWx0U29uZyA9IG5ldyBNYXAoKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdicG0nLCAxMjApO1xuICBkZWZhdWx0U29uZy5zZXQoJ3BwcScsIGNvbmZpZy5nZXQoJ2RlZmF1bHRQUFEnKSk7XG4gIGRlZmF1bHRTb25nLnNldCgnYmFycycsIDMwKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdsb3dlc3ROb3RlJywgMCk7XG4gIGRlZmF1bHRTb25nLnNldCgnaGlnaGVzdE5vdGUnLCAxMjcpO1xuICBkZWZhdWx0U29uZy5zZXQoJ25vbWluYXRvcicsIDQpO1xuICBkZWZhdWx0U29uZy5zZXQoJ2Rlbm9taW5hdG9yJywgNCk7XG4gIGRlZmF1bHRTb25nLnNldCgncXVhbnRpemVWYWx1ZScsIDgpO1xuICBkZWZhdWx0U29uZy5zZXQoJ2ZpeGVkTGVuZ3RoVmFsdWUnLCBmYWxzZSk7XG4gIGRlZmF1bHRTb25nLnNldCgncG9zaXRpb25UeXBlJywgJ2FsbCcpO1xuICBkZWZhdWx0U29uZy5zZXQoJ3VzZU1ldHJvbm9tZScsIGZhbHNlKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdhdXRvU2l6ZScsIHRydWUpO1xuICBkZWZhdWx0U29uZy5zZXQoJ2xvb3AnLCBmYWxzZSk7XG4gIGRlZmF1bHRTb25nLnNldCgncGxheWJhY2tTcGVlZCcsIDEpO1xuICBkZWZhdWx0U29uZy5zZXQoJ2F1dG9RdWFudGl6ZScsIGZhbHNlKTtcbiAgY29uZmlnLnNldCgnZGVmYXVsdFNvbmcnLCBkZWZhdWx0U29uZyk7XG5cblxuICAvLyBnZXQgYnJvd3NlciBhbmQgb3NcbiAgaWYobmF2aWdhdG9yICE9PSB1bmRlZmluZWQpe1xuICAgIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcblxuICAgIGlmKHVhLm1hdGNoKC8oaVBhZHxpUGhvbmV8aVBvZCkvZykpe1xuICAgICAgb3MgPSAnaW9zJztcbiAgICB9ZWxzZSBpZih1YS5pbmRleE9mKCdBbmRyb2lkJykgIT09IC0xKXtcbiAgICAgIG9zID0gJ2FuZHJvaWQnO1xuICAgIH1lbHNlIGlmKHVhLmluZGV4T2YoJ0xpbnV4JykgIT09IC0xKXtcbiAgICAgICBvcyA9ICdsaW51eCc7XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignTWFjaW50b3NoJykgIT09IC0xKXtcbiAgICAgICBvcyA9ICdvc3gnO1xuICAgIH1lbHNlIGlmKHVhLmluZGV4T2YoJ1dpbmRvd3MnKSAhPT0gLTEpe1xuICAgICAgIG9zID0gJ3dpbmRvd3MnO1xuICAgIH1cblxuICAgIGlmKHVhLmluZGV4T2YoJ0Nocm9tZScpICE9PSAtMSl7XG4gICAgICAvLyBjaHJvbWUsIGNocm9taXVtIGFuZCBjYW5hcnlcbiAgICAgIGJyb3dzZXIgPSAnY2hyb21lJztcblxuICAgICAgaWYodWEuaW5kZXhPZignT1BSJykgIT09IC0xKXtcbiAgICAgICAgYnJvd3NlciA9ICdvcGVyYSc7XG4gICAgICB9ZWxzZSBpZih1YS5pbmRleE9mKCdDaHJvbWl1bScpICE9PSAtMSl7XG4gICAgICAgIGJyb3dzZXIgPSAnY2hyb21pdW0nO1xuICAgICAgfVxuICAgIH1lbHNlIGlmKHVhLmluZGV4T2YoJ1NhZmFyaScpICE9PSAtMSl7XG4gICAgICBicm93c2VyID0gJ3NhZmFyaSc7XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignRmlyZWZveCcpICE9PSAtMSl7XG4gICAgICBicm93c2VyID0gJ2ZpcmVmb3gnO1xuICAgIH1lbHNlIGlmKHVhLmluZGV4T2YoJ1RyaWRlbnQnKSAhPT0gLTEpe1xuICAgICAgYnJvd3NlciA9ICdJbnRlcm5ldCBFeHBsb3Jlcic7XG4gICAgfVxuXG4gICAgaWYob3MgPT09ICdpb3MnKXtcbiAgICAgIGlmKHVhLmluZGV4T2YoJ0NyaU9TJykgIT09IC0xKXtcbiAgICAgICAgYnJvd3NlciA9ICdjaHJvbWUnO1xuICAgICAgfVxuICAgIH1cbiAgfWVsc2V7XG4gICAgLy8gVE9ETzogY2hlY2sgb3MgaGVyZSB3aXRoIE5vZGVqcycgcmVxdWlyZSgnb3MnKVxuICB9XG4gIGNvbmZpZy5zZXQoJ3VhJywgdWEpO1xuICBjb25maWcuc2V0KCdvcycsIG9zKTtcbiAgY29uZmlnLnNldCgnYnJvd3NlcicsIGJyb3dzZXIpO1xuXG4gIC8vIGNoZWNrIGlmIHdlIGhhdmUgYW4gYXVkaW8gY29udGV4dFxuICB3aW5kb3cuQXVkaW9Db250ZXh0ID0gKFxuICAgIHdpbmRvdy5BdWRpb0NvbnRleHQgfHxcbiAgICB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8XG4gICAgd2luZG93Lm9BdWRpb0NvbnRleHQgfHxcbiAgICB3aW5kb3cubXNBdWRpb0NvbnRleHRcbiAgKTtcbiAgY29uZmlnLnNldCgnYXVkaW9fY29udGV4dCcsIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgIT09IHVuZGVmaW5lZCk7XG4gIGNvbmZpZy5zZXQoJ3JlY29yZF9hdWRpbycsIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgIT09IHVuZGVmaW5lZCk7XG5cblxuICAvLyBjaGVjayBpZiBhdWRpbyBjYW4gYmUgcmVjb3JkZWRcbiAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IChcbiAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8XG4gICAgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHxcbiAgICBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWFcbiAgKTtcbiAgY29uZmlnLnNldCgnYXVkaW9fY29udGV4dCcsIHdpbmRvdy5BdWRpb0NvbnRleHQgIT09IHVuZGVmaW5lZCk7XG5cblxuICAvLyBubyB3ZWJhdWRpbywgcmV0dXJuXG4gIGlmKGNvbmZpZy5nZXQoJ2F1ZGlvX2NvbnRleHQnKSA9PT0gZmFsc2Upe1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGNoZWNrIGZvciBvdGhlciAnbW9kZXJuJyBBUEknc1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICB3aW5kb3cuQmxvYiA9IHdpbmRvdy5CbG9iIHx8IHdpbmRvdy53ZWJraXRCbG9iIHx8IHdpbmRvdy5tb3pCbG9iO1xuICAvL2NvbnNvbGUubG9nKCdpT1MnLCBvcywgY29udGV4dCwgd2luZG93LkJsb2IsIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpO1xuXG4gIHJldHVybiBjb25maWc7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgZ2V0Q29uZmlnOyIsIi8qXG4gIFJlcXVlc3RzIE1JREkgYWNjZXNzLCBxdWVyaWVzIGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgYW5kIHN0b3JlcyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5cbmltcG9ydCB7bG9nLCBpbmZvLCB3YXJuLCBlcnJvciwgdHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJztcbmltcG9ydCBNaWRpRXZlbnQgZnJvbSAnLi9taWRpX2V2ZW50JztcblxuXG5sZXQgZGF0YSA9IHt9O1xubGV0IGlucHV0cyA9IG5ldyBNYXAoKTtcbmxldCBvdXRwdXRzID0gbmV3IE1hcCgpO1xuXG5sZXQgc29uZ01pZGlFdmVudExpc3RlbmVyO1xubGV0IG1pZGlFdmVudExpc3RlbmVySWQgPSAwO1xuXG5mdW5jdGlvbiBpbml0TWlkaSgpe1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3Qpe1xuXG4gICAgbGV0IHRtcDtcblxuICAgIGlmKG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyAhPT0gdW5kZWZpbmVkKXtcblxuICAgICAgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzKCkudGhlbihcblxuICAgICAgICBmdW5jdGlvbiBvbkZ1bEZpbGxlZChtaWRpKXtcbiAgICAgICAgICBpZihtaWRpLl9qYXp6SW5zdGFuY2VzICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgZGF0YS5qYXp6ID0gbWlkaS5famF6ekluc3RhbmNlc1swXS5fSmF6ei52ZXJzaW9uO1xuICAgICAgICAgICAgZGF0YS5taWRpID0gdHJ1ZTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGRhdGEud2VibWlkaSA9IHRydWU7XG4gICAgICAgICAgICBkYXRhLm1pZGkgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIG9sZCBpbXBsZW1lbnRhdGlvbiBvZiBXZWJNSURJXG4gICAgICAgICAgaWYodHlwZW9mIG1pZGkuaW5wdXRzLnZhbHVlcyAhPT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgICAgICByZWplY3QoJ1lvdSBicm93c2VyIGlzIHVzaW5nIGFuIG9sZCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgV2ViTUlESSBBUEksIHBsZWFzZSB1cGRhdGUgeW91ciBicm93c2VyLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuXG4gICAgICAgICAgLy8gZ2V0IGlucHV0c1xuICAgICAgICAgIHRtcCA9IEFycmF5LmZyb20obWlkaS5pbnB1dHMudmFsdWVzKCkpO1xuXG4gICAgICAgICAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gICAgICAgICAgdG1wLnNvcnQoKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xKTtcblxuICAgICAgICAgIGZvcihsZXQgcG9ydCBvZiB0bXApe1xuICAgICAgICAgICAgaW5wdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICAgICAgICB9XG5cblxuICAgICAgICAgIC8vIGdldCBvdXRwdXRzXG4gICAgICAgICAgdG1wID0gQXJyYXkuZnJvbShtaWRpLm91dHB1dHMudmFsdWVzKCkpO1xuXG4gICAgICAgICAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gICAgICAgICAgdG1wLnNvcnQoKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xKTtcblxuICAgICAgICAgIGZvcihsZXQgcG9ydCBvZiB0bXApe1xuICAgICAgICAgICAgb3V0cHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gICAgICAgICAgfVxuXG5cbiAgICAgICAgICAvLyBvbmNvbm5lY3QgYW5kIG9uZGlzY29ubmVjdCBhcmUgbm90IHlldCBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgYW5kIENocm9taXVtXG4gICAgICAgICAgbWlkaS5hZGRFdmVudExpc3RlbmVyKCdvbmNvbm5lY3QnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGxvZygnZGV2aWNlIGNvbm5lY3RlZCcsIGUpO1xuICAgICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICAgIG1pZGkuYWRkRXZlbnRMaXN0ZW5lcignb25kaXNjb25uZWN0JywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBsb2coJ2RldmljZSBkaXNjb25uZWN0ZWQnLCBlKTtcbiAgICAgICAgICB9LCBmYWxzZSk7XG5cblxuICAgICAgICAgIC8vIGV4cG9ydFxuICAgICAgICAgIGRhdGEuaW5wdXRzID0gaW5wdXRzO1xuICAgICAgICAgIGRhdGEub3V0cHV0cyA9IG91dHB1dHM7XG5cbiAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KGUpe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSByZXF1ZXN0aW5nIE1JRElBY2Nlc3MnKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAvLyBicm93c2VycyB3aXRob3V0IFdlYk1JREkgQVBJXG4gICAgfWVsc2V7XG4gICAgICBkYXRhLm1pZGkgPSBmYWxzZTtcbiAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgfVxuICB9KTtcbn1cblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0TWlkaVNvbmcoc29uZyl7XG5cbiAgc29uZ01pZGlFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgLy9jb25zb2xlLmxvZyhlKTtcbiAgICBoYW5kbGVNaWRpTWVzc2FnZVNvbmcoc29uZywgZSwgdGhpcyk7XG4gIH07XG5cbiAgLy8gYnkgZGVmYXVsdCBhIHNvbmcgbGlzdGVucyB0byBhbGwgYXZhaWxhYmxlIG1pZGktaW4gcG9ydHNcbiAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgcG9ydC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG5cbiAgb3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcbn1cblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpSW5wdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IGlucHV0ID0gaW5wdXRzLmdldChpZCk7XG5cbiAgaWYoaW5wdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBpbnB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlJbnB1dHMuZGVsZXRlKGlkKTtcbiAgICBpbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1lbHNle1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQoaWQsIGlucHV0KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpSW5wdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaU91dHB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgb3V0cHV0ID0gb3V0cHV0cy5nZXQoaWQpO1xuXG4gIGlmKG91dHB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIG91dHB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLmRlbGV0ZShpZCk7XG4gICAgbGV0IHRpbWUgPSBzb25nLnNjaGVkdWxlci5sYXN0RXZlbnRUaW1lICsgMTAwO1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZSk7IC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lKTsgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gIH1lbHNle1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KGlkLCBvdXRwdXQpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaU91dHB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBtaWRpTWVzc2FnZUV2ZW50LCBpbnB1dCl7XG4gIGxldCBtaWRpRXZlbnQgPSBuZXcgTWlkaUV2ZW50KHNvbmcudGlja3MsIC4uLm1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIC8vY29uc29sZS5sb2codHJhY2subWlkaUlucHV0cywgaW5wdXQpO1xuICAgIC8qXG4gICAgaWYobWlkaUV2ZW50LmNoYW5uZWwgPT09IHRyYWNrLmNoYW5uZWwgfHwgdHJhY2suY2hhbm5lbCA9PT0gMCB8fCB0cmFjay5jaGFubmVsID09PSAnYW55Jyl7XG4gICAgICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2spO1xuICAgIH1cbiAgICAqL1xuICAgIC8vIGxpa2UgaW4gQ3ViYXNlLCBtaWRpIGV2ZW50cyBmcm9tIGFsbCBkZXZpY2VzLCBzZW50IG9uIGFueSBtaWRpIGNoYW5uZWwgYXJlIGZvcndhcmRlZCB0byBhbGwgdHJhY2tzXG4gICAgLy8gc2V0IHRyYWNrLm1vbml0b3IgdG8gZmFsc2UgaWYgeW91IGRvbid0IHdhbnQgdG8gcmVjZWl2ZSBtaWRpIGV2ZW50cyBvbiBhIGNlcnRhaW4gdHJhY2tcbiAgICAvLyBub3RlIHRoYXQgdHJhY2subW9uaXRvciBpcyBieSBkZWZhdWx0IHNldCB0byBmYWxzZSBhbmQgdGhhdCB0cmFjay5tb25pdG9yIGlzIGF1dG9tYXRpY2FsbHkgc2V0IHRvIHRydWVcbiAgICAvLyBpZiB5b3UgYXJlIHJlY29yZGluZyBvbiB0aGF0IHRyYWNrXG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5tb25pdG9yLCB0cmFjay5pZCwgaW5wdXQuaWQpO1xuICAgIGlmKHRyYWNrLm1vbml0b3IgPT09IHRydWUgJiYgdHJhY2subWlkaUlucHV0cy5nZXQoaW5wdXQuaWQpICE9PSB1bmRlZmluZWQpe1xuICAgICAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrLCBpbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgbGV0IGxpc3RlbmVycyA9IHNvbmcubWlkaUV2ZW50TGlzdGVuZXJzLmdldChtaWRpRXZlbnQudHlwZSk7XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBmb3IobGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycyl7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9XG4gIH1cbn1cblxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sodHJhY2ssIG1pZGlFdmVudCwgaW5wdXQpe1xuICBsZXQgc29uZyA9IHRyYWNrLnNvbmcsXG4gICAgbm90ZSwgbGlzdGVuZXJzLCBjaGFubmVsO1xuICAgIC8vZGF0YSA9IG1pZGlNZXNzYWdlRXZlbnQuZGF0YSxcbiAgICAvL21pZGlFdmVudCA9IGNyZWF0ZU1pZGlFdmVudChzb25nLnRpY2tzLCBkYXRhWzBdLCBkYXRhWzFdLCBkYXRhWzJdKTtcblxuICAvL21pZGlFdmVudC5zb3VyY2UgPSBtaWRpTWVzc2FnZUV2ZW50LnNyY0VsZW1lbnQubmFtZTtcbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50KVxuICAvL2NvbnNvbGUubG9nKCctLS0tPicsIG1pZGlFdmVudC50eXBlKTtcblxuICAvLyBhZGQgdGhlIGV4YWN0IHRpbWUgb2YgdGhpcyBldmVudCBzbyB3ZSBjYW4gY2FsY3VsYXRlIGl0cyB0aWNrcyBwb3NpdGlvblxuICBtaWRpRXZlbnQucmVjb3JkTWlsbGlzID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7IC8vIG1pbGxpc1xuICBtaWRpRXZlbnQuc3RhdGUgPSAncmVjb3JkZWQnO1xuXG4gIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgIG5vdGUgPSBjcmVhdGVNaWRpTm90ZShtaWRpRXZlbnQpO1xuICAgIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV0gPSBub3RlO1xuICAgIC8vdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXSA9IG5vdGU7XG4gIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjgpe1xuICAgIG5vdGUgPSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vIGNoZWNrIGlmIHRoZSBub3RlIGV4aXN0czogaWYgdGhlIHVzZXIgcGxheXMgbm90ZXMgb24gaGVyIGtleWJvYXJkIGJlZm9yZSB0aGUgbWlkaSBzeXN0ZW0gaGFzXG4gICAgLy8gYmVlbiBmdWxseSBpbml0aWFsaXplZCwgaXQgY2FuIGhhcHBlbiB0aGF0IHRoZSBmaXJzdCBpbmNvbWluZyBtaWRpIGV2ZW50IGlzIGEgTk9URSBPRkYgZXZlbnRcbiAgICBpZihub3RlID09PSB1bmRlZmluZWQpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KTtcbiAgICBkZWxldGUgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvL2RlbGV0ZSB0cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdO1xuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhzb25nLnByZXJvbGwsIHNvbmcucmVjb3JkaW5nLCB0cmFjay5yZWNvcmRFbmFibGVkKTtcblxuICBpZigoc29uZy5wcmVyb2xsaW5nIHx8IHNvbmcucmVjb3JkaW5nKSAmJiB0cmFjay5yZWNvcmRFbmFibGVkID09PSAnbWlkaScpe1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgICAgdHJhY2suc29uZy5yZWNvcmRlZE5vdGVzLnB1c2gobm90ZSk7XG4gICAgfVxuICAgIHRyYWNrLnJlY29yZFBhcnQuYWRkRXZlbnQobWlkaUV2ZW50KTtcbiAgICAvLyBzb25nLnJlY29yZGVkRXZlbnRzIGlzIHVzZWQgaW4gdGhlIGtleSBlZGl0b3JcbiAgICB0cmFjay5zb25nLnJlY29yZGVkRXZlbnRzLnB1c2gobWlkaUV2ZW50KTtcbiAgfWVsc2UgaWYodHJhY2suZW5hYmxlUmV0cm9zcGVjdGl2ZVJlY29yZGluZyl7XG4gICAgdHJhY2sucmV0cm9zcGVjdGl2ZVJlY29yZGluZy5wdXNoKG1pZGlFdmVudCk7XG4gIH1cblxuICAvLyBjYWxsIGFsbCBtaWRpIGV2ZW50IGxpc3RlbmVyc1xuICBsaXN0ZW5lcnMgPSB0cmFjay5taWRpRXZlbnRMaXN0ZW5lcnNbbWlkaUV2ZW50LnR5cGVdO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgb2JqZWN0Rm9yRWFjaChsaXN0ZW5lcnMsIGZ1bmN0aW9uKGxpc3RlbmVyKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhbm5lbCA9IHRyYWNrLmNoYW5uZWw7XG4gIGlmKGNoYW5uZWwgPT09ICdhbnknIHx8IGNoYW5uZWwgPT09IHVuZGVmaW5lZCB8fCBpc05hTihjaGFubmVsKSA9PT0gdHJ1ZSl7XG4gICAgY2hhbm5lbCA9IDA7XG4gIH1cblxuICBvYmplY3RGb3JFYWNoKHRyYWNrLm1pZGlPdXRwdXRzLCBmdW5jdGlvbihvdXRwdXQpe1xuICAgIC8vY29uc29sZS5sb2coJ21pZGkgb3V0Jywgb3V0cHV0LCBtaWRpRXZlbnQudHlwZSk7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTQ0IHx8IG1pZGlFdmVudC50eXBlID09PSAxNzYpe1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTIpO1xuICAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICAgIC8vIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxOTIpe1xuICAgIC8vICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTFdKTtcbiAgICB9XG4gICAgLy9vdXRwdXQuc2VuZChbbWlkaUV2ZW50LnN0YXR1cyArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gIH0pO1xuXG4gIC8vIEBUT0RPOiBtYXliZSBhIHRyYWNrIHNob3VsZCBiZSBhYmxlIHRvIHNlbmQgaXRzIGV2ZW50IHRvIGJvdGggYSBtaWRpLW91dCBwb3J0IGFuZCBhbiBpbnRlcm5hbCBoZWFydGJlYXQgc29uZz9cbiAgLy9jb25zb2xlLmxvZyh0cmFjay5yb3V0ZVRvTWlkaU91dCk7XG4gIGlmKHRyYWNrLnJvdXRlVG9NaWRpT3V0ID09PSBmYWxzZSl7XG4gICAgbWlkaUV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgdHJhY2suaW5zdHJ1bWVudC5wcm9jZXNzRXZlbnQobWlkaUV2ZW50KTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGFkZE1pZGlFdmVudExpc3RlbmVyKC4uLmFyZ3MpeyAvLyBjYWxsZXIgY2FuIGJlIGEgdHJhY2sgb3IgYSBzb25nXG5cbiAgbGV0IGlkID0gbWlkaUV2ZW50TGlzdGVuZXJJZCsrO1xuICBsZXQgbGlzdGVuZXI7XG4gICAgdHlwZXMgPSB7fSxcbiAgICBpZHMgPSBbXSxcbiAgICBsb29wO1xuXG5cbiAgLy8gc2hvdWxkIEkgaW5saW5lIHRoaXM/XG4gIGxvb3AgPSBmdW5jdGlvbihhcmdzKXtcbiAgICBmb3IobGV0IGFyZyBvZiBhcmdzKXtcbiAgICAgIGxldCB0eXBlID0gdHlwZVN0cmluZyhhcmcpO1xuICAgICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICAgIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICBsb29wKGFyZyk7XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgbGlzdGVuZXIgPSBhcmc7XG4gICAgICB9ZWxzZSBpZihpc05hTihhcmcpID09PSBmYWxzZSl7XG4gICAgICAgIGFyZyA9IHBhcnNlSW50KGFyZywgMTApO1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICBhcmcgPSBzZXF1ZW5jZXIubWlkaUV2ZW50TnVtYmVyQnlOYW1lKGFyZyk7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBsb29wKGFyZ3MsIDAsIGFyZ3MubGVuZ3RoKTtcbiAgLy9jb25zb2xlLmxvZygndHlwZXMnLCB0eXBlcywgJ2xpc3RlbmVyJywgbGlzdGVuZXIpO1xuXG4gIG9iamVjdEZvckVhY2godHlwZXMsIGZ1bmN0aW9uKHR5cGUpe1xuICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgaWYob2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPSB7fTtcbiAgICB9XG4gICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF0gPSBsaXN0ZW5lcjtcbiAgICBpZHMucHVzaCh0eXBlICsgJ18nICsgaWQpO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKG9iai5taWRpRXZlbnRMaXN0ZW5lcnMpO1xuICByZXR1cm4gaWRzLmxlbmd0aCA9PT0gMSA/IGlkc1swXSA6IGlkcztcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcihpZCwgb2JqKXtcbiAgdmFyIHR5cGU7XG4gIGlkID0gaWQuc3BsaXQoJ18nKTtcbiAgdHlwZSA9IGlkWzBdO1xuICBpZCA9IGlkWzFdO1xuICBkZWxldGUgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF07XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXJzKCl7XG5cbn1cblxuXG5cbmV4cG9ydCBkZWZhdWx0IGluaXRNaWRpOyIsIi8qKlxuICBAcHVibGljXG4gIEBjbGFzcyBNaWRpRXZlbnRcbiAgQHBhcmFtIHRpbWUge2ludH0gdGhlIHRpbWUgdGhhdCB0aGUgZXZlbnQgaXMgc2NoZWR1bGVkXG4gIEBwYXJhbSB0eXBlIHtpbnR9IHR5cGUgb2YgTWlkaUV2ZW50LCBlLmcuIE5PVEVfT04sIE5PVEVfT0ZGIG9yLCAxNDQsIDEyOCwgZXRjLlxuICBAcGFyYW0gZGF0YTEge2ludH0gaWYgdHlwZSBpcyAxNDQgb3IgMTI4OiBub3RlIG51bWJlclxuICBAcGFyYW0gW2RhdGEyXSB7aW50fSBpZiB0eXBlIGlzIDE0NCBvciAxMjg6IHZlbG9jaXR5XG4gIEBwYXJhbSBbY2hhbm5lbF0ge2ludH0gY2hhbm5lbFxuXG5cbiAgQGV4YW1wbGVcbiAgLy8gcGxheXMgdGhlIGNlbnRyYWwgYyBhdCB2ZWxvY2l0eSAxMDBcbiAgbGV0IGV2ZW50ID0gc2VxdWVuY2VyLmNyZWF0ZU1pZGlFdmVudCgxMjAsIHNlcXVlbmNlci5OT1RFX09OLCA2MCwgMTAwKTtcblxuICAvLyBwYXNzIGFyZ3VtZW50cyBhcyBhcnJheVxuICBsZXQgZXZlbnQgPSBzZXF1ZW5jZXIuY3JlYXRlTWlkaUV2ZW50KFsxMjAsIHNlcXVlbmNlci5OT1RFX09OLCA2MCwgMTAwXSk7XG5cbiovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG5cbmltcG9ydCB7bG9nLCBpbmZvLCB3YXJuLCBlcnJvciwgdHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7Y3JlYXRlTm90ZX0gZnJvbSAnLi9ub3RlLmpzJztcblxuXG5sZXRcbiAgbWlkaUV2ZW50SWQgPSAwO1xuXG5cbi8qXG4gIGFyZ3VtZW50czpcbiAgIC0gW3RpY2tzLCB0eXBlLCBkYXRhMSwgZGF0YTIsIGNoYW5uZWxdXG4gICAtIHRpY2tzLCB0eXBlLCBkYXRhMSwgZGF0YTIsIGNoYW5uZWxcblxuICBkYXRhMiBhbmQgY2hhbm5lbCBhcmUgb3B0aW9uYWwgYnV0IG11c3QgYmUgbnVtYmVycyBpZiBwcm92aWRlZFxuKi9cblxuY2xhc3MgTUlESUV2ZW50e1xuICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICBsZXQgbm90ZTtcblxuICAgIHRoaXMuaWQgPSAnTScgKyBtaWRpRXZlbnRJZCsrICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdGhpcy5ldmVudE51bWJlciA9IG1pZGlFdmVudElkO1xuICAgIHRoaXMudGltZSA9IDA7XG4gICAgdGhpcy5tdXRlZCA9IGZhbHNlO1xuXG5cbiAgICBpZihhcmdzID09PSB1bmRlZmluZWQgfHwgYXJncy5sZW5ndGggPT09IDApe1xuICAgICAgLy8gYnlwYXNzIGNvbnRydWN0b3IgZm9yIGNsb25pbmdcbiAgICAgIHJldHVybjtcbiAgICB9ZWxzZSBpZih0eXBlU3RyaW5nKGFyZ3NbMF0pID09PSAnbWlkaW1lc3NhZ2VldmVudCcpe1xuICAgICAgaW5mbygnbWlkaW1lc3NhZ2VldmVudCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1lbHNlIGlmKHR5cGVTdHJpbmcoYXJnc1swXSkgPT09ICdhcnJheScpe1xuICAgICAgLy8gc3VwcG9ydCBmb3IgdW4tc3ByZWFkZWQgcGFyYW1ldGVyc1xuICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICBpZih0eXBlU3RyaW5nKGFyZ3NbMF0pID09PSAnYXJyYXknKXtcbiAgICAgICAgLy8gc3VwcG9ydCBmb3IgcGFzc2luZyBwYXJhbWV0ZXJzIGluIGFuIGFycmF5XG4gICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbihkYXRhLCBpKXtcbiAgICAgIGlmKGlzTmFOKGRhdGEpICYmIGkgPCA1KXtcbiAgICAgICAgZXJyb3IoJ3BsZWFzZSBwcm92aWRlIG51bWJlcnMgZm9yIHRpY2tzLCB0eXBlLCBkYXRhMSBhbmQgb3B0aW9uYWxseSBmb3IgZGF0YTIgYW5kIGNoYW5uZWwnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMudGlja3MgPSBhcmdzWzBdO1xuICAgIHRoaXMuc3RhdHVzID0gYXJnc1sxXTtcbiAgICB0aGlzLnR5cGUgPSAodGhpcy5zdGF0dXMgPj4gNCkgKiAxNjtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMudHlwZSwgdGhpcy5zdGF0dXMpO1xuICAgIGlmKHRoaXMudHlwZSA+PSAweDgwICYmIHRoaXMudHlwZSA8PSAweEUwKXtcbiAgICAgIC8vdGhlIGhpZ2hlciA0IGJpdHMgb2YgdGhlIHN0YXR1cyBieXRlIGlzIHRoZSBjb21tYW5kXG4gICAgICB0aGlzLmNvbW1hbmQgPSB0aGlzLnR5cGU7XG4gICAgICAvL3RoZSBsb3dlciA0IGJpdHMgb2YgdGhlIHN0YXR1cyBieXRlIGlzIHRoZSBjaGFubmVsIG51bWJlclxuICAgICAgdGhpcy5jaGFubmVsID0gKHRoaXMuc3RhdHVzICYgMHhGKSArIDE7IC8vIGZyb20gemVyby1iYXNlZCB0byAxLWJhc2VkXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnR5cGUgPSB0aGlzLnN0YXR1cztcbiAgICAgIHRoaXMuY2hhbm5lbCA9IGFyZ3NbNF0gfHwgMTtcbiAgICB9XG5cbiAgICB0aGlzLnNvcnRJbmRleCA9IHRoaXMudHlwZSArIHRoaXMudGlja3M7IC8vIG5vdGUgb2ZmIGV2ZW50cyBjb21lIGJlZm9yZSBub3RlIG9uIGV2ZW50c1xuXG4gICAgc3dpdGNoKHRoaXMudHlwZSl7XG4gICAgICBjYXNlIDB4MDpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4ODA6XG4gICAgICAgIHRoaXMuZGF0YTEgPSBhcmdzWzJdO1xuICAgICAgICBub3RlID0gY3JlYXRlTm90ZSh0aGlzLmRhdGExKTtcbiAgICAgICAgdGhpcy5ub3RlID0gbm90ZTtcbiAgICAgICAgdGhpcy5ub3RlTmFtZSA9IG5vdGUuZnVsbE5hbWU7XG4gICAgICAgIHRoaXMubm90ZU51bWJlciA9IG5vdGUubnVtYmVyO1xuICAgICAgICB0aGlzLm9jdGF2ZSA9IG5vdGUub2N0YXZlO1xuICAgICAgICB0aGlzLmZyZXF1ZW5jeSA9IG5vdGUuZnJlcXVlbmN5O1xuICAgICAgICB0aGlzLmRhdGEyID0gMDsvL2RhdGFbM107XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB0aGlzLmRhdGEyO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHg5MDpcbiAgICAgICAgdGhpcy5kYXRhMSA9IGFyZ3NbMl07Ly9ub3RlIG51bWJlclxuICAgICAgICB0aGlzLmRhdGEyID0gYXJnc1szXTsvL3ZlbG9jaXR5XG4gICAgICAgIGlmKHRoaXMuZGF0YTIgPT09IDApe1xuICAgICAgICAgIC8vaWYgdmVsb2NpdHkgaXMgMCwgdGhpcyBpcyBhIE5PVEUgT0ZGIGV2ZW50XG4gICAgICAgICAgdGhpcy50eXBlID0gMHg4MDtcbiAgICAgICAgfVxuICAgICAgICBub3RlID0gY3JlYXRlTm90ZSh0aGlzLmRhdGExKTtcbiAgICAgICAgdGhpcy5ub3RlID0gbm90ZTtcbiAgICAgICAgdGhpcy5ub3RlTmFtZSA9IG5vdGUuZnVsbE5hbWU7XG4gICAgICAgIHRoaXMubm90ZU51bWJlciA9IG5vdGUubnVtYmVyO1xuICAgICAgICB0aGlzLm9jdGF2ZSA9IG5vdGUub2N0YXZlO1xuICAgICAgICB0aGlzLmZyZXF1ZW5jeSA9IG5vdGUuZnJlcXVlbmN5O1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdGhpcy5kYXRhMjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4NTE6XG4gICAgICAgIHRoaXMuYnBtID0gYXJnc1syXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIHRoaXMubm9taW5hdG9yID0gYXJnc1syXTtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciA9IGFyZ3NbM107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAweEIwOi8vIGNvbnRyb2wgY2hhbmdlXG4gICAgICAgIHRoaXMuZGF0YTEgPSBhcmdzWzJdO1xuICAgICAgICB0aGlzLmRhdGEyID0gYXJnc1szXTtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyVHlwZSA9IGFyZ3NbMl07XG4gICAgICAgIHRoaXMuY29udHJvbGxlclZhbHVlID0gYXJnc1szXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4QzA6Ly8gcHJvZ3JhbSBjaGFuZ2VcbiAgICAgICAgdGhpcy5kYXRhMSA9IGFyZ3NbMl07XG4gICAgICAgIHRoaXMucHJvZ3JhbU51bWJlciA9IGFyZ3NbMl07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAweEQwOi8vIGNoYW5uZWwgcHJlc3N1cmVcbiAgICAgICAgdGhpcy5kYXRhMSA9IGFyZ3NbMl07XG4gICAgICAgIHRoaXMuZGF0YTIgPSBhcmdzWzNdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHhFMDovLyBwaXRjaCBiZW5kXG4gICAgICAgIHRoaXMuZGF0YTEgPSBhcmdzWzJdO1xuICAgICAgICB0aGlzLmRhdGEyID0gYXJnc1szXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4MkY6XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgd2Fybignbm90IGEgcmVjb2duaXplZCB0eXBlIG9mIG1pZGkgZXZlbnQhJyk7XG4gICAgfVxuICB9XG5cblxuXG4gIGNsb25lKCl7XG4gICAgbGV0IGV2ZW50ID0gbmV3IE1pZGlFdmVudCgpO1xuXG4gICAgZm9yKGxldCBwcm9wZXJ0eSBvZiBPYmplY3Qua2V5cyh0aGlzKSl7XG4gICAgICBpZihwcm9wZXJ0eSAhPT0gJ2lkJyAmJiBwcm9wZXJ0eSAhPT0gJ2V2ZW50TnVtYmVyJyAmJiBwcm9wZXJ0eSAhPT0gJ21pZGlOb3RlJyl7XG4gICAgICAgIGV2ZW50W3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgfVxuICAgICAgZXZlbnQuc29uZyA9IHVuZGVmaW5lZDtcbiAgICAgIGV2ZW50LnRyYWNrID0gdW5kZWZpbmVkO1xuICAgICAgZXZlbnQudHJhY2tJZCA9IHVuZGVmaW5lZDtcbiAgICAgIGV2ZW50LnBhcnQgPSB1bmRlZmluZWQ7XG4gICAgICBldmVudC5wYXJ0SWQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBldmVudDtcbiAgfVxuXG5cblxuICB0cmFuc3Bvc2Uoc2VtaSl7XG4gICAgaWYodGhpcy50eXBlICE9PSAweDgwICYmIHRoaXMudHlwZSAhPT0gMHg5MCl7XG4gICAgICBlcnJvcigneW91IGNhbiBvbmx5IHRyYW5zcG9zZSBub3RlIG9uIGFuZCBub3RlIG9mZiBldmVudHMnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKCd0cmFuc3Bvc2UnLCBzZW1pKTtcbiAgICBpZih0eXBlU3RyaW5nKHNlbWkpID09PSAnYXJyYXknKXtcbiAgICAgIGxldCB0eXBlID0gc2VtaVswXTtcbiAgICAgIGlmKHR5cGUgPT09ICdoZXJ0eicpe1xuICAgICAgICAvL2NvbnZlcnQgaGVydHogdG8gc2VtaVxuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ3NlbWknIHx8IHR5cGUgPT09ICdzZW1pdG9uZScpe1xuICAgICAgICBzZW1pID0gc2VtaVsxXTtcbiAgICAgIH1cbiAgICB9ZWxzZSBpZihpc05hTihzZW1pKSA9PT0gdHJ1ZSl7XG4gICAgICBlcnJvcigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgdG1wID0gdGhpcy5kYXRhMSArIHBhcnNlSW50KHNlbWksIDEwKTtcbiAgICBpZih0bXAgPCAwKXtcbiAgICAgIHRtcCA9IDA7XG4gICAgfWVsc2UgaWYodG1wID4gMTI3KXtcbiAgICAgIHRtcCA9IDEyNztcbiAgICB9XG4gICAgdGhpcy5kYXRhMSA9IHRtcDtcbiAgICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUodGhpcy5kYXRhMSk7XG4gICAgdGhpcy5ub3RlID0gbm90ZTtcbiAgICB0aGlzLm5vdGVOYW1lID0gbm90ZS5mdWxsTmFtZTtcbiAgICB0aGlzLm5vdGVOdW1iZXIgPSBub3RlLm51bWJlcjtcbiAgICB0aGlzLm9jdGF2ZSA9IG5vdGUub2N0YXZlO1xuICAgIHRoaXMuZnJlcXVlbmN5ID0gbm90ZS5mcmVxdWVuY3k7XG5cbiAgICBpZih0aGlzLm1pZGlOb3RlICE9PSB1bmRlZmluZWQpe1xuICAgICAgdGhpcy5taWRpTm90ZS5waXRjaCA9IHRoaXMuZGF0YTE7XG4gICAgfVxuXG4gICAgaWYodGhpcy5zdGF0ZSAhPT0gJ25ldycpe1xuICAgICAgdGhpcy5zdGF0ZSA9ICdjaGFuZ2VkJztcbiAgICB9XG4gICAgaWYodGhpcy5wYXJ0ICE9PSB1bmRlZmluZWQpe1xuICAgICAgdGhpcy5wYXJ0Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuXG5cbiAgc2V0UGl0Y2gocGl0Y2gpe1xuICAgIGlmKHRoaXMudHlwZSAhPT0gMHg4MCAmJiB0aGlzLnR5cGUgIT09IDB4OTApe1xuICAgICAgZXJyb3IoJ3lvdSBjYW4gb25seSBzZXQgdGhlIHBpdGNoIG9mIG5vdGUgb24gYW5kIG5vdGUgb2ZmIGV2ZW50cycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZih0eXBlU3RyaW5nKHBpdGNoKSA9PT0gJ2FycmF5Jyl7XG4gICAgICBsZXQgdHlwZSA9IHBpdGNoWzBdO1xuICAgICAgaWYodHlwZSA9PT0gJ2hlcnR6Jyl7XG4gICAgICAgIC8vY29udmVydCBoZXJ0eiB0byBwaXRjaFxuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ3NlbWknIHx8IHR5cGUgPT09ICdzZW1pdG9uZScpe1xuICAgICAgICBwaXRjaCA9IHBpdGNoWzFdO1xuICAgICAgfVxuICAgIH1lbHNlIGlmKGlzTmFOKHBpdGNoKSA9PT0gdHJ1ZSl7XG4gICAgICBlcnJvcigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGExID0gcGFyc2VJbnQocGl0Y2gsMTApO1xuICAgIGxldCBub3RlID0gY3JlYXRlTm90ZSh0aGlzLmRhdGExKTtcbiAgICB0aGlzLm5vdGUgPSBub3RlO1xuICAgIHRoaXMubm90ZU5hbWUgPSBub3RlLmZ1bGxOYW1lO1xuICAgIHRoaXMubm90ZU51bWJlciA9IG5vdGUubnVtYmVyO1xuICAgIHRoaXMub2N0YXZlID0gbm90ZS5vY3RhdmU7XG4gICAgdGhpcy5mcmVxdWVuY3kgPSBub3RlLmZyZXF1ZW5jeTtcblxuICAgIGlmKHRoaXMubWlkaU5vdGUgIT09IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLm1pZGlOb3RlLnBpdGNoID0gdGhpcy5kYXRhMTtcbiAgICB9XG4gICAgaWYodGhpcy5zdGF0ZSAhPT0gJ25ldycpe1xuICAgICAgdGhpcy5zdGF0ZSA9ICdjaGFuZ2VkJztcbiAgICB9XG4gICAgaWYodGhpcy5wYXJ0ICE9PSB1bmRlZmluZWQpe1xuICAgICAgdGhpcy5wYXJ0Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuXG5cbiAgbW92ZSh0aWNrcyl7XG4gICAgaWYoaXNOYU4odGlja3MpKXtcbiAgICAgIGVycm9yKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnRpY2tzICs9IHBhcnNlSW50KHRpY2tzLCAxMCk7XG4gICAgaWYodGhpcy5zdGF0ZSAhPT0gJ25ldycpe1xuICAgICAgdGhpcy5zdGF0ZSA9ICdjaGFuZ2VkJztcbiAgICB9XG4gICAgaWYodGhpcy5wYXJ0ICE9PSB1bmRlZmluZWQpe1xuICAgICAgdGhpcy5wYXJ0Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuXG5cbiAgbW92ZVRvKC4uLnBvc2l0aW9uKXtcblxuICAgIGlmKHBvc2l0aW9uWzBdID09PSAndGlja3MnICYmIGlzTmFOKHBvc2l0aW9uWzFdKSA9PT0gZmFsc2Upe1xuICAgICAgdGhpcy50aWNrcyA9IHBhcnNlSW50KHBvc2l0aW9uWzFdLCAxMCk7XG4gICAgfWVsc2UgaWYodGhpcy5zb25nID09PSB1bmRlZmluZWQpe1xuICAgICAgY29uc29sZS5lcnJvcignVGhlIG1pZGkgZXZlbnQgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIGEgc29uZyB5ZXQ7IHlvdSBjYW4gb25seSBtb3ZlIHRvIHRpY2tzIHZhbHVlcycpO1xuICAgIH1lbHNle1xuICAgICAgcG9zaXRpb24gPSB0aGlzLnNvbmcuZ2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICAgICAgaWYocG9zaXRpb24gPT09IGZhbHNlKXtcbiAgICAgICAgY29uc29sZS5lcnJvcignd3JvbmcgcG9zaXRpb24gZGF0YScpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMudGlja3MgPSBwb3NpdGlvbi50aWNrcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZih0aGlzLnN0YXRlICE9PSAnbmV3Jyl7XG4gICAgICB0aGlzLnN0YXRlID0gJ2NoYW5nZWQnO1xuICAgIH1cbiAgICBpZih0aGlzLnBhcnQgIT09IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLnBhcnQubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG5cbiAgcmVzZXQoZnJvbVBhcnQsIGZyb21UcmFjaywgZnJvbVNvbmcpe1xuXG4gICAgZnJvbVBhcnQgPSBmcm9tUGFydCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGZhbHNlO1xuICAgIGZyb21UcmFjayA9IGZyb21UcmFjayA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGZhbHNlO1xuICAgIGZyb21Tb25nID0gZnJvbVNvbmcgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBmYWxzZTtcblxuICAgIGlmKGZyb21QYXJ0KXtcbiAgICAgIHRoaXMucGFydCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMucGFydElkID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZihmcm9tVHJhY2spe1xuICAgICAgdGhpcy50cmFjayA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMudHJhY2tJZCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuY2hhbm5lbCA9IDA7XG4gICAgfVxuICAgIGlmKGZyb21Tb25nKXtcbiAgICAgIHRoaXMuc29uZyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuXG5cbiAgLy8gaW1wbGVtZW50ZWQgYmVjYXVzZSBvZiB0aGUgY29tbW9uIGludGVyZmFjZSBvZiBtaWRpIGFuZCBhdWRpbyBldmVudHNcbiAgdXBkYXRlKCl7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlTUlESUV2ZW50KCl7XG4gIHJldHVybiBuZXcgTUlESUV2ZW50KC4uLmFyZ3VtZW50cyk7XG59XG4iLCIvKlxuICBFeHRyYWN0cyBhbGwgbWlkaSBldmVudHMgZnJvbSBhIGJpbmFyeSBtaWRpIGZpbGUsIHVzZXMgbWlkaV9zdHJlYW0uanNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGNyZWF0ZU1JRElTdHJlYW0gZnJvbSAnLi9taWRpX3N0cmVhbSc7XG5cbmxldFxuICBsYXN0RXZlbnRUeXBlQnl0ZSxcbiAgdHJhY2tOYW1lO1xuXG5cbmZ1bmN0aW9uIHJlYWRDaHVuayhzdHJlYW0pe1xuICBsZXQgaWQgPSBzdHJlYW0ucmVhZCg0LCB0cnVlKTtcbiAgbGV0IGxlbmd0aCA9IHN0cmVhbS5yZWFkSW50MzIoKTtcbiAgLy9jb25zb2xlLmxvZyhsZW5ndGgpO1xuICByZXR1cm57XG4gICAgJ2lkJzogaWQsXG4gICAgJ2xlbmd0aCc6IGxlbmd0aCxcbiAgICAnZGF0YSc6IHN0cmVhbS5yZWFkKGxlbmd0aCwgZmFsc2UpXG4gIH07XG59XG5cblxuZnVuY3Rpb24gcmVhZEV2ZW50KHN0cmVhbSl7XG4gIHZhciBldmVudCA9IHt9O1xuICB2YXIgbGVuZ3RoO1xuICBldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICBsZXQgZXZlbnRUeXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50VHlwZUJ5dGUsIGV2ZW50VHlwZUJ5dGUgJiAweDgwLCAxNDYgJiAweDBmKTtcbiAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweGYwKSA9PSAweGYwKXtcbiAgICAvKiBzeXN0ZW0gLyBtZXRhIGV2ZW50ICovXG4gICAgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGZmKXtcbiAgICAgIC8qIG1ldGEgZXZlbnQgKi9cbiAgICAgIGV2ZW50LnR5cGUgPSAnbWV0YSc7XG4gICAgICBsZXQgc3VidHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBzd2l0Y2goc3VidHlwZUJ5dGUpe1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNlcXVlbmNlTnVtYmVyIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1iZXIgPSBzdHJlYW0ucmVhZEludDE2KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvcHlyaWdodE5vdGljZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDM6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0cmFja05hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdpbnN0cnVtZW50TmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDU6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdseXJpY3MnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA2OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWFya2VyJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2N1ZVBvaW50JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21pZGlDaGFubmVsUHJlZml4JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDEpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgbWlkaUNoYW5uZWxQcmVmaXggZXZlbnQgaXMgMSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmNoYW5uZWwgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2VuZE9mVHJhY2snO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NldFRlbXBvJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDMpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2V0VGVtcG8gZXZlbnQgaXMgMywgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQgPSAoXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgMTYpICtcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCA4KSArXG4gICAgICAgICAgICBzdHJlYW0ucmVhZEludDgoKVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzbXB0ZU9mZnNldCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA1KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNtcHRlT2Zmc2V0IGV2ZW50IGlzIDUsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgaG91ckJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZVJhdGUgPXtcbiAgICAgICAgICAgIDB4MDA6IDI0LCAweDIwOiAyNSwgMHg0MDogMjksIDB4NjA6IDMwXG4gICAgICAgICAgfVtob3VyQnl0ZSAmIDB4NjBdO1xuICAgICAgICAgIGV2ZW50LmhvdXIgPSBob3VyQnl0ZSAmIDB4MWY7XG4gICAgICAgICAgZXZlbnQubWluID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc2VjID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zdWJmcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU4OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGltZVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA0KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWVyYXRvciA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmRlbm9taW5hdG9yID0gTWF0aC5wb3coMiwgc3RyZWFtLnJlYWRJbnQ4KCkpO1xuICAgICAgICAgIGV2ZW50Lm1ldHJvbm9tZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnRoaXJ0eXNlY29uZHMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1OTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2tleVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQua2V5ID0gc3RyZWFtLnJlYWRJbnQ4KHRydWUpO1xuICAgICAgICAgIGV2ZW50LnNjYWxlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4N2Y6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZXJTcGVjaWZpYyc7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vaWYoc2VxdWVuY2VyLmRlYnVnID49IDIpe1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUud2FybignVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogJyArIHN1YnR5cGVCeXRlKTtcbiAgICAgICAgICAvL31cbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmMCl7XG4gICAgICBldmVudC50eXBlID0gJ3N5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4Zjcpe1xuICAgICAgZXZlbnQudHlwZSA9ICdkaXZpZGVkU3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogJyArIGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICB9ZWxzZXtcbiAgICAvKiBjaGFubmVsIGV2ZW50ICovXG4gICAgbGV0IHBhcmFtMTtcbiAgICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ODApID09PSAwKXtcbiAgICAgIC8qIHJ1bm5pbmcgc3RhdHVzIC0gcmV1c2UgbGFzdEV2ZW50VHlwZUJ5dGUgYXMgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgIGV2ZW50VHlwZUJ5dGUgaXMgYWN0dWFsbHkgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgKi9cbiAgICAgIC8vY29uc29sZS5sb2coJ3J1bm5pbmcgc3RhdHVzJyk7XG4gICAgICBwYXJhbTEgPSBldmVudFR5cGVCeXRlO1xuICAgICAgZXZlbnRUeXBlQnl0ZSA9IGxhc3RFdmVudFR5cGVCeXRlO1xuICAgIH1lbHNle1xuICAgICAgcGFyYW0xID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdsYXN0JywgZXZlbnRUeXBlQnl0ZSk7XG4gICAgICBsYXN0RXZlbnRUeXBlQnl0ZSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICAgIGxldCBldmVudFR5cGUgPSBldmVudFR5cGVCeXRlID4+IDQ7XG4gICAgZXZlbnQuY2hhbm5lbCA9IGV2ZW50VHlwZUJ5dGUgJiAweDBmO1xuICAgIGV2ZW50LnR5cGUgPSAnY2hhbm5lbCc7XG4gICAgc3dpdGNoIChldmVudFR5cGUpe1xuICAgICAgY2FzZSAweDA4OlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MDk6XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmKGV2ZW50LnZlbG9jaXR5ID09PSAwKXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBhOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYjpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb250cm9sbGVyJztcbiAgICAgICAgZXZlbnQuY29udHJvbGxlclR5cGUgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYzpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwcm9ncmFtQ2hhbmdlJztcbiAgICAgICAgZXZlbnQucHJvZ3JhbU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBkOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NoYW5uZWxBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gcGFyYW0xO1xuICAgICAgICAvL2lmKHRyYWNrTmFtZSA9PT0gJ1NILVMxLTQ0LUMwOSBMPVNNTCBJTj0zJyl7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCdjaGFubmVsIHByZXNzdXJlJywgdHJhY2tOYW1lLCBwYXJhbTEpO1xuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBlOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3BpdGNoQmVuZCc7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gcGFyYW0xICsgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDcpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvKlxuICAgICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgY29uc29sZS5sb2coJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuLypcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICBjb25zb2xlLmxvZygnd2VpcmRvJywgdHJhY2tOYW1lLCBwYXJhbTEsIGV2ZW50LnZlbG9jaXR5KTtcbiovXG5cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTUlESUZpbGUoYnVmZmVyKXtcbiAgbGV0IHRyYWNrcyA9IG5ldyBNYXAoKTtcbiAgbGV0IHN0cmVhbSA9IGNyZWF0ZU1JRElTdHJlYW0obmV3IFVpbnQ4QXJyYXkoYnVmZmVyKSk7XG5cbiAgbGV0IGhlYWRlckNodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gIGlmKGhlYWRlckNodW5rLmlkICE9PSAnTVRoZCcgfHwgaGVhZGVyQ2h1bmsubGVuZ3RoICE9PSA2KXtcbiAgICB0aHJvdyAnQmFkIC5taWQgZmlsZSAtIGhlYWRlciBub3QgZm91bmQnO1xuICB9XG5cbiAgbGV0IGhlYWRlclN0cmVhbSA9IGNyZWF0ZU1JRElTdHJlYW0oaGVhZGVyQ2h1bmsuZGF0YSk7XG4gIGxldCBmb3JtYXRUeXBlID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdHJhY2tDb3VudCA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgbGV0IHRpbWVEaXZpc2lvbiA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcblxuICBpZih0aW1lRGl2aXNpb24gJiAweDgwMDApe1xuICAgIHRocm93ICdFeHByZXNzaW5nIHRpbWUgZGl2aXNpb24gaW4gU01UUEUgZnJhbWVzIGlzIG5vdCBzdXBwb3J0ZWQgeWV0JztcbiAgfVxuXG4gIGxldCBoZWFkZXIgPXtcbiAgICAnZm9ybWF0VHlwZSc6IGZvcm1hdFR5cGUsXG4gICAgJ3RyYWNrQ291bnQnOiB0cmFja0NvdW50LFxuICAgICd0aWNrc1BlckJlYXQnOiB0aW1lRGl2aXNpb25cbiAgfTtcblxuICBmb3IobGV0IGkgPSAwOyBpIDwgdHJhY2tDb3VudDsgaSsrKXtcbiAgICB0cmFja05hbWUgPSAndHJhY2tfJyArIGk7XG4gICAgbGV0IHRyYWNrID0gW107XG4gICAgbGV0IHRyYWNrQ2h1bmsgPSByZWFkQ2h1bmsoc3RyZWFtKTtcbiAgICBpZih0cmFja0NodW5rLmlkICE9PSAnTVRyaycpe1xuICAgICAgdGhyb3cgJ1VuZXhwZWN0ZWQgY2h1bmsgLSBleHBlY3RlZCBNVHJrLCBnb3QgJysgdHJhY2tDaHVuay5pZDtcbiAgICB9XG4gICAgbGV0IHRyYWNrU3RyZWFtID0gY3JlYXRlTUlESVN0cmVhbSh0cmFja0NodW5rLmRhdGEpO1xuICAgIHdoaWxlKCF0cmFja1N0cmVhbS5lb2YoKSl7XG4gICAgICBsZXQgZXZlbnQgPSByZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuICAgICAgdHJhY2sucHVzaChldmVudCk7XG4gICAgfVxuICAgIHRyYWNrcy5zZXQodHJhY2tOYW1lLCB0cmFjayk7XG4gIH1cblxuICByZXR1cm57XG4gICAgJ2hlYWRlcic6IGhlYWRlcixcbiAgICAndHJhY2tzJzogdHJhY2tzXG4gIH07XG59IiwiLypcbiAgV3JhcHBlciBmb3IgYWNjZXNzaW5nIGJ5dGVzIHRocm91Z2ggc2VxdWVudGlhbCByZWFkc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuICBhZGFwdGVkIHRvIHdvcmsgd2l0aCBBcnJheUJ1ZmZlciAtPiBVaW50OEFycmF5XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgZmNjID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuY2xhc3MgTUlESVN0cmVhbXtcblxuICAvLyBidWZmZXIgaXMgVWludDhBcnJheVxuICBjb25zdHJ1Y3RvcihidWZmZXIpe1xuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgLyogcmVhZCBzdHJpbmcgb3IgYW55IG51bWJlciBvZiBieXRlcyAqL1xuICByZWFkKGxlbmd0aCwgdG9TdHJpbmcgPSB0cnVlKSB7XG4gICAgbGV0IHJlc3VsdDtcblxuICAgIGlmKHRvU3RyaW5nKXtcbiAgICAgIHJlc3VsdCA9ICcnO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQgKz0gZmNjKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfWVsc2V7XG4gICAgICByZXN1bHQgPSBbXTtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAzMi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MzIoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCAyNCkgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXSA8PCAxNikgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAyXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgM11cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gNDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMTYtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDE2KCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYW4gOC1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50OChzaWduZWQpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl07XG4gICAgaWYoc2lnbmVkICYmIHJlc3VsdCA+IDEyNyl7XG4gICAgICByZXN1bHQgLT0gMjU2O1xuICAgIH1cbiAgICB0aGlzLnBvc2l0aW9uICs9IDE7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGVvZigpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbiA+PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICAvKiByZWFkIGEgTUlESS1zdHlsZSBsZXRpYWJsZS1sZW5ndGggaW50ZWdlclxuICAgIChiaWctZW5kaWFuIHZhbHVlIGluIGdyb3VwcyBvZiA3IGJpdHMsXG4gICAgd2l0aCB0b3AgYml0IHNldCB0byBzaWduaWZ5IHRoYXQgYW5vdGhlciBieXRlIGZvbGxvd3MpXG4gICovXG4gIHJlYWRWYXJJbnQoKSB7XG4gICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgbGV0IGIgPSB0aGlzLnJlYWRJbnQ4KCk7XG4gICAgICBpZiAoYiAmIDB4ODApIHtcbiAgICAgICAgcmVzdWx0ICs9IChiICYgMHg3Zik7XG4gICAgICAgIHJlc3VsdCA8PD0gNztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGIgaXMgdGhlIGxhc3QgYnl0ZSAqL1xuICAgICAgICByZXR1cm4gcmVzdWx0ICsgYjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVNSURJU3RyZWFtKGJ1ZmZlcil7XG4gIHJldHVybiBuZXcgTUlESVN0cmVhbShidWZmZXIpO1xufVxuIiwiLypcbiAgQWRkcyBhIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5vdGUgb2JqZWN0IHRoYXQgY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgYSBtdXNpY2FsIG5vdGU6XG4gICAgLSBuYW1lLCBlLmcuICdDJ1xuICAgIC0gb2N0YXZlLCAgLTEgLSA5XG4gICAgLSBmdWxsTmFtZTogJ0MxJ1xuICAgIC0gZnJlcXVlbmN5OiAyMzQuMTYsIGJhc2VkIG9uIHRoZSBiYXNpYyBwaXRjaFxuICAgIC0gbnVtYmVyOiA2MCBtaWRpIG5vdGUgbnVtYmVyXG5cbiAgQWRkcyBzZXZlcmFsIHV0aWxpdHkgbWV0aG9kcyBvcmdhbmlzZWQgYXJvdW5kIHRoZSBub3RlIG9iamVjdFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZ2V0Q29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7bG9nLCBpbmZvLCB3YXJuLCBlcnJvciwgdHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJztcblxubGV0XG4gIGVycm9yTXNnLFxuICB3YXJuaW5nTXNnLFxuICBjb25maWcgPSBnZXRDb25maWcoKSxcbiAgcG93ID0gTWF0aC5wb3csXG4gIGZsb29yID0gTWF0aC5mbG9vcjtcblxuY29uc3Qgbm90ZU5hbWVzID0ge1xuICAnc2hhcnAnIDogWydDJywgJ0MjJywgJ0QnLCAnRCMnLCAnRScsICdGJywgJ0YjJywgJ0cnLCAnRyMnLCAnQScsICdBIycsICdCJ10sXG4gICdmbGF0JyA6IFsnQycsICdEYicsICdEJywgJ0ViJywgJ0UnLCAnRicsICdHYicsICdHJywgJ0FiJywgJ0EnLCAnQmInLCAnQiddLFxuICAnZW5oYXJtb25pYy1zaGFycCcgOiBbJ0IjJywgJ0MjJywgJ0MjIycsICdEIycsICdEIyMnLCAnRSMnLCAnRiMnLCAnRiMjJywgJ0cjJywgJ0cjIycsICdBIycsICdBIyMnXSxcbiAgJ2VuaGFybW9uaWMtZmxhdCcgOiBbJ0RiYicsICdEYicsICdFYmInLCAnRWInLCAnRmInLCAnR2JiJywgJ0diJywgJ0FiYicsICdBYicsICdCYmInLCAnQmInLCAnQ2InXVxufTtcblxuXG4vKlxuICBhcmd1bWVudHNcbiAgLSBub3RlTnVtYmVyOiA2MFxuICAtIG5vdGVOdW1iZXIgYW5kIG5vdGVuYW1lIG1vZGU6IDYwLCAnc2hhcnAnXG4gIC0gbm90ZU5hbWU6ICdDIzQnXG4gIC0gbmFtZSBhbmQgb2N0YXZlOiAnQyMnLCA0XG4gIC0gbm90ZSBuYW1lLCBvY3RhdmUsIG5vdGUgbmFtZSBtb2RlOiAnRCcsIDQsICdzaGFycCdcbiAgLSBkYXRhIG9iamVjdDpcbiAgICB7XG4gICAgICBuYW1lOiAnQycsXG4gICAgICBvY3RhdmU6IDRcbiAgICB9XG4gICAgb3JcbiAgICB7XG4gICAgICBmcmVxdWVuY3k6IDIzNC4xNlxuICAgIH1cbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOb3RlKC4uLmFyZ3Mpe1xuICBsZXRcbiAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgZGF0YSxcbiAgICBvY3RhdmUsXG4gICAgbm90ZU5hbWUsXG4gICAgbm90ZU51bWJlcixcbiAgICBub3RlTmFtZU1vZGUsXG4gICAgYXJnMCA9IGFyZ3NbMF0sXG4gICAgYXJnMSA9IGFyZ3NbMV0sXG4gICAgYXJnMiA9IGFyZ3NbMl0sXG4gICAgdHlwZTAgPSB0eXBlU3RyaW5nKGFyZzApLFxuICAgIHR5cGUxID0gdHlwZVN0cmluZyhhcmcxKSxcbiAgICB0eXBlMiA9IHR5cGVTdHJpbmcoYXJnMik7XG5cbiAgZXJyb3JNc2cgPSAnJztcbiAgd2FybmluZ01zZyA9ICcnO1xuXG4gIC8vIGFyZ3VtZW50OiBub3RlIG51bWJlclxuICBpZihudW1BcmdzID09PSAxICYmIHR5cGUwID09PSAnbnVtYmVyJyl7XG4gICAgaWYoYXJnMCA8IDAgfHwgYXJnMCA+IDEyNyl7XG4gICAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgbnVtYmVyID49IDAgYW5kIDw9IDEyNyAnICsgIGFyZzA7XG4gICAgfWVsc2V7XG4gICAgICBub3RlTnVtYmVyID0gYXJnMDtcbiAgICAgIGRhdGEgPSBfZ2V0Tm90ZU5hbWUobm90ZU51bWJlcik7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgIH1cblxuXG4gIC8vIGFyZ3VtZW50czogZnVsbCBub3RlIG5hbWVcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMSAmJiB0eXBlMCA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cbiAgLy8gYXJndW1lbnRzOiBub3RlIG5hbWUsIG9jdGF2ZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ251bWJlcicpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwLCBhcmcxKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cbiAgLy8gYXJndW1lbnRzOiBmdWxsIG5vdGUgbmFtZSwgbm90ZSBuYW1lIG1vZGUgLT4gZm9yIGNvbnZlcnRpbmcgYmV0d2VlbiBub3RlIG5hbWUgbW9kZXNcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMiAmJiB0eXBlMCA9PT0gJ3N0cmluZycgJiYgdHlwZTEgPT09ICdzdHJpbmcnKXtcbiAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCk7XG4gICAgaWYoZXJyb3JNc2cgPT09ICcnKXtcbiAgICAgIG5vdGVOYW1lTW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShhcmcxKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsIG9jdGF2ZSk7XG4gICAgfVxuXG5cbiAgLy8gYXJndW1lbnRzOiBub3RlIG51bWJlciwgbm90ZSBuYW1lIG1vZGVcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMiAmJiB0eXBlU3RyaW5nKGFyZzApID09PSAnbnVtYmVyJyAmJiB0eXBlU3RyaW5nKGFyZzEpID09PSAnc3RyaW5nJyl7XG4gICAgaWYoYXJnMCA8IDAgfHwgYXJnMCA+IDEyNyl7XG4gICAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgbnVtYmVyID49IDAgYW5kIDw9IDEyNyAnICsgYXJnMDtcbiAgICB9ZWxzZXtcbiAgICAgIG5vdGVOYW1lTW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShhcmcxKTtcbiAgICAgIG5vdGVOdW1iZXIgPSBhcmcwO1xuICAgICAgZGF0YSA9IF9nZXROb3RlTmFtZShub3RlTnVtYmVyLCBub3RlTmFtZU1vZGUpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICB9XG5cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbmFtZSwgb2N0YXZlLCBub3RlIG5hbWUgbW9kZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAzICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ251bWJlcicgJiYgdHlwZTIgPT09ICdzdHJpbmcnKXtcbiAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCwgYXJnMSk7XG4gICAgaWYoZXJyb3JNc2cgPT09ICcnKXtcbiAgICAgIG5vdGVOYW1lTW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShhcmcyKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsb2N0YXZlKTtcbiAgICB9XG5cbiAgfWVsc2V7XG4gICAgZXJyb3JNc2cgPSAnd3JvbmcgYXJndW1lbnRzLCBwbGVhc2UgY29uc3VsdCBkb2N1bWVudGF0aW9uJztcbiAgfVxuXG4gIGlmKGVycm9yTXNnKXtcbiAgICBlcnJvcihlcnJvck1zZyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYod2FybmluZ01zZyl7XG4gICAgd2Fybih3YXJuaW5nTXNnKTtcbiAgfVxuXG4gIGxldCBub3RlID0ge1xuICAgIG5hbWU6IG5vdGVOYW1lLFxuICAgIG9jdGF2ZTogb2N0YXZlLFxuICAgIGZ1bGxOYW1lOiBub3RlTmFtZSArIG9jdGF2ZSxcbiAgICBudW1iZXI6IG5vdGVOdW1iZXIsXG4gICAgZnJlcXVlbmN5OiBfZ2V0RnJlcXVlbmN5KG5vdGVOdW1iZXIpLFxuICAgIGJsYWNrS2V5OiBfaXNCbGFja0tleShub3RlTnVtYmVyKVxuICB9XG4gIE9iamVjdC5mcmVlemUobm90ZSk7XG4gIHJldHVybiBub3RlO1xufVxuXG5cbmZ1bmN0aW9uIF9nZXROb3RlTmFtZShudW1iZXIsIG1vZGUgPSBjb25maWcuZ2V0KCdub3RlTmFtZU1vZGUnKSkge1xuICAvL2xldCBvY3RhdmUgPSBNYXRoLmZsb29yKChudW1iZXIgLyAxMikgLSAyKSwgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBvY3RhdmUgPSBmbG9vcigobnVtYmVyIC8gMTIpIC0gMSk7XG4gIGxldCBub3RlTmFtZSA9IG5vdGVOYW1lc1ttb2RlXVtudW1iZXIgJSAxMl07XG4gIHJldHVybiBbbm90ZU5hbWUsIG9jdGF2ZV07XG59XG5cblxuZnVuY3Rpb24gX2dldE5vdGVOdW1iZXIobmFtZSwgb2N0YXZlKSB7XG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgbGV0IGluZGV4O1xuXG4gIGZvcihsZXQga2V5IG9mIGtleXMpe1xuICAgIGxldCBtb2RlID0gbm90ZU5hbWVzW2tleV07XG4gICAgaW5kZXggPSBtb2RlLmZpbmRJbmRleCh4ID0+IHggPT09IG5hbWUpO1xuICAgIGlmKGluZGV4ICE9PSAtMSl7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvL251bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMikgKyAxMjsgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBudW1iZXIgPSAoaW5kZXggKyAxMikgKyAob2N0YXZlICogMTIpOy8vIOKGkiBtaWRpIHN0YW5kYXJkICsgc2NpZW50aWZpYyBuYW1pbmcsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NaWRkbGVfQyBhbmQgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TY2llbnRpZmljX3BpdGNoX25vdGF0aW9uXG5cbiAgaWYobnVtYmVyIDwgMCB8fCBudW1iZXIgPiAxMjcpe1xuICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBiZXR3ZWVuIEMwIGFuZCBHMTAnO1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gbnVtYmVyO1xufVxuXG5cbmZ1bmN0aW9uIF9nZXRGcmVxdWVuY3kobnVtYmVyKXtcbiAgcmV0dXJuIGNvbmZpZy5nZXQoJ3BpdGNoJykgKiBwb3coMiwobnVtYmVyIC0gNjkpLzEyKTsgLy8gbWlkaSBzdGFuZGFyZCwgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01JRElfVHVuaW5nX1N0YW5kYXJkXG59XG5cblxuLy8gVE9ETzogY2FsY3VsYXRlIG5vdGUgZnJvbSBmcmVxdWVuY3lcbmZ1bmN0aW9uIF9nZXRQaXRjaChoZXJ0eil7XG4gIC8vZm0gID0gIDIobeKIkjY5KS8xMig0NDAgSHopLlxufVxuXG5cbmZ1bmN0aW9uIF9jaGVja05vdGVOYW1lTW9kZShtb2RlKXtcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgcmVzdWx0ID0ga2V5cy5maW5kKHggPT4geCA9PT0gbW9kZSkgIT09IHVuZGVmaW5lZDtcbiAgaWYocmVzdWx0ID09PSBmYWxzZSl7XG4gICAgbW9kZSA9IGNvbmZpZy5nZXQoJ25vdGVOYW1lTW9kZScpO1xuICAgIHdhcm5pbmdNc2cgPSBtb2RlICsgJyBpcyBub3QgYSB2YWxpZCBub3RlIG5hbWUgbW9kZSwgdXNpbmcgXCInICsgbW9kZSArICdcIiBpbnN0ZWFkJztcbiAgfVxuICByZXR1cm4gbW9kZTtcbn1cblxuXG5mdW5jdGlvbiBfY2hlY2tOb3RlTmFtZSguLi5hcmdzKXtcbiAgbGV0XG4gICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoLFxuICAgIGFyZzAgPSBhcmdzWzBdLFxuICAgIGFyZzEgPSBhcmdzWzFdLFxuICAgIGNoYXIsXG4gICAgbmFtZSA9ICcnLFxuICAgIG9jdGF2ZSA9ICcnO1xuXG4gIC8vIGV4dHJhY3Qgb2N0YXZlIGZyb20gbm90ZSBuYW1lXG4gIGlmKG51bUFyZ3MgPT09IDEpe1xuICAgIGZvcihjaGFyIG9mIGFyZzApe1xuICAgICAgaWYoaXNOYU4oY2hhcikgJiYgY2hhciAhPT0gJy0nKXtcbiAgICAgICAgbmFtZSArPSBjaGFyO1xuICAgICAgfWVsc2V7XG4gICAgICAgIG9jdGF2ZSArPSBjaGFyO1xuICAgICAgfVxuICAgIH1cbiAgICBpZihvY3RhdmUgPT09ICcnKXtcbiAgICAgIG9jdGF2ZSA9IDA7XG4gICAgfVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyKXtcbiAgICBuYW1lID0gYXJnMDtcbiAgICBvY3RhdmUgPSBhcmcxO1xuICB9XG5cbiAgLy8gY2hlY2sgaWYgbm90ZSBuYW1lIGlzIHZhbGlkXG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgbGV0IGluZGV4ID0gLTE7XG5cbiAgZm9yKGxldCBrZXkgb2Yga2V5cyl7XG4gICAgbGV0IG1vZGUgPSBub3RlTmFtZXNba2V5XTtcbiAgICBpbmRleCA9IG1vZGUuZmluZEluZGV4KHggPT4geCA9PT0gbmFtZSk7XG4gICAgaWYoaW5kZXggIT09IC0xKXtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmKGluZGV4ID09PSAtMSl7XG4gICAgZXJyb3JNc2cgPSBhcmcwICsgJyBpcyBub3QgYSB2YWxpZCBub3RlIG5hbWUsIHBsZWFzZSB1c2UgbGV0dGVycyBBIC0gRyBhbmQgaWYgbmVjZXNzYXJ5IGFuIGFjY2lkZW50YWwgbGlrZSAjLCAjIywgYiBvciBiYiwgZm9sbG93ZWQgYnkgYSBudW1iZXIgZm9yIHRoZSBvY3RhdmUnO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKG9jdGF2ZSA8IC0xIHx8IG9jdGF2ZSA+IDkpe1xuICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGFuIG9jdGF2ZSBiZXR3ZWVuIC0xIGFuZCA5JztcbiAgICByZXR1cm47XG4gIH1cblxuICBvY3RhdmUgPSBwYXJzZUludChvY3RhdmUsIDEwKTtcbiAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDAsIDEpLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnN1YnN0cmluZygxKTtcblxuICAvL2NvbnNvbGUubG9nKG5hbWUsJ3wnLG9jdGF2ZSk7XG4gIHJldHVybiBbbmFtZSwgb2N0YXZlXTtcbn1cblxuXG5cbmZ1bmN0aW9uIF9pc0JsYWNrS2V5KG5vdGVOdW1iZXIpe1xuICBsZXQgYmxhY2s7XG5cbiAgc3dpdGNoKHRydWUpe1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxOi8vQyNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMzovL0QjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDY6Ly9GI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSA4Oi8vRyNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTA6Ly9BI1xuICAgICAgYmxhY2sgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJsYWNrID0gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gYmxhY2s7XG59XG5cblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlTnVtYmVyKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLm51bWJlcjtcbiAgfVxuICByZXR1cm4gZXJyb3JNc2c7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLm5hbWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlT2N0YXZlKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLm9jdGF2ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZ1bGxOb3RlTmFtZSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5mdWxsTmFtZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZyZXF1ZW5jeSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5mcmVxdWVuY3k7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0JsYWNrS2V5KC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmJsYWNrS2V5O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IHBhcnRJZCA9IDA7XG5cblxuY2xhc3MgUGFydHtcblxuICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICBsZXQgaWQgPSAnUCcgKyBwYXJ0SWQrKyArIERhdGUubm93KCk7XG5cbiAgfVxuXG5cblxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVQYXJ0KCl7XG4gIHJldHVybiBuZXcgUGFydCguLi5hcmd1bWVudHMpO1xufSIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHthZGRFdmVudExpc3RlbmVyLCByZW1vdmVFdmVudExpc3RlbmVyLCBkaXNwYXRjaEV2ZW50fSBmcm9tICcuL3NvbmdfYWRkX2V2ZW50bGlzdGVuZXInO1xuaW1wb3J0IHtsb2csIGluZm8sIHdhcm4sIGVycm9yLCB0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IGdldENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgY3JlYXRlTWlkaUV2ZW50IGZyb20gJy4vbWlkaV9ldmVudCc7XG5pbXBvcnQge2luaXRNaWRpU29uZywgc2V0TWlkaUlucHV0U29uZywgc2V0TWlkaU91dHB1dFNvbmd9IGZyb20gJy4vaW5pdF9taWRpJztcblxuXG5sZXQgc29uZ0lkID0gMCxcbiAgY29uZmlnID0gZ2V0Q29uZmlnKCksXG4gIGRlZmF1bHRTb25nID0gY29uZmlnLmdldCgnZGVmYXVsdFNvbmcnKTtcblxuXG5jbGFzcyBTb25ne1xuXG4gIC8qXG4gICAgQHBhcmFtIHNldHRpbmdzIGlzIGEgTWFwIG9yIGFuIE9iamVjdFxuICAqL1xuICBjb25zdHJ1Y3RvcihzZXR0aW5ncyl7XG5cbiAgICB0aGlzLmlkID0gJ1MnICsgc29uZ0lkKysgKyBEYXRlLm5vdygpO1xuICAgIHRoaXMubmFtZSA9IHRoaXMuaWQ7XG4gICAgdGhpcy50cmFja3MgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5wYXJ0cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmV2ZW50cyA9IFtdOyAvLyBhbGwgbWlkaSBhbmQgYXVkaW8gZXZlbnRzXG4gICAgdGhpcy5hbGxFdmVudHMgPSBbXTsgLy9cbiAgICB0aGlzLnRpbWVFdmVudHMgPSBbXTsgLy8gYWxsIHRlbXBvIGFuZCB0aW1lIHNpZ25hdHVyZSBldmVudHNcblxuICAgIC8vIGZpcnN0IGFkZCBhbGwgc2V0dGluZ3MgZnJvbSB0aGUgZGVmYXVsdCBzb25nXG4vLy8qXG4gICAgZGVmYXVsdFNvbmcuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KXtcbiAgICAgIHRoaXNba2V5XSA9IHZhbHVlO1xuICAgIH0sIHRoaXMpO1xuLy8qL1xuLypcbiAgICAvLyBvcjpcbiAgICBmb3IobGV0W3ZhbHVlLCBrZXldIG9mIGRlZmF1bHRTb25nLmVudHJpZXMoKSl7XG4gICAgICAoKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgdGhpc1trZXldID0gdmFsdWU7XG4gICAgICB9KShrZXksIHZhbHVlKTtcbiAgICB9XG4qL1xuXG4gICAgLy8gdGhlbiBvdmVycmlkZSBzZXR0aW5ncyBieSBwcm92aWRlZCBzZXR0aW5nc1xuICAgIGlmKHR5cGVTdHJpbmcoc2V0dGluZ3MpID09PSAnb2JqZWN0Jyl7XG4gICAgICBPYmplY3Qua2V5cyhzZXR0aW5ncykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgICB0aGlzW2tleV0gPSBzZXR0aW5nc1trZXldO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfWVsc2UgaWYoc2V0dGluZ3MgIT09IHVuZGVmaW5lZCl7XG4gICAgICBzZXR0aW5ncy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuICAgICAgICB0aGlzW2tleV0gPSB2YWx1ZTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH1cblxuICAgIC8vIGluaXRpYWxpemUgbWlkaSBmb3IgdGhpcyBzb25nOiBhZGQgTWFwcyBmb3IgbWlkaSBpbi0gYW5kIG91dHB1dHMsIGFuZCBhZGQgZXZlbnRsaXN0ZW5lcnMgdG8gdGhlIG1pZGkgaW5wdXRzXG4gICAgdGhpcy5taWRpSW5wdXRzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMubWlkaU91dHB1dHMgPSBuZXcgTWFwKCk7XG4gICAgaW5pdE1pZGlTb25nKHRoaXMpOyAvLyBAc2VlOiBpbml0X21pZGkuanNcblxuICAgIHRoaXMubGFzdEJhciA9IHRoaXMuYmFycztcbiAgICB0aGlzLnBpdGNoUmFuZ2UgPSB0aGlzLmhpZ2hlc3ROb3RlIC0gdGhpcy5sb3dlc3ROb3RlICsgMTtcbiAgICB0aGlzLmZhY3RvciA9IDQvdGhpcy5kZW5vbWluYXRvcjtcbiAgICB0aGlzLnRpY2tzUGVyQmVhdCA9IHRoaXMucHBxICogdGhpcy5mYWN0b3I7XG4gICAgdGhpcy50aWNrc1BlckJhciA9IHRoaXMudGlja3NQZXJCZWF0ICogdGhpcy5ub21pbmF0b3I7XG4gICAgdGhpcy5taWxsaXNQZXJUaWNrID0gKDYwMDAwL3RoaXMuYnBtL3RoaXMucHBxKTtcbiAgICB0aGlzLnJlY29yZElkID0gLTE7XG4gICAgdGhpcy5kb0xvb3AgPSBmYWxzZTtcbiAgICB0aGlzLmlsbGVnYWxMb29wID0gdHJ1ZTtcbiAgICB0aGlzLmxvb3BTdGFydCA9IDA7XG4gICAgdGhpcy5sb29wRW5kID0gMDtcbiAgICB0aGlzLmxvb3BEdXJhdGlvbiA9IDA7XG4gICAgdGhpcy5hdWRpb1JlY29yZGluZ0xhdGVuY3kgPSAwO1xuICAgIHRoaXMuZ3JpZCA9IHVuZGVmaW5lZDtcblxuICAgIGNvbmZpZy5nZXQoJ2FjdGl2ZVNvbmdzJylbdGhpcy5pZF0gPSB0aGlzO1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcbi8qXG4gICAgaWYoc2V0dGluZ3MudGltZUV2ZW50cyAmJiBzZXR0aW5ncy50aW1lRXZlbnRzLmxlbmd0aCA+IDApe1xuICAgICAgdGhpcy50aW1lRXZlbnRzID0gW10uY29uY2F0KHNldHRpbmdzLnRpbWVFdmVudHMpO1xuXG4gICAgICB0aGlzLnRlbXBvRXZlbnQgPSBnZXRUaW1lRXZlbnRzKHNlcXVlbmNlci5URU1QTywgdGhpcylbMF07XG4gICAgICB0aGlzLnRpbWVTaWduYXR1cmVFdmVudCA9IGdldFRpbWVFdmVudHMoc2VxdWVuY2VyLlRJTUVfU0lHTkFUVVJFLCB0aGlzKVswXTtcblxuICAgICAgaWYodGhpcy50ZW1wb0V2ZW50ID09PSB1bmRlZmluZWQpe1xuICAgICAgICB0aGlzLnRlbXBvRXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoMCwgc2VxdWVuY2VyLlRFTVBPLCB0aGlzLmJwbSk7XG4gICAgICAgIHRoaXMudGltZUV2ZW50cy51bnNoaWZ0KHRoaXMudGVtcG9FdmVudCk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5icG0gPSB0aGlzLnRlbXBvRXZlbnQuYnBtO1xuICAgICAgfVxuICAgICAgaWYodGhpcy50aW1lU2lnbmF0dXJlRXZlbnQgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHRoaXMudGltZVNpZ25hdHVyZUV2ZW50ID0gY3JlYXRlTWlkaUV2ZW50KDAsIHNlcXVlbmNlci5USU1FX1NJR05BVFVSRSwgdGhpcy5ub21pbmF0b3IsIHRoaXMuZGVub21pbmF0b3IpO1xuICAgICAgICB0aGlzLnRpbWVFdmVudHMudW5zaGlmdCh0aGlzLnRpbWVTaWduYXR1cmVFdmVudCk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5ub21pbmF0b3IgPSB0aGlzLnRpbWVTaWduYXR1cmVFdmVudC5ub21pbmF0b3I7XG4gICAgICAgIHRoaXMuZGVub21pbmF0b3IgPSB0aGlzLnRpbWVTaWduYXR1cmVFdmVudC5kZW5vbWluYXRvcjtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coMSwgdGhpcy5ub21pbmF0b3IsIHRoaXMuZGVub21pbmF0b3IsIHRoaXMuYnBtKTtcbiAgICB9ZWxzZXtcbiAgICAgIC8vIHRoZXJlIGhhcyB0byBiZSBhIHRlbXBvIGFuZCB0aW1lIHNpZ25hdHVyZSBldmVudCBhdCB0aWNrcyAwLCBvdGhlcndpc2UgdGhlIHBvc2l0aW9uIGNhbid0IGJlIGNhbGN1bGF0ZWQsIGFuZCBtb3Jlb3ZlciwgaXQgaXMgZGljdGF0ZWQgYnkgdGhlIE1JREkgc3RhbmRhcmRcbiAgICAgIHRoaXMudGVtcG9FdmVudCA9IGNyZWF0ZU1pZGlFdmVudCgwLCBzZXF1ZW5jZXIuVEVNUE8sIHRoaXMuYnBtKTtcbiAgICAgIHRoaXMudGltZVNpZ25hdHVyZUV2ZW50ID0gY3JlYXRlTWlkaUV2ZW50KDAsIHNlcXVlbmNlci5USU1FX1NJR05BVFVSRSwgdGhpcy5ub21pbmF0b3IsIHRoaXMuZGVub21pbmF0b3IpO1xuICAgICAgdGhpcy50aW1lRXZlbnRzID0gW1xuICAgICAgICB0aGlzLnRlbXBvRXZlbnQsXG4gICAgICAgIHRoaXMudGltZVNpZ25hdHVyZUV2ZW50XG4gICAgICBdO1xuICAgIH1cblxuICAgIC8vIFRPRE86IEEgdmFsdWUgZm9yIGJwbSwgbm9taW5hdG9yIGFuZCBkZW5vbWluYXRvciBpbiB0aGUgY29uZmlnIG92ZXJydWxlcyB0aGUgdGltZSBldmVudHMgc3BlY2lmaWVkIGluIHRoZSBjb25maWcgLT4gbWF5YmUgdGhpcyBzaG91bGQgYmUgdGhlIG90aGVyIHdheSByb3VuZFxuXG4gICAgLy8gaWYgYSB2YWx1ZSBmb3IgYnBtIGlzIHNldCBpbiB0aGUgY29uZmlnLCBhbmQgdGhpcyB2YWx1ZSBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgYnBtIHZhbHVlIG9mIHRoZSBmaXJzdFxuICAgIC8vIHRlbXBvIGV2ZW50LCBhbGwgdGVtcG8gZXZlbnRzIHdpbGwgYmUgdXBkYXRlZCB0byB0aGUgYnBtIHZhbHVlIGluIHRoZSBjb25maWcuXG4gICAgaWYoY29uZmlnLnRpbWVFdmVudHMgIT09IHVuZGVmaW5lZCAmJiBjb25maWcuYnBtICE9PSB1bmRlZmluZWQpe1xuICAgICAgaWYodGhpcy5icG0gIT09IGNvbmZpZy5icG0pe1xuICAgICAgICB0aGlzLnNldFRlbXBvKGNvbmZpZy5icG0sIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiBhIHZhbHVlIGZvciBub21pbmF0b3IgYW5kL29yIGRlbm9taW5hdG9yIGlzIHNldCBpbiB0aGUgY29uZmlnLCBhbmQgdGhpcy90aGVzZSB2YWx1ZShzKSBpcy9hcmUgZGlmZmVyZW50IGZyb20gdGhlIHZhbHVlc1xuICAgIC8vIG9mIHRoZSBmaXJzdCB0aW1lIHNpZ25hdHVyZSBldmVudCwgYWxsIHRpbWUgc2lnbmF0dXJlIGV2ZW50cyB3aWxsIGJlIHVwZGF0ZWQgdG8gdGhlIHZhbHVlcyBpbiB0aGUgY29uZmlnLlxuICAgIC8vIEBUT0RPOiBtYXliZSBvbmx5IHRoZSBmaXJzdCB0aW1lIHNpZ25hdHVyZSBldmVudCBzaG91bGQgYmUgdXBkYXRlZD9cbiAgICBpZihjb25maWcudGltZUV2ZW50cyAhPT0gdW5kZWZpbmVkICYmIChjb25maWcubm9taW5hdG9yICE9PSB1bmRlZmluZWQgfHwgY29uZmlnLmRlbm9taW5hdG9yICE9PSB1bmRlZmluZWQpKXtcbiAgICAgIGlmKHRoaXMubm9taW5hdG9yICE9PSBjb25maWcubm9taW5hdG9yIHx8IHRoaXMuZGVub21pbmF0b3IgIT09IGNvbmZpZy5kZW5vbWluYXRvcil7XG4gICAgICAgIHRoaXMuc2V0VGltZVNpZ25hdHVyZShjb25maWcubm9taW5hdG9yIHx8IHRoaXMubm9taW5hdG9yLCBjb25maWcuZGVub21pbmF0b3IgfHwgdGhpcy5kZW5vbWluYXRvciwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vY29uc29sZS5sb2coMiwgdGhpcy5ub21pbmF0b3IsIHRoaXMuZGVub21pbmF0b3IsIHRoaXMuYnBtKTtcblxuICAgIHRoaXMudHJhY2tzID0gW107XG4gICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgIHRoaXMubm90ZXMgPSBbXTtcbiAgICB0aGlzLmV2ZW50cyA9IFtdOy8vLmNvbmNhdCh0aGlzLnRpbWVFdmVudHMpO1xuICAgIHRoaXMuYWxsRXZlbnRzID0gW107IC8vIGFsbCBldmVudHMgcGx1cyBtZXRyb25vbWUgdGlja3NcblxuICAgIHRoaXMudHJhY2tzQnlJZCA9IHt9O1xuICAgIHRoaXMudHJhY2tzQnlOYW1lID0ge307XG4gICAgdGhpcy5wYXJ0c0J5SWQgPSB7fTtcbiAgICB0aGlzLm5vdGVzQnlJZCA9IHt9O1xuICAgIHRoaXMuZXZlbnRzQnlJZCA9IHt9O1xuXG4gICAgdGhpcy5hY3RpdmVFdmVudHMgPSBudWxsO1xuICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBudWxsO1xuICAgIHRoaXMuYWN0aXZlUGFydHMgPSBudWxsO1xuXG4gICAgdGhpcy5yZWNvcmRlZE5vdGVzID0gW107XG4gICAgdGhpcy5yZWNvcmRlZEV2ZW50cyA9IFtdO1xuICAgIHRoaXMucmVjb3JkaW5nTm90ZXMgPSB7fTsgLy8gbm90ZXMgdGhhdCBkb24ndCBoYXZlIHRoZWlyIG5vdGUgb2ZmIGV2ZW50cyB5ZXRcblxuICAgIHRoaXMubnVtVHJhY2tzID0gMDtcbiAgICB0aGlzLm51bVBhcnRzID0gMDtcbiAgICB0aGlzLm51bU5vdGVzID0gMDtcbiAgICB0aGlzLm51bUV2ZW50cyA9IDA7XG4gICAgdGhpcy5pbnN0cnVtZW50cyA9IFtdO1xuXG4gICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICAgIHRoaXMucmVjb3JkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5wcmVyb2xsaW5nID0gZmFsc2U7XG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlO1xuICAgIHRoaXMucHJlcm9sbCA9IHRydWU7XG4gICAgdGhpcy5wcmVjb3VudCA9IDA7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcblxuICAgIHRoaXMucGxheWhlYWQgPSBjcmVhdGVQbGF5aGVhZCh0aGlzLCB0aGlzLnBvc2l0aW9uVHlwZSwgdGhpcy5pZCwgdGhpcyk7Ly8sIHRoaXMucG9zaXRpb24pO1xuICAgIHRoaXMucGxheWhlYWRSZWNvcmRpbmcgPSBjcmVhdGVQbGF5aGVhZCh0aGlzLCAnYWxsJywgdGhpcy5pZCArICdfcmVjb3JkaW5nJyk7XG4gICAgdGhpcy5zY2hlZHVsZXIgPSBjcmVhdGVTY2hlZHVsZXIodGhpcyk7XG4gICAgdGhpcy5mb2xsb3dFdmVudCA9IGNyZWF0ZUZvbGxvd0V2ZW50KHRoaXMpO1xuXG4gICAgdGhpcy52b2x1bWUgPSAxO1xuICAgIHRoaXMuZ2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlKCk7XG4gICAgdGhpcy5nYWluTm9kZS5nYWluLnZhbHVlID0gdGhpcy52b2x1bWU7XG4gICAgdGhpcy5tZXRyb25vbWUgPSBjcmVhdGVNZXRyb25vbWUodGhpcywgZGlzcGF0Y2hFdmVudCk7XG4gICAgdGhpcy5jb25uZWN0KCk7XG5cblxuICAgIGlmKGNvbmZpZy5jbGFzc05hbWUgPT09ICdNaWRpRmlsZScgJiYgY29uZmlnLmxvYWRlZCA9PT0gZmFsc2Upe1xuICAgICAgaWYoc2VxdWVuY2VyLmRlYnVnKXtcbiAgICAgICAgY29uc29sZS53YXJuKCdtaWRpZmlsZScsIGNvbmZpZy5uYW1lLCAnaGFzIG5vdCB5ZXQgYmVlbiBsb2FkZWQhJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9pZihjb25maWcudHJhY2tzICYmIGNvbmZpZy50cmFja3MubGVuZ3RoID4gMCl7XG4gICAgaWYoY29uZmlnLnRyYWNrcyl7XG4gICAgICB0aGlzLmFkZFRyYWNrcyhjb25maWcudHJhY2tzKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcucGFydHMpe1xuICAgICAgdGhpcy5hZGRQYXJ0cyhjb25maWcucGFydHMpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5ldmVudHMpe1xuICAgICAgdGhpcy5hZGRFdmVudHMoY29uZmlnLmV2ZW50cyk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLmV2ZW50cyB8fCBjb25maWcucGFydHMgfHwgY29uZmlnLnRyYWNrcyl7XG4gICAgICAvL2NvbnNvbGUubG9nKGNvbmZpZy5ldmVudHMsIGNvbmZpZy5wYXJ0cywgY29uZmlnLnRyYWNrcylcbiAgICAgIC8vIHRoZSBsZW5ndGggb2YgdGhlIHNvbmcgd2lsbCBiZSBkZXRlcm1pbmVkIGJ5IHRoZSBldmVudHMsIHBhcnRzIGFuZC9vciB0cmFja3MgdGhhdCBhcmUgYWRkZWQgdG8gdGhlIHNvbmdcbiAgICAgIGlmKGNvbmZpZy5iYXJzID09PSB1bmRlZmluZWQpe1xuICAgICAgICB0aGlzLmxhc3RCYXIgPSAwO1xuICAgICAgfVxuICAgICAgdGhpcy5sYXN0RXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoW3RoaXMubGFzdEJhciwgc2VxdWVuY2VyLkVORF9PRl9UUkFDS10pO1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5sYXN0RXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoW3RoaXMuYmFycyAqIHRoaXMudGlja3NQZXJCYXIsIHNlcXVlbmNlci5FTkRfT0ZfVFJBQ0tdKTtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZygndXBkYXRlJyk7XG4gICAgdGhpcy51cGRhdGUodHJ1ZSk7XG5cbiAgICB0aGlzLm51bVRpbWVFdmVudHMgPSB0aGlzLnRpbWVFdmVudHMubGVuZ3RoO1xuICAgIHRoaXMucGxheWhlYWQuc2V0KCd0aWNrcycsIDApO1xuICAgIHRoaXMubWlkaUV2ZW50TGlzdGVuZXJzID0ge307XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnRpbWVFdmVudHMpO1xuXG4qL1xuICB9XG5cblxuICBzdG9wKCl7XG4gICAgZGlzcGF0Y2hFdmVudCgnc3RvcCcpO1xuICB9XG5cbiAgcGxheSgpe1xuICAgIGRpc3BhdGNoRXZlbnQoJ3BsYXknKTtcbiAgfVxuXG4gIHNldE1pZGlJbnB1dChpZCwgZmxhZyA9IHRydWUpe1xuICAgIHNldE1pZGlJbnB1dFNvbmcodGhpcywgaWQsIGZsYWcpO1xuICB9XG5cbiAgc2V0TWlkaU91dHB1dChpZCwgZmxhZyA9IHRydWUpe1xuICAgIHNldE1pZGlPdXRwdXRTb25nKHRoaXMsIGlkLCBmbGFnKTtcbiAgfVxuXG4gIGFkZE1pZGlFdmVudExpc3RlbmVyKC4uLmFyZ3Mpe1xuICAgIGFkZE1pZGlFdmVudExpc3RlbmVyKHRoaXMsIC4uLmFyZ3MpO1xuICB9XG59XG5cblNvbmcucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyO1xuU29uZy5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50TGlzdGVuZXI7XG5Tb25nLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZGlzcGF0Y2hFdmVudDtcblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTb25nKHNldHRpbmdzKXtcbiAgcmV0dXJuIG5ldyBTb25nKHNldHRpbmdzKTtcbn0iLCJsZXQgbGlzdGVuZXJzID0ge307XG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoaWQsIGNhbGxiYWNrKXtcbiAgbGlzdGVuZXJzW2lkXSA9IGNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKGlkLCBjYWxsYmFjayl7XG4gIGRlbGV0ZSBsaXN0ZW5lcnNbaWRdO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGlkKXtcbiAgZm9yKGxldCBrZXkgaW4gbGlzdGVuZXJzKXtcbiAgICBpZihrZXkgPT09IGlkICYmIGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgIGxpc3RlbmVyc1trZXldKGlkKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHthZGRFdmVudExpc3RlbmVyIGFzIGFkZEV2ZW50TGlzdGVuZXJ9O1xuZXhwb3J0IHtyZW1vdmVFdmVudExpc3RlbmVyIGFzIHJlbW92ZUV2ZW50TGlzdGVuZXJ9O1xuZXhwb3J0IHtkaXNwYXRjaEV2ZW50IGFzIGRpc3BhdGNoRXZlbnR9OyIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtsb2csIGluZm8sIHdhcm4sIGVycm9yLCBiYXNlNjRUb0JpbmFyeSwgYWpheH0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCBwYXJzZU1JRElGaWxlIGZyb20gJy4vbWlkaV9wYXJzZSc7XG5pbXBvcnQgY3JlYXRlTUlESUV2ZW50IGZyb20gJy4vbWlkaV9ldmVudCc7XG5pbXBvcnQgY3JlYXRlUGFydCBmcm9tICcuL3BhcnQnO1xuaW1wb3J0IGNyZWF0ZVRyYWNrIGZyb20gJy4vdHJhY2snO1xuaW1wb3J0IGNyZWF0ZVNvbmcgZnJvbSAnLi9zb25nJztcblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTb25nRnJvbU1JRElGaWxlKGNvbmZpZyl7XG4gIGxldCBidWZmZXI7XG5cbiAgaWYoY29uZmlnLmFycmF5YnVmZmVyICE9PSB1bmRlZmluZWQpe1xuICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGNvbmZpZy5hcnJheWJ1ZmZlcik7XG4gICAgcmV0dXJuIHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICB9ZWxzZSBpZihjb25maWcuYmFzZTY0ICE9PSB1bmRlZmluZWQpe1xuICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQmluYXJ5KGNvbmZpZy5iYXNlNjQpKTtcbiAgICByZXR1cm4gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gIH1lbHNlIGlmKGNvbmZpZy5wYXJzZWQgIT09IHVuZGVmaW5lZCl7XG4gICAgcmV0dXJuIHRvU29uZyhjb25maWcucGFyc2VkKTtcbi8qXG4gIH1lbHNlIGlmKGNvbmZpZy51cmwgIT09IHVuZGVmaW5lZCl7XG4gICAgYWpheCh7dXJsOiBjb25maWcudXJsLCByZXNwb25zZVR5cGU6ICdhcnJheWJ1ZmZlcid9KS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQoZGF0YSl7XG4gICAgICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgICByZXR1cm4gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChlKXtcbiAgICAgICAgZXJyb3IoZSk7XG4gICAgICB9XG4gICAgKTtcbiovXG4gIH1cbn1cblxuXG5mdW5jdGlvbiB0b1NvbmcocGFyc2VkKXtcbiAgbGV0IHRyYWNrcyA9IHBhcnNlZC50cmFja3M7XG4gIGxldCBwcHEgPSBwYXJzZWQuaGVhZGVyLnRpY2tzUGVyQmVhdDtcbiAgbGV0IHRpbWVFdmVudHMgPSBbXTtcbiAgbGV0IGNvbmZpZyA9IHtcbiAgICB0cmFja3M6IFtdXG4gIH07XG4gIGxldCBldmVudHM7XG5cbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3MudmFsdWVzKCkpe1xuICAgIGxldCBsYXN0VGlja3MsIGxhc3RUeXBlO1xuICAgIGxldCB0aWNrcyA9IDA7XG4gICAgbGV0IHR5cGU7XG4gICAgbGV0IGNoYW5uZWwgPSAtMTtcbiAgICBldmVudHMgPSBbXTtcblxuICAgIGZvcihsZXQgZXZlbnQgb2YgdHJhY2spe1xuICAgICAgdGlja3MgKz0gKGV2ZW50LmRlbHRhVGltZSAqIHBwcSk7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnN1YnR5cGUsIGV2ZW50LmRlbHRhVGltZSwgdG1wVGlja3MpO1xuXG4gICAgICBpZihjaGFubmVsID09PSAtMSAmJiBldmVudC5jaGFubmVsICE9PSB1bmRlZmluZWQpe1xuICAgICAgICBjaGFubmVsID0gZXZlbnQuY2hhbm5lbDtcbiAgICAgICAgdHJhY2suY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgICB9XG4gICAgICB0eXBlID0gZXZlbnQuc3VidHlwZTtcblxuICAgICAgc3dpdGNoKGV2ZW50LnN1YnR5cGUpe1xuXG4gICAgICAgIGNhc2UgJ3RyYWNrTmFtZSc6XG4gICAgICAgICAgdHJhY2submFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnbmFtZScsIHRyYWNrLm5hbWUsIG51bVRyYWNrcyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnaW5zdHJ1bWVudE5hbWUnOlxuICAgICAgICAgIGlmKGV2ZW50LnRleHQpe1xuICAgICAgICAgICAgdHJhY2suaW5zdHJ1bWVudE5hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdub3RlT24nOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHg5MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdub3RlT2ZmJzpcbiAgICAgICAgICBldmVudHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4ODAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnc2V0VGVtcG8nOlxuICAgICAgICAgIC8vIHNvbWV0aW1lcyAyIHRlbXBvIGV2ZW50cyBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uIGluIHRpY2tzXG4gICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICBsZXQgYnBtID0gNjAwMDAwMDAvZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdDtcblxuICAgICAgICAgIGlmKHRpY2tzID09PSBsYXN0VGlja3MgJiYgdHlwZSA9PT0gbGFzdFR5cGUpe1xuICAgICAgICAgICAgaW5mbygndGVtcG8gZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2snLCB0aWNrcywgYnBtKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoY29uZmlnLmJwbSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIGNvbmZpZy5icG0gPSBicG07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRpbWVFdmVudHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4NTEsIGJwbSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3RpbWVTaWduYXR1cmUnOlxuICAgICAgICAgIC8vIHNvbWV0aW1lcyAyIHRpbWUgc2lnbmF0dXJlIGV2ZW50cyBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uIGluIHRpY2tzXG4gICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICBpZihsYXN0VGlja3MgPT09IHRpY2tzICYmIGxhc3RUeXBlID09PSB0eXBlKXtcbiAgICAgICAgICAgIGluZm8oJ3RpbWUgc2lnbmF0dXJlIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihjb25maWcubm9taW5hdG9yID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgY29uZmlnLm5vbWluYXRvciA9IGV2ZW50Lm51bWVyYXRvcjtcbiAgICAgICAgICAgIGNvbmZpZy5kZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweDU4LCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKSk7XG4gICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlICdjb250cm9sbGVyJzpcbiAgICAgICAgICBldmVudHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4QjAsIGV2ZW50LmNvbnRyb2xsZXJUeXBlLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3Byb2dyYW1DaGFuZ2UnOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHhDMCwgZXZlbnQucHJvZ3JhbU51bWJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3BpdGNoQmVuZCc6XG4gICAgICAgICAgZXZlbnRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweEUwLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCBldmVudC50eXBlKTtcbiAgICAgIH1cblxuICAgICAgbGFzdFR5cGUgPSB0eXBlO1xuICAgICAgbGFzdFRpY2tzID0gdGlja3M7XG4gICAgfVxuXG4gICAgaWYocGFyc2VkLmxlbmd0aCA+IDApe1xuICAgICAgbGV0IHRyYWNrID0gY3JlYXRlVHJhY2soKTtcbiAgICAgIGxldCBwYXJ0ID0gY3JlYXRlUGFydCgpO1xuICAgICAgdHJhY2suYWRkUGFydChwYXJ0KTtcbiAgICAgIHBhcnQuYWRkRXZlbnRzKHBhcnNlZCk7XG4gICAgICBjb25maWcudHJhY2tzLnB1c2godHJhY2spO1xuICAgIH1cbiAgfVxuXG4gIGNvbmZpZy5wcHEgPSBwcHE7XG4gIGNvbmZpZy50aW1lRXZlbnRzID0gdGltZUV2ZW50cztcbiAgbGV0IHNvbmcgPSBjcmVhdGVTb25nKGNvbmZpZyk7XG4gIHNvbmcudGltZUV2ZW50cyA9IHRpbWVFdmVudHM7XG5cbiAgc29uZy5ldmVudHNNaWRpQXVkaW9NZXRyb25vbWUgPSBwYXJzZWQ7XG5cbiAgLy9yZXR1cm4gY3JlYXRlU29uZyhjb25maWcpO1xufSIsIid1c2Ugc3RyaWN0JztcblxubGV0IHRyYWNrSWQgPSAwO1xuXG5cbmNsYXNzIFRyYWNre1xuXG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgIGxldCBpZCA9ICdQJyArIHRyYWNrSWQrKyArIERhdGUubm93KCk7XG5cbiAgfVxuXG5cblxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVUcmFjaygpe1xuICByZXR1cm4gbmV3IFRyYWNrKC4uLmFyZ3VtZW50cyk7XG59XG5cblxuLypcbmxldCBUcmFjayA9IHtcbiAgICBpbml0OiBmdW5jdGlvbigpe1xuICAgICAgICBsZXQgaWQgPSAnVCcgKyB0cmFja0lkKysgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpZCcsIHtcbiAgICAgICAgICAgIHZhbHVlOiBpZFxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVUcmFjaygpe1xuICB2YXIgdCA9IE9iamVjdC5jcmVhdGUoVHJhY2spO1xuICB0LmluaXQoYXJndW1lbnRzKTtcbiAgcmV0dXJuIHQ7XG59XG5cbiovIiwiLypcbiAgQW4gdW5vcmdhbmlzZWQgY29sbGVjdGlvbiBvZiB2YXJpb3VzIHV0aWxpdHkgZnVuY3Rpb25zIHRoYXQgYXJlIHVzZWQgYWNyb3NzIHRoZSBsaWJyYXJ5XG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBnZXRDb25maWcgZnJvbSAnLi9jb25maWcnO1xuXG5sZXRcbiAgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlLFxuICBtUG93ID0gTWF0aC5wb3csXG4gIG1Sb3VuZCA9IE1hdGgucm91bmQsXG4gIG1GbG9vciA9IE1hdGguZmxvb3IsXG4gIG1SYW5kb20gPSBNYXRoLnJhbmRvbSxcbiAgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIC8vIGNvbnRleHQgPSBjb25maWcuY29udGV4dCxcbiAgLy8gZmxvb3IgPSBmdW5jdGlvbih2YWx1ZSl7XG4gIC8vICByZXR1cm4gdmFsdWUgfCAwO1xuICAvLyB9LFxuXG5jb25zdFxuICBub3RlTGVuZ3RoTmFtZXMgPSB7XG4gICAgMTogJ3F1YXJ0ZXInLFxuICAgIDI6ICdlaWdodGgnLFxuICAgIDQ6ICdzaXh0ZWVudGgnLFxuICAgIDg6ICczMnRoJyxcbiAgICAxNjogJzY0dGgnXG4gIH07XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVTdHJpbmcobyl7XG4gIGlmKHR5cGVvZiBvICE9ICdvYmplY3QnKXtcbiAgICByZXR1cm4gdHlwZW9mIG87XG4gIH1cblxuICBpZihvID09PSBudWxsKXtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG5cbiAgLy9vYmplY3QsIGFycmF5LCBmdW5jdGlvbiwgZGF0ZSwgcmVnZXhwLCBzdHJpbmcsIG51bWJlciwgYm9vbGVhbiwgZXJyb3JcbiAgbGV0IGludGVybmFsQ2xhc3MgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdFxccyhcXHcrKVxcXS8pWzFdO1xuICByZXR1cm4gaW50ZXJuYWxDbGFzcy50b0xvd2VyQ2FzZSgpO1xufVxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFqYXgoY29uZmlnKXtcbiAgbGV0XG4gICAgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpLFxuICAgIG1ldGhvZCA9IGNvbmZpZy5tZXRob2QgPT09IHVuZGVmaW5lZCA/ICdHRVQnIDogY29uZmlnLm1ldGhvZCxcbiAgICBmaWxlU2l6ZTtcblxuICBmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3Qpe1xuXG4gICAgcmVqZWN0ID0gcmVqZWN0IHx8IGZ1bmN0aW9uKCl7fTtcbiAgICByZXNvbHZlID0gcmVzb2x2ZSB8fCBmdW5jdGlvbigpe307XG5cbiAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZihyZXF1ZXN0LnN0YXR1cyAhPT0gMjAwKXtcbiAgICAgICAgcmVqZWN0KHJlcXVlc3Quc3RhdHVzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZihjb25maWcucmVzcG9uc2VUeXBlID09PSAnanNvbicpe1xuICAgICAgICBmaWxlU2l6ZSA9IHJlcXVlc3QucmVzcG9uc2UubGVuZ3RoO1xuICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSksIGZpbGVTaXplKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZShyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICBjb25maWcub25FcnJvcihlKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgY29uZmlnLnVybCwgdHJ1ZSk7XG5cbiAgICBpZihjb25maWcub3ZlcnJpZGVNaW1lVHlwZSl7XG4gICAgICAgIHJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZShjb25maWcub3ZlcnJpZGVNaW1lVHlwZSk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSl7XG4gICAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZihtZXRob2QgPT09ICdQT1NUJykge1xuICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcuZGF0YSl7XG4gICAgICAgIHJlcXVlc3Quc2VuZChjb25maWcuZGF0YSk7XG4gICAgfWVsc2V7XG4gICAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShleGVjdXRvcik7XG59XG5cblxuZnVuY3Rpb24gcGFyc2VTYW1wbGUoc2FtcGxlLCBpZCwgZXZlcnkpe1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICB0cnl7XG4gICAgICBjb25maWcuY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoc2FtcGxlLFxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MoYnVmZmVyKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBidWZmZXIpO1xuICAgICAgICAgIGlmKGlkICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7J2lkJzogaWQsICdidWZmZXInOiBidWZmZXJ9KTtcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoeydpZCc6IGlkLCAnYnVmZmVyJzogYnVmZmVyfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXNvbHZlKGJ1ZmZlcik7XG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KGJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIG9uRXJyb3IoZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2Vycm9yIGRlY29kaW5nIGF1ZGlvZGF0YScsIGlkLCBlKTtcbiAgICAgICAgLy9yZWplY3QoZSk7IC8vIGRvbid0IHVzZSByZWplY3QgYmVjYXVzZSB3ZSB1c2UgdGhpcyBhcyBhIG5lc3RlZCBwcm9taXNlIGFuZCB3ZSBkb24ndCB3YW50IHRoZSBwYXJlbnQgcHJvbWlzZSB0byByZWplY3RcbiAgICAgICAgaWYoaWQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgcmVzb2x2ZSh7J2lkJzogaWQsICdidWZmZXInOiB1bmRlZmluZWR9KTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgICB9Y2F0Y2goZSl7XG4gICAgICAvL2NvbnNvbGUubG9nKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSk7XG4gICAgICAvL3JlamVjdChlKTtcbiAgICAgIGlmKGlkICE9PSB1bmRlZmluZWQpe1xuICAgICAgICByZXNvbHZlKHsnaWQnOiBpZCwgJ2J1ZmZlcic6IHVuZGVmaW5lZH0pO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5cbmZ1bmN0aW9uIGxvYWRBbmRQYXJzZVNhbXBsZSh1cmwsIGlkLCBldmVyeSl7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3Qpe1xuICAgIGFqYXgoe3VybDogdXJsLCByZXNwb25zZVR5cGU6ICdhcnJheWJ1ZmZlcid9KS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQoZGF0YSl7XG4gICAgICAgIHBhcnNlU2FtcGxlKGRhdGEsIGlkLCBldmVyeSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoKXtcbiAgICAgICAgaWYoaWQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgcmVzb2x2ZSh7J2lkJzogaWQsICdidWZmZXInOiB1bmRlZmluZWR9KTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2FtcGxlcyhtYXBwaW5nLCBldmVyeSl7XG4gIGxldCBrZXksIHNhbXBsZSxcbiAgICBwcm9taXNlcyA9IFtdLFxuICAgIHR5cGUgPSB0eXBlU3RyaW5nKG1hcHBpbmcpO1xuXG4gIGV2ZXJ5ID0gdHlwZVN0cmluZyhldmVyeSkgPT09ICdmdW5jdGlvbicgPyBldmVyeSA6IGZhbHNlO1xuICAvL2NvbnNvbGUubG9nKHR5cGUsIG1hcHBpbmcpXG4gIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICBmb3Ioa2V5IGluIG1hcHBpbmcpe1xuICAgICAgaWYobWFwcGluZy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgICAgc2FtcGxlID0gbWFwcGluZ1trZXldO1xuICAgICAgICBpZihzYW1wbGUuaW5kZXhPZignaHR0cDovLycpID09PSAtMSl7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChwYXJzZVNhbXBsZShiYXNlNjRUb0JpbmFyeShzYW1wbGUpLCBrZXksIGV2ZXJ5KSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKHNhbXBsZSwga2V5LCBldmVyeSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICBtYXBwaW5nLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlKXtcbiAgICAgIGlmKHNhbXBsZS5pbmRleE9mKCdodHRwOi8vJykgPT09IC0xKXtcbiAgICAgICAgcHJvbWlzZXMucHVzaChwYXJzZVNhbXBsZShiYXNlNjRUb0JpbmFyeShzYW1wbGUpLCBldmVyeSkpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKHNhbXBsZSwgZXZlcnkpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQodmFsdWVzKXtcbiAgICAgICAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgIGxldCBtYXBwaW5nID0ge307XG4gICAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgICAgbWFwcGluZ1t2YWx1ZS5pZF0gPSB2YWx1ZS5idWZmZXI7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhtYXBwaW5nKTtcbiAgICAgICAgICByZXNvbHZlKG1hcHBpbmcpO1xuICAgICAgICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKGUpe1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9XG4gICAgKTtcbiAgfSk7XG59XG5cblxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5mdW5jdGlvbiBiYXNlNjRUb0JpbmFyeShpbnB1dCl7XG4gIGxldCBrZXlTdHIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nLFxuICAgIGJ5dGVzLCB1YXJyYXksIGJ1ZmZlcixcbiAgICBsa2V5MSwgbGtleTIsXG4gICAgY2hyMSwgY2hyMiwgY2hyMyxcbiAgICBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0LFxuICAgIGksIGogPSAwO1xuXG4gIGJ5dGVzID0gTWF0aC5jZWlsKCgzICogaW5wdXQubGVuZ3RoKSAvIDQuMCk7XG4gIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihieXRlcyk7XG4gIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgbGtleTEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoLTEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoLTEpKTtcbiAgaWYobGtleTEgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuICBpZihsa2V5MiA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG5cbiAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgJycpO1xuXG4gIGZvcihpID0gMDsgaSA8IGJ5dGVzOyBpICs9IDMpIHtcbiAgICAvL2dldCB0aGUgMyBvY3RlY3RzIGluIDQgYXNjaWkgY2hhcnNcbiAgICBlbmMxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMyA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmM0ID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuXG4gICAgY2hyMSA9IChlbmMxIDw8IDIpIHwgKGVuYzIgPj4gNCk7XG4gICAgY2hyMiA9ICgoZW5jMiAmIDE1KSA8PCA0KSB8IChlbmMzID4+IDIpO1xuICAgIGNocjMgPSAoKGVuYzMgJiAzKSA8PCA2KSB8IGVuYzQ7XG5cbiAgICB1YXJyYXlbaV0gPSBjaHIxO1xuICAgIGlmKGVuYzMgIT0gNjQpIHVhcnJheVtpKzFdID0gY2hyMjtcbiAgICBpZihlbmM0ICE9IDY0KSB1YXJyYXlbaSsyXSA9IGNocjM7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhidWZmZXIpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGVycm9yKCl7XG4gIGlmKGNvbmZpZy5nZXQoJ2RlYnVnTGV2ZWwnKSA+PSAxKXtcbiAgICBjb25zb2xlLmVycm9yKC4uLmFyZ3VtZW50cyk7XG4gICAgLy9jb25zb2xlLnRyYWNlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhcm4oKXtcbiAgaWYoY29uZmlnLmdldCgnZGVidWdMZXZlbCcpID49IDIpe1xuICAgIC8vY29uc29sZS53YXJuKC4uLmFyZ3VtZW50cyk7XG4gICAgY29uc29sZS50cmFjZSgnV0FSTklORycsIC4uLmFyZ3VtZW50cyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluZm8oKXtcbiAgaWYoY29uZmlnLmdldCgnZGVidWdMZXZlbCcpID49IDMpe1xuICAgIC8vY29uc29sZS5pbmZvKC4uLmFyZ3VtZW50cyk7XG4gICAgY29uc29sZS50cmFjZSgnSU5GTycsIC4uLmFyZ3VtZW50cyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZygpe1xuICBpZihjb25maWcuZ2V0KCdkZWJ1Z0xldmVsJykgPj0gNCl7XG4gICAgLy9jb25zb2xlLmxvZyguLi5hcmd1bWVudHMpO1xuICAgIGNvbnNvbGUudHJhY2UoJ0xPRycsIC4uLmFyZ3VtZW50cyk7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmljZVRpbWUobWlsbGlzKXtcbiAgbGV0IGgsIG0sIHMsIG1zLFxuICAgICAgc2Vjb25kcyxcbiAgICAgIHRpbWVBc1N0cmluZyA9ICcnO1xuXG4gIHNlY29uZHMgPSBtaWxsaXMvMTAwMDsgLy8g4oaSIG1pbGxpcyB0byBzZWNvbmRzXG4gIGggPSBtRmxvb3Ioc2Vjb25kcyAvICg2MCAqIDYwKSk7XG4gIG0gPSBtRmxvb3IoKHNlY29uZHMgJSAoNjAgKiA2MCkpIC8gNjApO1xuICBzID0gbUZsb29yKHNlY29uZHMgJSAoNjApKTtcbiAgbXMgPSBtUm91bmQoKHNlY29uZHMgLSAoaCAqIDM2MDApIC0gKG0gKiA2MCkgLSBzKSAqIDEwMDApO1xuXG4gIHRpbWVBc1N0cmluZyArPSBoICsgJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbSA8IDEwID8gJzAnICsgbSA6IG07XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBzIDwgMTAgPyAnMCcgKyBzIDogcztcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG1zID09PSAwID8gJzAwMCcgOiBtcyA8IDEwID8gJzAwJyArIG1zIDogbXMgPCAxMDAgPyAnMCcgKyBtcyA6IG1zO1xuXG4gIC8vY29uc29sZS5sb2coaCwgbSwgcywgbXMpO1xuICByZXR1cm4ge1xuICAgICAgaG91cjogaCxcbiAgICAgIG1pbnV0ZTogbSxcbiAgICAgIHNlY29uZDogcyxcbiAgICAgIG1pbGxpc2Vjb25kOiBtcyxcbiAgICAgIHRpbWVBc1N0cmluZzogdGltZUFzU3RyaW5nLFxuICAgICAgdGltZUFzQXJyYXk6IFtoLCBtLCBzLCBtc11cbiAgfTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHthamF4fSBmcm9tICcuLi9zcmMvdXRpbCc7XG5pbXBvcnQgcGFyc2VNSURJRmlsZSBmcm9tICcuLi9zcmMvbWlkaV9wYXJzZSc7XG5pbXBvcnQgY3JlYXRlU29uZ0Zyb21NSURJRmlsZSBmcm9tICcuLi9zcmMvc29uZ19mcm9tX21pZGlmaWxlJztcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuLypcbiAgYWpheCh7dXJsOicuLi9kYXRhL0pOLTMtNDQubWlkJywgcmVzcG9uc2VUeXBlOiAnYXJyYXlidWZmZXInfSkudGhlbihcbiAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChkYXRhKXtcbiAgICAgIC8vY29uc29sZS5sb2coZGF0YSk7XG4gICAgICBsZXQgcmVzdWx0ID0gcGFyc2VNSURJRmlsZShkYXRhKTtcbiAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoZSl7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgKTtcbiovXG5cblxuICBhamF4KHt1cmw6Jy4uL2RhdGEvSk4tMy00NC5taWQnLCByZXNwb25zZVR5cGU6ICdhcnJheWJ1ZmZlcid9KS50aGVuKFxuICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGRhdGEpe1xuICAgICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgIGxldCBzb25nID0gY3JlYXRlU29uZ0Zyb21NSURJRmlsZSh7YXJyYXlidWZmZXI6ZGF0YX0pO1xuICAgICAgY29uc29sZS5sb2coc29uZyk7XG4gICAgfSxcblxuICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoZSl7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgKTtcbn07Il19
