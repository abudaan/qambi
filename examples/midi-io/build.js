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

      (0, _isomorphicFetch2.default)('../data/mozk545a.mid')
      //fetch('../data/minute_waltz.mid')
      .then(function (response) {
        return response.arrayBuffer();
      }).then(function (data) {
        song = _qambi.Song.fromMIDIFile(data);
        initUI();
      });
    } else if (test === 2) {

      _qambi.Song.fromMIDIFileAsync('../../data/minute_waltz.mid').then(function (s) {
        song = s;
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
    var btnInstrument = document.getElementById('instrument');
    var btnMetronome = document.getElementById('metronome');
    var divTempo = document.getElementById('tempo');
    var divPosition = document.getElementById('position');
    var divPositionTime = document.getElementById('position_time');
    var rangePosition = document.getElementById('playhead');
    var rangeLatency = document.getElementById('latency');
    var selectMIDIIn = document.getElementById('midiin');
    var selectMIDIOut = document.getElementById('midiout');
    var userInteraction = false;

    btnPlay.disabled = false;
    btnPause.disabled = false;
    btnStop.disabled = false;
    btnInstrument.disabled = false;
    btnMetronome.disabled = false;

    var MIDIInputs = (0, _qambi.getMIDIInputs)();
    var html = '<option id="-1">select MIDI in</option>';
    MIDIInputs.forEach(function (port) {
      html += '<option id="' + port.id + '">' + port.name + '</option>';
    });
    selectMIDIIn.innerHTML = html;

    selectMIDIIn.addEventListener('change', function (e) {
      var portId = selectMIDIIn.options[selectMIDIIn.selectedIndex].id;
      // song.getTracks().forEach(track => {
      //   track.disconnectMIDIInputs() // no arguments means disconnect from all inputs
      //   track.connectMIDIInputs(portId)
      // })
      var track = song.getTracks()[0];
      track.disconnectMIDIInputs(); // no arguments means disconnect from all inputs
      track.connectMIDIInputs(portId);
    });

    var MIDIOutputs = (0, _qambi.getMIDIOutputs)();
    html = '<option id="-1">select MIDI out</option>';
    MIDIOutputs.forEach(function (port) {
      html += '<option id="' + port.id + '">' + port.name + '</option>';
    });
    selectMIDIOut.innerHTML = html;

    selectMIDIOut.addEventListener('change', function (e) {
      var portId = selectMIDIOut.options[selectMIDIOut.selectedIndex].id;
      song.getTracks().forEach(function (track) {
        track.disconnectMIDIOutputs(); // no arguments means disconnect from all outputs
        track.connectMIDIOutputs(portId);
      });
      /*
            let track = song.getTracks()[0]
            track.disconnectMIDIOutputs(track.getMIDIOutputs()[0])
            //track.disconnectMIDIOutputs() // no arguments means disconnect from all inputs
            track.connectMIDIOutputs(portId)
      */
    });

    rangeLatency.addEventListener('change', function (e) {
      song.getTracks().forEach(function (track) {
        track.latency = e.target.valueAsNumber;
      });
    });

    btnMetronome.addEventListener('click', function () {
      song.setMetronome(); // if no arguments are provided it simply toggles
      btnMetronome.innerHTML = song.useMetronome ? 'metronome on' : 'metronome off';
    });

    btnPlay.addEventListener('click', function () {
      song.play();
    });

    btnPause.addEventListener('click', function () {
      song.pause();
    });

    btnStop.addEventListener('click', function () {
      song.stop();
    });

    btnInstrument.addEventListener('click', function () {
      song.getTracks().forEach(function (track) {
        if (track.getInstrument() === null) {
          btnInstrument.innerHTML = 'remove instrument';
          track.setInstrument(new _qambi.Instrument()); // by passing a new Instrument, the simple sinewave synth is used for instrument
        } else {
            btnInstrument.innerHTML = 'set instrument';
            track.setInstrument(); // by not providing an instrument you remove the instrument from this track
          }
      });
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

},{"../../src/qambi":24,"isomorphic-fetch":2}],2:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2,"whatwg-fetch":5}],5:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./init_audio":10,"./init_midi":11}],10:[function(require,module,exports){
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

},{"./parse_audio":19,"./samples":26}],11:[function(require,module,exports){
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

},{"./util":32}],12:[function(require,module,exports){
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

          console.log(result);
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

},{"./eventlistener":7,"./init_audio":10,"./note":18,"./parse_audio":19,"./sample":25,"./util":32}],13:[function(require,module,exports){
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

},{"./init_audio":10,"./instrument":12,"./midi_event":14,"./parse_events":20,"./part":21,"./position":23,"./track":31,"./util":32}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{"./midi_event":14}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"./midi_stream":16}],18:[function(require,module,exports){
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

},{"./util":32}],19:[function(require,module,exports){
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

},{"./init_audio":10,"./util":32,"isomorphic-fetch":4}],20:[function(require,module,exports){
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

},{"./midi_note":15,"./util":32}],21:[function(require,module,exports){
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

},{"./util":32}],22:[function(require,module,exports){
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

},{"./eventlistener.js":7,"./position.js":23,"./util.js":32}],23:[function(require,module,exports){
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

},{"./util":32}],24:[function(require,module,exports){
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

},{"./constants":6,"./init":9,"./init_audio":10,"./init_midi":11,"./instrument":12,"./midi_event":14,"./midi_note":15,"./midifile":17,"./parse_audio":19,"./part":21,"./settings":28,"./song":29,"./track":31}],25:[function(require,module,exports){
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

},{"./init_audio.js":10,"./util.js":32}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var samples = {
  emptyOgg: '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Y5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=',
  emptyMp3: '//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
  hightick: 'UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAACx/xf/dADOACwBsP3p+6H+zAGoBOkCCwBX/EH5OvxlA4kJ2wcSArT9E/ut+HT2evUx98n6OAF5CCUMwQvfCOsJxAx0DSIMEAq9BiAB3vhz7mLkT9sR133YxN2s5QLv0vrUBnwRnxuQJeEsSDCiMd8yFS8aKFIhohUsCKj64u625OraA9HuyPnElcP+wxvJWtW25637VQ0jHPgnBTDDM1o0CzKLK+8hzhgFDOz8Se4J47DYVtG0z5fQq9LB12rfA+j99roHAhelIyMwIjdTOuU8mjwIOGoxhCb5E53/j+3k3/fTY8pTw4y/Tr+ew8DMvdsk8RcHRRkSKO4yGTkHPkU/rzzyNcgsrR94Dp/5r+Zs17zOncoDxhfE38WLyn/TeOMi9r0IRxlRKIQzyTlOPKo9yjmWMcokDRLc/Y7rudtdzu/D2L1Iu+27JcG3yYrVLujl+3UOZx1UK5Q0qzmNPDk8ZjeeMPojzhH+/jLtPd5m0hHLHsYIw5TEMMnA0jvj8fSOBiwXASZgMzM8dUBGQbI+rzjpKkIZygZT9QflcdaRyqXCz7+VwUPH784r3K7s+v0KDu8bvyeLMb43NjrhOIo0dSvQHi0PnP6i7ovg3NTxy4/Gf8X8yH/QBtvX55P2Ygb0FcUjsy4LNmI5ejiXM38r7iC8FJwHPvok7dDgQdaJzlTKIsoFzsrVkuA87d/6qAi7FQ0h9ClKMLEz3TOrMBcqYSD8E9AFd/dS6kTf6dbU0XnQv9IH2MXfZ+ln9DEAFwwdFy8giib6KawqeChgI/UbHBOTCZj/vvXe7InlFuDN3P3b0d1F4gzpifG2+u4D7Qw1FfwbnCD+IlgjWyHLHPMVog2mBL37qvP+7NvnYuTv4rvjfubN6k3wpPZ0/WkEOwtiEUsWcxm+Gl4aOhhiFDAPIwmbAtn7TPVy77zqcefr5YHmHull7enyfPmcAHgHew1REr8Vhhd/F+AV1RJ0DikJWQNc/ZP3efKd7hvs2ur46rHs5u8e9N/48/0hA/8HFgwuD04RSBIREqsQOg7mCssGMAJW/Xn4G/TK8Lbuzu0I7qTvnPJy9sX6bP84BLYIbAwdD84QYxG7EOcODAxwCFMEAQC9+7P3SvTX8XHw+u9R8KTxIvSo9+X7VQCUBJ0IMwziDj4QLhAGD9UMrgnTBZcBRv1v+Xv2UfS+8tfx+vES87z0+vb3+Zf9ZgEQBSEIUArWC8kM2QyzC5EJEAdvBHgBXP5n++r4Avd89Wj07fMw9D31Jvfp+Uj9xQD9A8QG5QhXClELrAsvC9wJ7gd6BWIC3v6O+7T4PPZN9EHzWvNf9Pz1Fvit+qL9rQCHAwEG/weCCZUKFwvDCnIJcAcQBWcCaf8Z/CD55vaB9dD0wPSP9UL3m/k7/Mz+JwEyAw8FzAY7CBsJaQk5CWkI2gatBCICYf+j/Fr6vfiV9872sfZP91z4p/lR+3H9zf89AroEFAfjCP0Jcwo8CjAJdQdgBSEDkgDQ/Vj7ZfnR95T28fUd9v32Vvg2+nb8+/6xAWoE4AbDCP4JpAqbCqQJ0weEBfgCTACT/R37M/m+9672IPY69gb3afhW+tT8qf+MAj0FggcuCScKXAriCcMIEAfyBJYCFwCP/Rz7A/l793z2F/Zn9mH37fjd+i39yf9pAt0EFAfRCNkJGAqrCZYIvgZPBJ8B6P4//M350vdz9q/1lfUq9mz3RPmi+3H+bgFVBOQG3wgHCkwK0Am7CCAHCgWmAjAA',
  lowtick: 'UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAAB0/5v+U/4T/3gA0wFTAuUB+f8d/nT90f1q/ub+tf46/mb/8wFQA9gC7wCd/mr+FAGRA3cE6wJf/h36evmv+8v/NwRHBZUC2/60+//5EvuZ/aX/bgFOAp8Azvzh9wfzLPF68zT4y/2BAygIfQwaEjYY0x31Irwl8SOWHVESOgPh9NfpReFt22nYHddD2BXcZeDa5InqgPDx9nP+6gS4CBYLnw0zES0WXxv4HkcgLh/1G+EX1RNpD4wKigXH/6r5/fNu7lTpj+Zu5hHoXOtL71byr/Qp91L64v6OBO4JoQ5zEskU+hU1FiQVeRP7EWgP4Qr0BIT+tPid9C3y1vCh8FDxJvK28vvyy/LA8pLzU/XP95v6xvw4/uD/RAK2BSkKcg6BEScTZBMeEqkPTQxjCKEEVwFi/nv7h/hp9aDyAvHP8MfxLvM+9PX0uPW19g/4Lfr7/C4AKgNaBXQGywb0BhIHWQfWB1oIzAjtCF8IHwdtBakDVwKLAeYA8v9w/kj81/nQ94v29/XX9bz1bPUY9Uz1Z/aH+Hr7yP4MAi4F+wcfCnYLNgyfDPsMSw0sDUAMfgrcB5IEMwFb/iX8T/pT+O/1X/Mf8cbvrO+18MLyvfVP+Rf9wgAoBCEHpwnIC5EN4Q5AD3wO1Ay0CpsIvwbvBNcCbQAr/nX8Ofsf+vb4mvda9rj1z/WX9pL3a/hH+ZX6R/wn/vP/eQESA/AE+wYDCcwKFAyPDCkMFQuSCe4HVQbSBHQDCwI8ANL9JPuY+HX28vTq82PzdPMV9Az1MfZ49zD5gftx/sQBBQXLB8cJ/gqpCw8MigwWDXENXQ2rDDUL7QgDBswCdv8S/K74WPVk8hXwou4P7mvu1+9T8pz1Uvli/ZoBwgWRCcsMPg/CEEQR4RDADwoO9wusCVMH4ARSApn/ufzd+Wj3bvX78xzzx/L68qzz1vSD9qX4Gfvd/c0AhwO/BWwHmghvCQEKVQonClsJCwiIBh0F0gOgAm0BOwAx/03+XP0g/Lb6cPmX+F/4vfh++TH6s/os+7/7cvwL/Zz9XP5O/3IA3AF9AzsF9gaUCAAKHgueCzcL9wntB3sF4wIzAI396fp1+Gv2IvWn9N30p/Xi9m74G/ru+9P9k/8aAYEC1AMTBSIG0wYuB1gHkgcACGEISAhTBzEFWAKt/5L92fuU+vX50fmf+SP5i/gb+Bf4mviv+Sr7kvyb/Uj+r/4X/8r/+gCiAo0EUAaRBzwISwjqB3IHGQfCBv8FpgTMApQAKf67+5n5/vfn9jz2yPVn9SL1RPXq9SP3Dvmr+6f+sQGKBAcH+whOCh0Laws3C28KLAmDB5AFfQNoAVP/Zv3e+7P6sfnL+Cv4vPeM95b37feV+Jn51Poq/LL9mv+YAVYD3gQuBmcHSAikCIEI7Af+BuEFngQXA1sBv/9v/pf9MP3W/Fj8q/sR+6H6U/o3+mP6y/pN+/f7xvye/WH+Jf9mAD4CQAQJBisHtgf6Bw0I8QdsB1sGywT4AggBCP/o/KX6mPg19572jfaz9uf2S/cM+E35E/tW/af/5wH1A8AFKgfkB/AHgwfxBlAGgQVIBMMCJwGs/43+vP0i/Zr8Lfzl+9H76fvi+9f75fsf/In8BP10/ej9cf4O/7f/dAAcAaUBEgKMAhgDpAMEBCEEDwTfA3IDxQL8ASoBUwCG/87+J/6h/Rr9pPxk/Gb8oPwJ/XH9w/39/UD+qP41/9D/WwDeAGsBAgKdAhEDQQNAA0sDbwOVA5YDVwPOAhgCVAGRAA=='
};

exports.default = samples;

},{}],27:[function(require,module,exports){
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

},{"./init_audio":10,"./init_midi":11,"./midi_event":14,"./settings":28}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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

},{"./constants":6,"./eventlistener":7,"./init_audio":10,"./metronome":13,"./midi_event":14,"./parse_events":20,"./playhead":22,"./position":23,"./scheduler":27,"./settings":28,"./song_from_midifile":30,"./util":32}],30:[function(require,module,exports){
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

},{"./fetch_helpers":8,"./midi_event":14,"./midifile":17,"./part":21,"./song":29,"./track":31,"./util":32,"isomorphic-fetch":4}],31:[function(require,module,exports){
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

},{"./init_audio":10,"./init_midi":11,"./instrument":12,"./midi_event":14,"./midi_note":15,"./part":21,"./qambi":24,"./util":32}],32:[function(require,module,exports){
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

},{"isomorphic-fetch":4}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pc29tb3JwaGljLWZldGNoL2ZldGNoLW5wbS1icm93c2VyaWZ5LmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvZXZlbnRsaXN0ZW5lci5qcyIsIi4uL3NyYy9mZXRjaF9oZWxwZXJzLmpzIiwiLi4vc3JjL2luaXQuanMiLCIuLi9zcmMvaW5pdF9hdWRpby5qcyIsIi4uL3NyYy9pbml0X21pZGkuanMiLCIuLi9zcmMvaW5zdHJ1bWVudC5qcyIsIi4uL3NyYy9tZXRyb25vbWUuanMiLCIuLi9zcmMvbWlkaV9ldmVudC5qcyIsIi4uL3NyYy9taWRpX25vdGUuanMiLCIuLi9zcmMvbWlkaV9zdHJlYW0uanMiLCIuLi9zcmMvbWlkaWZpbGUuanMiLCIuLi9zcmMvbm90ZS5qcyIsIi4uL3NyYy9wYXJzZV9hdWRpby5qcyIsIi4uL3NyYy9wYXJzZV9ldmVudHMuanMiLCIuLi9zcmMvcGFydC5qcyIsIi4uL3NyYy9wbGF5aGVhZC5qcyIsIi4uL3NyYy9wb3NpdGlvbi5qcyIsIi4uL3NyYy9xYW1iaS5qcyIsIi4uL3NyYy9zYW1wbGUuanMiLCIuLi9zcmMvc2FtcGxlcy5qcyIsIi4uL3NyYy9zY2hlZHVsZXIuanMiLCIuLi9zcmMvc2V0dGluZ3MuanMiLCIuLi9zcmMvc29uZy5qcyIsIi4uL3NyYy9zb25nX2Zyb21fbWlkaWZpbGUuanMiLCIuLi9zcmMvdHJhY2suanMiLCIuLi9zcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFRQTs7Ozs7O0FBRUEsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVTs7QUFFdEQsTUFBSSxhQUFKOztBQUVBLGtCQUFNLElBQU4sR0FDQyxJQURELENBQ00sWUFBTTs7QUFFVixRQUFJ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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDL2FBLElBQU0saUJBQWlCLEVBQXZCOztBQUVBLE9BQU8sY0FBUCxDQUFzQixjQUF0QixFQUFzQyxVQUF0QyxFQUFrRCxFQUFDLE9BQU8sSUFBUixFQUFsRCxFO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLFNBQXRDLEVBQWlELEVBQUMsT0FBTyxJQUFSLEVBQWpELEU7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsY0FBdEIsRUFBc0MsZUFBdEMsRUFBdUQsRUFBQyxPQUFPLElBQVIsRUFBdkQsRTtBQUNBLE9BQU8sY0FBUCxDQUFzQixjQUF0QixFQUFzQyxnQkFBdEMsRUFBd0QsRUFBQyxPQUFPLElBQVIsRUFBeEQsRTtBQUNBLE9BQU8sY0FBUCxDQUFzQixjQUF0QixFQUFzQyxnQkFBdEMsRUFBd0QsRUFBQyxPQUFPLElBQVIsRUFBeEQsRTtBQUNBLE9BQU8sY0FBUCxDQUFzQixjQUF0QixFQUFzQyxrQkFBdEMsRUFBMEQsRUFBQyxPQUFPLElBQVIsRUFBMUQsRTtBQUNBLE9BQU8sY0FBUCxDQUFzQixjQUF0QixFQUFzQyxZQUF0QyxFQUFvRCxFQUFDLE9BQU8sSUFBUixFQUFwRCxFO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLGtCQUF0QyxFQUEwRCxFQUFDLE9BQU8sSUFBUixFQUExRCxFO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLGVBQXRDLEVBQXVELEVBQUMsT0FBTyxHQUFSLEVBQXZEO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLGVBQXRDLEVBQXVELEVBQUMsT0FBTyxHQUFSLEVBQXZEO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLGFBQXRDLEVBQXFELEVBQUMsT0FBTyxHQUFSLEVBQXJEO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLGNBQXRDLEVBQXNELEVBQUMsT0FBTyxHQUFSLEVBQXREO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLEtBQXRDLEVBQTZDLEVBQUMsT0FBTyxHQUFSLEVBQTdDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLGNBQXRDLEVBQXNELEVBQUMsT0FBTyxHQUFSLEVBQXREO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLE9BQXRDLEVBQStDLEVBQUMsT0FBTyxHQUFSLEVBQS9DO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLFVBQXRDLEVBQWtELEVBQUMsT0FBTyxHQUFSLEVBQWxEO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLE1BQXRDLEVBQThDLEVBQUMsT0FBTyxHQUFSLEVBQTlDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLGdCQUF0QyxFQUF3RCxFQUFDLE9BQU8sR0FBUixFQUF4RDtBQUNBLE9BQU8sY0FBUCxDQUFzQixjQUF0QixFQUFzQyxjQUF0QyxFQUFzRCxFQUFDLE9BQU8sR0FBUixFQUF0RDs7QUFHQSxPQUFPLGNBQVAsQ0FBc0IsY0FBdEIsRUFBc0MsT0FBdEMsRUFBK0MsRUFBQyxPQUFPLElBQVIsRUFBL0M7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsY0FBdEIsRUFBc0MsZ0JBQXRDLEVBQXdELEVBQUMsT0FBTyxJQUFSLEVBQXhEO0FBQ0EsT0FBTyxjQUFQLENBQXNCLGNBQXRCLEVBQXNDLGNBQXRDLEVBQXNELEVBQUMsT0FBTyxJQUFSLEVBQXREOztRQUVRLGMsR0FBQSxjOzs7Ozs7Ozs7OztRQzFCUSxhLEdBQUEsYTtRQStCQSxnQixHQUFBLGdCO1FBa0JBLG1CLEdBQUEsbUI7QUFwRGhCLElBQUksaUJBQWlCLElBQUksR0FBSixFQUFyQjs7QUFHTyxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBNkI7O0FBRWxDLE1BQUksWUFBSjs7QUFFQSxNQUFHLE1BQU0sSUFBTixLQUFlLE9BQWxCLEVBQTBCO0FBQ3hCLFFBQUksWUFBWSxNQUFNLElBQXRCO0FBQ0EsUUFBSSxnQkFBZ0IsVUFBVSxJQUE5Qjs7QUFFQSxRQUFHLGVBQWUsR0FBZixDQUFtQixhQUFuQixDQUFILEVBQXFDO0FBQ25DLFlBQU0sZUFBZSxHQUFmLENBQW1CLGFBQW5CLENBQU47QUFEbUM7QUFBQTtBQUFBOztBQUFBO0FBRW5DLDZCQUFjLElBQUksTUFBSixFQUFkLDhIQUEyQjtBQUFBLGNBQW5CLEVBQW1COztBQUN6QixhQUFHLFNBQUg7QUFDRDtBQUprQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBS3BDO0FBQ0Y7O0FBR0QsTUFBRyxlQUFlLEdBQWYsQ0FBbUIsTUFBTSxJQUF6QixNQUFtQyxLQUF0QyxFQUE0QztBQUMxQztBQUNEOztBQUVELFFBQU0sZUFBZSxHQUFmLENBQW1CLE1BQU0sSUFBekIsQ0FBTjtBQXJCa0M7QUFBQTtBQUFBOztBQUFBO0FBc0JsQywwQkFBYyxJQUFJLE1BQUosRUFBZCxtSUFBMkI7QUFBQSxVQUFuQixHQUFtQjs7QUFDekIsVUFBRyxLQUFIO0FBQ0Q7OztBQXhCaUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQTRCbkM7O0FBR00sU0FBUyxnQkFBVCxDQUEwQixJQUExQixFQUF3QyxRQUF4QyxFQUFpRDs7QUFFdEQsTUFBSSxZQUFKO0FBQ0EsTUFBSSxLQUFRLElBQVIsU0FBZ0IsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUFwQjs7QUFFQSxNQUFHLGVBQWUsR0FBZixDQUFtQixJQUFuQixNQUE2QixLQUFoQyxFQUFzQztBQUNwQyxVQUFNLElBQUksR0FBSixFQUFOO0FBQ0EsbUJBQWUsR0FBZixDQUFtQixJQUFuQixFQUF5QixHQUF6QjtBQUNELEdBSEQsTUFHSztBQUNILFVBQU0sZUFBZSxHQUFmLENBQW1CLElBQW5CLENBQU47QUFDRDs7QUFFRCxNQUFJLEdBQUosQ0FBUSxFQUFSLEVBQVksUUFBWjs7QUFFQSxTQUFPLEVBQVA7QUFDRDs7QUFHTSxTQUFTLG1CQUFULENBQTZCLElBQTdCLEVBQW1DLEVBQW5DLEVBQXNDOztBQUUzQyxNQUFHLGVBQWUsR0FBZixDQUFtQixJQUFuQixNQUE2QixLQUFoQyxFQUFzQztBQUNwQyxZQUFRLEdBQVIsQ0FBWSw4QkFBOEIsSUFBMUM7QUFDQTtBQUNEOztBQUVELE1BQUksTUFBTSxlQUFlLEdBQWYsQ0FBbUIsSUFBbkIsQ0FBVjs7QUFFQSxNQUFHLE9BQU8sRUFBUCxLQUFjLFVBQWpCLEVBQTRCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQzFCLDRCQUF3QixJQUFJLE9BQUosRUFBeEIsbUlBQXVDO0FBQUE7O0FBQUEsWUFBOUIsR0FBOEI7QUFBQSxZQUF6QixLQUF5Qjs7QUFDckMsZ0JBQVEsR0FBUixDQUFZLEdBQVosRUFBaUIsS0FBakI7QUFDQSxZQUFHLFVBQVUsRUFBYixFQUFnQjtBQUNkLGtCQUFRLEdBQVIsQ0FBWSxHQUFaO0FBQ0EsZUFBSyxHQUFMO0FBQ0E7QUFDRDtBQUNGO0FBUnlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBUzFCLFFBQUcsT0FBTyxFQUFQLEtBQWMsUUFBakIsRUFBMEI7QUFDeEIsVUFBSSxNQUFKLENBQVcsRUFBWDtBQUNEO0FBQ0YsR0FaRCxNQVlNLElBQUcsT0FBTyxFQUFQLEtBQWMsUUFBakIsRUFBMEI7QUFDOUIsUUFBSSxNQUFKLENBQVcsRUFBWDtBQUNELEdBRkssTUFFRDtBQUNILFlBQVEsR0FBUixDQUFZLGdDQUFaO0FBQ0Q7QUFDRjs7Ozs7Ozs7UUM1RWUsTSxHQUFBLE07UUFRQSxJLEdBQUEsSTtRQUlBLFcsR0FBQSxXOzs7QUFaVCxTQUFTLE1BQVQsQ0FBZ0IsUUFBaEIsRUFBMEI7QUFDL0IsTUFBRyxTQUFTLE1BQVQsSUFBbUIsR0FBbkIsSUFBMEIsU0FBUyxNQUFULEdBQWtCLEdBQS9DLEVBQW1EO0FBQ2pELFdBQU8sUUFBUSxPQUFSLENBQWdCLFFBQWhCLENBQVA7QUFDRDtBQUNELFNBQU8sUUFBUSxNQUFSLENBQWUsSUFBSSxLQUFKLENBQVUsU0FBUyxVQUFuQixDQUFmLENBQVA7QUFFRDs7QUFFTSxTQUFTLElBQVQsQ0FBYyxRQUFkLEVBQXVCO0FBQzVCLFNBQU8sU0FBUyxJQUFULEVBQVA7QUFDRDs7QUFFTSxTQUFTLFdBQVQsQ0FBcUIsUUFBckIsRUFBOEI7QUFDbkMsU0FBTyxTQUFTLFdBQVQsRUFBUDtBQUNEOzs7Ozs7Ozs7UUNrQmUsSSxHQUFBLEk7O0FBbENoQjs7QUFDQTs7QUFFTyxJQUFJLHNDQUFnQixZQUFNO0FBQy9CLE1BQUcsT0FBTyxTQUFQLEtBQXFCLFdBQXhCLEVBQW9DO0FBQ2xDLFdBQU8sVUFBVSxZQUFWLElBQTBCLFVBQVUsa0JBQXBDLElBQTBELFVBQVUsZUFBcEUsSUFBdUYsVUFBVSxjQUF4RztBQUNEO0FBQ0QsU0FBTyxZQUFVO0FBQ2YsWUFBUSxJQUFSLENBQWEsK0JBQWI7QUFDRCxHQUZEO0FBR0QsQ0FQeUIsRUFBbkI7O0FBVUEsSUFBSSx3REFBeUIsWUFBTTtBQUN4QyxNQUFHLE9BQU8sU0FBUCxLQUFxQixXQUF4QixFQUFvQztBQUNsQyxXQUFPLE9BQU8scUJBQVAsSUFBZ0MsT0FBTywyQkFBOUM7QUFDRDtBQUNELFNBQU8sWUFBVTtBQUNmLFlBQVEsSUFBUixDQUFhLHdDQUFiO0FBQ0QsR0FGRDtBQUdELENBUGtDLEVBQTVCOztBQVVBLElBQUksc0JBQVEsWUFBTTtBQUN2QixNQUFHLE9BQU8sU0FBUCxLQUFxQixXQUF4QixFQUFvQztBQUNsQyxXQUFPLE9BQU8sSUFBUCxJQUFlLE9BQU8sVUFBN0I7QUFDRDtBQUNELFNBQU8sWUFBVTtBQUNmLFlBQVEsSUFBUixDQUFhLHVCQUFiO0FBQ0QsR0FGRDtBQUdELENBUGlCLEVBQVg7OztBQVdBLFNBQVMsSUFBVCxDQUFjLFFBQWQsRUFBNkI7Ozs7Ozs7Ozs7Ozs7OztBQWtCbEMsU0FBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCOztBQUV0QyxZQUFRLEdBQVIsQ0FBWSxDQUFDLDRCQUFELEVBQWMsMEJBQWQsQ0FBWixFQUNDLElBREQsQ0FFQSxVQUFDLElBQUQsRUFBVTs7QUFFUixVQUFJLFlBQVksS0FBSyxDQUFMLENBQWhCOzs7QUFHQSxVQUFJLFdBQVcsS0FBSyxDQUFMLENBQWY7O0FBRUEsY0FBUTtBQUNOLGdCQUFRLFVBQVUsTUFEWjtBQUVOLGFBQUssVUFBVSxHQUZUO0FBR04sYUFBSyxVQUFVLEdBSFQ7QUFJTixjQUFNLFNBQVMsSUFKVDtBQUtOLGlCQUFTLFNBQVM7QUFMWixPQUFSO0FBT0QsS0FoQkQsRUFpQkEsVUFBQyxLQUFELEVBQVc7QUFDVCxhQUFPLEtBQVA7QUFDRCxLQW5CRDtBQW9CRCxHQXRCTSxDQUFQOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQ0Q7Ozs7Ozs7Ozs7Ozs7O1FDOURlLFMsR0FBQSxTO1FBcUlBLFcsR0FBQSxXOztBQXRLaEI7Ozs7QUFDQTs7OztBQUVBLElBQ0UsbUJBREY7SUFFRSxtQkFGRjtJQUdFLGNBQWMsS0FIaEI7SUFJRSxhQUpGOztBQU1PLElBQUksNEJBQVcsWUFBVTtBQUM5QixVQUFRLEdBQVIsQ0FBWSxtQkFBWjtBQUNBLE1BQUksWUFBSjtBQUNBLE1BQUcsUUFBTyxNQUFQLHlDQUFPLE1BQVAsT0FBa0IsUUFBckIsRUFBOEI7QUFDNUIsUUFBSSxlQUFlLE9BQU8sWUFBUCxJQUF1QixPQUFPLGtCQUFqRDtBQUNBLFFBQUcsaUJBQWlCLFdBQXBCLEVBQWdDO0FBQzlCLFlBQU0sSUFBSSxZQUFKLEVBQU47QUFDRDtBQUNGO0FBQ0QsTUFBRyxPQUFPLEdBQVAsS0FBZSxXQUFsQixFQUE4Qjs7QUFFNUIsWUFYTyxPQVdQLGFBQVU7QUFDUixrQkFBWSxzQkFBVTtBQUNwQixlQUFPO0FBQ0wsZ0JBQU07QUFERCxTQUFQO0FBR0QsT0FMTztBQU1SLHdCQUFrQiw0QkFBVSxDQUFFO0FBTnRCLEtBQVY7QUFRRDtBQUNELFNBQU8sR0FBUDtBQUNELENBckJxQixFQUFmOztBQXdCQSxTQUFTLFNBQVQsR0FBb0I7O0FBRXpCLE1BQUcsT0FBTyxRQUFRLGNBQWYsS0FBa0MsV0FBckMsRUFBaUQ7QUFDL0MsWUFBUSxjQUFSLEdBQXlCLFFBQVEsVUFBakM7QUFDRDs7QUFFRCxTQUFPLEVBQVA7QUFDQSxNQUFJLFNBQVMsUUFBUSxrQkFBUixFQUFiO0FBQ0EsT0FBSyxNQUFMLEdBQWMsS0FBZDtBQUNBLE1BQUcsT0FBTyxPQUFPLEtBQWQsS0FBd0IsV0FBM0IsRUFBdUM7QUFDckMsU0FBSyxNQUFMLEdBQWMsSUFBZDtBQUNEOzs7QUFHRCxVQTJIZ0MsZ0JBM0hoQyxnQkFBYSxRQUFRLHdCQUFSLEVBQWI7QUFDQSxhQUFXLE9BQVgsQ0FBbUIsUUFBUSxXQUEzQjtBQUNBLFVBeUhNLFVBekhOLGdCQUFhLFFBQVEsY0FBUixFQUFiO0FBQ0EsYUFBVyxPQUFYLENBQW1CLFFBQVEsV0FBM0I7QUFDQSxhQUFXLElBQVgsQ0FBZ0IsS0FBaEIsR0FBd0IsR0FBeEI7QUFDQSxnQkFBYyxJQUFkOztBQUVBLFNBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjs7QUFFdEMsc0RBQXNCLElBQXRCLENBQ0UsU0FBUyxXQUFULENBQXFCLE9BQXJCLEVBQTZCOztBQUUzQixXQUFLLEdBQUwsR0FBVyxPQUFPLFFBQVEsUUFBZixLQUE0QixXQUF2QztBQUNBLFdBQUssR0FBTCxHQUFXLE9BQU8sUUFBUSxRQUFmLEtBQTRCLFdBQXZDO0FBQ0EsV0FBSyxPQUFMLEdBQWUsUUFBUSxPQUF2QjtBQUNBLFdBQUssUUFBTCxHQUFnQixRQUFRLFFBQXhCO0FBQ0EsVUFBRyxLQUFLLEdBQUwsS0FBYSxLQUFiLElBQXNCLEtBQUssR0FBTCxLQUFhLEtBQXRDLEVBQTRDO0FBQzFDLGVBQU8sNkJBQVA7QUFDRCxPQUZELE1BRUs7QUFDSCxnQkFBUSxJQUFSO0FBQ0Q7QUFDRixLQVpILEVBYUUsU0FBUyxVQUFULEdBQXFCO0FBQ25CLGFBQU8sK0NBQVA7QUFDRCxLQWZIO0FBaUJELEdBbkJNLENBQVA7QUFvQkQ7O0FBR0QsSUFBSSxtQkFBa0IsMkJBQW1DO0FBQUEsTUFBMUIsS0FBMEIseURBQVYsR0FBVTs7QUFDdkQsTUFBRyxnQkFBZ0IsS0FBbkIsRUFBeUI7QUFDdkIsWUFBUSxJQUFSLENBQWEsZ0NBQWI7QUFDRCxHQUZELE1BRU07QUFDSixZQXlGZ0QsZUF6RmhELHNCQUFrQiwyQkFBNkI7QUFBQSxVQUFwQixLQUFvQix5REFBSixHQUFJOztBQUM3QyxVQUFHLFFBQVEsQ0FBWCxFQUFhO0FBQ1gsZ0JBQVEsSUFBUixDQUFhLDZDQUFiO0FBQ0Q7QUFDRCxjQUFRLFFBQVEsQ0FBUixHQUFZLENBQVosR0FBZ0IsUUFBUSxDQUFSLEdBQVksQ0FBWixHQUFnQixLQUF4QztBQUNBLGlCQUFXLElBQVgsQ0FBZ0IsS0FBaEIsR0FBd0IsS0FBeEI7QUFDRCxLQU5EO0FBT0EscUJBQWdCLEtBQWhCO0FBQ0Q7QUFDRixDQWJEOztBQWdCQSxJQUFJLG1CQUFrQiwyQkFBZ0I7QUFDcEMsTUFBRyxnQkFBZ0IsS0FBbkIsRUFBeUI7QUFDdkIsWUFBUSxJQUFSLENBQWEsZ0NBQWI7QUFDRCxHQUZELE1BRU07QUFDSixZQXlFaUUsZUF6RWpFLHNCQUFrQiwyQkFBVTtBQUMxQixhQUFPLFdBQVcsSUFBWCxDQUFnQixLQUF2QjtBQUNELEtBRkQ7QUFHQSxXQUFPLGtCQUFQO0FBQ0Q7QUFDRixDQVREOztBQVlBLElBQUksMkJBQTBCLG1DQUFnQjtBQUM1QyxNQUFHLGdCQUFnQixLQUFuQixFQUF5QjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYjtBQUNELEdBRkQsTUFFTTtBQUNKLFlBNkRrRix1QkE3RGxGLDhCQUEwQixtQ0FBVTtBQUNsQyxhQUFPLFdBQVcsU0FBWCxDQUFxQixLQUE1QjtBQUNELEtBRkQ7QUFHQSxXQUFPLDBCQUFQO0FBQ0Q7QUFDRixDQVREOztBQVlBLElBQUksMEJBQXlCLGtDQUFnQjtBQUMzQyxNQUFHLGdCQUFnQixLQUFuQixFQUF5QjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYjtBQUNELEdBRkQsTUFFTTtBQUNKLFlBaUQyRyxzQkFqRDNHLDZCQUF5QixnQ0FBUyxJQUFULEVBQXVCO0FBQzlDLFVBQUcsSUFBSCxFQUFRO0FBQ04sbUJBQVcsVUFBWCxDQUFzQixDQUF0QjtBQUNBLG1CQUFXLE9BQVgsQ0FBbUIsVUFBbkI7QUFDQSxtQkFBVyxVQUFYLENBQXNCLENBQXRCO0FBQ0EsbUJBQVcsT0FBWCxDQUFtQixRQUFRLFdBQTNCO0FBQ0QsT0FMRCxNQUtLO0FBQ0gsbUJBQVcsVUFBWCxDQUFzQixDQUF0QjtBQUNBLG1CQUFXLFVBQVgsQ0FBc0IsQ0FBdEI7QUFDQSxtQkFBVyxPQUFYLENBQW1CLFFBQVEsV0FBM0I7QUFDRDtBQUNGLEtBWEQ7QUFZQTtBQUNEO0FBQ0YsQ0FsQkQ7O0FBcUJBLElBQUksNkJBQTRCLG1DQUFTLEdBQVQsRUFBbUI7Ozs7Ozs7Ozs7QUFXakQsTUFBRyxnQkFBZ0IsS0FBbkIsRUFBeUI7QUFDdkIsWUFBUSxJQUFSLENBQWEsZ0NBQWI7QUFDRCxHQUZELE1BRU07QUFDSixZQWtCbUkseUJBbEJuSSxnQ0FBNEIsbUNBQVMsR0FBVCxFQUFpQjtBQUFBLHdCQVF2QyxHQVJ1QyxDQUV6QyxNQUZ5QztBQUVqQyxpQkFBVyxNQUZzQiwrQkFFYixLQUZhO0FBQUEsc0JBUXZDLEdBUnVDLENBR3pDLElBSHlDO0FBR25DLGlCQUFXLElBSHdCLDZCQUdqQixFQUhpQjtBQUFBLHVCQVF2QyxHQVJ1QyxDQUl6QyxLQUp5QztBQUlsQyxpQkFBVyxLQUp1Qiw4QkFJZixFQUplO0FBQUEsMkJBUXZDLEdBUnVDLENBS3pDLFNBTHlDO0FBSzlCLGlCQUFXLFNBTG1CLGtDQUtQLENBTE87QUFBQSx5QkFRdkMsR0FSdUMsQ0FNekMsT0FOeUM7QUFNaEMsaUJBQVcsT0FOcUIsZ0NBTVgsS0FOVztBQUFBLDJCQVF2QyxHQVJ1QyxDQU96QyxTQVB5QztBQU85QixpQkFBVyxTQVBtQixrQ0FPUCxDQUFDLEVBUE07QUFTNUMsS0FURDtBQVVBLCtCQUEwQixHQUExQjtBQUNEO0FBQ0YsQ0ExQkQ7O0FBNEJPLFNBQVMsV0FBVCxHQUFzQjtBQUMzQixTQUFPLElBQVA7QUFDRDs7UUFFTyxVLEdBQUEsVTtRQUEwQixnQixHQUFkLFU7UUFBZ0MsZSxHQUFBLGdCO1FBQWlCLGUsR0FBQSxnQjtRQUFpQix1QixHQUFBLHdCO1FBQXlCLHNCLEdBQUEsdUI7UUFBd0IseUIsR0FBQSwwQjs7Ozs7Ozs7O1FDaEl2SCxRLEdBQUEsUTs7QUExQ2hCOztBQUdBLElBQUksbUJBQUosQzs7OztBQUNBLElBQUksY0FBYyxLQUFsQjtBQUNBLElBQUksU0FBUyxFQUFiO0FBQ0EsSUFBSSxVQUFVLEVBQWQ7QUFDQSxJQUFJLFdBQVcsRUFBZjtBQUNBLElBQUksWUFBWSxFQUFoQjtBQUNBLElBQUksYUFBYSxJQUFJLEdBQUosRUFBakI7QUFDQSxJQUFJLGNBQWMsSUFBSSxHQUFKLEVBQWxCOztBQUVBLElBQUksOEJBQUo7QUFDQSxJQUFJLHNCQUFzQixDQUExQjs7QUFHQSxTQUFTLFlBQVQsR0FBdUI7QUFDckIsV0FBUyxNQUFNLElBQU4sQ0FBVyxXQUFXLE1BQVgsQ0FBa0IsTUFBbEIsRUFBWCxDQUFUOzs7QUFHQSxTQUFPLElBQVAsQ0FBWSxVQUFDLENBQUQsRUFBSSxDQUFKO0FBQUEsV0FBVSxFQUFFLElBQUYsQ0FBTyxXQUFQLE1BQXdCLEVBQUUsSUFBRixDQUFPLFdBQVAsRUFBeEIsR0FBK0MsQ0FBL0MsR0FBbUQsQ0FBQyxDQUE5RDtBQUFBLEdBQVo7O0FBSnFCO0FBQUE7QUFBQTs7QUFBQTtBQU1yQix5QkFBZ0IsTUFBaEIsOEhBQXVCO0FBQUEsVUFBZixJQUFlOztBQUNyQixpQkFBVyxHQUFYLENBQWUsS0FBSyxFQUFwQixFQUF3QixJQUF4QjtBQUNBLGVBQVMsSUFBVCxDQUFjLEtBQUssRUFBbkI7QUFDRDtBQVRvQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVdyQixZQUFVLE1BQU0sSUFBTixDQUFXLFdBQVcsT0FBWCxDQUFtQixNQUFuQixFQUFYLENBQVY7OztBQUdBLFVBQVEsSUFBUixDQUFhLFVBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxXQUFVLEVBQUUsSUFBRixDQUFPLFdBQVAsTUFBd0IsRUFBRSxJQUFGLENBQU8sV0FBUCxFQUF4QixHQUErQyxDQUEvQyxHQUFtRCxDQUFDLENBQTlEO0FBQUEsR0FBYjs7O0FBZHFCO0FBQUE7QUFBQTs7QUFBQTtBQWlCckIsMEJBQWdCLE9BQWhCLG1JQUF3QjtBQUFBLFVBQWhCLEtBQWdCOzs7QUFFdEIsa0JBQVksR0FBWixDQUFnQixNQUFLLEVBQXJCLEVBQXlCLEtBQXpCO0FBQ0EsZ0JBQVUsSUFBVixDQUFlLE1BQUssRUFBcEI7QUFDRDs7QUFyQm9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUF1QnRCOztBQUdNLFNBQVMsUUFBVCxHQUFtQjs7QUFFeEIsU0FBTyxJQUFJLE9BQUosQ0FBWSxTQUFTLFFBQVQsQ0FBa0IsT0FBbEIsRUFBMkIsTUFBM0IsRUFBa0M7O0FBRW5ELFFBQUcsT0FBTyxTQUFQLEtBQXFCLFdBQXhCLEVBQW9DO0FBQ2xDLG9CQUFjLElBQWQ7QUFDQSxjQUFRLEVBQUMsTUFBTSxLQUFQLEVBQVI7QUFDRCxLQUhELE1BR00sSUFBRyxPQUFPLFVBQVUsaUJBQWpCLEtBQXVDLFdBQTFDLEVBQXNEO0FBQUE7O0FBRTFELFlBQUksYUFBSjtZQUFVLGFBQVY7WUFBZ0IsZ0JBQWhCOztBQUVBLGtCQUFVLGlCQUFWLEdBQThCLElBQTlCLENBRUUsU0FBUyxXQUFULENBQXFCLFVBQXJCLEVBQWdDO0FBQzlCLHVCQUFhLFVBQWI7QUFDQSxjQUFHLE9BQU8sV0FBVyxjQUFsQixLQUFxQyxXQUF4QyxFQUFvRDtBQUNsRCxtQkFBTyxXQUFXLGNBQVgsQ0FBMEIsQ0FBMUIsRUFBNkIsS0FBN0IsQ0FBbUMsT0FBMUM7QUFDQSxtQkFBTyxJQUFQO0FBQ0QsV0FIRCxNQUdLO0FBQ0gsc0JBQVUsSUFBVjtBQUNBLG1CQUFPLElBQVA7QUFDRDs7QUFFRDs7O0FBR0EscUJBQVcsU0FBWCxHQUF1QixVQUFTLENBQVQsRUFBVztBQUNoQyxvQkFBUSxHQUFSLENBQVksa0JBQVosRUFBZ0MsQ0FBaEM7QUFDQTtBQUNELFdBSEQ7O0FBS0EscUJBQVcsWUFBWCxHQUEwQixVQUFTLENBQVQsRUFBVztBQUNuQyxvQkFBUSxHQUFSLENBQVkscUJBQVosRUFBbUMsQ0FBbkM7QUFDQTtBQUNELFdBSEQ7O0FBS0Esd0JBQWMsSUFBZDtBQUNBLGtCQUFRO0FBQ04sc0JBRE07QUFFTixzQkFGTTtBQUdOLDRCQUhNO0FBSU4sMEJBSk07QUFLTiw0QkFMTTtBQU1OLGtDQU5NO0FBT047QUFQTSxXQUFSO0FBU0QsU0FuQ0gsRUFxQ0UsU0FBUyxRQUFULENBQWtCLENBQWxCLEVBQW9COztBQUVsQixpQkFBTyxrREFBUCxFQUEyRCxDQUEzRDtBQUNELFNBeENIOztBQUowRDtBQStDM0QsS0EvQ0ssTUErQ0Q7QUFDSCxzQkFBYyxJQUFkO0FBQ0EsZ0JBQVEsRUFBQyxNQUFNLEtBQVAsRUFBUjtBQUNEO0FBQ0YsR0F4RE0sQ0FBUDtBQXlERDs7QUFHTSxJQUFJLGlCQUFnQix5QkFBVTtBQUNuQyxNQUFHLGdCQUFnQixLQUFuQixFQUF5QjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYjtBQUNELEdBRkQsTUFFTTtBQUNKLDZDQUFnQix5QkFBVTtBQUN4QixhQUFPLFVBQVA7QUFDRCxLQUZEO0FBR0EsV0FBTyxnQkFBUDtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0QsQ0FWTTs7O0FBYUEsSUFBSSxrQkFBaUIsMEJBQVU7QUFDcEMsTUFBRyxnQkFBZ0IsS0FBbkIsRUFBeUI7QUFDdkIsWUFBUSxJQUFSLENBQWEsZ0NBQWI7QUFDRCxHQUZELE1BRU07QUFDSiwrQ0FBaUIsMEJBQVU7QUFDekIsYUFBTyxPQUFQO0FBQ0QsS0FGRDtBQUdBLFdBQU8saUJBQVA7QUFDRDtBQUNELFNBQU8sS0FBUDtBQUNELENBVk07OztBQWFBLElBQUksaUJBQWdCLHlCQUFVO0FBQ25DLE1BQUcsZ0JBQWdCLEtBQW5CLEVBQXlCO0FBQ3ZCLFlBQVEsSUFBUixDQUFhLGdDQUFiO0FBQ0QsR0FGRCxNQUVNO0FBQ0osNkNBQWdCLHlCQUFVO0FBQ3hCLGFBQU8sTUFBUDtBQUNELEtBRkQ7QUFHQSxXQUFPLGdCQUFQO0FBQ0Q7QUFDRCxTQUFPLEtBQVA7QUFDRCxDQVZNOzs7QUFZQSxJQUFJLG9CQUFtQiw0QkFBVTtBQUN0QyxNQUFHLGdCQUFnQixLQUFuQixFQUF5QjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYjtBQUNELEdBRkQsTUFFTTtBQUNKLG1EQUFtQiw0QkFBVTtBQUMzQixhQUFPLFNBQVA7QUFDRCxLQUZEO0FBR0EsV0FBTyxtQkFBUDtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0QsQ0FWTTs7O0FBYUEsSUFBSSxtQkFBa0IsMkJBQVU7QUFDckMsTUFBRyxnQkFBZ0IsS0FBbkIsRUFBeUI7QUFDdkIsWUFBUSxJQUFSLENBQWEsZ0NBQWI7QUFDRCxHQUZELE1BRU07QUFDSixpREFBa0IsMkJBQVU7QUFDMUIsYUFBTyxRQUFQO0FBQ0QsS0FGRDtBQUdBLFdBQU8sa0JBQVA7QUFDRDtBQUNELFNBQU8sS0FBUDtBQUNELENBVk07OztBQWFBLElBQUkscUJBQW9CLDJCQUFTLEVBQVQsRUFBb0I7QUFDakQsTUFBRyxnQkFBZ0IsS0FBbkIsRUFBeUI7QUFDdkIsWUFBUSxJQUFSLENBQWEsZ0NBQWI7QUFDRCxHQUZELE1BRU07QUFDSixxREFBb0IsMkJBQVMsR0FBVCxFQUFhO0FBQy9CLGFBQU8sWUFBWSxHQUFaLENBQWdCLEdBQWhCLENBQVA7QUFDRCxLQUZEO0FBR0EsV0FBTyxtQkFBa0IsRUFBbEIsQ0FBUDtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0QsQ0FWTTs7O0FBYUEsSUFBSSxvQkFBbUIsMEJBQVMsRUFBVCxFQUFvQjtBQUNoRCxNQUFHLGdCQUFnQixLQUFuQixFQUF5QjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYjtBQUNELEdBRkQsTUFFTTtBQUNKLG1EQUFtQiwwQkFBUyxHQUFULEVBQWE7QUFDOUIsYUFBTyxXQUFXLEdBQVgsQ0FBZSxHQUFmLENBQVA7QUFDRCxLQUZEO0FBR0EsV0FBTyxrQkFBaUIsRUFBakIsQ0FBUDtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0QsQ0FWTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3pMUDs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUdBLElBQU0sTUFBTSxHQUFaO0FBQ0EsSUFBTSxNQUFNLEdBQVo7QUFDQSxJQUFNLGdCQUFnQixDQUF0QjtBQUNBLElBQU0sZ0JBQWlCLElBQUksYUFBSixHQUFvQixFQUFyQixHQUEyQixHQUEzQixHQUFpQyxHQUF2RDs7SUFFYSxVLFdBQUEsVTtBQUVYLHNCQUFZLEVBQVosRUFBd0IsSUFBeEIsRUFBcUM7QUFBQTs7QUFDbkMsU0FBSyxFQUFMLEdBQVUsRUFBVjtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7O0FBRUEsU0FBSyxXQUFMLEdBQW1CLElBQUksS0FBSixDQUFVLEdBQVYsRUFBZSxJQUFmLENBQW9CLENBQUMsQ0FBckIsQ0FBbkI7QUFDQSxTQUFLLFdBQUwsR0FBbUIsS0FBSyxXQUFMLENBQWlCLEdBQWpCLENBQXFCLFlBQVU7QUFDaEQsYUFBTyxJQUFJLEtBQUosQ0FBVSxHQUFWLEVBQWUsSUFBZixDQUFvQixDQUFDLENBQXJCLENBQVA7QUFDRCxLQUZrQixDQUFuQjs7QUFJQSxTQUFLLGdCQUFMLEdBQXdCLEVBQXhCO0FBQ0EsU0FBSyxnQkFBTCxHQUF3QixFQUF4QjtBQUNBLFNBQUssZ0JBQUwsR0FBd0IsS0FBeEI7QUFDRDs7Ozs0QkFFTyxNLEVBQU87QUFDYixXQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0Q7OztpQ0FFVztBQUNWLFdBQUssTUFBTCxHQUFjLElBQWQ7QUFDRDs7O3FDQUVnQixLLEVBQU8sSSxFQUFLO0FBQUE7O0FBQzNCLFVBQUksZUFBSjtVQUFZLG1CQUFaO0FBQ0EsVUFBRyxNQUFNLElBQU4sQ0FBSCxFQUFlO0FBQ2IsZUFBTyxvQkFBUSxXQUFSLEdBQXVCLE1BQU0sS0FBTixHQUFjLGFBQTVDO0FBQ0Q7OztBQUdELFVBQUcsTUFBTSxJQUFOLEtBQWUsR0FBbEIsRUFBc0I7OztBQUdwQixxQkFBYSxLQUFLLFdBQUwsQ0FBaUIsTUFBTSxLQUF2QixFQUE4QixNQUFNLEtBQXBDLENBQWI7QUFDQSxpQkFBUywwQkFBYSxVQUFiLEVBQXlCLEtBQXpCLENBQVQ7QUFDQSxhQUFLLGdCQUFMLENBQXNCLE1BQU0sVUFBNUIsSUFBMEMsTUFBMUM7QUFDQSxlQUFPLE1BQVAsQ0FBYyxPQUFkLENBQXNCLEtBQUssTUFBTCxJQUFlLG9CQUFRLFdBQTdDOzs7OztBQUtBLGVBQU8sS0FBUCxDQUFhLElBQWI7OztBQUdELE9BZEQsTUFjTSxJQUFHLE1BQU0sSUFBTixLQUFlLEdBQWxCLEVBQXNCOztBQUUxQixtQkFBUyxLQUFLLGdCQUFMLENBQXNCLE1BQU0sVUFBNUIsQ0FBVDtBQUNBLGNBQUcsT0FBTyxNQUFQLEtBQWtCLFdBQXJCLEVBQWlDOztBQUUvQjtBQUNEO0FBQ0QsY0FBRyxLQUFLLGdCQUFMLEtBQTBCLElBQTdCLEVBQWtDOztBQUVoQyxpQkFBSyxnQkFBTCxDQUFzQixJQUF0QixDQUEyQixNQUFNLFVBQWpDO0FBQ0QsV0FIRCxNQUdLO0FBQ0gsbUJBQU8sSUFBUCxDQUFZLElBQVosRUFBa0IsWUFBTTs7QUFFdEIscUJBQU8sTUFBSyxnQkFBTCxDQUFzQixNQUFNLFVBQTVCLENBQVA7QUFDRCxhQUhEOztBQUtEO0FBQ0YsU0FqQkssTUFpQkEsSUFBRyxNQUFNLElBQU4sS0FBZSxHQUFsQixFQUFzQjs7QUFFMUIsZ0JBQUcsTUFBTSxLQUFOLEtBQWdCLEVBQW5CLEVBQXNCO0FBQ3BCLGtCQUFHLE1BQU0sS0FBTixLQUFnQixHQUFuQixFQUF1QjtBQUNyQixxQkFBSyxnQkFBTCxHQUF3QixJQUF4Qjs7QUFFQSxrREFBYztBQUNaLHdCQUFNLGNBRE07QUFFWix3QkFBTTtBQUZNLGlCQUFkOzs7QUFNRCxlQVRELE1BU00sSUFBRyxNQUFNLEtBQU4sS0FBZ0IsQ0FBbkIsRUFBcUI7QUFDekIsdUJBQUssZ0JBQUwsR0FBd0IsS0FBeEI7QUFDQSx1QkFBSyxnQkFBTCxDQUFzQixPQUF0QixDQUE4QixVQUFDLFVBQUQsRUFBZ0I7QUFDNUMsNkJBQVMsTUFBSyxnQkFBTCxDQUFzQixVQUF0QixDQUFUO0FBQ0Esd0JBQUcsTUFBSCxFQUFVOztBQUVSLDZCQUFPLElBQVAsQ0FBWSxJQUFaLEVBQWtCLFlBQU07O0FBRXRCLCtCQUFPLE1BQUssZ0JBQUwsQ0FBc0IsVUFBdEIsQ0FBUDtBQUNELHVCQUhEO0FBSUQ7QUFDRixtQkFURDs7QUFXQSx1QkFBSyxnQkFBTCxHQUF3QixFQUF4Qjs7QUFFQSxvREFBYztBQUNaLDBCQUFNLGNBRE07QUFFWiwwQkFBTTtBQUZNLG1CQUFkOzs7QUFNRDs7O0FBR0YsYUFsQ0QsTUFrQ00sSUFBRyxNQUFNLEtBQU4sS0FBZ0IsRUFBbkIsRUFBc0I7Ozs7OztBQU0zQixlQU5LLE1BTUEsSUFBRyxNQUFNLEtBQU4sS0FBZ0IsQ0FBbkIsRUFBcUI7O0FBRTFCO0FBQ0Y7QUFDRjs7Ozs7O29DQUdlLEksRUFBSztBQUFBOztBQUVuQixhQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsd0NBQWMsSUFBZCxFQUNDLElBREQsQ0FDTSxVQUFDLE1BQUQsRUFBWTs7QUFFaEIsY0FBRyxPQUFPLEtBQUssT0FBWixLQUF3QixXQUEzQixFQUF1QztBQUNyQyxtQkFBSyxVQUFMLENBQWdCLEtBQUssT0FBTCxDQUFhLENBQWIsQ0FBaEIsRUFBaUMsS0FBSyxPQUFMLENBQWEsQ0FBYixDQUFqQzs7QUFFRDs7QUFFRCxrQkFBUSxHQUFSLENBQVksTUFBWjtBQUNBLGlCQUFPLE9BQVAsQ0FBZSxVQUFDLE1BQUQsRUFBWTtBQUN6QixnQkFBSSxhQUFhLEtBQUssT0FBTyxFQUFaLENBQWpCO0FBQ0EsZ0JBQUcsT0FBTyxVQUFQLEtBQXNCLFFBQXpCLEVBQWtDO0FBQ2hDLDJCQUFhO0FBQ1gsd0JBQVEsT0FBTztBQURKLGVBQWI7QUFHRCxhQUpELE1BSUs7QUFDSCx5QkFBVyxNQUFYLEdBQW9CLE9BQU8sTUFBM0I7QUFDRDtBQUNELHVCQUFXLElBQVgsR0FBa0IsT0FBTyxFQUF6QjtBQUNBLG1CQUFLLGdCQUFMLENBQXNCLFVBQXRCO0FBQ0QsV0FYRDs7QUFhQTtBQUNELFNBdkJEO0FBd0JELE9BekJNLENBQVA7QUEwQkQ7Ozs7Ozs7Ozs7Ozs7Ozs7dUNBYXdCO0FBQUE7O0FBQUEsd0NBQUwsSUFBSztBQUFMLFlBQUs7QUFBQTs7QUFDdkIsV0FBSyxPQUFMLENBQWE7QUFBQSxlQUFZLE9BQUssaUJBQUwsQ0FBdUIsUUFBdkIsQ0FBWjtBQUFBLE9BQWI7QUFDRDs7O3dDQUUyQjtBQUFBOztBQUFBLFVBQVYsSUFBVSx5REFBSCxFQUFHO0FBQUEsVUFFeEIsSUFGd0IsR0FRdEIsSUFSc0IsQ0FFeEIsSUFGd0I7QUFBQSx5QkFRdEIsSUFSc0IsQ0FHeEIsTUFId0I7QUFBQSxVQUd4QixNQUh3QixnQ0FHZixJQUhlO0FBQUEsMEJBUXRCLElBUnNCLENBSXhCLE9BSndCO0FBQUEsVUFJeEIsT0FKd0IsaUNBSWQsQ0FBQyxJQUFELEVBQU8sSUFBUCxDQUpjO0FBQUEsMEJBUXRCLElBUnNCLENBS3hCLE9BTHdCO0FBQUEsVUFLeEIsT0FMd0IsaUNBS2QsQ0FBQyxJQUFELEVBQU8sUUFBUCxDQUxjO0FBQUEsc0JBUXRCLElBUnNCLENBTXhCLEdBTndCO0FBQUEsVUFNeEIsR0FOd0IsNkJBTWxCLElBTmtCO0FBQUEsMkJBUXRCLElBUnNCLENBT3hCLFFBUHdCO0FBQUEsVUFPeEIsUUFQd0Isa0NBT2IsQ0FBQyxDQUFELEVBQUksR0FBSixDQVBhOzs7QUFVMUIsVUFBRyxPQUFPLElBQVAsS0FBZ0IsV0FBbkIsRUFBK0I7QUFDN0IsZ0JBQVEsSUFBUixDQUFhLDJDQUFiO0FBQ0E7QUFDRDs7O0FBR0QsVUFBSSxJQUFJLHNCQUFXLElBQVgsQ0FBUjtBQUNBLFVBQUcsTUFBTSxLQUFULEVBQWU7QUFDYixnQkFBUSxJQUFSLENBQWEscUJBQWI7QUFDQTtBQUNEO0FBQ0QsYUFBTyxFQUFFLE1BQVQ7O0FBckIwQixvQ0F1Qk8sT0F2QlA7O0FBQUEsVUF1QnJCLFlBdkJxQjtBQUFBLFVBdUJQLFVBdkJPOztBQUFBLG9DQXdCZSxPQXhCZjs7QUFBQSxVQXdCckIsZUF4QnFCO0FBQUEsVUF3QkosZUF4Qkk7O0FBQUEscUNBeUJTLFFBekJUOztBQUFBLFVBeUJyQixhQXpCcUI7QUFBQSxVQXlCTixXQXpCTTs7O0FBMkIxQixVQUFHLFFBQVEsTUFBUixLQUFtQixDQUF0QixFQUF3QjtBQUN0Qix1QkFBZSxhQUFhLElBQTVCO0FBQ0Q7O0FBRUQsVUFBRyxvQkFBb0IsSUFBdkIsRUFBNEI7QUFDMUIsMEJBQWtCLElBQWxCO0FBQ0Q7Ozs7Ozs7O0FBU0QsV0FBSyxXQUFMLENBQWlCLElBQWpCLEVBQXVCLE9BQXZCLENBQStCLFVBQUMsVUFBRCxFQUFhLENBQWIsRUFBbUI7QUFDaEQsWUFBRyxLQUFLLGFBQUwsSUFBc0IsSUFBSSxXQUE3QixFQUF5QztBQUN2QyxjQUFHLGVBQWUsQ0FBQyxDQUFuQixFQUFxQjtBQUNuQix5QkFBYTtBQUNYLGtCQUFJO0FBRE8sYUFBYjtBQUdEOztBQUVELHFCQUFXLE1BQVgsR0FBb0IsVUFBVSxXQUFXLE1BQXpDO0FBQ0EscUJBQVcsWUFBWCxHQUEwQixnQkFBZ0IsV0FBVyxZQUFyRDtBQUNBLHFCQUFXLFVBQVgsR0FBd0IsY0FBYyxXQUFXLFVBQWpEO0FBQ0EscUJBQVcsZUFBWCxHQUE2QixtQkFBbUIsV0FBVyxlQUEzRDtBQUNBLHFCQUFXLGVBQVgsR0FBNkIsbUJBQW1CLFdBQVcsZUFBM0Q7QUFDQSxxQkFBVyxHQUFYLEdBQWlCLE9BQU8sV0FBVyxHQUFuQzs7QUFFQSxjQUFHLHNCQUFXLFdBQVcsZUFBdEIsTUFBMkMsT0FBOUMsRUFBc0Q7QUFDcEQsdUJBQVcsb0JBQVgsR0FBa0MsV0FBVyxlQUE3QztBQUNBLHVCQUFXLGVBQVgsR0FBNkIsT0FBN0I7QUFDRCxXQUhELE1BR0s7QUFDSCxtQkFBTyxXQUFXLG9CQUFsQjtBQUNEO0FBQ0QsaUJBQUssV0FBTCxDQUFpQixJQUFqQixFQUF1QixDQUF2QixJQUE0QixVQUE1QjtBQUNEO0FBQ0YsT0F2QkQ7O0FBeUJEOzs7Ozs7MkNBSXFCOztBQUVyQjs7OzJDQUVxQixDQUVyQjs7Ozs7Ozs7Ozs7K0JBTVUsUSxFQUFrQixRLEVBQVM7O0FBRXBDLFdBQUssV0FBTCxDQUFpQixPQUFqQixDQUF5QixVQUFTLE9BQVQsRUFBa0IsQ0FBbEIsRUFBb0I7QUFDM0MsZ0JBQVEsT0FBUixDQUFnQixVQUFTLE1BQVQsRUFBZ0I7QUFDOUIsY0FBRyxXQUFXLENBQUMsQ0FBZixFQUFpQjtBQUNmLHFCQUFTO0FBQ1Asa0JBQUk7QUFERyxhQUFUO0FBR0Q7QUFDRCxpQkFBTyxlQUFQLEdBQXlCLFFBQXpCO0FBQ0EsaUJBQU8sZUFBUCxHQUF5QixRQUF6QjtBQUNELFNBUkQ7QUFTRCxPQVZEO0FBV0Q7OztrQ0FHWTtBQUFBOztBQUNYLFdBQUssZ0JBQUwsR0FBd0IsRUFBeEI7QUFDQSxVQUFHLEtBQUssZ0JBQUwsS0FBMEIsSUFBN0IsRUFBa0M7QUFDaEMsMENBQWM7QUFDWixnQkFBTSxjQURNO0FBRVosZ0JBQU07QUFGTSxTQUFkO0FBSUQ7QUFDRCxXQUFLLGdCQUFMLEdBQXdCLEtBQXhCOztBQUVBLGFBQU8sSUFBUCxDQUFZLEtBQUssZ0JBQWpCLEVBQW1DLE9BQW5DLENBQTJDLFVBQUMsUUFBRCxFQUFjOztBQUV2RCxlQUFLLGdCQUFMLENBQXNCLFFBQXRCLEVBQWdDLElBQWhDO0FBQ0QsT0FIRDtBQUlBLFdBQUssZ0JBQUwsR0FBd0IsRUFBeEI7OztBQUdEOzs7Ozs7Ozs7Ozs7Ozs7O0FDN1JIOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFHQSxJQUNFLFlBQVksSUFBSSxHQUFKLENBQVEsQ0FDbEIsQ0FBQyxRQUFELEVBQVcsV0FBWCxDQURrQixFQUVsQixDQUFDLFlBQUQsRUFBZSxlQUFmLENBRmtCLEVBR2xCLENBQUMsd0JBQUQsRUFBMkIsMkJBQTNCLENBSGtCLEVBSWxCLENBQUMsMkJBQUQsRUFBOEIsOEJBQTlCLENBSmtCLEVBS2xCLENBQUMsc0JBQUQsRUFBeUIseUJBQXpCLENBTGtCLEVBTWxCLENBQUMseUJBQUQsRUFBNEIsNEJBQTVCLENBTmtCLEVBT2xCLENBQUMsd0JBQUQsRUFBMkIsMkJBQTNCLENBUGtCLEVBUWxCLENBQUMsMkJBQUQsRUFBOEIsOEJBQTlCLENBUmtCLENBQVIsQ0FEZDs7SUFZYSxTLFdBQUEsUztBQUVYLHFCQUFZLElBQVosRUFBaUI7QUFBQTs7QUFDZixTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxLQUFMLEdBQWEsaUJBQVUsS0FBSyxJQUFMLENBQVUsRUFBVixHQUFlLFlBQXpCLENBQWI7QUFDQSxTQUFLLElBQUwsR0FBWSxpQkFBWjtBQUNBLFNBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsS0FBSyxJQUF6QjtBQUNBLFNBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsS0FBSyxJQUFMLENBQVUsT0FBN0I7O0FBRUEsU0FBSyxNQUFMLEdBQWMsRUFBZDtBQUNBLFNBQUssY0FBTCxHQUFzQixFQUF0QjtBQUNBLFNBQUssZ0JBQUwsR0FBd0IsQ0FBeEI7QUFDQSxTQUFLLElBQUwsR0FBWSxDQUFaO0FBQ0EsU0FBSyxLQUFMLEdBQWEsQ0FBYjtBQUNBLFNBQUssYUFBTCxHQUFxQixDQUFyQjtBQUNBLFNBQUssS0FBTDtBQUNEOzs7OzRCQUdNOztBQUVMLFVBQUksT0FBTyw4QkFBWDtBQUNBLFVBQUksYUFBYSwyQkFBZSxXQUFmLENBQWpCO0FBQ0EsaUJBQVcsZ0JBQVgsQ0FBNEI7QUFDMUIsY0FBTSxFQURvQjtBQUUxQixnQkFBUSxLQUFLO0FBRmEsT0FBNUIsRUFHRztBQUNELGNBQU0sRUFETDtBQUVELGdCQUFRLEtBQUs7QUFGWixPQUhIO0FBT0EsV0FBSyxLQUFMLENBQVcsYUFBWCxDQUF5QixVQUF6Qjs7QUFFQSxXQUFLLE1BQUwsR0FBYyxDQUFkOztBQUVBLFdBQUssa0JBQUwsR0FBMEIsRUFBMUI7QUFDQSxXQUFLLHFCQUFMLEdBQTZCLEVBQTdCOztBQUVBLFdBQUssZ0JBQUwsR0FBd0IsR0FBeEI7QUFDQSxXQUFLLG1CQUFMLEdBQTJCLEdBQTNCOztBQUVBLFdBQUssa0JBQUwsR0FBMEIsS0FBSyxJQUFMLENBQVUsR0FBVixHQUFnQixDQUExQyxDO0FBQ0EsV0FBSyxxQkFBTCxHQUE2QixLQUFLLElBQUwsQ0FBVSxHQUFWLEdBQWdCLENBQTdDO0FBQ0Q7OztpQ0FFWSxRLEVBQVUsTSxFQUFvQjtBQUFBLFVBQVosRUFBWSx5REFBUCxNQUFPOztBQUN6QyxVQUFJLFVBQUo7VUFBTyxVQUFQO0FBQ0EsVUFBSSxpQkFBSjtBQUNBLFVBQUksaUJBQUo7QUFDQSxVQUFJLG1CQUFKO0FBQ0EsVUFBSSxtQkFBSjtBQUNBLFVBQUksb0JBQUo7QUFDQSxVQUFJLHFCQUFKO0FBQ0EsVUFBSSxRQUFRLENBQVo7QUFDQSxVQUFJLGVBQUo7VUFBWSxnQkFBWjtBQUNBLFVBQUksU0FBUyxFQUFiOzs7O0FBSUEsV0FBSSxJQUFJLFFBQVIsRUFBa0IsS0FBSyxNQUF2QixFQUErQixHQUEvQixFQUFtQztBQUNqQyxtQkFBVyxpQ0FBa0IsS0FBSyxJQUF2QixFQUE2QjtBQUN0QyxnQkFBTSxXQURnQztBQUV0QyxrQkFBUSxDQUFDLENBQUQ7QUFGOEIsU0FBN0IsQ0FBWDs7QUFLQSxzQkFBYyxTQUFTLFNBQXZCO0FBQ0EsdUJBQWUsU0FBUyxZQUF4Qjs7QUFFQSxhQUFJLElBQUksQ0FBUixFQUFXLElBQUksV0FBZixFQUE0QixHQUE1QixFQUFnQzs7QUFFOUIsdUJBQWEsTUFBTSxDQUFOLEdBQVUsS0FBSyxrQkFBZixHQUFvQyxLQUFLLHFCQUF0RDtBQUNBLHVCQUFhLE1BQU0sQ0FBTixHQUFVLEtBQUssa0JBQWYsR0FBb0MsS0FBSyxxQkFBdEQ7QUFDQSxxQkFBVyxNQUFNLENBQU4sR0FBVSxLQUFLLGdCQUFmLEdBQWtDLEtBQUssbUJBQWxEOztBQUVBLG1CQUFTLDBCQUFjLEtBQWQsRUFBcUIsR0FBckIsRUFBMEIsVUFBMUIsRUFBc0MsUUFBdEMsQ0FBVDtBQUNBLG9CQUFVLDBCQUFjLFFBQVEsVUFBdEIsRUFBa0MsR0FBbEMsRUFBdUMsVUFBdkMsRUFBbUQsQ0FBbkQsQ0FBVjs7QUFFQSxjQUFHLE9BQU8sVUFBVixFQUFxQjtBQUNuQixtQkFBTyxNQUFQLEdBQWdCLEtBQUssS0FBckI7QUFDQSxvQkFBUSxNQUFSLEdBQWlCLEtBQUssS0FBdEI7QUFDQSxtQkFBTyxLQUFQLEdBQWUsRUFBZjtBQUNBLG9CQUFRLEtBQVIsR0FBZ0IsRUFBaEI7QUFDRDs7QUFFRCxpQkFBTyxJQUFQLENBQVksTUFBWixFQUFvQixPQUFwQjtBQUNBLG1CQUFTLFlBQVQ7QUFDRDtBQUNGOztBQUVELGFBQU8sTUFBUDtBQUNEOzs7Z0NBRzREO0FBQUEsVUFBbkQsUUFBbUQseURBQXhDLENBQXdDOztBQUFBOztBQUFBLFVBQXJDLE1BQXFDLHlEQUE1QixLQUFLLElBQUwsQ0FBVSxJQUFrQjtBQUFBLFVBQVosRUFBWSx5REFBUCxNQUFPOztBQUMzRCxXQUFLLElBQUwsQ0FBVSxZQUFWLENBQXVCLEtBQUssSUFBTCxDQUFVLFNBQVYsRUFBdkI7QUFDQSxXQUFLLE1BQUwsR0FBYyxLQUFLLFlBQUwsQ0FBa0IsUUFBbEIsRUFBNEIsTUFBNUIsRUFBb0MsRUFBcEMsQ0FBZDtBQUNBLG9CQUFLLElBQUwsRUFBVSxTQUFWLGlDQUF1QixLQUFLLE1BQTVCO0FBQ0EsV0FBSyxJQUFMLEdBQVksS0FBSyxJQUFMLENBQVUsSUFBdEI7O0FBRUEsYUFBTyxLQUFLLE1BQVo7QUFDRDs7O3lDQUdvQixRLEVBQVUsUyxFQUFVO0FBQ3ZDLFVBQUcsWUFBWSxDQUFmLEVBQWlCO0FBQ2YsZUFBTyxDQUFDLENBQVI7QUFDRDs7QUFFRCxXQUFLLFNBQUwsR0FBaUIsU0FBakI7Ozs7QUFJQSxVQUFJLG9CQUFvQixpQ0FBa0IsS0FBSyxJQUF2QixFQUE2QjtBQUNuRCxjQUFNLFFBRDZDO0FBRW5ELGdCQUFRLEtBQUssSUFBTCxDQUFVLGNBRmlDO0FBR25ELGdCQUFRO0FBSDJDLE9BQTdCLENBQXhCOztBQU1BLFVBQUksU0FBUyxpQ0FBa0IsS0FBSyxJQUF2QixFQUE2QjtBQUN4QyxjQUFNLFdBRGtDO0FBRXhDLGdCQUFRLENBQUMsa0JBQWtCLEdBQWxCLEdBQXdCLFFBQXpCLENBRmdDO0FBR3hDLGdCQUFRO0FBSGdDLE9BQTdCLENBQWI7Ozs7QUFRQSxXQUFLLGFBQUwsR0FBcUIsQ0FBckI7QUFDQSxXQUFLLFdBQUwsR0FBbUIsa0JBQWtCLE1BQXJDO0FBQ0EsV0FBSyxTQUFMLEdBQWlCLE9BQU8sTUFBeEI7QUFDQSxXQUFLLGdCQUFMLEdBQXdCLE9BQU8sTUFBUCxHQUFnQixLQUFLLFdBQTdDOzs7O0FBSUEsV0FBSyxjQUFMLEdBQXNCLEtBQUssWUFBTCxDQUFrQixrQkFBa0IsR0FBcEMsRUFBeUMsT0FBTyxHQUFQLEdBQWEsQ0FBdEQsRUFBeUQsVUFBekQsQ0FBdEI7QUFDQSxXQUFLLGNBQUwsR0FBc0IsNERBQWdCLEtBQUssSUFBTCxDQUFVLFdBQTFCLHNCQUEwQyxLQUFLLGNBQS9DLEdBQXRCOzs7O0FBSUEsYUFBTyxLQUFLLGdCQUFaO0FBQ0Q7Ozs7OztzQ0FJaUIsTyxFQUFRO0FBQ3hCLFVBQUksU0FBUyxLQUFLLGNBQWxCO1VBQ0UsT0FBTyxPQUFPLE1BRGhCO1VBQ3dCLFVBRHhCO1VBQzJCLFlBRDNCO1VBRUUsU0FBUyxFQUZYOztBQUlBLFdBQUksSUFBSSxLQUFLLGFBQWIsRUFBNEIsSUFBSSxJQUFoQyxFQUFzQyxHQUF0QyxFQUEwQztBQUN4QyxjQUFNLE9BQU8sQ0FBUCxDQUFOOztBQUVBLFlBQUcsSUFBSSxNQUFKLEdBQWEsT0FBaEIsRUFBd0I7QUFDdEIsY0FBSSxJQUFKLEdBQVcsS0FBSyxTQUFMLEdBQWlCLElBQUksTUFBaEM7QUFDQSxpQkFBTyxJQUFQLENBQVksR0FBWjtBQUNBLGVBQUssYUFBTDtBQUNELFNBSkQsTUFJSztBQUNIO0FBQ0Q7QUFDRjs7QUFFRCxhQUFPLE1BQVA7QUFDRDs7O3lCQUdJLEksRUFBSztBQUNSLFdBQUssS0FBTCxDQUFXLEtBQVgsR0FBbUIsSUFBbkI7QUFDRDs7O2tDQUdZO0FBQ1gsV0FBSyxLQUFMLENBQVcsV0FBWCxDQUF1QixXQUF2QjtBQUNEOzs7Ozs7bUNBS2E7QUFDWixXQUFLLElBQUwsQ0FBVSxDQUFWLEVBQWEsS0FBSyxJQUFsQixFQUF3QixRQUF4QjtBQUNBLFdBQUssV0FBTDtBQUNBLFdBQUssSUFBTCxDQUFVLFVBQVYsQ0FBcUIsVUFBckI7QUFDRDs7Ozs7OzhCQUdTLE0sRUFBTzs7QUFFZixhQUFPLElBQVAsQ0FBWSxNQUFaLEVBQW9CLE9BQXBCLENBQTRCLFVBQVMsR0FBVCxFQUFhO0FBQ3ZDLGFBQUssVUFBVSxHQUFWLENBQWMsR0FBZCxDQUFMLEVBQXlCLE9BQU8sR0FBaEM7QUFDRCxPQUZELEVBRUcsSUFGSDs7QUFJQSxXQUFLLFlBQUw7QUFDRDs7O2tDQUdhLFUsRUFBVztBQUN2QixVQUFHLENBQUMsVUFBRCxrQ0FBSCxFQUFxQztBQUNuQyxnQkFBUSxJQUFSLENBQWEsK0JBQWI7QUFDQTtBQUNEO0FBQ0QsV0FBSyxLQUFMLENBQVcsYUFBWCxDQUF5QixVQUF6QjtBQUNBLFdBQUssWUFBTDtBQUNEOzs7OENBR3lCLEssRUFBTTtBQUM5QixVQUFHLE1BQU0sS0FBTixDQUFILEVBQWdCO0FBQ2QsZ0JBQVEsSUFBUixDQUFhLHlCQUFiO0FBQ0Q7QUFDRCxXQUFLLGtCQUFMLEdBQTBCLEtBQTFCO0FBQ0EsV0FBSyxZQUFMO0FBQ0Q7OztpREFHNEIsSyxFQUFNO0FBQ2pDLFVBQUcsTUFBTSxLQUFOLENBQUgsRUFBZ0I7QUFDZCxnQkFBUSxJQUFSLENBQWEseUJBQWI7QUFDRDtBQUNELFdBQUsscUJBQUwsR0FBNkIsS0FBN0I7QUFDQSxXQUFLLFlBQUw7QUFDRDs7OzRDQUd1QixLLEVBQU07QUFDNUIsY0FBUSwyQkFBZ0IsS0FBaEIsQ0FBUjtBQUNBLFVBQUcsVUFBVSxLQUFiLEVBQW1CO0FBQ2pCLGFBQUssZ0JBQUwsR0FBd0IsS0FBeEI7QUFDRCxPQUZELE1BRUs7QUFDSCxnQkFBUSxJQUFSLENBQWEseUJBQWI7QUFDRDtBQUNELFdBQUssWUFBTDtBQUNEOzs7K0NBRzBCLEssRUFBTTtBQUMvQixjQUFRLDJCQUFnQixLQUFoQixDQUFSO0FBQ0EsVUFBRyxVQUFVLEtBQWIsRUFBbUI7QUFDakIsYUFBSyxtQkFBTCxHQUEyQixLQUEzQjtBQUNELE9BRkQsTUFFSztBQUNILGdCQUFRLElBQVIsQ0FBYSx5QkFBYjtBQUNEO0FBQ0QsV0FBSyxZQUFMO0FBQ0Q7Ozs4Q0FHeUIsSyxFQUFNO0FBQzlCLGNBQVEsMkJBQWdCLEtBQWhCLENBQVI7QUFDQSxVQUFHLFVBQVUsS0FBYixFQUFtQjtBQUNqQixhQUFLLGtCQUFMLEdBQTBCLEtBQTFCO0FBQ0QsT0FGRCxNQUVLO0FBQ0gsZ0JBQVEsSUFBUixDQUFhLHlCQUFiO0FBQ0Q7QUFDRCxXQUFLLFlBQUw7QUFDRDs7O2lEQUc0QixLLEVBQU07QUFDakMsY0FBUSwyQkFBZ0IsS0FBaEIsQ0FBUjtBQUNBLFVBQUcsVUFBVSxLQUFiLEVBQW1CO0FBQ2pCLGFBQUsscUJBQUwsR0FBNkIsS0FBN0I7QUFDRCxPQUZELE1BRUs7QUFDSCxnQkFBUSxJQUFSLENBQWEseUJBQWI7QUFDRDtBQUNELFdBQUssWUFBTDtBQUNEOzs7OEJBR1MsSyxFQUFNO0FBQ2QsV0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixLQUFyQjtBQUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOVJILElBQUksaUJBQWlCLENBQXJCOztJQUVhLFMsV0FBQSxTO0FBRVgscUJBQVksS0FBWixFQUEyQixJQUEzQixFQUF5QyxLQUF6QyxFQUEyRTtBQUFBLFFBQW5CLEtBQW1CLHlEQUFILENBQUMsQ0FBRTs7QUFBQTs7QUFDekUsU0FBSyxFQUFMLFdBQWdCLGdCQUFoQixTQUFvQyxJQUFJLElBQUosR0FBVyxPQUFYLEVBQXBDO0FBQ0EsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUssU0FBTCxHQUFpQixNQUFNLEtBQUssR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFDLFFBQVEsRUFBVCxJQUFlLEVBQTNCLENBQXZCOztBQUVBLFFBQUcsVUFBVSxHQUFWLElBQWlCLFVBQVUsQ0FBOUIsRUFBZ0M7QUFDOUIsV0FBSyxLQUFMLEdBQWEsR0FBYjtBQUNEOztBQUVELFNBQUssS0FBTCxHQUFhLElBQWI7QUFDQSxTQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsU0FBSyxLQUFMLEdBQWEsSUFBYjs7QUFFRDs7OzsyQkFFSztBQUNKLFVBQUksSUFBSSxJQUFJLFNBQUosQ0FBYyxLQUFLLEtBQW5CLEVBQTBCLEtBQUssSUFBL0IsRUFBcUMsS0FBSyxLQUExQyxFQUFpRCxLQUFLLEtBQXRELENBQVI7QUFDQSxhQUFPLENBQVA7QUFDRDs7OzhCQUVTLE0sRUFBZTs7QUFDdkIsV0FBSyxLQUFMLElBQWMsTUFBZDtBQUNBLFdBQUssU0FBTCxHQUFpQixNQUFNLEtBQUssR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFDLEtBQUssS0FBTCxHQUFhLEVBQWQsSUFBb0IsRUFBaEMsQ0FBdkI7QUFDRDs7O3lCQUVJLEssRUFBYztBQUNqQixXQUFLLEtBQUwsSUFBYyxLQUFkO0FBQ0EsVUFBRyxLQUFLLFFBQVIsRUFBaUI7QUFDZixhQUFLLFFBQUwsQ0FBYyxNQUFkO0FBQ0Q7QUFDRjs7OzJCQUVNLEssRUFBYztBQUNuQixXQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsVUFBRyxLQUFLLFFBQVIsRUFBaUI7QUFDZixhQUFLLFFBQUwsQ0FBYyxNQUFkO0FBQ0Q7QUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOUNIOzs7O0FBRUEsSUFBSSxnQkFBZ0IsQ0FBcEI7O0lBRWEsUSxXQUFBLFE7QUFFWCxvQkFBWSxNQUFaLEVBQStCLE9BQS9CLEVBQWtEO0FBQUE7OztBQUVoRCxRQUFHLE9BQU8sSUFBUCxLQUFnQixHQUFuQixFQUF1QjtBQUNyQixjQUFRLElBQVIsQ0FBYSx3QkFBYjtBQUNBO0FBQ0Q7QUFDRCxTQUFLLEVBQUwsV0FBZ0IsZUFBaEIsU0FBbUMsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUFuQztBQUNBLFNBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxXQUFPLFFBQVAsR0FBa0IsSUFBbEI7QUFDQSxXQUFPLFVBQVAsR0FBb0IsS0FBSyxFQUF6Qjs7QUFFQSxRQUFHLHdDQUFILEVBQWdDO0FBQzlCLFdBQUssT0FBTCxHQUFlLE9BQWY7QUFDQSxjQUFRLFFBQVIsR0FBbUIsSUFBbkI7QUFDQSxjQUFRLFVBQVIsR0FBcUIsS0FBSyxFQUExQjtBQUNBLFdBQUssYUFBTCxHQUFxQixRQUFRLEtBQVIsR0FBZ0IsT0FBTyxLQUE1QztBQUNBLFdBQUssY0FBTCxHQUFzQixDQUFDLENBQXZCO0FBQ0Q7QUFDRjs7OzsrQkFFVSxPLEVBQVE7QUFDakIsV0FBSyxPQUFMLEdBQWUsT0FBZjtBQUNBLGNBQVEsUUFBUixHQUFtQixJQUFuQjtBQUNBLGNBQVEsVUFBUixHQUFxQixLQUFLLEVBQTFCO0FBQ0EsV0FBSyxhQUFMLEdBQXFCLFFBQVEsS0FBUixHQUFnQixLQUFLLE1BQUwsQ0FBWSxLQUFqRDtBQUNBLFdBQUssY0FBTCxHQUFzQixDQUFDLENBQXZCO0FBQ0Q7OzsyQkFFSztBQUNKLGFBQU8sSUFBSSxRQUFKLENBQWEsS0FBSyxNQUFMLENBQVksSUFBWixFQUFiLEVBQWlDLEtBQUssT0FBTCxDQUFhLElBQWIsRUFBakMsQ0FBUDtBQUNEOzs7NkJBRU87O0FBQ04sV0FBSyxhQUFMLEdBQXFCLEtBQUssT0FBTCxDQUFhLEtBQWIsR0FBcUIsS0FBSyxNQUFMLENBQVksS0FBdEQ7QUFDRDs7OzhCQUVTLE0sRUFBcUI7QUFDN0IsV0FBSyxNQUFMLENBQVksU0FBWixDQUFzQixNQUF0QjtBQUNBLFdBQUssT0FBTCxDQUFhLFNBQWIsQ0FBdUIsTUFBdkI7QUFDRDs7O3lCQUVJLEssRUFBb0I7QUFDdkIsV0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixLQUFqQjtBQUNBLFdBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsS0FBbEI7QUFDRDs7OzJCQUVNLEssRUFBb0I7QUFDekIsV0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixLQUFuQjtBQUNBLFdBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsS0FBcEI7QUFDRDs7O2lDQUVXO0FBQ1YsVUFBRyxLQUFLLElBQVIsRUFBYTtBQUNYLGFBQUssSUFBTCxDQUFVLFlBQVYsQ0FBdUIsSUFBdkI7QUFDQSxhQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0Q7QUFDRCxVQUFHLEtBQUssS0FBUixFQUFjO0FBQ1osYUFBSyxLQUFMLENBQVcsWUFBWCxDQUF3QixJQUF4QjtBQUNBLGFBQUssS0FBTCxHQUFhLElBQWI7QUFDRDtBQUNELFVBQUcsS0FBSyxJQUFSLEVBQWE7QUFDWCxhQUFLLElBQUwsQ0FBVSxZQUFWLENBQXVCLElBQXZCO0FBQ0EsYUFBSyxJQUFMLEdBQVksSUFBWjtBQUNEO0FBQ0Y7Ozs7Ozs7Ozs7Ozs7O0FDOURIOzs7Ozs7Ozs7O0FBRUEsSUFBTSxNQUFNLE9BQU8sWUFBbkI7O0lBRXFCLFU7Ozs7QUFHbkIsc0JBQVksTUFBWixFQUFtQjtBQUFBOztBQUNqQixTQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsU0FBSyxRQUFMLEdBQWdCLENBQWhCO0FBQ0Q7Ozs7Ozs7eUJBR0ksTSxFQUF5QjtBQUFBLFVBQWpCLFFBQWlCLHlEQUFOLElBQU07O0FBQzVCLFVBQUksZUFBSjs7QUFFQSxVQUFHLFFBQUgsRUFBWTtBQUNWLGlCQUFTLEVBQVQ7QUFDQSxhQUFJLElBQUksSUFBSSxDQUFaLEVBQWUsSUFBSSxNQUFuQixFQUEyQixLQUFLLEtBQUssUUFBTCxFQUFoQyxFQUFnRDtBQUM5QyxvQkFBVSxJQUFJLEtBQUssTUFBTCxDQUFZLEtBQUssUUFBakIsQ0FBSixDQUFWO0FBQ0Q7QUFDRCxlQUFPLE1BQVA7QUFDRCxPQU5ELE1BTUs7QUFDSCxpQkFBUyxFQUFUO0FBQ0EsYUFBSSxJQUFJLEtBQUksQ0FBWixFQUFlLEtBQUksTUFBbkIsRUFBMkIsTUFBSyxLQUFLLFFBQUwsRUFBaEMsRUFBZ0Q7QUFDOUMsaUJBQU8sSUFBUCxDQUFZLEtBQUssTUFBTCxDQUFZLEtBQUssUUFBakIsQ0FBWjtBQUNEO0FBQ0QsZUFBTyxNQUFQO0FBQ0Q7QUFDRjs7Ozs7O2dDQUdXO0FBQ1YsVUFBSSxTQUNGLENBQUMsS0FBSyxNQUFMLENBQVksS0FBSyxRQUFqQixLQUE4QixFQUEvQixLQUNDLEtBQUssTUFBTCxDQUFZLEtBQUssUUFBTCxHQUFnQixDQUE1QixLQUFrQyxFQURuQyxLQUVDLEtBQUssTUFBTCxDQUFZLEtBQUssUUFBTCxHQUFnQixDQUE1QixLQUFrQyxDQUZuQyxJQUdBLEtBQUssTUFBTCxDQUFZLEtBQUssUUFBTCxHQUFnQixDQUE1QixDQUpGO0FBTUEsV0FBSyxRQUFMLElBQWlCLENBQWpCO0FBQ0EsYUFBTyxNQUFQO0FBQ0Q7Ozs7OztnQ0FHVztBQUNWLFVBQUksU0FDRixDQUFDLEtBQUssTUFBTCxDQUFZLEtBQUssUUFBakIsS0FBOEIsQ0FBL0IsSUFDQSxLQUFLLE1BQUwsQ0FBWSxLQUFLLFFBQUwsR0FBZ0IsQ0FBNUIsQ0FGRjtBQUlBLFdBQUssUUFBTCxJQUFpQixDQUFqQjtBQUNBLGFBQU8sTUFBUDtBQUNEOzs7Ozs7NkJBR1EsTSxFQUFRO0FBQ2YsVUFBSSxTQUFTLEtBQUssTUFBTCxDQUFZLEtBQUssUUFBakIsQ0FBYjtBQUNBLFVBQUcsVUFBVSxTQUFTLEdBQXRCLEVBQTBCO0FBQ3hCLGtCQUFVLEdBQVY7QUFDRDtBQUNELFdBQUssUUFBTCxJQUFpQixDQUFqQjtBQUNBLGFBQU8sTUFBUDtBQUNEOzs7MEJBRUs7QUFDSixhQUFPLEtBQUssUUFBTCxJQUFpQixLQUFLLE1BQUwsQ0FBWSxNQUFwQztBQUNEOzs7Ozs7Ozs7aUNBTVk7QUFDWCxVQUFJLFNBQVMsQ0FBYjtBQUNBLGFBQU0sSUFBTixFQUFZO0FBQ1YsWUFBSSxJQUFJLEtBQUssUUFBTCxFQUFSO0FBQ0EsWUFBSSxJQUFJLElBQVIsRUFBYztBQUNaLG9CQUFXLElBQUksSUFBZjtBQUNBLHFCQUFXLENBQVg7QUFDRCxTQUhELE1BR087O0FBRUwsaUJBQU8sU0FBUyxDQUFoQjtBQUNEO0FBQ0Y7QUFDRjs7OzRCQUVNO0FBQ0wsV0FBSyxRQUFMLEdBQWdCLENBQWhCO0FBQ0Q7OztnQ0FFVyxDLEVBQUU7QUFDWixXQUFLLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDRDs7Ozs7O2tCQXZGa0IsVTs7Ozs7Ozs7O0FDTnJCOzs7OztRQTRPZ0IsYSxHQUFBLGE7O0FBMU9oQjs7Ozs7O0FBRUEsSUFDRSwwQkFERjtJQUVFLGtCQUZGOztBQUtBLFNBQVMsU0FBVCxDQUFtQixNQUFuQixFQUEwQjtBQUN4QixNQUFJLEtBQUssT0FBTyxJQUFQLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBVDtBQUNBLE1BQUksU0FBUyxPQUFPLFNBQVAsRUFBYjs7QUFFQSxTQUFNO0FBQ0osVUFBTSxFQURGO0FBRUosY0FBVSxNQUZOO0FBR0osWUFBUSxPQUFPLElBQVAsQ0FBWSxNQUFaLEVBQW9CLEtBQXBCO0FBSEosR0FBTjtBQUtEOztBQUdELFNBQVMsU0FBVCxDQUFtQixNQUFuQixFQUEwQjtBQUN4QixNQUFJLFFBQVEsRUFBWjtBQUNBLE1BQUksTUFBSjtBQUNBLFFBQU0sU0FBTixHQUFrQixPQUFPLFVBQVAsRUFBbEI7QUFDQSxNQUFJLGdCQUFnQixPQUFPLFFBQVAsRUFBcEI7O0FBRUEsTUFBRyxDQUFDLGdCQUFnQixJQUFqQixLQUEwQixJQUE3QixFQUFrQzs7QUFFaEMsUUFBRyxpQkFBaUIsSUFBcEIsRUFBeUI7O0FBRXZCLFlBQU0sSUFBTixHQUFhLE1BQWI7QUFDQSxVQUFJLGNBQWMsT0FBTyxRQUFQLEVBQWxCO0FBQ0EsZUFBUyxPQUFPLFVBQVAsRUFBVDtBQUNBLGNBQU8sV0FBUDtBQUNFLGFBQUssSUFBTDtBQUNFLGdCQUFNLE9BQU4sR0FBZ0IsZ0JBQWhCO0FBQ0EsY0FBRyxXQUFXLENBQWQsRUFBZ0I7QUFDZCxrQkFBTSx3REFBd0QsTUFBOUQ7QUFDRDtBQUNELGdCQUFNLE1BQU4sR0FBZSxPQUFPLFNBQVAsRUFBZjtBQUNBLGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLE1BQWhCO0FBQ0EsZ0JBQU0sSUFBTixHQUFhLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBYjtBQUNBLGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLGlCQUFoQjtBQUNBLGdCQUFNLElBQU4sR0FBYSxPQUFPLElBQVAsQ0FBWSxNQUFaLENBQWI7QUFDQSxpQkFBTyxLQUFQO0FBQ0YsYUFBSyxJQUFMO0FBQ0UsZ0JBQU0sT0FBTixHQUFnQixXQUFoQjtBQUNBLGdCQUFNLElBQU4sR0FBYSxPQUFPLElBQVAsQ0FBWSxNQUFaLENBQWI7QUFDQSxzQkFBWSxNQUFNLElBQWxCO0FBQ0EsaUJBQU8sS0FBUDtBQUNGLGFBQUssSUFBTDtBQUNFLGdCQUFNLE9BQU4sR0FBZ0IsZ0JBQWhCO0FBQ0EsZ0JBQU0sSUFBTixHQUFhLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBYjtBQUNBLGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLFFBQWhCO0FBQ0EsZ0JBQU0sSUFBTixHQUFhLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBYjtBQUNBLGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLFFBQWhCO0FBQ0EsZ0JBQU0sSUFBTixHQUFhLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBYjtBQUNBLGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLFVBQWhCO0FBQ0EsZ0JBQU0sSUFBTixHQUFhLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBYjtBQUNBLGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLG1CQUFoQjtBQUNBLGNBQUcsV0FBVyxDQUFkLEVBQWdCO0FBQ2Qsa0JBQU0sMkRBQTJELE1BQWpFO0FBQ0Q7QUFDRCxnQkFBTSxPQUFOLEdBQWdCLE9BQU8sUUFBUCxFQUFoQjtBQUNBLGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLFlBQWhCO0FBQ0EsY0FBRyxXQUFXLENBQWQsRUFBZ0I7QUFDZCxrQkFBTSxvREFBb0QsTUFBMUQ7QUFDRDtBQUNELGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLFVBQWhCO0FBQ0EsY0FBRyxXQUFXLENBQWQsRUFBZ0I7QUFDZCxrQkFBTSxrREFBa0QsTUFBeEQ7QUFDRDtBQUNELGdCQUFNLG1CQUFOLEdBQ0UsQ0FBQyxPQUFPLFFBQVAsTUFBcUIsRUFBdEIsS0FDQyxPQUFPLFFBQVAsTUFBcUIsQ0FEdEIsSUFFQSxPQUFPLFFBQVAsRUFIRjtBQUtBLGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLGFBQWhCO0FBQ0EsY0FBRyxXQUFXLENBQWQsRUFBZ0I7QUFDZCxrQkFBTSxxREFBcUQsTUFBM0Q7QUFDRDtBQUNELGNBQUksV0FBVyxPQUFPLFFBQVAsRUFBZjtBQUNBLGdCQUFNLFNBQU4sR0FBaUI7QUFDZixrQkFBTSxFQURTLEVBQ0wsTUFBTSxFQURELEVBQ0ssTUFBTSxFQURYLEVBQ2UsTUFBTTtBQURyQixZQUVmLFdBQVcsSUFGSSxDQUFqQjtBQUdBLGdCQUFNLElBQU4sR0FBYSxXQUFXLElBQXhCO0FBQ0EsZ0JBQU0sR0FBTixHQUFZLE9BQU8sUUFBUCxFQUFaO0FBQ0EsZ0JBQU0sR0FBTixHQUFZLE9BQU8sUUFBUCxFQUFaO0FBQ0EsZ0JBQU0sS0FBTixHQUFjLE9BQU8sUUFBUCxFQUFkO0FBQ0EsZ0JBQU0sUUFBTixHQUFpQixPQUFPLFFBQVAsRUFBakI7QUFDQSxpQkFBTyxLQUFQO0FBQ0YsYUFBSyxJQUFMO0FBQ0UsZ0JBQU0sT0FBTixHQUFnQixlQUFoQjtBQUNBLGNBQUcsV0FBVyxDQUFkLEVBQWdCO0FBQ2Qsa0JBQU0sdURBQXVELE1BQTdEO0FBQ0Q7QUFDRCxnQkFBTSxTQUFOLEdBQWtCLE9BQU8sUUFBUCxFQUFsQjtBQUNBLGdCQUFNLFdBQU4sR0FBb0IsS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLE9BQU8sUUFBUCxFQUFaLENBQXBCO0FBQ0EsZ0JBQU0sU0FBTixHQUFrQixPQUFPLFFBQVAsRUFBbEI7QUFDQSxnQkFBTSxhQUFOLEdBQXNCLE9BQU8sUUFBUCxFQUF0QjtBQUNBLGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLGNBQWhCO0FBQ0EsY0FBRyxXQUFXLENBQWQsRUFBZ0I7QUFDZCxrQkFBTSxzREFBc0QsTUFBNUQ7QUFDRDtBQUNELGdCQUFNLEdBQU4sR0FBWSxPQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsQ0FBWjtBQUNBLGdCQUFNLEtBQU4sR0FBYyxPQUFPLFFBQVAsRUFBZDtBQUNBLGlCQUFPLEtBQVA7QUFDRixhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLG1CQUFoQjtBQUNBLGdCQUFNLElBQU4sR0FBYSxPQUFPLElBQVAsQ0FBWSxNQUFaLENBQWI7QUFDQSxpQkFBTyxLQUFQO0FBQ0Y7Ozs7QUFJRSxnQkFBTSxPQUFOLEdBQWdCLFNBQWhCO0FBQ0EsZ0JBQU0sSUFBTixHQUFhLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBYjtBQUNBLGlCQUFPLEtBQVA7QUF4R0o7QUEwR0EsWUFBTSxJQUFOLEdBQWEsT0FBTyxJQUFQLENBQVksTUFBWixDQUFiO0FBQ0EsYUFBTyxLQUFQO0FBQ0QsS0FqSEQsTUFpSE0sSUFBRyxpQkFBaUIsSUFBcEIsRUFBeUI7QUFDN0IsWUFBTSxJQUFOLEdBQWEsT0FBYjtBQUNBLGVBQVMsT0FBTyxVQUFQLEVBQVQ7QUFDQSxZQUFNLElBQU4sR0FBYSxPQUFPLElBQVAsQ0FBWSxNQUFaLENBQWI7QUFDQSxhQUFPLEtBQVA7QUFDRCxLQUxLLE1BS0EsSUFBRyxpQkFBaUIsSUFBcEIsRUFBeUI7QUFDN0IsWUFBTSxJQUFOLEdBQWEsY0FBYjtBQUNBLGVBQVMsT0FBTyxVQUFQLEVBQVQ7QUFDQSxZQUFNLElBQU4sR0FBYSxPQUFPLElBQVAsQ0FBWSxNQUFaLENBQWI7QUFDQSxhQUFPLEtBQVA7QUFDRCxLQUxLLE1BS0Q7QUFDSCxZQUFNLHdDQUF3QyxhQUE5QztBQUNEO0FBQ0YsR0FoSUQsTUFnSUs7O0FBRUgsUUFBSSxlQUFKO0FBQ0EsUUFBRyxDQUFDLGdCQUFnQixJQUFqQixNQUEyQixDQUE5QixFQUFnQzs7Ozs7QUFLOUIsZUFBUyxhQUFUO0FBQ0Esc0JBQWdCLGlCQUFoQjtBQUNELEtBUEQsTUFPSztBQUNILGVBQVMsT0FBTyxRQUFQLEVBQVQ7O0FBRUEsMEJBQW9CLGFBQXBCO0FBQ0Q7QUFDRCxRQUFJLFlBQVksaUJBQWlCLENBQWpDO0FBQ0EsVUFBTSxPQUFOLEdBQWdCLGdCQUFnQixJQUFoQztBQUNBLFVBQU0sSUFBTixHQUFhLFNBQWI7QUFDQSxZQUFRLFNBQVI7QUFDRSxXQUFLLElBQUw7QUFDRSxjQUFNLE9BQU4sR0FBZ0IsU0FBaEI7QUFDQSxjQUFNLFVBQU4sR0FBbUIsTUFBbkI7QUFDQSxjQUFNLFFBQU4sR0FBaUIsT0FBTyxRQUFQLEVBQWpCO0FBQ0EsZUFBTyxLQUFQO0FBQ0YsV0FBSyxJQUFMO0FBQ0UsY0FBTSxVQUFOLEdBQW1CLE1BQW5CO0FBQ0EsY0FBTSxRQUFOLEdBQWlCLE9BQU8sUUFBUCxFQUFqQjtBQUNBLFlBQUcsTUFBTSxRQUFOLEtBQW1CLENBQXRCLEVBQXdCO0FBQ3RCLGdCQUFNLE9BQU4sR0FBZ0IsU0FBaEI7QUFDRCxTQUZELE1BRUs7QUFDSCxnQkFBTSxPQUFOLEdBQWdCLFFBQWhCOztBQUVEO0FBQ0QsZUFBTyxLQUFQO0FBQ0YsV0FBSyxJQUFMO0FBQ0UsY0FBTSxPQUFOLEdBQWdCLGdCQUFoQjtBQUNBLGNBQU0sVUFBTixHQUFtQixNQUFuQjtBQUNBLGNBQU0sTUFBTixHQUFlLE9BQU8sUUFBUCxFQUFmO0FBQ0EsZUFBTyxLQUFQO0FBQ0YsV0FBSyxJQUFMO0FBQ0UsY0FBTSxPQUFOLEdBQWdCLFlBQWhCO0FBQ0EsY0FBTSxjQUFOLEdBQXVCLE1BQXZCO0FBQ0EsY0FBTSxLQUFOLEdBQWMsT0FBTyxRQUFQLEVBQWQ7QUFDQSxlQUFPLEtBQVA7QUFDRixXQUFLLElBQUw7QUFDRSxjQUFNLE9BQU4sR0FBZ0IsZUFBaEI7QUFDQSxjQUFNLGFBQU4sR0FBc0IsTUFBdEI7QUFDQSxlQUFPLEtBQVA7QUFDRixXQUFLLElBQUw7QUFDRSxjQUFNLE9BQU4sR0FBZ0IsbUJBQWhCO0FBQ0EsY0FBTSxNQUFOLEdBQWUsTUFBZjs7OztBQUlBLGVBQU8sS0FBUDtBQUNGLFdBQUssSUFBTDtBQUNFLGNBQU0sT0FBTixHQUFnQixXQUFoQjtBQUNBLGNBQU0sS0FBTixHQUFjLFVBQVUsT0FBTyxRQUFQLE1BQXFCLENBQS9CLENBQWQ7QUFDQSxlQUFPLEtBQVA7QUFDRjs7Ozs7O0FBTUUsY0FBTSxLQUFOLEdBQWMsT0FBTyxRQUFQLEVBQWQ7QUFDQSxjQUFNLE9BQU4sR0FBZ0IsU0FBaEI7Ozs7Ozs7OztBQVNBLGVBQU8sS0FBUDtBQXpESjtBQTJERDtBQUNGOztBQUdNLFNBQVMsYUFBVCxDQUF1QixNQUF2QixFQUE4QjtBQUNuQyxNQUFHLGtCQUFrQixVQUFsQixLQUFpQyxLQUFqQyxJQUEwQyxrQkFBa0IsV0FBbEIsS0FBa0MsS0FBL0UsRUFBcUY7QUFDbkYsWUFBUSxLQUFSLENBQWMsMkRBQWQ7QUFDQTtBQUNEO0FBQ0QsTUFBRyxrQkFBa0IsV0FBckIsRUFBaUM7QUFDL0IsYUFBUyxJQUFJLFVBQUosQ0FBZSxNQUFmLENBQVQ7QUFDRDtBQUNELE1BQUksU0FBUyxJQUFJLEdBQUosRUFBYjtBQUNBLE1BQUksU0FBUywwQkFBZSxNQUFmLENBQWI7O0FBRUEsTUFBSSxjQUFjLFVBQVUsTUFBVixDQUFsQjtBQUNBLE1BQUcsWUFBWSxFQUFaLEtBQW1CLE1BQW5CLElBQTZCLFlBQVksTUFBWixLQUF1QixDQUF2RCxFQUF5RDtBQUN2RCxVQUFNLGtDQUFOO0FBQ0Q7O0FBRUQsTUFBSSxlQUFlLDBCQUFlLFlBQVksSUFBM0IsQ0FBbkI7QUFDQSxNQUFJLGFBQWEsYUFBYSxTQUFiLEVBQWpCO0FBQ0EsTUFBSSxhQUFhLGFBQWEsU0FBYixFQUFqQjtBQUNBLE1BQUksZUFBZSxhQUFhLFNBQWIsRUFBbkI7O0FBRUEsTUFBRyxlQUFlLE1BQWxCLEVBQXlCO0FBQ3ZCLFVBQU0sK0RBQU47QUFDRDs7QUFFRCxNQUFJLFNBQVE7QUFDVixrQkFBYyxVQURKO0FBRVYsa0JBQWMsVUFGSjtBQUdWLG9CQUFnQjtBQUhOLEdBQVo7O0FBTUEsT0FBSSxJQUFJLElBQUksQ0FBWixFQUFlLElBQUksVUFBbkIsRUFBK0IsR0FBL0IsRUFBbUM7QUFDakMsZ0JBQVksV0FBVyxDQUF2QjtBQUNBLFFBQUksUUFBUSxFQUFaO0FBQ0EsUUFBSSxhQUFhLFVBQVUsTUFBVixDQUFqQjtBQUNBLFFBQUcsV0FBVyxFQUFYLEtBQWtCLE1BQXJCLEVBQTRCO0FBQzFCLFlBQU0sMkNBQTBDLFdBQVcsRUFBM0Q7QUFDRDtBQUNELFFBQUksY0FBYywwQkFBZSxXQUFXLElBQTFCLENBQWxCO0FBQ0EsV0FBTSxDQUFDLFlBQVksR0FBWixFQUFQLEVBQXlCO0FBQ3ZCLFVBQUksUUFBUSxVQUFVLFdBQVYsQ0FBWjtBQUNBLFlBQU0sSUFBTixDQUFXLEtBQVg7QUFDRDtBQUNELFdBQU8sR0FBUCxDQUFXLFNBQVgsRUFBc0IsS0FBdEI7QUFDRDs7QUFFRCxTQUFNO0FBQ0osY0FBVSxNQUROO0FBRUosY0FBVTtBQUZOLEdBQU47QUFJRDs7Ozs7Ozs7Ozs7Ozs7QUN6UkQ7Ozs7O1FBb0NnQixVLEdBQUEsVTtRQW1QQSxhLEdBQUEsYTtRQVNBLFcsR0FBQSxXO1FBU0EsYSxHQUFBLGE7UUFTQSxlLEdBQUEsZTtRQVNBLFksR0FBQSxZO1FBU0EsVSxHQUFBLFU7O0FBbFVoQjs7QUFFQSxJQUNFLGlCQURGO0lBRUUsbUJBRkY7SUFHRSxNQUFNLEtBQUssR0FIYjtJQUlFLFFBQVEsS0FBSyxLQUpmOztBQU1BLElBQU0sWUFBWTtBQUNoQixXQUFVLENBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCLElBQWpCLEVBQXVCLEdBQXZCLEVBQTRCLEdBQTVCLEVBQWlDLElBQWpDLEVBQXVDLEdBQXZDLEVBQTRDLElBQTVDLEVBQWtELEdBQWxELEVBQXVELElBQXZELEVBQTZELEdBQTdELENBRE07QUFFaEIsVUFBUyxDQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksR0FBWixFQUFpQixJQUFqQixFQUF1QixHQUF2QixFQUE0QixHQUE1QixFQUFpQyxJQUFqQyxFQUF1QyxHQUF2QyxFQUE0QyxJQUE1QyxFQUFrRCxHQUFsRCxFQUF1RCxJQUF2RCxFQUE2RCxHQUE3RCxDQUZPO0FBR2hCLHNCQUFxQixDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsS0FBYixFQUFvQixJQUFwQixFQUEwQixLQUExQixFQUFpQyxJQUFqQyxFQUF1QyxJQUF2QyxFQUE2QyxLQUE3QyxFQUFvRCxJQUFwRCxFQUEwRCxLQUExRCxFQUFpRSxJQUFqRSxFQUF1RSxLQUF2RSxDQUhMO0FBSWhCLHFCQUFvQixDQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsS0FBZCxFQUFxQixJQUFyQixFQUEyQixJQUEzQixFQUFpQyxLQUFqQyxFQUF3QyxJQUF4QyxFQUE4QyxLQUE5QyxFQUFxRCxJQUFyRCxFQUEyRCxLQUEzRCxFQUFrRSxJQUFsRSxFQUF3RSxJQUF4RTtBQUpKLENBQWxCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBCTyxTQUFTLFVBQVQsR0FBNEI7QUFDakMsTUFDRSxVQUFVLFVBQUssTUFEakI7TUFFRSxhQUZGO01BR0UsZUFIRjtNQUlFLGlCQUpGO01BS0UsbUJBTEY7TUFNRSxxQkFORjtNQU9FLHVEQVBGO01BUUUsdURBUkY7TUFTRSx1REFURjtNQVVFLFFBQVEsc0JBQVcsSUFBWCxDQVZWO01BV0UsUUFBUSxzQkFBVyxJQUFYLENBWFY7TUFZRSxRQUFRLHNCQUFXLElBQVgsQ0FaVjs7QUFjQSxhQUFXLEVBQVg7QUFDQSxlQUFhLEVBQWI7Ozs7QUFJQSxNQUFHLFlBQVksQ0FBWixJQUFpQixVQUFVLFFBQTlCLEVBQXVDO0FBQ3JDLFFBQUcsT0FBTyxDQUFQLElBQVksT0FBTyxHQUF0QixFQUEwQjtBQUN4QixpQkFBVyxrREFBbUQsSUFBOUQ7QUFDRCxLQUZELE1BRUs7QUFDSCxtQkFBYSxJQUFiO0FBQ0EsYUFBTyxhQUFhLFVBQWIsQ0FBUDtBQUNBLGlCQUFXLEtBQUssQ0FBTCxDQUFYO0FBQ0EsZUFBUyxLQUFLLENBQUwsQ0FBVDtBQUNEOzs7QUFJRixHQVpELE1BWU0sSUFBRyxZQUFZLENBQVosSUFBaUIsVUFBVSxRQUE5QixFQUF1QztBQUMzQyxhQUFPLGVBQWUsSUFBZixDQUFQO0FBQ0EsVUFBRyxhQUFhLEVBQWhCLEVBQW1CO0FBQ2pCLG1CQUFXLEtBQUssQ0FBTCxDQUFYO0FBQ0EsaUJBQVMsS0FBSyxDQUFMLENBQVQ7QUFDQSxxQkFBYSxlQUFlLFFBQWYsRUFBeUIsTUFBekIsQ0FBYjtBQUNEOzs7QUFHRixLQVRLLE1BU0EsSUFBRyxZQUFZLENBQVosSUFBaUIsVUFBVSxRQUEzQixJQUF1QyxVQUFVLFFBQXBELEVBQTZEO0FBQ2pFLGVBQU8sZUFBZSxJQUFmLEVBQXFCLElBQXJCLENBQVA7QUFDQSxZQUFHLGFBQWEsRUFBaEIsRUFBbUI7QUFDakIscUJBQVcsS0FBSyxDQUFMLENBQVg7QUFDQSxtQkFBUyxLQUFLLENBQUwsQ0FBVDtBQUNBLHVCQUFhLGVBQWUsUUFBZixFQUF5QixNQUF6QixDQUFiO0FBQ0Q7OztBQUdGLE9BVEssTUFTQSxJQUFHLFlBQVksQ0FBWixJQUFpQixVQUFVLFFBQTNCLElBQXVDLFVBQVUsUUFBcEQsRUFBNkQ7QUFDakUsaUJBQU8sZUFBZSxJQUFmLENBQVA7QUFDQSxjQUFHLGFBQWEsRUFBaEIsRUFBbUI7QUFDakIsMkJBQWUsbUJBQW1CLElBQW5CLENBQWY7QUFDQSx1QkFBVyxLQUFLLENBQUwsQ0FBWDtBQUNBLHFCQUFTLEtBQUssQ0FBTCxDQUFUO0FBQ0EseUJBQWEsZUFBZSxRQUFmLEVBQXlCLE1BQXpCLENBQWI7QUFDRDs7O0FBSUYsU0FYSyxNQVdBLElBQUcsWUFBWSxDQUFaLElBQWlCLHNCQUFXLElBQVgsTUFBcUIsUUFBdEMsSUFBa0Qsc0JBQVcsSUFBWCxNQUFxQixRQUExRSxFQUFtRjtBQUN2RixnQkFBRyxPQUFPLENBQVAsSUFBWSxPQUFPLEdBQXRCLEVBQTBCO0FBQ3hCLHlCQUFXLGtEQUFrRCxJQUE3RDtBQUNELGFBRkQsTUFFSztBQUNILDZCQUFlLG1CQUFtQixJQUFuQixDQUFmO0FBQ0EsMkJBQWEsSUFBYjtBQUNBLHFCQUFPLGFBQWEsVUFBYixFQUF5QixZQUF6QixDQUFQO0FBQ0EseUJBQVcsS0FBSyxDQUFMLENBQVg7QUFDQSx1QkFBUyxLQUFLLENBQUwsQ0FBVDtBQUNEOzs7QUFJRixXQWJLLE1BYUEsSUFBRyxZQUFZLENBQVosSUFBaUIsVUFBVSxRQUEzQixJQUF1QyxVQUFVLFFBQWpELElBQTZELFVBQVUsUUFBMUUsRUFBbUY7QUFDdkYscUJBQU8sZUFBZSxJQUFmLEVBQXFCLElBQXJCLENBQVA7QUFDQSxrQkFBRyxhQUFhLEVBQWhCLEVBQW1CO0FBQ2pCLCtCQUFlLG1CQUFtQixJQUFuQixDQUFmO0FBQ0EsMkJBQVcsS0FBSyxDQUFMLENBQVg7QUFDQSx5QkFBUyxLQUFLLENBQUwsQ0FBVDtBQUNBLDZCQUFhLGVBQWUsUUFBZixFQUF3QixNQUF4QixDQUFiO0FBQ0Q7QUFFRixhQVRLLE1BU0Q7QUFDSCx5QkFBVywrQ0FBWDtBQUNEOztBQUVELE1BQUcsUUFBSCxFQUFZO0FBQ1YsWUFBUSxLQUFSLENBQWMsUUFBZDtBQUNBLFdBQU8sS0FBUDtBQUNEOztBQUVELE1BQUcsVUFBSCxFQUFjO0FBQ1osWUFBUSxJQUFSLENBQWEsVUFBYjtBQUNEOztBQUVELE1BQUksT0FBTztBQUNULFVBQU0sUUFERztBQUVULFlBQVEsTUFGQztBQUdULGNBQVUsV0FBVyxNQUhaO0FBSVQsWUFBUSxVQUpDO0FBS1QsZUFBVyxjQUFjLFVBQWQsQ0FMRjtBQU1ULGNBQVUsWUFBWSxVQUFaO0FBTkQsR0FBWDtBQVFBLFNBQU8sTUFBUCxDQUFjLElBQWQ7QUFDQSxTQUFPLElBQVA7QUFDRDs7O0FBSUQsU0FBUyxZQUFULENBQXNCLE1BQXRCLEVBQThDO0FBQUEsTUFBaEIsSUFBZ0IseURBQVQsT0FBUzs7O0FBRTVDLE1BQUksU0FBUyxNQUFPLFNBQVMsRUFBVixHQUFnQixDQUF0QixDQUFiO0FBQ0EsTUFBSSxXQUFXLFVBQVUsSUFBVixFQUFnQixTQUFTLEVBQXpCLENBQWY7QUFDQSxTQUFPLENBQUMsUUFBRCxFQUFXLE1BQVgsQ0FBUDtBQUNEOztBQUdELFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixNQUE5QixFQUFzQztBQUNwQyxNQUFJLE9BQU8sT0FBTyxJQUFQLENBQVksU0FBWixDQUFYO0FBQ0EsTUFBSSxjQUFKOztBQUZvQztBQUFBO0FBQUE7O0FBQUE7QUFJcEMseUJBQWUsSUFBZiw4SEFBb0I7QUFBQSxVQUFaLEdBQVk7O0FBQ2xCLFVBQUksT0FBTyxVQUFVLEdBQVYsQ0FBWDtBQUNBLGNBQVEsS0FBSyxTQUFMLENBQWU7QUFBQSxlQUFLLE1BQU0sSUFBWDtBQUFBLE9BQWYsQ0FBUjtBQUNBLFVBQUcsVUFBVSxDQUFDLENBQWQsRUFBZ0I7QUFDZDtBQUNEO0FBQ0Y7OztBQVZtQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWFwQyxNQUFJLFNBQVUsUUFBUSxFQUFULEdBQWdCLFNBQVMsRUFBdEMsQzs7QUFFQSxNQUFHLFNBQVMsQ0FBVCxJQUFjLFNBQVMsR0FBMUIsRUFBOEI7QUFDNUIsZUFBVywwQ0FBWDtBQUNBO0FBQ0Q7QUFDRCxTQUFPLE1BQVA7QUFDRDs7QUFHRCxTQUFTLGFBQVQsQ0FBdUIsTUFBdkIsRUFBOEI7O0FBRTVCLFNBQU8sTUFBTSxJQUFJLENBQUosRUFBTSxDQUFDLFNBQVMsRUFBVixJQUFjLEVBQXBCLENBQWIsQztBQUNEOzs7QUFJRCxTQUFTLFNBQVQsQ0FBbUIsS0FBbkIsRUFBeUI7O0FBRXhCOztBQUdELFNBQVMsa0JBQVQsQ0FBNEIsSUFBNUIsRUFBaUM7QUFDL0IsTUFBSSxPQUFPLE9BQU8sSUFBUCxDQUFZLFNBQVosQ0FBWDtBQUNBLE1BQUksU0FBUyxLQUFLLElBQUwsQ0FBVTtBQUFBLFdBQUssTUFBTSxJQUFYO0FBQUEsR0FBVixNQUErQixTQUE1QztBQUNBLE1BQUcsV0FBVyxLQUFkLEVBQW9COztBQUVsQixXQUFPLE9BQVA7QUFDQSxpQkFBYSxPQUFPLHlDQUFQLEdBQW1ELElBQW5ELEdBQTBELFdBQXZFO0FBQ0Q7QUFDRCxTQUFPLElBQVA7QUFDRDs7QUFHRCxTQUFTLGNBQVQsR0FBZ0M7QUFDOUIsTUFDRSxVQUFVLFVBQUssTUFEakI7TUFFRSx1REFGRjtNQUdFLHVEQUhGO01BSUUsYUFKRjtNQUtFLE9BQU8sRUFMVDtNQU1FLFNBQVMsRUFOWDs7O0FBU0EsTUFBRyxZQUFZLENBQWYsRUFBaUI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDZiw0QkFBWSxJQUFaLG1JQUFpQjtBQUFiLFlBQWE7O0FBQ2YsWUFBRyxNQUFNLElBQU4sS0FBZSxTQUFTLEdBQTNCLEVBQStCO0FBQzdCLGtCQUFRLElBQVI7QUFDRCxTQUZELE1BRUs7QUFDSCxvQkFBVSxJQUFWO0FBQ0Q7QUFDRjtBQVBjO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBUWYsUUFBRyxXQUFXLEVBQWQsRUFBaUI7QUFDZixlQUFTLENBQVQ7QUFDRDtBQUNGLEdBWEQsTUFXTSxJQUFHLFlBQVksQ0FBZixFQUFpQjtBQUNyQixXQUFPLElBQVA7QUFDQSxhQUFTLElBQVQ7QUFDRDs7O0FBR0QsTUFBSSxPQUFPLE9BQU8sSUFBUCxDQUFZLFNBQVosQ0FBWDtBQUNBLE1BQUksUUFBUSxDQUFDLENBQWI7O0FBNUI4QjtBQUFBO0FBQUE7O0FBQUE7QUE4QjlCLDBCQUFlLElBQWYsbUlBQW9CO0FBQUEsVUFBWixHQUFZOztBQUNsQixVQUFJLE9BQU8sVUFBVSxHQUFWLENBQVg7QUFDQSxjQUFRLEtBQUssU0FBTCxDQUFlO0FBQUEsZUFBSyxNQUFNLElBQVg7QUFBQSxPQUFmLENBQVI7QUFDQSxVQUFHLFVBQVUsQ0FBQyxDQUFkLEVBQWdCO0FBQ2Q7QUFDRDtBQUNGO0FBcEM2QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXNDOUIsTUFBRyxVQUFVLENBQUMsQ0FBZCxFQUFnQjtBQUNkLGVBQVcsT0FBTyw2SUFBbEI7QUFDQTtBQUNEOztBQUVELE1BQUcsU0FBUyxDQUFDLENBQVYsSUFBZSxTQUFTLENBQTNCLEVBQTZCO0FBQzNCLGVBQVcsMkNBQVg7QUFDQTtBQUNEOztBQUVELFdBQVMsU0FBUyxNQUFULEVBQWlCLEVBQWpCLENBQVQ7QUFDQSxTQUFPLEtBQUssU0FBTCxDQUFlLENBQWYsRUFBa0IsQ0FBbEIsRUFBcUIsV0FBckIsS0FBcUMsS0FBSyxTQUFMLENBQWUsQ0FBZixDQUE1Qzs7O0FBR0EsU0FBTyxDQUFDLElBQUQsRUFBTyxNQUFQLENBQVA7QUFDRDs7QUFJRCxTQUFTLFdBQVQsQ0FBcUIsVUFBckIsRUFBZ0M7QUFDOUIsTUFBSSxjQUFKOztBQUVBLFVBQU8sSUFBUDtBQUNFLFNBQUssYUFBYSxFQUFiLEtBQW9CLENBQXpCLEM7QUFDQSxTQUFLLGFBQWEsRUFBYixLQUFvQixDQUF6QixDO0FBQ0EsU0FBSyxhQUFhLEVBQWIsS0FBb0IsQ0FBekIsQztBQUNBLFNBQUssYUFBYSxFQUFiLEtBQW9CLENBQXpCLEM7QUFDQSxTQUFLLGFBQWEsRUFBYixLQUFvQixFQUF6Qjs7QUFDRSxjQUFRLElBQVI7QUFDQTtBQUNGO0FBQ0UsY0FBUSxLQUFSO0FBVEo7O0FBWUEsU0FBTyxLQUFQO0FBQ0Q7O0FBS00sU0FBUyxhQUFULEdBQStCO0FBQ3BDLE1BQUksT0FBTyxzQ0FBWDtBQUNBLE1BQUcsSUFBSCxFQUFRO0FBQ04sV0FBTyxLQUFLLE1BQVo7QUFDRDtBQUNELFNBQU8sUUFBUDtBQUNEOztBQUdNLFNBQVMsV0FBVCxHQUE2QjtBQUNsQyxNQUFJLE9BQU8sc0NBQVg7QUFDQSxNQUFHLElBQUgsRUFBUTtBQUNOLFdBQU8sS0FBSyxJQUFaO0FBQ0Q7QUFDRCxTQUFPLEtBQVA7QUFDRDs7QUFHTSxTQUFTLGFBQVQsR0FBK0I7QUFDcEMsTUFBSSxPQUFPLHNDQUFYO0FBQ0EsTUFBRyxJQUFILEVBQVE7QUFDTixXQUFPLEtBQUssTUFBWjtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0Q7O0FBR00sU0FBUyxlQUFULEdBQWlDO0FBQ3RDLE1BQUksT0FBTyxzQ0FBWDtBQUNBLE1BQUcsSUFBSCxFQUFRO0FBQ04sV0FBTyxLQUFLLFFBQVo7QUFDRDtBQUNELFNBQU8sS0FBUDtBQUNEOztBQUdNLFNBQVMsWUFBVCxHQUE4QjtBQUNuQyxNQUFJLE9BQU8sc0NBQVg7QUFDQSxNQUFHLElBQUgsRUFBUTtBQUNOLFdBQU8sS0FBSyxTQUFaO0FBQ0Q7QUFDRCxTQUFPLEtBQVA7QUFDRDs7QUFHTSxTQUFTLFVBQVQsR0FBNEI7QUFDakMsTUFBSSxPQUFPLHNDQUFYO0FBQ0EsTUFBRyxJQUFILEVBQVE7QUFDTixXQUFPLEtBQUssUUFBWjtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0Q7Ozs7Ozs7Ozs7O1FDaFZlLFksR0FBQSxZO1FBMEZBLGEsR0FBQSxhO1FBb0NBLFksR0FBQSxZOztBQW5JaEI7O0FBQ0E7O0FBQ0E7Ozs7OztBQUdPLFNBQVMsWUFBVCxDQUFzQixNQUF0QixFQUE4QixFQUE5QixFQUFrQyxLQUFsQyxFQUF3QztBQUM3QyxTQUFPLElBQUksT0FBSixDQUFZLFVBQVMsT0FBVCxFQUFpQjtBQUNsQyxRQUFHO0FBQ0QsMEJBQVEsZUFBUixDQUF3QixNQUF4QixFQUVFLFNBQVMsU0FBVCxDQUFtQixNQUFuQixFQUEwQjs7QUFFeEIsWUFBRyxPQUFPLEVBQVAsS0FBYyxXQUFqQixFQUE2QjtBQUMzQixrQkFBUSxFQUFDLE1BQUQsRUFBSyxjQUFMLEVBQVI7QUFDQSxjQUFHLEtBQUgsRUFBUztBQUNQLGtCQUFNLEVBQUMsTUFBRCxFQUFLLGNBQUwsRUFBTjtBQUNEO0FBQ0YsU0FMRCxNQUtLO0FBQ0gsa0JBQVEsTUFBUjtBQUNBLGNBQUcsS0FBSCxFQUFTO0FBQ1Asa0JBQU0sTUFBTjtBQUNEO0FBQ0Y7QUFDRixPQWZILEVBaUJFLFNBQVMsT0FBVCxDQUFpQixDQUFqQixFQUFtQjtBQUNqQixnQkFBUSwwQkFBUixFQUFvQyxFQUFwQyxFQUF3QyxDQUF4Qzs7QUFFQSxZQUFHLE9BQU8sRUFBUCxLQUFjLFdBQWpCLEVBQTZCO0FBQzNCLGtCQUFRLEVBQUMsTUFBRCxFQUFSO0FBQ0QsU0FGRCxNQUVLO0FBQ0g7QUFDRDtBQUNGLE9BekJIO0FBMkJELEtBNUJELENBNEJDLE9BQU0sQ0FBTixFQUFRO0FBQ1AsY0FBUSxJQUFSLENBQWEsMEJBQWIsRUFBeUMsRUFBekMsRUFBNkMsQ0FBN0M7QUFDQSxVQUFHLE9BQU8sRUFBUCxLQUFjLFdBQWpCLEVBQTZCO0FBQzNCLGdCQUFRLEVBQUMsTUFBRCxFQUFSO0FBQ0QsT0FGRCxNQUVLO0FBQ0g7QUFDRDtBQUNGO0FBQ0YsR0FyQ00sQ0FBUDtBQXNDRDs7QUFHRCxTQUFTLGtCQUFULENBQTRCLEdBQTVCLEVBQWlDLEVBQWpDLEVBQXFDLEtBQXJDLEVBQTJDOztBQUV6QyxNQUFJLFdBQVcsU0FBWCxRQUFXLENBQVMsT0FBVCxFQUFpQjtBQUM5QixtQ0FBTSxPQUFPLEdBQVAsQ0FBTixFQUFtQjtBQUNqQixjQUFRO0FBRFMsS0FBbkIsRUFFRyxJQUZILENBR0UsVUFBUyxRQUFULEVBQWtCO0FBQ2hCLFVBQUcsU0FBUyxFQUFaLEVBQWU7QUFDYixpQkFBUyxXQUFULEdBQXVCLElBQXZCLENBQTRCLFVBQVMsSUFBVCxFQUFjOztBQUV4Qyx1QkFBYSxJQUFiLEVBQW1CLEVBQW5CLEVBQXVCLEtBQXZCLEVBQThCLElBQTlCLENBQW1DLE9BQW5DO0FBQ0QsU0FIRDtBQUlELE9BTEQsTUFLTSxJQUFHLE9BQU8sRUFBUCxLQUFjLFdBQWpCLEVBQTZCO0FBQ2pDLGdCQUFRLEVBQUMsTUFBRCxFQUFSO0FBQ0QsT0FGSyxNQUVEO0FBQ0g7QUFDRDtBQUNGLEtBZEg7QUFnQkQsR0FqQkQ7QUFrQkEsU0FBTyxJQUFJLE9BQUosQ0FBWSxRQUFaLENBQVA7QUFDRDs7QUFHRCxTQUFTLFdBQVQsQ0FBcUIsUUFBckIsRUFBK0IsTUFBL0IsRUFBdUMsR0FBdkMsRUFBNEMsS0FBNUMsRUFBa0Q7O0FBRWhELE1BQU0sWUFBWSxTQUFaLFNBQVksR0FBVTs7QUFFMUIsUUFBRyxrQkFBa0IsV0FBckIsRUFBaUM7QUFDL0IsZUFBUyxJQUFULENBQWMsYUFBYSxNQUFiLEVBQXFCLEdBQXJCLEVBQTBCLEtBQTFCLENBQWQ7QUFDRCxLQUZELE1BRU0sSUFBRyxPQUFPLE1BQVAsS0FBa0IsUUFBckIsRUFBOEI7QUFDbEMsVUFBRyx5QkFBYyxNQUFkLENBQUgsRUFBeUI7QUFDdkIsaUJBQVMsSUFBVCxDQUFjLGFBQWEsMEJBQWUsTUFBZixDQUFiLEVBQXFDLEdBQXJDLEVBQTBDLEtBQTFDLENBQWQ7QUFDRCxPQUZELE1BRUs7QUFDSCxpQkFBUyxJQUFULENBQWMsbUJBQW1CLE1BQW5CLEVBQTJCLEdBQTNCLEVBQWdDLEtBQWhDLENBQWQ7QUFDRDtBQUNGLEtBTkssTUFNQSxJQUFHLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQXJCLEVBQThCO0FBQ2xDLGVBQVMsT0FBTyxNQUFQLElBQWlCLE9BQU8sTUFBeEIsSUFBa0MsT0FBTyxNQUF6QyxJQUFtRCxPQUFPLEdBQW5FO0FBQ0EsZ0JBQVUsUUFBVixFQUFvQixNQUFwQixFQUE0QixHQUE1QixFQUFpQyxLQUFqQzs7QUFFRDtBQUNGLEdBZkQ7O0FBaUJBO0FBQ0Q7OztBQUlNLFNBQVMsYUFBVCxDQUF1QixPQUF2QixFQUE4QztBQUFBLE1BQWQsS0FBYyx5REFBTixLQUFNOztBQUNuRCxNQUFJLE9BQU8sc0JBQVcsT0FBWCxDQUFYO01BQ0UsV0FBVyxFQURiOztBQUdBLFVBQVEsT0FBTyxLQUFQLEtBQWlCLFVBQWpCLEdBQThCLEtBQTlCLEdBQXNDLEtBQTlDOztBQUVBLE1BQUcsU0FBUyxRQUFaLEVBQXFCO0FBQ25CLFdBQU8sSUFBUCxDQUFZLE9BQVosRUFBcUIsT0FBckIsQ0FBNkIsVUFBUyxHQUFULEVBQWE7O0FBRXhDLGtCQUFZLFFBQVosRUFBc0IsUUFBUSxHQUFSLENBQXRCLEVBQW9DLEdBQXBDLEVBQXlDLEtBQXpDO0FBQ0QsS0FIRDtBQUlELEdBTEQsTUFLTSxJQUFHLFNBQVMsT0FBWixFQUFvQjtBQUFBO0FBQ3hCLFVBQUksWUFBSjtBQUNBLGNBQVEsT0FBUixDQUFnQixVQUFTLE1BQVQsRUFBZ0I7O0FBRTlCLG9CQUFZLFFBQVosRUFBc0IsTUFBdEIsRUFBOEIsR0FBOUIsRUFBbUMsS0FBbkM7QUFDRCxPQUhEO0FBRndCO0FBTXpCOztBQUVELFNBQU8sSUFBSSxPQUFKLENBQVksVUFBUyxPQUFULEVBQWlCO0FBQ2xDLFlBQVEsR0FBUixDQUFZLFFBQVosRUFDQyxJQURELENBQ00sVUFBQyxNQUFELEVBQVk7QUFDaEIsVUFBRyxTQUFTLFFBQVosRUFBcUI7QUFDbkIsa0JBQVUsRUFBVjtBQUNBLGVBQU8sT0FBUCxDQUFlLFVBQVMsS0FBVCxFQUFlO0FBQzVCLGtCQUFRLE1BQU0sRUFBZCxJQUFvQixNQUFNLE1BQTFCO0FBQ0QsU0FGRDtBQUdBLGdCQUFRLE9BQVI7QUFDRCxPQU5ELE1BTU0sSUFBRyxTQUFTLE9BQVosRUFBb0I7QUFDeEIsZ0JBQVEsTUFBUjtBQUNEO0FBQ0YsS0FYRDtBQVlELEdBYk0sQ0FBUDtBQWNEOztBQUdNLFNBQVMsWUFBVCxHQUE4QjtBQUFBLG9DQUFMLElBQUs7QUFBTCxRQUFLO0FBQUE7O0FBQ25DLE1BQUcsS0FBSyxNQUFMLEtBQWdCLENBQWhCLElBQXFCLHNCQUFXLEtBQUssQ0FBTCxDQUFYLE1BQXdCLFFBQWhELEVBQXlEO0FBQ3ZELFdBQU8sY0FBYyxLQUFLLENBQUwsQ0FBZCxDQUFQO0FBQ0Q7QUFDRCxTQUFPLGNBQWMsSUFBZCxDQUFQO0FBQ0Q7Ozs7Ozs7O1FDN0RlLGUsR0FBQSxlO1FBMERBLFcsR0FBQSxXO1FBMExBLGMsR0FBQSxjO1FBK0NBLFksR0FBQSxZOztBQTlXaEI7O0FBQ0E7O0FBRUEsSUFDRSxZQURGO0lBRUUsWUFGRjtJQUdFLGVBSEY7SUFJRSxrQkFKRjtJQUtFLG9CQUxGO0lBTUUsc0JBTkY7SUFRRSxZQVJGO0lBU0UsYUFURjtJQVVFLGtCQVZGO0lBV0UsYUFYRjtJQVlFLGNBWkY7SUFhRSxlQWJGO0lBZUUsc0JBZkY7SUFnQkUsdUJBaEJGO0lBa0JFLHFCQWxCRjtJQW1CRSxvQkFuQkY7SUFvQkUsMEJBcEJGO0lBcUJFLHFCQXJCRjtJQXVCRSxrQkF2QkY7OztBQTBCQSxTQUFTLGVBQVQsR0FBMEI7QUFDeEIsbUJBQWtCLElBQUksYUFBSixHQUFvQixFQUFyQixHQUEyQixHQUEzQixHQUFpQyxHQUFsRDtBQUNBLGtCQUFnQixpQkFBaUIsSUFBakM7OztBQUdEOztBQUdELFNBQVMsZUFBVCxHQUEwQjtBQUN4QixXQUFVLElBQUksV0FBZDtBQUNBLGlCQUFlLFNBQVMsQ0FBeEI7QUFDQSxpQkFBZSxNQUFNLE1BQXJCO0FBQ0EsZ0JBQWMsZUFBZSxTQUE3QjtBQUNBLHNCQUFvQixNQUFNLENBQTFCOztBQUVEOztBQUdELFNBQVMsY0FBVCxDQUF3QixLQUF4QixFQUE0QztBQUFBLE1BQWIsSUFBYSx5REFBTixLQUFNOztBQUMxQyxjQUFZLE1BQU0sS0FBTixHQUFjLEtBQTFCOzs7O0FBSUEsVUFBUSxTQUFSO0FBQ0EsVUFBUSxNQUFNLEtBQWQ7OztBQUdBLFlBQVUsWUFBWSxhQUF0Qjs7QUFFQSxNQUFHLFNBQVMsS0FBWixFQUFrQjtBQUNoQixXQUFNLFFBQVEsaUJBQWQsRUFBZ0M7QUFDOUI7QUFDQSxjQUFRLGlCQUFSO0FBQ0EsYUFBTSxZQUFZLFlBQWxCLEVBQStCO0FBQzdCLHFCQUFhLFlBQWI7QUFDQTtBQUNBLGVBQU0sT0FBTyxTQUFiLEVBQXVCO0FBQ3JCLGtCQUFRLFNBQVI7QUFDQTtBQUNEO0FBQ0Y7QUFDRjtBQUNGO0FBQ0Y7O0FBR00sU0FBUyxlQUFULENBQXlCLFFBQXpCLEVBQW1DLFVBQW5DLEVBQWlFO0FBQUEsTUFBbEIsU0FBa0IseURBQU4sS0FBTTs7O0FBRXRFLE1BQUksYUFBSjtBQUNBLE1BQUksY0FBSjs7QUFFQSxRQUFNLFNBQVMsR0FBZjtBQUNBLFFBQU0sU0FBUyxHQUFmO0FBQ0EsY0FBWSxTQUFTLFNBQXJCO0FBQ0EsZ0JBQWMsU0FBUyxXQUF2QjtBQUNBLGtCQUFnQixTQUFTLGFBQXpCO0FBQ0EsUUFBTSxDQUFOO0FBQ0EsU0FBTyxDQUFQO0FBQ0EsY0FBWSxDQUFaO0FBQ0EsU0FBTyxDQUFQO0FBQ0EsVUFBUSxDQUFSO0FBQ0EsV0FBUyxDQUFUOztBQUVBO0FBQ0E7O0FBRUEsYUFBVyxJQUFYLENBQWdCLFVBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxXQUFXLEVBQUUsS0FBRixJQUFXLEVBQUUsS0FBZCxHQUF1QixDQUFDLENBQXhCLEdBQTRCLENBQXRDO0FBQUEsR0FBaEI7QUFDQSxNQUFJLElBQUksQ0FBUjtBQXJCc0U7QUFBQTtBQUFBOztBQUFBO0FBc0J0RSx5QkFBYSxVQUFiLDhIQUF3QjtBQUFwQixXQUFvQjs7OztBQUd0QixhQUFPLE1BQU0sSUFBYjtBQUNBLHFCQUFlLEtBQWYsRUFBc0IsU0FBdEI7O0FBRUEsY0FBTyxJQUFQOztBQUVFLGFBQUssSUFBTDtBQUNFLGdCQUFNLE1BQU0sS0FBWjs7QUFFQTtBQUNBOztBQUVGLGFBQUssSUFBTDtBQUNFLHNCQUFZLE1BQU0sS0FBbEI7QUFDQSx3QkFBYyxNQUFNLEtBQXBCO0FBQ0E7QUFDQTs7QUFFRjtBQUNFO0FBZko7OztBQW1CQSxrQkFBWSxLQUFaLEVBQW1CLFNBQW5COztBQUVEOzs7OztBQWpEcUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXNEdkU7OztBQUlNLFNBQVMsV0FBVCxDQUFxQixNQUFyQixFQUErQztBQUFBLE1BQWxCLFNBQWtCLHlEQUFOLEtBQU07OztBQUVwRCxNQUFJLGNBQUo7QUFDQSxNQUFJLGFBQWEsQ0FBakI7QUFDQSxNQUFJLGdCQUFnQixDQUFwQjtBQUNBLE1BQUksU0FBUyxFQUFiOztBQUVBLFNBQU8sQ0FBUDtBQUNBLFVBQVEsQ0FBUjtBQUNBLGNBQVksQ0FBWjs7O0FBR0EsTUFBSSxZQUFZLE9BQU8sTUFBdkI7Ozs7Ozs7Ozs7O0FBV0EsU0FBTyxJQUFQLENBQVksVUFBUyxDQUFULEVBQVksQ0FBWixFQUFjO0FBQ3hCLFFBQUcsRUFBRSxLQUFGLEtBQVksRUFBRSxLQUFqQixFQUF1Qjs7Ozs7OztBQU9yQixVQUFJLElBQUksRUFBRSxJQUFGLEdBQVMsRUFBRSxJQUFuQjtBQUNBLFVBQUcsRUFBRSxJQUFGLEtBQVcsR0FBWCxJQUFrQixFQUFFLElBQUYsS0FBVyxHQUFoQyxFQUFvQztBQUNsQyxZQUFJLENBQUMsQ0FBTDtBQUNEO0FBQ0QsYUFBTyxDQUFQO0FBQ0Q7QUFDRCxXQUFPLEVBQUUsS0FBRixHQUFVLEVBQUUsS0FBbkI7QUFDRCxHQWZEO0FBZ0JBLFVBQVEsT0FBTyxDQUFQLENBQVI7OztBQUlBLFFBQU0sTUFBTSxHQUFaO0FBQ0EsV0FBUyxNQUFNLE1BQWY7QUFDQSxjQUFZLE1BQU0sU0FBbEI7QUFDQSxnQkFBYyxNQUFNLFdBQXBCOztBQUVBLGdCQUFjLE1BQU0sV0FBcEI7QUFDQSxpQkFBZSxNQUFNLFlBQXJCO0FBQ0Esc0JBQW9CLE1BQU0saUJBQTFCOztBQUVBLGlCQUFlLE1BQU0sWUFBckI7O0FBRUEsa0JBQWdCLE1BQU0sYUFBdEI7QUFDQSxtQkFBaUIsTUFBTSxjQUF2Qjs7QUFFQSxXQUFTLE1BQU0sTUFBZjs7QUFFQSxRQUFNLE1BQU0sR0FBWjtBQUNBLFNBQU8sTUFBTSxJQUFiO0FBQ0EsY0FBWSxNQUFNLFNBQWxCO0FBQ0EsU0FBTyxNQUFNLElBQWI7O0FBR0EsT0FBSSxJQUFJLElBQUksVUFBWixFQUF3QixJQUFJLFNBQTVCLEVBQXVDLEdBQXZDLEVBQTJDOztBQUV6QyxZQUFRLE9BQU8sQ0FBUCxDQUFSOztBQUVBLFlBQU8sTUFBTSxJQUFiOztBQUVFLFdBQUssSUFBTDtBQUNFLGNBQU0sTUFBTSxLQUFaO0FBQ0EsaUJBQVMsTUFBTSxNQUFmO0FBQ0Esd0JBQWdCLE1BQU0sYUFBdEI7QUFDQSx5QkFBaUIsTUFBTSxjQUF2Qjs7QUFFQSxvQkFBWSxNQUFNLEtBQU4sR0FBYyxLQUExQjtBQUNBLGdCQUFRLFNBQVI7QUFDQSxnQkFBUSxNQUFNLEtBQWQ7OztBQUdBOztBQUVGLFdBQUssSUFBTDtBQUNFLGlCQUFTLE1BQU0sTUFBZjtBQUNBLG9CQUFZLE1BQU0sS0FBbEI7QUFDQSxzQkFBYyxNQUFNLEtBQXBCO0FBQ0EsdUJBQWUsTUFBTSxZQUFyQjtBQUNBLHNCQUFjLE1BQU0sV0FBcEI7QUFDQSx1QkFBZSxNQUFNLFlBQXJCO0FBQ0EsNEJBQW9CLE1BQU0saUJBQTFCO0FBQ0EsaUJBQVMsTUFBTSxNQUFmOztBQUVBLG9CQUFZLE1BQU0sS0FBTixHQUFjLEtBQTFCO0FBQ0EsZ0JBQVEsU0FBUjtBQUNBLGdCQUFRLE1BQU0sS0FBZDs7OztBQUtBOztBQUVGOzs7QUFHRSx1QkFBZSxLQUFmLEVBQXNCLFNBQXRCO0FBQ0Esb0JBQVksS0FBWixFQUFtQixTQUFuQjtBQUNBLGVBQU8sSUFBUCxDQUFZLEtBQVo7Ozs7OztBQXZDSjs7Ozs7OztBQXFEQSxvQkFBZ0IsTUFBTSxLQUF0QjtBQUNEO0FBQ0QsaUJBQWUsTUFBZjtBQUNBLFNBQU8sTUFBUDs7QUFFRDs7QUFHRCxTQUFTLFdBQVQsQ0FBcUIsS0FBckIsRUFBeUM7QUFBQSxNQUFiLElBQWEseURBQU4sS0FBTTs7Ozs7QUFJdkMsUUFBTSxHQUFOLEdBQVksR0FBWjtBQUNBLFFBQU0sU0FBTixHQUFrQixTQUFsQjtBQUNBLFFBQU0sV0FBTixHQUFvQixXQUFwQjs7QUFFQSxRQUFNLFdBQU4sR0FBb0IsV0FBcEI7QUFDQSxRQUFNLFlBQU4sR0FBcUIsWUFBckI7QUFDQSxRQUFNLGlCQUFOLEdBQTBCLGlCQUExQjs7QUFFQSxRQUFNLE1BQU4sR0FBZSxNQUFmO0FBQ0EsUUFBTSxZQUFOLEdBQXFCLFlBQXJCO0FBQ0EsUUFBTSxjQUFOLEdBQXVCLGNBQXZCO0FBQ0EsUUFBTSxhQUFOLEdBQXNCLGFBQXRCOztBQUdBLFFBQU0sS0FBTixHQUFjLEtBQWQ7O0FBRUEsUUFBTSxNQUFOLEdBQWUsTUFBZjtBQUNBLFFBQU0sT0FBTixHQUFnQixTQUFTLElBQXpCOztBQUVBLE1BQUcsSUFBSCxFQUFRO0FBQ047QUFDRDs7QUFFRCxRQUFNLEdBQU4sR0FBWSxHQUFaO0FBQ0EsUUFBTSxJQUFOLEdBQWEsSUFBYjtBQUNBLFFBQU0sU0FBTixHQUFrQixTQUFsQjtBQUNBLFFBQU0sSUFBTixHQUFhLElBQWI7O0FBRUEsTUFBSSxlQUFlLFNBQVMsQ0FBVCxHQUFhLEtBQWIsR0FBcUIsT0FBTyxFQUFQLEdBQVksT0FBTyxJQUFuQixHQUEwQixPQUFPLEdBQVAsR0FBYSxNQUFNLElBQW5CLEdBQTBCLElBQTVGO0FBQ0EsUUFBTSxZQUFOLEdBQXFCLE1BQU0sR0FBTixHQUFZLElBQVosR0FBbUIsR0FBbkIsR0FBeUIsU0FBekIsR0FBcUMsR0FBckMsR0FBMkMsWUFBaEU7QUFDQSxRQUFNLFdBQU4sR0FBb0IsQ0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLFNBQVosRUFBdUIsSUFBdkIsQ0FBcEI7O0FBR0EsTUFBSSxXQUFXLHVCQUFZLE1BQVosQ0FBZjs7QUFFQSxRQUFNLElBQU4sR0FBYSxTQUFTLElBQXRCO0FBQ0EsUUFBTSxNQUFOLEdBQWUsU0FBUyxNQUF4QjtBQUNBLFFBQU0sTUFBTixHQUFlLFNBQVMsTUFBeEI7QUFDQSxRQUFNLFdBQU4sR0FBb0IsU0FBUyxXQUE3QjtBQUNBLFFBQU0sWUFBTixHQUFxQixTQUFTLFlBQTlCO0FBQ0EsUUFBTSxXQUFOLEdBQW9CLFNBQVMsV0FBN0I7Ozs7O0FBT0Q7O0FBR0QsSUFBSSxnQkFBZ0IsQ0FBcEI7O0FBRU8sU0FBUyxjQUFULENBQXdCLE1BQXhCLEVBQStCO0FBQ3BDLE1BQUksUUFBUSxFQUFaO0FBQ0EsTUFBSSxxQkFBSjtBQUNBLE1BQUksSUFBSSxDQUFSO0FBSG9DO0FBQUE7QUFBQTs7QUFBQTtBQUlwQywwQkFBaUIsTUFBakIsbUlBQXdCO0FBQUEsVUFBaEIsS0FBZ0I7O0FBQ3RCLFVBQUcsT0FBTyxNQUFNLEtBQWIsS0FBdUIsV0FBdkIsSUFBc0MsT0FBTyxNQUFNLE1BQWIsS0FBd0IsV0FBakUsRUFBNkU7QUFDM0UsZ0JBQVEsR0FBUixDQUFZLDBCQUFaO0FBQ0E7QUFDRDtBQUNELFVBQUcsTUFBTSxJQUFOLEtBQWUsR0FBbEIsRUFBc0I7QUFDcEIsdUJBQWUsTUFBTSxNQUFNLE1BQU4sQ0FBYSxFQUFuQixDQUFmO0FBQ0EsWUFBRyxPQUFPLFlBQVAsS0FBd0IsV0FBM0IsRUFBdUM7QUFDckMseUJBQWUsTUFBTSxNQUFNLE1BQU4sQ0FBYSxFQUFuQixJQUF5QixFQUF4QztBQUNEO0FBQ0QscUJBQWEsTUFBTSxLQUFuQixJQUE0QixLQUE1QjtBQUNELE9BTkQsTUFNTSxJQUFHLE1BQU0sSUFBTixLQUFlLEdBQWxCLEVBQXNCO0FBQzFCLHVCQUFlLE1BQU0sTUFBTSxNQUFOLENBQWEsRUFBbkIsQ0FBZjtBQUNBLFlBQUcsT0FBTyxZQUFQLEtBQXdCLFdBQTNCLEVBQXVDOztBQUVyQztBQUNEO0FBQ0QsWUFBSSxTQUFTLGFBQWEsTUFBTSxLQUFuQixDQUFiO0FBQ0EsWUFBSSxVQUFVLEtBQWQ7QUFDQSxZQUFHLE9BQU8sTUFBUCxLQUFrQixXQUFyQixFQUFpQzs7QUFFL0IsaUJBQU8sTUFBTSxNQUFNLE1BQU4sQ0FBYSxFQUFuQixFQUF1QixNQUFNLEtBQTdCLENBQVA7QUFDQTtBQUNEO0FBQ0QsWUFBSSxPQUFPLHdCQUFhLE1BQWIsRUFBcUIsT0FBckIsQ0FBWDtBQUNBLGVBQU8sSUFBUDs7Ozs7O0FBTUEsZUFBTyxNQUFNLE1BQU0sTUFBTixDQUFhLEVBQW5CLEVBQXVCLE1BQU0sS0FBN0IsQ0FBUDtBQUNEO0FBQ0Y7QUFyQ21DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBc0NwQyxTQUFPLElBQVAsQ0FBWSxLQUFaLEVBQW1CLE9BQW5CLENBQTJCLFVBQVMsR0FBVCxFQUFhO0FBQ3RDLFdBQU8sTUFBTSxHQUFOLENBQVA7QUFDRCxHQUZEO0FBR0EsVUFBUSxFQUFSOztBQUVEOzs7QUFJTSxTQUFTLFlBQVQsQ0FBc0IsTUFBdEIsRUFBNkI7QUFDbEMsTUFBSSxVQUFVLEVBQWQ7QUFDQSxNQUFJLFlBQVksRUFBaEI7QUFDQSxNQUFJLFNBQVMsRUFBYjtBQUhrQztBQUFBO0FBQUE7O0FBQUE7QUFJbEMsMEJBQWlCLE1BQWpCLG1JQUF3QjtBQUFBLFVBQWhCLEtBQWdCOztBQUN0QixVQUFHLE1BQU0sSUFBTixLQUFlLEdBQWYsSUFBc0IsTUFBTSxLQUFOLEtBQWdCLEVBQXpDLEVBQTRDO0FBQzFDLFlBQUcsTUFBTSxLQUFOLEtBQWdCLENBQW5CLEVBQXFCO0FBQ25CLGNBQUcsT0FBTyxRQUFRLE1BQU0sT0FBZCxDQUFQLEtBQWtDLFdBQXJDLEVBQWlEO0FBQy9DO0FBQ0QsV0FGRCxNQUVNLElBQUcsUUFBUSxNQUFNLE9BQWQsTUFBMkIsTUFBTSxLQUFwQyxFQUEwQztBQUM5QyxtQkFBTyxVQUFVLE1BQU0sS0FBaEIsQ0FBUDtBQUNBO0FBQ0Q7QUFDRCxvQkFBVSxNQUFNLEtBQWhCLElBQXlCLEtBQXpCO0FBQ0EsaUJBQU8sUUFBUSxNQUFNLE9BQWQsQ0FBUDtBQUNELFNBVEQsTUFTTSxJQUFHLE1BQU0sS0FBTixLQUFnQixHQUFuQixFQUF1QjtBQUMzQixrQkFBUSxNQUFNLE9BQWQsSUFBeUIsTUFBTSxLQUEvQjtBQUNBLG9CQUFVLE1BQU0sS0FBaEIsSUFBeUIsS0FBekI7QUFDRDtBQUNGLE9BZEQsTUFjSztBQUNILGVBQU8sSUFBUCxDQUFZLEtBQVo7QUFDRDtBQUNGO0FBdEJpQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXVCbEMsVUFBUSxHQUFSLENBQVksT0FBWjtBQUNBLFNBQU8sSUFBUCxDQUFZLFNBQVosRUFBdUIsT0FBdkIsQ0FBK0IsVUFBUyxHQUFULEVBQWE7QUFDMUMsUUFBSSxlQUFlLFVBQVUsR0FBVixDQUFuQjtBQUNBLFlBQVEsR0FBUixDQUFZLFlBQVo7QUFDQSxXQUFPLElBQVAsQ0FBWSxZQUFaO0FBQ0QsR0FKRDtBQUtBLFNBQU8sTUFBUDtBQUNEOzs7Ozs7Ozs7Ozs7QUMxWUQ7Ozs7OztBQUVBLElBQUksWUFBWSxDQUFoQjs7SUFFYSxJLFdBQUEsSTtBQUVYLGtCQUFnQztBQUFBLFFBQXBCLElBQW9CLHlEQUFMLElBQUs7O0FBQUE7O0FBQzlCLFNBQUssRUFBTCxXQUFnQixXQUFoQixTQUErQixJQUFJLElBQUosR0FBVyxPQUFYLEVBQS9CO0FBQ0EsU0FBSyxJQUFMLEdBQVksUUFBUSxLQUFLLEVBQXpCO0FBQ0EsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUssTUFBTCxHQUFjLElBQWQ7QUFDQSxTQUFLLEtBQUwsR0FBYSxJQUFiO0FBQ0EsU0FBSyxPQUFMLEdBQWUsRUFBZjtBQUNBLFNBQUssV0FBTCxHQUFtQixJQUFJLEdBQUosRUFBbkI7QUFDQSxTQUFLLFlBQUwsR0FBb0IsS0FBcEI7QUFDQSxTQUFLLGlCQUFMLEdBQXlCLEtBQXpCO0FBQ0EsU0FBSyxNQUFMLEdBQWMsRUFBQyxRQUFRLENBQVQsRUFBWSxPQUFPLENBQW5CLEVBQWQ7QUFDQSxTQUFLLElBQUwsR0FBWSxFQUFDLFFBQVEsQ0FBVCxFQUFZLE9BQU8sQ0FBbkIsRUFBWjtBQUNEOzs7OzJCQUVLO0FBQ0osVUFBSSxJQUFJLElBQUksSUFBSixDQUFTLEtBQUssSUFBTCxHQUFZLE9BQXJCLENBQVIsQztBQUNBLFVBQUksU0FBUyxFQUFiO0FBQ0EsV0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixVQUFTLEtBQVQsRUFBZTtBQUNsQyxZQUFJLE9BQU8sTUFBTSxJQUFOLEVBQVg7QUFDQSxnQkFBUSxHQUFSLENBQVksSUFBWjtBQUNBLGVBQU8sSUFBUCxDQUFZLElBQVo7QUFDRCxPQUpEO0FBS0EsUUFBRSxTQUFGLFVBQWUsTUFBZjtBQUNBLFFBQUUsTUFBRjtBQUNBLGFBQU8sQ0FBUDtBQUNEOzs7OEJBRVMsTSxFQUFlO0FBQ3ZCLFdBQUssT0FBTCxDQUFhLE9BQWIsQ0FBcUIsVUFBQyxLQUFELEVBQVc7QUFDOUIsY0FBTSxTQUFOLENBQWdCLE1BQWhCO0FBQ0QsT0FGRDtBQUdBLFdBQUssWUFBTCxHQUFvQixJQUFwQjtBQUNEOzs7eUJBRUksSyxFQUFjO0FBQ2pCLFdBQUssT0FBTCxDQUFhLE9BQWIsQ0FBcUIsVUFBQyxLQUFELEVBQVc7QUFDOUIsY0FBTSxJQUFOLENBQVcsS0FBWDtBQUNELE9BRkQ7QUFHQSxVQUFHLEtBQUssS0FBUixFQUFjO0FBQUE7O0FBQ1osbUNBQUssS0FBTCxDQUFXLFlBQVgsRUFBd0IsSUFBeEIsOENBQWdDLEtBQUssT0FBckM7QUFDRDtBQUNELFdBQUssWUFBTCxHQUFvQixJQUFwQjtBQUNEOzs7MkJBRU0sSyxFQUFjO0FBQ25CLFdBQUssT0FBTCxDQUFhLE9BQWIsQ0FBcUIsVUFBQyxLQUFELEVBQVc7QUFDOUIsY0FBTSxNQUFOLENBQWEsS0FBYjtBQUNELE9BRkQ7QUFHQSxVQUFHLEtBQUssS0FBUixFQUFjO0FBQUE7O0FBQ1osb0NBQUssS0FBTCxDQUFXLFlBQVgsRUFBd0IsSUFBeEIsK0NBQWdDLEtBQUssT0FBckM7QUFDRDtBQUNELFdBQUssWUFBTCxHQUFvQixJQUFwQjtBQUNEOzs7Z0NBRW1CO0FBQUE7OztBQUVsQixVQUFJLFFBQVEsS0FBSyxNQUFqQjs7QUFGa0Isd0NBQVAsTUFBTztBQUFQLGNBQU87QUFBQTs7QUFHbEIsYUFBTyxPQUFQLENBQWUsVUFBQyxLQUFELEVBQVc7QUFDeEIsY0FBTSxLQUFOO0FBQ0EsY0FBSyxXQUFMLENBQWlCLEdBQWpCLENBQXFCLE1BQU0sRUFBM0IsRUFBK0IsS0FBL0I7QUFDQSxjQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLEtBQWxCO0FBQ0EsWUFBRyxLQUFILEVBQVM7QUFDUCxnQkFBTSxNQUFOLEdBQWUsS0FBZjtBQUNEO0FBQ0YsT0FQRDtBQVFBLFVBQUcsS0FBSCxFQUFTO0FBQUE7O0FBQ1AsZ0NBQU0sT0FBTixFQUFjLElBQWQsdUJBQXNCLE1BQXRCO0FBQ0EsY0FBTSxZQUFOLEdBQXFCLElBQXJCO0FBQ0Q7QUFDRCxVQUFHLEtBQUssS0FBUixFQUFjO0FBQUE7O0FBQ1osaUNBQUssS0FBTCxDQUFXLFVBQVgsRUFBc0IsSUFBdEIseUJBQThCLE1BQTlCO0FBQ0Q7QUFDRCxXQUFLLFlBQUwsR0FBb0IsSUFBcEI7QUFDRDs7O21DQUVzQjtBQUFBOztBQUNyQixVQUFJLFFBQVEsS0FBSyxNQUFqQjs7QUFEcUIseUNBQVAsTUFBTztBQUFQLGNBQU87QUFBQTs7QUFFckIsYUFBTyxPQUFQLENBQWUsVUFBQyxLQUFELEVBQVc7QUFDeEIsY0FBTSxLQUFOLEdBQWMsSUFBZDtBQUNBLGVBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixNQUFNLEVBQTlCO0FBQ0EsWUFBRyxLQUFILEVBQVM7QUFDUCxnQkFBTSxNQUFOLEdBQWUsSUFBZjtBQUNBLGdCQUFNLFdBQU4sQ0FBa0IsTUFBbEIsQ0FBeUIsTUFBTSxFQUEvQjtBQUNEO0FBQ0YsT0FQRDtBQVFBLFVBQUcsS0FBSCxFQUFTO0FBQ1AsY0FBTSxZQUFOLEdBQXFCLElBQXJCO0FBQ0EsY0FBTSxpQkFBTixHQUEwQixJQUExQjtBQUNEO0FBQ0QsVUFBRyxLQUFLLEtBQVIsRUFBYztBQUFBOztBQUNaLHFDQUFLLEtBQUwsQ0FBVyxjQUFYLEVBQTBCLElBQTFCLDZCQUFrQyxNQUFsQztBQUNEO0FBQ0QsV0FBSyxpQkFBTCxHQUF5QixJQUF6QjtBQUNBLFdBQUssWUFBTCxHQUFvQixJQUFwQjtBQUNEOzs7K0JBRVUsSyxFQUF5QjtBQUFBLHlDQUFQLE1BQU87QUFBUCxjQUFPO0FBQUE7O0FBQ2xDLGFBQU8sT0FBUCxDQUFlLFVBQUMsS0FBRCxFQUFXO0FBQ3hCLGNBQU0sSUFBTixDQUFXLEtBQVg7QUFDRCxPQUZEO0FBR0EsVUFBRyxLQUFLLEtBQVIsRUFBYztBQUFBOztBQUNaLG9DQUFLLEtBQUwsQ0FBVyxZQUFYLEVBQXdCLElBQXhCLCtDQUFnQyxLQUFLLE9BQXJDO0FBQ0Q7QUFDRCxXQUFLLFlBQUwsR0FBb0IsSUFBcEI7QUFDRDs7O2lDQUVZLEssRUFBeUI7QUFBQSx5Q0FBUCxNQUFPO0FBQVAsY0FBTztBQUFBOztBQUNwQyxhQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVztBQUN4QixjQUFNLE1BQU4sQ0FBYSxLQUFiO0FBQ0QsT0FGRDtBQUdBLFVBQUcsS0FBSyxLQUFSLEVBQWM7QUFBQTs7QUFDWixvQ0FBSyxLQUFMLENBQVcsWUFBWCxFQUF3QixJQUF4QiwrQ0FBZ0MsS0FBSyxPQUFyQztBQUNEO0FBQ0QsV0FBSyxZQUFMLEdBQW9CLElBQXBCO0FBQ0Q7OztnQ0FHaUM7QUFBQSxVQUF4QixNQUF3Qix5REFBTCxJQUFLOztBQUNoQyxVQUFHLEtBQUssWUFBUixFQUFxQjtBQUNuQixhQUFLLE1BQUw7QUFDRDtBQUNELDBDQUFXLEtBQUssT0FBaEIsRztBQUNEOzs7MkJBRXlCO0FBQUEsVUFBckIsSUFBcUIseURBQUwsSUFBSzs7QUFDeEIsVUFBRyxJQUFILEVBQVE7QUFDTixhQUFLLEtBQUwsR0FBYSxJQUFiO0FBQ0QsT0FGRCxNQUVLO0FBQ0gsYUFBSyxLQUFMLEdBQWEsQ0FBQyxLQUFLLEtBQW5CO0FBQ0Q7QUFDRjs7OzZCQUVPO0FBQ04sVUFBRyxLQUFLLFlBQUwsS0FBc0IsS0FBekIsRUFBK0I7QUFDN0I7QUFDRDtBQUNELFVBQUcsS0FBSyxpQkFBUixFQUEwQjtBQUN4QixhQUFLLE9BQUwsR0FBZSxNQUFNLElBQU4sQ0FBVyxLQUFLLFdBQUwsQ0FBaUIsTUFBakIsRUFBWCxDQUFmO0FBQ0EsYUFBSyxpQkFBTCxHQUF5QixLQUF6QjtBQUNEO0FBQ0QsNEJBQVcsS0FBSyxPQUFoQjtBQUNBLFdBQUssWUFBTCxHQUFvQixLQUFwQjs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZKSDs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxRQUFRLEVBQWQsQztBQUNBLElBQUksYUFBYSxDQUFqQjs7SUFFYSxRLFdBQUEsUTtBQUVYLG9CQUFZLElBQVosRUFBK0I7QUFBQSxRQUFiLElBQWEseURBQU4sS0FBTTs7QUFBQTs7QUFDN0IsU0FBSyxFQUFMLFlBQWlCLFlBQWpCLFNBQWlDLElBQUksSUFBSixHQUFXLE9BQVgsRUFBakM7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBLFNBQUssSUFBTCxHQUFZLEVBQVo7O0FBRUEsU0FBSyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0EsU0FBSyxZQUFMLEdBQW9CLEVBQXBCO0FBQ0Q7Ozs7Ozs7d0JBR0csSSxFQUFNLEssRUFBTTtBQUNkLFdBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxXQUFLLFlBQUwsR0FBb0IsS0FBcEI7QUFDQSxXQUFLLFVBQUwsR0FBa0IsQ0FBbEI7QUFDQSxXQUFLLFNBQUwsR0FBaUIsQ0FBakI7QUFDQSxXQUFLLFNBQUwsR0FBaUIsQ0FBakI7QUFDQSxXQUFLLFNBQUw7QUFDQSxhQUFPLEtBQUssSUFBWjtBQUNEOzs7MEJBR0k7QUFDSCxhQUFPLEtBQUssSUFBWjtBQUNEOzs7MkJBR00sSSxFQUFNLEksRUFBSztBQUNoQixVQUFHLFNBQVMsQ0FBWixFQUFjO0FBQ1osZUFBTyxLQUFLLElBQVo7QUFDRDtBQUNELFdBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxXQUFLLFlBQUwsSUFBcUIsSUFBckI7QUFDQSxXQUFLLFNBQUw7QUFDQSxhQUFPLEtBQUssSUFBWjtBQUNEOzs7aUNBR1c7QUFDVixXQUFLLE1BQUwsZ0NBQWtCLEtBQUssSUFBTCxDQUFVLE9BQTVCLHNCQUF3QyxLQUFLLElBQUwsQ0FBVSxXQUFsRDtBQUNBLDRCQUFXLEtBQUssTUFBaEI7O0FBRUEsV0FBSyxLQUFMLEdBQWEsS0FBSyxJQUFMLENBQVUsTUFBdkI7QUFDQSxXQUFLLEtBQUwsR0FBYSxLQUFLLElBQUwsQ0FBVSxNQUF2QjtBQUNBLFdBQUssU0FBTCxHQUFpQixLQUFLLE1BQUwsQ0FBWSxNQUE3QjtBQUNBLFdBQUssUUFBTCxHQUFnQixLQUFLLEtBQUwsQ0FBVyxNQUEzQjtBQUNBLFdBQUssUUFBTCxHQUFnQixLQUFLLEtBQUwsQ0FBVyxNQUEzQjtBQUNBLFdBQUssR0FBTCxDQUFTLFFBQVQsRUFBbUIsS0FBSyxJQUFMLENBQVUsT0FBN0I7QUFDRDs7O2dDQUdVO0FBQ1QsVUFBSSxVQUFKO0FBQ0EsVUFBSSxjQUFKO0FBQ0EsVUFBSSxjQUFKO0FBQ0EsVUFBSSxhQUFKO0FBQ0EsVUFBSSxhQUFKO0FBQ0EsVUFBSSxpQkFBSjtBQUNBLFVBQUksbUJBQW1CLEVBQXZCO0FBQ0EsVUFBSSxtQkFBbUIsRUFBdkI7QUFDQSxVQUFJLGlCQUFpQixJQUFJLEdBQUosRUFBckI7QUFDQSxVQUFJLGlCQUFpQixJQUFJLEdBQUosRUFBckI7O0FBRUEsV0FBSyxJQUFMLEdBQVksRUFBWjtBQUNBLFdBQUssWUFBTCxHQUFvQixFQUFwQjs7QUFFQSxXQUFJLElBQUksS0FBSyxVQUFiLEVBQXlCLElBQUksS0FBSyxTQUFsQyxFQUE2QyxHQUE3QyxFQUFpRDtBQUMvQyxnQkFBUSxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVI7QUFDQSxnQkFBUSxNQUFNLEtBQUssSUFBWCxDQUFSO0FBQ0EsWUFBRyxTQUFTLEtBQUssWUFBakIsRUFBOEI7O0FBRTVCLGNBQUcsVUFBVSxDQUFWLElBQWUsUUFBUSxLQUFLLFlBQUwsR0FBb0IsS0FBOUMsRUFBb0Q7QUFDbEQsaUJBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixLQUF2Qjs7QUFFQSxnQkFBRyxNQUFNLElBQU4sS0FBZSxHQUFsQixFQUFzQjs7QUFFcEIsa0JBQUcsTUFBTSxLQUFOLEtBQWdCLEVBQW5CLEVBQXNCO0FBQ3BCLGtEQUFjO0FBQ1osd0JBQU0sZUFETTtBQUVaLHdCQUFNLE1BQU0sS0FBTixLQUFnQixHQUFoQixHQUFzQixNQUF0QixHQUErQjtBQUZ6QixpQkFBZDtBQUlEOzs7Ozs7QUFNRjs7QUFFRCw4Q0FBYztBQUNaLG9CQUFNLE9BRE07QUFFWixvQkFBTTtBQUZNLGFBQWQ7QUFJRDtBQUNELGVBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNBLGVBQUssVUFBTDtBQUNELFNBM0JELE1BMkJLO0FBQ0g7QUFDRDtBQUNGOztBQUVELFdBQUssSUFBTCxDQUFVLFlBQVYsR0FBeUIsS0FBSyxZQUE5Qjs7O0FBR0EsVUFBRyxLQUFLLFNBQUwsS0FBbUIsSUFBdEIsRUFBMkI7QUFDekIsYUFBSyxTQUFMLEdBQWlCLEtBQUssSUFBTCxDQUFVLFdBQVYsQ0FBc0IsQ0FBdEIsQ0FBakI7QUFDRDs7QUFFRCxpQkFBVyw0QkFBYSxLQUFLLElBQWxCLEVBQXdCLEtBQUssSUFBN0IsRUFBbUMsS0FBSyxZQUF4QyxFQUFzRCxLQUF0RCxFQUE2RCxLQUFLLFNBQWxFLENBQVg7QUFDQSxXQUFLLElBQUwsQ0FBVSxVQUFWLEdBQXVCLEtBQUssVUFBNUI7QUFDQSxXQUFLLElBQUwsQ0FBVSxNQUFWLEdBQW1CLFNBQVMsTUFBNUI7QUFDQSxXQUFLLElBQUwsQ0FBVSxLQUFWLEdBQWtCLFNBQVMsS0FBM0I7QUFDQSxXQUFLLElBQUwsQ0FBVSxRQUFWLEdBQXFCLFFBQXJCOztBQUVBLFVBQUcsS0FBSyxJQUFMLENBQVUsT0FBVixDQUFrQixLQUFsQixNQUE2QixDQUFDLENBQWpDLEVBQW1DO0FBQ2pDLFlBQUksT0FBTyxLQUFLLElBQWhCO0FBRGlDO0FBQUE7QUFBQTs7QUFBQTtBQUVqQywrQkFBZSxPQUFPLElBQVAsQ0FBWSxRQUFaLENBQWYsOEhBQXFDO0FBQUEsZ0JBQTdCLEdBQTZCOztBQUNuQyxpQkFBSyxHQUFMLElBQVksU0FBUyxHQUFULENBQVo7QUFDRDtBQUpnQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBS2xDLE9BTEQsTUFLTSxJQUFHLEtBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsV0FBbEIsTUFBbUMsQ0FBQyxDQUF2QyxFQUF5QztBQUM3QyxhQUFLLElBQUwsQ0FBVSxHQUFWLEdBQWdCLFNBQVMsR0FBekI7QUFDQSxhQUFLLElBQUwsQ0FBVSxJQUFWLEdBQWlCLFNBQVMsSUFBMUI7QUFDQSxhQUFLLElBQUwsQ0FBVSxTQUFWLEdBQXNCLFNBQVMsU0FBL0I7QUFDQSxhQUFLLElBQUwsQ0FBVSxJQUFWLEdBQWlCLFNBQVMsSUFBMUI7QUFDQSxhQUFLLElBQUwsQ0FBVSxZQUFWLEdBQXlCLFNBQVMsWUFBbEM7O0FBRUEsYUFBSyxJQUFMLENBQVUsV0FBVixHQUF3QixTQUFTLFdBQWpDO0FBQ0EsYUFBSyxJQUFMLENBQVUsWUFBVixHQUF5QixTQUFTLFlBQWxDO0FBQ0EsYUFBSyxJQUFMLENBQVUsaUJBQVYsR0FBOEIsU0FBUyxpQkFBdkM7QUFDQSxhQUFLLElBQUwsQ0FBVSxZQUFWLEdBQXlCLFNBQVMsWUFBbEM7QUFFRCxPQVpLLE1BWUEsSUFBRyxLQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLE1BQWxCLE1BQThCLENBQUMsQ0FBbEMsRUFBb0M7QUFDeEMsYUFBSyxJQUFMLENBQVUsSUFBVixHQUFpQixTQUFTLElBQTFCO0FBQ0EsYUFBSyxJQUFMLENBQVUsTUFBVixHQUFtQixTQUFTLE1BQTVCO0FBQ0EsYUFBSyxJQUFMLENBQVUsTUFBVixHQUFtQixTQUFTLE1BQTVCO0FBQ0EsYUFBSyxJQUFMLENBQVUsV0FBVixHQUF3QixTQUFTLFdBQWpDO0FBQ0EsYUFBSyxJQUFMLENBQVUsWUFBVixHQUF5QixTQUFTLFlBQWxDO0FBRUQsT0FQSyxNQU9BLElBQUcsS0FBSyxJQUFMLENBQVUsT0FBVixDQUFrQixZQUFsQixNQUFvQyxDQUFDLENBQXhDLEVBQTBDO0FBQzlDLGFBQUssSUFBTCxDQUFVLFVBQVYsR0FBdUIsU0FBUyxVQUFoQztBQUNEOzs7QUFHRCxVQUFHLEtBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsT0FBbEIsTUFBK0IsQ0FBQyxDQUFoQyxJQUFxQyxLQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLEtBQWxCLE1BQTZCLENBQUMsQ0FBdEUsRUFBd0U7OztBQUd0RSxhQUFJLElBQUksS0FBSyxTQUFiLEVBQXdCLElBQUksS0FBSyxRQUFqQyxFQUEyQyxHQUEzQyxFQUErQztBQUM3QyxpQkFBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLENBQVA7QUFDQSxrQkFBUSxLQUFLLE1BQUwsQ0FBWSxLQUFLLElBQWpCLENBQVI7QUFDQSxjQUFHLFNBQVMsS0FBSyxZQUFqQixFQUE4QjtBQUM1QixpQkFBSyxTQUFMO0FBQ0EsZ0JBQUcsT0FBTyxLQUFLLE9BQVosS0FBd0IsV0FBM0IsRUFBdUM7QUFDckM7QUFDRDs7QUFFRCxnQkFBRyxLQUFLLFlBQUwsS0FBc0IsQ0FBdEIsSUFBMkIsS0FBSyxPQUFMLENBQWEsS0FBSyxJQUFsQixJQUEwQixLQUFLLFlBQTdELEVBQTBFO0FBQ3hFLDZCQUFlLEdBQWYsQ0FBbUIsSUFBbkI7QUFDQSxnREFBYztBQUNaLHNCQUFNLFFBRE07QUFFWixzQkFBTTtBQUZNLGVBQWQ7QUFJRDtBQUNGLFdBYkQsTUFhSztBQUNIO0FBQ0Q7QUFDRjs7O0FBR0QsYUFBSSxJQUFJLEtBQUssV0FBTCxDQUFpQixNQUFqQixHQUEwQixDQUFsQyxFQUFxQyxLQUFLLENBQTFDLEVBQTZDLEdBQTdDLEVBQWlEO0FBQy9DLGlCQUFPLEtBQUssV0FBTCxDQUFpQixDQUFqQixDQUFQOztBQUVBLGNBQUcsS0FBSyxJQUFMLENBQVUsVUFBVixDQUFxQixHQUFyQixDQUF5QixLQUFLLEVBQTlCLE1BQXNDLEtBQXpDLEVBQStDOztBQUU3QztBQUNEOztBQUVELGNBQUcsT0FBTyxLQUFLLE9BQVosS0FBd0IsV0FBM0IsRUFBdUM7QUFDckMsb0JBQVEsSUFBUixDQUFhLGNBQWIsRUFBNkIsS0FBSyxFQUFsQyxFQUFzQyxzQkFBdEM7QUFDQTtBQUNEOzs7QUFHRCxjQUFHLEtBQUssT0FBTCxDQUFhLEtBQUssSUFBbEIsSUFBMEIsS0FBSyxZQUFsQyxFQUErQztBQUM3Qyw2QkFBaUIsSUFBakIsQ0FBc0IsSUFBdEI7QUFDRCxXQUZELE1BRUs7QUFDSCw4Q0FBYztBQUNaLG9CQUFNLFNBRE07QUFFWixvQkFBTTtBQUZNLGFBQWQ7QUFJRDtBQUNGOzs7QUFHRCxhQUFLLFdBQUwsZ0NBQXVCLGVBQWUsTUFBZixFQUF2QixHQUFtRCxnQkFBbkQ7QUFDQSxhQUFLLElBQUwsQ0FBVSxXQUFWLEdBQXdCLEtBQUssV0FBN0I7QUFDRDs7O0FBSUQsVUFBRyxLQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLE9BQWxCLE1BQStCLENBQUMsQ0FBaEMsSUFBcUMsS0FBSyxJQUFMLENBQVUsT0FBVixDQUFrQixLQUFsQixNQUE2QixDQUFDLENBQXRFLEVBQXdFOztBQUV0RSxhQUFJLElBQUksS0FBSyxTQUFiLEVBQXdCLElBQUksS0FBSyxRQUFqQyxFQUEyQyxHQUEzQyxFQUErQztBQUM3QyxpQkFBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLENBQVA7O0FBRUEsY0FBRyxLQUFLLE1BQUwsQ0FBWSxLQUFLLElBQWpCLEtBQTBCLEtBQUssWUFBbEMsRUFBK0M7QUFDN0MsMkJBQWUsR0FBZixDQUFtQixJQUFuQjtBQUNBLDhDQUFjO0FBQ1osb0JBQU0sUUFETTtBQUVaLG9CQUFNO0FBRk0sYUFBZDtBQUlBLGlCQUFLLFNBQUw7QUFDRCxXQVBELE1BT0s7QUFDSDtBQUNEO0FBQ0Y7OztBQUlELGFBQUksSUFBSSxLQUFLLFdBQUwsQ0FBaUIsTUFBakIsR0FBMEIsQ0FBbEMsRUFBcUMsS0FBSyxDQUExQyxFQUE2QyxHQUE3QyxFQUFpRDtBQUMvQyxpQkFBTyxLQUFLLFdBQUwsQ0FBaUIsQ0FBakIsQ0FBUDs7QUFFQSxjQUFHLEtBQUssSUFBTCxDQUFVLFVBQVYsQ0FBcUIsR0FBckIsQ0FBeUIsS0FBSyxFQUE5QixNQUFzQyxLQUF6QyxFQUErQzs7QUFFN0M7QUFDRDs7O0FBR0QsY0FBRyxLQUFLLElBQUwsQ0FBVSxLQUFLLElBQWYsSUFBdUIsS0FBSyxZQUEvQixFQUE0QztBQUMxQyw2QkFBaUIsSUFBakIsQ0FBc0IsSUFBdEI7QUFDRCxXQUZELE1BRUs7QUFDSCw4Q0FBYztBQUNaLG9CQUFNLFNBRE07QUFFWixvQkFBTTtBQUZNLGFBQWQ7QUFJRDtBQUNGOztBQUVELGFBQUssV0FBTCxnQ0FBdUIsZUFBZSxNQUFmLEVBQXZCLEdBQW1ELGdCQUFuRDtBQUNBLGFBQUssSUFBTCxDQUFVLFdBQVYsR0FBd0IsS0FBSyxXQUE3QjtBQUNEOztBQUVELHdDQUFjO0FBQ1osY0FBTSxVQURNO0FBRVosY0FBTSxLQUFLO0FBRkMsT0FBZDtBQUtEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqUUg7Ozs7Ozs7O1FBeURnQixhLEdBQUEsYTtRQVFBLGEsR0FBQSxhO1FBT0EsWSxHQUFBLFk7UUFXQSxXLEdBQUEsVztRQVlBLFcsR0FBQSxXO1FBU0EsWSxHQUFBLFk7UUE0U0EsWSxHQUFBLFk7UUFlQSxpQixHQUFBLGlCOztBQWphaEI7O0FBRUEsSUFDRSxpQkFBaUIsMERBRG5CO0lBRUUsdUJBQXVCLDhDQUZ6QjtJQUdFLFFBQVEsS0FBSyxLQUhmO0lBSUUsUUFBUSxLQUFLLEtBSmY7O0FBT0E7O0FBRUUsWUFGRjtJQUdFLGtCQUhGO0lBSUUsb0JBSkY7SUFNRSxxQkFORjtJQU9FLG9CQVBGO0lBUUUsMEJBUkY7SUFVRSxzQkFWRjtJQVdFLHVCQVhGO0lBWUUscUJBWkY7SUFjRSxjQWRGO0lBZUUsZUFmRjtJQWdCRSxrQkFoQkY7SUFpQkUsbUJBakJGO0lBbUJFLFlBbkJGO0lBb0JFLGFBcEJGO0lBcUJFLGtCQXJCRjtJQXNCRSxhQXRCRjs7OztBQXlCRSxjQXpCRjtJQTBCRSxhQUFhLEtBMUJmO0lBMkJFLGtCQUFrQixJQTNCcEI7O0FBOEJBLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0QixJQUE1QixFQUFrQyxNQUFsQyxFQUF5Qzs7QUFFdkMsTUFBSSxhQUFhLEtBQUssV0FBdEI7O0FBRUEsT0FBSSxJQUFJLElBQUksV0FBVyxNQUFYLEdBQW9CLENBQWhDLEVBQW1DLEtBQUssQ0FBeEMsRUFBMkMsR0FBM0MsRUFBK0M7QUFDN0MsUUFBSSxRQUFRLFdBQVcsQ0FBWCxDQUFaOztBQUVBLFFBQUcsTUFBTSxJQUFOLEtBQWUsTUFBbEIsRUFBeUI7QUFDdkIsY0FBUSxDQUFSO0FBQ0EsYUFBTyxLQUFQO0FBQ0Q7QUFDRjtBQUNELFNBQU8sSUFBUDtBQUNEOztBQUdNLFNBQVMsYUFBVCxDQUF1QixJQUF2QixFQUE2QixZQUE3QixFQUF1RDtBQUFBLE1BQVosSUFBWSx5REFBTCxJQUFLOztBQUM1RCxvQkFBa0IsSUFBbEI7QUFDQSxhQUFXLElBQVgsRUFBaUIsWUFBakI7O0FBRUEsU0FBTyxLQUFQO0FBQ0Q7O0FBR00sU0FBUyxhQUFULENBQXVCLElBQXZCLEVBQTZCLFdBQTdCLEVBQXNEO0FBQUEsTUFBWixJQUFZLHlEQUFMLElBQUs7O0FBQzNELG9CQUFrQixJQUFsQjtBQUNBLFlBQVUsSUFBVixFQUFnQixXQUFoQjtBQUNBLFNBQU8sTUFBUDtBQUNEOztBQUdNLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0QixRQUE1QixFQUFzQyxJQUF0QyxFQUEyQzs7QUFDaEQsb0JBQWtCLElBQWxCLEVBQXdCO0FBQ3RCLFVBQU0sVUFEZ0I7QUFFdEIsc0JBRnNCO0FBR3RCLFlBQVEsUUFIYztBQUl0QjtBQUpzQixHQUF4QjtBQU1BLFNBQU8sTUFBUDtBQUNEOztBQUdNLFNBQVMsV0FBVCxDQUFxQixJQUFyQixFQUEyQixRQUEzQixFQUFxQyxJQUFyQyxFQUEwQzs7QUFDL0Msb0JBQWtCLElBQWxCLEVBQXdCO0FBQ3RCLFVBQU0sV0FEZ0I7QUFFdEIsc0JBRnNCO0FBR3RCLFlBQVEsT0FIYztBQUl0QjtBQUpzQixHQUF4Qjs7QUFPQSxTQUFPLEtBQVA7QUFDRDs7QUFHTSxTQUFTLFdBQVQsQ0FBcUIsSUFBckIsRUFBMkIsTUFBM0IsRUFBK0M7QUFBQSxNQUFaLElBQVkseURBQUwsSUFBSzs7QUFDcEQsb0JBQWtCLElBQWxCO0FBQ0EsWUFBVSxJQUFWLEVBQWdCLE1BQWhCO0FBQ0E7QUFDQSxlQUFhLGNBQWI7QUFDQSxTQUFPLGlCQUFQO0FBQ0Q7O0FBR00sU0FBUyxZQUFULENBQXNCLElBQXRCLEVBQTRCLE1BQTVCLEVBQWdEO0FBQUEsTUFBWixJQUFZLHlEQUFMLElBQUs7O0FBQ3JELG9CQUFrQixJQUFsQjtBQUNBLGFBQVcsSUFBWCxFQUFpQixNQUFqQjtBQUNBO0FBQ0EsZUFBYSxjQUFiO0FBQ0EsU0FBTyxpQkFBUDtBQUNEOzs7QUFJRCxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEIsWUFBMUIsRUFBd0MsS0FBeEMsRUFBOEM7QUFDNUMsTUFBSSxZQUFZLEtBQUssVUFBckI7O0FBRUEsTUFBRyxvQkFBb0IsS0FBdkIsRUFBNkI7QUFDM0IsUUFBRyxlQUFlLFVBQVUsTUFBNUIsRUFBbUM7QUFDakMscUJBQWUsVUFBVSxNQUF6QjtBQUNEO0FBQ0Y7O0FBRUQsTUFBRyxPQUFPLEtBQVAsS0FBaUIsV0FBcEIsRUFBZ0M7QUFDOUIsWUFBUSxhQUFhLElBQWIsRUFBbUIsUUFBbkIsRUFBNkIsWUFBN0IsQ0FBUjtBQUNEOztBQUVELG1CQUFpQixLQUFqQjs7O0FBR0EsTUFBRyxNQUFNLE1BQU4sS0FBaUIsWUFBcEIsRUFBaUM7QUFDL0IsaUJBQWEsQ0FBYjtBQUNBLGdCQUFZLENBQVo7QUFDRCxHQUhELE1BR0s7QUFDSCxpQkFBYSxlQUFlLE1BQU0sTUFBbEM7QUFDQSxnQkFBWSxhQUFhLGFBQXpCO0FBQ0Q7O0FBRUQsWUFBVSxVQUFWO0FBQ0EsV0FBUyxTQUFUOztBQUVBLFNBQU8sS0FBUDtBQUNEOzs7QUFJRCxTQUFTLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUIsV0FBekIsRUFBc0MsS0FBdEMsRUFBNEM7QUFDMUMsTUFBSSxZQUFZLEtBQUssVUFBckI7O0FBRUEsTUFBRyxvQkFBb0IsS0FBdkIsRUFBNkI7QUFDM0IsUUFBRyxjQUFjLFVBQVUsS0FBM0IsRUFBaUM7QUFDL0Isb0JBQWMsVUFBVSxLQUF4QjtBQUNEO0FBQ0Y7O0FBRUQsTUFBRyxPQUFPLEtBQVAsS0FBaUIsV0FBcEIsRUFBZ0M7QUFDOUIsWUFBUSxhQUFhLElBQWIsRUFBbUIsT0FBbkIsRUFBNEIsV0FBNUIsQ0FBUjtBQUNEOztBQUVELG1CQUFpQixLQUFqQjs7O0FBR0EsTUFBRyxNQUFNLEtBQU4sS0FBZ0IsV0FBbkIsRUFBK0I7QUFDN0IsZ0JBQVksQ0FBWjtBQUNBLGlCQUFhLENBQWI7QUFDRCxHQUhELE1BR0s7QUFDSCxnQkFBWSxjQUFjLEtBQTFCO0FBQ0EsaUJBQWEsWUFBWSxhQUF6QjtBQUNEOztBQUVELFdBQVMsU0FBVDtBQUNBLFlBQVUsVUFBVjs7QUFFQSxTQUFPLE1BQVA7QUFDRDs7O0FBSUQsU0FBUyxRQUFULENBQWtCLElBQWxCLEVBQXdCLFNBQXhCLEVBQW1DLFVBQW5DLEVBQStDLGVBQS9DLEVBQWdFLFVBQWhFLEVBQXlGO0FBQUEsTUFBYixLQUFhLHlEQUFMLElBQUs7OztBQUV2RixNQUFJLElBQUksQ0FBUjtNQUNFLGlCQURGO01BRUUsa0JBRkY7TUFHRSxzQkFIRjtNQUlFLGlCQUpGO01BS0UsWUFBWSxLQUFLLFVBTG5COztBQU9BLE1BQUcsb0JBQW9CLEtBQXZCLEVBQTZCO0FBQzNCLFFBQUcsWUFBWSxVQUFVLEdBQXpCLEVBQTZCO0FBQzNCLGtCQUFZLFVBQVUsR0FBdEI7QUFDRDtBQUNGOztBQUVELE1BQUcsVUFBVSxJQUFiLEVBQWtCO0FBQ2hCLFlBQVEsYUFBYSxJQUFiLEVBQW1CLEtBQW5CLEVBQTBCLFNBQTFCLENBQVI7QUFDRDs7QUFFRCxtQkFBaUIsS0FBakI7OztBQUdBLFNBQU0sY0FBYyxpQkFBcEIsRUFBc0M7QUFDcEM7QUFDQSxrQkFBYyxpQkFBZDtBQUNEOztBQUVELFNBQU0sa0JBQWtCLFlBQXhCLEVBQXFDO0FBQ25DO0FBQ0EsdUJBQW1CLFlBQW5CO0FBQ0Q7O0FBRUQsU0FBTSxhQUFhLFNBQW5CLEVBQTZCO0FBQzNCO0FBQ0Esa0JBQWMsU0FBZDtBQUNEOztBQUVELFVBQVEsYUFBYSxJQUFiLEVBQW1CLEtBQW5CLEVBQTBCLFNBQTFCLEVBQXFDLEtBQXJDLENBQVI7QUFDQSxPQUFJLElBQUksS0FBUixFQUFlLEtBQUssQ0FBcEIsRUFBdUIsR0FBdkIsRUFBMkI7QUFDekIsWUFBUSxLQUFLLFdBQUwsQ0FBaUIsQ0FBakIsQ0FBUjtBQUNBLFFBQUcsTUFBTSxHQUFOLElBQWEsU0FBaEIsRUFBMEI7QUFDeEIsdUJBQWlCLEtBQWpCO0FBQ0E7QUFDRDtBQUNGOzs7QUFHRCxhQUFXLGFBQWEsSUFBeEI7QUFDQSxrQkFBZ0Isa0JBQWtCLFNBQWxDO0FBQ0EsY0FBWSxhQUFhLElBQXpCO0FBQ0EsYUFBVyxZQUFZLEdBQXZCLEM7Ozs7OztBQU1BLGVBQWMsV0FBVyxXQUFaLEdBQTJCLGFBQXhDO0FBQ0EsZ0JBQWUsWUFBWSxZQUFiLEdBQTZCLGFBQTNDO0FBQ0EsZ0JBQWUsZ0JBQWdCLGlCQUFqQixHQUFzQyxhQUFwRDtBQUNBLGdCQUFjLFdBQVcsYUFBekI7QUFDQSxjQUFZLGFBQWEsYUFBekI7Ozs7QUFJQSxRQUFNLFNBQU47QUFDQSxTQUFPLFVBQVA7QUFDQSxjQUFZLGVBQVo7QUFDQSxTQUFPLFVBQVA7OztBQUdBLFlBQVUsVUFBVjs7QUFFQSxXQUFTLFNBQVQ7OztBQUdEOztBQUdELFNBQVMscUJBQVQsR0FBZ0M7O0FBRTlCLE1BQUksTUFBTSxNQUFNLFNBQU4sQ0FBVjtBQUNBLFNBQU0sT0FBTyxpQkFBYixFQUErQjtBQUM3QjtBQUNBLFdBQU8saUJBQVA7QUFDQSxXQUFNLFlBQVksWUFBbEIsRUFBK0I7QUFDN0IsbUJBQWEsWUFBYjtBQUNBO0FBQ0EsYUFBTSxPQUFPLFNBQWIsRUFBdUI7QUFDckIsZ0JBQVEsU0FBUjtBQUNBO0FBQ0Q7QUFDRjtBQUNGO0FBQ0QsU0FBTyxNQUFNLEdBQU4sQ0FBUDtBQUNEOzs7QUFJRCxTQUFTLGdCQUFULENBQTBCLEtBQTFCLEVBQWdDOztBQUU5QixRQUFNLE1BQU0sR0FBWjtBQUNBLGNBQVksTUFBTSxTQUFsQjtBQUNBLGdCQUFjLE1BQU0sV0FBcEI7O0FBRUEsZ0JBQWMsTUFBTSxXQUFwQjtBQUNBLGlCQUFlLE1BQU0sWUFBckI7QUFDQSxzQkFBb0IsTUFBTSxpQkFBMUI7QUFDQSxpQkFBZSxNQUFNLFlBQXJCO0FBQ0Esa0JBQWdCLE1BQU0sYUFBdEI7QUFDQSxtQkFBaUIsTUFBTSxjQUF2Qjs7QUFFQSxRQUFNLE1BQU0sR0FBWjtBQUNBLFNBQU8sTUFBTSxJQUFiO0FBQ0EsY0FBWSxNQUFNLFNBQWxCO0FBQ0EsU0FBTyxNQUFNLElBQWI7O0FBRUEsVUFBUSxNQUFNLEtBQWQ7QUFDQSxXQUFTLE1BQU0sTUFBZjs7OztBQUlEOztBQUdELFNBQVMsZUFBVCxDQUF5QixJQUF6QixFQUE4QjtBQUM1QixNQUFJLGlCQUFKO01BQ0UsZUFBZSxFQURqQjs7QUFHQSxVQUFPLFVBQVA7O0FBRUUsU0FBSyxRQUFMOztBQUVFLG1CQUFhLE1BQWIsR0FBc0IsTUFBTSxTQUFTLElBQWYsSUFBdUIsSUFBN0M7QUFDQSxtQkFBYSxhQUFiLEdBQTZCLE1BQU0sTUFBTixDQUE3QjtBQUNBOztBQUVGLFNBQUssT0FBTDs7QUFFRSxtQkFBYSxLQUFiLEdBQXFCLE1BQU0sS0FBTixDQUFyQjs7QUFFQTs7QUFFRixTQUFLLFdBQUw7QUFDQSxTQUFLLGNBQUw7QUFDRSxtQkFBYSxHQUFiLEdBQW1CLEdBQW5CO0FBQ0EsbUJBQWEsSUFBYixHQUFvQixJQUFwQjtBQUNBLG1CQUFhLFNBQWIsR0FBeUIsU0FBekI7QUFDQSxtQkFBYSxJQUFiLEdBQW9CLElBQXBCOztBQUVBLG1CQUFhLFlBQWIsR0FBNEIsTUFBTSxHQUFOLEdBQVksSUFBWixHQUFtQixHQUFuQixHQUF5QixTQUF6QixHQUFxQyxHQUFyQyxHQUEyQyxnQkFBZ0IsSUFBaEIsQ0FBdkU7QUFDQTs7QUFFRixTQUFLLE1BQUw7QUFDRSxpQkFBVyx1QkFBWSxNQUFaLENBQVg7QUFDQSxtQkFBYSxJQUFiLEdBQW9CLFNBQVMsSUFBN0I7QUFDQSxtQkFBYSxNQUFiLEdBQXNCLFNBQVMsTUFBL0I7QUFDQSxtQkFBYSxNQUFiLEdBQXNCLFNBQVMsTUFBL0I7QUFDQSxtQkFBYSxXQUFiLEdBQTJCLFNBQVMsV0FBcEM7QUFDQSxtQkFBYSxZQUFiLEdBQTRCLFNBQVMsWUFBckM7QUFDQTs7QUFFRixTQUFLLEtBQUw7OztBQUdFLG1CQUFhLE1BQWIsR0FBc0IsTUFBTSxTQUFTLElBQWYsSUFBdUIsSUFBN0M7QUFDQSxtQkFBYSxhQUFiLEdBQTZCLE1BQU0sTUFBTixDQUE3Qjs7OztBQUlBLG1CQUFhLEtBQWIsR0FBcUIsTUFBTSxLQUFOLENBQXJCOzs7O0FBSUEsbUJBQWEsR0FBYixHQUFtQixHQUFuQjtBQUNBLG1CQUFhLElBQWIsR0FBb0IsSUFBcEI7QUFDQSxtQkFBYSxTQUFiLEdBQXlCLFNBQXpCO0FBQ0EsbUJBQWEsSUFBYixHQUFvQixJQUFwQjs7QUFFQSxtQkFBYSxZQUFiLEdBQTRCLE1BQU0sR0FBTixHQUFZLElBQVosR0FBbUIsR0FBbkIsR0FBeUIsU0FBekIsR0FBcUMsR0FBckMsR0FBMkMsZ0JBQWdCLElBQWhCLENBQXZFOzs7QUFHQSxpQkFBVyx1QkFBWSxNQUFaLENBQVg7QUFDQSxtQkFBYSxJQUFiLEdBQW9CLFNBQVMsSUFBN0I7QUFDQSxtQkFBYSxNQUFiLEdBQXNCLFNBQVMsTUFBL0I7QUFDQSxtQkFBYSxNQUFiLEdBQXNCLFNBQVMsTUFBL0I7QUFDQSxtQkFBYSxXQUFiLEdBQTJCLFNBQVMsV0FBcEM7QUFDQSxtQkFBYSxZQUFiLEdBQTRCLFNBQVMsWUFBckM7OztBQUdBLG1CQUFhLEdBQWIsR0FBbUIsTUFBTSxNQUFNLEtBQUssYUFBakIsRUFBZ0MsQ0FBaEMsQ0FBbkI7QUFDQSxtQkFBYSxTQUFiLEdBQXlCLFNBQXpCO0FBQ0EsbUJBQWEsV0FBYixHQUEyQixXQUEzQjs7QUFFQSxtQkFBYSxXQUFiLEdBQTJCLFdBQTNCO0FBQ0EsbUJBQWEsWUFBYixHQUE0QixZQUE1QjtBQUNBLG1CQUFhLGlCQUFiLEdBQWlDLGlCQUFqQzs7QUFFQSxtQkFBYSxZQUFiLEdBQTRCLFlBQTVCO0FBQ0EsbUJBQWEsYUFBYixHQUE2QixhQUE3QjtBQUNBLG1CQUFhLGNBQWIsR0FBOEIsY0FBOUI7OztBQUdBLG1CQUFhLFVBQWIsR0FBMEIsUUFBUSxLQUFLLGNBQXZDOztBQUVBO0FBQ0Y7QUFDRSxhQUFPLElBQVA7QUE5RUo7O0FBaUZBLFNBQU8sWUFBUDtBQUNEOztBQUdELFNBQVMsZUFBVCxDQUF5QixDQUF6QixFQUEyQjtBQUN6QixNQUFHLE1BQU0sQ0FBVCxFQUFXO0FBQ1QsUUFBSSxLQUFKO0FBQ0QsR0FGRCxNQUVNLElBQUcsSUFBSSxFQUFQLEVBQVU7QUFDZCxRQUFJLE9BQU8sQ0FBWDtBQUNELEdBRkssTUFFQSxJQUFHLElBQUksR0FBUCxFQUFXO0FBQ2YsUUFBSSxNQUFNLENBQVY7QUFDRDtBQUNELFNBQU8sQ0FBUDtBQUNEOzs7QUFJTSxTQUFTLFlBQVQsQ0FBc0IsSUFBdEIsRUFBNEIsSUFBNUIsRUFBa0MsTUFBbEMsRUFBMEMsSUFBMUMsRUFBZ0QsS0FBaEQsRUFBc0Q7QUFDM0QsTUFBRyxTQUFTLFFBQVosRUFBcUI7QUFDbkIsZUFBVyxJQUFYLEVBQWlCLE1BQWpCLEVBQXlCLEtBQXpCO0FBQ0QsR0FGRCxNQUVNLElBQUcsU0FBUyxPQUFaLEVBQW9CO0FBQ3hCLGNBQVUsSUFBVixFQUFnQixNQUFoQixFQUF3QixLQUF4QjtBQUNEO0FBQ0QsZUFBYSxJQUFiO0FBQ0EsTUFBRyxlQUFlLEtBQWxCLEVBQXdCO0FBQ3RCO0FBQ0Q7QUFDRCxTQUFPLGdCQUFnQixJQUFoQixDQUFQO0FBQ0Q7OztBQUlNLFNBQVMsaUJBQVQsQ0FBMkIsSUFBM0IsRUFBaUMsUUFBakMsRUFBMEM7QUFBQSxNQUU3QyxJQUY2QyxHQU8zQyxRQVAyQyxDQUU3QyxJQUY2QztBQUFBLE07QUFHN0MsUUFINkMsR0FPM0MsUUFQMkMsQ0FHN0MsTUFINkM7QUFBQSx5QkFPM0MsUUFQMkMsQ0FJN0MsTUFKNkM7QUFBQSxNQUlyQyxNQUpxQyxvQ0FJNUIsS0FKNEI7QUFBQSx1QkFPM0MsUUFQMkMsQ0FLN0MsSUFMNkM7QUFBQSxNQUt2QyxJQUx1QyxrQ0FLaEMsSUFMZ0M7QUFBQSx1QkFPM0MsUUFQMkMsQ0FNN0MsSUFONkM7QUFBQSxNQU12QyxJQU51QyxrQ0FNaEMsQ0FBQyxDQU4rQjs7O0FBUy9DLE1BQUcscUJBQXFCLE9BQXJCLENBQTZCLE1BQTdCLE1BQXlDLENBQUMsQ0FBN0MsRUFBK0M7QUFDN0MsWUFBUSxJQUFSLHlEQUFnRSxNQUFoRTtBQUNBLGFBQVMsS0FBVDtBQUNEOztBQUVELGVBQWEsTUFBYjtBQUNBLG9CQUFrQixJQUFsQjs7QUFFQSxNQUFHLGVBQWUsT0FBZixDQUF1QixJQUF2QixNQUFpQyxDQUFDLENBQXJDLEVBQXVDO0FBQ3JDLFlBQVEsS0FBUix1QkFBa0MsSUFBbEM7QUFDQSxXQUFPLEtBQVA7QUFDRDs7QUFHRCxVQUFPLElBQVA7O0FBRUUsU0FBSyxXQUFMO0FBQ0EsU0FBSyxjQUFMO0FBQUEsbUNBQzZFLE1BRDdFOztBQUFBO0FBQUEsVUFDTyxTQURQLDRCQUNtQixDQURuQjtBQUFBO0FBQUEsVUFDc0IsVUFEdEIsNkJBQ21DLENBRG5DO0FBQUE7QUFBQSxVQUNzQyxlQUR0Qyw2QkFDd0QsQ0FEeEQ7QUFBQTtBQUFBLFVBQzJELFVBRDNELDZCQUN3RSxDQUR4RTs7O0FBR0UsZUFBUyxJQUFULEVBQWUsU0FBZixFQUEwQixVQUExQixFQUFzQyxlQUF0QyxFQUF1RCxVQUF2RDtBQUNBLGFBQU8sZ0JBQWdCLElBQWhCLENBQVA7O0FBRUYsU0FBSyxNQUFMOzs7QUFBQSxvQ0FFb0YsTUFGcEY7O0FBQUE7QUFBQSxVQUVPLFVBRlAsNkJBRW9CLENBRnBCO0FBQUE7QUFBQSxVQUV1QixZQUZ2Qiw4QkFFc0MsQ0FGdEM7QUFBQTtBQUFBLFVBRXlDLFlBRnpDLDhCQUV3RCxDQUZ4RDtBQUFBO0FBQUEsVUFFMkQsaUJBRjNELDhCQUUrRSxDQUYvRTs7QUFHRSxVQUFJLFNBQVMsQ0FBYjtBQUNBLGdCQUFVLGFBQWEsRUFBYixHQUFrQixFQUFsQixHQUF1QixJQUFqQyxDO0FBQ0EsZ0JBQVUsZUFBZSxFQUFmLEdBQW9CLElBQTlCLEM7QUFDQSxnQkFBVSxlQUFlLElBQXpCLEM7QUFDQSxnQkFBVSxpQkFBVixDOztBQUVBLGlCQUFXLElBQVgsRUFBaUIsTUFBakI7QUFDQTtBQUNBLGFBQU8sZ0JBQWdCLElBQWhCLENBQVA7O0FBRUYsU0FBSyxRQUFMO0FBQ0UsaUJBQVcsSUFBWCxFQUFpQixNQUFqQjtBQUNBO0FBQ0EsYUFBTyxnQkFBZ0IsSUFBaEIsQ0FBUDs7QUFFRixTQUFLLE9BQUw7QUFDRSxnQkFBVSxJQUFWLEVBQWdCLE1BQWhCO0FBQ0E7QUFDQSxhQUFPLGdCQUFnQixJQUFoQixDQUFQOztBQUVGLFNBQUssTUFBTDtBQUNBLFNBQUssWUFBTDs7Ozs7O0FBTUUsY0FBUSxTQUFTLEtBQUssY0FBdEIsQzs7QUFFQSxVQUFHLFNBQVMsQ0FBQyxDQUFiLEVBQWU7QUFDYixnQkFBUSxNQUFNLFFBQVEsSUFBZCxJQUFzQixJQUE5Qjs7O0FBR0Q7QUFDRCxnQkFBVSxJQUFWLEVBQWdCLEtBQWhCO0FBQ0E7QUFDQSxVQUFJLE1BQU0sZ0JBQWdCLElBQWhCLENBQVY7O0FBRUEsYUFBTyxHQUFQOztBQUVGO0FBQ0UsYUFBTyxLQUFQO0FBckRKO0FBdUREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDamZEOztBQUlBOztBQUlBOztBQUlBOztBQUlBOztBQUlBOztBQUlBOztBQUlBOztBQUlBOztBQU1BOztBQVVBOztBQUlBOztBQUlBOztBQUtBLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLEdBQVU7QUFDaEM7QUFDRCxDQUZEOztBQUlBLElBQU0sUUFBUTtBQUNaLFdBQVMsYUFERzs7O0FBSVosa0JBSlk7OztBQU9aLHdDQVBZOzs7QUFVWiwyQ0FWWTs7O0FBYVoseUNBYlk7OztBQWdCWix3Q0FoQlk7OztBQW1CWixrQ0FuQlk7QUFvQlosOENBcEJZO0FBcUJaLDhDQXJCWTs7O0FBd0JaLHlDQXhCWTtBQXlCWix5Q0F6Qlk7QUEwQlosMkNBMUJZO0FBMkJaLDZDQTNCWTtBQTRCWiwrQ0E1Qlk7QUE2QlosaURBN0JZO0FBOEJaLG1EQTlCWTs7O0FBaUNaLGtDQWpDWTs7O0FBb0NaLCtCQXBDWTs7O0FBdUNaLGtCQXZDWTs7O0FBMENaLHFCQTFDWTs7O0FBNkNaLGtCQTdDWTs7O0FBZ0RaLG9DQWhEWTs7QUFrRFosS0FsRFksZUFrRFIsRUFsRFEsRUFrREw7QUFDTCxZQUFPLEVBQVA7QUFDRSxXQUFLLFdBQUw7QUFDRSxnQkFBUSxHQUFSO0FBY0E7QUFDRjtBQWpCRjtBQW1CRDtBQXRFVyxDQUFkOztrQkF5RWUsSzs7O0FBSWIsSTs7OztBQUdBLGE7Ozs7QUFHQSxjOzs7O0FBR0EsWTs7OztBQUdBLGE7Ozs7QUFHQSxlLEdBQUEsZTtRQUNBLGU7UUFDQSxlOzs7O0FBR0EsYTtRQUNBLGE7UUFDQSxjO1FBQ0EsZTtRQUNBLGdCO1FBQ0EsaUI7UUFDQSxrQjs7OztBQUdBLFM7Ozs7QUFHQSxROzs7O0FBR0EsSTs7OztBQUdBLEs7Ozs7QUFHQSxJOzs7O0FBR0EsVTs7Ozs7Ozs7Ozs7UUN4SWMsTyxHQUFBLE87UUErQkEsWSxHQUFBLFk7O0FBakZoQjs7QUFDQTs7OztJQUdNLE07QUFFSixrQkFBWSxVQUFaLEVBQXdCLEtBQXhCLEVBQThCO0FBQUE7O0FBQzVCLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLFVBQUwsR0FBa0IsVUFBbEI7O0FBRUEsUUFBRyxLQUFLLFVBQUwsS0FBb0IsQ0FBQyxDQUFyQixJQUEwQixPQUFPLEtBQUssVUFBTCxDQUFnQixNQUF2QixLQUFrQyxXQUEvRCxFQUEyRTs7QUFFekUsV0FBSyxNQUFMLEdBQWMsb0JBQVEsZ0JBQVIsRUFBZDtBQUNBLFdBQUssTUFBTCxDQUFZLElBQVosR0FBbUIsTUFBbkI7QUFDQSxXQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXNCLEtBQXRCLEdBQThCLE1BQU0sU0FBcEM7QUFDRCxLQUxELE1BS0s7QUFDSCxXQUFLLE1BQUwsR0FBYyxvQkFBUSxrQkFBUixFQUFkO0FBQ0EsV0FBSyxNQUFMLENBQVksTUFBWixHQUFxQixXQUFXLE1BQWhDOztBQUVEO0FBQ0QsU0FBSyxNQUFMLEdBQWMsb0JBQVEsVUFBUixFQUFkO0FBQ0EsU0FBSyxNQUFMLEdBQWMsTUFBTSxLQUFOLEdBQWMsR0FBNUI7QUFDQSxTQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEtBQWpCLEdBQXlCLEtBQUssTUFBOUI7QUFDQSxTQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLEtBQUssTUFBekI7O0FBRUQ7Ozs7MEJBRUssSSxFQUFLOztBQUVULFdBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsSUFBbEI7QUFDRDs7O3lCQUVJLEksRUFBTSxFLEVBQUc7QUFBQSx3QkFDbUQsS0FBSyxVQUR4RDtBQUFBLFVBQ1AsZUFETyxlQUNQLGVBRE87QUFBQSxVQUNVLGVBRFYsZUFDVSxlQURWO0FBQUEsVUFDMkIsb0JBRDNCLGVBQzJCLG9CQUQzQjs7QUFFWixVQUFHLG1CQUFtQixlQUF0QixFQUFzQztBQUNwQyxhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE9BQU8sZUFBeEI7QUFDQSxnQkFBUSxLQUFLLE1BQWIsRUFBcUI7QUFDbkIsMENBRG1CO0FBRW5CLDBDQUZtQjtBQUduQjtBQUhtQixTQUFyQjtBQUtELE9BUEQsTUFPSztBQUNILGFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsSUFBakI7QUFDRDs7QUFFRCxXQUFLLE1BQUwsQ0FBWSxPQUFaLEdBQXNCLEVBQXRCO0FBQ0Q7Ozs7OztBQUlJLFNBQVMsT0FBVCxDQUFpQixRQUFqQixFQUEyQixRQUEzQixFQUFvQztBQUN6QyxNQUFJLE1BQU0sb0JBQVEsV0FBbEI7QUFDQSxNQUFJLGVBQUo7TUFBWSxVQUFaO01BQWUsYUFBZjs7O0FBR0EsVUFBTyxTQUFTLGVBQWhCOztBQUVFLFNBQUssUUFBTDtBQUNFLGVBQVMsSUFBVCxDQUFjLHVCQUFkLENBQXNDLFNBQVMsSUFBVCxDQUFjLEtBQXBELEVBQTJELEdBQTNEO0FBQ0EsZUFBUyxJQUFULENBQWMsdUJBQWQsQ0FBc0MsQ0FBdEMsRUFBeUMsTUFBTSxTQUFTLGVBQXhEO0FBQ0E7O0FBRUYsU0FBSyxhQUFMO0FBQ0UsZUFBUyw4QkFBbUIsR0FBbkIsRUFBd0IsU0FBeEIsRUFBbUMsU0FBUyxJQUFULENBQWMsS0FBakQsQ0FBVDtBQUNBLGVBQVMsSUFBVCxDQUFjLG1CQUFkLENBQWtDLE1BQWxDLEVBQTBDLEdBQTFDLEVBQStDLFNBQVMsZUFBeEQ7QUFDQTs7QUFFRixTQUFLLE9BQUw7QUFDRSxhQUFPLFNBQVMsb0JBQVQsQ0FBOEIsTUFBckM7QUFDQSxlQUFTLElBQUksWUFBSixDQUFpQixJQUFqQixDQUFUO0FBQ0EsV0FBSSxJQUFJLENBQVIsRUFBVyxJQUFJLElBQWYsRUFBcUIsR0FBckIsRUFBeUI7QUFDdkIsZUFBTyxDQUFQLElBQVksU0FBUyxvQkFBVCxDQUE4QixDQUE5QixJQUFtQyxTQUFTLElBQVQsQ0FBYyxLQUE3RDtBQUNEO0FBQ0QsZUFBUyxJQUFULENBQWMsbUJBQWQsQ0FBa0MsTUFBbEMsRUFBMEMsR0FBMUMsRUFBK0MsU0FBUyxlQUF4RDtBQUNBOztBQUVGO0FBckJGO0FBdUJEOztBQUdNLFNBQVMsWUFBVCxHQUE4QjtBQUFBLG9DQUFMLElBQUs7QUFBTCxRQUFLO0FBQUE7O0FBQ25DLDRDQUFXLE1BQVgsZ0JBQXFCLElBQXJCO0FBQ0Q7Ozs7Ozs7O0FDbkZELElBQU0sVUFBVTtBQUNkLFlBQVUsMG9KQURJO0FBRWQsWUFBVSw4SUFGSTtBQUdkLFlBQVUsa3hEQUhJO0FBSWQsV0FBUztBQUpLLENBQWhCOztrQkFPZSxPOzs7Ozs7Ozs7OztBQ1BmOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztJQUdxQixTO0FBRW5CLHFCQUFZLElBQVosRUFBaUI7QUFBQTs7QUFDZixTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0Q7Ozs7eUJBR0ksTSxFQUFPO0FBQ1YsV0FBSyxpQkFBTCxHQUF5QixNQUF6QjtBQUNBLFdBQUssZUFBTCxHQUF1QixNQUF2QjtBQUNBLFdBQUssTUFBTCxHQUFjLEtBQUssSUFBTCxDQUFVLFVBQXhCO0FBQ0EsV0FBSyxTQUFMLEdBQWlCLEtBQUssTUFBTCxDQUFZLE1BQTdCO0FBQ0EsV0FBSyxLQUFMLEdBQWEsQ0FBYjtBQUNBLFdBQUssT0FBTCxHQUFlLENBQWY7QUFDQSxXQUFLLFdBQUwsR0FBbUIsQ0FBbkI7QUFDQSxXQUFLLFVBQUwsR0FBa0IsS0FBbEIsQztBQUNBLFdBQUssZUFBTCxHQUF1QixLQUF2QjtBQUNBLFdBQUssUUFBTCxDQUFjLEtBQUssZUFBbkI7QUFDRDs7O2lDQUdZLFMsRUFBVTtBQUNyQixXQUFLLFNBQUwsR0FBaUIsU0FBakI7QUFDRDs7Ozs7OzZCQUdRLE0sRUFBTztBQUNkLFVBQUksSUFBSSxDQUFSO0FBRGM7QUFBQTtBQUFBOztBQUFBO0FBRWQsNkJBQWlCLEtBQUssTUFBdEIsOEhBQTZCO0FBQUEsY0FBckIsS0FBcUI7O0FBQzNCLGNBQUcsTUFBTSxNQUFOLElBQWdCLE1BQW5CLEVBQTBCO0FBQ3hCLGlCQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0E7QUFDRDtBQUNEO0FBQ0Q7QUFSYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVNkLFdBQUssVUFBTCxHQUFrQixTQUFTLEtBQUssSUFBTCxDQUFVLGFBQVYsQ0FBd0IsTUFBbkQ7QUFDQSxXQUFLLEtBQUwsR0FBYSxJQUFJLEdBQUosRUFBYjtBQUNBLFdBQUssZUFBTCxHQUF1QixLQUF2QjtBQUNEOzs7Z0NBR1U7QUFDVCxVQUFJLFNBQVMsRUFBYjs7QUFFQSxVQUFHLEtBQUssSUFBTCxDQUFVLEtBQVYsS0FBb0IsSUFBcEIsSUFBNEIsS0FBSyxJQUFMLENBQVUsYUFBVix1QkFBL0IsRUFBb0U7QUFDbEUsYUFBSyxPQUFMLEdBQWUsS0FBSyxlQUFMLEdBQXVCLEtBQUssSUFBTCxDQUFVLGFBQWpDLEdBQWlELENBQWhFOztBQUVEOztBQUVELFVBQUcsS0FBSyxJQUFMLENBQVUsS0FBVixLQUFvQixJQUF2QixFQUE0Qjs7QUFFMUIsWUFBRyxLQUFLLE9BQUwsSUFBZ0IsS0FBSyxJQUFMLENBQVUsYUFBVixDQUF3QixNQUF4QyxJQUFrRCxLQUFLLFVBQUwsS0FBb0IsS0FBekUsRUFBK0U7OztBQUc3RSxjQUFJLE9BQU8sS0FBSyxPQUFMLEdBQWUsS0FBSyxJQUFMLENBQVUsYUFBVixDQUF3QixNQUFsRDtBQUNBLGVBQUssT0FBTCxHQUFlLEtBQUssSUFBTCxDQUFVLFlBQVYsQ0FBdUIsTUFBdkIsR0FBZ0MsSUFBL0M7Ozs7QUFJQSxjQUFHLEtBQUssTUFBTCxLQUFnQixLQUFuQixFQUF5QjtBQUN2QixpQkFBSyxNQUFMLEdBQWMsSUFBZDtBQUNBLGdCQUFJLGFBQWEsS0FBSyxJQUFMLENBQVUsWUFBVixDQUF1QixNQUF4QztBQUNBLGdCQUFJLGNBQWMsS0FBSyxJQUFMLENBQVUsYUFBVixDQUF3QixNQUExQzs7QUFFQSxpQkFBSSxJQUFJLElBQUksS0FBSyxLQUFqQixFQUF3QixJQUFJLEtBQUssU0FBakMsRUFBNEMsR0FBNUMsRUFBZ0Q7QUFDOUMsa0JBQUksUUFBUSxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVo7O0FBRUEsa0JBQUcsTUFBTSxNQUFOLEdBQWUsV0FBbEIsRUFBOEI7QUFDNUIsc0JBQU0sSUFBTixHQUFhLEtBQUssU0FBTCxHQUFpQixNQUFNLE1BQXZCLEdBQWdDLEtBQUssZUFBbEQ7QUFDQSx1QkFBTyxJQUFQLENBQVksS0FBWjs7QUFFQSxvQkFBRyxNQUFNLElBQU4sS0FBZSxHQUFsQixFQUFzQjtBQUNwQix1QkFBSyxLQUFMLENBQVcsR0FBWCxDQUFlLE1BQU0sVUFBckIsRUFBaUMsTUFBTSxRQUF2QztBQUNEOztBQUVELHFCQUFLLEtBQUw7QUFDRCxlQVRELE1BU0s7QUFDSDtBQUNEO0FBQ0Y7OztBQUdELGdCQUFJLFdBQVcsS0FBSyxJQUFMLENBQVUsYUFBVixDQUF3QixLQUF4QixHQUFnQyxDQUEvQztBQUNBLGdCQUFJLFlBQVksS0FBSyxJQUFMLENBQVUsaUJBQVYsQ0FBNEIsRUFBQyxNQUFNLE9BQVAsRUFBZ0IsUUFBUSxRQUF4QixFQUFrQyxRQUFRLFFBQTFDLEVBQTVCLEVBQWlGLE1BQWpHOztBQXhCdUI7QUFBQTtBQUFBOztBQUFBO0FBMEJ2QixvQ0FBZ0IsS0FBSyxLQUFMLENBQVcsTUFBWCxFQUFoQixtSUFBb0M7QUFBQSxvQkFBNUIsSUFBNEI7O0FBQ2xDLG9CQUFJLFNBQVMsS0FBSyxNQUFsQjtBQUNBLG9CQUFJLFVBQVUsS0FBSyxPQUFuQjtBQUNBLG9CQUFHLFFBQVEsTUFBUixJQUFrQixXQUFyQixFQUFpQztBQUMvQjtBQUNEO0FBQ0Qsb0JBQUksU0FBUSwwQkFBYyxRQUFkLEVBQXdCLEdBQXhCLEVBQTZCLE9BQU8sS0FBcEMsRUFBMkMsQ0FBM0MsQ0FBWjtBQUNBLHVCQUFNLE1BQU4sR0FBZSxTQUFmO0FBQ0EsdUJBQU0sS0FBTixHQUFjLE9BQU8sS0FBckI7QUFDQSx1QkFBTSxNQUFOLEdBQWUsT0FBTyxNQUF0QjtBQUNBLHVCQUFNLFFBQU4sR0FBaUIsSUFBakI7QUFDQSx1QkFBTSxVQUFOLEdBQW1CLEtBQUssRUFBeEI7QUFDQSx1QkFBTSxJQUFOLEdBQWEsS0FBSyxTQUFMLEdBQWlCLE9BQU0sTUFBdkIsR0FBZ0MsS0FBSyxlQUFsRDs7QUFFQSx1QkFBTyxJQUFQLENBQVksTUFBWjtBQUNEOzs7Ozs7Ozs7Ozs7Ozs7QUF6Q3NCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBd0R2QixpQkFBSyxLQUFMLEdBQWEsSUFBSSxHQUFKLEVBQWI7QUFDQSxpQkFBSyxRQUFMLENBQWMsVUFBZDtBQUNBLGlCQUFLLFNBQUwsSUFBa0IsS0FBSyxJQUFMLENBQVUsYUFBNUI7QUFDQSxpQkFBSyxpQkFBTCxJQUEwQixLQUFLLElBQUwsQ0FBVSxhQUFwQzs7Ozs7O0FBTUQ7QUFDRixTQTFFRCxNQTBFSztBQUNILGlCQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0Q7QUFDRjs7Ozs7QUFLRCxXQUFJLElBQUksS0FBSSxLQUFLLEtBQWpCLEVBQXdCLEtBQUksS0FBSyxTQUFqQyxFQUE0QyxJQUE1QyxFQUFnRDtBQUM5QyxZQUFJLFVBQVEsS0FBSyxNQUFMLENBQVksRUFBWixDQUFaOztBQUVBLFlBQUcsUUFBTSxNQUFOLEdBQWUsS0FBSyxPQUF2QixFQUErQjs7OztBQUk3QixjQUFHLFFBQU0sSUFBTixLQUFlLE9BQWxCLEVBQTBCOztBQUV6QixXQUZELE1BRUs7QUFDSCxzQkFBTSxJQUFOLEdBQWMsS0FBSyxTQUFMLEdBQWlCLFFBQU0sTUFBdkIsR0FBZ0MsS0FBSyxlQUFuRDtBQUNBLHFCQUFPLElBQVAsQ0FBWSxPQUFaO0FBQ0Q7QUFDRCxlQUFLLEtBQUw7QUFDRCxTQVhELE1BV0s7QUFDSDtBQUNEO0FBQ0Y7QUFDRCxhQUFPLE1BQVA7QUFDRDs7OzJCQUdNLEksRUFBSztBQUNWLFVBQUksQ0FBSixFQUNFLEtBREYsRUFFRSxTQUZGLEVBR0UsS0FIRixFQUlFLE1BSkY7O0FBTUEsV0FBSyxXQUFMLEdBQW1CLEtBQUssT0FBeEI7O0FBRUEsVUFBRyxLQUFLLElBQUwsQ0FBVSxXQUFiLEVBQXlCO0FBQ3ZCLGFBQUssaUJBQUwsSUFBMEIsSUFBMUI7QUFDQSxhQUFLLE9BQUwsR0FBZSxLQUFLLGlCQUFMLHVCQUFmO0FBQ0EsaUJBQVMsS0FBSyxJQUFMLENBQVUsVUFBVixDQUFxQixpQkFBckIsQ0FBdUMsS0FBSyxPQUE1QyxDQUFUOztBQUVBLFlBQUcsS0FBSyxPQUFMLEdBQWUsS0FBSyxJQUFMLENBQVUsVUFBVixDQUFxQixTQUFwQyxJQUFpRCxLQUFLLGVBQUwsS0FBeUIsS0FBN0UsRUFBbUY7QUFBQTs7QUFDakYsZUFBSyxlQUFMLEdBQXVCLElBQXZCO0FBQ0EsZUFBSyxTQUFMLElBQWtCLEtBQUssSUFBTCxDQUFVLFVBQVYsQ0FBcUIsZ0JBQXZDOzs7QUFHQSxlQUFLLGlCQUFMLEdBQXlCLEtBQUssZUFBOUI7QUFDQSxlQUFLLGlCQUFMLElBQTBCLElBQTFCO0FBQ0EsZUFBSyxPQUFMLEdBQWUsS0FBSyxpQkFBTCx1QkFBZjtBQUNBLDZCQUFPLElBQVAsbUNBQWUsS0FBSyxTQUFMLEVBQWY7QUFDRDtBQUNGLE9BZkQsTUFlSztBQUNILGFBQUssaUJBQUwsSUFBMEIsSUFBMUI7QUFDQSxhQUFLLE9BQUwsR0FBZSxLQUFLLGlCQUFMLHVCQUFmO0FBQ0EsaUJBQVMsS0FBSyxTQUFMLEVBQVQ7O0FBRUQ7O0FBRUQsa0JBQVksT0FBTyxNQUFuQjs7Ozs7O0FBT0EsV0FBSSxJQUFJLENBQVIsRUFBVyxJQUFJLFNBQWYsRUFBMEIsR0FBMUIsRUFBOEI7QUFDNUIsZ0JBQVEsT0FBTyxDQUFQLENBQVI7QUFDQSxnQkFBUSxNQUFNLE1BQWQ7Ozs7Ozs7OztBQVNBLFlBQUcsTUFBTSxLQUFOLENBQVksS0FBWixLQUFzQixJQUF0QixJQUE4QixNQUFNLEtBQU4sS0FBZ0IsSUFBOUMsSUFBc0QsTUFBTSxLQUFOLEtBQWdCLElBQXpFLEVBQThFO0FBQzVFO0FBQ0Q7O0FBRUQsWUFBRyxDQUFDLE1BQU0sSUFBTixLQUFlLEdBQWYsSUFBc0IsTUFBTSxJQUFOLEtBQWUsR0FBdEMsS0FBOEMsT0FBTyxNQUFNLFFBQWIsS0FBMEIsV0FBM0UsRUFBdUY7OztBQUdyRjtBQUNEOztBQUdELFlBQUcsTUFBTSxJQUFOLEtBQWUsT0FBbEIsRUFBMEI7O0FBRXpCLFNBRkQsTUFFSzs7QUFFSCxrQkFBTSxnQkFBTixDQUF1QixLQUF2QixFQUE4QixJQUE5QixFOztBQUVBLGdCQUFHLE1BQU0sSUFBTixLQUFlLEdBQWxCLEVBQXNCO0FBQ3BCLG1CQUFLLEtBQUwsQ0FBVyxHQUFYLENBQWUsTUFBTSxVQUFyQixFQUFpQyxNQUFNLFFBQXZDO0FBQ0QsYUFGRCxNQUVNLElBQUcsTUFBTSxJQUFOLEtBQWUsR0FBbEIsRUFBc0I7QUFDMUIsbUJBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsTUFBTSxVQUF4QjtBQUNEO0FBQ0Y7QUFDRjs7O0FBR0QsYUFBTyxLQUFLLEtBQUwsSUFBYyxLQUFLLFNBQTFCLEM7QUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQXZPa0IsUzs7Ozs7Ozs7UUNlTCxhLEdBQUEsYTtBQXBCVCxJQUFNLG9DQUFjO0FBQ3pCLE9BQUssR0FEb0I7QUFFekIsT0FBSyxHQUZvQjtBQUd6QixRQUFNLEVBSG1CO0FBSXpCLGNBQVksQ0FKYTtBQUt6QixlQUFhLEdBTFk7QUFNekIsYUFBVyxDQU5jO0FBT3pCLGVBQWEsQ0FQWTtBQVF6QixpQkFBZSxDQVJVO0FBU3pCLG9CQUFrQixLQVRPO0FBVXpCLGdCQUFjLEtBVlc7QUFXekIsZ0JBQWMsS0FYVztBQVl6QixZQUFVLElBWmU7QUFhekIsUUFBTSxLQWJtQjtBQWN6QixpQkFBZSxDQWRVO0FBZXpCLGdCQUFjO0FBZlcsQ0FBcEI7O0FBa0JBLElBQUksa0NBQWEsR0FBakI7O0FBRUEsU0FBUyxhQUFULENBQXVCLElBQXZCLEVBQTRCO0FBQ2pDLFVBSFMsVUFHVCxnQkFBYSxJQUFiO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7OztBQ3JCRDs7QUFDQTs7QUFFQTs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVBLElBQUksWUFBWSxDQUFoQjtBQUNBLElBQUksaUJBQWlCLENBQXJCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXdCYSxJLFdBQUEsSTs7O2lDQUVTLEksRUFBSztBQUN2QixhQUFPLDBDQUFpQixJQUFqQixDQUFQO0FBQ0Q7OztzQ0FFd0IsSSxFQUFLO0FBQzVCLGFBQU8sK0NBQXNCLElBQXRCLENBQVA7QUFDRDs7O0FBRUQsa0JBQThCO0FBQUEsUUFBbEIsUUFBa0IseURBQUgsRUFBRzs7QUFBQTs7QUFFNUIsU0FBSyxFQUFMLFVBQWUsV0FBZixTQUE4QixJQUFJLElBQUosR0FBVyxPQUFYLEVBQTlCOztBQUY0Qix5QkFrQnhCLFFBbEJ3QixDQUsxQixJQUwwQjtBQUtwQixTQUFLLElBTGUsa0NBS1IsS0FBSyxFQUxHO0FBQUEsd0JBa0J4QixRQWxCd0IsQ0FNMUIsR0FOMEI7QUFNckIsU0FBSyxHQU5nQixpQ0FNVixzQkFBWSxHQU5GO0FBQUEsd0JBa0J4QixRQWxCd0IsQ0FPMUIsR0FQMEI7QUFPckIsU0FBSyxHQVBnQixpQ0FPVixzQkFBWSxHQVBGO0FBQUEseUJBa0J4QixRQWxCd0IsQ0FRMUIsSUFSMEI7QUFRcEIsU0FBSyxJQVJlLGtDQVFSLHNCQUFZLElBUko7QUFBQSw4QkFrQnhCLFFBbEJ3QixDQVMxQixTQVQwQjtBQVNmLFNBQUssU0FUVSx1Q0FTRSxzQkFBWSxTQVRkO0FBQUEsZ0NBa0J4QixRQWxCd0IsQ0FVMUIsV0FWMEI7QUFVYixTQUFLLFdBVlEseUNBVU0sc0JBQVksV0FWbEI7QUFBQSxnQ0FrQnhCLFFBbEJ3QixDQVcxQixhQVgwQjtBQVdYLFNBQUssYUFYTSx5Q0FXVSxzQkFBWSxhQVh0QjtBQUFBLGdDQWtCeEIsUUFsQndCLENBWTFCLGdCQVowQjtBQVlSLFNBQUssZ0JBWkcseUNBWWdCLHNCQUFZLGdCQVo1QjtBQUFBLGdDQWtCeEIsUUFsQndCLENBYTFCLFlBYjBCO0FBYVosU0FBSyxZQWJPLHlDQWFRLHNCQUFZLFlBYnBCO0FBQUEsNkJBa0J4QixRQWxCd0IsQ0FjMUIsUUFkMEI7QUFjaEIsU0FBSyxRQWRXLHNDQWNBLHNCQUFZLFFBZFo7QUFBQSx5QkFrQnhCLFFBbEJ3QixDQWUxQixJQWYwQjtBQWVwQixTQUFLLElBZmUsa0NBZVIsc0JBQVksSUFmSjtBQUFBLGdDQWtCeEIsUUFsQndCLENBZ0IxQixhQWhCMEI7QUFnQlgsU0FBSyxhQWhCTSx5Q0FnQlUsc0JBQVksYUFoQnRCO0FBQUEsZ0NBa0J4QixRQWxCd0IsQ0FpQjFCLFlBakIwQjtBQWlCWixTQUFLLFlBakJPLHlDQWlCUSxzQkFBWSxZQWpCcEI7OztBQW9CNUIsU0FBSyxXQUFMLEdBQW1CLENBQ2pCLDBCQUFjLENBQWQsRUFBaUIsMEJBQWUsS0FBaEMsRUFBdUMsS0FBSyxHQUE1QyxDQURpQixFQUVqQiwwQkFBYyxDQUFkLEVBQWlCLDBCQUFlLGNBQWhDLEVBQWdELEtBQUssU0FBckQsRUFBZ0UsS0FBSyxXQUFyRSxDQUZpQixDQUFuQjs7O0FBTUEsU0FBSyxpQkFBTCxHQUF5QixJQUF6QjtBQUNBLFNBQUssVUFBTCxHQUFrQiwwQkFBYyxDQUFkLEVBQWlCLDBCQUFlLFlBQWhDLENBQWxCOztBQUVBLFNBQUssT0FBTCxHQUFlLEVBQWY7QUFDQSxTQUFLLFdBQUwsR0FBbUIsSUFBSSxHQUFKLEVBQW5COztBQUVBLFNBQUssTUFBTCxHQUFjLEVBQWQ7QUFDQSxTQUFLLFVBQUwsR0FBa0IsSUFBSSxHQUFKLEVBQWxCOztBQUVBLFNBQUssT0FBTCxHQUFlLEVBQWY7QUFDQSxTQUFLLFdBQUwsR0FBbUIsSUFBSSxHQUFKLEVBQW5COztBQUVBLFNBQUssVUFBTCxHQUFrQixFQUFsQixDOztBQUVBLFNBQUssTUFBTCxHQUFjLEVBQWQ7QUFDQSxTQUFLLFVBQUwsR0FBa0IsSUFBSSxHQUFKLEVBQWxCOztBQUVBLFNBQUssVUFBTCxHQUFrQixFQUFsQjtBQUNBLFNBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLFNBQUssY0FBTCxHQUFzQixFQUF0QjtBQUNBLFNBQUssaUJBQUwsR0FBeUIsRUFBekI7O0FBRUEsU0FBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLEVBQXJCO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLEVBQXJCOztBQUVBLFNBQUssY0FBTCxHQUFzQixDQUF0QjtBQUNBLFNBQUssVUFBTCxHQUFrQix3QkFBYyxJQUFkLENBQWxCO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLHVCQUFhLElBQWIsQ0FBakI7O0FBRUEsU0FBSyxPQUFMLEdBQWUsS0FBZjtBQUNBLFNBQUssTUFBTCxHQUFjLEtBQWQ7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBakI7QUFDQSxTQUFLLFdBQUwsR0FBbUIsS0FBbkI7QUFDQSxTQUFLLE9BQUwsR0FBZSxJQUFmOztBQUVBLFNBQUssTUFBTCxHQUFjLEdBQWQ7QUFDQSxTQUFLLE9BQUwsR0FBZSxvQkFBUSxVQUFSLEVBQWY7QUFDQSxTQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLEtBQWxCLEdBQTBCLEtBQUssTUFBL0I7QUFDQSxTQUFLLE9BQUwsQ0FBYSxPQUFiOztBQUVBLFNBQUssVUFBTCxHQUFrQix5QkFBYyxJQUFkLENBQWxCO0FBQ0EsU0FBSyxnQkFBTCxHQUF3QixFQUF4QjtBQUNBLFNBQUssc0JBQUwsR0FBOEIsSUFBOUI7O0FBRUEsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUssWUFBTCxHQUFvQixFQUFDLFFBQVEsQ0FBVCxFQUFZLE9BQU8sQ0FBbkIsRUFBcEI7QUFDQSxTQUFLLGFBQUwsR0FBcUIsRUFBQyxRQUFRLENBQVQsRUFBWSxPQUFPLENBQW5CLEVBQXJCO0FBQ0EsU0FBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLENBQXJCO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLENBQXJCO0FBQ0EsU0FBSyxrQkFBTCxHQUEwQixDQUExQjtBQUVEOzs7O29DQUd1QjtBQUFBOztBQUFBLHdDQUFQLE1BQU87QUFBUCxjQUFPO0FBQUE7OztBQUV0QixhQUFPLE9BQVAsQ0FBZSxpQkFBUztBQUN0QixZQUFHLE1BQU0sSUFBTixLQUFlLDBCQUFlLGNBQWpDLEVBQWdEO0FBQzlDLGdCQUFLLHNCQUFMLEdBQThCLElBQTlCO0FBQ0Q7QUFDRCxjQUFLLFdBQUwsQ0FBaUIsSUFBakIsQ0FBc0IsS0FBdEI7QUFDRCxPQUxEO0FBTUEsV0FBSyxpQkFBTCxHQUF5QixJQUF6QjtBQUNEOzs7Z0NBRW1CO0FBQUE7O0FBQUEseUNBQVAsTUFBTztBQUFQLGNBQU87QUFBQTs7QUFDbEIsYUFBTyxPQUFQLENBQWUsVUFBQyxLQUFELEVBQVc7QUFBQTs7QUFDeEIsY0FBTSxLQUFOO0FBQ0EsY0FBTSxPQUFOLENBQWMsT0FBSyxPQUFuQjtBQUNBLGVBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsS0FBbEI7QUFDQSxlQUFLLFdBQUwsQ0FBaUIsR0FBakIsQ0FBcUIsTUFBTSxFQUEzQixFQUErQixLQUEvQjtBQUNBLDZCQUFLLFVBQUwsRUFBZ0IsSUFBaEIsc0NBQXdCLE1BQU0sT0FBOUI7QUFDQSw0QkFBSyxTQUFMLEVBQWUsSUFBZixxQ0FBdUIsTUFBTSxNQUE3QjtBQUNELE9BUEQ7QUFRRDs7Ozs7OzZCQUdhO0FBQUE7O0FBRVosVUFBSSxtQkFBbUIsS0FBdkI7O0FBRUEsVUFBRyxLQUFLLGlCQUFMLEtBQTJCLEtBQTNCLElBQ0UsS0FBSyxjQUFMLENBQW9CLE1BQXBCLEtBQStCLENBRGpDLElBRUUsS0FBSyxVQUFMLENBQWdCLE1BQWhCLEtBQTJCLENBRjdCLElBR0UsS0FBSyxZQUFMLENBQWtCLE1BQWxCLEtBQTZCLENBSC9CLElBSUUsS0FBSyxTQUFMLENBQWUsTUFBZixLQUEwQixDQUo1QixJQUtFLEtBQUssYUFBTCxDQUFtQixNQUFuQixLQUE4QixDQUxuQyxFQU1DO0FBQ0M7QUFDRDs7OztBQUlELGNBQVEsS0FBUixDQUFjLGFBQWQ7QUFDQSxjQUFRLElBQVIsQ0FBYSxPQUFiOzs7QUFHQSxVQUFHLEtBQUssaUJBQUwsS0FBMkIsSUFBOUIsRUFBbUM7O0FBRWpDLDJDQUFnQixJQUFoQixFQUFzQixLQUFLLFdBQTNCLEVBQXdDLEtBQUssU0FBN0M7QUFDQSxhQUFLLGlCQUFMLEdBQXlCLEtBQXpCO0FBQ0EsZ0JBQVEsR0FBUixDQUFZLGdCQUFaLEVBQThCLEtBQUssV0FBbkM7QUFDRDs7O0FBR0QsVUFBSSxhQUFhLEVBQWpCOzs7QUFJQSxjQUFRLEdBQVIsQ0FBWSxrQkFBWixFQUFnQyxLQUFLLGFBQXJDO0FBQ0EsV0FBSyxhQUFMLENBQW1CLE9BQW5CLENBQTJCLFVBQUMsSUFBRCxFQUFVO0FBQUE7O0FBQ25DLGVBQUssVUFBTCxDQUFnQixNQUFoQixDQUF1QixLQUFLLEVBQTVCO0FBQ0EsaUNBQUssY0FBTCxFQUFvQixJQUFwQiwwQ0FBNEIsS0FBSyxPQUFqQztBQUNELE9BSEQ7OztBQU9BLGNBQVEsR0FBUixDQUFZLGNBQVosRUFBNEIsS0FBSyxTQUFqQztBQUNBLFdBQUssU0FBTCxDQUFlLE9BQWYsQ0FBdUIsVUFBQyxJQUFELEVBQVU7QUFDL0IsYUFBSyxLQUFMO0FBQ0EsZUFBSyxVQUFMLENBQWdCLEdBQWhCLENBQW9CLEtBQUssRUFBekIsRUFBNkIsSUFBN0I7O0FBRUEsYUFBSyxNQUFMO0FBQ0QsT0FMRDs7O0FBU0EsY0FBUSxHQUFSLENBQVksa0JBQVosRUFBZ0MsS0FBSyxhQUFyQztBQUNBLFdBQUssYUFBTCxDQUFtQixPQUFuQixDQUEyQixVQUFDLElBQUQsRUFBVTtBQUNuQyxhQUFLLE1BQUw7QUFDRCxPQUZEOzs7QUFLQSxjQUFRLEdBQVIsQ0FBWSxrQkFBWixFQUFnQyxLQUFLLGFBQXJDO0FBQ0EsV0FBSyxhQUFMLENBQW1CLE9BQW5CLENBQTJCLFVBQUMsSUFBRCxFQUFVO0FBQUE7O0FBQ25DLGtDQUFLLGNBQUwsRUFBb0IsSUFBcEIsMkNBQTRCLEtBQUssT0FBakM7QUFDQSxlQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsS0FBSyxFQUE1QjtBQUNBLGFBQUssTUFBTDtBQUNELE9BSkQ7O0FBTUEsVUFBRyxLQUFLLGFBQUwsQ0FBbUIsTUFBbkIsR0FBNEIsQ0FBL0IsRUFBaUM7QUFDL0IsYUFBSyxNQUFMLEdBQWMsTUFBTSxJQUFOLENBQVcsS0FBSyxVQUFMLENBQWdCLE1BQWhCLEVBQVgsQ0FBZDtBQUNEOzs7QUFJRCxjQUFRLEdBQVIsQ0FBWSxtQkFBWixFQUFpQyxLQUFLLGNBQXRDO0FBQ0EsV0FBSyxjQUFMLENBQW9CLE9BQXBCLENBQTRCLFVBQUMsS0FBRCxFQUFXO0FBQ3JDLGVBQUssVUFBTCxDQUFnQixNQUFoQixDQUF1QixNQUFNLFFBQU4sQ0FBZSxFQUF0QztBQUNBLGVBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixNQUFNLEVBQTlCO0FBQ0QsT0FIRDs7QUFLQSx5QkFBbUIsS0FBSyxjQUFMLENBQW9CLE1BQXBCLEdBQTZCLENBQWhEOzs7QUFHQSxjQUFRLEdBQVIsQ0FBWSxlQUFaLEVBQTZCLEtBQUssVUFBbEM7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsVUFBQyxLQUFELEVBQVc7QUFDakMsZUFBSyxXQUFMLENBQWlCLEdBQWpCLENBQXFCLE1BQU0sRUFBM0IsRUFBK0IsS0FBL0I7QUFDQSxlQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLEtBQWxCO0FBQ0EsbUJBQVcsSUFBWCxDQUFnQixLQUFoQjs7QUFFRCxPQUxEOzs7QUFRQSxjQUFRLEdBQVIsQ0FBWSxVQUFaLEVBQXdCLEtBQUssWUFBN0I7QUFDQSxXQUFLLFlBQUwsQ0FBa0IsT0FBbEIsQ0FBMEIsVUFBQyxLQUFELEVBQVc7QUFDbkMsbUJBQVcsSUFBWCxDQUFnQixLQUFoQjtBQUNELE9BRkQ7Ozs7QUFNQSxjQUFRLElBQVIsQ0FBYSxPQUFiO0FBQ0EsVUFBRyxXQUFXLE1BQVgsR0FBb0IsQ0FBdkIsRUFBeUI7O0FBRXZCLGtEQUFpQixVQUFqQixzQkFBZ0MsS0FBSyxXQUFyQztBQUNBLGdCQUFRLEdBQVIsQ0FBWSxhQUFaLEVBQTJCLFdBQVcsTUFBWCxHQUFvQixLQUFLLFdBQUwsQ0FBaUIsTUFBaEU7QUFDQSx1Q0FBWSxVQUFaLEVBQXdCLEtBQUssU0FBN0I7QUFDQSxtQkFBVyxPQUFYLENBQW1CLGlCQUFTOztBQUUxQixjQUFHLE1BQU0sSUFBTixLQUFlLDBCQUFlLE9BQWpDLEVBQXlDO0FBQ3ZDLGdCQUFHLE1BQU0sUUFBVCxFQUFrQjtBQUNoQixxQkFBSyxVQUFMLENBQWdCLEdBQWhCLENBQW9CLE1BQU0sVUFBMUIsRUFBc0MsTUFBTSxRQUE1Qzs7O0FBR0Q7QUFDRjtBQUNGLFNBVEQ7QUFVQSxhQUFLLE1BQUwsR0FBYyxNQUFNLElBQU4sQ0FBVyxLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBWCxDQUFkO0FBQ0Q7QUFDRCxjQUFRLE9BQVIsQ0FBZ0IsT0FBaEI7O0FBR0EsVUFBRyxnQkFBSCxFQUFvQjtBQUNsQixnQkFBUSxJQUFSLENBQWEsVUFBYjtBQUNBLGFBQUssT0FBTCxHQUFlLE1BQU0sSUFBTixDQUFXLEtBQUssV0FBTCxDQUFpQixNQUFqQixFQUFYLENBQWY7QUFDQSxhQUFLLE1BQUwsR0FBYyxNQUFNLElBQU4sQ0FBVyxLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBWCxDQUFkO0FBQ0EsZ0JBQVEsT0FBUixDQUFnQixVQUFoQjtBQUNEOzs7QUFHRCxjQUFRLElBQVIsY0FBd0IsS0FBSyxPQUFMLENBQWEsTUFBckM7QUFDQSw0QkFBVyxLQUFLLE9BQWhCO0FBQ0EsV0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixVQUFTLENBQVQsRUFBWSxDQUFaLEVBQWM7QUFDN0IsZUFBTyxFQUFFLE1BQUYsQ0FBUyxLQUFULEdBQWlCLEVBQUUsTUFBRixDQUFTLEtBQWpDO0FBQ0QsT0FGRDtBQUdBLGNBQVEsT0FBUixjQUEyQixLQUFLLE9BQUwsQ0FBYSxNQUF4Qzs7QUFFQSxjQUFRLEdBQVIsQ0FBWSxVQUFaLEVBQXdCLEtBQUssTUFBN0I7O0FBRUEsY0FBUSxPQUFSLENBQWdCLE9BQWhCO0FBQ0EsY0FBUSxRQUFSLENBQWlCLGFBQWpCO0FBQ0EsY0FBUSxPQUFSLENBQWdCLGFBQWhCOzs7QUFJQSxVQUFJLFlBQVksS0FBSyxPQUFMLENBQWEsS0FBSyxPQUFMLENBQWEsTUFBYixHQUFzQixDQUFuQyxDQUFoQjtBQUNBLFVBQUksZ0JBQWdCLEtBQUssV0FBTCxDQUFpQixLQUFLLFdBQUwsQ0FBaUIsTUFBakIsR0FBMEIsQ0FBM0MsQ0FBcEI7QUFDQSxVQUFHLCtDQUFtQyxLQUF0QyxFQUE0QztBQUMxQyxvQkFBWSxhQUFaO0FBQ0QsT0FGRCxNQUVNLElBQUcsY0FBYyxLQUFkLEdBQXNCLFVBQVUsS0FBbkMsRUFBeUM7QUFDN0Msb0JBQVksYUFBWjtBQUNEOzs7QUFHRCxXQUFLLElBQUwsR0FBWSxLQUFLLEdBQUwsQ0FBUyxVQUFVLEdBQW5CLEVBQXdCLEtBQUssSUFBN0IsQ0FBWjs7QUFFQSxVQUFJLFFBQVEsaUNBQWtCLElBQWxCLEVBQXdCO0FBQ2xDLGNBQU0sV0FENEI7QUFFbEMsZ0JBQVEsQ0FBQyxLQUFLLElBQUwsR0FBWSxDQUFiLENBRjBCO0FBR2xDLGdCQUFRO0FBSDBCLE9BQXhCLEVBSVQsS0FKSDs7O0FBT0EsVUFBSSxTQUFTLGlDQUFrQixJQUFsQixFQUF3QjtBQUNuQyxjQUFNLE9BRDZCO0FBRW5DLGdCQUFRLFFBQVEsQ0FGbUI7QUFHbkMsZ0JBQVE7QUFIMkIsT0FBeEIsRUFJVixNQUpIOztBQU9BLFdBQUssVUFBTCxDQUFnQixLQUFoQixHQUF3QixRQUFRLENBQWhDO0FBQ0EsV0FBSyxVQUFMLENBQWdCLE1BQWhCLEdBQXlCLE1BQXpCOztBQUVBLGNBQVEsR0FBUixDQUFZLFdBQVosRUFBeUIsS0FBSyxVQUFMLENBQWdCLEtBQXpDLEVBQWdELEtBQUssVUFBTCxDQUFnQixNQUFoRTtBQUNBLFdBQUssY0FBTCxHQUFzQixLQUFLLFVBQUwsQ0FBZ0IsS0FBdEM7QUFDQSxXQUFLLGVBQUwsR0FBdUIsS0FBSyxVQUFMLENBQWdCLE1BQXZDO0FBQ0EsV0FBSyxTQUFMLENBQWUsVUFBZjs7QUFFQSxVQUFHLEtBQUssT0FBTCxLQUFpQixLQUFwQixFQUEwQjtBQUN4QixhQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CLFFBQW5CLEVBQTZCLEtBQUssY0FBbEM7QUFDRDs7O0FBR0QsVUFBRyxLQUFLLHNCQUFMLElBQStCLEtBQUssVUFBTCxDQUFnQixJQUFoQixLQUF5QixLQUFLLElBQWhFLEVBQXFFO0FBQ25FLGFBQUssZ0JBQUwsR0FBd0IsNERBQWdCLEtBQUssV0FBckIsc0JBQXFDLEtBQUssVUFBTCxDQUFnQixTQUFoQixFQUFyQyxHQUF4QjtBQUNEO0FBQ0QsV0FBSyxVQUFMLGdDQUFzQixLQUFLLGdCQUEzQixzQkFBZ0QsS0FBSyxPQUFyRDtBQUNBLDRCQUFXLEtBQUssVUFBaEI7OztBQUdBLFdBQUssU0FBTCxHQUFpQixFQUFqQjtBQUNBLFdBQUssYUFBTCxHQUFxQixFQUFyQjtBQUNBLFdBQUssVUFBTCxHQUFrQixFQUFsQjtBQUNBLFdBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLFdBQUssY0FBTCxHQUFzQixFQUF0QjtBQUNEOzs7eUJBRUksSSxFQUFvQjtBQUFBLHlDQUFYLElBQVc7QUFBWCxZQUFXO0FBQUE7O0FBQ3ZCLFdBQUssS0FBTCxjQUFXLElBQVgsU0FBb0IsSUFBcEI7QUFDQSxVQUFHLEtBQUssYUFBTCxHQUFxQixDQUF4QixFQUEwQjtBQUN4QiwwQ0FBYyxFQUFDLE1BQU0sYUFBUCxFQUFzQixNQUFNLEtBQUssY0FBakMsRUFBZDtBQUNELE9BRkQsTUFFTSxJQUFHLEtBQUsscUJBQUwsS0FBK0IsSUFBbEMsRUFBdUM7QUFDM0MsMENBQWMsRUFBQyxNQUFNLGlCQUFQLEVBQTBCLE1BQU0sS0FBSyxjQUFyQyxFQUFkO0FBQ0QsT0FGSyxNQUVEO0FBQ0gsMENBQWMsRUFBQyxNQUFNLE1BQVAsRUFBZSxNQUFNLEtBQUssY0FBMUIsRUFBZDtBQUNEO0FBQ0Y7OzswQkFFSyxJLEVBQWM7QUFDbEIsVUFBRyxPQUFPLElBQVAsS0FBZ0IsV0FBbkIsRUFBK0I7QUFBQSwyQ0FEbEIsSUFDa0I7QUFEbEIsY0FDa0I7QUFBQTs7QUFDN0IsYUFBSyxXQUFMLGNBQWlCLElBQWpCLFNBQTBCLElBQTFCO0FBQ0Q7QUFDRCxVQUFHLEtBQUssT0FBUixFQUFnQjtBQUNkO0FBQ0Q7O0FBRUQsV0FBSyxVQUFMLEdBQWtCLEtBQUssVUFBTCxHQUFrQixvQkFBUSxXQUFSLEdBQXNCLElBQTFEO0FBQ0EsV0FBSyxVQUFMLENBQWdCLFlBQWhCLENBQTZCLEtBQUssVUFBbEM7QUFDQSxXQUFLLFlBQUwsR0FBb0IsS0FBSyxjQUF6Qjs7QUFFQSxVQUFHLEtBQUssYUFBTCxHQUFxQixDQUFyQixJQUEwQixLQUFLLHFCQUFsQyxFQUF3RDtBQUN0RCxhQUFLLGtCQUFMLEdBQTBCLEtBQUssY0FBTCxHQUFzQixLQUFLLFVBQUwsQ0FBZ0Isb0JBQWhCLENBQXFDLEtBQUssYUFBMUMsRUFBeUQsS0FBSyxVQUE5RCxDQUFoRDs7QUFFQSxhQUFLLFdBQUwsR0FBbUIsSUFBbkI7QUFDRCxPQUpELE1BSU07QUFDSixhQUFLLGtCQUFMLEdBQTBCLENBQTFCO0FBQ0EsYUFBSyxPQUFMLEdBQWUsSUFBZjtBQUNBLGFBQUssU0FBTCxHQUFpQixLQUFLLHFCQUF0QjtBQUNEOztBQUVELFVBQUcsS0FBSyxNQUFSLEVBQWU7QUFDYixhQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0Q7O0FBRUQsV0FBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLEtBQUssY0FBMUI7QUFDQSxXQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CLFFBQW5CLEVBQTZCLEtBQUssY0FBbEM7QUFDQSxXQUFLLE1BQUw7QUFDRDs7OzRCQUdZO0FBQ1gsV0FBSyxNQUFMLEdBQWMsQ0FBQyxLQUFLLE1BQXBCO0FBQ0EsV0FBSyxXQUFMLEdBQW1CLEtBQW5CO0FBQ0EsVUFBRyxLQUFLLE1BQVIsRUFBZTtBQUNiLGFBQUssT0FBTCxHQUFlLEtBQWY7QUFDQSxhQUFLLFdBQUw7QUFDQSwwQ0FBYyxFQUFDLE1BQU0sT0FBUCxFQUFnQixNQUFNLEtBQUssTUFBM0IsRUFBZDtBQUNELE9BSkQsTUFJSztBQUNILGFBQUssSUFBTDtBQUNBLDBDQUFjLEVBQUMsTUFBTSxPQUFQLEVBQWdCLE1BQU0sS0FBSyxNQUEzQixFQUFkO0FBQ0Q7QUFDRjs7OzJCQUVXO0FBQ1YsV0FBSyxXQUFMLEdBQW1CLEtBQW5CO0FBQ0EsV0FBSyxXQUFMO0FBQ0EsVUFBRyxLQUFLLE9BQUwsSUFBZ0IsS0FBSyxNQUF4QixFQUErQjtBQUM3QixhQUFLLE9BQUwsR0FBZSxLQUFmO0FBQ0EsYUFBSyxNQUFMLEdBQWMsS0FBZDtBQUNEO0FBQ0QsVUFBRyxLQUFLLGNBQUwsS0FBd0IsQ0FBM0IsRUFBNkI7QUFDM0IsYUFBSyxjQUFMLEdBQXNCLENBQXRCO0FBQ0EsYUFBSyxTQUFMLENBQWUsR0FBZixDQUFtQixRQUFuQixFQUE2QixLQUFLLGNBQWxDO0FBQ0EsWUFBRyxLQUFLLFNBQVIsRUFBa0I7QUFDaEIsZUFBSyxhQUFMO0FBQ0Q7QUFDRCwwQ0FBYyxFQUFDLE1BQU0sTUFBUCxFQUFkO0FBQ0Q7QUFDRjs7O3FDQUVlO0FBQUE7O0FBQ2QsVUFBRyxLQUFLLHFCQUFMLEtBQStCLElBQWxDLEVBQXVDO0FBQ3JDO0FBQ0Q7QUFDRCxXQUFLLFNBQUwsa0JBQThCLGdCQUE5QixHQUFpRCxJQUFJLElBQUosR0FBVyxPQUFYLEVBQWpEO0FBQ0EsV0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixpQkFBUztBQUM1QixjQUFNLGVBQU4sQ0FBc0IsT0FBSyxTQUEzQjtBQUNELE9BRkQ7QUFHQSxXQUFLLHFCQUFMLEdBQTZCLElBQTdCO0FBQ0Q7OztvQ0FFYztBQUFBOztBQUNiLFVBQUcsS0FBSyxxQkFBTCxLQUErQixLQUFsQyxFQUF3QztBQUN0QztBQUNEO0FBQ0QsV0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixpQkFBUztBQUM1QixjQUFNLGNBQU4sQ0FBcUIsT0FBSyxTQUExQjtBQUNELE9BRkQ7QUFHQSxXQUFLLE1BQUw7QUFDQSxXQUFLLHFCQUFMLEdBQTZCLEtBQTdCO0FBQ0EsV0FBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0Esd0NBQWMsRUFBQyxNQUFNLGdCQUFQLEVBQWQ7QUFDRDs7O29DQUVjO0FBQUE7O0FBQ2IsV0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixpQkFBUztBQUM1QixjQUFNLGFBQU4sQ0FBb0IsT0FBSyxTQUF6QjtBQUNELE9BRkQ7QUFHQSxXQUFLLE1BQUw7QUFDRDs7O29DQUVjO0FBQUE7O0FBQ2IsV0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixpQkFBUztBQUM1QixjQUFNLGFBQU4sQ0FBb0IsT0FBSyxTQUF6QjtBQUNELE9BRkQ7QUFHQSxXQUFLLE1BQUw7QUFDRDs7O2lDQUVZLEksRUFBSztBQUNoQixVQUFHLE9BQU8sSUFBUCxLQUFnQixXQUFuQixFQUErQjtBQUM3QixhQUFLLFlBQUwsR0FBb0IsQ0FBQyxLQUFLLFlBQTFCO0FBQ0QsT0FGRCxNQUVLO0FBQ0gsYUFBSyxZQUFMLEdBQW9CLElBQXBCO0FBQ0Q7QUFDRCxXQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsS0FBSyxZQUExQjtBQUNEOzs7dUNBRWtCLE0sRUFBTztBQUN4QixXQUFLLFVBQUwsQ0FBZ0IsU0FBaEIsQ0FBMEIsTUFBMUI7QUFDRDs7O2tDQUVZO0FBQ1gsV0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixVQUFDLEtBQUQsRUFBVztBQUM5QixjQUFNLFdBQU47QUFDRCxPQUZEOzs7QUFLQSxXQUFLLFVBQUwsQ0FBZ0IsV0FBaEI7QUFDRDs7O2dDQUVVO0FBQ1QsMENBQVcsS0FBSyxPQUFoQjtBQUNEOzs7K0JBRVM7QUFDUiwwQ0FBVyxLQUFLLE1BQWhCO0FBQ0Q7OztnQ0FFVTtBQUNULDBDQUFXLEtBQUssT0FBaEI7QUFDRDs7OytCQUVTO0FBQ1IsMENBQVcsS0FBSyxNQUFoQjtBQUNEOzs7c0NBRWlCLEksRUFBSztBQUNyQixhQUFPLGlDQUFrQixJQUFsQixFQUF3QixJQUF4QixDQUFQO0FBQ0Q7Ozs7OztnQ0FHVyxJLEVBQWM7O0FBRXhCLFVBQUksYUFBYSxLQUFLLE9BQXRCO0FBQ0EsVUFBRyxLQUFLLE9BQVIsRUFBZ0I7QUFDZCxhQUFLLE9BQUwsR0FBZSxLQUFmO0FBQ0EsYUFBSyxXQUFMO0FBQ0Q7O0FBTnVCLHlDQUFMLElBQUs7QUFBTCxZQUFLO0FBQUE7O0FBUXhCLFVBQUksV0FBVyxLQUFLLGtCQUFMLENBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DLEtBQXBDLENBQWY7O0FBRUEsVUFBRyxhQUFhLEtBQWhCLEVBQXNCO0FBQ3BCO0FBQ0Q7O0FBRUQsV0FBSyxjQUFMLEdBQXNCLFNBQVMsTUFBL0I7O0FBRUEsd0NBQWM7QUFDWixjQUFNLFVBRE07QUFFWixjQUFNO0FBRk0sT0FBZDs7QUFLQSxVQUFHLFVBQUgsRUFBYztBQUNaLGFBQUssS0FBTDtBQUNEOztBQUVGOzs7a0NBRVk7QUFDWCxhQUFPLEtBQUssU0FBTCxDQUFlLEdBQWYsR0FBcUIsUUFBNUI7QUFDRDs7O2tDQUVZO0FBQ1gsYUFBTyxLQUFLLFNBQUwsQ0FBZSxHQUFmLEVBQVA7QUFDRDs7Ozs7O21DQUdjLEksRUFBYztBQUFBLHlDQUFMLElBQUs7QUFBTCxZQUFLO0FBQUE7O0FBQzNCLFdBQUssWUFBTCxHQUFvQixLQUFLLGtCQUFMLENBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DLEtBQXBDLENBQXBCOztBQUVBLFVBQUcsS0FBSyxZQUFMLEtBQXNCLEtBQXpCLEVBQStCO0FBQzdCLGdCQUFRLElBQVIsQ0FBYSw4QkFBYjtBQUNBLGFBQUssWUFBTCxHQUFvQixFQUFDLFFBQVEsQ0FBVCxFQUFZLE9BQU8sQ0FBbkIsRUFBcEI7QUFDQTtBQUNEO0FBQ0Y7Ozs7OztvQ0FHZSxJLEVBQWM7QUFBQSx5Q0FBTCxJQUFLO0FBQUwsWUFBSztBQUFBOztBQUM1QixXQUFLLGFBQUwsR0FBcUIsS0FBSyxrQkFBTCxDQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQyxLQUFwQyxDQUFyQjs7QUFFQSxVQUFHLEtBQUssYUFBTCxLQUF1QixLQUExQixFQUFnQztBQUM5QixhQUFLLGFBQUwsR0FBcUIsRUFBQyxRQUFRLENBQVQsRUFBWSxPQUFPLENBQW5CLEVBQXJCO0FBQ0EsZ0JBQVEsSUFBUixDQUFhLDhCQUFiO0FBQ0E7QUFDRDtBQUNGOzs7OEJBRW1CO0FBQUEsVUFBWixJQUFZLHlEQUFMLElBQUs7OztBQUVsQixXQUFLLEtBQUwsR0FBYSxTQUFTLElBQVQsR0FBZ0IsSUFBaEIsR0FBdUIsQ0FBQyxLQUFLLEtBQTFDOztBQUVBLFVBQUcsS0FBSyxhQUFMLEtBQXVCLEtBQXZCLElBQWdDLEtBQUssWUFBTCxLQUFzQixLQUF6RCxFQUErRDtBQUM3RCxhQUFLLFlBQUwsR0FBb0IsSUFBcEI7QUFDQSxhQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsZUFBTyxLQUFQO0FBQ0Q7OztBQUdELFVBQUcsS0FBSyxhQUFMLENBQW1CLE1BQW5CLElBQTZCLEtBQUssWUFBTCxDQUFrQixNQUFsRCxFQUF5RDtBQUN2RCxhQUFLLFlBQUwsR0FBb0IsSUFBcEI7QUFDQSxhQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsZUFBTyxLQUFQO0FBQ0Q7O0FBRUQsV0FBSyxhQUFMLEdBQXFCLEtBQUssYUFBTCxDQUFtQixNQUFuQixHQUE0QixLQUFLLFlBQUwsQ0FBa0IsTUFBbkU7O0FBRUEsV0FBSyxVQUFMLENBQWdCLFVBQWhCLEdBQTZCLEtBQUssY0FBTCxHQUFzQixLQUFLLGFBQUwsQ0FBbUIsTUFBdEU7QUFDQSxhQUFPLEtBQUssS0FBWjtBQUNEOzs7a0NBRXFCO0FBQUEsVUFBVixLQUFVLHlEQUFGLENBQUU7O0FBQ3BCLFdBQUssYUFBTCxHQUFxQixLQUFyQjtBQUNEOzs7NkJBRWE7QUFDWixVQUFHLEtBQUssT0FBTCxLQUFpQixLQUFqQixJQUEwQixLQUFLLFdBQUwsS0FBcUIsS0FBbEQsRUFBd0Q7QUFDdEQ7QUFDRDtBQUNELFVBQUksTUFBTSxvQkFBUSxXQUFSLEdBQXNCLElBQWhDO0FBQ0EsVUFBSSxPQUFPLE1BQU0sS0FBSyxVQUF0QjtBQUNBLFdBQUssY0FBTCxJQUF1QixJQUF2QjtBQUNBLFdBQUssVUFBTCxHQUFrQixHQUFsQjs7QUFFQSxVQUFHLEtBQUssa0JBQUwsR0FBMEIsQ0FBN0IsRUFBK0I7QUFDN0IsWUFBRyxLQUFLLGtCQUFMLEdBQTBCLEtBQUssY0FBbEMsRUFBaUQ7QUFDL0MsZUFBSyxVQUFMLENBQWdCLE1BQWhCLENBQXVCLElBQXZCO0FBQ0EsZ0NBQXNCLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsSUFBakIsQ0FBdEI7O0FBRUE7QUFDRDtBQUNELGFBQUssV0FBTCxHQUFtQixLQUFuQjtBQUNBLGFBQUssa0JBQUwsR0FBMEIsQ0FBMUI7QUFDQSxZQUFHLEtBQUsscUJBQVIsRUFBOEI7QUFDNUIsZUFBSyxPQUFMLEdBQWUsSUFBZjtBQUNBLGVBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNELFNBSEQsTUFHSztBQUNILGVBQUssT0FBTCxHQUFlLElBQWY7QUFDQSw0Q0FBYyxFQUFDLE1BQU0sTUFBUCxFQUFlLE1BQU0sS0FBSyxZQUExQixFQUFkOztBQUVEO0FBQ0Y7O0FBRUQsVUFBRyxLQUFLLEtBQUwsSUFBYyxLQUFLLGNBQUwsSUFBdUIsS0FBSyxhQUFMLENBQW1CLE1BQTNELEVBQWtFO0FBQ2hFLGFBQUssY0FBTCxJQUF1QixLQUFLLGFBQTVCO0FBQ0EsYUFBSyxTQUFMLENBQWUsR0FBZixDQUFtQixRQUFuQixFQUE2QixLQUFLLGNBQWxDOztBQUVBLDBDQUFjO0FBQ1osZ0JBQU0sTUFETTtBQUVaLGdCQUFNO0FBRk0sU0FBZDtBQUlELE9BUkQsTUFRSztBQUNILGFBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsUUFBdEIsRUFBZ0MsSUFBaEM7QUFDRDs7QUFFRCxXQUFLLE1BQUwsR0FBYyxLQUFLLFNBQUwsQ0FBZSxHQUFmLEdBQXFCLEtBQW5DOztBQUVBLFVBQUcsS0FBSyxjQUFMLElBQXVCLEtBQUssZUFBL0IsRUFBK0M7QUFDN0MsYUFBSyxJQUFMO0FBQ0E7QUFDRDs7QUFFRCxXQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBdUIsSUFBdkI7O0FBRUEsNEJBQXNCLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsSUFBakIsQ0FBdEI7QUFDRDs7Ozs7Ozs7Ozs7Ozs7dUNBYWtCLEksRUFBTSxJLEVBQU0sVSxFQUFXO0FBQ3hDLFVBQUksZUFBSjs7QUFFQSxjQUFPLElBQVA7QUFDRSxhQUFLLE9BQUw7QUFDQSxhQUFLLFFBQUw7QUFDQSxhQUFLLFlBQUw7QUFDRSxtQkFBUyxLQUFLLENBQUwsS0FBVyxDQUFwQjtBQUNBOztBQUVGLGFBQUssTUFBTDtBQUNBLGFBQUssV0FBTDtBQUNBLGFBQUssY0FBTDtBQUNFLG1CQUFTLElBQVQ7QUFDQTs7QUFFRjtBQUNFLGtCQUFRLEdBQVIsQ0FBWSxrQkFBWjtBQUNBLGlCQUFPLEtBQVA7QUFmSjs7QUFrQkEsVUFBSSxXQUFXLGlDQUFrQixJQUFsQixFQUF3QjtBQUNyQyxrQkFEcUM7QUFFckMsc0JBRnFDO0FBR3JDLGdCQUFRO0FBSDZCLE9BQXhCLENBQWY7O0FBTUEsYUFBTyxRQUFQO0FBQ0Q7OztxQ0FFZ0IsSSxFQUFNLFEsRUFBUztBQUM5QixhQUFPLHFDQUFpQixJQUFqQixFQUF1QixRQUF2QixDQUFQO0FBQ0Q7Ozt3Q0FFbUIsSSxFQUFNLEUsRUFBRztBQUMzQiw4Q0FBb0IsSUFBcEIsRUFBMEIsRUFBMUI7QUFDRDs7Ozs7Ozs7Ozs7O1FDbGlCYSxnQixHQUFBLGdCO1FBMkJBLHFCLEdBQUEscUI7O0FBbktoQjs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUEsSUFBTSxNQUFNLEdBQVo7O0FBR0EsU0FBUyxNQUFULENBQWdCLE1BQWhCLEVBQXVCO0FBQ3JCLE1BQUksU0FBUyxPQUFPLE1BQXBCO0FBQ0EsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFjLFlBQXhCO0FBQ0EsTUFBSSxZQUFZLE1BQU0sR0FBdEIsQztBQUNBLE1BQUksYUFBYSxFQUFqQjtBQUNBLE1BQUksTUFBTSxDQUFDLENBQVg7QUFDQSxNQUFJLFlBQVksQ0FBQyxDQUFqQjtBQUNBLE1BQUksY0FBYyxDQUFDLENBQW5CO0FBQ0EsTUFBSSxZQUFZLEVBQWhCOztBQVJxQjtBQUFBO0FBQUE7O0FBQUE7QUFVckIseUJBQWlCLE9BQU8sTUFBUCxFQUFqQiw4SEFBaUM7QUFBQSxVQUF6QixLQUF5Qjs7QUFDL0IsVUFBSSxrQkFBSjtVQUFlLGlCQUFmO0FBQ0EsVUFBSSxRQUFRLENBQVo7QUFDQSxVQUFJLGFBQUo7QUFDQSxVQUFJLFVBQVUsQ0FBQyxDQUFmO0FBQ0EsVUFBSSxrQkFBSjtBQUNBLFVBQUksNEJBQUo7QUFDQSxVQUFJLFNBQVMsRUFBYjs7QUFQK0I7QUFBQTtBQUFBOztBQUFBO0FBUy9CLDhCQUFpQixLQUFqQixtSUFBdUI7QUFBQSxjQUFmLEtBQWU7O0FBQ3JCLG1CQUFVLE1BQU0sU0FBTixHQUFrQixTQUE1Qjs7QUFFQSxjQUFHLFlBQVksQ0FBQyxDQUFiLElBQWtCLE9BQU8sTUFBTSxPQUFiLEtBQXlCLFdBQTlDLEVBQTBEO0FBQ3hELHNCQUFVLE1BQU0sT0FBaEI7QUFDRDtBQUNELGlCQUFPLE1BQU0sT0FBYjs7O0FBR0Esa0JBQU8sTUFBTSxPQUFiOztBQUVFLGlCQUFLLFdBQUw7QUFDRSwwQkFBWSxNQUFNLElBQWxCO0FBQ0E7O0FBRUYsaUJBQUssZ0JBQUw7QUFDRSxrQkFBRyxNQUFNLElBQVQsRUFBYztBQUNaLHNDQUFzQixNQUFNLElBQTVCO0FBQ0Q7QUFDRDs7QUFFRixpQkFBSyxRQUFMO0FBQ0UscUJBQU8sSUFBUCxDQUFZLDBCQUFjLEtBQWQsRUFBcUIsSUFBckIsRUFBMkIsTUFBTSxVQUFqQyxFQUE2QyxNQUFNLFFBQW5ELENBQVo7QUFDQTs7QUFFRixpQkFBSyxTQUFMO0FBQ0UscUJBQU8sSUFBUCxDQUFZLDBCQUFjLEtBQWQsRUFBcUIsSUFBckIsRUFBMkIsTUFBTSxVQUFqQyxFQUE2QyxNQUFNLFFBQW5ELENBQVo7QUFDQTs7QUFFRixpQkFBSyxVQUFMOzs7QUFHRSxrQkFBSSxNQUFNLFdBQVcsTUFBTSxtQkFBM0I7O0FBRUEsa0JBQUcsVUFBVSxTQUFWLElBQXVCLFNBQVMsUUFBbkMsRUFBNEM7O0FBRTFDLDJCQUFXLEdBQVg7QUFDRDs7QUFFRCxrQkFBRyxRQUFRLENBQUMsQ0FBWixFQUFjO0FBQ1osc0JBQU0sR0FBTjtBQUNEO0FBQ0QseUJBQVcsSUFBWCxDQUFnQiwwQkFBYyxLQUFkLEVBQXFCLElBQXJCLEVBQTJCLEdBQTNCLENBQWhCO0FBQ0E7O0FBRUYsaUJBQUssZUFBTDs7O0FBR0Usa0JBQUcsY0FBYyxLQUFkLElBQXVCLGFBQWEsSUFBdkMsRUFBNEM7QUFDMUMsd0JBQVEsSUFBUixDQUFhLHdDQUFiLEVBQXVELEtBQXZELEVBQThELE1BQU0sU0FBcEUsRUFBK0UsTUFBTSxXQUFyRjtBQUNBLDJCQUFXLEdBQVg7QUFDRDs7QUFFRCxrQkFBRyxjQUFjLENBQUMsQ0FBbEIsRUFBb0I7QUFDbEIsNEJBQVksTUFBTSxTQUFsQjtBQUNBLDhCQUFjLE1BQU0sV0FBcEI7QUFDRDtBQUNELHlCQUFXLElBQVgsQ0FBZ0IsMEJBQWMsS0FBZCxFQUFxQixJQUFyQixFQUEyQixNQUFNLFNBQWpDLEVBQTRDLE1BQU0sV0FBbEQsQ0FBaEI7QUFDQTs7QUFHRixpQkFBSyxZQUFMO0FBQ0UscUJBQU8sSUFBUCxDQUFZLDBCQUFjLEtBQWQsRUFBcUIsSUFBckIsRUFBMkIsTUFBTSxjQUFqQyxFQUFpRCxNQUFNLEtBQXZELENBQVo7QUFDQTs7QUFFRixpQkFBSyxlQUFMO0FBQ0UscUJBQU8sSUFBUCxDQUFZLDBCQUFjLEtBQWQsRUFBcUIsSUFBckIsRUFBMkIsTUFBTSxhQUFqQyxDQUFaO0FBQ0E7O0FBRUYsaUJBQUssV0FBTDtBQUNFLHFCQUFPLElBQVAsQ0FBWSwwQkFBYyxLQUFkLEVBQXFCLElBQXJCLEVBQTJCLE1BQU0sS0FBakMsQ0FBWjtBQUNBOztBQUVGOztBQWhFRjs7QUFvRUEscUJBQVcsSUFBWDtBQUNBLHNCQUFZLEtBQVo7QUFDRDtBQXhGOEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUEwRi9CLFVBQUcsT0FBTyxNQUFQLEdBQWdCLENBQW5CLEVBQXFCOztBQUVuQixZQUFJLFdBQVcsaUJBQVUsU0FBVixDQUFmO0FBQ0EsWUFBSSxPQUFPLGdCQUFYO0FBQ0EsaUJBQVMsUUFBVCxDQUFrQixJQUFsQjtBQUNBLGFBQUssU0FBTCxhQUFrQixNQUFsQjtBQUNBLGtCQUFVLElBQVYsQ0FBZSxRQUFmO0FBQ0Q7QUFDRjtBQTVHb0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUE4R3JCLE1BQUksT0FBTyxlQUFTO0FBQ2xCLFNBQUssR0FEYTtBQUVsQixtQkFBZSxDQUZHOztBQUlsQixZQUprQjtBQUtsQix3QkFMa0I7QUFNbEI7QUFOa0IsR0FBVCxDQUFYO0FBUUEsT0FBSyxTQUFMLGFBQWtCLFNBQWxCO0FBQ0EsT0FBSyxhQUFMLGFBQXNCLFVBQXRCO0FBQ0EsT0FBSyxNQUFMO0FBQ0EsU0FBTyxJQUFQO0FBQ0Q7O0FBRU0sU0FBUyxnQkFBVCxDQUEwQixJQUExQixFQUE4QztBQUFBLE1BQWQsUUFBYyx5REFBSCxFQUFHOztBQUNuRCxNQUFJLE9BQU8sSUFBWDs7QUFFQSxNQUFHLGdCQUFnQixXQUFoQixLQUFnQyxJQUFuQyxFQUF3QztBQUN0QyxRQUFJLFNBQVMsSUFBSSxVQUFKLENBQWUsSUFBZixDQUFiO0FBQ0EsV0FBTyxPQUFPLDZCQUFjLE1BQWQsQ0FBUCxDQUFQO0FBQ0QsR0FIRCxNQUdNLElBQUcsT0FBTyxLQUFLLE1BQVosS0FBdUIsV0FBdkIsSUFBc0MsT0FBTyxLQUFLLE1BQVosS0FBdUIsV0FBaEUsRUFBNEU7QUFDaEYsV0FBTyxPQUFPLElBQVAsQ0FBUDtBQUNELEdBRkssTUFFRDtBQUNILFdBQU8sMEJBQWUsSUFBZixDQUFQO0FBQ0EsUUFBRyxnQkFBZ0IsV0FBaEIsS0FBZ0MsSUFBbkMsRUFBd0M7QUFDdEMsVUFBSSxVQUFTLElBQUksVUFBSixDQUFlLElBQWYsQ0FBYjtBQUNBLGFBQU8sT0FBTyw2QkFBYyxPQUFkLENBQVAsQ0FBUDtBQUNELEtBSEQsTUFHSztBQUNILGNBQVEsS0FBUixDQUFjLFlBQWQ7QUFDRDtBQUNGOztBQUVELFNBQU8sSUFBUDs7Ozs7O0FBTUQ7O0FBR00sU0FBUyxxQkFBVCxDQUErQixHQUEvQixFQUFtQztBQUN4QyxTQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsbUNBQU0sR0FBTixFQUNDLElBREQsd0JBRUMsSUFGRCw2QkFHQyxJQUhELENBR00sZ0JBQVE7QUFDWixjQUFRLGlCQUFpQixJQUFqQixDQUFSO0FBQ0QsS0FMRCxFQU1DLEtBTkQsQ0FNTyxhQUFLO0FBQ1YsYUFBTyxDQUFQO0FBQ0QsS0FSRDtBQVNELEdBVk0sQ0FBUDtBQVdEOzs7Ozs7Ozs7Ozs7QUNoTEQ7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUdBLElBQUksYUFBYSxDQUFqQjs7SUFFYSxLLFdBQUEsSztBQUVYLG1CQUFnQztBQUFBLFFBQXBCLElBQW9CLHlEQUFMLElBQUs7O0FBQUE7O0FBQzlCLFNBQUssRUFBTCxXQUFnQixZQUFoQixTQUFnQyxJQUFJLElBQUosR0FBVyxPQUFYLEVBQWhDO0FBQ0EsU0FBSyxJQUFMLEdBQVksUUFBUSxLQUFLLEVBQXpCO0FBQ0EsU0FBSyxPQUFMLEdBQWUsQ0FBZjtBQUNBLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxTQUFLLE1BQUwsR0FBYyxHQUFkO0FBQ0EsU0FBSyxPQUFMLEdBQWUsb0JBQVEsVUFBUixFQUFmO0FBQ0EsU0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQixLQUFsQixHQUEwQixLQUFLLE1BQS9CO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLElBQUksR0FBSixFQUFuQjtBQUNBLFNBQUssWUFBTCxHQUFvQixJQUFJLEdBQUosRUFBcEI7QUFDQSxTQUFLLEtBQUwsR0FBYSxJQUFiO0FBQ0EsU0FBSyxNQUFMLEdBQWMsRUFBZDtBQUNBLFNBQUssVUFBTCxHQUFrQixJQUFJLEdBQUosRUFBbEI7QUFDQSxTQUFLLE9BQUwsR0FBZSxFQUFmO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLElBQUksR0FBSixFQUFuQjtBQUNBLFNBQUssWUFBTCxHQUFvQixLQUFwQjtBQUNBLFNBQUssaUJBQUwsR0FBeUIsS0FBekI7QUFDQSxTQUFLLE9BQUwsR0FBZSxHQUFmO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLElBQW5CO0FBQ0EsU0FBSyxpQkFBTCxHQUF5QixJQUFJLEdBQUosRUFBekI7QUFDQSxTQUFLLGVBQUwsR0FBdUIsRUFBdkI7O0FBRUQ7Ozs7b0NBRStCO0FBQUEsVUFBbEIsVUFBa0IseURBQUwsSUFBSzs7QUFDOUIsVUFBRyxLQUFLLFdBQUwsS0FBcUIsSUFBeEIsRUFBNkI7QUFDM0IsYUFBSyxXQUFMLENBQWlCLFdBQWpCO0FBQ0EsYUFBSyxXQUFMLENBQWlCLFVBQWpCO0FBQ0Q7QUFDRCxXQUFLLFdBQUwsR0FBbUIsVUFBbkI7QUFDQSxVQUFHLEtBQUssV0FBTCxLQUFxQixJQUF4QixFQUE2QjtBQUMzQixhQUFLLFdBQUwsQ0FBaUIsT0FBakIsQ0FBeUIsS0FBSyxPQUE5QjtBQUNEO0FBQ0Y7OztvQ0FFYztBQUNiLGFBQU8sS0FBSyxXQUFaO0FBQ0Q7Ozs0QkFFTyxNLEVBQU87QUFDYixXQUFLLE9BQUwsQ0FBYSxPQUFiLENBQXFCLE1BQXJCO0FBQ0Q7OztpQ0FFVztBQUNWLFdBQUssT0FBTCxDQUFhLFVBQWI7QUFDRDs7O3lDQUU2QjtBQUFBOztBQUFBLHdDQUFSLE9BQVE7QUFBUixlQUFRO0FBQUE7OztBQUU1QixjQUFRLE9BQVIsQ0FBZ0Isa0JBQVU7QUFDeEIsWUFBRyxPQUFPLE1BQVAsS0FBa0IsUUFBckIsRUFBOEI7QUFDNUIsbUJBQVMsa0NBQWtCLE1BQWxCLENBQVQ7QUFDRDtBQUNELFlBQUcsa0JBQWtCLFVBQXJCLEVBQWdDO0FBQzlCLGdCQUFLLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBc0IsT0FBTyxFQUE3QixFQUFpQyxNQUFqQztBQUNEO0FBQ0YsT0FQRDs7QUFTRDs7OzRDQUVnQztBQUFBOztBQUFBLHlDQUFSLE9BQVE7QUFBUixlQUFRO0FBQUE7OztBQUUvQixVQUFHLFFBQVEsTUFBUixLQUFtQixDQUF0QixFQUF3QjtBQUN0QixhQUFLLFlBQUwsQ0FBa0IsS0FBbEI7QUFDRDtBQUNELGNBQVEsT0FBUixDQUFnQixnQkFBUTtBQUN0QixZQUFHLGdCQUFnQixVQUFuQixFQUE4QjtBQUM1QixpQkFBTyxLQUFLLEVBQVo7QUFDRDtBQUNELFlBQUcsT0FBSyxZQUFMLENBQWtCLEdBQWxCLENBQXNCLElBQXRCLENBQUgsRUFBK0I7O0FBRTdCLGlCQUFLLFlBQUwsQ0FBa0IsTUFBbEIsQ0FBeUIsSUFBekI7QUFDRDtBQUNGLE9BUkQ7OztBQVdEOzs7d0NBRTJCO0FBQUE7O0FBQUEseUNBQVAsTUFBTztBQUFQLGNBQU87QUFBQTs7QUFDMUIsYUFBTyxPQUFQLENBQWUsaUJBQVM7QUFDdEIsWUFBRyxPQUFPLEtBQVAsS0FBaUIsUUFBcEIsRUFBNkI7QUFDM0Isa0JBQVEsaUNBQWlCLEtBQWpCLENBQVI7QUFDRDtBQUNELFlBQUcsaUJBQWlCLFNBQXBCLEVBQThCO0FBQUE7O0FBRTVCLG1CQUFLLFdBQUwsQ0FBaUIsR0FBakIsQ0FBcUIsTUFBTSxFQUEzQixFQUErQixLQUEvQjs7QUFFQSxnQkFBSSxhQUFKO2dCQUFVLGtCQUFWO0FBQ0Esa0JBQU0sZ0JBQU4sQ0FBdUIsYUFBdkIsRUFBc0MsYUFBSzs7QUFFekMsbUdBQTBCLE9BQUssS0FBTCxDQUFXLE1BQXJDLHNCQUFnRCxFQUFFLElBQWxEO0FBQ0Esd0JBQVUsSUFBVixHQUFpQixDQUFqQixDO0FBQ0Esd0JBQVUsWUFBVixHQUF5QixvQkFBUSxXQUFSLEdBQXNCLElBQS9DOztBQUVBLGtCQUFHLFVBQVUsSUFBVixLQUFtQixzQkFBZSxPQUFyQyxFQUE2QztBQUMzQyx1QkFBTyx3QkFBYSxTQUFiLENBQVA7QUFDQSx1QkFBSyxpQkFBTCxDQUF1QixHQUF2QixDQUEyQixVQUFVLEtBQXJDLEVBQTRDLElBQTVDO0FBQ0QsZUFIRCxNQUdNLElBQUcsVUFBVSxJQUFWLEtBQW1CLHNCQUFlLFFBQXJDLEVBQThDO0FBQ2xELHVCQUFPLE9BQUssaUJBQUwsQ0FBdUIsR0FBdkIsQ0FBMkIsVUFBVSxLQUFyQyxDQUFQO0FBQ0EscUJBQUssVUFBTCxDQUFnQixTQUFoQjtBQUNBLHVCQUFLLGlCQUFMLENBQXVCLE1BQXZCLENBQThCLFVBQVUsS0FBeEM7QUFDRDs7QUFFRCxrQkFBRyxPQUFLLGNBQUwsS0FBd0IsTUFBeEIsSUFBa0MsT0FBSyxLQUFMLENBQVcsU0FBWCxLQUF5QixJQUE5RCxFQUFtRTtBQUNqRSx1QkFBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLFNBQTFCO0FBQ0Q7QUFDRCxxQkFBSyxnQkFBTCxDQUFzQixTQUF0QjtBQUNELGFBbkJEO0FBTDRCO0FBeUI3QjtBQUNGLE9BOUJEOztBQWdDRDs7OzJDQUU4QjtBQUFBOztBQUFBLHlDQUFQLE1BQU87QUFBUCxjQUFPO0FBQUE7O0FBQzdCLFVBQUcsT0FBTyxNQUFQLEtBQWtCLENBQXJCLEVBQXVCO0FBQ3JCLGFBQUssV0FBTCxDQUFpQixLQUFqQjtBQUNEO0FBQ0QsYUFBTyxPQUFQLENBQWUsZ0JBQVE7QUFDckIsWUFBRyxnQkFBZ0IsU0FBbkIsRUFBNkI7QUFDM0IsaUJBQU8sS0FBSyxFQUFaO0FBQ0Q7QUFDRCxZQUFHLE9BQUssWUFBTCxDQUFrQixHQUFsQixDQUFzQixJQUF0QixDQUFILEVBQStCO0FBQzdCLGlCQUFLLFlBQUwsQ0FBa0IsTUFBbEIsQ0FBeUIsSUFBekI7QUFDRDtBQUNGLE9BUEQ7OztBQVVEOzs7b0NBRWM7QUFDYixhQUFPLE1BQU0sSUFBTixDQUFXLEtBQUssV0FBTCxDQUFpQixNQUFqQixFQUFYLENBQVA7QUFDRDs7O3FDQUVlO0FBQ2QsYUFBTyxNQUFNLElBQU4sQ0FBVyxLQUFLLFlBQUwsQ0FBa0IsTUFBbEIsRUFBWCxDQUFQO0FBQ0Q7OztxQ0FFZ0IsSSxFQUFLOztBQUNwQixXQUFLLGNBQUwsR0FBc0IsSUFBdEI7QUFDRDs7O29DQUVlLFEsRUFBUztBQUN2QixVQUFHLEtBQUssY0FBTCxLQUF3QixNQUEzQixFQUFrQztBQUNoQyxhQUFLLFNBQUwsR0FBaUIsUUFBakI7QUFDQSxhQUFLLGVBQUwsR0FBdUIsRUFBdkI7QUFDQSxhQUFLLFdBQUwsR0FBbUIsZUFBUyxLQUFLLFNBQWQsQ0FBbkI7QUFDRDtBQUNGOzs7bUNBRWMsUSxFQUFTO0FBQUE7O0FBQ3RCLFVBQUcsS0FBSyxTQUFMLEtBQW1CLFFBQXRCLEVBQStCO0FBQzdCO0FBQ0Q7QUFDRCwwQkFBSyxXQUFMLEVBQWlCLFNBQWpCLHVDQUE4QixLQUFLLGVBQW5DOztBQUVBLFdBQUssUUFBTCxDQUFjLEtBQUssV0FBbkI7QUFDRDs7O2tDQUVhLFEsRUFBUztBQUNyQixVQUFHLEtBQUssU0FBTCxLQUFtQixRQUF0QixFQUErQjtBQUM3QjtBQUNEO0FBQ0QsV0FBSyxXQUFMLENBQWlCLEtBQUssV0FBdEI7O0FBRUQ7OztrQ0FFYSxRLEVBQVM7QUFDckIsVUFBRyxLQUFLLFNBQUwsS0FBbUIsUUFBdEIsRUFBK0I7QUFDN0I7QUFDRDtBQUNELFdBQUssUUFBTCxDQUFjLEtBQUssV0FBbkI7QUFDRDs7OzJCQUVLO0FBQ0osVUFBSSxJQUFJLElBQUksS0FBSixDQUFVLEtBQUssSUFBTCxHQUFZLE9BQXRCLENBQVIsQztBQUNBLFVBQUksUUFBUSxFQUFaO0FBQ0EsV0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixVQUFTLElBQVQsRUFBYztBQUNoQyxZQUFJLE9BQU8sS0FBSyxJQUFMLEVBQVg7QUFDQSxnQkFBUSxHQUFSLENBQVksSUFBWjtBQUNBLGNBQU0sSUFBTixDQUFXLElBQVg7QUFDRCxPQUpEO0FBS0EsUUFBRSxRQUFGLFVBQWMsS0FBZDtBQUNBLFFBQUUsTUFBRjtBQUNBLGFBQU8sQ0FBUDtBQUNEOzs7OEJBRVMsTSxFQUFlO0FBQ3ZCLFdBQUssT0FBTCxDQUFhLE9BQWIsQ0FBcUIsVUFBQyxLQUFELEVBQVc7QUFDOUIsY0FBTSxTQUFOLENBQWdCLE1BQWhCO0FBQ0QsT0FGRDtBQUdEOzs7K0JBRWlCO0FBQUE7O0FBQ2hCLFVBQUksT0FBTyxLQUFLLEtBQWhCOztBQURnQix5Q0FBTixLQUFNO0FBQU4sYUFBTTtBQUFBOztBQUVoQixZQUFNLE9BQU4sQ0FBYyxVQUFDLElBQUQsRUFBVTtBQUFBOztBQUN0QixhQUFLLE1BQUw7QUFDQSxlQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBb0IsS0FBSyxFQUF6QixFQUE2QixJQUE3QjtBQUNBLGVBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsSUFBakI7QUFDQSxZQUFHLElBQUgsRUFBUTtBQUNOLGVBQUssS0FBTCxHQUFhLElBQWI7QUFDQSxlQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLElBQXBCO0FBQ0Q7O0FBRUQsWUFBSSxTQUFTLEtBQUssT0FBbEI7QUFDQSxlQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVztBQUN4QixnQkFBTSxNQUFOO0FBQ0EsY0FBRyxJQUFILEVBQVE7QUFDTixrQkFBTSxLQUFOLEdBQWMsSUFBZDtBQUNBLGlCQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsS0FBckI7QUFDRDtBQUNELGlCQUFLLFdBQUwsQ0FBaUIsR0FBakIsQ0FBcUIsTUFBTSxFQUEzQixFQUErQixLQUEvQjtBQUNELFNBUEQ7QUFRQSwwQkFBSyxPQUFMLEVBQWEsSUFBYixtQ0FBcUIsTUFBckI7QUFDRCxPQW5CRDtBQW9CQSxXQUFLLFlBQUwsR0FBb0IsSUFBcEI7QUFDRDs7O2tDQUVvQjtBQUFBOztBQUNuQixVQUFJLE9BQU8sS0FBSyxLQUFoQjs7QUFEbUIseUNBQU4sS0FBTTtBQUFOLGFBQU07QUFBQTs7QUFHbkIsWUFBTSxPQUFOLENBQWMsVUFBQyxJQUFELEVBQVU7QUFDdEIsYUFBSyxNQUFMLEdBQWMsSUFBZDtBQUNBLGVBQUssVUFBTCxDQUFnQixNQUFoQixDQUF1QixLQUFLLEVBQTVCLEVBQWdDLElBQWhDO0FBQ0EsWUFBRyxJQUFILEVBQVE7QUFDTixlQUFLLGFBQUwsQ0FBbUIsSUFBbkIsQ0FBd0IsSUFBeEI7QUFDRDs7QUFFRCxZQUFJLFNBQVMsS0FBSyxPQUFsQjtBQUNBLGVBQU8sT0FBUCxDQUFlLGlCQUFTO0FBQ3RCLGdCQUFNLE1BQU4sR0FBZSxJQUFmO0FBQ0EsY0FBRyxJQUFILEVBQVE7QUFDTixrQkFBTSxLQUFOLEdBQWMsSUFBZDs7QUFFRDtBQUNELGlCQUFLLFdBQUwsQ0FBaUIsTUFBakIsQ0FBd0IsTUFBTSxFQUE5QixFQUFrQyxLQUFsQztBQUNELFNBUEQ7QUFRRCxPQWhCRDtBQWlCQSxXQUFLLFlBQUwsR0FBb0IsSUFBcEI7QUFDQSxXQUFLLGlCQUFMLEdBQXlCLElBQXpCO0FBQ0Q7OzsrQkFFUztBQUNSLFVBQUcsS0FBSyxZQUFSLEVBQXFCO0FBQ25CLGFBQUssTUFBTCxHQUFjLE1BQU0sSUFBTixDQUFXLEtBQUssVUFBTCxDQUFnQixNQUFoQixFQUFYLENBQWQ7QUFDQSxhQUFLLE9BQUwsR0FBZSxNQUFNLElBQU4sQ0FBVyxLQUFLLFdBQUwsQ0FBaUIsTUFBakIsRUFBWCxDQUFmO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0Q7QUFDRCwwQ0FBVyxLQUFLLE1BQWhCO0FBQ0Q7OzttQ0FHYyxNLEVBQXlCO0FBQUEseUNBQU4sS0FBTTtBQUFOLGFBQU07QUFBQTs7QUFDdEMsWUFBTSxPQUFOLENBQWMsVUFBUyxJQUFULEVBQWM7QUFDMUIsYUFBSyxTQUFMLENBQWUsTUFBZjtBQUNELE9BRkQ7QUFHRDs7OzhCQUVTLEssRUFBd0I7QUFBQSx5Q0FBTixLQUFNO0FBQU4sYUFBTTtBQUFBOztBQUNoQyxZQUFNLE9BQU4sQ0FBYyxVQUFTLElBQVQsRUFBYztBQUMxQixhQUFLLElBQUwsQ0FBVSxLQUFWO0FBQ0QsT0FGRDtBQUdEOzs7Z0NBRVcsSyxFQUF3QjtBQUFBLHlDQUFOLEtBQU07QUFBTixhQUFNO0FBQUE7O0FBQ2xDLFlBQU0sT0FBTixDQUFjLFVBQVMsSUFBVCxFQUFjO0FBQzFCLGFBQUssTUFBTCxDQUFZLEtBQVo7QUFDRCxPQUZEO0FBR0Q7OztnQ0FFbUI7QUFDbEIsVUFBSSxJQUFJLGdCQUFSO0FBQ0EsUUFBRSxTQUFGO0FBQ0EsV0FBSyxRQUFMLENBQWMsQ0FBZDtBQUNEOzs7bUNBRXNCO0FBQUE7O0FBQ3JCLFVBQUksUUFBUSxJQUFJLEdBQUosRUFBWjs7QUFEcUIsMENBQVAsTUFBTztBQUFQLGNBQU87QUFBQTs7QUFFckIsYUFBTyxPQUFQLENBQWUsVUFBQyxLQUFELEVBQVc7QUFDeEIsY0FBTSxHQUFOLENBQVUsTUFBTSxLQUFoQjtBQUNBLGNBQU0sS0FBTixHQUFjLElBQWQ7QUFDQSxjQUFNLE1BQU4sR0FBZSxJQUFmO0FBQ0EsY0FBTSxLQUFOLEdBQWMsSUFBZDtBQUNBLGVBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixNQUFNLEVBQTlCO0FBQ0QsT0FORDtBQU9BLFVBQUcsS0FBSyxLQUFSLEVBQWM7QUFBQTs7QUFDWixvQ0FBSyxLQUFMLENBQVcsYUFBWCxFQUF5QixJQUF6QiwrQ0FBaUMsTUFBTSxJQUFOLENBQVcsTUFBTSxPQUFOLEVBQVgsQ0FBakM7QUFDQSxxQ0FBSyxLQUFMLENBQVcsY0FBWCxFQUEwQixJQUExQiw2QkFBa0MsTUFBbEM7QUFDRDtBQUNELFdBQUssWUFBTCxHQUFvQixJQUFwQjtBQUNBLFdBQUssaUJBQUwsR0FBeUIsSUFBekI7QUFDRDs7OytCQUVVLEssRUFBeUI7QUFDbEMsVUFBSSxRQUFRLElBQUksR0FBSixFQUFaOztBQURrQywwQ0FBUCxNQUFPO0FBQVAsY0FBTztBQUFBOztBQUVsQyxhQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVztBQUN4QixjQUFNLElBQU4sQ0FBVyxLQUFYO0FBQ0EsY0FBTSxHQUFOLENBQVUsTUFBTSxJQUFoQjtBQUNELE9BSEQ7QUFJQSxVQUFHLEtBQUssS0FBUixFQUFjO0FBQUE7O0FBQ1oscUNBQUssS0FBTCxDQUFXLGFBQVgsRUFBeUIsSUFBekIsZ0RBQWlDLE1BQU0sSUFBTixDQUFXLE1BQU0sT0FBTixFQUFYLENBQWpDO0FBQ0EsbUNBQUssS0FBTCxDQUFXLFlBQVgsRUFBd0IsSUFBeEIsMkJBQWdDLE1BQWhDO0FBQ0Q7QUFDRjs7O2lDQUVZLEssRUFBeUI7QUFDcEMsVUFBSSxRQUFRLElBQUksR0FBSixFQUFaOztBQURvQywwQ0FBUCxNQUFPO0FBQVAsY0FBTztBQUFBOztBQUVwQyxhQUFPLE9BQVAsQ0FBZSxVQUFDLEtBQUQsRUFBVztBQUN4QixjQUFNLE1BQU4sQ0FBYSxLQUFiO0FBQ0EsY0FBTSxHQUFOLENBQVUsTUFBTSxJQUFoQjtBQUNELE9BSEQ7QUFJQSxVQUFHLEtBQUssS0FBUixFQUFjO0FBQUE7O0FBQ1oscUNBQUssS0FBTCxDQUFXLGFBQVgsRUFBeUIsSUFBekIsZ0RBQWlDLE1BQU0sSUFBTixDQUFXLE1BQU0sT0FBTixFQUFYLENBQWpDO0FBQ0Esb0NBQUssS0FBTCxDQUFXLFlBQVgsRUFBd0IsSUFBeEIsNEJBQWdDLE1BQWhDO0FBQ0Q7QUFDRjs7O2dDQUVpQztBQUFBLFVBQXhCLE1BQXdCLHlEQUFMLElBQUs7O0FBQ2hDLFVBQUcsS0FBSyxZQUFSLEVBQXFCO0FBQ25CLGFBQUssTUFBTDtBQUNEO0FBQ0QsMENBQVcsS0FBSyxPQUFoQixHO0FBQ0Q7OzsyQkFFeUI7QUFBQSxVQUFyQixJQUFxQix5REFBTCxJQUFLOztBQUN4QixVQUFHLElBQUgsRUFBUTtBQUNOLGFBQUssTUFBTCxHQUFjLElBQWQ7QUFDRCxPQUZELE1BRUs7QUFDSCxhQUFLLE1BQUwsR0FBYyxDQUFDLEtBQUssTUFBcEI7QUFDRDtBQUNGOzs7NkJBRU87O0FBQ04sVUFBRyxLQUFLLGlCQUFSLEVBQTBCO0FBQ3hCLGFBQUssT0FBTCxHQUFlLE1BQU0sSUFBTixDQUFXLEtBQUssV0FBTCxDQUFpQixNQUFqQixFQUFYLENBQWY7QUFDQSxhQUFLLGlCQUFMLEdBQXlCLEtBQXpCO0FBQ0Q7QUFDRCw0QkFBVyxLQUFLLE9BQWhCO0FBQ0EsV0FBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0Q7OztrQ0FFWTtBQUNYLFVBQUcsS0FBSyxXQUFMLEtBQXFCLElBQXhCLEVBQTZCO0FBQzNCLGFBQUssV0FBTCxDQUFpQixXQUFqQjtBQUNEOztBQUVELFVBQUksWUFBYSxvQkFBUSxXQUFSLEdBQXNCLElBQXZCLEdBQStCLEtBQUssT0FBcEQ7QUFMVztBQUFBO0FBQUE7O0FBQUE7QUFNWCw2QkFBa0IsS0FBSyxZQUFMLENBQWtCLE1BQWxCLEVBQWxCLDhIQUE2QztBQUFBLGNBQXJDLE1BQXFDOztBQUMzQyxpQkFBTyxJQUFQLENBQVksQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElBQWIsQ0FBWixFQUFnQyxTQUFoQyxFO0FBQ0EsaUJBQU8sSUFBUCxDQUFZLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxJQUFiLENBQVosRUFBZ0MsU0FBaEMsRTtBQUNEO0FBVFU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVVaOzs7cUNBRWdCLEssRUFBMEI7QUFBQSxVQUFuQixVQUFtQix5REFBTixLQUFNOzs7QUFFekMsVUFBSSxVQUFVLGFBQWEsS0FBSyxPQUFsQixHQUE0QixDQUExQzs7OztBQUlBLFVBQUcsS0FBSyxXQUFMLEtBQXFCLElBQXhCLEVBQTZCO0FBQzNCLGFBQUssV0FBTCxDQUFpQixnQkFBakIsQ0FBa0MsS0FBbEMsRUFBeUMsTUFBTSxJQUFOLEdBQWEsSUFBdEQ7QUFDRDs7O0FBUndDO0FBQUE7QUFBQTs7QUFBQTtBQVd6Qyw4QkFBZ0IsS0FBSyxZQUFMLENBQWtCLE1BQWxCLEVBQWhCLG1JQUEyQztBQUFBLGNBQW5DLElBQW1DOztBQUN6QyxjQUFHLElBQUgsRUFBUTtBQUNOLGdCQUFHLE1BQU0sSUFBTixLQUFlLEdBQWYsSUFBc0IsTUFBTSxJQUFOLEtBQWUsR0FBckMsSUFBNEMsTUFBTSxJQUFOLEtBQWUsR0FBOUQsRUFBa0U7QUFDaEUsbUJBQUssSUFBTCxDQUFVLENBQUMsTUFBTSxJQUFOLEdBQWEsS0FBSyxPQUFuQixFQUE0QixNQUFNLEtBQWxDLEVBQXlDLE1BQU0sS0FBL0MsQ0FBVixFQUFpRSxNQUFNLElBQU4sR0FBYSxPQUE5RTtBQUNELGFBRkQsTUFFTSxJQUFHLE1BQU0sSUFBTixLQUFlLEdBQWYsSUFBc0IsTUFBTSxJQUFOLEtBQWUsR0FBeEMsRUFBNEM7QUFDaEQsbUJBQUssSUFBTCxDQUFVLENBQUMsTUFBTSxJQUFOLEdBQWEsS0FBSyxPQUFuQixFQUE0QixNQUFNLEtBQWxDLENBQVYsRUFBb0QsTUFBTSxJQUFOLEdBQWEsT0FBakU7QUFDRDtBQUNGO0FBQ0Y7QUFuQndDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFvQjFDOzs7Ozs7Ozs7Ozs7Ozs7UUN4WGEsVyxHQUFBLFc7UUErQkEsYyxHQUFBLGM7UUF1Q0EsVSxHQUFBLFU7UUFlQSxVLEdBQUEsVTtRQWFBLGEsR0FBQSxhO1FBVUEsa0IsR0FBQSxrQjtRQW9CQSxlLEdBQUEsZTs7QUExSWhCOzs7Ozs7QUFFQSxJQUNFLE1BQU0sS0FBSyxFQURiO0lBRUUsT0FBTyxLQUFLLEdBRmQ7SUFHRSxTQUFTLEtBQUssS0FIaEI7SUFJRSxTQUFTLEtBQUssS0FKaEI7SUFLRSxVQUFVLEtBQUssTUFMakI7O0FBUU8sU0FBUyxXQUFULENBQXFCLE1BQXJCLEVBQTRCO0FBQ2pDLE1BQUksVUFBSjtNQUFPLFVBQVA7TUFBVSxVQUFWO01BQWEsV0FBYjtNQUNFLGdCQURGO01BRUUsZUFBZSxFQUZqQjs7QUFJQSxZQUFVLFNBQVMsSUFBbkIsQztBQUNBLE1BQUksT0FBTyxXQUFXLEtBQUssRUFBaEIsQ0FBUCxDQUFKO0FBQ0EsTUFBSSxPQUFRLFdBQVcsS0FBSyxFQUFoQixDQUFELEdBQXdCLEVBQS9CLENBQUo7QUFDQSxNQUFJLE9BQU8sVUFBVyxFQUFsQixDQUFKO0FBQ0EsT0FBSyxPQUFPLENBQUMsVUFBVyxJQUFJLElBQWYsR0FBd0IsSUFBSSxFQUE1QixHQUFrQyxDQUFuQyxJQUF3QyxJQUEvQyxDQUFMOztBQUVBLGtCQUFnQixJQUFJLEdBQXBCO0FBQ0Esa0JBQWdCLElBQUksRUFBSixHQUFTLE1BQU0sQ0FBZixHQUFtQixDQUFuQztBQUNBLGtCQUFnQixHQUFoQjtBQUNBLGtCQUFnQixJQUFJLEVBQUosR0FBUyxNQUFNLENBQWYsR0FBbUIsQ0FBbkM7QUFDQSxrQkFBZ0IsR0FBaEI7QUFDQSxrQkFBZ0IsT0FBTyxDQUFQLEdBQVcsS0FBWCxHQUFtQixLQUFLLEVBQUwsR0FBVSxPQUFPLEVBQWpCLEdBQXNCLEtBQUssR0FBTCxHQUFXLE1BQU0sRUFBakIsR0FBc0IsRUFBL0U7OztBQUdBLFNBQU87QUFDTCxVQUFNLENBREQ7QUFFTCxZQUFRLENBRkg7QUFHTCxZQUFRLENBSEg7QUFJTCxpQkFBYSxFQUpSO0FBS0wsa0JBQWMsWUFMVDtBQU1MLGlCQUFhLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsRUFBVjtBQU5SLEdBQVA7QUFRRDs7O0FBSU0sU0FBUyxjQUFULENBQXdCLEtBQXhCLEVBQThCO0FBQ25DLE1BQUksU0FBUyxtRUFBYjtNQUNFLGNBREY7TUFDUyxlQURUO01BQ2lCLGVBRGpCO01BRUUsY0FGRjtNQUVTLGNBRlQ7TUFHRSxhQUhGO01BR1EsYUFIUjtNQUdjLGFBSGQ7TUFJRSxhQUpGO01BSVEsYUFKUjtNQUljLGFBSmQ7TUFJb0IsYUFKcEI7TUFLRSxVQUxGO01BS0ssSUFBSSxDQUxUOztBQU9BLFVBQVEsS0FBSyxJQUFMLENBQVcsSUFBSSxNQUFNLE1BQVgsR0FBcUIsR0FBL0IsQ0FBUjtBQUNBLFdBQVMsSUFBSSxXQUFKLENBQWdCLEtBQWhCLENBQVQ7QUFDQSxXQUFTLElBQUksVUFBSixDQUFlLE1BQWYsQ0FBVDs7QUFFQSxVQUFRLE9BQU8sT0FBUCxDQUFlLE1BQU0sTUFBTixDQUFhLE1BQU0sTUFBTixHQUFlLENBQTVCLENBQWYsQ0FBUjtBQUNBLFVBQVEsT0FBTyxPQUFQLENBQWUsTUFBTSxNQUFOLENBQWEsTUFBTSxNQUFOLEdBQWUsQ0FBNUIsQ0FBZixDQUFSO0FBQ0EsTUFBRyxTQUFTLEVBQVosRUFBZ0IsUTtBQUNoQixNQUFHLFNBQVMsRUFBWixFQUFnQixROztBQUVoQixVQUFRLE1BQU0sT0FBTixDQUFjLHFCQUFkLEVBQXFDLEVBQXJDLENBQVI7O0FBRUEsT0FBSSxJQUFJLENBQVIsRUFBVyxJQUFJLEtBQWYsRUFBc0IsS0FBSyxDQUEzQixFQUE4Qjs7QUFFNUIsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFNLE1BQU4sQ0FBYSxHQUFiLENBQWYsQ0FBUDtBQUNBLFdBQU8sT0FBTyxPQUFQLENBQWUsTUFBTSxNQUFOLENBQWEsR0FBYixDQUFmLENBQVA7QUFDQSxXQUFPLE9BQU8sT0FBUCxDQUFlLE1BQU0sTUFBTixDQUFhLEdBQWIsQ0FBZixDQUFQO0FBQ0EsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFNLE1BQU4sQ0FBYSxHQUFiLENBQWYsQ0FBUDs7QUFFQSxXQUFRLFFBQVEsQ0FBVCxHQUFlLFFBQVEsQ0FBOUI7QUFDQSxXQUFRLENBQUMsT0FBTyxFQUFSLEtBQWUsQ0FBaEIsR0FBc0IsUUFBUSxDQUFyQztBQUNBLFdBQVEsQ0FBQyxPQUFPLENBQVIsS0FBYyxDQUFmLEdBQW9CLElBQTNCOztBQUVBLFdBQU8sQ0FBUCxJQUFZLElBQVo7QUFDQSxRQUFHLFFBQVEsRUFBWCxFQUFlLE9BQU8sSUFBRSxDQUFULElBQWMsSUFBZDtBQUNmLFFBQUcsUUFBUSxFQUFYLEVBQWUsT0FBTyxJQUFFLENBQVQsSUFBYyxJQUFkO0FBQ2hCOztBQUVELFNBQU8sTUFBUDtBQUNEOztBQUdNLFNBQVMsVUFBVCxDQUFvQixDQUFwQixFQUFzQjtBQUMzQixNQUFHLFFBQU8sQ0FBUCx5Q0FBTyxDQUFQLE1BQVksUUFBZixFQUF3QjtBQUN0QixrQkFBYyxDQUFkLHlDQUFjLENBQWQ7QUFDRDs7QUFFRCxNQUFHLE1BQU0sSUFBVCxFQUFjO0FBQ1osV0FBTyxNQUFQO0FBQ0Q7OztBQUdELE1BQUksZ0JBQWdCLE9BQU8sU0FBUCxDQUFpQixRQUFqQixDQUEwQixJQUExQixDQUErQixDQUEvQixFQUFrQyxLQUFsQyxDQUF3QyxtQkFBeEMsRUFBNkQsQ0FBN0QsQ0FBcEI7QUFDQSxTQUFPLGNBQWMsV0FBZCxFQUFQO0FBQ0Q7O0FBR00sU0FBUyxVQUFULENBQW9CLE1BQXBCLEVBQTJCO0FBQ2hDLFNBQU8sSUFBUCxDQUFZLFVBQVMsQ0FBVCxFQUFZLENBQVosRUFBYztBQUN4QixRQUFHLEVBQUUsS0FBRixLQUFZLEVBQUUsS0FBakIsRUFBdUI7QUFDckIsVUFBSSxJQUFJLEVBQUUsSUFBRixHQUFTLEVBQUUsSUFBbkI7QUFDQSxVQUFHLEVBQUUsSUFBRixLQUFXLEdBQVgsSUFBa0IsRUFBRSxJQUFGLEtBQVcsR0FBaEMsRUFBb0M7QUFDbEMsWUFBSSxDQUFDLENBQUw7QUFDRDtBQUNELGFBQU8sQ0FBUDtBQUNEO0FBQ0QsV0FBTyxFQUFFLEtBQUYsR0FBVSxFQUFFLEtBQW5CO0FBQ0QsR0FURDtBQVVEOztBQUVNLFNBQVMsYUFBVCxDQUF1QixJQUF2QixFQUE0QjtBQUNqQyxNQUFJLFNBQVMsSUFBYjtBQUNBLE1BQUc7QUFDRCxTQUFLLElBQUw7QUFDRCxHQUZELENBRUMsT0FBTSxDQUFOLEVBQVE7QUFDUCxhQUFTLEtBQVQ7QUFDRDtBQUNELFNBQU8sTUFBUDtBQUNEOztBQUVNLFNBQVMsa0JBQVQsQ0FBNEIsUUFBNUIsRUFBc0MsSUFBdEMsRUFBNEMsUUFBNUMsRUFBc0Q7QUFDM0QsTUFBSSxVQUFKO01BQU8sY0FBUDtNQUFjLGdCQUFkO01BQ0UsU0FBUyxJQUFJLFlBQUosQ0FBaUIsUUFBakIsQ0FEWDs7QUFHQSxPQUFJLElBQUksQ0FBUixFQUFXLElBQUksUUFBZixFQUF5QixHQUF6QixFQUE2QjtBQUMzQixjQUFVLElBQUksUUFBZDtBQUNBLFFBQUcsU0FBUyxRQUFaLEVBQXFCO0FBQ25CLGNBQVEsS0FBSyxHQUFMLENBQVMsQ0FBQyxNQUFNLE9BQVAsSUFBa0IsR0FBbEIsR0FBd0IsR0FBakMsSUFBd0MsUUFBaEQ7QUFDRCxLQUZELE1BRU0sSUFBRyxTQUFTLFNBQVosRUFBc0I7QUFDMUIsY0FBUSxLQUFLLEdBQUwsQ0FBUyxVQUFVLEdBQVYsR0FBZ0IsS0FBSyxFQUE5QixJQUFvQyxRQUE1QztBQUNEO0FBQ0QsV0FBTyxDQUFQLElBQVksS0FBWjtBQUNBLFFBQUcsTUFBTSxXQUFXLENBQXBCLEVBQXNCO0FBQ3BCLGFBQU8sQ0FBUCxJQUFZLFNBQVMsUUFBVCxHQUFvQixDQUFwQixHQUF3QixDQUFwQztBQUNEO0FBQ0Y7QUFDRCxTQUFPLE1BQVA7QUFDRDs7QUFHTSxTQUFTLGVBQVQsQ0FBeUIsS0FBekIsRUFBK0I7O0FBRXBDLE1BQUcsTUFBTSxLQUFOLENBQUgsRUFBZ0I7QUFDZCxZQUFRLElBQVIsQ0FBYSx5QkFBYjtBQUNBLFdBQU8sS0FBUDtBQUNEO0FBQ0QsTUFBRyxRQUFRLENBQVIsSUFBYSxRQUFRLEdBQXhCLEVBQTRCO0FBQzFCLFlBQVEsSUFBUixDQUFhLDJDQUFiO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7QUFDRCxTQUFPLEtBQVA7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgcWFtYmksIHtcbiAgU29uZyxcbiAgSW5zdHJ1bWVudCxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG59IGZyb20gJy4uLy4uL3NyYy9xYW1iaSdcblxuXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG5cbiAgbGV0IHNvbmdcblxuICBxYW1iaS5pbml0KClcbiAgLnRoZW4oKCkgPT4ge1xuXG4gICAgbGV0IHRlc3QgPSAxXG5cbiAgICBpZih0ZXN0ID09PSAxKXtcblxuICAgICAgZmV0Y2goJy4uL2RhdGEvbW96azU0NWEubWlkJylcbiAgICAgIC8vZmV0Y2goJy4uL2RhdGEvbWludXRlX3dhbHR6Lm1pZCcpXG4gICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5hcnJheUJ1ZmZlcigpXG4gICAgICB9KVxuICAgICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIHNvbmcgPSBTb25nLmZyb21NSURJRmlsZShkYXRhKVxuICAgICAgICBpbml0VUkoKVxuICAgICAgfSlcblxuICAgIH1lbHNlIGlmKHRlc3QgPT09IDIpe1xuXG4gICAgICBTb25nLmZyb21NSURJRmlsZUFzeW5jKCcuLi8uLi9kYXRhL21pbnV0ZV93YWx0ei5taWQnKVxuICAgICAgLnRoZW4ocyA9PiB7XG4gICAgICAgIHNvbmcgPSBzXG4gICAgICAgIGluaXRVSSgpXG4gICAgICB9LCBlID0+IGNvbnNvbGUubG9nKGUpKVxuICAgIH1cbiAgfSlcblxuXG4gIGZ1bmN0aW9uIGluaXRVSSgpe1xuXG4gICAgbGV0IGJ0blBsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheScpXG4gICAgbGV0IGJ0blBhdXNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhdXNlJylcbiAgICBsZXQgYnRuU3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9wJylcbiAgICBsZXQgYnRuSW5zdHJ1bWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnN0cnVtZW50JylcbiAgICBsZXQgYnRuTWV0cm9ub21lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJvbm9tZScpXG4gICAgbGV0IGRpdlRlbXBvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RlbXBvJylcbiAgICBsZXQgZGl2UG9zaXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zaXRpb24nKVxuICAgIGxldCBkaXZQb3NpdGlvblRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zaXRpb25fdGltZScpXG4gICAgbGV0IHJhbmdlUG9zaXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWhlYWQnKVxuICAgIGxldCByYW5nZUxhdGVuY3kgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGF0ZW5jeScpXG4gICAgbGV0IHNlbGVjdE1JRElJbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaWRpaW4nKVxuICAgIGxldCBzZWxlY3RNSURJT3V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pZGlvdXQnKVxuICAgIGxldCB1c2VySW50ZXJhY3Rpb24gPSBmYWxzZVxuXG4gICAgYnRuUGxheS5kaXNhYmxlZCA9IGZhbHNlXG4gICAgYnRuUGF1c2UuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0blN0b3AuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0bkluc3RydW1lbnQuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0bk1ldHJvbm9tZS5kaXNhYmxlZCA9IGZhbHNlXG5cblxuICAgIGxldCBNSURJSW5wdXRzID0gZ2V0TUlESUlucHV0cygpXG4gICAgbGV0IGh0bWwgPSAnPG9wdGlvbiBpZD1cIi0xXCI+c2VsZWN0IE1JREkgaW48L29wdGlvbj4nXG4gICAgTUlESUlucHV0cy5mb3JFYWNoKHBvcnQgPT4ge1xuICAgICAgaHRtbCArPSBgPG9wdGlvbiBpZD1cIiR7cG9ydC5pZH1cIj4ke3BvcnQubmFtZX08L29wdGlvbj5gXG4gICAgfSlcbiAgICBzZWxlY3RNSURJSW4uaW5uZXJIVE1MID0gaHRtbFxuXG4gICAgc2VsZWN0TUlESUluLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGUgPT4ge1xuICAgICAgbGV0IHBvcnRJZCA9IHNlbGVjdE1JRElJbi5vcHRpb25zW3NlbGVjdE1JRElJbi5zZWxlY3RlZEluZGV4XS5pZFxuICAgICAgLy8gc29uZy5nZXRUcmFja3MoKS5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIC8vICAgdHJhY2suZGlzY29ubmVjdE1JRElJbnB1dHMoKSAvLyBubyBhcmd1bWVudHMgbWVhbnMgZGlzY29ubmVjdCBmcm9tIGFsbCBpbnB1dHNcbiAgICAgIC8vICAgdHJhY2suY29ubmVjdE1JRElJbnB1dHMocG9ydElkKVxuICAgICAgLy8gfSlcbiAgICAgIGxldCB0cmFjayA9IHNvbmcuZ2V0VHJhY2tzKClbMF1cbiAgICAgIHRyYWNrLmRpc2Nvbm5lY3RNSURJSW5wdXRzKCkgLy8gbm8gYXJndW1lbnRzIG1lYW5zIGRpc2Nvbm5lY3QgZnJvbSBhbGwgaW5wdXRzXG4gICAgICB0cmFjay5jb25uZWN0TUlESUlucHV0cyhwb3J0SWQpXG4gICAgfSlcblxuICAgIGxldCBNSURJT3V0cHV0cyA9IGdldE1JRElPdXRwdXRzKClcbiAgICBodG1sID0gJzxvcHRpb24gaWQ9XCItMVwiPnNlbGVjdCBNSURJIG91dDwvb3B0aW9uPidcbiAgICBNSURJT3V0cHV0cy5mb3JFYWNoKHBvcnQgPT4ge1xuICAgICAgaHRtbCArPSBgPG9wdGlvbiBpZD1cIiR7cG9ydC5pZH1cIj4ke3BvcnQubmFtZX08L29wdGlvbj5gXG4gICAgfSlcbiAgICBzZWxlY3RNSURJT3V0LmlubmVySFRNTCA9IGh0bWxcblxuICAgIHNlbGVjdE1JRElPdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZSA9PiB7XG4gICAgICBsZXQgcG9ydElkID0gc2VsZWN0TUlESU91dC5vcHRpb25zW3NlbGVjdE1JRElPdXQuc2VsZWN0ZWRJbmRleF0uaWRcbiAgICAgIHNvbmcuZ2V0VHJhY2tzKCkuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICAgIHRyYWNrLmRpc2Nvbm5lY3RNSURJT3V0cHV0cygpIC8vIG5vIGFyZ3VtZW50cyBtZWFucyBkaXNjb25uZWN0IGZyb20gYWxsIG91dHB1dHNcbiAgICAgICAgdHJhY2suY29ubmVjdE1JRElPdXRwdXRzKHBvcnRJZClcbiAgICAgIH0pXG4vKlxuICAgICAgbGV0IHRyYWNrID0gc29uZy5nZXRUcmFja3MoKVswXVxuICAgICAgdHJhY2suZGlzY29ubmVjdE1JRElPdXRwdXRzKHRyYWNrLmdldE1JRElPdXRwdXRzKClbMF0pXG4gICAgICAvL3RyYWNrLmRpc2Nvbm5lY3RNSURJT3V0cHV0cygpIC8vIG5vIGFyZ3VtZW50cyBtZWFucyBkaXNjb25uZWN0IGZyb20gYWxsIGlucHV0c1xuICAgICAgdHJhY2suY29ubmVjdE1JRElPdXRwdXRzKHBvcnRJZClcbiovXG4gICAgfSlcblxuICAgIHJhbmdlTGF0ZW5jeS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBlID0+IHtcbiAgICAgIHNvbmcuZ2V0VHJhY2tzKCkuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICAgIHRyYWNrLmxhdGVuY3kgPSBlLnRhcmdldC52YWx1ZUFzTnVtYmVyXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBidG5NZXRyb25vbWUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgc29uZy5zZXRNZXRyb25vbWUoKSAvLyBpZiBubyBhcmd1bWVudHMgYXJlIHByb3ZpZGVkIGl0IHNpbXBseSB0b2dnbGVzXG4gICAgICBidG5NZXRyb25vbWUuaW5uZXJIVE1MID0gc29uZy51c2VNZXRyb25vbWUgPyAnbWV0cm9ub21lIG9uJyA6ICdtZXRyb25vbWUgb2ZmJ1xuICAgIH0pXG5cbiAgICBidG5QbGF5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcucGxheSgpXG4gICAgfSlcblxuICAgIGJ0blBhdXNlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcucGF1c2UoKVxuICAgIH0pXG5cbiAgICBidG5TdG9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcuc3RvcCgpXG4gICAgfSlcblxuICAgIGJ0bkluc3RydW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgc29uZy5nZXRUcmFja3MoKS5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgICAgaWYodHJhY2suZ2V0SW5zdHJ1bWVudCgpID09PSBudWxsKXtcbiAgICAgICAgICBidG5JbnN0cnVtZW50LmlubmVySFRNTCA9ICdyZW1vdmUgaW5zdHJ1bWVudCdcbiAgICAgICAgICB0cmFjay5zZXRJbnN0cnVtZW50KG5ldyBJbnN0cnVtZW50KCkpIC8vIGJ5IHBhc3NpbmcgYSBuZXcgSW5zdHJ1bWVudCwgdGhlIHNpbXBsZSBzaW5ld2F2ZSBzeW50aCBpcyB1c2VkIGZvciBpbnN0cnVtZW50XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJ0bkluc3RydW1lbnQuaW5uZXJIVE1MID0gJ3NldCBpbnN0cnVtZW50J1xuICAgICAgICAgIHRyYWNrLnNldEluc3RydW1lbnQoKSAvLyBieSBub3QgcHJvdmlkaW5nIGFuIGluc3RydW1lbnQgeW91IHJlbW92ZSB0aGUgaW5zdHJ1bWVudCBmcm9tIHRoaXMgdHJhY2tcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgbGV0IHBvc2l0aW9uID0gc29uZy5nZXRQb3NpdGlvbigpXG4gICAgZGl2UG9zaXRpb24uaW5uZXJIVE1MID0gcG9zaXRpb24uYmFyc0FzU3RyaW5nXG4gICAgZGl2UG9zaXRpb25UaW1lLmlubmVySFRNTCA9IHBvc2l0aW9uLnRpbWVBc1N0cmluZ1xuICAgIGRpdlRlbXBvLmlubmVySFRNTCA9IGB0ZW1wbzogJHtwb3NpdGlvbi5icG19IGJwbWBcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcigncG9zaXRpb24nLCBldmVudCA9PiB7XG4gICAgICBkaXZQb3NpdGlvbi5pbm5lckhUTUwgPSBldmVudC5kYXRhLmJhcnNBc1N0cmluZ1xuICAgICAgZGl2UG9zaXRpb25UaW1lLmlubmVySFRNTCA9IGV2ZW50LmRhdGEudGltZUFzU3RyaW5nXG4gICAgICBkaXZUZW1wby5pbm5lckhUTUwgPSBgdGVtcG86ICR7ZXZlbnQuZGF0YS5icG19IGJwbWBcbiAgICAgIGlmKCF1c2VySW50ZXJhY3Rpb24pe1xuICAgICAgICByYW5nZVBvc2l0aW9uLnZhbHVlID0gZXZlbnQuZGF0YS5wZXJjZW50YWdlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJhbmdlUG9zaXRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGUgPT4ge1xuICAgICAgcmFuZ2VQb3NpdGlvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByYW5nZUxpc3RlbmVyKVxuICAgICAgdXNlckludGVyYWN0aW9uID0gZmFsc2VcbiAgICB9KVxuXG4gICAgcmFuZ2VQb3NpdGlvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBlID0+IHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgc29uZy5zZXRQb3NpdGlvbigncGVyY2VudGFnZScsIGUudGFyZ2V0LnZhbHVlQXNOdW1iZXIpXG4gICAgICB9LCAwKVxuICAgICAgcmFuZ2VQb3NpdGlvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByYW5nZUxpc3RlbmVyKVxuICAgICAgdXNlckludGVyYWN0aW9uID0gdHJ1ZVxuICAgIH0pXG5cbiAgICBjb25zdCByYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgICBzb25nLnNldFBvc2l0aW9uKCdwZXJjZW50YWdlJywgZS50YXJnZXQudmFsdWVBc051bWJlcilcbiAgICB9XG4gIH1cblxufSlcbiIsIi8vIHRoZSB3aGF0d2ctZmV0Y2ggcG9seWZpbGwgaW5zdGFsbHMgdGhlIGZldGNoKCkgZnVuY3Rpb25cbi8vIG9uIHRoZSBnbG9iYWwgb2JqZWN0ICh3aW5kb3cgb3Igc2VsZilcbi8vXG4vLyBSZXR1cm4gdGhhdCBhcyB0aGUgZXhwb3J0IGZvciB1c2UgaW4gV2VicGFjaywgQnJvd3NlcmlmeSBldGMuXG5yZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKTtcbm1vZHVsZS5leHBvcnRzID0gc2VsZi5mZXRjaC5iaW5kKHNlbGYpO1xuIiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMubWFwKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRoaXMubWFwW25hbWVdLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcylcbiAgICAgIH0sIHRoaXMpXG4gICAgfSwgdGhpcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKG5hbWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHsgaXRlbXMucHVzaCh2YWx1ZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIC8vIE9ubHkgc3VwcG9ydCBBcnJheUJ1ZmZlcnMgZm9yIFBPU1QgbWV0aG9kLlxuICAgICAgICAvLyBSZWNlaXZpbmcgQXJyYXlCdWZmZXJzIGhhcHBlbnMgdmlhIEJsb2JzLCBpbnN0ZWFkLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQgOiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG4gICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpKSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gaW5wdXRcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gaGVhZGVycyh4aHIpIHtcbiAgICB2YXIgaGVhZCA9IG5ldyBIZWFkZXJzKClcbiAgICB2YXIgcGFpcnMgPSAoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdFxuICAgICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICAgIHJlcXVlc3QgPSBpbnB1dFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMoeGhyKSxcbiAgICAgICAgICB1cmw6IHJlc3BvbnNlVVJMKClcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiXG4vLyBzdGFuZGFyZCBNSURJIGV2ZW50c1xuY29uc3QgTUlESUV2ZW50VHlwZXMgPSB7fVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09GRicsIHt2YWx1ZTogMHg4MH0pIC8vMTI4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09OJywge3ZhbHVlOiAweDkwfSkgLy8xNDRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BPTFlfUFJFU1NVUkUnLCB7dmFsdWU6IDB4QTB9KSAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVFJPTF9DSEFOR0UnLCB7dmFsdWU6IDB4QjB9KSAvLzE3NlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUFJPR1JBTV9DSEFOR0UnLCB7dmFsdWU6IDB4QzB9KSAvLzE5MlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ0hBTk5FTF9QUkVTU1VSRScsIHt2YWx1ZTogMHhEMH0pIC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQSVRDSF9CRU5EJywge3ZhbHVlOiAweEUwfSkgLy8yMjRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NZU1RFTV9FWENMVVNJVkUnLCB7dmFsdWU6IDB4RjB9KSAvLzI0MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTUlESV9USU1FQ09ERScsIHt2YWx1ZTogMjQxfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfUE9TSVRJT04nLCB7dmFsdWU6IDI0Mn0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTT05HX1NFTEVDVCcsIHt2YWx1ZTogMjQzfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RVTkVfUkVRVUVTVCcsIHt2YWx1ZTogMjQ2fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0VPWCcsIHt2YWx1ZTogMjQ3fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RJTUlOR19DTE9DSycsIHt2YWx1ZTogMjQ4fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NUQVJUJywge3ZhbHVlOiAyNTB9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVElOVUUnLCB7dmFsdWU6IDI1MX0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTVE9QJywge3ZhbHVlOiAyNTJ9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQUNUSVZFX1NFTlNJTkcnLCB7dmFsdWU6IDI1NH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTWVNURU1fUkVTRVQnLCB7dmFsdWU6IDI1NX0pXG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVEVNUE8nLCB7dmFsdWU6IDB4NTF9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNRV9TSUdOQVRVUkUnLCB7dmFsdWU6IDB4NTh9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU5EX09GX1RSQUNLJywge3ZhbHVlOiAweDJGfSlcblxuZXhwb3J0IHtNSURJRXZlbnRUeXBlc31cbiIsImxldCBldmVudExpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldmVudCl7XG4gIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSlcbiAgbGV0IG1hcFxuXG4gIGlmKGV2ZW50LnR5cGUgPT09ICdldmVudCcpe1xuICAgIGxldCBtaWRpRXZlbnQgPSBldmVudC5kYXRhXG4gICAgbGV0IG1pZGlFdmVudFR5cGUgPSBtaWRpRXZlbnQudHlwZVxuICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50VHlwZSlcbiAgICBpZihldmVudExpc3RlbmVycy5oYXMobWlkaUV2ZW50VHlwZSkpe1xuICAgICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudFR5cGUpXG4gICAgICBmb3IobGV0IGNiIG9mIG1hcC52YWx1ZXMoKSl7XG4gICAgICAgIGNiKG1pZGlFdmVudClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyhldmVudC50eXBlKSA9PT0gZmFsc2Upe1xuICAgIHJldHVyblxuICB9XG5cbiAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpXG4gIGZvcihsZXQgY2Igb2YgbWFwLnZhbHVlcygpKXtcbiAgICBjYihldmVudClcbiAgfVxuXG5cbiAgLy8gQHRvZG86IHJ1biBmaWx0ZXJzIGhlcmUsIGZvciBpbnN0YW5jZSBpZiBhbiBldmVudGxpc3RlbmVyIGhhcyBiZWVuIGFkZGVkIHRvIGFsbCBOT1RFX09OIGV2ZW50cywgY2hlY2sgdGhlIHR5cGUgb2YgdGhlIGluY29taW5nIGV2ZW50XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBjYWxsYmFjayl7XG5cbiAgbGV0IG1hcFxuICBsZXQgaWQgPSBgJHt0eXBlfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcblxuICBpZihldmVudExpc3RlbmVycy5oYXModHlwZSkgPT09IGZhbHNlKXtcbiAgICBtYXAgPSBuZXcgTWFwKClcbiAgICBldmVudExpc3RlbmVycy5zZXQodHlwZSwgbWFwKVxuICB9ZWxzZXtcbiAgICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQodHlwZSlcbiAgfVxuXG4gIG1hcC5zZXQoaWQsIGNhbGxiYWNrKVxuICAvL2NvbnNvbGUubG9nKGV2ZW50TGlzdGVuZXJzKVxuICByZXR1cm4gaWRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG5cbiAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5sb2coJ25vIGV2ZW50bGlzdGVuZXJzIG9mIHR5cGUnICsgdHlwZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGxldCBtYXAgPSBldmVudExpc3RlbmVycy5nZXQodHlwZSlcblxuICBpZih0eXBlb2YgaWQgPT09ICdmdW5jdGlvbicpe1xuICAgIGZvcihsZXQgW2tleSwgdmFsdWVdIG9mIG1hcC5lbnRyaWVzKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKGtleSwgdmFsdWUpXG4gICAgICBpZih2YWx1ZSA9PT0gaWQpe1xuICAgICAgICBjb25zb2xlLmxvZyhrZXkpXG4gICAgICAgIGlkID0ga2V5XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpe1xuICAgICAgbWFwLmRlbGV0ZShpZClcbiAgICB9XG4gIH1lbHNlIGlmKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpe1xuICAgIG1hcC5kZWxldGUoaWQpXG4gIH1lbHNle1xuICAgIGNvbnNvbGUubG9nKCdjb3VsZCBub3QgcmVtb3ZlIGV2ZW50bGlzdGVuZXInKVxuICB9XG59XG5cbiIsIi8vIGZldGNoIGhlbHBlcnNcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXR1cyhyZXNwb25zZSkge1xuICBpZihyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCl7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpKVxuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBqc29uKHJlc3BvbnNlKXtcbiAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlCdWZmZXIocmVzcG9uc2Upe1xuICByZXR1cm4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKVxufVxuIiwiaW1wb3J0IHtpbml0QXVkaW99IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7aW5pdE1JREl9IGZyb20gJy4vaW5pdF9taWRpJ1xuXG5leHBvcnQgbGV0IGdldFVzZXJNZWRpYSA9ICgoKSA9PiB7XG4gIGlmKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gbmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhXG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS53YXJuKCdnZXRVc2VyTWVkaWEgaXMgbm90IGF2YWlsYWJsZScpXG4gIH1cbn0pKClcblxuXG5leHBvcnQgbGV0IHJlcXVlc3RBbmltYXRpb25GcmFtZSA9ICgoKSA9PiB7XG4gIGlmKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS53YXJuKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgaXMgbm90IGF2YWlsYWJsZScpXG4gIH1cbn0pKClcblxuXG5leHBvcnQgbGV0IEJsb2IgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHdpbmRvdy5CbG9iIHx8IHdpbmRvdy53ZWJraXRCbG9iXG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS53YXJuKCdCbG9iIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuLy9leHBvcnQgZnVuY3Rpb24gaW5pdChzZXR0aW5ncyA9IHt9KTogdm9pZHtcbmV4cG9ydCBmdW5jdGlvbiBpbml0KGNhbGxiYWNrKTogdm9pZHtcblxuICAvLyBsb2FkIHNldHRpbmdzLmluc3RydW1lbnRzIChhcnJheSBvciBvYmplY3QpXG4gIC8vIGxvYWQgc2V0dGluZ3MubWlkaWZpbGVzIChhcnJheSBvciBvYmplY3QpXG4gIC8qXG5cbiAgICBxYW1iaS5pbml0KHtcbiAgICAgIGluc3RydW1lbnRzOiBbJy4uL2luc3RydW1lbnRzL3BpYW5vJywgJy4uL2luc3RydW1lbnRzL3Zpb2xpbiddLFxuICAgICAgbWlkaWZpbGVzOiBbJy4uL21pZGkvbW96YXJ0Lm1pZCddXG4gICAgfSlcbiAgICAudGhlbigobG9hZGVkKSA9PiB7XG4gICAgICBsZXQgW3BpYW5vLCB2aW9saW5dID0gbG9hZGVkLmluc3RydW1lbnRzXG4gICAgICBsZXQgW21vemFydF0gPSBsb2FkZWQubWlkaWZpbGVzXG4gICAgfSlcblxuICAqL1xuXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgIFByb21pc2UuYWxsKFtpbml0QXVkaW8oKSwgaW5pdE1JREkoKV0pXG4gICAgLnRoZW4oXG4gICAgKGRhdGEpID0+IHtcbiAgICAgIC8vIHBhcnNlQXVkaW9cbiAgICAgIGxldCBkYXRhQXVkaW8gPSBkYXRhWzBdXG5cbiAgICAgIC8vIHBhcnNlTUlESVxuICAgICAgbGV0IGRhdGFNaWRpID0gZGF0YVsxXVxuXG4gICAgICByZXNvbHZlKHtcbiAgICAgICAgbGVnYWN5OiBkYXRhQXVkaW8ubGVnYWN5LFxuICAgICAgICBtcDM6IGRhdGFBdWRpby5tcDMsXG4gICAgICAgIG9nZzogZGF0YUF1ZGlvLm9nZyxcbiAgICAgICAgbWlkaTogZGF0YU1pZGkubWlkaSxcbiAgICAgICAgd2VibWlkaTogZGF0YU1pZGkud2VibWlkaSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICAoZXJyb3IpID0+IHtcbiAgICAgIHJlamVjdChlcnJvcilcbiAgICB9KVxuICB9KVxuXG5cbi8qXG4gIFByb21pc2UuYWxsKFtpbml0QXVkaW8oKSwgaW5pdE1JREkoKV0pXG4gIC50aGVuKFxuICAoZGF0YSkgPT4ge1xuICAgIC8vIHBhcnNlQXVkaW9cbiAgICBsZXQgZGF0YUF1ZGlvID0gZGF0YVswXVxuXG4gICAgLy8gcGFyc2VNSURJXG4gICAgbGV0IGRhdGFNaWRpID0gZGF0YVsxXVxuXG4gICAgY2FsbGJhY2soe1xuICAgICAgbGVnYWN5OiBkYXRhQXVkaW8ubGVnYWN5LFxuICAgICAgbXAzOiBkYXRhQXVkaW8ubXAzLFxuICAgICAgb2dnOiBkYXRhQXVkaW8ub2dnLFxuICAgICAgbWlkaTogZGF0YU1pZGkubWlkaSxcbiAgICAgIHdlYm1pZGk6IGRhdGFNaWRpLndlYm1pZGksXG4gICAgfSlcbiAgfSxcbiAgKGVycm9yKSA9PiB7XG4gICAgY2FsbGJhY2soZXJyb3IpXG4gIH0pXG4qL1xufVxuIiwiLypcbiAgU2V0cyB1cCB0aGUgYmFzaWMgYXVkaW8gcm91dGluZywgdGVzdHMgd2hpY2ggYXVkaW8gZm9ybWF0cyBhcmUgc3VwcG9ydGVkIGFuZCBwYXJzZXMgdGhlIHNhbXBsZXMgZm9yIHRoZSBtZXRyb25vbWUgdGlja3MuXG4qL1xuXG5pbXBvcnQgc2FtcGxlcyBmcm9tICcuL3NhbXBsZXMnXG5pbXBvcnQge3BhcnNlU2FtcGxlc30gZnJvbSAnLi9wYXJzZV9hdWRpbydcblxubGV0XG4gIG1hc3RlckdhaW4sXG4gIGNvbXByZXNzb3IsXG4gIGluaXRpYWxpemVkID0gZmFsc2UsXG4gIGRhdGFcblxuZXhwb3J0IGxldCBjb250ZXh0ID0gKGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nKCdpbml0IEF1ZGlvQ29udGV4dCcpXG4gIGxldCBjdHhcbiAgaWYodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpe1xuICAgIGxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHRcbiAgICBpZihBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKVxuICAgIH1cbiAgfVxuICBpZih0eXBlb2YgY3R4ID09PSAndW5kZWZpbmVkJyl7XG4gICAgLy9AVE9ETzogY3JlYXRlIGR1bW15IEF1ZGlvQ29udGV4dCBmb3IgdXNlIGluIG5vZGUsIHNlZTogaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvYXVkaW8tY29udGV4dFxuICAgIGNvbnRleHQgPSB7XG4gICAgICBjcmVhdGVHYWluOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGdhaW46IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZU9zY2lsbGF0b3I6IGZ1bmN0aW9uKCl7fSxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN0eFxufSgpKVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0QXVkaW8oKXtcblxuICBpZih0eXBlb2YgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW5cbiAgfVxuICAvLyBjaGVjayBmb3Igb2xkZXIgaW1wbGVtZW50YXRpb25zIG9mIFdlYkF1ZGlvXG4gIGRhdGEgPSB7fVxuICBsZXQgc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICBkYXRhLmxlZ2FjeSA9IGZhbHNlXG4gIGlmKHR5cGVvZiBzb3VyY2Uuc3RhcnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBkYXRhLmxlZ2FjeSA9IHRydWVcbiAgfVxuXG4gIC8vIHNldCB1cCB0aGUgZWxlbWVudGFyeSBhdWRpbyBub2Rlc1xuICBjb21wcmVzc29yID0gY29udGV4dC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKVxuICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgbWFzdGVyR2FpbiA9IGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUoKVxuICBtYXN0ZXJHYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gMC41XG4gIGluaXRpYWxpemVkID0gdHJ1ZVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICBwYXJzZVNhbXBsZXMoc2FtcGxlcykudGhlbihcbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGJ1ZmZlcnMpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKGJ1ZmZlcnMpXG4gICAgICAgIGRhdGEub2dnID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlPZ2cgIT09ICd1bmRlZmluZWQnXG4gICAgICAgIGRhdGEubXAzID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlNcDMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgIGRhdGEubG93dGljayA9IGJ1ZmZlcnMubG93dGlja1xuICAgICAgICBkYXRhLmhpZ2h0aWNrID0gYnVmZmVycy5oaWdodGlja1xuICAgICAgICBpZihkYXRhLm9nZyA9PT0gZmFsc2UgJiYgZGF0YS5tcDMgPT09IGZhbHNlKXtcbiAgICAgICAgICByZWplY3QoJ05vIHN1cHBvcnQgZm9yIG9nZyBub3IgbXAzIScpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJlc29sdmUoZGF0YSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoKXtcbiAgICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSBpbml0aWFsaXppbmcgQXVkaW8nKVxuICAgICAgfVxuICAgIClcbiAgfSlcbn1cblxuXG5sZXQgc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24odmFsdWU6IG51bWJlciA9IDAuNSk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24odmFsdWU6IG51bWJlciA9IDAuNSl7XG4gICAgICBpZih2YWx1ZSA+IDEpe1xuICAgICAgICBjb25zb2xlLmluZm8oJ21heGltYWwgdm9sdW1lIGlzIDEuMCwgdm9sdW1lIGlzIHNldCB0byAxLjAnKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUgPCAwID8gMCA6IHZhbHVlID4gMSA/IDEgOiB2YWx1ZVxuICAgICAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldE1hc3RlclZvbHVtZSh2YWx1ZSlcbiAgfVxufVxuXG5cbmxldCBnZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbWFzdGVyR2Fpbi5nYWluLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRNYXN0ZXJWb2x1bWUoKVxuICB9XG59XG5cblxubGV0IGdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gY29tcHJlc3Nvci5yZWR1Y3Rpb24udmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIGdldENvbXByZXNzaW9uUmVkdWN0aW9uKClcbiAgfVxufVxuXG5cbmxldCBlbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBlbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oZmxhZzogYm9vbGVhbil7XG4gICAgICBpZihmbGFnKXtcbiAgICAgICAgbWFzdGVyR2Fpbi5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmNvbm5lY3QoY29tcHJlc3Nvcik7XG4gICAgICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIGVuYWJsZU1hc3RlckNvbXByZXNzb3IoKVxuICB9XG59XG5cblxubGV0IGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihjZmcpOiB2b2lke1xuICAvKlxuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGF0dGFjazsgLy8gaW4gU2Vjb25kc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGtuZWU7IC8vIGluIERlY2liZWxzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmF0aW87IC8vIHVuaXQtbGVzc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlZHVjdGlvbjsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWxlYXNlOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gdGhyZXNob2xkOyAvLyBpbiBEZWNpYmVsc1xuXG4gICAgQHNlZTogaHR0cDovL3dlYmF1ZGlvLmdpdGh1Yi5pby93ZWItYXVkaW8tYXBpLyN0aGUtZHluYW1pY3Njb21wcmVzc29ybm9kZS1pbnRlcmZhY2VcbiAgKi9cbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oY2ZnOiB7fSl7XG4gICAgICAoe1xuICAgICAgICBhdHRhY2s6IGNvbXByZXNzb3IuYXR0YWNrID0gMC4wMDMsXG4gICAgICAgIGtuZWU6IGNvbXByZXNzb3Iua25lZSA9IDMwLFxuICAgICAgICByYXRpbzogY29tcHJlc3Nvci5yYXRpbyA9IDEyLFxuICAgICAgICByZWR1Y3Rpb246IGNvbXByZXNzb3IucmVkdWN0aW9uID0gMCxcbiAgICAgICAgcmVsZWFzZTogY29tcHJlc3Nvci5yZWxlYXNlID0gMC4yNTAsXG4gICAgICAgIHRocmVzaG9sZDogY29tcHJlc3Nvci50aHJlc2hvbGQgPSAtMjQsXG4gICAgICB9ID0gY2ZnKVxuICAgIH1cbiAgICBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yKGNmZylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5pdERhdGEoKXtcbiAgcmV0dXJuIGRhdGFcbn1cblxuZXhwb3J0IHttYXN0ZXJHYWluLCBjb21wcmVzc29yIGFzIG1hc3RlckNvbXByZXNzb3IsIHNldE1hc3RlclZvbHVtZSwgZ2V0TWFzdGVyVm9sdW1lLCBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiwgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciwgY29uZmlndXJlTWFzdGVyQ29tcHJlc3Nvcn1cbiIsIi8qXG4gIFJlcXVlc3RzIE1JREkgYWNjZXNzLCBxdWVyaWVzIGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgYW5kIHN0b3JlcyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxuKi9cblxuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5cblxubGV0IE1JRElBY2Nlc3NcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlXG5sZXQgaW5wdXRzID0gW11cbmxldCBvdXRwdXRzID0gW11cbmxldCBpbnB1dElkcyA9IFtdXG5sZXQgb3V0cHV0SWRzID0gW11cbmxldCBpbnB1dHNCeUlkID0gbmV3IE1hcCgpXG5sZXQgb3V0cHV0c0J5SWQgPSBuZXcgTWFwKClcblxubGV0IHNvbmdNaWRpRXZlbnRMaXN0ZW5lclxubGV0IG1pZGlFdmVudExpc3RlbmVySWQgPSAwXG5cblxuZnVuY3Rpb24gZ2V0TUlESXBvcnRzKCl7XG4gIGlucHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5pbnB1dHMudmFsdWVzKCkpXG5cbiAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gIGlucHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSlcblxuICBmb3IobGV0IHBvcnQgb2YgaW5wdXRzKXtcbiAgICBpbnB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KVxuICAgIGlucHV0SWRzLnB1c2gocG9ydC5pZClcbiAgfVxuXG4gIG91dHB1dHMgPSBBcnJheS5mcm9tKE1JRElBY2Nlc3Mub3V0cHV0cy52YWx1ZXMoKSlcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgb3V0cHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSlcblxuICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gIGZvcihsZXQgcG9ydCBvZiBvdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKHBvcnQuaWQsIHBvcnQubmFtZSlcbiAgICBvdXRwdXRzQnlJZC5zZXQocG9ydC5pZCwgcG9ydClcbiAgICBvdXRwdXRJZHMucHVzaChwb3J0LmlkKVxuICB9XG4gIC8vY29uc29sZS5sb2cob3V0cHV0c0J5SWQpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNSURJKCl7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICBpZih0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgIHJlc29sdmUoe21pZGk6IGZhbHNlfSlcbiAgICB9ZWxzZSBpZih0eXBlb2YgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzICE9PSAndW5kZWZpbmVkJyl7XG5cbiAgICAgIGxldCBqYXp6LCBtaWRpLCB3ZWJtaWRpXG5cbiAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcygpLnRoZW4oXG5cbiAgICAgICAgZnVuY3Rpb24gb25GdWxGaWxsZWQobWlkaUFjY2Vzcyl7XG4gICAgICAgICAgTUlESUFjY2VzcyA9IG1pZGlBY2Nlc3NcbiAgICAgICAgICBpZih0eXBlb2YgbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlcyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgamF6eiA9IG1pZGlBY2Nlc3MuX2phenpJbnN0YW5jZXNbMF0uX0phenoudmVyc2lvblxuICAgICAgICAgICAgbWlkaSA9IHRydWVcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHdlYm1pZGkgPSB0cnVlXG4gICAgICAgICAgICBtaWRpID0gdHJ1ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGdldE1JRElwb3J0cygpXG5cbiAgICAgICAgICAvLyBvbmNvbm5lY3QgYW5kIG9uZGlzY29ubmVjdCBhcmUgbm90IHlldCBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgYW5kIENocm9taXVtXG4gICAgICAgICAgbWlkaUFjY2Vzcy5vbmNvbm5lY3QgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgY29ubmVjdGVkJywgZSlcbiAgICAgICAgICAgIGdldE1JRElwb3J0cygpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWlkaUFjY2Vzcy5vbmRpc2Nvbm5lY3QgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgZGlzY29ubmVjdGVkJywgZSlcbiAgICAgICAgICAgIGdldE1JRElwb3J0cygpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICBqYXp6LFxuICAgICAgICAgICAgbWlkaSxcbiAgICAgICAgICAgIHdlYm1pZGksXG4gICAgICAgICAgICBpbnB1dHMsXG4gICAgICAgICAgICBvdXRwdXRzLFxuICAgICAgICAgICAgaW5wdXRzQnlJZCxcbiAgICAgICAgICAgIG91dHB1dHNCeUlkLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QoZSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhlKVxuICAgICAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgcmVxdWVzdGluZyBNSURJQWNjZXNzJywgZSlcbiAgICAgICAgfVxuICAgICAgKVxuICAgIC8vIGJyb3dzZXJzIHdpdGhvdXQgV2ViTUlESSBBUElcbiAgICB9ZWxzZXtcbiAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgcmVzb2x2ZSh7bWlkaTogZmFsc2V9KVxuICAgIH1cbiAgfSlcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElBY2Nlc3MgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElBY2Nlc3MgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIE1JRElBY2Nlc3NcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElBY2Nlc3MoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBvdXRwdXRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJT3V0cHV0cygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBpbnB1dHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElJbnB1dHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRJZHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRJZHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG91dHB1dElkc1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dElkcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElJbnB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gaW5wdXRJZHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElJbnB1dElkcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0QnlJZCA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRCeUlkID0gZnVuY3Rpb24oX2lkKXtcbiAgICAgIHJldHVybiBvdXRwdXRzQnlJZC5nZXQoX2lkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dEJ5SWQoaWQpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24oaWQ6IHN0cmluZyl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uKF9pZCl7XG4gICAgICByZXR1cm4gaW5wdXRzQnlJZC5nZXQoX2lkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0QnlJZChpZClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNaWRpU29uZyhzb25nKXtcblxuICBzb25nTWlkaUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKXtcbiAgICAvL2NvbnNvbGUubG9nKGUpXG4gICAgaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIGUsIHRoaXMpO1xuICB9O1xuXG4gIC8vIGJ5IGRlZmF1bHQgYSBzb25nIGxpc3RlbnMgdG8gYWxsIGF2YWlsYWJsZSBtaWRpLWluIHBvcnRzXG4gIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHBvcnQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xuXG4gIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlJbnB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgaW5wdXQgPSBpbnB1dHMuZ2V0KGlkKTtcblxuICBpZihpbnB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIGlucHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaUlucHV0cy5kZWxldGUoaWQpO1xuICAgIGlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChpZCwgaW5wdXQpO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlJbnB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaU91dHB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgb3V0cHV0ID0gb3V0cHV0cy5nZXQoaWQpO1xuXG4gIGlmKG91dHB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIG91dHB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLmRlbGV0ZShpZCk7XG4gICAgbGV0IHRpbWUgPSBzb25nLnNjaGVkdWxlci5sYXN0RXZlbnRUaW1lICsgMTAwO1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZSk7IC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lKTsgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gIH1lbHNle1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KGlkLCBvdXRwdXQpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaU91dHB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVNvbmcoc29uZywgbWlkaU1lc3NhZ2VFdmVudCwgaW5wdXQpe1xuICBsZXQgbWlkaUV2ZW50ID0gbmV3IE1pZGlFdmVudChzb25nLnRpY2tzLCAuLi5taWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1pZGlJbnB1dHMsIGlucHV0KTtcblxuXG4gICAgLy9pZihtaWRpRXZlbnQuY2hhbm5lbCA9PT0gdHJhY2suY2hhbm5lbCB8fCB0cmFjay5jaGFubmVsID09PSAwIHx8IHRyYWNrLmNoYW5uZWwgPT09ICdhbnknKXtcbiAgICAvLyAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrKTtcbiAgICAvL31cblxuXG4gICAgLy8gbGlrZSBpbiBDdWJhc2UsIG1pZGkgZXZlbnRzIGZyb20gYWxsIGRldmljZXMsIHNlbnQgb24gYW55IG1pZGkgY2hhbm5lbCBhcmUgZm9yd2FyZGVkIHRvIGFsbCB0cmFja3NcbiAgICAvLyBzZXQgdHJhY2subW9uaXRvciB0byBmYWxzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byByZWNlaXZlIG1pZGkgZXZlbnRzIG9uIGEgY2VydGFpbiB0cmFja1xuICAgIC8vIG5vdGUgdGhhdCB0cmFjay5tb25pdG9yIGlzIGJ5IGRlZmF1bHQgc2V0IHRvIGZhbHNlIGFuZCB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYXV0b21hdGljYWxseSBzZXQgdG8gdHJ1ZVxuICAgIC8vIGlmIHlvdSBhcmUgcmVjb3JkaW5nIG9uIHRoYXQgdHJhY2tcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1vbml0b3IsIHRyYWNrLmlkLCBpbnB1dC5pZCk7XG4gICAgaWYodHJhY2subW9uaXRvciA9PT0gdHJ1ZSAmJiB0cmFjay5taWRpSW5wdXRzLmdldChpbnB1dC5pZCkgIT09IHVuZGVmaW5lZCl7XG4gICAgICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2ssIGlucHV0KTtcbiAgICB9XG4gIH1cblxuICBsZXQgbGlzdGVuZXJzID0gc29uZy5taWRpRXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudC50eXBlKTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIGZvcihsZXQgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH1cbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sodHJhY2ssIG1pZGlFdmVudCwgaW5wdXQpe1xuICBsZXQgc29uZyA9IHRyYWNrLnNvbmcsXG4gICAgbm90ZSwgbGlzdGVuZXJzLCBjaGFubmVsO1xuICAgIC8vZGF0YSA9IG1pZGlNZXNzYWdlRXZlbnQuZGF0YSxcbiAgICAvL21pZGlFdmVudCA9IGNyZWF0ZU1pZGlFdmVudChzb25nLnRpY2tzLCBkYXRhWzBdLCBkYXRhWzFdLCBkYXRhWzJdKTtcblxuICAvL21pZGlFdmVudC5zb3VyY2UgPSBtaWRpTWVzc2FnZUV2ZW50LnNyY0VsZW1lbnQubmFtZTtcbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50KVxuICAvL2NvbnNvbGUubG9nKCctLS0tPicsIG1pZGlFdmVudC50eXBlKTtcblxuICAvLyBhZGQgdGhlIGV4YWN0IHRpbWUgb2YgdGhpcyBldmVudCBzbyB3ZSBjYW4gY2FsY3VsYXRlIGl0cyB0aWNrcyBwb3NpdGlvblxuICBtaWRpRXZlbnQucmVjb3JkTWlsbGlzID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7IC8vIG1pbGxpc1xuICBtaWRpRXZlbnQuc3RhdGUgPSAncmVjb3JkZWQnO1xuXG4gIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgIG5vdGUgPSBjcmVhdGVNaWRpTm90ZShtaWRpRXZlbnQpO1xuICAgIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV0gPSBub3RlO1xuICAgIC8vdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXSA9IG5vdGU7XG4gIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjgpe1xuICAgIG5vdGUgPSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vIGNoZWNrIGlmIHRoZSBub3RlIGV4aXN0czogaWYgdGhlIHVzZXIgcGxheXMgbm90ZXMgb24gaGVyIGtleWJvYXJkIGJlZm9yZSB0aGUgbWlkaSBzeXN0ZW0gaGFzXG4gICAgLy8gYmVlbiBmdWxseSBpbml0aWFsaXplZCwgaXQgY2FuIGhhcHBlbiB0aGF0IHRoZSBmaXJzdCBpbmNvbWluZyBtaWRpIGV2ZW50IGlzIGEgTk9URSBPRkYgZXZlbnRcbiAgICBpZihub3RlID09PSB1bmRlZmluZWQpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KTtcbiAgICBkZWxldGUgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvL2RlbGV0ZSB0cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdO1xuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhzb25nLnByZXJvbGwsIHNvbmcucmVjb3JkaW5nLCB0cmFjay5yZWNvcmRFbmFibGVkKTtcblxuICBpZigoc29uZy5wcmVyb2xsaW5nIHx8IHNvbmcucmVjb3JkaW5nKSAmJiB0cmFjay5yZWNvcmRFbmFibGVkID09PSAnbWlkaScpe1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgICAgdHJhY2suc29uZy5yZWNvcmRlZE5vdGVzLnB1c2gobm90ZSk7XG4gICAgfVxuICAgIHRyYWNrLnJlY29yZFBhcnQuYWRkRXZlbnQobWlkaUV2ZW50KTtcbiAgICAvLyBzb25nLnJlY29yZGVkRXZlbnRzIGlzIHVzZWQgaW4gdGhlIGtleSBlZGl0b3JcbiAgICB0cmFjay5zb25nLnJlY29yZGVkRXZlbnRzLnB1c2gobWlkaUV2ZW50KTtcbiAgfWVsc2UgaWYodHJhY2suZW5hYmxlUmV0cm9zcGVjdGl2ZVJlY29yZGluZyl7XG4gICAgdHJhY2sucmV0cm9zcGVjdGl2ZVJlY29yZGluZy5wdXNoKG1pZGlFdmVudCk7XG4gIH1cblxuICAvLyBjYWxsIGFsbCBtaWRpIGV2ZW50IGxpc3RlbmVyc1xuICBsaXN0ZW5lcnMgPSB0cmFjay5taWRpRXZlbnRMaXN0ZW5lcnNbbWlkaUV2ZW50LnR5cGVdO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgb2JqZWN0Rm9yRWFjaChsaXN0ZW5lcnMsIGZ1bmN0aW9uKGxpc3RlbmVyKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhbm5lbCA9IHRyYWNrLmNoYW5uZWw7XG4gIGlmKGNoYW5uZWwgPT09ICdhbnknIHx8IGNoYW5uZWwgPT09IHVuZGVmaW5lZCB8fCBpc05hTihjaGFubmVsKSA9PT0gdHJ1ZSl7XG4gICAgY2hhbm5lbCA9IDA7XG4gIH1cblxuICBvYmplY3RGb3JFYWNoKHRyYWNrLm1pZGlPdXRwdXRzLCBmdW5jdGlvbihvdXRwdXQpe1xuICAgIC8vY29uc29sZS5sb2coJ21pZGkgb3V0Jywgb3V0cHV0LCBtaWRpRXZlbnQudHlwZSk7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTQ0IHx8IG1pZGlFdmVudC50eXBlID09PSAxNzYpe1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTIpO1xuICAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICAgIC8vIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxOTIpe1xuICAgIC8vICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTFdKTtcbiAgICB9XG4gICAgLy9vdXRwdXQuc2VuZChbbWlkaUV2ZW50LnN0YXR1cyArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gIH0pO1xuXG4gIC8vIEBUT0RPOiBtYXliZSBhIHRyYWNrIHNob3VsZCBiZSBhYmxlIHRvIHNlbmQgaXRzIGV2ZW50IHRvIGJvdGggYSBtaWRpLW91dCBwb3J0IGFuZCBhbiBpbnRlcm5hbCBoZWFydGJlYXQgc29uZz9cbiAgLy9jb25zb2xlLmxvZyh0cmFjay5yb3V0ZVRvTWlkaU91dCk7XG4gIGlmKHRyYWNrLnJvdXRlVG9NaWRpT3V0ID09PSBmYWxzZSl7XG4gICAgbWlkaUV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgdHJhY2suaW5zdHJ1bWVudC5wcm9jZXNzRXZlbnQobWlkaUV2ZW50KTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGFkZE1pZGlFdmVudExpc3RlbmVyKC4uLmFyZ3MpeyAvLyBjYWxsZXIgY2FuIGJlIGEgdHJhY2sgb3IgYSBzb25nXG5cbiAgbGV0IGlkID0gbWlkaUV2ZW50TGlzdGVuZXJJZCsrO1xuICBsZXQgbGlzdGVuZXI7XG4gICAgdHlwZXMgPSB7fSxcbiAgICBpZHMgPSBbXSxcbiAgICBsb29wO1xuXG5cbiAgLy8gc2hvdWxkIEkgaW5saW5lIHRoaXM/XG4gIGxvb3AgPSBmdW5jdGlvbihhcmdzKXtcbiAgICBmb3IobGV0IGFyZyBvZiBhcmdzKXtcbiAgICAgIGxldCB0eXBlID0gdHlwZVN0cmluZyhhcmcpO1xuICAgICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICAgIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICBsb29wKGFyZyk7XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgbGlzdGVuZXIgPSBhcmc7XG4gICAgICB9ZWxzZSBpZihpc05hTihhcmcpID09PSBmYWxzZSl7XG4gICAgICAgIGFyZyA9IHBhcnNlSW50KGFyZywgMTApO1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICBhcmcgPSBzZXF1ZW5jZXIubWlkaUV2ZW50TnVtYmVyQnlOYW1lKGFyZyk7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBsb29wKGFyZ3MsIDAsIGFyZ3MubGVuZ3RoKTtcbiAgLy9jb25zb2xlLmxvZygndHlwZXMnLCB0eXBlcywgJ2xpc3RlbmVyJywgbGlzdGVuZXIpO1xuXG4gIG9iamVjdEZvckVhY2godHlwZXMsIGZ1bmN0aW9uKHR5cGUpe1xuICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgaWYob2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPSB7fTtcbiAgICB9XG4gICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF0gPSBsaXN0ZW5lcjtcbiAgICBpZHMucHVzaCh0eXBlICsgJ18nICsgaWQpO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKG9iai5taWRpRXZlbnRMaXN0ZW5lcnMpO1xuICByZXR1cm4gaWRzLmxlbmd0aCA9PT0gMSA/IGlkc1swXSA6IGlkcztcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcihpZCwgb2JqKXtcbiAgdmFyIHR5cGU7XG4gIGlkID0gaWQuc3BsaXQoJ18nKTtcbiAgdHlwZSA9IGlkWzBdO1xuICBpZCA9IGlkWzFdO1xuICBkZWxldGUgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF07XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXJzKCl7XG5cbn1cblxuKi9cbiIsImltcG9ydCB7Y3JlYXRlU2FtcGxlfSBmcm9tICcuL3NhbXBsZSdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtjcmVhdGVOb3RlfSBmcm9tICcuL25vdGUnXG5pbXBvcnQge3BhcnNlU2FtcGxlczJ9IGZyb20gJy4vcGFyc2VfYXVkaW8nXG5pbXBvcnQge3R5cGVTdHJpbmd9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5cbmNvbnN0IHBwcSA9IDQ4MFxuY29uc3QgYnBtID0gMTIwXG5jb25zdCBwbGF5YmFja1NwZWVkID0gMVxuY29uc3QgbWlsbGlzUGVyVGljayA9ICgxIC8gcGxheWJhY2tTcGVlZCAqIDYwKSAvIGJwbSAvIHBwcVxuXG5leHBvcnQgY2xhc3MgSW5zdHJ1bWVudHtcblxuICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCB0eXBlOiBzdHJpbmcpe1xuICAgIHRoaXMuaWQgPSBpZFxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICAvLyBjcmVhdGUgYSBzYW1wbGVzIGRhdGEgb2JqZWN0IGZvciBhbGwgMTI4IHZlbG9jaXR5IGxldmVscyBvZiBhbGwgMTI4IG5vdGVzXG4gICAgdGhpcy5zYW1wbGVzRGF0YSA9IG5ldyBBcnJheSgxMjgpLmZpbGwoLTEpO1xuICAgIHRoaXMuc2FtcGxlc0RhdGEgPSB0aGlzLnNhbXBsZXNEYXRhLm1hcChmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG5ldyBBcnJheSgxMjgpLmZpbGwoLTEpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0ge31cbiAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXVxuICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG4gIH1cblxuICBjb25uZWN0KG91dHB1dCl7XG4gICAgdGhpcy5vdXRwdXQgPSBvdXRwdXRcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKXtcbiAgICB0aGlzLm91dHB1dCA9IG51bGxcbiAgfVxuXG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHRpbWUpe1xuICAgIGxldCBzYW1wbGUsIHNhbXBsZURhdGFcbiAgICBpZihpc05hTih0aW1lKSl7XG4gICAgICB0aW1lID0gY29udGV4dC5jdXJyZW50VGltZSArIChldmVudC50aWNrcyAqIG1pbGxpc1BlclRpY2spXG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGltZSlcblxuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAvL2NvbnNvbGUubG9nKDE0NCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG5cbiAgICAgIHNhbXBsZURhdGEgPSB0aGlzLnNhbXBsZXNEYXRhW2V2ZW50LmRhdGExXVtldmVudC5kYXRhMl07XG4gICAgICBzYW1wbGUgPSBjcmVhdGVTYW1wbGUoc2FtcGxlRGF0YSwgZXZlbnQpXG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbZXZlbnQubWlkaU5vdGVJZF0gPSBzYW1wbGVcbiAgICAgIHNhbXBsZS5vdXRwdXQuY29ubmVjdCh0aGlzLm91dHB1dCB8fCBjb250ZXh0LmRlc3RpbmF0aW9uKVxuICAgICAgLy8gc2FtcGxlLnNvdXJjZS5vbmVuZGVkID0gKCkgPT4ge1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnICAgIGRlbGV0aW5nJywgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIC8vICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXVxuICAgICAgLy8gfVxuICAgICAgc2FtcGxlLnN0YXJ0KHRpbWUpXG4gICAgICAvL2NvbnNvbGUubG9nKCdzY2hlZHVsaW5nJywgZXZlbnQuaWQsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAvL2NvbnNvbGUubG9nKCdzdGFydCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vY29uc29sZS5sb2coMTI4LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcbiAgICAgIHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXVxuICAgICAgaWYodHlwZW9mIHNhbXBsZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbygnc2FtcGxlIG5vdCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZCwgJyBtaWRpTm90ZScsIGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLnB1c2goZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIH1lbHNle1xuICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIHRpbWUsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXVxuICAgICAgICB9KVxuICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICB9XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vIHN1c3RhaW4gcGVkYWxcbiAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IHRydWVcbiAgICAgICAgICAvLy8qXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgIGRhdGE6ICdkb3duJ1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8qL1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgZG93bicpXG4gICAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5mb3JFYWNoKChtaWRpTm90ZUlkKSA9PiB7XG4gICAgICAgICAgICBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbbWlkaU5vdGVJZF1cbiAgICAgICAgICAgIGlmKHNhbXBsZSl7XG4gICAgICAgICAgICAgIC8vc2FtcGxlLnN0b3AodGltZSlcbiAgICAgICAgICAgICAgc2FtcGxlLnN0b3AodGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3AnLCBtaWRpTm90ZUlkKVxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbbWlkaU5vdGVJZF1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgdXAnLCB0aGlzLnN1c3RhaW5lZFNhbXBsZXMpXG4gICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICAgICAgICAvLy8qXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgIGRhdGE6ICd1cCdcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vKi9cbiAgICAgICAgICAvL3RoaXMuc3RvcFN1c3RhaW4odGltZSk7XG4gICAgICAgIH1cblxuICAgICAgLy8gcGFubmluZ1xuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTEgPT09IDEwKXtcbiAgICAgICAgLy8gcGFubmluZyBpcyAqbm90KiBleGFjdGx5IHRpbWVkIC0+IG5vdCBwb3NzaWJsZSAoeWV0KSB3aXRoIFdlYkF1ZGlvXG4gICAgICAgIC8vY29uc29sZS5sb2coZGF0YTIsIHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG4gICAgICAgIC8vdHJhY2suc2V0UGFubmluZyhyZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuXG4gICAgICAvLyB2b2x1bWVcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGExID09PSA3KXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBsb2FkIGFuZCBwYXJzZVxuICBwYXJzZVNhbXBsZURhdGEoZGF0YSl7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcGFyc2VTYW1wbGVzMihkYXRhKVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuXG4gICAgICAgIGlmKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdClcbiAgICAgICAgcmVzdWx0LmZvckVhY2goKHNhbXBsZSkgPT4ge1xuICAgICAgICAgIGxldCBzYW1wbGVEYXRhID0gZGF0YVtzYW1wbGUuaWRdXG4gICAgICAgICAgaWYodHlwZW9mIHNhbXBsZURhdGEgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgIGJ1ZmZlcjogc2FtcGxlLmJ1ZmZlclxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBzYW1wbGUuYnVmZmVyXG4gICAgICAgICAgfVxuICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHNhbXBsZS5pZFxuICAgICAgICAgIHRoaXMudXBkYXRlU2FtcGxlRGF0YShzYW1wbGVEYXRhKVxuICAgICAgICB9KVxuXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLypcbiAgICBAcGFyYW0gY29uZmlnIChvcHRpb25hbClcbiAgICAgIHtcbiAgICAgICAgbm90ZTogY2FuIGJlIG5vdGUgbmFtZSAoQzQpIG9yIG5vdGUgbnVtYmVyICg2MClcbiAgICAgICAgYnVmZmVyOiBBdWRpb0J1ZmZlclxuICAgICAgICBzdXN0YWluOiBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSwgLy8gb3B0aW9uYWwsIGluIG1pbGxpc1xuICAgICAgICByZWxlYXNlOiBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdLCAvLyBvcHRpb25hbFxuICAgICAgICBwYW46IHBhblBvc2l0aW9uIC8vIG9wdGlvbmFsXG4gICAgICAgIHZlbG9jaXR5OiBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdIC8vIG9wdGlvbmFsLCBmb3IgbXVsdGktbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgfVxuICAqL1xuICB1cGRhdGVTYW1wbGVEYXRhKC4uLmRhdGEpe1xuICAgIGRhdGEuZm9yRWFjaChub3RlRGF0YSA9PiB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKG5vdGVEYXRhKSlcbiAgfVxuXG4gIF91cGRhdGVTYW1wbGVEYXRhKGRhdGEgPSB7fSl7XG4gICAgbGV0IHtcbiAgICAgIG5vdGUsXG4gICAgICBidWZmZXIgPSBudWxsLFxuICAgICAgc3VzdGFpbiA9IFtudWxsLCBudWxsXSxcbiAgICAgIHJlbGVhc2UgPSBbbnVsbCwgJ2xpbmVhciddLFxuICAgICAgcGFuID0gbnVsbCxcbiAgICAgIHZlbG9jaXR5ID0gWzAsIDEyN10sXG4gICAgfSA9IGRhdGFcblxuICAgIGlmKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbm90ZW51bWJlciBvciBhIG5vdGVuYW1lJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGdldCBub3RlbnVtYmVyIGZyb20gbm90ZW5hbWUgYW5kIGNoZWNrIGlmIHRoZSBub3RlbnVtYmVyIGlzIHZhbGlkXG4gICAgbGV0IG4gPSBjcmVhdGVOb3RlKG5vdGUpXG4gICAgaWYobiA9PT0gZmFsc2Upe1xuICAgICAgY29uc29sZS53YXJuKCdub3QgYSB2YWxpZCBub3RlIGlkJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBub3RlID0gbi5udW1iZXJcblxuICAgIGxldCBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSA9IHN1c3RhaW5cbiAgICBsZXQgW3JlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlXSA9IHJlbGVhc2VcbiAgICBsZXQgW3ZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kXSA9IHZlbG9jaXR5XG5cbiAgICBpZihzdXN0YWluLmxlbmd0aCAhPT0gMil7XG4gICAgICBzdXN0YWluU3RhcnQgPSBzdXN0YWluRW5kID0gbnVsbFxuICAgIH1cblxuICAgIGlmKHJlbGVhc2VEdXJhdGlvbiA9PT0gbnVsbCl7XG4gICAgICByZWxlYXNlRW52ZWxvcGUgPSBudWxsXG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2cobm90ZUlkLCBidWZmZXIpO1xuICAgIC8vIGNvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZCk7XG4gICAgLy8gY29uc29sZS5sb2cocmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUpO1xuICAgIC8vIGNvbnNvbGUubG9nKHBhbik7XG4gICAgLy8gY29uc29sZS5sb2codmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmQpO1xuXG5cbiAgICB0aGlzLnNhbXBsZXNEYXRhW25vdGVdLmZvckVhY2goKHNhbXBsZURhdGEsIGkpID0+IHtcbiAgICAgIGlmKGkgPj0gdmVsb2NpdHlTdGFydCAmJiBpIDwgdmVsb2NpdHlFbmQpe1xuICAgICAgICBpZihzYW1wbGVEYXRhID09PSAtMSl7XG4gICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgIGlkOiBub3RlXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBidWZmZXIgfHwgc2FtcGxlRGF0YS5idWZmZXJcbiAgICAgICAgc2FtcGxlRGF0YS5zdXN0YWluU3RhcnQgPSBzdXN0YWluU3RhcnQgfHwgc2FtcGxlRGF0YS5zdXN0YWluU3RhcnRcbiAgICAgICAgc2FtcGxlRGF0YS5zdXN0YWluRW5kID0gc3VzdGFpbkVuZCB8fCBzYW1wbGVEYXRhLnN1c3RhaW5FbmRcbiAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb24gPSByZWxlYXNlRHVyYXRpb24gfHwgc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb25cbiAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSByZWxlYXNlRW52ZWxvcGUgfHwgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVcbiAgICAgICAgc2FtcGxlRGF0YS5wYW4gPSBwYW4gfHwgc2FtcGxlRGF0YS5wYW5cblxuICAgICAgICBpZih0eXBlU3RyaW5nKHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlKSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVBcnJheSA9IHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlXG4gICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSAnYXJyYXknXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGRlbGV0ZSBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZUFycmF5XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zYW1wbGVzRGF0YVtub3RlXVtpXSA9IHNhbXBsZURhdGFcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vY29uc29sZS5sb2coJyVPJywgdGhpcy5zYW1wbGVzRGF0YVtub3RlXSk7XG4gIH1cblxuXG4gIC8vIHN0ZXJlbyBzcHJlYWRcbiAgc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKXtcbiAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICB9XG5cbiAgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcbiAgfVxuXG4gIC8qXG4gICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAqL1xuICBzZXRSZWxlYXNlKGR1cmF0aW9uOiBudW1iZXIsIGVudmVsb3BlKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBmb3IgYWxsIGtleXMsIG92ZXJydWxlcyB2YWx1ZXMgc2V0IGJ5IHNldEtleVNjYWxpbmdSZWxlYXNlKClcbiAgICB0aGlzLnNhbXBsZXNEYXRhLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlcywgaSl7XG4gICAgICBzYW1wbGVzLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlKXtcbiAgICAgICAgaWYoc2FtcGxlID09PSAtMSl7XG4gICAgICAgICAgc2FtcGxlID0ge1xuICAgICAgICAgICAgaWQ6IGlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2FtcGxlLnJlbGVhc2VEdXJhdGlvbiA9IGR1cmF0aW9uXG4gICAgICAgIHNhbXBsZS5yZWxlYXNlRW52ZWxvcGUgPSBlbnZlbG9wZVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgaWYodGhpcy5zdXN0YWluUGVkYWxEb3duID09PSB0cnVlKXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgZGF0YTogJ3VwJ1xuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcblxuICAgIE9iamVjdC5rZXlzKHRoaXMuc2NoZWR1bGVkU2FtcGxlcykuZm9yRWFjaCgoc2FtcGxlSWQpID0+IHtcbiAgICAgIC8vY29uc29sZS5sb2coJyAgc3RvcHBpbmcnLCBzYW1wbGVJZCwgdGhpcy5pZClcbiAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tzYW1wbGVJZF0uc3RvcCgpXG4gICAgfSlcbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSB7fVxuXG4gICAgLy9jb25zb2xlLmxvZygnYWxsTm90ZXNPZmYnLCB0aGlzLnN1c3RhaW5lZFNhbXBsZXMubGVuZ3RoLCB0aGlzLnNjaGVkdWxlZFNhbXBsZXMpXG4gIH1cbn1cbiIsImltcG9ydCB7VHJhY2t9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7cGFyc2VFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7Y2hlY2tNSURJTnVtYmVyfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2NhbGN1bGF0ZVBvc2l0aW9ufSBmcm9tICcuL3Bvc2l0aW9uJ1xuaW1wb3J0IHtJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5pbXBvcnQge2dldEluaXREYXRhfSBmcm9tICcuL2luaXRfYXVkaW8nXG5cblxubGV0XG4gIG1ldGhvZE1hcCA9IG5ldyBNYXAoW1xuICAgIFsndm9sdW1lJywgJ3NldFZvbHVtZSddLFxuICAgIFsnaW5zdHJ1bWVudCcsICdzZXRJbnN0cnVtZW50J10sXG4gICAgWydub3RlTnVtYmVyQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2snXSxcbiAgICBbJ25vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2snLCAnc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljayddLFxuICAgIFsndmVsb2NpdHlBY2NlbnRlZFRpY2snLCAnc2V0VmVsb2NpdHlBY2NlbnRlZFRpY2snXSxcbiAgICBbJ3ZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrJywgJ3NldFZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTGVuZ3RoQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVMZW5ndGhBY2NlbnRlZFRpY2snXSxcbiAgICBbJ25vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snLCAnc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayddXG4gIF0pO1xuXG5leHBvcnQgY2xhc3MgTWV0cm9ub21le1xuXG4gIGNvbnN0cnVjdG9yKHNvbmcpe1xuICAgIHRoaXMuc29uZyA9IHNvbmdcbiAgICB0aGlzLnRyYWNrID0gbmV3IFRyYWNrKHRoaXMuc29uZy5pZCArICdfbWV0cm9ub21lJylcbiAgICB0aGlzLnBhcnQgPSBuZXcgUGFydCgpXG4gICAgdGhpcy50cmFjay5hZGRQYXJ0cyh0aGlzLnBhcnQpXG4gICAgdGhpcy50cmFjay5jb25uZWN0KHRoaXMuc29uZy5fb3V0cHV0KVxuXG4gICAgdGhpcy5ldmVudHMgPSBbXVxuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSBbXVxuICAgIHRoaXMucHJlY291bnREdXJhdGlvbiA9IDBcbiAgICB0aGlzLmJhcnMgPSAwXG4gICAgdGhpcy5pbmRleCA9IDBcbiAgICB0aGlzLnByZWNvdW50SW5kZXggPSAwXG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cblxuICByZXNldCgpe1xuXG4gICAgbGV0IGRhdGEgPSBnZXRJbml0RGF0YSgpXG4gICAgbGV0IGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudCgnbWV0cm9ub21lJylcbiAgICBpbnN0cnVtZW50LnVwZGF0ZVNhbXBsZURhdGEoe1xuICAgICAgbm90ZTogNjAsXG4gICAgICBidWZmZXI6IGRhdGEubG93dGljayxcbiAgICB9LCB7XG4gICAgICBub3RlOiA2MSxcbiAgICAgIGJ1ZmZlcjogZGF0YS5oaWdodGljayxcbiAgICB9KVxuICAgIHRoaXMudHJhY2suc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KVxuXG4gICAgdGhpcy52b2x1bWUgPSAxXG5cbiAgICB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA9IDYxXG4gICAgdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWQgPSA2MFxuXG4gICAgdGhpcy52ZWxvY2l0eUFjY2VudGVkID0gMTAwXG4gICAgdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkID0gMTAwXG5cbiAgICB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA9IHRoaXMuc29uZy5wcHEgLyA0IC8vIHNpeHRlZW50aCBub3RlcyAtPiBkb24ndCBtYWtlIHRoaXMgdG9vIHNob3J0IGlmIHlvdXIgc2FtcGxlIGhhcyBhIGxvbmcgYXR0YWNrIVxuICAgIHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkID0gdGhpcy5zb25nLnBwcSAvIDRcbiAgfVxuXG4gIGNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZCA9ICdpbml0Jyl7XG4gICAgbGV0IGksIGpcbiAgICBsZXQgcG9zaXRpb25cbiAgICBsZXQgdmVsb2NpdHlcbiAgICBsZXQgbm90ZUxlbmd0aFxuICAgIGxldCBub3RlTnVtYmVyXG4gICAgbGV0IGJlYXRzUGVyQmFyXG4gICAgbGV0IHRpY2tzUGVyQmVhdFxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgbm90ZU9uLCBub3RlT2ZmXG4gICAgbGV0IGV2ZW50cyA9IFtdXG5cbiAgICAvL2NvbnNvbGUubG9nKHN0YXJ0QmFyLCBlbmRCYXIpO1xuXG4gICAgZm9yKGkgPSBzdGFydEJhcjsgaSA8PSBlbmRCYXI7IGkrKyl7XG4gICAgICBwb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgICAgdGFyZ2V0OiBbaV0sXG4gICAgICB9KVxuXG4gICAgICBiZWF0c1BlckJhciA9IHBvc2l0aW9uLm5vbWluYXRvclxuICAgICAgdGlja3NQZXJCZWF0ID0gcG9zaXRpb24udGlja3NQZXJCZWF0XG5cbiAgICAgIGZvcihqID0gMDsgaiA8IGJlYXRzUGVyQmFyOyBqKyspe1xuXG4gICAgICAgIG5vdGVOdW1iZXIgPSBqID09PSAwID8gdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgOiB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZFxuICAgICAgICBub3RlTGVuZ3RoID0gaiA9PT0gMCA/IHRoaXMubm90ZUxlbmd0aEFjY2VudGVkIDogdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWRcbiAgICAgICAgdmVsb2NpdHkgPSBqID09PSAwID8gdGhpcy52ZWxvY2l0eUFjY2VudGVkIDogdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkXG5cbiAgICAgICAgbm90ZU9uID0gbmV3IE1JRElFdmVudCh0aWNrcywgMTQ0LCBub3RlTnVtYmVyLCB2ZWxvY2l0eSlcbiAgICAgICAgbm90ZU9mZiA9IG5ldyBNSURJRXZlbnQodGlja3MgKyBub3RlTGVuZ3RoLCAxMjgsIG5vdGVOdW1iZXIsIDApXG5cbiAgICAgICAgaWYoaWQgPT09ICdwcmVjb3VudCcpe1xuICAgICAgICAgIG5vdGVPbi5fdHJhY2sgPSB0aGlzLnRyYWNrXG4gICAgICAgICAgbm90ZU9mZi5fdHJhY2sgPSB0aGlzLnRyYWNrXG4gICAgICAgICAgbm90ZU9uLl9wYXJ0ID0ge31cbiAgICAgICAgICBub3RlT2ZmLl9wYXJ0ID0ge31cbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50cy5wdXNoKG5vdGVPbiwgbm90ZU9mZilcbiAgICAgICAgdGlja3MgKz0gdGlja3NQZXJCZWF0XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2ZW50c1xuICB9XG5cblxuICBnZXRFdmVudHMoc3RhcnRCYXIgPSAxLCBlbmRCYXIgPSB0aGlzLnNvbmcuYmFycywgaWQgPSAnaW5pdCcpe1xuICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcy5wYXJ0LmdldEV2ZW50cygpKVxuICAgIHRoaXMuZXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgaWQpXG4gICAgdGhpcy5wYXJ0LmFkZEV2ZW50cyguLi50aGlzLmV2ZW50cylcbiAgICB0aGlzLmJhcnMgPSB0aGlzLnNvbmcuYmFyc1xuICAgIC8vY29uc29sZS5sb2coJ2dldEV2ZW50cyAlTycsIHRoaXMuZXZlbnRzKVxuICAgIHJldHVybiB0aGlzLmV2ZW50c1xuICB9XG5cblxuICBjcmVhdGVQcmVjb3VudEV2ZW50cyhwcmVjb3VudCwgdGltZVN0YW1wKXtcbiAgICBpZihwcmVjb3VudCA8PSAwKXtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cblxuICAgIHRoaXMudGltZVN0YW1wID0gdGltZVN0YW1wXG5cbi8vICAgbGV0IHNvbmdTdGFydFBvc2l0aW9uID0gdGhpcy5zb25nLmdldFBvc2l0aW9uKClcblxuICAgIGxldCBzb25nU3RhcnRQb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgdHlwZTogJ21pbGxpcycsXG4gICAgICB0YXJnZXQ6IHRoaXMuc29uZy5fY3VycmVudE1pbGxpcyxcbiAgICAgIHJlc3VsdDogJ2FsbCcsXG4gICAgfSlcblxuICAgIGxldCBlbmRQb3MgPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLnNvbmcsIHtcbiAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgdGFyZ2V0OiBbc29uZ1N0YXJ0UG9zaXRpb24uYmFyICsgcHJlY291bnRdLFxuICAgICAgcmVzdWx0OiAnYWxsJyxcbiAgICB9KVxuXG4gICAgLy9jb25zb2xlLmxvZyhzb25nU3RhcnRQb3NpdGlvbiwgZW5kUG9zKVxuXG4gICAgdGhpcy5wcmVjb3VudEluZGV4ID0gMFxuICAgIHRoaXMuc3RhcnRNaWxsaXMgPSBzb25nU3RhcnRQb3NpdGlvbi5taWxsaXNcbiAgICB0aGlzLmVuZE1pbGxpcyA9IGVuZFBvcy5taWxsaXNcbiAgICB0aGlzLnByZWNvdW50RHVyYXRpb24gPSBlbmRQb3MubWlsbGlzIC0gdGhpcy5zdGFydE1pbGxpc1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnByZWNvdW50RHVyYXRpb24pXG5cbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc29uZ1N0YXJ0UG9zaXRpb24uYmFyLCBlbmRQb3MuYmFyIC0gMSwgJ3ByZWNvdW50Jyk7XG4gICAgdGhpcy5wcmVjb3VudEV2ZW50cyA9IHBhcnNlRXZlbnRzKFsuLi50aGlzLnNvbmcuX3RpbWVFdmVudHMsIC4uLnRoaXMucHJlY291bnRFdmVudHNdKVxuXG4gICAgLy9jb25zb2xlLmxvZyhzb25nU3RhcnRQb3NpdGlvbi5iYXIsIGVuZFBvcy5iYXIsIHByZWNvdW50LCB0aGlzLnByZWNvdW50RXZlbnRzLmxlbmd0aCk7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnByZWNvdW50RXZlbnRzLCB0aGlzLnByZWNvdW50RHVyYXRpb24pO1xuICAgIHJldHVybiB0aGlzLnByZWNvdW50RHVyYXRpb25cbiAgfVxuXG5cbiAgLy8gY2FsbGVkIGJ5IHNjaGVkdWxlci5qc1xuICBnZXRQcmVjb3VudEV2ZW50cyhtYXh0aW1lKXtcbiAgICBsZXQgZXZlbnRzID0gdGhpcy5wcmVjb3VudEV2ZW50cyxcbiAgICAgIG1heGkgPSBldmVudHMubGVuZ3RoLCBpLCBldnQsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICAgIGZvcihpID0gdGhpcy5wcmVjb3VudEluZGV4OyBpIDwgbWF4aTsgaSsrKXtcbiAgICAgIGV2dCA9IGV2ZW50c1tpXTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCBtYXh0aW1lLCB0aGlzLm1pbGxpcyk7XG4gICAgICBpZihldnQubWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgIGV2dC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldnQubWlsbGlzXG4gICAgICAgIHJlc3VsdC5wdXNoKGV2dClcbiAgICAgICAgdGhpcy5wcmVjb3VudEluZGV4KytcbiAgICAgIH1lbHNle1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyhyZXN1bHQubGVuZ3RoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cblxuICBtdXRlKGZsYWcpe1xuICAgIHRoaXMudHJhY2subXV0ZWQgPSBmbGFnXG4gIH1cblxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy50cmFjay5faW5zdHJ1bWVudC5hbGxOb3Rlc09mZigpXG4gIH1cblxuXG4gIC8vID09PT09PT09PT09IENPTkZJR1VSQVRJT04gPT09PT09PT09PT1cblxuICB1cGRhdGVDb25maWcoKXtcbiAgICB0aGlzLmluaXQoMSwgdGhpcy5iYXJzLCAndXBkYXRlJyk7XG4gICAgdGhpcy5hbGxOb3Rlc09mZigpO1xuICAgIHRoaXMuc29uZy5fc2NoZWR1bGVyLnVwZGF0ZVNvbmcoKTtcbiAgfVxuXG4gIC8vIGFkZGVkIHRvIHB1YmxpYyBBUEk6IFNvbmcuY29uZmlndXJlTWV0cm9ub21lKHt9KVxuICBjb25maWd1cmUoY29uZmlnKXtcblxuICAgIE9iamVjdC5rZXlzKGNvbmZpZykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgdGhpc1ttZXRob2RNYXAuZ2V0KGtleSldKGNvbmZpZy5rZXkpO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KXtcbiAgICBpZighaW5zdHJ1bWVudCBpbnN0YW5jZW9mIEluc3RydW1lbnQpe1xuICAgICAgY29uc29sZS53YXJuKCdub3QgYW4gaW5zdGFuY2Ugb2YgSW5zdHJ1bWVudCcpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy50cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpXG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZUxlbmd0aEFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgaWYoaXNOYU4odmFsdWUpKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy5ub3RlTGVuZ3RoQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXROb3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICBpZihpc05hTih2YWx1ZSkpe1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldFZlbG9jaXR5QWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICB2YWx1ZSA9IGNoZWNrTUlESU51bWJlcih2YWx1ZSk7XG4gICAgaWYodmFsdWUgIT09IGZhbHNlKXtcbiAgICAgIHRoaXMudmVsb2NpdHlBY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZU51bWJlckFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXROb3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICB2YWx1ZSA9IGNoZWNrTUlESU51bWJlcih2YWx1ZSk7XG4gICAgaWYodmFsdWUgIT09IGZhbHNlKXtcbiAgICAgIHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldFZvbHVtZSh2YWx1ZSl7XG4gICAgdGhpcy50cmFjay5zZXRWb2x1bWUodmFsdWUpO1xuICB9XG59XG5cbiIsIi8vIEAgZmxvd1xuXG5sZXQgbWlkaUV2ZW50SW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBNSURJRXZlbnR7XG5cbiAgY29uc3RydWN0b3IodGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyID0gLTEpe1xuICAgIHRoaXMuaWQgPSBgTUVfJHttaWRpRXZlbnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLnRpY2tzID0gdGlja3NcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5kYXRhMSA9IGRhdGExXG4gICAgdGhpcy5kYXRhMiA9IGRhdGEyXG4gICAgdGhpcy5mcmVxdWVuY3kgPSA0NDAgKiBNYXRoLnBvdygyLCAoZGF0YTEgLSA2OSkgLyAxMilcblxuICAgIGlmKGRhdGExID09PSAxNDQgJiYgZGF0YTIgPT09IDApe1xuICAgICAgdGhpcy5kYXRhMSA9IDEyOFxuICAgIH1cblxuICAgIHRoaXMuX3BhcnQgPSBudWxsXG4gICAgdGhpcy5fdHJhY2sgPSBudWxsXG4gICAgdGhpcy5fc29uZyA9IG51bGxcbiAgICAvL0BUT0RPOiBhZGQgYWxsIG90aGVyIHByb3BlcnRpZXNcbiAgfVxuXG4gIGNvcHkoKXtcbiAgICBsZXQgbSA9IG5ldyBNSURJRXZlbnQodGhpcy50aWNrcywgdGhpcy50eXBlLCB0aGlzLmRhdGExLCB0aGlzLmRhdGEyKVxuICAgIHJldHVybiBtXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpeyAvLyBtYXkgYmUgYmV0dGVyIGlmIG5vdCBhIHB1YmxpYyBtZXRob2Q/XG4gICAgdGhpcy5kYXRhMSArPSBhbW91bnRcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IDQ0MCAqIE1hdGgucG93KDIsICh0aGlzLmRhdGExIC0gNjkpIC8gMTIpXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMudGlja3MgKz0gdGlja3NcbiAgICBpZih0aGlzLm1pZGlOb3RlKXtcbiAgICAgIHRoaXMubWlkaU5vdGUudXBkYXRlKClcbiAgICB9XG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcil7XG4gICAgdGhpcy50aWNrcyA9IHRpY2tzXG4gICAgaWYodGhpcy5taWRpTm90ZSl7XG4gICAgICB0aGlzLm1pZGlOb3RlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG59XG5cblxuLypcbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVNSURJRXZlbnQoZXZlbnQpe1xuICAvL2V2ZW50Lm5vdGUgPSBudWxsXG4gIGV2ZW50Lm5vdGUgPSBudWxsXG4gIGV2ZW50ID0gbnVsbFxufVxuKi9cbiIsImltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmxldCBtaWRpTm90ZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgTUlESU5vdGV7XG5cbiAgY29uc3RydWN0b3Iobm90ZW9uOiBNSURJRXZlbnQsIG5vdGVvZmY6IE1JRElFdmVudCl7XG4gICAgLy9pZihub3Rlb24udHlwZSAhPT0gMTQ0IHx8IG5vdGVvZmYudHlwZSAhPT0gMTI4KXtcbiAgICBpZihub3Rlb24udHlwZSAhPT0gMTQ0KXtcbiAgICAgIGNvbnNvbGUud2FybignY2Fubm90IGNyZWF0ZSBNSURJTm90ZScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5pZCA9IGBNTl8ke21pZGlOb3RlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5ub3RlT24gPSBub3Rlb25cbiAgICBub3Rlb24ubWlkaU5vdGUgPSB0aGlzXG4gICAgbm90ZW9uLm1pZGlOb3RlSWQgPSB0aGlzLmlkXG5cbiAgICBpZihub3Rlb2ZmIGluc3RhbmNlb2YgTUlESUV2ZW50KXtcbiAgICAgIHRoaXMubm90ZU9mZiA9IG5vdGVvZmZcbiAgICAgIG5vdGVvZmYubWlkaU5vdGUgPSB0aGlzXG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlSWQgPSB0aGlzLmlkXG4gICAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSBub3Rlb2ZmLnRpY2tzIC0gbm90ZW9uLnRpY2tzXG4gICAgICB0aGlzLmR1cmF0aW9uTWlsbGlzID0gLTFcbiAgICB9XG4gIH1cblxuICBhZGROb3RlT2ZmKG5vdGVvZmYpe1xuICAgIHRoaXMubm90ZU9mZiA9IG5vdGVvZmZcbiAgICBub3Rlb2ZmLm1pZGlOb3RlID0gdGhpc1xuICAgIG5vdGVvZmYubWlkaU5vdGVJZCA9IHRoaXMuaWRcbiAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSBub3Rlb2ZmLnRpY2tzIC0gdGhpcy5ub3RlT24udGlja3NcbiAgICB0aGlzLmR1cmF0aW9uTWlsbGlzID0gLTFcbiAgfVxuXG4gIGNvcHkoKXtcbiAgICByZXR1cm4gbmV3IE1JRElOb3RlKHRoaXMubm90ZU9uLmNvcHkoKSwgdGhpcy5ub3RlT2ZmLmNvcHkoKSlcbiAgfVxuXG4gIHVwZGF0ZSgpeyAvLyBtYXkgdXNlIGFub3RoZXIgbmFtZSBmb3IgdGhpcyBtZXRob2RcbiAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSB0aGlzLm5vdGVPZmYudGlja3MgLSB0aGlzLm5vdGVPbi50aWNrc1xuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKTogdm9pZHtcbiAgICB0aGlzLm5vdGVPbi50cmFuc3Bvc2UoYW1vdW50KVxuICAgIHRoaXMubm90ZU9mZi50cmFuc3Bvc2UoYW1vdW50KVxuICB9XG5cbiAgbW92ZSh0aWNrczogbnVtYmVyKTogdm9pZHtcbiAgICB0aGlzLm5vdGVPbi5tb3ZlKHRpY2tzKVxuICAgIHRoaXMubm90ZU9mZi5tb3ZlKHRpY2tzKVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLm1vdmVUbyh0aWNrcylcbiAgICB0aGlzLm5vdGVPZmYubW92ZVRvKHRpY2tzKVxuICB9XG5cbiAgdW5yZWdpc3Rlcigpe1xuICAgIGlmKHRoaXMucGFydCl7XG4gICAgICB0aGlzLnBhcnQucmVtb3ZlRXZlbnRzKHRoaXMpXG4gICAgICB0aGlzLnBhcnQgPSBudWxsXG4gICAgfVxuICAgIGlmKHRoaXMudHJhY2spe1xuICAgICAgdGhpcy50cmFjay5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMudHJhY2sgPSBudWxsXG4gICAgfVxuICAgIGlmKHRoaXMuc29uZyl7XG4gICAgICB0aGlzLnNvbmcucmVtb3ZlRXZlbnRzKHRoaXMpXG4gICAgICB0aGlzLnNvbmcgPSBudWxsXG4gICAgfVxuICB9XG59XG5cbiIsIi8qXG4gIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBieXRlcyB0aHJvdWdoIHNlcXVlbnRpYWwgcmVhZHNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiAgYWRhcHRlZCB0byB3b3JrIHdpdGggQXJyYXlCdWZmZXIgLT4gVWludDhBcnJheVxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElTdHJlYW17XG5cbiAgLy8gYnVmZmVyIGlzIFVpbnQ4QXJyYXlcbiAgY29uc3RydWN0b3IoYnVmZmVyKXtcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIC8qIHJlYWQgc3RyaW5nIG9yIGFueSBudW1iZXIgb2YgYnl0ZXMgKi9cbiAgcmVhZChsZW5ndGgsIHRvU3RyaW5nID0gdHJ1ZSkge1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICBpZih0b1N0cmluZyl7XG4gICAgICByZXN1bHQgPSAnJztcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0ICs9IGZjYyh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1lbHNle1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMzItYml0IGludGVnZXIgKi9cbiAgcmVhZEludDMyKCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgMjQpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV0gPDwgMTYpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDNdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDE2LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQxNigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGFuIDgtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDgoc2lnbmVkKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dO1xuICAgIGlmKHNpZ25lZCAmJiByZXN1bHQgPiAxMjcpe1xuICAgICAgcmVzdWx0IC09IDI1NjtcbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbiArPSAxO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBlb2YoKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPj0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICB9XG5cbiAgLyogcmVhZCBhIE1JREktc3R5bGUgbGV0aWFibGUtbGVuZ3RoIGludGVnZXJcbiAgICAoYmlnLWVuZGlhbiB2YWx1ZSBpbiBncm91cHMgb2YgNyBiaXRzLFxuICAgIHdpdGggdG9wIGJpdCBzZXQgdG8gc2lnbmlmeSB0aGF0IGFub3RoZXIgYnl0ZSBmb2xsb3dzKVxuICAqL1xuICByZWFkVmFySW50KCkge1xuICAgIGxldCByZXN1bHQgPSAwO1xuICAgIHdoaWxlKHRydWUpIHtcbiAgICAgIGxldCBiID0gdGhpcy5yZWFkSW50OCgpO1xuICAgICAgaWYgKGIgJiAweDgwKSB7XG4gICAgICAgIHJlc3VsdCArPSAoYiAmIDB4N2YpO1xuICAgICAgICByZXN1bHQgPDw9IDc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBiIGlzIHRoZSBsYXN0IGJ5dGUgKi9cbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIGI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIHNldFBvc2l0aW9uKHApe1xuICAgIHRoaXMucG9zaXRpb24gPSBwO1xuICB9XG59XG4iLCIvKlxuICBFeHRyYWN0cyBhbGwgbWlkaSBldmVudHMgZnJvbSBhIGJpbmFyeSBtaWRpIGZpbGUsIHVzZXMgbWlkaV9zdHJlYW0uanNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE1JRElTdHJlYW0gZnJvbSAnLi9taWRpX3N0cmVhbSc7XG5cbmxldFxuICBsYXN0RXZlbnRUeXBlQnl0ZSxcbiAgdHJhY2tOYW1lO1xuXG5cbmZ1bmN0aW9uIHJlYWRDaHVuayhzdHJlYW0pe1xuICBsZXQgaWQgPSBzdHJlYW0ucmVhZCg0LCB0cnVlKTtcbiAgbGV0IGxlbmd0aCA9IHN0cmVhbS5yZWFkSW50MzIoKTtcbiAgLy9jb25zb2xlLmxvZyhsZW5ndGgpO1xuICByZXR1cm57XG4gICAgJ2lkJzogaWQsXG4gICAgJ2xlbmd0aCc6IGxlbmd0aCxcbiAgICAnZGF0YSc6IHN0cmVhbS5yZWFkKGxlbmd0aCwgZmFsc2UpXG4gIH07XG59XG5cblxuZnVuY3Rpb24gcmVhZEV2ZW50KHN0cmVhbSl7XG4gIHZhciBldmVudCA9IHt9O1xuICB2YXIgbGVuZ3RoO1xuICBldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICBsZXQgZXZlbnRUeXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50VHlwZUJ5dGUsIGV2ZW50VHlwZUJ5dGUgJiAweDgwLCAxNDYgJiAweDBmKTtcbiAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweGYwKSA9PSAweGYwKXtcbiAgICAvKiBzeXN0ZW0gLyBtZXRhIGV2ZW50ICovXG4gICAgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGZmKXtcbiAgICAgIC8qIG1ldGEgZXZlbnQgKi9cbiAgICAgIGV2ZW50LnR5cGUgPSAnbWV0YSc7XG4gICAgICBsZXQgc3VidHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBzd2l0Y2goc3VidHlwZUJ5dGUpe1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNlcXVlbmNlTnVtYmVyIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1iZXIgPSBzdHJlYW0ucmVhZEludDE2KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvcHlyaWdodE5vdGljZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDM6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0cmFja05hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdpbnN0cnVtZW50TmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDU6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdseXJpY3MnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA2OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWFya2VyJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2N1ZVBvaW50JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21pZGlDaGFubmVsUHJlZml4JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDEpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgbWlkaUNoYW5uZWxQcmVmaXggZXZlbnQgaXMgMSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmNoYW5uZWwgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2VuZE9mVHJhY2snO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NldFRlbXBvJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDMpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2V0VGVtcG8gZXZlbnQgaXMgMywgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQgPSAoXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgMTYpICtcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCA4KSArXG4gICAgICAgICAgICBzdHJlYW0ucmVhZEludDgoKVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzbXB0ZU9mZnNldCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA1KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNtcHRlT2Zmc2V0IGV2ZW50IGlzIDUsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgaG91ckJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZVJhdGUgPXtcbiAgICAgICAgICAgIDB4MDA6IDI0LCAweDIwOiAyNSwgMHg0MDogMjksIDB4NjA6IDMwXG4gICAgICAgICAgfVtob3VyQnl0ZSAmIDB4NjBdO1xuICAgICAgICAgIGV2ZW50LmhvdXIgPSBob3VyQnl0ZSAmIDB4MWY7XG4gICAgICAgICAgZXZlbnQubWluID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc2VjID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zdWJmcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU4OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGltZVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA0KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWVyYXRvciA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmRlbm9taW5hdG9yID0gTWF0aC5wb3coMiwgc3RyZWFtLnJlYWRJbnQ4KCkpO1xuICAgICAgICAgIGV2ZW50Lm1ldHJvbm9tZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnRoaXJ0eXNlY29uZHMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1OTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2tleVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQua2V5ID0gc3RyZWFtLnJlYWRJbnQ4KHRydWUpO1xuICAgICAgICAgIGV2ZW50LnNjYWxlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4N2Y6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZXJTcGVjaWZpYyc7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vaWYoc2VxdWVuY2VyLmRlYnVnID49IDIpe1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUud2FybignVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogJyArIHN1YnR5cGVCeXRlKTtcbiAgICAgICAgICAvL31cbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmMCl7XG4gICAgICBldmVudC50eXBlID0gJ3N5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4Zjcpe1xuICAgICAgZXZlbnQudHlwZSA9ICdkaXZpZGVkU3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogJyArIGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICB9ZWxzZXtcbiAgICAvKiBjaGFubmVsIGV2ZW50ICovXG4gICAgbGV0IHBhcmFtMTtcbiAgICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ODApID09PSAwKXtcbiAgICAgIC8qIHJ1bm5pbmcgc3RhdHVzIC0gcmV1c2UgbGFzdEV2ZW50VHlwZUJ5dGUgYXMgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgIGV2ZW50VHlwZUJ5dGUgaXMgYWN0dWFsbHkgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgKi9cbiAgICAgIC8vY29uc29sZS5sb2coJ3J1bm5pbmcgc3RhdHVzJyk7XG4gICAgICBwYXJhbTEgPSBldmVudFR5cGVCeXRlO1xuICAgICAgZXZlbnRUeXBlQnl0ZSA9IGxhc3RFdmVudFR5cGVCeXRlO1xuICAgIH1lbHNle1xuICAgICAgcGFyYW0xID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdsYXN0JywgZXZlbnRUeXBlQnl0ZSk7XG4gICAgICBsYXN0RXZlbnRUeXBlQnl0ZSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICAgIGxldCBldmVudFR5cGUgPSBldmVudFR5cGVCeXRlID4+IDQ7XG4gICAgZXZlbnQuY2hhbm5lbCA9IGV2ZW50VHlwZUJ5dGUgJiAweDBmO1xuICAgIGV2ZW50LnR5cGUgPSAnY2hhbm5lbCc7XG4gICAgc3dpdGNoIChldmVudFR5cGUpe1xuICAgICAgY2FzZSAweDA4OlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MDk6XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmKGV2ZW50LnZlbG9jaXR5ID09PSAwKXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBhOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYjpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb250cm9sbGVyJztcbiAgICAgICAgZXZlbnQuY29udHJvbGxlclR5cGUgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYzpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwcm9ncmFtQ2hhbmdlJztcbiAgICAgICAgZXZlbnQucHJvZ3JhbU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBkOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NoYW5uZWxBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gcGFyYW0xO1xuICAgICAgICAvL2lmKHRyYWNrTmFtZSA9PT0gJ1NILVMxLTQ0LUMwOSBMPVNNTCBJTj0zJyl7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCdjaGFubmVsIHByZXNzdXJlJywgdHJhY2tOYW1lLCBwYXJhbTEpO1xuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBlOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3BpdGNoQmVuZCc7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gcGFyYW0xICsgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDcpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvKlxuICAgICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgY29uc29sZS5sb2coJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuLypcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICBjb25zb2xlLmxvZygnd2VpcmRvJywgdHJhY2tOYW1lLCBwYXJhbTEsIGV2ZW50LnZlbG9jaXR5KTtcbiovXG5cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElGaWxlKGJ1ZmZlcil7XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPT09IGZhbHNlICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcignYnVmZmVyIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiBVaW50OEFycmF5IG9mIEFycmF5QnVmZmVyJylcbiAgICByZXR1cm5cbiAgfVxuICBpZihidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICB9XG4gIGxldCB0cmFja3MgPSBuZXcgTWFwKCk7XG4gIGxldCBzdHJlYW0gPSBuZXcgTUlESVN0cmVhbShidWZmZXIpO1xuXG4gIGxldCBoZWFkZXJDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICBpZihoZWFkZXJDaHVuay5pZCAhPT0gJ01UaGQnIHx8IGhlYWRlckNodW5rLmxlbmd0aCAhPT0gNil7XG4gICAgdGhyb3cgJ0JhZCAubWlkIGZpbGUgLSBoZWFkZXIgbm90IGZvdW5kJztcbiAgfVxuXG4gIGxldCBoZWFkZXJTdHJlYW0gPSBuZXcgTUlESVN0cmVhbShoZWFkZXJDaHVuay5kYXRhKTtcbiAgbGV0IGZvcm1hdFR5cGUgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0cmFja0NvdW50ID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG4gIGlmKHRpbWVEaXZpc2lvbiAmIDB4ODAwMCl7XG4gICAgdGhyb3cgJ0V4cHJlc3NpbmcgdGltZSBkaXZpc2lvbiBpbiBTTVRQRSBmcmFtZXMgaXMgbm90IHN1cHBvcnRlZCB5ZXQnO1xuICB9XG5cbiAgbGV0IGhlYWRlciA9e1xuICAgICdmb3JtYXRUeXBlJzogZm9ybWF0VHlwZSxcbiAgICAndHJhY2tDb3VudCc6IHRyYWNrQ291bnQsXG4gICAgJ3RpY2tzUGVyQmVhdCc6IHRpbWVEaXZpc2lvblxuICB9O1xuXG4gIGZvcihsZXQgaSA9IDA7IGkgPCB0cmFja0NvdW50OyBpKyspe1xuICAgIHRyYWNrTmFtZSA9ICd0cmFja18nICsgaTtcbiAgICBsZXQgdHJhY2sgPSBbXTtcbiAgICBsZXQgdHJhY2tDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICAgIGlmKHRyYWNrQ2h1bmsuaWQgIT09ICdNVHJrJyl7XG4gICAgICB0aHJvdyAnVW5leHBlY3RlZCBjaHVuayAtIGV4cGVjdGVkIE1UcmssIGdvdCAnKyB0cmFja0NodW5rLmlkO1xuICAgIH1cbiAgICBsZXQgdHJhY2tTdHJlYW0gPSBuZXcgTUlESVN0cmVhbSh0cmFja0NodW5rLmRhdGEpO1xuICAgIHdoaWxlKCF0cmFja1N0cmVhbS5lb2YoKSl7XG4gICAgICBsZXQgZXZlbnQgPSByZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuICAgICAgdHJhY2sucHVzaChldmVudCk7XG4gICAgfVxuICAgIHRyYWNrcy5zZXQodHJhY2tOYW1lLCB0cmFjayk7XG4gIH1cblxuICByZXR1cm57XG4gICAgJ2hlYWRlcic6IGhlYWRlcixcbiAgICAndHJhY2tzJzogdHJhY2tzXG4gIH07XG59IiwiLypcbiAgQWRkcyBhIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5vdGUgb2JqZWN0IHRoYXQgY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgYSBtdXNpY2FsIG5vdGU6XG4gICAgLSBuYW1lLCBlLmcuICdDJ1xuICAgIC0gb2N0YXZlLCAgLTEgLSA5XG4gICAgLSBmdWxsTmFtZTogJ0MxJ1xuICAgIC0gZnJlcXVlbmN5OiAyMzQuMTYsIGJhc2VkIG9uIHRoZSBiYXNpYyBwaXRjaFxuICAgIC0gbnVtYmVyOiA2MCBtaWRpIG5vdGUgbnVtYmVyXG5cbiAgQWRkcyBzZXZlcmFsIHV0aWxpdHkgbWV0aG9kcyBvcmdhbmlzZWQgYXJvdW5kIHRoZSBub3RlIG9iamVjdFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge3R5cGVTdHJpbmd9IGZyb20gJy4vdXRpbCc7XG5cbmxldFxuICBlcnJvck1zZyxcbiAgd2FybmluZ01zZyxcbiAgcG93ID0gTWF0aC5wb3csXG4gIGZsb29yID0gTWF0aC5mbG9vcjtcblxuY29uc3Qgbm90ZU5hbWVzID0ge1xuICAnc2hhcnAnIDogWydDJywgJ0MjJywgJ0QnLCAnRCMnLCAnRScsICdGJywgJ0YjJywgJ0cnLCAnRyMnLCAnQScsICdBIycsICdCJ10sXG4gICdmbGF0JyA6IFsnQycsICdEYicsICdEJywgJ0ViJywgJ0UnLCAnRicsICdHYicsICdHJywgJ0FiJywgJ0EnLCAnQmInLCAnQiddLFxuICAnZW5oYXJtb25pYy1zaGFycCcgOiBbJ0IjJywgJ0MjJywgJ0MjIycsICdEIycsICdEIyMnLCAnRSMnLCAnRiMnLCAnRiMjJywgJ0cjJywgJ0cjIycsICdBIycsICdBIyMnXSxcbiAgJ2VuaGFybW9uaWMtZmxhdCcgOiBbJ0RiYicsICdEYicsICdFYmInLCAnRWInLCAnRmInLCAnR2JiJywgJ0diJywgJ0FiYicsICdBYicsICdCYmInLCAnQmInLCAnQ2InXVxufTtcblxuXG4vKlxuICBhcmd1bWVudHNcbiAgLSBub3RlTnVtYmVyOiA2MFxuICAtIG5vdGVOdW1iZXIgYW5kIG5vdGVuYW1lIG1vZGU6IDYwLCAnc2hhcnAnXG4gIC0gbm90ZU5hbWU6ICdDIzQnXG4gIC0gbmFtZSBhbmQgb2N0YXZlOiAnQyMnLCA0XG4gIC0gbm90ZSBuYW1lLCBvY3RhdmUsIG5vdGUgbmFtZSBtb2RlOiAnRCcsIDQsICdzaGFycCdcbiAgLSBkYXRhIG9iamVjdDpcbiAgICB7XG4gICAgICBuYW1lOiAnQycsXG4gICAgICBvY3RhdmU6IDRcbiAgICB9XG4gICAgb3JcbiAgICB7XG4gICAgICBmcmVxdWVuY3k6IDIzNC4xNlxuICAgIH1cbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOb3RlKC4uLmFyZ3Mpe1xuICBsZXRcbiAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgZGF0YSxcbiAgICBvY3RhdmUsXG4gICAgbm90ZU5hbWUsXG4gICAgbm90ZU51bWJlcixcbiAgICBub3RlTmFtZU1vZGUsXG4gICAgYXJnMCA9IGFyZ3NbMF0sXG4gICAgYXJnMSA9IGFyZ3NbMV0sXG4gICAgYXJnMiA9IGFyZ3NbMl0sXG4gICAgdHlwZTAgPSB0eXBlU3RyaW5nKGFyZzApLFxuICAgIHR5cGUxID0gdHlwZVN0cmluZyhhcmcxKSxcbiAgICB0eXBlMiA9IHR5cGVTdHJpbmcoYXJnMik7XG5cbiAgZXJyb3JNc2cgPSAnJztcbiAgd2FybmluZ01zZyA9ICcnO1xuXG4gIC8vIGFyZ3VtZW50OiBub3RlIG51bWJlclxuICAvL2NvbnNvbGUubG9nKG51bUFyZ3MsIHR5cGUwKVxuICBpZihudW1BcmdzID09PSAxICYmIHR5cGUwID09PSAnbnVtYmVyJyl7XG4gICAgaWYoYXJnMCA8IDAgfHwgYXJnMCA+IDEyNyl7XG4gICAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgbnVtYmVyID49IDAgYW5kIDw9IDEyNyAnICsgIGFyZzA7XG4gICAgfWVsc2V7XG4gICAgICBub3RlTnVtYmVyID0gYXJnMDtcbiAgICAgIGRhdGEgPSBfZ2V0Tm90ZU5hbWUobm90ZU51bWJlcik7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgIH1cblxuXG4gIC8vIGFyZ3VtZW50czogZnVsbCBub3RlIG5hbWVcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMSAmJiB0eXBlMCA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cbiAgLy8gYXJndW1lbnRzOiBub3RlIG5hbWUsIG9jdGF2ZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ251bWJlcicpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwLCBhcmcxKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cbiAgLy8gYXJndW1lbnRzOiBmdWxsIG5vdGUgbmFtZSwgbm90ZSBuYW1lIG1vZGUgLT4gZm9yIGNvbnZlcnRpbmcgYmV0d2VlbiBub3RlIG5hbWUgbW9kZXNcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMiAmJiB0eXBlMCA9PT0gJ3N0cmluZycgJiYgdHlwZTEgPT09ICdzdHJpbmcnKXtcbiAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCk7XG4gICAgaWYoZXJyb3JNc2cgPT09ICcnKXtcbiAgICAgIG5vdGVOYW1lTW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShhcmcxKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsIG9jdGF2ZSk7XG4gICAgfVxuXG5cbiAgLy8gYXJndW1lbnRzOiBub3RlIG51bWJlciwgbm90ZSBuYW1lIG1vZGVcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMiAmJiB0eXBlU3RyaW5nKGFyZzApID09PSAnbnVtYmVyJyAmJiB0eXBlU3RyaW5nKGFyZzEpID09PSAnc3RyaW5nJyl7XG4gICAgaWYoYXJnMCA8IDAgfHwgYXJnMCA+IDEyNyl7XG4gICAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgbnVtYmVyID49IDAgYW5kIDw9IDEyNyAnICsgYXJnMDtcbiAgICB9ZWxzZXtcbiAgICAgIG5vdGVOYW1lTW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShhcmcxKTtcbiAgICAgIG5vdGVOdW1iZXIgPSBhcmcwO1xuICAgICAgZGF0YSA9IF9nZXROb3RlTmFtZShub3RlTnVtYmVyLCBub3RlTmFtZU1vZGUpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICB9XG5cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbmFtZSwgb2N0YXZlLCBub3RlIG5hbWUgbW9kZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAzICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ251bWJlcicgJiYgdHlwZTIgPT09ICdzdHJpbmcnKXtcbiAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCwgYXJnMSk7XG4gICAgaWYoZXJyb3JNc2cgPT09ICcnKXtcbiAgICAgIG5vdGVOYW1lTW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShhcmcyKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsb2N0YXZlKTtcbiAgICB9XG5cbiAgfWVsc2V7XG4gICAgZXJyb3JNc2cgPSAnd3JvbmcgYXJndW1lbnRzLCBwbGVhc2UgY29uc3VsdCBkb2N1bWVudGF0aW9uJztcbiAgfVxuXG4gIGlmKGVycm9yTXNnKXtcbiAgICBjb25zb2xlLmVycm9yKGVycm9yTXNnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZih3YXJuaW5nTXNnKXtcbiAgICBjb25zb2xlLndhcm4od2FybmluZ01zZyk7XG4gIH1cblxuICBsZXQgbm90ZSA9IHtcbiAgICBuYW1lOiBub3RlTmFtZSxcbiAgICBvY3RhdmU6IG9jdGF2ZSxcbiAgICBmdWxsTmFtZTogbm90ZU5hbWUgKyBvY3RhdmUsXG4gICAgbnVtYmVyOiBub3RlTnVtYmVyLFxuICAgIGZyZXF1ZW5jeTogX2dldEZyZXF1ZW5jeShub3RlTnVtYmVyKSxcbiAgICBibGFja0tleTogX2lzQmxhY2tLZXkobm90ZU51bWJlcilcbiAgfVxuICBPYmplY3QuZnJlZXplKG5vdGUpO1xuICByZXR1cm4gbm90ZTtcbn1cblxuXG4vL2Z1bmN0aW9uIF9nZXROb3RlTmFtZShudW1iZXIsIG1vZGUgPSBjb25maWcuZ2V0KCdub3RlTmFtZU1vZGUnKSkge1xuZnVuY3Rpb24gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSA9ICdzaGFycCcpIHtcbiAgLy9sZXQgb2N0YXZlID0gTWF0aC5mbG9vcigobnVtYmVyIC8gMTIpIC0gMiksIC8vIOKGkiBpbiBDdWJhc2UgY2VudHJhbCBDID0gQzMgaW5zdGVhZCBvZiBDNFxuICBsZXQgb2N0YXZlID0gZmxvb3IoKG51bWJlciAvIDEyKSAtIDEpO1xuICBsZXQgbm90ZU5hbWUgPSBub3RlTmFtZXNbbW9kZV1bbnVtYmVyICUgMTJdO1xuICByZXR1cm4gW25vdGVOYW1lLCBvY3RhdmVdO1xufVxuXG5cbmZ1bmN0aW9uIF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSkge1xuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIGxldCBpbmRleDtcblxuICBmb3IobGV0IGtleSBvZiBrZXlzKXtcbiAgICBsZXQgbW9kZSA9IG5vdGVOYW1lc1trZXldO1xuICAgIGluZGV4ID0gbW9kZS5maW5kSW5kZXgoeCA9PiB4ID09PSBuYW1lKTtcbiAgICBpZihpbmRleCAhPT0gLTEpe1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy9udW1iZXIgPSAoaW5kZXggKyAxMikgKyAob2N0YXZlICogMTIpICsgMTI7IC8vIOKGkiBpbiBDdWJhc2UgY2VudHJhbCBDID0gQzMgaW5zdGVhZCBvZiBDNFxuICBsZXQgbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKTsvLyDihpIgbWlkaSBzdGFuZGFyZCArIHNjaWVudGlmaWMgbmFtaW5nLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWlkZGxlX0MgYW5kIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU2NpZW50aWZpY19waXRjaF9ub3RhdGlvblxuXG4gIGlmKG51bWJlciA8IDAgfHwgbnVtYmVyID4gMTI3KXtcbiAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgYmV0d2VlbiBDMCBhbmQgRzEwJztcbiAgICByZXR1cm47XG4gIH1cbiAgcmV0dXJuIG51bWJlcjtcbn1cblxuXG5mdW5jdGlvbiBfZ2V0RnJlcXVlbmN5KG51bWJlcil7XG4gIC8vcmV0dXJuIGNvbmZpZy5nZXQoJ3BpdGNoJykgKiBwb3coMiwobnVtYmVyIC0gNjkpLzEyKTsgLy8gbWlkaSBzdGFuZGFyZCwgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01JRElfVHVuaW5nX1N0YW5kYXJkXG4gIHJldHVybiA0NDAgKiBwb3coMiwobnVtYmVyIC0gNjkpLzEyKTsgLy8gbWlkaSBzdGFuZGFyZCwgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01JRElfVHVuaW5nX1N0YW5kYXJkXG59XG5cblxuLy8gVE9ETzogY2FsY3VsYXRlIG5vdGUgZnJvbSBmcmVxdWVuY3lcbmZ1bmN0aW9uIF9nZXRQaXRjaChoZXJ0eil7XG4gIC8vZm0gID0gIDIobeKIkjY5KS8xMig0NDAgSHopLlxufVxuXG5cbmZ1bmN0aW9uIF9jaGVja05vdGVOYW1lTW9kZShtb2RlKXtcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgcmVzdWx0ID0ga2V5cy5maW5kKHggPT4geCA9PT0gbW9kZSkgIT09IHVuZGVmaW5lZDtcbiAgaWYocmVzdWx0ID09PSBmYWxzZSl7XG4gICAgLy9tb2RlID0gY29uZmlnLmdldCgnbm90ZU5hbWVNb2RlJyk7XG4gICAgbW9kZSA9ICdzaGFycCc7XG4gICAgd2FybmluZ01zZyA9IG1vZGUgKyAnIGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSBtb2RlLCB1c2luZyBcIicgKyBtb2RlICsgJ1wiIGluc3RlYWQnO1xuICB9XG4gIHJldHVybiBtb2RlO1xufVxuXG5cbmZ1bmN0aW9uIF9jaGVja05vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXRcbiAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgYXJnMCA9IGFyZ3NbMF0sXG4gICAgYXJnMSA9IGFyZ3NbMV0sXG4gICAgY2hhcixcbiAgICBuYW1lID0gJycsXG4gICAgb2N0YXZlID0gJyc7XG5cbiAgLy8gZXh0cmFjdCBvY3RhdmUgZnJvbSBub3RlIG5hbWVcbiAgaWYobnVtQXJncyA9PT0gMSl7XG4gICAgZm9yKGNoYXIgb2YgYXJnMCl7XG4gICAgICBpZihpc05hTihjaGFyKSAmJiBjaGFyICE9PSAnLScpe1xuICAgICAgICBuYW1lICs9IGNoYXI7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgb2N0YXZlICs9IGNoYXI7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKG9jdGF2ZSA9PT0gJycpe1xuICAgICAgb2N0YXZlID0gMDtcbiAgICB9XG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIpe1xuICAgIG5hbWUgPSBhcmcwO1xuICAgIG9jdGF2ZSA9IGFyZzE7XG4gIH1cblxuICAvLyBjaGVjayBpZiBub3RlIG5hbWUgaXMgdmFsaWRcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgaW5kZXggPSAtMTtcblxuICBmb3IobGV0IGtleSBvZiBrZXlzKXtcbiAgICBsZXQgbW9kZSA9IG5vdGVOYW1lc1trZXldO1xuICAgIGluZGV4ID0gbW9kZS5maW5kSW5kZXgoeCA9PiB4ID09PSBuYW1lKTtcbiAgICBpZihpbmRleCAhPT0gLTEpe1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYoaW5kZXggPT09IC0xKXtcbiAgICBlcnJvck1zZyA9IGFyZzAgKyAnIGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSwgcGxlYXNlIHVzZSBsZXR0ZXJzIEEgLSBHIGFuZCBpZiBuZWNlc3NhcnkgYW4gYWNjaWRlbnRhbCBsaWtlICMsICMjLCBiIG9yIGJiLCBmb2xsb3dlZCBieSBhIG51bWJlciBmb3IgdGhlIG9jdGF2ZSc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYob2N0YXZlIDwgLTEgfHwgb2N0YXZlID4gOSl7XG4gICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYW4gb2N0YXZlIGJldHdlZW4gLTEgYW5kIDknO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG9jdGF2ZSA9IHBhcnNlSW50KG9jdGF2ZSwgMTApO1xuICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMCwgMSkudG9VcHBlckNhc2UoKSArIG5hbWUuc3Vic3RyaW5nKDEpO1xuXG4gIC8vY29uc29sZS5sb2cobmFtZSwnfCcsb2N0YXZlKTtcbiAgcmV0dXJuIFtuYW1lLCBvY3RhdmVdO1xufVxuXG5cblxuZnVuY3Rpb24gX2lzQmxhY2tLZXkobm90ZU51bWJlcil7XG4gIGxldCBibGFjaztcblxuICBzd2l0Y2godHJ1ZSl7XG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDE6Ly9DI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAzOi8vRCNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gNjovL0YjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDg6Ly9HI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxMDovL0EjXG4gICAgICBibGFjayA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYmxhY2sgPSBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBibGFjaztcbn1cblxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVOdW1iZXIoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUubnVtYmVyO1xuICB9XG4gIHJldHVybiBlcnJvck1zZztcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZU5hbWUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUubmFtZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVPY3RhdmUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUub2N0YXZlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnVsbE5vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmZ1bGxOYW1lO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnJlcXVlbmN5KC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmZyZXF1ZW5jeTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQmxhY2tLZXkoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUuYmxhY2tLZXk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuIiwiaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge3R5cGVTdHJpbmcsIGNoZWNrSWZCYXNlNjQsIGJhc2U2NFRvQmluYXJ5fSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcblxuXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU2FtcGxlKHNhbXBsZSwgaWQsIGV2ZXJ5KXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIHRyeXtcbiAgICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSxcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MoYnVmZmVyKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBidWZmZXIpO1xuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWQsIGJ1ZmZlcn0pXG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KHtpZCwgYnVmZmVyfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoYnVmZmVyKTtcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25FcnJvcihlKXtcbiAgICAgICAgICBjb25zb2xlKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSk7XG4gICAgICAgICAgLy9yZWplY3QoZSk7IC8vIGRvbid0IHVzZSByZWplY3QgYmVjYXVzZSB3ZSB1c2UgdGhpcyBhcyBhIG5lc3RlZCBwcm9taXNlIGFuZCB3ZSBkb24ndCB3YW50IHRoZSBwYXJlbnQgcHJvbWlzZSB0byByZWplY3RcbiAgICAgICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKVxuICAgIH1jYXRjaChlKXtcbiAgICAgIGNvbnNvbGUud2FybignZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpXG4gICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cblxuXG5mdW5jdGlvbiBsb2FkQW5kUGFyc2VTYW1wbGUodXJsLCBpZCwgZXZlcnkpe1xuICAvL2NvbnNvbGUubG9nKGlkLCB1cmwpXG4gIGxldCBleGVjdXRvciA9IGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIGZldGNoKGVzY2FwZSh1cmwpLCB7XG4gICAgICBtZXRob2Q6ICdHRVQnXG4gICAgfSkudGhlbihcbiAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgaWYocmVzcG9uc2Uub2spe1xuICAgICAgICAgIHJlc3BvbnNlLmFycmF5QnVmZmVyKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZGF0YSlcbiAgICAgICAgICAgIGRlY29kZVNhbXBsZShkYXRhLCBpZCwgZXZlcnkpLnRoZW4ocmVzb2x2ZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9ZWxzZSBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICByZXNvbHZlKHtpZH0pXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgKVxuICB9XG4gIHJldHVybiBuZXcgUHJvbWlzZShleGVjdXRvcilcbn1cblxuXG5mdW5jdGlvbiBnZXRQcm9taXNlcyhwcm9taXNlcywgc2FtcGxlLCBrZXksIGV2ZXJ5KXtcblxuICBjb25zdCBnZXRTYW1wbGUgPSBmdW5jdGlvbigpe1xuXG4gICAgaWYoc2FtcGxlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe1xuICAgICAgcHJvbWlzZXMucHVzaChkZWNvZGVTYW1wbGUoc2FtcGxlLCBrZXksIGV2ZXJ5KSlcbiAgICB9ZWxzZSBpZih0eXBlb2Ygc2FtcGxlID09PSAnc3RyaW5nJyl7XG4gICAgICBpZihjaGVja0lmQmFzZTY0KHNhbXBsZSkpe1xuICAgICAgICBwcm9taXNlcy5wdXNoKGRlY29kZVNhbXBsZShiYXNlNjRUb0JpbmFyeShzYW1wbGUpLCBrZXksIGV2ZXJ5KSlcbiAgICAgIH1lbHNle1xuICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRBbmRQYXJzZVNhbXBsZShzYW1wbGUsIGtleSwgZXZlcnkpKVxuICAgICAgfVxuICAgIH1lbHNlIGlmKHR5cGVvZiBzYW1wbGUgPT09ICdvYmplY3QnKXtcbiAgICAgIHNhbXBsZSA9IHNhbXBsZS5zYW1wbGUgfHwgc2FtcGxlLmJ1ZmZlciB8fCBzYW1wbGUuYmFzZTY0IHx8IHNhbXBsZS51cmxcbiAgICAgIGdldFNhbXBsZShwcm9taXNlcywgc2FtcGxlLCBrZXksIGV2ZXJ5KVxuICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGUsIHByb21pc2VzLmxlbmd0aClcbiAgICB9XG4gIH1cblxuICBnZXRTYW1wbGUoKVxufVxuXG5cbi8vIG9ubHkgZm9yIGludGVybmFsbHkgdXNlIGluIHFhbWJpXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGVzMihtYXBwaW5nLCBldmVyeSA9IGZhbHNlKXtcbiAgbGV0IHR5cGUgPSB0eXBlU3RyaW5nKG1hcHBpbmcpLFxuICAgIHByb21pc2VzID0gW11cblxuICBldmVyeSA9IHR5cGVvZiBldmVyeSA9PT0gJ2Z1bmN0aW9uJyA/IGV2ZXJ5IDogZmFsc2VcbiAgLy9jb25zb2xlLmxvZyh0eXBlLCBtYXBwaW5nKVxuICBpZih0eXBlID09PSAnb2JqZWN0Jyl7XG4gICAgT2JqZWN0LmtleXMobWFwcGluZykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgLy9rZXkgPSBwYXJzZUludChrZXksIDEwKVxuICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIG1hcHBpbmdba2V5XSwga2V5LCBldmVyeSlcbiAgICB9KVxuICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICBsZXQga2V5XG4gICAgbWFwcGluZy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSl7XG4gICAgICAvLyBrZXkgaXMgZGVsaWJlcmF0ZWx5IHVuZGVmaW5lZFxuICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBldmVyeSlcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIC50aGVuKCh2YWx1ZXMpID0+IHtcbiAgICAgIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICAgICAgbWFwcGluZyA9IHt9XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IHZhbHVlLmJ1ZmZlclxuICAgICAgICB9KVxuICAgICAgICByZXNvbHZlKG1hcHBpbmcpO1xuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgIHJlc29sdmUodmFsdWVzKTtcbiAgICAgIH1cbiAgICB9KVxuICB9KVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNhbXBsZXMoLi4uZGF0YSl7XG4gIGlmKGRhdGEubGVuZ3RoID09PSAxICYmIHR5cGVTdHJpbmcoZGF0YVswXSkgIT09ICdzdHJpbmcnKXtcbiAgICByZXR1cm4gcGFyc2VTYW1wbGVzMihkYXRhWzBdKVxuICB9XG4gIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGEpXG59XG4iLCJpbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtNSURJTm90ZX0gZnJvbSAnLi9taWRpX25vdGUnO1xuXG5sZXRcbiAgcHBxLFxuICBicG0sXG4gIGZhY3RvcixcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcbiAgcGxheWJhY2tTcGVlZCxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcbiAgdGlja3MsXG4gIG1pbGxpcyxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIGRpZmZUaWNrc1xuICAvL3ByZXZpb3VzRXZlbnRcblxuZnVuY3Rpb24gc2V0VGlja0R1cmF0aW9uKCl7XG4gIHNlY29uZHNQZXJUaWNrID0gKDEgLyBwbGF5YmFja1NwZWVkICogNjApIC8gYnBtIC8gcHBxO1xuICBtaWxsaXNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2sgKiAxMDAwO1xuICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssIGJwbSwgcHBxLCBwbGF5YmFja1NwZWVkLCAocHBxICogbWlsbGlzUGVyVGljaykpO1xuICAvL2NvbnNvbGUubG9nKHBwcSk7XG59XG5cblxuZnVuY3Rpb24gc2V0VGlja3NQZXJCZWF0KCl7XG4gIGZhY3RvciA9ICg0IC8gZGVub21pbmF0b3IpO1xuICBudW1TaXh0ZWVudGggPSBmYWN0b3IgKiA0O1xuICB0aWNrc1BlckJlYXQgPSBwcHEgKiBmYWN0b3I7XG4gIHRpY2tzUGVyQmFyID0gdGlja3NQZXJCZWF0ICogbm9taW5hdG9yO1xuICB0aWNrc1BlclNpeHRlZW50aCA9IHBwcSAvIDQ7XG4gIC8vY29uc29sZS5sb2coZGVub21pbmF0b3IsIGZhY3RvciwgbnVtU2l4dGVlbnRoLCB0aWNrc1BlckJlYXQsIHRpY2tzUGVyQmFyLCB0aWNrc1BlclNpeHRlZW50aCk7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlUG9zaXRpb24oZXZlbnQsIGZhc3QgPSBmYWxzZSl7XG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIC8vIGlmKGRpZmZUaWNrcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGRpZmZUaWNrcywgZXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudHlwZSlcbiAgLy8gfVxuICB0aWNrICs9IGRpZmZUaWNrcztcbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgLy9wcmV2aW91c0V2ZW50ID0gZXZlbnRcbiAgLy9jb25zb2xlLmxvZyhkaWZmVGlja3MsIG1pbGxpc1BlclRpY2spO1xuICBtaWxsaXMgKz0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcblxuICBpZihmYXN0ID09PSBmYWxzZSl7XG4gICAgd2hpbGUodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgICBzaXh0ZWVudGgrKztcbiAgICAgIHRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgICBiZWF0Kys7XG4gICAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICAgIGJlYXQgLT0gbm9taW5hdG9yO1xuICAgICAgICAgIGJhcisrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGltZUV2ZW50cyhzZXR0aW5ncywgdGltZUV2ZW50cywgaXNQbGF5aW5nID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZSB0aW1lIGV2ZW50cycpXG4gIGxldCB0eXBlO1xuICBsZXQgZXZlbnQ7XG5cbiAgcHBxID0gc2V0dGluZ3MucHBxO1xuICBicG0gPSBzZXR0aW5ncy5icG07XG4gIG5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcjtcbiAgcGxheWJhY2tTcGVlZCA9IHNldHRpbmdzLnBsYXliYWNrU3BlZWQ7XG4gIGJhciA9IDE7XG4gIGJlYXQgPSAxO1xuICBzaXh0ZWVudGggPSAxO1xuICB0aWNrID0gMDtcbiAgdGlja3MgPSAwO1xuICBtaWxsaXMgPSAwO1xuXG4gIHNldFRpY2tEdXJhdGlvbigpO1xuICBzZXRUaWNrc1BlckJlYXQoKTtcblxuICB0aW1lRXZlbnRzLnNvcnQoKGEsIGIpID0+IChhLnRpY2tzIDw9IGIudGlja3MpID8gLTEgOiAxKTtcbiAgbGV0IGUgPSAwO1xuICBmb3IoZXZlbnQgb2YgdGltZUV2ZW50cyl7XG4gICAgLy9jb25zb2xlLmxvZyhlKyssIGV2ZW50LnRpY2tzLCBldmVudC50eXBlKVxuICAgIC8vZXZlbnQuc29uZyA9IHNvbmc7XG4gICAgdHlwZSA9IGV2ZW50LnR5cGU7XG4gICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG5cbiAgICBzd2l0Y2godHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgc2V0VGlja3NQZXJCZWF0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvL3RpbWUgZGF0YSBvZiB0aW1lIGV2ZW50IGlzIHZhbGlkIGZyb20gKGFuZCBpbmNsdWRlZCkgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aW1lIGV2ZW50XG4gICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXJzQXNTdHJpbmcpO1xuICB9XG5cbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xuICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgLy9jb25zb2xlLmxvZyh0aW1lRXZlbnRzKTtcbn1cblxuXG4vL2V4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhzb25nLCBldmVudHMpe1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKGV2ZW50cywgaXNQbGF5aW5nID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIGxldCBldmVudDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG4gIGxldCByZXN1bHQgPSBbXVxuXG4gIHRpY2sgPSAwXG4gIHRpY2tzID0gMFxuICBkaWZmVGlja3MgPSAwXG5cbiAgLy9sZXQgZXZlbnRzID0gW10uY29uY2F0KGV2dHMsIHNvbmcuX3RpbWVFdmVudHMpO1xuICBsZXQgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcblxuICAvLyBub3Rlb2ZmIGNvbWVzIGJlZm9yZSBub3Rlb25cblxuLypcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEuc29ydEluZGV4IC0gYi5zb3J0SW5kZXg7XG4gIH0pXG4qL1xuXG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgLy8gaWYoYS50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gLTFcbiAgICAgIC8vIH1lbHNlIGlmKGIudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vICAgcmV0dXJuIDFcbiAgICAgIC8vIH1cbiAgICAgIC8vIHNob3J0OlxuICAgICAgbGV0IHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgIHIgPSAtMVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJcbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4gIH0pXG4gIGV2ZW50ID0gZXZlbnRzWzBdXG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG5cblxuICBicG0gPSBldmVudC5icG07XG4gIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcblxuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG5cbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cblxuICBmb3IobGV0IGkgPSBzdGFydEV2ZW50OyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuXG4gICAgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcbiAgICAgICAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gICAgICAgIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljayxldmVudC5taWxsaXNQZXJUaWNrKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgICAgICAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICAgICAgICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobm9taW5hdG9yLG51bVNpeHRlZW50aCx0aWNrc1BlclNpeHRlZW50aCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuXG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAvL2Nhc2UgMTI4OlxuICAgICAgLy9jYXNlIDE0NDpcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAgIHVwZGF0ZUV2ZW50KGV2ZW50LCBpc1BsYXlpbmcpO1xuICAgICAgICByZXN1bHQucHVzaChldmVudClcblxuICAgICAgICAvLyBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhldmVudC5kYXRhMiwgZXZlbnQuYmFyc0FzU3RyaW5nKVxuICAgICAgICAvLyB9XG5cbiAgICB9XG5cblxuICAgIC8vIGlmKGkgPCAxMDAgJiYgKGV2ZW50LnR5cGUgPT09IDgxIHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpKXtcbiAgICAvLyAgIC8vY29uc29sZS5sb2coaSwgdGlja3MsIGRpZmZUaWNrcywgbWlsbGlzLCBtaWxsaXNQZXJUaWNrKVxuICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQubWlsbGlzLCAnbm90ZScsIGV2ZW50LmRhdGExLCAndmVsbycsIGV2ZW50LmRhdGEyKVxuICAgIC8vIH1cblxuICAgIGxhc3RFdmVudFRpY2sgPSBldmVudC50aWNrcztcbiAgfVxuICBwYXJzZU1JRElOb3RlcyhyZXN1bHQpXG4gIHJldHVybiByZXN1bHRcbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGV2ZW50LCBmYXN0ID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKGJhciwgYmVhdCwgdGlja3MpXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuXG4gIGV2ZW50LnRpY2tzID0gdGlja3M7XG5cbiAgZXZlbnQubWlsbGlzID0gbWlsbGlzO1xuICBldmVudC5zZWNvbmRzID0gbWlsbGlzIC8gMTAwMDtcblxuICBpZihmYXN0KXtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGV2ZW50LmJhciA9IGJhcjtcbiAgZXZlbnQuYmVhdCA9IGJlYXQ7XG4gIGV2ZW50LnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgZXZlbnQudGljayA9IHRpY2s7XG4gIC8vZXZlbnQuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2s7XG4gIHZhciB0aWNrQXNTdHJpbmcgPSB0aWNrID09PSAwID8gJzAwMCcgOiB0aWNrIDwgMTAgPyAnMDAnICsgdGljayA6IHRpY2sgPCAxMDAgPyAnMCcgKyB0aWNrIDogdGljaztcbiAgZXZlbnQuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIHRpY2tBc1N0cmluZztcbiAgZXZlbnQuYmFyc0FzQXJyYXkgPSBbYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tdO1xuXG5cbiAgdmFyIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcblxuICBldmVudC5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgZXZlbnQubWludXRlID0gdGltZURhdGEubWludXRlO1xuICBldmVudC5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gIGV2ZW50Lm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gIGV2ZW50LnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgZXZlbnQudGltZUFzQXJyYXkgPSB0aW1lRGF0YS50aW1lQXNBcnJheTtcblxuICAvLyBpZihtaWxsaXMgPCAwKXtcbiAgLy8gICBjb25zb2xlLmxvZyhldmVudClcbiAgLy8gfVxuXG5cbn1cblxuXG5sZXQgbWlkaU5vdGVJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESU5vdGVzKGV2ZW50cyl7XG4gIGxldCBub3RlcyA9IHt9XG4gIGxldCBub3Rlc0luVHJhY2tcbiAgbGV0IG4gPSAwXG4gIGZvcihsZXQgZXZlbnQgb2YgZXZlbnRzKXtcbiAgICBpZih0eXBlb2YgZXZlbnQuX3BhcnQgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBldmVudC5fdHJhY2sgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUubG9nKCdubyBwYXJ0IGFuZC9vciB0cmFjayBzZXQnKVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50Ll90cmFjay5pZF1cbiAgICAgIGlmKHR5cGVvZiBub3Rlc0luVHJhY2sgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXSA9IHt9XG4gICAgICB9XG4gICAgICBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdID0gZXZlbnRcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBjb3JyZXNwb25kaW5nIG5vdGVvbiBldmVudCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlT24gPSBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdXG4gICAgICBsZXQgbm90ZU9mZiA9IGV2ZW50XG4gICAgICBpZih0eXBlb2Ygbm90ZU9uID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIG5vdGVvbiBldmVudCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50Ll90cmFjay5pZF1bZXZlbnQuZGF0YTFdXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBsZXQgbm90ZSA9IG5ldyBNSURJTm90ZShub3RlT24sIG5vdGVPZmYpXG4gICAgICBub3RlID0gbnVsbFxuICAgICAgLy8gbGV0IGlkID0gYE1OXyR7bWlkaU5vdGVJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICAgIC8vIG5vdGVPbi5taWRpTm90ZUlkID0gaWRcbiAgICAgIC8vIG5vdGVPbi5vZmYgPSBub3RlT2ZmLmlkXG4gICAgICAvLyBub3RlT2ZmLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgLy8gbm90ZU9mZi5vbiA9IG5vdGVPbi5pZFxuICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50Ll90cmFjay5pZF1bZXZlbnQuZGF0YTFdXG4gICAgfVxuICB9XG4gIE9iamVjdC5rZXlzKG5vdGVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgZGVsZXRlIG5vdGVzW2tleV1cbiAgfSlcbiAgbm90ZXMgPSB7fVxuICAvL2NvbnNvbGUubG9nKG5vdGVzLCBub3Rlc0luVHJhY2spXG59XG5cblxuLy8gbm90IGluIHVzZSFcbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJFdmVudHMoZXZlbnRzKXtcbiAgbGV0IHN1c3RhaW4gPSB7fVxuICBsZXQgdG1wUmVzdWx0ID0ge31cbiAgbGV0IHJlc3VsdCA9IFtdXG4gIGZvcihsZXQgZXZlbnQgb2YgZXZlbnRzKXtcbiAgICBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgaWYodHlwZW9mIHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9ZWxzZSBpZihzdXN0YWluW2V2ZW50LnRyYWNrSWRdID09PSBldmVudC50aWNrcyl7XG4gICAgICAgICAgZGVsZXRlIHRtcFJlc3VsdFtldmVudC50aWNrc11cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgICBkZWxldGUgc3VzdGFpbltldmVudC50cmFja0lkXVxuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTIgPT09IDEyNyl7XG4gICAgICAgIHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPSBldmVudC50aWNrc1xuICAgICAgICB0bXBSZXN1bHRbZXZlbnQudGlja3NdID0gZXZlbnRcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgIH1cbiAgfVxuICBjb25zb2xlLmxvZyhzdXN0YWluKVxuICBPYmplY3Qua2V5cyh0bXBSZXN1bHQpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICBsZXQgc3VzdGFpbkV2ZW50ID0gdG1wUmVzdWx0W2tleV1cbiAgICBjb25zb2xlLmxvZyhzdXN0YWluRXZlbnQpXG4gICAgcmVzdWx0LnB1c2goc3VzdGFpbkV2ZW50KVxuICB9KVxuICByZXR1cm4gcmVzdWx0XG59XG4iLCIvLyBAIGZsb3dcblxuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwnXG5cbmxldCBwYXJ0SW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBQYXJ0e1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IG51bGwpe1xuICAgIHRoaXMuaWQgPSBgTVBfJHtwYXJ0SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCB0aGlzLmlkXG4gICAgdGhpcy5tdXRlZCA9IGZhbHNlXG4gICAgdGhpcy5fdHJhY2sgPSBudWxsXG4gICAgdGhpcy5fc29uZyA9IG51bGxcbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgdGhpcy5fc3RhcnQgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9lbmQgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgfVxuXG4gIGNvcHkoKXtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0KHRoaXMubmFtZSArICdfY29weScpIC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICBsZXQgZXZlbnRzID0gW11cbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudCl7XG4gICAgICBsZXQgY29weSA9IGV2ZW50LmNvcHkoKVxuICAgICAgY29uc29sZS5sb2coY29weSlcbiAgICAgIGV2ZW50cy5wdXNoKGNvcHkpXG4gICAgfSlcbiAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgcC51cGRhdGUoKVxuICAgIHJldHVybiBwXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZSh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVUbyh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgYWRkRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudHMpXG4gICAgbGV0IHRyYWNrID0gdGhpcy5fdHJhY2tcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Ll9wYXJ0ID0gdGhpc1xuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5zZXQoZXZlbnQuaWQsIGV2ZW50KVxuICAgICAgdGhpcy5fZXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IHRyYWNrXG4gICAgICB9XG4gICAgfSlcbiAgICBpZih0cmFjayl7XG4gICAgICB0cmFjay5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdHJhY2suX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIH1cbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX25ld0V2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICByZW1vdmVFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgdHJhY2sgPSB0aGlzLl90cmFja1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuX3BhcnQgPSBudWxsXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbFxuICAgICAgICB0cmFjay5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgICB9XG4gICAgfSlcbiAgICBpZih0cmFjayl7XG4gICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgICB0cmFjay5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgICB9XG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZUV2ZW50cyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZSh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZUV2ZW50c1RvKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlVG8odGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKGZpbHRlcjogc3RyaW5nW10gPSBudWxsKXsgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c10gLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgfVxuXG4gIG11dGUoZmxhZzogYm9vbGVhbiA9IG51bGwpe1xuICAgIGlmKGZsYWcpe1xuICAgICAgdGhpcy5tdXRlZCA9IGZsYWdcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMubXV0ZWQgPSAhdGhpcy5tdXRlZFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYodGhpcy5fY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB9XG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIC8vQFRPRE86IGNhbGN1bGF0ZSBwYXJ0IHN0YXJ0IGFuZCBlbmQsIGFuZCBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZVxuICB9XG59XG4iLCJpbXBvcnQge2dldFBvc2l0aW9uMn0gZnJvbSAnLi9wb3NpdGlvbi5qcydcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyLmpzJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwuanMnXG5cbmNvbnN0IHJhbmdlID0gMTAgLy8gbWlsbGlzZWNvbmRzIG9yIHRpY2tzXG5sZXQgaW5zdGFuY2VJZCA9IDBcblxuZXhwb3J0IGNsYXNzIFBsYXloZWFke1xuXG4gIGNvbnN0cnVjdG9yKHNvbmcsIHR5cGUgPSAnYWxsJyl7XG4gICAgdGhpcy5pZCA9IGBQT1MgJHtpbnN0YW5jZUlkKyt9ICR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMuc29uZyA9IHNvbmdcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5sYXN0RXZlbnQgPSBudWxsXG4gICAgdGhpcy5kYXRhID0ge31cblxuICAgIHRoaXMuYWN0aXZlUGFydHMgPSBbXVxuICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbXVxuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW11cbiAgfVxuXG4gIC8vIHVuaXQgY2FuIGJlICdtaWxsaXMnIG9yICd0aWNrcydcbiAgc2V0KHVuaXQsIHZhbHVlKXtcbiAgICB0aGlzLnVuaXQgPSB1bml0XG4gICAgdGhpcy5jdXJyZW50VmFsdWUgPSB2YWx1ZVxuICAgIHRoaXMuZXZlbnRJbmRleCA9IDBcbiAgICB0aGlzLm5vdGVJbmRleCA9IDBcbiAgICB0aGlzLnBhcnRJbmRleCA9IDBcbiAgICB0aGlzLmNhbGN1bGF0ZSgpXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICBnZXQoKXtcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuXG4gIHVwZGF0ZSh1bml0LCBkaWZmKXtcbiAgICBpZihkaWZmID09PSAwKXtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFcbiAgICB9XG4gICAgdGhpcy51bml0ID0gdW5pdFxuICAgIHRoaXMuY3VycmVudFZhbHVlICs9IGRpZmZcbiAgICB0aGlzLmNhbGN1bGF0ZSgpXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICB1cGRhdGVTb25nKCl7XG4gICAgdGhpcy5ldmVudHMgPSBbLi4udGhpcy5zb25nLl9ldmVudHMsIC4uLnRoaXMuc29uZy5fdGltZUV2ZW50c11cbiAgICBzb3J0RXZlbnRzKHRoaXMuZXZlbnRzKVxuICAgIC8vY29uc29sZS5sb2coJ2V2ZW50cyAlTycsIHRoaXMuZXZlbnRzKVxuICAgIHRoaXMubm90ZXMgPSB0aGlzLnNvbmcuX25vdGVzXG4gICAgdGhpcy5wYXJ0cyA9IHRoaXMuc29uZy5fcGFydHNcbiAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aFxuICAgIHRoaXMubnVtTm90ZXMgPSB0aGlzLm5vdGVzLmxlbmd0aFxuICAgIHRoaXMubnVtUGFydHMgPSB0aGlzLnBhcnRzLmxlbmd0aFxuICAgIHRoaXMuc2V0KCdtaWxsaXMnLCB0aGlzLnNvbmcuX21pbGxpcylcbiAgfVxuXG5cbiAgY2FsY3VsYXRlKCl7XG4gICAgbGV0IGlcbiAgICBsZXQgdmFsdWVcbiAgICBsZXQgZXZlbnRcbiAgICBsZXQgbm90ZVxuICAgIGxldCBwYXJ0XG4gICAgbGV0IHBvc2l0aW9uXG4gICAgbGV0IHN0aWxsQWN0aXZlTm90ZXMgPSBbXVxuICAgIGxldCBzdGlsbEFjdGl2ZVBhcnRzID0gW11cbiAgICBsZXQgY29sbGVjdGVkUGFydHMgPSBuZXcgU2V0KClcbiAgICBsZXQgY29sbGVjdGVkTm90ZXMgPSBuZXcgU2V0KClcblxuICAgIHRoaXMuZGF0YSA9IHt9XG4gICAgdGhpcy5hY3RpdmVFdmVudHMgPSBbXVxuXG4gICAgZm9yKGkgPSB0aGlzLmV2ZW50SW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgIGV2ZW50ID0gdGhpcy5ldmVudHNbaV1cbiAgICAgIHZhbHVlID0gZXZlbnRbdGhpcy51bml0XVxuICAgICAgaWYodmFsdWUgPD0gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAvLyBpZiB0aGUgcGxheWhlYWQgaXMgc2V0IHRvIGEgcG9zaXRpb24gb2Ygc2F5IDMwMDAgbWlsbGlzLCB3ZSBkb24ndCB3YW50IHRvIGFkZCBldmVudHMgbW9yZSB0aGF0IDEwIHVuaXRzIGJlZm9yZSB0aGUgcGxheWhlYWRcbiAgICAgICAgaWYodmFsdWUgPT09IDAgfHwgdmFsdWUgPiB0aGlzLmN1cnJlbnRWYWx1ZSAtIHJhbmdlKXtcbiAgICAgICAgICB0aGlzLmFjdGl2ZUV2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgICAgIC8vIHRoaXMgZG9lc24ndCB3b3JrIHRvbyB3ZWxsXG4gICAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQuZGF0YTEsIGV2ZW50LmRhdGEyKVxuICAgICAgICAgICAgaWYoZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbDInLFxuICAgICAgICAgICAgICAgIGRhdGE6IGV2ZW50LmRhdGEyID09PSAxMjcgPyAnZG93bicgOiAndXAnXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgLy8gfWVsc2V7XG4gICAgICAgICAgLy8gICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAvLyAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgICAvLyAgICAgZGF0YTogZXZlbnRcbiAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICAgICAgZGF0YTogZXZlbnRcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdEV2ZW50ID0gZXZlbnRcbiAgICAgICAgdGhpcy5ldmVudEluZGV4KytcbiAgICAgIH1lbHNle1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgdGhpcy5kYXRhLmFjdGl2ZUV2ZW50cyA9IHRoaXMuYWN0aXZlRXZlbnRzXG5cbiAgICAvLyBpZiBhIHNvbmcgaGFzIG5vIGV2ZW50cyB5ZXQsIHVzZSB0aGUgZmlyc3QgdGltZSBldmVudCBhcyByZWZlcmVuY2VcbiAgICBpZih0aGlzLmxhc3RFdmVudCA9PT0gbnVsbCl7XG4gICAgICB0aGlzLmxhc3RFdmVudCA9IHRoaXMuc29uZy5fdGltZUV2ZW50c1swXVxuICAgIH1cblxuICAgIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24yKHRoaXMuc29uZywgdGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSwgJ2FsbCcsIHRoaXMubGFzdEV2ZW50KVxuICAgIHRoaXMuZGF0YS5ldmVudEluZGV4ID0gdGhpcy5ldmVudEluZGV4XG4gICAgdGhpcy5kYXRhLm1pbGxpcyA9IHBvc2l0aW9uLm1pbGxpc1xuICAgIHRoaXMuZGF0YS50aWNrcyA9IHBvc2l0aW9uLnRpY2tzXG4gICAgdGhpcy5kYXRhLnBvc2l0aW9uID0gcG9zaXRpb25cblxuICAgIGlmKHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpe1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFcbiAgICAgIGZvcihsZXQga2V5IG9mIE9iamVjdC5rZXlzKHBvc2l0aW9uKSl7XG4gICAgICAgIGRhdGFba2V5XSA9IHBvc2l0aW9uW2tleV1cbiAgICAgIH1cbiAgICB9ZWxzZSBpZih0aGlzLnR5cGUuaW5kZXhPZignYmFyc2JlYXRzJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5iYXIgPSBwb3NpdGlvbi5iYXJcbiAgICAgIHRoaXMuZGF0YS5iZWF0ID0gcG9zaXRpb24uYmVhdFxuICAgICAgdGhpcy5kYXRhLnNpeHRlZW50aCA9IHBvc2l0aW9uLnNpeHRlZW50aFxuICAgICAgdGhpcy5kYXRhLnRpY2sgPSBwb3NpdGlvbi50aWNrXG4gICAgICB0aGlzLmRhdGEuYmFyc0FzU3RyaW5nID0gcG9zaXRpb24uYmFyc0FzU3RyaW5nXG5cbiAgICAgIHRoaXMuZGF0YS50aWNrc1BlckJhciA9IHBvc2l0aW9uLnRpY2tzUGVyQmFyXG4gICAgICB0aGlzLmRhdGEudGlja3NQZXJCZWF0ID0gcG9zaXRpb24udGlja3NQZXJCZWF0XG4gICAgICB0aGlzLmRhdGEudGlja3NQZXJTaXh0ZWVudGggPSBwb3NpdGlvbi50aWNrc1BlclNpeHRlZW50aFxuICAgICAgdGhpcy5kYXRhLm51bVNpeHRlZW50aCA9IHBvc2l0aW9uLm51bVNpeHRlZW50aFxuXG4gICAgfWVsc2UgaWYodGhpcy50eXBlLmluZGV4T2YoJ3RpbWUnKSAhPT0gLTEpe1xuICAgICAgdGhpcy5kYXRhLmhvdXIgPSBwb3NpdGlvbi5ob3VyXG4gICAgICB0aGlzLmRhdGEubWludXRlID0gcG9zaXRpb24ubWludXRlXG4gICAgICB0aGlzLmRhdGEuc2Vjb25kID0gcG9zaXRpb24uc2Vjb25kXG4gICAgICB0aGlzLmRhdGEubWlsbGlzZWNvbmQgPSBwb3NpdGlvbi5taWxsaXNlY29uZFxuICAgICAgdGhpcy5kYXRhLnRpbWVBc1N0cmluZyA9IHBvc2l0aW9uLnRpbWVBc1N0cmluZ1xuXG4gICAgfWVsc2UgaWYodGhpcy50eXBlLmluZGV4T2YoJ3BlcmNlbnRhZ2UnKSAhPT0gLTEpe1xuICAgICAgdGhpcy5kYXRhLnBlcmNlbnRhZ2UgPSBwb3NpdGlvbi5wZXJjZW50YWdlXG4gICAgfVxuXG4gICAgLy8gZ2V0IGFjdGl2ZSBub3Rlc1xuICAgIGlmKHRoaXMudHlwZS5pbmRleE9mKCdub3RlcycpICE9PSAtMSB8fCB0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKXtcblxuICAgICAgLy8gZ2V0IGFsbCBub3RlcyBiZXR3ZWVuIHRoZSBub3RlSW5kZXggYW5kIHRoZSBjdXJyZW50IHBsYXloZWFkIHBvc2l0aW9uXG4gICAgICBmb3IoaSA9IHRoaXMubm90ZUluZGV4OyBpIDwgdGhpcy5udW1Ob3RlczsgaSsrKXtcbiAgICAgICAgbm90ZSA9IHRoaXMubm90ZXNbaV1cbiAgICAgICAgdmFsdWUgPSBub3RlLm5vdGVPblt0aGlzLnVuaXRdXG4gICAgICAgIGlmKHZhbHVlIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICB0aGlzLm5vdGVJbmRleCsrXG4gICAgICAgICAgaWYodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGlmIHRoZSBwbGF5aGVhZCBpcyBzZXQgdG8gYSBwb3NpdGlvbiBvZiBzYXkgMzAwMCBtaWxsaXMsIHdlIGRvbid0IHdhbnQgdG8gYWRkIG5vdGVzIGJlZm9yZSB0aGUgcGxheWhlYWRcbiAgICAgICAgICBpZih0aGlzLmN1cnJlbnRWYWx1ZSA9PT0gMCB8fCBub3RlLm5vdGVPZmZbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICAgIGNvbGxlY3RlZE5vdGVzLmFkZChub3RlKVxuICAgICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICAgIHR5cGU6ICdub3RlT24nLFxuICAgICAgICAgICAgICBkYXRhOiBub3RlXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZmlsdGVyIG5vdGVzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgIGZvcihpID0gdGhpcy5hY3RpdmVOb3Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgICAgIG5vdGUgPSB0aGlzLmFjdGl2ZU5vdGVzW2ldO1xuICAgICAgICAvL2lmKG5vdGUubm90ZU9uLnN0YXRlLmluZGV4T2YoJ3JlbW92ZWQnKSA9PT0gMCB8fCB0aGlzLnNvbmcuX25vdGVzQnlJZC5nZXQobm90ZS5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYodGhpcy5zb25nLl9ub3Rlc0J5SWQuZ2V0KG5vdGUuaWQpID09PSBmYWxzZSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc2tpcHBpbmcgcmVtb3ZlZCBub3RlJywgbm90ZS5pZCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0eXBlb2Ygbm90ZS5ub3RlT2ZmID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdub3RlIHdpdGggaWQnLCBub3RlLmlkLCAnaGFzIG5vIG5vdGVPZmYgZXZlbnQnKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYobm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSAmJiBjb2xsZWN0ZWROb3Rlcy5oYXMobm90ZSkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYobm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgc3RpbGxBY3RpdmVOb3Rlcy5wdXNoKG5vdGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdub3RlT2ZmJyxcbiAgICAgICAgICAgIGRhdGE6IG5vdGVcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGFkZCB0aGUgc3RpbGwgYWN0aXZlIG5vdGVzIGFuZCB0aGUgbmV3bHkgYWN0aXZlIGV2ZW50cyB0byB0aGUgYWN0aXZlIG5vdGVzIGFycmF5XG4gICAgICB0aGlzLmFjdGl2ZU5vdGVzID0gWy4uLmNvbGxlY3RlZE5vdGVzLnZhbHVlcygpLCAuLi5zdGlsbEFjdGl2ZU5vdGVzXVxuICAgICAgdGhpcy5kYXRhLmFjdGl2ZU5vdGVzID0gdGhpcy5hY3RpdmVOb3Rlc1xuICAgIH1cblxuXG4gICAgLy8gZ2V0IGFjdGl2ZSBwYXJ0c1xuICAgIGlmKHRoaXMudHlwZS5pbmRleE9mKCdwYXJ0cycpICE9PSAtMSB8fCB0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKXtcblxuICAgICAgZm9yKGkgPSB0aGlzLnBhcnRJbmRleDsgaSA8IHRoaXMubnVtUGFydHM7IGkrKyl7XG4gICAgICAgIHBhcnQgPSB0aGlzLnBhcnRzW2ldXG4gICAgICAgIC8vY29uc29sZS5sb2cocGFydCwgdGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIGlmKHBhcnQuX3N0YXJ0W3RoaXMudW5pdF0gPD0gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIGNvbGxlY3RlZFBhcnRzLmFkZChwYXJ0KVxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ3BhcnRPbicsXG4gICAgICAgICAgICBkYXRhOiBwYXJ0XG4gICAgICAgICAgfSlcbiAgICAgICAgICB0aGlzLnBhcnRJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuXG4gICAgICAvLyBmaWx0ZXIgcGFydHMgdGhhdCBhcmUgbm8gbG9uZ2VyIGFjdGl2ZVxuICAgICAgZm9yKGkgPSB0aGlzLmFjdGl2ZVBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcbiAgICAgICAgcGFydCA9IHRoaXMuYWN0aXZlUGFydHNbaV07XG4gICAgICAgIC8vaWYocGFydC5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9wYXJ0c0J5SWQuZ2V0KHBhcnQuaWQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHRoaXMuc29uZy5fcGFydHNCeUlkLmdldChwYXJ0LmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgcGFydCcsIHBhcnQuaWQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZihwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlICYmIGNvbGxlY3RlZFBhcnRzLmhhcyhwYXJ0KSA9PT0gZmFsc2Upe1xuICAgICAgICBpZihwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICBzdGlsbEFjdGl2ZVBhcnRzLnB1c2gobm90ZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ3BhcnRPZmYnLFxuICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hY3RpdmVQYXJ0cyA9IFsuLi5jb2xsZWN0ZWRQYXJ0cy52YWx1ZXMoKSwgLi4uc3RpbGxBY3RpdmVQYXJ0c11cbiAgICAgIHRoaXMuZGF0YS5hY3RpdmVQYXJ0cyA9IHRoaXMuYWN0aXZlUGFydHNcbiAgICB9XG5cbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICBkYXRhOiB0aGlzLmRhdGFcbiAgICB9KVxuXG4gIH1cblxuLypcbiAgc2V0VHlwZSh0KXtcbiAgICB0aGlzLnR5cGUgPSB0O1xuICAgIHRoaXMuc2V0KHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gIH1cblxuXG4gIGFkZFR5cGUodCl7XG4gICAgdGhpcy50eXBlICs9ICcgJyArIHQ7XG4gICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgfVxuXG4gIHJlbW92ZVR5cGUodCl7XG4gICAgdmFyIGFyciA9IHRoaXMudHlwZS5zcGxpdCgnICcpO1xuICAgIHRoaXMudHlwZSA9ICcnO1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpe1xuICAgICAgaWYodHlwZSAhPT0gdCl7XG4gICAgICAgIHRoaXMudHlwZSArPSB0ICsgJyAnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMudHlwZS50cmltKCk7XG4gICAgdGhpcy5zZXQodGhpcy5jdXJyZW50VmFsdWUpO1xuICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gIH1cbiovXG5cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtnZXROaWNlVGltZX0gZnJvbSAnLi91dGlsJztcblxuY29uc3RcbiAgc3VwcG9ydGVkVHlwZXMgPSAnYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBwZXJjIHBlcmNlbnRhZ2UnLFxuICBzdXBwb3J0ZWRSZXR1cm5UeXBlcyA9ICdiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIGFsbCcsXG4gIGZsb29yID0gTWF0aC5mbG9vcixcbiAgcm91bmQgPSBNYXRoLnJvdW5kO1xuXG5cbmxldFxuICAvL2xvY2FsXG4gIGJwbSxcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIHRpY2tzLFxuICBtaWxsaXMsXG4gIGRpZmZUaWNrcyxcbiAgZGlmZk1pbGxpcyxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcblxuLy8gIHR5cGUsXG4gIGluZGV4LFxuICByZXR1cm5UeXBlID0gJ2FsbCcsXG4gIGJleW9uZEVuZE9mU29uZyA9IHRydWU7XG5cblxuZnVuY3Rpb24gZ2V0VGltZUV2ZW50KHNvbmcsIHVuaXQsIHRhcmdldCl7XG4gIC8vIGZpbmRzIHRoZSB0aW1lIGV2ZW50IHRoYXQgY29tZXMgdGhlIGNsb3Nlc3QgYmVmb3JlIHRoZSB0YXJnZXQgcG9zaXRpb25cbiAgbGV0IHRpbWVFdmVudHMgPSBzb25nLl90aW1lRXZlbnRzXG5cbiAgZm9yKGxldCBpID0gdGltZUV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgbGV0IGV2ZW50ID0gdGltZUV2ZW50c1tpXTtcbiAgICAvL2NvbnNvbGUubG9nKHVuaXQsIHRhcmdldCwgZXZlbnQpXG4gICAgaWYoZXZlbnRbdW5pdF0gPD0gdGFyZ2V0KXtcbiAgICAgIGluZGV4ID0gaVxuICAgICAgcmV0dXJuIGV2ZW50XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc1RvVGlja3Moc29uZywgdGFyZ2V0TWlsbGlzLCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXRNaWxsaXMpXG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tzVG9NaWxsaXMoc29uZywgdGFyZ2V0VGlja3MsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0VGlja3MpXG4gIHJldHVybiBtaWxsaXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYmFyc1RvTWlsbGlzKHNvbmcsIHBvc2l0aW9uLCBiZW9zKXsgLy8gYmVvcyA9IGJleW9uZEVuZE9mU29uZ1xuICBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0JyxcbiAgICBwb3NpdGlvbixcbiAgICByZXN1bHQ6ICdtaWxsaXMnLFxuICAgIGJlb3MsXG4gIH0pXG4gIHJldHVybiBtaWxsaXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYmFyc1RvVGlja3Moc29uZywgcG9zaXRpb24sIGJlb3MpeyAvLyBiZW9zID0gYmV5b25kRW5kT2ZTb25nXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICBwb3NpdGlvbixcbiAgICByZXN1bHQ6ICd0aWNrcycsXG4gICAgYmVvc1xuICB9KVxuICAvL3JldHVybiByb3VuZCh0aWNrcyk7XG4gIHJldHVybiB0aWNrc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrc1RvQmFycyhzb25nLCB0YXJnZXQsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KVxuICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICByZXR1cm5UeXBlID0gJ2JhcnNhbmRiZWF0cydcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc1RvQmFycyhzb25nLCB0YXJnZXQsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldClcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgcmV0dXJuVHlwZSA9ICdiYXJzYW5kYmVhdHMnXG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoKVxufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIG1pbGxpcyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbU1pbGxpcyhzb25nLCB0YXJnZXRNaWxsaXMsIGV2ZW50KXtcbiAgbGV0IGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRNaWxsaXMgPiBsYXN0RXZlbnQubWlsbGlzKXtcbiAgICAgIHRhcmdldE1pbGxpcyA9IGxhc3RFdmVudC5taWxsaXM7XG4gICAgfVxuICB9XG5cbiAgaWYodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ21pbGxpcycsIHRhcmdldE1pbGxpcyk7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBleGFjdGx5IGF0IHRhcmdldCBtaWxsaXMsIGNhbGN1bGF0ZSB0aGUgZGlmZlxuICBpZihldmVudC5taWxsaXMgPT09IHRhcmdldE1pbGxpcyl7XG4gICAgZGlmZk1pbGxpcyA9IDA7XG4gICAgZGlmZlRpY2tzID0gMDtcbiAgfWVsc2V7XG4gICAgZGlmZk1pbGxpcyA9IHRhcmdldE1pbGxpcyAtIGV2ZW50Lm1pbGxpcztcbiAgICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgcmV0dXJuIHRpY2tzO1xufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIHRpY2tzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tVGlja3Moc29uZywgdGFyZ2V0VGlja3MsIGV2ZW50KXtcbiAgbGV0IGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRUaWNrcyA+IGxhc3RFdmVudC50aWNrcyl7XG4gICAgICB0YXJnZXRUaWNrcyA9IGxhc3RFdmVudC50aWNrcztcbiAgICB9XG4gIH1cblxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAndGlja3MnLCB0YXJnZXRUaWNrcyk7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBleGFjdGx5IGF0IHRhcmdldCB0aWNrcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmKGV2ZW50LnRpY2tzID09PSB0YXJnZXRUaWNrcyl7XG4gICAgZGlmZlRpY2tzID0gMDtcbiAgICBkaWZmTWlsbGlzID0gMDtcbiAgfWVsc2V7XG4gICAgZGlmZlRpY2tzID0gdGFyZ2V0VGlja3MgLSB0aWNrcztcbiAgICBkaWZmTWlsbGlzID0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIHRpY2tzICs9IGRpZmZUaWNrcztcbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG5cbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciBiYXJzIGFuZCBiZWF0cyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbUJhcnMoc29uZywgdGFyZ2V0QmFyLCB0YXJnZXRCZWF0LCB0YXJnZXRTaXh0ZWVudGgsIHRhcmdldFRpY2ssIGV2ZW50ID0gbnVsbCl7XG4gIC8vY29uc29sZS50aW1lKCdmcm9tQmFycycpO1xuICBsZXQgaSA9IDAsXG4gICAgZGlmZkJhcnMsXG4gICAgZGlmZkJlYXRzLFxuICAgIGRpZmZTaXh0ZWVudGgsXG4gICAgZGlmZlRpY2ssXG4gICAgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2Upe1xuICAgIGlmKHRhcmdldEJhciA+IGxhc3RFdmVudC5iYXIpe1xuICAgICAgdGFyZ2V0QmFyID0gbGFzdEV2ZW50LmJhcjtcbiAgICB9XG4gIH1cblxuICBpZihldmVudCA9PT0gbnVsbCl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ2JhcicsIHRhcmdldEJhcik7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy9jb3JyZWN0IHdyb25nIHBvc2l0aW9uIGRhdGEsIGZvciBpbnN0YW5jZTogJzMsMywyLDc4OCcgYmVjb21lcyAnMyw0LDQsMDY4JyBpbiBhIDQvNCBtZWFzdXJlIGF0IFBQUSA0ODBcbiAgd2hpbGUodGFyZ2V0VGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgdGFyZ2V0U2l4dGVlbnRoKys7XG4gICAgdGFyZ2V0VGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgfVxuXG4gIHdoaWxlKHRhcmdldFNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgdGFyZ2V0QmVhdCsrO1xuICAgIHRhcmdldFNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gIH1cblxuICB3aGlsZSh0YXJnZXRCZWF0ID4gbm9taW5hdG9yKXtcbiAgICB0YXJnZXRCYXIrKztcbiAgICB0YXJnZXRCZWF0IC09IG5vbWluYXRvcjtcbiAgfVxuXG4gIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdiYXInLCB0YXJnZXRCYXIsIGluZGV4KTtcbiAgZm9yKGkgPSBpbmRleDsgaSA+PSAwOyBpLS0pe1xuICAgIGV2ZW50ID0gc29uZy5fdGltZUV2ZW50c1tpXTtcbiAgICBpZihldmVudC5iYXIgPD0gdGFyZ2V0QmFyKXtcbiAgICAgIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlc1xuICBkaWZmVGljayA9IHRhcmdldFRpY2sgLSB0aWNrO1xuICBkaWZmU2l4dGVlbnRoID0gdGFyZ2V0U2l4dGVlbnRoIC0gc2l4dGVlbnRoO1xuICBkaWZmQmVhdHMgPSB0YXJnZXRCZWF0IC0gYmVhdDtcbiAgZGlmZkJhcnMgPSB0YXJnZXRCYXIgLSBiYXI7IC8vYmFyIGlzIGFsd2F5cyBsZXNzIHRoZW4gb3IgZXF1YWwgdG8gdGFyZ2V0QmFyLCBzbyBkaWZmQmFycyBpcyBhbHdheXMgPj0gMFxuXG4gIC8vY29uc29sZS5sb2coJ2RpZmYnLGRpZmZCYXJzLGRpZmZCZWF0cyxkaWZmU2l4dGVlbnRoLGRpZmZUaWNrKTtcbiAgLy9jb25zb2xlLmxvZygnbWlsbGlzJyxtaWxsaXMsdGlja3NQZXJCYXIsdGlja3NQZXJCZWF0LHRpY2tzUGVyU2l4dGVlbnRoLG1pbGxpc1BlclRpY2spO1xuXG4gIC8vIGNvbnZlcnQgZGlmZmVyZW5jZXMgdG8gbWlsbGlzZWNvbmRzIGFuZCB0aWNrc1xuICBkaWZmTWlsbGlzID0gKGRpZmZCYXJzICogdGlja3NQZXJCYXIpICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSAoZGlmZkJlYXRzICogdGlja3NQZXJCZWF0KSAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gKGRpZmZTaXh0ZWVudGggKiB0aWNrc1BlclNpeHRlZW50aCkgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IGRpZmZUaWNrICogbWlsbGlzUGVyVGljaztcbiAgZGlmZlRpY2tzID0gZGlmZk1pbGxpcyAvIG1pbGxpc1BlclRpY2s7XG4gIC8vY29uc29sZS5sb2coZGlmZkJhcnMsIHRpY2tzUGVyQmFyLCBtaWxsaXNQZXJUaWNrLCBkaWZmTWlsbGlzLCBkaWZmVGlja3MpO1xuXG4gIC8vIHNldCBhbGwgY3VycmVudCBwb3NpdGlvbiBkYXRhXG4gIGJhciA9IHRhcmdldEJhcjtcbiAgYmVhdCA9IHRhcmdldEJlYXQ7XG4gIHNpeHRlZW50aCA9IHRhcmdldFNpeHRlZW50aDtcbiAgdGljayA9IHRhcmdldFRpY2s7XG4gIC8vY29uc29sZS5sb2codGljaywgdGFyZ2V0VGljaylcblxuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcbiAgLy9jb25zb2xlLmxvZyh0YXJnZXRCYXIsIHRhcmdldEJlYXQsIHRhcmdldFNpeHRlZW50aCwgdGFyZ2V0VGljaywgJyAtPiAnLCBtaWxsaXMpO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgLy9jb25zb2xlLnRpbWVFbmQoJ2Zyb21CYXJzJyk7XG59XG5cblxuZnVuY3Rpb24gY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCl7XG4gIC8vIHNwcmVhZCB0aGUgZGlmZmVyZW5jZSBpbiB0aWNrIG92ZXIgYmFycywgYmVhdHMgYW5kIHNpeHRlZW50aFxuICBsZXQgdG1wID0gcm91bmQoZGlmZlRpY2tzKTtcbiAgd2hpbGUodG1wID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICBzaXh0ZWVudGgrKztcbiAgICB0bXAgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgd2hpbGUoc2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICBiZWF0Kys7XG4gICAgICB3aGlsZShiZWF0ID4gbm9taW5hdG9yKXtcbiAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgIGJhcisrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB0aWNrID0gcm91bmQodG1wKTtcbn1cblxuXG4vLyBzdG9yZSBwcm9wZXJ0aWVzIG9mIGV2ZW50IGluIGxvY2FsIHNjb3BlXG5mdW5jdGlvbiBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KXtcblxuICBicG0gPSBldmVudC5icG07XG4gIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcblxuICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgLy9jb25zb2xlLmxvZyhicG0sIGV2ZW50LnR5cGUpO1xuICAvL2NvbnNvbGUubG9nKCd0aWNrcycsIHRpY2tzLCAnbWlsbGlzJywgbWlsbGlzLCAnYmFyJywgYmFyKTtcbn1cblxuXG5mdW5jdGlvbiBnZXRQb3NpdGlvbkRhdGEoc29uZyl7XG4gIGxldCB0aW1lRGF0YSxcbiAgICBwb3NpdGlvbkRhdGEgPSB7fTtcblxuICBzd2l0Y2gocmV0dXJuVHlwZSl7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgLy9wb3NpdGlvbkRhdGEubWlsbGlzID0gbWlsbGlzO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpcyA9IHJvdW5kKG1pbGxpcyAqIDEwMDApIC8gMTAwMDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNSb3VuZGVkID0gcm91bmQobWlsbGlzKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3MgPSB0aWNrcztcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrcyA9IHJvdW5kKHRpY2tzKTtcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzVW5yb3VuZGVkID0gdGlja3M7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXIgPSBiYXI7XG4gICAgICBwb3NpdGlvbkRhdGEuYmVhdCA9IGJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2sgPSB0aWNrO1xuICAgICAgLy9wb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2tBc1N0cmluZztcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgZ2V0VGlja0FzU3RyaW5nKHRpY2spO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhbGwnOlxuICAgICAgLy8gbWlsbGlzXG4gICAgICAvL3Bvc2l0aW9uRGF0YS5taWxsaXMgPSBtaWxsaXM7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzID0gcm91bmQobWlsbGlzICogMTAwMCkgLyAxMDAwO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1JvdW5kZWQgPSByb3VuZChtaWxsaXMpO1xuXG4gICAgICAvLyB0aWNrc1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3MgPSB0aWNrcztcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrcyA9IHJvdW5kKHRpY2tzKTtcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzVW5yb3VuZGVkID0gdGlja3M7XG5cbiAgICAgIC8vIGJhcnNiZWF0c1xuICAgICAgcG9zaXRpb25EYXRhLmJhciA9IGJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5iZWF0ID0gYmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEudGljayA9IHRpY2s7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGlja0FzU3RyaW5nO1xuICAgICAgcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyBnZXRUaWNrQXNTdHJpbmcodGljayk7XG5cbiAgICAgIC8vIHRpbWVcbiAgICAgIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuXG4gICAgICAvLyBleHRyYSBkYXRhXG4gICAgICBwb3NpdGlvbkRhdGEuYnBtID0gcm91bmQoYnBtICogc29uZy5wbGF5YmFja1NwZWVkLCAzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gICAgICBwb3NpdGlvbkRhdGEuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyQmFyID0gdGlja3NQZXJCYXI7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgICAgIHBvc2l0aW9uRGF0YS5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUGVyVGljayA9IG1pbGxpc1BlclRpY2s7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljaztcblxuICAgICAgLy8gdXNlIHRpY2tzIHRvIG1ha2UgdGVtcG8gY2hhbmdlcyB2aXNpYmxlIGJ5IGEgZmFzdGVyIG1vdmluZyBwbGF5aGVhZFxuICAgICAgcG9zaXRpb25EYXRhLnBlcmNlbnRhZ2UgPSB0aWNrcyAvIHNvbmcuX2R1cmF0aW9uVGlja3M7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5wZXJjZW50YWdlID0gbWlsbGlzIC8gc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIHBvc2l0aW9uRGF0YVxufVxuXG5cbmZ1bmN0aW9uIGdldFRpY2tBc1N0cmluZyh0KXtcbiAgaWYodCA9PT0gMCl7XG4gICAgdCA9ICcwMDAnXG4gIH1lbHNlIGlmKHQgPCAxMCl7XG4gICAgdCA9ICcwMCcgKyB0XG4gIH1lbHNlIGlmKHQgPCAxMDApe1xuICAgIHQgPSAnMCcgKyB0XG4gIH1cbiAgcmV0dXJuIHRcbn1cblxuXG4vLyB1c2VkIGJ5IHBsYXloZWFkXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9zaXRpb24yKHNvbmcsIHVuaXQsIHRhcmdldCwgdHlwZSwgZXZlbnQpe1xuICBpZih1bml0ID09PSAnbWlsbGlzJyl7XG4gICAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQsIGV2ZW50KTtcbiAgfWVsc2UgaWYodW5pdCA9PT0gJ3RpY2tzJyl7XG4gICAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldCwgZXZlbnQpO1xuICB9XG4gIHJldHVyblR5cGUgPSB0eXBlXG4gIGlmKHJldHVyblR5cGUgPT09ICdhbGwnKXtcbiAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgfVxuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xufVxuXG5cbi8vIGltcHJvdmVkIHZlcnNpb24gb2YgZ2V0UG9zaXRpb25cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCBzZXR0aW5ncyl7XG4gIGxldCB7XG4gICAgdHlwZSwgLy8gYW55IG9mIGJhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlXG4gICAgdGFyZ2V0LCAvLyBpZiB0eXBlIGlzIGJhcnNiZWF0cyBvciB0aW1lLCB0YXJnZXQgbXVzdCBiZSBhbiBhcnJheSwgZWxzZSBpZiBtdXN0IGJlIGEgbnVtYmVyXG4gICAgcmVzdWx0OiByZXN1bHQgPSAnYWxsJywgLy8gYW55IG9mIGJhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgYWxsXG4gICAgYmVvczogYmVvcyA9IHRydWUsXG4gICAgc25hcDogc25hcCA9IC0xXG4gIH0gPSBzZXR0aW5nc1xuXG4gIGlmKHN1cHBvcnRlZFJldHVyblR5cGVzLmluZGV4T2YocmVzdWx0KSA9PT0gLTEpe1xuICAgIGNvbnNvbGUud2FybihgdW5zdXBwb3J0ZWQgcmV0dXJuIHR5cGUsICdhbGwnIHVzZWQgaW5zdGVhZCBvZiAnJHtyZXN1bHR9J2ApXG4gICAgcmVzdWx0ID0gJ2FsbCdcbiAgfVxuXG4gIHJldHVyblR5cGUgPSByZXN1bHRcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuXG4gIGlmKHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkgPT09IC0xKXtcbiAgICBjb25zb2xlLmVycm9yKGB1bnN1cHBvcnRlZCB0eXBlICR7dHlwZX1gKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cblxuICBzd2l0Y2godHlwZSl7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBsZXQgW3RhcmdldGJhciA9IDEsIHRhcmdldGJlYXQgPSAxLCB0YXJnZXRzaXh0ZWVudGggPSAxLCB0YXJnZXR0aWNrID0gMF0gPSB0YXJnZXRcbiAgICAgIC8vY29uc29sZS5sb2codGFyZ2V0YmFyLCB0YXJnZXRiZWF0LCB0YXJnZXRzaXh0ZWVudGgsIHRhcmdldHRpY2spXG4gICAgICBmcm9tQmFycyhzb25nLCB0YXJnZXRiYXIsIHRhcmdldGJlYXQsIHRhcmdldHNpeHRlZW50aCwgdGFyZ2V0dGljaylcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAgbGV0IFt0YXJnZXRob3VyID0gMCwgdGFyZ2V0bWludXRlID0gMCwgdGFyZ2V0c2Vjb25kID0gMCwgdGFyZ2V0bWlsbGlzZWNvbmQgPSAwXSA9IHRhcmdldFxuICAgICAgbGV0IG1pbGxpcyA9IDBcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRob3VyICogNjAgKiA2MCAqIDEwMDAgLy9ob3Vyc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbnV0ZSAqIDYwICogMTAwMCAvL21pbnV0ZXNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRzZWNvbmQgKiAxMDAwIC8vc2Vjb25kc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbGxpc2Vjb25kIC8vbWlsbGlzZWNvbmRzXG5cbiAgICAgIGZyb21NaWxsaXMoc29uZywgbWlsbGlzKVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldClcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHRhcmdldCAqIHNvbmcuX2R1cmF0aW9uVGlja3MgLy8gdGFyZ2V0IG11c3QgYmUgaW4gdGlja3MhXG4gICAgICAvL2NvbnNvbGUubG9nKHRpY2tzLCBzb25nLl9kdXJhdGlvblRpY2tzKVxuICAgICAgaWYoc25hcCAhPT0gLTEpe1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzIC8gc25hcCkgKiBzbmFwO1xuICAgICAgICAvL2Zyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGlja3MpO1xuICAgICAgfVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRpY2tzKVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIGxldCB0bXAgPSBnZXRQb3NpdGlvbkRhdGEoc29uZylcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXBcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG4vKlxuXG4vL0BwYXJhbTogJ21pbGxpcycsIDEwMDAsIFt0cnVlXVxuLy9AcGFyYW06ICd0aWNrcycsIDEwMDAsIFt0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCAxLCBbJ2FsbCcsIHRydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDYwLCA0LCAzLCAxMjAsIFsnYWxsJywgdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgNjAsIDQsIDMsIDEyMCwgW3RydWUsICdhbGwnXVxuXG5mdW5jdGlvbiBjaGVja1Bvc2l0aW9uKHR5cGUsIGFyZ3MsIHJldHVyblR5cGUgPSAnYWxsJyl7XG4gIGJleW9uZEVuZE9mU29uZyA9IHRydWU7XG4gIGNvbnNvbGUubG9nKCctLS0tPiBjaGVja1Bvc2l0aW9uOicsIGFyZ3MsIHR5cGVTdHJpbmcoYXJncykpO1xuXG4gIGlmKHR5cGVTdHJpbmcoYXJncykgPT09ICdhcnJheScpe1xuICAgIGxldFxuICAgICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoLFxuICAgICAgcG9zaXRpb24sXG4gICAgICBpLCBhLCBwb3NpdGlvbkxlbmd0aDtcblxuICAgIHR5cGUgPSBhcmdzWzBdO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgW1snbWlsbGlzJywgMzAwMF1dXG4gICAgaWYodHlwZVN0cmluZyhhcmdzWzBdKSA9PT0gJ2FycmF5Jyl7XG4gICAgICAvL2NvbnNvbGUud2FybigndGhpcyBzaG91bGRuXFwndCBoYXBwZW4hJyk7XG4gICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgIHR5cGUgPSBhcmdzWzBdO1xuICAgICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoO1xuICAgIH1cblxuICAgIHBvc2l0aW9uID0gW3R5cGVdO1xuXG4gICAgY29uc29sZS5sb2coJ2NoZWNrIHBvc2l0aW9uJywgYXJncywgbnVtQXJncywgc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSk7XG5cbiAgICAvL2NvbnNvbGUubG9nKCdhcmcnLCAwLCAnLT4nLCB0eXBlKTtcblxuICAgIGlmKHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkgIT09IC0xKXtcbiAgICAgIGZvcihpID0gMTsgaSA8IG51bUFyZ3M7IGkrKyl7XG4gICAgICAgIGEgPSBhcmdzW2ldO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdhcmcnLCBpLCAnLT4nLCBhKTtcbiAgICAgICAgaWYoYSA9PT0gdHJ1ZSB8fCBhID09PSBmYWxzZSl7XG4gICAgICAgICAgYmV5b25kRW5kT2ZTb25nID0gYTtcbiAgICAgICAgfWVsc2UgaWYoaXNOYU4oYSkpe1xuICAgICAgICAgIGlmKHN1cHBvcnRlZFJldHVyblR5cGVzLmluZGV4T2YoYSkgIT09IC0xKXtcbiAgICAgICAgICAgIHJldHVyblR5cGUgPSBhO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIHBvc2l0aW9uLnB1c2goYSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vY2hlY2sgbnVtYmVyIG9mIGFyZ3VtZW50cyAtPiBlaXRoZXIgMSBudW1iZXIgb3IgNCBudW1iZXJzIGluIHBvc2l0aW9uLCBlLmcuIFsnYmFyc2JlYXRzJywgMV0gb3IgWydiYXJzYmVhdHMnLCAxLCAxLCAxLCAwXSxcbiAgICAgIC8vIG9yIFsncGVyYycsIDAuNTYsIG51bWJlck9mVGlja3NUb1NuYXBUb11cbiAgICAgIHBvc2l0aW9uTGVuZ3RoID0gcG9zaXRpb24ubGVuZ3RoO1xuICAgICAgaWYocG9zaXRpb25MZW5ndGggIT09IDIgJiYgcG9zaXRpb25MZW5ndGggIT09IDMgJiYgcG9zaXRpb25MZW5ndGggIT09IDUpe1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKHBvc2l0aW9uLCByZXR1cm5UeXBlLCBiZXlvbmRFbmRPZlNvbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQb3NpdGlvbihzb25nLCB0eXBlLCBhcmdzKXtcbiAgLy9jb25zb2xlLmxvZygnZ2V0UG9zaXRpb24nLCBhcmdzKTtcblxuICBpZih0eXBlb2YgYXJncyA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB7XG4gICAgICBtaWxsaXM6IDBcbiAgICB9XG4gIH1cblxuICBsZXQgcG9zaXRpb24gPSBjaGVja1Bvc2l0aW9uKHR5cGUsIGFyZ3MpLFxuICAgIG1pbGxpcywgdG1wLCBzbmFwO1xuXG5cbiAgaWYocG9zaXRpb24gPT09IGZhbHNlKXtcbiAgICBlcnJvcignd3JvbmcgcG9zaXRpb24gZGF0YScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN3aXRjaCh0eXBlKXtcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIGZyb21CYXJzKHNvbmcsIHBvc2l0aW9uWzFdLCBwb3NpdGlvblsyXSwgcG9zaXRpb25bM10sIHBvc2l0aW9uWzRdKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIC8vIGNhbGN1bGF0ZSBtaWxsaXMgb3V0IG9mIHRpbWUgYXJyYXk6IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcbiAgICAgIG1pbGxpcyA9IDA7XG4gICAgICB0bXAgPSBwb3NpdGlvblsxXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDYwICogNjAgKiAxMDAwOyAvL2hvdXJzXG4gICAgICB0bXAgPSBwb3NpdGlvblsyXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDYwICogMTAwMDsgLy9taW51dGVzXG4gICAgICB0bXAgPSBwb3NpdGlvblszXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDEwMDA7IC8vc2Vjb25kc1xuICAgICAgdG1wID0gcG9zaXRpb25bNF0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXA7IC8vbWlsbGlzZWNvbmRzXG5cbiAgICAgIGZyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHBvc2l0aW9uWzFdKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIGZyb21UaWNrcyhzb25nLCBwb3NpdGlvblsxXSk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICdwZXJjJzpcbiAgICBjYXNlICdwZXJjZW50YWdlJzpcbiAgICAgIHNuYXAgPSBwb3NpdGlvblsyXTtcblxuICAgICAgLy9taWxsaXMgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICAvL2Zyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzKTtcblxuICAgICAgdGlja3MgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25UaWNrcztcbiAgICAgIGlmKHNuYXAgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHRpY2tzID0gZmxvb3IodGlja3Mvc25hcCkgKiBzbmFwO1xuICAgICAgICAvL2Zyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGlja3MpO1xuICAgICAgfVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgdG1wID0gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZygnZGlmZicsIHBvc2l0aW9uWzFdIC0gdG1wLnBlcmNlbnRhZ2UpO1xuICAgICAgcmV0dXJuIHRtcDtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbiovXG5cbiIsImltcG9ydCB7XG4gIE1JRElFdmVudFxufSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmltcG9ydHtcbiAgTUlESU5vdGUsXG59IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnR7XG4gIFBhcnQsXG59IGZyb20gJy4vcGFydCdcblxuaW1wb3J0e1xuICBUcmFjayxcbn0gZnJvbSAnLi90cmFjaydcblxuaW1wb3J0IHtcbiAgU29uZyxcbn0gZnJvbSAnLi9zb25nJ1xuXG5pbXBvcnQge1xuICBJbnN0cnVtZW50LFxufSBmcm9tICcuL2luc3RydW1lbnQnXG5cbmltcG9ydCB7XG4gIHBhcnNlTUlESUZpbGVcbn0gZnJvbSAnLi9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgaW5pdCxcbn0gZnJvbSAnLi9pbml0J1xuXG5pbXBvcnQge1xuICBjb250ZXh0LFxuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZSxcbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5pbXBvcnQge1xuICBnZXRNSURJQWNjZXNzLFxuICBnZXRNSURJSW5wdXRzLFxuICBnZXRNSURJT3V0cHV0cyxcbiAgZ2V0TUlESUlucHV0SWRzLFxuICBnZXRNSURJT3V0cHV0SWRzLFxuICBnZXRNSURJSW5wdXRzQnlJZCxcbiAgZ2V0TUlESU91dHB1dHNCeUlkLFxufSBmcm9tICcuL2luaXRfbWlkaSdcblxuaW1wb3J0IHtcbiAgcGFyc2VTYW1wbGVzLFxufSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuXG5pbXBvcnQge1xuICBNSURJRXZlbnRUeXBlcyxcbn0gZnJvbSAnLi9jb25zdGFudHMnXG5cbmltcG9ydCB7XG4gIHNldEJ1ZmZlclRpbWUsXG59IGZyb20gJy4vc2V0dGluZ3MnXG5cblxuY29uc3QgZ2V0QXVkaW9Db250ZXh0ID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGNvbnRleHRcbn1cblxuY29uc3QgcWFtYmkgPSB7XG4gIHZlcnNpb246ICcxLjAuMC1iZXRhMScsXG5cbiAgLy8gZnJvbSAuL2luaXRcbiAgaW5pdCxcblxuICAvLyBmcm9tIC4vc2V0dGluZ3NcbiAgc2V0QnVmZmVyVGltZSxcblxuICAvLyBmcm9tIC4vY29uc3RhbnRzXG4gIE1JRElFdmVudFR5cGVzLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vbWlkaWZpbGVcbiAgcGFyc2VNSURJRmlsZSxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgTUlESUV2ZW50LFxuXG4gIC8vIGZyb20gLi9taWRpX25vdGVcbiAgTUlESU5vdGUsXG5cbiAgLy8gZnJvbSAuL3NvbmdcbiAgU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgVHJhY2ssXG5cbiAgLy8gZnJvbSAuL3BhcnRcbiAgUGFydCxcblxuICAvLyBmcm9tIC4vaW5zdHJ1bWVudFxuICBJbnN0cnVtZW50LFxuXG4gIGxvZyhpZCl7XG4gICAgc3dpdGNoKGlkKXtcbiAgICAgIGNhc2UgJ2Z1bmN0aW9ucyc6XG4gICAgICAgIGNvbnNvbGUubG9nKGBmdW5jdGlvbnM6XG4gICAgICAgICAgZ2V0QXVkaW9Db250ZXh0XG4gICAgICAgICAgZ2V0TWFzdGVyVm9sdW1lXG4gICAgICAgICAgc2V0TWFzdGVyVm9sdW1lXG4gICAgICAgICAgZ2V0TUlESUFjY2Vzc1xuICAgICAgICAgIGdldE1JRElJbnB1dHNcbiAgICAgICAgICBnZXRNSURJT3V0cHV0c1xuICAgICAgICAgIGdldE1JRElJbnB1dElkc1xuICAgICAgICAgIGdldE1JRElPdXRwdXRJZHNcbiAgICAgICAgICBnZXRNSURJSW5wdXRzQnlJZFxuICAgICAgICAgIGdldE1JRElPdXRwdXRzQnlJZFxuICAgICAgICAgIHBhcnNlTUlESUZpbGVcbiAgICAgICAgICBzZXRCdWZmZXJUaW1lXG4gICAgICAgIGApXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfSxcbn1cblxuZXhwb3J0IGRlZmF1bHQgcWFtYmlcblxuZXhwb3J0IHtcbiAgLy8gZnJvbSAuL2luaXRcbiAgaW5pdCxcblxuICAvLyBmcm9tIC4vc2V0dGluZ3NcbiAgc2V0QnVmZmVyVGltZSxcblxuICAvLyBmcm9tIC4vY29uc3RhbnRzXG4gIE1JRElFdmVudFR5cGVzLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vbWlkaWZpbGVcbiAgcGFyc2VNSURJRmlsZSxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgTUlESUV2ZW50LFxuXG4gIC8vIGZyb20gLi9taWRpX25vdGVcbiAgTUlESU5vdGUsXG5cbiAgLy8gZnJvbSAuL3NvbmdcbiAgU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgVHJhY2ssXG5cbiAgLy8gZnJvbSAuL3BhcnRcbiAgUGFydCxcblxuICAvLyBmcm9tIC4vaW5zdHJ1bWVudFxuICBJbnN0cnVtZW50LFxufVxuIiwiaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8uanMnXG5pbXBvcnQge2dldEVxdWFsUG93ZXJDdXJ2ZX0gZnJvbSAnLi91dGlsLmpzJ1xuXG5cbmNsYXNzIFNhbXBsZXtcblxuICBjb25zdHJ1Y3RvcihzYW1wbGVEYXRhLCBldmVudCl7XG4gICAgdGhpcy5ldmVudCA9IGV2ZW50XG4gICAgdGhpcy5zYW1wbGVEYXRhID0gc2FtcGxlRGF0YVxuXG4gICAgaWYodGhpcy5zYW1wbGVEYXRhID09PSAtMSB8fCB0eXBlb2YgdGhpcy5zYW1wbGVEYXRhLmJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgLy8gY3JlYXRlIHNpbXBsZSBzeW50aCBzYW1wbGVcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICB0aGlzLnNvdXJjZS50eXBlID0gJ3NpbmUnO1xuICAgICAgdGhpcy5zb3VyY2UuZnJlcXVlbmN5LnZhbHVlID0gZXZlbnQuZnJlcXVlbmN5XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgIHRoaXMuc291cmNlLmJ1ZmZlciA9IHNhbXBsZURhdGEuYnVmZmVyO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvdXJjZS5idWZmZXIpXG4gICAgfVxuICAgIHRoaXMub3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLnZvbHVtZSA9IGV2ZW50LmRhdGEyIC8gMTI3XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5zb3VyY2UuY29ubmVjdCh0aGlzLm91dHB1dClcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgfVxuXG4gIHN0YXJ0KHRpbWUpe1xuICAgIC8vY29uc29sZS5sb2codGltZSwgdGhpcy5zb3VyY2UpO1xuICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBjYil7XG4gICAgbGV0IHtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZSwgcmVsZWFzZUVudmVsb3BlQXJyYXl9ID0gdGhpcy5zYW1wbGVEYXRhXG4gICAgaWYocmVsZWFzZUR1cmF0aW9uICYmIHJlbGVhc2VFbnZlbG9wZSl7XG4gICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUgKyByZWxlYXNlRHVyYXRpb24pXG4gICAgICBmYWRlT3V0KHRoaXMub3V0cHV0LCB7XG4gICAgICAgIHJlbGVhc2VEdXJhdGlvbixcbiAgICAgICAgcmVsZWFzZUVudmVsb3BlLFxuICAgICAgICByZWxlYXNlRW52ZWxvcGVBcnJheSxcbiAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUpO1xuICAgIH1cblxuICAgIHRoaXMuc291cmNlLm9uZW5kZWQgPSBjYjtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBmYWRlT3V0KGdhaW5Ob2RlLCBzZXR0aW5ncyl7XG4gIGxldCBub3cgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gIGxldCB2YWx1ZXMsIGksIG1heGlcblxuICAvL2NvbnNvbGUubG9nKHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZSlcbiAgc3dpdGNoKHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZSl7XG5cbiAgICBjYXNlICdsaW5lYXInOlxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluTm9kZS5nYWluLnZhbHVlLCBub3cpXG4gICAgICBnYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIG5vdyArIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdlcXVhbF9wb3dlcic6XG4gICAgICB2YWx1ZXMgPSBnZXRFcXVhbFBvd2VyQ3VydmUoMTAwLCAnZmFkZU91dCcsIGdhaW5Ob2RlLmdhaW4udmFsdWUpXG4gICAgICBnYWluTm9kZS5nYWluLnNldFZhbHVlQ3VydmVBdFRpbWUodmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdhcnJheSc6XG4gICAgICBtYXhpID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXkubGVuZ3RoXG4gICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1heGkpXG4gICAgICBmb3IoaSA9IDA7IGkgPCBtYXhpOyBpKyspe1xuICAgICAgICB2YWx1ZXNbaV0gPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheVtpXSAqIGdhaW5Ob2RlLmdhaW4udmFsdWVcbiAgICAgIH1cbiAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVDdXJ2ZUF0VGltZSh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2FtcGxlKC4uLmFyZ3Mpe1xuICByZXR1cm4gbmV3IFNhbXBsZSguLi5hcmdzKVxufVxuXG5cbiIsImNvbnN0IHNhbXBsZXMgPSB7XG4gIGVtcHR5T2dnOiAnVDJkblV3QUNBQUFBQUFBQUFBQmR4ZDRYQUFBQUFEYVMwalFCSGdGMmIzSmlhWE1BQUFBQUFVU3NBQUFBQUFBQWdMc0FBQUFBQUFDNEFVOW5aMU1BQUFBQUFBQUFBQUFBWGNYZUZ3RUFBQUFhWEsrUUR6My8vLy8vLy8vLy8vLy8vLy8vTWdOMmIzSmlhWE10QUFBQVdHbHdhQzVQY21jZ2JHbGlWbTl5WW1seklFa2dNakF4TURFeE1ERWdLRk5qYUdGMVptVnVkV2RuWlhRcEFBQUFBQUVGZG05eVltbHpIMEpEVmdFQUFBRUFHR05VS1VhWlV0SktpUmx6bERGR21XS1NTb21saEJaQ1NKMXpGRk9wT2RlY2E2eTV0U0NFRUJwVFVDa0ZtVktPVW1rWlk1QXBCWmxTRUV0SkpYUVNPaWVkWXhCYlNjSFdtR3VMUWJZY2hBMmFVa3dweEpSU2lrSUlHVk9NS2NXVVVrcENCeVYwRGpybUhGT09TaWhCdUp4enE3V1dsbU9McVhTU1N1Y2taRXhDU0NtRmtrb0hwVk5PUWtnMWx0WlNLUjF6VWxKcVFlZ2doQkJDdGlDRURZTFFrRlVBQUFFQXdFQVFHcklLQUZBQUFCQ0tvUmlLQW9TR3JBSUFNZ0FBQktBb2p1SW9qaU01a21OSkZoQWFzZ29BQUFJQUVBQUF3SEFVU1pFVXliRWtTOUlzUzlORVVWVjkxVFpWVmZaMVhkZDFYZGQxSURSa0ZRQUFBUUJBU0tlWnBSb2d3Z3hrR0FnTldRVUFJQUFBQUVZb3doQURRa05XQVFBQUFRQUFZaWc1aUNhMDVueHpqb05tT1dncXhlWjBjQ0xWNWtsdUt1Ym1uSFBPT1NlYmM4WTQ1NXh6aW5KbU1XZ210T2FjY3hLRFppbG9KclRtbkhPZXhPWkJhNnEwNXB4enhqbW5nM0ZHR09lY2M1cTA1a0ZxTnRibW5ITVd0S1k1YWk3RjVweHpJdVhtU1cwdTFlYWNjODQ1NTV4enpqbm5uSE9xRjZkemNFNDQ1NXh6b3ZibVdtNUNGK2VjY3o0WnAzdHpRampubkhQT09lZWNjODQ1NTV4emd0Q1FWUUFBRUFBQVFSZzJobkduSUVpZm80RVlSWWhweUtRSDNhUERKR2dNY2dxcFI2T2prVkxxSUpSVXhra3BuU0EwWkJVQUFBZ0FBQ0dFRkZKSUlZVVVVa2doaFJSU2lDR0dHR0xJS2FlY2dnb3FxYVNpaWpMS0xMUE1Nc3Nzczh3eTY3Q3p6anJzTU1RUVF3eXR0QkpMVGJYVldHT3R1ZWVjYXc3U1dtbXR0ZFpLS2FXVVVrb3BDQTFaQlFDQUFBQVFDQmxra0VGR0lZVVVVb2docHB4eXlpbW9vQUpDUTFZQkFJQUFBQUlBQUFBOHlYTkVSM1JFUjNSRVIzUkVSM1JFeDNNOFI1UkVTWlJFU2JSTXk5Uk1UeFZWMVpWZFc5WmwzZlp0WVJkMjNmZDEzL2QxNDllRllWbVdaVm1XWlZtV1pWbVdaVm1XWlZtQzBKQlZBQUFJQUFDQUVFSUlJWVVVVWtnaHBSaGp6REhub0pOUVFpQTBaQlVBQUFnQUlBQUFBTUJSSE1WeEpFZHlKTW1TTEVtVE5FdXpQTTNUUEUzMFJGRVVUZE5VUlZkMFJkMjBSZG1VVGRkMFRkbDBWVm0xWFZtMmJkbldiVitXYmQvM2ZkLzNmZC8zZmQvM2ZkLzNkUjBJRFZrRkFFZ0FBT2hJanFSSWlxUklqdU00a2lRQm9TR3JBQUFaQUFBQkFDaUtvemlPNDBpU0pFbVdwRW1lNVZtaVptcW1aM3FxcUFLaElhc0FBRUFBQUFFQUFBQUFBQ2lhNGltbTRpbWk0am1pSTBxaVpWcWlwbXF1S0p1eTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdvdUVCcXlDZ0NRQUFEUWtSekprUnhKa1JSSmtSekpBVUpEVmdFQU1nQUFBZ0J3RE1lUUZNbXhMRXZUUE0zVFBFMzBSRS8wVEU4VlhkRUZRa05XQVFDQUFBQUNBQUFBQUFBd0pNTlNMRWR6TkVtVVZFdTFWRTIxVkVzVlZVOVZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVMVRkTTBUU0EwWkNVQUFBUUF3R0tOd2VVZ0lTVWw1ZDRRd2hDVG5qRW1JYlZlSVFTUmt0NHhCaFdEbmpLaURITGVRdU1RZ3g0SURWa1JBRVFCQUFER0lNY1FjOGc1UjZtVEVqbm5xSFNVR3VjY3BZNVNaeW5GbUdMTktKWFlVcXlOYzQ1U1I2MmpsR0lzTFhhVVVvMnB4Z0lBQUFJY0FBQUNMSVJDUTFZRUFGRUFBSVF4U0Nta0ZHS01PYWVjUTR3cDU1aHpoakhtSEhPT09lZWdkRklxNTV4MFRrckVHSE9PT2FlY2MxSTZKNVZ6VGtvbm9RQUFnQUFIQUlBQUM2SFFrQlVCUUp3QWdFR1NQRS95TkZHVU5FOFVSVk4wWFZFMFhkZnlQTlgwVEZOVlBkRlVWVk5WYmRsVVZWbVdQTTgwUGROVVZjODBWZFZVVlZrMlZWV1dSVlhWYmROMWRkdDBWZDJXYmR2M1hWc1dkbEZWYmQxVVhkczNWZGYyWGRuMmZWbldkV1B5UEZYMVROTjFQZE4wWmRWMWJWdDFYVjMzVEZPV1RkZVZaZE4xYmR1VlpWMTNaZG4zTmROMFhkTlZaZGwwWGRsMlpWZTNYVm4yZmROMWhkK1ZaVjlYWlZrWWRsMzNoVnZYbGVWMFhkMVhaVmMzVmxuMmZWdlhoZUhXZFdHWlBFOVZQZE4wWGM4MFhWZDFYVjlYWGRmV05kT1VaZE4xYmRsVVhWbDJaZG4zWFZmV2RjODBaZGwwWGRzMlhWZVdYVm4yZlZlV2RkMTBYVjlYWlZuNFZWZjJkVm5YbGVIV2JlRTNYZGYzVlZuMmhWZVdkZUhXZFdHNWRWMFlQbFgxZlZOMmhlRjBaZC9YaGQ5WmJsMDRsdEYxZldHVmJlRllaVms1ZnVGWWx0MzNsV1YwWFY5WWJka1lWbGtXaGwvNG5lWDJmZU40ZFYwWmJ0M256THJ2RE1mdnBQdkswOVZ0WTVsOTNWbG1YM2VPNFJnNnYvRGpxYXF2bTY0ckRLY3NDNy90Njhheis3NnlqSzdyKzZvc0M3OHEyOEt4Njc3ei9MNndMS1BzK3NKcXk4S3cycll4M0w1dUxMOXdITXRyNjhveDY3NVJ0blY4WDNnS3cvTjBkVjE1WmwzSDluVjA0MGM0ZnNvQUFJQUJCd0NBQUJQS1FLRWhLd0tBT0FFQWp5U0pvbVJab2loWmxpaUtwdWk2b21pNnJxUnBwcWxwbm1sYW1tZWFwbW1xc2ltYXJpeHBtbWxhbm1hYW1xZVpwbWlhcm11YXBxeUtwaW5McG1yS3NtbWFzdXk2c20yN3JtemJvbW5Lc21tYXNteWFwaXk3c3F2YnJ1enF1cVJacHFsNW5tbHFubWVhcG1yS3NtbWFycXQ1bm1wNm5taXFuaWlxcW1xcXFxMnFxaXhibm1lYW11aXBwaWVLcW1xcXBxMmFxaXJMcHFyYXNtbXF0bXlxcW0yN3F1ejZzbTNydW1tcXNtMnFwaTJicW1yYnJ1enFzaXpidWk5cG1tbHFubWVhbXVlWnBtbWFzbXlhcWl0Ym5xZWFuaWlxcXVhSnBtcXFxaXlicHFyS2x1ZVpxaWVLcXVxSm5tdWFxaXJMcG1yYXFtbWF0bXlxcWkyYnBpckxybTM3dnV2S3NtNnFxbXlicW1ycnBtcktzbXpMdnUvS3F1NktwaW5McHFyYXNtbXFzaTNic3UvTHNxejdvbW5Lc21tcXNtMnFxaTdMc20wYnMyejd1bWlhc20ycXBpMmJxaXJic2kzN3VpemJ1dS9Lcm0rcnFxenJzaTM3dXU3NnJuRHJ1akM4c216N3FxejZ1aXZidW0vck10djJmVVRUbEdWVE5XM2JWRlZaZG1YWjltWGI5bjNSTkcxYlZWVmJOazNWdG1WWjluMVp0bTFoTkUzWk5sVlYxazNWdEcxWmxtMWh0bVhoZG1YWnQyVmI5blhYbFhWZjEzM2oxMlhkNXJxeTdjdXlyZnVxcS9xMjd2dkNjT3V1OEFvQUFCaHdBQUFJTUtFTUZCcXlFZ0NJQWdBQWpHR01NUWlOVXM0NUI2RlJ5am5uSUdUT1FRZ2hsY3c1Q0NHVWtqa0hvWlNVTXVjZ2xKSlNDS0dVbEZvTElaU1VVbXNGQUFBVU9BQUFCTmlnS2JFNFFLRWhLd0dBVkFBQWcrTllsdWVab21yYXNtTkpuaWVLcXFtcXR1MUlsdWVKb21tcXFtMWJuaWVLcHFtcXJ1dnJtdWVKb21tcXF1dnF1bWlhcHFtcXJ1dTZ1aTZhb3FtcXF1dTZzcTZicHFxcXJpdTdzdXpycHFxcXF1dktyaXo3d3FxNnJpdkxzbTNyd3JDcXJ1dktzbXpidG0vY3VxN3J2dS83d3BHdDY3b3UvTUl4REVjQkFPQUpEZ0JBQlRhc2puQlNOQlpZYU1oS0FDQURBSUF3QmlHREVFSUdJWVNRVWtvaHBaUVNBQUF3NEFBQUVHQkNHU2cwWkVVQUVDY0FBQmhES2FTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKSUthV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS3FhU1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0taVlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWdvQWtJcHdBSkI2TUtFTUZCcXlFZ0JJQlFBQWpGRktLY2FjZ3hBeDVoaGowRWtvS1dMTU9jWWNsSkpTNVJ5RUVGSnBMYmZLT1FnaHBOUlNiWmx6VWxxTE1lWVlNK2VrcEJSYnpUbUhVbEtMc2VhYWErNmt0RlpycmpYbldscXJOZGVjYzgyNXRCWnJyam5YbkhQTE1kZWNjODQ1NXhoenpqbm5uSFBPQlFEZ05EZ0FnQjdZc0RyQ1NkRllZS0VoS3dHQVZBQUFBaG1sR0hQT09lZ1FVb3c1NXh5RUVDS0ZHSFBPT1FnaFZJdzU1eHgwRUVLb0dIUE1PUWdoaEpBNTV4eUVFRUlJSVhNT091Z2doQkJDQngyRUVFSUlvWlRPUVFnaGhCQktLQ0dFRUVJSUlZUVFPZ2doaEJCQ0NDR0VFRUlJSVlSU1NnZ2hoQkJDQ2FHVVVBQUFZSUVEQUVDQURhc2puQlNOQlJZYXNoSUFBQUlBZ0J5V29GTE9oRUdPUVk4TlFjcFJNdzFDVERuUm1XSk9hak1WVTVBNUVKMTBFaGxxUWRsZU1nc0FBSUFnQUNEQUJCQVlJQ2o0UWdpSU1RQUFRWWpNRUFtRlZiREFvQXdhSE9ZQndBTkVoRVFBa0ppZ1NMdTRnQzREWE5ERlhRZENDRUlRZ2xnY1FBRUpPRGpoaGlmZThJUWJuS0JUVk9vZ0FBQUFBQUFNQU9BQkFPQ2dBQ0lpbXF1d3VNREkwTmpnNlBBSUFBQUFBQUFXQVBnQUFEZytnSWlJNWlvc0xqQXlORFk0T2p3Q0FBQUFBQUFBQUFDQWdJQUFBQUFBQUVBQUFBQ0FnRTluWjFNQUJBRUFBQUFBQUFBQVhjWGVGd0lBQUFCcTJucHhBZ0VCQUFvPScsXG4gIGVtcHR5TXAzOiAnLy9zUXhBQUR3QUFCcEFBQUFDQUFBRFNBQUFBRVRFRk5SVE11T1RrdU5WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVT0nLFxuICBoaWdodGljazogJ1VrbEdSa1FGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZU0FGQUFDeC94Zi9kQURPQUN3QnNQM3ArNkgrekFHb0JPa0NDd0JYL0VINU92eGxBNGtKMndjU0FyVDlFL3V0K0hUMmV2VXg5OG42T0FGNUNDVU13UXZmQ09zSnhBeDBEU0lNRUFxOUJpQUIzdmh6N21Ma1Q5c1IxMzNZeE4yczVRTHYwdnJVQm53Um54dVFKZUVzU0RDaU1kOHlGUzhhS0ZJaG9oVXNDS2o2NHU2MjVPcmFBOUh1eVBuRWxjUCt3eHZKV3RXMjU2MzdWUTBqSFBnbkJURERNMW8wQ3pLTEsrOGh6aGdGRE96OFNlNEo0N0RZVnRHMHo1ZlFxOUxCMTJyZkErajk5cm9IQWhlbEl5TXdJamRUT3VVOG1qd0lPR294aENiNUU1My9qKzNrMy9mVFk4cFR3NHkvVHIrZXc4RE12ZHNrOFJjSFJSa1NLTzR5R1RrSFBrVS9yenp5TmNnc3JSOTREcC81citaczE3ek9uY29EeGhmRTM4V0x5bi9UZU9NaTlyMElSeGxSS0lRenlUbE9QS285eWptV01jb2tEUkxjL1k3cnVkdGR6dS9EMkwxSXUrMjdKY0czeVlyVkx1amwrM1VPWngxVUs1UTBxem1OUERrOFpqZWVNUG9qemhIKy9qTHRQZDVtMGhITEhzWUl3NVRFTU1uQTBqdmo4ZlNPQml3WEFTWmdNek04ZFVCR1FiSStyempwS2tJWnlnWlQ5UWZsY2RhUnlxWEN6NytWd1VQSDc4NHIzSzdzK3YwS0R1OGJ2eWVMTWI0M05qcmhPSW8wZFN2UUhpMFBuUDZpN292ZzNOVHh5NC9HZjhYOHlIL1FCdHZYNTVQMllnYjBGY1Vqc3k0TE5tSTVlamlYTTM4cjdpQzhGSndIUHZvazdkRGdRZGFKemxUS0lzb0Z6c3JWa3VBODdkLzZxQWk3RlEwaDlDbEtNTEV6M1RPck1CY3FZU0Q4RTlBRmQvZFM2a1RmNmRiVTBYblF2OUlIMk1YZlorbG45REVBRnd3ZEZ5OGdpaWI2S2F3cWVDaGdJL1ViSEJPVENaai92dlhlN0lubEZ1RE4zUDNiMGQxRjRnenBpZkcyK3U0RDdRdzFGZndibkNEK0lsZ2pXeUhMSFBNVm9nMm1CTDM3cXZQKzdOdm5ZdVR2NHJ2amZ1Yk42azN3cFBaMC9Xa0VPd3RpRVVzV2N4bStHbDRhT2hoaUZEQVBJd21iQXRuN1RQVnk3N3pxY2VmcjVZSG1IdWxsN2VueWZQbWNBSGdIZXcxUkVyOFZoaGQvRitBVjFSSjBEaWtKV1FOYy9aUDNlZktkN2h2czJ1cjQ2ckhzNXU4ZTlOLzQ4LzBoQS84SEZnd3VEMDRSU0JJUkVxc1FPZzdtQ3NzR01BSlcvWG40Ry9USzhMYnV6dTBJN3FUdm5QSnk5c1g2YlA4NEJMWUliQXdkRDg0UVl4RzdFT2NPREF4d0NGTUVBUUM5KzdQM1N2VFg4WEh3K3U5UjhLVHhJdlNvOStYN1ZRQ1VCSjBJTXd6aURqNFFMaEFHRDlVTXJnblRCWmNCUnYxditYdjJVZlMrOHRmeCt2RVM4N3owK3ZiMytaZjlaZ0VRQlNFSVVBcldDOGtNMlF5ekM1RUpFQWR2QkhnQlhQNW4rK3I0QXZkODlXajA3Zk13OUQzMUp2ZnArVWo5eFFEOUE4UUc1UWhYQ2xFTHJBc3ZDOXdKN2dkNkJXSUMzdjZPKzdUNFBQWk45RUh6V3ZOZjlQejFGdml0K3FMOXJRQ0hBd0VHL3dlQ0NaVUtGd3ZEQ25JSmNBY1FCV2NDYWY4Wi9DRDU1dmFCOWREMHdQU1A5VUwzbS9rNy9NeitKd0V5QXc4RnpBWTdDQnNKYVFrNUNXa0kyZ2F0QkNJQ1lmK2ovRnI2dmZpVjk4NzJzZlpQOTF6NHAvbFIrM0g5emY4OUFyb0VGQWZqQ1AwSmN3bzhDakFKZFFkZ0JTRURrZ0RRL1ZqN1pmblI5NVQyOGZVZDl2MzJWdmcyK25iOCsvNnhBV29FNEFiRENQNEpwQXFiQ3FRSjB3ZUVCZmdDVEFDVC9SMzdNL20rOTY3MklQWTY5Z2IzYWZoVyt0VDhxZitNQWowRmdnY3VDU2NLWEFyaUNjTUlFQWZ5QkpZQ0Z3Q1AvUno3QS9sNzkzejJGL1puOW1IMzdmamQraTM5eWY5cEF0MEVGQWZSQ05rSkdBcXJDWllJdmdaUEJKOEI2UDQvL00zNTB2ZHo5cS8xbGZVcTltejNSUG1pKzNIK2JnRlZCT1FHM3dnSENrd0swQW03Q0NBSENnV21BakFBJyxcbiAgbG93dGljazogJ1VrbEdSbFFGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZVEFGQUFCMC81ditVLzRULzNnQTB3RlRBdVVCK2Y4ZC9uVDkwZjFxL3ViK3RmNDYvbWIvOHdGUUE5Z0M3d0NkL21yK0ZBR1JBM2NFNndKZi9oMzZldm12Kzh2L053UkhCWlVDMi82MCsvLzVFdnVaL2FYL2JnRk9BcDhBenZ6aDl3ZnpMUEY2OHpUNHkvMkJBeWdJZlF3YUVqWVkweDMxSXJ3bDhTT1dIVkVTT2dQaDlOZnBSZUZ0MjJuWUhkZEQyQlhjWmVEYTVJbnFnUER4OW5QKzZnUzRDQllMbncwekVTMFdYeHY0SGtjZ0xoLzFHK0VYMVJOcEQ0d0tpZ1hILzZyNS9mTnU3bFRwaitadTVoSG9YT3RMNzFieXIvUXA5MUw2NHY2T0JPNEpvUTV6RXNrVStoVTFGaVFWZVJQN0VXZ1A0UXIwQklUK3RQaWQ5QzN5MXZDaDhGRHhKdksyOHZ2eXkvTEE4cEx6VS9YUDk1djZ4dnc0L3VEL1JBSzJCU2tLY2c2QkVTY1RaQk1lRXFrUFRReGpDS0VFVndGaS9udjdoL2hwOWFEeUF2SFA4TWZ4THZNKzlQWDB1UFcxOWcvNExmcjcvQzRBS2dOYUJYUUd5d2IwQmhJSFdRZldCMW9JekFqdENGOElId2R0QmFrRFZ3S0xBZVlBOHY5dy9rajgxL25ROTR2MjkvWFg5YnoxYlBVWTlVejFaL2FIK0hyN3lQNE1BaTRGK3djZkNuWUxOZ3lmRFBzTVN3MHNEVUFNZmdyY0I1SUVNd0ZiL2lYOFQvcFQrTy8xWC9NZjhjYnZyTysxOE1MeXZmVlArUmY5d2dBb0JDRUhwd25JQzVFTjRRNUFEM3dPMUF5MENwc0l2d2J2Qk5jQ2JRQXIvblg4T2ZzZit2YjRtdmRhOXJqMXovV1g5cEwzYS9oSCtaWDZSL3duL3ZQL2VRRVNBL0FFK3dZRENjd0tGQXlQRENrTUZRdVNDZTRIVlFiU0JIUURDd0k4QU5MOUpQdVkrSFgyOHZUcTgyUHpkUE1WOUF6MU1mWjQ5ekQ1Z2Z0eC9zUUJCUVhMQjhjSi9ncXBDdzhNaWd3V0RYRU5YUTJyRERVTDdRZ0RCc3dDZHY4Uy9LNzRXUFZrOGhYd291NFA3bXZ1MSs5VDhwejFVdmxpL1pvQndnV1JDY3NNUGcvQ0VFUVI0UkRBRHdvTzl3dXNDVk1INEFSU0Fwbi91ZnpkK1dqM2J2WDc4eHp6eC9MNjhxenoxdlNEOXFYNEdmdmQvYzBBaHdPL0JXd0htZ2h2Q1FFS1ZRb25DbHNKQ3dpSUJoMEYwZ09nQW0wQk93QXgvMDMrWFAwZy9MYjZjUG1YK0YvNHZmaCsrVEg2cy9vcys3LzdjdndML1p6OVhQNU8vM0lBM0FGOUF6c0Y5Z2FVQ0FBS0hndWVDemNMOXdudEIzc0Y0d0l6QUkzOTZmcDErR3YySXZXbjlOMzBwL1hpOW03NEcvcnUrOVA5ay84YUFZRUMxQU1UQlNJRzB3WXVCMWdIa2djQUNHRUlTQWhUQnpFRldBS3QvNUw5MmZ1VSt2WDUwZm1mK1NQNWkvZ2IrQmY0bXZpditTcjdrdnliL1VqK3IvNFgvOHIvK2dDaUFvMEVVQWFSQnp3SVN3anFCM0lIR1FmQ0J2OEZwZ1RNQXBRQUtmNjcrNW41L3ZmbjlqejJ5UFZuOVNMMVJQWHE5U1AzRHZtcis2ZitzUUdLQkFjSCt3aE9DaDBMYXdzM0MyOEtMQW1EQjVBRmZRTm9BVlAvWnYzZSs3UDZzZm5MK0N2NHZQZU05NWIzN2ZlVitKbjUxUG9xL0xMOW12K1lBVllEM2dRdUJtY0hTQWlrQ0lFSTdBZitCdUVGbmdRWEExc0J2Lzl2L3BmOU1QM1cvRmo4cS9zUis2SDZVL28zK21QNnkvcE4rL2Y3eHZ5ZS9XSCtKZjltQUQ0Q1FBUUpCaXNIdGdmNkJ3MEk4UWRzQjFzR3l3VDRBZ2dCQ1Avby9LWDZtUGcxOTU3MmpmYXo5dWYyUy9jTStFMzVFL3RXL2FmLzV3SDFBOEFGS2dma0IvQUhnd2Z4QmxBR2dRVklCTU1DSndHcy80Myt2UDBpL1pyOExmemwrOUg3NmZ2aSs5Zjc1ZnNmL0luOEJQMTAvZWo5Y2Y0Ty83Zi9kQUFjQWFVQkVnS01BaGdEcEFNRUJDRUVEd1RmQTNJRHhRTDhBU29CVXdDRy84NytKLzZoL1JyOXBQeGsvR2I4b1B3Si9YSDl3LzM5L1VEK3FQNDEvOUQvV3dEZUFHc0JBZ0tkQWhFRFFRTkFBMHNEYndPVkE1WURWd1BPQWhnQ1ZBR1JBQT09Jyxcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2FtcGxlc1xuIiwiaW1wb3J0IHtnZXRNSURJT3V0cHV0QnlJZCwgZ2V0TUlESU91dHB1dHN9IGZyb20gJy4vaW5pdF9taWRpJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtidWZmZXJUaW1lfSBmcm9tICcuL3NldHRpbmdzJyAvLyBtaWxsaXNcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXJ7XG5cbiAgY29uc3RydWN0b3Ioc29uZyl7XG4gICAgdGhpcy5zb25nID0gc29uZ1xuICB9XG5cblxuICBpbml0KG1pbGxpcyl7XG4gICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyA9IG1pbGxpc1xuICAgIHRoaXMuc29uZ1N0YXJ0TWlsbGlzID0gbWlsbGlzXG4gICAgdGhpcy5ldmVudHMgPSB0aGlzLnNvbmcuX2FsbEV2ZW50c1xuICAgIHRoaXMubnVtRXZlbnRzID0gdGhpcy5ldmVudHMubGVuZ3RoXG4gICAgdGhpcy5pbmRleCA9IDBcbiAgICB0aGlzLm1heHRpbWUgPSAwXG4gICAgdGhpcy5wcmV2TWF4dGltZSA9IDBcbiAgICB0aGlzLmJleW9uZExvb3AgPSBmYWxzZSAvLyB0ZWxscyB1cyBpZiB0aGUgcGxheWhlYWQgaGFzIGFscmVhZHkgcGFzc2VkIHRoZSBsb29wZWQgc2VjdGlvblxuICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZ1N0YXJ0TWlsbGlzKVxuICB9XG5cblxuICBzZXRUaW1lU3RhbXAodGltZVN0YW1wKXtcbiAgICB0aGlzLnRpbWVTdGFtcCA9IHRpbWVTdGFtcFxuICB9XG5cbiAgLy8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgZXZlbnQgdGhhdCBoYXMgaXRzIG1pbGxpcyB2YWx1ZSBhdCBvciByaWdodCBhZnRlciB0aGUgcHJvdmlkZWQgbWlsbGlzIHZhbHVlXG4gIHNldEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvcihsZXQgZXZlbnQgb2YgdGhpcy5ldmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgICAgIHRoaXMuaW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gICAgdGhpcy5iZXlvbmRMb29wID0gbWlsbGlzID4gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgdGhpcy5ub3RlcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKCl7XG4gICAgbGV0IGV2ZW50cyA9IFtdXG5cbiAgICBpZih0aGlzLnNvbmcuX2xvb3AgPT09IHRydWUgJiYgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gPCBidWZmZXJUaW1lKXtcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ1N0YXJ0TWlsbGlzICsgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gLSAxXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5zb25nLmxvb3BEdXJhdGlvbik7XG4gICAgfVxuXG4gICAgaWYodGhpcy5zb25nLl9sb29wID09PSB0cnVlKXtcblxuICAgICAgaWYodGhpcy5tYXh0aW1lID49IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAmJiB0aGlzLmJleW9uZExvb3AgPT09IGZhbHNlKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnTE9PUCcsIHRoaXMubWF4dGltZSwgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKVxuXG4gICAgICAgIGxldCBkaWZmID0gdGhpcy5tYXh0aW1lIC0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzICsgZGlmZlxuXG4gICAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS1MT09QRUQnLCB0aGlzLm1heHRpbWUsIGRpZmYsIHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzLCB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMpO1xuXG4gICAgICAgIGlmKHRoaXMubG9vcGVkID09PSBmYWxzZSl7XG4gICAgICAgICAgdGhpcy5sb29wZWQgPSB0cnVlO1xuICAgICAgICAgIGxldCBsZWZ0TWlsbGlzID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXNcbiAgICAgICAgICBsZXQgcmlnaHRNaWxsaXMgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXNcblxuICAgICAgICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgICAgICAgIGxldCBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHJpZ2h0TWlsbGlzKXtcbiAgICAgICAgICAgICAgZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpXG5cbiAgICAgICAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGVzLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50LnR5cGUpXG4gICAgICAgICAgICAgIHRoaXMuaW5kZXgrK1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gc3RvcCBvdmVyZmxvd2luZyBub3Rlcy0+IGFkZCBhIG5ldyBub3RlIG9mZiBldmVudCBhdCB0aGUgcG9zaXRpb24gb2YgdGhlIHJpZ2h0IGxvY2F0b3IgKGVuZCBvZiB0aGUgbG9vcClcbiAgICAgICAgICBsZXQgZW5kVGlja3MgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci50aWNrcyAtIDFcbiAgICAgICAgICBsZXQgZW5kTWlsbGlzID0gdGhpcy5zb25nLmNhbGN1bGF0ZVBvc2l0aW9uKHt0eXBlOiAndGlja3MnLCB0YXJnZXQ6IGVuZFRpY2tzLCByZXN1bHQ6ICdtaWxsaXMnfSkubWlsbGlzXG5cbiAgICAgICAgICBmb3IobGV0IG5vdGUgb2YgdGhpcy5ub3Rlcy52YWx1ZXMoKSl7XG4gICAgICAgICAgICBsZXQgbm90ZU9uID0gbm90ZS5ub3RlT25cbiAgICAgICAgICAgIGxldCBub3RlT2ZmID0gbm90ZS5ub3RlT2ZmXG4gICAgICAgICAgICBpZihub3RlT2ZmLm1pbGxpcyA8PSByaWdodE1pbGxpcyl7XG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZXZlbnQgPSBuZXcgTUlESUV2ZW50KGVuZFRpY2tzLCAxMjgsIG5vdGVPbi5kYXRhMSwgMClcbiAgICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IGVuZE1pbGxpc1xuICAgICAgICAgICAgZXZlbnQuX3BhcnQgPSBub3RlT24uX3BhcnRcbiAgICAgICAgICAgIGV2ZW50Ll90cmFjayA9IG5vdGVPbi5fdHJhY2tcbiAgICAgICAgICAgIGV2ZW50Lm1pZGlOb3RlID0gbm90ZVxuICAgICAgICAgICAgZXZlbnQubWlkaU5vdGVJZCA9IG5vdGUuaWRcbiAgICAgICAgICAgIGV2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdhZGRlZCcsIGV2ZW50KVxuICAgICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgICAgfVxuXG4vKlxuICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgYXVkaW8gc2FtcGxlc1xuICAgICAgICAgIGZvcihpIGluIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHMpe1xuICAgICAgICAgICAgaWYodGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cy5oYXNPd25Qcm9wZXJ0eShpKSl7XG4gICAgICAgICAgICAgIGF1ZGlvRXZlbnQgPSB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzW2ldO1xuICAgICAgICAgICAgICBpZihhdWRpb0V2ZW50LmVuZE1pbGxpcyA+IHRoaXMuc29uZy5sb29wRW5kKXtcbiAgICAgICAgICAgICAgICBhdWRpb0V2ZW50LnN0b3BTYW1wbGUodGhpcy5zb25nLmxvb3BFbmQvMTAwMCk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbaV07XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcHBpbmcgYXVkaW8gZXZlbnQnLCBpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiovXG4gICAgICAgICAgdGhpcy5ub3RlcyA9IG5ldyBNYXAoKVxuICAgICAgICAgIHRoaXMuc2V0SW5kZXgobGVmdE1pbGxpcylcbiAgICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvblxuICAgICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgLT0gdGhpcy5zb25nLl9sb29wRHVyYXRpb25cblxuICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnRzLmxlbmd0aClcblxuICAgICAgICAgIC8vIGdldCB0aGUgYXVkaW8gZXZlbnRzIHRoYXQgc3RhcnQgYmVmb3JlIHNvbmcubG9vcFN0YXJ0XG4gICAgICAgICAgLy90aGlzLmdldERhbmdsaW5nQXVkaW9FdmVudHModGhpcy5zb25nLmxvb3BTdGFydCwgZXZlbnRzKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMubG9vcGVkID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKCdzY2hlZHVsZXInLCB0aGlzLmxvb3BlZClcblxuICAgIC8vIG1haW4gbG9vcFxuICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgIGxldCBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWxsaXMsIHRoaXMubWF4dGltZSlcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHRoaXMubWF4dGltZSl7XG5cbiAgICAgICAgLy9ldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcblxuICAgICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC50aW1lID0gKHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIH1lbHNle1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50cztcbiAgfVxuXG5cbiAgdXBkYXRlKGRpZmYpe1xuICAgIHZhciBpLFxuICAgICAgZXZlbnQsXG4gICAgICBudW1FdmVudHMsXG4gICAgICB0cmFjayxcbiAgICAgIGV2ZW50c1xuXG4gICAgdGhpcy5wcmV2TWF4dGltZSA9IHRoaXMubWF4dGltZVxuXG4gICAgaWYodGhpcy5zb25nLnByZWNvdW50aW5nKXtcbiAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIGJ1ZmZlclRpbWVcbiAgICAgIGV2ZW50cyA9IHRoaXMuc29uZy5fbWV0cm9ub21lLmdldFByZWNvdW50RXZlbnRzKHRoaXMubWF4dGltZSlcblxuICAgICAgaWYodGhpcy5tYXh0aW1lID4gdGhpcy5zb25nLl9tZXRyb25vbWUuZW5kTWlsbGlzICYmIHRoaXMucHJlY291bnRpbmdEb25lID09PSBmYWxzZSl7XG4gICAgICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gdHJ1ZVxuICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX21ldHJvbm9tZS5wcmVjb3VudER1cmF0aW9uXG5cbiAgICAgICAgLy8gc3RhcnQgc2NoZWR1bGluZyBldmVudHMgb2YgdGhlIHNvbmcgLT4gYWRkIHRoZSBmaXJzdCBldmVudHMgb2YgdGhlIHNvbmdcbiAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyA9IHRoaXMuc29uZ1N0YXJ0TWlsbGlzXG4gICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgYnVmZmVyVGltZVxuICAgICAgICBldmVudHMucHVzaCguLi50aGlzLmdldEV2ZW50cygpKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyArPSBkaWZmXG4gICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgYnVmZmVyVGltZVxuICAgICAgZXZlbnRzID0gdGhpcy5nZXRFdmVudHMoKVxuICAgICAgLy9jb25zb2xlLmxvZygnZG9uZScsIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMsIGRpZmYsIHRoaXMuaW5kZXgsIGV2ZW50cy5sZW5ndGgpXG4gICAgfVxuXG4gICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuXG5cbiAgICAvLyBpZihudW1FdmVudHMgPiA1KXtcbiAgICAvLyAgIGNvbnNvbGUubG9nKG51bUV2ZW50cylcbiAgICAvLyB9XG5cbiAgICBmb3IoaSA9IDA7IGkgPCBudW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IGV2ZW50c1tpXVxuICAgICAgdHJhY2sgPSBldmVudC5fdHJhY2tcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCB0aGlzLm1heHRpbWUsIHRoaXMucHJldk1heHRpbWUpXG5cbiAgICAgIC8vIGlmKGV2ZW50Lm1pbGxpcyA+IHRoaXMubWF4dGltZSl7XG4gICAgICAvLyAgIC8vIHNraXAgZXZlbnRzIHRoYXQgd2VyZSBoYXJ2ZXN0IGFjY2lkZW50bHkgd2hpbGUganVtcGluZyB0aGUgcGxheWhlYWQgLT4gc2hvdWxkIGhhcHBlbiB2ZXJ5IHJhcmVseSBpZiBldmVyXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdza2lwJywgZXZlbnQpXG4gICAgICAvLyAgIGNvbnRpbnVlXG4gICAgICAvLyB9XG5cbiAgICAgIGlmKGV2ZW50Ll9wYXJ0Lm11dGVkID09PSB0cnVlIHx8IHRyYWNrLm11dGVkID09PSB0cnVlIHx8IGV2ZW50Lm11dGVkID09PSB0cnVlKXtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvLyB0aGlzIGlzIHVzdWFsbHkgY2F1c2VkIGJ5IHRoZSBzYW1lIG5vdGUgb24gdGhlIHNhbWUgdGlja3MgdmFsdWUsIHdoaWNoIGlzIHByb2JhYmx5IGEgYnVnIGluIHRoZSBtaWRpIGZpbGVcbiAgICAgICAgLy9jb25zb2xlLmluZm8oJ25vIG1pZGlOb3RlSWQnLCBldmVudClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuXG4gICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyBjb252ZXJ0IHRvIHNlY29uZHMgYmVjYXVzZSB0aGUgYXVkaW8gY29udGV4dCB1c2VzIHNlY29uZHMgZm9yIHNjaGVkdWxpbmdcbiAgICAgICAgdHJhY2sucHJvY2Vzc01JRElFdmVudChldmVudCwgdHJ1ZSkgLy8gdHJ1ZSBtZWFuczogdXNlIGxhdGVuY3kgdG8gY29tcGVuc2F0ZSB0aW1pbmcgZm9yIGV4dGVybmFsIE1JREkgZGV2aWNlcywgc2VlIFRyYWNrLnByb2Nlc3NNSURJRXZlbnRcbiAgICAgICAgLy9jb25zb2xlLmxvZyhjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMCwgZXZlbnQudGltZSwgdGhpcy5pbmRleClcbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgICB0aGlzLm5vdGVzLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShldmVudC5taWRpTm90ZUlkKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5pbmRleCwgdGhpcy5udW1FdmVudHMpXG4gICAgLy9yZXR1cm4gdGhpcy5pbmRleCA+PSAxMFxuICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubnVtRXZlbnRzIC8vIGxhc3QgZXZlbnQgb2Ygc29uZ1xuICB9XG5cbi8qXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgbGV0IHRpbWVTdGFtcCA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgbGV0IG91dHB1dHMgPSBnZXRNSURJT3V0cHV0cygpXG4gICAgb3V0cHV0cy5mb3JFYWNoKChvdXRwdXQpID0+IHtcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXApIC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgIH0pXG4gIH1cbiovXG59XG5cbiIsIlxuZXhwb3J0IGNvbnN0IGRlZmF1bHRTb25nID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDE2LFxuICBsb3dlc3ROb3RlOiAwLFxuICBoaWdoZXN0Tm90ZTogMTI3LFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIGxvb3A6IGZhbHNlLFxuICBwbGF5YmFja1NwZWVkOiAxLFxuICBhdXRvUXVhbnRpemU6IGZhbHNlXG59XG5cbmV4cG9ydCBsZXQgYnVmZmVyVGltZSA9IDIwMFxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QnVmZmVyVGltZSh0aW1lKXtcbiAgYnVmZmVyVGltZSA9IHRpbWVcbn1cbiIsIi8vQCBmbG93XG5cbmltcG9ydCB7TUlESUV2ZW50VHlwZXN9IGZyb20gJy4vY29uc3RhbnRzJ1xuaW1wb3J0IHtwYXJzZVRpbWVFdmVudHMsIHBhcnNlRXZlbnRzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbi8vaW1wb3J0IHthZGRUYXNrLCByZW1vdmVUYXNrfSBmcm9tICcuL2hlYXJ0YmVhdCdcbmltcG9ydCB7Y29udGV4dCwgbWFzdGVyR2Fpbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlcidcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge3NvbmdGcm9tTUlESUZpbGUsIHNvbmdGcm9tTUlESUZpbGVBc3luY30gZnJvbSAnLi9zb25nX2Zyb21fbWlkaWZpbGUnXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y2FsY3VsYXRlUG9zaXRpb259IGZyb20gJy4vcG9zaXRpb24nXG5pbXBvcnQge1BsYXloZWFkfSBmcm9tICcuL3BsYXloZWFkJ1xuaW1wb3J0IHtNZXRyb25vbWV9IGZyb20gJy4vbWV0cm9ub21lJ1xuaW1wb3J0IHthZGRFdmVudExpc3RlbmVyLCByZW1vdmVFdmVudExpc3RlbmVyLCBkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5pbXBvcnQge2RlZmF1bHRTb25nfSBmcm9tICcuL3NldHRpbmdzJ1xuXG5sZXQgc29uZ0luZGV4ID0gMFxubGV0IHJlY29yZGluZ0luZGV4ID0gMFxuXG5cbi8qXG50eXBlIHNvbmdTZXR0aW5ncyA9IHtcbiAgbmFtZTogc3RyaW5nLFxuICBwcHE6IG51bWJlcixcbiAgYnBtOiBudW1iZXIsXG4gIGJhcnM6IG51bWJlcixcbiAgbG93ZXN0Tm90ZTogbnVtYmVyLFxuICBoaWdoZXN0Tm90ZTogbnVtYmVyLFxuICBub21pbmF0b3I6IG51bWJlcixcbiAgZGVub21pbmF0b3I6IG51bWJlcixcbiAgcXVhbnRpemVWYWx1ZTogbnVtYmVyLFxuICBmaXhlZExlbmd0aFZhbHVlOiBudW1iZXIsXG4gIHBvc2l0aW9uVHlwZTogc3RyaW5nLFxuICB1c2VNZXRyb25vbWU6IGJvb2xlYW4sXG4gIGF1dG9TaXplOiBib29sZWFuLFxuICBsb29wOiBib29sZWFuLFxuICBwbGF5YmFja1NwZWVkOiBudW1iZXIsXG4gIGF1dG9RdWFudGl6ZTogYm9vbGVhblxufVxuKi9cblxuZXhwb3J0IGNsYXNzIFNvbmd7XG5cbiAgc3RhdGljIGZyb21NSURJRmlsZShkYXRhKXtcbiAgICByZXR1cm4gc29uZ0Zyb21NSURJRmlsZShkYXRhKVxuICB9XG5cbiAgc3RhdGljIGZyb21NSURJRmlsZUFzeW5jKGRhdGEpe1xuICAgIHJldHVybiBzb25nRnJvbU1JRElGaWxlQXN5bmMoZGF0YSlcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzOiB7fSA9IHt9KXtcblxuICAgIHRoaXMuaWQgPSBgU18ke3NvbmdJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWA7XG5cbiAgICAoe1xuICAgICAgbmFtZTogdGhpcy5uYW1lID0gdGhpcy5pZCxcbiAgICAgIHBwcTogdGhpcy5wcHEgPSBkZWZhdWx0U29uZy5wcHEsXG4gICAgICBicG06IHRoaXMuYnBtID0gZGVmYXVsdFNvbmcuYnBtLFxuICAgICAgYmFyczogdGhpcy5iYXJzID0gZGVmYXVsdFNvbmcuYmFycyxcbiAgICAgIG5vbWluYXRvcjogdGhpcy5ub21pbmF0b3IgPSBkZWZhdWx0U29uZy5ub21pbmF0b3IsXG4gICAgICBkZW5vbWluYXRvcjogdGhpcy5kZW5vbWluYXRvciA9IGRlZmF1bHRTb25nLmRlbm9taW5hdG9yLFxuICAgICAgcXVhbnRpemVWYWx1ZTogdGhpcy5xdWFudGl6ZVZhbHVlID0gZGVmYXVsdFNvbmcucXVhbnRpemVWYWx1ZSxcbiAgICAgIGZpeGVkTGVuZ3RoVmFsdWU6IHRoaXMuZml4ZWRMZW5ndGhWYWx1ZSA9IGRlZmF1bHRTb25nLmZpeGVkTGVuZ3RoVmFsdWUsXG4gICAgICB1c2VNZXRyb25vbWU6IHRoaXMudXNlTWV0cm9ub21lID0gZGVmYXVsdFNvbmcudXNlTWV0cm9ub21lLFxuICAgICAgYXV0b1NpemU6IHRoaXMuYXV0b1NpemUgPSBkZWZhdWx0U29uZy5hdXRvU2l6ZSxcbiAgICAgIGxvb3A6IHRoaXMubG9vcCA9IGRlZmF1bHRTb25nLmxvb3AsXG4gICAgICBwbGF5YmFja1NwZWVkOiB0aGlzLnBsYXliYWNrU3BlZWQgPSBkZWZhdWx0U29uZy5wbGF5YmFja1NwZWVkLFxuICAgICAgYXV0b1F1YW50aXplOiB0aGlzLmF1dG9RdWFudGl6ZSA9IGRlZmF1bHRTb25nLmF1dG9RdWFudGl6ZSxcbiAgICB9ID0gc2V0dGluZ3MpO1xuXG4gICAgdGhpcy5fdGltZUV2ZW50cyA9IFtcbiAgICAgIG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuVEVNUE8sIHRoaXMuYnBtKSxcbiAgICAgIG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUsIHRoaXMubm9taW5hdG9yLCB0aGlzLmRlbm9taW5hdG9yKSxcbiAgICBdXG5cbiAgICAvL3RoaXMuX3RpbWVFdmVudHMgPSBbXVxuICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlXG4gICAgdGhpcy5fbGFzdEV2ZW50ID0gbmV3IE1JRElFdmVudCgwLCBNSURJRXZlbnRUeXBlcy5FTkRfT0ZfVFJBQ0spXG5cbiAgICB0aGlzLl90cmFja3MgPSBbXVxuICAgIHRoaXMuX3RyYWNrc0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX3BhcnRzID0gW11cbiAgICB0aGlzLl9wYXJ0c0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fYWxsRXZlbnRzID0gW10gLy8gTUlESSBldmVudHMgYW5kIG1ldHJvbm9tZSBldmVudHNcblxuICAgIHRoaXMuX25vdGVzID0gW11cbiAgICB0aGlzLl9ub3Rlc0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX25ld0V2ZW50cyA9IFtdXG4gICAgdGhpcy5fbW92ZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuX3RyYW5zcG9zZWRFdmVudHMgPSBbXVxuXG4gICAgdGhpcy5fbmV3UGFydHMgPSBbXVxuICAgIHRoaXMuX2NoYW5nZWRQYXJ0cyA9IFtdXG4gICAgdGhpcy5fcmVtb3ZlZFBhcnRzID0gW11cblxuICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSAwXG4gICAgdGhpcy5fc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcih0aGlzKVxuICAgIHRoaXMuX3BsYXloZWFkID0gbmV3IFBsYXloZWFkKHRoaXMpXG5cbiAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZVxuICAgIHRoaXMucGF1c2VkID0gZmFsc2VcbiAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlXG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZVxuXG4gICAgdGhpcy52b2x1bWUgPSAwLjVcbiAgICB0aGlzLl9vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMuX291dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLl9vdXRwdXQuY29ubmVjdChtYXN0ZXJHYWluKVxuXG4gICAgdGhpcy5fbWV0cm9ub21lID0gbmV3IE1ldHJvbm9tZSh0aGlzKVxuICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9IFtdXG4gICAgdGhpcy5fdXBkYXRlTWV0cm9ub21lRXZlbnRzID0gdHJ1ZVxuXG4gICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IGZhbHNlXG4gICAgdGhpcy5fbG9vcER1cmF0aW9uID0gMFxuICAgIHRoaXMuX3ByZWNvdW50QmFycyA9IDBcbiAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcblxuICB9XG5cblxuICBhZGRUaW1lRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgLy9AVE9ETzogZmlsdGVyIHRpbWUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2sgLT4gdXNlIHRoZSBsYXN0bHkgYWRkZWQgZXZlbnRzXG4gICAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUpe1xuICAgICAgICB0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlXG4gICAgICB9XG4gICAgICB0aGlzLl90aW1lRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgfSlcbiAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICB9XG5cbiAgYWRkVHJhY2tzKC4uLnRyYWNrcyl7XG4gICAgdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICB0cmFjay5fc29uZyA9IHRoaXNcbiAgICAgIHRyYWNrLmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgICAgdGhpcy5fdHJhY2tzLnB1c2godHJhY2spXG4gICAgICB0aGlzLl90cmFja3NCeUlkLnNldCh0cmFjay5pZCwgdHJhY2spXG4gICAgICB0aGlzLl9uZXdFdmVudHMucHVzaCguLi50cmFjay5fZXZlbnRzKVxuICAgICAgdGhpcy5fbmV3UGFydHMucHVzaCguLi50cmFjay5fcGFydHMpXG4gICAgfSlcbiAgfVxuXG4gIC8vIHByZXBhcmUgc29uZyBldmVudHMgZm9yIHBsYXliYWNrXG4gIHVwZGF0ZSgpOiB2b2lke1xuXG4gICAgbGV0IGNyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuXG4gICAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gZmFsc2VcbiAgICAgICYmIHRoaXMuX3JlbW92ZWRFdmVudHMubGVuZ3RoID09PSAwXG4gICAgICAmJiB0aGlzLl9uZXdFdmVudHMubGVuZ3RoID09PSAwXG4gICAgICAmJiB0aGlzLl9tb3ZlZEV2ZW50cy5sZW5ndGggPT09IDBcbiAgICAgICYmIHRoaXMuX25ld1BhcnRzLmxlbmd0aCA9PT0gMFxuICAgICAgJiYgdGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA9PT0gMFxuICAgICl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLy9kZWJ1Z1xuICAgIC8vdGhpcy5pc1BsYXlpbmcgPSB0cnVlXG5cbiAgICBjb25zb2xlLmdyb3VwKCd1cGRhdGUgc29uZycpXG4gICAgY29uc29sZS50aW1lKCd0b3RhbCcpXG5cbiAgICAvLyBjaGVjayBpZiB0aW1lIGV2ZW50cyBhcmUgdXBkYXRlZFxuICAgIGlmKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IHRydWUpe1xuICAgICAgLy9jb25zb2xlLmxvZygndXBkYXRlVGltZUV2ZW50cycsIHRoaXMuX3RpbWVFdmVudHMubGVuZ3RoKVxuICAgICAgcGFyc2VUaW1lRXZlbnRzKHRoaXMsIHRoaXMuX3RpbWVFdmVudHMsIHRoaXMuaXNQbGF5aW5nKVxuICAgICAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IGZhbHNlXG4gICAgICBjb25zb2xlLmxvZygndGltZSBldmVudHMgJU8nLCB0aGlzLl90aW1lRXZlbnRzKVxuICAgIH1cblxuICAgIC8vIG9ubHkgcGFyc2UgbmV3IGFuZCBtb3ZlZCBldmVudHNcbiAgICBsZXQgdG9iZVBhcnNlZCA9IFtdXG5cblxuICAgIC8vIGZpbHRlciByZW1vdmVkIHBhcnRzXG4gICAgY29uc29sZS5sb2coJ3JlbW92ZWQgcGFydHMgJU8nLCB0aGlzLl9yZW1vdmVkUGFydHMpXG4gICAgdGhpcy5fcmVtb3ZlZFBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZClcbiAgICAgIHRoaXMuX3JlbW92ZWRFdmVudHMucHVzaCguLi5wYXJ0Ll9ldmVudHMpXG4gICAgfSlcblxuXG4gICAgLy8gYWRkIG5ldyBwYXJ0c1xuICAgIGNvbnNvbGUubG9nKCduZXcgcGFydHMgJU8nLCB0aGlzLl9uZXdQYXJ0cylcbiAgICB0aGlzLl9uZXdQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0Ll9zb25nID0gdGhpc1xuICAgICAgdGhpcy5fcGFydHNCeUlkLnNldChwYXJ0LmlkLCBwYXJ0KVxuICAgICAgLy90aGlzLl9uZXdFdmVudHMucHVzaCguLi5wYXJ0Ll9ldmVudHMpXG4gICAgICBwYXJ0LnVwZGF0ZSgpXG4gICAgfSlcblxuXG4gICAgLy8gdXBkYXRlIGNoYW5nZWQgcGFydHNcbiAgICBjb25zb2xlLmxvZygnY2hhbmdlZCBwYXJ0cyAlTycsIHRoaXMuX2NoYW5nZWRQYXJ0cylcbiAgICB0aGlzLl9jaGFuZ2VkUGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgcGFydC51cGRhdGUoKVxuICAgIH0pXG5cbiAgICAvLyByZW1vdmUgZXZlbnRzIGZyb20gcmVtb3ZlZCBwYXJ0c1xuICAgIGNvbnNvbGUubG9nKCdjaGFuZ2VkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKVxuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICB0aGlzLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4ucGFydC5fZXZlbnRzKVxuICAgICAgdGhpcy5fcGFydHNCeUlkLmRlbGV0ZShwYXJ0LmlkKVxuICAgICAgcGFydC51cGRhdGUoKVxuICAgIH0pXG5cbiAgICBpZih0aGlzLl9yZW1vdmVkUGFydHMubGVuZ3RoID4gMCl7XG4gICAgICB0aGlzLl9wYXJ0cyA9IEFycmF5LmZyb20odGhpcy5fcGFydHNCeUlkLnZhbHVlcygpKVxuICAgIH1cblxuXG4gICAgLy8gZmlsdGVyIHJlbW92ZWQgZXZlbnRzXG4gICAgY29uc29sZS5sb2coJ3JlbW92ZWQgZXZlbnRzICVPJywgdGhpcy5fcmVtb3ZlZEV2ZW50cylcbiAgICB0aGlzLl9yZW1vdmVkRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLl9ub3Rlc0J5SWQuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlLmlkKVxuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgfSlcblxuICAgIGNyZWF0ZUV2ZW50QXJyYXkgPSB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA+IDBcblxuICAgIC8vIGFkZCBuZXcgZXZlbnRzXG4gICAgY29uc29sZS5sb2coJ25ldyBldmVudHMgJU8nLCB0aGlzLl9uZXdFdmVudHMpXG4gICAgdGhpcy5fbmV3RXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB0aGlzLl9ldmVudHMucHVzaChldmVudClcbiAgICAgIHRvYmVQYXJzZWQucHVzaChldmVudClcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuaWQpXG4gICAgfSlcblxuICAgIC8vIG1vdmVkIGV2ZW50cyBuZWVkIHRvIGJlIHBhcnNlZFxuICAgIGNvbnNvbGUubG9nKCdtb3ZlZCAlTycsIHRoaXMuX21vdmVkRXZlbnRzKVxuICAgIHRoaXMuX21vdmVkRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpXG4gICAgfSlcblxuICAgIC8vdG9iZVBhcnNlZCA9IFsuLi50b2JlUGFyc2VkLCAuLi5BcnJheS5mcm9tKHNvbmcubW92ZWRFdmVudHMudmFsdWVzKCkpXVxuXG4gICAgY29uc29sZS50aW1lKCdwYXJzZScpXG4gICAgaWYodG9iZVBhcnNlZC5sZW5ndGggPiAwKXtcbiAgICAgIC8vY29uc29sZS5sb2coJ3RvYmVQYXJzZWQgJU8nLCB0b2JlUGFyc2VkKVxuICAgICAgdG9iZVBhcnNlZCA9IFsuLi50b2JlUGFyc2VkLCAuLi50aGlzLl90aW1lRXZlbnRzXVxuICAgICAgY29uc29sZS5sb2coJ3BhcnNlRXZlbnRzJywgdG9iZVBhcnNlZC5sZW5ndGggLSB0aGlzLl90aW1lRXZlbnRzLmxlbmd0aClcbiAgICAgIHBhcnNlRXZlbnRzKHRvYmVQYXJzZWQsIHRoaXMuaXNQbGF5aW5nKVxuICAgICAgdG9iZVBhcnNlZC5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5pZCwgZXZlbnQudHlwZSwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT04pe1xuICAgICAgICAgIGlmKGV2ZW50Lm1pZGlOb3RlKXtcbiAgICAgICAgICAgIHRoaXMuX25vdGVzQnlJZC5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50LnR5cGUpXG4gICAgICAgICAgICAvL3RoaXMuX25vdGVzLnB1c2goZXZlbnQubWlkaU5vdGUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgdGhpcy5fbm90ZXMgPSBBcnJheS5mcm9tKHRoaXMuX25vdGVzQnlJZC52YWx1ZXMoKSlcbiAgICB9XG4gICAgY29uc29sZS50aW1lRW5kKCdwYXJzZScpXG5cblxuICAgIGlmKGNyZWF0ZUV2ZW50QXJyYXkpe1xuICAgICAgY29uc29sZS50aW1lKCd0byBhcnJheScpXG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9ub3RlcyA9IEFycmF5LmZyb20odGhpcy5fbm90ZXNCeUlkLnZhbHVlcygpKVxuICAgICAgY29uc29sZS50aW1lRW5kKCd0byBhcnJheScpXG4gICAgfVxuICAgIC8vZGVidWdnZXJcblxuICAgIGNvbnNvbGUudGltZShgc29ydGluZyAke3RoaXMuX2V2ZW50cy5sZW5ndGh9IGV2ZW50c2ApXG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbm90ZXMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBhLm5vdGVPbi50aWNrcyAtIGIubm90ZU9uLnRpY2tzXG4gICAgfSlcbiAgICBjb25zb2xlLnRpbWVFbmQoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuXG4gICAgY29uc29sZS5sb2coJ25vdGVzICVPJywgdGhpcy5fbm90ZXMpXG5cbiAgICBjb25zb2xlLnRpbWVFbmQoJ3RvdGFsJylcbiAgICBjb25zb2xlLmdyb3VwRW5kKCd1cGRhdGUgc29uZycpXG4gICAgY29uc29sZS50aW1lRW5kKCd1cGRhdGUgc29uZycpXG5cblxuICAgIC8vIGdldCB0aGUgbGFzdCBldmVudCBvZiB0aGlzIHNvbmdcbiAgICBsZXQgbGFzdEV2ZW50ID0gdGhpcy5fZXZlbnRzW3RoaXMuX2V2ZW50cy5sZW5ndGggLSAxXVxuICAgIGxldCBsYXN0VGltZUV2ZW50ID0gdGhpcy5fdGltZUV2ZW50c1t0aGlzLl90aW1lRXZlbnRzLmxlbmd0aCAtIDFdXG4gICAgaWYobGFzdEV2ZW50IGluc3RhbmNlb2YgTUlESUV2ZW50ID09PSBmYWxzZSl7XG4gICAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50XG4gICAgfWVsc2UgaWYobGFzdFRpbWVFdmVudC50aWNrcyA+IGxhc3RFdmVudC50aWNrcyl7XG4gICAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50XG4gICAgfVxuXG4gICAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBkYXRhIG9mIHRoZSBmaXJzdCBiZWF0IGluIHRoZSBiYXIgYWZ0ZXIgdGhlIGxhc3QgYmFyXG4gICAgdGhpcy5iYXJzID0gTWF0aC5tYXgobGFzdEV2ZW50LmJhciwgdGhpcy5iYXJzKVxuICAgIC8vY29uc29sZS5sb2coJ251bSBiYXJzJywgdGhpcy5iYXJzLCBsYXN0RXZlbnQpXG4gICAgbGV0IHRpY2tzID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcywge1xuICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICB0YXJnZXQ6IFt0aGlzLmJhcnMgKyAxXSxcbiAgICAgIHJlc3VsdDogJ3RpY2tzJ1xuICAgIH0pLnRpY2tzXG5cbiAgICAvLyB3ZSB3YW50IHRvIHB1dCB0aGUgRU5EX09GX1RSQUNLIGV2ZW50IGF0IHRoZSB2ZXJ5IGxhc3QgdGljayBvZiB0aGUgbGFzdCBiYXIsIHNvIHdlIGNhbGN1bGF0ZSB0aGF0IHBvc2l0aW9uXG4gICAgbGV0IG1pbGxpcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIHtcbiAgICAgIHR5cGU6ICd0aWNrcycsXG4gICAgICB0YXJnZXQ6IHRpY2tzIC0gMSxcbiAgICAgIHJlc3VsdDogJ21pbGxpcydcbiAgICB9KS5taWxsaXNcblxuXG4gICAgdGhpcy5fbGFzdEV2ZW50LnRpY2tzID0gdGlja3MgLSAxXG4gICAgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuXG4gICAgY29uc29sZS5sb2coJ2xhc3QgdGljaycsIHRoaXMuX2xhc3RFdmVudC50aWNrcywgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcylcbiAgICB0aGlzLl9kdXJhdGlvblRpY2tzID0gdGhpcy5fbGFzdEV2ZW50LnRpY2tzXG4gICAgdGhpcy5fZHVyYXRpb25NaWxsaXMgPSB0aGlzLl9sYXN0RXZlbnQubWlsbGlzXG4gICAgdGhpcy5fcGxheWhlYWQudXBkYXRlU29uZygpXG5cbiAgICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlKXtcbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICB9XG5cbiAgICAvLyBhZGQgbWV0cm9ub21lIGV2ZW50c1xuICAgIGlmKHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyB8fCB0aGlzLl9tZXRyb25vbWUuYmFycyAhPT0gdGhpcy5iYXJzKXtcbiAgICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9IHBhcnNlRXZlbnRzKFsuLi50aGlzLl90aW1lRXZlbnRzLCAuLi50aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKCldKVxuICAgIH1cbiAgICB0aGlzLl9hbGxFdmVudHMgPSBbLi4udGhpcy5fbWV0cm9ub21lRXZlbnRzLCAuLi50aGlzLl9ldmVudHNdXG4gICAgc29ydEV2ZW50cyh0aGlzLl9hbGxFdmVudHMpXG4gICAgLy9jb25zb2xlLmxvZygnYWxsIGV2ZW50cyAlTycsIHRoaXMuX2FsbEV2ZW50cylcblxuICAgIHRoaXMuX25ld1BhcnRzID0gW11cbiAgICB0aGlzLl9yZW1vdmVkUGFydHMgPSBbXVxuICAgIHRoaXMuX25ld0V2ZW50cyA9IFtdXG4gICAgdGhpcy5fbW92ZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXVxuICB9XG5cbiAgcGxheSh0eXBlLCAuLi5hcmdzKTogdm9pZHtcbiAgICB0aGlzLl9wbGF5KHR5cGUsIC4uLmFyZ3MpXG4gICAgaWYodGhpcy5fcHJlY291bnRCYXJzID4gMCl7XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncHJlY291bnRpbmcnLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzfSlcbiAgICB9ZWxzZSBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAnc3RhcnRfcmVjb3JkaW5nJywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgfWVsc2V7XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgIH1cbiAgfVxuXG4gIF9wbGF5KHR5cGUsIC4uLmFyZ3Mpe1xuICAgIGlmKHR5cGVvZiB0eXBlICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnNldFBvc2l0aW9uKHR5cGUsIC4uLmFyZ3MpXG4gICAgfVxuICAgIGlmKHRoaXMucGxheWluZyl7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9yZWZlcmVuY2UgPSB0aGlzLl90aW1lU3RhbXAgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuICAgIHRoaXMuX3NjaGVkdWxlci5zZXRUaW1lU3RhbXAodGhpcy5fcmVmZXJlbmNlKVxuICAgIHRoaXMuX3N0YXJ0TWlsbGlzID0gdGhpcy5fY3VycmVudE1pbGxpc1xuXG4gICAgaWYodGhpcy5fcHJlY291bnRCYXJzID4gMCAmJiB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyl7XG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgKyB0aGlzLl9tZXRyb25vbWUuY3JlYXRlUHJlY291bnRFdmVudHModGhpcy5fcHJlY291bnRCYXJzLCB0aGlzLl9yZWZlcmVuY2UpXG4gICAgICAvL2NvbnNvbGUubG9nKCdlbmRQcmVjb3VudE1pbGxpcycsIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzKVxuICAgICAgdGhpcy5wcmVjb3VudGluZyA9IHRydWVcbiAgICB9ZWxzZSB7XG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMucGxheWluZyA9IHRydWVcbiAgICAgIHRoaXMucmVjb3JkaW5nID0gdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmdcbiAgICB9XG5cbiAgICBpZih0aGlzLnBhdXNlZCl7XG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5fc2NoZWR1bGVyLmluaXQodGhpcy5fY3VycmVudE1pbGxpcylcbiAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgdGhpcy5fcHVsc2UoKVxuICB9XG5cblxuICBwYXVzZSgpOiB2b2lke1xuICAgIHRoaXMucGF1c2VkID0gIXRoaXMucGF1c2VkXG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgaWYodGhpcy5wYXVzZWQpe1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BhdXNlJywgZGF0YTogdGhpcy5wYXVzZWR9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5wbGF5KClcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwYXVzZScsIGRhdGE6IHRoaXMucGF1c2VkfSlcbiAgICB9XG4gIH1cblxuICBzdG9wKCk6IHZvaWR7XG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgaWYodGhpcy5wbGF5aW5nIHx8IHRoaXMucGF1c2VkKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgfVxuICAgIGlmKHRoaXMuX2N1cnJlbnRNaWxsaXMgIT09IDApe1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIGlmKHRoaXMucmVjb3JkaW5nKXtcbiAgICAgICAgdGhpcy5zdG9wUmVjb3JkaW5nKClcbiAgICAgIH1cbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdG9wJ30pXG4gICAgfVxuICB9XG5cbiAgc3RhcnRSZWNvcmRpbmcoKXtcbiAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fcmVjb3JkSWQgPSBgcmVjb3JkaW5nXyR7cmVjb3JkaW5nSW5kZXgrK30ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5fc3RhcnRSZWNvcmRpbmcodGhpcy5fcmVjb3JkSWQpXG4gICAgfSlcbiAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IHRydWVcbiAgfVxuXG4gIHN0b3BSZWNvcmRpbmcoKXtcbiAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIHRyYWNrLl9zdG9wUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID0gZmFsc2VcbiAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlXG4gICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3N0b3BfcmVjb3JkaW5nJ30pXG4gIH1cblxuICB1bmRvUmVjb3JkaW5nKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2sudW5kb1JlY29yZGluZyh0aGlzLl9yZWNvcmRJZClcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHJlZG9SZWNvcmRpbmcoKXtcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5yZWRvUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICB9XG5cbiAgc2V0TWV0cm9ub21lKGZsYWcpe1xuICAgIGlmKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9ICF0aGlzLnVzZU1ldHJvbm9tZVxuICAgIH1lbHNle1xuICAgICAgdGhpcy51c2VNZXRyb25vbWUgPSBmbGFnXG4gICAgfVxuICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKHRoaXMudXNlTWV0cm9ub21lKVxuICB9XG5cbiAgY29uZmlndXJlTWV0cm9ub21lKGNvbmZpZyl7XG4gICAgdGhpcy5fbWV0cm9ub21lLmNvbmZpZ3VyZShjb25maWcpXG4gIH1cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKCh0cmFjaykgPT4ge1xuICAgICAgdHJhY2suYWxsTm90ZXNPZmYoKVxuICAgIH0pXG5cbiAgICAvL3RoaXMuX3NjaGVkdWxlci5hbGxOb3Rlc09mZigpXG4gICAgdGhpcy5fbWV0cm9ub21lLmFsbE5vdGVzT2ZmKClcbiAgfVxuXG4gIGdldFRyYWNrcygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fdHJhY2tzXVxuICB9XG5cbiAgZ2V0UGFydHMoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX3BhcnRzXVxuICB9XG5cbiAgZ2V0RXZlbnRzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ldmVudHNdXG4gIH1cblxuICBnZXROb3Rlcygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fbm90ZXNdXG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbihhcmdzKXtcbiAgICByZXR1cm4gY2FsY3VsYXRlUG9zaXRpb24odGhpcywgYXJncylcbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0UG9zaXRpb24odHlwZSwgLi4uYXJncyl7XG5cbiAgICBsZXQgd2FzUGxheWluZyA9IHRoaXMucGxheWluZ1xuICAgIGlmKHRoaXMucGxheWluZyl7XG4gICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgfVxuXG4gICAgbGV0IHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpXG4gICAgLy9sZXQgbWlsbGlzID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ21pbGxpcycpXG4gICAgaWYocG9zaXRpb24gPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSBwb3NpdGlvbi5taWxsaXNcblxuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgIGRhdGE6IHBvc2l0aW9uXG4gICAgfSlcblxuICAgIGlmKHdhc1BsYXlpbmcpe1xuICAgICAgdGhpcy5fcGxheSgpXG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coJ3NldFBvc2l0aW9uJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgfVxuXG4gIGdldFBvc2l0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXloZWFkLmdldCgpLnBvc2l0aW9uXG4gIH1cblxuICBnZXRQbGF5aGVhZCgpe1xuICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKVxuICB9XG5cbiAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuICBzZXRMZWZ0TG9jYXRvcih0eXBlLCAuLi5hcmdzKXtcbiAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKVxuXG4gICAgaWYodGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKXtcbiAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBwb3NpdGlvbiBmb3IgbG9jYXRvcicpXG4gICAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuICBzZXRSaWdodExvY2F0b3IodHlwZSwgLi4uYXJncyl7XG4gICAgdGhpcy5fcmlnaHRMb2NhdG9yID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpXG5cbiAgICBpZih0aGlzLl9yaWdodExvY2F0b3IgPT09IGZhbHNlKXtcbiAgICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIHBvc2l0aW9uIGZvciBsb2NhdG9yJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIHNldExvb3AoZmxhZyA9IG51bGwpe1xuXG4gICAgdGhpcy5fbG9vcCA9IGZsYWcgIT09IG51bGwgPyBmbGFnIDogIXRoaXMuX2xvb3BcblxuICAgIGlmKHRoaXMuX3JpZ2h0TG9jYXRvciA9PT0gZmFsc2UgfHwgdGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKXtcbiAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZVxuICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBsb2NhdG9ycyBjYW4gbm90ICh5ZXQpIGJlIHVzZWQgdG8ganVtcCBvdmVyIGEgc2VnbWVudFxuICAgIGlmKHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMgPD0gdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzKXtcbiAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZVxuICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9sb29wRHVyYXRpb24gPSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzIC0gdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9sb29wLCB0aGlzLl9sb29wRHVyYXRpb24pXG4gICAgdGhpcy5fc2NoZWR1bGVyLmJleW9uZExvb3AgPSB0aGlzLl9jdXJyZW50TWlsbGlzID4gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgIHJldHVybiB0aGlzLl9sb29wXG4gIH1cblxuICBzZXRQcmVjb3VudCh2YWx1ZSA9IDApe1xuICAgIHRoaXMuX3ByZWNvdW50QmFycyA9IHZhbHVlXG4gIH1cblxuICBfcHVsc2UoKTogdm9pZHtcbiAgICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlICYmIHRoaXMucHJlY291bnRpbmcgPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgbm93ID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDBcbiAgICBsZXQgZGlmZiA9IG5vdyAtIHRoaXMuX3JlZmVyZW5jZVxuICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgIHRoaXMuX3JlZmVyZW5jZSA9IG5vd1xuXG4gICAgaWYodGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPiAwKXtcbiAgICAgIGlmKHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID4gdGhpcy5fY3VycmVudE1pbGxpcyl7XG4gICAgICAgIHRoaXMuX3NjaGVkdWxlci51cGRhdGUoZGlmZilcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3B1bHNlLmJpbmQodGhpcykpXG4gICAgICAgIC8vcmV0dXJuIGJlY2F1c2UgZHVyaW5nIHByZWNvdW50aW5nIG9ubHkgcHJlY291bnQgbWV0cm9ub21lIGV2ZW50cyBnZXQgc2NoZWR1bGVkXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcbiAgICAgIGlmKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nKXtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLnJlY29yZGluZyA9IHRydWVcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlXG4gICAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fc3RhcnRNaWxsaXN9KVxuICAgICAgICAvL2Rpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYodGhpcy5fbG9vcCAmJiB0aGlzLl9jdXJyZW50TWlsbGlzID49IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMpe1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyAtPSB0aGlzLl9sb29wRHVyYXRpb25cbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIC8vdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9sZWZ0TG9jYXRvci5taWxsaXMpIC8vIHBsYXloZWFkIGlzIGEgYml0IGFoZWFkIG9ubHkgZHVyaW5nIHRoaXMgZnJhbWVcbiAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICB0eXBlOiAnbG9vcCcsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9wbGF5aGVhZC51cGRhdGUoJ21pbGxpcycsIGRpZmYpXG4gICAgfVxuXG4gICAgdGhpcy5fdGlja3MgPSB0aGlzLl9wbGF5aGVhZC5nZXQoKS50aWNrc1xuXG4gICAgaWYodGhpcy5fY3VycmVudE1pbGxpcyA+PSB0aGlzLl9kdXJhdGlvbk1pbGxpcyl7XG4gICAgICB0aGlzLnN0b3AoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZShkaWZmKVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3B1bHNlLmJpbmQodGhpcykpXG4gIH1cblxuICAvKlxuICAgIGhlbHBlciBtZXRob2Q6IGNvbnZlcnRzIHVzZXIgZnJpZW5kbHkgcG9zaXRpb24gZm9ybWF0IHRvIGludGVybmFsIGZvcm1hdFxuXG4gICAgcG9zaXRpb246XG4gICAgICAtICd0aWNrcycsIDk2MDAwXG4gICAgICAtICdtaWxsaXMnLCAxMjM0XG4gICAgICAtICdwZXJjZW50YWdlJywgNTVcbiAgICAgIC0gJ2JhcnNiZWF0cycsIDEsIDQsIDAsIDI1IC0+IGJhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXG4gICAgICAtICd0aW1lJywgMCwgMywgNDksIDU2NiAtPiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG5cbiAgKi9cbiAgX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsIHJlc3VsdFR5cGUpe1xuICAgIGxldCB0YXJnZXRcblxuICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBjYXNlICdwZXJjZW50YWdlJzpcbiAgICAgICAgdGFyZ2V0ID0gYXJnc1swXSB8fCAwXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICAgIHRhcmdldCA9IGFyZ3NcbiAgICAgICAgYnJlYWtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5sb2coJ3Vuc3VwcG9ydGVkIHR5cGUnKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCB7XG4gICAgICB0eXBlLFxuICAgICAgdGFyZ2V0LFxuICAgICAgcmVzdWx0OiByZXN1bHRUeXBlLFxuICAgIH0pXG5cbiAgICByZXR1cm4gcG9zaXRpb25cbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spe1xuICAgIHJldHVybiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZClcbiAgfVxufVxuIiwiXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCB7cGFyc2VNSURJRmlsZX0gZnJvbSAnLi9taWRpZmlsZSdcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7VHJhY2t9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge1Nvbmd9IGZyb20gJy4vc29uZydcbmltcG9ydCB7YmFzZTY0VG9CaW5hcnl9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7c3RhdHVzLCBqc29uLCBhcnJheUJ1ZmZlcn0gZnJvbSAnLi9mZXRjaF9oZWxwZXJzJ1xuXG5jb25zdCBQUFEgPSA5NjBcblxuXG5mdW5jdGlvbiB0b1NvbmcocGFyc2VkKXtcbiAgbGV0IHRyYWNrcyA9IHBhcnNlZC50cmFja3NcbiAgbGV0IHBwcSA9IHBhcnNlZC5oZWFkZXIudGlja3NQZXJCZWF0XG4gIGxldCBwcHFGYWN0b3IgPSBQUFEgLyBwcHEgLy9AVE9ETzogZ2V0IHBwcSBmcm9tIGNvbmZpZyAtPiBvbmx5IG5lY2Vzc2FyeSBpZiB5b3Ugd2FudCB0byBjaGFuZ2UgdGhlIHBwcSBvZiB0aGUgTUlESSBmaWxlICFcbiAgbGV0IHRpbWVFdmVudHMgPSBbXVxuICBsZXQgYnBtID0gLTFcbiAgbGV0IG5vbWluYXRvciA9IC0xXG4gIGxldCBkZW5vbWluYXRvciA9IC0xXG4gIGxldCBuZXdUcmFja3MgPSBbXVxuXG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzLnZhbHVlcygpKXtcbiAgICBsZXQgbGFzdFRpY2tzLCBsYXN0VHlwZVxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgdHlwZVxuICAgIGxldCBjaGFubmVsID0gLTFcbiAgICBsZXQgdHJhY2tOYW1lXG4gICAgbGV0IHRyYWNrSW5zdHJ1bWVudE5hbWVcbiAgICBsZXQgZXZlbnRzID0gW107XG5cbiAgICBmb3IobGV0IGV2ZW50IG9mIHRyYWNrKXtcbiAgICAgIHRpY2tzICs9IChldmVudC5kZWx0YVRpbWUgKiBwcHFGYWN0b3IpO1xuXG4gICAgICBpZihjaGFubmVsID09PSAtMSAmJiB0eXBlb2YgZXZlbnQuY2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBjaGFubmVsID0gZXZlbnQuY2hhbm5lbDtcbiAgICAgIH1cbiAgICAgIHR5cGUgPSBldmVudC5zdWJ0eXBlO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5kZWx0YVRpbWUsIHRpY2tzLCB0eXBlKTtcblxuICAgICAgc3dpdGNoKGV2ZW50LnN1YnR5cGUpe1xuXG4gICAgICAgIGNhc2UgJ3RyYWNrTmFtZSc6XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdpbnN0cnVtZW50TmFtZSc6XG4gICAgICAgICAgaWYoZXZlbnQudGV4dCl7XG4gICAgICAgICAgICB0cmFja0luc3RydW1lbnROYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9uJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweDkwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9mZic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg4MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3NldFRlbXBvJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0ZW1wbyBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgbGV0IHRtcCA9IDYwMDAwMDAwIC8gZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdDtcblxuICAgICAgICAgIGlmKHRpY2tzID09PSBsYXN0VGlja3MgJiYgdHlwZSA9PT0gbGFzdFR5cGUpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oJ3RlbXBvIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIHRtcCk7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGJwbSA9PT0gLTEpe1xuICAgICAgICAgICAgYnBtID0gdG1wO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg1MSwgdG1wKSlcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0aW1lU2lnbmF0dXJlJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0aW1lIHNpZ25hdHVyZSBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgaWYobGFzdFRpY2tzID09PSB0aWNrcyAmJiBsYXN0VHlwZSA9PT0gdHlwZSl7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ3RpbWUgc2lnbmF0dXJlIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihub21pbmF0b3IgPT09IC0xKXtcbiAgICAgICAgICAgIG5vbWluYXRvciA9IGV2ZW50Lm51bWVyYXRvclxuICAgICAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvclxuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg1OCwgZXZlbnQubnVtZXJhdG9yLCBldmVudC5kZW5vbWluYXRvcikpXG4gICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlICdjb250cm9sbGVyJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEIwLCBldmVudC5jb250cm9sbGVyVHlwZSwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwcm9ncmFtQ2hhbmdlJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEMwLCBldmVudC5wcm9ncmFtTnVtYmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncGl0Y2hCZW5kJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEUwLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCBldmVudC50eXBlKTtcbiAgICAgIH1cblxuICAgICAgbGFzdFR5cGUgPSB0eXBlXG4gICAgICBsYXN0VGlja3MgPSB0aWNrc1xuICAgIH1cblxuICAgIGlmKGV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAgIC8vY29uc29sZS5jb3VudChldmVudHMubGVuZ3RoKVxuICAgICAgbGV0IG5ld1RyYWNrID0gbmV3IFRyYWNrKHRyYWNrTmFtZSlcbiAgICAgIGxldCBwYXJ0ID0gbmV3IFBhcnQoKVxuICAgICAgbmV3VHJhY2suYWRkUGFydHMocGFydClcbiAgICAgIHBhcnQuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICAgIG5ld1RyYWNrcy5wdXNoKG5ld1RyYWNrKVxuICAgIH1cbiAgfVxuXG4gIGxldCBzb25nID0gbmV3IFNvbmcoe1xuICAgIHBwcTogUFBRLFxuICAgIHBsYXliYWNrU3BlZWQ6IDEsXG4gICAgLy9wcHEsXG4gICAgYnBtLFxuICAgIG5vbWluYXRvcixcbiAgICBkZW5vbWluYXRvclxuICB9KVxuICBzb25nLmFkZFRyYWNrcyguLi5uZXdUcmFja3MpXG4gIHNvbmcuYWRkVGltZUV2ZW50cyguLi50aW1lRXZlbnRzKVxuICBzb25nLnVwZGF0ZSgpXG4gIHJldHVybiBzb25nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlKGRhdGEsIHNldHRpbmdzID0ge30pe1xuICBsZXQgc29uZyA9IG51bGw7XG5cbiAgaWYoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKXtcbiAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgc29uZyA9IHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICB9ZWxzZSBpZih0eXBlb2YgZGF0YS5oZWFkZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkYXRhLnRyYWNrcyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHNvbmcgPSB0b1NvbmcoZGF0YSk7XG4gIH1lbHNle1xuICAgIGRhdGEgPSBiYXNlNjRUb0JpbmFyeShkYXRhKTtcbiAgICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgc29uZyA9IHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcignd3JvbmcgZGF0YScpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzb25nXG4gIC8vIHtcbiAgLy8gICBwcHEgPSBuZXdQUFEsXG4gIC8vICAgYnBtID0gbmV3QlBNLFxuICAvLyAgIHBsYXliYWNrU3BlZWQgPSBuZXdQbGF5YmFja1NwZWVkLFxuICAvLyB9ID0gc2V0dGluZ3Ncbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZUFzeW5jKHVybCl7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihhcnJheUJ1ZmZlcilcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJlc29sdmUoc29uZ0Zyb21NSURJRmlsZShkYXRhKSlcbiAgICB9KVxuICAgIC5jYXRjaChlID0+IHtcbiAgICAgIHJlamVjdChlKVxuICAgIH0pXG4gIH0pXG59XG4iLCJpbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge01JRElOb3RlfSBmcm9tICcuL21pZGlfbm90ZSdcbmltcG9ydCB7Z2V0TUlESUlucHV0QnlJZCwgZ2V0TUlESU91dHB1dEJ5SWR9IGZyb20gJy4vaW5pdF9taWRpJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7SW5zdHJ1bWVudH0gZnJvbSAnLi9pbnN0cnVtZW50J1xuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9xYW1iaSdcblxuXG5sZXQgdHJhY2tJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFRyYWNre1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IG51bGwpe1xuICAgIHRoaXMuaWQgPSBgVFJfJHt0cmFja0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgdGhpcy5pZFxuICAgIHRoaXMuY2hhbm5lbCA9IDBcbiAgICB0aGlzLm11dGVkID0gZmFsc2VcbiAgICB0aGlzLnZvbHVtZSA9IDAuNVxuICAgIHRoaXMuX291dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5fb3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuX21pZGlJbnB1dHMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9taWRpT3V0cHV0cyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG4gICAgdGhpcy5fcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB0aGlzLmxhdGVuY3kgPSAxMDBcbiAgICB0aGlzLl9pbnN0cnVtZW50ID0gbnVsbFxuICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdXG4gICAgLy90aGlzLnNldEluc3RydW1lbnQobmV3IEluc3RydW1lbnQoJ3NpbmV3YXZlJykpXG4gIH1cblxuICBzZXRJbnN0cnVtZW50KGluc3RydW1lbnQgPSBudWxsKXtcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICAgICAgdGhpcy5faW5zdHJ1bWVudC5kaXNjb25uZWN0KClcbiAgICB9XG4gICAgdGhpcy5faW5zdHJ1bWVudCA9IGluc3RydW1lbnRcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuY29ubmVjdCh0aGlzLl9vdXRwdXQpXG4gICAgfVxuICB9XG5cbiAgZ2V0SW5zdHJ1bWVudCgpe1xuICAgIHJldHVybiB0aGlzLl9pbnN0cnVtZW50XG4gIH1cblxuICBjb25uZWN0KG91dHB1dCl7XG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3Qob3V0cHV0KVxuICB9XG5cbiAgZGlzY29ubmVjdCgpe1xuICAgIHRoaXMuX291dHB1dC5kaXNjb25uZWN0KClcbiAgfVxuXG4gIGNvbm5lY3RNSURJT3V0cHV0cyguLi5vdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gICAgb3V0cHV0cy5mb3JFYWNoKG91dHB1dCA9PiB7XG4gICAgICBpZih0eXBlb2Ygb3V0cHV0ID09PSAnc3RyaW5nJyl7XG4gICAgICAgIG91dHB1dCA9IGdldE1JRElPdXRwdXRCeUlkKG91dHB1dClcbiAgICAgIH1cbiAgICAgIGlmKG91dHB1dCBpbnN0YW5jZW9mIE1JRElPdXRwdXQpe1xuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5zZXQob3V0cHV0LmlkLCBvdXRwdXQpXG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlPdXRwdXRzKVxuICB9XG5cbiAgZGlzY29ubmVjdE1JRElPdXRwdXRzKC4uLm91dHB1dHMpe1xuICAgIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgICBpZihvdXRwdXRzLmxlbmd0aCA9PT0gMCl7XG4gICAgICB0aGlzLl9taWRpT3V0cHV0cy5jbGVhcigpXG4gICAgfVxuICAgIG91dHB1dHMuZm9yRWFjaChwb3J0ID0+IHtcbiAgICAgIGlmKHBvcnQgaW5zdGFuY2VvZiBNSURJT3V0cHV0KXtcbiAgICAgICAgcG9ydCA9IHBvcnQuaWRcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuX21pZGlPdXRwdXRzLmhhcyhwb3J0KSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3JlbW92aW5nJywgdGhpcy5fbWlkaU91dHB1dHMuZ2V0KHBvcnQpLm5hbWUpXG4gICAgICAgIHRoaXMuX21pZGlPdXRwdXRzLmRlbGV0ZShwb3J0KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy90aGlzLl9taWRpT3V0cHV0cyA9IHRoaXMuX21pZGlPdXRwdXRzLmZpbHRlciguLi5vdXRwdXRzKVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaU91dHB1dHMpXG4gIH1cblxuICBjb25uZWN0TUlESUlucHV0cyguLi5pbnB1dHMpe1xuICAgIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgIGlmKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpe1xuICAgICAgICBpbnB1dCA9IGdldE1JRElJbnB1dEJ5SWQoaW5wdXQpXG4gICAgICB9XG4gICAgICBpZihpbnB1dCBpbnN0YW5jZW9mIE1JRElJbnB1dCl7XG5cbiAgICAgICAgdGhpcy5fbWlkaUlucHV0cy5zZXQoaW5wdXQuaWQsIGlucHV0KVxuXG4gICAgICAgIGxldCBub3RlLCBtaWRpRXZlbnRcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBlID0+IHtcblxuICAgICAgICAgIG1pZGlFdmVudCA9IG5ldyBNSURJRXZlbnQodGhpcy5fc29uZy5fdGlja3MsIC4uLmUuZGF0YSlcbiAgICAgICAgICBtaWRpRXZlbnQudGltZSA9IDAgLy8gcGxheSBpbW1lZGlhdGVseVxuICAgICAgICAgIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuXG4gICAgICAgICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT04pe1xuICAgICAgICAgICAgbm90ZSA9IG5ldyBNSURJTm90ZShtaWRpRXZlbnQpXG4gICAgICAgICAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLnNldChtaWRpRXZlbnQuZGF0YTEsIG5vdGUpXG4gICAgICAgICAgfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT0ZGKXtcbiAgICAgICAgICAgIG5vdGUgPSB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmdldChtaWRpRXZlbnQuZGF0YTEpXG4gICAgICAgICAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KVxuICAgICAgICAgICAgdGhpcy5fdG1wUmVjb3JkZWROb3Rlcy5kZWxldGUobWlkaUV2ZW50LmRhdGExKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKHRoaXMuX3JlY29yZEVuYWJsZWQgPT09ICdtaWRpJyAmJiB0aGlzLl9zb25nLnJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cy5wdXNoKG1pZGlFdmVudClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wcm9jZXNzTUlESUV2ZW50KG1pZGlFdmVudClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaUlucHV0cylcbiAgfVxuXG4gIGRpc2Nvbm5lY3RNSURJSW5wdXRzKC4uLmlucHV0cyl7XG4gICAgaWYoaW5wdXRzLmxlbmd0aCA9PT0gMCl7XG4gICAgICB0aGlzLl9taWRpSW5wdXRzLmNsZWFyKClcbiAgICB9XG4gICAgaW5wdXRzLmZvckVhY2gocG9ydCA9PiB7XG4gICAgICBpZihwb3J0IGluc3RhbmNlb2YgTUlESUlucHV0KXtcbiAgICAgICAgcG9ydCA9IHBvcnQuaWRcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuX21pZGlPdXRwdXRzLmhhcyhwb3J0KSl7XG4gICAgICAgIHRoaXMuX21pZGlPdXRwdXRzLmRlbGV0ZShwb3J0KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy90aGlzLl9taWRpT3V0cHV0cyA9IHRoaXMuX21pZGlPdXRwdXRzLmZpbHRlciguLi5vdXRwdXRzKVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaUlucHV0cylcbiAgfVxuXG4gIGdldE1JRElJbnB1dHMoKXtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9taWRpSW5wdXRzLnZhbHVlcygpKVxuICB9XG5cbiAgZ2V0TUlESU91dHB1dHMoKXtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9taWRpT3V0cHV0cy52YWx1ZXMoKSlcbiAgfVxuXG4gIHNldFJlY29yZEVuYWJsZWQodHlwZSl7IC8vICdtaWRpJywgJ2F1ZGlvJywgZW1wdHkgb3IgYW55dGhpbmcgd2lsbCBkaXNhYmxlIHJlY29yZGluZ1xuICAgIHRoaXMuX3JlY29yZEVuYWJsZWQgPSB0eXBlXG4gIH1cblxuICBfc3RhcnRSZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZEVuYWJsZWQgPT09ICdtaWRpJyl7XG4gICAgICB0aGlzLl9yZWNvcmRJZCA9IHJlY29yZElkXG4gICAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdXG4gICAgICB0aGlzLl9yZWNvcmRQYXJ0ID0gbmV3IFBhcnQodGhpcy5fcmVjb3JkSWQpXG4gICAgfVxuICB9XG5cbiAgX3N0b3BSZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fcmVjb3JkUGFydC5hZGRFdmVudHMoLi4udGhpcy5fcmVjb3JkZWRFdmVudHMpXG4gICAgLy90aGlzLl9zb25nLl9uZXdFdmVudHMucHVzaCguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgICB0aGlzLmFkZFBhcnRzKHRoaXMuX3JlY29yZFBhcnQpXG4gIH1cblxuICB1bmRvUmVjb3JkaW5nKHJlY29yZElkKXtcbiAgICBpZih0aGlzLl9yZWNvcmRJZCAhPT0gcmVjb3JkSWQpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMucmVtb3ZlUGFydHModGhpcy5fcmVjb3JkUGFydClcbiAgICAvL3RoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgfVxuXG4gIHJlZG9SZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5hZGRQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KVxuICB9XG5cbiAgY29weSgpe1xuICAgIGxldCB0ID0gbmV3IFRyYWNrKHRoaXMubmFtZSArICdfY29weScpIC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICBsZXQgcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBsZXQgY29weSA9IHBhcnQuY29weSgpXG4gICAgICBjb25zb2xlLmxvZyhjb3B5KVxuICAgICAgcGFydHMucHVzaChjb3B5KVxuICAgIH0pXG4gICAgdC5hZGRQYXJ0cyguLi5wYXJ0cylcbiAgICB0LnVwZGF0ZSgpXG4gICAgcmV0dXJuIHRcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KVxuICAgIH0pXG4gIH1cblxuICBhZGRQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG4gICAgcGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgcGFydC5fdHJhY2sgPSB0aGlzXG4gICAgICB0aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpXG4gICAgICB0aGlzLl9wYXJ0cy5wdXNoKHBhcnQpXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgcGFydC5fc29uZyA9IHNvbmdcbiAgICAgICAgc29uZy5fbmV3UGFydHMucHVzaChwYXJ0KVxuICAgICAgfVxuXG4gICAgICBsZXQgZXZlbnRzID0gcGFydC5fZXZlbnRzXG4gICAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdGhpc1xuICAgICAgICBpZihzb25nKXtcbiAgICAgICAgICBldmVudC5fc29uZyA9IHNvbmdcbiAgICAgICAgICBzb25nLl9uZXdFdmVudHMucHVzaChldmVudClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB9KVxuICAgICAgdGhpcy5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICByZW1vdmVQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG5cbiAgICBwYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0Ll90cmFjayA9IG51bGxcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCwgcGFydClcbiAgICAgIGlmKHNvbmcpe1xuICAgICAgICBzb25nLl9yZW1vdmVkUGFydHMucHVzaChwYXJ0KVxuICAgICAgfVxuXG4gICAgICBsZXQgZXZlbnRzID0gcGFydC5fZXZlbnRzXG4gICAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgICAgaWYoc29uZyl7XG4gICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICAgICAgLy9zb25nLl9kZWxldGVkRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQsIGV2ZW50KVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuXG4gIHRyYW5zcG9zZVBhcnRzKGFtb3VudDogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICB9XG5cbiAgbW92ZVBhcnRzKHRpY2tzOiBudW1iZXIsIC4uLnBhcnRzKXtcbiAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgcGFydC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gIH1cblxuICBtb3ZlUGFydHNUbyh0aWNrczogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gIH1cblxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0KClcbiAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgdGhpcy5hZGRQYXJ0cyhwKVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBwYXJ0cy5zZXQoZXZlbnQuX3BhcnQpXG4gICAgICBldmVudC5fcGFydCA9IG51bGxcbiAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgIGV2ZW50Ll9zb25nID0gbnVsbFxuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gIH1cblxuICBtb3ZlRXZlbnRzKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlKHRpY2tzKVxuICAgICAgcGFydHMuc2V0KGV2ZW50LnBhcnQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgfVxuXG4gIG1vdmVFdmVudHNUbyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGxldCBwYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgICAgcGFydHMuc2V0KGV2ZW50LnBhcnQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgfVxuXG4gIGdldEV2ZW50cyhmaWx0ZXI6IHN0cmluZ1tdID0gbnVsbCl7IC8vIGNhbiBiZSB1c2UgYXMgZmluZEV2ZW50c1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ldmVudHNdIC8vQFRPRE8gaW1wbGVtZW50IGZpbHRlciAtPiBmaWx0ZXJFdmVudHMoKSBzaG91bGQgYmUgYSB1dGlsaXR5IGZ1bmN0aW9uIChub3QgYSBjbGFzcyBtZXRob2QpXG4gIH1cblxuICBtdXRlKGZsYWc6IGJvb2xlYW4gPSBudWxsKXtcbiAgICBpZihmbGFnKXtcbiAgICAgIHRoaXMuX211dGVkID0gZmxhZ1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5fbXV0ZWQgPSAhdGhpcy5fbXV0ZWRcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKXsgLy8geW91IHNob3VsZCBvbmx5IHVzZSB0aGlzIGluIGh1Z2Ugc29uZ3MgKD4xMDAgdHJhY2tzKVxuICAgIGlmKHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkpe1xuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgfVxuICAgIHNvcnRFdmVudHModGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgfVxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgICB9XG5cbiAgICBsZXQgdGltZVN0YW1wID0gKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwKSArIHRoaXMubGF0ZW5jeVxuICAgIGZvcihsZXQgb3V0cHV0IG9mIHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKXtcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXApIC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHVzZUxhdGVuY3kgPSBmYWxzZSl7XG5cbiAgICBsZXQgbGF0ZW5jeSA9IHVzZUxhdGVuY3kgPyB0aGlzLmxhdGVuY3kgOiAwXG4gICAgLy9jb25zb2xlLmxvZyhsYXRlbmN5KVxuXG4gICAgLy8gc2VuZCB0byBqYXZhc2NyaXB0IGluc3RydW1lbnRcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQucHJvY2Vzc01JRElFdmVudChldmVudCwgZXZlbnQudGltZSAvIDEwMDApXG4gICAgfVxuXG4gICAgLy8gc2VuZCB0byBleHRlcm5hbCBoYXJkd2FyZSBvciBzb2Z0d2FyZSBpbnN0cnVtZW50XG4gICAgZm9yKGxldCBwb3J0IG9mIHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKXtcbiAgICAgIGlmKHBvcnQpe1xuICAgICAgICBpZihldmVudC50eXBlID09PSAxMjggfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCBldmVudC50aW1lICsgbGF0ZW5jeSlcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTkyIHx8IGV2ZW50LnR5cGUgPT09IDIyNCl7XG4gICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMV0sIGV2ZW50LnRpbWUgKyBsYXRlbmN5KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbiIsImltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuXG5jb25zdFxuICBtUEkgPSBNYXRoLlBJLFxuICBtUG93ID0gTWF0aC5wb3csXG4gIG1Sb3VuZCA9IE1hdGgucm91bmQsXG4gIG1GbG9vciA9IE1hdGguZmxvb3IsXG4gIG1SYW5kb20gPSBNYXRoLnJhbmRvbVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROaWNlVGltZShtaWxsaXMpe1xuICBsZXQgaCwgbSwgcywgbXMsXG4gICAgc2Vjb25kcyxcbiAgICB0aW1lQXNTdHJpbmcgPSAnJztcblxuICBzZWNvbmRzID0gbWlsbGlzIC8gMTAwMDsgLy8g4oaSIG1pbGxpcyB0byBzZWNvbmRzXG4gIGggPSBtRmxvb3Ioc2Vjb25kcyAvICg2MCAqIDYwKSk7XG4gIG0gPSBtRmxvb3IoKHNlY29uZHMgJSAoNjAgKiA2MCkpIC8gNjApO1xuICBzID0gbUZsb29yKHNlY29uZHMgJSAoNjApKTtcbiAgbXMgPSBtUm91bmQoKHNlY29uZHMgLSAoaCAqIDM2MDApIC0gKG0gKiA2MCkgLSBzKSAqIDEwMDApO1xuXG4gIHRpbWVBc1N0cmluZyArPSBoICsgJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbSA8IDEwID8gJzAnICsgbSA6IG07XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBzIDwgMTAgPyAnMCcgKyBzIDogcztcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG1zID09PSAwID8gJzAwMCcgOiBtcyA8IDEwID8gJzAwJyArIG1zIDogbXMgPCAxMDAgPyAnMCcgKyBtcyA6IG1zO1xuXG4gIC8vY29uc29sZS5sb2coaCwgbSwgcywgbXMpO1xuICByZXR1cm4ge1xuICAgIGhvdXI6IGgsXG4gICAgbWludXRlOiBtLFxuICAgIHNlY29uZDogcyxcbiAgICBtaWxsaXNlY29uZDogbXMsXG4gICAgdGltZUFzU3RyaW5nOiB0aW1lQXNTdHJpbmcsXG4gICAgdGltZUFzQXJyYXk6IFtoLCBtLCBzLCBtc11cbiAgfTtcbn1cblxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CaW5hcnkoaW5wdXQpe1xuICBsZXQga2V5U3RyID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JyxcbiAgICBieXRlcywgdWFycmF5LCBidWZmZXIsXG4gICAgbGtleTEsIGxrZXkyLFxuICAgIGNocjEsIGNocjIsIGNocjMsXG4gICAgZW5jMSwgZW5jMiwgZW5jMywgZW5jNCxcbiAgICBpLCBqID0gMDtcblxuICBieXRlcyA9IE1hdGguY2VpbCgoMyAqIGlucHV0Lmxlbmd0aCkgLyA0LjApO1xuICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXMpO1xuICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gIGxrZXkxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aCAtIDEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBpZihsa2V5MSA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG4gIGlmKGxrZXkyID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcblxuICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXFw9XS9nLCAnJyk7XG5cbiAgZm9yKGkgPSAwOyBpIDwgYnl0ZXM7IGkgKz0gMykge1xuICAgIC8vZ2V0IHRoZSAzIG9jdGVjdHMgaW4gNCBhc2NpaSBjaGFyc1xuICAgIGVuYzEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMzID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzQgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cbiAgICBjaHIxID0gKGVuYzEgPDwgMikgfCAoZW5jMiA+PiA0KTtcbiAgICBjaHIyID0gKChlbmMyICYgMTUpIDw8IDQpIHwgKGVuYzMgPj4gMik7XG4gICAgY2hyMyA9ICgoZW5jMyAmIDMpIDw8IDYpIHwgZW5jNDtcblxuICAgIHVhcnJheVtpXSA9IGNocjE7XG4gICAgaWYoZW5jMyAhPSA2NCkgdWFycmF5W2krMV0gPSBjaHIyO1xuICAgIGlmKGVuYzQgIT0gNjQpIHVhcnJheVtpKzJdID0gY2hyMztcbiAgfVxuICAvL2NvbnNvbGUubG9nKGJ1ZmZlcik7XG4gIHJldHVybiBidWZmZXI7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVTdHJpbmcobyl7XG4gIGlmKHR5cGVvZiBvICE9ICdvYmplY3QnKXtcbiAgICByZXR1cm4gdHlwZW9mIG87XG4gIH1cblxuICBpZihvID09PSBudWxsKXtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG5cbiAgLy9vYmplY3QsIGFycmF5LCBmdW5jdGlvbiwgZGF0ZSwgcmVnZXhwLCBzdHJpbmcsIG51bWJlciwgYm9vbGVhbiwgZXJyb3JcbiAgbGV0IGludGVybmFsQ2xhc3MgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdFxccyhcXHcrKVxcXS8pWzFdO1xuICByZXR1cm4gaW50ZXJuYWxDbGFzcy50b0xvd2VyQ2FzZSgpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzb3J0RXZlbnRzKGV2ZW50cyl7XG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgbGV0IHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgIHIgPSAtMVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJcbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmQmFzZTY0KGRhdGEpe1xuICBsZXQgcGFzc2VkID0gdHJ1ZTtcbiAgdHJ5e1xuICAgIGF0b2IoZGF0YSk7XG4gIH1jYXRjaChlKXtcbiAgICBwYXNzZWQgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gcGFzc2VkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXF1YWxQb3dlckN1cnZlKG51bVN0ZXBzLCB0eXBlLCBtYXhWYWx1ZSkge1xuICBsZXQgaSwgdmFsdWUsIHBlcmNlbnQsXG4gICAgdmFsdWVzID0gbmV3IEZsb2F0MzJBcnJheShudW1TdGVwcylcblxuICBmb3IoaSA9IDA7IGkgPCBudW1TdGVwczsgaSsrKXtcbiAgICBwZXJjZW50ID0gaSAvIG51bVN0ZXBzXG4gICAgaWYodHlwZSA9PT0gJ2ZhZGVJbicpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcygoMS4wIC0gcGVyY2VudCkgKiAwLjUgKiBtUEkpICogbWF4VmFsdWVcbiAgICB9ZWxzZSBpZih0eXBlID09PSAnZmFkZU91dCcpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcyhwZXJjZW50ICogMC41ICogTWF0aC5QSSkgKiBtYXhWYWx1ZVxuICAgIH1cbiAgICB2YWx1ZXNbaV0gPSB2YWx1ZVxuICAgIGlmKGkgPT09IG51bVN0ZXBzIC0gMSl7XG4gICAgICB2YWx1ZXNbaV0gPSB0eXBlID09PSAnZmFkZUluJyA/IDEgOiAwXG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tNSURJTnVtYmVyKHZhbHVlKXtcbiAgLy9jb25zb2xlLmxvZyh2YWx1ZSk7XG4gIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZih2YWx1ZSA8IDAgfHwgdmFsdWUgPiAxMjcpe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxMjcnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5cbi8qXG4vL29sZCBzY2hvb2wgYWpheFxuXG5leHBvcnQgZnVuY3Rpb24gYWpheChjb25maWcpe1xuICBsZXRcbiAgICByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgbWV0aG9kID0gdHlwZW9mIGNvbmZpZy5tZXRob2QgPT09ICd1bmRlZmluZWQnID8gJ0dFVCcgOiBjb25maWcubWV0aG9kLFxuICAgIGZpbGVTaXplO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICByZWplY3QgPSByZWplY3QgfHwgZnVuY3Rpb24oKXt9O1xuICAgIHJlc29sdmUgPSByZXNvbHZlIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApe1xuICAgICAgICByZWplY3QocmVxdWVzdC5zdGF0dXMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgIGZpbGVTaXplID0gcmVxdWVzdC5yZXNwb25zZS5sZW5ndGg7XG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSwgZmlsZVNpemUpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICBjb25maWcub25FcnJvcihlKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgY29uZmlnLnVybCwgdHJ1ZSk7XG5cbiAgICBpZihjb25maWcub3ZlcnJpZGVNaW1lVHlwZSl7XG4gICAgICByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUpe1xuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKG1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcuZGF0YSl7XG4gICAgICByZXF1ZXN0LnNlbmQoY29uZmlnLmRhdGEpO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cbiovIl19
