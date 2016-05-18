(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _qambi = require('qambi');

var _qambi2 = _interopRequireDefault(_qambi);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {

  var song = void 0;

  _qambi2.default.init().then(function () {

    var test = 1;

    if (test === 1) {

      //console.time('song')
      //fetch('../data/mozk545a.mid')
      (0, _isomorphicFetch2.default)('../data/minute_waltz.mid').then(function (response) {
        return response.arrayBuffer();
      }).then(function (data) {
        song = _qambi.Song.fromMIDIFile(data);
        initUI();
        //console.timeEnd('song')
      });
    } else if (test === 2) {

        //console.time('song')
        _qambi.Song.fromMIDIFileAsync('../data/minute_waltz.mid').then(function (s) {
          song = s;
          //console.timeEnd('song')
          initUI();
        }, function (e) {
          return console.log(e);
        });
      }
  });

  function initUI() {

    song.getTracks().forEach(function (track) {
      track.setInstrument(new _qambi.Instrument());
    });

    var btnPlay = document.getElementById('play');
    var btnPause = document.getElementById('pause');
    var btnStop = document.getElementById('stop');
    var btnLoop = document.getElementById('loop');
    var btnDelete = document.getElementById('delete');
    var divTempo = document.getElementById('tempo');
    var divSustain = document.getElementById('sustain');
    var divSustain2 = document.getElementById('sustain2');
    var divSustain3 = document.getElementById('sustain3');
    var divPosition = document.getElementById('position');
    var divPositionTime = document.getElementById('position_time');
    var rangePosition = document.getElementById('playhead');
    var userInteraction = false;

    btnPlay.disabled = false;
    btnPause.disabled = false;
    btnStop.disabled = false;
    btnLoop.disabled = false;
    btnDelete.disabled = false;

    btnPlay.addEventListener('click', function () {
      //song.play('barsbeats', 4, 1, 1, 0)
      //song.play('time', 0, 0, 15) // play from 15 seconds
      //song.play('millis', 34000) // play from 34 seconds
      song.play();
    });

    btnPause.addEventListener('click', function () {
      song.pause();
    });

    btnStop.addEventListener('click', function () {
      song.stop();
    });

    btnLoop.addEventListener('click', function () {
      var loop = song.setLoop();
      console.log(loop);
      btnLoop.innerHTML = loop ? 'stop loop' : 'start loop';
    });

    var memoryLeak = void 0;

    btnDelete.addEventListener('click', function () {
      memoryLeak = song.getEvents()[0];
      //song.dispose()
      song = null;
      console.log(memoryLeak); // -> this event retains the whole song!
      setTimeout(function () {
        memoryLeak = null;
        console.log('memory cleared');
      }, 5000);
    });

    // song.addEventListener(MIDIEventTypes.TEMPO, event => {
    //   divTempo.innerHTML = `tempo: ${event.bpm} bpm`
    // })

    song.addEventListener('sustainpedal', function (event) {
      divSustain.innerHTML = 'sustainpedal ' + event.data;
    });

    song.addEventListener('sustainpedal2', function (event) {
      divSustain2.innerHTML = 'sustainpedal2 ' + event.data;
    });

    song.addEventListener(_qambi.MIDIEventTypes.CONTROL_CHANGE, function (event) {
      if (event.data1 !== 64) {
        return;
      }
      if (event.data2 === 127) {
        divSustain3.innerHTML = 'sustainpedal3 down';
      } else if (event.data2 === 0) {
        divSustain3.innerHTML = 'sustainpedal3 up';
      }
    });

    song.addEventListener('noteOn', function (event) {
      var note = event.data;
      //console.log('noteOn', note.id, note.noteOn.id, note.noteOn.data1, note.noteOn.ticks)
    });

    song.addEventListener('noteOff', function (event) {
      var note = event.data;
      //console.log('noteOff', note.id, note.noteOff.id, note.noteOff.data1, note.noteOff.ticks)
    });

    song.addEventListener('play', function (event) {
      console.log('started playing at position:', event.data);
    });

    song.addEventListener('stop', function () {
      console.log('stop');
      rangePosition.value = 0;
    });

    song.addEventListener('pause', function (event) {
      console.log('paused:', event.data);
      //console.log(song.getPosition())
    });

    var position = song.getPosition();
    divPosition.innerHTML = position.barsAsString;
    divPositionTime.innerHTML = position.timeAsString;
    divTempo.innerHTML = 'tempo: ' + position.bpm + ' bpm';

    song.addEventListener('position', function (event) {
      divPosition.innerHTML = event.data.barsAsString;
      divPositionTime.innerHTML = event.data.timeAsString;
      divTempo.innerHTML = 'tempo: ' + event.data.bpm + ' bpm';
      if (!userInteraction) {
        rangePosition.value = event.data.percentage;
      }
    });

    rangePosition.addEventListener('mouseup', function (e) {
      rangePosition.removeEventListener('mousemove', rangeListener);
      userInteraction = false;
    });

    rangePosition.addEventListener('mousedown', function (e) {
      setTimeout(function () {
        song.setPosition('percentage', e.target.valueAsNumber);
      }, 0);
      rangePosition.addEventListener('mousemove', rangeListener);
      userInteraction = true;
    });

    var rangeListener = function rangeListener(e) {
      song.setPosition('percentage', e.target.valueAsNumber);
    };

    song.setPosition('barsbeats', 2);
    song.setLeftLocator('barsbeats', 2);
    song.setRightLocator('barsbeats', 3, 2);
    song.setLoop();

    //console.log(song.getPosition())
  }
}); // use this for deployment
//} from '../../src/qambi'

},{"isomorphic-fetch":2,"qambi":21}],2:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":30}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

// standard MIDI events
var MIDIEventTypes = {};

Object.defineProperty(MIDIEventTypes, 'NOTE_OFF', { value: 0x80 }); //128
Object.defineProperty(MIDIEventTypes, 'NOTE_ON', { value: 0x90 }); //144
Object.defineProperty(MIDIEventTypes, 'POLY_PRESSURE', { value: 0xA0 }); //160
Object.defineProperty(MIDIEventTypes, 'CONTROL_CHANGE', { value: 0xB0 }); //176
Object.defineProperty(MIDIEventTypes, 'PROGRAM_CHANGE', { value: 0xC0 }); //192
Object.defineProperty(MIDIEventTypes, 'CHANNEL_PRESSURE', { value: 0xD0 }); //208
Object.defineProperty(MIDIEventTypes, 'PITCH_BEND', { value: 0xE0 }); //224
Object.defineProperty(MIDIEventTypes, 'SYSTEM_EXCLUSIVE', { value: 0xF0 }); //240
Object.defineProperty(MIDIEventTypes, 'MIDI_TIMECODE', { value: 241 });
Object.defineProperty(MIDIEventTypes, 'SONG_POSITION', { value: 242 });
Object.defineProperty(MIDIEventTypes, 'SONG_SELECT', { value: 243 });
Object.defineProperty(MIDIEventTypes, 'TUNE_REQUEST', { value: 246 });
Object.defineProperty(MIDIEventTypes, 'EOX', { value: 247 });
Object.defineProperty(MIDIEventTypes, 'TIMING_CLOCK', { value: 248 });
Object.defineProperty(MIDIEventTypes, 'START', { value: 250 });
Object.defineProperty(MIDIEventTypes, 'CONTINUE', { value: 251 });
Object.defineProperty(MIDIEventTypes, 'STOP', { value: 252 });
Object.defineProperty(MIDIEventTypes, 'ACTIVE_SENSING', { value: 254 });
Object.defineProperty(MIDIEventTypes, 'SYSTEM_RESET', { value: 255 });

Object.defineProperty(MIDIEventTypes, 'TEMPO', { value: 0x51 });
Object.defineProperty(MIDIEventTypes, 'TIME_SIGNATURE', { value: 0x58 });
Object.defineProperty(MIDIEventTypes, 'END_OF_TRACK', { value: 0x2F });

exports.MIDIEventTypes = MIDIEventTypes;
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.dispatchEvent = dispatchEvent;
exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
var eventListeners = new Map();

function dispatchEvent(event) {
  //console.log(event.type)
  var map = void 0;

  if (event.type === 'event') {
    var midiEvent = event.data;
    var midiEventType = midiEvent.type;
    //console.log(midiEventType)
    if (eventListeners.has(midiEventType)) {
      map = eventListeners.get(midiEventType);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = map.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var cb = _step.value;

          cb(midiEvent);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }

  if (eventListeners.has(event.type) === false) {
    return;
  }

  map = eventListeners.get(event.type);
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = map.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _cb = _step2.value;

      _cb(event);
    }

    // @todo: run filters here, for instance if an eventlistener has been added to all NOTE_ON events, check the type of the incoming event
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

function addEventListener(type, callback) {

  var map = void 0;
  var id = type + '_' + new Date().getTime();

  if (eventListeners.has(type) === false) {
    map = new Map();
    eventListeners.set(type, map);
  } else {
    map = eventListeners.get(type);
  }

  map.set(id, callback);
  //console.log(eventListeners)
  return id;
}

function removeEventListener(type, id) {

  if (eventListeners.has(type) === false) {
    console.log('no eventlisteners of type' + type);
    return;
  }

  var map = eventListeners.get(type);

  if (typeof id === 'function') {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = map.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _step3$value = _slicedToArray(_step3.value, 2);

        var key = _step3$value[0];
        var value = _step3$value[1];

        console.log(key, value);
        if (value === id) {
          console.log(key);
          id = key;
          break;
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    if (typeof id === 'string') {
      map.delete(id);
    }
  } else if (typeof id === 'string') {
    map.delete(id);
  } else {
    console.log('could not remove eventlistener');
  }
}
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.status = status;
exports.json = json;
exports.arrayBuffer = arrayBuffer;
// fetch helpers

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  return Promise.reject(new Error(response.statusText));
}

function json(response) {
  return response.json();
}

function arrayBuffer(response) {
  return response.arrayBuffer();
}
},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Blob = exports.requestAnimationFrame = exports.getUserMedia = undefined;
exports.init = init;

var _init_audio = require('./init_audio');

var _init_midi = require('./init_midi');

var getUserMedia = exports.getUserMedia = function () {
  if (typeof navigator !== 'undefined') {
    return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  }
  return function () {
    console.warn('getUserMedia is not available');
  };
}();

var requestAnimationFrame = exports.requestAnimationFrame = function () {
  if (typeof navigator !== 'undefined') {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  }
  return function () {
    console.warn('requestAnimationFrame is not available');
  };
}();

var Blob = exports.Blob = function () {
  if (typeof navigator !== 'undefined') {
    return window.Blob || window.webkitBlob;
  }
  return function () {
    console.warn('Blob is not available');
  };
}();

//export function init(settings = {}): void{
function init(callback) {

  // load settings.instruments (array or object)
  // load settings.midifiles (array or object)
  /*
     qambi.init({
      instruments: ['../instruments/piano', '../instruments/violin'],
      midifiles: ['../midi/mozart.mid']
    })
    .then((loaded) => {
      let [piano, violin] = loaded.instruments
      let [mozart] = loaded.midifiles
    })
   */

  return new Promise(function (resolve, reject) {

    Promise.all([(0, _init_audio.initAudio)(), (0, _init_midi.initMIDI)()]).then(function (data) {
      // parseAudio
      var dataAudio = data[0];

      // parseMIDI
      var dataMidi = data[1];

      resolve({
        legacy: dataAudio.legacy,
        mp3: dataAudio.mp3,
        ogg: dataAudio.ogg,
        midi: dataMidi.midi,
        webmidi: dataMidi.webmidi
      });
    }, function (error) {
      reject(error);
    });
  });

  /*
    Promise.all([initAudio(), initMIDI()])
    .then(
    (data) => {
      // parseAudio
      let dataAudio = data[0]
  
      // parseMIDI
      let dataMidi = data[1]
  
      callback({
        legacy: dataAudio.legacy,
        mp3: dataAudio.mp3,
        ogg: dataAudio.ogg,
        midi: dataMidi.midi,
        webmidi: dataMidi.webmidi,
      })
    },
    (error) => {
      callback(error)
    })
  */
}
},{"./init_audio":7,"./init_midi":8}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureMasterCompressor = exports.enableMasterCompressor = exports.getCompressionReduction = exports.getMasterVolume = exports.setMasterVolume = exports.masterCompressor = exports.masterGain = exports.context = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*
                                                                                                                                                                                                                                                    Sets up the basic audio routing, tests which audio formats are supported and parses the samples for the metronome ticks.
                                                                                                                                                                                                                                                  */

exports.initAudio = initAudio;
exports.getInitData = getInitData;

var _samples = require('./samples');

var _samples2 = _interopRequireDefault(_samples);

var _parse_audio = require('./parse_audio');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var masterGain = void 0,
    compressor = void 0,
    initialized = false,
    data = void 0;

var context = exports.context = function () {
  console.log('init AudioContext');
  var ctx = void 0;
  if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext !== 'undefined') {
      ctx = new AudioContext();
    }
  }
  if (typeof ctx === 'undefined') {
    //@TODO: create dummy AudioContext for use in node, see: https://www.npmjs.com/package/audio-context
    exports.context = context = {
      createGain: function createGain() {
        return {
          gain: 1
        };
      },
      createOscillator: function createOscillator() {}
    };
  }
  return ctx;
}();

function initAudio() {

  if (typeof context.createGainNode === 'undefined') {
    context.createGainNode = context.createGain;
  }
  // check for older implementations of WebAudio
  data = {};
  var source = context.createBufferSource();
  data.legacy = false;
  if (typeof source.start === 'undefined') {
    data.legacy = true;
  }

  // set up the elementary audio nodes
  exports.masterCompressor = compressor = context.createDynamicsCompressor();
  compressor.connect(context.destination);
  exports.masterGain = masterGain = context.createGainNode();
  masterGain.connect(context.destination);
  masterGain.gain.value = 0.5;
  initialized = true;

  return new Promise(function (resolve, reject) {

    (0, _parse_audio.parseSamples)(_samples2.default).then(function onFulfilled(buffers) {
      //console.log(buffers)
      data.ogg = typeof buffers.emptyOgg !== 'undefined';
      data.mp3 = typeof buffers.emptyMp3 !== 'undefined';
      data.lowtick = buffers.lowtick;
      data.hightick = buffers.hightick;
      if (data.ogg === false && data.mp3 === false) {
        reject('No support for ogg nor mp3!');
      } else {
        resolve(data);
      }
    }, function onRejected() {
      reject('Something went wrong while initializing Audio');
    });
  });
}

var _setMasterVolume = function setMasterVolume() {
  var value = arguments.length <= 0 || arguments[0] === undefined ? 0.5 : arguments[0];

  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.setMasterVolume = _setMasterVolume = function setMasterVolume() {
      var value = arguments.length <= 0 || arguments[0] === undefined ? 0.5 : arguments[0];

      if (value > 1) {
        console.info('maximal volume is 1.0, volume is set to 1.0');
      }
      value = value < 0 ? 0 : value > 1 ? 1 : value;
      masterGain.gain.value = value;
    };
    _setMasterVolume(value);
  }
};

var _getMasterVolume = function getMasterVolume() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMasterVolume = _getMasterVolume = function getMasterVolume() {
      return masterGain.gain.value;
    };
    return _getMasterVolume();
  }
};

var _getCompressionReduction = function getCompressionReduction() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getCompressionReduction = _getCompressionReduction = function getCompressionReduction() {
      return compressor.reduction.value;
    };
    return _getCompressionReduction();
  }
};

var _enableMasterCompressor = function enableMasterCompressor() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.enableMasterCompressor = _enableMasterCompressor = function enableMasterCompressor(flag) {
      if (flag) {
        masterGain.disconnect(0);
        masterGain.connect(compressor);
        compressor.disconnect(0);
        compressor.connect(context.destination);
      } else {
        compressor.disconnect(0);
        masterGain.disconnect(0);
        masterGain.connect(context.destination);
      }
    };
    _enableMasterCompressor();
  }
};

var _configureMasterCompressor = function configureMasterCompressor(cfg) {
  /*
    readonly attribute AudioParam attack; // in Seconds
    readonly attribute AudioParam knee; // in Decibels
    readonly attribute AudioParam ratio; // unit-less
    readonly attribute AudioParam reduction; // in Decibels
    readonly attribute AudioParam release; // in Seconds
    readonly attribute AudioParam threshold; // in Decibels
     @see: http://webaudio.github.io/web-audio-api/#the-dynamicscompressornode-interface
  */
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.configureMasterCompressor = _configureMasterCompressor = function configureMasterCompressor(cfg) {
      var _cfg$attack = cfg.attack;
      compressor.attack = _cfg$attack === undefined ? 0.003 : _cfg$attack;
      var _cfg$knee = cfg.knee;
      compressor.knee = _cfg$knee === undefined ? 30 : _cfg$knee;
      var _cfg$ratio = cfg.ratio;
      compressor.ratio = _cfg$ratio === undefined ? 12 : _cfg$ratio;
      var _cfg$reduction = cfg.reduction;
      compressor.reduction = _cfg$reduction === undefined ? 0 : _cfg$reduction;
      var _cfg$release = cfg.release;
      compressor.release = _cfg$release === undefined ? 0.250 : _cfg$release;
      var _cfg$threshold = cfg.threshold;
      compressor.threshold = _cfg$threshold === undefined ? -24 : _cfg$threshold;
    };
    _configureMasterCompressor(cfg);
  }
};

function getInitData() {
  return data;
}

exports.masterGain = masterGain;
exports.masterCompressor = compressor;
exports.setMasterVolume = _setMasterVolume;
exports.getMasterVolume = _getMasterVolume;
exports.getCompressionReduction = _getCompressionReduction;
exports.enableMasterCompressor = _enableMasterCompressor;
exports.configureMasterCompressor = _configureMasterCompressor;
},{"./parse_audio":16,"./samples":23}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMIDIInputById = exports.getMIDIOutputById = exports.getMIDIInputIds = exports.getMIDIOutputIds = exports.getMIDIInputs = exports.getMIDIOutputs = exports.getMIDIAccess = undefined;
exports.initMIDI = initMIDI;

var _util = require('./util');

var MIDIAccess = void 0; /*
                           Requests MIDI access, queries all inputs and outputs and stores them in alphabetical order
                         */

var initialized = false;
var inputs = [];
var outputs = [];
var inputIds = [];
var outputIds = [];
var inputsById = new Map();
var outputsById = new Map();

var songMidiEventListener = void 0;
var midiEventListenerId = 0;

function getMIDIports() {
  inputs = Array.from(MIDIAccess.inputs.values());

  //sort ports by name ascending
  inputs.sort(function (a, b) {
    return a.name.toLowerCase() <= b.name.toLowerCase() ? 1 : -1;
  });

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = inputs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var port = _step.value;

      inputsById.set(port.id, port);
      inputIds.push(port.id);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  outputs = Array.from(MIDIAccess.outputs.values());

  //sort ports by name ascending
  outputs.sort(function (a, b) {
    return a.name.toLowerCase() <= b.name.toLowerCase() ? 1 : -1;
  });

  //console.log(outputs)
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = outputs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _port = _step2.value;

      //console.log(port.id, port.name)
      outputsById.set(_port.id, _port);
      outputIds.push(_port.id);
    }
    //console.log(outputsById)
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

function initMIDI() {

  return new Promise(function executor(resolve, reject) {

    if (typeof navigator === 'undefined') {
      initialized = true;
      resolve({ midi: false });
    } else if (typeof navigator.requestMIDIAccess !== 'undefined') {
      (function () {

        var jazz = void 0,
            midi = void 0,
            webmidi = void 0;

        navigator.requestMIDIAccess().then(function onFulFilled(midiAccess) {
          MIDIAccess = midiAccess;
          if (typeof midiAccess._jazzInstances !== 'undefined') {
            jazz = midiAccess._jazzInstances[0]._Jazz.version;
            midi = true;
          } else {
            webmidi = true;
            midi = true;
          }

          getMIDIports();

          // onconnect and ondisconnect are not yet implemented in Chrome and Chromium
          midiAccess.onconnect = function (e) {
            console.log('device connected', e);
            getMIDIports();
          };

          midiAccess.ondisconnect = function (e) {
            console.log('device disconnected', e);
            getMIDIports();
          };

          initialized = true;
          resolve({
            jazz: jazz,
            midi: midi,
            webmidi: webmidi,
            inputs: inputs,
            outputs: outputs,
            inputsById: inputsById,
            outputsById: outputsById
          });
        }, function onReject(e) {
          //console.log(e)
          reject('Something went wrong while requesting MIDIAccess', e);
        });
        // browsers without WebMIDI API
      })();
    } else {
        initialized = true;
        resolve({ midi: false });
      }
  });
}

var _getMIDIAccess = function getMIDIAccess() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIAccess = _getMIDIAccess = function getMIDIAccess() {
      return MIDIAccess;
    };
    return _getMIDIAccess();
  }
  return false;
};

exports.getMIDIAccess = _getMIDIAccess;
var _getMIDIOutputs = function getMIDIOutputs() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIOutputs = _getMIDIOutputs = function getMIDIOutputs() {
      return outputs;
    };
    return _getMIDIOutputs();
  }
  return false;
};

exports.getMIDIOutputs = _getMIDIOutputs;
var _getMIDIInputs = function getMIDIInputs() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIInputs = _getMIDIInputs = function getMIDIInputs() {
      return inputs;
    };
    return _getMIDIInputs();
  }
  return false;
};

exports.getMIDIInputs = _getMIDIInputs;
var _getMIDIOutputIds = function getMIDIOutputIds() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIOutputIds = _getMIDIOutputIds = function getMIDIOutputIds() {
      return outputIds;
    };
    return _getMIDIOutputIds();
  }
  return false;
};

exports.getMIDIOutputIds = _getMIDIOutputIds;
var _getMIDIInputIds = function getMIDIInputIds() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIInputIds = _getMIDIInputIds = function getMIDIInputIds() {
      return inputIds;
    };
    return _getMIDIInputIds();
  }
  return false;
};

exports.getMIDIInputIds = _getMIDIInputIds;
var _getMIDIOutputById = function getMIDIOutputById(id) {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIOutputById = _getMIDIOutputById = function getMIDIOutputById(_id) {
      return outputsById.get(_id);
    };
    return _getMIDIOutputById(id);
  }
  return false;
};

exports.getMIDIOutputById = _getMIDIOutputById;
var _getMIDIInputById = function getMIDIInputById(id) {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIInputById = _getMIDIInputById = function getMIDIInputById(_id) {
      return inputsById.get(_id);
    };
    return _getMIDIInputById(id);
  }
  return false;
};

/*
export function initMidiSong(song){

  songMidiEventListener = function(e){
    //console.log(e)
    handleMidiMessageSong(song, e, this);
  };

  // by default a song listens to all available midi-in ports
  inputs.forEach(function(port){
    port.addEventListener('midimessage', songMidiEventListener);
    song.midiInputs.set(port.id, port);
  });

  outputs.forEach(function(port){
    song.midiOutputs.set(port.id, port);
  });
}


export function setMidiInputSong(song, id, flag){
  let input = inputs.get(id);

  if(input === undefined){
    warn('no midi input with id', id, 'found');
    return;
  }

  if(flag === false){
    song.midiInputs.delete(id);
    input.removeEventListener('midimessage', songMidiEventListener);
  }else{
    song.midiInputs.set(id, input);
    input.addEventListener('midimessage', songMidiEventListener);
  }

  let tracks = song.tracks;
  for(let track of tracks){
    track.setMidiInput(id, flag);
  }
}


export function setMidiOutputSong(song, id, flag){
  let output = outputs.get(id);

  if(output === undefined){
    warn('no midi output with id', id, 'found');
    return;
  }

  if(flag === false){
    song.midiOutputs.delete(id);
    let time = song.scheduler.lastEventTime + 100;
    output.send([0xB0, 0x7B, 0x00], time); // stop all notes
    output.send([0xB0, 0x79, 0x00], time); // reset all controllers
  }else{
    song.midiOutputs.set(id, output);
  }

  let tracks = song.tracks;
  for(let track of tracks){
    track.setMidiOutput(id, flag);
  }
}


function handleMidiMessageSong(song, midiMessageEvent, input){
  let midiEvent = new MidiEvent(song.ticks, ...midiMessageEvent.data);

  //console.log(midiMessageEvent.data);

  let tracks = song.tracks;
  for(let track of tracks){
    //console.log(track.midiInputs, input);


    //if(midiEvent.channel === track.channel || track.channel === 0 || track.channel === 'any'){
    //  handleMidiMessageTrack(midiEvent, track);
    //}


    // like in Cubase, midi events from all devices, sent on any midi channel are forwarded to all tracks
    // set track.monitor to false if you don't want to receive midi events on a certain track
    // note that track.monitor is by default set to false and that track.monitor is automatically set to true
    // if you are recording on that track
    //console.log(track.monitor, track.id, input.id);
    if(track.monitor === true && track.midiInputs.get(input.id) !== undefined){
      handleMidiMessageTrack(midiEvent, track, input);
    }
  }

  let listeners = song.midiEventListeners.get(midiEvent.type);
  if(listeners !== undefined){
    for(let listener of listeners){
      listener(midiEvent, input);
    }
  }
}


function handleMidiMessageTrack(track, midiEvent, input){
  let song = track.song,
    note, listeners, channel;
    //data = midiMessageEvent.data,
    //midiEvent = createMidiEvent(song.ticks, data[0], data[1], data[2]);

  //midiEvent.source = midiMessageEvent.srcElement.name;
  //console.log(midiMessageEvent)
  //console.log('---->', midiEvent.type);

  // add the exact time of this event so we can calculate its ticks position
  midiEvent.recordMillis = context.currentTime * 1000; // millis
  midiEvent.state = 'recorded';

  if(midiEvent.type === 144){
    note = createMidiNote(midiEvent);
    track.recordingNotes[midiEvent.data1] = note;
    //track.song.recordingNotes[note.id] = note;
  }else if(midiEvent.type === 128){
    note = track.recordingNotes[midiEvent.data1];
    // check if the note exists: if the user plays notes on her keyboard before the midi system has
    // been fully initialized, it can happen that the first incoming midi event is a NOTE OFF event
    if(note === undefined){
      return;
    }
    note.addNoteOff(midiEvent);
    delete track.recordingNotes[midiEvent.data1];
    //delete track.song.recordingNotes[note.id];
  }

  //console.log(song.preroll, song.recording, track.recordEnabled);

  if((song.prerolling || song.recording) && track.recordEnabled === 'midi'){
    if(midiEvent.type === 144){
      track.song.recordedNotes.push(note);
    }
    track.recordPart.addEvent(midiEvent);
    // song.recordedEvents is used in the key editor
    track.song.recordedEvents.push(midiEvent);
  }else if(track.enableRetrospectiveRecording){
    track.retrospectiveRecording.push(midiEvent);
  }

  // call all midi event listeners
  listeners = track.midiEventListeners[midiEvent.type];
  if(listeners !== undefined){
    objectForEach(listeners, function(listener){
      listener(midiEvent, input);
    });
  }

  channel = track.channel;
  if(channel === 'any' || channel === undefined || isNaN(channel) === true){
    channel = 0;
  }

  objectForEach(track.midiOutputs, function(output){
    //console.log('midi out', output, midiEvent.type);
    if(midiEvent.type === 128 || midiEvent.type === 144 || midiEvent.type === 176){
      //console.log(midiEvent.type, midiEvent.data1, midiEvent.data2);
      output.send([midiEvent.type, midiEvent.data1, midiEvent.data2]);
    // }else if(midiEvent.type === 192){
    //     output.send([midiEvent.type + channel, midiEvent.data1]);
    }
    //output.send([midiEvent.status + channel, midiEvent.data1, midiEvent.data2]);
  });

  // @TODO: maybe a track should be able to send its event to both a midi-out port and an internal heartbeat song?
  //console.log(track.routeToMidiOut);
  if(track.routeToMidiOut === false){
    midiEvent.track = track;
    track.instrument.processEvent(midiEvent);
  }
}


function addMidiEventListener(...args){ // caller can be a track or a song

  let id = midiEventListenerId++;
  let listener;
    types = {},
    ids = [],
    loop;


  // should I inline this?
  loop = function(args){
    for(let arg of args){
      let type = typeString(arg);
      //console.log(type);
      if(type === 'array'){
        loop(arg);
      }else if(type === 'function'){
        listener = arg;
      }else if(isNaN(arg) === false){
        arg = parseInt(arg, 10);
        if(sequencer.checkEventType(arg) !== false){
          types[arg] = arg;
        }
      }else if(type === 'string'){
        if(sequencer.checkEventType(arg) !== false){
          arg = sequencer.midiEventNumberByName(arg);
          types[arg] = arg;
        }
      }
    }
  };

  loop(args, 0, args.length);
  //console.log('types', types, 'listener', listener);

  objectForEach(types, function(type){
    //console.log(type);
    if(obj.midiEventListeners[type] === undefined){
      obj.midiEventListeners[type] = {};
    }
    obj.midiEventListeners[type][id] = listener;
    ids.push(type + '_' + id);
  });

  //console.log(obj.midiEventListeners);
  return ids.length === 1 ? ids[0] : ids;
}


function removeMidiEventListener(id, obj){
  var type;
  id = id.split('_');
  type = id[0];
  id = id[1];
  delete obj.midiEventListeners[type][id];
}


function removeMidiEventListeners(){

}

*/
exports.getMIDIInputById = _getMIDIInputById;
},{"./util":29}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instrument = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sample = require('./sample');

var _init_audio = require('./init_audio');

var _note = require('./note');

var _parse_audio = require('./parse_audio');

var _util = require('./util');

var _eventlistener = require('./eventlistener');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ppq = 480;
var bpm = 120;
var playbackSpeed = 1;
var millisPerTick = 1 / playbackSpeed * 60 / bpm / ppq;

var Instrument = exports.Instrument = function () {
  function Instrument(id, type) {
    _classCallCheck(this, Instrument);

    this.id = id;
    this.type = type;
    // create a samples data object for all 128 velocity levels of all 128 notes
    this.samplesData = new Array(128).fill(-1);
    this.samplesData = this.samplesData.map(function () {
      return new Array(128).fill(-1);
    });

    this.scheduledSamples = {};
    this.sustainedSamples = [];
    this.sustainPedalDown = false;
  }

  _createClass(Instrument, [{
    key: 'connect',
    value: function connect(output) {
      this.output = output;
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.output = null;
    }
  }, {
    key: 'processMIDIEvent',
    value: function processMIDIEvent(event, time) {
      var _this = this;

      var sample = void 0,
          sampleData = void 0;
      if (isNaN(time)) {
        time = _init_audio.context.currentTime + event.ticks * millisPerTick;
      }
      //console.log(time)

      if (event.type === 144) {
        //console.log(144, ':', time, context.currentTime, event.millis)

        sampleData = this.samplesData[event.data1][event.data2];
        sample = (0, _sample.createSample)(sampleData, event);
        this.scheduledSamples[event.midiNoteId] = sample;
        sample.output.connect(this.output || _init_audio.context.destination);
        // sample.source.onended = () => {
        //   console.log('    deleting', event.midiNoteId)
        //   delete this.scheduledSamples[event.midiNoteId]
        // }
        sample.start(time);
        //console.log('scheduling', event.id, event.midiNoteId)
        //console.log('start', event.midiNoteId)
      } else if (event.type === 128) {
          //console.log(128, ':', time, context.currentTime, event.millis)
          sample = this.scheduledSamples[event.midiNoteId];
          if (typeof sample === 'undefined') {
            //console.info('sample not found for event', event.id, ' midiNote', event.midiNoteId, event)
            return;
          }
          if (this.sustainPedalDown === true) {
            //console.log(event.midiNoteId)
            this.sustainedSamples.push(event.midiNoteId);
          } else {
            sample.stop(time, function () {
              //console.log('stop', time, event.midiNoteId)
              delete _this.scheduledSamples[event.midiNoteId];
            });
            //sample.stop(time)
          }
        } else if (event.type === 176) {
            // sustain pedal
            if (event.data1 === 64) {
              if (event.data2 === 127) {
                this.sustainPedalDown = true;
                ///*
                (0, _eventlistener.dispatchEvent)({
                  type: 'sustainpedal',
                  data: 'down'
                });
                //*/
                //console.log('sustain pedal down')
              } else if (event.data2 === 0) {
                  this.sustainPedalDown = false;
                  this.sustainedSamples.forEach(function (midiNoteId) {
                    sample = _this.scheduledSamples[midiNoteId];
                    if (sample) {
                      //sample.stop(time)
                      sample.stop(time, function () {
                        //console.log('stop', midiNoteId)
                        delete _this.scheduledSamples[midiNoteId];
                      });
                    }
                  });
                  //console.log('sustain pedal up', this.sustainedSamples)
                  this.sustainedSamples = [];
                  ///*
                  (0, _eventlistener.dispatchEvent)({
                    type: 'sustainpedal',
                    data: 'up'
                  });
                  //*/
                  //this.stopSustain(time);
                }

              // panning
            } else if (event.data1 === 10) {
                // panning is *not* exactly timed -> not possible (yet) with WebAudio
                //console.log(data2, remap(data2, 0, 127, -1, 1));
                //track.setPanning(remap(data2, 0, 127, -1, 1));

                // volume
              } else if (event.data1 === 7) {
                  // to be implemented
                }
          }
    }

    // load and parse

  }, {
    key: 'parseSampleData',
    value: function parseSampleData(data) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        (0, _parse_audio.parseSamples2)(data).then(function (result) {

          if (typeof data.release !== 'undefined') {
            _this2.setRelease(data.release[0], data.release[1]);
            //console.log(data.release[0], data.release[1])
          }

          result.forEach(function (sample) {
            var sampleData = data[sample.id];
            if (typeof sampleData === 'string') {
              sampleData = {
                buffer: sample.buffer
              };
            } else {
              sampleData.buffer = sample.buffer;
            }
            sampleData.note = sample.id;
            _this2.updateSampleData(sampleData);
          });

          resolve();
        });
      });
    }

    /*
      @param config (optional)
        {
          note: can be note name (C4) or note number (60)
          buffer: AudioBuffer
          sustain: [sustainStart, sustainEnd], // optional, in millis
          release: [releaseDuration, releaseEnvelope], // optional
          pan: panPosition // optional
          velocity: [velocityStart, velocityEnd] // optional, for multi-layered instruments
        }
    */

  }, {
    key: 'updateSampleData',
    value: function updateSampleData() {
      var _this3 = this;

      for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
        data[_key] = arguments[_key];
      }

      data.forEach(function (noteData) {
        return _this3._updateSampleData(noteData);
      });
    }
  }, {
    key: '_updateSampleData',
    value: function _updateSampleData() {
      var _this4 = this;

      var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var note = data.note;
      var _data$buffer = data.buffer;
      var buffer = _data$buffer === undefined ? null : _data$buffer;
      var _data$sustain = data.sustain;
      var sustain = _data$sustain === undefined ? [null, null] : _data$sustain;
      var _data$release = data.release;
      var release = _data$release === undefined ? [null, 'linear'] : _data$release;
      var _data$pan = data.pan;
      var pan = _data$pan === undefined ? null : _data$pan;
      var _data$velocity = data.velocity;
      var velocity = _data$velocity === undefined ? [0, 127] : _data$velocity;


      if (typeof note === 'undefined') {
        console.warn('please provide a notenumber or a notename');
        return;
      }

      // get notenumber from notename and check if the notenumber is valid
      var n = (0, _note.createNote)(note);
      if (n === false) {
        console.warn('not a valid note id');
        return;
      }
      note = n.number;

      var _sustain = _slicedToArray(sustain, 2);

      var sustainStart = _sustain[0];
      var sustainEnd = _sustain[1];

      var _release = _slicedToArray(release, 2);

      var releaseDuration = _release[0];
      var releaseEnvelope = _release[1];

      var _velocity = _slicedToArray(velocity, 2);

      var velocityStart = _velocity[0];
      var velocityEnd = _velocity[1];


      if (sustain.length !== 2) {
        sustainStart = sustainEnd = null;
      }

      if (releaseDuration === null) {
        releaseEnvelope = null;
      }

      // console.log(noteId, buffer);
      // console.log(sustainStart, sustainEnd);
      // console.log(releaseDuration, releaseEnvelope);
      // console.log(pan);
      // console.log(velocityStart, velocityEnd);

      this.samplesData[note].forEach(function (sampleData, i) {
        if (i >= velocityStart && i < velocityEnd) {
          if (sampleData === -1) {
            sampleData = {
              id: note
            };
          }

          sampleData.buffer = buffer || sampleData.buffer;
          sampleData.sustainStart = sustainStart || sampleData.sustainStart;
          sampleData.sustainEnd = sustainEnd || sampleData.sustainEnd;
          sampleData.releaseDuration = releaseDuration || sampleData.releaseDuration;
          sampleData.releaseEnvelope = releaseEnvelope || sampleData.releaseEnvelope;
          sampleData.pan = pan || sampleData.pan;

          if ((0, _util.typeString)(sampleData.releaseEnvelope) === 'array') {
            sampleData.releaseEnvelopeArray = sampleData.releaseEnvelope;
            sampleData.releaseEnvelope = 'array';
          } else {
            delete sampleData.releaseEnvelopeArray;
          }
          _this4.samplesData[note][i] = sampleData;
        }
      });
      //console.log('%O', this.samplesData[note]);
    }

    // stereo spread

  }, {
    key: 'setKeyScalingPanning',
    value: function setKeyScalingPanning() {
      // sets panning based on the key value, e.g. higher notes are panned more to the right and lower notes more to the left
    }
  }, {
    key: 'setKeyScalingRelease',
    value: function setKeyScalingRelease() {}
    // set release based on key value


    /*
      @duration: milliseconds
      @envelope: linear | equal_power | array of int values
    */

  }, {
    key: 'setRelease',
    value: function setRelease(duration, envelope) {
      // set release for all keys, overrules values set by setKeyScalingRelease()
      this.samplesData.forEach(function (samples, i) {
        samples.forEach(function (sample) {
          if (sample === -1) {
            sample = {
              id: i
            };
          }
          sample.releaseDuration = duration;
          sample.releaseEnvelope = envelope;
        });
      });
    }
  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      var _this5 = this;

      this.sustainedSamples = [];
      if (this.sustainPedalDown === true) {
        (0, _eventlistener.dispatchEvent)({
          type: 'sustainpedal',
          data: 'up'
        });
      }
      this.sustainPedalDown = false;

      Object.keys(this.scheduledSamples).forEach(function (sampleId) {
        //console.log('  stopping', sampleId, this.id)
        _this5.scheduledSamples[sampleId].stop();
      });
      this.scheduledSamples = {};

      //console.log('allNotesOff', this.sustainedSamples.length, this.scheduledSamples)
    }
  }]);

  return Instrument;
}();
},{"./eventlistener":4,"./init_audio":7,"./note":15,"./parse_audio":16,"./sample":22,"./util":29}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Metronome = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _track = require('./track');

var _part2 = require('./part');

var _parse_events = require('./parse_events');

var _midi_event = require('./midi_event');

var _util = require('./util');

var _position = require('./position');

var _instrument = require('./instrument');

var _init_audio = require('./init_audio');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var methodMap = new Map([['volume', 'setVolume'], ['instrument', 'setInstrument'], ['noteNumberAccentedTick', 'setNoteNumberAccentedTick'], ['noteNumberNonAccentedTick', 'setNoteNumberNonAccentedTick'], ['velocityAccentedTick', 'setVelocityAccentedTick'], ['velocityNonAccentedTick', 'setVelocityNonAccentedTick'], ['noteLengthAccentedTick', 'setNoteLengthAccentedTick'], ['noteLengthNonAccentedTick', 'setNoteLengthNonAccentedTick']]);

var Metronome = exports.Metronome = function () {
  function Metronome(song) {
    _classCallCheck(this, Metronome);

    this.song = song;
    this.track = new _track.Track(this.song.id + '_metronome');
    this.part = new _part2.Part();
    this.track.addParts(this.part);
    this.track.connect(this.song._output);

    this.events = [];
    this.precountEvents = [];
    this.precountDuration = 0;
    this.bars = 0;
    this.index = 0;
    this.precountIndex = 0;
    this.reset();
  }

  _createClass(Metronome, [{
    key: 'reset',
    value: function reset() {

      var data = (0, _init_audio.getInitData)();
      var instrument = new _instrument.Instrument('metronome');
      instrument.updateSampleData({
        note: 60,
        buffer: data.lowtick
      }, {
        note: 61,
        buffer: data.hightick
      });
      this.track.setInstrument(instrument);

      this.volume = 1;

      this.noteNumberAccented = 61;
      this.noteNumberNonAccented = 60;

      this.velocityAccented = 100;
      this.velocityNonAccented = 100;

      this.noteLengthAccented = this.song.ppq / 4; // sixteenth notes -> don't make this too short if your sample has a long attack!
      this.noteLengthNonAccented = this.song.ppq / 4;
    }
  }, {
    key: 'createEvents',
    value: function createEvents(startBar, endBar) {
      var id = arguments.length <= 2 || arguments[2] === undefined ? 'init' : arguments[2];

      var i = void 0,
          j = void 0;
      var position = void 0;
      var velocity = void 0;
      var noteLength = void 0;
      var noteNumber = void 0;
      var beatsPerBar = void 0;
      var ticksPerBeat = void 0;
      var ticks = 0;
      var noteOn = void 0,
          noteOff = void 0;
      var events = [];

      //console.log(startBar, endBar);

      for (i = startBar; i <= endBar; i++) {
        position = (0, _position.calculatePosition)(this.song, {
          type: 'barsbeats',
          target: [i]
        });

        beatsPerBar = position.nominator;
        ticksPerBeat = position.ticksPerBeat;

        for (j = 0; j < beatsPerBar; j++) {

          noteNumber = j === 0 ? this.noteNumberAccented : this.noteNumberNonAccented;
          noteLength = j === 0 ? this.noteLengthAccented : this.noteLengthNonAccented;
          velocity = j === 0 ? this.velocityAccented : this.velocityNonAccented;

          noteOn = new _midi_event.MIDIEvent(ticks, 144, noteNumber, velocity);
          noteOff = new _midi_event.MIDIEvent(ticks + noteLength, 128, noteNumber, 0);

          if (id === 'precount') {
            noteOn._track = this.track;
            noteOff._track = this.track;
            noteOn._part = {};
            noteOff._part = {};
          }

          events.push(noteOn, noteOff);
          ticks += ticksPerBeat;
        }
      }

      return events;
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var startBar = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      var _part;

      var endBar = arguments.length <= 1 || arguments[1] === undefined ? this.song.bars : arguments[1];
      var id = arguments.length <= 2 || arguments[2] === undefined ? 'init' : arguments[2];

      this.part.removeEvents(this.part.getEvents());
      this.events = this.createEvents(startBar, endBar, id);
      (_part = this.part).addEvents.apply(_part, _toConsumableArray(this.events));
      this.bars = this.song.bars;
      //console.log('getEvents %O', this.events)
      return this.events;
    }
  }, {
    key: 'createPrecountEvents',
    value: function createPrecountEvents(precount, timeStamp) {
      if (precount <= 0) {
        return -1;
      }

      this.timeStamp = timeStamp;

      //   let songStartPosition = this.song.getPosition()

      var songStartPosition = (0, _position.calculatePosition)(this.song, {
        type: 'millis',
        target: this.song._currentMillis,
        result: 'all'
      });

      var endPos = (0, _position.calculatePosition)(this.song, {
        type: 'barsbeats',
        target: [songStartPosition.bar + precount],
        result: 'all'
      });

      //console.log(songStartPosition, endPos)

      this.precountIndex = 0;
      this.startMillis = songStartPosition.millis;
      this.endMillis = endPos.millis;
      this.precountDuration = endPos.millis - this.startMillis;

      //console.log(this.precountDuration)

      this.precountEvents = this.createEvents(songStartPosition.bar, endPos.bar - 1, 'precount');
      this.precountEvents = (0, _parse_events.parseEvents)([].concat(_toConsumableArray(this.song._timeEvents), _toConsumableArray(this.precountEvents)));

      //console.log(songStartPosition.bar, endPos.bar, precount, this.precountEvents.length);
      //console.log(this.precountEvents, this.precountDuration);
      return this.precountDuration;
    }

    // called by scheduler.js

  }, {
    key: 'getPrecountEvents',
    value: function getPrecountEvents(maxtime) {
      var events = this.precountEvents,
          maxi = events.length,
          i = void 0,
          evt = void 0,
          result = [];

      for (i = this.precountIndex; i < maxi; i++) {
        evt = events[i];
        //console.log(event.millis, maxtime, this.millis);
        if (evt.millis < maxtime) {
          evt.time = this.timeStamp + evt.millis;
          result.push(evt);
          this.precountIndex++;
        } else {
          break;
        }
      }
      //console.log(result.length);
      return result;
    }
  }, {
    key: 'mute',
    value: function mute(flag) {
      this.track.muted = flag;
    }
  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      this.track._instrument.allNotesOff();
    }

    // =========== CONFIGURATION ===========

  }, {
    key: 'updateConfig',
    value: function updateConfig() {
      this.init(1, this.bars, 'update');
      this.allNotesOff();
      this.song._scheduler.updateSong();
    }

    // added to public API: Song.configureMetronome({})

  }, {
    key: 'configure',
    value: function configure(config) {

      Object.keys(config).forEach(function (key) {
        this[methodMap.get(key)](config.key);
      }, this);

      this.updateConfig();
    }
  }, {
    key: 'setInstrument',
    value: function setInstrument(instrument) {
      if (!instrument instanceof _instrument.Instrument) {
        console.warn('not an instance of Instrument');
        return;
      }
      this.track.setInstrument(instrument);
      this.updateConfig();
    }
  }, {
    key: 'setNoteLengthAccentedTick',
    value: function setNoteLengthAccentedTick(value) {
      if (isNaN(value)) {
        console.warn('please provide a number');
      }
      this.noteLengthAccented = value;
      this.updateConfig();
    }
  }, {
    key: 'setNoteLengthNonAccentedTick',
    value: function setNoteLengthNonAccentedTick(value) {
      if (isNaN(value)) {
        console.warn('please provide a number');
      }
      this.noteLengthNonAccented = value;
      this.updateConfig();
    }
  }, {
    key: 'setVelocityAccentedTick',
    value: function setVelocityAccentedTick(value) {
      value = (0, _util.checkMIDINumber)(value);
      if (value !== false) {
        this.velocityAccented = value;
      } else {
        console.warn('please provide a number');
      }
      this.updateConfig();
    }
  }, {
    key: 'setVelocityNonAccentedTick',
    value: function setVelocityNonAccentedTick(value) {
      value = (0, _util.checkMIDINumber)(value);
      if (value !== false) {
        this.velocityNonAccented = value;
      } else {
        console.warn('please provide a number');
      }
      this.updateConfig();
    }
  }, {
    key: 'setNoteNumberAccentedTick',
    value: function setNoteNumberAccentedTick(value) {
      value = (0, _util.checkMIDINumber)(value);
      if (value !== false) {
        this.noteNumberAccented = value;
      } else {
        console.warn('please provide a number');
      }
      this.updateConfig();
    }
  }, {
    key: 'setNoteNumberNonAccentedTick',
    value: function setNoteNumberNonAccentedTick(value) {
      value = (0, _util.checkMIDINumber)(value);
      if (value !== false) {
        this.noteNumberNonAccented = value;
      } else {
        console.warn('please provide a number');
      }
      this.updateConfig();
    }
  }, {
    key: 'setVolume',
    value: function setVolume(value) {
      this.track.setVolume(value);
    }
  }]);

  return Metronome;
}();
},{"./init_audio":7,"./instrument":9,"./midi_event":11,"./parse_events":17,"./part":18,"./position":20,"./track":28,"./util":29}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// @ flow

var midiEventIndex = 0;

var MIDIEvent = exports.MIDIEvent = function () {
  function MIDIEvent(ticks, type, data1) {
    var data2 = arguments.length <= 3 || arguments[3] === undefined ? -1 : arguments[3];

    _classCallCheck(this, MIDIEvent);

    this.id = "ME_" + midiEventIndex++ + "_" + new Date().getTime();
    this.ticks = ticks;
    this.type = type;
    this.data1 = data1;
    this.data2 = data2;
    this.frequency = 440 * Math.pow(2, (data1 - 69) / 12);

    if (data1 === 144 && data2 === 0) {
      this.data1 = 128;
    }

    this._part = null;
    this._track = null;
    this._song = null;
    //@TODO: add all other properties
  }

  _createClass(MIDIEvent, [{
    key: "copy",
    value: function copy() {
      var m = new MIDIEvent(this.ticks, this.type, this.data1, this.data2);
      return m;
    }
  }, {
    key: "transpose",
    value: function transpose(amount) {
      // may be better if not a public method?
      this.data1 += amount;
      this.frequency = 440 * Math.pow(2, (this.data1 - 69) / 12);
    }
  }, {
    key: "move",
    value: function move(ticks) {
      this.ticks += ticks;
      if (this.midiNote) {
        this.midiNote.update();
      }
    }
  }, {
    key: "moveTo",
    value: function moveTo(ticks) {
      this.ticks = ticks;
      if (this.midiNote) {
        this.midiNote.update();
      }
    }
  }]);

  return MIDIEvent;
}();

/*
export function deleteMIDIEvent(event){
  //event.note = null
  event.note = null
  event = null
}
*/
},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIDINote = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _midi_event = require('./midi_event');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var midiNoteIndex = 0;

var MIDINote = exports.MIDINote = function () {
  function MIDINote(noteon, noteoff) {
    _classCallCheck(this, MIDINote);

    //if(noteon.type !== 144 || noteoff.type !== 128){
    if (noteon.type !== 144) {
      console.warn('cannot create MIDINote');
      return;
    }
    this.id = 'MN_' + midiNoteIndex++ + '_' + new Date().getTime();
    this.noteOn = noteon;
    noteon.midiNote = this;
    noteon.midiNoteId = this.id;

    if (noteoff instanceof _midi_event.MIDIEvent) {
      this.noteOff = noteoff;
      noteoff.midiNote = this;
      noteoff.midiNoteId = this.id;
      this.durationTicks = noteoff.ticks - noteon.ticks;
      this.durationMillis = -1;
    }
  }

  _createClass(MIDINote, [{
    key: 'addNoteOff',
    value: function addNoteOff(noteoff) {
      this.noteOff = noteoff;
      noteoff.midiNote = this;
      noteoff.midiNoteId = this.id;
      this.durationTicks = noteoff.ticks - this.noteOn.ticks;
      this.durationMillis = -1;
    }
  }, {
    key: 'copy',
    value: function copy() {
      return new MIDINote(this.noteOn.copy(), this.noteOff.copy());
    }
  }, {
    key: 'update',
    value: function update() {
      // may use another name for this method
      this.durationTicks = this.noteOff.ticks - this.noteOn.ticks;
    }
  }, {
    key: 'transpose',
    value: function transpose(amount) {
      this.noteOn.transpose(amount);
      this.noteOff.transpose(amount);
    }
  }, {
    key: 'move',
    value: function move(ticks) {
      this.noteOn.move(ticks);
      this.noteOff.move(ticks);
    }
  }, {
    key: 'moveTo',
    value: function moveTo(ticks) {
      this.noteOn.moveTo(ticks);
      this.noteOff.moveTo(ticks);
    }
  }, {
    key: 'unregister',
    value: function unregister() {
      if (this.part) {
        this.part.removeEvents(this);
        this.part = null;
      }
      if (this.track) {
        this.track.removeEvents(this);
        this.track = null;
      }
      if (this.song) {
        this.song.removeEvents(this);
        this.song = null;
      }
    }
  }]);

  return MIDINote;
}();
},{"./midi_event":11}],13:[function(require,module,exports){
/*
  Wrapper for accessing bytes through sequential reads

  based on: https://github.com/gasman/jasmid
  adapted to work with ArrayBuffer -> Uint8Array
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fcc = String.fromCharCode;

var MIDIStream = function () {

  // buffer is Uint8Array

  function MIDIStream(buffer) {
    _classCallCheck(this, MIDIStream);

    this.buffer = buffer;
    this.position = 0;
  }

  /* read string or any number of bytes */


  _createClass(MIDIStream, [{
    key: 'read',
    value: function read(length) {
      var toString = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var result = void 0;

      if (toString) {
        result = '';
        for (var i = 0; i < length; i++, this.position++) {
          result += fcc(this.buffer[this.position]);
        }
        return result;
      } else {
        result = [];
        for (var _i = 0; _i < length; _i++, this.position++) {
          result.push(this.buffer[this.position]);
        }
        return result;
      }
    }

    /* read a big-endian 32-bit integer */

  }, {
    key: 'readInt32',
    value: function readInt32() {
      var result = (this.buffer[this.position] << 24) + (this.buffer[this.position + 1] << 16) + (this.buffer[this.position + 2] << 8) + this.buffer[this.position + 3];
      this.position += 4;
      return result;
    }

    /* read a big-endian 16-bit integer */

  }, {
    key: 'readInt16',
    value: function readInt16() {
      var result = (this.buffer[this.position] << 8) + this.buffer[this.position + 1];
      this.position += 2;
      return result;
    }

    /* read an 8-bit integer */

  }, {
    key: 'readInt8',
    value: function readInt8(signed) {
      var result = this.buffer[this.position];
      if (signed && result > 127) {
        result -= 256;
      }
      this.position += 1;
      return result;
    }
  }, {
    key: 'eof',
    value: function eof() {
      return this.position >= this.buffer.length;
    }

    /* read a MIDI-style letiable-length integer
      (big-endian value in groups of 7 bits,
      with top bit set to signify that another byte follows)
    */

  }, {
    key: 'readVarInt',
    value: function readVarInt() {
      var result = 0;
      while (true) {
        var b = this.readInt8();
        if (b & 0x80) {
          result += b & 0x7f;
          result <<= 7;
        } else {
          /* b is the last byte */
          return result + b;
        }
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.position = 0;
    }
  }, {
    key: 'setPosition',
    value: function setPosition(p) {
      this.position = p;
    }
  }]);

  return MIDIStream;
}();

exports.default = MIDIStream;
},{}],14:[function(require,module,exports){
/*
  Extracts all midi events from a binary midi file, uses midi_stream.js

  based on: https://github.com/gasman/jasmid
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseMIDIFile = parseMIDIFile;

var _midi_stream = require('./midi_stream');

var _midi_stream2 = _interopRequireDefault(_midi_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lastEventTypeByte = void 0,
    trackName = void 0;

function readChunk(stream) {
  var id = stream.read(4, true);
  var length = stream.readInt32();
  //console.log(length);
  return {
    'id': id,
    'length': length,
    'data': stream.read(length, false)
  };
}

function readEvent(stream) {
  var event = {};
  var length;
  event.deltaTime = stream.readVarInt();
  var eventTypeByte = stream.readInt8();
  //console.log(eventTypeByte, eventTypeByte & 0x80, 146 & 0x0f);
  if ((eventTypeByte & 0xf0) == 0xf0) {
    /* system / meta event */
    if (eventTypeByte == 0xff) {
      /* meta event */
      event.type = 'meta';
      var subtypeByte = stream.readInt8();
      length = stream.readVarInt();
      switch (subtypeByte) {
        case 0x00:
          event.subtype = 'sequenceNumber';
          if (length !== 2) {
            throw 'Expected length for sequenceNumber event is 2, got ' + length;
          }
          event.number = stream.readInt16();
          return event;
        case 0x01:
          event.subtype = 'text';
          event.text = stream.read(length);
          return event;
        case 0x02:
          event.subtype = 'copyrightNotice';
          event.text = stream.read(length);
          return event;
        case 0x03:
          event.subtype = 'trackName';
          event.text = stream.read(length);
          trackName = event.text;
          return event;
        case 0x04:
          event.subtype = 'instrumentName';
          event.text = stream.read(length);
          return event;
        case 0x05:
          event.subtype = 'lyrics';
          event.text = stream.read(length);
          return event;
        case 0x06:
          event.subtype = 'marker';
          event.text = stream.read(length);
          return event;
        case 0x07:
          event.subtype = 'cuePoint';
          event.text = stream.read(length);
          return event;
        case 0x20:
          event.subtype = 'midiChannelPrefix';
          if (length !== 1) {
            throw 'Expected length for midiChannelPrefix event is 1, got ' + length;
          }
          event.channel = stream.readInt8();
          return event;
        case 0x2f:
          event.subtype = 'endOfTrack';
          if (length !== 0) {
            throw 'Expected length for endOfTrack event is 0, got ' + length;
          }
          return event;
        case 0x51:
          event.subtype = 'setTempo';
          if (length !== 3) {
            throw 'Expected length for setTempo event is 3, got ' + length;
          }
          event.microsecondsPerBeat = (stream.readInt8() << 16) + (stream.readInt8() << 8) + stream.readInt8();
          return event;
        case 0x54:
          event.subtype = 'smpteOffset';
          if (length !== 5) {
            throw 'Expected length for smpteOffset event is 5, got ' + length;
          }
          var hourByte = stream.readInt8();
          event.frameRate = {
            0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30
          }[hourByte & 0x60];
          event.hour = hourByte & 0x1f;
          event.min = stream.readInt8();
          event.sec = stream.readInt8();
          event.frame = stream.readInt8();
          event.subframe = stream.readInt8();
          return event;
        case 0x58:
          event.subtype = 'timeSignature';
          if (length !== 4) {
            throw 'Expected length for timeSignature event is 4, got ' + length;
          }
          event.numerator = stream.readInt8();
          event.denominator = Math.pow(2, stream.readInt8());
          event.metronome = stream.readInt8();
          event.thirtyseconds = stream.readInt8();
          return event;
        case 0x59:
          event.subtype = 'keySignature';
          if (length !== 2) {
            throw 'Expected length for keySignature event is 2, got ' + length;
          }
          event.key = stream.readInt8(true);
          event.scale = stream.readInt8();
          return event;
        case 0x7f:
          event.subtype = 'sequencerSpecific';
          event.data = stream.read(length);
          return event;
        default:
          //if(sequencer.debug >= 2){
          //    console.warn('Unrecognised meta event subtype: ' + subtypeByte);
          //}
          event.subtype = 'unknown';
          event.data = stream.read(length);
          return event;
      }
      event.data = stream.read(length);
      return event;
    } else if (eventTypeByte == 0xf0) {
      event.type = 'sysEx';
      length = stream.readVarInt();
      event.data = stream.read(length);
      return event;
    } else if (eventTypeByte == 0xf7) {
      event.type = 'dividedSysEx';
      length = stream.readVarInt();
      event.data = stream.read(length);
      return event;
    } else {
      throw 'Unrecognised MIDI event type byte: ' + eventTypeByte;
    }
  } else {
    /* channel event */
    var param1 = void 0;
    if ((eventTypeByte & 0x80) === 0) {
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
    event.channel = eventTypeByte & 0x0f;
    event.type = 'channel';
    switch (eventType) {
      case 0x08:
        event.subtype = 'noteOff';
        event.noteNumber = param1;
        event.velocity = stream.readInt8();
        return event;
      case 0x09:
        event.noteNumber = param1;
        event.velocity = stream.readInt8();
        if (event.velocity === 0) {
          event.subtype = 'noteOff';
        } else {
          event.subtype = 'noteOn';
          //console.log('noteOn');
        }
        return event;
      case 0x0a:
        event.subtype = 'noteAftertouch';
        event.noteNumber = param1;
        event.amount = stream.readInt8();
        return event;
      case 0x0b:
        event.subtype = 'controller';
        event.controllerType = param1;
        event.value = stream.readInt8();
        return event;
      case 0x0c:
        event.subtype = 'programChange';
        event.programNumber = param1;
        return event;
      case 0x0d:
        event.subtype = 'channelAftertouch';
        event.amount = param1;
        //if(trackName === 'SH-S1-44-C09 L=SML IN=3'){
        //    console.log('channel pressure', trackName, param1);
        //}
        return event;
      case 0x0e:
        event.subtype = 'pitchBend';
        event.value = param1 + (stream.readInt8() << 7);
        return event;
      default:
        /*
        throw 'Unrecognised MIDI event type: ' + eventType;
        console.log('Unrecognised MIDI event type: ' + eventType);
        */

        event.value = stream.readInt8();
        event.subtype = 'unknown';
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
  if (buffer instanceof Uint8Array === false && buffer instanceof ArrayBuffer === false) {
    console.error('buffer should be an instance of Uint8Array of ArrayBuffer');
    return;
  }
  if (buffer instanceof ArrayBuffer) {
    buffer = new Uint8Array(buffer);
  }
  var tracks = new Map();
  var stream = new _midi_stream2.default(buffer);

  var headerChunk = readChunk(stream);
  if (headerChunk.id !== 'MThd' || headerChunk.length !== 6) {
    throw 'Bad .mid file - header not found';
  }

  var headerStream = new _midi_stream2.default(headerChunk.data);
  var formatType = headerStream.readInt16();
  var trackCount = headerStream.readInt16();
  var timeDivision = headerStream.readInt16();

  if (timeDivision & 0x8000) {
    throw 'Expressing time division in SMTPE frames is not supported yet';
  }

  var header = {
    'formatType': formatType,
    'trackCount': trackCount,
    'ticksPerBeat': timeDivision
  };

  for (var i = 0; i < trackCount; i++) {
    trackName = 'track_' + i;
    var track = [];
    var trackChunk = readChunk(stream);
    if (trackChunk.id !== 'MTrk') {
      throw 'Unexpected chunk - expected MTrk, got ' + trackChunk.id;
    }
    var trackStream = new _midi_stream2.default(trackChunk.data);
    while (!trackStream.eof()) {
      var event = readEvent(trackStream);
      track.push(event);
    }
    tracks.set(trackName, track);
  }

  return {
    'header': header,
    'tracks': tracks
  };
}
},{"./midi_stream":13}],15:[function(require,module,exports){
/*
  Adds a function to create a note object that contains information about a musical note:
    - name, e.g. 'C'
    - octave,  -1 - 9
    - fullName: 'C1'
    - frequency: 234.16, based on the basic pitch
    - number: 60 midi note number

  Adds several utility methods organised around the note object
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNote = createNote;
exports.getNoteNumber = getNoteNumber;
exports.getNoteName = getNoteName;
exports.getNoteOctave = getNoteOctave;
exports.getFullNoteName = getFullNoteName;
exports.getFrequency = getFrequency;
exports.isBlackKey = isBlackKey;

var _util = require('./util');

var errorMsg = void 0,
    warningMsg = void 0,
    pow = Math.pow,
    floor = Math.floor;

var noteNames = {
  'sharp': ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  'flat': ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'enharmonic-sharp': ['B#', 'C#', 'C##', 'D#', 'D##', 'E#', 'F#', 'F##', 'G#', 'G##', 'A#', 'A##'],
  'enharmonic-flat': ['Dbb', 'Db', 'Ebb', 'Eb', 'Fb', 'Gbb', 'Gb', 'Abb', 'Ab', 'Bbb', 'Bb', 'Cb']
};

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

function createNote() {
  var numArgs = arguments.length,
      data = void 0,
      octave = void 0,
      noteName = void 0,
      noteNumber = void 0,
      noteNameMode = void 0,
      arg0 = arguments.length <= 0 ? undefined : arguments[0],
      arg1 = arguments.length <= 1 ? undefined : arguments[1],
      arg2 = arguments.length <= 2 ? undefined : arguments[2],
      type0 = (0, _util.typeString)(arg0),
      type1 = (0, _util.typeString)(arg1),
      type2 = (0, _util.typeString)(arg2);

  errorMsg = '';
  warningMsg = '';

  // argument: note number
  //console.log(numArgs, type0)
  if (numArgs === 1 && type0 === 'number') {
    if (arg0 < 0 || arg0 > 127) {
      errorMsg = 'please provide a note number >= 0 and <= 127 ' + arg0;
    } else {
      noteNumber = arg0;
      data = _getNoteName(noteNumber);
      noteName = data[0];
      octave = data[1];
    }

    // arguments: full note name
  } else if (numArgs === 1 && type0 === 'string') {
      data = _checkNoteName(arg0);
      if (errorMsg === '') {
        noteName = data[0];
        octave = data[1];
        noteNumber = _getNoteNumber(noteName, octave);
      }

      // arguments: note name, octave
    } else if (numArgs === 2 && type0 === 'string' && type1 === 'number') {
        data = _checkNoteName(arg0, arg1);
        if (errorMsg === '') {
          noteName = data[0];
          octave = data[1];
          noteNumber = _getNoteNumber(noteName, octave);
        }

        // arguments: full note name, note name mode -> for converting between note name modes
      } else if (numArgs === 2 && type0 === 'string' && type1 === 'string') {
          data = _checkNoteName(arg0);
          if (errorMsg === '') {
            noteNameMode = _checkNoteNameMode(arg1);
            noteName = data[0];
            octave = data[1];
            noteNumber = _getNoteNumber(noteName, octave);
          }

          // arguments: note number, note name mode
        } else if (numArgs === 2 && (0, _util.typeString)(arg0) === 'number' && (0, _util.typeString)(arg1) === 'string') {
            if (arg0 < 0 || arg0 > 127) {
              errorMsg = 'please provide a note number >= 0 and <= 127 ' + arg0;
            } else {
              noteNameMode = _checkNoteNameMode(arg1);
              noteNumber = arg0;
              data = _getNoteName(noteNumber, noteNameMode);
              noteName = data[0];
              octave = data[1];
            }

            // arguments: note name, octave, note name mode
          } else if (numArgs === 3 && type0 === 'string' && type1 === 'number' && type2 === 'string') {
              data = _checkNoteName(arg0, arg1);
              if (errorMsg === '') {
                noteNameMode = _checkNoteNameMode(arg2);
                noteName = data[0];
                octave = data[1];
                noteNumber = _getNoteNumber(noteName, octave);
              }
            } else {
              errorMsg = 'wrong arguments, please consult documentation';
            }

  if (errorMsg) {
    console.error(errorMsg);
    return false;
  }

  if (warningMsg) {
    console.warn(warningMsg);
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

//function _getNoteName(number, mode = config.get('noteNameMode')) {
function _getNoteName(number) {
  var mode = arguments.length <= 1 || arguments[1] === undefined ? 'sharp' : arguments[1];

  //let octave = Math.floor((number / 12) - 2), // → in Cubase central C = C3 instead of C4
  var octave = floor(number / 12 - 1);
  var noteName = noteNames[mode][number % 12];
  return [noteName, octave];
}

function _getNoteNumber(name, octave) {
  var keys = Object.keys(noteNames);
  var index = void 0;

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

    //number = (index + 12) + (octave * 12) + 12; // → in Cubase central C = C3 instead of C4
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var number = index + 12 + octave * 12; // → midi standard + scientific naming, see: http://en.wikipedia.org/wiki/Middle_C and http://en.wikipedia.org/wiki/Scientific_pitch_notation

  if (number < 0 || number > 127) {
    errorMsg = 'please provide a note between C0 and G10';
    return;
  }
  return number;
}

function _getFrequency(number) {
  //return config.get('pitch') * pow(2,(number - 69)/12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
  return 440 * pow(2, (number - 69) / 12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
}

// TODO: calculate note from frequency
function _getPitch(hertz) {
  //fm  =  2(m−69)/12(440 Hz).
}

function _checkNoteNameMode(mode) {
  var keys = Object.keys(noteNames);
  var result = keys.find(function (x) {
    return x === mode;
  }) !== undefined;
  if (result === false) {
    //mode = config.get('noteNameMode');
    mode = 'sharp';
    warningMsg = mode + ' is not a valid note name mode, using "' + mode + '" instead';
  }
  return mode;
}

function _checkNoteName() {
  var numArgs = arguments.length,
      arg0 = arguments.length <= 0 ? undefined : arguments[0],
      arg1 = arguments.length <= 1 ? undefined : arguments[1],
      char = void 0,
      name = '',
      octave = '';

  // extract octave from note name
  if (numArgs === 1) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = arg0[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        char = _step2.value;

        if (isNaN(char) && char !== '-') {
          name += char;
        } else {
          octave += char;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    if (octave === '') {
      octave = 0;
    }
  } else if (numArgs === 2) {
    name = arg0;
    octave = arg1;
  }

  // check if note name is valid
  var keys = Object.keys(noteNames);
  var index = -1;

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var key = _step3.value;

      var mode = noteNames[key];
      index = mode.findIndex(function (x) {
        return x === name;
      });
      if (index !== -1) {
        break;
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  if (index === -1) {
    errorMsg = arg0 + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb, followed by a number for the octave';
    return;
  }

  if (octave < -1 || octave > 9) {
    errorMsg = 'please provide an octave between -1 and 9';
    return;
  }

  octave = parseInt(octave, 10);
  name = name.substring(0, 1).toUpperCase() + name.substring(1);

  //console.log(name,'|',octave);
  return [name, octave];
}

function _isBlackKey(noteNumber) {
  var black = void 0;

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
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.number;
  }
  return errorMsg;
}

function getNoteName() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.name;
  }
  return false;
}

function getNoteOctave() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.octave;
  }
  return false;
}

function getFullNoteName() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.fullName;
  }
  return false;
}

function getFrequency() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.frequency;
  }
  return false;
}

function isBlackKey() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.blackKey;
  }
  return false;
}
},{"./util":29}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.decodeSample = decodeSample;
exports.parseSamples2 = parseSamples2;
exports.parseSamples = parseSamples;

var _init_audio = require('./init_audio');

var _util = require('./util');

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function decodeSample(sample, id, every) {
  return new Promise(function (resolve) {
    try {
      _init_audio.context.decodeAudioData(sample, function onSuccess(buffer) {
        //console.log(id, buffer);
        if (typeof id !== 'undefined') {
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
        console('error decoding audiodata', id, e);
        //reject(e); // don't use reject because we use this as a nested promise and we don't want the parent promise to reject
        if (typeof id !== 'undefined') {
          resolve({ id: id });
        } else {
          resolve();
        }
      });
    } catch (e) {
      console.warn('error decoding audiodata', id, e);
      if (typeof id !== 'undefined') {
        resolve({ id: id });
      } else {
        resolve();
      }
    }
  });
}

function loadAndParseSample(url, id, every) {
  //console.log(id, url)
  var executor = function executor(resolve) {
    (0, _isomorphicFetch2.default)(escape(url), {
      method: 'GET'
    }).then(function (response) {
      if (response.ok) {
        response.arrayBuffer().then(function (data) {
          //console.log(data)
          decodeSample(data, id, every).then(resolve);
        });
      } else if (typeof id !== 'undefined') {
        resolve({ id: id });
      } else {
        resolve();
      }
    });
  };
  return new Promise(executor);
}

function getPromises(promises, sample, key, every) {

  var getSample = function getSample() {

    if (sample instanceof ArrayBuffer) {
      promises.push(decodeSample(sample, key, every));
    } else if (typeof sample === 'string') {
      if ((0, _util.checkIfBase64)(sample)) {
        promises.push(decodeSample((0, _util.base64ToBinary)(sample), key, every));
      } else {
        promises.push(loadAndParseSample(sample, key, every));
      }
    } else if ((typeof sample === 'undefined' ? 'undefined' : _typeof(sample)) === 'object') {
      sample = sample.sample || sample.buffer || sample.base64 || sample.url;
      getSample(promises, sample, key, every);
      //console.log(sample, promises.length)
    }
  };

  getSample();
}

// only for internally use in qambi
function parseSamples2(mapping) {
  var every = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var type = (0, _util.typeString)(mapping),
      promises = [];

  every = typeof every === 'function' ? every : false;
  //console.log(type, mapping)
  if (type === 'object') {
    Object.keys(mapping).forEach(function (key) {
      //key = parseInt(key, 10)
      getPromises(promises, mapping[key], key, every);
    });
  } else if (type === 'array') {
    (function () {
      var key = void 0;
      mapping.forEach(function (sample) {
        // key is deliberately undefined
        getPromises(promises, sample, key, every);
      });
    })();
  }

  return new Promise(function (resolve) {
    Promise.all(promises).then(function (values) {
      if (type === 'object') {
        mapping = {};
        values.forEach(function (value) {
          mapping[value.id] = value.buffer;
        });
        resolve(mapping);
      } else if (type === 'array') {
        resolve(values);
      }
    });
  });
}

function parseSamples() {
  for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
    data[_key] = arguments[_key];
  }

  if (data.length === 1 && (0, _util.typeString)(data[0]) !== 'string') {
    return parseSamples2(data[0]);
  }
  return parseSamples2(data);
}
},{"./init_audio":7,"./util":29,"isomorphic-fetch":2}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTimeEvents = parseTimeEvents;
exports.parseEvents = parseEvents;
exports.parseMIDINotes = parseMIDINotes;
exports.filterEvents = filterEvents;

var _util = require('./util');

var _midi_note = require('./midi_note');

var ppq = void 0,
    bpm = void 0,
    factor = void 0,
    nominator = void 0,
    denominator = void 0,
    playbackSpeed = void 0,
    bar = void 0,
    beat = void 0,
    sixteenth = void 0,
    tick = void 0,
    ticks = void 0,
    millis = void 0,
    millisPerTick = void 0,
    secondsPerTick = void 0,
    ticksPerBeat = void 0,
    ticksPerBar = void 0,
    ticksPerSixteenth = void 0,
    numSixteenth = void 0,
    diffTicks = void 0;
//previousEvent

function setTickDuration() {
  secondsPerTick = 1 / playbackSpeed * 60 / bpm / ppq;
  millisPerTick = secondsPerTick * 1000;
  //console.log(millisPerTick, bpm, ppq, playbackSpeed, (ppq * millisPerTick));
  //console.log(ppq);
}

function setTicksPerBeat() {
  factor = 4 / denominator;
  numSixteenth = factor * 4;
  ticksPerBeat = ppq * factor;
  ticksPerBar = ticksPerBeat * nominator;
  ticksPerSixteenth = ppq / 4;
  //console.log(denominator, factor, numSixteenth, ticksPerBeat, ticksPerBar, ticksPerSixteenth);
}

function updatePosition(event) {
  var fast = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  diffTicks = event.ticks - ticks;
  // if(diffTicks < 0){
  //   console.log(diffTicks, event.ticks, previousEvent.ticks, previousEvent.type)
  // }
  tick += diffTicks;
  ticks = event.ticks;
  //previousEvent = event
  //console.log(diffTicks, millisPerTick);
  millis += diffTicks * millisPerTick;

  if (fast === false) {
    while (tick >= ticksPerSixteenth) {
      sixteenth++;
      tick -= ticksPerSixteenth;
      while (sixteenth > numSixteenth) {
        sixteenth -= numSixteenth;
        beat++;
        while (beat > nominator) {
          beat -= nominator;
          bar++;
        }
      }
    }
  }
}

function parseTimeEvents(settings, timeEvents) {
  var isPlaying = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  //console.log('parse time events')
  var type = void 0;
  var event = void 0;

  ppq = settings.ppq;
  bpm = settings.bpm;
  nominator = settings.nominator;
  denominator = settings.denominator;
  playbackSpeed = settings.playbackSpeed;
  bar = 1;
  beat = 1;
  sixteenth = 1;
  tick = 0;
  ticks = 0;
  millis = 0;

  setTickDuration();
  setTicksPerBeat();

  timeEvents.sort(function (a, b) {
    return a.ticks <= b.ticks ? -1 : 1;
  });
  var e = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = timeEvents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      event = _step.value;

      //console.log(e++, event.ticks, event.type)
      //event.song = song;
      type = event.type;
      updatePosition(event, isPlaying);

      switch (type) {

        case 0x51:
          bpm = event.data1;
          //console.log(event)
          setTickDuration();
          break;

        case 0x58:
          nominator = event.data1;
          denominator = event.data2;
          setTicksPerBeat();
          break;

        default:
          continue;
      }

      //time data of time event is valid from (and included) the position of the time event
      updateEvent(event, isPlaying);
      //console.log(event.barsAsString);
    }

    //song.lastEventTmp = event;
    //console.log(event);
    //console.log(timeEvents);
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

//export function parseEvents(song, events){
function parseEvents(events) {
  var isPlaying = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  //console.log('parseEvents')
  var event = void 0;
  var startEvent = 0;
  var lastEventTick = 0;
  var result = [];

  tick = 0;
  ticks = 0;
  diffTicks = 0;

  //let events = [].concat(evts, song._timeEvents);
  var numEvents = events.length;
  //console.log(events)

  // noteoff comes before noteon

  /*
    events.sort(function(a, b){
      return a.sortIndex - b.sortIndex;
    })
  */

  events.sort(function (a, b) {
    if (a.ticks === b.ticks) {
      // if(a.type === 128){
      //   return -1
      // }else if(b.type === 128){
      //   return 1
      // }
      // short:
      var r = a.type - b.type;
      if (a.type === 176 && b.type === 144) {
        r = -1;
      }
      return r;
    }
    return a.ticks - b.ticks;
  });
  event = events[0];
  //console.log(event)

  bpm = event.bpm;
  factor = event.factor;
  nominator = event.nominator;
  denominator = event.denominator;

  ticksPerBar = event.ticksPerBar;
  ticksPerBeat = event.ticksPerBeat;
  ticksPerSixteenth = event.ticksPerSixteenth;

  numSixteenth = event.numSixteenth;

  millisPerTick = event.millisPerTick;
  secondsPerTick = event.secondsPerTick;

  millis = event.millis;

  bar = event.bar;
  beat = event.beat;
  sixteenth = event.sixteenth;
  tick = event.tick;

  for (var i = startEvent; i < numEvents; i++) {

    event = events[i];

    switch (event.type) {

      case 0x51:
        bpm = event.data1;
        millis = event.millis;
        millisPerTick = event.millisPerTick;
        secondsPerTick = event.secondsPerTick;

        diffTicks = event.ticks - ticks;
        tick += diffTicks;
        ticks = event.ticks;
        //console.log(millisPerTick,event.millisPerTick);
        //console.log(event);
        break;

      case 0x58:
        factor = event.factor;
        nominator = event.data1;
        denominator = event.data2;
        numSixteenth = event.numSixteenth;
        ticksPerBar = event.ticksPerBar;
        ticksPerBeat = event.ticksPerBeat;
        ticksPerSixteenth = event.ticksPerSixteenth;
        millis = event.millis;

        diffTicks = event.ticks - ticks;
        tick += diffTicks;
        ticks = event.ticks;
        //console.log(nominator,numSixteenth,ticksPerSixteenth);
        //console.log(event);

        break;

      default:
        //case 128:
        //case 144:
        updatePosition(event, isPlaying);
        updateEvent(event, isPlaying);
        result.push(event);

      // if(event.type === 176 && event.data1 === 64){
      //   console.log(event.data2, event.barsAsString)
      // }

    }

    // if(i < 100 && (event.type === 81 || event.type === 144 || event.type === 128)){
    //   //console.log(i, ticks, diffTicks, millis, millisPerTick)
    //   console.log(event.type, event.millis, 'note', event.data1, 'velo', event.data2)
    // }

    lastEventTick = event.ticks;
  }
  parseMIDINotes(result);
  return result;
  //song.lastEventTmp = event;
}

function updateEvent(event) {
  var fast = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  //console.log(bar, beat, ticks)
  //console.log(event, bpm, millisPerTick, ticks, millis);

  event.bpm = bpm;
  event.nominator = nominator;
  event.denominator = denominator;

  event.ticksPerBar = ticksPerBar;
  event.ticksPerBeat = ticksPerBeat;
  event.ticksPerSixteenth = ticksPerSixteenth;

  event.factor = factor;
  event.numSixteenth = numSixteenth;
  event.secondsPerTick = secondsPerTick;
  event.millisPerTick = millisPerTick;

  event.ticks = ticks;

  event.millis = millis;
  event.seconds = millis / 1000;

  if (fast) {
    return;
  }

  event.bar = bar;
  event.beat = beat;
  event.sixteenth = sixteenth;
  event.tick = tick;
  //event.barsAsString = (bar + 1) + ':' + (beat + 1) + ':' + (sixteenth + 1) + ':' + tick;
  var tickAsString = tick === 0 ? '000' : tick < 10 ? '00' + tick : tick < 100 ? '0' + tick : tick;
  event.barsAsString = bar + ':' + beat + ':' + sixteenth + ':' + tickAsString;
  event.barsAsArray = [bar, beat, sixteenth, tick];

  var timeData = (0, _util.getNiceTime)(millis);

  event.hour = timeData.hour;
  event.minute = timeData.minute;
  event.second = timeData.second;
  event.millisecond = timeData.millisecond;
  event.timeAsString = timeData.timeAsString;
  event.timeAsArray = timeData.timeAsArray;

  // if(millis < 0){
  //   console.log(event)
  // }
}

var midiNoteIndex = 0;

function parseMIDINotes(events) {
  var notes = {};
  var notesInTrack = void 0;
  var n = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = events[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var event = _step2.value;

      if (typeof event._part === 'undefined' || typeof event._track === 'undefined') {
        console.log('no part and/or track set');
        continue;
      }
      if (event.type === 144) {
        notesInTrack = notes[event._track.id];
        if (typeof notesInTrack === 'undefined') {
          notesInTrack = notes[event._track.id] = {};
        }
        notesInTrack[event.data1] = event;
      } else if (event.type === 128) {
        notesInTrack = notes[event._track.id];
        if (typeof notesInTrack === 'undefined') {
          //console.info(n++, 'no corresponding noteon event found for event', event.id)
          continue;
        }
        var noteOn = notesInTrack[event.data1];
        var noteOff = event;
        if (typeof noteOn === 'undefined') {
          //console.info(n++, 'no noteon event for event', event.id)
          delete notes[event._track.id][event.data1];
          continue;
        }
        var note = new _midi_note.MIDINote(noteOn, noteOff);
        note = null;
        // let id = `MN_${midiNoteIndex++}_${new Date().getTime()}`
        // noteOn.midiNoteId = id
        // noteOn.off = noteOff.id
        // noteOff.midiNoteId = id
        // noteOff.on = noteOn.id
        delete notes[event._track.id][event.data1];
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  Object.keys(notes).forEach(function (key) {
    delete notes[key];
  });
  notes = {};
  //console.log(notes, notesInTrack)
}

// not in use!
function filterEvents(events) {
  var sustain = {};
  var tmpResult = {};
  var result = [];
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = events[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var event = _step3.value;

      if (event.type === 176 && event.data1 === 64) {
        if (event.data2 === 0) {
          if (typeof sustain[event.trackId] === 'undefined') {
            continue;
          } else if (sustain[event.trackId] === event.ticks) {
            delete tmpResult[event.ticks];
            continue;
          }
          tmpResult[event.ticks] = event;
          delete sustain[event.trackId];
        } else if (event.data2 === 127) {
          sustain[event.trackId] = event.ticks;
          tmpResult[event.ticks] = event;
        }
      } else {
        result.push(event);
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  console.log(sustain);
  Object.keys(tmpResult).forEach(function (key) {
    var sustainEvent = tmpResult[key];
    console.log(sustainEvent);
    result.push(sustainEvent);
  });
  return result;
}
},{"./midi_note":12,"./util":29}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Part = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // @ flow

var _util = require('./util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var partIndex = 0;

var Part = exports.Part = function () {
  function Part() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    _classCallCheck(this, Part);

    this.id = 'MP_' + partIndex++ + '_' + new Date().getTime();
    this.name = name || this.id;
    this.muted = false;
    this._track = null;
    this._song = null;
    this._events = [];
    this._eventsById = new Map();
    this._needsUpdate = false;
    this._createEventArray = false;
    this._start = { millis: 0, ticks: 0 };
    this._end = { millis: 0, ticks: 0 };
  }

  _createClass(Part, [{
    key: 'copy',
    value: function copy() {
      var p = new Part(this.name + '_copy'); // implement getNameOfCopy() in util (see heartbeat)
      var events = [];
      this._events.forEach(function (event) {
        var copy = event.copy();
        console.log(copy);
        events.push(copy);
      });
      p.addEvents.apply(p, events);
      p.update();
      return p;
    }
  }, {
    key: 'transpose',
    value: function transpose(amount) {
      this._events.forEach(function (event) {
        event.transpose(amount);
      });
      this._needsUpdate = true;
    }
  }, {
    key: 'move',
    value: function move(ticks) {
      this._events.forEach(function (event) {
        event.move(ticks);
      });
      if (this._song) {
        var _song$_movedEvents;

        (_song$_movedEvents = this._song._movedEvents).push.apply(_song$_movedEvents, _toConsumableArray(this._events));
      }
      this._needsUpdate = true;
    }
  }, {
    key: 'moveTo',
    value: function moveTo(ticks) {
      this._events.forEach(function (event) {
        event.moveTo(ticks);
      });
      if (this._song) {
        var _song$_movedEvents2;

        (_song$_movedEvents2 = this._song._movedEvents).push.apply(_song$_movedEvents2, _toConsumableArray(this._events));
      }
      this._needsUpdate = true;
    }
  }, {
    key: 'addEvents',
    value: function addEvents() {
      var _this = this;

      //console.log(events)
      var track = this._track;

      for (var _len = arguments.length, events = Array(_len), _key = 0; _key < _len; _key++) {
        events[_key] = arguments[_key];
      }

      events.forEach(function (event) {
        event._part = _this;
        _this._eventsById.set(event.id, event);
        _this._events.push(event);
        if (track) {
          event._track = track;
        }
      });
      if (track) {
        var _track$_events;

        (_track$_events = track._events).push.apply(_track$_events, events);
        track._needsUpdate = true;
      }
      if (this._song) {
        var _song$_newEvents;

        (_song$_newEvents = this._song._newEvents).push.apply(_song$_newEvents, events);
      }
      this._needsUpdate = true;
    }
  }, {
    key: 'removeEvents',
    value: function removeEvents() {
      var _this2 = this;

      var track = this._track;

      for (var _len2 = arguments.length, events = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        events[_key2] = arguments[_key2];
      }

      events.forEach(function (event) {
        event._part = null;
        _this2._eventsById.delete(event.id);
        if (track) {
          event._track = null;
          track._eventsById.delete(event.id);
        }
      });
      if (track) {
        track._needsUpdate = true;
        track._createEventArray = true;
      }
      if (this._song) {
        var _song$_removedEvents;

        (_song$_removedEvents = this._song._removedEvents).push.apply(_song$_removedEvents, events);
      }
      this._createEventArray = true;
      this._needsUpdate = true;
    }
  }, {
    key: 'moveEvents',
    value: function moveEvents(ticks) {
      for (var _len3 = arguments.length, events = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        events[_key3 - 1] = arguments[_key3];
      }

      events.forEach(function (event) {
        event.move(ticks);
      });
      if (this._song) {
        var _song$_movedEvents3;

        (_song$_movedEvents3 = this._song._movedEvents).push.apply(_song$_movedEvents3, _toConsumableArray(this._events));
      }
      this._needsUpdate = true;
    }
  }, {
    key: 'moveEventsTo',
    value: function moveEventsTo(ticks) {
      for (var _len4 = arguments.length, events = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        events[_key4 - 1] = arguments[_key4];
      }

      events.forEach(function (event) {
        event.moveTo(ticks);
      });
      if (this._song) {
        var _song$_movedEvents4;

        (_song$_movedEvents4 = this._song._movedEvents).push.apply(_song$_movedEvents4, _toConsumableArray(this._events));
      }
      this._needsUpdate = true;
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      // can be use as findEvents
      if (this._needsUpdate) {
        this.update();
      }
      return [].concat(_toConsumableArray(this._events)); //@TODO implement filter -> filterEvents() should be a utility function (not a class method)
    }
  }, {
    key: 'mute',
    value: function mute() {
      var flag = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (flag) {
        this.muted = flag;
      } else {
        this.muted = !this.muted;
      }
    }
  }, {
    key: 'update',
    value: function update() {
      if (this._needsUpdate === false) {
        return;
      }
      if (this._createEventArray) {
        this._events = Array.from(this._eventsById.values());
        this._createEventArray = false;
      }
      (0, _util.sortEvents)(this._events);
      this._needsUpdate = false;
      //@TODO: calculate part start and end, and highest and lowest note
    }
  }]);

  return Part;
}();
},{"./util":29}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Playhead = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _position = require('./position.js');

var _eventlistener = require('./eventlistener.js');

var _util = require('./util.js');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var range = 10; // milliseconds or ticks
var instanceId = 0;

var Playhead = exports.Playhead = function () {
  function Playhead(song) {
    var type = arguments.length <= 1 || arguments[1] === undefined ? 'all' : arguments[1];

    _classCallCheck(this, Playhead);

    this.id = 'POS ' + instanceId++ + ' ' + new Date().getTime();
    this.song = song;
    this.type = type;
    this.lastEvent = null;
    this.data = {};

    this.activeParts = [];
    this.activeNotes = [];
    this.activeEvents = [];
  }

  // unit can be 'millis' or 'ticks'


  _createClass(Playhead, [{
    key: 'set',
    value: function set(unit, value) {
      this.unit = unit;
      this.currentValue = value;
      this.eventIndex = 0;
      this.noteIndex = 0;
      this.partIndex = 0;
      this.calculate();
      return this.data;
    }
  }, {
    key: 'get',
    value: function get() {
      return this.data;
    }
  }, {
    key: 'update',
    value: function update(unit, diff) {
      if (diff === 0) {
        return this.data;
      }
      this.unit = unit;
      this.currentValue += diff;
      this.calculate();
      return this.data;
    }
  }, {
    key: 'updateSong',
    value: function updateSong() {
      this.events = [].concat(_toConsumableArray(this.song._events), _toConsumableArray(this.song._timeEvents));
      (0, _util.sortEvents)(this.events);
      //console.log('events %O', this.events)
      this.notes = this.song._notes;
      this.parts = this.song._parts;
      this.numEvents = this.events.length;
      this.numNotes = this.notes.length;
      this.numParts = this.parts.length;
      this.set('millis', this.song._millis);
    }
  }, {
    key: 'calculate',
    value: function calculate() {
      var i = void 0;
      var value = void 0;
      var event = void 0;
      var note = void 0;
      var part = void 0;
      var position = void 0;
      var stillActiveNotes = [];
      var stillActiveParts = [];
      var collectedParts = new Set();
      var collectedNotes = new Set();

      this.data = {};
      this.activeEvents = [];

      for (i = this.eventIndex; i < this.numEvents; i++) {
        event = this.events[i];
        value = event[this.unit];
        if (value <= this.currentValue) {
          // if the playhead is set to a position of say 3000 millis, we don't want to add events more that 10 units before the playhead
          if (value === 0 || value > this.currentValue - range) {
            this.activeEvents.push(event);
            // this doesn't work too well
            if (event.type === 176) {
              //console.log(event.type, event.data1, event.data2)
              if (event.data1 === 64) {
                (0, _eventlistener.dispatchEvent)({
                  type: 'sustainpedal2',
                  data: event.data2 === 127 ? 'down' : 'up'
                });
              }
              // }else{
              //   dispatchEvent({
              //     type: 'event',
              //     data: event
              //   })
            }

            (0, _eventlistener.dispatchEvent)({
              type: 'event',
              data: event
            });
          }
          this.lastEvent = event;
          this.eventIndex++;
        } else {
          break;
        }
      }
      //console.log('-----------------')
      this.data.activeEvents = this.activeEvents;

      // if a song has no events yet, use the first time event as reference
      if (this.lastEvent === null) {
        this.lastEvent = this.song._timeEvents[0];
      }

      position = (0, _position.getPosition2)(this.song, this.unit, this.currentValue, 'all', this.lastEvent);
      this.data.eventIndex = this.eventIndex;
      this.data.millis = position.millis;
      this.data.ticks = position.ticks;
      this.data.position = position;

      if (this.type.indexOf('all') !== -1) {
        var data = this.data;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(position)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            data[key] = position[key];
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      } else if (this.type.indexOf('barsbeats') !== -1) {
        this.data.bar = position.bar;
        this.data.beat = position.beat;
        this.data.sixteenth = position.sixteenth;
        this.data.tick = position.tick;
        this.data.barsAsString = position.barsAsString;

        this.data.ticksPerBar = position.ticksPerBar;
        this.data.ticksPerBeat = position.ticksPerBeat;
        this.data.ticksPerSixteenth = position.ticksPerSixteenth;
        this.data.numSixteenth = position.numSixteenth;
      } else if (this.type.indexOf('time') !== -1) {
        this.data.hour = position.hour;
        this.data.minute = position.minute;
        this.data.second = position.second;
        this.data.millisecond = position.millisecond;
        this.data.timeAsString = position.timeAsString;
      } else if (this.type.indexOf('percentage') !== -1) {
        this.data.percentage = position.percentage;
      }

      // get active notes
      if (this.type.indexOf('notes') !== -1 || this.type.indexOf('all') !== -1) {

        // get all notes between the noteIndex and the current playhead position
        for (i = this.noteIndex; i < this.numNotes; i++) {
          note = this.notes[i];
          value = note.noteOn[this.unit];
          if (value <= this.currentValue) {
            this.noteIndex++;
            if (typeof note.noteOff === 'undefined') {
              continue;
            }
            // if the playhead is set to a position of say 3000 millis, we don't want to add notes before the playhead
            if (this.currentValue === 0 || note.noteOff[this.unit] > this.currentValue) {
              collectedNotes.add(note);
              (0, _eventlistener.dispatchEvent)({
                type: 'noteOn',
                data: note
              });
            }
          } else {
            break;
          }
        }

        // filter notes that are no longer active
        for (i = this.activeNotes.length - 1; i >= 0; i--) {
          note = this.activeNotes[i];
          //if(note.noteOn.state.indexOf('removed') === 0 || this.song._notesById.get(note.id) === false){
          if (this.song._notesById.get(note.id) === false) {
            //console.log('skipping removed note', note.id);
            continue;
          }

          if (typeof note.noteOff === 'undefined') {
            console.warn('note with id', note.id, 'has no noteOff event');
            continue;
          }

          //if(note.noteOff[this.unit] > this.currentValue && collectedNotes.has(note) === false){
          if (note.noteOff[this.unit] > this.currentValue) {
            stillActiveNotes.push(note);
          } else {
            (0, _eventlistener.dispatchEvent)({
              type: 'noteOff',
              data: note
            });
          }
        }

        // add the still active notes and the newly active events to the active notes array
        this.activeNotes = [].concat(_toConsumableArray(collectedNotes.values()), stillActiveNotes);
        this.data.activeNotes = this.activeNotes;
      }

      // get active parts
      if (this.type.indexOf('parts') !== -1 || this.type.indexOf('all') !== -1) {

        for (i = this.partIndex; i < this.numParts; i++) {
          part = this.parts[i];
          //console.log(part, this.unit, this.currentValue);
          if (part._start[this.unit] <= this.currentValue) {
            collectedParts.add(part);
            (0, _eventlistener.dispatchEvent)({
              type: 'partOn',
              data: part
            });
            this.partIndex++;
          } else {
            break;
          }
        }

        // filter parts that are no longer active
        for (i = this.activeParts.length - 1; i >= 0; i--) {
          part = this.activeParts[i];
          //if(part.state.indexOf('removed') === 0 || this.song._partsById.get(part.id) === false){
          if (this.song._partsById.get(part.id) === false) {
            //console.log('skipping removed part', part.id);
            continue;
          }

          //if(part._end[this.unit] > this.currentValue && collectedParts.has(part) === false){
          if (part._end[this.unit] > this.currentValue) {
            stillActiveParts.push(note);
          } else {
            (0, _eventlistener.dispatchEvent)({
              type: 'partOff',
              data: part
            });
          }
        }

        this.activeParts = [].concat(_toConsumableArray(collectedParts.values()), stillActiveParts);
        this.data.activeParts = this.activeParts;
      }

      (0, _eventlistener.dispatchEvent)({
        type: 'position',
        data: this.data
      });
    }

    /*
      setType(t){
        this.type = t;
        this.set(this.unit, this.currentValue);
        //console.log(type,activeParts);
      }
    
    
      addType(t){
        this.type += ' ' + t;
        this.set(this.unit, this.currentValue);
        //console.log(type,activeParts);
      }
    
      removeType(t){
        var arr = this.type.split(' ');
        this.type = '';
        arr.forEach(function(type){
          if(type !== t){
            this.type += t + ' ';
          }
        });
        this.type.trim();
        this.set(this.currentValue);
        //console.log(type,activeParts);
      }
    */

  }]);

  return Playhead;
}();
},{"./eventlistener.js":4,"./position.js":20,"./util.js":29}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.millisToTicks = millisToTicks;
exports.ticksToMillis = ticksToMillis;
exports.barsToMillis = barsToMillis;
exports.barsToTicks = barsToTicks;
exports.ticksToBars = ticksToBars;
exports.millisToBars = millisToBars;
exports.getPosition2 = getPosition2;
exports.calculatePosition = calculatePosition;

var _util = require('./util');

var supportedTypes = 'barsandbeats barsbeats time millis ticks perc percentage',
    supportedReturnTypes = 'barsandbeats barsbeats time millis ticks all',
    floor = Math.floor,
    round = Math.round;

var
//local
bpm = void 0,
    nominator = void 0,
    denominator = void 0,
    ticksPerBeat = void 0,
    ticksPerBar = void 0,
    ticksPerSixteenth = void 0,
    millisPerTick = void 0,
    secondsPerTick = void 0,
    numSixteenth = void 0,
    ticks = void 0,
    millis = void 0,
    diffTicks = void 0,
    diffMillis = void 0,
    bar = void 0,
    beat = void 0,
    sixteenth = void 0,
    tick = void 0,


//  type,
index = void 0,
    returnType = 'all',
    beyondEndOfSong = true;

function getTimeEvent(song, unit, target) {
  // finds the time event that comes the closest before the target position
  var timeEvents = song._timeEvents;

  for (var i = timeEvents.length - 1; i >= 0; i--) {
    var event = timeEvents[i];
    //console.log(unit, target, event)
    if (event[unit] <= target) {
      index = i;
      return event;
    }
  }
  return null;
}

function millisToTicks(song, targetMillis) {
  var beos = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  beyondEndOfSong = beos;
  fromMillis(song, targetMillis);
  //return round(ticks);
  return ticks;
}

function ticksToMillis(song, targetTicks) {
  var beos = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  beyondEndOfSong = beos;
  fromTicks(song, targetTicks);
  return millis;
}

function barsToMillis(song, position, beos) {
  // beos = beyondEndOfSong
  calculatePosition(song, {
    type: 'barsbeat',
    position: position,
    result: 'millis',
    beos: beos
  });
  return millis;
}

function barsToTicks(song, position, beos) {
  // beos = beyondEndOfSong
  calculatePosition(song, {
    type: 'barsbeats',
    position: position,
    result: 'ticks',
    beos: beos
  });
  //return round(ticks);
  return ticks;
}

function ticksToBars(song, target) {
  var beos = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  beyondEndOfSong = beos;
  fromTicks(song, target);
  calculateBarsAndBeats();
  returnType = 'barsandbeats';
  return getPositionData();
}

function millisToBars(song, target) {
  var beos = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  beyondEndOfSong = beos;
  fromMillis(song, target);
  calculateBarsAndBeats();
  returnType = 'barsandbeats';
  return getPositionData();
}

// main calculation function for millis position
function fromMillis(song, targetMillis, event) {
  var lastEvent = song._lastEvent;

  if (beyondEndOfSong === false) {
    if (targetMillis > lastEvent.millis) {
      targetMillis = lastEvent.millis;
    }
  }

  if (typeof event === 'undefined') {
    event = getTimeEvent(song, 'millis', targetMillis);
  }
  //console.log(event)
  getDataFromEvent(event);

  // if the event is not exactly at target millis, calculate the diff
  if (event.millis === targetMillis) {
    diffMillis = 0;
    diffTicks = 0;
  } else {
    diffMillis = targetMillis - event.millis;
    diffTicks = diffMillis / millisPerTick;
  }

  millis += diffMillis;
  ticks += diffTicks;

  return ticks;
}

// main calculation function for ticks position
function fromTicks(song, targetTicks, event) {
  var lastEvent = song._lastEvent;

  if (beyondEndOfSong === false) {
    if (targetTicks > lastEvent.ticks) {
      targetTicks = lastEvent.ticks;
    }
  }

  if (typeof event === 'undefined') {
    event = getTimeEvent(song, 'ticks', targetTicks);
  }
  //console.log(event)
  getDataFromEvent(event);

  // if the event is not exactly at target ticks, calculate the diff
  if (event.ticks === targetTicks) {
    diffTicks = 0;
    diffMillis = 0;
  } else {
    diffTicks = targetTicks - ticks;
    diffMillis = diffTicks * millisPerTick;
  }

  ticks += diffTicks;
  millis += diffMillis;

  return millis;
}

// main calculation function for bars and beats position
function fromBars(song, targetBar, targetBeat, targetSixteenth, targetTick) {
  var event = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

  //console.time('fromBars');
  var i = 0,
      diffBars = void 0,
      diffBeats = void 0,
      diffSixteenth = void 0,
      diffTick = void 0,
      lastEvent = song._lastEvent;

  if (beyondEndOfSong === false) {
    if (targetBar > lastEvent.bar) {
      targetBar = lastEvent.bar;
    }
  }

  if (event === null) {
    event = getTimeEvent(song, 'bar', targetBar);
  }
  //console.log(event)
  getDataFromEvent(event);

  //correct wrong position data, for instance: '3,3,2,788' becomes '3,4,4,068' in a 4/4 measure at PPQ 480
  while (targetTick >= ticksPerSixteenth) {
    targetSixteenth++;
    targetTick -= ticksPerSixteenth;
  }

  while (targetSixteenth > numSixteenth) {
    targetBeat++;
    targetSixteenth -= numSixteenth;
  }

  while (targetBeat > nominator) {
    targetBar++;
    targetBeat -= nominator;
  }

  event = getTimeEvent(song, 'bar', targetBar, index);
  for (i = index; i >= 0; i--) {
    event = song._timeEvents[i];
    if (event.bar <= targetBar) {
      getDataFromEvent(event);
      break;
    }
  }

  // get the differences
  diffTick = targetTick - tick;
  diffSixteenth = targetSixteenth - sixteenth;
  diffBeats = targetBeat - beat;
  diffBars = targetBar - bar; //bar is always less then or equal to targetBar, so diffBars is always >= 0

  //console.log('diff',diffBars,diffBeats,diffSixteenth,diffTick);
  //console.log('millis',millis,ticksPerBar,ticksPerBeat,ticksPerSixteenth,millisPerTick);

  // convert differences to milliseconds and ticks
  diffMillis = diffBars * ticksPerBar * millisPerTick;
  diffMillis += diffBeats * ticksPerBeat * millisPerTick;
  diffMillis += diffSixteenth * ticksPerSixteenth * millisPerTick;
  diffMillis += diffTick * millisPerTick;
  diffTicks = diffMillis / millisPerTick;
  //console.log(diffBars, ticksPerBar, millisPerTick, diffMillis, diffTicks);

  // set all current position data
  bar = targetBar;
  beat = targetBeat;
  sixteenth = targetSixteenth;
  tick = targetTick;
  //console.log(tick, targetTick)

  millis += diffMillis;
  //console.log(targetBar, targetBeat, targetSixteenth, targetTick, ' -> ', millis);
  ticks += diffTicks;

  //console.timeEnd('fromBars');
}

function calculateBarsAndBeats() {
  // spread the difference in tick over bars, beats and sixteenth
  var tmp = round(diffTicks);
  while (tmp >= ticksPerSixteenth) {
    sixteenth++;
    tmp -= ticksPerSixteenth;
    while (sixteenth > numSixteenth) {
      sixteenth -= numSixteenth;
      beat++;
      while (beat > nominator) {
        beat -= nominator;
        bar++;
      }
    }
  }
  tick = round(tmp);
}

// store properties of event in local scope
function getDataFromEvent(event) {

  bpm = event.bpm;
  nominator = event.nominator;
  denominator = event.denominator;

  ticksPerBar = event.ticksPerBar;
  ticksPerBeat = event.ticksPerBeat;
  ticksPerSixteenth = event.ticksPerSixteenth;
  numSixteenth = event.numSixteenth;
  millisPerTick = event.millisPerTick;
  secondsPerTick = event.secondsPerTick;

  bar = event.bar;
  beat = event.beat;
  sixteenth = event.sixteenth;
  tick = event.tick;

  ticks = event.ticks;
  millis = event.millis;

  //console.log(bpm, event.type);
  //console.log('ticks', ticks, 'millis', millis, 'bar', bar);
}

function getPositionData(song) {
  var timeData = void 0,
      positionData = {};

  switch (returnType) {

    case 'millis':
      //positionData.millis = millis;
      positionData.millis = round(millis * 1000) / 1000;
      positionData.millisRounded = round(millis);
      break;

    case 'ticks':
      //positionData.ticks = ticks;
      positionData.ticks = round(ticks);
      //positionData.ticksUnrounded = ticks;
      break;

    case 'barsbeats':
    case 'barsandbeats':
      positionData.bar = bar;
      positionData.beat = beat;
      positionData.sixteenth = sixteenth;
      positionData.tick = tick;
      //positionData.barsAsString = (bar + 1) + ':' + (beat + 1) + ':' + (sixteenth + 1) + ':' + tickAsString;
      positionData.barsAsString = bar + ':' + beat + ':' + sixteenth + ':' + getTickAsString(tick);
      break;

    case 'time':
      timeData = (0, _util.getNiceTime)(millis);
      positionData.hour = timeData.hour;
      positionData.minute = timeData.minute;
      positionData.second = timeData.second;
      positionData.millisecond = timeData.millisecond;
      positionData.timeAsString = timeData.timeAsString;
      break;

    case 'all':
      // millis
      //positionData.millis = millis;
      positionData.millis = round(millis * 1000) / 1000;
      positionData.millisRounded = round(millis);

      // ticks
      //positionData.ticks = ticks;
      positionData.ticks = round(ticks);
      //positionData.ticksUnrounded = ticks;

      // barsbeats
      positionData.bar = bar;
      positionData.beat = beat;
      positionData.sixteenth = sixteenth;
      positionData.tick = tick;
      //positionData.barsAsString = (bar + 1) + ':' + (beat + 1) + ':' + (sixteenth + 1) + ':' + tickAsString;
      positionData.barsAsString = bar + ':' + beat + ':' + sixteenth + ':' + getTickAsString(tick);

      // time
      timeData = (0, _util.getNiceTime)(millis);
      positionData.hour = timeData.hour;
      positionData.minute = timeData.minute;
      positionData.second = timeData.second;
      positionData.millisecond = timeData.millisecond;
      positionData.timeAsString = timeData.timeAsString;

      // extra data
      positionData.bpm = round(bpm * song.playbackSpeed, 3);
      positionData.nominator = nominator;
      positionData.denominator = denominator;

      positionData.ticksPerBar = ticksPerBar;
      positionData.ticksPerBeat = ticksPerBeat;
      positionData.ticksPerSixteenth = ticksPerSixteenth;

      positionData.numSixteenth = numSixteenth;
      positionData.millisPerTick = millisPerTick;
      positionData.secondsPerTick = secondsPerTick;

      // use ticks to make tempo changes visible by a faster moving playhead
      positionData.percentage = ticks / song._durationTicks;
      //positionData.percentage = millis / song.durationMillis;
      break;
    default:
      return null;
  }

  return positionData;
}

function getTickAsString(t) {
  if (t === 0) {
    t = '000';
  } else if (t < 10) {
    t = '00' + t;
  } else if (t < 100) {
    t = '0' + t;
  }
  return t;
}

// used by playhead
function getPosition2(song, unit, target, type, event) {
  if (unit === 'millis') {
    fromMillis(song, target, event);
  } else if (unit === 'ticks') {
    fromTicks(song, target, event);
  }
  returnType = type;
  if (returnType === 'all') {
    calculateBarsAndBeats();
  }
  return getPositionData(song);
}

// improved version of getPosition
function calculatePosition(song, settings) {
  var type = settings.type;
  var // any of barsandbeats barsbeats time millis ticks perc percentage
  target = settings.target;
  var _settings$result = settings.result;
  var result = _settings$result === undefined ? 'all' : _settings$result;
  var _settings$beos = settings.beos;
  var beos = _settings$beos === undefined ? true : _settings$beos;
  var _settings$snap = settings.snap;
  var snap = _settings$snap === undefined ? -1 : _settings$snap;


  if (supportedReturnTypes.indexOf(result) === -1) {
    console.warn('unsupported return type, \'all\' used instead of \'' + result + '\'');
    result = 'all';
  }

  returnType = result;
  beyondEndOfSong = beos;

  if (supportedTypes.indexOf(type) === -1) {
    console.error('unsupported type ' + type);
    return false;
  }

  switch (type) {

    case 'barsbeats':
    case 'barsandbeats':
      var _target = _slicedToArray(target, 4);

      var _target$ = _target[0];
      var targetbar = _target$ === undefined ? 1 : _target$;
      var _target$2 = _target[1];
      var targetbeat = _target$2 === undefined ? 1 : _target$2;
      var _target$3 = _target[2];
      var targetsixteenth = _target$3 === undefined ? 1 : _target$3;
      var _target$4 = _target[3];
      var targettick = _target$4 === undefined ? 0 : _target$4;
      //console.log(targetbar, targetbeat, targetsixteenth, targettick)

      fromBars(song, targetbar, targetbeat, targetsixteenth, targettick);
      return getPositionData(song);

    case 'time':
      // calculate millis out of time array: hours, minutes, seconds, millis

      var _target2 = _slicedToArray(target, 4);

      var _target2$ = _target2[0];
      var targethour = _target2$ === undefined ? 0 : _target2$;
      var _target2$2 = _target2[1];
      var targetminute = _target2$2 === undefined ? 0 : _target2$2;
      var _target2$3 = _target2[2];
      var targetsecond = _target2$3 === undefined ? 0 : _target2$3;
      var _target2$4 = _target2[3];
      var targetmillisecond = _target2$4 === undefined ? 0 : _target2$4;

      var millis = 0;
      millis += targethour * 60 * 60 * 1000; //hours
      millis += targetminute * 60 * 1000; //minutes
      millis += targetsecond * 1000; //seconds
      millis += targetmillisecond; //milliseconds

      fromMillis(song, millis);
      calculateBarsAndBeats();
      return getPositionData(song);

    case 'millis':
      fromMillis(song, target);
      calculateBarsAndBeats();
      return getPositionData(song);

    case 'ticks':
      fromTicks(song, target);
      calculateBarsAndBeats();
      return getPositionData(song);

    case 'perc':
    case 'percentage':

      //millis = position[1] * song.durationMillis;
      //fromMillis(song, millis);
      //console.log(millis);

      ticks = target * song._durationTicks; // target must be in ticks!
      //console.log(ticks, song._durationTicks)
      if (snap !== -1) {
        ticks = floor(ticks / snap) * snap;
        //fromTicks(song, ticks);
        //console.log(ticks);
      }
      fromTicks(song, ticks);
      calculateBarsAndBeats();
      var tmp = getPositionData(song);
      //console.log('diff', position[1] - tmp.percentage);
      return tmp;

    default:
      return false;
  }
}

/*

//@param: 'millis', 1000, [true]
//@param: 'ticks', 1000, [true]
//@param: 'barsandbeats', 1, ['all', true]
//@param: 'barsandbeats', 60, 4, 3, 120, ['all', true]
//@param: 'barsandbeats', 60, 4, 3, 120, [true, 'all']

function checkPosition(type, args, returnType = 'all'){
  beyondEndOfSong = true;
  console.log('----> checkPosition:', args, typeString(args));

  if(typeString(args) === 'array'){
    let
      numArgs = args.length,
      position,
      i, a, positionLength;

    type = args[0];

    // support for [['millis', 3000]]
    if(typeString(args[0]) === 'array'){
      //console.warn('this shouldn\'t happen!');
      args = args[0];
      type = args[0];
      numArgs = args.length;
    }

    position = [type];

    console.log('check position', args, numArgs, supportedTypes.indexOf(type));

    //console.log('arg', 0, '->', type);

    if(supportedTypes.indexOf(type) !== -1){
      for(i = 1; i < numArgs; i++){
        a = args[i];
        //console.log('arg', i, '->', a);
        if(a === true || a === false){
          beyondEndOfSong = a;
        }else if(isNaN(a)){
          if(supportedReturnTypes.indexOf(a) !== -1){
            returnType = a;
          }else{
            return false;
          }
        }else {
          position.push(a);
        }
      }
      //check number of arguments -> either 1 number or 4 numbers in position, e.g. ['barsbeats', 1] or ['barsbeats', 1, 1, 1, 0],
      // or ['perc', 0.56, numberOfTicksToSnapTo]
      positionLength = position.length;
      if(positionLength !== 2 && positionLength !== 3 && positionLength !== 5){
        return false;
      }
      //console.log(position, returnType, beyondEndOfSong);
      //console.log('------------------------------------')
      return position;
    }
  }
  return false;
}


export function getPosition(song, type, args){
  //console.log('getPosition', args);

  if(typeof args === 'undefined'){
    return {
      millis: 0
    }
  }

  let position = checkPosition(type, args),
    millis, tmp, snap;


  if(position === false){
    error('wrong position data');
    return false;
  }

  switch(type){

    case 'barsbeats':
    case 'barsandbeats':
      fromBars(song, position[1], position[2], position[3], position[4]);
      return getPositionData(song);

    case 'time':
      // calculate millis out of time array: hours, minutes, seconds, millis
      millis = 0;
      tmp = position[1] || 0;
      millis += tmp * 60 * 60 * 1000; //hours
      tmp = position[2] || 0;
      millis += tmp * 60 * 1000; //minutes
      tmp = position[3] || 0;
      millis += tmp * 1000; //seconds
      tmp = position[4] || 0;
      millis += tmp; //milliseconds

      fromMillis(song, millis);
      calculateBarsAndBeats();
      return getPositionData(song);

    case 'millis':
      fromMillis(song, position[1]);
      calculateBarsAndBeats();
      return getPositionData(song);

    case 'ticks':
      fromTicks(song, position[1]);
      calculateBarsAndBeats();
      return getPositionData(song);

    case 'perc':
    case 'percentage':
      snap = position[2];

      //millis = position[1] * song.durationMillis;
      //fromMillis(song, millis);
      //console.log(millis);

      ticks = position[1] * song.durationTicks;
      if(snap !== undefined){
        ticks = floor(ticks/snap) * snap;
        //fromTicks(song, ticks);
        //console.log(ticks);
      }
      fromTicks(song, ticks);
      calculateBarsAndBeats();
      tmp = getPositionData(song);
      //console.log('diff', position[1] - tmp.percentage);
      return tmp;
  }
  return false;
}

*/
},{"./util":29}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instrument = exports.Part = exports.Track = exports.Song = exports.MIDINote = exports.MIDIEvent = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.parseMIDIFile = exports.parseSamples = exports.MIDIEventTypes = exports.setBufferTime = exports.init = undefined;

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _part = require('./part');

var _track = require('./track');

var _song = require('./song');

var _instrument = require('./instrument');

var _midifile = require('./midifile');

var _init = require('./init');

var _init_audio = require('./init_audio');

var _init_midi = require('./init_midi');

var _parse_audio = require('./parse_audio');

var _constants = require('./constants');

var _settings = require('./settings');

var getAudioContext = function getAudioContext() {
  return _init_audio.context;
};

var qambi = {
  version: '1.0.0-beta1',

  // from ./init
  init: _init.init,

  // from ./settings
  setBufferTime: _settings.setBufferTime,

  // from ./constants
  MIDIEventTypes: _constants.MIDIEventTypes,

  // from ./util
  parseSamples: _parse_audio.parseSamples,

  // from ./midifile
  parseMIDIFile: _midifile.parseMIDIFile,

  // from ./init_audio
  getAudioContext: getAudioContext,
  getMasterVolume: _init_audio.getMasterVolume,
  setMasterVolume: _init_audio.setMasterVolume,

  // ./init_midi
  getMIDIAccess: _init_midi.getMIDIAccess,
  getMIDIInputs: _init_midi.getMIDIInputs,
  getMIDIOutputs: _init_midi.getMIDIOutputs,
  getMIDIInputIds: _init_midi.getMIDIInputIds,
  getMIDIOutputIds: _init_midi.getMIDIOutputIds,
  getMIDIInputsById: _init_midi.getMIDIInputsById,
  getMIDIOutputsById: _init_midi.getMIDIOutputsById,

  // from ./midi_event
  MIDIEvent: _midi_event.MIDIEvent,

  // from ./midi_note
  MIDINote: _midi_note.MIDINote,

  // from ./song
  Song: _song.Song,

  // from ./track
  Track: _track.Track,

  // from ./part
  Part: _part.Part,

  // from ./instrument
  Instrument: _instrument.Instrument,

  log: function log(id) {
    switch (id) {
      case 'functions':
        console.log('functions:\n          getAudioContext\n          getMasterVolume\n          setMasterVolume\n          getMIDIAccess\n          getMIDIInputs\n          getMIDIOutputs\n          getMIDIInputIds\n          getMIDIOutputIds\n          getMIDIInputsById\n          getMIDIOutputsById\n          parseMIDIFile\n          setBufferTime\n        ');
        break;
      default:
    }
  }
};

exports.default = qambi;
exports.
// from ./init
init = _init.init;
exports.

// from ./settings
setBufferTime = _settings.setBufferTime;
exports.

// from ./constants
MIDIEventTypes = _constants.MIDIEventTypes;
exports.

// from ./util
parseSamples = _parse_audio.parseSamples;
exports.

// from ./midifile
parseMIDIFile = _midifile.parseMIDIFile;
exports.

// from ./init_audio
getAudioContext = getAudioContext;
exports.getMasterVolume = _init_audio.getMasterVolume;
exports.setMasterVolume = _init_audio.setMasterVolume;
exports.

// ./init_midi
getMIDIAccess = _init_midi.getMIDIAccess;
exports.getMIDIInputs = _init_midi.getMIDIInputs;
exports.getMIDIOutputs = _init_midi.getMIDIOutputs;
exports.getMIDIInputIds = _init_midi.getMIDIInputIds;
exports.getMIDIOutputIds = _init_midi.getMIDIOutputIds;
exports.getMIDIInputsById = _init_midi.getMIDIInputsById;
exports.getMIDIOutputsById = _init_midi.getMIDIOutputsById;
exports.

// from ./midi_event
MIDIEvent = _midi_event.MIDIEvent;
exports.

// from ./midi_note
MIDINote = _midi_note.MIDINote;
exports.

// from ./song
Song = _song.Song;
exports.

// from ./track
Track = _track.Track;
exports.

// from ./part
Part = _part.Part;
exports.

// from ./instrument
Instrument = _instrument.Instrument;
},{"./constants":3,"./init":6,"./init_audio":7,"./init_midi":8,"./instrument":9,"./midi_event":11,"./midi_note":12,"./midifile":14,"./parse_audio":16,"./part":18,"./settings":25,"./song":26,"./track":28}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.fadeOut = fadeOut;
exports.createSample = createSample;

var _init_audio = require('./init_audio.js');

var _util = require('./util.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sample = function () {
  function Sample(sampleData, event) {
    _classCallCheck(this, Sample);

    this.event = event;
    this.sampleData = sampleData;

    if (this.sampleData === -1 || typeof this.sampleData.buffer === 'undefined') {
      // create simple synth sample
      this.source = _init_audio.context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency;
    } else {
      this.source = _init_audio.context.createBufferSource();
      this.source.buffer = sampleData.buffer;
      //console.log(this.source.buffer)
    }
    this.output = _init_audio.context.createGain();
    this.volume = event.data2 / 127;
    this.output.gain.value = this.volume;
    this.source.connect(this.output);
    //this.output.connect(context.destination)
  }

  _createClass(Sample, [{
    key: 'start',
    value: function start(time) {
      //console.log(time, this.source);
      this.source.start(time);
    }
  }, {
    key: 'stop',
    value: function stop(time, cb) {
      var _sampleData = this.sampleData;
      var releaseDuration = _sampleData.releaseDuration;
      var releaseEnvelope = _sampleData.releaseEnvelope;
      var releaseEnvelopeArray = _sampleData.releaseEnvelopeArray;

      if (releaseDuration && releaseEnvelope) {
        this.source.stop(time + releaseDuration);
        fadeOut(this.output, {
          releaseDuration: releaseDuration,
          releaseEnvelope: releaseEnvelope,
          releaseEnvelopeArray: releaseEnvelopeArray
        });
      } else {
        this.source.stop(time);
      }

      this.source.onended = cb;
    }
  }]);

  return Sample;
}();

function fadeOut(gainNode, settings) {
  var now = _init_audio.context.currentTime;
  var values = void 0,
      i = void 0,
      maxi = void 0;

  //console.log(settings.releaseEnvelope)
  switch (settings.releaseEnvelope) {

    case 'linear':
      gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + settings.releaseDuration);
      break;

    case 'equal_power':
      values = (0, _util.getEqualPowerCurve)(100, 'fadeOut', gainNode.gain.value);
      gainNode.gain.setValueCurveAtTime(values, now, settings.releaseDuration);
      break;

    case 'array':
      maxi = settings.releaseEnvelopeArray.length;
      values = new Float32Array(maxi);
      for (i = 0; i < maxi; i++) {
        values[i] = settings.releaseEnvelopeArray[i] * gainNode.gain.value;
      }
      gainNode.gain.setValueCurveAtTime(values, now, settings.releaseDuration);
      break;

    default:
  }
}

function createSample() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(Sample, [null].concat(args)))();
}
},{"./init_audio.js":7,"./util.js":29}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var samples = {
  emptyOgg: 'T2dnUwACAAAAAAAAAABdxd4XAAAAADaS0jQBHgF2b3JiaXMAAAAAAUSsAAAAAAAAgLsAAAAAAAC4AU9nZ1MAAAAAAAAAAAAAXcXeFwEAAAAaXK+QDz3/////////////////MgN2b3JiaXMtAAAAWGlwaC5PcmcgbGliVm9yYmlzIEkgMjAxMDExMDEgKFNjaGF1ZmVudWdnZXQpAAAAAAEFdm9yYmlzH0JDVgEAAAEAGGNUKUaZUtJKiRlzlDFGmWKSSomlhBZCSJ1zFFOpOdeca6y5tSCEEBpTUCkFmVKOUmkZY5ApBZlSEEtJJXQSOiedYxBbScHWmGuLQbYchA2aUkwpxJRSikIIGVOMKcWUUkpCByV0DjrmHFOOSihBuJxzq7WWlmOLqXSSSuckZExCSCmFkkoHpVNOQkg1ltZSKR1zUlJqQegghBBCtiCEDYLQkFUAAAEAwEAQGrIKAFAAABCKoRiKAoSGrAIAMgAABKAojuIojiM5kmNJFhAasgoAAAIAEAAAwHAUSZEUybEkS9IsS9NEUVV91TZVVfZ1Xdd1Xdd1IDRkFQAAAQBASKeZpRogwgxkGAgNWQUAIAAAAEYowhADQkNWAQAAAQAAYig5iCa05nxzjoNmOWgqxeZ0cCLV5kluKubmnHPOOSebc8Y455xzinJmMWgmtOaccxKDZiloJrTmnHOexOZBa6q05pxzxjmng3FGGOecc5q05kFqNtbmnHMWtKY5ai7F5pxzIuXmSW0u1eacc84555xzzjnnnHOqF6dzcE4455xzovbmWm5CF+eccz4Zp3tzQjjnnHPOOeecc84555xzgtCQVQAAEAAAQRg2hnGnIEifo4EYRYhpyKQH3aPDJGgMcgqpR6OjkVLqIJRUxkkpnSA0ZBUAAAgAACGEFFJIIYUUUkghhRRSiCGGGGLIKaecggoqqaSiijLKLLPMMssss8wy67CzzjrsMMQQQwyttBJLTbXVWGOtueecaw7SWmmttdZKKaWUUkopCA1ZBQCAAAAQCBlkkEFGIYUUUoghppxyyimooAJCQ1YBAIAAAAIAAAA8yXNER3RER3RER3RER3REx3M8R5RESZRESbRMy9RMTxVV1ZVdW9Zl3fZtYRd23fd13/d149eFYVmWZVmWZVmWZVmWZVmWZVmC0JBVAAAIAACAEEIIIYUUUkghpRhjzDHnoJNQQiA0ZBUAAAgAIAAAAMBRHMVxJEdyJMmSLEmTNEuzPM3TPE30RFEUTdNURVd0Rd20RdmUTdd0Tdl0VVm1XVm2bdnWbV+Wbd/3fd/3fd/3fd/3fd/3dR0IDVkFAEgAAOhIjqRIiqRIjuM4kiQBoSGrAAAZAAABACiKoziO40iSJEmWpEme5VmiZmqmZ3qqqAKhIasAAEAAAAEAAAAAACia4imm4imi4jmiI0qiZVqipmquKJuy67qu67qu67qu67qu67qu67qu67qu67qu67qu67qu67qu67ouEBqyCgCQAADQkRzJkRxJkRRJkRzJAUJDVgEAMgAAAgBwDMeQFMmxLEvTPM3TPE30RE/0TE8VXdEFQkNWAQCAAAACAAAAAAAwJMNSLEdzNEmUVEu1VE21VEsVVU9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU1TdM0TSA0ZCUAAAQAwGKNweUgISUl5d4QwhCTnjEmIbVeIQSRkt4xBhWDnjKiDHLeQuMQgx4IDVkRAEQBAADGIMcQc8g5R6mTEjnnqHSUGuccpY5SZynFmGLNKJXYUqyNc45SR62jlGIsLXaUUo2pxgIAAAIcAAACLIRCQ1YEAFEAAIQxSCmkFGKMOaecQ4wp55hzhjHmHHOOOeegdFIq55x0TkrEGHOOOaecc1I6J5VzTkonoQAAgAAHAIAAC6HQkBUBQJwAgEGSPE/yNFGUNE8URVN0XVE0XdfyPNX0TFNVPdFUVVNVbdlUVVmWPM80PdNUVc80VdVUVVk2VVWWRVXVbdN1ddt0Vd2Wbdv3XVsWdlFVbd1UXds3Vdf2Xdn2fVnWdWPyPFX1TNN1PdN0ZdV1bVt1XV33TFOWTdeVZdN1bduVZV13Zdn3NdN0XdNVZdl0Xdl2ZVe3XVn2fdN1hd+VZV9XZVkYdl33hVvXleV0Xd1XZVc3Vln2fVvXheHWdWGZPE9VPdN0Xc80XVd1XV9XXdfWNdOUZdN1bdlUXVl2Zdn3XVfWdc80Zdl0Xds2XVeWXVn2fVeWdd10XV9XZVn4VVf2dVnXleHWbeE3Xdf3VVn2hVeWdeHWdWG5dV0YPlX1fVN2heF0Zd/Xhd9Zbl04ltF1fWGVbeFYZVk5fuFYlt33lWV0XV9YbdkYVlkWhl/4neX2feN4dV0Zbt3nzLrvDMfvpPvK09VtY5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=',
  emptyMp3: '//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
  hightick: 'UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAACx/xf/dADOACwBsP3p+6H+zAGoBOkCCwBX/EH5OvxlA4kJ2wcSArT9E/ut+HT2evUx98n6OAF5CCUMwQvfCOsJxAx0DSIMEAq9BiAB3vhz7mLkT9sR133YxN2s5QLv0vrUBnwRnxuQJeEsSDCiMd8yFS8aKFIhohUsCKj64u625OraA9HuyPnElcP+wxvJWtW25637VQ0jHPgnBTDDM1o0CzKLK+8hzhgFDOz8Se4J47DYVtG0z5fQq9LB12rfA+j99roHAhelIyMwIjdTOuU8mjwIOGoxhCb5E53/j+3k3/fTY8pTw4y/Tr+ew8DMvdsk8RcHRRkSKO4yGTkHPkU/rzzyNcgsrR94Dp/5r+Zs17zOncoDxhfE38WLyn/TeOMi9r0IRxlRKIQzyTlOPKo9yjmWMcokDRLc/Y7rudtdzu/D2L1Iu+27JcG3yYrVLujl+3UOZx1UK5Q0qzmNPDk8ZjeeMPojzhH+/jLtPd5m0hHLHsYIw5TEMMnA0jvj8fSOBiwXASZgMzM8dUBGQbI+rzjpKkIZygZT9QflcdaRyqXCz7+VwUPH784r3K7s+v0KDu8bvyeLMb43NjrhOIo0dSvQHi0PnP6i7ovg3NTxy4/Gf8X8yH/QBtvX55P2Ygb0FcUjsy4LNmI5ejiXM38r7iC8FJwHPvok7dDgQdaJzlTKIsoFzsrVkuA87d/6qAi7FQ0h9ClKMLEz3TOrMBcqYSD8E9AFd/dS6kTf6dbU0XnQv9IH2MXfZ+ln9DEAFwwdFy8giib6KawqeChgI/UbHBOTCZj/vvXe7InlFuDN3P3b0d1F4gzpifG2+u4D7Qw1FfwbnCD+IlgjWyHLHPMVog2mBL37qvP+7NvnYuTv4rvjfubN6k3wpPZ0/WkEOwtiEUsWcxm+Gl4aOhhiFDAPIwmbAtn7TPVy77zqcefr5YHmHull7enyfPmcAHgHew1REr8Vhhd/F+AV1RJ0DikJWQNc/ZP3efKd7hvs2ur46rHs5u8e9N/48/0hA/8HFgwuD04RSBIREqsQOg7mCssGMAJW/Xn4G/TK8Lbuzu0I7qTvnPJy9sX6bP84BLYIbAwdD84QYxG7EOcODAxwCFMEAQC9+7P3SvTX8XHw+u9R8KTxIvSo9+X7VQCUBJ0IMwziDj4QLhAGD9UMrgnTBZcBRv1v+Xv2UfS+8tfx+vES87z0+vb3+Zf9ZgEQBSEIUArWC8kM2QyzC5EJEAdvBHgBXP5n++r4Avd89Wj07fMw9D31Jvfp+Uj9xQD9A8QG5QhXClELrAsvC9wJ7gd6BWIC3v6O+7T4PPZN9EHzWvNf9Pz1Fvit+qL9rQCHAwEG/weCCZUKFwvDCnIJcAcQBWcCaf8Z/CD55vaB9dD0wPSP9UL3m/k7/Mz+JwEyAw8FzAY7CBsJaQk5CWkI2gatBCICYf+j/Fr6vfiV9872sfZP91z4p/lR+3H9zf89AroEFAfjCP0Jcwo8CjAJdQdgBSEDkgDQ/Vj7ZfnR95T28fUd9v32Vvg2+nb8+/6xAWoE4AbDCP4JpAqbCqQJ0weEBfgCTACT/R37M/m+9672IPY69gb3afhW+tT8qf+MAj0FggcuCScKXAriCcMIEAfyBJYCFwCP/Rz7A/l793z2F/Zn9mH37fjd+i39yf9pAt0EFAfRCNkJGAqrCZYIvgZPBJ8B6P4//M350vdz9q/1lfUq9mz3RPmi+3H+bgFVBOQG3wgHCkwK0Am7CCAHCgWmAjAA',
  lowtick: 'UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAAB0/5v+U/4T/3gA0wFTAuUB+f8d/nT90f1q/ub+tf46/mb/8wFQA9gC7wCd/mr+FAGRA3cE6wJf/h36evmv+8v/NwRHBZUC2/60+//5EvuZ/aX/bgFOAp8Azvzh9wfzLPF68zT4y/2BAygIfQwaEjYY0x31Irwl8SOWHVESOgPh9NfpReFt22nYHddD2BXcZeDa5InqgPDx9nP+6gS4CBYLnw0zES0WXxv4HkcgLh/1G+EX1RNpD4wKigXH/6r5/fNu7lTpj+Zu5hHoXOtL71byr/Qp91L64v6OBO4JoQ5zEskU+hU1FiQVeRP7EWgP4Qr0BIT+tPid9C3y1vCh8FDxJvK28vvyy/LA8pLzU/XP95v6xvw4/uD/RAK2BSkKcg6BEScTZBMeEqkPTQxjCKEEVwFi/nv7h/hp9aDyAvHP8MfxLvM+9PX0uPW19g/4Lfr7/C4AKgNaBXQGywb0BhIHWQfWB1oIzAjtCF8IHwdtBakDVwKLAeYA8v9w/kj81/nQ94v29/XX9bz1bPUY9Uz1Z/aH+Hr7yP4MAi4F+wcfCnYLNgyfDPsMSw0sDUAMfgrcB5IEMwFb/iX8T/pT+O/1X/Mf8cbvrO+18MLyvfVP+Rf9wgAoBCEHpwnIC5EN4Q5AD3wO1Ay0CpsIvwbvBNcCbQAr/nX8Ofsf+vb4mvda9rj1z/WX9pL3a/hH+ZX6R/wn/vP/eQESA/AE+wYDCcwKFAyPDCkMFQuSCe4HVQbSBHQDCwI8ANL9JPuY+HX28vTq82PzdPMV9Az1MfZ49zD5gftx/sQBBQXLB8cJ/gqpCw8MigwWDXENXQ2rDDUL7QgDBswCdv8S/K74WPVk8hXwou4P7mvu1+9T8pz1Uvli/ZoBwgWRCcsMPg/CEEQR4RDADwoO9wusCVMH4ARSApn/ufzd+Wj3bvX78xzzx/L68qzz1vSD9qX4Gfvd/c0AhwO/BWwHmghvCQEKVQonClsJCwiIBh0F0gOgAm0BOwAx/03+XP0g/Lb6cPmX+F/4vfh++TH6s/os+7/7cvwL/Zz9XP5O/3IA3AF9AzsF9gaUCAAKHgueCzcL9wntB3sF4wIzAI396fp1+Gv2IvWn9N30p/Xi9m74G/ru+9P9k/8aAYEC1AMTBSIG0wYuB1gHkgcACGEISAhTBzEFWAKt/5L92fuU+vX50fmf+SP5i/gb+Bf4mviv+Sr7kvyb/Uj+r/4X/8r/+gCiAo0EUAaRBzwISwjqB3IHGQfCBv8FpgTMApQAKf67+5n5/vfn9jz2yPVn9SL1RPXq9SP3Dvmr+6f+sQGKBAcH+whOCh0Laws3C28KLAmDB5AFfQNoAVP/Zv3e+7P6sfnL+Cv4vPeM95b37feV+Jn51Poq/LL9mv+YAVYD3gQuBmcHSAikCIEI7Af+BuEFngQXA1sBv/9v/pf9MP3W/Fj8q/sR+6H6U/o3+mP6y/pN+/f7xvye/WH+Jf9mAD4CQAQJBisHtgf6Bw0I8QdsB1sGywT4AggBCP/o/KX6mPg19572jfaz9uf2S/cM+E35E/tW/af/5wH1A8AFKgfkB/AHgwfxBlAGgQVIBMMCJwGs/43+vP0i/Zr8Lfzl+9H76fvi+9f75fsf/In8BP10/ej9cf4O/7f/dAAcAaUBEgKMAhgDpAMEBCEEDwTfA3IDxQL8ASoBUwCG/87+J/6h/Rr9pPxk/Gb8oPwJ/XH9w/39/UD+qP41/9D/WwDeAGsBAgKdAhEDQQNAA0sDbwOVA5YDVwPOAhgCVAGRAA=='
};

exports.default = samples;
},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_midi = require('./init_midi');

var _init_audio = require('./init_audio');

var _midi_event = require('./midi_event');

var _settings = require('./settings');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// millis

var Scheduler = function () {
  function Scheduler(song) {
    _classCallCheck(this, Scheduler);

    this.song = song;
  }

  _createClass(Scheduler, [{
    key: 'init',
    value: function init(millis) {
      this.songCurrentMillis = millis;
      this.songStartMillis = millis;
      this.events = this.song._allEvents;
      this.numEvents = this.events.length;
      this.index = 0;
      this.maxtime = 0;
      this.prevMaxtime = 0;
      this.beyondLoop = false; // tells us if the playhead has already passed the looped section
      this.precountingDone = false;
      this.setIndex(this.songStartMillis);
    }
  }, {
    key: 'setTimeStamp',
    value: function setTimeStamp(timeStamp) {
      this.timeStamp = timeStamp;
    }

    // get the index of the event that has its millis value at or right after the provided millis value

  }, {
    key: 'setIndex',
    value: function setIndex(millis) {
      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var event = _step.value;

          if (event.millis >= millis) {
            this.index = i;
            break;
          }
          i++;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.beyondLoop = millis > this.song._rightLocator.millis;
      this.notes = new Map();
      this.precountingDone = false;
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var events = [];

      if (this.song._loop === true && this.song._loopDuration < _settings.bufferTime) {
        this.maxtime = this.songStartMillis + this.song._loopDuration - 1;
        //console.log(this.maxtime, this.song.loopDuration);
      }

      if (this.song._loop === true) {

        if (this.maxtime >= this.song._rightLocator.millis && this.beyondLoop === false) {
          //console.log('LOOP', this.maxtime, this.song._rightLocator.millis)

          var diff = this.maxtime - this.song._rightLocator.millis;
          this.maxtime = this.song._leftLocator.millis + diff;

          //console.log('-------LOOPED', this.maxtime, diff, this.song._leftLocator.millis, this.song._rightLocator.millis);

          if (this.looped === false) {
            this.looped = true;
            var leftMillis = this.song._leftLocator.millis;
            var rightMillis = this.song._rightLocator.millis;

            for (var i = this.index; i < this.numEvents; i++) {
              var event = this.events[i];
              //console.log(event)
              if (event.millis < rightMillis) {
                event.time = this.timeStamp + event.millis - this.songStartMillis;
                events.push(event);

                if (event.type === 144) {
                  this.notes.set(event.midiNoteId, event.midiNote);
                }
                //console.log(event.midiNoteId, event.type)
                this.index++;
              } else {
                break;
              }
            }

            // stop overflowing notes-> add a new note off event at the position of the right locator (end of the loop)
            var endTicks = this.song._rightLocator.ticks - 1;
            var endMillis = this.song.calculatePosition({ type: 'ticks', target: endTicks, result: 'millis' }).millis;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = this.notes.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var note = _step2.value;

                var noteOn = note.noteOn;
                var noteOff = note.noteOff;
                if (noteOff.millis <= rightMillis) {
                  continue;
                }
                var _event = new _midi_event.MIDIEvent(endTicks, 128, noteOn.data1, 0);
                _event.millis = endMillis;
                _event._part = noteOn._part;
                _event._track = noteOn._track;
                _event.midiNote = note;
                _event.midiNoteId = note.id;
                _event.time = this.timeStamp + _event.millis - this.songStartMillis;
                //console.log('added', event)
                events.push(_event);
              }

              /*
                        // stop overflowing audio samples
                        for(i in this.scheduledAudioEvents){
                          if(this.scheduledAudioEvents.hasOwnProperty(i)){
                            audioEvent = this.scheduledAudioEvents[i];
                            if(audioEvent.endMillis > this.song.loopEnd){
                              audioEvent.stopSample(this.song.loopEnd/1000);
                              delete this.scheduledAudioEvents[i];
                              //console.log('stopping audio event', i);
                            }
                          }
                        }
              */
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            this.notes = new Map();
            this.setIndex(leftMillis);
            this.timeStamp += this.song._loopDuration;
            this.songCurrentMillis -= this.song._loopDuration;

            //console.log(events.length)

            // get the audio events that start before song.loopStart
            //this.getDanglingAudioEvents(this.song.loopStart, events);
          }
        } else {
            this.looped = false;
          }
      }

      //console.log('scheduler', this.looped)

      // main loop
      for (var _i = this.index; _i < this.numEvents; _i++) {
        var _event2 = this.events[_i];
        //console.log(event.millis, this.maxtime)
        if (_event2.millis < this.maxtime) {

          //event.time = this.timeStamp + event.millis - this.songStartMillis;

          if (_event2.type === 'audio') {
            // to be implemented
          } else {
              _event2.time = this.timeStamp + _event2.millis - this.songStartMillis;
              events.push(_event2);
            }
          this.index++;
        } else {
          break;
        }
      }
      return events;
    }
  }, {
    key: 'update',
    value: function update(diff) {
      var i, event, numEvents, track, events;

      this.prevMaxtime = this.maxtime;

      if (this.song.precounting) {
        this.songCurrentMillis += diff;
        this.maxtime = this.songCurrentMillis + _settings.bufferTime;
        events = this.song._metronome.getPrecountEvents(this.maxtime);

        if (this.maxtime > this.song._metronome.endMillis && this.precountingDone === false) {
          var _events;

          this.precountingDone = true;
          this.timeStamp += this.song._metronome.precountDuration;

          // start scheduling events of the song -> add the first events of the song
          this.songCurrentMillis = this.songStartMillis;
          this.songCurrentMillis += diff;
          this.maxtime = this.songCurrentMillis + _settings.bufferTime;
          (_events = events).push.apply(_events, _toConsumableArray(this.getEvents()));
        }
      } else {
        this.songCurrentMillis += diff;
        this.maxtime = this.songCurrentMillis + _settings.bufferTime;
        events = this.getEvents();
        //console.log('done', this.songCurrentMillis, diff, this.index, events.length)
      }

      numEvents = events.length;

      // if(numEvents > 5){
      //   console.log(numEvents)
      // }

      for (i = 0; i < numEvents; i++) {
        event = events[i];
        track = event._track;
        //console.log(event.millis, this.maxtime, this.prevMaxtime)

        // if(event.millis > this.maxtime){
        //   // skip events that were harvest accidently while jumping the playhead -> should happen very rarely if ever
        //   console.log('skip', event)
        //   continue
        // }

        if (event._part.muted === true || track.muted === true || event.muted === true) {
          continue;
        }

        if ((event.type === 144 || event.type === 128) && typeof event.midiNote === 'undefined') {
          // this is usually caused by the same note on the same ticks value, which is probably a bug in the midi file
          //console.info('no midiNoteId', event)
          continue;
        }

        if (event.type === 'audio') {
          // to be implemented
        } else {
            // convert to seconds because the audio context uses seconds for scheduling
            track.processMIDIEvent(event, true); // true means: use latency to compensate timing for external MIDI devices, see Track.processMIDIEvent
            //console.log(context.currentTime * 1000, event.time, this.index)
            if (event.type === 144) {
              this.notes.set(event.midiNoteId, event.midiNote);
            } else if (event.type === 128) {
              this.notes.delete(event.midiNoteId);
            }
          }
      }
      //console.log(this.index, this.numEvents)
      //return this.index >= 10
      return this.index >= this.numEvents; // last event of song
    }

    /*
      allNotesOff(){
        let timeStamp = context.currentTime * 1000
        let outputs = getMIDIOutputs()
        outputs.forEach((output) => {
          output.send([0xB0, 0x7B, 0x00], timeStamp) // stop all notes
          output.send([0xB0, 0x79, 0x00], timeStamp) // reset all controllers
        })
      }
    */

  }]);

  return Scheduler;
}();

exports.default = Scheduler;
},{"./init_audio":7,"./init_midi":8,"./midi_event":11,"./settings":25}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setBufferTime = setBufferTime;
var defaultSong = exports.defaultSong = {
  ppq: 960,
  bpm: 120,
  bars: 16,
  lowestNote: 0,
  highestNote: 127,
  nominator: 4,
  denominator: 4,
  quantizeValue: 8,
  fixedLengthValue: false,
  positionType: 'all',
  useMetronome: false,
  autoSize: true,
  loop: false,
  playbackSpeed: 1,
  autoQuantize: false
};

var bufferTime = exports.bufferTime = 200;

function setBufferTime(time) {
  exports.bufferTime = bufferTime = time;
}
},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Song = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //@ flow

//import {addTask, removeTask} from './heartbeat'


var _constants = require('./constants');

var _parse_events = require('./parse_events');

var _init_audio = require('./init_audio');

var _scheduler = require('./scheduler');

var _scheduler2 = _interopRequireDefault(_scheduler);

var _midi_event = require('./midi_event');

var _song_from_midifile = require('./song_from_midifile');

var _util = require('./util');

var _position = require('./position');

var _playhead = require('./playhead');

var _metronome = require('./metronome');

var _eventlistener = require('./eventlistener');

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var songIndex = 0;
var recordingIndex = 0;

/*
type songSettings = {
  name: string,
  ppq: number,
  bpm: number,
  bars: number,
  lowestNote: number,
  highestNote: number,
  nominator: number,
  denominator: number,
  quantizeValue: number,
  fixedLengthValue: number,
  positionType: string,
  useMetronome: boolean,
  autoSize: boolean,
  loop: boolean,
  playbackSpeed: number,
  autoQuantize: boolean
}
*/

var Song = exports.Song = function () {
  _createClass(Song, null, [{
    key: 'fromMIDIFile',
    value: function fromMIDIFile(data) {
      return (0, _song_from_midifile.songFromMIDIFile)(data);
    }
  }, {
    key: 'fromMIDIFileAsync',
    value: function fromMIDIFileAsync(data) {
      return (0, _song_from_midifile.songFromMIDIFileAsync)(data);
    }
  }]);

  function Song() {
    var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Song);

    this.id = 'S_' + songIndex++ + '_' + new Date().getTime();

    var _settings$name = settings.name;
    this.name = _settings$name === undefined ? this.id : _settings$name;
    var _settings$ppq = settings.ppq;
    this.ppq = _settings$ppq === undefined ? _settings.defaultSong.ppq : _settings$ppq;
    var _settings$bpm = settings.bpm;
    this.bpm = _settings$bpm === undefined ? _settings.defaultSong.bpm : _settings$bpm;
    var _settings$bars = settings.bars;
    this.bars = _settings$bars === undefined ? _settings.defaultSong.bars : _settings$bars;
    var _settings$nominator = settings.nominator;
    this.nominator = _settings$nominator === undefined ? _settings.defaultSong.nominator : _settings$nominator;
    var _settings$denominator = settings.denominator;
    this.denominator = _settings$denominator === undefined ? _settings.defaultSong.denominator : _settings$denominator;
    var _settings$quantizeVal = settings.quantizeValue;
    this.quantizeValue = _settings$quantizeVal === undefined ? _settings.defaultSong.quantizeValue : _settings$quantizeVal;
    var _settings$fixedLength = settings.fixedLengthValue;
    this.fixedLengthValue = _settings$fixedLength === undefined ? _settings.defaultSong.fixedLengthValue : _settings$fixedLength;
    var _settings$useMetronom = settings.useMetronome;
    this.useMetronome = _settings$useMetronom === undefined ? _settings.defaultSong.useMetronome : _settings$useMetronom;
    var _settings$autoSize = settings.autoSize;
    this.autoSize = _settings$autoSize === undefined ? _settings.defaultSong.autoSize : _settings$autoSize;
    var _settings$loop = settings.loop;
    this.loop = _settings$loop === undefined ? _settings.defaultSong.loop : _settings$loop;
    var _settings$playbackSpe = settings.playbackSpeed;
    this.playbackSpeed = _settings$playbackSpe === undefined ? _settings.defaultSong.playbackSpeed : _settings$playbackSpe;
    var _settings$autoQuantiz = settings.autoQuantize;
    this.autoQuantize = _settings$autoQuantiz === undefined ? _settings.defaultSong.autoQuantize : _settings$autoQuantiz;


    this._timeEvents = [new _midi_event.MIDIEvent(0, _constants.MIDIEventTypes.TEMPO, this.bpm), new _midi_event.MIDIEvent(0, _constants.MIDIEventTypes.TIME_SIGNATURE, this.nominator, this.denominator)];

    //this._timeEvents = []
    this._updateTimeEvents = true;
    this._lastEvent = new _midi_event.MIDIEvent(0, _constants.MIDIEventTypes.END_OF_TRACK);

    this._tracks = [];
    this._tracksById = new Map();

    this._parts = [];
    this._partsById = new Map();

    this._events = [];
    this._eventsById = new Map();

    this._allEvents = []; // MIDI events and metronome events

    this._notes = [];
    this._notesById = new Map();

    this._newEvents = [];
    this._movedEvents = [];
    this._removedEvents = [];
    this._transposedEvents = [];

    this._newParts = [];
    this._changedParts = [];
    this._removedParts = [];

    this._currentMillis = 0;
    this._scheduler = new _scheduler2.default(this);
    this._playhead = new _playhead.Playhead(this);

    this.playing = false;
    this.paused = false;
    this.recording = false;
    this.precounting = false;
    this.stopped = true;

    this.volume = 0.5;
    this._output = _init_audio.context.createGain();
    this._output.gain.value = this.volume;
    this._output.connect(_init_audio.masterGain);

    this._metronome = new _metronome.Metronome(this);
    this._metronomeEvents = [];
    this._updateMetronomeEvents = true;

    this._loop = false;
    this._leftLocator = { millis: 0, ticks: 0 };
    this._rightLocator = { millis: 0, ticks: 0 };
    this._illegalLoop = false;
    this._loopDuration = 0;
    this._precountBars = 0;
    this._endPrecountMillis = 0;
  }

  _createClass(Song, [{
    key: 'addTimeEvents',
    value: function addTimeEvents() {
      var _this = this;

      for (var _len = arguments.length, events = Array(_len), _key = 0; _key < _len; _key++) {
        events[_key] = arguments[_key];
      }

      //@TODO: filter time events on the same tick -> use the lastly added events
      events.forEach(function (event) {
        if (event.type === _constants.MIDIEventTypes.TIME_SIGNATURE) {
          _this._updateMetronomeEvents = true;
        }
        _this._timeEvents.push(event);
      });
      this._updateTimeEvents = true;
    }
  }, {
    key: 'addTracks',
    value: function addTracks() {
      var _this2 = this;

      for (var _len2 = arguments.length, tracks = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        tracks[_key2] = arguments[_key2];
      }

      tracks.forEach(function (track) {
        var _newEvents, _newParts;

        track._song = _this2;
        track.connect(_this2._output);
        _this2._tracks.push(track);
        _this2._tracksById.set(track.id, track);
        (_newEvents = _this2._newEvents).push.apply(_newEvents, _toConsumableArray(track._events));
        (_newParts = _this2._newParts).push.apply(_newParts, _toConsumableArray(track._parts));
      });
    }

    // prepare song events for playback

  }, {
    key: 'update',
    value: function update() {
      var _this3 = this;

      var createEventArray = false;

      if (this._updateTimeEvents === false && this._removedEvents.length === 0 && this._newEvents.length === 0 && this._movedEvents.length === 0 && this._newParts.length === 0 && this._removedParts.length === 0) {
        return;
      }
      //debug
      //this.isPlaying = true

      console.group('update song');
      console.time('total');

      // check if time events are updated
      if (this._updateTimeEvents === true) {
        //console.log('updateTimeEvents', this._timeEvents.length)
        (0, _parse_events.parseTimeEvents)(this, this._timeEvents, this.isPlaying);
        this._updateTimeEvents = false;
        console.log('time events %O', this._timeEvents);
      }

      // only parse new and moved events
      var tobeParsed = [];

      // filter removed parts
      console.log('removed parts %O', this._removedParts);
      this._removedParts.forEach(function (part) {
        var _removedEvents;

        _this3._partsById.delete(part.id);
        (_removedEvents = _this3._removedEvents).push.apply(_removedEvents, _toConsumableArray(part._events));
      });

      // add new parts
      console.log('new parts %O', this._newParts);
      this._newParts.forEach(function (part) {
        part._song = _this3;
        _this3._partsById.set(part.id, part);
        //this._newEvents.push(...part._events)
        part.update();
      });

      // update changed parts
      console.log('changed parts %O', this._changedParts);
      this._changedParts.forEach(function (part) {
        part.update();
      });

      // remove events from removed parts
      console.log('changed parts %O', this._changedParts);
      this._removedParts.forEach(function (part) {
        var _removedEvents2;

        (_removedEvents2 = _this3._removedEvents).push.apply(_removedEvents2, _toConsumableArray(part._events));
        _this3._partsById.delete(part.id);
        part.update();
      });

      if (this._removedParts.length > 0) {
        this._parts = Array.from(this._partsById.values());
      }

      // filter removed events
      console.log('removed events %O', this._removedEvents);
      this._removedEvents.forEach(function (event) {
        _this3._notesById.delete(event.midiNote.id);
        _this3._eventsById.delete(event.id);
      });

      createEventArray = this._removedEvents.length > 0;

      // add new events
      console.log('new events %O', this._newEvents);
      this._newEvents.forEach(function (event) {
        _this3._eventsById.set(event.id, event);
        _this3._events.push(event);
        tobeParsed.push(event);
        //console.log(event.id)
      });

      // moved events need to be parsed
      console.log('moved %O', this._movedEvents);
      this._movedEvents.forEach(function (event) {
        tobeParsed.push(event);
      });

      //tobeParsed = [...tobeParsed, ...Array.from(song.movedEvents.values())]

      console.time('parse');
      if (tobeParsed.length > 0) {
        //console.log('tobeParsed %O', tobeParsed)
        tobeParsed = [].concat(_toConsumableArray(tobeParsed), _toConsumableArray(this._timeEvents));
        console.log('parseEvents', tobeParsed.length - this._timeEvents.length);
        (0, _parse_events.parseEvents)(tobeParsed, this.isPlaying);
        tobeParsed.forEach(function (event) {
          //console.log(event.id, event.type, event.midiNote)
          if (event.type === _constants.MIDIEventTypes.NOTE_ON) {
            if (event.midiNote) {
              _this3._notesById.set(event.midiNoteId, event.midiNote);
              //console.log(event.midiNoteId, event.type)
              //this._notes.push(event.midiNote)
            }
          }
        });
        this._notes = Array.from(this._notesById.values());
      }
      console.timeEnd('parse');

      if (createEventArray) {
        console.time('to array');
        this._events = Array.from(this._eventsById.values());
        this._notes = Array.from(this._notesById.values());
        console.timeEnd('to array');
      }
      //debugger

      console.time('sorting ' + this._events.length + ' events');
      (0, _util.sortEvents)(this._events);
      this._notes.sort(function (a, b) {
        return a.noteOn.ticks - b.noteOn.ticks;
      });
      console.timeEnd('sorting ' + this._events.length + ' events');

      console.log('notes %O', this._notes);

      console.timeEnd('total');
      console.groupEnd('update song');
      console.timeEnd('update song');

      // get the last event of this song
      var lastEvent = this._events[this._events.length - 1];
      var lastTimeEvent = this._timeEvents[this._timeEvents.length - 1];
      if (lastEvent instanceof _midi_event.MIDIEvent === false) {
        lastEvent = lastTimeEvent;
      } else if (lastTimeEvent.ticks > lastEvent.ticks) {
        lastEvent = lastTimeEvent;
      }

      // get the position data of the first beat in the bar after the last bar
      this.bars = Math.max(lastEvent.bar, this.bars);
      //console.log('num bars', this.bars, lastEvent)
      var ticks = (0, _position.calculatePosition)(this, {
        type: 'barsbeats',
        target: [this.bars + 1],
        result: 'ticks'
      }).ticks;

      // we want to put the END_OF_TRACK event at the very last tick of the last bar, so we calculate that position
      var millis = (0, _position.calculatePosition)(this, {
        type: 'ticks',
        target: ticks - 1,
        result: 'millis'
      }).millis;

      this._lastEvent.ticks = ticks - 1;
      this._lastEvent.millis = millis;

      console.log('last tick', this._lastEvent.ticks, this._lastEvent.millis);
      this._durationTicks = this._lastEvent.ticks;
      this._durationMillis = this._lastEvent.millis;
      this._playhead.updateSong();

      if (this.playing === false) {
        this._playhead.set('millis', this._currentMillis);
      }

      // add metronome events
      if (this._updateMetronomeEvents || this._metronome.bars !== this.bars) {
        this._metronomeEvents = (0, _parse_events.parseEvents)([].concat(_toConsumableArray(this._timeEvents), _toConsumableArray(this._metronome.getEvents())));
      }
      this._allEvents = [].concat(_toConsumableArray(this._metronomeEvents), _toConsumableArray(this._events));
      (0, _util.sortEvents)(this._allEvents);
      //console.log('all events %O', this._allEvents)

      this._newParts = [];
      this._removedParts = [];
      this._newEvents = [];
      this._movedEvents = [];
      this._removedEvents = [];
    }
  }, {
    key: 'play',
    value: function play(type) {
      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      this._play.apply(this, [type].concat(args));
      if (this._precountBars > 0) {
        (0, _eventlistener.dispatchEvent)({ type: 'precounting', data: this._currentMillis });
      } else if (this._preparedForRecording === true) {
        (0, _eventlistener.dispatchEvent)({ type: 'start_recording', data: this._currentMillis });
      } else {
        (0, _eventlistener.dispatchEvent)({ type: 'play', data: this._currentMillis });
      }
    }
  }, {
    key: '_play',
    value: function _play(type) {
      if (typeof type !== 'undefined') {
        for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          args[_key4 - 1] = arguments[_key4];
        }

        this.setPosition.apply(this, [type].concat(args));
      }
      if (this.playing) {
        return;
      }

      this._reference = this._timeStamp = _init_audio.context.currentTime * 1000;
      this._scheduler.setTimeStamp(this._reference);
      this._startMillis = this._currentMillis;

      if (this._precountBars > 0 && this._preparedForRecording) {
        this._endPrecountMillis = this._currentMillis + this._metronome.createPrecountEvents(this._precountBars, this._reference);
        //console.log('endPrecountMillis', this._endPrecountMillis)
        this.precounting = true;
      } else {
        this._endPrecountMillis = 0;
        this.playing = true;
        this.recording = this._preparedForRecording;
      }

      if (this.paused) {
        this.paused = false;
      }

      this._scheduler.init(this._currentMillis);
      this._playhead.set('millis', this._currentMillis);
      this._pulse();
    }
  }, {
    key: 'pause',
    value: function pause() {
      this.paused = !this.paused;
      this.precounting = false;
      if (this.paused) {
        this.playing = false;
        this.allNotesOff();
        (0, _eventlistener.dispatchEvent)({ type: 'pause', data: this.paused });
      } else {
        this.play();
        (0, _eventlistener.dispatchEvent)({ type: 'pause', data: this.paused });
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.precounting = false;
      this.allNotesOff();
      if (this.playing || this.paused) {
        this.playing = false;
        this.paused = false;
      }
      if (this._currentMillis !== 0) {
        this._currentMillis = 0;
        this._playhead.set('millis', this._currentMillis);
        if (this.recording) {
          this.stopRecording();
        }
        (0, _eventlistener.dispatchEvent)({ type: 'stop' });
      }
    }
  }, {
    key: 'startRecording',
    value: function startRecording() {
      var _this4 = this;

      if (this._preparedForRecording === true) {
        return;
      }
      this._recordId = 'recording_' + recordingIndex++ + new Date().getTime();
      this._tracks.forEach(function (track) {
        track._startRecording(_this4._recordId);
      });
      this._preparedForRecording = true;
    }
  }, {
    key: 'stopRecording',
    value: function stopRecording() {
      var _this5 = this;

      if (this._preparedForRecording === false) {
        return;
      }
      this._tracks.forEach(function (track) {
        track._stopRecording(_this5._recordId);
      });
      this.update();
      this._preparedForRecording = false;
      this.recording = false;
      (0, _eventlistener.dispatchEvent)({ type: 'stop_recording' });
    }
  }, {
    key: 'undoRecording',
    value: function undoRecording() {
      var _this6 = this;

      this._tracks.forEach(function (track) {
        track.undoRecording(_this6._recordId);
      });
      this.update();
    }
  }, {
    key: 'redoRecording',
    value: function redoRecording() {
      var _this7 = this;

      this._tracks.forEach(function (track) {
        track.redoRecording(_this7._recordId);
      });
      this.update();
    }
  }, {
    key: 'setMetronome',
    value: function setMetronome(flag) {
      if (typeof flag === 'undefined') {
        this.useMetronome = !this.useMetronome;
      } else {
        this.useMetronome = flag;
      }
      this._metronome.mute(this.useMetronome);
    }
  }, {
    key: 'configureMetronome',
    value: function configureMetronome(config) {
      this._metronome.configure(config);
    }
  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      this._tracks.forEach(function (track) {
        track.allNotesOff();
      });

      //this._scheduler.allNotesOff()
      this._metronome.allNotesOff();
    }
  }, {
    key: 'getTracks',
    value: function getTracks() {
      return [].concat(_toConsumableArray(this._tracks));
    }
  }, {
    key: 'getParts',
    value: function getParts() {
      return [].concat(_toConsumableArray(this._parts));
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      return [].concat(_toConsumableArray(this._events));
    }
  }, {
    key: 'getNotes',
    value: function getNotes() {
      return [].concat(_toConsumableArray(this._notes));
    }
  }, {
    key: 'calculatePosition',
    value: function calculatePosition(args) {
      return (0, _position.calculatePosition)(this, args);
    }

    // @args -> see _calculatePosition

  }, {
    key: 'setPosition',
    value: function setPosition(type) {

      var wasPlaying = this.playing;
      if (this.playing) {
        this.playing = false;
        this.allNotesOff();
      }

      for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }

      var position = this._calculatePosition(type, args, 'all');
      //let millis = this._calculatePosition(type, args, 'millis')
      if (position === false) {
        return;
      }

      this._currentMillis = position.millis;

      (0, _eventlistener.dispatchEvent)({
        type: 'position',
        data: position
      });

      if (wasPlaying) {
        this._play();
      }
      //console.log('setPosition', this._currentMillis)
    }
  }, {
    key: 'getPosition',
    value: function getPosition() {
      return this._playhead.get().position;
    }
  }, {
    key: 'getPlayhead',
    value: function getPlayhead() {
      return this._playhead.get();
    }

    // @args -> see _calculatePosition

  }, {
    key: 'setLeftLocator',
    value: function setLeftLocator(type) {
      for (var _len6 = arguments.length, args = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
        args[_key6 - 1] = arguments[_key6];
      }

      this._leftLocator = this._calculatePosition(type, args, 'all');

      if (this._leftLocator === false) {
        console.warn('invalid position for locator');
        this._leftLocator = { millis: 0, ticks: 0 };
        return;
      }
    }

    // @args -> see _calculatePosition

  }, {
    key: 'setRightLocator',
    value: function setRightLocator(type) {
      for (var _len7 = arguments.length, args = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
        args[_key7 - 1] = arguments[_key7];
      }

      this._rightLocator = this._calculatePosition(type, args, 'all');

      if (this._rightLocator === false) {
        this._rightLocator = { millis: 0, ticks: 0 };
        console.warn('invalid position for locator');
        return;
      }
    }
  }, {
    key: 'setLoop',
    value: function setLoop() {
      var flag = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];


      this._loop = flag !== null ? flag : !this._loop;

      if (this._rightLocator === false || this._leftLocator === false) {
        this._illegalLoop = true;
        this._loop = false;
        return false;
      }

      // locators can not (yet) be used to jump over a segment
      if (this._rightLocator.millis <= this._leftLocator.millis) {
        this._illegalLoop = true;
        this._loop = false;
        return false;
      }

      this._loopDuration = this._rightLocator.millis - this._leftLocator.millis;
      //console.log(this._loop, this._loopDuration)
      this._scheduler.beyondLoop = this._currentMillis > this._rightLocator.millis;
      return this._loop;
    }
  }, {
    key: 'setPrecount',
    value: function setPrecount() {
      var value = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      this._precountBars = value;
    }
  }, {
    key: '_pulse',
    value: function _pulse() {
      if (this.playing === false && this.precounting === false) {
        return;
      }
      var now = _init_audio.context.currentTime * 1000;
      var diff = now - this._reference;
      this._currentMillis += diff;
      this._reference = now;

      if (this._endPrecountMillis > 0) {
        if (this._endPrecountMillis > this._currentMillis) {
          this._scheduler.update(diff);
          requestAnimationFrame(this._pulse.bind(this));
          //return because during precounting only precount metronome events get scheduled
          return;
        }
        this.precounting = false;
        this._endPrecountMillis = 0;
        if (this._preparedForRecording) {
          this.playing = true;
          this.recording = true;
        } else {
          this.playing = true;
          (0, _eventlistener.dispatchEvent)({ type: 'play', data: this._startMillis });
          //dispatchEvent({type: 'play', data: this._currentMillis})
        }
      }

      if (this._loop && this._currentMillis >= this._rightLocator.millis) {
        this._currentMillis -= this._loopDuration;
        this._playhead.set('millis', this._currentMillis);
        //this._playhead.set('millis', this._leftLocator.millis) // playhead is a bit ahead only during this frame
        (0, _eventlistener.dispatchEvent)({
          type: 'loop',
          data: null
        });
      } else {
        this._playhead.update('millis', diff);
      }

      this._ticks = this._playhead.get().ticks;

      if (this._currentMillis >= this._durationMillis) {
        this.stop();
        return;
      }

      this._scheduler.update(diff);

      requestAnimationFrame(this._pulse.bind(this));
    }

    /*
      helper method: converts user friendly position format to internal format
       position:
        - 'ticks', 96000
        - 'millis', 1234
        - 'percentage', 55
        - 'barsbeats', 1, 4, 0, 25 -> bar, beat, sixteenth, tick
        - 'time', 0, 3, 49, 566 -> hours, minutes, seconds, millis
     */

  }, {
    key: '_calculatePosition',
    value: function _calculatePosition(type, args, resultType) {
      var target = void 0;

      switch (type) {
        case 'ticks':
        case 'millis':
        case 'percentage':
          target = args[0] || 0;
          break;

        case 'time':
        case 'barsbeats':
        case 'barsandbeats':
          target = args;
          break;

        default:
          console.log('unsupported type');
          return false;
      }

      var position = (0, _position.calculatePosition)(this, {
        type: type,
        target: target,
        result: resultType
      });

      return position;
    }
  }, {
    key: 'addEventListener',
    value: function addEventListener(type, callback) {
      return (0, _eventlistener.addEventListener)(type, callback);
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(type, id) {
      (0, _eventlistener.removeEventListener)(type, id);
    }
  }]);

  return Song;
}();
},{"./constants":3,"./eventlistener":4,"./init_audio":7,"./metronome":10,"./midi_event":11,"./parse_events":17,"./playhead":19,"./position":20,"./scheduler":24,"./settings":25,"./song_from_midifile":27,"./util":29}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.songFromMIDIFile = songFromMIDIFile;
exports.songFromMIDIFileAsync = songFromMIDIFileAsync;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _midifile = require('./midifile');

var _midi_event = require('./midi_event');

var _part = require('./part');

var _track = require('./track');

var _song = require('./song');

var _util = require('./util');

var _fetch_helpers = require('./fetch_helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PPQ = 960;

function toSong(parsed) {
  var tracks = parsed.tracks;
  var ppq = parsed.header.ticksPerBeat;
  var ppqFactor = PPQ / ppq; //@TODO: get ppq from config -> only necessary if you want to change the ppq of the MIDI file !
  var timeEvents = [];
  var bpm = -1;
  var nominator = -1;
  var denominator = -1;
  var newTracks = [];

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tracks.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var track = _step.value;

      var lastTicks = void 0,
          lastType = void 0;
      var ticks = 0;
      var type = void 0;
      var channel = -1;
      var trackName = void 0;
      var trackInstrumentName = void 0;
      var events = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = track[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var event = _step2.value;

          ticks += event.deltaTime * ppqFactor;

          if (channel === -1 && typeof event.channel !== 'undefined') {
            channel = event.channel;
          }
          type = event.subtype;
          //console.log(event.deltaTime, ticks, type);

          switch (event.subtype) {

            case 'trackName':
              trackName = event.text;
              break;

            case 'instrumentName':
              if (event.text) {
                trackInstrumentName = event.text;
              }
              break;

            case 'noteOn':
              events.push(new _midi_event.MIDIEvent(ticks, 0x90, event.noteNumber, event.velocity));
              break;

            case 'noteOff':
              events.push(new _midi_event.MIDIEvent(ticks, 0x80, event.noteNumber, event.velocity));
              break;

            case 'setTempo':
              // sometimes 2 tempo events have the same position in ticks
              // we use the last in these cases (same as Cubase)
              var tmp = 60000000 / event.microsecondsPerBeat;

              if (ticks === lastTicks && type === lastType) {
                //console.info('tempo events on the same tick', ticks, tmp);
                timeEvents.pop();
              }

              if (bpm === -1) {
                bpm = tmp;
              }
              timeEvents.push(new _midi_event.MIDIEvent(ticks, 0x51, tmp));
              break;

            case 'timeSignature':
              // sometimes 2 time signature events have the same position in ticks
              // we use the last in these cases (same as Cubase)
              if (lastTicks === ticks && lastType === type) {
                console.info('time signature events on the same tick', ticks, event.numerator, event.denominator);
                timeEvents.pop();
              }

              if (nominator === -1) {
                nominator = event.numerator;
                denominator = event.denominator;
              }
              timeEvents.push(new _midi_event.MIDIEvent(ticks, 0x58, event.numerator, event.denominator));
              break;

            case 'controller':
              events.push(new _midi_event.MIDIEvent(ticks, 0xB0, event.controllerType, event.value));
              break;

            case 'programChange':
              events.push(new _midi_event.MIDIEvent(ticks, 0xC0, event.programNumber));
              break;

            case 'pitchBend':
              events.push(new _midi_event.MIDIEvent(ticks, 0xE0, event.value));
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
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (events.length > 0) {
        //console.count(events.length)
        var newTrack = new _track.Track(trackName);
        var part = new _part.Part();
        newTrack.addParts(part);
        part.addEvents.apply(part, events);
        newTracks.push(newTrack);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var song = new _song.Song({
    ppq: PPQ,
    playbackSpeed: 1,
    //ppq,
    bpm: bpm,
    nominator: nominator,
    denominator: denominator
  });
  song.addTracks.apply(song, newTracks);
  song.addTimeEvents.apply(song, timeEvents);
  song.update();
  return song;
}

function songFromMIDIFile(data) {
  var settings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var song = null;

  if (data instanceof ArrayBuffer === true) {
    var buffer = new Uint8Array(data);
    song = toSong((0, _midifile.parseMIDIFile)(buffer));
  } else if (typeof data.header !== 'undefined' && typeof data.tracks !== 'undefined') {
    song = toSong(data);
  } else {
    data = (0, _util.base64ToBinary)(data);
    if (data instanceof ArrayBuffer === true) {
      var _buffer = new Uint8Array(data);
      song = toSong((0, _midifile.parseMIDIFile)(_buffer));
    } else {
      console.error('wrong data');
    }
  }

  return song;
  // {
  //   ppq = newPPQ,
  //   bpm = newBPM,
  //   playbackSpeed = newPlaybackSpeed,
  // } = settings
}

function songFromMIDIFileAsync(url) {
  return new Promise(function (resolve, reject) {
    (0, _isomorphicFetch2.default)(url).then(_fetch_helpers.status).then(_fetch_helpers.arrayBuffer).then(function (data) {
      resolve(songFromMIDIFile(data));
    }).catch(function (e) {
      reject(e);
    });
  });
}
},{"./fetch_helpers":5,"./midi_event":11,"./midifile":14,"./part":18,"./song":26,"./track":28,"./util":29,"isomorphic-fetch":2}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Track = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _part = require('./part');

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _init_midi = require('./init_midi');

var _util = require('./util');

var _init_audio = require('./init_audio');

var _instrument = require('./instrument');

var _qambi = require('./qambi');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var trackIndex = 0;

var Track = exports.Track = function () {
  function Track() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    _classCallCheck(this, Track);

    this.id = 'TR_' + trackIndex++ + '_' + new Date().getTime();
    this.name = name || this.id;
    this.channel = 0;
    this.muted = false;
    this.volume = 0.5;
    this._output = _init_audio.context.createGain();
    this._output.gain.value = this.volume;
    this._midiInputs = new Map();
    this._midiOutputs = new Map();
    this._song = null;
    this._parts = [];
    this._partsById = new Map();
    this._events = [];
    this._eventsById = new Map();
    this._needsUpdate = false;
    this._createEventArray = false;
    this.latency = 100;
    this._instrument = null;
    this._tmpRecordedNotes = new Map();
    this._recordedEvents = [];
    //this.setInstrument(new Instrument('sinewave'))
  }

  _createClass(Track, [{
    key: 'setInstrument',
    value: function setInstrument() {
      var instrument = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (this._instrument !== null) {
        this._instrument.allNotesOff();
        this._instrument.disconnect();
      }
      this._instrument = instrument;
      if (this._instrument !== null) {
        this._instrument.connect(this._output);
      }
    }
  }, {
    key: 'getInstrument',
    value: function getInstrument() {
      return this._instrument;
    }
  }, {
    key: 'connect',
    value: function connect(output) {
      this._output.connect(output);
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this._output.disconnect();
    }
  }, {
    key: 'connectMIDIOutputs',
    value: function connectMIDIOutputs() {
      var _this = this;

      for (var _len = arguments.length, outputs = Array(_len), _key = 0; _key < _len; _key++) {
        outputs[_key] = arguments[_key];
      }

      //console.log(outputs)
      outputs.forEach(function (output) {
        if (typeof output === 'string') {
          output = (0, _init_midi.getMIDIOutputById)(output);
        }
        if (output instanceof MIDIOutput) {
          _this._midiOutputs.set(output.id, output);
        }
      });
      //console.log(this._midiOutputs)
    }
  }, {
    key: 'disconnectMIDIOutputs',
    value: function disconnectMIDIOutputs() {
      var _this2 = this;

      for (var _len2 = arguments.length, outputs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        outputs[_key2] = arguments[_key2];
      }

      //console.log(outputs)
      if (outputs.length === 0) {
        this._midiOutputs.clear();
      }
      outputs.forEach(function (port) {
        if (port instanceof MIDIOutput) {
          port = port.id;
        }
        if (_this2._midiOutputs.has(port)) {
          //console.log('removing', this._midiOutputs.get(port).name)
          _this2._midiOutputs.delete(port);
        }
      });
      //this._midiOutputs = this._midiOutputs.filter(...outputs)
      //console.log(this._midiOutputs)
    }
  }, {
    key: 'connectMIDIInputs',
    value: function connectMIDIInputs() {
      var _this3 = this;

      for (var _len3 = arguments.length, inputs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        inputs[_key3] = arguments[_key3];
      }

      inputs.forEach(function (input) {
        if (typeof input === 'string') {
          input = (0, _init_midi.getMIDIInputById)(input);
        }
        if (input instanceof MIDIInput) {
          (function () {

            _this3._midiInputs.set(input.id, input);

            var note = void 0,
                midiEvent = void 0;
            input.addEventListener('midimessage', function (e) {

              midiEvent = new (Function.prototype.bind.apply(_midi_event.MIDIEvent, [null].concat([_this3._song._ticks], _toConsumableArray(e.data))))();
              midiEvent.time = 0; // play immediately
              midiEvent.recordMillis = _init_audio.context.currentTime * 1000;

              if (midiEvent.type === _qambi.MIDIEventTypes.NOTE_ON) {
                note = new _midi_note.MIDINote(midiEvent);
                _this3._tmpRecordedNotes.set(midiEvent.data1, note);
              } else if (midiEvent.type === _qambi.MIDIEventTypes.NOTE_OFF) {
                note = _this3._tmpRecordedNotes.get(midiEvent.data1);
                note.addNoteOff(midiEvent);
                _this3._tmpRecordedNotes.delete(midiEvent.data1);
              }

              if (_this3._recordEnabled === 'midi' && _this3._song.recording === true) {
                _this3._recordedEvents.push(midiEvent);
              }
              _this3.processMIDIEvent(midiEvent);
            });
          })();
        }
      });
      //console.log(this._midiInputs)
    }
  }, {
    key: 'disconnectMIDIInputs',
    value: function disconnectMIDIInputs() {
      var _this4 = this;

      for (var _len4 = arguments.length, inputs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        inputs[_key4] = arguments[_key4];
      }

      if (inputs.length === 0) {
        this._midiInputs.clear();
      }
      inputs.forEach(function (port) {
        if (port instanceof MIDIInput) {
          port = port.id;
        }
        if (_this4._midiOutputs.has(port)) {
          _this4._midiOutputs.delete(port);
        }
      });
      //this._midiOutputs = this._midiOutputs.filter(...outputs)
      //console.log(this._midiInputs)
    }
  }, {
    key: 'getMIDIInputs',
    value: function getMIDIInputs() {
      return Array.from(this._midiInputs.values());
    }
  }, {
    key: 'getMIDIOutputs',
    value: function getMIDIOutputs() {
      return Array.from(this._midiOutputs.values());
    }
  }, {
    key: 'setRecordEnabled',
    value: function setRecordEnabled(type) {
      // 'midi', 'audio', empty or anything will disable recording
      this._recordEnabled = type;
    }
  }, {
    key: '_startRecording',
    value: function _startRecording(recordId) {
      if (this._recordEnabled === 'midi') {
        this._recordId = recordId;
        this._recordedEvents = [];
        this._recordPart = new _part.Part(this._recordId);
      }
    }
  }, {
    key: '_stopRecording',
    value: function _stopRecording(recordId) {
      var _recordPart;

      if (this._recordId !== recordId) {
        return;
      }
      (_recordPart = this._recordPart).addEvents.apply(_recordPart, _toConsumableArray(this._recordedEvents));
      //this._song._newEvents.push(...this._recordedEvents)
      this.addParts(this._recordPart);
    }
  }, {
    key: 'undoRecording',
    value: function undoRecording(recordId) {
      if (this._recordId !== recordId) {
        return;
      }
      this.removeParts(this._recordPart);
      //this._song._removedEvents.push(...this._recordedEvents)
    }
  }, {
    key: 'redoRecording',
    value: function redoRecording(recordId) {
      if (this._recordId !== recordId) {
        return;
      }
      this.addParts(this._recordPart);
    }
  }, {
    key: 'copy',
    value: function copy() {
      var t = new Track(this.name + '_copy'); // implement getNameOfCopy() in util (see heartbeat)
      var parts = [];
      this._parts.forEach(function (part) {
        var copy = part.copy();
        console.log(copy);
        parts.push(copy);
      });
      t.addParts.apply(t, parts);
      t.update();
      return t;
    }
  }, {
    key: 'transpose',
    value: function transpose(amount) {
      this._events.forEach(function (event) {
        event.transpose(amount);
      });
    }
  }, {
    key: 'addParts',
    value: function addParts() {
      var _this5 = this;

      var song = this._song;

      for (var _len5 = arguments.length, parts = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        parts[_key5] = arguments[_key5];
      }

      parts.forEach(function (part) {
        var _events;

        part._track = _this5;
        _this5._partsById.set(part.id, part);
        _this5._parts.push(part);
        if (song) {
          part._song = song;
          song._newParts.push(part);
        }

        var events = part._events;
        events.forEach(function (event) {
          event._track = _this5;
          if (song) {
            event._song = song;
            song._newEvents.push(event);
          }
          _this5._eventsById.set(event.id, event);
        });
        (_events = _this5._events).push.apply(_events, _toConsumableArray(events));
      });
      this._needsUpdate = true;
    }
  }, {
    key: 'removeParts',
    value: function removeParts() {
      var _this6 = this;

      var song = this._song;

      for (var _len6 = arguments.length, parts = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        parts[_key6] = arguments[_key6];
      }

      parts.forEach(function (part) {
        part._track = null;
        _this6._partsById.delete(part.id, part);
        if (song) {
          song._removedParts.push(part);
        }

        var events = part._events;
        events.forEach(function (event) {
          event._track = null;
          if (song) {
            event._song = null;
            //song._deletedEvents.push(event)
          }
          _this6._eventsById.delete(event.id, event);
        });
      });
      this._needsUpdate = true;
      this._createEventArray = true;
    }
  }, {
    key: 'getParts',
    value: function getParts() {
      if (this._needsUpdate) {
        this._parts = Array.from(this._partsById.values());
        this._events = Array.from(this._eventsById.values());
        this._needsUpdate = false;
      }
      return [].concat(_toConsumableArray(this._parts));
    }
  }, {
    key: 'transposeParts',
    value: function transposeParts(amount) {
      for (var _len7 = arguments.length, parts = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
        parts[_key7 - 1] = arguments[_key7];
      }

      parts.forEach(function (part) {
        part.transpose(amount);
      });
    }
  }, {
    key: 'moveParts',
    value: function moveParts(ticks) {
      for (var _len8 = arguments.length, parts = Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
        parts[_key8 - 1] = arguments[_key8];
      }

      parts.forEach(function (part) {
        part.move(ticks);
      });
    }
  }, {
    key: 'movePartsTo',
    value: function movePartsTo(ticks) {
      for (var _len9 = arguments.length, parts = Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
        parts[_key9 - 1] = arguments[_key9];
      }

      parts.forEach(function (part) {
        part.moveTo(ticks);
      });
    }
  }, {
    key: 'addEvents',
    value: function addEvents() {
      var p = new _part.Part();
      p.addEvents.apply(p, arguments);
      this.addParts(p);
    }
  }, {
    key: 'removeEvents',
    value: function removeEvents() {
      var _this7 = this;

      var parts = new Set();

      for (var _len10 = arguments.length, events = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        events[_key10] = arguments[_key10];
      }

      events.forEach(function (event) {
        parts.set(event._part);
        event._part = null;
        event._track = null;
        event._song = null;
        _this7._eventsById.delete(event.id);
      });
      if (this._song) {
        var _song$_changedParts, _song$_removedEvents;

        (_song$_changedParts = this._song._changedParts).push.apply(_song$_changedParts, _toConsumableArray(Array.from(parts.entries())));
        (_song$_removedEvents = this._song._removedEvents).push.apply(_song$_removedEvents, events);
      }
      this._needsUpdate = true;
      this._createEventArray = true;
    }
  }, {
    key: 'moveEvents',
    value: function moveEvents(ticks) {
      var parts = new Set();

      for (var _len11 = arguments.length, events = Array(_len11 > 1 ? _len11 - 1 : 0), _key11 = 1; _key11 < _len11; _key11++) {
        events[_key11 - 1] = arguments[_key11];
      }

      events.forEach(function (event) {
        event.move(ticks);
        parts.set(event.part);
      });
      if (this._song) {
        var _song$_changedParts2, _song$_movedEvents;

        (_song$_changedParts2 = this._song._changedParts).push.apply(_song$_changedParts2, _toConsumableArray(Array.from(parts.entries())));
        (_song$_movedEvents = this._song._movedEvents).push.apply(_song$_movedEvents, events);
      }
    }
  }, {
    key: 'moveEventsTo',
    value: function moveEventsTo(ticks) {
      var parts = new Set();

      for (var _len12 = arguments.length, events = Array(_len12 > 1 ? _len12 - 1 : 0), _key12 = 1; _key12 < _len12; _key12++) {
        events[_key12 - 1] = arguments[_key12];
      }

      events.forEach(function (event) {
        event.moveTo(ticks);
        parts.set(event.part);
      });
      if (this._song) {
        var _song$_changedParts3, _song$_movedEvents2;

        (_song$_changedParts3 = this._song._changedParts).push.apply(_song$_changedParts3, _toConsumableArray(Array.from(parts.entries())));
        (_song$_movedEvents2 = this._song._movedEvents).push.apply(_song$_movedEvents2, events);
      }
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      // can be use as findEvents
      if (this._needsUpdate) {
        this.update();
      }
      return [].concat(_toConsumableArray(this._events)); //@TODO implement filter -> filterEvents() should be a utility function (not a class method)
    }
  }, {
    key: 'mute',
    value: function mute() {
      var flag = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (flag) {
        this._muted = flag;
      } else {
        this._muted = !this._muted;
      }
    }
  }, {
    key: 'update',
    value: function update() {
      // you should only use this in huge songs (>100 tracks)
      if (this._createEventArray) {
        this._events = Array.from(this._eventsById.values());
        this._createEventArray = false;
      }
      (0, _util.sortEvents)(this._events);
      this._needsUpdate = false;
    }
  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      if (this._instrument !== null) {
        this._instrument.allNotesOff();
      }

      var timeStamp = _init_audio.context.currentTime * 1000 + this.latency;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._midiOutputs.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var output = _step.value;

          output.send([0xB0, 0x7B, 0x00], timeStamp); // stop all notes
          output.send([0xB0, 0x79, 0x00], timeStamp); // reset all controllers
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'processMIDIEvent',
    value: function processMIDIEvent(event) {
      var useLatency = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


      var latency = useLatency ? this.latency : 0;
      //console.log(latency)

      // send to javascript instrument
      if (this._instrument !== null) {
        this._instrument.processMIDIEvent(event, event.time / 1000);
      }

      // send to external hardware or software instrument
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._midiOutputs.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var port = _step2.value;

          if (port) {
            if (event.type === 128 || event.type === 144 || event.type === 176) {
              port.send([event.type + this.channel, event.data1, event.data2], event.time + latency);
            } else if (event.type === 192 || event.type === 224) {
              port.send([event.type + this.channel, event.data1], event.time + latency);
            }
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }]);

  return Track;
}();
},{"./init_audio":7,"./init_midi":8,"./instrument":9,"./midi_event":11,"./midi_note":12,"./part":18,"./qambi":21,"./util":29}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.getNiceTime = getNiceTime;
exports.base64ToBinary = base64ToBinary;
exports.typeString = typeString;
exports.sortEvents = sortEvents;
exports.checkIfBase64 = checkIfBase64;
exports.getEqualPowerCurve = getEqualPowerCurve;
exports.checkMIDINumber = checkMIDINumber;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mPI = Math.PI,
    mPow = Math.pow,
    mRound = Math.round,
    mFloor = Math.floor,
    mRandom = Math.random;

function getNiceTime(millis) {
  var h = void 0,
      m = void 0,
      s = void 0,
      ms = void 0,
      seconds = void 0,
      timeAsString = '';

  seconds = millis / 1000; // → millis to seconds
  h = mFloor(seconds / (60 * 60));
  m = mFloor(seconds % (60 * 60) / 60);
  s = mFloor(seconds % 60);
  ms = mRound((seconds - h * 3600 - m * 60 - s) * 1000);

  timeAsString += h + ':';
  timeAsString += m < 10 ? '0' + m : m;
  timeAsString += ':';
  timeAsString += s < 10 ? '0' + s : s;
  timeAsString += ':';
  timeAsString += ms === 0 ? '000' : ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : ms;

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

// adapted version of https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js
function base64ToBinary(input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
      bytes = void 0,
      uarray = void 0,
      buffer = void 0,
      lkey1 = void 0,
      lkey2 = void 0,
      chr1 = void 0,
      chr2 = void 0,
      chr3 = void 0,
      enc1 = void 0,
      enc2 = void 0,
      enc3 = void 0,
      enc4 = void 0,
      i = void 0,
      j = 0;

  bytes = Math.ceil(3 * input.length / 4.0);
  buffer = new ArrayBuffer(bytes);
  uarray = new Uint8Array(buffer);

  lkey1 = keyStr.indexOf(input.charAt(input.length - 1));
  lkey2 = keyStr.indexOf(input.charAt(input.length - 1));
  if (lkey1 == 64) bytes--; //padding chars, so skip
  if (lkey2 == 64) bytes--; //padding chars, so skip

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

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

function typeString(o) {
  if ((typeof o === 'undefined' ? 'undefined' : _typeof(o)) != 'object') {
    return typeof o === 'undefined' ? 'undefined' : _typeof(o);
  }

  if (o === null) {
    return 'null';
  }

  //object, array, function, date, regexp, string, number, boolean, error
  var internalClass = Object.prototype.toString.call(o).match(/\[object\s(\w+)\]/)[1];
  return internalClass.toLowerCase();
}

function sortEvents(events) {
  events.sort(function (a, b) {
    if (a.ticks === b.ticks) {
      var r = a.type - b.type;
      if (a.type === 176 && b.type === 144) {
        r = -1;
      }
      return r;
    }
    return a.ticks - b.ticks;
  });
}

function checkIfBase64(data) {
  var passed = true;
  try {
    atob(data);
  } catch (e) {
    passed = false;
  }
  return passed;
}

function getEqualPowerCurve(numSteps, type, maxValue) {
  var i = void 0,
      value = void 0,
      percent = void 0,
      values = new Float32Array(numSteps);

  for (i = 0; i < numSteps; i++) {
    percent = i / numSteps;
    if (type === 'fadeIn') {
      value = Math.cos((1.0 - percent) * 0.5 * mPI) * maxValue;
    } else if (type === 'fadeOut') {
      value = Math.cos(percent * 0.5 * Math.PI) * maxValue;
    }
    values[i] = value;
    if (i === numSteps - 1) {
      values[i] = type === 'fadeIn' ? 1 : 0;
    }
  }
  return values;
}

function checkMIDINumber(value) {
  //console.log(value);
  if (isNaN(value)) {
    console.warn('please provide a number');
    return false;
  }
  if (value < 0 || value > 127) {
    console.warn('please provide a number between 0 and 127');
    return false;
  }
  return value;
}

/*
//old school ajax

export function ajax(config){
  let
    request = new XMLHttpRequest(),
    method = typeof config.method === 'undefined' ? 'GET' : config.method,
    fileSize;

  function executor(resolve, reject){

    reject = reject || function(){};
    resolve = resolve || function(){};

    request.onload = function(){
      if(request.status !== 200){
        reject(request.status);
        return;
      }

      if(config.responseType === 'json'){
        fileSize = request.response.length;
        resolve(JSON.parse(request.response), fileSize);
        request = null;
      }else{
        resolve(request.response);
        request = null;
      }
    };

    request.onerror = function(e){
      config.onError(e);
    };

    request.open(method, config.url, true);

    if(config.overrideMimeType){
      request.overrideMimeType(config.overrideMimeType);
    }

    if(config.responseType){
      if(config.responseType === 'json'){
        request.responseType = 'text';
      }else{
        request.responseType = config.responseType;
      }
    }

    if(method === 'POST') {
      request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }

    if(config.data){
      request.send(config.data);
    }else{
      request.send();
    }
  }

  return new Promise(executor);
}
*/
},{"isomorphic-fetch":2}],30:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtaWRpZmlsZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pc29tb3JwaGljLWZldGNoL2ZldGNoLW5wbS1icm93c2VyaWZ5LmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvY29uc3RhbnRzLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvZXZlbnRsaXN0ZW5lci5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2ZldGNoX2hlbHBlcnMuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9pbml0LmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvaW5pdF9hdWRpby5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2luaXRfbWlkaS5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2luc3RydW1lbnQuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9tZXRyb25vbWUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9taWRpX2V2ZW50LmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvbWlkaV9ub3RlLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvbWlkaV9zdHJlYW0uanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9taWRpZmlsZS5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L25vdGUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9wYXJzZV9hdWRpby5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3BhcnNlX2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3BhcnQuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9wbGF5aGVhZC5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3Bvc2l0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvcWFtYmkuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zYW1wbGUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zYW1wbGVzLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2NoZWR1bGVyLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2V0dGluZ3MuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zb25nLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvdHJhY2suanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC91dGlsLmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFRQTs7Ozs7O0FBRUEsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVTs7QUFFdEQsTUFBSSxhQUFKOztBQUVBLGtCQUFNLElBQU4sR0FDQyxJQURELENBQ00sWUFBTTs7QUFFVixRQUFJLE9BQU8sQ0FBWDs7QUFFQSxRQUFHLFNBQVMsQ0FBWixFQUFjOzs7O0FBSVoscUNBQU0sMEJBQU4sRUFDQyxJQURELENBQ00sb0JBQVk7QUFDaEIsZUFBTyxTQUFTLFdBQVQsRUFBUDtBQUNELE9BSEQsRUFJQyxJQUpELENBSU0sZ0JBQVE7QUFDWixlQUFPLFlBQUssWUFBTCxDQUFrQixJQUFsQixDQUFQO0FBQ0E7O0FBRUQsT0FSRDtBQVVELEtBZEQsTUFjTSxJQUFHLFNBQVMsQ0FBWixFQUFjOzs7QUFHbEIsb0JBQUssaUJBQUwsQ0FBdUIsMEJBQXZCLEVBQ0MsSUFERCxDQUNNLGFBQUs7QUFDVCxpQkFBTyxDQUFQOztBQUVBO0FBQ0QsU0FMRCxFQUtHO0FBQUEsaUJBQUssUUFBUSxHQUFSLENBQVksQ0FBWixDQUFMO0FBQUEsU0FMSDtBQU1EO0FBQ0YsR0E3QkQ7O0FBZ0NBLFdBQVMsTUFBVCxHQUFpQjs7QUFFZixTQUFLLFNBQUwsR0FBaUIsT0FBakIsQ0FBeUIsaUJBQVM7QUFDaEMsWUFBTSxhQUFOLENBQW9CLHVCQUFwQjtBQUNELEtBRkQ7O0FBSUEsUUFBSSxVQUFVLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFkO0FBQ0EsUUFBSSxXQUFXLFNBQVMsY0FBVCxDQUF3QixPQUF4QixDQUFmO0FBQ0EsUUFBSSxVQUFVLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFkO0FBQ0EsUUFBSSxVQUFVLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFkO0FBQ0EsUUFBSSxZQUFZLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUFoQjtBQUNBLFFBQUksV0FBVyxTQUFTLGNBQVQsQ0FBd0IsT0FBeEIsQ0FBZjtBQUNBLFFBQUksYUFBYSxTQUFTLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBakI7QUFDQSxRQUFJLGNBQWMsU0FBUyxjQUFULENBQXdCLFVBQXhCLENBQWxCO0FBQ0EsUUFBSSxjQUFjLFNBQVMsY0FBVCxDQUF3QixVQUF4QixDQUFsQjtBQUNBLFFBQUksY0FBYyxTQUFTLGNBQVQsQ0FBd0IsVUFBeEIsQ0FBbEI7QUFDQSxRQUFJLGtCQUFrQixTQUFTLGNBQVQsQ0FBd0IsZUFBeEIsQ0FBdEI7QUFDQSxRQUFJLGdCQUFnQixTQUFTLGNBQVQsQ0FBd0IsVUFBeEIsQ0FBcEI7QUFDQSxRQUFJLGtCQUFrQixLQUF0Qjs7QUFFQSxZQUFRLFFBQVIsR0FBbUIsS0FBbkI7QUFDQSxhQUFTLFFBQVQsR0FBb0IsS0FBcEI7QUFDQSxZQUFRLFFBQVIsR0FBbUIsS0FBbkI7QUFDQSxZQUFRLFFBQVIsR0FBbUIsS0FBbkI7QUFDQSxjQUFVLFFBQVYsR0FBcUIsS0FBckI7O0FBRUEsWUFBUSxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxZQUFVOzs7O0FBSTFDLFdBQUssSUFBTDtBQUNELEtBTEQ7O0FBT0EsYUFBUyxnQkFBVCxDQUEwQixPQUExQixFQUFtQyxZQUFVO0FBQzNDLFdBQUssS0FBTDtBQUNELEtBRkQ7O0FBSUEsWUFBUSxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxZQUFVO0FBQzFDLFdBQUssSUFBTDtBQUNELEtBRkQ7O0FBSUEsWUFBUSxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxZQUFVO0FBQzFDLFVBQUksT0FBTyxLQUFLLE9BQUwsRUFBWDtBQUNBLGNBQVEsR0FBUixDQUFZLElBQVo7QUFDQSxjQUFRLFNBQVIsR0FBb0IsT0FBTyxXQUFQLEdBQXFCLFlBQXpDO0FBQ0QsS0FKRDs7QUFPQSxRQUFJLG1CQUFKOztBQUVBLGNBQVUsZ0JBQVYsQ0FBMkIsT0FBM0IsRUFBb0MsWUFBVTtBQUM1QyxtQkFBYSxLQUFLLFNBQUwsR0FBaUIsQ0FBakIsQ0FBYjs7QUFFQSxhQUFPLElBQVA7QUFDQSxjQUFRLEdBQVIsQ0FBWSxVQUFaLEU7QUFDQSxpQkFBVyxZQUFVO0FBQ25CLHFCQUFhLElBQWI7QUFDQSxnQkFBUSxHQUFSLENBQVksZ0JBQVo7QUFDRCxPQUhELEVBR0csSUFISDtBQUlELEtBVEQ7Ozs7OztBQWVBLFNBQUssZ0JBQUwsQ0FBc0IsY0FBdEIsRUFBc0MsaUJBQVM7QUFDN0MsaUJBQVcsU0FBWCxHQUF1QixrQkFBa0IsTUFBTSxJQUEvQztBQUNELEtBRkQ7O0FBSUEsU0FBSyxnQkFBTCxDQUFzQixlQUF0QixFQUF1QyxpQkFBUztBQUM5QyxrQkFBWSxTQUFaLEdBQXdCLG1CQUFtQixNQUFNLElBQWpEO0FBQ0QsS0FGRDs7QUFJQSxTQUFLLGdCQUFMLENBQXNCLHNCQUFlLGNBQXJDLEVBQXFELGlCQUFTO0FBQzVELFVBQUcsTUFBTSxLQUFOLEtBQWdCLEVBQW5CLEVBQXNCO0FBQ3BCO0FBQ0Q7QUFDRCxVQUFHLE1BQU0sS0FBTixLQUFnQixHQUFuQixFQUF1QjtBQUNyQixvQkFBWSxTQUFaLEdBQXdCLG9CQUF4QjtBQUNELE9BRkQsTUFFTSxJQUFHLE1BQU0sS0FBTixLQUFnQixDQUFuQixFQUFxQjtBQUN6QixvQkFBWSxTQUFaLEdBQXdCLGtCQUF4QjtBQUNEO0FBQ0YsS0FURDs7QUFXQSxTQUFLLGdCQUFMLENBQXNCLFFBQXRCLEVBQWdDLGlCQUFTO0FBQ3ZDLFVBQUksT0FBTyxNQUFNLElBQWpCOztBQUVELEtBSEQ7O0FBS0EsU0FBSyxnQkFBTCxDQUFzQixTQUF0QixFQUFpQyxpQkFBUztBQUN4QyxVQUFJLE9BQU8sTUFBTSxJQUFqQjs7QUFFRCxLQUhEOztBQUtBLFNBQUssZ0JBQUwsQ0FBc0IsTUFBdEIsRUFBOEIsaUJBQVM7QUFDckMsY0FBUSxHQUFSLENBQVksOEJBQVosRUFBNEMsTUFBTSxJQUFsRDtBQUNELEtBRkQ7O0FBSUEsU0FBSyxnQkFBTCxDQUFzQixNQUF0QixFQUE4QixZQUFNO0FBQ2xDLGNBQVEsR0FBUixDQUFZLE1BQVo7QUFDQSxvQkFBYyxLQUFkLEdBQXNCLENBQXRCO0FBQ0QsS0FIRDs7QUFLQSxTQUFLLGdCQUFMLENBQXNCLE9BQXRCLEVBQStCLGlCQUFTO0FBQ3RDLGNBQVEsR0FBUixDQUFZLFNBQVosRUFBdUIsTUFBTSxJQUE3Qjs7QUFFRCxLQUhEOztBQUtBLFFBQUksV0FBVyxLQUFLLFdBQUwsRUFBZjtBQUNBLGdCQUFZLFNBQVosR0FBd0IsU0FBUyxZQUFqQztBQUNBLG9CQUFnQixTQUFoQixHQUE0QixTQUFTLFlBQXJDO0FBQ0EsYUFBUyxTQUFULGVBQStCLFNBQVMsR0FBeEM7O0FBRUEsU0FBSyxnQkFBTCxDQUFzQixVQUF0QixFQUFrQyxpQkFBUztBQUN6QyxrQkFBWSxTQUFaLEdBQXdCLE1BQU0sSUFBTixDQUFXLFlBQW5DO0FBQ0Esc0JBQWdCLFNBQWhCLEdBQTRCLE1BQU0sSUFBTixDQUFXLFlBQXZDO0FBQ0EsZUFBUyxTQUFULGVBQStCLE1BQU0sSUFBTixDQUFXLEdBQTFDO0FBQ0EsVUFBRyxDQUFDLGVBQUosRUFBb0I7QUFDbEIsc0JBQWMsS0FBZCxHQUFzQixNQUFNLElBQU4sQ0FBVyxVQUFqQztBQUNEO0FBQ0YsS0FQRDs7QUFTQSxrQkFBYyxnQkFBZCxDQUErQixTQUEvQixFQUEwQyxhQUFLO0FBQzdDLG9CQUFjLG1CQUFkLENBQWtDLFdBQWxDLEVBQStDLGFBQS9DO0FBQ0Esd0JBQWtCLEtBQWxCO0FBQ0QsS0FIRDs7QUFLQSxrQkFBYyxnQkFBZCxDQUErQixXQUEvQixFQUE0QyxhQUFLO0FBQy9DLGlCQUFXLFlBQVU7QUFDbkIsYUFBSyxXQUFMLENBQWlCLFlBQWpCLEVBQStCLEVBQUUsTUFBRixDQUFTLGFBQXhDO0FBQ0QsT0FGRCxFQUVHLENBRkg7QUFHQSxvQkFBYyxnQkFBZCxDQUErQixXQUEvQixFQUE0QyxhQUE1QztBQUNBLHdCQUFrQixJQUFsQjtBQUNELEtBTkQ7O0FBUUEsUUFBTSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBUyxDQUFULEVBQVc7QUFDL0IsV0FBSyxXQUFMLENBQWlCLFlBQWpCLEVBQStCLEVBQUUsTUFBRixDQUFTLGFBQXhDO0FBQ0QsS0FGRDs7QUFLQSxTQUFLLFdBQUwsQ0FBaUIsV0FBakIsRUFBOEIsQ0FBOUI7QUFDQSxTQUFLLGNBQUwsQ0FBb0IsV0FBcEIsRUFBaUMsQ0FBakM7QUFDQSxTQUFLLGVBQUwsQ0FBcUIsV0FBckIsRUFBa0MsQ0FBbEMsRUFBcUMsQ0FBckM7QUFDQSxTQUFLLE9BQUw7OztBQUlEO0FBRUYsQ0F6TEQsRTs7OztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzljQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbnlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgcWFtYmksIHtcbiAgU29uZyxcbiAgTUlESUV2ZW50VHlwZXMsXG4gIEluc3RydW1lbnQsXG59IGZyb20gJ3FhbWJpJyAvLyB1c2UgdGhpcyBmb3IgZGVwbG95bWVudFxuLy99IGZyb20gJy4uLy4uL3NyYy9xYW1iaSdcblxuXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG5cbiAgbGV0IHNvbmdcblxuICBxYW1iaS5pbml0KClcbiAgLnRoZW4oKCkgPT4ge1xuXG4gICAgbGV0IHRlc3QgPSAxXG5cbiAgICBpZih0ZXN0ID09PSAxKXtcblxuICAgICAgLy9jb25zb2xlLnRpbWUoJ3NvbmcnKVxuICAgICAgLy9mZXRjaCgnLi4vZGF0YS9tb3prNTQ1YS5taWQnKVxuICAgICAgZmV0Y2goJy4uL2RhdGEvbWludXRlX3dhbHR6Lm1pZCcpXG4gICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5hcnJheUJ1ZmZlcigpXG4gICAgICB9KVxuICAgICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIHNvbmcgPSBTb25nLmZyb21NSURJRmlsZShkYXRhKVxuICAgICAgICBpbml0VUkoKVxuICAgICAgICAvL2NvbnNvbGUudGltZUVuZCgnc29uZycpXG4gICAgICB9KVxuXG4gICAgfWVsc2UgaWYodGVzdCA9PT0gMil7XG5cbiAgICAgIC8vY29uc29sZS50aW1lKCdzb25nJylcbiAgICAgIFNvbmcuZnJvbU1JRElGaWxlQXN5bmMoJy4uL2RhdGEvbWludXRlX3dhbHR6Lm1pZCcpXG4gICAgICAudGhlbihzID0+IHtcbiAgICAgICAgc29uZyA9IHNcbiAgICAgICAgLy9jb25zb2xlLnRpbWVFbmQoJ3NvbmcnKVxuICAgICAgICBpbml0VUkoKVxuICAgICAgfSwgZSA9PiBjb25zb2xlLmxvZyhlKSlcbiAgICB9XG4gIH0pXG5cblxuICBmdW5jdGlvbiBpbml0VUkoKXtcblxuICAgIHNvbmcuZ2V0VHJhY2tzKCkuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5zZXRJbnN0cnVtZW50KG5ldyBJbnN0cnVtZW50KCkpXG4gICAgfSlcblxuICAgIGxldCBidG5QbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXknKVxuICAgIGxldCBidG5QYXVzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXVzZScpXG4gICAgbGV0IGJ0blN0b3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcCcpXG4gICAgbGV0IGJ0bkxvb3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9vcCcpXG4gICAgbGV0IGJ0bkRlbGV0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxldGUnKVxuICAgIGxldCBkaXZUZW1wbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZW1wbycpXG4gICAgbGV0IGRpdlN1c3RhaW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VzdGFpbicpXG4gICAgbGV0IGRpdlN1c3RhaW4yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1c3RhaW4yJylcbiAgICBsZXQgZGl2U3VzdGFpbjMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VzdGFpbjMnKVxuICAgIGxldCBkaXZQb3NpdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwb3NpdGlvbicpXG4gICAgbGV0IGRpdlBvc2l0aW9uVGltZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwb3NpdGlvbl90aW1lJylcbiAgICBsZXQgcmFuZ2VQb3NpdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5aGVhZCcpXG4gICAgbGV0IHVzZXJJbnRlcmFjdGlvbiA9IGZhbHNlXG5cbiAgICBidG5QbGF5LmRpc2FibGVkID0gZmFsc2VcbiAgICBidG5QYXVzZS5kaXNhYmxlZCA9IGZhbHNlXG4gICAgYnRuU3RvcC5kaXNhYmxlZCA9IGZhbHNlXG4gICAgYnRuTG9vcC5kaXNhYmxlZCA9IGZhbHNlXG4gICAgYnRuRGVsZXRlLmRpc2FibGVkID0gZmFsc2VcblxuICAgIGJ0blBsYXkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgLy9zb25nLnBsYXkoJ2JhcnNiZWF0cycsIDQsIDEsIDEsIDApXG4gICAgICAvL3NvbmcucGxheSgndGltZScsIDAsIDAsIDE1KSAvLyBwbGF5IGZyb20gMTUgc2Vjb25kc1xuICAgICAgLy9zb25nLnBsYXkoJ21pbGxpcycsIDM0MDAwKSAvLyBwbGF5IGZyb20gMzQgc2Vjb25kc1xuICAgICAgc29uZy5wbGF5KClcbiAgICB9KTtcblxuICAgIGJ0blBhdXNlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcucGF1c2UoKVxuICAgIH0pXG5cbiAgICBidG5TdG9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcuc3RvcCgpXG4gICAgfSlcblxuICAgIGJ0bkxvb3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgbGV0IGxvb3AgPSBzb25nLnNldExvb3AoKVxuICAgICAgY29uc29sZS5sb2cobG9vcClcbiAgICAgIGJ0bkxvb3AuaW5uZXJIVE1MID0gbG9vcCA/ICdzdG9wIGxvb3AnIDogJ3N0YXJ0IGxvb3AnXG4gICAgfSlcblxuXG4gICAgbGV0IG1lbW9yeUxlYWtcblxuICAgIGJ0bkRlbGV0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICBtZW1vcnlMZWFrID0gc29uZy5nZXRFdmVudHMoKVswXVxuICAgICAgLy9zb25nLmRpc3Bvc2UoKVxuICAgICAgc29uZyA9IG51bGxcbiAgICAgIGNvbnNvbGUubG9nKG1lbW9yeUxlYWspIC8vIC0+IHRoaXMgZXZlbnQgcmV0YWlucyB0aGUgd2hvbGUgc29uZyFcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgbWVtb3J5TGVhayA9IG51bGxcbiAgICAgICAgY29uc29sZS5sb2coJ21lbW9yeSBjbGVhcmVkJylcbiAgICAgIH0sIDUwMDApXG4gICAgfSlcblxuICAgIC8vIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcihNSURJRXZlbnRUeXBlcy5URU1QTywgZXZlbnQgPT4ge1xuICAgIC8vICAgZGl2VGVtcG8uaW5uZXJIVE1MID0gYHRlbXBvOiAke2V2ZW50LmJwbX0gYnBtYFxuICAgIC8vIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ3N1c3RhaW5wZWRhbCcsIGV2ZW50ID0+IHtcbiAgICAgIGRpdlN1c3RhaW4uaW5uZXJIVE1MID0gJ3N1c3RhaW5wZWRhbCAnICsgZXZlbnQuZGF0YVxuICAgIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ3N1c3RhaW5wZWRhbDInLCBldmVudCA9PiB7XG4gICAgICBkaXZTdXN0YWluMi5pbm5lckhUTUwgPSAnc3VzdGFpbnBlZGFsMiAnICsgZXZlbnQuZGF0YVxuICAgIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoTUlESUV2ZW50VHlwZXMuQ09OVFJPTF9DSEFOR0UsIGV2ZW50ID0+IHtcbiAgICAgIGlmKGV2ZW50LmRhdGExICE9PSA2NCl7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDEyNyl7XG4gICAgICAgIGRpdlN1c3RhaW4zLmlubmVySFRNTCA9ICdzdXN0YWlucGVkYWwzIGRvd24nXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMCl7XG4gICAgICAgIGRpdlN1c3RhaW4zLmlubmVySFRNTCA9ICdzdXN0YWlucGVkYWwzIHVwJ1xuICAgICAgfVxuICAgIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ25vdGVPbicsIGV2ZW50ID0+IHtcbiAgICAgIGxldCBub3RlID0gZXZlbnQuZGF0YVxuICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9uJywgbm90ZS5pZCwgbm90ZS5ub3RlT24uaWQsIG5vdGUubm90ZU9uLmRhdGExLCBub3RlLm5vdGVPbi50aWNrcylcbiAgICB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdub3RlT2ZmJywgZXZlbnQgPT4ge1xuICAgICAgbGV0IG5vdGUgPSBldmVudC5kYXRhXG4gICAgICAvL2NvbnNvbGUubG9nKCdub3RlT2ZmJywgbm90ZS5pZCwgbm90ZS5ub3RlT2ZmLmlkLCBub3RlLm5vdGVPZmYuZGF0YTEsIG5vdGUubm90ZU9mZi50aWNrcylcbiAgICB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdwbGF5JywgZXZlbnQgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ3N0YXJ0ZWQgcGxheWluZyBhdCBwb3NpdGlvbjonLCBldmVudC5kYXRhKVxuICAgIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ3N0b3AnLCAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnc3RvcCcpXG4gICAgICByYW5nZVBvc2l0aW9uLnZhbHVlID0gMFxuICAgIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ3BhdXNlJywgZXZlbnQgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ3BhdXNlZDonLCBldmVudC5kYXRhKVxuICAgICAgLy9jb25zb2xlLmxvZyhzb25nLmdldFBvc2l0aW9uKCkpXG4gICAgfSlcblxuICAgIGxldCBwb3NpdGlvbiA9IHNvbmcuZ2V0UG9zaXRpb24oKVxuICAgIGRpdlBvc2l0aW9uLmlubmVySFRNTCA9IHBvc2l0aW9uLmJhcnNBc1N0cmluZ1xuICAgIGRpdlBvc2l0aW9uVGltZS5pbm5lckhUTUwgPSBwb3NpdGlvbi50aW1lQXNTdHJpbmdcbiAgICBkaXZUZW1wby5pbm5lckhUTUwgPSBgdGVtcG86ICR7cG9zaXRpb24uYnBtfSBicG1gXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ3Bvc2l0aW9uJywgZXZlbnQgPT4ge1xuICAgICAgZGl2UG9zaXRpb24uaW5uZXJIVE1MID0gZXZlbnQuZGF0YS5iYXJzQXNTdHJpbmdcbiAgICAgIGRpdlBvc2l0aW9uVGltZS5pbm5lckhUTUwgPSBldmVudC5kYXRhLnRpbWVBc1N0cmluZ1xuICAgICAgZGl2VGVtcG8uaW5uZXJIVE1MID0gYHRlbXBvOiAke2V2ZW50LmRhdGEuYnBtfSBicG1gXG4gICAgICBpZighdXNlckludGVyYWN0aW9uKXtcbiAgICAgICAgcmFuZ2VQb3NpdGlvbi52YWx1ZSA9IGV2ZW50LmRhdGEucGVyY2VudGFnZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByYW5nZVBvc2l0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBlID0+IHtcbiAgICAgIHJhbmdlUG9zaXRpb24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmFuZ2VMaXN0ZW5lcilcbiAgICAgIHVzZXJJbnRlcmFjdGlvbiA9IGZhbHNlXG4gICAgfSlcblxuICAgIHJhbmdlUG9zaXRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIHNvbmcuc2V0UG9zaXRpb24oJ3BlcmNlbnRhZ2UnLCBlLnRhcmdldC52YWx1ZUFzTnVtYmVyKVxuICAgICAgfSwgMClcbiAgICAgIHJhbmdlUG9zaXRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmFuZ2VMaXN0ZW5lcilcbiAgICAgIHVzZXJJbnRlcmFjdGlvbiA9IHRydWVcbiAgICB9KVxuXG4gICAgY29uc3QgcmFuZ2VMaXN0ZW5lciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgc29uZy5zZXRQb3NpdGlvbigncGVyY2VudGFnZScsIGUudGFyZ2V0LnZhbHVlQXNOdW1iZXIpXG4gICAgfVxuXG5cbiAgICBzb25nLnNldFBvc2l0aW9uKCdiYXJzYmVhdHMnLCAyKVxuICAgIHNvbmcuc2V0TGVmdExvY2F0b3IoJ2JhcnNiZWF0cycsIDIpXG4gICAgc29uZy5zZXRSaWdodExvY2F0b3IoJ2JhcnNiZWF0cycsIDMsIDIpXG4gICAgc29uZy5zZXRMb29wKClcblxuXG4gICAgLy9jb25zb2xlLmxvZyhzb25nLmdldFBvc2l0aW9uKCkpXG4gIH1cblxufSlcbiIsIi8vIHRoZSB3aGF0d2ctZmV0Y2ggcG9seWZpbGwgaW5zdGFsbHMgdGhlIGZldGNoKCkgZnVuY3Rpb25cbi8vIG9uIHRoZSBnbG9iYWwgb2JqZWN0ICh3aW5kb3cgb3Igc2VsZilcbi8vXG4vLyBSZXR1cm4gdGhhdCBhcyB0aGUgZXhwb3J0IGZvciB1c2UgaW4gV2VicGFjaywgQnJvd3NlcmlmeSBldGMuXG5yZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKTtcbm1vZHVsZS5leHBvcnRzID0gc2VsZi5mZXRjaC5iaW5kKHNlbGYpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG4vLyBzdGFuZGFyZCBNSURJIGV2ZW50c1xudmFyIE1JRElFdmVudFR5cGVzID0ge307XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ05PVEVfT0ZGJywgeyB2YWx1ZTogMHg4MCB9KTsgLy8xMjhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ05PVEVfT04nLCB7IHZhbHVlOiAweDkwIH0pOyAvLzE0NFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUE9MWV9QUkVTU1VSRScsIHsgdmFsdWU6IDB4QTAgfSk7IC8vMTYwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDT05UUk9MX0NIQU5HRScsIHsgdmFsdWU6IDB4QjAgfSk7IC8vMTc2XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQUk9HUkFNX0NIQU5HRScsIHsgdmFsdWU6IDB4QzAgfSk7IC8vMTkyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDSEFOTkVMX1BSRVNTVVJFJywgeyB2YWx1ZTogMHhEMCB9KTsgLy8yMDhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BJVENIX0JFTkQnLCB7IHZhbHVlOiAweEUwIH0pOyAvLzIyNFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1lTVEVNX0VYQ0xVU0lWRScsIHsgdmFsdWU6IDB4RjAgfSk7IC8vMjQwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdNSURJX1RJTUVDT0RFJywgeyB2YWx1ZTogMjQxIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU09OR19QT1NJVElPTicsIHsgdmFsdWU6IDI0MiB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfU0VMRUNUJywgeyB2YWx1ZTogMjQzIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVFVORV9SRVFVRVNUJywgeyB2YWx1ZTogMjQ2IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU9YJywgeyB2YWx1ZTogMjQ3IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNSU5HX0NMT0NLJywgeyB2YWx1ZTogMjQ4IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1RBUlQnLCB7IHZhbHVlOiAyNTAgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDT05USU5VRScsIHsgdmFsdWU6IDI1MSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NUT1AnLCB7IHZhbHVlOiAyNTIgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdBQ1RJVkVfU0VOU0lORycsIHsgdmFsdWU6IDI1NCB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NZU1RFTV9SRVNFVCcsIHsgdmFsdWU6IDI1NSB9KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVEVNUE8nLCB7IHZhbHVlOiAweDUxIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNRV9TSUdOQVRVUkUnLCB7IHZhbHVlOiAweDU4IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU5EX09GX1RSQUNLJywgeyB2YWx1ZTogMHgyRiB9KTtcblxuZXhwb3J0cy5NSURJRXZlbnRUeXBlcyA9IE1JRElFdmVudFR5cGVzOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG5leHBvcnRzLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuZXhwb3J0cy5hZGRFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lcjtcbmV4cG9ydHMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50TGlzdGVuZXI7XG52YXIgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpIHtcbiAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlKVxuICB2YXIgbWFwID0gdm9pZCAwO1xuXG4gIGlmIChldmVudC50eXBlID09PSAnZXZlbnQnKSB7XG4gICAgdmFyIG1pZGlFdmVudCA9IGV2ZW50LmRhdGE7XG4gICAgdmFyIG1pZGlFdmVudFR5cGUgPSBtaWRpRXZlbnQudHlwZTtcbiAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudFR5cGUpXG4gICAgaWYgKGV2ZW50TGlzdGVuZXJzLmhhcyhtaWRpRXZlbnRUeXBlKSkge1xuICAgICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudFR5cGUpO1xuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IG1hcC52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgY2IgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgIGNiKG1pZGlFdmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChldmVudExpc3RlbmVycy5oYXMoZXZlbnQudHlwZSkgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gbWFwLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICB2YXIgX2NiID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICBfY2IoZXZlbnQpO1xuICAgIH1cblxuICAgIC8vIEB0b2RvOiBydW4gZmlsdGVycyBoZXJlLCBmb3IgaW5zdGFuY2UgaWYgYW4gZXZlbnRsaXN0ZW5lciBoYXMgYmVlbiBhZGRlZCB0byBhbGwgTk9URV9PTiBldmVudHMsIGNoZWNrIHRoZSB0eXBlIG9mIHRoZSBpbmNvbWluZyBldmVudFxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaykge1xuXG4gIHZhciBtYXAgPSB2b2lkIDA7XG4gIHZhciBpZCA9IHR5cGUgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICBpZiAoZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpID09PSBmYWxzZSkge1xuICAgIG1hcCA9IG5ldyBNYXAoKTtcbiAgICBldmVudExpc3RlbmVycy5zZXQodHlwZSwgbWFwKTtcbiAgfSBlbHNlIHtcbiAgICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQodHlwZSk7XG4gIH1cblxuICBtYXAuc2V0KGlkLCBjYWxsYmFjayk7XG4gIC8vY29uc29sZS5sb2coZXZlbnRMaXN0ZW5lcnMpXG4gIHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCkge1xuXG4gIGlmIChldmVudExpc3RlbmVycy5oYXModHlwZSkgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS5sb2coJ25vIGV2ZW50bGlzdGVuZXJzIG9mIHR5cGUnICsgdHlwZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKTtcblxuICBpZiAodHlwZW9mIGlkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zID0gdHJ1ZTtcbiAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzID0gZmFsc2U7XG4gICAgdmFyIF9pdGVyYXRvckVycm9yMyA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IzID0gbWFwLmVudHJpZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMzsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IChfc3RlcDMgPSBfaXRlcmF0b3IzLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zID0gdHJ1ZSkge1xuICAgICAgICB2YXIgX3N0ZXAzJHZhbHVlID0gX3NsaWNlZFRvQXJyYXkoX3N0ZXAzLnZhbHVlLCAyKTtcblxuICAgICAgICB2YXIga2V5ID0gX3N0ZXAzJHZhbHVlWzBdO1xuICAgICAgICB2YXIgdmFsdWUgPSBfc3RlcDMkdmFsdWVbMV07XG5cbiAgICAgICAgY29uc29sZS5sb2coa2V5LCB2YWx1ZSk7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gaWQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAgICAgIGlkID0ga2V5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvcjMgPSB0cnVlO1xuICAgICAgX2l0ZXJhdG9yRXJyb3IzID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zICYmIF9pdGVyYXRvcjMucmV0dXJuKSB7XG4gICAgICAgICAgX2l0ZXJhdG9yMy5yZXR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMykge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBtYXAuZGVsZXRlKGlkKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykge1xuICAgIG1hcC5kZWxldGUoaWQpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdjb3VsZCBub3QgcmVtb3ZlIGV2ZW50bGlzdGVuZXInKTtcbiAgfVxufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5zdGF0dXMgPSBzdGF0dXM7XG5leHBvcnRzLmpzb24gPSBqc29uO1xuZXhwb3J0cy5hcnJheUJ1ZmZlciA9IGFycmF5QnVmZmVyO1xuLy8gZmV0Y2ggaGVscGVyc1xuXG5mdW5jdGlvbiBzdGF0dXMocmVzcG9uc2UpIHtcbiAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSk7XG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0KSk7XG59XG5cbmZ1bmN0aW9uIGpzb24ocmVzcG9uc2UpIHtcbiAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbn1cblxuZnVuY3Rpb24gYXJyYXlCdWZmZXIocmVzcG9uc2UpIHtcbiAgcmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKCk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5CbG9iID0gZXhwb3J0cy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBleHBvcnRzLmdldFVzZXJNZWRpYSA9IHVuZGVmaW5lZDtcbmV4cG9ydHMuaW5pdCA9IGluaXQ7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG52YXIgX2luaXRfbWlkaSA9IHJlcXVpcmUoJy4vaW5pdF9taWRpJyk7XG5cbnZhciBnZXRVc2VyTWVkaWEgPSBleHBvcnRzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUud2FybignZ2V0VXNlck1lZGlhIGlzIG5vdCBhdmFpbGFibGUnKTtcbiAgfTtcbn0oKTtcblxudmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGV4cG9ydHMucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS53YXJuKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgaXMgbm90IGF2YWlsYWJsZScpO1xuICB9O1xufSgpO1xuXG52YXIgQmxvYiA9IGV4cG9ydHMuQmxvYiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5CbG9iIHx8IHdpbmRvdy53ZWJraXRCbG9iO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS53YXJuKCdCbG9iIGlzIG5vdCBhdmFpbGFibGUnKTtcbiAgfTtcbn0oKTtcblxuLy9leHBvcnQgZnVuY3Rpb24gaW5pdChzZXR0aW5ncyA9IHt9KTogdm9pZHtcbmZ1bmN0aW9uIGluaXQoY2FsbGJhY2spIHtcblxuICAvLyBsb2FkIHNldHRpbmdzLmluc3RydW1lbnRzIChhcnJheSBvciBvYmplY3QpXG4gIC8vIGxvYWQgc2V0dGluZ3MubWlkaWZpbGVzIChhcnJheSBvciBvYmplY3QpXG4gIC8qXG4gICAgIHFhbWJpLmluaXQoe1xuICAgICAgaW5zdHJ1bWVudHM6IFsnLi4vaW5zdHJ1bWVudHMvcGlhbm8nLCAnLi4vaW5zdHJ1bWVudHMvdmlvbGluJ10sXG4gICAgICBtaWRpZmlsZXM6IFsnLi4vbWlkaS9tb3phcnQubWlkJ11cbiAgICB9KVxuICAgIC50aGVuKChsb2FkZWQpID0+IHtcbiAgICAgIGxldCBbcGlhbm8sIHZpb2xpbl0gPSBsb2FkZWQuaW5zdHJ1bWVudHNcbiAgICAgIGxldCBbbW96YXJ0XSA9IGxvYWRlZC5taWRpZmlsZXNcbiAgICB9KVxuICAgKi9cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgUHJvbWlzZS5hbGwoWygwLCBfaW5pdF9hdWRpby5pbml0QXVkaW8pKCksICgwLCBfaW5pdF9taWRpLmluaXRNSURJKSgpXSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgLy8gcGFyc2VBdWRpb1xuICAgICAgdmFyIGRhdGFBdWRpbyA9IGRhdGFbMF07XG5cbiAgICAgIC8vIHBhcnNlTUlESVxuICAgICAgdmFyIGRhdGFNaWRpID0gZGF0YVsxXTtcblxuICAgICAgcmVzb2x2ZSh7XG4gICAgICAgIGxlZ2FjeTogZGF0YUF1ZGlvLmxlZ2FjeSxcbiAgICAgICAgbXAzOiBkYXRhQXVkaW8ubXAzLFxuICAgICAgICBvZ2c6IGRhdGFBdWRpby5vZ2csXG4gICAgICAgIG1pZGk6IGRhdGFNaWRpLm1pZGksXG4gICAgICAgIHdlYm1pZGk6IGRhdGFNaWRpLndlYm1pZGlcbiAgICAgIH0pO1xuICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLypcbiAgICBQcm9taXNlLmFsbChbaW5pdEF1ZGlvKCksIGluaXRNSURJKCldKVxuICAgIC50aGVuKFxuICAgIChkYXRhKSA9PiB7XG4gICAgICAvLyBwYXJzZUF1ZGlvXG4gICAgICBsZXQgZGF0YUF1ZGlvID0gZGF0YVswXVxuICBcbiAgICAgIC8vIHBhcnNlTUlESVxuICAgICAgbGV0IGRhdGFNaWRpID0gZGF0YVsxXVxuICBcbiAgICAgIGNhbGxiYWNrKHtcbiAgICAgICAgbGVnYWN5OiBkYXRhQXVkaW8ubGVnYWN5LFxuICAgICAgICBtcDM6IGRhdGFBdWRpby5tcDMsXG4gICAgICAgIG9nZzogZGF0YUF1ZGlvLm9nZyxcbiAgICAgICAgbWlkaTogZGF0YU1pZGkubWlkaSxcbiAgICAgICAgd2VibWlkaTogZGF0YU1pZGkud2VibWlkaSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICAoZXJyb3IpID0+IHtcbiAgICAgIGNhbGxiYWNrKGVycm9yKVxuICAgIH0pXG4gICovXG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZXhwb3J0cy5lbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZXhwb3J0cy5nZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGV4cG9ydHMuZ2V0TWFzdGVyVm9sdW1lID0gZXhwb3J0cy5zZXRNYXN0ZXJWb2x1bWUgPSBleHBvcnRzLm1hc3RlckNvbXByZXNzb3IgPSBleHBvcnRzLm1hc3RlckdhaW4gPSBleHBvcnRzLmNvbnRleHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNldHMgdXAgdGhlIGJhc2ljIGF1ZGlvIHJvdXRpbmcsIHRlc3RzIHdoaWNoIGF1ZGlvIGZvcm1hdHMgYXJlIHN1cHBvcnRlZCBhbmQgcGFyc2VzIHRoZSBzYW1wbGVzIGZvciB0aGUgbWV0cm9ub21lIHRpY2tzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG5leHBvcnRzLmluaXRBdWRpbyA9IGluaXRBdWRpbztcbmV4cG9ydHMuZ2V0SW5pdERhdGEgPSBnZXRJbml0RGF0YTtcblxudmFyIF9zYW1wbGVzID0gcmVxdWlyZSgnLi9zYW1wbGVzJyk7XG5cbnZhciBfc2FtcGxlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zYW1wbGVzKTtcblxudmFyIF9wYXJzZV9hdWRpbyA9IHJlcXVpcmUoJy4vcGFyc2VfYXVkaW8nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIG1hc3RlckdhaW4gPSB2b2lkIDAsXG4gICAgY29tcHJlc3NvciA9IHZvaWQgMCxcbiAgICBpbml0aWFsaXplZCA9IGZhbHNlLFxuICAgIGRhdGEgPSB2b2lkIDA7XG5cbnZhciBjb250ZXh0ID0gZXhwb3J0cy5jb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZygnaW5pdCBBdWRpb0NvbnRleHQnKTtcbiAgdmFyIGN0eCA9IHZvaWQgMDtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZih3aW5kb3cpKSA9PT0gJ29iamVjdCcpIHtcbiAgICB2YXIgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuICAgIGlmIChBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XG4gICAgfVxuICB9XG4gIGlmICh0eXBlb2YgY3R4ID09PSAndW5kZWZpbmVkJykge1xuICAgIC8vQFRPRE86IGNyZWF0ZSBkdW1teSBBdWRpb0NvbnRleHQgZm9yIHVzZSBpbiBub2RlLCBzZWU6IGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2F1ZGlvLWNvbnRleHRcbiAgICBleHBvcnRzLmNvbnRleHQgPSBjb250ZXh0ID0ge1xuICAgICAgY3JlYXRlR2FpbjogZnVuY3Rpb24gY3JlYXRlR2FpbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBnYWluOiAxXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgY3JlYXRlT3NjaWxsYXRvcjogZnVuY3Rpb24gY3JlYXRlT3NjaWxsYXRvcigpIHt9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gY3R4O1xufSgpO1xuXG5mdW5jdGlvbiBpbml0QXVkaW8oKSB7XG5cbiAgaWYgKHR5cGVvZiBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW47XG4gIH1cbiAgLy8gY2hlY2sgZm9yIG9sZGVyIGltcGxlbWVudGF0aW9ucyBvZiBXZWJBdWRpb1xuICBkYXRhID0ge307XG4gIHZhciBzb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICBkYXRhLmxlZ2FjeSA9IGZhbHNlO1xuICBpZiAodHlwZW9mIHNvdXJjZS5zdGFydCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBkYXRhLmxlZ2FjeSA9IHRydWU7XG4gIH1cblxuICAvLyBzZXQgdXAgdGhlIGVsZW1lbnRhcnkgYXVkaW8gbm9kZXNcbiAgZXhwb3J0cy5tYXN0ZXJDb21wcmVzc29yID0gY29tcHJlc3NvciA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKCk7XG4gIGNvbXByZXNzb3IuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgZXhwb3J0cy5tYXN0ZXJHYWluID0gbWFzdGVyR2FpbiA9IGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUoKTtcbiAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSAwLjU7XG4gIGluaXRpYWxpemVkID0gdHJ1ZTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgKDAsIF9wYXJzZV9hdWRpby5wYXJzZVNhbXBsZXMpKF9zYW1wbGVzMi5kZWZhdWx0KS50aGVuKGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGJ1ZmZlcnMpIHtcbiAgICAgIC8vY29uc29sZS5sb2coYnVmZmVycylcbiAgICAgIGRhdGEub2dnID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlPZ2cgIT09ICd1bmRlZmluZWQnO1xuICAgICAgZGF0YS5tcDMgPSB0eXBlb2YgYnVmZmVycy5lbXB0eU1wMyAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgICBkYXRhLmxvd3RpY2sgPSBidWZmZXJzLmxvd3RpY2s7XG4gICAgICBkYXRhLmhpZ2h0aWNrID0gYnVmZmVycy5oaWdodGljaztcbiAgICAgIGlmIChkYXRhLm9nZyA9PT0gZmFsc2UgJiYgZGF0YS5tcDMgPT09IGZhbHNlKSB7XG4gICAgICAgIHJlamVjdCgnTm8gc3VwcG9ydCBmb3Igb2dnIG5vciBtcDMhJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoKSB7XG4gICAgICByZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIGluaXRpYWxpemluZyBBdWRpbycpO1xuICAgIH0pO1xuICB9KTtcbn1cblxudmFyIF9zZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbiBzZXRNYXN0ZXJWb2x1bWUoKSB7XG4gIHZhciB2YWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDAuNSA6IGFyZ3VtZW50c1swXTtcblxuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLnNldE1hc3RlclZvbHVtZSA9IF9zZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbiBzZXRNYXN0ZXJWb2x1bWUoKSB7XG4gICAgICB2YXIgdmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAwLjUgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgIGlmICh2YWx1ZSA+IDEpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKCdtYXhpbWFsIHZvbHVtZSBpcyAxLjAsIHZvbHVtZSBpcyBzZXQgdG8gMS4wJyk7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHZhbHVlIDwgMCA/IDAgOiB2YWx1ZSA+IDEgPyAxIDogdmFsdWU7XG4gICAgICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgICB9O1xuICAgIF9zZXRNYXN0ZXJWb2x1bWUodmFsdWUpO1xuICB9XG59O1xuXG52YXIgX2dldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uIGdldE1hc3RlclZvbHVtZSgpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5nZXRNYXN0ZXJWb2x1bWUgPSBfZ2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24gZ2V0TWFzdGVyVm9sdW1lKCkge1xuICAgICAgcmV0dXJuIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZTtcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0TWFzdGVyVm9sdW1lKCk7XG4gIH1cbn07XG5cbnZhciBfZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbiBnZXRDb21wcmVzc2lvblJlZHVjdGlvbigpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5nZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IF9nZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uIGdldENvbXByZXNzaW9uUmVkdWN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNvbXByZXNzb3IucmVkdWN0aW9uLnZhbHVlO1xuICAgIH07XG4gICAgcmV0dXJuIF9nZXRDb21wcmVzc2lvblJlZHVjdGlvbigpO1xuICB9XG59O1xuXG52YXIgX2VuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbiBlbmFibGVNYXN0ZXJDb21wcmVzc29yKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBfZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uIGVuYWJsZU1hc3RlckNvbXByZXNzb3IoZmxhZykge1xuICAgICAgaWYgKGZsYWcpIHtcbiAgICAgICAgbWFzdGVyR2Fpbi5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmNvbm5lY3QoY29tcHJlc3Nvcik7XG4gICAgICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIF9lbmFibGVNYXN0ZXJDb21wcmVzc29yKCk7XG4gIH1cbn07XG5cbnZhciBfY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IoY2ZnKSB7XG4gIC8qXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gYXR0YWNrOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0ga25lZTsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByYXRpbzsgLy8gdW5pdC1sZXNzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVkdWN0aW9uOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlbGVhc2U7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSB0aHJlc2hvbGQ7IC8vIGluIERlY2liZWxzXG4gICAgIEBzZWU6IGh0dHA6Ly93ZWJhdWRpby5naXRodWIuaW8vd2ViLWF1ZGlvLWFwaS8jdGhlLWR5bmFtaWNzY29tcHJlc3Nvcm5vZGUtaW50ZXJmYWNlXG4gICovXG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IF9jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24gY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvcihjZmcpIHtcbiAgICAgIHZhciBfY2ZnJGF0dGFjayA9IGNmZy5hdHRhY2s7XG4gICAgICBjb21wcmVzc29yLmF0dGFjayA9IF9jZmckYXR0YWNrID09PSB1bmRlZmluZWQgPyAwLjAwMyA6IF9jZmckYXR0YWNrO1xuICAgICAgdmFyIF9jZmcka25lZSA9IGNmZy5rbmVlO1xuICAgICAgY29tcHJlc3Nvci5rbmVlID0gX2NmZyRrbmVlID09PSB1bmRlZmluZWQgPyAzMCA6IF9jZmcka25lZTtcbiAgICAgIHZhciBfY2ZnJHJhdGlvID0gY2ZnLnJhdGlvO1xuICAgICAgY29tcHJlc3Nvci5yYXRpbyA9IF9jZmckcmF0aW8gPT09IHVuZGVmaW5lZCA/IDEyIDogX2NmZyRyYXRpbztcbiAgICAgIHZhciBfY2ZnJHJlZHVjdGlvbiA9IGNmZy5yZWR1Y3Rpb247XG4gICAgICBjb21wcmVzc29yLnJlZHVjdGlvbiA9IF9jZmckcmVkdWN0aW9uID09PSB1bmRlZmluZWQgPyAwIDogX2NmZyRyZWR1Y3Rpb247XG4gICAgICB2YXIgX2NmZyRyZWxlYXNlID0gY2ZnLnJlbGVhc2U7XG4gICAgICBjb21wcmVzc29yLnJlbGVhc2UgPSBfY2ZnJHJlbGVhc2UgPT09IHVuZGVmaW5lZCA/IDAuMjUwIDogX2NmZyRyZWxlYXNlO1xuICAgICAgdmFyIF9jZmckdGhyZXNob2xkID0gY2ZnLnRocmVzaG9sZDtcbiAgICAgIGNvbXByZXNzb3IudGhyZXNob2xkID0gX2NmZyR0aHJlc2hvbGQgPT09IHVuZGVmaW5lZCA/IC0yNCA6IF9jZmckdGhyZXNob2xkO1xuICAgIH07XG4gICAgX2NvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IoY2ZnKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0SW5pdERhdGEoKSB7XG4gIHJldHVybiBkYXRhO1xufVxuXG5leHBvcnRzLm1hc3RlckdhaW4gPSBtYXN0ZXJHYWluO1xuZXhwb3J0cy5tYXN0ZXJDb21wcmVzc29yID0gY29tcHJlc3NvcjtcbmV4cG9ydHMuc2V0TWFzdGVyVm9sdW1lID0gX3NldE1hc3RlclZvbHVtZTtcbmV4cG9ydHMuZ2V0TWFzdGVyVm9sdW1lID0gX2dldE1hc3RlclZvbHVtZTtcbmV4cG9ydHMuZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBfZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb247XG5leHBvcnRzLmVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBfZW5hYmxlTWFzdGVyQ29tcHJlc3NvcjtcbmV4cG9ydHMuY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IF9jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ2V0TUlESUlucHV0QnlJZCA9IGV4cG9ydHMuZ2V0TUlESU91dHB1dEJ5SWQgPSBleHBvcnRzLmdldE1JRElJbnB1dElkcyA9IGV4cG9ydHMuZ2V0TUlESU91dHB1dElkcyA9IGV4cG9ydHMuZ2V0TUlESUlucHV0cyA9IGV4cG9ydHMuZ2V0TUlESU91dHB1dHMgPSBleHBvcnRzLmdldE1JRElBY2Nlc3MgPSB1bmRlZmluZWQ7XG5leHBvcnRzLmluaXRNSURJID0gaW5pdE1JREk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgTUlESUFjY2VzcyA9IHZvaWQgMDsgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlcXVlc3RzIE1JREkgYWNjZXNzLCBxdWVyaWVzIGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgYW5kIHN0b3JlcyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbnZhciBpbml0aWFsaXplZCA9IGZhbHNlO1xudmFyIGlucHV0cyA9IFtdO1xudmFyIG91dHB1dHMgPSBbXTtcbnZhciBpbnB1dElkcyA9IFtdO1xudmFyIG91dHB1dElkcyA9IFtdO1xudmFyIGlucHV0c0J5SWQgPSBuZXcgTWFwKCk7XG52YXIgb3V0cHV0c0J5SWQgPSBuZXcgTWFwKCk7XG5cbnZhciBzb25nTWlkaUV2ZW50TGlzdGVuZXIgPSB2b2lkIDA7XG52YXIgbWlkaUV2ZW50TGlzdGVuZXJJZCA9IDA7XG5cbmZ1bmN0aW9uIGdldE1JRElwb3J0cygpIHtcbiAgaW5wdXRzID0gQXJyYXkuZnJvbShNSURJQWNjZXNzLmlucHV0cy52YWx1ZXMoKSk7XG5cbiAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gIGlucHV0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xO1xuICB9KTtcblxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBpbnB1dHNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICB2YXIgcG9ydCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICBpbnB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICAgIGlucHV0SWRzLnB1c2gocG9ydC5pZCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG91dHB1dHMgPSBBcnJheS5mcm9tKE1JRElBY2Nlc3Mub3V0cHV0cy52YWx1ZXMoKSk7XG5cbiAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gIG91dHB1dHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhvdXRwdXRzKVxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gb3V0cHV0c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgdmFyIF9wb3J0ID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKHBvcnQuaWQsIHBvcnQubmFtZSlcbiAgICAgIG91dHB1dHNCeUlkLnNldChfcG9ydC5pZCwgX3BvcnQpO1xuICAgICAgb3V0cHV0SWRzLnB1c2goX3BvcnQuaWQpO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKG91dHB1dHNCeUlkKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdE1JREkoKSB7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICByZXNvbHZlKHsgbWlkaTogZmFsc2UgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgamF6eiA9IHZvaWQgMCxcbiAgICAgICAgICAgIG1pZGkgPSB2b2lkIDAsXG4gICAgICAgICAgICB3ZWJtaWRpID0gdm9pZCAwO1xuXG4gICAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcygpLnRoZW4oZnVuY3Rpb24gb25GdWxGaWxsZWQobWlkaUFjY2Vzcykge1xuICAgICAgICAgIE1JRElBY2Nlc3MgPSBtaWRpQWNjZXNzO1xuICAgICAgICAgIGlmICh0eXBlb2YgbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGphenogPSBtaWRpQWNjZXNzLl9qYXp6SW5zdGFuY2VzWzBdLl9KYXp6LnZlcnNpb247XG4gICAgICAgICAgICBtaWRpID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2VibWlkaSA9IHRydWU7XG4gICAgICAgICAgICBtaWRpID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBnZXRNSURJcG9ydHMoKTtcblxuICAgICAgICAgIC8vIG9uY29ubmVjdCBhbmQgb25kaXNjb25uZWN0IGFyZSBub3QgeWV0IGltcGxlbWVudGVkIGluIENocm9tZSBhbmQgQ2hyb21pdW1cbiAgICAgICAgICBtaWRpQWNjZXNzLm9uY29ubmVjdCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGV2aWNlIGNvbm5lY3RlZCcsIGUpO1xuICAgICAgICAgICAgZ2V0TUlESXBvcnRzKCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIG1pZGlBY2Nlc3Mub25kaXNjb25uZWN0ID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgZGlzY29ubmVjdGVkJywgZSk7XG4gICAgICAgICAgICBnZXRNSURJcG9ydHMoKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgamF6ejogamF6eixcbiAgICAgICAgICAgIG1pZGk6IG1pZGksXG4gICAgICAgICAgICB3ZWJtaWRpOiB3ZWJtaWRpLFxuICAgICAgICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICAgICAgICBvdXRwdXRzOiBvdXRwdXRzLFxuICAgICAgICAgICAgaW5wdXRzQnlJZDogaW5wdXRzQnlJZCxcbiAgICAgICAgICAgIG91dHB1dHNCeUlkOiBvdXRwdXRzQnlJZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiBvblJlamVjdChlKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhlKVxuICAgICAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgcmVxdWVzdGluZyBNSURJQWNjZXNzJywgZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBicm93c2VycyB3aXRob3V0IFdlYk1JREkgQVBJXG4gICAgICB9KSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSh7IG1pZGk6IGZhbHNlIH0pO1xuICAgICAgfVxuICB9KTtcbn1cblxudmFyIF9nZXRNSURJQWNjZXNzID0gZnVuY3Rpb24gZ2V0TUlESUFjY2VzcygpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5nZXRNSURJQWNjZXNzID0gX2dldE1JRElBY2Nlc3MgPSBmdW5jdGlvbiBnZXRNSURJQWNjZXNzKCkge1xuICAgICAgcmV0dXJuIE1JRElBY2Nlc3M7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElBY2Nlc3MoKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElBY2Nlc3MgPSBfZ2V0TUlESUFjY2VzcztcbnZhciBfZ2V0TUlESU91dHB1dHMgPSBmdW5jdGlvbiBnZXRNSURJT3V0cHV0cygpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IF9nZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uIGdldE1JRElPdXRwdXRzKCkge1xuICAgICAgcmV0dXJuIG91dHB1dHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElPdXRwdXRzKCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IF9nZXRNSURJT3V0cHV0cztcbnZhciBfZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uIGdldE1JRElJbnB1dHMoKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0TUlESUlucHV0cyA9IF9nZXRNSURJSW5wdXRzID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0cygpIHtcbiAgICAgIHJldHVybiBpbnB1dHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElJbnB1dHMoKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElJbnB1dHMgPSBfZ2V0TUlESUlucHV0cztcbnZhciBfZ2V0TUlESU91dHB1dElkcyA9IGZ1bmN0aW9uIGdldE1JRElPdXRwdXRJZHMoKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0TUlESU91dHB1dElkcyA9IF9nZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24gZ2V0TUlESU91dHB1dElkcygpIHtcbiAgICAgIHJldHVybiBvdXRwdXRJZHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElPdXRwdXRJZHMoKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElPdXRwdXRJZHMgPSBfZ2V0TUlESU91dHB1dElkcztcbnZhciBfZ2V0TUlESUlucHV0SWRzID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0SWRzKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElJbnB1dElkcyA9IF9nZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbiBnZXRNSURJSW5wdXRJZHMoKSB7XG4gICAgICByZXR1cm4gaW5wdXRJZHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElJbnB1dElkcygpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydHMuZ2V0TUlESUlucHV0SWRzID0gX2dldE1JRElJbnB1dElkcztcbnZhciBfZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbiBnZXRNSURJT3V0cHV0QnlJZChpZCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElPdXRwdXRCeUlkID0gX2dldE1JRElPdXRwdXRCeUlkID0gZnVuY3Rpb24gZ2V0TUlESU91dHB1dEJ5SWQoX2lkKSB7XG4gICAgICByZXR1cm4gb3V0cHV0c0J5SWQuZ2V0KF9pZCk7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElPdXRwdXRCeUlkKGlkKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElPdXRwdXRCeUlkID0gX2dldE1JRElPdXRwdXRCeUlkO1xudmFyIF9nZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0QnlJZChpZCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElJbnB1dEJ5SWQgPSBfZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uIGdldE1JRElJbnB1dEJ5SWQoX2lkKSB7XG4gICAgICByZXR1cm4gaW5wdXRzQnlJZC5nZXQoX2lkKTtcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0TUlESUlucHV0QnlJZChpZCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLypcbmV4cG9ydCBmdW5jdGlvbiBpbml0TWlkaVNvbmcoc29uZyl7XG5cbiAgc29uZ01pZGlFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgLy9jb25zb2xlLmxvZyhlKVxuICAgIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBlLCB0aGlzKTtcbiAgfTtcblxuICAvLyBieSBkZWZhdWx0IGEgc29uZyBsaXN0ZW5zIHRvIGFsbCBhdmFpbGFibGUgbWlkaS1pbiBwb3J0c1xuICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcblxuICBvdXRwdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpSW5wdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IGlucHV0ID0gaW5wdXRzLmdldChpZCk7XG5cbiAgaWYoaW5wdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBpbnB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlJbnB1dHMuZGVsZXRlKGlkKTtcbiAgICBpbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1lbHNle1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQoaWQsIGlucHV0KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpSW5wdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlPdXRwdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IG91dHB1dCA9IG91dHB1dHMuZ2V0KGlkKTtcblxuICBpZihvdXRwdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBvdXRwdXQgd2l0aCBpZCcsIGlkLCAnZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihmbGFnID09PSBmYWxzZSl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5kZWxldGUoaWQpO1xuICAgIGxldCB0aW1lID0gc29uZy5zY2hlZHVsZXIubGFzdEV2ZW50VGltZSArIDEwMDtcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWUpOyAvLyBzdG9wIGFsbCBub3Rlc1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZSk7IC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICB9ZWxzZXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChpZCwgb3V0cHV0KTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlPdXRwdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIG1pZGlNZXNzYWdlRXZlbnQsIGlucHV0KXtcbiAgbGV0IG1pZGlFdmVudCA9IG5ldyBNaWRpRXZlbnQoc29uZy50aWNrcywgLi4ubWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5taWRpSW5wdXRzLCBpbnB1dCk7XG5cblxuICAgIC8vaWYobWlkaUV2ZW50LmNoYW5uZWwgPT09IHRyYWNrLmNoYW5uZWwgfHwgdHJhY2suY2hhbm5lbCA9PT0gMCB8fCB0cmFjay5jaGFubmVsID09PSAnYW55Jyl7XG4gICAgLy8gIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjayk7XG4gICAgLy99XG5cblxuICAgIC8vIGxpa2UgaW4gQ3ViYXNlLCBtaWRpIGV2ZW50cyBmcm9tIGFsbCBkZXZpY2VzLCBzZW50IG9uIGFueSBtaWRpIGNoYW5uZWwgYXJlIGZvcndhcmRlZCB0byBhbGwgdHJhY2tzXG4gICAgLy8gc2V0IHRyYWNrLm1vbml0b3IgdG8gZmFsc2UgaWYgeW91IGRvbid0IHdhbnQgdG8gcmVjZWl2ZSBtaWRpIGV2ZW50cyBvbiBhIGNlcnRhaW4gdHJhY2tcbiAgICAvLyBub3RlIHRoYXQgdHJhY2subW9uaXRvciBpcyBieSBkZWZhdWx0IHNldCB0byBmYWxzZSBhbmQgdGhhdCB0cmFjay5tb25pdG9yIGlzIGF1dG9tYXRpY2FsbHkgc2V0IHRvIHRydWVcbiAgICAvLyBpZiB5b3UgYXJlIHJlY29yZGluZyBvbiB0aGF0IHRyYWNrXG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5tb25pdG9yLCB0cmFjay5pZCwgaW5wdXQuaWQpO1xuICAgIGlmKHRyYWNrLm1vbml0b3IgPT09IHRydWUgJiYgdHJhY2subWlkaUlucHV0cy5nZXQoaW5wdXQuaWQpICE9PSB1bmRlZmluZWQpe1xuICAgICAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrLCBpbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgbGV0IGxpc3RlbmVycyA9IHNvbmcubWlkaUV2ZW50TGlzdGVuZXJzLmdldChtaWRpRXZlbnQudHlwZSk7XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBmb3IobGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycyl7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKHRyYWNrLCBtaWRpRXZlbnQsIGlucHV0KXtcbiAgbGV0IHNvbmcgPSB0cmFjay5zb25nLFxuICAgIG5vdGUsIGxpc3RlbmVycywgY2hhbm5lbDtcbiAgICAvL2RhdGEgPSBtaWRpTWVzc2FnZUV2ZW50LmRhdGEsXG4gICAgLy9taWRpRXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoc29uZy50aWNrcywgZGF0YVswXSwgZGF0YVsxXSwgZGF0YVsyXSk7XG5cbiAgLy9taWRpRXZlbnQuc291cmNlID0gbWlkaU1lc3NhZ2VFdmVudC5zcmNFbGVtZW50Lm5hbWU7XG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudClcbiAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCBtaWRpRXZlbnQudHlwZSk7XG5cbiAgLy8gYWRkIHRoZSBleGFjdCB0aW1lIG9mIHRoaXMgZXZlbnQgc28gd2UgY2FuIGNhbGN1bGF0ZSBpdHMgdGlja3MgcG9zaXRpb25cbiAgbWlkaUV2ZW50LnJlY29yZE1pbGxpcyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwOyAvLyBtaWxsaXNcbiAgbWlkaUV2ZW50LnN0YXRlID0gJ3JlY29yZGVkJztcblxuICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICBub3RlID0gY3JlYXRlTWlkaU5vdGUobWlkaUV2ZW50KTtcbiAgICB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdID0gbm90ZTtcbiAgICAvL3RyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF0gPSBub3RlO1xuICB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICBub3RlID0gdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvLyBjaGVjayBpZiB0aGUgbm90ZSBleGlzdHM6IGlmIHRoZSB1c2VyIHBsYXlzIG5vdGVzIG9uIGhlciBrZXlib2FyZCBiZWZvcmUgdGhlIG1pZGkgc3lzdGVtIGhhc1xuICAgIC8vIGJlZW4gZnVsbHkgaW5pdGlhbGl6ZWQsIGl0IGNhbiBoYXBwZW4gdGhhdCB0aGUgZmlyc3QgaW5jb21pbmcgbWlkaSBldmVudCBpcyBhIE5PVEUgT0ZGIGV2ZW50XG4gICAgaWYobm90ZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm90ZS5hZGROb3RlT2ZmKG1pZGlFdmVudCk7XG4gICAgZGVsZXRlIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy9kZWxldGUgdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXTtcbiAgfVxuXG4gIC8vY29uc29sZS5sb2coc29uZy5wcmVyb2xsLCBzb25nLnJlY29yZGluZywgdHJhY2sucmVjb3JkRW5hYmxlZCk7XG5cbiAgaWYoKHNvbmcucHJlcm9sbGluZyB8fCBzb25nLnJlY29yZGluZykgJiYgdHJhY2sucmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKXtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIHRyYWNrLnNvbmcucmVjb3JkZWROb3Rlcy5wdXNoKG5vdGUpO1xuICAgIH1cbiAgICB0cmFjay5yZWNvcmRQYXJ0LmFkZEV2ZW50KG1pZGlFdmVudCk7XG4gICAgLy8gc29uZy5yZWNvcmRlZEV2ZW50cyBpcyB1c2VkIGluIHRoZSBrZXkgZWRpdG9yXG4gICAgdHJhY2suc29uZy5yZWNvcmRlZEV2ZW50cy5wdXNoKG1pZGlFdmVudCk7XG4gIH1lbHNlIGlmKHRyYWNrLmVuYWJsZVJldHJvc3BlY3RpdmVSZWNvcmRpbmcpe1xuICAgIHRyYWNrLnJldHJvc3BlY3RpdmVSZWNvcmRpbmcucHVzaChtaWRpRXZlbnQpO1xuICB9XG5cbiAgLy8gY2FsbCBhbGwgbWlkaSBldmVudCBsaXN0ZW5lcnNcbiAgbGlzdGVuZXJzID0gdHJhY2subWlkaUV2ZW50TGlzdGVuZXJzW21pZGlFdmVudC50eXBlXTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIG9iamVjdEZvckVhY2gobGlzdGVuZXJzLCBmdW5jdGlvbihsaXN0ZW5lcil7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoYW5uZWwgPSB0cmFjay5jaGFubmVsO1xuICBpZihjaGFubmVsID09PSAnYW55JyB8fCBjaGFubmVsID09PSB1bmRlZmluZWQgfHwgaXNOYU4oY2hhbm5lbCkgPT09IHRydWUpe1xuICAgIGNoYW5uZWwgPSAwO1xuICB9XG5cbiAgb2JqZWN0Rm9yRWFjaCh0cmFjay5taWRpT3V0cHV0cywgZnVuY3Rpb24ob3V0cHV0KXtcbiAgICAvL2NvbnNvbGUubG9nKCdtaWRpIG91dCcsIG91dHB1dCwgbWlkaUV2ZW50LnR5cGUpO1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjggfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE0NCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyKTtcbiAgICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgICAvLyB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTkyKXtcbiAgICAvLyAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExXSk7XG4gICAgfVxuICAgIC8vb3V0cHV0LnNlbmQoW21pZGlFdmVudC5zdGF0dXMgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICB9KTtcblxuICAvLyBAVE9ETzogbWF5YmUgYSB0cmFjayBzaG91bGQgYmUgYWJsZSB0byBzZW5kIGl0cyBldmVudCB0byBib3RoIGEgbWlkaS1vdXQgcG9ydCBhbmQgYW4gaW50ZXJuYWwgaGVhcnRiZWF0IHNvbmc/XG4gIC8vY29uc29sZS5sb2codHJhY2sucm91dGVUb01pZGlPdXQpO1xuICBpZih0cmFjay5yb3V0ZVRvTWlkaU91dCA9PT0gZmFsc2Upe1xuICAgIG1pZGlFdmVudC50cmFjayA9IHRyYWNrO1xuICAgIHRyYWNrLmluc3RydW1lbnQucHJvY2Vzc0V2ZW50KG1pZGlFdmVudCk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBhZGRNaWRpRXZlbnRMaXN0ZW5lciguLi5hcmdzKXsgLy8gY2FsbGVyIGNhbiBiZSBhIHRyYWNrIG9yIGEgc29uZ1xuXG4gIGxldCBpZCA9IG1pZGlFdmVudExpc3RlbmVySWQrKztcbiAgbGV0IGxpc3RlbmVyO1xuICAgIHR5cGVzID0ge30sXG4gICAgaWRzID0gW10sXG4gICAgbG9vcDtcblxuXG4gIC8vIHNob3VsZCBJIGlubGluZSB0aGlzP1xuICBsb29wID0gZnVuY3Rpb24oYXJncyl7XG4gICAgZm9yKGxldCBhcmcgb2YgYXJncyl7XG4gICAgICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcoYXJnKTtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgICBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgbG9vcChhcmcpO1xuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgIGxpc3RlbmVyID0gYXJnO1xuICAgICAgfWVsc2UgaWYoaXNOYU4oYXJnKSA9PT0gZmFsc2Upe1xuICAgICAgICBhcmcgPSBwYXJzZUludChhcmcsIDEwKTtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgYXJnID0gc2VxdWVuY2VyLm1pZGlFdmVudE51bWJlckJ5TmFtZShhcmcpO1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgbG9vcChhcmdzLCAwLCBhcmdzLmxlbmd0aCk7XG4gIC8vY29uc29sZS5sb2coJ3R5cGVzJywgdHlwZXMsICdsaXN0ZW5lcicsIGxpc3RlbmVyKTtcblxuICBvYmplY3RGb3JFYWNoKHR5cGVzLCBmdW5jdGlvbih0eXBlKXtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgIGlmKG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID0ge307XG4gICAgfVxuICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdID0gbGlzdGVuZXI7XG4gICAgaWRzLnB1c2godHlwZSArICdfJyArIGlkKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhvYmoubWlkaUV2ZW50TGlzdGVuZXJzKTtcbiAgcmV0dXJuIGlkcy5sZW5ndGggPT09IDEgPyBpZHNbMF0gOiBpZHM7XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXIoaWQsIG9iail7XG4gIHZhciB0eXBlO1xuICBpZCA9IGlkLnNwbGl0KCdfJyk7XG4gIHR5cGUgPSBpZFswXTtcbiAgaWQgPSBpZFsxXTtcbiAgZGVsZXRlIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVycygpe1xuXG59XG5cbiovXG5leHBvcnRzLmdldE1JRElJbnB1dEJ5SWQgPSBfZ2V0TUlESUlucHV0QnlJZDsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLkluc3RydW1lbnQgPSB1bmRlZmluZWQ7XG5cbnZhciBfc2xpY2VkVG9BcnJheSA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfSByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IHJldHVybiBhcnI7IH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7IHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7IH0gZWxzZSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpOyB9IH07IH0oKTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9zYW1wbGUgPSByZXF1aXJlKCcuL3NhbXBsZScpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9ub3RlID0gcmVxdWlyZSgnLi9ub3RlJyk7XG5cbnZhciBfcGFyc2VfYXVkaW8gPSByZXF1aXJlKCcuL3BhcnNlX2F1ZGlvJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX2V2ZW50bGlzdGVuZXIgPSByZXF1aXJlKCcuL2V2ZW50bGlzdGVuZXInKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIHBwcSA9IDQ4MDtcbnZhciBicG0gPSAxMjA7XG52YXIgcGxheWJhY2tTcGVlZCA9IDE7XG52YXIgbWlsbGlzUGVyVGljayA9IDEgLyBwbGF5YmFja1NwZWVkICogNjAgLyBicG0gLyBwcHE7XG5cbnZhciBJbnN0cnVtZW50ID0gZXhwb3J0cy5JbnN0cnVtZW50ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBJbnN0cnVtZW50KGlkLCB0eXBlKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEluc3RydW1lbnQpO1xuXG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgLy8gY3JlYXRlIGEgc2FtcGxlcyBkYXRhIG9iamVjdCBmb3IgYWxsIDEyOCB2ZWxvY2l0eSBsZXZlbHMgb2YgYWxsIDEyOCBub3Rlc1xuICAgIHRoaXMuc2FtcGxlc0RhdGEgPSBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKTtcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gdGhpcy5zYW1wbGVzRGF0YS5tYXAoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBBcnJheSgxMjgpLmZpbGwoLTEpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0ge307XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW107XG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2U7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoSW5zdHJ1bWVudCwgW3tcbiAgICBrZXk6ICdjb25uZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29ubmVjdChvdXRwdXQpIHtcbiAgICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Rpc2Nvbm5lY3QnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNjb25uZWN0KCkge1xuICAgICAgdGhpcy5vdXRwdXQgPSBudWxsO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3Byb2Nlc3NNSURJRXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzTUlESUV2ZW50KGV2ZW50LCB0aW1lKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgc2FtcGxlID0gdm9pZCAwLFxuICAgICAgICAgIHNhbXBsZURhdGEgPSB2b2lkIDA7XG4gICAgICBpZiAoaXNOYU4odGltZSkpIHtcbiAgICAgICAgdGltZSA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3VycmVudFRpbWUgKyBldmVudC50aWNrcyAqIG1pbGxpc1BlclRpY2s7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKHRpbWUpXG5cbiAgICAgIGlmIChldmVudC50eXBlID09PSAxNDQpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygxNDQsICc6JywgdGltZSwgY29udGV4dC5jdXJyZW50VGltZSwgZXZlbnQubWlsbGlzKVxuXG4gICAgICAgIHNhbXBsZURhdGEgPSB0aGlzLnNhbXBsZXNEYXRhW2V2ZW50LmRhdGExXVtldmVudC5kYXRhMl07XG4gICAgICAgIHNhbXBsZSA9ICgwLCBfc2FtcGxlLmNyZWF0ZVNhbXBsZSkoc2FtcGxlRGF0YSwgZXZlbnQpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbZXZlbnQubWlkaU5vdGVJZF0gPSBzYW1wbGU7XG4gICAgICAgIHNhbXBsZS5vdXRwdXQuY29ubmVjdCh0aGlzLm91dHB1dCB8fCBfaW5pdF9hdWRpby5jb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgICAgLy8gc2FtcGxlLnNvdXJjZS5vbmVuZGVkID0gKCkgPT4ge1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKCcgICAgZGVsZXRpbmcnLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgICAvLyAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbZXZlbnQubWlkaU5vdGVJZF1cbiAgICAgICAgLy8gfVxuICAgICAgICBzYW1wbGUuc3RhcnQodGltZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxpbmcnLCBldmVudC5pZCwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgLy9jb25zb2xlLmxvZygnc3RhcnQnLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgfSBlbHNlIGlmIChldmVudC50eXBlID09PSAxMjgpIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKDEyOCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG4gICAgICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdO1xuICAgICAgICAgIGlmICh0eXBlb2Ygc2FtcGxlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oJ3NhbXBsZSBub3QgZm91bmQgZm9yIGV2ZW50JywgZXZlbnQuaWQsICcgbWlkaU5vdGUnLCBldmVudC5taWRpTm90ZUlkLCBldmVudClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkKVxuICAgICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLnB1c2goZXZlbnQubWlkaU5vdGVJZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIHRpbWUsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgICAgICAgIGRlbGV0ZSBfdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09IDE3Nikge1xuICAgICAgICAgICAgLy8gc3VzdGFpbiBwZWRhbFxuICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGExID09PSA2NCkge1xuICAgICAgICAgICAgICBpZiAoZXZlbnQuZGF0YTIgPT09IDEyNykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgLy8vKlxuICAgICAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgICAgICAgIGRhdGE6ICdkb3duJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vKi9cbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIGRvd24nKVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGEyID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5mb3JFYWNoKGZ1bmN0aW9uIChtaWRpTm90ZUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNhbXBsZSA9IF90aGlzLnNjaGVkdWxlZFNhbXBsZXNbbWlkaU5vdGVJZF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzYW1wbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICAgICAgICAgICAgICAgICAgc2FtcGxlLnN0b3AodGltZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIG1pZGlOb3RlSWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgX3RoaXMuc2NoZWR1bGVkU2FtcGxlc1ttaWRpTm90ZUlkXTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIHVwJywgdGhpcy5zdXN0YWluZWRTYW1wbGVzKVxuICAgICAgICAgICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW107XG4gICAgICAgICAgICAgICAgICAvLy8qXG4gICAgICAgICAgICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogJ3VwJ1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAvLyovXG4gICAgICAgICAgICAgICAgICAvL3RoaXMuc3RvcFN1c3RhaW4odGltZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIHBhbm5pbmdcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuZGF0YTEgPT09IDEwKSB7XG4gICAgICAgICAgICAgICAgLy8gcGFubmluZyBpcyAqbm90KiBleGFjdGx5IHRpbWVkIC0+IG5vdCBwb3NzaWJsZSAoeWV0KSB3aXRoIFdlYkF1ZGlvXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhMiwgcmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcbiAgICAgICAgICAgICAgICAvL3RyYWNrLnNldFBhbm5pbmcocmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcblxuICAgICAgICAgICAgICAgIC8vIHZvbHVtZVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGExID09PSA3KSB7XG4gICAgICAgICAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gbG9hZCBhbmQgcGFyc2VcblxuICB9LCB7XG4gICAga2V5OiAncGFyc2VTYW1wbGVEYXRhJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGFyc2VTYW1wbGVEYXRhKGRhdGEpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAoMCwgX3BhcnNlX2F1ZGlvLnBhcnNlU2FtcGxlczIpKGRhdGEpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBfdGhpczIuc2V0UmVsZWFzZShkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKGZ1bmN0aW9uIChzYW1wbGUpIHtcbiAgICAgICAgICAgIHZhciBzYW1wbGVEYXRhID0gZGF0YVtzYW1wbGUuaWRdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzYW1wbGVEYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgICAgIGJ1ZmZlcjogc2FtcGxlLmJ1ZmZlclxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBzYW1wbGUuYnVmZmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2FtcGxlRGF0YS5ub3RlID0gc2FtcGxlLmlkO1xuICAgICAgICAgICAgX3RoaXMyLnVwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgIEBwYXJhbSBjb25maWcgKG9wdGlvbmFsKVxuICAgICAgICB7XG4gICAgICAgICAgbm90ZTogY2FuIGJlIG5vdGUgbmFtZSAoQzQpIG9yIG5vdGUgbnVtYmVyICg2MClcbiAgICAgICAgICBidWZmZXI6IEF1ZGlvQnVmZmVyXG4gICAgICAgICAgc3VzdGFpbjogW3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZF0sIC8vIG9wdGlvbmFsLCBpbiBtaWxsaXNcbiAgICAgICAgICByZWxlYXNlOiBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdLCAvLyBvcHRpb25hbFxuICAgICAgICAgIHBhbjogcGFuUG9zaXRpb24gLy8gb3B0aW9uYWxcbiAgICAgICAgICB2ZWxvY2l0eTogW3ZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kXSAvLyBvcHRpb25hbCwgZm9yIG11bHRpLWxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgICAgfVxuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZVNhbXBsZURhdGEnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVTYW1wbGVEYXRhKCkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBkYXRhID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGRhdGFbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAobm90ZURhdGEpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzMy5fdXBkYXRlU2FtcGxlRGF0YShub3RlRGF0YSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfdXBkYXRlU2FtcGxlRGF0YScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF91cGRhdGVTYW1wbGVEYXRhKCkge1xuICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgIHZhciBkYXRhID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG4gICAgICB2YXIgbm90ZSA9IGRhdGEubm90ZTtcbiAgICAgIHZhciBfZGF0YSRidWZmZXIgPSBkYXRhLmJ1ZmZlcjtcbiAgICAgIHZhciBidWZmZXIgPSBfZGF0YSRidWZmZXIgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBfZGF0YSRidWZmZXI7XG4gICAgICB2YXIgX2RhdGEkc3VzdGFpbiA9IGRhdGEuc3VzdGFpbjtcbiAgICAgIHZhciBzdXN0YWluID0gX2RhdGEkc3VzdGFpbiA9PT0gdW5kZWZpbmVkID8gW251bGwsIG51bGxdIDogX2RhdGEkc3VzdGFpbjtcbiAgICAgIHZhciBfZGF0YSRyZWxlYXNlID0gZGF0YS5yZWxlYXNlO1xuICAgICAgdmFyIHJlbGVhc2UgPSBfZGF0YSRyZWxlYXNlID09PSB1bmRlZmluZWQgPyBbbnVsbCwgJ2xpbmVhciddIDogX2RhdGEkcmVsZWFzZTtcbiAgICAgIHZhciBfZGF0YSRwYW4gPSBkYXRhLnBhbjtcbiAgICAgIHZhciBwYW4gPSBfZGF0YSRwYW4gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBfZGF0YSRwYW47XG4gICAgICB2YXIgX2RhdGEkdmVsb2NpdHkgPSBkYXRhLnZlbG9jaXR5O1xuICAgICAgdmFyIHZlbG9jaXR5ID0gX2RhdGEkdmVsb2NpdHkgPT09IHVuZGVmaW5lZCA/IFswLCAxMjddIDogX2RhdGEkdmVsb2NpdHk7XG5cblxuICAgICAgaWYgKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbm90ZW51bWJlciBvciBhIG5vdGVuYW1lJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gZ2V0IG5vdGVudW1iZXIgZnJvbSBub3RlbmFtZSBhbmQgY2hlY2sgaWYgdGhlIG5vdGVudW1iZXIgaXMgdmFsaWRcbiAgICAgIHZhciBuID0gKDAsIF9ub3RlLmNyZWF0ZU5vdGUpKG5vdGUpO1xuICAgICAgaWYgKG4gPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignbm90IGEgdmFsaWQgbm90ZSBpZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBub3RlID0gbi5udW1iZXI7XG5cbiAgICAgIHZhciBfc3VzdGFpbiA9IF9zbGljZWRUb0FycmF5KHN1c3RhaW4sIDIpO1xuXG4gICAgICB2YXIgc3VzdGFpblN0YXJ0ID0gX3N1c3RhaW5bMF07XG4gICAgICB2YXIgc3VzdGFpbkVuZCA9IF9zdXN0YWluWzFdO1xuXG4gICAgICB2YXIgX3JlbGVhc2UgPSBfc2xpY2VkVG9BcnJheShyZWxlYXNlLCAyKTtcblxuICAgICAgdmFyIHJlbGVhc2VEdXJhdGlvbiA9IF9yZWxlYXNlWzBdO1xuICAgICAgdmFyIHJlbGVhc2VFbnZlbG9wZSA9IF9yZWxlYXNlWzFdO1xuXG4gICAgICB2YXIgX3ZlbG9jaXR5ID0gX3NsaWNlZFRvQXJyYXkodmVsb2NpdHksIDIpO1xuXG4gICAgICB2YXIgdmVsb2NpdHlTdGFydCA9IF92ZWxvY2l0eVswXTtcbiAgICAgIHZhciB2ZWxvY2l0eUVuZCA9IF92ZWxvY2l0eVsxXTtcblxuXG4gICAgICBpZiAoc3VzdGFpbi5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgc3VzdGFpblN0YXJ0ID0gc3VzdGFpbkVuZCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWxlYXNlRHVyYXRpb24gPT09IG51bGwpIHtcbiAgICAgICAgcmVsZWFzZUVudmVsb3BlID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gY29uc29sZS5sb2cobm90ZUlkLCBidWZmZXIpO1xuICAgICAgLy8gY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHJlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHBhbik7XG4gICAgICAvLyBjb25zb2xlLmxvZyh2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZCk7XG5cbiAgICAgIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV0uZm9yRWFjaChmdW5jdGlvbiAoc2FtcGxlRGF0YSwgaSkge1xuICAgICAgICBpZiAoaSA+PSB2ZWxvY2l0eVN0YXJ0ICYmIGkgPCB2ZWxvY2l0eUVuZCkge1xuICAgICAgICAgIGlmIChzYW1wbGVEYXRhID09PSAtMSkge1xuICAgICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgaWQ6IG5vdGVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBidWZmZXIgfHwgc2FtcGxlRGF0YS5idWZmZXI7XG4gICAgICAgICAgc2FtcGxlRGF0YS5zdXN0YWluU3RhcnQgPSBzdXN0YWluU3RhcnQgfHwgc2FtcGxlRGF0YS5zdXN0YWluU3RhcnQ7XG4gICAgICAgICAgc2FtcGxlRGF0YS5zdXN0YWluRW5kID0gc3VzdGFpbkVuZCB8fCBzYW1wbGVEYXRhLnN1c3RhaW5FbmQ7XG4gICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb24gPSByZWxlYXNlRHVyYXRpb24gfHwgc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb247XG4gICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSByZWxlYXNlRW52ZWxvcGUgfHwgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGU7XG4gICAgICAgICAgc2FtcGxlRGF0YS5wYW4gPSBwYW4gfHwgc2FtcGxlRGF0YS5wYW47XG5cbiAgICAgICAgICBpZiAoKDAsIF91dGlsLnR5cGVTdHJpbmcpKHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlKSA9PT0gJ2FycmF5Jykge1xuICAgICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVBcnJheSA9IHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlO1xuICAgICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSAnYXJyYXknO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVBcnJheTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3RoaXM0LnNhbXBsZXNEYXRhW25vdGVdW2ldID0gc2FtcGxlRGF0YTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV0pO1xuICAgIH1cblxuICAgIC8vIHN0ZXJlbyBzcHJlYWRcblxuICB9LCB7XG4gICAga2V5OiAnc2V0S2V5U2NhbGluZ1Bhbm5pbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRLZXlTY2FsaW5nUGFubmluZygpIHtcbiAgICAgIC8vIHNldHMgcGFubmluZyBiYXNlZCBvbiB0aGUga2V5IHZhbHVlLCBlLmcuIGhpZ2hlciBub3RlcyBhcmUgcGFubmVkIG1vcmUgdG8gdGhlIHJpZ2h0IGFuZCBsb3dlciBub3RlcyBtb3JlIHRvIHRoZSBsZWZ0XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0S2V5U2NhbGluZ1JlbGVhc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRLZXlTY2FsaW5nUmVsZWFzZSgpIHt9XG4gICAgLy8gc2V0IHJlbGVhc2UgYmFzZWQgb24ga2V5IHZhbHVlXG5cblxuICAgIC8qXG4gICAgICBAZHVyYXRpb246IG1pbGxpc2Vjb25kc1xuICAgICAgQGVudmVsb3BlOiBsaW5lYXIgfCBlcXVhbF9wb3dlciB8IGFycmF5IG9mIGludCB2YWx1ZXNcbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdzZXRSZWxlYXNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UmVsZWFzZShkdXJhdGlvbiwgZW52ZWxvcGUpIHtcbiAgICAgIC8vIHNldCByZWxlYXNlIGZvciBhbGwga2V5cywgb3ZlcnJ1bGVzIHZhbHVlcyBzZXQgYnkgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKVxuICAgICAgdGhpcy5zYW1wbGVzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChzYW1wbGVzLCBpKSB7XG4gICAgICAgIHNhbXBsZXMuZm9yRWFjaChmdW5jdGlvbiAoc2FtcGxlKSB7XG4gICAgICAgICAgaWYgKHNhbXBsZSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHNhbXBsZSA9IHtcbiAgICAgICAgICAgICAgaWQ6IGlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIHNhbXBsZS5yZWxlYXNlRHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgICAgICBzYW1wbGUucmVsZWFzZUVudmVsb3BlID0gZW52ZWxvcGU7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWxsTm90ZXNPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhbGxOb3Rlc09mZigpIHtcbiAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXTtcbiAgICAgIGlmICh0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpIHtcbiAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICBkYXRhOiAndXAnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2U7XG5cbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuc2NoZWR1bGVkU2FtcGxlcykuZm9yRWFjaChmdW5jdGlvbiAoc2FtcGxlSWQpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnICBzdG9wcGluZycsIHNhbXBsZUlkLCB0aGlzLmlkKVxuICAgICAgICBfdGhpczUuc2NoZWR1bGVkU2FtcGxlc1tzYW1wbGVJZF0uc3RvcCgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSB7fTtcblxuICAgICAgLy9jb25zb2xlLmxvZygnYWxsTm90ZXNPZmYnLCB0aGlzLnN1c3RhaW5lZFNhbXBsZXMubGVuZ3RoLCB0aGlzLnNjaGVkdWxlZFNhbXBsZXMpXG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEluc3RydW1lbnQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5NZXRyb25vbWUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfdHJhY2sgPSByZXF1aXJlKCcuL3RyYWNrJyk7XG5cbnZhciBfcGFydDIgPSByZXF1aXJlKCcuL3BhcnQnKTtcblxudmFyIF9wYXJzZV9ldmVudHMgPSByZXF1aXJlKCcuL3BhcnNlX2V2ZW50cycpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfcG9zaXRpb24gPSByZXF1aXJlKCcuL3Bvc2l0aW9uJyk7XG5cbnZhciBfaW5zdHJ1bWVudCA9IHJlcXVpcmUoJy4vaW5zdHJ1bWVudCcpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBtZXRob2RNYXAgPSBuZXcgTWFwKFtbJ3ZvbHVtZScsICdzZXRWb2x1bWUnXSwgWydpbnN0cnVtZW50JywgJ3NldEluc3RydW1lbnQnXSwgWydub3RlTnVtYmVyQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2snXSwgWydub3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2snXSwgWyd2ZWxvY2l0eUFjY2VudGVkVGljaycsICdzZXRWZWxvY2l0eUFjY2VudGVkVGljayddLCBbJ3ZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrJywgJ3NldFZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrJ10sIFsnbm90ZUxlbmd0aEFjY2VudGVkVGljaycsICdzZXROb3RlTGVuZ3RoQWNjZW50ZWRUaWNrJ10sIFsnbm90ZUxlbmd0aE5vbkFjY2VudGVkVGljaycsICdzZXROb3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrJ11dKTtcblxudmFyIE1ldHJvbm9tZSA9IGV4cG9ydHMuTWV0cm9ub21lID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNZXRyb25vbWUoc29uZykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNZXRyb25vbWUpO1xuXG4gICAgdGhpcy5zb25nID0gc29uZztcbiAgICB0aGlzLnRyYWNrID0gbmV3IF90cmFjay5UcmFjayh0aGlzLnNvbmcuaWQgKyAnX21ldHJvbm9tZScpO1xuICAgIHRoaXMucGFydCA9IG5ldyBfcGFydDIuUGFydCgpO1xuICAgIHRoaXMudHJhY2suYWRkUGFydHModGhpcy5wYXJ0KTtcbiAgICB0aGlzLnRyYWNrLmNvbm5lY3QodGhpcy5zb25nLl9vdXRwdXQpO1xuXG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gW107XG4gICAgdGhpcy5wcmVjb3VudER1cmF0aW9uID0gMDtcbiAgICB0aGlzLmJhcnMgPSAwO1xuICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIHRoaXMucHJlY291bnRJbmRleCA9IDA7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1ldHJvbm9tZSwgW3tcbiAgICBrZXk6ICdyZXNldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuXG4gICAgICB2YXIgZGF0YSA9ICgwLCBfaW5pdF9hdWRpby5nZXRJbml0RGF0YSkoKTtcbiAgICAgIHZhciBpbnN0cnVtZW50ID0gbmV3IF9pbnN0cnVtZW50Lkluc3RydW1lbnQoJ21ldHJvbm9tZScpO1xuICAgICAgaW5zdHJ1bWVudC51cGRhdGVTYW1wbGVEYXRhKHtcbiAgICAgICAgbm90ZTogNjAsXG4gICAgICAgIGJ1ZmZlcjogZGF0YS5sb3d0aWNrXG4gICAgICB9LCB7XG4gICAgICAgIG5vdGU6IDYxLFxuICAgICAgICBidWZmZXI6IGRhdGEuaGlnaHRpY2tcbiAgICAgIH0pO1xuICAgICAgdGhpcy50cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpO1xuXG4gICAgICB0aGlzLnZvbHVtZSA9IDE7XG5cbiAgICAgIHRoaXMubm90ZU51bWJlckFjY2VudGVkID0gNjE7XG4gICAgICB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZCA9IDYwO1xuXG4gICAgICB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgPSAxMDA7XG4gICAgICB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQgPSAxMDA7XG5cbiAgICAgIHRoaXMubm90ZUxlbmd0aEFjY2VudGVkID0gdGhpcy5zb25nLnBwcSAvIDQ7IC8vIHNpeHRlZW50aCBub3RlcyAtPiBkb24ndCBtYWtlIHRoaXMgdG9vIHNob3J0IGlmIHlvdXIgc2FtcGxlIGhhcyBhIGxvbmcgYXR0YWNrIVxuICAgICAgdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQgPSB0aGlzLnNvbmcucHBxIC8gNDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjcmVhdGVFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhcikge1xuICAgICAgdmFyIGlkID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gJ2luaXQnIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICB2YXIgaSA9IHZvaWQgMCxcbiAgICAgICAgICBqID0gdm9pZCAwO1xuICAgICAgdmFyIHBvc2l0aW9uID0gdm9pZCAwO1xuICAgICAgdmFyIHZlbG9jaXR5ID0gdm9pZCAwO1xuICAgICAgdmFyIG5vdGVMZW5ndGggPSB2b2lkIDA7XG4gICAgICB2YXIgbm90ZU51bWJlciA9IHZvaWQgMDtcbiAgICAgIHZhciBiZWF0c1BlckJhciA9IHZvaWQgMDtcbiAgICAgIHZhciB0aWNrc1BlckJlYXQgPSB2b2lkIDA7XG4gICAgICB2YXIgdGlja3MgPSAwO1xuICAgICAgdmFyIG5vdGVPbiA9IHZvaWQgMCxcbiAgICAgICAgICBub3RlT2ZmID0gdm9pZCAwO1xuICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKHN0YXJ0QmFyLCBlbmRCYXIpO1xuXG4gICAgICBmb3IgKGkgPSBzdGFydEJhcjsgaSA8PSBlbmRCYXI7IGkrKykge1xuICAgICAgICBwb3NpdGlvbiA9ICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMuc29uZywge1xuICAgICAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgICAgIHRhcmdldDogW2ldXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGJlYXRzUGVyQmFyID0gcG9zaXRpb24ubm9taW5hdG9yO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBwb3NpdGlvbi50aWNrc1BlckJlYXQ7XG5cbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGJlYXRzUGVyQmFyOyBqKyspIHtcblxuICAgICAgICAgIG5vdGVOdW1iZXIgPSBqID09PSAwID8gdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgOiB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZDtcbiAgICAgICAgICBub3RlTGVuZ3RoID0gaiA9PT0gMCA/IHRoaXMubm90ZUxlbmd0aEFjY2VudGVkIDogdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQ7XG4gICAgICAgICAgdmVsb2NpdHkgPSBqID09PSAwID8gdGhpcy52ZWxvY2l0eUFjY2VudGVkIDogdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkO1xuXG4gICAgICAgICAgbm90ZU9uID0gbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMTQ0LCBub3RlTnVtYmVyLCB2ZWxvY2l0eSk7XG4gICAgICAgICAgbm90ZU9mZiA9IG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MgKyBub3RlTGVuZ3RoLCAxMjgsIG5vdGVOdW1iZXIsIDApO1xuXG4gICAgICAgICAgaWYgKGlkID09PSAncHJlY291bnQnKSB7XG4gICAgICAgICAgICBub3RlT24uX3RyYWNrID0gdGhpcy50cmFjaztcbiAgICAgICAgICAgIG5vdGVPZmYuX3RyYWNrID0gdGhpcy50cmFjaztcbiAgICAgICAgICAgIG5vdGVPbi5fcGFydCA9IHt9O1xuICAgICAgICAgICAgbm90ZU9mZi5fcGFydCA9IHt9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5vdGVPbiwgbm90ZU9mZik7XG4gICAgICAgICAgdGlja3MgKz0gdGlja3NQZXJCZWF0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBldmVudHM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0RXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RXZlbnRzKCkge1xuICAgICAgdmFyIHN0YXJ0QmFyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgdmFyIF9wYXJ0O1xuXG4gICAgICB2YXIgZW5kQmFyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gdGhpcy5zb25nLmJhcnMgOiBhcmd1bWVudHNbMV07XG4gICAgICB2YXIgaWQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAnaW5pdCcgOiBhcmd1bWVudHNbMl07XG5cbiAgICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcy5wYXJ0LmdldEV2ZW50cygpKTtcbiAgICAgIHRoaXMuZXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgaWQpO1xuICAgICAgKF9wYXJ0ID0gdGhpcy5wYXJ0KS5hZGRFdmVudHMuYXBwbHkoX3BhcnQsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmV2ZW50cykpO1xuICAgICAgdGhpcy5iYXJzID0gdGhpcy5zb25nLmJhcnM7XG4gICAgICAvL2NvbnNvbGUubG9nKCdnZXRFdmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICAgIHJldHVybiB0aGlzLmV2ZW50cztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjcmVhdGVQcmVjb3VudEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZVByZWNvdW50RXZlbnRzKHByZWNvdW50LCB0aW1lU3RhbXApIHtcbiAgICAgIGlmIChwcmVjb3VudCA8PSAwKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50aW1lU3RhbXAgPSB0aW1lU3RhbXA7XG5cbiAgICAgIC8vICAgbGV0IHNvbmdTdGFydFBvc2l0aW9uID0gdGhpcy5zb25nLmdldFBvc2l0aW9uKClcblxuICAgICAgdmFyIHNvbmdTdGFydFBvc2l0aW9uID0gKDAsIF9wb3NpdGlvbi5jYWxjdWxhdGVQb3NpdGlvbikodGhpcy5zb25nLCB7XG4gICAgICAgIHR5cGU6ICdtaWxsaXMnLFxuICAgICAgICB0YXJnZXQ6IHRoaXMuc29uZy5fY3VycmVudE1pbGxpcyxcbiAgICAgICAgcmVzdWx0OiAnYWxsJ1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBlbmRQb3MgPSAoMCwgX3Bvc2l0aW9uLmNhbGN1bGF0ZVBvc2l0aW9uKSh0aGlzLnNvbmcsIHtcbiAgICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAgIHRhcmdldDogW3NvbmdTdGFydFBvc2l0aW9uLmJhciArIHByZWNvdW50XSxcbiAgICAgICAgcmVzdWx0OiAnYWxsJ1xuICAgICAgfSk7XG5cbiAgICAgIC8vY29uc29sZS5sb2coc29uZ1N0YXJ0UG9zaXRpb24sIGVuZFBvcylcblxuICAgICAgdGhpcy5wcmVjb3VudEluZGV4ID0gMDtcbiAgICAgIHRoaXMuc3RhcnRNaWxsaXMgPSBzb25nU3RhcnRQb3NpdGlvbi5taWxsaXM7XG4gICAgICB0aGlzLmVuZE1pbGxpcyA9IGVuZFBvcy5taWxsaXM7XG4gICAgICB0aGlzLnByZWNvdW50RHVyYXRpb24gPSBlbmRQb3MubWlsbGlzIC0gdGhpcy5zdGFydE1pbGxpcztcblxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnByZWNvdW50RHVyYXRpb24pXG5cbiAgICAgIHRoaXMucHJlY291bnRFdmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyhzb25nU3RhcnRQb3NpdGlvbi5iYXIsIGVuZFBvcy5iYXIgLSAxLCAncHJlY291bnQnKTtcbiAgICAgIHRoaXMucHJlY291bnRFdmVudHMgPSAoMCwgX3BhcnNlX2V2ZW50cy5wYXJzZUV2ZW50cykoW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnNvbmcuX3RpbWVFdmVudHMpLCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5wcmVjb3VudEV2ZW50cykpKTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhzb25nU3RhcnRQb3NpdGlvbi5iYXIsIGVuZFBvcy5iYXIsIHByZWNvdW50LCB0aGlzLnByZWNvdW50RXZlbnRzLmxlbmd0aCk7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMucHJlY291bnRFdmVudHMsIHRoaXMucHJlY291bnREdXJhdGlvbik7XG4gICAgICByZXR1cm4gdGhpcy5wcmVjb3VudER1cmF0aW9uO1xuICAgIH1cblxuICAgIC8vIGNhbGxlZCBieSBzY2hlZHVsZXIuanNcblxuICB9LCB7XG4gICAga2V5OiAnZ2V0UHJlY291bnRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQcmVjb3VudEV2ZW50cyhtYXh0aW1lKSB7XG4gICAgICB2YXIgZXZlbnRzID0gdGhpcy5wcmVjb3VudEV2ZW50cyxcbiAgICAgICAgICBtYXhpID0gZXZlbnRzLmxlbmd0aCxcbiAgICAgICAgICBpID0gdm9pZCAwLFxuICAgICAgICAgIGV2dCA9IHZvaWQgMCxcbiAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgZm9yIChpID0gdGhpcy5wcmVjb3VudEluZGV4OyBpIDwgbWF4aTsgaSsrKSB7XG4gICAgICAgIGV2dCA9IGV2ZW50c1tpXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWxsaXMsIG1heHRpbWUsIHRoaXMubWlsbGlzKTtcbiAgICAgICAgaWYgKGV2dC5taWxsaXMgPCBtYXh0aW1lKSB7XG4gICAgICAgICAgZXZ0LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2dC5taWxsaXM7XG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZ0KTtcbiAgICAgICAgICB0aGlzLnByZWNvdW50SW5kZXgrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyhyZXN1bHQubGVuZ3RoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbXV0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG11dGUoZmxhZykge1xuICAgICAgdGhpcy50cmFjay5tdXRlZCA9IGZsYWc7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWxsTm90ZXNPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhbGxOb3Rlc09mZigpIHtcbiAgICAgIHRoaXMudHJhY2suX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKTtcbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PSBDT05GSUdVUkFUSU9OID09PT09PT09PT09XG5cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZUNvbmZpZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUNvbmZpZygpIHtcbiAgICAgIHRoaXMuaW5pdCgxLCB0aGlzLmJhcnMsICd1cGRhdGUnKTtcbiAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKTtcbiAgICAgIHRoaXMuc29uZy5fc2NoZWR1bGVyLnVwZGF0ZVNvbmcoKTtcbiAgICB9XG5cbiAgICAvLyBhZGRlZCB0byBwdWJsaWMgQVBJOiBTb25nLmNvbmZpZ3VyZU1ldHJvbm9tZSh7fSlcblxuICB9LCB7XG4gICAga2V5OiAnY29uZmlndXJlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29uZmlndXJlKGNvbmZpZykge1xuXG4gICAgICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB0aGlzW21ldGhvZE1hcC5nZXQoa2V5KV0oY29uZmlnLmtleSk7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRJbnN0cnVtZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KSB7XG4gICAgICBpZiAoIWluc3RydW1lbnQgaW5zdGFuY2VvZiBfaW5zdHJ1bWVudC5JbnN0cnVtZW50KSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignbm90IGFuIGluc3RhbmNlIG9mIEluc3RydW1lbnQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy50cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpO1xuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXROb3RlTGVuZ3RoQWNjZW50ZWRUaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Tm90ZUxlbmd0aEFjY2VudGVkVGljayh2YWx1ZSkge1xuICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA9IHZhbHVlO1xuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXROb3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayh2YWx1ZSkge1xuICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRWZWxvY2l0eUFjY2VudGVkVGljaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFZlbG9jaXR5QWNjZW50ZWRUaWNrKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9ICgwLCBfdXRpbC5jaGVja01JRElOdW1iZXIpKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy52ZWxvY2l0eUFjY2VudGVkID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VmVsb2NpdHlOb25BY2NlbnRlZFRpY2sodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gKDAsIF91dGlsLmNoZWNrTUlESU51bWJlcikodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSBmYWxzZSkge1xuICAgICAgICB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0Tm90ZU51bWJlckFjY2VudGVkVGljaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2sodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gKDAsIF91dGlsLmNoZWNrTUlESU51bWJlcikodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSBmYWxzZSkge1xuICAgICAgICB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXROb3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljayh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSAoMCwgX3V0aWwuY2hlY2tNSURJTnVtYmVyKSh2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgIT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFZvbHVtZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFZvbHVtZSh2YWx1ZSkge1xuICAgICAgdGhpcy50cmFjay5zZXRWb2x1bWUodmFsdWUpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNZXRyb25vbWU7XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vIEAgZmxvd1xuXG52YXIgbWlkaUV2ZW50SW5kZXggPSAwO1xuXG52YXIgTUlESUV2ZW50ID0gZXhwb3J0cy5NSURJRXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1JRElFdmVudCh0aWNrcywgdHlwZSwgZGF0YTEpIHtcbiAgICB2YXIgZGF0YTIgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyAtMSA6IGFyZ3VtZW50c1szXTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJRXZlbnQpO1xuXG4gICAgdGhpcy5pZCA9IFwiTUVfXCIgKyBtaWRpRXZlbnRJbmRleCsrICsgXCJfXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLnRpY2tzID0gdGlja3M7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmRhdGExID0gZGF0YTE7XG4gICAgdGhpcy5kYXRhMiA9IGRhdGEyO1xuICAgIHRoaXMuZnJlcXVlbmN5ID0gNDQwICogTWF0aC5wb3coMiwgKGRhdGExIC0gNjkpIC8gMTIpO1xuXG4gICAgaWYgKGRhdGExID09PSAxNDQgJiYgZGF0YTIgPT09IDApIHtcbiAgICAgIHRoaXMuZGF0YTEgPSAxMjg7XG4gICAgfVxuXG4gICAgdGhpcy5fcGFydCA9IG51bGw7XG4gICAgdGhpcy5fdHJhY2sgPSBudWxsO1xuICAgIHRoaXMuX3NvbmcgPSBudWxsO1xuICAgIC8vQFRPRE86IGFkZCBhbGwgb3RoZXIgcHJvcGVydGllc1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElFdmVudCwgW3tcbiAgICBrZXk6IFwiY29weVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb3B5KCkge1xuICAgICAgdmFyIG0gPSBuZXcgTUlESUV2ZW50KHRoaXMudGlja3MsIHRoaXMudHlwZSwgdGhpcy5kYXRhMSwgdGhpcy5kYXRhMik7XG4gICAgICByZXR1cm4gbTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwidHJhbnNwb3NlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRyYW5zcG9zZShhbW91bnQpIHtcbiAgICAgIC8vIG1heSBiZSBiZXR0ZXIgaWYgbm90IGEgcHVibGljIG1ldGhvZD9cbiAgICAgIHRoaXMuZGF0YTEgKz0gYW1vdW50O1xuICAgICAgdGhpcy5mcmVxdWVuY3kgPSA0NDAgKiBNYXRoLnBvdygyLCAodGhpcy5kYXRhMSAtIDY5KSAvIDEyKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibW92ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlKHRpY2tzKSB7XG4gICAgICB0aGlzLnRpY2tzICs9IHRpY2tzO1xuICAgICAgaWYgKHRoaXMubWlkaU5vdGUpIHtcbiAgICAgICAgdGhpcy5taWRpTm90ZS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibW92ZVRvXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVUbyh0aWNrcykge1xuICAgICAgdGhpcy50aWNrcyA9IHRpY2tzO1xuICAgICAgaWYgKHRoaXMubWlkaU5vdGUpIHtcbiAgICAgICAgdGhpcy5taWRpTm90ZS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTUlESUV2ZW50O1xufSgpO1xuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZU1JRElFdmVudChldmVudCl7XG4gIC8vZXZlbnQubm90ZSA9IG51bGxcbiAgZXZlbnQubm90ZSA9IG51bGxcbiAgZXZlbnQgPSBudWxsXG59XG4qLyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuTUlESU5vdGUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfbWlkaV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaV9ldmVudCcpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgbWlkaU5vdGVJbmRleCA9IDA7XG5cbnZhciBNSURJTm90ZSA9IGV4cG9ydHMuTUlESU5vdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1JRElOb3RlKG5vdGVvbiwgbm90ZW9mZikge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJTm90ZSk7XG5cbiAgICAvL2lmKG5vdGVvbi50eXBlICE9PSAxNDQgfHwgbm90ZW9mZi50eXBlICE9PSAxMjgpe1xuICAgIGlmIChub3Rlb24udHlwZSAhPT0gMTQ0KSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2Nhbm5vdCBjcmVhdGUgTUlESU5vdGUnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5pZCA9ICdNTl8nICsgbWlkaU5vdGVJbmRleCsrICsgJ18nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdGhpcy5ub3RlT24gPSBub3Rlb247XG4gICAgbm90ZW9uLm1pZGlOb3RlID0gdGhpcztcbiAgICBub3Rlb24ubWlkaU5vdGVJZCA9IHRoaXMuaWQ7XG5cbiAgICBpZiAobm90ZW9mZiBpbnN0YW5jZW9mIF9taWRpX2V2ZW50Lk1JRElFdmVudCkge1xuICAgICAgdGhpcy5ub3RlT2ZmID0gbm90ZW9mZjtcbiAgICAgIG5vdGVvZmYubWlkaU5vdGUgPSB0aGlzO1xuICAgICAgbm90ZW9mZi5taWRpTm90ZUlkID0gdGhpcy5pZDtcbiAgICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IG5vdGVvZmYudGlja3MgLSBub3Rlb24udGlja3M7XG4gICAgICB0aGlzLmR1cmF0aW9uTWlsbGlzID0gLTE7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElOb3RlLCBbe1xuICAgIGtleTogJ2FkZE5vdGVPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGROb3RlT2ZmKG5vdGVvZmYpIHtcbiAgICAgIHRoaXMubm90ZU9mZiA9IG5vdGVvZmY7XG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlID0gdGhpcztcbiAgICAgIG5vdGVvZmYubWlkaU5vdGVJZCA9IHRoaXMuaWQ7XG4gICAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSBub3Rlb2ZmLnRpY2tzIC0gdGhpcy5ub3RlT24udGlja3M7XG4gICAgICB0aGlzLmR1cmF0aW9uTWlsbGlzID0gLTE7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY29weScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvcHkoKSB7XG4gICAgICByZXR1cm4gbmV3IE1JRElOb3RlKHRoaXMubm90ZU9uLmNvcHkoKSwgdGhpcy5ub3RlT2ZmLmNvcHkoKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgLy8gbWF5IHVzZSBhbm90aGVyIG5hbWUgZm9yIHRoaXMgbWV0aG9kXG4gICAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSB0aGlzLm5vdGVPZmYudGlja3MgLSB0aGlzLm5vdGVPbi50aWNrcztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0cmFuc3Bvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0cmFuc3Bvc2UoYW1vdW50KSB7XG4gICAgICB0aGlzLm5vdGVPbi50cmFuc3Bvc2UoYW1vdW50KTtcbiAgICAgIHRoaXMubm90ZU9mZi50cmFuc3Bvc2UoYW1vdW50KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZSh0aWNrcykge1xuICAgICAgdGhpcy5ub3RlT24ubW92ZSh0aWNrcyk7XG4gICAgICB0aGlzLm5vdGVPZmYubW92ZSh0aWNrcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZVRvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZVRvKHRpY2tzKSB7XG4gICAgICB0aGlzLm5vdGVPbi5tb3ZlVG8odGlja3MpO1xuICAgICAgdGhpcy5ub3RlT2ZmLm1vdmVUbyh0aWNrcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndW5yZWdpc3RlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVucmVnaXN0ZXIoKSB7XG4gICAgICBpZiAodGhpcy5wYXJ0KSB7XG4gICAgICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcyk7XG4gICAgICAgIHRoaXMucGFydCA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50cmFjaykge1xuICAgICAgICB0aGlzLnRyYWNrLnJlbW92ZUV2ZW50cyh0aGlzKTtcbiAgICAgICAgdGhpcy50cmFjayA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zb25nKSB7XG4gICAgICAgIHRoaXMuc29uZy5yZW1vdmVFdmVudHModGhpcyk7XG4gICAgICAgIHRoaXMuc29uZyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElOb3RlO1xufSgpOyIsIi8qXG4gIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBieXRlcyB0aHJvdWdoIHNlcXVlbnRpYWwgcmVhZHNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiAgYWRhcHRlZCB0byB3b3JrIHdpdGggQXJyYXlCdWZmZXIgLT4gVWludDhBcnJheVxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgZmNjID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxudmFyIE1JRElTdHJlYW0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgLy8gYnVmZmVyIGlzIFVpbnQ4QXJyYXlcblxuICBmdW5jdGlvbiBNSURJU3RyZWFtKGJ1ZmZlcikge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJU3RyZWFtKTtcblxuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgLyogcmVhZCBzdHJpbmcgb3IgYW55IG51bWJlciBvZiBieXRlcyAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElTdHJlYW0sIFt7XG4gICAga2V5OiAncmVhZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWQobGVuZ3RoKSB7XG4gICAgICB2YXIgdG9TdHJpbmcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICB2YXIgcmVzdWx0ID0gdm9pZCAwO1xuXG4gICAgICBpZiAodG9TdHJpbmcpIHtcbiAgICAgICAgcmVzdWx0ID0gJyc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKykge1xuICAgICAgICAgIHJlc3VsdCArPSBmY2ModGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxlbmd0aDsgX2krKywgdGhpcy5wb3NpdGlvbisrKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMzItYml0IGludGVnZXIgKi9cblxuICB9LCB7XG4gICAga2V5OiAncmVhZEludDMyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVhZEludDMyKCkge1xuICAgICAgdmFyIHJlc3VsdCA9ICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCAyNCkgKyAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdIDw8IDE2KSArICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMl0gPDwgOCkgKyB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgM107XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDQ7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qIHJlYWQgYSBiaWctZW5kaWFuIDE2LWJpdCBpbnRlZ2VyICovXG5cbiAgfSwge1xuICAgIGtleTogJ3JlYWRJbnQxNicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRJbnQxNigpIHtcbiAgICAgIHZhciByZXN1bHQgPSAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgOCkgKyB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV07XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qIHJlYWQgYW4gOC1iaXQgaW50ZWdlciAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdyZWFkSW50OCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRJbnQ4KHNpZ25lZCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dO1xuICAgICAgaWYgKHNpZ25lZCAmJiByZXN1bHQgPiAxMjcpIHtcbiAgICAgICAgcmVzdWx0IC09IDI1NjtcbiAgICAgIH1cbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZW9mJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZW9mKCkge1xuICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPj0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qIHJlYWQgYSBNSURJLXN0eWxlIGxldGlhYmxlLWxlbmd0aCBpbnRlZ2VyXG4gICAgICAoYmlnLWVuZGlhbiB2YWx1ZSBpbiBncm91cHMgb2YgNyBiaXRzLFxuICAgICAgd2l0aCB0b3AgYml0IHNldCB0byBzaWduaWZ5IHRoYXQgYW5vdGhlciBieXRlIGZvbGxvd3MpXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAncmVhZFZhckludCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRWYXJJbnQoKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gMDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5yZWFkSW50OCgpO1xuICAgICAgICBpZiAoYiAmIDB4ODApIHtcbiAgICAgICAgICByZXN1bHQgKz0gYiAmIDB4N2Y7XG4gICAgICAgICAgcmVzdWx0IDw8PSA3O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8qIGIgaXMgdGhlIGxhc3QgYnl0ZSAqL1xuICAgICAgICAgIHJldHVybiByZXN1bHQgKyBiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVzZXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFBvc2l0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UG9zaXRpb24ocCkge1xuICAgICAgdGhpcy5wb3NpdGlvbiA9IHA7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElTdHJlYW07XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IE1JRElTdHJlYW07IiwiLypcbiAgRXh0cmFjdHMgYWxsIG1pZGkgZXZlbnRzIGZyb20gYSBiaW5hcnkgbWlkaSBmaWxlLCB1c2VzIG1pZGlfc3RyZWFtLmpzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnBhcnNlTUlESUZpbGUgPSBwYXJzZU1JRElGaWxlO1xuXG52YXIgX21pZGlfc3RyZWFtID0gcmVxdWlyZSgnLi9taWRpX3N0cmVhbScpO1xuXG52YXIgX21pZGlfc3RyZWFtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21pZGlfc3RyZWFtKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGxhc3RFdmVudFR5cGVCeXRlID0gdm9pZCAwLFxuICAgIHRyYWNrTmFtZSA9IHZvaWQgMDtcblxuZnVuY3Rpb24gcmVhZENodW5rKHN0cmVhbSkge1xuICB2YXIgaWQgPSBzdHJlYW0ucmVhZCg0LCB0cnVlKTtcbiAgdmFyIGxlbmd0aCA9IHN0cmVhbS5yZWFkSW50MzIoKTtcbiAgLy9jb25zb2xlLmxvZyhsZW5ndGgpO1xuICByZXR1cm4ge1xuICAgICdpZCc6IGlkLFxuICAgICdsZW5ndGgnOiBsZW5ndGgsXG4gICAgJ2RhdGEnOiBzdHJlYW0ucmVhZChsZW5ndGgsIGZhbHNlKVxuICB9O1xufVxuXG5mdW5jdGlvbiByZWFkRXZlbnQoc3RyZWFtKSB7XG4gIHZhciBldmVudCA9IHt9O1xuICB2YXIgbGVuZ3RoO1xuICBldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICB2YXIgZXZlbnRUeXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50VHlwZUJ5dGUsIGV2ZW50VHlwZUJ5dGUgJiAweDgwLCAxNDYgJiAweDBmKTtcbiAgaWYgKChldmVudFR5cGVCeXRlICYgMHhmMCkgPT0gMHhmMCkge1xuICAgIC8qIHN5c3RlbSAvIG1ldGEgZXZlbnQgKi9cbiAgICBpZiAoZXZlbnRUeXBlQnl0ZSA9PSAweGZmKSB7XG4gICAgICAvKiBtZXRhIGV2ZW50ICovXG4gICAgICBldmVudC50eXBlID0gJ21ldGEnO1xuICAgICAgdmFyIHN1YnR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgc3dpdGNoIChzdWJ0eXBlQnl0ZSkge1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG4gICAgICAgICAgaWYgKGxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2VxdWVuY2VOdW1iZXIgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWJlciA9IHN0cmVhbS5yZWFkSW50MTYoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RleHQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAyOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29weXJpZ2h0Tm90aWNlJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RyYWNrTmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2luc3RydW1lbnROYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2x5cmljcyc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtYXJrZXInO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA3OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY3VlUG9pbnQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDIwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWlkaUNoYW5uZWxQcmVmaXgnO1xuICAgICAgICAgIGlmIChsZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIG1pZGlDaGFubmVsUHJlZml4IGV2ZW50IGlzIDEsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jaGFubmVsID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MmY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdlbmRPZlRyYWNrJztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NldFRlbXBvJztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSAzKSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXRUZW1wbyBldmVudCBpcyAzLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdCA9IChzdHJlYW0ucmVhZEludDgoKSA8PCAxNikgKyAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgOCkgKyBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1NDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NtcHRlT2Zmc2V0JztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSA1KSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzbXB0ZU9mZnNldCBldmVudCBpcyA1LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGhvdXJCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWVSYXRlID0ge1xuICAgICAgICAgICAgMHgwMDogMjQsIDB4MjA6IDI1LCAweDQwOiAyOSwgMHg2MDogMzBcbiAgICAgICAgICB9W2hvdXJCeXRlICYgMHg2MF07XG4gICAgICAgICAgZXZlbnQuaG91ciA9IGhvdXJCeXRlICYgMHgxZjtcbiAgICAgICAgICBldmVudC5taW4gPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zZWMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnN1YmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTg6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0aW1lU2lnbmF0dXJlJztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSA0KSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciB0aW1lU2lnbmF0dXJlIGV2ZW50IGlzIDQsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1lcmF0b3IgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5kZW5vbWluYXRvciA9IE1hdGgucG93KDIsIHN0cmVhbS5yZWFkSW50OCgpKTtcbiAgICAgICAgICBldmVudC5tZXRyb25vbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC50aGlydHlzZWNvbmRzID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTk6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdrZXlTaWduYXR1cmUnO1xuICAgICAgICAgIGlmIChsZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQua2V5ID0gc3RyZWFtLnJlYWRJbnQ4KHRydWUpO1xuICAgICAgICAgIGV2ZW50LnNjYWxlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4N2Y6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZXJTcGVjaWZpYyc7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vaWYoc2VxdWVuY2VyLmRlYnVnID49IDIpe1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUud2FybignVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogJyArIHN1YnR5cGVCeXRlKTtcbiAgICAgICAgICAvL31cbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH0gZWxzZSBpZiAoZXZlbnRUeXBlQnl0ZSA9PSAweGYwKSB7XG4gICAgICBldmVudC50eXBlID0gJ3N5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9IGVsc2UgaWYgKGV2ZW50VHlwZUJ5dGUgPT0gMHhmNykge1xuICAgICAgZXZlbnQudHlwZSA9ICdkaXZpZGVkU3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZSBieXRlOiAnICsgZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLyogY2hhbm5lbCBldmVudCAqL1xuICAgIHZhciBwYXJhbTEgPSB2b2lkIDA7XG4gICAgaWYgKChldmVudFR5cGVCeXRlICYgMHg4MCkgPT09IDApIHtcbiAgICAgIC8qIHJ1bm5pbmcgc3RhdHVzIC0gcmV1c2UgbGFzdEV2ZW50VHlwZUJ5dGUgYXMgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgIGV2ZW50VHlwZUJ5dGUgaXMgYWN0dWFsbHkgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgKi9cbiAgICAgIC8vY29uc29sZS5sb2coJ3J1bm5pbmcgc3RhdHVzJyk7XG4gICAgICBwYXJhbTEgPSBldmVudFR5cGVCeXRlO1xuICAgICAgZXZlbnRUeXBlQnl0ZSA9IGxhc3RFdmVudFR5cGVCeXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbTEgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2xhc3QnLCBldmVudFR5cGVCeXRlKTtcbiAgICAgIGxhc3RFdmVudFR5cGVCeXRlID0gZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gICAgdmFyIGV2ZW50VHlwZSA9IGV2ZW50VHlwZUJ5dGUgPj4gNDtcbiAgICBldmVudC5jaGFubmVsID0gZXZlbnRUeXBlQnl0ZSAmIDB4MGY7XG4gICAgZXZlbnQudHlwZSA9ICdjaGFubmVsJztcbiAgICBzd2l0Y2ggKGV2ZW50VHlwZSkge1xuICAgICAgY2FzZSAweDA4OlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MDk6XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmIChldmVudC52ZWxvY2l0eSA9PT0gMCkge1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ25vdGVPbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGI6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29udHJvbGxlcic7XG4gICAgICAgIGV2ZW50LmNvbnRyb2xsZXJUeXBlID0gcGFyYW0xO1xuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGM6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncHJvZ3JhbUNoYW5nZSc7XG4gICAgICAgIGV2ZW50LnByb2dyYW1OdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZDpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjaGFubmVsQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHBhcmFtMTtcbiAgICAgICAgLy9pZih0cmFja05hbWUgPT09ICdTSC1TMS00NC1DMDkgTD1TTUwgSU49Mycpe1xuICAgICAgICAvLyAgICBjb25zb2xlLmxvZygnY2hhbm5lbCBwcmVzc3VyZScsIHRyYWNrTmFtZSwgcGFyYW0xKTtcbiAgICAgICAgLy99XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwaXRjaEJlbmQnO1xuICAgICAgICBldmVudC52YWx1ZSA9IHBhcmFtMSArIChzdHJlYW0ucmVhZEludDgoKSA8PCA3KTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLypcbiAgICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGU7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlKTtcbiAgICAgICAgKi9cblxuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgLypcbiAgICAgICAgICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICAgICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3ZWlyZG8nLCB0cmFja05hbWUsIHBhcmFtMSwgZXZlbnQudmVsb2NpdHkpO1xuICAgICAgICAqL1xuXG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VNSURJRmlsZShidWZmZXIpIHtcbiAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPT09IGZhbHNlICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2J1ZmZlciBzaG91bGQgYmUgYW4gaW5zdGFuY2Ugb2YgVWludDhBcnJheSBvZiBBcnJheUJ1ZmZlcicpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICB9XG4gIHZhciB0cmFja3MgPSBuZXcgTWFwKCk7XG4gIHZhciBzdHJlYW0gPSBuZXcgX21pZGlfc3RyZWFtMi5kZWZhdWx0KGJ1ZmZlcik7XG5cbiAgdmFyIGhlYWRlckNodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gIGlmIChoZWFkZXJDaHVuay5pZCAhPT0gJ01UaGQnIHx8IGhlYWRlckNodW5rLmxlbmd0aCAhPT0gNikge1xuICAgIHRocm93ICdCYWQgLm1pZCBmaWxlIC0gaGVhZGVyIG5vdCBmb3VuZCc7XG4gIH1cblxuICB2YXIgaGVhZGVyU3RyZWFtID0gbmV3IF9taWRpX3N0cmVhbTIuZGVmYXVsdChoZWFkZXJDaHVuay5kYXRhKTtcbiAgdmFyIGZvcm1hdFR5cGUgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIHZhciB0cmFja0NvdW50ID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICB2YXIgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG4gIGlmICh0aW1lRGl2aXNpb24gJiAweDgwMDApIHtcbiAgICB0aHJvdyAnRXhwcmVzc2luZyB0aW1lIGRpdmlzaW9uIGluIFNNVFBFIGZyYW1lcyBpcyBub3Qgc3VwcG9ydGVkIHlldCc7XG4gIH1cblxuICB2YXIgaGVhZGVyID0ge1xuICAgICdmb3JtYXRUeXBlJzogZm9ybWF0VHlwZSxcbiAgICAndHJhY2tDb3VudCc6IHRyYWNrQ291bnQsXG4gICAgJ3RpY2tzUGVyQmVhdCc6IHRpbWVEaXZpc2lvblxuICB9O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJhY2tDb3VudDsgaSsrKSB7XG4gICAgdHJhY2tOYW1lID0gJ3RyYWNrXycgKyBpO1xuICAgIHZhciB0cmFjayA9IFtdO1xuICAgIHZhciB0cmFja0NodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gICAgaWYgKHRyYWNrQ2h1bmsuaWQgIT09ICdNVHJrJykge1xuICAgICAgdGhyb3cgJ1VuZXhwZWN0ZWQgY2h1bmsgLSBleHBlY3RlZCBNVHJrLCBnb3QgJyArIHRyYWNrQ2h1bmsuaWQ7XG4gICAgfVxuICAgIHZhciB0cmFja1N0cmVhbSA9IG5ldyBfbWlkaV9zdHJlYW0yLmRlZmF1bHQodHJhY2tDaHVuay5kYXRhKTtcbiAgICB3aGlsZSAoIXRyYWNrU3RyZWFtLmVvZigpKSB7XG4gICAgICB2YXIgZXZlbnQgPSByZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuICAgICAgdHJhY2sucHVzaChldmVudCk7XG4gICAgfVxuICAgIHRyYWNrcy5zZXQodHJhY2tOYW1lLCB0cmFjayk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgICdoZWFkZXInOiBoZWFkZXIsXG4gICAgJ3RyYWNrcyc6IHRyYWNrc1xuICB9O1xufSIsIi8qXG4gIEFkZHMgYSBmdW5jdGlvbiB0byBjcmVhdGUgYSBub3RlIG9iamVjdCB0aGF0IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGEgbXVzaWNhbCBub3RlOlxuICAgIC0gbmFtZSwgZS5nLiAnQydcbiAgICAtIG9jdGF2ZSwgIC0xIC0gOVxuICAgIC0gZnVsbE5hbWU6ICdDMSdcbiAgICAtIGZyZXF1ZW5jeTogMjM0LjE2LCBiYXNlZCBvbiB0aGUgYmFzaWMgcGl0Y2hcbiAgICAtIG51bWJlcjogNjAgbWlkaSBub3RlIG51bWJlclxuXG4gIEFkZHMgc2V2ZXJhbCB1dGlsaXR5IG1ldGhvZHMgb3JnYW5pc2VkIGFyb3VuZCB0aGUgbm90ZSBvYmplY3RcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuY3JlYXRlTm90ZSA9IGNyZWF0ZU5vdGU7XG5leHBvcnRzLmdldE5vdGVOdW1iZXIgPSBnZXROb3RlTnVtYmVyO1xuZXhwb3J0cy5nZXROb3RlTmFtZSA9IGdldE5vdGVOYW1lO1xuZXhwb3J0cy5nZXROb3RlT2N0YXZlID0gZ2V0Tm90ZU9jdGF2ZTtcbmV4cG9ydHMuZ2V0RnVsbE5vdGVOYW1lID0gZ2V0RnVsbE5vdGVOYW1lO1xuZXhwb3J0cy5nZXRGcmVxdWVuY3kgPSBnZXRGcmVxdWVuY3k7XG5leHBvcnRzLmlzQmxhY2tLZXkgPSBpc0JsYWNrS2V5O1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIGVycm9yTXNnID0gdm9pZCAwLFxuICAgIHdhcm5pbmdNc2cgPSB2b2lkIDAsXG4gICAgcG93ID0gTWF0aC5wb3csXG4gICAgZmxvb3IgPSBNYXRoLmZsb29yO1xuXG52YXIgbm90ZU5hbWVzID0ge1xuICAnc2hhcnAnOiBbJ0MnLCAnQyMnLCAnRCcsICdEIycsICdFJywgJ0YnLCAnRiMnLCAnRycsICdHIycsICdBJywgJ0EjJywgJ0InXSxcbiAgJ2ZsYXQnOiBbJ0MnLCAnRGInLCAnRCcsICdFYicsICdFJywgJ0YnLCAnR2InLCAnRycsICdBYicsICdBJywgJ0JiJywgJ0InXSxcbiAgJ2VuaGFybW9uaWMtc2hhcnAnOiBbJ0IjJywgJ0MjJywgJ0MjIycsICdEIycsICdEIyMnLCAnRSMnLCAnRiMnLCAnRiMjJywgJ0cjJywgJ0cjIycsICdBIycsICdBIyMnXSxcbiAgJ2VuaGFybW9uaWMtZmxhdCc6IFsnRGJiJywgJ0RiJywgJ0ViYicsICdFYicsICdGYicsICdHYmInLCAnR2InLCAnQWJiJywgJ0FiJywgJ0JiYicsICdCYicsICdDYiddXG59O1xuXG4vKlxuICBhcmd1bWVudHNcbiAgLSBub3RlTnVtYmVyOiA2MFxuICAtIG5vdGVOdW1iZXIgYW5kIG5vdGVuYW1lIG1vZGU6IDYwLCAnc2hhcnAnXG4gIC0gbm90ZU5hbWU6ICdDIzQnXG4gIC0gbmFtZSBhbmQgb2N0YXZlOiAnQyMnLCA0XG4gIC0gbm90ZSBuYW1lLCBvY3RhdmUsIG5vdGUgbmFtZSBtb2RlOiAnRCcsIDQsICdzaGFycCdcbiAgLSBkYXRhIG9iamVjdDpcbiAgICB7XG4gICAgICBuYW1lOiAnQycsXG4gICAgICBvY3RhdmU6IDRcbiAgICB9XG4gICAgb3JcbiAgICB7XG4gICAgICBmcmVxdWVuY3k6IDIzNC4xNlxuICAgIH1cbiovXG5cbmZ1bmN0aW9uIGNyZWF0ZU5vdGUoKSB7XG4gIHZhciBudW1BcmdzID0gYXJndW1lbnRzLmxlbmd0aCxcbiAgICAgIGRhdGEgPSB2b2lkIDAsXG4gICAgICBvY3RhdmUgPSB2b2lkIDAsXG4gICAgICBub3RlTmFtZSA9IHZvaWQgMCxcbiAgICAgIG5vdGVOdW1iZXIgPSB2b2lkIDAsXG4gICAgICBub3RlTmFtZU1vZGUgPSB2b2lkIDAsXG4gICAgICBhcmcwID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwID8gdW5kZWZpbmVkIDogYXJndW1lbnRzWzBdLFxuICAgICAgYXJnMSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1sxXSxcbiAgICAgIGFyZzIgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgPyB1bmRlZmluZWQgOiBhcmd1bWVudHNbMl0sXG4gICAgICB0eXBlMCA9ICgwLCBfdXRpbC50eXBlU3RyaW5nKShhcmcwKSxcbiAgICAgIHR5cGUxID0gKDAsIF91dGlsLnR5cGVTdHJpbmcpKGFyZzEpLFxuICAgICAgdHlwZTIgPSAoMCwgX3V0aWwudHlwZVN0cmluZykoYXJnMik7XG5cbiAgZXJyb3JNc2cgPSAnJztcbiAgd2FybmluZ01zZyA9ICcnO1xuXG4gIC8vIGFyZ3VtZW50OiBub3RlIG51bWJlclxuICAvL2NvbnNvbGUubG9nKG51bUFyZ3MsIHR5cGUwKVxuICBpZiAobnVtQXJncyA9PT0gMSAmJiB0eXBlMCA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAoYXJnMCA8IDAgfHwgYXJnMCA+IDEyNykge1xuICAgICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYSBub3RlIG51bWJlciA+PSAwIGFuZCA8PSAxMjcgJyArIGFyZzA7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdGVOdW1iZXIgPSBhcmcwO1xuICAgICAgZGF0YSA9IF9nZXROb3RlTmFtZShub3RlTnVtYmVyKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgfVxuXG4gICAgLy8gYXJndW1lbnRzOiBmdWxsIG5vdGUgbmFtZVxuICB9IGVsc2UgaWYgKG51bUFyZ3MgPT09IDEgJiYgdHlwZTAgPT09ICdzdHJpbmcnKSB7XG4gICAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCk7XG4gICAgICBpZiAoZXJyb3JNc2cgPT09ICcnKSB7XG4gICAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgICAgfVxuXG4gICAgICAvLyBhcmd1bWVudHM6IG5vdGUgbmFtZSwgb2N0YXZlXG4gICAgfSBlbHNlIGlmIChudW1BcmdzID09PSAyICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzAsIGFyZzEpO1xuICAgICAgICBpZiAoZXJyb3JNc2cgPT09ICcnKSB7XG4gICAgICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYXJndW1lbnRzOiBmdWxsIG5vdGUgbmFtZSwgbm90ZSBuYW1lIG1vZGUgLT4gZm9yIGNvbnZlcnRpbmcgYmV0d2VlbiBub3RlIG5hbWUgbW9kZXNcbiAgICAgIH0gZWxzZSBpZiAobnVtQXJncyA9PT0gMiAmJiB0eXBlMCA9PT0gJ3N0cmluZycgJiYgdHlwZTEgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzApO1xuICAgICAgICAgIGlmIChlcnJvck1zZyA9PT0gJycpIHtcbiAgICAgICAgICAgIG5vdGVOYW1lTW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShhcmcxKTtcbiAgICAgICAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgICAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICAgICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsIG9jdGF2ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gYXJndW1lbnRzOiBub3RlIG51bWJlciwgbm90ZSBuYW1lIG1vZGVcbiAgICAgICAgfSBlbHNlIGlmIChudW1BcmdzID09PSAyICYmICgwLCBfdXRpbC50eXBlU3RyaW5nKShhcmcwKSA9PT0gJ251bWJlcicgJiYgKDAsIF91dGlsLnR5cGVTdHJpbmcpKGFyZzEpID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKGFyZzAgPCAwIHx8IGFyZzAgPiAxMjcpIHtcbiAgICAgICAgICAgICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYSBub3RlIG51bWJlciA+PSAwIGFuZCA8PSAxMjcgJyArIGFyZzA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBub3RlTmFtZU1vZGUgPSBfY2hlY2tOb3RlTmFtZU1vZGUoYXJnMSk7XG4gICAgICAgICAgICAgIG5vdGVOdW1iZXIgPSBhcmcwO1xuICAgICAgICAgICAgICBkYXRhID0gX2dldE5vdGVOYW1lKG5vdGVOdW1iZXIsIG5vdGVOYW1lTW9kZSk7XG4gICAgICAgICAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgICAgICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYXJndW1lbnRzOiBub3RlIG5hbWUsIG9jdGF2ZSwgbm90ZSBuYW1lIG1vZGVcbiAgICAgICAgICB9IGVsc2UgaWYgKG51bUFyZ3MgPT09IDMgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyAmJiB0eXBlMiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzAsIGFyZzEpO1xuICAgICAgICAgICAgICBpZiAoZXJyb3JNc2cgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzIpO1xuICAgICAgICAgICAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgICAgICAgICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgICAgICAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZXJyb3JNc2cgPSAnd3JvbmcgYXJndW1lbnRzLCBwbGVhc2UgY29uc3VsdCBkb2N1bWVudGF0aW9uJztcbiAgICAgICAgICAgIH1cblxuICBpZiAoZXJyb3JNc2cpIHtcbiAgICBjb25zb2xlLmVycm9yKGVycm9yTXNnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAod2FybmluZ01zZykge1xuICAgIGNvbnNvbGUud2Fybih3YXJuaW5nTXNnKTtcbiAgfVxuXG4gIHZhciBub3RlID0ge1xuICAgIG5hbWU6IG5vdGVOYW1lLFxuICAgIG9jdGF2ZTogb2N0YXZlLFxuICAgIGZ1bGxOYW1lOiBub3RlTmFtZSArIG9jdGF2ZSxcbiAgICBudW1iZXI6IG5vdGVOdW1iZXIsXG4gICAgZnJlcXVlbmN5OiBfZ2V0RnJlcXVlbmN5KG5vdGVOdW1iZXIpLFxuICAgIGJsYWNrS2V5OiBfaXNCbGFja0tleShub3RlTnVtYmVyKVxuICB9O1xuICBPYmplY3QuZnJlZXplKG5vdGUpO1xuICByZXR1cm4gbm90ZTtcbn1cblxuLy9mdW5jdGlvbiBfZ2V0Tm90ZU5hbWUobnVtYmVyLCBtb2RlID0gY29uZmlnLmdldCgnbm90ZU5hbWVNb2RlJykpIHtcbmZ1bmN0aW9uIF9nZXROb3RlTmFtZShudW1iZXIpIHtcbiAgdmFyIG1vZGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnc2hhcnAnIDogYXJndW1lbnRzWzFdO1xuXG4gIC8vbGV0IG9jdGF2ZSA9IE1hdGguZmxvb3IoKG51bWJlciAvIDEyKSAtIDIpLCAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgdmFyIG9jdGF2ZSA9IGZsb29yKG51bWJlciAvIDEyIC0gMSk7XG4gIHZhciBub3RlTmFtZSA9IG5vdGVOYW1lc1ttb2RlXVtudW1iZXIgJSAxMl07XG4gIHJldHVybiBbbm90ZU5hbWUsIG9jdGF2ZV07XG59XG5cbmZ1bmN0aW9uIF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSkge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIHZhciBpbmRleCA9IHZvaWQgMDtcblxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBrZXlzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgdmFyIGtleSA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICB2YXIgbW9kZSA9IG5vdGVOYW1lc1trZXldO1xuICAgICAgaW5kZXggPSBtb2RlLmZpbmRJbmRleChmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4geCA9PT0gbmFtZTtcbiAgICAgIH0pO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL251bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMikgKyAxMjsgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIG51bWJlciA9IGluZGV4ICsgMTIgKyBvY3RhdmUgKiAxMjsgLy8g4oaSIG1pZGkgc3RhbmRhcmQgKyBzY2llbnRpZmljIG5hbWluZywgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01pZGRsZV9DIGFuZCBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NjaWVudGlmaWNfcGl0Y2hfbm90YXRpb25cblxuICBpZiAobnVtYmVyIDwgMCB8fCBudW1iZXIgPiAxMjcpIHtcbiAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgYmV0d2VlbiBDMCBhbmQgRzEwJztcbiAgICByZXR1cm47XG4gIH1cbiAgcmV0dXJuIG51bWJlcjtcbn1cblxuZnVuY3Rpb24gX2dldEZyZXF1ZW5jeShudW1iZXIpIHtcbiAgLy9yZXR1cm4gY29uZmlnLmdldCgncGl0Y2gnKSAqIHBvdygyLChudW1iZXIgLSA2OSkvMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbiAgcmV0dXJuIDQ0MCAqIHBvdygyLCAobnVtYmVyIC0gNjkpIC8gMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbn1cblxuLy8gVE9ETzogY2FsY3VsYXRlIG5vdGUgZnJvbSBmcmVxdWVuY3lcbmZ1bmN0aW9uIF9nZXRQaXRjaChoZXJ0eikge1xuICAvL2ZtICA9ICAyKG3iiJI2OSkvMTIoNDQwIEh6KS5cbn1cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpIHtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICB2YXIgcmVzdWx0ID0ga2V5cy5maW5kKGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIHggPT09IG1vZGU7XG4gIH0pICE9PSB1bmRlZmluZWQ7XG4gIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgLy9tb2RlID0gY29uZmlnLmdldCgnbm90ZU5hbWVNb2RlJyk7XG4gICAgbW9kZSA9ICdzaGFycCc7XG4gICAgd2FybmluZ01zZyA9IG1vZGUgKyAnIGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSBtb2RlLCB1c2luZyBcIicgKyBtb2RlICsgJ1wiIGluc3RlYWQnO1xuICB9XG4gIHJldHVybiBtb2RlO1xufVxuXG5mdW5jdGlvbiBfY2hlY2tOb3RlTmFtZSgpIHtcbiAgdmFyIG51bUFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgYXJnMCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1swXSxcbiAgICAgIGFyZzEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgPyB1bmRlZmluZWQgOiBhcmd1bWVudHNbMV0sXG4gICAgICBjaGFyID0gdm9pZCAwLFxuICAgICAgbmFtZSA9ICcnLFxuICAgICAgb2N0YXZlID0gJyc7XG5cbiAgLy8gZXh0cmFjdCBvY3RhdmUgZnJvbSBub3RlIG5hbWVcbiAgaWYgKG51bUFyZ3MgPT09IDEpIHtcbiAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBhcmcwW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgIGNoYXIgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgICAgaWYgKGlzTmFOKGNoYXIpICYmIGNoYXIgIT09ICctJykge1xuICAgICAgICAgIG5hbWUgKz0gY2hhcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvY3RhdmUgKz0gY2hhcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICAgIF9pdGVyYXRvcjIucmV0dXJuKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob2N0YXZlID09PSAnJykge1xuICAgICAgb2N0YXZlID0gMDtcbiAgICB9XG4gIH0gZWxzZSBpZiAobnVtQXJncyA9PT0gMikge1xuICAgIG5hbWUgPSBhcmcwO1xuICAgIG9jdGF2ZSA9IGFyZzE7XG4gIH1cblxuICAvLyBjaGVjayBpZiBub3RlIG5hbWUgaXMgdmFsaWRcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICB2YXIgaW5kZXggPSAtMTtcblxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvcjMgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IzID0ga2V5c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMzsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IChfc3RlcDMgPSBfaXRlcmF0b3IzLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zID0gdHJ1ZSkge1xuICAgICAgdmFyIGtleSA9IF9zdGVwMy52YWx1ZTtcblxuICAgICAgdmFyIG1vZGUgPSBub3RlTmFtZXNba2V5XTtcbiAgICAgIGluZGV4ID0gbW9kZS5maW5kSW5kZXgoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIHggPT09IG5hbWU7XG4gICAgICB9KTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvcjMgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yMyA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyAmJiBfaXRlcmF0b3IzLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IzLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IzKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgZXJyb3JNc2cgPSBhcmcwICsgJyBpcyBub3QgYSB2YWxpZCBub3RlIG5hbWUsIHBsZWFzZSB1c2UgbGV0dGVycyBBIC0gRyBhbmQgaWYgbmVjZXNzYXJ5IGFuIGFjY2lkZW50YWwgbGlrZSAjLCAjIywgYiBvciBiYiwgZm9sbG93ZWQgYnkgYSBudW1iZXIgZm9yIHRoZSBvY3RhdmUnO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChvY3RhdmUgPCAtMSB8fCBvY3RhdmUgPiA5KSB7XG4gICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYW4gb2N0YXZlIGJldHdlZW4gLTEgYW5kIDknO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG9jdGF2ZSA9IHBhcnNlSW50KG9jdGF2ZSwgMTApO1xuICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMCwgMSkudG9VcHBlckNhc2UoKSArIG5hbWUuc3Vic3RyaW5nKDEpO1xuXG4gIC8vY29uc29sZS5sb2cobmFtZSwnfCcsb2N0YXZlKTtcbiAgcmV0dXJuIFtuYW1lLCBvY3RhdmVdO1xufVxuXG5mdW5jdGlvbiBfaXNCbGFja0tleShub3RlTnVtYmVyKSB7XG4gIHZhciBibGFjayA9IHZvaWQgMDtcblxuICBzd2l0Y2ggKHRydWUpIHtcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTogLy9DI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAzOiAvL0QjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDY6IC8vRiNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gODogLy9HI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxMDpcbiAgICAgIC8vQSNcbiAgICAgIGJsYWNrID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBibGFjayA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGJsYWNrO1xufVxuXG5mdW5jdGlvbiBnZXROb3RlTnVtYmVyKCkge1xuICB2YXIgbm90ZSA9IGNyZWF0ZU5vdGUuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICBpZiAobm90ZSkge1xuICAgIHJldHVybiBub3RlLm51bWJlcjtcbiAgfVxuICByZXR1cm4gZXJyb3JNc2c7XG59XG5cbmZ1bmN0aW9uIGdldE5vdGVOYW1lKCkge1xuICB2YXIgbm90ZSA9IGNyZWF0ZU5vdGUuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICBpZiAobm90ZSkge1xuICAgIHJldHVybiBub3RlLm5hbWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBnZXROb3RlT2N0YXZlKCkge1xuICB2YXIgbm90ZSA9IGNyZWF0ZU5vdGUuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICBpZiAobm90ZSkge1xuICAgIHJldHVybiBub3RlLm9jdGF2ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGdldEZ1bGxOb3RlTmFtZSgpIHtcbiAgdmFyIG5vdGUgPSBjcmVhdGVOb3RlLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgaWYgKG5vdGUpIHtcbiAgICByZXR1cm4gbm90ZS5mdWxsTmFtZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGdldEZyZXF1ZW5jeSgpIHtcbiAgdmFyIG5vdGUgPSBjcmVhdGVOb3RlLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgaWYgKG5vdGUpIHtcbiAgICByZXR1cm4gbm90ZS5mcmVxdWVuY3k7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpc0JsYWNrS2V5KCkge1xuICB2YXIgbm90ZSA9IGNyZWF0ZU5vdGUuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICBpZiAobm90ZSkge1xuICAgIHJldHVybiBub3RlLmJsYWNrS2V5O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG5leHBvcnRzLmRlY29kZVNhbXBsZSA9IGRlY29kZVNhbXBsZTtcbmV4cG9ydHMucGFyc2VTYW1wbGVzMiA9IHBhcnNlU2FtcGxlczI7XG5leHBvcnRzLnBhcnNlU2FtcGxlcyA9IHBhcnNlU2FtcGxlcztcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX2lzb21vcnBoaWNGZXRjaCA9IHJlcXVpcmUoJ2lzb21vcnBoaWMtZmV0Y2gnKTtcblxudmFyIF9pc29tb3JwaGljRmV0Y2gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNvbW9ycGhpY0ZldGNoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gZGVjb2RlU2FtcGxlKHNhbXBsZSwgaWQsIGV2ZXJ5KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIHRyeSB7XG4gICAgICBfaW5pdF9hdWRpby5jb250ZXh0LmRlY29kZUF1ZGlvRGF0YShzYW1wbGUsIGZ1bmN0aW9uIG9uU3VjY2VzcyhidWZmZXIpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhpZCwgYnVmZmVyKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXNvbHZlKHsgaWQ6IGlkLCBidWZmZXI6IGJ1ZmZlciB9KTtcbiAgICAgICAgICBpZiAoZXZlcnkpIHtcbiAgICAgICAgICAgIGV2ZXJ5KHsgaWQ6IGlkLCBidWZmZXI6IGJ1ZmZlciB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShidWZmZXIpO1xuICAgICAgICAgIGlmIChldmVyeSkge1xuICAgICAgICAgICAgZXZlcnkoYnVmZmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIGZ1bmN0aW9uIG9uRXJyb3IoZSkge1xuICAgICAgICBjb25zb2xlKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSk7XG4gICAgICAgIC8vcmVqZWN0KGUpOyAvLyBkb24ndCB1c2UgcmVqZWN0IGJlY2F1c2Ugd2UgdXNlIHRoaXMgYXMgYSBuZXN0ZWQgcHJvbWlzZSBhbmQgd2UgZG9uJ3Qgd2FudCB0aGUgcGFyZW50IHByb21pc2UgdG8gcmVqZWN0XG4gICAgICAgIGlmICh0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSh7IGlkOiBpZCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpO1xuICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVzb2x2ZSh7IGlkOiBpZCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBsb2FkQW5kUGFyc2VTYW1wbGUodXJsLCBpZCwgZXZlcnkpIHtcbiAgLy9jb25zb2xlLmxvZyhpZCwgdXJsKVxuICB2YXIgZXhlY3V0b3IgPSBmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlKSB7XG4gICAgKDAsIF9pc29tb3JwaGljRmV0Y2gyLmRlZmF1bHQpKGVzY2FwZSh1cmwpLCB7XG4gICAgICBtZXRob2Q6ICdHRVQnXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICByZXNwb25zZS5hcnJheUJ1ZmZlcigpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gICAgICAgICAgZGVjb2RlU2FtcGxlKGRhdGEsIGlkLCBldmVyeSkudGhlbihyZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVzb2x2ZSh7IGlkOiBpZCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvbWlzZXMocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBldmVyeSkge1xuXG4gIHZhciBnZXRTYW1wbGUgPSBmdW5jdGlvbiBnZXRTYW1wbGUoKSB7XG5cbiAgICBpZiAoc2FtcGxlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgIHByb21pc2VzLnB1c2goZGVjb2RlU2FtcGxlKHNhbXBsZSwga2V5LCBldmVyeSkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbXBsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICgoMCwgX3V0aWwuY2hlY2tJZkJhc2U2NCkoc2FtcGxlKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKGRlY29kZVNhbXBsZSgoMCwgX3V0aWwuYmFzZTY0VG9CaW5hcnkpKHNhbXBsZSksIGtleSwgZXZlcnkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKHNhbXBsZSwga2V5LCBldmVyeSkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKHR5cGVvZiBzYW1wbGUgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHNhbXBsZSkpID09PSAnb2JqZWN0Jykge1xuICAgICAgc2FtcGxlID0gc2FtcGxlLnNhbXBsZSB8fCBzYW1wbGUuYnVmZmVyIHx8IHNhbXBsZS5iYXNlNjQgfHwgc2FtcGxlLnVybDtcbiAgICAgIGdldFNhbXBsZShwcm9taXNlcywgc2FtcGxlLCBrZXksIGV2ZXJ5KTtcbiAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlLCBwcm9taXNlcy5sZW5ndGgpXG4gICAgfVxuICB9O1xuXG4gIGdldFNhbXBsZSgpO1xufVxuXG4vLyBvbmx5IGZvciBpbnRlcm5hbGx5IHVzZSBpbiBxYW1iaVxuZnVuY3Rpb24gcGFyc2VTYW1wbGVzMihtYXBwaW5nKSB7XG4gIHZhciBldmVyeSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzFdO1xuXG4gIHZhciB0eXBlID0gKDAsIF91dGlsLnR5cGVTdHJpbmcpKG1hcHBpbmcpLFxuICAgICAgcHJvbWlzZXMgPSBbXTtcblxuICBldmVyeSA9IHR5cGVvZiBldmVyeSA9PT0gJ2Z1bmN0aW9uJyA/IGV2ZXJ5IDogZmFsc2U7XG4gIC8vY29uc29sZS5sb2codHlwZSwgbWFwcGluZylcbiAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgT2JqZWN0LmtleXMobWFwcGluZykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAvL2tleSA9IHBhcnNlSW50KGtleSwgMTApXG4gICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgbWFwcGluZ1trZXldLCBrZXksIGV2ZXJ5KTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnYXJyYXknKSB7XG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBrZXkgPSB2b2lkIDA7XG4gICAgICBtYXBwaW5nLmZvckVhY2goZnVuY3Rpb24gKHNhbXBsZSkge1xuICAgICAgICAvLyBrZXkgaXMgZGVsaWJlcmF0ZWx5IHVuZGVmaW5lZFxuICAgICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgc2FtcGxlLCBrZXksIGV2ZXJ5KTtcbiAgICAgIH0pO1xuICAgIH0pKCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbWFwcGluZyA9IHt9O1xuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IHZhbHVlLmJ1ZmZlcjtcbiAgICAgICAgfSk7XG4gICAgICAgIHJlc29sdmUobWFwcGluZyk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcGFyc2VTYW1wbGVzKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZGF0YSA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGRhdGFbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICBpZiAoZGF0YS5sZW5ndGggPT09IDEgJiYgKDAsIF91dGlsLnR5cGVTdHJpbmcpKGRhdGFbMF0pICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGFbMF0pO1xuICB9XG4gIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGEpO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucGFyc2VUaW1lRXZlbnRzID0gcGFyc2VUaW1lRXZlbnRzO1xuZXhwb3J0cy5wYXJzZUV2ZW50cyA9IHBhcnNlRXZlbnRzO1xuZXhwb3J0cy5wYXJzZU1JRElOb3RlcyA9IHBhcnNlTUlESU5vdGVzO1xuZXhwb3J0cy5maWx0ZXJFdmVudHMgPSBmaWx0ZXJFdmVudHM7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX21pZGlfbm90ZSA9IHJlcXVpcmUoJy4vbWlkaV9ub3RlJyk7XG5cbnZhciBwcHEgPSB2b2lkIDAsXG4gICAgYnBtID0gdm9pZCAwLFxuICAgIGZhY3RvciA9IHZvaWQgMCxcbiAgICBub21pbmF0b3IgPSB2b2lkIDAsXG4gICAgZGVub21pbmF0b3IgPSB2b2lkIDAsXG4gICAgcGxheWJhY2tTcGVlZCA9IHZvaWQgMCxcbiAgICBiYXIgPSB2b2lkIDAsXG4gICAgYmVhdCA9IHZvaWQgMCxcbiAgICBzaXh0ZWVudGggPSB2b2lkIDAsXG4gICAgdGljayA9IHZvaWQgMCxcbiAgICB0aWNrcyA9IHZvaWQgMCxcbiAgICBtaWxsaXMgPSB2b2lkIDAsXG4gICAgbWlsbGlzUGVyVGljayA9IHZvaWQgMCxcbiAgICBzZWNvbmRzUGVyVGljayA9IHZvaWQgMCxcbiAgICB0aWNrc1BlckJlYXQgPSB2b2lkIDAsXG4gICAgdGlja3NQZXJCYXIgPSB2b2lkIDAsXG4gICAgdGlja3NQZXJTaXh0ZWVudGggPSB2b2lkIDAsXG4gICAgbnVtU2l4dGVlbnRoID0gdm9pZCAwLFxuICAgIGRpZmZUaWNrcyA9IHZvaWQgMDtcbi8vcHJldmlvdXNFdmVudFxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKSB7XG4gIHNlY29uZHNQZXJUaWNrID0gMSAvIHBsYXliYWNrU3BlZWQgKiA2MCAvIGJwbSAvIHBwcTtcbiAgbWlsbGlzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrICogMTAwMDtcbiAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLCBicG0sIHBwcSwgcGxheWJhY2tTcGVlZCwgKHBwcSAqIG1pbGxpc1BlclRpY2spKTtcbiAgLy9jb25zb2xlLmxvZyhwcHEpO1xufVxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKSB7XG4gIGZhY3RvciA9IDQgLyBkZW5vbWluYXRvcjtcbiAgbnVtU2l4dGVlbnRoID0gZmFjdG9yICogNDtcbiAgdGlja3NQZXJCZWF0ID0gcHBxICogZmFjdG9yO1xuICB0aWNrc1BlckJhciA9IHRpY2tzUGVyQmVhdCAqIG5vbWluYXRvcjtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBwcHEgLyA0O1xuICAvL2NvbnNvbGUubG9nKGRlbm9taW5hdG9yLCBmYWN0b3IsIG51bVNpeHRlZW50aCwgdGlja3NQZXJCZWF0LCB0aWNrc1BlckJhciwgdGlja3NQZXJTaXh0ZWVudGgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCkge1xuICB2YXIgZmFzdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzFdO1xuXG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIC8vIGlmKGRpZmZUaWNrcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGRpZmZUaWNrcywgZXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudHlwZSlcbiAgLy8gfVxuICB0aWNrICs9IGRpZmZUaWNrcztcbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgLy9wcmV2aW91c0V2ZW50ID0gZXZlbnRcbiAgLy9jb25zb2xlLmxvZyhkaWZmVGlja3MsIG1pbGxpc1BlclRpY2spO1xuICBtaWxsaXMgKz0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcblxuICBpZiAoZmFzdCA9PT0gZmFsc2UpIHtcbiAgICB3aGlsZSAodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCkge1xuICAgICAgc2l4dGVlbnRoKys7XG4gICAgICB0aWNrIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgd2hpbGUgKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCkge1xuICAgICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgICBiZWF0Kys7XG4gICAgICAgIHdoaWxlIChiZWF0ID4gbm9taW5hdG9yKSB7XG4gICAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgICAgYmFyKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VUaW1lRXZlbnRzKHNldHRpbmdzLCB0aW1lRXZlbnRzKSB7XG4gIHZhciBpc1BsYXlpbmcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1syXTtcblxuICAvL2NvbnNvbGUubG9nKCdwYXJzZSB0aW1lIGV2ZW50cycpXG4gIHZhciB0eXBlID0gdm9pZCAwO1xuICB2YXIgZXZlbnQgPSB2b2lkIDA7XG5cbiAgcHBxID0gc2V0dGluZ3MucHBxO1xuICBicG0gPSBzZXR0aW5ncy5icG07XG4gIG5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcjtcbiAgcGxheWJhY2tTcGVlZCA9IHNldHRpbmdzLnBsYXliYWNrU3BlZWQ7XG4gIGJhciA9IDE7XG4gIGJlYXQgPSAxO1xuICBzaXh0ZWVudGggPSAxO1xuICB0aWNrID0gMDtcbiAgdGlja3MgPSAwO1xuICBtaWxsaXMgPSAwO1xuXG4gIHNldFRpY2tEdXJhdGlvbigpO1xuICBzZXRUaWNrc1BlckJlYXQoKTtcblxuICB0aW1lRXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYS50aWNrcyA8PSBiLnRpY2tzID8gLTEgOiAxO1xuICB9KTtcbiAgdmFyIGUgPSAwO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0aW1lRXZlbnRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgZXZlbnQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhlKyssIGV2ZW50LnRpY2tzLCBldmVudC50eXBlKVxuICAgICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICAgIHR5cGUgPSBldmVudC50eXBlO1xuICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG5cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuXG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICAgICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICAgIHNldFRpY2tzUGVyQmVhdCgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICAgIHVwZGF0ZUV2ZW50KGV2ZW50LCBpc1BsYXlpbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXJzQXNTdHJpbmcpO1xuICAgIH1cblxuICAgIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAvL2NvbnNvbGUubG9nKHRpbWVFdmVudHMpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vL2V4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhzb25nLCBldmVudHMpe1xuZnVuY3Rpb24gcGFyc2VFdmVudHMoZXZlbnRzKSB7XG4gIHZhciBpc1BsYXlpbmcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIHZhciBldmVudCA9IHZvaWQgMDtcbiAgdmFyIHN0YXJ0RXZlbnQgPSAwO1xuICB2YXIgbGFzdEV2ZW50VGljayA9IDA7XG4gIHZhciByZXN1bHQgPSBbXTtcblxuICB0aWNrID0gMDtcbiAgdGlja3MgPSAwO1xuICBkaWZmVGlja3MgPSAwO1xuXG4gIC8vbGV0IGV2ZW50cyA9IFtdLmNvbmNhdChldnRzLCBzb25nLl90aW1lRXZlbnRzKTtcbiAgdmFyIG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGg7XG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuXG4gIC8vIG5vdGVvZmYgY29tZXMgYmVmb3JlIG5vdGVvblxuXG4gIC8qXG4gICAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gYS5zb3J0SW5kZXggLSBiLnNvcnRJbmRleDtcbiAgICB9KVxuICAqL1xuXG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKGEudGlja3MgPT09IGIudGlja3MpIHtcbiAgICAgIC8vIGlmKGEudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vICAgcmV0dXJuIC0xXG4gICAgICAvLyB9ZWxzZSBpZihiLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAxXG4gICAgICAvLyB9XG4gICAgICAvLyBzaG9ydDpcbiAgICAgIHZhciByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgaWYgKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgIHIgPSAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3M7XG4gIH0pO1xuICBldmVudCA9IGV2ZW50c1swXTtcbiAgLy9jb25zb2xlLmxvZyhldmVudClcblxuICBicG0gPSBldmVudC5icG07XG4gIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcblxuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG5cbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0RXZlbnQ7IGkgPCBudW1FdmVudHM7IGkrKykge1xuXG4gICAgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuICAgICAgICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgICAgICAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzO1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrcztcbiAgICAgICAgdGlja3MgPSBldmVudC50aWNrcztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLGV2ZW50Lm1pbGxpc1BlclRpY2spO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICAgICAgICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzO1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrcztcbiAgICAgICAgdGlja3MgPSBldmVudC50aWNrcztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub21pbmF0b3IsbnVtU2l4dGVlbnRoLHRpY2tzUGVyU2l4dGVlbnRoKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vY2FzZSAxMjg6XG4gICAgICAgIC8vY2FzZSAxNDQ6XG4gICAgICAgIHVwZGF0ZVBvc2l0aW9uKGV2ZW50LCBpc1BsYXlpbmcpO1xuICAgICAgICB1cGRhdGVFdmVudChldmVudCwgaXNQbGF5aW5nKTtcbiAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpO1xuXG4gICAgICAvLyBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQuZGF0YTIsIGV2ZW50LmJhcnNBc1N0cmluZylcbiAgICAgIC8vIH1cblxuICAgIH1cblxuICAgIC8vIGlmKGkgPCAxMDAgJiYgKGV2ZW50LnR5cGUgPT09IDgxIHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpKXtcbiAgICAvLyAgIC8vY29uc29sZS5sb2coaSwgdGlja3MsIGRpZmZUaWNrcywgbWlsbGlzLCBtaWxsaXNQZXJUaWNrKVxuICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQubWlsbGlzLCAnbm90ZScsIGV2ZW50LmRhdGExLCAndmVsbycsIGV2ZW50LmRhdGEyKVxuICAgIC8vIH1cblxuICAgIGxhc3RFdmVudFRpY2sgPSBldmVudC50aWNrcztcbiAgfVxuICBwYXJzZU1JRElOb3RlcyhyZXN1bHQpO1xuICByZXR1cm4gcmVzdWx0O1xuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGV2ZW50KSB7XG4gIHZhciBmYXN0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMV07XG5cbiAgLy9jb25zb2xlLmxvZyhiYXIsIGJlYXQsIHRpY2tzKVxuICAvL2NvbnNvbGUubG9nKGV2ZW50LCBicG0sIG1pbGxpc1BlclRpY2ssIHRpY2tzLCBtaWxsaXMpO1xuXG4gIGV2ZW50LmJwbSA9IGJwbTtcbiAgZXZlbnQubm9taW5hdG9yID0gbm9taW5hdG9yO1xuICBldmVudC5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuXG4gIGV2ZW50LnRpY2tzUGVyQmFyID0gdGlja3NQZXJCYXI7XG4gIGV2ZW50LnRpY2tzUGVyQmVhdCA9IHRpY2tzUGVyQmVhdDtcbiAgZXZlbnQudGlja3NQZXJTaXh0ZWVudGggPSB0aWNrc1BlclNpeHRlZW50aDtcblxuICBldmVudC5mYWN0b3IgPSBmYWN0b3I7XG4gIGV2ZW50Lm51bVNpeHRlZW50aCA9IG51bVNpeHRlZW50aDtcbiAgZXZlbnQuc2Vjb25kc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljaztcbiAgZXZlbnQubWlsbGlzUGVyVGljayA9IG1pbGxpc1BlclRpY2s7XG5cbiAgZXZlbnQudGlja3MgPSB0aWNrcztcblxuICBldmVudC5taWxsaXMgPSBtaWxsaXM7XG4gIGV2ZW50LnNlY29uZHMgPSBtaWxsaXMgLyAxMDAwO1xuXG4gIGlmIChmYXN0KSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZXZlbnQuYmFyID0gYmFyO1xuICBldmVudC5iZWF0ID0gYmVhdDtcbiAgZXZlbnQuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICBldmVudC50aWNrID0gdGljaztcbiAgLy9ldmVudC5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGljaztcbiAgdmFyIHRpY2tBc1N0cmluZyA9IHRpY2sgPT09IDAgPyAnMDAwJyA6IHRpY2sgPCAxMCA/ICcwMCcgKyB0aWNrIDogdGljayA8IDEwMCA/ICcwJyArIHRpY2sgOiB0aWNrO1xuICBldmVudC5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgdGlja0FzU3RyaW5nO1xuICBldmVudC5iYXJzQXNBcnJheSA9IFtiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja107XG5cbiAgdmFyIHRpbWVEYXRhID0gKDAsIF91dGlsLmdldE5pY2VUaW1lKShtaWxsaXMpO1xuXG4gIGV2ZW50LmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICBldmVudC5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gIGV2ZW50LnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgZXZlbnQubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgZXZlbnQudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICBldmVudC50aW1lQXNBcnJheSA9IHRpbWVEYXRhLnRpbWVBc0FycmF5O1xuXG4gIC8vIGlmKG1pbGxpcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAvLyB9XG59XG5cbnZhciBtaWRpTm90ZUluZGV4ID0gMDtcblxuZnVuY3Rpb24gcGFyc2VNSURJTm90ZXMoZXZlbnRzKSB7XG4gIHZhciBub3RlcyA9IHt9O1xuICB2YXIgbm90ZXNJblRyYWNrID0gdm9pZCAwO1xuICB2YXIgbiA9IDA7XG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBldmVudHNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgIHZhciBldmVudCA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgaWYgKHR5cGVvZiBldmVudC5fcGFydCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGV2ZW50Ll90cmFjayA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ25vIHBhcnQgYW5kL29yIHRyYWNrIHNldCcpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChldmVudC50eXBlID09PSAxNDQpIHtcbiAgICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXTtcbiAgICAgICAgaWYgKHR5cGVvZiBub3Rlc0luVHJhY2sgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudDtcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gMTI4KSB7XG4gICAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50Ll90cmFjay5pZF07XG4gICAgICAgIGlmICh0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIGNvcnJlc3BvbmRpbmcgbm90ZW9uIGV2ZW50IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub3RlT24gPSBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdO1xuICAgICAgICB2YXIgbm90ZU9mZiA9IGV2ZW50O1xuICAgICAgICBpZiAodHlwZW9mIG5vdGVPbiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBub3Rlb24gZXZlbnQgZm9yIGV2ZW50JywgZXZlbnQuaWQpXG4gICAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50Ll90cmFjay5pZF1bZXZlbnQuZGF0YTFdO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub3RlID0gbmV3IF9taWRpX25vdGUuTUlESU5vdGUobm90ZU9uLCBub3RlT2ZmKTtcbiAgICAgICAgbm90ZSA9IG51bGw7XG4gICAgICAgIC8vIGxldCBpZCA9IGBNTl8ke21pZGlOb3RlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgICAgIC8vIG5vdGVPbi5taWRpTm90ZUlkID0gaWRcbiAgICAgICAgLy8gbm90ZU9uLm9mZiA9IG5vdGVPZmYuaWRcbiAgICAgICAgLy8gbm90ZU9mZi5taWRpTm90ZUlkID0gaWRcbiAgICAgICAgLy8gbm90ZU9mZi5vbiA9IG5vdGVPbi5pZFxuICAgICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV07XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBPYmplY3Qua2V5cyhub3RlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgZGVsZXRlIG5vdGVzW2tleV07XG4gIH0pO1xuICBub3RlcyA9IHt9O1xuICAvL2NvbnNvbGUubG9nKG5vdGVzLCBub3Rlc0luVHJhY2spXG59XG5cbi8vIG5vdCBpbiB1c2UhXG5mdW5jdGlvbiBmaWx0ZXJFdmVudHMoZXZlbnRzKSB7XG4gIHZhciBzdXN0YWluID0ge307XG4gIHZhciB0bXBSZXN1bHQgPSB7fTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvcjMgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IzID0gZXZlbnRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAzOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zID0gKF9zdGVwMyA9IF9pdGVyYXRvcjMubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSB0cnVlKSB7XG4gICAgICB2YXIgZXZlbnQgPSBfc3RlcDMudmFsdWU7XG5cbiAgICAgIGlmIChldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KSB7XG4gICAgICAgIGlmIChldmVudC5kYXRhMiA9PT0gMCkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gZXZlbnQudGlja3MpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0bXBSZXN1bHRbZXZlbnQudGlja3NdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudDtcbiAgICAgICAgICBkZWxldGUgc3VzdGFpbltldmVudC50cmFja0lkXTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5kYXRhMiA9PT0gMTI3KSB7XG4gICAgICAgICAgc3VzdGFpbltldmVudC50cmFja0lkXSA9IGV2ZW50LnRpY2tzO1xuICAgICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IzID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvcjMgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgJiYgX2l0ZXJhdG9yMy5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yMy5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMykge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjM7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc29sZS5sb2coc3VzdGFpbik7XG4gIE9iamVjdC5rZXlzKHRtcFJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHN1c3RhaW5FdmVudCA9IHRtcFJlc3VsdFtrZXldO1xuICAgIGNvbnNvbGUubG9nKHN1c3RhaW5FdmVudCk7XG4gICAgcmVzdWx0LnB1c2goc3VzdGFpbkV2ZW50KTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5QYXJ0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvLyBAIGZsb3dcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgcGFydEluZGV4ID0gMDtcblxudmFyIFBhcnQgPSBleHBvcnRzLlBhcnQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFBhcnQoKSB7XG4gICAgdmFyIG5hbWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBhcnQpO1xuXG4gICAgdGhpcy5pZCA9ICdNUF8nICsgcGFydEluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWQ7XG4gICAgdGhpcy5tdXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3RyYWNrID0gbnVsbDtcbiAgICB0aGlzLl9zb25nID0gbnVsbDtcbiAgICB0aGlzLl9ldmVudHMgPSBbXTtcbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlO1xuICAgIHRoaXMuX3N0YXJ0ID0geyBtaWxsaXM6IDAsIHRpY2tzOiAwIH07XG4gICAgdGhpcy5fZW5kID0geyBtaWxsaXM6IDAsIHRpY2tzOiAwIH07XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoUGFydCwgW3tcbiAgICBrZXk6ICdjb3B5JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29weSgpIHtcbiAgICAgIHZhciBwID0gbmV3IFBhcnQodGhpcy5uYW1lICsgJ19jb3B5Jyk7IC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICAgIHZhciBldmVudHMgPSBbXTtcbiAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgY29weSA9IGV2ZW50LmNvcHkoKTtcbiAgICAgICAgY29uc29sZS5sb2coY29weSk7XG4gICAgICAgIGV2ZW50cy5wdXNoKGNvcHkpO1xuICAgICAgfSk7XG4gICAgICBwLmFkZEV2ZW50cy5hcHBseShwLCBldmVudHMpO1xuICAgICAgcC51cGRhdGUoKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3RyYW5zcG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRyYW5zcG9zZShhbW91bnQpIHtcbiAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlKHRpY2tzKSB7XG4gICAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQubW92ZSh0aWNrcyk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHM7XG5cbiAgICAgICAgKF9zb25nJF9tb3ZlZEV2ZW50cyA9IHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9tb3ZlZEV2ZW50cywgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVUbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVUbyh0aWNrcykge1xuICAgICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcyk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHMyO1xuXG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHMyID0gdGhpcy5fc29uZy5fbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX21vdmVkRXZlbnRzMiwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEV2ZW50cygpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICAgICAgdmFyIHRyYWNrID0gdGhpcy5fdHJhY2s7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgZXZlbnRzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuX3BhcnQgPSBfdGhpcztcbiAgICAgICAgX3RoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudCk7XG4gICAgICAgIF90aGlzLl9ldmVudHMucHVzaChldmVudCk7XG4gICAgICAgIGlmICh0cmFjaykge1xuICAgICAgICAgIGV2ZW50Ll90cmFjayA9IHRyYWNrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICh0cmFjaykge1xuICAgICAgICB2YXIgX3RyYWNrJF9ldmVudHM7XG5cbiAgICAgICAgKF90cmFjayRfZXZlbnRzID0gdHJhY2suX2V2ZW50cykucHVzaC5hcHBseShfdHJhY2skX2V2ZW50cywgZXZlbnRzKTtcbiAgICAgICAgdHJhY2suX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbmV3RXZlbnRzO1xuXG4gICAgICAgIChfc29uZyRfbmV3RXZlbnRzID0gdGhpcy5fc29uZy5fbmV3RXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9uZXdFdmVudHMsIGV2ZW50cyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXZlbnRzKCkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHZhciB0cmFjayA9IHRoaXMuX3RyYWNrO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuX3BhcnQgPSBudWxsO1xuICAgICAgICBfdGhpczIuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKTtcbiAgICAgICAgaWYgKHRyYWNrKSB7XG4gICAgICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbDtcbiAgICAgICAgICB0cmFjay5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICh0cmFjaykge1xuICAgICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB0cmFjay5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fc29uZykge1xuICAgICAgICB2YXIgX3NvbmckX3JlbW92ZWRFdmVudHM7XG5cbiAgICAgICAgKF9zb25nJF9yZW1vdmVkRXZlbnRzID0gdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfcmVtb3ZlZEV2ZW50cywgZXZlbnRzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlO1xuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlRXZlbnRzKHRpY2tzKSB7XG4gICAgICBmb3IgKHZhciBfbGVuMyA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW4zID4gMSA/IF9sZW4zIC0gMSA6IDApLCBfa2V5MyA9IDE7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcbiAgICAgICAgZXZlbnRzW19rZXkzIC0gMV0gPSBhcmd1bWVudHNbX2tleTNdO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQubW92ZSh0aWNrcyk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHMzO1xuXG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHMzID0gdGhpcy5fc29uZy5fbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX21vdmVkRXZlbnRzMywgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVFdmVudHNUbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVFdmVudHNUbyh0aWNrcykge1xuICAgICAgZm9yICh2YXIgX2xlbjQgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuNCA+IDEgPyBfbGVuNCAtIDEgOiAwKSwgX2tleTQgPSAxOyBfa2V5NCA8IF9sZW40OyBfa2V5NCsrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5NCAtIDFdID0gYXJndW1lbnRzW19rZXk0XTtcbiAgICAgIH1cblxuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcyk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHM0O1xuXG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHM0ID0gdGhpcy5fc29uZy5fbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX21vdmVkRXZlbnRzNCwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50cygpIHtcbiAgICAgIHZhciBmaWx0ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuICAgICAgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgICBpZiAodGhpcy5fbmVlZHNVcGRhdGUpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpOyAvL0BUT0RPIGltcGxlbWVudCBmaWx0ZXIgLT4gZmlsdGVyRXZlbnRzKCkgc2hvdWxkIGJlIGEgdXRpbGl0eSBmdW5jdGlvbiAobm90IGEgY2xhc3MgbWV0aG9kKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ211dGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtdXRlKCkge1xuICAgICAgdmFyIGZsYWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICBpZiAoZmxhZykge1xuICAgICAgICB0aGlzLm11dGVkID0gZmxhZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubXV0ZWQgPSAhdGhpcy5tdXRlZDtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICBpZiAodGhpcy5fbmVlZHNVcGRhdGUgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9jcmVhdGVFdmVudEFycmF5KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgICgwLCBfdXRpbC5zb3J0RXZlbnRzKSh0aGlzLl9ldmVudHMpO1xuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICAgIC8vQFRPRE86IGNhbGN1bGF0ZSBwYXJ0IHN0YXJ0IGFuZCBlbmQsIGFuZCBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBQYXJ0O1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuUGxheWhlYWQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcG9zaXRpb24gPSByZXF1aXJlKCcuL3Bvc2l0aW9uLmpzJyk7XG5cbnZhciBfZXZlbnRsaXN0ZW5lciA9IHJlcXVpcmUoJy4vZXZlbnRsaXN0ZW5lci5qcycpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciByYW5nZSA9IDEwOyAvLyBtaWxsaXNlY29uZHMgb3IgdGlja3NcbnZhciBpbnN0YW5jZUlkID0gMDtcblxudmFyIFBsYXloZWFkID0gZXhwb3J0cy5QbGF5aGVhZCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUGxheWhlYWQoc29uZykge1xuICAgIHZhciB0eXBlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ2FsbCcgOiBhcmd1bWVudHNbMV07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGxheWhlYWQpO1xuXG4gICAgdGhpcy5pZCA9ICdQT1MgJyArIGluc3RhbmNlSWQrKyArICcgJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMuc29uZyA9IHNvbmc7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmxhc3RFdmVudCA9IG51bGw7XG4gICAgdGhpcy5kYXRhID0ge307XG5cbiAgICB0aGlzLmFjdGl2ZVBhcnRzID0gW107XG4gICAgdGhpcy5hY3RpdmVOb3RlcyA9IFtdO1xuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW107XG4gIH1cblxuICAvLyB1bml0IGNhbiBiZSAnbWlsbGlzJyBvciAndGlja3MnXG5cblxuICBfY3JlYXRlQ2xhc3MoUGxheWhlYWQsIFt7XG4gICAga2V5OiAnc2V0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0KHVuaXQsIHZhbHVlKSB7XG4gICAgICB0aGlzLnVuaXQgPSB1bml0O1xuICAgICAgdGhpcy5jdXJyZW50VmFsdWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMuZXZlbnRJbmRleCA9IDA7XG4gICAgICB0aGlzLm5vdGVJbmRleCA9IDA7XG4gICAgICB0aGlzLnBhcnRJbmRleCA9IDA7XG4gICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSh1bml0LCBkaWZmKSB7XG4gICAgICBpZiAoZGlmZiA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhO1xuICAgICAgfVxuICAgICAgdGhpcy51bml0ID0gdW5pdDtcbiAgICAgIHRoaXMuY3VycmVudFZhbHVlICs9IGRpZmY7XG4gICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGVTb25nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlU29uZygpIHtcbiAgICAgIHRoaXMuZXZlbnRzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnNvbmcuX2V2ZW50cyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnNvbmcuX3RpbWVFdmVudHMpKTtcbiAgICAgICgwLCBfdXRpbC5zb3J0RXZlbnRzKSh0aGlzLmV2ZW50cyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdldmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICAgIHRoaXMubm90ZXMgPSB0aGlzLnNvbmcuX25vdGVzO1xuICAgICAgdGhpcy5wYXJ0cyA9IHRoaXMuc29uZy5fcGFydHM7XG4gICAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aDtcbiAgICAgIHRoaXMubnVtTm90ZXMgPSB0aGlzLm5vdGVzLmxlbmd0aDtcbiAgICAgIHRoaXMubnVtUGFydHMgPSB0aGlzLnBhcnRzLmxlbmd0aDtcbiAgICAgIHRoaXMuc2V0KCdtaWxsaXMnLCB0aGlzLnNvbmcuX21pbGxpcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY2FsY3VsYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2FsY3VsYXRlKCkge1xuICAgICAgdmFyIGkgPSB2b2lkIDA7XG4gICAgICB2YXIgdmFsdWUgPSB2b2lkIDA7XG4gICAgICB2YXIgZXZlbnQgPSB2b2lkIDA7XG4gICAgICB2YXIgbm90ZSA9IHZvaWQgMDtcbiAgICAgIHZhciBwYXJ0ID0gdm9pZCAwO1xuICAgICAgdmFyIHBvc2l0aW9uID0gdm9pZCAwO1xuICAgICAgdmFyIHN0aWxsQWN0aXZlTm90ZXMgPSBbXTtcbiAgICAgIHZhciBzdGlsbEFjdGl2ZVBhcnRzID0gW107XG4gICAgICB2YXIgY29sbGVjdGVkUGFydHMgPSBuZXcgU2V0KCk7XG4gICAgICB2YXIgY29sbGVjdGVkTm90ZXMgPSBuZXcgU2V0KCk7XG5cbiAgICAgIHRoaXMuZGF0YSA9IHt9O1xuICAgICAgdGhpcy5hY3RpdmVFdmVudHMgPSBbXTtcblxuICAgICAgZm9yIChpID0gdGhpcy5ldmVudEluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKykge1xuICAgICAgICBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgICB2YWx1ZSA9IGV2ZW50W3RoaXMudW5pdF07XG4gICAgICAgIGlmICh2YWx1ZSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgIC8vIGlmIHRoZSBwbGF5aGVhZCBpcyBzZXQgdG8gYSBwb3NpdGlvbiBvZiBzYXkgMzAwMCBtaWxsaXMsIHdlIGRvbid0IHdhbnQgdG8gYWRkIGV2ZW50cyBtb3JlIHRoYXQgMTAgdW5pdHMgYmVmb3JlIHRoZSBwbGF5aGVhZFxuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA+IHRoaXMuY3VycmVudFZhbHVlIC0gcmFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlRXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgLy8gdGhpcyBkb2Vzbid0IHdvcmsgdG9vIHdlbGxcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAxNzYpIHtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTIpXG4gICAgICAgICAgICAgIGlmIChldmVudC5kYXRhMSA9PT0gNjQpIHtcbiAgICAgICAgICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbDInLFxuICAgICAgICAgICAgICAgICAgZGF0YTogZXZlbnQuZGF0YTIgPT09IDEyNyA/ICdkb3duJyA6ICd1cCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyB9ZWxzZXtcbiAgICAgICAgICAgICAgLy8gICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgICAgLy8gICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgICAgIC8vICAgICBkYXRhOiBldmVudFxuICAgICAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5sYXN0RXZlbnQgPSBldmVudDtcbiAgICAgICAgICB0aGlzLmV2ZW50SW5kZXgrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgICAgdGhpcy5kYXRhLmFjdGl2ZUV2ZW50cyA9IHRoaXMuYWN0aXZlRXZlbnRzO1xuXG4gICAgICAvLyBpZiBhIHNvbmcgaGFzIG5vIGV2ZW50cyB5ZXQsIHVzZSB0aGUgZmlyc3QgdGltZSBldmVudCBhcyByZWZlcmVuY2VcbiAgICAgIGlmICh0aGlzLmxhc3RFdmVudCA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxhc3RFdmVudCA9IHRoaXMuc29uZy5fdGltZUV2ZW50c1swXTtcbiAgICAgIH1cblxuICAgICAgcG9zaXRpb24gPSAoMCwgX3Bvc2l0aW9uLmdldFBvc2l0aW9uMikodGhpcy5zb25nLCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlLCAnYWxsJywgdGhpcy5sYXN0RXZlbnQpO1xuICAgICAgdGhpcy5kYXRhLmV2ZW50SW5kZXggPSB0aGlzLmV2ZW50SW5kZXg7XG4gICAgICB0aGlzLmRhdGEubWlsbGlzID0gcG9zaXRpb24ubWlsbGlzO1xuICAgICAgdGhpcy5kYXRhLnRpY2tzID0gcG9zaXRpb24udGlja3M7XG4gICAgICB0aGlzLmRhdGEucG9zaXRpb24gPSBwb3NpdGlvbjtcblxuICAgICAgaWYgKHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IE9iamVjdC5rZXlzKHBvc2l0aW9uKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgICAgZGF0YVtrZXldID0gcG9zaXRpb25ba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZS5pbmRleE9mKCdiYXJzYmVhdHMnKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5kYXRhLmJhciA9IHBvc2l0aW9uLmJhcjtcbiAgICAgICAgdGhpcy5kYXRhLmJlYXQgPSBwb3NpdGlvbi5iZWF0O1xuICAgICAgICB0aGlzLmRhdGEuc2l4dGVlbnRoID0gcG9zaXRpb24uc2l4dGVlbnRoO1xuICAgICAgICB0aGlzLmRhdGEudGljayA9IHBvc2l0aW9uLnRpY2s7XG4gICAgICAgIHRoaXMuZGF0YS5iYXJzQXNTdHJpbmcgPSBwb3NpdGlvbi5iYXJzQXNTdHJpbmc7XG5cbiAgICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmFyID0gcG9zaXRpb24udGlja3NQZXJCYXI7XG4gICAgICAgIHRoaXMuZGF0YS50aWNrc1BlckJlYXQgPSBwb3NpdGlvbi50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRoaXMuZGF0YS50aWNrc1BlclNpeHRlZW50aCA9IHBvc2l0aW9uLnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICB0aGlzLmRhdGEubnVtU2l4dGVlbnRoID0gcG9zaXRpb24ubnVtU2l4dGVlbnRoO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUuaW5kZXhPZigndGltZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRhdGEuaG91ciA9IHBvc2l0aW9uLmhvdXI7XG4gICAgICAgIHRoaXMuZGF0YS5taW51dGUgPSBwb3NpdGlvbi5taW51dGU7XG4gICAgICAgIHRoaXMuZGF0YS5zZWNvbmQgPSBwb3NpdGlvbi5zZWNvbmQ7XG4gICAgICAgIHRoaXMuZGF0YS5taWxsaXNlY29uZCA9IHBvc2l0aW9uLm1pbGxpc2Vjb25kO1xuICAgICAgICB0aGlzLmRhdGEudGltZUFzU3RyaW5nID0gcG9zaXRpb24udGltZUFzU3RyaW5nO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUuaW5kZXhPZigncGVyY2VudGFnZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRhdGEucGVyY2VudGFnZSA9IHBvc2l0aW9uLnBlcmNlbnRhZ2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBhY3RpdmUgbm90ZXNcbiAgICAgIGlmICh0aGlzLnR5cGUuaW5kZXhPZignbm90ZXMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSkge1xuXG4gICAgICAgIC8vIGdldCBhbGwgbm90ZXMgYmV0d2VlbiB0aGUgbm90ZUluZGV4IGFuZCB0aGUgY3VycmVudCBwbGF5aGVhZCBwb3NpdGlvblxuICAgICAgICBmb3IgKGkgPSB0aGlzLm5vdGVJbmRleDsgaSA8IHRoaXMubnVtTm90ZXM7IGkrKykge1xuICAgICAgICAgIG5vdGUgPSB0aGlzLm5vdGVzW2ldO1xuICAgICAgICAgIHZhbHVlID0gbm90ZS5ub3RlT25bdGhpcy51bml0XTtcbiAgICAgICAgICBpZiAodmFsdWUgPD0gdGhpcy5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMubm90ZUluZGV4Kys7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiB0aGUgcGxheWhlYWQgaXMgc2V0IHRvIGEgcG9zaXRpb24gb2Ygc2F5IDMwMDAgbWlsbGlzLCB3ZSBkb24ndCB3YW50IHRvIGFkZCBub3RlcyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50VmFsdWUgPT09IDAgfHwgbm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgICBjb2xsZWN0ZWROb3Rlcy5hZGQobm90ZSk7XG4gICAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ25vdGVPbicsXG4gICAgICAgICAgICAgICAgZGF0YTogbm90ZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmlsdGVyIG5vdGVzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgICAgZm9yIChpID0gdGhpcy5hY3RpdmVOb3Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIG5vdGUgPSB0aGlzLmFjdGl2ZU5vdGVzW2ldO1xuICAgICAgICAgIC8vaWYobm90ZS5ub3RlT24uc3RhdGUuaW5kZXhPZigncmVtb3ZlZCcpID09PSAwIHx8IHRoaXMuc29uZy5fbm90ZXNCeUlkLmdldChub3RlLmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIGlmICh0aGlzLnNvbmcuX25vdGVzQnlJZC5nZXQobm90ZS5pZCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdza2lwcGluZyByZW1vdmVkIG5vdGUnLCBub3RlLmlkKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0eXBlb2Ygbm90ZS5ub3RlT2ZmID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdub3RlIHdpdGggaWQnLCBub3RlLmlkLCAnaGFzIG5vIG5vdGVPZmYgZXZlbnQnKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vaWYobm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSAmJiBjb2xsZWN0ZWROb3Rlcy5oYXMobm90ZSkgPT09IGZhbHNlKXtcbiAgICAgICAgICBpZiAobm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgc3RpbGxBY3RpdmVOb3Rlcy5wdXNoKG5vdGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgICAgICB0eXBlOiAnbm90ZU9mZicsXG4gICAgICAgICAgICAgIGRhdGE6IG5vdGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCB0aGUgc3RpbGwgYWN0aXZlIG5vdGVzIGFuZCB0aGUgbmV3bHkgYWN0aXZlIGV2ZW50cyB0byB0aGUgYWN0aXZlIG5vdGVzIGFycmF5XG4gICAgICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KGNvbGxlY3RlZE5vdGVzLnZhbHVlcygpKSwgc3RpbGxBY3RpdmVOb3Rlcyk7XG4gICAgICAgIHRoaXMuZGF0YS5hY3RpdmVOb3RlcyA9IHRoaXMuYWN0aXZlTm90ZXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBhY3RpdmUgcGFydHNcbiAgICAgIGlmICh0aGlzLnR5cGUuaW5kZXhPZigncGFydHMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSkge1xuXG4gICAgICAgIGZvciAoaSA9IHRoaXMucGFydEluZGV4OyBpIDwgdGhpcy5udW1QYXJ0czsgaSsrKSB7XG4gICAgICAgICAgcGFydCA9IHRoaXMucGFydHNbaV07XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJ0LCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICBpZiAocGFydC5fc3RhcnRbdGhpcy51bml0XSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgY29sbGVjdGVkUGFydHMuYWRkKHBhcnQpO1xuICAgICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICAgICAgdHlwZTogJ3BhcnRPbicsXG4gICAgICAgICAgICAgIGRhdGE6IHBhcnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5wYXJ0SW5kZXgrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmlsdGVyIHBhcnRzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgICAgZm9yIChpID0gdGhpcy5hY3RpdmVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHBhcnQgPSB0aGlzLmFjdGl2ZVBhcnRzW2ldO1xuICAgICAgICAgIC8vaWYocGFydC5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9wYXJ0c0J5SWQuZ2V0KHBhcnQuaWQpID09PSBmYWxzZSl7XG4gICAgICAgICAgaWYgKHRoaXMuc29uZy5fcGFydHNCeUlkLmdldChwYXJ0LmlkKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgcGFydCcsIHBhcnQuaWQpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9pZihwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlICYmIGNvbGxlY3RlZFBhcnRzLmhhcyhwYXJ0KSA9PT0gZmFsc2Upe1xuICAgICAgICAgIGlmIChwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICBzdGlsbEFjdGl2ZVBhcnRzLnB1c2gobm90ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdwYXJ0T2ZmJyxcbiAgICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3RpdmVQYXJ0cyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoY29sbGVjdGVkUGFydHMudmFsdWVzKCkpLCBzdGlsbEFjdGl2ZVBhcnRzKTtcbiAgICAgICAgdGhpcy5kYXRhLmFjdGl2ZVBhcnRzID0gdGhpcy5hY3RpdmVQYXJ0cztcbiAgICAgIH1cblxuICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAgc2V0VHlwZSh0KXtcbiAgICAgICAgdGhpcy50eXBlID0gdDtcbiAgICAgICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gICAgICB9XG4gICAgXG4gICAgXG4gICAgICBhZGRUeXBlKHQpe1xuICAgICAgICB0aGlzLnR5cGUgKz0gJyAnICsgdDtcbiAgICAgICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gICAgICB9XG4gICAgXG4gICAgICByZW1vdmVUeXBlKHQpe1xuICAgICAgICB2YXIgYXJyID0gdGhpcy50eXBlLnNwbGl0KCcgJyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICcnO1xuICAgICAgICBhcnIuZm9yRWFjaChmdW5jdGlvbih0eXBlKXtcbiAgICAgICAgICBpZih0eXBlICE9PSB0KXtcbiAgICAgICAgICAgIHRoaXMudHlwZSArPSB0ICsgJyAnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHlwZS50cmltKCk7XG4gICAgICAgIHRoaXMuc2V0KHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgICAgIH1cbiAgICAqL1xuXG4gIH1dKTtcblxuICByZXR1cm4gUGxheWhlYWQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbmV4cG9ydHMubWlsbGlzVG9UaWNrcyA9IG1pbGxpc1RvVGlja3M7XG5leHBvcnRzLnRpY2tzVG9NaWxsaXMgPSB0aWNrc1RvTWlsbGlzO1xuZXhwb3J0cy5iYXJzVG9NaWxsaXMgPSBiYXJzVG9NaWxsaXM7XG5leHBvcnRzLmJhcnNUb1RpY2tzID0gYmFyc1RvVGlja3M7XG5leHBvcnRzLnRpY2tzVG9CYXJzID0gdGlja3NUb0JhcnM7XG5leHBvcnRzLm1pbGxpc1RvQmFycyA9IG1pbGxpc1RvQmFycztcbmV4cG9ydHMuZ2V0UG9zaXRpb24yID0gZ2V0UG9zaXRpb24yO1xuZXhwb3J0cy5jYWxjdWxhdGVQb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIHN1cHBvcnRlZFR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlJyxcbiAgICBzdXBwb3J0ZWRSZXR1cm5UeXBlcyA9ICdiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIGFsbCcsXG4gICAgZmxvb3IgPSBNYXRoLmZsb29yLFxuICAgIHJvdW5kID0gTWF0aC5yb3VuZDtcblxudmFyXG4vL2xvY2FsXG5icG0gPSB2b2lkIDAsXG4gICAgbm9taW5hdG9yID0gdm9pZCAwLFxuICAgIGRlbm9taW5hdG9yID0gdm9pZCAwLFxuICAgIHRpY2tzUGVyQmVhdCA9IHZvaWQgMCxcbiAgICB0aWNrc1BlckJhciA9IHZvaWQgMCxcbiAgICB0aWNrc1BlclNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICBtaWxsaXNQZXJUaWNrID0gdm9pZCAwLFxuICAgIHNlY29uZHNQZXJUaWNrID0gdm9pZCAwLFxuICAgIG51bVNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICB0aWNrcyA9IHZvaWQgMCxcbiAgICBtaWxsaXMgPSB2b2lkIDAsXG4gICAgZGlmZlRpY2tzID0gdm9pZCAwLFxuICAgIGRpZmZNaWxsaXMgPSB2b2lkIDAsXG4gICAgYmFyID0gdm9pZCAwLFxuICAgIGJlYXQgPSB2b2lkIDAsXG4gICAgc2l4dGVlbnRoID0gdm9pZCAwLFxuICAgIHRpY2sgPSB2b2lkIDAsXG5cblxuLy8gIHR5cGUsXG5pbmRleCA9IHZvaWQgMCxcbiAgICByZXR1cm5UeXBlID0gJ2FsbCcsXG4gICAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcblxuZnVuY3Rpb24gZ2V0VGltZUV2ZW50KHNvbmcsIHVuaXQsIHRhcmdldCkge1xuICAvLyBmaW5kcyB0aGUgdGltZSBldmVudCB0aGF0IGNvbWVzIHRoZSBjbG9zZXN0IGJlZm9yZSB0aGUgdGFyZ2V0IHBvc2l0aW9uXG4gIHZhciB0aW1lRXZlbnRzID0gc29uZy5fdGltZUV2ZW50cztcblxuICBmb3IgKHZhciBpID0gdGltZUV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBldmVudCA9IHRpbWVFdmVudHNbaV07XG4gICAgLy9jb25zb2xlLmxvZyh1bml0LCB0YXJnZXQsIGV2ZW50KVxuICAgIGlmIChldmVudFt1bml0XSA8PSB0YXJnZXQpIHtcbiAgICAgIGluZGV4ID0gaTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIG1pbGxpc1RvVGlja3Moc29uZywgdGFyZ2V0TWlsbGlzKSB7XG4gIHZhciBiZW9zID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGFyZ3VtZW50c1syXTtcblxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zO1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldE1pbGxpcyk7XG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzO1xufVxuXG5mdW5jdGlvbiB0aWNrc1RvTWlsbGlzKHNvbmcsIHRhcmdldFRpY2tzKSB7XG4gIHZhciBiZW9zID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGFyZ3VtZW50c1syXTtcblxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zO1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0VGlja3MpO1xuICByZXR1cm4gbWlsbGlzO1xufVxuXG5mdW5jdGlvbiBiYXJzVG9NaWxsaXMoc29uZywgcG9zaXRpb24sIGJlb3MpIHtcbiAgLy8gYmVvcyA9IGJleW9uZEVuZE9mU29uZ1xuICBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0JyxcbiAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgcmVzdWx0OiAnbWlsbGlzJyxcbiAgICBiZW9zOiBiZW9zXG4gIH0pO1xuICByZXR1cm4gbWlsbGlzO1xufVxuXG5mdW5jdGlvbiBiYXJzVG9UaWNrcyhzb25nLCBwb3NpdGlvbiwgYmVvcykge1xuICAvLyBiZW9zID0gYmV5b25kRW5kT2ZTb25nXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgcmVzdWx0OiAndGlja3MnLFxuICAgIGJlb3M6IGJlb3NcbiAgfSk7XG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzO1xufVxuXG5mdW5jdGlvbiB0aWNrc1RvQmFycyhzb25nLCB0YXJnZXQpIHtcbiAgdmFyIGJlb3MgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyB0cnVlIDogYXJndW1lbnRzWzJdO1xuXG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3M7XG4gIGZyb21UaWNrcyhzb25nLCB0YXJnZXQpO1xuICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgcmV0dXJuVHlwZSA9ICdiYXJzYW5kYmVhdHMnO1xuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKCk7XG59XG5cbmZ1bmN0aW9uIG1pbGxpc1RvQmFycyhzb25nLCB0YXJnZXQpIHtcbiAgdmFyIGJlb3MgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyB0cnVlIDogYXJndW1lbnRzWzJdO1xuXG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3M7XG4gIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0KTtcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJztcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpO1xufVxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciBtaWxsaXMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0TWlsbGlzLCBldmVudCkge1xuICB2YXIgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmIChiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKSB7XG4gICAgaWYgKHRhcmdldE1pbGxpcyA+IGxhc3RFdmVudC5taWxsaXMpIHtcbiAgICAgIHRhcmdldE1pbGxpcyA9IGxhc3RFdmVudC5taWxsaXM7XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnbWlsbGlzJywgdGFyZ2V0TWlsbGlzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IG1pbGxpcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmIChldmVudC5taWxsaXMgPT09IHRhcmdldE1pbGxpcykge1xuICAgIGRpZmZNaWxsaXMgPSAwO1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gIH0gZWxzZSB7XG4gICAgZGlmZk1pbGxpcyA9IHRhcmdldE1pbGxpcyAtIGV2ZW50Lm1pbGxpcztcbiAgICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgcmV0dXJuIHRpY2tzO1xufVxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciB0aWNrcyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbVRpY2tzKHNvbmcsIHRhcmdldFRpY2tzLCBldmVudCkge1xuICB2YXIgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmIChiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKSB7XG4gICAgaWYgKHRhcmdldFRpY2tzID4gbGFzdEV2ZW50LnRpY2tzKSB7XG4gICAgICB0YXJnZXRUaWNrcyA9IGxhc3RFdmVudC50aWNrcztcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICd0aWNrcycsIHRhcmdldFRpY2tzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IHRpY2tzLCBjYWxjdWxhdGUgdGhlIGRpZmZcbiAgaWYgKGV2ZW50LnRpY2tzID09PSB0YXJnZXRUaWNrcykge1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gICAgZGlmZk1pbGxpcyA9IDA7XG4gIH0gZWxzZSB7XG4gICAgZGlmZlRpY2tzID0gdGFyZ2V0VGlja3MgLSB0aWNrcztcbiAgICBkaWZmTWlsbGlzID0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIHRpY2tzICs9IGRpZmZUaWNrcztcbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG5cbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgYmFycyBhbmQgYmVhdHMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21CYXJzKHNvbmcsIHRhcmdldEJhciwgdGFyZ2V0QmVhdCwgdGFyZ2V0U2l4dGVlbnRoLCB0YXJnZXRUaWNrKSB7XG4gIHZhciBldmVudCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNSB8fCBhcmd1bWVudHNbNV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbNV07XG5cbiAgLy9jb25zb2xlLnRpbWUoJ2Zyb21CYXJzJyk7XG4gIHZhciBpID0gMCxcbiAgICAgIGRpZmZCYXJzID0gdm9pZCAwLFxuICAgICAgZGlmZkJlYXRzID0gdm9pZCAwLFxuICAgICAgZGlmZlNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICAgIGRpZmZUaWNrID0gdm9pZCAwLFxuICAgICAgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmIChiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKSB7XG4gICAgaWYgKHRhcmdldEJhciA+IGxhc3RFdmVudC5iYXIpIHtcbiAgICAgIHRhcmdldEJhciA9IGxhc3RFdmVudC5iYXI7XG4gICAgfVxuICB9XG5cbiAgaWYgKGV2ZW50ID09PSBudWxsKSB7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ2JhcicsIHRhcmdldEJhcik7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy9jb3JyZWN0IHdyb25nIHBvc2l0aW9uIGRhdGEsIGZvciBpbnN0YW5jZTogJzMsMywyLDc4OCcgYmVjb21lcyAnMyw0LDQsMDY4JyBpbiBhIDQvNCBtZWFzdXJlIGF0IFBQUSA0ODBcbiAgd2hpbGUgKHRhcmdldFRpY2sgPj0gdGlja3NQZXJTaXh0ZWVudGgpIHtcbiAgICB0YXJnZXRTaXh0ZWVudGgrKztcbiAgICB0YXJnZXRUaWNrIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICB9XG5cbiAgd2hpbGUgKHRhcmdldFNpeHRlZW50aCA+IG51bVNpeHRlZW50aCkge1xuICAgIHRhcmdldEJlYXQrKztcbiAgICB0YXJnZXRTaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICB9XG5cbiAgd2hpbGUgKHRhcmdldEJlYXQgPiBub21pbmF0b3IpIHtcbiAgICB0YXJnZXRCYXIrKztcbiAgICB0YXJnZXRCZWF0IC09IG5vbWluYXRvcjtcbiAgfVxuXG4gIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdiYXInLCB0YXJnZXRCYXIsIGluZGV4KTtcbiAgZm9yIChpID0gaW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgZXZlbnQgPSBzb25nLl90aW1lRXZlbnRzW2ldO1xuICAgIGlmIChldmVudC5iYXIgPD0gdGFyZ2V0QmFyKSB7XG4gICAgICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIGdldCB0aGUgZGlmZmVyZW5jZXNcbiAgZGlmZlRpY2sgPSB0YXJnZXRUaWNrIC0gdGljaztcbiAgZGlmZlNpeHRlZW50aCA9IHRhcmdldFNpeHRlZW50aCAtIHNpeHRlZW50aDtcbiAgZGlmZkJlYXRzID0gdGFyZ2V0QmVhdCAtIGJlYXQ7XG4gIGRpZmZCYXJzID0gdGFyZ2V0QmFyIC0gYmFyOyAvL2JhciBpcyBhbHdheXMgbGVzcyB0aGVuIG9yIGVxdWFsIHRvIHRhcmdldEJhciwgc28gZGlmZkJhcnMgaXMgYWx3YXlzID49IDBcblxuICAvL2NvbnNvbGUubG9nKCdkaWZmJyxkaWZmQmFycyxkaWZmQmVhdHMsZGlmZlNpeHRlZW50aCxkaWZmVGljayk7XG4gIC8vY29uc29sZS5sb2coJ21pbGxpcycsbWlsbGlzLHRpY2tzUGVyQmFyLHRpY2tzUGVyQmVhdCx0aWNrc1BlclNpeHRlZW50aCxtaWxsaXNQZXJUaWNrKTtcblxuICAvLyBjb252ZXJ0IGRpZmZlcmVuY2VzIHRvIG1pbGxpc2Vjb25kcyBhbmQgdGlja3NcbiAgZGlmZk1pbGxpcyA9IGRpZmZCYXJzICogdGlja3NQZXJCYXIgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IGRpZmZCZWF0cyAqIHRpY2tzUGVyQmVhdCAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gZGlmZlNpeHRlZW50aCAqIHRpY2tzUGVyU2l4dGVlbnRoICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSBkaWZmVGljayAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZUaWNrcyA9IGRpZmZNaWxsaXMgLyBtaWxsaXNQZXJUaWNrO1xuICAvL2NvbnNvbGUubG9nKGRpZmZCYXJzLCB0aWNrc1BlckJhciwgbWlsbGlzUGVyVGljaywgZGlmZk1pbGxpcywgZGlmZlRpY2tzKTtcblxuICAvLyBzZXQgYWxsIGN1cnJlbnQgcG9zaXRpb24gZGF0YVxuICBiYXIgPSB0YXJnZXRCYXI7XG4gIGJlYXQgPSB0YXJnZXRCZWF0O1xuICBzaXh0ZWVudGggPSB0YXJnZXRTaXh0ZWVudGg7XG4gIHRpY2sgPSB0YXJnZXRUaWNrO1xuICAvL2NvbnNvbGUubG9nKHRpY2ssIHRhcmdldFRpY2spXG5cbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG4gIC8vY29uc29sZS5sb2codGFyZ2V0QmFyLCB0YXJnZXRCZWF0LCB0YXJnZXRTaXh0ZWVudGgsIHRhcmdldFRpY2ssICcgLT4gJywgbWlsbGlzKTtcbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuXG4gIC8vY29uc29sZS50aW1lRW5kKCdmcm9tQmFycycpO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKSB7XG4gIC8vIHNwcmVhZCB0aGUgZGlmZmVyZW5jZSBpbiB0aWNrIG92ZXIgYmFycywgYmVhdHMgYW5kIHNpeHRlZW50aFxuICB2YXIgdG1wID0gcm91bmQoZGlmZlRpY2tzKTtcbiAgd2hpbGUgKHRtcCA+PSB0aWNrc1BlclNpeHRlZW50aCkge1xuICAgIHNpeHRlZW50aCsrO1xuICAgIHRtcCAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICB3aGlsZSAoc2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKSB7XG4gICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgYmVhdCsrO1xuICAgICAgd2hpbGUgKGJlYXQgPiBub21pbmF0b3IpIHtcbiAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgIGJhcisrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB0aWNrID0gcm91bmQodG1wKTtcbn1cblxuLy8gc3RvcmUgcHJvcGVydGllcyBvZiBldmVudCBpbiBsb2NhbCBzY29wZVxuZnVuY3Rpb24gZ2V0RGF0YUZyb21FdmVudChldmVudCkge1xuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcbiAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBiYXIgPSBldmVudC5iYXI7XG4gIGJlYXQgPSBldmVudC5iZWF0O1xuICBzaXh0ZWVudGggPSBldmVudC5zaXh0ZWVudGg7XG4gIHRpY2sgPSBldmVudC50aWNrO1xuXG4gIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAvL2NvbnNvbGUubG9nKGJwbSwgZXZlbnQudHlwZSk7XG4gIC8vY29uc29sZS5sb2coJ3RpY2tzJywgdGlja3MsICdtaWxsaXMnLCBtaWxsaXMsICdiYXInLCBiYXIpO1xufVxuXG5mdW5jdGlvbiBnZXRQb3NpdGlvbkRhdGEoc29uZykge1xuICB2YXIgdGltZURhdGEgPSB2b2lkIDAsXG4gICAgICBwb3NpdGlvbkRhdGEgPSB7fTtcblxuICBzd2l0Y2ggKHJldHVyblR5cGUpIHtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5taWxsaXMgPSBtaWxsaXM7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzID0gcm91bmQobWlsbGlzICogMTAwMCkgLyAxMDAwO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1JvdW5kZWQgPSByb3VuZChtaWxsaXMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrcyA9IHRpY2tzO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzID0gcm91bmQodGlja3MpO1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3NVbnJvdW5kZWQgPSB0aWNrcztcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgcG9zaXRpb25EYXRhLmJhciA9IGJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5iZWF0ID0gYmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEudGljayA9IHRpY2s7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGlja0FzU3RyaW5nO1xuICAgICAgcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyBnZXRUaWNrQXNTdHJpbmcodGljayk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgdGltZURhdGEgPSAoMCwgX3V0aWwuZ2V0TmljZVRpbWUpKG1pbGxpcyk7XG4gICAgICBwb3NpdGlvbkRhdGEuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gICAgICBwb3NpdGlvbkRhdGEubWludXRlID0gdGltZURhdGEubWludXRlO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIC8vIG1pbGxpc1xuICAgICAgLy9wb3NpdGlvbkRhdGEubWlsbGlzID0gbWlsbGlzO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpcyA9IHJvdW5kKG1pbGxpcyAqIDEwMDApIC8gMTAwMDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNSb3VuZGVkID0gcm91bmQobWlsbGlzKTtcblxuICAgICAgLy8gdGlja3NcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzID0gdGlja3M7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3MgPSByb3VuZCh0aWNrcyk7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrc1Vucm91bmRlZCA9IHRpY2tzO1xuXG4gICAgICAvLyBiYXJzYmVhdHNcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXIgPSBiYXI7XG4gICAgICBwb3NpdGlvbkRhdGEuYmVhdCA9IGJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2sgPSB0aWNrO1xuICAgICAgLy9wb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2tBc1N0cmluZztcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgZ2V0VGlja0FzU3RyaW5nKHRpY2spO1xuXG4gICAgICAvLyB0aW1lXG4gICAgICB0aW1lRGF0YSA9ICgwLCBfdXRpbC5nZXROaWNlVGltZSkobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuXG4gICAgICAvLyBleHRyYSBkYXRhXG4gICAgICBwb3NpdGlvbkRhdGEuYnBtID0gcm91bmQoYnBtICogc29uZy5wbGF5YmFja1NwZWVkLCAzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gICAgICBwb3NpdGlvbkRhdGEuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyQmFyID0gdGlja3NQZXJCYXI7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgICAgIHBvc2l0aW9uRGF0YS5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUGVyVGljayA9IG1pbGxpc1BlclRpY2s7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljaztcblxuICAgICAgLy8gdXNlIHRpY2tzIHRvIG1ha2UgdGVtcG8gY2hhbmdlcyB2aXNpYmxlIGJ5IGEgZmFzdGVyIG1vdmluZyBwbGF5aGVhZFxuICAgICAgcG9zaXRpb25EYXRhLnBlcmNlbnRhZ2UgPSB0aWNrcyAvIHNvbmcuX2R1cmF0aW9uVGlja3M7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5wZXJjZW50YWdlID0gbWlsbGlzIC8gc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbkRhdGE7XG59XG5cbmZ1bmN0aW9uIGdldFRpY2tBc1N0cmluZyh0KSB7XG4gIGlmICh0ID09PSAwKSB7XG4gICAgdCA9ICcwMDAnO1xuICB9IGVsc2UgaWYgKHQgPCAxMCkge1xuICAgIHQgPSAnMDAnICsgdDtcbiAgfSBlbHNlIGlmICh0IDwgMTAwKSB7XG4gICAgdCA9ICcwJyArIHQ7XG4gIH1cbiAgcmV0dXJuIHQ7XG59XG5cbi8vIHVzZWQgYnkgcGxheWhlYWRcbmZ1bmN0aW9uIGdldFBvc2l0aW9uMihzb25nLCB1bml0LCB0YXJnZXQsIHR5cGUsIGV2ZW50KSB7XG4gIGlmICh1bml0ID09PSAnbWlsbGlzJykge1xuICAgIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0LCBldmVudCk7XG4gIH0gZWxzZSBpZiAodW5pdCA9PT0gJ3RpY2tzJykge1xuICAgIGZyb21UaWNrcyhzb25nLCB0YXJnZXQsIGV2ZW50KTtcbiAgfVxuICByZXR1cm5UeXBlID0gdHlwZTtcbiAgaWYgKHJldHVyblR5cGUgPT09ICdhbGwnKSB7XG4gICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gIH1cbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcbn1cblxuLy8gaW1wcm92ZWQgdmVyc2lvbiBvZiBnZXRQb3NpdGlvblxuZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb24oc29uZywgc2V0dGluZ3MpIHtcbiAgdmFyIHR5cGUgPSBzZXR0aW5ncy50eXBlO1xuICB2YXIgLy8gYW55IG9mIGJhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlXG4gIHRhcmdldCA9IHNldHRpbmdzLnRhcmdldDtcbiAgdmFyIF9zZXR0aW5ncyRyZXN1bHQgPSBzZXR0aW5ncy5yZXN1bHQ7XG4gIHZhciByZXN1bHQgPSBfc2V0dGluZ3MkcmVzdWx0ID09PSB1bmRlZmluZWQgPyAnYWxsJyA6IF9zZXR0aW5ncyRyZXN1bHQ7XG4gIHZhciBfc2V0dGluZ3MkYmVvcyA9IHNldHRpbmdzLmJlb3M7XG4gIHZhciBiZW9zID0gX3NldHRpbmdzJGJlb3MgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBfc2V0dGluZ3MkYmVvcztcbiAgdmFyIF9zZXR0aW5ncyRzbmFwID0gc2V0dGluZ3Muc25hcDtcbiAgdmFyIHNuYXAgPSBfc2V0dGluZ3Mkc25hcCA9PT0gdW5kZWZpbmVkID8gLTEgOiBfc2V0dGluZ3Mkc25hcDtcblxuXG4gIGlmIChzdXBwb3J0ZWRSZXR1cm5UeXBlcy5pbmRleE9mKHJlc3VsdCkgPT09IC0xKSB7XG4gICAgY29uc29sZS53YXJuKCd1bnN1cHBvcnRlZCByZXR1cm4gdHlwZSwgXFwnYWxsXFwnIHVzZWQgaW5zdGVhZCBvZiBcXCcnICsgcmVzdWx0ICsgJ1xcJycpO1xuICAgIHJlc3VsdCA9ICdhbGwnO1xuICB9XG5cbiAgcmV0dXJuVHlwZSA9IHJlc3VsdDtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvcztcblxuICBpZiAoc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSA9PT0gLTEpIHtcbiAgICBjb25zb2xlLmVycm9yKCd1bnN1cHBvcnRlZCB0eXBlICcgKyB0eXBlKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzd2l0Y2ggKHR5cGUpIHtcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIHZhciBfdGFyZ2V0ID0gX3NsaWNlZFRvQXJyYXkodGFyZ2V0LCA0KTtcblxuICAgICAgdmFyIF90YXJnZXQkID0gX3RhcmdldFswXTtcbiAgICAgIHZhciB0YXJnZXRiYXIgPSBfdGFyZ2V0JCA9PT0gdW5kZWZpbmVkID8gMSA6IF90YXJnZXQkO1xuICAgICAgdmFyIF90YXJnZXQkMiA9IF90YXJnZXRbMV07XG4gICAgICB2YXIgdGFyZ2V0YmVhdCA9IF90YXJnZXQkMiA9PT0gdW5kZWZpbmVkID8gMSA6IF90YXJnZXQkMjtcbiAgICAgIHZhciBfdGFyZ2V0JDMgPSBfdGFyZ2V0WzJdO1xuICAgICAgdmFyIHRhcmdldHNpeHRlZW50aCA9IF90YXJnZXQkMyA9PT0gdW5kZWZpbmVkID8gMSA6IF90YXJnZXQkMztcbiAgICAgIHZhciBfdGFyZ2V0JDQgPSBfdGFyZ2V0WzNdO1xuICAgICAgdmFyIHRhcmdldHRpY2sgPSBfdGFyZ2V0JDQgPT09IHVuZGVmaW5lZCA/IDAgOiBfdGFyZ2V0JDQ7XG4gICAgICAvL2NvbnNvbGUubG9nKHRhcmdldGJhciwgdGFyZ2V0YmVhdCwgdGFyZ2V0c2l4dGVlbnRoLCB0YXJnZXR0aWNrKVxuXG4gICAgICBmcm9tQmFycyhzb25nLCB0YXJnZXRiYXIsIHRhcmdldGJlYXQsIHRhcmdldHNpeHRlZW50aCwgdGFyZ2V0dGljayk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICAvLyBjYWxjdWxhdGUgbWlsbGlzIG91dCBvZiB0aW1lIGFycmF5OiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG5cbiAgICAgIHZhciBfdGFyZ2V0MiA9IF9zbGljZWRUb0FycmF5KHRhcmdldCwgNCk7XG5cbiAgICAgIHZhciBfdGFyZ2V0MiQgPSBfdGFyZ2V0MlswXTtcbiAgICAgIHZhciB0YXJnZXRob3VyID0gX3RhcmdldDIkID09PSB1bmRlZmluZWQgPyAwIDogX3RhcmdldDIkO1xuICAgICAgdmFyIF90YXJnZXQyJDIgPSBfdGFyZ2V0MlsxXTtcbiAgICAgIHZhciB0YXJnZXRtaW51dGUgPSBfdGFyZ2V0MiQyID09PSB1bmRlZmluZWQgPyAwIDogX3RhcmdldDIkMjtcbiAgICAgIHZhciBfdGFyZ2V0MiQzID0gX3RhcmdldDJbMl07XG4gICAgICB2YXIgdGFyZ2V0c2Vjb25kID0gX3RhcmdldDIkMyA9PT0gdW5kZWZpbmVkID8gMCA6IF90YXJnZXQyJDM7XG4gICAgICB2YXIgX3RhcmdldDIkNCA9IF90YXJnZXQyWzNdO1xuICAgICAgdmFyIHRhcmdldG1pbGxpc2Vjb25kID0gX3RhcmdldDIkNCA9PT0gdW5kZWZpbmVkID8gMCA6IF90YXJnZXQyJDQ7XG5cbiAgICAgIHZhciBtaWxsaXMgPSAwO1xuICAgICAgbWlsbGlzICs9IHRhcmdldGhvdXIgKiA2MCAqIDYwICogMTAwMDsgLy9ob3Vyc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbnV0ZSAqIDYwICogMTAwMDsgLy9taW51dGVzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0c2Vjb25kICogMTAwMDsgLy9zZWNvbmRzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0bWlsbGlzZWNvbmQ7IC8vbWlsbGlzZWNvbmRzXG5cbiAgICAgIGZyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldCk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHRhcmdldCAqIHNvbmcuX2R1cmF0aW9uVGlja3M7IC8vIHRhcmdldCBtdXN0IGJlIGluIHRpY2tzIVxuICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcywgc29uZy5fZHVyYXRpb25UaWNrcylcbiAgICAgIGlmIChzbmFwICE9PSAtMSkge1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzIC8gc25hcCkgKiBzbmFwO1xuICAgICAgICAvL2Zyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGlja3MpO1xuICAgICAgfVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgdmFyIHRtcCA9IGdldFBvc2l0aW9uRGF0YShzb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXA7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qXG5cbi8vQHBhcmFtOiAnbWlsbGlzJywgMTAwMCwgW3RydWVdXG4vL0BwYXJhbTogJ3RpY2tzJywgMTAwMCwgW3RydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDEsIFsnYWxsJywgdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgNjAsIDQsIDMsIDEyMCwgWydhbGwnLCB0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCA2MCwgNCwgMywgMTIwLCBbdHJ1ZSwgJ2FsbCddXG5cbmZ1bmN0aW9uIGNoZWNrUG9zaXRpb24odHlwZSwgYXJncywgcmV0dXJuVHlwZSA9ICdhbGwnKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcbiAgY29uc29sZS5sb2coJy0tLS0+IGNoZWNrUG9zaXRpb246JywgYXJncywgdHlwZVN0cmluZyhhcmdzKSk7XG5cbiAgaWYodHlwZVN0cmluZyhhcmdzKSA9PT0gJ2FycmF5Jyl7XG4gICAgbGV0XG4gICAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIGksIGEsIHBvc2l0aW9uTGVuZ3RoO1xuXG4gICAgdHlwZSA9IGFyZ3NbMF07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBbWydtaWxsaXMnLCAzMDAwXV1cbiAgICBpZih0eXBlU3RyaW5nKGFyZ3NbMF0pID09PSAnYXJyYXknKXtcbiAgICAgIC8vY29uc29sZS53YXJuKCd0aGlzIHNob3VsZG5cXCd0IGhhcHBlbiEnKTtcbiAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgdHlwZSA9IGFyZ3NbMF07XG4gICAgICBudW1BcmdzID0gYXJncy5sZW5ndGg7XG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBbdHlwZV07XG5cbiAgICBjb25zb2xlLmxvZygnY2hlY2sgcG9zaXRpb24nLCBhcmdzLCBudW1BcmdzLCBzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpKTtcblxuICAgIC8vY29uc29sZS5sb2coJ2FyZycsIDAsICctPicsIHR5cGUpO1xuXG4gICAgaWYoc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSAhPT0gLTEpe1xuICAgICAgZm9yKGkgPSAxOyBpIDwgbnVtQXJnczsgaSsrKXtcbiAgICAgICAgYSA9IGFyZ3NbaV07XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2FyZycsIGksICctPicsIGEpO1xuICAgICAgICBpZihhID09PSB0cnVlIHx8IGEgPT09IGZhbHNlKXtcbiAgICAgICAgICBiZXlvbmRFbmRPZlNvbmcgPSBhO1xuICAgICAgICB9ZWxzZSBpZihpc05hTihhKSl7XG4gICAgICAgICAgaWYoc3VwcG9ydGVkUmV0dXJuVHlwZXMuaW5kZXhPZihhKSAhPT0gLTEpe1xuICAgICAgICAgICAgcmV0dXJuVHlwZSA9IGE7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgcG9zaXRpb24ucHVzaChhKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jaGVjayBudW1iZXIgb2YgYXJndW1lbnRzIC0+IGVpdGhlciAxIG51bWJlciBvciA0IG51bWJlcnMgaW4gcG9zaXRpb24sIGUuZy4gWydiYXJzYmVhdHMnLCAxXSBvciBbJ2JhcnNiZWF0cycsIDEsIDEsIDEsIDBdLFxuICAgICAgLy8gb3IgWydwZXJjJywgMC41NiwgbnVtYmVyT2ZUaWNrc1RvU25hcFRvXVxuICAgICAgcG9zaXRpb25MZW5ndGggPSBwb3NpdGlvbi5sZW5ndGg7XG4gICAgICBpZihwb3NpdGlvbkxlbmd0aCAhPT0gMiAmJiBwb3NpdGlvbkxlbmd0aCAhPT0gMyAmJiBwb3NpdGlvbkxlbmd0aCAhPT0gNSl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2cocG9zaXRpb24sIHJldHVyblR5cGUsIGJleW9uZEVuZE9mU29uZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvc2l0aW9uKHNvbmcsIHR5cGUsIGFyZ3Mpe1xuICAvL2NvbnNvbGUubG9nKCdnZXRQb3NpdGlvbicsIGFyZ3MpO1xuXG4gIGlmKHR5cGVvZiBhcmdzID09PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1pbGxpczogMFxuICAgIH1cbiAgfVxuXG4gIGxldCBwb3NpdGlvbiA9IGNoZWNrUG9zaXRpb24odHlwZSwgYXJncyksXG4gICAgbWlsbGlzLCB0bXAsIHNuYXA7XG5cblxuICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgIGVycm9yKCd3cm9uZyBwb3NpdGlvbiBkYXRhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3dpdGNoKHR5cGUpe1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgZnJvbUJhcnMoc29uZywgcG9zaXRpb25bMV0sIHBvc2l0aW9uWzJdLCBwb3NpdGlvblszXSwgcG9zaXRpb25bNF0pO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAgbWlsbGlzID0gMDtcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzFdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogNjAgKiA2MCAqIDEwMDA7IC8vaG91cnNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzJdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogNjAgKiAxMDAwOyAvL21pbnV0ZXNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzNdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogMTAwMDsgLy9zZWNvbmRzXG4gICAgICB0bXAgPSBwb3NpdGlvbls0XSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcDsgLy9taWxsaXNlY29uZHNcblxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGZyb21NaWxsaXMoc29uZywgcG9zaXRpb25bMV0pO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHBvc2l0aW9uWzFdKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgc25hcCA9IHBvc2l0aW9uWzJdO1xuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvblRpY2tzO1xuICAgICAgaWYoc25hcCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdGlja3MgPSBmbG9vcih0aWNrcy9zbmFwKSAqIHNuYXA7XG4gICAgICAgIC8vZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcyk7XG4gICAgICB9XG4gICAgICBmcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICB0bXAgPSBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdkaWZmJywgcG9zaXRpb25bMV0gLSB0bXAucGVyY2VudGFnZSk7XG4gICAgICByZXR1cm4gdG1wO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuKi8iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLkluc3RydW1lbnQgPSBleHBvcnRzLlBhcnQgPSBleHBvcnRzLlRyYWNrID0gZXhwb3J0cy5Tb25nID0gZXhwb3J0cy5NSURJTm90ZSA9IGV4cG9ydHMuTUlESUV2ZW50ID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0c0J5SWQgPSBleHBvcnRzLmdldE1JRElJbnB1dHNCeUlkID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0SWRzID0gZXhwb3J0cy5nZXRNSURJSW5wdXRJZHMgPSBleHBvcnRzLmdldE1JRElPdXRwdXRzID0gZXhwb3J0cy5nZXRNSURJSW5wdXRzID0gZXhwb3J0cy5nZXRNSURJQWNjZXNzID0gZXhwb3J0cy5zZXRNYXN0ZXJWb2x1bWUgPSBleHBvcnRzLmdldE1hc3RlclZvbHVtZSA9IGV4cG9ydHMuZ2V0QXVkaW9Db250ZXh0ID0gZXhwb3J0cy5wYXJzZU1JRElGaWxlID0gZXhwb3J0cy5wYXJzZVNhbXBsZXMgPSBleHBvcnRzLk1JRElFdmVudFR5cGVzID0gZXhwb3J0cy5zZXRCdWZmZXJUaW1lID0gZXhwb3J0cy5pbml0ID0gdW5kZWZpbmVkO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF9taWRpX25vdGUgPSByZXF1aXJlKCcuL21pZGlfbm90ZScpO1xuXG52YXIgX3BhcnQgPSByZXF1aXJlKCcuL3BhcnQnKTtcblxudmFyIF90cmFjayA9IHJlcXVpcmUoJy4vdHJhY2snKTtcblxudmFyIF9zb25nID0gcmVxdWlyZSgnLi9zb25nJyk7XG5cbnZhciBfaW5zdHJ1bWVudCA9IHJlcXVpcmUoJy4vaW5zdHJ1bWVudCcpO1xuXG52YXIgX21pZGlmaWxlID0gcmVxdWlyZSgnLi9taWRpZmlsZScpO1xuXG52YXIgX2luaXQgPSByZXF1aXJlKCcuL2luaXQnKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfaW5pdF9taWRpID0gcmVxdWlyZSgnLi9pbml0X21pZGknKTtcblxudmFyIF9wYXJzZV9hdWRpbyA9IHJlcXVpcmUoJy4vcGFyc2VfYXVkaW8nKTtcblxudmFyIF9jb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG52YXIgX3NldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpO1xuXG52YXIgZ2V0QXVkaW9Db250ZXh0ID0gZnVuY3Rpb24gZ2V0QXVkaW9Db250ZXh0KCkge1xuICByZXR1cm4gX2luaXRfYXVkaW8uY29udGV4dDtcbn07XG5cbnZhciBxYW1iaSA9IHtcbiAgdmVyc2lvbjogJzEuMC4wLWJldGExJyxcblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0OiBfaW5pdC5pbml0LFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICBzZXRCdWZmZXJUaW1lOiBfc2V0dGluZ3Muc2V0QnVmZmVyVGltZSxcblxuICAvLyBmcm9tIC4vY29uc3RhbnRzXG4gIE1JRElFdmVudFR5cGVzOiBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlczogX3BhcnNlX2F1ZGlvLnBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vbWlkaWZpbGVcbiAgcGFyc2VNSURJRmlsZTogX21pZGlmaWxlLnBhcnNlTUlESUZpbGUsXG5cbiAgLy8gZnJvbSAuL2luaXRfYXVkaW9cbiAgZ2V0QXVkaW9Db250ZXh0OiBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZTogX2luaXRfYXVkaW8uZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWU6IF9pbml0X2F1ZGlvLnNldE1hc3RlclZvbHVtZSxcblxuICAvLyAuL2luaXRfbWlkaVxuICBnZXRNSURJQWNjZXNzOiBfaW5pdF9taWRpLmdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHM6IF9pbml0X21pZGkuZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHM6IF9pbml0X21pZGkuZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkczogX2luaXRfbWlkaS5nZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHM6IF9pbml0X21pZGkuZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQ6IF9pbml0X21pZGkuZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZDogX2luaXRfbWlkaS5nZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgTUlESUV2ZW50OiBfbWlkaV9ldmVudC5NSURJRXZlbnQsXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBNSURJTm90ZTogX21pZGlfbm90ZS5NSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBTb25nOiBfc29uZy5Tb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBUcmFjazogX3RyYWNrLlRyYWNrLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIFBhcnQ6IF9wYXJ0LlBhcnQsXG5cbiAgLy8gZnJvbSAuL2luc3RydW1lbnRcbiAgSW5zdHJ1bWVudDogX2luc3RydW1lbnQuSW5zdHJ1bWVudCxcblxuICBsb2c6IGZ1bmN0aW9uIGxvZyhpZCkge1xuICAgIHN3aXRjaCAoaWQpIHtcbiAgICAgIGNhc2UgJ2Z1bmN0aW9ucyc6XG4gICAgICAgIGNvbnNvbGUubG9nKCdmdW5jdGlvbnM6XFxuICAgICAgICAgIGdldEF1ZGlvQ29udGV4dFxcbiAgICAgICAgICBnZXRNYXN0ZXJWb2x1bWVcXG4gICAgICAgICAgc2V0TWFzdGVyVm9sdW1lXFxuICAgICAgICAgIGdldE1JRElBY2Nlc3NcXG4gICAgICAgICAgZ2V0TUlESUlucHV0c1xcbiAgICAgICAgICBnZXRNSURJT3V0cHV0c1xcbiAgICAgICAgICBnZXRNSURJSW5wdXRJZHNcXG4gICAgICAgICAgZ2V0TUlESU91dHB1dElkc1xcbiAgICAgICAgICBnZXRNSURJSW5wdXRzQnlJZFxcbiAgICAgICAgICBnZXRNSURJT3V0cHV0c0J5SWRcXG4gICAgICAgICAgcGFyc2VNSURJRmlsZVxcbiAgICAgICAgICBzZXRCdWZmZXJUaW1lXFxuICAgICAgICAnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gcWFtYmk7XG5leHBvcnRzLlxuLy8gZnJvbSAuL2luaXRcbmluaXQgPSBfaW5pdC5pbml0O1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL3NldHRpbmdzXG5zZXRCdWZmZXJUaW1lID0gX3NldHRpbmdzLnNldEJ1ZmZlclRpbWU7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vY29uc3RhbnRzXG5NSURJRXZlbnRUeXBlcyA9IF9jb25zdGFudHMuTUlESUV2ZW50VHlwZXM7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vdXRpbFxucGFyc2VTYW1wbGVzID0gX3BhcnNlX2F1ZGlvLnBhcnNlU2FtcGxlcztcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9taWRpZmlsZVxucGFyc2VNSURJRmlsZSA9IF9taWRpZmlsZS5wYXJzZU1JRElGaWxlO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL2luaXRfYXVkaW9cbmdldEF1ZGlvQ29udGV4dCA9IGdldEF1ZGlvQ29udGV4dDtcbmV4cG9ydHMuZ2V0TWFzdGVyVm9sdW1lID0gX2luaXRfYXVkaW8uZ2V0TWFzdGVyVm9sdW1lO1xuZXhwb3J0cy5zZXRNYXN0ZXJWb2x1bWUgPSBfaW5pdF9hdWRpby5zZXRNYXN0ZXJWb2x1bWU7XG5leHBvcnRzLlxuXG4vLyAuL2luaXRfbWlkaVxuZ2V0TUlESUFjY2VzcyA9IF9pbml0X21pZGkuZ2V0TUlESUFjY2VzcztcbmV4cG9ydHMuZ2V0TUlESUlucHV0cyA9IF9pbml0X21pZGkuZ2V0TUlESUlucHV0cztcbmV4cG9ydHMuZ2V0TUlESU91dHB1dHMgPSBfaW5pdF9taWRpLmdldE1JRElPdXRwdXRzO1xuZXhwb3J0cy5nZXRNSURJSW5wdXRJZHMgPSBfaW5pdF9taWRpLmdldE1JRElJbnB1dElkcztcbmV4cG9ydHMuZ2V0TUlESU91dHB1dElkcyA9IF9pbml0X21pZGkuZ2V0TUlESU91dHB1dElkcztcbmV4cG9ydHMuZ2V0TUlESUlucHV0c0J5SWQgPSBfaW5pdF9taWRpLmdldE1JRElJbnB1dHNCeUlkO1xuZXhwb3J0cy5nZXRNSURJT3V0cHV0c0J5SWQgPSBfaW5pdF9taWRpLmdldE1JRElPdXRwdXRzQnlJZDtcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9taWRpX2V2ZW50XG5NSURJRXZlbnQgPSBfbWlkaV9ldmVudC5NSURJRXZlbnQ7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vbWlkaV9ub3RlXG5NSURJTm90ZSA9IF9taWRpX25vdGUuTUlESU5vdGU7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vc29uZ1xuU29uZyA9IF9zb25nLlNvbmc7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vdHJhY2tcblRyYWNrID0gX3RyYWNrLlRyYWNrO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL3BhcnRcblBhcnQgPSBfcGFydC5QYXJ0O1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL2luc3RydW1lbnRcbkluc3RydW1lbnQgPSBfaW5zdHJ1bWVudC5JbnN0cnVtZW50OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZXhwb3J0cy5mYWRlT3V0ID0gZmFkZU91dDtcbmV4cG9ydHMuY3JlYXRlU2FtcGxlID0gY3JlYXRlU2FtcGxlO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8uanMnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBTYW1wbGUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFNhbXBsZShzYW1wbGVEYXRhLCBldmVudCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTYW1wbGUpO1xuXG4gICAgdGhpcy5ldmVudCA9IGV2ZW50O1xuICAgIHRoaXMuc2FtcGxlRGF0YSA9IHNhbXBsZURhdGE7XG5cbiAgICBpZiAodGhpcy5zYW1wbGVEYXRhID09PSAtMSB8fCB0eXBlb2YgdGhpcy5zYW1wbGVEYXRhLmJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIGNyZWF0ZSBzaW1wbGUgc3ludGggc2FtcGxlXG4gICAgICB0aGlzLnNvdXJjZSA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgdGhpcy5zb3VyY2UudHlwZSA9ICdzaW5lJztcbiAgICAgIHRoaXMuc291cmNlLmZyZXF1ZW5jeS52YWx1ZSA9IGV2ZW50LmZyZXF1ZW5jeTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zb3VyY2UgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgdGhpcy5zb3VyY2UuYnVmZmVyID0gc2FtcGxlRGF0YS5idWZmZXI7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc291cmNlLmJ1ZmZlcilcbiAgICB9XG4gICAgdGhpcy5vdXRwdXQgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLnZvbHVtZSA9IGV2ZW50LmRhdGEyIC8gMTI3O1xuICAgIHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZTtcbiAgICB0aGlzLnNvdXJjZS5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTYW1wbGUsIFt7XG4gICAga2V5OiAnc3RhcnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFydCh0aW1lKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKHRpbWUsIHRoaXMuc291cmNlKTtcbiAgICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3N0b3AnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzdG9wKHRpbWUsIGNiKSB7XG4gICAgICB2YXIgX3NhbXBsZURhdGEgPSB0aGlzLnNhbXBsZURhdGE7XG4gICAgICB2YXIgcmVsZWFzZUR1cmF0aW9uID0gX3NhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uO1xuICAgICAgdmFyIHJlbGVhc2VFbnZlbG9wZSA9IF9zYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZTtcbiAgICAgIHZhciByZWxlYXNlRW52ZWxvcGVBcnJheSA9IF9zYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZUFycmF5O1xuXG4gICAgICBpZiAocmVsZWFzZUR1cmF0aW9uICYmIHJlbGVhc2VFbnZlbG9wZSkge1xuICAgICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUgKyByZWxlYXNlRHVyYXRpb24pO1xuICAgICAgICBmYWRlT3V0KHRoaXMub3V0cHV0LCB7XG4gICAgICAgICAgcmVsZWFzZUR1cmF0aW9uOiByZWxlYXNlRHVyYXRpb24sXG4gICAgICAgICAgcmVsZWFzZUVudmVsb3BlOiByZWxlYXNlRW52ZWxvcGUsXG4gICAgICAgICAgcmVsZWFzZUVudmVsb3BlQXJyYXk6IHJlbGVhc2VFbnZlbG9wZUFycmF5XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zb3VyY2Uub25lbmRlZCA9IGNiO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTYW1wbGU7XG59KCk7XG5cbmZ1bmN0aW9uIGZhZGVPdXQoZ2Fpbk5vZGUsIHNldHRpbmdzKSB7XG4gIHZhciBub3cgPSBfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lO1xuICB2YXIgdmFsdWVzID0gdm9pZCAwLFxuICAgICAgaSA9IHZvaWQgMCxcbiAgICAgIG1heGkgPSB2b2lkIDA7XG5cbiAgLy9jb25zb2xlLmxvZyhzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpXG4gIHN3aXRjaCAoc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlKSB7XG5cbiAgICBjYXNlICdsaW5lYXInOlxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluTm9kZS5nYWluLnZhbHVlLCBub3cpO1xuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBub3cgKyBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdlcXVhbF9wb3dlcic6XG4gICAgICB2YWx1ZXMgPSAoMCwgX3V0aWwuZ2V0RXF1YWxQb3dlckN1cnZlKSgxMDAsICdmYWRlT3V0JywgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSk7XG4gICAgICBnYWluTm9kZS5nYWluLnNldFZhbHVlQ3VydmVBdFRpbWUodmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbik7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIG1heGkgPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheS5sZW5ndGg7XG4gICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1heGkpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG1heGk7IGkrKykge1xuICAgICAgICB2YWx1ZXNbaV0gPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheVtpXSAqIGdhaW5Ob2RlLmdhaW4udmFsdWU7XG4gICAgICB9XG4gICAgICBnYWluTm9kZS5nYWluLnNldFZhbHVlQ3VydmVBdFRpbWUodmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbik7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlU2FtcGxlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICByZXR1cm4gbmV3IChGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5hcHBseShTYW1wbGUsIFtudWxsXS5jb25jYXQoYXJncykpKSgpO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBzYW1wbGVzID0ge1xuICBlbXB0eU9nZzogJ1QyZG5Vd0FDQUFBQUFBQUFBQUJkeGQ0WEFBQUFBRGFTMGpRQkhnRjJiM0ppYVhNQUFBQUFBVVNzQUFBQUFBQUFnTHNBQUFBQUFBQzRBVTluWjFNQUFBQUFBQUFBQUFBQVhjWGVGd0VBQUFBYVhLK1FEejMvLy8vLy8vLy8vLy8vLy8vL01nTjJiM0ppYVhNdEFBQUFXR2x3YUM1UGNtY2diR2xpVm05eVltbHpJRWtnTWpBeE1ERXhNREVnS0ZOamFHRjFabVZ1ZFdkblpYUXBBQUFBQUFFRmRtOXlZbWx6SDBKRFZnRUFBQUVBR0dOVUtVYVpVdEpLaVJsemxERkdtV0tTU29tbGhCWkNTSjF6RkZPcE9kZWNhNnk1dFNDRUVCcFRVQ2tGbVZLT1Vta1pZNUFwQlpsU0VFdEpKWFFTT2llZFl4QmJTY0hXbUd1TFFiWWNoQTJhVWt3cHhKUlNpa0lJR1ZPTUtjV1VVa3BDQnlWMERqcm1IRk9PU2loQnVKeHpxN1dXbG1PTHFYU1NTdWNrWkV4Q1NDbUZra29IcFZOT1FrZzFsdFpTS1IxelVsSnFRZWdnaEJCQ3RpQ0VEWUxRa0ZVQUFBRUF3RUFRR3JJS0FGQUFBQkNLb1JpS0FvU0dyQUlBTWdBQUJLQW9qdUlvamlNNWttTkpGaEFhc2dvQUFBSUFFQUFBd0hBVVNaRVV5YkVrUzlJc1M5TkVVVlY5MVRaVlZmWjFYZGQxWGRkMUlEUmtGUUFBQVFCQVNLZVpwUm9nd2d4a0dBZ05XUVVBSUFBQUFFWW93aEFEUWtOV0FRQUFBUUFBWWlnNWlDYTA1bnh6am9ObU9XZ3F4ZVowY0NMVjVrbHVLdWJtbkhQT09TZWJjOFk0NTV4emluSm1NV2dtdE9hY2N4S0RaaWxvSnJUbW5IT2V4T1pCYTZxMDVweHp4am1uZzNGR0dPZWNjNXEwNWtGcU50Ym1uSE1XdEtZNWFpN0Y1cHh6SXVYbVNXMHUxZWFjYzg0NTU1eHp6am5ubkhPcUY2ZHpjRTQ0NTV4em92Ym1XbTVDRitlY2N6NFpwM3R6UWpqbm5IUE9PZWVjYzg0NTU1eHpndENRVlFBQUVBQUFRUmcyaG5HbklFaWZvNEVZUllocHlLUUgzYVBESkdnTWNncXBSNk9qa1ZMcUlKUlV4a2twblNBMFpCVUFBQWdBQUNHRUZGSklJWVVVVWtnaGhSUlNpQ0dHR0dMSUthZWNnZ29xcWFTaWlqTEtMTFBNTXNzc3M4d3k2N0N6empyc01NUVFRd3l0dEJKTFRiWFZXR090dWVlY2F3N1NXbW10dGRaS0thV1VVa29wQ0ExWkJRQ0FBQUFRQ0Jsa2tFRkdJWVVVVW9naHBweHl5aW1vb0FKQ1ExWUJBSUFBQUFJQUFBQTh5WE5FUjNSRVIzUkVSM1JFUjNSRXgzTThSNVJFU1pSRVNiUk15OVJNVHhWVjFaVmRXOVpsM2ZadFlSZDIzZmQxMy9kMTQ5ZUZZVm1XWlZtV1pWbVdaVm1XWlZtV1pWbUMwSkJWQUFBSUFBQ0FFRUlJSVlVVVVrZ2hwUmhqekRIbm9KTlFRaUEwWkJVQUFBZ0FJQUFBQU1CUkhNVnhKRWR5Sk1tU0xFbVRORXV6UE0zVFBFMzBSRkVVVGROVVJWZDBSZDIwUmRtVVRkZDBUZGwwVlZtMVhWbTJiZG5XYlYrV2JkLzNmZC8zZmQvM2ZkLzNmZC8zZFIwSURWa0ZBRWdBQU9oSWpxUklpcVJJanVNNGtpUUJvU0dyQUFBWkFBQUJBQ2lLb3ppTzQwaVNKRW1XcEVtZTVWbWlabXFtWjNxcXFBS2hJYXNBQUVBQUFBRUFBQUFBQUNpYTRpbW00aW1pNGptaUkwcWlaVnFpcG1xdUtKdXk2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3b3VFQnF5Q2dDUUFBRFFrUnpKa1J4SmtSUkprUnpKQVVKRFZnRUFNZ0FBQWdCd0RNZVFGTW14TEV2VFBNM1RQRTMwUkUvMFRFOFZYZEVGUWtOV0FRQ0FBQUFDQUFBQUFBQXdKTU5TTEVkek5FbVVWRXUxVkUyMVZFc1ZWVTlWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVTFUZE0wVFNBMFpDVUFBQVFBd0dLTndlVWdJU1VsNWQ0UXdoQ1RuakVtSWJWZUlRU1JrdDR4QmhXRG5qS2lESExlUXVNUWd4NElEVmtSQUVRQkFBREdJTWNRYzhnNVI2bVRFam5ucUhTVUd1Y2NwWTVTWnluRm1HTE5LSlhZVXF5TmM0NVNSNjJqbEdJc0xYYVVVbzJweGdJQUFBSWNBQUFDTElSQ1ExWUVBRkVBQUlReFNDbWtGR0tNT2FlY1E0d3A1NWh6aGpIbUhIT09PZWVnZEZJcTU1eDBUa3JFR0hPT09hZWNjMUk2SjVWelRrb25vUUFBZ0FBSEFJQUFDNkhRa0JVQlFKd0FnRUdTUEUveU5GR1VORThVUlZOMFhWRTBYZGZ5UE5YMFRGTlZQZEZVVlZOVmJkbFVWVm1XUE04MFBkTlVWYzgwVmRWVVZWazJWVldXUlZYVmJkTjFkZHQwVmQyV2JkdjNYVnNXZGxGVmJkMVVYZHMzVmRmMlhkbjJmVm5XZFdQeVBGWDFUTk4xUGROMFpkVjFiVnQxWFYzM1RGT1dUZGVWWmROMWJkdVZaVjEzWmRuM05kTjBYZE5WWmRsMFhkbDJaVmUzWFZuMmZkTjFoZCtWWlY5WFpWa1lkbDMzaFZ2WGxlVjBYZDFYWlZjM1ZsbjJmVnZYaGVIV2RXR1pQRTlWUGROMFhjODBYVmQxWFY5WFhkZldOZE9VWmROMWJkbFVYVmwyWmRuM1hWZldkYzgwWmRsMFhkczJYVmVXWFZuMmZWZVdkZDEwWFY5WFpWbjRWVmYyZFZuWGxlSFdiZUUzWGRmM1ZWbjJoVmVXZGVIV2RXRzVkVjBZUGxYMWZWTjJoZUYwWmQvWGhkOVpibDA0bHRGMWZXR1ZiZUZZWlZrNWZ1RllsdDMzbFdWMFhWOVliZGtZVmxrV2hsLzRuZVgyZmVONGRWMFpidDNuekxydkRNZnZwUHZLMDlWdFk1bDkzVmxtWDNlTzRSZzZ2L0RqcWFxdm02NHJES2NzQzcvdDY4YXorNzZ5aks3cis2b3NDNzhxMjhLeDY3N3ovTDZ3TEtQcytzSnF5OEt3MnJZeDNMNXVMTDl3SE10cjY4b3g2NzVSdG5WOFgzZ0t3L04wZFYxNVpsM0g5blYwNDBjNGZzb0FBSUFCQndDQUFCUEtRS0VoS3dLQU9BRUFqeVNKb21SWm9paFpsaWlLcHVpNm9taTZycVJwcHFscG5tbGFtbWVhcG1tcXNpbWFyaXhwbW1sYW5tYWFtcWVacG1pYXJtdWFwcXlLcGluTHBtcktzbW1hc3V5NnNtMjdybXpib21uS3NtbWFzbXlhcGl5N3NxdmJydXpxdXFSWnBxbDVubWxxbm1lYXBtcktzbW1hcnF0NW5tcDZubWlxbmlpcXFtcXFxcTJxcWl4Ym5tZWFtdWlwcGllS3FtcXFwcTJhcWlyTHBxcmFzbW1xdG15cXFtMjdxdXo2c20zcnVtbXFzbTJxcGkyYnFtcmJydXpxc2l6YnVpOXBtbWxxbm1lYW11ZVpwbW1hc215YXFpdGJucWVhbmlpcXF1YUpwbXFxcWl5YnBxcktsdWVacWllS3F1cUpubXVhcWlyTHBtcmFxbW1hdG15cXFpMmJwaXJMcm0zN3Z1dktzbTZxcW15YnFtcnJwbXJLc216THZ1L0txdTZLcGluTHBxcmFzbW1xc2kzYnN1L0xzcXo3b21uS3NtbXFzbTJxcWk3THNtMGJzMno3dW1pYXNtMnFwaTJicWlyYnNpMzd1aXpidXUvS3JtK3JxcXpyc2kzN3V1NzZybkRydWpDOHNtejdxcXo2dWl2YnVtL3JNdHYyZlVUVGxHVlROVzNiVkZWWmRtWFo5bVhiOW4zUk5HMWJWVlZiTmszVnRtVlo5bjFadG0xaE5FM1pObFZWMWszVnRHMVpsbTFodG1YaGRtWFp0MlZiOW5YWGxYVmYxMzNqMTJYZDVycXk3Y3V5cmZ1cXEvcTI3dnZDY091dThBb0FBQmh3QUFBSU1LRU1GQnF5RWdDSUFnQUFqR0dNTVFpTlVzNDVCNkZSeWpubklHVE9RUWdobGN3NUNDR1VramtIb1pTVU11Y2dsSkpTQ0tHVWxGb0xJWlNVVW1zRkFBQVVPQUFBQk5pZ0tiRTRRS0VoS3dHQVZBQUFnK05ZbHVlWm9tcmFzbU5KbmllS3FxbXF0dTFJbHVlSm9tbXFxbTFibmllS3BxbXFydXZybXVlSm9tbXFxdXZxdW1pYXBxbXFydXU2dWk2YW9xbXFxdXU2c3E2YnBxcXFyaXU3c3V6cnBxcXFxdXZLcml6N3dxcTZyaXZMc20zcndyQ3FydXZLc216YnRtL2N1cTdydnUvN3dwR3Q2N291L01JeERFY0JBT0FKRGdCQUJUYXNqbkJTTkJaWWFNaEtBQ0FEQUlBd0JpR0RFRUlHSVlTUVVrb2hwWlFTQUFBdzRBQUFFR0JDR1NnMFpFVUFFQ2NBQUJoREthU1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSklLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktxYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLWlZTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVnb0FrSXB3QUpCNk1LRU1GQnF5RWdCSUJRQUFqRkZLS2NhY2d4QXg1aGhqMEVrb0tXTE1PY1ljbEpKUzVSeUVFRkpwTGJmS09RZ2hwTlJTYlpselVscUxNZVlZTStla3BCUmJ6VG1IVWxLTHNlYWFhKzZrdEZacnJqWG5XbHFyTmRlY2M4MjV0QlpycmpuWG5IUExNZGVjYzg0NTV4aHp6am5ubkhQT0JRRGdORGdBZ0I3WXNEckNTZEZZWUtFaEt3R0FWQUFBQWhtbEdIUE9PZWdRVW93NTV4eUVFQ0tGR0hQT09RZ2hWSXc1NXh4MEVFS29HSFBNT1FnaGhKQTU1eHlFRUVJSUlYTU9PdWdnaEJCQ0J4MkVFRUlJb1pUT1FRZ2hoQkJLS0NHRUVFSUlJWVFRT2dnaGhCQkNDQ0dFRUVJSUlZUlNTZ2doaEJCQ0NhR1VVQUFBWUlFREFFQ0FEYXNqbkJTTkJSWWFzaElBQUFJQWdCeVdvRkxPaEVHT1FZOE5RY3BSTXcxQ1REblJtV0pPYWpNVlU1QTVFSjEwRWhscVFkbGVNZ3NBQUlBZ0FDREFCQkFZSUNqNFFnaUlNUUFBUVlqTUVBbUZWYkRBb0F3YUhPWUJ3QU5FaEVRQWtKaWdTTHU0Z0M0RFhOREZYUWRDQ0VJUWdsZ2NRQUVKT0RqaGhpZmU4SVFibktCVFZPb2dBQUFBQUFBTUFPQUJBT0NnQUNJaW1xdXd1TURJME5qZzZQQUlBQUFBQUFBV0FQZ0FBRGcrZ0lpSTVpb3NMakF5TkRZNE9qd0NBQUFBQUFBQUFBQ0FnSUFBQUFBQUFFQUFBQUNBZ0U5bloxTUFCQUVBQUFBQUFBQUFYY1hlRndJQUFBQnEybnB4QWdFQkFBbz0nLFxuICBlbXB0eU1wMzogJy8vc1F4QUFEd0FBQnBBQUFBQ0FBQURTQUFBQUVURUZOUlRNdU9Ua3VOVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlU9JyxcbiAgaGlnaHRpY2s6ICdVa2xHUmtRRkFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVNBRkFBQ3gveGYvZEFET0FDd0JzUDNwKzZIK3pBR29CT2tDQ3dCWC9FSDVPdnhsQTRrSjJ3Y1NBclQ5RS91dCtIVDJldlV4OThuNk9BRjVDQ1VNd1F2ZkNPc0p4QXgwRFNJTUVBcTlCaUFCM3ZoejdtTGtUOXNSMTMzWXhOMnM1UUx2MHZyVUJud1JueHVRSmVFc1NEQ2lNZDh5RlM4YUtGSWhvaFVzQ0tqNjR1NjI1T3JhQTlIdXlQbkVsY1Ard3h2Sld0VzI1NjM3VlEwakhQZ25CVERETTFvMEN6S0xLKzhoemhnRkRPejhTZTRKNDdEWVZ0RzB6NWZRcTlMQjEycmZBK2o5OXJvSEFoZWxJeU13SWpkVE91VThtandJT0dveGhDYjVFNTMvaiszazMvZlRZOHBUdzR5L1RyK2V3OERNdmRzazhSY0hSUmtTS080eUdUa0hQa1Uvcnp6eU5jZ3NyUjk0RHAvNXIrWnMxN3pPbmNvRHhoZkUzOFdMeW4vVGVPTWk5cjBJUnhsUktJUXp5VGxPUEtvOXlqbVdNY29rRFJMYy9ZN3J1ZHRkenUvRDJMMUl1KzI3SmNHM3lZclZMdWpsKzNVT1p4MVVLNVEwcXptTlBEazhaamVlTVBvanpoSCsvakx0UGQ1bTBoSExIc1lJdzVURU1NbkEwanZqOGZTT0Jpd1hBU1pnTXpNOGRVQkdRYkkrcnpqcEtrSVp5Z1pUOVFmbGNkYVJ5cVhDejcrVndVUEg3ODRyM0s3cyt2MEtEdThidnllTE1iNDNOanJoT0lvMGRTdlFIaTBQblA2aTdvdmczTlR4eTQvR2Y4WDh5SC9RQnR2WDU1UDJZZ2IwRmNVanN5NExObUk1ZWppWE0zOHI3aUM4Rkp3SFB2b2s3ZERnUWRhSnpsVEtJc29GenNyVmt1QTg3ZC82cUFpN0ZRMGg5Q2xLTUxFejNUT3JNQmNxWVNEOEU5QUZkL2RTNmtUZjZkYlUwWG5RdjlJSDJNWGZaK2xuOURFQUZ3d2RGeThnaWliNkthd3FlQ2hnSS9VYkhCT1RDWmovdnZYZTdJbmxGdUROM1AzYjBkMUY0Z3pwaWZHMit1NEQ3UXcxRmZ3Ym5DRCtJbGdqV3lITEhQTVZvZzJtQkwzN3F2UCs3TnZuWXVUdjRydmpmdWJONmszd3BQWjAvV2tFT3d0aUVVc1djeG0rR2w0YU9oaGlGREFQSXdtYkF0bjdUUFZ5Nzd6cWNlZnI1WUhtSHVsbDdlbnlmUG1jQUhnSGV3MVJFcjhWaGhkL0YrQVYxUkowRGlrSldRTmMvWlAzZWZLZDdodnMydXI0NnJIczV1OGU5Ti80OC8waEEvOEhGZ3d1RDA0UlNCSVJFcXNRT2c3bUNzc0dNQUpXL1huNEcvVEs4TGJ1enUwSTdxVHZuUEp5OXNYNmJQODRCTFlJYkF3ZEQ4NFFZeEc3RU9jT0RBeHdDRk1FQVFDOSs3UDNTdlRYOFhIdyt1OVI4S1R4SXZTbzkrWDdWUUNVQkowSU13emlEajRRTGhBR0Q5VU1yZ25UQlpjQlJ2MXYrWHYyVWZTKzh0ZngrdkVTODd6MCt2YjMrWmY5WmdFUUJTRUlVQXJXQzhrTTJReXpDNUVKRUFkdkJIZ0JYUDVuKytyNEF2ZDg5V2owN2ZNdzlEMzFKdmZwK1VqOXhRRDlBOFFHNVFoWENsRUxyQXN2Qzl3SjdnZDZCV0lDM3Y2Tys3VDRQUFpOOUVIeld2TmY5UHoxRnZpdCtxTDlyUUNIQXdFRy93ZUNDWlVLRnd2RENuSUpjQWNRQldjQ2FmOFovQ0Q1NXZhQjlkRDB3UFNQOVVMM20vazcvTXorSndFeUF3OEZ6QVk3Q0JzSmFRazVDV2tJMmdhdEJDSUNZZitqL0ZyNnZmaVY5ODcyc2ZaUDkxejRwL2xSKzNIOXpmODlBcm9FRkFmakNQMEpjd284Q2pBSmRRZGdCU0VEa2dEUS9WajdaZm5SOTVUMjhmVWQ5djMyVnZnMituYjgrLzZ4QVdvRTRBYkRDUDRKcEFxYkNxUUowd2VFQmZnQ1RBQ1QvUjM3TS9tKzk2NzJJUFk2OWdiM2FmaFcrdFQ4cWYrTUFqMEZnZ2N1Q1NjS1hBcmlDY01JRUFmeUJKWUNGd0NQL1J6N0EvbDc5M3oyRi9abjltSDM3ZmpkK2kzOXlmOXBBdDBFRkFmUkNOa0pHQXFyQ1pZSXZnWlBCSjhCNlA0Ly9NMzUwdmR6OXEvMWxmVXE5bXozUlBtaSszSCtiZ0ZWQk9RRzN3Z0hDa3dLMEFtN0NDQUhDZ1dtQWpBQScsXG4gIGxvd3RpY2s6ICdVa2xHUmxRRkFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVRBRkFBQjAvNXYrVS80VC8zZ0Ewd0ZUQXVVQitmOGQvblQ5MGYxcS91Yit0ZjQ2L21iLzh3RlFBOWdDN3dDZC9tcitGQUdSQTNjRTZ3SmYvaDM2ZXZtdis4di9Od1JIQlpVQzIvNjArLy81RXZ1Wi9hWC9iZ0ZPQXA4QXp2emg5d2Z6TFBGNjh6VDR5LzJCQXlnSWZRd2FFallZMHgzMUlyd2w4U09XSFZFU09nUGg5TmZwUmVGdDIybllIZGREMkJYY1plRGE1SW5xZ1BEeDluUCs2Z1M0Q0JZTG53MHpFUzBXWHh2NEhrY2dMaC8xRytFWDFSTnBENHdLaWdYSC82cjUvZk51N2xUcGorWnU1aEhvWE90TDcxYnlyL1FwOTFMNjR2Nk9CTzRKb1E1ekVza1UraFUxRmlRVmVSUDdFV2dQNFFyMEJJVCt0UGlkOUMzeTF2Q2g4RkR4SnZLMjh2dnl5L0xBOHBMelUvWFA5NXY2eHZ3NC91RC9SQUsyQlNrS2NnNkJFU2NUWkJNZUVxa1BUUXhqQ0tFRVZ3RmkvbnY3aC9ocDlhRHlBdkhQOE1meEx2TSs5UFgwdVBXMTlnLzRMZnI3L0M0QUtnTmFCWFFHeXdiMEJoSUhXUWZXQjFvSXpBanRDRjhJSHdkdEJha0RWd0tMQWVZQTh2OXcva2o4MS9uUTk0djI5L1hYOWJ6MWJQVVk5VXoxWi9hSCtIcjd5UDRNQWk0Rit3Y2ZDbllMTmd5ZkRQc01TdzBzRFVBTWZncmNCNUlFTXdGYi9pWDhUL3BUK08vMVgvTWY4Y2J2ck8rMThNTHl2ZlZQK1JmOXdnQW9CQ0VIcHduSUM1RU40UTVBRDN3TzFBeTBDcHNJdndidkJOY0NiUUFyL25YOE9mc2YrdmI0bXZkYTlyajF6L1dYOXBMM2EvaEgrWlg2Ui93bi92UC9lUUVTQS9BRSt3WURDY3dLRkF5UERDa01GUXVTQ2U0SFZRYlNCSFFEQ3dJOEFOTDlKUHVZK0hYMjh2VHE4MlB6ZFBNVjlBejFNZlo0OXpENWdmdHgvc1FCQlFYTEI4Y0ovZ3FwQ3c4TWlnd1dEWEVOWFEyckREVUw3UWdEQnN3Q2R2OFMvSzc0V1BWazhoWHdvdTRQN212dTErOVQ4cHoxVXZsaS9ab0J3Z1dSQ2NzTVBnL0NFRVFSNFJEQUR3b085d3VzQ1ZNSDRBUlNBcG4vdWZ6ZCtXajNidlg3OHh6engvTDY4cXp6MXZTRDlxWDRHZnZkL2MwQWh3Ty9CV3dIbWdodkNRRUtWUW9uQ2xzSkN3aUlCaDBGMGdPZ0FtMEJPd0F4LzAzK1hQMGcvTGI2Y1BtWCtGLzR2ZmgrK1RINnMvb3MrNy83Y3Z3TC9aejlYUDVPLzNJQTNBRjlBenNGOWdhVUNBQUtIZ3VlQ3pjTDl3bnRCM3NGNHdJekFJMzk2ZnAxK0d2Mkl2V245TjMwcC9YaTltNzRHL3J1KzlQOWsvOGFBWUVDMUFNVEJTSUcwd1l1QjFnSGtnY0FDR0VJU0FoVEJ6RUZXQUt0LzVMOTJmdVUrdlg1MGZtZitTUDVpL2diK0JmNG12aXYrU3I3a3Z5Yi9VaityLzRYLzhyLytnQ2lBbzBFVUFhUkJ6d0lTd2pxQjNJSEdRZkNCdjhGcGdUTUFwUUFLZjY3KzVuNS92Zm45anoyeVBWbjlTTDFSUFhxOVNQM0R2bXIrNmYrc1FHS0JBY0grd2hPQ2gwTGF3czNDMjhLTEFtREI1QUZmUU5vQVZQL1p2M2UrN1A2c2ZuTCtDdjR2UGVNOTViMzdmZVYrSm41MVBvcS9MTDltditZQVZZRDNnUXVCbWNIU0Fpa0NJRUk3QWYrQnVFRm5nUVhBMXNCdi85di9wZjlNUDNXL0ZqOHEvc1IrNkg2VS9vMyttUDZ5L3BOKy9mN3h2eWUvV0grSmY5bUFENENRQVFKQmlzSHRnZjZCdzBJOFFkc0Ixc0d5d1Q0QWdnQkNQL28vS1g2bVBnMTk1NzJqZmF6OXVmMlMvY00rRTM1RS90Vy9hZi81d0gxQThBRktnZmtCL0FIZ3dmeEJsQUdnUVZJQk1NQ0p3R3MvNDMrdlAwaS9acjhMZnpsKzlINzZmdmkrOWY3NWZzZi9JbjhCUDEwL2VqOWNmNE8vN2YvZEFBY0FhVUJFZ0tNQWhnRHBBTUVCQ0VFRHdUZkEzSUR4UUw4QVNvQlV3Q0cvODcrSi82aC9ScjlwUHhrL0diOG9Qd0ovWEg5dy8zOS9VRCtxUDQxLzlEL1d3RGVBR3NCQWdLZEFoRURRUU5BQTBzRGJ3T1ZBNVlEVndQT0FoZ0NWQUdSQUE9PSdcbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHNhbXBsZXM7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX2luaXRfbWlkaSA9IHJlcXVpcmUoJy4vaW5pdF9taWRpJyk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF9zZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vIG1pbGxpc1xuXG52YXIgU2NoZWR1bGVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTY2hlZHVsZXIoc29uZykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTY2hlZHVsZXIpO1xuXG4gICAgdGhpcy5zb25nID0gc29uZztcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTY2hlZHVsZXIsIFt7XG4gICAga2V5OiAnaW5pdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQobWlsbGlzKSB7XG4gICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gbWlsbGlzO1xuICAgICAgdGhpcy5zb25nU3RhcnRNaWxsaXMgPSBtaWxsaXM7XG4gICAgICB0aGlzLmV2ZW50cyA9IHRoaXMuc29uZy5fYWxsRXZlbnRzO1xuICAgICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGg7XG4gICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAgIHRoaXMubWF4dGltZSA9IDA7XG4gICAgICB0aGlzLnByZXZNYXh0aW1lID0gMDtcbiAgICAgIHRoaXMuYmV5b25kTG9vcCA9IGZhbHNlOyAvLyB0ZWxscyB1cyBpZiB0aGUgcGxheWhlYWQgaGFzIGFscmVhZHkgcGFzc2VkIHRoZSBsb29wZWQgc2VjdGlvblxuICAgICAgdGhpcy5wcmVjb3VudGluZ0RvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRNaWxsaXMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFRpbWVTdGFtcCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFRpbWVTdGFtcCh0aW1lU3RhbXApIHtcbiAgICAgIHRoaXMudGltZVN0YW1wID0gdGltZVN0YW1wO1xuICAgIH1cblxuICAgIC8vIGdldCB0aGUgaW5kZXggb2YgdGhlIGV2ZW50IHRoYXQgaGFzIGl0cyBtaWxsaXMgdmFsdWUgYXQgb3IgcmlnaHQgYWZ0ZXIgdGhlIHByb3ZpZGVkIG1pbGxpcyB2YWx1ZVxuXG4gIH0sIHtcbiAgICBrZXk6ICdzZXRJbmRleCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEluZGV4KG1pbGxpcykge1xuICAgICAgdmFyIGkgPSAwO1xuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHRoaXMuZXZlbnRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBldmVudCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYmV5b25kTG9vcCA9IG1pbGxpcyA+IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcztcbiAgICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50cygpIHtcbiAgICAgIHZhciBldmVudHMgPSBbXTtcblxuICAgICAgaWYgKHRoaXMuc29uZy5fbG9vcCA9PT0gdHJ1ZSAmJiB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvbiA8IF9zZXR0aW5ncy5idWZmZXJUaW1lKSB7XG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ1N0YXJ0TWlsbGlzICsgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gLSAxO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5zb25nLmxvb3BEdXJhdGlvbik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnNvbmcuX2xvb3AgPT09IHRydWUpIHtcblxuICAgICAgICBpZiAodGhpcy5tYXh0aW1lID49IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAmJiB0aGlzLmJleW9uZExvb3AgPT09IGZhbHNlKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnTE9PUCcsIHRoaXMubWF4dGltZSwgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKVxuXG4gICAgICAgICAgdmFyIGRpZmYgPSB0aGlzLm1heHRpbWUgLSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXM7XG4gICAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXMgKyBkaWZmO1xuXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLUxPT1BFRCcsIHRoaXMubWF4dGltZSwgZGlmZiwgdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXMsIHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyk7XG5cbiAgICAgICAgICBpZiAodGhpcy5sb29wZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLmxvb3BlZCA9IHRydWU7XG4gICAgICAgICAgICB2YXIgbGVmdE1pbGxpcyA9IHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzO1xuICAgICAgICAgICAgdmFyIHJpZ2h0TWlsbGlzID0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5pbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgICAgICAgIGlmIChldmVudC5taWxsaXMgPCByaWdodE1pbGxpcykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuICAgICAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcblxuICAgICAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAxNDQpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkLCBldmVudC50eXBlKVxuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzdG9wIG92ZXJmbG93aW5nIG5vdGVzLT4gYWRkIGEgbmV3IG5vdGUgb2ZmIGV2ZW50IGF0IHRoZSBwb3NpdGlvbiBvZiB0aGUgcmlnaHQgbG9jYXRvciAoZW5kIG9mIHRoZSBsb29wKVxuICAgICAgICAgICAgdmFyIGVuZFRpY2tzID0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IudGlja3MgLSAxO1xuICAgICAgICAgICAgdmFyIGVuZE1pbGxpcyA9IHRoaXMuc29uZy5jYWxjdWxhdGVQb3NpdGlvbih7IHR5cGU6ICd0aWNrcycsIHRhcmdldDogZW5kVGlja3MsIHJlc3VsdDogJ21pbGxpcycgfSkubWlsbGlzO1xuXG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IHRoaXMubm90ZXMudmFsdWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm90ZSA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgICAgICAgICAgIHZhciBub3RlT24gPSBub3RlLm5vdGVPbjtcbiAgICAgICAgICAgICAgICB2YXIgbm90ZU9mZiA9IG5vdGUubm90ZU9mZjtcbiAgICAgICAgICAgICAgICBpZiAobm90ZU9mZi5taWxsaXMgPD0gcmlnaHRNaWxsaXMpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgX2V2ZW50ID0gbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudChlbmRUaWNrcywgMTI4LCBub3RlT24uZGF0YTEsIDApO1xuICAgICAgICAgICAgICAgIF9ldmVudC5taWxsaXMgPSBlbmRNaWxsaXM7XG4gICAgICAgICAgICAgICAgX2V2ZW50Ll9wYXJ0ID0gbm90ZU9uLl9wYXJ0O1xuICAgICAgICAgICAgICAgIF9ldmVudC5fdHJhY2sgPSBub3RlT24uX3RyYWNrO1xuICAgICAgICAgICAgICAgIF9ldmVudC5taWRpTm90ZSA9IG5vdGU7XG4gICAgICAgICAgICAgICAgX2V2ZW50Lm1pZGlOb3RlSWQgPSBub3RlLmlkO1xuICAgICAgICAgICAgICAgIF9ldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBfZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnYWRkZWQnLCBldmVudClcbiAgICAgICAgICAgICAgICBldmVudHMucHVzaChfZXZlbnQpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgYXVkaW8gc2FtcGxlc1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGkgaW4gdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHMuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvRXZlbnQgPSB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGF1ZGlvRXZlbnQuZW5kTWlsbGlzID4gdGhpcy5zb25nLmxvb3BFbmQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9FdmVudC5zdG9wU2FtcGxlKHRoaXMuc29uZy5sb29wRW5kLzEwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wcGluZyBhdWRpbyBldmVudCcsIGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm5vdGVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRJbmRleChsZWZ0TWlsbGlzKTtcbiAgICAgICAgICAgIHRoaXMudGltZVN0YW1wICs9IHRoaXMuc29uZy5fbG9vcER1cmF0aW9uO1xuICAgICAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyAtPSB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvbjtcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudHMubGVuZ3RoKVxuXG4gICAgICAgICAgICAvLyBnZXQgdGhlIGF1ZGlvIGV2ZW50cyB0aGF0IHN0YXJ0IGJlZm9yZSBzb25nLmxvb3BTdGFydFxuICAgICAgICAgICAgLy90aGlzLmdldERhbmdsaW5nQXVkaW9FdmVudHModGhpcy5zb25nLmxvb3BTdGFydCwgZXZlbnRzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvb3BlZCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy9jb25zb2xlLmxvZygnc2NoZWR1bGVyJywgdGhpcy5sb29wZWQpXG5cbiAgICAgIC8vIG1haW4gbG9vcFxuICAgICAgZm9yICh2YXIgX2kgPSB0aGlzLmluZGV4OyBfaSA8IHRoaXMubnVtRXZlbnRzOyBfaSsrKSB7XG4gICAgICAgIHZhciBfZXZlbnQyID0gdGhpcy5ldmVudHNbX2ldO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgdGhpcy5tYXh0aW1lKVxuICAgICAgICBpZiAoX2V2ZW50Mi5taWxsaXMgPCB0aGlzLm1heHRpbWUpIHtcblxuICAgICAgICAgIC8vZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG5cbiAgICAgICAgICBpZiAoX2V2ZW50Mi50eXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIF9ldmVudDIudGltZSA9IHRoaXMudGltZVN0YW1wICsgX2V2ZW50Mi5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2goX2V2ZW50Mik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZXZlbnRzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZShkaWZmKSB7XG4gICAgICB2YXIgaSwgZXZlbnQsIG51bUV2ZW50cywgdHJhY2ssIGV2ZW50cztcblxuICAgICAgdGhpcy5wcmV2TWF4dGltZSA9IHRoaXMubWF4dGltZTtcblxuICAgICAgaWYgKHRoaXMuc29uZy5wcmVjb3VudGluZykge1xuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmY7XG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyBfc2V0dGluZ3MuYnVmZmVyVGltZTtcbiAgICAgICAgZXZlbnRzID0gdGhpcy5zb25nLl9tZXRyb25vbWUuZ2V0UHJlY291bnRFdmVudHModGhpcy5tYXh0aW1lKTtcblxuICAgICAgICBpZiAodGhpcy5tYXh0aW1lID4gdGhpcy5zb25nLl9tZXRyb25vbWUuZW5kTWlsbGlzICYmIHRoaXMucHJlY291bnRpbmdEb25lID09PSBmYWxzZSkge1xuICAgICAgICAgIHZhciBfZXZlbnRzO1xuXG4gICAgICAgICAgdGhpcy5wcmVjb3VudGluZ0RvbmUgPSB0cnVlO1xuICAgICAgICAgIHRoaXMudGltZVN0YW1wICs9IHRoaXMuc29uZy5fbWV0cm9ub21lLnByZWNvdW50RHVyYXRpb247XG5cbiAgICAgICAgICAvLyBzdGFydCBzY2hlZHVsaW5nIGV2ZW50cyBvZiB0aGUgc29uZyAtPiBhZGQgdGhlIGZpcnN0IGV2ZW50cyBvZiB0aGUgc29uZ1xuICAgICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmY7XG4gICAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIF9zZXR0aW5ncy5idWZmZXJUaW1lO1xuICAgICAgICAgIChfZXZlbnRzID0gZXZlbnRzKS5wdXNoLmFwcGx5KF9ldmVudHMsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmdldEV2ZW50cygpKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZjtcbiAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIF9zZXR0aW5ncy5idWZmZXJUaW1lO1xuICAgICAgICBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdkb25lJywgdGhpcy5zb25nQ3VycmVudE1pbGxpcywgZGlmZiwgdGhpcy5pbmRleCwgZXZlbnRzLmxlbmd0aClcbiAgICAgIH1cblxuICAgICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aDtcblxuICAgICAgLy8gaWYobnVtRXZlbnRzID4gNSl7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKG51bUV2ZW50cylcbiAgICAgIC8vIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IG51bUV2ZW50czsgaSsrKSB7XG4gICAgICAgIGV2ZW50ID0gZXZlbnRzW2ldO1xuICAgICAgICB0cmFjayA9IGV2ZW50Ll90cmFjaztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWxsaXMsIHRoaXMubWF4dGltZSwgdGhpcy5wcmV2TWF4dGltZSlcblxuICAgICAgICAvLyBpZihldmVudC5taWxsaXMgPiB0aGlzLm1heHRpbWUpe1xuICAgICAgICAvLyAgIC8vIHNraXAgZXZlbnRzIHRoYXQgd2VyZSBoYXJ2ZXN0IGFjY2lkZW50bHkgd2hpbGUganVtcGluZyB0aGUgcGxheWhlYWQgLT4gc2hvdWxkIGhhcHBlbiB2ZXJ5IHJhcmVseSBpZiBldmVyXG4gICAgICAgIC8vICAgY29uc29sZS5sb2coJ3NraXAnLCBldmVudClcbiAgICAgICAgLy8gICBjb250aW51ZVxuICAgICAgICAvLyB9XG5cbiAgICAgICAgaWYgKGV2ZW50Ll9wYXJ0Lm11dGVkID09PSB0cnVlIHx8IHRyYWNrLm11dGVkID09PSB0cnVlIHx8IGV2ZW50Lm11dGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyB0aGlzIGlzIHVzdWFsbHkgY2F1c2VkIGJ5IHRoZSBzYW1lIG5vdGUgb24gdGhlIHNhbWUgdGlja3MgdmFsdWUsIHdoaWNoIGlzIHByb2JhYmx5IGEgYnVnIGluIHRoZSBtaWRpIGZpbGVcbiAgICAgICAgICAvL2NvbnNvbGUuaW5mbygnbm8gbWlkaU5vdGVJZCcsIGV2ZW50KVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY29udmVydCB0byBzZWNvbmRzIGJlY2F1c2UgdGhlIGF1ZGlvIGNvbnRleHQgdXNlcyBzZWNvbmRzIGZvciBzY2hlZHVsaW5nXG4gICAgICAgICAgICB0cmFjay5wcm9jZXNzTUlESUV2ZW50KGV2ZW50LCB0cnVlKTsgLy8gdHJ1ZSBtZWFuczogdXNlIGxhdGVuY3kgdG8gY29tcGVuc2F0ZSB0aW1pbmcgZm9yIGV4dGVybmFsIE1JREkgZGV2aWNlcywgc2VlIFRyYWNrLnByb2Nlc3NNSURJRXZlbnRcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAsIGV2ZW50LnRpbWUsIHRoaXMuaW5kZXgpXG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gMTI4KSB7XG4gICAgICAgICAgICAgIHRoaXMubm90ZXMuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5pbmRleCwgdGhpcy5udW1FdmVudHMpXG4gICAgICAvL3JldHVybiB0aGlzLmluZGV4ID49IDEwXG4gICAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLm51bUV2ZW50czsgLy8gbGFzdCBldmVudCBvZiBzb25nXG4gICAgfVxuXG4gICAgLypcbiAgICAgIGFsbE5vdGVzT2ZmKCl7XG4gICAgICAgIGxldCB0aW1lU3RhbXAgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuICAgICAgICBsZXQgb3V0cHV0cyA9IGdldE1JRElPdXRwdXRzKClcbiAgICAgICAgb3V0cHV0cy5mb3JFYWNoKChvdXRwdXQpID0+IHtcbiAgICAgICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICAgICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgKi9cblxuICB9XSk7XG5cbiAgcmV0dXJuIFNjaGVkdWxlcjtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gU2NoZWR1bGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuc2V0QnVmZmVyVGltZSA9IHNldEJ1ZmZlclRpbWU7XG52YXIgZGVmYXVsdFNvbmcgPSBleHBvcnRzLmRlZmF1bHRTb25nID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDE2LFxuICBsb3dlc3ROb3RlOiAwLFxuICBoaWdoZXN0Tm90ZTogMTI3LFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIGxvb3A6IGZhbHNlLFxuICBwbGF5YmFja1NwZWVkOiAxLFxuICBhdXRvUXVhbnRpemU6IGZhbHNlXG59O1xuXG52YXIgYnVmZmVyVGltZSA9IGV4cG9ydHMuYnVmZmVyVGltZSA9IDIwMDtcblxuZnVuY3Rpb24gc2V0QnVmZmVyVGltZSh0aW1lKSB7XG4gIGV4cG9ydHMuYnVmZmVyVGltZSA9IGJ1ZmZlclRpbWUgPSB0aW1lO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuU29uZyA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLy9AIGZsb3dcblxuLy9pbXBvcnQge2FkZFRhc2ssIHJlbW92ZVRhc2t9IGZyb20gJy4vaGVhcnRiZWF0J1xuXG5cbnZhciBfY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcblxudmFyIF9wYXJzZV9ldmVudHMgPSByZXF1aXJlKCcuL3BhcnNlX2V2ZW50cycpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9zY2hlZHVsZXIgPSByZXF1aXJlKCcuL3NjaGVkdWxlcicpO1xuXG52YXIgX3NjaGVkdWxlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zY2hlZHVsZXIpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF9zb25nX2Zyb21fbWlkaWZpbGUgPSByZXF1aXJlKCcuL3NvbmdfZnJvbV9taWRpZmlsZScpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9wb3NpdGlvbiA9IHJlcXVpcmUoJy4vcG9zaXRpb24nKTtcblxudmFyIF9wbGF5aGVhZCA9IHJlcXVpcmUoJy4vcGxheWhlYWQnKTtcblxudmFyIF9tZXRyb25vbWUgPSByZXF1aXJlKCcuL21ldHJvbm9tZScpO1xuXG52YXIgX2V2ZW50bGlzdGVuZXIgPSByZXF1aXJlKCcuL2V2ZW50bGlzdGVuZXInKTtcblxudmFyIF9zZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBzb25nSW5kZXggPSAwO1xudmFyIHJlY29yZGluZ0luZGV4ID0gMDtcblxuLypcbnR5cGUgc29uZ1NldHRpbmdzID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIHBwcTogbnVtYmVyLFxuICBicG06IG51bWJlcixcbiAgYmFyczogbnVtYmVyLFxuICBsb3dlc3ROb3RlOiBudW1iZXIsXG4gIGhpZ2hlc3ROb3RlOiBudW1iZXIsXG4gIG5vbWluYXRvcjogbnVtYmVyLFxuICBkZW5vbWluYXRvcjogbnVtYmVyLFxuICBxdWFudGl6ZVZhbHVlOiBudW1iZXIsXG4gIGZpeGVkTGVuZ3RoVmFsdWU6IG51bWJlcixcbiAgcG9zaXRpb25UeXBlOiBzdHJpbmcsXG4gIHVzZU1ldHJvbm9tZTogYm9vbGVhbixcbiAgYXV0b1NpemU6IGJvb2xlYW4sXG4gIGxvb3A6IGJvb2xlYW4sXG4gIHBsYXliYWNrU3BlZWQ6IG51bWJlcixcbiAgYXV0b1F1YW50aXplOiBib29sZWFuXG59XG4qL1xuXG52YXIgU29uZyA9IGV4cG9ydHMuU29uZyA9IGZ1bmN0aW9uICgpIHtcbiAgX2NyZWF0ZUNsYXNzKFNvbmcsIG51bGwsIFt7XG4gICAga2V5OiAnZnJvbU1JRElGaWxlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZnJvbU1JRElGaWxlKGRhdGEpIHtcbiAgICAgIHJldHVybiAoMCwgX3NvbmdfZnJvbV9taWRpZmlsZS5zb25nRnJvbU1JRElGaWxlKShkYXRhKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdmcm9tTUlESUZpbGVBc3luYycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZyb21NSURJRmlsZUFzeW5jKGRhdGEpIHtcbiAgICAgIHJldHVybiAoMCwgX3NvbmdfZnJvbV9taWRpZmlsZS5zb25nRnJvbU1JRElGaWxlQXN5bmMpKGRhdGEpO1xuICAgIH1cbiAgfV0pO1xuXG4gIGZ1bmN0aW9uIFNvbmcoKSB7XG4gICAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU29uZyk7XG5cbiAgICB0aGlzLmlkID0gJ1NfJyArIHNvbmdJbmRleCsrICsgJ18nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICB2YXIgX3NldHRpbmdzJG5hbWUgPSBzZXR0aW5ncy5uYW1lO1xuICAgIHRoaXMubmFtZSA9IF9zZXR0aW5ncyRuYW1lID09PSB1bmRlZmluZWQgPyB0aGlzLmlkIDogX3NldHRpbmdzJG5hbWU7XG4gICAgdmFyIF9zZXR0aW5ncyRwcHEgPSBzZXR0aW5ncy5wcHE7XG4gICAgdGhpcy5wcHEgPSBfc2V0dGluZ3MkcHBxID09PSB1bmRlZmluZWQgPyBfc2V0dGluZ3MuZGVmYXVsdFNvbmcucHBxIDogX3NldHRpbmdzJHBwcTtcbiAgICB2YXIgX3NldHRpbmdzJGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgICB0aGlzLmJwbSA9IF9zZXR0aW5ncyRicG0gPT09IHVuZGVmaW5lZCA/IF9zZXR0aW5ncy5kZWZhdWx0U29uZy5icG0gOiBfc2V0dGluZ3MkYnBtO1xuICAgIHZhciBfc2V0dGluZ3MkYmFycyA9IHNldHRpbmdzLmJhcnM7XG4gICAgdGhpcy5iYXJzID0gX3NldHRpbmdzJGJhcnMgPT09IHVuZGVmaW5lZCA/IF9zZXR0aW5ncy5kZWZhdWx0U29uZy5iYXJzIDogX3NldHRpbmdzJGJhcnM7XG4gICAgdmFyIF9zZXR0aW5ncyRub21pbmF0b3IgPSBzZXR0aW5ncy5ub21pbmF0b3I7XG4gICAgdGhpcy5ub21pbmF0b3IgPSBfc2V0dGluZ3Mkbm9taW5hdG9yID09PSB1bmRlZmluZWQgPyBfc2V0dGluZ3MuZGVmYXVsdFNvbmcubm9taW5hdG9yIDogX3NldHRpbmdzJG5vbWluYXRvcjtcbiAgICB2YXIgX3NldHRpbmdzJGRlbm9taW5hdG9yID0gc2V0dGluZ3MuZGVub21pbmF0b3I7XG4gICAgdGhpcy5kZW5vbWluYXRvciA9IF9zZXR0aW5ncyRkZW5vbWluYXRvciA9PT0gdW5kZWZpbmVkID8gX3NldHRpbmdzLmRlZmF1bHRTb25nLmRlbm9taW5hdG9yIDogX3NldHRpbmdzJGRlbm9taW5hdG9yO1xuICAgIHZhciBfc2V0dGluZ3MkcXVhbnRpemVWYWwgPSBzZXR0aW5ncy5xdWFudGl6ZVZhbHVlO1xuICAgIHRoaXMucXVhbnRpemVWYWx1ZSA9IF9zZXR0aW5ncyRxdWFudGl6ZVZhbCA9PT0gdW5kZWZpbmVkID8gX3NldHRpbmdzLmRlZmF1bHRTb25nLnF1YW50aXplVmFsdWUgOiBfc2V0dGluZ3MkcXVhbnRpemVWYWw7XG4gICAgdmFyIF9zZXR0aW5ncyRmaXhlZExlbmd0aCA9IHNldHRpbmdzLmZpeGVkTGVuZ3RoVmFsdWU7XG4gICAgdGhpcy5maXhlZExlbmd0aFZhbHVlID0gX3NldHRpbmdzJGZpeGVkTGVuZ3RoID09PSB1bmRlZmluZWQgPyBfc2V0dGluZ3MuZGVmYXVsdFNvbmcuZml4ZWRMZW5ndGhWYWx1ZSA6IF9zZXR0aW5ncyRmaXhlZExlbmd0aDtcbiAgICB2YXIgX3NldHRpbmdzJHVzZU1ldHJvbm9tID0gc2V0dGluZ3MudXNlTWV0cm9ub21lO1xuICAgIHRoaXMudXNlTWV0cm9ub21lID0gX3NldHRpbmdzJHVzZU1ldHJvbm9tID09PSB1bmRlZmluZWQgPyBfc2V0dGluZ3MuZGVmYXVsdFNvbmcudXNlTWV0cm9ub21lIDogX3NldHRpbmdzJHVzZU1ldHJvbm9tO1xuICAgIHZhciBfc2V0dGluZ3MkYXV0b1NpemUgPSBzZXR0aW5ncy5hdXRvU2l6ZTtcbiAgICB0aGlzLmF1dG9TaXplID0gX3NldHRpbmdzJGF1dG9TaXplID09PSB1bmRlZmluZWQgPyBfc2V0dGluZ3MuZGVmYXVsdFNvbmcuYXV0b1NpemUgOiBfc2V0dGluZ3MkYXV0b1NpemU7XG4gICAgdmFyIF9zZXR0aW5ncyRsb29wID0gc2V0dGluZ3MubG9vcDtcbiAgICB0aGlzLmxvb3AgPSBfc2V0dGluZ3MkbG9vcCA9PT0gdW5kZWZpbmVkID8gX3NldHRpbmdzLmRlZmF1bHRTb25nLmxvb3AgOiBfc2V0dGluZ3MkbG9vcDtcbiAgICB2YXIgX3NldHRpbmdzJHBsYXliYWNrU3BlID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgICB0aGlzLnBsYXliYWNrU3BlZWQgPSBfc2V0dGluZ3MkcGxheWJhY2tTcGUgPT09IHVuZGVmaW5lZCA/IF9zZXR0aW5ncy5kZWZhdWx0U29uZy5wbGF5YmFja1NwZWVkIDogX3NldHRpbmdzJHBsYXliYWNrU3BlO1xuICAgIHZhciBfc2V0dGluZ3MkYXV0b1F1YW50aXogPSBzZXR0aW5ncy5hdXRvUXVhbnRpemU7XG4gICAgdGhpcy5hdXRvUXVhbnRpemUgPSBfc2V0dGluZ3MkYXV0b1F1YW50aXogPT09IHVuZGVmaW5lZCA/IF9zZXR0aW5ncy5kZWZhdWx0U29uZy5hdXRvUXVhbnRpemUgOiBfc2V0dGluZ3MkYXV0b1F1YW50aXo7XG5cblxuICAgIHRoaXMuX3RpbWVFdmVudHMgPSBbbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCgwLCBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLlRFTVBPLCB0aGlzLmJwbSksIG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQoMCwgX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSwgdGhpcy5ub21pbmF0b3IsIHRoaXMuZGVub21pbmF0b3IpXTtcblxuICAgIC8vdGhpcy5fdGltZUV2ZW50cyA9IFtdXG4gICAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IHRydWU7XG4gICAgdGhpcy5fbGFzdEV2ZW50ID0gbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCgwLCBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLkVORF9PRl9UUkFDSyk7XG5cbiAgICB0aGlzLl90cmFja3MgPSBbXTtcbiAgICB0aGlzLl90cmFja3NCeUlkID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fcGFydHMgPSBbXTtcbiAgICB0aGlzLl9wYXJ0c0J5SWQgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9ldmVudHMgPSBbXTtcbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fYWxsRXZlbnRzID0gW107IC8vIE1JREkgZXZlbnRzIGFuZCBtZXRyb25vbWUgZXZlbnRzXG5cbiAgICB0aGlzLl9ub3RlcyA9IFtdO1xuICAgIHRoaXMuX25vdGVzQnlJZCA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX25ld0V2ZW50cyA9IFtdO1xuICAgIHRoaXMuX21vdmVkRXZlbnRzID0gW107XG4gICAgdGhpcy5fcmVtb3ZlZEV2ZW50cyA9IFtdO1xuICAgIHRoaXMuX3RyYW5zcG9zZWRFdmVudHMgPSBbXTtcblxuICAgIHRoaXMuX25ld1BhcnRzID0gW107XG4gICAgdGhpcy5fY2hhbmdlZFBhcnRzID0gW107XG4gICAgdGhpcy5fcmVtb3ZlZFBhcnRzID0gW107XG5cbiAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gMDtcbiAgICB0aGlzLl9zY2hlZHVsZXIgPSBuZXcgX3NjaGVkdWxlcjIuZGVmYXVsdCh0aGlzKTtcbiAgICB0aGlzLl9wbGF5aGVhZCA9IG5ldyBfcGxheWhlYWQuUGxheWhlYWQodGhpcyk7XG5cbiAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMucmVjb3JkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlO1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG5cbiAgICB0aGlzLnZvbHVtZSA9IDAuNTtcbiAgICB0aGlzLl9vdXRwdXQgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lO1xuICAgIHRoaXMuX291dHB1dC5jb25uZWN0KF9pbml0X2F1ZGlvLm1hc3RlckdhaW4pO1xuXG4gICAgdGhpcy5fbWV0cm9ub21lID0gbmV3IF9tZXRyb25vbWUuTWV0cm9ub21lKHRoaXMpO1xuICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9IFtdO1xuICAgIHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyA9IHRydWU7XG5cbiAgICB0aGlzLl9sb29wID0gZmFsc2U7XG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7IG1pbGxpczogMCwgdGlja3M6IDAgfTtcbiAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7IG1pbGxpczogMCwgdGlja3M6IDAgfTtcbiAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IGZhbHNlO1xuICAgIHRoaXMuX2xvb3BEdXJhdGlvbiA9IDA7XG4gICAgdGhpcy5fcHJlY291bnRCYXJzID0gMDtcbiAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDA7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoU29uZywgW3tcbiAgICBrZXk6ICdhZGRUaW1lRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkVGltZUV2ZW50cygpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgZXZlbnRzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICAvL0BUT0RPOiBmaWx0ZXIgdGltZSBldmVudHMgb24gdGhlIHNhbWUgdGljayAtPiB1c2UgdGhlIGxhc3RseSBhZGRlZCBldmVudHNcbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSkge1xuICAgICAgICAgIF90aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLl90aW1lRXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhZGRUcmFja3MnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRUcmFja3MoKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCB0cmFja3MgPSBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICB0cmFja3NbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICAgIH1cblxuICAgICAgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICAgIHZhciBfbmV3RXZlbnRzLCBfbmV3UGFydHM7XG5cbiAgICAgICAgdHJhY2suX3NvbmcgPSBfdGhpczI7XG4gICAgICAgIHRyYWNrLmNvbm5lY3QoX3RoaXMyLl9vdXRwdXQpO1xuICAgICAgICBfdGhpczIuX3RyYWNrcy5wdXNoKHRyYWNrKTtcbiAgICAgICAgX3RoaXMyLl90cmFja3NCeUlkLnNldCh0cmFjay5pZCwgdHJhY2spO1xuICAgICAgICAoX25ld0V2ZW50cyA9IF90aGlzMi5fbmV3RXZlbnRzKS5wdXNoLmFwcGx5KF9uZXdFdmVudHMsIF90b0NvbnN1bWFibGVBcnJheSh0cmFjay5fZXZlbnRzKSk7XG4gICAgICAgIChfbmV3UGFydHMgPSBfdGhpczIuX25ld1BhcnRzKS5wdXNoLmFwcGx5KF9uZXdQYXJ0cywgX3RvQ29uc3VtYWJsZUFycmF5KHRyYWNrLl9wYXJ0cykpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gcHJlcGFyZSBzb25nIGV2ZW50cyBmb3IgcGxheWJhY2tcblxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIHZhciBjcmVhdGVFdmVudEFycmF5ID0gZmFsc2U7XG5cbiAgICAgIGlmICh0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSBmYWxzZSAmJiB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9uZXdFdmVudHMubGVuZ3RoID09PSAwICYmIHRoaXMuX21vdmVkRXZlbnRzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9uZXdQYXJ0cy5sZW5ndGggPT09IDAgJiYgdGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvL2RlYnVnXG4gICAgICAvL3RoaXMuaXNQbGF5aW5nID0gdHJ1ZVxuXG4gICAgICBjb25zb2xlLmdyb3VwKCd1cGRhdGUgc29uZycpO1xuICAgICAgY29uc29sZS50aW1lKCd0b3RhbCcpO1xuXG4gICAgICAvLyBjaGVjayBpZiB0aW1lIGV2ZW50cyBhcmUgdXBkYXRlZFxuICAgICAgaWYgKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IHRydWUpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygndXBkYXRlVGltZUV2ZW50cycsIHRoaXMuX3RpbWVFdmVudHMubGVuZ3RoKVxuICAgICAgICAoMCwgX3BhcnNlX2V2ZW50cy5wYXJzZVRpbWVFdmVudHMpKHRoaXMsIHRoaXMuX3RpbWVFdmVudHMsIHRoaXMuaXNQbGF5aW5nKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IGZhbHNlO1xuICAgICAgICBjb25zb2xlLmxvZygndGltZSBldmVudHMgJU8nLCB0aGlzLl90aW1lRXZlbnRzKTtcbiAgICAgIH1cblxuICAgICAgLy8gb25seSBwYXJzZSBuZXcgYW5kIG1vdmVkIGV2ZW50c1xuICAgICAgdmFyIHRvYmVQYXJzZWQgPSBbXTtcblxuICAgICAgLy8gZmlsdGVyIHJlbW92ZWQgcGFydHNcbiAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmVkIHBhcnRzICVPJywgdGhpcy5fcmVtb3ZlZFBhcnRzKTtcbiAgICAgIHRoaXMuX3JlbW92ZWRQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHZhciBfcmVtb3ZlZEV2ZW50cztcblxuICAgICAgICBfdGhpczMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCk7XG4gICAgICAgIChfcmVtb3ZlZEV2ZW50cyA9IF90aGlzMy5fcmVtb3ZlZEV2ZW50cykucHVzaC5hcHBseShfcmVtb3ZlZEV2ZW50cywgX3RvQ29uc3VtYWJsZUFycmF5KHBhcnQuX2V2ZW50cykpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIGFkZCBuZXcgcGFydHNcbiAgICAgIGNvbnNvbGUubG9nKCduZXcgcGFydHMgJU8nLCB0aGlzLl9uZXdQYXJ0cyk7XG4gICAgICB0aGlzLl9uZXdQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHBhcnQuX3NvbmcgPSBfdGhpczM7XG4gICAgICAgIF90aGlzMy5fcGFydHNCeUlkLnNldChwYXJ0LmlkLCBwYXJ0KTtcbiAgICAgICAgLy90aGlzLl9uZXdFdmVudHMucHVzaCguLi5wYXJ0Ll9ldmVudHMpXG4gICAgICAgIHBhcnQudXBkYXRlKCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gdXBkYXRlIGNoYW5nZWQgcGFydHNcbiAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2VkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKTtcbiAgICAgIHRoaXMuX2NoYW5nZWRQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHBhcnQudXBkYXRlKCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gcmVtb3ZlIGV2ZW50cyBmcm9tIHJlbW92ZWQgcGFydHNcbiAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2VkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKTtcbiAgICAgIHRoaXMuX3JlbW92ZWRQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHZhciBfcmVtb3ZlZEV2ZW50czI7XG5cbiAgICAgICAgKF9yZW1vdmVkRXZlbnRzMiA9IF90aGlzMy5fcmVtb3ZlZEV2ZW50cykucHVzaC5hcHBseShfcmVtb3ZlZEV2ZW50czIsIF90b0NvbnN1bWFibGVBcnJheShwYXJ0Ll9ldmVudHMpKTtcbiAgICAgICAgX3RoaXMzLl9wYXJ0c0J5SWQuZGVsZXRlKHBhcnQuaWQpO1xuICAgICAgICBwYXJ0LnVwZGF0ZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLl9yZW1vdmVkUGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl9wYXJ0cyA9IEFycmF5LmZyb20odGhpcy5fcGFydHNCeUlkLnZhbHVlcygpKTtcbiAgICAgIH1cblxuICAgICAgLy8gZmlsdGVyIHJlbW92ZWQgZXZlbnRzXG4gICAgICBjb25zb2xlLmxvZygncmVtb3ZlZCBldmVudHMgJU8nLCB0aGlzLl9yZW1vdmVkRXZlbnRzKTtcbiAgICAgIHRoaXMuX3JlbW92ZWRFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgX3RoaXMzLl9ub3Rlc0J5SWQuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlLmlkKTtcbiAgICAgICAgX3RoaXMzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZCk7XG4gICAgICB9KTtcblxuICAgICAgY3JlYXRlRXZlbnRBcnJheSA9IHRoaXMuX3JlbW92ZWRFdmVudHMubGVuZ3RoID4gMDtcblxuICAgICAgLy8gYWRkIG5ldyBldmVudHNcbiAgICAgIGNvbnNvbGUubG9nKCduZXcgZXZlbnRzICVPJywgdGhpcy5fbmV3RXZlbnRzKTtcbiAgICAgIHRoaXMuX25ld0V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBfdGhpczMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudCk7XG4gICAgICAgIF90aGlzMy5fZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmlkKVxuICAgICAgfSk7XG5cbiAgICAgIC8vIG1vdmVkIGV2ZW50cyBuZWVkIHRvIGJlIHBhcnNlZFxuICAgICAgY29uc29sZS5sb2coJ21vdmVkICVPJywgdGhpcy5fbW92ZWRFdmVudHMpO1xuICAgICAgdGhpcy5fbW92ZWRFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdG9iZVBhcnNlZC5wdXNoKGV2ZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICAvL3RvYmVQYXJzZWQgPSBbLi4udG9iZVBhcnNlZCwgLi4uQXJyYXkuZnJvbShzb25nLm1vdmVkRXZlbnRzLnZhbHVlcygpKV1cblxuICAgICAgY29uc29sZS50aW1lKCdwYXJzZScpO1xuICAgICAgaWYgKHRvYmVQYXJzZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCd0b2JlUGFyc2VkICVPJywgdG9iZVBhcnNlZClcbiAgICAgICAgdG9iZVBhcnNlZCA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodG9iZVBhcnNlZCksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl90aW1lRXZlbnRzKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycsIHRvYmVQYXJzZWQubGVuZ3RoIC0gdGhpcy5fdGltZUV2ZW50cy5sZW5ndGgpO1xuICAgICAgICAoMCwgX3BhcnNlX2V2ZW50cy5wYXJzZUV2ZW50cykodG9iZVBhcnNlZCwgdGhpcy5pc1BsYXlpbmcpO1xuICAgICAgICB0b2JlUGFyc2VkLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5pZCwgZXZlbnQudHlwZSwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IF9jb25zdGFudHMuTUlESUV2ZW50VHlwZXMuTk9URV9PTikge1xuICAgICAgICAgICAgaWYgKGV2ZW50Lm1pZGlOb3RlKSB7XG4gICAgICAgICAgICAgIF90aGlzMy5fbm90ZXNCeUlkLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSk7XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQudHlwZSlcbiAgICAgICAgICAgICAgLy90aGlzLl9ub3Rlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX25vdGVzID0gQXJyYXkuZnJvbSh0aGlzLl9ub3Rlc0J5SWQudmFsdWVzKCkpO1xuICAgICAgfVxuICAgICAgY29uc29sZS50aW1lRW5kKCdwYXJzZScpO1xuXG4gICAgICBpZiAoY3JlYXRlRXZlbnRBcnJheSkge1xuICAgICAgICBjb25zb2xlLnRpbWUoJ3RvIGFycmF5Jyk7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSk7XG4gICAgICAgIHRoaXMuX25vdGVzID0gQXJyYXkuZnJvbSh0aGlzLl9ub3Rlc0J5SWQudmFsdWVzKCkpO1xuICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ3RvIGFycmF5Jyk7XG4gICAgICB9XG4gICAgICAvL2RlYnVnZ2VyXG5cbiAgICAgIGNvbnNvbGUudGltZSgnc29ydGluZyAnICsgdGhpcy5fZXZlbnRzLmxlbmd0aCArICcgZXZlbnRzJyk7XG4gICAgICAoMCwgX3V0aWwuc29ydEV2ZW50cykodGhpcy5fZXZlbnRzKTtcbiAgICAgIHRoaXMuX25vdGVzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEubm90ZU9uLnRpY2tzIC0gYi5ub3RlT24udGlja3M7XG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUudGltZUVuZCgnc29ydGluZyAnICsgdGhpcy5fZXZlbnRzLmxlbmd0aCArICcgZXZlbnRzJyk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdub3RlcyAlTycsIHRoaXMuX25vdGVzKTtcblxuICAgICAgY29uc29sZS50aW1lRW5kKCd0b3RhbCcpO1xuICAgICAgY29uc29sZS5ncm91cEVuZCgndXBkYXRlIHNvbmcnKTtcbiAgICAgIGNvbnNvbGUudGltZUVuZCgndXBkYXRlIHNvbmcnKTtcblxuICAgICAgLy8gZ2V0IHRoZSBsYXN0IGV2ZW50IG9mIHRoaXMgc29uZ1xuICAgICAgdmFyIGxhc3RFdmVudCA9IHRoaXMuX2V2ZW50c1t0aGlzLl9ldmVudHMubGVuZ3RoIC0gMV07XG4gICAgICB2YXIgbGFzdFRpbWVFdmVudCA9IHRoaXMuX3RpbWVFdmVudHNbdGhpcy5fdGltZUV2ZW50cy5sZW5ndGggLSAxXTtcbiAgICAgIGlmIChsYXN0RXZlbnQgaW5zdGFuY2VvZiBfbWlkaV9ldmVudC5NSURJRXZlbnQgPT09IGZhbHNlKSB7XG4gICAgICAgIGxhc3RFdmVudCA9IGxhc3RUaW1lRXZlbnQ7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RUaW1lRXZlbnQudGlja3MgPiBsYXN0RXZlbnQudGlja3MpIHtcbiAgICAgICAgbGFzdEV2ZW50ID0gbGFzdFRpbWVFdmVudDtcbiAgICAgIH1cblxuICAgICAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBkYXRhIG9mIHRoZSBmaXJzdCBiZWF0IGluIHRoZSBiYXIgYWZ0ZXIgdGhlIGxhc3QgYmFyXG4gICAgICB0aGlzLmJhcnMgPSBNYXRoLm1heChsYXN0RXZlbnQuYmFyLCB0aGlzLmJhcnMpO1xuICAgICAgLy9jb25zb2xlLmxvZygnbnVtIGJhcnMnLCB0aGlzLmJhcnMsIGxhc3RFdmVudClcbiAgICAgIHZhciB0aWNrcyA9ICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMsIHtcbiAgICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAgIHRhcmdldDogW3RoaXMuYmFycyArIDFdLFxuICAgICAgICByZXN1bHQ6ICd0aWNrcydcbiAgICAgIH0pLnRpY2tzO1xuXG4gICAgICAvLyB3ZSB3YW50IHRvIHB1dCB0aGUgRU5EX09GX1RSQUNLIGV2ZW50IGF0IHRoZSB2ZXJ5IGxhc3QgdGljayBvZiB0aGUgbGFzdCBiYXIsIHNvIHdlIGNhbGN1bGF0ZSB0aGF0IHBvc2l0aW9uXG4gICAgICB2YXIgbWlsbGlzID0gKDAsIF9wb3NpdGlvbi5jYWxjdWxhdGVQb3NpdGlvbikodGhpcywge1xuICAgICAgICB0eXBlOiAndGlja3MnLFxuICAgICAgICB0YXJnZXQ6IHRpY2tzIC0gMSxcbiAgICAgICAgcmVzdWx0OiAnbWlsbGlzJ1xuICAgICAgfSkubWlsbGlzO1xuXG4gICAgICB0aGlzLl9sYXN0RXZlbnQudGlja3MgPSB0aWNrcyAtIDE7XG4gICAgICB0aGlzLl9sYXN0RXZlbnQubWlsbGlzID0gbWlsbGlzO1xuXG4gICAgICBjb25zb2xlLmxvZygnbGFzdCB0aWNrJywgdGhpcy5fbGFzdEV2ZW50LnRpY2tzLCB0aGlzLl9sYXN0RXZlbnQubWlsbGlzKTtcbiAgICAgIHRoaXMuX2R1cmF0aW9uVGlja3MgPSB0aGlzLl9sYXN0RXZlbnQudGlja3M7XG4gICAgICB0aGlzLl9kdXJhdGlvbk1pbGxpcyA9IHRoaXMuX2xhc3RFdmVudC5taWxsaXM7XG4gICAgICB0aGlzLl9wbGF5aGVhZC51cGRhdGVTb25nKCk7XG5cbiAgICAgIGlmICh0aGlzLnBsYXlpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGFkZCBtZXRyb25vbWUgZXZlbnRzXG4gICAgICBpZiAodGhpcy5fdXBkYXRlTWV0cm9ub21lRXZlbnRzIHx8IHRoaXMuX21ldHJvbm9tZS5iYXJzICE9PSB0aGlzLmJhcnMpIHtcbiAgICAgICAgdGhpcy5fbWV0cm9ub21lRXZlbnRzID0gKDAsIF9wYXJzZV9ldmVudHMucGFyc2VFdmVudHMpKFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fdGltZUV2ZW50cyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKCkpKSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9hbGxFdmVudHMgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX21ldHJvbm9tZUV2ZW50cyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgICAgICgwLCBfdXRpbC5zb3J0RXZlbnRzKSh0aGlzLl9hbGxFdmVudHMpO1xuICAgICAgLy9jb25zb2xlLmxvZygnYWxsIGV2ZW50cyAlTycsIHRoaXMuX2FsbEV2ZW50cylcblxuICAgICAgdGhpcy5fbmV3UGFydHMgPSBbXTtcbiAgICAgIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdO1xuICAgICAgdGhpcy5fbmV3RXZlbnRzID0gW107XG4gICAgICB0aGlzLl9tb3ZlZEV2ZW50cyA9IFtdO1xuICAgICAgdGhpcy5fcmVtb3ZlZEV2ZW50cyA9IFtdO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3BsYXknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwbGF5KHR5cGUpIHtcbiAgICAgIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4zID4gMSA/IF9sZW4zIC0gMSA6IDApLCBfa2V5MyA9IDE7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcbiAgICAgICAgYXJnc1tfa2V5MyAtIDFdID0gYXJndW1lbnRzW19rZXkzXTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGxheS5hcHBseSh0aGlzLCBbdHlwZV0uY29uY2F0KGFyZ3MpKTtcbiAgICAgIGlmICh0aGlzLl9wcmVjb3VudEJhcnMgPiAwKSB7XG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdwcmVjb3VudGluZycsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXMgfSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID09PSB0cnVlKSB7XG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdzdGFydF9yZWNvcmRpbmcnLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3BsYXknLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19wbGF5JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3BsYXkodHlwZSkge1xuICAgICAgaWYgKHR5cGVvZiB0eXBlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBmb3IgKHZhciBfbGVuNCA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuNCA+IDEgPyBfbGVuNCAtIDEgOiAwKSwgX2tleTQgPSAxOyBfa2V5NCA8IF9sZW40OyBfa2V5NCsrKSB7XG4gICAgICAgICAgYXJnc1tfa2V5NCAtIDFdID0gYXJndW1lbnRzW19rZXk0XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24uYXBwbHkodGhpcywgW3R5cGVdLmNvbmNhdChhcmdzKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wbGF5aW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcmVmZXJlbmNlID0gdGhpcy5fdGltZVN0YW1wID0gX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7XG4gICAgICB0aGlzLl9zY2hlZHVsZXIuc2V0VGltZVN0YW1wKHRoaXMuX3JlZmVyZW5jZSk7XG4gICAgICB0aGlzLl9zdGFydE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXM7XG5cbiAgICAgIGlmICh0aGlzLl9wcmVjb3VudEJhcnMgPiAwICYmIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nKSB7XG4gICAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gdGhpcy5fY3VycmVudE1pbGxpcyArIHRoaXMuX21ldHJvbm9tZS5jcmVhdGVQcmVjb3VudEV2ZW50cyh0aGlzLl9wcmVjb3VudEJhcnMsIHRoaXMuX3JlZmVyZW5jZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2VuZFByZWNvdW50TWlsbGlzJywgdGhpcy5fZW5kUHJlY291bnRNaWxsaXMpXG4gICAgICAgIHRoaXMucHJlY291bnRpbmcgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPSAwO1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnJlY29yZGluZyA9IHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2NoZWR1bGVyLmluaXQodGhpcy5fY3VycmVudE1pbGxpcyk7XG4gICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpO1xuICAgICAgdGhpcy5fcHVsc2UoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdwYXVzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHBhdXNlKCkge1xuICAgICAgdGhpcy5wYXVzZWQgPSAhdGhpcy5wYXVzZWQ7XG4gICAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKTtcbiAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3BhdXNlJywgZGF0YTogdGhpcy5wYXVzZWQgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3BhdXNlJywgZGF0YTogdGhpcy5wYXVzZWQgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc3RvcCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmFsbE5vdGVzT2ZmKCk7XG4gICAgICBpZiAodGhpcy5wbGF5aW5nIHx8IHRoaXMucGF1c2VkKSB7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2N1cnJlbnRNaWxsaXMgIT09IDApIHtcbiAgICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDA7XG4gICAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcyk7XG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykge1xuICAgICAgICAgIHRoaXMuc3RvcFJlY29yZGluZygpO1xuICAgICAgICB9XG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdzdG9wJyB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzdGFydFJlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0UmVjb3JkaW5nKCkge1xuICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgIGlmICh0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9yZWNvcmRJZCA9ICdyZWNvcmRpbmdfJyArIHJlY29yZGluZ0luZGV4KysgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xuICAgICAgICB0cmFjay5fc3RhcnRSZWNvcmRpbmcoX3RoaXM0Ll9yZWNvcmRJZCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzdG9wUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcFJlY29yZGluZygpIHtcbiAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xuICAgICAgICB0cmFjay5fc3RvcFJlY29yZGluZyhfdGhpczUuX3JlY29yZElkKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3N0b3BfcmVjb3JkaW5nJyB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1bmRvUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5kb1JlY29yZGluZygpIHtcbiAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuXG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2sudW5kb1JlY29yZGluZyhfdGhpczYuX3JlY29yZElkKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZWRvUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVkb1JlY29yZGluZygpIHtcbiAgICAgIHZhciBfdGhpczcgPSB0aGlzO1xuXG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2sucmVkb1JlY29yZGluZyhfdGhpczcuX3JlY29yZElkKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRNZXRyb25vbWUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRNZXRyb25vbWUoZmxhZykge1xuICAgICAgaWYgKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9ICF0aGlzLnVzZU1ldHJvbm9tZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXNlTWV0cm9ub21lID0gZmxhZztcbiAgICAgIH1cbiAgICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKHRoaXMudXNlTWV0cm9ub21lKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb25maWd1cmVNZXRyb25vbWUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb25maWd1cmVNZXRyb25vbWUoY29uZmlnKSB7XG4gICAgICB0aGlzLl9tZXRyb25vbWUuY29uZmlndXJlKGNvbmZpZyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWxsTm90ZXNPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhbGxOb3Rlc09mZigpIHtcbiAgICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xuICAgICAgICB0cmFjay5hbGxOb3Rlc09mZigpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vdGhpcy5fc2NoZWR1bGVyLmFsbE5vdGVzT2ZmKClcbiAgICAgIHRoaXMuX21ldHJvbm9tZS5hbGxOb3Rlc09mZigpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldFRyYWNrcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFRyYWNrcygpIHtcbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX3RyYWNrcykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldFBhcnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UGFydHMoKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9wYXJ0cykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50cygpIHtcbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldE5vdGVzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Tm90ZXMoKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ub3RlcykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NhbGN1bGF0ZVBvc2l0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb24oYXJncykge1xuICAgICAgcmV0dXJuICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMsIGFyZ3MpO1xuICAgIH1cblxuICAgIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cblxuICB9LCB7XG4gICAga2V5OiAnc2V0UG9zaXRpb24nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQb3NpdGlvbih0eXBlKSB7XG5cbiAgICAgIHZhciB3YXNQbGF5aW5nID0gdGhpcy5wbGF5aW5nO1xuICAgICAgaWYgKHRoaXMucGxheWluZykge1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hbGxOb3Rlc09mZigpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBfbGVuNSA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuNSA+IDEgPyBfbGVuNSAtIDEgOiAwKSwgX2tleTUgPSAxOyBfa2V5NSA8IF9sZW41OyBfa2V5NSsrKSB7XG4gICAgICAgIGFyZ3NbX2tleTUgLSAxXSA9IGFyZ3VtZW50c1tfa2V5NV07XG4gICAgICB9XG5cbiAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKTtcbiAgICAgIC8vbGV0IG1pbGxpcyA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdtaWxsaXMnKVxuICAgICAgaWYgKHBvc2l0aW9uID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSBwb3NpdGlvbi5taWxsaXM7XG5cbiAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICAgIGRhdGE6IHBvc2l0aW9uXG4gICAgICB9KTtcblxuICAgICAgaWYgKHdhc1BsYXlpbmcpIHtcbiAgICAgICAgdGhpcy5fcGxheSgpO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZygnc2V0UG9zaXRpb24nLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldFBvc2l0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UG9zaXRpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGxheWhlYWQuZ2V0KCkucG9zaXRpb247XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0UGxheWhlYWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQbGF5aGVhZCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKTtcbiAgICB9XG5cbiAgICAvLyBAYXJncyAtPiBzZWUgX2NhbGN1bGF0ZVBvc2l0aW9uXG5cbiAgfSwge1xuICAgIGtleTogJ3NldExlZnRMb2NhdG9yJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0TGVmdExvY2F0b3IodHlwZSkge1xuICAgICAgZm9yICh2YXIgX2xlbjYgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjYgPiAxID8gX2xlbjYgLSAxIDogMCksIF9rZXk2ID0gMTsgX2tleTYgPCBfbGVuNjsgX2tleTYrKykge1xuICAgICAgICBhcmdzW19rZXk2IC0gMV0gPSBhcmd1bWVudHNbX2tleTZdO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKTtcblxuICAgICAgaWYgKHRoaXMuX2xlZnRMb2NhdG9yID09PSBmYWxzZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcG9zaXRpb24gZm9yIGxvY2F0b3InKTtcbiAgICAgICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7IG1pbGxpczogMCwgdGlja3M6IDAgfTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cblxuICB9LCB7XG4gICAga2V5OiAnc2V0UmlnaHRMb2NhdG9yJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UmlnaHRMb2NhdG9yKHR5cGUpIHtcbiAgICAgIGZvciAodmFyIF9sZW43ID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW43ID4gMSA/IF9sZW43IC0gMSA6IDApLCBfa2V5NyA9IDE7IF9rZXk3IDwgX2xlbjc7IF9rZXk3KyspIHtcbiAgICAgICAgYXJnc1tfa2V5NyAtIDFdID0gYXJndW1lbnRzW19rZXk3XTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcmlnaHRMb2NhdG9yID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpO1xuXG4gICAgICBpZiAodGhpcy5fcmlnaHRMb2NhdG9yID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7IG1pbGxpczogMCwgdGlja3M6IDAgfTtcbiAgICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIHBvc2l0aW9uIGZvciBsb2NhdG9yJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRMb29wJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0TG9vcCgpIHtcbiAgICAgIHZhciBmbGFnID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcblxuXG4gICAgICB0aGlzLl9sb29wID0gZmxhZyAhPT0gbnVsbCA/IGZsYWcgOiAhdGhpcy5fbG9vcDtcblxuICAgICAgaWYgKHRoaXMuX3JpZ2h0TG9jYXRvciA9PT0gZmFsc2UgfHwgdGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGxvY2F0b3JzIGNhbiBub3QgKHlldCkgYmUgdXNlZCB0byBqdW1wIG92ZXIgYSBzZWdtZW50XG4gICAgICBpZiAodGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcyA8PSB0aGlzLl9sZWZ0TG9jYXRvci5taWxsaXMpIHtcbiAgICAgICAgdGhpcy5faWxsZWdhbExvb3AgPSB0cnVlO1xuICAgICAgICB0aGlzLl9sb29wID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fbG9vcER1cmF0aW9uID0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAtIHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcztcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5fbG9vcCwgdGhpcy5fbG9vcER1cmF0aW9uKVxuICAgICAgdGhpcy5fc2NoZWR1bGVyLmJleW9uZExvb3AgPSB0aGlzLl9jdXJyZW50TWlsbGlzID4gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcztcbiAgICAgIHJldHVybiB0aGlzLl9sb29wO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFByZWNvdW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UHJlY291bnQoKSB7XG4gICAgICB2YXIgdmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICB0aGlzLl9wcmVjb3VudEJhcnMgPSB2YWx1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfcHVsc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfcHVsc2UoKSB7XG4gICAgICBpZiAodGhpcy5wbGF5aW5nID09PSBmYWxzZSAmJiB0aGlzLnByZWNvdW50aW5nID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgbm93ID0gX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7XG4gICAgICB2YXIgZGlmZiA9IG5vdyAtIHRoaXMuX3JlZmVyZW5jZTtcbiAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgKz0gZGlmZjtcbiAgICAgIHRoaXMuX3JlZmVyZW5jZSA9IG5vdztcblxuICAgICAgaWYgKHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID4gMCkge1xuICAgICAgICBpZiAodGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPiB0aGlzLl9jdXJyZW50TWlsbGlzKSB7XG4gICAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZShkaWZmKTtcbiAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcHVsc2UuYmluZCh0aGlzKSk7XG4gICAgICAgICAgLy9yZXR1cm4gYmVjYXVzZSBkdXJpbmcgcHJlY291bnRpbmcgb25seSBwcmVjb3VudCBtZXRyb25vbWUgZXZlbnRzIGdldCBzY2hlZHVsZWRcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDA7XG4gICAgICAgIGlmICh0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZykge1xuICAgICAgICAgIHRoaXMucGxheWluZyA9IHRydWU7XG4gICAgICAgICAgdGhpcy5yZWNvcmRpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucGxheWluZyA9IHRydWU7XG4gICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3BsYXknLCBkYXRhOiB0aGlzLl9zdGFydE1pbGxpcyB9KTtcbiAgICAgICAgICAvL2Rpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2xvb3AgJiYgdGhpcy5fY3VycmVudE1pbGxpcyA+PSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzKSB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgLT0gdGhpcy5fbG9vcER1cmF0aW9uO1xuICAgICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpO1xuICAgICAgICAvL3RoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzKSAvLyBwbGF5aGVhZCBpcyBhIGJpdCBhaGVhZCBvbmx5IGR1cmluZyB0aGlzIGZyYW1lXG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgdHlwZTogJ2xvb3AnLFxuICAgICAgICAgIGRhdGE6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wbGF5aGVhZC51cGRhdGUoJ21pbGxpcycsIGRpZmYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl90aWNrcyA9IHRoaXMuX3BsYXloZWFkLmdldCgpLnRpY2tzO1xuXG4gICAgICBpZiAodGhpcy5fY3VycmVudE1pbGxpcyA+PSB0aGlzLl9kdXJhdGlvbk1pbGxpcykge1xuICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKGRpZmYpO1xuXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcHVsc2UuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgIGhlbHBlciBtZXRob2Q6IGNvbnZlcnRzIHVzZXIgZnJpZW5kbHkgcG9zaXRpb24gZm9ybWF0IHRvIGludGVybmFsIGZvcm1hdFxuICAgICAgIHBvc2l0aW9uOlxuICAgICAgICAtICd0aWNrcycsIDk2MDAwXG4gICAgICAgIC0gJ21pbGxpcycsIDEyMzRcbiAgICAgICAgLSAncGVyY2VudGFnZScsIDU1XG4gICAgICAgIC0gJ2JhcnNiZWF0cycsIDEsIDQsIDAsIDI1IC0+IGJhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXG4gICAgICAgIC0gJ3RpbWUnLCAwLCAzLCA0OSwgNTY2IC0+IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX2NhbGN1bGF0ZVBvc2l0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsIHJlc3VsdFR5cGUpIHtcbiAgICAgIHZhciB0YXJnZXQgPSB2b2lkIDA7XG5cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICd0aWNrcyc6XG4gICAgICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgICAgIHRhcmdldCA9IGFyZ3NbMF0gfHwgMDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0aW1lJzpcbiAgICAgICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICAgICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgICAgICB0YXJnZXQgPSBhcmdzO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Vuc3VwcG9ydGVkIHR5cGUnKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBwb3NpdGlvbiA9ICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMsIHtcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHJlc3VsdDogcmVzdWx0VHlwZVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhZGRFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuICgwLCBfZXZlbnRsaXN0ZW5lci5hZGRFdmVudExpc3RlbmVyKSh0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpIHtcbiAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5yZW1vdmVFdmVudExpc3RlbmVyKSh0eXBlLCBpZCk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNvbmc7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5zb25nRnJvbU1JRElGaWxlID0gc29uZ0Zyb21NSURJRmlsZTtcbmV4cG9ydHMuc29uZ0Zyb21NSURJRmlsZUFzeW5jID0gc29uZ0Zyb21NSURJRmlsZUFzeW5jO1xuXG52YXIgX2lzb21vcnBoaWNGZXRjaCA9IHJlcXVpcmUoJ2lzb21vcnBoaWMtZmV0Y2gnKTtcblxudmFyIF9pc29tb3JwaGljRmV0Y2gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNvbW9ycGhpY0ZldGNoKTtcblxudmFyIF9taWRpZmlsZSA9IHJlcXVpcmUoJy4vbWlkaWZpbGUnKTtcblxudmFyIF9taWRpX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpX2V2ZW50Jyk7XG5cbnZhciBfcGFydCA9IHJlcXVpcmUoJy4vcGFydCcpO1xuXG52YXIgX3RyYWNrID0gcmVxdWlyZSgnLi90cmFjaycpO1xuXG52YXIgX3NvbmcgPSByZXF1aXJlKCcuL3NvbmcnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfZmV0Y2hfaGVscGVycyA9IHJlcXVpcmUoJy4vZmV0Y2hfaGVscGVycycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgUFBRID0gOTYwO1xuXG5mdW5jdGlvbiB0b1NvbmcocGFyc2VkKSB7XG4gIHZhciB0cmFja3MgPSBwYXJzZWQudHJhY2tzO1xuICB2YXIgcHBxID0gcGFyc2VkLmhlYWRlci50aWNrc1BlckJlYXQ7XG4gIHZhciBwcHFGYWN0b3IgPSBQUFEgLyBwcHE7IC8vQFRPRE86IGdldCBwcHEgZnJvbSBjb25maWcgLT4gb25seSBuZWNlc3NhcnkgaWYgeW91IHdhbnQgdG8gY2hhbmdlIHRoZSBwcHEgb2YgdGhlIE1JREkgZmlsZSAhXG4gIHZhciB0aW1lRXZlbnRzID0gW107XG4gIHZhciBicG0gPSAtMTtcbiAgdmFyIG5vbWluYXRvciA9IC0xO1xuICB2YXIgZGVub21pbmF0b3IgPSAtMTtcbiAgdmFyIG5ld1RyYWNrcyA9IFtdO1xuXG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHRyYWNrcy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgIHZhciB0cmFjayA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICB2YXIgbGFzdFRpY2tzID0gdm9pZCAwLFxuICAgICAgICAgIGxhc3RUeXBlID0gdm9pZCAwO1xuICAgICAgdmFyIHRpY2tzID0gMDtcbiAgICAgIHZhciB0eXBlID0gdm9pZCAwO1xuICAgICAgdmFyIGNoYW5uZWwgPSAtMTtcbiAgICAgIHZhciB0cmFja05hbWUgPSB2b2lkIDA7XG4gICAgICB2YXIgdHJhY2tJbnN0cnVtZW50TmFtZSA9IHZvaWQgMDtcbiAgICAgIHZhciBldmVudHMgPSBbXTtcblxuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSB0cmFja1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBldmVudCA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgICAgIHRpY2tzICs9IGV2ZW50LmRlbHRhVGltZSAqIHBwcUZhY3RvcjtcblxuICAgICAgICAgIGlmIChjaGFubmVsID09PSAtMSAmJiB0eXBlb2YgZXZlbnQuY2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNoYW5uZWwgPSBldmVudC5jaGFubmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0eXBlID0gZXZlbnQuc3VidHlwZTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRlbHRhVGltZSwgdGlja3MsIHR5cGUpO1xuXG4gICAgICAgICAgc3dpdGNoIChldmVudC5zdWJ0eXBlKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ3RyYWNrTmFtZSc6XG4gICAgICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdpbnN0cnVtZW50TmFtZSc6XG4gICAgICAgICAgICAgIGlmIChldmVudC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgdHJhY2tJbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MsIDB4OTAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdub3RlT2ZmJzpcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHg4MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3NldFRlbXBvJzpcbiAgICAgICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGVtcG8gZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICAgICAgdmFyIHRtcCA9IDYwMDAwMDAwIC8gZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdDtcblxuICAgICAgICAgICAgICBpZiAodGlja3MgPT09IGxhc3RUaWNrcyAmJiB0eXBlID09PSBsYXN0VHlwZSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKCd0ZW1wbyBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCB0bXApO1xuICAgICAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoYnBtID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGJwbSA9IHRtcDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHg1MSwgdG1wKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICd0aW1lU2lnbmF0dXJlJzpcbiAgICAgICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICAgICAgaWYgKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ3RpbWUgc2lnbmF0dXJlIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAobm9taW5hdG9yID09PSAtMSkge1xuICAgICAgICAgICAgICAgIG5vbWluYXRvciA9IGV2ZW50Lm51bWVyYXRvcjtcbiAgICAgICAgICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRpbWVFdmVudHMucHVzaChuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KHRpY2tzLCAweDU4LCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdjb250cm9sbGVyJzpcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHhCMCwgZXZlbnQuY29udHJvbGxlclR5cGUsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdwcm9ncmFtQ2hhbmdlJzpcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHhDMCwgZXZlbnQucHJvZ3JhbU51bWJlcikpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAncGl0Y2hCZW5kJzpcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHhFMCwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIGV2ZW50LnR5cGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxhc3RUeXBlID0gdHlwZTtcbiAgICAgICAgICBsYXN0VGlja3MgPSB0aWNrcztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy9jb25zb2xlLmNvdW50KGV2ZW50cy5sZW5ndGgpXG4gICAgICAgIHZhciBuZXdUcmFjayA9IG5ldyBfdHJhY2suVHJhY2sodHJhY2tOYW1lKTtcbiAgICAgICAgdmFyIHBhcnQgPSBuZXcgX3BhcnQuUGFydCgpO1xuICAgICAgICBuZXdUcmFjay5hZGRQYXJ0cyhwYXJ0KTtcbiAgICAgICAgcGFydC5hZGRFdmVudHMuYXBwbHkocGFydCwgZXZlbnRzKTtcbiAgICAgICAgbmV3VHJhY2tzLnB1c2gobmV3VHJhY2spO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgc29uZyA9IG5ldyBfc29uZy5Tb25nKHtcbiAgICBwcHE6IFBQUSxcbiAgICBwbGF5YmFja1NwZWVkOiAxLFxuICAgIC8vcHBxLFxuICAgIGJwbTogYnBtLFxuICAgIG5vbWluYXRvcjogbm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yOiBkZW5vbWluYXRvclxuICB9KTtcbiAgc29uZy5hZGRUcmFja3MuYXBwbHkoc29uZywgbmV3VHJhY2tzKTtcbiAgc29uZy5hZGRUaW1lRXZlbnRzLmFwcGx5KHNvbmcsIHRpbWVFdmVudHMpO1xuICBzb25nLnVwZGF0ZSgpO1xuICByZXR1cm4gc29uZztcbn1cblxuZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZShkYXRhKSB7XG4gIHZhciBzZXR0aW5ncyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gIHZhciBzb25nID0gbnVsbDtcblxuICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKSB7XG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgIHNvbmcgPSB0b1NvbmcoKDAsIF9taWRpZmlsZS5wYXJzZU1JRElGaWxlKShidWZmZXIpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YS5oZWFkZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkYXRhLnRyYWNrcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzb25nID0gdG9Tb25nKGRhdGEpO1xuICB9IGVsc2Uge1xuICAgIGRhdGEgPSAoMCwgX3V0aWwuYmFzZTY0VG9CaW5hcnkpKGRhdGEpO1xuICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpIHtcbiAgICAgIHZhciBfYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgICBzb25nID0gdG9Tb25nKCgwLCBfbWlkaWZpbGUucGFyc2VNSURJRmlsZSkoX2J1ZmZlcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKCd3cm9uZyBkYXRhJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNvbmc7XG4gIC8vIHtcbiAgLy8gICBwcHEgPSBuZXdQUFEsXG4gIC8vICAgYnBtID0gbmV3QlBNLFxuICAvLyAgIHBsYXliYWNrU3BlZWQgPSBuZXdQbGF5YmFja1NwZWVkLFxuICAvLyB9ID0gc2V0dGluZ3Ncbn1cblxuZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZUFzeW5jKHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICgwLCBfaXNvbW9ycGhpY0ZldGNoMi5kZWZhdWx0KSh1cmwpLnRoZW4oX2ZldGNoX2hlbHBlcnMuc3RhdHVzKS50aGVuKF9mZXRjaF9oZWxwZXJzLmFycmF5QnVmZmVyKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICByZXNvbHZlKHNvbmdGcm9tTUlESUZpbGUoZGF0YSkpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICByZWplY3QoZSk7XG4gICAgfSk7XG4gIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuVHJhY2sgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcGFydCA9IHJlcXVpcmUoJy4vcGFydCcpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF9taWRpX25vdGUgPSByZXF1aXJlKCcuL21pZGlfbm90ZScpO1xuXG52YXIgX2luaXRfbWlkaSA9IHJlcXVpcmUoJy4vaW5pdF9taWRpJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9pbnN0cnVtZW50ID0gcmVxdWlyZSgnLi9pbnN0cnVtZW50Jyk7XG5cbnZhciBfcWFtYmkgPSByZXF1aXJlKCcuL3FhbWJpJyk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgdHJhY2tJbmRleCA9IDA7XG5cbnZhciBUcmFjayA9IGV4cG9ydHMuVHJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFRyYWNrKCkge1xuICAgIHZhciBuYW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFjayk7XG5cbiAgICB0aGlzLmlkID0gJ1RSXycgKyB0cmFja0luZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWQ7XG4gICAgdGhpcy5jaGFubmVsID0gMDtcbiAgICB0aGlzLm11dGVkID0gZmFsc2U7XG4gICAgdGhpcy52b2x1bWUgPSAwLjU7XG4gICAgdGhpcy5fb3V0cHV0ID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fb3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZTtcbiAgICB0aGlzLl9taWRpSW5wdXRzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX21pZGlPdXRwdXRzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3NvbmcgPSBudWxsO1xuICAgIHRoaXMuX3BhcnRzID0gW107XG4gICAgdGhpcy5fcGFydHNCeUlkID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2V2ZW50cyA9IFtdO1xuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2U7XG4gICAgdGhpcy5sYXRlbmN5ID0gMTAwO1xuICAgIHRoaXMuX2luc3RydW1lbnQgPSBudWxsO1xuICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcmVjb3JkZWRFdmVudHMgPSBbXTtcbiAgICAvL3RoaXMuc2V0SW5zdHJ1bWVudChuZXcgSW5zdHJ1bWVudCgnc2luZXdhdmUnKSlcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhUcmFjaywgW3tcbiAgICBrZXk6ICdzZXRJbnN0cnVtZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0SW5zdHJ1bWVudCgpIHtcbiAgICAgIHZhciBpbnN0cnVtZW50ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgaWYgKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudC5hbGxOb3Rlc09mZigpO1xuICAgICAgICB0aGlzLl9pbnN0cnVtZW50LmRpc2Nvbm5lY3QoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2luc3RydW1lbnQgPSBpbnN0cnVtZW50O1xuICAgICAgaWYgKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudC5jb25uZWN0KHRoaXMuX291dHB1dCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0SW5zdHJ1bWVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEluc3RydW1lbnQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW5zdHJ1bWVudDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb25uZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29ubmVjdChvdXRwdXQpIHtcbiAgICAgIHRoaXMuX291dHB1dC5jb25uZWN0KG91dHB1dCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGlzY29ubmVjdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc2Nvbm5lY3QoKSB7XG4gICAgICB0aGlzLl9vdXRwdXQuZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Nvbm5lY3RNSURJT3V0cHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbm5lY3RNSURJT3V0cHV0cygpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBvdXRwdXRzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIG91dHB1dHNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgICAgIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbiAob3V0cHV0KSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3V0cHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIG91dHB1dCA9ICgwLCBfaW5pdF9taWRpLmdldE1JRElPdXRwdXRCeUlkKShvdXRwdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvdXRwdXQgaW5zdGFuY2VvZiBNSURJT3V0cHV0KSB7XG4gICAgICAgICAgX3RoaXMuX21pZGlPdXRwdXRzLnNldChvdXRwdXQuaWQsIG91dHB1dCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpT3V0cHV0cylcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaXNjb25uZWN0TUlESU91dHB1dHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNjb25uZWN0TUlESU91dHB1dHMoKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBvdXRwdXRzID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgb3V0cHV0c1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuXG4gICAgICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gICAgICBpZiAob3V0cHV0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fbWlkaU91dHB1dHMuY2xlYXIoKTtcbiAgICAgIH1cbiAgICAgIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbiAocG9ydCkge1xuICAgICAgICBpZiAocG9ydCBpbnN0YW5jZW9mIE1JRElPdXRwdXQpIHtcbiAgICAgICAgICBwb3J0ID0gcG9ydC5pZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3RoaXMyLl9taWRpT3V0cHV0cy5oYXMocG9ydCkpIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdyZW1vdmluZycsIHRoaXMuX21pZGlPdXRwdXRzLmdldChwb3J0KS5uYW1lKVxuICAgICAgICAgIF90aGlzMi5fbWlkaU91dHB1dHMuZGVsZXRlKHBvcnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vdGhpcy5fbWlkaU91dHB1dHMgPSB0aGlzLl9taWRpT3V0cHV0cy5maWx0ZXIoLi4ub3V0cHV0cylcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaU91dHB1dHMpXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY29ubmVjdE1JRElJbnB1dHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb25uZWN0TUlESUlucHV0cygpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMyA9IGFyZ3VtZW50cy5sZW5ndGgsIGlucHV0cyA9IEFycmF5KF9sZW4zKSwgX2tleTMgPSAwOyBfa2V5MyA8IF9sZW4zOyBfa2V5MysrKSB7XG4gICAgICAgIGlucHV0c1tfa2V5M10gPSBhcmd1bWVudHNbX2tleTNdO1xuICAgICAgfVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBpbnB1dCA9ICgwLCBfaW5pdF9taWRpLmdldE1JRElJbnB1dEJ5SWQpKGlucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBNSURJSW5wdXQpIHtcbiAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBfdGhpczMuX21pZGlJbnB1dHMuc2V0KGlucHV0LmlkLCBpbnB1dCk7XG5cbiAgICAgICAgICAgIHZhciBub3RlID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIG1pZGlFdmVudCA9IHZvaWQgMDtcbiAgICAgICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgZnVuY3Rpb24gKGUpIHtcblxuICAgICAgICAgICAgICBtaWRpRXZlbnQgPSBuZXcgKEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmFwcGx5KF9taWRpX2V2ZW50Lk1JRElFdmVudCwgW251bGxdLmNvbmNhdChbX3RoaXMzLl9zb25nLl90aWNrc10sIF90b0NvbnN1bWFibGVBcnJheShlLmRhdGEpKSkpKCk7XG4gICAgICAgICAgICAgIG1pZGlFdmVudC50aW1lID0gMDsgLy8gcGxheSBpbW1lZGlhdGVseVxuICAgICAgICAgICAgICBtaWRpRXZlbnQucmVjb3JkTWlsbGlzID0gX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7XG5cbiAgICAgICAgICAgICAgaWYgKG1pZGlFdmVudC50eXBlID09PSBfcWFtYmkuTUlESUV2ZW50VHlwZXMuTk9URV9PTikge1xuICAgICAgICAgICAgICAgIG5vdGUgPSBuZXcgX21pZGlfbm90ZS5NSURJTm90ZShtaWRpRXZlbnQpO1xuICAgICAgICAgICAgICAgIF90aGlzMy5fdG1wUmVjb3JkZWROb3Rlcy5zZXQobWlkaUV2ZW50LmRhdGExLCBub3RlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChtaWRpRXZlbnQudHlwZSA9PT0gX3FhbWJpLk1JRElFdmVudFR5cGVzLk5PVEVfT0ZGKSB7XG4gICAgICAgICAgICAgICAgbm90ZSA9IF90aGlzMy5fdG1wUmVjb3JkZWROb3Rlcy5nZXQobWlkaUV2ZW50LmRhdGExKTtcbiAgICAgICAgICAgICAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KTtcbiAgICAgICAgICAgICAgICBfdGhpczMuX3RtcFJlY29yZGVkTm90ZXMuZGVsZXRlKG1pZGlFdmVudC5kYXRhMSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoX3RoaXMzLl9yZWNvcmRFbmFibGVkID09PSAnbWlkaScgJiYgX3RoaXMzLl9zb25nLnJlY29yZGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMy5fcmVjb3JkZWRFdmVudHMucHVzaChtaWRpRXZlbnQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF90aGlzMy5wcm9jZXNzTUlESUV2ZW50KG1pZGlFdmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaUlucHV0cylcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaXNjb25uZWN0TUlESUlucHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc2Nvbm5lY3RNSURJSW5wdXRzKCkge1xuICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW40ID0gYXJndW1lbnRzLmxlbmd0aCwgaW5wdXRzID0gQXJyYXkoX2xlbjQpLCBfa2V5NCA9IDA7IF9rZXk0IDwgX2xlbjQ7IF9rZXk0KyspIHtcbiAgICAgICAgaW5wdXRzW19rZXk0XSA9IGFyZ3VtZW50c1tfa2V5NF07XG4gICAgICB9XG5cbiAgICAgIGlmIChpbnB1dHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuY2xlYXIoKTtcbiAgICAgIH1cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgIGlmIChwb3J0IGluc3RhbmNlb2YgTUlESUlucHV0KSB7XG4gICAgICAgICAgcG9ydCA9IHBvcnQuaWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF90aGlzNC5fbWlkaU91dHB1dHMuaGFzKHBvcnQpKSB7XG4gICAgICAgICAgX3RoaXM0Ll9taWRpT3V0cHV0cy5kZWxldGUocG9ydCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy90aGlzLl9taWRpT3V0cHV0cyA9IHRoaXMuX21pZGlPdXRwdXRzLmZpbHRlciguLi5vdXRwdXRzKVxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldE1JRElJbnB1dHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRNSURJSW5wdXRzKCkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fbWlkaUlucHV0cy52YWx1ZXMoKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0TUlESU91dHB1dHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRNSURJT3V0cHV0cygpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRSZWNvcmRFbmFibGVkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UmVjb3JkRW5hYmxlZCh0eXBlKSB7XG4gICAgICAvLyAnbWlkaScsICdhdWRpbycsIGVtcHR5IG9yIGFueXRoaW5nIHdpbGwgZGlzYWJsZSByZWNvcmRpbmdcbiAgICAgIHRoaXMuX3JlY29yZEVuYWJsZWQgPSB0eXBlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19zdGFydFJlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zdGFydFJlY29yZGluZyhyZWNvcmRJZCkge1xuICAgICAgaWYgKHRoaXMuX3JlY29yZEVuYWJsZWQgPT09ICdtaWRpJykge1xuICAgICAgICB0aGlzLl9yZWNvcmRJZCA9IHJlY29yZElkO1xuICAgICAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdO1xuICAgICAgICB0aGlzLl9yZWNvcmRQYXJ0ID0gbmV3IF9wYXJ0LlBhcnQodGhpcy5fcmVjb3JkSWQpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19zdG9wUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3N0b3BSZWNvcmRpbmcocmVjb3JkSWQpIHtcbiAgICAgIHZhciBfcmVjb3JkUGFydDtcblxuICAgICAgaWYgKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAoX3JlY29yZFBhcnQgPSB0aGlzLl9yZWNvcmRQYXJ0KS5hZGRFdmVudHMuYXBwbHkoX3JlY29yZFBhcnQsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9yZWNvcmRlZEV2ZW50cykpO1xuICAgICAgLy90aGlzLl9zb25nLl9uZXdFdmVudHMucHVzaCguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgICAgIHRoaXMuYWRkUGFydHModGhpcy5fcmVjb3JkUGFydCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndW5kb1JlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVuZG9SZWNvcmRpbmcocmVjb3JkSWQpIHtcbiAgICAgIGlmICh0aGlzLl9yZWNvcmRJZCAhPT0gcmVjb3JkSWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5yZW1vdmVQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KTtcbiAgICAgIC8vdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX3JlY29yZGVkRXZlbnRzKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3JlZG9SZWNvcmRpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZWRvUmVjb3JkaW5nKHJlY29yZElkKSB7XG4gICAgICBpZiAodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWRkUGFydHModGhpcy5fcmVjb3JkUGFydCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY29weScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvcHkoKSB7XG4gICAgICB2YXIgdCA9IG5ldyBUcmFjayh0aGlzLm5hbWUgKyAnX2NvcHknKTsgLy8gaW1wbGVtZW50IGdldE5hbWVPZkNvcHkoKSBpbiB1dGlsIChzZWUgaGVhcnRiZWF0KVxuICAgICAgdmFyIHBhcnRzID0gW107XG4gICAgICB0aGlzLl9wYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHZhciBjb3B5ID0gcGFydC5jb3B5KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGNvcHkpO1xuICAgICAgICBwYXJ0cy5wdXNoKGNvcHkpO1xuICAgICAgfSk7XG4gICAgICB0LmFkZFBhcnRzLmFwcGx5KHQsIHBhcnRzKTtcbiAgICAgIHQudXBkYXRlKCk7XG4gICAgICByZXR1cm4gdDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0cmFuc3Bvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0cmFuc3Bvc2UoYW1vdW50KSB7XG4gICAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQudHJhbnNwb3NlKGFtb3VudCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhZGRQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFBhcnRzKCkge1xuICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgIHZhciBzb25nID0gdGhpcy5fc29uZztcblxuICAgICAgZm9yICh2YXIgX2xlbjUgPSBhcmd1bWVudHMubGVuZ3RoLCBwYXJ0cyA9IEFycmF5KF9sZW41KSwgX2tleTUgPSAwOyBfa2V5NSA8IF9sZW41OyBfa2V5NSsrKSB7XG4gICAgICAgIHBhcnRzW19rZXk1XSA9IGFyZ3VtZW50c1tfa2V5NV07XG4gICAgICB9XG5cbiAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgdmFyIF9ldmVudHM7XG5cbiAgICAgICAgcGFydC5fdHJhY2sgPSBfdGhpczU7XG4gICAgICAgIF90aGlzNS5fcGFydHNCeUlkLnNldChwYXJ0LmlkLCBwYXJ0KTtcbiAgICAgICAgX3RoaXM1Ll9wYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICBpZiAoc29uZykge1xuICAgICAgICAgIHBhcnQuX3NvbmcgPSBzb25nO1xuICAgICAgICAgIHNvbmcuX25ld1BhcnRzLnB1c2gocGFydCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZXZlbnRzID0gcGFydC5fZXZlbnRzO1xuICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBldmVudC5fdHJhY2sgPSBfdGhpczU7XG4gICAgICAgICAgaWYgKHNvbmcpIHtcbiAgICAgICAgICAgIGV2ZW50Ll9zb25nID0gc29uZztcbiAgICAgICAgICAgIHNvbmcuX25ld0V2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3RoaXM1Ll9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgICAgKF9ldmVudHMgPSBfdGhpczUuX2V2ZW50cykucHVzaC5hcHBseShfZXZlbnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoZXZlbnRzKSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVBhcnRzKCkge1xuICAgICAgdmFyIF90aGlzNiA9IHRoaXM7XG5cbiAgICAgIHZhciBzb25nID0gdGhpcy5fc29uZztcblxuICAgICAgZm9yICh2YXIgX2xlbjYgPSBhcmd1bWVudHMubGVuZ3RoLCBwYXJ0cyA9IEFycmF5KF9sZW42KSwgX2tleTYgPSAwOyBfa2V5NiA8IF9sZW42OyBfa2V5NisrKSB7XG4gICAgICAgIHBhcnRzW19rZXk2XSA9IGFyZ3VtZW50c1tfa2V5Nl07XG4gICAgICB9XG5cbiAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgcGFydC5fdHJhY2sgPSBudWxsO1xuICAgICAgICBfdGhpczYuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCwgcGFydCk7XG4gICAgICAgIGlmIChzb25nKSB7XG4gICAgICAgICAgc29uZy5fcmVtb3ZlZFBhcnRzLnB1c2gocGFydCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZXZlbnRzID0gcGFydC5fZXZlbnRzO1xuICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBldmVudC5fdHJhY2sgPSBudWxsO1xuICAgICAgICAgIGlmIChzb25nKSB7XG4gICAgICAgICAgICBldmVudC5fc29uZyA9IG51bGw7XG4gICAgICAgICAgICAvL3NvbmcuX2RlbGV0ZWRFdmVudHMucHVzaChldmVudClcbiAgICAgICAgICB9XG4gICAgICAgICAgX3RoaXM2Ll9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZCwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0UGFydHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQYXJ0cygpIHtcbiAgICAgIGlmICh0aGlzLl9uZWVkc1VwZGF0ZSkge1xuICAgICAgICB0aGlzLl9wYXJ0cyA9IEFycmF5LmZyb20odGhpcy5fcGFydHNCeUlkLnZhbHVlcygpKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKTtcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX3BhcnRzKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndHJhbnNwb3NlUGFydHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0cmFuc3Bvc2VQYXJ0cyhhbW91bnQpIHtcbiAgICAgIGZvciAodmFyIF9sZW43ID0gYXJndW1lbnRzLmxlbmd0aCwgcGFydHMgPSBBcnJheShfbGVuNyA+IDEgPyBfbGVuNyAtIDEgOiAwKSwgX2tleTcgPSAxOyBfa2V5NyA8IF9sZW43OyBfa2V5NysrKSB7XG4gICAgICAgIHBhcnRzW19rZXk3IC0gMV0gPSBhcmd1bWVudHNbX2tleTddO1xuICAgICAgfVxuXG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHBhcnQudHJhbnNwb3NlKGFtb3VudCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlUGFydHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlUGFydHModGlja3MpIHtcbiAgICAgIGZvciAodmFyIF9sZW44ID0gYXJndW1lbnRzLmxlbmd0aCwgcGFydHMgPSBBcnJheShfbGVuOCA+IDEgPyBfbGVuOCAtIDEgOiAwKSwgX2tleTggPSAxOyBfa2V5OCA8IF9sZW44OyBfa2V5OCsrKSB7XG4gICAgICAgIHBhcnRzW19rZXk4IC0gMV0gPSBhcmd1bWVudHNbX2tleThdO1xuICAgICAgfVxuXG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHBhcnQubW92ZSh0aWNrcyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlUGFydHNUbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVQYXJ0c1RvKHRpY2tzKSB7XG4gICAgICBmb3IgKHZhciBfbGVuOSA9IGFyZ3VtZW50cy5sZW5ndGgsIHBhcnRzID0gQXJyYXkoX2xlbjkgPiAxID8gX2xlbjkgLSAxIDogMCksIF9rZXk5ID0gMTsgX2tleTkgPCBfbGVuOTsgX2tleTkrKykge1xuICAgICAgICBwYXJ0c1tfa2V5OSAtIDFdID0gYXJndW1lbnRzW19rZXk5XTtcbiAgICAgIH1cblxuICAgICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBwYXJ0Lm1vdmVUbyh0aWNrcyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhZGRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudHMoKSB7XG4gICAgICB2YXIgcCA9IG5ldyBfcGFydC5QYXJ0KCk7XG4gICAgICBwLmFkZEV2ZW50cy5hcHBseShwLCBhcmd1bWVudHMpO1xuICAgICAgdGhpcy5hZGRQYXJ0cyhwKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudHMoKSB7XG4gICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgdmFyIHBhcnRzID0gbmV3IFNldCgpO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMTAgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuMTApLCBfa2V5MTAgPSAwOyBfa2V5MTAgPCBfbGVuMTA7IF9rZXkxMCsrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5MTBdID0gYXJndW1lbnRzW19rZXkxMF07XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBwYXJ0cy5zZXQoZXZlbnQuX3BhcnQpO1xuICAgICAgICBldmVudC5fcGFydCA9IG51bGw7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGw7XG4gICAgICAgIGV2ZW50Ll9zb25nID0gbnVsbDtcbiAgICAgICAgX3RoaXM3Ll9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZCk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfY2hhbmdlZFBhcnRzLCBfc29uZyRfcmVtb3ZlZEV2ZW50cztcblxuICAgICAgICAoX3NvbmckX2NoYW5nZWRQYXJ0cyA9IHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cykucHVzaC5hcHBseShfc29uZyRfY2hhbmdlZFBhcnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKSk7XG4gICAgICAgIChfc29uZyRfcmVtb3ZlZEV2ZW50cyA9IHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX3JlbW92ZWRFdmVudHMsIGV2ZW50cyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZUV2ZW50cyh0aWNrcykge1xuICAgICAgdmFyIHBhcnRzID0gbmV3IFNldCgpO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMTEgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuMTEgPiAxID8gX2xlbjExIC0gMSA6IDApLCBfa2V5MTEgPSAxOyBfa2V5MTEgPCBfbGVuMTE7IF9rZXkxMSsrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5MTEgLSAxXSA9IGFyZ3VtZW50c1tfa2V5MTFdO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQubW92ZSh0aWNrcyk7XG4gICAgICAgIHBhcnRzLnNldChldmVudC5wYXJ0KTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMuX3NvbmcpIHtcbiAgICAgICAgdmFyIF9zb25nJF9jaGFuZ2VkUGFydHMyLCBfc29uZyRfbW92ZWRFdmVudHM7XG5cbiAgICAgICAgKF9zb25nJF9jaGFuZ2VkUGFydHMyID0gdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzKS5wdXNoLmFwcGx5KF9zb25nJF9jaGFuZ2VkUGFydHMyLCBfdG9Db25zdW1hYmxlQXJyYXkoQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKSk7XG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHMgPSB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfbW92ZWRFdmVudHMsIGV2ZW50cyk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZUV2ZW50c1RvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZUV2ZW50c1RvKHRpY2tzKSB7XG4gICAgICB2YXIgcGFydHMgPSBuZXcgU2V0KCk7XG5cbiAgICAgIGZvciAodmFyIF9sZW4xMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW4xMiA+IDEgPyBfbGVuMTIgLSAxIDogMCksIF9rZXkxMiA9IDE7IF9rZXkxMiA8IF9sZW4xMjsgX2tleTEyKyspIHtcbiAgICAgICAgZXZlbnRzW19rZXkxMiAtIDFdID0gYXJndW1lbnRzW19rZXkxMl07XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5tb3ZlVG8odGlja3MpO1xuICAgICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydCk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfY2hhbmdlZFBhcnRzMywgX3NvbmckX21vdmVkRXZlbnRzMjtcblxuICAgICAgICAoX3NvbmckX2NoYW5nZWRQYXJ0czMgPSB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMpLnB1c2guYXBwbHkoX3NvbmckX2NoYW5nZWRQYXJ0czMsIF90b0NvbnN1bWFibGVBcnJheShBcnJheS5mcm9tKHBhcnRzLmVudHJpZXMoKSkpKTtcbiAgICAgICAgKF9zb25nJF9tb3ZlZEV2ZW50czIgPSB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfbW92ZWRFdmVudHMyLCBldmVudHMpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50cygpIHtcbiAgICAgIHZhciBmaWx0ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuICAgICAgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgICBpZiAodGhpcy5fbmVlZHNVcGRhdGUpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpOyAvL0BUT0RPIGltcGxlbWVudCBmaWx0ZXIgLT4gZmlsdGVyRXZlbnRzKCkgc2hvdWxkIGJlIGEgdXRpbGl0eSBmdW5jdGlvbiAobm90IGEgY2xhc3MgbWV0aG9kKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ211dGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtdXRlKCkge1xuICAgICAgdmFyIGZsYWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICBpZiAoZmxhZykge1xuICAgICAgICB0aGlzLl9tdXRlZCA9IGZsYWc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9tdXRlZCA9ICF0aGlzLl9tdXRlZDtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAvLyB5b3Ugc2hvdWxkIG9ubHkgdXNlIHRoaXMgaW4gaHVnZSBzb25ncyAoPjEwMCB0cmFja3MpXG4gICAgICBpZiAodGhpcy5fY3JlYXRlRXZlbnRBcnJheSkge1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpO1xuICAgICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICAoMCwgX3V0aWwuc29ydEV2ZW50cykodGhpcy5fZXZlbnRzKTtcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWxsTm90ZXNPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhbGxOb3Rlc09mZigpIHtcbiAgICAgIGlmICh0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRpbWVTdGFtcCA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwICsgdGhpcy5sYXRlbmN5O1xuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBvdXRwdXQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKTsgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICAgICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWVTdGFtcCk7IC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdwcm9jZXNzTUlESUV2ZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcHJvY2Vzc01JRElFdmVudChldmVudCkge1xuICAgICAgdmFyIHVzZUxhdGVuY3kgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuXG4gICAgICB2YXIgbGF0ZW5jeSA9IHVzZUxhdGVuY3kgPyB0aGlzLmxhdGVuY3kgOiAwO1xuICAgICAgLy9jb25zb2xlLmxvZyhsYXRlbmN5KVxuXG4gICAgICAvLyBzZW5kIHRvIGphdmFzY3JpcHQgaW5zdHJ1bWVudFxuICAgICAgaWYgKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KGV2ZW50LCBldmVudC50aW1lIC8gMTAwMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNlbmQgdG8gZXh0ZXJuYWwgaGFyZHdhcmUgb3Igc29mdHdhcmUgaW5zdHJ1bWVudFxuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSB0aGlzLl9taWRpT3V0cHV0cy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBwb3J0ID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHBvcnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAxMjggfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDE3Nikge1xuICAgICAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMl0sIGV2ZW50LnRpbWUgKyBsYXRlbmN5KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gMTkyIHx8IGV2ZW50LnR5cGUgPT09IDIyNCkge1xuICAgICAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExXSwgZXZlbnQudGltZSArIGxhdGVuY3kpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBUcmFjaztcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG5leHBvcnRzLmdldE5pY2VUaW1lID0gZ2V0TmljZVRpbWU7XG5leHBvcnRzLmJhc2U2NFRvQmluYXJ5ID0gYmFzZTY0VG9CaW5hcnk7XG5leHBvcnRzLnR5cGVTdHJpbmcgPSB0eXBlU3RyaW5nO1xuZXhwb3J0cy5zb3J0RXZlbnRzID0gc29ydEV2ZW50cztcbmV4cG9ydHMuY2hlY2tJZkJhc2U2NCA9IGNoZWNrSWZCYXNlNjQ7XG5leHBvcnRzLmdldEVxdWFsUG93ZXJDdXJ2ZSA9IGdldEVxdWFsUG93ZXJDdXJ2ZTtcbmV4cG9ydHMuY2hlY2tNSURJTnVtYmVyID0gY2hlY2tNSURJTnVtYmVyO1xuXG52YXIgX2lzb21vcnBoaWNGZXRjaCA9IHJlcXVpcmUoJ2lzb21vcnBoaWMtZmV0Y2gnKTtcblxudmFyIF9pc29tb3JwaGljRmV0Y2gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNvbW9ycGhpY0ZldGNoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIG1QSSA9IE1hdGguUEksXG4gICAgbVBvdyA9IE1hdGgucG93LFxuICAgIG1Sb3VuZCA9IE1hdGgucm91bmQsXG4gICAgbUZsb29yID0gTWF0aC5mbG9vcixcbiAgICBtUmFuZG9tID0gTWF0aC5yYW5kb207XG5cbmZ1bmN0aW9uIGdldE5pY2VUaW1lKG1pbGxpcykge1xuICB2YXIgaCA9IHZvaWQgMCxcbiAgICAgIG0gPSB2b2lkIDAsXG4gICAgICBzID0gdm9pZCAwLFxuICAgICAgbXMgPSB2b2lkIDAsXG4gICAgICBzZWNvbmRzID0gdm9pZCAwLFxuICAgICAgdGltZUFzU3RyaW5nID0gJyc7XG5cbiAgc2Vjb25kcyA9IG1pbGxpcyAvIDEwMDA7IC8vIOKGkiBtaWxsaXMgdG8gc2Vjb25kc1xuICBoID0gbUZsb29yKHNlY29uZHMgLyAoNjAgKiA2MCkpO1xuICBtID0gbUZsb29yKHNlY29uZHMgJSAoNjAgKiA2MCkgLyA2MCk7XG4gIHMgPSBtRmxvb3Ioc2Vjb25kcyAlIDYwKTtcbiAgbXMgPSBtUm91bmQoKHNlY29uZHMgLSBoICogMzYwMCAtIG0gKiA2MCAtIHMpICogMTAwMCk7XG5cbiAgdGltZUFzU3RyaW5nICs9IGggKyAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtIDwgMTAgPyAnMCcgKyBtIDogbTtcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IHMgPCAxMCA/ICcwJyArIHMgOiBzO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbXMgPT09IDAgPyAnMDAwJyA6IG1zIDwgMTAgPyAnMDAnICsgbXMgOiBtcyA8IDEwMCA/ICcwJyArIG1zIDogbXM7XG5cbiAgLy9jb25zb2xlLmxvZyhoLCBtLCBzLCBtcyk7XG4gIHJldHVybiB7XG4gICAgaG91cjogaCxcbiAgICBtaW51dGU6IG0sXG4gICAgc2Vjb25kOiBzLFxuICAgIG1pbGxpc2Vjb25kOiBtcyxcbiAgICB0aW1lQXNTdHJpbmc6IHRpbWVBc1N0cmluZyxcbiAgICB0aW1lQXNBcnJheTogW2gsIG0sIHMsIG1zXVxuICB9O1xufVxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5mdW5jdGlvbiBiYXNlNjRUb0JpbmFyeShpbnB1dCkge1xuICB2YXIga2V5U3RyID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JyxcbiAgICAgIGJ5dGVzID0gdm9pZCAwLFxuICAgICAgdWFycmF5ID0gdm9pZCAwLFxuICAgICAgYnVmZmVyID0gdm9pZCAwLFxuICAgICAgbGtleTEgPSB2b2lkIDAsXG4gICAgICBsa2V5MiA9IHZvaWQgMCxcbiAgICAgIGNocjEgPSB2b2lkIDAsXG4gICAgICBjaHIyID0gdm9pZCAwLFxuICAgICAgY2hyMyA9IHZvaWQgMCxcbiAgICAgIGVuYzEgPSB2b2lkIDAsXG4gICAgICBlbmMyID0gdm9pZCAwLFxuICAgICAgZW5jMyA9IHZvaWQgMCxcbiAgICAgIGVuYzQgPSB2b2lkIDAsXG4gICAgICBpID0gdm9pZCAwLFxuICAgICAgaiA9IDA7XG5cbiAgYnl0ZXMgPSBNYXRoLmNlaWwoMyAqIGlucHV0Lmxlbmd0aCAvIDQuMCk7XG4gIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihieXRlcyk7XG4gIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgbGtleTEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBsa2V5MiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGggLSAxKSk7XG4gIGlmIChsa2V5MSA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG4gIGlmIChsa2V5MiA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG5cbiAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgJycpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBieXRlczsgaSArPSAzKSB7XG4gICAgLy9nZXQgdGhlIDMgb2N0ZWN0cyBpbiA0IGFzY2lpIGNoYXJzXG4gICAgZW5jMSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzMgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jNCA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcblxuICAgIGNocjEgPSBlbmMxIDw8IDIgfCBlbmMyID4+IDQ7XG4gICAgY2hyMiA9IChlbmMyICYgMTUpIDw8IDQgfCBlbmMzID4+IDI7XG4gICAgY2hyMyA9IChlbmMzICYgMykgPDwgNiB8IGVuYzQ7XG5cbiAgICB1YXJyYXlbaV0gPSBjaHIxO1xuICAgIGlmIChlbmMzICE9IDY0KSB1YXJyYXlbaSArIDFdID0gY2hyMjtcbiAgICBpZiAoZW5jNCAhPSA2NCkgdWFycmF5W2kgKyAyXSA9IGNocjM7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhidWZmZXIpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5mdW5jdGlvbiB0eXBlU3RyaW5nKG8pIHtcbiAgaWYgKCh0eXBlb2YgbyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YobykpICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihvKTtcbiAgfVxuXG4gIGlmIChvID09PSBudWxsKSB7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuXG4gIC8vb2JqZWN0LCBhcnJheSwgZnVuY3Rpb24sIGRhdGUsIHJlZ2V4cCwgc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIGVycm9yXG4gIHZhciBpbnRlcm5hbENsYXNzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9cXFtvYmplY3RcXHMoXFx3KylcXF0vKVsxXTtcbiAgcmV0dXJuIGludGVybmFsQ2xhc3MudG9Mb3dlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gc29ydEV2ZW50cyhldmVudHMpIHtcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoYS50aWNrcyA9PT0gYi50aWNrcykge1xuICAgICAgdmFyIHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZiAoYS50eXBlID09PSAxNzYgJiYgYi50eXBlID09PSAxNDQpIHtcbiAgICAgICAgciA9IC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIHJldHVybiBhLnRpY2tzIC0gYi50aWNrcztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrSWZCYXNlNjQoZGF0YSkge1xuICB2YXIgcGFzc2VkID0gdHJ1ZTtcbiAgdHJ5IHtcbiAgICBhdG9iKGRhdGEpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcGFzc2VkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBhc3NlZDtcbn1cblxuZnVuY3Rpb24gZ2V0RXF1YWxQb3dlckN1cnZlKG51bVN0ZXBzLCB0eXBlLCBtYXhWYWx1ZSkge1xuICB2YXIgaSA9IHZvaWQgMCxcbiAgICAgIHZhbHVlID0gdm9pZCAwLFxuICAgICAgcGVyY2VudCA9IHZvaWQgMCxcbiAgICAgIHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtU3RlcHMpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBudW1TdGVwczsgaSsrKSB7XG4gICAgcGVyY2VudCA9IGkgLyBudW1TdGVwcztcbiAgICBpZiAodHlwZSA9PT0gJ2ZhZGVJbicpIHtcbiAgICAgIHZhbHVlID0gTWF0aC5jb3MoKDEuMCAtIHBlcmNlbnQpICogMC41ICogbVBJKSAqIG1heFZhbHVlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2ZhZGVPdXQnKSB7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKHBlcmNlbnQgKiAwLjUgKiBNYXRoLlBJKSAqIG1heFZhbHVlO1xuICAgIH1cbiAgICB2YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICBpZiAoaSA9PT0gbnVtU3RlcHMgLSAxKSB7XG4gICAgICB2YWx1ZXNbaV0gPSB0eXBlID09PSAnZmFkZUluJyA/IDEgOiAwO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWVzO1xufVxuXG5mdW5jdGlvbiBjaGVja01JRElOdW1iZXIodmFsdWUpIHtcbiAgLy9jb25zb2xlLmxvZyh2YWx1ZSk7XG4gIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWx1ZSA8IDAgfHwgdmFsdWUgPiAxMjcpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTI3Jyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLypcbi8vb2xkIHNjaG9vbCBhamF4XG5cbmV4cG9ydCBmdW5jdGlvbiBhamF4KGNvbmZpZyl7XG4gIGxldFxuICAgIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcbiAgICBtZXRob2QgPSB0eXBlb2YgY29uZmlnLm1ldGhvZCA9PT0gJ3VuZGVmaW5lZCcgPyAnR0VUJyA6IGNvbmZpZy5tZXRob2QsXG4gICAgZmlsZVNpemU7XG5cbiAgZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIHJlamVjdCA9IHJlamVjdCB8fCBmdW5jdGlvbigpe307XG4gICAgcmVzb2x2ZSA9IHJlc29sdmUgfHwgZnVuY3Rpb24oKXt9O1xuXG4gICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgaWYocmVxdWVzdC5zdGF0dXMgIT09IDIwMCl7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LnN0YXR1cyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgZmlsZVNpemUgPSByZXF1ZXN0LnJlc3BvbnNlLmxlbmd0aDtcbiAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpLCBmaWxlU2l6ZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKXtcbiAgICAgIGNvbmZpZy5vbkVycm9yKGUpO1xuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBjb25maWcudXJsLCB0cnVlKTtcblxuICAgIGlmKGNvbmZpZy5vdmVycmlkZU1pbWVUeXBlKXtcbiAgICAgIHJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZShjb25maWcub3ZlcnJpZGVNaW1lVHlwZSk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSl7XG4gICAgICBpZihjb25maWcucmVzcG9uc2VUeXBlID09PSAnanNvbicpe1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICAgIH1lbHNle1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYobWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5kYXRhKXtcbiAgICAgIHJlcXVlc3Quc2VuZChjb25maWcuZGF0YSk7XG4gICAgfWVsc2V7XG4gICAgICByZXF1ZXN0LnNlbmQoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xufVxuKi8iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG5cbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgbGlzdCA9IHRoaXMubWFwW25hbWVdXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICBsaXN0ID0gW11cbiAgICAgIHRoaXMubWFwW25hbWVdID0gbGlzdFxuICAgIH1cbiAgICBsaXN0LnB1c2godmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gICAgcmV0dXJuIHZhbHVlcyA/IHZhbHVlc1swXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gfHwgW11cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBbbm9ybWFsaXplVmFsdWUodmFsdWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5tYXApLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGhpcy5tYXBbbmFtZV0uZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBuYW1lLCB0aGlzKVxuICAgICAgfSwgdGhpcylcbiAgICB9LCB0aGlzKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgLy8gT25seSBzdXBwb3J0IEFycmF5QnVmZmVycyBmb3IgUE9TVCBtZXRob2QuXG4gICAgICAgIC8vIFJlY2VpdmluZyBBcnJheUJ1ZmZlcnMgaGFwcGVucyB2aWEgQmxvYnMsIGluc3RlYWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcbiAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBpbnB1dFxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9ICh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpLnRyaW0oKS5zcGxpdCgnXFxuJylcbiAgICBwYWlycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgdmFyIHNwbGl0ID0gaGVhZGVyLnRyaW0oKS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gc3BsaXQuc2hpZnQoKS50cmltKClcbiAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJzonKS50cmltKClcbiAgICAgIGhlYWQuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfSlcbiAgICByZXR1cm4gaGVhZFxuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9IG9wdGlvbnMuc3RhdHVzVGV4dFxuICAgIHRoaXMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMgPyBvcHRpb25zLmhlYWRlcnMgOiBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVyc1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZVxuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0XG4gICAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkgJiYgIWluaXQpIHtcbiAgICAgICAgcmVxdWVzdCA9IGlucHV0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB9XG5cbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBmdW5jdGlvbiByZXNwb25zZVVSTCgpIHtcbiAgICAgICAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgICAgIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyh4aHIpLFxuICAgICAgICAgIHVybDogcmVzcG9uc2VVUkwoKVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iXX0=
