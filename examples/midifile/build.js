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
});

},{"../../src/qambi":21,"isomorphic-fetch":2}],2:[function(require,module,exports){
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

},{"./util":28}],9:[function(require,module,exports){
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

},{"./eventlistener":4,"./init_audio":7,"./note":15,"./parse_audio":16,"./sample":22,"./util":28}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Metronome = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _track = require('./track');

var _part = require('./part');

var _midi_note = require('./midi_note');

var _midi_event = require('./midi_event');

var _util = require('./util');

var _position = require('./position');

var _instrument = require('./instrument');

var _init_audio = require('./init_audio');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var methodMap = new Map([['volume', 'setVolume'], ['instrument', 'setInstrument'], ['noteNumberAccentedTick', 'setNoteNumberAccentedTick'], ['noteNumberNonAccentedTick', 'setNoteNumberNonAccentedTick'], ['velocityAccentedTick', 'setVelocityAccentedTick'], ['velocityNonAccentedTick', 'setVelocityNonAccentedTick'], ['noteLengthAccentedTick', 'setNoteLengthAccentedTick'], ['noteLengthNonAccentedTick', 'setNoteLengthNonAccentedTick']]);

var Metronome = exports.Metronome = function () {
  function Metronome(song) {
    _classCallCheck(this, Metronome);

    this.song = song;
    this.track = new _track.Track(this.song.id + '_metronome');
    this.part = new _part.Part();
    this.track.addParts(this.part);
    this.track.connect(this.song._output);

    this.events = [];
    this.precountEvents = [];
    this.precountDurationInMillis = 0;
    this.bars = 0;
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

      this.events = [];

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
            noteOn._part = { id: 'precount' };
            noteOff._part = { id: 'precount' };
            noteOn._track = this.track;
            noteOff._track = this.track;
          }

          this.part.addEvents(noteOn, noteOff);
          this.events.push(noteOn, noteOff);
          //console.log(noteOn.id)
          //console.log(noteOff.id)
          ticks += ticksPerBeat;
        }
      }
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var startBar = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
      var endBar = arguments.length <= 1 || arguments[1] === undefined ? this.song.bars : arguments[1];
      var id = arguments.length <= 2 || arguments[2] === undefined ? 'init' : arguments[2];

      this.part.removeEvents(this.part.getEvents());
      this.createEvents(startBar, endBar, id);
      this.bars = this.song.bars;
      console.log('getEvents %O', this.events);
      return this.events;
    }
  }, {
    key: 'createPrecountEvents',
    value: function createPrecountEvents(precount) {
      if (precount <= 0) {
        return;
      }
      var endPos = (0, _position.calculatePosition)(this.song, {
        barsbeats: [this.song.bar + precount],
        type: 'barsbeats'
      });

      this.index = 0;
      this.millis = 0;
      this.startMillis = this.song._millis;
      this.precountDurationInMillis = endPos.millis - this.startMillis;
      //@todo: fix this up
      this.precountEvents = this.createEvents(this, this.song.bar, endPos.bar - 1, 'precount');
      //parseEvents(this.song, this.precountEvents)
      //console.log(this.song.bar, endPos.bar, precount, this.precountEvents.length);
      //console.log(this.precountEvents, this.precountDurationInMillis, startTicks, endTicks);
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

      //console.log(maxtime, maxi, this.index, this.millis);

      for (i = this.index; i < maxi; i++) {
        evt = events[i];
        //console.log(event.millis, maxtime, this.millis);
        if (evt.millis < maxtime) {
          evt.time = this.startTime + evt.millis;
          result.push(evt);
          this.index++;
        } else {
          break;
        }
      }
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

},{"./init_audio":7,"./instrument":9,"./midi_event":11,"./midi_note":12,"./part":18,"./position":20,"./track":27,"./util":28}],11:[function(require,module,exports){
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

},{"./util":28}],16:[function(require,module,exports){
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

},{"./init_audio":7,"./util":28,"isomorphic-fetch":2}],17:[function(require,module,exports){
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

},{"./midi_note":12,"./util":28}],18:[function(require,module,exports){
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
      //console.log(track)

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

},{"./util":28}],19:[function(require,module,exports){
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

},{"./eventlistener.js":4,"./position.js":20,"./util.js":28}],20:[function(require,module,exports){
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

},{"./util":28}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseMIDIFile = exports.Instrument = exports.Part = exports.Track = exports.Song = exports.MIDINote = exports.MIDIEvent = exports.parseSamples = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.MIDIEventTypes = exports.init = undefined;

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

exports.default = qambi;
exports.
// from ./init
init = _init.init;
exports.MIDIEventTypes = MIDIEventTypes;
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

},{"./init":6,"./init_audio":7,"./init_midi":8,"./instrument":9,"./midi_event":11,"./midi_note":12,"./midifile":14,"./parse_audio":16,"./part":18,"./song":25,"./track":27}],22:[function(require,module,exports){
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

},{"./init_audio.js":7,"./util.js":28}],23:[function(require,module,exports){
module.exports={
  "emptyOgg": "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Y5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=",
  "emptyMp3": "//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=",
  "hightick": "UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAACx/xf/dADOACwBsP3p+6H+zAGoBOkCCwBX/EH5OvxlA4kJ2wcSArT9E/ut+HT2evUx98n6OAF5CCUMwQvfCOsJxAx0DSIMEAq9BiAB3vhz7mLkT9sR133YxN2s5QLv0vrUBnwRnxuQJeEsSDCiMd8yFS8aKFIhohUsCKj64u625OraA9HuyPnElcP+wxvJWtW25637VQ0jHPgnBTDDM1o0CzKLK+8hzhgFDOz8Se4J47DYVtG0z5fQq9LB12rfA+j99roHAhelIyMwIjdTOuU8mjwIOGoxhCb5E53/j+3k3/fTY8pTw4y/Tr+ew8DMvdsk8RcHRRkSKO4yGTkHPkU/rzzyNcgsrR94Dp/5r+Zs17zOncoDxhfE38WLyn/TeOMi9r0IRxlRKIQzyTlOPKo9yjmWMcokDRLc/Y7rudtdzu/D2L1Iu+27JcG3yYrVLujl+3UOZx1UK5Q0qzmNPDk8ZjeeMPojzhH+/jLtPd5m0hHLHsYIw5TEMMnA0jvj8fSOBiwXASZgMzM8dUBGQbI+rzjpKkIZygZT9QflcdaRyqXCz7+VwUPH784r3K7s+v0KDu8bvyeLMb43NjrhOIo0dSvQHi0PnP6i7ovg3NTxy4/Gf8X8yH/QBtvX55P2Ygb0FcUjsy4LNmI5ejiXM38r7iC8FJwHPvok7dDgQdaJzlTKIsoFzsrVkuA87d/6qAi7FQ0h9ClKMLEz3TOrMBcqYSD8E9AFd/dS6kTf6dbU0XnQv9IH2MXfZ+ln9DEAFwwdFy8giib6KawqeChgI/UbHBOTCZj/vvXe7InlFuDN3P3b0d1F4gzpifG2+u4D7Qw1FfwbnCD+IlgjWyHLHPMVog2mBL37qvP+7NvnYuTv4rvjfubN6k3wpPZ0/WkEOwtiEUsWcxm+Gl4aOhhiFDAPIwmbAtn7TPVy77zqcefr5YHmHull7enyfPmcAHgHew1REr8Vhhd/F+AV1RJ0DikJWQNc/ZP3efKd7hvs2ur46rHs5u8e9N/48/0hA/8HFgwuD04RSBIREqsQOg7mCssGMAJW/Xn4G/TK8Lbuzu0I7qTvnPJy9sX6bP84BLYIbAwdD84QYxG7EOcODAxwCFMEAQC9+7P3SvTX8XHw+u9R8KTxIvSo9+X7VQCUBJ0IMwziDj4QLhAGD9UMrgnTBZcBRv1v+Xv2UfS+8tfx+vES87z0+vb3+Zf9ZgEQBSEIUArWC8kM2QyzC5EJEAdvBHgBXP5n++r4Avd89Wj07fMw9D31Jvfp+Uj9xQD9A8QG5QhXClELrAsvC9wJ7gd6BWIC3v6O+7T4PPZN9EHzWvNf9Pz1Fvit+qL9rQCHAwEG/weCCZUKFwvDCnIJcAcQBWcCaf8Z/CD55vaB9dD0wPSP9UL3m/k7/Mz+JwEyAw8FzAY7CBsJaQk5CWkI2gatBCICYf+j/Fr6vfiV9872sfZP91z4p/lR+3H9zf89AroEFAfjCP0Jcwo8CjAJdQdgBSEDkgDQ/Vj7ZfnR95T28fUd9v32Vvg2+nb8+/6xAWoE4AbDCP4JpAqbCqQJ0weEBfgCTACT/R37M/m+9672IPY69gb3afhW+tT8qf+MAj0FggcuCScKXAriCcMIEAfyBJYCFwCP/Rz7A/l793z2F/Zn9mH37fjd+i39yf9pAt0EFAfRCNkJGAqrCZYIvgZPBJ8B6P4//M350vdz9q/1lfUq9mz3RPmi+3H+bgFVBOQG3wgHCkwK0Am7CCAHCgWmAjAA",
  "lowtick": "UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAAB0/5v+U/4T/3gA0wFTAuUB+f8d/nT90f1q/ub+tf46/mb/8wFQA9gC7wCd/mr+FAGRA3cE6wJf/h36evmv+8v/NwRHBZUC2/60+//5EvuZ/aX/bgFOAp8Azvzh9wfzLPF68zT4y/2BAygIfQwaEjYY0x31Irwl8SOWHVESOgPh9NfpReFt22nYHddD2BXcZeDa5InqgPDx9nP+6gS4CBYLnw0zES0WXxv4HkcgLh/1G+EX1RNpD4wKigXH/6r5/fNu7lTpj+Zu5hHoXOtL71byr/Qp91L64v6OBO4JoQ5zEskU+hU1FiQVeRP7EWgP4Qr0BIT+tPid9C3y1vCh8FDxJvK28vvyy/LA8pLzU/XP95v6xvw4/uD/RAK2BSkKcg6BEScTZBMeEqkPTQxjCKEEVwFi/nv7h/hp9aDyAvHP8MfxLvM+9PX0uPW19g/4Lfr7/C4AKgNaBXQGywb0BhIHWQfWB1oIzAjtCF8IHwdtBakDVwKLAeYA8v9w/kj81/nQ94v29/XX9bz1bPUY9Uz1Z/aH+Hr7yP4MAi4F+wcfCnYLNgyfDPsMSw0sDUAMfgrcB5IEMwFb/iX8T/pT+O/1X/Mf8cbvrO+18MLyvfVP+Rf9wgAoBCEHpwnIC5EN4Q5AD3wO1Ay0CpsIvwbvBNcCbQAr/nX8Ofsf+vb4mvda9rj1z/WX9pL3a/hH+ZX6R/wn/vP/eQESA/AE+wYDCcwKFAyPDCkMFQuSCe4HVQbSBHQDCwI8ANL9JPuY+HX28vTq82PzdPMV9Az1MfZ49zD5gftx/sQBBQXLB8cJ/gqpCw8MigwWDXENXQ2rDDUL7QgDBswCdv8S/K74WPVk8hXwou4P7mvu1+9T8pz1Uvli/ZoBwgWRCcsMPg/CEEQR4RDADwoO9wusCVMH4ARSApn/ufzd+Wj3bvX78xzzx/L68qzz1vSD9qX4Gfvd/c0AhwO/BWwHmghvCQEKVQonClsJCwiIBh0F0gOgAm0BOwAx/03+XP0g/Lb6cPmX+F/4vfh++TH6s/os+7/7cvwL/Zz9XP5O/3IA3AF9AzsF9gaUCAAKHgueCzcL9wntB3sF4wIzAI396fp1+Gv2IvWn9N30p/Xi9m74G/ru+9P9k/8aAYEC1AMTBSIG0wYuB1gHkgcACGEISAhTBzEFWAKt/5L92fuU+vX50fmf+SP5i/gb+Bf4mviv+Sr7kvyb/Uj+r/4X/8r/+gCiAo0EUAaRBzwISwjqB3IHGQfCBv8FpgTMApQAKf67+5n5/vfn9jz2yPVn9SL1RPXq9SP3Dvmr+6f+sQGKBAcH+whOCh0Laws3C28KLAmDB5AFfQNoAVP/Zv3e+7P6sfnL+Cv4vPeM95b37feV+Jn51Poq/LL9mv+YAVYD3gQuBmcHSAikCIEI7Af+BuEFngQXA1sBv/9v/pf9MP3W/Fj8q/sR+6H6U/o3+mP6y/pN+/f7xvye/WH+Jf9mAD4CQAQJBisHtgf6Bw0I8QdsB1sGywT4AggBCP/o/KX6mPg19572jfaz9uf2S/cM+E35E/tW/af/5wH1A8AFKgfkB/AHgwfxBlAGgQVIBMMCJwGs/43+vP0i/Zr8Lfzl+9H76fvi+9f75fsf/In8BP10/ej9cf4O/7f/dAAcAaUBEgKMAhgDpAMEBCEEDwTfA3IDxQL8ASoBUwCG/87+J/6h/Rr9pPxk/Gb8oPwJ/XH9w/39/UD+qP41/9D/WwDeAGsBAgKdAhEDQQNAA0sDbwOVA5YDVwPOAhgCVAGRAA==",
}
},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_midi = require('./init_midi');

var _init_audio = require('./init_audio');

var _midi_event = require('./midi_event');

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
      this.events = this.song._allEvents;
      this.numEvents = this.events.length;
      this.index = 0;
      this.maxtime = 0;
      this.prevMaxtime = 0;
      this.beyondLoop = false; // tells us if the playhead has already passed the looped section
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
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var events = [];

      if (this.song._loop === true && this.song._loopDuration < BUFFER_TIME) {
        this.maxtime = this.songStartMillis + this.song._loopDuration - 1;
        //console.log(this.maxtime, this.song.loopDuration);
      }

      if (this.song._loop === true) {

        if (this.maxtime >= this.song._rightLocator.millis && this.beyondLoop === false) {

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
                //console.log(event.type)
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
                //console.log(event)
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

            //console.log(events.length)

            // get the audio events that start before song.loopStart
            //this.getDanglingAudioEvents(this.song.loopStart, events);
          }
        } else {
            this.looped = false;
          }
      }

      //console.log(this.looped)

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
    value: function update(millis) {
      var i, event, numEvents, track, events;

      events = this.getEvents();
      numEvents = events.length;
      this.prevMaxtime = this.maxtime;
      this.maxtime = millis + BUFFER_TIME;

      // if(numEvents > 5){
      //   console.log(numEvents)
      // }

      for (i = 0; i < numEvents; i++) {
        event = events[i];
        track = event._track;
        //console.log(event.millis, this.maxtime, this.prevMaxtime)

        if (event.millis > this.maxtime) {
          // skip events that were harvest accidently while jumping the playhead -> should happen very rarely if ever
          console.log('skip', event);
          continue;
        }

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

},{"./init_audio":7,"./init_midi":8,"./midi_event":11}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Song = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //@ flow

//import {addTask, removeTask} from './heartbeat'


var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

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


    this._timeEvents = [new _midi_event.MIDIEvent(0, _qambi.MIDIEventTypes.TEMPO, this.bpm), new _midi_event.MIDIEvent(0, _qambi.MIDIEventTypes.TIME_SIGNATURE, this.nominator, this.denominator)];

    //this._timeEvents = []
    this._updateTimeEvents = true;
    this._lastEvent = new _midi_event.MIDIEvent(0, _qambi.MIDIEventTypes.END_OF_TRACK);

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

    this._scheduler = new _scheduler2.default(this);
    this._playhead = new _playhead.Playhead(this);
    this._millis = 0;

    this._playing = false;
    this._paused = false;

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
        if (event.type === _qambi.MIDIEventTypes.TIME_SIGNATURE) {
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

        _this3.partsById.delete(part.id);
        (_removedEvents = _this3._removedEvents).push.apply(_removedEvents, _toConsumableArray(part._events));
      });

      // add new parts
      console.log('new parts %O', this._newParts);
      this._newParts.forEach(function (part) {
        var _tobeParsed;

        part._song = _this3;
        _this3._partsById.set(part.id, part);
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
          //console.log(event.id, event.type)
          if (event.type === _qambi2.default.NOTE_ON) {
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
      if (lastTimeEvent.ticks > lastEvent.ticks) {
        lastEvent = lastTimeEvent;
      }

      // get the position data of the first beat in the bar after the last bar
      this.bars = lastEvent.bar;
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

      // add metronome events
      if (this._updateMetronomeEvents || this._metronome.bars !== this.bars) {
        this._metronomeEvents = (0, _parse_events.parseEvents)([].concat(_toConsumableArray(this._timeEvents), _toConsumableArray(this._metronome.getEvents())));
      }
      this._allEvents = [].concat(_toConsumableArray(this._metronomeEvents), _toConsumableArray(this._events));
      (0, _util.sortEvents)(this._allEvents);
    }
  }, {
    key: 'play',
    value: function play(type) {
      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      this._play.apply(this, [type].concat(args));
      (0, _eventlistener.dispatchEvent)({ type: 'play', data: this._millis });
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
        this.allNotesOff();
        (0, _eventlistener.dispatchEvent)({ type: 'pause', data: this._paused });
      } else {
        this.play();
        (0, _eventlistener.dispatchEvent)({ type: 'pause', data: this._paused });
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.allNotesOff();
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

      var wasPlaying = this._playing;
      if (this._playing) {
        this._playing = false;
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
      this._scheduler.beyondLoop = this._millis > this._rightLocator.millis;
      return this._loop;
    }
  }, {
    key: '_pulse',
    value: function _pulse() {
      if (this._playing === false) {
        return;
      }
      var now = _init_audio.context.currentTime * 1000;
      var diff = now - this._timeStamp;

      if (this._loop && this._scheduler.looped && this._millis > this._rightLocator.millis) {
        this._millis -= this._loopDuration;
        this._playhead.set('millis', this._millis + diff);
        (0, _eventlistener.dispatchEvent)({
          type: 'loop',
          data: null
        });
      } else {
        //console.log(diff, this._millis)
        this._playhead.update('millis', diff);
      }

      this._millis += diff;
      this._timeStamp = now;

      if (this._millis >= this._durationMillis) {
        this.stop();
        return;
      }

      this._scheduler.update(this._millis);

      //console.log('pulse', diff)
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

},{"./eventlistener":4,"./init_audio":7,"./metronome":10,"./midi_event":11,"./parse_events":17,"./playhead":19,"./position":20,"./qambi":21,"./scheduler":24,"./song_from_midifile":26,"./util":28}],26:[function(require,module,exports){
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

},{"./fetch_helpers":5,"./midi_event":11,"./midifile":14,"./part":18,"./song":25,"./track":27,"./util":28,"isomorphic-fetch":2}],27:[function(require,module,exports){
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
    this._recordedNotes = new Map();
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

              midiEvent = new (Function.prototype.bind.apply(_midi_event.MIDIEvent, [null].concat([1], _toConsumableArray(e.data))))();
              midiEvent.time = 0; // play immediately
              midiEvent.recordMillis = _init_audio.context.currentTime * 1000;

              if (midiEvent.type === _qambi.MIDIEventTypes.NOTE_ON) {
                note = new _midi_note.MIDINote(midiEvent);
                _this3._recordedNotes.set(midiEvent.data1, note);
              } else if (midiEvent.type === _qambi.MIDIEventTypes.NOTE_OFF) {
                note = _this3._recordedNotes.get(midiEvent.data1);
                note.addNoteOff(midiEvent);
                _this3._recordedNotes.delete(midiEvent.data1);
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
            //song._newEvents.push(event)
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

},{"./init_audio":7,"./init_midi":8,"./instrument":9,"./midi_event":11,"./midi_note":12,"./part":18,"./qambi":21,"./util":28}],28:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9taWRpZmlsZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pc29tb3JwaGljLWZldGNoL2ZldGNoLW5wbS1icm93c2VyaWZ5LmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsInNyYy9ldmVudGxpc3RlbmVyLmpzIiwic3JjL2ZldGNoX2hlbHBlcnMuanMiLCJzcmMvaW5pdC5qcyIsInNyYy9pbml0X2F1ZGlvLmpzIiwic3JjL2luaXRfbWlkaS5qcyIsInNyYy9pbnN0cnVtZW50LmpzIiwic3JjL21ldHJvbm9tZS5qcyIsInNyYy9taWRpX2V2ZW50LmpzIiwic3JjL21pZGlfbm90ZS5qcyIsInNyYy9taWRpX3N0cmVhbS5qcyIsInNyYy9taWRpZmlsZS5qcyIsInNyYy9ub3RlLmpzIiwic3JjL3BhcnNlX2F1ZGlvLmpzIiwic3JjL3BhcnNlX2V2ZW50cy5qcyIsInNyYy9wYXJ0LmpzIiwic3JjL3BsYXloZWFkLmpzIiwic3JjL3Bvc2l0aW9uLmpzIiwic3JjL3FhbWJpLmpzIiwic3JjL3NhbXBsZS5qcyIsInNyYy9zYW1wbGVzLmpzb24iLCJzcmMvc2NoZWR1bGVyLmpzIiwic3JjL3NvbmcuanMiLCJzcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwic3JjL3RyYWNrLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7O0FBT0E7Ozs7OztBQUVBLFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQVU7O0FBRXRELE1BQUksYUFBSixDQUZzRDs7QUFJdEQsa0JBQU0sSUFBTixHQUNDLElBREQsQ0FDTSxZQUFNOztBQUVWLFFBQUksT0FBTyxDQUFQLENBRk07O0FBSVYsUUFBRyxTQUFTLENBQVQsRUFBVzs7OztBQUlaLHFDQUFNLDBCQUFOLEVBQ0MsSUFERCxDQUNNLG9CQUFZO0FBQ2hCLGVB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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RSxTQUFTLElBQUksWUFBSixDQUFpQixRQUFqQixDQUFULENBRnlEOztBQUkzRCxPQUFJLElBQUksQ0FBSixFQUFPLElBQUksUUFBSixFQUFjLEdBQXpCLEVBQTZCO0FBQzNCLGNBQVUsSUFBSSxRQUFKLENBRGlCO0FBRTNCLFFBQUcsU0FBUyxRQUFULEVBQWtCO0FBQ25CLGNBQVEsS0FBSyxHQUFMLENBQVMsQ0FBQyxNQUFNLE9BQU4sQ0FBRCxHQUFrQixHQUFsQixHQUF3QixHQUF4QixDQUFULEdBQXdDLFFBQXhDLENBRFc7S0FBckIsTUFFTSxJQUFHLFNBQVMsU0FBVCxFQUFtQjtBQUMxQixjQUFRLEtBQUssR0FBTCxDQUFTLFVBQVUsR0FBVixHQUFnQixLQUFLLEVBQUwsQ0FBekIsR0FBb0MsUUFBcEMsQ0FEa0I7S0FBdEI7QUFHTixXQUFPLENBQVAsSUFBWSxLQUFaLENBUDJCO0FBUTNCLFFBQUcsTUFBTSxXQUFXLENBQVgsRUFBYTtBQUNwQixhQUFPLENBQVAsSUFBWSxTQUFTLFFBQVQsR0FBb0IsQ0FBcEIsR0FBd0IsQ0FBeEIsQ0FEUTtLQUF0QjtHQVJGO0FBWUEsU0FBTyxNQUFQLENBaEIyRDtDQUF0RDs7QUFvQkEsU0FBUyxlQUFULENBQXlCLEtBQXpCLEVBQStCOztBQUVwQyxNQUFHLE1BQU0sS0FBTixDQUFILEVBQWdCO0FBQ2QsWUFBUSxJQUFSLENBQWEseUJBQWIsRUFEYztBQUVkLFdBQU8sS0FBUCxDQUZjO0dBQWhCO0FBSUEsTUFBRyxRQUFRLENBQVIsSUFBYSxRQUFRLEdBQVIsRUFBWTtBQUMxQixZQUFRLElBQVIsQ0FBYSwyQ0FBYixFQUQwQjtBQUUxQixXQUFPLEtBQVAsQ0FGMEI7R0FBNUI7QUFJQSxTQUFPLEtBQVAsQ0FWb0M7Q0FBL0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHFhbWJpLCB7XG4gIFNvbmcsXG4gIE1JRElFdmVudFR5cGVzLFxuICBJbnN0cnVtZW50LFxufSBmcm9tICcuLi8uLi9zcmMvcWFtYmknXG5cblxuaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xuXG4gIGxldCBzb25nXG5cbiAgcWFtYmkuaW5pdCgpXG4gIC50aGVuKCgpID0+IHtcblxuICAgIGxldCB0ZXN0ID0gMVxuXG4gICAgaWYodGVzdCA9PT0gMSl7XG5cbiAgICAgIC8vY29uc29sZS50aW1lKCdzb25nJylcbiAgICAgIC8vZmV0Y2goJy4uL2RhdGEvbW96azU0NWEubWlkJylcbiAgICAgIGZldGNoKCcuLi9kYXRhL21pbnV0ZV93YWx0ei5taWQnKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKVxuICAgICAgfSlcbiAgICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgICBzb25nID0gU29uZy5mcm9tTUlESUZpbGUoZGF0YSlcbiAgICAgICAgaW5pdFVJKClcbiAgICAgICAgLy9jb25zb2xlLnRpbWVFbmQoJ3NvbmcnKVxuICAgICAgfSlcblxuICAgIH1lbHNlIGlmKHRlc3QgPT09IDIpe1xuXG4gICAgICAvL2NvbnNvbGUudGltZSgnc29uZycpXG4gICAgICBTb25nLmZyb21NSURJRmlsZUFzeW5jKCcuLi9kYXRhL21pbnV0ZV93YWx0ei5taWQnKVxuICAgICAgLnRoZW4ocyA9PiB7XG4gICAgICAgIHNvbmcgPSBzXG4gICAgICAgIC8vY29uc29sZS50aW1lRW5kKCdzb25nJylcbiAgICAgICAgaW5pdFVJKClcbiAgICAgIH0sIGUgPT4gY29uc29sZS5sb2coZSkpXG4gICAgfVxuICB9KVxuXG5cbiAgZnVuY3Rpb24gaW5pdFVJKCl7XG5cbiAgICBzb25nLmdldFRyYWNrcygpLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2suc2V0SW5zdHJ1bWVudChuZXcgSW5zdHJ1bWVudCgpKVxuICAgIH0pXG5cbiAgICBsZXQgYnRuUGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5JylcbiAgICBsZXQgYnRuUGF1c2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGF1c2UnKVxuICAgIGxldCBidG5TdG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3AnKVxuICAgIGxldCBidG5Mb29wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvb3AnKVxuICAgIGxldCBidG5EZWxldGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVsZXRlJylcbiAgICBsZXQgZGl2VGVtcG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVtcG8nKVxuICAgIGxldCBkaXZTdXN0YWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1c3RhaW4nKVxuICAgIGxldCBkaXZTdXN0YWluMiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdXN0YWluMicpXG4gICAgbGV0IGRpdlN1c3RhaW4zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1c3RhaW4zJylcbiAgICBsZXQgZGl2UG9zaXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zaXRpb24nKVxuICAgIGxldCBkaXZQb3NpdGlvblRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zaXRpb25fdGltZScpXG4gICAgbGV0IHJhbmdlUG9zaXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWhlYWQnKVxuICAgIGxldCB1c2VySW50ZXJhY3Rpb24gPSBmYWxzZVxuXG4gICAgYnRuUGxheS5kaXNhYmxlZCA9IGZhbHNlXG4gICAgYnRuUGF1c2UuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0blN0b3AuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0bkxvb3AuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0bkRlbGV0ZS5kaXNhYmxlZCA9IGZhbHNlXG5cbiAgICBidG5QbGF5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIC8vc29uZy5wbGF5KCdiYXJzYmVhdHMnLCA0LCAxLCAxLCAwKVxuICAgICAgLy9zb25nLnBsYXkoJ3RpbWUnLCAwLCAwLCAxNSkgLy8gcGxheSBmcm9tIDE1IHNlY29uZHNcbiAgICAgIC8vc29uZy5wbGF5KCdtaWxsaXMnLCAzNDAwMCkgLy8gcGxheSBmcm9tIDM0IHNlY29uZHNcbiAgICAgIHNvbmcucGxheSgpXG4gICAgfSk7XG5cbiAgICBidG5QYXVzZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICBzb25nLnBhdXNlKClcbiAgICB9KVxuXG4gICAgYnRuU3RvcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICBzb25nLnN0b3AoKVxuICAgIH0pXG5cbiAgICBidG5Mb29wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIGxldCBsb29wID0gc29uZy5zZXRMb29wKClcbiAgICAgIGNvbnNvbGUubG9nKGxvb3ApXG4gICAgICBidG5Mb29wLmlubmVySFRNTCA9IGxvb3AgPyAnc3RvcCBsb29wJyA6ICdzdGFydCBsb29wJ1xuICAgIH0pXG5cblxuICAgIGxldCBtZW1vcnlMZWFrXG5cbiAgICBidG5EZWxldGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgbWVtb3J5TGVhayA9IHNvbmcuZ2V0RXZlbnRzKClbMF1cbiAgICAgIC8vc29uZy5kaXNwb3NlKClcbiAgICAgIHNvbmcgPSBudWxsXG4gICAgICBjb25zb2xlLmxvZyhtZW1vcnlMZWFrKSAvLyAtPiB0aGlzIGV2ZW50IHJldGFpbnMgdGhlIHdob2xlIHNvbmchXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIG1lbW9yeUxlYWsgPSBudWxsXG4gICAgICAgIGNvbnNvbGUubG9nKCdtZW1vcnkgY2xlYXJlZCcpXG4gICAgICB9LCA1MDAwKVxuICAgIH0pXG5cbiAgICAvLyBzb25nLmFkZEV2ZW50TGlzdGVuZXIoTUlESUV2ZW50VHlwZXMuVEVNUE8sIGV2ZW50ID0+IHtcbiAgICAvLyAgIGRpdlRlbXBvLmlubmVySFRNTCA9IGB0ZW1wbzogJHtldmVudC5icG19IGJwbWBcbiAgICAvLyB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdzdXN0YWlucGVkYWwnLCBldmVudCA9PiB7XG4gICAgICBkaXZTdXN0YWluLmlubmVySFRNTCA9ICdzdXN0YWlucGVkYWwgJyArIGV2ZW50LmRhdGFcbiAgICB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdzdXN0YWlucGVkYWwyJywgZXZlbnQgPT4ge1xuICAgICAgZGl2U3VzdGFpbjIuaW5uZXJIVE1MID0gJ3N1c3RhaW5wZWRhbDIgJyArIGV2ZW50LmRhdGFcbiAgICB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKE1JRElFdmVudFR5cGVzLkNPTlRST0xfQ0hBTkdFLCBldmVudCA9PiB7XG4gICAgICBpZihldmVudC5kYXRhMSAhPT0gNjQpe1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICBkaXZTdXN0YWluMy5pbm5lckhUTUwgPSAnc3VzdGFpbnBlZGFsMyBkb3duJ1xuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICBkaXZTdXN0YWluMy5pbm5lckhUTUwgPSAnc3VzdGFpbnBlZGFsMyB1cCdcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdub3RlT24nLCBldmVudCA9PiB7XG4gICAgICBsZXQgbm90ZSA9IGV2ZW50LmRhdGFcbiAgICAgIC8vY29uc29sZS5sb2coJ25vdGVPbicsIG5vdGUuaWQsIG5vdGUubm90ZU9uLmlkLCBub3RlLm5vdGVPbi5kYXRhMSwgbm90ZS5ub3RlT24udGlja3MpXG4gICAgfSlcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignbm90ZU9mZicsIGV2ZW50ID0+IHtcbiAgICAgIGxldCBub3RlID0gZXZlbnQuZGF0YVxuICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9mZicsIG5vdGUuaWQsIG5vdGUubm90ZU9mZi5pZCwgbm90ZS5ub3RlT2ZmLmRhdGExLCBub3RlLm5vdGVPZmYudGlja3MpXG4gICAgfSlcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcigncGxheScsIGV2ZW50ID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdzdGFydGVkIHBsYXlpbmcgYXQgcG9zaXRpb246JywgZXZlbnQuZGF0YSlcbiAgICB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdzdG9wJywgKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ3N0b3AnKVxuICAgICAgcmFuZ2VQb3NpdGlvbi52YWx1ZSA9IDBcbiAgICB9KVxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdwYXVzZScsIGV2ZW50ID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdwYXVzZWQ6JywgZXZlbnQuZGF0YSlcbiAgICAgIC8vY29uc29sZS5sb2coc29uZy5nZXRQb3NpdGlvbigpKVxuICAgIH0pXG5cbiAgICBsZXQgcG9zaXRpb24gPSBzb25nLmdldFBvc2l0aW9uKClcbiAgICBkaXZQb3NpdGlvbi5pbm5lckhUTUwgPSBwb3NpdGlvbi5iYXJzQXNTdHJpbmdcbiAgICBkaXZQb3NpdGlvblRpbWUuaW5uZXJIVE1MID0gcG9zaXRpb24udGltZUFzU3RyaW5nXG4gICAgZGl2VGVtcG8uaW5uZXJIVE1MID0gYHRlbXBvOiAke3Bvc2l0aW9uLmJwbX0gYnBtYFxuXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdwb3NpdGlvbicsIGV2ZW50ID0+IHtcbiAgICAgIGRpdlBvc2l0aW9uLmlubmVySFRNTCA9IGV2ZW50LmRhdGEuYmFyc0FzU3RyaW5nXG4gICAgICBkaXZQb3NpdGlvblRpbWUuaW5uZXJIVE1MID0gZXZlbnQuZGF0YS50aW1lQXNTdHJpbmdcbiAgICAgIGRpdlRlbXBvLmlubmVySFRNTCA9IGB0ZW1wbzogJHtldmVudC5kYXRhLmJwbX0gYnBtYFxuICAgICAgaWYoIXVzZXJJbnRlcmFjdGlvbil7XG4gICAgICAgIHJhbmdlUG9zaXRpb24udmFsdWUgPSBldmVudC5kYXRhLnBlcmNlbnRhZ2VcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmFuZ2VQb3NpdGlvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZSA9PiB7XG4gICAgICByYW5nZVBvc2l0aW9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHJhbmdlTGlzdGVuZXIpXG4gICAgICB1c2VySW50ZXJhY3Rpb24gPSBmYWxzZVxuICAgIH0pXG5cbiAgICByYW5nZVBvc2l0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGUgPT4ge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBzb25nLnNldFBvc2l0aW9uKCdwZXJjZW50YWdlJywgZS50YXJnZXQudmFsdWVBc051bWJlcilcbiAgICAgIH0sIDApXG4gICAgICByYW5nZVBvc2l0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHJhbmdlTGlzdGVuZXIpXG4gICAgICB1c2VySW50ZXJhY3Rpb24gPSB0cnVlXG4gICAgfSlcblxuICAgIGNvbnN0IHJhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbihlKXtcbiAgICAgIHNvbmcuc2V0UG9zaXRpb24oJ3BlcmNlbnRhZ2UnLCBlLnRhcmdldC52YWx1ZUFzTnVtYmVyKVxuICAgIH1cblxuXG4gICAgc29uZy5zZXRQb3NpdGlvbignYmFyc2JlYXRzJywgMilcbiAgICBzb25nLnNldExlZnRMb2NhdG9yKCdiYXJzYmVhdHMnLCAyKVxuICAgIHNvbmcuc2V0UmlnaHRMb2NhdG9yKCdiYXJzYmVhdHMnLCAzLCAyKVxuICAgIHNvbmcuc2V0TG9vcCgpXG5cblxuICAgIC8vY29uc29sZS5sb2coc29uZy5nZXRQb3NpdGlvbigpKVxuICB9XG5cbn0pXG4iLCIvLyB0aGUgd2hhdHdnLWZldGNoIHBvbHlmaWxsIGluc3RhbGxzIHRoZSBmZXRjaCgpIGZ1bmN0aW9uXG4vLyBvbiB0aGUgZ2xvYmFsIG9iamVjdCAod2luZG93IG9yIHNlbGYpXG4vL1xuLy8gUmV0dXJuIHRoYXQgYXMgdGhlIGV4cG9ydCBmb3IgdXNlIGluIFdlYnBhY2ssIEJyb3dzZXJpZnkgZXRjLlxucmVxdWlyZSgnd2hhdHdnLWZldGNoJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHNlbGYuZmV0Y2guYmluZChzZWxmKTtcbiIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMubWFwKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRoaXMubWFwW25hbWVdLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcylcbiAgICAgIH0sIHRoaXMpXG4gICAgfSwgdGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKCk7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAvLyBPbmx5IHN1cHBvcnQgQXJyYXlCdWZmZXJzIGZvciBQT1NUIG1ldGhvZC5cbiAgICAgICAgLy8gUmVjZWl2aW5nIEFycmF5QnVmZmVycyBoYXBwZW5zIHZpYSBCbG9icywgaW5zdGVhZC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcbiAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBpbnB1dFxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9IHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnM7XG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3Q7XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdFxuICAgICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICAgIHJlcXVlc3QgPSBpbnB1dFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdGF0dXMgPSAoeGhyLnN0YXR1cyA9PT0gMTIyMykgPyAyMDQgOiB4aHIuc3RhdHVzXG4gICAgICAgIGlmIChzdGF0dXMgPCAxMDAgfHwgc3RhdHVzID4gNTk5KSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzKHhociksXG4gICAgICAgICAgdXJsOiByZXNwb25zZVVSTCgpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwibGV0IGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2ZW50KXtcbiAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlKVxuICBsZXQgbWFwXG5cbiAgaWYoZXZlbnQudHlwZSA9PT0gJ2V2ZW50Jyl7XG4gICAgbGV0IG1pZGlFdmVudCA9IGV2ZW50LmRhdGFcbiAgICBsZXQgbWlkaUV2ZW50VHlwZSA9IG1pZGlFdmVudC50eXBlXG4gICAgLy9jb25zb2xlLmxvZyhtaWRpRXZlbnRUeXBlKVxuICAgIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyhtaWRpRXZlbnRUeXBlKSl7XG4gICAgICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQobWlkaUV2ZW50VHlwZSlcbiAgICAgIGZvcihsZXQgY2Igb2YgbWFwLnZhbHVlcygpKXtcbiAgICAgICAgY2IobWlkaUV2ZW50KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKGV2ZW50LnR5cGUpID09PSBmYWxzZSl7XG4gICAgcmV0dXJuXG4gIH1cblxuICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnQudHlwZSlcbiAgZm9yKGxldCBjYiBvZiBtYXAudmFsdWVzKCkpe1xuICAgIGNiKGV2ZW50KVxuICB9XG5cblxuICAvLyBAdG9kbzogcnVuIGZpbHRlcnMgaGVyZSwgZm9yIGluc3RhbmNlIGlmIGFuIGV2ZW50bGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgdG8gYWxsIE5PVEVfT04gZXZlbnRzLCBjaGVjayB0aGUgdHlwZSBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGNhbGxiYWNrKXtcblxuICBsZXQgbWFwXG4gIGxldCBpZCA9IGAke3R5cGV9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuXG4gIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSA9PT0gZmFsc2Upe1xuICAgIG1hcCA9IG5ldyBNYXAoKVxuICAgIGV2ZW50TGlzdGVuZXJzLnNldCh0eXBlLCBtYXApXG4gIH1lbHNle1xuICAgIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKVxuICB9XG5cbiAgbWFwLnNldChpZCwgY2FsbGJhY2spXG4gIC8vY29uc29sZS5sb2coZXZlbnRMaXN0ZW5lcnMpXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcblxuICBpZihldmVudExpc3RlbmVycy5oYXModHlwZSkgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmxvZygnbm8gZXZlbnRsaXN0ZW5lcnMgb2YgdHlwZScgKyB0eXBlKVxuICAgIHJldHVyblxuICB9XG5cbiAgbGV0IG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKVxuXG4gIGlmKHR5cGVvZiBpZCA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgZm9yKGxldCBba2V5LCB2YWx1ZV0gb2YgbWFwLmVudHJpZXMoKSkge1xuICAgICAgY29uc29sZS5sb2coa2V5LCB2YWx1ZSlcbiAgICAgIGlmKHZhbHVlID09PSBpZCl7XG4gICAgICAgIGNvbnNvbGUubG9nKGtleSlcbiAgICAgICAgaWQgPSBrZXlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYodHlwZW9mIGlkID09PSAnc3RyaW5nJyl7XG4gICAgICBtYXAuZGVsZXRlKGlkKVxuICAgIH1cbiAgfWVsc2UgaWYodHlwZW9mIGlkID09PSAnc3RyaW5nJyl7XG4gICAgbWFwLmRlbGV0ZShpZClcbiAgfWVsc2V7XG4gICAgY29uc29sZS5sb2coJ2NvdWxkIG5vdCByZW1vdmUgZXZlbnRsaXN0ZW5lcicpXG4gIH1cbn1cblxuIiwiLy8gZmV0Y2ggaGVscGVyc1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhdHVzKHJlc3BvbnNlKSB7XG4gIGlmKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKXtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3BvbnNlKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpXG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGpzb24ocmVzcG9uc2Upe1xuICByZXR1cm4gcmVzcG9uc2UuanNvbigpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUJ1ZmZlcihyZXNwb25zZSl7XG4gIHJldHVybiByZXNwb25zZS5hcnJheUJ1ZmZlcigpXG59XG4iLCJpbXBvcnQge2luaXRBdWRpb30gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtpbml0TUlESX0gZnJvbSAnLi9pbml0X21pZGknXG5cbmV4cG9ydCBsZXQgZ2V0VXNlck1lZGlhID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWFcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ2dldFVzZXJNZWRpYSBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmV4cG9ydCBsZXQgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ3JlcXVlc3RBbmltYXRpb25GcmFtZSBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmV4cG9ydCBsZXQgQmxvYiA9ICgoKSA9PiB7XG4gIGlmKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gd2luZG93LkJsb2IgfHwgd2luZG93LndlYmtpdEJsb2JcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ0Jsb2IgaXMgbm90IGF2YWlsYWJsZScpXG4gIH1cbn0pKClcblxuXG4vL2V4cG9ydCBmdW5jdGlvbiBpbml0KHNldHRpbmdzID0ge30pOiB2b2lke1xuZXhwb3J0IGZ1bmN0aW9uIGluaXQoY2FsbGJhY2spOiB2b2lke1xuXG4gIC8vIGxvYWQgc2V0dGluZ3MuaW5zdHJ1bWVudHMgKGFycmF5IG9yIG9iamVjdClcbiAgLy8gbG9hZCBzZXR0aW5ncy5taWRpZmlsZXMgKGFycmF5IG9yIG9iamVjdClcbiAgLypcblxuICAgIHFhbWJpLmluaXQoe1xuICAgICAgaW5zdHJ1bWVudHM6IFsnLi4vaW5zdHJ1bWVudHMvcGlhbm8nLCAnLi4vaW5zdHJ1bWVudHMvdmlvbGluJ10sXG4gICAgICBtaWRpZmlsZXM6IFsnLi4vbWlkaS9tb3phcnQubWlkJ11cbiAgICB9KVxuICAgIC50aGVuKChsb2FkZWQpID0+IHtcbiAgICAgIGxldCBbcGlhbm8sIHZpb2xpbl0gPSBsb2FkZWQuaW5zdHJ1bWVudHNcbiAgICAgIGxldCBbbW96YXJ0XSA9IGxvYWRlZC5taWRpZmlsZXNcbiAgICB9KVxuXG4gICovXG5cblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgUHJvbWlzZS5hbGwoW2luaXRBdWRpbygpLCBpbml0TUlESSgpXSlcbiAgICAudGhlbihcbiAgICAoZGF0YSkgPT4ge1xuICAgICAgLy8gcGFyc2VBdWRpb1xuICAgICAgbGV0IGRhdGFBdWRpbyA9IGRhdGFbMF1cblxuICAgICAgLy8gcGFyc2VNSURJXG4gICAgICBsZXQgZGF0YU1pZGkgPSBkYXRhWzFdXG5cbiAgICAgIHJlc29sdmUoe1xuICAgICAgICBsZWdhY3k6IGRhdGFBdWRpby5sZWdhY3ksXG4gICAgICAgIG1wMzogZGF0YUF1ZGlvLm1wMyxcbiAgICAgICAgb2dnOiBkYXRhQXVkaW8ub2dnLFxuICAgICAgICBtaWRpOiBkYXRhTWlkaS5taWRpLFxuICAgICAgICB3ZWJtaWRpOiBkYXRhTWlkaS53ZWJtaWRpLFxuICAgICAgfSlcbiAgICB9LFxuICAgIChlcnJvcikgPT4ge1xuICAgICAgcmVqZWN0KGVycm9yKVxuICAgIH0pXG4gIH0pXG5cblxuLypcbiAgUHJvbWlzZS5hbGwoW2luaXRBdWRpbygpLCBpbml0TUlESSgpXSlcbiAgLnRoZW4oXG4gIChkYXRhKSA9PiB7XG4gICAgLy8gcGFyc2VBdWRpb1xuICAgIGxldCBkYXRhQXVkaW8gPSBkYXRhWzBdXG5cbiAgICAvLyBwYXJzZU1JRElcbiAgICBsZXQgZGF0YU1pZGkgPSBkYXRhWzFdXG5cbiAgICBjYWxsYmFjayh7XG4gICAgICBsZWdhY3k6IGRhdGFBdWRpby5sZWdhY3ksXG4gICAgICBtcDM6IGRhdGFBdWRpby5tcDMsXG4gICAgICBvZ2c6IGRhdGFBdWRpby5vZ2csXG4gICAgICBtaWRpOiBkYXRhTWlkaS5taWRpLFxuICAgICAgd2VibWlkaTogZGF0YU1pZGkud2VibWlkaSxcbiAgICB9KVxuICB9LFxuICAoZXJyb3IpID0+IHtcbiAgICBjYWxsYmFjayhlcnJvcilcbiAgfSlcbiovXG59XG4iLCIvKlxuICBTZXRzIHVwIHRoZSBiYXNpYyBhdWRpbyByb3V0aW5nLCB0ZXN0cyB3aGljaCBhdWRpbyBmb3JtYXRzIGFyZSBzdXBwb3J0ZWQgYW5kIHBhcnNlcyB0aGUgc2FtcGxlcyBmb3IgdGhlIG1ldHJvbm9tZSB0aWNrcy5cbiovXG5cbmltcG9ydCBzYW1wbGVzIGZyb20gJy4vc2FtcGxlcydcbmltcG9ydCB7cGFyc2VTYW1wbGVzfSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuXG5sZXRcbiAgbWFzdGVyR2FpbixcbiAgY29tcHJlc3NvcixcbiAgaW5pdGlhbGl6ZWQgPSBmYWxzZSxcbiAgZGF0YVxuXG5leHBvcnQgbGV0IGNvbnRleHQgPSAoZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2coJ2luaXQgQXVkaW9Db250ZXh0JylcbiAgbGV0IGN0eFxuICBpZih0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jyl7XG4gICAgbGV0IEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dFxuICAgIGlmKEF1ZGlvQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpXG4gICAgfVxuICB9XG4gIGlmKHR5cGVvZiBjdHggPT09ICd1bmRlZmluZWQnKXtcbiAgICAvL0BUT0RPOiBjcmVhdGUgZHVtbXkgQXVkaW9Db250ZXh0IGZvciB1c2UgaW4gbm9kZSwgc2VlOiBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9hdWRpby1jb250ZXh0XG4gICAgY29udGV4dCA9IHtcbiAgICAgIGNyZWF0ZUdhaW46IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2FpbjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY3JlYXRlT3NjaWxsYXRvcjogZnVuY3Rpb24oKXt9LFxuICAgIH1cbiAgfVxuICByZXR1cm4gY3R4XG59KCkpXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRBdWRpbygpe1xuXG4gIGlmKHR5cGVvZiBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID09PSAndW5kZWZpbmVkJyl7XG4gICAgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpblxuICB9XG4gIC8vIGNoZWNrIGZvciBvbGRlciBpbXBsZW1lbnRhdGlvbnMgb2YgV2ViQXVkaW9cbiAgZGF0YSA9IHt9XG4gIGxldCBzb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gIGRhdGEubGVnYWN5ID0gZmFsc2VcbiAgaWYodHlwZW9mIHNvdXJjZS5zdGFydCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGRhdGEubGVnYWN5ID0gdHJ1ZVxuICB9XG5cbiAgLy8gc2V0IHVwIHRoZSBlbGVtZW50YXJ5IGF1ZGlvIG5vZGVzXG4gIGNvbXByZXNzb3IgPSBjb250ZXh0LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvcigpXG4gIGNvbXByZXNzb3IuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICBtYXN0ZXJHYWluID0gY29udGV4dC5jcmVhdGVHYWluTm9kZSgpXG4gIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSAwLjVcbiAgaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgIHBhcnNlU2FtcGxlcyhzYW1wbGVzKS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQoYnVmZmVycyl7XG4gICAgICAgIC8vY29uc29sZS5sb2coYnVmZmVycylcbiAgICAgICAgZGF0YS5vZ2cgPSB0eXBlb2YgYnVmZmVycy5lbXB0eU9nZyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgZGF0YS5tcDMgPSB0eXBlb2YgYnVmZmVycy5lbXB0eU1wMyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgZGF0YS5sb3d0aWNrID0gYnVmZmVycy5sb3d0aWNrXG4gICAgICAgIGRhdGEuaGlnaHRpY2sgPSBidWZmZXJzLmhpZ2h0aWNrXG4gICAgICAgIGlmKGRhdGEub2dnID09PSBmYWxzZSAmJiBkYXRhLm1wMyA9PT0gZmFsc2Upe1xuICAgICAgICAgIHJlamVjdCgnTm8gc3VwcG9ydCBmb3Igb2dnIG5vciBtcDMhJylcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZShkYXRhKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25SZWplY3RlZCgpe1xuICAgICAgICByZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIGluaXRpYWxpemluZyBBdWRpbycpXG4gICAgICB9XG4gICAgKVxuICB9KVxufVxuXG5cbmxldCBzZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbih2YWx1ZTogbnVtYmVyID0gMC41KTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBzZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbih2YWx1ZTogbnVtYmVyID0gMC41KXtcbiAgICAgIGlmKHZhbHVlID4gMSl7XG4gICAgICAgIGNvbnNvbGUuaW5mbygnbWF4aW1hbCB2b2x1bWUgaXMgMS4wLCB2b2x1bWUgaXMgc2V0IHRvIDEuMCcpO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB2YWx1ZSA8IDAgPyAwIDogdmFsdWUgPiAxID8gMSA6IHZhbHVlXG4gICAgICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0TWFzdGVyVm9sdW1lKHZhbHVlKVxuICB9XG59XG5cblxubGV0IGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBtYXN0ZXJHYWluLmdhaW4udmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIGdldE1hc3RlclZvbHVtZSgpXG4gIH1cbn1cblxuXG5sZXQgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBjb21wcmVzc29yLnJlZHVjdGlvbi52YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24oKVxuICB9XG59XG5cblxubGV0IGVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihmbGFnOiBib29sZWFuKXtcbiAgICAgIGlmKGZsYWcpe1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb21wcmVzc29yKTtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZW5hYmxlTWFzdGVyQ29tcHJlc3NvcigpXG4gIH1cbn1cblxuXG5sZXQgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGNmZyk6IHZvaWR7XG4gIC8qXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gYXR0YWNrOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0ga25lZTsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByYXRpbzsgLy8gdW5pdC1sZXNzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVkdWN0aW9uOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlbGVhc2U7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSB0aHJlc2hvbGQ7IC8vIGluIERlY2liZWxzXG5cbiAgICBAc2VlOiBodHRwOi8vd2ViYXVkaW8uZ2l0aHViLmlvL3dlYi1hdWRpby1hcGkvI3RoZS1keW5hbWljc2NvbXByZXNzb3Jub2RlLWludGVyZmFjZVxuICAqL1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihjZmc6IHt9KXtcbiAgICAgICh7XG4gICAgICAgIGF0dGFjazogY29tcHJlc3Nvci5hdHRhY2sgPSAwLjAwMyxcbiAgICAgICAga25lZTogY29tcHJlc3Nvci5rbmVlID0gMzAsXG4gICAgICAgIHJhdGlvOiBjb21wcmVzc29yLnJhdGlvID0gMTIsXG4gICAgICAgIHJlZHVjdGlvbjogY29tcHJlc3Nvci5yZWR1Y3Rpb24gPSAwLFxuICAgICAgICByZWxlYXNlOiBjb21wcmVzc29yLnJlbGVhc2UgPSAwLjI1MCxcbiAgICAgICAgdGhyZXNob2xkOiBjb21wcmVzc29yLnRocmVzaG9sZCA9IC0yNCxcbiAgICAgIH0gPSBjZmcpXG4gICAgfVxuICAgIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IoY2ZnKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbml0RGF0YSgpe1xuICByZXR1cm4gZGF0YVxufVxuXG5leHBvcnQge21hc3RlckdhaW4sIGNvbXByZXNzb3IgYXMgbWFzdGVyQ29tcHJlc3Nvciwgc2V0TWFzdGVyVm9sdW1lLCBnZXRNYXN0ZXJWb2x1bWUsIGdldENvbXByZXNzaW9uUmVkdWN0aW9uLCBlbmFibGVNYXN0ZXJDb21wcmVzc29yLCBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yfVxuIiwiLypcbiAgUmVxdWVzdHMgTUlESSBhY2Nlc3MsIHF1ZXJpZXMgYWxsIGlucHV0cyBhbmQgb3V0cHV0cyBhbmQgc3RvcmVzIHRoZW0gaW4gYWxwaGFiZXRpY2FsIG9yZGVyXG4qL1xuXG5pbXBvcnQge3R5cGVTdHJpbmd9IGZyb20gJy4vdXRpbCdcblxuXG5sZXQgTUlESUFjY2Vzc1xubGV0IGluaXRpYWxpemVkID0gZmFsc2VcbmxldCBpbnB1dHMgPSBbXVxubGV0IG91dHB1dHMgPSBbXVxubGV0IGlucHV0SWRzID0gW11cbmxldCBvdXRwdXRJZHMgPSBbXVxubGV0IGlucHV0c0J5SWQgPSBuZXcgTWFwKClcbmxldCBvdXRwdXRzQnlJZCA9IG5ldyBNYXAoKVxuXG5sZXQgc29uZ01pZGlFdmVudExpc3RlbmVyXG5sZXQgbWlkaUV2ZW50TGlzdGVuZXJJZCA9IDBcblxuXG5mdW5jdGlvbiBnZXRNSURJcG9ydHMoKXtcbiAgaW5wdXRzID0gQXJyYXkuZnJvbShNSURJQWNjZXNzLmlucHV0cy52YWx1ZXMoKSlcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgaW5wdXRzLnNvcnQoKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xKVxuXG4gIGZvcihsZXQgcG9ydCBvZiBpbnB1dHMpe1xuICAgIGlucHV0c0J5SWQuc2V0KHBvcnQuaWQsIHBvcnQpXG4gICAgaW5wdXRJZHMucHVzaChwb3J0LmlkKVxuICB9XG5cbiAgb3V0cHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5vdXRwdXRzLnZhbHVlcygpKVxuXG4gIC8vc29ydCBwb3J0cyBieSBuYW1lIGFzY2VuZGluZ1xuICBvdXRwdXRzLnNvcnQoKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xKVxuXG4gIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgZm9yKGxldCBwb3J0IG9mIG91dHB1dHMpe1xuICAgIC8vY29uc29sZS5sb2cocG9ydC5pZCwgcG9ydC5uYW1lKVxuICAgIG91dHB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KVxuICAgIG91dHB1dElkcy5wdXNoKHBvcnQuaWQpXG4gIH1cbiAgLy9jb25zb2xlLmxvZyhvdXRwdXRzQnlJZClcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdE1JREkoKXtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIGlmKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgcmVzb2x2ZSh7bWlkaTogZmFsc2V9KVxuICAgIH1lbHNlIGlmKHR5cGVvZiBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MgIT09ICd1bmRlZmluZWQnKXtcblxuICAgICAgbGV0IGphenosIG1pZGksIHdlYm1pZGlcblxuICAgICAgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzKCkudGhlbihcblxuICAgICAgICBmdW5jdGlvbiBvbkZ1bEZpbGxlZChtaWRpQWNjZXNzKXtcbiAgICAgICAgICBNSURJQWNjZXNzID0gbWlkaUFjY2Vzc1xuICAgICAgICAgIGlmKHR5cGVvZiBtaWRpQWNjZXNzLl9qYXp6SW5zdGFuY2VzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBqYXp6ID0gbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlc1swXS5fSmF6ei52ZXJzaW9uXG4gICAgICAgICAgICBtaWRpID0gdHJ1ZVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgd2VibWlkaSA9IHRydWVcbiAgICAgICAgICAgIG1pZGkgPSB0cnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZ2V0TUlESXBvcnRzKClcblxuICAgICAgICAgIC8vIG9uY29ubmVjdCBhbmQgb25kaXNjb25uZWN0IGFyZSBub3QgeWV0IGltcGxlbWVudGVkIGluIENocm9tZSBhbmQgQ2hyb21pdW1cbiAgICAgICAgICBtaWRpQWNjZXNzLm9uY29ubmVjdCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBjb25uZWN0ZWQnLCBlKVxuICAgICAgICAgICAgZ2V0TUlESXBvcnRzKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtaWRpQWNjZXNzLm9uZGlzY29ubmVjdCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBkaXNjb25uZWN0ZWQnLCBlKVxuICAgICAgICAgICAgZ2V0TUlESXBvcnRzKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgIGphenosXG4gICAgICAgICAgICBtaWRpLFxuICAgICAgICAgICAgd2VibWlkaSxcbiAgICAgICAgICAgIGlucHV0cyxcbiAgICAgICAgICAgIG91dHB1dHMsXG4gICAgICAgICAgICBpbnB1dHNCeUlkLFxuICAgICAgICAgICAgb3V0cHV0c0J5SWQsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGUpXG4gICAgICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSByZXF1ZXN0aW5nIE1JRElBY2Nlc3MnLCBlKVxuICAgICAgICB9XG4gICAgICApXG4gICAgLy8gYnJvd3NlcnMgd2l0aG91dCBXZWJNSURJIEFQSVxuICAgIH1lbHNle1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICByZXNvbHZlKHttaWRpOiBmYWxzZX0pXG4gICAgfVxuICB9KVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUFjY2VzcyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUFjY2VzcyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gTUlESUFjY2Vzc1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUFjY2VzcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESU91dHB1dHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG91dHB1dHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElPdXRwdXRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElJbnB1dHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElJbnB1dHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGlucHV0c1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0cygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESU91dHB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0SWRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJT3V0cHV0SWRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElJbnB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBpbnB1dElkc1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0SWRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRCeUlkID0gZnVuY3Rpb24oaWQ6IHN0cmluZyl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbihfaWQpe1xuICAgICAgcmV0dXJuIG91dHB1dHNCeUlkLmdldChfaWQpXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJT3V0cHV0QnlJZChpZClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElJbnB1dEJ5SWQgPSBmdW5jdGlvbihpZDogc3RyaW5nKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24oX2lkKXtcbiAgICAgIHJldHVybiBpbnB1dHNCeUlkLmdldChfaWQpXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRCeUlkKGlkKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gaW5pdE1pZGlTb25nKHNvbmcpe1xuXG4gIHNvbmdNaWRpRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGUpe1xuICAgIC8vY29uc29sZS5sb2coZSlcbiAgICBoYW5kbGVNaWRpTWVzc2FnZVNvbmcoc29uZywgZSwgdGhpcyk7XG4gIH07XG5cbiAgLy8gYnkgZGVmYXVsdCBhIHNvbmcgbGlzdGVucyB0byBhbGwgYXZhaWxhYmxlIG1pZGktaW4gcG9ydHNcbiAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgcG9ydC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG5cbiAgb3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaUlucHV0U29uZyhzb25nLCBpZCwgZmxhZyl7XG4gIGxldCBpbnB1dCA9IGlucHV0cy5nZXQoaWQpO1xuXG4gIGlmKGlucHV0ID09PSB1bmRlZmluZWQpe1xuICAgIHdhcm4oJ25vIG1pZGkgaW5wdXQgd2l0aCBpZCcsIGlkLCAnZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihmbGFnID09PSBmYWxzZSl7XG4gICAgc29uZy5taWRpSW5wdXRzLmRlbGV0ZShpZCk7XG4gICAgaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICB9ZWxzZXtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KGlkLCBpbnB1dCk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaUlucHV0KGlkLCBmbGFnKTtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpT3V0cHV0U29uZyhzb25nLCBpZCwgZmxhZyl7XG4gIGxldCBvdXRwdXQgPSBvdXRwdXRzLmdldChpZCk7XG5cbiAgaWYob3V0cHV0ID09PSB1bmRlZmluZWQpe1xuICAgIHdhcm4oJ25vIG1pZGkgb3V0cHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaU91dHB1dHMuZGVsZXRlKGlkKTtcbiAgICBsZXQgdGltZSA9IHNvbmcuc2NoZWR1bGVyLmxhc3RFdmVudFRpbWUgKyAxMDA7XG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aW1lKTsgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWUpOyAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQoaWQsIG91dHB1dCk7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpT3V0cHV0KGlkLCBmbGFnKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBtaWRpTWVzc2FnZUV2ZW50LCBpbnB1dCl7XG4gIGxldCBtaWRpRXZlbnQgPSBuZXcgTWlkaUV2ZW50KHNvbmcudGlja3MsIC4uLm1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIC8vY29uc29sZS5sb2codHJhY2subWlkaUlucHV0cywgaW5wdXQpO1xuXG5cbiAgICAvL2lmKG1pZGlFdmVudC5jaGFubmVsID09PSB0cmFjay5jaGFubmVsIHx8IHRyYWNrLmNoYW5uZWwgPT09IDAgfHwgdHJhY2suY2hhbm5lbCA9PT0gJ2FueScpe1xuICAgIC8vICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2spO1xuICAgIC8vfVxuXG5cbiAgICAvLyBsaWtlIGluIEN1YmFzZSwgbWlkaSBldmVudHMgZnJvbSBhbGwgZGV2aWNlcywgc2VudCBvbiBhbnkgbWlkaSBjaGFubmVsIGFyZSBmb3J3YXJkZWQgdG8gYWxsIHRyYWNrc1xuICAgIC8vIHNldCB0cmFjay5tb25pdG9yIHRvIGZhbHNlIGlmIHlvdSBkb24ndCB3YW50IHRvIHJlY2VpdmUgbWlkaSBldmVudHMgb24gYSBjZXJ0YWluIHRyYWNrXG4gICAgLy8gbm90ZSB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYnkgZGVmYXVsdCBzZXQgdG8gZmFsc2UgYW5kIHRoYXQgdHJhY2subW9uaXRvciBpcyBhdXRvbWF0aWNhbGx5IHNldCB0byB0cnVlXG4gICAgLy8gaWYgeW91IGFyZSByZWNvcmRpbmcgb24gdGhhdCB0cmFja1xuICAgIC8vY29uc29sZS5sb2codHJhY2subW9uaXRvciwgdHJhY2suaWQsIGlucHV0LmlkKTtcbiAgICBpZih0cmFjay5tb25pdG9yID09PSB0cnVlICYmIHRyYWNrLm1pZGlJbnB1dHMuZ2V0KGlucHV0LmlkKSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjaywgaW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBsaXN0ZW5lcnMgPSBzb25nLm1pZGlFdmVudExpc3RlbmVycy5nZXQobWlkaUV2ZW50LnR5cGUpO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgZm9yKGxldCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpe1xuICAgICAgbGlzdGVuZXIobWlkaUV2ZW50LCBpbnB1dCk7XG4gICAgfVxuICB9XG59XG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayh0cmFjaywgbWlkaUV2ZW50LCBpbnB1dCl7XG4gIGxldCBzb25nID0gdHJhY2suc29uZyxcbiAgICBub3RlLCBsaXN0ZW5lcnMsIGNoYW5uZWw7XG4gICAgLy9kYXRhID0gbWlkaU1lc3NhZ2VFdmVudC5kYXRhLFxuICAgIC8vbWlkaUV2ZW50ID0gY3JlYXRlTWlkaUV2ZW50KHNvbmcudGlja3MsIGRhdGFbMF0sIGRhdGFbMV0sIGRhdGFbMl0pO1xuXG4gIC8vbWlkaUV2ZW50LnNvdXJjZSA9IG1pZGlNZXNzYWdlRXZlbnQuc3JjRWxlbWVudC5uYW1lO1xuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQpXG4gIC8vY29uc29sZS5sb2coJy0tLS0+JywgbWlkaUV2ZW50LnR5cGUpO1xuXG4gIC8vIGFkZCB0aGUgZXhhY3QgdGltZSBvZiB0aGlzIGV2ZW50IHNvIHdlIGNhbiBjYWxjdWxhdGUgaXRzIHRpY2tzIHBvc2l0aW9uXG4gIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMDsgLy8gbWlsbGlzXG4gIG1pZGlFdmVudC5zdGF0ZSA9ICdyZWNvcmRlZCc7XG5cbiAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgbm90ZSA9IGNyZWF0ZU1pZGlOb3RlKG1pZGlFdmVudCk7XG4gICAgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXSA9IG5vdGU7XG4gICAgLy90cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdID0gbm90ZTtcbiAgfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgbm90ZSA9IHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy8gY2hlY2sgaWYgdGhlIG5vdGUgZXhpc3RzOiBpZiB0aGUgdXNlciBwbGF5cyBub3RlcyBvbiBoZXIga2V5Ym9hcmQgYmVmb3JlIHRoZSBtaWRpIHN5c3RlbSBoYXNcbiAgICAvLyBiZWVuIGZ1bGx5IGluaXRpYWxpemVkLCBpdCBjYW4gaGFwcGVuIHRoYXQgdGhlIGZpcnN0IGluY29taW5nIG1pZGkgZXZlbnQgaXMgYSBOT1RFIE9GRiBldmVudFxuICAgIGlmKG5vdGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5vdGUuYWRkTm90ZU9mZihtaWRpRXZlbnQpO1xuICAgIGRlbGV0ZSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vZGVsZXRlIHRyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF07XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKHNvbmcucHJlcm9sbCwgc29uZy5yZWNvcmRpbmcsIHRyYWNrLnJlY29yZEVuYWJsZWQpO1xuXG4gIGlmKChzb25nLnByZXJvbGxpbmcgfHwgc29uZy5yZWNvcmRpbmcpICYmIHRyYWNrLnJlY29yZEVuYWJsZWQgPT09ICdtaWRpJyl7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICB0cmFjay5zb25nLnJlY29yZGVkTm90ZXMucHVzaChub3RlKTtcbiAgICB9XG4gICAgdHJhY2sucmVjb3JkUGFydC5hZGRFdmVudChtaWRpRXZlbnQpO1xuICAgIC8vIHNvbmcucmVjb3JkZWRFdmVudHMgaXMgdXNlZCBpbiB0aGUga2V5IGVkaXRvclxuICAgIHRyYWNrLnNvbmcucmVjb3JkZWRFdmVudHMucHVzaChtaWRpRXZlbnQpO1xuICB9ZWxzZSBpZih0cmFjay5lbmFibGVSZXRyb3NwZWN0aXZlUmVjb3JkaW5nKXtcbiAgICB0cmFjay5yZXRyb3NwZWN0aXZlUmVjb3JkaW5nLnB1c2gobWlkaUV2ZW50KTtcbiAgfVxuXG4gIC8vIGNhbGwgYWxsIG1pZGkgZXZlbnQgbGlzdGVuZXJzXG4gIGxpc3RlbmVycyA9IHRyYWNrLm1pZGlFdmVudExpc3RlbmVyc1ttaWRpRXZlbnQudHlwZV07XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBvYmplY3RGb3JFYWNoKGxpc3RlbmVycywgZnVuY3Rpb24obGlzdGVuZXIpe1xuICAgICAgbGlzdGVuZXIobWlkaUV2ZW50LCBpbnB1dCk7XG4gICAgfSk7XG4gIH1cblxuICBjaGFubmVsID0gdHJhY2suY2hhbm5lbDtcbiAgaWYoY2hhbm5lbCA9PT0gJ2FueScgfHwgY2hhbm5lbCA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKGNoYW5uZWwpID09PSB0cnVlKXtcbiAgICBjaGFubmVsID0gMDtcbiAgfVxuXG4gIG9iamVjdEZvckVhY2godHJhY2subWlkaU91dHB1dHMsIGZ1bmN0aW9uKG91dHB1dCl7XG4gICAgLy9jb25zb2xlLmxvZygnbWlkaSBvdXQnLCBvdXRwdXQsIG1pZGlFdmVudC50eXBlKTtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4IHx8IG1pZGlFdmVudC50eXBlID09PSAxNDQgfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMik7XG4gICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gICAgLy8gfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE5Mil7XG4gICAgLy8gICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMV0pO1xuICAgIH1cbiAgICAvL291dHB1dC5zZW5kKFttaWRpRXZlbnQuc3RhdHVzICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgfSk7XG5cbiAgLy8gQFRPRE86IG1heWJlIGEgdHJhY2sgc2hvdWxkIGJlIGFibGUgdG8gc2VuZCBpdHMgZXZlbnQgdG8gYm90aCBhIG1pZGktb3V0IHBvcnQgYW5kIGFuIGludGVybmFsIGhlYXJ0YmVhdCBzb25nP1xuICAvL2NvbnNvbGUubG9nKHRyYWNrLnJvdXRlVG9NaWRpT3V0KTtcbiAgaWYodHJhY2sucm91dGVUb01pZGlPdXQgPT09IGZhbHNlKXtcbiAgICBtaWRpRXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICB0cmFjay5pbnN0cnVtZW50LnByb2Nlc3NFdmVudChtaWRpRXZlbnQpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gYWRkTWlkaUV2ZW50TGlzdGVuZXIoLi4uYXJncyl7IC8vIGNhbGxlciBjYW4gYmUgYSB0cmFjayBvciBhIHNvbmdcblxuICBsZXQgaWQgPSBtaWRpRXZlbnRMaXN0ZW5lcklkKys7XG4gIGxldCBsaXN0ZW5lcjtcbiAgICB0eXBlcyA9IHt9LFxuICAgIGlkcyA9IFtdLFxuICAgIGxvb3A7XG5cblxuICAvLyBzaG91bGQgSSBpbmxpbmUgdGhpcz9cbiAgbG9vcCA9IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgIGZvcihsZXQgYXJnIG9mIGFyZ3Mpe1xuICAgICAgbGV0IHR5cGUgPSB0eXBlU3RyaW5nKGFyZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgICAgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgIGxvb3AoYXJnKTtcbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdmdW5jdGlvbicpe1xuICAgICAgICBsaXN0ZW5lciA9IGFyZztcbiAgICAgIH1lbHNlIGlmKGlzTmFOKGFyZykgPT09IGZhbHNlKXtcbiAgICAgICAgYXJnID0gcGFyc2VJbnQoYXJnLCAxMCk7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpe1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIGFyZyA9IHNlcXVlbmNlci5taWRpRXZlbnROdW1iZXJCeU5hbWUoYXJnKTtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGxvb3AoYXJncywgMCwgYXJncy5sZW5ndGgpO1xuICAvL2NvbnNvbGUubG9nKCd0eXBlcycsIHR5cGVzLCAnbGlzdGVuZXInLCBsaXN0ZW5lcik7XG5cbiAgb2JqZWN0Rm9yRWFjaCh0eXBlcywgZnVuY3Rpb24odHlwZSl7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICBpZihvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID09PSB1bmRlZmluZWQpe1xuICAgICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9IHt9O1xuICAgIH1cbiAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdW2lkXSA9IGxpc3RlbmVyO1xuICAgIGlkcy5wdXNoKHR5cGUgKyAnXycgKyBpZCk7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2cob2JqLm1pZGlFdmVudExpc3RlbmVycyk7XG4gIHJldHVybiBpZHMubGVuZ3RoID09PSAxID8gaWRzWzBdIDogaWRzO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVyKGlkLCBvYmope1xuICB2YXIgdHlwZTtcbiAgaWQgPSBpZC5zcGxpdCgnXycpO1xuICB0eXBlID0gaWRbMF07XG4gIGlkID0gaWRbMV07XG4gIGRlbGV0ZSBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdW2lkXTtcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcnMoKXtcblxufVxuXG4qL1xuIiwiaW1wb3J0IHtjcmVhdGVTYW1wbGV9IGZyb20gJy4vc2FtcGxlJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge2NyZWF0ZU5vdGV9IGZyb20gJy4vbm90ZSdcbmltcG9ydCB7cGFyc2VTYW1wbGVzMn0gZnJvbSAnLi9wYXJzZV9hdWRpbydcbmltcG9ydCB7dHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5cblxuY29uc3QgcHBxID0gNDgwXG5jb25zdCBicG0gPSAxMjBcbmNvbnN0IHBsYXliYWNrU3BlZWQgPSAxXG5jb25zdCBtaWxsaXNQZXJUaWNrID0gKDEgLyBwbGF5YmFja1NwZWVkICogNjApIC8gYnBtIC8gcHBxXG5cbmV4cG9ydCBjbGFzcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHR5cGU6IHN0cmluZyl7XG4gICAgdGhpcy5pZCA9IGlkXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIC8vIGNyZWF0ZSBhIHNhbXBsZXMgZGF0YSBvYmplY3QgZm9yIGFsbCAxMjggdmVsb2NpdHkgbGV2ZWxzIG9mIGFsbCAxMjggbm90ZXNcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSk7XG4gICAgdGhpcy5zYW1wbGVzRGF0YSA9IHRoaXMuc2FtcGxlc0RhdGEubWFwKGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSB7fVxuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgfVxuXG4gIGNvbm5lY3Qob3V0cHV0KXtcbiAgICB0aGlzLm91dHB1dCA9IG91dHB1dFxuICB9XG5cbiAgZGlzY29ubmVjdCgpe1xuICAgIHRoaXMub3V0cHV0ID0gbnVsbFxuICB9XG5cbiAgcHJvY2Vzc01JRElFdmVudChldmVudCwgdGltZSl7XG4gICAgbGV0IHNhbXBsZSwgc2FtcGxlRGF0YVxuICAgIHRpbWUgPSB0aW1lIHx8IGNvbnRleHQuY3VycmVudFRpbWUgKyAoZXZlbnQudGlja3MgKiBtaWxsaXNQZXJUaWNrKVxuICAgIC8vY29uc29sZS5sb2codGltZSlcblxuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAvL2NvbnNvbGUubG9nKDE0NCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG5cbiAgICAgIHNhbXBsZURhdGEgPSB0aGlzLnNhbXBsZXNEYXRhW2V2ZW50LmRhdGExXVtldmVudC5kYXRhMl07XG4gICAgICBzYW1wbGUgPSBjcmVhdGVTYW1wbGUoc2FtcGxlRGF0YSwgZXZlbnQpXG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbZXZlbnQubWlkaU5vdGVJZF0gPSBzYW1wbGVcbiAgICAgIHNhbXBsZS5vdXRwdXQuY29ubmVjdCh0aGlzLm91dHB1dCB8fCBjb250ZXh0LmRlc3RpbmF0aW9uKVxuICAgICAgLy8gc2FtcGxlLnNvdXJjZS5vbmVuZGVkID0gKCkgPT4ge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnICAgIGRlbGV0aW5nJywgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIC8vICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXVxuICAgICAgLy8gfVxuICAgICAgc2FtcGxlLnN0YXJ0KHRpbWUpXG4gICAgICAvL2NvbnNvbGUubG9nKCdzY2hlZHVsaW5nJywgZXZlbnQuaWQsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAvL2NvbnNvbGUubG9nKCdzdGFydCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vY29uc29sZS5sb2coMTI4LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcbiAgICAgIHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXVxuICAgICAgaWYodHlwZW9mIHNhbXBsZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbygnc2FtcGxlIG5vdCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZCwgJyBtaWRpTm90ZScsIGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLnB1c2goZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIH1lbHNle1xuICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIHRpbWUsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXVxuICAgICAgICB9KVxuICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICB9XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vIHN1c3RhaW4gcGVkYWxcbiAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IHRydWVcbiAgICAgICAgICAvLy8qXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgIGRhdGE6ICdkb3duJ1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8qL1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgZG93bicpXG4gICAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5mb3JFYWNoKChtaWRpTm90ZUlkKSA9PiB7XG4gICAgICAgICAgICBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbbWlkaU5vdGVJZF1cbiAgICAgICAgICAgIGlmKHNhbXBsZSl7XG4gICAgICAgICAgICAgIC8vc2FtcGxlLnN0b3AodGltZSlcbiAgICAgICAgICAgICAgc2FtcGxlLnN0b3AodGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3AnLCBtaWRpTm90ZUlkKVxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbbWlkaU5vdGVJZF1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgdXAnLCB0aGlzLnN1c3RhaW5lZFNhbXBsZXMpXG4gICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICAgICAgICAvLy8qXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgIGRhdGE6ICd1cCdcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vKi9cbiAgICAgICAgICAvL3RoaXMuc3RvcFN1c3RhaW4odGltZSk7XG4gICAgICAgIH1cblxuICAgICAgLy8gcGFubmluZ1xuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTEgPT09IDEwKXtcbiAgICAgICAgLy8gcGFubmluZyBpcyAqbm90KiBleGFjdGx5IHRpbWVkIC0+IG5vdCBwb3NzaWJsZSAoeWV0KSB3aXRoIFdlYkF1ZGlvXG4gICAgICAgIC8vY29uc29sZS5sb2coZGF0YTIsIHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG4gICAgICAgIC8vdHJhY2suc2V0UGFubmluZyhyZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuXG4gICAgICAvLyB2b2x1bWVcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGExID09PSA3KXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBsb2FkIGFuZCBwYXJzZVxuICBwYXJzZVNhbXBsZURhdGEoZGF0YSl7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcGFyc2VTYW1wbGVzMihkYXRhKVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuXG4gICAgICAgIGlmKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdC5mb3JFYWNoKChzYW1wbGUpID0+IHtcbiAgICAgICAgICBsZXQgc2FtcGxlRGF0YSA9IGRhdGFbc2FtcGxlLmlkXVxuICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgICBidWZmZXI6IHNhbXBsZS5idWZmZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gc2FtcGxlLmJ1ZmZlclxuICAgICAgICAgIH1cbiAgICAgICAgICBzYW1wbGVEYXRhLm5vdGUgPSBzYW1wbGUuaWRcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcbiAgICAgICAgfSlcblxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qXG4gICAgQHBhcmFtIGNvbmZpZyAob3B0aW9uYWwpXG4gICAgICB7XG4gICAgICAgIG5vdGU6IGNhbiBiZSBub3RlIG5hbWUgKEM0KSBvciBub3RlIG51bWJlciAoNjApXG4gICAgICAgIGJ1ZmZlcjogQXVkaW9CdWZmZXJcbiAgICAgICAgc3VzdGFpbjogW3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZF0sIC8vIG9wdGlvbmFsLCBpbiBtaWxsaXNcbiAgICAgICAgcmVsZWFzZTogW3JlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlXSwgLy8gb3B0aW9uYWxcbiAgICAgICAgcGFuOiBwYW5Qb3NpdGlvbiAvLyBvcHRpb25hbFxuICAgICAgICB2ZWxvY2l0eTogW3ZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kXSAvLyBvcHRpb25hbCwgZm9yIG11bHRpLWxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgIH1cbiAgKi9cbiAgdXBkYXRlU2FtcGxlRGF0YSguLi5kYXRhKXtcbiAgICBkYXRhLmZvckVhY2gobm90ZURhdGEgPT4gdGhpcy5fdXBkYXRlU2FtcGxlRGF0YShub3RlRGF0YSkpXG4gIH1cblxuICBfdXBkYXRlU2FtcGxlRGF0YShkYXRhID0ge30pe1xuICAgIGxldCB7XG4gICAgICBub3RlLFxuICAgICAgYnVmZmVyID0gbnVsbCxcbiAgICAgIHN1c3RhaW4gPSBbbnVsbCwgbnVsbF0sXG4gICAgICByZWxlYXNlID0gW251bGwsICdsaW5lYXInXSxcbiAgICAgIHBhbiA9IG51bGwsXG4gICAgICB2ZWxvY2l0eSA9IFswLCAxMjddLFxuICAgIH0gPSBkYXRhXG5cbiAgICBpZih0eXBlb2Ygbm90ZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG5vdGVudW1iZXIgb3IgYSBub3RlbmFtZScpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBnZXQgbm90ZW51bWJlciBmcm9tIG5vdGVuYW1lIGFuZCBjaGVjayBpZiB0aGUgbm90ZW51bWJlciBpcyB2YWxpZFxuICAgIGxldCBuID0gY3JlYXRlTm90ZShub3RlKVxuICAgIGlmKG4gPT09IGZhbHNlKXtcbiAgICAgIGNvbnNvbGUud2Fybignbm90IGEgdmFsaWQgbm90ZSBpZCcpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbm90ZSA9IG4ubnVtYmVyXG5cbiAgICBsZXQgW3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZF0gPSBzdXN0YWluXG4gICAgbGV0IFtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZV0gPSByZWxlYXNlXG4gICAgbGV0IFt2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZF0gPSB2ZWxvY2l0eVxuXG4gICAgaWYoc3VzdGFpbi5sZW5ndGggIT09IDIpe1xuICAgICAgc3VzdGFpblN0YXJ0ID0gc3VzdGFpbkVuZCA9IG51bGxcbiAgICB9XG5cbiAgICBpZihyZWxlYXNlRHVyYXRpb24gPT09IG51bGwpe1xuICAgICAgcmVsZWFzZUVudmVsb3BlID0gbnVsbFxuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKG5vdGVJZCwgYnVmZmVyKTtcbiAgICAvLyBjb25zb2xlLmxvZyhzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmQpO1xuICAgIC8vIGNvbnNvbGUubG9nKHJlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlKTtcbiAgICAvLyBjb25zb2xlLmxvZyhwYW4pO1xuICAgIC8vIGNvbnNvbGUubG9nKHZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kKTtcblxuXG4gICAgdGhpcy5zYW1wbGVzRGF0YVtub3RlXS5mb3JFYWNoKChzYW1wbGVEYXRhLCBpKSA9PiB7XG4gICAgICBpZihpID49IHZlbG9jaXR5U3RhcnQgJiYgaSA8IHZlbG9jaXR5RW5kKXtcbiAgICAgICAgaWYoc2FtcGxlRGF0YSA9PT0gLTEpe1xuICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICBpZDogbm90ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gYnVmZmVyIHx8IHNhbXBsZURhdGEuYnVmZmVyXG4gICAgICAgIHNhbXBsZURhdGEuc3VzdGFpblN0YXJ0ID0gc3VzdGFpblN0YXJ0IHx8IHNhbXBsZURhdGEuc3VzdGFpblN0YXJ0XG4gICAgICAgIHNhbXBsZURhdGEuc3VzdGFpbkVuZCA9IHN1c3RhaW5FbmQgfHwgc2FtcGxlRGF0YS5zdXN0YWluRW5kXG4gICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uID0gcmVsZWFzZUR1cmF0aW9uIHx8IHNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uXG4gICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gcmVsZWFzZUVudmVsb3BlIHx8IHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlXG4gICAgICAgIHNhbXBsZURhdGEucGFuID0gcGFuIHx8IHNhbXBsZURhdGEucGFuXG5cbiAgICAgICAgaWYodHlwZVN0cmluZyhzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSkgPT09ICdhcnJheScpe1xuICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXkgPSBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZVxuICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gJ2FycmF5J1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBkZWxldGUgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVBcnJheVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV1baV0gPSBzYW1wbGVEYXRhXG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV0pO1xuICB9XG5cblxuICAvLyBzdGVyZW8gc3ByZWFkXG4gIHNldEtleVNjYWxpbmdQYW5uaW5nKCl7XG4gICAgLy8gc2V0cyBwYW5uaW5nIGJhc2VkIG9uIHRoZSBrZXkgdmFsdWUsIGUuZy4gaGlnaGVyIG5vdGVzIGFyZSBwYW5uZWQgbW9yZSB0byB0aGUgcmlnaHQgYW5kIGxvd2VyIG5vdGVzIG1vcmUgdG8gdGhlIGxlZnRcbiAgfVxuXG4gIHNldEtleVNjYWxpbmdSZWxlYXNlKCl7XG4gICAgLy8gc2V0IHJlbGVhc2UgYmFzZWQgb24ga2V5IHZhbHVlXG4gIH1cblxuICAvKlxuICAgIEBkdXJhdGlvbjogbWlsbGlzZWNvbmRzXG4gICAgQGVudmVsb3BlOiBsaW5lYXIgfCBlcXVhbF9wb3dlciB8IGFycmF5IG9mIGludCB2YWx1ZXNcbiAgKi9cbiAgc2V0UmVsZWFzZShkdXJhdGlvbjogbnVtYmVyLCBlbnZlbG9wZSl7XG4gICAgLy8gc2V0IHJlbGVhc2UgZm9yIGFsbCBrZXlzLCBvdmVycnVsZXMgdmFsdWVzIHNldCBieSBzZXRLZXlTY2FsaW5nUmVsZWFzZSgpXG4gICAgdGhpcy5zYW1wbGVzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZXMsIGkpe1xuICAgICAgc2FtcGxlcy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSl7XG4gICAgICAgIGlmKHNhbXBsZSA9PT0gLTEpe1xuICAgICAgICAgIHNhbXBsZSA9IHtcbiAgICAgICAgICAgIGlkOiBpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNhbXBsZS5yZWxlYXNlRHVyYXRpb24gPSBkdXJhdGlvblxuICAgICAgICBzYW1wbGUucmVsZWFzZUVudmVsb3BlID0gZW52ZWxvcGVcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG5cbiAgYWxsTm90ZXNPZmYoKXtcbiAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXVxuICAgIGlmKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSl7XG4gICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbCcsXG4gICAgICAgIGRhdGE6ICd1cCdcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLnNjaGVkdWxlZFNhbXBsZXMpLmZvckVhY2goKHNhbXBsZUlkKSA9PiB7XG4gICAgICAvL2NvbnNvbGUubG9nKCcgIHN0b3BwaW5nJywgc2FtcGxlSWQsIHRoaXMuaWQpXG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbc2FtcGxlSWRdLnN0b3AoKVxuICAgIH0pXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0ge31cblxuICAgIC8vY29uc29sZS5sb2coJ2FsbE5vdGVzT2ZmJywgdGhpcy5zdXN0YWluZWRTYW1wbGVzLmxlbmd0aCwgdGhpcy5zY2hlZHVsZWRTYW1wbGVzKVxuICB9XG59XG4iLCJpbXBvcnQge1RyYWNrfSBmcm9tICcuL3RyYWNrJ1xuaW1wb3J0IHtQYXJ0fSBmcm9tICcuL3BhcnQnXG5pbXBvcnQge01JRElOb3RlfSBmcm9tICcuL21pZGlfbm90ZSdcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge2NoZWNrTUlESU51bWJlcn0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtjYWxjdWxhdGVQb3NpdGlvbn0gZnJvbSAnLi9wb3NpdGlvbidcbmltcG9ydCB7SW5zdHJ1bWVudH0gZnJvbSAnLi9pbnN0cnVtZW50J1xuaW1wb3J0IHtnZXRJbml0RGF0YX0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5cbmxldFxuICBtZXRob2RNYXAgPSBuZXcgTWFwKFtcbiAgICBbJ3ZvbHVtZScsICdzZXRWb2x1bWUnXSxcbiAgICBbJ2luc3RydW1lbnQnLCAnc2V0SW5zdHJ1bWVudCddLFxuICAgIFsnbm90ZU51bWJlckFjY2VudGVkVGljaycsICdzZXROb3RlTnVtYmVyQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2snXSxcbiAgICBbJ3ZlbG9jaXR5QWNjZW50ZWRUaWNrJywgJ3NldFZlbG9jaXR5QWNjZW50ZWRUaWNrJ10sXG4gICAgWyd2ZWxvY2l0eU5vbkFjY2VudGVkVGljaycsICdzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljayddLFxuICAgIFsnbm90ZUxlbmd0aEFjY2VudGVkVGljaycsICdzZXROb3RlTGVuZ3RoQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snXVxuICBdKTtcblxuZXhwb3J0IGNsYXNzIE1ldHJvbm9tZXtcblxuICBjb25zdHJ1Y3Rvcihzb25nKXtcbiAgICB0aGlzLnNvbmcgPSBzb25nXG4gICAgdGhpcy50cmFjayA9IG5ldyBUcmFjayh0aGlzLnNvbmcuaWQgKyAnX21ldHJvbm9tZScpXG4gICAgdGhpcy5wYXJ0ID0gbmV3IFBhcnQoKVxuICAgIHRoaXMudHJhY2suYWRkUGFydHModGhpcy5wYXJ0KVxuICAgIHRoaXMudHJhY2suY29ubmVjdCh0aGlzLnNvbmcuX291dHB1dClcblxuICAgIHRoaXMuZXZlbnRzID0gW11cbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gW11cbiAgICB0aGlzLnByZWNvdW50RHVyYXRpb25Jbk1pbGxpcyA9IDBcbiAgICB0aGlzLmJhcnMgPSAwXG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cblxuICByZXNldCgpe1xuXG4gICAgbGV0IGRhdGEgPSBnZXRJbml0RGF0YSgpXG4gICAgbGV0IGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudCgnbWV0cm9ub21lJylcbiAgICBpbnN0cnVtZW50LnVwZGF0ZVNhbXBsZURhdGEoe1xuICAgICAgbm90ZTogNjAsXG4gICAgICBidWZmZXI6IGRhdGEubG93dGljayxcbiAgICB9LCB7XG4gICAgICBub3RlOiA2MSxcbiAgICAgIGJ1ZmZlcjogZGF0YS5oaWdodGljayxcbiAgICB9KVxuICAgIHRoaXMudHJhY2suc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KVxuXG4gICAgdGhpcy52b2x1bWUgPSAxXG5cbiAgICB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA9IDYxXG4gICAgdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWQgPSA2MFxuXG4gICAgdGhpcy52ZWxvY2l0eUFjY2VudGVkID0gMTAwXG4gICAgdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkID0gMTAwXG5cbiAgICB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA9IHRoaXMuc29uZy5wcHEgLyA0IC8vIHNpeHRlZW50aCBub3RlcyAtPiBkb24ndCBtYWtlIHRoaXMgdG9vIHNob3J0IGlmIHlvdXIgc2FtcGxlIGhhcyBhIGxvbmcgYXR0YWNrIVxuICAgIHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkID0gdGhpcy5zb25nLnBwcSAvIDRcbiAgfVxuXG4gIGNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZCA9ICdpbml0Jyl7XG4gICAgbGV0IGksIGpcbiAgICBsZXQgcG9zaXRpb25cbiAgICBsZXQgdmVsb2NpdHlcbiAgICBsZXQgbm90ZUxlbmd0aFxuICAgIGxldCBub3RlTnVtYmVyXG4gICAgbGV0IGJlYXRzUGVyQmFyXG4gICAgbGV0IHRpY2tzUGVyQmVhdFxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgbm90ZU9uLCBub3RlT2ZmXG5cbiAgICB0aGlzLmV2ZW50cyA9IFtdXG5cbiAgICAvL2NvbnNvbGUubG9nKHN0YXJ0QmFyLCBlbmRCYXIpO1xuXG4gICAgZm9yKGkgPSBzdGFydEJhcjsgaSA8PSBlbmRCYXI7IGkrKyl7XG4gICAgICBwb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgICAgdGFyZ2V0OiBbaV0sXG4gICAgICB9KVxuXG4gICAgICBiZWF0c1BlckJhciA9IHBvc2l0aW9uLm5vbWluYXRvclxuICAgICAgdGlja3NQZXJCZWF0ID0gcG9zaXRpb24udGlja3NQZXJCZWF0XG5cbiAgICAgIGZvcihqID0gMDsgaiA8IGJlYXRzUGVyQmFyOyBqKyspe1xuXG4gICAgICAgIG5vdGVOdW1iZXIgPSBqID09PSAwID8gdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgOiB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZFxuICAgICAgICBub3RlTGVuZ3RoID0gaiA9PT0gMCA/IHRoaXMubm90ZUxlbmd0aEFjY2VudGVkIDogdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWRcbiAgICAgICAgdmVsb2NpdHkgPSBqID09PSAwID8gdGhpcy52ZWxvY2l0eUFjY2VudGVkIDogdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkXG5cbiAgICAgICAgbm90ZU9uID0gbmV3IE1JRElFdmVudCh0aWNrcywgMTQ0LCBub3RlTnVtYmVyLCB2ZWxvY2l0eSlcbiAgICAgICAgbm90ZU9mZiA9IG5ldyBNSURJRXZlbnQodGlja3MgKyBub3RlTGVuZ3RoLCAxMjgsIG5vdGVOdW1iZXIsIDApXG5cbiAgICAgICAgaWYoaWQgPT09ICdwcmVjb3VudCcpe1xuICAgICAgICAgIG5vdGVPbi5fcGFydCA9IHtpZDogJ3ByZWNvdW50J31cbiAgICAgICAgICBub3RlT2ZmLl9wYXJ0ID0ge2lkOiAncHJlY291bnQnfVxuICAgICAgICAgIG5vdGVPbi5fdHJhY2sgPSB0aGlzLnRyYWNrXG4gICAgICAgICAgbm90ZU9mZi5fdHJhY2sgPSB0aGlzLnRyYWNrXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBhcnQuYWRkRXZlbnRzKG5vdGVPbiwgbm90ZU9mZilcbiAgICAgICAgdGhpcy5ldmVudHMucHVzaChub3RlT24sIG5vdGVPZmYpXG4gICAgICAgIC8vY29uc29sZS5sb2cobm90ZU9uLmlkKVxuICAgICAgICAvL2NvbnNvbGUubG9nKG5vdGVPZmYuaWQpXG4gICAgICAgIHRpY2tzICs9IHRpY2tzUGVyQmVhdFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKHN0YXJ0QmFyID0gMSwgZW5kQmFyID0gdGhpcy5zb25nLmJhcnMsIGlkID0gJ2luaXQnKXtcbiAgICB0aGlzLnBhcnQucmVtb3ZlRXZlbnRzKHRoaXMucGFydC5nZXRFdmVudHMoKSlcbiAgICB0aGlzLmNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZClcbiAgICB0aGlzLmJhcnMgPSB0aGlzLnNvbmcuYmFyc1xuICAgIGNvbnNvbGUubG9nKCdnZXRFdmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICByZXR1cm4gdGhpcy5ldmVudHNcbiAgfVxuXG5cbiAgY3JlYXRlUHJlY291bnRFdmVudHMocHJlY291bnQpe1xuICAgIGlmKHByZWNvdW50IDw9IDApe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgZW5kUG9zID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcy5zb25nLCB7XG4gICAgICBiYXJzYmVhdHM6IFt0aGlzLnNvbmcuYmFyICsgcHJlY291bnRdLFxuICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgfSlcblxuICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIHRoaXMubWlsbGlzID0gMDtcbiAgICB0aGlzLnN0YXJ0TWlsbGlzID0gdGhpcy5zb25nLl9taWxsaXM7XG4gICAgdGhpcy5wcmVjb3VudER1cmF0aW9uSW5NaWxsaXMgPSBlbmRQb3MubWlsbGlzIC0gdGhpcy5zdGFydE1pbGxpcztcbiAgICAvL0B0b2RvOiBmaXggdGhpcyB1cFxuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyh0aGlzLCB0aGlzLnNvbmcuYmFyLCBlbmRQb3MuYmFyIC0gMSwgJ3ByZWNvdW50Jyk7XG4gICAgLy9wYXJzZUV2ZW50cyh0aGlzLnNvbmcsIHRoaXMucHJlY291bnRFdmVudHMpXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvbmcuYmFyLCBlbmRQb3MuYmFyLCBwcmVjb3VudCwgdGhpcy5wcmVjb3VudEV2ZW50cy5sZW5ndGgpO1xuICAgIC8vY29uc29sZS5sb2codGhpcy5wcmVjb3VudEV2ZW50cywgdGhpcy5wcmVjb3VudER1cmF0aW9uSW5NaWxsaXMsIHN0YXJ0VGlja3MsIGVuZFRpY2tzKTtcbiAgfVxuXG5cbiAgLy8gY2FsbGVkIGJ5IHNjaGVkdWxlci5qc1xuICBnZXRQcmVjb3VudEV2ZW50cyhtYXh0aW1lKXtcbiAgICBsZXQgZXZlbnRzID0gdGhpcy5wcmVjb3VudEV2ZW50cyxcbiAgICAgIG1heGkgPSBldmVudHMubGVuZ3RoLCBpLCBldnQsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICAgIC8vY29uc29sZS5sb2cobWF4dGltZSwgbWF4aSwgdGhpcy5pbmRleCwgdGhpcy5taWxsaXMpO1xuXG4gICAgZm9yKGkgPSB0aGlzLmluZGV4OyBpIDwgbWF4aTsgaSsrKXtcbiAgICAgIGV2dCA9IGV2ZW50c1tpXTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCBtYXh0aW1lLCB0aGlzLm1pbGxpcyk7XG4gICAgICBpZihldnQubWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgIGV2dC50aW1lID0gdGhpcy5zdGFydFRpbWUgKyBldnQubWlsbGlzO1xuICAgICAgICByZXN1bHQucHVzaChldnQpO1xuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuXG4gIG11dGUoZmxhZyl7XG4gICAgdGhpcy50cmFjay5tdXRlZCA9IGZsYWdcbiAgfVxuXG5cbiAgYWxsTm90ZXNPZmYoKXtcbiAgICB0aGlzLnRyYWNrLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgfVxuXG5cbiAgLy8gPT09PT09PT09PT0gQ09ORklHVVJBVElPTiA9PT09PT09PT09PVxuXG4gIHVwZGF0ZUNvbmZpZygpe1xuICAgIHRoaXMuaW5pdCgxLCB0aGlzLmJhcnMsICd1cGRhdGUnKTtcbiAgICB0aGlzLmFsbE5vdGVzT2ZmKCk7XG4gICAgdGhpcy5zb25nLl9zY2hlZHVsZXIudXBkYXRlU29uZygpO1xuICB9XG5cbiAgLy8gYWRkZWQgdG8gcHVibGljIEFQSTogU29uZy5jb25maWd1cmVNZXRyb25vbWUoe30pXG4gIGNvbmZpZ3VyZShjb25maWcpe1xuXG4gICAgT2JqZWN0LmtleXMoY29uZmlnKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICB0aGlzW21ldGhvZE1hcC5nZXQoa2V5KV0oY29uZmlnLmtleSk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRJbnN0cnVtZW50KGluc3RydW1lbnQpe1xuICAgIGlmKCFpbnN0cnVtZW50IGluc3RhbmNlb2YgSW5zdHJ1bWVudCl7XG4gICAgICBjb25zb2xlLndhcm4oJ25vdCBhbiBpbnN0YW5jZSBvZiBJbnN0cnVtZW50JylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnRyYWNrLnNldEluc3RydW1lbnQoaW5zdHJ1bWVudClcbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXROb3RlTGVuZ3RoQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICBpZihpc05hTih2YWx1ZSkpe1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA9IHZhbHVlO1xuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0VmVsb2NpdHlBY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy52ZWxvY2l0eUFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldFZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICB2YWx1ZSA9IGNoZWNrTUlESU51bWJlcih2YWx1ZSk7XG4gICAgaWYodmFsdWUgIT09IGZhbHNlKXtcbiAgICAgIHRoaXMudmVsb2NpdHlOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXROb3RlTnVtYmVyQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICB2YWx1ZSA9IGNoZWNrTUlESU51bWJlcih2YWx1ZSk7XG4gICAgaWYodmFsdWUgIT09IGZhbHNlKXtcbiAgICAgIHRoaXMubm90ZU51bWJlckFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Vm9sdW1lKHZhbHVlKXtcbiAgICB0aGlzLnRyYWNrLnNldFZvbHVtZSh2YWx1ZSk7XG4gIH1cbn1cblxuIiwiLy8gQCBmbG93XG5cbmxldCBtaWRpRXZlbnRJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIE1JRElFdmVudHtcblxuICBjb25zdHJ1Y3Rvcih0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXIgPSAtMSl7XG4gICAgdGhpcy5pZCA9IGBNRV8ke21pZGlFdmVudEluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMudGlja3MgPSB0aWNrc1xuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLmRhdGExID0gZGF0YTFcbiAgICB0aGlzLmRhdGEyID0gZGF0YTJcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IDQ0MCAqIE1hdGgucG93KDIsIChkYXRhMSAtIDY5KSAvIDEyKVxuXG4gICAgaWYoZGF0YTEgPT09IDE0NCAmJiBkYXRhMiA9PT0gMCl7XG4gICAgICB0aGlzLmRhdGExID0gMTI4XG4gICAgfVxuXG4gICAgdGhpcy5fcGFydCA9IG51bGxcbiAgICB0aGlzLl90cmFjayA9IG51bGxcbiAgICB0aGlzLl9zb25nID0gbnVsbFxuICAgIC8vQFRPRE86IGFkZCBhbGwgb3RoZXIgcHJvcGVydGllc1xuICB9XG5cbiAgY29weSgpe1xuICAgIGxldCBtID0gbmV3IE1JRElFdmVudCh0aGlzLnRpY2tzLCB0aGlzLnR5cGUsIHRoaXMuZGF0YTEsIHRoaXMuZGF0YTIpXG4gICAgcmV0dXJuIG1cbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcil7IC8vIG1heSBiZSBiZXR0ZXIgaWYgbm90IGEgcHVibGljIG1ldGhvZD9cbiAgICB0aGlzLmRhdGExICs9IGFtb3VudFxuICAgIHRoaXMuZnJlcXVlbmN5ID0gNDQwICogTWF0aC5wb3coMiwgKHRoaXMuZGF0YTEgLSA2OSkgLyAxMilcbiAgfVxuXG4gIG1vdmUodGlja3M6IG51bWJlcil7XG4gICAgdGhpcy50aWNrcyArPSB0aWNrc1xuICAgIGlmKHRoaXMubWlkaU5vdGUpe1xuICAgICAgdGhpcy5taWRpTm90ZS51cGRhdGUoKVxuICAgIH1cbiAgfVxuXG4gIG1vdmVUbyh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLnRpY2tzID0gdGlja3NcbiAgICBpZih0aGlzLm1pZGlOb3RlKXtcbiAgICAgIHRoaXMubWlkaU5vdGUudXBkYXRlKClcbiAgICB9XG4gIH1cbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZU1JRElFdmVudChldmVudCl7XG4gIC8vZXZlbnQubm90ZSA9IG51bGxcbiAgZXZlbnQubm90ZSA9IG51bGxcbiAgZXZlbnQgPSBudWxsXG59XG4qL1xuIiwiaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcblxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBNSURJTm90ZXtcblxuICBjb25zdHJ1Y3Rvcihub3Rlb246IE1JRElFdmVudCwgbm90ZW9mZjogTUlESUV2ZW50KXtcbiAgICAvL2lmKG5vdGVvbi50eXBlICE9PSAxNDQgfHwgbm90ZW9mZi50eXBlICE9PSAxMjgpe1xuICAgIGlmKG5vdGVvbi50eXBlICE9PSAxNDQpe1xuICAgICAgY29uc29sZS53YXJuKCdjYW5ub3QgY3JlYXRlIE1JRElOb3RlJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmlkID0gYE1OXyR7bWlkaU5vdGVJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5vdGVPbiA9IG5vdGVvblxuICAgIG5vdGVvbi5taWRpTm90ZSA9IHRoaXNcbiAgICBub3Rlb24ubWlkaU5vdGVJZCA9IHRoaXMuaWRcblxuICAgIGlmKG5vdGVvZmYgaW5zdGFuY2VvZiBNSURJRXZlbnQpe1xuICAgICAgdGhpcy5ub3RlT2ZmID0gbm90ZW9mZlxuICAgICAgbm90ZW9mZi5taWRpTm90ZSA9IHRoaXNcbiAgICAgIG5vdGVvZmYubWlkaU5vdGVJZCA9IHRoaXMuaWRcbiAgICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IG5vdGVvZmYudGlja3MgLSBub3Rlb24udGlja3NcbiAgICAgIHRoaXMuZHVyYXRpb25NaWxsaXMgPSAtMVxuICAgIH1cbiAgfVxuXG4gIGFkZE5vdGVPZmYobm90ZW9mZil7XG4gICAgdGhpcy5ub3RlT2ZmID0gbm90ZW9mZlxuICAgIG5vdGVvZmYubWlkaU5vdGUgPSB0aGlzXG4gICAgbm90ZW9mZi5taWRpTm90ZUlkID0gdGhpcy5pZFxuICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IG5vdGVvZmYudGlja3MgLSB0aGlzLm5vdGVPbi50aWNrc1xuICAgIHRoaXMuZHVyYXRpb25NaWxsaXMgPSAtMVxuICB9XG5cbiAgY29weSgpe1xuICAgIHJldHVybiBuZXcgTUlESU5vdGUodGhpcy5ub3RlT24uY29weSgpLCB0aGlzLm5vdGVPZmYuY29weSgpKVxuICB9XG5cbiAgdXBkYXRlKCl7IC8vIG1heSB1c2UgYW5vdGhlciBuYW1lIGZvciB0aGlzIG1ldGhvZFxuICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IHRoaXMubm90ZU9mZi50aWNrcyAtIHRoaXMubm90ZU9uLnRpY2tzXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLnRyYW5zcG9zZShhbW91bnQpXG4gICAgdGhpcy5ub3RlT2ZmLnRyYW5zcG9zZShhbW91bnQpXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLm1vdmUodGlja3MpXG4gICAgdGhpcy5ub3RlT2ZmLm1vdmUodGlja3MpXG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcik6IHZvaWR7XG4gICAgdGhpcy5ub3RlT24ubW92ZVRvKHRpY2tzKVxuICAgIHRoaXMubm90ZU9mZi5tb3ZlVG8odGlja3MpXG4gIH1cblxuICB1bnJlZ2lzdGVyKCl7XG4gICAgaWYodGhpcy5wYXJ0KXtcbiAgICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMucGFydCA9IG51bGxcbiAgICB9XG4gICAgaWYodGhpcy50cmFjayl7XG4gICAgICB0aGlzLnRyYWNrLnJlbW92ZUV2ZW50cyh0aGlzKVxuICAgICAgdGhpcy50cmFjayA9IG51bGxcbiAgICB9XG4gICAgaWYodGhpcy5zb25nKXtcbiAgICAgIHRoaXMuc29uZy5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMuc29uZyA9IG51bGxcbiAgICB9XG4gIH1cbn1cblxuIiwiLypcbiAgV3JhcHBlciBmb3IgYWNjZXNzaW5nIGJ5dGVzIHRocm91Z2ggc2VxdWVudGlhbCByZWFkc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuICBhZGFwdGVkIHRvIHdvcmsgd2l0aCBBcnJheUJ1ZmZlciAtPiBVaW50OEFycmF5XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgZmNjID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUlESVN0cmVhbXtcblxuICAvLyBidWZmZXIgaXMgVWludDhBcnJheVxuICBjb25zdHJ1Y3RvcihidWZmZXIpe1xuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgLyogcmVhZCBzdHJpbmcgb3IgYW55IG51bWJlciBvZiBieXRlcyAqL1xuICByZWFkKGxlbmd0aCwgdG9TdHJpbmcgPSB0cnVlKSB7XG4gICAgbGV0IHJlc3VsdDtcblxuICAgIGlmKHRvU3RyaW5nKXtcbiAgICAgIHJlc3VsdCA9ICcnO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQgKz0gZmNjKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfWVsc2V7XG4gICAgICByZXN1bHQgPSBbXTtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAzMi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MzIoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCAyNCkgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXSA8PCAxNikgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAyXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgM11cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gNDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMTYtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDE2KCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYW4gOC1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50OChzaWduZWQpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl07XG4gICAgaWYoc2lnbmVkICYmIHJlc3VsdCA+IDEyNyl7XG4gICAgICByZXN1bHQgLT0gMjU2O1xuICAgIH1cbiAgICB0aGlzLnBvc2l0aW9uICs9IDE7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGVvZigpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbiA+PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICAvKiByZWFkIGEgTUlESS1zdHlsZSBsZXRpYWJsZS1sZW5ndGggaW50ZWdlclxuICAgIChiaWctZW5kaWFuIHZhbHVlIGluIGdyb3VwcyBvZiA3IGJpdHMsXG4gICAgd2l0aCB0b3AgYml0IHNldCB0byBzaWduaWZ5IHRoYXQgYW5vdGhlciBieXRlIGZvbGxvd3MpXG4gICovXG4gIHJlYWRWYXJJbnQoKSB7XG4gICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgbGV0IGIgPSB0aGlzLnJlYWRJbnQ4KCk7XG4gICAgICBpZiAoYiAmIDB4ODApIHtcbiAgICAgICAgcmVzdWx0ICs9IChiICYgMHg3Zik7XG4gICAgICAgIHJlc3VsdCA8PD0gNztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGIgaXMgdGhlIGxhc3QgYnl0ZSAqL1xuICAgICAgICByZXR1cm4gcmVzdWx0ICsgYjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNldCgpe1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgc2V0UG9zaXRpb24ocCl7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHA7XG4gIH1cbn1cbiIsIi8qXG4gIEV4dHJhY3RzIGFsbCBtaWRpIGV2ZW50cyBmcm9tIGEgYmluYXJ5IG1pZGkgZmlsZSwgdXNlcyBtaWRpX3N0cmVhbS5qc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTUlESVN0cmVhbSBmcm9tICcuL21pZGlfc3RyZWFtJztcblxubGV0XG4gIGxhc3RFdmVudFR5cGVCeXRlLFxuICB0cmFja05hbWU7XG5cblxuZnVuY3Rpb24gcmVhZENodW5rKHN0cmVhbSl7XG4gIGxldCBpZCA9IHN0cmVhbS5yZWFkKDQsIHRydWUpO1xuICBsZXQgbGVuZ3RoID0gc3RyZWFtLnJlYWRJbnQzMigpO1xuICAvL2NvbnNvbGUubG9nKGxlbmd0aCk7XG4gIHJldHVybntcbiAgICAnaWQnOiBpZCxcbiAgICAnbGVuZ3RoJzogbGVuZ3RoLFxuICAgICdkYXRhJzogc3RyZWFtLnJlYWQobGVuZ3RoLCBmYWxzZSlcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiByZWFkRXZlbnQoc3RyZWFtKXtcbiAgdmFyIGV2ZW50ID0ge307XG4gIHZhciBsZW5ndGg7XG4gIGV2ZW50LmRlbHRhVGltZSA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gIGxldCBldmVudFR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gIC8vY29uc29sZS5sb2coZXZlbnRUeXBlQnl0ZSwgZXZlbnRUeXBlQnl0ZSAmIDB4ODAsIDE0NiAmIDB4MGYpO1xuICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ZjApID09IDB4ZjApe1xuICAgIC8qIHN5c3RlbSAvIG1ldGEgZXZlbnQgKi9cbiAgICBpZihldmVudFR5cGVCeXRlID09IDB4ZmYpe1xuICAgICAgLyogbWV0YSBldmVudCAqL1xuICAgICAgZXZlbnQudHlwZSA9ICdtZXRhJztcbiAgICAgIGxldCBzdWJ0eXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIHN3aXRjaChzdWJ0eXBlQnl0ZSl7XG4gICAgICAgIGNhc2UgMHgwMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlTnVtYmVyJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2VxdWVuY2VOdW1iZXIgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWJlciA9IHN0cmVhbS5yZWFkSW50MTYoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RleHQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAyOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29weXJpZ2h0Tm90aWNlJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RyYWNrTmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2luc3RydW1lbnROYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2x5cmljcyc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtYXJrZXInO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA3OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY3VlUG9pbnQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDIwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWlkaUNoYW5uZWxQcmVmaXgnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMSl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBtaWRpQ2hhbm5lbFByZWZpeCBldmVudCBpcyAxLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQuY2hhbm5lbCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDJmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnZW5kT2ZUcmFjayc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAwKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGVuZE9mVHJhY2sgZXZlbnQgaXMgMCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDUxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2V0VGVtcG8nO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMyl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXRUZW1wbyBldmVudCBpcyAzLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdCA9IChcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCAxNikgK1xuICAgICAgICAgICAgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDgpICtcbiAgICAgICAgICAgIHN0cmVhbS5yZWFkSW50OCgpXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1NDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NtcHRlT2Zmc2V0JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDUpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc21wdGVPZmZzZXQgZXZlbnQgaXMgNSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBob3VyQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lUmF0ZSA9e1xuICAgICAgICAgICAgMHgwMDogMjQsIDB4MjA6IDI1LCAweDQwOiAyOSwgMHg2MDogMzBcbiAgICAgICAgICB9W2hvdXJCeXRlICYgMHg2MF07XG4gICAgICAgICAgZXZlbnQuaG91ciA9IGhvdXJCeXRlICYgMHgxZjtcbiAgICAgICAgICBldmVudC5taW4gPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zZWMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnN1YmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTg6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0aW1lU2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDQpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgdGltZVNpZ25hdHVyZSBldmVudCBpcyA0LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtZXJhdG9yID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZGVub21pbmF0b3IgPSBNYXRoLnBvdygyLCBzdHJlYW0ucmVhZEludDgoKSk7XG4gICAgICAgICAgZXZlbnQubWV0cm9ub21lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQudGhpcnR5c2Vjb25kcyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU5OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAna2V5U2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Iga2V5U2lnbmF0dXJlIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5rZXkgPSBzdHJlYW0ucmVhZEludDgodHJ1ZSk7XG4gICAgICAgICAgZXZlbnQuc2NhbGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg3ZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlclNwZWNpZmljJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9pZihzZXF1ZW5jZXIuZGVidWcgPj0gMil7XG4gICAgICAgICAgLy8gICAgY29uc29sZS53YXJuKCdVbnJlY29nbmlzZWQgbWV0YSBldmVudCBzdWJ0eXBlOiAnICsgc3VidHlwZUJ5dGUpO1xuICAgICAgICAgIC8vfVxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfVxuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2UgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGYwKXtcbiAgICAgIGV2ZW50LnR5cGUgPSAnc3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmNyl7XG4gICAgICBldmVudC50eXBlID0gJ2RpdmlkZWRTeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZSBieXRlOiAnICsgZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gIH1lbHNle1xuICAgIC8qIGNoYW5uZWwgZXZlbnQgKi9cbiAgICBsZXQgcGFyYW0xO1xuICAgIGlmKChldmVudFR5cGVCeXRlICYgMHg4MCkgPT09IDApe1xuICAgICAgLyogcnVubmluZyBzdGF0dXMgLSByZXVzZSBsYXN0RXZlbnRUeXBlQnl0ZSBhcyB0aGUgZXZlbnQgdHlwZS5cbiAgICAgICAgZXZlbnRUeXBlQnl0ZSBpcyBhY3R1YWxseSB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gICAgICAqL1xuICAgICAgLy9jb25zb2xlLmxvZygncnVubmluZyBzdGF0dXMnKTtcbiAgICAgIHBhcmFtMSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgICBldmVudFR5cGVCeXRlID0gbGFzdEV2ZW50VHlwZUJ5dGU7XG4gICAgfWVsc2V7XG4gICAgICBwYXJhbTEgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2xhc3QnLCBldmVudFR5cGVCeXRlKTtcbiAgICAgIGxhc3RFdmVudFR5cGVCeXRlID0gZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gICAgbGV0IGV2ZW50VHlwZSA9IGV2ZW50VHlwZUJ5dGUgPj4gNDtcbiAgICBldmVudC5jaGFubmVsID0gZXZlbnRUeXBlQnl0ZSAmIDB4MGY7XG4gICAgZXZlbnQudHlwZSA9ICdjaGFubmVsJztcbiAgICBzd2l0Y2ggKGV2ZW50VHlwZSl7XG4gICAgICBjYXNlIDB4MDg6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwOTpcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgaWYoZXZlbnQudmVsb2NpdHkgPT09IDApe1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdub3RlT24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGE6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZUFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC5hbW91bnQgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBiOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvbnRyb2xsZXInO1xuICAgICAgICBldmVudC5jb250cm9sbGVyVHlwZSA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBjOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Byb2dyYW1DaGFuZ2UnO1xuICAgICAgICBldmVudC5wcm9ncmFtTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGQ6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY2hhbm5lbEFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5hbW91bnQgPSBwYXJhbTE7XG4gICAgICAgIC8vaWYodHJhY2tOYW1lID09PSAnU0gtUzEtNDQtQzA5IEw9U01MIElOPTMnKXtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ2NoYW5uZWwgcHJlc3N1cmUnLCB0cmFja05hbWUsIHBhcmFtMSk7XG4gICAgICAgIC8vfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGU6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncGl0Y2hCZW5kJztcbiAgICAgICAgZXZlbnQudmFsdWUgPSBwYXJhbTEgKyAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgNyk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8qXG4gICAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlO1xuICAgICAgICBjb25zb2xlLmxvZygnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZSk7XG4gICAgICAgICovXG5cbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4vKlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgIGNvbnNvbGUubG9nKCd3ZWlyZG8nLCB0cmFja05hbWUsIHBhcmFtMSwgZXZlbnQudmVsb2NpdHkpO1xuKi9cblxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESUZpbGUoYnVmZmVyKXtcbiAgaWYoYnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSA9PT0gZmFsc2UgJiYgYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmVycm9yKCdidWZmZXIgc2hvdWxkIGJlIGFuIGluc3RhbmNlIG9mIFVpbnQ4QXJyYXkgb2YgQXJyYXlCdWZmZXInKVxuICAgIHJldHVyblxuICB9XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gIH1cbiAgbGV0IHRyYWNrcyA9IG5ldyBNYXAoKTtcbiAgbGV0IHN0cmVhbSA9IG5ldyBNSURJU3RyZWFtKGJ1ZmZlcik7XG5cbiAgbGV0IGhlYWRlckNodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gIGlmKGhlYWRlckNodW5rLmlkICE9PSAnTVRoZCcgfHwgaGVhZGVyQ2h1bmsubGVuZ3RoICE9PSA2KXtcbiAgICB0aHJvdyAnQmFkIC5taWQgZmlsZSAtIGhlYWRlciBub3QgZm91bmQnO1xuICB9XG5cbiAgbGV0IGhlYWRlclN0cmVhbSA9IG5ldyBNSURJU3RyZWFtKGhlYWRlckNodW5rLmRhdGEpO1xuICBsZXQgZm9ybWF0VHlwZSA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgbGV0IHRyYWNrQ291bnQgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0aW1lRGl2aXNpb24gPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG5cbiAgaWYodGltZURpdmlzaW9uICYgMHg4MDAwKXtcbiAgICB0aHJvdyAnRXhwcmVzc2luZyB0aW1lIGRpdmlzaW9uIGluIFNNVFBFIGZyYW1lcyBpcyBub3Qgc3VwcG9ydGVkIHlldCc7XG4gIH1cblxuICBsZXQgaGVhZGVyID17XG4gICAgJ2Zvcm1hdFR5cGUnOiBmb3JtYXRUeXBlLFxuICAgICd0cmFja0NvdW50JzogdHJhY2tDb3VudCxcbiAgICAndGlja3NQZXJCZWF0JzogdGltZURpdmlzaW9uXG4gIH07XG5cbiAgZm9yKGxldCBpID0gMDsgaSA8IHRyYWNrQ291bnQ7IGkrKyl7XG4gICAgdHJhY2tOYW1lID0gJ3RyYWNrXycgKyBpO1xuICAgIGxldCB0cmFjayA9IFtdO1xuICAgIGxldCB0cmFja0NodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gICAgaWYodHJhY2tDaHVuay5pZCAhPT0gJ01UcmsnKXtcbiAgICAgIHRocm93ICdVbmV4cGVjdGVkIGNodW5rIC0gZXhwZWN0ZWQgTVRyaywgZ290ICcrIHRyYWNrQ2h1bmsuaWQ7XG4gICAgfVxuICAgIGxldCB0cmFja1N0cmVhbSA9IG5ldyBNSURJU3RyZWFtKHRyYWNrQ2h1bmsuZGF0YSk7XG4gICAgd2hpbGUoIXRyYWNrU3RyZWFtLmVvZigpKXtcbiAgICAgIGxldCBldmVudCA9IHJlYWRFdmVudCh0cmFja1N0cmVhbSk7XG4gICAgICB0cmFjay5wdXNoKGV2ZW50KTtcbiAgICB9XG4gICAgdHJhY2tzLnNldCh0cmFja05hbWUsIHRyYWNrKTtcbiAgfVxuXG4gIHJldHVybntcbiAgICAnaGVhZGVyJzogaGVhZGVyLFxuICAgICd0cmFja3MnOiB0cmFja3NcbiAgfTtcbn0iLCIvKlxuICBBZGRzIGEgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbm90ZSBvYmplY3QgdGhhdCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhIG11c2ljYWwgbm90ZTpcbiAgICAtIG5hbWUsIGUuZy4gJ0MnXG4gICAgLSBvY3RhdmUsICAtMSAtIDlcbiAgICAtIGZ1bGxOYW1lOiAnQzEnXG4gICAgLSBmcmVxdWVuY3k6IDIzNC4xNiwgYmFzZWQgb24gdGhlIGJhc2ljIHBpdGNoXG4gICAgLSBudW1iZXI6IDYwIG1pZGkgbm90ZSBudW1iZXJcblxuICBBZGRzIHNldmVyYWwgdXRpbGl0eSBtZXRob2RzIG9yZ2FuaXNlZCBhcm91bmQgdGhlIG5vdGUgb2JqZWN0XG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7dHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJztcblxubGV0XG4gIGVycm9yTXNnLFxuICB3YXJuaW5nTXNnLFxuICBwb3cgPSBNYXRoLnBvdyxcbiAgZmxvb3IgPSBNYXRoLmZsb29yO1xuXG5jb25zdCBub3RlTmFtZXMgPSB7XG4gICdzaGFycCcgOiBbJ0MnLCAnQyMnLCAnRCcsICdEIycsICdFJywgJ0YnLCAnRiMnLCAnRycsICdHIycsICdBJywgJ0EjJywgJ0InXSxcbiAgJ2ZsYXQnIDogWydDJywgJ0RiJywgJ0QnLCAnRWInLCAnRScsICdGJywgJ0diJywgJ0cnLCAnQWInLCAnQScsICdCYicsICdCJ10sXG4gICdlbmhhcm1vbmljLXNoYXJwJyA6IFsnQiMnLCAnQyMnLCAnQyMjJywgJ0QjJywgJ0QjIycsICdFIycsICdGIycsICdGIyMnLCAnRyMnLCAnRyMjJywgJ0EjJywgJ0EjIyddLFxuICAnZW5oYXJtb25pYy1mbGF0JyA6IFsnRGJiJywgJ0RiJywgJ0ViYicsICdFYicsICdGYicsICdHYmInLCAnR2InLCAnQWJiJywgJ0FiJywgJ0JiYicsICdCYicsICdDYiddXG59O1xuXG5cbi8qXG4gIGFyZ3VtZW50c1xuICAtIG5vdGVOdW1iZXI6IDYwXG4gIC0gbm90ZU51bWJlciBhbmQgbm90ZW5hbWUgbW9kZTogNjAsICdzaGFycCdcbiAgLSBub3RlTmFtZTogJ0MjNCdcbiAgLSBuYW1lIGFuZCBvY3RhdmU6ICdDIycsIDRcbiAgLSBub3RlIG5hbWUsIG9jdGF2ZSwgbm90ZSBuYW1lIG1vZGU6ICdEJywgNCwgJ3NoYXJwJ1xuICAtIGRhdGEgb2JqZWN0OlxuICAgIHtcbiAgICAgIG5hbWU6ICdDJyxcbiAgICAgIG9jdGF2ZTogNFxuICAgIH1cbiAgICBvclxuICAgIHtcbiAgICAgIGZyZXF1ZW5jeTogMjM0LjE2XG4gICAgfVxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5vdGUoLi4uYXJncyl7XG4gIGxldFxuICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICBkYXRhLFxuICAgIG9jdGF2ZSxcbiAgICBub3RlTmFtZSxcbiAgICBub3RlTnVtYmVyLFxuICAgIG5vdGVOYW1lTW9kZSxcbiAgICBhcmcwID0gYXJnc1swXSxcbiAgICBhcmcxID0gYXJnc1sxXSxcbiAgICBhcmcyID0gYXJnc1syXSxcbiAgICB0eXBlMCA9IHR5cGVTdHJpbmcoYXJnMCksXG4gICAgdHlwZTEgPSB0eXBlU3RyaW5nKGFyZzEpLFxuICAgIHR5cGUyID0gdHlwZVN0cmluZyhhcmcyKTtcblxuICBlcnJvck1zZyA9ICcnO1xuICB3YXJuaW5nTXNnID0gJyc7XG5cbiAgLy8gYXJndW1lbnQ6IG5vdGUgbnVtYmVyXG4gIC8vY29uc29sZS5sb2cobnVtQXJncywgdHlwZTApXG4gIGlmKG51bUFyZ3MgPT09IDEgJiYgdHlwZTAgPT09ICdudW1iZXInKXtcbiAgICBpZihhcmcwIDwgMCB8fCBhcmcwID4gMTI3KXtcbiAgICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBudW1iZXIgPj0gMCBhbmQgPD0gMTI3ICcgKyAgYXJnMDtcbiAgICB9ZWxzZXtcbiAgICAgIG5vdGVOdW1iZXIgPSBhcmcwO1xuICAgICAgZGF0YSA9IF9nZXROb3RlTmFtZShub3RlTnVtYmVyKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgfVxuXG5cbiAgLy8gYXJndW1lbnRzOiBmdWxsIG5vdGUgbmFtZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAxICYmIHR5cGUwID09PSAnc3RyaW5nJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzApO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbmFtZSwgb2N0YXZlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzAsIGFyZzEpO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuICAvLyBhcmd1bWVudHM6IGZ1bGwgbm90ZSBuYW1lLCBub3RlIG5hbWUgbW9kZSAtPiBmb3IgY29udmVydGluZyBiZXR3ZWVuIG5vdGUgbmFtZSBtb2Rlc1xuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzEpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbnVtYmVyLCBub3RlIG5hbWUgbW9kZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGVTdHJpbmcoYXJnMCkgPT09ICdudW1iZXInICYmIHR5cGVTdHJpbmcoYXJnMSkgPT09ICdzdHJpbmcnKXtcbiAgICBpZihhcmcwIDwgMCB8fCBhcmcwID4gMTI3KXtcbiAgICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBudW1iZXIgPj0gMCBhbmQgPD0gMTI3ICcgKyBhcmcwO1xuICAgIH1lbHNle1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzEpO1xuICAgICAgbm90ZU51bWJlciA9IGFyZzA7XG4gICAgICBkYXRhID0gX2dldE5vdGVOYW1lKG5vdGVOdW1iZXIsIG5vdGVOYW1lTW9kZSk7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgIH1cblxuXG4gIC8vIGFyZ3VtZW50czogbm90ZSBuYW1lLCBvY3RhdmUsIG5vdGUgbmFtZSBtb2RlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDMgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyAmJiB0eXBlMiA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwLCBhcmcxKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzIpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSxvY3RhdmUpO1xuICAgIH1cblxuICB9ZWxzZXtcbiAgICBlcnJvck1zZyA9ICd3cm9uZyBhcmd1bWVudHMsIHBsZWFzZSBjb25zdWx0IGRvY3VtZW50YXRpb24nO1xuICB9XG5cbiAgaWYoZXJyb3JNc2cpe1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNc2cpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmKHdhcm5pbmdNc2cpe1xuICAgIGNvbnNvbGUud2Fybih3YXJuaW5nTXNnKTtcbiAgfVxuXG4gIGxldCBub3RlID0ge1xuICAgIG5hbWU6IG5vdGVOYW1lLFxuICAgIG9jdGF2ZTogb2N0YXZlLFxuICAgIGZ1bGxOYW1lOiBub3RlTmFtZSArIG9jdGF2ZSxcbiAgICBudW1iZXI6IG5vdGVOdW1iZXIsXG4gICAgZnJlcXVlbmN5OiBfZ2V0RnJlcXVlbmN5KG5vdGVOdW1iZXIpLFxuICAgIGJsYWNrS2V5OiBfaXNCbGFja0tleShub3RlTnVtYmVyKVxuICB9XG4gIE9iamVjdC5mcmVlemUobm90ZSk7XG4gIHJldHVybiBub3RlO1xufVxuXG5cbi8vZnVuY3Rpb24gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSA9IGNvbmZpZy5nZXQoJ25vdGVOYW1lTW9kZScpKSB7XG5mdW5jdGlvbiBfZ2V0Tm90ZU5hbWUobnVtYmVyLCBtb2RlID0gJ3NoYXJwJykge1xuICAvL2xldCBvY3RhdmUgPSBNYXRoLmZsb29yKChudW1iZXIgLyAxMikgLSAyKSwgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBvY3RhdmUgPSBmbG9vcigobnVtYmVyIC8gMTIpIC0gMSk7XG4gIGxldCBub3RlTmFtZSA9IG5vdGVOYW1lc1ttb2RlXVtudW1iZXIgJSAxMl07XG4gIHJldHVybiBbbm90ZU5hbWUsIG9jdGF2ZV07XG59XG5cblxuZnVuY3Rpb24gX2dldE5vdGVOdW1iZXIobmFtZSwgb2N0YXZlKSB7XG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgbGV0IGluZGV4O1xuXG4gIGZvcihsZXQga2V5IG9mIGtleXMpe1xuICAgIGxldCBtb2RlID0gbm90ZU5hbWVzW2tleV07XG4gICAgaW5kZXggPSBtb2RlLmZpbmRJbmRleCh4ID0+IHggPT09IG5hbWUpO1xuICAgIGlmKGluZGV4ICE9PSAtMSl7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvL251bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMikgKyAxMjsgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBudW1iZXIgPSAoaW5kZXggKyAxMikgKyAob2N0YXZlICogMTIpOy8vIOKGkiBtaWRpIHN0YW5kYXJkICsgc2NpZW50aWZpYyBuYW1pbmcsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NaWRkbGVfQyBhbmQgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TY2llbnRpZmljX3BpdGNoX25vdGF0aW9uXG5cbiAgaWYobnVtYmVyIDwgMCB8fCBudW1iZXIgPiAxMjcpe1xuICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBiZXR3ZWVuIEMwIGFuZCBHMTAnO1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gbnVtYmVyO1xufVxuXG5cbmZ1bmN0aW9uIF9nZXRGcmVxdWVuY3kobnVtYmVyKXtcbiAgLy9yZXR1cm4gY29uZmlnLmdldCgncGl0Y2gnKSAqIHBvdygyLChudW1iZXIgLSA2OSkvMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbiAgcmV0dXJuIDQ0MCAqIHBvdygyLChudW1iZXIgLSA2OSkvMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbn1cblxuXG4vLyBUT0RPOiBjYWxjdWxhdGUgbm90ZSBmcm9tIGZyZXF1ZW5jeVxuZnVuY3Rpb24gX2dldFBpdGNoKGhlcnR6KXtcbiAgLy9mbSAgPSAgMiht4oiSNjkpLzEyKDQ0MCBIeikuXG59XG5cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpe1xuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIGxldCByZXN1bHQgPSBrZXlzLmZpbmQoeCA9PiB4ID09PSBtb2RlKSAhPT0gdW5kZWZpbmVkO1xuICBpZihyZXN1bHQgPT09IGZhbHNlKXtcbiAgICAvL21vZGUgPSBjb25maWcuZ2V0KCdub3RlTmFtZU1vZGUnKTtcbiAgICBtb2RlID0gJ3NoYXJwJztcbiAgICB3YXJuaW5nTXNnID0gbW9kZSArICcgaXMgbm90IGEgdmFsaWQgbm90ZSBuYW1lIG1vZGUsIHVzaW5nIFwiJyArIG1vZGUgKyAnXCIgaW5zdGVhZCc7XG4gIH1cbiAgcmV0dXJuIG1vZGU7XG59XG5cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWUoLi4uYXJncyl7XG4gIGxldFxuICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICBhcmcwID0gYXJnc1swXSxcbiAgICBhcmcxID0gYXJnc1sxXSxcbiAgICBjaGFyLFxuICAgIG5hbWUgPSAnJyxcbiAgICBvY3RhdmUgPSAnJztcblxuICAvLyBleHRyYWN0IG9jdGF2ZSBmcm9tIG5vdGUgbmFtZVxuICBpZihudW1BcmdzID09PSAxKXtcbiAgICBmb3IoY2hhciBvZiBhcmcwKXtcbiAgICAgIGlmKGlzTmFOKGNoYXIpICYmIGNoYXIgIT09ICctJyl7XG4gICAgICAgIG5hbWUgKz0gY2hhcjtcbiAgICAgIH1lbHNle1xuICAgICAgICBvY3RhdmUgKz0gY2hhcjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYob2N0YXZlID09PSAnJyl7XG4gICAgICBvY3RhdmUgPSAwO1xuICAgIH1cbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMil7XG4gICAgbmFtZSA9IGFyZzA7XG4gICAgb2N0YXZlID0gYXJnMTtcbiAgfVxuXG4gIC8vIGNoZWNrIGlmIG5vdGUgbmFtZSBpcyB2YWxpZFxuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIGxldCBpbmRleCA9IC0xO1xuXG4gIGZvcihsZXQga2V5IG9mIGtleXMpe1xuICAgIGxldCBtb2RlID0gbm90ZU5hbWVzW2tleV07XG4gICAgaW5kZXggPSBtb2RlLmZpbmRJbmRleCh4ID0+IHggPT09IG5hbWUpO1xuICAgIGlmKGluZGV4ICE9PSAtMSl7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZihpbmRleCA9PT0gLTEpe1xuICAgIGVycm9yTXNnID0gYXJnMCArICcgaXMgbm90IGEgdmFsaWQgbm90ZSBuYW1lLCBwbGVhc2UgdXNlIGxldHRlcnMgQSAtIEcgYW5kIGlmIG5lY2Vzc2FyeSBhbiBhY2NpZGVudGFsIGxpa2UgIywgIyMsIGIgb3IgYmIsIGZvbGxvd2VkIGJ5IGEgbnVtYmVyIGZvciB0aGUgb2N0YXZlJztcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihvY3RhdmUgPCAtMSB8fCBvY3RhdmUgPiA5KXtcbiAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhbiBvY3RhdmUgYmV0d2VlbiAtMSBhbmQgOSc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgb2N0YXZlID0gcGFyc2VJbnQob2N0YXZlLCAxMCk7XG4gIG5hbWUgPSBuYW1lLnN1YnN0cmluZygwLCAxKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zdWJzdHJpbmcoMSk7XG5cbiAgLy9jb25zb2xlLmxvZyhuYW1lLCd8JyxvY3RhdmUpO1xuICByZXR1cm4gW25hbWUsIG9jdGF2ZV07XG59XG5cblxuXG5mdW5jdGlvbiBfaXNCbGFja0tleShub3RlTnVtYmVyKXtcbiAgbGV0IGJsYWNrO1xuXG4gIHN3aXRjaCh0cnVlKXtcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTovL0MjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDM6Ly9EI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSA2Oi8vRiNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gODovL0cjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDEwOi8vQSNcbiAgICAgIGJsYWNrID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBibGFjayA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGJsYWNrO1xufVxuXG5cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZU51bWJlciguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5udW1iZXI7XG4gIH1cbiAgcmV0dXJuIGVycm9yTXNnO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlTmFtZSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5uYW1lO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZU9jdGF2ZSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5vY3RhdmU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsTm90ZU5hbWUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUuZnVsbE5hbWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGcmVxdWVuY3koLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUuZnJlcXVlbmN5O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaXNCbGFja0tleSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5ibGFja0tleTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iLCJpbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7dHlwZVN0cmluZywgY2hlY2tJZkJhc2U2NCwgYmFzZTY0VG9CaW5hcnl9IGZyb20gJy4vdXRpbCdcbmltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVTYW1wbGUoc2FtcGxlLCBpZCwgZXZlcnkpe1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgdHJ5e1xuICAgICAgY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoc2FtcGxlLFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2VzcyhidWZmZXIpe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coaWQsIGJ1ZmZlcik7XG4gICAgICAgICAgaWYodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICByZXNvbHZlKHtpZCwgYnVmZmVyfSlcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoe2lkLCBidWZmZXJ9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZShidWZmZXIpO1xuICAgICAgICAgICAgaWYoZXZlcnkpe1xuICAgICAgICAgICAgICBldmVyeShidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmdW5jdGlvbiBvbkVycm9yKGUpe1xuICAgICAgICAgIGNvbnNvbGUoJ2Vycm9yIGRlY29kaW5nIGF1ZGlvZGF0YScsIGlkLCBlKTtcbiAgICAgICAgICAvL3JlamVjdChlKTsgLy8gZG9uJ3QgdXNlIHJlamVjdCBiZWNhdXNlIHdlIHVzZSB0aGlzIGFzIGEgbmVzdGVkIHByb21pc2UgYW5kIHdlIGRvbid0IHdhbnQgdGhlIHBhcmVudCBwcm9taXNlIHRvIHJlamVjdFxuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgfWNhdGNoKGUpe1xuICAgICAgY29uc29sZS53YXJuKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSlcbiAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZXNvbHZlKHtpZH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5cbmZ1bmN0aW9uIGxvYWRBbmRQYXJzZVNhbXBsZSh1cmwsIGlkLCBldmVyeSl7XG4gIC8vY29uc29sZS5sb2coaWQsIHVybClcbiAgbGV0IGV4ZWN1dG9yID0gZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgZmV0Y2goZXNjYXBlKHVybCksIHtcbiAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICB9KS50aGVuKFxuICAgICAgZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBpZihyZXNwb25zZS5vayl7XG4gICAgICAgICAgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhKVxuICAgICAgICAgICAgZGVjb2RlU2FtcGxlKGRhdGEsIGlkLCBldmVyeSkudGhlbihyZXNvbHZlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNlIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApXG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKVxufVxuXG5cbmZ1bmN0aW9uIGdldFByb21pc2VzKHByb21pc2VzLCBzYW1wbGUsIGtleSwgZXZlcnkpe1xuXG4gIGNvbnN0IGdldFNhbXBsZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICBpZihzYW1wbGUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgICBwcm9taXNlcy5wdXNoKGRlY29kZVNhbXBsZShzYW1wbGUsIGtleSwgZXZlcnkpKVxuICAgIH1lbHNlIGlmKHR5cGVvZiBzYW1wbGUgPT09ICdzdHJpbmcnKXtcbiAgICAgIGlmKGNoZWNrSWZCYXNlNjQoc2FtcGxlKSl7XG4gICAgICAgIHByb21pc2VzLnB1c2goZGVjb2RlU2FtcGxlKGJhc2U2NFRvQmluYXJ5KHNhbXBsZSksIGtleSwgZXZlcnkpKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKHNhbXBsZSwga2V5LCBldmVyeSkpXG4gICAgICB9XG4gICAgfWVsc2UgaWYodHlwZW9mIHNhbXBsZSA9PT0gJ29iamVjdCcpe1xuICAgICAgc2FtcGxlID0gc2FtcGxlLnNhbXBsZSB8fCBzYW1wbGUuYnVmZmVyIHx8IHNhbXBsZS5iYXNlNjQgfHwgc2FtcGxlLnVybFxuICAgICAgZ2V0U2FtcGxlKHByb21pc2VzLCBzYW1wbGUsIGtleSwgZXZlcnkpXG4gICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZSwgcHJvbWlzZXMubGVuZ3RoKVxuICAgIH1cbiAgfVxuXG4gIGdldFNhbXBsZSgpXG59XG5cblxuLy8gb25seSBmb3IgaW50ZXJuYWxseSB1c2UgaW4gcWFtYmlcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNhbXBsZXMyKG1hcHBpbmcsIGV2ZXJ5ID0gZmFsc2Upe1xuICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcobWFwcGluZyksXG4gICAgcHJvbWlzZXMgPSBbXVxuXG4gIGV2ZXJ5ID0gdHlwZW9mIGV2ZXJ5ID09PSAnZnVuY3Rpb24nID8gZXZlcnkgOiBmYWxzZVxuICAvL2NvbnNvbGUubG9nKHR5cGUsIG1hcHBpbmcpXG4gIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICBPYmplY3Qua2V5cyhtYXBwaW5nKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAvL2tleSA9IHBhcnNlSW50KGtleSwgMTApXG4gICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgbWFwcGluZ1trZXldLCBrZXksIGV2ZXJ5KVxuICAgIH0pXG4gIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgIGxldCBrZXlcbiAgICBtYXBwaW5nLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlKXtcbiAgICAgIC8vIGtleSBpcyBkZWxpYmVyYXRlbHkgdW5kZWZpbmVkXG4gICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgc2FtcGxlLCBrZXksIGV2ZXJ5KVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgLnRoZW4oKHZhbHVlcykgPT4ge1xuICAgICAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgICAgICBtYXBwaW5nID0ge31cbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gdmFsdWUuYnVmZmVyXG4gICAgICAgIH0pXG4gICAgICAgIHJlc29sdmUobWFwcGluZyk7XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2FtcGxlcyguLi5kYXRhKXtcbiAgaWYoZGF0YS5sZW5ndGggPT09IDEgJiYgdHlwZVN0cmluZyhkYXRhWzBdKSAhPT0gJ3N0cmluZycpe1xuICAgIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGFbMF0pXG4gIH1cbiAgcmV0dXJuIHBhcnNlU2FtcGxlczIoZGF0YSlcbn1cbiIsImltcG9ydCB7Z2V0TmljZVRpbWV9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge01JRElOb3RlfSBmcm9tICcuL21pZGlfbm90ZSc7XG5cbmxldFxuICBwcHEsXG4gIGJwbSxcbiAgZmFjdG9yLFxuICBub21pbmF0b3IsXG4gIGRlbm9taW5hdG9yLFxuICBwbGF5YmFja1NwZWVkLFxuXG4gIGJhcixcbiAgYmVhdCxcbiAgc2l4dGVlbnRoLFxuICB0aWNrLFxuICB0aWNrcyxcbiAgbWlsbGlzLFxuXG4gIG1pbGxpc1BlclRpY2ssXG4gIHNlY29uZHNQZXJUaWNrLFxuXG4gIHRpY2tzUGVyQmVhdCxcbiAgdGlja3NQZXJCYXIsXG4gIHRpY2tzUGVyU2l4dGVlbnRoLFxuICBudW1TaXh0ZWVudGgsXG5cbiAgZGlmZlRpY2tzXG4gIC8vcHJldmlvdXNFdmVudFxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKXtcbiAgc2Vjb25kc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHE7XG4gIG1pbGxpc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljayAqIDEwMDA7XG4gIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljaywgYnBtLCBwcHEsIHBsYXliYWNrU3BlZWQsIChwcHEgKiBtaWxsaXNQZXJUaWNrKSk7XG4gIC8vY29uc29sZS5sb2cocHBxKTtcbn1cblxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKXtcbiAgZmFjdG9yID0gKDQgLyBkZW5vbWluYXRvcik7XG4gIG51bVNpeHRlZW50aCA9IGZhY3RvciAqIDQ7XG4gIHRpY2tzUGVyQmVhdCA9IHBwcSAqIGZhY3RvcjtcbiAgdGlja3NQZXJCYXIgPSB0aWNrc1BlckJlYXQgKiBub21pbmF0b3I7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gcHBxIC8gNDtcbiAgLy9jb25zb2xlLmxvZyhkZW5vbWluYXRvciwgZmFjdG9yLCBudW1TaXh0ZWVudGgsIHRpY2tzUGVyQmVhdCwgdGlja3NQZXJCYXIsIHRpY2tzUGVyU2l4dGVlbnRoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCwgZmFzdCA9IGZhbHNlKXtcbiAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgLy8gaWYoZGlmZlRpY2tzIDwgMCl7XG4gIC8vICAgY29uc29sZS5sb2coZGlmZlRpY2tzLCBldmVudC50aWNrcywgcHJldmlvdXNFdmVudC50aWNrcywgcHJldmlvdXNFdmVudC50eXBlKVxuICAvLyB9XG4gIHRpY2sgKz0gZGlmZlRpY2tzO1xuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICAvL3ByZXZpb3VzRXZlbnQgPSBldmVudFxuICAvL2NvbnNvbGUubG9nKGRpZmZUaWNrcywgbWlsbGlzUGVyVGljayk7XG4gIG1pbGxpcyArPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuXG4gIGlmKGZhc3QgPT09IGZhbHNlKXtcbiAgICB3aGlsZSh0aWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCsrO1xuICAgICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICAgIHdoaWxlKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICAgIGJlYXQrKztcbiAgICAgICAgd2hpbGUoYmVhdCA+IG5vbWluYXRvcil7XG4gICAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgICAgYmFyKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUaW1lRXZlbnRzKHNldHRpbmdzLCB0aW1lRXZlbnRzLCBpc1BsYXlpbmcgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlIHRpbWUgZXZlbnRzJylcbiAgbGV0IHR5cGU7XG4gIGxldCBldmVudDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuICBsZXQgZSA9IDA7XG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGUrKywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG4gICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcblxuICAgIHN3aXRjaCh0eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgc2V0VGlja0R1cmF0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBzZXRUaWNrc1BlckJlYXQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICB1cGRhdGVFdmVudChldmVudCwgaXNQbGF5aW5nKTtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJhcnNBc1N0cmluZyk7XG4gIH1cblxuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG4gIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAvL2NvbnNvbGUubG9nKHRpbWVFdmVudHMpO1xufVxuXG5cbi8vZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKHNvbmcsIGV2ZW50cyl7XG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoZXZlbnRzLCBpc1BsYXlpbmcgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlRXZlbnRzJylcbiAgbGV0IGV2ZW50O1xuICBsZXQgc3RhcnRFdmVudCA9IDA7XG4gIGxldCBsYXN0RXZlbnRUaWNrID0gMDtcbiAgbGV0IHJlc3VsdCA9IFtdXG5cbiAgdGljayA9IDBcbiAgdGlja3MgPSAwXG4gIGRpZmZUaWNrcyA9IDBcblxuICAvL2xldCBldmVudHMgPSBbXS5jb25jYXQoZXZ0cywgc29uZy5fdGltZUV2ZW50cyk7XG4gIGxldCBudW1FdmVudHMgPSBldmVudHMubGVuZ3RoXG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuXG4gIC8vIG5vdGVvZmYgY29tZXMgYmVmb3JlIG5vdGVvblxuXG4vKlxuICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gYS5zb3J0SW5kZXggLSBiLnNvcnRJbmRleDtcbiAgfSlcbiovXG5cbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICAvLyBpZihhLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAtMVxuICAgICAgLy8gfWVsc2UgaWYoYi50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gMVxuICAgICAgLy8gfVxuICAgICAgLy8gc2hvcnQ6XG4gICAgICBsZXQgciA9IGEudHlwZSAtIGIudHlwZTtcbiAgICAgIGlmKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgciA9IC0xXG4gICAgICB9XG4gICAgICByZXR1cm4gclxuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3NcbiAgfSlcbiAgZXZlbnQgPSBldmVudHNbMF1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcblxuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcblxuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuXG4gIGZvcihsZXQgaSA9IHN0YXJ0RXZlbnQ7IGkgPCBudW1FdmVudHM7IGkrKyl7XG5cbiAgICBldmVudCA9IGV2ZW50c1tpXTtcblxuICAgIHN3aXRjaChldmVudC50eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuICAgICAgICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgICAgICAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzXG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLGV2ZW50Lm1pbGxpc1BlclRpY2spO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICAgICAgICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzXG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub21pbmF0b3IsbnVtU2l4dGVlbnRoLHRpY2tzUGVyU2l4dGVlbnRoKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG5cblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgIC8vY2FzZSAxMjg6XG4gICAgICAvL2Nhc2UgMTQ0OlxuICAgICAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcbiAgICAgICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuXG4gICAgICAgIC8vIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50LmRhdGEyLCBldmVudC5iYXJzQXNTdHJpbmcpXG4gICAgICAgIC8vIH1cblxuICAgIH1cblxuXG4gICAgLy8gaWYoaSA8IDEwMCAmJiAoZXZlbnQudHlwZSA9PT0gODEgfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkpe1xuICAgIC8vICAgLy9jb25zb2xlLmxvZyhpLCB0aWNrcywgZGlmZlRpY2tzLCBtaWxsaXMsIG1pbGxpc1BlclRpY2spXG4gICAgLy8gICBjb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5taWxsaXMsICdub3RlJywgZXZlbnQuZGF0YTEsICd2ZWxvJywgZXZlbnQuZGF0YTIpXG4gICAgLy8gfVxuXG4gICAgbGFzdEV2ZW50VGljayA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIHBhcnNlTUlESU5vdGVzKHJlc3VsdClcbiAgcmV0dXJuIHJlc3VsdFxuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnQoZXZlbnQsIGZhc3QgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coYmFyLCBiZWF0LCB0aWNrcylcbiAgLy9jb25zb2xlLmxvZyhldmVudCwgYnBtLCBtaWxsaXNQZXJUaWNrLCB0aWNrcywgbWlsbGlzKTtcblxuICBldmVudC5icG0gPSBicG07XG4gIGV2ZW50Lm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgZXZlbnQuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICBldmVudC50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICBldmVudC50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gIGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgZXZlbnQuZmFjdG9yID0gZmFjdG9yO1xuICBldmVudC5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gIGV2ZW50LnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG4gIGV2ZW50Lm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuXG5cbiAgZXZlbnQudGlja3MgPSB0aWNrcztcblxuICBldmVudC5taWxsaXMgPSBtaWxsaXM7XG4gIGV2ZW50LnNlY29uZHMgPSBtaWxsaXMgLyAxMDAwO1xuXG4gIGlmKGZhc3Qpe1xuICAgIHJldHVyblxuICB9XG5cbiAgZXZlbnQuYmFyID0gYmFyO1xuICBldmVudC5iZWF0ID0gYmVhdDtcbiAgZXZlbnQuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICBldmVudC50aWNrID0gdGljaztcbiAgLy9ldmVudC5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGljaztcbiAgdmFyIHRpY2tBc1N0cmluZyA9IHRpY2sgPT09IDAgPyAnMDAwJyA6IHRpY2sgPCAxMCA/ICcwMCcgKyB0aWNrIDogdGljayA8IDEwMCA/ICcwJyArIHRpY2sgOiB0aWNrO1xuICBldmVudC5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgdGlja0FzU3RyaW5nO1xuICBldmVudC5iYXJzQXNBcnJheSA9IFtiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja107XG5cblxuICB2YXIgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuXG4gIGV2ZW50LmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICBldmVudC5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gIGV2ZW50LnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgZXZlbnQubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgZXZlbnQudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICBldmVudC50aW1lQXNBcnJheSA9IHRpbWVEYXRhLnRpbWVBc0FycmF5O1xuXG4gIC8vIGlmKG1pbGxpcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAvLyB9XG5cblxufVxuXG5cbmxldCBtaWRpTm90ZUluZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNSURJTm90ZXMoZXZlbnRzKXtcbiAgbGV0IG5vdGVzID0ge31cbiAgbGV0IG5vdGVzSW5UcmFja1xuICBsZXQgbiA9IDBcbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKHR5cGVvZiBldmVudC5fcGFydCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGV2ZW50Ll90cmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgY29uc29sZS5sb2coJ25vIHBhcnQgYW5kL29yIHRyYWNrIHNldCcpXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdID0ge31cbiAgICAgIH1cbiAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudFxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdXG4gICAgICBpZih0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIGNvcnJlc3BvbmRpbmcgbm90ZW9uIGV2ZW50IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbGV0IG5vdGVPbiA9IG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV1cbiAgICAgIGxldCBub3RlT2ZmID0gZXZlbnRcbiAgICAgIGlmKHR5cGVvZiBub3RlT24gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy9jb25zb2xlLmluZm8obisrLCAnbm8gbm90ZW9uIGV2ZW50IGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlID0gbmV3IE1JRElOb3RlKG5vdGVPbiwgbm90ZU9mZilcbiAgICAgIG5vdGUgPSBudWxsXG4gICAgICAvLyBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgICAgLy8gbm90ZU9uLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgLy8gbm90ZU9uLm9mZiA9IG5vdGVPZmYuaWRcbiAgICAgIC8vIG5vdGVPZmYubWlkaU5vdGVJZCA9IGlkXG4gICAgICAvLyBub3RlT2ZmLm9uID0gbm90ZU9uLmlkXG4gICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICB9XG4gIH1cbiAgT2JqZWN0LmtleXMobm90ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICBkZWxldGUgbm90ZXNba2V5XVxuICB9KVxuICBub3RlcyA9IHt9XG4gIC8vY29uc29sZS5sb2cobm90ZXMsIG5vdGVzSW5UcmFjaylcbn1cblxuXG4vLyBub3QgaW4gdXNlIVxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckV2ZW50cyhldmVudHMpe1xuICBsZXQgc3VzdGFpbiA9IHt9XG4gIGxldCB0bXBSZXN1bHQgPSB7fVxuICBsZXQgcmVzdWx0ID0gW11cbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICBpZih0eXBlb2Ygc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1lbHNlIGlmKHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09IGV2ZW50LnRpY2tzKXtcbiAgICAgICAgICBkZWxldGUgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50XG4gICAgICAgIGRlbGV0ZSBzdXN0YWluW2V2ZW50LnRyYWNrSWRdXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMTI3KXtcbiAgICAgICAgc3VzdGFpbltldmVudC50cmFja0lkXSA9IGV2ZW50LnRpY2tzXG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKHN1c3RhaW4pXG4gIE9iamVjdC5rZXlzKHRtcFJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGxldCBzdXN0YWluRXZlbnQgPSB0bXBSZXN1bHRba2V5XVxuICAgIGNvbnNvbGUubG9nKHN1c3RhaW5FdmVudClcbiAgICByZXN1bHQucHVzaChzdXN0YWluRXZlbnQpXG4gIH0pXG4gIHJldHVybiByZXN1bHRcbn1cbiIsIi8vIEAgZmxvd1xuXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcblxubGV0IHBhcnRJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFBhcnR7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gbnVsbCl7XG4gICAgdGhpcy5pZCA9IGBNUF8ke3BhcnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcbiAgICB0aGlzLm11dGVkID0gZmFsc2VcbiAgICB0aGlzLl90cmFjayA9IG51bGxcbiAgICB0aGlzLl9zb25nID0gbnVsbFxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB0aGlzLl9zdGFydCA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgIHRoaXMuX2VuZCA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICB9XG5cbiAgY29weSgpe1xuICAgIGxldCBwID0gbmV3IFBhcnQodGhpcy5uYW1lICsgJ19jb3B5JykgLy8gaW1wbGVtZW50IGdldE5hbWVPZkNvcHkoKSBpbiB1dGlsIChzZWUgaGVhcnRiZWF0KVxuICAgIGxldCBldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIGxldCBjb3B5ID0gZXZlbnQuY29weSgpXG4gICAgICBjb25zb2xlLmxvZyhjb3B5KVxuICAgICAgZXZlbnRzLnB1c2goY29weSlcbiAgICB9KVxuICAgIHAuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICBwLnVwZGF0ZSgpXG4gICAgcmV0dXJuIHBcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZSh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgdHJhY2sgPSB0aGlzLl90cmFja1xuICAgIC8vY29uc29sZS5sb2codHJhY2spXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5fcGFydCA9IHRoaXNcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudClcbiAgICAgIHRoaXMuX2V2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgaWYodHJhY2spe1xuICAgICAgICBldmVudC5fdHJhY2sgPSB0cmFja1xuICAgICAgfVxuICAgIH0pXG4gICAgaWYodHJhY2spe1xuICAgICAgdHJhY2suX2V2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRyYWNrLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICB9XG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9uZXdFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgbGV0IHRyYWNrID0gdGhpcy5fdHJhY2tcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Ll9wYXJ0ID0gbnVsbFxuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgICAgdHJhY2suX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYodHJhY2spe1xuICAgICAgdHJhY2suX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgICAgdHJhY2suX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gICAgfVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHModGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHNUbyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuXG4gIGdldEV2ZW50cyhmaWx0ZXI6IHN0cmluZ1tdID0gbnVsbCl7IC8vIGNhbiBiZSB1c2UgYXMgZmluZEV2ZW50c1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ldmVudHNdIC8vQFRPRE8gaW1wbGVtZW50IGZpbHRlciAtPiBmaWx0ZXJFdmVudHMoKSBzaG91bGQgYmUgYSB1dGlsaXR5IGZ1bmN0aW9uIChub3QgYSBjbGFzcyBtZXRob2QpXG4gIH1cblxuICBtdXRlKGZsYWc6IGJvb2xlYW4gPSBudWxsKXtcbiAgICBpZihmbGFnKXtcbiAgICAgIHRoaXMubXV0ZWQgPSBmbGFnXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLm11dGVkID0gIXRoaXMubXV0ZWRcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKXtcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmKHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkpe1xuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgfVxuICAgIHNvcnRFdmVudHModGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICAvL0BUT0RPOiBjYWxjdWxhdGUgcGFydCBzdGFydCBhbmQgZW5kLCBhbmQgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVcbiAgfVxufVxuIiwiaW1wb3J0IHtnZXRQb3NpdGlvbjJ9IGZyb20gJy4vcG9zaXRpb24uanMnXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lci5qcydcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsLmpzJ1xuXG5jb25zdCByYW5nZSA9IDEwIC8vIG1pbGxpc2Vjb25kcyBvciB0aWNrc1xubGV0IGluc3RhbmNlSWQgPSAwXG5cbmV4cG9ydCBjbGFzcyBQbGF5aGVhZHtcblxuICBjb25zdHJ1Y3Rvcihzb25nLCB0eXBlID0gJ2FsbCcpe1xuICAgIHRoaXMuaWQgPSBgUE9TICR7aW5zdGFuY2VJZCsrfSAke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLnNvbmcgPSBzb25nXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMubGFzdEV2ZW50ID0gbnVsbFxuICAgIHRoaXMuZGF0YSA9IHt9XG5cbiAgICB0aGlzLmFjdGl2ZVBhcnRzID0gW11cbiAgICB0aGlzLmFjdGl2ZU5vdGVzID0gW11cbiAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IFtdXG4gIH1cblxuICAvLyB1bml0IGNhbiBiZSAnbWlsbGlzJyBvciAndGlja3MnXG4gIHNldCh1bml0LCB2YWx1ZSl7XG4gICAgdGhpcy51bml0ID0gdW5pdFxuICAgIHRoaXMuY3VycmVudFZhbHVlID0gdmFsdWVcbiAgICB0aGlzLmV2ZW50SW5kZXggPSAwXG4gICAgdGhpcy5ub3RlSW5kZXggPSAwXG4gICAgdGhpcy5wYXJ0SW5kZXggPSAwXG4gICAgdGhpcy5jYWxjdWxhdGUoKVxuICAgIHJldHVybiB0aGlzLmRhdGFcbiAgfVxuXG5cbiAgZ2V0KCl7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICB1cGRhdGUodW5pdCwgZGlmZil7XG4gICAgaWYoZGlmZiA9PT0gMCl7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhXG4gICAgfVxuICAgIHRoaXMudW5pdCA9IHVuaXRcbiAgICB0aGlzLmN1cnJlbnRWYWx1ZSArPSBkaWZmXG4gICAgdGhpcy5jYWxjdWxhdGUoKVxuICAgIHJldHVybiB0aGlzLmRhdGFcbiAgfVxuXG5cbiAgdXBkYXRlU29uZygpe1xuICAgIHRoaXMuZXZlbnRzID0gWy4uLnRoaXMuc29uZy5fZXZlbnRzLCAuLi50aGlzLnNvbmcuX3RpbWVFdmVudHNdXG4gICAgc29ydEV2ZW50cyh0aGlzLmV2ZW50cylcbiAgICAvL2NvbnNvbGUubG9nKCdldmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICB0aGlzLm5vdGVzID0gdGhpcy5zb25nLl9ub3Rlc1xuICAgIHRoaXMucGFydHMgPSB0aGlzLnNvbmcuX3BhcnRzXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLm51bU5vdGVzID0gdGhpcy5ub3Rlcy5sZW5ndGhcbiAgICB0aGlzLm51bVBhcnRzID0gdGhpcy5wYXJ0cy5sZW5ndGhcbiAgICB0aGlzLnNldCgnbWlsbGlzJywgdGhpcy5zb25nLl9taWxsaXMpXG4gIH1cblxuXG4gIGNhbGN1bGF0ZSgpe1xuICAgIGxldCBpXG4gICAgbGV0IHZhbHVlXG4gICAgbGV0IGV2ZW50XG4gICAgbGV0IG5vdGVcbiAgICBsZXQgcGFydFxuICAgIGxldCBwb3NpdGlvblxuICAgIGxldCBzdGlsbEFjdGl2ZU5vdGVzID0gW11cbiAgICBsZXQgc3RpbGxBY3RpdmVQYXJ0cyA9IFtdXG4gICAgbGV0IGNvbGxlY3RlZFBhcnRzID0gbmV3IFNldCgpXG4gICAgbGV0IGNvbGxlY3RlZE5vdGVzID0gbmV3IFNldCgpXG5cbiAgICB0aGlzLmRhdGEgPSB7fVxuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW11cblxuICAgIGZvcihpID0gdGhpcy5ldmVudEluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IHRoaXMuZXZlbnRzW2ldXG4gICAgICB2YWx1ZSA9IGV2ZW50W3RoaXMudW5pdF1cbiAgICAgIGlmKHZhbHVlIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgLy8gaWYgdGhlIHBsYXloZWFkIGlzIHNldCB0byBhIHBvc2l0aW9uIG9mIHNheSAzMDAwIG1pbGxpcywgd2UgZG9uJ3Qgd2FudCB0byBhZGQgZXZlbnRzIG1vcmUgdGhhdCAxMCB1bml0cyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgIGlmKHZhbHVlID09PSAwIHx8IHZhbHVlID4gdGhpcy5jdXJyZW50VmFsdWUgLSByYW5nZSl7XG4gICAgICAgICAgdGhpcy5hY3RpdmVFdmVudHMucHVzaChldmVudClcbiAgICAgICAgICAvLyB0aGlzIGRvZXNuJ3Qgd29yayB0b28gd2VsbFxuICAgICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMilcbiAgICAgICAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwyJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBldmVudC5kYXRhMiA9PT0gMTI3ID8gJ2Rvd24nIDogJ3VwJ1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIC8vIH1lbHNle1xuICAgICAgICAgIC8vICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgLy8gICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgLy8gICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgLy8gICB9KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIHRoaXMuZXZlbnRJbmRleCsrXG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgIHRoaXMuZGF0YS5hY3RpdmVFdmVudHMgPSB0aGlzLmFjdGl2ZUV2ZW50c1xuXG4gICAgLy8gaWYgYSBzb25nIGhhcyBubyBldmVudHMgeWV0LCB1c2UgdGhlIGZpcnN0IHRpbWUgZXZlbnQgYXMgcmVmZXJlbmNlXG4gICAgaWYodGhpcy5sYXN0RXZlbnQgPT09IG51bGwpe1xuICAgICAgdGhpcy5sYXN0RXZlbnQgPSB0aGlzLnNvbmcuX3RpbWVFdmVudHNbMF1cbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IGdldFBvc2l0aW9uMih0aGlzLnNvbmcsIHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUsICdhbGwnLCB0aGlzLmxhc3RFdmVudClcbiAgICB0aGlzLmRhdGEuZXZlbnRJbmRleCA9IHRoaXMuZXZlbnRJbmRleFxuICAgIHRoaXMuZGF0YS5taWxsaXMgPSBwb3NpdGlvbi5taWxsaXNcbiAgICB0aGlzLmRhdGEudGlja3MgPSBwb3NpdGlvbi50aWNrc1xuICAgIHRoaXMuZGF0YS5wb3NpdGlvbiA9IHBvc2l0aW9uXG5cbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKXtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhXG4gICAgICBmb3IobGV0IGtleSBvZiBPYmplY3Qua2V5cyhwb3NpdGlvbikpe1xuICAgICAgICBkYXRhW2tleV0gPSBwb3NpdGlvbltrZXldXG4gICAgICB9XG4gICAgfWVsc2UgaWYodGhpcy50eXBlLmluZGV4T2YoJ2JhcnNiZWF0cycpICE9PSAtMSl7XG4gICAgICB0aGlzLmRhdGEuYmFyID0gcG9zaXRpb24uYmFyXG4gICAgICB0aGlzLmRhdGEuYmVhdCA9IHBvc2l0aW9uLmJlYXRcbiAgICAgIHRoaXMuZGF0YS5zaXh0ZWVudGggPSBwb3NpdGlvbi5zaXh0ZWVudGhcbiAgICAgIHRoaXMuZGF0YS50aWNrID0gcG9zaXRpb24udGlja1xuICAgICAgdGhpcy5kYXRhLmJhcnNBc1N0cmluZyA9IHBvc2l0aW9uLmJhcnNBc1N0cmluZ1xuXG4gICAgICB0aGlzLmRhdGEudGlja3NQZXJCYXIgPSBwb3NpdGlvbi50aWNrc1BlckJhclxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmVhdCA9IHBvc2l0aW9uLnRpY2tzUGVyQmVhdFxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gcG9zaXRpb24udGlja3NQZXJTaXh0ZWVudGhcbiAgICAgIHRoaXMuZGF0YS5udW1TaXh0ZWVudGggPSBwb3NpdGlvbi5udW1TaXh0ZWVudGhcblxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCd0aW1lJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5ob3VyID0gcG9zaXRpb24uaG91clxuICAgICAgdGhpcy5kYXRhLm1pbnV0ZSA9IHBvc2l0aW9uLm1pbnV0ZVxuICAgICAgdGhpcy5kYXRhLnNlY29uZCA9IHBvc2l0aW9uLnNlY29uZFxuICAgICAgdGhpcy5kYXRhLm1pbGxpc2Vjb25kID0gcG9zaXRpb24ubWlsbGlzZWNvbmRcbiAgICAgIHRoaXMuZGF0YS50aW1lQXNTdHJpbmcgPSBwb3NpdGlvbi50aW1lQXNTdHJpbmdcblxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCdwZXJjZW50YWdlJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5wZXJjZW50YWdlID0gcG9zaXRpb24ucGVyY2VudGFnZVxuICAgIH1cblxuICAgIC8vIGdldCBhY3RpdmUgbm90ZXNcbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZignbm90ZXMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG5cbiAgICAgIC8vIGdldCBhbGwgbm90ZXMgYmV0d2VlbiB0aGUgbm90ZUluZGV4IGFuZCB0aGUgY3VycmVudCBwbGF5aGVhZCBwb3NpdGlvblxuICAgICAgZm9yKGkgPSB0aGlzLm5vdGVJbmRleDsgaSA8IHRoaXMubnVtTm90ZXM7IGkrKyl7XG4gICAgICAgIG5vdGUgPSB0aGlzLm5vdGVzW2ldXG4gICAgICAgIHZhbHVlID0gbm90ZS5ub3RlT25bdGhpcy51bml0XVxuICAgICAgICBpZih2YWx1ZSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgdGhpcy5ub3RlSW5kZXgrK1xuICAgICAgICAgIGlmKHR5cGVvZiBub3RlLm5vdGVPZmYgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBpZiB0aGUgcGxheWhlYWQgaXMgc2V0IHRvIGEgcG9zaXRpb24gb2Ygc2F5IDMwMDAgbWlsbGlzLCB3ZSBkb24ndCB3YW50IHRvIGFkZCBub3RlcyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgICAgaWYodGhpcy5jdXJyZW50VmFsdWUgPT09IDAgfHwgbm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgICBjb2xsZWN0ZWROb3Rlcy5hZGQobm90ZSlcbiAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgICB0eXBlOiAnbm90ZU9uJyxcbiAgICAgICAgICAgICAgZGF0YTogbm90ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGZpbHRlciBub3RlcyB0aGF0IGFyZSBubyBsb25nZXIgYWN0aXZlXG4gICAgICBmb3IoaSA9IHRoaXMuYWN0aXZlTm90ZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgICBub3RlID0gdGhpcy5hY3RpdmVOb3Rlc1tpXTtcbiAgICAgICAgLy9pZihub3RlLm5vdGVPbi5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9ub3Rlc0J5SWQuZ2V0KG5vdGUuaWQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHRoaXMuc29uZy5fbm90ZXNCeUlkLmdldChub3RlLmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgbm90ZScsIG5vdGUuaWQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnNvbGUud2Fybignbm90ZSB3aXRoIGlkJywgbm90ZS5pZCwgJ2hhcyBubyBub3RlT2ZmIGV2ZW50Jyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkTm90ZXMuaGFzKG5vdGUpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHN0aWxsQWN0aXZlTm90ZXMucHVzaChub3RlKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnbm90ZU9mZicsXG4gICAgICAgICAgICBkYXRhOiBub3RlXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBhZGQgdGhlIHN0aWxsIGFjdGl2ZSBub3RlcyBhbmQgdGhlIG5ld2x5IGFjdGl2ZSBldmVudHMgdG8gdGhlIGFjdGl2ZSBub3RlcyBhcnJheVxuICAgICAgdGhpcy5hY3RpdmVOb3RlcyA9IFsuLi5jb2xsZWN0ZWROb3Rlcy52YWx1ZXMoKSwgLi4uc3RpbGxBY3RpdmVOb3Rlc11cbiAgICAgIHRoaXMuZGF0YS5hY3RpdmVOb3RlcyA9IHRoaXMuYWN0aXZlTm90ZXNcbiAgICB9XG5cblxuICAgIC8vIGdldCBhY3RpdmUgcGFydHNcbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZigncGFydHMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG5cbiAgICAgIGZvcihpID0gdGhpcy5wYXJ0SW5kZXg7IGkgPCB0aGlzLm51bVBhcnRzOyBpKyspe1xuICAgICAgICBwYXJ0ID0gdGhpcy5wYXJ0c1tpXVxuICAgICAgICAvL2NvbnNvbGUubG9nKHBhcnQsIHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgICAgICBpZihwYXJ0Ll9zdGFydFt0aGlzLnVuaXRdIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICBjb2xsZWN0ZWRQYXJ0cy5hZGQocGFydClcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdwYXJ0T24nLFxuICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgIH0pXG4gICAgICAgICAgdGhpcy5wYXJ0SW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgICAgLy8gZmlsdGVyIHBhcnRzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgIGZvcihpID0gdGhpcy5hY3RpdmVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgICAgIHBhcnQgPSB0aGlzLmFjdGl2ZVBhcnRzW2ldO1xuICAgICAgICAvL2lmKHBhcnQuc3RhdGUuaW5kZXhPZigncmVtb3ZlZCcpID09PSAwIHx8IHRoaXMuc29uZy5fcGFydHNCeUlkLmdldChwYXJ0LmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICBpZih0aGlzLnNvbmcuX3BhcnRzQnlJZC5nZXQocGFydC5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdza2lwcGluZyByZW1vdmVkIHBhcnQnLCBwYXJ0LmlkKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYocGFydC5fZW5kW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSAmJiBjb2xsZWN0ZWRQYXJ0cy5oYXMocGFydCkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYocGFydC5fZW5kW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgc3RpbGxBY3RpdmVQYXJ0cy5wdXNoKG5vdGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdwYXJ0T2ZmJyxcbiAgICAgICAgICAgIGRhdGE6IHBhcnRcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWN0aXZlUGFydHMgPSBbLi4uY29sbGVjdGVkUGFydHMudmFsdWVzKCksIC4uLnN0aWxsQWN0aXZlUGFydHNdXG4gICAgICB0aGlzLmRhdGEuYWN0aXZlUGFydHMgPSB0aGlzLmFjdGl2ZVBhcnRzXG4gICAgfVxuXG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgfSlcblxuICB9XG5cbi8qXG4gIHNldFR5cGUodCl7XG4gICAgdGhpcy50eXBlID0gdDtcbiAgICB0aGlzLnNldCh0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG5cblxuICBhZGRUeXBlKHQpe1xuICAgIHRoaXMudHlwZSArPSAnICcgKyB0O1xuICAgIHRoaXMuc2V0KHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gIH1cblxuICByZW1vdmVUeXBlKHQpe1xuICAgIHZhciBhcnIgPSB0aGlzLnR5cGUuc3BsaXQoJyAnKTtcbiAgICB0aGlzLnR5cGUgPSAnJztcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbih0eXBlKXtcbiAgICAgIGlmKHR5cGUgIT09IHQpe1xuICAgICAgICB0aGlzLnR5cGUgKz0gdCArICcgJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnR5cGUudHJpbSgpO1xuICAgIHRoaXMuc2V0KHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG4qL1xuXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7Z2V0TmljZVRpbWV9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0XG4gIHN1cHBvcnRlZFR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlJyxcbiAgc3VwcG9ydGVkUmV0dXJuVHlwZXMgPSAnYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBhbGwnLFxuICBmbG9vciA9IE1hdGguZmxvb3IsXG4gIHJvdW5kID0gTWF0aC5yb3VuZDtcblxuXG5sZXRcbiAgLy9sb2NhbFxuICBicG0sXG4gIG5vbWluYXRvcixcbiAgZGVub21pbmF0b3IsXG5cbiAgdGlja3NQZXJCZWF0LFxuICB0aWNrc1BlckJhcixcbiAgdGlja3NQZXJTaXh0ZWVudGgsXG5cbiAgbWlsbGlzUGVyVGljayxcbiAgc2Vjb25kc1BlclRpY2ssXG4gIG51bVNpeHRlZW50aCxcblxuICB0aWNrcyxcbiAgbWlsbGlzLFxuICBkaWZmVGlja3MsXG4gIGRpZmZNaWxsaXMsXG5cbiAgYmFyLFxuICBiZWF0LFxuICBzaXh0ZWVudGgsXG4gIHRpY2ssXG5cbi8vICB0eXBlLFxuICBpbmRleCxcbiAgcmV0dXJuVHlwZSA9ICdhbGwnLFxuICBiZXlvbmRFbmRPZlNvbmcgPSB0cnVlO1xuXG5cbmZ1bmN0aW9uIGdldFRpbWVFdmVudChzb25nLCB1bml0LCB0YXJnZXQpe1xuICAvLyBmaW5kcyB0aGUgdGltZSBldmVudCB0aGF0IGNvbWVzIHRoZSBjbG9zZXN0IGJlZm9yZSB0aGUgdGFyZ2V0IHBvc2l0aW9uXG4gIGxldCB0aW1lRXZlbnRzID0gc29uZy5fdGltZUV2ZW50c1xuXG4gIGZvcihsZXQgaSA9IHRpbWVFdmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgIGxldCBldmVudCA9IHRpbWVFdmVudHNbaV07XG4gICAgLy9jb25zb2xlLmxvZyh1bml0LCB0YXJnZXQsIGV2ZW50KVxuICAgIGlmKGV2ZW50W3VuaXRdIDw9IHRhcmdldCl7XG4gICAgICBpbmRleCA9IGlcbiAgICAgIHJldHVybiBldmVudFxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNUb1RpY2tzKHNvbmcsIHRhcmdldE1pbGxpcywgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0TWlsbGlzKVxuICAvL3JldHVybiByb3VuZCh0aWNrcyk7XG4gIHJldHVybiB0aWNrc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrc1RvTWlsbGlzKHNvbmcsIHRhcmdldFRpY2tzLCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldFRpY2tzKVxuICByZXR1cm4gbWlsbGlzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGJhcnNUb01pbGxpcyhzb25nLCBwb3NpdGlvbiwgYmVvcyl7IC8vIGJlb3MgPSBiZXlvbmRFbmRPZlNvbmdcbiAgY2FsY3VsYXRlUG9zaXRpb24oc29uZywge1xuICAgIHR5cGU6ICdiYXJzYmVhdCcsXG4gICAgcG9zaXRpb24sXG4gICAgcmVzdWx0OiAnbWlsbGlzJyxcbiAgICBiZW9zLFxuICB9KVxuICByZXR1cm4gbWlsbGlzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGJhcnNUb1RpY2tzKHNvbmcsIHBvc2l0aW9uLCBiZW9zKXsgLy8gYmVvcyA9IGJleW9uZEVuZE9mU29uZ1xuICBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgcG9zaXRpb24sXG4gICAgcmVzdWx0OiAndGlja3MnLFxuICAgIGJlb3NcbiAgfSlcbiAgLy9yZXR1cm4gcm91bmQodGlja3MpO1xuICByZXR1cm4gdGlja3Ncbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdGlja3NUb0JhcnMoc29uZywgdGFyZ2V0LCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldClcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgcmV0dXJuVHlwZSA9ICdiYXJzYW5kYmVhdHMnXG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNUb0JhcnMoc29uZywgdGFyZ2V0LCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQpXG4gIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJ1xuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKClcbn1cblxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciBtaWxsaXMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0TWlsbGlzLCBldmVudCl7XG4gIGxldCBsYXN0RXZlbnQgPSBzb25nLl9sYXN0RXZlbnQ7XG5cbiAgaWYoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSl7XG4gICAgaWYodGFyZ2V0TWlsbGlzID4gbGFzdEV2ZW50Lm1pbGxpcyl7XG4gICAgICB0YXJnZXRNaWxsaXMgPSBsYXN0RXZlbnQubWlsbGlzO1xuICAgIH1cbiAgfVxuXG4gIGlmKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdtaWxsaXMnLCB0YXJnZXRNaWxsaXMpO1xuICB9XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG4gIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuXG4gIC8vIGlmIHRoZSBldmVudCBpcyBub3QgZXhhY3RseSBhdCB0YXJnZXQgbWlsbGlzLCBjYWxjdWxhdGUgdGhlIGRpZmZcbiAgaWYoZXZlbnQubWlsbGlzID09PSB0YXJnZXRNaWxsaXMpe1xuICAgIGRpZmZNaWxsaXMgPSAwO1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gIH1lbHNle1xuICAgIGRpZmZNaWxsaXMgPSB0YXJnZXRNaWxsaXMgLSBldmVudC5taWxsaXM7XG4gICAgZGlmZlRpY2tzID0gZGlmZk1pbGxpcyAvIG1pbGxpc1BlclRpY2s7XG4gIH1cblxuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuXG4gIHJldHVybiB0aWNrcztcbn1cblxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciB0aWNrcyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbVRpY2tzKHNvbmcsIHRhcmdldFRpY2tzLCBldmVudCl7XG4gIGxldCBsYXN0RXZlbnQgPSBzb25nLl9sYXN0RXZlbnQ7XG5cbiAgaWYoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSl7XG4gICAgaWYodGFyZ2V0VGlja3MgPiBsYXN0RXZlbnQudGlja3Mpe1xuICAgICAgdGFyZ2V0VGlja3MgPSBsYXN0RXZlbnQudGlja3M7XG4gICAgfVxuICB9XG5cbiAgaWYodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ3RpY2tzJywgdGFyZ2V0VGlja3MpO1xuICB9XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG4gIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuXG4gIC8vIGlmIHRoZSBldmVudCBpcyBub3QgZXhhY3RseSBhdCB0YXJnZXQgdGlja3MsIGNhbGN1bGF0ZSB0aGUgZGlmZlxuICBpZihldmVudC50aWNrcyA9PT0gdGFyZ2V0VGlja3Mpe1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gICAgZGlmZk1pbGxpcyA9IDA7XG4gIH1lbHNle1xuICAgIGRpZmZUaWNrcyA9IHRhcmdldFRpY2tzIC0gdGlja3M7XG4gICAgZGlmZk1pbGxpcyA9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG4gIH1cblxuICB0aWNrcyArPSBkaWZmVGlja3M7XG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuXG4gIHJldHVybiBtaWxsaXM7XG59XG5cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgYmFycyBhbmQgYmVhdHMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21CYXJzKHNvbmcsIHRhcmdldEJhciwgdGFyZ2V0QmVhdCwgdGFyZ2V0U2l4dGVlbnRoLCB0YXJnZXRUaWNrLCBldmVudCA9IG51bGwpe1xuICAvL2NvbnNvbGUudGltZSgnZnJvbUJhcnMnKTtcbiAgbGV0IGkgPSAwLFxuICAgIGRpZmZCYXJzLFxuICAgIGRpZmZCZWF0cyxcbiAgICBkaWZmU2l4dGVlbnRoLFxuICAgIGRpZmZUaWNrLFxuICAgIGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRCYXIgPiBsYXN0RXZlbnQuYmFyKXtcbiAgICAgIHRhcmdldEJhciA9IGxhc3RFdmVudC5iYXI7XG4gICAgfVxuICB9XG5cbiAgaWYoZXZlbnQgPT09IG51bGwpe1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdiYXInLCB0YXJnZXRCYXIpO1xuICB9XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG4gIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuXG4gIC8vY29ycmVjdCB3cm9uZyBwb3NpdGlvbiBkYXRhLCBmb3IgaW5zdGFuY2U6ICczLDMsMiw3ODgnIGJlY29tZXMgJzMsNCw0LDA2OCcgaW4gYSA0LzQgbWVhc3VyZSBhdCBQUFEgNDgwXG4gIHdoaWxlKHRhcmdldFRpY2sgPj0gdGlja3NQZXJTaXh0ZWVudGgpe1xuICAgIHRhcmdldFNpeHRlZW50aCsrO1xuICAgIHRhcmdldFRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gIH1cblxuICB3aGlsZSh0YXJnZXRTaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgIHRhcmdldEJlYXQrKztcbiAgICB0YXJnZXRTaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICB9XG5cbiAgd2hpbGUodGFyZ2V0QmVhdCA+IG5vbWluYXRvcil7XG4gICAgdGFyZ2V0QmFyKys7XG4gICAgdGFyZ2V0QmVhdCAtPSBub21pbmF0b3I7XG4gIH1cblxuICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnYmFyJywgdGFyZ2V0QmFyLCBpbmRleCk7XG4gIGZvcihpID0gaW5kZXg7IGkgPj0gMDsgaS0tKXtcbiAgICBldmVudCA9IHNvbmcuX3RpbWVFdmVudHNbaV07XG4gICAgaWYoZXZlbnQuYmFyIDw9IHRhcmdldEJhcil7XG4gICAgICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIGdldCB0aGUgZGlmZmVyZW5jZXNcbiAgZGlmZlRpY2sgPSB0YXJnZXRUaWNrIC0gdGljaztcbiAgZGlmZlNpeHRlZW50aCA9IHRhcmdldFNpeHRlZW50aCAtIHNpeHRlZW50aDtcbiAgZGlmZkJlYXRzID0gdGFyZ2V0QmVhdCAtIGJlYXQ7XG4gIGRpZmZCYXJzID0gdGFyZ2V0QmFyIC0gYmFyOyAvL2JhciBpcyBhbHdheXMgbGVzcyB0aGVuIG9yIGVxdWFsIHRvIHRhcmdldEJhciwgc28gZGlmZkJhcnMgaXMgYWx3YXlzID49IDBcblxuICAvL2NvbnNvbGUubG9nKCdkaWZmJyxkaWZmQmFycyxkaWZmQmVhdHMsZGlmZlNpeHRlZW50aCxkaWZmVGljayk7XG4gIC8vY29uc29sZS5sb2coJ21pbGxpcycsbWlsbGlzLHRpY2tzUGVyQmFyLHRpY2tzUGVyQmVhdCx0aWNrc1BlclNpeHRlZW50aCxtaWxsaXNQZXJUaWNrKTtcblxuICAvLyBjb252ZXJ0IGRpZmZlcmVuY2VzIHRvIG1pbGxpc2Vjb25kcyBhbmQgdGlja3NcbiAgZGlmZk1pbGxpcyA9IChkaWZmQmFycyAqIHRpY2tzUGVyQmFyKSAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gKGRpZmZCZWF0cyAqIHRpY2tzUGVyQmVhdCkgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IChkaWZmU2l4dGVlbnRoICogdGlja3NQZXJTaXh0ZWVudGgpICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSBkaWZmVGljayAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZUaWNrcyA9IGRpZmZNaWxsaXMgLyBtaWxsaXNQZXJUaWNrO1xuICAvL2NvbnNvbGUubG9nKGRpZmZCYXJzLCB0aWNrc1BlckJhciwgbWlsbGlzUGVyVGljaywgZGlmZk1pbGxpcywgZGlmZlRpY2tzKTtcblxuICAvLyBzZXQgYWxsIGN1cnJlbnQgcG9zaXRpb24gZGF0YVxuICBiYXIgPSB0YXJnZXRCYXI7XG4gIGJlYXQgPSB0YXJnZXRCZWF0O1xuICBzaXh0ZWVudGggPSB0YXJnZXRTaXh0ZWVudGg7XG4gIHRpY2sgPSB0YXJnZXRUaWNrO1xuICAvL2NvbnNvbGUubG9nKHRpY2ssIHRhcmdldFRpY2spXG5cbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG4gIC8vY29uc29sZS5sb2codGFyZ2V0QmFyLCB0YXJnZXRCZWF0LCB0YXJnZXRTaXh0ZWVudGgsIHRhcmdldFRpY2ssICcgLT4gJywgbWlsbGlzKTtcbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuXG4gIC8vY29uc29sZS50aW1lRW5kKCdmcm9tQmFycycpO1xufVxuXG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpe1xuICAvLyBzcHJlYWQgdGhlIGRpZmZlcmVuY2UgaW4gdGljayBvdmVyIGJhcnMsIGJlYXRzIGFuZCBzaXh0ZWVudGhcbiAgbGV0IHRtcCA9IHJvdW5kKGRpZmZUaWNrcyk7XG4gIHdoaWxlKHRtcCA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgc2l4dGVlbnRoKys7XG4gICAgdG1wIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICAgIHdoaWxlKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgYmVhdCsrO1xuICAgICAgd2hpbGUoYmVhdCA+IG5vbWluYXRvcil7XG4gICAgICAgIGJlYXQgLT0gbm9taW5hdG9yO1xuICAgICAgICBiYXIrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdGljayA9IHJvdW5kKHRtcCk7XG59XG5cblxuLy8gc3RvcmUgcHJvcGVydGllcyBvZiBldmVudCBpbiBsb2NhbCBzY29wZVxuZnVuY3Rpb24gZ2V0RGF0YUZyb21FdmVudChldmVudCl7XG5cbiAgYnBtID0gZXZlbnQuYnBtO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG4gIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIC8vY29uc29sZS5sb2coYnBtLCBldmVudC50eXBlKTtcbiAgLy9jb25zb2xlLmxvZygndGlja3MnLCB0aWNrcywgJ21pbGxpcycsIG1pbGxpcywgJ2JhcicsIGJhcik7XG59XG5cblxuZnVuY3Rpb24gZ2V0UG9zaXRpb25EYXRhKHNvbmcpe1xuICBsZXQgdGltZURhdGEsXG4gICAgcG9zaXRpb25EYXRhID0ge307XG5cbiAgc3dpdGNoKHJldHVyblR5cGUpe1xuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIC8vcG9zaXRpb25EYXRhLm1pbGxpcyA9IG1pbGxpcztcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXMgPSByb3VuZChtaWxsaXMgKiAxMDAwKSAvIDEwMDA7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUm91bmRlZCA9IHJvdW5kKG1pbGxpcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzID0gdGlja3M7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3MgPSByb3VuZCh0aWNrcyk7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrc1Vucm91bmRlZCA9IHRpY2tzO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyID0gYmFyO1xuICAgICAgcG9zaXRpb25EYXRhLmJlYXQgPSBiZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrID0gdGljaztcbiAgICAgIC8vcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIGdldFRpY2tBc1N0cmluZyh0aWNrKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICB0aW1lRGF0YSA9IGdldE5pY2VUaW1lKG1pbGxpcyk7XG4gICAgICBwb3NpdGlvbkRhdGEuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gICAgICBwb3NpdGlvbkRhdGEubWludXRlID0gdGltZURhdGEubWludXRlO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIC8vIG1pbGxpc1xuICAgICAgLy9wb3NpdGlvbkRhdGEubWlsbGlzID0gbWlsbGlzO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpcyA9IHJvdW5kKG1pbGxpcyAqIDEwMDApIC8gMTAwMDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNSb3VuZGVkID0gcm91bmQobWlsbGlzKTtcblxuICAgICAgLy8gdGlja3NcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzID0gdGlja3M7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3MgPSByb3VuZCh0aWNrcyk7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrc1Vucm91bmRlZCA9IHRpY2tzO1xuXG4gICAgICAvLyBiYXJzYmVhdHNcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXIgPSBiYXI7XG4gICAgICBwb3NpdGlvbkRhdGEuYmVhdCA9IGJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2sgPSB0aWNrO1xuICAgICAgLy9wb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2tBc1N0cmluZztcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgZ2V0VGlja0FzU3RyaW5nKHRpY2spO1xuXG4gICAgICAvLyB0aW1lXG4gICAgICB0aW1lRGF0YSA9IGdldE5pY2VUaW1lKG1pbGxpcyk7XG4gICAgICBwb3NpdGlvbkRhdGEuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gICAgICBwb3NpdGlvbkRhdGEubWludXRlID0gdGltZURhdGEubWludXRlO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcblxuICAgICAgLy8gZXh0cmEgZGF0YVxuICAgICAgcG9zaXRpb25EYXRhLmJwbSA9IHJvdW5kKGJwbSAqIHNvbmcucGxheWJhY2tTcGVlZCwgMyk7XG4gICAgICBwb3NpdGlvbkRhdGEubm9taW5hdG9yID0gbm9taW5hdG9yO1xuICAgICAgcG9zaXRpb25EYXRhLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyQmVhdCA9IHRpY2tzUGVyQmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gICAgICBwb3NpdGlvbkRhdGEubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgIC8vIHVzZSB0aWNrcyB0byBtYWtlIHRlbXBvIGNoYW5nZXMgdmlzaWJsZSBieSBhIGZhc3RlciBtb3ZpbmcgcGxheWhlYWRcbiAgICAgIHBvc2l0aW9uRGF0YS5wZXJjZW50YWdlID0gdGlja3MgLyBzb25nLl9kdXJhdGlvblRpY2tzO1xuICAgICAgLy9wb3NpdGlvbkRhdGEucGVyY2VudGFnZSA9IG1pbGxpcyAvIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbkRhdGFcbn1cblxuXG5mdW5jdGlvbiBnZXRUaWNrQXNTdHJpbmcodCl7XG4gIGlmKHQgPT09IDApe1xuICAgIHQgPSAnMDAwJ1xuICB9ZWxzZSBpZih0IDwgMTApe1xuICAgIHQgPSAnMDAnICsgdFxuICB9ZWxzZSBpZih0IDwgMTAwKXtcbiAgICB0ID0gJzAnICsgdFxuICB9XG4gIHJldHVybiB0XG59XG5cblxuLy8gdXNlZCBieSBwbGF5aGVhZFxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvc2l0aW9uMihzb25nLCB1bml0LCB0YXJnZXQsIHR5cGUsIGV2ZW50KXtcbiAgaWYodW5pdCA9PT0gJ21pbGxpcycpe1xuICAgIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0LCBldmVudCk7XG4gIH1lbHNlIGlmKHVuaXQgPT09ICd0aWNrcycpe1xuICAgIGZyb21UaWNrcyhzb25nLCB0YXJnZXQsIGV2ZW50KTtcbiAgfVxuICByZXR1cm5UeXBlID0gdHlwZVxuICBpZihyZXR1cm5UeXBlID09PSAnYWxsJyl7XG4gICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gIH1cbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcbn1cblxuXG4vLyBpbXByb3ZlZCB2ZXJzaW9uIG9mIGdldFBvc2l0aW9uXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb24oc29uZywgc2V0dGluZ3Mpe1xuICBsZXQge1xuICAgIHR5cGUsIC8vIGFueSBvZiBiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIHBlcmMgcGVyY2VudGFnZVxuICAgIHRhcmdldCwgLy8gaWYgdHlwZSBpcyBiYXJzYmVhdHMgb3IgdGltZSwgdGFyZ2V0IG11c3QgYmUgYW4gYXJyYXksIGVsc2UgaWYgbXVzdCBiZSBhIG51bWJlclxuICAgIHJlc3VsdDogcmVzdWx0ID0gJ2FsbCcsIC8vIGFueSBvZiBiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIGFsbFxuICAgIGJlb3M6IGJlb3MgPSB0cnVlLFxuICAgIHNuYXA6IHNuYXAgPSAtMVxuICB9ID0gc2V0dGluZ3NcblxuICBpZihzdXBwb3J0ZWRSZXR1cm5UeXBlcy5pbmRleE9mKHJlc3VsdCkgPT09IC0xKXtcbiAgICBjb25zb2xlLndhcm4oYHVuc3VwcG9ydGVkIHJldHVybiB0eXBlLCAnYWxsJyB1c2VkIGluc3RlYWQgb2YgJyR7cmVzdWx0fSdgKVxuICAgIHJlc3VsdCA9ICdhbGwnXG4gIH1cblxuICByZXR1cm5UeXBlID0gcmVzdWx0XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcblxuICBpZihzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpID09PSAtMSl7XG4gICAgY29uc29sZS5lcnJvcihgdW5zdXBwb3J0ZWQgdHlwZSAke3R5cGV9YClcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG5cbiAgc3dpdGNoKHR5cGUpe1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgbGV0IFt0YXJnZXRiYXIgPSAxLCB0YXJnZXRiZWF0ID0gMSwgdGFyZ2V0c2l4dGVlbnRoID0gMSwgdGFyZ2V0dGljayA9IDBdID0gdGFyZ2V0XG4gICAgICAvL2NvbnNvbGUubG9nKHRhcmdldGJhciwgdGFyZ2V0YmVhdCwgdGFyZ2V0c2l4dGVlbnRoLCB0YXJnZXR0aWNrKVxuICAgICAgZnJvbUJhcnMoc29uZywgdGFyZ2V0YmFyLCB0YXJnZXRiZWF0LCB0YXJnZXRzaXh0ZWVudGgsIHRhcmdldHRpY2spXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIC8vIGNhbGN1bGF0ZSBtaWxsaXMgb3V0IG9mIHRpbWUgYXJyYXk6IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcbiAgICAgIGxldCBbdGFyZ2V0aG91ciA9IDAsIHRhcmdldG1pbnV0ZSA9IDAsIHRhcmdldHNlY29uZCA9IDAsIHRhcmdldG1pbGxpc2Vjb25kID0gMF0gPSB0YXJnZXRcbiAgICAgIGxldCBtaWxsaXMgPSAwXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0aG91ciAqIDYwICogNjAgKiAxMDAwIC8vaG91cnNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRtaW51dGUgKiA2MCAqIDEwMDAgLy9taW51dGVzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0c2Vjb25kICogMTAwMCAvL3NlY29uZHNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRtaWxsaXNlY29uZCAvL21pbGxpc2Vjb25kc1xuXG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIG1pbGxpcylcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldClcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICdwZXJjJzpcbiAgICBjYXNlICdwZXJjZW50YWdlJzpcblxuICAgICAgLy9taWxsaXMgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICAvL2Zyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzKTtcblxuICAgICAgdGlja3MgPSB0YXJnZXQgKiBzb25nLl9kdXJhdGlvblRpY2tzIC8vIHRhcmdldCBtdXN0IGJlIGluIHRpY2tzIVxuICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcywgc29uZy5fZHVyYXRpb25UaWNrcylcbiAgICAgIGlmKHNuYXAgIT09IC0xKXtcbiAgICAgICAgdGlja3MgPSBmbG9vcih0aWNrcyAvIHNuYXApICogc25hcDtcbiAgICAgICAgLy9mcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRpY2tzKTtcbiAgICAgIH1cbiAgICAgIGZyb21UaWNrcyhzb25nLCB0aWNrcylcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICBsZXQgdG1wID0gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG4gICAgICAvL2NvbnNvbGUubG9nKCdkaWZmJywgcG9zaXRpb25bMV0gLSB0bXAucGVyY2VudGFnZSk7XG4gICAgICByZXR1cm4gdG1wXG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuLypcblxuLy9AcGFyYW06ICdtaWxsaXMnLCAxMDAwLCBbdHJ1ZV1cbi8vQHBhcmFtOiAndGlja3MnLCAxMDAwLCBbdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgMSwgWydhbGwnLCB0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCA2MCwgNCwgMywgMTIwLCBbJ2FsbCcsIHRydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDYwLCA0LCAzLCAxMjAsIFt0cnVlLCAnYWxsJ11cblxuZnVuY3Rpb24gY2hlY2tQb3NpdGlvbih0eXBlLCBhcmdzLCByZXR1cm5UeXBlID0gJ2FsbCcpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSB0cnVlO1xuICBjb25zb2xlLmxvZygnLS0tLT4gY2hlY2tQb3NpdGlvbjonLCBhcmdzLCB0eXBlU3RyaW5nKGFyZ3MpKTtcblxuICBpZih0eXBlU3RyaW5nKGFyZ3MpID09PSAnYXJyYXknKXtcbiAgICBsZXRcbiAgICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICAgIHBvc2l0aW9uLFxuICAgICAgaSwgYSwgcG9zaXRpb25MZW5ndGg7XG5cbiAgICB0eXBlID0gYXJnc1swXTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIFtbJ21pbGxpcycsIDMwMDBdXVxuICAgIGlmKHR5cGVTdHJpbmcoYXJnc1swXSkgPT09ICdhcnJheScpe1xuICAgICAgLy9jb25zb2xlLndhcm4oJ3RoaXMgc2hvdWxkblxcJ3QgaGFwcGVuIScpO1xuICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICB0eXBlID0gYXJnc1swXTtcbiAgICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IFt0eXBlXTtcblxuICAgIGNvbnNvbGUubG9nKCdjaGVjayBwb3NpdGlvbicsIGFyZ3MsIG51bUFyZ3MsIHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkpO1xuXG4gICAgLy9jb25zb2xlLmxvZygnYXJnJywgMCwgJy0+JywgdHlwZSk7XG5cbiAgICBpZihzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpICE9PSAtMSl7XG4gICAgICBmb3IoaSA9IDE7IGkgPCBudW1BcmdzOyBpKyspe1xuICAgICAgICBhID0gYXJnc1tpXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnYXJnJywgaSwgJy0+JywgYSk7XG4gICAgICAgIGlmKGEgPT09IHRydWUgfHwgYSA9PT0gZmFsc2Upe1xuICAgICAgICAgIGJleW9uZEVuZE9mU29uZyA9IGE7XG4gICAgICAgIH1lbHNlIGlmKGlzTmFOKGEpKXtcbiAgICAgICAgICBpZihzdXBwb3J0ZWRSZXR1cm5UeXBlcy5pbmRleE9mKGEpICE9PSAtMSl7XG4gICAgICAgICAgICByZXR1cm5UeXBlID0gYTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICBwb3NpdGlvbi5wdXNoKGEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL2NoZWNrIG51bWJlciBvZiBhcmd1bWVudHMgLT4gZWl0aGVyIDEgbnVtYmVyIG9yIDQgbnVtYmVycyBpbiBwb3NpdGlvbiwgZS5nLiBbJ2JhcnNiZWF0cycsIDFdIG9yIFsnYmFyc2JlYXRzJywgMSwgMSwgMSwgMF0sXG4gICAgICAvLyBvciBbJ3BlcmMnLCAwLjU2LCBudW1iZXJPZlRpY2tzVG9TbmFwVG9dXG4gICAgICBwb3NpdGlvbkxlbmd0aCA9IHBvc2l0aW9uLmxlbmd0aDtcbiAgICAgIGlmKHBvc2l0aW9uTGVuZ3RoICE9PSAyICYmIHBvc2l0aW9uTGVuZ3RoICE9PSAzICYmIHBvc2l0aW9uTGVuZ3RoICE9PSA1KXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyhwb3NpdGlvbiwgcmV0dXJuVHlwZSwgYmV5b25kRW5kT2ZTb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9zaXRpb24oc29uZywgdHlwZSwgYXJncyl7XG4gIC8vY29uc29sZS5sb2coJ2dldFBvc2l0aW9uJywgYXJncyk7XG5cbiAgaWYodHlwZW9mIGFyZ3MgPT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4ge1xuICAgICAgbWlsbGlzOiAwXG4gICAgfVxuICB9XG5cbiAgbGV0IHBvc2l0aW9uID0gY2hlY2tQb3NpdGlvbih0eXBlLCBhcmdzKSxcbiAgICBtaWxsaXMsIHRtcCwgc25hcDtcblxuXG4gIGlmKHBvc2l0aW9uID09PSBmYWxzZSl7XG4gICAgZXJyb3IoJ3dyb25nIHBvc2l0aW9uIGRhdGEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzd2l0Y2godHlwZSl7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBmcm9tQmFycyhzb25nLCBwb3NpdGlvblsxXSwgcG9zaXRpb25bMl0sIHBvc2l0aW9uWzNdLCBwb3NpdGlvbls0XSk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICAvLyBjYWxjdWxhdGUgbWlsbGlzIG91dCBvZiB0aW1lIGFycmF5OiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG4gICAgICBtaWxsaXMgPSAwO1xuICAgICAgdG1wID0gcG9zaXRpb25bMV0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiA2MCAqIDYwICogMTAwMDsgLy9ob3Vyc1xuICAgICAgdG1wID0gcG9zaXRpb25bMl0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiA2MCAqIDEwMDA7IC8vbWludXRlc1xuICAgICAgdG1wID0gcG9zaXRpb25bM10gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiAxMDAwOyAvL3NlY29uZHNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzRdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wOyAvL21pbGxpc2Vjb25kc1xuXG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBwb3NpdGlvblsxXSk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICBmcm9tVGlja3Moc29uZywgcG9zaXRpb25bMV0pO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAncGVyYyc6XG4gICAgY2FzZSAncGVyY2VudGFnZSc6XG4gICAgICBzbmFwID0gcG9zaXRpb25bMl07XG5cbiAgICAgIC8vbWlsbGlzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgLy9mcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pbGxpcyk7XG5cbiAgICAgIHRpY2tzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uVGlja3M7XG4gICAgICBpZihzbmFwICE9PSB1bmRlZmluZWQpe1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzL3NuYXApICogc25hcDtcbiAgICAgICAgLy9mcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRpY2tzKTtcbiAgICAgIH1cbiAgICAgIGZyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHRtcCA9IGdldFBvc2l0aW9uRGF0YShzb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXA7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4qL1xuXG4iLCJpbXBvcnQge1xuICBNSURJRXZlbnRcbn0gZnJvbSAnLi9taWRpX2V2ZW50J1xuXG5pbXBvcnR7XG4gIE1JRElOb3RlLFxufSBmcm9tICcuL21pZGlfbm90ZSdcblxuaW1wb3J0e1xuICBQYXJ0LFxufSBmcm9tICcuL3BhcnQnXG5cbmltcG9ydHtcbiAgVHJhY2ssXG59IGZyb20gJy4vdHJhY2snXG5cbmltcG9ydCB7XG4gIEluc3RydW1lbnQsXG59IGZyb20gJy4vaW5zdHJ1bWVudCdcblxuaW1wb3J0IHtcbiAgU29uZyxcbn0gZnJvbSAnLi9zb25nJ1xuXG5pbXBvcnQge1xuICBwYXJzZU1JRElGaWxlXG59IGZyb20gJy4vbWlkaWZpbGUnXG5cbmltcG9ydCB7XG4gIGluaXQsXG59IGZyb20gJy4vaW5pdCdcblxuaW1wb3J0IHtcbiAgY29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG59IGZyb20gJy4vaW5pdF9hdWRpbydcblxuaW1wb3J0IHtcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcbn0gZnJvbSAnLi9pbml0X21pZGknXG5cbmltcG9ydCB7XG4gIHBhcnNlU2FtcGxlcyxcbn0gZnJvbSAnLi9wYXJzZV9hdWRpbydcblxuXG5jb25zdCBnZXRBdWRpb0NvbnRleHQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gY29udGV4dFxufVxuXG5jb25zdCBxYW1iaSA9IHtcbiAgdmVyc2lvbjogJzEuMC4wLWJldGEyJyxcblxuICAvLyBmcm9tIC4vdXRpbFxuICBwYXJzZVNhbXBsZXMsXG5cbiAgLy8gZnJvbSAuL2luaXRcbiAgaW5pdCxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgTUlESUV2ZW50LFxuXG4gIC8vIGZyb20gLi9taWRpX25vdGVcbiAgTUlESU5vdGUsXG5cbiAgLy8gZnJvbSAuL3NvbmdcbiAgU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgVHJhY2ssXG5cbiAgLy8gZnJvbSAuL3BhcnRcbiAgUGFydCxcblxuICAvLyBmcm9tIC4vaW5zdHJ1bWVudFxuICBJbnN0cnVtZW50LFxuXG4gIHBhcnNlTUlESUZpbGUsXG5cbiAgbG9nOiBmdW5jdGlvbihpZCl7XG4gICAgc3dpdGNoKGlkKXtcbiAgICAgIGNhc2UgJ2Z1bmN0aW9ucyc6XG4gICAgICAgIGNvbnNvbGUubG9nKGBmdW5jdGlvbnM6XG4gICAgICAgICAgY3JlYXRlTUlESUV2ZW50XG4gICAgICAgICAgbW92ZU1JRElFdmVudFxuICAgICAgICAgIG1vdmVNSURJRXZlbnRUb1xuICAgICAgICAgIGNyZWF0ZU1JRElOb3RlXG4gICAgICAgICAgY3JlYXRlU29uZ1xuICAgICAgICAgIGFkZFRyYWNrc1xuICAgICAgICAgIGNyZWF0ZVRyYWNrXG4gICAgICAgICAgYWRkUGFydHNcbiAgICAgICAgICBjcmVhdGVQYXJ0XG4gICAgICAgICAgYWRkTUlESUV2ZW50c1xuICAgICAgICBgKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH0sXG59XG5cbi8vIHN0YW5kYXJkIE1JREkgZXZlbnRzXG5jb25zdCBNSURJRXZlbnRUeXBlcyA9IHt9XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09GRicsIHt2YWx1ZTogMHg4MH0pOyAvLzEyOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTk9URV9PTicsIHt2YWx1ZTogMHg5MH0pOyAvLzE0NFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUE9MWV9QUkVTU1VSRScsIHt2YWx1ZTogMHhBMH0pOyAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVFJPTF9DSEFOR0UnLCB7dmFsdWU6IDB4QjB9KTsgLy8xNzZcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BST0dSQU1fQ0hBTkdFJywge3ZhbHVlOiAweEMwfSk7IC8vMTkyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDSEFOTkVMX1BSRVNTVVJFJywge3ZhbHVlOiAweEQwfSk7IC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQSVRDSF9CRU5EJywge3ZhbHVlOiAweEUwfSk7IC8vMjI0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTWVNURU1fRVhDTFVTSVZFJywge3ZhbHVlOiAweEYwfSk7IC8vMjQwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdNSURJX1RJTUVDT0RFJywge3ZhbHVlOiAyNDF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfUE9TSVRJT04nLCB7dmFsdWU6IDI0Mn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU09OR19TRUxFQ1QnLCB7dmFsdWU6IDI0M30pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVFVORV9SRVFVRVNUJywge3ZhbHVlOiAyNDZ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0VPWCcsIHt2YWx1ZTogMjQ3fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdUSU1JTkdfQ0xPQ0snLCB7dmFsdWU6IDI0OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1RBUlQnLCB7dmFsdWU6IDI1MH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVElOVUUnLCB7dmFsdWU6IDI1MX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1RPUCcsIHt2YWx1ZTogMjUyfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdBQ1RJVkVfU0VOU0lORycsIHt2YWx1ZTogMjU0fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTWVNURU1fUkVTRVQnLCB7dmFsdWU6IDI1NX0pO1xuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RFTVBPJywge3ZhbHVlOiAweDUxfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdUSU1FX1NJR05BVFVSRScsIHt2YWx1ZTogMHg1OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU5EX09GX1RSQUNLJywge3ZhbHVlOiAweDJGfSk7XG5cblxuZXhwb3J0IGRlZmF1bHQgcWFtYmlcblxuZXhwb3J0IHtcbiAgLy8gZnJvbSAuL2luaXRcbiAgaW5pdCxcblxuICBNSURJRXZlbnRUeXBlcyxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgLy8gZnJvbSAuL3V0aWxcbiAgcGFyc2VTYW1wbGVzLFxuXG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIE1JRElFdmVudCxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIE1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIFNvbmcsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIFRyYWNrLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIFBhcnQsXG5cbiAgLy8gZnJvbSAuL2luc3RydW1lbnRcbiAgSW5zdHJ1bWVudCxcblxuLy8gIE1JREksXG5cbiAgcGFyc2VNSURJRmlsZSxcbn1cbiIsImltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvLmpzJ1xuaW1wb3J0IHtnZXRFcXVhbFBvd2VyQ3VydmV9IGZyb20gJy4vdXRpbC5qcydcblxuXG5jbGFzcyBTYW1wbGV7XG5cbiAgY29uc3RydWN0b3Ioc2FtcGxlRGF0YSwgZXZlbnQpe1xuICAgIHRoaXMuZXZlbnQgPSBldmVudFxuICAgIHRoaXMuc2FtcGxlRGF0YSA9IHNhbXBsZURhdGFcblxuICAgIGlmKHRoaXMuc2FtcGxlRGF0YSA9PT0gLTEgfHwgdHlwZW9mIHRoaXMuc2FtcGxlRGF0YS5idWZmZXIgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIC8vIGNyZWF0ZSBzaW1wbGUgc3ludGggc2FtcGxlXG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgdGhpcy5zb3VyY2UudHlwZSA9ICdzaW5lJztcbiAgICAgIHRoaXMuc291cmNlLmZyZXF1ZW5jeS52YWx1ZSA9IGV2ZW50LmZyZXF1ZW5jeVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICB0aGlzLnNvdXJjZS5idWZmZXIgPSBzYW1wbGVEYXRhLmJ1ZmZlcjtcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5zb3VyY2UuYnVmZmVyKVxuICAgIH1cbiAgICB0aGlzLm91dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy52b2x1bWUgPSBldmVudC5kYXRhMiAvIDEyN1xuICAgIHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuc291cmNlLmNvbm5lY3QodGhpcy5vdXRwdXQpXG4gICAgLy90aGlzLm91dHB1dC5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIH1cblxuICBzdGFydCh0aW1lKXtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuc291cmNlKTtcbiAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgY2Ipe1xuICAgIGxldCB7cmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUsIHJlbGVhc2VFbnZlbG9wZUFycmF5fSA9IHRoaXMuc2FtcGxlRGF0YVxuICAgIGlmKHJlbGVhc2VEdXJhdGlvbiAmJiByZWxlYXNlRW52ZWxvcGUpe1xuICAgICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lICsgcmVsZWFzZUR1cmF0aW9uKVxuICAgICAgZmFkZU91dCh0aGlzLm91dHB1dCwge1xuICAgICAgICByZWxlYXNlRHVyYXRpb24sXG4gICAgICAgIHJlbGVhc2VFbnZlbG9wZSxcbiAgICAgICAgcmVsZWFzZUVudmVsb3BlQXJyYXksXG4gICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLnNvdXJjZS5vbmVuZGVkID0gY2I7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZmFkZU91dChnYWluTm9kZSwgc2V0dGluZ3Mpe1xuICBsZXQgbm93ID0gY29udGV4dC5jdXJyZW50VGltZVxuICBsZXQgdmFsdWVzLCBpLCBtYXhpXG5cbiAgLy9jb25zb2xlLmxvZyhzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpXG4gIHN3aXRjaChzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpe1xuXG4gICAgY2FzZSAnbGluZWFyJzpcbiAgICAgIGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSwgbm93KVxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBub3cgKyBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnZXF1YWxfcG93ZXInOlxuICAgICAgdmFsdWVzID0gZ2V0RXF1YWxQb3dlckN1cnZlKDEwMCwgJ2ZhZGVPdXQnLCBnYWluTm9kZS5nYWluLnZhbHVlKVxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgbWF4aSA9IHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZUFycmF5Lmxlbmd0aFxuICAgICAgdmFsdWVzID0gbmV3IEZsb2F0MzJBcnJheShtYXhpKVxuICAgICAgZm9yKGkgPSAwOyBpIDwgbWF4aTsgaSsrKXtcbiAgICAgICAgdmFsdWVzW2ldID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXlbaV0gKiBnYWluTm9kZS5nYWluLnZhbHVlXG4gICAgICB9XG4gICAgICBnYWluTm9kZS5nYWluLnNldFZhbHVlQ3VydmVBdFRpbWUodmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAgIGJyZWFrXG5cbiAgICBkZWZhdWx0OlxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNhbXBsZSguLi5hcmdzKXtcbiAgcmV0dXJuIG5ldyBTYW1wbGUoLi4uYXJncylcbn1cblxuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZW1wdHlPZ2dcIjogXCJUMmRuVXdBQ0FBQUFBQUFBQUFCZHhkNFhBQUFBQURhUzBqUUJIZ0YyYjNKaWFYTUFBQUFBQVVTc0FBQUFBQUFBZ0xzQUFBQUFBQUM0QVU5bloxTUFBQUFBQUFBQUFBQUFYY1hlRndFQUFBQWFYSytRRHozLy8vLy8vLy8vLy8vLy8vLy9NZ04yYjNKaWFYTXRBQUFBV0dsd2FDNVBjbWNnYkdsaVZtOXlZbWx6SUVrZ01qQXhNREV4TURFZ0tGTmphR0YxWm1WdWRXZG5aWFFwQUFBQUFBRUZkbTl5WW1sekgwSkRWZ0VBQUFFQUdHTlVLVWFaVXRKS2lSbHpsREZHbVdLU1NvbWxoQlpDU0oxekZGT3BPZGVjYTZ5NXRTQ0VFQnBUVUNrRm1WS09VbWtaWTVBcEJabFNFRXRKSlhRU09pZWRZeEJiU2NIV21HdUxRYlljaEEyYVVrd3B4SlJTaWtJSUdWT01LY1dVVWtwQ0J5VjBEanJtSEZPT1NpaEJ1Snh6cTdXV2xtT0xxWFNTU3Vja1pFeENTQ21Ga2tvSHBWTk9Ra2cxbHRaU0tSMXpVbEpxUWVnZ2hCQkN0aUNFRFlMUWtGVUFBQUVBd0VBUUdySUtBRkFBQUJDS29SaUtBb1NHckFJQU1nQUFCS0FvanVJb2ppTTVrbU5KRmhBYXNnb0FBQUlBRUFBQXdIQVVTWkVVeWJFa1M5SXNTOU5FVVZWOTFUWlZWZloxWGRkMVhkZDFJRFJrRlFBQUFRQkFTS2VacFJvZ3dneGtHQWdOV1FVQUlBQUFBRVlvd2hBRFFrTldBUUFBQVFBQVlpZzVpQ2EwNW54empvTm1PV2dxeGVaMGNDTFY1a2x1S3VibW5IUE9PU2ViYzhZNDU1eHppbkptTVdnbXRPYWNjeEtEWmlsb0pyVG1uSE9leE9aQmE2cTA1cHh6eGptbmczRkdHT2VjYzVxMDVrRnFOdGJtbkhNV3RLWTVhaTdGNXB4ekl1WG1TVzB1MWVhY2M4NDU1NXh6empubm5IT3FGNmR6Y0U0NDU1eHpvdmJtV201Q0YrZWNjejRacDN0elFqam5uSFBPT2VlY2M4NDU1NXh6Z3RDUVZRQUFFQUFBUVJnMmhuR25JRWlmbzRFWVJZaHB5S1FIM2FQREpHZ01jZ3FwUjZPamtWTHFJSlJVeGtrcG5TQTBaQlVBQUFnQUFDR0VGRkpJSVlVVVVrZ2hoUlJTaUNHR0dHTElLYWVjZ2dvcXFhU2lpakxLTExQTU1zc3NzOHd5NjdDenpqcnNNTVFRUXd5dHRCSkxUYlhWV0dPdHVlZWNhdzdTV21tdHRkWktLYVdVVWtvcENBMVpCUUNBQUFBUUNCbGtrRUZHSVlVVVVvZ2hwcHh5eWltb29BSkNRMVlCQUlBQUFBSUFBQUE4eVhORVIzUkVSM1JFUjNSRVIzUkV4M004UjVSRVNaUkVTYlJNeTlSTVR4VlYxWlZkVzlabDNmWnRZUmQyM2ZkMTMvZDE0OWVGWVZtV1pWbVdaVm1XWlZtV1pWbVdaVm1DMEpCVkFBQUlBQUNBRUVJSUlZVVVVa2docFJoanpESG5vSk5RUWlBMFpCVUFBQWdBSUFBQUFNQlJITVZ4SkVkeUpNbVNMRW1UTkV1elBNM1RQRTMwUkZFVVRkTlVSVmQwUmQyMFJkbVVUZGQwVGRsMFZWbTFYVm0yYmRuV2JWK1diZC8zZmQvM2ZkLzNmZC8zZmQvM2RSMElEVmtGQUVnQUFPaElqcVJJaXFSSWp1TTRraVFCb1NHckFBQVpBQUFCQUNpS296aU80MGlTSkVtV3BFbWU1Vm1pWm1xbVozcXFxQUtoSWFzQUFFQUFBQUVBQUFBQUFDaWE0aW1tNGltaTRqbWlJMHFpWlZxaXBtcXVLSnV5NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N291RUJxeUNnQ1FBQURRa1J6SmtSeEprUlJKa1J6SkFVSkRWZ0VBTWdBQUFnQndETWVRRk1teExFdlRQTTNUUEUzMFJFLzBURThWWGRFRlFrTldBUUNBQUFBQ0FBQUFBQUF3Sk1OU0xFZHpORW1VVkV1MVZFMjFWRXNWVlU5VlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlUxVGRNMFRTQTBaQ1VBQUFRQXdHS053ZVVnSVNVbDVkNFF3aENUbmpFbUliVmVJUVNSa3Q0eEJoV0RuaktpREhMZVF1TVFneDRJRFZrUkFFUUJBQURHSU1jUWM4ZzVSNm1URWpubnFIU1VHdWNjcFk1U1p5bkZtR0xOS0pYWVVxeU5jNDVTUjYyamxHSXNMWGFVVW8ycHhnSUFBQUljQUFBQ0xJUkNRMVlFQUZFQUFJUXhTQ21rRkdLTU9hZWNRNHdwNTVoemhqSG1ISE9PT2VlZ2RGSXE1NXgwVGtyRUdIT09PYWVjYzFJNko1VnpUa29ub1FBQWdBQUhBSUFBQzZIUWtCVUJRSndBZ0VHU1BFL3lORkdVTkU4VVJWTjBYVkUwWGRmeVBOWDBURk5WUGRGVVZWTlZiZGxVVlZtV1BNODBQZE5VVmM4MFZkVlVWVmsyVlZXV1JWWFZiZE4xZGR0MFZkMldiZHYzWFZzV2RsRlZiZDFVWGRzM1ZkZjJYZG4yZlZuV2RXUHlQRlgxVE5OMVBkTjBaZFYxYlZ0MVhWMzNURk9XVGRlVlpkTjFiZHVWWlYxM1pkbjNOZE4wWGROVlpkbDBYZGwyWlZlM1hWbjJmZE4xaGQrVlpWOVhaVmtZZGwzM2hWdlhsZVYwWGQxWFpWYzNWbG4yZlZ2WGhlSFdkV0daUEU5VlBkTjBYYzgwWFZkMVhWOVhYZGZXTmRPVVpkTjFiZGxVWFZsMlpkbjNYVmZXZGM4MFpkbDBYZHMyWFZlV1hWbjJmVmVXZGQxMFhWOVhaVm40VlZmMmRWblhsZUhXYmVFM1hkZjNWVm4yaFZlV2RlSFdkV0c1ZFYwWVBsWDFmVk4yaGVGMFpkL1hoZDlaYmwwNGx0RjFmV0dWYmVGWVpWazVmdUZZbHQzM2xXVjBYVjlZYmRrWVZsa1dobC80bmVYMmZlTjRkVjBaYnQzbnpMcnZETWZ2cFB2SzA5VnRZNWw5M1ZsbVgzZU80Umc2di9EanFhcXZtNjRyREtjc0M3L3Q2OGF6Kzc2eWpLN3IrNm9zQzc4cTI4S3g2Nzd6L0w2d0xLUHMrc0pxeThLdzJyWXgzTDV1TEw5d0hNdHI2OG94Njc1UnRuVjhYM2dLdy9OMGRWMTVabDNIOW5WMDQwYzRmc29BQUlBQkJ3Q0FBQlBLUUtFaEt3S0FPQUVBanlTSm9tUlpvaWhabGlpS3B1aTZvbWk2cnFScHBxbHBubWxhbW1lYXBtbXFzaW1hcml4cG1tbGFubWFhbXFlWnBtaWFybXVhcHF5S3BpbkxwbXJLc21tYXN1eTZzbTI3cm16Ym9tbktzbW1hc215YXBpeTdzcXZicnV6cXVxUlpwcWw1bm1scW5tZWFwbXJLc21tYXJxdDVubXA2bm1pcW5paXFxbXFxcXEycXFpeGJubWVhbXVpcHBpZUtxbXFxcHEyYXFpckxwcXJhc21tcXRteXFxbTI3cXV6NnNtM3J1bW1xc20ycXBpMmJxbXJicnV6cXNpemJ1aTlwbW1scW5tZWFtdWVacG1tYXNteWFxaXRibnFlYW5paXFxdWFKcG1xcXFpeWJwcXJLbHVlWnFpZUtxdXFKbm11YXFpckxwbXJhcW1tYXRteXFxaTJicGlyTHJtMzd2dXZLc202cXFteWJxbXJycG1yS3Ntekx2dS9LcXU2S3BpbkxwcXJhc21tcXNpM2JzdS9Mc3F6N29tbktzbW1xc20ycXFpN0xzbTBiczJ6N3VtaWFzbTJxcGkyYnFpcmJzaTM3dWl6YnV1L0tybStycXF6cnNpMzd1dTc2cm5EcnVqQzhzbXo3cXF6NnVpdmJ1bS9yTXR2MmZVVFRsR1ZUTlczYlZGVlpkbVhaOW1YYjluM1JORzFiVlZWYk5rM1Z0bVZaOW4xWnRtMWhORTNaTmxWVjFrM1Z0RzFabG0xaHRtWGhkbVhadDJWYjluWFhsWFZmMTMzajEyWGQ1cnF5N2N1eXJmdXFxL3EyN3Z2Q2NPdXU4QW9BQUJod0FBQUlNS0VNRkJxeUVnQ0lBZ0FBakdHTU1RaU5VczQ1QjZGUnlqbm5JR1RPUVFnaGxjdzVDQ0dVa2prSG9aU1VNdWNnbEpKU0NLR1VsRm9MSVpTVVVtc0ZBQUFVT0FBQUJOaWdLYkU0UUtFaEt3R0FWQUFBZytOWWx1ZVpvbXJhc21OSm5pZUtxcW1xdHUxSWx1ZUpvbW1xcW0xYm5pZUtwcW1xcnV2cm11ZUpvbW1xcXV2cXVtaWFwcW1xcnV1NnVpNmFvcW1xcXV1NnNxNmJwcXFxcml1N3N1enJwcXFxcXV2S3Jpejd3cXE2cml2THNtM3J3ckNxcnV2S3NtemJ0bS9jdXE3cnZ1Lzd3cEd0NjdvdS9NSXhERWNCQU9BSkRnQkFCVGFzam5CU05CWllhTWhLQUNBREFJQXdCaUdERUVJR0lZU1FVa29ocFpRU0FBQXc0QUFBRUdCQ0dTZzBaRVVBRUNjQUFCaERLYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpJS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLcWFTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS1pWU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVZ29Ba0lwd0FKQjZNS0VNRkJxeUVnQklCUUFBakZGS0tjYWNneEF4NWhoajBFa29LV0xNT2NZY2xKSlM1UnlFRUZKcExiZktPUWdocE5SU2JabHpVbHFMTWVZWU0rZWtwQlJielRtSFVsS0xzZWFhYSs2a3RGWnJyalhuV2xxck5kZWNjODI1dEJacnJqblhuSFBMTWRlY2M4NDU1eGh6empubm5IUE9CUURnTkRnQWdCN1lzRHJDU2RGWVlLRWhLd0dBVkFBQUFobWxHSFBPT2VnUVVvdzU1eHlFRUNLRkdIUE9PUWdoVkl3NTV4eDBFRUtvR0hQTU9RZ2hoSkE1NXh5RUVFSUlJWE1PT3VnZ2hCQkNCeDJFRUVJSW9aVE9RUWdoaEJCS0tDR0VFRUlJSVlRUU9nZ2hoQkJDQ0NHRUVFSUlJWVJTU2dnaGhCQkNDYUdVVUFBQVlJRURBRUNBRGFzam5CU05CUllhc2hJQUFBSUFnQnlXb0ZMT2hFR09RWThOUWNwUk13MUNURG5SbVdKT2FqTVZVNUE1RUoxMEVobHFRZGxlTWdzQUFJQWdBQ0RBQkJBWUlDajRRZ2lJTVFBQVFZak1FQW1GVmJEQW9Bd2FIT1lCd0FORWhFUUFrSmlnU0x1NGdDNERYTkRGWFFkQ0NFSVFnbGdjUUFFSk9EamhoaWZlOElRYm5LQlRWT29nQUFBQUFBQU1BT0FCQU9DZ0FDSWltcXV3dU1ESTBOamc2UEFJQUFBQUFBQVdBUGdBQURnK2dJaUk1aW9zTGpBeU5EWTRPandDQUFBQUFBQUFBQUNBZ0lBQUFBQUFBRUFBQUFDQWdFOW5aMU1BQkFFQUFBQUFBQUFBWGNYZUZ3SUFBQUJxMm5weEFnRUJBQW89XCIsXG4gIFwiZW1wdHlNcDNcIjogXCIvL3NReEFBRHdBQUJwQUFBQUNBQUFEU0FBQUFFVEVGTlJUTXVPVGt1TlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVPVwiLFxuICBcImhpZ2h0aWNrXCI6IFwiVWtsR1JrUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlTQUZBQUN4L3hmL2RBRE9BQ3dCc1AzcCs2SCt6QUdvQk9rQ0N3QlgvRUg1T3Z4bEE0a0oyd2NTQXJUOUUvdXQrSFQyZXZVeDk4bjZPQUY1Q0NVTXdRdmZDT3NKeEF4MERTSU1FQXE5QmlBQjN2aHo3bUxrVDlzUjEzM1l4TjJzNVFMdjB2clVCbndSbnh1UUplRXNTRENpTWQ4eUZTOGFLRklob2hVc0NLajY0dTYyNU9yYUE5SHV5UG5FbGNQK3d4dkpXdFcyNTYzN1ZRMGpIUGduQlRERE0xbzBDektMSys4aHpoZ0ZET3o4U2U0SjQ3RFlWdEcwejVmUXE5TEIxMnJmQStqOTlyb0hBaGVsSXlNd0lqZFRPdVU4bWp3SU9Hb3hoQ2I1RTUzL2orM2szL2ZUWThwVHc0eS9UcitldzhETXZkc2s4UmNIUlJrU0tPNHlHVGtIUGtVL3J6enlOY2dzclI5NERwLzVyK1pzMTd6T25jb0R4aGZFMzhXTHluL1RlT01pOXIwSVJ4bFJLSVF6eVRsT1BLbzl5am1XTWNva0RSTGMvWTdydWR0ZHp1L0QyTDFJdSsyN0pjRzN5WXJWTHVqbCszVU9aeDFVSzVRMHF6bU5QRGs4WmplZU1Qb2p6aEgrL2pMdFBkNW0waEhMSHNZSXc1VEVNTW5BMGp2ajhmU09CaXdYQVNaZ016TThkVUJHUWJJK3J6anBLa0laeWdaVDlRZmxjZGFSeXFYQ3o3K1Z3VVBINzg0cjNLN3MrdjBLRHU4YnZ5ZUxNYjQzTmpyaE9JbzBkU3ZRSGkwUG5QNmk3b3ZnM05UeHk0L0dmOFg4eUgvUUJ0dlg1NVAyWWdiMEZjVWpzeTRMTm1JNWVqaVhNMzhyN2lDOEZKd0hQdm9rN2REZ1FkYUp6bFRLSXNvRnpzclZrdUE4N2QvNnFBaTdGUTBoOUNsS01MRXozVE9yTUJjcVlTRDhFOUFGZC9kUzZrVGY2ZGJVMFhuUXY5SUgyTVhmWitsbjlERUFGd3dkRnk4Z2lpYjZLYXdxZUNoZ0kvVWJIQk9UQ1pqL3Z2WGU3SW5sRnVETjNQM2IwZDFGNGd6cGlmRzIrdTREN1F3MUZmd2JuQ0QrSWxnald5SExIUE1Wb2cybUJMMzdxdlArN052bll1VHY0cnZqZnViTjZrM3dwUFowL1drRU93dGlFVXNXY3htK0dsNGFPaGhpRkRBUEl3bWJBdG43VFBWeTc3enFjZWZyNVlIbUh1bGw3ZW55ZlBtY0FIZ0hldzFSRXI4VmhoZC9GK0FWMVJKMERpa0pXUU5jL1pQM2VmS2Q3aHZzMnVyNDZySHM1dThlOU4vNDgvMGhBLzhIRmd3dUQwNFJTQklSRXFzUU9nN21Dc3NHTUFKVy9YbjRHL1RLOExidXp1MEk3cVR2blBKeTlzWDZiUDg0QkxZSWJBd2REODRRWXhHN0VPY09EQXh3Q0ZNRUFRQzkrN1AzU3ZUWDhYSHcrdTlSOEtUeEl2U285K1g3VlFDVUJKMElNd3ppRGo0UUxoQUdEOVVNcmduVEJaY0JSdjF2K1h2MlVmUys4dGZ4K3ZFUzg3ejArdmIzK1pmOVpnRVFCU0VJVUFyV0M4a00yUXl6QzVFSkVBZHZCSGdCWFA1bisrcjRBdmQ4OVdqMDdmTXc5RDMxSnZmcCtVajl4UUQ5QThRRzVRaFhDbEVMckFzdkM5d0o3Z2Q2QldJQzN2Nk8rN1Q0UFBaTjlFSHpXdk5mOVB6MUZ2aXQrcUw5clFDSEF3RUcvd2VDQ1pVS0Z3dkRDbklKY0FjUUJXY0NhZjhaL0NENTV2YUI5ZEQwd1BTUDlVTDNtL2s3L016K0p3RXlBdzhGekFZN0NCc0phUWs1Q1drSTJnYXRCQ0lDWWYrai9GcjZ2ZmlWOTg3MnNmWlA5MXo0cC9sUiszSDl6Zjg5QXJvRUZBZmpDUDBKY3dvOENqQUpkUWRnQlNFRGtnRFEvVmo3WmZuUjk1VDI4ZlVkOXYzMlZ2ZzIrbmI4Ky82eEFXb0U0QWJEQ1A0SnBBcWJDcVFKMHdlRUJmZ0NUQUNUL1IzN00vbSs5NjcySVBZNjlnYjNhZmhXK3RUOHFmK01BajBGZ2djdUNTY0tYQXJpQ2NNSUVBZnlCSllDRndDUC9SejdBL2w3OTN6MkYvWm45bUgzN2ZqZCtpMzl5ZjlwQXQwRUZBZlJDTmtKR0FxckNaWUl2Z1pQQko4QjZQNC8vTTM1MHZkejlxLzFsZlVxOW16M1JQbWkrM0grYmdGVkJPUUczd2dIQ2t3SzBBbTdDQ0FIQ2dXbUFqQUFcIixcbiAgXCJsb3d0aWNrXCI6IFwiVWtsR1JsUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlUQUZBQUIwLzV2K1UvNFQvM2dBMHdGVEF1VUIrZjhkL25UOTBmMXEvdWIrdGY0Ni9tYi84d0ZRQTlnQzd3Q2QvbXIrRkFHUkEzY0U2d0pmL2gzNmV2bXYrOHYvTndSSEJaVUMyLzYwKy8vNUV2dVovYVgvYmdGT0FwOEF6dnpoOXdmekxQRjY4elQ0eS8yQkF5Z0lmUXdhRWpZWTB4MzFJcndsOFNPV0hWRVNPZ1BoOU5mcFJlRnQyMm5ZSGRkRDJCWGNaZURhNUlucWdQRHg5blArNmdTNENCWUxudzB6RVMwV1h4djRIa2NnTGgvMUcrRVgxUk5wRDR3S2lnWEgvNnI1L2ZOdTdsVHBqK1p1NWhIb1hPdEw3MWJ5ci9RcDkxTDY0djZPQk80Sm9RNXpFc2tVK2hVMUZpUVZlUlA3RVdnUDRRcjBCSVQrdFBpZDlDM3kxdkNoOEZEeEp2SzI4dnZ5eS9MQThwTHpVL1hQOTV2Nnh2dzQvdUQvUkFLMkJTa0tjZzZCRVNjVFpCTWVFcWtQVFF4akNLRUVWd0ZpL252N2gvaHA5YUR5QXZIUDhNZnhMdk0rOVBYMHVQVzE5Zy80TGZyNy9DNEFLZ05hQlhRR3l3YjBCaElIV1FmV0Ixb0l6QWp0Q0Y4SUh3ZHRCYWtEVndLTEFlWUE4djl3L2tqODEvblE5NHYyOS9YWDliejFiUFVZOVV6MVovYUgrSHI3eVA0TUFpNEYrd2NmQ25ZTE5neWZEUHNNU3cwc0RVQU1mZ3JjQjVJRU13RmIvaVg4VC9wVCtPLzFYL01mOGNidnJPKzE4TUx5dmZWUCtSZjl3Z0FvQkNFSHB3bklDNUVONFE1QUQzd08xQXkwQ3BzSXZ3YnZCTmNDYlFBci9uWDhPZnNmK3ZiNG12ZGE5cmoxei9XWDlwTDNhL2hIK1pYNlIvd24vdlAvZVFFU0EvQUUrd1lEQ2N3S0ZBeVBEQ2tNRlF1U0NlNEhWUWJTQkhRREN3SThBTkw5SlB1WStIWDI4dlRxODJQemRQTVY5QXoxTWZaNDl6RDVnZnR4L3NRQkJRWExCOGNKL2dxcEN3OE1pZ3dXRFhFTlhRMnJERFVMN1FnREJzd0NkdjhTL0s3NFdQVms4aFh3b3U0UDdtdnUxKzlUOHB6MVV2bGkvWm9Cd2dXUkNjc01QZy9DRUVRUjRSREFEd29POXd1c0NWTUg0QVJTQXBuL3VmemQrV2ozYnZYNzh4enp4L0w2OHF6ejF2U0Q5cVg0R2Z2ZC9jMEFod08vQld3SG1naHZDUUVLVlFvbkNsc0pDd2lJQmgwRjBnT2dBbTBCT3dBeC8wMytYUDBnL0xiNmNQbVgrRi80dmZoKytUSDZzL29zKzcvN2N2d0wvWno5WFA1Ty8zSUEzQUY5QXpzRjlnYVVDQUFLSGd1ZUN6Y0w5d250QjNzRjR3SXpBSTM5NmZwMStHdjJJdlduOU4zMHAvWGk5bTc0Ry9ydSs5UDlrLzhhQVlFQzFBTVRCU0lHMHdZdUIxZ0hrZ2NBQ0dFSVNBaFRCekVGV0FLdC81TDkyZnVVK3ZYNTBmbWYrU1A1aS9nYitCZjRtdml2K1NyN2t2eWIvVWorci80WC84ci8rZ0NpQW8wRVVBYVJCendJU3dqcUIzSUhHUWZDQnY4RnBnVE1BcFFBS2Y2Nys1bjUvdmZuOWp6MnlQVm45U0wxUlBYcTlTUDNEdm1yKzZmK3NRR0tCQWNIK3doT0NoMExhd3MzQzI4S0xBbURCNUFGZlFOb0FWUC9adjNlKzdQNnNmbkwrQ3Y0dlBlTTk1YjM3ZmVWK0puNTFQb3EvTEw5bXYrWUFWWUQzZ1F1Qm1jSFNBaWtDSUVJN0FmK0J1RUZuZ1FYQTFzQnYvOXYvcGY5TVAzVy9GajhxL3NSKzZINlUvbzMrbVA2eS9wTisvZjd4dnllL1dIK0pmOW1BRDRDUUFRSkJpc0h0Z2Y2QncwSThRZHNCMXNHeXdUNEFnZ0JDUC9vL0tYNm1QZzE5NTcyamZhejl1ZjJTL2NNK0UzNUUvdFcvYWYvNXdIMUE4QUZLZ2ZrQi9BSGd3ZnhCbEFHZ1FWSUJNTUNKd0dzLzQzK3ZQMGkvWnI4TGZ6bCs5SDc2ZnZpKzlmNzVmc2YvSW44QlAxMC9lajljZjRPLzdmL2RBQWNBYVVCRWdLTUFoZ0RwQU1FQkNFRUR3VGZBM0lEeFFMOEFTb0JVd0NHLzg3K0ovNmgvUnI5cFB4ay9HYjhvUHdKL1hIOXcvMzkvVUQrcVA0MS85RC9Xd0RlQUdzQkFnS2RBaEVEUVFOQUEwc0Rid09WQTVZRFZ3UE9BaGdDVkFHUkFBPT1cIixcbn0iLCJpbXBvcnQge2dldE1JRElPdXRwdXRCeUlkLCBnZXRNSURJT3V0cHV0c30gZnJvbSAnLi9pbml0X21pZGknXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5cblxuY29uc3QgQlVGRkVSX1RJTUUgPSAyMDAgLy8gbWlsbGlzXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjaGVkdWxlcntcblxuICBjb25zdHJ1Y3Rvcihzb25nKXtcbiAgICB0aGlzLnNvbmcgPSBzb25nXG4gIH1cblxuXG4gIGluaXQobWlsbGlzKXtcbiAgICB0aGlzLnNvbmdTdGFydE1pbGxpcyA9IG1pbGxpc1xuICAgIHRoaXMuZXZlbnRzID0gdGhpcy5zb25nLl9hbGxFdmVudHNcbiAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aFxuICAgIHRoaXMuaW5kZXggPSAwXG4gICAgdGhpcy5tYXh0aW1lID0gMFxuICAgIHRoaXMucHJldk1heHRpbWUgPSAwXG4gICAgdGhpcy5iZXlvbmRMb29wID0gZmFsc2UgLy8gdGVsbHMgdXMgaWYgdGhlIHBsYXloZWFkIGhhcyBhbHJlYWR5IHBhc3NlZCB0aGUgbG9vcGVkIHNlY3Rpb25cbiAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZ1N0YXJ0TWlsbGlzKVxuICB9XG5cblxuICBzZXRUaW1lU3RhbXAodGltZVN0YW1wKXtcbiAgICB0aGlzLnRpbWVTdGFtcCA9IHRpbWVTdGFtcFxuICB9XG5cbiAgLy8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgZXZlbnQgdGhhdCBoYXMgaXRzIG1pbGxpcyB2YWx1ZSBhdCBvciByaWdodCBhZnRlciB0aGUgcHJvdmlkZWQgbWlsbGlzIHZhbHVlXG4gIHNldEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvcihsZXQgZXZlbnQgb2YgdGhpcy5ldmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgICAgIHRoaXMuaW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gICAgdGhpcy5iZXlvbmRMb29wID0gbWlsbGlzID4gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgdGhpcy5ub3RlcyA9IG5ldyBNYXAoKVxuICB9XG5cblxuICBnZXRFdmVudHMoKXtcbiAgICBsZXQgZXZlbnRzID0gW11cblxuICAgIGlmKHRoaXMuc29uZy5fbG9vcCA9PT0gdHJ1ZSAmJiB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvbiA8IEJVRkZFUl9USU1FKXtcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ1N0YXJ0TWlsbGlzICsgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gLSAxO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLm1heHRpbWUsIHRoaXMuc29uZy5sb29wRHVyYXRpb24pO1xuICAgIH1cblxuICAgIGlmKHRoaXMuc29uZy5fbG9vcCA9PT0gdHJ1ZSl7XG5cbiAgICAgIGlmKHRoaXMubWF4dGltZSA+PSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMgJiYgdGhpcy5iZXlvbmRMb29wID09PSBmYWxzZSl7XG5cbiAgICAgICAgbGV0IGRpZmYgPSB0aGlzLm1heHRpbWUgLSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXNcbiAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXMgKyBkaWZmXG5cbiAgICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLUxPT1BFRCcsIHRoaXMubWF4dGltZSwgZGlmZiwgdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXMsIHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyk7XG5cbiAgICAgICAgaWYodGhpcy5sb29wZWQgPT09IGZhbHNlKXtcblxuICAgICAgICAgIHRoaXMubG9vcGVkID0gdHJ1ZTtcbiAgICAgICAgICBsZXQgbGVmdE1pbGxpcyA9IHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzXG4gICAgICAgICAgbGV0IHJpZ2h0TWlsbGlzID0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG5cbiAgICAgICAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICAgICAgICBsZXQgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgICAgICBpZihldmVudC5taWxsaXMgPCByaWdodE1pbGxpcyl7XG4gICAgICAgICAgICAgIGV2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzXG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUpXG4gICAgICAgICAgICAgIHRoaXMuaW5kZXgrK1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgbm90ZXMtPiBhZGQgYSBuZXcgbm90ZSBvZmYgZXZlbnQgYXQgdGhlIHBvc2l0aW9uIG9mIHRoZSByaWdodCBsb2NhdG9yIChlbmQgb2YgdGhlIGxvb3ApXG4gICAgICAgICAgbGV0IGVuZFRpY2tzID0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IudGlja3MgLSAxXG4gICAgICAgICAgbGV0IGVuZE1pbGxpcyA9IHRoaXMuc29uZy5jYWxjdWxhdGVQb3NpdGlvbih7dHlwZTogJ3RpY2tzJywgdGFyZ2V0OiBlbmRUaWNrcywgcmVzdWx0OiAnbWlsbGlzJ30pLm1pbGxpc1xuXG4gICAgICAgICAgZm9yKGxldCBub3RlIG9mIHRoaXMubm90ZXMudmFsdWVzKCkpe1xuICAgICAgICAgICAgbGV0IG5vdGVPbiA9IG5vdGUubm90ZU9uXG4gICAgICAgICAgICBsZXQgbm90ZU9mZiA9IG5vdGUubm90ZU9mZlxuICAgICAgICAgICAgaWYobm90ZU9mZi5taWxsaXMgPD0gcmlnaHRNaWxsaXMpe1xuICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGV2ZW50ID0gbmV3IE1JRElFdmVudChlbmRUaWNrcywgMTI4LCBub3RlT24uZGF0YTEsIDApXG4gICAgICAgICAgICBldmVudC5taWxsaXMgPSBlbmRNaWxsaXNcbiAgICAgICAgICAgIGV2ZW50Ll9wYXJ0ID0gbm90ZU9uLl9wYXJ0XG4gICAgICAgICAgICBldmVudC5fdHJhY2sgPSBub3RlT24uX3RyYWNrXG4gICAgICAgICAgICBldmVudC5taWRpTm90ZSA9IG5vdGVcbiAgICAgICAgICAgIGV2ZW50Lm1pZGlOb3RlSWQgPSBub3RlLmlkXG4gICAgICAgICAgICBldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpc1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgICAgIH1cblxuLypcbiAgICAgICAgICAvLyBzdG9wIG92ZXJmbG93aW5nIGF1ZGlvIHNhbXBsZXNcbiAgICAgICAgICBmb3IoaSBpbiB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzKXtcbiAgICAgICAgICAgIGlmKHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHMuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgICBhdWRpb0V2ZW50ID0gdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50c1tpXTtcbiAgICAgICAgICAgICAgaWYoYXVkaW9FdmVudC5lbmRNaWxsaXMgPiB0aGlzLnNvbmcubG9vcEVuZCl7XG4gICAgICAgICAgICAgICAgYXVkaW9FdmVudC5zdG9wU2FtcGxlKHRoaXMuc29uZy5sb29wRW5kLzEwMDApO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3BwaW5nIGF1ZGlvIGV2ZW50JywgaSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4qL1xuICAgICAgICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICAgICAgICB0aGlzLnNldEluZGV4KGxlZnRNaWxsaXMpXG4gICAgICAgICAgdGhpcy50aW1lU3RhbXAgKz0gdGhpcy5zb25nLl9sb29wRHVyYXRpb25cblxuICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnRzLmxlbmd0aClcblxuICAgICAgICAgIC8vIGdldCB0aGUgYXVkaW8gZXZlbnRzIHRoYXQgc3RhcnQgYmVmb3JlIHNvbmcubG9vcFN0YXJ0XG4gICAgICAgICAgLy90aGlzLmdldERhbmdsaW5nQXVkaW9FdmVudHModGhpcy5zb25nLmxvb3BTdGFydCwgZXZlbnRzKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMubG9vcGVkID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMubG9vcGVkKVxuXG4gICAgLy8gbWFpbiBsb29wXG4gICAgZm9yKGxldCBpID0gdGhpcy5pbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspe1xuICAgICAgbGV0IGV2ZW50ID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgdGhpcy5tYXh0aW1lKVxuICAgICAgaWYoZXZlbnQubWlsbGlzIDwgdGhpcy5tYXh0aW1lKXtcblxuICAgICAgICAvL2V2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50LnRpbWUgPSAodGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXZlbnRzO1xuICB9XG5cblxuICB1cGRhdGUobWlsbGlzKXtcbiAgICB2YXIgaSxcbiAgICAgIGV2ZW50LFxuICAgICAgbnVtRXZlbnRzLFxuICAgICAgdHJhY2ssXG4gICAgICBldmVudHNcblxuICAgIGV2ZW50cyA9IHRoaXMuZ2V0RXZlbnRzKClcbiAgICBudW1FdmVudHMgPSBldmVudHMubGVuZ3RoXG4gICAgdGhpcy5wcmV2TWF4dGltZSA9IHRoaXMubWF4dGltZVxuICAgIHRoaXMubWF4dGltZSA9IG1pbGxpcyArIEJVRkZFUl9USU1FXG5cbiAgICAvLyBpZihudW1FdmVudHMgPiA1KXtcbiAgICAvLyAgIGNvbnNvbGUubG9nKG51bUV2ZW50cylcbiAgICAvLyB9XG5cbiAgICBmb3IoaSA9IDA7IGkgPCBudW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IGV2ZW50c1tpXVxuICAgICAgdHJhY2sgPSBldmVudC5fdHJhY2tcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCB0aGlzLm1heHRpbWUsIHRoaXMucHJldk1heHRpbWUpXG5cbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA+IHRoaXMubWF4dGltZSl7XG4gICAgICAgIC8vIHNraXAgZXZlbnRzIHRoYXQgd2VyZSBoYXJ2ZXN0IGFjY2lkZW50bHkgd2hpbGUganVtcGluZyB0aGUgcGxheWhlYWQgLT4gc2hvdWxkIGhhcHBlbiB2ZXJ5IHJhcmVseSBpZiBldmVyXG4gICAgICAgIGNvbnNvbGUubG9nKCdza2lwJywgZXZlbnQpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmKGV2ZW50Ll9wYXJ0Lm11dGVkID09PSB0cnVlIHx8IHRyYWNrLm11dGVkID09PSB0cnVlIHx8IGV2ZW50Lm11dGVkID09PSB0cnVlKXtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvLyB0aGlzIGlzIHVzdWFsbHkgY2F1c2VkIGJ5IHRoZSBzYW1lIG5vdGUgb24gdGhlIHNhbWUgdGlja3MgdmFsdWUsIHdoaWNoIGlzIHByb2JhYmx5IGEgYnVnIGluIHRoZSBtaWRpIGZpbGVcbiAgICAgICAgLy9jb25zb2xlLmluZm8oJ25vIG1pZGlOb3RlSWQnLCBldmVudClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuXG4gICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyBjb252ZXJ0IHRvIHNlY29uZHMgYmVjYXVzZSB0aGUgYXVkaW8gY29udGV4dCB1c2VzIHNlY29uZHMgZm9yIHNjaGVkdWxpbmdcbiAgICAgICAgdHJhY2sucHJvY2Vzc01JRElFdmVudChldmVudCwgdHJ1ZSkgLy8gdHJ1ZSBtZWFuczogdXNlIGxhdGVuY3kgdG8gY29tcGVuc2F0ZSB0aW1pbmcgZm9yIGV4dGVybmFsIE1JREkgZGV2aWNlcywgc2VlIFRyYWNrLnByb2Nlc3NNSURJRXZlbnRcblxuICAgICAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgICAgIHRoaXMubm90ZXMuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmluZGV4LCB0aGlzLm51bUV2ZW50cylcbiAgICAvL3JldHVybiB0aGlzLmluZGV4ID49IDEwXG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPj0gdGhpcy5udW1FdmVudHMgLy8gbGFzdCBldmVudCBvZiBzb25nXG4gIH1cblxuLypcbiAgYWxsTm90ZXNPZmYoKXtcbiAgICBsZXQgdGltZVN0YW1wID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDBcbiAgICBsZXQgb3V0cHV0cyA9IGdldE1JRElPdXRwdXRzKClcbiAgICBvdXRwdXRzLmZvckVhY2goKG91dHB1dCkgPT4ge1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aW1lU3RhbXApIC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gICAgfSlcbiAgfVxuKi9cbn1cblxuIiwiLy9AIGZsb3dcblxuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9xYW1iaSdcbmltcG9ydCB7cGFyc2VUaW1lRXZlbnRzLCBwYXJzZUV2ZW50c30gZnJvbSAnLi9wYXJzZV9ldmVudHMnXG4vL2ltcG9ydCB7YWRkVGFzaywgcmVtb3ZlVGFza30gZnJvbSAnLi9oZWFydGJlYXQnXG5pbXBvcnQge2NvbnRleHQsIG1hc3RlckdhaW59IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi9zY2hlZHVsZXInXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtzb25nRnJvbU1JRElGaWxlLCBzb25nRnJvbU1JRElGaWxlQXN5bmN9IGZyb20gJy4vc29uZ19mcm9tX21pZGlmaWxlJ1xuaW1wb3J0IHFhbWJpIGZyb20gJy4vcWFtYmknXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y2FsY3VsYXRlUG9zaXRpb259IGZyb20gJy4vcG9zaXRpb24nXG5pbXBvcnQge1BsYXloZWFkfSBmcm9tICcuL3BsYXloZWFkJ1xuaW1wb3J0IHtNZXRyb25vbWV9IGZyb20gJy4vbWV0cm9ub21lJ1xuaW1wb3J0IHthZGRFdmVudExpc3RlbmVyLCByZW1vdmVFdmVudExpc3RlbmVyLCBkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5cbmxldCBzb25nSW5kZXggPSAwXG5cbmNvbnN0IGRlZmF1bHRTb25nID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDMwLFxuICBsb3dlc3ROb3RlOiAwLFxuICBoaWdoZXN0Tm90ZTogMTI3LFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIGxvb3A6IGZhbHNlLFxuICBwbGF5YmFja1NwZWVkOiAxLFxuICBhdXRvUXVhbnRpemU6IGZhbHNlXG59XG4vKlxudHlwZSBzb25nU2V0dGluZ3MgPSB7XG4gIG5hbWU6IHN0cmluZyxcbiAgcHBxOiBudW1iZXIsXG4gIGJwbTogbnVtYmVyLFxuICBiYXJzOiBudW1iZXIsXG4gIGxvd2VzdE5vdGU6IG51bWJlcixcbiAgaGlnaGVzdE5vdGU6IG51bWJlcixcbiAgbm9taW5hdG9yOiBudW1iZXIsXG4gIGRlbm9taW5hdG9yOiBudW1iZXIsXG4gIHF1YW50aXplVmFsdWU6IG51bWJlcixcbiAgZml4ZWRMZW5ndGhWYWx1ZTogbnVtYmVyLFxuICBwb3NpdGlvblR5cGU6IHN0cmluZyxcbiAgdXNlTWV0cm9ub21lOiBib29sZWFuLFxuICBhdXRvU2l6ZTogYm9vbGVhbixcbiAgbG9vcDogYm9vbGVhbixcbiAgcGxheWJhY2tTcGVlZDogbnVtYmVyLFxuICBhdXRvUXVhbnRpemU6IGJvb2xlYW5cbn1cbiovXG5cbmV4cG9ydCBjbGFzcyBTb25ne1xuXG4gIHN0YXRpYyBmcm9tTUlESUZpbGUoZGF0YSl7XG4gICAgcmV0dXJuIHNvbmdGcm9tTUlESUZpbGUoZGF0YSlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tTUlESUZpbGVBc3luYyhkYXRhKXtcbiAgICByZXR1cm4gc29uZ0Zyb21NSURJRmlsZUFzeW5jKGRhdGEpXG4gIH1cblxuICBjb25zdHJ1Y3RvcihzZXR0aW5nczoge30gPSB7fSl7XG5cbiAgICB0aGlzLmlkID0gYFNfJHtzb25nSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gO1xuXG4gICAgKHtcbiAgICAgIG5hbWU6IHRoaXMubmFtZSA9IHRoaXMuaWQsXG4gICAgICBwcHE6IHRoaXMucHBxID0gZGVmYXVsdFNvbmcucHBxLFxuICAgICAgYnBtOiB0aGlzLmJwbSA9IGRlZmF1bHRTb25nLmJwbSxcbiAgICAgIGJhcnM6IHRoaXMuYmFycyA9IGRlZmF1bHRTb25nLmJhcnMsXG4gICAgICBub21pbmF0b3I6IHRoaXMubm9taW5hdG9yID0gZGVmYXVsdFNvbmcubm9taW5hdG9yLFxuICAgICAgZGVub21pbmF0b3I6IHRoaXMuZGVub21pbmF0b3IgPSBkZWZhdWx0U29uZy5kZW5vbWluYXRvcixcbiAgICAgIHF1YW50aXplVmFsdWU6IHRoaXMucXVhbnRpemVWYWx1ZSA9IGRlZmF1bHRTb25nLnF1YW50aXplVmFsdWUsXG4gICAgICBmaXhlZExlbmd0aFZhbHVlOiB0aGlzLmZpeGVkTGVuZ3RoVmFsdWUgPSBkZWZhdWx0U29uZy5maXhlZExlbmd0aFZhbHVlLFxuICAgICAgdXNlTWV0cm9ub21lOiB0aGlzLnVzZU1ldHJvbm9tZSA9IGRlZmF1bHRTb25nLnVzZU1ldHJvbm9tZSxcbiAgICAgIGF1dG9TaXplOiB0aGlzLmF1dG9TaXplID0gZGVmYXVsdFNvbmcuYXV0b1NpemUsXG4gICAgICBsb29wOiB0aGlzLmxvb3AgPSBkZWZhdWx0U29uZy5sb29wLFxuICAgICAgcGxheWJhY2tTcGVlZDogdGhpcy5wbGF5YmFja1NwZWVkID0gZGVmYXVsdFNvbmcucGxheWJhY2tTcGVlZCxcbiAgICAgIGF1dG9RdWFudGl6ZTogdGhpcy5hdXRvUXVhbnRpemUgPSBkZWZhdWx0U29uZy5hdXRvUXVhbnRpemUsXG4gICAgfSA9IHNldHRpbmdzKTtcblxuICAgIHRoaXMuX3RpbWVFdmVudHMgPSBbXG4gICAgICBuZXcgTUlESUV2ZW50KDAsIE1JRElFdmVudFR5cGVzLlRFTVBPLCB0aGlzLmJwbSksXG4gICAgICBuZXcgTUlESUV2ZW50KDAsIE1JRElFdmVudFR5cGVzLlRJTUVfU0lHTkFUVVJFLCB0aGlzLm5vbWluYXRvciwgdGhpcy5kZW5vbWluYXRvciksXG4gICAgXVxuXG4gICAgLy90aGlzLl90aW1lRXZlbnRzID0gW11cbiAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICAgIHRoaXMuX2xhc3RFdmVudCA9IG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuRU5EX09GX1RSQUNLKVxuXG4gICAgdGhpcy5fdHJhY2tzID0gW11cbiAgICB0aGlzLl90cmFja3NCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9wYXJ0cyA9IFtdXG4gICAgdGhpcy5fcGFydHNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX2FsbEV2ZW50cyA9IFtdIC8vIE1JREkgZXZlbnRzIGFuZCBtZXRyb25vbWUgZXZlbnRzXG5cbiAgICB0aGlzLl9ub3RlcyA9IFtdXG4gICAgdGhpcy5fbm90ZXNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9uZXdFdmVudHMgPSBbXVxuICAgIHRoaXMuX21vdmVkRXZlbnRzID0gW11cbiAgICB0aGlzLl9yZW1vdmVkRXZlbnRzID0gW11cbiAgICB0aGlzLl90cmFuc3Bvc2VkRXZlbnRzID0gW11cblxuICAgIHRoaXMuX25ld1BhcnRzID0gW11cbiAgICB0aGlzLl9jaGFuZ2VkUGFydHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdXG5cbiAgICB0aGlzLl9zY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKHRoaXMpXG4gICAgdGhpcy5fcGxheWhlYWQgPSBuZXcgUGxheWhlYWQodGhpcylcbiAgICB0aGlzLl9taWxsaXMgPSAwXG5cbiAgICB0aGlzLl9wbGF5aW5nID0gZmFsc2VcbiAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZVxuXG4gICAgdGhpcy52b2x1bWUgPSAwLjVcbiAgICB0aGlzLl9vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMuX291dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLl9vdXRwdXQuY29ubmVjdChtYXN0ZXJHYWluKVxuXG4gICAgdGhpcy5fbWV0cm9ub21lID0gbmV3IE1ldHJvbm9tZSh0aGlzKVxuICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9IFtdXG4gICAgdGhpcy5fdXBkYXRlTWV0cm9ub21lRXZlbnRzID0gdHJ1ZVxuXG4gICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IGZhbHNlXG4gICAgdGhpcy5fbG9vcER1cmF0aW9uID0gMFxuICB9XG5cblxuICBhZGRUaW1lRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgLy9AVE9ETzogZmlsdGVyIHRpbWUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2sgLT4gdXNlIHRoZSBsYXN0bHkgYWRkZWQgZXZlbnRzXG4gICAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUpe1xuICAgICAgICB0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlXG4gICAgICB9XG4gICAgICB0aGlzLl90aW1lRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgfSlcbiAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICB9XG5cbiAgYWRkVHJhY2tzKC4uLnRyYWNrcyl7XG4gICAgdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICB0cmFjay5fc29uZyA9IHRoaXNcbiAgICAgIHRyYWNrLmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgICAgdGhpcy5fdHJhY2tzLnB1c2godHJhY2spXG4gICAgICB0aGlzLl90cmFja3NCeUlkLnNldCh0cmFjay5pZCwgdHJhY2spXG4gICAgICB0aGlzLl9uZXdFdmVudHMucHVzaCguLi50cmFjay5fZXZlbnRzKVxuICAgICAgdGhpcy5fbmV3UGFydHMucHVzaCguLi50cmFjay5fcGFydHMpXG4gICAgfSlcbiAgfVxuXG4gIC8vIHByZXBhcmUgc29uZyBldmVudHMgZm9yIHBsYXliYWNrXG4gIHVwZGF0ZSgpOiB2b2lke1xuXG4gICAgbGV0IGNyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuXG4gICAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gZmFsc2VcbiAgICAgICYmIHRoaXMuX3JlbW92ZWRFdmVudHMubGVuZ3RoID09PSAwXG4gICAgICAmJiB0aGlzLl9uZXdFdmVudHMubGVuZ3RoID09PSAwXG4gICAgICAmJiB0aGlzLl9tb3ZlZEV2ZW50cy5sZW5ndGggPT09IDBcbiAgICApe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vZGVidWdcbiAgICAvL3RoaXMuaXNQbGF5aW5nID0gdHJ1ZVxuXG4gICAgY29uc29sZS5ncm91cCgndXBkYXRlIHNvbmcnKVxuICAgIGNvbnNvbGUudGltZSgndG90YWwnKVxuXG4gICAgLy8gY2hlY2sgaWYgdGltZSBldmVudHMgYXJlIHVwZGF0ZWRcbiAgICBpZih0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSB0cnVlKXtcbiAgICAgIC8vY29uc29sZS5sb2coJ3VwZGF0ZVRpbWVFdmVudHMnLCB0aGlzLl90aW1lRXZlbnRzLmxlbmd0aClcbiAgICAgIHBhcnNlVGltZUV2ZW50cyh0aGlzLCB0aGlzLl90aW1lRXZlbnRzLCB0aGlzLmlzUGxheWluZylcbiAgICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSBmYWxzZVxuICAgICAgY29uc29sZS5sb2coJ3RpbWUgZXZlbnRzICVPJywgdGhpcy5fdGltZUV2ZW50cylcbiAgICB9XG5cbiAgICAvLyBvbmx5IHBhcnNlIG5ldyBhbmQgbW92ZWQgZXZlbnRzXG4gICAgbGV0IHRvYmVQYXJzZWQgPSBbXVxuXG5cbiAgICAvLyBmaWx0ZXIgcmVtb3ZlZCBwYXJ0c1xuICAgIGNvbnNvbGUubG9nKCdyZW1vdmVkIHBhcnRzICVPJywgdGhpcy5fcmVtb3ZlZFBhcnRzKVxuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICB0aGlzLnBhcnRzQnlJZC5kZWxldGUocGFydC5pZClcbiAgICAgIHRoaXMuX3JlbW92ZWRFdmVudHMucHVzaCguLi5wYXJ0Ll9ldmVudHMpXG4gICAgfSlcblxuXG4gICAgLy8gYWRkIG5ldyBwYXJ0c1xuICAgIGNvbnNvbGUubG9nKCduZXcgcGFydHMgJU8nLCB0aGlzLl9uZXdQYXJ0cylcbiAgICB0aGlzLl9uZXdQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0Ll9zb25nID0gdGhpc1xuICAgICAgdGhpcy5fcGFydHNCeUlkLnNldChwYXJ0LmlkLCBwYXJ0KVxuICAgICAgdG9iZVBhcnNlZC5wdXNoKC4uLnBhcnQuX2V2ZW50cylcbiAgICAgIHBhcnQudXBkYXRlKClcbiAgICB9KVxuXG5cbiAgICAvLyB1cGRhdGUgY2hhbmdlZCBwYXJ0c1xuICAgIGNvbnNvbGUubG9nKCdjaGFuZ2VkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKVxuICAgIHRoaXMuX2NoYW5nZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnVwZGF0ZSgpXG4gICAgfSlcblxuXG4gICAgLy8gZmlsdGVyIHJlbW92ZWQgZXZlbnRzXG4gICAgY29uc29sZS5sb2coJ3JlbW92ZWQgZXZlbnRzICVPJywgdGhpcy5fcmVtb3ZlZEV2ZW50cylcbiAgICB0aGlzLl9yZW1vdmVkRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLl9ub3Rlc0J5SWQuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlLmlkKVxuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgfSlcblxuICAgIGNyZWF0ZUV2ZW50QXJyYXkgPSB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA+IDBcblxuICAgIC8vIGFkZCBuZXcgZXZlbnRzXG4gICAgY29uc29sZS5sb2coJ25ldyBldmVudHMgJU8nLCB0aGlzLl9uZXdFdmVudHMpXG4gICAgdGhpcy5fbmV3RXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB0aGlzLl9ldmVudHMucHVzaChldmVudClcbiAgICAgIHRvYmVQYXJzZWQucHVzaChldmVudClcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuaWQpXG4gICAgfSlcblxuICAgIC8vIG1vdmVkIGV2ZW50cyBuZWVkIHRvIGJlIHBhcnNlZFxuICAgIGNvbnNvbGUubG9nKCdtb3ZlZCAlTycsIHRoaXMuX21vdmVkRXZlbnRzKVxuICAgIHRoaXMuX21vdmVkRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpXG4gICAgfSlcblxuICAgIC8vdG9iZVBhcnNlZCA9IFsuLi50b2JlUGFyc2VkLCAuLi5BcnJheS5mcm9tKHNvbmcubW92ZWRFdmVudHMudmFsdWVzKCkpXVxuXG4gICAgY29uc29sZS50aW1lKCdwYXJzZScpXG4gICAgaWYodG9iZVBhcnNlZC5sZW5ndGggPiAwKXtcbiAgICAgIC8vY29uc29sZS5sb2coJ3RvYmVQYXJzZWQgJU8nLCB0b2JlUGFyc2VkKVxuICAgICAgdG9iZVBhcnNlZCA9IFsuLi50b2JlUGFyc2VkLCAuLi50aGlzLl90aW1lRXZlbnRzXVxuICAgICAgY29uc29sZS5sb2coJ3BhcnNlRXZlbnRzJywgdG9iZVBhcnNlZC5sZW5ndGggLSB0aGlzLl90aW1lRXZlbnRzLmxlbmd0aClcbiAgICAgIHBhcnNlRXZlbnRzKHRvYmVQYXJzZWQsIHRoaXMuaXNQbGF5aW5nKVxuICAgICAgdG9iZVBhcnNlZC5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5pZCwgZXZlbnQudHlwZSlcbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gcWFtYmkuTk9URV9PTil7XG4gICAgICAgICAgaWYoZXZlbnQubWlkaU5vdGUpe1xuICAgICAgICAgICAgdGhpcy5fbm90ZXNCeUlkLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQudHlwZSlcbiAgICAgICAgICAgIC8vdGhpcy5fbm90ZXMucHVzaChldmVudC5taWRpTm90ZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0aGlzLl9ub3RlcyA9IEFycmF5LmZyb20odGhpcy5fbm90ZXNCeUlkLnZhbHVlcygpKVxuICAgIH1cbiAgICBjb25zb2xlLnRpbWVFbmQoJ3BhcnNlJylcblxuXG4gICAgaWYoY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICBjb25zb2xlLnRpbWUoJ3RvIGFycmF5JylcbiAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSlcbiAgICAgIHRoaXMuX25vdGVzID0gQXJyYXkuZnJvbSh0aGlzLl9ub3Rlc0J5SWQudmFsdWVzKCkpXG4gICAgICBjb25zb2xlLnRpbWVFbmQoJ3RvIGFycmF5JylcbiAgICB9XG5cblxuICAgIGNvbnNvbGUudGltZShgc29ydGluZyAke3RoaXMuX2V2ZW50cy5sZW5ndGh9IGV2ZW50c2ApXG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbm90ZXMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBhLm5vdGVPbi50aWNrcyAtIGIubm90ZU9uLnRpY2tzXG4gICAgfSlcbiAgICBjb25zb2xlLnRpbWVFbmQoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuXG4gICAgY29uc29sZS5sb2coJ25vdGVzICVPJywgdGhpcy5fbm90ZXMpXG5cbiAgICBjb25zb2xlLnRpbWVFbmQoJ3RvdGFsJylcbiAgICBjb25zb2xlLmdyb3VwRW5kKCd1cGRhdGUgc29uZycpXG4gICAgY29uc29sZS50aW1lRW5kKCd1cGRhdGUgc29uZycpXG5cblxuICAgIC8vIGdldCB0aGUgbGFzdCBldmVudCBvZiB0aGlzIHNvbmdcbiAgICBsZXQgbGFzdEV2ZW50ID0gdGhpcy5fZXZlbnRzW3RoaXMuX2V2ZW50cy5sZW5ndGggLSAxXVxuICAgIGxldCBsYXN0VGltZUV2ZW50ID0gdGhpcy5fdGltZUV2ZW50c1t0aGlzLl90aW1lRXZlbnRzLmxlbmd0aCAtIDFdXG4gICAgaWYobGFzdFRpbWVFdmVudC50aWNrcyA+IGxhc3RFdmVudC50aWNrcyl7XG4gICAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50XG4gICAgfVxuXG4gICAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBkYXRhIG9mIHRoZSBmaXJzdCBiZWF0IGluIHRoZSBiYXIgYWZ0ZXIgdGhlIGxhc3QgYmFyXG4gICAgdGhpcy5iYXJzID0gbGFzdEV2ZW50LmJhclxuICAgIC8vY29uc29sZS5sb2coJ251bSBiYXJzJywgdGhpcy5iYXJzLCBsYXN0RXZlbnQpXG4gICAgbGV0IHRpY2tzID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcywge1xuICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICB0YXJnZXQ6IFt0aGlzLmJhcnMgKyAxXSxcbiAgICAgIHJlc3VsdDogJ3RpY2tzJ1xuICAgIH0pLnRpY2tzXG5cbiAgICAvLyB3ZSB3YW50IHRvIHB1dCB0aGUgRU5EX09GX1RSQUNLIGV2ZW50IGF0IHRoZSB2ZXJ5IGxhc3QgdGljayBvZiB0aGUgbGFzdCBiYXIsIHNvIHdlIGNhbGN1bGF0ZSB0aGF0IHBvc2l0aW9uXG4gICAgbGV0IG1pbGxpcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIHtcbiAgICAgIHR5cGU6ICd0aWNrcycsXG4gICAgICB0YXJnZXQ6IHRpY2tzIC0gMSxcbiAgICAgIHJlc3VsdDogJ21pbGxpcydcbiAgICB9KS5taWxsaXNcblxuXG4gICAgdGhpcy5fbGFzdEV2ZW50LnRpY2tzID0gdGlja3MgLSAxXG4gICAgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuXG4gICAgY29uc29sZS5sb2coJ2xhc3QgdGljaycsIHRoaXMuX2xhc3RFdmVudC50aWNrcywgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcylcbiAgICB0aGlzLl9kdXJhdGlvblRpY2tzID0gdGhpcy5fbGFzdEV2ZW50LnRpY2tzXG4gICAgdGhpcy5fZHVyYXRpb25NaWxsaXMgPSB0aGlzLl9sYXN0RXZlbnQubWlsbGlzXG4gICAgdGhpcy5fcGxheWhlYWQudXBkYXRlU29uZygpXG5cbiAgICAvLyBhZGQgbWV0cm9ub21lIGV2ZW50c1xuICAgIGlmKHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyB8fCB0aGlzLl9tZXRyb25vbWUuYmFycyAhPT0gdGhpcy5iYXJzKXtcbiAgICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9IHBhcnNlRXZlbnRzKFsuLi50aGlzLl90aW1lRXZlbnRzLCAuLi50aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKCldKVxuICAgIH1cbiAgICB0aGlzLl9hbGxFdmVudHMgPSBbLi4udGhpcy5fbWV0cm9ub21lRXZlbnRzLCAuLi50aGlzLl9ldmVudHNdXG4gICAgc29ydEV2ZW50cyh0aGlzLl9hbGxFdmVudHMpXG4gIH1cblxuICBwbGF5KHR5cGUsIC4uLmFyZ3MpOiB2b2lke1xuICAgIHRoaXMuX3BsYXkodHlwZSwgLi4uYXJncylcbiAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX21pbGxpc30pXG4gIH1cblxuICBfcGxheSh0eXBlLCAuLi5hcmdzKXtcbiAgICBpZih0eXBlb2YgdHlwZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy5zZXRQb3NpdGlvbih0eXBlLCAuLi5hcmdzKVxuICAgIH1cbiAgICBpZih0aGlzLl9wbGF5aW5nKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX3RpbWVTdGFtcCA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgdGhpcy5fc2NoZWR1bGVyLnNldFRpbWVTdGFtcCh0aGlzLl90aW1lU3RhbXApXG5cbiAgICBpZih0aGlzLl9wYXVzZWQpe1xuICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9wbGF5aW5nID0gdHJ1ZVxuICAgIHRoaXMuX3NjaGVkdWxlci5pbml0KHRoaXMuX21pbGxpcylcbiAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX21pbGxpcylcbiAgICB0aGlzLl9wdWxzZSgpXG4gIH1cblxuXG4gIHBhdXNlKCk6IHZvaWR7XG4gICAgdGhpcy5fcGF1c2VkID0gIXRoaXMuX3BhdXNlZFxuICAgIGlmKHRoaXMuX3BhdXNlZCl7XG4gICAgICB0aGlzLl9wbGF5aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BhdXNlJywgZGF0YTogdGhpcy5fcGF1c2VkfSlcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMucGxheSgpXG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGF1c2UnLCBkYXRhOiB0aGlzLl9wYXVzZWR9KVxuICAgIH1cbiAgfVxuXG4gIHN0b3AoKTogdm9pZHtcbiAgICB0aGlzLmFsbE5vdGVzT2ZmKClcbiAgICBpZih0aGlzLl9wbGF5aW5nIHx8IHRoaXMuX3BhdXNlZCl7XG4gICAgICB0aGlzLl9wbGF5aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlXG4gICAgfVxuICAgIGlmKHRoaXMuX21pbGxpcyAhPT0gMCl7XG4gICAgICB0aGlzLl9taWxsaXMgPSAwXG4gICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX21pbGxpcylcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdG9wJ30pXG4gICAgfVxuICB9XG5cbiAgc2V0TWV0cm9ub21lKGZsYWcpe1xuICAgIGlmKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9ICF0aGlzLnVzZU1ldHJvbm9tZVxuICAgIH1lbHNle1xuICAgICAgdGhpcy51c2VNZXRyb25vbWUgPSBmbGFnXG4gICAgfVxuICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKHRoaXMudXNlTWV0cm9ub21lKVxuICB9XG5cbiAgY29uZmlndXJlTWV0cm9ub21lKGNvbmZpZyl7XG4gICAgdGhpcy5fbWV0cm9ub21lLmNvbmZpZ3VyZShjb25maWcpXG4gIH1cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKCh0cmFjaykgPT4ge1xuICAgICAgdHJhY2suYWxsTm90ZXNPZmYoKVxuICAgIH0pXG5cbiAgICAvL3RoaXMuX3NjaGVkdWxlci5hbGxOb3Rlc09mZigpXG4gICAgdGhpcy5fbWV0cm9ub21lLmFsbE5vdGVzT2ZmKClcbiAgfVxuXG4gIGdldFRyYWNrcygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fdHJhY2tzXVxuICB9XG5cbiAgZ2V0UGFydHMoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX3BhcnRzXVxuICB9XG5cbiAgZ2V0RXZlbnRzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ldmVudHNdXG4gIH1cblxuICBnZXROb3Rlcygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fbm90ZXNdXG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbihhcmdzKXtcbiAgICByZXR1cm4gY2FsY3VsYXRlUG9zaXRpb24odGhpcywgYXJncylcbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0UG9zaXRpb24odHlwZSwgLi4uYXJncyl7XG5cbiAgICBsZXQgd2FzUGxheWluZyA9IHRoaXMuX3BsYXlpbmdcbiAgICBpZih0aGlzLl9wbGF5aW5nKXtcbiAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgfVxuXG4gICAgbGV0IHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpXG4gICAgLy9sZXQgbWlsbGlzID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ21pbGxpcycpXG4gICAgaWYocG9zaXRpb24gPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX21pbGxpcyA9IHBvc2l0aW9uLm1pbGxpc1xuXG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgZGF0YTogcG9zaXRpb25cbiAgICB9KVxuXG4gICAgaWYod2FzUGxheWluZyl7XG4gICAgICB0aGlzLl9wbGF5KClcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZygnc2V0UG9zaXRpb24nLCB0aGlzLl9taWxsaXMpXG4gIH1cblxuICBnZXRQb3NpdGlvbigpe1xuICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKS5wb3NpdGlvblxuICB9XG5cbiAgZ2V0UGxheWhlYWQoKXtcbiAgICByZXR1cm4gdGhpcy5fcGxheWhlYWQuZ2V0KClcbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0TGVmdExvY2F0b3IodHlwZSwgLi4uYXJncyl7XG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJylcblxuICAgIGlmKHRoaXMuX2xlZnRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcG9zaXRpb24gZm9yIGxvY2F0b3InKVxuICAgICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0UmlnaHRMb2NhdG9yKHR5cGUsIC4uLmFyZ3Mpe1xuICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKVxuXG4gICAgaWYodGhpcy5fcmlnaHRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBwb3NpdGlvbiBmb3IgbG9jYXRvcicpXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICBzZXRMb29wKGZsYWcgPSBudWxsKXtcblxuICAgIHRoaXMuX2xvb3AgPSBmbGFnICE9PSBudWxsID8gZmxhZyA6ICF0aGlzLl9sb29wXG5cbiAgICBpZih0aGlzLl9yaWdodExvY2F0b3IgPT09IGZhbHNlIHx8IHRoaXMuX2xlZnRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IHRydWVcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gbG9jYXRvcnMgY2FuIG5vdCAoeWV0KSBiZSB1c2VkIHRvIGp1bXAgb3ZlciBhIHNlZ21lbnRcbiAgICBpZih0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzIDw9IHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcyl7XG4gICAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IHRydWVcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5fbG9vcER1cmF0aW9uID0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAtIHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpc1xuICAgIC8vY29uc29sZS5sb2codGhpcy5fbG9vcCwgdGhpcy5fbG9vcER1cmF0aW9uKVxuICAgIHRoaXMuX3NjaGVkdWxlci5iZXlvbmRMb29wID0gdGhpcy5fbWlsbGlzID4gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgIHJldHVybiB0aGlzLl9sb29wXG4gIH1cblxuICBfcHVsc2UoKTogdm9pZHtcbiAgICBpZih0aGlzLl9wbGF5aW5nID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgbGV0IGRpZmYgPSBub3cgLSB0aGlzLl90aW1lU3RhbXBcblxuICAgIGlmKHRoaXMuX2xvb3AgJiYgdGhpcy5fc2NoZWR1bGVyLmxvb3BlZCAmJiB0aGlzLl9taWxsaXMgPiB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzKXtcbiAgICAgIHRoaXMuX21pbGxpcyAtPSB0aGlzLl9sb29wRHVyYXRpb25cbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fbWlsbGlzICsgZGlmZilcbiAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICB0eXBlOiAnbG9vcCcsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICAvL2NvbnNvbGUubG9nKGRpZmYsIHRoaXMuX21pbGxpcylcbiAgICAgIHRoaXMuX3BsYXloZWFkLnVwZGF0ZSgnbWlsbGlzJywgZGlmZilcbiAgICB9XG5cbiAgICB0aGlzLl9taWxsaXMgKz0gZGlmZlxuICAgIHRoaXMuX3RpbWVTdGFtcCA9IG5vd1xuXG4gICAgaWYodGhpcy5fbWlsbGlzID49IHRoaXMuX2R1cmF0aW9uTWlsbGlzKXtcbiAgICAgIHRoaXMuc3RvcCgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKHRoaXMuX21pbGxpcylcblxuICAgIC8vY29uc29sZS5sb2coJ3B1bHNlJywgZGlmZilcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcHVsc2UuYmluZCh0aGlzKSlcbiAgfVxuXG4gIC8qXG4gICAgaGVscGVyIG1ldGhvZDogY29udmVydHMgdXNlciBmcmllbmRseSBwb3NpdGlvbiBmb3JtYXQgdG8gaW50ZXJuYWwgZm9ybWF0XG5cbiAgICBwb3NpdGlvbjpcbiAgICAgIC0gJ3RpY2tzJywgOTYwMDBcbiAgICAgIC0gJ21pbGxpcycsIDEyMzRcbiAgICAgIC0gJ3BlcmNlbnRhZ2UnLCA1NVxuICAgICAgLSAnYmFyc2JlYXRzJywgMSwgNCwgMCwgMjUgLT4gYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tcbiAgICAgIC0gJ3RpbWUnLCAwLCAzLCA0OSwgNTY2IC0+IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcblxuICAqL1xuICBfY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgcmVzdWx0VHlwZSl7XG4gICAgbGV0IHRhcmdldFxuXG4gICAgc3dpdGNoKHR5cGUpe1xuICAgICAgY2FzZSAndGlja3MnOlxuICAgICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgICB0YXJnZXQgPSBhcmdzWzBdIHx8IDBcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAndGltZSc6XG4gICAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgICAgdGFyZ2V0ID0gYXJnc1xuICAgICAgICBicmVha1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zb2xlLmxvZygndW5zdXBwb3J0ZWQgdHlwZScpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGxldCBwb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIHtcbiAgICAgIHR5cGUsXG4gICAgICB0YXJnZXQsXG4gICAgICByZXN1bHQ6IHJlc3VsdFR5cGUsXG4gICAgfSlcblxuICAgIHJldHVybiBwb3NpdGlvblxuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayl7XG4gICAgcmV0dXJuIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spXG4gIH1cblxuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKVxuICB9XG59XG4iLCJcbmltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuaW1wb3J0IHtwYXJzZU1JRElGaWxlfSBmcm9tICcuL21pZGlmaWxlJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtUcmFja30gZnJvbSAnLi90cmFjaydcbmltcG9ydCB7U29uZ30gZnJvbSAnLi9zb25nJ1xuaW1wb3J0IHtiYXNlNjRUb0JpbmFyeX0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtzdGF0dXMsIGpzb24sIGFycmF5QnVmZmVyfSBmcm9tICcuL2ZldGNoX2hlbHBlcnMnXG5cbmNvbnN0IFBQUSA9IDk2MFxuXG5cbmZ1bmN0aW9uIHRvU29uZyhwYXJzZWQpe1xuICBsZXQgdHJhY2tzID0gcGFyc2VkLnRyYWNrc1xuICBsZXQgcHBxID0gcGFyc2VkLmhlYWRlci50aWNrc1BlckJlYXRcbiAgbGV0IHBwcUZhY3RvciA9IFBQUSAvIHBwcSAvL0BUT0RPOiBnZXQgcHBxIGZyb20gY29uZmlnIC0+IG9ubHkgbmVjZXNzYXJ5IGlmIHlvdSB3YW50IHRvIGNoYW5nZSB0aGUgcHBxIG9mIHRoZSBNSURJIGZpbGUgIVxuICBsZXQgdGltZUV2ZW50cyA9IFtdXG4gIGxldCBicG0gPSAtMVxuICBsZXQgbm9taW5hdG9yID0gLTFcbiAgbGV0IGRlbm9taW5hdG9yID0gLTFcbiAgbGV0IG5ld1RyYWNrcyA9IFtdXG5cbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3MudmFsdWVzKCkpe1xuICAgIGxldCBsYXN0VGlja3MsIGxhc3RUeXBlXG4gICAgbGV0IHRpY2tzID0gMFxuICAgIGxldCB0eXBlXG4gICAgbGV0IGNoYW5uZWwgPSAtMVxuICAgIGxldCB0cmFja05hbWVcbiAgICBsZXQgdHJhY2tJbnN0cnVtZW50TmFtZVxuICAgIGxldCBldmVudHMgPSBbXTtcblxuICAgIGZvcihsZXQgZXZlbnQgb2YgdHJhY2spe1xuICAgICAgdGlja3MgKz0gKGV2ZW50LmRlbHRhVGltZSAqIHBwcUZhY3Rvcik7XG5cbiAgICAgIGlmKGNoYW5uZWwgPT09IC0xICYmIHR5cGVvZiBldmVudC5jaGFubmVsICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGNoYW5uZWwgPSBldmVudC5jaGFubmVsO1xuICAgICAgfVxuICAgICAgdHlwZSA9IGV2ZW50LnN1YnR5cGU7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRlbHRhVGltZSwgdGlja3MsIHR5cGUpO1xuXG4gICAgICBzd2l0Y2goZXZlbnQuc3VidHlwZSl7XG5cbiAgICAgICAgY2FzZSAndHJhY2tOYW1lJzpcbiAgICAgICAgICB0cmFja05hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2luc3RydW1lbnROYW1lJzpcbiAgICAgICAgICBpZihldmVudC50ZXh0KXtcbiAgICAgICAgICAgIHRyYWNrSW5zdHJ1bWVudE5hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdub3RlT24nOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4OTAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSlcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdub3RlT2ZmJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweDgwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnc2V0VGVtcG8nOlxuICAgICAgICAgIC8vIHNvbWV0aW1lcyAyIHRlbXBvIGV2ZW50cyBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uIGluIHRpY2tzXG4gICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICBsZXQgdG1wID0gNjAwMDAwMDAgLyBldmVudC5taWNyb3NlY29uZHNQZXJCZWF0O1xuXG4gICAgICAgICAgaWYodGlja3MgPT09IGxhc3RUaWNrcyAmJiB0eXBlID09PSBsYXN0VHlwZSl7XG4gICAgICAgICAgICAvL2NvbnNvbGUuaW5mbygndGVtcG8gZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2snLCB0aWNrcywgdG1wKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoYnBtID09PSAtMSl7XG4gICAgICAgICAgICBicG0gPSB0bXA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRpbWVFdmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweDUxLCB0bXApKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3RpbWVTaWduYXR1cmUnOlxuICAgICAgICAgIC8vIHNvbWV0aW1lcyAyIHRpbWUgc2lnbmF0dXJlIGV2ZW50cyBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uIGluIHRpY2tzXG4gICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICBpZihsYXN0VGlja3MgPT09IHRpY2tzICYmIGxhc3RUeXBlID09PSB0eXBlKXtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygndGltZSBzaWduYXR1cmUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2snLCB0aWNrcywgZXZlbnQubnVtZXJhdG9yLCBldmVudC5kZW5vbWluYXRvcik7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKG5vbWluYXRvciA9PT0gLTEpe1xuICAgICAgICAgICAgbm9taW5hdG9yID0gZXZlbnQubnVtZXJhdG9yXG4gICAgICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yXG4gICAgICAgICAgfVxuICAgICAgICAgIHRpbWVFdmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweDU4LCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKSlcbiAgICAgICAgICBicmVhaztcblxuXG4gICAgICAgIGNhc2UgJ2NvbnRyb2xsZXInOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4QjAsIGV2ZW50LmNvbnRyb2xsZXJUeXBlLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3Byb2dyYW1DaGFuZ2UnOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4QzAsIGV2ZW50LnByb2dyYW1OdW1iZXIpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwaXRjaEJlbmQnOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4RTAsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIGV2ZW50LnR5cGUpO1xuICAgICAgfVxuXG4gICAgICBsYXN0VHlwZSA9IHR5cGVcbiAgICAgIGxhc3RUaWNrcyA9IHRpY2tzXG4gICAgfVxuXG4gICAgaWYoZXZlbnRzLmxlbmd0aCA+IDApe1xuICAgICAgLy9jb25zb2xlLmNvdW50KGV2ZW50cy5sZW5ndGgpXG4gICAgICBsZXQgbmV3VHJhY2sgPSBuZXcgVHJhY2sodHJhY2tOYW1lKVxuICAgICAgbGV0IHBhcnQgPSBuZXcgUGFydCgpXG4gICAgICBuZXdUcmFjay5hZGRQYXJ0cyhwYXJ0KVxuICAgICAgcGFydC5hZGRFdmVudHMoLi4uZXZlbnRzKVxuICAgICAgbmV3VHJhY2tzLnB1c2gobmV3VHJhY2spXG4gICAgfVxuICB9XG5cbiAgbGV0IHNvbmcgPSBuZXcgU29uZyh7XG4gICAgcHBxOiBQUFEsXG4gICAgcGxheWJhY2tTcGVlZDogMSxcbiAgICAvL3BwcSxcbiAgICBicG0sXG4gICAgbm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yXG4gIH0pXG4gIHNvbmcuYWRkVHJhY2tzKC4uLm5ld1RyYWNrcylcbiAgc29uZy5hZGRUaW1lRXZlbnRzKC4uLnRpbWVFdmVudHMpXG4gIHNvbmcudXBkYXRlKClcbiAgcmV0dXJuIHNvbmdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbmdGcm9tTUlESUZpbGUoZGF0YSwgc2V0dGluZ3MgPSB7fSl7XG4gIGxldCBzb25nID0gbnVsbDtcblxuICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgIGxldCBidWZmZXIgPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgICBzb25nID0gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gIH1lbHNlIGlmKHR5cGVvZiBkYXRhLmhlYWRlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRhdGEudHJhY2tzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgc29uZyA9IHRvU29uZyhkYXRhKTtcbiAgfWVsc2V7XG4gICAgZGF0YSA9IGJhc2U2NFRvQmluYXJ5KGRhdGEpO1xuICAgIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gICAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgICBzb25nID0gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKCd3cm9uZyBkYXRhJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNvbmdcbiAgLy8ge1xuICAvLyAgIHBwcSA9IG5ld1BQUSxcbiAgLy8gICBicG0gPSBuZXdCUE0sXG4gIC8vICAgcGxheWJhY2tTcGVlZCA9IG5ld1BsYXliYWNrU3BlZWQsXG4gIC8vIH0gPSBzZXR0aW5nc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlQXN5bmModXJsKXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmZXRjaCh1cmwpXG4gICAgLnRoZW4oc3RhdHVzKVxuICAgIC50aGVuKGFycmF5QnVmZmVyKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgcmVzb2x2ZShzb25nRnJvbU1JRElGaWxlKGRhdGEpKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cbiIsImltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7TUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuaW1wb3J0IHtnZXRNSURJSW5wdXRCeUlkLCBnZXRNSURJT3V0cHV0QnlJZH0gZnJvbSAnLi9pbml0X21pZGknXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5pbXBvcnQge01JRElFdmVudFR5cGVzfSBmcm9tICcuL3FhbWJpJ1xuXG5cbmxldCB0cmFja0luZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgVHJhY2t7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gbnVsbCl7XG4gICAgdGhpcy5pZCA9IGBUUl8ke3RyYWNrSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCB0aGlzLmlkXG4gICAgdGhpcy5jaGFubmVsID0gMFxuICAgIHRoaXMubXV0ZWQgPSBmYWxzZVxuICAgIHRoaXMudm9sdW1lID0gMC41XG4gICAgdGhpcy5fb3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLl9vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5fbWlkaUlucHV0cyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX21pZGlPdXRwdXRzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fc29uZyA9IG51bGxcbiAgICB0aGlzLl9wYXJ0cyA9IFtdXG4gICAgdGhpcy5fcGFydHNCeUlkID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fZXZlbnRzID0gW11cbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuICAgIHRoaXMubGF0ZW5jeSA9IDEwMFxuICAgIHRoaXMuX2luc3RydW1lbnQgPSBudWxsXG4gICAgdGhpcy5fcmVjb3JkZWROb3RlcyA9IG5ldyBNYXAoKVxuICAgIC8vdGhpcy5zZXRJbnN0cnVtZW50KG5ldyBJbnN0cnVtZW50KCdzaW5ld2F2ZScpKVxuICB9XG5cbiAgc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50ID0gbnVsbCl7XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuZGlzY29ubmVjdCgpXG4gICAgfVxuICAgIHRoaXMuX2luc3RydW1lbnQgPSBpbnN0cnVtZW50XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgIH1cbiAgfVxuXG4gIGdldEluc3RydW1lbnQoKXtcbiAgICByZXR1cm4gdGhpcy5faW5zdHJ1bWVudFxuICB9XG5cbiAgY29ubmVjdChvdXRwdXQpe1xuICAgIHRoaXMuX291dHB1dC5jb25uZWN0KG91dHB1dClcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKXtcbiAgICB0aGlzLl9vdXRwdXQuZGlzY29ubmVjdCgpXG4gIH1cblxuICBjb25uZWN0TUlESU91dHB1dHMoLi4ub3V0cHV0cyl7XG4gICAgLy9jb25zb2xlLmxvZyhvdXRwdXRzKVxuICAgIG91dHB1dHMuZm9yRWFjaChvdXRwdXQgPT4ge1xuICAgICAgaWYodHlwZW9mIG91dHB1dCA9PT0gJ3N0cmluZycpe1xuICAgICAgICBvdXRwdXQgPSBnZXRNSURJT3V0cHV0QnlJZChvdXRwdXQpXG4gICAgICB9XG4gICAgICBpZihvdXRwdXQgaW5zdGFuY2VvZiBNSURJT3V0cHV0KXtcbiAgICAgICAgdGhpcy5fbWlkaU91dHB1dHMuc2V0KG91dHB1dC5pZCwgb3V0cHV0KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpT3V0cHV0cylcbiAgfVxuXG4gIGRpc2Nvbm5lY3RNSURJT3V0cHV0cyguLi5vdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gICAgaWYob3V0cHV0cy5sZW5ndGggPT09IDApe1xuICAgICAgdGhpcy5fbWlkaU91dHB1dHMuY2xlYXIoKVxuICAgIH1cbiAgICBvdXRwdXRzLmZvckVhY2gocG9ydCA9PiB7XG4gICAgICBpZihwb3J0IGluc3RhbmNlb2YgTUlESU91dHB1dCl7XG4gICAgICAgIHBvcnQgPSBwb3J0LmlkXG4gICAgICB9XG4gICAgICBpZih0aGlzLl9taWRpT3V0cHV0cy5oYXMocG9ydCkpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdyZW1vdmluZycsIHRoaXMuX21pZGlPdXRwdXRzLmdldChwb3J0KS5uYW1lKVxuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5kZWxldGUocG9ydClcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vdGhpcy5fbWlkaU91dHB1dHMgPSB0aGlzLl9taWRpT3V0cHV0cy5maWx0ZXIoLi4ub3V0cHV0cylcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlPdXRwdXRzKVxuICB9XG5cbiAgY29ubmVjdE1JRElJbnB1dHMoLi4uaW5wdXRzKXtcbiAgICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgICBpZih0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaW5wdXQgPSBnZXRNSURJSW5wdXRCeUlkKGlucHV0KVxuICAgICAgfVxuICAgICAgaWYoaW5wdXQgaW5zdGFuY2VvZiBNSURJSW5wdXQpe1xuXG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuc2V0KGlucHV0LmlkLCBpbnB1dClcblxuICAgICAgICBsZXQgbm90ZSwgbWlkaUV2ZW50XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgZSA9PiB7XG5cbiAgICAgICAgICBtaWRpRXZlbnQgPSBuZXcgTUlESUV2ZW50KDEsIC4uLmUuZGF0YSlcbiAgICAgICAgICBtaWRpRXZlbnQudGltZSA9IDAgLy8gcGxheSBpbW1lZGlhdGVseVxuICAgICAgICAgIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuXG4gICAgICAgICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT04pe1xuICAgICAgICAgICAgbm90ZSA9IG5ldyBNSURJTm90ZShtaWRpRXZlbnQpXG4gICAgICAgICAgICB0aGlzLl9yZWNvcmRlZE5vdGVzLnNldChtaWRpRXZlbnQuZGF0YTEsIG5vdGUpXG4gICAgICAgICAgfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT0ZGKXtcbiAgICAgICAgICAgIG5vdGUgPSB0aGlzLl9yZWNvcmRlZE5vdGVzLmdldChtaWRpRXZlbnQuZGF0YTEpXG4gICAgICAgICAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KVxuICAgICAgICAgICAgdGhpcy5fcmVjb3JkZWROb3Rlcy5kZWxldGUobWlkaUV2ZW50LmRhdGExKVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnByb2Nlc3NNSURJRXZlbnQobWlkaUV2ZW50KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICB9XG5cbiAgZGlzY29ubmVjdE1JRElJbnB1dHMoLi4uaW5wdXRzKXtcbiAgICBpZihpbnB1dHMubGVuZ3RoID09PSAwKXtcbiAgICAgIHRoaXMuX21pZGlJbnB1dHMuY2xlYXIoKVxuICAgIH1cbiAgICBpbnB1dHMuZm9yRWFjaChwb3J0ID0+IHtcbiAgICAgIGlmKHBvcnQgaW5zdGFuY2VvZiBNSURJSW5wdXQpe1xuICAgICAgICBwb3J0ID0gcG9ydC5pZFxuICAgICAgfVxuICAgICAgaWYodGhpcy5fbWlkaU91dHB1dHMuaGFzKHBvcnQpKXtcbiAgICAgICAgdGhpcy5fbWlkaU91dHB1dHMuZGVsZXRlKHBvcnQpXG4gICAgICB9XG4gICAgfSlcbiAgICAvL3RoaXMuX21pZGlPdXRwdXRzID0gdGhpcy5fbWlkaU91dHB1dHMuZmlsdGVyKC4uLm91dHB1dHMpXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICB9XG5cbiAgZ2V0TUlESUlucHV0cygpe1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX21pZGlJbnB1dHMudmFsdWVzKCkpXG4gIH1cblxuICBnZXRNSURJT3V0cHV0cygpe1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKVxuICB9XG5cbiAgY29weSgpe1xuICAgIGxldCB0ID0gbmV3IFRyYWNrKHRoaXMubmFtZSArICdfY29weScpIC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICBsZXQgcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBsZXQgY29weSA9IHBhcnQuY29weSgpXG4gICAgICBjb25zb2xlLmxvZyhjb3B5KVxuICAgICAgcGFydHMucHVzaChjb3B5KVxuICAgIH0pXG4gICAgdC5hZGRQYXJ0cyguLi5wYXJ0cylcbiAgICB0LnVwZGF0ZSgpXG4gICAgcmV0dXJuIHRcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KVxuICAgIH0pXG4gIH1cblxuICBhZGRQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG4gICAgcGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgcGFydC5fdHJhY2sgPSB0aGlzXG4gICAgICB0aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpXG4gICAgICB0aGlzLl9wYXJ0cy5wdXNoKHBhcnQpXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgcGFydC5fc29uZyA9IHNvbmdcbiAgICAgICAgc29uZy5fbmV3UGFydHMucHVzaChwYXJ0KVxuICAgICAgfVxuXG4gICAgICBsZXQgZXZlbnRzID0gcGFydC5fZXZlbnRzXG4gICAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdGhpc1xuICAgICAgICBpZihzb25nKXtcbiAgICAgICAgICBldmVudC5fc29uZyA9IHNvbmdcbiAgICAgICAgICAvL3NvbmcuX25ld0V2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudClcbiAgICAgIH0pXG4gICAgICB0aGlzLl9ldmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgfSlcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIHJlbW92ZVBhcnRzKC4uLnBhcnRzKXtcbiAgICBsZXQgc29uZyA9IHRoaXMuX3NvbmdcblxuICAgIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIHBhcnQuX3RyYWNrID0gbnVsbFxuICAgICAgdGhpcy5fcGFydHNCeUlkLmRlbGV0ZShwYXJ0LmlkLCBwYXJ0KVxuICAgICAgaWYoc29uZyl7XG4gICAgICAgIHNvbmcuX2RlbGV0ZWRQYXJ0cy5wdXNoKHBhcnQpXG4gICAgICB9XG5cbiAgICAgIGxldCBldmVudHMgPSBwYXJ0Ll9ldmVudHNcbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbFxuICAgICAgICBpZihzb25nKXtcbiAgICAgICAgICBldmVudC5fc29uZyA9IG51bGxcbiAgICAgICAgICAvL3NvbmcuX2RlbGV0ZWRFdmVudHMucHVzaChldmVudClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZCwgZXZlbnQpXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgfVxuXG4gIGdldFBhcnRzKCl7XG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy5fcGFydHMgPSBBcnJheS5mcm9tKHRoaXMuX3BhcnRzQnlJZC52YWx1ZXMoKSlcbiAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSlcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIFsuLi50aGlzLl9wYXJ0c11cbiAgfVxuXG5cbiAgdHJhbnNwb3NlUGFydHMoYW1vdW50OiBudW1iZXIsIC4uLnBhcnRzKXtcbiAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgcGFydC50cmFuc3Bvc2UoYW1vdW50KVxuICAgIH0pXG4gIH1cblxuICBtb3ZlUGFydHModGlja3M6IG51bWJlciwgLi4ucGFydHMpe1xuICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBwYXJ0Lm1vdmUodGlja3MpXG4gICAgfSlcbiAgfVxuXG4gIG1vdmVQYXJ0c1RvKHRpY2tzOiBudW1iZXIsIC4uLnBhcnRzKXtcbiAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgcGFydC5tb3ZlVG8odGlja3MpXG4gICAgfSlcbiAgfVxuXG4gIGFkZEV2ZW50cyguLi5ldmVudHMpe1xuICAgIGxldCBwID0gbmV3IFBhcnQoKVxuICAgIHAuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICB0aGlzLmFkZFBhcnRzKHApXG4gIH1cblxuICByZW1vdmVFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcGFydHMgPSBuZXcgU2V0KClcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIHBhcnRzLnNldChldmVudC5fcGFydClcbiAgICAgIGV2ZW50Ll9wYXJ0ID0gbnVsbFxuICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbFxuICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2goLi4uQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKVxuICAgICAgdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHModGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBsZXQgcGFydHMgPSBuZXcgU2V0KClcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2goLi4uQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKVxuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgfVxuICB9XG5cbiAgbW92ZUV2ZW50c1RvKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlVG8odGlja3MpXG4gICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2goLi4uQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKVxuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgfVxuICB9XG5cbiAgZ2V0RXZlbnRzKGZpbHRlcjogc3RyaW5nW10gPSBudWxsKXsgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c10gLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgfVxuXG4gIG11dGUoZmxhZzogYm9vbGVhbiA9IG51bGwpe1xuICAgIGlmKGZsYWcpe1xuICAgICAgdGhpcy5fbXV0ZWQgPSBmbGFnXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9tdXRlZCA9ICF0aGlzLl9tdXRlZFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpeyAvLyB5b3Ugc2hvdWxkIG9ubHkgdXNlIHRoaXMgaW4gaHVnZSBzb25ncyAoPjEwMCB0cmFja3MpXG4gICAgaWYodGhpcy5fY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB9XG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICB9XG5cbiAgYWxsTm90ZXNPZmYoKXtcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICAgIH1cblxuICAgIGxldCB0aW1lU3RhbXAgPSAoY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApICsgdGhpcy5sYXRlbmN5XG4gICAgZm9yKGxldCBvdXRwdXQgb2YgdGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpe1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aW1lU3RhbXApIC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzc01JRElFdmVudChldmVudCwgdXNlTGF0ZW5jeSA9IGZhbHNlKXtcblxuICAgIGxldCBsYXRlbmN5ID0gdXNlTGF0ZW5jeSA/IHRoaXMubGF0ZW5jeSA6IDBcbiAgICAvL2NvbnNvbGUubG9nKGxhdGVuY3kpXG5cbiAgICAvLyBzZW5kIHRvIGphdmFzY3JpcHQgaW5zdHJ1bWVudFxuICAgIGlmKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpe1xuICAgICAgdGhpcy5faW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KGV2ZW50LCBldmVudC50aW1lIC8gMTAwMClcbiAgICB9XG5cbiAgICAvLyBzZW5kIHRvIGV4dGVybmFsIGhhcmR3YXJlIG9yIHNvZnR3YXJlIGluc3RydW1lbnRcbiAgICBmb3IobGV0IHBvcnQgb2YgdGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpe1xuICAgICAgaWYocG9ydCl7XG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDEyOCB8fCBldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMl0sIGV2ZW50LnRpbWUgKyBsYXRlbmN5KVxuICAgICAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxOTIgfHwgZXZlbnQudHlwZSA9PT0gMjI0KXtcbiAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExXSwgZXZlbnQudGltZSArIGxhdGVuY3kpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuIiwiaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5cbmNvbnN0XG4gIG1QSSA9IE1hdGguUEksXG4gIG1Qb3cgPSBNYXRoLnBvdyxcbiAgbVJvdW5kID0gTWF0aC5yb3VuZCxcbiAgbUZsb29yID0gTWF0aC5mbG9vcixcbiAgbVJhbmRvbSA9IE1hdGgucmFuZG9tXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5pY2VUaW1lKG1pbGxpcyl7XG4gIGxldCBoLCBtLCBzLCBtcyxcbiAgICBzZWNvbmRzLFxuICAgIHRpbWVBc1N0cmluZyA9ICcnO1xuXG4gIHNlY29uZHMgPSBtaWxsaXMgLyAxMDAwOyAvLyDihpIgbWlsbGlzIHRvIHNlY29uZHNcbiAgaCA9IG1GbG9vcihzZWNvbmRzIC8gKDYwICogNjApKTtcbiAgbSA9IG1GbG9vcigoc2Vjb25kcyAlICg2MCAqIDYwKSkgLyA2MCk7XG4gIHMgPSBtRmxvb3Ioc2Vjb25kcyAlICg2MCkpO1xuICBtcyA9IG1Sb3VuZCgoc2Vjb25kcyAtIChoICogMzYwMCkgLSAobSAqIDYwKSAtIHMpICogMTAwMCk7XG5cbiAgdGltZUFzU3RyaW5nICs9IGggKyAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtIDwgMTAgPyAnMCcgKyBtIDogbTtcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IHMgPCAxMCA/ICcwJyArIHMgOiBzO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbXMgPT09IDAgPyAnMDAwJyA6IG1zIDwgMTAgPyAnMDAnICsgbXMgOiBtcyA8IDEwMCA/ICcwJyArIG1zIDogbXM7XG5cbiAgLy9jb25zb2xlLmxvZyhoLCBtLCBzLCBtcyk7XG4gIHJldHVybiB7XG4gICAgaG91cjogaCxcbiAgICBtaW51dGU6IG0sXG4gICAgc2Vjb25kOiBzLFxuICAgIG1pbGxpc2Vjb25kOiBtcyxcbiAgICB0aW1lQXNTdHJpbmc6IHRpbWVBc1N0cmluZyxcbiAgICB0aW1lQXNBcnJheTogW2gsIG0sIHMsIG1zXVxuICB9O1xufVxuXG5cbi8vIGFkYXB0ZWQgdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vZGFuZ3Vlci9ibG9nLWV4YW1wbGVzL2Jsb2IvbWFzdGVyL2pzL2Jhc2U2NC1iaW5hcnkuanNcbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0JpbmFyeShpbnB1dCl7XG4gIGxldCBrZXlTdHIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nLFxuICAgIGJ5dGVzLCB1YXJyYXksIGJ1ZmZlcixcbiAgICBsa2V5MSwgbGtleTIsXG4gICAgY2hyMSwgY2hyMiwgY2hyMyxcbiAgICBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0LFxuICAgIGksIGogPSAwO1xuXG4gIGJ5dGVzID0gTWF0aC5jZWlsKCgzICogaW5wdXQubGVuZ3RoKSAvIDQuMCk7XG4gIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihieXRlcyk7XG4gIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgbGtleTEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBsa2V5MiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGggLSAxKSk7XG4gIGlmKGxrZXkxID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcbiAgaWYobGtleTIgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuXG4gIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csICcnKTtcblxuICBmb3IoaSA9IDA7IGkgPCBieXRlczsgaSArPSAzKSB7XG4gICAgLy9nZXQgdGhlIDMgb2N0ZWN0cyBpbiA0IGFzY2lpIGNoYXJzXG4gICAgZW5jMSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzMgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jNCA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcblxuICAgIGNocjEgPSAoZW5jMSA8PCAyKSB8IChlbmMyID4+IDQpO1xuICAgIGNocjIgPSAoKGVuYzIgJiAxNSkgPDwgNCkgfCAoZW5jMyA+PiAyKTtcbiAgICBjaHIzID0gKChlbmMzICYgMykgPDwgNikgfCBlbmM0O1xuXG4gICAgdWFycmF5W2ldID0gY2hyMTtcbiAgICBpZihlbmMzICE9IDY0KSB1YXJyYXlbaSsxXSA9IGNocjI7XG4gICAgaWYoZW5jNCAhPSA2NCkgdWFycmF5W2krMl0gPSBjaHIzO1xuICB9XG4gIC8vY29uc29sZS5sb2coYnVmZmVyKTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdHlwZVN0cmluZyhvKXtcbiAgaWYodHlwZW9mIG8gIT0gJ29iamVjdCcpe1xuICAgIHJldHVybiB0eXBlb2YgbztcbiAgfVxuXG4gIGlmKG8gPT09IG51bGwpe1xuICAgIHJldHVybiAnbnVsbCc7XG4gIH1cblxuICAvL29iamVjdCwgYXJyYXksIGZ1bmN0aW9uLCBkYXRlLCByZWdleHAsIHN0cmluZywgbnVtYmVyLCBib29sZWFuLCBlcnJvclxuICBsZXQgaW50ZXJuYWxDbGFzcyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5tYXRjaCgvXFxbb2JqZWN0XFxzKFxcdyspXFxdLylbMV07XG4gIHJldHVybiBpbnRlcm5hbENsYXNzLnRvTG93ZXJDYXNlKCk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRFdmVudHMoZXZlbnRzKXtcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICBsZXQgciA9IGEudHlwZSAtIGIudHlwZTtcbiAgICAgIGlmKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgciA9IC0xXG4gICAgICB9XG4gICAgICByZXR1cm4gclxuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3NcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrSWZCYXNlNjQoZGF0YSl7XG4gIGxldCBwYXNzZWQgPSB0cnVlO1xuICB0cnl7XG4gICAgYXRvYihkYXRhKTtcbiAgfWNhdGNoKGUpe1xuICAgIHBhc3NlZCA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBwYXNzZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFcXVhbFBvd2VyQ3VydmUobnVtU3RlcHMsIHR5cGUsIG1heFZhbHVlKSB7XG4gIGxldCBpLCB2YWx1ZSwgcGVyY2VudCxcbiAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG51bVN0ZXBzKVxuXG4gIGZvcihpID0gMDsgaSA8IG51bVN0ZXBzOyBpKyspe1xuICAgIHBlcmNlbnQgPSBpIC8gbnVtU3RlcHNcbiAgICBpZih0eXBlID09PSAnZmFkZUluJyl7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKCgxLjAgLSBwZXJjZW50KSAqIDAuNSAqIG1QSSkgKiBtYXhWYWx1ZVxuICAgIH1lbHNlIGlmKHR5cGUgPT09ICdmYWRlT3V0Jyl7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKHBlcmNlbnQgKiAwLjUgKiBNYXRoLlBJKSAqIG1heFZhbHVlXG4gICAgfVxuICAgIHZhbHVlc1tpXSA9IHZhbHVlXG4gICAgaWYoaSA9PT0gbnVtU3RlcHMgLSAxKXtcbiAgICAgIHZhbHVlc1tpXSA9IHR5cGUgPT09ICdmYWRlSW4nID8gMSA6IDBcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja01JRElOdW1iZXIodmFsdWUpe1xuICAvL2NvbnNvbGUubG9nKHZhbHVlKTtcbiAgaWYoaXNOYU4odmFsdWUpKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmKHZhbHVlIDwgMCB8fCB2YWx1ZSA+IDEyNyl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEyNycpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cblxuLypcbi8vb2xkIHNjaG9vbCBhamF4XG5cbmV4cG9ydCBmdW5jdGlvbiBhamF4KGNvbmZpZyl7XG4gIGxldFxuICAgIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcbiAgICBtZXRob2QgPSB0eXBlb2YgY29uZmlnLm1ldGhvZCA9PT0gJ3VuZGVmaW5lZCcgPyAnR0VUJyA6IGNvbmZpZy5tZXRob2QsXG4gICAgZmlsZVNpemU7XG5cbiAgZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIHJlamVjdCA9IHJlamVjdCB8fCBmdW5jdGlvbigpe307XG4gICAgcmVzb2x2ZSA9IHJlc29sdmUgfHwgZnVuY3Rpb24oKXt9O1xuXG4gICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgaWYocmVxdWVzdC5zdGF0dXMgIT09IDIwMCl7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LnN0YXR1cyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgZmlsZVNpemUgPSByZXF1ZXN0LnJlc3BvbnNlLmxlbmd0aDtcbiAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpLCBmaWxlU2l6ZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKXtcbiAgICAgIGNvbmZpZy5vbkVycm9yKGUpO1xuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBjb25maWcudXJsLCB0cnVlKTtcblxuICAgIGlmKGNvbmZpZy5vdmVycmlkZU1pbWVUeXBlKXtcbiAgICAgIHJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZShjb25maWcub3ZlcnJpZGVNaW1lVHlwZSk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSl7XG4gICAgICBpZihjb25maWcucmVzcG9uc2VUeXBlID09PSAnanNvbicpe1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICAgIH1lbHNle1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYobWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5kYXRhKXtcbiAgICAgIHJlcXVlc3Quc2VuZChjb25maWcuZGF0YSk7XG4gICAgfWVsc2V7XG4gICAgICByZXF1ZXN0LnNlbmQoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xufVxuKi8iXX0=
