(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _qambi = require('../../src/qambi');

var _qambi2 = _interopRequireDefault(_qambi);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {

  var song = void 0;

  _qambi2.default.init().then(function () {

    var test = 2;

    if (test === 1) {

      //console.time('song')
      (0, _isomorphicFetch2.default)('../../data/mozk545a.mid').then(function (response) {
        return response.arrayBuffer();
      }).then(function (data) {
        song = _qambi.Song.fromMIDIFile(data);
        initUI();
        //console.timeEnd('song')
      });
    } else if (test === 2) {

        //console.time('song')
        _qambi.Song.fromMIDIFileAsync('../../data/minute_waltz.mid').then(function (s) {
          song = s;
          //console.timeEnd('song')
          initUI();
        }, function (e) {
          return console.log(e);
        });
      }
  });

  function initUI() {

    var btnPlay = document.getElementById('play');
    var btnPause = document.getElementById('pause');
    var btnStop = document.getElementById('stop');
    var divTempo = document.getElementById('tempo');
    var divSustain = document.getElementById('sustain');
    var divSustain2 = document.getElementById('sustain2');
    var divPosition = document.getElementById('position');
    var divPositionTime = document.getElementById('position_time');
    var rangePosition = document.getElementById('playhead');
    var userInteraction = false;

    btnPlay.disabled = false;
    btnPause.disabled = false;
    btnStop.disabled = false;

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

    // song.addEventListener(qambi.TEMPO, event => {
    //   divTempo.innerHTML = `tempo: ${event.bpm} bpm`
    // })

    song.addEventListener('sustainpedal', function (event) {
      divSustain.innerHTML = 'sustainpedal ' + event.data;
    });

    song.addEventListener(_qambi2.default.CONTROL_CHANGE, function (event) {
      if (event.data1 !== 64) {
        return;
      }
      if (event.data2 === 127) {
        divSustain2.innerHTML = 'sustainpedal down';
      } else if (event.data2 === 0) {
        divSustain2.innerHTML = 'sustainpedal up';
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
  }
});

},{"../../src/qambi":20,"isomorphic-fetch":2}],2:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":3}],3:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
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

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
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
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
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

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

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

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
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

function init() {
  var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


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

var _samples = require('./samples');

var _samples2 = _interopRequireDefault(_samples);

var _parse_audio = require('./parse_audio');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var masterGain = void 0,
    compressor = void 0,
    initialized = false;

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
  var data = {};
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

exports.masterGain = masterGain;
exports.masterCompressor = compressor;
exports.setMasterVolume = _setMasterVolume;
exports.getMasterVolume = _getMasterVolume;
exports.getCompressionReduction = _getCompressionReduction;
exports.enableMasterCompressor = _enableMasterCompressor;
exports.configureMasterCompressor = _configureMasterCompressor;

},{"./parse_audio":15,"./samples":22}],8:[function(require,module,exports){
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = outputs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _port = _step2.value;

      outputsById.set(_port.id, _port);
      outputIds.push(_port.id);
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
    exports.getMIDIOutputById = _getMIDIOutputById = function getMIDIOutputById() {
      return outputsById.get(id);
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
    exports.getMIDIInputById = _getMIDIInputById = function getMIDIInputById() {
      return outputsById.get(id);
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

},{"./util":27}],9:[function(require,module,exports){
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
    key: 'processMIDIEvent',
    value: function processMIDIEvent(event, time) {
      var _this = this;

      var sample = void 0,
          sampleData = void 0;
      time = time || _init_audio.context.currentTime + event.ticks * millisPerTick;
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
            console.info('sample not found for event', event.id, ' midiNote', event.midiNoteId, event);
            return;
          }
          if (this.sustainPedalDown === true) {
            //console.log(event.midiNoteId)
            this.sustainedSamples.push(event.midiNoteId);
          } else {
            sample.stop(time, function () {
              //console.log('stop', event.midiNoteId)
              delete _this.scheduledSamples[event.midiNoteId];
            });
            //sample.stop(time)
          }
        } else if (event.type === 176) {
            // sustain pedal
            if (event.data1 === 64) {
              if (event.data2 === 127) {
                this.sustainPedalDown = true;
                (0, _eventlistener.dispatchEvent)({
                  type: 'sustainpedal',
                  data: 'down'
                });
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
                  (0, _eventlistener.dispatchEvent)({
                    type: 'sustainpedal',
                    data: 'up'
                  });
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
      this.sustainPedalDown = false;
      Object.keys(this.scheduledSamples).forEach(function (sampleId) {
        //console.log('  stopping', sampleId)
        _this5.scheduledSamples[sampleId].stop();
      });
      this.scheduledSamples = {};

      (0, _eventlistener.dispatchEvent)({
        type: 'sustainpedal',
        data: 'up'
      });

      //console.log('allNotesOff', this.sustainedSamples.length, this.scheduledSamples)
    }
  }]);

  return Instrument;
}();

},{"./eventlistener":4,"./init_audio":7,"./note":14,"./parse_audio":15,"./sample":21,"./util":27}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

    if (noteon.type !== 144 || noteoff.type !== 128) {
      console.warn('cannot create MIDINote');
      return;
    }
    this.id = 'MN_' + midiNoteIndex++ + '_' + new Date().getTime();
    this.noteOn = noteon;
    this.noteOff = noteoff;
    noteon.midiNote = this;
    noteoff.midiNote = this;
    noteon.midiNoteId = this.id;
    noteoff.midiNoteId = this.id;
    this.durationTicks = noteoff.ticks - noteon.ticks;
    this.durationMillis = -1;
  }

  _createClass(MIDINote, [{
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

},{"./midi_event":10}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./midi_stream":12}],14:[function(require,module,exports){
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

},{"./util":27}],15:[function(require,module,exports){
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

},{"./init_audio":7,"./util":27,"isomorphic-fetch":2}],16:[function(require,module,exports){
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
    diffTicks = void 0,
    previousEvent = void 0;

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
  previousEvent = event;
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

},{"./midi_note":11,"./util":27}],17:[function(require,module,exports){
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

},{"./util":27}],18:[function(require,module,exports){
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
      console.log('events %O', this.events);
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
      (0, _eventlistener.dispatchEvent)({
        type: 'position',
        data: position
      });

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
        type: 'playhead',
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

},{"./eventlistener.js":4,"./position.js":19,"./util.js":27}],19:[function(require,module,exports){
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
  if (type === 'all') {
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

},{"./util":27}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseMIDIFile = exports.Instrument = exports.Part = exports.Track = exports.Song = exports.MIDINote = exports.MIDIEvent = exports.parseSamples = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.init = undefined;

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _part = require('./part');

var _track = require('./track');

var _instrument = require('./instrument');

var _song = require('./song');

var _midifile = require('./midifile');

var _init = require('./init');

var _init_audio = require('./init_audio');

var _init_midi = require('./init_midi');

var _parse_audio = require('./parse_audio');

var getAudioContext = function getAudioContext() {
  return _init_audio.context;
};

var qambi = {
  version: '1.0.0-beta2',

  // from ./util
  parseSamples: _parse_audio.parseSamples,

  // from ./init
  init: _init.init,

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

  parseMIDIFile: _midifile.parseMIDIFile,

  log: function log(id) {
    switch (id) {
      case 'functions':
        console.log('functions:\n          createMIDIEvent\n          moveMIDIEvent\n          moveMIDIEventTo\n          createMIDINote\n          createSong\n          addTracks\n          createTrack\n          addParts\n          createPart\n          addMIDIEvents\n        ');
        break;
      default:
    }
  }
};

// standard MIDI events
//const MIDI = {}
Object.defineProperty(qambi, 'NOTE_OFF', { value: 0x80 }); //128
Object.defineProperty(qambi, 'NOTE_ON', { value: 0x90 }); //144
Object.defineProperty(qambi, 'POLY_PRESSURE', { value: 0xA0 }); //160
Object.defineProperty(qambi, 'CONTROL_CHANGE', { value: 0xB0 }); //176
Object.defineProperty(qambi, 'PROGRAM_CHANGE', { value: 0xC0 }); //192
Object.defineProperty(qambi, 'CHANNEL_PRESSURE', { value: 0xD0 }); //208
Object.defineProperty(qambi, 'PITCH_BEND', { value: 0xE0 }); //224
Object.defineProperty(qambi, 'SYSTEM_EXCLUSIVE', { value: 0xF0 }); //240
Object.defineProperty(qambi, 'MIDI_TIMECODE', { value: 241 });
Object.defineProperty(qambi, 'SONG_POSITION', { value: 242 });
Object.defineProperty(qambi, 'SONG_SELECT', { value: 243 });
Object.defineProperty(qambi, 'TUNE_REQUEST', { value: 246 });
Object.defineProperty(qambi, 'EOX', { value: 247 });
Object.defineProperty(qambi, 'TIMING_CLOCK', { value: 248 });
Object.defineProperty(qambi, 'START', { value: 250 });
Object.defineProperty(qambi, 'CONTINUE', { value: 251 });
Object.defineProperty(qambi, 'STOP', { value: 252 });
Object.defineProperty(qambi, 'ACTIVE_SENSING', { value: 254 });
Object.defineProperty(qambi, 'SYSTEM_RESET', { value: 255 });

Object.defineProperty(qambi, 'TEMPO', { value: 0x51 });
Object.defineProperty(qambi, 'TIME_SIGNATURE', { value: 0x58 });
Object.defineProperty(qambi, 'END_OF_TRACK', { value: 0x2F });

exports.default = qambi;
exports.
// from ./init
init = _init.init;
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

// from ./util
parseSamples = _parse_audio.parseSamples;
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
exports.

//  MIDI,

parseMIDIFile = _midifile.parseMIDIFile;

},{"./init":6,"./init_audio":7,"./init_midi":8,"./instrument":9,"./midi_event":10,"./midi_note":11,"./midifile":13,"./parse_audio":15,"./part":17,"./song":24,"./track":26}],21:[function(require,module,exports){
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
      //console.log(this.source);
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

},{"./init_audio.js":7,"./util.js":27}],22:[function(require,module,exports){
module.exports={
  "emptyOgg": "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Y5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=",
  "emptyMp3": "//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=",
  "hightick": "UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAACx/xf/dADOACwBsP3p+6H+zAGoBOkCCwBX/EH5OvxlA4kJ2wcSArT9E/ut+HT2evUx98n6OAF5CCUMwQvfCOsJxAx0DSIMEAq9BiAB3vhz7mLkT9sR133YxN2s5QLv0vrUBnwRnxuQJeEsSDCiMd8yFS8aKFIhohUsCKj64u625OraA9HuyPnElcP+wxvJWtW25637VQ0jHPgnBTDDM1o0CzKLK+8hzhgFDOz8Se4J47DYVtG0z5fQq9LB12rfA+j99roHAhelIyMwIjdTOuU8mjwIOGoxhCb5E53/j+3k3/fTY8pTw4y/Tr+ew8DMvdsk8RcHRRkSKO4yGTkHPkU/rzzyNcgsrR94Dp/5r+Zs17zOncoDxhfE38WLyn/TeOMi9r0IRxlRKIQzyTlOPKo9yjmWMcokDRLc/Y7rudtdzu/D2L1Iu+27JcG3yYrVLujl+3UOZx1UK5Q0qzmNPDk8ZjeeMPojzhH+/jLtPd5m0hHLHsYIw5TEMMnA0jvj8fSOBiwXASZgMzM8dUBGQbI+rzjpKkIZygZT9QflcdaRyqXCz7+VwUPH784r3K7s+v0KDu8bvyeLMb43NjrhOIo0dSvQHi0PnP6i7ovg3NTxy4/Gf8X8yH/QBtvX55P2Ygb0FcUjsy4LNmI5ejiXM38r7iC8FJwHPvok7dDgQdaJzlTKIsoFzsrVkuA87d/6qAi7FQ0h9ClKMLEz3TOrMBcqYSD8E9AFd/dS6kTf6dbU0XnQv9IH2MXfZ+ln9DEAFwwdFy8giib6KawqeChgI/UbHBOTCZj/vvXe7InlFuDN3P3b0d1F4gzpifG2+u4D7Qw1FfwbnCD+IlgjWyHLHPMVog2mBL37qvP+7NvnYuTv4rvjfubN6k3wpPZ0/WkEOwtiEUsWcxm+Gl4aOhhiFDAPIwmbAtn7TPVy77zqcefr5YHmHull7enyfPmcAHgHew1REr8Vhhd/F+AV1RJ0DikJWQNc/ZP3efKd7hvs2ur46rHs5u8e9N/48/0hA/8HFgwuD04RSBIREqsQOg7mCssGMAJW/Xn4G/TK8Lbuzu0I7qTvnPJy9sX6bP84BLYIbAwdD84QYxG7EOcODAxwCFMEAQC9+7P3SvTX8XHw+u9R8KTxIvSo9+X7VQCUBJ0IMwziDj4QLhAGD9UMrgnTBZcBRv1v+Xv2UfS+8tfx+vES87z0+vb3+Zf9ZgEQBSEIUArWC8kM2QyzC5EJEAdvBHgBXP5n++r4Avd89Wj07fMw9D31Jvfp+Uj9xQD9A8QG5QhXClELrAsvC9wJ7gd6BWIC3v6O+7T4PPZN9EHzWvNf9Pz1Fvit+qL9rQCHAwEG/weCCZUKFwvDCnIJcAcQBWcCaf8Z/CD55vaB9dD0wPSP9UL3m/k7/Mz+JwEyAw8FzAY7CBsJaQk5CWkI2gatBCICYf+j/Fr6vfiV9872sfZP91z4p/lR+3H9zf89AroEFAfjCP0Jcwo8CjAJdQdgBSEDkgDQ/Vj7ZfnR95T28fUd9v32Vvg2+nb8+/6xAWoE4AbDCP4JpAqbCqQJ0weEBfgCTACT/R37M/m+9672IPY69gb3afhW+tT8qf+MAj0FggcuCScKXAriCcMIEAfyBJYCFwCP/Rz7A/l793z2F/Zn9mH37fjd+i39yf9pAt0EFAfRCNkJGAqrCZYIvgZPBJ8B6P4//M350vdz9q/1lfUq9mz3RPmi+3H+bgFVBOQG3wgHCkwK0Am7CCAHCgWmAjAA",
  "lowtick": "UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAAB0/5v+U/4T/3gA0wFTAuUB+f8d/nT90f1q/ub+tf46/mb/8wFQA9gC7wCd/mr+FAGRA3cE6wJf/h36evmv+8v/NwRHBZUC2/60+//5EvuZ/aX/bgFOAp8Azvzh9wfzLPF68zT4y/2BAygIfQwaEjYY0x31Irwl8SOWHVESOgPh9NfpReFt22nYHddD2BXcZeDa5InqgPDx9nP+6gS4CBYLnw0zES0WXxv4HkcgLh/1G+EX1RNpD4wKigXH/6r5/fNu7lTpj+Zu5hHoXOtL71byr/Qp91L64v6OBO4JoQ5zEskU+hU1FiQVeRP7EWgP4Qr0BIT+tPid9C3y1vCh8FDxJvK28vvyy/LA8pLzU/XP95v6xvw4/uD/RAK2BSkKcg6BEScTZBMeEqkPTQxjCKEEVwFi/nv7h/hp9aDyAvHP8MfxLvM+9PX0uPW19g/4Lfr7/C4AKgNaBXQGywb0BhIHWQfWB1oIzAjtCF8IHwdtBakDVwKLAeYA8v9w/kj81/nQ94v29/XX9bz1bPUY9Uz1Z/aH+Hr7yP4MAi4F+wcfCnYLNgyfDPsMSw0sDUAMfgrcB5IEMwFb/iX8T/pT+O/1X/Mf8cbvrO+18MLyvfVP+Rf9wgAoBCEHpwnIC5EN4Q5AD3wO1Ay0CpsIvwbvBNcCbQAr/nX8Ofsf+vb4mvda9rj1z/WX9pL3a/hH+ZX6R/wn/vP/eQESA/AE+wYDCcwKFAyPDCkMFQuSCe4HVQbSBHQDCwI8ANL9JPuY+HX28vTq82PzdPMV9Az1MfZ49zD5gftx/sQBBQXLB8cJ/gqpCw8MigwWDXENXQ2rDDUL7QgDBswCdv8S/K74WPVk8hXwou4P7mvu1+9T8pz1Uvli/ZoBwgWRCcsMPg/CEEQR4RDADwoO9wusCVMH4ARSApn/ufzd+Wj3bvX78xzzx/L68qzz1vSD9qX4Gfvd/c0AhwO/BWwHmghvCQEKVQonClsJCwiIBh0F0gOgAm0BOwAx/03+XP0g/Lb6cPmX+F/4vfh++TH6s/os+7/7cvwL/Zz9XP5O/3IA3AF9AzsF9gaUCAAKHgueCzcL9wntB3sF4wIzAI396fp1+Gv2IvWn9N30p/Xi9m74G/ru+9P9k/8aAYEC1AMTBSIG0wYuB1gHkgcACGEISAhTBzEFWAKt/5L92fuU+vX50fmf+SP5i/gb+Bf4mviv+Sr7kvyb/Uj+r/4X/8r/+gCiAo0EUAaRBzwISwjqB3IHGQfCBv8FpgTMApQAKf67+5n5/vfn9jz2yPVn9SL1RPXq9SP3Dvmr+6f+sQGKBAcH+whOCh0Laws3C28KLAmDB5AFfQNoAVP/Zv3e+7P6sfnL+Cv4vPeM95b37feV+Jn51Poq/LL9mv+YAVYD3gQuBmcHSAikCIEI7Af+BuEFngQXA1sBv/9v/pf9MP3W/Fj8q/sR+6H6U/o3+mP6y/pN+/f7xvye/WH+Jf9mAD4CQAQJBisHtgf6Bw0I8QdsB1sGywT4AggBCP/o/KX6mPg19572jfaz9uf2S/cM+E35E/tW/af/5wH1A8AFKgfkB/AHgwfxBlAGgQVIBMMCJwGs/43+vP0i/Zr8Lfzl+9H76fvi+9f75fsf/In8BP10/ej9cf4O/7f/dAAcAaUBEgKMAhgDpAMEBCEEDwTfA3IDxQL8ASoBUwCG/87+J/6h/Rr9pPxk/Gb8oPwJ/XH9w/39/UD+qP41/9D/WwDeAGsBAgKdAhEDQQNAA0sDbwOVA5YDVwPOAhgCVAGRAA==",
}
},{}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_midi = require('./init_midi');

var _init_audio = require('./init_audio');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BUFFER_TIME = 200; // millis

var Scheduler = function () {
  function Scheduler(song) {
    _classCallCheck(this, Scheduler);

    this.song = song;
  }

  _createClass(Scheduler, [{
    key: 'init',
    value: function init(millis) {
      this.songStartMillis = millis;
      this.events = this.song._events;
      this.numEvents = this.events.length;
      this.index = 0;
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
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var events = [];
      // main loop
      for (var i = this.index; i < this.numEvents; i++) {
        var event = this.events[i];
        //console.log(event.millis, this.maxtime)
        if (event.millis < this.maxtime) {

          //event.time = this.timeStamp + event.millis - this.songStartMillis;

          if (event.type === 'audio') {
            // to be implemented
          } else {
              events.push(event);
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
    value: function update(millis) {
      var i, event, numEvents, track, events, instrument, scheduledTime;

      //console.log(position, this.maxtime)
      events = this.getEvents();
      numEvents = events.length;
      this.maxtime = millis + BUFFER_TIME;

      //console.log('update', this.maxtime, numEvents)

      for (i = 0; i < numEvents; i++) {
        event = events[i];
        track = event._track;
        instrument = track._instrument;

        //console.log(event.ticks)

        // if(typeof instrument === 'undefined'){
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

        // debug minute_waltz double events
        // if(event.ticks > 40300){
        //   console.info(event)
        // }

        scheduledTime = this.timeStamp + event.millis - this.songStartMillis;
        //console.log('scheduled', scheduledTime, 'current', context.currentTime * 1000)

        if (event.type === 'audio') {
          // to be implemented
        } else {

            // send to javascript instrument
            if (typeof instrument !== 'undefined') {
              // convert to seconds because the audio context uses seconds for scheduling
              instrument.processMIDIEvent(event, scheduledTime / 1000, track._output);
            }

            // send to external hardware or software instrument
            var channel = track.channel;
            var offset = BUFFER_TIME * 2; // why does this work?

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = track._midiOutputIds[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var portId = _step2.value;

                var port = (0, _init_midi.getMIDIOutputById)(portId);
                if (port) {
                  if (event.type === 128 || event.type === 144 || event.type === 176) {
                    port.send([event.type + channel, event.data1, event.data2], scheduledTime + offset);
                  } else if (event.type === 192 || event.type === 224) {
                    port.send([event.type + channel, event.data1], scheduledTime + offset);
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
      }
      //console.log(this.index, this.numEvents)
      //return this.index >= 10
      return this.index >= this.numEvents; // end of song
    }
  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      //console.log('STOP')
      ///*
      var timeStamp = _init_audio.context.currentTime * 1000;
      var outputs = (0, _init_midi.getMIDIOutputs)();
      outputs.forEach(function (output) {
        output.send([0xB0, 0x7B, 0x00], timeStamp + BUFFER_TIME * 2); // stop all notes
        output.send([0xB0, 0x79, 0x00], timeStamp + BUFFER_TIME * 2); // reset all controllers
      });
      //*/
      var tracks = this.song._tracks;
      tracks.forEach(function (track) {
        //let instrument = track._instrument
        //if(typeof instrument !== 'undefined'){
        //  instrument.allNotesOff()
        //}
        track._instrument.allNotesOff();
      });
    }
  }]);

  return Scheduler;
}();

exports.default = Scheduler;

},{"./init_audio":7,"./init_midi":8}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Song = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //@ flow

//import {addTask, removeTask} from './heartbeat'


var _parse_events = require('./parse_events');

var _init_audio = require('./init_audio');

var _scheduler = require('./scheduler');

var _scheduler2 = _interopRequireDefault(_scheduler);

var _midi_event = require('./midi_event');

var _song_from_midifile = require('./song_from_midifile');

var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

var _util = require('./util');

var _position = require('./position');

var _playhead = require('./playhead');

var _eventlistener = require('./eventlistener');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var songIndex = 0;

var defaultSong = {
  ppq: 960,
  bpm: 120,
  bars: 30,
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
    this.ppq = _settings$ppq === undefined ? defaultSong.ppq : _settings$ppq;
    var _settings$bpm = settings.bpm;
    this.bpm = _settings$bpm === undefined ? defaultSong.bpm : _settings$bpm;
    var _settings$bars = settings.bars;
    this.bars = _settings$bars === undefined ? defaultSong.bars : _settings$bars;
    var _settings$nominator = settings.nominator;
    this.nominator = _settings$nominator === undefined ? defaultSong.nominator : _settings$nominator;
    var _settings$denominator = settings.denominator;
    this.denominator = _settings$denominator === undefined ? defaultSong.denominator : _settings$denominator;
    var _settings$quantizeVal = settings.quantizeValue;
    this.quantizeValue = _settings$quantizeVal === undefined ? defaultSong.quantizeValue : _settings$quantizeVal;
    var _settings$fixedLength = settings.fixedLengthValue;
    this.fixedLengthValue = _settings$fixedLength === undefined ? defaultSong.fixedLengthValue : _settings$fixedLength;
    var _settings$useMetronom = settings.useMetronome;
    this.useMetronome = _settings$useMetronom === undefined ? defaultSong.useMetronome : _settings$useMetronom;
    var _settings$autoSize = settings.autoSize;
    this.autoSize = _settings$autoSize === undefined ? defaultSong.autoSize : _settings$autoSize;
    var _settings$loop = settings.loop;
    this.loop = _settings$loop === undefined ? defaultSong.loop : _settings$loop;
    var _settings$playbackSpe = settings.playbackSpeed;
    this.playbackSpeed = _settings$playbackSpe === undefined ? defaultSong.playbackSpeed : _settings$playbackSpe;
    var _settings$autoQuantiz = settings.autoQuantize;
    this.autoQuantize = _settings$autoQuantiz === undefined ? defaultSong.autoQuantize : _settings$autoQuantiz;


    this._timeEvents = [new _midi_event.MIDIEvent(0, _qambi2.default.TEMPO, this.bpm), new _midi_event.MIDIEvent(0, _qambi2.default.TIME_SIGNATURE, this.nominator, this.denominator)];

    //this._timeEvents = []
    this._updateTimeEvents = true;
    this._lastEvent = new _midi_event.MIDIEvent(0, _qambi2.default.END_OF_TRACK);

    this._tracks = [];
    this._tracksById = new Map();

    this._parts = [];
    this._partsById = new Map();

    this._events = [];
    this._eventsById = new Map();

    this._notes = [];
    this._notesById = new Map();

    this._newEvents = [];
    this._movedEvents = [];
    this._removedEvents = [];
    this._transposedEvents = [];

    this._newParts = [];
    this._changedParts = [];
    this._removedParts = [];

    this._scheduler = new _scheduler2.default(this);
    this._playhead = new _playhead.Playhead(this);
    this._millis = 0;

    this._playing = false;
    this._paused = false;

    this.volume = 0.5;
    this._output = _init_audio.context.createGain();
    this._output.gain.value = this.volume;
    this._output.connect(_init_audio.masterGain);
  }

  _createClass(Song, [{
    key: 'addTimeEvents',
    value: function addTimeEvents() {
      var _timeEvents;

      //@TODO: filter time events on the same tick -> use the lastly added events
      (_timeEvents = this._timeEvents).push.apply(_timeEvents, arguments);
      this._updateTimeEvents = true;
    }
  }, {
    key: 'addTracks',
    value: function addTracks() {
      var _this = this;

      for (var _len = arguments.length, tracks = Array(_len), _key = 0; _key < _len; _key++) {
        tracks[_key] = arguments[_key];
      }

      tracks.forEach(function (track) {
        var _newEvents, _newParts;

        track._song = _this;
        track.connect(_this._output);
        _this._tracks.push(track);
        _this._tracksById.set(track.id, track);
        (_newEvents = _this._newEvents).push.apply(_newEvents, _toConsumableArray(track._events));
        (_newParts = _this._newParts).push.apply(_newParts, _toConsumableArray(track._parts));
      });
    }

    // prepare song events for playback

  }, {
    key: 'update',
    value: function update() {
      var _this2 = this;

      var createEventArray = false;

      if (this._updateTimeEvents === false && this._removedEvents.length === 0 && this._newEvents.length === 0 && this._movedEvents.length === 0) {
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

        _this2.partsById.delete(part.id);
        (_removedEvents = _this2._removedEvents).push.apply(_removedEvents, _toConsumableArray(part._events));
      });

      // add new parts
      console.log('new parts %O', this._newParts);
      this._newParts.forEach(function (part) {
        var _tobeParsed;

        part._song = _this2;
        _this2._partsById.set(part.id, part);
        (_tobeParsed = tobeParsed).push.apply(_tobeParsed, _toConsumableArray(part._events));
        part.update();
      });

      // update changed parts
      console.log('changed parts %O', this._changedParts);
      this._changedParts.forEach(function (part) {
        part.update();
      });

      // filter removed events
      console.log('removed events %O', this._removedEvents);
      this._removedEvents.forEach(function (event) {
        _this2._notesById.delete(event.midiNote.id);
        _this2._eventsById.delete(event.id);
      });

      createEventArray = this._removedEvents.length > 0;

      // add new events
      console.log('new events %O', this._newEvents);
      this._newEvents.forEach(function (event) {
        _this2._eventsById.set(event.id, event);
        _this2._events.push(event);
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
          //console.log(event.id, event.type)
          if (event.type === _qambi2.default.NOTE_ON) {
            if (event.midiNote) {
              _this2._notesById.set(event.midiNoteId, event.midiNote);
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

      var lastEvent = this._events[this._events.length - 1];
      var lastTimeEvent = this._timeEvents[this._timeEvents.length - 1];
      if (lastTimeEvent.ticks > lastTimeEvent.ticks) {
        lastTimeEvent = lastTimeEvent;
      }

      //console.log('last tick', lastTicks)
      this._lastEvent.bar = lastEvent.bar;
      this._lastEvent.beat = lastEvent.beat;
      this._lastEvent.sixteenth = lastEvent.sixteenth;
      this._lastEvent.tick = lastEvent.tick;
      this._lastEvent.ticks = lastEvent.ticks;
      this._lastEvent.millis = lastEvent.millis;
      this._durationTicks = this._lastEvent.ticks;
      this._durationMillis = this._lastEvent.millis;
      this.bars = this._lastEvent.bar + 1;
      this._playhead.updateSong();
    }
  }, {
    key: 'play',
    value: function play(type) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      this._play.apply(this, [type].concat(args));
      (0, _eventlistener.dispatchEvent)({ type: 'play', data: this._millis });
    }
  }, {
    key: '_play',
    value: function _play(type) {
      if (typeof type !== 'undefined') {
        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        this.setPosition.apply(this, [type].concat(args));
      }
      if (this._playing) {
        return;
      }

      this._timeStamp = _init_audio.context.currentTime * 1000;
      this._scheduler.setTimeStamp(this._timeStamp);

      if (this._paused) {
        this._paused = false;
      }

      this._playing = true;
      this._scheduler.init(this._millis);
      this._playhead.set('millis', this._millis);
      this._pulse();
    }
  }, {
    key: 'pause',
    value: function pause() {
      this._paused = !this._paused;
      if (this._paused) {
        this._playing = false;
        this._scheduler.allNotesOff();
        (0, _eventlistener.dispatchEvent)({ type: 'pause', data: this._paused });
      } else {
        this.play();
        (0, _eventlistener.dispatchEvent)({ type: 'pause', data: this._paused });
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      this._scheduler.allNotesOff();
      if (this._playing || this._paused) {
        this._playing = false;
        this._paused = false;
      }
      if (this._millis !== 0) {
        this._millis = 0;
        this._playhead.set('millis', this._millis);
        (0, _eventlistener.dispatchEvent)({ type: 'stop' });
      }
    }
  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      this._scheduler.allNotesOff();
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

    /*
      position:
        - 'ticks', 96000
        - 'millis', 1234
        - 'percentage', 55
        - 'barsbeats', 1, 4, 0, 25 -> bar, beat, sixteenth, tick
        - 'time', 0, 3, 49, 566 -> hours, minutes, seconds, millis
    */

  }, {
    key: 'setPosition',
    value: function setPosition(type) {

      var wasPlaying = this._playing;
      if (this._playing) {
        this._playing = false;
        this._scheduler.allNotesOff();
      }

      var target = void 0;
      var position = void 0;

      for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

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
          return;
      }

      // millis = calculatePosition(this, {
      //   type,
      //   target,
      //   result: 'millis'
      // }).millis

      position = (0, _position.calculatePosition)(this, {
        type: type,
        target: target,
        result: 'all'
      });

      this._millis = position.millis;

      (0, _eventlistener.dispatchEvent)({
        type: 'position',
        data: position
      });

      if (wasPlaying) {
        this._play();
      }
      //console.log('setPosition', this._millis)
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
  }, {
    key: '_pulse',
    value: function _pulse() {
      if (this._playing === false) {
        return;
      }
      var now = _init_audio.context.currentTime * 1000;
      var diff = now - this._timeStamp;
      this._millis += diff;
      this._timeStamp = now;
      //console.log(diff, this.millis)

      this._playhead.update('millis', diff);

      if (this._millis >= this._durationMillis) {
        this.stop();
        return;
      }

      this._scheduler.update(this._millis);

      //console.log('pulse', diff)
      requestAnimationFrame(this._pulse.bind(this));
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

},{"./eventlistener":4,"./init_audio":7,"./midi_event":10,"./parse_events":16,"./playhead":18,"./position":19,"./qambi":20,"./scheduler":23,"./song_from_midifile":25,"./util":27}],25:[function(require,module,exports){
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

},{"./fetch_helpers":5,"./midi_event":10,"./midifile":13,"./part":17,"./song":24,"./track":26,"./util":27,"isomorphic-fetch":2}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Track = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _part = require('./part');

var _util = require('./util');

var _init_audio = require('./init_audio');

var _instrument = require('./instrument');

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
    this._midiOutputIds = [];
    this._song = null;
    this._parts = [];
    this._partsById = new Map();
    this._events = [];
    this._eventsById = new Map();
    this._needsUpdate = false;
    this._createEventArray = false;
    this.setInstrument(new _instrument.Instrument());
  }

  _createClass(Track, [{
    key: 'setInstrument',
    value: function setInstrument(instrument) {
      this._instrument = instrument;
      instrument.connect(this._output);
    }
  }, {
    key: 'connect',
    value: function connect(output) {
      this._output.connect(output);
    }
  }, {
    key: 'setMIDIOutputs',
    value: function setMIDIOutputs() {
      var _midiOutputIds;

      //console.log(outputIds)
      (_midiOutputIds = this._midiOutputIds).push.apply(_midiOutputIds, arguments);
    }
  }, {
    key: 'removeMIDIOutputs',
    value: function removeMIDIOutputs() {
      //this._midiOutputs = this._midiOutputs.filter(...outputs)
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
      var _this = this;

      var song = this._song;

      for (var _len = arguments.length, parts = Array(_len), _key = 0; _key < _len; _key++) {
        parts[_key] = arguments[_key];
      }

      parts.forEach(function (part) {
        var _events;

        part._track = _this;
        _this._partsById.set(part.id, part);
        _this._parts.push(part);
        if (song) {
          part._song = song;
          song._newParts.push(part);
        }

        var events = part._events;
        events.forEach(function (event) {
          event._track = _this;
          if (song) {
            event._song = song;
            //song._newEvents.push(event)
          }
          _this._eventsById.set(event.id, event);
        });
        (_events = _this._events).push.apply(_events, _toConsumableArray(events));
      });
      this._needsUpdate = true;
    }
  }, {
    key: 'removeParts',
    value: function removeParts() {
      var _this2 = this;

      var song = this._song;

      for (var _len2 = arguments.length, parts = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        parts[_key2] = arguments[_key2];
      }

      parts.forEach(function (part) {
        part._track = null;
        _this2._partsById.delete(part.id, part);
        if (song) {
          song._deletedParts.push(part);
        }

        var events = part._events;
        events.forEach(function (event) {
          event._track = null;
          if (song) {
            event._song = null;
            //song._deletedEvents.push(event)
          }
          this._eventsById.delete(event.id, event);
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
      for (var _len3 = arguments.length, parts = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        parts[_key3 - 1] = arguments[_key3];
      }

      parts.forEach(function (part) {
        part.transpose(amount);
      });
    }
  }, {
    key: 'moveParts',
    value: function moveParts(ticks) {
      for (var _len4 = arguments.length, parts = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        parts[_key4 - 1] = arguments[_key4];
      }

      parts.forEach(function (part) {
        part.move(ticks);
      });
    }
  }, {
    key: 'movePartsTo',
    value: function movePartsTo(ticks) {
      for (var _len5 = arguments.length, parts = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        parts[_key5 - 1] = arguments[_key5];
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
      var _this3 = this;

      var parts = new Set();

      for (var _len6 = arguments.length, events = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        events[_key6] = arguments[_key6];
      }

      events.forEach(function (event) {
        parts.set(event._part);
        event._part = null;
        event._track = null;
        event._song = null;
        _this3._eventsById.delete(event.id);
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

      for (var _len7 = arguments.length, events = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
        events[_key7 - 1] = arguments[_key7];
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

      for (var _len8 = arguments.length, events = Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
        events[_key8 - 1] = arguments[_key8];
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
  }]);

  return Track;
}();

},{"./init_audio":7,"./instrument":9,"./part":17,"./util":27}],27:[function(require,module,exports){
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

},{"isomorphic-fetch":2}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9taWRpZmlsZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pc29tb3JwaGljLWZldGNoL2ZldGNoLW5wbS1icm93c2VyaWZ5LmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsInNyYy9ldmVudGxpc3RlbmVyLmpzIiwic3JjL2ZldGNoX2hlbHBlcnMuanMiLCJzcmMvaW5pdC5qcyIsInNyYy9pbml0X2F1ZGlvLmpzIiwic3JjL2luaXRfbWlkaS5qcyIsInNyYy9pbnN0cnVtZW50LmpzIiwic3JjL21pZGlfZXZlbnQuanMiLCJzcmMvbWlkaV9ub3RlLmpzIiwic3JjL21pZGlfc3RyZWFtLmpzIiwic3JjL21pZGlmaWxlLmpzIiwic3JjL25vdGUuanMiLCJzcmMvcGFyc2VfYXVkaW8uanMiLCJzcmMvcGFyc2VfZXZlbnRzLmpzIiwic3JjL3BhcnQuanMiLCJzcmMvcGxheWhlYWQuanMiLCJzcmMvcG9zaXRpb24uanMiLCJzcmMvcWFtYmkuanMiLCJzcmMvc2FtcGxlLmpzIiwic3JjL3NhbXBsZXMuanNvbiIsInNyYy9zY2hlZHVsZXIuanMiLCJzcmMvc29uZy5qcyIsInNyYy9zb25nX2Zyb21fbWlkaWZpbGUuanMiLCJzcmMvdHJhY2suanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFLQTs7Ozs7O0FBRUEsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVTs7QUFFdEQsTUFBSSxhQUFKLENBRnNEOztBQUl0RCxrQkFBTSxJQUFOLEdBQ0MsSUFERCxDQUNNLFlBQU07O0FBRVYsUUFBSSxPQUFPLENBQVAsQ0FGTTs7QUFJVixRQUFHLFNBQVMsQ0FBVCxFQUFXOzs7QUFHWixxQ0FBTSx5QkFBTixFQUNDLElBREQsQ0FDTSxvQkFBWTtBQUNoQixlQUFPLFNBQVMsV0FBVCxFQUFQLENB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LGNBQVEsS0FBSyxHQUFMLENBQVMsQ0FBQyxNQUFNLE9BQU4sQ0FBRCxHQUFrQixHQUFsQixHQUF3QixHQUF4QixDQUFULEdBQXdDLFFBQXhDLENBRFc7S0FBckIsTUFFTSxJQUFHLFNBQVMsU0FBVCxFQUFtQjtBQUMxQixjQUFRLEtBQUssR0FBTCxDQUFTLFVBQVUsR0FBVixHQUFnQixLQUFLLEVBQUwsQ0FBekIsR0FBb0MsUUFBcEMsQ0FEa0I7S0FBdEI7QUFHTixXQUFPLENBQVAsSUFBWSxLQUFaLENBUDJCO0FBUTNCLFFBQUcsTUFBTSxXQUFXLENBQVgsRUFBYTtBQUNwQixhQUFPLENBQVAsSUFBWSxTQUFTLFFBQVQsR0FBb0IsQ0FBcEIsR0FBd0IsQ0FBeEIsQ0FEUTtLQUF0QjtHQVJGO0FBWUEsU0FBTyxNQUFQLENBaEIyRDtDQUF0RDs7QUFvQkEsU0FBUyxlQUFULENBQXlCLEtBQXpCLEVBQStCOztBQUVwQyxNQUFHLE1BQU0sS0FBTixDQUFILEVBQWdCO0FBQ2QsWUFBUSxJQUFSLENBQWEseUJBQWIsRUFEYztBQUVkLFdBQU8sS0FBUCxDQUZjO0dBQWhCO0FBSUEsTUFBRyxRQUFRLENBQVIsSUFBYSxRQUFRLEdBQVIsRUFBWTtBQUMxQixZQUFRLElBQVIsQ0FBYSwyQ0FBYixFQUQwQjtBQUUxQixXQUFPLEtBQVAsQ0FGMEI7R0FBNUI7QUFJQSxTQUFPLEtBQVAsQ0FWb0M7Q0FBL0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHFhbWJpLCB7XG4gIFNvbmcsXG59IGZyb20gJy4uLy4uL3NyYy9xYW1iaSdcblxuXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG5cbiAgbGV0IHNvbmdcblxuICBxYW1iaS5pbml0KClcbiAgLnRoZW4oKCkgPT4ge1xuXG4gICAgbGV0IHRlc3QgPSAyXG5cbiAgICBpZih0ZXN0ID09PSAxKXtcblxuICAgICAgLy9jb25zb2xlLnRpbWUoJ3NvbmcnKVxuICAgICAgZmV0Y2goJy4uLy4uL2RhdGEvbW96azU0NWEubWlkJylcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKClcbiAgICAgIH0pXG4gICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgc29uZyA9IFNvbmcuZnJvbU1JRElGaWxlKGRhdGEpXG4gICAgICAgIGluaXRVSSgpXG4gICAgICAgIC8vY29uc29sZS50aW1lRW5kKCdzb25nJylcbiAgICAgIH0pXG5cbiAgICB9ZWxzZSBpZih0ZXN0ID09PSAyKXtcblxuICAgICAgLy9jb25zb2xlLnRpbWUoJ3NvbmcnKVxuICAgICAgU29uZy5mcm9tTUlESUZpbGVBc3luYygnLi4vLi4vZGF0YS9taW51dGVfd2FsdHoubWlkJylcbiAgICAgIC50aGVuKHMgPT4ge1xuICAgICAgICBzb25nID0gc1xuICAgICAgICAvL2NvbnNvbGUudGltZUVuZCgnc29uZycpXG4gICAgICAgIGluaXRVSSgpXG4gICAgICB9LCBlID0+IGNvbnNvbGUubG9nKGUpKVxuICAgIH1cbiAgfSlcblxuXG4gIGZ1bmN0aW9uIGluaXRVSSgpe1xuXG4gICAgbGV0IGJ0blBsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheScpXG4gICAgbGV0IGJ0blBhdXNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhdXNlJylcbiAgICBsZXQgYnRuU3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9wJylcbiAgICBsZXQgZGl2VGVtcG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVtcG8nKVxuICAgIGxldCBkaXZTdXN0YWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1c3RhaW4nKVxuICAgIGxldCBkaXZTdXN0YWluMiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdXN0YWluMicpXG4gICAgbGV0IGRpdlBvc2l0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bvc2l0aW9uJylcbiAgICBsZXQgZGl2UG9zaXRpb25UaW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bvc2l0aW9uX3RpbWUnKVxuICAgIGxldCByYW5nZVBvc2l0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXloZWFkJylcbiAgICBsZXQgdXNlckludGVyYWN0aW9uID0gZmFsc2VcblxuICAgIGJ0blBsYXkuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0blBhdXNlLmRpc2FibGVkID0gZmFsc2VcbiAgICBidG5TdG9wLmRpc2FibGVkID0gZmFsc2VcblxuICAgIGJ0blBsYXkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgLy9zb25nLnBsYXkoJ2JhcnNiZWF0cycsIDQsIDEsIDEsIDApXG4gICAgICAvL3NvbmcucGxheSgndGltZScsIDAsIDAsIDE1KSAvLyBwbGF5IGZyb20gMTUgc2Vjb25kc1xuICAgICAgLy9zb25nLnBsYXkoJ21pbGxpcycsIDM0MDAwKSAvLyBwbGF5IGZyb20gMzQgc2Vjb25kc1xuICAgICAgc29uZy5wbGF5KClcbiAgICB9KTtcblxuICAgIGJ0blBhdXNlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcucGF1c2UoKVxuICAgIH0pXG5cbiAgICBidG5TdG9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcuc3RvcCgpXG4gICAgfSlcblxuICAgIC8vIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcihxYW1iaS5URU1QTywgZXZlbnQgPT4ge1xuICAgIC8vICAgZGl2VGVtcG8uaW5uZXJIVE1MID0gYHRlbXBvOiAke2V2ZW50LmJwbX0gYnBtYFxuICAgIC8vIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ3N1c3RhaW5wZWRhbCcsIGV2ZW50ID0+IHtcbiAgICAgIGRpdlN1c3RhaW4uaW5uZXJIVE1MID0gJ3N1c3RhaW5wZWRhbCAnICsgZXZlbnQuZGF0YVxuICAgIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIocWFtYmkuQ09OVFJPTF9DSEFOR0UsIGV2ZW50ID0+IHtcbiAgICAgIGlmKGV2ZW50LmRhdGExICE9PSA2NCl7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDEyNyl7XG4gICAgICAgIGRpdlN1c3RhaW4yLmlubmVySFRNTCA9ICdzdXN0YWlucGVkYWwgZG93bidcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgZGl2U3VzdGFpbjIuaW5uZXJIVE1MID0gJ3N1c3RhaW5wZWRhbCB1cCdcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdub3RlT24nLCBldmVudCA9PiB7XG4gICAgICBsZXQgbm90ZSA9IGV2ZW50LmRhdGFcbiAgICAgIC8vY29uc29sZS5sb2coJ25vdGVPbicsIG5vdGUuaWQsIG5vdGUubm90ZU9uLmlkLCBub3RlLm5vdGVPbi5kYXRhMSwgbm90ZS5ub3RlT24udGlja3MpXG4gICAgfSlcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignbm90ZU9mZicsIGV2ZW50ID0+IHtcbiAgICAgIGxldCBub3RlID0gZXZlbnQuZGF0YVxuICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9mZicsIG5vdGUuaWQsIG5vdGUubm90ZU9mZi5pZCwgbm90ZS5ub3RlT2ZmLmRhdGExLCBub3RlLm5vdGVPZmYudGlja3MpXG4gICAgfSlcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcigncGxheScsIGV2ZW50ID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdzdGFydGVkIHBsYXlpbmcgYXQgcG9zaXRpb246JywgZXZlbnQuZGF0YSlcbiAgICB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdzdG9wJywgKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ3N0b3AnKVxuICAgICAgcmFuZ2VQb3NpdGlvbi52YWx1ZSA9IDBcbiAgICB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdwYXVzZScsIGV2ZW50ID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdwYXVzZWQ6JywgZXZlbnQuZGF0YSlcbiAgICB9KVxuXG4gICAgbGV0IHBvc2l0aW9uID0gc29uZy5nZXRQb3NpdGlvbigpXG4gICAgZGl2UG9zaXRpb24uaW5uZXJIVE1MID0gcG9zaXRpb24uYmFyc0FzU3RyaW5nXG4gICAgZGl2UG9zaXRpb25UaW1lLmlubmVySFRNTCA9IHBvc2l0aW9uLnRpbWVBc1N0cmluZ1xuICAgIGRpdlRlbXBvLmlubmVySFRNTCA9IGB0ZW1wbzogJHtwb3NpdGlvbi5icG19IGJwbWBcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcigncG9zaXRpb24nLCBldmVudCA9PiB7XG4gICAgICBkaXZQb3NpdGlvbi5pbm5lckhUTUwgPSBldmVudC5kYXRhLmJhcnNBc1N0cmluZ1xuICAgICAgZGl2UG9zaXRpb25UaW1lLmlubmVySFRNTCA9IGV2ZW50LmRhdGEudGltZUFzU3RyaW5nXG4gICAgICBkaXZUZW1wby5pbm5lckhUTUwgPSBgdGVtcG86ICR7ZXZlbnQuZGF0YS5icG19IGJwbWBcbiAgICAgIGlmKCF1c2VySW50ZXJhY3Rpb24pe1xuICAgICAgICByYW5nZVBvc2l0aW9uLnZhbHVlID0gZXZlbnQuZGF0YS5wZXJjZW50YWdlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJhbmdlUG9zaXRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGUgPT4ge1xuICAgICAgcmFuZ2VQb3NpdGlvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByYW5nZUxpc3RlbmVyKVxuICAgICAgdXNlckludGVyYWN0aW9uID0gZmFsc2VcbiAgICB9KVxuXG4gICAgcmFuZ2VQb3NpdGlvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBlID0+IHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgc29uZy5zZXRQb3NpdGlvbigncGVyY2VudGFnZScsIGUudGFyZ2V0LnZhbHVlQXNOdW1iZXIpXG4gICAgICB9LCAwKVxuICAgICAgcmFuZ2VQb3NpdGlvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByYW5nZUxpc3RlbmVyKVxuICAgICAgdXNlckludGVyYWN0aW9uID0gdHJ1ZVxuICAgIH0pXG5cbiAgICBjb25zdCByYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgICBzb25nLnNldFBvc2l0aW9uKCdwZXJjZW50YWdlJywgZS50YXJnZXQudmFsdWVBc051bWJlcilcbiAgICB9XG4gIH1cblxufSlcbiIsIi8vIHRoZSB3aGF0d2ctZmV0Y2ggcG9seWZpbGwgaW5zdGFsbHMgdGhlIGZldGNoKCkgZnVuY3Rpb25cbi8vIG9uIHRoZSBnbG9iYWwgb2JqZWN0ICh3aW5kb3cgb3Igc2VsZilcbi8vXG4vLyBSZXR1cm4gdGhhdCBhcyB0aGUgZXhwb3J0IGZvciB1c2UgaW4gV2VicGFjaywgQnJvd3NlcmlmeSBldGMuXG5yZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKTtcbm1vZHVsZS5leHBvcnRzID0gc2VsZi5mZXRjaC5iaW5kKHNlbGYpO1xuIiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG5cbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgbGlzdCA9IHRoaXMubWFwW25hbWVdXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICBsaXN0ID0gW11cbiAgICAgIHRoaXMubWFwW25hbWVdID0gbGlzdFxuICAgIH1cbiAgICBsaXN0LnB1c2godmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gICAgcmV0dXJuIHZhbHVlcyA/IHZhbHVlc1swXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gfHwgW11cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBbbm9ybWFsaXplVmFsdWUodmFsdWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5tYXApLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGhpcy5tYXBbbmFtZV0uZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBuYW1lLCB0aGlzKVxuICAgICAgfSwgdGhpcylcbiAgICB9LCB0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKTtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIC8vIE9ubHkgc3VwcG9ydCBBcnJheUJ1ZmZlcnMgZm9yIFBPU1QgbWV0aG9kLlxuICAgICAgICAvLyBSZWNlaXZpbmcgQXJyYXlCdWZmZXJzIGhhcHBlbnMgdmlhIEJsb2JzLCBpbnN0ZWFkLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIHJldHVybiByZWplY3RlZCA/IHJlamVjdGVkIDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuICAgIGlmIChSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IGlucHV0XG4gICAgfVxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSlcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhlYWRlcnMoeGhyKSB7XG4gICAgdmFyIGhlYWQgPSBuZXcgSGVhZGVycygpXG4gICAgdmFyIHBhaXJzID0geGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpLnRyaW0oKS5zcGxpdCgnXFxuJylcbiAgICBwYWlycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgdmFyIHNwbGl0ID0gaGVhZGVyLnRyaW0oKS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gc3BsaXQuc2hpZnQoKS50cmltKClcbiAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJzonKS50cmltKClcbiAgICAgIGhlYWQuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfSlcbiAgICByZXR1cm4gaGVhZFxuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9IG9wdGlvbnMuc3RhdHVzVGV4dFxuICAgIHRoaXMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMgPyBvcHRpb25zLmhlYWRlcnMgOiBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVycztcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdDtcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0XG4gICAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkgJiYgIWluaXQpIHtcbiAgICAgICAgcmVxdWVzdCA9IGlucHV0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB9XG5cbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBmdW5jdGlvbiByZXNwb25zZVVSTCgpIHtcbiAgICAgICAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgICAgIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0YXR1cyA9ICh4aHIuc3RhdHVzID09PSAxMjIzKSA/IDIwNCA6IHhoci5zdGF0dXNcbiAgICAgICAgaWYgKHN0YXR1cyA8IDEwMCB8fCBzdGF0dXMgPiA1OTkpIHtcbiAgICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMoeGhyKSxcbiAgICAgICAgICB1cmw6IHJlc3BvbnNlVVJMKClcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCJsZXQgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpe1xuICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUpXG4gIGxldCBtYXBcblxuICBpZihldmVudC50eXBlID09PSAnZXZlbnQnKXtcbiAgICBsZXQgbWlkaUV2ZW50ID0gZXZlbnQuZGF0YVxuICAgIGxldCBtaWRpRXZlbnRUeXBlID0gbWlkaUV2ZW50LnR5cGVcbiAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudFR5cGUpXG4gICAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKG1pZGlFdmVudFR5cGUpKXtcbiAgICAgIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldChtaWRpRXZlbnRUeXBlKVxuICAgICAgZm9yKGxldCBjYiBvZiBtYXAudmFsdWVzKCkpe1xuICAgICAgICBjYihtaWRpRXZlbnQpXG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICBpZihldmVudExpc3RlbmVycy5oYXMoZXZlbnQudHlwZSkgPT09IGZhbHNlKXtcbiAgICByZXR1cm5cbiAgfVxuXG4gIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKVxuICBmb3IobGV0IGNiIG9mIG1hcC52YWx1ZXMoKSl7XG4gICAgY2IoZXZlbnQpXG4gIH1cblxuXG4gIC8vIEB0b2RvOiBydW4gZmlsdGVycyBoZXJlLCBmb3IgaW5zdGFuY2UgaWYgYW4gZXZlbnRsaXN0ZW5lciBoYXMgYmVlbiBhZGRlZCB0byBhbGwgTk9URV9PTiBldmVudHMsIGNoZWNrIHRoZSB0eXBlIG9mIHRoZSBpbmNvbWluZyBldmVudFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgY2FsbGJhY2spe1xuXG4gIGxldCBtYXBcbiAgbGV0IGlkID0gYCR7dHlwZX1fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG5cbiAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpID09PSBmYWxzZSl7XG4gICAgbWFwID0gbmV3IE1hcCgpXG4gICAgZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIG1hcClcbiAgfWVsc2V7XG4gICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpXG4gIH1cblxuICBtYXAuc2V0KGlkLCBjYWxsYmFjaylcbiAgLy9jb25zb2xlLmxvZyhldmVudExpc3RlbmVycylcbiAgcmV0dXJuIGlkXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpe1xuXG4gIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUubG9nKCdubyBldmVudGxpc3RlbmVycyBvZiB0eXBlJyArIHR5cGUpXG4gICAgcmV0dXJuXG4gIH1cblxuICBsZXQgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpXG5cbiAgaWYodHlwZW9mIGlkID09PSAnZnVuY3Rpb24nKXtcbiAgICBmb3IobGV0IFtrZXksIHZhbHVlXSBvZiBtYXAuZW50cmllcygpKSB7XG4gICAgICBjb25zb2xlLmxvZyhrZXksIHZhbHVlKVxuICAgICAgaWYodmFsdWUgPT09IGlkKXtcbiAgICAgICAgY29uc29sZS5sb2coa2V5KVxuICAgICAgICBpZCA9IGtleVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBpZih0eXBlb2YgaWQgPT09ICdzdHJpbmcnKXtcbiAgICAgIG1hcC5kZWxldGUoaWQpXG4gICAgfVxuICB9ZWxzZSBpZih0eXBlb2YgaWQgPT09ICdzdHJpbmcnKXtcbiAgICBtYXAuZGVsZXRlKGlkKVxuICB9ZWxzZXtcbiAgICBjb25zb2xlLmxvZygnY291bGQgbm90IHJlbW92ZSBldmVudGxpc3RlbmVyJylcbiAgfVxufVxuXG4iLCIvLyBmZXRjaCBoZWxwZXJzXG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0dXMocmVzcG9uc2UpIHtcbiAgaWYocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApe1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2UpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0KSlcblxufVxuXG5leHBvcnQgZnVuY3Rpb24ganNvbihyZXNwb25zZSl7XG4gIHJldHVybiByZXNwb25zZS5qc29uKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFycmF5QnVmZmVyKHJlc3BvbnNlKXtcbiAgcmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKClcbn1cbiIsImltcG9ydCB7aW5pdEF1ZGlvfSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge2luaXRNSURJfSBmcm9tICcuL2luaXRfbWlkaSdcblxuZXhwb3J0IGxldCBnZXRVc2VyTWVkaWEgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybignZ2V0VXNlck1lZGlhIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZXhwb3J0IGxldCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybigncmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZXhwb3J0IGxldCBCbG9iID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB3aW5kb3cuQmxvYiB8fCB3aW5kb3cud2Via2l0QmxvYlxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybignQmxvYiBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KHNldHRpbmdzID0ge30pOiB2b2lke1xuXG4gIC8vIGxvYWQgc2V0dGluZ3MuaW5zdHJ1bWVudHMgKGFycmF5IG9yIG9iamVjdClcbiAgLy8gbG9hZCBzZXR0aW5ncy5taWRpZmlsZXMgKGFycmF5IG9yIG9iamVjdClcbiAgLypcblxuICAgIHFhbWJpLmluaXQoe1xuICAgICAgaW5zdHJ1bWVudHM6IFsnLi4vaW5zdHJ1bWVudHMvcGlhbm8nLCAnLi4vaW5zdHJ1bWVudHMvdmlvbGluJ10sXG4gICAgICBtaWRpZmlsZXM6IFsnLi4vbWlkaS9tb3phcnQubWlkJ11cbiAgICB9KVxuICAgIC50aGVuKChsb2FkZWQpID0+IHtcbiAgICAgIGxldCBbcGlhbm8sIHZpb2xpbl0gPSBsb2FkZWQuaW5zdHJ1bWVudHNcbiAgICAgIGxldCBbbW96YXJ0XSA9IGxvYWRlZC5taWRpZmlsZXNcbiAgICB9KVxuXG4gICovXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgIFByb21pc2UuYWxsKFtpbml0QXVkaW8oKSwgaW5pdE1JREkoKV0pXG4gICAgLnRoZW4oXG4gICAgKGRhdGEpID0+IHtcbiAgICAgIC8vIHBhcnNlQXVkaW9cbiAgICAgIGxldCBkYXRhQXVkaW8gPSBkYXRhWzBdXG5cbiAgICAgIC8vIHBhcnNlTUlESVxuICAgICAgbGV0IGRhdGFNaWRpID0gZGF0YVsxXVxuXG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgbGVnYWN5OiBkYXRhQXVkaW8ubGVnYWN5LFxuICAgICAgICBtcDM6IGRhdGFBdWRpby5tcDMsXG4gICAgICAgIG9nZzogZGF0YUF1ZGlvLm9nZyxcbiAgICAgICAgbWlkaTogZGF0YU1pZGkubWlkaSxcbiAgICAgICAgd2VibWlkaTogZGF0YU1pZGkud2VibWlkaSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICAoZXJyb3IpID0+IHtcbiAgICAgIHJlamVjdChlcnJvcilcbiAgICB9KVxuICB9KVxufVxuIiwiLypcbiAgU2V0cyB1cCB0aGUgYmFzaWMgYXVkaW8gcm91dGluZywgdGVzdHMgd2hpY2ggYXVkaW8gZm9ybWF0cyBhcmUgc3VwcG9ydGVkIGFuZCBwYXJzZXMgdGhlIHNhbXBsZXMgZm9yIHRoZSBtZXRyb25vbWUgdGlja3MuXG4qL1xuXG5pbXBvcnQgc2FtcGxlcyBmcm9tICcuL3NhbXBsZXMnXG5pbXBvcnQge3BhcnNlU2FtcGxlc30gZnJvbSAnLi9wYXJzZV9hdWRpbydcblxubGV0XG4gIG1hc3RlckdhaW4sXG4gIGNvbXByZXNzb3IsXG4gIGluaXRpYWxpemVkID0gZmFsc2VcblxuZXhwb3J0IGxldCBjb250ZXh0ID0gKGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nKCdpbml0IEF1ZGlvQ29udGV4dCcpXG4gIGxldCBjdHhcbiAgaWYodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpe1xuICAgIGxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHRcbiAgICBpZihBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKVxuICAgIH1cbiAgfVxuICBpZih0eXBlb2YgY3R4ID09PSAndW5kZWZpbmVkJyl7XG4gICAgLy9AVE9ETzogY3JlYXRlIGR1bW15IEF1ZGlvQ29udGV4dCBmb3IgdXNlIGluIG5vZGUsIHNlZTogaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvYXVkaW8tY29udGV4dFxuICAgIGNvbnRleHQgPSB7XG4gICAgICBjcmVhdGVHYWluOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGdhaW46IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZU9zY2lsbGF0b3I6IGZ1bmN0aW9uKCl7fSxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN0eFxufSgpKVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0QXVkaW8oKXtcblxuICBpZih0eXBlb2YgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW5cbiAgfVxuICAvLyBjaGVjayBmb3Igb2xkZXIgaW1wbGVtZW50YXRpb25zIG9mIFdlYkF1ZGlvXG4gIGxldCBkYXRhID0ge31cbiAgbGV0IHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgZGF0YS5sZWdhY3kgPSBmYWxzZVxuICBpZih0eXBlb2Ygc291cmNlLnN0YXJ0ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZGF0YS5sZWdhY3kgPSB0cnVlXG4gIH1cblxuICAvLyBzZXQgdXAgdGhlIGVsZW1lbnRhcnkgYXVkaW8gbm9kZXNcbiAgY29tcHJlc3NvciA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKClcbiAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlKClcbiAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IDAuNVxuICBpbml0aWFsaXplZCA9IHRydWVcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgcGFyc2VTYW1wbGVzKHNhbXBsZXMpLnRoZW4oXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChidWZmZXJzKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhidWZmZXJzKVxuICAgICAgICBkYXRhLm9nZyA9IHR5cGVvZiBidWZmZXJzLmVtcHR5T2dnICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICBkYXRhLm1wMyA9IHR5cGVvZiBidWZmZXJzLmVtcHR5TXAzICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICBkYXRhLmxvd3RpY2sgPSBidWZmZXJzLmxvd3RpY2tcbiAgICAgICAgZGF0YS5oaWdodGljayA9IGJ1ZmZlcnMuaGlnaHRpY2tcbiAgICAgICAgaWYoZGF0YS5vZ2cgPT09IGZhbHNlICYmIGRhdGEubXAzID09PSBmYWxzZSl7XG4gICAgICAgICAgcmVqZWN0KCdObyBzdXBwb3J0IGZvciBvZ2cgbm9yIG1wMyEnKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKGRhdGEpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKCl7XG4gICAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgaW5pdGlhbGl6aW5nIEF1ZGlvJylcbiAgICAgIH1cbiAgICApXG4gIH0pXG59XG5cblxubGV0IHNldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKHZhbHVlOiBudW1iZXIgPSAwLjUpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIHNldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKHZhbHVlOiBudW1iZXIgPSAwLjUpe1xuICAgICAgaWYodmFsdWUgPiAxKXtcbiAgICAgICAgY29uc29sZS5pbmZvKCdtYXhpbWFsIHZvbHVtZSBpcyAxLjAsIHZvbHVtZSBpcyBzZXQgdG8gMS4wJyk7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHZhbHVlIDwgMCA/IDAgOiB2YWx1ZSA+IDEgPyAxIDogdmFsdWVcbiAgICAgIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXRNYXN0ZXJWb2x1bWUodmFsdWUpXG4gIH1cbn1cblxuXG5sZXQgZ2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TWFzdGVyVm9sdW1lKClcbiAgfVxufVxuXG5cbmxldCBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGNvbXByZXNzb3IucmVkdWN0aW9uLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRDb21wcmVzc2lvblJlZHVjdGlvbigpXG4gIH1cbn1cblxuXG5sZXQgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGZsYWc6IGJvb2xlYW4pe1xuICAgICAgaWYoZmxhZyl7XG4gICAgICAgIG1hc3RlckdhaW4uZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbXByZXNzb3IpO1xuICAgICAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIGNvbXByZXNzb3IuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICBlbmFibGVNYXN0ZXJDb21wcmVzc29yKClcbiAgfVxufVxuXG5cbmxldCBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oY2ZnKTogdm9pZHtcbiAgLypcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBhdHRhY2s7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBrbmVlOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJhdGlvOyAvLyB1bml0LWxlc3NcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWR1Y3Rpb247IC8vIGluIERlY2liZWxzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVsZWFzZTsgLy8gaW4gU2Vjb25kc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHRocmVzaG9sZDsgLy8gaW4gRGVjaWJlbHNcblxuICAgIEBzZWU6IGh0dHA6Ly93ZWJhdWRpby5naXRodWIuaW8vd2ViLWF1ZGlvLWFwaS8jdGhlLWR5bmFtaWNzY29tcHJlc3Nvcm5vZGUtaW50ZXJmYWNlXG4gICovXG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGNmZzoge30pe1xuICAgICAgKHtcbiAgICAgICAgYXR0YWNrOiBjb21wcmVzc29yLmF0dGFjayA9IDAuMDAzLFxuICAgICAgICBrbmVlOiBjb21wcmVzc29yLmtuZWUgPSAzMCxcbiAgICAgICAgcmF0aW86IGNvbXByZXNzb3IucmF0aW8gPSAxMixcbiAgICAgICAgcmVkdWN0aW9uOiBjb21wcmVzc29yLnJlZHVjdGlvbiA9IDAsXG4gICAgICAgIHJlbGVhc2U6IGNvbXByZXNzb3IucmVsZWFzZSA9IDAuMjUwLFxuICAgICAgICB0aHJlc2hvbGQ6IGNvbXByZXNzb3IudGhyZXNob2xkID0gLTI0LFxuICAgICAgfSA9IGNmZylcbiAgICB9XG4gICAgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvcihjZmcpXG4gIH1cbn1cblxuZXhwb3J0IHttYXN0ZXJHYWluLCBjb21wcmVzc29yIGFzIG1hc3RlckNvbXByZXNzb3IsIHNldE1hc3RlclZvbHVtZSwgZ2V0TWFzdGVyVm9sdW1lLCBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiwgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciwgY29uZmlndXJlTWFzdGVyQ29tcHJlc3Nvcn1cbiIsIi8qXG4gIFJlcXVlc3RzIE1JREkgYWNjZXNzLCBxdWVyaWVzIGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgYW5kIHN0b3JlcyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxuKi9cblxuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5cblxubGV0IE1JRElBY2Nlc3NcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlXG5sZXQgaW5wdXRzID0gW11cbmxldCBvdXRwdXRzID0gW11cbmxldCBpbnB1dElkcyA9IFtdXG5sZXQgb3V0cHV0SWRzID0gW11cbmxldCBpbnB1dHNCeUlkID0gbmV3IE1hcCgpXG5sZXQgb3V0cHV0c0J5SWQgPSBuZXcgTWFwKClcblxubGV0IHNvbmdNaWRpRXZlbnRMaXN0ZW5lclxubGV0IG1pZGlFdmVudExpc3RlbmVySWQgPSAwXG5cblxuZnVuY3Rpb24gZ2V0TUlESXBvcnRzKCl7XG4gIGlucHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5pbnB1dHMudmFsdWVzKCkpXG5cbiAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gIGlucHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSlcblxuICBmb3IobGV0IHBvcnQgb2YgaW5wdXRzKXtcbiAgICBpbnB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KVxuICAgIGlucHV0SWRzLnB1c2gocG9ydC5pZClcbiAgfVxuXG4gIG91dHB1dHMgPSBBcnJheS5mcm9tKE1JRElBY2Nlc3Mub3V0cHV0cy52YWx1ZXMoKSlcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgb3V0cHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSlcblxuICBmb3IobGV0IHBvcnQgb2Ygb3V0cHV0cyl7XG4gICAgb3V0cHV0c0J5SWQuc2V0KHBvcnQuaWQsIHBvcnQpXG4gICAgb3V0cHV0SWRzLnB1c2gocG9ydC5pZClcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0TUlESSgpe1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3Qpe1xuXG4gICAgaWYodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICByZXNvbHZlKHttaWRpOiBmYWxzZX0pXG4gICAgfWVsc2UgaWYodHlwZW9mIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyAhPT0gJ3VuZGVmaW5lZCcpe1xuXG4gICAgICBsZXQgamF6eiwgbWlkaSwgd2VibWlkaVxuXG4gICAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MoKS50aGVuKFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uRnVsRmlsbGVkKG1pZGlBY2Nlc3Mpe1xuICAgICAgICAgIE1JRElBY2Nlc3MgPSBtaWRpQWNjZXNzXG4gICAgICAgICAgaWYodHlwZW9mIG1pZGlBY2Nlc3MuX2phenpJbnN0YW5jZXMgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGphenogPSBtaWRpQWNjZXNzLl9qYXp6SW5zdGFuY2VzWzBdLl9KYXp6LnZlcnNpb25cbiAgICAgICAgICAgIG1pZGkgPSB0cnVlXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB3ZWJtaWRpID0gdHJ1ZVxuICAgICAgICAgICAgbWlkaSA9IHRydWVcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBnZXRNSURJcG9ydHMoKVxuXG4gICAgICAgICAgLy8gb25jb25uZWN0IGFuZCBvbmRpc2Nvbm5lY3QgYXJlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIGFuZCBDaHJvbWl1bVxuICAgICAgICAgIG1pZGlBY2Nlc3Mub25jb25uZWN0ID0gZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGV2aWNlIGNvbm5lY3RlZCcsIGUpXG4gICAgICAgICAgICBnZXRNSURJcG9ydHMoKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG1pZGlBY2Nlc3Mub25kaXNjb25uZWN0ID0gZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGV2aWNlIGRpc2Nvbm5lY3RlZCcsIGUpXG4gICAgICAgICAgICBnZXRNSURJcG9ydHMoKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgamF6eixcbiAgICAgICAgICAgIG1pZGksXG4gICAgICAgICAgICB3ZWJtaWRpLFxuICAgICAgICAgICAgaW5wdXRzLFxuICAgICAgICAgICAgb3V0cHV0cyxcbiAgICAgICAgICAgIGlucHV0c0J5SWQsXG4gICAgICAgICAgICBvdXRwdXRzQnlJZCxcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KGUpe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZSlcbiAgICAgICAgICByZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIHJlcXVlc3RpbmcgTUlESUFjY2VzcycsIGUpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAvLyBicm93c2VycyB3aXRob3V0IFdlYk1JREkgQVBJXG4gICAgfWVsc2V7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgIHJlc29sdmUoe21pZGk6IGZhbHNlfSlcbiAgICB9XG4gIH0pXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJQWNjZXNzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJQWNjZXNzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBNSURJQWNjZXNzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJQWNjZXNzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0c1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gaW5wdXRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBvdXRwdXRJZHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElPdXRwdXRJZHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUlucHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGlucHV0SWRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRJZHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbihpZDogc3RyaW5nKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0QnlJZCA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0c0J5SWQuZ2V0KGlkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dEJ5SWQoaWQpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24oaWQ6IHN0cmluZyl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0c0J5SWQuZ2V0KGlkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0QnlJZChpZClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNaWRpU29uZyhzb25nKXtcblxuICBzb25nTWlkaUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKXtcbiAgICAvL2NvbnNvbGUubG9nKGUpXG4gICAgaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIGUsIHRoaXMpO1xuICB9O1xuXG4gIC8vIGJ5IGRlZmF1bHQgYSBzb25nIGxpc3RlbnMgdG8gYWxsIGF2YWlsYWJsZSBtaWRpLWluIHBvcnRzXG4gIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHBvcnQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xuXG4gIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlJbnB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgaW5wdXQgPSBpbnB1dHMuZ2V0KGlkKTtcblxuICBpZihpbnB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIGlucHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaUlucHV0cy5kZWxldGUoaWQpO1xuICAgIGlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChpZCwgaW5wdXQpO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlJbnB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpT3V0cHV0U29uZyhzb25nLCBpZCwgZmxhZyl7XG4gIGxldCBvdXRwdXQgPSBvdXRwdXRzLmdldChpZCk7XG5cbiAgaWYob3V0cHV0ID09PSB1bmRlZmluZWQpe1xuICAgIHdhcm4oJ25vIG1pZGkgb3V0cHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaU91dHB1dHMuZGVsZXRlKGlkKTtcbiAgICBsZXQgdGltZSA9IHNvbmcuc2NoZWR1bGVyLmxhc3RFdmVudFRpbWUgKyAxMDA7XG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aW1lKTsgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWUpOyAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQoaWQsIG91dHB1dCk7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpT3V0cHV0KGlkLCBmbGFnKTtcbiAgfVxufVxuXG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIG1pZGlNZXNzYWdlRXZlbnQsIGlucHV0KXtcbiAgbGV0IG1pZGlFdmVudCA9IG5ldyBNaWRpRXZlbnQoc29uZy50aWNrcywgLi4ubWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5taWRpSW5wdXRzLCBpbnB1dCk7XG5cblxuICAgIC8vaWYobWlkaUV2ZW50LmNoYW5uZWwgPT09IHRyYWNrLmNoYW5uZWwgfHwgdHJhY2suY2hhbm5lbCA9PT0gMCB8fCB0cmFjay5jaGFubmVsID09PSAnYW55Jyl7XG4gICAgLy8gIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjayk7XG4gICAgLy99XG5cblxuICAgIC8vIGxpa2UgaW4gQ3ViYXNlLCBtaWRpIGV2ZW50cyBmcm9tIGFsbCBkZXZpY2VzLCBzZW50IG9uIGFueSBtaWRpIGNoYW5uZWwgYXJlIGZvcndhcmRlZCB0byBhbGwgdHJhY2tzXG4gICAgLy8gc2V0IHRyYWNrLm1vbml0b3IgdG8gZmFsc2UgaWYgeW91IGRvbid0IHdhbnQgdG8gcmVjZWl2ZSBtaWRpIGV2ZW50cyBvbiBhIGNlcnRhaW4gdHJhY2tcbiAgICAvLyBub3RlIHRoYXQgdHJhY2subW9uaXRvciBpcyBieSBkZWZhdWx0IHNldCB0byBmYWxzZSBhbmQgdGhhdCB0cmFjay5tb25pdG9yIGlzIGF1dG9tYXRpY2FsbHkgc2V0IHRvIHRydWVcbiAgICAvLyBpZiB5b3UgYXJlIHJlY29yZGluZyBvbiB0aGF0IHRyYWNrXG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5tb25pdG9yLCB0cmFjay5pZCwgaW5wdXQuaWQpO1xuICAgIGlmKHRyYWNrLm1vbml0b3IgPT09IHRydWUgJiYgdHJhY2subWlkaUlucHV0cy5nZXQoaW5wdXQuaWQpICE9PSB1bmRlZmluZWQpe1xuICAgICAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrLCBpbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgbGV0IGxpc3RlbmVycyA9IHNvbmcubWlkaUV2ZW50TGlzdGVuZXJzLmdldChtaWRpRXZlbnQudHlwZSk7XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBmb3IobGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycyl7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKHRyYWNrLCBtaWRpRXZlbnQsIGlucHV0KXtcbiAgbGV0IHNvbmcgPSB0cmFjay5zb25nLFxuICAgIG5vdGUsIGxpc3RlbmVycywgY2hhbm5lbDtcbiAgICAvL2RhdGEgPSBtaWRpTWVzc2FnZUV2ZW50LmRhdGEsXG4gICAgLy9taWRpRXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoc29uZy50aWNrcywgZGF0YVswXSwgZGF0YVsxXSwgZGF0YVsyXSk7XG5cbiAgLy9taWRpRXZlbnQuc291cmNlID0gbWlkaU1lc3NhZ2VFdmVudC5zcmNFbGVtZW50Lm5hbWU7XG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudClcbiAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCBtaWRpRXZlbnQudHlwZSk7XG5cbiAgLy8gYWRkIHRoZSBleGFjdCB0aW1lIG9mIHRoaXMgZXZlbnQgc28gd2UgY2FuIGNhbGN1bGF0ZSBpdHMgdGlja3MgcG9zaXRpb25cbiAgbWlkaUV2ZW50LnJlY29yZE1pbGxpcyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwOyAvLyBtaWxsaXNcbiAgbWlkaUV2ZW50LnN0YXRlID0gJ3JlY29yZGVkJztcblxuICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICBub3RlID0gY3JlYXRlTWlkaU5vdGUobWlkaUV2ZW50KTtcbiAgICB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdID0gbm90ZTtcbiAgICAvL3RyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF0gPSBub3RlO1xuICB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICBub3RlID0gdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvLyBjaGVjayBpZiB0aGUgbm90ZSBleGlzdHM6IGlmIHRoZSB1c2VyIHBsYXlzIG5vdGVzIG9uIGhlciBrZXlib2FyZCBiZWZvcmUgdGhlIG1pZGkgc3lzdGVtIGhhc1xuICAgIC8vIGJlZW4gZnVsbHkgaW5pdGlhbGl6ZWQsIGl0IGNhbiBoYXBwZW4gdGhhdCB0aGUgZmlyc3QgaW5jb21pbmcgbWlkaSBldmVudCBpcyBhIE5PVEUgT0ZGIGV2ZW50XG4gICAgaWYobm90ZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm90ZS5hZGROb3RlT2ZmKG1pZGlFdmVudCk7XG4gICAgZGVsZXRlIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy9kZWxldGUgdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXTtcbiAgfVxuXG4gIC8vY29uc29sZS5sb2coc29uZy5wcmVyb2xsLCBzb25nLnJlY29yZGluZywgdHJhY2sucmVjb3JkRW5hYmxlZCk7XG5cbiAgaWYoKHNvbmcucHJlcm9sbGluZyB8fCBzb25nLnJlY29yZGluZykgJiYgdHJhY2sucmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKXtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIHRyYWNrLnNvbmcucmVjb3JkZWROb3Rlcy5wdXNoKG5vdGUpO1xuICAgIH1cbiAgICB0cmFjay5yZWNvcmRQYXJ0LmFkZEV2ZW50KG1pZGlFdmVudCk7XG4gICAgLy8gc29uZy5yZWNvcmRlZEV2ZW50cyBpcyB1c2VkIGluIHRoZSBrZXkgZWRpdG9yXG4gICAgdHJhY2suc29uZy5yZWNvcmRlZEV2ZW50cy5wdXNoKG1pZGlFdmVudCk7XG4gIH1lbHNlIGlmKHRyYWNrLmVuYWJsZVJldHJvc3BlY3RpdmVSZWNvcmRpbmcpe1xuICAgIHRyYWNrLnJldHJvc3BlY3RpdmVSZWNvcmRpbmcucHVzaChtaWRpRXZlbnQpO1xuICB9XG5cbiAgLy8gY2FsbCBhbGwgbWlkaSBldmVudCBsaXN0ZW5lcnNcbiAgbGlzdGVuZXJzID0gdHJhY2subWlkaUV2ZW50TGlzdGVuZXJzW21pZGlFdmVudC50eXBlXTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIG9iamVjdEZvckVhY2gobGlzdGVuZXJzLCBmdW5jdGlvbihsaXN0ZW5lcil7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoYW5uZWwgPSB0cmFjay5jaGFubmVsO1xuICBpZihjaGFubmVsID09PSAnYW55JyB8fCBjaGFubmVsID09PSB1bmRlZmluZWQgfHwgaXNOYU4oY2hhbm5lbCkgPT09IHRydWUpe1xuICAgIGNoYW5uZWwgPSAwO1xuICB9XG5cbiAgb2JqZWN0Rm9yRWFjaCh0cmFjay5taWRpT3V0cHV0cywgZnVuY3Rpb24ob3V0cHV0KXtcbiAgICAvL2NvbnNvbGUubG9nKCdtaWRpIG91dCcsIG91dHB1dCwgbWlkaUV2ZW50LnR5cGUpO1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjggfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE0NCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyKTtcbiAgICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgICAvLyB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTkyKXtcbiAgICAvLyAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExXSk7XG4gICAgfVxuICAgIC8vb3V0cHV0LnNlbmQoW21pZGlFdmVudC5zdGF0dXMgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICB9KTtcblxuICAvLyBAVE9ETzogbWF5YmUgYSB0cmFjayBzaG91bGQgYmUgYWJsZSB0byBzZW5kIGl0cyBldmVudCB0byBib3RoIGEgbWlkaS1vdXQgcG9ydCBhbmQgYW4gaW50ZXJuYWwgaGVhcnRiZWF0IHNvbmc/XG4gIC8vY29uc29sZS5sb2codHJhY2sucm91dGVUb01pZGlPdXQpO1xuICBpZih0cmFjay5yb3V0ZVRvTWlkaU91dCA9PT0gZmFsc2Upe1xuICAgIG1pZGlFdmVudC50cmFjayA9IHRyYWNrO1xuICAgIHRyYWNrLmluc3RydW1lbnQucHJvY2Vzc0V2ZW50KG1pZGlFdmVudCk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBhZGRNaWRpRXZlbnRMaXN0ZW5lciguLi5hcmdzKXsgLy8gY2FsbGVyIGNhbiBiZSBhIHRyYWNrIG9yIGEgc29uZ1xuXG4gIGxldCBpZCA9IG1pZGlFdmVudExpc3RlbmVySWQrKztcbiAgbGV0IGxpc3RlbmVyO1xuICAgIHR5cGVzID0ge30sXG4gICAgaWRzID0gW10sXG4gICAgbG9vcDtcblxuXG4gIC8vIHNob3VsZCBJIGlubGluZSB0aGlzP1xuICBsb29wID0gZnVuY3Rpb24oYXJncyl7XG4gICAgZm9yKGxldCBhcmcgb2YgYXJncyl7XG4gICAgICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcoYXJnKTtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgICBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgbG9vcChhcmcpO1xuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgIGxpc3RlbmVyID0gYXJnO1xuICAgICAgfWVsc2UgaWYoaXNOYU4oYXJnKSA9PT0gZmFsc2Upe1xuICAgICAgICBhcmcgPSBwYXJzZUludChhcmcsIDEwKTtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgYXJnID0gc2VxdWVuY2VyLm1pZGlFdmVudE51bWJlckJ5TmFtZShhcmcpO1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgbG9vcChhcmdzLCAwLCBhcmdzLmxlbmd0aCk7XG4gIC8vY29uc29sZS5sb2coJ3R5cGVzJywgdHlwZXMsICdsaXN0ZW5lcicsIGxpc3RlbmVyKTtcblxuICBvYmplY3RGb3JFYWNoKHR5cGVzLCBmdW5jdGlvbih0eXBlKXtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgIGlmKG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID0ge307XG4gICAgfVxuICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdID0gbGlzdGVuZXI7XG4gICAgaWRzLnB1c2godHlwZSArICdfJyArIGlkKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhvYmoubWlkaUV2ZW50TGlzdGVuZXJzKTtcbiAgcmV0dXJuIGlkcy5sZW5ndGggPT09IDEgPyBpZHNbMF0gOiBpZHM7XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXIoaWQsIG9iail7XG4gIHZhciB0eXBlO1xuICBpZCA9IGlkLnNwbGl0KCdfJyk7XG4gIHR5cGUgPSBpZFswXTtcbiAgaWQgPSBpZFsxXTtcbiAgZGVsZXRlIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVycygpe1xuXG59XG5cbiovXG4iLCJpbXBvcnQge2NyZWF0ZVNhbXBsZX0gZnJvbSAnLi9zYW1wbGUnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7Y3JlYXRlTm90ZX0gZnJvbSAnLi9ub3RlJ1xuaW1wb3J0IHtwYXJzZVNhbXBsZXMyfSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcblxuXG5jb25zdCBwcHEgPSA0ODBcbmNvbnN0IGJwbSA9IDEyMFxuY29uc3QgcGxheWJhY2tTcGVlZCA9IDFcbmNvbnN0IG1pbGxpc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHFcblxuZXhwb3J0IGNsYXNzIEluc3RydW1lbnR7XG5cbiAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgdHlwZTogc3RyaW5nKXtcbiAgICB0aGlzLmlkID0gaWRcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgLy8gY3JlYXRlIGEgc2FtcGxlcyBkYXRhIG9iamVjdCBmb3IgYWxsIDEyOCB2ZWxvY2l0eSBsZXZlbHMgb2YgYWxsIDEyOCBub3Rlc1xuICAgIHRoaXMuc2FtcGxlc0RhdGEgPSBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKTtcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gdGhpcy5zYW1wbGVzRGF0YS5tYXAoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcyA9IHt9XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICB9XG5cbiAgY29ubmVjdChvdXRwdXQpe1xuICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0XG4gIH1cblxuICBwcm9jZXNzTUlESUV2ZW50KGV2ZW50LCB0aW1lKXtcbiAgICBsZXQgc2FtcGxlLCBzYW1wbGVEYXRhXG4gICAgdGltZSA9IHRpbWUgfHwgY29udGV4dC5jdXJyZW50VGltZSArIChldmVudC50aWNrcyAqIG1pbGxpc1BlclRpY2spXG4gICAgLy9jb25zb2xlLmxvZyh0aW1lKVxuXG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIC8vY29uc29sZS5sb2coMTQ0LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcblxuICAgICAgc2FtcGxlRGF0YSA9IHRoaXMuc2FtcGxlc0RhdGFbZXZlbnQuZGF0YTFdW2V2ZW50LmRhdGEyXTtcbiAgICAgIHNhbXBsZSA9IGNyZWF0ZVNhbXBsZShzYW1wbGVEYXRhLCBldmVudClcbiAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXSA9IHNhbXBsZVxuICAgICAgc2FtcGxlLm91dHB1dC5jb25uZWN0KHRoaXMub3V0cHV0IHx8IGNvbnRleHQuZGVzdGluYXRpb24pXG4gICAgICAvLyBzYW1wbGUuc291cmNlLm9uZW5kZWQgPSAoKSA9PiB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCcgICAgZGVsZXRpbmcnLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgLy8gICBkZWxldGUgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICAvLyB9XG4gICAgICBzYW1wbGUuc3RhcnQodGltZSlcbiAgICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxpbmcnLCBldmVudC5pZCwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIC8vY29uc29sZS5sb2coJ3N0YXJ0JywgZXZlbnQubWlkaU5vdGVJZClcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgLy9jb25zb2xlLmxvZygxMjgsICc6JywgdGltZSwgY29udGV4dC5jdXJyZW50VGltZSwgZXZlbnQubWlsbGlzKVxuICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICBpZih0eXBlb2Ygc2FtcGxlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGNvbnNvbGUuaW5mbygnc2FtcGxlIG5vdCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZCwgJyBtaWRpTm90ZScsIGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLnB1c2goZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIH1lbHNle1xuICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXVxuICAgICAgICB9KVxuICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICB9XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vIHN1c3RhaW4gcGVkYWxcbiAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IHRydWVcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgICAgZGF0YTogJ2Rvd24nXG4gICAgICAgICAgfSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIGRvd24nKVxuICAgICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMCl7XG4gICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMuZm9yRWFjaCgobWlkaU5vdGVJZCkgPT4ge1xuICAgICAgICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzW21pZGlOb3RlSWRdXG4gICAgICAgICAgICBpZihzYW1wbGUpe1xuICAgICAgICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICAgICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wJywgbWlkaU5vdGVJZClcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW21pZGlOb3RlSWRdXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIHVwJywgdGhpcy5zdXN0YWluZWRTYW1wbGVzKVxuICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgIGRhdGE6ICd1cCdcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vdGhpcy5zdG9wU3VzdGFpbih0aW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBwYW5uaW5nXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gMTApe1xuICAgICAgICAvLyBwYW5uaW5nIGlzICpub3QqIGV4YWN0bHkgdGltZWQgLT4gbm90IHBvc3NpYmxlICh5ZXQpIHdpdGggV2ViQXVkaW9cbiAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhMiwgcmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcbiAgICAgICAgLy90cmFjay5zZXRQYW5uaW5nKHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG5cbiAgICAgIC8vIHZvbHVtZVxuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTEgPT09IDcpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGxvYWQgYW5kIHBhcnNlXG4gIHBhcnNlU2FtcGxlRGF0YShkYXRhKXtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBwYXJzZVNhbXBsZXMyKGRhdGEpXG4gICAgICAudGhlbigocmVzdWx0KSA9PiB7XG5cbiAgICAgICAgaWYodHlwZW9mIGRhdGEucmVsZWFzZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIHRoaXMuc2V0UmVsZWFzZShkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0LmZvckVhY2goKHNhbXBsZSkgPT4ge1xuICAgICAgICAgIGxldCBzYW1wbGVEYXRhID0gZGF0YVtzYW1wbGUuaWRdXG4gICAgICAgICAgaWYodHlwZW9mIHNhbXBsZURhdGEgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgIGJ1ZmZlcjogc2FtcGxlLmJ1ZmZlclxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBzYW1wbGUuYnVmZmVyXG4gICAgICAgICAgfVxuICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHNhbXBsZS5pZFxuICAgICAgICAgIHRoaXMudXBkYXRlU2FtcGxlRGF0YShzYW1wbGVEYXRhKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLypcbiAgICBAcGFyYW0gY29uZmlnIChvcHRpb25hbClcbiAgICAgIHtcbiAgICAgICAgbm90ZTogY2FuIGJlIG5vdGUgbmFtZSAoQzQpIG9yIG5vdGUgbnVtYmVyICg2MClcbiAgICAgICAgYnVmZmVyOiBBdWRpb0J1ZmZlclxuICAgICAgICBzdXN0YWluOiBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSwgLy8gb3B0aW9uYWwsIGluIG1pbGxpc1xuICAgICAgICByZWxlYXNlOiBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdLCAvLyBvcHRpb25hbFxuICAgICAgICBwYW46IHBhblBvc2l0aW9uIC8vIG9wdGlvbmFsXG4gICAgICAgIHZlbG9jaXR5OiBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdIC8vIG9wdGlvbmFsLCBmb3IgbXVsdGktbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgfVxuICAqL1xuICB1cGRhdGVTYW1wbGVEYXRhKC4uLmRhdGEpe1xuICAgIGRhdGEuZm9yRWFjaChub3RlRGF0YSA9PiB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKG5vdGVEYXRhKSlcbiAgfVxuXG4gIF91cGRhdGVTYW1wbGVEYXRhKGRhdGEgPSB7fSl7XG4gICAgbGV0IHtcbiAgICAgIG5vdGUsXG4gICAgICBidWZmZXIgPSBudWxsLFxuICAgICAgc3VzdGFpbiA9IFtudWxsLCBudWxsXSxcbiAgICAgIHJlbGVhc2UgPSBbbnVsbCwgJ2xpbmVhciddLFxuICAgICAgcGFuID0gbnVsbCxcbiAgICAgIHZlbG9jaXR5ID0gWzAsIDEyN10sXG4gICAgfSA9IGRhdGFcblxuICAgIGlmKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbm90ZW51bWJlciBvciBhIG5vdGVuYW1lJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGdldCBub3RlbnVtYmVyIGZyb20gbm90ZW5hbWUgYW5kIGNoZWNrIGlmIHRoZSBub3RlbnVtYmVyIGlzIHZhbGlkXG4gICAgbGV0IG4gPSBjcmVhdGVOb3RlKG5vdGUpXG4gICAgaWYobiA9PT0gZmFsc2Upe1xuICAgICAgY29uc29sZS53YXJuKCdub3QgYSB2YWxpZCBub3RlIGlkJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBub3RlID0gbi5udW1iZXJcblxuICAgIGxldCBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSA9IHN1c3RhaW5cbiAgICBsZXQgW3JlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlXSA9IHJlbGVhc2VcbiAgICBsZXQgW3ZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kXSA9IHZlbG9jaXR5XG5cbiAgICBpZihzdXN0YWluLmxlbmd0aCAhPT0gMil7XG4gICAgICBzdXN0YWluU3RhcnQgPSBzdXN0YWluRW5kID0gbnVsbFxuICAgIH1cblxuICAgIGlmKHJlbGVhc2VEdXJhdGlvbiA9PT0gbnVsbCl7XG4gICAgICByZWxlYXNlRW52ZWxvcGUgPSBudWxsXG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2cobm90ZUlkLCBidWZmZXIpO1xuICAgIC8vIGNvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZCk7XG4gICAgLy8gY29uc29sZS5sb2cocmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUpO1xuICAgIC8vIGNvbnNvbGUubG9nKHBhbik7XG4gICAgLy8gY29uc29sZS5sb2codmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmQpO1xuXG5cbiAgICB0aGlzLnNhbXBsZXNEYXRhW25vdGVdLmZvckVhY2goKHNhbXBsZURhdGEsIGkpID0+IHtcbiAgICAgIGlmKGkgPj0gdmVsb2NpdHlTdGFydCAmJiBpIDwgdmVsb2NpdHlFbmQpe1xuICAgICAgICBpZihzYW1wbGVEYXRhID09PSAtMSl7XG4gICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgIGlkOiBub3RlXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBidWZmZXIgfHwgc2FtcGxlRGF0YS5idWZmZXJcbiAgICAgICAgc2FtcGxlRGF0YS5zdXN0YWluU3RhcnQgPSBzdXN0YWluU3RhcnQgfHwgc2FtcGxlRGF0YS5zdXN0YWluU3RhcnRcbiAgICAgICAgc2FtcGxlRGF0YS5zdXN0YWluRW5kID0gc3VzdGFpbkVuZCB8fCBzYW1wbGVEYXRhLnN1c3RhaW5FbmRcbiAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb24gPSByZWxlYXNlRHVyYXRpb24gfHwgc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb25cbiAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSByZWxlYXNlRW52ZWxvcGUgfHwgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVcbiAgICAgICAgc2FtcGxlRGF0YS5wYW4gPSBwYW4gfHwgc2FtcGxlRGF0YS5wYW5cblxuICAgICAgICBpZih0eXBlU3RyaW5nKHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlKSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVBcnJheSA9IHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlXG4gICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSAnYXJyYXknXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGRlbGV0ZSBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZUFycmF5XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zYW1wbGVzRGF0YVtub3RlXVtpXSA9IHNhbXBsZURhdGFcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vY29uc29sZS5sb2coJyVPJywgdGhpcy5zYW1wbGVzRGF0YVtub3RlXSk7XG4gIH1cblxuXG4gIC8vIHN0ZXJlbyBzcHJlYWRcbiAgc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKXtcbiAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICB9XG5cbiAgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcbiAgfVxuXG4gIC8qXG4gICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAqL1xuICBzZXRSZWxlYXNlKGR1cmF0aW9uOiBudW1iZXIsIGVudmVsb3BlKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBmb3IgYWxsIGtleXMsIG92ZXJydWxlcyB2YWx1ZXMgc2V0IGJ5IHNldEtleVNjYWxpbmdSZWxlYXNlKClcbiAgICB0aGlzLnNhbXBsZXNEYXRhLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlcywgaSl7XG4gICAgICBzYW1wbGVzLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlKXtcbiAgICAgICAgaWYoc2FtcGxlID09PSAtMSl7XG4gICAgICAgICAgc2FtcGxlID0ge1xuICAgICAgICAgICAgaWQ6IGlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2FtcGxlLnJlbGVhc2VEdXJhdGlvbiA9IGR1cmF0aW9uXG4gICAgICAgIHNhbXBsZS5yZWxlYXNlRW52ZWxvcGUgPSBlbnZlbG9wZVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICBPYmplY3Qua2V5cyh0aGlzLnNjaGVkdWxlZFNhbXBsZXMpLmZvckVhY2goKHNhbXBsZUlkKSA9PiB7XG4gICAgICAvL2NvbnNvbGUubG9nKCcgIHN0b3BwaW5nJywgc2FtcGxlSWQpXG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbc2FtcGxlSWRdLnN0b3AoKVxuICAgIH0pXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0ge31cblxuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbCcsXG4gICAgICBkYXRhOiAndXAnXG4gICAgfSlcblxuICAgIC8vY29uc29sZS5sb2coJ2FsbE5vdGVzT2ZmJywgdGhpcy5zdXN0YWluZWRTYW1wbGVzLmxlbmd0aCwgdGhpcy5zY2hlZHVsZWRTYW1wbGVzKVxuICB9XG59XG4iLCIvLyBAIGZsb3dcblxubGV0IG1pZGlFdmVudEluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgTUlESUV2ZW50e1xuXG4gIGNvbnN0cnVjdG9yKHRpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlciA9IC0xKXtcbiAgICB0aGlzLmlkID0gYE1FXyR7bWlkaUV2ZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy50aWNrcyA9IHRpY2tzXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuZGF0YTEgPSBkYXRhMVxuICAgIHRoaXMuZGF0YTIgPSBkYXRhMlxuICAgIHRoaXMuZnJlcXVlbmN5ID0gNDQwICogTWF0aC5wb3coMiwgKGRhdGExIC0gNjkpIC8gMTIpXG5cbiAgICBpZihkYXRhMSA9PT0gMTQ0ICYmIGRhdGEyID09PSAwKXtcbiAgICAgIHRoaXMuZGF0YTEgPSAxMjhcbiAgICB9XG5cbiAgICB0aGlzLl9wYXJ0ID0gbnVsbFxuICAgIHRoaXMuX3RyYWNrID0gbnVsbFxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG4gICAgLy9AVE9ETzogYWRkIGFsbCBvdGhlciBwcm9wZXJ0aWVzXG4gIH1cblxuICBjb3B5KCl7XG4gICAgbGV0IG0gPSBuZXcgTUlESUV2ZW50KHRoaXMudGlja3MsIHRoaXMudHlwZSwgdGhpcy5kYXRhMSwgdGhpcy5kYXRhMilcbiAgICByZXR1cm4gbVxuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKXsgLy8gbWF5IGJlIGJldHRlciBpZiBub3QgYSBwdWJsaWMgbWV0aG9kP1xuICAgIHRoaXMuZGF0YTEgKz0gYW1vdW50XG4gICAgdGhpcy5mcmVxdWVuY3kgPSA0NDAgKiBNYXRoLnBvdygyLCAodGhpcy5kYXRhMSAtIDY5KSAvIDEyKVxuICB9XG5cbiAgbW92ZSh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLnRpY2tzICs9IHRpY2tzXG4gICAgaWYodGhpcy5taWRpTm90ZSl7XG4gICAgICB0aGlzLm1pZGlOb3RlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMudGlja3MgPSB0aWNrc1xuICAgIGlmKHRoaXMubWlkaU5vdGUpe1xuICAgICAgdGhpcy5taWRpTm90ZS51cGRhdGUoKVxuICAgIH1cbiAgfVxufVxuXG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlTUlESUV2ZW50KGV2ZW50KXtcbiAgLy9ldmVudC5ub3RlID0gbnVsbFxuICBldmVudC5ub3RlID0gbnVsbFxuICBldmVudCA9IG51bGxcbn1cbiovXG4iLCJpbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuXG5sZXQgbWlkaU5vdGVJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIE1JRElOb3Rle1xuXG4gIGNvbnN0cnVjdG9yKG5vdGVvbjogTUlESUV2ZW50LCBub3Rlb2ZmOiBNSURJRXZlbnQpe1xuICAgIGlmKG5vdGVvbi50eXBlICE9PSAxNDQgfHwgbm90ZW9mZi50eXBlICE9PSAxMjgpe1xuICAgICAgY29uc29sZS53YXJuKCdjYW5ub3QgY3JlYXRlIE1JRElOb3RlJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmlkID0gYE1OXyR7bWlkaU5vdGVJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5vdGVPbiA9IG5vdGVvblxuICAgIHRoaXMubm90ZU9mZiA9IG5vdGVvZmZcbiAgICBub3Rlb24ubWlkaU5vdGUgPSB0aGlzXG4gICAgbm90ZW9mZi5taWRpTm90ZSA9IHRoaXNcbiAgICBub3Rlb24ubWlkaU5vdGVJZCA9IHRoaXMuaWRcbiAgICBub3Rlb2ZmLm1pZGlOb3RlSWQgPSB0aGlzLmlkXG4gICAgdGhpcy5kdXJhdGlvblRpY2tzID0gbm90ZW9mZi50aWNrcyAtIG5vdGVvbi50aWNrc1xuICAgIHRoaXMuZHVyYXRpb25NaWxsaXMgPSAtMVxuICB9XG5cbiAgY29weSgpe1xuICAgIHJldHVybiBuZXcgTUlESU5vdGUodGhpcy5ub3RlT24uY29weSgpLCB0aGlzLm5vdGVPZmYuY29weSgpKVxuICB9XG5cbiAgdXBkYXRlKCl7IC8vIG1heSB1c2UgYW5vdGhlciBuYW1lIGZvciB0aGlzIG1ldGhvZFxuICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IHRoaXMubm90ZU9mZi50aWNrcyAtIHRoaXMubm90ZU9uLnRpY2tzXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLnRyYW5zcG9zZShhbW91bnQpXG4gICAgdGhpcy5ub3RlT2ZmLnRyYW5zcG9zZShhbW91bnQpXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLm1vdmUodGlja3MpXG4gICAgdGhpcy5ub3RlT2ZmLm1vdmUodGlja3MpXG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcik6IHZvaWR7XG4gICAgdGhpcy5ub3RlT24ubW92ZVRvKHRpY2tzKVxuICAgIHRoaXMubm90ZU9mZi5tb3ZlVG8odGlja3MpXG4gIH1cblxuICB1bnJlZ2lzdGVyKCl7XG4gICAgaWYodGhpcy5wYXJ0KXtcbiAgICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMucGFydCA9IG51bGxcbiAgICB9XG4gICAgaWYodGhpcy50cmFjayl7XG4gICAgICB0aGlzLnRyYWNrLnJlbW92ZUV2ZW50cyh0aGlzKVxuICAgICAgdGhpcy50cmFjayA9IG51bGxcbiAgICB9XG4gICAgaWYodGhpcy5zb25nKXtcbiAgICAgIHRoaXMuc29uZy5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMuc29uZyA9IG51bGxcbiAgICB9XG4gIH1cbn1cblxuIiwiLypcbiAgV3JhcHBlciBmb3IgYWNjZXNzaW5nIGJ5dGVzIHRocm91Z2ggc2VxdWVudGlhbCByZWFkc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuICBhZGFwdGVkIHRvIHdvcmsgd2l0aCBBcnJheUJ1ZmZlciAtPiBVaW50OEFycmF5XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgZmNjID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUlESVN0cmVhbXtcblxuICAvLyBidWZmZXIgaXMgVWludDhBcnJheVxuICBjb25zdHJ1Y3RvcihidWZmZXIpe1xuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgLyogcmVhZCBzdHJpbmcgb3IgYW55IG51bWJlciBvZiBieXRlcyAqL1xuICByZWFkKGxlbmd0aCwgdG9TdHJpbmcgPSB0cnVlKSB7XG4gICAgbGV0IHJlc3VsdDtcblxuICAgIGlmKHRvU3RyaW5nKXtcbiAgICAgIHJlc3VsdCA9ICcnO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQgKz0gZmNjKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfWVsc2V7XG4gICAgICByZXN1bHQgPSBbXTtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAzMi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MzIoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCAyNCkgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXSA8PCAxNikgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAyXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgM11cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gNDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMTYtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDE2KCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYW4gOC1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50OChzaWduZWQpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl07XG4gICAgaWYoc2lnbmVkICYmIHJlc3VsdCA+IDEyNyl7XG4gICAgICByZXN1bHQgLT0gMjU2O1xuICAgIH1cbiAgICB0aGlzLnBvc2l0aW9uICs9IDE7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGVvZigpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbiA+PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICAvKiByZWFkIGEgTUlESS1zdHlsZSBsZXRpYWJsZS1sZW5ndGggaW50ZWdlclxuICAgIChiaWctZW5kaWFuIHZhbHVlIGluIGdyb3VwcyBvZiA3IGJpdHMsXG4gICAgd2l0aCB0b3AgYml0IHNldCB0byBzaWduaWZ5IHRoYXQgYW5vdGhlciBieXRlIGZvbGxvd3MpXG4gICovXG4gIHJlYWRWYXJJbnQoKSB7XG4gICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgbGV0IGIgPSB0aGlzLnJlYWRJbnQ4KCk7XG4gICAgICBpZiAoYiAmIDB4ODApIHtcbiAgICAgICAgcmVzdWx0ICs9IChiICYgMHg3Zik7XG4gICAgICAgIHJlc3VsdCA8PD0gNztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGIgaXMgdGhlIGxhc3QgYnl0ZSAqL1xuICAgICAgICByZXR1cm4gcmVzdWx0ICsgYjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNldCgpe1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgc2V0UG9zaXRpb24ocCl7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHA7XG4gIH1cbn1cbiIsIi8qXG4gIEV4dHJhY3RzIGFsbCBtaWRpIGV2ZW50cyBmcm9tIGEgYmluYXJ5IG1pZGkgZmlsZSwgdXNlcyBtaWRpX3N0cmVhbS5qc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTUlESVN0cmVhbSBmcm9tICcuL21pZGlfc3RyZWFtJztcblxubGV0XG4gIGxhc3RFdmVudFR5cGVCeXRlLFxuICB0cmFja05hbWU7XG5cblxuZnVuY3Rpb24gcmVhZENodW5rKHN0cmVhbSl7XG4gIGxldCBpZCA9IHN0cmVhbS5yZWFkKDQsIHRydWUpO1xuICBsZXQgbGVuZ3RoID0gc3RyZWFtLnJlYWRJbnQzMigpO1xuICAvL2NvbnNvbGUubG9nKGxlbmd0aCk7XG4gIHJldHVybntcbiAgICAnaWQnOiBpZCxcbiAgICAnbGVuZ3RoJzogbGVuZ3RoLFxuICAgICdkYXRhJzogc3RyZWFtLnJlYWQobGVuZ3RoLCBmYWxzZSlcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiByZWFkRXZlbnQoc3RyZWFtKXtcbiAgdmFyIGV2ZW50ID0ge307XG4gIHZhciBsZW5ndGg7XG4gIGV2ZW50LmRlbHRhVGltZSA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gIGxldCBldmVudFR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gIC8vY29uc29sZS5sb2coZXZlbnRUeXBlQnl0ZSwgZXZlbnRUeXBlQnl0ZSAmIDB4ODAsIDE0NiAmIDB4MGYpO1xuICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ZjApID09IDB4ZjApe1xuICAgIC8qIHN5c3RlbSAvIG1ldGEgZXZlbnQgKi9cbiAgICBpZihldmVudFR5cGVCeXRlID09IDB4ZmYpe1xuICAgICAgLyogbWV0YSBldmVudCAqL1xuICAgICAgZXZlbnQudHlwZSA9ICdtZXRhJztcbiAgICAgIGxldCBzdWJ0eXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIHN3aXRjaChzdWJ0eXBlQnl0ZSl7XG4gICAgICAgIGNhc2UgMHgwMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlTnVtYmVyJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2VxdWVuY2VOdW1iZXIgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWJlciA9IHN0cmVhbS5yZWFkSW50MTYoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RleHQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAyOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29weXJpZ2h0Tm90aWNlJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RyYWNrTmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2luc3RydW1lbnROYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2x5cmljcyc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtYXJrZXInO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA3OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY3VlUG9pbnQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDIwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWlkaUNoYW5uZWxQcmVmaXgnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMSl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBtaWRpQ2hhbm5lbFByZWZpeCBldmVudCBpcyAxLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQuY2hhbm5lbCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDJmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnZW5kT2ZUcmFjayc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAwKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGVuZE9mVHJhY2sgZXZlbnQgaXMgMCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDUxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2V0VGVtcG8nO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMyl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXRUZW1wbyBldmVudCBpcyAzLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdCA9IChcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCAxNikgK1xuICAgICAgICAgICAgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDgpICtcbiAgICAgICAgICAgIHN0cmVhbS5yZWFkSW50OCgpXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1NDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NtcHRlT2Zmc2V0JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDUpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc21wdGVPZmZzZXQgZXZlbnQgaXMgNSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBob3VyQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lUmF0ZSA9e1xuICAgICAgICAgICAgMHgwMDogMjQsIDB4MjA6IDI1LCAweDQwOiAyOSwgMHg2MDogMzBcbiAgICAgICAgICB9W2hvdXJCeXRlICYgMHg2MF07XG4gICAgICAgICAgZXZlbnQuaG91ciA9IGhvdXJCeXRlICYgMHgxZjtcbiAgICAgICAgICBldmVudC5taW4gPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zZWMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnN1YmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTg6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0aW1lU2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDQpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgdGltZVNpZ25hdHVyZSBldmVudCBpcyA0LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtZXJhdG9yID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZGVub21pbmF0b3IgPSBNYXRoLnBvdygyLCBzdHJlYW0ucmVhZEludDgoKSk7XG4gICAgICAgICAgZXZlbnQubWV0cm9ub21lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQudGhpcnR5c2Vjb25kcyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU5OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAna2V5U2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Iga2V5U2lnbmF0dXJlIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5rZXkgPSBzdHJlYW0ucmVhZEludDgodHJ1ZSk7XG4gICAgICAgICAgZXZlbnQuc2NhbGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg3ZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlclNwZWNpZmljJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9pZihzZXF1ZW5jZXIuZGVidWcgPj0gMil7XG4gICAgICAgICAgLy8gICAgY29uc29sZS53YXJuKCdVbnJlY29nbmlzZWQgbWV0YSBldmVudCBzdWJ0eXBlOiAnICsgc3VidHlwZUJ5dGUpO1xuICAgICAgICAgIC8vfVxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfVxuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2UgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGYwKXtcbiAgICAgIGV2ZW50LnR5cGUgPSAnc3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmNyl7XG4gICAgICBldmVudC50eXBlID0gJ2RpdmlkZWRTeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZSBieXRlOiAnICsgZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gIH1lbHNle1xuICAgIC8qIGNoYW5uZWwgZXZlbnQgKi9cbiAgICBsZXQgcGFyYW0xO1xuICAgIGlmKChldmVudFR5cGVCeXRlICYgMHg4MCkgPT09IDApe1xuICAgICAgLyogcnVubmluZyBzdGF0dXMgLSByZXVzZSBsYXN0RXZlbnRUeXBlQnl0ZSBhcyB0aGUgZXZlbnQgdHlwZS5cbiAgICAgICAgZXZlbnRUeXBlQnl0ZSBpcyBhY3R1YWxseSB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gICAgICAqL1xuICAgICAgLy9jb25zb2xlLmxvZygncnVubmluZyBzdGF0dXMnKTtcbiAgICAgIHBhcmFtMSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgICBldmVudFR5cGVCeXRlID0gbGFzdEV2ZW50VHlwZUJ5dGU7XG4gICAgfWVsc2V7XG4gICAgICBwYXJhbTEgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2xhc3QnLCBldmVudFR5cGVCeXRlKTtcbiAgICAgIGxhc3RFdmVudFR5cGVCeXRlID0gZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gICAgbGV0IGV2ZW50VHlwZSA9IGV2ZW50VHlwZUJ5dGUgPj4gNDtcbiAgICBldmVudC5jaGFubmVsID0gZXZlbnRUeXBlQnl0ZSAmIDB4MGY7XG4gICAgZXZlbnQudHlwZSA9ICdjaGFubmVsJztcbiAgICBzd2l0Y2ggKGV2ZW50VHlwZSl7XG4gICAgICBjYXNlIDB4MDg6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwOTpcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgaWYoZXZlbnQudmVsb2NpdHkgPT09IDApe1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdub3RlT24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGE6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZUFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC5hbW91bnQgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBiOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvbnRyb2xsZXInO1xuICAgICAgICBldmVudC5jb250cm9sbGVyVHlwZSA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBjOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Byb2dyYW1DaGFuZ2UnO1xuICAgICAgICBldmVudC5wcm9ncmFtTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGQ6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY2hhbm5lbEFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5hbW91bnQgPSBwYXJhbTE7XG4gICAgICAgIC8vaWYodHJhY2tOYW1lID09PSAnU0gtUzEtNDQtQzA5IEw9U01MIElOPTMnKXtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ2NoYW5uZWwgcHJlc3N1cmUnLCB0cmFja05hbWUsIHBhcmFtMSk7XG4gICAgICAgIC8vfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGU6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncGl0Y2hCZW5kJztcbiAgICAgICAgZXZlbnQudmFsdWUgPSBwYXJhbTEgKyAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgNyk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8qXG4gICAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlO1xuICAgICAgICBjb25zb2xlLmxvZygnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZSk7XG4gICAgICAgICovXG5cbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4vKlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgIGNvbnNvbGUubG9nKCd3ZWlyZG8nLCB0cmFja05hbWUsIHBhcmFtMSwgZXZlbnQudmVsb2NpdHkpO1xuKi9cblxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESUZpbGUoYnVmZmVyKXtcbiAgaWYoYnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSA9PT0gZmFsc2UgJiYgYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmVycm9yKCdidWZmZXIgc2hvdWxkIGJlIGFuIGluc3RhbmNlIG9mIFVpbnQ4QXJyYXkgb2YgQXJyYXlCdWZmZXInKVxuICAgIHJldHVyblxuICB9XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gIH1cbiAgbGV0IHRyYWNrcyA9IG5ldyBNYXAoKTtcbiAgbGV0IHN0cmVhbSA9IG5ldyBNSURJU3RyZWFtKGJ1ZmZlcik7XG5cbiAgbGV0IGhlYWRlckNodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gIGlmKGhlYWRlckNodW5rLmlkICE9PSAnTVRoZCcgfHwgaGVhZGVyQ2h1bmsubGVuZ3RoICE9PSA2KXtcbiAgICB0aHJvdyAnQmFkIC5taWQgZmlsZSAtIGhlYWRlciBub3QgZm91bmQnO1xuICB9XG5cbiAgbGV0IGhlYWRlclN0cmVhbSA9IG5ldyBNSURJU3RyZWFtKGhlYWRlckNodW5rLmRhdGEpO1xuICBsZXQgZm9ybWF0VHlwZSA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgbGV0IHRyYWNrQ291bnQgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0aW1lRGl2aXNpb24gPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG5cbiAgaWYodGltZURpdmlzaW9uICYgMHg4MDAwKXtcbiAgICB0aHJvdyAnRXhwcmVzc2luZyB0aW1lIGRpdmlzaW9uIGluIFNNVFBFIGZyYW1lcyBpcyBub3Qgc3VwcG9ydGVkIHlldCc7XG4gIH1cblxuICBsZXQgaGVhZGVyID17XG4gICAgJ2Zvcm1hdFR5cGUnOiBmb3JtYXRUeXBlLFxuICAgICd0cmFja0NvdW50JzogdHJhY2tDb3VudCxcbiAgICAndGlja3NQZXJCZWF0JzogdGltZURpdmlzaW9uXG4gIH07XG5cbiAgZm9yKGxldCBpID0gMDsgaSA8IHRyYWNrQ291bnQ7IGkrKyl7XG4gICAgdHJhY2tOYW1lID0gJ3RyYWNrXycgKyBpO1xuICAgIGxldCB0cmFjayA9IFtdO1xuICAgIGxldCB0cmFja0NodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gICAgaWYodHJhY2tDaHVuay5pZCAhPT0gJ01UcmsnKXtcbiAgICAgIHRocm93ICdVbmV4cGVjdGVkIGNodW5rIC0gZXhwZWN0ZWQgTVRyaywgZ290ICcrIHRyYWNrQ2h1bmsuaWQ7XG4gICAgfVxuICAgIGxldCB0cmFja1N0cmVhbSA9IG5ldyBNSURJU3RyZWFtKHRyYWNrQ2h1bmsuZGF0YSk7XG4gICAgd2hpbGUoIXRyYWNrU3RyZWFtLmVvZigpKXtcbiAgICAgIGxldCBldmVudCA9IHJlYWRFdmVudCh0cmFja1N0cmVhbSk7XG4gICAgICB0cmFjay5wdXNoKGV2ZW50KTtcbiAgICB9XG4gICAgdHJhY2tzLnNldCh0cmFja05hbWUsIHRyYWNrKTtcbiAgfVxuXG4gIHJldHVybntcbiAgICAnaGVhZGVyJzogaGVhZGVyLFxuICAgICd0cmFja3MnOiB0cmFja3NcbiAgfTtcbn0iLCIvKlxuICBBZGRzIGEgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbm90ZSBvYmplY3QgdGhhdCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhIG11c2ljYWwgbm90ZTpcbiAgICAtIG5hbWUsIGUuZy4gJ0MnXG4gICAgLSBvY3RhdmUsICAtMSAtIDlcbiAgICAtIGZ1bGxOYW1lOiAnQzEnXG4gICAgLSBmcmVxdWVuY3k6IDIzNC4xNiwgYmFzZWQgb24gdGhlIGJhc2ljIHBpdGNoXG4gICAgLSBudW1iZXI6IDYwIG1pZGkgbm90ZSBudW1iZXJcblxuICBBZGRzIHNldmVyYWwgdXRpbGl0eSBtZXRob2RzIG9yZ2FuaXNlZCBhcm91bmQgdGhlIG5vdGUgb2JqZWN0XG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7dHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJztcblxubGV0XG4gIGVycm9yTXNnLFxuICB3YXJuaW5nTXNnLFxuICBwb3cgPSBNYXRoLnBvdyxcbiAgZmxvb3IgPSBNYXRoLmZsb29yO1xuXG5jb25zdCBub3RlTmFtZXMgPSB7XG4gICdzaGFycCcgOiBbJ0MnLCAnQyMnLCAnRCcsICdEIycsICdFJywgJ0YnLCAnRiMnLCAnRycsICdHIycsICdBJywgJ0EjJywgJ0InXSxcbiAgJ2ZsYXQnIDogWydDJywgJ0RiJywgJ0QnLCAnRWInLCAnRScsICdGJywgJ0diJywgJ0cnLCAnQWInLCAnQScsICdCYicsICdCJ10sXG4gICdlbmhhcm1vbmljLXNoYXJwJyA6IFsnQiMnLCAnQyMnLCAnQyMjJywgJ0QjJywgJ0QjIycsICdFIycsICdGIycsICdGIyMnLCAnRyMnLCAnRyMjJywgJ0EjJywgJ0EjIyddLFxuICAnZW5oYXJtb25pYy1mbGF0JyA6IFsnRGJiJywgJ0RiJywgJ0ViYicsICdFYicsICdGYicsICdHYmInLCAnR2InLCAnQWJiJywgJ0FiJywgJ0JiYicsICdCYicsICdDYiddXG59O1xuXG5cbi8qXG4gIGFyZ3VtZW50c1xuICAtIG5vdGVOdW1iZXI6IDYwXG4gIC0gbm90ZU51bWJlciBhbmQgbm90ZW5hbWUgbW9kZTogNjAsICdzaGFycCdcbiAgLSBub3RlTmFtZTogJ0MjNCdcbiAgLSBuYW1lIGFuZCBvY3RhdmU6ICdDIycsIDRcbiAgLSBub3RlIG5hbWUsIG9jdGF2ZSwgbm90ZSBuYW1lIG1vZGU6ICdEJywgNCwgJ3NoYXJwJ1xuICAtIGRhdGEgb2JqZWN0OlxuICAgIHtcbiAgICAgIG5hbWU6ICdDJyxcbiAgICAgIG9jdGF2ZTogNFxuICAgIH1cbiAgICBvclxuICAgIHtcbiAgICAgIGZyZXF1ZW5jeTogMjM0LjE2XG4gICAgfVxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5vdGUoLi4uYXJncyl7XG4gIGxldFxuICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICBkYXRhLFxuICAgIG9jdGF2ZSxcbiAgICBub3RlTmFtZSxcbiAgICBub3RlTnVtYmVyLFxuICAgIG5vdGVOYW1lTW9kZSxcbiAgICBhcmcwID0gYXJnc1swXSxcbiAgICBhcmcxID0gYXJnc1sxXSxcbiAgICBhcmcyID0gYXJnc1syXSxcbiAgICB0eXBlMCA9IHR5cGVTdHJpbmcoYXJnMCksXG4gICAgdHlwZTEgPSB0eXBlU3RyaW5nKGFyZzEpLFxuICAgIHR5cGUyID0gdHlwZVN0cmluZyhhcmcyKTtcblxuICBlcnJvck1zZyA9ICcnO1xuICB3YXJuaW5nTXNnID0gJyc7XG5cbiAgLy8gYXJndW1lbnQ6IG5vdGUgbnVtYmVyXG4gIC8vY29uc29sZS5sb2cobnVtQXJncywgdHlwZTApXG4gIGlmKG51bUFyZ3MgPT09IDEgJiYgdHlwZTAgPT09ICdudW1iZXInKXtcbiAgICBpZihhcmcwIDwgMCB8fCBhcmcwID4gMTI3KXtcbiAgICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBudW1iZXIgPj0gMCBhbmQgPD0gMTI3ICcgKyAgYXJnMDtcbiAgICB9ZWxzZXtcbiAgICAgIG5vdGVOdW1iZXIgPSBhcmcwO1xuICAgICAgZGF0YSA9IF9nZXROb3RlTmFtZShub3RlTnVtYmVyKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgfVxuXG5cbiAgLy8gYXJndW1lbnRzOiBmdWxsIG5vdGUgbmFtZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAxICYmIHR5cGUwID09PSAnc3RyaW5nJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzApO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbmFtZSwgb2N0YXZlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzAsIGFyZzEpO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuICAvLyBhcmd1bWVudHM6IGZ1bGwgbm90ZSBuYW1lLCBub3RlIG5hbWUgbW9kZSAtPiBmb3IgY29udmVydGluZyBiZXR3ZWVuIG5vdGUgbmFtZSBtb2Rlc1xuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzEpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbnVtYmVyLCBub3RlIG5hbWUgbW9kZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGVTdHJpbmcoYXJnMCkgPT09ICdudW1iZXInICYmIHR5cGVTdHJpbmcoYXJnMSkgPT09ICdzdHJpbmcnKXtcbiAgICBpZihhcmcwIDwgMCB8fCBhcmcwID4gMTI3KXtcbiAgICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBudW1iZXIgPj0gMCBhbmQgPD0gMTI3ICcgKyBhcmcwO1xuICAgIH1lbHNle1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzEpO1xuICAgICAgbm90ZU51bWJlciA9IGFyZzA7XG4gICAgICBkYXRhID0gX2dldE5vdGVOYW1lKG5vdGVOdW1iZXIsIG5vdGVOYW1lTW9kZSk7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgIH1cblxuXG4gIC8vIGFyZ3VtZW50czogbm90ZSBuYW1lLCBvY3RhdmUsIG5vdGUgbmFtZSBtb2RlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDMgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyAmJiB0eXBlMiA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwLCBhcmcxKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzIpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSxvY3RhdmUpO1xuICAgIH1cblxuICB9ZWxzZXtcbiAgICBlcnJvck1zZyA9ICd3cm9uZyBhcmd1bWVudHMsIHBsZWFzZSBjb25zdWx0IGRvY3VtZW50YXRpb24nO1xuICB9XG5cbiAgaWYoZXJyb3JNc2cpe1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNc2cpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmKHdhcm5pbmdNc2cpe1xuICAgIGNvbnNvbGUud2Fybih3YXJuaW5nTXNnKTtcbiAgfVxuXG4gIGxldCBub3RlID0ge1xuICAgIG5hbWU6IG5vdGVOYW1lLFxuICAgIG9jdGF2ZTogb2N0YXZlLFxuICAgIGZ1bGxOYW1lOiBub3RlTmFtZSArIG9jdGF2ZSxcbiAgICBudW1iZXI6IG5vdGVOdW1iZXIsXG4gICAgZnJlcXVlbmN5OiBfZ2V0RnJlcXVlbmN5KG5vdGVOdW1iZXIpLFxuICAgIGJsYWNrS2V5OiBfaXNCbGFja0tleShub3RlTnVtYmVyKVxuICB9XG4gIE9iamVjdC5mcmVlemUobm90ZSk7XG4gIHJldHVybiBub3RlO1xufVxuXG5cbi8vZnVuY3Rpb24gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSA9IGNvbmZpZy5nZXQoJ25vdGVOYW1lTW9kZScpKSB7XG5mdW5jdGlvbiBfZ2V0Tm90ZU5hbWUobnVtYmVyLCBtb2RlID0gJ3NoYXJwJykge1xuICAvL2xldCBvY3RhdmUgPSBNYXRoLmZsb29yKChudW1iZXIgLyAxMikgLSAyKSwgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBvY3RhdmUgPSBmbG9vcigobnVtYmVyIC8gMTIpIC0gMSk7XG4gIGxldCBub3RlTmFtZSA9IG5vdGVOYW1lc1ttb2RlXVtudW1iZXIgJSAxMl07XG4gIHJldHVybiBbbm90ZU5hbWUsIG9jdGF2ZV07XG59XG5cblxuZnVuY3Rpb24gX2dldE5vdGVOdW1iZXIobmFtZSwgb2N0YXZlKSB7XG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgbGV0IGluZGV4O1xuXG4gIGZvcihsZXQga2V5IG9mIGtleXMpe1xuICAgIGxldCBtb2RlID0gbm90ZU5hbWVzW2tleV07XG4gICAgaW5kZXggPSBtb2RlLmZpbmRJbmRleCh4ID0+IHggPT09IG5hbWUpO1xuICAgIGlmKGluZGV4ICE9PSAtMSl7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvL251bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMikgKyAxMjsgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBudW1iZXIgPSAoaW5kZXggKyAxMikgKyAob2N0YXZlICogMTIpOy8vIOKGkiBtaWRpIHN0YW5kYXJkICsgc2NpZW50aWZpYyBuYW1pbmcsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NaWRkbGVfQyBhbmQgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TY2llbnRpZmljX3BpdGNoX25vdGF0aW9uXG5cbiAgaWYobnVtYmVyIDwgMCB8fCBudW1iZXIgPiAxMjcpe1xuICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBiZXR3ZWVuIEMwIGFuZCBHMTAnO1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gbnVtYmVyO1xufVxuXG5cbmZ1bmN0aW9uIF9nZXRGcmVxdWVuY3kobnVtYmVyKXtcbiAgLy9yZXR1cm4gY29uZmlnLmdldCgncGl0Y2gnKSAqIHBvdygyLChudW1iZXIgLSA2OSkvMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbiAgcmV0dXJuIDQ0MCAqIHBvdygyLChudW1iZXIgLSA2OSkvMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbn1cblxuXG4vLyBUT0RPOiBjYWxjdWxhdGUgbm90ZSBmcm9tIGZyZXF1ZW5jeVxuZnVuY3Rpb24gX2dldFBpdGNoKGhlcnR6KXtcbiAgLy9mbSAgPSAgMiht4oiSNjkpLzEyKDQ0MCBIeikuXG59XG5cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpe1xuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIGxldCByZXN1bHQgPSBrZXlzLmZpbmQoeCA9PiB4ID09PSBtb2RlKSAhPT0gdW5kZWZpbmVkO1xuICBpZihyZXN1bHQgPT09IGZhbHNlKXtcbiAgICAvL21vZGUgPSBjb25maWcuZ2V0KCdub3RlTmFtZU1vZGUnKTtcbiAgICBtb2RlID0gJ3NoYXJwJztcbiAgICB3YXJuaW5nTXNnID0gbW9kZSArICcgaXMgbm90IGEgdmFsaWQgbm90ZSBuYW1lIG1vZGUsIHVzaW5nIFwiJyArIG1vZGUgKyAnXCIgaW5zdGVhZCc7XG4gIH1cbiAgcmV0dXJuIG1vZGU7XG59XG5cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWUoLi4uYXJncyl7XG4gIGxldFxuICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICBhcmcwID0gYXJnc1swXSxcbiAgICBhcmcxID0gYXJnc1sxXSxcbiAgICBjaGFyLFxuICAgIG5hbWUgPSAnJyxcbiAgICBvY3RhdmUgPSAnJztcblxuICAvLyBleHRyYWN0IG9jdGF2ZSBmcm9tIG5vdGUgbmFtZVxuICBpZihudW1BcmdzID09PSAxKXtcbiAgICBmb3IoY2hhciBvZiBhcmcwKXtcbiAgICAgIGlmKGlzTmFOKGNoYXIpICYmIGNoYXIgIT09ICctJyl7XG4gICAgICAgIG5hbWUgKz0gY2hhcjtcbiAgICAgIH1lbHNle1xuICAgICAgICBvY3RhdmUgKz0gY2hhcjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYob2N0YXZlID09PSAnJyl7XG4gICAgICBvY3RhdmUgPSAwO1xuICAgIH1cbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMil7XG4gICAgbmFtZSA9IGFyZzA7XG4gICAgb2N0YXZlID0gYXJnMTtcbiAgfVxuXG4gIC8vIGNoZWNrIGlmIG5vdGUgbmFtZSBpcyB2YWxpZFxuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIGxldCBpbmRleCA9IC0xO1xuXG4gIGZvcihsZXQga2V5IG9mIGtleXMpe1xuICAgIGxldCBtb2RlID0gbm90ZU5hbWVzW2tleV07XG4gICAgaW5kZXggPSBtb2RlLmZpbmRJbmRleCh4ID0+IHggPT09IG5hbWUpO1xuICAgIGlmKGluZGV4ICE9PSAtMSl7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZihpbmRleCA9PT0gLTEpe1xuICAgIGVycm9yTXNnID0gYXJnMCArICcgaXMgbm90IGEgdmFsaWQgbm90ZSBuYW1lLCBwbGVhc2UgdXNlIGxldHRlcnMgQSAtIEcgYW5kIGlmIG5lY2Vzc2FyeSBhbiBhY2NpZGVudGFsIGxpa2UgIywgIyMsIGIgb3IgYmIsIGZvbGxvd2VkIGJ5IGEgbnVtYmVyIGZvciB0aGUgb2N0YXZlJztcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihvY3RhdmUgPCAtMSB8fCBvY3RhdmUgPiA5KXtcbiAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhbiBvY3RhdmUgYmV0d2VlbiAtMSBhbmQgOSc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgb2N0YXZlID0gcGFyc2VJbnQob2N0YXZlLCAxMCk7XG4gIG5hbWUgPSBuYW1lLnN1YnN0cmluZygwLCAxKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zdWJzdHJpbmcoMSk7XG5cbiAgLy9jb25zb2xlLmxvZyhuYW1lLCd8JyxvY3RhdmUpO1xuICByZXR1cm4gW25hbWUsIG9jdGF2ZV07XG59XG5cblxuXG5mdW5jdGlvbiBfaXNCbGFja0tleShub3RlTnVtYmVyKXtcbiAgbGV0IGJsYWNrO1xuXG4gIHN3aXRjaCh0cnVlKXtcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTovL0MjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDM6Ly9EI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSA2Oi8vRiNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gODovL0cjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDEwOi8vQSNcbiAgICAgIGJsYWNrID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBibGFjayA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGJsYWNrO1xufVxuXG5cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZU51bWJlciguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5udW1iZXI7XG4gIH1cbiAgcmV0dXJuIGVycm9yTXNnO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlTmFtZSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5uYW1lO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZU9jdGF2ZSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5vY3RhdmU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsTm90ZU5hbWUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUuZnVsbE5hbWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGcmVxdWVuY3koLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUuZnJlcXVlbmN5O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaXNCbGFja0tleSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5ibGFja0tleTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iLCJpbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7dHlwZVN0cmluZywgY2hlY2tJZkJhc2U2NCwgYmFzZTY0VG9CaW5hcnl9IGZyb20gJy4vdXRpbCdcbmltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVTYW1wbGUoc2FtcGxlLCBpZCwgZXZlcnkpe1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgdHJ5e1xuICAgICAgY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoc2FtcGxlLFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2VzcyhidWZmZXIpe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coaWQsIGJ1ZmZlcik7XG4gICAgICAgICAgaWYodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICByZXNvbHZlKHtpZCwgYnVmZmVyfSlcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoe2lkLCBidWZmZXJ9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZShidWZmZXIpO1xuICAgICAgICAgICAgaWYoZXZlcnkpe1xuICAgICAgICAgICAgICBldmVyeShidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmdW5jdGlvbiBvbkVycm9yKGUpe1xuICAgICAgICAgIGNvbnNvbGUoJ2Vycm9yIGRlY29kaW5nIGF1ZGlvZGF0YScsIGlkLCBlKTtcbiAgICAgICAgICAvL3JlamVjdChlKTsgLy8gZG9uJ3QgdXNlIHJlamVjdCBiZWNhdXNlIHdlIHVzZSB0aGlzIGFzIGEgbmVzdGVkIHByb21pc2UgYW5kIHdlIGRvbid0IHdhbnQgdGhlIHBhcmVudCBwcm9taXNlIHRvIHJlamVjdFxuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgfWNhdGNoKGUpe1xuICAgICAgY29uc29sZS53YXJuKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSlcbiAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZXNvbHZlKHtpZH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5cbmZ1bmN0aW9uIGxvYWRBbmRQYXJzZVNhbXBsZSh1cmwsIGlkLCBldmVyeSl7XG4gIC8vY29uc29sZS5sb2coaWQsIHVybClcbiAgbGV0IGV4ZWN1dG9yID0gZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgZmV0Y2goZXNjYXBlKHVybCksIHtcbiAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICB9KS50aGVuKFxuICAgICAgZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBpZihyZXNwb25zZS5vayl7XG4gICAgICAgICAgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhKVxuICAgICAgICAgICAgZGVjb2RlU2FtcGxlKGRhdGEsIGlkLCBldmVyeSkudGhlbihyZXNvbHZlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNlIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApXG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKVxufVxuXG5cbmZ1bmN0aW9uIGdldFByb21pc2VzKHByb21pc2VzLCBzYW1wbGUsIGtleSwgZXZlcnkpe1xuXG4gIGNvbnN0IGdldFNhbXBsZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICBpZihzYW1wbGUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgICBwcm9taXNlcy5wdXNoKGRlY29kZVNhbXBsZShzYW1wbGUsIGtleSwgZXZlcnkpKVxuICAgIH1lbHNlIGlmKHR5cGVvZiBzYW1wbGUgPT09ICdzdHJpbmcnKXtcbiAgICAgIGlmKGNoZWNrSWZCYXNlNjQoc2FtcGxlKSl7XG4gICAgICAgIHByb21pc2VzLnB1c2goZGVjb2RlU2FtcGxlKGJhc2U2NFRvQmluYXJ5KHNhbXBsZSksIGtleSwgZXZlcnkpKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKHNhbXBsZSwga2V5LCBldmVyeSkpXG4gICAgICB9XG4gICAgfWVsc2UgaWYodHlwZW9mIHNhbXBsZSA9PT0gJ29iamVjdCcpe1xuICAgICAgc2FtcGxlID0gc2FtcGxlLnNhbXBsZSB8fCBzYW1wbGUuYnVmZmVyIHx8IHNhbXBsZS5iYXNlNjQgfHwgc2FtcGxlLnVybFxuICAgICAgZ2V0U2FtcGxlKHByb21pc2VzLCBzYW1wbGUsIGtleSwgZXZlcnkpXG4gICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZSwgcHJvbWlzZXMubGVuZ3RoKVxuICAgIH1cbiAgfVxuXG4gIGdldFNhbXBsZSgpXG59XG5cblxuLy8gb25seSBmb3IgaW50ZXJuYWxseSB1c2UgaW4gcWFtYmlcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNhbXBsZXMyKG1hcHBpbmcsIGV2ZXJ5ID0gZmFsc2Upe1xuICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcobWFwcGluZyksXG4gICAgcHJvbWlzZXMgPSBbXVxuXG4gIGV2ZXJ5ID0gdHlwZW9mIGV2ZXJ5ID09PSAnZnVuY3Rpb24nID8gZXZlcnkgOiBmYWxzZVxuICAvL2NvbnNvbGUubG9nKHR5cGUsIG1hcHBpbmcpXG4gIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICBPYmplY3Qua2V5cyhtYXBwaW5nKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAvL2tleSA9IHBhcnNlSW50KGtleSwgMTApXG4gICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgbWFwcGluZ1trZXldLCBrZXksIGV2ZXJ5KVxuICAgIH0pXG4gIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgIGxldCBrZXlcbiAgICBtYXBwaW5nLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlKXtcbiAgICAgIC8vIGtleSBpcyBkZWxpYmVyYXRlbHkgdW5kZWZpbmVkXG4gICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgc2FtcGxlLCBrZXksIGV2ZXJ5KVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgLnRoZW4oKHZhbHVlcykgPT4ge1xuICAgICAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgICAgICBtYXBwaW5nID0ge31cbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gdmFsdWUuYnVmZmVyXG4gICAgICAgIH0pXG4gICAgICAgIHJlc29sdmUobWFwcGluZyk7XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2FtcGxlcyguLi5kYXRhKXtcbiAgaWYoZGF0YS5sZW5ndGggPT09IDEgJiYgdHlwZVN0cmluZyhkYXRhWzBdKSAhPT0gJ3N0cmluZycpe1xuICAgIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGFbMF0pXG4gIH1cbiAgcmV0dXJuIHBhcnNlU2FtcGxlczIoZGF0YSlcbn1cbiIsImltcG9ydCB7Z2V0TmljZVRpbWV9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge01JRElOb3RlfSBmcm9tICcuL21pZGlfbm90ZSc7XG5cbmxldFxuICBwcHEsXG4gIGJwbSxcbiAgZmFjdG9yLFxuICBub21pbmF0b3IsXG4gIGRlbm9taW5hdG9yLFxuICBwbGF5YmFja1NwZWVkLFxuXG4gIGJhcixcbiAgYmVhdCxcbiAgc2l4dGVlbnRoLFxuICB0aWNrLFxuICB0aWNrcyxcbiAgbWlsbGlzLFxuXG4gIG1pbGxpc1BlclRpY2ssXG4gIHNlY29uZHNQZXJUaWNrLFxuXG4gIHRpY2tzUGVyQmVhdCxcbiAgdGlja3NQZXJCYXIsXG4gIHRpY2tzUGVyU2l4dGVlbnRoLFxuICBudW1TaXh0ZWVudGgsXG5cbiAgZGlmZlRpY2tzLFxuICBwcmV2aW91c0V2ZW50O1xuXG5cbmZ1bmN0aW9uIHNldFRpY2tEdXJhdGlvbigpe1xuICBzZWNvbmRzUGVyVGljayA9ICgxIC8gcGxheWJhY2tTcGVlZCAqIDYwKSAvIGJwbSAvIHBwcTtcbiAgbWlsbGlzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrICogMTAwMDtcbiAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLCBicG0sIHBwcSwgcGxheWJhY2tTcGVlZCwgKHBwcSAqIG1pbGxpc1BlclRpY2spKTtcbiAgLy9jb25zb2xlLmxvZyhwcHEpO1xufVxuXG5cbmZ1bmN0aW9uIHNldFRpY2tzUGVyQmVhdCgpe1xuICBmYWN0b3IgPSAoNCAvIGRlbm9taW5hdG9yKTtcbiAgbnVtU2l4dGVlbnRoID0gZmFjdG9yICogNDtcbiAgdGlja3NQZXJCZWF0ID0gcHBxICogZmFjdG9yO1xuICB0aWNrc1BlckJhciA9IHRpY2tzUGVyQmVhdCAqIG5vbWluYXRvcjtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBwcHEgLyA0O1xuICAvL2NvbnNvbGUubG9nKGRlbm9taW5hdG9yLCBmYWN0b3IsIG51bVNpeHRlZW50aCwgdGlja3NQZXJCZWF0LCB0aWNrc1BlckJhciwgdGlja3NQZXJTaXh0ZWVudGgpO1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZVBvc2l0aW9uKGV2ZW50LCBmYXN0ID0gZmFsc2Upe1xuICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzO1xuICAvLyBpZihkaWZmVGlja3MgPCAwKXtcbiAgLy8gICBjb25zb2xlLmxvZyhkaWZmVGlja3MsIGV2ZW50LnRpY2tzLCBwcmV2aW91c0V2ZW50LnRpY2tzLCBwcmV2aW91c0V2ZW50LnR5cGUpXG4gIC8vIH1cbiAgdGljayArPSBkaWZmVGlja3M7XG4gIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIHByZXZpb3VzRXZlbnQgPSBldmVudFxuICAvL2NvbnNvbGUubG9nKGRpZmZUaWNrcywgbWlsbGlzUGVyVGljayk7XG4gIG1pbGxpcyArPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuXG4gIGlmKGZhc3QgPT09IGZhbHNlKXtcbiAgICB3aGlsZSh0aWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCsrO1xuICAgICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICAgIHdoaWxlKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICAgIGJlYXQrKztcbiAgICAgICAgd2hpbGUoYmVhdCA+IG5vbWluYXRvcil7XG4gICAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgICAgYmFyKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUaW1lRXZlbnRzKHNldHRpbmdzLCB0aW1lRXZlbnRzLCBpc1BsYXlpbmcgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlIHRpbWUgZXZlbnRzJylcbiAgbGV0IHR5cGU7XG4gIGxldCBldmVudDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuICBsZXQgZSA9IDA7XG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGUrKywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG4gICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcblxuICAgIHN3aXRjaCh0eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgc2V0VGlja0R1cmF0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBzZXRUaWNrc1BlckJlYXQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICB1cGRhdGVFdmVudChldmVudCwgaXNQbGF5aW5nKTtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJhcnNBc1N0cmluZyk7XG4gIH1cblxuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG4gIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAvL2NvbnNvbGUubG9nKHRpbWVFdmVudHMpO1xufVxuXG5cbi8vZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKHNvbmcsIGV2ZW50cyl7XG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoZXZlbnRzLCBpc1BsYXlpbmcgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlRXZlbnRzJylcbiAgbGV0IGV2ZW50O1xuICBsZXQgc3RhcnRFdmVudCA9IDA7XG4gIGxldCBsYXN0RXZlbnRUaWNrID0gMDtcbiAgbGV0IHJlc3VsdCA9IFtdXG5cbiAgdGljayA9IDBcbiAgdGlja3MgPSAwXG4gIGRpZmZUaWNrcyA9IDBcblxuICAvL2xldCBldmVudHMgPSBbXS5jb25jYXQoZXZ0cywgc29uZy5fdGltZUV2ZW50cyk7XG4gIGxldCBudW1FdmVudHMgPSBldmVudHMubGVuZ3RoXG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuXG4gIC8vIG5vdGVvZmYgY29tZXMgYmVmb3JlIG5vdGVvblxuXG4vKlxuICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gYS5zb3J0SW5kZXggLSBiLnNvcnRJbmRleDtcbiAgfSlcbiovXG5cbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICAvLyBpZihhLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAtMVxuICAgICAgLy8gfWVsc2UgaWYoYi50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gMVxuICAgICAgLy8gfVxuICAgICAgLy8gc2hvcnQ6XG4gICAgICBsZXQgciA9IGEudHlwZSAtIGIudHlwZTtcbiAgICAgIGlmKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgciA9IC0xXG4gICAgICB9XG4gICAgICByZXR1cm4gclxuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3NcbiAgfSlcbiAgZXZlbnQgPSBldmVudHNbMF1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcblxuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcblxuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuXG4gIGZvcihsZXQgaSA9IHN0YXJ0RXZlbnQ7IGkgPCBudW1FdmVudHM7IGkrKyl7XG5cbiAgICBldmVudCA9IGV2ZW50c1tpXTtcblxuICAgIHN3aXRjaChldmVudC50eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuICAgICAgICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgICAgICAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzXG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLGV2ZW50Lm1pbGxpc1BlclRpY2spO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICAgICAgICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzXG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub21pbmF0b3IsbnVtU2l4dGVlbnRoLHRpY2tzUGVyU2l4dGVlbnRoKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG5cblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgIC8vY2FzZSAxMjg6XG4gICAgICAvL2Nhc2UgMTQ0OlxuICAgICAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcbiAgICAgICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuXG4gICAgICAgIC8vIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50LmRhdGEyLCBldmVudC5iYXJzQXNTdHJpbmcpXG4gICAgICAgIC8vIH1cblxuICAgIH1cblxuXG4gICAgLy8gaWYoaSA8IDEwMCAmJiAoZXZlbnQudHlwZSA9PT0gODEgfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkpe1xuICAgIC8vICAgLy9jb25zb2xlLmxvZyhpLCB0aWNrcywgZGlmZlRpY2tzLCBtaWxsaXMsIG1pbGxpc1BlclRpY2spXG4gICAgLy8gICBjb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5taWxsaXMsICdub3RlJywgZXZlbnQuZGF0YTEsICd2ZWxvJywgZXZlbnQuZGF0YTIpXG4gICAgLy8gfVxuXG4gICAgbGFzdEV2ZW50VGljayA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIHBhcnNlTUlESU5vdGVzKHJlc3VsdClcbiAgcmV0dXJuIHJlc3VsdDtcbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGV2ZW50LCBmYXN0ID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKGJhciwgYmVhdCwgdGlja3MpXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuXG4gIGV2ZW50LnRpY2tzID0gdGlja3M7XG5cbiAgZXZlbnQubWlsbGlzID0gbWlsbGlzO1xuICBldmVudC5zZWNvbmRzID0gbWlsbGlzIC8gMTAwMDtcblxuICBpZihmYXN0KXtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGV2ZW50LmJhciA9IGJhcjtcbiAgZXZlbnQuYmVhdCA9IGJlYXQ7XG4gIGV2ZW50LnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgZXZlbnQudGljayA9IHRpY2s7XG4gIC8vZXZlbnQuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2s7XG4gIHZhciB0aWNrQXNTdHJpbmcgPSB0aWNrID09PSAwID8gJzAwMCcgOiB0aWNrIDwgMTAgPyAnMDAnICsgdGljayA6IHRpY2sgPCAxMDAgPyAnMCcgKyB0aWNrIDogdGljaztcbiAgZXZlbnQuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIHRpY2tBc1N0cmluZztcbiAgZXZlbnQuYmFyc0FzQXJyYXkgPSBbYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tdO1xuXG5cbiAgdmFyIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcblxuICBldmVudC5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgZXZlbnQubWludXRlID0gdGltZURhdGEubWludXRlO1xuICBldmVudC5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gIGV2ZW50Lm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gIGV2ZW50LnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgZXZlbnQudGltZUFzQXJyYXkgPSB0aW1lRGF0YS50aW1lQXNBcnJheTtcblxuICAvLyBpZihtaWxsaXMgPCAwKXtcbiAgLy8gICBjb25zb2xlLmxvZyhldmVudClcbiAgLy8gfVxuXG5cbn1cblxuXG5sZXQgbWlkaU5vdGVJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESU5vdGVzKGV2ZW50cyl7XG4gIGxldCBub3RlcyA9IHt9XG4gIGxldCBub3Rlc0luVHJhY2tcbiAgbGV0IG4gPSAwXG4gIGZvcihsZXQgZXZlbnQgb2YgZXZlbnRzKXtcbiAgICBpZih0eXBlb2YgZXZlbnQuX3BhcnQgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBldmVudC5fdHJhY2sgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUubG9nKCdubyBwYXJ0IGFuZC9vciB0cmFjayBzZXQnKVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50Ll90cmFjay5pZF1cbiAgICAgIGlmKHR5cGVvZiBub3Rlc0luVHJhY2sgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXSA9IHt9XG4gICAgICB9XG4gICAgICBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdID0gZXZlbnRcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBjb3JyZXNwb25kaW5nIG5vdGVvbiBldmVudCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlT24gPSBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdXG4gICAgICBsZXQgbm90ZU9mZiA9IGV2ZW50XG4gICAgICBpZih0eXBlb2Ygbm90ZU9uID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIG5vdGVvbiBldmVudCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50Ll90cmFjay5pZF1bZXZlbnQuZGF0YTFdXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBsZXQgbm90ZSA9IG5ldyBNSURJTm90ZShub3RlT24sIG5vdGVPZmYpXG4gICAgICAvLyBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgICAgLy8gbm90ZU9uLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgLy8gbm90ZU9uLm9mZiA9IG5vdGVPZmYuaWRcbiAgICAgIC8vIG5vdGVPZmYubWlkaU5vdGVJZCA9IGlkXG4gICAgICAvLyBub3RlT2ZmLm9uID0gbm90ZU9uLmlkXG4gICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICB9XG4gIH1cbiAgT2JqZWN0LmtleXMobm90ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICBkZWxldGUgbm90ZXNba2V5XVxuICB9KVxuICAvL2NvbnNvbGUubG9nKG5vdGVzLCBub3Rlc0luVHJhY2spXG59XG5cblxuLy8gbm90IGluIHVzZSFcbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJFdmVudHMoZXZlbnRzKXtcbiAgbGV0IHN1c3RhaW4gPSB7fVxuICBsZXQgdG1wUmVzdWx0ID0ge31cbiAgbGV0IHJlc3VsdCA9IFtdXG4gIGZvcihsZXQgZXZlbnQgb2YgZXZlbnRzKXtcbiAgICBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgaWYodHlwZW9mIHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9ZWxzZSBpZihzdXN0YWluW2V2ZW50LnRyYWNrSWRdID09PSBldmVudC50aWNrcyl7XG4gICAgICAgICAgZGVsZXRlIHRtcFJlc3VsdFtldmVudC50aWNrc11cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgICBkZWxldGUgc3VzdGFpbltldmVudC50cmFja0lkXVxuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTIgPT09IDEyNyl7XG4gICAgICAgIHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPSBldmVudC50aWNrc1xuICAgICAgICB0bXBSZXN1bHRbZXZlbnQudGlja3NdID0gZXZlbnRcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgIH1cbiAgfVxuICBjb25zb2xlLmxvZyhzdXN0YWluKVxuICBPYmplY3Qua2V5cyh0bXBSZXN1bHQpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICBsZXQgc3VzdGFpbkV2ZW50ID0gdG1wUmVzdWx0W2tleV1cbiAgICBjb25zb2xlLmxvZyhzdXN0YWluRXZlbnQpXG4gICAgcmVzdWx0LnB1c2goc3VzdGFpbkV2ZW50KVxuICB9KVxuICByZXR1cm4gcmVzdWx0XG59XG4iLCIvLyBAIGZsb3dcblxuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwnXG5cbmxldCBwYXJ0SW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBQYXJ0e1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IG51bGwpe1xuICAgIHRoaXMuaWQgPSBgTVBfJHtwYXJ0SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCB0aGlzLmlkXG4gICAgdGhpcy5tdXRlZCA9IGZhbHNlXG4gICAgdGhpcy5fdHJhY2sgPSBudWxsXG4gICAgdGhpcy5fc29uZyA9IG51bGxcbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgdGhpcy5fc3RhcnQgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9lbmQgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgfVxuXG4gIGNvcHkoKXtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0KHRoaXMubmFtZSArICdfY29weScpIC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICBsZXQgZXZlbnRzID0gW11cbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudCl7XG4gICAgICBsZXQgY29weSA9IGV2ZW50LmNvcHkoKVxuICAgICAgY29uc29sZS5sb2coY29weSlcbiAgICAgIGV2ZW50cy5wdXNoKGNvcHkpXG4gICAgfSlcbiAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgcC51cGRhdGUoKVxuICAgIHJldHVybiBwXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZSh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVUbyh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgYWRkRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgbGV0IHRyYWNrID0gdGhpcy5fdHJhY2tcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Ll9wYXJ0ID0gdGhpc1xuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5zZXQoZXZlbnQuaWQsIGV2ZW50KVxuICAgICAgdGhpcy5fZXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IHRyYWNrXG4gICAgICB9XG4gICAgfSlcbiAgICBpZih0cmFjayl7XG4gICAgICB0cmFjay5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdHJhY2suX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIH1cbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX25ld0V2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICByZW1vdmVFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgdHJhY2sgPSB0aGlzLl90cmFja1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuX3BhcnQgPSBudWxsXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbFxuICAgICAgICB0cmFjay5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgICB9XG4gICAgfSlcbiAgICBpZih0cmFjayl7XG4gICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgICB0cmFjay5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgICB9XG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZUV2ZW50cyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZSh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZUV2ZW50c1RvKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlVG8odGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKGZpbHRlcjogc3RyaW5nW10gPSBudWxsKXsgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c10gLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgfVxuXG4gIG11dGUoZmxhZzogYm9vbGVhbiA9IG51bGwpe1xuICAgIGlmKGZsYWcpe1xuICAgICAgdGhpcy5tdXRlZCA9IGZsYWdcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMubXV0ZWQgPSAhdGhpcy5tdXRlZFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYodGhpcy5fY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB9XG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIC8vQFRPRE86IGNhbGN1bGF0ZSBwYXJ0IHN0YXJ0IGFuZCBlbmQsIGFuZCBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZVxuICB9XG59XG4iLCJpbXBvcnQge2dldFBvc2l0aW9uMn0gZnJvbSAnLi9wb3NpdGlvbi5qcydcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyLmpzJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwuanMnXG5cbmNvbnN0IHJhbmdlID0gMTAgLy8gbWlsbGlzZWNvbmRzIG9yIHRpY2tzXG5sZXQgaW5zdGFuY2VJZCA9IDBcblxuZXhwb3J0IGNsYXNzIFBsYXloZWFke1xuXG4gIGNvbnN0cnVjdG9yKHNvbmcsIHR5cGUgPSAnYWxsJyl7XG4gICAgdGhpcy5pZCA9IGBQT1MgJHtpbnN0YW5jZUlkKyt9ICR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMuc29uZyA9IHNvbmdcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5sYXN0RXZlbnQgPSBudWxsXG4gICAgdGhpcy5kYXRhID0ge31cblxuICAgIHRoaXMuYWN0aXZlUGFydHMgPSBbXVxuICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbXVxuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW11cbiAgfVxuXG4gIC8vIHVuaXQgY2FuIGJlICdtaWxsaXMnIG9yICd0aWNrcydcbiAgc2V0KHVuaXQsIHZhbHVlKXtcbiAgICB0aGlzLnVuaXQgPSB1bml0XG4gICAgdGhpcy5jdXJyZW50VmFsdWUgPSB2YWx1ZVxuICAgIHRoaXMuZXZlbnRJbmRleCA9IDBcbiAgICB0aGlzLm5vdGVJbmRleCA9IDBcbiAgICB0aGlzLnBhcnRJbmRleCA9IDBcbiAgICB0aGlzLmNhbGN1bGF0ZSgpXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICBnZXQoKXtcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuXG4gIHVwZGF0ZSh1bml0LCBkaWZmKXtcbiAgICBpZihkaWZmID09PSAwKXtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFcbiAgICB9XG4gICAgdGhpcy51bml0ID0gdW5pdFxuICAgIHRoaXMuY3VycmVudFZhbHVlICs9IGRpZmZcbiAgICB0aGlzLmNhbGN1bGF0ZSgpXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICB1cGRhdGVTb25nKCl7XG4gICAgdGhpcy5ldmVudHMgPSBbLi4udGhpcy5zb25nLl9ldmVudHMsIC4uLnRoaXMuc29uZy5fdGltZUV2ZW50c11cbiAgICBzb3J0RXZlbnRzKHRoaXMuZXZlbnRzKVxuICAgIGNvbnNvbGUubG9nKCdldmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICB0aGlzLm5vdGVzID0gdGhpcy5zb25nLl9ub3Rlc1xuICAgIHRoaXMucGFydHMgPSB0aGlzLnNvbmcuX3BhcnRzXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLm51bU5vdGVzID0gdGhpcy5ub3Rlcy5sZW5ndGhcbiAgICB0aGlzLm51bVBhcnRzID0gdGhpcy5wYXJ0cy5sZW5ndGhcbiAgICB0aGlzLnNldCgnbWlsbGlzJywgdGhpcy5zb25nLl9taWxsaXMpXG4gIH1cblxuXG4gIGNhbGN1bGF0ZSgpe1xuICAgIGxldCBpXG4gICAgbGV0IHZhbHVlXG4gICAgbGV0IGV2ZW50XG4gICAgbGV0IG5vdGVcbiAgICBsZXQgcGFydFxuICAgIGxldCBwb3NpdGlvblxuICAgIGxldCBzdGlsbEFjdGl2ZU5vdGVzID0gW11cbiAgICBsZXQgc3RpbGxBY3RpdmVQYXJ0cyA9IFtdXG4gICAgbGV0IGNvbGxlY3RlZFBhcnRzID0gbmV3IFNldCgpXG4gICAgbGV0IGNvbGxlY3RlZE5vdGVzID0gbmV3IFNldCgpXG5cbiAgICB0aGlzLmRhdGEgPSB7fVxuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW11cblxuICAgIGZvcihpID0gdGhpcy5ldmVudEluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IHRoaXMuZXZlbnRzW2ldXG4gICAgICB2YWx1ZSA9IGV2ZW50W3RoaXMudW5pdF1cbiAgICAgIGlmKHZhbHVlIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgLy8gaWYgdGhlIHBsYXloZWFkIGlzIHNldCB0byBhIHBvc2l0aW9uIG9mIHNheSAzMDAwIG1pbGxpcywgd2UgZG9uJ3Qgd2FudCB0byBhZGQgZXZlbnRzIG1vcmUgdGhhdCAxMCB1bml0cyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgIGlmKHZhbHVlID09PSAwIHx8IHZhbHVlID4gdGhpcy5jdXJyZW50VmFsdWUgLSByYW5nZSl7XG4gICAgICAgICAgdGhpcy5hY3RpdmVFdmVudHMucHVzaChldmVudClcbiAgICAgICAgICAvLyB0aGlzIGRvZXNuJ3Qgd29yayB0b28gd2VsbFxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIHRoaXMuZXZlbnRJbmRleCsrXG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5kYXRhLmFjdGl2ZUV2ZW50cyA9IHRoaXMuYWN0aXZlRXZlbnRzXG5cbiAgICAvLyBpZiBhIHNvbmcgaGFzIG5vIGV2ZW50cyB5ZXQsIHVzZSB0aGUgZmlyc3QgdGltZSBldmVudCBhcyByZWZlcmVuY2VcbiAgICBpZih0aGlzLmxhc3RFdmVudCA9PT0gbnVsbCl7XG4gICAgICB0aGlzLmxhc3RFdmVudCA9IHRoaXMuc29uZy5fdGltZUV2ZW50c1swXVxuICAgIH1cblxuICAgIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24yKHRoaXMuc29uZywgdGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSwgJ2FsbCcsIHRoaXMubGFzdEV2ZW50KVxuICAgIHRoaXMuZGF0YS5ldmVudEluZGV4ID0gdGhpcy5ldmVudEluZGV4XG4gICAgdGhpcy5kYXRhLm1pbGxpcyA9IHBvc2l0aW9uLm1pbGxpc1xuICAgIHRoaXMuZGF0YS50aWNrcyA9IHBvc2l0aW9uLnRpY2tzXG4gICAgdGhpcy5kYXRhLnBvc2l0aW9uID0gcG9zaXRpb25cbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICBkYXRhOiBwb3NpdGlvblxuICAgIH0pXG5cbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKXtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhXG4gICAgICBmb3IobGV0IGtleSBvZiBPYmplY3Qua2V5cyhwb3NpdGlvbikpe1xuICAgICAgICBkYXRhW2tleV0gPSBwb3NpdGlvbltrZXldXG4gICAgICB9XG4gICAgfWVsc2UgaWYodGhpcy50eXBlLmluZGV4T2YoJ2JhcnNiZWF0cycpICE9PSAtMSl7XG4gICAgICB0aGlzLmRhdGEuYmFyID0gcG9zaXRpb24uYmFyXG4gICAgICB0aGlzLmRhdGEuYmVhdCA9IHBvc2l0aW9uLmJlYXRcbiAgICAgIHRoaXMuZGF0YS5zaXh0ZWVudGggPSBwb3NpdGlvbi5zaXh0ZWVudGhcbiAgICAgIHRoaXMuZGF0YS50aWNrID0gcG9zaXRpb24udGlja1xuICAgICAgdGhpcy5kYXRhLmJhcnNBc1N0cmluZyA9IHBvc2l0aW9uLmJhcnNBc1N0cmluZ1xuXG4gICAgICB0aGlzLmRhdGEudGlja3NQZXJCYXIgPSBwb3NpdGlvbi50aWNrc1BlckJhclxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmVhdCA9IHBvc2l0aW9uLnRpY2tzUGVyQmVhdFxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gcG9zaXRpb24udGlja3NQZXJTaXh0ZWVudGhcbiAgICAgIHRoaXMuZGF0YS5udW1TaXh0ZWVudGggPSBwb3NpdGlvbi5udW1TaXh0ZWVudGhcblxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCd0aW1lJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5ob3VyID0gcG9zaXRpb24uaG91clxuICAgICAgdGhpcy5kYXRhLm1pbnV0ZSA9IHBvc2l0aW9uLm1pbnV0ZVxuICAgICAgdGhpcy5kYXRhLnNlY29uZCA9IHBvc2l0aW9uLnNlY29uZFxuICAgICAgdGhpcy5kYXRhLm1pbGxpc2Vjb25kID0gcG9zaXRpb24ubWlsbGlzZWNvbmRcbiAgICAgIHRoaXMuZGF0YS50aW1lQXNTdHJpbmcgPSBwb3NpdGlvbi50aW1lQXNTdHJpbmdcblxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCdwZXJjZW50YWdlJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5wZXJjZW50YWdlID0gcG9zaXRpb24ucGVyY2VudGFnZVxuICAgIH1cblxuICAgIC8vIGdldCBhY3RpdmUgbm90ZXNcbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZignbm90ZXMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG5cbiAgICAgIC8vIGdldCBhbGwgbm90ZXMgYmV0d2VlbiB0aGUgbm90ZUluZGV4IGFuZCB0aGUgY3VycmVudCBwbGF5aGVhZCBwb3NpdGlvblxuICAgICAgZm9yKGkgPSB0aGlzLm5vdGVJbmRleDsgaSA8IHRoaXMubnVtTm90ZXM7IGkrKyl7XG4gICAgICAgIG5vdGUgPSB0aGlzLm5vdGVzW2ldXG4gICAgICAgIHZhbHVlID0gbm90ZS5ub3RlT25bdGhpcy51bml0XVxuICAgICAgICBpZih2YWx1ZSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgdGhpcy5ub3RlSW5kZXgrK1xuICAgICAgICAgIGlmKHR5cGVvZiBub3RlLm5vdGVPZmYgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBpZiB0aGUgcGxheWhlYWQgaXMgc2V0IHRvIGEgcG9zaXRpb24gb2Ygc2F5IDMwMDAgbWlsbGlzLCB3ZSBkb24ndCB3YW50IHRvIGFkZCBub3RlcyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgICAgaWYodGhpcy5jdXJyZW50VmFsdWUgPT09IDAgfHwgbm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgICBjb2xsZWN0ZWROb3Rlcy5hZGQobm90ZSlcbiAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgICB0eXBlOiAnbm90ZU9uJyxcbiAgICAgICAgICAgICAgZGF0YTogbm90ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGZpbHRlciBub3RlcyB0aGF0IGFyZSBubyBsb25nZXIgYWN0aXZlXG4gICAgICBmb3IoaSA9IHRoaXMuYWN0aXZlTm90ZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgICBub3RlID0gdGhpcy5hY3RpdmVOb3Rlc1tpXTtcbiAgICAgICAgLy9pZihub3RlLm5vdGVPbi5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9ub3Rlc0J5SWQuZ2V0KG5vdGUuaWQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHRoaXMuc29uZy5fbm90ZXNCeUlkLmdldChub3RlLmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgbm90ZScsIG5vdGUuaWQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnNvbGUud2Fybignbm90ZSB3aXRoIGlkJywgbm90ZS5pZCwgJ2hhcyBubyBub3RlT2ZmIGV2ZW50Jyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkTm90ZXMuaGFzKG5vdGUpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHN0aWxsQWN0aXZlTm90ZXMucHVzaChub3RlKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnbm90ZU9mZicsXG4gICAgICAgICAgICBkYXRhOiBub3RlXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBhZGQgdGhlIHN0aWxsIGFjdGl2ZSBub3RlcyBhbmQgdGhlIG5ld2x5IGFjdGl2ZSBldmVudHMgdG8gdGhlIGFjdGl2ZSBub3RlcyBhcnJheVxuICAgICAgdGhpcy5hY3RpdmVOb3RlcyA9IFsuLi5jb2xsZWN0ZWROb3Rlcy52YWx1ZXMoKSwgLi4uc3RpbGxBY3RpdmVOb3Rlc11cbiAgICAgIHRoaXMuZGF0YS5hY3RpdmVOb3RlcyA9IHRoaXMuYWN0aXZlTm90ZXNcbiAgICB9XG5cblxuICAgIC8vIGdldCBhY3RpdmUgcGFydHNcbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZigncGFydHMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG5cbiAgICAgIGZvcihpID0gdGhpcy5wYXJ0SW5kZXg7IGkgPCB0aGlzLm51bVBhcnRzOyBpKyspe1xuICAgICAgICBwYXJ0ID0gdGhpcy5wYXJ0c1tpXVxuICAgICAgICAvL2NvbnNvbGUubG9nKHBhcnQsIHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgICAgICBpZihwYXJ0Ll9zdGFydFt0aGlzLnVuaXRdIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICBjb2xsZWN0ZWRQYXJ0cy5hZGQocGFydClcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdwYXJ0T24nLFxuICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgIH0pXG4gICAgICAgICAgdGhpcy5wYXJ0SW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgICAgLy8gZmlsdGVyIHBhcnRzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgIGZvcihpID0gdGhpcy5hY3RpdmVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgICAgIHBhcnQgPSB0aGlzLmFjdGl2ZVBhcnRzW2ldO1xuICAgICAgICAvL2lmKHBhcnQuc3RhdGUuaW5kZXhPZigncmVtb3ZlZCcpID09PSAwIHx8IHRoaXMuc29uZy5fcGFydHNCeUlkLmdldChwYXJ0LmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICBpZih0aGlzLnNvbmcuX3BhcnRzQnlJZC5nZXQocGFydC5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdza2lwcGluZyByZW1vdmVkIHBhcnQnLCBwYXJ0LmlkKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYocGFydC5fZW5kW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSAmJiBjb2xsZWN0ZWRQYXJ0cy5oYXMocGFydCkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYocGFydC5fZW5kW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgc3RpbGxBY3RpdmVQYXJ0cy5wdXNoKG5vdGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdwYXJ0T2ZmJyxcbiAgICAgICAgICAgIGRhdGE6IHBhcnRcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWN0aXZlUGFydHMgPSBbLi4uY29sbGVjdGVkUGFydHMudmFsdWVzKCksIC4uLnN0aWxsQWN0aXZlUGFydHNdXG4gICAgICB0aGlzLmRhdGEuYWN0aXZlUGFydHMgPSB0aGlzLmFjdGl2ZVBhcnRzXG4gICAgfVxuXG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAncGxheWhlYWQnLFxuICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgfSlcblxuICB9XG5cbi8qXG4gIHNldFR5cGUodCl7XG4gICAgdGhpcy50eXBlID0gdDtcbiAgICB0aGlzLnNldCh0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG5cblxuICBhZGRUeXBlKHQpe1xuICAgIHRoaXMudHlwZSArPSAnICcgKyB0O1xuICAgIHRoaXMuc2V0KHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gIH1cblxuICByZW1vdmVUeXBlKHQpe1xuICAgIHZhciBhcnIgPSB0aGlzLnR5cGUuc3BsaXQoJyAnKTtcbiAgICB0aGlzLnR5cGUgPSAnJztcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbih0eXBlKXtcbiAgICAgIGlmKHR5cGUgIT09IHQpe1xuICAgICAgICB0aGlzLnR5cGUgKz0gdCArICcgJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnR5cGUudHJpbSgpO1xuICAgIHRoaXMuc2V0KHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG4qL1xuXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7Z2V0TmljZVRpbWV9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0XG4gIHN1cHBvcnRlZFR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlJyxcbiAgc3VwcG9ydGVkUmV0dXJuVHlwZXMgPSAnYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBhbGwnLFxuICBmbG9vciA9IE1hdGguZmxvb3IsXG4gIHJvdW5kID0gTWF0aC5yb3VuZDtcblxuXG5sZXRcbiAgLy9sb2NhbFxuICBicG0sXG4gIG5vbWluYXRvcixcbiAgZGVub21pbmF0b3IsXG5cbiAgdGlja3NQZXJCZWF0LFxuICB0aWNrc1BlckJhcixcbiAgdGlja3NQZXJTaXh0ZWVudGgsXG5cbiAgbWlsbGlzUGVyVGljayxcbiAgc2Vjb25kc1BlclRpY2ssXG4gIG51bVNpeHRlZW50aCxcblxuICB0aWNrcyxcbiAgbWlsbGlzLFxuICBkaWZmVGlja3MsXG4gIGRpZmZNaWxsaXMsXG5cbiAgYmFyLFxuICBiZWF0LFxuICBzaXh0ZWVudGgsXG4gIHRpY2ssXG5cbi8vICB0eXBlLFxuICBpbmRleCxcbiAgcmV0dXJuVHlwZSA9ICdhbGwnLFxuICBiZXlvbmRFbmRPZlNvbmcgPSB0cnVlO1xuXG5cbmZ1bmN0aW9uIGdldFRpbWVFdmVudChzb25nLCB1bml0LCB0YXJnZXQpe1xuICAvLyBmaW5kcyB0aGUgdGltZSBldmVudCB0aGF0IGNvbWVzIHRoZSBjbG9zZXN0IGJlZm9yZSB0aGUgdGFyZ2V0IHBvc2l0aW9uXG4gIGxldCB0aW1lRXZlbnRzID0gc29uZy5fdGltZUV2ZW50c1xuXG4gIGZvcihsZXQgaSA9IHRpbWVFdmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgIGxldCBldmVudCA9IHRpbWVFdmVudHNbaV07XG4gICAgaWYoZXZlbnRbdW5pdF0gPD0gdGFyZ2V0KXtcbiAgICAgIGluZGV4ID0gaVxuICAgICAgcmV0dXJuIGV2ZW50XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc1RvVGlja3Moc29uZywgdGFyZ2V0TWlsbGlzLCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXRNaWxsaXMpXG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tzVG9NaWxsaXMoc29uZywgdGFyZ2V0VGlja3MsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0VGlja3MpXG4gIHJldHVybiBtaWxsaXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYmFyc1RvTWlsbGlzKHNvbmcsIHBvc2l0aW9uLCBiZW9zKXsgLy8gYmVvcyA9IGJleW9uZEVuZE9mU29uZ1xuICBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0JyxcbiAgICBwb3NpdGlvbixcbiAgICByZXN1bHQ6ICdtaWxsaXMnLFxuICAgIGJlb3MsXG4gIH0pXG4gIHJldHVybiBtaWxsaXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYmFyc1RvVGlja3Moc29uZywgcG9zaXRpb24sIGJlb3MpeyAvLyBiZW9zID0gYmV5b25kRW5kT2ZTb25nXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICBwb3NpdGlvbixcbiAgICByZXN1bHQ6ICd0aWNrcycsXG4gICAgYmVvc1xuICB9KVxuICAvL3JldHVybiByb3VuZCh0aWNrcyk7XG4gIHJldHVybiB0aWNrc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrc1RvQmFycyhzb25nLCB0YXJnZXQsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KVxuICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICByZXR1cm5UeXBlID0gJ2JhcnNhbmRiZWF0cydcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc1RvQmFycyhzb25nLCB0YXJnZXQsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldClcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgcmV0dXJuVHlwZSA9ICdiYXJzYW5kYmVhdHMnXG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoKVxufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIG1pbGxpcyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbU1pbGxpcyhzb25nLCB0YXJnZXRNaWxsaXMsIGV2ZW50KXtcbiAgbGV0IGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRNaWxsaXMgPiBsYXN0RXZlbnQubWlsbGlzKXtcbiAgICAgIHRhcmdldE1pbGxpcyA9IGxhc3RFdmVudC5taWxsaXM7XG4gICAgfVxuICB9XG5cbiAgaWYodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ21pbGxpcycsIHRhcmdldE1pbGxpcyk7XG4gIH1cbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBleGFjdGx5IGF0IHRhcmdldCBtaWxsaXMsIGNhbGN1bGF0ZSB0aGUgZGlmZlxuICBpZihldmVudC5taWxsaXMgPT09IHRhcmdldE1pbGxpcyl7XG4gICAgZGlmZk1pbGxpcyA9IDA7XG4gICAgZGlmZlRpY2tzID0gMDtcbiAgfWVsc2V7XG4gICAgZGlmZk1pbGxpcyA9IHRhcmdldE1pbGxpcyAtIGV2ZW50Lm1pbGxpcztcbiAgICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgcmV0dXJuIHRpY2tzO1xufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIHRpY2tzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tVGlja3Moc29uZywgdGFyZ2V0VGlja3MsIGV2ZW50KXtcbiAgbGV0IGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRUaWNrcyA+IGxhc3RFdmVudC50aWNrcyl7XG4gICAgICB0YXJnZXRUaWNrcyA9IGxhc3RFdmVudC50aWNrcztcbiAgICB9XG4gIH1cblxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAndGlja3MnLCB0YXJnZXRUaWNrcyk7XG4gIH1cbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBleGFjdGx5IGF0IHRhcmdldCB0aWNrcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmKGV2ZW50LnRpY2tzID09PSB0YXJnZXRUaWNrcyl7XG4gICAgZGlmZlRpY2tzID0gMDtcbiAgICBkaWZmTWlsbGlzID0gMDtcbiAgfWVsc2V7XG4gICAgZGlmZlRpY2tzID0gdGFyZ2V0VGlja3MgLSB0aWNrcztcbiAgICBkaWZmTWlsbGlzID0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIHRpY2tzICs9IGRpZmZUaWNrcztcbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG5cbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciBiYXJzIGFuZCBiZWF0cyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbUJhcnMoc29uZywgdGFyZ2V0QmFyLCB0YXJnZXRCZWF0LCB0YXJnZXRTaXh0ZWVudGgsIHRhcmdldFRpY2ssIGV2ZW50ID0gbnVsbCl7XG4gIC8vY29uc29sZS50aW1lKCdmcm9tQmFycycpO1xuICBsZXQgaSA9IDAsXG4gICAgZGlmZkJhcnMsXG4gICAgZGlmZkJlYXRzLFxuICAgIGRpZmZTaXh0ZWVudGgsXG4gICAgZGlmZlRpY2ssXG4gICAgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2Upe1xuICAgIGlmKHRhcmdldEJhciA+IGxhc3RFdmVudC5iYXIpe1xuICAgICAgdGFyZ2V0QmFyID0gbGFzdEV2ZW50LmJhcjtcbiAgICB9XG4gIH1cblxuICBpZihldmVudCA9PT0gbnVsbCl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ2JhcicsIHRhcmdldEJhcik7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy9jb3JyZWN0IHdyb25nIHBvc2l0aW9uIGRhdGEsIGZvciBpbnN0YW5jZTogJzMsMywyLDc4OCcgYmVjb21lcyAnMyw0LDQsMDY4JyBpbiBhIDQvNCBtZWFzdXJlIGF0IFBQUSA0ODBcbiAgd2hpbGUodGFyZ2V0VGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgdGFyZ2V0U2l4dGVlbnRoKys7XG4gICAgdGFyZ2V0VGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgfVxuXG4gIHdoaWxlKHRhcmdldFNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgdGFyZ2V0QmVhdCsrO1xuICAgIHRhcmdldFNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gIH1cblxuICB3aGlsZSh0YXJnZXRCZWF0ID4gbm9taW5hdG9yKXtcbiAgICB0YXJnZXRCYXIrKztcbiAgICB0YXJnZXRCZWF0IC09IG5vbWluYXRvcjtcbiAgfVxuXG4gIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdiYXInLCB0YXJnZXRCYXIsIGluZGV4KTtcbiAgZm9yKGkgPSBpbmRleDsgaSA+PSAwOyBpLS0pe1xuICAgIGV2ZW50ID0gc29uZy5fdGltZUV2ZW50c1tpXTtcbiAgICBpZihldmVudC5iYXIgPD0gdGFyZ2V0QmFyKXtcbiAgICAgIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlc1xuICBkaWZmVGljayA9IHRhcmdldFRpY2sgLSB0aWNrO1xuICBkaWZmU2l4dGVlbnRoID0gdGFyZ2V0U2l4dGVlbnRoIC0gc2l4dGVlbnRoO1xuICBkaWZmQmVhdHMgPSB0YXJnZXRCZWF0IC0gYmVhdDtcbiAgZGlmZkJhcnMgPSB0YXJnZXRCYXIgLSBiYXI7IC8vYmFyIGlzIGFsd2F5cyBsZXNzIHRoZW4gb3IgZXF1YWwgdG8gdGFyZ2V0QmFyLCBzbyBkaWZmQmFycyBpcyBhbHdheXMgPj0gMFxuXG4gIC8vY29uc29sZS5sb2coJ2RpZmYnLGRpZmZCYXJzLGRpZmZCZWF0cyxkaWZmU2l4dGVlbnRoLGRpZmZUaWNrKTtcbiAgLy9jb25zb2xlLmxvZygnbWlsbGlzJyxtaWxsaXMsdGlja3NQZXJCYXIsdGlja3NQZXJCZWF0LHRpY2tzUGVyU2l4dGVlbnRoLG1pbGxpc1BlclRpY2spO1xuXG4gIC8vIGNvbnZlcnQgZGlmZmVyZW5jZXMgdG8gbWlsbGlzZWNvbmRzIGFuZCB0aWNrc1xuICBkaWZmTWlsbGlzID0gKGRpZmZCYXJzICogdGlja3NQZXJCYXIpICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSAoZGlmZkJlYXRzICogdGlja3NQZXJCZWF0KSAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gKGRpZmZTaXh0ZWVudGggKiB0aWNrc1BlclNpeHRlZW50aCkgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IGRpZmZUaWNrICogbWlsbGlzUGVyVGljaztcbiAgZGlmZlRpY2tzID0gZGlmZk1pbGxpcyAvIG1pbGxpc1BlclRpY2s7XG4gIC8vY29uc29sZS5sb2coZGlmZkJhcnMsIHRpY2tzUGVyQmFyLCBtaWxsaXNQZXJUaWNrLCBkaWZmTWlsbGlzLCBkaWZmVGlja3MpO1xuXG4gIC8vIHNldCBhbGwgY3VycmVudCBwb3NpdGlvbiBkYXRhXG4gIGJhciA9IHRhcmdldEJhcjtcbiAgYmVhdCA9IHRhcmdldEJlYXQ7XG4gIHNpeHRlZW50aCA9IHRhcmdldFNpeHRlZW50aDtcbiAgdGljayA9IHRhcmdldFRpY2s7XG4gIC8vY29uc29sZS5sb2codGljaywgdGFyZ2V0VGljaylcblxuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcbiAgLy9jb25zb2xlLmxvZyh0YXJnZXRCYXIsIHRhcmdldEJlYXQsIHRhcmdldFNpeHRlZW50aCwgdGFyZ2V0VGljaywgJyAtPiAnLCBtaWxsaXMpO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgLy9jb25zb2xlLnRpbWVFbmQoJ2Zyb21CYXJzJyk7XG59XG5cblxuZnVuY3Rpb24gY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCl7XG4gIC8vIHNwcmVhZCB0aGUgZGlmZmVyZW5jZSBpbiB0aWNrIG92ZXIgYmFycywgYmVhdHMgYW5kIHNpeHRlZW50aFxuICBsZXQgdG1wID0gcm91bmQoZGlmZlRpY2tzKTtcbiAgd2hpbGUodG1wID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICBzaXh0ZWVudGgrKztcbiAgICB0bXAgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgd2hpbGUoc2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICBiZWF0Kys7XG4gICAgICB3aGlsZShiZWF0ID4gbm9taW5hdG9yKXtcbiAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgIGJhcisrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB0aWNrID0gcm91bmQodG1wKTtcbn1cblxuXG4vLyBzdG9yZSBwcm9wZXJ0aWVzIG9mIGV2ZW50IGluIGxvY2FsIHNjb3BlXG5mdW5jdGlvbiBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KXtcblxuICBicG0gPSBldmVudC5icG07XG4gIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcblxuICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgLy9jb25zb2xlLmxvZyhicG0sIGV2ZW50LnR5cGUpO1xuICAvL2NvbnNvbGUubG9nKCd0aWNrcycsIHRpY2tzLCAnbWlsbGlzJywgbWlsbGlzLCAnYmFyJywgYmFyKTtcbn1cblxuXG5mdW5jdGlvbiBnZXRQb3NpdGlvbkRhdGEoc29uZyl7XG4gIGxldCB0aW1lRGF0YSxcbiAgICBwb3NpdGlvbkRhdGEgPSB7fTtcblxuICBzd2l0Y2gocmV0dXJuVHlwZSl7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgLy9wb3NpdGlvbkRhdGEubWlsbGlzID0gbWlsbGlzO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpcyA9IHJvdW5kKG1pbGxpcyAqIDEwMDApIC8gMTAwMDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNSb3VuZGVkID0gcm91bmQobWlsbGlzKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3MgPSB0aWNrcztcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrcyA9IHJvdW5kKHRpY2tzKTtcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzVW5yb3VuZGVkID0gdGlja3M7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXIgPSBiYXI7XG4gICAgICBwb3NpdGlvbkRhdGEuYmVhdCA9IGJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2sgPSB0aWNrO1xuICAgICAgLy9wb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2tBc1N0cmluZztcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgZ2V0VGlja0FzU3RyaW5nKHRpY2spO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhbGwnOlxuICAgICAgLy8gbWlsbGlzXG4gICAgICAvL3Bvc2l0aW9uRGF0YS5taWxsaXMgPSBtaWxsaXM7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzID0gcm91bmQobWlsbGlzICogMTAwMCkgLyAxMDAwO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1JvdW5kZWQgPSByb3VuZChtaWxsaXMpO1xuXG4gICAgICAvLyB0aWNrc1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3MgPSB0aWNrcztcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrcyA9IHJvdW5kKHRpY2tzKTtcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzVW5yb3VuZGVkID0gdGlja3M7XG5cbiAgICAgIC8vIGJhcnNiZWF0c1xuICAgICAgcG9zaXRpb25EYXRhLmJhciA9IGJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5iZWF0ID0gYmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEudGljayA9IHRpY2s7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGlja0FzU3RyaW5nO1xuICAgICAgcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyBnZXRUaWNrQXNTdHJpbmcodGljayk7XG5cbiAgICAgIC8vIHRpbWVcbiAgICAgIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuXG4gICAgICAvLyBleHRyYSBkYXRhXG4gICAgICBwb3NpdGlvbkRhdGEuYnBtID0gcm91bmQoYnBtICogc29uZy5wbGF5YmFja1NwZWVkLCAzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gICAgICBwb3NpdGlvbkRhdGEuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyQmFyID0gdGlja3NQZXJCYXI7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgICAgIHBvc2l0aW9uRGF0YS5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUGVyVGljayA9IG1pbGxpc1BlclRpY2s7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljaztcblxuICAgICAgLy8gdXNlIHRpY2tzIHRvIG1ha2UgdGVtcG8gY2hhbmdlcyB2aXNpYmxlIGJ5IGEgZmFzdGVyIG1vdmluZyBwbGF5aGVhZFxuICAgICAgcG9zaXRpb25EYXRhLnBlcmNlbnRhZ2UgPSB0aWNrcyAvIHNvbmcuX2R1cmF0aW9uVGlja3M7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5wZXJjZW50YWdlID0gbWlsbGlzIC8gc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIHBvc2l0aW9uRGF0YVxufVxuXG5cbmZ1bmN0aW9uIGdldFRpY2tBc1N0cmluZyh0KXtcbiAgaWYodCA9PT0gMCl7XG4gICAgdCA9ICcwMDAnXG4gIH1lbHNlIGlmKHQgPCAxMCl7XG4gICAgdCA9ICcwMCcgKyB0XG4gIH1lbHNlIGlmKHQgPCAxMDApe1xuICAgIHQgPSAnMCcgKyB0XG4gIH1cbiAgcmV0dXJuIHRcbn1cblxuXG4vLyB1c2VkIGJ5IHBsYXloZWFkXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9zaXRpb24yKHNvbmcsIHVuaXQsIHRhcmdldCwgdHlwZSwgZXZlbnQpe1xuICBpZih1bml0ID09PSAnbWlsbGlzJyl7XG4gICAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQsIGV2ZW50KTtcbiAgfWVsc2UgaWYodW5pdCA9PT0gJ3RpY2tzJyl7XG4gICAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldCwgZXZlbnQpO1xuICB9XG4gIGlmKHR5cGUgPT09ICdhbGwnKXtcbiAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgfVxuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xufVxuXG5cbi8vIGltcHJvdmVkIHZlcnNpb24gb2YgZ2V0UG9zaXRpb25cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCBzZXR0aW5ncyl7XG4gIGxldCB7XG4gICAgdHlwZSwgLy8gYW55IG9mIGJhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlXG4gICAgdGFyZ2V0LCAvLyBpZiB0eXBlIGlzIGJhcnNiZWF0cyBvciB0aW1lLCB0YXJnZXQgbXVzdCBiZSBhbiBhcnJheSwgZWxzZSBpZiBtdXN0IGJlIGEgbnVtYmVyXG4gICAgcmVzdWx0OiByZXN1bHQgPSAnYWxsJywgLy8gYW55IG9mIGJhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgYWxsXG4gICAgYmVvczogYmVvcyA9IHRydWUsXG4gICAgc25hcDogc25hcCA9IC0xXG4gIH0gPSBzZXR0aW5nc1xuXG4gIGlmKHN1cHBvcnRlZFJldHVyblR5cGVzLmluZGV4T2YocmVzdWx0KSA9PT0gLTEpe1xuICAgIGNvbnNvbGUud2FybihgdW5zdXBwb3J0ZWQgcmV0dXJuIHR5cGUsICdhbGwnIHVzZWQgaW5zdGVhZCBvZiAnJHtyZXN1bHR9J2ApXG4gICAgcmVzdWx0ID0gJ2FsbCdcbiAgfVxuXG4gIHJldHVyblR5cGUgPSByZXN1bHRcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuXG4gIGlmKHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkgPT09IC0xKXtcbiAgICBjb25zb2xlLmVycm9yKGB1bnN1cHBvcnRlZCB0eXBlICR7dHlwZX1gKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cblxuICBzd2l0Y2godHlwZSl7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBsZXQgW3RhcmdldGJhciA9IDEsIHRhcmdldGJlYXQgPSAxLCB0YXJnZXRzaXh0ZWVudGggPSAxLCB0YXJnZXR0aWNrID0gMF0gPSB0YXJnZXRcbiAgICAgIC8vY29uc29sZS5sb2codGFyZ2V0YmFyLCB0YXJnZXRiZWF0LCB0YXJnZXRzaXh0ZWVudGgsIHRhcmdldHRpY2spXG4gICAgICBmcm9tQmFycyhzb25nLCB0YXJnZXRiYXIsIHRhcmdldGJlYXQsIHRhcmdldHNpeHRlZW50aCwgdGFyZ2V0dGljaylcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAgbGV0IFt0YXJnZXRob3VyID0gMCwgdGFyZ2V0bWludXRlID0gMCwgdGFyZ2V0c2Vjb25kID0gMCwgdGFyZ2V0bWlsbGlzZWNvbmQgPSAwXSA9IHRhcmdldFxuICAgICAgbGV0IG1pbGxpcyA9IDBcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRob3VyICogNjAgKiA2MCAqIDEwMDAgLy9ob3Vyc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbnV0ZSAqIDYwICogMTAwMCAvL21pbnV0ZXNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRzZWNvbmQgKiAxMDAwIC8vc2Vjb25kc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbGxpc2Vjb25kIC8vbWlsbGlzZWNvbmRzXG5cbiAgICAgIGZyb21NaWxsaXMoc29uZywgbWlsbGlzKVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldClcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHRhcmdldCAqIHNvbmcuX2R1cmF0aW9uVGlja3MgLy8gdGFyZ2V0IG11c3QgYmUgaW4gdGlja3MhXG4gICAgICAvL2NvbnNvbGUubG9nKHRpY2tzLCBzb25nLl9kdXJhdGlvblRpY2tzKVxuICAgICAgaWYoc25hcCAhPT0gLTEpe1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzIC8gc25hcCkgKiBzbmFwO1xuICAgICAgICAvL2Zyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGlja3MpO1xuICAgICAgfVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRpY2tzKVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIGxldCB0bXAgPSBnZXRQb3NpdGlvbkRhdGEoc29uZylcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXBcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG4vKlxuXG4vL0BwYXJhbTogJ21pbGxpcycsIDEwMDAsIFt0cnVlXVxuLy9AcGFyYW06ICd0aWNrcycsIDEwMDAsIFt0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCAxLCBbJ2FsbCcsIHRydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDYwLCA0LCAzLCAxMjAsIFsnYWxsJywgdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgNjAsIDQsIDMsIDEyMCwgW3RydWUsICdhbGwnXVxuXG5mdW5jdGlvbiBjaGVja1Bvc2l0aW9uKHR5cGUsIGFyZ3MsIHJldHVyblR5cGUgPSAnYWxsJyl7XG4gIGJleW9uZEVuZE9mU29uZyA9IHRydWU7XG4gIGNvbnNvbGUubG9nKCctLS0tPiBjaGVja1Bvc2l0aW9uOicsIGFyZ3MsIHR5cGVTdHJpbmcoYXJncykpO1xuXG4gIGlmKHR5cGVTdHJpbmcoYXJncykgPT09ICdhcnJheScpe1xuICAgIGxldFxuICAgICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoLFxuICAgICAgcG9zaXRpb24sXG4gICAgICBpLCBhLCBwb3NpdGlvbkxlbmd0aDtcblxuICAgIHR5cGUgPSBhcmdzWzBdO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgW1snbWlsbGlzJywgMzAwMF1dXG4gICAgaWYodHlwZVN0cmluZyhhcmdzWzBdKSA9PT0gJ2FycmF5Jyl7XG4gICAgICAvL2NvbnNvbGUud2FybigndGhpcyBzaG91bGRuXFwndCBoYXBwZW4hJyk7XG4gICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgIHR5cGUgPSBhcmdzWzBdO1xuICAgICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoO1xuICAgIH1cblxuICAgIHBvc2l0aW9uID0gW3R5cGVdO1xuXG4gICAgY29uc29sZS5sb2coJ2NoZWNrIHBvc2l0aW9uJywgYXJncywgbnVtQXJncywgc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSk7XG5cbiAgICAvL2NvbnNvbGUubG9nKCdhcmcnLCAwLCAnLT4nLCB0eXBlKTtcblxuICAgIGlmKHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkgIT09IC0xKXtcbiAgICAgIGZvcihpID0gMTsgaSA8IG51bUFyZ3M7IGkrKyl7XG4gICAgICAgIGEgPSBhcmdzW2ldO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdhcmcnLCBpLCAnLT4nLCBhKTtcbiAgICAgICAgaWYoYSA9PT0gdHJ1ZSB8fCBhID09PSBmYWxzZSl7XG4gICAgICAgICAgYmV5b25kRW5kT2ZTb25nID0gYTtcbiAgICAgICAgfWVsc2UgaWYoaXNOYU4oYSkpe1xuICAgICAgICAgIGlmKHN1cHBvcnRlZFJldHVyblR5cGVzLmluZGV4T2YoYSkgIT09IC0xKXtcbiAgICAgICAgICAgIHJldHVyblR5cGUgPSBhO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIHBvc2l0aW9uLnB1c2goYSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vY2hlY2sgbnVtYmVyIG9mIGFyZ3VtZW50cyAtPiBlaXRoZXIgMSBudW1iZXIgb3IgNCBudW1iZXJzIGluIHBvc2l0aW9uLCBlLmcuIFsnYmFyc2JlYXRzJywgMV0gb3IgWydiYXJzYmVhdHMnLCAxLCAxLCAxLCAwXSxcbiAgICAgIC8vIG9yIFsncGVyYycsIDAuNTYsIG51bWJlck9mVGlja3NUb1NuYXBUb11cbiAgICAgIHBvc2l0aW9uTGVuZ3RoID0gcG9zaXRpb24ubGVuZ3RoO1xuICAgICAgaWYocG9zaXRpb25MZW5ndGggIT09IDIgJiYgcG9zaXRpb25MZW5ndGggIT09IDMgJiYgcG9zaXRpb25MZW5ndGggIT09IDUpe1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKHBvc2l0aW9uLCByZXR1cm5UeXBlLCBiZXlvbmRFbmRPZlNvbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQb3NpdGlvbihzb25nLCB0eXBlLCBhcmdzKXtcbiAgLy9jb25zb2xlLmxvZygnZ2V0UG9zaXRpb24nLCBhcmdzKTtcblxuICBpZih0eXBlb2YgYXJncyA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB7XG4gICAgICBtaWxsaXM6IDBcbiAgICB9XG4gIH1cblxuICBsZXQgcG9zaXRpb24gPSBjaGVja1Bvc2l0aW9uKHR5cGUsIGFyZ3MpLFxuICAgIG1pbGxpcywgdG1wLCBzbmFwO1xuXG5cbiAgaWYocG9zaXRpb24gPT09IGZhbHNlKXtcbiAgICBlcnJvcignd3JvbmcgcG9zaXRpb24gZGF0YScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN3aXRjaCh0eXBlKXtcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIGZyb21CYXJzKHNvbmcsIHBvc2l0aW9uWzFdLCBwb3NpdGlvblsyXSwgcG9zaXRpb25bM10sIHBvc2l0aW9uWzRdKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIC8vIGNhbGN1bGF0ZSBtaWxsaXMgb3V0IG9mIHRpbWUgYXJyYXk6IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcbiAgICAgIG1pbGxpcyA9IDA7XG4gICAgICB0bXAgPSBwb3NpdGlvblsxXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDYwICogNjAgKiAxMDAwOyAvL2hvdXJzXG4gICAgICB0bXAgPSBwb3NpdGlvblsyXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDYwICogMTAwMDsgLy9taW51dGVzXG4gICAgICB0bXAgPSBwb3NpdGlvblszXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDEwMDA7IC8vc2Vjb25kc1xuICAgICAgdG1wID0gcG9zaXRpb25bNF0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXA7IC8vbWlsbGlzZWNvbmRzXG5cbiAgICAgIGZyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHBvc2l0aW9uWzFdKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIGZyb21UaWNrcyhzb25nLCBwb3NpdGlvblsxXSk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICdwZXJjJzpcbiAgICBjYXNlICdwZXJjZW50YWdlJzpcbiAgICAgIHNuYXAgPSBwb3NpdGlvblsyXTtcblxuICAgICAgLy9taWxsaXMgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICAvL2Zyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzKTtcblxuICAgICAgdGlja3MgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25UaWNrcztcbiAgICAgIGlmKHNuYXAgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHRpY2tzID0gZmxvb3IodGlja3Mvc25hcCkgKiBzbmFwO1xuICAgICAgICAvL2Zyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGlja3MpO1xuICAgICAgfVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgdG1wID0gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZygnZGlmZicsIHBvc2l0aW9uWzFdIC0gdG1wLnBlcmNlbnRhZ2UpO1xuICAgICAgcmV0dXJuIHRtcDtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbiovXG5cbiIsImltcG9ydCB7XG4gIE1JRElFdmVudFxufSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmltcG9ydHtcbiAgTUlESU5vdGUsXG59IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnR7XG4gIFBhcnQsXG59IGZyb20gJy4vcGFydCdcblxuaW1wb3J0e1xuICBUcmFjayxcbn0gZnJvbSAnLi90cmFjaydcblxuaW1wb3J0IHtcbiAgSW5zdHJ1bWVudCxcbn0gZnJvbSAnLi9pbnN0cnVtZW50J1xuXG5pbXBvcnQge1xuICBTb25nLFxufSBmcm9tICcuL3NvbmcnXG5cbmltcG9ydCB7XG4gIHBhcnNlTUlESUZpbGVcbn0gZnJvbSAnLi9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgaW5pdCxcbn0gZnJvbSAnLi9pbml0J1xuXG5pbXBvcnQge1xuICBjb250ZXh0LFxuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZSxcbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5pbXBvcnQge1xuICBnZXRNSURJQWNjZXNzLFxuICBnZXRNSURJSW5wdXRzLFxuICBnZXRNSURJT3V0cHV0cyxcbiAgZ2V0TUlESUlucHV0SWRzLFxuICBnZXRNSURJT3V0cHV0SWRzLFxuICBnZXRNSURJSW5wdXRzQnlJZCxcbiAgZ2V0TUlESU91dHB1dHNCeUlkLFxufSBmcm9tICcuL2luaXRfbWlkaSdcblxuaW1wb3J0IHtcbiAgcGFyc2VTYW1wbGVzLFxufSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuXG5cbmNvbnN0IGdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBjb250ZXh0XG59XG5cbmNvbnN0IHFhbWJpID0ge1xuICB2ZXJzaW9uOiAnMS4wLjAtYmV0YTInLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG5cbiAgLy8gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBNSURJRXZlbnQsXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBNSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBTb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBUcmFjayxcblxuICAvLyBmcm9tIC4vcGFydFxuICBQYXJ0LFxuXG4gIC8vIGZyb20gLi9pbnN0cnVtZW50XG4gIEluc3RydW1lbnQsXG5cbiAgcGFyc2VNSURJRmlsZSxcblxuICBsb2c6IGZ1bmN0aW9uKGlkKXtcbiAgICBzd2l0Y2goaWQpe1xuICAgICAgY2FzZSAnZnVuY3Rpb25zJzpcbiAgICAgICAgY29uc29sZS5sb2coYGZ1bmN0aW9uczpcbiAgICAgICAgICBjcmVhdGVNSURJRXZlbnRcbiAgICAgICAgICBtb3ZlTUlESUV2ZW50XG4gICAgICAgICAgbW92ZU1JRElFdmVudFRvXG4gICAgICAgICAgY3JlYXRlTUlESU5vdGVcbiAgICAgICAgICBjcmVhdGVTb25nXG4gICAgICAgICAgYWRkVHJhY2tzXG4gICAgICAgICAgY3JlYXRlVHJhY2tcbiAgICAgICAgICBhZGRQYXJ0c1xuICAgICAgICAgIGNyZWF0ZVBhcnRcbiAgICAgICAgICBhZGRNSURJRXZlbnRzXG4gICAgICAgIGApXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfSxcbn1cblxuLy8gc3RhbmRhcmQgTUlESSBldmVudHNcbi8vY29uc3QgTUlESSA9IHt9XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdOT1RFX09GRicsIHt2YWx1ZTogMHg4MH0pOyAvLzEyOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnTk9URV9PTicsIHt2YWx1ZTogMHg5MH0pOyAvLzE0NFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnUE9MWV9QUkVTU1VSRScsIHt2YWx1ZTogMHhBMH0pOyAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnQ09OVFJPTF9DSEFOR0UnLCB7dmFsdWU6IDB4QjB9KTsgLy8xNzZcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1BST0dSQU1fQ0hBTkdFJywge3ZhbHVlOiAweEMwfSk7IC8vMTkyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdDSEFOTkVMX1BSRVNTVVJFJywge3ZhbHVlOiAweEQwfSk7IC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdQSVRDSF9CRU5EJywge3ZhbHVlOiAweEUwfSk7IC8vMjI0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTWVNURU1fRVhDTFVTSVZFJywge3ZhbHVlOiAweEYwfSk7IC8vMjQwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdNSURJX1RJTUVDT0RFJywge3ZhbHVlOiAyNDF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1NPTkdfUE9TSVRJT04nLCB7dmFsdWU6IDI0Mn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU09OR19TRUxFQ1QnLCB7dmFsdWU6IDI0M30pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnVFVORV9SRVFVRVNUJywge3ZhbHVlOiAyNDZ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ0VPWCcsIHt2YWx1ZTogMjQ3fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdUSU1JTkdfQ0xPQ0snLCB7dmFsdWU6IDI0OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU1RBUlQnLCB7dmFsdWU6IDI1MH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnQ09OVElOVUUnLCB7dmFsdWU6IDI1MX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU1RPUCcsIHt2YWx1ZTogMjUyfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdBQ1RJVkVfU0VOU0lORycsIHt2YWx1ZTogMjU0fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTWVNURU1fUkVTRVQnLCB7dmFsdWU6IDI1NX0pO1xuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1RFTVBPJywge3ZhbHVlOiAweDUxfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdUSU1FX1NJR05BVFVSRScsIHt2YWx1ZTogMHg1OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnRU5EX09GX1RSQUNLJywge3ZhbHVlOiAweDJGfSk7XG5cblxuZXhwb3J0IGRlZmF1bHQgcWFtYmlcblxuZXhwb3J0IHtcbiAgLy8gZnJvbSAuL2luaXRcbiAgaW5pdCxcblxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG5cbiAgLy8gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICAvLyBmcm9tIC4vdXRpbFxuICBwYXJzZVNhbXBsZXMsXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgTUlESUV2ZW50LFxuXG4gIC8vIGZyb20gLi9taWRpX25vdGVcbiAgTUlESU5vdGUsXG5cbiAgLy8gZnJvbSAuL3NvbmdcbiAgU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgVHJhY2ssXG5cbiAgLy8gZnJvbSAuL3BhcnRcbiAgUGFydCxcblxuICAvLyBmcm9tIC4vaW5zdHJ1bWVudFxuICBJbnN0cnVtZW50LFxuXG4vLyAgTUlESSxcblxuICBwYXJzZU1JRElGaWxlLFxufVxuIiwiaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8uanMnXG5pbXBvcnQge2dldEVxdWFsUG93ZXJDdXJ2ZX0gZnJvbSAnLi91dGlsLmpzJ1xuXG5cbmNsYXNzIFNhbXBsZXtcblxuICBjb25zdHJ1Y3RvcihzYW1wbGVEYXRhLCBldmVudCl7XG4gICAgdGhpcy5ldmVudCA9IGV2ZW50XG4gICAgdGhpcy5zYW1wbGVEYXRhID0gc2FtcGxlRGF0YVxuXG4gICAgaWYodGhpcy5zYW1wbGVEYXRhID09PSAtMSB8fCB0eXBlb2YgdGhpcy5zYW1wbGVEYXRhLmJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgLy8gY3JlYXRlIHNpbXBsZSBzeW50aCBzYW1wbGVcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICB0aGlzLnNvdXJjZS50eXBlID0gJ3NpbmUnO1xuICAgICAgdGhpcy5zb3VyY2UuZnJlcXVlbmN5LnZhbHVlID0gZXZlbnQuZnJlcXVlbmN5XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgIHRoaXMuc291cmNlLmJ1ZmZlciA9IHNhbXBsZURhdGEuYnVmZmVyO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvdXJjZS5idWZmZXIpXG4gICAgfVxuICAgIHRoaXMub3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLnZvbHVtZSA9IGV2ZW50LmRhdGEyIC8gMTI3XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5zb3VyY2UuY29ubmVjdCh0aGlzLm91dHB1dClcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgfVxuXG4gIHN0YXJ0KHRpbWUpe1xuICAgIC8vY29uc29sZS5sb2codGhpcy5zb3VyY2UpO1xuICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBjYil7XG4gICAgbGV0IHtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZSwgcmVsZWFzZUVudmVsb3BlQXJyYXl9ID0gdGhpcy5zYW1wbGVEYXRhXG4gICAgaWYocmVsZWFzZUR1cmF0aW9uICYmIHJlbGVhc2VFbnZlbG9wZSl7XG4gICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUgKyByZWxlYXNlRHVyYXRpb24pXG4gICAgICBmYWRlT3V0KHRoaXMub3V0cHV0LCB7XG4gICAgICAgIHJlbGVhc2VEdXJhdGlvbixcbiAgICAgICAgcmVsZWFzZUVudmVsb3BlLFxuICAgICAgICByZWxlYXNlRW52ZWxvcGVBcnJheSxcbiAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUpO1xuICAgIH1cblxuICAgIHRoaXMuc291cmNlLm9uZW5kZWQgPSBjYjtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBmYWRlT3V0KGdhaW5Ob2RlLCBzZXR0aW5ncyl7XG4gIGxldCBub3cgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gIGxldCB2YWx1ZXMsIGksIG1heGlcblxuICAvL2NvbnNvbGUubG9nKHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZSlcbiAgc3dpdGNoKHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZSl7XG5cbiAgICBjYXNlICdsaW5lYXInOlxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluTm9kZS5nYWluLnZhbHVlLCBub3cpXG4gICAgICBnYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIG5vdyArIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdlcXVhbF9wb3dlcic6XG4gICAgICB2YWx1ZXMgPSBnZXRFcXVhbFBvd2VyQ3VydmUoMTAwLCAnZmFkZU91dCcsIGdhaW5Ob2RlLmdhaW4udmFsdWUpXG4gICAgICBnYWluTm9kZS5nYWluLnNldFZhbHVlQ3VydmVBdFRpbWUodmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdhcnJheSc6XG4gICAgICBtYXhpID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXkubGVuZ3RoXG4gICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1heGkpXG4gICAgICBmb3IoaSA9IDA7IGkgPCBtYXhpOyBpKyspe1xuICAgICAgICB2YWx1ZXNbaV0gPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheVtpXSAqIGdhaW5Ob2RlLmdhaW4udmFsdWVcbiAgICAgIH1cbiAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVDdXJ2ZUF0VGltZSh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2FtcGxlKC4uLmFyZ3Mpe1xuICByZXR1cm4gbmV3IFNhbXBsZSguLi5hcmdzKVxufVxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJlbXB0eU9nZ1wiOiBcIlQyZG5Vd0FDQUFBQUFBQUFBQUJkeGQ0WEFBQUFBRGFTMGpRQkhnRjJiM0ppYVhNQUFBQUFBVVNzQUFBQUFBQUFnTHNBQUFBQUFBQzRBVTluWjFNQUFBQUFBQUFBQUFBQVhjWGVGd0VBQUFBYVhLK1FEejMvLy8vLy8vLy8vLy8vLy8vL01nTjJiM0ppYVhNdEFBQUFXR2x3YUM1UGNtY2diR2xpVm05eVltbHpJRWtnTWpBeE1ERXhNREVnS0ZOamFHRjFabVZ1ZFdkblpYUXBBQUFBQUFFRmRtOXlZbWx6SDBKRFZnRUFBQUVBR0dOVUtVYVpVdEpLaVJsemxERkdtV0tTU29tbGhCWkNTSjF6RkZPcE9kZWNhNnk1dFNDRUVCcFRVQ2tGbVZLT1Vta1pZNUFwQlpsU0VFdEpKWFFTT2llZFl4QmJTY0hXbUd1TFFiWWNoQTJhVWt3cHhKUlNpa0lJR1ZPTUtjV1VVa3BDQnlWMERqcm1IRk9PU2loQnVKeHpxN1dXbG1PTHFYU1NTdWNrWkV4Q1NDbUZra29IcFZOT1FrZzFsdFpTS1IxelVsSnFRZWdnaEJCQ3RpQ0VEWUxRa0ZVQUFBRUF3RUFRR3JJS0FGQUFBQkNLb1JpS0FvU0dyQUlBTWdBQUJLQW9qdUlvamlNNWttTkpGaEFhc2dvQUFBSUFFQUFBd0hBVVNaRVV5YkVrUzlJc1M5TkVVVlY5MVRaVlZmWjFYZGQxWGRkMUlEUmtGUUFBQVFCQVNLZVpwUm9nd2d4a0dBZ05XUVVBSUFBQUFFWW93aEFEUWtOV0FRQUFBUUFBWWlnNWlDYTA1bnh6am9ObU9XZ3F4ZVowY0NMVjVrbHVLdWJtbkhQT09TZWJjOFk0NTV4emluSm1NV2dtdE9hY2N4S0RaaWxvSnJUbW5IT2V4T1pCYTZxMDVweHp4am1uZzNGR0dPZWNjNXEwNWtGcU50Ym1uSE1XdEtZNWFpN0Y1cHh6SXVYbVNXMHUxZWFjYzg0NTU1eHp6am5ubkhPcUY2ZHpjRTQ0NTV4em92Ym1XbTVDRitlY2N6NFpwM3R6UWpqbm5IUE9PZWVjYzg0NTU1eHpndENRVlFBQUVBQUFRUmcyaG5HbklFaWZvNEVZUllocHlLUUgzYVBESkdnTWNncXBSNk9qa1ZMcUlKUlV4a2twblNBMFpCVUFBQWdBQUNHRUZGSklJWVVVVWtnaGhSUlNpQ0dHR0dMSUthZWNnZ29xcWFTaWlqTEtMTFBNTXNzc3M4d3k2N0N6empyc01NUVFRd3l0dEJKTFRiWFZXR090dWVlY2F3N1NXbW10dGRaS0thV1VVa29wQ0ExWkJRQ0FBQUFRQ0Jsa2tFRkdJWVVVVW9naHBweHl5aW1vb0FKQ1ExWUJBSUFBQUFJQUFBQTh5WE5FUjNSRVIzUkVSM1JFUjNSRXgzTThSNVJFU1pSRVNiUk15OVJNVHhWVjFaVmRXOVpsM2ZadFlSZDIzZmQxMy9kMTQ5ZUZZVm1XWlZtV1pWbVdaVm1XWlZtV1pWbUMwSkJWQUFBSUFBQ0FFRUlJSVlVVVVrZ2hwUmhqekRIbm9KTlFRaUEwWkJVQUFBZ0FJQUFBQU1CUkhNVnhKRWR5Sk1tU0xFbVRORXV6UE0zVFBFMzBSRkVVVGROVVJWZDBSZDIwUmRtVVRkZDBUZGwwVlZtMVhWbTJiZG5XYlYrV2JkLzNmZC8zZmQvM2ZkLzNmZC8zZFIwSURWa0ZBRWdBQU9oSWpxUklpcVJJanVNNGtpUUJvU0dyQUFBWkFBQUJBQ2lLb3ppTzQwaVNKRW1XcEVtZTVWbWlabXFtWjNxcXFBS2hJYXNBQUVBQUFBRUFBQUFBQUNpYTRpbW00aW1pNGptaUkwcWlaVnFpcG1xdUtKdXk2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3b3VFQnF5Q2dDUUFBRFFrUnpKa1J4SmtSUkprUnpKQVVKRFZnRUFNZ0FBQWdCd0RNZVFGTW14TEV2VFBNM1RQRTMwUkUvMFRFOFZYZEVGUWtOV0FRQ0FBQUFDQUFBQUFBQXdKTU5TTEVkek5FbVVWRXUxVkUyMVZFc1ZWVTlWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVTFUZE0wVFNBMFpDVUFBQVFBd0dLTndlVWdJU1VsNWQ0UXdoQ1RuakVtSWJWZUlRU1JrdDR4QmhXRG5qS2lESExlUXVNUWd4NElEVmtSQUVRQkFBREdJTWNRYzhnNVI2bVRFam5ucUhTVUd1Y2NwWTVTWnluRm1HTE5LSlhZVXF5TmM0NVNSNjJqbEdJc0xYYVVVbzJweGdJQUFBSWNBQUFDTElSQ1ExWUVBRkVBQUlReFNDbWtGR0tNT2FlY1E0d3A1NWh6aGpIbUhIT09PZWVnZEZJcTU1eDBUa3JFR0hPT09hZWNjMUk2SjVWelRrb25vUUFBZ0FBSEFJQUFDNkhRa0JVQlFKd0FnRUdTUEUveU5GR1VORThVUlZOMFhWRTBYZGZ5UE5YMFRGTlZQZEZVVlZOVmJkbFVWVm1XUE04MFBkTlVWYzgwVmRWVVZWazJWVldXUlZYVmJkTjFkZHQwVmQyV2JkdjNYVnNXZGxGVmJkMVVYZHMzVmRmMlhkbjJmVm5XZFdQeVBGWDFUTk4xUGROMFpkVjFiVnQxWFYzM1RGT1dUZGVWWmROMWJkdVZaVjEzWmRuM05kTjBYZE5WWmRsMFhkbDJaVmUzWFZuMmZkTjFoZCtWWlY5WFpWa1lkbDMzaFZ2WGxlVjBYZDFYWlZjM1ZsbjJmVnZYaGVIV2RXR1pQRTlWUGROMFhjODBYVmQxWFY5WFhkZldOZE9VWmROMWJkbFVYVmwyWmRuM1hWZldkYzgwWmRsMFhkczJYVmVXWFZuMmZWZVdkZDEwWFY5WFpWbjRWVmYyZFZuWGxlSFdiZUUzWGRmM1ZWbjJoVmVXZGVIV2RXRzVkVjBZUGxYMWZWTjJoZUYwWmQvWGhkOVpibDA0bHRGMWZXR1ZiZUZZWlZrNWZ1RllsdDMzbFdWMFhWOVliZGtZVmxrV2hsLzRuZVgyZmVONGRWMFpidDNuekxydkRNZnZwUHZLMDlWdFk1bDkzVmxtWDNlTzRSZzZ2L0RqcWFxdm02NHJES2NzQzcvdDY4YXorNzZ5aks3cis2b3NDNzhxMjhLeDY3N3ovTDZ3TEtQcytzSnF5OEt3MnJZeDNMNXVMTDl3SE10cjY4b3g2NzVSdG5WOFgzZ0t3L04wZFYxNVpsM0g5blYwNDBjNGZzb0FBSUFCQndDQUFCUEtRS0VoS3dLQU9BRUFqeVNKb21SWm9paFpsaWlLcHVpNm9taTZycVJwcHFscG5tbGFtbWVhcG1tcXNpbWFyaXhwbW1sYW5tYWFtcWVacG1pYXJtdWFwcXlLcGluTHBtcktzbW1hc3V5NnNtMjdybXpib21uS3NtbWFzbXlhcGl5N3NxdmJydXpxdXFSWnBxbDVubWxxbm1lYXBtcktzbW1hcnF0NW5tcDZubWlxbmlpcXFtcXFxcTJxcWl4Ym5tZWFtdWlwcGllS3FtcXFwcTJhcWlyTHBxcmFzbW1xdG15cXFtMjdxdXo2c20zcnVtbXFzbTJxcGkyYnFtcmJydXpxc2l6YnVpOXBtbWxxbm1lYW11ZVpwbW1hc215YXFpdGJucWVhbmlpcXF1YUpwbXFxcWl5YnBxcktsdWVacWllS3F1cUpubXVhcWlyTHBtcmFxbW1hdG15cXFpMmJwaXJMcm0zN3Z1dktzbTZxcW15YnFtcnJwbXJLc216THZ1L0txdTZLcGluTHBxcmFzbW1xc2kzYnN1L0xzcXo3b21uS3NtbXFzbTJxcWk3THNtMGJzMno3dW1pYXNtMnFwaTJicWlyYnNpMzd1aXpidXUvS3JtK3JxcXpyc2kzN3V1NzZybkRydWpDOHNtejdxcXo2dWl2YnVtL3JNdHYyZlVUVGxHVlROVzNiVkZWWmRtWFo5bVhiOW4zUk5HMWJWVlZiTmszVnRtVlo5bjFadG0xaE5FM1pObFZWMWszVnRHMVpsbTFodG1YaGRtWFp0MlZiOW5YWGxYVmYxMzNqMTJYZDVycXk3Y3V5cmZ1cXEvcTI3dnZDY091dThBb0FBQmh3QUFBSU1LRU1GQnF5RWdDSUFnQUFqR0dNTVFpTlVzNDVCNkZSeWpubklHVE9RUWdobGN3NUNDR1VramtIb1pTVU11Y2dsSkpTQ0tHVWxGb0xJWlNVVW1zRkFBQVVPQUFBQk5pZ0tiRTRRS0VoS3dHQVZBQUFnK05ZbHVlWm9tcmFzbU5KbmllS3FxbXF0dTFJbHVlSm9tbXFxbTFibmllS3BxbXFydXZybXVlSm9tbXFxdXZxdW1pYXBxbXFydXU2dWk2YW9xbXFxdXU2c3E2YnBxcXFyaXU3c3V6cnBxcXFxdXZLcml6N3dxcTZyaXZMc20zcndyQ3FydXZLc216YnRtL2N1cTdydnUvN3dwR3Q2N291L01JeERFY0JBT0FKRGdCQUJUYXNqbkJTTkJaWWFNaEtBQ0FEQUlBd0JpR0RFRUlHSVlTUVVrb2hwWlFTQUFBdzRBQUFFR0JDR1NnMFpFVUFFQ2NBQUJoREthU1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSklLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktxYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLWlZTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVnb0FrSXB3QUpCNk1LRU1GQnF5RWdCSUJRQUFqRkZLS2NhY2d4QXg1aGhqMEVrb0tXTE1PY1ljbEpKUzVSeUVFRkpwTGJmS09RZ2hwTlJTYlpselVscUxNZVlZTStla3BCUmJ6VG1IVWxLTHNlYWFhKzZrdEZacnJqWG5XbHFyTmRlY2M4MjV0QlpycmpuWG5IUExNZGVjYzg0NTV4aHp6am5ubkhQT0JRRGdORGdBZ0I3WXNEckNTZEZZWUtFaEt3R0FWQUFBQWhtbEdIUE9PZWdRVW93NTV4eUVFQ0tGR0hQT09RZ2hWSXc1NXh4MEVFS29HSFBNT1FnaGhKQTU1eHlFRUVJSUlYTU9PdWdnaEJCQ0J4MkVFRUlJb1pUT1FRZ2hoQkJLS0NHRUVFSUlJWVFRT2dnaGhCQkNDQ0dFRUVJSUlZUlNTZ2doaEJCQ0NhR1VVQUFBWUlFREFFQ0FEYXNqbkJTTkJSWWFzaElBQUFJQWdCeVdvRkxPaEVHT1FZOE5RY3BSTXcxQ1REblJtV0pPYWpNVlU1QTVFSjEwRWhscVFkbGVNZ3NBQUlBZ0FDREFCQkFZSUNqNFFnaUlNUUFBUVlqTUVBbUZWYkRBb0F3YUhPWUJ3QU5FaEVRQWtKaWdTTHU0Z0M0RFhOREZYUWRDQ0VJUWdsZ2NRQUVKT0RqaGhpZmU4SVFibktCVFZPb2dBQUFBQUFBTUFPQUJBT0NnQUNJaW1xdXd1TURJME5qZzZQQUlBQUFBQUFBV0FQZ0FBRGcrZ0lpSTVpb3NMakF5TkRZNE9qd0NBQUFBQUFBQUFBQ0FnSUFBQUFBQUFFQUFBQUNBZ0U5bloxTUFCQUVBQUFBQUFBQUFYY1hlRndJQUFBQnEybnB4QWdFQkFBbz1cIixcbiAgXCJlbXB0eU1wM1wiOiBcIi8vc1F4QUFEd0FBQnBBQUFBQ0FBQURTQUFBQUVURUZOUlRNdU9Ua3VOVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlU9XCIsXG4gIFwiaGlnaHRpY2tcIjogXCJVa2xHUmtRRkFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVNBRkFBQ3gveGYvZEFET0FDd0JzUDNwKzZIK3pBR29CT2tDQ3dCWC9FSDVPdnhsQTRrSjJ3Y1NBclQ5RS91dCtIVDJldlV4OThuNk9BRjVDQ1VNd1F2ZkNPc0p4QXgwRFNJTUVBcTlCaUFCM3ZoejdtTGtUOXNSMTMzWXhOMnM1UUx2MHZyVUJud1JueHVRSmVFc1NEQ2lNZDh5RlM4YUtGSWhvaFVzQ0tqNjR1NjI1T3JhQTlIdXlQbkVsY1Ard3h2Sld0VzI1NjM3VlEwakhQZ25CVERETTFvMEN6S0xLKzhoemhnRkRPejhTZTRKNDdEWVZ0RzB6NWZRcTlMQjEycmZBK2o5OXJvSEFoZWxJeU13SWpkVE91VThtandJT0dveGhDYjVFNTMvaiszazMvZlRZOHBUdzR5L1RyK2V3OERNdmRzazhSY0hSUmtTS080eUdUa0hQa1Uvcnp6eU5jZ3NyUjk0RHAvNXIrWnMxN3pPbmNvRHhoZkUzOFdMeW4vVGVPTWk5cjBJUnhsUktJUXp5VGxPUEtvOXlqbVdNY29rRFJMYy9ZN3J1ZHRkenUvRDJMMUl1KzI3SmNHM3lZclZMdWpsKzNVT1p4MVVLNVEwcXptTlBEazhaamVlTVBvanpoSCsvakx0UGQ1bTBoSExIc1lJdzVURU1NbkEwanZqOGZTT0Jpd1hBU1pnTXpNOGRVQkdRYkkrcnpqcEtrSVp5Z1pUOVFmbGNkYVJ5cVhDejcrVndVUEg3ODRyM0s3cyt2MEtEdThidnllTE1iNDNOanJoT0lvMGRTdlFIaTBQblA2aTdvdmczTlR4eTQvR2Y4WDh5SC9RQnR2WDU1UDJZZ2IwRmNVanN5NExObUk1ZWppWE0zOHI3aUM4Rkp3SFB2b2s3ZERnUWRhSnpsVEtJc29GenNyVmt1QTg3ZC82cUFpN0ZRMGg5Q2xLTUxFejNUT3JNQmNxWVNEOEU5QUZkL2RTNmtUZjZkYlUwWG5RdjlJSDJNWGZaK2xuOURFQUZ3d2RGeThnaWliNkthd3FlQ2hnSS9VYkhCT1RDWmovdnZYZTdJbmxGdUROM1AzYjBkMUY0Z3pwaWZHMit1NEQ3UXcxRmZ3Ym5DRCtJbGdqV3lITEhQTVZvZzJtQkwzN3F2UCs3TnZuWXVUdjRydmpmdWJONmszd3BQWjAvV2tFT3d0aUVVc1djeG0rR2w0YU9oaGlGREFQSXdtYkF0bjdUUFZ5Nzd6cWNlZnI1WUhtSHVsbDdlbnlmUG1jQUhnSGV3MVJFcjhWaGhkL0YrQVYxUkowRGlrSldRTmMvWlAzZWZLZDdodnMydXI0NnJIczV1OGU5Ti80OC8waEEvOEhGZ3d1RDA0UlNCSVJFcXNRT2c3bUNzc0dNQUpXL1huNEcvVEs4TGJ1enUwSTdxVHZuUEp5OXNYNmJQODRCTFlJYkF3ZEQ4NFFZeEc3RU9jT0RBeHdDRk1FQVFDOSs3UDNTdlRYOFhIdyt1OVI4S1R4SXZTbzkrWDdWUUNVQkowSU13emlEajRRTGhBR0Q5VU1yZ25UQlpjQlJ2MXYrWHYyVWZTKzh0ZngrdkVTODd6MCt2YjMrWmY5WmdFUUJTRUlVQXJXQzhrTTJReXpDNUVKRUFkdkJIZ0JYUDVuKytyNEF2ZDg5V2owN2ZNdzlEMzFKdmZwK1VqOXhRRDlBOFFHNVFoWENsRUxyQXN2Qzl3SjdnZDZCV0lDM3Y2Tys3VDRQUFpOOUVIeld2TmY5UHoxRnZpdCtxTDlyUUNIQXdFRy93ZUNDWlVLRnd2RENuSUpjQWNRQldjQ2FmOFovQ0Q1NXZhQjlkRDB3UFNQOVVMM20vazcvTXorSndFeUF3OEZ6QVk3Q0JzSmFRazVDV2tJMmdhdEJDSUNZZitqL0ZyNnZmaVY5ODcyc2ZaUDkxejRwL2xSKzNIOXpmODlBcm9FRkFmakNQMEpjd284Q2pBSmRRZGdCU0VEa2dEUS9WajdaZm5SOTVUMjhmVWQ5djMyVnZnMituYjgrLzZ4QVdvRTRBYkRDUDRKcEFxYkNxUUowd2VFQmZnQ1RBQ1QvUjM3TS9tKzk2NzJJUFk2OWdiM2FmaFcrdFQ4cWYrTUFqMEZnZ2N1Q1NjS1hBcmlDY01JRUFmeUJKWUNGd0NQL1J6N0EvbDc5M3oyRi9abjltSDM3ZmpkK2kzOXlmOXBBdDBFRkFmUkNOa0pHQXFyQ1pZSXZnWlBCSjhCNlA0Ly9NMzUwdmR6OXEvMWxmVXE5bXozUlBtaSszSCtiZ0ZWQk9RRzN3Z0hDa3dLMEFtN0NDQUhDZ1dtQWpBQVwiLFxuICBcImxvd3RpY2tcIjogXCJVa2xHUmxRRkFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVRBRkFBQjAvNXYrVS80VC8zZ0Ewd0ZUQXVVQitmOGQvblQ5MGYxcS91Yit0ZjQ2L21iLzh3RlFBOWdDN3dDZC9tcitGQUdSQTNjRTZ3SmYvaDM2ZXZtdis4di9Od1JIQlpVQzIvNjArLy81RXZ1Wi9hWC9iZ0ZPQXA4QXp2emg5d2Z6TFBGNjh6VDR5LzJCQXlnSWZRd2FFallZMHgzMUlyd2w4U09XSFZFU09nUGg5TmZwUmVGdDIybllIZGREMkJYY1plRGE1SW5xZ1BEeDluUCs2Z1M0Q0JZTG53MHpFUzBXWHh2NEhrY2dMaC8xRytFWDFSTnBENHdLaWdYSC82cjUvZk51N2xUcGorWnU1aEhvWE90TDcxYnlyL1FwOTFMNjR2Nk9CTzRKb1E1ekVza1UraFUxRmlRVmVSUDdFV2dQNFFyMEJJVCt0UGlkOUMzeTF2Q2g4RkR4SnZLMjh2dnl5L0xBOHBMelUvWFA5NXY2eHZ3NC91RC9SQUsyQlNrS2NnNkJFU2NUWkJNZUVxa1BUUXhqQ0tFRVZ3RmkvbnY3aC9ocDlhRHlBdkhQOE1meEx2TSs5UFgwdVBXMTlnLzRMZnI3L0M0QUtnTmFCWFFHeXdiMEJoSUhXUWZXQjFvSXpBanRDRjhJSHdkdEJha0RWd0tMQWVZQTh2OXcva2o4MS9uUTk0djI5L1hYOWJ6MWJQVVk5VXoxWi9hSCtIcjd5UDRNQWk0Rit3Y2ZDbllMTmd5ZkRQc01TdzBzRFVBTWZncmNCNUlFTXdGYi9pWDhUL3BUK08vMVgvTWY4Y2J2ck8rMThNTHl2ZlZQK1JmOXdnQW9CQ0VIcHduSUM1RU40UTVBRDN3TzFBeTBDcHNJdndidkJOY0NiUUFyL25YOE9mc2YrdmI0bXZkYTlyajF6L1dYOXBMM2EvaEgrWlg2Ui93bi92UC9lUUVTQS9BRSt3WURDY3dLRkF5UERDa01GUXVTQ2U0SFZRYlNCSFFEQ3dJOEFOTDlKUHVZK0hYMjh2VHE4MlB6ZFBNVjlBejFNZlo0OXpENWdmdHgvc1FCQlFYTEI4Y0ovZ3FwQ3c4TWlnd1dEWEVOWFEyckREVUw3UWdEQnN3Q2R2OFMvSzc0V1BWazhoWHdvdTRQN212dTErOVQ4cHoxVXZsaS9ab0J3Z1dSQ2NzTVBnL0NFRVFSNFJEQUR3b085d3VzQ1ZNSDRBUlNBcG4vdWZ6ZCtXajNidlg3OHh6engvTDY4cXp6MXZTRDlxWDRHZnZkL2MwQWh3Ty9CV3dIbWdodkNRRUtWUW9uQ2xzSkN3aUlCaDBGMGdPZ0FtMEJPd0F4LzAzK1hQMGcvTGI2Y1BtWCtGLzR2ZmgrK1RINnMvb3MrNy83Y3Z3TC9aejlYUDVPLzNJQTNBRjlBenNGOWdhVUNBQUtIZ3VlQ3pjTDl3bnRCM3NGNHdJekFJMzk2ZnAxK0d2Mkl2V245TjMwcC9YaTltNzRHL3J1KzlQOWsvOGFBWUVDMUFNVEJTSUcwd1l1QjFnSGtnY0FDR0VJU0FoVEJ6RUZXQUt0LzVMOTJmdVUrdlg1MGZtZitTUDVpL2diK0JmNG12aXYrU3I3a3Z5Yi9VaityLzRYLzhyLytnQ2lBbzBFVUFhUkJ6d0lTd2pxQjNJSEdRZkNCdjhGcGdUTUFwUUFLZjY3KzVuNS92Zm45anoyeVBWbjlTTDFSUFhxOVNQM0R2bXIrNmYrc1FHS0JBY0grd2hPQ2gwTGF3czNDMjhLTEFtREI1QUZmUU5vQVZQL1p2M2UrN1A2c2ZuTCtDdjR2UGVNOTViMzdmZVYrSm41MVBvcS9MTDltditZQVZZRDNnUXVCbWNIU0Fpa0NJRUk3QWYrQnVFRm5nUVhBMXNCdi85di9wZjlNUDNXL0ZqOHEvc1IrNkg2VS9vMyttUDZ5L3BOKy9mN3h2eWUvV0grSmY5bUFENENRQVFKQmlzSHRnZjZCdzBJOFFkc0Ixc0d5d1Q0QWdnQkNQL28vS1g2bVBnMTk1NzJqZmF6OXVmMlMvY00rRTM1RS90Vy9hZi81d0gxQThBRktnZmtCL0FIZ3dmeEJsQUdnUVZJQk1NQ0p3R3MvNDMrdlAwaS9acjhMZnpsKzlINzZmdmkrOWY3NWZzZi9JbjhCUDEwL2VqOWNmNE8vN2YvZEFBY0FhVUJFZ0tNQWhnRHBBTUVCQ0VFRHdUZkEzSUR4UUw4QVNvQlV3Q0cvODcrSi82aC9ScjlwUHhrL0diOG9Qd0ovWEg5dy8zOS9VRCtxUDQxLzlEL1d3RGVBR3NCQWdLZEFoRURRUU5BQTBzRGJ3T1ZBNVlEVndQT0FoZ0NWQUdSQUE9PVwiLFxufSIsImltcG9ydCB7Z2V0TUlESU91dHB1dEJ5SWQsIGdldE1JRElPdXRwdXRzfSBmcm9tICcuL2luaXRfbWlkaSdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5cbmNvbnN0IEJVRkZFUl9USU1FID0gMjAwIC8vIG1pbGxpc1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXJ7XG5cbiAgY29uc3RydWN0b3Ioc29uZyl7XG4gICAgdGhpcy5zb25nID0gc29uZ1xuICB9XG5cblxuICBpbml0KG1pbGxpcyl7XG4gICAgdGhpcy5zb25nU3RhcnRNaWxsaXMgPSBtaWxsaXNcbiAgICB0aGlzLmV2ZW50cyA9IHRoaXMuc29uZy5fZXZlbnRzXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLmluZGV4ID0gMFxuICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gIH1cblxuXG4gIHNldFRpbWVTdGFtcCh0aW1lU3RhbXApe1xuICAgIHRoaXMudGltZVN0YW1wID0gdGltZVN0YW1wXG4gIH1cblxuICAvLyBnZXQgdGhlIGluZGV4IG9mIHRoZSBldmVudCB0aGF0IGhhcyBpdHMgbWlsbGlzIHZhbHVlIGF0IG9yIHJpZ2h0IGFmdGVyIHRoZSBwcm92aWRlZCBtaWxsaXMgdmFsdWVcbiAgc2V0SW5kZXgobWlsbGlzKXtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yKGxldCBldmVudCBvZiB0aGlzLmV2ZW50cyl7XG4gICAgICBpZihldmVudC5taWxsaXMgPj0gbWlsbGlzKXtcbiAgICAgICAgdGhpcy5pbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKCl7XG4gICAgbGV0IGV2ZW50cyA9IFtdXG4gICAgLy8gbWFpbiBsb29wXG4gICAgZm9yKGxldCBpID0gdGhpcy5pbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspe1xuICAgICAgbGV0IGV2ZW50ID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgdGhpcy5tYXh0aW1lKVxuICAgICAgaWYoZXZlbnQubWlsbGlzIDwgdGhpcy5tYXh0aW1lKXtcblxuICAgICAgICAvL2V2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBldmVudHM7XG4gIH1cblxuXG4gIHVwZGF0ZShtaWxsaXMpe1xuICAgIHZhciBpLFxuICAgICAgZXZlbnQsXG4gICAgICBudW1FdmVudHMsXG4gICAgICB0cmFjayxcbiAgICAgIGV2ZW50cyxcbiAgICAgIGluc3RydW1lbnQsXG4gICAgICBzY2hlZHVsZWRUaW1lXG5cbiAgICAvL2NvbnNvbGUubG9nKHBvc2l0aW9uLCB0aGlzLm1heHRpbWUpXG4gICAgZXZlbnRzID0gdGhpcy5nZXRFdmVudHMoKVxuICAgIG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLm1heHRpbWUgPSBtaWxsaXMgKyBCVUZGRVJfVElNRVxuXG4gICAgLy9jb25zb2xlLmxvZygndXBkYXRlJywgdGhpcy5tYXh0aW1lLCBudW1FdmVudHMpXG5cbiAgICBmb3IoaSA9IDA7IGkgPCBudW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IGV2ZW50c1tpXVxuICAgICAgdHJhY2sgPSBldmVudC5fdHJhY2tcbiAgICAgIGluc3RydW1lbnQgPSB0cmFjay5faW5zdHJ1bWVudFxuXG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnRpY2tzKVxuXG4gICAgICAvLyBpZih0eXBlb2YgaW5zdHJ1bWVudCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgLy8gICBjb250aW51ZVxuICAgICAgLy8gfVxuXG4gICAgICBpZihldmVudC5fcGFydC5tdXRlZCA9PT0gdHJ1ZSB8fCB0cmFjay5tdXRlZCA9PT0gdHJ1ZSB8fCBldmVudC5tdXRlZCA9PT0gdHJ1ZSl7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cblxuICAgICAgaWYoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvLyB0aGlzIGlzIHVzdWFsbHkgY2F1c2VkIGJ5IHRoZSBzYW1lIG5vdGUgb24gdGhlIHNhbWUgdGlja3MgdmFsdWUsIHdoaWNoIGlzIHByb2JhYmx5IGEgYnVnIGluIHRoZSBtaWRpIGZpbGVcbiAgICAgICAgLy9jb25zb2xlLmluZm8oJ25vIG1pZGlOb3RlSWQnLCBldmVudClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gZGVidWcgbWludXRlX3dhbHR6IGRvdWJsZSBldmVudHNcbiAgICAgIC8vIGlmKGV2ZW50LnRpY2tzID4gNDAzMDApe1xuICAgICAgLy8gICBjb25zb2xlLmluZm8oZXZlbnQpXG4gICAgICAvLyB9XG5cbiAgICAgIHNjaGVkdWxlZFRpbWUgPSAodGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxlZCcsIHNjaGVkdWxlZFRpbWUsICdjdXJyZW50JywgY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApXG5cbiAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfWVsc2V7XG5cbiAgICAgICAgLy8gc2VuZCB0byBqYXZhc2NyaXB0IGluc3RydW1lbnRcbiAgICAgICAgaWYodHlwZW9mIGluc3RydW1lbnQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAvLyBjb252ZXJ0IHRvIHNlY29uZHMgYmVjYXVzZSB0aGUgYXVkaW8gY29udGV4dCB1c2VzIHNlY29uZHMgZm9yIHNjaGVkdWxpbmdcbiAgICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHNjaGVkdWxlZFRpbWUgLyAxMDAwLCB0cmFjay5fb3V0cHV0KVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2VuZCB0byBleHRlcm5hbCBoYXJkd2FyZSBvciBzb2Z0d2FyZSBpbnN0cnVtZW50XG4gICAgICAgIGxldCBjaGFubmVsID0gdHJhY2suY2hhbm5lbFxuICAgICAgICBsZXQgb2Zmc2V0ID0gKEJVRkZFUl9USU1FICogMikgLy8gd2h5IGRvZXMgdGhpcyB3b3JrP1xuXG4gICAgICAgIGZvcihsZXQgcG9ydElkIG9mIHRyYWNrLl9taWRpT3V0cHV0SWRzKXtcbiAgICAgICAgICBsZXQgcG9ydCA9IGdldE1JRElPdXRwdXRCeUlkKHBvcnRJZClcbiAgICAgICAgICBpZihwb3J0KXtcbiAgICAgICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDEyOCB8fCBldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgY2hhbm5lbCwgZXZlbnQuZGF0YTEsIGV2ZW50LmRhdGEyXSwgc2NoZWR1bGVkVGltZSArIG9mZnNldClcbiAgICAgICAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDE5MiB8fCBldmVudC50eXBlID09PSAyMjQpe1xuICAgICAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyBjaGFubmVsLCBldmVudC5kYXRhMV0sIHNjaGVkdWxlZFRpbWUgKyBvZmZzZXQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5pbmRleCwgdGhpcy5udW1FdmVudHMpXG4gICAgLy9yZXR1cm4gdGhpcy5pbmRleCA+PSAxMFxuICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubnVtRXZlbnRzIC8vIGVuZCBvZiBzb25nXG4gIH1cblxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgLy9jb25zb2xlLmxvZygnU1RPUCcpXG4vLy8qXG4gICAgbGV0IHRpbWVTdGFtcCA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgbGV0IG91dHB1dHMgPSBnZXRNSURJT3V0cHV0cygpXG4gICAgb3V0cHV0cy5mb3JFYWNoKChvdXRwdXQpID0+IHtcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wICsgKEJVRkZFUl9USU1FICogMikpOyAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXAgKyAoQlVGRkVSX1RJTUUgKiAyKSk7IC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgIH0pXG4vLyovXG4gICAgbGV0IHRyYWNrcyA9IHRoaXMuc29uZy5fdHJhY2tzXG4gICAgdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICAvL2xldCBpbnN0cnVtZW50ID0gdHJhY2suX2luc3RydW1lbnRcbiAgICAgIC8vaWYodHlwZW9mIGluc3RydW1lbnQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIC8vICBpbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgICAgIC8vfVxuICAgICAgdHJhY2suX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICAgIH0pXG4gIH1cbn1cblxuIiwiLy9AIGZsb3dcblxuaW1wb3J0IHtwYXJzZVRpbWVFdmVudHMsIHBhcnNlRXZlbnRzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbi8vaW1wb3J0IHthZGRUYXNrLCByZW1vdmVUYXNrfSBmcm9tICcuL2hlYXJ0YmVhdCdcbmltcG9ydCB7Y29udGV4dCwgbWFzdGVyR2Fpbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlcidcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge3NvbmdGcm9tTUlESUZpbGUsIHNvbmdGcm9tTUlESUZpbGVBc3luY30gZnJvbSAnLi9zb25nX2Zyb21fbWlkaWZpbGUnXG5pbXBvcnQgcWFtYmkgZnJvbSAnLi9xYW1iaSdcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtjYWxjdWxhdGVQb3NpdGlvbn0gZnJvbSAnLi9wb3NpdGlvbidcbmltcG9ydCB7UGxheWhlYWR9IGZyb20gJy4vcGxheWhlYWQnXG5pbXBvcnQge2FkZEV2ZW50TGlzdGVuZXIsIHJlbW92ZUV2ZW50TGlzdGVuZXIsIGRpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcblxubGV0IHNvbmdJbmRleCA9IDBcblxuY29uc3QgZGVmYXVsdFNvbmcgPSB7XG4gIHBwcTogOTYwLFxuICBicG06IDEyMCxcbiAgYmFyczogMzAsXG4gIGxvd2VzdE5vdGU6IDAsXG4gIGhpZ2hlc3ROb3RlOiAxMjcsXG4gIG5vbWluYXRvcjogNCxcbiAgZGVub21pbmF0b3I6IDQsXG4gIHF1YW50aXplVmFsdWU6IDgsXG4gIGZpeGVkTGVuZ3RoVmFsdWU6IGZhbHNlLFxuICBwb3NpdGlvblR5cGU6ICdhbGwnLFxuICB1c2VNZXRyb25vbWU6IGZhbHNlLFxuICBhdXRvU2l6ZTogdHJ1ZSxcbiAgbG9vcDogZmFsc2UsXG4gIHBsYXliYWNrU3BlZWQ6IDEsXG4gIGF1dG9RdWFudGl6ZTogZmFsc2Vcbn1cbi8qXG50eXBlIHNvbmdTZXR0aW5ncyA9IHtcbiAgbmFtZTogc3RyaW5nLFxuICBwcHE6IG51bWJlcixcbiAgYnBtOiBudW1iZXIsXG4gIGJhcnM6IG51bWJlcixcbiAgbG93ZXN0Tm90ZTogbnVtYmVyLFxuICBoaWdoZXN0Tm90ZTogbnVtYmVyLFxuICBub21pbmF0b3I6IG51bWJlcixcbiAgZGVub21pbmF0b3I6IG51bWJlcixcbiAgcXVhbnRpemVWYWx1ZTogbnVtYmVyLFxuICBmaXhlZExlbmd0aFZhbHVlOiBudW1iZXIsXG4gIHBvc2l0aW9uVHlwZTogc3RyaW5nLFxuICB1c2VNZXRyb25vbWU6IGJvb2xlYW4sXG4gIGF1dG9TaXplOiBib29sZWFuLFxuICBsb29wOiBib29sZWFuLFxuICBwbGF5YmFja1NwZWVkOiBudW1iZXIsXG4gIGF1dG9RdWFudGl6ZTogYm9vbGVhblxufVxuKi9cblxuXG5leHBvcnQgY2xhc3MgU29uZ3tcblxuICBzdGF0aWMgZnJvbU1JRElGaWxlKGRhdGEpe1xuICAgIHJldHVybiBzb25nRnJvbU1JRElGaWxlKGRhdGEpXG4gIH1cblxuICBzdGF0aWMgZnJvbU1JRElGaWxlQXN5bmMoZGF0YSl7XG4gICAgcmV0dXJuIHNvbmdGcm9tTUlESUZpbGVBc3luYyhkYXRhKVxuICB9XG5cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3M6IHt9ID0ge30pe1xuXG4gICAgdGhpcy5pZCA9IGBTXyR7c29uZ0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YDtcblxuICAgICh7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUgPSB0aGlzLmlkLFxuICAgICAgcHBxOiB0aGlzLnBwcSA9IGRlZmF1bHRTb25nLnBwcSxcbiAgICAgIGJwbTogdGhpcy5icG0gPSBkZWZhdWx0U29uZy5icG0sXG4gICAgICBiYXJzOiB0aGlzLmJhcnMgPSBkZWZhdWx0U29uZy5iYXJzLFxuICAgICAgbm9taW5hdG9yOiB0aGlzLm5vbWluYXRvciA9IGRlZmF1bHRTb25nLm5vbWluYXRvcixcbiAgICAgIGRlbm9taW5hdG9yOiB0aGlzLmRlbm9taW5hdG9yID0gZGVmYXVsdFNvbmcuZGVub21pbmF0b3IsXG4gICAgICBxdWFudGl6ZVZhbHVlOiB0aGlzLnF1YW50aXplVmFsdWUgPSBkZWZhdWx0U29uZy5xdWFudGl6ZVZhbHVlLFxuICAgICAgZml4ZWRMZW5ndGhWYWx1ZTogdGhpcy5maXhlZExlbmd0aFZhbHVlID0gZGVmYXVsdFNvbmcuZml4ZWRMZW5ndGhWYWx1ZSxcbiAgICAgIHVzZU1ldHJvbm9tZTogdGhpcy51c2VNZXRyb25vbWUgPSBkZWZhdWx0U29uZy51c2VNZXRyb25vbWUsXG4gICAgICBhdXRvU2l6ZTogdGhpcy5hdXRvU2l6ZSA9IGRlZmF1bHRTb25nLmF1dG9TaXplLFxuICAgICAgbG9vcDogdGhpcy5sb29wID0gZGVmYXVsdFNvbmcubG9vcCxcbiAgICAgIHBsYXliYWNrU3BlZWQ6IHRoaXMucGxheWJhY2tTcGVlZCA9IGRlZmF1bHRTb25nLnBsYXliYWNrU3BlZWQsXG4gICAgICBhdXRvUXVhbnRpemU6IHRoaXMuYXV0b1F1YW50aXplID0gZGVmYXVsdFNvbmcuYXV0b1F1YW50aXplLFxuICAgIH0gPSBzZXR0aW5ncyk7XG5cbiAgICB0aGlzLl90aW1lRXZlbnRzID0gW1xuICAgICAgbmV3IE1JRElFdmVudCgwLCBxYW1iaS5URU1QTywgdGhpcy5icG0pLFxuICAgICAgbmV3IE1JRElFdmVudCgwLCBxYW1iaS5USU1FX1NJR05BVFVSRSwgdGhpcy5ub21pbmF0b3IsIHRoaXMuZGVub21pbmF0b3IpLFxuICAgIF1cblxuICAgIC8vdGhpcy5fdGltZUV2ZW50cyA9IFtdXG4gICAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IHRydWVcbiAgICB0aGlzLl9sYXN0RXZlbnQgPSBuZXcgTUlESUV2ZW50KDAsIHFhbWJpLkVORF9PRl9UUkFDSylcblxuICAgIHRoaXMuX3RyYWNrcyA9IFtdXG4gICAgdGhpcy5fdHJhY2tzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fZXZlbnRzID0gW11cbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9ub3RlcyA9IFtdXG4gICAgdGhpcy5fbm90ZXNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9uZXdFdmVudHMgPSBbXVxuICAgIHRoaXMuX21vdmVkRXZlbnRzID0gW11cbiAgICB0aGlzLl9yZW1vdmVkRXZlbnRzID0gW11cbiAgICB0aGlzLl90cmFuc3Bvc2VkRXZlbnRzID0gW11cblxuICAgIHRoaXMuX25ld1BhcnRzID0gW11cbiAgICB0aGlzLl9jaGFuZ2VkUGFydHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdXG5cbiAgICB0aGlzLl9zY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKHRoaXMpXG4gICAgdGhpcy5fcGxheWhlYWQgPSBuZXcgUGxheWhlYWQodGhpcylcbiAgICB0aGlzLl9taWxsaXMgPSAwXG5cbiAgICB0aGlzLl9wbGF5aW5nID0gZmFsc2VcbiAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZVxuXG4gICAgdGhpcy52b2x1bWUgPSAwLjVcbiAgICB0aGlzLl9vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMuX291dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLl9vdXRwdXQuY29ubmVjdChtYXN0ZXJHYWluKVxuICB9XG5cblxuICBhZGRUaW1lRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgLy9AVE9ETzogZmlsdGVyIHRpbWUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2sgLT4gdXNlIHRoZSBsYXN0bHkgYWRkZWQgZXZlbnRzXG4gICAgdGhpcy5fdGltZUV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICB9XG5cbiAgYWRkVHJhY2tzKC4uLnRyYWNrcyl7XG4gICAgdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICB0cmFjay5fc29uZyA9IHRoaXNcbiAgICAgIHRyYWNrLmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgICAgdGhpcy5fdHJhY2tzLnB1c2godHJhY2spXG4gICAgICB0aGlzLl90cmFja3NCeUlkLnNldCh0cmFjay5pZCwgdHJhY2spXG4gICAgICB0aGlzLl9uZXdFdmVudHMucHVzaCguLi50cmFjay5fZXZlbnRzKVxuICAgICAgdGhpcy5fbmV3UGFydHMucHVzaCguLi50cmFjay5fcGFydHMpXG4gICAgfSlcbiAgfVxuXG4gIC8vIHByZXBhcmUgc29uZyBldmVudHMgZm9yIHBsYXliYWNrXG4gIHVwZGF0ZSgpOiB2b2lke1xuXG4gICAgbGV0IGNyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuXG4gICAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gZmFsc2VcbiAgICAgICYmIHRoaXMuX3JlbW92ZWRFdmVudHMubGVuZ3RoID09PSAwXG4gICAgICAmJiB0aGlzLl9uZXdFdmVudHMubGVuZ3RoID09PSAwXG4gICAgICAmJiB0aGlzLl9tb3ZlZEV2ZW50cy5sZW5ndGggPT09IDBcbiAgICApe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vZGVidWdcbiAgICAvL3RoaXMuaXNQbGF5aW5nID0gdHJ1ZVxuXG4gICAgY29uc29sZS5ncm91cCgndXBkYXRlIHNvbmcnKVxuICAgIGNvbnNvbGUudGltZSgndG90YWwnKVxuXG4gICAgLy8gY2hlY2sgaWYgdGltZSBldmVudHMgYXJlIHVwZGF0ZWRcbiAgICBpZih0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSB0cnVlKXtcbiAgICAgIC8vY29uc29sZS5sb2coJ3VwZGF0ZVRpbWVFdmVudHMnLCB0aGlzLl90aW1lRXZlbnRzLmxlbmd0aClcbiAgICAgIHBhcnNlVGltZUV2ZW50cyh0aGlzLCB0aGlzLl90aW1lRXZlbnRzLCB0aGlzLmlzUGxheWluZylcbiAgICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSBmYWxzZVxuICAgICAgY29uc29sZS5sb2coJ3RpbWUgZXZlbnRzICVPJywgdGhpcy5fdGltZUV2ZW50cylcbiAgICB9XG5cbiAgICAvLyBvbmx5IHBhcnNlIG5ldyBhbmQgbW92ZWQgZXZlbnRzXG4gICAgbGV0IHRvYmVQYXJzZWQgPSBbXVxuXG5cbiAgICAvLyBmaWx0ZXIgcmVtb3ZlZCBwYXJ0c1xuICAgIGNvbnNvbGUubG9nKCdyZW1vdmVkIHBhcnRzICVPJywgdGhpcy5fcmVtb3ZlZFBhcnRzKVxuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICB0aGlzLnBhcnRzQnlJZC5kZWxldGUocGFydC5pZClcbiAgICAgIHRoaXMuX3JlbW92ZWRFdmVudHMucHVzaCguLi5wYXJ0Ll9ldmVudHMpXG4gICAgfSlcblxuXG4gICAgLy8gYWRkIG5ldyBwYXJ0c1xuICAgIGNvbnNvbGUubG9nKCduZXcgcGFydHMgJU8nLCB0aGlzLl9uZXdQYXJ0cylcbiAgICB0aGlzLl9uZXdQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0Ll9zb25nID0gdGhpc1xuICAgICAgdGhpcy5fcGFydHNCeUlkLnNldChwYXJ0LmlkLCBwYXJ0KVxuICAgICAgdG9iZVBhcnNlZC5wdXNoKC4uLnBhcnQuX2V2ZW50cylcbiAgICAgIHBhcnQudXBkYXRlKClcbiAgICB9KVxuXG5cbiAgICAvLyB1cGRhdGUgY2hhbmdlZCBwYXJ0c1xuICAgIGNvbnNvbGUubG9nKCdjaGFuZ2VkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKVxuICAgIHRoaXMuX2NoYW5nZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnVwZGF0ZSgpXG4gICAgfSlcblxuXG4gICAgLy8gZmlsdGVyIHJlbW92ZWQgZXZlbnRzXG4gICAgY29uc29sZS5sb2coJ3JlbW92ZWQgZXZlbnRzICVPJywgdGhpcy5fcmVtb3ZlZEV2ZW50cylcbiAgICB0aGlzLl9yZW1vdmVkRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLl9ub3Rlc0J5SWQuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlLmlkKVxuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgfSlcblxuICAgIGNyZWF0ZUV2ZW50QXJyYXkgPSB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA+IDBcblxuICAgIC8vIGFkZCBuZXcgZXZlbnRzXG4gICAgY29uc29sZS5sb2coJ25ldyBldmVudHMgJU8nLCB0aGlzLl9uZXdFdmVudHMpXG4gICAgdGhpcy5fbmV3RXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB0aGlzLl9ldmVudHMucHVzaChldmVudClcbiAgICAgIHRvYmVQYXJzZWQucHVzaChldmVudClcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuaWQpXG4gICAgfSlcblxuXG4gICAgLy8gbW92ZWQgZXZlbnRzIG5lZWQgdG8gYmUgcGFyc2VkXG4gICAgY29uc29sZS5sb2coJ21vdmVkICVPJywgdGhpcy5fbW92ZWRFdmVudHMpXG4gICAgdGhpcy5fbW92ZWRFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIHRvYmVQYXJzZWQucHVzaChldmVudClcbiAgICB9KVxuXG4gICAgLy90b2JlUGFyc2VkID0gWy4uLnRvYmVQYXJzZWQsIC4uLkFycmF5LmZyb20oc29uZy5tb3ZlZEV2ZW50cy52YWx1ZXMoKSldXG5cbiAgICBjb25zb2xlLnRpbWUoJ3BhcnNlJylcbiAgICBpZih0b2JlUGFyc2VkLmxlbmd0aCA+IDApe1xuICAgICAgLy9jb25zb2xlLmxvZygndG9iZVBhcnNlZCAlTycsIHRvYmVQYXJzZWQpXG4gICAgICB0b2JlUGFyc2VkID0gWy4uLnRvYmVQYXJzZWQsIC4uLnRoaXMuX3RpbWVFdmVudHNdXG4gICAgICBjb25zb2xlLmxvZygncGFyc2VFdmVudHMnLCB0b2JlUGFyc2VkLmxlbmd0aCAtIHRoaXMuX3RpbWVFdmVudHMubGVuZ3RoKVxuICAgICAgcGFyc2VFdmVudHModG9iZVBhcnNlZCwgdGhpcy5pc1BsYXlpbmcpXG4gICAgICB0b2JlUGFyc2VkLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmlkLCBldmVudC50eXBlKVxuICAgICAgICBpZihldmVudC50eXBlID09PSBxYW1iaS5OT1RFX09OKXtcbiAgICAgICAgICBpZihldmVudC5taWRpTm90ZSl7XG4gICAgICAgICAgICB0aGlzLl9ub3Rlc0J5SWQuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkLCBldmVudC50eXBlKVxuICAgICAgICAgICAgLy90aGlzLl9ub3Rlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRoaXMuX25vdGVzID0gQXJyYXkuZnJvbSh0aGlzLl9ub3Rlc0J5SWQudmFsdWVzKCkpXG4gICAgfVxuICAgIGNvbnNvbGUudGltZUVuZCgncGFyc2UnKVxuXG4gICAgaWYoY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICBjb25zb2xlLnRpbWUoJ3RvIGFycmF5JylcbiAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSlcbiAgICAgIHRoaXMuX25vdGVzID0gQXJyYXkuZnJvbSh0aGlzLl9ub3Rlc0J5SWQudmFsdWVzKCkpXG4gICAgICBjb25zb2xlLnRpbWVFbmQoJ3RvIGFycmF5JylcbiAgICB9XG5cbiAgICBjb25zb2xlLnRpbWUoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuICAgIHNvcnRFdmVudHModGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX25vdGVzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gYS5ub3RlT24udGlja3MgLSBiLm5vdGVPbi50aWNrc1xuICAgIH0pXG4gICAgY29uc29sZS50aW1lRW5kKGBzb3J0aW5nICR7dGhpcy5fZXZlbnRzLmxlbmd0aH0gZXZlbnRzYClcblxuICAgIGNvbnNvbGUubG9nKCdub3RlcyAlTycsIHRoaXMuX25vdGVzKVxuXG4gICAgY29uc29sZS50aW1lRW5kKCd0b3RhbCcpXG4gICAgY29uc29sZS5ncm91cEVuZCgndXBkYXRlIHNvbmcnKVxuICAgIGNvbnNvbGUudGltZUVuZCgndXBkYXRlIHNvbmcnKVxuXG4gICAgbGV0IGxhc3RFdmVudCA9IHRoaXMuX2V2ZW50c1t0aGlzLl9ldmVudHMubGVuZ3RoIC0gMV1cbiAgICBsZXQgbGFzdFRpbWVFdmVudCA9IHRoaXMuX3RpbWVFdmVudHNbdGhpcy5fdGltZUV2ZW50cy5sZW5ndGggLSAxXVxuICAgIGlmKGxhc3RUaW1lRXZlbnQudGlja3MgPiBsYXN0VGltZUV2ZW50LnRpY2tzKXtcbiAgICAgIGxhc3RUaW1lRXZlbnQgPSBsYXN0VGltZUV2ZW50XG4gICAgfVxuICAgICh7XG4gICAgICBiYXI6IHRoaXMuX2xhc3RFdmVudC5iYXIsXG4gICAgICBiZWF0OiB0aGlzLl9sYXN0RXZlbnQuYmVhdCxcbiAgICAgIHNpeHRlZW50aDogdGhpcy5fbGFzdEV2ZW50LnNpeHRlZW50aCxcbiAgICAgIHRpY2s6IHRoaXMuX2xhc3RFdmVudC50aWNrLFxuICAgICAgdGlja3M6IHRoaXMuX2xhc3RFdmVudC50aWNrcyxcbiAgICAgIG1pbGxpczogdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcyxcbiAgICB9ID0gbGFzdEV2ZW50KVxuICAgIC8vY29uc29sZS5sb2coJ2xhc3QgdGljaycsIGxhc3RUaWNrcylcbiAgICB0aGlzLl9kdXJhdGlvblRpY2tzID0gdGhpcy5fbGFzdEV2ZW50LnRpY2tzXG4gICAgdGhpcy5fZHVyYXRpb25NaWxsaXMgPSB0aGlzLl9sYXN0RXZlbnQubWlsbGlzXG4gICAgdGhpcy5iYXJzID0gdGhpcy5fbGFzdEV2ZW50LmJhciArIDFcbiAgICB0aGlzLl9wbGF5aGVhZC51cGRhdGVTb25nKClcbiAgfVxuXG4gIHBsYXkodHlwZSwgLi4uYXJncyk6IHZvaWR7XG4gICAgdGhpcy5fcGxheSh0eXBlLCAuLi5hcmdzKVxuICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fbWlsbGlzfSlcbiAgfVxuXG4gIF9wbGF5KHR5cGUsIC4uLmFyZ3Mpe1xuICAgIGlmKHR5cGVvZiB0eXBlICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnNldFBvc2l0aW9uKHR5cGUsIC4uLmFyZ3MpXG4gICAgfVxuICAgIGlmKHRoaXMuX3BsYXlpbmcpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fdGltZVN0YW1wID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDBcbiAgICB0aGlzLl9zY2hlZHVsZXIuc2V0VGltZVN0YW1wKHRoaXMuX3RpbWVTdGFtcClcblxuICAgIGlmKHRoaXMuX3BhdXNlZCl7XG4gICAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuX3BsYXlpbmcgPSB0cnVlXG4gICAgdGhpcy5fc2NoZWR1bGVyLmluaXQodGhpcy5fbWlsbGlzKVxuICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fbWlsbGlzKVxuICAgIHRoaXMuX3B1bHNlKClcbiAgfVxuXG5cbiAgcGF1c2UoKTogdm9pZHtcbiAgICB0aGlzLl9wYXVzZWQgPSAhdGhpcy5fcGF1c2VkXG4gICAgaWYodGhpcy5fcGF1c2VkKXtcbiAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5fc2NoZWR1bGVyLmFsbE5vdGVzT2ZmKClcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwYXVzZScsIGRhdGE6IHRoaXMuX3BhdXNlZH0pXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnBsYXkoKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BhdXNlJywgZGF0YTogdGhpcy5fcGF1c2VkfSlcbiAgICB9XG4gIH1cblxuICBzdG9wKCk6IHZvaWR7XG4gICAgdGhpcy5fc2NoZWR1bGVyLmFsbE5vdGVzT2ZmKClcbiAgICBpZih0aGlzLl9wbGF5aW5nIHx8IHRoaXMuX3BhdXNlZCl7XG4gICAgICB0aGlzLl9wbGF5aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlXG4gICAgfVxuICAgIGlmKHRoaXMuX21pbGxpcyAhPT0gMCl7XG4gICAgICB0aGlzLl9taWxsaXMgPSAwXG4gICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX21pbGxpcylcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdG9wJ30pXG4gICAgfVxuICB9XG5cbiAgYWxsTm90ZXNPZmYoKXtcbiAgICB0aGlzLl9zY2hlZHVsZXIuYWxsTm90ZXNPZmYoKVxuICB9XG5cbiAgZ2V0VHJhY2tzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl90cmFja3NdXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuICBnZXRFdmVudHMoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c11cbiAgfVxuXG4gIGdldE5vdGVzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ub3Rlc11cbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKGFyZ3Mpe1xuICAgIHJldHVybiBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCBhcmdzKVxuICB9XG5cbiAgLypcbiAgICBwb3NpdGlvbjpcbiAgICAgIC0gJ3RpY2tzJywgOTYwMDBcbiAgICAgIC0gJ21pbGxpcycsIDEyMzRcbiAgICAgIC0gJ3BlcmNlbnRhZ2UnLCA1NVxuICAgICAgLSAnYmFyc2JlYXRzJywgMSwgNCwgMCwgMjUgLT4gYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tcbiAgICAgIC0gJ3RpbWUnLCAwLCAzLCA0OSwgNTY2IC0+IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcbiAgKi9cbiAgc2V0UG9zaXRpb24odHlwZSwgLi4uYXJncyl7XG5cbiAgICBsZXQgd2FzUGxheWluZyA9IHRoaXMuX3BsYXlpbmdcbiAgICBpZih0aGlzLl9wbGF5aW5nKXtcbiAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5fc2NoZWR1bGVyLmFsbE5vdGVzT2ZmKClcbiAgICB9XG5cbiAgICBsZXQgdGFyZ2V0XG4gICAgbGV0IHBvc2l0aW9uXG5cbiAgICBzd2l0Y2godHlwZSl7XG4gICAgICBjYXNlICd0aWNrcyc6XG4gICAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgY2FzZSAncGVyY2VudGFnZSc6XG4gICAgICAgIHRhcmdldCA9IGFyZ3NbMF0gfHwgMFxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICd0aW1lJzpcbiAgICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgICB0YXJnZXQgPSBhcmdzXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnNvbGUubG9nKCd1bnN1cHBvcnRlZCB0eXBlJylcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gbWlsbGlzID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcywge1xuICAgIC8vICAgdHlwZSxcbiAgICAvLyAgIHRhcmdldCxcbiAgICAvLyAgIHJlc3VsdDogJ21pbGxpcydcbiAgICAvLyB9KS5taWxsaXNcblxuICAgIHBvc2l0aW9uID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcywge1xuICAgICAgdHlwZSxcbiAgICAgIHRhcmdldCxcbiAgICAgIHJlc3VsdDogJ2FsbCdcbiAgICB9KVxuXG4gICAgdGhpcy5fbWlsbGlzID0gcG9zaXRpb24ubWlsbGlzXG5cbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICBkYXRhOiBwb3NpdGlvblxuICAgIH0pXG5cbiAgICBpZih3YXNQbGF5aW5nKXtcbiAgICAgIHRoaXMuX3BsYXkoKVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCdzZXRQb3NpdGlvbicsIHRoaXMuX21pbGxpcylcbiAgfVxuXG4gIGdldFBvc2l0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXloZWFkLmdldCgpLnBvc2l0aW9uXG4gIH1cblxuICBnZXRQbGF5aGVhZCgpe1xuICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKVxuICB9XG5cbiAgX3B1bHNlKCk6IHZvaWR7XG4gICAgaWYodGhpcy5fcGxheWluZyA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBub3cgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuICAgIGxldCBkaWZmID0gbm93IC0gdGhpcy5fdGltZVN0YW1wXG4gICAgdGhpcy5fbWlsbGlzICs9IGRpZmZcbiAgICB0aGlzLl90aW1lU3RhbXAgPSBub3dcbiAgICAvL2NvbnNvbGUubG9nKGRpZmYsIHRoaXMubWlsbGlzKVxuXG4gICAgdGhpcy5fcGxheWhlYWQudXBkYXRlKCdtaWxsaXMnLCBkaWZmKVxuXG4gICAgaWYodGhpcy5fbWlsbGlzID49IHRoaXMuX2R1cmF0aW9uTWlsbGlzKXtcbiAgICAgIHRoaXMuc3RvcCgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKHRoaXMuX21pbGxpcylcblxuICAgIC8vY29uc29sZS5sb2coJ3B1bHNlJywgZGlmZilcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcHVsc2UuYmluZCh0aGlzKSlcbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spe1xuICAgIHJldHVybiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZClcbiAgfVxufVxuIiwiXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCB7cGFyc2VNSURJRmlsZX0gZnJvbSAnLi9taWRpZmlsZSdcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7VHJhY2t9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge1Nvbmd9IGZyb20gJy4vc29uZydcbmltcG9ydCB7YmFzZTY0VG9CaW5hcnl9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7c3RhdHVzLCBqc29uLCBhcnJheUJ1ZmZlcn0gZnJvbSAnLi9mZXRjaF9oZWxwZXJzJ1xuXG5jb25zdCBQUFEgPSA5NjBcblxuXG5mdW5jdGlvbiB0b1NvbmcocGFyc2VkKXtcbiAgbGV0IHRyYWNrcyA9IHBhcnNlZC50cmFja3NcbiAgbGV0IHBwcSA9IHBhcnNlZC5oZWFkZXIudGlja3NQZXJCZWF0XG4gIGxldCBwcHFGYWN0b3IgPSBQUFEgLyBwcHEgLy9AVE9ETzogZ2V0IHBwcSBmcm9tIGNvbmZpZyAtPiBvbmx5IG5lY2Vzc2FyeSBpZiB5b3Ugd2FudCB0byBjaGFuZ2UgdGhlIHBwcSBvZiB0aGUgTUlESSBmaWxlICFcbiAgbGV0IHRpbWVFdmVudHMgPSBbXVxuICBsZXQgYnBtID0gLTFcbiAgbGV0IG5vbWluYXRvciA9IC0xXG4gIGxldCBkZW5vbWluYXRvciA9IC0xXG4gIGxldCBuZXdUcmFja3MgPSBbXVxuXG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzLnZhbHVlcygpKXtcbiAgICBsZXQgbGFzdFRpY2tzLCBsYXN0VHlwZVxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgdHlwZVxuICAgIGxldCBjaGFubmVsID0gLTFcbiAgICBsZXQgdHJhY2tOYW1lXG4gICAgbGV0IHRyYWNrSW5zdHJ1bWVudE5hbWVcbiAgICBsZXQgZXZlbnRzID0gW107XG5cbiAgICBmb3IobGV0IGV2ZW50IG9mIHRyYWNrKXtcbiAgICAgIHRpY2tzICs9IChldmVudC5kZWx0YVRpbWUgKiBwcHFGYWN0b3IpO1xuXG4gICAgICBpZihjaGFubmVsID09PSAtMSAmJiB0eXBlb2YgZXZlbnQuY2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBjaGFubmVsID0gZXZlbnQuY2hhbm5lbDtcbiAgICAgIH1cbiAgICAgIHR5cGUgPSBldmVudC5zdWJ0eXBlO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5kZWx0YVRpbWUsIHRpY2tzLCB0eXBlKTtcblxuICAgICAgc3dpdGNoKGV2ZW50LnN1YnR5cGUpe1xuXG4gICAgICAgIGNhc2UgJ3RyYWNrTmFtZSc6XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdpbnN0cnVtZW50TmFtZSc6XG4gICAgICAgICAgaWYoZXZlbnQudGV4dCl7XG4gICAgICAgICAgICB0cmFja0luc3RydW1lbnROYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9uJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweDkwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9mZic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg4MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3NldFRlbXBvJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0ZW1wbyBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgbGV0IHRtcCA9IDYwMDAwMDAwIC8gZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdDtcblxuICAgICAgICAgIGlmKHRpY2tzID09PSBsYXN0VGlja3MgJiYgdHlwZSA9PT0gbGFzdFR5cGUpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oJ3RlbXBvIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIHRtcCk7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGJwbSA9PT0gLTEpe1xuICAgICAgICAgICAgYnBtID0gdG1wO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg1MSwgdG1wKSlcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0aW1lU2lnbmF0dXJlJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0aW1lIHNpZ25hdHVyZSBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgaWYobGFzdFRpY2tzID09PSB0aWNrcyAmJiBsYXN0VHlwZSA9PT0gdHlwZSl7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ3RpbWUgc2lnbmF0dXJlIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihub21pbmF0b3IgPT09IC0xKXtcbiAgICAgICAgICAgIG5vbWluYXRvciA9IGV2ZW50Lm51bWVyYXRvclxuICAgICAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvclxuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg1OCwgZXZlbnQubnVtZXJhdG9yLCBldmVudC5kZW5vbWluYXRvcikpXG4gICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlICdjb250cm9sbGVyJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEIwLCBldmVudC5jb250cm9sbGVyVHlwZSwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwcm9ncmFtQ2hhbmdlJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEMwLCBldmVudC5wcm9ncmFtTnVtYmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncGl0Y2hCZW5kJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEUwLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCBldmVudC50eXBlKTtcbiAgICAgIH1cblxuICAgICAgbGFzdFR5cGUgPSB0eXBlXG4gICAgICBsYXN0VGlja3MgPSB0aWNrc1xuICAgIH1cblxuICAgIGlmKGV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAgIC8vY29uc29sZS5jb3VudChldmVudHMubGVuZ3RoKVxuICAgICAgbGV0IG5ld1RyYWNrID0gbmV3IFRyYWNrKHRyYWNrTmFtZSlcbiAgICAgIGxldCBwYXJ0ID0gbmV3IFBhcnQoKVxuICAgICAgbmV3VHJhY2suYWRkUGFydHMocGFydClcbiAgICAgIHBhcnQuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICAgIG5ld1RyYWNrcy5wdXNoKG5ld1RyYWNrKVxuICAgIH1cbiAgfVxuXG4gIGxldCBzb25nID0gbmV3IFNvbmcoe1xuICAgIHBwcTogUFBRLFxuICAgIHBsYXliYWNrU3BlZWQ6IDEsXG4gICAgLy9wcHEsXG4gICAgYnBtLFxuICAgIG5vbWluYXRvcixcbiAgICBkZW5vbWluYXRvclxuICB9KVxuICBzb25nLmFkZFRyYWNrcyguLi5uZXdUcmFja3MpXG4gIHNvbmcuYWRkVGltZUV2ZW50cyguLi50aW1lRXZlbnRzKVxuICBzb25nLnVwZGF0ZSgpXG4gIHJldHVybiBzb25nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlKGRhdGEsIHNldHRpbmdzID0ge30pe1xuICBsZXQgc29uZyA9IG51bGw7XG5cbiAgaWYoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKXtcbiAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgc29uZyA9IHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICB9ZWxzZSBpZih0eXBlb2YgZGF0YS5oZWFkZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkYXRhLnRyYWNrcyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHNvbmcgPSB0b1NvbmcoZGF0YSk7XG4gIH1lbHNle1xuICAgIGRhdGEgPSBiYXNlNjRUb0JpbmFyeShkYXRhKTtcbiAgICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgc29uZyA9IHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcignd3JvbmcgZGF0YScpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzb25nXG4gIC8vIHtcbiAgLy8gICBwcHEgPSBuZXdQUFEsXG4gIC8vICAgYnBtID0gbmV3QlBNLFxuICAvLyAgIHBsYXliYWNrU3BlZWQgPSBuZXdQbGF5YmFja1NwZWVkLFxuICAvLyB9ID0gc2V0dGluZ3Ncbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZUFzeW5jKHVybCl7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihhcnJheUJ1ZmZlcilcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJlc29sdmUoc29uZ0Zyb21NSURJRmlsZShkYXRhKSlcbiAgICB9KVxuICAgIC5jYXRjaChlID0+IHtcbiAgICAgIHJlamVjdChlKVxuICAgIH0pXG4gIH0pXG59XG4iLCJpbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge0luc3RydW1lbnR9IGZyb20gJy4vaW5zdHJ1bWVudCdcblxuXG5sZXQgdHJhY2tJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFRyYWNre1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IG51bGwpe1xuICAgIHRoaXMuaWQgPSBgVFJfJHt0cmFja0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgdGhpcy5pZFxuICAgIHRoaXMuY2hhbm5lbCA9IDBcbiAgICB0aGlzLm11dGVkID0gZmFsc2VcbiAgICB0aGlzLnZvbHVtZSA9IDAuNVxuICAgIHRoaXMuX291dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5fb3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuX21pZGlPdXRwdXRJZHMgPSBbXVxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG4gICAgdGhpcy5fcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB0aGlzLnNldEluc3RydW1lbnQobmV3IEluc3RydW1lbnQoKSlcbiAgfVxuXG4gIHNldEluc3RydW1lbnQoaW5zdHJ1bWVudCl7XG4gICAgdGhpcy5faW5zdHJ1bWVudCA9IGluc3RydW1lbnRcbiAgICBpbnN0cnVtZW50LmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICB9XG5cbiAgY29ubmVjdChvdXRwdXQpe1xuICAgIHRoaXMuX291dHB1dC5jb25uZWN0KG91dHB1dClcbiAgfVxuXG4gIHNldE1JRElPdXRwdXRzKC4uLm91dHB1dElkcyl7XG4gICAgLy9jb25zb2xlLmxvZyhvdXRwdXRJZHMpXG4gICAgdGhpcy5fbWlkaU91dHB1dElkcy5wdXNoKC4uLm91dHB1dElkcylcbiAgfVxuXG4gIHJlbW92ZU1JRElPdXRwdXRzKC4uLm91dHB1dHMpe1xuICAgIC8vdGhpcy5fbWlkaU91dHB1dHMgPSB0aGlzLl9taWRpT3V0cHV0cy5maWx0ZXIoLi4ub3V0cHV0cylcbiAgfVxuXG4gIGNvcHkoKXtcbiAgICBsZXQgdCA9IG5ldyBUcmFjayh0aGlzLm5hbWUgKyAnX2NvcHknKSAvLyBpbXBsZW1lbnQgZ2V0TmFtZU9mQ29weSgpIGluIHV0aWwgKHNlZSBoZWFydGJlYXQpXG4gICAgbGV0IHBhcnRzID0gW11cbiAgICB0aGlzLl9wYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgbGV0IGNvcHkgPSBwYXJ0LmNvcHkoKVxuICAgICAgY29uc29sZS5sb2coY29weSlcbiAgICAgIHBhcnRzLnB1c2goY29weSlcbiAgICB9KVxuICAgIHQuYWRkUGFydHMoLi4ucGFydHMpXG4gICAgdC51cGRhdGUoKVxuICAgIHJldHVybiB0XG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICB9XG5cbiAgYWRkUGFydHMoLi4ucGFydHMpe1xuICAgIGxldCBzb25nID0gdGhpcy5fc29uZ1xuICAgIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIHBhcnQuX3RyYWNrID0gdGhpc1xuICAgICAgdGhpcy5fcGFydHNCeUlkLnNldChwYXJ0LmlkLCBwYXJ0KVxuICAgICAgdGhpcy5fcGFydHMucHVzaChwYXJ0KVxuICAgICAgaWYoc29uZyl7XG4gICAgICAgIHBhcnQuX3NvbmcgPSBzb25nXG4gICAgICAgIHNvbmcuX25ld1BhcnRzLnB1c2gocGFydClcbiAgICAgIH1cblxuICAgICAgbGV0IGV2ZW50cyA9IHBhcnQuX2V2ZW50c1xuICAgICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IHRoaXNcbiAgICAgICAgaWYoc29uZyl7XG4gICAgICAgICAgZXZlbnQuX3NvbmcgPSBzb25nXG4gICAgICAgICAgLy9zb25nLl9uZXdFdmVudHMucHVzaChldmVudClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB9KVxuICAgICAgdGhpcy5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICByZW1vdmVQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG5cbiAgICBwYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0Ll90cmFjayA9IG51bGxcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCwgcGFydClcbiAgICAgIGlmKHNvbmcpe1xuICAgICAgICBzb25nLl9kZWxldGVkUGFydHMucHVzaChwYXJ0KVxuICAgICAgfVxuXG4gICAgICBsZXQgZXZlbnRzID0gcGFydC5fZXZlbnRzXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudCl7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgICAgaWYoc29uZyl7XG4gICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICAgICAgLy9zb25nLl9kZWxldGVkRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQsIGV2ZW50KVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuXG4gIHRyYW5zcG9zZVBhcnRzKGFtb3VudDogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICB9XG5cbiAgbW92ZVBhcnRzKHRpY2tzOiBudW1iZXIsIC4uLnBhcnRzKXtcbiAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgcGFydC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gIH1cblxuICBtb3ZlUGFydHNUbyh0aWNrczogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gIH1cblxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0KClcbiAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgdGhpcy5hZGRQYXJ0cyhwKVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBwYXJ0cy5zZXQoZXZlbnQuX3BhcnQpXG4gICAgICBldmVudC5fcGFydCA9IG51bGxcbiAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgIGV2ZW50Ll9zb25nID0gbnVsbFxuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gIH1cblxuICBtb3ZlRXZlbnRzKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlKHRpY2tzKVxuICAgICAgcGFydHMuc2V0KGV2ZW50LnBhcnQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgfVxuXG4gIG1vdmVFdmVudHNUbyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGxldCBwYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgICAgcGFydHMuc2V0KGV2ZW50LnBhcnQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgfVxuXG4gIGdldEV2ZW50cyhmaWx0ZXI6IHN0cmluZ1tdID0gbnVsbCl7IC8vIGNhbiBiZSB1c2UgYXMgZmluZEV2ZW50c1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ldmVudHNdIC8vQFRPRE8gaW1wbGVtZW50IGZpbHRlciAtPiBmaWx0ZXJFdmVudHMoKSBzaG91bGQgYmUgYSB1dGlsaXR5IGZ1bmN0aW9uIChub3QgYSBjbGFzcyBtZXRob2QpXG4gIH1cblxuICBtdXRlKGZsYWc6IGJvb2xlYW4gPSBudWxsKXtcbiAgICBpZihmbGFnKXtcbiAgICAgIHRoaXMuX211dGVkID0gZmxhZ1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5fbXV0ZWQgPSAhdGhpcy5fbXV0ZWRcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKXsgLy8geW91IHNob3VsZCBvbmx5IHVzZSB0aGlzIGluIGh1Z2Ugc29uZ3MgKD4xMDAgdHJhY2tzKVxuICAgIGlmKHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkpe1xuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgfVxuICAgIHNvcnRFdmVudHModGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgfVxufVxuXG4iLCJpbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcblxuY29uc3RcbiAgbVBJID0gTWF0aC5QSSxcbiAgbVBvdyA9IE1hdGgucG93LFxuICBtUm91bmQgPSBNYXRoLnJvdW5kLFxuICBtRmxvb3IgPSBNYXRoLmZsb29yLFxuICBtUmFuZG9tID0gTWF0aC5yYW5kb21cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmljZVRpbWUobWlsbGlzKXtcbiAgbGV0IGgsIG0sIHMsIG1zLFxuICAgIHNlY29uZHMsXG4gICAgdGltZUFzU3RyaW5nID0gJyc7XG5cbiAgc2Vjb25kcyA9IG1pbGxpcyAvIDEwMDA7IC8vIOKGkiBtaWxsaXMgdG8gc2Vjb25kc1xuICBoID0gbUZsb29yKHNlY29uZHMgLyAoNjAgKiA2MCkpO1xuICBtID0gbUZsb29yKChzZWNvbmRzICUgKDYwICogNjApKSAvIDYwKTtcbiAgcyA9IG1GbG9vcihzZWNvbmRzICUgKDYwKSk7XG4gIG1zID0gbVJvdW5kKChzZWNvbmRzIC0gKGggKiAzNjAwKSAtIChtICogNjApIC0gcykgKiAxMDAwKTtcblxuICB0aW1lQXNTdHJpbmcgKz0gaCArICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG0gPCAxMCA/ICcwJyArIG0gOiBtO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gcyA8IDEwID8gJzAnICsgcyA6IHM7XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtcyA9PT0gMCA/ICcwMDAnIDogbXMgPCAxMCA/ICcwMCcgKyBtcyA6IG1zIDwgMTAwID8gJzAnICsgbXMgOiBtcztcblxuICAvL2NvbnNvbGUubG9nKGgsIG0sIHMsIG1zKTtcbiAgcmV0dXJuIHtcbiAgICBob3VyOiBoLFxuICAgIG1pbnV0ZTogbSxcbiAgICBzZWNvbmQ6IHMsXG4gICAgbWlsbGlzZWNvbmQ6IG1zLFxuICAgIHRpbWVBc1N0cmluZzogdGltZUFzU3RyaW5nLFxuICAgIHRpbWVBc0FycmF5OiBbaCwgbSwgcywgbXNdXG4gIH07XG59XG5cblxuLy8gYWRhcHRlZCB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9kYW5ndWVyL2Jsb2ctZXhhbXBsZXMvYmxvYi9tYXN0ZXIvanMvYmFzZTY0LWJpbmFyeS5qc1xuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvQmluYXJ5KGlucHV0KXtcbiAgbGV0IGtleVN0ciA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPScsXG4gICAgYnl0ZXMsIHVhcnJheSwgYnVmZmVyLFxuICAgIGxrZXkxLCBsa2V5MixcbiAgICBjaHIxLCBjaHIyLCBjaHIzLFxuICAgIGVuYzEsIGVuYzIsIGVuYzMsIGVuYzQsXG4gICAgaSwgaiA9IDA7XG5cbiAgYnl0ZXMgPSBNYXRoLmNlaWwoKDMgKiBpbnB1dC5sZW5ndGgpIC8gNC4wKTtcbiAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVzKTtcbiAgdWFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuICBsa2V5MSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGggLSAxKSk7XG4gIGxrZXkyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aCAtIDEpKTtcbiAgaWYobGtleTEgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuICBpZihsa2V5MiA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG5cbiAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgJycpO1xuXG4gIGZvcihpID0gMDsgaSA8IGJ5dGVzOyBpICs9IDMpIHtcbiAgICAvL2dldCB0aGUgMyBvY3RlY3RzIGluIDQgYXNjaWkgY2hhcnNcbiAgICBlbmMxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMyA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmM0ID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuXG4gICAgY2hyMSA9IChlbmMxIDw8IDIpIHwgKGVuYzIgPj4gNCk7XG4gICAgY2hyMiA9ICgoZW5jMiAmIDE1KSA8PCA0KSB8IChlbmMzID4+IDIpO1xuICAgIGNocjMgPSAoKGVuYzMgJiAzKSA8PCA2KSB8IGVuYzQ7XG5cbiAgICB1YXJyYXlbaV0gPSBjaHIxO1xuICAgIGlmKGVuYzMgIT0gNjQpIHVhcnJheVtpKzFdID0gY2hyMjtcbiAgICBpZihlbmM0ICE9IDY0KSB1YXJyYXlbaSsyXSA9IGNocjM7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhidWZmZXIpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0eXBlU3RyaW5nKG8pe1xuICBpZih0eXBlb2YgbyAhPSAnb2JqZWN0Jyl7XG4gICAgcmV0dXJuIHR5cGVvZiBvO1xuICB9XG5cbiAgaWYobyA9PT0gbnVsbCl7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuXG4gIC8vb2JqZWN0LCBhcnJheSwgZnVuY3Rpb24sIGRhdGUsIHJlZ2V4cCwgc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIGVycm9yXG4gIGxldCBpbnRlcm5hbENsYXNzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9cXFtvYmplY3RcXHMoXFx3KylcXF0vKVsxXTtcbiAgcmV0dXJuIGludGVybmFsQ2xhc3MudG9Mb3dlckNhc2UoKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc29ydEV2ZW50cyhldmVudHMpe1xuICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICBpZihhLnRpY2tzID09PSBiLnRpY2tzKXtcbiAgICAgIGxldCByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgaWYoYS50eXBlID09PSAxNzYgJiYgYi50eXBlID09PSAxNDQpe1xuICAgICAgICByID0gLTFcbiAgICAgIH1cbiAgICAgIHJldHVybiByXG4gICAgfVxuICAgIHJldHVybiBhLnRpY2tzIC0gYi50aWNrc1xuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJZkJhc2U2NChkYXRhKXtcbiAgbGV0IHBhc3NlZCA9IHRydWU7XG4gIHRyeXtcbiAgICBhdG9iKGRhdGEpO1xuICB9Y2F0Y2goZSl7XG4gICAgcGFzc2VkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBhc3NlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVxdWFsUG93ZXJDdXJ2ZShudW1TdGVwcywgdHlwZSwgbWF4VmFsdWUpIHtcbiAgbGV0IGksIHZhbHVlLCBwZXJjZW50LFxuICAgIHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtU3RlcHMpXG5cbiAgZm9yKGkgPSAwOyBpIDwgbnVtU3RlcHM7IGkrKyl7XG4gICAgcGVyY2VudCA9IGkgLyBudW1TdGVwc1xuICAgIGlmKHR5cGUgPT09ICdmYWRlSW4nKXtcbiAgICAgIHZhbHVlID0gTWF0aC5jb3MoKDEuMCAtIHBlcmNlbnQpICogMC41ICogbVBJKSAqIG1heFZhbHVlXG4gICAgfWVsc2UgaWYodHlwZSA9PT0gJ2ZhZGVPdXQnKXtcbiAgICAgIHZhbHVlID0gTWF0aC5jb3MocGVyY2VudCAqIDAuNSAqIE1hdGguUEkpICogbWF4VmFsdWVcbiAgICB9XG4gICAgdmFsdWVzW2ldID0gdmFsdWVcbiAgICBpZihpID09PSBudW1TdGVwcyAtIDEpe1xuICAgICAgdmFsdWVzW2ldID0gdHlwZSA9PT0gJ2ZhZGVJbicgPyAxIDogMFxuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWVzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrTUlESU51bWJlcih2YWx1ZSl7XG4gIC8vY29uc29sZS5sb2codmFsdWUpO1xuICBpZihpc05hTih2YWx1ZSkpe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYodmFsdWUgPCAwIHx8IHZhbHVlID4gMTI3KXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTI3Jyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuXG4vKlxuLy9vbGQgc2Nob29sIGFqYXhcblxuZXhwb3J0IGZ1bmN0aW9uIGFqYXgoY29uZmlnKXtcbiAgbGV0XG4gICAgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpLFxuICAgIG1ldGhvZCA9IHR5cGVvZiBjb25maWcubWV0aG9kID09PSAndW5kZWZpbmVkJyA/ICdHRVQnIDogY29uZmlnLm1ldGhvZCxcbiAgICBmaWxlU2l6ZTtcblxuICBmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3Qpe1xuXG4gICAgcmVqZWN0ID0gcmVqZWN0IHx8IGZ1bmN0aW9uKCl7fTtcbiAgICByZXNvbHZlID0gcmVzb2x2ZSB8fCBmdW5jdGlvbigpe307XG5cbiAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZihyZXF1ZXN0LnN0YXR1cyAhPT0gMjAwKXtcbiAgICAgICAgcmVqZWN0KHJlcXVlc3Quc3RhdHVzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZihjb25maWcucmVzcG9uc2VUeXBlID09PSAnanNvbicpe1xuICAgICAgICBmaWxlU2l6ZSA9IHJlcXVlc3QucmVzcG9uc2UubGVuZ3RoO1xuICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSksIGZpbGVTaXplKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZShyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgY29uZmlnLm9uRXJyb3IoZSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub3BlbihtZXRob2QsIGNvbmZpZy51cmwsIHRydWUpO1xuXG4gICAgaWYoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpe1xuICAgICAgcmVxdWVzdC5vdmVycmlkZU1pbWVUeXBlKGNvbmZpZy5vdmVycmlkZU1pbWVUeXBlKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcucmVzcG9uc2VUeXBlKXtcbiAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihtZXRob2QgPT09ICdQT1NUJykge1xuICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLmRhdGEpe1xuICAgICAgcmVxdWVzdC5zZW5kKGNvbmZpZy5kYXRhKTtcbiAgICB9ZWxzZXtcbiAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShleGVjdXRvcik7XG59XG4qLyJdfQ==
