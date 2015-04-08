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
  return false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvY29uZmlnLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL2luaXRfbWlkaS5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9taWRpX2V2ZW50LmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL21pZGlfcGFyc2UuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvbWlkaV9zdHJlYW0uanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvbm90ZS5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9wYXJ0LmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3NvbmcuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvc29uZ19hZGRfZXZlbnRsaXN0ZW5lci5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9zb25nX2Zyb21fbWlkaWZpbGUuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvdHJhY2suanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvdXRpbC5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3Rlc3QvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDTUEsSUFDRSxNQUFNLFlBQUE7SUFDTixXQUFXLFlBQUE7SUFDWCxFQUFFLEdBQUcsSUFBSTtJQUNULEVBQUUsR0FBRyxTQUFTO0lBQ2QsT0FBTyxHQUFHLElBQUksQ0FBQzs7QUFHakIsU0FBUyxTQUFTLEdBQUU7QUFDbEIsTUFBRyxNQUFNLEtBQUssU0FBUyxF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RSxDQUFDO0FBQ1QsZUFBVyxFQUFFLEVBQUU7QUFDZixnQkFBWSxFQUFFLFlBQVk7QUFDMUIsZUFBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO0dBQzdCLENBQUM7Q0FDSDs7Ozs7Ozs7Ozs7Ozs7SUN2VE8sSUFBSSxXQUFPLGFBQWEsRUFBeEIsSUFBSTs7SUFDTCxhQUFhLDJCQUFNLG1CQUFtQjs7SUFDdEMsc0JBQXNCLDJCQUFNLDJCQUEyQjs7QUFFOUQsTUFBTSxDQUFDLE1BQU0sR0FBRyxZQUFXOzs7Ozs7Ozs7Ozs7Ozs7QUFnQnpCLE1BQUksQ0FBQyxFQUFDLEdBQUcsRUFBQyxxQkFBcUIsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQ2pFLFNBQVMsV0FBVyxDQUFDLElBQUksRUFBQzs7QUFFeEIsUUFBSSxJQUFJLEdBQUcsc0JBQXNCLENBQUMsRUFBQyxXQUFXLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztBQUN0RCxXQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ25CLEVBRUQsU0FBUyxVQUFVLENBQUMsQ0FBQyxFQUFDO0FBQ3BCLFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDbEIsQ0FDRixDQUFDO0NBQ0gsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICBDcmVhdGVzIHRoZSBjb25maWcgb2JqZWN0IHRoYXQgaXMgdXNlZCBmb3IgaW50ZXJuYWxseSBzaGFyaW5nIHNldHRpbmdzLCBpbmZvcm1hdGlvbiBhbmQgdGhlIHN0YXRlLiBPdGhlciBtb2R1bGVzIG1heSBhZGQga2V5cyB0byB0aGlzIG9iamVjdC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubGV0XG4gIGNvbmZpZyxcbiAgZGVmYXVsdFNvbmcsXG4gIHVhID0gJ05BJyxcbiAgb3MgPSAndW5rbm93bicsXG4gIGJyb3dzZXIgPSAnTkEnO1xuXG5cbmZ1bmN0aW9uIGdldENvbmZpZygpe1xuICBpZihjb25maWcgIT09IHVuZGVmaW5lZCl7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIGNvbmZpZyA9IG5ldyBNYXAoKTtcbiAgY29uZmlnLnNldCgnbGVnYWN5JywgZmFsc2UpOyAvLyB0cnVlIGlmIHRoZSBicm93c2VyIHVzZXMgYW4gb2xkZXIgdmVyc2lvbiBvZiB0aGUgV2ViQXVkaW8gQVBJLCBzb3VyY2Uubm90ZU9uKCkgYW5kIHNvdXJjZS5ub3RlT2ZmIGluc3RlYWQgb2Ygc291cmNlLnN0YXJ0KCkgYW5kIHNvdXJjZS5zdG9wKClcbiAgY29uZmlnLnNldCgnbWlkaScsIGZhbHNlKTsgLy8gdHJ1ZSBpZiB0aGUgYnJvd3NlciBoYXMgTUlESSBzdXBwb3J0IGVpdGhlciB2aWEgV2ViTUlESSBvciBKYXp6XG4gIGNvbmZpZy5zZXQoJ3dlYm1pZGknLCBmYWxzZSk7IC8vIHRydWUgaWYgdGhlIGJyb3dzZXIgaGFzIFdlYk1JRElcbiAgY29uZmlnLnNldCgnd2ViYXVkaW8nLCB0cnVlKTsgLy8gdHJ1ZSBpZiB0aGUgYnJvd3NlciBoYXMgV2ViQXVkaW9cbiAgY29uZmlnLnNldCgnamF6eicsIGZhbHNlKTsgLy8gdHJ1ZSBpZiB0aGUgYnJvd3NlciBoYXMgdGhlIEphenogcGx1Z2luXG4gIGNvbmZpZy5zZXQoJ29nZycsIGZhbHNlKTsgLy8gdHJ1ZSBpZiBXZWJBdWRpbyBzdXBwb3J0cyBvZ2dcbiAgY29uZmlnLnNldCgnbXAzJywgZmFsc2UpOyAvLyB0cnVlIGlmIFdlYkF1ZGlvIHN1cHBvcnRzIG1wM1xuICBjb25maWcuc2V0KCdiaXRyYXRlX21wM19lbmNvZGluZycsIDEyOCk7IC8vIGRlZmF1bHQgYml0cmF0ZSBmb3IgYXVkaW8gcmVjb3JkaW5nc1xuICBjb25maWcuc2V0KCdkZWJ1Z0xldmVsJywgNCk7IC8vIDAgPSBvZmYsIDEgPSBlcnJvciwgMiA9IHdhcm4sIDMgPSBpbmZvLCA0ID0gbG9nXG4gIGNvbmZpZy5zZXQoJ3BpdGNoJywgNDQwKTsgLy8gYmFzaWMgcGl0Y2ggdGhhdCBpcyB1c2VkIHdoZW4gZ2VuZXJhdGluZyBzYW1wbGVzXG4gIGNvbmZpZy5zZXQoJ2J1ZmZlclRpbWUnLCAzNTAvMTAwMCk7IC8vIHRpbWUgaW4gc2Vjb25kcyB0aGF0IGV2ZW50cyBhcmUgc2NoZWR1bGVkIGFoZWFkXG4gIGNvbmZpZy5zZXQoJ2F1dG9BZGp1c3RCdWZmZXJUaW1lJywgZmFsc2UpO1xuICBjb25maWcuc2V0KCdub3RlTmFtZU1vZGUnLCAnc2hhcnAnKTtcbiAgY29uZmlnLnNldCgnbWluaW1hbFNvbmdMZW5ndGgnLCA2MDAwMCk7IC8vbWlsbGlzXG4gIGNvbmZpZy5zZXQoJ3BhdXNlT25CbHVyJywgZmFsc2UpOyAvLyBwYXVzZSB0aGUgQXVkaW9Db250ZXh0IHdoZW4gcGFnZSBvciB0YWIgbG9vc2VzIGZvY3VzXG4gIGNvbmZpZy5zZXQoJ3Jlc3RhcnRPbkZvY3VzJywgdHJ1ZSk7IC8vIGlmIHNvbmcgd2FzIHBsYXlpbmcgYXQgdGhlIHRpbWUgdGhlIHBhZ2Ugb3IgdGFiIGxvc3QgZm9jdXMsIGl0IHdpbGwgc3RhcnQgcGxheWluZyBhdXRvbWF0aWNhbGx5IGFzIHNvb24gYXMgdGhlIHBhZ2UvdGFiIGdldHMgZm9jdXMgYWdhaW5cbiAgY29uZmlnLnNldCgnZGVmYXVsdFBQUScsIDk2MCk7XG4gIGNvbmZpZy5zZXQoJ292ZXJydWxlUFBRJywgdHJ1ZSk7XG4gIGNvbmZpZy5zZXQoJ3ByZWNpc2lvbicsIDMpOyAvLyBtZWFucyBmbG9hdCB3aXRoIHByZWNpc2lvbiAzLCBlLmcuIDEwLjQzN1xuICBjb25maWcuc2V0KCdhY3RpdmVTb25ncycsIHt9KTsvLyB0aGUgc29uZ3MgY3VycmVudGx5IGxvYWRlZCBpbiBtZW1vcnlcblxuXG4gIGRlZmF1bHRTb25nID0gbmV3IE1hcCgpO1xuICBkZWZhdWx0U29uZy5zZXQoJ2JwbScsIDEyMCk7XG4gIGRlZmF1bHRTb25nLnNldCgncHBxJywgY29uZmlnLmdldCgnZGVmYXVsdFBQUScpKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdiYXJzJywgMzApO1xuICBkZWZhdWx0U29uZy5zZXQoJ2xvd2VzdE5vdGUnLCAwKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdoaWdoZXN0Tm90ZScsIDEyNyk7XG4gIGRlZmF1bHRTb25nLnNldCgnbm9taW5hdG9yJywgNCk7XG4gIGRlZmF1bHRTb25nLnNldCgnZGVub21pbmF0b3InLCA0KTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdxdWFudGl6ZVZhbHVlJywgOCk7XG4gIGRlZmF1bHRTb25nLnNldCgnZml4ZWRMZW5ndGhWYWx1ZScsIGZhbHNlKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdwb3NpdGlvblR5cGUnLCAnYWxsJyk7XG4gIGRlZmF1bHRTb25nLnNldCgndXNlTWV0cm9ub21lJywgZmFsc2UpO1xuICBkZWZhdWx0U29uZy5zZXQoJ2F1dG9TaXplJywgdHJ1ZSk7XG4gIGRlZmF1bHRTb25nLnNldCgnbG9vcCcsIGZhbHNlKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdwbGF5YmFja1NwZWVkJywgMSk7XG4gIGRlZmF1bHRTb25nLnNldCgnYXV0b1F1YW50aXplJywgZmFsc2UpO1xuICBjb25maWcuc2V0KCdkZWZhdWx0U29uZycsIGRlZmF1bHRTb25nKTtcblxuXG4gIC8vIGdldCBicm93c2VyIGFuZCBvc1xuICBpZihuYXZpZ2F0b3IgIT09IHVuZGVmaW5lZCl7XG4gICAgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gICAgaWYodWEubWF0Y2goLyhpUGFkfGlQaG9uZXxpUG9kKS9nKSl7XG4gICAgICBvcyA9ICdpb3MnO1xuICAgIH1lbHNlIGlmKHVhLmluZGV4T2YoJ0FuZHJvaWQnKSAhPT0gLTEpe1xuICAgICAgb3MgPSAnYW5kcm9pZCc7XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignTGludXgnKSAhPT0gLTEpe1xuICAgICAgIG9zID0gJ2xpbnV4JztcbiAgICB9ZWxzZSBpZih1YS5pbmRleE9mKCdNYWNpbnRvc2gnKSAhPT0gLTEpe1xuICAgICAgIG9zID0gJ29zeCc7XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignV2luZG93cycpICE9PSAtMSl7XG4gICAgICAgb3MgPSAnd2luZG93cyc7XG4gICAgfVxuXG4gICAgaWYodWEuaW5kZXhPZignQ2hyb21lJykgIT09IC0xKXtcbiAgICAgIC8vIGNocm9tZSwgY2hyb21pdW0gYW5kIGNhbmFyeVxuICAgICAgYnJvd3NlciA9ICdjaHJvbWUnO1xuXG4gICAgICBpZih1YS5pbmRleE9mKCdPUFInKSAhPT0gLTEpe1xuICAgICAgICBicm93c2VyID0gJ29wZXJhJztcbiAgICAgIH1lbHNlIGlmKHVhLmluZGV4T2YoJ0Nocm9taXVtJykgIT09IC0xKXtcbiAgICAgICAgYnJvd3NlciA9ICdjaHJvbWl1bSc7XG4gICAgICB9XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignU2FmYXJpJykgIT09IC0xKXtcbiAgICAgIGJyb3dzZXIgPSAnc2FmYXJpJztcbiAgICB9ZWxzZSBpZih1YS5pbmRleE9mKCdGaXJlZm94JykgIT09IC0xKXtcbiAgICAgIGJyb3dzZXIgPSAnZmlyZWZveCc7XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignVHJpZGVudCcpICE9PSAtMSl7XG4gICAgICBicm93c2VyID0gJ0ludGVybmV0IEV4cGxvcmVyJztcbiAgICB9XG5cbiAgICBpZihvcyA9PT0gJ2lvcycpe1xuICAgICAgaWYodWEuaW5kZXhPZignQ3JpT1MnKSAhPT0gLTEpe1xuICAgICAgICBicm93c2VyID0gJ2Nocm9tZSc7XG4gICAgICB9XG4gICAgfVxuICB9ZWxzZXtcbiAgICAvLyBUT0RPOiBjaGVjayBvcyBoZXJlIHdpdGggTm9kZWpzJyByZXF1aXJlKCdvcycpXG4gIH1cbiAgY29uZmlnLnNldCgndWEnLCB1YSk7XG4gIGNvbmZpZy5zZXQoJ29zJywgb3MpO1xuICBjb25maWcuc2V0KCdicm93c2VyJywgYnJvd3Nlcik7XG5cbiAgLy8gY2hlY2sgaWYgd2UgaGF2ZSBhbiBhdWRpbyBjb250ZXh0XG4gIHdpbmRvdy5BdWRpb0NvbnRleHQgPSAoXG4gICAgd2luZG93LkF1ZGlvQ29udGV4dCB8fFxuICAgIHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHxcbiAgICB3aW5kb3cub0F1ZGlvQ29udGV4dCB8fFxuICAgIHdpbmRvdy5tc0F1ZGlvQ29udGV4dFxuICApO1xuICBjb25maWcuc2V0KCdhdWRpb19jb250ZXh0JywgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSAhPT0gdW5kZWZpbmVkKTtcbiAgY29uZmlnLnNldCgncmVjb3JkX2F1ZGlvJywgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSAhPT0gdW5kZWZpbmVkKTtcblxuXG4gIC8vIGNoZWNrIGlmIGF1ZGlvIGNhbiBiZSByZWNvcmRlZFxuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gKFxuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHxcbiAgICBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8XG4gICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fFxuICAgIG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYVxuICApO1xuICBjb25maWcuc2V0KCdhdWRpb19jb250ZXh0Jywgd2luZG93LkF1ZGlvQ29udGV4dCAhPT0gdW5kZWZpbmVkKTtcblxuXG4gIC8vIG5vIHdlYmF1ZGlvLCByZXR1cm5cbiAgaWYoY29uZmlnLmdldCgnYXVkaW9fY29udGV4dCcpID09PSBmYWxzZSl7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gY2hlY2sgZm9yIG90aGVyICdtb2Rlcm4nIEFQSSdzXG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gIHdpbmRvdy5CbG9iID0gd2luZG93LkJsb2IgfHwgd2luZG93LndlYmtpdEJsb2IgfHwgd2luZG93Lm1vekJsb2I7XG4gIC8vY29uc29sZS5sb2coJ2lPUycsIG9zLCBjb250ZXh0LCB3aW5kb3cuQmxvYiwgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBnZXRDb25maWc7IiwiLypcbiAgUmVxdWVzdHMgTUlESSBhY2Nlc3MsIHF1ZXJpZXMgYWxsIGlucHV0cyBhbmQgb3V0cHV0cyBhbmQgc3RvcmVzIHRoZW0gaW4gYWxwaGFiZXRpY2FsIG9yZGVyXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cblxuaW1wb3J0IHtsb2csIGluZm8sIHdhcm4sIGVycm9yLCB0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IE1pZGlFdmVudCBmcm9tICcuL21pZGlfZXZlbnQnO1xuXG5cbmxldCBkYXRhID0ge307XG5sZXQgaW5wdXRzID0gbmV3IE1hcCgpO1xubGV0IG91dHB1dHMgPSBuZXcgTWFwKCk7XG5cbmxldCBzb25nTWlkaUV2ZW50TGlzdGVuZXI7XG5sZXQgbWlkaUV2ZW50TGlzdGVuZXJJZCA9IDA7XG5cbmZ1bmN0aW9uIGluaXRNaWRpKCl7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICBsZXQgdG1wO1xuXG4gICAgaWYobmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzICE9PSB1bmRlZmluZWQpe1xuXG4gICAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MoKS50aGVuKFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uRnVsRmlsbGVkKG1pZGkpe1xuICAgICAgICAgIGlmKG1pZGkuX2phenpJbnN0YW5jZXMgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBkYXRhLmphenogPSBtaWRpLl9qYXp6SW5zdGFuY2VzWzBdLl9KYXp6LnZlcnNpb247XG4gICAgICAgICAgICBkYXRhLm1pZGkgPSB0cnVlO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZGF0YS53ZWJtaWRpID0gdHJ1ZTtcbiAgICAgICAgICAgIGRhdGEubWlkaSA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gb2xkIGltcGxlbWVudGF0aW9uIG9mIFdlYk1JRElcbiAgICAgICAgICBpZih0eXBlb2YgbWlkaS5pbnB1dHMudmFsdWVzICE9PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgICAgIHJlamVjdCgnWW91IGJyb3dzZXIgaXMgdXNpbmcgYW4gb2xkIGltcGxlbWVudGF0aW9uIG9mIHRoZSBXZWJNSURJIEFQSSwgcGxlYXNlIHVwZGF0ZSB5b3VyIGJyb3dzZXIuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG5cbiAgICAgICAgICAvLyBnZXQgaW5wdXRzXG4gICAgICAgICAgdG1wID0gQXJyYXkuZnJvbShtaWRpLmlucHV0cy52YWx1ZXMoKSk7XG5cbiAgICAgICAgICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgICAgICAgICB0bXAuc29ydCgoYSwgYikgPT4gYS5uYW1lLnRvTG93ZXJDYXNlKCkgPD0gYi5uYW1lLnRvTG93ZXJDYXNlKCkgPyAxIDogLTEpO1xuXG4gICAgICAgICAgZm9yKGxldCBwb3J0IG9mIHRtcCl7XG4gICAgICAgICAgICBpbnB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICAgICAgICAgIH1cblxuXG4gICAgICAgICAgLy8gZ2V0IG91dHB1dHNcbiAgICAgICAgICB0bXAgPSBBcnJheS5mcm9tKG1pZGkub3V0cHV0cy52YWx1ZXMoKSk7XG5cbiAgICAgICAgICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgICAgICAgICB0bXAuc29ydCgoYSwgYikgPT4gYS5uYW1lLnRvTG93ZXJDYXNlKCkgPD0gYi5uYW1lLnRvTG93ZXJDYXNlKCkgPyAxIDogLTEpO1xuXG4gICAgICAgICAgZm9yKGxldCBwb3J0IG9mIHRtcCl7XG4gICAgICAgICAgICBvdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICAgICAgICB9XG5cblxuICAgICAgICAgIC8vIG9uY29ubmVjdCBhbmQgb25kaXNjb25uZWN0IGFyZSBub3QgeWV0IGltcGxlbWVudGVkIGluIENocm9tZSBhbmQgQ2hyb21pdW1cbiAgICAgICAgICBtaWRpLmFkZEV2ZW50TGlzdGVuZXIoJ29uY29ubmVjdCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgbG9nKCdkZXZpY2UgY29ubmVjdGVkJywgZSk7XG4gICAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgICAgbWlkaS5hZGRFdmVudExpc3RlbmVyKCdvbmRpc2Nvbm5lY3QnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGxvZygnZGV2aWNlIGRpc2Nvbm5lY3RlZCcsIGUpO1xuICAgICAgICAgIH0sIGZhbHNlKTtcblxuXG4gICAgICAgICAgLy8gZXhwb3J0XG4gICAgICAgICAgZGF0YS5pbnB1dHMgPSBpbnB1dHM7XG4gICAgICAgICAgZGF0YS5vdXRwdXRzID0gb3V0cHV0cztcblxuICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QoZSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICByZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIHJlcXVlc3RpbmcgTUlESUFjY2VzcycpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIC8vIGJyb3dzZXJzIHdpdGhvdXQgV2ViTUlESSBBUElcbiAgICB9ZWxzZXtcbiAgICAgIGRhdGEubWlkaSA9IGZhbHNlO1xuICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICB9XG4gIH0pO1xufVxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNaWRpU29uZyhzb25nKXtcblxuICBzb25nTWlkaUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKXtcbiAgICAvL2NvbnNvbGUubG9nKGUpO1xuICAgIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBlLCB0aGlzKTtcbiAgfTtcblxuICAvLyBieSBkZWZhdWx0IGEgc29uZyBsaXN0ZW5zIHRvIGFsbCBhdmFpbGFibGUgbWlkaS1pbiBwb3J0c1xuICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcblxuICBvdXRwdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xufVxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlJbnB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgaW5wdXQgPSBpbnB1dHMuZ2V0KGlkKTtcblxuICBpZihpbnB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIGlucHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaUlucHV0cy5kZWxldGUoaWQpO1xuICAgIGlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChpZCwgaW5wdXQpO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlJbnB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpT3V0cHV0U29uZyhzb25nLCBpZCwgZmxhZyl7XG4gIGxldCBvdXRwdXQgPSBvdXRwdXRzLmdldChpZCk7XG5cbiAgaWYob3V0cHV0ID09PSB1bmRlZmluZWQpe1xuICAgIHdhcm4oJ25vIG1pZGkgb3V0cHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaU91dHB1dHMuZGVsZXRlKGlkKTtcbiAgICBsZXQgdGltZSA9IHNvbmcuc2NoZWR1bGVyLmxhc3RFdmVudFRpbWUgKyAxMDA7XG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aW1lKTsgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWUpOyAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQoaWQsIG91dHB1dCk7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpT3V0cHV0KGlkLCBmbGFnKTtcbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIG1pZGlNZXNzYWdlRXZlbnQsIGlucHV0KXtcbiAgbGV0IG1pZGlFdmVudCA9IG5ldyBNaWRpRXZlbnQoc29uZy50aWNrcywgLi4ubWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5taWRpSW5wdXRzLCBpbnB1dCk7XG4gICAgLypcbiAgICBpZihtaWRpRXZlbnQuY2hhbm5lbCA9PT0gdHJhY2suY2hhbm5lbCB8fCB0cmFjay5jaGFubmVsID09PSAwIHx8IHRyYWNrLmNoYW5uZWwgPT09ICdhbnknKXtcbiAgICAgIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjayk7XG4gICAgfVxuICAgICovXG4gICAgLy8gbGlrZSBpbiBDdWJhc2UsIG1pZGkgZXZlbnRzIGZyb20gYWxsIGRldmljZXMsIHNlbnQgb24gYW55IG1pZGkgY2hhbm5lbCBhcmUgZm9yd2FyZGVkIHRvIGFsbCB0cmFja3NcbiAgICAvLyBzZXQgdHJhY2subW9uaXRvciB0byBmYWxzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byByZWNlaXZlIG1pZGkgZXZlbnRzIG9uIGEgY2VydGFpbiB0cmFja1xuICAgIC8vIG5vdGUgdGhhdCB0cmFjay5tb25pdG9yIGlzIGJ5IGRlZmF1bHQgc2V0IHRvIGZhbHNlIGFuZCB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYXV0b21hdGljYWxseSBzZXQgdG8gdHJ1ZVxuICAgIC8vIGlmIHlvdSBhcmUgcmVjb3JkaW5nIG9uIHRoYXQgdHJhY2tcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1vbml0b3IsIHRyYWNrLmlkLCBpbnB1dC5pZCk7XG4gICAgaWYodHJhY2subW9uaXRvciA9PT0gdHJ1ZSAmJiB0cmFjay5taWRpSW5wdXRzLmdldChpbnB1dC5pZCkgIT09IHVuZGVmaW5lZCl7XG4gICAgICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2ssIGlucHV0KTtcbiAgICB9XG4gIH1cblxuICBsZXQgbGlzdGVuZXJzID0gc29uZy5taWRpRXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudC50eXBlKTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIGZvcihsZXQgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH1cbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayh0cmFjaywgbWlkaUV2ZW50LCBpbnB1dCl7XG4gIGxldCBzb25nID0gdHJhY2suc29uZyxcbiAgICBub3RlLCBsaXN0ZW5lcnMsIGNoYW5uZWw7XG4gICAgLy9kYXRhID0gbWlkaU1lc3NhZ2VFdmVudC5kYXRhLFxuICAgIC8vbWlkaUV2ZW50ID0gY3JlYXRlTWlkaUV2ZW50KHNvbmcudGlja3MsIGRhdGFbMF0sIGRhdGFbMV0sIGRhdGFbMl0pO1xuXG4gIC8vbWlkaUV2ZW50LnNvdXJjZSA9IG1pZGlNZXNzYWdlRXZlbnQuc3JjRWxlbWVudC5uYW1lO1xuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQpXG4gIC8vY29uc29sZS5sb2coJy0tLS0+JywgbWlkaUV2ZW50LnR5cGUpO1xuXG4gIC8vIGFkZCB0aGUgZXhhY3QgdGltZSBvZiB0aGlzIGV2ZW50IHNvIHdlIGNhbiBjYWxjdWxhdGUgaXRzIHRpY2tzIHBvc2l0aW9uXG4gIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMDsgLy8gbWlsbGlzXG4gIG1pZGlFdmVudC5zdGF0ZSA9ICdyZWNvcmRlZCc7XG5cbiAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgbm90ZSA9IGNyZWF0ZU1pZGlOb3RlKG1pZGlFdmVudCk7XG4gICAgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXSA9IG5vdGU7XG4gICAgLy90cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdID0gbm90ZTtcbiAgfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgbm90ZSA9IHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy8gY2hlY2sgaWYgdGhlIG5vdGUgZXhpc3RzOiBpZiB0aGUgdXNlciBwbGF5cyBub3RlcyBvbiBoZXIga2V5Ym9hcmQgYmVmb3JlIHRoZSBtaWRpIHN5c3RlbSBoYXNcbiAgICAvLyBiZWVuIGZ1bGx5IGluaXRpYWxpemVkLCBpdCBjYW4gaGFwcGVuIHRoYXQgdGhlIGZpcnN0IGluY29taW5nIG1pZGkgZXZlbnQgaXMgYSBOT1RFIE9GRiBldmVudFxuICAgIGlmKG5vdGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5vdGUuYWRkTm90ZU9mZihtaWRpRXZlbnQpO1xuICAgIGRlbGV0ZSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vZGVsZXRlIHRyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF07XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKHNvbmcucHJlcm9sbCwgc29uZy5yZWNvcmRpbmcsIHRyYWNrLnJlY29yZEVuYWJsZWQpO1xuXG4gIGlmKChzb25nLnByZXJvbGxpbmcgfHwgc29uZy5yZWNvcmRpbmcpICYmIHRyYWNrLnJlY29yZEVuYWJsZWQgPT09ICdtaWRpJyl7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICB0cmFjay5zb25nLnJlY29yZGVkTm90ZXMucHVzaChub3RlKTtcbiAgICB9XG4gICAgdHJhY2sucmVjb3JkUGFydC5hZGRFdmVudChtaWRpRXZlbnQpO1xuICAgIC8vIHNvbmcucmVjb3JkZWRFdmVudHMgaXMgdXNlZCBpbiB0aGUga2V5IGVkaXRvclxuICAgIHRyYWNrLnNvbmcucmVjb3JkZWRFdmVudHMucHVzaChtaWRpRXZlbnQpO1xuICB9ZWxzZSBpZih0cmFjay5lbmFibGVSZXRyb3NwZWN0aXZlUmVjb3JkaW5nKXtcbiAgICB0cmFjay5yZXRyb3NwZWN0aXZlUmVjb3JkaW5nLnB1c2gobWlkaUV2ZW50KTtcbiAgfVxuXG4gIC8vIGNhbGwgYWxsIG1pZGkgZXZlbnQgbGlzdGVuZXJzXG4gIGxpc3RlbmVycyA9IHRyYWNrLm1pZGlFdmVudExpc3RlbmVyc1ttaWRpRXZlbnQudHlwZV07XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBvYmplY3RGb3JFYWNoKGxpc3RlbmVycywgZnVuY3Rpb24obGlzdGVuZXIpe1xuICAgICAgbGlzdGVuZXIobWlkaUV2ZW50LCBpbnB1dCk7XG4gICAgfSk7XG4gIH1cblxuICBjaGFubmVsID0gdHJhY2suY2hhbm5lbDtcbiAgaWYoY2hhbm5lbCA9PT0gJ2FueScgfHwgY2hhbm5lbCA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKGNoYW5uZWwpID09PSB0cnVlKXtcbiAgICBjaGFubmVsID0gMDtcbiAgfVxuXG4gIG9iamVjdEZvckVhY2godHJhY2subWlkaU91dHB1dHMsIGZ1bmN0aW9uKG91dHB1dCl7XG4gICAgLy9jb25zb2xlLmxvZygnbWlkaSBvdXQnLCBvdXRwdXQsIG1pZGlFdmVudC50eXBlKTtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4IHx8IG1pZGlFdmVudC50eXBlID09PSAxNDQgfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMik7XG4gICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gICAgLy8gfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE5Mil7XG4gICAgLy8gICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMV0pO1xuICAgIH1cbiAgICAvL291dHB1dC5zZW5kKFttaWRpRXZlbnQuc3RhdHVzICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgfSk7XG5cbiAgLy8gQFRPRE86IG1heWJlIGEgdHJhY2sgc2hvdWxkIGJlIGFibGUgdG8gc2VuZCBpdHMgZXZlbnQgdG8gYm90aCBhIG1pZGktb3V0IHBvcnQgYW5kIGFuIGludGVybmFsIGhlYXJ0YmVhdCBzb25nP1xuICAvL2NvbnNvbGUubG9nKHRyYWNrLnJvdXRlVG9NaWRpT3V0KTtcbiAgaWYodHJhY2sucm91dGVUb01pZGlPdXQgPT09IGZhbHNlKXtcbiAgICBtaWRpRXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICB0cmFjay5pbnN0cnVtZW50LnByb2Nlc3NFdmVudChtaWRpRXZlbnQpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gYWRkTWlkaUV2ZW50TGlzdGVuZXIoLi4uYXJncyl7IC8vIGNhbGxlciBjYW4gYmUgYSB0cmFjayBvciBhIHNvbmdcblxuICBsZXQgaWQgPSBtaWRpRXZlbnRMaXN0ZW5lcklkKys7XG4gIGxldCBsaXN0ZW5lcjtcbiAgICB0eXBlcyA9IHt9LFxuICAgIGlkcyA9IFtdLFxuICAgIGxvb3A7XG5cblxuICAvLyBzaG91bGQgSSBpbmxpbmUgdGhpcz9cbiAgbG9vcCA9IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgIGZvcihsZXQgYXJnIG9mIGFyZ3Mpe1xuICAgICAgbGV0IHR5cGUgPSB0eXBlU3RyaW5nKGFyZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgICAgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgIGxvb3AoYXJnKTtcbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdmdW5jdGlvbicpe1xuICAgICAgICBsaXN0ZW5lciA9IGFyZztcbiAgICAgIH1lbHNlIGlmKGlzTmFOKGFyZykgPT09IGZhbHNlKXtcbiAgICAgICAgYXJnID0gcGFyc2VJbnQoYXJnLCAxMCk7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpe1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIGFyZyA9IHNlcXVlbmNlci5taWRpRXZlbnROdW1iZXJCeU5hbWUoYXJnKTtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGxvb3AoYXJncywgMCwgYXJncy5sZW5ndGgpO1xuICAvL2NvbnNvbGUubG9nKCd0eXBlcycsIHR5cGVzLCAnbGlzdGVuZXInLCBsaXN0ZW5lcik7XG5cbiAgb2JqZWN0Rm9yRWFjaCh0eXBlcywgZnVuY3Rpb24odHlwZSl7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICBpZihvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID09PSB1bmRlZmluZWQpe1xuICAgICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9IHt9O1xuICAgIH1cbiAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdW2lkXSA9IGxpc3RlbmVyO1xuICAgIGlkcy5wdXNoKHR5cGUgKyAnXycgKyBpZCk7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2cob2JqLm1pZGlFdmVudExpc3RlbmVycyk7XG4gIHJldHVybiBpZHMubGVuZ3RoID09PSAxID8gaWRzWzBdIDogaWRzO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVyKGlkLCBvYmope1xuICB2YXIgdHlwZTtcbiAgaWQgPSBpZC5zcGxpdCgnXycpO1xuICB0eXBlID0gaWRbMF07XG4gIGlkID0gaWRbMV07XG4gIGRlbGV0ZSBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdW2lkXTtcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcnMoKXtcblxufVxuXG5cblxuZXhwb3J0IGRlZmF1bHQgaW5pdE1pZGk7IiwiLyoqXG4gIEBwdWJsaWNcbiAgQGNsYXNzIE1pZGlFdmVudFxuICBAcGFyYW0gdGltZSB7aW50fSB0aGUgdGltZSB0aGF0IHRoZSBldmVudCBpcyBzY2hlZHVsZWRcbiAgQHBhcmFtIHR5cGUge2ludH0gdHlwZSBvZiBNaWRpRXZlbnQsIGUuZy4gTk9URV9PTiwgTk9URV9PRkYgb3IsIDE0NCwgMTI4LCBldGMuXG4gIEBwYXJhbSBkYXRhMSB7aW50fSBpZiB0eXBlIGlzIDE0NCBvciAxMjg6IG5vdGUgbnVtYmVyXG4gIEBwYXJhbSBbZGF0YTJdIHtpbnR9IGlmIHR5cGUgaXMgMTQ0IG9yIDEyODogdmVsb2NpdHlcbiAgQHBhcmFtIFtjaGFubmVsXSB7aW50fSBjaGFubmVsXG5cblxuICBAZXhhbXBsZVxuICAvLyBwbGF5cyB0aGUgY2VudHJhbCBjIGF0IHZlbG9jaXR5IDEwMFxuICBsZXQgZXZlbnQgPSBzZXF1ZW5jZXIuY3JlYXRlTWlkaUV2ZW50KDEyMCwgc2VxdWVuY2VyLk5PVEVfT04sIDYwLCAxMDApO1xuXG4gIC8vIHBhc3MgYXJndW1lbnRzIGFzIGFycmF5XG4gIGxldCBldmVudCA9IHNlcXVlbmNlci5jcmVhdGVNaWRpRXZlbnQoWzEyMCwgc2VxdWVuY2VyLk5PVEVfT04sIDYwLCAxMDBdKTtcblxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cblxuaW1wb3J0IHtsb2csIGluZm8sIHdhcm4sIGVycm9yLCB0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtjcmVhdGVOb3RlfSBmcm9tICcuL25vdGUuanMnO1xuXG5cbmxldFxuICBtaWRpRXZlbnRJZCA9IDA7XG5cblxuLypcbiAgYXJndW1lbnRzOlxuICAgLSBbdGlja3MsIHR5cGUsIGRhdGExLCBkYXRhMiwgY2hhbm5lbF1cbiAgIC0gdGlja3MsIHR5cGUsIGRhdGExLCBkYXRhMiwgY2hhbm5lbFxuXG4gIGRhdGEyIGFuZCBjaGFubmVsIGFyZSBvcHRpb25hbCBidXQgbXVzdCBiZSBudW1iZXJzIGlmIHByb3ZpZGVkXG4qL1xuXG5jbGFzcyBNSURJRXZlbnR7XG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgIGxldCBub3RlO1xuXG4gICAgdGhpcy5pZCA9ICdNJyArIG1pZGlFdmVudElkKysgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLmV2ZW50TnVtYmVyID0gbWlkaUV2ZW50SWQ7XG4gICAgdGhpcy50aW1lID0gMDtcbiAgICB0aGlzLm11dGVkID0gZmFsc2U7XG5cblxuICAgIGlmKGFyZ3MgPT09IHVuZGVmaW5lZCB8fCBhcmdzLmxlbmd0aCA9PT0gMCl7XG4gICAgICAvLyBieXBhc3MgY29udHJ1Y3RvciBmb3IgY2xvbmluZ1xuICAgICAgcmV0dXJuO1xuICAgIH1lbHNlIGlmKHR5cGVTdHJpbmcoYXJnc1swXSkgPT09ICdtaWRpbWVzc2FnZWV2ZW50Jyl7XG4gICAgICBpbmZvKCdtaWRpbWVzc2FnZWV2ZW50Jyk7XG4gICAgICByZXR1cm47XG4gICAgfWVsc2UgaWYodHlwZVN0cmluZyhhcmdzWzBdKSA9PT0gJ2FycmF5Jyl7XG4gICAgICAvLyBzdXBwb3J0IGZvciB1bi1zcHJlYWRlZCBwYXJhbWV0ZXJzXG4gICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgIGlmKHR5cGVTdHJpbmcoYXJnc1swXSkgPT09ICdhcnJheScpe1xuICAgICAgICAvLyBzdXBwb3J0IGZvciBwYXNzaW5nIHBhcmFtZXRlcnMgaW4gYW4gYXJyYXlcbiAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uKGRhdGEsIGkpe1xuICAgICAgaWYoaXNOYU4oZGF0YSkgJiYgaSA8IDUpe1xuICAgICAgICBlcnJvcigncGxlYXNlIHByb3ZpZGUgbnVtYmVycyBmb3IgdGlja3MsIHR5cGUsIGRhdGExIGFuZCBvcHRpb25hbGx5IGZvciBkYXRhMiBhbmQgY2hhbm5lbCcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy50aWNrcyA9IGFyZ3NbMF07XG4gICAgdGhpcy5zdGF0dXMgPSBhcmdzWzFdO1xuICAgIHRoaXMudHlwZSA9ICh0aGlzLnN0YXR1cyA+PiA0KSAqIDE2O1xuICAgIC8vY29uc29sZS5sb2codGhpcy50eXBlLCB0aGlzLnN0YXR1cyk7XG4gICAgaWYodGhpcy50eXBlID49IDB4ODAgJiYgdGhpcy50eXBlIDw9IDB4RTApe1xuICAgICAgLy90aGUgaGlnaGVyIDQgYml0cyBvZiB0aGUgc3RhdHVzIGJ5dGUgaXMgdGhlIGNvbW1hbmRcbiAgICAgIHRoaXMuY29tbWFuZCA9IHRoaXMudHlwZTtcbiAgICAgIC8vdGhlIGxvd2VyIDQgYml0cyBvZiB0aGUgc3RhdHVzIGJ5dGUgaXMgdGhlIGNoYW5uZWwgbnVtYmVyXG4gICAgICB0aGlzLmNoYW5uZWwgPSAodGhpcy5zdGF0dXMgJiAweEYpICsgMTsgLy8gZnJvbSB6ZXJvLWJhc2VkIHRvIDEtYmFzZWRcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMudHlwZSA9IHRoaXMuc3RhdHVzO1xuICAgICAgdGhpcy5jaGFubmVsID0gYXJnc1s0XSB8fCAxO1xuICAgIH1cblxuICAgIHRoaXMuc29ydEluZGV4ID0gdGhpcy50eXBlICsgdGhpcy50aWNrczsgLy8gbm90ZSBvZmYgZXZlbnRzIGNvbWUgYmVmb3JlIG5vdGUgb24gZXZlbnRzXG5cbiAgICBzd2l0Y2godGhpcy50eXBlKXtcbiAgICAgIGNhc2UgMHgwOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHg4MDpcbiAgICAgICAgdGhpcy5kYXRhMSA9IGFyZ3NbMl07XG4gICAgICAgIG5vdGUgPSBjcmVhdGVOb3RlKHRoaXMuZGF0YTEpO1xuICAgICAgICB0aGlzLm5vdGUgPSBub3RlO1xuICAgICAgICB0aGlzLm5vdGVOYW1lID0gbm90ZS5mdWxsTmFtZTtcbiAgICAgICAgdGhpcy5ub3RlTnVtYmVyID0gbm90ZS5udW1iZXI7XG4gICAgICAgIHRoaXMub2N0YXZlID0gbm90ZS5vY3RhdmU7XG4gICAgICAgIHRoaXMuZnJlcXVlbmN5ID0gbm90ZS5mcmVxdWVuY3k7XG4gICAgICAgIHRoaXMuZGF0YTIgPSAwOy8vZGF0YVszXTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHRoaXMuZGF0YTI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAweDkwOlxuICAgICAgICB0aGlzLmRhdGExID0gYXJnc1syXTsvL25vdGUgbnVtYmVyXG4gICAgICAgIHRoaXMuZGF0YTIgPSBhcmdzWzNdOy8vdmVsb2NpdHlcbiAgICAgICAgaWYodGhpcy5kYXRhMiA9PT0gMCl7XG4gICAgICAgICAgLy9pZiB2ZWxvY2l0eSBpcyAwLCB0aGlzIGlzIGEgTk9URSBPRkYgZXZlbnRcbiAgICAgICAgICB0aGlzLnR5cGUgPSAweDgwO1xuICAgICAgICB9XG4gICAgICAgIG5vdGUgPSBjcmVhdGVOb3RlKHRoaXMuZGF0YTEpO1xuICAgICAgICB0aGlzLm5vdGUgPSBub3RlO1xuICAgICAgICB0aGlzLm5vdGVOYW1lID0gbm90ZS5mdWxsTmFtZTtcbiAgICAgICAgdGhpcy5ub3RlTnVtYmVyID0gbm90ZS5udW1iZXI7XG4gICAgICAgIHRoaXMub2N0YXZlID0gbm90ZS5vY3RhdmU7XG4gICAgICAgIHRoaXMuZnJlcXVlbmN5ID0gbm90ZS5mcmVxdWVuY3k7XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB0aGlzLmRhdGEyO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgdGhpcy5icG0gPSBhcmdzWzJdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgdGhpcy5ub21pbmF0b3IgPSBhcmdzWzJdO1xuICAgICAgICB0aGlzLmRlbm9taW5hdG9yID0gYXJnc1szXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4QjA6Ly8gY29udHJvbCBjaGFuZ2VcbiAgICAgICAgdGhpcy5kYXRhMSA9IGFyZ3NbMl07XG4gICAgICAgIHRoaXMuZGF0YTIgPSBhcmdzWzNdO1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXJUeXBlID0gYXJnc1syXTtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyVmFsdWUgPSBhcmdzWzNdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHhDMDovLyBwcm9ncmFtIGNoYW5nZVxuICAgICAgICB0aGlzLmRhdGExID0gYXJnc1syXTtcbiAgICAgICAgdGhpcy5wcm9ncmFtTnVtYmVyID0gYXJnc1syXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4RDA6Ly8gY2hhbm5lbCBwcmVzc3VyZVxuICAgICAgICB0aGlzLmRhdGExID0gYXJnc1syXTtcbiAgICAgICAgdGhpcy5kYXRhMiA9IGFyZ3NbM107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAweEUwOi8vIHBpdGNoIGJlbmRcbiAgICAgICAgdGhpcy5kYXRhMSA9IGFyZ3NbMl07XG4gICAgICAgIHRoaXMuZGF0YTIgPSBhcmdzWzNdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHgyRjpcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB3YXJuKCdub3QgYSByZWNvZ25pemVkIHR5cGUgb2YgbWlkaSBldmVudCEnKTtcbiAgICB9XG4gIH1cblxuXG5cbiAgY2xvbmUoKXtcbiAgICBsZXQgZXZlbnQgPSBuZXcgTWlkaUV2ZW50KCk7XG5cbiAgICBmb3IobGV0IHByb3BlcnR5IG9mIE9iamVjdC5rZXlzKHRoaXMpKXtcbiAgICAgIGlmKHByb3BlcnR5ICE9PSAnaWQnICYmIHByb3BlcnR5ICE9PSAnZXZlbnROdW1iZXInICYmIHByb3BlcnR5ICE9PSAnbWlkaU5vdGUnKXtcbiAgICAgICAgZXZlbnRbcHJvcGVydHldID0gdGhpc1twcm9wZXJ0eV07XG4gICAgICB9XG4gICAgICBldmVudC5zb25nID0gdW5kZWZpbmVkO1xuICAgICAgZXZlbnQudHJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICBldmVudC50cmFja0lkID0gdW5kZWZpbmVkO1xuICAgICAgZXZlbnQucGFydCA9IHVuZGVmaW5lZDtcbiAgICAgIGV2ZW50LnBhcnRJZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9XG5cblxuXG4gIHRyYW5zcG9zZShzZW1pKXtcbiAgICBpZih0aGlzLnR5cGUgIT09IDB4ODAgJiYgdGhpcy50eXBlICE9PSAweDkwKXtcbiAgICAgIGVycm9yKCd5b3UgY2FuIG9ubHkgdHJhbnNwb3NlIG5vdGUgb24gYW5kIG5vdGUgb2ZmIGV2ZW50cycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vY29uc29sZS5sb2coJ3RyYW5zcG9zZScsIHNlbWkpO1xuICAgIGlmKHR5cGVTdHJpbmcoc2VtaSkgPT09ICdhcnJheScpe1xuICAgICAgbGV0IHR5cGUgPSBzZW1pWzBdO1xuICAgICAgaWYodHlwZSA9PT0gJ2hlcnR6Jyl7XG4gICAgICAgIC8vY29udmVydCBoZXJ0eiB0byBzZW1pXG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnc2VtaScgfHwgdHlwZSA9PT0gJ3NlbWl0b25lJyl7XG4gICAgICAgIHNlbWkgPSBzZW1pWzFdO1xuICAgICAgfVxuICAgIH1lbHNlIGlmKGlzTmFOKHNlbWkpID09PSB0cnVlKXtcbiAgICAgIGVycm9yKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCB0bXAgPSB0aGlzLmRhdGExICsgcGFyc2VJbnQoc2VtaSwgMTApO1xuICAgIGlmKHRtcCA8IDApe1xuICAgICAgdG1wID0gMDtcbiAgICB9ZWxzZSBpZih0bXAgPiAxMjcpe1xuICAgICAgdG1wID0gMTI3O1xuICAgIH1cbiAgICB0aGlzLmRhdGExID0gdG1wO1xuICAgIGxldCBub3RlID0gY3JlYXRlTm90ZSh0aGlzLmRhdGExKTtcbiAgICB0aGlzLm5vdGUgPSBub3RlO1xuICAgIHRoaXMubm90ZU5hbWUgPSBub3RlLmZ1bGxOYW1lO1xuICAgIHRoaXMubm90ZU51bWJlciA9IG5vdGUubnVtYmVyO1xuICAgIHRoaXMub2N0YXZlID0gbm90ZS5vY3RhdmU7XG4gICAgdGhpcy5mcmVxdWVuY3kgPSBub3RlLmZyZXF1ZW5jeTtcblxuICAgIGlmKHRoaXMubWlkaU5vdGUgIT09IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLm1pZGlOb3RlLnBpdGNoID0gdGhpcy5kYXRhMTtcbiAgICB9XG5cbiAgICBpZih0aGlzLnN0YXRlICE9PSAnbmV3Jyl7XG4gICAgICB0aGlzLnN0YXRlID0gJ2NoYW5nZWQnO1xuICAgIH1cbiAgICBpZih0aGlzLnBhcnQgIT09IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLnBhcnQubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG5cblxuICBzZXRQaXRjaChwaXRjaCl7XG4gICAgaWYodGhpcy50eXBlICE9PSAweDgwICYmIHRoaXMudHlwZSAhPT0gMHg5MCl7XG4gICAgICBlcnJvcigneW91IGNhbiBvbmx5IHNldCB0aGUgcGl0Y2ggb2Ygbm90ZSBvbiBhbmQgbm90ZSBvZmYgZXZlbnRzJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKHR5cGVTdHJpbmcocGl0Y2gpID09PSAnYXJyYXknKXtcbiAgICAgIGxldCB0eXBlID0gcGl0Y2hbMF07XG4gICAgICBpZih0eXBlID09PSAnaGVydHonKXtcbiAgICAgICAgLy9jb252ZXJ0IGhlcnR6IHRvIHBpdGNoXG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnc2VtaScgfHwgdHlwZSA9PT0gJ3NlbWl0b25lJyl7XG4gICAgICAgIHBpdGNoID0gcGl0Y2hbMV07XG4gICAgICB9XG4gICAgfWVsc2UgaWYoaXNOYU4ocGl0Y2gpID09PSB0cnVlKXtcbiAgICAgIGVycm9yKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YTEgPSBwYXJzZUludChwaXRjaCwxMCk7XG4gICAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKHRoaXMuZGF0YTEpO1xuICAgIHRoaXMubm90ZSA9IG5vdGU7XG4gICAgdGhpcy5ub3RlTmFtZSA9IG5vdGUuZnVsbE5hbWU7XG4gICAgdGhpcy5ub3RlTnVtYmVyID0gbm90ZS5udW1iZXI7XG4gICAgdGhpcy5vY3RhdmUgPSBub3RlLm9jdGF2ZTtcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IG5vdGUuZnJlcXVlbmN5O1xuXG4gICAgaWYodGhpcy5taWRpTm90ZSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIHRoaXMubWlkaU5vdGUucGl0Y2ggPSB0aGlzLmRhdGExO1xuICAgIH1cbiAgICBpZih0aGlzLnN0YXRlICE9PSAnbmV3Jyl7XG4gICAgICB0aGlzLnN0YXRlID0gJ2NoYW5nZWQnO1xuICAgIH1cbiAgICBpZih0aGlzLnBhcnQgIT09IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLnBhcnQubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG5cblxuICBtb3ZlKHRpY2tzKXtcbiAgICBpZihpc05hTih0aWNrcykpe1xuICAgICAgZXJyb3IoJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMudGlja3MgKz0gcGFyc2VJbnQodGlja3MsIDEwKTtcbiAgICBpZih0aGlzLnN0YXRlICE9PSAnbmV3Jyl7XG4gICAgICB0aGlzLnN0YXRlID0gJ2NoYW5nZWQnO1xuICAgIH1cbiAgICBpZih0aGlzLnBhcnQgIT09IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLnBhcnQubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG5cblxuICBtb3ZlVG8oLi4ucG9zaXRpb24pe1xuXG4gICAgaWYocG9zaXRpb25bMF0gPT09ICd0aWNrcycgJiYgaXNOYU4ocG9zaXRpb25bMV0pID09PSBmYWxzZSl7XG4gICAgICB0aGlzLnRpY2tzID0gcGFyc2VJbnQocG9zaXRpb25bMV0sIDEwKTtcbiAgICB9ZWxzZSBpZih0aGlzLnNvbmcgPT09IHVuZGVmaW5lZCl7XG4gICAgICBjb25zb2xlLmVycm9yKCdUaGUgbWlkaSBldmVudCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gYSBzb25nIHlldDsgeW91IGNhbiBvbmx5IG1vdmUgdG8gdGlja3MgdmFsdWVzJyk7XG4gICAgfWVsc2V7XG4gICAgICBwb3NpdGlvbiA9IHRoaXMuc29uZy5nZXRQb3NpdGlvbihwb3NpdGlvbik7XG4gICAgICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgICAgICBjb25zb2xlLmVycm9yKCd3cm9uZyBwb3NpdGlvbiBkYXRhJyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy50aWNrcyA9IHBvc2l0aW9uLnRpY2tzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKHRoaXMuc3RhdGUgIT09ICduZXcnKXtcbiAgICAgIHRoaXMuc3RhdGUgPSAnY2hhbmdlZCc7XG4gICAgfVxuICAgIGlmKHRoaXMucGFydCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIHRoaXMucGFydC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICB9XG5cblxuICByZXNldChmcm9tUGFydCwgZnJvbVRyYWNrLCBmcm9tU29uZyl7XG5cbiAgICBmcm9tUGFydCA9IGZyb21QYXJ0ID09PSB1bmRlZmluZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgZnJvbVRyYWNrID0gZnJvbVRyYWNrID09PSB1bmRlZmluZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgZnJvbVNvbmcgPSBmcm9tU29uZyA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgaWYoZnJvbVBhcnQpe1xuICAgICAgdGhpcy5wYXJ0ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5wYXJ0SWQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmKGZyb21UcmFjayl7XG4gICAgICB0aGlzLnRyYWNrID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy50cmFja0lkID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5jaGFubmVsID0gMDtcbiAgICB9XG4gICAgaWYoZnJvbVNvbmcpe1xuICAgICAgdGhpcy5zb25nID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG5cblxuICAvLyBpbXBsZW1lbnRlZCBiZWNhdXNlIG9mIHRoZSBjb21tb24gaW50ZXJmYWNlIG9mIG1pZGkgYW5kIGF1ZGlvIGV2ZW50c1xuICB1cGRhdGUoKXtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVNSURJRXZlbnQoKXtcbiAgcmV0dXJuIG5ldyBNSURJRXZlbnQoLi4uYXJndW1lbnRzKTtcbn1cbiIsIi8qXG4gIEV4dHJhY3RzIGFsbCBtaWRpIGV2ZW50cyBmcm9tIGEgYmluYXJ5IG1pZGkgZmlsZSwgdXNlcyBtaWRpX3N0cmVhbS5qc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgY3JlYXRlTUlESVN0cmVhbSBmcm9tICcuL21pZGlfc3RyZWFtJztcblxubGV0XG4gIGxhc3RFdmVudFR5cGVCeXRlLFxuICB0cmFja05hbWU7XG5cblxuZnVuY3Rpb24gcmVhZENodW5rKHN0cmVhbSl7XG4gIGxldCBpZCA9IHN0cmVhbS5yZWFkKDQsIHRydWUpO1xuICBsZXQgbGVuZ3RoID0gc3RyZWFtLnJlYWRJbnQzMigpO1xuICAvL2NvbnNvbGUubG9nKGxlbmd0aCk7XG4gIHJldHVybntcbiAgICAnaWQnOiBpZCxcbiAgICAnbGVuZ3RoJzogbGVuZ3RoLFxuICAgICdkYXRhJzogc3RyZWFtLnJlYWQobGVuZ3RoLCBmYWxzZSlcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiByZWFkRXZlbnQoc3RyZWFtKXtcbiAgdmFyIGV2ZW50ID0ge307XG4gIHZhciBsZW5ndGg7XG4gIGV2ZW50LmRlbHRhVGltZSA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gIGxldCBldmVudFR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gIC8vY29uc29sZS5sb2coZXZlbnRUeXBlQnl0ZSwgZXZlbnRUeXBlQnl0ZSAmIDB4ODAsIDE0NiAmIDB4MGYpO1xuICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ZjApID09IDB4ZjApe1xuICAgIC8qIHN5c3RlbSAvIG1ldGEgZXZlbnQgKi9cbiAgICBpZihldmVudFR5cGVCeXRlID09IDB4ZmYpe1xuICAgICAgLyogbWV0YSBldmVudCAqL1xuICAgICAgZXZlbnQudHlwZSA9ICdtZXRhJztcbiAgICAgIGxldCBzdWJ0eXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIHN3aXRjaChzdWJ0eXBlQnl0ZSl7XG4gICAgICAgIGNhc2UgMHgwMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlTnVtYmVyJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2VxdWVuY2VOdW1iZXIgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWJlciA9IHN0cmVhbS5yZWFkSW50MTYoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RleHQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAyOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29weXJpZ2h0Tm90aWNlJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RyYWNrTmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2luc3RydW1lbnROYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2x5cmljcyc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtYXJrZXInO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA3OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY3VlUG9pbnQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDIwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWlkaUNoYW5uZWxQcmVmaXgnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMSl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBtaWRpQ2hhbm5lbFByZWZpeCBldmVudCBpcyAxLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQuY2hhbm5lbCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDJmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnZW5kT2ZUcmFjayc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAwKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGVuZE9mVHJhY2sgZXZlbnQgaXMgMCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDUxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2V0VGVtcG8nO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMyl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXRUZW1wbyBldmVudCBpcyAzLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdCA9IChcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCAxNikgK1xuICAgICAgICAgICAgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDgpICtcbiAgICAgICAgICAgIHN0cmVhbS5yZWFkSW50OCgpXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1NDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NtcHRlT2Zmc2V0JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDUpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc21wdGVPZmZzZXQgZXZlbnQgaXMgNSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBob3VyQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lUmF0ZSA9e1xuICAgICAgICAgICAgMHgwMDogMjQsIDB4MjA6IDI1LCAweDQwOiAyOSwgMHg2MDogMzBcbiAgICAgICAgICB9W2hvdXJCeXRlICYgMHg2MF07XG4gICAgICAgICAgZXZlbnQuaG91ciA9IGhvdXJCeXRlICYgMHgxZjtcbiAgICAgICAgICBldmVudC5taW4gPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zZWMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnN1YmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTg6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0aW1lU2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDQpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgdGltZVNpZ25hdHVyZSBldmVudCBpcyA0LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtZXJhdG9yID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZGVub21pbmF0b3IgPSBNYXRoLnBvdygyLCBzdHJlYW0ucmVhZEludDgoKSk7XG4gICAgICAgICAgZXZlbnQubWV0cm9ub21lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQudGhpcnR5c2Vjb25kcyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU5OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAna2V5U2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Iga2V5U2lnbmF0dXJlIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5rZXkgPSBzdHJlYW0ucmVhZEludDgodHJ1ZSk7XG4gICAgICAgICAgZXZlbnQuc2NhbGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg3ZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlclNwZWNpZmljJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9pZihzZXF1ZW5jZXIuZGVidWcgPj0gMil7XG4gICAgICAgICAgLy8gICAgY29uc29sZS53YXJuKCdVbnJlY29nbmlzZWQgbWV0YSBldmVudCBzdWJ0eXBlOiAnICsgc3VidHlwZUJ5dGUpO1xuICAgICAgICAgIC8vfVxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfVxuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2UgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGYwKXtcbiAgICAgIGV2ZW50LnR5cGUgPSAnc3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmNyl7XG4gICAgICBldmVudC50eXBlID0gJ2RpdmlkZWRTeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZSBieXRlOiAnICsgZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gIH1lbHNle1xuICAgIC8qIGNoYW5uZWwgZXZlbnQgKi9cbiAgICBsZXQgcGFyYW0xO1xuICAgIGlmKChldmVudFR5cGVCeXRlICYgMHg4MCkgPT09IDApe1xuICAgICAgLyogcnVubmluZyBzdGF0dXMgLSByZXVzZSBsYXN0RXZlbnRUeXBlQnl0ZSBhcyB0aGUgZXZlbnQgdHlwZS5cbiAgICAgICAgZXZlbnRUeXBlQnl0ZSBpcyBhY3R1YWxseSB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gICAgICAqL1xuICAgICAgLy9jb25zb2xlLmxvZygncnVubmluZyBzdGF0dXMnKTtcbiAgICAgIHBhcmFtMSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgICBldmVudFR5cGVCeXRlID0gbGFzdEV2ZW50VHlwZUJ5dGU7XG4gICAgfWVsc2V7XG4gICAgICBwYXJhbTEgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2xhc3QnLCBldmVudFR5cGVCeXRlKTtcbiAgICAgIGxhc3RFdmVudFR5cGVCeXRlID0gZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gICAgbGV0IGV2ZW50VHlwZSA9IGV2ZW50VHlwZUJ5dGUgPj4gNDtcbiAgICBldmVudC5jaGFubmVsID0gZXZlbnRUeXBlQnl0ZSAmIDB4MGY7XG4gICAgZXZlbnQudHlwZSA9ICdjaGFubmVsJztcbiAgICBzd2l0Y2ggKGV2ZW50VHlwZSl7XG4gICAgICBjYXNlIDB4MDg6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwOTpcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgaWYoZXZlbnQudmVsb2NpdHkgPT09IDApe1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdub3RlT24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGE6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZUFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC5hbW91bnQgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBiOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvbnRyb2xsZXInO1xuICAgICAgICBldmVudC5jb250cm9sbGVyVHlwZSA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBjOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Byb2dyYW1DaGFuZ2UnO1xuICAgICAgICBldmVudC5wcm9ncmFtTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGQ6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY2hhbm5lbEFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5hbW91bnQgPSBwYXJhbTE7XG4gICAgICAgIC8vaWYodHJhY2tOYW1lID09PSAnU0gtUzEtNDQtQzA5IEw9U01MIElOPTMnKXtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ2NoYW5uZWwgcHJlc3N1cmUnLCB0cmFja05hbWUsIHBhcmFtMSk7XG4gICAgICAgIC8vfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGU6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncGl0Y2hCZW5kJztcbiAgICAgICAgZXZlbnQudmFsdWUgPSBwYXJhbTEgKyAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgNyk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8qXG4gICAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlO1xuICAgICAgICBjb25zb2xlLmxvZygnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZSk7XG4gICAgICAgICovXG5cbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4vKlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgIGNvbnNvbGUubG9nKCd3ZWlyZG8nLCB0cmFja05hbWUsIHBhcmFtMSwgZXZlbnQudmVsb2NpdHkpO1xuKi9cblxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNSURJRmlsZShidWZmZXIpe1xuICBsZXQgdHJhY2tzID0gbmV3IE1hcCgpO1xuICBsZXQgc3RyZWFtID0gY3JlYXRlTUlESVN0cmVhbShuZXcgVWludDhBcnJheShidWZmZXIpKTtcblxuICBsZXQgaGVhZGVyQ2h1bmsgPSByZWFkQ2h1bmsoc3RyZWFtKTtcbiAgaWYoaGVhZGVyQ2h1bmsuaWQgIT09ICdNVGhkJyB8fCBoZWFkZXJDaHVuay5sZW5ndGggIT09IDYpe1xuICAgIHRocm93ICdCYWQgLm1pZCBmaWxlIC0gaGVhZGVyIG5vdCBmb3VuZCc7XG4gIH1cblxuICBsZXQgaGVhZGVyU3RyZWFtID0gY3JlYXRlTUlESVN0cmVhbShoZWFkZXJDaHVuay5kYXRhKTtcbiAgbGV0IGZvcm1hdFR5cGUgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0cmFja0NvdW50ID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG4gIGlmKHRpbWVEaXZpc2lvbiAmIDB4ODAwMCl7XG4gICAgdGhyb3cgJ0V4cHJlc3NpbmcgdGltZSBkaXZpc2lvbiBpbiBTTVRQRSBmcmFtZXMgaXMgbm90IHN1cHBvcnRlZCB5ZXQnO1xuICB9XG5cbiAgbGV0IGhlYWRlciA9e1xuICAgICdmb3JtYXRUeXBlJzogZm9ybWF0VHlwZSxcbiAgICAndHJhY2tDb3VudCc6IHRyYWNrQ291bnQsXG4gICAgJ3RpY2tzUGVyQmVhdCc6IHRpbWVEaXZpc2lvblxuICB9O1xuXG4gIGZvcihsZXQgaSA9IDA7IGkgPCB0cmFja0NvdW50OyBpKyspe1xuICAgIHRyYWNrTmFtZSA9ICd0cmFja18nICsgaTtcbiAgICBsZXQgdHJhY2sgPSBbXTtcbiAgICBsZXQgdHJhY2tDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICAgIGlmKHRyYWNrQ2h1bmsuaWQgIT09ICdNVHJrJyl7XG4gICAgICB0aHJvdyAnVW5leHBlY3RlZCBjaHVuayAtIGV4cGVjdGVkIE1UcmssIGdvdCAnKyB0cmFja0NodW5rLmlkO1xuICAgIH1cbiAgICBsZXQgdHJhY2tTdHJlYW0gPSBjcmVhdGVNSURJU3RyZWFtKHRyYWNrQ2h1bmsuZGF0YSk7XG4gICAgd2hpbGUoIXRyYWNrU3RyZWFtLmVvZigpKXtcbiAgICAgIGxldCBldmVudCA9IHJlYWRFdmVudCh0cmFja1N0cmVhbSk7XG4gICAgICB0cmFjay5wdXNoKGV2ZW50KTtcbiAgICB9XG4gICAgdHJhY2tzLnNldCh0cmFja05hbWUsIHRyYWNrKTtcbiAgfVxuXG4gIHJldHVybntcbiAgICAnaGVhZGVyJzogaGVhZGVyLFxuICAgICd0cmFja3MnOiB0cmFja3NcbiAgfTtcbn0iLCIvKlxuICBXcmFwcGVyIGZvciBhY2Nlc3NpbmcgYnl0ZXMgdGhyb3VnaCBzZXF1ZW50aWFsIHJlYWRzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4gIGFkYXB0ZWQgdG8gd29yayB3aXRoIEFycmF5QnVmZmVyIC0+IFVpbnQ4QXJyYXlcbiovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG5jbGFzcyBNSURJU3RyZWFte1xuXG4gIC8vIGJ1ZmZlciBpcyBVaW50OEFycmF5XG4gIGNvbnN0cnVjdG9yKGJ1ZmZlcil7XG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICAvKiByZWFkIHN0cmluZyBvciBhbnkgbnVtYmVyIG9mIGJ5dGVzICovXG4gIHJlYWQobGVuZ3RoLCB0b1N0cmluZyA9IHRydWUpIHtcbiAgICBsZXQgcmVzdWx0O1xuXG4gICAgaWYodG9TdHJpbmcpe1xuICAgICAgcmVzdWx0ID0gJyc7XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdCArPSBmY2ModGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9ZWxzZXtcbiAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDMyLWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQzMigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDI0KSArXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdIDw8IDE2KSArXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDJdIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAzXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSA0O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAxNi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MTYoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV1cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhbiA4LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQ4KHNpZ25lZCkge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXTtcbiAgICBpZihzaWduZWQgJiYgcmVzdWx0ID4gMTI3KXtcbiAgICAgIHJlc3VsdCAtPSAyNTY7XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb24gKz0gMTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZW9mKCkge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uID49IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBNSURJLXN0eWxlIGxldGlhYmxlLWxlbmd0aCBpbnRlZ2VyXG4gICAgKGJpZy1lbmRpYW4gdmFsdWUgaW4gZ3JvdXBzIG9mIDcgYml0cyxcbiAgICB3aXRoIHRvcCBiaXQgc2V0IHRvIHNpZ25pZnkgdGhhdCBhbm90aGVyIGJ5dGUgZm9sbG93cylcbiAgKi9cbiAgcmVhZFZhckludCgpIHtcbiAgICBsZXQgcmVzdWx0ID0gMDtcbiAgICB3aGlsZSh0cnVlKSB7XG4gICAgICBsZXQgYiA9IHRoaXMucmVhZEludDgoKTtcbiAgICAgIGlmIChiICYgMHg4MCkge1xuICAgICAgICByZXN1bHQgKz0gKGIgJiAweDdmKTtcbiAgICAgICAgcmVzdWx0IDw8PSA3O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyogYiBpcyB0aGUgbGFzdCBieXRlICovXG4gICAgICAgIHJldHVybiByZXN1bHQgKyBiO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZU1JRElTdHJlYW0oYnVmZmVyKXtcbiAgcmV0dXJuIG5ldyBNSURJU3RyZWFtKGJ1ZmZlcik7XG59XG4iLCIvKlxuICBBZGRzIGEgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbm90ZSBvYmplY3QgdGhhdCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhIG11c2ljYWwgbm90ZTpcbiAgICAtIG5hbWUsIGUuZy4gJ0MnXG4gICAgLSBvY3RhdmUsICAtMSAtIDlcbiAgICAtIGZ1bGxOYW1lOiAnQzEnXG4gICAgLSBmcmVxdWVuY3k6IDIzNC4xNiwgYmFzZWQgb24gdGhlIGJhc2ljIHBpdGNoXG4gICAgLSBudW1iZXI6IDYwIG1pZGkgbm90ZSBudW1iZXJcblxuICBBZGRzIHNldmVyYWwgdXRpbGl0eSBtZXRob2RzIG9yZ2FuaXNlZCBhcm91bmQgdGhlIG5vdGUgb2JqZWN0XG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBnZXRDb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtsb2csIGluZm8sIHdhcm4sIGVycm9yLCB0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnO1xuXG5sZXRcbiAgZXJyb3JNc2csXG4gIHdhcm5pbmdNc2csXG4gIGNvbmZpZyA9IGdldENvbmZpZygpLFxuICBwb3cgPSBNYXRoLnBvdyxcbiAgZmxvb3IgPSBNYXRoLmZsb29yO1xuXG5jb25zdCBub3RlTmFtZXMgPSB7XG4gICdzaGFycCcgOiBbJ0MnLCAnQyMnLCAnRCcsICdEIycsICdFJywgJ0YnLCAnRiMnLCAnRycsICdHIycsICdBJywgJ0EjJywgJ0InXSxcbiAgJ2ZsYXQnIDogWydDJywgJ0RiJywgJ0QnLCAnRWInLCAnRScsICdGJywgJ0diJywgJ0cnLCAnQWInLCAnQScsICdCYicsICdCJ10sXG4gICdlbmhhcm1vbmljLXNoYXJwJyA6IFsnQiMnLCAnQyMnLCAnQyMjJywgJ0QjJywgJ0QjIycsICdFIycsICdGIycsICdGIyMnLCAnRyMnLCAnRyMjJywgJ0EjJywgJ0EjIyddLFxuICAnZW5oYXJtb25pYy1mbGF0JyA6IFsnRGJiJywgJ0RiJywgJ0ViYicsICdFYicsICdGYicsICdHYmInLCAnR2InLCAnQWJiJywgJ0FiJywgJ0JiYicsICdCYicsICdDYiddXG59O1xuXG5cbi8qXG4gIGFyZ3VtZW50c1xuICAtIG5vdGVOdW1iZXI6IDYwXG4gIC0gbm90ZU51bWJlciBhbmQgbm90ZW5hbWUgbW9kZTogNjAsICdzaGFycCdcbiAgLSBub3RlTmFtZTogJ0MjNCdcbiAgLSBuYW1lIGFuZCBvY3RhdmU6ICdDIycsIDRcbiAgLSBub3RlIG5hbWUsIG9jdGF2ZSwgbm90ZSBuYW1lIG1vZGU6ICdEJywgNCwgJ3NoYXJwJ1xuICAtIGRhdGEgb2JqZWN0OlxuICAgIHtcbiAgICAgIG5hbWU6ICdDJyxcbiAgICAgIG9jdGF2ZTogNFxuICAgIH1cbiAgICBvclxuICAgIHtcbiAgICAgIGZyZXF1ZW5jeTogMjM0LjE2XG4gICAgfVxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5vdGUoLi4uYXJncyl7XG4gIGxldFxuICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICBkYXRhLFxuICAgIG9jdGF2ZSxcbiAgICBub3RlTmFtZSxcbiAgICBub3RlTnVtYmVyLFxuICAgIG5vdGVOYW1lTW9kZSxcbiAgICBhcmcwID0gYXJnc1swXSxcbiAgICBhcmcxID0gYXJnc1sxXSxcbiAgICBhcmcyID0gYXJnc1syXSxcbiAgICB0eXBlMCA9IHR5cGVTdHJpbmcoYXJnMCksXG4gICAgdHlwZTEgPSB0eXBlU3RyaW5nKGFyZzEpLFxuICAgIHR5cGUyID0gdHlwZVN0cmluZyhhcmcyKTtcblxuICBlcnJvck1zZyA9ICcnO1xuICB3YXJuaW5nTXNnID0gJyc7XG5cbiAgLy8gYXJndW1lbnQ6IG5vdGUgbnVtYmVyXG4gIGlmKG51bUFyZ3MgPT09IDEgJiYgdHlwZTAgPT09ICdudW1iZXInKXtcbiAgICBpZihhcmcwIDwgMCB8fCBhcmcwID4gMTI3KXtcbiAgICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBudW1iZXIgPj0gMCBhbmQgPD0gMTI3ICcgKyAgYXJnMDtcbiAgICB9ZWxzZXtcbiAgICAgIG5vdGVOdW1iZXIgPSBhcmcwO1xuICAgICAgZGF0YSA9IF9nZXROb3RlTmFtZShub3RlTnVtYmVyKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgfVxuXG5cbiAgLy8gYXJndW1lbnRzOiBmdWxsIG5vdGUgbmFtZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAxICYmIHR5cGUwID09PSAnc3RyaW5nJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzApO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbmFtZSwgb2N0YXZlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzAsIGFyZzEpO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuICAvLyBhcmd1bWVudHM6IGZ1bGwgbm90ZSBuYW1lLCBub3RlIG5hbWUgbW9kZSAtPiBmb3IgY29udmVydGluZyBiZXR3ZWVuIG5vdGUgbmFtZSBtb2Rlc1xuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzEpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbnVtYmVyLCBub3RlIG5hbWUgbW9kZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGVTdHJpbmcoYXJnMCkgPT09ICdudW1iZXInICYmIHR5cGVTdHJpbmcoYXJnMSkgPT09ICdzdHJpbmcnKXtcbiAgICBpZihhcmcwIDwgMCB8fCBhcmcwID4gMTI3KXtcbiAgICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBudW1iZXIgPj0gMCBhbmQgPD0gMTI3ICcgKyBhcmcwO1xuICAgIH1lbHNle1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzEpO1xuICAgICAgbm90ZU51bWJlciA9IGFyZzA7XG4gICAgICBkYXRhID0gX2dldE5vdGVOYW1lKG5vdGVOdW1iZXIsIG5vdGVOYW1lTW9kZSk7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgIH1cblxuXG4gIC8vIGFyZ3VtZW50czogbm90ZSBuYW1lLCBvY3RhdmUsIG5vdGUgbmFtZSBtb2RlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDMgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyAmJiB0eXBlMiA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwLCBhcmcxKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzIpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSxvY3RhdmUpO1xuICAgIH1cblxuICB9ZWxzZXtcbiAgICBlcnJvck1zZyA9ICd3cm9uZyBhcmd1bWVudHMsIHBsZWFzZSBjb25zdWx0IGRvY3VtZW50YXRpb24nO1xuICB9XG5cbiAgaWYoZXJyb3JNc2cpe1xuICAgIGVycm9yKGVycm9yTXNnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZih3YXJuaW5nTXNnKXtcbiAgICB3YXJuKHdhcm5pbmdNc2cpO1xuICB9XG5cbiAgbGV0IG5vdGUgPSB7XG4gICAgbmFtZTogbm90ZU5hbWUsXG4gICAgb2N0YXZlOiBvY3RhdmUsXG4gICAgZnVsbE5hbWU6IG5vdGVOYW1lICsgb2N0YXZlLFxuICAgIG51bWJlcjogbm90ZU51bWJlcixcbiAgICBmcmVxdWVuY3k6IF9nZXRGcmVxdWVuY3kobm90ZU51bWJlciksXG4gICAgYmxhY2tLZXk6IF9pc0JsYWNrS2V5KG5vdGVOdW1iZXIpXG4gIH1cbiAgT2JqZWN0LmZyZWV6ZShub3RlKTtcbiAgcmV0dXJuIG5vdGU7XG59XG5cblxuZnVuY3Rpb24gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSA9IGNvbmZpZy5nZXQoJ25vdGVOYW1lTW9kZScpKSB7XG4gIC8vbGV0IG9jdGF2ZSA9IE1hdGguZmxvb3IoKG51bWJlciAvIDEyKSAtIDIpLCAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgbGV0IG9jdGF2ZSA9IGZsb29yKChudW1iZXIgLyAxMikgLSAxKTtcbiAgbGV0IG5vdGVOYW1lID0gbm90ZU5hbWVzW21vZGVdW251bWJlciAlIDEyXTtcbiAgcmV0dXJuIFtub3RlTmFtZSwgb2N0YXZlXTtcbn1cblxuXG5mdW5jdGlvbiBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpIHtcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgaW5kZXg7XG5cbiAgZm9yKGxldCBrZXkgb2Yga2V5cyl7XG4gICAgbGV0IG1vZGUgPSBub3RlTmFtZXNba2V5XTtcbiAgICBpbmRleCA9IG1vZGUuZmluZEluZGV4KHggPT4geCA9PT0gbmFtZSk7XG4gICAgaWYoaW5kZXggIT09IC0xKXtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKSArIDEyOyAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgbGV0IG51bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMik7Ly8g4oaSIG1pZGkgc3RhbmRhcmQgKyBzY2llbnRpZmljIG5hbWluZywgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01pZGRsZV9DIGFuZCBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NjaWVudGlmaWNfcGl0Y2hfbm90YXRpb25cblxuICBpZihudW1iZXIgPCAwIHx8IG51bWJlciA+IDEyNyl7XG4gICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYSBub3RlIGJldHdlZW4gQzAgYW5kIEcxMCc7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJldHVybiBudW1iZXI7XG59XG5cblxuZnVuY3Rpb24gX2dldEZyZXF1ZW5jeShudW1iZXIpe1xuICByZXR1cm4gY29uZmlnLmdldCgncGl0Y2gnKSAqIHBvdygyLChudW1iZXIgLSA2OSkvMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbn1cblxuXG4vLyBUT0RPOiBjYWxjdWxhdGUgbm90ZSBmcm9tIGZyZXF1ZW5jeVxuZnVuY3Rpb24gX2dldFBpdGNoKGhlcnR6KXtcbiAgLy9mbSAgPSAgMiht4oiSNjkpLzEyKDQ0MCBIeikuXG59XG5cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpe1xuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIGxldCByZXN1bHQgPSBrZXlzLmZpbmQoeCA9PiB4ID09PSBtb2RlKSAhPT0gdW5kZWZpbmVkO1xuICBpZihyZXN1bHQgPT09IGZhbHNlKXtcbiAgICBtb2RlID0gY29uZmlnLmdldCgnbm90ZU5hbWVNb2RlJyk7XG4gICAgd2FybmluZ01zZyA9IG1vZGUgKyAnIGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSBtb2RlLCB1c2luZyBcIicgKyBtb2RlICsgJ1wiIGluc3RlYWQnO1xuICB9XG4gIHJldHVybiBtb2RlO1xufVxuXG5cbmZ1bmN0aW9uIF9jaGVja05vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXRcbiAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgYXJnMCA9IGFyZ3NbMF0sXG4gICAgYXJnMSA9IGFyZ3NbMV0sXG4gICAgY2hhcixcbiAgICBuYW1lID0gJycsXG4gICAgb2N0YXZlID0gJyc7XG5cbiAgLy8gZXh0cmFjdCBvY3RhdmUgZnJvbSBub3RlIG5hbWVcbiAgaWYobnVtQXJncyA9PT0gMSl7XG4gICAgZm9yKGNoYXIgb2YgYXJnMCl7XG4gICAgICBpZihpc05hTihjaGFyKSAmJiBjaGFyICE9PSAnLScpe1xuICAgICAgICBuYW1lICs9IGNoYXI7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgb2N0YXZlICs9IGNoYXI7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKG9jdGF2ZSA9PT0gJycpe1xuICAgICAgb2N0YXZlID0gMDtcbiAgICB9XG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIpe1xuICAgIG5hbWUgPSBhcmcwO1xuICAgIG9jdGF2ZSA9IGFyZzE7XG4gIH1cblxuICAvLyBjaGVjayBpZiBub3RlIG5hbWUgaXMgdmFsaWRcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgaW5kZXggPSAtMTtcblxuICBmb3IobGV0IGtleSBvZiBrZXlzKXtcbiAgICBsZXQgbW9kZSA9IG5vdGVOYW1lc1trZXldO1xuICAgIGluZGV4ID0gbW9kZS5maW5kSW5kZXgoeCA9PiB4ID09PSBuYW1lKTtcbiAgICBpZihpbmRleCAhPT0gLTEpe1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYoaW5kZXggPT09IC0xKXtcbiAgICBlcnJvck1zZyA9IGFyZzAgKyAnIGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSwgcGxlYXNlIHVzZSBsZXR0ZXJzIEEgLSBHIGFuZCBpZiBuZWNlc3NhcnkgYW4gYWNjaWRlbnRhbCBsaWtlICMsICMjLCBiIG9yIGJiLCBmb2xsb3dlZCBieSBhIG51bWJlciBmb3IgdGhlIG9jdGF2ZSc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYob2N0YXZlIDwgLTEgfHwgb2N0YXZlID4gOSl7XG4gICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYW4gb2N0YXZlIGJldHdlZW4gLTEgYW5kIDknO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG9jdGF2ZSA9IHBhcnNlSW50KG9jdGF2ZSwgMTApO1xuICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMCwgMSkudG9VcHBlckNhc2UoKSArIG5hbWUuc3Vic3RyaW5nKDEpO1xuXG4gIC8vY29uc29sZS5sb2cobmFtZSwnfCcsb2N0YXZlKTtcbiAgcmV0dXJuIFtuYW1lLCBvY3RhdmVdO1xufVxuXG5cblxuZnVuY3Rpb24gX2lzQmxhY2tLZXkobm90ZU51bWJlcil7XG4gIGxldCBibGFjaztcblxuICBzd2l0Y2godHJ1ZSl7XG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDE6Ly9DI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAzOi8vRCNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gNjovL0YjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDg6Ly9HI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxMDovL0EjXG4gICAgICBibGFjayA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYmxhY2sgPSBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBibGFjaztcbn1cblxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVOdW1iZXIoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUubnVtYmVyO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZU5hbWUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUubmFtZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVPY3RhdmUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUub2N0YXZlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnVsbE5vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmZ1bGxOYW1lO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnJlcXVlbmN5KC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmZyZXF1ZW5jeTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQmxhY2tLZXkoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUuYmxhY2tLZXk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgcGFydElkID0gMDtcblxuXG5jbGFzcyBQYXJ0e1xuXG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgIGxldCBpZCA9ICdQJyArIHBhcnRJZCsrICsgRGF0ZS5ub3coKTtcblxuICB9XG5cblxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVBhcnQoKXtcbiAgcmV0dXJuIG5ldyBQYXJ0KC4uLmFyZ3VtZW50cyk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2FkZEV2ZW50TGlzdGVuZXIsIHJlbW92ZUV2ZW50TGlzdGVuZXIsIGRpc3BhdGNoRXZlbnR9IGZyb20gJy4vc29uZ19hZGRfZXZlbnRsaXN0ZW5lcic7XG5pbXBvcnQge2xvZywgaW5mbywgd2FybiwgZXJyb3IsIHR5cGVTdHJpbmd9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgZ2V0Q29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBjcmVhdGVNaWRpRXZlbnQgZnJvbSAnLi9taWRpX2V2ZW50JztcbmltcG9ydCB7aW5pdE1pZGlTb25nLCBzZXRNaWRpSW5wdXRTb25nLCBzZXRNaWRpT3V0cHV0U29uZ30gZnJvbSAnLi9pbml0X21pZGknO1xuXG5cbmxldCBzb25nSWQgPSAwLFxuICBjb25maWcgPSBnZXRDb25maWcoKSxcbiAgZGVmYXVsdFNvbmcgPSBjb25maWcuZ2V0KCdkZWZhdWx0U29uZycpO1xuXG5cbmNsYXNzIFNvbmd7XG5cbiAgLypcbiAgICBAcGFyYW0gc2V0dGluZ3MgaXMgYSBNYXAgb3IgYW4gT2JqZWN0XG4gICovXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzKXtcblxuICAgIHRoaXMuaWQgPSAnUycgKyBzb25nSWQrKyArIERhdGUubm93KCk7XG4gICAgdGhpcy5uYW1lID0gdGhpcy5pZDtcbiAgICB0aGlzLnRyYWNrcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnBhcnRzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuZXZlbnRzID0gW107IC8vIGFsbCBtaWRpIGFuZCBhdWRpbyBldmVudHNcbiAgICB0aGlzLmFsbEV2ZW50cyA9IFtdOyAvL1xuICAgIHRoaXMudGltZUV2ZW50cyA9IFtdOyAvLyBhbGwgdGVtcG8gYW5kIHRpbWUgc2lnbmF0dXJlIGV2ZW50c1xuXG4gICAgLy8gZmlyc3QgYWRkIGFsbCBzZXR0aW5ncyBmcm9tIHRoZSBkZWZhdWx0IHNvbmdcbi8vLypcbiAgICBkZWZhdWx0U29uZy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuICAgICAgdGhpc1trZXldID0gdmFsdWU7XG4gICAgfSwgdGhpcyk7XG4vLyovXG4vKlxuICAgIC8vIG9yOlxuICAgIGZvcihsZXRbdmFsdWUsIGtleV0gb2YgZGVmYXVsdFNvbmcuZW50cmllcygpKXtcbiAgICAgICgoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzW2tleV0gPSB2YWx1ZTtcbiAgICAgIH0pKGtleSwgdmFsdWUpO1xuICAgIH1cbiovXG5cbiAgICAvLyB0aGVuIG92ZXJyaWRlIHNldHRpbmdzIGJ5IHByb3ZpZGVkIHNldHRpbmdzXG4gICAgaWYodHlwZVN0cmluZyhzZXR0aW5ncykgPT09ICdvYmplY3QnKXtcbiAgICAgIE9iamVjdC5rZXlzKHNldHRpbmdzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIHRoaXNba2V5XSA9IHNldHRpbmdzW2tleV07XG4gICAgICB9LCB0aGlzKTtcbiAgICB9ZWxzZSBpZihzZXR0aW5ncyAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIHNldHRpbmdzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSl7XG4gICAgICAgIHRoaXNba2V5XSA9IHZhbHVlO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gaW5pdGlhbGl6ZSBtaWRpIGZvciB0aGlzIHNvbmc6IGFkZCBNYXBzIGZvciBtaWRpIGluLSBhbmQgb3V0cHV0cywgYW5kIGFkZCBldmVudGxpc3RlbmVycyB0byB0aGUgbWlkaSBpbnB1dHNcbiAgICB0aGlzLm1pZGlJbnB1dHMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5taWRpT3V0cHV0cyA9IG5ldyBNYXAoKTtcbiAgICBpbml0TWlkaVNvbmcodGhpcyk7IC8vIEBzZWU6IGluaXRfbWlkaS5qc1xuXG4gICAgdGhpcy5sYXN0QmFyID0gdGhpcy5iYXJzO1xuICAgIHRoaXMucGl0Y2hSYW5nZSA9IHRoaXMuaGlnaGVzdE5vdGUgLSB0aGlzLmxvd2VzdE5vdGUgKyAxO1xuICAgIHRoaXMuZmFjdG9yID0gNC90aGlzLmRlbm9taW5hdG9yO1xuICAgIHRoaXMudGlja3NQZXJCZWF0ID0gdGhpcy5wcHEgKiB0aGlzLmZhY3RvcjtcbiAgICB0aGlzLnRpY2tzUGVyQmFyID0gdGhpcy50aWNrc1BlckJlYXQgKiB0aGlzLm5vbWluYXRvcjtcbiAgICB0aGlzLm1pbGxpc1BlclRpY2sgPSAoNjAwMDAvdGhpcy5icG0vdGhpcy5wcHEpO1xuICAgIHRoaXMucmVjb3JkSWQgPSAtMTtcbiAgICB0aGlzLmRvTG9vcCA9IGZhbHNlO1xuICAgIHRoaXMuaWxsZWdhbExvb3AgPSB0cnVlO1xuICAgIHRoaXMubG9vcFN0YXJ0ID0gMDtcbiAgICB0aGlzLmxvb3BFbmQgPSAwO1xuICAgIHRoaXMubG9vcER1cmF0aW9uID0gMDtcbiAgICB0aGlzLmF1ZGlvUmVjb3JkaW5nTGF0ZW5jeSA9IDA7XG4gICAgdGhpcy5ncmlkID0gdW5kZWZpbmVkO1xuXG4gICAgY29uZmlnLmdldCgnYWN0aXZlU29uZ3MnKVt0aGlzLmlkXSA9IHRoaXM7XG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMpO1xuLypcbiAgICBpZihzZXR0aW5ncy50aW1lRXZlbnRzICYmIHNldHRpbmdzLnRpbWVFdmVudHMubGVuZ3RoID4gMCl7XG4gICAgICB0aGlzLnRpbWVFdmVudHMgPSBbXS5jb25jYXQoc2V0dGluZ3MudGltZUV2ZW50cyk7XG5cbiAgICAgIHRoaXMudGVtcG9FdmVudCA9IGdldFRpbWVFdmVudHMoc2VxdWVuY2VyLlRFTVBPLCB0aGlzKVswXTtcbiAgICAgIHRoaXMudGltZVNpZ25hdHVyZUV2ZW50ID0gZ2V0VGltZUV2ZW50cyhzZXF1ZW5jZXIuVElNRV9TSUdOQVRVUkUsIHRoaXMpWzBdO1xuXG4gICAgICBpZih0aGlzLnRlbXBvRXZlbnQgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHRoaXMudGVtcG9FdmVudCA9IGNyZWF0ZU1pZGlFdmVudCgwLCBzZXF1ZW5jZXIuVEVNUE8sIHRoaXMuYnBtKTtcbiAgICAgICAgdGhpcy50aW1lRXZlbnRzLnVuc2hpZnQodGhpcy50ZW1wb0V2ZW50KTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmJwbSA9IHRoaXMudGVtcG9FdmVudC5icG07XG4gICAgICB9XG4gICAgICBpZih0aGlzLnRpbWVTaWduYXR1cmVFdmVudCA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdGhpcy50aW1lU2lnbmF0dXJlRXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoMCwgc2VxdWVuY2VyLlRJTUVfU0lHTkFUVVJFLCB0aGlzLm5vbWluYXRvciwgdGhpcy5kZW5vbWluYXRvcik7XG4gICAgICAgIHRoaXMudGltZUV2ZW50cy51bnNoaWZ0KHRoaXMudGltZVNpZ25hdHVyZUV2ZW50KTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLm5vbWluYXRvciA9IHRoaXMudGltZVNpZ25hdHVyZUV2ZW50Lm5vbWluYXRvcjtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciA9IHRoaXMudGltZVNpZ25hdHVyZUV2ZW50LmRlbm9taW5hdG9yO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZygxLCB0aGlzLm5vbWluYXRvciwgdGhpcy5kZW5vbWluYXRvciwgdGhpcy5icG0pO1xuICAgIH1lbHNle1xuICAgICAgLy8gdGhlcmUgaGFzIHRvIGJlIGEgdGVtcG8gYW5kIHRpbWUgc2lnbmF0dXJlIGV2ZW50IGF0IHRpY2tzIDAsIG90aGVyd2lzZSB0aGUgcG9zaXRpb24gY2FuJ3QgYmUgY2FsY3VsYXRlZCwgYW5kIG1vcmVvdmVyLCBpdCBpcyBkaWN0YXRlZCBieSB0aGUgTUlESSBzdGFuZGFyZFxuICAgICAgdGhpcy50ZW1wb0V2ZW50ID0gY3JlYXRlTWlkaUV2ZW50KDAsIHNlcXVlbmNlci5URU1QTywgdGhpcy5icG0pO1xuICAgICAgdGhpcy50aW1lU2lnbmF0dXJlRXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoMCwgc2VxdWVuY2VyLlRJTUVfU0lHTkFUVVJFLCB0aGlzLm5vbWluYXRvciwgdGhpcy5kZW5vbWluYXRvcik7XG4gICAgICB0aGlzLnRpbWVFdmVudHMgPSBbXG4gICAgICAgIHRoaXMudGVtcG9FdmVudCxcbiAgICAgICAgdGhpcy50aW1lU2lnbmF0dXJlRXZlbnRcbiAgICAgIF07XG4gICAgfVxuXG4gICAgLy8gVE9ETzogQSB2YWx1ZSBmb3IgYnBtLCBub21pbmF0b3IgYW5kIGRlbm9taW5hdG9yIGluIHRoZSBjb25maWcgb3ZlcnJ1bGVzIHRoZSB0aW1lIGV2ZW50cyBzcGVjaWZpZWQgaW4gdGhlIGNvbmZpZyAtPiBtYXliZSB0aGlzIHNob3VsZCBiZSB0aGUgb3RoZXIgd2F5IHJvdW5kXG5cbiAgICAvLyBpZiBhIHZhbHVlIGZvciBicG0gaXMgc2V0IGluIHRoZSBjb25maWcsIGFuZCB0aGlzIHZhbHVlIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBicG0gdmFsdWUgb2YgdGhlIGZpcnN0XG4gICAgLy8gdGVtcG8gZXZlbnQsIGFsbCB0ZW1wbyBldmVudHMgd2lsbCBiZSB1cGRhdGVkIHRvIHRoZSBicG0gdmFsdWUgaW4gdGhlIGNvbmZpZy5cbiAgICBpZihjb25maWcudGltZUV2ZW50cyAhPT0gdW5kZWZpbmVkICYmIGNvbmZpZy5icG0gIT09IHVuZGVmaW5lZCl7XG4gICAgICBpZih0aGlzLmJwbSAhPT0gY29uZmlnLmJwbSl7XG4gICAgICAgIHRoaXMuc2V0VGVtcG8oY29uZmlnLmJwbSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIGEgdmFsdWUgZm9yIG5vbWluYXRvciBhbmQvb3IgZGVub21pbmF0b3IgaXMgc2V0IGluIHRoZSBjb25maWcsIGFuZCB0aGlzL3RoZXNlIHZhbHVlKHMpIGlzL2FyZSBkaWZmZXJlbnQgZnJvbSB0aGUgdmFsdWVzXG4gICAgLy8gb2YgdGhlIGZpcnN0IHRpbWUgc2lnbmF0dXJlIGV2ZW50LCBhbGwgdGltZSBzaWduYXR1cmUgZXZlbnRzIHdpbGwgYmUgdXBkYXRlZCB0byB0aGUgdmFsdWVzIGluIHRoZSBjb25maWcuXG4gICAgLy8gQFRPRE86IG1heWJlIG9ubHkgdGhlIGZpcnN0IHRpbWUgc2lnbmF0dXJlIGV2ZW50IHNob3VsZCBiZSB1cGRhdGVkP1xuICAgIGlmKGNvbmZpZy50aW1lRXZlbnRzICE9PSB1bmRlZmluZWQgJiYgKGNvbmZpZy5ub21pbmF0b3IgIT09IHVuZGVmaW5lZCB8fCBjb25maWcuZGVub21pbmF0b3IgIT09IHVuZGVmaW5lZCkpe1xuICAgICAgaWYodGhpcy5ub21pbmF0b3IgIT09IGNvbmZpZy5ub21pbmF0b3IgfHwgdGhpcy5kZW5vbWluYXRvciAhPT0gY29uZmlnLmRlbm9taW5hdG9yKXtcbiAgICAgICAgdGhpcy5zZXRUaW1lU2lnbmF0dXJlKGNvbmZpZy5ub21pbmF0b3IgfHwgdGhpcy5ub21pbmF0b3IsIGNvbmZpZy5kZW5vbWluYXRvciB8fCB0aGlzLmRlbm9taW5hdG9yLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZygyLCB0aGlzLm5vbWluYXRvciwgdGhpcy5kZW5vbWluYXRvciwgdGhpcy5icG0pO1xuXG4gICAgdGhpcy50cmFja3MgPSBbXTtcbiAgICB0aGlzLnBhcnRzID0gW107XG4gICAgdGhpcy5ub3RlcyA9IFtdO1xuICAgIHRoaXMuZXZlbnRzID0gW107Ly8uY29uY2F0KHRoaXMudGltZUV2ZW50cyk7XG4gICAgdGhpcy5hbGxFdmVudHMgPSBbXTsgLy8gYWxsIGV2ZW50cyBwbHVzIG1ldHJvbm9tZSB0aWNrc1xuXG4gICAgdGhpcy50cmFja3NCeUlkID0ge307XG4gICAgdGhpcy50cmFja3NCeU5hbWUgPSB7fTtcbiAgICB0aGlzLnBhcnRzQnlJZCA9IHt9O1xuICAgIHRoaXMubm90ZXNCeUlkID0ge307XG4gICAgdGhpcy5ldmVudHNCeUlkID0ge307XG5cbiAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IG51bGw7XG4gICAgdGhpcy5hY3RpdmVOb3RlcyA9IG51bGw7XG4gICAgdGhpcy5hY3RpdmVQYXJ0cyA9IG51bGw7XG5cbiAgICB0aGlzLnJlY29yZGVkTm90ZXMgPSBbXTtcbiAgICB0aGlzLnJlY29yZGVkRXZlbnRzID0gW107XG4gICAgdGhpcy5yZWNvcmRpbmdOb3RlcyA9IHt9OyAvLyBub3RlcyB0aGF0IGRvbid0IGhhdmUgdGhlaXIgbm90ZSBvZmYgZXZlbnRzIHlldFxuXG4gICAgdGhpcy5udW1UcmFja3MgPSAwO1xuICAgIHRoaXMubnVtUGFydHMgPSAwO1xuICAgIHRoaXMubnVtTm90ZXMgPSAwO1xuICAgIHRoaXMubnVtRXZlbnRzID0gMDtcbiAgICB0aGlzLmluc3RydW1lbnRzID0gW107XG5cbiAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnByZXJvbGxpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2U7XG4gICAgdGhpcy5wcmVyb2xsID0gdHJ1ZTtcbiAgICB0aGlzLnByZWNvdW50ID0gMDtcbiAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xuXG4gICAgdGhpcy5wbGF5aGVhZCA9IGNyZWF0ZVBsYXloZWFkKHRoaXMsIHRoaXMucG9zaXRpb25UeXBlLCB0aGlzLmlkLCB0aGlzKTsvLywgdGhpcy5wb3NpdGlvbik7XG4gICAgdGhpcy5wbGF5aGVhZFJlY29yZGluZyA9IGNyZWF0ZVBsYXloZWFkKHRoaXMsICdhbGwnLCB0aGlzLmlkICsgJ19yZWNvcmRpbmcnKTtcbiAgICB0aGlzLnNjaGVkdWxlciA9IGNyZWF0ZVNjaGVkdWxlcih0aGlzKTtcbiAgICB0aGlzLmZvbGxvd0V2ZW50ID0gY3JlYXRlRm9sbG93RXZlbnQodGhpcyk7XG5cbiAgICB0aGlzLnZvbHVtZSA9IDE7XG4gICAgdGhpcy5nYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUoKTtcbiAgICB0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZTtcbiAgICB0aGlzLm1ldHJvbm9tZSA9IGNyZWF0ZU1ldHJvbm9tZSh0aGlzLCBkaXNwYXRjaEV2ZW50KTtcbiAgICB0aGlzLmNvbm5lY3QoKTtcblxuXG4gICAgaWYoY29uZmlnLmNsYXNzTmFtZSA9PT0gJ01pZGlGaWxlJyAmJiBjb25maWcubG9hZGVkID09PSBmYWxzZSl7XG4gICAgICBpZihzZXF1ZW5jZXIuZGVidWcpe1xuICAgICAgICBjb25zb2xlLndhcm4oJ21pZGlmaWxlJywgY29uZmlnLm5hbWUsICdoYXMgbm90IHlldCBiZWVuIGxvYWRlZCEnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL2lmKGNvbmZpZy50cmFja3MgJiYgY29uZmlnLnRyYWNrcy5sZW5ndGggPiAwKXtcbiAgICBpZihjb25maWcudHJhY2tzKXtcbiAgICAgIHRoaXMuYWRkVHJhY2tzKGNvbmZpZy50cmFja3MpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5wYXJ0cyl7XG4gICAgICB0aGlzLmFkZFBhcnRzKGNvbmZpZy5wYXJ0cyk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLmV2ZW50cyl7XG4gICAgICB0aGlzLmFkZEV2ZW50cyhjb25maWcuZXZlbnRzKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcuZXZlbnRzIHx8IGNvbmZpZy5wYXJ0cyB8fCBjb25maWcudHJhY2tzKXtcbiAgICAgIC8vY29uc29sZS5sb2coY29uZmlnLmV2ZW50cywgY29uZmlnLnBhcnRzLCBjb25maWcudHJhY2tzKVxuICAgICAgLy8gdGhlIGxlbmd0aCBvZiB0aGUgc29uZyB3aWxsIGJlIGRldGVybWluZWQgYnkgdGhlIGV2ZW50cywgcGFydHMgYW5kL29yIHRyYWNrcyB0aGF0IGFyZSBhZGRlZCB0byB0aGUgc29uZ1xuICAgICAgaWYoY29uZmlnLmJhcnMgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHRoaXMubGFzdEJhciA9IDA7XG4gICAgICB9XG4gICAgICB0aGlzLmxhc3RFdmVudCA9IGNyZWF0ZU1pZGlFdmVudChbdGhpcy5sYXN0QmFyLCBzZXF1ZW5jZXIuRU5EX09GX1RSQUNLXSk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmxhc3RFdmVudCA9IGNyZWF0ZU1pZGlFdmVudChbdGhpcy5iYXJzICogdGhpcy50aWNrc1BlckJhciwgc2VxdWVuY2VyLkVORF9PRl9UUkFDS10pO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCd1cGRhdGUnKTtcbiAgICB0aGlzLnVwZGF0ZSh0cnVlKTtcblxuICAgIHRoaXMubnVtVGltZUV2ZW50cyA9IHRoaXMudGltZUV2ZW50cy5sZW5ndGg7XG4gICAgdGhpcy5wbGF5aGVhZC5zZXQoJ3RpY2tzJywgMCk7XG4gICAgdGhpcy5taWRpRXZlbnRMaXN0ZW5lcnMgPSB7fTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMudGltZUV2ZW50cyk7XG5cbiovXG4gIH1cblxuXG4gIHN0b3AoKXtcbiAgICBkaXNwYXRjaEV2ZW50KCdzdG9wJyk7XG4gIH1cblxuICBwbGF5KCl7XG4gICAgZGlzcGF0Y2hFdmVudCgncGxheScpO1xuICB9XG5cbiAgc2V0TWlkaUlucHV0KGlkLCBmbGFnID0gdHJ1ZSl7XG4gICAgc2V0TWlkaUlucHV0U29uZyh0aGlzLCBpZCwgZmxhZyk7XG4gIH1cblxuICBzZXRNaWRpT3V0cHV0KGlkLCBmbGFnID0gdHJ1ZSl7XG4gICAgc2V0TWlkaU91dHB1dFNvbmcodGhpcywgaWQsIGZsYWcpO1xuICB9XG5cbiAgYWRkTWlkaUV2ZW50TGlzdGVuZXIoLi4uYXJncyl7XG4gICAgYWRkTWlkaUV2ZW50TGlzdGVuZXIodGhpcywgLi4uYXJncyk7XG4gIH1cbn1cblxuU29uZy5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGFkZEV2ZW50TGlzdGVuZXI7XG5Tb25nLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblNvbmcucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVNvbmcoc2V0dGluZ3Mpe1xuICByZXR1cm4gbmV3IFNvbmcoc2V0dGluZ3MpO1xufSIsImxldCBsaXN0ZW5lcnMgPSB7fTtcblxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcihpZCwgY2FsbGJhY2spe1xuICBsaXN0ZW5lcnNbaWRdID0gY2FsbGJhY2s7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoaWQsIGNhbGxiYWNrKXtcbiAgZGVsZXRlIGxpc3RlbmVyc1tpZF07XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoaWQpe1xuICBmb3IobGV0IGtleSBpbiBsaXN0ZW5lcnMpe1xuICAgIGlmKGtleSA9PT0gaWQgJiYgbGlzdGVuZXJzLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgbGlzdGVuZXJzW2tleV0oaWQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQge2FkZEV2ZW50TGlzdGVuZXIgYXMgYWRkRXZlbnRMaXN0ZW5lcn07XG5leHBvcnQge3JlbW92ZUV2ZW50TGlzdGVuZXIgYXMgcmVtb3ZlRXZlbnRMaXN0ZW5lcn07XG5leHBvcnQge2Rpc3BhdGNoRXZlbnQgYXMgZGlzcGF0Y2hFdmVudH07IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2xvZywgaW5mbywgd2FybiwgZXJyb3IsIGJhc2U2NFRvQmluYXJ5LCBhamF4fSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHBhcnNlTUlESUZpbGUgZnJvbSAnLi9taWRpX3BhcnNlJztcbmltcG9ydCBjcmVhdGVNSURJRXZlbnQgZnJvbSAnLi9taWRpX2V2ZW50JztcbmltcG9ydCBjcmVhdGVQYXJ0IGZyb20gJy4vcGFydCc7XG5pbXBvcnQgY3JlYXRlVHJhY2sgZnJvbSAnLi90cmFjayc7XG5pbXBvcnQgY3JlYXRlU29uZyBmcm9tICcuL3NvbmcnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVNvbmdGcm9tTUlESUZpbGUoY29uZmlnKXtcbiAgbGV0IGJ1ZmZlcjtcblxuICBpZihjb25maWcuYXJyYXlidWZmZXIgIT09IHVuZGVmaW5lZCl7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY29uZmlnLmFycmF5YnVmZmVyKTtcbiAgICByZXR1cm4gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gIH1lbHNlIGlmKGNvbmZpZy5iYXNlNjQgIT09IHVuZGVmaW5lZCl7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9CaW5hcnkoY29uZmlnLmJhc2U2NCkpO1xuICAgIHJldHVybiB0b1NvbmcocGFyc2VNSURJRmlsZShidWZmZXIpKTtcbiAgfWVsc2UgaWYoY29uZmlnLnBhcnNlZCAhPT0gdW5kZWZpbmVkKXtcbiAgICByZXR1cm4gdG9Tb25nKGNvbmZpZy5wYXJzZWQpO1xuLypcbiAgfWVsc2UgaWYoY29uZmlnLnVybCAhPT0gdW5kZWZpbmVkKXtcbiAgICBhamF4KHt1cmw6IGNvbmZpZy51cmwsIHJlc3BvbnNlVHlwZTogJ2FycmF5YnVmZmVyJ30pLnRoZW4oXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChkYXRhKXtcbiAgICAgICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgICAgIHJldHVybiB0b1NvbmcocGFyc2VNSURJRmlsZShidWZmZXIpKTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKGUpe1xuICAgICAgICBlcnJvcihlKTtcbiAgICAgIH1cbiAgICApO1xuKi9cbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHRvU29uZyhwYXJzZWQpe1xuICBsZXQgdHJhY2tzID0gcGFyc2VkLnRyYWNrcztcbiAgbGV0IHBwcSA9IHBhcnNlZC5oZWFkZXIudGlja3NQZXJCZWF0O1xuICBsZXQgdGltZUV2ZW50cyA9IFtdO1xuICBsZXQgY29uZmlnID0ge1xuICAgIHRyYWNrczogW11cbiAgfTtcbiAgbGV0IGV2ZW50cztcblxuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcy52YWx1ZXMoKSl7XG4gICAgbGV0IGxhc3RUaWNrcywgbGFzdFR5cGU7XG4gICAgbGV0IHRpY2tzID0gMDtcbiAgICBsZXQgdHlwZTtcbiAgICBsZXQgY2hhbm5lbCA9IC0xO1xuICAgIGV2ZW50cyA9IFtdO1xuXG4gICAgZm9yKGxldCBldmVudCBvZiB0cmFjayl7XG4gICAgICB0aWNrcyArPSAoZXZlbnQuZGVsdGFUaW1lICogcHBxKTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuc3VidHlwZSwgZXZlbnQuZGVsdGFUaW1lLCB0bXBUaWNrcyk7XG5cbiAgICAgIGlmKGNoYW5uZWwgPT09IC0xICYmIGV2ZW50LmNoYW5uZWwgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIGNoYW5uZWwgPSBldmVudC5jaGFubmVsO1xuICAgICAgICB0cmFjay5jaGFubmVsID0gY2hhbm5lbDtcbiAgICAgIH1cbiAgICAgIHR5cGUgPSBldmVudC5zdWJ0eXBlO1xuXG4gICAgICBzd2l0Y2goZXZlbnQuc3VidHlwZSl7XG5cbiAgICAgICAgY2FzZSAndHJhY2tOYW1lJzpcbiAgICAgICAgICB0cmFjay5uYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCduYW1lJywgdHJhY2submFtZSwgbnVtVHJhY2tzKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdpbnN0cnVtZW50TmFtZSc6XG4gICAgICAgICAgaWYoZXZlbnQudGV4dCl7XG4gICAgICAgICAgICB0cmFjay5pbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgZXZlbnRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweDkwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPZmYnOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHg4MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdzZXRUZW1wbyc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGVtcG8gZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGxldCBicG0gPSA2MDAwMDAwMC9ldmVudC5taWNyb3NlY29uZHNQZXJCZWF0O1xuXG4gICAgICAgICAgaWYodGlja3MgPT09IGxhc3RUaWNrcyAmJiB0eXBlID09PSBsYXN0VHlwZSl7XG4gICAgICAgICAgICBpbmZvKCd0ZW1wbyBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCBicG0pO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihjb25maWcuYnBtID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgY29uZmlnLmJwbSA9IGJwbTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHg1MSwgYnBtKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZVNpZ25hdHVyZSc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGlmKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpe1xuICAgICAgICAgICAgaW5mbygndGltZSBzaWduYXR1cmUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2snLCB0aWNrcywgZXZlbnQubnVtZXJhdG9yLCBldmVudC5kZW5vbWluYXRvcik7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGNvbmZpZy5ub21pbmF0b3IgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBjb25maWcubm9taW5hdG9yID0gZXZlbnQubnVtZXJhdG9yO1xuICAgICAgICAgICAgY29uZmlnLmRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRpbWVFdmVudHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4NTgsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpKTtcbiAgICAgICAgICBicmVhaztcblxuXG4gICAgICAgIGNhc2UgJ2NvbnRyb2xsZXInOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHhCMCwgZXZlbnQuY29udHJvbGxlclR5cGUsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncHJvZ3JhbUNoYW5nZSc6XG4gICAgICAgICAgZXZlbnRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweEMwLCBldmVudC5wcm9ncmFtTnVtYmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncGl0Y2hCZW5kJzpcbiAgICAgICAgICBldmVudHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4RTAsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIGV2ZW50LnR5cGUpO1xuICAgICAgfVxuXG4gICAgICBsYXN0VHlwZSA9IHR5cGU7XG4gICAgICBsYXN0VGlja3MgPSB0aWNrcztcbiAgICB9XG5cbiAgICBpZihwYXJzZWQubGVuZ3RoID4gMCl7XG4gICAgICBsZXQgdHJhY2sgPSBjcmVhdGVUcmFjaygpO1xuICAgICAgbGV0IHBhcnQgPSBjcmVhdGVQYXJ0KCk7XG4gICAgICB0cmFjay5hZGRQYXJ0KHBhcnQpO1xuICAgICAgcGFydC5hZGRFdmVudHMocGFyc2VkKTtcbiAgICAgIGNvbmZpZy50cmFja3MucHVzaCh0cmFjayk7XG4gICAgfVxuICB9XG5cbiAgY29uZmlnLnBwcSA9IHBwcTtcbiAgY29uZmlnLnRpbWVFdmVudHMgPSB0aW1lRXZlbnRzO1xuICBsZXQgc29uZyA9IGNyZWF0ZVNvbmcoY29uZmlnKTtcbiAgc29uZy50aW1lRXZlbnRzID0gdGltZUV2ZW50cztcblxuICBzb25nLmV2ZW50c01pZGlBdWRpb01ldHJvbm9tZSA9IHBhcnNlZDtcblxuICAvL3JldHVybiBjcmVhdGVTb25nKGNvbmZpZyk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5sZXQgdHJhY2tJZCA9IDA7XG5cblxuY2xhc3MgVHJhY2t7XG5cbiAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgbGV0IGlkID0gJ1AnICsgdHJhY2tJZCsrICsgRGF0ZS5ub3coKTtcblxuICB9XG5cblxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVRyYWNrKCl7XG4gIHJldHVybiBuZXcgVHJhY2soLi4uYXJndW1lbnRzKTtcbn1cblxuXG4vKlxubGV0IFRyYWNrID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCBpZCA9ICdUJyArIHRyYWNrSWQrKyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lkJywge1xuICAgICAgICAgICAgdmFsdWU6IGlkXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVRyYWNrKCl7XG4gIHZhciB0ID0gT2JqZWN0LmNyZWF0ZShUcmFjayk7XG4gIHQuaW5pdChhcmd1bWVudHMpO1xuICByZXR1cm4gdDtcbn1cblxuKi8iLCIvKlxuICBBbiB1bm9yZ2FuaXNlZCBjb2xsZWN0aW9uIG9mIHZhcmlvdXMgdXRpbGl0eSBmdW5jdGlvbnMgdGhhdCBhcmUgdXNlZCBhY3Jvc3MgdGhlIGxpYnJhcnlcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGdldENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmxldFxuICBjb25zb2xlID0gd2luZG93LmNvbnNvbGUsXG4gIG1Qb3cgPSBNYXRoLnBvdyxcbiAgbVJvdW5kID0gTWF0aC5yb3VuZCxcbiAgbUZsb29yID0gTWF0aC5mbG9vcixcbiAgbVJhbmRvbSA9IE1hdGgucmFuZG9tLFxuICBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgLy8gY29udGV4dCA9IGNvbmZpZy5jb250ZXh0LFxuICAvLyBmbG9vciA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgLy8gIHJldHVybiB2YWx1ZSB8IDA7XG4gIC8vIH0sXG5cbmNvbnN0XG4gIG5vdGVMZW5ndGhOYW1lcyA9IHtcbiAgICAxOiAncXVhcnRlcicsXG4gICAgMjogJ2VpZ2h0aCcsXG4gICAgNDogJ3NpeHRlZW50aCcsXG4gICAgODogJzMydGgnLFxuICAgIDE2OiAnNjR0aCdcbiAgfTtcblxuXG5leHBvcnQgZnVuY3Rpb24gdHlwZVN0cmluZyhvKXtcbiAgaWYodHlwZW9mIG8gIT0gJ29iamVjdCcpe1xuICAgIHJldHVybiB0eXBlb2YgbztcbiAgfVxuXG4gIGlmKG8gPT09IG51bGwpe1xuICAgIHJldHVybiAnbnVsbCc7XG4gIH1cblxuICAvL29iamVjdCwgYXJyYXksIGZ1bmN0aW9uLCBkYXRlLCByZWdleHAsIHN0cmluZywgbnVtYmVyLCBib29sZWFuLCBlcnJvclxuICBsZXQgaW50ZXJuYWxDbGFzcyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5tYXRjaCgvXFxbb2JqZWN0XFxzKFxcdyspXFxdLylbMV07XG4gIHJldHVybiBpbnRlcm5hbENsYXNzLnRvTG93ZXJDYXNlKCk7XG59XG5cblxuXG5leHBvcnQgZnVuY3Rpb24gYWpheChjb25maWcpe1xuICBsZXRcbiAgICByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgbWV0aG9kID0gY29uZmlnLm1ldGhvZCA9PT0gdW5kZWZpbmVkID8gJ0dFVCcgOiBjb25maWcubWV0aG9kLFxuICAgIGZpbGVTaXplO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICByZWplY3QgPSByZWplY3QgfHwgZnVuY3Rpb24oKXt9O1xuICAgIHJlc29sdmUgPSByZXNvbHZlIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApe1xuICAgICAgICByZWplY3QocmVxdWVzdC5zdGF0dXMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgIGZpbGVTaXplID0gcmVxdWVzdC5yZXNwb25zZS5sZW5ndGg7XG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSwgZmlsZVNpemUpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIGNvbmZpZy5vbkVycm9yKGUpO1xuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBjb25maWcudXJsLCB0cnVlKTtcblxuICAgIGlmKGNvbmZpZy5vdmVycmlkZU1pbWVUeXBlKXtcbiAgICAgICAgcmVxdWVzdC5vdmVycmlkZU1pbWVUeXBlKGNvbmZpZy5vdmVycmlkZU1pbWVUeXBlKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcucmVzcG9uc2VUeXBlKXtcbiAgICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmKG1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5kYXRhKXtcbiAgICAgICAgcmVxdWVzdC5zZW5kKGNvbmZpZy5kYXRhKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cblxuXG5mdW5jdGlvbiBwYXJzZVNhbXBsZShzYW1wbGUsIGlkLCBldmVyeSl7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHRyeXtcbiAgICAgIGNvbmZpZy5jb250ZXh0LmRlY29kZUF1ZGlvRGF0YShzYW1wbGUsXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2VzcyhidWZmZXIpe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coaWQsIGJ1ZmZlcik7XG4gICAgICAgICAgaWYoaWQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXNvbHZlKHsnaWQnOiBpZCwgJ2J1ZmZlcic6IGJ1ZmZlcn0pO1xuICAgICAgICAgICAgaWYoZXZlcnkpe1xuICAgICAgICAgICAgICBldmVyeSh7J2lkJzogaWQsICdidWZmZXInOiBidWZmZXJ9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoYnVmZmVyKTtcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25FcnJvcihlKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpO1xuICAgICAgICAvL3JlamVjdChlKTsgLy8gZG9uJ3QgdXNlIHJlamVjdCBiZWNhdXNlIHdlIHVzZSB0aGlzIGFzIGEgbmVzdGVkIHByb21pc2UgYW5kIHdlIGRvbid0IHdhbnQgdGhlIHBhcmVudCBwcm9taXNlIHRvIHJlamVjdFxuICAgICAgICBpZihpZCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICByZXNvbHZlKHsnaWQnOiBpZCwgJ2J1ZmZlcic6IHVuZGVmaW5lZH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICAgIH1jYXRjaChlKXtcbiAgICAgIC8vY29uc29sZS5sb2coJ2Vycm9yIGRlY29kaW5nIGF1ZGlvZGF0YScsIGlkLCBlKTtcbiAgICAgIC8vcmVqZWN0KGUpO1xuICAgICAgaWYoaWQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogdW5kZWZpbmVkfSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cblxuZnVuY3Rpb24gbG9hZEFuZFBhcnNlU2FtcGxlKHVybCwgaWQsIGV2ZXJ5KXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG4gICAgYWpheCh7dXJsOiB1cmwsIHJlc3BvbnNlVHlwZTogJ2FycmF5YnVmZmVyJ30pLnRoZW4oXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChkYXRhKXtcbiAgICAgICAgcGFyc2VTYW1wbGUoZGF0YSwgaWQsIGV2ZXJ5KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25SZWplY3RlZCgpe1xuICAgICAgICBpZihpZCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICByZXNvbHZlKHsnaWQnOiBpZCwgJ2J1ZmZlcic6IHVuZGVmaW5lZH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9KTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGVzKG1hcHBpbmcsIGV2ZXJ5KXtcbiAgbGV0IGtleSwgc2FtcGxlLFxuICAgIHByb21pc2VzID0gW10sXG4gICAgdHlwZSA9IHR5cGVTdHJpbmcobWFwcGluZyk7XG5cbiAgZXZlcnkgPSB0eXBlU3RyaW5nKGV2ZXJ5KSA9PT0gJ2Z1bmN0aW9uJyA/IGV2ZXJ5IDogZmFsc2U7XG4gIC8vY29uc29sZS5sb2codHlwZSwgbWFwcGluZylcbiAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgIGZvcihrZXkgaW4gbWFwcGluZyl7XG4gICAgICBpZihtYXBwaW5nLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgICBzYW1wbGUgPSBtYXBwaW5nW2tleV07XG4gICAgICAgIGlmKHNhbXBsZS5pbmRleE9mKCdodHRwOi8vJykgPT09IC0xKXtcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHBhcnNlU2FtcGxlKGJhc2U2NFRvQmluYXJ5KHNhbXBsZSksIGtleSwgZXZlcnkpKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChsb2FkQW5kUGFyc2VTYW1wbGUoc2FtcGxlLCBrZXksIGV2ZXJ5KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgIG1hcHBpbmcuZm9yRWFjaChmdW5jdGlvbihzYW1wbGUpe1xuICAgICAgaWYoc2FtcGxlLmluZGV4T2YoJ2h0dHA6Ly8nKSA9PT0gLTEpe1xuICAgICAgICBwcm9taXNlcy5wdXNoKHBhcnNlU2FtcGxlKGJhc2U2NFRvQmluYXJ5KHNhbXBsZSksIGV2ZXJ5KSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcHJvbWlzZXMucHVzaChsb2FkQW5kUGFyc2VTYW1wbGUoc2FtcGxlLCBldmVyeSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZCh2YWx1ZXMpe1xuICAgICAgICBpZih0eXBlID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgbGV0IG1hcHBpbmcgPSB7fTtcbiAgICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IHZhbHVlLmJ1ZmZlcjtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKG1hcHBpbmcpO1xuICAgICAgICAgIHJlc29sdmUobWFwcGluZyk7XG4gICAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICAgIHJlc29sdmUodmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoZSl7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICApO1xuICB9KTtcbn1cblxuXG5cbi8vIGFkYXB0ZWQgdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vZGFuZ3Vlci9ibG9nLWV4YW1wbGVzL2Jsb2IvbWFzdGVyL2pzL2Jhc2U2NC1iaW5hcnkuanNcbmZ1bmN0aW9uIGJhc2U2NFRvQmluYXJ5KGlucHV0KXtcbiAgbGV0IGtleVN0ciA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPScsXG4gICAgYnl0ZXMsIHVhcnJheSwgYnVmZmVyLFxuICAgIGxrZXkxLCBsa2V5MixcbiAgICBjaHIxLCBjaHIyLCBjaHIzLFxuICAgIGVuYzEsIGVuYzIsIGVuYzMsIGVuYzQsXG4gICAgaSwgaiA9IDA7XG5cbiAgYnl0ZXMgPSBNYXRoLmNlaWwoKDMgKiBpbnB1dC5sZW5ndGgpIC8gNC4wKTtcbiAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVzKTtcbiAgdWFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuICBsa2V5MSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGgtMSkpO1xuICBsa2V5MiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGgtMSkpO1xuICBpZihsa2V5MSA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG4gIGlmKGxrZXkyID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcblxuICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXFw9XS9nLCAnJyk7XG5cbiAgZm9yKGkgPSAwOyBpIDwgYnl0ZXM7IGkgKz0gMykge1xuICAgIC8vZ2V0IHRoZSAzIG9jdGVjdHMgaW4gNCBhc2NpaSBjaGFyc1xuICAgIGVuYzEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMzID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzQgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cbiAgICBjaHIxID0gKGVuYzEgPDwgMikgfCAoZW5jMiA+PiA0KTtcbiAgICBjaHIyID0gKChlbmMyICYgMTUpIDw8IDQpIHwgKGVuYzMgPj4gMik7XG4gICAgY2hyMyA9ICgoZW5jMyAmIDMpIDw8IDYpIHwgZW5jNDtcblxuICAgIHVhcnJheVtpXSA9IGNocjE7XG4gICAgaWYoZW5jMyAhPSA2NCkgdWFycmF5W2krMV0gPSBjaHIyO1xuICAgIGlmKGVuYzQgIT0gNjQpIHVhcnJheVtpKzJdID0gY2hyMztcbiAgfVxuICAvL2NvbnNvbGUubG9nKGJ1ZmZlcik7XG4gIHJldHVybiBidWZmZXI7XG59XG5cblxuXG5leHBvcnQgZnVuY3Rpb24gZXJyb3IoKXtcbiAgaWYoY29uZmlnLmdldCgnZGVidWdMZXZlbCcpID49IDEpe1xuICAgIGNvbnNvbGUuZXJyb3IoLi4uYXJndW1lbnRzKTtcbiAgICAvL2NvbnNvbGUudHJhY2UoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2Fybigpe1xuICBpZihjb25maWcuZ2V0KCdkZWJ1Z0xldmVsJykgPj0gMil7XG4gICAgLy9jb25zb2xlLndhcm4oLi4uYXJndW1lbnRzKTtcbiAgICBjb25zb2xlLnRyYWNlKCdXQVJOSU5HJywgLi4uYXJndW1lbnRzKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5mbygpe1xuICBpZihjb25maWcuZ2V0KCdkZWJ1Z0xldmVsJykgPj0gMyl7XG4gICAgLy9jb25zb2xlLmluZm8oLi4uYXJndW1lbnRzKTtcbiAgICBjb25zb2xlLnRyYWNlKCdJTkZPJywgLi4uYXJndW1lbnRzKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9nKCl7XG4gIGlmKGNvbmZpZy5nZXQoJ2RlYnVnTGV2ZWwnKSA+PSA0KXtcbiAgICAvL2NvbnNvbGUubG9nKC4uLmFyZ3VtZW50cyk7XG4gICAgY29uc29sZS50cmFjZSgnTE9HJywgLi4uYXJndW1lbnRzKTtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROaWNlVGltZShtaWxsaXMpe1xuICBsZXQgaCwgbSwgcywgbXMsXG4gICAgICBzZWNvbmRzLFxuICAgICAgdGltZUFzU3RyaW5nID0gJyc7XG5cbiAgc2Vjb25kcyA9IG1pbGxpcy8xMDAwOyAvLyDihpIgbWlsbGlzIHRvIHNlY29uZHNcbiAgaCA9IG1GbG9vcihzZWNvbmRzIC8gKDYwICogNjApKTtcbiAgbSA9IG1GbG9vcigoc2Vjb25kcyAlICg2MCAqIDYwKSkgLyA2MCk7XG4gIHMgPSBtRmxvb3Ioc2Vjb25kcyAlICg2MCkpO1xuICBtcyA9IG1Sb3VuZCgoc2Vjb25kcyAtIChoICogMzYwMCkgLSAobSAqIDYwKSAtIHMpICogMTAwMCk7XG5cbiAgdGltZUFzU3RyaW5nICs9IGggKyAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtIDwgMTAgPyAnMCcgKyBtIDogbTtcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IHMgPCAxMCA/ICcwJyArIHMgOiBzO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbXMgPT09IDAgPyAnMDAwJyA6IG1zIDwgMTAgPyAnMDAnICsgbXMgOiBtcyA8IDEwMCA/ICcwJyArIG1zIDogbXM7XG5cbiAgLy9jb25zb2xlLmxvZyhoLCBtLCBzLCBtcyk7XG4gIHJldHVybiB7XG4gICAgICBob3VyOiBoLFxuICAgICAgbWludXRlOiBtLFxuICAgICAgc2Vjb25kOiBzLFxuICAgICAgbWlsbGlzZWNvbmQ6IG1zLFxuICAgICAgdGltZUFzU3RyaW5nOiB0aW1lQXNTdHJpbmcsXG4gICAgICB0aW1lQXNBcnJheTogW2gsIG0sIHMsIG1zXVxuICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2FqYXh9IGZyb20gJy4uL3NyYy91dGlsJztcbmltcG9ydCBwYXJzZU1JRElGaWxlIGZyb20gJy4uL3NyYy9taWRpX3BhcnNlJztcbmltcG9ydCBjcmVhdGVTb25nRnJvbU1JRElGaWxlIGZyb20gJy4uL3NyYy9zb25nX2Zyb21fbWlkaWZpbGUnO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4vKlxuICBhamF4KHt1cmw6Jy4uL2RhdGEvSk4tMy00NC5taWQnLCByZXNwb25zZVR5cGU6ICdhcnJheWJ1ZmZlcid9KS50aGVuKFxuICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGRhdGEpe1xuICAgICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgIGxldCByZXN1bHQgPSBwYXJzZU1JRElGaWxlKGRhdGEpO1xuICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gb25SZWplY3RlZChlKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICApO1xuKi9cblxuXG4gIGFqYXgoe3VybDonLi4vZGF0YS9KTi0zLTQ0Lm1pZCcsIHJlc3BvbnNlVHlwZTogJ2FycmF5YnVmZmVyJ30pLnRoZW4oXG4gICAgZnVuY3Rpb24gb25GdWxmaWxsZWQoZGF0YSl7XG4gICAgICAvL2NvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgbGV0IHNvbmcgPSBjcmVhdGVTb25nRnJvbU1JRElGaWxlKHthcnJheWJ1ZmZlcjpkYXRhfSk7XG4gICAgICBjb25zb2xlLmxvZyhzb25nKTtcbiAgICB9LFxuXG4gICAgZnVuY3Rpb24gb25SZWplY3RlZChlKXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfVxuICApO1xufTsiXX0=
