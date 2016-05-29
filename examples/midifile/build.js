(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _qambi = require('../../src/qambi');

var _qambi2 = _interopRequireDefault(_qambi);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
        song = _qambi.Song.fromMIDIFileSync(data);
        initUI();
        //console.timeEnd('song')
      });
    } else if (test === 2) {

        //console.time('song')
        _qambi.Song.fromMIDIFile('../data/minute_waltz.mid').then(function (s) {
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
      //track.setInstrument(new SimpleSynth('sine'))
      track.connectMIDIOutputs.apply(track, _toConsumableArray((0, _qambi.getMIDIOutputs)()));
    });

    var btnPlay = document.getElementById('play');
    var btnPause = document.getElementById('pause');
    var btnStop = document.getElementById('stop');
    var btnLoop = document.getElementById('loop');
    var btnDelete = document.getElementById('delete');
    var btnPanic = document.getElementById('panic');
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
    btnPanic.disabled = false;

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
      // console.log(loop)
      btnLoop.innerHTML = loop ? 'stop loop' : 'start loop';
    });

    btnPanic.addEventListener('click', function () {
      song.panic().then(function () {
        console.log('all is well');
      });
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

},{"../../src/qambi":25,"isomorphic-fetch":2}],2:[function(require,module,exports){
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
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.1.20160328
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			/* // Take note W3C:
			var
			  uri = typeof file === "string" ? file : file.toURL()
			, revoker = function(evt) {
				// idealy DownloadFinishedEvent.data would be the URL requested
				if (evt.data === uri) {
					if (typeof file === "string") { // file is an object URL
						get_URL().revokeObjectURL(file);
					} else { // file is a File
						file.remove();
					}
				}
			}
			;
			view.addEventListener("downloadfinished", revoker);
			*/
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob(["\ufeff", blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if (target_view && is_safari && typeof FileReader !== "undefined") {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var base64Data = reader.result;
							target_view.location.href = "data:attachment/file" + base64Data.slice(base64Data.search(/[,;]/));
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
						var new_tab = view.open(object_url, "_blank");
						if (new_tab === undefined && is_safari) {
							//Apple do not allow window.open, see http://bit.ly/1kZffRI
							view.location.href = object_url
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			// Update: Google errantly closed 91158, I submitted it again:
			// https://code.google.com/p/chromium/issues/detail?id=389642
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
									revoke(file);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name, no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name || "download");
		};
	}

	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define([], function() {
    return saveAs;
  });
}

},{}],5:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2,"whatwg-fetch":6}],6:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

  //console.log(event.type, eventListeners.has(event.type))
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

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.status = status;
exports.json = json;
exports.arrayBuffer = arrayBuffer;
exports.fetchJSON = fetchJSON;
exports.fetchArraybuffer = fetchArraybuffer;
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

function fetchJSON(url) {
  return new Promise(function (resolve, reject) {
    // fetch(url, {
    //   mode: 'no-cors'
    // })
    fetch(url).then(status).then(json).then(function (data) {
      resolve(data);
    }).catch(function (e) {
      reject(e);
    });
  });
}

function fetchArraybuffer(url) {
  return new Promise(function (resolve, reject) {
    // fetch(url, {
    //   mode: 'no-cors'
    // })
    fetch(url).then(status).then(arrayBuffer).then(function (data) {
      resolve(data);
    }).catch(function (e) {
      reject(e);
    });
  });
}

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Blob = exports.rAF = exports.getUserMedia = undefined;
exports.init = init;

var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

var _song = require('./song');

var _sampler = require('./sampler');

var _init_audio = require('./init_audio');

var _init_midi = require('./init_midi');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getUserMedia = exports.getUserMedia = function () {
  if (typeof navigator !== 'undefined') {
    return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  }
  return function () {
    console.warn('getUserMedia is not available');
  };
}();

var rAF = exports.rAF = function () {
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

function loadInstrument(data) {
  var sampler = new _sampler.Sampler();
  return new Promise(function (resolve, reject) {
    sampler.parseSampleData(data).then(function () {
      return resolve(sampler);
    });
  });
}

function init() {
  var settings = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];


  // load settings.instruments (array or object)
  // load settings.midifiles (array or object)
  /*
   qambi.init({
    song: {
      type: 'Song',
      url: '../data/minute_waltz.mid'
    },
    piano: {
      type: 'Instrument',
      url: '../../instruments/electric-piano.json'
    }
  })
   qambi.init({
    instruments: ['../instruments/piano', '../instruments/violin'],
    midifiles: ['../midi/mozart.mid']
  })
  .then((loaded) => {
    let [piano, violin] = loaded.instruments
    let [mozart] = loaded.midifiles
  })
   */

  var promises = [(0, _init_audio.initAudio)(), (0, _init_midi.initMIDI)()];
  var loadKeys = void 0;

  if (settings !== null) {
    loadKeys = Object.keys(settings);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = loadKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        var data = settings[key];

        if (data.type === 'Song') {
          promises.push(_song.Song.fromMIDIFile(data.url));
        } else if (data.type === 'Instrument') {
          promises.push(loadInstrument(data));
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
  }

  return new Promise(function (resolve, reject) {

    Promise.all(promises).then(function (result) {

      var returnObj = {};

      result.forEach(function (data, i) {
        if (i === 0) {
          // parseAudio
          returnObj.legacy = data.legacy;
          returnObj.mp3 = data.mp3;
          returnObj.ogg = data.ogg;
        } else if (i === 1) {
          // parseMIDI
          returnObj.midi = data.midi;
          returnObj.webmidi = data.webmidi;
        } else {
          // Instruments, samples or MIDI files that got loaded during initialization
          result[loadKeys[i - 2]] = data;
        }
      });

      console.log('qambi', _qambi2.default.version);
      resolve(result);
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

},{"./init_audio":11,"./init_midi":12,"./qambi":25,"./sampler":29,"./song":35}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureMasterCompressor = exports.enableMasterCompressor = exports.getCompressionReduction = exports.getMasterVolume = exports.setMasterVolume = exports.masterCompressor = exports.unlockWebAudio = exports.masterGain = exports.context = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*
                                                                                                                                                                                                                                                    Sets up the basic audio routing, tests which audio formats are supported and parses the samples for the metronome ticks.
                                                                                                                                                                                                                                                  */

exports.initAudio = initAudio;
exports.getInitData = getInitData;

var _samples = require('./samples');

var _samples2 = _interopRequireDefault(_samples);

var _parse_audio = require('./parse_audio');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var data = void 0;
var masterGain = void 0;
var compressor = void 0;
var initialized = false;

var context = exports.context = function () {
  //console.log('init AudioContext')
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
  exports.
  //console.log('already done')
  masterGain = masterGain = context.createGain();
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

// this doesn't seem to be necessary anymore on iOS anymore
var _unlockWebAudio = function unlockWebAudio() {
  var src = context.createOscillator();
  var gainNode = context.createGain();
  gainNode.gain.value = 0;
  src.connect(gainNode);
  gainNode.connect(context.destination);
  if (typeof src.noteOn !== 'undefined') {
    src.start = src.noteOn;
    src.stop = src.noteOff;
  }
  src.start(0);
  src.stop(0.001);
  exports.unlockWebAudio = _unlockWebAudio = function unlockWebAudio() {};
};

exports.masterGain = masterGain;
exports.unlockWebAudio = _unlockWebAudio;
exports.masterCompressor = compressor;
exports.setMasterVolume = _setMasterVolume;
exports.getMasterVolume = _getMasterVolume;
exports.getCompressionReduction = _getCompressionReduction;
exports.enableMasterCompressor = _enableMasterCompressor;
exports.configureMasterCompressor = _configureMasterCompressor;

},{"./parse_audio":20,"./samples":30}],12:[function(require,module,exports){
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

},{"./util":39}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instrument = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_audio = require('./init_audio');

var _eventlistener = require('./eventlistener');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Instrument = exports.Instrument = function () {
  function Instrument() {
    _classCallCheck(this, Instrument);

    this.scheduledSamples = new Map();
    this.sustainedSamples = [];
    this.sustainPedalDown = false;
    this.output = null;
  }

  // mandatory


  _createClass(Instrument, [{
    key: 'connect',
    value: function connect(output) {
      this.output = output;
    }

    // mandatory

  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.output = null;
    }

    // mandatory

  }, {
    key: 'processMIDIEvent',
    value: function processMIDIEvent(event) {
      var _this = this;

      var time = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      //console.log(event, time)
      var sample = void 0;

      if (isNaN(time)) {
        // this shouldn't happen
        console.error('invalid time value');
        return;
        //time = context.currentTime
      }

      // this is an event that is send from an external MIDI keyboard
      if (time === 0) {
        time = _init_audio.context.currentTime;
      }

      if (event.type === 144) {
        //console.log(144, ':', time, context.currentTime, event.millis)

        sample = this.createSample(event);
        this.scheduledSamples.set(event.midiNoteId, sample);
        //console.log(sample)
        sample.output.connect(this.output);
        sample.start(time);
        //console.log('scheduling', event.id, event.midiNoteId)
        //console.log('start', event.midiNoteId)
      } else if (event.type === 128) {
          //console.log(128, ':', time, context.currentTime, event.millis)
          sample = this.scheduledSamples.get(event.midiNoteId);
          if (typeof sample === 'undefined') {
            //console.info('sample not found for event', event.id, ' midiNote', event.midiNoteId, event)
            return;
          }

          // we don't want that the sustain pedal prevents the an event to unscheduled
          if (this.sustainPedalDown === true) {
            //console.log(event.midiNoteId)
            this.sustainedSamples.push(event.midiNoteId);
          } else {
            sample.stop(time, function () {
              // console.log('stop', time, event.midiNoteId)
              _this.scheduledSamples.delete(event.midiNoteId);
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
                    sample = _this.scheduledSamples.get(midiNoteId);
                    if (sample) {
                      //sample.stop(time)
                      sample.stop(time, function () {
                        //console.log('stop', midiNoteId)
                        _this.scheduledSamples.delete(midiNoteId);
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

    // mandatory

  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      this.sustainedSamples = [];
      if (this.sustainPedalDown === true) {
        (0, _eventlistener.dispatchEvent)({
          type: 'sustainpedal',
          data: 'up'
        });
      }
      this.sustainPedalDown = false;

      this.scheduledSamples.forEach(function (sample) {
        sample.stop(_init_audio.context.currentTime);
      });
      this.scheduledSamples.clear();
    }

    // mandatory

  }, {
    key: 'unschedule',
    value: function unschedule(midiEvent) {
      var sample = this.scheduledSamples.get(midiEvent.midiNoteId);
      if (sample) {
        sample.stop(_init_audio.context.currentTime);
        this.scheduledSamples.delete(midiEvent.midiNoteId);
      }
    }
  }]);

  return Instrument;
}();

},{"./eventlistener":8,"./init_audio":11}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Metronome = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _track = require('./track');

var _part3 = require('./part');

var _parse_events = require('./parse_events');

var _midi_event = require('./midi_event');

var _util = require('./util');

var _position = require('./position');

var _sampler = require('./sampler');

var _init_audio = require('./init_audio');

var _constants = require('./constants');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var methodMap = new Map([['volume', 'setVolume'], ['instrument', 'setInstrument'], ['noteNumberAccentedTick', 'setNoteNumberAccentedTick'], ['noteNumberNonAccentedTick', 'setNoteNumberNonAccentedTick'], ['velocityAccentedTick', 'setVelocityAccentedTick'], ['velocityNonAccentedTick', 'setVelocityNonAccentedTick'], ['noteLengthAccentedTick', 'setNoteLengthAccentedTick'], ['noteLengthNonAccentedTick', 'setNoteLengthNonAccentedTick']]);

var Metronome = exports.Metronome = function () {
  function Metronome(song) {
    _classCallCheck(this, Metronome);

    this.song = song;
    this.track = new _track.Track(this.song.id + '_metronome');
    this.part = new _part3.Part();
    this.track.addParts(this.part);
    this.track.connect(this.song._output);

    this.events = [];
    this.precountEvents = [];
    this.precountDuration = 0;
    this.bars = 0;
    this.index = 0;
    this.index2 = 0;
    this.precountIndex = 0;
    this.reset();
  }

  _createClass(Metronome, [{
    key: 'reset',
    value: function reset() {

      var data = (0, _init_audio.getInitData)();
      var instrument = new _sampler.Sampler('metronome');
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
        ticks = position.ticks;

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
      this.allEvents = [].concat(_toConsumableArray(this.events), _toConsumableArray(this.song._timeEvents));
      // console.log(this.allEvents)
      (0, _util.sortEvents)(this.allEvents);
      (0, _parse_events.parseMIDINotes)(this.events);
      return this.events;
    }
  }, {
    key: 'setIndex2',
    value: function setIndex2(millis) {
      this.index2 = 0;
    }
  }, {
    key: 'getEvents2',
    value: function getEvents2(maxtime, timeStamp) {
      var result = [];

      for (var i = this.index2, maxi = this.allEvents.length; i < maxi; i++) {

        var event = this.allEvents[i];

        if (event.type === _constants.MIDIEventTypes.TEMPO || event.type === _constants.MIDIEventTypes.TIME_SIGNATURE) {
          if (event.millis < maxtime) {
            this.millisPerTick = event.millisPerTick;
            this.index2++;
          } else {
            break;
          }
        } else {
          var millis = event.ticks * this.millisPerTick;
          if (millis < maxtime) {
            event.time = millis + timeStamp;
            event.millis = millis;
            result.push(event);
            this.index2++;
          } else {
            break;
          }
        }
      }
      return result;
    }
  }, {
    key: 'addEvents',
    value: function addEvents() {
      var startBar = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      var _events, _part2;

      var endBar = arguments.length <= 1 || arguments[1] === undefined ? this.song.bars : arguments[1];
      var id = arguments.length <= 2 || arguments[2] === undefined ? 'add' : arguments[2];

      // console.log(startBar, endBar)
      var events = this.createEvents(startBar, endBar, id);
      (_events = this.events).push.apply(_events, _toConsumableArray(events));
      (_part2 = this.part).addEvents.apply(_part2, _toConsumableArray(events));
      this.bars = endBar;
      //console.log('getEvents %O', this.events, endBar)
      return events;
    }
  }, {
    key: 'createPrecountEvents',
    value: function createPrecountEvents(startBar, endBar, timeStamp) {

      this.timeStamp = timeStamp;

      //   let songStartPosition = this.song.getPosition()

      var songStartPosition = (0, _position.calculatePosition)(this.song, {
        type: 'barsbeats',
        target: [startBar],
        result: 'millis'
      });
      //console.log('starBar', songStartPosition.bar)

      var endPos = (0, _position.calculatePosition)(this.song, {
        type: 'barsbeats',
        //target: [songStartPosition.bar + precount, songStartPosition.beat, songStartPosition.sixteenth, songStartPosition.tick],
        target: [endBar],
        result: 'millis'
      });

      //console.log(songStartPosition, endPos)

      this.precountIndex = 0;
      this.startMillis = songStartPosition.millis;
      this.endMillis = endPos.millis;
      this.precountDuration = endPos.millis - this.startMillis;

      // do this so you can start precounting at any position in the song
      this.timeStamp -= this.startMillis;

      //console.log(this.precountDuration, this.startMillis, this.endMillis)

      this.precountEvents = this.createEvents(startBar, endBar - 1, 'precount');
      this.precountEvents = (0, _parse_events.parseEvents)([].concat(_toConsumableArray(this.song._timeEvents), _toConsumableArray(this.precountEvents)));

      //console.log(songStartPosition.bar, endPos.bar, precount, this.precountEvents.length);
      //console.log(this.precountEvents.length, this.precountDuration);
      return this.precountDuration;
    }
  }, {
    key: 'setPrecountIndex',
    value: function setPrecountIndex(millis) {
      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var event = _step.value;

          if (event.millis >= millis) {
            this.precountIndex = i;
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

      console.log(this.precountIndex);
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

      //maxtime += this.precountDuration

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
      this.song.update();
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
      if (!instrument instanceof Instrument) {
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

},{"./constants":7,"./init_audio":11,"./midi_event":15,"./parse_events":21,"./part":22,"./position":24,"./sampler":29,"./track":38,"./util":39}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIDIEvent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // @ flow


var _note = require('./note');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instanceIndex = 0;

var MIDIEvent = exports.MIDIEvent = function () {
  function MIDIEvent(ticks, type, data1) {
    var data2 = arguments.length <= 3 || arguments[3] === undefined ? -1 : arguments[3];

    _classCallCheck(this, MIDIEvent);

    this.id = this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();
    this.ticks = ticks;
    this.type = type;
    this.data1 = data1;
    this.data2 = data2;

    // sometimes NOTE_OFF events are sent as NOTE_ON events with a 0 velocity value
    if (type === 144 && data2 === 0) {
      this.type = 128;
    }

    this._part = null;
    this._track = null;
    this._song = null;

    if (type === 144 || type === 128) {
      var _getNoteData = (0, _note.getNoteData)({ number: data1 });

      this.noteName = _getNoteData.name;
      this.fullNoteName = _getNoteData.fullName;
      this.frequency = _getNoteData.frequency;
      this.octave = _getNoteData.octave;
    }
    //@TODO: add all other properties
  }

  _createClass(MIDIEvent, [{
    key: 'copy',
    value: function copy() {
      var m = new MIDIEvent(this.ticks, this.type, this.data1, this.data2);
      return m;
    }
  }, {
    key: 'transpose',
    value: function transpose(amount) {
      // may be better if not a public method?
      this.data1 += amount;
      this.frequency = 440 * Math.pow(2, (this.data1 - 69) / 12);
    }
  }, {
    key: 'move',
    value: function move(ticks) {
      this.ticks += ticks;
      if (this.midiNote) {
        this.midiNote.update();
      }
    }
  }, {
    key: 'moveTo',
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

},{"./note":19}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIDINote = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _midi_event = require('./midi_event');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instanceIndex = 0;

var MIDINote = exports.MIDINote = function () {
  function MIDINote(noteon, noteoff) {
    _classCallCheck(this, MIDINote);

    //if(noteon.type !== 144 || noteoff.type !== 128){
    if (noteon.type !== 144) {
      console.warn('cannot create MIDINote');
      return;
    }
    this.id = this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();
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

},{"./midi_event":15}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{"./midi_stream":17}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNoteData = getNoteData;

var _settings = require('./settings');

var pow = Math.pow;
var floor = Math.floor;
//const checkNoteName = /^[A-G]{1}(b{0,2}}|#{0,2})[\-]{0,1}[0-9]{1}$/
var regexCheckNoteName = /^[A-G]{1}(b|bb|#|##){0,1}$/;
var regexCheckFullNoteName = /^[A-G]{1}(b|bb|#|##){0,1}(\-1|[0-9]{1})$/;
var regexSplitFullName = /^([A-G]{1}(b|bb|#|##){0,1})(\-1|[0-9]{1})$/;
var regexGetOctave = /(\-1|[0-9]{1})$/;

var noteNames = {
  sharp: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'enharmonic-sharp': ['B#', 'C#', 'C##', 'D#', 'D##', 'E#', 'F#', 'F##', 'G#', 'G##', 'A#', 'A##'],
  'enharmonic-flat': ['Dbb', 'Db', 'Ebb', 'Eb', 'Fb', 'Gbb', 'Gb', 'Abb', 'Ab', 'Bbb', 'Bb', 'Cb']
};

/*
  settings = {
    name: 'C',
    octave: 4,
    fullName: 'C4',
    number: 60,
    frequency: 234.16 // not yet implemented
  }
*/
function getNoteData(settings) {
  var fullName = settings.fullName;
  var name = settings.name;
  var octave = settings.octave;
  var mode = settings.mode;
  var number = settings.number;
  var frequency = settings.frequency;


  if (typeof name !== 'string' && typeof fullName !== 'string' && typeof number !== 'number' && typeof frequency !== 'number') {
    return null;
  }

  if (number < 0 || number > 127) {
    console.log('please provide a note between 0 (C-1) and 127 (G9)');
    return null;
  }

  mode = _checkNoteNameMode(mode);
  //console.log(mode)

  if (typeof number === 'number') {
    var _getNoteName2 = _getNoteName(number, mode);

    fullName = _getNoteName2.fullName;
    name = _getNoteName2.name;
    octave = _getNoteName2.octave;
  } else if (typeof name === 'string') {

    if (regexCheckNoteName.test(name)) {
      fullName = '' + name + octave;
      number = _getNoteNumber(name, octave);
    } else {
      console.log('invalid name ' + name);
      return null;
    }
  } else if (typeof fullName === 'string') {

    if (regexCheckFullNoteName.test(fullName)) {
      var _splitFullName2 = _splitFullName(fullName);

      octave = _splitFullName2.octave;
      name = _splitFullName2.name;

      number = _getNoteNumber(name, octave);
    } else {
      console.log('invalid fullname ' + fullName);
      return null;
    }
  }

  var data = {
    name: name,
    octave: octave,
    fullName: fullName,
    number: number,
    frequency: _getFrequency(number),
    blackKey: _isBlackKey(number)
  };
  //console.log(data)
  return data;
}

function _getNoteName(number) {
  var mode = arguments.length <= 1 || arguments[1] === undefined ? _settings.noteNameMode : arguments[1];

  //let octave = Math.floor((number / 12) - 2), // → in Cubase central C = C3 instead of C4
  var octave = floor(number / 12 - 1);
  var name = noteNames[mode][number % 12];
  return {
    fullName: '' + name + octave,
    name: name,
    octave: octave
  };
}

function _getOctave(fullName) {
  return parseInt(fullName.match(regexGetOctave)[0], 10);
}

function _splitFullName(fullName) {
  var octave = _getOctave(fullName);
  return {
    octave: octave,
    name: fullName.replace(octave, '')
  };
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

    //number = (index + 12) + (octave * 12) + 12 // → in Cubase central C = C3 instead of C4
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
    console.log('please provide a note between 0 (C-1) and 127 (G9)');
    return -1;
  }
  return number;
}

function _getFrequency(number) {
  return _settings.pitch * pow(2, (number - 69) / 12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
}

//@TODO: calculate note from frequency
function _getPitch(hertz) {
  //fm  =  2(m−69)/12(440 Hz).
}

function _checkNoteNameMode(mode) {
  var keys = Object.keys(noteNames);
  var result = keys.includes(mode);
  //console.log(result)
  if (result === false) {
    if (typeof mode !== 'undefined') {
      console.log(mode + ' is not a valid note name mode, using "' + _settings.noteNameMode + '" instead');
    }
    mode = _settings.noteNameMode;
  }
  return mode;
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

},{"./settings":33}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.decodeSample = decodeSample;
exports.parseSamples2 = parseSamples2;
exports.parseSamples = parseSamples;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _init_audio = require('./init_audio');

var _util = require('./util');

var _eventlistener = require('./eventlistener');

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
      }, function onError() {
        console.log('error decoding audiodata [ID: ' + id + ']');
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
  /*
  setTimeout(() => {
    dispatchEvent({
      type: 'loading',
      data: url
    })
  }, 0)
  */
  (0, _eventlistener.dispatchEvent)({
    type: 'loading',
    data: url
  });

  var executor = function executor(resolve) {
    // console.log(url)
    (0, _isomorphicFetch2.default)(url, {
      method: 'GET'
    }).then(function (response) {
      if (response.ok) {
        response.arrayBuffer().then(function (data) {
          //console.log(id, data)
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

function getPromises(promises, sample, key, baseUrl, every) {

  var getSample = function getSample() {
    if (key !== 'release' && key !== 'info' && key !== 'sustain') {
      //console.log(key)
      if (sample instanceof ArrayBuffer) {
        promises.push(decodeSample(sample, key, baseUrl, every));
      } else if (typeof sample === 'string') {
        if ((0, _util.checkIfBase64)(sample)) {
          promises.push(decodeSample((0, _util.base64ToBinary)(sample), key, baseUrl, every));
        } else {
          //console.log(baseUrl + sample)
          promises.push(loadAndParseSample(baseUrl + escape(sample), key, every));
        }
      } else if ((typeof sample === 'undefined' ? 'undefined' : _typeof(sample)) === 'object') {
        sample = sample.sample || sample.buffer || sample.base64 || sample.url;
        getSample(promises, sample, key, baseUrl, every);
        //console.log(key, sample)
        //console.log(sample, promises.length)
      }
    }
  };

  getSample();
}

// only for internally use in qambi
function parseSamples2(mapping) {
  var every = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var type = (0, _util.typeString)(mapping),
      promises = [],
      baseUrl = '';

  if (typeof mapping.baseUrl === 'string') {
    baseUrl = mapping.baseUrl;
    delete mapping.baseUrl;
  }

  //console.log(mapping, baseUrl)

  every = typeof every === 'function' ? every : false;
  //console.log(type, mapping)
  if (type === 'object') {
    Object.keys(mapping).forEach(function (key) {
      // if(isNaN(key) === false){
      //   key = parseInt(key, 10)
      // }
      var a = mapping[key];
      //console.log(key, a, typeString(a))
      if ((0, _util.typeString)(a) === 'array') {
        a.forEach(function (map) {
          //console.log(map)
          getPromises(promises, map, key, baseUrl, every);
        });
      } else {
        getPromises(promises, a, key, baseUrl, every);
      }
    });
  } else if (type === 'array') {
    (function () {
      var key = void 0;
      mapping.forEach(function (sample) {
        // key is deliberately undefined
        getPromises(promises, sample, key, baseUrl, every);
      });
    })();
  }

  return new Promise(function (resolve) {
    Promise.all(promises).then(function (values) {
      //console.log(type, values)
      if (type === 'object') {
        mapping = {};
        values.forEach(function (value) {
          // support for multi layered instruments
          var map = mapping[value.id];
          var type = (0, _util.typeString)(map);
          if (type !== 'undefined') {
            if (type === 'array') {
              map.push(value.buffer);
            } else {
              mapping[value.id] = [map, value.buffer];
            }
          } else {
            mapping[value.id] = value.buffer;
          }
        });
        //console.log(mapping)
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
    //console.log(data[0])
    return parseSamples2(data[0]);
  }
  return parseSamples2(data);
}

},{"./eventlistener":8,"./init_audio":11,"./util":39,"isomorphic-fetch":5}],21:[function(require,module,exports){
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
        /*
                event.millis = millis
        */
        result.push(event);

      //console.log(event.bar)

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
  //console.log(events)
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = events[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var event = _step2.value;

      if (typeof event._part === 'undefined' || typeof event._track === 'undefined') {
        console.log('no part and/or track set', event);
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
        note._track = noteOn._track;
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

},{"./midi_note":16,"./util":39}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Part = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // @ flow

var _util = require('./util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instanceIndex = 0;

var Part = exports.Part = function () {
  function Part() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    _classCallCheck(this, Part);

    this.id = this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();
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
      var _this = this,
          _events;

      //console.log(events)
      var track = this._track;

      for (var _len = arguments.length, events = Array(_len), _key = 0; _key < _len; _key++) {
        events[_key] = arguments[_key];
      }

      events.forEach(function (event) {
        event._part = _this;
        _this._eventsById.set(event.id, event);
        if (track) {
          event._track = track;
          if (track._song) {
            event._song = track._song;
          }
        }
      });
      (_events = this._events).push.apply(_events, events);

      if (track) {
        var _track$_events;

        (_track$_events = track._events).push.apply(_track$_events, events);
        track._needsUpdate = true;
      }
      if (this._song) {
        var _song$_newEvents;

        (_song$_newEvents = this._song._newEvents).push.apply(_song$_newEvents, events);
        this._song._changedParts.push(this);
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
          if (track._song) {
            event._song = null;
          }
        }
      });
      if (track) {
        track._needsUpdate = true;
        track._createEventArray = true;
      }
      if (this._song) {
        var _song$_removedEvents;

        (_song$_removedEvents = this._song._removedEvents).push.apply(_song$_removedEvents, events);
        this._song._changedParts.push(this);
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

        this._song._changedParts.push(this);
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

        this._song._changedParts.push(this);
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

},{"./util":39}],23:[function(require,module,exports){
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
var instanceIndex = 0;

var Playhead = exports.Playhead = function () {
  function Playhead(song) {
    var type = arguments.length <= 1 || arguments[1] === undefined ? 'all' : arguments[1];

    _classCallCheck(this, Playhead);

    this.id = this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();
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
      this.set('millis', this.song._currentMillis);
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
      var sustainpedalEvents = [];

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
                sustainpedalEvents.push(event);
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
      // let num = sustainpedalEvents.length
      // if(num > 0){
      //   console.log(this.currentValue, num, sustainpedalEvents[num - 1].data2, sustainpedalEvents)
      // }

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
                data: note.noteOn
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
              data: note.noteOff
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

},{"./eventlistener.js":8,"./position.js":24,"./util.js":39}],24:[function(require,module,exports){
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
      //console.log(song, target)
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

},{"./util":39}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sampler = exports.SimpleSynth = exports.Instrument = exports.Part = exports.Track = exports.Song = exports.MIDINote = exports.MIDIEvent = exports.getNoteData = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.parseMIDIFile = exports.parseSamples = exports.MIDIEventTypes = exports.getGMInstruments = exports.getInstruments = exports.setBufferTime = exports.init = exports.version = undefined;

var _note = require('./note');

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _part = require('./part');

var _track = require('./track');

var _song = require('./song');

var _instrument = require('./instrument');

var _sampler = require('./sampler');

var _simple_synth = require('./simple_synth');

var _midifile = require('./midifile');

var _init = require('./init');

var _init_audio = require('./init_audio');

var _init_midi = require('./init_midi');

var _parse_audio = require('./parse_audio');

var _constants = require('./constants');

var _settings = require('./settings');

var _eventlistener = require('./eventlistener');

var version = '1.0.0-beta21';

var getAudioContext = function getAudioContext() {
  return _init_audio.context;
};

var qambi = {
  version: version,
  // from ./note
  getNoteData: _note.getNoteData,

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

  getInstruments: _settings.getInstruments,
  getGMInstruments: _settings.getGMInstruments,

  addEventListener: function addEventListener(type, callback) {
    return (0, _eventlistener.addEventListener)(type, callback);
  },
  removeEventListener: function removeEventListener(type, id) {
    (0, _eventlistener.removeEventListener)(type, id);
  },


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

  // from ./simple_synth
  SimpleSynth: _simple_synth.SimpleSynth,

  // from ./sampler
  Sampler: _sampler.Sampler,

  log: function log(id) {
    switch (id) {
      case 'functions':
        console.log('functions:\n          getAudioContext\n          getMasterVolume\n          setMasterVolume\n          getMIDIAccess\n          getMIDIInputs\n          getMIDIOutputs\n          getMIDIInputIds\n          getMIDIOutputIds\n          getMIDIInputsById\n          getMIDIOutputsById\n          parseMIDIFile\n          setBufferTime\n          getInstruments\n          getGMInstruments\n        ');
        break;
      default:
    }
  }
};

exports.default = qambi;
exports.version = version;
exports.

// from ./init
init = _init.init;
exports.

// from ./settings
setBufferTime = _settings.setBufferTime;
exports.getInstruments = _settings.getInstruments;
exports.getGMInstruments = _settings.getGMInstruments;
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

// from ./init_midi
getMIDIAccess = _init_midi.getMIDIAccess;
exports.getMIDIInputs = _init_midi.getMIDIInputs;
exports.getMIDIOutputs = _init_midi.getMIDIOutputs;
exports.getMIDIInputIds = _init_midi.getMIDIInputIds;
exports.getMIDIOutputIds = _init_midi.getMIDIOutputIds;
exports.getMIDIInputsById = _init_midi.getMIDIInputsById;
exports.getMIDIOutputsById = _init_midi.getMIDIOutputsById;
exports.

// from ./note
getNoteData = _note.getNoteData;
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

// from ./simple_synth
SimpleSynth = _simple_synth.SimpleSynth;
exports.

// from ./sampler
Sampler = _sampler.Sampler;

},{"./constants":7,"./eventlistener":8,"./init":10,"./init_audio":11,"./init_midi":12,"./instrument":13,"./midi_event":15,"./midi_note":16,"./midifile":18,"./note":19,"./parse_audio":20,"./part":22,"./sampler":29,"./settings":33,"./simple_synth":34,"./song":35,"./track":38}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sample = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.fadeOut = fadeOut;

var _init_audio = require('./init_audio.js');

var _util = require('./util.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sample = exports.Sample = function () {
  function Sample(sampleData, event) {
    _classCallCheck(this, Sample);

    this.event = event;
    this.sampleData = sampleData;
  }

  _createClass(Sample, [{
    key: 'start',
    value: function start(time) {
      var _sampleData = this.sampleData;
      var sustainStart = _sampleData.sustainStart;
      var sustainEnd = _sampleData.sustainEnd;
      //console.log(sustainStart, sustainEnd)

      if (sustainStart && sustainEnd) {
        this.source.loop = true;
        this.source.loopStart = sustainStart;
        this.source.loopEnd = sustainEnd;
      }
      this.source.start(time);
    }
  }, {
    key: 'stop',
    value: function stop(time, cb) {
      var _this = this;

      var _sampleData2 = this.sampleData;
      var releaseDuration = _sampleData2.releaseDuration;
      var releaseEnvelope = _sampleData2.releaseEnvelope;
      var releaseEnvelopeArray = _sampleData2.releaseEnvelopeArray;
      //console.log(releaseDuration, releaseEnvelope)

      this.source.onended = cb;

      if (releaseDuration && releaseEnvelope) {
        this.startReleasePhase = time;
        this.releaseFunction = function () {
          fadeOut(_this.output, {
            releaseDuration: releaseDuration,
            releaseEnvelope: releaseEnvelope,
            releaseEnvelopeArray: releaseEnvelopeArray
          });
        };
        try {
          this.source.stop(time + releaseDuration);
        } catch (e) {
          // in Firefox and Safari you can not call stop more than once
        }
        this.checkPhase();
      } else {
        try {
          this.source.stop(time);
        } catch (e) {
          // in Firefox and Safari you can not call stop more than once
        }
      }
    }
  }, {
    key: 'checkPhase',
    value: function checkPhase() {
      //console.log(context.currentTime, this.startReleasePhase)
      if (_init_audio.context.currentTime >= this.startReleasePhase) {
        this.releaseFunction();
        return;
      }
      requestAnimationFrame(this.checkPhase.bind(this));
    }
  }]);

  return Sample;
}();

function fadeOut(gainNode, settings) {
  var now = _init_audio.context.currentTime;
  var values = void 0,
      i = void 0,
      maxi = void 0;

  //console.log(settings)
  try {
    switch (settings.releaseEnvelope) {

      case 'linear':
        gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0.0, now + settings.releaseDuration);
        break;

      case 'equal power':
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
  } catch (e) {
    // in Firefox and Safari you can not call setValueCurveAtTime and linearRampToValueAtTime more than once

    //console.log(values, now, settings.releaseDuration)
    //console.log(e, gainNode)
  }
}

},{"./init_audio.js":11,"./util.js":39}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SampleBuffer = undefined;

var _sample = require('./sample');

var _init_audio = require('./init_audio');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var instanceIndex = 0;

var SampleBuffer = exports.SampleBuffer = function (_Sample) {
  _inherits(SampleBuffer, _Sample);

  function SampleBuffer(sampleData, event) {
    _classCallCheck(this, SampleBuffer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SampleBuffer).call(this, sampleData, event));

    _this.id = _this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();

    if (_this.sampleData === -1 || typeof _this.sampleData.buffer === 'undefined') {
      // create dummy source
      _this.source = {
        start: function start() {},
        stop: function stop() {},
        connect: function connect() {}
      };
    } else {
      _this.source = _init_audio.context.createBufferSource();
      //console.log(sampleData)
      _this.source.buffer = sampleData.buffer;
      //console.log(this.source.buffer)
    }
    _this.output = _init_audio.context.createGain();
    _this.volume = event.data2 / 127;
    _this.output.gain.value = _this.volume;
    _this.source.connect(_this.output);
    //this.output.connect(context.destination)
    return _this;
  }

  return SampleBuffer;
}(_sample.Sample);

},{"./init_audio":11,"./sample":26}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SampleOscillator = undefined;

var _sample = require('./sample');

var _init_audio = require('./init_audio');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var instanceIndex = 0;

var SampleOscillator = exports.SampleOscillator = function (_Sample) {
  _inherits(SampleOscillator, _Sample);

  function SampleOscillator(sampleData, event) {
    _classCallCheck(this, SampleOscillator);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SampleOscillator).call(this, sampleData, event));

    _this.id = _this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();

    if (_this.sampleData === -1) {
      // create dummy source
      _this.source = {
        start: function start() {},
        stop: function stop() {},
        connect: function connect() {}
      };
    } else {

      // @TODO add type 'custom' => PeriodicWave
      var type = _this.sampleData.type;
      _this.source = _init_audio.context.createOscillator();

      switch (type) {
        case 'sine':
        case 'square':
        case 'sawtooth':
        case 'triangle':
          _this.source.type = type;
          break;
        default:
          _this.source.type = 'square';
      }
      _this.source.frequency.value = event.frequency;
    }
    _this.output = _init_audio.context.createGain();
    _this.volume = event.data2 / 127;
    _this.output.gain.value = _this.volume;
    _this.source.connect(_this.output);
    //this.output.connect(context.destination)
    return _this;
  }

  return SampleOscillator;
}(_sample.Sample);

},{"./init_audio":11,"./sample":26}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sampler = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _instrument = require('./instrument');

var _note = require('./note');

var _parse_audio = require('./parse_audio');

var _util = require('./util');

var _fetch_helpers = require('./fetch_helpers');

var _sample_buffer = require('./sample_buffer');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var instanceIndex = 0;

var Sampler = exports.Sampler = function (_Instrument) {
  _inherits(Sampler, _Instrument);

  function Sampler(name) {
    _classCallCheck(this, Sampler);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Sampler).call(this));

    _this.id = _this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();
    _this.name = name || _this.id;

    // create a samples data object for all 128 velocity levels of all 128 notes
    _this.samplesData = new Array(128).fill(-1);
    _this.samplesData = _this.samplesData.map(function () {
      return new Array(128).fill(-1);
    });
    return _this;
  }

  _createClass(Sampler, [{
    key: 'createSample',
    value: function createSample(event) {
      return new _sample_buffer.SampleBuffer(this.samplesData[event.data1][event.data2], event);
    }
  }, {
    key: '_loadJSON',
    value: function _loadJSON(data) {
      if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && typeof data.url === 'string') {
        return (0, _fetch_helpers.fetchJSON)(data.url);
      }
      return Promise.resolve(data);
    }

    // load and parse

  }, {
    key: 'parseSampleData',
    value: function parseSampleData(data) {
      var _this2 = this;

      // check if we have to overrule the baseUrl of the sampels
      var baseUrl = null;
      if (typeof data.baseUrl === 'string') {
        baseUrl = data.baseUrl;
      }

      if (typeof data.release !== 'undefined') {
        this.setRelease(data.release[0], data.release[1]);
        //console.log(1, data.release[0], data.release[1])
      }

      //return Promise.resolve()

      return new Promise(function (resolve, reject) {
        _this2._loadJSON(data).then(function (json) {
          //console.log(json)
          data = json;
          if (baseUrl !== null) {
            json.baseUrl = baseUrl;
          }
          if (typeof data.release !== 'undefined') {
            _this2.setRelease(data.release[0], data.release[1]);
            //console.log(2, data.release[0], data.release[1])
          }
          return (0, _parse_audio.parseSamples)(data);
        }).then(function (result) {
          if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              var _loop = function _loop() {
                var noteId = _step.value;

                var buffer = result[noteId];
                var sampleData = data[noteId];

                if (typeof sampleData === 'undefined') {
                  console.log('sampleData is undefined', noteId);
                } else if ((0, _util.typeString)(buffer) === 'array') {

                  //console.log(buffer, sampleData)
                  sampleData.forEach(function (sd, i) {
                    //console.log(noteId, buffer[i])
                    if (typeof sd === 'string') {
                      sd = {
                        buffer: buffer[i]
                      };
                    } else {
                      sd.buffer = buffer[i];
                    }
                    sd.note = parseInt(noteId, 10);
                    _this2._updateSampleData(sd);
                  });
                } else {

                  if (typeof sampleData === 'string') {
                    sampleData = {
                      buffer: buffer
                    };
                  } else {
                    sampleData.buffer = buffer;
                  }
                  sampleData.note = parseInt(noteId, 10);
                  _this2._updateSampleData(sampleData);
                }
              };

              for (var _iterator = Object.keys(result)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                _loop();
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
          } else {

            result.forEach(function (sample) {
              var sampleData = data[sample];
              if (typeof sampleData === 'undefined') {
                console.log('sampleData is undefined', sample);
              } else {
                if (typeof sampleData === 'string') {
                  sampleData = {
                    buffer: sample.buffer
                  };
                } else {
                  sampleData.buffer = sample.buffer;
                }
                sampleData.note = sample;
                _this2._updateSampleData(sampleData);
                //this.updateSampleData(sampleData)
              }
            });
          }
          //console.log(new Date().getTime())
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
        // support for multi layered instruments
        //console.log(noteData, typeString(noteData))
        if ((0, _util.typeString)(noteData) === 'array') {
          noteData.forEach(function (velocityLayer) {
            _this3._updateSampleData(velocityLayer);
          });
        } else {
          _this3._updateSampleData(noteData);
        }
      });
    }
  }, {
    key: 'clearSampleData',
    value: function clearSampleData() {}
  }, {
    key: '_updateSampleData',
    value: function _updateSampleData() {
      var _this4 = this;

      var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      //console.log(data)
      var note = data.note;
      var _data$buffer = data.buffer;
      var buffer = _data$buffer === undefined ? null : _data$buffer;
      var _data$sustain = data.sustain;
      var sustain = _data$sustain === undefined ? [null, null] : _data$sustain;
      var _data$release = data.release;
      var release = _data$release === undefined ? [null, 'linear'] : _data$release;
      var _data$pan = data.pan;
      var // release duration is in seconds!
      pan = _data$pan === undefined ? null : _data$pan;
      var _data$velocity = data.velocity;
      var velocity = _data$velocity === undefined ? [0, 127] : _data$velocity;


      if (typeof note === 'undefined') {
        console.warn('please provide a notenumber or a notename');
        return;
      }

      // get notenumber from notename and check if the notenumber is valid
      var n = (0, _note.getNoteData)({ number: note });
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

      // console.log(note, buffer)
      // console.log(sustainStart, sustainEnd)
      // console.log(releaseDuration, releaseEnvelope)
      // console.log(pan)
      // console.log(velocityStart, velocityEnd)

      this.samplesData[note].forEach(function (sampleData, i) {
        if (i >= velocityStart && i <= velocityEnd) {
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
        //console.log('%O', this.samplesData[note])
      });
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
      this.samplesData.forEach(function (samples, id) {
        samples.forEach(function (sample, i) {
          if (sample === -1) {
            sample = {
              id: id
            };
          }
          sample.releaseDuration = duration;
          sample.releaseEnvelope = envelope;
          samples[i] = sample;
        });
      });
      //console.log('%O', this.samplesData)
    }
  }]);

  return Sampler;
}(_instrument.Instrument);

},{"./fetch_helpers":9,"./instrument":13,"./note":19,"./parse_audio":20,"./sample_buffer":27,"./util":39}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveAsMIDIFile = saveAsMIDIFile;

var _filesaverjs = require('filesaverjs');

var PPQ = 960; /*
               
               
               This code is based on https://github.com/sergi/jsmidi
               
               info: http://www.deluge.co/?q=midi-tempo-bpm
               
               */

var HDR_PPQ = str2Bytes(PPQ.toString(16), 2);

var HDR_CHUNKID = ['M'.charCodeAt(0), 'T'.charCodeAt(0), 'h'.charCodeAt(0), 'd'.charCodeAt(0)];
var HDR_CHUNK_SIZE = [0x0, 0x0, 0x0, 0x6]; // Header size for SMF
var HDR_TYPE0 = [0x0, 0x0]; // Midi Type 0 id
var HDR_TYPE1 = [0x0, 0x1]; // Midi Type 1 id
//HDR_PPQ = [0x01, 0xE0] // Defaults to 480 ticks per beat
//HDR_PPQ = [0x00, 0x80] // Defaults to 128 ticks per beat

var TRK_CHUNKID = ['M'.charCodeAt(0), 'T'.charCodeAt(0), 'r'.charCodeAt(0), 'k'.charCodeAt(0)];

// Meta event codes
var META_SEQUENCE = 0x00;
var META_TEXT = 0x01;
var META_COPYRIGHT = 0x02;
var META_TRACK_NAME = 0x03;
var META_INSTRUMENT = 0x04;
var META_LYRIC = 0x05;
var META_MARKER = 0x06;
var META_CUE_POINT = 0x07;
var META_CHANNEL_PREFIX = 0x20;
var META_END_OF_TRACK = 0x2f;
var META_TEMPO = 0x51;
var META_SMPTE = 0x54;
var META_TIME_SIG = 0x58;
var META_KEY_SIG = 0x59;
var META_SEQ_EVENT = 0x7f;

function saveAsMIDIFile(song) {
  var fileName = arguments.length <= 1 || arguments[1] === undefined ? song.name : arguments[1];
  var ppq = arguments.length <= 2 || arguments[2] === undefined ? 960 : arguments[2];


  PPQ = ppq;
  HDR_PPQ = str2Bytes(PPQ.toString(16), 2);

  var byteArray = [].concat(HDR_CHUNKID, HDR_CHUNK_SIZE, HDR_TYPE1);
  var tracks = song.getTracks();
  var numTracks = tracks.length + 1;
  var i = void 0,
      maxi = void 0,
      track = void 0,
      midiFile = void 0,
      destination = void 0,
      b64 = void 0;
  var arrayBuffer = void 0,
      dataView = void 0,
      uintArray = void 0;

  byteArray = byteArray.concat(str2Bytes(numTracks.toString(16), 2), HDR_PPQ);

  //console.log(byteArray);
  byteArray = byteArray.concat(trackToBytes(song._timeEvents, song._durationTicks, 'tempo'));

  for (i = 0, maxi = tracks.length; i < maxi; i++) {
    track = tracks[i];
    var instrument = void 0;
    if (track._instrument !== null) {
      instrument = track._instrument.id;
    }
    //console.log(track.name, track._events.length, instrument)
    byteArray = byteArray.concat(trackToBytes(track._events, song._durationTicks, track.name, instrument));
    //byteArray = byteArray.concat(trackToBytes(track._events, song._lastEvent.icks, track.name, instrument))
  }

  //b64 = btoa(codes2Str(byteArray))
  //window.location.assign("data:audio/midi;base64," + b64)
  //console.log(b64)// send to server

  maxi = byteArray.length;
  arrayBuffer = new ArrayBuffer(maxi);
  uintArray = new Uint8Array(arrayBuffer);
  for (i = 0; i < maxi; i++) {
    uintArray[i] = byteArray[i];
  }
  midiFile = new Blob([uintArray], { type: 'application/x-midi', endings: 'transparent' });
  fileName = fileName.replace(/\.midi$/, '');
  //let patt = /\.mid[i]{0,1}$/
  var patt = /\.mid$/;
  var hasExtension = patt.test(fileName);
  if (hasExtension === false) {
    fileName += '.mid';
  }
  //console.log(fileName, hasExtension)
  (0, _filesaverjs.saveAs)(midiFile, fileName);
  //window.location.assign(window.URL.createObjectURL(midiFile))
}

function trackToBytes(events, lastEventTicks, trackName) {
  var instrumentName = arguments.length <= 3 || arguments[3] === undefined ? 'no instrument' : arguments[3];

  var lengthBytes,
      i,
      maxi,
      event,
      status,
      trackLength,
      // number of bytes in track chunk
  ticks = 0,
      delta = 0,
      trackBytes = [];

  if (trackName) {
    trackBytes.push(0x00);
    trackBytes.push(0xFF);
    trackBytes.push(0x03);
    trackBytes = trackBytes.concat(convertToVLQ(trackName.length));
    trackBytes = trackBytes.concat(stringToNumArray(trackName));
  }

  if (instrumentName) {
    trackBytes.push(0x00);
    trackBytes.push(0xFF);
    trackBytes.push(0x04);
    trackBytes = trackBytes.concat(convertToVLQ(instrumentName.length));
    trackBytes = trackBytes.concat(stringToNumArray(instrumentName));
  }

  for (i = 0, maxi = events.length; i < maxi; i++) {
    event = events[i];
    delta = event.ticks - ticks;
    delta = convertToVLQ(delta);
    //console.log(delta);
    trackBytes = trackBytes.concat(delta);
    //trackBytes.push.apply(trackBytes, delta);
    if (event.type === 0x80 || event.type === 0x90) {
      // note off, note on
      //status = parseInt(event.type.toString(16) + event.channel.toString(16), 16);
      status = event.type + (event.channel || 0);
      trackBytes.push(status);
      trackBytes.push(event.data1);
      trackBytes.push(event.data2);
    } else if (event.type === 0x51) {
      // tempo
      trackBytes.push(0xFF);
      trackBytes.push(0x51);
      trackBytes.push(0x03); // length
      //trackBytes = trackBytes.concat(convertToVLQ(3));// length
      var microSeconds = Math.round(60000000 / event.bpm);
      //console.log(event.bpm)
      trackBytes = trackBytes.concat(str2Bytes(microSeconds.toString(16), 3));
    } else if (event.type === 0x58) {
      // time signature
      var denom = event.denominator;
      if (denom === 2) {
        denom = 0x01;
      } else if (denom === 4) {
        denom = 0x02;
      } else if (denom === 8) {
        denom = 0x03;
      } else if (denom === 16) {
        denom = 0x04;
      } else if (denom === 32) {
        denom = 0x05;
      }
      //console.log(event.denominator, event.nominator)
      trackBytes.push(0xFF);
      trackBytes.push(0x58);
      trackBytes.push(0x04); // length
      //trackBytes = trackBytes.concat(convertToVLQ(4));// length
      trackBytes.push(event.nominator);
      trackBytes.push(denom);
      trackBytes.push(PPQ / event.nominator);
      trackBytes.push(0x08); // 32nd notes per crotchet
      //console.log(trackName, event.nominator, event.denominator, denom, PPQ/event.nominator);
    }
    // set the new ticks reference
    //console.log(status, event.ticks, ticks);
    ticks = event.ticks;
  }
  delta = lastEventTicks - ticks;
  //console.log('d', delta, 't', ticks, 'l', lastEventTicks);
  delta = convertToVLQ(delta);
  //console.log(trackName, ticks, delta);
  trackBytes = trackBytes.concat(delta);
  trackBytes.push(0xFF);
  trackBytes.push(0x2F);
  trackBytes.push(0x00);
  //console.log(trackName, trackBytes);
  trackLength = trackBytes.length;
  lengthBytes = str2Bytes(trackLength.toString(16), 4);
  return [].concat(TRK_CHUNKID, lengthBytes, trackBytes);
}

// Helper functions

/*
 * Converts an array of bytes to a string of hexadecimal characters. Prepares
 * it to be converted into a base64 string.
 *
 * @param byteArray {Array} array of bytes that will be converted to a string
 * @returns hexadecimal string
 */

function codes2Str(byteArray) {
  return String.fromCharCode.apply(null, byteArray);
}

/*
 * Converts a String of hexadecimal values to an array of bytes. It can also
 * add remaining '0' nibbles in order to have enough bytes in the array as the
 * |finalBytes| parameter.
 *
 * @param str {String} string of hexadecimal values e.g. '097B8A'
 * @param finalBytes {Integer} Optional. The desired number of bytes that the returned array should contain
 * @returns array of nibbles.
 */

function str2Bytes(str, finalBytes) {
  if (finalBytes) {
    while (str.length / 2 < finalBytes) {
      str = '0' + str;
    }
  }

  var bytes = [];
  for (var i = str.length - 1; i >= 0; i = i - 2) {
    var chars = i === 0 ? str[i] : str[i - 1] + str[i];
    bytes.unshift(parseInt(chars, 16));
  }

  return bytes;
}

/**
 * Translates number of ticks to MIDI timestamp format, returning an array of
 * bytes with the time values. Midi has a very particular time to express time,
 * take a good look at the spec before ever touching this function.
 *
 * @param ticks {Integer} Number of ticks to be translated
 * @returns Array of bytes that form the MIDI time value
 */
function convertToVLQ(ticks) {
  var buffer = ticks & 0x7F;

  while (ticks = ticks >> 7) {
    buffer <<= 8;
    buffer |= ticks & 0x7F | 0x80;
  }

  var bList = [];
  while (true) {
    bList.push(buffer & 0xff);

    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }

  //console.log(ticks, bList);
  return bList;
}

/*
 * Converts a string into an array of ASCII char codes for every character of
 * the string.
 *
 * @param str {String} String to be converted
 * @returns array with the charcode values of the string
 */
var AP = Array.prototype;
function stringToNumArray(str) {
  // return str.split().forEach(char => {
  //   return char.charCodeAt(0)
  // })
  return AP.map.call(str, function (char) {
    return char.charCodeAt(0);
  });
}

},{"filesaverjs":4}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // millis


var _init_midi = require('./init_midi');

var _init_audio = require('./init_audio');

var _midi_event = require('./midi_event');

var _settings = require('./settings');

var _util = require('./util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// millis

var Scheduler = function () {
  function Scheduler(song) {
    _classCallCheck(this, Scheduler);

    this.song = song;
    this.notes = new Map();
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
      this.looped = false;
      this.setIndex(this.songStartMillis);
    }
  }, {
    key: 'updateSong',
    value: function updateSong() {
      //this.songCurrentMillis = this.song._currentMillis
      this.events = this.song._allEvents;
      this.numEvents = this.events.length;
      this.index = 0;
      this.maxtime = 0;
      //this.precountingDone = false
      this.setIndex(this.song._currentMillis);
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
      var event = void 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          event = _step.value;

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
      // this.notes = new Map()
      //this.looped = false
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
        //console.log(this.songCurrentMillis)
        events = this.song._metronome.getPrecountEvents(this.maxtime);

        // if(events.length > 0){
        //   console.log(context.currentTime * 1000)
        //   console.log(events)
        // }

        if (this.maxtime > this.song._metronome.endMillis && this.precountingDone === false) {
          var _events;

          this.precountingDone = true;
          this.timeStamp += this.song._precountDuration;

          // start scheduling events of the song -> add the first events of the song
          this.songCurrentMillis = this.songStartMillis;
          //console.log('---->', this.songCurrentMillis)
          this.songCurrentMillis += diff;
          this.maxtime = this.songCurrentMillis + _settings.bufferTime;
          (_events = events).push.apply(_events, _toConsumableArray(this.getEvents()));
          //console.log(events)
        }
      } else {
          this.songCurrentMillis += diff;
          this.maxtime = this.songCurrentMillis + _settings.bufferTime;
          events = this.getEvents();
          //events = this.song._getEvents2(this.maxtime, (this.timeStamp - this.songStartMillis))
          //events = this.getEvents2(this.maxtime, (this.timeStamp - this.songStartMillis))
          //console.log('done', this.songCurrentMillis, diff, this.index, events.length)
        }

      // if(this.song.useMetronome === true){
      //   let metronomeEvents = this.song._metronome.getEvents2(this.maxtime, (this.timeStamp - this.songStartMillis))
      //   // if(metronomeEvents.length > 0){
      //   //   console.log(this.maxtime, metronomeEvents)
      //   // }
      //   // metronomeEvents.forEach(e => {
      //   //   e.time = (this.timeStamp + e.millis - this.songStartMillis)
      //   // })
      //   events.push(...metronomeEvents)
      // }

      numEvents = events.length;

      // if(numEvents > 5){
      //   console.log(numEvents)
      // }

      //console.log(this.maxtime, this.song._currentMillis, '[diff]', this.maxtime - this.prevMaxtime)

      for (i = 0; i < numEvents; i++) {
        event = events[i];
        track = event._track;
        // console.log(this.maxtime, this.prevMaxtime, event.millis)

        // if(event.millis > this.maxtime){
        //   // skip events that were harvest accidently while jumping the playhead -> should happen very rarely if ever
        //   console.log('skip', event)
        //   continue
        // }

        if (event._part === null || track === null) {
          console.log(event);
          this.notes.set(event.midiNoteId, event.midiNote);
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
        // /console.log(event.ticks, event.time, event.millis, event.type, event._track.name)

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
            // if(this.notes.size > 0){
            //   console.log(this.notes)
            // }
          }
      }
      //console.log(this.index, this.numEvents)
      //return this.index >= 10
      return this.index >= this.numEvents; // last event of song
    }

    /*
      unschedule(){
    
        let min = this.song._currentMillis
        let max = min + (bufferTime * 1000)
    
        //console.log('reschedule', this.notes.size)
        this.notes.forEach((note, id) => {
          // console.log(note)
          // console.log(note.noteOn.millis, note.noteOff.millis, min, max)
    
          if(typeof note === 'undefined' || note.state === 'removed'){
            //sample.unschedule(0, unscheduleCallback);
            //console.log('NOTE IS UNDEFINED')
            //sample.stop(0)
            this.notes.delete(id)
          }else if((note.noteOn.millis >= min || note.noteOff.millis < max) === false){
            //sample.stop(0)
            let noteOn = note.noteOn
            let noteOff = new MIDIEvent(0, 128, noteOn.data1, 0)
            noteOff.midiNoteId = note.id
            noteOff.time = 0//context.currentTime + min
            note._track.processMIDIEvent(noteOff)
            this.notes.delete(id)
            console.log('STOPPING', id, note._track.name)
          }
        })
        //console.log('NOTES', this.notes.size)
        //this.notes.clear()
      }
    */

  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      var timeStamp = _init_audio.context.currentTime * 1000;
      var outputs = (0, _init_midi.getMIDIOutputs)();
      outputs.forEach(function (output) {
        output.send([0xB0, 0x7B, 0x00], timeStamp); // stop all notes
        output.send([0xB0, 0x79, 0x00], timeStamp); // reset all controllers
      });
    }
  }]);

  return Scheduler;
}();

/*

  getEvents2(maxtime, timestamp){
    let loop = true
    let event
    let result = []
    //console.log(this.timeEventsIndex, this.songEventsIndex, this.metronomeEventsIndex)
    while(loop){

      let stop = false

      if(this.timeEventsIndex < this.numTimeEvents){
        event = this.timeEvents[this.timeEventsIndex]
        if(event.millis < maxtime){
          this.millisPerTick = event.millisPerTick
          //console.log(this.millisPerTick)
          this.timeEventsIndex++
        }else{
          stop = true
        }
      }

      if(this.songEventsIndex < this.numSongEvents){
        event = this.songEvents[this.songEventsIndex]
        if(event.type === 0x2F){
          loop = false
          break
        }
        let millis = event.ticks * this.millisPerTick
        if(millis < maxtime){
          event.time = millis + timestamp
          event.millis = millis
          result.push(event)
          this.songEventsIndex++
        }else{
          stop = true
        }
      }

      if(this.song.useMetronome === true && this.metronomeEventsIndex < this.numMetronomeEvents){
        event = this.metronomeEvents[this.metronomeEventsIndex]
        let millis = event.ticks * this.millisPerTick
        if(millis < maxtime){
          event.time = millis + timestamp
          event.millis = millis
          result.push(event)
          this.metronomeEventsIndex++
        }else{
          stop = true
        }
      }

      if(stop){
        loop = false
        break
      }
    }
    sortEvents(result)
    return result
  }


*/


exports.default = Scheduler;

},{"./init_audio":11,"./init_midi":12,"./midi_event":15,"./settings":33,"./util":39}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setBufferTime = setBufferTime;
//import gmInstruments from './gm_instruments'

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
  playbackSpeed: 1,
  autoQuantize: false
};

var bufferTime = exports.bufferTime = 200;

function setBufferTime(time) {
  exports.bufferTime = bufferTime = time;
}

//ported heartbeat instruments: http://github.com/abudaan/heartbeat
var heartbeatInstruments = new Map([['city-piano', {
  name: 'City Piano (piano)',
  description: 'City Piano uses samples from a Baldwin piano, it has 4 velocity layers: 1 - 48, 49 - 96, 97 - 110 and 110 - 127. In total it uses 4 * 88 = 352 samples'
}], ['city-piano-light', {
  name: 'City Piano Light (piano)',
  description: 'City Piano light uses samples from a Baldwin piano, it has only 1 velocity layer and uses 88 samples'
}], ['ck-iceskates', {
  name: 'CK Ice Skates (synth)',
  description: 'uses Detunized samples'
}], ['shk2-squareroot', {
  name: 'SHK squareroot (synth)',
  description: 'uses Detunized samples'
}], ['rhodes', {
  name: 'Rhodes (piano)',
  description: 'uses Freesound samples'
}], ['rhodes2', {
  name: 'Rhodes 2 (piano)',
  description: 'uses Detunized samples'
}], ['trumpet', {
  name: 'Trumpet (brass)',
  description: 'uses SSO samples'
}], ['violin', {
  name: 'Violin (strings)',
  description: 'uses SSO samples'
}]]);
var getInstruments = exports.getInstruments = function getInstruments() {
  return heartbeatInstruments;
};

// gm sounds exported from FluidSynth by Benjamin Gleitzman: https://github.com/gleitz/midi-js-soundfonts
var gmInstruments = { "acoustic_grand_piano": { "name": "1 Acoustic Grand Piano (piano)", "description": "Fluidsynth samples" }, "bright_acoustic_piano": { "name": "2 Bright Acoustic Piano (piano)", "description": "Fluidsynth samples" }, "electric_grand_piano": { "name": "3 Electric Grand Piano (piano)", "description": "Fluidsynth samples" }, "honkytonk_piano": { "name": "4 Honky-tonk Piano (piano)", "description": "Fluidsynth samples" }, "electric_piano_1": { "name": "5 Electric Piano 1 (piano)", "description": "Fluidsynth samples" }, "electric_piano_2": { "name": "6 Electric Piano 2 (piano)", "description": "Fluidsynth samples" }, "harpsichord": { "name": "7 Harpsichord (piano)", "description": "Fluidsynth samples" }, "clavinet": { "name": "8 Clavinet (piano)", "description": "Fluidsynth samples" }, "celesta": { "name": "9 Celesta (chromaticpercussion)", "description": "Fluidsynth samples" }, "glockenspiel": { "name": "10 Glockenspiel (chromaticpercussion)", "description": "Fluidsynth samples" }, "music_box": { "name": "11 Music Box (chromaticpercussion)", "description": "Fluidsynth samples" }, "vibraphone": { "name": "12 Vibraphone (chromaticpercussion)", "description": "Fluidsynth samples" }, "marimba": { "name": "13 Marimba (chromaticpercussion)", "description": "Fluidsynth samples" }, "xylophone": { "name": "14 Xylophone (chromaticpercussion)", "description": "Fluidsynth samples" }, "tubular_bells": { "name": "15 Tubular Bells (chromaticpercussion)", "description": "Fluidsynth samples" }, "dulcimer": { "name": "16 Dulcimer (chromaticpercussion)", "description": "Fluidsynth samples" }, "drawbar_organ": { "name": "17 Drawbar Organ (organ)", "description": "Fluidsynth samples" }, "percussive_organ": { "name": "18 Percussive Organ (organ)", "description": "Fluidsynth samples" }, "rock_organ": { "name": "19 Rock Organ (organ)", "description": "Fluidsynth samples" }, "church_organ": { "name": "20 Church Organ (organ)", "description": "Fluidsynth samples" }, "reed_organ": { "name": "21 Reed Organ (organ)", "description": "Fluidsynth samples" }, "accordion": { "name": "22 Accordion (organ)", "description": "Fluidsynth samples" }, "harmonica": { "name": "23 Harmonica (organ)", "description": "Fluidsynth samples" }, "tango_accordion": { "name": "24 Tango Accordion (organ)", "description": "Fluidsynth samples" }, "acoustic_guitar_nylon": { "name": "25 Acoustic Guitar (nylon) (guitar)", "description": "Fluidsynth samples" }, "acoustic_guitar_steel": { "name": "26 Acoustic Guitar (steel) (guitar)", "description": "Fluidsynth samples" }, "electric_guitar_jazz": { "name": "27 Electric Guitar (jazz) (guitar)", "description": "Fluidsynth samples" }, "electric_guitar_clean": { "name": "28 Electric Guitar (clean) (guitar)", "description": "Fluidsynth samples" }, "electric_guitar_muted": { "name": "29 Electric Guitar (muted) (guitar)", "description": "Fluidsynth samples" }, "overdriven_guitar": { "name": "30 Overdriven Guitar (guitar)", "description": "Fluidsynth samples" }, "distortion_guitar": { "name": "31 Distortion Guitar (guitar)", "description": "Fluidsynth samples" }, "guitar_harmonics": { "name": "32 Guitar Harmonics (guitar)", "description": "Fluidsynth samples" }, "acoustic_bass": { "name": "33 Acoustic Bass (bass)", "description": "Fluidsynth samples" }, "electric_bass_finger": { "name": "34 Electric Bass (finger) (bass)", "description": "Fluidsynth samples" }, "electric_bass_pick": { "name": "35 Electric Bass (pick) (bass)", "description": "Fluidsynth samples" }, "fretless_bass": { "name": "36 Fretless Bass (bass)", "description": "Fluidsynth samples" }, "slap_bass_1": { "name": "37 Slap Bass 1 (bass)", "description": "Fluidsynth samples" }, "slap_bass_2": { "name": "38 Slap Bass 2 (bass)", "description": "Fluidsynth samples" }, "synth_bass_1": { "name": "39 Synth Bass 1 (bass)", "description": "Fluidsynth samples" }, "synth_bass_2": { "name": "40 Synth Bass 2 (bass)", "description": "Fluidsynth samples" }, "violin": { "name": "41 Violin (strings)", "description": "Fluidsynth samples" }, "viola": { "name": "42 Viola (strings)", "description": "Fluidsynth samples" }, "cello": { "name": "43 Cello (strings)", "description": "Fluidsynth samples" }, "contrabass": { "name": "44 Contrabass (strings)", "description": "Fluidsynth samples" }, "tremolo_strings": { "name": "45 Tremolo Strings (strings)", "description": "Fluidsynth samples" }, "pizzicato_strings": { "name": "46 Pizzicato Strings (strings)", "description": "Fluidsynth samples" }, "orchestral_harp": { "name": "47 Orchestral Harp (strings)", "description": "Fluidsynth samples" }, "timpani": { "name": "48 Timpani (strings)", "description": "Fluidsynth samples" }, "string_ensemble_1": { "name": "49 String Ensemble 1 (ensemble)", "description": "Fluidsynth samples" }, "string_ensemble_2": { "name": "50 String Ensemble 2 (ensemble)", "description": "Fluidsynth samples" }, "synth_strings_1": { "name": "51 Synth Strings 1 (ensemble)", "description": "Fluidsynth samples" }, "synth_strings_2": { "name": "52 Synth Strings 2 (ensemble)", "description": "Fluidsynth samples" }, "choir_aahs": { "name": "53 Choir Aahs (ensemble)", "description": "Fluidsynth samples" }, "voice_oohs": { "name": "54 Voice Oohs (ensemble)", "description": "Fluidsynth samples" }, "synth_choir": { "name": "55 Synth Choir (ensemble)", "description": "Fluidsynth samples" }, "orchestra_hit": { "name": "56 Orchestra Hit (ensemble)", "description": "Fluidsynth samples" }, "trumpet": { "name": "57 Trumpet (brass)", "description": "Fluidsynth samples" }, "trombone": { "name": "58 Trombone (brass)", "description": "Fluidsynth samples" }, "tuba": { "name": "59 Tuba (brass)", "description": "Fluidsynth samples" }, "muted_trumpet": { "name": "60 Muted Trumpet (brass)", "description": "Fluidsynth samples" }, "french_horn": { "name": "61 French Horn (brass)", "description": "Fluidsynth samples" }, "brass_section": { "name": "62 Brass Section (brass)", "description": "Fluidsynth samples" }, "synth_brass_1": { "name": "63 Synth Brass 1 (brass)", "description": "Fluidsynth samples" }, "synth_brass_2": { "name": "64 Synth Brass 2 (brass)", "description": "Fluidsynth samples" }, "soprano_sax": { "name": "65 Soprano Sax (reed)", "description": "Fluidsynth samples" }, "alto_sax": { "name": "66 Alto Sax (reed)", "description": "Fluidsynth samples" }, "tenor_sax": { "name": "67 Tenor Sax (reed)", "description": "Fluidsynth samples" }, "baritone_sax": { "name": "68 Baritone Sax (reed)", "description": "Fluidsynth samples" }, "oboe": { "name": "69 Oboe (reed)", "description": "Fluidsynth samples" }, "english_horn": { "name": "70 English Horn (reed)", "description": "Fluidsynth samples" }, "bassoon": { "name": "71 Bassoon (reed)", "description": "Fluidsynth samples" }, "clarinet": { "name": "72 Clarinet (reed)", "description": "Fluidsynth samples" }, "piccolo": { "name": "73 Piccolo (pipe)", "description": "Fluidsynth samples" }, "flute": { "name": "74 Flute (pipe)", "description": "Fluidsynth samples" }, "recorder": { "name": "75 Recorder (pipe)", "description": "Fluidsynth samples" }, "pan_flute": { "name": "76 Pan Flute (pipe)", "description": "Fluidsynth samples" }, "blown_bottle": { "name": "77 Blown Bottle (pipe)", "description": "Fluidsynth samples" }, "shakuhachi": { "name": "78 Shakuhachi (pipe)", "description": "Fluidsynth samples" }, "whistle": { "name": "79 Whistle (pipe)", "description": "Fluidsynth samples" }, "ocarina": { "name": "80 Ocarina (pipe)", "description": "Fluidsynth samples" }, "lead_1_square": { "name": "81 Lead 1 (square) (synthlead)", "description": "Fluidsynth samples" }, "lead_2_sawtooth": { "name": "82 Lead 2 (sawtooth) (synthlead)", "description": "Fluidsynth samples" }, "lead_3_calliope": { "name": "83 Lead 3 (calliope) (synthlead)", "description": "Fluidsynth samples" }, "lead_4_chiff": { "name": "84 Lead 4 (chiff) (synthlead)", "description": "Fluidsynth samples" }, "lead_5_charang": { "name": "85 Lead 5 (charang) (synthlead)", "description": "Fluidsynth samples" }, "lead_6_voice": { "name": "86 Lead 6 (voice) (synthlead)", "description": "Fluidsynth samples" }, "lead_7_fifths": { "name": "87 Lead 7 (fifths) (synthlead)", "description": "Fluidsynth samples" }, "lead_8_bass__lead": { "name": "88 Lead 8 (bass + lead) (synthlead)", "description": "Fluidsynth samples" }, "pad_1_new_age": { "name": "89 Pad 1 (new age) (synthpad)", "description": "Fluidsynth samples" }, "pad_2_warm": { "name": "90 Pad 2 (warm) (synthpad)", "description": "Fluidsynth samples" }, "pad_3_polysynth": { "name": "91 Pad 3 (polysynth) (synthpad)", "description": "Fluidsynth samples" }, "pad_4_choir": { "name": "92 Pad 4 (choir) (synthpad)", "description": "Fluidsynth samples" }, "pad_5_bowed": { "name": "93 Pad 5 (bowed) (synthpad)", "description": "Fluidsynth samples" }, "pad_6_metallic": { "name": "94 Pad 6 (metallic) (synthpad)", "description": "Fluidsynth samples" }, "pad_7_halo": { "name": "95 Pad 7 (halo) (synthpad)", "description": "Fluidsynth samples" }, "pad_8_sweep": { "name": "96 Pad 8 (sweep) (synthpad)", "description": "Fluidsynth samples" }, "fx_1_rain": { "name": "97 FX 1 (rain) (syntheffects)", "description": "Fluidsynth samples" }, "fx_2_soundtrack": { "name": "98 FX 2 (soundtrack) (syntheffects)", "description": "Fluidsynth samples" }, "fx_3_crystal": { "name": "99 FX 3 (crystal) (syntheffects)", "description": "Fluidsynth samples" }, "fx_4_atmosphere": { "name": "100 FX 4 (atmosphere) (syntheffects)", "description": "Fluidsynth samples" }, "fx_5_brightness": { "name": "101 FX 5 (brightness) (syntheffects)", "description": "Fluidsynth samples" }, "fx_6_goblins": { "name": "102 FX 6 (goblins) (syntheffects)", "description": "Fluidsynth samples" }, "fx_7_echoes": { "name": "103 FX 7 (echoes) (syntheffects)", "description": "Fluidsynth samples" }, "fx_8_scifi": { "name": "104 FX 8 (sci-fi) (syntheffects)", "description": "Fluidsynth samples" }, "sitar": { "name": "105 Sitar (ethnic)", "description": "Fluidsynth samples" }, "banjo": { "name": "106 Banjo (ethnic)", "description": "Fluidsynth samples" }, "shamisen": { "name": "107 Shamisen (ethnic)", "description": "Fluidsynth samples" }, "koto": { "name": "108 Koto (ethnic)", "description": "Fluidsynth samples" }, "kalimba": { "name": "109 Kalimba (ethnic)", "description": "Fluidsynth samples" }, "bagpipe": { "name": "110 Bagpipe (ethnic)", "description": "Fluidsynth samples" }, "fiddle": { "name": "111 Fiddle (ethnic)", "description": "Fluidsynth samples" }, "shanai": { "name": "112 Shanai (ethnic)", "description": "Fluidsynth samples" }, "tinkle_bell": { "name": "113 Tinkle Bell (percussive)", "description": "Fluidsynth samples" }, "agogo": { "name": "114 Agogo (percussive)", "description": "Fluidsynth samples" }, "steel_drums": { "name": "115 Steel Drums (percussive)", "description": "Fluidsynth samples" }, "woodblock": { "name": "116 Woodblock (percussive)", "description": "Fluidsynth samples" }, "taiko_drum": { "name": "117 Taiko Drum (percussive)", "description": "Fluidsynth samples" }, "melodic_tom": { "name": "118 Melodic Tom (percussive)", "description": "Fluidsynth samples" }, "synth_drum": { "name": "119 Synth Drum (percussive)", "description": "Fluidsynth samples" }, "reverse_cymbal": { "name": "120 Reverse Cymbal (soundeffects)", "description": "Fluidsynth samples" }, "guitar_fret_noise": { "name": "121 Guitar Fret Noise (soundeffects)", "description": "Fluidsynth samples" }, "breath_noise": { "name": "122 Breath Noise (soundeffects)", "description": "Fluidsynth samples" }, "seashore": { "name": "123 Seashore (soundeffects)", "description": "Fluidsynth samples" }, "bird_tweet": { "name": "124 Bird Tweet (soundeffects)", "description": "Fluidsynth samples" }, "telephone_ring": { "name": "125 Telephone Ring (soundeffects)", "description": "Fluidsynth samples" }, "helicopter": { "name": "126 Helicopter (soundeffects)", "description": "Fluidsynth samples" }, "applause": { "name": "127 Applause (soundeffects)", "description": "Fluidsynth samples" }, "gunshot": { "name": "128 Gunshot (soundeffects)", "description": "Fluidsynth samples" } };
var gmMap = new Map();
Object.keys(gmInstruments).forEach(function (key) {
  gmMap.set(key, gmInstruments[key]);
});
var getGMInstruments = exports.getGMInstruments = function getGMInstruments() {
  return gmMap;
};

var noteNameMode = exports.noteNameMode = 'sharp';
var pitch = exports.pitch = 440;

},{}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleSynth = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _instrument = require('./instrument');

var _sample_oscillator = require('./sample_oscillator');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var instanceIndex = 0;

var SimpleSynth = exports.SimpleSynth = function (_Instrument) {
  _inherits(SimpleSynth, _Instrument);

  function SimpleSynth(type, name) {
    _classCallCheck(this, SimpleSynth);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SimpleSynth).call(this));

    _this.id = _this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();
    _this.name = name || _this.id;
    _this.type = type;
    _this.sampleData = {
      type: type,
      releaseDuration: 0.2,
      releaseEnvelope: 'equal power'
    };
    return _this;
  }

  _createClass(SimpleSynth, [{
    key: 'createSample',
    value: function createSample(event) {
      return new _sample_oscillator.SampleOscillator(this.sampleData, event);
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
      this.sampleData.releaseDuration = duration;
      this.sampleData.releaseEnvelope = envelope;
    }
  }]);

  return SimpleSynth;
}(_instrument.Instrument);

},{"./instrument":13,"./sample_oscillator":28}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Song = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //@ flow

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

var _save_midifile = require('./save_midifile');

var _song = require('./song.update');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instanceIndex = 0;
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
  autoQuantize: boolean,
}
*/

/*
  // initialize song with tracks and part so you do not have to create them separately
  setup: {
    timeEvents: []
    tracks: [
      parts []
    ]
  }
*/

var Song = exports.Song = function () {
  _createClass(Song, null, [{
    key: 'fromMIDIFile',
    value: function fromMIDIFile(data) {
      return (0, _song_from_midifile.songFromMIDIFile)(data);
    }
  }, {
    key: 'fromMIDIFileSync',
    value: function fromMIDIFileSync(data) {
      return (0, _song_from_midifile.songFromMIDIFileSync)(data);
    }
  }]);

  function Song() {
    var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Song);

    this.id = this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();

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
    this.looping = false;

    this.volume = 0.5;
    this._output = _init_audio.context.createGain();
    this._output.gain.value = this.volume;
    this._output.connect(_init_audio.masterGain);

    this._metronome = new _metronome.Metronome(this);
    this._metronomeEvents = [];
    this._updateMetronomeEvents = true;
    this._metronome.mute(!this.useMetronome);

    this._loop = false;
    this._leftLocator = { millis: 0, ticks: 0 };
    this._rightLocator = { millis: 0, ticks: 0 };
    this._illegalLoop = false;
    this._loopDuration = 0;
    this._precountBars = 0;
    this._endPrecountMillis = 0;
    this.update();
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
  }, {
    key: 'update',
    value: function update() {
      _song.update.call(this);
    }
  }, {
    key: 'play',
    value: function play(type) {
      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      //unlockWebAudio()
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

      //console.log(this._currentMillis)

      this._reference = this._timeStamp = _init_audio.context.currentTime * 1000;
      this._scheduler.setTimeStamp(this._reference);
      this._startMillis = this._currentMillis;

      if (this._precountBars > 0 && this._preparedForRecording) {

        // create precount events, the playhead will be moved to the first beat of the current bar
        var position = this.getPosition();
        this._metronome.createPrecountEvents(position.bar, position.bar + this._precountBars, this._reference);
        this._currentMillis = this._calculatePosition('barsbeats', [position.bar], 'millis').millis;
        this._precountDuration = this._metronome.precountDuration;
        this._endPrecountMillis = this._currentMillis + this._precountDuration;

        // console.group('precount')
        // console.log('position', this.getPosition())
        // console.log('_currentMillis', this._currentMillis)
        // console.log('endPrecountMillis', this._endPrecountMillis)
        // console.log('_precountDuration', this._precountDuration)
        // console.groupEnd('precount')
        //console.log('precountDuration', this._metronome.createPrecountEvents(this._precountBars, this._reference))
        this.precounting = true;
      } else {
        this._endPrecountMillis = 0;
        this.playing = true;
        this.recording = this._preparedForRecording;
      }
      //console.log(this._endPrecountMillis)

      if (this.paused) {
        this.paused = false;
      }

      this._playhead.set('millis', this._currentMillis);
      this._scheduler.init(this._currentMillis);
      this._loop = this.looping && this._currentMillis <= this._rightLocator.millis;
      this._pulse();
    }
  }, {
    key: '_pulse',
    value: function _pulse() {
      if (this.playing === false && this.precounting === false) {
        return;
      }

      if (this._performUpdate === true) {
        this._performUpdate = false;
        //console.log('pulse update', this._currentMillis)
        _song._update.call(this);
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
        this._currentMillis -= this._precountDuration;
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

      //console.log(this._currentMillis, this._durationMillis)

      if (this._currentMillis >= this._durationMillis) {
        var _scheduler$events;

        if (this.recording !== true || this.autoSize !== true) {
          this.stop();
          return;
        }
        // add an extra bar to the size of this song
        var _events = this._metronome.addEvents(this.bars, this.bars + 1);
        var tobeParsed = [].concat(_toConsumableArray(_events), _toConsumableArray(this._timeEvents));
        (0, _util.sortEvents)(tobeParsed);
        (0, _parse_events.parseEvents)(tobeParsed);
        (_scheduler$events = this._scheduler.events).push.apply(_scheduler$events, _toConsumableArray(_events));
        this._scheduler.numEvents += _events.length;
        var lastEvent = _events[_events.length - 1];
        var extraMillis = lastEvent.ticksPerBar * lastEvent.millisPerTick;
        this._lastEvent.ticks += lastEvent.ticksPerBar;
        this._lastEvent.millis += extraMillis;
        this._durationMillis += extraMillis;
        this.bars++;
        this._resized = true;
        //console.log('length', this._lastEvent.ticks, this._lastEvent.millis, this.bars, lastEvent)
      }

      this._scheduler.update(diff);

      requestAnimationFrame(this._pulse.bind(this));
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
      //console.log('STOP')
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
      var _this3 = this;

      if (this._preparedForRecording === true) {
        return;
      }
      this._recordId = 'recording_' + recordingIndex++ + new Date().getTime();
      this._tracks.forEach(function (track) {
        track._startRecording(_this3._recordId);
      });
      this._preparedForRecording = true;
    }
  }, {
    key: 'stopRecording',
    value: function stopRecording() {
      var _this4 = this;

      if (this._preparedForRecording === false) {
        return;
      }
      this._tracks.forEach(function (track) {
        track._stopRecording(_this4._recordId);
      });
      this.update();
      this._preparedForRecording = false;
      this.recording = false;
      (0, _eventlistener.dispatchEvent)({ type: 'stop_recording' });
    }
  }, {
    key: 'undoRecording',
    value: function undoRecording() {
      var _this5 = this;

      this._tracks.forEach(function (track) {
        track.undoRecording(_this5._recordId);
      });
      this.update();
    }
  }, {
    key: 'redoRecording',
    value: function redoRecording() {
      var _this6 = this;

      this._tracks.forEach(function (track) {
        track.redoRecording(_this6._recordId);
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
      this._metronome.mute(!this.useMetronome);
    }
  }, {
    key: 'configureMetronome',
    value: function configureMetronome(config) {
      this._metronome.configure(config);
    }
  }, {
    key: 'configure',
    value: function configure(config) {}
  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      this._tracks.forEach(function (track) {
        track.allNotesOff();
      });

      this._scheduler.allNotesOff();
      this._metronome.allNotesOff();
    }
  }, {
    key: 'panic',
    value: function panic() {
      var _this7 = this;

      return new Promise(function (resolve) {
        _this7._tracks.forEach(function (track) {
          track.disconnect(_this7._output);
        });
        setTimeout(function () {
          _this7._tracks.forEach(function (track) {
            track.connect(_this7._output);
          });
          resolve();
        }, 100);
      });
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
      //console.log(this._currentMillis)

      (0, _eventlistener.dispatchEvent)({
        type: 'position',
        data: position
      });

      if (wasPlaying) {
        this._play();
      } else {
        //@todo: get this information from let 'position' -> we have just calculated the position
        this._playhead.set('millis', this._currentMillis);
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


      this.looping = flag !== null ? flag : !this._loop;

      if (this._rightLocator === false || this._leftLocator === false) {
        this._illegalLoop = true;
        this._loop = false;
        this.looping = false;
        return false;
      }

      // locators can not (yet) be used to jump over a segment
      if (this._rightLocator.millis <= this._leftLocator.millis) {
        this._illegalLoop = true;
        this._loop = false;
        this.looping = false;
        return false;
      }

      this._loopDuration = this._rightLocator.millis - this._leftLocator.millis;
      //console.log(this._loop, this._loopDuration)
      this._scheduler.beyondLoop = this._currentMillis > this._rightLocator.millis;
      this._loop = this.looping && this._currentMillis <= this._rightLocator.millis;
      //console.log(this._loop, this.looping)
      return this.looping;
    }
  }, {
    key: 'setPrecount',
    value: function setPrecount() {
      var value = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      this._precountBars = value;
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
          //target = args[0] || 0
          target = args || 0;
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
  }, {
    key: 'saveAsMIDIFile',
    value: function saveAsMIDIFile(name) {
      (0, _save_midifile.saveAsMIDIFile)(this, name);
    }
  }, {
    key: 'setVolume',
    value: function setVolume(value) {
      if (value < 0 || value > 1) {
        console.log('Song.setVolume() accepts a value between 0 and 1, you entered:', value);
        return;
      }
      this.volume = value;
    }
  }, {
    key: 'getVolume',
    value: function getVolume() {
      return this.volume;
    }
  }, {
    key: 'setPanning',
    value: function setPanning(value) {
      if (value < -1 || value > 1) {
        console.log('Song.setPanning() accepts a value between -1 (full left) and 1 (full right), you entered:', value);
        return;
      }
      this._tracks.forEach(function (track) {
        track.setPanning(value);
      });
      this._pannerValue = value;
    }
  }]);

  return Song;
}();

},{"./constants":7,"./eventlistener":8,"./init_audio":11,"./metronome":14,"./midi_event":15,"./parse_events":21,"./playhead":23,"./position":24,"./save_midifile":31,"./scheduler":32,"./settings":33,"./song.update":36,"./song_from_midifile":37,"./util":39}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = update;
exports._update = _update;

var _parse_events = require('./parse_events');

var _util = require('./util');

var _constants = require('./constants');

var _position = require('./position');

var _midi_event = require('./midi_event');

var _eventlistener = require('./eventlistener');

var _settings = require('./settings');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // called by song


function update() {
  if (this.playing === false) {
    _update.call(this);
  } else {
    this._performUpdate = true;
  }
}

function _update() {
  var _this = this;

  if (this._updateTimeEvents === false && this._removedEvents.length === 0 && this._newEvents.length === 0 && this._movedEvents.length === 0 && this._newParts.length === 0 && this._removedParts.length === 0 && this._resized === false) {
    return;
  }
  //debug
  //this.isPlaying = true

  //console.groupCollapsed('update song')
  console.time('updating song took');

  // TIME EVENTS

  // check if time events are updated
  if (this._updateTimeEvents === true) {
    //console.log('updateTimeEvents', this._timeEvents.length)
    (0, _parse_events.parseTimeEvents)(this, this._timeEvents, this.isPlaying);
    this._updateTimeEvents = false;
    //console.log('time events %O', this._timeEvents)
  }

  // only parse new and moved events
  var tobeParsed = [];

  // PARTS

  // filter removed parts
  //console.log('removed parts %O', this._removedParts)
  this._removedParts.forEach(function (part) {
    _this._partsById.delete(part.id);
  });

  // add new parts
  //console.log('new parts %O', this._newParts)
  this._newParts.forEach(function (part) {
    part._song = _this;
    _this._partsById.set(part.id, part);
    part.update();
  });

  // update changed parts
  //console.log('changed parts %O', this._changedParts)
  this._changedParts.forEach(function (part) {
    part.update();
  });

  // removed parts
  //console.log('removed parts %O', this._changedParts)
  this._removedParts.forEach(function (part) {
    _this._partsById.delete(part.id);
  });

  if (this._removedParts.length > 0) {
    this._parts = Array.from(this._partsById.values());
  }

  // EVENTS

  // filter removed events
  //console.log('removed events %O', this._removedEvents)
  this._removedEvents.forEach(function (event) {
    var track = event.midiNote._track;
    // unschedule all removed events that already have been scheduled
    if (event.time >= _this._currentMillis) {
      track.unschedule(event);
    }
    _this._notesById.delete(event.midiNote.id);
    _this._eventsById.delete(event.id);
  });

  // add new events
  //console.log('new events %O', this._newEvents)
  this._newEvents.forEach(function (event) {
    _this._eventsById.set(event.id, event);
    _this._events.push(event);
    tobeParsed.push(event);
  });

  // moved events need to be parsed
  //console.log('moved %O', this._movedEvents)
  this._movedEvents.forEach(function (event) {
    tobeParsed.push(event);
  });

  // parse all new and moved events
  if (tobeParsed.length > 0) {
    //console.time('parse')
    //console.log('tobeParsed %O', tobeParsed)
    //console.log('parseEvents', tobeParsed.length)

    tobeParsed = [].concat(_toConsumableArray(tobeParsed), _toConsumableArray(this._timeEvents));
    (0, _parse_events.parseEvents)(tobeParsed, this.isPlaying);

    // add MIDI notes to song
    tobeParsed.forEach(function (event) {
      //console.log(event.id, event.type, event.midiNote)
      if (event.type === _constants.MIDIEventTypes.NOTE_ON) {
        if (event.midiNote) {
          _this._notesById.set(event.midiNoteId, event.midiNote);
          //console.log(event.midiNoteId, event.type)
          //this._notes.push(event.midiNote)
        }
      }
    });
    //console.timeEnd('parse')
  }

  if (tobeParsed.length > 0 || this._removedEvents.length > 0) {
    //console.time('to array')
    this._events = Array.from(this._eventsById.values());
    this._notes = Array.from(this._notesById.values());
    //console.timeEnd('to array')
  }

  //console.time(`sorting ${this._events.length} events`)
  (0, _util.sortEvents)(this._events);
  this._notes.sort(function (a, b) {
    return a.noteOn.ticks - b.noteOn.ticks;
  });
  //console.timeEnd(`sorting ${this._events.length} events`)

  //console.log('notes %O', this._notes)
  console.timeEnd('updating song took');

  // SONG DURATION

  // get the last event of this song
  var lastEvent = this._events[this._events.length - 1];
  var lastTimeEvent = this._timeEvents[this._timeEvents.length - 1];

  // check if song has already any events
  if (lastEvent instanceof _midi_event.MIDIEvent === false) {
    lastEvent = lastTimeEvent;
  } else if (lastTimeEvent.ticks > lastEvent.ticks) {
    lastEvent = lastTimeEvent;
  }
  //console.log(lastEvent)

  // get the position data of the first beat in the bar after the last bar
  this.bars = Math.max(lastEvent.bar, this.bars);
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

  //console.log('length', this._lastEvent.ticks, this._lastEvent.millis, this.bars)

  this._durationTicks = this._lastEvent.ticks;
  this._durationMillis = this._lastEvent.millis;

  // METRONOME

  // add metronome events
  if (this._updateMetronomeEvents || this._metronome.bars !== this.bars) {
    this._metronomeEvents = (0, _parse_events.parseEvents)([].concat(_toConsumableArray(this._timeEvents), _toConsumableArray(this._metronome.getEvents())));
  }
  this._allEvents = [].concat(_toConsumableArray(this._metronomeEvents), _toConsumableArray(this._events));
  (0, _util.sortEvents)(this._allEvents);
  //console.log('all events %O', this._allEvents)

  /*
    this._metronome.getEvents()
    this._allEvents = [...this._events]
    sortEvents(this._allEvents)
  */

  //console.log('current millis', this._currentMillis)
  this._playhead.updateSong();
  this._scheduler.updateSong();

  if (this.playing === false) {
    this._playhead.set('millis', this._currentMillis);
    (0, _eventlistener.dispatchEvent)({
      type: 'position',
      data: this._playhead.get().position
    });
  }

  // reset
  this._newParts = [];
  this._removedParts = [];
  this._newEvents = [];
  this._movedEvents = [];
  this._removedEvents = [];
  this._resized = false;

  //console.groupEnd('update song')
}

},{"./constants":7,"./eventlistener":8,"./midi_event":15,"./parse_events":21,"./position":24,"./settings":33,"./util":39}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.songFromMIDIFileSync = songFromMIDIFileSync;
exports.songFromMIDIFile = songFromMIDIFile;

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

function songFromMIDIFileSync(data) {
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

function songFromMIDIFile(url) {
  return new Promise(function (resolve, reject) {
    // fetch(url, {
    //   mode: 'no-cors'
    // })
    (0, _isomorphicFetch2.default)(url).then(_fetch_helpers.status).then(_fetch_helpers.arrayBuffer).then(function (data) {
      resolve(songFromMIDIFileSync(data));
    }).catch(function (e) {
      reject(e);
    });
  });
}

},{"./fetch_helpers":9,"./midi_event":15,"./midifile":18,"./part":22,"./song":35,"./track":38,"./util":39,"isomorphic-fetch":5}],38:[function(require,module,exports){
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

var _qambi = require('./qambi');

var _eventlistener = require('./eventlistener');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var zeroValue = 0.00000000000000001;
var instanceIndex = 0;

var Track = exports.Track = function () {

  // constructor({
  //   name,
  //   parts, // number or array
  // })

  function Track() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    _classCallCheck(this, Track);

    this.id = this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();
    this.name = name || this.id;
    this.channel = 0;
    this.muted = false;
    this.volume = 0.5;
    this._panner = _init_audio.context.createPanner();
    this._panner.panningModel = 'equalpower';
    this._panner.setPosition(zeroValue, zeroValue, zeroValue);
    this._output = _init_audio.context.createGain();
    this._output.gain.value = this.volume;
    this._panner.connect(this._output);
    //this._output.connect(this._panner)
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
    this.scheduledSamples = new Map();
    this.sustainedSamples = [];
    this.sustainPedalDown = false;
    this.monitor = false;
    this._songInput = null;
    this._effects = [];
  }

  _createClass(Track, [{
    key: 'setInstrument',
    value: function setInstrument() {
      var instrument = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (instrument !== null
      // check if the mandatory functions of an instrument are present (Interface Instrument)
       && typeof instrument.connect === 'function' && typeof instrument.disconnect === 'function' && typeof instrument.processMIDIEvent === 'function' && typeof instrument.allNotesOff === 'function' && typeof instrument.unschedule === 'function') {
        this.removeInstrument();
        this._instrument = instrument;
        this._instrument.connect(this._panner);
      } else if (instrument === null) {
        // if you pass null as argument the current instrument will be removed, same as removeInstrument
        this.removeInstrument();
      } else {
        console.log('Invalid instrument, and instrument should have the methods "connect", "disconnect", "processMIDIEvent", "unschedule" and "allNotesOff"');
      }
    }
  }, {
    key: 'removeInstrument',
    value: function removeInstrument() {
      if (this._instrument !== null) {
        this._instrument.allNotesOff();
        this._instrument.disconnect();
        this._instrument = null;
      }
    }
  }, {
    key: 'getInstrument',
    value: function getInstrument() {
      return this._instrument;
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

          _this3._midiInputs.set(input.id, input);

          input.onmidimessage = function (e) {
            if (_this3.monitor === true) {
              _this3._preprocessMIDIEvent(new (Function.prototype.bind.apply(_midi_event.MIDIEvent, [null].concat([_this3._song._ticks], _toConsumableArray(e.data))))());
            }
          };
        }
      });
      //console.log(this._midiInputs)
    }

    // you can pass both port and port ids

  }, {
    key: 'disconnectMIDIInputs',
    value: function disconnectMIDIInputs() {
      var _this4 = this;

      for (var _len4 = arguments.length, inputs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        inputs[_key4] = arguments[_key4];
      }

      if (inputs.length === 0) {
        this._midiInputs.forEach(function (port) {
          port.onmidimessage = null;
        });
        this._midiInputs.clear();
        return;
      }
      inputs.forEach(function (port) {
        if (port instanceof MIDIInput) {
          port = port.id;
        }
        if (_this4._midiInputs.has(port)) {
          _this4._midiInputs.get(port).onmidimessage = null;
          _this4._midiInputs.delete(port);
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
        //console.log(recordId)
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
      if (this._recordedEvents.length === 0) {
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
        _this5._parts.push(part);
        _this5._partsById.set(part.id, part);

        var events = part._events;
        (_events = _this5._events).push.apply(_events, _toConsumableArray(events));

        if (song) {
          var _song$_newEvents;

          part._song = song;
          song._newParts.push(part);
          (_song$_newEvents = song._newEvents).push.apply(_song$_newEvents, _toConsumableArray(events));
        }

        events.forEach(function (event) {
          event._track = _this5;
          if (song) {
            event._song = song;
          }
          _this5._eventsById.set(event.id, event);
        });
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

        var events = part._events;

        if (song) {
          var _song$_removedEvents;

          song._removedParts.push(part);
          (_song$_removedEvents = song._removedEvents).push.apply(_song$_removedEvents, _toConsumableArray(events));
        }

        events.forEach(function (event) {
          event._track = null;
          if (song) {
            event._song = null;
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
    /*
      addEvents(...events){
        let p = new Part()
        p.addEvents(...events)
        this.addParts(p)
      }
    */

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
        var _song$_removedEvents2, _song$_changedParts;

        (_song$_removedEvents2 = this._song._removedEvents).push.apply(_song$_removedEvents2, events);
        (_song$_changedParts = this._song._changedParts).push.apply(_song$_changedParts, _toConsumableArray(Array.from(parts.entries())));
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
        var _song$_movedEvents, _song$_changedParts2;

        (_song$_movedEvents = this._song._movedEvents).push.apply(_song$_movedEvents, events);
        (_song$_changedParts2 = this._song._changedParts).push.apply(_song$_changedParts2, _toConsumableArray(Array.from(parts.entries())));
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
        var _song$_movedEvents2, _song$_changedParts3;

        (_song$_movedEvents2 = this._song._movedEvents).push.apply(_song$_movedEvents2, events);
        (_song$_changedParts3 = this._song._changedParts).push.apply(_song$_changedParts3, _toConsumableArray(Array.from(parts.entries())));
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

    /*
      routing: sample source -> panner -> gain -> [...fx] -> song output
    */

  }, {
    key: 'connect',
    value: function connect(songOutput) {
      this._songOutput = songOutput;
      this._output.connect(this._songOutput);
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this._output.disconnect(this._songOutput);
      this._songOutput = null;
    }
  }, {
    key: '_checkEffect',
    value: function _checkEffect(effect) {
      if (typeof effect.setInput !== 'function' || typeof effect.setOutput !== 'function' || typeof effect.getOutput !== 'function' || typeof effect.disconnect !== 'function') {
        console.log('Invalid channel fx, and channel fx should have the methods "setInput", "setOutput", "getOutput" and "disconnect"');
        return false;
      }
      return true;
    }
  }, {
    key: 'addEffect',
    value: function addEffect(effect) {
      if (this._checkEffect(effect) === false) {
        return;
      }
      var numFX = this._effects.length;
      var lastFX = void 0;
      var output = void 0;
      if (numFX === 0) {
        lastFX = this._output;
        lastFX.disconnect(this._songOutput);
        output = this._output;
      } else {
        lastFX = this._effects[numFX - 1];
        lastFX.disconnect();
        output = lastFX.getOutput();
      }

      effect.setInput(output);
      effect.setOutput(this._songOutput);

      this._effects.push(effect);
    }
  }, {
    key: 'addEffectAt',
    value: function addEffectAt(effect, index) {
      if (this._checkEffect(effect) === false) {
        return;
      }
      this._effects.splice(index, 0, effect);
    }
  }, {
    key: 'removeEffect',
    value: function removeEffect(index) {
      var _this8 = this;

      if (isNaN(index)) {
        return;
      }
      this._effects.forEach(function (fx) {
        fx.disconnect();
      });
      this._effects.splice(index, 1);

      var numFX = this._effects.length;

      if (numFX === 0) {
        this._output.connect(this._songOutput);
        return;
      }

      var lastFX = this._output;
      this._effects.forEach(function (fx, i) {
        fx.setInput(lastFX);
        if (i === numFX - 1) {
          fx.setOutput(_this8._songOutput);
        } else {
          fx.setOutput(_this8._effects[i + 1]);
        }
        lastFX = fx;
      });
    }
  }, {
    key: 'getEffects',
    value: function getEffects() {
      return this._effects;
    }
  }, {
    key: 'getEffectAt',
    value: function getEffectAt(index) {
      if (isNaN(index)) {
        return null;
      }
      return this._effects[index];
    }
    /*
      getOutput(){
        return this._output
      }
    
      setInput(source){
        source.connect(this._songOutput)
      }
    */
    // method is called when a MIDI events is send by an external or on-screen keyboard

  }, {
    key: '_preprocessMIDIEvent',
    value: function _preprocessMIDIEvent(midiEvent) {
      midiEvent.time = 0; // play immediately -> see Instrument.processMIDIEvent
      midiEvent.recordMillis = _init_audio.context.currentTime * 1000;
      var note = void 0;

      if (midiEvent.type === _qambi.MIDIEventTypes.NOTE_ON) {
        note = new _midi_note.MIDINote(midiEvent);
        this._tmpRecordedNotes.set(midiEvent.data1, note);
        (0, _eventlistener.dispatchEvent)({
          type: 'noteOn',
          data: midiEvent
        });
      } else if (midiEvent.type === _qambi.MIDIEventTypes.NOTE_OFF) {
        note = this._tmpRecordedNotes.get(midiEvent.data1);
        if (typeof note === 'undefined') {
          return;
        }
        note.addNoteOff(midiEvent);
        this._tmpRecordedNotes.delete(midiEvent.data1);
        (0, _eventlistener.dispatchEvent)({
          type: 'noteOff',
          data: midiEvent
        });
      }

      if (this._recordEnabled === 'midi' && this._song.recording === true) {
        this._recordedEvents.push(midiEvent);
      }
      this.processMIDIEvent(midiEvent);
    }

    // method is called by scheduler during playback

  }, {
    key: 'processMIDIEvent',
    value: function processMIDIEvent(event) {
      var useLatency = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


      if (typeof event.time === 'undefined') {
        this._preprocessMIDIEvent(event);
        return;
      }

      // send to javascript instrument
      if (this._instrument !== null) {
        //console.log(this.name, event)
        this._instrument.processMIDIEvent(event, event.time / 1000);
      }

      // send to external hardware or software instrument
      this._sendToExternalMIDIOutputs(event, useLatency);
    }
  }, {
    key: '_sendToExternalMIDIOutputs',
    value: function _sendToExternalMIDIOutputs(event, useLatency) {
      var latency = useLatency ? this.latency : 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._midiOutputs.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var port = _step.value;

          if (port) {
            if (event.type === 128 || event.type === 144 || event.type === 176) {
              port.send([event.type + this.channel, event.data1, event.data2], event.time + latency);
            } else if (event.type === 192 || event.type === 224) {
              port.send([event.type + this.channel, event.data1], event.time + latency);
            }
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
    }
  }, {
    key: 'unschedule',
    value: function unschedule(midiEvent) {

      if (this._instrument !== null) {
        this._instrument.unschedule(midiEvent);
      }

      if (this._midiOutputs.size === 0) {
        return;
      }

      if (midiEvent.type === 144) {
        var midiNote = midiEvent.midiNote;
        var noteOff = new _midi_event.MIDIEvent(0, 128, midiEvent.data1, 0);
        noteOff.midiNoteId = midiNote.id;
        noteOff.time = _init_audio.context.currentTime;
        this._sendToExternalMIDIOutputs(noteOff, true);
      }
    }
  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      if (this._instrument !== null) {
        this._instrument.allNotesOff();
      }

      // let timeStamp = (context.currentTime * 1000) + this.latency
      // for(let output of this._midiOutputs.values()){
      //   output.send([0xB0, 0x7B, 0x00], timeStamp) // stop all notes
      //   output.send([0xB0, 0x79, 0x00], timeStamp) // reset all controllers
      // }
    }
  }, {
    key: 'setPanning',
    value: function setPanning(value) {
      if (value < -1 || value > 1) {
        console.log('Track.setPanning() accepts a value between -1 (full left) and 1 (full right), you entered:', value);
        return;
      }
      var x = value;
      var y = 0;
      var z = 1 - Math.abs(x);

      x = x === 0 ? zeroValue : x;
      y = y === 0 ? zeroValue : y;
      z = z === 0 ? zeroValue : z;

      this._panner.setPosition(x, y, z);
      this._panningValue = value;
    }
  }, {
    key: 'getPanning',
    value: function getPanning() {
      return this._panningValue;
    }
  }]);

  return Track;
}();

},{"./eventlistener":8,"./init_audio":11,"./init_midi":12,"./midi_event":15,"./midi_note":16,"./part":22,"./qambi":25,"./util":39}],39:[function(require,module,exports){
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

},{"isomorphic-fetch":5}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pc29tb3JwaGljLWZldGNoL2ZldGNoLW5wbS1icm93c2VyaWZ5LmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsIi4uL25vZGVfbW9kdWxlcy9maWxlc2F2ZXJqcy9GaWxlU2F2ZXIuanMiLCIuLi9zcmMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL2V2ZW50bGlzdGVuZXIuanMiLCIuLi9zcmMvZmV0Y2hfaGVscGVycy5qcyIsIi4uL3NyYy9pbml0LmpzIiwiLi4vc3JjL2luaXRfYXVkaW8uanMiLCIuLi9zcmMvaW5pdF9taWRpLmpzIiwiLi4vc3JjL2luc3RydW1lbnQuanMiLCIuLi9zcmMvbWV0cm9ub21lLmpzIiwiLi4vc3JjL21pZGlfZXZlbnQuanMiLCIuLi9zcmMvbWlkaV9ub3RlLmpzIiwiLi4vc3JjL21pZGlfc3RyZWFtLmpzIiwiLi4vc3JjL21pZGlmaWxlLmpzIiwiLi4vc3JjL25vdGUuanMiLCIuLi9zcmMvcGFyc2VfYXVkaW8uanMiLCIuLi9zcmMvcGFyc2VfZXZlbnRzLmpzIiwiLi4vc3JjL3BhcnQuanMiLCIuLi9zcmMvcGxheWhlYWQuanMiLCIuLi9zcmMvcG9zaXRpb24uanMiLCIuLi9zcmMvcWFtYmkuanMiLCIuLi9zcmMvc2FtcGxlLmpzIiwiLi4vc3JjL3NhbXBsZV9idWZmZXIuanMiLCIuLi9zcmMvc2FtcGxlX29zY2lsbGF0b3IuanMiLCIuLi9zcmMvc2FtcGxlci5qcyIsIi4uL3NyYy9zYW1wbGVzLmpzIiwiLi4vc3JjL3NhdmVfbWlkaWZpbGUuanMiLCIuLi9zcmMvc2NoZWR1bGVyLmpzIiwiLi4vc3JjL3NldHRpbmdzLmpzIiwiLi4vc3JjL3NpbXBsZV9zeW50aC5qcyIsIi4uL3NyYy9zb25nLmpzIiwiLi4vc3JjL3NvbmcudXBkYXRlLmpzIiwiLi4vc3JjL3NvbmdfZnJvbV9taWRpZmls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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QyxNQUFHLE1BQU0sS0FBTixDQUFILEVBQWdCO0FBQ2QsWUFBUSxJQUFSLENBQWEseUJBQWI7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNELE1BQUcsUUFBUSxDQUFSLElBQWEsUUFBUSxHQUF4QixFQUE0QjtBQUMxQixZQUFRLElBQVIsQ0FBYSwyQ0FBYjtBQUNBLFdBQU8sS0FBUDtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHFhbWJpLCB7XG4gIFNvbmcsXG4gIE1JRElFdmVudFR5cGVzLFxuICBTaW1wbGVTeW50aCxcbiAgZ2V0TUlESU91dHB1dHMsXG59IGZyb20gJy4uLy4uL3NyYy9xYW1iaSdcblxuXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG5cbiAgbGV0IHNvbmdcblxuICBxYW1iaS5pbml0KClcbiAgLnRoZW4oKCkgPT4ge1xuXG4gICAgbGV0IHRlc3QgPSAxXG5cbiAgICBpZih0ZXN0ID09PSAxKXtcblxuICAgICAgLy9jb25zb2xlLnRpbWUoJ3NvbmcnKVxuICAgICAgLy9mZXRjaCgnLi4vZGF0YS9tb3prNTQ1YS5taWQnKVxuICAgICAgZmV0Y2goJy4uL2RhdGEvbWludXRlX3dhbHR6Lm1pZCcpXG4gICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5hcnJheUJ1ZmZlcigpXG4gICAgICB9KVxuICAgICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIHNvbmcgPSBTb25nLmZyb21NSURJRmlsZVN5bmMoZGF0YSlcbiAgICAgICAgaW5pdFVJKClcbiAgICAgICAgLy9jb25zb2xlLnRpbWVFbmQoJ3NvbmcnKVxuICAgICAgfSlcblxuICAgIH1lbHNlIGlmKHRlc3QgPT09IDIpe1xuXG4gICAgICAvL2NvbnNvbGUudGltZSgnc29uZycpXG4gICAgICBTb25nLmZyb21NSURJRmlsZSgnLi4vZGF0YS9taW51dGVfd2FsdHoubWlkJylcbiAgICAgIC50aGVuKHMgPT4ge1xuICAgICAgICBzb25nID0gc1xuICAgICAgICAvL2NvbnNvbGUudGltZUVuZCgnc29uZycpXG4gICAgICAgIGluaXRVSSgpXG4gICAgICB9LCBlID0+IGNvbnNvbGUubG9nKGUpKVxuICAgIH1cbiAgfSlcblxuXG4gIGZ1bmN0aW9uIGluaXRVSSgpe1xuXG4gICAgc29uZy5nZXRUcmFja3MoKS5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIC8vdHJhY2suc2V0SW5zdHJ1bWVudChuZXcgU2ltcGxlU3ludGgoJ3NpbmUnKSlcbiAgICAgIHRyYWNrLmNvbm5lY3RNSURJT3V0cHV0cyguLi5nZXRNSURJT3V0cHV0cygpKVxuICAgIH0pXG5cblxuICAgIGxldCBidG5QbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXknKVxuICAgIGxldCBidG5QYXVzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXVzZScpXG4gICAgbGV0IGJ0blN0b3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcCcpXG4gICAgbGV0IGJ0bkxvb3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9vcCcpXG4gICAgbGV0IGJ0bkRlbGV0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxldGUnKVxuICAgIGxldCBidG5QYW5pYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYW5pYycpXG4gICAgbGV0IGRpdlRlbXBvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RlbXBvJylcbiAgICBsZXQgZGl2U3VzdGFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdXN0YWluJylcbiAgICBsZXQgZGl2U3VzdGFpbjIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VzdGFpbjInKVxuICAgIGxldCBkaXZTdXN0YWluMyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdXN0YWluMycpXG4gICAgbGV0IGRpdlBvc2l0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bvc2l0aW9uJylcbiAgICBsZXQgZGl2UG9zaXRpb25UaW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bvc2l0aW9uX3RpbWUnKVxuICAgIGxldCByYW5nZVBvc2l0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXloZWFkJylcbiAgICBsZXQgdXNlckludGVyYWN0aW9uID0gZmFsc2VcblxuICAgIGJ0blBsYXkuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0blBhdXNlLmRpc2FibGVkID0gZmFsc2VcbiAgICBidG5TdG9wLmRpc2FibGVkID0gZmFsc2VcbiAgICBidG5Mb29wLmRpc2FibGVkID0gZmFsc2VcbiAgICBidG5EZWxldGUuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0blBhbmljLmRpc2FibGVkID0gZmFsc2VcblxuICAgIGJ0blBsYXkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgLy9zb25nLnBsYXkoJ2JhcnNiZWF0cycsIDQsIDEsIDEsIDApXG4gICAgICAvL3NvbmcucGxheSgndGltZScsIDAsIDAsIDE1KSAvLyBwbGF5IGZyb20gMTUgc2Vjb25kc1xuICAgICAgLy9zb25nLnBsYXkoJ21pbGxpcycsIDM0MDAwKSAvLyBwbGF5IGZyb20gMzQgc2Vjb25kc1xuICAgICAgc29uZy5wbGF5KClcbiAgICB9KTtcblxuICAgIGJ0blBhdXNlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcucGF1c2UoKVxuICAgIH0pXG5cbiAgICBidG5TdG9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcuc3RvcCgpXG4gICAgfSlcblxuICAgIGJ0bkxvb3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgbGV0IGxvb3AgPSBzb25nLnNldExvb3AoKVxuICAgICAgLy8gY29uc29sZS5sb2cobG9vcClcbiAgICAgIGJ0bkxvb3AuaW5uZXJIVE1MID0gbG9vcCA/ICdzdG9wIGxvb3AnIDogJ3N0YXJ0IGxvb3AnXG4gICAgfSlcblxuICAgIGJ0blBhbmljLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcucGFuaWMoKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnYWxsIGlzIHdlbGwnKVxuICAgICAgfSlcbiAgICB9KVxuXG5cbiAgICBsZXQgbWVtb3J5TGVha1xuXG4gICAgYnRuRGVsZXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIG1lbW9yeUxlYWsgPSBzb25nLmdldEV2ZW50cygpWzBdXG4gICAgICAvL3NvbmcuZGlzcG9zZSgpXG4gICAgICBzb25nID0gbnVsbFxuICAgICAgY29uc29sZS5sb2cobWVtb3J5TGVhaykgLy8gLT4gdGhpcyBldmVudCByZXRhaW5zIHRoZSB3aG9sZSBzb25nIVxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBtZW1vcnlMZWFrID0gbnVsbFxuICAgICAgICBjb25zb2xlLmxvZygnbWVtb3J5IGNsZWFyZWQnKVxuICAgICAgfSwgNTAwMClcbiAgICB9KVxuXG4gICAgLy8gc29uZy5hZGRFdmVudExpc3RlbmVyKE1JRElFdmVudFR5cGVzLlRFTVBPLCBldmVudCA9PiB7XG4gICAgLy8gICBkaXZUZW1wby5pbm5lckhUTUwgPSBgdGVtcG86ICR7ZXZlbnQuYnBtfSBicG1gXG4gICAgLy8gfSlcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignc3VzdGFpbnBlZGFsJywgZXZlbnQgPT4ge1xuICAgICAgZGl2U3VzdGFpbi5pbm5lckhUTUwgPSAnc3VzdGFpbnBlZGFsICcgKyBldmVudC5kYXRhXG4gICAgfSlcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignc3VzdGFpbnBlZGFsMicsIGV2ZW50ID0+IHtcbiAgICAgIGRpdlN1c3RhaW4yLmlubmVySFRNTCA9ICdzdXN0YWlucGVkYWwyICcgKyBldmVudC5kYXRhXG4gICAgfSlcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcihNSURJRXZlbnRUeXBlcy5DT05UUk9MX0NIQU5HRSwgZXZlbnQgPT4ge1xuICAgICAgaWYoZXZlbnQuZGF0YTEgIT09IDY0KXtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZihldmVudC5kYXRhMiA9PT0gMTI3KXtcbiAgICAgICAgZGl2U3VzdGFpbjMuaW5uZXJIVE1MID0gJ3N1c3RhaW5wZWRhbDMgZG93bidcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgZGl2U3VzdGFpbjMuaW5uZXJIVE1MID0gJ3N1c3RhaW5wZWRhbDMgdXAnXG4gICAgICB9XG4gICAgfSlcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignbm90ZU9uJywgZXZlbnQgPT4ge1xuICAgICAgbGV0IG5vdGUgPSBldmVudC5kYXRhXG4gICAgICAvL2NvbnNvbGUubG9nKCdub3RlT24nLCBub3RlLmlkLCBub3RlLm5vdGVPbi5pZCwgbm90ZS5ub3RlT24uZGF0YTEsIG5vdGUubm90ZU9uLnRpY2tzKVxuICAgIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ25vdGVPZmYnLCBldmVudCA9PiB7XG4gICAgICBsZXQgbm90ZSA9IGV2ZW50LmRhdGFcbiAgICAgIC8vY29uc29sZS5sb2coJ25vdGVPZmYnLCBub3RlLmlkLCBub3RlLm5vdGVPZmYuaWQsIG5vdGUubm90ZU9mZi5kYXRhMSwgbm90ZS5ub3RlT2ZmLnRpY2tzKVxuICAgIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXknLCBldmVudCA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnc3RhcnRlZCBwbGF5aW5nIGF0IHBvc2l0aW9uOicsIGV2ZW50LmRhdGEpXG4gICAgfSlcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignc3RvcCcsICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdzdG9wJylcbiAgICAgIHJhbmdlUG9zaXRpb24udmFsdWUgPSAwXG4gICAgfSlcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcigncGF1c2UnLCBldmVudCA9PiB7XG4gICAgICBjb25zb2xlLmxvZygncGF1c2VkOicsIGV2ZW50LmRhdGEpXG4gICAgICAvL2NvbnNvbGUubG9nKHNvbmcuZ2V0UG9zaXRpb24oKSlcbiAgICB9KVxuXG4gICAgbGV0IHBvc2l0aW9uID0gc29uZy5nZXRQb3NpdGlvbigpXG4gICAgZGl2UG9zaXRpb24uaW5uZXJIVE1MID0gcG9zaXRpb24uYmFyc0FzU3RyaW5nXG4gICAgZGl2UG9zaXRpb25UaW1lLmlubmVySFRNTCA9IHBvc2l0aW9uLnRpbWVBc1N0cmluZ1xuICAgIGRpdlRlbXBvLmlubmVySFRNTCA9IGB0ZW1wbzogJHtwb3NpdGlvbi5icG19IGJwbWBcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcigncG9zaXRpb24nLCBldmVudCA9PiB7XG4gICAgICBkaXZQb3NpdGlvbi5pbm5lckhUTUwgPSBldmVudC5kYXRhLmJhcnNBc1N0cmluZ1xuICAgICAgZGl2UG9zaXRpb25UaW1lLmlubmVySFRNTCA9IGV2ZW50LmRhdGEudGltZUFzU3RyaW5nXG4gICAgICBkaXZUZW1wby5pbm5lckhUTUwgPSBgdGVtcG86ICR7ZXZlbnQuZGF0YS5icG19IGJwbWBcbiAgICAgIGlmKCF1c2VySW50ZXJhY3Rpb24pe1xuICAgICAgICByYW5nZVBvc2l0aW9uLnZhbHVlID0gZXZlbnQuZGF0YS5wZXJjZW50YWdlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJhbmdlUG9zaXRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGUgPT4ge1xuICAgICAgcmFuZ2VQb3NpdGlvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByYW5nZUxpc3RlbmVyKVxuICAgICAgdXNlckludGVyYWN0aW9uID0gZmFsc2VcbiAgICB9KVxuXG4gICAgcmFuZ2VQb3NpdGlvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBlID0+IHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgc29uZy5zZXRQb3NpdGlvbigncGVyY2VudGFnZScsIGUudGFyZ2V0LnZhbHVlQXNOdW1iZXIpXG4gICAgICB9LCAwKVxuICAgICAgcmFuZ2VQb3NpdGlvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByYW5nZUxpc3RlbmVyKVxuICAgICAgdXNlckludGVyYWN0aW9uID0gdHJ1ZVxuICAgIH0pXG5cbiAgICBjb25zdCByYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgICBzb25nLnNldFBvc2l0aW9uKCdwZXJjZW50YWdlJywgZS50YXJnZXQudmFsdWVBc051bWJlcilcbiAgICB9XG5cblxuICAgIHNvbmcuc2V0UG9zaXRpb24oJ2JhcnNiZWF0cycsIDIpXG4gICAgc29uZy5zZXRMZWZ0TG9jYXRvcignYmFyc2JlYXRzJywgMilcbiAgICBzb25nLnNldFJpZ2h0TG9jYXRvcignYmFyc2JlYXRzJywgMywgMilcbiAgICBzb25nLnNldExvb3AoKVxuXG5cbiAgICAvL2NvbnNvbGUubG9nKHNvbmcuZ2V0UG9zaXRpb24oKSlcbiAgfVxuXG59KVxuIiwiLy8gdGhlIHdoYXR3Zy1mZXRjaCBwb2x5ZmlsbCBpbnN0YWxscyB0aGUgZmV0Y2goKSBmdW5jdGlvblxuLy8gb24gdGhlIGdsb2JhbCBvYmplY3QgKHdpbmRvdyBvciBzZWxmKVxuLy9cbi8vIFJldHVybiB0aGF0IGFzIHRoZSBleHBvcnQgZm9yIHVzZSBpbiBXZWJwYWNrLCBCcm93c2VyaWZ5IGV0Yy5cbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xubW9kdWxlLmV4cG9ydHMgPSBzZWxmLmZldGNoLmJpbmQoc2VsZik7XG4iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG5cbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgbGlzdCA9IHRoaXMubWFwW25hbWVdXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICBsaXN0ID0gW11cbiAgICAgIHRoaXMubWFwW25hbWVdID0gbGlzdFxuICAgIH1cbiAgICBsaXN0LnB1c2godmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gICAgcmV0dXJuIHZhbHVlcyA/IHZhbHVlc1swXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gfHwgW11cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBbbm9ybWFsaXplVmFsdWUodmFsdWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5tYXApLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGhpcy5tYXBbbmFtZV0uZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBuYW1lLCB0aGlzKVxuICAgICAgfSwgdGhpcylcbiAgICB9LCB0aGlzKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgLy8gT25seSBzdXBwb3J0IEFycmF5QnVmZmVycyBmb3IgUE9TVCBtZXRob2QuXG4gICAgICAgIC8vIFJlY2VpdmluZyBBcnJheUJ1ZmZlcnMgaGFwcGVucyB2aWEgQmxvYnMsIGluc3RlYWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcbiAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBpbnB1dFxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9ICh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpLnRyaW0oKS5zcGxpdCgnXFxuJylcbiAgICBwYWlycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgdmFyIHNwbGl0ID0gaGVhZGVyLnRyaW0oKS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gc3BsaXQuc2hpZnQoKS50cmltKClcbiAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJzonKS50cmltKClcbiAgICAgIGhlYWQuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfSlcbiAgICByZXR1cm4gaGVhZFxuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9IG9wdGlvbnMuc3RhdHVzVGV4dFxuICAgIHRoaXMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMgPyBvcHRpb25zLmhlYWRlcnMgOiBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVyc1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZVxuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0XG4gICAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkgJiYgIWluaXQpIHtcbiAgICAgICAgcmVxdWVzdCA9IGlucHV0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB9XG5cbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBmdW5jdGlvbiByZXNwb25zZVVSTCgpIHtcbiAgICAgICAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgICAgIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyh4aHIpLFxuICAgICAgICAgIHVybDogcmVzcG9uc2VVUkwoKVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCIvKiBGaWxlU2F2ZXIuanNcbiAqIEEgc2F2ZUFzKCkgRmlsZVNhdmVyIGltcGxlbWVudGF0aW9uLlxuICogMS4xLjIwMTYwMzI4XG4gKlxuICogQnkgRWxpIEdyZXksIGh0dHA6Ly9lbGlncmV5LmNvbVxuICogTGljZW5zZTogTUlUXG4gKiAgIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZWxpZ3JleS9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuICovXG5cbi8qZ2xvYmFsIHNlbGYgKi9cbi8qanNsaW50IGJpdHdpc2U6IHRydWUsIGluZGVudDogNCwgbGF4YnJlYWs6IHRydWUsIGxheGNvbW1hOiB0cnVlLCBzbWFydHRhYnM6IHRydWUsIHBsdXNwbHVzOiB0cnVlICovXG5cbi8qISBAc291cmNlIGh0dHA6Ly9wdXJsLmVsaWdyZXkuY29tL2dpdGh1Yi9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvRmlsZVNhdmVyLmpzICovXG5cbnZhciBzYXZlQXMgPSBzYXZlQXMgfHwgKGZ1bmN0aW9uKHZpZXcpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdC8vIElFIDwxMCBpcyBleHBsaWNpdGx5IHVuc3VwcG9ydGVkXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIC9NU0lFIFsxLTldXFwuLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhclxuXHRcdCAgZG9jID0gdmlldy5kb2N1bWVudFxuXHRcdCAgLy8gb25seSBnZXQgVVJMIHdoZW4gbmVjZXNzYXJ5IGluIGNhc2UgQmxvYi5qcyBoYXNuJ3Qgb3ZlcnJpZGRlbiBpdCB5ZXRcblx0XHQsIGdldF9VUkwgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2aWV3LlVSTCB8fCB2aWV3LndlYmtpdFVSTCB8fCB2aWV3O1xuXHRcdH1cblx0XHQsIHNhdmVfbGluayA9IGRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsIFwiYVwiKVxuXHRcdCwgY2FuX3VzZV9zYXZlX2xpbmsgPSBcImRvd25sb2FkXCIgaW4gc2F2ZV9saW5rXG5cdFx0LCBjbGljayA9IGZ1bmN0aW9uKG5vZGUpIHtcblx0XHRcdHZhciBldmVudCA9IG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7XG5cdFx0XHRub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuXHRcdH1cblx0XHQsIGlzX3NhZmFyaSA9IC9WZXJzaW9uXFwvW1xcZFxcLl0rLipTYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcblx0XHQsIHdlYmtpdF9yZXFfZnMgPSB2aWV3LndlYmtpdFJlcXVlc3RGaWxlU3lzdGVtXG5cdFx0LCByZXFfZnMgPSB2aWV3LnJlcXVlc3RGaWxlU3lzdGVtIHx8IHdlYmtpdF9yZXFfZnMgfHwgdmlldy5tb3pSZXF1ZXN0RmlsZVN5c3RlbVxuXHRcdCwgdGhyb3dfb3V0c2lkZSA9IGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHQodmlldy5zZXRJbW1lZGlhdGUgfHwgdmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhyb3cgZXg7XG5cdFx0XHR9LCAwKTtcblx0XHR9XG5cdFx0LCBmb3JjZV9zYXZlYWJsZV90eXBlID0gXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIlxuXHRcdCwgZnNfbWluX3NpemUgPSAwXG5cdFx0Ly8gdGhlIEJsb2IgQVBJIGlzIGZ1bmRhbWVudGFsbHkgYnJva2VuIGFzIHRoZXJlIGlzIG5vIFwiZG93bmxvYWRmaW5pc2hlZFwiIGV2ZW50IHRvIHN1YnNjcmliZSB0b1xuXHRcdCwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0ID0gMTAwMCAqIDQwIC8vIGluIG1zXG5cdFx0LCByZXZva2UgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHR2YXIgcmV2b2tlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKTtcblx0XHRcdFx0fSBlbHNlIHsgLy8gZmlsZSBpcyBhIEZpbGVcblx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0LyogLy8gVGFrZSBub3RlIFczQzpcblx0XHRcdHZhclxuXHRcdFx0ICB1cmkgPSB0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIiA/IGZpbGUgOiBmaWxlLnRvVVJMKClcblx0XHRcdCwgcmV2b2tlciA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHQvLyBpZGVhbHkgRG93bmxvYWRGaW5pc2hlZEV2ZW50LmRhdGEgd291bGQgYmUgdGhlIFVSTCByZXF1ZXN0ZWRcblx0XHRcdFx0aWYgKGV2dC5kYXRhID09PSB1cmkpIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIGZpbGUgaXMgYSBGaWxlXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0O1xuXHRcdFx0dmlldy5hZGRFdmVudExpc3RlbmVyKFwiZG93bmxvYWRmaW5pc2hlZFwiLCByZXZva2VyKTtcblx0XHRcdCovXG5cdFx0XHRzZXRUaW1lb3V0KHJldm9rZXIsIGFyYml0cmFyeV9yZXZva2VfdGltZW91dCk7XG5cdFx0fVxuXHRcdCwgZGlzcGF0Y2ggPSBmdW5jdGlvbihmaWxlc2F2ZXIsIGV2ZW50X3R5cGVzLCBldmVudCkge1xuXHRcdFx0ZXZlbnRfdHlwZXMgPSBbXS5jb25jYXQoZXZlbnRfdHlwZXMpO1xuXHRcdFx0dmFyIGkgPSBldmVudF90eXBlcy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdHZhciBsaXN0ZW5lciA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF90eXBlc1tpXV07XG5cdFx0XHRcdGlmICh0eXBlb2YgbGlzdGVuZXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRsaXN0ZW5lci5jYWxsKGZpbGVzYXZlciwgZXZlbnQgfHwgZmlsZXNhdmVyKTtcblx0XHRcdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRcdFx0dGhyb3dfb3V0c2lkZShleCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCwgYXV0b19ib20gPSBmdW5jdGlvbihibG9iKSB7XG5cdFx0XHQvLyBwcmVwZW5kIEJPTSBmb3IgVVRGLTggWE1MIGFuZCB0ZXh0LyogdHlwZXMgKGluY2x1ZGluZyBIVE1MKVxuXHRcdFx0aWYgKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9iKFtcIlxcdWZlZmZcIiwgYmxvYl0sIHt0eXBlOiBibG9iLnR5cGV9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBibG9iO1xuXHRcdH1cblx0XHQsIEZpbGVTYXZlciA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdC8vIEZpcnN0IHRyeSBhLmRvd25sb2FkLCB0aGVuIHdlYiBmaWxlc3lzdGVtLCB0aGVuIG9iamVjdCBVUkxzXG5cdFx0XHR2YXJcblx0XHRcdFx0ICBmaWxlc2F2ZXIgPSB0aGlzXG5cdFx0XHRcdCwgdHlwZSA9IGJsb2IudHlwZVxuXHRcdFx0XHQsIGJsb2JfY2hhbmdlZCA9IGZhbHNlXG5cdFx0XHRcdCwgb2JqZWN0X3VybFxuXHRcdFx0XHQsIHRhcmdldF92aWV3XG5cdFx0XHRcdCwgZGlzcGF0Y2hfYWxsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgd3JpdGVlbmRcIi5zcGxpdChcIiBcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIG9uIGFueSBmaWxlc3lzIGVycm9ycyByZXZlcnQgdG8gc2F2aW5nIHdpdGggb2JqZWN0IFVSTHNcblx0XHRcdFx0LCBmc19lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICh0YXJnZXRfdmlldyAmJiBpc19zYWZhcmkgJiYgdHlwZW9mIEZpbGVSZWFkZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRcdC8vIFNhZmFyaSBkb2Vzbid0IGFsbG93IGRvd25sb2FkaW5nIG9mIGJsb2IgdXJsc1xuXHRcdFx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdFx0XHRyZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBiYXNlNjREYXRhID0gcmVhZGVyLnJlc3VsdDtcblx0XHRcdFx0XHRcdFx0dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZiA9IFwiZGF0YTphdHRhY2htZW50L2ZpbGVcIiArIGJhc2U2NERhdGEuc2xpY2UoYmFzZTY0RGF0YS5zZWFyY2goL1ssO10vKSk7XG5cdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xuXHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZG9uJ3QgY3JlYXRlIG1vcmUgb2JqZWN0IFVSTHMgdGhhbiBuZWVkZWRcblx0XHRcdFx0XHRpZiAoYmxvYl9jaGFuZ2VkIHx8ICFvYmplY3RfdXJsKSB7XG5cdFx0XHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRhcmdldF92aWV3KSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dmFyIG5ld190YWIgPSB2aWV3Lm9wZW4ob2JqZWN0X3VybCwgXCJfYmxhbmtcIik7XG5cdFx0XHRcdFx0XHRpZiAobmV3X3RhYiA9PT0gdW5kZWZpbmVkICYmIGlzX3NhZmFyaSkge1xuXHRcdFx0XHRcdFx0XHQvL0FwcGxlIGRvIG5vdCBhbGxvdyB3aW5kb3cub3Blbiwgc2VlIGh0dHA6Ly9iaXQubHkvMWtaZmZSSVxuXHRcdFx0XHRcdFx0XHR2aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCwgYWJvcnRhYmxlID0gZnVuY3Rpb24oZnVuYykge1xuXHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmIChmaWxlc2F2ZXIucmVhZHlTdGF0ZSAhPT0gZmlsZXNhdmVyLkRPTkUpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdCwgY3JlYXRlX2lmX25vdF9mb3VuZCA9IHtjcmVhdGU6IHRydWUsIGV4Y2x1c2l2ZTogZmFsc2V9XG5cdFx0XHRcdCwgc2xpY2Vcblx0XHRcdDtcblx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLklOSVQ7XG5cdFx0XHRpZiAoIW5hbWUpIHtcblx0XHRcdFx0bmFtZSA9IFwiZG93bmxvYWRcIjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5fdXNlX3NhdmVfbGluaykge1xuXHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzYXZlX2xpbmsuaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0c2F2ZV9saW5rLmRvd25sb2FkID0gbmFtZTtcblx0XHRcdFx0XHRjbGljayhzYXZlX2xpbmspO1xuXHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdHJldm9rZShvYmplY3RfdXJsKTtcblx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Ly8gT2JqZWN0IGFuZCB3ZWIgZmlsZXN5c3RlbSBVUkxzIGhhdmUgYSBwcm9ibGVtIHNhdmluZyBpbiBHb29nbGUgQ2hyb21lIHdoZW5cblx0XHRcdC8vIHZpZXdlZCBpbiBhIHRhYiwgc28gSSBmb3JjZSBzYXZlIHdpdGggYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXG5cdFx0XHQvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05MTE1OFxuXHRcdFx0Ly8gVXBkYXRlOiBHb29nbGUgZXJyYW50bHkgY2xvc2VkIDkxMTU4LCBJIHN1Ym1pdHRlZCBpdCBhZ2Fpbjpcblx0XHRcdC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0zODk2NDJcblx0XHRcdGlmICh2aWV3LmNocm9tZSAmJiB0eXBlICYmIHR5cGUgIT09IGZvcmNlX3NhdmVhYmxlX3R5cGUpIHtcblx0XHRcdFx0c2xpY2UgPSBibG9iLnNsaWNlIHx8IGJsb2Iud2Via2l0U2xpY2U7XG5cdFx0XHRcdGJsb2IgPSBzbGljZS5jYWxsKGJsb2IsIDAsIGJsb2Iuc2l6ZSwgZm9yY2Vfc2F2ZWFibGVfdHlwZSk7XG5cdFx0XHRcdGJsb2JfY2hhbmdlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHQvLyBTaW5jZSBJIGNhbid0IGJlIHN1cmUgdGhhdCB0aGUgZ3Vlc3NlZCBtZWRpYSB0eXBlIHdpbGwgdHJpZ2dlciBhIGRvd25sb2FkXG5cdFx0XHQvLyBpbiBXZWJLaXQsIEkgYXBwZW5kIC5kb3dubG9hZCB0byB0aGUgZmlsZW5hbWUuXG5cdFx0XHQvLyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NjU0NDBcblx0XHRcdGlmICh3ZWJraXRfcmVxX2ZzICYmIG5hbWUgIT09IFwiZG93bmxvYWRcIikge1xuXHRcdFx0XHRuYW1lICs9IFwiLmRvd25sb2FkXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZSA9PT0gZm9yY2Vfc2F2ZWFibGVfdHlwZSB8fCB3ZWJraXRfcmVxX2ZzKSB7XG5cdFx0XHRcdHRhcmdldF92aWV3ID0gdmlldztcblx0XHRcdH1cblx0XHRcdGlmICghcmVxX2ZzKSB7XG5cdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGZzX21pbl9zaXplICs9IGJsb2Iuc2l6ZTtcblx0XHRcdHJlcV9mcyh2aWV3LlRFTVBPUkFSWSwgZnNfbWluX3NpemUsIGFib3J0YWJsZShmdW5jdGlvbihmcykge1xuXHRcdFx0XHRmcy5yb290LmdldERpcmVjdG9yeShcInNhdmVkXCIsIGNyZWF0ZV9pZl9ub3RfZm91bmQsIGFib3J0YWJsZShmdW5jdGlvbihkaXIpIHtcblx0XHRcdFx0XHR2YXIgc2F2ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlyLmdldEZpbGUobmFtZSwgY3JlYXRlX2lmX25vdF9mb3VuZCwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdFx0ZmlsZS5jcmVhdGVXcml0ZXIoYWJvcnRhYmxlKGZ1bmN0aW9uKHdyaXRlcikge1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci5vbndyaXRlZW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBmaWxlLnRvVVJMKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlZW5kXCIsIGV2ZW50KTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldm9rZShmaWxlKTtcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgZXJyb3IgPSB3cml0ZXIuZXJyb3I7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZXJyb3IuY29kZSAhPT0gZXJyb3IuQUJPUlRfRVJSKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgYWJvcnRcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0d3JpdGVyW1wib25cIiArIGV2ZW50XSA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF07XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLndyaXRlKGJsb2IpO1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0d3JpdGVyLmFib3J0KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuV1JJVElORztcblx0XHRcdFx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdFx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRkaXIuZ2V0RmlsZShuYW1lLCB7Y3JlYXRlOiBmYWxzZX0sIGFib3J0YWJsZShmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdFx0XHQvLyBkZWxldGUgZmlsZSBpZiBpdCBhbHJlYWR5IGV4aXN0c1xuXHRcdFx0XHRcdFx0ZmlsZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdHNhdmUoKTtcblx0XHRcdFx0XHR9KSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHRcdFx0XHRpZiAoZXguY29kZSA9PT0gZXguTk9UX0ZPVU5EX0VSUikge1xuXHRcdFx0XHRcdFx0XHRzYXZlKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmc19lcnJvcigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0fVxuXHRcdCwgRlNfcHJvdG8gPSBGaWxlU2F2ZXIucHJvdG90eXBlXG5cdFx0LCBzYXZlQXMgPSBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pO1xuXHRcdH1cblx0O1xuXHQvLyBJRSAxMCsgKG5hdGl2ZSBzYXZlQXMpXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLCBuYW1lIHx8IFwiZG93bmxvYWRcIik7XG5cdFx0fTtcblx0fVxuXG5cdEZTX3Byb3RvLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZpbGVzYXZlciA9IHRoaXM7XG5cdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwiYWJvcnRcIik7XG5cdH07XG5cdEZTX3Byb3RvLnJlYWR5U3RhdGUgPSBGU19wcm90by5JTklUID0gMDtcblx0RlNfcHJvdG8uV1JJVElORyA9IDE7XG5cdEZTX3Byb3RvLkRPTkUgPSAyO1xuXG5cdEZTX3Byb3RvLmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZXN0YXJ0ID1cblx0RlNfcHJvdG8ub25wcm9ncmVzcyA9XG5cdEZTX3Byb3RvLm9ud3JpdGUgPVxuXHRGU19wcm90by5vbmFib3J0ID1cblx0RlNfcHJvdG8ub25lcnJvciA9XG5cdEZTX3Byb3RvLm9ud3JpdGVlbmQgPVxuXHRcdG51bGw7XG5cblx0cmV0dXJuIHNhdmVBcztcbn0oXG5cdCAgIHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiICYmIHNlbGZcblx0fHwgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3dcblx0fHwgdGhpcy5jb250ZW50XG4pKTtcbi8vIGBzZWxmYCBpcyB1bmRlZmluZWQgaW4gRmlyZWZveCBmb3IgQW5kcm9pZCBjb250ZW50IHNjcmlwdCBjb250ZXh0XG4vLyB3aGlsZSBgdGhpc2AgaXMgbnNJQ29udGVudEZyYW1lTWVzc2FnZU1hbmFnZXJcbi8vIHdpdGggYW4gYXR0cmlidXRlIGBjb250ZW50YCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB3aW5kb3dcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMuc2F2ZUFzID0gc2F2ZUFzO1xufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkZWZpbmUgIT09IG51bGwpICYmIChkZWZpbmUuYW1kICE9PSBudWxsKSkge1xuICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzYXZlQXM7XG4gIH0pO1xufVxuIiwiXG4vLyBzdGFuZGFyZCBNSURJIGV2ZW50c1xuY29uc3QgTUlESUV2ZW50VHlwZXMgPSB7fVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09GRicsIHt2YWx1ZTogMHg4MH0pIC8vMTI4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09OJywge3ZhbHVlOiAweDkwfSkgLy8xNDRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BPTFlfUFJFU1NVUkUnLCB7dmFsdWU6IDB4QTB9KSAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVFJPTF9DSEFOR0UnLCB7dmFsdWU6IDB4QjB9KSAvLzE3NlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUFJPR1JBTV9DSEFOR0UnLCB7dmFsdWU6IDB4QzB9KSAvLzE5MlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ0hBTk5FTF9QUkVTU1VSRScsIHt2YWx1ZTogMHhEMH0pIC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQSVRDSF9CRU5EJywge3ZhbHVlOiAweEUwfSkgLy8yMjRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NZU1RFTV9FWENMVVNJVkUnLCB7dmFsdWU6IDB4RjB9KSAvLzI0MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTUlESV9USU1FQ09ERScsIHt2YWx1ZTogMjQxfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfUE9TSVRJT04nLCB7dmFsdWU6IDI0Mn0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTT05HX1NFTEVDVCcsIHt2YWx1ZTogMjQzfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RVTkVfUkVRVUVTVCcsIHt2YWx1ZTogMjQ2fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0VPWCcsIHt2YWx1ZTogMjQ3fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RJTUlOR19DTE9DSycsIHt2YWx1ZTogMjQ4fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NUQVJUJywge3ZhbHVlOiAyNTB9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVElOVUUnLCB7dmFsdWU6IDI1MX0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTVE9QJywge3ZhbHVlOiAyNTJ9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQUNUSVZFX1NFTlNJTkcnLCB7dmFsdWU6IDI1NH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTWVNURU1fUkVTRVQnLCB7dmFsdWU6IDI1NX0pXG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVEVNUE8nLCB7dmFsdWU6IDB4NTF9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNRV9TSUdOQVRVUkUnLCB7dmFsdWU6IDB4NTh9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU5EX09GX1RSQUNLJywge3ZhbHVlOiAweDJGfSlcblxuZXhwb3J0IHtNSURJRXZlbnRUeXBlc31cbiIsImxldCBldmVudExpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldmVudCl7XG4gIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSlcbiAgbGV0IG1hcFxuXG4gIGlmKGV2ZW50LnR5cGUgPT09ICdldmVudCcpe1xuICAgIGxldCBtaWRpRXZlbnQgPSBldmVudC5kYXRhXG4gICAgbGV0IG1pZGlFdmVudFR5cGUgPSBtaWRpRXZlbnQudHlwZVxuICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50VHlwZSlcbiAgICBpZihldmVudExpc3RlbmVycy5oYXMobWlkaUV2ZW50VHlwZSkpe1xuICAgICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudFR5cGUpXG4gICAgICBmb3IobGV0IGNiIG9mIG1hcC52YWx1ZXMoKSl7XG4gICAgICAgIGNiKG1pZGlFdmVudClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUsIGV2ZW50TGlzdGVuZXJzLmhhcyhldmVudC50eXBlKSlcbiAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKGV2ZW50LnR5cGUpID09PSBmYWxzZSl7XG4gICAgcmV0dXJuXG4gIH1cblxuICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnQudHlwZSlcbiAgZm9yKGxldCBjYiBvZiBtYXAudmFsdWVzKCkpe1xuICAgIGNiKGV2ZW50KVxuICB9XG5cblxuICAvLyBAdG9kbzogcnVuIGZpbHRlcnMgaGVyZSwgZm9yIGluc3RhbmNlIGlmIGFuIGV2ZW50bGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgdG8gYWxsIE5PVEVfT04gZXZlbnRzLCBjaGVjayB0aGUgdHlwZSBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGNhbGxiYWNrKXtcblxuICBsZXQgbWFwXG4gIGxldCBpZCA9IGAke3R5cGV9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuXG4gIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSA9PT0gZmFsc2Upe1xuICAgIG1hcCA9IG5ldyBNYXAoKVxuICAgIGV2ZW50TGlzdGVuZXJzLnNldCh0eXBlLCBtYXApXG4gIH1lbHNle1xuICAgIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKVxuICB9XG5cbiAgbWFwLnNldChpZCwgY2FsbGJhY2spXG4gIC8vY29uc29sZS5sb2coZXZlbnRMaXN0ZW5lcnMpXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcblxuICBpZihldmVudExpc3RlbmVycy5oYXModHlwZSkgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmxvZygnbm8gZXZlbnRsaXN0ZW5lcnMgb2YgdHlwZScgKyB0eXBlKVxuICAgIHJldHVyblxuICB9XG5cbiAgbGV0IG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKVxuXG4gIGlmKHR5cGVvZiBpZCA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgZm9yKGxldCBba2V5LCB2YWx1ZV0gb2YgbWFwLmVudHJpZXMoKSkge1xuICAgICAgY29uc29sZS5sb2coa2V5LCB2YWx1ZSlcbiAgICAgIGlmKHZhbHVlID09PSBpZCl7XG4gICAgICAgIGNvbnNvbGUubG9nKGtleSlcbiAgICAgICAgaWQgPSBrZXlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYodHlwZW9mIGlkID09PSAnc3RyaW5nJyl7XG4gICAgICBtYXAuZGVsZXRlKGlkKVxuICAgIH1cbiAgfWVsc2UgaWYodHlwZW9mIGlkID09PSAnc3RyaW5nJyl7XG4gICAgbWFwLmRlbGV0ZShpZClcbiAgfWVsc2V7XG4gICAgY29uc29sZS5sb2coJ2NvdWxkIG5vdCByZW1vdmUgZXZlbnRsaXN0ZW5lcicpXG4gIH1cbn1cblxuIiwiLy8gZmV0Y2ggaGVscGVyc1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhdHVzKHJlc3BvbnNlKSB7XG4gIGlmKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKXtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3BvbnNlKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpXG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGpzb24ocmVzcG9uc2Upe1xuICByZXR1cm4gcmVzcG9uc2UuanNvbigpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUJ1ZmZlcihyZXNwb25zZSl7XG4gIHJldHVybiByZXNwb25zZS5hcnJheUJ1ZmZlcigpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoSlNPTih1cmwpe1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIGZldGNoKHVybCwge1xuICAgIC8vICAgbW9kZTogJ25vLWNvcnMnXG4gICAgLy8gfSlcbiAgICBmZXRjaCh1cmwpXG4gICAgLnRoZW4oc3RhdHVzKVxuICAgIC50aGVuKGpzb24pXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICByZXNvbHZlKGRhdGEpXG4gICAgfSlcbiAgICAuY2F0Y2goZSA9PiB7XG4gICAgICByZWplY3QoZSlcbiAgICB9KVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hBcnJheWJ1ZmZlcih1cmwpe1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIGZldGNoKHVybCwge1xuICAgIC8vICAgbW9kZTogJ25vLWNvcnMnXG4gICAgLy8gfSlcbiAgICBmZXRjaCh1cmwpXG4gICAgLnRoZW4oc3RhdHVzKVxuICAgIC50aGVuKGFycmF5QnVmZmVyKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgcmVzb2x2ZShkYXRhKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cbiIsImltcG9ydCBxYW1iaSBmcm9tICcuL3FhbWJpJ1xuaW1wb3J0IHtTb25nfSBmcm9tICcuL3NvbmcnXG5pbXBvcnQge1NhbXBsZXJ9IGZyb20gJy4vc2FtcGxlcidcbmltcG9ydCB7aW5pdEF1ZGlvfSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge2luaXRNSURJfSBmcm9tICcuL2luaXRfbWlkaSdcblxuZXhwb3J0IGxldCBnZXRVc2VyTWVkaWEgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybignZ2V0VXNlck1lZGlhIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZXhwb3J0IGxldCByQUYgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybigncmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZXhwb3J0IGxldCBCbG9iID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB3aW5kb3cuQmxvYiB8fCB3aW5kb3cud2Via2l0QmxvYlxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybignQmxvYiBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmZ1bmN0aW9uIGxvYWRJbnN0cnVtZW50KGRhdGEpe1xuICBsZXQgc2FtcGxlciA9IG5ldyBTYW1wbGVyKClcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBzYW1wbGVyLnBhcnNlU2FtcGxlRGF0YShkYXRhKVxuICAgIC50aGVuKCgpID0+IHJlc29sdmUoc2FtcGxlcikpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KHNldHRpbmdzID0gbnVsbCk6IHZvaWR7XG5cbiAgLy8gbG9hZCBzZXR0aW5ncy5pbnN0cnVtZW50cyAoYXJyYXkgb3Igb2JqZWN0KVxuICAvLyBsb2FkIHNldHRpbmdzLm1pZGlmaWxlcyAoYXJyYXkgb3Igb2JqZWN0KVxuICAvKlxuXG4gIHFhbWJpLmluaXQoe1xuICAgIHNvbmc6IHtcbiAgICAgIHR5cGU6ICdTb25nJyxcbiAgICAgIHVybDogJy4uL2RhdGEvbWludXRlX3dhbHR6Lm1pZCdcbiAgICB9LFxuICAgIHBpYW5vOiB7XG4gICAgICB0eXBlOiAnSW5zdHJ1bWVudCcsXG4gICAgICB1cmw6ICcuLi8uLi9pbnN0cnVtZW50cy9lbGVjdHJpYy1waWFuby5qc29uJ1xuICAgIH1cbiAgfSlcblxuICBxYW1iaS5pbml0KHtcbiAgICBpbnN0cnVtZW50czogWycuLi9pbnN0cnVtZW50cy9waWFubycsICcuLi9pbnN0cnVtZW50cy92aW9saW4nXSxcbiAgICBtaWRpZmlsZXM6IFsnLi4vbWlkaS9tb3phcnQubWlkJ11cbiAgfSlcbiAgLnRoZW4oKGxvYWRlZCkgPT4ge1xuICAgIGxldCBbcGlhbm8sIHZpb2xpbl0gPSBsb2FkZWQuaW5zdHJ1bWVudHNcbiAgICBsZXQgW21vemFydF0gPSBsb2FkZWQubWlkaWZpbGVzXG4gIH0pXG5cbiAgKi9cblxuICBsZXQgcHJvbWlzZXMgPSBbaW5pdEF1ZGlvKCksIGluaXRNSURJKCldXG4gIGxldCBsb2FkS2V5c1xuXG4gIGlmKHNldHRpbmdzICE9PSBudWxsKXtcbiAgICBsb2FkS2V5cyA9IE9iamVjdC5rZXlzKHNldHRpbmdzKVxuICAgIGZvcihsZXQga2V5IG9mIGxvYWRLZXlzKXtcbiAgICAgIGxldCBkYXRhID0gc2V0dGluZ3Nba2V5XVxuXG4gICAgICBpZihkYXRhLnR5cGUgPT09ICdTb25nJyl7XG4gICAgICAgIHByb21pc2VzLnB1c2goU29uZy5mcm9tTUlESUZpbGUoZGF0YS51cmwpKVxuICAgICAgfWVsc2UgaWYoZGF0YS50eXBlID09PSAnSW5zdHJ1bWVudCcpe1xuICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRJbnN0cnVtZW50KGRhdGEpKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIC50aGVuKFxuICAgIChyZXN1bHQpID0+IHtcblxuICAgICAgbGV0IHJldHVybk9iaiA9IHt9XG5cbiAgICAgIHJlc3VsdC5mb3JFYWNoKChkYXRhLCBpKSA9PiB7XG4gICAgICAgIGlmKGkgPT09IDApe1xuICAgICAgICAgIC8vIHBhcnNlQXVkaW9cbiAgICAgICAgICByZXR1cm5PYmoubGVnYWN5ID0gZGF0YS5sZWdhY3lcbiAgICAgICAgICByZXR1cm5PYmoubXAzID0gZGF0YS5tcDNcbiAgICAgICAgICByZXR1cm5PYmoub2dnID0gZGF0YS5vZ2dcbiAgICAgICAgfWVsc2UgaWYoaSA9PT0gMSl7XG4gICAgICAgICAgLy8gcGFyc2VNSURJXG4gICAgICAgICAgcmV0dXJuT2JqLm1pZGkgPSBkYXRhLm1pZGlcbiAgICAgICAgICByZXR1cm5PYmoud2VibWlkaSA9IGRhdGEud2VibWlkaVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAvLyBJbnN0cnVtZW50cywgc2FtcGxlcyBvciBNSURJIGZpbGVzIHRoYXQgZ290IGxvYWRlZCBkdXJpbmcgaW5pdGlhbGl6YXRpb25cbiAgICAgICAgICByZXN1bHRbbG9hZEtleXNbaSAtIDJdXSA9IGRhdGFcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29uc29sZS5sb2coJ3FhbWJpJywgcWFtYmkudmVyc2lvbilcbiAgICAgIHJlc29sdmUocmVzdWx0KVxuICAgIH0sXG4gICAgKGVycm9yKSA9PiB7XG4gICAgICByZWplY3QoZXJyb3IpXG4gICAgfSlcbiAgfSlcblxuXG4vKlxuICBQcm9taXNlLmFsbChbaW5pdEF1ZGlvKCksIGluaXRNSURJKCldKVxuICAudGhlbihcbiAgKGRhdGEpID0+IHtcbiAgICAvLyBwYXJzZUF1ZGlvXG4gICAgbGV0IGRhdGFBdWRpbyA9IGRhdGFbMF1cblxuICAgIC8vIHBhcnNlTUlESVxuICAgIGxldCBkYXRhTWlkaSA9IGRhdGFbMV1cblxuICAgIGNhbGxiYWNrKHtcbiAgICAgIGxlZ2FjeTogZGF0YUF1ZGlvLmxlZ2FjeSxcbiAgICAgIG1wMzogZGF0YUF1ZGlvLm1wMyxcbiAgICAgIG9nZzogZGF0YUF1ZGlvLm9nZyxcbiAgICAgIG1pZGk6IGRhdGFNaWRpLm1pZGksXG4gICAgICB3ZWJtaWRpOiBkYXRhTWlkaS53ZWJtaWRpLFxuICAgIH0pXG4gIH0sXG4gIChlcnJvcikgPT4ge1xuICAgIGNhbGxiYWNrKGVycm9yKVxuICB9KVxuKi9cbn1cblxuIiwiLypcbiAgU2V0cyB1cCB0aGUgYmFzaWMgYXVkaW8gcm91dGluZywgdGVzdHMgd2hpY2ggYXVkaW8gZm9ybWF0cyBhcmUgc3VwcG9ydGVkIGFuZCBwYXJzZXMgdGhlIHNhbXBsZXMgZm9yIHRoZSBtZXRyb25vbWUgdGlja3MuXG4qL1xuXG5pbXBvcnQgc2FtcGxlcyBmcm9tICcuL3NhbXBsZXMnXG5pbXBvcnQge3BhcnNlU2FtcGxlc30gZnJvbSAnLi9wYXJzZV9hdWRpbydcblxubGV0IGRhdGFcbmxldCBtYXN0ZXJHYWluXG5sZXQgY29tcHJlc3NvclxubGV0IGluaXRpYWxpemVkID0gZmFsc2VcblxuXG5leHBvcnQgbGV0IGNvbnRleHQgPSAoZnVuY3Rpb24oKXtcbiAgLy9jb25zb2xlLmxvZygnaW5pdCBBdWRpb0NvbnRleHQnKVxuICBsZXQgY3R4XG4gIGlmKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKXtcbiAgICBsZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0XG4gICAgaWYoQXVkaW9Db250ZXh0ICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICBjdHggPSBuZXcgQXVkaW9Db250ZXh0KClcbiAgICB9XG4gIH1cbiAgaWYodHlwZW9mIGN0eCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIC8vQFRPRE86IGNyZWF0ZSBkdW1teSBBdWRpb0NvbnRleHQgZm9yIHVzZSBpbiBub2RlLCBzZWU6IGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2F1ZGlvLWNvbnRleHRcbiAgICBjb250ZXh0ID0ge1xuICAgICAgY3JlYXRlR2FpbjogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBnYWluOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjcmVhdGVPc2NpbGxhdG9yOiBmdW5jdGlvbigpe30sXG4gICAgfVxuICB9XG4gIHJldHVybiBjdHhcbn0oKSlcblxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEF1ZGlvKCl7XG5cbiAgaWYodHlwZW9mIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluXG4gIH1cbiAgLy8gY2hlY2sgZm9yIG9sZGVyIGltcGxlbWVudGF0aW9ucyBvZiBXZWJBdWRpb1xuICBkYXRhID0ge31cbiAgbGV0IHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgZGF0YS5sZWdhY3kgPSBmYWxzZVxuICBpZih0eXBlb2Ygc291cmNlLnN0YXJ0ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZGF0YS5sZWdhY3kgPSB0cnVlXG4gIH1cblxuICAvLyBzZXQgdXAgdGhlIGVsZW1lbnRhcnkgYXVkaW8gbm9kZXNcbiAgY29tcHJlc3NvciA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKClcbiAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICBtYXN0ZXJHYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gMC41XG4gIGluaXRpYWxpemVkID0gdHJ1ZVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICBwYXJzZVNhbXBsZXMoc2FtcGxlcykudGhlbihcbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGJ1ZmZlcnMpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKGJ1ZmZlcnMpXG4gICAgICAgIGRhdGEub2dnID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlPZ2cgIT09ICd1bmRlZmluZWQnXG4gICAgICAgIGRhdGEubXAzID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlNcDMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgIGRhdGEubG93dGljayA9IGJ1ZmZlcnMubG93dGlja1xuICAgICAgICBkYXRhLmhpZ2h0aWNrID0gYnVmZmVycy5oaWdodGlja1xuICAgICAgICBpZihkYXRhLm9nZyA9PT0gZmFsc2UgJiYgZGF0YS5tcDMgPT09IGZhbHNlKXtcbiAgICAgICAgICByZWplY3QoJ05vIHN1cHBvcnQgZm9yIG9nZyBub3IgbXAzIScpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJlc29sdmUoZGF0YSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoKXtcbiAgICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSBpbml0aWFsaXppbmcgQXVkaW8nKVxuICAgICAgfVxuICAgIClcbiAgfSlcbn1cblxuXG5sZXQgc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24odmFsdWU6IG51bWJlciA9IDAuNSk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24odmFsdWU6IG51bWJlciA9IDAuNSl7XG4gICAgICBpZih2YWx1ZSA+IDEpe1xuICAgICAgICBjb25zb2xlLmluZm8oJ21heGltYWwgdm9sdW1lIGlzIDEuMCwgdm9sdW1lIGlzIHNldCB0byAxLjAnKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUgPCAwID8gMCA6IHZhbHVlID4gMSA/IDEgOiB2YWx1ZVxuICAgICAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldE1hc3RlclZvbHVtZSh2YWx1ZSlcbiAgfVxufVxuXG5cbmxldCBnZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbWFzdGVyR2Fpbi5nYWluLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRNYXN0ZXJWb2x1bWUoKVxuICB9XG59XG5cblxubGV0IGdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gY29tcHJlc3Nvci5yZWR1Y3Rpb24udmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIGdldENvbXByZXNzaW9uUmVkdWN0aW9uKClcbiAgfVxufVxuXG5cbmxldCBlbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBlbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oZmxhZzogYm9vbGVhbil7XG4gICAgICBpZihmbGFnKXtcbiAgICAgICAgbWFzdGVyR2Fpbi5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmNvbm5lY3QoY29tcHJlc3Nvcik7XG4gICAgICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIGVuYWJsZU1hc3RlckNvbXByZXNzb3IoKVxuICB9XG59XG5cblxubGV0IGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihjZmcpOiB2b2lke1xuICAvKlxuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGF0dGFjazsgLy8gaW4gU2Vjb25kc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGtuZWU7IC8vIGluIERlY2liZWxzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmF0aW87IC8vIHVuaXQtbGVzc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlZHVjdGlvbjsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWxlYXNlOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gdGhyZXNob2xkOyAvLyBpbiBEZWNpYmVsc1xuXG4gICAgQHNlZTogaHR0cDovL3dlYmF1ZGlvLmdpdGh1Yi5pby93ZWItYXVkaW8tYXBpLyN0aGUtZHluYW1pY3Njb21wcmVzc29ybm9kZS1pbnRlcmZhY2VcbiAgKi9cbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oY2ZnOiB7fSl7XG4gICAgICAoe1xuICAgICAgICBhdHRhY2s6IGNvbXByZXNzb3IuYXR0YWNrID0gMC4wMDMsXG4gICAgICAgIGtuZWU6IGNvbXByZXNzb3Iua25lZSA9IDMwLFxuICAgICAgICByYXRpbzogY29tcHJlc3Nvci5yYXRpbyA9IDEyLFxuICAgICAgICByZWR1Y3Rpb246IGNvbXByZXNzb3IucmVkdWN0aW9uID0gMCxcbiAgICAgICAgcmVsZWFzZTogY29tcHJlc3Nvci5yZWxlYXNlID0gMC4yNTAsXG4gICAgICAgIHRocmVzaG9sZDogY29tcHJlc3Nvci50aHJlc2hvbGQgPSAtMjQsXG4gICAgICB9ID0gY2ZnKVxuICAgIH1cbiAgICBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yKGNmZylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5pdERhdGEoKXtcbiAgcmV0dXJuIGRhdGFcbn1cblxuLy8gdGhpcyBkb2Vzbid0IHNlZW0gdG8gYmUgbmVjZXNzYXJ5IGFueW1vcmUgb24gaU9TIGFueW1vcmVcbmxldCB1bmxvY2tXZWJBdWRpbyA9IGZ1bmN0aW9uKCl7XG4gIGxldCBzcmMgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKVxuICBsZXQgZ2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICBnYWluTm9kZS5nYWluLnZhbHVlID0gMFxuICBzcmMuY29ubmVjdChnYWluTm9kZSlcbiAgZ2Fpbk5vZGUuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICBpZih0eXBlb2Ygc3JjLm5vdGVPbiAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHNyYy5zdGFydCA9IHNyYy5ub3RlT25cbiAgICBzcmMuc3RvcCA9IHNyYy5ub3RlT2ZmXG4gIH1cbiAgc3JjLnN0YXJ0KDApXG4gIHNyYy5zdG9wKDAuMDAxKVxuICB1bmxvY2tXZWJBdWRpbyA9IGZ1bmN0aW9uKCl7XG4gICAgLy9jb25zb2xlLmxvZygnYWxyZWFkeSBkb25lJylcbiAgfVxufVxuXG5leHBvcnQge21hc3RlckdhaW4sIHVubG9ja1dlYkF1ZGlvLCBjb21wcmVzc29yIGFzIG1hc3RlckNvbXByZXNzb3IsIHNldE1hc3RlclZvbHVtZSwgZ2V0TWFzdGVyVm9sdW1lLCBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiwgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciwgY29uZmlndXJlTWFzdGVyQ29tcHJlc3Nvcn1cbiIsIi8qXG4gIFJlcXVlc3RzIE1JREkgYWNjZXNzLCBxdWVyaWVzIGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgYW5kIHN0b3JlcyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxuKi9cblxuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5cblxubGV0IE1JRElBY2Nlc3NcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlXG5sZXQgaW5wdXRzID0gW11cbmxldCBvdXRwdXRzID0gW11cbmxldCBpbnB1dElkcyA9IFtdXG5sZXQgb3V0cHV0SWRzID0gW11cbmxldCBpbnB1dHNCeUlkID0gbmV3IE1hcCgpXG5sZXQgb3V0cHV0c0J5SWQgPSBuZXcgTWFwKClcblxubGV0IHNvbmdNaWRpRXZlbnRMaXN0ZW5lclxubGV0IG1pZGlFdmVudExpc3RlbmVySWQgPSAwXG5cblxuZnVuY3Rpb24gZ2V0TUlESXBvcnRzKCl7XG4gIGlucHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5pbnB1dHMudmFsdWVzKCkpXG5cbiAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gIGlucHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSlcblxuICBmb3IobGV0IHBvcnQgb2YgaW5wdXRzKXtcbiAgICBpbnB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KVxuICAgIGlucHV0SWRzLnB1c2gocG9ydC5pZClcbiAgfVxuXG4gIG91dHB1dHMgPSBBcnJheS5mcm9tKE1JRElBY2Nlc3Mub3V0cHV0cy52YWx1ZXMoKSlcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgb3V0cHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSlcblxuICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gIGZvcihsZXQgcG9ydCBvZiBvdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKHBvcnQuaWQsIHBvcnQubmFtZSlcbiAgICBvdXRwdXRzQnlJZC5zZXQocG9ydC5pZCwgcG9ydClcbiAgICBvdXRwdXRJZHMucHVzaChwb3J0LmlkKVxuICB9XG4gIC8vY29uc29sZS5sb2cob3V0cHV0c0J5SWQpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNSURJKCl7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICBpZih0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgIHJlc29sdmUoe21pZGk6IGZhbHNlfSlcbiAgICB9ZWxzZSBpZih0eXBlb2YgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzICE9PSAndW5kZWZpbmVkJyl7XG5cbiAgICAgIGxldCBqYXp6LCBtaWRpLCB3ZWJtaWRpXG5cbiAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcygpLnRoZW4oXG5cbiAgICAgICAgZnVuY3Rpb24gb25GdWxGaWxsZWQobWlkaUFjY2Vzcyl7XG4gICAgICAgICAgTUlESUFjY2VzcyA9IG1pZGlBY2Nlc3NcbiAgICAgICAgICBpZih0eXBlb2YgbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlcyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgamF6eiA9IG1pZGlBY2Nlc3MuX2phenpJbnN0YW5jZXNbMF0uX0phenoudmVyc2lvblxuICAgICAgICAgICAgbWlkaSA9IHRydWVcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHdlYm1pZGkgPSB0cnVlXG4gICAgICAgICAgICBtaWRpID0gdHJ1ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGdldE1JRElwb3J0cygpXG5cbiAgICAgICAgICAvLyBvbmNvbm5lY3QgYW5kIG9uZGlzY29ubmVjdCBhcmUgbm90IHlldCBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgYW5kIENocm9taXVtXG4gICAgICAgICAgbWlkaUFjY2Vzcy5vbmNvbm5lY3QgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgY29ubmVjdGVkJywgZSlcbiAgICAgICAgICAgIGdldE1JRElwb3J0cygpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWlkaUFjY2Vzcy5vbmRpc2Nvbm5lY3QgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgZGlzY29ubmVjdGVkJywgZSlcbiAgICAgICAgICAgIGdldE1JRElwb3J0cygpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICBqYXp6LFxuICAgICAgICAgICAgbWlkaSxcbiAgICAgICAgICAgIHdlYm1pZGksXG4gICAgICAgICAgICBpbnB1dHMsXG4gICAgICAgICAgICBvdXRwdXRzLFxuICAgICAgICAgICAgaW5wdXRzQnlJZCxcbiAgICAgICAgICAgIG91dHB1dHNCeUlkLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QoZSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhlKVxuICAgICAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgcmVxdWVzdGluZyBNSURJQWNjZXNzJywgZSlcbiAgICAgICAgfVxuICAgICAgKVxuICAgIC8vIGJyb3dzZXJzIHdpdGhvdXQgV2ViTUlESSBBUElcbiAgICB9ZWxzZXtcbiAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgcmVzb2x2ZSh7bWlkaTogZmFsc2V9KVxuICAgIH1cbiAgfSlcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElBY2Nlc3MgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElBY2Nlc3MgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIE1JRElBY2Nlc3NcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElBY2Nlc3MoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBvdXRwdXRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJT3V0cHV0cygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBpbnB1dHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElJbnB1dHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRJZHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRJZHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG91dHB1dElkc1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dElkcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElJbnB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gaW5wdXRJZHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElJbnB1dElkcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0QnlJZCA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRCeUlkID0gZnVuY3Rpb24oX2lkKXtcbiAgICAgIHJldHVybiBvdXRwdXRzQnlJZC5nZXQoX2lkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dEJ5SWQoaWQpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24oaWQ6IHN0cmluZyl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uKF9pZCl7XG4gICAgICByZXR1cm4gaW5wdXRzQnlJZC5nZXQoX2lkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0QnlJZChpZClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNaWRpU29uZyhzb25nKXtcblxuICBzb25nTWlkaUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKXtcbiAgICAvL2NvbnNvbGUubG9nKGUpXG4gICAgaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIGUsIHRoaXMpO1xuICB9O1xuXG4gIC8vIGJ5IGRlZmF1bHQgYSBzb25nIGxpc3RlbnMgdG8gYWxsIGF2YWlsYWJsZSBtaWRpLWluIHBvcnRzXG4gIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHBvcnQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xuXG4gIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlJbnB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgaW5wdXQgPSBpbnB1dHMuZ2V0KGlkKTtcblxuICBpZihpbnB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIGlucHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaUlucHV0cy5kZWxldGUoaWQpO1xuICAgIGlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChpZCwgaW5wdXQpO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlJbnB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaU91dHB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgb3V0cHV0ID0gb3V0cHV0cy5nZXQoaWQpO1xuXG4gIGlmKG91dHB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIG91dHB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLmRlbGV0ZShpZCk7XG4gICAgbGV0IHRpbWUgPSBzb25nLnNjaGVkdWxlci5sYXN0RXZlbnRUaW1lICsgMTAwO1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZSk7IC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lKTsgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gIH1lbHNle1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KGlkLCBvdXRwdXQpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaU91dHB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVNvbmcoc29uZywgbWlkaU1lc3NhZ2VFdmVudCwgaW5wdXQpe1xuICBsZXQgbWlkaUV2ZW50ID0gbmV3IE1pZGlFdmVudChzb25nLnRpY2tzLCAuLi5taWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1pZGlJbnB1dHMsIGlucHV0KTtcblxuXG4gICAgLy9pZihtaWRpRXZlbnQuY2hhbm5lbCA9PT0gdHJhY2suY2hhbm5lbCB8fCB0cmFjay5jaGFubmVsID09PSAwIHx8IHRyYWNrLmNoYW5uZWwgPT09ICdhbnknKXtcbiAgICAvLyAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrKTtcbiAgICAvL31cblxuXG4gICAgLy8gbGlrZSBpbiBDdWJhc2UsIG1pZGkgZXZlbnRzIGZyb20gYWxsIGRldmljZXMsIHNlbnQgb24gYW55IG1pZGkgY2hhbm5lbCBhcmUgZm9yd2FyZGVkIHRvIGFsbCB0cmFja3NcbiAgICAvLyBzZXQgdHJhY2subW9uaXRvciB0byBmYWxzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byByZWNlaXZlIG1pZGkgZXZlbnRzIG9uIGEgY2VydGFpbiB0cmFja1xuICAgIC8vIG5vdGUgdGhhdCB0cmFjay5tb25pdG9yIGlzIGJ5IGRlZmF1bHQgc2V0IHRvIGZhbHNlIGFuZCB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYXV0b21hdGljYWxseSBzZXQgdG8gdHJ1ZVxuICAgIC8vIGlmIHlvdSBhcmUgcmVjb3JkaW5nIG9uIHRoYXQgdHJhY2tcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1vbml0b3IsIHRyYWNrLmlkLCBpbnB1dC5pZCk7XG4gICAgaWYodHJhY2subW9uaXRvciA9PT0gdHJ1ZSAmJiB0cmFjay5taWRpSW5wdXRzLmdldChpbnB1dC5pZCkgIT09IHVuZGVmaW5lZCl7XG4gICAgICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2ssIGlucHV0KTtcbiAgICB9XG4gIH1cblxuICBsZXQgbGlzdGVuZXJzID0gc29uZy5taWRpRXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudC50eXBlKTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIGZvcihsZXQgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH1cbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sodHJhY2ssIG1pZGlFdmVudCwgaW5wdXQpe1xuICBsZXQgc29uZyA9IHRyYWNrLnNvbmcsXG4gICAgbm90ZSwgbGlzdGVuZXJzLCBjaGFubmVsO1xuICAgIC8vZGF0YSA9IG1pZGlNZXNzYWdlRXZlbnQuZGF0YSxcbiAgICAvL21pZGlFdmVudCA9IGNyZWF0ZU1pZGlFdmVudChzb25nLnRpY2tzLCBkYXRhWzBdLCBkYXRhWzFdLCBkYXRhWzJdKTtcblxuICAvL21pZGlFdmVudC5zb3VyY2UgPSBtaWRpTWVzc2FnZUV2ZW50LnNyY0VsZW1lbnQubmFtZTtcbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50KVxuICAvL2NvbnNvbGUubG9nKCctLS0tPicsIG1pZGlFdmVudC50eXBlKTtcblxuICAvLyBhZGQgdGhlIGV4YWN0IHRpbWUgb2YgdGhpcyBldmVudCBzbyB3ZSBjYW4gY2FsY3VsYXRlIGl0cyB0aWNrcyBwb3NpdGlvblxuICBtaWRpRXZlbnQucmVjb3JkTWlsbGlzID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7IC8vIG1pbGxpc1xuICBtaWRpRXZlbnQuc3RhdGUgPSAncmVjb3JkZWQnO1xuXG4gIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgIG5vdGUgPSBjcmVhdGVNaWRpTm90ZShtaWRpRXZlbnQpO1xuICAgIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV0gPSBub3RlO1xuICAgIC8vdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXSA9IG5vdGU7XG4gIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjgpe1xuICAgIG5vdGUgPSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vIGNoZWNrIGlmIHRoZSBub3RlIGV4aXN0czogaWYgdGhlIHVzZXIgcGxheXMgbm90ZXMgb24gaGVyIGtleWJvYXJkIGJlZm9yZSB0aGUgbWlkaSBzeXN0ZW0gaGFzXG4gICAgLy8gYmVlbiBmdWxseSBpbml0aWFsaXplZCwgaXQgY2FuIGhhcHBlbiB0aGF0IHRoZSBmaXJzdCBpbmNvbWluZyBtaWRpIGV2ZW50IGlzIGEgTk9URSBPRkYgZXZlbnRcbiAgICBpZihub3RlID09PSB1bmRlZmluZWQpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KTtcbiAgICBkZWxldGUgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvL2RlbGV0ZSB0cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdO1xuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhzb25nLnByZXJvbGwsIHNvbmcucmVjb3JkaW5nLCB0cmFjay5yZWNvcmRFbmFibGVkKTtcblxuICBpZigoc29uZy5wcmVyb2xsaW5nIHx8IHNvbmcucmVjb3JkaW5nKSAmJiB0cmFjay5yZWNvcmRFbmFibGVkID09PSAnbWlkaScpe1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgICAgdHJhY2suc29uZy5yZWNvcmRlZE5vdGVzLnB1c2gobm90ZSk7XG4gICAgfVxuICAgIHRyYWNrLnJlY29yZFBhcnQuYWRkRXZlbnQobWlkaUV2ZW50KTtcbiAgICAvLyBzb25nLnJlY29yZGVkRXZlbnRzIGlzIHVzZWQgaW4gdGhlIGtleSBlZGl0b3JcbiAgICB0cmFjay5zb25nLnJlY29yZGVkRXZlbnRzLnB1c2gobWlkaUV2ZW50KTtcbiAgfWVsc2UgaWYodHJhY2suZW5hYmxlUmV0cm9zcGVjdGl2ZVJlY29yZGluZyl7XG4gICAgdHJhY2sucmV0cm9zcGVjdGl2ZVJlY29yZGluZy5wdXNoKG1pZGlFdmVudCk7XG4gIH1cblxuICAvLyBjYWxsIGFsbCBtaWRpIGV2ZW50IGxpc3RlbmVyc1xuICBsaXN0ZW5lcnMgPSB0cmFjay5taWRpRXZlbnRMaXN0ZW5lcnNbbWlkaUV2ZW50LnR5cGVdO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgb2JqZWN0Rm9yRWFjaChsaXN0ZW5lcnMsIGZ1bmN0aW9uKGxpc3RlbmVyKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhbm5lbCA9IHRyYWNrLmNoYW5uZWw7XG4gIGlmKGNoYW5uZWwgPT09ICdhbnknIHx8IGNoYW5uZWwgPT09IHVuZGVmaW5lZCB8fCBpc05hTihjaGFubmVsKSA9PT0gdHJ1ZSl7XG4gICAgY2hhbm5lbCA9IDA7XG4gIH1cblxuICBvYmplY3RGb3JFYWNoKHRyYWNrLm1pZGlPdXRwdXRzLCBmdW5jdGlvbihvdXRwdXQpe1xuICAgIC8vY29uc29sZS5sb2coJ21pZGkgb3V0Jywgb3V0cHV0LCBtaWRpRXZlbnQudHlwZSk7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTQ0IHx8IG1pZGlFdmVudC50eXBlID09PSAxNzYpe1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTIpO1xuICAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICAgIC8vIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxOTIpe1xuICAgIC8vICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTFdKTtcbiAgICB9XG4gICAgLy9vdXRwdXQuc2VuZChbbWlkaUV2ZW50LnN0YXR1cyArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gIH0pO1xuXG4gIC8vIEBUT0RPOiBtYXliZSBhIHRyYWNrIHNob3VsZCBiZSBhYmxlIHRvIHNlbmQgaXRzIGV2ZW50IHRvIGJvdGggYSBtaWRpLW91dCBwb3J0IGFuZCBhbiBpbnRlcm5hbCBoZWFydGJlYXQgc29uZz9cbiAgLy9jb25zb2xlLmxvZyh0cmFjay5yb3V0ZVRvTWlkaU91dCk7XG4gIGlmKHRyYWNrLnJvdXRlVG9NaWRpT3V0ID09PSBmYWxzZSl7XG4gICAgbWlkaUV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgdHJhY2suaW5zdHJ1bWVudC5wcm9jZXNzRXZlbnQobWlkaUV2ZW50KTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGFkZE1pZGlFdmVudExpc3RlbmVyKC4uLmFyZ3MpeyAvLyBjYWxsZXIgY2FuIGJlIGEgdHJhY2sgb3IgYSBzb25nXG5cbiAgbGV0IGlkID0gbWlkaUV2ZW50TGlzdGVuZXJJZCsrO1xuICBsZXQgbGlzdGVuZXI7XG4gICAgdHlwZXMgPSB7fSxcbiAgICBpZHMgPSBbXSxcbiAgICBsb29wO1xuXG5cbiAgLy8gc2hvdWxkIEkgaW5saW5lIHRoaXM/XG4gIGxvb3AgPSBmdW5jdGlvbihhcmdzKXtcbiAgICBmb3IobGV0IGFyZyBvZiBhcmdzKXtcbiAgICAgIGxldCB0eXBlID0gdHlwZVN0cmluZyhhcmcpO1xuICAgICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICAgIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICBsb29wKGFyZyk7XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgbGlzdGVuZXIgPSBhcmc7XG4gICAgICB9ZWxzZSBpZihpc05hTihhcmcpID09PSBmYWxzZSl7XG4gICAgICAgIGFyZyA9IHBhcnNlSW50KGFyZywgMTApO1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICBhcmcgPSBzZXF1ZW5jZXIubWlkaUV2ZW50TnVtYmVyQnlOYW1lKGFyZyk7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBsb29wKGFyZ3MsIDAsIGFyZ3MubGVuZ3RoKTtcbiAgLy9jb25zb2xlLmxvZygndHlwZXMnLCB0eXBlcywgJ2xpc3RlbmVyJywgbGlzdGVuZXIpO1xuXG4gIG9iamVjdEZvckVhY2godHlwZXMsIGZ1bmN0aW9uKHR5cGUpe1xuICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgaWYob2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPSB7fTtcbiAgICB9XG4gICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF0gPSBsaXN0ZW5lcjtcbiAgICBpZHMucHVzaCh0eXBlICsgJ18nICsgaWQpO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKG9iai5taWRpRXZlbnRMaXN0ZW5lcnMpO1xuICByZXR1cm4gaWRzLmxlbmd0aCA9PT0gMSA/IGlkc1swXSA6IGlkcztcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcihpZCwgb2JqKXtcbiAgdmFyIHR5cGU7XG4gIGlkID0gaWQuc3BsaXQoJ18nKTtcbiAgdHlwZSA9IGlkWzBdO1xuICBpZCA9IGlkWzFdO1xuICBkZWxldGUgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF07XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXJzKCl7XG5cbn1cblxuKi9cbiIsImltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5cbmV4cG9ydCBjbGFzcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICAgIHRoaXMub3V0cHV0ID0gbnVsbFxuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG4gIGNvbm5lY3Qob3V0cHV0KXtcbiAgICB0aGlzLm91dHB1dCA9IG91dHB1dFxuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG4gIGRpc2Nvbm5lY3QoKXtcbiAgICB0aGlzLm91dHB1dCA9IG51bGxcbiAgfVxuXG4gIC8vIG1hbmRhdG9yeVxuICBwcm9jZXNzTUlESUV2ZW50KGV2ZW50LCB0aW1lID0gMCl7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudCwgdGltZSlcbiAgICBsZXQgc2FtcGxlXG5cbiAgICBpZihpc05hTih0aW1lKSl7XG4gICAgICAvLyB0aGlzIHNob3VsZG4ndCBoYXBwZW5cbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2ludmFsaWQgdGltZSB2YWx1ZScpXG4gICAgICByZXR1cm5cbiAgICAgIC8vdGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVcbiAgICB9XG5cbiAgICAvLyB0aGlzIGlzIGFuIGV2ZW50IHRoYXQgaXMgc2VuZCBmcm9tIGFuIGV4dGVybmFsIE1JREkga2V5Ym9hcmRcbiAgICBpZih0aW1lID09PSAwKXtcbiAgICAgIHRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gICAgfVxuXG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIC8vY29uc29sZS5sb2coMTQ0LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcblxuICAgICAgc2FtcGxlID0gdGhpcy5jcmVhdGVTYW1wbGUoZXZlbnQpXG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIHNhbXBsZSlcbiAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlKVxuICAgICAgc2FtcGxlLm91dHB1dC5jb25uZWN0KHRoaXMub3V0cHV0KVxuICAgICAgc2FtcGxlLnN0YXJ0KHRpbWUpXG4gICAgICAvL2NvbnNvbGUubG9nKCdzY2hlZHVsaW5nJywgZXZlbnQuaWQsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAvL2NvbnNvbGUubG9nKCdzdGFydCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vY29uc29sZS5sb2coMTI4LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcbiAgICAgIHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5nZXQoZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIGlmKHR5cGVvZiBzYW1wbGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy9jb25zb2xlLmluZm8oJ3NhbXBsZSBub3QgZm91bmQgZm9yIGV2ZW50JywgZXZlbnQuaWQsICcgbWlkaU5vdGUnLCBldmVudC5taWRpTm90ZUlkLCBldmVudClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIHdlIGRvbid0IHdhbnQgdGhhdCB0aGUgc3VzdGFpbiBwZWRhbCBwcmV2ZW50cyB0aGUgYW4gZXZlbnQgdG8gdW5zY2hlZHVsZWRcbiAgICAgIGlmKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLnB1c2goZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIH1lbHNle1xuICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ3N0b3AnLCB0aW1lLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5kZWxldGUoZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgfSlcbiAgICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgICAgfVxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAvLyBzdXN0YWluIHBlZGFsXG4gICAgICBpZihldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICBpZihldmVudC5kYXRhMiA9PT0gMTI3KXtcbiAgICAgICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSB0cnVlXG4gICAgICAgICAgLy8vKlxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbCcsXG4gICAgICAgICAgICBkYXRhOiAnZG93bidcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vKi9cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIGRvd24nKVxuICAgICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMCl7XG4gICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMuZm9yRWFjaCgobWlkaU5vdGVJZCkgPT4ge1xuICAgICAgICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmdldChtaWRpTm90ZUlkKVxuICAgICAgICAgICAgaWYoc2FtcGxlKXtcbiAgICAgICAgICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgICAgICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIG1pZGlOb3RlSWQpXG4gICAgICAgICAgICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmRlbGV0ZShtaWRpTm90ZUlkKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc3VzdGFpbiBwZWRhbCB1cCcsIHRoaXMuc3VzdGFpbmVkU2FtcGxlcylcbiAgICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXVxuICAgICAgICAgIC8vLypcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgICAgZGF0YTogJ3VwJ1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8qL1xuICAgICAgICAgIC8vdGhpcy5zdG9wU3VzdGFpbih0aW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBwYW5uaW5nXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gMTApe1xuICAgICAgICAvLyBwYW5uaW5nIGlzICpub3QqIGV4YWN0bHkgdGltZWQgLT4gbm90IHBvc3NpYmxlICh5ZXQpIHdpdGggV2ViQXVkaW9cbiAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhMiwgcmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcbiAgICAgICAgLy90cmFjay5zZXRQYW5uaW5nKHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG5cbiAgICAgIC8vIHZvbHVtZVxuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTEgPT09IDcpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG1hbmRhdG9yeVxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgaWYodGhpcy5zdXN0YWluUGVkYWxEb3duID09PSB0cnVlKXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgZGF0YTogJ3VwJ1xuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcblxuICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5mb3JFYWNoKHNhbXBsZSA9PiB7XG4gICAgICBzYW1wbGUuc3RvcChjb250ZXh0LmN1cnJlbnRUaW1lKVxuICAgIH0pXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmNsZWFyKClcbiAgfVxuXG4gIC8vIG1hbmRhdG9yeVxuICB1bnNjaGVkdWxlKG1pZGlFdmVudCl7XG4gICAgbGV0IHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5nZXQobWlkaUV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgaWYoc2FtcGxlKXtcbiAgICAgIHNhbXBsZS5zdG9wKGNvbnRleHQuY3VycmVudFRpbWUpXG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZGVsZXRlKG1pZGlFdmVudC5taWRpTm90ZUlkKVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHtUcmFja30gZnJvbSAnLi90cmFjaydcbmltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtwYXJzZUV2ZW50cywgcGFyc2VNSURJTm90ZXN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7Y2hlY2tNSURJTnVtYmVyfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2NhbGN1bGF0ZVBvc2l0aW9ufSBmcm9tICcuL3Bvc2l0aW9uJ1xuaW1wb3J0IHtTYW1wbGVyfSBmcm9tICcuL3NhbXBsZXInXG5pbXBvcnQge2dldEluaXREYXRhfSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge01JRElFdmVudFR5cGVzfSBmcm9tICcuL2NvbnN0YW50cydcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuXG5cbmxldFxuICBtZXRob2RNYXAgPSBuZXcgTWFwKFtcbiAgICBbJ3ZvbHVtZScsICdzZXRWb2x1bWUnXSxcbiAgICBbJ2luc3RydW1lbnQnLCAnc2V0SW5zdHJ1bWVudCddLFxuICAgIFsnbm90ZU51bWJlckFjY2VudGVkVGljaycsICdzZXROb3RlTnVtYmVyQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2snXSxcbiAgICBbJ3ZlbG9jaXR5QWNjZW50ZWRUaWNrJywgJ3NldFZlbG9jaXR5QWNjZW50ZWRUaWNrJ10sXG4gICAgWyd2ZWxvY2l0eU5vbkFjY2VudGVkVGljaycsICdzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljayddLFxuICAgIFsnbm90ZUxlbmd0aEFjY2VudGVkVGljaycsICdzZXROb3RlTGVuZ3RoQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snXVxuICBdKTtcblxuZXhwb3J0IGNsYXNzIE1ldHJvbm9tZXtcblxuICBjb25zdHJ1Y3Rvcihzb25nKXtcbiAgICB0aGlzLnNvbmcgPSBzb25nXG4gICAgdGhpcy50cmFjayA9IG5ldyBUcmFjayh0aGlzLnNvbmcuaWQgKyAnX21ldHJvbm9tZScpXG4gICAgdGhpcy5wYXJ0ID0gbmV3IFBhcnQoKVxuICAgIHRoaXMudHJhY2suYWRkUGFydHModGhpcy5wYXJ0KVxuICAgIHRoaXMudHJhY2suY29ubmVjdCh0aGlzLnNvbmcuX291dHB1dClcblxuICAgIHRoaXMuZXZlbnRzID0gW11cbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gW11cbiAgICB0aGlzLnByZWNvdW50RHVyYXRpb24gPSAwXG4gICAgdGhpcy5iYXJzID0gMFxuICAgIHRoaXMuaW5kZXggPSAwXG4gICAgdGhpcy5pbmRleDIgPSAwXG4gICAgdGhpcy5wcmVjb3VudEluZGV4ID0gMFxuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG5cbiAgcmVzZXQoKXtcblxuICAgIGxldCBkYXRhID0gZ2V0SW5pdERhdGEoKVxuICAgIGxldCBpbnN0cnVtZW50ID0gbmV3IFNhbXBsZXIoJ21ldHJvbm9tZScpXG4gICAgaW5zdHJ1bWVudC51cGRhdGVTYW1wbGVEYXRhKHtcbiAgICAgIG5vdGU6IDYwLFxuICAgICAgYnVmZmVyOiBkYXRhLmxvd3RpY2ssXG4gICAgfSwge1xuICAgICAgbm90ZTogNjEsXG4gICAgICBidWZmZXI6IGRhdGEuaGlnaHRpY2ssXG4gICAgfSlcbiAgICB0aGlzLnRyYWNrLnNldEluc3RydW1lbnQoaW5zdHJ1bWVudClcblxuICAgIHRoaXMudm9sdW1lID0gMVxuXG4gICAgdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgPSA2MVxuICAgIHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkID0gNjBcblxuICAgIHRoaXMudmVsb2NpdHlBY2NlbnRlZCA9IDEwMFxuICAgIHRoaXMudmVsb2NpdHlOb25BY2NlbnRlZCA9IDEwMFxuXG4gICAgdGhpcy5ub3RlTGVuZ3RoQWNjZW50ZWQgPSB0aGlzLnNvbmcucHBxIC8gNCAvLyBzaXh0ZWVudGggbm90ZXMgLT4gZG9uJ3QgbWFrZSB0aGlzIHRvbyBzaG9ydCBpZiB5b3VyIHNhbXBsZSBoYXMgYSBsb25nIGF0dGFjayFcbiAgICB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZCA9IHRoaXMuc29uZy5wcHEgLyA0XG4gIH1cblxuICBjcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgaWQgPSAnaW5pdCcpe1xuICAgIGxldCBpLCBqXG4gICAgbGV0IHBvc2l0aW9uXG4gICAgbGV0IHZlbG9jaXR5XG4gICAgbGV0IG5vdGVMZW5ndGhcbiAgICBsZXQgbm90ZU51bWJlclxuICAgIGxldCBiZWF0c1BlckJhclxuICAgIGxldCB0aWNrc1BlckJlYXRcbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IG5vdGVPbiwgbm90ZU9mZlxuICAgIGxldCBldmVudHMgPSBbXVxuXG4gICAgLy9jb25zb2xlLmxvZyhzdGFydEJhciwgZW5kQmFyKTtcblxuICAgIGZvcihpID0gc3RhcnRCYXI7IGkgPD0gZW5kQmFyOyBpKyspe1xuICAgICAgcG9zaXRpb24gPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLnNvbmcsIHtcbiAgICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAgIHRhcmdldDogW2ldLFxuICAgICAgfSlcblxuICAgICAgYmVhdHNQZXJCYXIgPSBwb3NpdGlvbi5ub21pbmF0b3JcbiAgICAgIHRpY2tzUGVyQmVhdCA9IHBvc2l0aW9uLnRpY2tzUGVyQmVhdFxuICAgICAgdGlja3MgPSBwb3NpdGlvbi50aWNrc1xuXG4gICAgICBmb3IoaiA9IDA7IGogPCBiZWF0c1BlckJhcjsgaisrKXtcblxuICAgICAgICBub3RlTnVtYmVyID0gaiA9PT0gMCA/IHRoaXMubm90ZU51bWJlckFjY2VudGVkIDogdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWRcbiAgICAgICAgbm90ZUxlbmd0aCA9IGogPT09IDAgPyB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA6IHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkXG4gICAgICAgIHZlbG9jaXR5ID0gaiA9PT0gMCA/IHRoaXMudmVsb2NpdHlBY2NlbnRlZCA6IHRoaXMudmVsb2NpdHlOb25BY2NlbnRlZFxuXG4gICAgICAgIG5vdGVPbiA9IG5ldyBNSURJRXZlbnQodGlja3MsIDE0NCwgbm90ZU51bWJlciwgdmVsb2NpdHkpXG4gICAgICAgIG5vdGVPZmYgPSBuZXcgTUlESUV2ZW50KHRpY2tzICsgbm90ZUxlbmd0aCwgMTI4LCBub3RlTnVtYmVyLCAwKVxuXG4gICAgICAgIGlmKGlkID09PSAncHJlY291bnQnKXtcbiAgICAgICAgICBub3RlT24uX3RyYWNrID0gdGhpcy50cmFja1xuICAgICAgICAgIG5vdGVPZmYuX3RyYWNrID0gdGhpcy50cmFja1xuICAgICAgICAgIG5vdGVPbi5fcGFydCA9IHt9XG4gICAgICAgICAgbm90ZU9mZi5fcGFydCA9IHt9XG4gICAgICAgIH1cblxuICAgICAgICBldmVudHMucHVzaChub3RlT24sIG5vdGVPZmYpXG4gICAgICAgIHRpY2tzICs9IHRpY2tzUGVyQmVhdFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldmVudHNcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKHN0YXJ0QmFyID0gMSwgZW5kQmFyID0gdGhpcy5zb25nLmJhcnMsIGlkID0gJ2luaXQnKXtcbiAgICB0aGlzLnBhcnQucmVtb3ZlRXZlbnRzKHRoaXMucGFydC5nZXRFdmVudHMoKSlcbiAgICB0aGlzLmV2ZW50cyA9IHRoaXMuY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIGlkKVxuICAgIHRoaXMucGFydC5hZGRFdmVudHMoLi4udGhpcy5ldmVudHMpXG4gICAgdGhpcy5iYXJzID0gdGhpcy5zb25nLmJhcnNcbiAgICAvL2NvbnNvbGUubG9nKCdnZXRFdmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICB0aGlzLmFsbEV2ZW50cyA9IFsuLi50aGlzLmV2ZW50cywgLi4udGhpcy5zb25nLl90aW1lRXZlbnRzXVxuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuYWxsRXZlbnRzKVxuICAgIHNvcnRFdmVudHModGhpcy5hbGxFdmVudHMpXG4gICAgcGFyc2VNSURJTm90ZXModGhpcy5ldmVudHMpXG4gICAgcmV0dXJuIHRoaXMuZXZlbnRzXG4gIH1cblxuXG4gIHNldEluZGV4MihtaWxsaXMpe1xuICAgIHRoaXMuaW5kZXgyID0gMFxuICB9XG5cbiAgZ2V0RXZlbnRzMihtYXh0aW1lLCB0aW1lU3RhbXApe1xuICAgIGxldCByZXN1bHQgPSBbXVxuXG4gICAgZm9yKGxldCBpID0gdGhpcy5pbmRleDIsIG1heGkgPSB0aGlzLmFsbEV2ZW50cy5sZW5ndGg7IGkgPCBtYXhpOyBpKyspe1xuXG4gICAgICBsZXQgZXZlbnQgPSB0aGlzLmFsbEV2ZW50c1tpXVxuXG4gICAgICBpZihldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5URU1QTyB8fCBldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSl7XG4gICAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIHRoaXMubWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2tcbiAgICAgICAgICB0aGlzLmluZGV4MisrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cblxuICAgICAgfWVsc2V7XG4gICAgICAgIGxldCBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGlja1xuICAgICAgICBpZihtaWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZVN0YW1wXG4gICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgICAgICAgdGhpcy5pbmRleDIrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG5cbiAgYWRkRXZlbnRzKHN0YXJ0QmFyID0gMSwgZW5kQmFyID0gdGhpcy5zb25nLmJhcnMsIGlkID0gJ2FkZCcpe1xuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0QmFyLCBlbmRCYXIpXG4gICAgbGV0IGV2ZW50cyA9IHRoaXMuY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIGlkKVxuICAgIHRoaXMuZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIHRoaXMucGFydC5hZGRFdmVudHMoLi4uZXZlbnRzKVxuICAgIHRoaXMuYmFycyA9IGVuZEJhclxuICAgIC8vY29uc29sZS5sb2coJ2dldEV2ZW50cyAlTycsIHRoaXMuZXZlbnRzLCBlbmRCYXIpXG4gICAgcmV0dXJuIGV2ZW50c1xuICB9XG5cblxuICBjcmVhdGVQcmVjb3VudEV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCB0aW1lU3RhbXApe1xuXG4gICAgdGhpcy50aW1lU3RhbXAgPSB0aW1lU3RhbXBcblxuLy8gICBsZXQgc29uZ1N0YXJ0UG9zaXRpb24gPSB0aGlzLnNvbmcuZ2V0UG9zaXRpb24oKVxuXG4gICAgbGV0IHNvbmdTdGFydFBvc2l0aW9uID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcy5zb25nLCB7XG4gICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgIHRhcmdldDogW3N0YXJ0QmFyXSxcbiAgICAgIHJlc3VsdDogJ21pbGxpcycsXG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKCdzdGFyQmFyJywgc29uZ1N0YXJ0UG9zaXRpb24uYmFyKVxuXG4gICAgbGV0IGVuZFBvcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAvL3RhcmdldDogW3NvbmdTdGFydFBvc2l0aW9uLmJhciArIHByZWNvdW50LCBzb25nU3RhcnRQb3NpdGlvbi5iZWF0LCBzb25nU3RhcnRQb3NpdGlvbi5zaXh0ZWVudGgsIHNvbmdTdGFydFBvc2l0aW9uLnRpY2tdLFxuICAgICAgdGFyZ2V0OiBbZW5kQmFyXSxcbiAgICAgIHJlc3VsdDogJ21pbGxpcycsXG4gICAgfSlcblxuICAgIC8vY29uc29sZS5sb2coc29uZ1N0YXJ0UG9zaXRpb24sIGVuZFBvcylcblxuICAgIHRoaXMucHJlY291bnRJbmRleCA9IDBcbiAgICB0aGlzLnN0YXJ0TWlsbGlzID0gc29uZ1N0YXJ0UG9zaXRpb24ubWlsbGlzXG4gICAgdGhpcy5lbmRNaWxsaXMgPSBlbmRQb3MubWlsbGlzXG4gICAgdGhpcy5wcmVjb3VudER1cmF0aW9uID0gZW5kUG9zLm1pbGxpcyAtIHRoaXMuc3RhcnRNaWxsaXNcblxuICAgIC8vIGRvIHRoaXMgc28geW91IGNhbiBzdGFydCBwcmVjb3VudGluZyBhdCBhbnkgcG9zaXRpb24gaW4gdGhlIHNvbmdcbiAgICB0aGlzLnRpbWVTdGFtcCAtPSB0aGlzLnN0YXJ0TWlsbGlzXG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMucHJlY291bnREdXJhdGlvbiwgdGhpcy5zdGFydE1pbGxpcywgdGhpcy5lbmRNaWxsaXMpXG5cbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciAtIDEsICdwcmVjb3VudCcpO1xuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSBwYXJzZUV2ZW50cyhbLi4udGhpcy5zb25nLl90aW1lRXZlbnRzLCAuLi50aGlzLnByZWNvdW50RXZlbnRzXSlcblxuICAgIC8vY29uc29sZS5sb2coc29uZ1N0YXJ0UG9zaXRpb24uYmFyLCBlbmRQb3MuYmFyLCBwcmVjb3VudCwgdGhpcy5wcmVjb3VudEV2ZW50cy5sZW5ndGgpO1xuICAgIC8vY29uc29sZS5sb2codGhpcy5wcmVjb3VudEV2ZW50cy5sZW5ndGgsIHRoaXMucHJlY291bnREdXJhdGlvbik7XG4gICAgcmV0dXJuIHRoaXMucHJlY291bnREdXJhdGlvblxuICB9XG5cblxuICBzZXRQcmVjb3VudEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvcihsZXQgZXZlbnQgb2YgdGhpcy5ldmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgICAgIHRoaXMucHJlY291bnRJbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyh0aGlzLnByZWNvdW50SW5kZXgpXG4gIH1cblxuXG4gIC8vIGNhbGxlZCBieSBzY2hlZHVsZXIuanNcbiAgZ2V0UHJlY291bnRFdmVudHMobWF4dGltZSl7XG4gICAgbGV0IGV2ZW50cyA9IHRoaXMucHJlY291bnRFdmVudHMsXG4gICAgICBtYXhpID0gZXZlbnRzLmxlbmd0aCwgaSwgZXZ0LFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgICAvL21heHRpbWUgKz0gdGhpcy5wcmVjb3VudER1cmF0aW9uXG5cbiAgICBmb3IoaSA9IHRoaXMucHJlY291bnRJbmRleDsgaSA8IG1heGk7IGkrKyl7XG4gICAgICBldnQgPSBldmVudHNbaV07XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgbWF4dGltZSwgdGhpcy5taWxsaXMpO1xuICAgICAgaWYoZXZ0Lm1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICBldnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZ0Lm1pbGxpc1xuICAgICAgICByZXN1bHQucHVzaChldnQpXG4gICAgICAgIHRoaXMucHJlY291bnRJbmRleCsrXG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2cocmVzdWx0Lmxlbmd0aCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG5cbiAgbXV0ZShmbGFnKXtcbiAgICB0aGlzLnRyYWNrLm11dGVkID0gZmxhZ1xuICB9XG5cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMudHJhY2suX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICB9XG5cblxuICAvLyA9PT09PT09PT09PSBDT05GSUdVUkFUSU9OID09PT09PT09PT09XG5cbiAgdXBkYXRlQ29uZmlnKCl7XG4gICAgdGhpcy5pbml0KDEsIHRoaXMuYmFycywgJ3VwZGF0ZScpXG4gICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgdGhpcy5zb25nLnVwZGF0ZSgpXG4gIH1cblxuICAvLyBhZGRlZCB0byBwdWJsaWMgQVBJOiBTb25nLmNvbmZpZ3VyZU1ldHJvbm9tZSh7fSlcbiAgY29uZmlndXJlKGNvbmZpZyl7XG5cbiAgICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgIHRoaXNbbWV0aG9kTWFwLmdldChrZXkpXShjb25maWcua2V5KTtcbiAgICB9LCB0aGlzKTtcblxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldEluc3RydW1lbnQoaW5zdHJ1bWVudCl7XG4gICAgaWYoIWluc3RydW1lbnQgaW5zdGFuY2VvZiBJbnN0cnVtZW50KXtcbiAgICAgIGNvbnNvbGUud2Fybignbm90IGFuIGluc3RhbmNlIG9mIEluc3RydW1lbnQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMudHJhY2suc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVMZW5ndGhBY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMubm90ZUxlbmd0aEFjY2VudGVkID0gdmFsdWU7XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgaWYoaXNOYU4odmFsdWUpKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWZWxvY2l0eUFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0VmVsb2NpdHlOb25BY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWb2x1bWUodmFsdWUpe1xuICAgIHRoaXMudHJhY2suc2V0Vm9sdW1lKHZhbHVlKTtcbiAgfVxufVxuXG4iLCIvLyBAIGZsb3dcbmltcG9ydCB7Z2V0Tm90ZURhdGF9IGZyb20gJy4vbm90ZSdcblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBNSURJRXZlbnR7XG5cbiAgY29uc3RydWN0b3IodGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyID0gLTEpe1xuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLnRpY2tzID0gdGlja3NcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5kYXRhMSA9IGRhdGExXG4gICAgdGhpcy5kYXRhMiA9IGRhdGEyXG5cbiAgICAvLyBzb21ldGltZXMgTk9URV9PRkYgZXZlbnRzIGFyZSBzZW50IGFzIE5PVEVfT04gZXZlbnRzIHdpdGggYSAwIHZlbG9jaXR5IHZhbHVlXG4gICAgaWYodHlwZSA9PT0gMTQ0ICYmIGRhdGEyID09PSAwKXtcbiAgICAgIHRoaXMudHlwZSA9IDEyOFxuICAgIH1cblxuICAgIHRoaXMuX3BhcnQgPSBudWxsXG4gICAgdGhpcy5fdHJhY2sgPSBudWxsXG4gICAgdGhpcy5fc29uZyA9IG51bGxcblxuICAgIGlmKHR5cGUgPT09IDE0NCB8fCB0eXBlID09PSAxMjgpe1xuICAgICAgKHtcbiAgICAgICAgbmFtZTogdGhpcy5ub3RlTmFtZSxcbiAgICAgICAgZnVsbE5hbWU6IHRoaXMuZnVsbE5vdGVOYW1lLFxuICAgICAgICBmcmVxdWVuY3k6IHRoaXMuZnJlcXVlbmN5LFxuICAgICAgICBvY3RhdmU6IHRoaXMub2N0YXZlXG4gICAgICB9ID0gZ2V0Tm90ZURhdGEoe251bWJlcjogZGF0YTF9KSlcbiAgICB9XG4gICAgLy9AVE9ETzogYWRkIGFsbCBvdGhlciBwcm9wZXJ0aWVzXG4gIH1cblxuICBjb3B5KCl7XG4gICAgbGV0IG0gPSBuZXcgTUlESUV2ZW50KHRoaXMudGlja3MsIHRoaXMudHlwZSwgdGhpcy5kYXRhMSwgdGhpcy5kYXRhMilcbiAgICByZXR1cm4gbVxuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKXsgLy8gbWF5IGJlIGJldHRlciBpZiBub3QgYSBwdWJsaWMgbWV0aG9kP1xuICAgIHRoaXMuZGF0YTEgKz0gYW1vdW50XG4gICAgdGhpcy5mcmVxdWVuY3kgPSA0NDAgKiBNYXRoLnBvdygyLCAodGhpcy5kYXRhMSAtIDY5KSAvIDEyKVxuICB9XG5cbiAgbW92ZSh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLnRpY2tzICs9IHRpY2tzXG4gICAgaWYodGhpcy5taWRpTm90ZSl7XG4gICAgICB0aGlzLm1pZGlOb3RlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMudGlja3MgPSB0aWNrc1xuICAgIGlmKHRoaXMubWlkaU5vdGUpe1xuICAgICAgdGhpcy5taWRpTm90ZS51cGRhdGUoKVxuICAgIH1cbiAgfVxufVxuXG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlTUlESUV2ZW50KGV2ZW50KXtcbiAgLy9ldmVudC5ub3RlID0gbnVsbFxuICBldmVudC5ub3RlID0gbnVsbFxuICBldmVudCA9IG51bGxcbn1cbiovXG4iLCJpbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIE1JRElOb3Rle1xuXG4gIGNvbnN0cnVjdG9yKG5vdGVvbjogTUlESUV2ZW50LCBub3Rlb2ZmOiBNSURJRXZlbnQpe1xuICAgIC8vaWYobm90ZW9uLnR5cGUgIT09IDE0NCB8fCBub3Rlb2ZmLnR5cGUgIT09IDEyOCl7XG4gICAgaWYobm90ZW9uLnR5cGUgIT09IDE0NCl7XG4gICAgICBjb25zb2xlLndhcm4oJ2Nhbm5vdCBjcmVhdGUgTUlESU5vdGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5vdGVPbiA9IG5vdGVvblxuICAgIG5vdGVvbi5taWRpTm90ZSA9IHRoaXNcbiAgICBub3Rlb24ubWlkaU5vdGVJZCA9IHRoaXMuaWRcblxuICAgIGlmKG5vdGVvZmYgaW5zdGFuY2VvZiBNSURJRXZlbnQpe1xuICAgICAgdGhpcy5ub3RlT2ZmID0gbm90ZW9mZlxuICAgICAgbm90ZW9mZi5taWRpTm90ZSA9IHRoaXNcbiAgICAgIG5vdGVvZmYubWlkaU5vdGVJZCA9IHRoaXMuaWRcbiAgICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IG5vdGVvZmYudGlja3MgLSBub3Rlb24udGlja3NcbiAgICAgIHRoaXMuZHVyYXRpb25NaWxsaXMgPSAtMVxuICAgIH1cbiAgfVxuXG4gIGFkZE5vdGVPZmYobm90ZW9mZil7XG4gICAgdGhpcy5ub3RlT2ZmID0gbm90ZW9mZlxuICAgIG5vdGVvZmYubWlkaU5vdGUgPSB0aGlzXG4gICAgbm90ZW9mZi5taWRpTm90ZUlkID0gdGhpcy5pZFxuICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IG5vdGVvZmYudGlja3MgLSB0aGlzLm5vdGVPbi50aWNrc1xuICAgIHRoaXMuZHVyYXRpb25NaWxsaXMgPSAtMVxuICB9XG5cbiAgY29weSgpe1xuICAgIHJldHVybiBuZXcgTUlESU5vdGUodGhpcy5ub3RlT24uY29weSgpLCB0aGlzLm5vdGVPZmYuY29weSgpKVxuICB9XG5cbiAgdXBkYXRlKCl7IC8vIG1heSB1c2UgYW5vdGhlciBuYW1lIGZvciB0aGlzIG1ldGhvZFxuICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IHRoaXMubm90ZU9mZi50aWNrcyAtIHRoaXMubm90ZU9uLnRpY2tzXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLnRyYW5zcG9zZShhbW91bnQpXG4gICAgdGhpcy5ub3RlT2ZmLnRyYW5zcG9zZShhbW91bnQpXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLm1vdmUodGlja3MpXG4gICAgdGhpcy5ub3RlT2ZmLm1vdmUodGlja3MpXG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcik6IHZvaWR7XG4gICAgdGhpcy5ub3RlT24ubW92ZVRvKHRpY2tzKVxuICAgIHRoaXMubm90ZU9mZi5tb3ZlVG8odGlja3MpXG4gIH1cblxuICB1bnJlZ2lzdGVyKCl7XG4gICAgaWYodGhpcy5wYXJ0KXtcbiAgICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMucGFydCA9IG51bGxcbiAgICB9XG4gICAgaWYodGhpcy50cmFjayl7XG4gICAgICB0aGlzLnRyYWNrLnJlbW92ZUV2ZW50cyh0aGlzKVxuICAgICAgdGhpcy50cmFjayA9IG51bGxcbiAgICB9XG4gICAgaWYodGhpcy5zb25nKXtcbiAgICAgIHRoaXMuc29uZy5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMuc29uZyA9IG51bGxcbiAgICB9XG4gIH1cbn1cblxuIiwiLypcbiAgV3JhcHBlciBmb3IgYWNjZXNzaW5nIGJ5dGVzIHRocm91Z2ggc2VxdWVudGlhbCByZWFkc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuICBhZGFwdGVkIHRvIHdvcmsgd2l0aCBBcnJheUJ1ZmZlciAtPiBVaW50OEFycmF5XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgZmNjID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUlESVN0cmVhbXtcblxuICAvLyBidWZmZXIgaXMgVWludDhBcnJheVxuICBjb25zdHJ1Y3RvcihidWZmZXIpe1xuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgLyogcmVhZCBzdHJpbmcgb3IgYW55IG51bWJlciBvZiBieXRlcyAqL1xuICByZWFkKGxlbmd0aCwgdG9TdHJpbmcgPSB0cnVlKSB7XG4gICAgbGV0IHJlc3VsdDtcblxuICAgIGlmKHRvU3RyaW5nKXtcbiAgICAgIHJlc3VsdCA9ICcnO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQgKz0gZmNjKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfWVsc2V7XG4gICAgICByZXN1bHQgPSBbXTtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAzMi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MzIoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCAyNCkgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXSA8PCAxNikgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAyXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgM11cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gNDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMTYtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDE2KCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYW4gOC1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50OChzaWduZWQpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl07XG4gICAgaWYoc2lnbmVkICYmIHJlc3VsdCA+IDEyNyl7XG4gICAgICByZXN1bHQgLT0gMjU2O1xuICAgIH1cbiAgICB0aGlzLnBvc2l0aW9uICs9IDE7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGVvZigpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbiA+PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICAvKiByZWFkIGEgTUlESS1zdHlsZSBsZXRpYWJsZS1sZW5ndGggaW50ZWdlclxuICAgIChiaWctZW5kaWFuIHZhbHVlIGluIGdyb3VwcyBvZiA3IGJpdHMsXG4gICAgd2l0aCB0b3AgYml0IHNldCB0byBzaWduaWZ5IHRoYXQgYW5vdGhlciBieXRlIGZvbGxvd3MpXG4gICovXG4gIHJlYWRWYXJJbnQoKSB7XG4gICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgbGV0IGIgPSB0aGlzLnJlYWRJbnQ4KCk7XG4gICAgICBpZiAoYiAmIDB4ODApIHtcbiAgICAgICAgcmVzdWx0ICs9IChiICYgMHg3Zik7XG4gICAgICAgIHJlc3VsdCA8PD0gNztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGIgaXMgdGhlIGxhc3QgYnl0ZSAqL1xuICAgICAgICByZXR1cm4gcmVzdWx0ICsgYjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNldCgpe1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgc2V0UG9zaXRpb24ocCl7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHA7XG4gIH1cbn1cbiIsIi8qXG4gIEV4dHJhY3RzIGFsbCBtaWRpIGV2ZW50cyBmcm9tIGEgYmluYXJ5IG1pZGkgZmlsZSwgdXNlcyBtaWRpX3N0cmVhbS5qc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTUlESVN0cmVhbSBmcm9tICcuL21pZGlfc3RyZWFtJztcblxubGV0XG4gIGxhc3RFdmVudFR5cGVCeXRlLFxuICB0cmFja05hbWU7XG5cblxuZnVuY3Rpb24gcmVhZENodW5rKHN0cmVhbSl7XG4gIGxldCBpZCA9IHN0cmVhbS5yZWFkKDQsIHRydWUpO1xuICBsZXQgbGVuZ3RoID0gc3RyZWFtLnJlYWRJbnQzMigpO1xuICAvL2NvbnNvbGUubG9nKGxlbmd0aCk7XG4gIHJldHVybntcbiAgICAnaWQnOiBpZCxcbiAgICAnbGVuZ3RoJzogbGVuZ3RoLFxuICAgICdkYXRhJzogc3RyZWFtLnJlYWQobGVuZ3RoLCBmYWxzZSlcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiByZWFkRXZlbnQoc3RyZWFtKXtcbiAgdmFyIGV2ZW50ID0ge307XG4gIHZhciBsZW5ndGg7XG4gIGV2ZW50LmRlbHRhVGltZSA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gIGxldCBldmVudFR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gIC8vY29uc29sZS5sb2coZXZlbnRUeXBlQnl0ZSwgZXZlbnRUeXBlQnl0ZSAmIDB4ODAsIDE0NiAmIDB4MGYpO1xuICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ZjApID09IDB4ZjApe1xuICAgIC8qIHN5c3RlbSAvIG1ldGEgZXZlbnQgKi9cbiAgICBpZihldmVudFR5cGVCeXRlID09IDB4ZmYpe1xuICAgICAgLyogbWV0YSBldmVudCAqL1xuICAgICAgZXZlbnQudHlwZSA9ICdtZXRhJztcbiAgICAgIGxldCBzdWJ0eXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIHN3aXRjaChzdWJ0eXBlQnl0ZSl7XG4gICAgICAgIGNhc2UgMHgwMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlTnVtYmVyJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2VxdWVuY2VOdW1iZXIgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWJlciA9IHN0cmVhbS5yZWFkSW50MTYoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RleHQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAyOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29weXJpZ2h0Tm90aWNlJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RyYWNrTmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2luc3RydW1lbnROYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2x5cmljcyc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtYXJrZXInO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA3OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY3VlUG9pbnQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDIwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWlkaUNoYW5uZWxQcmVmaXgnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMSl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBtaWRpQ2hhbm5lbFByZWZpeCBldmVudCBpcyAxLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQuY2hhbm5lbCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDJmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnZW5kT2ZUcmFjayc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAwKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGVuZE9mVHJhY2sgZXZlbnQgaXMgMCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDUxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2V0VGVtcG8nO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMyl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXRUZW1wbyBldmVudCBpcyAzLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdCA9IChcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCAxNikgK1xuICAgICAgICAgICAgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDgpICtcbiAgICAgICAgICAgIHN0cmVhbS5yZWFkSW50OCgpXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1NDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NtcHRlT2Zmc2V0JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDUpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc21wdGVPZmZzZXQgZXZlbnQgaXMgNSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBob3VyQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lUmF0ZSA9e1xuICAgICAgICAgICAgMHgwMDogMjQsIDB4MjA6IDI1LCAweDQwOiAyOSwgMHg2MDogMzBcbiAgICAgICAgICB9W2hvdXJCeXRlICYgMHg2MF07XG4gICAgICAgICAgZXZlbnQuaG91ciA9IGhvdXJCeXRlICYgMHgxZjtcbiAgICAgICAgICBldmVudC5taW4gPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zZWMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnN1YmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTg6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0aW1lU2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDQpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgdGltZVNpZ25hdHVyZSBldmVudCBpcyA0LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtZXJhdG9yID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZGVub21pbmF0b3IgPSBNYXRoLnBvdygyLCBzdHJlYW0ucmVhZEludDgoKSk7XG4gICAgICAgICAgZXZlbnQubWV0cm9ub21lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQudGhpcnR5c2Vjb25kcyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU5OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAna2V5U2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Iga2V5U2lnbmF0dXJlIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5rZXkgPSBzdHJlYW0ucmVhZEludDgodHJ1ZSk7XG4gICAgICAgICAgZXZlbnQuc2NhbGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg3ZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlclNwZWNpZmljJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9pZihzZXF1ZW5jZXIuZGVidWcgPj0gMil7XG4gICAgICAgICAgLy8gICAgY29uc29sZS53YXJuKCdVbnJlY29nbmlzZWQgbWV0YSBldmVudCBzdWJ0eXBlOiAnICsgc3VidHlwZUJ5dGUpO1xuICAgICAgICAgIC8vfVxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfVxuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2UgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGYwKXtcbiAgICAgIGV2ZW50LnR5cGUgPSAnc3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmNyl7XG4gICAgICBldmVudC50eXBlID0gJ2RpdmlkZWRTeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZSBieXRlOiAnICsgZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gIH1lbHNle1xuICAgIC8qIGNoYW5uZWwgZXZlbnQgKi9cbiAgICBsZXQgcGFyYW0xO1xuICAgIGlmKChldmVudFR5cGVCeXRlICYgMHg4MCkgPT09IDApe1xuICAgICAgLyogcnVubmluZyBzdGF0dXMgLSByZXVzZSBsYXN0RXZlbnRUeXBlQnl0ZSBhcyB0aGUgZXZlbnQgdHlwZS5cbiAgICAgICAgZXZlbnRUeXBlQnl0ZSBpcyBhY3R1YWxseSB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gICAgICAqL1xuICAgICAgLy9jb25zb2xlLmxvZygncnVubmluZyBzdGF0dXMnKTtcbiAgICAgIHBhcmFtMSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgICBldmVudFR5cGVCeXRlID0gbGFzdEV2ZW50VHlwZUJ5dGU7XG4gICAgfWVsc2V7XG4gICAgICBwYXJhbTEgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2xhc3QnLCBldmVudFR5cGVCeXRlKTtcbiAgICAgIGxhc3RFdmVudFR5cGVCeXRlID0gZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gICAgbGV0IGV2ZW50VHlwZSA9IGV2ZW50VHlwZUJ5dGUgPj4gNDtcbiAgICBldmVudC5jaGFubmVsID0gZXZlbnRUeXBlQnl0ZSAmIDB4MGY7XG4gICAgZXZlbnQudHlwZSA9ICdjaGFubmVsJztcbiAgICBzd2l0Y2ggKGV2ZW50VHlwZSl7XG4gICAgICBjYXNlIDB4MDg6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwOTpcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgaWYoZXZlbnQudmVsb2NpdHkgPT09IDApe1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdub3RlT24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGE6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZUFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC5hbW91bnQgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBiOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvbnRyb2xsZXInO1xuICAgICAgICBldmVudC5jb250cm9sbGVyVHlwZSA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBjOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Byb2dyYW1DaGFuZ2UnO1xuICAgICAgICBldmVudC5wcm9ncmFtTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGQ6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY2hhbm5lbEFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5hbW91bnQgPSBwYXJhbTE7XG4gICAgICAgIC8vaWYodHJhY2tOYW1lID09PSAnU0gtUzEtNDQtQzA5IEw9U01MIElOPTMnKXtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ2NoYW5uZWwgcHJlc3N1cmUnLCB0cmFja05hbWUsIHBhcmFtMSk7XG4gICAgICAgIC8vfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGU6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncGl0Y2hCZW5kJztcbiAgICAgICAgZXZlbnQudmFsdWUgPSBwYXJhbTEgKyAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgNyk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8qXG4gICAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlO1xuICAgICAgICBjb25zb2xlLmxvZygnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZSk7XG4gICAgICAgICovXG5cbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4vKlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgIGNvbnNvbGUubG9nKCd3ZWlyZG8nLCB0cmFja05hbWUsIHBhcmFtMSwgZXZlbnQudmVsb2NpdHkpO1xuKi9cblxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESUZpbGUoYnVmZmVyKXtcbiAgaWYoYnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSA9PT0gZmFsc2UgJiYgYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmVycm9yKCdidWZmZXIgc2hvdWxkIGJlIGFuIGluc3RhbmNlIG9mIFVpbnQ4QXJyYXkgb2YgQXJyYXlCdWZmZXInKVxuICAgIHJldHVyblxuICB9XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gIH1cbiAgbGV0IHRyYWNrcyA9IG5ldyBNYXAoKTtcbiAgbGV0IHN0cmVhbSA9IG5ldyBNSURJU3RyZWFtKGJ1ZmZlcik7XG5cbiAgbGV0IGhlYWRlckNodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gIGlmKGhlYWRlckNodW5rLmlkICE9PSAnTVRoZCcgfHwgaGVhZGVyQ2h1bmsubGVuZ3RoICE9PSA2KXtcbiAgICB0aHJvdyAnQmFkIC5taWQgZmlsZSAtIGhlYWRlciBub3QgZm91bmQnO1xuICB9XG5cbiAgbGV0IGhlYWRlclN0cmVhbSA9IG5ldyBNSURJU3RyZWFtKGhlYWRlckNodW5rLmRhdGEpO1xuICBsZXQgZm9ybWF0VHlwZSA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgbGV0IHRyYWNrQ291bnQgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0aW1lRGl2aXNpb24gPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG5cbiAgaWYodGltZURpdmlzaW9uICYgMHg4MDAwKXtcbiAgICB0aHJvdyAnRXhwcmVzc2luZyB0aW1lIGRpdmlzaW9uIGluIFNNVFBFIGZyYW1lcyBpcyBub3Qgc3VwcG9ydGVkIHlldCc7XG4gIH1cblxuICBsZXQgaGVhZGVyID17XG4gICAgJ2Zvcm1hdFR5cGUnOiBmb3JtYXRUeXBlLFxuICAgICd0cmFja0NvdW50JzogdHJhY2tDb3VudCxcbiAgICAndGlja3NQZXJCZWF0JzogdGltZURpdmlzaW9uXG4gIH07XG5cbiAgZm9yKGxldCBpID0gMDsgaSA8IHRyYWNrQ291bnQ7IGkrKyl7XG4gICAgdHJhY2tOYW1lID0gJ3RyYWNrXycgKyBpO1xuICAgIGxldCB0cmFjayA9IFtdO1xuICAgIGxldCB0cmFja0NodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gICAgaWYodHJhY2tDaHVuay5pZCAhPT0gJ01UcmsnKXtcbiAgICAgIHRocm93ICdVbmV4cGVjdGVkIGNodW5rIC0gZXhwZWN0ZWQgTVRyaywgZ290ICcrIHRyYWNrQ2h1bmsuaWQ7XG4gICAgfVxuICAgIGxldCB0cmFja1N0cmVhbSA9IG5ldyBNSURJU3RyZWFtKHRyYWNrQ2h1bmsuZGF0YSk7XG4gICAgd2hpbGUoIXRyYWNrU3RyZWFtLmVvZigpKXtcbiAgICAgIGxldCBldmVudCA9IHJlYWRFdmVudCh0cmFja1N0cmVhbSk7XG4gICAgICB0cmFjay5wdXNoKGV2ZW50KTtcbiAgICB9XG4gICAgdHJhY2tzLnNldCh0cmFja05hbWUsIHRyYWNrKTtcbiAgfVxuXG4gIHJldHVybntcbiAgICAnaGVhZGVyJzogaGVhZGVyLFxuICAgICd0cmFja3MnOiB0cmFja3NcbiAgfTtcbn0iLCJpbXBvcnQge25vdGVOYW1lTW9kZSwgcGl0Y2h9IGZyb20gJy4vc2V0dGluZ3MnXG5cbmNvbnN0IHBvdyA9IE1hdGgucG93XG5jb25zdCBmbG9vciA9IE1hdGguZmxvb3Jcbi8vY29uc3QgY2hlY2tOb3RlTmFtZSA9IC9eW0EtR117MX0oYnswLDJ9fXwjezAsMn0pW1xcLV17MCwxfVswLTldezF9JC9cbmNvbnN0IHJlZ2V4Q2hlY2tOb3RlTmFtZSA9IC9eW0EtR117MX0oYnxiYnwjfCMjKXswLDF9JC9cbmNvbnN0IHJlZ2V4Q2hlY2tGdWxsTm90ZU5hbWUgPSAvXltBLUddezF9KGJ8YmJ8I3wjIyl7MCwxfShcXC0xfFswLTldezF9KSQvXG5jb25zdCByZWdleFNwbGl0RnVsbE5hbWUgPSAvXihbQS1HXXsxfShifGJifCN8IyMpezAsMX0pKFxcLTF8WzAtOV17MX0pJC9cbmNvbnN0IHJlZ2V4R2V0T2N0YXZlID0gLyhcXC0xfFswLTldezF9KSQvXG5cbmNvbnN0IG5vdGVOYW1lcyA9IHtcbiAgc2hhcnA6IFsnQycsICdDIycsICdEJywgJ0QjJywgJ0UnLCAnRicsICdGIycsICdHJywgJ0cjJywgJ0EnLCAnQSMnLCAnQiddLFxuICBmbGF0OiBbJ0MnLCAnRGInLCAnRCcsICdFYicsICdFJywgJ0YnLCAnR2InLCAnRycsICdBYicsICdBJywgJ0JiJywgJ0InXSxcbiAgJ2VuaGFybW9uaWMtc2hhcnAnOiBbJ0IjJywgJ0MjJywgJ0MjIycsICdEIycsICdEIyMnLCAnRSMnLCAnRiMnLCAnRiMjJywgJ0cjJywgJ0cjIycsICdBIycsICdBIyMnXSxcbiAgJ2VuaGFybW9uaWMtZmxhdCc6IFsnRGJiJywgJ0RiJywgJ0ViYicsICdFYicsICdGYicsICdHYmInLCAnR2InLCAnQWJiJywgJ0FiJywgJ0JiYicsICdCYicsICdDYiddXG59XG5cblxuLypcbiAgc2V0dGluZ3MgPSB7XG4gICAgbmFtZTogJ0MnLFxuICAgIG9jdGF2ZTogNCxcbiAgICBmdWxsTmFtZTogJ0M0JyxcbiAgICBudW1iZXI6IDYwLFxuICAgIGZyZXF1ZW5jeTogMjM0LjE2IC8vIG5vdCB5ZXQgaW1wbGVtZW50ZWRcbiAgfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlRGF0YShzZXR0aW5ncyl7XG4gIGxldCB7XG4gICAgZnVsbE5hbWUsXG4gICAgbmFtZSxcbiAgICBvY3RhdmUsXG4gICAgbW9kZSxcbiAgICBudW1iZXIsXG4gICAgZnJlcXVlbmN5LFxuICB9ID0gc2V0dGluZ3NcblxuICBpZihcbiAgICAgICB0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZydcbiAgICAmJiB0eXBlb2YgZnVsbE5hbWUgIT09ICdzdHJpbmcnXG4gICAgJiYgdHlwZW9mIG51bWJlciAhPT0gJ251bWJlcidcbiAgICAmJiB0eXBlb2YgZnJlcXVlbmN5ICE9PSAnbnVtYmVyJyl7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmKG51bWJlciA8IDAgfHwgbnVtYmVyID4gMTI3KXtcbiAgICBjb25zb2xlLmxvZygncGxlYXNlIHByb3ZpZGUgYSBub3RlIGJldHdlZW4gMCAoQy0xKSBhbmQgMTI3IChHOSknKVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBtb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpXG4gIC8vY29uc29sZS5sb2cobW9kZSlcblxuICBpZih0eXBlb2YgbnVtYmVyID09PSAnbnVtYmVyJyl7XG4gICAgKHtcbiAgICAgIGZ1bGxOYW1lLFxuICAgICAgbmFtZSxcbiAgICAgIG9jdGF2ZVxuICAgIH0gPSBfZ2V0Tm90ZU5hbWUobnVtYmVyLCBtb2RlKSlcblxuICB9ZWxzZSBpZih0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpe1xuXG4gICAgaWYocmVnZXhDaGVja05vdGVOYW1lLnRlc3QobmFtZSkpe1xuICAgICAgZnVsbE5hbWUgPSBgJHtuYW1lfSR7b2N0YXZlfWBcbiAgICAgIG51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSlcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUubG9nKGBpbnZhbGlkIG5hbWUgJHtuYW1lfWApXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICB9ZWxzZSBpZih0eXBlb2YgZnVsbE5hbWUgPT09ICdzdHJpbmcnKXtcblxuICAgIGlmKHJlZ2V4Q2hlY2tGdWxsTm90ZU5hbWUudGVzdChmdWxsTmFtZSkpe1xuICAgICAgKHtcbiAgICAgICAgb2N0YXZlLFxuICAgICAgICBuYW1lLFxuICAgICAgIH0gPSBfc3BsaXRGdWxsTmFtZShmdWxsTmFtZSkpXG4gICAgICBudW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpXG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmxvZyhgaW52YWxpZCBmdWxsbmFtZSAke2Z1bGxOYW1lfWApXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIGxldCBkYXRhID0ge1xuICAgIG5hbWUsXG4gICAgb2N0YXZlLFxuICAgIGZ1bGxOYW1lLFxuICAgIG51bWJlcixcbiAgICBmcmVxdWVuY3k6IF9nZXRGcmVxdWVuY3kobnVtYmVyKSxcbiAgICBibGFja0tleTogX2lzQmxhY2tLZXkobnVtYmVyKSxcbiAgfVxuICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gIHJldHVybiBkYXRhXG59XG5cblxuZnVuY3Rpb24gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSA9IG5vdGVOYW1lTW9kZSkge1xuICAvL2xldCBvY3RhdmUgPSBNYXRoLmZsb29yKChudW1iZXIgLyAxMikgLSAyKSwgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBvY3RhdmUgPSBmbG9vcigobnVtYmVyIC8gMTIpIC0gMSlcbiAgbGV0IG5hbWUgPSBub3RlTmFtZXNbbW9kZV1bbnVtYmVyICUgMTJdXG4gIHJldHVybiB7XG4gICAgZnVsbE5hbWU6IGAke25hbWV9JHtvY3RhdmV9YCxcbiAgICBuYW1lLFxuICAgIG9jdGF2ZSxcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIF9nZXRPY3RhdmUoZnVsbE5hbWUpe1xuICByZXR1cm4gcGFyc2VJbnQoZnVsbE5hbWUubWF0Y2gocmVnZXhHZXRPY3RhdmUpWzBdLCAxMClcbn1cblxuXG5mdW5jdGlvbiBfc3BsaXRGdWxsTmFtZShmdWxsTmFtZSl7XG4gIGxldCBvY3RhdmUgPSBfZ2V0T2N0YXZlKGZ1bGxOYW1lKVxuICByZXR1cm57XG4gICAgb2N0YXZlLFxuICAgIG5hbWU6IGZ1bGxOYW1lLnJlcGxhY2Uob2N0YXZlLCAnJylcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSkge1xuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcylcbiAgbGV0IGluZGV4XG5cbiAgZm9yKGxldCBrZXkgb2Yga2V5cyl7XG4gICAgbGV0IG1vZGUgPSBub3RlTmFtZXNba2V5XVxuICAgIGluZGV4ID0gbW9kZS5maW5kSW5kZXgoeCA9PiB4ID09PSBuYW1lKVxuICAgIGlmKGluZGV4ICE9PSAtMSl7XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIC8vbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKSArIDEyIC8vIOKGkiBpbiBDdWJhc2UgY2VudHJhbCBDID0gQzMgaW5zdGVhZCBvZiBDNFxuICBsZXQgbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKS8vIOKGkiBtaWRpIHN0YW5kYXJkICsgc2NpZW50aWZpYyBuYW1pbmcsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NaWRkbGVfQyBhbmQgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TY2llbnRpZmljX3BpdGNoX25vdGF0aW9uXG5cbiAgaWYobnVtYmVyIDwgMCB8fCBudW1iZXIgPiAxMjcpe1xuICAgIGNvbnNvbGUubG9nKCdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgYmV0d2VlbiAwIChDLTEpIGFuZCAxMjcgKEc5KScpXG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgcmV0dXJuIG51bWJlclxufVxuXG5cbmZ1bmN0aW9uIF9nZXRGcmVxdWVuY3kobnVtYmVyKXtcbiAgcmV0dXJuIHBpdGNoICogcG93KDIsIChudW1iZXIgLSA2OSkgLyAxMikgLy8gbWlkaSBzdGFuZGFyZCwgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01JRElfVHVuaW5nX1N0YW5kYXJkXG59XG5cblxuLy9AVE9ETzogY2FsY3VsYXRlIG5vdGUgZnJvbSBmcmVxdWVuY3lcbmZ1bmN0aW9uIF9nZXRQaXRjaChoZXJ0eil7XG4gIC8vZm0gID0gIDIobeKIkjY5KS8xMig0NDAgSHopLlxufVxuXG5cbmZ1bmN0aW9uIF9jaGVja05vdGVOYW1lTW9kZShtb2RlKXtcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpXG4gIGxldCByZXN1bHQgPSBrZXlzLmluY2x1ZGVzKG1vZGUpXG4gIC8vY29uc29sZS5sb2cocmVzdWx0KVxuICBpZihyZXN1bHQgPT09IGZhbHNlKXtcbiAgICBpZih0eXBlb2YgbW9kZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgY29uc29sZS5sb2coYCR7bW9kZX0gaXMgbm90IGEgdmFsaWQgbm90ZSBuYW1lIG1vZGUsIHVzaW5nIFwiJHtub3RlTmFtZU1vZGV9XCIgaW5zdGVhZGApXG4gICAgfVxuICAgIG1vZGUgPSBub3RlTmFtZU1vZGVcbiAgfVxuICByZXR1cm4gbW9kZVxufVxuXG5cbmZ1bmN0aW9uIF9pc0JsYWNrS2V5KG5vdGVOdW1iZXIpe1xuICBsZXQgYmxhY2tcblxuICBzd2l0Y2godHJ1ZSl7XG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDE6Ly9DI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAzOi8vRCNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gNjovL0YjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDg6Ly9HI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxMDovL0EjXG4gICAgICBibGFjayA9IHRydWVcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBibGFjayA9IGZhbHNlXG4gIH1cblxuICByZXR1cm4gYmxhY2tcbn1cbiIsImltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge3R5cGVTdHJpbmcsIGNoZWNrSWZCYXNlNjQsIGJhc2U2NFRvQmluYXJ5fSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcblxuXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU2FtcGxlKHNhbXBsZSwgaWQsIGV2ZXJ5KXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIHRyeXtcbiAgICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSxcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MoYnVmZmVyKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBidWZmZXIpO1xuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWQsIGJ1ZmZlcn0pXG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KHtpZCwgYnVmZmVyfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoYnVmZmVyKTtcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25FcnJvcigpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEgW0lEOiAke2lkfV1gKTtcbiAgICAgICAgICAvL3JlamVjdChlKTsgLy8gZG9uJ3QgdXNlIHJlamVjdCBiZWNhdXNlIHdlIHVzZSB0aGlzIGFzIGEgbmVzdGVkIHByb21pc2UgYW5kIHdlIGRvbid0IHdhbnQgdGhlIHBhcmVudCBwcm9taXNlIHRvIHJlamVjdFxuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgfWNhdGNoKGUpe1xuICAgICAgY29uc29sZS53YXJuKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSlcbiAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZXNvbHZlKHtpZH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5cbmZ1bmN0aW9uIGxvYWRBbmRQYXJzZVNhbXBsZSh1cmwsIGlkLCBldmVyeSl7XG4gIC8vY29uc29sZS5sb2coaWQsIHVybClcbiAgLypcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAnbG9hZGluZycsXG4gICAgICBkYXRhOiB1cmxcbiAgICB9KVxuICB9LCAwKVxuICAqL1xuICBkaXNwYXRjaEV2ZW50KHtcbiAgICB0eXBlOiAnbG9hZGluZycsXG4gICAgZGF0YTogdXJsXG4gIH0pXG5cbiAgbGV0IGV4ZWN1dG9yID0gZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgLy8gY29uc29sZS5sb2codXJsKVxuICAgIGZldGNoKHVybCwge1xuICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgIH0pLnRoZW4oXG4gICAgICBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGlmKHJlc3BvbnNlLm9rKXtcbiAgICAgICAgICByZXNwb25zZS5hcnJheUJ1ZmZlcigpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBkYXRhKVxuICAgICAgICAgICAgZGVjb2RlU2FtcGxlKGRhdGEsIGlkLCBldmVyeSkudGhlbihyZXNvbHZlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNlIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApXG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKVxufVxuXG5cbmZ1bmN0aW9uIGdldFByb21pc2VzKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpe1xuXG4gIGNvbnN0IGdldFNhbXBsZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYoa2V5ICE9PSAncmVsZWFzZScgJiYga2V5ICE9PSAnaW5mbycgJiYga2V5ICE9PSAnc3VzdGFpbicpe1xuICAgICAgLy9jb25zb2xlLmxvZyhrZXkpXG4gICAgICBpZihzYW1wbGUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgICAgIHByb21pc2VzLnB1c2goZGVjb2RlU2FtcGxlKHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSkpXG4gICAgICB9ZWxzZSBpZih0eXBlb2Ygc2FtcGxlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlmKGNoZWNrSWZCYXNlNjQoc2FtcGxlKSl7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChkZWNvZGVTYW1wbGUoYmFzZTY0VG9CaW5hcnkoc2FtcGxlKSwga2V5LCBiYXNlVXJsLCBldmVyeSkpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIC8vY29uc29sZS5sb2coYmFzZVVybCArIHNhbXBsZSlcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRBbmRQYXJzZVNhbXBsZShiYXNlVXJsICsgZXNjYXBlKHNhbXBsZSksIGtleSwgZXZlcnkpKVxuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZih0eXBlb2Ygc2FtcGxlID09PSAnb2JqZWN0Jyl7XG4gICAgICAgIHNhbXBsZSA9IHNhbXBsZS5zYW1wbGUgfHwgc2FtcGxlLmJ1ZmZlciB8fCBzYW1wbGUuYmFzZTY0IHx8IHNhbXBsZS51cmxcbiAgICAgICAgZ2V0U2FtcGxlKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpXG4gICAgICAgIC8vY29uc29sZS5sb2coa2V5LCBzYW1wbGUpXG4gICAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlLCBwcm9taXNlcy5sZW5ndGgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0U2FtcGxlKClcbn1cblxuXG4vLyBvbmx5IGZvciBpbnRlcm5hbGx5IHVzZSBpbiBxYW1iaVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2FtcGxlczIobWFwcGluZywgZXZlcnkgPSBmYWxzZSl7XG4gIGxldCB0eXBlID0gdHlwZVN0cmluZyhtYXBwaW5nKSxcbiAgICBwcm9taXNlcyA9IFtdLFxuICAgIGJhc2VVcmwgPSAnJ1xuXG4gIGlmKHR5cGVvZiBtYXBwaW5nLmJhc2VVcmwgPT09ICdzdHJpbmcnKXtcbiAgICBiYXNlVXJsID0gbWFwcGluZy5iYXNlVXJsXG4gICAgZGVsZXRlIG1hcHBpbmcuYmFzZVVybFxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhtYXBwaW5nLCBiYXNlVXJsKVxuXG4gIGV2ZXJ5ID0gdHlwZW9mIGV2ZXJ5ID09PSAnZnVuY3Rpb24nID8gZXZlcnkgOiBmYWxzZVxuICAvL2NvbnNvbGUubG9nKHR5cGUsIG1hcHBpbmcpXG4gIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICBPYmplY3Qua2V5cyhtYXBwaW5nKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAvLyBpZihpc05hTihrZXkpID09PSBmYWxzZSl7XG4gICAgICAvLyAgIGtleSA9IHBhcnNlSW50KGtleSwgMTApXG4gICAgICAvLyB9XG4gICAgICBsZXQgYSA9IG1hcHBpbmdba2V5XVxuICAgICAgLy9jb25zb2xlLmxvZyhrZXksIGEsIHR5cGVTdHJpbmcoYSkpXG4gICAgICBpZih0eXBlU3RyaW5nKGEpID09PSAnYXJyYXknKXtcbiAgICAgICAgYS5mb3JFYWNoKG1hcCA9PiB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhtYXApXG4gICAgICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIG1hcCwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgYSwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICAgIH1cbiAgICB9KVxuICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICBsZXQga2V5XG4gICAgbWFwcGluZy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSl7XG4gICAgICAvLyBrZXkgaXMgZGVsaWJlcmF0ZWx5IHVuZGVmaW5lZFxuICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIC50aGVuKCh2YWx1ZXMpID0+IHtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSwgdmFsdWVzKVxuICAgICAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgICAgICBtYXBwaW5nID0ge31cbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIC8vIHN1cHBvcnQgZm9yIG11bHRpIGxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgICAgICBsZXQgbWFwID0gbWFwcGluZ1t2YWx1ZS5pZF1cbiAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcobWFwKVxuICAgICAgICAgIGlmKHR5cGUgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICAgICAgICBtYXAucHVzaCh2YWx1ZS5idWZmZXIpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgbWFwcGluZ1t2YWx1ZS5pZF0gPSBbbWFwLCB2YWx1ZS5idWZmZXJdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IHZhbHVlLmJ1ZmZlclxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtYXBwaW5nKVxuICAgICAgICByZXNvbHZlKG1hcHBpbmcpXG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2FtcGxlcyguLi5kYXRhKXtcbiAgaWYoZGF0YS5sZW5ndGggPT09IDEgJiYgdHlwZVN0cmluZyhkYXRhWzBdKSAhPT0gJ3N0cmluZycpe1xuICAgIC8vY29uc29sZS5sb2coZGF0YVswXSlcbiAgICByZXR1cm4gcGFyc2VTYW1wbGVzMihkYXRhWzBdKVxuICB9XG4gIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGEpXG59XG4iLCJpbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtNSURJTm90ZX0gZnJvbSAnLi9taWRpX25vdGUnO1xuXG5sZXRcbiAgcHBxLFxuICBicG0sXG4gIGZhY3RvcixcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcbiAgcGxheWJhY2tTcGVlZCxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcbiAgdGlja3MsXG4gIG1pbGxpcyxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIGRpZmZUaWNrc1xuICAvL3ByZXZpb3VzRXZlbnRcblxuZnVuY3Rpb24gc2V0VGlja0R1cmF0aW9uKCl7XG4gIHNlY29uZHNQZXJUaWNrID0gKDEgLyBwbGF5YmFja1NwZWVkICogNjApIC8gYnBtIC8gcHBxO1xuICBtaWxsaXNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2sgKiAxMDAwO1xuICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssIGJwbSwgcHBxLCBwbGF5YmFja1NwZWVkLCAocHBxICogbWlsbGlzUGVyVGljaykpO1xuICAvL2NvbnNvbGUubG9nKHBwcSk7XG59XG5cblxuZnVuY3Rpb24gc2V0VGlja3NQZXJCZWF0KCl7XG4gIGZhY3RvciA9ICg0IC8gZGVub21pbmF0b3IpO1xuICBudW1TaXh0ZWVudGggPSBmYWN0b3IgKiA0O1xuICB0aWNrc1BlckJlYXQgPSBwcHEgKiBmYWN0b3I7XG4gIHRpY2tzUGVyQmFyID0gdGlja3NQZXJCZWF0ICogbm9taW5hdG9yO1xuICB0aWNrc1BlclNpeHRlZW50aCA9IHBwcSAvIDQ7XG4gIC8vY29uc29sZS5sb2coZGVub21pbmF0b3IsIGZhY3RvciwgbnVtU2l4dGVlbnRoLCB0aWNrc1BlckJlYXQsIHRpY2tzUGVyQmFyLCB0aWNrc1BlclNpeHRlZW50aCk7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlUG9zaXRpb24oZXZlbnQsIGZhc3QgPSBmYWxzZSl7XG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIC8vIGlmKGRpZmZUaWNrcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGRpZmZUaWNrcywgZXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudHlwZSlcbiAgLy8gfVxuICB0aWNrICs9IGRpZmZUaWNrcztcbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgLy9wcmV2aW91c0V2ZW50ID0gZXZlbnRcbiAgLy9jb25zb2xlLmxvZyhkaWZmVGlja3MsIG1pbGxpc1BlclRpY2spO1xuICBtaWxsaXMgKz0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcblxuICBpZihmYXN0ID09PSBmYWxzZSl7XG4gICAgd2hpbGUodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgICBzaXh0ZWVudGgrKztcbiAgICAgIHRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgICBiZWF0Kys7XG4gICAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICAgIGJlYXQgLT0gbm9taW5hdG9yO1xuICAgICAgICAgIGJhcisrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGltZUV2ZW50cyhzZXR0aW5ncywgdGltZUV2ZW50cywgaXNQbGF5aW5nID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZSB0aW1lIGV2ZW50cycpXG4gIGxldCB0eXBlO1xuICBsZXQgZXZlbnQ7XG5cbiAgcHBxID0gc2V0dGluZ3MucHBxO1xuICBicG0gPSBzZXR0aW5ncy5icG07XG4gIG5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcjtcbiAgcGxheWJhY2tTcGVlZCA9IHNldHRpbmdzLnBsYXliYWNrU3BlZWQ7XG4gIGJhciA9IDE7XG4gIGJlYXQgPSAxO1xuICBzaXh0ZWVudGggPSAxO1xuICB0aWNrID0gMDtcbiAgdGlja3MgPSAwO1xuICBtaWxsaXMgPSAwO1xuXG4gIHNldFRpY2tEdXJhdGlvbigpO1xuICBzZXRUaWNrc1BlckJlYXQoKTtcblxuICB0aW1lRXZlbnRzLnNvcnQoKGEsIGIpID0+IChhLnRpY2tzIDw9IGIudGlja3MpID8gLTEgOiAxKTtcbiAgbGV0IGUgPSAwO1xuICBmb3IoZXZlbnQgb2YgdGltZUV2ZW50cyl7XG4gICAgLy9jb25zb2xlLmxvZyhlKyssIGV2ZW50LnRpY2tzLCBldmVudC50eXBlKVxuICAgIC8vZXZlbnQuc29uZyA9IHNvbmc7XG4gICAgdHlwZSA9IGV2ZW50LnR5cGU7XG4gICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG5cbiAgICBzd2l0Y2godHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgc2V0VGlja3NQZXJCZWF0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvL3RpbWUgZGF0YSBvZiB0aW1lIGV2ZW50IGlzIHZhbGlkIGZyb20gKGFuZCBpbmNsdWRlZCkgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aW1lIGV2ZW50XG4gICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXJzQXNTdHJpbmcpO1xuICB9XG5cbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xuICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgLy9jb25zb2xlLmxvZyh0aW1lRXZlbnRzKTtcbn1cblxuXG4vL2V4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhzb25nLCBldmVudHMpe1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKGV2ZW50cywgaXNQbGF5aW5nID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIGxldCBldmVudDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG4gIGxldCByZXN1bHQgPSBbXVxuXG4gIHRpY2sgPSAwXG4gIHRpY2tzID0gMFxuICBkaWZmVGlja3MgPSAwXG5cbiAgLy9sZXQgZXZlbnRzID0gW10uY29uY2F0KGV2dHMsIHNvbmcuX3RpbWVFdmVudHMpO1xuICBsZXQgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcblxuICAvLyBub3Rlb2ZmIGNvbWVzIGJlZm9yZSBub3Rlb25cblxuLypcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEuc29ydEluZGV4IC0gYi5zb3J0SW5kZXg7XG4gIH0pXG4qL1xuXG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgLy8gaWYoYS50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gLTFcbiAgICAgIC8vIH1lbHNlIGlmKGIudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vICAgcmV0dXJuIDFcbiAgICAgIC8vIH1cbiAgICAgIC8vIHNob3J0OlxuICAgICAgbGV0IHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgIHIgPSAtMVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJcbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4gIH0pXG4gIGV2ZW50ID0gZXZlbnRzWzBdXG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG5cblxuICBicG0gPSBldmVudC5icG07XG4gIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcblxuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG5cbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cblxuICBmb3IobGV0IGkgPSBzdGFydEV2ZW50OyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuXG4gICAgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcbiAgICAgICAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gICAgICAgIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljayxldmVudC5taWxsaXNQZXJUaWNrKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgICAgICAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICAgICAgICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobm9taW5hdG9yLG51bVNpeHRlZW50aCx0aWNrc1BlclNpeHRlZW50aCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuXG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAvL2Nhc2UgMTI4OlxuICAgICAgLy9jYXNlIDE0NDpcblxuICAgICAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcbiAgICAgICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4vKlxuICAgICAgICBldmVudC5taWxsaXMgPSBtaWxsaXNcbiovXG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuXG5cblxuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJhcilcblxuICAgICAgICAvLyBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhldmVudC5kYXRhMiwgZXZlbnQuYmFyc0FzU3RyaW5nKVxuICAgICAgICAvLyB9XG5cbiAgICB9XG5cblxuICAgIC8vIGlmKGkgPCAxMDAgJiYgKGV2ZW50LnR5cGUgPT09IDgxIHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpKXtcbiAgICAvLyAgIC8vY29uc29sZS5sb2coaSwgdGlja3MsIGRpZmZUaWNrcywgbWlsbGlzLCBtaWxsaXNQZXJUaWNrKVxuICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQubWlsbGlzLCAnbm90ZScsIGV2ZW50LmRhdGExLCAndmVsbycsIGV2ZW50LmRhdGEyKVxuICAgIC8vIH1cblxuICAgIGxhc3RFdmVudFRpY2sgPSBldmVudC50aWNrcztcbiAgfVxuICBwYXJzZU1JRElOb3RlcyhyZXN1bHQpXG4gIHJldHVybiByZXN1bHRcbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGV2ZW50LCBmYXN0ID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKGJhciwgYmVhdCwgdGlja3MpXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuXG4gIGV2ZW50LnRpY2tzID0gdGlja3M7XG5cbiAgZXZlbnQubWlsbGlzID0gbWlsbGlzO1xuICBldmVudC5zZWNvbmRzID0gbWlsbGlzIC8gMTAwMDtcblxuICBpZihmYXN0KXtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGV2ZW50LmJhciA9IGJhcjtcbiAgZXZlbnQuYmVhdCA9IGJlYXQ7XG4gIGV2ZW50LnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgZXZlbnQudGljayA9IHRpY2s7XG4gIC8vZXZlbnQuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2s7XG4gIHZhciB0aWNrQXNTdHJpbmcgPSB0aWNrID09PSAwID8gJzAwMCcgOiB0aWNrIDwgMTAgPyAnMDAnICsgdGljayA6IHRpY2sgPCAxMDAgPyAnMCcgKyB0aWNrIDogdGljaztcbiAgZXZlbnQuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIHRpY2tBc1N0cmluZztcbiAgZXZlbnQuYmFyc0FzQXJyYXkgPSBbYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tdO1xuXG5cbiAgdmFyIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcblxuICBldmVudC5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgZXZlbnQubWludXRlID0gdGltZURhdGEubWludXRlO1xuICBldmVudC5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gIGV2ZW50Lm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gIGV2ZW50LnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgZXZlbnQudGltZUFzQXJyYXkgPSB0aW1lRGF0YS50aW1lQXNBcnJheTtcblxuICAvLyBpZihtaWxsaXMgPCAwKXtcbiAgLy8gICBjb25zb2xlLmxvZyhldmVudClcbiAgLy8gfVxuXG5cbn1cblxuXG5sZXQgbWlkaU5vdGVJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESU5vdGVzKGV2ZW50cyl7XG4gIGxldCBub3RlcyA9IHt9XG4gIGxldCBub3Rlc0luVHJhY2tcbiAgbGV0IG4gPSAwXG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgaWYodHlwZW9mIGV2ZW50Ll9wYXJ0ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZXZlbnQuX3RyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBjb25zb2xlLmxvZygnbm8gcGFydCBhbmQvb3IgdHJhY2sgc2V0JywgZXZlbnQpXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdID0ge31cbiAgICAgIH1cbiAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudFxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdXG4gICAgICBpZih0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIGNvcnJlc3BvbmRpbmcgbm90ZW9uIGV2ZW50IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbGV0IG5vdGVPbiA9IG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV1cbiAgICAgIGxldCBub3RlT2ZmID0gZXZlbnRcbiAgICAgIGlmKHR5cGVvZiBub3RlT24gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy9jb25zb2xlLmluZm8obisrLCAnbm8gbm90ZW9uIGV2ZW50IGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlID0gbmV3IE1JRElOb3RlKG5vdGVPbiwgbm90ZU9mZilcbiAgICAgIG5vdGUuX3RyYWNrID0gbm90ZU9uLl90cmFja1xuICAgICAgbm90ZSA9IG51bGxcbiAgICAgIC8vIGxldCBpZCA9IGBNTl8ke21pZGlOb3RlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgICAvLyBub3RlT24ubWlkaU5vdGVJZCA9IGlkXG4gICAgICAvLyBub3RlT24ub2ZmID0gbm90ZU9mZi5pZFxuICAgICAgLy8gbm90ZU9mZi5taWRpTm90ZUlkID0gaWRcbiAgICAgIC8vIG5vdGVPZmYub24gPSBub3RlT24uaWRcbiAgICAgIGRlbGV0ZSBub3Rlc1tldmVudC5fdHJhY2suaWRdW2V2ZW50LmRhdGExXVxuICAgIH1cbiAgfVxuICBPYmplY3Qua2V5cyhub3RlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGRlbGV0ZSBub3Rlc1trZXldXG4gIH0pXG4gIG5vdGVzID0ge31cbiAgLy9jb25zb2xlLmxvZyhub3Rlcywgbm90ZXNJblRyYWNrKVxufVxuXG5cbi8vIG5vdCBpbiB1c2UhXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyRXZlbnRzKGV2ZW50cyl7XG4gIGxldCBzdXN0YWluID0ge31cbiAgbGV0IHRtcFJlc3VsdCA9IHt9XG4gIGxldCByZXN1bHQgPSBbXVxuICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTc2ICYmIGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICBpZihldmVudC5kYXRhMiA9PT0gMCl7XG4gICAgICAgIGlmKHR5cGVvZiBzdXN0YWluW2V2ZW50LnRyYWNrSWRdID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfWVsc2UgaWYoc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gZXZlbnQudGlja3Mpe1xuICAgICAgICAgIGRlbGV0ZSB0bXBSZXN1bHRbZXZlbnQudGlja3NdXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICB0bXBSZXN1bHRbZXZlbnQudGlja3NdID0gZXZlbnRcbiAgICAgICAgZGVsZXRlIHN1c3RhaW5bZXZlbnQudHJhY2tJZF1cbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICBzdXN0YWluW2V2ZW50LnRyYWNrSWRdID0gZXZlbnQudGlja3NcbiAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICByZXN1bHQucHVzaChldmVudClcbiAgICB9XG4gIH1cbiAgY29uc29sZS5sb2coc3VzdGFpbilcbiAgT2JqZWN0LmtleXModG1wUmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgbGV0IHN1c3RhaW5FdmVudCA9IHRtcFJlc3VsdFtrZXldXG4gICAgY29uc29sZS5sb2coc3VzdGFpbkV2ZW50KVxuICAgIHJlc3VsdC5wdXNoKHN1c3RhaW5FdmVudClcbiAgfSlcbiAgcmV0dXJuIHJlc3VsdFxufVxuIiwiLy8gQCBmbG93XG5cbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFBhcnR7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gbnVsbCl7XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgdGhpcy5pZFxuICAgIHRoaXMubXV0ZWQgPSBmYWxzZVxuICAgIHRoaXMuX3RyYWNrID0gbnVsbFxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG4gICAgdGhpcy5fZXZlbnRzID0gW11cbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuICAgIHRoaXMuX3N0YXJ0ID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gICAgdGhpcy5fZW5kID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gIH1cblxuICBjb3B5KCl7XG4gICAgbGV0IHAgPSBuZXcgUGFydCh0aGlzLm5hbWUgKyAnX2NvcHknKSAvLyBpbXBsZW1lbnQgZ2V0TmFtZU9mQ29weSgpIGluIHV0aWwgKHNlZSBoZWFydGJlYXQpXG4gICAgbGV0IGV2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgbGV0IGNvcHkgPSBldmVudC5jb3B5KClcbiAgICAgIGNvbnNvbGUubG9nKGNvcHkpXG4gICAgICBldmVudHMucHVzaChjb3B5KVxuICAgIH0pXG4gICAgcC5hZGRFdmVudHMoLi4uZXZlbnRzKVxuICAgIHAudXBkYXRlKClcbiAgICByZXR1cm4gcFxuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnRyYW5zcG9zZShhbW91bnQpXG4gICAgfSlcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmUodGlja3M6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlVG8odGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIGFkZEV2ZW50cyguLi5ldmVudHMpe1xuICAgIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICAgIGxldCB0cmFjayA9IHRoaXMuX3RyYWNrXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5fcGFydCA9IHRoaXNcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudClcbiAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdHJhY2tcbiAgICAgICAgaWYodHJhY2suX3Nvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gdHJhY2suX3NvbmdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuXG4gICAgaWYodHJhY2spe1xuICAgICAgdHJhY2suX2V2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRyYWNrLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICB9XG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9uZXdFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCh0aGlzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIHJlbW92ZUV2ZW50cyguLi5ldmVudHMpe1xuICAgIGxldCB0cmFjayA9IHRoaXMuX3RyYWNrXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5fcGFydCA9IG51bGxcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICAgICAgaWYodHJhY2spe1xuICAgICAgICBldmVudC5fdHJhY2sgPSBudWxsXG4gICAgICAgIHRyYWNrLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICAgICAgaWYodHJhY2suX3Nvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gbnVsbFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBpZih0cmFjayl7XG4gICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgICB0cmFjay5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgICB9XG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcylcbiAgICB9XG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHModGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKHRoaXMpXG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlRXZlbnRzVG8odGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcylcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKGZpbHRlcjogc3RyaW5nW10gPSBudWxsKXsgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c10gLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgfVxuXG4gIG11dGUoZmxhZzogYm9vbGVhbiA9IG51bGwpe1xuICAgIGlmKGZsYWcpe1xuICAgICAgdGhpcy5tdXRlZCA9IGZsYWdcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMubXV0ZWQgPSAhdGhpcy5tdXRlZFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYodGhpcy5fY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB9XG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIC8vQFRPRE86IGNhbGN1bGF0ZSBwYXJ0IHN0YXJ0IGFuZCBlbmQsIGFuZCBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZVxuICB9XG59XG4iLCJpbXBvcnQge2dldFBvc2l0aW9uMn0gZnJvbSAnLi9wb3NpdGlvbi5qcydcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyLmpzJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwuanMnXG5cbmNvbnN0IHJhbmdlID0gMTAgLy8gbWlsbGlzZWNvbmRzIG9yIHRpY2tzXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFBsYXloZWFke1xuXG4gIGNvbnN0cnVjdG9yKHNvbmcsIHR5cGUgPSAnYWxsJyl7XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMuc29uZyA9IHNvbmdcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5sYXN0RXZlbnQgPSBudWxsXG4gICAgdGhpcy5kYXRhID0ge31cblxuICAgIHRoaXMuYWN0aXZlUGFydHMgPSBbXVxuICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbXVxuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW11cbiAgfVxuXG4gIC8vIHVuaXQgY2FuIGJlICdtaWxsaXMnIG9yICd0aWNrcydcbiAgc2V0KHVuaXQsIHZhbHVlKXtcbiAgICB0aGlzLnVuaXQgPSB1bml0XG4gICAgdGhpcy5jdXJyZW50VmFsdWUgPSB2YWx1ZVxuICAgIHRoaXMuZXZlbnRJbmRleCA9IDBcbiAgICB0aGlzLm5vdGVJbmRleCA9IDBcbiAgICB0aGlzLnBhcnRJbmRleCA9IDBcbiAgICB0aGlzLmNhbGN1bGF0ZSgpXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICBnZXQoKXtcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuXG4gIHVwZGF0ZSh1bml0LCBkaWZmKXtcbiAgICBpZihkaWZmID09PSAwKXtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFcbiAgICB9XG4gICAgdGhpcy51bml0ID0gdW5pdFxuICAgIHRoaXMuY3VycmVudFZhbHVlICs9IGRpZmZcbiAgICB0aGlzLmNhbGN1bGF0ZSgpXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICB1cGRhdGVTb25nKCl7XG4gICAgdGhpcy5ldmVudHMgPSBbLi4udGhpcy5zb25nLl9ldmVudHMsIC4uLnRoaXMuc29uZy5fdGltZUV2ZW50c11cbiAgICBzb3J0RXZlbnRzKHRoaXMuZXZlbnRzKVxuICAgIC8vY29uc29sZS5sb2coJ2V2ZW50cyAlTycsIHRoaXMuZXZlbnRzKVxuICAgIHRoaXMubm90ZXMgPSB0aGlzLnNvbmcuX25vdGVzXG4gICAgdGhpcy5wYXJ0cyA9IHRoaXMuc29uZy5fcGFydHNcbiAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aFxuICAgIHRoaXMubnVtTm90ZXMgPSB0aGlzLm5vdGVzLmxlbmd0aFxuICAgIHRoaXMubnVtUGFydHMgPSB0aGlzLnBhcnRzLmxlbmd0aFxuICAgIHRoaXMuc2V0KCdtaWxsaXMnLCB0aGlzLnNvbmcuX2N1cnJlbnRNaWxsaXMpXG4gIH1cblxuXG4gIGNhbGN1bGF0ZSgpe1xuICAgIGxldCBpXG4gICAgbGV0IHZhbHVlXG4gICAgbGV0IGV2ZW50XG4gICAgbGV0IG5vdGVcbiAgICBsZXQgcGFydFxuICAgIGxldCBwb3NpdGlvblxuICAgIGxldCBzdGlsbEFjdGl2ZU5vdGVzID0gW11cbiAgICBsZXQgc3RpbGxBY3RpdmVQYXJ0cyA9IFtdXG4gICAgbGV0IGNvbGxlY3RlZFBhcnRzID0gbmV3IFNldCgpXG4gICAgbGV0IGNvbGxlY3RlZE5vdGVzID0gbmV3IFNldCgpXG5cbiAgICB0aGlzLmRhdGEgPSB7fVxuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW11cbiAgICBsZXQgc3VzdGFpbnBlZGFsRXZlbnRzID0gW11cblxuICAgIGZvcihpID0gdGhpcy5ldmVudEluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IHRoaXMuZXZlbnRzW2ldXG4gICAgICB2YWx1ZSA9IGV2ZW50W3RoaXMudW5pdF1cbiAgICAgIGlmKHZhbHVlIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgLy8gaWYgdGhlIHBsYXloZWFkIGlzIHNldCB0byBhIHBvc2l0aW9uIG9mIHNheSAzMDAwIG1pbGxpcywgd2UgZG9uJ3Qgd2FudCB0byBhZGQgZXZlbnRzIG1vcmUgdGhhdCAxMCB1bml0cyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgIGlmKHZhbHVlID09PSAwIHx8IHZhbHVlID4gdGhpcy5jdXJyZW50VmFsdWUgLSByYW5nZSl7XG4gICAgICAgICAgdGhpcy5hY3RpdmVFdmVudHMucHVzaChldmVudClcbiAgICAgICAgICAvLyB0aGlzIGRvZXNuJ3Qgd29yayB0b28gd2VsbFxuICAgICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMilcbiAgICAgICAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwyJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBldmVudC5kYXRhMiA9PT0gMTI3ID8gJ2Rvd24nIDogJ3VwJ1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBzdXN0YWlucGVkYWxFdmVudHMucHVzaChldmVudClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAvLyB9ZWxzZXtcbiAgICAgICAgICAvLyAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgIC8vICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICAgIC8vICAgICBkYXRhOiBldmVudFxuICAgICAgICAgIC8vICAgfSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgICBkYXRhOiBldmVudFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0RXZlbnQgPSBldmVudFxuICAgICAgICB0aGlzLmV2ZW50SW5kZXgrK1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIC8vIGxldCBudW0gPSBzdXN0YWlucGVkYWxFdmVudHMubGVuZ3RoXG4gICAgLy8gaWYobnVtID4gMCl7XG4gICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRWYWx1ZSwgbnVtLCBzdXN0YWlucGVkYWxFdmVudHNbbnVtIC0gMV0uZGF0YTIsIHN1c3RhaW5wZWRhbEV2ZW50cylcbiAgICAvLyB9XG5cbiAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgdGhpcy5kYXRhLmFjdGl2ZUV2ZW50cyA9IHRoaXMuYWN0aXZlRXZlbnRzXG5cbiAgICAvLyBpZiBhIHNvbmcgaGFzIG5vIGV2ZW50cyB5ZXQsIHVzZSB0aGUgZmlyc3QgdGltZSBldmVudCBhcyByZWZlcmVuY2VcbiAgICBpZih0aGlzLmxhc3RFdmVudCA9PT0gbnVsbCl7XG4gICAgICB0aGlzLmxhc3RFdmVudCA9IHRoaXMuc29uZy5fdGltZUV2ZW50c1swXVxuICAgIH1cblxuICAgIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24yKHRoaXMuc29uZywgdGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSwgJ2FsbCcsIHRoaXMubGFzdEV2ZW50KVxuICAgIHRoaXMuZGF0YS5ldmVudEluZGV4ID0gdGhpcy5ldmVudEluZGV4XG4gICAgdGhpcy5kYXRhLm1pbGxpcyA9IHBvc2l0aW9uLm1pbGxpc1xuICAgIHRoaXMuZGF0YS50aWNrcyA9IHBvc2l0aW9uLnRpY2tzXG4gICAgdGhpcy5kYXRhLnBvc2l0aW9uID0gcG9zaXRpb25cblxuICAgIGlmKHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpe1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFcbiAgICAgIGZvcihsZXQga2V5IG9mIE9iamVjdC5rZXlzKHBvc2l0aW9uKSl7XG4gICAgICAgIGRhdGFba2V5XSA9IHBvc2l0aW9uW2tleV1cbiAgICAgIH1cbiAgICB9ZWxzZSBpZih0aGlzLnR5cGUuaW5kZXhPZignYmFyc2JlYXRzJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5iYXIgPSBwb3NpdGlvbi5iYXJcbiAgICAgIHRoaXMuZGF0YS5iZWF0ID0gcG9zaXRpb24uYmVhdFxuICAgICAgdGhpcy5kYXRhLnNpeHRlZW50aCA9IHBvc2l0aW9uLnNpeHRlZW50aFxuICAgICAgdGhpcy5kYXRhLnRpY2sgPSBwb3NpdGlvbi50aWNrXG4gICAgICB0aGlzLmRhdGEuYmFyc0FzU3RyaW5nID0gcG9zaXRpb24uYmFyc0FzU3RyaW5nXG5cbiAgICAgIHRoaXMuZGF0YS50aWNrc1BlckJhciA9IHBvc2l0aW9uLnRpY2tzUGVyQmFyXG4gICAgICB0aGlzLmRhdGEudGlja3NQZXJCZWF0ID0gcG9zaXRpb24udGlja3NQZXJCZWF0XG4gICAgICB0aGlzLmRhdGEudGlja3NQZXJTaXh0ZWVudGggPSBwb3NpdGlvbi50aWNrc1BlclNpeHRlZW50aFxuICAgICAgdGhpcy5kYXRhLm51bVNpeHRlZW50aCA9IHBvc2l0aW9uLm51bVNpeHRlZW50aFxuXG4gICAgfWVsc2UgaWYodGhpcy50eXBlLmluZGV4T2YoJ3RpbWUnKSAhPT0gLTEpe1xuICAgICAgdGhpcy5kYXRhLmhvdXIgPSBwb3NpdGlvbi5ob3VyXG4gICAgICB0aGlzLmRhdGEubWludXRlID0gcG9zaXRpb24ubWludXRlXG4gICAgICB0aGlzLmRhdGEuc2Vjb25kID0gcG9zaXRpb24uc2Vjb25kXG4gICAgICB0aGlzLmRhdGEubWlsbGlzZWNvbmQgPSBwb3NpdGlvbi5taWxsaXNlY29uZFxuICAgICAgdGhpcy5kYXRhLnRpbWVBc1N0cmluZyA9IHBvc2l0aW9uLnRpbWVBc1N0cmluZ1xuXG4gICAgfWVsc2UgaWYodGhpcy50eXBlLmluZGV4T2YoJ3BlcmNlbnRhZ2UnKSAhPT0gLTEpe1xuICAgICAgdGhpcy5kYXRhLnBlcmNlbnRhZ2UgPSBwb3NpdGlvbi5wZXJjZW50YWdlXG4gICAgfVxuXG4gICAgLy8gZ2V0IGFjdGl2ZSBub3Rlc1xuICAgIGlmKHRoaXMudHlwZS5pbmRleE9mKCdub3RlcycpICE9PSAtMSB8fCB0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKXtcblxuICAgICAgLy8gZ2V0IGFsbCBub3RlcyBiZXR3ZWVuIHRoZSBub3RlSW5kZXggYW5kIHRoZSBjdXJyZW50IHBsYXloZWFkIHBvc2l0aW9uXG4gICAgICBmb3IoaSA9IHRoaXMubm90ZUluZGV4OyBpIDwgdGhpcy5udW1Ob3RlczsgaSsrKXtcbiAgICAgICAgbm90ZSA9IHRoaXMubm90ZXNbaV1cbiAgICAgICAgdmFsdWUgPSBub3RlLm5vdGVPblt0aGlzLnVuaXRdXG4gICAgICAgIGlmKHZhbHVlIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICB0aGlzLm5vdGVJbmRleCsrXG4gICAgICAgICAgaWYodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGlmIHRoZSBwbGF5aGVhZCBpcyBzZXQgdG8gYSBwb3NpdGlvbiBvZiBzYXkgMzAwMCBtaWxsaXMsIHdlIGRvbid0IHdhbnQgdG8gYWRkIG5vdGVzIGJlZm9yZSB0aGUgcGxheWhlYWRcbiAgICAgICAgICBpZih0aGlzLmN1cnJlbnRWYWx1ZSA9PT0gMCB8fCBub3RlLm5vdGVPZmZbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICAgIGNvbGxlY3RlZE5vdGVzLmFkZChub3RlKVxuICAgICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICAgIHR5cGU6ICdub3RlT24nLFxuICAgICAgICAgICAgICBkYXRhOiBub3RlLm5vdGVPblxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGZpbHRlciBub3RlcyB0aGF0IGFyZSBubyBsb25nZXIgYWN0aXZlXG4gICAgICBmb3IoaSA9IHRoaXMuYWN0aXZlTm90ZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgICBub3RlID0gdGhpcy5hY3RpdmVOb3Rlc1tpXTtcbiAgICAgICAgLy9pZihub3RlLm5vdGVPbi5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9ub3Rlc0J5SWQuZ2V0KG5vdGUuaWQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHRoaXMuc29uZy5fbm90ZXNCeUlkLmdldChub3RlLmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgbm90ZScsIG5vdGUuaWQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnNvbGUud2Fybignbm90ZSB3aXRoIGlkJywgbm90ZS5pZCwgJ2hhcyBubyBub3RlT2ZmIGV2ZW50Jyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkTm90ZXMuaGFzKG5vdGUpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHN0aWxsQWN0aXZlTm90ZXMucHVzaChub3RlKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnbm90ZU9mZicsXG4gICAgICAgICAgICBkYXRhOiBub3RlLm5vdGVPZmZcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGFkZCB0aGUgc3RpbGwgYWN0aXZlIG5vdGVzIGFuZCB0aGUgbmV3bHkgYWN0aXZlIGV2ZW50cyB0byB0aGUgYWN0aXZlIG5vdGVzIGFycmF5XG4gICAgICB0aGlzLmFjdGl2ZU5vdGVzID0gWy4uLmNvbGxlY3RlZE5vdGVzLnZhbHVlcygpLCAuLi5zdGlsbEFjdGl2ZU5vdGVzXVxuICAgICAgdGhpcy5kYXRhLmFjdGl2ZU5vdGVzID0gdGhpcy5hY3RpdmVOb3Rlc1xuICAgIH1cblxuXG4gICAgLy8gZ2V0IGFjdGl2ZSBwYXJ0c1xuICAgIGlmKHRoaXMudHlwZS5pbmRleE9mKCdwYXJ0cycpICE9PSAtMSB8fCB0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKXtcblxuICAgICAgZm9yKGkgPSB0aGlzLnBhcnRJbmRleDsgaSA8IHRoaXMubnVtUGFydHM7IGkrKyl7XG4gICAgICAgIHBhcnQgPSB0aGlzLnBhcnRzW2ldXG4gICAgICAgIC8vY29uc29sZS5sb2cocGFydCwgdGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIGlmKHBhcnQuX3N0YXJ0W3RoaXMudW5pdF0gPD0gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIGNvbGxlY3RlZFBhcnRzLmFkZChwYXJ0KVxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ3BhcnRPbicsXG4gICAgICAgICAgICBkYXRhOiBwYXJ0XG4gICAgICAgICAgfSlcbiAgICAgICAgICB0aGlzLnBhcnRJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuXG4gICAgICAvLyBmaWx0ZXIgcGFydHMgdGhhdCBhcmUgbm8gbG9uZ2VyIGFjdGl2ZVxuICAgICAgZm9yKGkgPSB0aGlzLmFjdGl2ZVBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcbiAgICAgICAgcGFydCA9IHRoaXMuYWN0aXZlUGFydHNbaV07XG4gICAgICAgIC8vaWYocGFydC5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9wYXJ0c0J5SWQuZ2V0KHBhcnQuaWQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHRoaXMuc29uZy5fcGFydHNCeUlkLmdldChwYXJ0LmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgcGFydCcsIHBhcnQuaWQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZihwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlICYmIGNvbGxlY3RlZFBhcnRzLmhhcyhwYXJ0KSA9PT0gZmFsc2Upe1xuICAgICAgICBpZihwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICBzdGlsbEFjdGl2ZVBhcnRzLnB1c2gobm90ZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ3BhcnRPZmYnLFxuICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hY3RpdmVQYXJ0cyA9IFsuLi5jb2xsZWN0ZWRQYXJ0cy52YWx1ZXMoKSwgLi4uc3RpbGxBY3RpdmVQYXJ0c11cbiAgICAgIHRoaXMuZGF0YS5hY3RpdmVQYXJ0cyA9IHRoaXMuYWN0aXZlUGFydHNcbiAgICB9XG5cbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICBkYXRhOiB0aGlzLmRhdGFcbiAgICB9KVxuXG4gIH1cblxuLypcbiAgc2V0VHlwZSh0KXtcbiAgICB0aGlzLnR5cGUgPSB0O1xuICAgIHRoaXMuc2V0KHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gIH1cblxuXG4gIGFkZFR5cGUodCl7XG4gICAgdGhpcy50eXBlICs9ICcgJyArIHQ7XG4gICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgfVxuXG4gIHJlbW92ZVR5cGUodCl7XG4gICAgdmFyIGFyciA9IHRoaXMudHlwZS5zcGxpdCgnICcpO1xuICAgIHRoaXMudHlwZSA9ICcnO1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpe1xuICAgICAgaWYodHlwZSAhPT0gdCl7XG4gICAgICAgIHRoaXMudHlwZSArPSB0ICsgJyAnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMudHlwZS50cmltKCk7XG4gICAgdGhpcy5zZXQodGhpcy5jdXJyZW50VmFsdWUpO1xuICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gIH1cbiovXG5cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtnZXROaWNlVGltZX0gZnJvbSAnLi91dGlsJztcblxuY29uc3RcbiAgc3VwcG9ydGVkVHlwZXMgPSAnYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBwZXJjIHBlcmNlbnRhZ2UnLFxuICBzdXBwb3J0ZWRSZXR1cm5UeXBlcyA9ICdiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIGFsbCcsXG4gIGZsb29yID0gTWF0aC5mbG9vcixcbiAgcm91bmQgPSBNYXRoLnJvdW5kO1xuXG5cbmxldFxuICAvL2xvY2FsXG4gIGJwbSxcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIHRpY2tzLFxuICBtaWxsaXMsXG4gIGRpZmZUaWNrcyxcbiAgZGlmZk1pbGxpcyxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcblxuLy8gIHR5cGUsXG4gIGluZGV4LFxuICByZXR1cm5UeXBlID0gJ2FsbCcsXG4gIGJleW9uZEVuZE9mU29uZyA9IHRydWU7XG5cblxuZnVuY3Rpb24gZ2V0VGltZUV2ZW50KHNvbmcsIHVuaXQsIHRhcmdldCl7XG4gIC8vIGZpbmRzIHRoZSB0aW1lIGV2ZW50IHRoYXQgY29tZXMgdGhlIGNsb3Nlc3QgYmVmb3JlIHRoZSB0YXJnZXQgcG9zaXRpb25cbiAgbGV0IHRpbWVFdmVudHMgPSBzb25nLl90aW1lRXZlbnRzXG5cbiAgZm9yKGxldCBpID0gdGltZUV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgbGV0IGV2ZW50ID0gdGltZUV2ZW50c1tpXTtcbiAgICAvL2NvbnNvbGUubG9nKHVuaXQsIHRhcmdldCwgZXZlbnQpXG4gICAgaWYoZXZlbnRbdW5pdF0gPD0gdGFyZ2V0KXtcbiAgICAgIGluZGV4ID0gaVxuICAgICAgcmV0dXJuIGV2ZW50XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc1RvVGlja3Moc29uZywgdGFyZ2V0TWlsbGlzLCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXRNaWxsaXMpXG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tzVG9NaWxsaXMoc29uZywgdGFyZ2V0VGlja3MsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0VGlja3MpXG4gIHJldHVybiBtaWxsaXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYmFyc1RvTWlsbGlzKHNvbmcsIHBvc2l0aW9uLCBiZW9zKXsgLy8gYmVvcyA9IGJleW9uZEVuZE9mU29uZ1xuICBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0JyxcbiAgICBwb3NpdGlvbixcbiAgICByZXN1bHQ6ICdtaWxsaXMnLFxuICAgIGJlb3MsXG4gIH0pXG4gIHJldHVybiBtaWxsaXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYmFyc1RvVGlja3Moc29uZywgcG9zaXRpb24sIGJlb3MpeyAvLyBiZW9zID0gYmV5b25kRW5kT2ZTb25nXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICBwb3NpdGlvbixcbiAgICByZXN1bHQ6ICd0aWNrcycsXG4gICAgYmVvc1xuICB9KVxuICAvL3JldHVybiByb3VuZCh0aWNrcyk7XG4gIHJldHVybiB0aWNrc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrc1RvQmFycyhzb25nLCB0YXJnZXQsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KVxuICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICByZXR1cm5UeXBlID0gJ2JhcnNhbmRiZWF0cydcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc1RvQmFycyhzb25nLCB0YXJnZXQsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldClcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgcmV0dXJuVHlwZSA9ICdiYXJzYW5kYmVhdHMnXG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoKVxufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIG1pbGxpcyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbU1pbGxpcyhzb25nLCB0YXJnZXRNaWxsaXMsIGV2ZW50KXtcbiAgbGV0IGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRNaWxsaXMgPiBsYXN0RXZlbnQubWlsbGlzKXtcbiAgICAgIHRhcmdldE1pbGxpcyA9IGxhc3RFdmVudC5taWxsaXM7XG4gICAgfVxuICB9XG5cbiAgaWYodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ21pbGxpcycsIHRhcmdldE1pbGxpcyk7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBleGFjdGx5IGF0IHRhcmdldCBtaWxsaXMsIGNhbGN1bGF0ZSB0aGUgZGlmZlxuICBpZihldmVudC5taWxsaXMgPT09IHRhcmdldE1pbGxpcyl7XG4gICAgZGlmZk1pbGxpcyA9IDA7XG4gICAgZGlmZlRpY2tzID0gMDtcbiAgfWVsc2V7XG4gICAgZGlmZk1pbGxpcyA9IHRhcmdldE1pbGxpcyAtIGV2ZW50Lm1pbGxpcztcbiAgICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgcmV0dXJuIHRpY2tzO1xufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIHRpY2tzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tVGlja3Moc29uZywgdGFyZ2V0VGlja3MsIGV2ZW50KXtcbiAgbGV0IGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRUaWNrcyA+IGxhc3RFdmVudC50aWNrcyl7XG4gICAgICB0YXJnZXRUaWNrcyA9IGxhc3RFdmVudC50aWNrcztcbiAgICB9XG4gIH1cblxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAndGlja3MnLCB0YXJnZXRUaWNrcyk7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBleGFjdGx5IGF0IHRhcmdldCB0aWNrcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmKGV2ZW50LnRpY2tzID09PSB0YXJnZXRUaWNrcyl7XG4gICAgZGlmZlRpY2tzID0gMDtcbiAgICBkaWZmTWlsbGlzID0gMDtcbiAgfWVsc2V7XG4gICAgZGlmZlRpY2tzID0gdGFyZ2V0VGlja3MgLSB0aWNrcztcbiAgICBkaWZmTWlsbGlzID0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIHRpY2tzICs9IGRpZmZUaWNrcztcbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG5cbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciBiYXJzIGFuZCBiZWF0cyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbUJhcnMoc29uZywgdGFyZ2V0QmFyLCB0YXJnZXRCZWF0LCB0YXJnZXRTaXh0ZWVudGgsIHRhcmdldFRpY2ssIGV2ZW50ID0gbnVsbCl7XG4gIC8vY29uc29sZS50aW1lKCdmcm9tQmFycycpO1xuICBsZXQgaSA9IDAsXG4gICAgZGlmZkJhcnMsXG4gICAgZGlmZkJlYXRzLFxuICAgIGRpZmZTaXh0ZWVudGgsXG4gICAgZGlmZlRpY2ssXG4gICAgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2Upe1xuICAgIGlmKHRhcmdldEJhciA+IGxhc3RFdmVudC5iYXIpe1xuICAgICAgdGFyZ2V0QmFyID0gbGFzdEV2ZW50LmJhcjtcbiAgICB9XG4gIH1cblxuICBpZihldmVudCA9PT0gbnVsbCl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ2JhcicsIHRhcmdldEJhcik7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy9jb3JyZWN0IHdyb25nIHBvc2l0aW9uIGRhdGEsIGZvciBpbnN0YW5jZTogJzMsMywyLDc4OCcgYmVjb21lcyAnMyw0LDQsMDY4JyBpbiBhIDQvNCBtZWFzdXJlIGF0IFBQUSA0ODBcbiAgd2hpbGUodGFyZ2V0VGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgdGFyZ2V0U2l4dGVlbnRoKys7XG4gICAgdGFyZ2V0VGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgfVxuXG4gIHdoaWxlKHRhcmdldFNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgdGFyZ2V0QmVhdCsrO1xuICAgIHRhcmdldFNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gIH1cblxuICB3aGlsZSh0YXJnZXRCZWF0ID4gbm9taW5hdG9yKXtcbiAgICB0YXJnZXRCYXIrKztcbiAgICB0YXJnZXRCZWF0IC09IG5vbWluYXRvcjtcbiAgfVxuXG4gIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdiYXInLCB0YXJnZXRCYXIsIGluZGV4KTtcbiAgZm9yKGkgPSBpbmRleDsgaSA+PSAwOyBpLS0pe1xuICAgIGV2ZW50ID0gc29uZy5fdGltZUV2ZW50c1tpXTtcbiAgICBpZihldmVudC5iYXIgPD0gdGFyZ2V0QmFyKXtcbiAgICAgIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlc1xuICBkaWZmVGljayA9IHRhcmdldFRpY2sgLSB0aWNrO1xuICBkaWZmU2l4dGVlbnRoID0gdGFyZ2V0U2l4dGVlbnRoIC0gc2l4dGVlbnRoO1xuICBkaWZmQmVhdHMgPSB0YXJnZXRCZWF0IC0gYmVhdDtcbiAgZGlmZkJhcnMgPSB0YXJnZXRCYXIgLSBiYXI7IC8vYmFyIGlzIGFsd2F5cyBsZXNzIHRoZW4gb3IgZXF1YWwgdG8gdGFyZ2V0QmFyLCBzbyBkaWZmQmFycyBpcyBhbHdheXMgPj0gMFxuXG4gIC8vY29uc29sZS5sb2coJ2RpZmYnLGRpZmZCYXJzLGRpZmZCZWF0cyxkaWZmU2l4dGVlbnRoLGRpZmZUaWNrKTtcbiAgLy9jb25zb2xlLmxvZygnbWlsbGlzJyxtaWxsaXMsdGlja3NQZXJCYXIsdGlja3NQZXJCZWF0LHRpY2tzUGVyU2l4dGVlbnRoLG1pbGxpc1BlclRpY2spO1xuXG4gIC8vIGNvbnZlcnQgZGlmZmVyZW5jZXMgdG8gbWlsbGlzZWNvbmRzIGFuZCB0aWNrc1xuICBkaWZmTWlsbGlzID0gKGRpZmZCYXJzICogdGlja3NQZXJCYXIpICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSAoZGlmZkJlYXRzICogdGlja3NQZXJCZWF0KSAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gKGRpZmZTaXh0ZWVudGggKiB0aWNrc1BlclNpeHRlZW50aCkgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IGRpZmZUaWNrICogbWlsbGlzUGVyVGljaztcbiAgZGlmZlRpY2tzID0gZGlmZk1pbGxpcyAvIG1pbGxpc1BlclRpY2s7XG4gIC8vY29uc29sZS5sb2coZGlmZkJhcnMsIHRpY2tzUGVyQmFyLCBtaWxsaXNQZXJUaWNrLCBkaWZmTWlsbGlzLCBkaWZmVGlja3MpO1xuXG4gIC8vIHNldCBhbGwgY3VycmVudCBwb3NpdGlvbiBkYXRhXG4gIGJhciA9IHRhcmdldEJhcjtcbiAgYmVhdCA9IHRhcmdldEJlYXQ7XG4gIHNpeHRlZW50aCA9IHRhcmdldFNpeHRlZW50aDtcbiAgdGljayA9IHRhcmdldFRpY2s7XG4gIC8vY29uc29sZS5sb2codGljaywgdGFyZ2V0VGljaylcblxuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcbiAgLy9jb25zb2xlLmxvZyh0YXJnZXRCYXIsIHRhcmdldEJlYXQsIHRhcmdldFNpeHRlZW50aCwgdGFyZ2V0VGljaywgJyAtPiAnLCBtaWxsaXMpO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgLy9jb25zb2xlLnRpbWVFbmQoJ2Zyb21CYXJzJyk7XG59XG5cblxuZnVuY3Rpb24gY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCl7XG4gIC8vIHNwcmVhZCB0aGUgZGlmZmVyZW5jZSBpbiB0aWNrIG92ZXIgYmFycywgYmVhdHMgYW5kIHNpeHRlZW50aFxuICBsZXQgdG1wID0gcm91bmQoZGlmZlRpY2tzKTtcbiAgd2hpbGUodG1wID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICBzaXh0ZWVudGgrKztcbiAgICB0bXAgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgd2hpbGUoc2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICBiZWF0Kys7XG4gICAgICB3aGlsZShiZWF0ID4gbm9taW5hdG9yKXtcbiAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgIGJhcisrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB0aWNrID0gcm91bmQodG1wKTtcbn1cblxuXG4vLyBzdG9yZSBwcm9wZXJ0aWVzIG9mIGV2ZW50IGluIGxvY2FsIHNjb3BlXG5mdW5jdGlvbiBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KXtcblxuICBicG0gPSBldmVudC5icG07XG4gIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcblxuICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgLy9jb25zb2xlLmxvZyhicG0sIGV2ZW50LnR5cGUpO1xuICAvL2NvbnNvbGUubG9nKCd0aWNrcycsIHRpY2tzLCAnbWlsbGlzJywgbWlsbGlzLCAnYmFyJywgYmFyKTtcbn1cblxuXG5mdW5jdGlvbiBnZXRQb3NpdGlvbkRhdGEoc29uZyl7XG4gIGxldCB0aW1lRGF0YSxcbiAgICBwb3NpdGlvbkRhdGEgPSB7fTtcblxuICBzd2l0Y2gocmV0dXJuVHlwZSl7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgLy9wb3NpdGlvbkRhdGEubWlsbGlzID0gbWlsbGlzO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpcyA9IHJvdW5kKG1pbGxpcyAqIDEwMDApIC8gMTAwMDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNSb3VuZGVkID0gcm91bmQobWlsbGlzKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3MgPSB0aWNrcztcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrcyA9IHJvdW5kKHRpY2tzKTtcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzVW5yb3VuZGVkID0gdGlja3M7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXIgPSBiYXI7XG4gICAgICBwb3NpdGlvbkRhdGEuYmVhdCA9IGJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2sgPSB0aWNrO1xuICAgICAgLy9wb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2tBc1N0cmluZztcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgZ2V0VGlja0FzU3RyaW5nKHRpY2spO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhbGwnOlxuICAgICAgLy8gbWlsbGlzXG4gICAgICAvL3Bvc2l0aW9uRGF0YS5taWxsaXMgPSBtaWxsaXM7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzID0gcm91bmQobWlsbGlzICogMTAwMCkgLyAxMDAwO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1JvdW5kZWQgPSByb3VuZChtaWxsaXMpO1xuXG4gICAgICAvLyB0aWNrc1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3MgPSB0aWNrcztcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrcyA9IHJvdW5kKHRpY2tzKTtcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzVW5yb3VuZGVkID0gdGlja3M7XG5cbiAgICAgIC8vIGJhcnNiZWF0c1xuICAgICAgcG9zaXRpb25EYXRhLmJhciA9IGJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5iZWF0ID0gYmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEudGljayA9IHRpY2s7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGlja0FzU3RyaW5nO1xuICAgICAgcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyBnZXRUaWNrQXNTdHJpbmcodGljayk7XG5cbiAgICAgIC8vIHRpbWVcbiAgICAgIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuXG4gICAgICAvLyBleHRyYSBkYXRhXG4gICAgICBwb3NpdGlvbkRhdGEuYnBtID0gcm91bmQoYnBtICogc29uZy5wbGF5YmFja1NwZWVkLCAzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gICAgICBwb3NpdGlvbkRhdGEuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyQmFyID0gdGlja3NQZXJCYXI7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgICAgIHBvc2l0aW9uRGF0YS5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUGVyVGljayA9IG1pbGxpc1BlclRpY2s7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljaztcblxuICAgICAgLy8gdXNlIHRpY2tzIHRvIG1ha2UgdGVtcG8gY2hhbmdlcyB2aXNpYmxlIGJ5IGEgZmFzdGVyIG1vdmluZyBwbGF5aGVhZFxuICAgICAgcG9zaXRpb25EYXRhLnBlcmNlbnRhZ2UgPSB0aWNrcyAvIHNvbmcuX2R1cmF0aW9uVGlja3M7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5wZXJjZW50YWdlID0gbWlsbGlzIC8gc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIHBvc2l0aW9uRGF0YVxufVxuXG5cbmZ1bmN0aW9uIGdldFRpY2tBc1N0cmluZyh0KXtcbiAgaWYodCA9PT0gMCl7XG4gICAgdCA9ICcwMDAnXG4gIH1lbHNlIGlmKHQgPCAxMCl7XG4gICAgdCA9ICcwMCcgKyB0XG4gIH1lbHNlIGlmKHQgPCAxMDApe1xuICAgIHQgPSAnMCcgKyB0XG4gIH1cbiAgcmV0dXJuIHRcbn1cblxuXG4vLyB1c2VkIGJ5IHBsYXloZWFkXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9zaXRpb24yKHNvbmcsIHVuaXQsIHRhcmdldCwgdHlwZSwgZXZlbnQpe1xuICBpZih1bml0ID09PSAnbWlsbGlzJyl7XG4gICAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQsIGV2ZW50KTtcbiAgfWVsc2UgaWYodW5pdCA9PT0gJ3RpY2tzJyl7XG4gICAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldCwgZXZlbnQpO1xuICB9XG4gIHJldHVyblR5cGUgPSB0eXBlXG4gIGlmKHJldHVyblR5cGUgPT09ICdhbGwnKXtcbiAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgfVxuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xufVxuXG5cbi8vIGltcHJvdmVkIHZlcnNpb24gb2YgZ2V0UG9zaXRpb25cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCBzZXR0aW5ncyl7XG4gIGxldCB7XG4gICAgdHlwZSwgLy8gYW55IG9mIGJhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlXG4gICAgdGFyZ2V0LCAvLyBpZiB0eXBlIGlzIGJhcnNiZWF0cyBvciB0aW1lLCB0YXJnZXQgbXVzdCBiZSBhbiBhcnJheSwgZWxzZSBpZiBtdXN0IGJlIGEgbnVtYmVyXG4gICAgcmVzdWx0OiByZXN1bHQgPSAnYWxsJywgLy8gYW55IG9mIGJhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgYWxsXG4gICAgYmVvczogYmVvcyA9IHRydWUsXG4gICAgc25hcDogc25hcCA9IC0xXG4gIH0gPSBzZXR0aW5nc1xuXG4gIGlmKHN1cHBvcnRlZFJldHVyblR5cGVzLmluZGV4T2YocmVzdWx0KSA9PT0gLTEpe1xuICAgIGNvbnNvbGUud2FybihgdW5zdXBwb3J0ZWQgcmV0dXJuIHR5cGUsICdhbGwnIHVzZWQgaW5zdGVhZCBvZiAnJHtyZXN1bHR9J2ApXG4gICAgcmVzdWx0ID0gJ2FsbCdcbiAgfVxuXG4gIHJldHVyblR5cGUgPSByZXN1bHRcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuXG4gIGlmKHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkgPT09IC0xKXtcbiAgICBjb25zb2xlLmVycm9yKGB1bnN1cHBvcnRlZCB0eXBlICR7dHlwZX1gKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cblxuICBzd2l0Y2godHlwZSl7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBsZXQgW3RhcmdldGJhciA9IDEsIHRhcmdldGJlYXQgPSAxLCB0YXJnZXRzaXh0ZWVudGggPSAxLCB0YXJnZXR0aWNrID0gMF0gPSB0YXJnZXRcbiAgICAgIC8vY29uc29sZS5sb2codGFyZ2V0YmFyLCB0YXJnZXRiZWF0LCB0YXJnZXRzaXh0ZWVudGgsIHRhcmdldHRpY2spXG4gICAgICBmcm9tQmFycyhzb25nLCB0YXJnZXRiYXIsIHRhcmdldGJlYXQsIHRhcmdldHNpeHRlZW50aCwgdGFyZ2V0dGljaylcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAgbGV0IFt0YXJnZXRob3VyID0gMCwgdGFyZ2V0bWludXRlID0gMCwgdGFyZ2V0c2Vjb25kID0gMCwgdGFyZ2V0bWlsbGlzZWNvbmQgPSAwXSA9IHRhcmdldFxuICAgICAgbGV0IG1pbGxpcyA9IDBcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRob3VyICogNjAgKiA2MCAqIDEwMDAgLy9ob3Vyc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbnV0ZSAqIDYwICogMTAwMCAvL21pbnV0ZXNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRzZWNvbmQgKiAxMDAwIC8vc2Vjb25kc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbGxpc2Vjb25kIC8vbWlsbGlzZWNvbmRzXG5cbiAgICAgIGZyb21NaWxsaXMoc29uZywgbWlsbGlzKVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldClcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICAvL2NvbnNvbGUubG9nKHNvbmcsIHRhcmdldClcbiAgICAgIGZyb21UaWNrcyhzb25nLCB0YXJnZXQpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAncGVyYyc6XG4gICAgY2FzZSAncGVyY2VudGFnZSc6XG5cbiAgICAgIC8vbWlsbGlzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgLy9mcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pbGxpcyk7XG5cbiAgICAgIHRpY2tzID0gdGFyZ2V0ICogc29uZy5fZHVyYXRpb25UaWNrcyAvLyB0YXJnZXQgbXVzdCBiZSBpbiB0aWNrcyFcbiAgICAgIC8vY29uc29sZS5sb2codGlja3MsIHNvbmcuX2R1cmF0aW9uVGlja3MpXG4gICAgICBpZihzbmFwICE9PSAtMSl7XG4gICAgICAgIHRpY2tzID0gZmxvb3IodGlja3MgLyBzbmFwKSAqIHNuYXA7XG4gICAgICAgIC8vZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcyk7XG4gICAgICB9XG4gICAgICBmcm9tVGlja3Moc29uZywgdGlja3MpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgbGV0IHRtcCA9IGdldFBvc2l0aW9uRGF0YShzb25nKVxuICAgICAgLy9jb25zb2xlLmxvZygnZGlmZicsIHBvc2l0aW9uWzFdIC0gdG1wLnBlcmNlbnRhZ2UpO1xuICAgICAgcmV0dXJuIHRtcFxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbi8qXG5cbi8vQHBhcmFtOiAnbWlsbGlzJywgMTAwMCwgW3RydWVdXG4vL0BwYXJhbTogJ3RpY2tzJywgMTAwMCwgW3RydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDEsIFsnYWxsJywgdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgNjAsIDQsIDMsIDEyMCwgWydhbGwnLCB0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCA2MCwgNCwgMywgMTIwLCBbdHJ1ZSwgJ2FsbCddXG5cbmZ1bmN0aW9uIGNoZWNrUG9zaXRpb24odHlwZSwgYXJncywgcmV0dXJuVHlwZSA9ICdhbGwnKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcbiAgY29uc29sZS5sb2coJy0tLS0+IGNoZWNrUG9zaXRpb246JywgYXJncywgdHlwZVN0cmluZyhhcmdzKSk7XG5cbiAgaWYodHlwZVN0cmluZyhhcmdzKSA9PT0gJ2FycmF5Jyl7XG4gICAgbGV0XG4gICAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIGksIGEsIHBvc2l0aW9uTGVuZ3RoO1xuXG4gICAgdHlwZSA9IGFyZ3NbMF07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBbWydtaWxsaXMnLCAzMDAwXV1cbiAgICBpZih0eXBlU3RyaW5nKGFyZ3NbMF0pID09PSAnYXJyYXknKXtcbiAgICAgIC8vY29uc29sZS53YXJuKCd0aGlzIHNob3VsZG5cXCd0IGhhcHBlbiEnKTtcbiAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgdHlwZSA9IGFyZ3NbMF07XG4gICAgICBudW1BcmdzID0gYXJncy5sZW5ndGg7XG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBbdHlwZV07XG5cbiAgICBjb25zb2xlLmxvZygnY2hlY2sgcG9zaXRpb24nLCBhcmdzLCBudW1BcmdzLCBzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpKTtcblxuICAgIC8vY29uc29sZS5sb2coJ2FyZycsIDAsICctPicsIHR5cGUpO1xuXG4gICAgaWYoc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSAhPT0gLTEpe1xuICAgICAgZm9yKGkgPSAxOyBpIDwgbnVtQXJnczsgaSsrKXtcbiAgICAgICAgYSA9IGFyZ3NbaV07XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2FyZycsIGksICctPicsIGEpO1xuICAgICAgICBpZihhID09PSB0cnVlIHx8IGEgPT09IGZhbHNlKXtcbiAgICAgICAgICBiZXlvbmRFbmRPZlNvbmcgPSBhO1xuICAgICAgICB9ZWxzZSBpZihpc05hTihhKSl7XG4gICAgICAgICAgaWYoc3VwcG9ydGVkUmV0dXJuVHlwZXMuaW5kZXhPZihhKSAhPT0gLTEpe1xuICAgICAgICAgICAgcmV0dXJuVHlwZSA9IGE7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgcG9zaXRpb24ucHVzaChhKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jaGVjayBudW1iZXIgb2YgYXJndW1lbnRzIC0+IGVpdGhlciAxIG51bWJlciBvciA0IG51bWJlcnMgaW4gcG9zaXRpb24sIGUuZy4gWydiYXJzYmVhdHMnLCAxXSBvciBbJ2JhcnNiZWF0cycsIDEsIDEsIDEsIDBdLFxuICAgICAgLy8gb3IgWydwZXJjJywgMC41NiwgbnVtYmVyT2ZUaWNrc1RvU25hcFRvXVxuICAgICAgcG9zaXRpb25MZW5ndGggPSBwb3NpdGlvbi5sZW5ndGg7XG4gICAgICBpZihwb3NpdGlvbkxlbmd0aCAhPT0gMiAmJiBwb3NpdGlvbkxlbmd0aCAhPT0gMyAmJiBwb3NpdGlvbkxlbmd0aCAhPT0gNSl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2cocG9zaXRpb24sIHJldHVyblR5cGUsIGJleW9uZEVuZE9mU29uZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvc2l0aW9uKHNvbmcsIHR5cGUsIGFyZ3Mpe1xuICAvL2NvbnNvbGUubG9nKCdnZXRQb3NpdGlvbicsIGFyZ3MpO1xuXG4gIGlmKHR5cGVvZiBhcmdzID09PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1pbGxpczogMFxuICAgIH1cbiAgfVxuXG4gIGxldCBwb3NpdGlvbiA9IGNoZWNrUG9zaXRpb24odHlwZSwgYXJncyksXG4gICAgbWlsbGlzLCB0bXAsIHNuYXA7XG5cblxuICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgIGVycm9yKCd3cm9uZyBwb3NpdGlvbiBkYXRhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3dpdGNoKHR5cGUpe1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgZnJvbUJhcnMoc29uZywgcG9zaXRpb25bMV0sIHBvc2l0aW9uWzJdLCBwb3NpdGlvblszXSwgcG9zaXRpb25bNF0pO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAgbWlsbGlzID0gMDtcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzFdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogNjAgKiA2MCAqIDEwMDA7IC8vaG91cnNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzJdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogNjAgKiAxMDAwOyAvL21pbnV0ZXNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzNdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogMTAwMDsgLy9zZWNvbmRzXG4gICAgICB0bXAgPSBwb3NpdGlvbls0XSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcDsgLy9taWxsaXNlY29uZHNcblxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGZyb21NaWxsaXMoc29uZywgcG9zaXRpb25bMV0pO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHBvc2l0aW9uWzFdKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgc25hcCA9IHBvc2l0aW9uWzJdO1xuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvblRpY2tzO1xuICAgICAgaWYoc25hcCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdGlja3MgPSBmbG9vcih0aWNrcy9zbmFwKSAqIHNuYXA7XG4gICAgICAgIC8vZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcyk7XG4gICAgICB9XG4gICAgICBmcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICB0bXAgPSBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdkaWZmJywgcG9zaXRpb25bMV0gLSB0bXAucGVyY2VudGFnZSk7XG4gICAgICByZXR1cm4gdG1wO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuKi9cblxuIiwiY29uc3QgdmVyc2lvbiA9ICcxLjAuMC1iZXRhMjEnXG5cbmltcG9ydCB7XG4gIGdldE5vdGVEYXRhLFxufSBmcm9tICcuL25vdGUnXG5cbmltcG9ydCB7XG4gIE1JRElFdmVudFxufSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmltcG9ydHtcbiAgTUlESU5vdGUsXG59IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnR7XG4gIFBhcnQsXG59IGZyb20gJy4vcGFydCdcblxuaW1wb3J0e1xuICBUcmFjayxcbn0gZnJvbSAnLi90cmFjaydcblxuaW1wb3J0IHtcbiAgU29uZyxcbn0gZnJvbSAnLi9zb25nJ1xuXG5pbXBvcnQge1xuICBJbnN0cnVtZW50LFxufSBmcm9tICcuL2luc3RydW1lbnQnXG5cbmltcG9ydCB7XG4gIFNhbXBsZXIsXG59IGZyb20gJy4vc2FtcGxlcidcblxuaW1wb3J0IHtcbiAgU2ltcGxlU3ludGgsXG59IGZyb20gJy4vc2ltcGxlX3N5bnRoJ1xuXG5pbXBvcnQge1xuICBwYXJzZU1JRElGaWxlXG59IGZyb20gJy4vbWlkaWZpbGUnXG5cbmltcG9ydCB7XG4gIGluaXQsXG59IGZyb20gJy4vaW5pdCdcblxuaW1wb3J0IHtcbiAgY29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG59IGZyb20gJy4vaW5pdF9hdWRpbydcblxuaW1wb3J0IHtcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcbn0gZnJvbSAnLi9pbml0X21pZGknXG5cbmltcG9ydCB7XG4gIHBhcnNlU2FtcGxlcyxcbn0gZnJvbSAnLi9wYXJzZV9hdWRpbydcblxuaW1wb3J0IHtcbiAgTUlESUV2ZW50VHlwZXMsXG59IGZyb20gJy4vY29uc3RhbnRzJ1xuXG5pbXBvcnQge1xuICBzZXRCdWZmZXJUaW1lLFxuICBnZXRJbnN0cnVtZW50cyxcbiAgZ2V0R01JbnN0cnVtZW50cyxcbn0gZnJvbSAnLi9zZXR0aW5ncydcblxuaW1wb3J0IHtcbiAgYWRkRXZlbnRMaXN0ZW5lcixcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcixcbiAgZGlzcGF0Y2hFdmVudFxufSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5cblxuY29uc3QgZ2V0QXVkaW9Db250ZXh0ID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGNvbnRleHRcbn1cblxuY29uc3QgcWFtYmkgPSB7XG4gIHZlcnNpb24sXG4gIC8vIGZyb20gLi9ub3RlXG4gIGdldE5vdGVEYXRhLFxuXG5cbiAgLy8gZnJvbSAuL2luaXRcbiAgaW5pdCxcblxuICAvLyBmcm9tIC4vc2V0dGluZ3NcbiAgc2V0QnVmZmVyVGltZSxcblxuICAvLyBmcm9tIC4vY29uc3RhbnRzXG4gIE1JRElFdmVudFR5cGVzLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vbWlkaWZpbGVcbiAgcGFyc2VNSURJRmlsZSxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgZ2V0SW5zdHJ1bWVudHMsXG4gIGdldEdNSW5zdHJ1bWVudHMsXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayl7XG4gICAgcmV0dXJuIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spXG4gIH0sXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZClcbiAgfSxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBNSURJRXZlbnQsXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBNSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBTb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBUcmFjayxcblxuICAvLyBmcm9tIC4vcGFydFxuICBQYXJ0LFxuXG4gIC8vIGZyb20gLi9pbnN0cnVtZW50XG4gIEluc3RydW1lbnQsXG5cbiAgLy8gZnJvbSAuL3NpbXBsZV9zeW50aFxuICBTaW1wbGVTeW50aCxcblxuICAvLyBmcm9tIC4vc2FtcGxlclxuICBTYW1wbGVyLFxuXG4gIGxvZyhpZCl7XG4gICAgc3dpdGNoKGlkKXtcbiAgICAgIGNhc2UgJ2Z1bmN0aW9ucyc6XG4gICAgICAgIGNvbnNvbGUubG9nKGBmdW5jdGlvbnM6XG4gICAgICAgICAgZ2V0QXVkaW9Db250ZXh0XG4gICAgICAgICAgZ2V0TWFzdGVyVm9sdW1lXG4gICAgICAgICAgc2V0TWFzdGVyVm9sdW1lXG4gICAgICAgICAgZ2V0TUlESUFjY2Vzc1xuICAgICAgICAgIGdldE1JRElJbnB1dHNcbiAgICAgICAgICBnZXRNSURJT3V0cHV0c1xuICAgICAgICAgIGdldE1JRElJbnB1dElkc1xuICAgICAgICAgIGdldE1JRElPdXRwdXRJZHNcbiAgICAgICAgICBnZXRNSURJSW5wdXRzQnlJZFxuICAgICAgICAgIGdldE1JRElPdXRwdXRzQnlJZFxuICAgICAgICAgIHBhcnNlTUlESUZpbGVcbiAgICAgICAgICBzZXRCdWZmZXJUaW1lXG4gICAgICAgICAgZ2V0SW5zdHJ1bWVudHNcbiAgICAgICAgICBnZXRHTUluc3RydW1lbnRzXG4gICAgICAgIGApXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfSxcbn1cblxuZXhwb3J0IGRlZmF1bHQgcWFtYmlcblxuZXhwb3J0IHtcbiAgdmVyc2lvbixcblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICBzZXRCdWZmZXJUaW1lLFxuICBnZXRJbnN0cnVtZW50cyxcbiAgZ2V0R01JbnN0cnVtZW50cyxcblxuICAvLyBmcm9tIC4vY29uc3RhbnRzXG4gIE1JRElFdmVudFR5cGVzLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vbWlkaWZpbGVcbiAgcGFyc2VNSURJRmlsZSxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIGZyb20gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICAvLyBmcm9tIC4vbm90ZVxuICBnZXROb3RlRGF0YSxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBNSURJRXZlbnQsXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBNSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBTb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBUcmFjayxcblxuICAvLyBmcm9tIC4vcGFydFxuICBQYXJ0LFxuXG4gIC8vIGZyb20gLi9pbnN0cnVtZW50XG4gIEluc3RydW1lbnQsXG5cbiAgLy8gZnJvbSAuL3NpbXBsZV9zeW50aFxuICBTaW1wbGVTeW50aCxcblxuICAvLyBmcm9tIC4vc2FtcGxlclxuICBTYW1wbGVyLFxufVxuIiwiaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8uanMnXG5pbXBvcnQge2dldEVxdWFsUG93ZXJDdXJ2ZX0gZnJvbSAnLi91dGlsLmpzJ1xuXG5leHBvcnQgY2xhc3MgU2FtcGxle1xuXG4gIGNvbnN0cnVjdG9yKHNhbXBsZURhdGEsIGV2ZW50KXtcbiAgICB0aGlzLmV2ZW50ID0gZXZlbnRcbiAgICB0aGlzLnNhbXBsZURhdGEgPSBzYW1wbGVEYXRhXG4gIH1cblxuICBzdGFydCh0aW1lKXtcbiAgICBsZXQge3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZH0gPSB0aGlzLnNhbXBsZURhdGFcbiAgICAvL2NvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZClcbiAgICBpZihzdXN0YWluU3RhcnQgJiYgc3VzdGFpbkVuZCl7XG4gICAgICB0aGlzLnNvdXJjZS5sb29wID0gdHJ1ZVxuICAgICAgdGhpcy5zb3VyY2UubG9vcFN0YXJ0ID0gc3VzdGFpblN0YXJ0XG4gICAgICB0aGlzLnNvdXJjZS5sb29wRW5kID0gc3VzdGFpbkVuZFxuICAgIH1cbiAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgY2Ipe1xuICAgIGxldCB7cmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUsIHJlbGVhc2VFbnZlbG9wZUFycmF5fSA9IHRoaXMuc2FtcGxlRGF0YVxuICAgIC8vY29uc29sZS5sb2cocmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUpXG4gICAgdGhpcy5zb3VyY2Uub25lbmRlZCA9IGNiXG5cbiAgICBpZihyZWxlYXNlRHVyYXRpb24gJiYgcmVsZWFzZUVudmVsb3BlKXtcbiAgICAgIHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UgPSB0aW1lXG4gICAgICB0aGlzLnJlbGVhc2VGdW5jdGlvbiA9ICgpID0+IHtcbiAgICAgICAgZmFkZU91dCh0aGlzLm91dHB1dCwge1xuICAgICAgICAgIHJlbGVhc2VEdXJhdGlvbixcbiAgICAgICAgICByZWxlYXNlRW52ZWxvcGUsXG4gICAgICAgICAgcmVsZWFzZUVudmVsb3BlQXJyYXksXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0cnl7XG4gICAgICAgIHRoaXMuc291cmNlLnN0b3AodGltZSArIHJlbGVhc2VEdXJhdGlvbilcbiAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc3RvcCBtb3JlIHRoYW4gb25jZVxuICAgICAgfVxuICAgICAgdGhpcy5jaGVja1BoYXNlKClcbiAgICB9ZWxzZXtcbiAgICAgIHRyeXtcbiAgICAgICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lKVxuICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAvLyBpbiBGaXJlZm94IGFuZCBTYWZhcmkgeW91IGNhbiBub3QgY2FsbCBzdG9wIG1vcmUgdGhhbiBvbmNlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2hlY2tQaGFzZSgpe1xuICAgIC8vY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSwgdGhpcy5zdGFydFJlbGVhc2VQaGFzZSlcbiAgICBpZihjb250ZXh0LmN1cnJlbnRUaW1lID49IHRoaXMuc3RhcnRSZWxlYXNlUGhhc2Upe1xuICAgICAgdGhpcy5yZWxlYXNlRnVuY3Rpb24oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmNoZWNrUGhhc2UuYmluZCh0aGlzKSlcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBmYWRlT3V0KGdhaW5Ob2RlLCBzZXR0aW5ncyl7XG4gIGxldCBub3cgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gIGxldCB2YWx1ZXMsIGksIG1heGlcblxuICAvL2NvbnNvbGUubG9nKHNldHRpbmdzKVxuICB0cnl7XG4gICAgc3dpdGNoKHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZSl7XG5cbiAgICAgIGNhc2UgJ2xpbmVhcic6XG4gICAgICAgIGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSwgbm93KVxuICAgICAgICBnYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgbm93ICsgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdlcXVhbCBwb3dlcic6XG4gICAgICBjYXNlICdlcXVhbF9wb3dlcic6XG4gICAgICAgIHZhbHVlcyA9IGdldEVxdWFsUG93ZXJDdXJ2ZSgxMDAsICdmYWRlT3V0JywgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSlcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgbWF4aSA9IHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZUFycmF5Lmxlbmd0aFxuICAgICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1heGkpXG4gICAgICAgIGZvcihpID0gMDsgaSA8IG1heGk7IGkrKyl7XG4gICAgICAgICAgdmFsdWVzW2ldID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXlbaV0gKiBnYWluTm9kZS5nYWluLnZhbHVlXG4gICAgICAgIH1cbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9Y2F0Y2goZSl7XG4gICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc2V0VmFsdWVDdXJ2ZUF0VGltZSBhbmQgbGluZWFyUmFtcFRvVmFsdWVBdFRpbWUgbW9yZSB0aGFuIG9uY2VcblxuICAgIC8vY29uc29sZS5sb2codmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAvL2NvbnNvbGUubG9nKGUsIGdhaW5Ob2RlKVxuICB9XG59XG4iLCJpbXBvcnQge1NhbXBsZX0gZnJvbSAnLi9zYW1wbGUnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBTYW1wbGVCdWZmZXIgZXh0ZW5kcyBTYW1wbGV7XG5cbiAgY29uc3RydWN0b3Ioc2FtcGxlRGF0YSwgZXZlbnQpe1xuICAgIHN1cGVyKHNhbXBsZURhdGEsIGV2ZW50KVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcblxuICAgIGlmKHRoaXMuc2FtcGxlRGF0YSA9PT0gLTEgfHwgdHlwZW9mIHRoaXMuc2FtcGxlRGF0YS5idWZmZXIgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIC8vIGNyZWF0ZSBkdW1teSBzb3VyY2VcbiAgICAgIHRoaXMuc291cmNlID0ge1xuICAgICAgICBzdGFydCgpe30sXG4gICAgICAgIHN0b3AoKXt9LFxuICAgICAgICBjb25uZWN0KCl7fSxcbiAgICAgIH1cblxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZURhdGEpXG4gICAgICB0aGlzLnNvdXJjZS5idWZmZXIgPSBzYW1wbGVEYXRhLmJ1ZmZlcjtcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5zb3VyY2UuYnVmZmVyKVxuICAgIH1cbiAgICB0aGlzLm91dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy52b2x1bWUgPSBldmVudC5kYXRhMiAvIDEyN1xuICAgIHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuc291cmNlLmNvbm5lY3QodGhpcy5vdXRwdXQpXG4gICAgLy90aGlzLm91dHB1dC5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIH1cbn1cbiIsImltcG9ydCB7U2FtcGxlfSBmcm9tICcuL3NhbXBsZSdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFNhbXBsZU9zY2lsbGF0b3IgZXh0ZW5kcyBTYW1wbGV7XG5cbiAgY29uc3RydWN0b3Ioc2FtcGxlRGF0YSwgZXZlbnQpe1xuICAgIHN1cGVyKHNhbXBsZURhdGEsIGV2ZW50KVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcblxuICAgIGlmKHRoaXMuc2FtcGxlRGF0YSA9PT0gLTEpe1xuICAgICAgLy8gY3JlYXRlIGR1bW15IHNvdXJjZVxuICAgICAgdGhpcy5zb3VyY2UgPSB7XG4gICAgICAgIHN0YXJ0KCl7fSxcbiAgICAgICAgc3RvcCgpe30sXG4gICAgICAgIGNvbm5lY3QoKXt9LFxuICAgICAgfVxuXG4gICAgfWVsc2V7XG5cbiAgICAgIC8vIEBUT0RPIGFkZCB0eXBlICdjdXN0b20nID0+IFBlcmlvZGljV2F2ZVxuICAgICAgbGV0IHR5cGUgPSB0aGlzLnNhbXBsZURhdGEudHlwZVxuICAgICAgdGhpcy5zb3VyY2UgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKVxuXG4gICAgICBzd2l0Y2godHlwZSl7XG4gICAgICAgIGNhc2UgJ3NpbmUnOlxuICAgICAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgICBjYXNlICdzYXd0b290aCc6XG4gICAgICAgIGNhc2UgJ3RyaWFuZ2xlJzpcbiAgICAgICAgICB0aGlzLnNvdXJjZS50eXBlID0gdHlwZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5zb3VyY2UudHlwZSA9ICdzcXVhcmUnXG4gICAgICB9XG4gICAgICB0aGlzLnNvdXJjZS5mcmVxdWVuY3kudmFsdWUgPSBldmVudC5mcmVxdWVuY3lcbiAgICB9XG4gICAgdGhpcy5vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMudm9sdW1lID0gZXZlbnQuZGF0YTIgLyAxMjdcbiAgICB0aGlzLm91dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLnNvdXJjZS5jb25uZWN0KHRoaXMub3V0cHV0KVxuICAgIC8vdGhpcy5vdXRwdXQuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICB9XG59XG4iLCJpbXBvcnQge0luc3RydW1lbnR9IGZyb20gJy4vaW5zdHJ1bWVudCdcbmltcG9ydCB7Z2V0Tm90ZURhdGF9IGZyb20gJy4vbm90ZSdcbmltcG9ydCB7cGFyc2VTYW1wbGVzfSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2ZldGNoSlNPTn0gZnJvbSAnLi9mZXRjaF9oZWxwZXJzJ1xuaW1wb3J0IHtTYW1wbGVCdWZmZXJ9IGZyb20gJy4vc2FtcGxlX2J1ZmZlcidcblxuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFNhbXBsZXIgZXh0ZW5kcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyl7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcblxuICAgIC8vIGNyZWF0ZSBhIHNhbXBsZXMgZGF0YSBvYmplY3QgZm9yIGFsbCAxMjggdmVsb2NpdHkgbGV2ZWxzIG9mIGFsbCAxMjggbm90ZXNcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSlcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gdGhpcy5zYW1wbGVzRGF0YS5tYXAoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKVxuICAgIH0pXG4gIH1cblxuICBjcmVhdGVTYW1wbGUoZXZlbnQpe1xuICAgIHJldHVybiBuZXcgU2FtcGxlQnVmZmVyKHRoaXMuc2FtcGxlc0RhdGFbZXZlbnQuZGF0YTFdW2V2ZW50LmRhdGEyXSwgZXZlbnQpXG4gIH1cblxuICBfbG9hZEpTT04oZGF0YSl7XG4gICAgaWYodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkYXRhLnVybCA9PT0gJ3N0cmluZycpe1xuICAgICAgcmV0dXJuIGZldGNoSlNPTihkYXRhLnVybClcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkYXRhKVxuICB9XG5cbiAgLy8gbG9hZCBhbmQgcGFyc2VcbiAgcGFyc2VTYW1wbGVEYXRhKGRhdGEpe1xuXG4gICAgLy8gY2hlY2sgaWYgd2UgaGF2ZSB0byBvdmVycnVsZSB0aGUgYmFzZVVybCBvZiB0aGUgc2FtcGVsc1xuICAgIGxldCBiYXNlVXJsID0gbnVsbFxuICAgIGlmKHR5cGVvZiBkYXRhLmJhc2VVcmwgPT09ICdzdHJpbmcnKXtcbiAgICAgIGJhc2VVcmwgPSBkYXRhLmJhc2VVcmxcbiAgICB9XG5cbiAgICBpZih0eXBlb2YgZGF0YS5yZWxlYXNlICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAvL2NvbnNvbGUubG9nKDEsIGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgIH1cblxuICAgIC8vcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fbG9hZEpTT04oZGF0YSlcbiAgICAgIC50aGVuKChqc29uKSA9PiB7XG4gICAgICAgIC8vY29uc29sZS5sb2coanNvbilcbiAgICAgICAgZGF0YSA9IGpzb25cbiAgICAgICAgaWYoYmFzZVVybCAhPT0gbnVsbCl7XG4gICAgICAgICAganNvbi5iYXNlVXJsID0gYmFzZVVybFxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygyLCBkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VTYW1wbGVzKGRhdGEpXG4gICAgICB9KVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICBpZih0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgZm9yKGxldCBub3RlSWQgb2YgT2JqZWN0LmtleXMocmVzdWx0KSkge1xuICAgICAgICAgICAgbGV0IGJ1ZmZlciA9IHJlc3VsdFtub3RlSWRdXG4gICAgICAgICAgICBsZXQgc2FtcGxlRGF0YSA9IGRhdGFbbm90ZUlkXVxuXG5cbiAgICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzYW1wbGVEYXRhIGlzIHVuZGVmaW5lZCcsIG5vdGVJZClcbiAgICAgICAgICAgIH1lbHNlIGlmKHR5cGVTdHJpbmcoYnVmZmVyKSA9PT0gJ2FycmF5Jyl7XG5cbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhidWZmZXIsIHNhbXBsZURhdGEpXG4gICAgICAgICAgICAgIHNhbXBsZURhdGEuZm9yRWFjaCgoc2QsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKG5vdGVJZCwgYnVmZmVyW2ldKVxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBzZCA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgICAgICAgc2QgPSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyW2ldXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICBzZC5idWZmZXIgPSBidWZmZXJbaV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2Qubm90ZSA9IHBhcnNlSW50KG5vdGVJZCwgMTApXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2FtcGxlRGF0YShzZClcbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfWVsc2Uge1xuXG4gICAgICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IGJ1ZmZlclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHBhcnNlSW50KG5vdGVJZCwgMTApXG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICB9ZWxzZXtcblxuICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKChzYW1wbGUpID0+IHtcbiAgICAgICAgICAgIGxldCBzYW1wbGVEYXRhID0gZGF0YVtzYW1wbGVdXG4gICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2FtcGxlRGF0YSBpcyB1bmRlZmluZWQnLCBzYW1wbGUpXG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogc2FtcGxlLmJ1ZmZlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBzYW1wbGUuYnVmZmVyXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2FtcGxlRGF0YS5ub3RlID0gc2FtcGxlXG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcbiAgICAgICAgICAgICAgLy90aGlzLnVwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuXG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyhuZXcgRGF0ZSgpLmdldFRpbWUoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKlxuICAgIEBwYXJhbSBjb25maWcgKG9wdGlvbmFsKVxuICAgICAge1xuICAgICAgICBub3RlOiBjYW4gYmUgbm90ZSBuYW1lIChDNCkgb3Igbm90ZSBudW1iZXIgKDYwKVxuICAgICAgICBidWZmZXI6IEF1ZGlvQnVmZmVyXG4gICAgICAgIHN1c3RhaW46IFtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmRdLCAvLyBvcHRpb25hbCwgaW4gbWlsbGlzXG4gICAgICAgIHJlbGVhc2U6IFtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZV0sIC8vIG9wdGlvbmFsXG4gICAgICAgIHBhbjogcGFuUG9zaXRpb24gLy8gb3B0aW9uYWxcbiAgICAgICAgdmVsb2NpdHk6IFt2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZF0gLy8gb3B0aW9uYWwsIGZvciBtdWx0aS1sYXllcmVkIGluc3RydW1lbnRzXG4gICAgICB9XG4gICovXG4gIHVwZGF0ZVNhbXBsZURhdGEoLi4uZGF0YSl7XG4gICAgZGF0YS5mb3JFYWNoKG5vdGVEYXRhID0+IHtcbiAgICAgIC8vIHN1cHBvcnQgZm9yIG11bHRpIGxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgIC8vY29uc29sZS5sb2cobm90ZURhdGEsIHR5cGVTdHJpbmcobm90ZURhdGEpKVxuICAgICAgaWYodHlwZVN0cmluZyhub3RlRGF0YSkgPT09ICdhcnJheScpe1xuICAgICAgICBub3RlRGF0YS5mb3JFYWNoKHZlbG9jaXR5TGF5ZXIgPT4ge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEodmVsb2NpdHlMYXllcilcbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKG5vdGVEYXRhKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjbGVhclNhbXBsZURhdGEoKXtcblxuICB9XG5cbiAgX3VwZGF0ZVNhbXBsZURhdGEoZGF0YSA9IHt9KXtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gICAgbGV0IHtcbiAgICAgIG5vdGUsXG4gICAgICBidWZmZXIgPSBudWxsLFxuICAgICAgc3VzdGFpbiA9IFtudWxsLCBudWxsXSxcbiAgICAgIHJlbGVhc2UgPSBbbnVsbCwgJ2xpbmVhciddLCAvLyByZWxlYXNlIGR1cmF0aW9uIGlzIGluIHNlY29uZHMhXG4gICAgICBwYW4gPSBudWxsLFxuICAgICAgdmVsb2NpdHkgPSBbMCwgMTI3XSxcbiAgICB9ID0gZGF0YVxuXG4gICAgaWYodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBub3RlbnVtYmVyIG9yIGEgbm90ZW5hbWUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZ2V0IG5vdGVudW1iZXIgZnJvbSBub3RlbmFtZSBhbmQgY2hlY2sgaWYgdGhlIG5vdGVudW1iZXIgaXMgdmFsaWRcbiAgICBsZXQgbiA9IGdldE5vdGVEYXRhKHtudW1iZXI6IG5vdGV9KVxuICAgIGlmKG4gPT09IGZhbHNlKXtcbiAgICAgIGNvbnNvbGUud2Fybignbm90IGEgdmFsaWQgbm90ZSBpZCcpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbm90ZSA9IG4ubnVtYmVyXG5cbiAgICBsZXQgW3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZF0gPSBzdXN0YWluXG4gICAgbGV0IFtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZV0gPSByZWxlYXNlXG4gICAgbGV0IFt2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZF0gPSB2ZWxvY2l0eVxuXG4gICAgaWYoc3VzdGFpbi5sZW5ndGggIT09IDIpe1xuICAgICAgc3VzdGFpblN0YXJ0ID0gc3VzdGFpbkVuZCA9IG51bGxcbiAgICB9XG5cbiAgICBpZihyZWxlYXNlRHVyYXRpb24gPT09IG51bGwpe1xuICAgICAgcmVsZWFzZUVudmVsb3BlID0gbnVsbFxuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKG5vdGUsIGJ1ZmZlcilcbiAgICAvLyBjb25zb2xlLmxvZyhzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmQpXG4gICAgLy8gY29uc29sZS5sb2cocmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUpXG4gICAgLy8gY29uc29sZS5sb2cocGFuKVxuICAgIC8vIGNvbnNvbGUubG9nKHZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kKVxuXG5cbiAgICB0aGlzLnNhbXBsZXNEYXRhW25vdGVdLmZvckVhY2goKHNhbXBsZURhdGEsIGkpID0+IHtcbiAgICAgIGlmKGkgPj0gdmVsb2NpdHlTdGFydCAmJiBpIDw9IHZlbG9jaXR5RW5kKXtcbiAgICAgICAgaWYoc2FtcGxlRGF0YSA9PT0gLTEpe1xuICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICBpZDogbm90ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gYnVmZmVyIHx8IHNhbXBsZURhdGEuYnVmZmVyXG4gICAgICAgIHNhbXBsZURhdGEuc3VzdGFpblN0YXJ0ID0gc3VzdGFpblN0YXJ0IHx8IHNhbXBsZURhdGEuc3VzdGFpblN0YXJ0XG4gICAgICAgIHNhbXBsZURhdGEuc3VzdGFpbkVuZCA9IHN1c3RhaW5FbmQgfHwgc2FtcGxlRGF0YS5zdXN0YWluRW5kXG4gICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uID0gcmVsZWFzZUR1cmF0aW9uIHx8IHNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uXG4gICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gcmVsZWFzZUVudmVsb3BlIHx8IHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlXG4gICAgICAgIHNhbXBsZURhdGEucGFuID0gcGFuIHx8IHNhbXBsZURhdGEucGFuXG5cbiAgICAgICAgaWYodHlwZVN0cmluZyhzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSkgPT09ICdhcnJheScpe1xuICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXkgPSBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZVxuICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gJ2FycmF5J1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBkZWxldGUgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVBcnJheVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV1baV0gPSBzYW1wbGVEYXRhXG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV0pXG4gICAgfSlcbiAgfVxuXG5cbiAgLy8gc3RlcmVvIHNwcmVhZFxuICBzZXRLZXlTY2FsaW5nUGFubmluZygpe1xuICAgIC8vIHNldHMgcGFubmluZyBiYXNlZCBvbiB0aGUga2V5IHZhbHVlLCBlLmcuIGhpZ2hlciBub3RlcyBhcmUgcGFubmVkIG1vcmUgdG8gdGhlIHJpZ2h0IGFuZCBsb3dlciBub3RlcyBtb3JlIHRvIHRoZSBsZWZ0XG4gIH1cblxuICBzZXRLZXlTY2FsaW5nUmVsZWFzZSgpe1xuICAgIC8vIHNldCByZWxlYXNlIGJhc2VkIG9uIGtleSB2YWx1ZVxuICB9XG5cbiAgLypcbiAgICBAZHVyYXRpb246IG1pbGxpc2Vjb25kc1xuICAgIEBlbnZlbG9wZTogbGluZWFyIHwgZXF1YWxfcG93ZXIgfCBhcnJheSBvZiBpbnQgdmFsdWVzXG4gICovXG4gIHNldFJlbGVhc2UoZHVyYXRpb246IG51bWJlciwgZW52ZWxvcGUpe1xuICAgIC8vIHNldCByZWxlYXNlIGZvciBhbGwga2V5cywgb3ZlcnJ1bGVzIHZhbHVlcyBzZXQgYnkgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKVxuICAgIHRoaXMuc2FtcGxlc0RhdGEuZm9yRWFjaChmdW5jdGlvbihzYW1wbGVzLCBpZCl7XG4gICAgICBzYW1wbGVzLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlLCBpKXtcbiAgICAgICAgaWYoc2FtcGxlID09PSAtMSl7XG4gICAgICAgICAgc2FtcGxlID0ge1xuICAgICAgICAgICAgaWQ6IGlkXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNhbXBsZS5yZWxlYXNlRHVyYXRpb24gPSBkdXJhdGlvblxuICAgICAgICBzYW1wbGUucmVsZWFzZUVudmVsb3BlID0gZW52ZWxvcGVcbiAgICAgICAgc2FtcGxlc1tpXSA9IHNhbXBsZVxuICAgICAgfSlcbiAgICB9KVxuICAgIC8vY29uc29sZS5sb2coJyVPJywgdGhpcy5zYW1wbGVzRGF0YSlcbiAgfVxufVxuIiwiY29uc3Qgc2FtcGxlcyA9IHtcbiAgZW1wdHlPZ2c6ICdUMmRuVXdBQ0FBQUFBQUFBQUFCZHhkNFhBQUFBQURhUzBqUUJIZ0YyYjNKaWFYTUFBQUFBQVVTc0FBQUFBQUFBZ0xzQUFBQUFBQUM0QVU5bloxTUFBQUFBQUFBQUFBQUFYY1hlRndFQUFBQWFYSytRRHozLy8vLy8vLy8vLy8vLy8vLy9NZ04yYjNKaWFYTXRBQUFBV0dsd2FDNVBjbWNnYkdsaVZtOXlZbWx6SUVrZ01qQXhNREV4TURFZ0tGTmphR0YxWm1WdWRXZG5aWFFwQUFBQUFBRUZkbTl5WW1sekgwSkRWZ0VBQUFFQUdHTlVLVWFaVXRKS2lSbHpsREZHbVdLU1NvbWxoQlpDU0oxekZGT3BPZGVjYTZ5NXRTQ0VFQnBUVUNrRm1WS09VbWtaWTVBcEJabFNFRXRKSlhRU09pZWRZeEJiU2NIV21HdUxRYlljaEEyYVVrd3B4SlJTaWtJSUdWT01LY1dVVWtwQ0J5VjBEanJtSEZPT1NpaEJ1Snh6cTdXV2xtT0xxWFNTU3Vja1pFeENTQ21Ga2tvSHBWTk9Ra2cxbHRaU0tSMXpVbEpxUWVnZ2hCQkN0aUNFRFlMUWtGVUFBQUVBd0VBUUdySUtBRkFBQUJDS29SaUtBb1NHckFJQU1nQUFCS0FvanVJb2ppTTVrbU5KRmhBYXNnb0FBQUlBRUFBQXdIQVVTWkVVeWJFa1M5SXNTOU5FVVZWOTFUWlZWZloxWGRkMVhkZDFJRFJrRlFBQUFRQkFTS2VacFJvZ3dneGtHQWdOV1FVQUlBQUFBRVlvd2hBRFFrTldBUUFBQVFBQVlpZzVpQ2EwNW54empvTm1PV2dxeGVaMGNDTFY1a2x1S3VibW5IUE9PU2ViYzhZNDU1eHppbkptTVdnbXRPYWNjeEtEWmlsb0pyVG1uSE9leE9aQmE2cTA1cHh6eGptbmczRkdHT2VjYzVxMDVrRnFOdGJtbkhNV3RLWTVhaTdGNXB4ekl1WG1TVzB1MWVhY2M4NDU1NXh6empubm5IT3FGNmR6Y0U0NDU1eHpvdmJtV201Q0YrZWNjejRacDN0elFqam5uSFBPT2VlY2M4NDU1NXh6Z3RDUVZRQUFFQUFBUVJnMmhuR25JRWlmbzRFWVJZaHB5S1FIM2FQREpHZ01jZ3FwUjZPamtWTHFJSlJVeGtrcG5TQTBaQlVBQUFnQUFDR0VGRkpJSVlVVVVrZ2hoUlJTaUNHR0dHTElLYWVjZ2dvcXFhU2lpakxLTExQTU1zc3NzOHd5NjdDenpqcnNNTVFRUXd5dHRCSkxUYlhWV0dPdHVlZWNhdzdTV21tdHRkWktLYVdVVWtvcENBMVpCUUNBQUFBUUNCbGtrRUZHSVlVVVVvZ2hwcHh5eWltb29BSkNRMVlCQUlBQUFBSUFBQUE4eVhORVIzUkVSM1JFUjNSRVIzUkV4M004UjVSRVNaUkVTYlJNeTlSTVR4VlYxWlZkVzlabDNmWnRZUmQyM2ZkMTMvZDE0OWVGWVZtV1pWbVdaVm1XWlZtV1pWbVdaVm1DMEpCVkFBQUlBQUNBRUVJSUlZVVVVa2docFJoanpESG5vSk5RUWlBMFpCVUFBQWdBSUFBQUFNQlJITVZ4SkVkeUpNbVNMRW1UTkV1elBNM1RQRTMwUkZFVVRkTlVSVmQwUmQyMFJkbVVUZGQwVGRsMFZWbTFYVm0yYmRuV2JWK1diZC8zZmQvM2ZkLzNmZC8zZmQvM2RSMElEVmtGQUVnQUFPaElqcVJJaXFSSWp1TTRraVFCb1NHckFBQVpBQUFCQUNpS296aU80MGlTSkVtV3BFbWU1Vm1pWm1xbVozcXFxQUtoSWFzQUFFQUFBQUVBQUFBQUFDaWE0aW1tNGltaTRqbWlJMHFpWlZxaXBtcXVLSnV5NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N291RUJxeUNnQ1FBQURRa1J6SmtSeEprUlJKa1J6SkFVSkRWZ0VBTWdBQUFnQndETWVRRk1teExFdlRQTTNUUEUzMFJFLzBURThWWGRFRlFrTldBUUNBQUFBQ0FBQUFBQUF3Sk1OU0xFZHpORW1VVkV1MVZFMjFWRXNWVlU5VlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlUxVGRNMFRTQTBaQ1VBQUFRQXdHS053ZVVnSVNVbDVkNFF3aENUbmpFbUliVmVJUVNSa3Q0eEJoV0RuaktpREhMZVF1TVFneDRJRFZrUkFFUUJBQURHSU1jUWM4ZzVSNm1URWpubnFIU1VHdWNjcFk1U1p5bkZtR0xOS0pYWVVxeU5jNDVTUjYyamxHSXNMWGFVVW8ycHhnSUFBQUljQUFBQ0xJUkNRMVlFQUZFQUFJUXhTQ21rRkdLTU9hZWNRNHdwNTVoemhqSG1ISE9PT2VlZ2RGSXE1NXgwVGtyRUdIT09PYWVjYzFJNko1VnpUa29ub1FBQWdBQUhBSUFBQzZIUWtCVUJRSndBZ0VHU1BFL3lORkdVTkU4VVJWTjBYVkUwWGRmeVBOWDBURk5WUGRGVVZWTlZiZGxVVlZtV1BNODBQZE5VVmM4MFZkVlVWVmsyVlZXV1JWWFZiZE4xZGR0MFZkMldiZHYzWFZzV2RsRlZiZDFVWGRzM1ZkZjJYZG4yZlZuV2RXUHlQRlgxVE5OMVBkTjBaZFYxYlZ0MVhWMzNURk9XVGRlVlpkTjFiZHVWWlYxM1pkbjNOZE4wWGROVlpkbDBYZGwyWlZlM1hWbjJmZE4xaGQrVlpWOVhaVmtZZGwzM2hWdlhsZVYwWGQxWFpWYzNWbG4yZlZ2WGhlSFdkV0daUEU5VlBkTjBYYzgwWFZkMVhWOVhYZGZXTmRPVVpkTjFiZGxVWFZsMlpkbjNYVmZXZGM4MFpkbDBYZHMyWFZlV1hWbjJmVmVXZGQxMFhWOVhaVm40VlZmMmRWblhsZUhXYmVFM1hkZjNWVm4yaFZlV2RlSFdkV0c1ZFYwWVBsWDFmVk4yaGVGMFpkL1hoZDlaYmwwNGx0RjFmV0dWYmVGWVpWazVmdUZZbHQzM2xXVjBYVjlZYmRrWVZsa1dobC80bmVYMmZlTjRkVjBaYnQzbnpMcnZETWZ2cFB2SzA5VnRZNWw5M1ZsbVgzZU80Umc2di9EanFhcXZtNjRyREtjc0M3L3Q2OGF6Kzc2eWpLN3IrNm9zQzc4cTI4S3g2Nzd6L0w2d0xLUHMrc0pxeThLdzJyWXgzTDV1TEw5d0hNdHI2OG94Njc1UnRuVjhYM2dLdy9OMGRWMTVabDNIOW5WMDQwYzRmc29BQUlBQkJ3Q0FBQlBLUUtFaEt3S0FPQUVBanlTSm9tUlpvaWhabGlpS3B1aTZvbWk2cnFScHBxbHBubWxhbW1lYXBtbXFzaW1hcml4cG1tbGFubWFhbXFlWnBtaWFybXVhcHF5S3BpbkxwbXJLc21tYXN1eTZzbTI3cm16Ym9tbktzbW1hc215YXBpeTdzcXZicnV6cXVxUlpwcWw1bm1scW5tZWFwbXJLc21tYXJxdDVubXA2bm1pcW5paXFxbXFxcXEycXFpeGJubWVhbXVpcHBpZUtxbXFxcHEyYXFpckxwcXJhc21tcXRteXFxbTI3cXV6NnNtM3J1bW1xc20ycXBpMmJxbXJicnV6cXNpemJ1aTlwbW1scW5tZWFtdWVacG1tYXNteWFxaXRibnFlYW5paXFxdWFKcG1xcXFpeWJwcXJLbHVlWnFpZUtxdXFKbm11YXFpckxwbXJhcW1tYXRteXFxaTJicGlyTHJtMzd2dXZLc202cXFteWJxbXJycG1yS3Ntekx2dS9LcXU2S3BpbkxwcXJhc21tcXNpM2JzdS9Mc3F6N29tbktzbW1xc20ycXFpN0xzbTBiczJ6N3VtaWFzbTJxcGkyYnFpcmJzaTM3dWl6YnV1L0tybStycXF6cnNpMzd1dTc2cm5EcnVqQzhzbXo3cXF6NnVpdmJ1bS9yTXR2MmZVVFRsR1ZUTlczYlZGVlpkbVhaOW1YYjluM1JORzFiVlZWYk5rM1Z0bVZaOW4xWnRtMWhORTNaTmxWVjFrM1Z0RzFabG0xaHRtWGhkbVhadDJWYjluWFhsWFZmMTMzajEyWGQ1cnF5N2N1eXJmdXFxL3EyN3Z2Q2NPdXU4QW9BQUJod0FBQUlNS0VNRkJxeUVnQ0lBZ0FBakdHTU1RaU5VczQ1QjZGUnlqbm5JR1RPUVFnaGxjdzVDQ0dVa2prSG9aU1VNdWNnbEpKU0NLR1VsRm9MSVpTVVVtc0ZBQUFVT0FBQUJOaWdLYkU0UUtFaEt3R0FWQUFBZytOWWx1ZVpvbXJhc21OSm5pZUtxcW1xdHUxSWx1ZUpvbW1xcW0xYm5pZUtwcW1xcnV2cm11ZUpvbW1xcXV2cXVtaWFwcW1xcnV1NnVpNmFvcW1xcXV1NnNxNmJwcXFxcml1N3N1enJwcXFxcXV2S3Jpejd3cXE2cml2THNtM3J3ckNxcnV2S3NtemJ0bS9jdXE3cnZ1Lzd3cEd0NjdvdS9NSXhERWNCQU9BSkRnQkFCVGFzam5CU05CWllhTWhLQUNBREFJQXdCaUdERUVJR0lZU1FVa29ocFpRU0FBQXc0QUFBRUdCQ0dTZzBaRVVBRUNjQUFCaERLYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpJS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLcWFTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS1pWU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVZ29Ba0lwd0FKQjZNS0VNRkJxeUVnQklCUUFBakZGS0tjYWNneEF4NWhoajBFa29LV0xNT2NZY2xKSlM1UnlFRUZKcExiZktPUWdocE5SU2JabHpVbHFMTWVZWU0rZWtwQlJielRtSFVsS0xzZWFhYSs2a3RGWnJyalhuV2xxck5kZWNjODI1dEJacnJqblhuSFBMTWRlY2M4NDU1eGh6empubm5IUE9CUURnTkRnQWdCN1lzRHJDU2RGWVlLRWhLd0dBVkFBQUFobWxHSFBPT2VnUVVvdzU1eHlFRUNLRkdIUE9PUWdoVkl3NTV4eDBFRUtvR0hQTU9RZ2hoSkE1NXh5RUVFSUlJWE1PT3VnZ2hCQkNCeDJFRUVJSW9aVE9RUWdoaEJCS0tDR0VFRUlJSVlRUU9nZ2hoQkJDQ0NHRUVFSUlJWVJTU2dnaGhCQkNDYUdVVUFBQVlJRURBRUNBRGFzam5CU05CUllhc2hJQUFBSUFnQnlXb0ZMT2hFR09RWThOUWNwUk13MUNURG5SbVdKT2FqTVZVNUE1RUoxMEVobHFRZGxlTWdzQUFJQWdBQ0RBQkJBWUlDajRRZ2lJTVFBQVFZak1FQW1GVmJEQW9Bd2FIT1lCd0FORWhFUUFrSmlnU0x1NGdDNERYTkRGWFFkQ0NFSVFnbGdjUUFFSk9EamhoaWZlOElRYm5LQlRWT29nQUFBQUFBQU1BT0FCQU9DZ0FDSWltcXV3dU1ESTBOamc2UEFJQUFBQUFBQVdBUGdBQURnK2dJaUk1aW9zTGpBeU5EWTRPandDQUFBQUFBQUFBQUNBZ0lBQUFBQUFBRUFBQUFDQWdFOW5aMU1BQkFFQUFBQUFBQUFBWGNYZUZ3SUFBQUJxMm5weEFnRUJBQW89JyxcbiAgZW1wdHlNcDM6ICcvL3NReEFBRHdBQUJwQUFBQUNBQUFEU0FBQUFFVEVGTlJUTXVPVGt1TlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVPScsXG4gIGhpZ2h0aWNrOiAnVWtsR1JrUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlTQUZBQUN4L3hmL2RBRE9BQ3dCc1AzcCs2SCt6QUdvQk9rQ0N3QlgvRUg1T3Z4bEE0a0oyd2NTQXJUOUUvdXQrSFQyZXZVeDk4bjZPQUY1Q0NVTXdRdmZDT3NKeEF4MERTSU1FQXE5QmlBQjN2aHo3bUxrVDlzUjEzM1l4TjJzNVFMdjB2clVCbndSbnh1UUplRXNTRENpTWQ4eUZTOGFLRklob2hVc0NLajY0dTYyNU9yYUE5SHV5UG5FbGNQK3d4dkpXdFcyNTYzN1ZRMGpIUGduQlRERE0xbzBDektMSys4aHpoZ0ZET3o4U2U0SjQ3RFlWdEcwejVmUXE5TEIxMnJmQStqOTlyb0hBaGVsSXlNd0lqZFRPdVU4bWp3SU9Hb3hoQ2I1RTUzL2orM2szL2ZUWThwVHc0eS9UcitldzhETXZkc2s4UmNIUlJrU0tPNHlHVGtIUGtVL3J6enlOY2dzclI5NERwLzVyK1pzMTd6T25jb0R4aGZFMzhXTHluL1RlT01pOXIwSVJ4bFJLSVF6eVRsT1BLbzl5am1XTWNva0RSTGMvWTdydWR0ZHp1L0QyTDFJdSsyN0pjRzN5WXJWTHVqbCszVU9aeDFVSzVRMHF6bU5QRGs4WmplZU1Qb2p6aEgrL2pMdFBkNW0waEhMSHNZSXc1VEVNTW5BMGp2ajhmU09CaXdYQVNaZ016TThkVUJHUWJJK3J6anBLa0laeWdaVDlRZmxjZGFSeXFYQ3o3K1Z3VVBINzg0cjNLN3MrdjBLRHU4YnZ5ZUxNYjQzTmpyaE9JbzBkU3ZRSGkwUG5QNmk3b3ZnM05UeHk0L0dmOFg4eUgvUUJ0dlg1NVAyWWdiMEZjVWpzeTRMTm1JNWVqaVhNMzhyN2lDOEZKd0hQdm9rN2REZ1FkYUp6bFRLSXNvRnpzclZrdUE4N2QvNnFBaTdGUTBoOUNsS01MRXozVE9yTUJjcVlTRDhFOUFGZC9kUzZrVGY2ZGJVMFhuUXY5SUgyTVhmWitsbjlERUFGd3dkRnk4Z2lpYjZLYXdxZUNoZ0kvVWJIQk9UQ1pqL3Z2WGU3SW5sRnVETjNQM2IwZDFGNGd6cGlmRzIrdTREN1F3MUZmd2JuQ0QrSWxnald5SExIUE1Wb2cybUJMMzdxdlArN052bll1VHY0cnZqZnViTjZrM3dwUFowL1drRU93dGlFVXNXY3htK0dsNGFPaGhpRkRBUEl3bWJBdG43VFBWeTc3enFjZWZyNVlIbUh1bGw3ZW55ZlBtY0FIZ0hldzFSRXI4VmhoZC9GK0FWMVJKMERpa0pXUU5jL1pQM2VmS2Q3aHZzMnVyNDZySHM1dThlOU4vNDgvMGhBLzhIRmd3dUQwNFJTQklSRXFzUU9nN21Dc3NHTUFKVy9YbjRHL1RLOExidXp1MEk3cVR2blBKeTlzWDZiUDg0QkxZSWJBd2REODRRWXhHN0VPY09EQXh3Q0ZNRUFRQzkrN1AzU3ZUWDhYSHcrdTlSOEtUeEl2U285K1g3VlFDVUJKMElNd3ppRGo0UUxoQUdEOVVNcmduVEJaY0JSdjF2K1h2MlVmUys4dGZ4K3ZFUzg3ejArdmIzK1pmOVpnRVFCU0VJVUFyV0M4a00yUXl6QzVFSkVBZHZCSGdCWFA1bisrcjRBdmQ4OVdqMDdmTXc5RDMxSnZmcCtVajl4UUQ5QThRRzVRaFhDbEVMckFzdkM5d0o3Z2Q2QldJQzN2Nk8rN1Q0UFBaTjlFSHpXdk5mOVB6MUZ2aXQrcUw5clFDSEF3RUcvd2VDQ1pVS0Z3dkRDbklKY0FjUUJXY0NhZjhaL0NENTV2YUI5ZEQwd1BTUDlVTDNtL2s3L016K0p3RXlBdzhGekFZN0NCc0phUWs1Q1drSTJnYXRCQ0lDWWYrai9GcjZ2ZmlWOTg3MnNmWlA5MXo0cC9sUiszSDl6Zjg5QXJvRUZBZmpDUDBKY3dvOENqQUpkUWRnQlNFRGtnRFEvVmo3WmZuUjk1VDI4ZlVkOXYzMlZ2ZzIrbmI4Ky82eEFXb0U0QWJEQ1A0SnBBcWJDcVFKMHdlRUJmZ0NUQUNUL1IzN00vbSs5NjcySVBZNjlnYjNhZmhXK3RUOHFmK01BajBGZ2djdUNTY0tYQXJpQ2NNSUVBZnlCSllDRndDUC9SejdBL2w3OTN6MkYvWm45bUgzN2ZqZCtpMzl5ZjlwQXQwRUZBZlJDTmtKR0FxckNaWUl2Z1pQQko4QjZQNC8vTTM1MHZkejlxLzFsZlVxOW16M1JQbWkrM0grYmdGVkJPUUczd2dIQ2t3SzBBbTdDQ0FIQ2dXbUFqQUEnLFxuICBsb3d0aWNrOiAnVWtsR1JsUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlUQUZBQUIwLzV2K1UvNFQvM2dBMHdGVEF1VUIrZjhkL25UOTBmMXEvdWIrdGY0Ni9tYi84d0ZRQTlnQzd3Q2QvbXIrRkFHUkEzY0U2d0pmL2gzNmV2bXYrOHYvTndSSEJaVUMyLzYwKy8vNUV2dVovYVgvYmdGT0FwOEF6dnpoOXdmekxQRjY4elQ0eS8yQkF5Z0lmUXdhRWpZWTB4MzFJcndsOFNPV0hWRVNPZ1BoOU5mcFJlRnQyMm5ZSGRkRDJCWGNaZURhNUlucWdQRHg5blArNmdTNENCWUxudzB6RVMwV1h4djRIa2NnTGgvMUcrRVgxUk5wRDR3S2lnWEgvNnI1L2ZOdTdsVHBqK1p1NWhIb1hPdEw3MWJ5ci9RcDkxTDY0djZPQk80Sm9RNXpFc2tVK2hVMUZpUVZlUlA3RVdnUDRRcjBCSVQrdFBpZDlDM3kxdkNoOEZEeEp2SzI4dnZ5eS9MQThwTHpVL1hQOTV2Nnh2dzQvdUQvUkFLMkJTa0tjZzZCRVNjVFpCTWVFcWtQVFF4akNLRUVWd0ZpL252N2gvaHA5YUR5QXZIUDhNZnhMdk0rOVBYMHVQVzE5Zy80TGZyNy9DNEFLZ05hQlhRR3l3YjBCaElIV1FmV0Ixb0l6QWp0Q0Y4SUh3ZHRCYWtEVndLTEFlWUE4djl3L2tqODEvblE5NHYyOS9YWDliejFiUFVZOVV6MVovYUgrSHI3eVA0TUFpNEYrd2NmQ25ZTE5neWZEUHNNU3cwc0RVQU1mZ3JjQjVJRU13RmIvaVg4VC9wVCtPLzFYL01mOGNidnJPKzE4TUx5dmZWUCtSZjl3Z0FvQkNFSHB3bklDNUVONFE1QUQzd08xQXkwQ3BzSXZ3YnZCTmNDYlFBci9uWDhPZnNmK3ZiNG12ZGE5cmoxei9XWDlwTDNhL2hIK1pYNlIvd24vdlAvZVFFU0EvQUUrd1lEQ2N3S0ZBeVBEQ2tNRlF1U0NlNEhWUWJTQkhRREN3SThBTkw5SlB1WStIWDI4dlRxODJQemRQTVY5QXoxTWZaNDl6RDVnZnR4L3NRQkJRWExCOGNKL2dxcEN3OE1pZ3dXRFhFTlhRMnJERFVMN1FnREJzd0NkdjhTL0s3NFdQVms4aFh3b3U0UDdtdnUxKzlUOHB6MVV2bGkvWm9Cd2dXUkNjc01QZy9DRUVRUjRSREFEd29POXd1c0NWTUg0QVJTQXBuL3VmemQrV2ozYnZYNzh4enp4L0w2OHF6ejF2U0Q5cVg0R2Z2ZC9jMEFod08vQld3SG1naHZDUUVLVlFvbkNsc0pDd2lJQmgwRjBnT2dBbTBCT3dBeC8wMytYUDBnL0xiNmNQbVgrRi80dmZoKytUSDZzL29zKzcvN2N2d0wvWno5WFA1Ty8zSUEzQUY5QXpzRjlnYVVDQUFLSGd1ZUN6Y0w5d250QjNzRjR3SXpBSTM5NmZwMStHdjJJdlduOU4zMHAvWGk5bTc0Ry9ydSs5UDlrLzhhQVlFQzFBTVRCU0lHMHdZdUIxZ0hrZ2NBQ0dFSVNBaFRCekVGV0FLdC81TDkyZnVVK3ZYNTBmbWYrU1A1aS9nYitCZjRtdml2K1NyN2t2eWIvVWorci80WC84ci8rZ0NpQW8wRVVBYVJCendJU3dqcUIzSUhHUWZDQnY4RnBnVE1BcFFBS2Y2Nys1bjUvdmZuOWp6MnlQVm45U0wxUlBYcTlTUDNEdm1yKzZmK3NRR0tCQWNIK3doT0NoMExhd3MzQzI4S0xBbURCNUFGZlFOb0FWUC9adjNlKzdQNnNmbkwrQ3Y0dlBlTTk1YjM3ZmVWK0puNTFQb3EvTEw5bXYrWUFWWUQzZ1F1Qm1jSFNBaWtDSUVJN0FmK0J1RUZuZ1FYQTFzQnYvOXYvcGY5TVAzVy9GajhxL3NSKzZINlUvbzMrbVA2eS9wTisvZjd4dnllL1dIK0pmOW1BRDRDUUFRSkJpc0h0Z2Y2QncwSThRZHNCMXNHeXdUNEFnZ0JDUC9vL0tYNm1QZzE5NTcyamZhejl1ZjJTL2NNK0UzNUUvdFcvYWYvNXdIMUE4QUZLZ2ZrQi9BSGd3ZnhCbEFHZ1FWSUJNTUNKd0dzLzQzK3ZQMGkvWnI4TGZ6bCs5SDc2ZnZpKzlmNzVmc2YvSW44QlAxMC9lajljZjRPLzdmL2RBQWNBYVVCRWdLTUFoZ0RwQU1FQkNFRUR3VGZBM0lEeFFMOEFTb0JVd0NHLzg3K0ovNmgvUnI5cFB4ay9HYjhvUHdKL1hIOXcvMzkvVUQrcVA0MS85RC9Xd0RlQUdzQkFnS2RBaEVEUVFOQUEwc0Rid09WQTVZRFZ3UE9BaGdDVkFHUkFBPT0nLFxufVxuXG5leHBvcnQgZGVmYXVsdCBzYW1wbGVzXG4iLCIvKlxuXG5cblRoaXMgY29kZSBpcyBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vc2VyZ2kvanNtaWRpXG5cbmluZm86IGh0dHA6Ly93d3cuZGVsdWdlLmNvLz9xPW1pZGktdGVtcG8tYnBtXG5cbiovXG5cblxuaW1wb3J0IHtzYXZlQXN9IGZyb20gJ2ZpbGVzYXZlcmpzJ1xuXG5sZXQgUFBRID0gOTYwXG5sZXQgSERSX1BQUSA9IHN0cjJCeXRlcyhQUFEudG9TdHJpbmcoMTYpLCAyKVxuXG5jb25zdCBIRFJfQ0hVTktJRCA9IFtcbiAgJ00nLmNoYXJDb2RlQXQoMCksXG4gICdUJy5jaGFyQ29kZUF0KDApLFxuICAnaCcuY2hhckNvZGVBdCgwKSxcbiAgJ2QnLmNoYXJDb2RlQXQoMClcbl1cbmNvbnN0IEhEUl9DSFVOS19TSVpFID0gWzB4MCwgMHgwLCAweDAsIDB4Nl0gLy8gSGVhZGVyIHNpemUgZm9yIFNNRlxuY29uc3QgSERSX1RZUEUwID0gWzB4MCwgMHgwXSAvLyBNaWRpIFR5cGUgMCBpZFxuY29uc3QgSERSX1RZUEUxID0gWzB4MCwgMHgxXSAvLyBNaWRpIFR5cGUgMSBpZFxuLy9IRFJfUFBRID0gWzB4MDEsIDB4RTBdIC8vIERlZmF1bHRzIHRvIDQ4MCB0aWNrcyBwZXIgYmVhdFxuLy9IRFJfUFBRID0gWzB4MDAsIDB4ODBdIC8vIERlZmF1bHRzIHRvIDEyOCB0aWNrcyBwZXIgYmVhdFxuXG5jb25zdCBUUktfQ0hVTktJRCA9IFtcbiAgJ00nLmNoYXJDb2RlQXQoMCksXG4gICdUJy5jaGFyQ29kZUF0KDApLFxuICAncicuY2hhckNvZGVBdCgwKSxcbiAgJ2snLmNoYXJDb2RlQXQoMClcbl1cblxuLy8gTWV0YSBldmVudCBjb2Rlc1xuY29uc3QgTUVUQV9TRVFVRU5DRSA9IDB4MDBcbmNvbnN0IE1FVEFfVEVYVCA9IDB4MDFcbmNvbnN0IE1FVEFfQ09QWVJJR0hUID0gMHgwMlxuY29uc3QgTUVUQV9UUkFDS19OQU1FID0gMHgwM1xuY29uc3QgTUVUQV9JTlNUUlVNRU5UID0gMHgwNFxuY29uc3QgTUVUQV9MWVJJQyA9IDB4MDVcbmNvbnN0IE1FVEFfTUFSS0VSID0gMHgwNlxuY29uc3QgTUVUQV9DVUVfUE9JTlQgPSAweDA3XG5jb25zdCBNRVRBX0NIQU5ORUxfUFJFRklYID0gMHgyMFxuY29uc3QgTUVUQV9FTkRfT0ZfVFJBQ0sgPSAweDJmXG5jb25zdCBNRVRBX1RFTVBPID0gMHg1MVxuY29uc3QgTUVUQV9TTVBURSA9IDB4NTRcbmNvbnN0IE1FVEFfVElNRV9TSUcgPSAweDU4XG5jb25zdCBNRVRBX0tFWV9TSUcgPSAweDU5XG5jb25zdCBNRVRBX1NFUV9FVkVOVCA9IDB4N2ZcblxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUFzTUlESUZpbGUoc29uZywgZmlsZU5hbWUgPSBzb25nLm5hbWUsIHBwcSA9IDk2MCkge1xuXG4gIFBQUSA9IHBwcVxuICBIRFJfUFBRID0gc3RyMkJ5dGVzKFBQUS50b1N0cmluZygxNiksIDIpXG5cbiAgbGV0IGJ5dGVBcnJheSA9IFtdLmNvbmNhdChIRFJfQ0hVTktJRCwgSERSX0NIVU5LX1NJWkUsIEhEUl9UWVBFMSlcbiAgbGV0IHRyYWNrcyA9IHNvbmcuZ2V0VHJhY2tzKClcbiAgbGV0IG51bVRyYWNrcyA9IHRyYWNrcy5sZW5ndGggKyAxXG4gIGxldCBpLCBtYXhpLCB0cmFjaywgbWlkaUZpbGUsIGRlc3RpbmF0aW9uLCBiNjRcbiAgbGV0IGFycmF5QnVmZmVyLCBkYXRhVmlldywgdWludEFycmF5XG5cbiAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdChzdHIyQnl0ZXMobnVtVHJhY2tzLnRvU3RyaW5nKDE2KSwgMiksIEhEUl9QUFEpXG5cbiAgLy9jb25zb2xlLmxvZyhieXRlQXJyYXkpO1xuICBieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHRyYWNrVG9CeXRlcyhzb25nLl90aW1lRXZlbnRzLCBzb25nLl9kdXJhdGlvblRpY2tzLCAndGVtcG8nKSlcblxuICBmb3IoaSA9IDAsIG1heGkgPSB0cmFja3MubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKXtcbiAgICB0cmFjayA9IHRyYWNrc1tpXTtcbiAgICBsZXQgaW5zdHJ1bWVudFxuICAgIGlmKHRyYWNrLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIGluc3RydW1lbnQgPSB0cmFjay5faW5zdHJ1bWVudC5pZFxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIHRyYWNrLl9ldmVudHMubGVuZ3RoLCBpbnN0cnVtZW50KVxuICAgIGJ5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQodHJhY2tUb0J5dGVzKHRyYWNrLl9ldmVudHMsIHNvbmcuX2R1cmF0aW9uVGlja3MsIHRyYWNrLm5hbWUsIGluc3RydW1lbnQpKVxuICAgIC8vYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdCh0cmFja1RvQnl0ZXModHJhY2suX2V2ZW50cywgc29uZy5fbGFzdEV2ZW50Lmlja3MsIHRyYWNrLm5hbWUsIGluc3RydW1lbnQpKVxuICB9XG5cbiAgLy9iNjQgPSBidG9hKGNvZGVzMlN0cihieXRlQXJyYXkpKVxuICAvL3dpbmRvdy5sb2NhdGlvbi5hc3NpZ24oXCJkYXRhOmF1ZGlvL21pZGk7YmFzZTY0LFwiICsgYjY0KVxuICAvL2NvbnNvbGUubG9nKGI2NCkvLyBzZW5kIHRvIHNlcnZlclxuXG4gIG1heGkgPSBieXRlQXJyYXkubGVuZ3RoXG4gIGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG1heGkpXG4gIHVpbnRBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKVxuICBmb3IoaSA9IDA7IGkgPCBtYXhpOyBpKyspe1xuICAgIHVpbnRBcnJheVtpXSA9IGJ5dGVBcnJheVtpXVxuICB9XG4gIG1pZGlGaWxlID0gbmV3IEJsb2IoW3VpbnRBcnJheV0sIHt0eXBlOiAnYXBwbGljYXRpb24veC1taWRpJywgZW5kaW5nczogJ3RyYW5zcGFyZW50J30pXG4gIGZpbGVOYW1lID0gZmlsZU5hbWUucmVwbGFjZSgvXFwubWlkaSQvLCAnJylcbiAgLy9sZXQgcGF0dCA9IC9cXC5taWRbaV17MCwxfSQvXG4gIGxldCBwYXR0ID0gL1xcLm1pZCQvXG4gIGxldCBoYXNFeHRlbnNpb24gPSBwYXR0LnRlc3QoZmlsZU5hbWUpXG4gIGlmKGhhc0V4dGVuc2lvbiA9PT0gZmFsc2Upe1xuICAgIGZpbGVOYW1lICs9ICcubWlkJ1xuICB9XG4gIC8vY29uc29sZS5sb2coZmlsZU5hbWUsIGhhc0V4dGVuc2lvbilcbiAgc2F2ZUFzKG1pZGlGaWxlLCBmaWxlTmFtZSlcbiAgLy93aW5kb3cubG9jYXRpb24uYXNzaWduKHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKG1pZGlGaWxlKSlcbn1cblxuXG5mdW5jdGlvbiB0cmFja1RvQnl0ZXMoZXZlbnRzLCBsYXN0RXZlbnRUaWNrcywgdHJhY2tOYW1lLCBpbnN0cnVtZW50TmFtZSA9ICdubyBpbnN0cnVtZW50Jyl7XG4gIHZhciBsZW5ndGhCeXRlcyxcbiAgICBpLCBtYXhpLCBldmVudCwgc3RhdHVzLFxuICAgIHRyYWNrTGVuZ3RoLCAvLyBudW1iZXIgb2YgYnl0ZXMgaW4gdHJhY2sgY2h1bmtcbiAgICB0aWNrcyA9IDAsXG4gICAgZGVsdGEgPSAwLFxuICAgIHRyYWNrQnl0ZXMgPSBbXTtcblxuICBpZih0cmFja05hbWUpe1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDMpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEodHJhY2tOYW1lLmxlbmd0aCkpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHJpbmdUb051bUFycmF5KHRyYWNrTmFtZSkpO1xuICB9XG5cbiAgaWYoaW5zdHJ1bWVudE5hbWUpe1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDQpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoaW5zdHJ1bWVudE5hbWUubGVuZ3RoKSk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KHN0cmluZ1RvTnVtQXJyYXkoaW5zdHJ1bWVudE5hbWUpKTtcbiAgfVxuXG4gIGZvcihpID0gMCwgbWF4aSA9IGV2ZW50cy5sZW5ndGg7IGkgPCBtYXhpOyBpKyspe1xuICAgIGV2ZW50ID0gZXZlbnRzW2ldO1xuICAgIGRlbHRhID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgICBkZWx0YSA9IGNvbnZlcnRUb1ZMUShkZWx0YSk7XG4gICAgLy9jb25zb2xlLmxvZyhkZWx0YSk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGRlbHRhKTtcbiAgICAvL3RyYWNrQnl0ZXMucHVzaC5hcHBseSh0cmFja0J5dGVzLCBkZWx0YSk7XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMHg4MCB8fCBldmVudC50eXBlID09PSAweDkwKXsgLy8gbm90ZSBvZmYsIG5vdGUgb25cbiAgICAgIC8vc3RhdHVzID0gcGFyc2VJbnQoZXZlbnQudHlwZS50b1N0cmluZygxNikgKyBldmVudC5jaGFubmVsLnRvU3RyaW5nKDE2KSwgMTYpO1xuICAgICAgc3RhdHVzID0gZXZlbnQudHlwZSArIChldmVudC5jaGFubmVsIHx8IDApXG4gICAgICB0cmFja0J5dGVzLnB1c2goc3RhdHVzKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChldmVudC5kYXRhMSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQuZGF0YTIpO1xuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDB4NTEpeyAvLyB0ZW1wb1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4NTEpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4MDMpOy8vIGxlbmd0aFxuICAgICAgLy90cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKDMpKTsvLyBsZW5ndGhcbiAgICAgIHZhciBtaWNyb1NlY29uZHMgPSBNYXRoLnJvdW5kKDYwMDAwMDAwIC8gZXZlbnQuYnBtKTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuYnBtKVxuICAgICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KHN0cjJCeXRlcyhtaWNyb1NlY29uZHMudG9TdHJpbmcoMTYpLCAzKSk7XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMHg1OCl7IC8vIHRpbWUgc2lnbmF0dXJlXG4gICAgICB2YXIgZGVub20gPSBldmVudC5kZW5vbWluYXRvcjtcbiAgICAgIGlmKGRlbm9tID09PSAyKXtcbiAgICAgICAgZGVub20gPSAweDAxO1xuICAgICAgfWVsc2UgaWYoZGVub20gPT09IDQpe1xuICAgICAgICBkZW5vbSA9IDB4MDI7XG4gICAgICB9ZWxzZSBpZihkZW5vbSA9PT0gOCl7XG4gICAgICAgIGRlbm9tID0gMHgwMztcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSAxNil7XG4gICAgICAgIGRlbm9tID0gMHgwNDtcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSAzMil7XG4gICAgICAgIGRlbm9tID0gMHgwNTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVub21pbmF0b3IsIGV2ZW50Lm5vbWluYXRvcilcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDU4KTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDA0KTsvLyBsZW5ndGhcbiAgICAgIC8vdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUSg0KSk7Ly8gbGVuZ3RoXG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChkZW5vbSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goUFBRIC8gZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDA4KTsgLy8gMzJuZCBub3RlcyBwZXIgY3JvdGNoZXRcbiAgICAgIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCBldmVudC5ub21pbmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yLCBkZW5vbSwgUFBRL2V2ZW50Lm5vbWluYXRvcik7XG4gICAgfVxuICAgIC8vIHNldCB0aGUgbmV3IHRpY2tzIHJlZmVyZW5jZVxuICAgIC8vY29uc29sZS5sb2coc3RhdHVzLCBldmVudC50aWNrcywgdGlja3MpO1xuICAgIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIH1cbiAgZGVsdGEgPSBsYXN0RXZlbnRUaWNrcyAtIHRpY2tzO1xuICAvL2NvbnNvbGUubG9nKCdkJywgZGVsdGEsICd0JywgdGlja3MsICdsJywgbGFzdEV2ZW50VGlja3MpO1xuICBkZWx0YSA9IGNvbnZlcnRUb1ZMUShkZWx0YSk7XG4gIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCB0aWNrcywgZGVsdGEpO1xuICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoZGVsdGEpO1xuICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gIHRyYWNrQnl0ZXMucHVzaCgweDJGKTtcbiAgdHJhY2tCeXRlcy5wdXNoKDB4MDApO1xuICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgdHJhY2tCeXRlcyk7XG4gIHRyYWNrTGVuZ3RoID0gdHJhY2tCeXRlcy5sZW5ndGg7XG4gIGxlbmd0aEJ5dGVzID0gc3RyMkJ5dGVzKHRyYWNrTGVuZ3RoLnRvU3RyaW5nKDE2KSwgNCk7XG4gIHJldHVybiBbXS5jb25jYXQoVFJLX0NIVU5LSUQsIGxlbmd0aEJ5dGVzLCB0cmFja0J5dGVzKTtcbn1cblxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5cbi8qXG4gKiBDb252ZXJ0cyBhbiBhcnJheSBvZiBieXRlcyB0byBhIHN0cmluZyBvZiBoZXhhZGVjaW1hbCBjaGFyYWN0ZXJzLiBQcmVwYXJlc1xuICogaXQgdG8gYmUgY29udmVydGVkIGludG8gYSBiYXNlNjQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBieXRlQXJyYXkge0FycmF5fSBhcnJheSBvZiBieXRlcyB0aGF0IHdpbGwgYmUgY29udmVydGVkIHRvIGEgc3RyaW5nXG4gKiBAcmV0dXJucyBoZXhhZGVjaW1hbCBzdHJpbmdcbiAqL1xuXG5mdW5jdGlvbiBjb2RlczJTdHIoYnl0ZUFycmF5KSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGJ5dGVBcnJheSk7XG59XG5cbi8qXG4gKiBDb252ZXJ0cyBhIFN0cmluZyBvZiBoZXhhZGVjaW1hbCB2YWx1ZXMgdG8gYW4gYXJyYXkgb2YgYnl0ZXMuIEl0IGNhbiBhbHNvXG4gKiBhZGQgcmVtYWluaW5nICcwJyBuaWJibGVzIGluIG9yZGVyIHRvIGhhdmUgZW5vdWdoIGJ5dGVzIGluIHRoZSBhcnJheSBhcyB0aGVcbiAqIHxmaW5hbEJ5dGVzfCBwYXJhbWV0ZXIuXG4gKlxuICogQHBhcmFtIHN0ciB7U3RyaW5nfSBzdHJpbmcgb2YgaGV4YWRlY2ltYWwgdmFsdWVzIGUuZy4gJzA5N0I4QSdcbiAqIEBwYXJhbSBmaW5hbEJ5dGVzIHtJbnRlZ2VyfSBPcHRpb25hbC4gVGhlIGRlc2lyZWQgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgdGhlIHJldHVybmVkIGFycmF5IHNob3VsZCBjb250YWluXG4gKiBAcmV0dXJucyBhcnJheSBvZiBuaWJibGVzLlxuICovXG5cbmZ1bmN0aW9uIHN0cjJCeXRlcyhzdHIsIGZpbmFsQnl0ZXMpIHtcbiAgaWYgKGZpbmFsQnl0ZXMpIHtcbiAgICB3aGlsZSAoKHN0ci5sZW5ndGggLyAyKSA8IGZpbmFsQnl0ZXMpIHtcbiAgICAgIHN0ciA9ICcwJyArIHN0cjtcbiAgICB9XG4gIH1cblxuICB2YXIgYnl0ZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHN0ci5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMikge1xuICAgIHZhciBjaGFycyA9IGkgPT09IDAgPyBzdHJbaV0gOiBzdHJbaSAtIDFdICsgc3RyW2ldO1xuICAgIGJ5dGVzLnVuc2hpZnQocGFyc2VJbnQoY2hhcnMsIDE2KSk7XG4gIH1cblxuICByZXR1cm4gYnl0ZXM7XG59XG5cblxuLyoqXG4gKiBUcmFuc2xhdGVzIG51bWJlciBvZiB0aWNrcyB0byBNSURJIHRpbWVzdGFtcCBmb3JtYXQsIHJldHVybmluZyBhbiBhcnJheSBvZlxuICogYnl0ZXMgd2l0aCB0aGUgdGltZSB2YWx1ZXMuIE1pZGkgaGFzIGEgdmVyeSBwYXJ0aWN1bGFyIHRpbWUgdG8gZXhwcmVzcyB0aW1lLFxuICogdGFrZSBhIGdvb2QgbG9vayBhdCB0aGUgc3BlYyBiZWZvcmUgZXZlciB0b3VjaGluZyB0aGlzIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB0aWNrcyB7SW50ZWdlcn0gTnVtYmVyIG9mIHRpY2tzIHRvIGJlIHRyYW5zbGF0ZWRcbiAqIEByZXR1cm5zIEFycmF5IG9mIGJ5dGVzIHRoYXQgZm9ybSB0aGUgTUlESSB0aW1lIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRUb1ZMUSh0aWNrcykge1xuICB2YXIgYnVmZmVyID0gdGlja3MgJiAweDdGO1xuXG4gIHdoaWxlKHRpY2tzID0gdGlja3MgPj4gNykge1xuICAgIGJ1ZmZlciA8PD0gODtcbiAgICBidWZmZXIgfD0gKCh0aWNrcyAmIDB4N0YpIHwgMHg4MCk7XG4gIH1cblxuICB2YXIgYkxpc3QgPSBbXTtcbiAgd2hpbGUodHJ1ZSkge1xuICAgIGJMaXN0LnB1c2goYnVmZmVyICYgMHhmZik7XG5cbiAgICBpZiAoYnVmZmVyICYgMHg4MCkge1xuICAgICAgYnVmZmVyID4+PSA4O1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKHRpY2tzLCBiTGlzdCk7XG4gIHJldHVybiBiTGlzdDtcbn1cblxuXG4vKlxuICogQ29udmVydHMgYSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBBU0NJSSBjaGFyIGNvZGVzIGZvciBldmVyeSBjaGFyYWN0ZXIgb2ZcbiAqIHRoZSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHN0ciB7U3RyaW5nfSBTdHJpbmcgdG8gYmUgY29udmVydGVkXG4gKiBAcmV0dXJucyBhcnJheSB3aXRoIHRoZSBjaGFyY29kZSB2YWx1ZXMgb2YgdGhlIHN0cmluZ1xuICovXG5jb25zdCBBUCA9IEFycmF5LnByb3RvdHlwZVxuZnVuY3Rpb24gc3RyaW5nVG9OdW1BcnJheShzdHIpIHtcbiAgLy8gcmV0dXJuIHN0ci5zcGxpdCgpLmZvckVhY2goY2hhciA9PiB7XG4gIC8vICAgcmV0dXJuIGNoYXIuY2hhckNvZGVBdCgwKVxuICAvLyB9KVxuICByZXR1cm4gQVAubWFwLmNhbGwoc3RyLCBmdW5jdGlvbihjaGFyKSB7XG4gICAgcmV0dXJuIGNoYXIuY2hhckNvZGVBdCgwKVxuICB9KVxufVxuIiwiaW1wb3J0IHtnZXRNSURJT3V0cHV0QnlJZCwgZ2V0TUlESU91dHB1dHN9IGZyb20gJy4vaW5pdF9taWRpJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtidWZmZXJUaW1lfSBmcm9tICcuL3NldHRpbmdzJyAvLyBtaWxsaXNcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJyAvLyBtaWxsaXNcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXJ7XG5cbiAgY29uc3RydWN0b3Ioc29uZyl7XG4gICAgdGhpcy5zb25nID0gc29uZ1xuICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgfVxuXG5cbiAgaW5pdChtaWxsaXMpe1xuICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSBtaWxsaXNcbiAgICB0aGlzLnNvbmdTdGFydE1pbGxpcyA9IG1pbGxpc1xuICAgIHRoaXMuZXZlbnRzID0gdGhpcy5zb25nLl9hbGxFdmVudHNcbiAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aFxuICAgIHRoaXMuaW5kZXggPSAwXG4gICAgdGhpcy5tYXh0aW1lID0gMFxuICAgIHRoaXMucHJldk1heHRpbWUgPSAwXG4gICAgdGhpcy5iZXlvbmRMb29wID0gZmFsc2UgLy8gdGVsbHMgdXMgaWYgdGhlIHBsYXloZWFkIGhhcyBhbHJlYWR5IHBhc3NlZCB0aGUgbG9vcGVkIHNlY3Rpb25cbiAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlXG4gICAgdGhpcy5sb29wZWQgPSBmYWxzZVxuICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gIH1cblxuXG4gIHVwZGF0ZVNvbmcoKXtcbiAgICAvL3RoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSB0aGlzLnNvbmcuX2N1cnJlbnRNaWxsaXNcbiAgICB0aGlzLmV2ZW50cyA9IHRoaXMuc29uZy5fYWxsRXZlbnRzXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLmluZGV4ID0gMFxuICAgIHRoaXMubWF4dGltZSA9IDBcbiAgICAvL3RoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZy5fY3VycmVudE1pbGxpcylcbiAgfVxuXG5cbiAgc2V0VGltZVN0YW1wKHRpbWVTdGFtcCl7XG4gICAgdGhpcy50aW1lU3RhbXAgPSB0aW1lU3RhbXBcbiAgfVxuXG4gIC8vIGdldCB0aGUgaW5kZXggb2YgdGhlIGV2ZW50IHRoYXQgaGFzIGl0cyBtaWxsaXMgdmFsdWUgYXQgb3IgcmlnaHQgYWZ0ZXIgdGhlIHByb3ZpZGVkIG1pbGxpcyB2YWx1ZVxuICBzZXRJbmRleChtaWxsaXMpe1xuICAgIGxldCBpID0gMFxuICAgIGxldCBldmVudFxuICAgIGZvcihldmVudCBvZiB0aGlzLmV2ZW50cyl7XG4gICAgICBpZihldmVudC5taWxsaXMgPj0gbWlsbGlzKXtcbiAgICAgICAgdGhpcy5pbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cblxuICAgIHRoaXMuYmV5b25kTG9vcCA9IG1pbGxpcyA+IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgIC8vIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICAvL3RoaXMubG9vcGVkID0gZmFsc2VcbiAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlXG4gIH1cblxuXG4gIGdldEV2ZW50cygpe1xuICAgIGxldCBldmVudHMgPSBbXVxuXG4gICAgaWYodGhpcy5zb25nLl9sb29wID09PSB0cnVlICYmIHRoaXMuc29uZy5fbG9vcER1cmF0aW9uIDwgYnVmZmVyVGltZSl7XG4gICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdTdGFydE1pbGxpcyArIHRoaXMuc29uZy5fbG9vcER1cmF0aW9uIC0gMVxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLm1heHRpbWUsIHRoaXMuc29uZy5sb29wRHVyYXRpb24pO1xuICAgIH1cblxuICAgIGlmKHRoaXMuc29uZy5fbG9vcCA9PT0gdHJ1ZSl7XG5cbiAgICAgIGlmKHRoaXMubWF4dGltZSA+PSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMgJiYgdGhpcy5iZXlvbmRMb29wID09PSBmYWxzZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ0xPT1AnLCB0aGlzLm1heHRpbWUsIHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcylcblxuICAgICAgICBsZXQgZGlmZiA9IHRoaXMubWF4dGltZSAtIHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmcuX2xlZnRMb2NhdG9yLm1pbGxpcyArIGRpZmZcblxuICAgICAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tTE9PUEVEJywgdGhpcy5tYXh0aW1lLCBkaWZmLCB0aGlzLnNvbmcuX2xlZnRMb2NhdG9yLm1pbGxpcywgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKTtcblxuICAgICAgICBpZih0aGlzLmxvb3BlZCA9PT0gZmFsc2Upe1xuICAgICAgICAgIHRoaXMubG9vcGVkID0gdHJ1ZTtcbiAgICAgICAgICBsZXQgbGVmdE1pbGxpcyA9IHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzXG4gICAgICAgICAgbGV0IHJpZ2h0TWlsbGlzID0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG5cbiAgICAgICAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICAgICAgICBsZXQgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgICAgICBpZihldmVudC5taWxsaXMgPCByaWdodE1pbGxpcyl7XG4gICAgICAgICAgICAgIGV2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzXG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KVxuXG4gICAgICAgICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3Rlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkLCBldmVudC50eXBlKVxuICAgICAgICAgICAgICB0aGlzLmluZGV4KytcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgbm90ZXMtPiBhZGQgYSBuZXcgbm90ZSBvZmYgZXZlbnQgYXQgdGhlIHBvc2l0aW9uIG9mIHRoZSByaWdodCBsb2NhdG9yIChlbmQgb2YgdGhlIGxvb3ApXG4gICAgICAgICAgbGV0IGVuZFRpY2tzID0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IudGlja3MgLSAxXG4gICAgICAgICAgbGV0IGVuZE1pbGxpcyA9IHRoaXMuc29uZy5jYWxjdWxhdGVQb3NpdGlvbih7dHlwZTogJ3RpY2tzJywgdGFyZ2V0OiBlbmRUaWNrcywgcmVzdWx0OiAnbWlsbGlzJ30pLm1pbGxpc1xuXG4gICAgICAgICAgZm9yKGxldCBub3RlIG9mIHRoaXMubm90ZXMudmFsdWVzKCkpe1xuICAgICAgICAgICAgbGV0IG5vdGVPbiA9IG5vdGUubm90ZU9uXG4gICAgICAgICAgICBsZXQgbm90ZU9mZiA9IG5vdGUubm90ZU9mZlxuICAgICAgICAgICAgaWYobm90ZU9mZi5taWxsaXMgPD0gcmlnaHRNaWxsaXMpe1xuICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGV2ZW50ID0gbmV3IE1JRElFdmVudChlbmRUaWNrcywgMTI4LCBub3RlT24uZGF0YTEsIDApXG4gICAgICAgICAgICBldmVudC5taWxsaXMgPSBlbmRNaWxsaXNcbiAgICAgICAgICAgIGV2ZW50Ll9wYXJ0ID0gbm90ZU9uLl9wYXJ0XG4gICAgICAgICAgICBldmVudC5fdHJhY2sgPSBub3RlT24uX3RyYWNrXG4gICAgICAgICAgICBldmVudC5taWRpTm90ZSA9IG5vdGVcbiAgICAgICAgICAgIGV2ZW50Lm1pZGlOb3RlSWQgPSBub3RlLmlkXG4gICAgICAgICAgICBldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpc1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnYWRkZWQnLCBldmVudClcbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgICAgIH1cblxuLypcbiAgICAgICAgICAvLyBzdG9wIG92ZXJmbG93aW5nIGF1ZGlvIHNhbXBsZXNcbiAgICAgICAgICBmb3IoaSBpbiB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzKXtcbiAgICAgICAgICAgIGlmKHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHMuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgICBhdWRpb0V2ZW50ID0gdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50c1tpXTtcbiAgICAgICAgICAgICAgaWYoYXVkaW9FdmVudC5lbmRNaWxsaXMgPiB0aGlzLnNvbmcubG9vcEVuZCl7XG4gICAgICAgICAgICAgICAgYXVkaW9FdmVudC5zdG9wU2FtcGxlKHRoaXMuc29uZy5sb29wRW5kLzEwMDApO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3BwaW5nIGF1ZGlvIGV2ZW50JywgaSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4qL1xuICAgICAgICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICAgICAgICB0aGlzLnNldEluZGV4KGxlZnRNaWxsaXMpXG4gICAgICAgICAgdGhpcy50aW1lU3RhbXAgKz0gdGhpcy5zb25nLl9sb29wRHVyYXRpb25cbiAgICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzIC09IHRoaXMuc29uZy5fbG9vcER1cmF0aW9uXG5cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50cy5sZW5ndGgpXG5cbiAgICAgICAgICAvLyBnZXQgdGhlIGF1ZGlvIGV2ZW50cyB0aGF0IHN0YXJ0IGJlZm9yZSBzb25nLmxvb3BTdGFydFxuICAgICAgICAgIC8vdGhpcy5nZXREYW5nbGluZ0F1ZGlvRXZlbnRzKHRoaXMuc29uZy5sb29wU3RhcnQsIGV2ZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmxvb3BlZCA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZygnc2NoZWR1bGVyJywgdGhpcy5sb29wZWQpXG5cbiAgICAvLyBtYWluIGxvb3BcbiAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBsZXQgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCB0aGlzLm1heHRpbWUpXG4gICAgICBpZihldmVudC5taWxsaXMgPCB0aGlzLm1heHRpbWUpe1xuXG4gICAgICAgIC8vZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG5cbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJyl7XG4gICAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZXZlbnQudGltZSA9ICh0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKVxuICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBldmVudHM7XG4gIH1cblxuXG4gIHVwZGF0ZShkaWZmKXtcbiAgICB2YXIgaSxcbiAgICAgIGV2ZW50LFxuICAgICAgbnVtRXZlbnRzLFxuICAgICAgdHJhY2ssXG4gICAgICBldmVudHNcblxuICAgIHRoaXMucHJldk1heHRpbWUgPSB0aGlzLm1heHRpbWVcblxuICAgIGlmKHRoaXMuc29uZy5wcmVjb3VudGluZyl7XG4gICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyBidWZmZXJUaW1lXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMpXG4gICAgICBldmVudHMgPSB0aGlzLnNvbmcuX21ldHJvbm9tZS5nZXRQcmVjb3VudEV2ZW50cyh0aGlzLm1heHRpbWUpXG5cbiAgICAgIC8vIGlmKGV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAgIC8vICAgY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50cylcbiAgICAgIC8vIH1cblxuICAgICAgaWYodGhpcy5tYXh0aW1lID4gdGhpcy5zb25nLl9tZXRyb25vbWUuZW5kTWlsbGlzICYmIHRoaXMucHJlY291bnRpbmdEb25lID09PSBmYWxzZSl7XG4gICAgICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gdHJ1ZVxuICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX3ByZWNvdW50RHVyYXRpb25cblxuICAgICAgICAvLyBzdGFydCBzY2hlZHVsaW5nIGV2ZW50cyBvZiB0aGUgc29uZyAtPiBhZGQgdGhlIGZpcnN0IGV2ZW50cyBvZiB0aGUgc29uZ1xuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCB0aGlzLnNvbmdDdXJyZW50TWlsbGlzKVxuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIGJ1ZmZlclRpbWVcbiAgICAgICAgZXZlbnRzLnB1c2goLi4udGhpcy5nZXRFdmVudHMoKSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudHMpXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyBidWZmZXJUaW1lXG4gICAgICBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpXG4gICAgICAvL2V2ZW50cyA9IHRoaXMuc29uZy5fZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAgIC8vZXZlbnRzID0gdGhpcy5nZXRFdmVudHMyKHRoaXMubWF4dGltZSwgKHRoaXMudGltZVN0YW1wIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpKVxuICAgICAgLy9jb25zb2xlLmxvZygnZG9uZScsIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMsIGRpZmYsIHRoaXMuaW5kZXgsIGV2ZW50cy5sZW5ndGgpXG4gICAgfVxuXG4gICAgLy8gaWYodGhpcy5zb25nLnVzZU1ldHJvbm9tZSA9PT0gdHJ1ZSl7XG4gICAgLy8gICBsZXQgbWV0cm9ub21lRXZlbnRzID0gdGhpcy5zb25nLl9tZXRyb25vbWUuZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAvLyAgIC8vIGlmKG1ldHJvbm9tZUV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAvLyAgIC8vICAgY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCBtZXRyb25vbWVFdmVudHMpXG4gICAgLy8gICAvLyB9XG4gICAgLy8gICAvLyBtZXRyb25vbWVFdmVudHMuZm9yRWFjaChlID0+IHtcbiAgICAvLyAgIC8vICAgZS50aW1lID0gKHRoaXMudGltZVN0YW1wICsgZS5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgICAvLyAgIC8vIH0pXG4gICAgLy8gICBldmVudHMucHVzaCguLi5tZXRyb25vbWVFdmVudHMpXG4gICAgLy8gfVxuXG4gICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuXG5cbiAgICAvLyBpZihudW1FdmVudHMgPiA1KXtcbiAgICAvLyAgIGNvbnNvbGUubG9nKG51bUV2ZW50cylcbiAgICAvLyB9XG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzLCAnW2RpZmZdJywgdGhpcy5tYXh0aW1lIC0gdGhpcy5wcmV2TWF4dGltZSlcblxuICAgIGZvcihpID0gMDsgaSA8IG51bUV2ZW50czsgaSsrKXtcbiAgICAgIGV2ZW50ID0gZXZlbnRzW2ldXG4gICAgICB0cmFjayA9IGV2ZW50Ll90cmFja1xuICAgICAgLy8gY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCB0aGlzLnByZXZNYXh0aW1lLCBldmVudC5taWxsaXMpXG5cbiAgICAgIC8vIGlmKGV2ZW50Lm1pbGxpcyA+IHRoaXMubWF4dGltZSl7XG4gICAgICAvLyAgIC8vIHNraXAgZXZlbnRzIHRoYXQgd2VyZSBoYXJ2ZXN0IGFjY2lkZW50bHkgd2hpbGUganVtcGluZyB0aGUgcGxheWhlYWQgLT4gc2hvdWxkIGhhcHBlbiB2ZXJ5IHJhcmVseSBpZiBldmVyXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdza2lwJywgZXZlbnQpXG4gICAgICAvLyAgIGNvbnRpbnVlXG4gICAgICAvLyB9XG5cbiAgICAgIGlmKGV2ZW50Ll9wYXJ0ID09PSBudWxsIHx8IHRyYWNrID09PSBudWxsKXtcbiAgICAgICAgY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZihldmVudC5fcGFydC5tdXRlZCA9PT0gdHJ1ZSB8fCB0cmFjay5tdXRlZCA9PT0gdHJ1ZSB8fCBldmVudC5tdXRlZCA9PT0gdHJ1ZSl7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmKChldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTI4KSAmJiB0eXBlb2YgZXZlbnQubWlkaU5vdGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy8gdGhpcyBpcyB1c3VhbGx5IGNhdXNlZCBieSB0aGUgc2FtZSBub3RlIG9uIHRoZSBzYW1lIHRpY2tzIHZhbHVlLCB3aGljaCBpcyBwcm9iYWJseSBhIGJ1ZyBpbiB0aGUgbWlkaSBmaWxlXG4gICAgICAgIC8vY29uc29sZS5pbmZvKCdubyBtaWRpTm90ZUlkJywgZXZlbnQpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICAvLyAvY29uc29sZS5sb2coZXZlbnQudGlja3MsIGV2ZW50LnRpbWUsIGV2ZW50Lm1pbGxpcywgZXZlbnQudHlwZSwgZXZlbnQuX3RyYWNrLm5hbWUpXG5cbiAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfWVsc2V7XG4gICAgICAgIC8vIGNvbnZlcnQgdG8gc2Vjb25kcyBiZWNhdXNlIHRoZSBhdWRpbyBjb250ZXh0IHVzZXMgc2Vjb25kcyBmb3Igc2NoZWR1bGluZ1xuICAgICAgICB0cmFjay5wcm9jZXNzTUlESUV2ZW50KGV2ZW50LCB0cnVlKSAvLyB0cnVlIG1lYW5zOiB1c2UgbGF0ZW5jeSB0byBjb21wZW5zYXRlIHRpbWluZyBmb3IgZXh0ZXJuYWwgTUlESSBkZXZpY2VzLCBzZWUgVHJhY2sucHJvY2Vzc01JRElFdmVudFxuICAgICAgICAvL2NvbnNvbGUubG9nKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwLCBldmVudC50aW1lLCB0aGlzLmluZGV4KVxuICAgICAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgICAgIHRoaXMubm90ZXMuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYodGhpcy5ub3Rlcy5zaXplID4gMCl7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2codGhpcy5ub3RlcylcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuaW5kZXgsIHRoaXMubnVtRXZlbnRzKVxuICAgIC8vcmV0dXJuIHRoaXMuaW5kZXggPj0gMTBcbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLm51bUV2ZW50cyAvLyBsYXN0IGV2ZW50IG9mIHNvbmdcbiAgfVxuXG4vKlxuICB1bnNjaGVkdWxlKCl7XG5cbiAgICBsZXQgbWluID0gdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzXG4gICAgbGV0IG1heCA9IG1pbiArIChidWZmZXJUaW1lICogMTAwMClcblxuICAgIC8vY29uc29sZS5sb2coJ3Jlc2NoZWR1bGUnLCB0aGlzLm5vdGVzLnNpemUpXG4gICAgdGhpcy5ub3Rlcy5mb3JFYWNoKChub3RlLCBpZCkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2cobm90ZSlcbiAgICAgIC8vIGNvbnNvbGUubG9nKG5vdGUubm90ZU9uLm1pbGxpcywgbm90ZS5ub3RlT2ZmLm1pbGxpcywgbWluLCBtYXgpXG5cbiAgICAgIGlmKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJyB8fCBub3RlLnN0YXRlID09PSAncmVtb3ZlZCcpe1xuICAgICAgICAvL3NhbXBsZS51bnNjaGVkdWxlKDAsIHVuc2NoZWR1bGVDYWxsYmFjayk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ05PVEUgSVMgVU5ERUZJTkVEJylcbiAgICAgICAgLy9zYW1wbGUuc3RvcCgwKVxuICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShpZClcbiAgICAgIH1lbHNlIGlmKChub3RlLm5vdGVPbi5taWxsaXMgPj0gbWluIHx8IG5vdGUubm90ZU9mZi5taWxsaXMgPCBtYXgpID09PSBmYWxzZSl7XG4gICAgICAgIC8vc2FtcGxlLnN0b3AoMClcbiAgICAgICAgbGV0IG5vdGVPbiA9IG5vdGUubm90ZU9uXG4gICAgICAgIGxldCBub3RlT2ZmID0gbmV3IE1JRElFdmVudCgwLCAxMjgsIG5vdGVPbi5kYXRhMSwgMClcbiAgICAgICAgbm90ZU9mZi5taWRpTm90ZUlkID0gbm90ZS5pZFxuICAgICAgICBub3RlT2ZmLnRpbWUgPSAwLy9jb250ZXh0LmN1cnJlbnRUaW1lICsgbWluXG4gICAgICAgIG5vdGUuX3RyYWNrLnByb2Nlc3NNSURJRXZlbnQobm90ZU9mZilcbiAgICAgICAgdGhpcy5ub3Rlcy5kZWxldGUoaWQpXG4gICAgICAgIGNvbnNvbGUubG9nKCdTVE9QUElORycsIGlkLCBub3RlLl90cmFjay5uYW1lKVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZygnTk9URVMnLCB0aGlzLm5vdGVzLnNpemUpXG4gICAgLy90aGlzLm5vdGVzLmNsZWFyKClcbiAgfVxuKi9cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIGxldCB0aW1lU3RhbXAgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuICAgIGxldCBvdXRwdXRzID0gZ2V0TUlESU91dHB1dHMoKVxuICAgIG91dHB1dHMuZm9yRWFjaCgob3V0cHV0KSA9PiB7XG4gICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZVN0YW1wKSAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgICB9KVxuICB9XG59XG5cblxuLypcblxuICBnZXRFdmVudHMyKG1heHRpbWUsIHRpbWVzdGFtcCl7XG4gICAgbGV0IGxvb3AgPSB0cnVlXG4gICAgbGV0IGV2ZW50XG4gICAgbGV0IHJlc3VsdCA9IFtdXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnRpbWVFdmVudHNJbmRleCwgdGhpcy5zb25nRXZlbnRzSW5kZXgsIHRoaXMubWV0cm9ub21lRXZlbnRzSW5kZXgpXG4gICAgd2hpbGUobG9vcCl7XG5cbiAgICAgIGxldCBzdG9wID0gZmFsc2VcblxuICAgICAgaWYodGhpcy50aW1lRXZlbnRzSW5kZXggPCB0aGlzLm51bVRpbWVFdmVudHMpe1xuICAgICAgICBldmVudCA9IHRoaXMudGltZUV2ZW50c1t0aGlzLnRpbWVFdmVudHNJbmRleF1cbiAgICAgICAgaWYoZXZlbnQubWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgdGhpcy5taWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGlja1xuICAgICAgICAgIC8vY29uc29sZS5sb2codGhpcy5taWxsaXNQZXJUaWNrKVxuICAgICAgICAgIHRoaXMudGltZUV2ZW50c0luZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3RvcCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZih0aGlzLnNvbmdFdmVudHNJbmRleCA8IHRoaXMubnVtU29uZ0V2ZW50cyl7XG4gICAgICAgIGV2ZW50ID0gdGhpcy5zb25nRXZlbnRzW3RoaXMuc29uZ0V2ZW50c0luZGV4XVxuICAgICAgICBpZihldmVudC50eXBlID09PSAweDJGKXtcbiAgICAgICAgICBsb29wID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGxldCBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGlja1xuICAgICAgICBpZihtaWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZXN0YW1wXG4gICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgICAgICAgdGhpcy5zb25nRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHRoaXMuc29uZy51c2VNZXRyb25vbWUgPT09IHRydWUgJiYgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleCA8IHRoaXMubnVtTWV0cm9ub21lRXZlbnRzKXtcbiAgICAgICAgZXZlbnQgPSB0aGlzLm1ldHJvbm9tZUV2ZW50c1t0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4XVxuICAgICAgICBsZXQgbWlsbGlzID0gZXZlbnQudGlja3MgKiB0aGlzLm1pbGxpc1BlclRpY2tcbiAgICAgICAgaWYobWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgZXZlbnQudGltZSA9IG1pbGxpcyArIHRpbWVzdGFtcFxuICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgICAgICAgIHRoaXMubWV0cm9ub21lRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHN0b3Ape1xuICAgICAgICBsb29wID0gZmFsc2VcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgc29ydEV2ZW50cyhyZXN1bHQpXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cblxuKi9cbiIsIi8vaW1wb3J0IGdtSW5zdHJ1bWVudHMgZnJvbSAnLi9nbV9pbnN0cnVtZW50cydcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRTb25nID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDE2LFxuICBsb3dlc3ROb3RlOiAwLFxuICBoaWdoZXN0Tm90ZTogMTI3LFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIHBsYXliYWNrU3BlZWQ6IDEsXG4gIGF1dG9RdWFudGl6ZTogZmFsc2Vcbn1cblxuZXhwb3J0IGxldCBidWZmZXJUaW1lID0gMjAwXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRCdWZmZXJUaW1lKHRpbWUpe1xuICBidWZmZXJUaW1lID0gdGltZVxufVxuXG4vL3BvcnRlZCBoZWFydGJlYXQgaW5zdHJ1bWVudHM6IGh0dHA6Ly9naXRodWIuY29tL2FidWRhYW4vaGVhcnRiZWF0XG5jb25zdCBoZWFydGJlYXRJbnN0cnVtZW50cyA9IG5ldyBNYXAoW1xuICBbJ2NpdHktcGlhbm8nLCB7XG4gICAgbmFtZTogJ0NpdHkgUGlhbm8gKHBpYW5vKScsXG4gICAgZGVzY3JpcHRpb246ICdDaXR5IFBpYW5vIHVzZXMgc2FtcGxlcyBmcm9tIGEgQmFsZHdpbiBwaWFubywgaXQgaGFzIDQgdmVsb2NpdHkgbGF5ZXJzOiAxIC0gNDgsIDQ5IC0gOTYsIDk3IC0gMTEwIGFuZCAxMTAgLSAxMjcuIEluIHRvdGFsIGl0IHVzZXMgNCAqIDg4ID0gMzUyIHNhbXBsZXMnLFxuICB9XSxcbiAgWydjaXR5LXBpYW5vLWxpZ2h0Jywge1xuICAgIG5hbWU6ICdDaXR5IFBpYW5vIExpZ2h0IChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyBsaWdodCB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyBvbmx5IDEgdmVsb2NpdHkgbGF5ZXIgYW5kIHVzZXMgODggc2FtcGxlcycsXG4gIH1dLFxuICBbJ2NrLWljZXNrYXRlcycsIHtcbiAgICBuYW1lOiAnQ0sgSWNlIFNrYXRlcyAoc3ludGgpJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgRGV0dW5pemVkIHNhbXBsZXMnLFxuICB9XSxcbiAgWydzaGsyLXNxdWFyZXJvb3QnLCB7XG4gICAgbmFtZTogJ1NISyBzcXVhcmVyb290IChzeW50aCknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3Job2RlcycsIHtcbiAgICBuYW1lOiAnUmhvZGVzIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBGcmVlc291bmQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3Job2RlczInLCB7XG4gICAgbmFtZTogJ1Job2RlcyAyIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3RydW1wZXQnLCB7XG4gICAgbmFtZTogJ1RydW1wZXQgKGJyYXNzKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIFNTTyBzYW1wbGVzJyxcbiAgfV0sXG4gIFsndmlvbGluJywge1xuICAgIG5hbWU6ICdWaW9saW4gKHN0cmluZ3MpJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgU1NPIHNhbXBsZXMnLFxuICB9XVxuXSlcbmV4cG9ydCBjb25zdCBnZXRJbnN0cnVtZW50cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBoZWFydGJlYXRJbnN0cnVtZW50c1xufVxuXG4vLyBnbSBzb3VuZHMgZXhwb3J0ZWQgZnJvbSBGbHVpZFN5bnRoIGJ5IEJlbmphbWluIEdsZWl0em1hbjogaHR0cHM6Ly9naXRodWIuY29tL2dsZWl0ei9taWRpLWpzLXNvdW5kZm9udHNcbmNvbnN0IGdtSW5zdHJ1bWVudHMgPSB7XCJhY291c3RpY19ncmFuZF9waWFub1wiOntcIm5hbWVcIjpcIjEgQWNvdXN0aWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJyaWdodF9hY291c3RpY19waWFub1wiOntcIm5hbWVcIjpcIjIgQnJpZ2h0IEFjb3VzdGljIFBpYW5vIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ncmFuZF9waWFub1wiOntcIm5hbWVcIjpcIjMgRWxlY3RyaWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhvbmt5dG9ua19waWFub1wiOntcIm5hbWVcIjpcIjQgSG9ua3ktdG9uayBQaWFubyAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfcGlhbm9fMVwiOntcIm5hbWVcIjpcIjUgRWxlY3RyaWMgUGlhbm8gMSAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfcGlhbm9fMlwiOntcIm5hbWVcIjpcIjYgRWxlY3RyaWMgUGlhbm8gMiAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiaGFycHNpY2hvcmRcIjp7XCJuYW1lXCI6XCI3IEhhcnBzaWNob3JkIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjbGF2aW5ldFwiOntcIm5hbWVcIjpcIjggQ2xhdmluZXQgKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNlbGVzdGFcIjp7XCJuYW1lXCI6XCI5IENlbGVzdGEgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ2xvY2tlbnNwaWVsXCI6e1wibmFtZVwiOlwiMTAgR2xvY2tlbnNwaWVsIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm11c2ljX2JveFwiOntcIm5hbWVcIjpcIjExIE11c2ljIEJveCAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2aWJyYXBob25lXCI6e1wibmFtZVwiOlwiMTIgVmlicmFwaG9uZSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJtYXJpbWJhXCI6e1wibmFtZVwiOlwiMTMgTWFyaW1iYSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ4eWxvcGhvbmVcIjp7XCJuYW1lXCI6XCIxNCBYeWxvcGhvbmUgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidHVidWxhcl9iZWxsc1wiOntcIm5hbWVcIjpcIjE1IFR1YnVsYXIgQmVsbHMgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZHVsY2ltZXJcIjp7XCJuYW1lXCI6XCIxNiBEdWxjaW1lciAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJkcmF3YmFyX29yZ2FuXCI6e1wibmFtZVwiOlwiMTcgRHJhd2JhciBPcmdhbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGVyY3Vzc2l2ZV9vcmdhblwiOntcIm5hbWVcIjpcIjE4IFBlcmN1c3NpdmUgT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJvY2tfb3JnYW5cIjp7XCJuYW1lXCI6XCIxOSBSb2NrIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjaHVyY2hfb3JnYW5cIjp7XCJuYW1lXCI6XCIyMCBDaHVyY2ggT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJlZWRfb3JnYW5cIjp7XCJuYW1lXCI6XCIyMSBSZWVkIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY2NvcmRpb25cIjp7XCJuYW1lXCI6XCIyMiBBY2NvcmRpb24gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhhcm1vbmljYVwiOntcIm5hbWVcIjpcIjIzIEhhcm1vbmljYSAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGFuZ29fYWNjb3JkaW9uXCI6e1wibmFtZVwiOlwiMjQgVGFuZ28gQWNjb3JkaW9uIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY291c3RpY19ndWl0YXJfbnlsb25cIjp7XCJuYW1lXCI6XCIyNSBBY291c3RpYyBHdWl0YXIgKG55bG9uKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFjb3VzdGljX2d1aXRhcl9zdGVlbFwiOntcIm5hbWVcIjpcIjI2IEFjb3VzdGljIEd1aXRhciAoc3RlZWwpIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfZ3VpdGFyX2phenpcIjp7XCJuYW1lXCI6XCIyNyBFbGVjdHJpYyBHdWl0YXIgKGphenopIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfZ3VpdGFyX2NsZWFuXCI6e1wibmFtZVwiOlwiMjggRWxlY3RyaWMgR3VpdGFyIChjbGVhbikgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ndWl0YXJfbXV0ZWRcIjp7XCJuYW1lXCI6XCIyOSBFbGVjdHJpYyBHdWl0YXIgKG11dGVkKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm92ZXJkcml2ZW5fZ3VpdGFyXCI6e1wibmFtZVwiOlwiMzAgT3ZlcmRyaXZlbiBHdWl0YXIgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJkaXN0b3J0aW9uX2d1aXRhclwiOntcIm5hbWVcIjpcIjMxIERpc3RvcnRpb24gR3VpdGFyIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3VpdGFyX2hhcm1vbmljc1wiOntcIm5hbWVcIjpcIjMyIEd1aXRhciBIYXJtb25pY3MgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY291c3RpY19iYXNzXCI6e1wibmFtZVwiOlwiMzMgQWNvdXN0aWMgQmFzcyAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19iYXNzX2ZpbmdlclwiOntcIm5hbWVcIjpcIjM0IEVsZWN0cmljIEJhc3MgKGZpbmdlcikgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfYmFzc19waWNrXCI6e1wibmFtZVwiOlwiMzUgRWxlY3RyaWMgQmFzcyAocGljaykgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnJldGxlc3NfYmFzc1wiOntcIm5hbWVcIjpcIjM2IEZyZXRsZXNzIEJhc3MgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2xhcF9iYXNzXzFcIjp7XCJuYW1lXCI6XCIzNyBTbGFwIEJhc3MgMSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzbGFwX2Jhc3NfMlwiOntcIm5hbWVcIjpcIjM4IFNsYXAgQmFzcyAyIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2Jhc3NfMVwiOntcIm5hbWVcIjpcIjM5IFN5bnRoIEJhc3MgMSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9iYXNzXzJcIjp7XCJuYW1lXCI6XCI0MCBTeW50aCBCYXNzIDIgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidmlvbGluXCI6e1wibmFtZVwiOlwiNDEgVmlvbGluIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInZpb2xhXCI6e1wibmFtZVwiOlwiNDIgVmlvbGEgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2VsbG9cIjp7XCJuYW1lXCI6XCI0MyBDZWxsbyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjb250cmFiYXNzXCI6e1wibmFtZVwiOlwiNDQgQ29udHJhYmFzcyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0cmVtb2xvX3N0cmluZ3NcIjp7XCJuYW1lXCI6XCI0NSBUcmVtb2xvIFN0cmluZ3MgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGl6emljYXRvX3N0cmluZ3NcIjp7XCJuYW1lXCI6XCI0NiBQaXp6aWNhdG8gU3RyaW5ncyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJvcmNoZXN0cmFsX2hhcnBcIjp7XCJuYW1lXCI6XCI0NyBPcmNoZXN0cmFsIEhhcnAgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGltcGFuaVwiOntcIm5hbWVcIjpcIjQ4IFRpbXBhbmkgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RyaW5nX2Vuc2VtYmxlXzFcIjp7XCJuYW1lXCI6XCI0OSBTdHJpbmcgRW5zZW1ibGUgMSAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RyaW5nX2Vuc2VtYmxlXzJcIjp7XCJuYW1lXCI6XCI1MCBTdHJpbmcgRW5zZW1ibGUgMiAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfc3RyaW5nc18xXCI6e1wibmFtZVwiOlwiNTEgU3ludGggU3RyaW5ncyAxIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9zdHJpbmdzXzJcIjp7XCJuYW1lXCI6XCI1MiBTeW50aCBTdHJpbmdzIDIgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNob2lyX2FhaHNcIjp7XCJuYW1lXCI6XCI1MyBDaG9pciBBYWhzIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2b2ljZV9vb2hzXCI6e1wibmFtZVwiOlwiNTQgVm9pY2UgT29ocyAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfY2hvaXJcIjp7XCJuYW1lXCI6XCI1NSBTeW50aCBDaG9pciAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib3JjaGVzdHJhX2hpdFwiOntcIm5hbWVcIjpcIjU2IE9yY2hlc3RyYSBIaXQgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRydW1wZXRcIjp7XCJuYW1lXCI6XCI1NyBUcnVtcGV0IChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0cm9tYm9uZVwiOntcIm5hbWVcIjpcIjU4IFRyb21ib25lIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0dWJhXCI6e1wibmFtZVwiOlwiNTkgVHViYSAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibXV0ZWRfdHJ1bXBldFwiOntcIm5hbWVcIjpcIjYwIE11dGVkIFRydW1wZXQgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZyZW5jaF9ob3JuXCI6e1wibmFtZVwiOlwiNjEgRnJlbmNoIEhvcm4gKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJyYXNzX3NlY3Rpb25cIjp7XCJuYW1lXCI6XCI2MiBCcmFzcyBTZWN0aW9uIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9icmFzc18xXCI6e1wibmFtZVwiOlwiNjMgU3ludGggQnJhc3MgMSAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfYnJhc3NfMlwiOntcIm5hbWVcIjpcIjY0IFN5bnRoIEJyYXNzIDIgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNvcHJhbm9fc2F4XCI6e1wibmFtZVwiOlwiNjUgU29wcmFubyBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWx0b19zYXhcIjp7XCJuYW1lXCI6XCI2NiBBbHRvIFNheCAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0ZW5vcl9zYXhcIjp7XCJuYW1lXCI6XCI2NyBUZW5vciBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFyaXRvbmVfc2F4XCI6e1wibmFtZVwiOlwiNjggQmFyaXRvbmUgU2F4IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9ib2VcIjp7XCJuYW1lXCI6XCI2OSBPYm9lIChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVuZ2xpc2hfaG9yblwiOntcIm5hbWVcIjpcIjcwIEVuZ2xpc2ggSG9ybiAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiYXNzb29uXCI6e1wibmFtZVwiOlwiNzEgQmFzc29vbiAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjbGFyaW5ldFwiOntcIm5hbWVcIjpcIjcyIENsYXJpbmV0IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBpY2NvbG9cIjp7XCJuYW1lXCI6XCI3MyBQaWNjb2xvIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZsdXRlXCI6e1wibmFtZVwiOlwiNzQgRmx1dGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicmVjb3JkZXJcIjp7XCJuYW1lXCI6XCI3NSBSZWNvcmRlciAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYW5fZmx1dGVcIjp7XCJuYW1lXCI6XCI3NiBQYW4gRmx1dGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmxvd25fYm90dGxlXCI6e1wibmFtZVwiOlwiNzcgQmxvd24gQm90dGxlIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNoYWt1aGFjaGlcIjp7XCJuYW1lXCI6XCI3OCBTaGFrdWhhY2hpIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIndoaXN0bGVcIjp7XCJuYW1lXCI6XCI3OSBXaGlzdGxlIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9jYXJpbmFcIjp7XCJuYW1lXCI6XCI4MCBPY2FyaW5hIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfMV9zcXVhcmVcIjp7XCJuYW1lXCI6XCI4MSBMZWFkIDEgKHNxdWFyZSkgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzJfc2F3dG9vdGhcIjp7XCJuYW1lXCI6XCI4MiBMZWFkIDIgKHNhd3Rvb3RoKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfM19jYWxsaW9wZVwiOntcIm5hbWVcIjpcIjgzIExlYWQgMyAoY2FsbGlvcGUpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF80X2NoaWZmXCI6e1wibmFtZVwiOlwiODQgTGVhZCA0IChjaGlmZikgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzVfY2hhcmFuZ1wiOntcIm5hbWVcIjpcIjg1IExlYWQgNSAoY2hhcmFuZykgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzZfdm9pY2VcIjp7XCJuYW1lXCI6XCI4NiBMZWFkIDYgKHZvaWNlKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfN19maWZ0aHNcIjp7XCJuYW1lXCI6XCI4NyBMZWFkIDcgKGZpZnRocykgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzhfYmFzc19fbGVhZFwiOntcIm5hbWVcIjpcIjg4IExlYWQgOCAoYmFzcyArIGxlYWQpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzFfbmV3X2FnZVwiOntcIm5hbWVcIjpcIjg5IFBhZCAxIChuZXcgYWdlKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzJfd2FybVwiOntcIm5hbWVcIjpcIjkwIFBhZCAyICh3YXJtKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzNfcG9seXN5bnRoXCI6e1wibmFtZVwiOlwiOTEgUGFkIDMgKHBvbHlzeW50aCkgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF80X2Nob2lyXCI6e1wibmFtZVwiOlwiOTIgUGFkIDQgKGNob2lyKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzVfYm93ZWRcIjp7XCJuYW1lXCI6XCI5MyBQYWQgNSAoYm93ZWQpIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfNl9tZXRhbGxpY1wiOntcIm5hbWVcIjpcIjk0IFBhZCA2IChtZXRhbGxpYykgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF83X2hhbG9cIjp7XCJuYW1lXCI6XCI5NSBQYWQgNyAoaGFsbykgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF84X3N3ZWVwXCI6e1wibmFtZVwiOlwiOTYgUGFkIDggKHN3ZWVwKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfMV9yYWluXCI6e1wibmFtZVwiOlwiOTcgRlggMSAocmFpbikgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF8yX3NvdW5kdHJhY2tcIjp7XCJuYW1lXCI6XCI5OCBGWCAyIChzb3VuZHRyYWNrKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzNfY3J5c3RhbFwiOntcIm5hbWVcIjpcIjk5IEZYIDMgKGNyeXN0YWwpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNF9hdG1vc3BoZXJlXCI6e1wibmFtZVwiOlwiMTAwIEZYIDQgKGF0bW9zcGhlcmUpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNV9icmlnaHRuZXNzXCI6e1wibmFtZVwiOlwiMTAxIEZYIDUgKGJyaWdodG5lc3MpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNl9nb2JsaW5zXCI6e1wibmFtZVwiOlwiMTAyIEZYIDYgKGdvYmxpbnMpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfN19lY2hvZXNcIjp7XCJuYW1lXCI6XCIxMDMgRlggNyAoZWNob2VzKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4Xzhfc2NpZmlcIjp7XCJuYW1lXCI6XCIxMDQgRlggOCAoc2NpLWZpKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNpdGFyXCI6e1wibmFtZVwiOlwiMTA1IFNpdGFyIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFuam9cIjp7XCJuYW1lXCI6XCIxMDYgQmFuam8gKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzaGFtaXNlblwiOntcIm5hbWVcIjpcIjEwNyBTaGFtaXNlbiAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImtvdG9cIjp7XCJuYW1lXCI6XCIxMDggS290byAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImthbGltYmFcIjp7XCJuYW1lXCI6XCIxMDkgS2FsaW1iYSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJhZ3BpcGVcIjp7XCJuYW1lXCI6XCIxMTAgQmFncGlwZSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZpZGRsZVwiOntcIm5hbWVcIjpcIjExMSBGaWRkbGUgKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzaGFuYWlcIjp7XCJuYW1lXCI6XCIxMTIgU2hhbmFpIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGlua2xlX2JlbGxcIjp7XCJuYW1lXCI6XCIxMTMgVGlua2xlIEJlbGwgKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWdvZ29cIjp7XCJuYW1lXCI6XCIxMTQgQWdvZ28gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RlZWxfZHJ1bXNcIjp7XCJuYW1lXCI6XCIxMTUgU3RlZWwgRHJ1bXMgKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwid29vZGJsb2NrXCI6e1wibmFtZVwiOlwiMTE2IFdvb2RibG9jayAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0YWlrb19kcnVtXCI6e1wibmFtZVwiOlwiMTE3IFRhaWtvIERydW0gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibWVsb2RpY190b21cIjp7XCJuYW1lXCI6XCIxMTggTWVsb2RpYyBUb20gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfZHJ1bVwiOntcIm5hbWVcIjpcIjExOSBTeW50aCBEcnVtIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJldmVyc2VfY3ltYmFsXCI6e1wibmFtZVwiOlwiMTIwIFJldmVyc2UgQ3ltYmFsIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3VpdGFyX2ZyZXRfbm9pc2VcIjp7XCJuYW1lXCI6XCIxMjEgR3VpdGFyIEZyZXQgTm9pc2UgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJicmVhdGhfbm9pc2VcIjp7XCJuYW1lXCI6XCIxMjIgQnJlYXRoIE5vaXNlIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2Vhc2hvcmVcIjp7XCJuYW1lXCI6XCIxMjMgU2Vhc2hvcmUgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiaXJkX3R3ZWV0XCI6e1wibmFtZVwiOlwiMTI0IEJpcmQgVHdlZXQgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0ZWxlcGhvbmVfcmluZ1wiOntcIm5hbWVcIjpcIjEyNSBUZWxlcGhvbmUgUmluZyAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhlbGljb3B0ZXJcIjp7XCJuYW1lXCI6XCIxMjYgSGVsaWNvcHRlciAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFwcGxhdXNlXCI6e1wibmFtZVwiOlwiMTI3IEFwcGxhdXNlIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3Vuc2hvdFwiOntcIm5hbWVcIjpcIjEyOCBHdW5zaG90IChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9fVxubGV0IGdtTWFwID0gbmV3IE1hcCgpXG5PYmplY3Qua2V5cyhnbUluc3RydW1lbnRzKS5mb3JFYWNoKGtleSA9PiB7XG4gIGdtTWFwLnNldChrZXksIGdtSW5zdHJ1bWVudHNba2V5XSlcbn0pXG5leHBvcnQgY29uc3QgZ2V0R01JbnN0cnVtZW50cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBnbU1hcFxufVxuXG5cbmV4cG9ydCBsZXQgbm90ZU5hbWVNb2RlID0gJ3NoYXJwJ1xuZXhwb3J0IGxldCBwaXRjaCA9IDQ0MCIsImltcG9ydCB7SW5zdHJ1bWVudH0gZnJvbSAnLi9pbnN0cnVtZW50J1xuaW1wb3J0IHtTYW1wbGVPc2NpbGxhdG9yfSBmcm9tICcuL3NhbXBsZV9vc2NpbGxhdG9yJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFNpbXBsZVN5bnRoIGV4dGVuZHMgSW5zdHJ1bWVudHtcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyl7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5zYW1wbGVEYXRhID0ge1xuICAgICAgdHlwZSxcbiAgICAgIHJlbGVhc2VEdXJhdGlvbjogMC4yLFxuICAgICAgcmVsZWFzZUVudmVsb3BlOiAnZXF1YWwgcG93ZXInXG4gICAgfVxuICB9XG5cbiAgY3JlYXRlU2FtcGxlKGV2ZW50KXtcbiAgICByZXR1cm4gbmV3IFNhbXBsZU9zY2lsbGF0b3IodGhpcy5zYW1wbGVEYXRhLCBldmVudClcbiAgfVxuXG4gIC8vIHN0ZXJlbyBzcHJlYWRcbiAgc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKXtcbiAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICB9XG5cbiAgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcbiAgfVxuXG4gIC8qXG4gICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAqL1xuICBzZXRSZWxlYXNlKGR1cmF0aW9uOiBudW1iZXIsIGVudmVsb3BlKXtcbiAgICB0aGlzLnNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb25cbiAgICB0aGlzLnNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gZW52ZWxvcGVcbiAgfVxufVxuIiwiLy9AIGZsb3dcblxuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQge3BhcnNlRXZlbnRzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbmltcG9ydCB7Y29udGV4dCwgbWFzdGVyR2FpbiwgdW5sb2NrV2ViQXVkaW99IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi9zY2hlZHVsZXInXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtzb25nRnJvbU1JRElGaWxlLCBzb25nRnJvbU1JRElGaWxlU3luY30gZnJvbSAnLi9zb25nX2Zyb21fbWlkaWZpbGUnXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y2FsY3VsYXRlUG9zaXRpb259IGZyb20gJy4vcG9zaXRpb24nXG5pbXBvcnQge1BsYXloZWFkfSBmcm9tICcuL3BsYXloZWFkJ1xuaW1wb3J0IHtNZXRyb25vbWV9IGZyb20gJy4vbWV0cm9ub21lJ1xuaW1wb3J0IHthZGRFdmVudExpc3RlbmVyLCByZW1vdmVFdmVudExpc3RlbmVyLCBkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5pbXBvcnQge2RlZmF1bHRTb25nfSBmcm9tICcuL3NldHRpbmdzJ1xuaW1wb3J0IHtzYXZlQXNNSURJRmlsZX0gZnJvbSAnLi9zYXZlX21pZGlmaWxlJ1xuaW1wb3J0IHt1cGRhdGUsIF91cGRhdGV9IGZyb20gJy4vc29uZy51cGRhdGUnXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxubGV0IHJlY29yZGluZ0luZGV4ID0gMFxuXG5cbi8qXG50eXBlIHNvbmdTZXR0aW5ncyA9IHtcbiAgbmFtZTogc3RyaW5nLFxuICBwcHE6IG51bWJlcixcbiAgYnBtOiBudW1iZXIsXG4gIGJhcnM6IG51bWJlcixcbiAgbG93ZXN0Tm90ZTogbnVtYmVyLFxuICBoaWdoZXN0Tm90ZTogbnVtYmVyLFxuICBub21pbmF0b3I6IG51bWJlcixcbiAgZGVub21pbmF0b3I6IG51bWJlcixcbiAgcXVhbnRpemVWYWx1ZTogbnVtYmVyLFxuICBmaXhlZExlbmd0aFZhbHVlOiBudW1iZXIsXG4gIHBvc2l0aW9uVHlwZTogc3RyaW5nLFxuICB1c2VNZXRyb25vbWU6IGJvb2xlYW4sXG4gIGF1dG9TaXplOiBib29sZWFuLFxuICBsb29wOiBib29sZWFuLFxuICBwbGF5YmFja1NwZWVkOiBudW1iZXIsXG4gIGF1dG9RdWFudGl6ZTogYm9vbGVhbixcbn1cbiovXG5cbi8qXG4gIC8vIGluaXRpYWxpemUgc29uZyB3aXRoIHRyYWNrcyBhbmQgcGFydCBzbyB5b3UgZG8gbm90IGhhdmUgdG8gY3JlYXRlIHRoZW0gc2VwYXJhdGVseVxuICBzZXR1cDoge1xuICAgIHRpbWVFdmVudHM6IFtdXG4gICAgdHJhY2tzOiBbXG4gICAgICBwYXJ0cyBbXVxuICAgIF1cbiAgfVxuKi9cblxuZXhwb3J0IGNsYXNzIFNvbmd7XG5cbiAgc3RhdGljIGZyb21NSURJRmlsZShkYXRhKXtcbiAgICByZXR1cm4gc29uZ0Zyb21NSURJRmlsZShkYXRhKVxuICB9XG5cbiAgc3RhdGljIGZyb21NSURJRmlsZVN5bmMoZGF0YSl7XG4gICAgcmV0dXJuIHNvbmdGcm9tTUlESUZpbGVTeW5jKGRhdGEpXG4gIH1cblxuICBjb25zdHJ1Y3RvcihzZXR0aW5nczoge30gPSB7fSl7XG5cbiAgICB0aGlzLmlkID0gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV8ke2luc3RhbmNlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gO1xuXG4gICAgKHtcbiAgICAgIG5hbWU6IHRoaXMubmFtZSA9IHRoaXMuaWQsXG4gICAgICBwcHE6IHRoaXMucHBxID0gZGVmYXVsdFNvbmcucHBxLFxuICAgICAgYnBtOiB0aGlzLmJwbSA9IGRlZmF1bHRTb25nLmJwbSxcbiAgICAgIGJhcnM6IHRoaXMuYmFycyA9IGRlZmF1bHRTb25nLmJhcnMsXG4gICAgICBub21pbmF0b3I6IHRoaXMubm9taW5hdG9yID0gZGVmYXVsdFNvbmcubm9taW5hdG9yLFxuICAgICAgZGVub21pbmF0b3I6IHRoaXMuZGVub21pbmF0b3IgPSBkZWZhdWx0U29uZy5kZW5vbWluYXRvcixcbiAgICAgIHF1YW50aXplVmFsdWU6IHRoaXMucXVhbnRpemVWYWx1ZSA9IGRlZmF1bHRTb25nLnF1YW50aXplVmFsdWUsXG4gICAgICBmaXhlZExlbmd0aFZhbHVlOiB0aGlzLmZpeGVkTGVuZ3RoVmFsdWUgPSBkZWZhdWx0U29uZy5maXhlZExlbmd0aFZhbHVlLFxuICAgICAgdXNlTWV0cm9ub21lOiB0aGlzLnVzZU1ldHJvbm9tZSA9IGRlZmF1bHRTb25nLnVzZU1ldHJvbm9tZSxcbiAgICAgIGF1dG9TaXplOiB0aGlzLmF1dG9TaXplID0gZGVmYXVsdFNvbmcuYXV0b1NpemUsXG4gICAgICBwbGF5YmFja1NwZWVkOiB0aGlzLnBsYXliYWNrU3BlZWQgPSBkZWZhdWx0U29uZy5wbGF5YmFja1NwZWVkLFxuICAgICAgYXV0b1F1YW50aXplOiB0aGlzLmF1dG9RdWFudGl6ZSA9IGRlZmF1bHRTb25nLmF1dG9RdWFudGl6ZSxcbiAgICB9ID0gc2V0dGluZ3MpO1xuXG4gICAgdGhpcy5fdGltZUV2ZW50cyA9IFtcbiAgICAgIG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuVEVNUE8sIHRoaXMuYnBtKSxcbiAgICAgIG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUsIHRoaXMubm9taW5hdG9yLCB0aGlzLmRlbm9taW5hdG9yKSxcbiAgICBdXG5cbiAgICAvL3RoaXMuX3RpbWVFdmVudHMgPSBbXVxuICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlXG4gICAgdGhpcy5fbGFzdEV2ZW50ID0gbmV3IE1JRElFdmVudCgwLCBNSURJRXZlbnRUeXBlcy5FTkRfT0ZfVFJBQ0spXG5cbiAgICB0aGlzLl90cmFja3MgPSBbXVxuICAgIHRoaXMuX3RyYWNrc0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX3BhcnRzID0gW11cbiAgICB0aGlzLl9wYXJ0c0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fYWxsRXZlbnRzID0gW10gLy8gTUlESSBldmVudHMgYW5kIG1ldHJvbm9tZSBldmVudHNcblxuICAgIHRoaXMuX25vdGVzID0gW11cbiAgICB0aGlzLl9ub3Rlc0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX25ld0V2ZW50cyA9IFtdXG4gICAgdGhpcy5fbW92ZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuX3RyYW5zcG9zZWRFdmVudHMgPSBbXVxuXG4gICAgdGhpcy5fbmV3UGFydHMgPSBbXVxuICAgIHRoaXMuX2NoYW5nZWRQYXJ0cyA9IFtdXG4gICAgdGhpcy5fcmVtb3ZlZFBhcnRzID0gW11cblxuICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSAwXG4gICAgdGhpcy5fc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcih0aGlzKVxuICAgIHRoaXMuX3BsYXloZWFkID0gbmV3IFBsYXloZWFkKHRoaXMpXG5cbiAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZVxuICAgIHRoaXMucGF1c2VkID0gZmFsc2VcbiAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlXG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZVxuICAgIHRoaXMubG9vcGluZyA9IGZhbHNlXG5cbiAgICB0aGlzLnZvbHVtZSA9IDAuNVxuICAgIHRoaXMuX291dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5fb3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuX291dHB1dC5jb25uZWN0KG1hc3RlckdhaW4pXG5cbiAgICB0aGlzLl9tZXRyb25vbWUgPSBuZXcgTWV0cm9ub21lKHRoaXMpXG4gICAgdGhpcy5fbWV0cm9ub21lRXZlbnRzID0gW11cbiAgICB0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlXG4gICAgdGhpcy5fbWV0cm9ub21lLm11dGUoIXRoaXMudXNlTWV0cm9ub21lKVxuXG4gICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IGZhbHNlXG4gICAgdGhpcy5fbG9vcER1cmF0aW9uID0gMFxuICAgIHRoaXMuX3ByZWNvdW50QmFycyA9IDBcbiAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cblxuICBhZGRUaW1lRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgLy9AVE9ETzogZmlsdGVyIHRpbWUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2sgLT4gdXNlIHRoZSBsYXN0bHkgYWRkZWQgZXZlbnRzXG4gICAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUpe1xuICAgICAgICB0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlXG4gICAgICB9XG4gICAgICB0aGlzLl90aW1lRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgfSlcbiAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICB9XG5cbiAgYWRkVHJhY2tzKC4uLnRyYWNrcyl7XG4gICAgdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICB0cmFjay5fc29uZyA9IHRoaXNcbiAgICAgIHRyYWNrLmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgICAgdGhpcy5fdHJhY2tzLnB1c2godHJhY2spXG4gICAgICB0aGlzLl90cmFja3NCeUlkLnNldCh0cmFjay5pZCwgdHJhY2spXG4gICAgICB0aGlzLl9uZXdFdmVudHMucHVzaCguLi50cmFjay5fZXZlbnRzKVxuICAgICAgdGhpcy5fbmV3UGFydHMucHVzaCguLi50cmFjay5fcGFydHMpXG4gICAgfSlcbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIHVwZGF0ZS5jYWxsKHRoaXMpXG4gIH1cblxuICBwbGF5KHR5cGUsIC4uLmFyZ3MpOiB2b2lke1xuICAgIC8vdW5sb2NrV2ViQXVkaW8oKVxuICAgIHRoaXMuX3BsYXkodHlwZSwgLi4uYXJncylcbiAgICBpZih0aGlzLl9wcmVjb3VudEJhcnMgPiAwKXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwcmVjb3VudGluZycsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgIH1lbHNlIGlmKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID09PSB0cnVlKXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdGFydF9yZWNvcmRpbmcnLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzfSlcbiAgICB9ZWxzZXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgfVxuICB9XG5cbiAgX3BsYXkodHlwZSwgLi4uYXJncyl7XG4gICAgaWYodHlwZW9mIHR5cGUgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24odHlwZSwgLi4uYXJncylcbiAgICB9XG4gICAgaWYodGhpcy5wbGF5aW5nKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vY29uc29sZS5sb2codGhpcy5fY3VycmVudE1pbGxpcylcblxuICAgIHRoaXMuX3JlZmVyZW5jZSA9IHRoaXMuX3RpbWVTdGFtcCA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgdGhpcy5fc2NoZWR1bGVyLnNldFRpbWVTdGFtcCh0aGlzLl9yZWZlcmVuY2UpXG4gICAgdGhpcy5fc3RhcnRNaWxsaXMgPSB0aGlzLl9jdXJyZW50TWlsbGlzXG5cbiAgICBpZih0aGlzLl9wcmVjb3VudEJhcnMgPiAwICYmIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nKXtcblxuICAgICAgLy8gY3JlYXRlIHByZWNvdW50IGV2ZW50cywgdGhlIHBsYXloZWFkIHdpbGwgYmUgbW92ZWQgdG8gdGhlIGZpcnN0IGJlYXQgb2YgdGhlIGN1cnJlbnQgYmFyXG4gICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uKClcbiAgICAgIHRoaXMuX21ldHJvbm9tZS5jcmVhdGVQcmVjb3VudEV2ZW50cyhwb3NpdGlvbi5iYXIsIHBvc2l0aW9uLmJhciArIHRoaXMuX3ByZWNvdW50QmFycywgdGhpcy5fcmVmZXJlbmNlKVxuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKCdiYXJzYmVhdHMnLCBbcG9zaXRpb24uYmFyXSwgJ21pbGxpcycpLm1pbGxpc1xuICAgICAgdGhpcy5fcHJlY291bnREdXJhdGlvbiA9IHRoaXMuX21ldHJvbm9tZS5wcmVjb3VudER1cmF0aW9uXG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgKyB0aGlzLl9wcmVjb3VudER1cmF0aW9uXG5cbiAgICAgIC8vIGNvbnNvbGUuZ3JvdXAoJ3ByZWNvdW50JylcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdwb3NpdGlvbicsIHRoaXMuZ2V0UG9zaXRpb24oKSlcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdfY3VycmVudE1pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgICAvLyBjb25zb2xlLmxvZygnZW5kUHJlY291bnRNaWxsaXMnLCB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcylcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdfcHJlY291bnREdXJhdGlvbicsIHRoaXMuX3ByZWNvdW50RHVyYXRpb24pXG4gICAgICAvLyBjb25zb2xlLmdyb3VwRW5kKCdwcmVjb3VudCcpXG4gICAgICAvL2NvbnNvbGUubG9nKCdwcmVjb3VudER1cmF0aW9uJywgdGhpcy5fbWV0cm9ub21lLmNyZWF0ZVByZWNvdW50RXZlbnRzKHRoaXMuX3ByZWNvdW50QmFycywgdGhpcy5fcmVmZXJlbmNlKSlcbiAgICAgIHRoaXMucHJlY291bnRpbmcgPSB0cnVlXG4gICAgfWVsc2Uge1xuICAgICAgdGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPSAwXG4gICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlXG4gICAgICB0aGlzLnJlY29yZGluZyA9IHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nXG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fZW5kUHJlY291bnRNaWxsaXMpXG5cbiAgICBpZih0aGlzLnBhdXNlZCl7XG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgIHRoaXMuX3NjaGVkdWxlci5pbml0KHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgdGhpcy5fbG9vcCA9IHRoaXMubG9vcGluZyAmJiB0aGlzLl9jdXJyZW50TWlsbGlzIDw9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXNcbiAgICB0aGlzLl9wdWxzZSgpXG4gIH1cblxuICBfcHVsc2UoKTogdm9pZHtcbiAgICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlICYmIHRoaXMucHJlY291bnRpbmcgPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmKHRoaXMuX3BlcmZvcm1VcGRhdGUgPT09IHRydWUpe1xuICAgICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSA9IGZhbHNlXG4gICAgICAvL2NvbnNvbGUubG9nKCdwdWxzZSB1cGRhdGUnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgICAgX3VwZGF0ZS5jYWxsKHRoaXMpXG4gICAgfVxuXG4gICAgbGV0IG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgbGV0IGRpZmYgPSBub3cgLSB0aGlzLl9yZWZlcmVuY2VcbiAgICB0aGlzLl9jdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICB0aGlzLl9yZWZlcmVuY2UgPSBub3dcblxuICAgIGlmKHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID4gMCl7XG4gICAgICBpZih0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA+IHRoaXMuX2N1cnJlbnRNaWxsaXMpe1xuICAgICAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKGRpZmYpXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9wdWxzZS5iaW5kKHRoaXMpKVxuICAgICAgICAvL3JldHVybiBiZWNhdXNlIGR1cmluZyBwcmVjb3VudGluZyBvbmx5IHByZWNvdW50IG1ldHJvbm9tZSBldmVudHMgZ2V0IHNjaGVkdWxlZFxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPSAwXG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzIC09IHRoaXMuX3ByZWNvdW50RHVyYXRpb25cbiAgICAgIGlmKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nKXtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLnJlY29yZGluZyA9IHRydWVcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlXG4gICAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fc3RhcnRNaWxsaXN9KVxuICAgICAgICAvL2Rpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYodGhpcy5fbG9vcCAmJiB0aGlzLl9jdXJyZW50TWlsbGlzID49IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMpe1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyAtPSB0aGlzLl9sb29wRHVyYXRpb25cbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIC8vdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9sZWZ0TG9jYXRvci5taWxsaXMpIC8vIHBsYXloZWFkIGlzIGEgYml0IGFoZWFkIG9ubHkgZHVyaW5nIHRoaXMgZnJhbWVcbiAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICB0eXBlOiAnbG9vcCcsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9wbGF5aGVhZC51cGRhdGUoJ21pbGxpcycsIGRpZmYpXG4gICAgfVxuXG4gICAgdGhpcy5fdGlja3MgPSB0aGlzLl9wbGF5aGVhZC5nZXQoKS50aWNrc1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzLCB0aGlzLl9kdXJhdGlvbk1pbGxpcylcblxuICAgIGlmKHRoaXMuX2N1cnJlbnRNaWxsaXMgPj0gdGhpcy5fZHVyYXRpb25NaWxsaXMpe1xuICAgICAgaWYodGhpcy5yZWNvcmRpbmcgIT09IHRydWUgfHwgdGhpcy5hdXRvU2l6ZSAhPT0gdHJ1ZSl7XG4gICAgICAgIHRoaXMuc3RvcCgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgLy8gYWRkIGFuIGV4dHJhIGJhciB0byB0aGUgc2l6ZSBvZiB0aGlzIHNvbmdcbiAgICAgIGxldCBldmVudHMgPSB0aGlzLl9tZXRyb25vbWUuYWRkRXZlbnRzKHRoaXMuYmFycywgdGhpcy5iYXJzICsgMSlcbiAgICAgIGxldCB0b2JlUGFyc2VkID0gWy4uLmV2ZW50cywgLi4udGhpcy5fdGltZUV2ZW50c11cbiAgICAgIHNvcnRFdmVudHModG9iZVBhcnNlZClcbiAgICAgIHBhcnNlRXZlbnRzKHRvYmVQYXJzZWQpXG4gICAgICB0aGlzLl9zY2hlZHVsZXIuZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdGhpcy5fc2NoZWR1bGVyLm51bUV2ZW50cyArPSBldmVudHMubGVuZ3RoXG4gICAgICBsZXQgbGFzdEV2ZW50ID0gZXZlbnRzW2V2ZW50cy5sZW5ndGggLSAxXVxuICAgICAgbGV0IGV4dHJhTWlsbGlzID0gbGFzdEV2ZW50LnRpY2tzUGVyQmFyICogbGFzdEV2ZW50Lm1pbGxpc1BlclRpY2tcbiAgICAgIHRoaXMuX2xhc3RFdmVudC50aWNrcyArPSBsYXN0RXZlbnQudGlja3NQZXJCYXJcbiAgICAgIHRoaXMuX2xhc3RFdmVudC5taWxsaXMgKz0gZXh0cmFNaWxsaXNcbiAgICAgIHRoaXMuX2R1cmF0aW9uTWlsbGlzICs9IGV4dHJhTWlsbGlzXG4gICAgICB0aGlzLmJhcnMrK1xuICAgICAgdGhpcy5fcmVzaXplZCA9IHRydWVcbiAgICAgIC8vY29uc29sZS5sb2coJ2xlbmd0aCcsIHRoaXMuX2xhc3RFdmVudC50aWNrcywgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcywgdGhpcy5iYXJzLCBsYXN0RXZlbnQpXG4gICAgfVxuXG4gICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZShkaWZmKVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3B1bHNlLmJpbmQodGhpcykpXG4gIH1cblxuICBwYXVzZSgpOiB2b2lke1xuICAgIHRoaXMucGF1c2VkID0gIXRoaXMucGF1c2VkXG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgaWYodGhpcy5wYXVzZWQpe1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BhdXNlJywgZGF0YTogdGhpcy5wYXVzZWR9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5wbGF5KClcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwYXVzZScsIGRhdGE6IHRoaXMucGF1c2VkfSlcbiAgICB9XG4gIH1cblxuICBzdG9wKCk6IHZvaWR7XG4gICAgLy9jb25zb2xlLmxvZygnU1RPUCcpXG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgaWYodGhpcy5wbGF5aW5nIHx8IHRoaXMucGF1c2VkKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgfVxuICAgIGlmKHRoaXMuX2N1cnJlbnRNaWxsaXMgIT09IDApe1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIGlmKHRoaXMucmVjb3JkaW5nKXtcbiAgICAgICAgdGhpcy5zdG9wUmVjb3JkaW5nKClcbiAgICAgIH1cbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdG9wJ30pXG4gICAgfVxuICB9XG5cbiAgc3RhcnRSZWNvcmRpbmcoKXtcbiAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fcmVjb3JkSWQgPSBgcmVjb3JkaW5nXyR7cmVjb3JkaW5nSW5kZXgrK30ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5fc3RhcnRSZWNvcmRpbmcodGhpcy5fcmVjb3JkSWQpXG4gICAgfSlcbiAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IHRydWVcbiAgfVxuXG4gIHN0b3BSZWNvcmRpbmcoKXtcbiAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIHRyYWNrLl9zdG9wUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID0gZmFsc2VcbiAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlXG4gICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3N0b3BfcmVjb3JkaW5nJ30pXG4gIH1cblxuICB1bmRvUmVjb3JkaW5nKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2sudW5kb1JlY29yZGluZyh0aGlzLl9yZWNvcmRJZClcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHJlZG9SZWNvcmRpbmcoKXtcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5yZWRvUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICB9XG5cbiAgc2V0TWV0cm9ub21lKGZsYWcpe1xuICAgIGlmKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9ICF0aGlzLnVzZU1ldHJvbm9tZVxuICAgIH1lbHNle1xuICAgICAgdGhpcy51c2VNZXRyb25vbWUgPSBmbGFnXG4gICAgfVxuICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKCF0aGlzLnVzZU1ldHJvbm9tZSlcbiAgfVxuXG4gIGNvbmZpZ3VyZU1ldHJvbm9tZShjb25maWcpe1xuICAgIHRoaXMuX21ldHJvbm9tZS5jb25maWd1cmUoY29uZmlnKVxuICB9XG5cbiAgY29uZmlndXJlKGNvbmZpZyl7XG5cbiAgfVxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICB0cmFjay5hbGxOb3Rlc09mZigpXG4gICAgfSlcblxuICAgIHRoaXMuX3NjaGVkdWxlci5hbGxOb3Rlc09mZigpXG4gICAgdGhpcy5fbWV0cm9ub21lLmFsbE5vdGVzT2ZmKClcbiAgfVxuXG4gIHBhbmljKCl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICAgIHRyYWNrLmRpc2Nvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgICAgfSlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl90cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHtcbiAgICAgICAgICB0cmFjay5jb25uZWN0KHRoaXMuX291dHB1dClcbiAgICAgICAgfSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9LCAxMDApXG4gICAgfSlcbiAgfVxuXG4gIGdldFRyYWNrcygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fdHJhY2tzXVxuICB9XG5cbiAgZ2V0UGFydHMoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX3BhcnRzXVxuICB9XG5cbiAgZ2V0RXZlbnRzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ldmVudHNdXG4gIH1cblxuICBnZXROb3Rlcygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fbm90ZXNdXG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbihhcmdzKXtcbiAgICByZXR1cm4gY2FsY3VsYXRlUG9zaXRpb24odGhpcywgYXJncylcbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0UG9zaXRpb24odHlwZSwgLi4uYXJncyl7XG5cbiAgICBsZXQgd2FzUGxheWluZyA9IHRoaXMucGxheWluZ1xuICAgIGlmKHRoaXMucGxheWluZyl7XG4gICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgfVxuXG4gICAgbGV0IHBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpXG4gICAgLy9sZXQgbWlsbGlzID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ21pbGxpcycpXG4gICAgaWYocG9zaXRpb24gPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSBwb3NpdGlvbi5taWxsaXNcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2N1cnJlbnRNaWxsaXMpXG5cbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICBkYXRhOiBwb3NpdGlvblxuICAgIH0pXG5cbiAgICBpZih3YXNQbGF5aW5nKXtcbiAgICAgIHRoaXMuX3BsYXkoKVxuICAgIH1lbHNle1xuICAgICAgLy9AdG9kbzogZ2V0IHRoaXMgaW5mb3JtYXRpb24gZnJvbSBsZXQgJ3Bvc2l0aW9uJyAtPiB3ZSBoYXZlIGp1c3QgY2FsY3VsYXRlZCB0aGUgcG9zaXRpb25cbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZygnc2V0UG9zaXRpb24nLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICB9XG5cbiAgZ2V0UG9zaXRpb24oKXtcbiAgICByZXR1cm4gdGhpcy5fcGxheWhlYWQuZ2V0KCkucG9zaXRpb25cbiAgfVxuXG4gIGdldFBsYXloZWFkKCl7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXloZWFkLmdldCgpXG4gIH1cblxuICAvLyBAYXJncyAtPiBzZWUgX2NhbGN1bGF0ZVBvc2l0aW9uXG4gIHNldExlZnRMb2NhdG9yKHR5cGUsIC4uLmFyZ3Mpe1xuICAgIHRoaXMuX2xlZnRMb2NhdG9yID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpXG5cbiAgICBpZih0aGlzLl9sZWZ0TG9jYXRvciA9PT0gZmFsc2Upe1xuICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIHBvc2l0aW9uIGZvciBsb2NhdG9yJylcbiAgICAgIHRoaXMuX2xlZnRMb2NhdG9yID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICAvLyBAYXJncyAtPiBzZWUgX2NhbGN1bGF0ZVBvc2l0aW9uXG4gIHNldFJpZ2h0TG9jYXRvcih0eXBlLCAuLi5hcmdzKXtcbiAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJylcblxuICAgIGlmKHRoaXMuX3JpZ2h0TG9jYXRvciA9PT0gZmFsc2Upe1xuICAgICAgdGhpcy5fcmlnaHRMb2NhdG9yID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcG9zaXRpb24gZm9yIGxvY2F0b3InKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgc2V0TG9vcChmbGFnID0gbnVsbCl7XG5cbiAgICB0aGlzLmxvb3BpbmcgPSBmbGFnICE9PSBudWxsID8gZmxhZyA6ICF0aGlzLl9sb29wXG5cbiAgICBpZih0aGlzLl9yaWdodExvY2F0b3IgPT09IGZhbHNlIHx8IHRoaXMuX2xlZnRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IHRydWVcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZVxuICAgICAgdGhpcy5sb29waW5nID0gZmFsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8vIGxvY2F0b3JzIGNhbiBub3QgKHlldCkgYmUgdXNlZCB0byBqdW1wIG92ZXIgYSBzZWdtZW50XG4gICAgaWYodGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcyA8PSB0aGlzLl9sZWZ0TG9jYXRvci5taWxsaXMpe1xuICAgICAgdGhpcy5faWxsZWdhbExvb3AgPSB0cnVlXG4gICAgICB0aGlzLl9sb29wID0gZmFsc2VcbiAgICAgIHRoaXMubG9vcGluZyA9IGZhbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9sb29wRHVyYXRpb24gPSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzIC0gdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9sb29wLCB0aGlzLl9sb29wRHVyYXRpb24pXG4gICAgdGhpcy5fc2NoZWR1bGVyLmJleW9uZExvb3AgPSB0aGlzLl9jdXJyZW50TWlsbGlzID4gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgIHRoaXMuX2xvb3AgPSB0aGlzLmxvb3BpbmcgJiYgdGhpcy5fY3VycmVudE1pbGxpcyA8PSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9sb29wLCB0aGlzLmxvb3BpbmcpXG4gICAgcmV0dXJuIHRoaXMubG9vcGluZ1xuICB9XG5cbiAgc2V0UHJlY291bnQodmFsdWUgPSAwKXtcbiAgICB0aGlzLl9wcmVjb3VudEJhcnMgPSB2YWx1ZVxuICB9XG5cbiAgLypcbiAgICBoZWxwZXIgbWV0aG9kOiBjb252ZXJ0cyB1c2VyIGZyaWVuZGx5IHBvc2l0aW9uIGZvcm1hdCB0byBpbnRlcm5hbCBmb3JtYXRcblxuICAgIHBvc2l0aW9uOlxuICAgICAgLSAndGlja3MnLCA5NjAwMFxuICAgICAgLSAnbWlsbGlzJywgMTIzNFxuICAgICAgLSAncGVyY2VudGFnZScsIDU1XG4gICAgICAtICdiYXJzYmVhdHMnLCAxLCA0LCAwLCAyNSAtPiBiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja1xuICAgICAgLSAndGltZScsIDAsIDMsIDQ5LCA1NjYgLT4gaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuXG4gICovXG4gIF9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCByZXN1bHRUeXBlKXtcbiAgICBsZXQgdGFyZ2V0XG5cbiAgICBzd2l0Y2godHlwZSl7XG4gICAgICBjYXNlICd0aWNrcyc6XG4gICAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgY2FzZSAncGVyY2VudGFnZSc6XG4gICAgICAgIC8vdGFyZ2V0ID0gYXJnc1swXSB8fCAwXG4gICAgICAgIHRhcmdldCA9IGFyZ3MgfHwgMFxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICd0aW1lJzpcbiAgICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgICB0YXJnZXQgPSBhcmdzXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnNvbGUubG9nKCd1bnN1cHBvcnRlZCB0eXBlJylcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgbGV0IHBvc2l0aW9uID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcywge1xuICAgICAgdHlwZSxcbiAgICAgIHRhcmdldCxcbiAgICAgIHJlc3VsdDogcmVzdWx0VHlwZSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIHBvc2l0aW9uXG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKXtcbiAgICByZXR1cm4gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaylcbiAgfVxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpe1xuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpXG4gIH1cblxuICBzYXZlQXNNSURJRmlsZShuYW1lKXtcbiAgICBzYXZlQXNNSURJRmlsZSh0aGlzLCBuYW1lKVxuICB9XG5cbiAgc2V0Vm9sdW1lKHZhbHVlKXtcbiAgICBpZih2YWx1ZSA8IDAgfHwgdmFsdWUgPiAxKXtcbiAgICAgIGNvbnNvbGUubG9nKCdTb25nLnNldFZvbHVtZSgpIGFjY2VwdHMgYSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIDEsIHlvdSBlbnRlcmVkOicsIHZhbHVlKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMudm9sdW1lID0gdmFsdWVcbiAgfVxuXG4gIGdldFZvbHVtZSgpe1xuICAgIHJldHVybiB0aGlzLnZvbHVtZVxuICB9XG5cbiAgc2V0UGFubmluZyh2YWx1ZSl7XG4gICAgaWYodmFsdWUgPCAtMSB8fCB2YWx1ZSA+IDEpe1xuICAgICAgY29uc29sZS5sb2coJ1Nvbmcuc2V0UGFubmluZygpIGFjY2VwdHMgYSB2YWx1ZSBiZXR3ZWVuIC0xIChmdWxsIGxlZnQpIGFuZCAxIChmdWxsIHJpZ2h0KSwgeW91IGVudGVyZWQ6JywgdmFsdWUpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2suc2V0UGFubmluZyh2YWx1ZSlcbiAgICB9KVxuICAgIHRoaXMuX3Bhbm5lclZhbHVlID0gdmFsdWVcbiAgfVxufVxuIiwiLy8gY2FsbGVkIGJ5IHNvbmdcbmltcG9ydCB7cGFyc2VUaW1lRXZlbnRzLCBwYXJzZUV2ZW50c30gZnJvbSAnLi9wYXJzZV9ldmVudHMnXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7TUlESUV2ZW50VHlwZXN9IGZyb20gJy4vY29uc3RhbnRzJ1xuaW1wb3J0IHtjYWxjdWxhdGVQb3NpdGlvbn0gZnJvbSAnLi9wb3NpdGlvbidcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcbmltcG9ydCB7YnVmZmVyVGltZX0gZnJvbSAnLi9zZXR0aW5ncydcblxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlKCk6dm9pZHtcbiAgaWYodGhpcy5wbGF5aW5nID09PSBmYWxzZSl7XG4gICAgX3VwZGF0ZS5jYWxsKHRoaXMpXG4gIH1lbHNle1xuICAgIHRoaXMuX3BlcmZvcm1VcGRhdGUgPSB0cnVlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF91cGRhdGUoKTp2b2lke1xuXG4gIGlmKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IGZhbHNlXG4gICAgJiYgdGhpcy5fcmVtb3ZlZEV2ZW50cy5sZW5ndGggPT09IDBcbiAgICAmJiB0aGlzLl9uZXdFdmVudHMubGVuZ3RoID09PSAwXG4gICAgJiYgdGhpcy5fbW92ZWRFdmVudHMubGVuZ3RoID09PSAwXG4gICAgJiYgdGhpcy5fbmV3UGFydHMubGVuZ3RoID09PSAwXG4gICAgJiYgdGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA9PT0gMFxuICAgICYmIHRoaXMuX3Jlc2l6ZWQgPT09IGZhbHNlXG4gICl7XG4gICAgcmV0dXJuXG4gIH1cbiAgLy9kZWJ1Z1xuICAvL3RoaXMuaXNQbGF5aW5nID0gdHJ1ZVxuXG4gIC8vY29uc29sZS5ncm91cENvbGxhcHNlZCgndXBkYXRlIHNvbmcnKVxuICBjb25zb2xlLnRpbWUoJ3VwZGF0aW5nIHNvbmcgdG9vaycpXG5cblxuLy8gVElNRSBFVkVOVFNcblxuICAvLyBjaGVjayBpZiB0aW1lIGV2ZW50cyBhcmUgdXBkYXRlZFxuICBpZih0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSB0cnVlKXtcbiAgICAvL2NvbnNvbGUubG9nKCd1cGRhdGVUaW1lRXZlbnRzJywgdGhpcy5fdGltZUV2ZW50cy5sZW5ndGgpXG4gICAgcGFyc2VUaW1lRXZlbnRzKHRoaXMsIHRoaXMuX3RpbWVFdmVudHMsIHRoaXMuaXNQbGF5aW5nKVxuICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSBmYWxzZVxuICAgIC8vY29uc29sZS5sb2coJ3RpbWUgZXZlbnRzICVPJywgdGhpcy5fdGltZUV2ZW50cylcbiAgfVxuXG4gIC8vIG9ubHkgcGFyc2UgbmV3IGFuZCBtb3ZlZCBldmVudHNcbiAgbGV0IHRvYmVQYXJzZWQgPSBbXVxuXG5cbi8vIFBBUlRTXG5cbiAgLy8gZmlsdGVyIHJlbW92ZWQgcGFydHNcbiAgLy9jb25zb2xlLmxvZygncmVtb3ZlZCBwYXJ0cyAlTycsIHRoaXMuX3JlbW92ZWRQYXJ0cylcbiAgdGhpcy5fcmVtb3ZlZFBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICB0aGlzLl9wYXJ0c0J5SWQuZGVsZXRlKHBhcnQuaWQpXG4gIH0pXG5cblxuICAvLyBhZGQgbmV3IHBhcnRzXG4gIC8vY29uc29sZS5sb2coJ25ldyBwYXJ0cyAlTycsIHRoaXMuX25ld1BhcnRzKVxuICB0aGlzLl9uZXdQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgcGFydC5fc29uZyA9IHRoaXNcbiAgICB0aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpXG4gICAgcGFydC51cGRhdGUoKVxuICB9KVxuXG5cbiAgLy8gdXBkYXRlIGNoYW5nZWQgcGFydHNcbiAgLy9jb25zb2xlLmxvZygnY2hhbmdlZCBwYXJ0cyAlTycsIHRoaXMuX2NoYW5nZWRQYXJ0cylcbiAgdGhpcy5fY2hhbmdlZFBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICBwYXJ0LnVwZGF0ZSgpXG4gIH0pXG5cblxuICAvLyByZW1vdmVkIHBhcnRzXG4gIC8vY29uc29sZS5sb2coJ3JlbW92ZWQgcGFydHMgJU8nLCB0aGlzLl9jaGFuZ2VkUGFydHMpXG4gIHRoaXMuX3JlbW92ZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgdGhpcy5fcGFydHNCeUlkLmRlbGV0ZShwYXJ0LmlkKVxuICB9KVxuXG4gIGlmKHRoaXMuX3JlbW92ZWRQYXJ0cy5sZW5ndGggPiAwKXtcbiAgICB0aGlzLl9wYXJ0cyA9IEFycmF5LmZyb20odGhpcy5fcGFydHNCeUlkLnZhbHVlcygpKVxuICB9XG5cblxuLy8gRVZFTlRTXG5cbiAgLy8gZmlsdGVyIHJlbW92ZWQgZXZlbnRzXG4gIC8vY29uc29sZS5sb2coJ3JlbW92ZWQgZXZlbnRzICVPJywgdGhpcy5fcmVtb3ZlZEV2ZW50cylcbiAgdGhpcy5fcmVtb3ZlZEV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgIGxldCB0cmFjayA9IGV2ZW50Lm1pZGlOb3RlLl90cmFja1xuICAgIC8vIHVuc2NoZWR1bGUgYWxsIHJlbW92ZWQgZXZlbnRzIHRoYXQgYWxyZWFkeSBoYXZlIGJlZW4gc2NoZWR1bGVkXG4gICAgaWYoZXZlbnQudGltZSA+PSB0aGlzLl9jdXJyZW50TWlsbGlzKXtcbiAgICAgIHRyYWNrLnVuc2NoZWR1bGUoZXZlbnQpXG4gICAgfVxuICAgIHRoaXMuX25vdGVzQnlJZC5kZWxldGUoZXZlbnQubWlkaU5vdGUuaWQpXG4gICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gIH0pXG5cblxuICAvLyBhZGQgbmV3IGV2ZW50c1xuICAvL2NvbnNvbGUubG9nKCduZXcgZXZlbnRzICVPJywgdGhpcy5fbmV3RXZlbnRzKVxuICB0aGlzLl9uZXdFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgdGhpcy5fZXZlbnRzLnB1c2goZXZlbnQpXG4gICAgdG9iZVBhcnNlZC5wdXNoKGV2ZW50KVxuICB9KVxuXG5cbiAgLy8gbW92ZWQgZXZlbnRzIG5lZWQgdG8gYmUgcGFyc2VkXG4gIC8vY29uc29sZS5sb2coJ21vdmVkICVPJywgdGhpcy5fbW92ZWRFdmVudHMpXG4gIHRoaXMuX21vdmVkRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgdG9iZVBhcnNlZC5wdXNoKGV2ZW50KVxuICB9KVxuXG5cbiAgLy8gcGFyc2UgYWxsIG5ldyBhbmQgbW92ZWQgZXZlbnRzXG4gIGlmKHRvYmVQYXJzZWQubGVuZ3RoID4gMCl7XG4gICAgLy9jb25zb2xlLnRpbWUoJ3BhcnNlJylcbiAgICAvL2NvbnNvbGUubG9nKCd0b2JlUGFyc2VkICVPJywgdG9iZVBhcnNlZClcbiAgICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycsIHRvYmVQYXJzZWQubGVuZ3RoKVxuXG4gICAgdG9iZVBhcnNlZCA9IFsuLi50b2JlUGFyc2VkLCAuLi50aGlzLl90aW1lRXZlbnRzXVxuICAgIHBhcnNlRXZlbnRzKHRvYmVQYXJzZWQsIHRoaXMuaXNQbGF5aW5nKVxuXG4gICAgLy8gYWRkIE1JREkgbm90ZXMgdG8gc29uZ1xuICAgIHRvYmVQYXJzZWQuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmlkLCBldmVudC50eXBlLCBldmVudC5taWRpTm90ZSlcbiAgICAgIGlmKGV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT04pe1xuICAgICAgICBpZihldmVudC5taWRpTm90ZSl7XG4gICAgICAgICAgdGhpcy5fbm90ZXNCeUlkLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50LnR5cGUpXG4gICAgICAgICAgLy90aGlzLl9ub3Rlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUudGltZUVuZCgncGFyc2UnKVxuICB9XG5cblxuICBpZih0b2JlUGFyc2VkLmxlbmd0aCA+IDAgfHwgdGhpcy5fcmVtb3ZlZEV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAvL2NvbnNvbGUudGltZSgndG8gYXJyYXknKVxuICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSlcbiAgICB0aGlzLl9ub3RlcyA9IEFycmF5LmZyb20odGhpcy5fbm90ZXNCeUlkLnZhbHVlcygpKVxuICAgIC8vY29uc29sZS50aW1lRW5kKCd0byBhcnJheScpXG4gIH1cblxuXG4gIC8vY29uc29sZS50aW1lKGBzb3J0aW5nICR7dGhpcy5fZXZlbnRzLmxlbmd0aH0gZXZlbnRzYClcbiAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gIHRoaXMuX25vdGVzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEubm90ZU9uLnRpY2tzIC0gYi5ub3RlT24udGlja3NcbiAgfSlcbiAgLy9jb25zb2xlLnRpbWVFbmQoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuXG4gIC8vY29uc29sZS5sb2coJ25vdGVzICVPJywgdGhpcy5fbm90ZXMpXG4gIGNvbnNvbGUudGltZUVuZCgndXBkYXRpbmcgc29uZyB0b29rJylcblxuXG4vLyBTT05HIERVUkFUSU9OXG5cbiAgLy8gZ2V0IHRoZSBsYXN0IGV2ZW50IG9mIHRoaXMgc29uZ1xuICBsZXQgbGFzdEV2ZW50ID0gdGhpcy5fZXZlbnRzW3RoaXMuX2V2ZW50cy5sZW5ndGggLSAxXVxuICBsZXQgbGFzdFRpbWVFdmVudCA9IHRoaXMuX3RpbWVFdmVudHNbdGhpcy5fdGltZUV2ZW50cy5sZW5ndGggLSAxXVxuXG4gIC8vIGNoZWNrIGlmIHNvbmcgaGFzIGFscmVhZHkgYW55IGV2ZW50c1xuICBpZihsYXN0RXZlbnQgaW5zdGFuY2VvZiBNSURJRXZlbnQgPT09IGZhbHNlKXtcbiAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50XG4gIH1lbHNlIGlmKGxhc3RUaW1lRXZlbnQudGlja3MgPiBsYXN0RXZlbnQudGlja3Mpe1xuICAgIGxhc3RFdmVudCA9IGxhc3RUaW1lRXZlbnRcbiAgfVxuICAvL2NvbnNvbGUubG9nKGxhc3RFdmVudClcblxuICAvLyBnZXQgdGhlIHBvc2l0aW9uIGRhdGEgb2YgdGhlIGZpcnN0IGJlYXQgaW4gdGhlIGJhciBhZnRlciB0aGUgbGFzdCBiYXJcbiAgdGhpcy5iYXJzID0gTWF0aC5tYXgobGFzdEV2ZW50LmJhciwgdGhpcy5iYXJzKVxuICBsZXQgdGlja3MgPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgdGFyZ2V0OiBbdGhpcy5iYXJzICsgMV0sXG4gICAgcmVzdWx0OiAndGlja3MnXG4gIH0pLnRpY2tzXG5cbiAgLy8gd2Ugd2FudCB0byBwdXQgdGhlIEVORF9PRl9UUkFDSyBldmVudCBhdCB0aGUgdmVyeSBsYXN0IHRpY2sgb2YgdGhlIGxhc3QgYmFyLCBzbyB3ZSBjYWxjdWxhdGUgdGhhdCBwb3NpdGlvblxuICBsZXQgbWlsbGlzID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcywge1xuICAgIHR5cGU6ICd0aWNrcycsXG4gICAgdGFyZ2V0OiB0aWNrcyAtIDEsXG4gICAgcmVzdWx0OiAnbWlsbGlzJ1xuICB9KS5taWxsaXNcblxuICB0aGlzLl9sYXN0RXZlbnQudGlja3MgPSB0aWNrcyAtIDFcbiAgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuXG4gIC8vY29uc29sZS5sb2coJ2xlbmd0aCcsIHRoaXMuX2xhc3RFdmVudC50aWNrcywgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcywgdGhpcy5iYXJzKVxuXG4gIHRoaXMuX2R1cmF0aW9uVGlja3MgPSB0aGlzLl9sYXN0RXZlbnQudGlja3NcbiAgdGhpcy5fZHVyYXRpb25NaWxsaXMgPSB0aGlzLl9sYXN0RXZlbnQubWlsbGlzXG5cblxuLy8gTUVUUk9OT01FXG5cbiAgLy8gYWRkIG1ldHJvbm9tZSBldmVudHNcbiAgaWYodGhpcy5fdXBkYXRlTWV0cm9ub21lRXZlbnRzIHx8IHRoaXMuX21ldHJvbm9tZS5iYXJzICE9PSB0aGlzLmJhcnMpe1xuICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9IHBhcnNlRXZlbnRzKFsuLi50aGlzLl90aW1lRXZlbnRzLCAuLi50aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKCldKVxuICB9XG4gIHRoaXMuX2FsbEV2ZW50cyA9IFsuLi50aGlzLl9tZXRyb25vbWVFdmVudHMsIC4uLnRoaXMuX2V2ZW50c11cbiAgc29ydEV2ZW50cyh0aGlzLl9hbGxFdmVudHMpXG4gIC8vY29uc29sZS5sb2coJ2FsbCBldmVudHMgJU8nLCB0aGlzLl9hbGxFdmVudHMpXG5cbi8qXG4gIHRoaXMuX21ldHJvbm9tZS5nZXRFdmVudHMoKVxuICB0aGlzLl9hbGxFdmVudHMgPSBbLi4udGhpcy5fZXZlbnRzXVxuICBzb3J0RXZlbnRzKHRoaXMuX2FsbEV2ZW50cylcbiovXG5cbiAgLy9jb25zb2xlLmxvZygnY3VycmVudCBtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICB0aGlzLl9wbGF5aGVhZC51cGRhdGVTb25nKClcbiAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZVNvbmcoKVxuXG4gIGlmKHRoaXMucGxheWluZyA9PT0gZmFsc2Upe1xuICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICBkYXRhOiB0aGlzLl9wbGF5aGVhZC5nZXQoKS5wb3NpdGlvblxuICAgIH0pXG4gIH1cblxuICAvLyByZXNldFxuICB0aGlzLl9uZXdQYXJ0cyA9IFtdXG4gIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdXG4gIHRoaXMuX25ld0V2ZW50cyA9IFtdXG4gIHRoaXMuX21vdmVkRXZlbnRzID0gW11cbiAgdGhpcy5fcmVtb3ZlZEV2ZW50cyA9IFtdXG4gIHRoaXMuX3Jlc2l6ZWQgPSBmYWxzZVxuXG4gIC8vY29uc29sZS5ncm91cEVuZCgndXBkYXRlIHNvbmcnKVxufVxuIiwiaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5pbXBvcnQge3BhcnNlTUlESUZpbGV9IGZyb20gJy4vbWlkaWZpbGUnXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtQYXJ0fSBmcm9tICcuL3BhcnQnXG5pbXBvcnQge1RyYWNrfSBmcm9tICcuL3RyYWNrJ1xuaW1wb3J0IHtTb25nfSBmcm9tICcuL3NvbmcnXG5pbXBvcnQge2Jhc2U2NFRvQmluYXJ5fSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge3N0YXR1cywganNvbiwgYXJyYXlCdWZmZXJ9IGZyb20gJy4vZmV0Y2hfaGVscGVycydcblxuY29uc3QgUFBRID0gOTYwXG5cblxuZnVuY3Rpb24gdG9Tb25nKHBhcnNlZCl7XG4gIGxldCB0cmFja3MgPSBwYXJzZWQudHJhY2tzXG4gIGxldCBwcHEgPSBwYXJzZWQuaGVhZGVyLnRpY2tzUGVyQmVhdFxuICBsZXQgcHBxRmFjdG9yID0gUFBRIC8gcHBxIC8vQFRPRE86IGdldCBwcHEgZnJvbSBjb25maWcgLT4gb25seSBuZWNlc3NhcnkgaWYgeW91IHdhbnQgdG8gY2hhbmdlIHRoZSBwcHEgb2YgdGhlIE1JREkgZmlsZSAhXG4gIGxldCB0aW1lRXZlbnRzID0gW11cbiAgbGV0IGJwbSA9IC0xXG4gIGxldCBub21pbmF0b3IgPSAtMVxuICBsZXQgZGVub21pbmF0b3IgPSAtMVxuICBsZXQgbmV3VHJhY2tzID0gW11cblxuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcy52YWx1ZXMoKSl7XG4gICAgbGV0IGxhc3RUaWNrcywgbGFzdFR5cGVcbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IHR5cGVcbiAgICBsZXQgY2hhbm5lbCA9IC0xXG4gICAgbGV0IHRyYWNrTmFtZVxuICAgIGxldCB0cmFja0luc3RydW1lbnROYW1lXG4gICAgbGV0IGV2ZW50cyA9IFtdO1xuXG4gICAgZm9yKGxldCBldmVudCBvZiB0cmFjayl7XG4gICAgICB0aWNrcyArPSAoZXZlbnQuZGVsdGFUaW1lICogcHBxRmFjdG9yKTtcblxuICAgICAgaWYoY2hhbm5lbCA9PT0gLTEgJiYgdHlwZW9mIGV2ZW50LmNoYW5uZWwgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY2hhbm5lbCA9IGV2ZW50LmNoYW5uZWw7XG4gICAgICB9XG4gICAgICB0eXBlID0gZXZlbnQuc3VidHlwZTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVsdGFUaW1lLCB0aWNrcywgdHlwZSk7XG5cbiAgICAgIHN3aXRjaChldmVudC5zdWJ0eXBlKXtcblxuICAgICAgICBjYXNlICd0cmFja05hbWUnOlxuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnaW5zdHJ1bWVudE5hbWUnOlxuICAgICAgICAgIGlmKGV2ZW50LnRleHQpe1xuICAgICAgICAgICAgdHJhY2tJbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg5MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPZmYnOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4ODAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSlcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdzZXRUZW1wbyc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGVtcG8gZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGxldCB0bXAgPSA2MDAwMDAwMCAvIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQ7XG5cbiAgICAgICAgICBpZih0aWNrcyA9PT0gbGFzdFRpY2tzICYmIHR5cGUgPT09IGxhc3RUeXBlKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKCd0ZW1wbyBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCB0bXApO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihicG0gPT09IC0xKXtcbiAgICAgICAgICAgIGJwbSA9IHRtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4NTEsIHRtcCkpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZVNpZ25hdHVyZSc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGlmKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpe1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCd0aW1lIHNpZ25hdHVyZSBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYobm9taW5hdG9yID09PSAtMSl7XG4gICAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5udW1lcmF0b3JcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3JcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4NTgsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpKVxuICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSAnY29udHJvbGxlcic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhCMCwgZXZlbnQuY29udHJvbGxlclR5cGUsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncHJvZ3JhbUNoYW5nZSc6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhDMCwgZXZlbnQucHJvZ3JhbU51bWJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3BpdGNoQmVuZCc6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhFMCwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vY29uc29sZS5sb2codHJhY2submFtZSwgZXZlbnQudHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGxhc3RUeXBlID0gdHlwZVxuICAgICAgbGFzdFRpY2tzID0gdGlja3NcbiAgICB9XG5cbiAgICBpZihldmVudHMubGVuZ3RoID4gMCl7XG4gICAgICAvL2NvbnNvbGUuY291bnQoZXZlbnRzLmxlbmd0aClcbiAgICAgIGxldCBuZXdUcmFjayA9IG5ldyBUcmFjayh0cmFja05hbWUpXG4gICAgICBsZXQgcGFydCA9IG5ldyBQYXJ0KClcbiAgICAgIG5ld1RyYWNrLmFkZFBhcnRzKHBhcnQpXG4gICAgICBwYXJ0LmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgICBuZXdUcmFja3MucHVzaChuZXdUcmFjaylcbiAgICB9XG4gIH1cblxuICBsZXQgc29uZyA9IG5ldyBTb25nKHtcbiAgICBwcHE6IFBQUSxcbiAgICBwbGF5YmFja1NwZWVkOiAxLFxuICAgIC8vcHBxLFxuICAgIGJwbSxcbiAgICBub21pbmF0b3IsXG4gICAgZGVub21pbmF0b3JcbiAgfSlcbiAgc29uZy5hZGRUcmFja3MoLi4ubmV3VHJhY2tzKVxuICBzb25nLmFkZFRpbWVFdmVudHMoLi4udGltZUV2ZW50cylcbiAgc29uZy51cGRhdGUoKVxuICByZXR1cm4gc29uZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZVN5bmMoZGF0YSwgc2V0dGluZ3MgPSB7fSl7XG4gIGxldCBzb25nID0gbnVsbDtcblxuICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgIGxldCBidWZmZXIgPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgICBzb25nID0gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gIH1lbHNlIGlmKHR5cGVvZiBkYXRhLmhlYWRlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRhdGEudHJhY2tzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgc29uZyA9IHRvU29uZyhkYXRhKTtcbiAgfWVsc2V7XG4gICAgZGF0YSA9IGJhc2U2NFRvQmluYXJ5KGRhdGEpO1xuICAgIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gICAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgICBzb25nID0gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKCd3cm9uZyBkYXRhJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNvbmdcbiAgLy8ge1xuICAvLyAgIHBwcSA9IG5ld1BQUSxcbiAgLy8gICBicG0gPSBuZXdCUE0sXG4gIC8vICAgcGxheWJhY2tTcGVlZCA9IG5ld1BsYXliYWNrU3BlZWQsXG4gIC8vIH0gPSBzZXR0aW5nc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlKHVybCl7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gZmV0Y2godXJsLCB7XG4gICAgLy8gICBtb2RlOiAnbm8tY29ycydcbiAgICAvLyB9KVxuICAgIGZldGNoKHVybClcbiAgICAudGhlbihzdGF0dXMpXG4gICAgLnRoZW4oYXJyYXlCdWZmZXIpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICByZXNvbHZlKHNvbmdGcm9tTUlESUZpbGVTeW5jKGRhdGEpKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cbiIsImltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7TUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuaW1wb3J0IHtnZXRNSURJSW5wdXRCeUlkLCBnZXRNSURJT3V0cHV0QnlJZH0gZnJvbSAnLi9pbml0X21pZGknXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9xYW1iaSdcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5cbmNvbnN0IHplcm9WYWx1ZSA9IDAuMDAwMDAwMDAwMDAwMDAwMDFcbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgVHJhY2t7XG5cbiAgLy8gY29uc3RydWN0b3Ioe1xuICAvLyAgIG5hbWUsXG4gIC8vICAgcGFydHMsIC8vIG51bWJlciBvciBhcnJheVxuICAvLyB9KVxuXG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gbnVsbCl7XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgdGhpcy5pZFxuICAgIHRoaXMuY2hhbm5lbCA9IDBcbiAgICB0aGlzLm11dGVkID0gZmFsc2VcbiAgICB0aGlzLnZvbHVtZSA9IDAuNVxuICAgIHRoaXMuX3Bhbm5lciA9IGNvbnRleHQuY3JlYXRlUGFubmVyKClcbiAgICB0aGlzLl9wYW5uZXIucGFubmluZ01vZGVsID0gJ2VxdWFscG93ZXInXG4gICAgdGhpcy5fcGFubmVyLnNldFBvc2l0aW9uKHplcm9WYWx1ZSwgemVyb1ZhbHVlLCB6ZXJvVmFsdWUpXG4gICAgdGhpcy5fb3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLl9vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5fcGFubmVyLmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgIC8vdGhpcy5fb3V0cHV0LmNvbm5lY3QodGhpcy5fcGFubmVyKVxuICAgIHRoaXMuX21pZGlJbnB1dHMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9taWRpT3V0cHV0cyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG4gICAgdGhpcy5fcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB0aGlzLmxhdGVuY3kgPSAxMDBcbiAgICB0aGlzLl9pbnN0cnVtZW50ID0gbnVsbFxuICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICAgIHRoaXMubW9uaXRvciA9IGZhbHNlXG4gICAgdGhpcy5fc29uZ0lucHV0ID0gbnVsbFxuICAgIHRoaXMuX2VmZmVjdHMgPSBbXVxuICB9XG5cbiAgc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50ID0gbnVsbCl7XG4gICAgaWYoaW5zdHJ1bWVudCAhPT0gbnVsbFxuICAgICAgLy8gY2hlY2sgaWYgdGhlIG1hbmRhdG9yeSBmdW5jdGlvbnMgb2YgYW4gaW5zdHJ1bWVudCBhcmUgcHJlc2VudCAoSW50ZXJmYWNlIEluc3RydW1lbnQpXG4gICAgICAmJiB0eXBlb2YgaW5zdHJ1bWVudC5jb25uZWN0ID09PSAnZnVuY3Rpb24nXG4gICAgICAmJiB0eXBlb2YgaW5zdHJ1bWVudC5kaXNjb25uZWN0ID09PSAnZnVuY3Rpb24nXG4gICAgICAmJiB0eXBlb2YgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50ID09PSAnZnVuY3Rpb24nXG4gICAgICAmJiB0eXBlb2YgaW5zdHJ1bWVudC5hbGxOb3Rlc09mZiA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgJiYgdHlwZW9mIGluc3RydW1lbnQudW5zY2hlZHVsZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICl7XG4gICAgICB0aGlzLnJlbW92ZUluc3RydW1lbnQoKVxuICAgICAgdGhpcy5faW5zdHJ1bWVudCA9IGluc3RydW1lbnRcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuY29ubmVjdCh0aGlzLl9wYW5uZXIpXG4gICAgfWVsc2UgaWYoaW5zdHJ1bWVudCA9PT0gbnVsbCl7XG4gICAgICAvLyBpZiB5b3UgcGFzcyBudWxsIGFzIGFyZ3VtZW50IHRoZSBjdXJyZW50IGluc3RydW1lbnQgd2lsbCBiZSByZW1vdmVkLCBzYW1lIGFzIHJlbW92ZUluc3RydW1lbnRcbiAgICAgIHRoaXMucmVtb3ZlSW5zdHJ1bWVudCgpXG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBpbnN0cnVtZW50LCBhbmQgaW5zdHJ1bWVudCBzaG91bGQgaGF2ZSB0aGUgbWV0aG9kcyBcImNvbm5lY3RcIiwgXCJkaXNjb25uZWN0XCIsIFwicHJvY2Vzc01JRElFdmVudFwiLCBcInVuc2NoZWR1bGVcIiBhbmQgXCJhbGxOb3Rlc09mZlwiJylcbiAgICB9XG4gIH1cblxuICByZW1vdmVJbnN0cnVtZW50KCl7XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuZGlzY29ubmVjdCgpXG4gICAgICB0aGlzLl9pbnN0cnVtZW50ID0gbnVsbFxuICAgIH1cbiAgfVxuXG4gIGdldEluc3RydW1lbnQoKXtcbiAgICByZXR1cm4gdGhpcy5faW5zdHJ1bWVudFxuICB9XG5cbiAgY29ubmVjdE1JRElPdXRwdXRzKC4uLm91dHB1dHMpe1xuICAgIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgICBvdXRwdXRzLmZvckVhY2gob3V0cHV0ID0+IHtcbiAgICAgIGlmKHR5cGVvZiBvdXRwdXQgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgb3V0cHV0ID0gZ2V0TUlESU91dHB1dEJ5SWQob3V0cHV0KVxuICAgICAgfVxuICAgICAgaWYob3V0cHV0IGluc3RhbmNlb2YgTUlESU91dHB1dCl7XG4gICAgICAgIHRoaXMuX21pZGlPdXRwdXRzLnNldChvdXRwdXQuaWQsIG91dHB1dClcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaU91dHB1dHMpXG4gIH1cblxuICBkaXNjb25uZWN0TUlESU91dHB1dHMoLi4ub3V0cHV0cyl7XG4gICAgLy9jb25zb2xlLmxvZyhvdXRwdXRzKVxuICAgIGlmKG91dHB1dHMubGVuZ3RoID09PSAwKXtcbiAgICAgIHRoaXMuX21pZGlPdXRwdXRzLmNsZWFyKClcbiAgICB9XG4gICAgb3V0cHV0cy5mb3JFYWNoKHBvcnQgPT4ge1xuICAgICAgaWYocG9ydCBpbnN0YW5jZW9mIE1JRElPdXRwdXQpe1xuICAgICAgICBwb3J0ID0gcG9ydC5pZFxuICAgICAgfVxuICAgICAgaWYodGhpcy5fbWlkaU91dHB1dHMuaGFzKHBvcnQpKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZygncmVtb3ZpbmcnLCB0aGlzLl9taWRpT3V0cHV0cy5nZXQocG9ydCkubmFtZSlcbiAgICAgICAgdGhpcy5fbWlkaU91dHB1dHMuZGVsZXRlKHBvcnQpXG4gICAgICB9XG4gICAgfSlcbiAgICAvL3RoaXMuX21pZGlPdXRwdXRzID0gdGhpcy5fbWlkaU91dHB1dHMuZmlsdGVyKC4uLm91dHB1dHMpXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpT3V0cHV0cylcbiAgfVxuXG4gIGNvbm5lY3RNSURJSW5wdXRzKC4uLmlucHV0cyl7XG4gICAgaW5wdXRzLmZvckVhY2goaW5wdXQgPT4ge1xuICAgICAgaWYodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlucHV0ID0gZ2V0TUlESUlucHV0QnlJZChpbnB1dClcbiAgICAgIH1cbiAgICAgIGlmKGlucHV0IGluc3RhbmNlb2YgTUlESUlucHV0KXtcblxuICAgICAgICB0aGlzLl9taWRpSW5wdXRzLnNldChpbnB1dC5pZCwgaW5wdXQpXG5cbiAgICAgICAgaW5wdXQub25taWRpbWVzc2FnZSA9IGUgPT4ge1xuICAgICAgICAgIGlmKHRoaXMubW9uaXRvciA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICB0aGlzLl9wcmVwcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQodGhpcy5fc29uZy5fdGlja3MsIC4uLmUuZGF0YSkpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlJbnB1dHMpXG4gIH1cblxuICAvLyB5b3UgY2FuIHBhc3MgYm90aCBwb3J0IGFuZCBwb3J0IGlkc1xuICBkaXNjb25uZWN0TUlESUlucHV0cyguLi5pbnB1dHMpe1xuICAgIGlmKGlucHV0cy5sZW5ndGggPT09IDApe1xuICAgICAgdGhpcy5fbWlkaUlucHV0cy5mb3JFYWNoKHBvcnQgPT4ge1xuICAgICAgICBwb3J0Lm9ubWlkaW1lc3NhZ2UgPSBudWxsXG4gICAgICB9KVxuICAgICAgdGhpcy5fbWlkaUlucHV0cy5jbGVhcigpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaW5wdXRzLmZvckVhY2gocG9ydCA9PiB7XG4gICAgICBpZihwb3J0IGluc3RhbmNlb2YgTUlESUlucHV0KXtcbiAgICAgICAgcG9ydCA9IHBvcnQuaWRcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuX21pZGlJbnB1dHMuaGFzKHBvcnQpKXtcbiAgICAgICAgdGhpcy5fbWlkaUlucHV0cy5nZXQocG9ydCkub25taWRpbWVzc2FnZSA9IG51bGxcbiAgICAgICAgdGhpcy5fbWlkaUlucHV0cy5kZWxldGUocG9ydClcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vdGhpcy5fbWlkaU91dHB1dHMgPSB0aGlzLl9taWRpT3V0cHV0cy5maWx0ZXIoLi4ub3V0cHV0cylcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlJbnB1dHMpXG4gIH1cblxuICBnZXRNSURJSW5wdXRzKCl7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fbWlkaUlucHV0cy52YWx1ZXMoKSlcbiAgfVxuXG4gIGdldE1JRElPdXRwdXRzKCl7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpXG4gIH1cblxuICBzZXRSZWNvcmRFbmFibGVkKHR5cGUpeyAvLyAnbWlkaScsICdhdWRpbycsIGVtcHR5IG9yIGFueXRoaW5nIHdpbGwgZGlzYWJsZSByZWNvcmRpbmdcbiAgICB0aGlzLl9yZWNvcmRFbmFibGVkID0gdHlwZVxuICB9XG5cbiAgX3N0YXJ0UmVjb3JkaW5nKHJlY29yZElkKXtcbiAgICBpZih0aGlzLl9yZWNvcmRFbmFibGVkID09PSAnbWlkaScpe1xuICAgICAgLy9jb25zb2xlLmxvZyhyZWNvcmRJZClcbiAgICAgIHRoaXMuX3JlY29yZElkID0gcmVjb3JkSWRcbiAgICAgIHRoaXMuX3JlY29yZGVkRXZlbnRzID0gW11cbiAgICAgIHRoaXMuX3JlY29yZFBhcnQgPSBuZXcgUGFydCh0aGlzLl9yZWNvcmRJZClcbiAgICB9XG4gIH1cblxuICBfc3RvcFJlY29yZGluZyhyZWNvcmRJZCl7XG4gICAgaWYodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZih0aGlzLl9yZWNvcmRlZEV2ZW50cy5sZW5ndGggPT09IDApe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX3JlY29yZFBhcnQuYWRkRXZlbnRzKC4uLnRoaXMuX3JlY29yZGVkRXZlbnRzKVxuICAgIC8vdGhpcy5fc29uZy5fbmV3RXZlbnRzLnB1c2goLi4udGhpcy5fcmVjb3JkZWRFdmVudHMpXG4gICAgdGhpcy5hZGRQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KVxuICB9XG5cbiAgdW5kb1JlY29yZGluZyhyZWNvcmRJZCl7XG4gICAgaWYodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnJlbW92ZVBhcnRzKHRoaXMuX3JlY29yZFBhcnQpXG4gICAgLy90aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fcmVjb3JkZWRFdmVudHMpXG4gIH1cblxuICByZWRvUmVjb3JkaW5nKHJlY29yZElkKXtcbiAgICBpZih0aGlzLl9yZWNvcmRJZCAhPT0gcmVjb3JkSWQpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuYWRkUGFydHModGhpcy5fcmVjb3JkUGFydClcbiAgfVxuXG4gIGNvcHkoKXtcbiAgICBsZXQgdCA9IG5ldyBUcmFjayh0aGlzLm5hbWUgKyAnX2NvcHknKSAvLyBpbXBsZW1lbnQgZ2V0TmFtZU9mQ29weSgpIGluIHV0aWwgKHNlZSBoZWFydGJlYXQpXG4gICAgbGV0IHBhcnRzID0gW11cbiAgICB0aGlzLl9wYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgbGV0IGNvcHkgPSBwYXJ0LmNvcHkoKVxuICAgICAgY29uc29sZS5sb2coY29weSlcbiAgICAgIHBhcnRzLnB1c2goY29weSlcbiAgICB9KVxuICAgIHQuYWRkUGFydHMoLi4ucGFydHMpXG4gICAgdC51cGRhdGUoKVxuICAgIHJldHVybiB0XG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICB9XG5cbiAgYWRkUGFydHMoLi4ucGFydHMpe1xuICAgIGxldCBzb25nID0gdGhpcy5fc29uZ1xuXG4gICAgcGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuXG4gICAgICBwYXJ0Ll90cmFjayA9IHRoaXNcbiAgICAgIHRoaXMuX3BhcnRzLnB1c2gocGFydClcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5zZXQocGFydC5pZCwgcGFydClcblxuICAgICAgbGV0IGV2ZW50cyA9IHBhcnQuX2V2ZW50c1xuICAgICAgdGhpcy5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgcGFydC5fc29uZyA9IHNvbmdcbiAgICAgICAgc29uZy5fbmV3UGFydHMucHVzaChwYXJ0KVxuICAgICAgICBzb25nLl9uZXdFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5fdHJhY2sgPSB0aGlzXG4gICAgICAgIGlmKHNvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gc29uZ1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudClcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIHJlbW92ZVBhcnRzKC4uLnBhcnRzKXtcbiAgICBsZXQgc29uZyA9IHRoaXMuX3NvbmdcblxuICAgIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIHBhcnQuX3RyYWNrID0gbnVsbFxuICAgICAgdGhpcy5fcGFydHNCeUlkLmRlbGV0ZShwYXJ0LmlkLCBwYXJ0KVxuXG4gICAgICBsZXQgZXZlbnRzID0gcGFydC5fZXZlbnRzXG5cbiAgICAgIGlmKHNvbmcpe1xuICAgICAgICBzb25nLl9yZW1vdmVkUGFydHMucHVzaChwYXJ0KVxuICAgICAgICBzb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgICAgaWYoc29uZyl7XG4gICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQsIGV2ZW50KVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuXG4gIHRyYW5zcG9zZVBhcnRzKGFtb3VudDogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICB9XG5cbiAgbW92ZVBhcnRzKHRpY2tzOiBudW1iZXIsIC4uLnBhcnRzKXtcbiAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgcGFydC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gIH1cblxuICBtb3ZlUGFydHNUbyh0aWNrczogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gIH1cbi8qXG4gIGFkZEV2ZW50cyguLi5ldmVudHMpe1xuICAgIGxldCBwID0gbmV3IFBhcnQoKVxuICAgIHAuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICB0aGlzLmFkZFBhcnRzKHApXG4gIH1cbiovXG4gIHJlbW92ZUV2ZW50cyguLi5ldmVudHMpe1xuICAgIGxldCBwYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgcGFydHMuc2V0KGV2ZW50Ll9wYXJ0KVxuICAgICAgZXZlbnQuX3BhcnQgPSBudWxsXG4gICAgICBldmVudC5fdHJhY2sgPSBudWxsXG4gICAgICBldmVudC5fc29uZyA9IG51bGxcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2goLi4uQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZVxuICB9XG5cbiAgbW92ZUV2ZW50cyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGxldCBwYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZSh0aWNrcylcbiAgICAgIHBhcnRzLnNldChldmVudC5wYXJ0KVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICB9XG4gIH1cblxuICBtb3ZlRXZlbnRzVG8odGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBsZXQgcGFydHMgPSBuZXcgU2V0KClcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcylcbiAgICAgIHBhcnRzLnNldChldmVudC5wYXJ0KVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICB9XG4gIH1cblxuICBnZXRFdmVudHMoZmlsdGVyOiBzdHJpbmdbXSA9IG51bGwpeyAvLyBjYW4gYmUgdXNlIGFzIGZpbmRFdmVudHNcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSl7XG4gICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgfVxuICAgIHJldHVybiBbLi4udGhpcy5fZXZlbnRzXSAvL0BUT0RPIGltcGxlbWVudCBmaWx0ZXIgLT4gZmlsdGVyRXZlbnRzKCkgc2hvdWxkIGJlIGEgdXRpbGl0eSBmdW5jdGlvbiAobm90IGEgY2xhc3MgbWV0aG9kKVxuICB9XG5cbiAgbXV0ZShmbGFnOiBib29sZWFuID0gbnVsbCl7XG4gICAgaWYoZmxhZyl7XG4gICAgICB0aGlzLl9tdXRlZCA9IGZsYWdcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuX211dGVkID0gIXRoaXMuX211dGVkXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCl7IC8vIHlvdSBzaG91bGQgb25seSB1c2UgdGhpcyBpbiBodWdlIHNvbmdzICg+MTAwIHRyYWNrcylcbiAgICBpZih0aGlzLl9jcmVhdGVFdmVudEFycmF5KXtcbiAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSlcbiAgICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuICAgIH1cbiAgICBzb3J0RXZlbnRzKHRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gIH1cblxuICAvKlxuICAgIHJvdXRpbmc6IHNhbXBsZSBzb3VyY2UgLT4gcGFubmVyIC0+IGdhaW4gLT4gWy4uLmZ4XSAtPiBzb25nIG91dHB1dFxuICAqL1xuICBjb25uZWN0KHNvbmdPdXRwdXQpe1xuICAgIHRoaXMuX3NvbmdPdXRwdXQgPSBzb25nT3V0cHV0XG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3QodGhpcy5fc29uZ091dHB1dClcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKXtcbiAgICB0aGlzLl9vdXRwdXQuZGlzY29ubmVjdCh0aGlzLl9zb25nT3V0cHV0KVxuICAgIHRoaXMuX3NvbmdPdXRwdXQgPSBudWxsXG4gIH1cblxuICBfY2hlY2tFZmZlY3QoZWZmZWN0KXtcbiAgICBpZih0eXBlb2YgZWZmZWN0LnNldElucHV0ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlZmZlY3Quc2V0T3V0cHV0ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlZmZlY3QuZ2V0T3V0cHV0ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlZmZlY3QuZGlzY29ubmVjdCAhPT0gJ2Z1bmN0aW9uJyl7XG4gICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBjaGFubmVsIGZ4LCBhbmQgY2hhbm5lbCBmeCBzaG91bGQgaGF2ZSB0aGUgbWV0aG9kcyBcInNldElucHV0XCIsIFwic2V0T3V0cHV0XCIsIFwiZ2V0T3V0cHV0XCIgYW5kIFwiZGlzY29ubmVjdFwiJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgYWRkRWZmZWN0KGVmZmVjdCl7XG4gICAgaWYodGhpcy5fY2hlY2tFZmZlY3QoZWZmZWN0KSA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBudW1GWCA9IHRoaXMuX2VmZmVjdHMubGVuZ3RoXG4gICAgbGV0IGxhc3RGWFxuICAgIGxldCBvdXRwdXRcbiAgICBpZihudW1GWCA9PT0gMCl7XG4gICAgICBsYXN0RlggPSB0aGlzLl9vdXRwdXRcbiAgICAgIGxhc3RGWC5kaXNjb25uZWN0KHRoaXMuX3NvbmdPdXRwdXQpXG4gICAgICBvdXRwdXQgPSB0aGlzLl9vdXRwdXRcbiAgICB9ZWxzZXtcbiAgICAgIGxhc3RGWCA9IHRoaXMuX2VmZmVjdHNbbnVtRlggLSAxXVxuICAgICAgbGFzdEZYLmRpc2Nvbm5lY3QoKVxuICAgICAgb3V0cHV0ID0gbGFzdEZYLmdldE91dHB1dCgpXG4gICAgfVxuXG4gICAgZWZmZWN0LnNldElucHV0KG91dHB1dClcbiAgICBlZmZlY3Quc2V0T3V0cHV0KHRoaXMuX3NvbmdPdXRwdXQpXG5cbiAgICB0aGlzLl9lZmZlY3RzLnB1c2goZWZmZWN0KVxuICB9XG5cbiAgYWRkRWZmZWN0QXQoZWZmZWN0LCBpbmRleDogbnVtYmVyKXtcbiAgICBpZih0aGlzLl9jaGVja0VmZmVjdChlZmZlY3QpID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fZWZmZWN0cy5zcGxpY2UoaW5kZXgsIDAsIGVmZmVjdClcbiAgfVxuXG4gIHJlbW92ZUVmZmVjdChpbmRleDogbnVtYmVyKXtcbiAgICBpZihpc05hTihpbmRleCkpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VmZmVjdHMuZm9yRWFjaChmeCA9PiB7XG4gICAgICBmeC5kaXNjb25uZWN0KClcbiAgICB9KVxuICAgIHRoaXMuX2VmZmVjdHMuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgbGV0IG51bUZYID0gdGhpcy5fZWZmZWN0cy5sZW5ndGhcblxuICAgIGlmKG51bUZYID09PSAwKXtcbiAgICAgIHRoaXMuX291dHB1dC5jb25uZWN0KHRoaXMuX3NvbmdPdXRwdXQpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgbGFzdEZYID0gdGhpcy5fb3V0cHV0XG4gICAgdGhpcy5fZWZmZWN0cy5mb3JFYWNoKChmeCwgaSkgPT4ge1xuICAgICAgZnguc2V0SW5wdXQobGFzdEZYKVxuICAgICAgaWYoaSA9PT0gbnVtRlggLSAxKXtcbiAgICAgICAgZnguc2V0T3V0cHV0KHRoaXMuX3NvbmdPdXRwdXQpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZnguc2V0T3V0cHV0KHRoaXMuX2VmZmVjdHNbaSArIDFdKVxuICAgICAgfVxuICAgICAgbGFzdEZYID0gZnhcbiAgICB9KVxuICB9XG5cbiAgZ2V0RWZmZWN0cygpe1xuICAgIHJldHVybiB0aGlzLl9lZmZlY3RzXG4gIH1cblxuICBnZXRFZmZlY3RBdChpbmRleDogbnVtYmVyKXtcbiAgICBpZihpc05hTihpbmRleCkpe1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VmZmVjdHNbaW5kZXhdXG4gIH1cbi8qXG4gIGdldE91dHB1dCgpe1xuICAgIHJldHVybiB0aGlzLl9vdXRwdXRcbiAgfVxuXG4gIHNldElucHV0KHNvdXJjZSl7XG4gICAgc291cmNlLmNvbm5lY3QodGhpcy5fc29uZ091dHB1dClcbiAgfVxuKi9cbiAgLy8gbWV0aG9kIGlzIGNhbGxlZCB3aGVuIGEgTUlESSBldmVudHMgaXMgc2VuZCBieSBhbiBleHRlcm5hbCBvciBvbi1zY3JlZW4ga2V5Ym9hcmRcbiAgX3ByZXByb2Nlc3NNSURJRXZlbnQobWlkaUV2ZW50KXtcbiAgICBtaWRpRXZlbnQudGltZSA9IDAgLy8gcGxheSBpbW1lZGlhdGVseSAtPiBzZWUgSW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50XG4gICAgbWlkaUV2ZW50LnJlY29yZE1pbGxpcyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgbGV0IG5vdGVcblxuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5OT1RFX09OKXtcbiAgICAgIG5vdGUgPSBuZXcgTUlESU5vdGUobWlkaUV2ZW50KVxuICAgICAgdGhpcy5fdG1wUmVjb3JkZWROb3Rlcy5zZXQobWlkaUV2ZW50LmRhdGExLCBub3RlKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgIHR5cGU6ICdub3RlT24nLFxuICAgICAgICBkYXRhOiBtaWRpRXZlbnRcbiAgICAgIH0pXG4gICAgfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT0ZGKXtcbiAgICAgIG5vdGUgPSB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmdldChtaWRpRXZlbnQuZGF0YTEpXG4gICAgICBpZih0eXBlb2Ygbm90ZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIG5vdGUuYWRkTm90ZU9mZihtaWRpRXZlbnQpXG4gICAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmRlbGV0ZShtaWRpRXZlbnQuZGF0YTEpXG4gICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgdHlwZTogJ25vdGVPZmYnLFxuICAgICAgICBkYXRhOiBtaWRpRXZlbnRcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYodGhpcy5fcmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknICYmIHRoaXMuX3NvbmcucmVjb3JkaW5nID09PSB0cnVlKXtcbiAgICAgIHRoaXMuX3JlY29yZGVkRXZlbnRzLnB1c2gobWlkaUV2ZW50KVxuICAgIH1cbiAgICB0aGlzLnByb2Nlc3NNSURJRXZlbnQobWlkaUV2ZW50KVxuICB9XG5cbiAgLy8gbWV0aG9kIGlzIGNhbGxlZCBieSBzY2hlZHVsZXIgZHVyaW5nIHBsYXliYWNrXG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHVzZUxhdGVuY3kgPSBmYWxzZSl7XG5cbiAgICBpZih0eXBlb2YgZXZlbnQudGltZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy5fcHJlcHJvY2Vzc01JRElFdmVudChldmVudClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIHNlbmQgdG8gamF2YXNjcmlwdCBpbnN0cnVtZW50XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMubmFtZSwgZXZlbnQpXG4gICAgICB0aGlzLl9pbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIGV2ZW50LnRpbWUgLyAxMDAwKVxuICAgIH1cblxuICAgIC8vIHNlbmQgdG8gZXh0ZXJuYWwgaGFyZHdhcmUgb3Igc29mdHdhcmUgaW5zdHJ1bWVudFxuICAgIHRoaXMuX3NlbmRUb0V4dGVybmFsTUlESU91dHB1dHMoZXZlbnQsIHVzZUxhdGVuY3kpXG4gIH1cblxuICBfc2VuZFRvRXh0ZXJuYWxNSURJT3V0cHV0cyhldmVudCwgdXNlTGF0ZW5jeSl7XG4gICAgbGV0IGxhdGVuY3kgPSB1c2VMYXRlbmN5ID8gdGhpcy5sYXRlbmN5IDogMFxuICAgIGZvcihsZXQgcG9ydCBvZiB0aGlzLl9taWRpT3V0cHV0cy52YWx1ZXMoKSl7XG4gICAgICBpZihwb3J0KXtcbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTI4IHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgICAgIHBvcnQuc2VuZChbZXZlbnQudHlwZSArIHRoaXMuY2hhbm5lbCwgZXZlbnQuZGF0YTEsIGV2ZW50LmRhdGEyXSwgZXZlbnQudGltZSArIGxhdGVuY3kpXG4gICAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDE5MiB8fCBldmVudC50eXBlID09PSAyMjQpe1xuICAgICAgICAgIHBvcnQuc2VuZChbZXZlbnQudHlwZSArIHRoaXMuY2hhbm5lbCwgZXZlbnQuZGF0YTFdLCBldmVudC50aW1lICsgbGF0ZW5jeSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVuc2NoZWR1bGUobWlkaUV2ZW50KXtcblxuICAgIGlmKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpe1xuICAgICAgdGhpcy5faW5zdHJ1bWVudC51bnNjaGVkdWxlKG1pZGlFdmVudClcbiAgICB9XG5cbiAgICBpZih0aGlzLl9taWRpT3V0cHV0cy5zaXplID09PSAwKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgICAgbGV0IG1pZGlOb3RlID0gbWlkaUV2ZW50Lm1pZGlOb3RlXG4gICAgICBsZXQgbm90ZU9mZiA9IG5ldyBNSURJRXZlbnQoMCwgMTI4LCBtaWRpRXZlbnQuZGF0YTEsIDApXG4gICAgICBub3RlT2ZmLm1pZGlOb3RlSWQgPSBtaWRpTm90ZS5pZFxuICAgICAgbm90ZU9mZi50aW1lID0gY29udGV4dC5jdXJyZW50VGltZVxuICAgICAgdGhpcy5fc2VuZFRvRXh0ZXJuYWxNSURJT3V0cHV0cyhub3RlT2ZmLCB0cnVlKVxuICAgIH1cbiAgfVxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgICB9XG5cbiAgICAvLyBsZXQgdGltZVN0YW1wID0gKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwKSArIHRoaXMubGF0ZW5jeVxuICAgIC8vIGZvcihsZXQgb3V0cHV0IG9mIHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKXtcbiAgICAvLyAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgIC8vICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXApIC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgIC8vIH1cbiAgfVxuXG4gIHNldFBhbm5pbmcodmFsdWUpe1xuICAgIGlmKHZhbHVlIDwgLTEgfHwgdmFsdWUgPiAxKXtcbiAgICAgIGNvbnNvbGUubG9nKCdUcmFjay5zZXRQYW5uaW5nKCkgYWNjZXB0cyBhIHZhbHVlIGJldHdlZW4gLTEgKGZ1bGwgbGVmdCkgYW5kIDEgKGZ1bGwgcmlnaHQpLCB5b3UgZW50ZXJlZDonLCB2YWx1ZSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgeCA9IHZhbHVlXG4gICAgbGV0IHkgPSAwXG4gICAgbGV0IHogPSAxIC0gTWF0aC5hYnMoeClcblxuICAgIHggPSB4ID09PSAwID8gemVyb1ZhbHVlIDogeFxuICAgIHkgPSB5ID09PSAwID8gemVyb1ZhbHVlIDogeVxuICAgIHogPSB6ID09PSAwID8gemVyb1ZhbHVlIDogelxuXG4gICAgdGhpcy5fcGFubmVyLnNldFBvc2l0aW9uKHgsIHksIHopXG4gICAgdGhpcy5fcGFubmluZ1ZhbHVlID0gdmFsdWVcbiAgfVxuXG4gIGdldFBhbm5pbmcoKXtcbiAgICByZXR1cm4gdGhpcy5fcGFubmluZ1ZhbHVlXG4gIH1cblxufVxuIiwiaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5cbmNvbnN0XG4gIG1QSSA9IE1hdGguUEksXG4gIG1Qb3cgPSBNYXRoLnBvdyxcbiAgbVJvdW5kID0gTWF0aC5yb3VuZCxcbiAgbUZsb29yID0gTWF0aC5mbG9vcixcbiAgbVJhbmRvbSA9IE1hdGgucmFuZG9tXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5pY2VUaW1lKG1pbGxpcyl7XG4gIGxldCBoLCBtLCBzLCBtcyxcbiAgICBzZWNvbmRzLFxuICAgIHRpbWVBc1N0cmluZyA9ICcnO1xuXG4gIHNlY29uZHMgPSBtaWxsaXMgLyAxMDAwOyAvLyDihpIgbWlsbGlzIHRvIHNlY29uZHNcbiAgaCA9IG1GbG9vcihzZWNvbmRzIC8gKDYwICogNjApKTtcbiAgbSA9IG1GbG9vcigoc2Vjb25kcyAlICg2MCAqIDYwKSkgLyA2MCk7XG4gIHMgPSBtRmxvb3Ioc2Vjb25kcyAlICg2MCkpO1xuICBtcyA9IG1Sb3VuZCgoc2Vjb25kcyAtIChoICogMzYwMCkgLSAobSAqIDYwKSAtIHMpICogMTAwMCk7XG5cbiAgdGltZUFzU3RyaW5nICs9IGggKyAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtIDwgMTAgPyAnMCcgKyBtIDogbTtcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IHMgPCAxMCA/ICcwJyArIHMgOiBzO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbXMgPT09IDAgPyAnMDAwJyA6IG1zIDwgMTAgPyAnMDAnICsgbXMgOiBtcyA8IDEwMCA/ICcwJyArIG1zIDogbXM7XG5cbiAgLy9jb25zb2xlLmxvZyhoLCBtLCBzLCBtcyk7XG4gIHJldHVybiB7XG4gICAgaG91cjogaCxcbiAgICBtaW51dGU6IG0sXG4gICAgc2Vjb25kOiBzLFxuICAgIG1pbGxpc2Vjb25kOiBtcyxcbiAgICB0aW1lQXNTdHJpbmc6IHRpbWVBc1N0cmluZyxcbiAgICB0aW1lQXNBcnJheTogW2gsIG0sIHMsIG1zXVxuICB9O1xufVxuXG5cbi8vIGFkYXB0ZWQgdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vZGFuZ3Vlci9ibG9nLWV4YW1wbGVzL2Jsb2IvbWFzdGVyL2pzL2Jhc2U2NC1iaW5hcnkuanNcbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0JpbmFyeShpbnB1dCl7XG4gIGxldCBrZXlTdHIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nLFxuICAgIGJ5dGVzLCB1YXJyYXksIGJ1ZmZlcixcbiAgICBsa2V5MSwgbGtleTIsXG4gICAgY2hyMSwgY2hyMiwgY2hyMyxcbiAgICBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0LFxuICAgIGksIGogPSAwO1xuXG4gIGJ5dGVzID0gTWF0aC5jZWlsKCgzICogaW5wdXQubGVuZ3RoKSAvIDQuMCk7XG4gIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihieXRlcyk7XG4gIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgbGtleTEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBsa2V5MiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGggLSAxKSk7XG4gIGlmKGxrZXkxID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcbiAgaWYobGtleTIgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuXG4gIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csICcnKTtcblxuICBmb3IoaSA9IDA7IGkgPCBieXRlczsgaSArPSAzKSB7XG4gICAgLy9nZXQgdGhlIDMgb2N0ZWN0cyBpbiA0IGFzY2lpIGNoYXJzXG4gICAgZW5jMSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzMgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jNCA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcblxuICAgIGNocjEgPSAoZW5jMSA8PCAyKSB8IChlbmMyID4+IDQpO1xuICAgIGNocjIgPSAoKGVuYzIgJiAxNSkgPDwgNCkgfCAoZW5jMyA+PiAyKTtcbiAgICBjaHIzID0gKChlbmMzICYgMykgPDwgNikgfCBlbmM0O1xuXG4gICAgdWFycmF5W2ldID0gY2hyMTtcbiAgICBpZihlbmMzICE9IDY0KSB1YXJyYXlbaSsxXSA9IGNocjI7XG4gICAgaWYoZW5jNCAhPSA2NCkgdWFycmF5W2krMl0gPSBjaHIzO1xuICB9XG4gIC8vY29uc29sZS5sb2coYnVmZmVyKTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdHlwZVN0cmluZyhvKXtcbiAgaWYodHlwZW9mIG8gIT0gJ29iamVjdCcpe1xuICAgIHJldHVybiB0eXBlb2YgbztcbiAgfVxuXG4gIGlmKG8gPT09IG51bGwpe1xuICAgIHJldHVybiAnbnVsbCc7XG4gIH1cblxuICAvL29iamVjdCwgYXJyYXksIGZ1bmN0aW9uLCBkYXRlLCByZWdleHAsIHN0cmluZywgbnVtYmVyLCBib29sZWFuLCBlcnJvclxuICBsZXQgaW50ZXJuYWxDbGFzcyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5tYXRjaCgvXFxbb2JqZWN0XFxzKFxcdyspXFxdLylbMV07XG4gIHJldHVybiBpbnRlcm5hbENsYXNzLnRvTG93ZXJDYXNlKCk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRFdmVudHMoZXZlbnRzKXtcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICBsZXQgciA9IGEudHlwZSAtIGIudHlwZTtcbiAgICAgIGlmKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgciA9IC0xXG4gICAgICB9XG4gICAgICByZXR1cm4gclxuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3NcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrSWZCYXNlNjQoZGF0YSl7XG4gIGxldCBwYXNzZWQgPSB0cnVlO1xuICB0cnl7XG4gICAgYXRvYihkYXRhKTtcbiAgfWNhdGNoKGUpe1xuICAgIHBhc3NlZCA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBwYXNzZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFcXVhbFBvd2VyQ3VydmUobnVtU3RlcHMsIHR5cGUsIG1heFZhbHVlKSB7XG4gIGxldCBpLCB2YWx1ZSwgcGVyY2VudCxcbiAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG51bVN0ZXBzKVxuXG4gIGZvcihpID0gMDsgaSA8IG51bVN0ZXBzOyBpKyspe1xuICAgIHBlcmNlbnQgPSBpIC8gbnVtU3RlcHNcbiAgICBpZih0eXBlID09PSAnZmFkZUluJyl7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKCgxLjAgLSBwZXJjZW50KSAqIDAuNSAqIG1QSSkgKiBtYXhWYWx1ZVxuICAgIH1lbHNlIGlmKHR5cGUgPT09ICdmYWRlT3V0Jyl7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKHBlcmNlbnQgKiAwLjUgKiBNYXRoLlBJKSAqIG1heFZhbHVlXG4gICAgfVxuICAgIHZhbHVlc1tpXSA9IHZhbHVlXG4gICAgaWYoaSA9PT0gbnVtU3RlcHMgLSAxKXtcbiAgICAgIHZhbHVlc1tpXSA9IHR5cGUgPT09ICdmYWRlSW4nID8gMSA6IDBcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja01JRElOdW1iZXIodmFsdWUpe1xuICAvL2NvbnNvbGUubG9nKHZhbHVlKTtcbiAgaWYoaXNOYU4odmFsdWUpKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmKHZhbHVlIDwgMCB8fCB2YWx1ZSA+IDEyNyl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEyNycpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cblxuLypcbi8vb2xkIHNjaG9vbCBhamF4XG5cbmV4cG9ydCBmdW5jdGlvbiBhamF4KGNvbmZpZyl7XG4gIGxldFxuICAgIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcbiAgICBtZXRob2QgPSB0eXBlb2YgY29uZmlnLm1ldGhvZCA9PT0gJ3VuZGVmaW5lZCcgPyAnR0VUJyA6IGNvbmZpZy5tZXRob2QsXG4gICAgZmlsZVNpemU7XG5cbiAgZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIHJlamVjdCA9IHJlamVjdCB8fCBmdW5jdGlvbigpe307XG4gICAgcmVzb2x2ZSA9IHJlc29sdmUgfHwgZnVuY3Rpb24oKXt9O1xuXG4gICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgaWYocmVxdWVzdC5zdGF0dXMgIT09IDIwMCl7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LnN0YXR1cyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgZmlsZVNpemUgPSByZXF1ZXN0LnJlc3BvbnNlLmxlbmd0aDtcbiAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpLCBmaWxlU2l6ZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKXtcbiAgICAgIGNvbmZpZy5vbkVycm9yKGUpO1xuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBjb25maWcudXJsLCB0cnVlKTtcblxuICAgIGlmKGNvbmZpZy5vdmVycmlkZU1pbWVUeXBlKXtcbiAgICAgIHJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZShjb25maWcub3ZlcnJpZGVNaW1lVHlwZSk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSl7XG4gICAgICBpZihjb25maWcucmVzcG9uc2VUeXBlID09PSAnanNvbicpe1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICAgIH1lbHNle1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYobWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5kYXRhKXtcbiAgICAgIHJlcXVlc3Quc2VuZChjb25maWcuZGF0YSk7XG4gICAgfWVsc2V7XG4gICAgICByZXF1ZXN0LnNlbmQoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xufVxuKi8iXX0=
