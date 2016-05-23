(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _qambi = require('../../src/qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {

  _qambi2.default.init().then(function () {

    _qambi.Song.fromMIDIFileAsync('../data/minute_waltz.mid')
    //Song.fromMIDIFileAsync('../data/mozk545a.mid')
    .then(function (song) {

      var piano = new _qambi.Instrument();
      song.getTracks().forEach(function (track) {
        track.setInstrument(piano);
      });

      song.setMetronome(true);
      song.play();
      // piano.parseSampleData({url: 'https://raw.githubusercontent.com/abudaan/qambi/gh-pages/instruments/heartbeat/city-piano-light.json'})
      // .then(() => {
      //   song.play()
      // })
    });
  });
});

},{"../../src/qambi":23}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
    fetch(url).then(status).then(json).then(function (data) {
      resolve(data);
    }).catch(function (e) {
      reject(e);
    });
  });
}

function fetchArraybuffer(url) {
  return new Promise(function (resolve, reject) {
    fetch(url).then(status).then(arrayBuffer).then(function (data) {
      resolve(data);
    }).catch(function (e) {
      reject(e);
    });
  });
}

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Blob = exports.requestAnimationFrame = exports.getUserMedia = undefined;
exports.init = init;

var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

var _song = require('./song');

var _instrument = require('./instrument');

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

function loadInstrument(data) {
  var instrument = new _instrument.Instrument();
  return new Promise(function (resolve, reject) {
    instrument.parseSampleData(data).then(function () {
      return resolve(instrument);
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
          promises.push(_song.Song.fromMIDIFileAsync(data.url));
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

},{"./init_audio":9,"./init_midi":10,"./instrument":11,"./qambi":23,"./song":29}],9:[function(require,module,exports){
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

},{"./parse_audio":18,"./samples":25}],10:[function(require,module,exports){
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

},{"./util":32}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instrument = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sample = require('./sample');

var _init_audio = require('./init_audio');

var _note = require('./note');

var _parse_audio = require('./parse_audio');

var _util = require('./util');

var _eventlistener = require('./eventlistener');

var _fetch_helpers = require('./fetch_helpers');

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
        //console.log(sample)
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
        console.log(1, data.release[0], data.release[1]);
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
            console.log(2, data.release[0], data.release[1]);
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
        var sample = _this5.scheduledSamples[sampleId];
        //console.log(sample)
        _this5.scheduledSamples[sampleId].stop(_init_audio.context.currentTime, function () {
          //console.log('allNotesOff', sample.event.midiNoteId)
          delete _this5.scheduledSamples[sample.event.midiNoteId];
        });
      });
      this.scheduledSamples = {};

      //console.log('allNotesOff', this.sustainedSamples.length, this.scheduledSamples)
    }
  }]);

  return Instrument;
}();

},{"./eventlistener":6,"./fetch_helpers":7,"./init_audio":9,"./note":17,"./parse_audio":18,"./sample":24,"./util":32}],12:[function(require,module,exports){
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

var _instrument = require('./instrument');

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

      //console.log(this.precountDuration)

      this.precountEvents = this.createEvents(startBar, endBar, 'precount');
      this.precountEvents = (0, _parse_events.parseEvents)([].concat(_toConsumableArray(this.song._timeEvents), _toConsumableArray(this.precountEvents)));

      //console.log(songStartPosition.bar, endPos.bar, precount, this.precountEvents.length);
      //console.log(this.precountEvents, this.precountDuration);
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

},{"./constants":5,"./init_audio":9,"./instrument":11,"./midi_event":13,"./parse_events":19,"./part":20,"./position":22,"./track":31,"./util":32}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"./midi_event":13}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./midi_stream":15}],17:[function(require,module,exports){
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

},{"./util":32}],18:[function(require,module,exports){
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

var _eventlistener = require('./eventlistener');

var _qambi = require('./qambi');

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
        console.log('error decoding audiodata ' + e + ' [ID: ' + id + ']');
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

},{"./eventlistener":6,"./init_audio":9,"./qambi":23,"./util":32,"isomorphic-fetch":3}],19:[function(require,module,exports){
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

},{"./midi_note":14,"./util":32}],20:[function(require,module,exports){
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
        var _song$_events;

        (_song$_events = this._song._events).push.apply(_song$_events, events);
        track._songUpdate = true;
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

},{"./util":32}],21:[function(require,module,exports){
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

},{"./eventlistener.js":6,"./position.js":22,"./util.js":32}],22:[function(require,module,exports){
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

},{"./util":32}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instrument = exports.Part = exports.Track = exports.Song = exports.MIDINote = exports.MIDIEvent = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.parseMIDIFile = exports.parseSamples = exports.MIDIEventTypes = exports.getGMInstruments = exports.getInstruments = exports.setBufferTime = exports.init = undefined;

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

var _eventlistener = require('./eventlistener');

var getAudioContext = function getAudioContext() {
  return _init_audio.context;
};

var qambi = {
  version: '1.0.0-beta16',

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

},{"./constants":5,"./eventlistener":6,"./init":8,"./init_audio":9,"./init_midi":10,"./instrument":11,"./midi_event":13,"./midi_note":14,"./midifile":16,"./parse_audio":18,"./part":20,"./settings":28,"./song":29,"./track":31}],24:[function(require,module,exports){
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
      //console.log(event.data1, event.data2)
      this.source = _init_audio.context.createOscillator();
      this.source.type = 'sine';
      //console.log(event.frequency)
      this.source.frequency.value = event.frequency;
    } else {
      this.source = _init_audio.context.createBufferSource();
      //console.log(sampleData)
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
      var _sampleData = this.sampleData;
      var sustainStart = _sampleData.sustainStart;
      var sustainEnd = _sampleData.sustainEnd;
      var releaseEnvelopeArray = _sampleData.releaseEnvelopeArray;
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
        this.source.stop(time + releaseDuration);
        this.checkPhase();
      } else {
        this.source.stop(time);
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

  //console.log(settings.releaseEnvelope)
  switch (settings.releaseEnvelope) {

    case 'linear':
      gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + settings.releaseDuration);
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
}

function createSample() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(Sample, [null].concat(args)))();
}

},{"./init_audio.js":9,"./util.js":32}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{"filesaverjs":2}],27:[function(require,module,exports){
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

      this.timeEventsIndex = 0;
      this.songEventsIndex = 0;
      this.metronomeEventsIndex = 0;

      this.timeEvents = this.song._timeEvents;
      this.songEvents = this.song._events;
      this.songEvents.push(this.song._lastEvent);
      this.metronomeEvents = this.song._metronome.events;

      this.numTimeEvents = this.timeEvents.length;
      this.numSongEvents = this.songEvents.length;
      this.numMetronomeEvents = this.metronomeEvents.length;
    }
  }, {
    key: 'setTimeStamp',
    value: function setTimeStamp(timeStamp) {
      this.timeStamp = timeStamp;
    }
  }, {
    key: 'getEvents2',
    value: function getEvents2(maxtime, timestamp) {
      var loop = true;
      var event = void 0;
      var result = [];
      //console.log(this.timeEventsIndex, this.songEventsIndex, this.metronomeEventsIndex)
      while (loop) {

        var stop = false;

        if (this.timeEventsIndex < this.numTimeEvents) {
          event = this.timeEvents[this.timeEventsIndex];
          if (event.millis < maxtime) {
            this.millisPerTick = event.millisPerTick;
            //console.log(this.millisPerTick)
            this.timeEventsIndex++;
          } else {
            stop = true;
          }
        }

        if (this.songEventsIndex < this.numSongEvents) {
          event = this.songEvents[this.songEventsIndex];
          if (event.type === 0x2F) {
            loop = false;
            break;
          }
          var millis = event.ticks * this.millisPerTick;
          if (millis < maxtime) {
            event.time = millis + timestamp;
            event.millis = millis;
            result.push(event);
            this.songEventsIndex++;
          } else {
            stop = true;
          }
        }

        if (this.song.useMetronome === true && this.metronomeEventsIndex < this.numMetronomeEvents) {
          event = this.metronomeEvents[this.metronomeEventsIndex];
          var _millis = event.ticks * this.millisPerTick;
          if (_millis < maxtime) {
            event.time = _millis + timestamp;
            event.millis = _millis;
            result.push(event);
            this.metronomeEventsIndex++;
          } else {
            stop = true;
          }
        }

        if (stop) {
          loop = false;
          break;
        }
      }
      (0, _util.sortEvents)(result);
      return result;
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

        // i = 0
        // for(event of this.timeEvents){
        //   if(event.millis >= millis){
        //     this.timeEventsIndex = i;
        //     break;
        //   }
        //   i++;
        // }
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
        //console.log(this.songCurrentMillis)
        events = this.song._metronome.getPrecountEvents(this.maxtime);

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
        }
      } else {
        this.songCurrentMillis += diff;
        this.maxtime = this.songCurrentMillis + _settings.bufferTime;
        //events = this.song._getEvents2(this.maxtime, (this.timeStamp - this.songStartMillis))
        events = this.getEvents2(this.maxtime, this.timeStamp - this.songStartMillis);
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

},{"./init_audio":9,"./init_midi":10,"./midi_event":13,"./settings":28,"./util":32}],28:[function(require,module,exports){
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
}], ['shk-squareroot', {
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

var _save_midifile = require('./save_midifile');

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
    var _settings$playbackSpe = settings.playbackSpeed;
    this.playbackSpeed = _settings$playbackSpe === undefined ? _settings.defaultSong.playbackSpeed : _settings$playbackSpe;
    var _settings$autoQuantiz = settings.autoQuantize;
    this.autoQuantize = _settings$autoQuantiz === undefined ? _settings.defaultSong.autoQuantize : _settings$autoQuantiz;


    this._timeEvents = [new _midi_event.MIDIEvent(0, _constants.MIDIEventTypes.TEMPO, this.bpm), new _midi_event.MIDIEvent(0, _constants.MIDIEventTypes.TIME_SIGNATURE, this.nominator, this.denominator)];

    //this._timeEvents = []
    this._updateTimeEvents = true;
    this._lastEvent = new _midi_event.MIDIEvent(0, _constants.MIDIEventTypes.END_OF_TRACK);
    //this._lastEvent._part = {}
    //this._lastEvent._track = {}

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
    this._metronome.mute(!this.useMetronome);

    this._loop = false;
    this._leftLocator = { millis: 0, ticks: 0 };
    this._rightLocator = { millis: 0, ticks: 0 };
    this._illegalLoop = false;
    this._loopDuration = 0;
    this._precountBars = 0;
    this._endPrecountMillis = 0;
    //this.update()

    this._index = 0;
  }

  _createClass(Song, [{
    key: '_getEvents',
    value: function _getEvents(maxtime, timeStamp) {
      var result = [];

      //console.log(maxtime)
      for (var i = this._index, maxi = this._allEvents.length; i < maxi; i++) {

        var event = this._allEvents[i];
        //console.log(this._index, event)

        if (event.type === _constants.MIDIEventTypes.TEMPO || event.type === _constants.MIDIEventTypes.TIME_SIGNATURE) {
          if (event.millis < maxtime) {
            this.millisPerTick = event.millisPerTick;
            this._index++;
          } else {
            break;
          }
        } else {
          var millis = event.ticks * this.millisPerTick;
          if (millis < maxtime) {
            event.time = millis + timeStamp;
            event.millis = millis;
            result.push(event);
            this._index++;
          } else {
            break;
          }
        }
      }
      (0, _util.sortEvents)(result);
      return result;
    }
  }, {
    key: 'update',
    value: function update() {
      //console.log(this._events)
      if (this._updateTimeEvents) {
        this._updateTimeEvents = false;
        this._updateEvents = true;
        (0, _parse_events.parseTimeEvents)(this, this._timeEvents);
        this._metronome.getEvents();
      }
      if (this._updateEvents) {
        (0, _parse_events.parseMIDINotes)(this._events);
        //this._allEvents.push(...this._events, ...this._timeEvents)
        //sortEvents(this._allEvents)
        (0, _util.sortEvents)(this._events);
        console.log('update');
        var lastEvent = this._events[this._events.length - 1];
        var position = this._calculatePosition('ticks', lastEvent.ticks, 'millis');
        this._lastEvent.ticks = lastEvent.ticks;
        this._durationMillis = position.millis;
      }
      //console.log(position, lastEvent, this._durationMillis)
    }
  }, {
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
        var _events;

        track._song = _this2;
        track.connect(_this2._output);
        _this2._tracks.push(track);
        _this2._tracksById.set(track.id, track);
        (_events = _this2._events).push.apply(_events, _toConsumableArray(track._events));
      });
    }

    // prepare song events for playback

  }, {
    key: 'update_',
    value: function update_() {
      var _this3 = this;

      var createEventArray = false;

      if (this._updateTimeEvents === false && this._removedEvents.length === 0 && this._newEvents.length === 0 && this._movedEvents.length === 0 && this._newParts.length === 0 && this._removedParts.length === 0 && this._resized === false) {
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

      console.log('length', this._lastEvent.ticks, this._lastEvent.millis, this.bars);

      this._durationTicks = this._lastEvent.ticks;
      this._durationMillis = this._lastEvent.millis;
      console.log(this._durationTicks);
      this._playhead.updateSong();

      if (this.playing === false) {
        this._playhead.set('millis', this._currentMillis);
      }
      /*
          // add metronome events
          if(this._updateMetronomeEvents || this._metronome.bars !== this.bars){
            this._metronomeEvents = parseEvents([...this._timeEvents, ...this._metronome.getEvents()])
          }
          this._allEvents = [...this._metronomeEvents, ...this._events]
          sortEvents(this._allEvents)
          //console.log('all events %O', this._allEvents)
      */

      this._metronome.getEvents();
      this._allEvents = [].concat(_toConsumableArray(this._timeEvents), _toConsumableArray(this._events));
      (0, _util.sortEvents)(this._allEvents);

      this._newParts = [];
      this._removedParts = [];
      this._newEvents = [];
      this._movedEvents = [];
      this._removedEvents = [];
      this._resized = false;

      console.groupEnd('update song');
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

      //console.log(this._currentMillis)

      this._reference = this._timeStamp = _init_audio.context.currentTime * 1000;
      this._scheduler.setTimeStamp(this._reference);
      this._startMillis = this._currentMillis;

      if (this._precountBars > 0 && this._preparedForRecording) {
        var position = this.getPosition();
        // create precount events, the playhead will be moved to the first beat of the current bar
        this._metronome.createPrecountEvents(position.bar, position.bar + this._precountBars, this._reference);
        this._currentMillis = this._calculatePosition('barsbeats', [position.bar], 'millis').millis;
        this._precountDuration = this._metronome.precountDuration;
        this._endPrecountMillis = this._currentMillis + this._precountDuration;

        console.group('precount');
        console.log('position', this.getPosition());
        console.log('_currentMillis', this._currentMillis);
        console.log('endPrecountMillis', this._endPrecountMillis);
        console.log('_precountDuration', this._precountDuration);
        console.groupEnd('precount');
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
      console.log('STOP');
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

        if (this.recording !== true) {
          this.stop();
          return;
        } else if (this.autoSize !== true) {
          this.stop();
          return;
        }
        var _events2 = this._metronome.addEvents(this.bars, this.bars + 1);
        var tobeParsed = [].concat(_toConsumableArray(_events2), _toConsumableArray(this._timeEvents));
        (0, _util.sortEvents)(tobeParsed);
        (0, _parse_events.parseEvents)(tobeParsed);
        (_scheduler$events = this._scheduler.events).push.apply(_scheduler$events, _toConsumableArray(_events2));
        this._scheduler.numEvents += _events2.length;
        var lastEvent = _events2[_events2.length - 1];
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
  }]);

  return Song;
}();

},{"./constants":5,"./eventlistener":6,"./init_audio":9,"./metronome":12,"./midi_event":13,"./parse_events":19,"./playhead":21,"./position":22,"./save_midifile":26,"./scheduler":27,"./settings":28,"./song_from_midifile":30,"./util":32}],30:[function(require,module,exports){
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

},{"./fetch_helpers":7,"./midi_event":13,"./midifile":16,"./part":20,"./song":29,"./track":31,"./util":32,"isomorphic-fetch":3}],31:[function(require,module,exports){
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
        //console.log(this.name, event)
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

},{"./init_audio":9,"./init_midi":10,"./instrument":11,"./midi_event":13,"./midi_note":14,"./part":20,"./qambi":23,"./util":32}],32:[function(require,module,exports){
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

},{"isomorphic-fetch":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiYXNpYzMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZmlsZXNhdmVyanMvRmlsZVNhdmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtZmV0Y2gvZmV0Y2gtbnBtLWJyb3dzZXJpZnkuanMiLCIuLi9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwiLi4vc3JjL2NvbnN0YW50cy5qcyIsIi4uL3NyYy9ldmVudGxpc3RlbmVyLmpzIiwiLi4vc3JjL2ZldGNoX2hlbHBlcnMuanMiLCIuLi9zcmMvaW5pdC5qcyIsIi4uL3NyYy9pbml0X2F1ZGlvLmpzIiwiLi4vc3JjL2luaXRfbWlkaS5qcyIsIi4uL3NyYy9pbnN0cnVtZW50LmpzIiwiLi4vc3JjL21ldHJvbm9tZS5qcyIsIi4uL3NyYy9taWRpX2V2ZW50LmpzIiwiLi4vc3JjL21pZGlfbm90ZS5qcyIsIi4uL3NyYy9taWRpX3N0cmVhbS5qcyIsIi4uL3NyYy9taWRpZmlsZS5qcyIsIi4uL3NyYy9ub3RlLmpzIiwiLi4vc3JjL3BhcnNlX2F1ZGlvLmpzIiwiLi4vc3JjL3BhcnNlX2V2ZW50cy5qcyIsIi4uL3NyYy9wYXJ0LmpzIiwiLi4vc3JjL3BsYXloZWFkLmpzIiwiLi4vc3JjL3Bvc2l0aW9uLmpzIiwiLi4vc3JjL3FhbWJpLmpzIiwiLi4vc3JjL3NhbXBsZS5qcyIsIi4uL3NyYy9zYW1wbGVzLmpzIiwiLi4vc3JjL3NhdmVfbWlkaWZpbGUuanMiLCIuLi9zcmMvc2NoZWR1bGVyLmpzIiwiLi4vc3JjL3NldHRpbmdzLmpzIiwiLi4vc3JjL3NvbmcuanMiLCIuLi9zcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwiLi4vc3JjL3RyYWNrLmpzIiwiLi4vc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7QUFLQSxTQUFTLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFVOztBQUV0RCxrQkFBTSxJQUFOLEdBQ0MsSUFERCxDQUNNLFlBQU07O0FBRVYsZ0JBQUssaUJBQUwsQ0FBdUIsMEJBQXZCOztBQUFBLEtBRUMsSUFGRCxDQUVNLGdCQUFROztBQUVaLFVBQUksUUFBUSx1QkFBWjtBQUNBLFdBQUssU0FBTCxHQUFpQixPQUFqQixDQUF5QixpQkFBUztBQUNoQyxjQUFNLGFBQU4sQ0FBb0IsS0FBcEI7QUFDRCxPQUZEOztBQUlBLFdBQUssWUFBTCxDQUFrQixJQUFsQjtBQUNBLFdBQUssSUFBTDs7Ozs7QUFLRCxLQWZEO0FBZ0JELEdBbkJEO0FBb0JELENBdEJEOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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S0FBWjtBQUNBLFFBQUcsTUFBTSxXQUFXLENBQXBCLEVBQXNCO0FBQ3BCLGFBQU8sQ0FBUCxJQUFZLFNBQVMsUUFBVCxHQUFvQixDQUFwQixHQUF3QixDQUFwQztBQUNEO0FBQ0Y7QUFDRCxTQUFPLE1BQVA7QUFDRDs7QUFHTSxTQUFTLGVBQVQsQ0FBeUIsS0FBekIsRUFBK0I7O0FBRXBDLE1BQUcsTUFBTSxLQUFOLENBQUgsRUFBZ0I7QUFDZCxZQUFRLElBQVIsQ0FBYSx5QkFBYjtBQUNBLFdBQU8sS0FBUDtBQUNEO0FBQ0QsTUFBRyxRQUFRLENBQVIsSUFBYSxRQUFRLEdBQXhCLEVBQTRCO0FBQzFCLFlBQVEsSUFBUixDQUFhLDJDQUFiO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7QUFDRCxTQUFPLEtBQVA7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgcWFtYmksIHtcbiAgSW5zdHJ1bWVudCxcbiAgU29uZyxcbn0gZnJvbSAnLi4vLi4vc3JjL3FhbWJpJ1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblxuICBxYW1iaS5pbml0KClcbiAgLnRoZW4oKCkgPT4ge1xuXG4gICAgU29uZy5mcm9tTUlESUZpbGVBc3luYygnLi4vZGF0YS9taW51dGVfd2FsdHoubWlkJylcbiAgICAvL1NvbmcuZnJvbU1JRElGaWxlQXN5bmMoJy4uL2RhdGEvbW96azU0NWEubWlkJylcbiAgICAudGhlbihzb25nID0+IHtcblxuICAgICAgbGV0IHBpYW5vID0gbmV3IEluc3RydW1lbnQoKVxuICAgICAgc29uZy5nZXRUcmFja3MoKS5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgICAgdHJhY2suc2V0SW5zdHJ1bWVudChwaWFubylcbiAgICAgIH0pXG5cbiAgICAgIHNvbmcuc2V0TWV0cm9ub21lKHRydWUpXG4gICAgICBzb25nLnBsYXkoKVxuICAgICAgLy8gcGlhbm8ucGFyc2VTYW1wbGVEYXRhKHt1cmw6ICdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vYWJ1ZGFhbi9xYW1iaS9naC1wYWdlcy9pbnN0cnVtZW50cy9oZWFydGJlYXQvY2l0eS1waWFuby1saWdodC5qc29uJ30pXG4gICAgICAvLyAudGhlbigoKSA9PiB7XG4gICAgICAvLyAgIHNvbmcucGxheSgpXG4gICAgICAvLyB9KVxuICAgIH0pXG4gIH0pXG59KVxuIiwiLyogRmlsZVNhdmVyLmpzXG4gKiBBIHNhdmVBcygpIEZpbGVTYXZlciBpbXBsZW1lbnRhdGlvbi5cbiAqIDEuMS4yMDE2MDMyOFxuICpcbiAqIEJ5IEVsaSBHcmV5LCBodHRwOi8vZWxpZ3JleS5jb21cbiAqIExpY2Vuc2U6IE1JVFxuICogICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2VsaWdyZXkvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0UubWRcbiAqL1xuXG4vKmdsb2JhbCBzZWxmICovXG4vKmpzbGludCBiaXR3aXNlOiB0cnVlLCBpbmRlbnQ6IDQsIGxheGJyZWFrOiB0cnVlLCBsYXhjb21tYTogdHJ1ZSwgc21hcnR0YWJzOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSAqL1xuXG4vKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvRmlsZVNhdmVyLmpzL2Jsb2IvbWFzdGVyL0ZpbGVTYXZlci5qcyAqL1xuXG52YXIgc2F2ZUFzID0gc2F2ZUFzIHx8IChmdW5jdGlvbih2aWV3KSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHQvLyBJRSA8MTAgaXMgZXhwbGljaXRseSB1bnN1cHBvcnRlZFxuXHRpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiAvTVNJRSBbMS05XVxcLi8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkge1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXJcblx0XHQgIGRvYyA9IHZpZXcuZG9jdW1lbnRcblx0XHQgIC8vIG9ubHkgZ2V0IFVSTCB3aGVuIG5lY2Vzc2FyeSBpbiBjYXNlIEJsb2IuanMgaGFzbid0IG92ZXJyaWRkZW4gaXQgeWV0XG5cdFx0LCBnZXRfVVJMID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdmlldy5VUkwgfHwgdmlldy53ZWJraXRVUkwgfHwgdmlldztcblx0XHR9XG5cdFx0LCBzYXZlX2xpbmsgPSBkb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLCBcImFcIilcblx0XHQsIGNhbl91c2Vfc2F2ZV9saW5rID0gXCJkb3dubG9hZFwiIGluIHNhdmVfbGlua1xuXHRcdCwgY2xpY2sgPSBmdW5jdGlvbihub2RlKSB7XG5cdFx0XHR2YXIgZXZlbnQgPSBuZXcgTW91c2VFdmVudChcImNsaWNrXCIpO1xuXHRcdFx0bm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcblx0XHR9XG5cdFx0LCBpc19zYWZhcmkgPSAvVmVyc2lvblxcL1tcXGRcXC5dKy4qU2FmYXJpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXG5cdFx0LCB3ZWJraXRfcmVxX2ZzID0gdmlldy53ZWJraXRSZXF1ZXN0RmlsZVN5c3RlbVxuXHRcdCwgcmVxX2ZzID0gdmlldy5yZXF1ZXN0RmlsZVN5c3RlbSB8fCB3ZWJraXRfcmVxX2ZzIHx8IHZpZXcubW96UmVxdWVzdEZpbGVTeXN0ZW1cblx0XHQsIHRocm93X291dHNpZGUgPSBmdW5jdGlvbihleCkge1xuXHRcdFx0KHZpZXcuc2V0SW1tZWRpYXRlIHx8IHZpZXcuc2V0VGltZW91dCkoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRocm93IGV4O1xuXHRcdFx0fSwgMCk7XG5cdFx0fVxuXHRcdCwgZm9yY2Vfc2F2ZWFibGVfdHlwZSA9IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCJcblx0XHQsIGZzX21pbl9zaXplID0gMFxuXHRcdC8vIHRoZSBCbG9iIEFQSSBpcyBmdW5kYW1lbnRhbGx5IGJyb2tlbiBhcyB0aGVyZSBpcyBubyBcImRvd25sb2FkZmluaXNoZWRcIiBldmVudCB0byBzdWJzY3JpYmUgdG9cblx0XHQsIGFyYml0cmFyeV9yZXZva2VfdGltZW91dCA9IDEwMDAgKiA0MCAvLyBpbiBtc1xuXHRcdCwgcmV2b2tlID0gZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0dmFyIHJldm9rZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBmaWxlID09PSBcInN0cmluZ1wiKSB7IC8vIGZpbGUgaXMgYW4gb2JqZWN0IFVSTFxuXHRcdFx0XHRcdGdldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSk7XG5cdFx0XHRcdH0gZWxzZSB7IC8vIGZpbGUgaXMgYSBGaWxlXG5cdFx0XHRcdFx0ZmlsZS5yZW1vdmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdC8qIC8vIFRha2Ugbm90ZSBXM0M6XG5cdFx0XHR2YXJcblx0XHRcdCAgdXJpID0gdHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIgPyBmaWxlIDogZmlsZS50b1VSTCgpXG5cdFx0XHQsIHJldm9rZXIgPSBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0Ly8gaWRlYWx5IERvd25sb2FkRmluaXNoZWRFdmVudC5kYXRhIHdvdWxkIGJlIHRoZSBVUkwgcmVxdWVzdGVkXG5cdFx0XHRcdGlmIChldnQuZGF0YSA9PT0gdXJpKSB7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBmaWxlID09PSBcInN0cmluZ1wiKSB7IC8vIGZpbGUgaXMgYW4gb2JqZWN0IFVSTFxuXHRcdFx0XHRcdFx0Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKTtcblx0XHRcdFx0XHR9IGVsc2UgeyAvLyBmaWxlIGlzIGEgRmlsZVxuXHRcdFx0XHRcdFx0ZmlsZS5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdDtcblx0XHRcdHZpZXcuYWRkRXZlbnRMaXN0ZW5lcihcImRvd25sb2FkZmluaXNoZWRcIiwgcmV2b2tlcik7XG5cdFx0XHQqL1xuXHRcdFx0c2V0VGltZW91dChyZXZva2VyLCBhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQpO1xuXHRcdH1cblx0XHQsIGRpc3BhdGNoID0gZnVuY3Rpb24oZmlsZXNhdmVyLCBldmVudF90eXBlcywgZXZlbnQpIHtcblx0XHRcdGV2ZW50X3R5cGVzID0gW10uY29uY2F0KGV2ZW50X3R5cGVzKTtcblx0XHRcdHZhciBpID0gZXZlbnRfdHlwZXMubGVuZ3RoO1xuXHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHR2YXIgbGlzdGVuZXIgPSBmaWxlc2F2ZXJbXCJvblwiICsgZXZlbnRfdHlwZXNbaV1dO1xuXHRcdFx0XHRpZiAodHlwZW9mIGxpc3RlbmVyID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0bGlzdGVuZXIuY2FsbChmaWxlc2F2ZXIsIGV2ZW50IHx8IGZpbGVzYXZlcik7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXgpIHtcblx0XHRcdFx0XHRcdHRocm93X291dHNpZGUoZXgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHQsIGF1dG9fYm9tID0gZnVuY3Rpb24oYmxvYikge1xuXHRcdFx0Ly8gcHJlcGVuZCBCT00gZm9yIFVURi04IFhNTCBhbmQgdGV4dC8qIHR5cGVzIChpbmNsdWRpbmcgSFRNTClcblx0XHRcdGlmICgvXlxccyooPzp0ZXh0XFwvXFxTKnxhcHBsaWNhdGlvblxcL3htbHxcXFMqXFwvXFxTKlxcK3htbClcXHMqOy4qY2hhcnNldFxccyo9XFxzKnV0Zi04L2kudGVzdChibG9iLnR5cGUpKSB7XG5cdFx0XHRcdHJldHVybiBuZXcgQmxvYihbXCJcXHVmZWZmXCIsIGJsb2JdLCB7dHlwZTogYmxvYi50eXBlfSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYmxvYjtcblx0XHR9XG5cdFx0LCBGaWxlU2F2ZXIgPSBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0aWYgKCFub19hdXRvX2JvbSkge1xuXHRcdFx0XHRibG9iID0gYXV0b19ib20oYmxvYik7XG5cdFx0XHR9XG5cdFx0XHQvLyBGaXJzdCB0cnkgYS5kb3dubG9hZCwgdGhlbiB3ZWIgZmlsZXN5c3RlbSwgdGhlbiBvYmplY3QgVVJMc1xuXHRcdFx0dmFyXG5cdFx0XHRcdCAgZmlsZXNhdmVyID0gdGhpc1xuXHRcdFx0XHQsIHR5cGUgPSBibG9iLnR5cGVcblx0XHRcdFx0LCBibG9iX2NoYW5nZWQgPSBmYWxzZVxuXHRcdFx0XHQsIG9iamVjdF91cmxcblx0XHRcdFx0LCB0YXJnZXRfdmlld1xuXHRcdFx0XHQsIGRpc3BhdGNoX2FsbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGRpc3BhdGNoKGZpbGVzYXZlciwgXCJ3cml0ZXN0YXJ0IHByb2dyZXNzIHdyaXRlIHdyaXRlZW5kXCIuc3BsaXQoXCIgXCIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBvbiBhbnkgZmlsZXN5cyBlcnJvcnMgcmV2ZXJ0IHRvIHNhdmluZyB3aXRoIG9iamVjdCBVUkxzXG5cdFx0XHRcdCwgZnNfZXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZiAodGFyZ2V0X3ZpZXcgJiYgaXNfc2FmYXJpICYmIHR5cGVvZiBGaWxlUmVhZGVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdFx0XHQvLyBTYWZhcmkgZG9lc24ndCBhbGxvdyBkb3dubG9hZGluZyBvZiBibG9iIHVybHNcblx0XHRcdFx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdFx0XHRcdFx0cmVhZGVyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgYmFzZTY0RGF0YSA9IHJlYWRlci5yZXN1bHQ7XG5cdFx0XHRcdFx0XHRcdHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBcImRhdGE6YXR0YWNobWVudC9maWxlXCIgKyBiYXNlNjREYXRhLnNsaWNlKGJhc2U2NERhdGEuc2VhcmNoKC9bLDtdLykpO1xuXHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTtcblx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLklOSVQ7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGRvbid0IGNyZWF0ZSBtb3JlIG9iamVjdCBVUkxzIHRoYW4gbmVlZGVkXG5cdFx0XHRcdFx0aWYgKGJsb2JfY2hhbmdlZCB8fCAhb2JqZWN0X3VybCkge1xuXHRcdFx0XHRcdFx0b2JqZWN0X3VybCA9IGdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0YXJnZXRfdmlldykge1xuXHRcdFx0XHRcdFx0dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHZhciBuZXdfdGFiID0gdmlldy5vcGVuKG9iamVjdF91cmwsIFwiX2JsYW5rXCIpO1xuXHRcdFx0XHRcdFx0aWYgKG5ld190YWIgPT09IHVuZGVmaW5lZCAmJiBpc19zYWZhcmkpIHtcblx0XHRcdFx0XHRcdFx0Ly9BcHBsZSBkbyBub3QgYWxsb3cgd2luZG93Lm9wZW4sIHNlZSBodHRwOi8vYml0Lmx5LzFrWmZmUklcblx0XHRcdFx0XHRcdFx0dmlldy5sb2NhdGlvbi5ocmVmID0gb2JqZWN0X3VybFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdHJldm9rZShvYmplY3RfdXJsKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQsIGFib3J0YWJsZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcblx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZiAoZmlsZXNhdmVyLnJlYWR5U3RhdGUgIT09IGZpbGVzYXZlci5ET05FKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XHQsIGNyZWF0ZV9pZl9ub3RfZm91bmQgPSB7Y3JlYXRlOiB0cnVlLCBleGNsdXNpdmU6IGZhbHNlfVxuXHRcdFx0XHQsIHNsaWNlXG5cdFx0XHQ7XG5cdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5JTklUO1xuXHRcdFx0aWYgKCFuYW1lKSB7XG5cdFx0XHRcdG5hbWUgPSBcImRvd25sb2FkXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2FuX3VzZV9zYXZlX2xpbmspIHtcblx0XHRcdFx0b2JqZWN0X3VybCA9IGdldF9VUkwoKS5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c2F2ZV9saW5rLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdHNhdmVfbGluay5kb3dubG9hZCA9IG5hbWU7XG5cdFx0XHRcdFx0Y2xpY2soc2F2ZV9saW5rKTtcblx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRyZXZva2Uob2JqZWN0X3VybCk7XG5cdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdC8vIE9iamVjdCBhbmQgd2ViIGZpbGVzeXN0ZW0gVVJMcyBoYXZlIGEgcHJvYmxlbSBzYXZpbmcgaW4gR29vZ2xlIENocm9tZSB3aGVuXG5cdFx0XHQvLyB2aWV3ZWQgaW4gYSB0YWIsIHNvIEkgZm9yY2Ugc2F2ZSB3aXRoIGFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVxuXHRcdFx0Ly8gaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9OTExNThcblx0XHRcdC8vIFVwZGF0ZTogR29vZ2xlIGVycmFudGx5IGNsb3NlZCA5MTE1OCwgSSBzdWJtaXR0ZWQgaXQgYWdhaW46XG5cdFx0XHQvLyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9Mzg5NjQyXG5cdFx0XHRpZiAodmlldy5jaHJvbWUgJiYgdHlwZSAmJiB0eXBlICE9PSBmb3JjZV9zYXZlYWJsZV90eXBlKSB7XG5cdFx0XHRcdHNsaWNlID0gYmxvYi5zbGljZSB8fCBibG9iLndlYmtpdFNsaWNlO1xuXHRcdFx0XHRibG9iID0gc2xpY2UuY2FsbChibG9iLCAwLCBibG9iLnNpemUsIGZvcmNlX3NhdmVhYmxlX3R5cGUpO1xuXHRcdFx0XHRibG9iX2NoYW5nZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0Ly8gU2luY2UgSSBjYW4ndCBiZSBzdXJlIHRoYXQgdGhlIGd1ZXNzZWQgbWVkaWEgdHlwZSB3aWxsIHRyaWdnZXIgYSBkb3dubG9hZFxuXHRcdFx0Ly8gaW4gV2ViS2l0LCBJIGFwcGVuZCAuZG93bmxvYWQgdG8gdGhlIGZpbGVuYW1lLlxuXHRcdFx0Ly8gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTY1NDQwXG5cdFx0XHRpZiAod2Via2l0X3JlcV9mcyAmJiBuYW1lICE9PSBcImRvd25sb2FkXCIpIHtcblx0XHRcdFx0bmFtZSArPSBcIi5kb3dubG9hZFwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGUgPT09IGZvcmNlX3NhdmVhYmxlX3R5cGUgfHwgd2Via2l0X3JlcV9mcykge1xuXHRcdFx0XHR0YXJnZXRfdmlldyA9IHZpZXc7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXJlcV9mcykge1xuXHRcdFx0XHRmc19lcnJvcigpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRmc19taW5fc2l6ZSArPSBibG9iLnNpemU7XG5cdFx0XHRyZXFfZnModmlldy5URU1QT1JBUlksIGZzX21pbl9zaXplLCBhYm9ydGFibGUoZnVuY3Rpb24oZnMpIHtcblx0XHRcdFx0ZnMucm9vdC5nZXREaXJlY3RvcnkoXCJzYXZlZFwiLCBjcmVhdGVfaWZfbm90X2ZvdW5kLCBhYm9ydGFibGUoZnVuY3Rpb24oZGlyKSB7XG5cdFx0XHRcdFx0dmFyIHNhdmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRpci5nZXRGaWxlKG5hbWUsIGNyZWF0ZV9pZl9ub3RfZm91bmQsIGFib3J0YWJsZShmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdFx0XHRcdGZpbGUuY3JlYXRlV3JpdGVyKGFib3J0YWJsZShmdW5jdGlvbih3cml0ZXIpIHtcblx0XHRcdFx0XHRcdFx0XHR3cml0ZXIub253cml0ZWVuZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gZmlsZS50b1VSTCgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRcdFx0XHRcdGRpc3BhdGNoKGZpbGVzYXZlciwgXCJ3cml0ZWVuZFwiLCBldmVudCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXZva2UoZmlsZSk7XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHR3cml0ZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIGVycm9yID0gd3JpdGVyLmVycm9yO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGVycm9yLmNvZGUgIT09IGVycm9yLkFCT1JUX0VSUikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRmc19lcnJvcigpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XCJ3cml0ZXN0YXJ0IHByb2dyZXNzIHdyaXRlIGFib3J0XCIuc3BsaXQoXCIgXCIpLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHdyaXRlcltcIm9uXCIgKyBldmVudF0gPSBmaWxlc2F2ZXJbXCJvblwiICsgZXZlbnRdO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci53cml0ZShibG9iKTtcblx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIuYWJvcnQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHdyaXRlci5hYm9ydCgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLldSSVRJTkc7XG5cdFx0XHRcdFx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0XHRcdFx0XHR9KSwgZnNfZXJyb3IpO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0ZGlyLmdldEZpbGUobmFtZSwge2NyZWF0ZTogZmFsc2V9LCBhYm9ydGFibGUoZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHRcdFx0Ly8gZGVsZXRlIGZpbGUgaWYgaXQgYWxyZWFkeSBleGlzdHNcblx0XHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRzYXZlKCk7XG5cdFx0XHRcdFx0fSksIGFib3J0YWJsZShmdW5jdGlvbihleCkge1xuXHRcdFx0XHRcdFx0aWYgKGV4LmNvZGUgPT09IGV4Lk5PVF9GT1VORF9FUlIpIHtcblx0XHRcdFx0XHRcdFx0c2F2ZSgpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0ZnNfZXJyb3IoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSk7XG5cdFx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0XHR9KSwgZnNfZXJyb3IpO1xuXHRcdH1cblx0XHQsIEZTX3Byb3RvID0gRmlsZVNhdmVyLnByb3RvdHlwZVxuXHRcdCwgc2F2ZUFzID0gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdHJldHVybiBuZXcgRmlsZVNhdmVyKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKTtcblx0XHR9XG5cdDtcblx0Ly8gSUUgMTArIChuYXRpdmUgc2F2ZUFzKVxuXHRpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYikge1xuXHRcdHJldHVybiBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0aWYgKCFub19hdXRvX2JvbSkge1xuXHRcdFx0XHRibG9iID0gYXV0b19ib20oYmxvYik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmF2aWdhdG9yLm1zU2F2ZU9yT3BlbkJsb2IoYmxvYiwgbmFtZSB8fCBcImRvd25sb2FkXCIpO1xuXHRcdH07XG5cdH1cblxuXHRGU19wcm90by5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmaWxlc2F2ZXIgPSB0aGlzO1xuXHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcImFib3J0XCIpO1xuXHR9O1xuXHRGU19wcm90by5yZWFkeVN0YXRlID0gRlNfcHJvdG8uSU5JVCA9IDA7XG5cdEZTX3Byb3RvLldSSVRJTkcgPSAxO1xuXHRGU19wcm90by5ET05FID0gMjtcblxuXHRGU19wcm90by5lcnJvciA9XG5cdEZTX3Byb3RvLm9ud3JpdGVzdGFydCA9XG5cdEZTX3Byb3RvLm9ucHJvZ3Jlc3MgPVxuXHRGU19wcm90by5vbndyaXRlID1cblx0RlNfcHJvdG8ub25hYm9ydCA9XG5cdEZTX3Byb3RvLm9uZXJyb3IgPVxuXHRGU19wcm90by5vbndyaXRlZW5kID1cblx0XHRudWxsO1xuXG5cdHJldHVybiBzYXZlQXM7XG59KFxuXHQgICB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBzZWxmXG5cdHx8IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgd2luZG93XG5cdHx8IHRoaXMuY29udGVudFxuKSk7XG4vLyBgc2VsZmAgaXMgdW5kZWZpbmVkIGluIEZpcmVmb3ggZm9yIEFuZHJvaWQgY29udGVudCBzY3JpcHQgY29udGV4dFxuLy8gd2hpbGUgYHRoaXNgIGlzIG5zSUNvbnRlbnRGcmFtZU1lc3NhZ2VNYW5hZ2VyXG4vLyB3aXRoIGFuIGF0dHJpYnV0ZSBgY29udGVudGAgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgd2luZG93XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzLnNhdmVBcyA9IHNhdmVBcztcbn0gZWxzZSBpZiAoKHR5cGVvZiBkZWZpbmUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGVmaW5lICE9PSBudWxsKSAmJiAoZGVmaW5lLmFtZCAhPT0gbnVsbCkpIHtcbiAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gc2F2ZUFzO1xuICB9KTtcbn1cbiIsIi8vIHRoZSB3aGF0d2ctZmV0Y2ggcG9seWZpbGwgaW5zdGFsbHMgdGhlIGZldGNoKCkgZnVuY3Rpb25cbi8vIG9uIHRoZSBnbG9iYWwgb2JqZWN0ICh3aW5kb3cgb3Igc2VsZilcbi8vXG4vLyBSZXR1cm4gdGhhdCBhcyB0aGUgZXhwb3J0IGZvciB1c2UgaW4gV2VicGFjaywgQnJvd3NlcmlmeSBldGMuXG5yZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKTtcbm1vZHVsZS5leHBvcnRzID0gc2VsZi5mZXRjaC5iaW5kKHNlbGYpO1xuIiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMubWFwKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRoaXMubWFwW25hbWVdLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcylcbiAgICAgIH0sIHRoaXMpXG4gICAgfSwgdGhpcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKG5hbWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHsgaXRlbXMucHVzaCh2YWx1ZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIC8vIE9ubHkgc3VwcG9ydCBBcnJheUJ1ZmZlcnMgZm9yIFBPU1QgbWV0aG9kLlxuICAgICAgICAvLyBSZWNlaXZpbmcgQXJyYXlCdWZmZXJzIGhhcHBlbnMgdmlhIEJsb2JzLCBpbnN0ZWFkLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQgOiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG4gICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpKSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gaW5wdXRcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gaGVhZGVycyh4aHIpIHtcbiAgICB2YXIgaGVhZCA9IG5ldyBIZWFkZXJzKClcbiAgICB2YXIgcGFpcnMgPSAoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdFxuICAgICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICAgIHJlcXVlc3QgPSBpbnB1dFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMoeGhyKSxcbiAgICAgICAgICB1cmw6IHJlc3BvbnNlVVJMKClcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiXG4vLyBzdGFuZGFyZCBNSURJIGV2ZW50c1xuY29uc3QgTUlESUV2ZW50VHlwZXMgPSB7fVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09GRicsIHt2YWx1ZTogMHg4MH0pIC8vMTI4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09OJywge3ZhbHVlOiAweDkwfSkgLy8xNDRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BPTFlfUFJFU1NVUkUnLCB7dmFsdWU6IDB4QTB9KSAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVFJPTF9DSEFOR0UnLCB7dmFsdWU6IDB4QjB9KSAvLzE3NlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUFJPR1JBTV9DSEFOR0UnLCB7dmFsdWU6IDB4QzB9KSAvLzE5MlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ0hBTk5FTF9QUkVTU1VSRScsIHt2YWx1ZTogMHhEMH0pIC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQSVRDSF9CRU5EJywge3ZhbHVlOiAweEUwfSkgLy8yMjRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NZU1RFTV9FWENMVVNJVkUnLCB7dmFsdWU6IDB4RjB9KSAvLzI0MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTUlESV9USU1FQ09ERScsIHt2YWx1ZTogMjQxfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfUE9TSVRJT04nLCB7dmFsdWU6IDI0Mn0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTT05HX1NFTEVDVCcsIHt2YWx1ZTogMjQzfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RVTkVfUkVRVUVTVCcsIHt2YWx1ZTogMjQ2fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0VPWCcsIHt2YWx1ZTogMjQ3fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RJTUlOR19DTE9DSycsIHt2YWx1ZTogMjQ4fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NUQVJUJywge3ZhbHVlOiAyNTB9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVElOVUUnLCB7dmFsdWU6IDI1MX0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTVE9QJywge3ZhbHVlOiAyNTJ9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQUNUSVZFX1NFTlNJTkcnLCB7dmFsdWU6IDI1NH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTWVNURU1fUkVTRVQnLCB7dmFsdWU6IDI1NX0pXG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVEVNUE8nLCB7dmFsdWU6IDB4NTF9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNRV9TSUdOQVRVUkUnLCB7dmFsdWU6IDB4NTh9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU5EX09GX1RSQUNLJywge3ZhbHVlOiAweDJGfSlcblxuZXhwb3J0IHtNSURJRXZlbnRUeXBlc31cbiIsImxldCBldmVudExpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldmVudCl7XG4gIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSlcbiAgbGV0IG1hcFxuXG4gIGlmKGV2ZW50LnR5cGUgPT09ICdldmVudCcpe1xuICAgIGxldCBtaWRpRXZlbnQgPSBldmVudC5kYXRhXG4gICAgbGV0IG1pZGlFdmVudFR5cGUgPSBtaWRpRXZlbnQudHlwZVxuICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50VHlwZSlcbiAgICBpZihldmVudExpc3RlbmVycy5oYXMobWlkaUV2ZW50VHlwZSkpe1xuICAgICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudFR5cGUpXG4gICAgICBmb3IobGV0IGNiIG9mIG1hcC52YWx1ZXMoKSl7XG4gICAgICAgIGNiKG1pZGlFdmVudClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUsIGV2ZW50TGlzdGVuZXJzLmhhcyhldmVudC50eXBlKSlcbiAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKGV2ZW50LnR5cGUpID09PSBmYWxzZSl7XG4gICAgcmV0dXJuXG4gIH1cblxuICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnQudHlwZSlcbiAgZm9yKGxldCBjYiBvZiBtYXAudmFsdWVzKCkpe1xuICAgIGNiKGV2ZW50KVxuICB9XG5cblxuICAvLyBAdG9kbzogcnVuIGZpbHRlcnMgaGVyZSwgZm9yIGluc3RhbmNlIGlmIGFuIGV2ZW50bGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgdG8gYWxsIE5PVEVfT04gZXZlbnRzLCBjaGVjayB0aGUgdHlwZSBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGNhbGxiYWNrKXtcblxuICBsZXQgbWFwXG4gIGxldCBpZCA9IGAke3R5cGV9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuXG4gIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSA9PT0gZmFsc2Upe1xuICAgIG1hcCA9IG5ldyBNYXAoKVxuICAgIGV2ZW50TGlzdGVuZXJzLnNldCh0eXBlLCBtYXApXG4gIH1lbHNle1xuICAgIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKVxuICB9XG5cbiAgbWFwLnNldChpZCwgY2FsbGJhY2spXG4gIC8vY29uc29sZS5sb2coZXZlbnRMaXN0ZW5lcnMpXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcblxuICBpZihldmVudExpc3RlbmVycy5oYXModHlwZSkgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmxvZygnbm8gZXZlbnRsaXN0ZW5lcnMgb2YgdHlwZScgKyB0eXBlKVxuICAgIHJldHVyblxuICB9XG5cbiAgbGV0IG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKVxuXG4gIGlmKHR5cGVvZiBpZCA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgZm9yKGxldCBba2V5LCB2YWx1ZV0gb2YgbWFwLmVudHJpZXMoKSkge1xuICAgICAgY29uc29sZS5sb2coa2V5LCB2YWx1ZSlcbiAgICAgIGlmKHZhbHVlID09PSBpZCl7XG4gICAgICAgIGNvbnNvbGUubG9nKGtleSlcbiAgICAgICAgaWQgPSBrZXlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYodHlwZW9mIGlkID09PSAnc3RyaW5nJyl7XG4gICAgICBtYXAuZGVsZXRlKGlkKVxuICAgIH1cbiAgfWVsc2UgaWYodHlwZW9mIGlkID09PSAnc3RyaW5nJyl7XG4gICAgbWFwLmRlbGV0ZShpZClcbiAgfWVsc2V7XG4gICAgY29uc29sZS5sb2coJ2NvdWxkIG5vdCByZW1vdmUgZXZlbnRsaXN0ZW5lcicpXG4gIH1cbn1cblxuIiwiLy8gZmV0Y2ggaGVscGVyc1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhdHVzKHJlc3BvbnNlKSB7XG4gIGlmKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKXtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3BvbnNlKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpXG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGpzb24ocmVzcG9uc2Upe1xuICByZXR1cm4gcmVzcG9uc2UuanNvbigpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUJ1ZmZlcihyZXNwb25zZSl7XG4gIHJldHVybiByZXNwb25zZS5hcnJheUJ1ZmZlcigpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoSlNPTih1cmwpe1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGZldGNoKHVybClcbiAgICAudGhlbihzdGF0dXMpXG4gICAgLnRoZW4oanNvbilcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJlc29sdmUoZGF0YSlcbiAgICB9KVxuICAgIC5jYXRjaChlID0+IHtcbiAgICAgIHJlamVjdChlKVxuICAgIH0pXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaEFycmF5YnVmZmVyKHVybCl7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihhcnJheUJ1ZmZlcilcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJlc29sdmUoZGF0YSlcbiAgICB9KVxuICAgIC5jYXRjaChlID0+IHtcbiAgICAgIHJlamVjdChlKVxuICAgIH0pXG4gIH0pXG59XG4iLCJpbXBvcnQgcWFtYmkgZnJvbSAnLi9xYW1iaSdcbmltcG9ydCB7U29uZ30gZnJvbSAnLi9zb25nJ1xuaW1wb3J0IHtJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5pbXBvcnQge2luaXRBdWRpb30gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtpbml0TUlESX0gZnJvbSAnLi9pbml0X21pZGknXG5cbmV4cG9ydCBsZXQgZ2V0VXNlck1lZGlhID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWFcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ2dldFVzZXJNZWRpYSBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmV4cG9ydCBsZXQgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ3JlcXVlc3RBbmltYXRpb25GcmFtZSBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmV4cG9ydCBsZXQgQmxvYiA9ICgoKSA9PiB7XG4gIGlmKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gd2luZG93LkJsb2IgfHwgd2luZG93LndlYmtpdEJsb2JcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ0Jsb2IgaXMgbm90IGF2YWlsYWJsZScpXG4gIH1cbn0pKClcblxuXG5mdW5jdGlvbiBsb2FkSW5zdHJ1bWVudChkYXRhKXtcbiAgbGV0IGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudCgpXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaW5zdHJ1bWVudC5wYXJzZVNhbXBsZURhdGEoZGF0YSlcbiAgICAudGhlbigoKSA9PiByZXNvbHZlKGluc3RydW1lbnQpKVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChzZXR0aW5ncyA9IG51bGwpOiB2b2lke1xuXG4gIC8vIGxvYWQgc2V0dGluZ3MuaW5zdHJ1bWVudHMgKGFycmF5IG9yIG9iamVjdClcbiAgLy8gbG9hZCBzZXR0aW5ncy5taWRpZmlsZXMgKGFycmF5IG9yIG9iamVjdClcbiAgLypcblxuICBxYW1iaS5pbml0KHtcbiAgICBzb25nOiB7XG4gICAgICB0eXBlOiAnU29uZycsXG4gICAgICB1cmw6ICcuLi9kYXRhL21pbnV0ZV93YWx0ei5taWQnXG4gICAgfSxcbiAgICBwaWFubzoge1xuICAgICAgdHlwZTogJ0luc3RydW1lbnQnLFxuICAgICAgdXJsOiAnLi4vLi4vaW5zdHJ1bWVudHMvZWxlY3RyaWMtcGlhbm8uanNvbidcbiAgICB9XG4gIH0pXG5cbiAgcWFtYmkuaW5pdCh7XG4gICAgaW5zdHJ1bWVudHM6IFsnLi4vaW5zdHJ1bWVudHMvcGlhbm8nLCAnLi4vaW5zdHJ1bWVudHMvdmlvbGluJ10sXG4gICAgbWlkaWZpbGVzOiBbJy4uL21pZGkvbW96YXJ0Lm1pZCddXG4gIH0pXG4gIC50aGVuKChsb2FkZWQpID0+IHtcbiAgICBsZXQgW3BpYW5vLCB2aW9saW5dID0gbG9hZGVkLmluc3RydW1lbnRzXG4gICAgbGV0IFttb3phcnRdID0gbG9hZGVkLm1pZGlmaWxlc1xuICB9KVxuXG4gICovXG5cbiAgbGV0IHByb21pc2VzID0gW2luaXRBdWRpbygpLCBpbml0TUlESSgpXVxuICBsZXQgbG9hZEtleXNcblxuICBpZihzZXR0aW5ncyAhPT0gbnVsbCl7XG4gICAgbG9hZEtleXMgPSBPYmplY3Qua2V5cyhzZXR0aW5ncylcbiAgICBmb3IobGV0IGtleSBvZiBsb2FkS2V5cyl7XG4gICAgICBsZXQgZGF0YSA9IHNldHRpbmdzW2tleV1cblxuICAgICAgaWYoZGF0YS50eXBlID09PSAnU29uZycpe1xuICAgICAgICBwcm9taXNlcy5wdXNoKFNvbmcuZnJvbU1JRElGaWxlQXN5bmMoZGF0YS51cmwpKVxuICAgICAgfWVsc2UgaWYoZGF0YS50eXBlID09PSAnSW5zdHJ1bWVudCcpe1xuICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRJbnN0cnVtZW50KGRhdGEpKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIC50aGVuKFxuICAgIChyZXN1bHQpID0+IHtcblxuICAgICAgbGV0IHJldHVybk9iaiA9IHt9XG5cbiAgICAgIHJlc3VsdC5mb3JFYWNoKChkYXRhLCBpKSA9PiB7XG4gICAgICAgIGlmKGkgPT09IDApe1xuICAgICAgICAgIC8vIHBhcnNlQXVkaW9cbiAgICAgICAgICByZXR1cm5PYmoubGVnYWN5ID0gZGF0YS5sZWdhY3lcbiAgICAgICAgICByZXR1cm5PYmoubXAzID0gZGF0YS5tcDNcbiAgICAgICAgICByZXR1cm5PYmoub2dnID0gZGF0YS5vZ2dcbiAgICAgICAgfWVsc2UgaWYoaSA9PT0gMSl7XG4gICAgICAgICAgLy8gcGFyc2VNSURJXG4gICAgICAgICAgcmV0dXJuT2JqLm1pZGkgPSBkYXRhLm1pZGlcbiAgICAgICAgICByZXR1cm5PYmoud2VibWlkaSA9IGRhdGEud2VibWlkaVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAvLyBJbnN0cnVtZW50cywgc2FtcGxlcyBvciBNSURJIGZpbGVzIHRoYXQgZ290IGxvYWRlZCBkdXJpbmcgaW5pdGlhbGl6YXRpb25cbiAgICAgICAgICByZXN1bHRbbG9hZEtleXNbaSAtIDJdXSA9IGRhdGFcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29uc29sZS5sb2coJ3FhbWJpJywgcWFtYmkudmVyc2lvbilcbiAgICAgIHJlc29sdmUocmVzdWx0KVxuICAgIH0sXG4gICAgKGVycm9yKSA9PiB7XG4gICAgICByZWplY3QoZXJyb3IpXG4gICAgfSlcbiAgfSlcblxuXG4vKlxuICBQcm9taXNlLmFsbChbaW5pdEF1ZGlvKCksIGluaXRNSURJKCldKVxuICAudGhlbihcbiAgKGRhdGEpID0+IHtcbiAgICAvLyBwYXJzZUF1ZGlvXG4gICAgbGV0IGRhdGFBdWRpbyA9IGRhdGFbMF1cblxuICAgIC8vIHBhcnNlTUlESVxuICAgIGxldCBkYXRhTWlkaSA9IGRhdGFbMV1cblxuICAgIGNhbGxiYWNrKHtcbiAgICAgIGxlZ2FjeTogZGF0YUF1ZGlvLmxlZ2FjeSxcbiAgICAgIG1wMzogZGF0YUF1ZGlvLm1wMyxcbiAgICAgIG9nZzogZGF0YUF1ZGlvLm9nZyxcbiAgICAgIG1pZGk6IGRhdGFNaWRpLm1pZGksXG4gICAgICB3ZWJtaWRpOiBkYXRhTWlkaS53ZWJtaWRpLFxuICAgIH0pXG4gIH0sXG4gIChlcnJvcikgPT4ge1xuICAgIGNhbGxiYWNrKGVycm9yKVxuICB9KVxuKi9cbn1cbiIsIi8qXG4gIFNldHMgdXAgdGhlIGJhc2ljIGF1ZGlvIHJvdXRpbmcsIHRlc3RzIHdoaWNoIGF1ZGlvIGZvcm1hdHMgYXJlIHN1cHBvcnRlZCBhbmQgcGFyc2VzIHRoZSBzYW1wbGVzIGZvciB0aGUgbWV0cm9ub21lIHRpY2tzLlxuKi9cblxuaW1wb3J0IHNhbXBsZXMgZnJvbSAnLi9zYW1wbGVzJ1xuaW1wb3J0IHtwYXJzZVNhbXBsZXN9IGZyb20gJy4vcGFyc2VfYXVkaW8nXG5cbmxldFxuICBtYXN0ZXJHYWluLFxuICBjb21wcmVzc29yLFxuICBpbml0aWFsaXplZCA9IGZhbHNlLFxuICBkYXRhXG5cbmV4cG9ydCBsZXQgY29udGV4dCA9IChmdW5jdGlvbigpe1xuICAvL2NvbnNvbGUubG9nKCdpbml0IEF1ZGlvQ29udGV4dCcpXG4gIGxldCBjdHhcbiAgaWYodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpe1xuICAgIGxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHRcbiAgICBpZihBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKVxuICAgIH1cbiAgfVxuICBpZih0eXBlb2YgY3R4ID09PSAndW5kZWZpbmVkJyl7XG4gICAgLy9AVE9ETzogY3JlYXRlIGR1bW15IEF1ZGlvQ29udGV4dCBmb3IgdXNlIGluIG5vZGUsIHNlZTogaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvYXVkaW8tY29udGV4dFxuICAgIGNvbnRleHQgPSB7XG4gICAgICBjcmVhdGVHYWluOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGdhaW46IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZU9zY2lsbGF0b3I6IGZ1bmN0aW9uKCl7fSxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN0eFxufSgpKVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0QXVkaW8oKXtcblxuICBpZih0eXBlb2YgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW5cbiAgfVxuICAvLyBjaGVjayBmb3Igb2xkZXIgaW1wbGVtZW50YXRpb25zIG9mIFdlYkF1ZGlvXG4gIGRhdGEgPSB7fVxuICBsZXQgc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICBkYXRhLmxlZ2FjeSA9IGZhbHNlXG4gIGlmKHR5cGVvZiBzb3VyY2Uuc3RhcnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBkYXRhLmxlZ2FjeSA9IHRydWVcbiAgfVxuXG4gIC8vIHNldCB1cCB0aGUgZWxlbWVudGFyeSBhdWRpbyBub2Rlc1xuICBjb21wcmVzc29yID0gY29udGV4dC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKVxuICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgbWFzdGVyR2FpbiA9IGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUoKVxuICBtYXN0ZXJHYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gMC41XG4gIGluaXRpYWxpemVkID0gdHJ1ZVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICBwYXJzZVNhbXBsZXMoc2FtcGxlcykudGhlbihcbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGJ1ZmZlcnMpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKGJ1ZmZlcnMpXG4gICAgICAgIGRhdGEub2dnID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlPZ2cgIT09ICd1bmRlZmluZWQnXG4gICAgICAgIGRhdGEubXAzID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlNcDMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgIGRhdGEubG93dGljayA9IGJ1ZmZlcnMubG93dGlja1xuICAgICAgICBkYXRhLmhpZ2h0aWNrID0gYnVmZmVycy5oaWdodGlja1xuICAgICAgICBpZihkYXRhLm9nZyA9PT0gZmFsc2UgJiYgZGF0YS5tcDMgPT09IGZhbHNlKXtcbiAgICAgICAgICByZWplY3QoJ05vIHN1cHBvcnQgZm9yIG9nZyBub3IgbXAzIScpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJlc29sdmUoZGF0YSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoKXtcbiAgICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSBpbml0aWFsaXppbmcgQXVkaW8nKVxuICAgICAgfVxuICAgIClcbiAgfSlcbn1cblxuXG5sZXQgc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24odmFsdWU6IG51bWJlciA9IDAuNSk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24odmFsdWU6IG51bWJlciA9IDAuNSl7XG4gICAgICBpZih2YWx1ZSA+IDEpe1xuICAgICAgICBjb25zb2xlLmluZm8oJ21heGltYWwgdm9sdW1lIGlzIDEuMCwgdm9sdW1lIGlzIHNldCB0byAxLjAnKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUgPCAwID8gMCA6IHZhbHVlID4gMSA/IDEgOiB2YWx1ZVxuICAgICAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldE1hc3RlclZvbHVtZSh2YWx1ZSlcbiAgfVxufVxuXG5cbmxldCBnZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbWFzdGVyR2Fpbi5nYWluLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRNYXN0ZXJWb2x1bWUoKVxuICB9XG59XG5cblxubGV0IGdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gY29tcHJlc3Nvci5yZWR1Y3Rpb24udmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIGdldENvbXByZXNzaW9uUmVkdWN0aW9uKClcbiAgfVxufVxuXG5cbmxldCBlbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBlbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oZmxhZzogYm9vbGVhbil7XG4gICAgICBpZihmbGFnKXtcbiAgICAgICAgbWFzdGVyR2Fpbi5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmNvbm5lY3QoY29tcHJlc3Nvcik7XG4gICAgICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIGVuYWJsZU1hc3RlckNvbXByZXNzb3IoKVxuICB9XG59XG5cblxubGV0IGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihjZmcpOiB2b2lke1xuICAvKlxuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGF0dGFjazsgLy8gaW4gU2Vjb25kc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGtuZWU7IC8vIGluIERlY2liZWxzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmF0aW87IC8vIHVuaXQtbGVzc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlZHVjdGlvbjsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWxlYXNlOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gdGhyZXNob2xkOyAvLyBpbiBEZWNpYmVsc1xuXG4gICAgQHNlZTogaHR0cDovL3dlYmF1ZGlvLmdpdGh1Yi5pby93ZWItYXVkaW8tYXBpLyN0aGUtZHluYW1pY3Njb21wcmVzc29ybm9kZS1pbnRlcmZhY2VcbiAgKi9cbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oY2ZnOiB7fSl7XG4gICAgICAoe1xuICAgICAgICBhdHRhY2s6IGNvbXByZXNzb3IuYXR0YWNrID0gMC4wMDMsXG4gICAgICAgIGtuZWU6IGNvbXByZXNzb3Iua25lZSA9IDMwLFxuICAgICAgICByYXRpbzogY29tcHJlc3Nvci5yYXRpbyA9IDEyLFxuICAgICAgICByZWR1Y3Rpb246IGNvbXByZXNzb3IucmVkdWN0aW9uID0gMCxcbiAgICAgICAgcmVsZWFzZTogY29tcHJlc3Nvci5yZWxlYXNlID0gMC4yNTAsXG4gICAgICAgIHRocmVzaG9sZDogY29tcHJlc3Nvci50aHJlc2hvbGQgPSAtMjQsXG4gICAgICB9ID0gY2ZnKVxuICAgIH1cbiAgICBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yKGNmZylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5pdERhdGEoKXtcbiAgcmV0dXJuIGRhdGFcbn1cblxuZXhwb3J0IHttYXN0ZXJHYWluLCBjb21wcmVzc29yIGFzIG1hc3RlckNvbXByZXNzb3IsIHNldE1hc3RlclZvbHVtZSwgZ2V0TWFzdGVyVm9sdW1lLCBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiwgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciwgY29uZmlndXJlTWFzdGVyQ29tcHJlc3Nvcn1cbiIsIi8qXG4gIFJlcXVlc3RzIE1JREkgYWNjZXNzLCBxdWVyaWVzIGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgYW5kIHN0b3JlcyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxuKi9cblxuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5cblxubGV0IE1JRElBY2Nlc3NcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlXG5sZXQgaW5wdXRzID0gW11cbmxldCBvdXRwdXRzID0gW11cbmxldCBpbnB1dElkcyA9IFtdXG5sZXQgb3V0cHV0SWRzID0gW11cbmxldCBpbnB1dHNCeUlkID0gbmV3IE1hcCgpXG5sZXQgb3V0cHV0c0J5SWQgPSBuZXcgTWFwKClcblxubGV0IHNvbmdNaWRpRXZlbnRMaXN0ZW5lclxubGV0IG1pZGlFdmVudExpc3RlbmVySWQgPSAwXG5cblxuZnVuY3Rpb24gZ2V0TUlESXBvcnRzKCl7XG4gIGlucHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5pbnB1dHMudmFsdWVzKCkpXG5cbiAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gIGlucHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSlcblxuICBmb3IobGV0IHBvcnQgb2YgaW5wdXRzKXtcbiAgICBpbnB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KVxuICAgIGlucHV0SWRzLnB1c2gocG9ydC5pZClcbiAgfVxuXG4gIG91dHB1dHMgPSBBcnJheS5mcm9tKE1JRElBY2Nlc3Mub3V0cHV0cy52YWx1ZXMoKSlcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgb3V0cHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSlcblxuICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gIGZvcihsZXQgcG9ydCBvZiBvdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKHBvcnQuaWQsIHBvcnQubmFtZSlcbiAgICBvdXRwdXRzQnlJZC5zZXQocG9ydC5pZCwgcG9ydClcbiAgICBvdXRwdXRJZHMucHVzaChwb3J0LmlkKVxuICB9XG4gIC8vY29uc29sZS5sb2cob3V0cHV0c0J5SWQpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNSURJKCl7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICBpZih0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgIHJlc29sdmUoe21pZGk6IGZhbHNlfSlcbiAgICB9ZWxzZSBpZih0eXBlb2YgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzICE9PSAndW5kZWZpbmVkJyl7XG5cbiAgICAgIGxldCBqYXp6LCBtaWRpLCB3ZWJtaWRpXG5cbiAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcygpLnRoZW4oXG5cbiAgICAgICAgZnVuY3Rpb24gb25GdWxGaWxsZWQobWlkaUFjY2Vzcyl7XG4gICAgICAgICAgTUlESUFjY2VzcyA9IG1pZGlBY2Nlc3NcbiAgICAgICAgICBpZih0eXBlb2YgbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlcyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgamF6eiA9IG1pZGlBY2Nlc3MuX2phenpJbnN0YW5jZXNbMF0uX0phenoudmVyc2lvblxuICAgICAgICAgICAgbWlkaSA9IHRydWVcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHdlYm1pZGkgPSB0cnVlXG4gICAgICAgICAgICBtaWRpID0gdHJ1ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGdldE1JRElwb3J0cygpXG5cbiAgICAgICAgICAvLyBvbmNvbm5lY3QgYW5kIG9uZGlzY29ubmVjdCBhcmUgbm90IHlldCBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgYW5kIENocm9taXVtXG4gICAgICAgICAgbWlkaUFjY2Vzcy5vbmNvbm5lY3QgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgY29ubmVjdGVkJywgZSlcbiAgICAgICAgICAgIGdldE1JRElwb3J0cygpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWlkaUFjY2Vzcy5vbmRpc2Nvbm5lY3QgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgZGlzY29ubmVjdGVkJywgZSlcbiAgICAgICAgICAgIGdldE1JRElwb3J0cygpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICBqYXp6LFxuICAgICAgICAgICAgbWlkaSxcbiAgICAgICAgICAgIHdlYm1pZGksXG4gICAgICAgICAgICBpbnB1dHMsXG4gICAgICAgICAgICBvdXRwdXRzLFxuICAgICAgICAgICAgaW5wdXRzQnlJZCxcbiAgICAgICAgICAgIG91dHB1dHNCeUlkLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QoZSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhlKVxuICAgICAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgcmVxdWVzdGluZyBNSURJQWNjZXNzJywgZSlcbiAgICAgICAgfVxuICAgICAgKVxuICAgIC8vIGJyb3dzZXJzIHdpdGhvdXQgV2ViTUlESSBBUElcbiAgICB9ZWxzZXtcbiAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgcmVzb2x2ZSh7bWlkaTogZmFsc2V9KVxuICAgIH1cbiAgfSlcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElBY2Nlc3MgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElBY2Nlc3MgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIE1JRElBY2Nlc3NcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElBY2Nlc3MoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBvdXRwdXRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJT3V0cHV0cygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBpbnB1dHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElJbnB1dHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRJZHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRJZHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG91dHB1dElkc1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dElkcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElJbnB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gaW5wdXRJZHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElJbnB1dElkcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0QnlJZCA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRCeUlkID0gZnVuY3Rpb24oX2lkKXtcbiAgICAgIHJldHVybiBvdXRwdXRzQnlJZC5nZXQoX2lkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dEJ5SWQoaWQpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24oaWQ6IHN0cmluZyl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uKF9pZCl7XG4gICAgICByZXR1cm4gaW5wdXRzQnlJZC5nZXQoX2lkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0QnlJZChpZClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNaWRpU29uZyhzb25nKXtcblxuICBzb25nTWlkaUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKXtcbiAgICAvL2NvbnNvbGUubG9nKGUpXG4gICAgaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIGUsIHRoaXMpO1xuICB9O1xuXG4gIC8vIGJ5IGRlZmF1bHQgYSBzb25nIGxpc3RlbnMgdG8gYWxsIGF2YWlsYWJsZSBtaWRpLWluIHBvcnRzXG4gIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHBvcnQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xuXG4gIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlJbnB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgaW5wdXQgPSBpbnB1dHMuZ2V0KGlkKTtcblxuICBpZihpbnB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIGlucHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaUlucHV0cy5kZWxldGUoaWQpO1xuICAgIGlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChpZCwgaW5wdXQpO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlJbnB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaU91dHB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgb3V0cHV0ID0gb3V0cHV0cy5nZXQoaWQpO1xuXG4gIGlmKG91dHB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIG91dHB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLmRlbGV0ZShpZCk7XG4gICAgbGV0IHRpbWUgPSBzb25nLnNjaGVkdWxlci5sYXN0RXZlbnRUaW1lICsgMTAwO1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZSk7IC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lKTsgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gIH1lbHNle1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KGlkLCBvdXRwdXQpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaU91dHB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVNvbmcoc29uZywgbWlkaU1lc3NhZ2VFdmVudCwgaW5wdXQpe1xuICBsZXQgbWlkaUV2ZW50ID0gbmV3IE1pZGlFdmVudChzb25nLnRpY2tzLCAuLi5taWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1pZGlJbnB1dHMsIGlucHV0KTtcblxuXG4gICAgLy9pZihtaWRpRXZlbnQuY2hhbm5lbCA9PT0gdHJhY2suY2hhbm5lbCB8fCB0cmFjay5jaGFubmVsID09PSAwIHx8IHRyYWNrLmNoYW5uZWwgPT09ICdhbnknKXtcbiAgICAvLyAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrKTtcbiAgICAvL31cblxuXG4gICAgLy8gbGlrZSBpbiBDdWJhc2UsIG1pZGkgZXZlbnRzIGZyb20gYWxsIGRldmljZXMsIHNlbnQgb24gYW55IG1pZGkgY2hhbm5lbCBhcmUgZm9yd2FyZGVkIHRvIGFsbCB0cmFja3NcbiAgICAvLyBzZXQgdHJhY2subW9uaXRvciB0byBmYWxzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byByZWNlaXZlIG1pZGkgZXZlbnRzIG9uIGEgY2VydGFpbiB0cmFja1xuICAgIC8vIG5vdGUgdGhhdCB0cmFjay5tb25pdG9yIGlzIGJ5IGRlZmF1bHQgc2V0IHRvIGZhbHNlIGFuZCB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYXV0b21hdGljYWxseSBzZXQgdG8gdHJ1ZVxuICAgIC8vIGlmIHlvdSBhcmUgcmVjb3JkaW5nIG9uIHRoYXQgdHJhY2tcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1vbml0b3IsIHRyYWNrLmlkLCBpbnB1dC5pZCk7XG4gICAgaWYodHJhY2subW9uaXRvciA9PT0gdHJ1ZSAmJiB0cmFjay5taWRpSW5wdXRzLmdldChpbnB1dC5pZCkgIT09IHVuZGVmaW5lZCl7XG4gICAgICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2ssIGlucHV0KTtcbiAgICB9XG4gIH1cblxuICBsZXQgbGlzdGVuZXJzID0gc29uZy5taWRpRXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudC50eXBlKTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIGZvcihsZXQgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH1cbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sodHJhY2ssIG1pZGlFdmVudCwgaW5wdXQpe1xuICBsZXQgc29uZyA9IHRyYWNrLnNvbmcsXG4gICAgbm90ZSwgbGlzdGVuZXJzLCBjaGFubmVsO1xuICAgIC8vZGF0YSA9IG1pZGlNZXNzYWdlRXZlbnQuZGF0YSxcbiAgICAvL21pZGlFdmVudCA9IGNyZWF0ZU1pZGlFdmVudChzb25nLnRpY2tzLCBkYXRhWzBdLCBkYXRhWzFdLCBkYXRhWzJdKTtcblxuICAvL21pZGlFdmVudC5zb3VyY2UgPSBtaWRpTWVzc2FnZUV2ZW50LnNyY0VsZW1lbnQubmFtZTtcbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50KVxuICAvL2NvbnNvbGUubG9nKCctLS0tPicsIG1pZGlFdmVudC50eXBlKTtcblxuICAvLyBhZGQgdGhlIGV4YWN0IHRpbWUgb2YgdGhpcyBldmVudCBzbyB3ZSBjYW4gY2FsY3VsYXRlIGl0cyB0aWNrcyBwb3NpdGlvblxuICBtaWRpRXZlbnQucmVjb3JkTWlsbGlzID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7IC8vIG1pbGxpc1xuICBtaWRpRXZlbnQuc3RhdGUgPSAncmVjb3JkZWQnO1xuXG4gIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgIG5vdGUgPSBjcmVhdGVNaWRpTm90ZShtaWRpRXZlbnQpO1xuICAgIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV0gPSBub3RlO1xuICAgIC8vdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXSA9IG5vdGU7XG4gIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjgpe1xuICAgIG5vdGUgPSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vIGNoZWNrIGlmIHRoZSBub3RlIGV4aXN0czogaWYgdGhlIHVzZXIgcGxheXMgbm90ZXMgb24gaGVyIGtleWJvYXJkIGJlZm9yZSB0aGUgbWlkaSBzeXN0ZW0gaGFzXG4gICAgLy8gYmVlbiBmdWxseSBpbml0aWFsaXplZCwgaXQgY2FuIGhhcHBlbiB0aGF0IHRoZSBmaXJzdCBpbmNvbWluZyBtaWRpIGV2ZW50IGlzIGEgTk9URSBPRkYgZXZlbnRcbiAgICBpZihub3RlID09PSB1bmRlZmluZWQpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KTtcbiAgICBkZWxldGUgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvL2RlbGV0ZSB0cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdO1xuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhzb25nLnByZXJvbGwsIHNvbmcucmVjb3JkaW5nLCB0cmFjay5yZWNvcmRFbmFibGVkKTtcblxuICBpZigoc29uZy5wcmVyb2xsaW5nIHx8IHNvbmcucmVjb3JkaW5nKSAmJiB0cmFjay5yZWNvcmRFbmFibGVkID09PSAnbWlkaScpe1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgICAgdHJhY2suc29uZy5yZWNvcmRlZE5vdGVzLnB1c2gobm90ZSk7XG4gICAgfVxuICAgIHRyYWNrLnJlY29yZFBhcnQuYWRkRXZlbnQobWlkaUV2ZW50KTtcbiAgICAvLyBzb25nLnJlY29yZGVkRXZlbnRzIGlzIHVzZWQgaW4gdGhlIGtleSBlZGl0b3JcbiAgICB0cmFjay5zb25nLnJlY29yZGVkRXZlbnRzLnB1c2gobWlkaUV2ZW50KTtcbiAgfWVsc2UgaWYodHJhY2suZW5hYmxlUmV0cm9zcGVjdGl2ZVJlY29yZGluZyl7XG4gICAgdHJhY2sucmV0cm9zcGVjdGl2ZVJlY29yZGluZy5wdXNoKG1pZGlFdmVudCk7XG4gIH1cblxuICAvLyBjYWxsIGFsbCBtaWRpIGV2ZW50IGxpc3RlbmVyc1xuICBsaXN0ZW5lcnMgPSB0cmFjay5taWRpRXZlbnRMaXN0ZW5lcnNbbWlkaUV2ZW50LnR5cGVdO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgb2JqZWN0Rm9yRWFjaChsaXN0ZW5lcnMsIGZ1bmN0aW9uKGxpc3RlbmVyKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhbm5lbCA9IHRyYWNrLmNoYW5uZWw7XG4gIGlmKGNoYW5uZWwgPT09ICdhbnknIHx8IGNoYW5uZWwgPT09IHVuZGVmaW5lZCB8fCBpc05hTihjaGFubmVsKSA9PT0gdHJ1ZSl7XG4gICAgY2hhbm5lbCA9IDA7XG4gIH1cblxuICBvYmplY3RGb3JFYWNoKHRyYWNrLm1pZGlPdXRwdXRzLCBmdW5jdGlvbihvdXRwdXQpe1xuICAgIC8vY29uc29sZS5sb2coJ21pZGkgb3V0Jywgb3V0cHV0LCBtaWRpRXZlbnQudHlwZSk7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTQ0IHx8IG1pZGlFdmVudC50eXBlID09PSAxNzYpe1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTIpO1xuICAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICAgIC8vIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxOTIpe1xuICAgIC8vICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTFdKTtcbiAgICB9XG4gICAgLy9vdXRwdXQuc2VuZChbbWlkaUV2ZW50LnN0YXR1cyArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gIH0pO1xuXG4gIC8vIEBUT0RPOiBtYXliZSBhIHRyYWNrIHNob3VsZCBiZSBhYmxlIHRvIHNlbmQgaXRzIGV2ZW50IHRvIGJvdGggYSBtaWRpLW91dCBwb3J0IGFuZCBhbiBpbnRlcm5hbCBoZWFydGJlYXQgc29uZz9cbiAgLy9jb25zb2xlLmxvZyh0cmFjay5yb3V0ZVRvTWlkaU91dCk7XG4gIGlmKHRyYWNrLnJvdXRlVG9NaWRpT3V0ID09PSBmYWxzZSl7XG4gICAgbWlkaUV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgdHJhY2suaW5zdHJ1bWVudC5wcm9jZXNzRXZlbnQobWlkaUV2ZW50KTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGFkZE1pZGlFdmVudExpc3RlbmVyKC4uLmFyZ3MpeyAvLyBjYWxsZXIgY2FuIGJlIGEgdHJhY2sgb3IgYSBzb25nXG5cbiAgbGV0IGlkID0gbWlkaUV2ZW50TGlzdGVuZXJJZCsrO1xuICBsZXQgbGlzdGVuZXI7XG4gICAgdHlwZXMgPSB7fSxcbiAgICBpZHMgPSBbXSxcbiAgICBsb29wO1xuXG5cbiAgLy8gc2hvdWxkIEkgaW5saW5lIHRoaXM/XG4gIGxvb3AgPSBmdW5jdGlvbihhcmdzKXtcbiAgICBmb3IobGV0IGFyZyBvZiBhcmdzKXtcbiAgICAgIGxldCB0eXBlID0gdHlwZVN0cmluZyhhcmcpO1xuICAgICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICAgIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICBsb29wKGFyZyk7XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgbGlzdGVuZXIgPSBhcmc7XG4gICAgICB9ZWxzZSBpZihpc05hTihhcmcpID09PSBmYWxzZSl7XG4gICAgICAgIGFyZyA9IHBhcnNlSW50KGFyZywgMTApO1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICBhcmcgPSBzZXF1ZW5jZXIubWlkaUV2ZW50TnVtYmVyQnlOYW1lKGFyZyk7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBsb29wKGFyZ3MsIDAsIGFyZ3MubGVuZ3RoKTtcbiAgLy9jb25zb2xlLmxvZygndHlwZXMnLCB0eXBlcywgJ2xpc3RlbmVyJywgbGlzdGVuZXIpO1xuXG4gIG9iamVjdEZvckVhY2godHlwZXMsIGZ1bmN0aW9uKHR5cGUpe1xuICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgaWYob2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPSB7fTtcbiAgICB9XG4gICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF0gPSBsaXN0ZW5lcjtcbiAgICBpZHMucHVzaCh0eXBlICsgJ18nICsgaWQpO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKG9iai5taWRpRXZlbnRMaXN0ZW5lcnMpO1xuICByZXR1cm4gaWRzLmxlbmd0aCA9PT0gMSA/IGlkc1swXSA6IGlkcztcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcihpZCwgb2JqKXtcbiAgdmFyIHR5cGU7XG4gIGlkID0gaWQuc3BsaXQoJ18nKTtcbiAgdHlwZSA9IGlkWzBdO1xuICBpZCA9IGlkWzFdO1xuICBkZWxldGUgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF07XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXJzKCl7XG5cbn1cblxuKi9cbiIsImltcG9ydCB7Y3JlYXRlU2FtcGxlfSBmcm9tICcuL3NhbXBsZSdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtjcmVhdGVOb3RlfSBmcm9tICcuL25vdGUnXG5pbXBvcnQge3BhcnNlU2FtcGxlcywgcGFyc2VTYW1wbGVzMn0gZnJvbSAnLi9wYXJzZV9hdWRpbydcbmltcG9ydCB7dHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5pbXBvcnQge2ZldGNoSlNPTn0gZnJvbSAnLi9mZXRjaF9oZWxwZXJzJ1xuXG5cbmNvbnN0IHBwcSA9IDQ4MFxuY29uc3QgYnBtID0gMTIwXG5jb25zdCBwbGF5YmFja1NwZWVkID0gMVxuY29uc3QgbWlsbGlzUGVyVGljayA9ICgxIC8gcGxheWJhY2tTcGVlZCAqIDYwKSAvIGJwbSAvIHBwcVxuXG5leHBvcnQgY2xhc3MgSW5zdHJ1bWVudHtcblxuICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCB0eXBlOiBzdHJpbmcpe1xuICAgIHRoaXMuaWQgPSBpZFxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICAvLyBjcmVhdGUgYSBzYW1wbGVzIGRhdGEgb2JqZWN0IGZvciBhbGwgMTI4IHZlbG9jaXR5IGxldmVscyBvZiBhbGwgMTI4IG5vdGVzXG4gICAgdGhpcy5zYW1wbGVzRGF0YSA9IG5ldyBBcnJheSgxMjgpLmZpbGwoLTEpO1xuICAgIHRoaXMuc2FtcGxlc0RhdGEgPSB0aGlzLnNhbXBsZXNEYXRhLm1hcChmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG5ldyBBcnJheSgxMjgpLmZpbGwoLTEpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0ge31cbiAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXVxuICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG4gIH1cblxuICBjb25uZWN0KG91dHB1dCl7XG4gICAgdGhpcy5vdXRwdXQgPSBvdXRwdXRcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKXtcbiAgICB0aGlzLm91dHB1dCA9IG51bGxcbiAgfVxuXG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHRpbWUpe1xuICAgIGxldCBzYW1wbGUsIHNhbXBsZURhdGFcbiAgICBpZihpc05hTih0aW1lKSl7XG4gICAgICB0aW1lID0gY29udGV4dC5jdXJyZW50VGltZSArIChldmVudC50aWNrcyAqIG1pbGxpc1BlclRpY2spXG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGltZSlcblxuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAvL2NvbnNvbGUubG9nKDE0NCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG5cbiAgICAgIHNhbXBsZURhdGEgPSB0aGlzLnNhbXBsZXNEYXRhW2V2ZW50LmRhdGExXVtldmVudC5kYXRhMl07XG4gICAgICBzYW1wbGUgPSBjcmVhdGVTYW1wbGUoc2FtcGxlRGF0YSwgZXZlbnQpXG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbZXZlbnQubWlkaU5vdGVJZF0gPSBzYW1wbGVcbiAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlKVxuICAgICAgc2FtcGxlLm91dHB1dC5jb25uZWN0KHRoaXMub3V0cHV0IHx8IGNvbnRleHQuZGVzdGluYXRpb24pXG4gICAgICAvLyBzYW1wbGUuc291cmNlLm9uZW5kZWQgPSAoKSA9PiB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCcgICAgZGVsZXRpbmcnLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgLy8gICBkZWxldGUgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICAvLyB9XG4gICAgICBzYW1wbGUuc3RhcnQodGltZSlcbiAgICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxpbmcnLCBldmVudC5pZCwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIC8vY29uc29sZS5sb2coJ3N0YXJ0JywgZXZlbnQubWlkaU5vdGVJZClcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgLy9jb25zb2xlLmxvZygxMjgsICc6JywgdGltZSwgY29udGV4dC5jdXJyZW50VGltZSwgZXZlbnQubWlsbGlzKVxuICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICBpZih0eXBlb2Ygc2FtcGxlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKCdzYW1wbGUgbm90IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkLCAnIG1pZGlOb3RlJywgZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYodGhpcy5zdXN0YWluUGVkYWxEb3duID09PSB0cnVlKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkKVxuICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMucHVzaChldmVudC5taWRpTm90ZUlkKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsICgpID0+IHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wJywgdGltZSwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICAgIH0pXG4gICAgICAgIC8vc2FtcGxlLnN0b3AodGltZSlcbiAgICAgIH1cbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgLy8gc3VzdGFpbiBwZWRhbFxuICAgICAgaWYoZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDEyNyl7XG4gICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gdHJ1ZVxuICAgICAgICAgIC8vLypcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgICAgZGF0YTogJ2Rvd24nXG4gICAgICAgICAgfSlcbiAgICAgICAgICAvLyovXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc3VzdGFpbiBwZWRhbCBkb3duJylcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLmZvckVhY2goKG1pZGlOb3RlSWQpID0+IHtcbiAgICAgICAgICAgIHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlc1ttaWRpTm90ZUlkXVxuICAgICAgICAgICAgaWYoc2FtcGxlKXtcbiAgICAgICAgICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgICAgICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIG1pZGlOb3RlSWQpXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1ttaWRpTm90ZUlkXVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc3VzdGFpbiBwZWRhbCB1cCcsIHRoaXMuc3VzdGFpbmVkU2FtcGxlcylcbiAgICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXVxuICAgICAgICAgIC8vLypcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgICAgZGF0YTogJ3VwJ1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8qL1xuICAgICAgICAgIC8vdGhpcy5zdG9wU3VzdGFpbih0aW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBwYW5uaW5nXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gMTApe1xuICAgICAgICAvLyBwYW5uaW5nIGlzICpub3QqIGV4YWN0bHkgdGltZWQgLT4gbm90IHBvc3NpYmxlICh5ZXQpIHdpdGggV2ViQXVkaW9cbiAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhMiwgcmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcbiAgICAgICAgLy90cmFjay5zZXRQYW5uaW5nKHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG5cbiAgICAgIC8vIHZvbHVtZVxuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTEgPT09IDcpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9sb2FkSlNPTihkYXRhKXtcbiAgICBpZih0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGRhdGEudXJsID09PSAnc3RyaW5nJyl7XG4gICAgICByZXR1cm4gZmV0Y2hKU09OKGRhdGEudXJsKVxuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRhdGEpXG4gIH1cblxuICAvLyBsb2FkIGFuZCBwYXJzZVxuICBwYXJzZVNhbXBsZURhdGEoZGF0YSl7XG5cbiAgICAvLyBjaGVjayBpZiB3ZSBoYXZlIHRvIG92ZXJydWxlIHRoZSBiYXNlVXJsIG9mIHRoZSBzYW1wZWxzXG4gICAgbGV0IGJhc2VVcmwgPSBudWxsXG4gICAgaWYodHlwZW9mIGRhdGEuYmFzZVVybCA9PT0gJ3N0cmluZycpe1xuICAgICAgYmFzZVVybCA9IGRhdGEuYmFzZVVybFxuICAgIH1cblxuICAgIGlmKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuc2V0UmVsZWFzZShkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgIGNvbnNvbGUubG9nKDEsIGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgIH1cblxuICAgIC8vcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fbG9hZEpTT04oZGF0YSlcbiAgICAgIC50aGVuKChqc29uKSA9PiB7XG4gICAgICAgIC8vY29uc29sZS5sb2coanNvbilcbiAgICAgICAgZGF0YSA9IGpzb25cbiAgICAgICAgaWYoYmFzZVVybCAhPT0gbnVsbCl7XG4gICAgICAgICAganNvbi5iYXNlVXJsID0gYmFzZVVybFxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgICAgY29uc29sZS5sb2coMiwgZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnNlU2FtcGxlcyhkYXRhKVxuICAgICAgfSlcbiAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgaWYodHlwZW9mIHJlc3VsdCA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgIGZvcihsZXQgbm90ZUlkIG9mIE9iamVjdC5rZXlzKHJlc3VsdCkpIHtcbiAgICAgICAgICAgIGxldCBidWZmZXIgPSByZXN1bHRbbm90ZUlkXVxuICAgICAgICAgICAgbGV0IHNhbXBsZURhdGEgPSBkYXRhW25vdGVJZF1cblxuXG4gICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2FtcGxlRGF0YSBpcyB1bmRlZmluZWQnLCBub3RlSWQpXG4gICAgICAgICAgICB9ZWxzZSBpZih0eXBlU3RyaW5nKGJ1ZmZlcikgPT09ICdhcnJheScpe1xuXG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYnVmZmVyLCBzYW1wbGVEYXRhKVxuICAgICAgICAgICAgICBzYW1wbGVEYXRhLmZvckVhY2goKHNkLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhub3RlSWQsIGJ1ZmZlcltpXSlcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Ygc2QgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgICAgICAgIHNkID0ge1xuICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlcltpXVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgc2QuYnVmZmVyID0gYnVmZmVyW2ldXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNkLm5vdGUgPSBwYXJzZUludChub3RlSWQsIDEwKVxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEoc2QpXG4gICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIH1lbHNlIHtcblxuICAgICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBidWZmZXJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzYW1wbGVEYXRhLm5vdGUgPSBwYXJzZUludChub3RlSWQsIDEwKVxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgfWVsc2V7XG5cbiAgICAgICAgICByZXN1bHQuZm9yRWFjaCgoc2FtcGxlKSA9PiB7XG4gICAgICAgICAgICBsZXQgc2FtcGxlRGF0YSA9IGRhdGFbc2FtcGxlXVxuICAgICAgICAgICAgaWYodHlwZW9mIHNhbXBsZURhdGEgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NhbXBsZURhdGEgaXMgdW5kZWZpbmVkJywgc2FtcGxlKVxuICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICBidWZmZXI6IHNhbXBsZS5idWZmZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gc2FtcGxlLmJ1ZmZlclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHNhbXBsZVxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpXG4gICAgICAgICAgICAgIC8vdGhpcy51cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcblxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2cobmV3IERhdGUoKS5nZXRUaW1lKCkpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLypcbiAgICBAcGFyYW0gY29uZmlnIChvcHRpb25hbClcbiAgICAgIHtcbiAgICAgICAgbm90ZTogY2FuIGJlIG5vdGUgbmFtZSAoQzQpIG9yIG5vdGUgbnVtYmVyICg2MClcbiAgICAgICAgYnVmZmVyOiBBdWRpb0J1ZmZlclxuICAgICAgICBzdXN0YWluOiBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSwgLy8gb3B0aW9uYWwsIGluIG1pbGxpc1xuICAgICAgICByZWxlYXNlOiBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdLCAvLyBvcHRpb25hbFxuICAgICAgICBwYW46IHBhblBvc2l0aW9uIC8vIG9wdGlvbmFsXG4gICAgICAgIHZlbG9jaXR5OiBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdIC8vIG9wdGlvbmFsLCBmb3IgbXVsdGktbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgfVxuICAqL1xuICB1cGRhdGVTYW1wbGVEYXRhKC4uLmRhdGEpe1xuICAgIGRhdGEuZm9yRWFjaChub3RlRGF0YSA9PiB7XG4gICAgICAvLyBzdXBwb3J0IGZvciBtdWx0aSBsYXllcmVkIGluc3RydW1lbnRzXG4gICAgICAvL2NvbnNvbGUubG9nKG5vdGVEYXRhLCB0eXBlU3RyaW5nKG5vdGVEYXRhKSlcbiAgICAgIGlmKHR5cGVTdHJpbmcobm90ZURhdGEpID09PSAnYXJyYXknKXtcbiAgICAgICAgbm90ZURhdGEuZm9yRWFjaCh2ZWxvY2l0eUxheWVyID0+IHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHZlbG9jaXR5TGF5ZXIpXG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2FtcGxlRGF0YShub3RlRGF0YSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgX3VwZGF0ZVNhbXBsZURhdGEoZGF0YSA9IHt9KXtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gICAgbGV0IHtcbiAgICAgIG5vdGUsXG4gICAgICBidWZmZXIgPSBudWxsLFxuICAgICAgc3VzdGFpbiA9IFtudWxsLCBudWxsXSxcbiAgICAgIHJlbGVhc2UgPSBbbnVsbCwgJ2xpbmVhciddLCAvLyByZWxlYXNlIGR1cmF0aW9uIGlzIGluIHNlY29uZHMhXG4gICAgICBwYW4gPSBudWxsLFxuICAgICAgdmVsb2NpdHkgPSBbMCwgMTI3XSxcbiAgICB9ID0gZGF0YVxuXG4gICAgaWYodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBub3RlbnVtYmVyIG9yIGEgbm90ZW5hbWUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZ2V0IG5vdGVudW1iZXIgZnJvbSBub3RlbmFtZSBhbmQgY2hlY2sgaWYgdGhlIG5vdGVudW1iZXIgaXMgdmFsaWRcbiAgICBsZXQgbiA9IGNyZWF0ZU5vdGUobm90ZSlcbiAgICBpZihuID09PSBmYWxzZSl7XG4gICAgICBjb25zb2xlLndhcm4oJ25vdCBhIHZhbGlkIG5vdGUgaWQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG5vdGUgPSBuLm51bWJlclxuXG4gICAgbGV0IFtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmRdID0gc3VzdGFpblxuICAgIGxldCBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdID0gcmVsZWFzZVxuICAgIGxldCBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdID0gdmVsb2NpdHlcblxuICAgIGlmKHN1c3RhaW4ubGVuZ3RoICE9PSAyKXtcbiAgICAgIHN1c3RhaW5TdGFydCA9IHN1c3RhaW5FbmQgPSBudWxsXG4gICAgfVxuXG4gICAgaWYocmVsZWFzZUR1cmF0aW9uID09PSBudWxsKXtcbiAgICAgIHJlbGVhc2VFbnZlbG9wZSA9IG51bGxcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhub3RlLCBidWZmZXIpXG4gICAgLy8gY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKVxuICAgIC8vIGNvbnNvbGUubG9nKHJlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlKVxuICAgIC8vIGNvbnNvbGUubG9nKHBhbilcbiAgICAvLyBjb25zb2xlLmxvZyh2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZClcblxuXG4gICAgdGhpcy5zYW1wbGVzRGF0YVtub3RlXS5mb3JFYWNoKChzYW1wbGVEYXRhLCBpKSA9PiB7XG4gICAgICBpZihpID49IHZlbG9jaXR5U3RhcnQgJiYgaSA8PSB2ZWxvY2l0eUVuZCl7XG4gICAgICAgIGlmKHNhbXBsZURhdGEgPT09IC0xKXtcbiAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgaWQ6IG5vdGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IGJ1ZmZlciB8fCBzYW1wbGVEYXRhLmJ1ZmZlclxuICAgICAgICBzYW1wbGVEYXRhLnN1c3RhaW5TdGFydCA9IHN1c3RhaW5TdGFydCB8fCBzYW1wbGVEYXRhLnN1c3RhaW5TdGFydFxuICAgICAgICBzYW1wbGVEYXRhLnN1c3RhaW5FbmQgPSBzdXN0YWluRW5kIHx8IHNhbXBsZURhdGEuc3VzdGFpbkVuZFxuICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VEdXJhdGlvbiA9IHJlbGVhc2VEdXJhdGlvbiB8fCBzYW1wbGVEYXRhLnJlbGVhc2VEdXJhdGlvblxuICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSA9IHJlbGVhc2VFbnZlbG9wZSB8fCBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZVxuICAgICAgICBzYW1wbGVEYXRhLnBhbiA9IHBhbiB8fCBzYW1wbGVEYXRhLnBhblxuXG4gICAgICAgIGlmKHR5cGVTdHJpbmcoc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUpID09PSAnYXJyYXknKXtcbiAgICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZUFycmF5ID0gc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVcbiAgICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSA9ICdhcnJheSdcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGVsZXRlIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNhbXBsZXNEYXRhW25vdGVdW2ldID0gc2FtcGxlRGF0YVxuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZygnJU8nLCB0aGlzLnNhbXBsZXNEYXRhW25vdGVdKVxuICAgIH0pXG4gIH1cblxuXG4gIC8vIHN0ZXJlbyBzcHJlYWRcbiAgc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKXtcbiAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICB9XG5cbiAgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcbiAgfVxuXG4gIC8qXG4gICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAqL1xuICBzZXRSZWxlYXNlKGR1cmF0aW9uOiBudW1iZXIsIGVudmVsb3BlKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBmb3IgYWxsIGtleXMsIG92ZXJydWxlcyB2YWx1ZXMgc2V0IGJ5IHNldEtleVNjYWxpbmdSZWxlYXNlKClcbiAgICB0aGlzLnNhbXBsZXNEYXRhLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlcywgaWQpe1xuICAgICAgc2FtcGxlcy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSwgaSl7XG4gICAgICAgIGlmKHNhbXBsZSA9PT0gLTEpe1xuICAgICAgICAgIHNhbXBsZSA9IHtcbiAgICAgICAgICAgIGlkOiBpZFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzYW1wbGUucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb25cbiAgICAgICAgc2FtcGxlLnJlbGVhc2VFbnZlbG9wZSA9IGVudmVsb3BlXG4gICAgICAgIHNhbXBsZXNbaV0gPSBzYW1wbGVcbiAgICAgIH0pXG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGEpXG4gIH1cblxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICBpZih0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpe1xuICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICBkYXRhOiAndXAnXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuXG4gICAgT2JqZWN0LmtleXModGhpcy5zY2hlZHVsZWRTYW1wbGVzKS5mb3JFYWNoKChzYW1wbGVJZCkgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZygnICBzdG9wcGluZycsIHNhbXBsZUlkLCB0aGlzLmlkKVxuICAgICAgbGV0IHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tzYW1wbGVJZF1cbiAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlKVxuICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW3NhbXBsZUlkXS5zdG9wKGNvbnRleHQuY3VycmVudFRpbWUsICgpID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnYWxsTm90ZXNPZmYnLCBzYW1wbGUuZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tzYW1wbGUuZXZlbnQubWlkaU5vdGVJZF1cbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSB7fVxuXG4gICAgLy9jb25zb2xlLmxvZygnYWxsTm90ZXNPZmYnLCB0aGlzLnN1c3RhaW5lZFNhbXBsZXMubGVuZ3RoLCB0aGlzLnNjaGVkdWxlZFNhbXBsZXMpXG4gIH1cbn1cbiIsImltcG9ydCB7VHJhY2t9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7cGFyc2VFdmVudHMsIHBhcnNlTUlESU5vdGVzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge2NoZWNrTUlESU51bWJlcn0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtjYWxjdWxhdGVQb3NpdGlvbn0gZnJvbSAnLi9wb3NpdGlvbidcbmltcG9ydCB7SW5zdHJ1bWVudH0gZnJvbSAnLi9pbnN0cnVtZW50J1xuaW1wb3J0IHtnZXRJbml0RGF0YX0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcblxuXG5sZXRcbiAgbWV0aG9kTWFwID0gbmV3IE1hcChbXG4gICAgWyd2b2x1bWUnLCAnc2V0Vm9sdW1lJ10sXG4gICAgWydpbnN0cnVtZW50JywgJ3NldEluc3RydW1lbnQnXSxcbiAgICBbJ25vdGVOdW1iZXJBY2NlbnRlZFRpY2snLCAnc2V0Tm90ZU51bWJlckFjY2VudGVkVGljayddLFxuICAgIFsnbm90ZU51bWJlck5vbkFjY2VudGVkVGljaycsICdzZXROb3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJ10sXG4gICAgWyd2ZWxvY2l0eUFjY2VudGVkVGljaycsICdzZXRWZWxvY2l0eUFjY2VudGVkVGljayddLFxuICAgIFsndmVsb2NpdHlOb25BY2NlbnRlZFRpY2snLCAnc2V0VmVsb2NpdHlOb25BY2NlbnRlZFRpY2snXSxcbiAgICBbJ25vdGVMZW5ndGhBY2NlbnRlZFRpY2snLCAnc2V0Tm90ZUxlbmd0aEFjY2VudGVkVGljayddLFxuICAgIFsnbm90ZUxlbmd0aE5vbkFjY2VudGVkVGljaycsICdzZXROb3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrJ11cbiAgXSk7XG5cbmV4cG9ydCBjbGFzcyBNZXRyb25vbWV7XG5cbiAgY29uc3RydWN0b3Ioc29uZyl7XG4gICAgdGhpcy5zb25nID0gc29uZ1xuICAgIHRoaXMudHJhY2sgPSBuZXcgVHJhY2sodGhpcy5zb25nLmlkICsgJ19tZXRyb25vbWUnKVxuICAgIHRoaXMucGFydCA9IG5ldyBQYXJ0KClcbiAgICB0aGlzLnRyYWNrLmFkZFBhcnRzKHRoaXMucGFydClcbiAgICB0aGlzLnRyYWNrLmNvbm5lY3QodGhpcy5zb25nLl9vdXRwdXQpXG5cbiAgICB0aGlzLmV2ZW50cyA9IFtdXG4gICAgdGhpcy5wcmVjb3VudEV2ZW50cyA9IFtdXG4gICAgdGhpcy5wcmVjb3VudER1cmF0aW9uID0gMFxuICAgIHRoaXMuYmFycyA9IDBcbiAgICB0aGlzLmluZGV4ID0gMFxuICAgIHRoaXMuaW5kZXgyID0gMFxuICAgIHRoaXMucHJlY291bnRJbmRleCA9IDBcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuXG4gIHJlc2V0KCl7XG5cbiAgICBsZXQgZGF0YSA9IGdldEluaXREYXRhKClcbiAgICBsZXQgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50KCdtZXRyb25vbWUnKVxuICAgIGluc3RydW1lbnQudXBkYXRlU2FtcGxlRGF0YSh7XG4gICAgICBub3RlOiA2MCxcbiAgICAgIGJ1ZmZlcjogZGF0YS5sb3d0aWNrLFxuICAgIH0sIHtcbiAgICAgIG5vdGU6IDYxLFxuICAgICAgYnVmZmVyOiBkYXRhLmhpZ2h0aWNrLFxuICAgIH0pXG4gICAgdGhpcy50cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpXG5cbiAgICB0aGlzLnZvbHVtZSA9IDFcblxuICAgIHRoaXMubm90ZU51bWJlckFjY2VudGVkID0gNjFcbiAgICB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZCA9IDYwXG5cbiAgICB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgPSAxMDBcbiAgICB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQgPSAxMDBcblxuICAgIHRoaXMubm90ZUxlbmd0aEFjY2VudGVkID0gdGhpcy5zb25nLnBwcSAvIDQgLy8gc2l4dGVlbnRoIG5vdGVzIC0+IGRvbid0IG1ha2UgdGhpcyB0b28gc2hvcnQgaWYgeW91ciBzYW1wbGUgaGFzIGEgbG9uZyBhdHRhY2shXG4gICAgdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQgPSB0aGlzLnNvbmcucHBxIC8gNFxuICB9XG5cbiAgY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIGlkID0gJ2luaXQnKXtcbiAgICBsZXQgaSwgalxuICAgIGxldCBwb3NpdGlvblxuICAgIGxldCB2ZWxvY2l0eVxuICAgIGxldCBub3RlTGVuZ3RoXG4gICAgbGV0IG5vdGVOdW1iZXJcbiAgICBsZXQgYmVhdHNQZXJCYXJcbiAgICBsZXQgdGlja3NQZXJCZWF0XG4gICAgbGV0IHRpY2tzID0gMFxuICAgIGxldCBub3RlT24sIG5vdGVPZmZcbiAgICBsZXQgZXZlbnRzID0gW11cblxuICAgIC8vY29uc29sZS5sb2coc3RhcnRCYXIsIGVuZEJhcik7XG5cbiAgICBmb3IoaSA9IHN0YXJ0QmFyOyBpIDw9IGVuZEJhcjsgaSsrKXtcbiAgICAgIHBvc2l0aW9uID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcy5zb25nLCB7XG4gICAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgICB0YXJnZXQ6IFtpXSxcbiAgICAgIH0pXG5cbiAgICAgIGJlYXRzUGVyQmFyID0gcG9zaXRpb24ubm9taW5hdG9yXG4gICAgICB0aWNrc1BlckJlYXQgPSBwb3NpdGlvbi50aWNrc1BlckJlYXRcbiAgICAgIHRpY2tzID0gcG9zaXRpb24udGlja3NcblxuICAgICAgZm9yKGogPSAwOyBqIDwgYmVhdHNQZXJCYXI7IGorKyl7XG5cbiAgICAgICAgbm90ZU51bWJlciA9IGogPT09IDAgPyB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA6IHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkXG4gICAgICAgIG5vdGVMZW5ndGggPSBqID09PSAwID8gdGhpcy5ub3RlTGVuZ3RoQWNjZW50ZWQgOiB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZFxuICAgICAgICB2ZWxvY2l0eSA9IGogPT09IDAgPyB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgOiB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWRcblxuICAgICAgICBub3RlT24gPSBuZXcgTUlESUV2ZW50KHRpY2tzLCAxNDQsIG5vdGVOdW1iZXIsIHZlbG9jaXR5KVxuICAgICAgICBub3RlT2ZmID0gbmV3IE1JRElFdmVudCh0aWNrcyArIG5vdGVMZW5ndGgsIDEyOCwgbm90ZU51bWJlciwgMClcblxuICAgICAgICBpZihpZCA9PT0gJ3ByZWNvdW50Jyl7XG4gICAgICAgICAgbm90ZU9uLl90cmFjayA9IHRoaXMudHJhY2tcbiAgICAgICAgICBub3RlT2ZmLl90cmFjayA9IHRoaXMudHJhY2tcbiAgICAgICAgICBub3RlT24uX3BhcnQgPSB7fVxuICAgICAgICAgIG5vdGVPZmYuX3BhcnQgPSB7fVxuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnRzLnB1c2gobm90ZU9uLCBub3RlT2ZmKVxuICAgICAgICB0aWNrcyArPSB0aWNrc1BlckJlYXRcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXZlbnRzXG4gIH1cblxuXG4gIGdldEV2ZW50cyhzdGFydEJhciA9IDEsIGVuZEJhciA9IHRoaXMuc29uZy5iYXJzLCBpZCA9ICdpbml0Jyl7XG4gICAgdGhpcy5wYXJ0LnJlbW92ZUV2ZW50cyh0aGlzLnBhcnQuZ2V0RXZlbnRzKCkpXG4gICAgdGhpcy5ldmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZClcbiAgICB0aGlzLnBhcnQuYWRkRXZlbnRzKC4uLnRoaXMuZXZlbnRzKVxuICAgIHRoaXMuYmFycyA9IHRoaXMuc29uZy5iYXJzXG4gICAgLy9jb25zb2xlLmxvZygnZ2V0RXZlbnRzICVPJywgdGhpcy5ldmVudHMpXG4gICAgdGhpcy5hbGxFdmVudHMgPSBbLi4udGhpcy5ldmVudHMsIC4uLnRoaXMuc29uZy5fdGltZUV2ZW50c11cbiAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmFsbEV2ZW50cylcbiAgICBzb3J0RXZlbnRzKHRoaXMuYWxsRXZlbnRzKVxuICAgIHBhcnNlTUlESU5vdGVzKHRoaXMuZXZlbnRzKVxuICAgIHJldHVybiB0aGlzLmV2ZW50c1xuICB9XG5cblxuICBzZXRJbmRleDIobWlsbGlzKXtcbiAgICB0aGlzLmluZGV4MiA9IDBcbiAgfVxuXG4gIGdldEV2ZW50czIobWF4dGltZSwgdGltZVN0YW1wKXtcbiAgICBsZXQgcmVzdWx0ID0gW11cblxuICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXgyLCBtYXhpID0gdGhpcy5hbGxFdmVudHMubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKXtcblxuICAgICAgbGV0IGV2ZW50ID0gdGhpcy5hbGxFdmVudHNbaV1cblxuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVEVNUE8gfHwgZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUpe1xuICAgICAgICBpZihldmVudC5taWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICB0aGlzLm1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrXG4gICAgICAgICAgdGhpcy5pbmRleDIrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG5cbiAgICAgIH1lbHNle1xuICAgICAgICBsZXQgbWlsbGlzID0gZXZlbnQudGlja3MgKiB0aGlzLm1pbGxpc1BlclRpY2tcbiAgICAgICAgaWYobWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgZXZlbnQudGltZSA9IG1pbGxpcyArIHRpbWVTdGFtcFxuICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgICAgICAgIHRoaXMuaW5kZXgyKytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuXG4gIGFkZEV2ZW50cyhzdGFydEJhciA9IDEsIGVuZEJhciA9IHRoaXMuc29uZy5iYXJzLCBpZCA9ICdhZGQnKXtcbiAgICAvLyBjb25zb2xlLmxvZyhzdGFydEJhciwgZW5kQmFyKVxuICAgIGxldCBldmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZClcbiAgICB0aGlzLmV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICB0aGlzLnBhcnQuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICB0aGlzLmJhcnMgPSBlbmRCYXJcbiAgICAvL2NvbnNvbGUubG9nKCdnZXRFdmVudHMgJU8nLCB0aGlzLmV2ZW50cywgZW5kQmFyKVxuICAgIHJldHVybiBldmVudHNcbiAgfVxuXG5cbiAgY3JlYXRlUHJlY291bnRFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgdGltZVN0YW1wKXtcblxuICAgIHRoaXMudGltZVN0YW1wID0gdGltZVN0YW1wXG5cbi8vICAgbGV0IHNvbmdTdGFydFBvc2l0aW9uID0gdGhpcy5zb25nLmdldFBvc2l0aW9uKClcblxuICAgIGxldCBzb25nU3RhcnRQb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICB0YXJnZXQ6IFtzdGFydEJhcl0sXG4gICAgICByZXN1bHQ6ICdtaWxsaXMnLFxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZygnc3RhckJhcicsIHNvbmdTdGFydFBvc2l0aW9uLmJhcilcblxuICAgIGxldCBlbmRQb3MgPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLnNvbmcsIHtcbiAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgLy90YXJnZXQ6IFtzb25nU3RhcnRQb3NpdGlvbi5iYXIgKyBwcmVjb3VudCwgc29uZ1N0YXJ0UG9zaXRpb24uYmVhdCwgc29uZ1N0YXJ0UG9zaXRpb24uc2l4dGVlbnRoLCBzb25nU3RhcnRQb3NpdGlvbi50aWNrXSxcbiAgICAgIHRhcmdldDogW2VuZEJhcl0sXG4gICAgICByZXN1bHQ6ICdtaWxsaXMnLFxuICAgIH0pXG5cbiAgICAvL2NvbnNvbGUubG9nKHNvbmdTdGFydFBvc2l0aW9uLCBlbmRQb3MpXG5cbiAgICB0aGlzLnByZWNvdW50SW5kZXggPSAwXG4gICAgdGhpcy5zdGFydE1pbGxpcyA9IHNvbmdTdGFydFBvc2l0aW9uLm1pbGxpc1xuICAgIHRoaXMuZW5kTWlsbGlzID0gZW5kUG9zLm1pbGxpc1xuICAgIHRoaXMucHJlY291bnREdXJhdGlvbiA9IGVuZFBvcy5taWxsaXMgLSB0aGlzLnN0YXJ0TWlsbGlzXG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMucHJlY291bnREdXJhdGlvbilcblxuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCAncHJlY291bnQnKTtcbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gcGFyc2VFdmVudHMoWy4uLnRoaXMuc29uZy5fdGltZUV2ZW50cywgLi4udGhpcy5wcmVjb3VudEV2ZW50c10pXG5cbiAgICAvL2NvbnNvbGUubG9nKHNvbmdTdGFydFBvc2l0aW9uLmJhciwgZW5kUG9zLmJhciwgcHJlY291bnQsIHRoaXMucHJlY291bnRFdmVudHMubGVuZ3RoKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMucHJlY291bnRFdmVudHMsIHRoaXMucHJlY291bnREdXJhdGlvbik7XG4gICAgcmV0dXJuIHRoaXMucHJlY291bnREdXJhdGlvblxuICB9XG5cblxuICBzZXRQcmVjb3VudEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvcihsZXQgZXZlbnQgb2YgdGhpcy5ldmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgICAgIHRoaXMucHJlY291bnRJbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyh0aGlzLnByZWNvdW50SW5kZXgpXG4gIH1cblxuXG4gIC8vIGNhbGxlZCBieSBzY2hlZHVsZXIuanNcbiAgZ2V0UHJlY291bnRFdmVudHMobWF4dGltZSl7XG4gICAgbGV0IGV2ZW50cyA9IHRoaXMucHJlY291bnRFdmVudHMsXG4gICAgICBtYXhpID0gZXZlbnRzLmxlbmd0aCwgaSwgZXZ0LFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgICAvL21heHRpbWUgKz0gdGhpcy5wcmVjb3VudER1cmF0aW9uXG5cbiAgICBmb3IoaSA9IHRoaXMucHJlY291bnRJbmRleDsgaSA8IG1heGk7IGkrKyl7XG4gICAgICBldnQgPSBldmVudHNbaV07XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgbWF4dGltZSwgdGhpcy5taWxsaXMpO1xuICAgICAgaWYoZXZ0Lm1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICBldnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZ0Lm1pbGxpc1xuICAgICAgICByZXN1bHQucHVzaChldnQpXG4gICAgICAgIHRoaXMucHJlY291bnRJbmRleCsrXG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2cocmVzdWx0Lmxlbmd0aCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG5cbiAgbXV0ZShmbGFnKXtcbiAgICB0aGlzLnRyYWNrLm11dGVkID0gZmxhZ1xuICB9XG5cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMudHJhY2suX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICB9XG5cblxuICAvLyA9PT09PT09PT09PSBDT05GSUdVUkFUSU9OID09PT09PT09PT09XG5cbiAgdXBkYXRlQ29uZmlnKCl7XG4gICAgdGhpcy5pbml0KDEsIHRoaXMuYmFycywgJ3VwZGF0ZScpXG4gICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgdGhpcy5zb25nLnVwZGF0ZSgpXG4gIH1cblxuICAvLyBhZGRlZCB0byBwdWJsaWMgQVBJOiBTb25nLmNvbmZpZ3VyZU1ldHJvbm9tZSh7fSlcbiAgY29uZmlndXJlKGNvbmZpZyl7XG5cbiAgICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgIHRoaXNbbWV0aG9kTWFwLmdldChrZXkpXShjb25maWcua2V5KTtcbiAgICB9LCB0aGlzKTtcblxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldEluc3RydW1lbnQoaW5zdHJ1bWVudCl7XG4gICAgaWYoIWluc3RydW1lbnQgaW5zdGFuY2VvZiBJbnN0cnVtZW50KXtcbiAgICAgIGNvbnNvbGUud2Fybignbm90IGFuIGluc3RhbmNlIG9mIEluc3RydW1lbnQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMudHJhY2suc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVMZW5ndGhBY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMubm90ZUxlbmd0aEFjY2VudGVkID0gdmFsdWU7XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgaWYoaXNOYU4odmFsdWUpKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWZWxvY2l0eUFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0VmVsb2NpdHlOb25BY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWb2x1bWUodmFsdWUpe1xuICAgIHRoaXMudHJhY2suc2V0Vm9sdW1lKHZhbHVlKTtcbiAgfVxufVxuXG4iLCIvLyBAIGZsb3dcblxubGV0IG1pZGlFdmVudEluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgTUlESUV2ZW50e1xuXG4gIGNvbnN0cnVjdG9yKHRpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlciA9IC0xKXtcbiAgICB0aGlzLmlkID0gYE1FXyR7bWlkaUV2ZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy50aWNrcyA9IHRpY2tzXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuZGF0YTEgPSBkYXRhMVxuICAgIHRoaXMuZGF0YTIgPSBkYXRhMlxuICAgIHRoaXMuZnJlcXVlbmN5ID0gNDQwICogTWF0aC5wb3coMiwgKGRhdGExIC0gNjkpIC8gMTIpXG5cbiAgICBpZihkYXRhMSA9PT0gMTQ0ICYmIGRhdGEyID09PSAwKXtcbiAgICAgIHRoaXMuZGF0YTEgPSAxMjhcbiAgICB9XG5cbiAgICB0aGlzLl9wYXJ0ID0gbnVsbFxuICAgIHRoaXMuX3RyYWNrID0gbnVsbFxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG4gICAgLy9AVE9ETzogYWRkIGFsbCBvdGhlciBwcm9wZXJ0aWVzXG4gIH1cblxuICBjb3B5KCl7XG4gICAgbGV0IG0gPSBuZXcgTUlESUV2ZW50KHRoaXMudGlja3MsIHRoaXMudHlwZSwgdGhpcy5kYXRhMSwgdGhpcy5kYXRhMilcbiAgICByZXR1cm4gbVxuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKXsgLy8gbWF5IGJlIGJldHRlciBpZiBub3QgYSBwdWJsaWMgbWV0aG9kP1xuICAgIHRoaXMuZGF0YTEgKz0gYW1vdW50XG4gICAgdGhpcy5mcmVxdWVuY3kgPSA0NDAgKiBNYXRoLnBvdygyLCAodGhpcy5kYXRhMSAtIDY5KSAvIDEyKVxuICB9XG5cbiAgbW92ZSh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLnRpY2tzICs9IHRpY2tzXG4gICAgaWYodGhpcy5taWRpTm90ZSl7XG4gICAgICB0aGlzLm1pZGlOb3RlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMudGlja3MgPSB0aWNrc1xuICAgIGlmKHRoaXMubWlkaU5vdGUpe1xuICAgICAgdGhpcy5taWRpTm90ZS51cGRhdGUoKVxuICAgIH1cbiAgfVxufVxuXG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlTUlESUV2ZW50KGV2ZW50KXtcbiAgLy9ldmVudC5ub3RlID0gbnVsbFxuICBldmVudC5ub3RlID0gbnVsbFxuICBldmVudCA9IG51bGxcbn1cbiovXG4iLCJpbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuXG5sZXQgbWlkaU5vdGVJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIE1JRElOb3Rle1xuXG4gIGNvbnN0cnVjdG9yKG5vdGVvbjogTUlESUV2ZW50LCBub3Rlb2ZmOiBNSURJRXZlbnQpe1xuICAgIC8vaWYobm90ZW9uLnR5cGUgIT09IDE0NCB8fCBub3Rlb2ZmLnR5cGUgIT09IDEyOCl7XG4gICAgaWYobm90ZW9uLnR5cGUgIT09IDE0NCl7XG4gICAgICBjb25zb2xlLndhcm4oJ2Nhbm5vdCBjcmVhdGUgTUlESU5vdGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubm90ZU9uID0gbm90ZW9uXG4gICAgbm90ZW9uLm1pZGlOb3RlID0gdGhpc1xuICAgIG5vdGVvbi5taWRpTm90ZUlkID0gdGhpcy5pZFxuXG4gICAgaWYobm90ZW9mZiBpbnN0YW5jZW9mIE1JRElFdmVudCl7XG4gICAgICB0aGlzLm5vdGVPZmYgPSBub3Rlb2ZmXG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlID0gdGhpc1xuICAgICAgbm90ZW9mZi5taWRpTm90ZUlkID0gdGhpcy5pZFxuICAgICAgdGhpcy5kdXJhdGlvblRpY2tzID0gbm90ZW9mZi50aWNrcyAtIG5vdGVvbi50aWNrc1xuICAgICAgdGhpcy5kdXJhdGlvbk1pbGxpcyA9IC0xXG4gICAgfVxuICB9XG5cbiAgYWRkTm90ZU9mZihub3Rlb2ZmKXtcbiAgICB0aGlzLm5vdGVPZmYgPSBub3Rlb2ZmXG4gICAgbm90ZW9mZi5taWRpTm90ZSA9IHRoaXNcbiAgICBub3Rlb2ZmLm1pZGlOb3RlSWQgPSB0aGlzLmlkXG4gICAgdGhpcy5kdXJhdGlvblRpY2tzID0gbm90ZW9mZi50aWNrcyAtIHRoaXMubm90ZU9uLnRpY2tzXG4gICAgdGhpcy5kdXJhdGlvbk1pbGxpcyA9IC0xXG4gIH1cblxuICBjb3B5KCl7XG4gICAgcmV0dXJuIG5ldyBNSURJTm90ZSh0aGlzLm5vdGVPbi5jb3B5KCksIHRoaXMubm90ZU9mZi5jb3B5KCkpXG4gIH1cblxuICB1cGRhdGUoKXsgLy8gbWF5IHVzZSBhbm90aGVyIG5hbWUgZm9yIHRoaXMgbWV0aG9kXG4gICAgdGhpcy5kdXJhdGlvblRpY2tzID0gdGhpcy5ub3RlT2ZmLnRpY2tzIC0gdGhpcy5ub3RlT24udGlja3NcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcik6IHZvaWR7XG4gICAgdGhpcy5ub3RlT24udHJhbnNwb3NlKGFtb3VudClcbiAgICB0aGlzLm5vdGVPZmYudHJhbnNwb3NlKGFtb3VudClcbiAgfVxuXG4gIG1vdmUodGlja3M6IG51bWJlcik6IHZvaWR7XG4gICAgdGhpcy5ub3RlT24ubW92ZSh0aWNrcylcbiAgICB0aGlzLm5vdGVPZmYubW92ZSh0aWNrcylcbiAgfVxuXG4gIG1vdmVUbyh0aWNrczogbnVtYmVyKTogdm9pZHtcbiAgICB0aGlzLm5vdGVPbi5tb3ZlVG8odGlja3MpXG4gICAgdGhpcy5ub3RlT2ZmLm1vdmVUbyh0aWNrcylcbiAgfVxuXG4gIHVucmVnaXN0ZXIoKXtcbiAgICBpZih0aGlzLnBhcnQpe1xuICAgICAgdGhpcy5wYXJ0LnJlbW92ZUV2ZW50cyh0aGlzKVxuICAgICAgdGhpcy5wYXJ0ID0gbnVsbFxuICAgIH1cbiAgICBpZih0aGlzLnRyYWNrKXtcbiAgICAgIHRoaXMudHJhY2sucmVtb3ZlRXZlbnRzKHRoaXMpXG4gICAgICB0aGlzLnRyYWNrID0gbnVsbFxuICAgIH1cbiAgICBpZih0aGlzLnNvbmcpe1xuICAgICAgdGhpcy5zb25nLnJlbW92ZUV2ZW50cyh0aGlzKVxuICAgICAgdGhpcy5zb25nID0gbnVsbFxuICAgIH1cbiAgfVxufVxuXG4iLCIvKlxuICBXcmFwcGVyIGZvciBhY2Nlc3NpbmcgYnl0ZXMgdGhyb3VnaCBzZXF1ZW50aWFsIHJlYWRzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4gIGFkYXB0ZWQgdG8gd29yayB3aXRoIEFycmF5QnVmZmVyIC0+IFVpbnQ4QXJyYXlcbiovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNSURJU3RyZWFte1xuXG4gIC8vIGJ1ZmZlciBpcyBVaW50OEFycmF5XG4gIGNvbnN0cnVjdG9yKGJ1ZmZlcil7XG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICAvKiByZWFkIHN0cmluZyBvciBhbnkgbnVtYmVyIG9mIGJ5dGVzICovXG4gIHJlYWQobGVuZ3RoLCB0b1N0cmluZyA9IHRydWUpIHtcbiAgICBsZXQgcmVzdWx0O1xuXG4gICAgaWYodG9TdHJpbmcpe1xuICAgICAgcmVzdWx0ID0gJyc7XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdCArPSBmY2ModGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9ZWxzZXtcbiAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDMyLWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQzMigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDI0KSArXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdIDw8IDE2KSArXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDJdIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAzXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSA0O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAxNi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MTYoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV1cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhbiA4LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQ4KHNpZ25lZCkge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXTtcbiAgICBpZihzaWduZWQgJiYgcmVzdWx0ID4gMTI3KXtcbiAgICAgIHJlc3VsdCAtPSAyNTY7XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb24gKz0gMTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZW9mKCkge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uID49IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBNSURJLXN0eWxlIGxldGlhYmxlLWxlbmd0aCBpbnRlZ2VyXG4gICAgKGJpZy1lbmRpYW4gdmFsdWUgaW4gZ3JvdXBzIG9mIDcgYml0cyxcbiAgICB3aXRoIHRvcCBiaXQgc2V0IHRvIHNpZ25pZnkgdGhhdCBhbm90aGVyIGJ5dGUgZm9sbG93cylcbiAgKi9cbiAgcmVhZFZhckludCgpIHtcbiAgICBsZXQgcmVzdWx0ID0gMDtcbiAgICB3aGlsZSh0cnVlKSB7XG4gICAgICBsZXQgYiA9IHRoaXMucmVhZEludDgoKTtcbiAgICAgIGlmIChiICYgMHg4MCkge1xuICAgICAgICByZXN1bHQgKz0gKGIgJiAweDdmKTtcbiAgICAgICAgcmVzdWx0IDw8PSA3O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyogYiBpcyB0aGUgbGFzdCBieXRlICovXG4gICAgICAgIHJldHVybiByZXN1bHQgKyBiO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc2V0KCl7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICBzZXRQb3NpdGlvbihwKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gcDtcbiAgfVxufVxuIiwiLypcbiAgRXh0cmFjdHMgYWxsIG1pZGkgZXZlbnRzIGZyb20gYSBiaW5hcnkgbWlkaSBmaWxlLCB1c2VzIG1pZGlfc3RyZWFtLmpzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBNSURJU3RyZWFtIGZyb20gJy4vbWlkaV9zdHJlYW0nO1xuXG5sZXRcbiAgbGFzdEV2ZW50VHlwZUJ5dGUsXG4gIHRyYWNrTmFtZTtcblxuXG5mdW5jdGlvbiByZWFkQ2h1bmsoc3RyZWFtKXtcbiAgbGV0IGlkID0gc3RyZWFtLnJlYWQoNCwgdHJ1ZSk7XG4gIGxldCBsZW5ndGggPSBzdHJlYW0ucmVhZEludDMyKCk7XG4gIC8vY29uc29sZS5sb2cobGVuZ3RoKTtcbiAgcmV0dXJue1xuICAgICdpZCc6IGlkLFxuICAgICdsZW5ndGgnOiBsZW5ndGgsXG4gICAgJ2RhdGEnOiBzdHJlYW0ucmVhZChsZW5ndGgsIGZhbHNlKVxuICB9O1xufVxuXG5cbmZ1bmN0aW9uIHJlYWRFdmVudChzdHJlYW0pe1xuICB2YXIgZXZlbnQgPSB7fTtcbiAgdmFyIGxlbmd0aDtcbiAgZXZlbnQuZGVsdGFUaW1lID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgbGV0IGV2ZW50VHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgLy9jb25zb2xlLmxvZyhldmVudFR5cGVCeXRlLCBldmVudFR5cGVCeXRlICYgMHg4MCwgMTQ2ICYgMHgwZik7XG4gIGlmKChldmVudFR5cGVCeXRlICYgMHhmMCkgPT0gMHhmMCl7XG4gICAgLyogc3lzdGVtIC8gbWV0YSBldmVudCAqL1xuICAgIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmZil7XG4gICAgICAvKiBtZXRhIGV2ZW50ICovXG4gICAgICBldmVudC50eXBlID0gJ21ldGEnO1xuICAgICAgbGV0IHN1YnR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgc3dpdGNoKHN1YnR5cGVCeXRlKXtcbiAgICAgICAgY2FzZSAweDAwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VOdW1iZXInO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMil7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXF1ZW5jZU51bWJlciBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtYmVyID0gc3RyZWFtLnJlYWRJbnQxNigpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGV4dCc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDI6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb3B5cmlnaHROb3RpY2UnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAzOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndHJhY2tOYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICB0cmFja05hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA0OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnaW5zdHJ1bWVudE5hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA1OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbHlyaWNzJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21hcmtlcic7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDc6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjdWVQb2ludCc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MjA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtaWRpQ2hhbm5lbFByZWZpeCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAxKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIG1pZGlDaGFubmVsUHJlZml4IGV2ZW50IGlzIDEsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jaGFubmVsID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MmY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdlbmRPZlRyYWNrJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDApe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgZW5kT2ZUcmFjayBldmVudCBpcyAwLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXRUZW1wbyc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAzKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNldFRlbXBvIGV2ZW50IGlzIDMsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5taWNyb3NlY29uZHNQZXJCZWF0ID0gKFxuICAgICAgICAgICAgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDE2KSArXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgOCkgK1xuICAgICAgICAgICAgc3RyZWFtLnJlYWRJbnQ4KClcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU0OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc21wdGVPZmZzZXQnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gNSl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzbXB0ZU9mZnNldCBldmVudCBpcyA1LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGhvdXJCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWVSYXRlID17XG4gICAgICAgICAgICAweDAwOiAyNCwgMHgyMDogMjUsIDB4NDA6IDI5LCAweDYwOiAzMFxuICAgICAgICAgIH1baG91ckJ5dGUgJiAweDYwXTtcbiAgICAgICAgICBldmVudC5ob3VyID0gaG91ckJ5dGUgJiAweDFmO1xuICAgICAgICAgIGV2ZW50Lm1pbiA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnNlYyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc3ViZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RpbWVTaWduYXR1cmUnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gNCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciB0aW1lU2lnbmF0dXJlIGV2ZW50IGlzIDQsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1lcmF0b3IgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5kZW5vbWluYXRvciA9IE1hdGgucG93KDIsIHN0cmVhbS5yZWFkSW50OCgpKTtcbiAgICAgICAgICBldmVudC5tZXRyb25vbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC50aGlydHlzZWNvbmRzID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTk6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdrZXlTaWduYXR1cmUnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMil7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBrZXlTaWduYXR1cmUgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmtleSA9IHN0cmVhbS5yZWFkSW50OCh0cnVlKTtcbiAgICAgICAgICBldmVudC5zY2FsZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDdmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VyU3BlY2lmaWMnO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvL2lmKHNlcXVlbmNlci5kZWJ1ZyA+PSAyKXtcbiAgICAgICAgICAvLyAgICBjb25zb2xlLndhcm4oJ1VucmVjb2duaXNlZCBtZXRhIGV2ZW50IHN1YnR5cGU6ICcgKyBzdWJ0eXBlQnl0ZSk7XG4gICAgICAgICAgLy99XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICB9XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4ZjApe1xuICAgICAgZXZlbnQudHlwZSA9ICdzeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2UgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGY3KXtcbiAgICAgIGV2ZW50LnR5cGUgPSAnZGl2aWRlZFN5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlIGJ5dGU6ICcgKyBldmVudFR5cGVCeXRlO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgLyogY2hhbm5lbCBldmVudCAqL1xuICAgIGxldCBwYXJhbTE7XG4gICAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweDgwKSA9PT0gMCl7XG4gICAgICAvKiBydW5uaW5nIHN0YXR1cyAtIHJldXNlIGxhc3RFdmVudFR5cGVCeXRlIGFzIHRoZSBldmVudCB0eXBlLlxuICAgICAgICBldmVudFR5cGVCeXRlIGlzIGFjdHVhbGx5IHRoZSBmaXJzdCBwYXJhbWV0ZXJcbiAgICAgICovXG4gICAgICAvL2NvbnNvbGUubG9nKCdydW5uaW5nIHN0YXR1cycpO1xuICAgICAgcGFyYW0xID0gZXZlbnRUeXBlQnl0ZTtcbiAgICAgIGV2ZW50VHlwZUJ5dGUgPSBsYXN0RXZlbnRUeXBlQnl0ZTtcbiAgICB9ZWxzZXtcbiAgICAgIHBhcmFtMSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgLy9jb25zb2xlLmxvZygnbGFzdCcsIGV2ZW50VHlwZUJ5dGUpO1xuICAgICAgbGFzdEV2ZW50VHlwZUJ5dGUgPSBldmVudFR5cGVCeXRlO1xuICAgIH1cbiAgICBsZXQgZXZlbnRUeXBlID0gZXZlbnRUeXBlQnl0ZSA+PiA0O1xuICAgIGV2ZW50LmNoYW5uZWwgPSBldmVudFR5cGVCeXRlICYgMHgwZjtcbiAgICBldmVudC50eXBlID0gJ2NoYW5uZWwnO1xuICAgIHN3aXRjaCAoZXZlbnRUeXBlKXtcbiAgICAgIGNhc2UgMHgwODpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT2ZmJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDA5OlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBpZihldmVudC52ZWxvY2l0eSA9PT0gMCl7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT2ZmJztcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ25vdGVPbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGI6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29udHJvbGxlcic7XG4gICAgICAgIGV2ZW50LmNvbnRyb2xsZXJUeXBlID0gcGFyYW0xO1xuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGM6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncHJvZ3JhbUNoYW5nZSc7XG4gICAgICAgIGV2ZW50LnByb2dyYW1OdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZDpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjaGFubmVsQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHBhcmFtMTtcbiAgICAgICAgLy9pZih0cmFja05hbWUgPT09ICdTSC1TMS00NC1DMDkgTD1TTUwgSU49Mycpe1xuICAgICAgICAvLyAgICBjb25zb2xlLmxvZygnY2hhbm5lbCBwcmVzc3VyZScsIHRyYWNrTmFtZSwgcGFyYW0xKTtcbiAgICAgICAgLy99XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwaXRjaEJlbmQnO1xuICAgICAgICBldmVudC52YWx1ZSA9IHBhcmFtMSArIChzdHJlYW0ucmVhZEludDgoKSA8PCA3KTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLypcbiAgICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGU7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlKTtcbiAgICAgICAgKi9cblxuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbi8qXG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgY29uc29sZS5sb2coJ3dlaXJkbycsIHRyYWNrTmFtZSwgcGFyYW0xLCBldmVudC52ZWxvY2l0eSk7XG4qL1xuXG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNSURJRmlsZShidWZmZXIpe1xuICBpZihidWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5ID09PSBmYWxzZSAmJiBidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUuZXJyb3IoJ2J1ZmZlciBzaG91bGQgYmUgYW4gaW5zdGFuY2Ugb2YgVWludDhBcnJheSBvZiBBcnJheUJ1ZmZlcicpXG4gICAgcmV0dXJuXG4gIH1cbiAgaWYoYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe1xuICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgfVxuICBsZXQgdHJhY2tzID0gbmV3IE1hcCgpO1xuICBsZXQgc3RyZWFtID0gbmV3IE1JRElTdHJlYW0oYnVmZmVyKTtcblxuICBsZXQgaGVhZGVyQ2h1bmsgPSByZWFkQ2h1bmsoc3RyZWFtKTtcbiAgaWYoaGVhZGVyQ2h1bmsuaWQgIT09ICdNVGhkJyB8fCBoZWFkZXJDaHVuay5sZW5ndGggIT09IDYpe1xuICAgIHRocm93ICdCYWQgLm1pZCBmaWxlIC0gaGVhZGVyIG5vdCBmb3VuZCc7XG4gIH1cblxuICBsZXQgaGVhZGVyU3RyZWFtID0gbmV3IE1JRElTdHJlYW0oaGVhZGVyQ2h1bmsuZGF0YSk7XG4gIGxldCBmb3JtYXRUeXBlID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdHJhY2tDb3VudCA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgbGV0IHRpbWVEaXZpc2lvbiA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcblxuICBpZih0aW1lRGl2aXNpb24gJiAweDgwMDApe1xuICAgIHRocm93ICdFeHByZXNzaW5nIHRpbWUgZGl2aXNpb24gaW4gU01UUEUgZnJhbWVzIGlzIG5vdCBzdXBwb3J0ZWQgeWV0JztcbiAgfVxuXG4gIGxldCBoZWFkZXIgPXtcbiAgICAnZm9ybWF0VHlwZSc6IGZvcm1hdFR5cGUsXG4gICAgJ3RyYWNrQ291bnQnOiB0cmFja0NvdW50LFxuICAgICd0aWNrc1BlckJlYXQnOiB0aW1lRGl2aXNpb25cbiAgfTtcblxuICBmb3IobGV0IGkgPSAwOyBpIDwgdHJhY2tDb3VudDsgaSsrKXtcbiAgICB0cmFja05hbWUgPSAndHJhY2tfJyArIGk7XG4gICAgbGV0IHRyYWNrID0gW107XG4gICAgbGV0IHRyYWNrQ2h1bmsgPSByZWFkQ2h1bmsoc3RyZWFtKTtcbiAgICBpZih0cmFja0NodW5rLmlkICE9PSAnTVRyaycpe1xuICAgICAgdGhyb3cgJ1VuZXhwZWN0ZWQgY2h1bmsgLSBleHBlY3RlZCBNVHJrLCBnb3QgJysgdHJhY2tDaHVuay5pZDtcbiAgICB9XG4gICAgbGV0IHRyYWNrU3RyZWFtID0gbmV3IE1JRElTdHJlYW0odHJhY2tDaHVuay5kYXRhKTtcbiAgICB3aGlsZSghdHJhY2tTdHJlYW0uZW9mKCkpe1xuICAgICAgbGV0IGV2ZW50ID0gcmVhZEV2ZW50KHRyYWNrU3RyZWFtKTtcbiAgICAgIHRyYWNrLnB1c2goZXZlbnQpO1xuICAgIH1cbiAgICB0cmFja3Muc2V0KHRyYWNrTmFtZSwgdHJhY2spO1xuICB9XG5cbiAgcmV0dXJue1xuICAgICdoZWFkZXInOiBoZWFkZXIsXG4gICAgJ3RyYWNrcyc6IHRyYWNrc1xuICB9O1xufSIsIi8qXG4gIEFkZHMgYSBmdW5jdGlvbiB0byBjcmVhdGUgYSBub3RlIG9iamVjdCB0aGF0IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGEgbXVzaWNhbCBub3RlOlxuICAgIC0gbmFtZSwgZS5nLiAnQydcbiAgICAtIG9jdGF2ZSwgIC0xIC0gOVxuICAgIC0gZnVsbE5hbWU6ICdDMSdcbiAgICAtIGZyZXF1ZW5jeTogMjM0LjE2LCBiYXNlZCBvbiB0aGUgYmFzaWMgcGl0Y2hcbiAgICAtIG51bWJlcjogNjAgbWlkaSBub3RlIG51bWJlclxuXG4gIEFkZHMgc2V2ZXJhbCB1dGlsaXR5IG1ldGhvZHMgb3JnYW5pc2VkIGFyb3VuZCB0aGUgbm90ZSBvYmplY3RcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnO1xuXG5sZXRcbiAgZXJyb3JNc2csXG4gIHdhcm5pbmdNc2csXG4gIHBvdyA9IE1hdGgucG93LFxuICBmbG9vciA9IE1hdGguZmxvb3I7XG5cbmNvbnN0IG5vdGVOYW1lcyA9IHtcbiAgJ3NoYXJwJyA6IFsnQycsICdDIycsICdEJywgJ0QjJywgJ0UnLCAnRicsICdGIycsICdHJywgJ0cjJywgJ0EnLCAnQSMnLCAnQiddLFxuICAnZmxhdCcgOiBbJ0MnLCAnRGInLCAnRCcsICdFYicsICdFJywgJ0YnLCAnR2InLCAnRycsICdBYicsICdBJywgJ0JiJywgJ0InXSxcbiAgJ2VuaGFybW9uaWMtc2hhcnAnIDogWydCIycsICdDIycsICdDIyMnLCAnRCMnLCAnRCMjJywgJ0UjJywgJ0YjJywgJ0YjIycsICdHIycsICdHIyMnLCAnQSMnLCAnQSMjJ10sXG4gICdlbmhhcm1vbmljLWZsYXQnIDogWydEYmInLCAnRGInLCAnRWJiJywgJ0ViJywgJ0ZiJywgJ0diYicsICdHYicsICdBYmInLCAnQWInLCAnQmJiJywgJ0JiJywgJ0NiJ11cbn07XG5cblxuLypcbiAgYXJndW1lbnRzXG4gIC0gbm90ZU51bWJlcjogNjBcbiAgLSBub3RlTnVtYmVyIGFuZCBub3RlbmFtZSBtb2RlOiA2MCwgJ3NoYXJwJ1xuICAtIG5vdGVOYW1lOiAnQyM0J1xuICAtIG5hbWUgYW5kIG9jdGF2ZTogJ0MjJywgNFxuICAtIG5vdGUgbmFtZSwgb2N0YXZlLCBub3RlIG5hbWUgbW9kZTogJ0QnLCA0LCAnc2hhcnAnXG4gIC0gZGF0YSBvYmplY3Q6XG4gICAge1xuICAgICAgbmFtZTogJ0MnLFxuICAgICAgb2N0YXZlOiA0XG4gICAgfVxuICAgIG9yXG4gICAge1xuICAgICAgZnJlcXVlbmN5OiAyMzQuMTZcbiAgICB9XG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTm90ZSguLi5hcmdzKXtcbiAgbGV0XG4gICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoLFxuICAgIGRhdGEsXG4gICAgb2N0YXZlLFxuICAgIG5vdGVOYW1lLFxuICAgIG5vdGVOdW1iZXIsXG4gICAgbm90ZU5hbWVNb2RlLFxuICAgIGFyZzAgPSBhcmdzWzBdLFxuICAgIGFyZzEgPSBhcmdzWzFdLFxuICAgIGFyZzIgPSBhcmdzWzJdLFxuICAgIHR5cGUwID0gdHlwZVN0cmluZyhhcmcwKSxcbiAgICB0eXBlMSA9IHR5cGVTdHJpbmcoYXJnMSksXG4gICAgdHlwZTIgPSB0eXBlU3RyaW5nKGFyZzIpO1xuXG4gIGVycm9yTXNnID0gJyc7XG4gIHdhcm5pbmdNc2cgPSAnJztcblxuICAvLyBhcmd1bWVudDogbm90ZSBudW1iZXJcbiAgLy9jb25zb2xlLmxvZyhudW1BcmdzLCB0eXBlMClcbiAgaWYobnVtQXJncyA9PT0gMSAmJiB0eXBlMCA9PT0gJ251bWJlcicpe1xuICAgIGlmKGFyZzAgPCAwIHx8IGFyZzAgPiAxMjcpe1xuICAgICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYSBub3RlIG51bWJlciA+PSAwIGFuZCA8PSAxMjcgJyArICBhcmcwO1xuICAgIH1lbHNle1xuICAgICAgbm90ZU51bWJlciA9IGFyZzA7XG4gICAgICBkYXRhID0gX2dldE5vdGVOYW1lKG5vdGVOdW1iZXIpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICB9XG5cblxuICAvLyBhcmd1bWVudHM6IGZ1bGwgbm90ZSBuYW1lXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDEgJiYgdHlwZTAgPT09ICdzdHJpbmcnKXtcbiAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCk7XG4gICAgaWYoZXJyb3JNc2cgPT09ICcnKXtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsIG9jdGF2ZSk7XG4gICAgfVxuXG4gIC8vIGFyZ3VtZW50czogbm90ZSBuYW1lLCBvY3RhdmVcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMiAmJiB0eXBlMCA9PT0gJ3N0cmluZycgJiYgdHlwZTEgPT09ICdudW1iZXInKXtcbiAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCwgYXJnMSk7XG4gICAgaWYoZXJyb3JNc2cgPT09ICcnKXtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsIG9jdGF2ZSk7XG4gICAgfVxuXG4gIC8vIGFyZ3VtZW50czogZnVsbCBub3RlIG5hbWUsIG5vdGUgbmFtZSBtb2RlIC0+IGZvciBjb252ZXJ0aW5nIGJldHdlZW4gbm90ZSBuYW1lIG1vZGVzXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnc3RyaW5nJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzApO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZU1vZGUgPSBfY2hlY2tOb3RlTmFtZU1vZGUoYXJnMSk7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuXG4gIC8vIGFyZ3VtZW50czogbm90ZSBudW1iZXIsIG5vdGUgbmFtZSBtb2RlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIgJiYgdHlwZVN0cmluZyhhcmcwKSA9PT0gJ251bWJlcicgJiYgdHlwZVN0cmluZyhhcmcxKSA9PT0gJ3N0cmluZycpe1xuICAgIGlmKGFyZzAgPCAwIHx8IGFyZzAgPiAxMjcpe1xuICAgICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYSBub3RlIG51bWJlciA+PSAwIGFuZCA8PSAxMjcgJyArIGFyZzA7XG4gICAgfWVsc2V7XG4gICAgICBub3RlTmFtZU1vZGUgPSBfY2hlY2tOb3RlTmFtZU1vZGUoYXJnMSk7XG4gICAgICBub3RlTnVtYmVyID0gYXJnMDtcbiAgICAgIGRhdGEgPSBfZ2V0Tm90ZU5hbWUobm90ZU51bWJlciwgbm90ZU5hbWVNb2RlKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgfVxuXG5cbiAgLy8gYXJndW1lbnRzOiBub3RlIG5hbWUsIG9jdGF2ZSwgbm90ZSBuYW1lIG1vZGVcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMyAmJiB0eXBlMCA9PT0gJ3N0cmluZycgJiYgdHlwZTEgPT09ICdudW1iZXInICYmIHR5cGUyID09PSAnc3RyaW5nJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzAsIGFyZzEpO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZU1vZGUgPSBfY2hlY2tOb3RlTmFtZU1vZGUoYXJnMik7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLG9jdGF2ZSk7XG4gICAgfVxuXG4gIH1lbHNle1xuICAgIGVycm9yTXNnID0gJ3dyb25nIGFyZ3VtZW50cywgcGxlYXNlIGNvbnN1bHQgZG9jdW1lbnRhdGlvbic7XG4gIH1cblxuICBpZihlcnJvck1zZyl7XG4gICAgY29uc29sZS5lcnJvcihlcnJvck1zZyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYod2FybmluZ01zZyl7XG4gICAgY29uc29sZS53YXJuKHdhcm5pbmdNc2cpO1xuICB9XG5cbiAgbGV0IG5vdGUgPSB7XG4gICAgbmFtZTogbm90ZU5hbWUsXG4gICAgb2N0YXZlOiBvY3RhdmUsXG4gICAgZnVsbE5hbWU6IG5vdGVOYW1lICsgb2N0YXZlLFxuICAgIG51bWJlcjogbm90ZU51bWJlcixcbiAgICBmcmVxdWVuY3k6IF9nZXRGcmVxdWVuY3kobm90ZU51bWJlciksXG4gICAgYmxhY2tLZXk6IF9pc0JsYWNrS2V5KG5vdGVOdW1iZXIpXG4gIH1cbiAgT2JqZWN0LmZyZWV6ZShub3RlKTtcbiAgcmV0dXJuIG5vdGU7XG59XG5cblxuLy9mdW5jdGlvbiBfZ2V0Tm90ZU5hbWUobnVtYmVyLCBtb2RlID0gY29uZmlnLmdldCgnbm90ZU5hbWVNb2RlJykpIHtcbmZ1bmN0aW9uIF9nZXROb3RlTmFtZShudW1iZXIsIG1vZGUgPSAnc2hhcnAnKSB7XG4gIC8vbGV0IG9jdGF2ZSA9IE1hdGguZmxvb3IoKG51bWJlciAvIDEyKSAtIDIpLCAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgbGV0IG9jdGF2ZSA9IGZsb29yKChudW1iZXIgLyAxMikgLSAxKTtcbiAgbGV0IG5vdGVOYW1lID0gbm90ZU5hbWVzW21vZGVdW251bWJlciAlIDEyXTtcbiAgcmV0dXJuIFtub3RlTmFtZSwgb2N0YXZlXTtcbn1cblxuXG5mdW5jdGlvbiBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpIHtcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgaW5kZXg7XG5cbiAgZm9yKGxldCBrZXkgb2Yga2V5cyl7XG4gICAgbGV0IG1vZGUgPSBub3RlTmFtZXNba2V5XTtcbiAgICBpbmRleCA9IG1vZGUuZmluZEluZGV4KHggPT4geCA9PT0gbmFtZSk7XG4gICAgaWYoaW5kZXggIT09IC0xKXtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKSArIDEyOyAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgbGV0IG51bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMik7Ly8g4oaSIG1pZGkgc3RhbmRhcmQgKyBzY2llbnRpZmljIG5hbWluZywgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01pZGRsZV9DIGFuZCBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NjaWVudGlmaWNfcGl0Y2hfbm90YXRpb25cblxuICBpZihudW1iZXIgPCAwIHx8IG51bWJlciA+IDEyNyl7XG4gICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYSBub3RlIGJldHdlZW4gQzAgYW5kIEcxMCc7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJldHVybiBudW1iZXI7XG59XG5cblxuZnVuY3Rpb24gX2dldEZyZXF1ZW5jeShudW1iZXIpe1xuICAvL3JldHVybiBjb25maWcuZ2V0KCdwaXRjaCcpICogcG93KDIsKG51bWJlciAtIDY5KS8xMik7IC8vIG1pZGkgc3RhbmRhcmQsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NSURJX1R1bmluZ19TdGFuZGFyZFxuICByZXR1cm4gNDQwICogcG93KDIsKG51bWJlciAtIDY5KS8xMik7IC8vIG1pZGkgc3RhbmRhcmQsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NSURJX1R1bmluZ19TdGFuZGFyZFxufVxuXG5cbi8vIFRPRE86IGNhbGN1bGF0ZSBub3RlIGZyb20gZnJlcXVlbmN5XG5mdW5jdGlvbiBfZ2V0UGl0Y2goaGVydHope1xuICAvL2ZtICA9ICAyKG3iiJI2OSkvMTIoNDQwIEh6KS5cbn1cblxuXG5mdW5jdGlvbiBfY2hlY2tOb3RlTmFtZU1vZGUobW9kZSl7XG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgbGV0IHJlc3VsdCA9IGtleXMuZmluZCh4ID0+IHggPT09IG1vZGUpICE9PSB1bmRlZmluZWQ7XG4gIGlmKHJlc3VsdCA9PT0gZmFsc2Upe1xuICAgIC8vbW9kZSA9IGNvbmZpZy5nZXQoJ25vdGVOYW1lTW9kZScpO1xuICAgIG1vZGUgPSAnc2hhcnAnO1xuICAgIHdhcm5pbmdNc2cgPSBtb2RlICsgJyBpcyBub3QgYSB2YWxpZCBub3RlIG5hbWUgbW9kZSwgdXNpbmcgXCInICsgbW9kZSArICdcIiBpbnN0ZWFkJztcbiAgfVxuICByZXR1cm4gbW9kZTtcbn1cblxuXG5mdW5jdGlvbiBfY2hlY2tOb3RlTmFtZSguLi5hcmdzKXtcbiAgbGV0XG4gICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoLFxuICAgIGFyZzAgPSBhcmdzWzBdLFxuICAgIGFyZzEgPSBhcmdzWzFdLFxuICAgIGNoYXIsXG4gICAgbmFtZSA9ICcnLFxuICAgIG9jdGF2ZSA9ICcnO1xuXG4gIC8vIGV4dHJhY3Qgb2N0YXZlIGZyb20gbm90ZSBuYW1lXG4gIGlmKG51bUFyZ3MgPT09IDEpe1xuICAgIGZvcihjaGFyIG9mIGFyZzApe1xuICAgICAgaWYoaXNOYU4oY2hhcikgJiYgY2hhciAhPT0gJy0nKXtcbiAgICAgICAgbmFtZSArPSBjaGFyO1xuICAgICAgfWVsc2V7XG4gICAgICAgIG9jdGF2ZSArPSBjaGFyO1xuICAgICAgfVxuICAgIH1cbiAgICBpZihvY3RhdmUgPT09ICcnKXtcbiAgICAgIG9jdGF2ZSA9IDA7XG4gICAgfVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyKXtcbiAgICBuYW1lID0gYXJnMDtcbiAgICBvY3RhdmUgPSBhcmcxO1xuICB9XG5cbiAgLy8gY2hlY2sgaWYgbm90ZSBuYW1lIGlzIHZhbGlkXG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgbGV0IGluZGV4ID0gLTE7XG5cbiAgZm9yKGxldCBrZXkgb2Yga2V5cyl7XG4gICAgbGV0IG1vZGUgPSBub3RlTmFtZXNba2V5XTtcbiAgICBpbmRleCA9IG1vZGUuZmluZEluZGV4KHggPT4geCA9PT0gbmFtZSk7XG4gICAgaWYoaW5kZXggIT09IC0xKXtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmKGluZGV4ID09PSAtMSl7XG4gICAgZXJyb3JNc2cgPSBhcmcwICsgJyBpcyBub3QgYSB2YWxpZCBub3RlIG5hbWUsIHBsZWFzZSB1c2UgbGV0dGVycyBBIC0gRyBhbmQgaWYgbmVjZXNzYXJ5IGFuIGFjY2lkZW50YWwgbGlrZSAjLCAjIywgYiBvciBiYiwgZm9sbG93ZWQgYnkgYSBudW1iZXIgZm9yIHRoZSBvY3RhdmUnO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKG9jdGF2ZSA8IC0xIHx8IG9jdGF2ZSA+IDkpe1xuICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGFuIG9jdGF2ZSBiZXR3ZWVuIC0xIGFuZCA5JztcbiAgICByZXR1cm47XG4gIH1cblxuICBvY3RhdmUgPSBwYXJzZUludChvY3RhdmUsIDEwKTtcbiAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDAsIDEpLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnN1YnN0cmluZygxKTtcblxuICAvL2NvbnNvbGUubG9nKG5hbWUsJ3wnLG9jdGF2ZSk7XG4gIHJldHVybiBbbmFtZSwgb2N0YXZlXTtcbn1cblxuXG5cbmZ1bmN0aW9uIF9pc0JsYWNrS2V5KG5vdGVOdW1iZXIpe1xuICBsZXQgYmxhY2s7XG5cbiAgc3dpdGNoKHRydWUpe1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxOi8vQyNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMzovL0QjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDY6Ly9GI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSA4Oi8vRyNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTA6Ly9BI1xuICAgICAgYmxhY2sgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJsYWNrID0gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gYmxhY2s7XG59XG5cblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlTnVtYmVyKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLm51bWJlcjtcbiAgfVxuICByZXR1cm4gZXJyb3JNc2c7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLm5hbWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlT2N0YXZlKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLm9jdGF2ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZ1bGxOb3RlTmFtZSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5mdWxsTmFtZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZyZXF1ZW5jeSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5mcmVxdWVuY3k7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0JsYWNrS2V5KC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmJsYWNrS2V5O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsImltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHt0eXBlU3RyaW5nLCBjaGVja0lmQmFzZTY0LCBiYXNlNjRUb0JpbmFyeX0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcbmltcG9ydCB7cWFtYml9IGZyb20gJy4vcWFtYmknXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZVNhbXBsZShzYW1wbGUsIGlkLCBldmVyeSl7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcbiAgICB0cnl7XG4gICAgICBjb250ZXh0LmRlY29kZUF1ZGlvRGF0YShzYW1wbGUsXG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzKGJ1ZmZlcil7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhpZCwgYnVmZmVyKTtcbiAgICAgICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHJlc29sdmUoe2lkLCBidWZmZXJ9KVxuICAgICAgICAgICAgaWYoZXZlcnkpe1xuICAgICAgICAgICAgICBldmVyeSh7aWQsIGJ1ZmZlcn0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXNvbHZlKGJ1ZmZlcik7XG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KGJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uRXJyb3IoZSl7XG4gICAgICAgICAgY29uc29sZS5sb2coYGVycm9yIGRlY29kaW5nIGF1ZGlvZGF0YSAke2V9IFtJRDogJHtpZH1dYCk7XG4gICAgICAgICAgLy9yZWplY3QoZSk7IC8vIGRvbid0IHVzZSByZWplY3QgYmVjYXVzZSB3ZSB1c2UgdGhpcyBhcyBhIG5lc3RlZCBwcm9taXNlIGFuZCB3ZSBkb24ndCB3YW50IHRoZSBwYXJlbnQgcHJvbWlzZSB0byByZWplY3RcbiAgICAgICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKVxuICAgIH1jYXRjaChlKXtcbiAgICAgIGNvbnNvbGUud2FybignZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpXG4gICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cblxuXG5mdW5jdGlvbiBsb2FkQW5kUGFyc2VTYW1wbGUodXJsLCBpZCwgZXZlcnkpe1xuICAvL2NvbnNvbGUubG9nKGlkLCB1cmwpXG4gIC8qXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ2xvYWRpbmcnLFxuICAgICAgZGF0YTogdXJsXG4gICAgfSlcbiAgfSwgMClcbiAgKi9cbiAgZGlzcGF0Y2hFdmVudCh7XG4gICAgdHlwZTogJ2xvYWRpbmcnLFxuICAgIGRhdGE6IHVybFxuICB9KVxuXG4gIGxldCBleGVjdXRvciA9IGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIGZldGNoKHVybCwge1xuICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgIH0pLnRoZW4oXG4gICAgICBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGlmKHJlc3BvbnNlLm9rKXtcbiAgICAgICAgICByZXNwb25zZS5hcnJheUJ1ZmZlcigpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBkYXRhKVxuICAgICAgICAgICAgZGVjb2RlU2FtcGxlKGRhdGEsIGlkLCBldmVyeSkudGhlbihyZXNvbHZlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNlIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApXG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKVxufVxuXG5cbmZ1bmN0aW9uIGdldFByb21pc2VzKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpe1xuXG4gIGNvbnN0IGdldFNhbXBsZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYoa2V5ICE9PSAncmVsZWFzZScgJiYga2V5ICE9PSAnaW5mbycgJiYga2V5ICE9PSAnc3VzdGFpbicpe1xuICAgICAgLy9jb25zb2xlLmxvZyhrZXkpXG4gICAgICBpZihzYW1wbGUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgICAgIHByb21pc2VzLnB1c2goZGVjb2RlU2FtcGxlKHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSkpXG4gICAgICB9ZWxzZSBpZih0eXBlb2Ygc2FtcGxlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlmKGNoZWNrSWZCYXNlNjQoc2FtcGxlKSl7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChkZWNvZGVTYW1wbGUoYmFzZTY0VG9CaW5hcnkoc2FtcGxlKSwga2V5LCBiYXNlVXJsLCBldmVyeSkpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIC8vY29uc29sZS5sb2coYmFzZVVybCArIHNhbXBsZSlcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRBbmRQYXJzZVNhbXBsZShiYXNlVXJsICsgZXNjYXBlKHNhbXBsZSksIGtleSwgZXZlcnkpKVxuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZih0eXBlb2Ygc2FtcGxlID09PSAnb2JqZWN0Jyl7XG4gICAgICAgIHNhbXBsZSA9IHNhbXBsZS5zYW1wbGUgfHwgc2FtcGxlLmJ1ZmZlciB8fCBzYW1wbGUuYmFzZTY0IHx8IHNhbXBsZS51cmxcbiAgICAgICAgZ2V0U2FtcGxlKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpXG4gICAgICAgIC8vY29uc29sZS5sb2coa2V5LCBzYW1wbGUpXG4gICAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlLCBwcm9taXNlcy5sZW5ndGgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0U2FtcGxlKClcbn1cblxuXG4vLyBvbmx5IGZvciBpbnRlcm5hbGx5IHVzZSBpbiBxYW1iaVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2FtcGxlczIobWFwcGluZywgZXZlcnkgPSBmYWxzZSl7XG4gIGxldCB0eXBlID0gdHlwZVN0cmluZyhtYXBwaW5nKSxcbiAgICBwcm9taXNlcyA9IFtdLFxuICAgIGJhc2VVcmwgPSAnJ1xuXG4gIGlmKHR5cGVvZiBtYXBwaW5nLmJhc2VVcmwgPT09ICdzdHJpbmcnKXtcbiAgICBiYXNlVXJsID0gbWFwcGluZy5iYXNlVXJsXG4gICAgZGVsZXRlIG1hcHBpbmcuYmFzZVVybFxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhtYXBwaW5nLCBiYXNlVXJsKVxuXG4gIGV2ZXJ5ID0gdHlwZW9mIGV2ZXJ5ID09PSAnZnVuY3Rpb24nID8gZXZlcnkgOiBmYWxzZVxuICAvL2NvbnNvbGUubG9nKHR5cGUsIG1hcHBpbmcpXG4gIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICBPYmplY3Qua2V5cyhtYXBwaW5nKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAvLyBpZihpc05hTihrZXkpID09PSBmYWxzZSl7XG4gICAgICAvLyAgIGtleSA9IHBhcnNlSW50KGtleSwgMTApXG4gICAgICAvLyB9XG4gICAgICBsZXQgYSA9IG1hcHBpbmdba2V5XVxuICAgICAgLy9jb25zb2xlLmxvZyhrZXksIGEsIHR5cGVTdHJpbmcoYSkpXG4gICAgICBpZih0eXBlU3RyaW5nKGEpID09PSAnYXJyYXknKXtcbiAgICAgICAgYS5mb3JFYWNoKG1hcCA9PiB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhtYXApXG4gICAgICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIG1hcCwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgYSwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICAgIH1cbiAgICB9KVxuICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICBsZXQga2V5XG4gICAgbWFwcGluZy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSl7XG4gICAgICAvLyBrZXkgaXMgZGVsaWJlcmF0ZWx5IHVuZGVmaW5lZFxuICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIC50aGVuKCh2YWx1ZXMpID0+IHtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSwgdmFsdWVzKVxuICAgICAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgICAgICBtYXBwaW5nID0ge31cbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIC8vIHN1cHBvcnQgZm9yIG11bHRpIGxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgICAgICBsZXQgbWFwID0gbWFwcGluZ1t2YWx1ZS5pZF1cbiAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcobWFwKVxuICAgICAgICAgIGlmKHR5cGUgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICAgICAgICBtYXAucHVzaCh2YWx1ZS5idWZmZXIpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgbWFwcGluZ1t2YWx1ZS5pZF0gPSBbbWFwLCB2YWx1ZS5idWZmZXJdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IHZhbHVlLmJ1ZmZlclxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtYXBwaW5nKVxuICAgICAgICByZXNvbHZlKG1hcHBpbmcpXG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2FtcGxlcyguLi5kYXRhKXtcbiAgaWYoZGF0YS5sZW5ndGggPT09IDEgJiYgdHlwZVN0cmluZyhkYXRhWzBdKSAhPT0gJ3N0cmluZycpe1xuICAgIC8vY29uc29sZS5sb2coZGF0YVswXSlcbiAgICByZXR1cm4gcGFyc2VTYW1wbGVzMihkYXRhWzBdKVxuICB9XG4gIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGEpXG59XG4iLCJpbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtNSURJTm90ZX0gZnJvbSAnLi9taWRpX25vdGUnO1xuXG5sZXRcbiAgcHBxLFxuICBicG0sXG4gIGZhY3RvcixcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcbiAgcGxheWJhY2tTcGVlZCxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcbiAgdGlja3MsXG4gIG1pbGxpcyxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIGRpZmZUaWNrc1xuICAvL3ByZXZpb3VzRXZlbnRcblxuZnVuY3Rpb24gc2V0VGlja0R1cmF0aW9uKCl7XG4gIHNlY29uZHNQZXJUaWNrID0gKDEgLyBwbGF5YmFja1NwZWVkICogNjApIC8gYnBtIC8gcHBxO1xuICBtaWxsaXNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2sgKiAxMDAwO1xuICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssIGJwbSwgcHBxLCBwbGF5YmFja1NwZWVkLCAocHBxICogbWlsbGlzUGVyVGljaykpO1xuICAvL2NvbnNvbGUubG9nKHBwcSk7XG59XG5cblxuZnVuY3Rpb24gc2V0VGlja3NQZXJCZWF0KCl7XG4gIGZhY3RvciA9ICg0IC8gZGVub21pbmF0b3IpO1xuICBudW1TaXh0ZWVudGggPSBmYWN0b3IgKiA0O1xuICB0aWNrc1BlckJlYXQgPSBwcHEgKiBmYWN0b3I7XG4gIHRpY2tzUGVyQmFyID0gdGlja3NQZXJCZWF0ICogbm9taW5hdG9yO1xuICB0aWNrc1BlclNpeHRlZW50aCA9IHBwcSAvIDQ7XG4gIC8vY29uc29sZS5sb2coZGVub21pbmF0b3IsIGZhY3RvciwgbnVtU2l4dGVlbnRoLCB0aWNrc1BlckJlYXQsIHRpY2tzUGVyQmFyLCB0aWNrc1BlclNpeHRlZW50aCk7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlUG9zaXRpb24oZXZlbnQsIGZhc3QgPSBmYWxzZSl7XG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIC8vIGlmKGRpZmZUaWNrcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGRpZmZUaWNrcywgZXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudHlwZSlcbiAgLy8gfVxuICB0aWNrICs9IGRpZmZUaWNrcztcbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgLy9wcmV2aW91c0V2ZW50ID0gZXZlbnRcbiAgLy9jb25zb2xlLmxvZyhkaWZmVGlja3MsIG1pbGxpc1BlclRpY2spO1xuICBtaWxsaXMgKz0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcblxuICBpZihmYXN0ID09PSBmYWxzZSl7XG4gICAgd2hpbGUodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgICBzaXh0ZWVudGgrKztcbiAgICAgIHRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgICBiZWF0Kys7XG4gICAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICAgIGJlYXQgLT0gbm9taW5hdG9yO1xuICAgICAgICAgIGJhcisrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGltZUV2ZW50cyhzZXR0aW5ncywgdGltZUV2ZW50cywgaXNQbGF5aW5nID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZSB0aW1lIGV2ZW50cycpXG4gIGxldCB0eXBlO1xuICBsZXQgZXZlbnQ7XG5cbiAgcHBxID0gc2V0dGluZ3MucHBxO1xuICBicG0gPSBzZXR0aW5ncy5icG07XG4gIG5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcjtcbiAgcGxheWJhY2tTcGVlZCA9IHNldHRpbmdzLnBsYXliYWNrU3BlZWQ7XG4gIGJhciA9IDE7XG4gIGJlYXQgPSAxO1xuICBzaXh0ZWVudGggPSAxO1xuICB0aWNrID0gMDtcbiAgdGlja3MgPSAwO1xuICBtaWxsaXMgPSAwO1xuXG4gIHNldFRpY2tEdXJhdGlvbigpO1xuICBzZXRUaWNrc1BlckJlYXQoKTtcblxuICB0aW1lRXZlbnRzLnNvcnQoKGEsIGIpID0+IChhLnRpY2tzIDw9IGIudGlja3MpID8gLTEgOiAxKTtcbiAgbGV0IGUgPSAwO1xuICBmb3IoZXZlbnQgb2YgdGltZUV2ZW50cyl7XG4gICAgLy9jb25zb2xlLmxvZyhlKyssIGV2ZW50LnRpY2tzLCBldmVudC50eXBlKVxuICAgIC8vZXZlbnQuc29uZyA9IHNvbmc7XG4gICAgdHlwZSA9IGV2ZW50LnR5cGU7XG4gICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG5cbiAgICBzd2l0Y2godHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgc2V0VGlja3NQZXJCZWF0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvL3RpbWUgZGF0YSBvZiB0aW1lIGV2ZW50IGlzIHZhbGlkIGZyb20gKGFuZCBpbmNsdWRlZCkgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aW1lIGV2ZW50XG4gICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXJzQXNTdHJpbmcpO1xuICB9XG5cbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xuICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgLy9jb25zb2xlLmxvZyh0aW1lRXZlbnRzKTtcbn1cblxuXG4vL2V4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhzb25nLCBldmVudHMpe1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKGV2ZW50cywgaXNQbGF5aW5nID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIGxldCBldmVudDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG4gIGxldCByZXN1bHQgPSBbXVxuXG4gIHRpY2sgPSAwXG4gIHRpY2tzID0gMFxuICBkaWZmVGlja3MgPSAwXG5cbiAgLy9sZXQgZXZlbnRzID0gW10uY29uY2F0KGV2dHMsIHNvbmcuX3RpbWVFdmVudHMpO1xuICBsZXQgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcblxuICAvLyBub3Rlb2ZmIGNvbWVzIGJlZm9yZSBub3Rlb25cblxuLypcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEuc29ydEluZGV4IC0gYi5zb3J0SW5kZXg7XG4gIH0pXG4qL1xuXG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgLy8gaWYoYS50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gLTFcbiAgICAgIC8vIH1lbHNlIGlmKGIudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vICAgcmV0dXJuIDFcbiAgICAgIC8vIH1cbiAgICAgIC8vIHNob3J0OlxuICAgICAgbGV0IHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgIHIgPSAtMVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJcbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4gIH0pXG4gIGV2ZW50ID0gZXZlbnRzWzBdXG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG5cblxuICBicG0gPSBldmVudC5icG07XG4gIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcblxuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG5cbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cblxuICBmb3IobGV0IGkgPSBzdGFydEV2ZW50OyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuXG4gICAgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcbiAgICAgICAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gICAgICAgIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljayxldmVudC5taWxsaXNQZXJUaWNrKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgICAgICAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICAgICAgICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobm9taW5hdG9yLG51bVNpeHRlZW50aCx0aWNrc1BlclNpeHRlZW50aCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuXG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAvL2Nhc2UgMTI4OlxuICAgICAgLy9jYXNlIDE0NDpcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAgIHVwZGF0ZUV2ZW50KGV2ZW50LCBpc1BsYXlpbmcpO1xuICAgICAgICByZXN1bHQucHVzaChldmVudClcblxuICAgICAgICAvLyBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhldmVudC5kYXRhMiwgZXZlbnQuYmFyc0FzU3RyaW5nKVxuICAgICAgICAvLyB9XG5cbiAgICB9XG5cblxuICAgIC8vIGlmKGkgPCAxMDAgJiYgKGV2ZW50LnR5cGUgPT09IDgxIHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpKXtcbiAgICAvLyAgIC8vY29uc29sZS5sb2coaSwgdGlja3MsIGRpZmZUaWNrcywgbWlsbGlzLCBtaWxsaXNQZXJUaWNrKVxuICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQubWlsbGlzLCAnbm90ZScsIGV2ZW50LmRhdGExLCAndmVsbycsIGV2ZW50LmRhdGEyKVxuICAgIC8vIH1cblxuICAgIGxhc3RFdmVudFRpY2sgPSBldmVudC50aWNrcztcbiAgfVxuICBwYXJzZU1JRElOb3RlcyhyZXN1bHQpXG4gIHJldHVybiByZXN1bHRcbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGV2ZW50LCBmYXN0ID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKGJhciwgYmVhdCwgdGlja3MpXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuXG4gIGV2ZW50LnRpY2tzID0gdGlja3M7XG5cbiAgZXZlbnQubWlsbGlzID0gbWlsbGlzO1xuICBldmVudC5zZWNvbmRzID0gbWlsbGlzIC8gMTAwMDtcblxuICBpZihmYXN0KXtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGV2ZW50LmJhciA9IGJhcjtcbiAgZXZlbnQuYmVhdCA9IGJlYXQ7XG4gIGV2ZW50LnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgZXZlbnQudGljayA9IHRpY2s7XG4gIC8vZXZlbnQuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2s7XG4gIHZhciB0aWNrQXNTdHJpbmcgPSB0aWNrID09PSAwID8gJzAwMCcgOiB0aWNrIDwgMTAgPyAnMDAnICsgdGljayA6IHRpY2sgPCAxMDAgPyAnMCcgKyB0aWNrIDogdGljaztcbiAgZXZlbnQuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIHRpY2tBc1N0cmluZztcbiAgZXZlbnQuYmFyc0FzQXJyYXkgPSBbYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tdO1xuXG5cbiAgdmFyIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcblxuICBldmVudC5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgZXZlbnQubWludXRlID0gdGltZURhdGEubWludXRlO1xuICBldmVudC5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gIGV2ZW50Lm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gIGV2ZW50LnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgZXZlbnQudGltZUFzQXJyYXkgPSB0aW1lRGF0YS50aW1lQXNBcnJheTtcblxuICAvLyBpZihtaWxsaXMgPCAwKXtcbiAgLy8gICBjb25zb2xlLmxvZyhldmVudClcbiAgLy8gfVxuXG5cbn1cblxuXG5sZXQgbWlkaU5vdGVJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESU5vdGVzKGV2ZW50cyl7XG4gIGxldCBub3RlcyA9IHt9XG4gIGxldCBub3Rlc0luVHJhY2tcbiAgbGV0IG4gPSAwXG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgaWYodHlwZW9mIGV2ZW50Ll9wYXJ0ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZXZlbnQuX3RyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBjb25zb2xlLmxvZygnbm8gcGFydCBhbmQvb3IgdHJhY2sgc2V0JywgZXZlbnQpXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdID0ge31cbiAgICAgIH1cbiAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudFxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdXG4gICAgICBpZih0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIGNvcnJlc3BvbmRpbmcgbm90ZW9uIGV2ZW50IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbGV0IG5vdGVPbiA9IG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV1cbiAgICAgIGxldCBub3RlT2ZmID0gZXZlbnRcbiAgICAgIGlmKHR5cGVvZiBub3RlT24gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy9jb25zb2xlLmluZm8obisrLCAnbm8gbm90ZW9uIGV2ZW50IGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlID0gbmV3IE1JRElOb3RlKG5vdGVPbiwgbm90ZU9mZilcbiAgICAgIG5vdGUgPSBudWxsXG4gICAgICAvLyBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgICAgLy8gbm90ZU9uLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgLy8gbm90ZU9uLm9mZiA9IG5vdGVPZmYuaWRcbiAgICAgIC8vIG5vdGVPZmYubWlkaU5vdGVJZCA9IGlkXG4gICAgICAvLyBub3RlT2ZmLm9uID0gbm90ZU9uLmlkXG4gICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICB9XG4gIH1cbiAgT2JqZWN0LmtleXMobm90ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICBkZWxldGUgbm90ZXNba2V5XVxuICB9KVxuICBub3RlcyA9IHt9XG4gIC8vY29uc29sZS5sb2cobm90ZXMsIG5vdGVzSW5UcmFjaylcbn1cblxuXG4vLyBub3QgaW4gdXNlIVxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckV2ZW50cyhldmVudHMpe1xuICBsZXQgc3VzdGFpbiA9IHt9XG4gIGxldCB0bXBSZXN1bHQgPSB7fVxuICBsZXQgcmVzdWx0ID0gW11cbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICBpZih0eXBlb2Ygc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1lbHNlIGlmKHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09IGV2ZW50LnRpY2tzKXtcbiAgICAgICAgICBkZWxldGUgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50XG4gICAgICAgIGRlbGV0ZSBzdXN0YWluW2V2ZW50LnRyYWNrSWRdXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMTI3KXtcbiAgICAgICAgc3VzdGFpbltldmVudC50cmFja0lkXSA9IGV2ZW50LnRpY2tzXG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKHN1c3RhaW4pXG4gIE9iamVjdC5rZXlzKHRtcFJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGxldCBzdXN0YWluRXZlbnQgPSB0bXBSZXN1bHRba2V5XVxuICAgIGNvbnNvbGUubG9nKHN1c3RhaW5FdmVudClcbiAgICByZXN1bHQucHVzaChzdXN0YWluRXZlbnQpXG4gIH0pXG4gIHJldHVybiByZXN1bHRcbn1cbiIsIi8vIEAgZmxvd1xuXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcblxubGV0IHBhcnRJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFBhcnR7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gbnVsbCl7XG4gICAgdGhpcy5pZCA9IGBNUF8ke3BhcnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcbiAgICB0aGlzLm11dGVkID0gZmFsc2VcbiAgICB0aGlzLl90cmFjayA9IG51bGxcbiAgICB0aGlzLl9zb25nID0gbnVsbFxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB0aGlzLl9zdGFydCA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgIHRoaXMuX2VuZCA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICB9XG5cbiAgY29weSgpe1xuICAgIGxldCBwID0gbmV3IFBhcnQodGhpcy5uYW1lICsgJ19jb3B5JykgLy8gaW1wbGVtZW50IGdldE5hbWVPZkNvcHkoKSBpbiB1dGlsIChzZWUgaGVhcnRiZWF0KVxuICAgIGxldCBldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIGxldCBjb3B5ID0gZXZlbnQuY29weSgpXG4gICAgICBjb25zb2xlLmxvZyhjb3B5KVxuICAgICAgZXZlbnRzLnB1c2goY29weSlcbiAgICB9KVxuICAgIHAuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICBwLnVwZGF0ZSgpXG4gICAgcmV0dXJuIHBcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZSh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgICBsZXQgdHJhY2sgPSB0aGlzLl90cmFja1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuX3BhcnQgPSB0aGlzXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB0aGlzLl9ldmVudHMucHVzaChldmVudClcbiAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdHJhY2tcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmKHRyYWNrKXtcbiAgICAgIHRyYWNrLl9ldmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgfVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdHJhY2suX3NvbmdVcGRhdGUgPSB0cnVlXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgbGV0IHRyYWNrID0gdGhpcy5fdHJhY2tcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Ll9wYXJ0ID0gbnVsbFxuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgICAgdHJhY2suX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYodHJhY2spe1xuICAgICAgdHJhY2suX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgICAgdHJhY2suX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gICAgfVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHModGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHNUbyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuXG4gIGdldEV2ZW50cyhmaWx0ZXI6IHN0cmluZ1tdID0gbnVsbCl7IC8vIGNhbiBiZSB1c2UgYXMgZmluZEV2ZW50c1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ldmVudHNdIC8vQFRPRE8gaW1wbGVtZW50IGZpbHRlciAtPiBmaWx0ZXJFdmVudHMoKSBzaG91bGQgYmUgYSB1dGlsaXR5IGZ1bmN0aW9uIChub3QgYSBjbGFzcyBtZXRob2QpXG4gIH1cblxuICBtdXRlKGZsYWc6IGJvb2xlYW4gPSBudWxsKXtcbiAgICBpZihmbGFnKXtcbiAgICAgIHRoaXMubXV0ZWQgPSBmbGFnXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLm11dGVkID0gIXRoaXMubXV0ZWRcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKXtcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmKHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkpe1xuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgfVxuICAgIHNvcnRFdmVudHModGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICAvL0BUT0RPOiBjYWxjdWxhdGUgcGFydCBzdGFydCBhbmQgZW5kLCBhbmQgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVcbiAgfVxufVxuIiwiaW1wb3J0IHtnZXRQb3NpdGlvbjJ9IGZyb20gJy4vcG9zaXRpb24uanMnXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lci5qcydcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsLmpzJ1xuXG5jb25zdCByYW5nZSA9IDEwIC8vIG1pbGxpc2Vjb25kcyBvciB0aWNrc1xubGV0IGluc3RhbmNlSWQgPSAwXG5cbmV4cG9ydCBjbGFzcyBQbGF5aGVhZHtcblxuICBjb25zdHJ1Y3Rvcihzb25nLCB0eXBlID0gJ2FsbCcpe1xuICAgIHRoaXMuaWQgPSBgUE9TICR7aW5zdGFuY2VJZCsrfSAke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLnNvbmcgPSBzb25nXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMubGFzdEV2ZW50ID0gbnVsbFxuICAgIHRoaXMuZGF0YSA9IHt9XG5cbiAgICB0aGlzLmFjdGl2ZVBhcnRzID0gW11cbiAgICB0aGlzLmFjdGl2ZU5vdGVzID0gW11cbiAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IFtdXG4gIH1cblxuICAvLyB1bml0IGNhbiBiZSAnbWlsbGlzJyBvciAndGlja3MnXG4gIHNldCh1bml0LCB2YWx1ZSl7XG4gICAgdGhpcy51bml0ID0gdW5pdFxuICAgIHRoaXMuY3VycmVudFZhbHVlID0gdmFsdWVcbiAgICB0aGlzLmV2ZW50SW5kZXggPSAwXG4gICAgdGhpcy5ub3RlSW5kZXggPSAwXG4gICAgdGhpcy5wYXJ0SW5kZXggPSAwXG4gICAgdGhpcy5jYWxjdWxhdGUoKVxuICAgIHJldHVybiB0aGlzLmRhdGFcbiAgfVxuXG5cbiAgZ2V0KCl7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICB1cGRhdGUodW5pdCwgZGlmZil7XG4gICAgaWYoZGlmZiA9PT0gMCl7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhXG4gICAgfVxuICAgIHRoaXMudW5pdCA9IHVuaXRcbiAgICB0aGlzLmN1cnJlbnRWYWx1ZSArPSBkaWZmXG4gICAgdGhpcy5jYWxjdWxhdGUoKVxuICAgIHJldHVybiB0aGlzLmRhdGFcbiAgfVxuXG5cbiAgdXBkYXRlU29uZygpe1xuICAgIHRoaXMuZXZlbnRzID0gWy4uLnRoaXMuc29uZy5fZXZlbnRzLCAuLi50aGlzLnNvbmcuX3RpbWVFdmVudHNdXG4gICAgc29ydEV2ZW50cyh0aGlzLmV2ZW50cylcbiAgICAvL2NvbnNvbGUubG9nKCdldmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICB0aGlzLm5vdGVzID0gdGhpcy5zb25nLl9ub3Rlc1xuICAgIHRoaXMucGFydHMgPSB0aGlzLnNvbmcuX3BhcnRzXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLm51bU5vdGVzID0gdGhpcy5ub3Rlcy5sZW5ndGhcbiAgICB0aGlzLm51bVBhcnRzID0gdGhpcy5wYXJ0cy5sZW5ndGhcbiAgICB0aGlzLnNldCgnbWlsbGlzJywgdGhpcy5zb25nLl9taWxsaXMpXG4gIH1cblxuXG4gIGNhbGN1bGF0ZSgpe1xuICAgIGxldCBpXG4gICAgbGV0IHZhbHVlXG4gICAgbGV0IGV2ZW50XG4gICAgbGV0IG5vdGVcbiAgICBsZXQgcGFydFxuICAgIGxldCBwb3NpdGlvblxuICAgIGxldCBzdGlsbEFjdGl2ZU5vdGVzID0gW11cbiAgICBsZXQgc3RpbGxBY3RpdmVQYXJ0cyA9IFtdXG4gICAgbGV0IGNvbGxlY3RlZFBhcnRzID0gbmV3IFNldCgpXG4gICAgbGV0IGNvbGxlY3RlZE5vdGVzID0gbmV3IFNldCgpXG5cbiAgICB0aGlzLmRhdGEgPSB7fVxuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW11cblxuICAgIGZvcihpID0gdGhpcy5ldmVudEluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IHRoaXMuZXZlbnRzW2ldXG4gICAgICB2YWx1ZSA9IGV2ZW50W3RoaXMudW5pdF1cbiAgICAgIGlmKHZhbHVlIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgLy8gaWYgdGhlIHBsYXloZWFkIGlzIHNldCB0byBhIHBvc2l0aW9uIG9mIHNheSAzMDAwIG1pbGxpcywgd2UgZG9uJ3Qgd2FudCB0byBhZGQgZXZlbnRzIG1vcmUgdGhhdCAxMCB1bml0cyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgIGlmKHZhbHVlID09PSAwIHx8IHZhbHVlID4gdGhpcy5jdXJyZW50VmFsdWUgLSByYW5nZSl7XG4gICAgICAgICAgdGhpcy5hY3RpdmVFdmVudHMucHVzaChldmVudClcbiAgICAgICAgICAvLyB0aGlzIGRvZXNuJ3Qgd29yayB0b28gd2VsbFxuICAgICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMilcbiAgICAgICAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwyJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBldmVudC5kYXRhMiA9PT0gMTI3ID8gJ2Rvd24nIDogJ3VwJ1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIC8vIH1lbHNle1xuICAgICAgICAgIC8vICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgLy8gICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgLy8gICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgLy8gICB9KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIHRoaXMuZXZlbnRJbmRleCsrXG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgIHRoaXMuZGF0YS5hY3RpdmVFdmVudHMgPSB0aGlzLmFjdGl2ZUV2ZW50c1xuXG4gICAgLy8gaWYgYSBzb25nIGhhcyBubyBldmVudHMgeWV0LCB1c2UgdGhlIGZpcnN0IHRpbWUgZXZlbnQgYXMgcmVmZXJlbmNlXG4gICAgaWYodGhpcy5sYXN0RXZlbnQgPT09IG51bGwpe1xuICAgICAgdGhpcy5sYXN0RXZlbnQgPSB0aGlzLnNvbmcuX3RpbWVFdmVudHNbMF1cbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IGdldFBvc2l0aW9uMih0aGlzLnNvbmcsIHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUsICdhbGwnLCB0aGlzLmxhc3RFdmVudClcbiAgICB0aGlzLmRhdGEuZXZlbnRJbmRleCA9IHRoaXMuZXZlbnRJbmRleFxuICAgIHRoaXMuZGF0YS5taWxsaXMgPSBwb3NpdGlvbi5taWxsaXNcbiAgICB0aGlzLmRhdGEudGlja3MgPSBwb3NpdGlvbi50aWNrc1xuICAgIHRoaXMuZGF0YS5wb3NpdGlvbiA9IHBvc2l0aW9uXG5cbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKXtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhXG4gICAgICBmb3IobGV0IGtleSBvZiBPYmplY3Qua2V5cyhwb3NpdGlvbikpe1xuICAgICAgICBkYXRhW2tleV0gPSBwb3NpdGlvbltrZXldXG4gICAgICB9XG4gICAgfWVsc2UgaWYodGhpcy50eXBlLmluZGV4T2YoJ2JhcnNiZWF0cycpICE9PSAtMSl7XG4gICAgICB0aGlzLmRhdGEuYmFyID0gcG9zaXRpb24uYmFyXG4gICAgICB0aGlzLmRhdGEuYmVhdCA9IHBvc2l0aW9uLmJlYXRcbiAgICAgIHRoaXMuZGF0YS5zaXh0ZWVudGggPSBwb3NpdGlvbi5zaXh0ZWVudGhcbiAgICAgIHRoaXMuZGF0YS50aWNrID0gcG9zaXRpb24udGlja1xuICAgICAgdGhpcy5kYXRhLmJhcnNBc1N0cmluZyA9IHBvc2l0aW9uLmJhcnNBc1N0cmluZ1xuXG4gICAgICB0aGlzLmRhdGEudGlja3NQZXJCYXIgPSBwb3NpdGlvbi50aWNrc1BlckJhclxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmVhdCA9IHBvc2l0aW9uLnRpY2tzUGVyQmVhdFxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gcG9zaXRpb24udGlja3NQZXJTaXh0ZWVudGhcbiAgICAgIHRoaXMuZGF0YS5udW1TaXh0ZWVudGggPSBwb3NpdGlvbi5udW1TaXh0ZWVudGhcblxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCd0aW1lJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5ob3VyID0gcG9zaXRpb24uaG91clxuICAgICAgdGhpcy5kYXRhLm1pbnV0ZSA9IHBvc2l0aW9uLm1pbnV0ZVxuICAgICAgdGhpcy5kYXRhLnNlY29uZCA9IHBvc2l0aW9uLnNlY29uZFxuICAgICAgdGhpcy5kYXRhLm1pbGxpc2Vjb25kID0gcG9zaXRpb24ubWlsbGlzZWNvbmRcbiAgICAgIHRoaXMuZGF0YS50aW1lQXNTdHJpbmcgPSBwb3NpdGlvbi50aW1lQXNTdHJpbmdcblxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCdwZXJjZW50YWdlJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5wZXJjZW50YWdlID0gcG9zaXRpb24ucGVyY2VudGFnZVxuICAgIH1cblxuICAgIC8vIGdldCBhY3RpdmUgbm90ZXNcbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZignbm90ZXMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG5cbiAgICAgIC8vIGdldCBhbGwgbm90ZXMgYmV0d2VlbiB0aGUgbm90ZUluZGV4IGFuZCB0aGUgY3VycmVudCBwbGF5aGVhZCBwb3NpdGlvblxuICAgICAgZm9yKGkgPSB0aGlzLm5vdGVJbmRleDsgaSA8IHRoaXMubnVtTm90ZXM7IGkrKyl7XG4gICAgICAgIG5vdGUgPSB0aGlzLm5vdGVzW2ldXG4gICAgICAgIHZhbHVlID0gbm90ZS5ub3RlT25bdGhpcy51bml0XVxuICAgICAgICBpZih2YWx1ZSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgdGhpcy5ub3RlSW5kZXgrK1xuICAgICAgICAgIGlmKHR5cGVvZiBub3RlLm5vdGVPZmYgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBpZiB0aGUgcGxheWhlYWQgaXMgc2V0IHRvIGEgcG9zaXRpb24gb2Ygc2F5IDMwMDAgbWlsbGlzLCB3ZSBkb24ndCB3YW50IHRvIGFkZCBub3RlcyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgICAgaWYodGhpcy5jdXJyZW50VmFsdWUgPT09IDAgfHwgbm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgICBjb2xsZWN0ZWROb3Rlcy5hZGQobm90ZSlcbiAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgICB0eXBlOiAnbm90ZU9uJyxcbiAgICAgICAgICAgICAgZGF0YTogbm90ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGZpbHRlciBub3RlcyB0aGF0IGFyZSBubyBsb25nZXIgYWN0aXZlXG4gICAgICBmb3IoaSA9IHRoaXMuYWN0aXZlTm90ZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgICBub3RlID0gdGhpcy5hY3RpdmVOb3Rlc1tpXTtcbiAgICAgICAgLy9pZihub3RlLm5vdGVPbi5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9ub3Rlc0J5SWQuZ2V0KG5vdGUuaWQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHRoaXMuc29uZy5fbm90ZXNCeUlkLmdldChub3RlLmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgbm90ZScsIG5vdGUuaWQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnNvbGUud2Fybignbm90ZSB3aXRoIGlkJywgbm90ZS5pZCwgJ2hhcyBubyBub3RlT2ZmIGV2ZW50Jyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkTm90ZXMuaGFzKG5vdGUpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHN0aWxsQWN0aXZlTm90ZXMucHVzaChub3RlKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnbm90ZU9mZicsXG4gICAgICAgICAgICBkYXRhOiBub3RlXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBhZGQgdGhlIHN0aWxsIGFjdGl2ZSBub3RlcyBhbmQgdGhlIG5ld2x5IGFjdGl2ZSBldmVudHMgdG8gdGhlIGFjdGl2ZSBub3RlcyBhcnJheVxuICAgICAgdGhpcy5hY3RpdmVOb3RlcyA9IFsuLi5jb2xsZWN0ZWROb3Rlcy52YWx1ZXMoKSwgLi4uc3RpbGxBY3RpdmVOb3Rlc11cbiAgICAgIHRoaXMuZGF0YS5hY3RpdmVOb3RlcyA9IHRoaXMuYWN0aXZlTm90ZXNcbiAgICB9XG5cblxuICAgIC8vIGdldCBhY3RpdmUgcGFydHNcbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZigncGFydHMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG5cbiAgICAgIGZvcihpID0gdGhpcy5wYXJ0SW5kZXg7IGkgPCB0aGlzLm51bVBhcnRzOyBpKyspe1xuICAgICAgICBwYXJ0ID0gdGhpcy5wYXJ0c1tpXVxuICAgICAgICAvL2NvbnNvbGUubG9nKHBhcnQsIHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgICAgICBpZihwYXJ0Ll9zdGFydFt0aGlzLnVuaXRdIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICBjb2xsZWN0ZWRQYXJ0cy5hZGQocGFydClcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdwYXJ0T24nLFxuICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgIH0pXG4gICAgICAgICAgdGhpcy5wYXJ0SW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgICAgLy8gZmlsdGVyIHBhcnRzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgIGZvcihpID0gdGhpcy5hY3RpdmVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgICAgIHBhcnQgPSB0aGlzLmFjdGl2ZVBhcnRzW2ldO1xuICAgICAgICAvL2lmKHBhcnQuc3RhdGUuaW5kZXhPZigncmVtb3ZlZCcpID09PSAwIHx8IHRoaXMuc29uZy5fcGFydHNCeUlkLmdldChwYXJ0LmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICBpZih0aGlzLnNvbmcuX3BhcnRzQnlJZC5nZXQocGFydC5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdza2lwcGluZyByZW1vdmVkIHBhcnQnLCBwYXJ0LmlkKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYocGFydC5fZW5kW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSAmJiBjb2xsZWN0ZWRQYXJ0cy5oYXMocGFydCkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYocGFydC5fZW5kW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgc3RpbGxBY3RpdmVQYXJ0cy5wdXNoKG5vdGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdwYXJ0T2ZmJyxcbiAgICAgICAgICAgIGRhdGE6IHBhcnRcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWN0aXZlUGFydHMgPSBbLi4uY29sbGVjdGVkUGFydHMudmFsdWVzKCksIC4uLnN0aWxsQWN0aXZlUGFydHNdXG4gICAgICB0aGlzLmRhdGEuYWN0aXZlUGFydHMgPSB0aGlzLmFjdGl2ZVBhcnRzXG4gICAgfVxuXG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgfSlcblxuICB9XG5cbi8qXG4gIHNldFR5cGUodCl7XG4gICAgdGhpcy50eXBlID0gdDtcbiAgICB0aGlzLnNldCh0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG5cblxuICBhZGRUeXBlKHQpe1xuICAgIHRoaXMudHlwZSArPSAnICcgKyB0O1xuICAgIHRoaXMuc2V0KHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gIH1cblxuICByZW1vdmVUeXBlKHQpe1xuICAgIHZhciBhcnIgPSB0aGlzLnR5cGUuc3BsaXQoJyAnKTtcbiAgICB0aGlzLnR5cGUgPSAnJztcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbih0eXBlKXtcbiAgICAgIGlmKHR5cGUgIT09IHQpe1xuICAgICAgICB0aGlzLnR5cGUgKz0gdCArICcgJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnR5cGUudHJpbSgpO1xuICAgIHRoaXMuc2V0KHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG4qL1xuXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7Z2V0TmljZVRpbWV9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0XG4gIHN1cHBvcnRlZFR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlJyxcbiAgc3VwcG9ydGVkUmV0dXJuVHlwZXMgPSAnYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBhbGwnLFxuICBmbG9vciA9IE1hdGguZmxvb3IsXG4gIHJvdW5kID0gTWF0aC5yb3VuZDtcblxuXG5sZXRcbiAgLy9sb2NhbFxuICBicG0sXG4gIG5vbWluYXRvcixcbiAgZGVub21pbmF0b3IsXG5cbiAgdGlja3NQZXJCZWF0LFxuICB0aWNrc1BlckJhcixcbiAgdGlja3NQZXJTaXh0ZWVudGgsXG5cbiAgbWlsbGlzUGVyVGljayxcbiAgc2Vjb25kc1BlclRpY2ssXG4gIG51bVNpeHRlZW50aCxcblxuICB0aWNrcyxcbiAgbWlsbGlzLFxuICBkaWZmVGlja3MsXG4gIGRpZmZNaWxsaXMsXG5cbiAgYmFyLFxuICBiZWF0LFxuICBzaXh0ZWVudGgsXG4gIHRpY2ssXG5cbi8vICB0eXBlLFxuICBpbmRleCxcbiAgcmV0dXJuVHlwZSA9ICdhbGwnLFxuICBiZXlvbmRFbmRPZlNvbmcgPSB0cnVlO1xuXG5cbmZ1bmN0aW9uIGdldFRpbWVFdmVudChzb25nLCB1bml0LCB0YXJnZXQpe1xuICAvLyBmaW5kcyB0aGUgdGltZSBldmVudCB0aGF0IGNvbWVzIHRoZSBjbG9zZXN0IGJlZm9yZSB0aGUgdGFyZ2V0IHBvc2l0aW9uXG4gIGxldCB0aW1lRXZlbnRzID0gc29uZy5fdGltZUV2ZW50c1xuXG4gIGZvcihsZXQgaSA9IHRpbWVFdmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgIGxldCBldmVudCA9IHRpbWVFdmVudHNbaV07XG4gICAgLy9jb25zb2xlLmxvZyh1bml0LCB0YXJnZXQsIGV2ZW50KVxuICAgIGlmKGV2ZW50W3VuaXRdIDw9IHRhcmdldCl7XG4gICAgICBpbmRleCA9IGlcbiAgICAgIHJldHVybiBldmVudFxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNUb1RpY2tzKHNvbmcsIHRhcmdldE1pbGxpcywgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0TWlsbGlzKVxuICAvL3JldHVybiByb3VuZCh0aWNrcyk7XG4gIHJldHVybiB0aWNrc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrc1RvTWlsbGlzKHNvbmcsIHRhcmdldFRpY2tzLCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldFRpY2tzKVxuICByZXR1cm4gbWlsbGlzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGJhcnNUb01pbGxpcyhzb25nLCBwb3NpdGlvbiwgYmVvcyl7IC8vIGJlb3MgPSBiZXlvbmRFbmRPZlNvbmdcbiAgY2FsY3VsYXRlUG9zaXRpb24oc29uZywge1xuICAgIHR5cGU6ICdiYXJzYmVhdCcsXG4gICAgcG9zaXRpb24sXG4gICAgcmVzdWx0OiAnbWlsbGlzJyxcbiAgICBiZW9zLFxuICB9KVxuICByZXR1cm4gbWlsbGlzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGJhcnNUb1RpY2tzKHNvbmcsIHBvc2l0aW9uLCBiZW9zKXsgLy8gYmVvcyA9IGJleW9uZEVuZE9mU29uZ1xuICBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgcG9zaXRpb24sXG4gICAgcmVzdWx0OiAndGlja3MnLFxuICAgIGJlb3NcbiAgfSlcbiAgLy9yZXR1cm4gcm91bmQodGlja3MpO1xuICByZXR1cm4gdGlja3Ncbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdGlja3NUb0JhcnMoc29uZywgdGFyZ2V0LCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldClcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgcmV0dXJuVHlwZSA9ICdiYXJzYW5kYmVhdHMnXG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNUb0JhcnMoc29uZywgdGFyZ2V0LCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQpXG4gIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJ1xuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKClcbn1cblxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciBtaWxsaXMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0TWlsbGlzLCBldmVudCl7XG4gIGxldCBsYXN0RXZlbnQgPSBzb25nLl9sYXN0RXZlbnQ7XG5cbiAgaWYoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSl7XG4gICAgaWYodGFyZ2V0TWlsbGlzID4gbGFzdEV2ZW50Lm1pbGxpcyl7XG4gICAgICB0YXJnZXRNaWxsaXMgPSBsYXN0RXZlbnQubWlsbGlzO1xuICAgIH1cbiAgfVxuXG4gIGlmKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdtaWxsaXMnLCB0YXJnZXRNaWxsaXMpO1xuICB9XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG4gIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuXG4gIC8vIGlmIHRoZSBldmVudCBpcyBub3QgZXhhY3RseSBhdCB0YXJnZXQgbWlsbGlzLCBjYWxjdWxhdGUgdGhlIGRpZmZcbiAgaWYoZXZlbnQubWlsbGlzID09PSB0YXJnZXRNaWxsaXMpe1xuICAgIGRpZmZNaWxsaXMgPSAwO1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gIH1lbHNle1xuICAgIGRpZmZNaWxsaXMgPSB0YXJnZXRNaWxsaXMgLSBldmVudC5taWxsaXM7XG4gICAgZGlmZlRpY2tzID0gZGlmZk1pbGxpcyAvIG1pbGxpc1BlclRpY2s7XG4gIH1cblxuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuXG4gIHJldHVybiB0aWNrcztcbn1cblxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciB0aWNrcyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbVRpY2tzKHNvbmcsIHRhcmdldFRpY2tzLCBldmVudCl7XG4gIGxldCBsYXN0RXZlbnQgPSBzb25nLl9sYXN0RXZlbnQ7XG5cbiAgaWYoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSl7XG4gICAgaWYodGFyZ2V0VGlja3MgPiBsYXN0RXZlbnQudGlja3Mpe1xuICAgICAgdGFyZ2V0VGlja3MgPSBsYXN0RXZlbnQudGlja3M7XG4gICAgfVxuICB9XG5cbiAgaWYodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ3RpY2tzJywgdGFyZ2V0VGlja3MpO1xuICB9XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG4gIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuXG4gIC8vIGlmIHRoZSBldmVudCBpcyBub3QgZXhhY3RseSBhdCB0YXJnZXQgdGlja3MsIGNhbGN1bGF0ZSB0aGUgZGlmZlxuICBpZihldmVudC50aWNrcyA9PT0gdGFyZ2V0VGlja3Mpe1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gICAgZGlmZk1pbGxpcyA9IDA7XG4gIH1lbHNle1xuICAgIGRpZmZUaWNrcyA9IHRhcmdldFRpY2tzIC0gdGlja3M7XG4gICAgZGlmZk1pbGxpcyA9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG4gIH1cblxuICB0aWNrcyArPSBkaWZmVGlja3M7XG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuXG4gIHJldHVybiBtaWxsaXM7XG59XG5cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgYmFycyBhbmQgYmVhdHMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21CYXJzKHNvbmcsIHRhcmdldEJhciwgdGFyZ2V0QmVhdCwgdGFyZ2V0U2l4dGVlbnRoLCB0YXJnZXRUaWNrLCBldmVudCA9IG51bGwpe1xuICAvL2NvbnNvbGUudGltZSgnZnJvbUJhcnMnKTtcbiAgbGV0IGkgPSAwLFxuICAgIGRpZmZCYXJzLFxuICAgIGRpZmZCZWF0cyxcbiAgICBkaWZmU2l4dGVlbnRoLFxuICAgIGRpZmZUaWNrLFxuICAgIGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRCYXIgPiBsYXN0RXZlbnQuYmFyKXtcbiAgICAgIHRhcmdldEJhciA9IGxhc3RFdmVudC5iYXI7XG4gICAgfVxuICB9XG5cbiAgaWYoZXZlbnQgPT09IG51bGwpe1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdiYXInLCB0YXJnZXRCYXIpO1xuICB9XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG4gIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuXG4gIC8vY29ycmVjdCB3cm9uZyBwb3NpdGlvbiBkYXRhLCBmb3IgaW5zdGFuY2U6ICczLDMsMiw3ODgnIGJlY29tZXMgJzMsNCw0LDA2OCcgaW4gYSA0LzQgbWVhc3VyZSBhdCBQUFEgNDgwXG4gIHdoaWxlKHRhcmdldFRpY2sgPj0gdGlja3NQZXJTaXh0ZWVudGgpe1xuICAgIHRhcmdldFNpeHRlZW50aCsrO1xuICAgIHRhcmdldFRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gIH1cblxuICB3aGlsZSh0YXJnZXRTaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgIHRhcmdldEJlYXQrKztcbiAgICB0YXJnZXRTaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICB9XG5cbiAgd2hpbGUodGFyZ2V0QmVhdCA+IG5vbWluYXRvcil7XG4gICAgdGFyZ2V0QmFyKys7XG4gICAgdGFyZ2V0QmVhdCAtPSBub21pbmF0b3I7XG4gIH1cblxuICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnYmFyJywgdGFyZ2V0QmFyLCBpbmRleCk7XG4gIGZvcihpID0gaW5kZXg7IGkgPj0gMDsgaS0tKXtcbiAgICBldmVudCA9IHNvbmcuX3RpbWVFdmVudHNbaV07XG4gICAgaWYoZXZlbnQuYmFyIDw9IHRhcmdldEJhcil7XG4gICAgICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIGdldCB0aGUgZGlmZmVyZW5jZXNcbiAgZGlmZlRpY2sgPSB0YXJnZXRUaWNrIC0gdGljaztcbiAgZGlmZlNpeHRlZW50aCA9IHRhcmdldFNpeHRlZW50aCAtIHNpeHRlZW50aDtcbiAgZGlmZkJlYXRzID0gdGFyZ2V0QmVhdCAtIGJlYXQ7XG4gIGRpZmZCYXJzID0gdGFyZ2V0QmFyIC0gYmFyOyAvL2JhciBpcyBhbHdheXMgbGVzcyB0aGVuIG9yIGVxdWFsIHRvIHRhcmdldEJhciwgc28gZGlmZkJhcnMgaXMgYWx3YXlzID49IDBcblxuICAvL2NvbnNvbGUubG9nKCdkaWZmJyxkaWZmQmFycyxkaWZmQmVhdHMsZGlmZlNpeHRlZW50aCxkaWZmVGljayk7XG4gIC8vY29uc29sZS5sb2coJ21pbGxpcycsbWlsbGlzLHRpY2tzUGVyQmFyLHRpY2tzUGVyQmVhdCx0aWNrc1BlclNpeHRlZW50aCxtaWxsaXNQZXJUaWNrKTtcblxuICAvLyBjb252ZXJ0IGRpZmZlcmVuY2VzIHRvIG1pbGxpc2Vjb25kcyBhbmQgdGlja3NcbiAgZGlmZk1pbGxpcyA9IChkaWZmQmFycyAqIHRpY2tzUGVyQmFyKSAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gKGRpZmZCZWF0cyAqIHRpY2tzUGVyQmVhdCkgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IChkaWZmU2l4dGVlbnRoICogdGlja3NQZXJTaXh0ZWVudGgpICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSBkaWZmVGljayAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZUaWNrcyA9IGRpZmZNaWxsaXMgLyBtaWxsaXNQZXJUaWNrO1xuICAvL2NvbnNvbGUubG9nKGRpZmZCYXJzLCB0aWNrc1BlckJhciwgbWlsbGlzUGVyVGljaywgZGlmZk1pbGxpcywgZGlmZlRpY2tzKTtcblxuICAvLyBzZXQgYWxsIGN1cnJlbnQgcG9zaXRpb24gZGF0YVxuICBiYXIgPSB0YXJnZXRCYXI7XG4gIGJlYXQgPSB0YXJnZXRCZWF0O1xuICBzaXh0ZWVudGggPSB0YXJnZXRTaXh0ZWVudGg7XG4gIHRpY2sgPSB0YXJnZXRUaWNrO1xuICAvL2NvbnNvbGUubG9nKHRpY2ssIHRhcmdldFRpY2spXG5cbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG4gIC8vY29uc29sZS5sb2codGFyZ2V0QmFyLCB0YXJnZXRCZWF0LCB0YXJnZXRTaXh0ZWVudGgsIHRhcmdldFRpY2ssICcgLT4gJywgbWlsbGlzKTtcbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuXG4gIC8vY29uc29sZS50aW1lRW5kKCdmcm9tQmFycycpO1xufVxuXG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpe1xuICAvLyBzcHJlYWQgdGhlIGRpZmZlcmVuY2UgaW4gdGljayBvdmVyIGJhcnMsIGJlYXRzIGFuZCBzaXh0ZWVudGhcbiAgbGV0IHRtcCA9IHJvdW5kKGRpZmZUaWNrcyk7XG4gIHdoaWxlKHRtcCA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgc2l4dGVlbnRoKys7XG4gICAgdG1wIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICAgIHdoaWxlKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgYmVhdCsrO1xuICAgICAgd2hpbGUoYmVhdCA+IG5vbWluYXRvcil7XG4gICAgICAgIGJlYXQgLT0gbm9taW5hdG9yO1xuICAgICAgICBiYXIrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdGljayA9IHJvdW5kKHRtcCk7XG59XG5cblxuLy8gc3RvcmUgcHJvcGVydGllcyBvZiBldmVudCBpbiBsb2NhbCBzY29wZVxuZnVuY3Rpb24gZ2V0RGF0YUZyb21FdmVudChldmVudCl7XG5cbiAgYnBtID0gZXZlbnQuYnBtO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG4gIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIC8vY29uc29sZS5sb2coYnBtLCBldmVudC50eXBlKTtcbiAgLy9jb25zb2xlLmxvZygndGlja3MnLCB0aWNrcywgJ21pbGxpcycsIG1pbGxpcywgJ2JhcicsIGJhcik7XG59XG5cblxuZnVuY3Rpb24gZ2V0UG9zaXRpb25EYXRhKHNvbmcpe1xuICBsZXQgdGltZURhdGEsXG4gICAgcG9zaXRpb25EYXRhID0ge307XG5cbiAgc3dpdGNoKHJldHVyblR5cGUpe1xuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIC8vcG9zaXRpb25EYXRhLm1pbGxpcyA9IG1pbGxpcztcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXMgPSByb3VuZChtaWxsaXMgKiAxMDAwKSAvIDEwMDA7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUm91bmRlZCA9IHJvdW5kKG1pbGxpcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzID0gdGlja3M7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3MgPSByb3VuZCh0aWNrcyk7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrc1Vucm91bmRlZCA9IHRpY2tzO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyID0gYmFyO1xuICAgICAgcG9zaXRpb25EYXRhLmJlYXQgPSBiZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrID0gdGljaztcbiAgICAgIC8vcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIGdldFRpY2tBc1N0cmluZyh0aWNrKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICB0aW1lRGF0YSA9IGdldE5pY2VUaW1lKG1pbGxpcyk7XG4gICAgICBwb3NpdGlvbkRhdGEuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gICAgICBwb3NpdGlvbkRhdGEubWludXRlID0gdGltZURhdGEubWludXRlO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIC8vIG1pbGxpc1xuICAgICAgLy9wb3NpdGlvbkRhdGEubWlsbGlzID0gbWlsbGlzO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpcyA9IHJvdW5kKG1pbGxpcyAqIDEwMDApIC8gMTAwMDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNSb3VuZGVkID0gcm91bmQobWlsbGlzKTtcblxuICAgICAgLy8gdGlja3NcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzID0gdGlja3M7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3MgPSByb3VuZCh0aWNrcyk7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrc1Vucm91bmRlZCA9IHRpY2tzO1xuXG4gICAgICAvLyBiYXJzYmVhdHNcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXIgPSBiYXI7XG4gICAgICBwb3NpdGlvbkRhdGEuYmVhdCA9IGJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2sgPSB0aWNrO1xuICAgICAgLy9wb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2tBc1N0cmluZztcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgZ2V0VGlja0FzU3RyaW5nKHRpY2spO1xuXG4gICAgICAvLyB0aW1lXG4gICAgICB0aW1lRGF0YSA9IGdldE5pY2VUaW1lKG1pbGxpcyk7XG4gICAgICBwb3NpdGlvbkRhdGEuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gICAgICBwb3NpdGlvbkRhdGEubWludXRlID0gdGltZURhdGEubWludXRlO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcblxuICAgICAgLy8gZXh0cmEgZGF0YVxuICAgICAgcG9zaXRpb25EYXRhLmJwbSA9IHJvdW5kKGJwbSAqIHNvbmcucGxheWJhY2tTcGVlZCwgMyk7XG4gICAgICBwb3NpdGlvbkRhdGEubm9taW5hdG9yID0gbm9taW5hdG9yO1xuICAgICAgcG9zaXRpb25EYXRhLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyQmVhdCA9IHRpY2tzUGVyQmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gICAgICBwb3NpdGlvbkRhdGEubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgIC8vIHVzZSB0aWNrcyB0byBtYWtlIHRlbXBvIGNoYW5nZXMgdmlzaWJsZSBieSBhIGZhc3RlciBtb3ZpbmcgcGxheWhlYWRcbiAgICAgIHBvc2l0aW9uRGF0YS5wZXJjZW50YWdlID0gdGlja3MgLyBzb25nLl9kdXJhdGlvblRpY2tzO1xuICAgICAgLy9wb3NpdGlvbkRhdGEucGVyY2VudGFnZSA9IG1pbGxpcyAvIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbkRhdGFcbn1cblxuXG5mdW5jdGlvbiBnZXRUaWNrQXNTdHJpbmcodCl7XG4gIGlmKHQgPT09IDApe1xuICAgIHQgPSAnMDAwJ1xuICB9ZWxzZSBpZih0IDwgMTApe1xuICAgIHQgPSAnMDAnICsgdFxuICB9ZWxzZSBpZih0IDwgMTAwKXtcbiAgICB0ID0gJzAnICsgdFxuICB9XG4gIHJldHVybiB0XG59XG5cblxuLy8gdXNlZCBieSBwbGF5aGVhZFxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvc2l0aW9uMihzb25nLCB1bml0LCB0YXJnZXQsIHR5cGUsIGV2ZW50KXtcbiAgaWYodW5pdCA9PT0gJ21pbGxpcycpe1xuICAgIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0LCBldmVudCk7XG4gIH1lbHNlIGlmKHVuaXQgPT09ICd0aWNrcycpe1xuICAgIGZyb21UaWNrcyhzb25nLCB0YXJnZXQsIGV2ZW50KTtcbiAgfVxuICByZXR1cm5UeXBlID0gdHlwZVxuICBpZihyZXR1cm5UeXBlID09PSAnYWxsJyl7XG4gICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gIH1cbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcbn1cblxuXG4vLyBpbXByb3ZlZCB2ZXJzaW9uIG9mIGdldFBvc2l0aW9uXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb24oc29uZywgc2V0dGluZ3Mpe1xuICBsZXQge1xuICAgIHR5cGUsIC8vIGFueSBvZiBiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIHBlcmMgcGVyY2VudGFnZVxuICAgIHRhcmdldCwgLy8gaWYgdHlwZSBpcyBiYXJzYmVhdHMgb3IgdGltZSwgdGFyZ2V0IG11c3QgYmUgYW4gYXJyYXksIGVsc2UgaWYgbXVzdCBiZSBhIG51bWJlclxuICAgIHJlc3VsdDogcmVzdWx0ID0gJ2FsbCcsIC8vIGFueSBvZiBiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIGFsbFxuICAgIGJlb3M6IGJlb3MgPSB0cnVlLFxuICAgIHNuYXA6IHNuYXAgPSAtMVxuICB9ID0gc2V0dGluZ3NcblxuICBpZihzdXBwb3J0ZWRSZXR1cm5UeXBlcy5pbmRleE9mKHJlc3VsdCkgPT09IC0xKXtcbiAgICBjb25zb2xlLndhcm4oYHVuc3VwcG9ydGVkIHJldHVybiB0eXBlLCAnYWxsJyB1c2VkIGluc3RlYWQgb2YgJyR7cmVzdWx0fSdgKVxuICAgIHJlc3VsdCA9ICdhbGwnXG4gIH1cblxuICByZXR1cm5UeXBlID0gcmVzdWx0XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcblxuICBpZihzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpID09PSAtMSl7XG4gICAgY29uc29sZS5lcnJvcihgdW5zdXBwb3J0ZWQgdHlwZSAke3R5cGV9YClcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG5cbiAgc3dpdGNoKHR5cGUpe1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgbGV0IFt0YXJnZXRiYXIgPSAxLCB0YXJnZXRiZWF0ID0gMSwgdGFyZ2V0c2l4dGVlbnRoID0gMSwgdGFyZ2V0dGljayA9IDBdID0gdGFyZ2V0XG4gICAgICAvL2NvbnNvbGUubG9nKHRhcmdldGJhciwgdGFyZ2V0YmVhdCwgdGFyZ2V0c2l4dGVlbnRoLCB0YXJnZXR0aWNrKVxuICAgICAgZnJvbUJhcnMoc29uZywgdGFyZ2V0YmFyLCB0YXJnZXRiZWF0LCB0YXJnZXRzaXh0ZWVudGgsIHRhcmdldHRpY2spXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIC8vIGNhbGN1bGF0ZSBtaWxsaXMgb3V0IG9mIHRpbWUgYXJyYXk6IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcbiAgICAgIGxldCBbdGFyZ2V0aG91ciA9IDAsIHRhcmdldG1pbnV0ZSA9IDAsIHRhcmdldHNlY29uZCA9IDAsIHRhcmdldG1pbGxpc2Vjb25kID0gMF0gPSB0YXJnZXRcbiAgICAgIGxldCBtaWxsaXMgPSAwXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0aG91ciAqIDYwICogNjAgKiAxMDAwIC8vaG91cnNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRtaW51dGUgKiA2MCAqIDEwMDAgLy9taW51dGVzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0c2Vjb25kICogMTAwMCAvL3NlY29uZHNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRtaWxsaXNlY29uZCAvL21pbGxpc2Vjb25kc1xuXG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIG1pbGxpcylcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgLy9jb25zb2xlLmxvZyhzb25nLCB0YXJnZXQpXG4gICAgICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHRhcmdldCAqIHNvbmcuX2R1cmF0aW9uVGlja3MgLy8gdGFyZ2V0IG11c3QgYmUgaW4gdGlja3MhXG4gICAgICAvL2NvbnNvbGUubG9nKHRpY2tzLCBzb25nLl9kdXJhdGlvblRpY2tzKVxuICAgICAgaWYoc25hcCAhPT0gLTEpe1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzIC8gc25hcCkgKiBzbmFwO1xuICAgICAgICAvL2Zyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGlja3MpO1xuICAgICAgfVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRpY2tzKVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIGxldCB0bXAgPSBnZXRQb3NpdGlvbkRhdGEoc29uZylcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXBcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG4vKlxuXG4vL0BwYXJhbTogJ21pbGxpcycsIDEwMDAsIFt0cnVlXVxuLy9AcGFyYW06ICd0aWNrcycsIDEwMDAsIFt0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCAxLCBbJ2FsbCcsIHRydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDYwLCA0LCAzLCAxMjAsIFsnYWxsJywgdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgNjAsIDQsIDMsIDEyMCwgW3RydWUsICdhbGwnXVxuXG5mdW5jdGlvbiBjaGVja1Bvc2l0aW9uKHR5cGUsIGFyZ3MsIHJldHVyblR5cGUgPSAnYWxsJyl7XG4gIGJleW9uZEVuZE9mU29uZyA9IHRydWU7XG4gIGNvbnNvbGUubG9nKCctLS0tPiBjaGVja1Bvc2l0aW9uOicsIGFyZ3MsIHR5cGVTdHJpbmcoYXJncykpO1xuXG4gIGlmKHR5cGVTdHJpbmcoYXJncykgPT09ICdhcnJheScpe1xuICAgIGxldFxuICAgICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoLFxuICAgICAgcG9zaXRpb24sXG4gICAgICBpLCBhLCBwb3NpdGlvbkxlbmd0aDtcblxuICAgIHR5cGUgPSBhcmdzWzBdO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgW1snbWlsbGlzJywgMzAwMF1dXG4gICAgaWYodHlwZVN0cmluZyhhcmdzWzBdKSA9PT0gJ2FycmF5Jyl7XG4gICAgICAvL2NvbnNvbGUud2FybigndGhpcyBzaG91bGRuXFwndCBoYXBwZW4hJyk7XG4gICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgIHR5cGUgPSBhcmdzWzBdO1xuICAgICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoO1xuICAgIH1cblxuICAgIHBvc2l0aW9uID0gW3R5cGVdO1xuXG4gICAgY29uc29sZS5sb2coJ2NoZWNrIHBvc2l0aW9uJywgYXJncywgbnVtQXJncywgc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSk7XG5cbiAgICAvL2NvbnNvbGUubG9nKCdhcmcnLCAwLCAnLT4nLCB0eXBlKTtcblxuICAgIGlmKHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkgIT09IC0xKXtcbiAgICAgIGZvcihpID0gMTsgaSA8IG51bUFyZ3M7IGkrKyl7XG4gICAgICAgIGEgPSBhcmdzW2ldO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdhcmcnLCBpLCAnLT4nLCBhKTtcbiAgICAgICAgaWYoYSA9PT0gdHJ1ZSB8fCBhID09PSBmYWxzZSl7XG4gICAgICAgICAgYmV5b25kRW5kT2ZTb25nID0gYTtcbiAgICAgICAgfWVsc2UgaWYoaXNOYU4oYSkpe1xuICAgICAgICAgIGlmKHN1cHBvcnRlZFJldHVyblR5cGVzLmluZGV4T2YoYSkgIT09IC0xKXtcbiAgICAgICAgICAgIHJldHVyblR5cGUgPSBhO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIHBvc2l0aW9uLnB1c2goYSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vY2hlY2sgbnVtYmVyIG9mIGFyZ3VtZW50cyAtPiBlaXRoZXIgMSBudW1iZXIgb3IgNCBudW1iZXJzIGluIHBvc2l0aW9uLCBlLmcuIFsnYmFyc2JlYXRzJywgMV0gb3IgWydiYXJzYmVhdHMnLCAxLCAxLCAxLCAwXSxcbiAgICAgIC8vIG9yIFsncGVyYycsIDAuNTYsIG51bWJlck9mVGlja3NUb1NuYXBUb11cbiAgICAgIHBvc2l0aW9uTGVuZ3RoID0gcG9zaXRpb24ubGVuZ3RoO1xuICAgICAgaWYocG9zaXRpb25MZW5ndGggIT09IDIgJiYgcG9zaXRpb25MZW5ndGggIT09IDMgJiYgcG9zaXRpb25MZW5ndGggIT09IDUpe1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKHBvc2l0aW9uLCByZXR1cm5UeXBlLCBiZXlvbmRFbmRPZlNvbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQb3NpdGlvbihzb25nLCB0eXBlLCBhcmdzKXtcbiAgLy9jb25zb2xlLmxvZygnZ2V0UG9zaXRpb24nLCBhcmdzKTtcblxuICBpZih0eXBlb2YgYXJncyA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB7XG4gICAgICBtaWxsaXM6IDBcbiAgICB9XG4gIH1cblxuICBsZXQgcG9zaXRpb24gPSBjaGVja1Bvc2l0aW9uKHR5cGUsIGFyZ3MpLFxuICAgIG1pbGxpcywgdG1wLCBzbmFwO1xuXG5cbiAgaWYocG9zaXRpb24gPT09IGZhbHNlKXtcbiAgICBlcnJvcignd3JvbmcgcG9zaXRpb24gZGF0YScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN3aXRjaCh0eXBlKXtcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIGZyb21CYXJzKHNvbmcsIHBvc2l0aW9uWzFdLCBwb3NpdGlvblsyXSwgcG9zaXRpb25bM10sIHBvc2l0aW9uWzRdKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIC8vIGNhbGN1bGF0ZSBtaWxsaXMgb3V0IG9mIHRpbWUgYXJyYXk6IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcbiAgICAgIG1pbGxpcyA9IDA7XG4gICAgICB0bXAgPSBwb3NpdGlvblsxXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDYwICogNjAgKiAxMDAwOyAvL2hvdXJzXG4gICAgICB0bXAgPSBwb3NpdGlvblsyXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDYwICogMTAwMDsgLy9taW51dGVzXG4gICAgICB0bXAgPSBwb3NpdGlvblszXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDEwMDA7IC8vc2Vjb25kc1xuICAgICAgdG1wID0gcG9zaXRpb25bNF0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXA7IC8vbWlsbGlzZWNvbmRzXG5cbiAgICAgIGZyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHBvc2l0aW9uWzFdKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIGZyb21UaWNrcyhzb25nLCBwb3NpdGlvblsxXSk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICdwZXJjJzpcbiAgICBjYXNlICdwZXJjZW50YWdlJzpcbiAgICAgIHNuYXAgPSBwb3NpdGlvblsyXTtcblxuICAgICAgLy9taWxsaXMgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICAvL2Zyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzKTtcblxuICAgICAgdGlja3MgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25UaWNrcztcbiAgICAgIGlmKHNuYXAgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHRpY2tzID0gZmxvb3IodGlja3Mvc25hcCkgKiBzbmFwO1xuICAgICAgICAvL2Zyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGlja3MpO1xuICAgICAgfVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgdG1wID0gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZygnZGlmZicsIHBvc2l0aW9uWzFdIC0gdG1wLnBlcmNlbnRhZ2UpO1xuICAgICAgcmV0dXJuIHRtcDtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbiovXG5cbiIsImltcG9ydCB7XG4gIE1JRElFdmVudFxufSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmltcG9ydHtcbiAgTUlESU5vdGUsXG59IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnR7XG4gIFBhcnQsXG59IGZyb20gJy4vcGFydCdcblxuaW1wb3J0e1xuICBUcmFjayxcbn0gZnJvbSAnLi90cmFjaydcblxuaW1wb3J0IHtcbiAgU29uZyxcbn0gZnJvbSAnLi9zb25nJ1xuXG5pbXBvcnQge1xuICBJbnN0cnVtZW50LFxufSBmcm9tICcuL2luc3RydW1lbnQnXG5cbmltcG9ydCB7XG4gIHBhcnNlTUlESUZpbGVcbn0gZnJvbSAnLi9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgaW5pdCxcbn0gZnJvbSAnLi9pbml0J1xuXG5pbXBvcnQge1xuICBjb250ZXh0LFxuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZSxcbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5pbXBvcnQge1xuICBnZXRNSURJQWNjZXNzLFxuICBnZXRNSURJSW5wdXRzLFxuICBnZXRNSURJT3V0cHV0cyxcbiAgZ2V0TUlESUlucHV0SWRzLFxuICBnZXRNSURJT3V0cHV0SWRzLFxuICBnZXRNSURJSW5wdXRzQnlJZCxcbiAgZ2V0TUlESU91dHB1dHNCeUlkLFxufSBmcm9tICcuL2luaXRfbWlkaSdcblxuaW1wb3J0IHtcbiAgcGFyc2VTYW1wbGVzLFxufSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuXG5pbXBvcnQge1xuICBNSURJRXZlbnRUeXBlcyxcbn0gZnJvbSAnLi9jb25zdGFudHMnXG5cbmltcG9ydCB7XG4gIHNldEJ1ZmZlclRpbWUsXG4gIGdldEluc3RydW1lbnRzLFxuICBnZXRHTUluc3RydW1lbnRzLFxufSBmcm9tICcuL3NldHRpbmdzJ1xuXG5pbXBvcnQge1xuICBhZGRFdmVudExpc3RlbmVyLFxuICByZW1vdmVFdmVudExpc3RlbmVyLFxuICBkaXNwYXRjaEV2ZW50XG59IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcblxuXG5jb25zdCBnZXRBdWRpb0NvbnRleHQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gY29udGV4dFxufVxuXG5jb25zdCBxYW1iaSA9IHtcbiAgdmVyc2lvbjogJzEuMC4wLWJldGExNicsXG5cbiAgLy8gZnJvbSAuL2luaXRcbiAgaW5pdCxcblxuICAvLyBmcm9tIC4vc2V0dGluZ3NcbiAgc2V0QnVmZmVyVGltZSxcblxuICAvLyBmcm9tIC4vY29uc3RhbnRzXG4gIE1JRElFdmVudFR5cGVzLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vbWlkaWZpbGVcbiAgcGFyc2VNSURJRmlsZSxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgZ2V0SW5zdHJ1bWVudHMsXG4gIGdldEdNSW5zdHJ1bWVudHMsXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayl7XG4gICAgcmV0dXJuIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spXG4gIH0sXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZClcbiAgfSxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBNSURJRXZlbnQsXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBNSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBTb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBUcmFjayxcblxuICAvLyBmcm9tIC4vcGFydFxuICBQYXJ0LFxuXG4gIC8vIGZyb20gLi9pbnN0cnVtZW50XG4gIEluc3RydW1lbnQsXG5cbiAgbG9nKGlkKXtcbiAgICBzd2l0Y2goaWQpe1xuICAgICAgY2FzZSAnZnVuY3Rpb25zJzpcbiAgICAgICAgY29uc29sZS5sb2coYGZ1bmN0aW9uczpcbiAgICAgICAgICBnZXRBdWRpb0NvbnRleHRcbiAgICAgICAgICBnZXRNYXN0ZXJWb2x1bWVcbiAgICAgICAgICBzZXRNYXN0ZXJWb2x1bWVcbiAgICAgICAgICBnZXRNSURJQWNjZXNzXG4gICAgICAgICAgZ2V0TUlESUlucHV0c1xuICAgICAgICAgIGdldE1JRElPdXRwdXRzXG4gICAgICAgICAgZ2V0TUlESUlucHV0SWRzXG4gICAgICAgICAgZ2V0TUlESU91dHB1dElkc1xuICAgICAgICAgIGdldE1JRElJbnB1dHNCeUlkXG4gICAgICAgICAgZ2V0TUlESU91dHB1dHNCeUlkXG4gICAgICAgICAgcGFyc2VNSURJRmlsZVxuICAgICAgICAgIHNldEJ1ZmZlclRpbWVcbiAgICAgICAgICBnZXRJbnN0cnVtZW50c1xuICAgICAgICAgIGdldEdNSW5zdHJ1bWVudHNcbiAgICAgICAgYClcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBxYW1iaVxuXG5leHBvcnQge1xuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICBzZXRCdWZmZXJUaW1lLFxuICBnZXRJbnN0cnVtZW50cyxcbiAgZ2V0R01JbnN0cnVtZW50cyxcblxuICAvLyBmcm9tIC4vY29uc3RhbnRzXG4gIE1JRElFdmVudFR5cGVzLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vbWlkaWZpbGVcbiAgcGFyc2VNSURJRmlsZSxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIGZyb20gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBNSURJRXZlbnQsXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBNSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBTb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBUcmFjayxcblxuICAvLyBmcm9tIC4vcGFydFxuICBQYXJ0LFxuXG4gIC8vIGZyb20gLi9pbnN0cnVtZW50XG4gIEluc3RydW1lbnQsXG59XG4iLCJpbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpby5qcydcbmltcG9ydCB7Z2V0RXF1YWxQb3dlckN1cnZlfSBmcm9tICcuL3V0aWwuanMnXG5cblxuY2xhc3MgU2FtcGxle1xuXG4gIGNvbnN0cnVjdG9yKHNhbXBsZURhdGEsIGV2ZW50KXtcbiAgICB0aGlzLmV2ZW50ID0gZXZlbnRcbiAgICB0aGlzLnNhbXBsZURhdGEgPSBzYW1wbGVEYXRhXG5cbiAgICBpZih0aGlzLnNhbXBsZURhdGEgPT09IC0xIHx8IHR5cGVvZiB0aGlzLnNhbXBsZURhdGEuYnVmZmVyID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAvLyBjcmVhdGUgc2ltcGxlIHN5bnRoIHNhbXBsZVxuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5kYXRhMSwgZXZlbnQuZGF0YTIpXG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgdGhpcy5zb3VyY2UudHlwZSA9ICdzaW5lJztcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZnJlcXVlbmN5KVxuICAgICAgdGhpcy5zb3VyY2UuZnJlcXVlbmN5LnZhbHVlID0gZXZlbnQuZnJlcXVlbmN5XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlRGF0YSlcbiAgICAgIHRoaXMuc291cmNlLmJ1ZmZlciA9IHNhbXBsZURhdGEuYnVmZmVyO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvdXJjZS5idWZmZXIpXG4gICAgfVxuICAgIHRoaXMub3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLnZvbHVtZSA9IGV2ZW50LmRhdGEyIC8gMTI3XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5zb3VyY2UuY29ubmVjdCh0aGlzLm91dHB1dClcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgfVxuXG4gIHN0YXJ0KHRpbWUpe1xuICAgIGxldCB7c3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kLCByZWxlYXNlRW52ZWxvcGVBcnJheX0gPSB0aGlzLnNhbXBsZURhdGFcbiAgICAvL2NvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZClcbiAgICBpZihzdXN0YWluU3RhcnQgJiYgc3VzdGFpbkVuZCl7XG4gICAgICB0aGlzLnNvdXJjZS5sb29wID0gdHJ1ZVxuICAgICAgdGhpcy5zb3VyY2UubG9vcFN0YXJ0ID0gc3VzdGFpblN0YXJ0XG4gICAgICB0aGlzLnNvdXJjZS5sb29wRW5kID0gc3VzdGFpbkVuZFxuICAgIH1cbiAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgY2Ipe1xuICAgIGxldCB7cmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUsIHJlbGVhc2VFbnZlbG9wZUFycmF5fSA9IHRoaXMuc2FtcGxlRGF0YVxuXG4gICAgdGhpcy5zb3VyY2Uub25lbmRlZCA9IGNiXG5cbiAgICBpZihyZWxlYXNlRHVyYXRpb24gJiYgcmVsZWFzZUVudmVsb3BlKXtcbiAgICAgIHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UgPSB0aW1lXG4gICAgICB0aGlzLnJlbGVhc2VGdW5jdGlvbiA9ICgpID0+IHtcbiAgICAgICAgZmFkZU91dCh0aGlzLm91dHB1dCwge1xuICAgICAgICAgIHJlbGVhc2VEdXJhdGlvbixcbiAgICAgICAgICByZWxlYXNlRW52ZWxvcGUsXG4gICAgICAgICAgcmVsZWFzZUVudmVsb3BlQXJyYXksXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUgKyByZWxlYXNlRHVyYXRpb24pXG4gICAgICB0aGlzLmNoZWNrUGhhc2UoKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lKVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrUGhhc2UoKXtcbiAgICAvL2NvbnNvbGUubG9nKGNvbnRleHQuY3VycmVudFRpbWUsIHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UpXG4gICAgaWYoY29udGV4dC5jdXJyZW50VGltZSA+PSB0aGlzLnN0YXJ0UmVsZWFzZVBoYXNlKXtcbiAgICAgIHRoaXMucmVsZWFzZUZ1bmN0aW9uKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5jaGVja1BoYXNlLmJpbmQodGhpcykpXG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZmFkZU91dChnYWluTm9kZSwgc2V0dGluZ3Mpe1xuICBsZXQgbm93ID0gY29udGV4dC5jdXJyZW50VGltZVxuICBsZXQgdmFsdWVzLCBpLCBtYXhpXG5cbiAgLy9jb25zb2xlLmxvZyhzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpXG4gIHN3aXRjaChzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpe1xuXG4gICAgY2FzZSAnbGluZWFyJzpcbiAgICAgIGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSwgbm93KVxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBub3cgKyBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnZXF1YWwgcG93ZXInOlxuICAgIGNhc2UgJ2VxdWFsX3Bvd2VyJzpcbiAgICAgIHZhbHVlcyA9IGdldEVxdWFsUG93ZXJDdXJ2ZSgxMDAsICdmYWRlT3V0JywgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSlcbiAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVDdXJ2ZUF0VGltZSh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIG1heGkgPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheS5sZW5ndGhcbiAgICAgIHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkobWF4aSlcbiAgICAgIGZvcihpID0gMDsgaSA8IG1heGk7IGkrKyl7XG4gICAgICAgIHZhbHVlc1tpXSA9IHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZUFycmF5W2ldICogZ2Fpbk5vZGUuZ2Fpbi52YWx1ZVxuICAgICAgfVxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTYW1wbGUoLi4uYXJncyl7XG4gIHJldHVybiBuZXcgU2FtcGxlKC4uLmFyZ3MpXG59XG5cblxuIiwiY29uc3Qgc2FtcGxlcyA9IHtcbiAgZW1wdHlPZ2c6ICdUMmRuVXdBQ0FBQUFBQUFBQUFCZHhkNFhBQUFBQURhUzBqUUJIZ0YyYjNKaWFYTUFBQUFBQVVTc0FBQUFBQUFBZ0xzQUFBQUFBQUM0QVU5bloxTUFBQUFBQUFBQUFBQUFYY1hlRndFQUFBQWFYSytRRHozLy8vLy8vLy8vLy8vLy8vLy9NZ04yYjNKaWFYTXRBQUFBV0dsd2FDNVBjbWNnYkdsaVZtOXlZbWx6SUVrZ01qQXhNREV4TURFZ0tGTmphR0YxWm1WdWRXZG5aWFFwQUFBQUFBRUZkbTl5WW1sekgwSkRWZ0VBQUFFQUdHTlVLVWFaVXRKS2lSbHpsREZHbVdLU1NvbWxoQlpDU0oxekZGT3BPZGVjYTZ5NXRTQ0VFQnBUVUNrRm1WS09VbWtaWTVBcEJabFNFRXRKSlhRU09pZWRZeEJiU2NIV21HdUxRYlljaEEyYVVrd3B4SlJTaWtJSUdWT01LY1dVVWtwQ0J5VjBEanJtSEZPT1NpaEJ1Snh6cTdXV2xtT0xxWFNTU3Vja1pFeENTQ21Ga2tvSHBWTk9Ra2cxbHRaU0tSMXpVbEpxUWVnZ2hCQkN0aUNFRFlMUWtGVUFBQUVBd0VBUUdySUtBRkFBQUJDS29SaUtBb1NHckFJQU1nQUFCS0FvanVJb2ppTTVrbU5KRmhBYXNnb0FBQUlBRUFBQXdIQVVTWkVVeWJFa1M5SXNTOU5FVVZWOTFUWlZWZloxWGRkMVhkZDFJRFJrRlFBQUFRQkFTS2VacFJvZ3dneGtHQWdOV1FVQUlBQUFBRVlvd2hBRFFrTldBUUFBQVFBQVlpZzVpQ2EwNW54empvTm1PV2dxeGVaMGNDTFY1a2x1S3VibW5IUE9PU2ViYzhZNDU1eHppbkptTVdnbXRPYWNjeEtEWmlsb0pyVG1uSE9leE9aQmE2cTA1cHh6eGptbmczRkdHT2VjYzVxMDVrRnFOdGJtbkhNV3RLWTVhaTdGNXB4ekl1WG1TVzB1MWVhY2M4NDU1NXh6empubm5IT3FGNmR6Y0U0NDU1eHpvdmJtV201Q0YrZWNjejRacDN0elFqam5uSFBPT2VlY2M4NDU1NXh6Z3RDUVZRQUFFQUFBUVJnMmhuR25JRWlmbzRFWVJZaHB5S1FIM2FQREpHZ01jZ3FwUjZPamtWTHFJSlJVeGtrcG5TQTBaQlVBQUFnQUFDR0VGRkpJSVlVVVVrZ2hoUlJTaUNHR0dHTElLYWVjZ2dvcXFhU2lpakxLTExQTU1zc3NzOHd5NjdDenpqcnNNTVFRUXd5dHRCSkxUYlhWV0dPdHVlZWNhdzdTV21tdHRkWktLYVdVVWtvcENBMVpCUUNBQUFBUUNCbGtrRUZHSVlVVVVvZ2hwcHh5eWltb29BSkNRMVlCQUlBQUFBSUFBQUE4eVhORVIzUkVSM1JFUjNSRVIzUkV4M004UjVSRVNaUkVTYlJNeTlSTVR4VlYxWlZkVzlabDNmWnRZUmQyM2ZkMTMvZDE0OWVGWVZtV1pWbVdaVm1XWlZtV1pWbVdaVm1DMEpCVkFBQUlBQUNBRUVJSUlZVVVVa2docFJoanpESG5vSk5RUWlBMFpCVUFBQWdBSUFBQUFNQlJITVZ4SkVkeUpNbVNMRW1UTkV1elBNM1RQRTMwUkZFVVRkTlVSVmQwUmQyMFJkbVVUZGQwVGRsMFZWbTFYVm0yYmRuV2JWK1diZC8zZmQvM2ZkLzNmZC8zZmQvM2RSMElEVmtGQUVnQUFPaElqcVJJaXFSSWp1TTRraVFCb1NHckFBQVpBQUFCQUNpS296aU80MGlTSkVtV3BFbWU1Vm1pWm1xbVozcXFxQUtoSWFzQUFFQUFBQUVBQUFBQUFDaWE0aW1tNGltaTRqbWlJMHFpWlZxaXBtcXVLSnV5NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N291RUJxeUNnQ1FBQURRa1J6SmtSeEprUlJKa1J6SkFVSkRWZ0VBTWdBQUFnQndETWVRRk1teExFdlRQTTNUUEUzMFJFLzBURThWWGRFRlFrTldBUUNBQUFBQ0FBQUFBQUF3Sk1OU0xFZHpORW1VVkV1MVZFMjFWRXNWVlU5VlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlUxVGRNMFRTQTBaQ1VBQUFRQXdHS053ZVVnSVNVbDVkNFF3aENUbmpFbUliVmVJUVNSa3Q0eEJoV0RuaktpREhMZVF1TVFneDRJRFZrUkFFUUJBQURHSU1jUWM4ZzVSNm1URWpubnFIU1VHdWNjcFk1U1p5bkZtR0xOS0pYWVVxeU5jNDVTUjYyamxHSXNMWGFVVW8ycHhnSUFBQUljQUFBQ0xJUkNRMVlFQUZFQUFJUXhTQ21rRkdLTU9hZWNRNHdwNTVoemhqSG1ISE9PT2VlZ2RGSXE1NXgwVGtyRUdIT09PYWVjYzFJNko1VnpUa29ub1FBQWdBQUhBSUFBQzZIUWtCVUJRSndBZ0VHU1BFL3lORkdVTkU4VVJWTjBYVkUwWGRmeVBOWDBURk5WUGRGVVZWTlZiZGxVVlZtV1BNODBQZE5VVmM4MFZkVlVWVmsyVlZXV1JWWFZiZE4xZGR0MFZkMldiZHYzWFZzV2RsRlZiZDFVWGRzM1ZkZjJYZG4yZlZuV2RXUHlQRlgxVE5OMVBkTjBaZFYxYlZ0MVhWMzNURk9XVGRlVlpkTjFiZHVWWlYxM1pkbjNOZE4wWGROVlpkbDBYZGwyWlZlM1hWbjJmZE4xaGQrVlpWOVhaVmtZZGwzM2hWdlhsZVYwWGQxWFpWYzNWbG4yZlZ2WGhlSFdkV0daUEU5VlBkTjBYYzgwWFZkMVhWOVhYZGZXTmRPVVpkTjFiZGxVWFZsMlpkbjNYVmZXZGM4MFpkbDBYZHMyWFZlV1hWbjJmVmVXZGQxMFhWOVhaVm40VlZmMmRWblhsZUhXYmVFM1hkZjNWVm4yaFZlV2RlSFdkV0c1ZFYwWVBsWDFmVk4yaGVGMFpkL1hoZDlaYmwwNGx0RjFmV0dWYmVGWVpWazVmdUZZbHQzM2xXVjBYVjlZYmRrWVZsa1dobC80bmVYMmZlTjRkVjBaYnQzbnpMcnZETWZ2cFB2SzA5VnRZNWw5M1ZsbVgzZU80Umc2di9EanFhcXZtNjRyREtjc0M3L3Q2OGF6Kzc2eWpLN3IrNm9zQzc4cTI4S3g2Nzd6L0w2d0xLUHMrc0pxeThLdzJyWXgzTDV1TEw5d0hNdHI2OG94Njc1UnRuVjhYM2dLdy9OMGRWMTVabDNIOW5WMDQwYzRmc29BQUlBQkJ3Q0FBQlBLUUtFaEt3S0FPQUVBanlTSm9tUlpvaWhabGlpS3B1aTZvbWk2cnFScHBxbHBubWxhbW1lYXBtbXFzaW1hcml4cG1tbGFubWFhbXFlWnBtaWFybXVhcHF5S3BpbkxwbXJLc21tYXN1eTZzbTI3cm16Ym9tbktzbW1hc215YXBpeTdzcXZicnV6cXVxUlpwcWw1bm1scW5tZWFwbXJLc21tYXJxdDVubXA2bm1pcW5paXFxbXFxcXEycXFpeGJubWVhbXVpcHBpZUtxbXFxcHEyYXFpckxwcXJhc21tcXRteXFxbTI3cXV6NnNtM3J1bW1xc20ycXBpMmJxbXJicnV6cXNpemJ1aTlwbW1scW5tZWFtdWVacG1tYXNteWFxaXRibnFlYW5paXFxdWFKcG1xcXFpeWJwcXJLbHVlWnFpZUtxdXFKbm11YXFpckxwbXJhcW1tYXRteXFxaTJicGlyTHJtMzd2dXZLc202cXFteWJxbXJycG1yS3Ntekx2dS9LcXU2S3BpbkxwcXJhc21tcXNpM2JzdS9Mc3F6N29tbktzbW1xc20ycXFpN0xzbTBiczJ6N3VtaWFzbTJxcGkyYnFpcmJzaTM3dWl6YnV1L0tybStycXF6cnNpMzd1dTc2cm5EcnVqQzhzbXo3cXF6NnVpdmJ1bS9yTXR2MmZVVFRsR1ZUTlczYlZGVlpkbVhaOW1YYjluM1JORzFiVlZWYk5rM1Z0bVZaOW4xWnRtMWhORTNaTmxWVjFrM1Z0RzFabG0xaHRtWGhkbVhadDJWYjluWFhsWFZmMTMzajEyWGQ1cnF5N2N1eXJmdXFxL3EyN3Z2Q2NPdXU4QW9BQUJod0FBQUlNS0VNRkJxeUVnQ0lBZ0FBakdHTU1RaU5VczQ1QjZGUnlqbm5JR1RPUVFnaGxjdzVDQ0dVa2prSG9aU1VNdWNnbEpKU0NLR1VsRm9MSVpTVVVtc0ZBQUFVT0FBQUJOaWdLYkU0UUtFaEt3R0FWQUFBZytOWWx1ZVpvbXJhc21OSm5pZUtxcW1xdHUxSWx1ZUpvbW1xcW0xYm5pZUtwcW1xcnV2cm11ZUpvbW1xcXV2cXVtaWFwcW1xcnV1NnVpNmFvcW1xcXV1NnNxNmJwcXFxcml1N3N1enJwcXFxcXV2S3Jpejd3cXE2cml2THNtM3J3ckNxcnV2S3NtemJ0bS9jdXE3cnZ1Lzd3cEd0NjdvdS9NSXhERWNCQU9BSkRnQkFCVGFzam5CU05CWllhTWhLQUNBREFJQXdCaUdERUVJR0lZU1FVa29ocFpRU0FBQXc0QUFBRUdCQ0dTZzBaRVVBRUNjQUFCaERLYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpJS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLcWFTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS1pWU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVZ29Ba0lwd0FKQjZNS0VNRkJxeUVnQklCUUFBakZGS0tjYWNneEF4NWhoajBFa29LV0xNT2NZY2xKSlM1UnlFRUZKcExiZktPUWdocE5SU2JabHpVbHFMTWVZWU0rZWtwQlJielRtSFVsS0xzZWFhYSs2a3RGWnJyalhuV2xxck5kZWNjODI1dEJacnJqblhuSFBMTWRlY2M4NDU1eGh6empubm5IUE9CUURnTkRnQWdCN1lzRHJDU2RGWVlLRWhLd0dBVkFBQUFobWxHSFBPT2VnUVVvdzU1eHlFRUNLRkdIUE9PUWdoVkl3NTV4eDBFRUtvR0hQTU9RZ2hoSkE1NXh5RUVFSUlJWE1PT3VnZ2hCQkNCeDJFRUVJSW9aVE9RUWdoaEJCS0tDR0VFRUlJSVlRUU9nZ2hoQkJDQ0NHRUVFSUlJWVJTU2dnaGhCQkNDYUdVVUFBQVlJRURBRUNBRGFzam5CU05CUllhc2hJQUFBSUFnQnlXb0ZMT2hFR09RWThOUWNwUk13MUNURG5SbVdKT2FqTVZVNUE1RUoxMEVobHFRZGxlTWdzQUFJQWdBQ0RBQkJBWUlDajRRZ2lJTVFBQVFZak1FQW1GVmJEQW9Bd2FIT1lCd0FORWhFUUFrSmlnU0x1NGdDNERYTkRGWFFkQ0NFSVFnbGdjUUFFSk9EamhoaWZlOElRYm5LQlRWT29nQUFBQUFBQU1BT0FCQU9DZ0FDSWltcXV3dU1ESTBOamc2UEFJQUFBQUFBQVdBUGdBQURnK2dJaUk1aW9zTGpBeU5EWTRPandDQUFBQUFBQUFBQUNBZ0lBQUFBQUFBRUFBQUFDQWdFOW5aMU1BQkFFQUFBQUFBQUFBWGNYZUZ3SUFBQUJxMm5weEFnRUJBQW89JyxcbiAgZW1wdHlNcDM6ICcvL3NReEFBRHdBQUJwQUFBQUNBQUFEU0FBQUFFVEVGTlJUTXVPVGt1TlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVPScsXG4gIGhpZ2h0aWNrOiAnVWtsR1JrUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlTQUZBQUN4L3hmL2RBRE9BQ3dCc1AzcCs2SCt6QUdvQk9rQ0N3QlgvRUg1T3Z4bEE0a0oyd2NTQXJUOUUvdXQrSFQyZXZVeDk4bjZPQUY1Q0NVTXdRdmZDT3NKeEF4MERTSU1FQXE5QmlBQjN2aHo3bUxrVDlzUjEzM1l4TjJzNVFMdjB2clVCbndSbnh1UUplRXNTRENpTWQ4eUZTOGFLRklob2hVc0NLajY0dTYyNU9yYUE5SHV5UG5FbGNQK3d4dkpXdFcyNTYzN1ZRMGpIUGduQlRERE0xbzBDektMSys4aHpoZ0ZET3o4U2U0SjQ3RFlWdEcwejVmUXE5TEIxMnJmQStqOTlyb0hBaGVsSXlNd0lqZFRPdVU4bWp3SU9Hb3hoQ2I1RTUzL2orM2szL2ZUWThwVHc0eS9UcitldzhETXZkc2s4UmNIUlJrU0tPNHlHVGtIUGtVL3J6enlOY2dzclI5NERwLzVyK1pzMTd6T25jb0R4aGZFMzhXTHluL1RlT01pOXIwSVJ4bFJLSVF6eVRsT1BLbzl5am1XTWNva0RSTGMvWTdydWR0ZHp1L0QyTDFJdSsyN0pjRzN5WXJWTHVqbCszVU9aeDFVSzVRMHF6bU5QRGs4WmplZU1Qb2p6aEgrL2pMdFBkNW0waEhMSHNZSXc1VEVNTW5BMGp2ajhmU09CaXdYQVNaZ016TThkVUJHUWJJK3J6anBLa0laeWdaVDlRZmxjZGFSeXFYQ3o3K1Z3VVBINzg0cjNLN3MrdjBLRHU4YnZ5ZUxNYjQzTmpyaE9JbzBkU3ZRSGkwUG5QNmk3b3ZnM05UeHk0L0dmOFg4eUgvUUJ0dlg1NVAyWWdiMEZjVWpzeTRMTm1JNWVqaVhNMzhyN2lDOEZKd0hQdm9rN2REZ1FkYUp6bFRLSXNvRnpzclZrdUE4N2QvNnFBaTdGUTBoOUNsS01MRXozVE9yTUJjcVlTRDhFOUFGZC9kUzZrVGY2ZGJVMFhuUXY5SUgyTVhmWitsbjlERUFGd3dkRnk4Z2lpYjZLYXdxZUNoZ0kvVWJIQk9UQ1pqL3Z2WGU3SW5sRnVETjNQM2IwZDFGNGd6cGlmRzIrdTREN1F3MUZmd2JuQ0QrSWxnald5SExIUE1Wb2cybUJMMzdxdlArN052bll1VHY0cnZqZnViTjZrM3dwUFowL1drRU93dGlFVXNXY3htK0dsNGFPaGhpRkRBUEl3bWJBdG43VFBWeTc3enFjZWZyNVlIbUh1bGw3ZW55ZlBtY0FIZ0hldzFSRXI4VmhoZC9GK0FWMVJKMERpa0pXUU5jL1pQM2VmS2Q3aHZzMnVyNDZySHM1dThlOU4vNDgvMGhBLzhIRmd3dUQwNFJTQklSRXFzUU9nN21Dc3NHTUFKVy9YbjRHL1RLOExidXp1MEk3cVR2blBKeTlzWDZiUDg0QkxZSWJBd2REODRRWXhHN0VPY09EQXh3Q0ZNRUFRQzkrN1AzU3ZUWDhYSHcrdTlSOEtUeEl2U285K1g3VlFDVUJKMElNd3ppRGo0UUxoQUdEOVVNcmduVEJaY0JSdjF2K1h2MlVmUys4dGZ4K3ZFUzg3ejArdmIzK1pmOVpnRVFCU0VJVUFyV0M4a00yUXl6QzVFSkVBZHZCSGdCWFA1bisrcjRBdmQ4OVdqMDdmTXc5RDMxSnZmcCtVajl4UUQ5QThRRzVRaFhDbEVMckFzdkM5d0o3Z2Q2QldJQzN2Nk8rN1Q0UFBaTjlFSHpXdk5mOVB6MUZ2aXQrcUw5clFDSEF3RUcvd2VDQ1pVS0Z3dkRDbklKY0FjUUJXY0NhZjhaL0NENTV2YUI5ZEQwd1BTUDlVTDNtL2s3L016K0p3RXlBdzhGekFZN0NCc0phUWs1Q1drSTJnYXRCQ0lDWWYrai9GcjZ2ZmlWOTg3MnNmWlA5MXo0cC9sUiszSDl6Zjg5QXJvRUZBZmpDUDBKY3dvOENqQUpkUWRnQlNFRGtnRFEvVmo3WmZuUjk1VDI4ZlVkOXYzMlZ2ZzIrbmI4Ky82eEFXb0U0QWJEQ1A0SnBBcWJDcVFKMHdlRUJmZ0NUQUNUL1IzN00vbSs5NjcySVBZNjlnYjNhZmhXK3RUOHFmK01BajBGZ2djdUNTY0tYQXJpQ2NNSUVBZnlCSllDRndDUC9SejdBL2w3OTN6MkYvWm45bUgzN2ZqZCtpMzl5ZjlwQXQwRUZBZlJDTmtKR0FxckNaWUl2Z1pQQko4QjZQNC8vTTM1MHZkejlxLzFsZlVxOW16M1JQbWkrM0grYmdGVkJPUUczd2dIQ2t3SzBBbTdDQ0FIQ2dXbUFqQUEnLFxuICBsb3d0aWNrOiAnVWtsR1JsUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlUQUZBQUIwLzV2K1UvNFQvM2dBMHdGVEF1VUIrZjhkL25UOTBmMXEvdWIrdGY0Ni9tYi84d0ZRQTlnQzd3Q2QvbXIrRkFHUkEzY0U2d0pmL2gzNmV2bXYrOHYvTndSSEJaVUMyLzYwKy8vNUV2dVovYVgvYmdGT0FwOEF6dnpoOXdmekxQRjY4elQ0eS8yQkF5Z0lmUXdhRWpZWTB4MzFJcndsOFNPV0hWRVNPZ1BoOU5mcFJlRnQyMm5ZSGRkRDJCWGNaZURhNUlucWdQRHg5blArNmdTNENCWUxudzB6RVMwV1h4djRIa2NnTGgvMUcrRVgxUk5wRDR3S2lnWEgvNnI1L2ZOdTdsVHBqK1p1NWhIb1hPdEw3MWJ5ci9RcDkxTDY0djZPQk80Sm9RNXpFc2tVK2hVMUZpUVZlUlA3RVdnUDRRcjBCSVQrdFBpZDlDM3kxdkNoOEZEeEp2SzI4dnZ5eS9MQThwTHpVL1hQOTV2Nnh2dzQvdUQvUkFLMkJTa0tjZzZCRVNjVFpCTWVFcWtQVFF4akNLRUVWd0ZpL252N2gvaHA5YUR5QXZIUDhNZnhMdk0rOVBYMHVQVzE5Zy80TGZyNy9DNEFLZ05hQlhRR3l3YjBCaElIV1FmV0Ixb0l6QWp0Q0Y4SUh3ZHRCYWtEVndLTEFlWUE4djl3L2tqODEvblE5NHYyOS9YWDliejFiUFVZOVV6MVovYUgrSHI3eVA0TUFpNEYrd2NmQ25ZTE5neWZEUHNNU3cwc0RVQU1mZ3JjQjVJRU13RmIvaVg4VC9wVCtPLzFYL01mOGNidnJPKzE4TUx5dmZWUCtSZjl3Z0FvQkNFSHB3bklDNUVONFE1QUQzd08xQXkwQ3BzSXZ3YnZCTmNDYlFBci9uWDhPZnNmK3ZiNG12ZGE5cmoxei9XWDlwTDNhL2hIK1pYNlIvd24vdlAvZVFFU0EvQUUrd1lEQ2N3S0ZBeVBEQ2tNRlF1U0NlNEhWUWJTQkhRREN3SThBTkw5SlB1WStIWDI4dlRxODJQemRQTVY5QXoxTWZaNDl6RDVnZnR4L3NRQkJRWExCOGNKL2dxcEN3OE1pZ3dXRFhFTlhRMnJERFVMN1FnREJzd0NkdjhTL0s3NFdQVms4aFh3b3U0UDdtdnUxKzlUOHB6MVV2bGkvWm9Cd2dXUkNjc01QZy9DRUVRUjRSREFEd29POXd1c0NWTUg0QVJTQXBuL3VmemQrV2ozYnZYNzh4enp4L0w2OHF6ejF2U0Q5cVg0R2Z2ZC9jMEFod08vQld3SG1naHZDUUVLVlFvbkNsc0pDd2lJQmgwRjBnT2dBbTBCT3dBeC8wMytYUDBnL0xiNmNQbVgrRi80dmZoKytUSDZzL29zKzcvN2N2d0wvWno5WFA1Ty8zSUEzQUY5QXpzRjlnYVVDQUFLSGd1ZUN6Y0w5d250QjNzRjR3SXpBSTM5NmZwMStHdjJJdlduOU4zMHAvWGk5bTc0Ry9ydSs5UDlrLzhhQVlFQzFBTVRCU0lHMHdZdUIxZ0hrZ2NBQ0dFSVNBaFRCekVGV0FLdC81TDkyZnVVK3ZYNTBmbWYrU1A1aS9nYitCZjRtdml2K1NyN2t2eWIvVWorci80WC84ci8rZ0NpQW8wRVVBYVJCendJU3dqcUIzSUhHUWZDQnY4RnBnVE1BcFFBS2Y2Nys1bjUvdmZuOWp6MnlQVm45U0wxUlBYcTlTUDNEdm1yKzZmK3NRR0tCQWNIK3doT0NoMExhd3MzQzI4S0xBbURCNUFGZlFOb0FWUC9adjNlKzdQNnNmbkwrQ3Y0dlBlTTk1YjM3ZmVWK0puNTFQb3EvTEw5bXYrWUFWWUQzZ1F1Qm1jSFNBaWtDSUVJN0FmK0J1RUZuZ1FYQTFzQnYvOXYvcGY5TVAzVy9GajhxL3NSKzZINlUvbzMrbVA2eS9wTisvZjd4dnllL1dIK0pmOW1BRDRDUUFRSkJpc0h0Z2Y2QncwSThRZHNCMXNHeXdUNEFnZ0JDUC9vL0tYNm1QZzE5NTcyamZhejl1ZjJTL2NNK0UzNUUvdFcvYWYvNXdIMUE4QUZLZ2ZrQi9BSGd3ZnhCbEFHZ1FWSUJNTUNKd0dzLzQzK3ZQMGkvWnI4TGZ6bCs5SDc2ZnZpKzlmNzVmc2YvSW44QlAxMC9lajljZjRPLzdmL2RBQWNBYVVCRWdLTUFoZ0RwQU1FQkNFRUR3VGZBM0lEeFFMOEFTb0JVd0NHLzg3K0ovNmgvUnI5cFB4ay9HYjhvUHdKL1hIOXcvMzkvVUQrcVA0MS85RC9Xd0RlQUdzQkFnS2RBaEVEUVFOQUEwc0Rid09WQTVZRFZ3UE9BaGdDVkFHUkFBPT0nLFxufVxuXG5leHBvcnQgZGVmYXVsdCBzYW1wbGVzXG4iLCIvKlxuXG5cblRoaXMgY29kZSBpcyBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vc2VyZ2kvanNtaWRpXG5cbmluZm86IGh0dHA6Ly93d3cuZGVsdWdlLmNvLz9xPW1pZGktdGVtcG8tYnBtXG5cbiovXG5cblxuaW1wb3J0IHtzYXZlQXN9IGZyb20gJ2ZpbGVzYXZlcmpzJ1xuXG5sZXQgUFBRID0gOTYwXG5sZXQgSERSX1BQUSA9IHN0cjJCeXRlcyhQUFEudG9TdHJpbmcoMTYpLCAyKVxuXG5jb25zdCBIRFJfQ0hVTktJRCA9IFtcbiAgJ00nLmNoYXJDb2RlQXQoMCksXG4gICdUJy5jaGFyQ29kZUF0KDApLFxuICAnaCcuY2hhckNvZGVBdCgwKSxcbiAgJ2QnLmNoYXJDb2RlQXQoMClcbl1cbmNvbnN0IEhEUl9DSFVOS19TSVpFID0gWzB4MCwgMHgwLCAweDAsIDB4Nl0gLy8gSGVhZGVyIHNpemUgZm9yIFNNRlxuY29uc3QgSERSX1RZUEUwID0gWzB4MCwgMHgwXSAvLyBNaWRpIFR5cGUgMCBpZFxuY29uc3QgSERSX1RZUEUxID0gWzB4MCwgMHgxXSAvLyBNaWRpIFR5cGUgMSBpZFxuLy9IRFJfUFBRID0gWzB4MDEsIDB4RTBdIC8vIERlZmF1bHRzIHRvIDQ4MCB0aWNrcyBwZXIgYmVhdFxuLy9IRFJfUFBRID0gWzB4MDAsIDB4ODBdIC8vIERlZmF1bHRzIHRvIDEyOCB0aWNrcyBwZXIgYmVhdFxuXG5jb25zdCBUUktfQ0hVTktJRCA9IFtcbiAgJ00nLmNoYXJDb2RlQXQoMCksXG4gICdUJy5jaGFyQ29kZUF0KDApLFxuICAncicuY2hhckNvZGVBdCgwKSxcbiAgJ2snLmNoYXJDb2RlQXQoMClcbl1cblxuLy8gTWV0YSBldmVudCBjb2Rlc1xuY29uc3QgTUVUQV9TRVFVRU5DRSA9IDB4MDBcbmNvbnN0IE1FVEFfVEVYVCA9IDB4MDFcbmNvbnN0IE1FVEFfQ09QWVJJR0hUID0gMHgwMlxuY29uc3QgTUVUQV9UUkFDS19OQU1FID0gMHgwM1xuY29uc3QgTUVUQV9JTlNUUlVNRU5UID0gMHgwNFxuY29uc3QgTUVUQV9MWVJJQyA9IDB4MDVcbmNvbnN0IE1FVEFfTUFSS0VSID0gMHgwNlxuY29uc3QgTUVUQV9DVUVfUE9JTlQgPSAweDA3XG5jb25zdCBNRVRBX0NIQU5ORUxfUFJFRklYID0gMHgyMFxuY29uc3QgTUVUQV9FTkRfT0ZfVFJBQ0sgPSAweDJmXG5jb25zdCBNRVRBX1RFTVBPID0gMHg1MVxuY29uc3QgTUVUQV9TTVBURSA9IDB4NTRcbmNvbnN0IE1FVEFfVElNRV9TSUcgPSAweDU4XG5jb25zdCBNRVRBX0tFWV9TSUcgPSAweDU5XG5jb25zdCBNRVRBX1NFUV9FVkVOVCA9IDB4N2ZcblxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUFzTUlESUZpbGUoc29uZywgZmlsZU5hbWUgPSBzb25nLm5hbWUsIHBwcSA9IDk2MCkge1xuXG4gIFBQUSA9IHBwcVxuICBIRFJfUFBRID0gc3RyMkJ5dGVzKFBQUS50b1N0cmluZygxNiksIDIpXG5cbiAgbGV0IGJ5dGVBcnJheSA9IFtdLmNvbmNhdChIRFJfQ0hVTktJRCwgSERSX0NIVU5LX1NJWkUsIEhEUl9UWVBFMSlcbiAgbGV0IHRyYWNrcyA9IHNvbmcuZ2V0VHJhY2tzKClcbiAgbGV0IG51bVRyYWNrcyA9IHRyYWNrcy5sZW5ndGggKyAxXG4gIGxldCBpLCBtYXhpLCB0cmFjaywgbWlkaUZpbGUsIGRlc3RpbmF0aW9uLCBiNjRcbiAgbGV0IGFycmF5QnVmZmVyLCBkYXRhVmlldywgdWludEFycmF5XG5cbiAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdChzdHIyQnl0ZXMobnVtVHJhY2tzLnRvU3RyaW5nKDE2KSwgMiksIEhEUl9QUFEpXG5cbiAgLy9jb25zb2xlLmxvZyhieXRlQXJyYXkpO1xuICBieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHRyYWNrVG9CeXRlcyhzb25nLl90aW1lRXZlbnRzLCBzb25nLl9kdXJhdGlvblRpY2tzLCAndGVtcG8nKSlcblxuICBmb3IoaSA9IDAsIG1heGkgPSB0cmFja3MubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKXtcbiAgICB0cmFjayA9IHRyYWNrc1tpXTtcbiAgICBsZXQgaW5zdHJ1bWVudFxuICAgIGlmKHRyYWNrLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIGluc3RydW1lbnQgPSB0cmFjay5faW5zdHJ1bWVudC5pZFxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIHRyYWNrLl9ldmVudHMubGVuZ3RoLCBpbnN0cnVtZW50KVxuICAgIGJ5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQodHJhY2tUb0J5dGVzKHRyYWNrLl9ldmVudHMsIHNvbmcuX2R1cmF0aW9uVGlja3MsIHRyYWNrLm5hbWUsIGluc3RydW1lbnQpKVxuICAgIC8vYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdCh0cmFja1RvQnl0ZXModHJhY2suX2V2ZW50cywgc29uZy5fbGFzdEV2ZW50Lmlja3MsIHRyYWNrLm5hbWUsIGluc3RydW1lbnQpKVxuICB9XG5cbiAgLy9iNjQgPSBidG9hKGNvZGVzMlN0cihieXRlQXJyYXkpKVxuICAvL3dpbmRvdy5sb2NhdGlvbi5hc3NpZ24oXCJkYXRhOmF1ZGlvL21pZGk7YmFzZTY0LFwiICsgYjY0KVxuICAvL2NvbnNvbGUubG9nKGI2NCkvLyBzZW5kIHRvIHNlcnZlclxuXG4gIG1heGkgPSBieXRlQXJyYXkubGVuZ3RoXG4gIGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG1heGkpXG4gIHVpbnRBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKVxuICBmb3IoaSA9IDA7IGkgPCBtYXhpOyBpKyspe1xuICAgIHVpbnRBcnJheVtpXSA9IGJ5dGVBcnJheVtpXVxuICB9XG4gIG1pZGlGaWxlID0gbmV3IEJsb2IoW3VpbnRBcnJheV0sIHt0eXBlOiAnYXBwbGljYXRpb24veC1taWRpJywgZW5kaW5nczogJ3RyYW5zcGFyZW50J30pXG4gIGZpbGVOYW1lID0gZmlsZU5hbWUucmVwbGFjZSgvXFwubWlkaSQvLCAnJylcbiAgLy9sZXQgcGF0dCA9IC9cXC5taWRbaV17MCwxfSQvXG4gIGxldCBwYXR0ID0gL1xcLm1pZCQvXG4gIGxldCBoYXNFeHRlbnNpb24gPSBwYXR0LnRlc3QoZmlsZU5hbWUpXG4gIGlmKGhhc0V4dGVuc2lvbiA9PT0gZmFsc2Upe1xuICAgIGZpbGVOYW1lICs9ICcubWlkJ1xuICB9XG4gIC8vY29uc29sZS5sb2coZmlsZU5hbWUsIGhhc0V4dGVuc2lvbilcbiAgc2F2ZUFzKG1pZGlGaWxlLCBmaWxlTmFtZSlcbiAgLy93aW5kb3cubG9jYXRpb24uYXNzaWduKHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKG1pZGlGaWxlKSlcbn1cblxuXG5mdW5jdGlvbiB0cmFja1RvQnl0ZXMoZXZlbnRzLCBsYXN0RXZlbnRUaWNrcywgdHJhY2tOYW1lLCBpbnN0cnVtZW50TmFtZSA9ICdubyBpbnN0cnVtZW50Jyl7XG4gIHZhciBsZW5ndGhCeXRlcyxcbiAgICBpLCBtYXhpLCBldmVudCwgc3RhdHVzLFxuICAgIHRyYWNrTGVuZ3RoLCAvLyBudW1iZXIgb2YgYnl0ZXMgaW4gdHJhY2sgY2h1bmtcbiAgICB0aWNrcyA9IDAsXG4gICAgZGVsdGEgPSAwLFxuICAgIHRyYWNrQnl0ZXMgPSBbXTtcblxuICBpZih0cmFja05hbWUpe1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDMpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEodHJhY2tOYW1lLmxlbmd0aCkpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHJpbmdUb051bUFycmF5KHRyYWNrTmFtZSkpO1xuICB9XG5cbiAgaWYoaW5zdHJ1bWVudE5hbWUpe1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDQpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoaW5zdHJ1bWVudE5hbWUubGVuZ3RoKSk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KHN0cmluZ1RvTnVtQXJyYXkoaW5zdHJ1bWVudE5hbWUpKTtcbiAgfVxuXG4gIGZvcihpID0gMCwgbWF4aSA9IGV2ZW50cy5sZW5ndGg7IGkgPCBtYXhpOyBpKyspe1xuICAgIGV2ZW50ID0gZXZlbnRzW2ldO1xuICAgIGRlbHRhID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgICBkZWx0YSA9IGNvbnZlcnRUb1ZMUShkZWx0YSk7XG4gICAgLy9jb25zb2xlLmxvZyhkZWx0YSk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGRlbHRhKTtcbiAgICAvL3RyYWNrQnl0ZXMucHVzaC5hcHBseSh0cmFja0J5dGVzLCBkZWx0YSk7XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMHg4MCB8fCBldmVudC50eXBlID09PSAweDkwKXsgLy8gbm90ZSBvZmYsIG5vdGUgb25cbiAgICAgIC8vc3RhdHVzID0gcGFyc2VJbnQoZXZlbnQudHlwZS50b1N0cmluZygxNikgKyBldmVudC5jaGFubmVsLnRvU3RyaW5nKDE2KSwgMTYpO1xuICAgICAgc3RhdHVzID0gZXZlbnQudHlwZSArIChldmVudC5jaGFubmVsIHx8IDApXG4gICAgICB0cmFja0J5dGVzLnB1c2goc3RhdHVzKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChldmVudC5kYXRhMSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQuZGF0YTIpO1xuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDB4NTEpeyAvLyB0ZW1wb1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4NTEpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4MDMpOy8vIGxlbmd0aFxuICAgICAgLy90cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKDMpKTsvLyBsZW5ndGhcbiAgICAgIHZhciBtaWNyb1NlY29uZHMgPSBNYXRoLnJvdW5kKDYwMDAwMDAwIC8gZXZlbnQuYnBtKTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuYnBtKVxuICAgICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KHN0cjJCeXRlcyhtaWNyb1NlY29uZHMudG9TdHJpbmcoMTYpLCAzKSk7XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMHg1OCl7IC8vIHRpbWUgc2lnbmF0dXJlXG4gICAgICB2YXIgZGVub20gPSBldmVudC5kZW5vbWluYXRvcjtcbiAgICAgIGlmKGRlbm9tID09PSAyKXtcbiAgICAgICAgZGVub20gPSAweDAxO1xuICAgICAgfWVsc2UgaWYoZGVub20gPT09IDQpe1xuICAgICAgICBkZW5vbSA9IDB4MDI7XG4gICAgICB9ZWxzZSBpZihkZW5vbSA9PT0gOCl7XG4gICAgICAgIGRlbm9tID0gMHgwMztcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSAxNil7XG4gICAgICAgIGRlbm9tID0gMHgwNDtcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSAzMil7XG4gICAgICAgIGRlbm9tID0gMHgwNTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVub21pbmF0b3IsIGV2ZW50Lm5vbWluYXRvcilcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDU4KTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDA0KTsvLyBsZW5ndGhcbiAgICAgIC8vdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUSg0KSk7Ly8gbGVuZ3RoXG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChkZW5vbSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goUFBRIC8gZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDA4KTsgLy8gMzJuZCBub3RlcyBwZXIgY3JvdGNoZXRcbiAgICAgIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCBldmVudC5ub21pbmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yLCBkZW5vbSwgUFBRL2V2ZW50Lm5vbWluYXRvcik7XG4gICAgfVxuICAgIC8vIHNldCB0aGUgbmV3IHRpY2tzIHJlZmVyZW5jZVxuICAgIC8vY29uc29sZS5sb2coc3RhdHVzLCBldmVudC50aWNrcywgdGlja3MpO1xuICAgIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIH1cbiAgZGVsdGEgPSBsYXN0RXZlbnRUaWNrcyAtIHRpY2tzO1xuICAvL2NvbnNvbGUubG9nKCdkJywgZGVsdGEsICd0JywgdGlja3MsICdsJywgbGFzdEV2ZW50VGlja3MpO1xuICBkZWx0YSA9IGNvbnZlcnRUb1ZMUShkZWx0YSk7XG4gIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCB0aWNrcywgZGVsdGEpO1xuICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoZGVsdGEpO1xuICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gIHRyYWNrQnl0ZXMucHVzaCgweDJGKTtcbiAgdHJhY2tCeXRlcy5wdXNoKDB4MDApO1xuICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgdHJhY2tCeXRlcyk7XG4gIHRyYWNrTGVuZ3RoID0gdHJhY2tCeXRlcy5sZW5ndGg7XG4gIGxlbmd0aEJ5dGVzID0gc3RyMkJ5dGVzKHRyYWNrTGVuZ3RoLnRvU3RyaW5nKDE2KSwgNCk7XG4gIHJldHVybiBbXS5jb25jYXQoVFJLX0NIVU5LSUQsIGxlbmd0aEJ5dGVzLCB0cmFja0J5dGVzKTtcbn1cblxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5cbi8qXG4gKiBDb252ZXJ0cyBhbiBhcnJheSBvZiBieXRlcyB0byBhIHN0cmluZyBvZiBoZXhhZGVjaW1hbCBjaGFyYWN0ZXJzLiBQcmVwYXJlc1xuICogaXQgdG8gYmUgY29udmVydGVkIGludG8gYSBiYXNlNjQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBieXRlQXJyYXkge0FycmF5fSBhcnJheSBvZiBieXRlcyB0aGF0IHdpbGwgYmUgY29udmVydGVkIHRvIGEgc3RyaW5nXG4gKiBAcmV0dXJucyBoZXhhZGVjaW1hbCBzdHJpbmdcbiAqL1xuXG5mdW5jdGlvbiBjb2RlczJTdHIoYnl0ZUFycmF5KSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGJ5dGVBcnJheSk7XG59XG5cbi8qXG4gKiBDb252ZXJ0cyBhIFN0cmluZyBvZiBoZXhhZGVjaW1hbCB2YWx1ZXMgdG8gYW4gYXJyYXkgb2YgYnl0ZXMuIEl0IGNhbiBhbHNvXG4gKiBhZGQgcmVtYWluaW5nICcwJyBuaWJibGVzIGluIG9yZGVyIHRvIGhhdmUgZW5vdWdoIGJ5dGVzIGluIHRoZSBhcnJheSBhcyB0aGVcbiAqIHxmaW5hbEJ5dGVzfCBwYXJhbWV0ZXIuXG4gKlxuICogQHBhcmFtIHN0ciB7U3RyaW5nfSBzdHJpbmcgb2YgaGV4YWRlY2ltYWwgdmFsdWVzIGUuZy4gJzA5N0I4QSdcbiAqIEBwYXJhbSBmaW5hbEJ5dGVzIHtJbnRlZ2VyfSBPcHRpb25hbC4gVGhlIGRlc2lyZWQgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgdGhlIHJldHVybmVkIGFycmF5IHNob3VsZCBjb250YWluXG4gKiBAcmV0dXJucyBhcnJheSBvZiBuaWJibGVzLlxuICovXG5cbmZ1bmN0aW9uIHN0cjJCeXRlcyhzdHIsIGZpbmFsQnl0ZXMpIHtcbiAgaWYgKGZpbmFsQnl0ZXMpIHtcbiAgICB3aGlsZSAoKHN0ci5sZW5ndGggLyAyKSA8IGZpbmFsQnl0ZXMpIHtcbiAgICAgIHN0ciA9ICcwJyArIHN0cjtcbiAgICB9XG4gIH1cblxuICB2YXIgYnl0ZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHN0ci5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMikge1xuICAgIHZhciBjaGFycyA9IGkgPT09IDAgPyBzdHJbaV0gOiBzdHJbaSAtIDFdICsgc3RyW2ldO1xuICAgIGJ5dGVzLnVuc2hpZnQocGFyc2VJbnQoY2hhcnMsIDE2KSk7XG4gIH1cblxuICByZXR1cm4gYnl0ZXM7XG59XG5cblxuLyoqXG4gKiBUcmFuc2xhdGVzIG51bWJlciBvZiB0aWNrcyB0byBNSURJIHRpbWVzdGFtcCBmb3JtYXQsIHJldHVybmluZyBhbiBhcnJheSBvZlxuICogYnl0ZXMgd2l0aCB0aGUgdGltZSB2YWx1ZXMuIE1pZGkgaGFzIGEgdmVyeSBwYXJ0aWN1bGFyIHRpbWUgdG8gZXhwcmVzcyB0aW1lLFxuICogdGFrZSBhIGdvb2QgbG9vayBhdCB0aGUgc3BlYyBiZWZvcmUgZXZlciB0b3VjaGluZyB0aGlzIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB0aWNrcyB7SW50ZWdlcn0gTnVtYmVyIG9mIHRpY2tzIHRvIGJlIHRyYW5zbGF0ZWRcbiAqIEByZXR1cm5zIEFycmF5IG9mIGJ5dGVzIHRoYXQgZm9ybSB0aGUgTUlESSB0aW1lIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRUb1ZMUSh0aWNrcykge1xuICB2YXIgYnVmZmVyID0gdGlja3MgJiAweDdGO1xuXG4gIHdoaWxlKHRpY2tzID0gdGlja3MgPj4gNykge1xuICAgIGJ1ZmZlciA8PD0gODtcbiAgICBidWZmZXIgfD0gKCh0aWNrcyAmIDB4N0YpIHwgMHg4MCk7XG4gIH1cblxuICB2YXIgYkxpc3QgPSBbXTtcbiAgd2hpbGUodHJ1ZSkge1xuICAgIGJMaXN0LnB1c2goYnVmZmVyICYgMHhmZik7XG5cbiAgICBpZiAoYnVmZmVyICYgMHg4MCkge1xuICAgICAgYnVmZmVyID4+PSA4O1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKHRpY2tzLCBiTGlzdCk7XG4gIHJldHVybiBiTGlzdDtcbn1cblxuXG4vKlxuICogQ29udmVydHMgYSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBBU0NJSSBjaGFyIGNvZGVzIGZvciBldmVyeSBjaGFyYWN0ZXIgb2ZcbiAqIHRoZSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHN0ciB7U3RyaW5nfSBTdHJpbmcgdG8gYmUgY29udmVydGVkXG4gKiBAcmV0dXJucyBhcnJheSB3aXRoIHRoZSBjaGFyY29kZSB2YWx1ZXMgb2YgdGhlIHN0cmluZ1xuICovXG5jb25zdCBBUCA9IEFycmF5LnByb3RvdHlwZVxuZnVuY3Rpb24gc3RyaW5nVG9OdW1BcnJheShzdHIpIHtcbiAgLy8gcmV0dXJuIHN0ci5zcGxpdCgpLmZvckVhY2goY2hhciA9PiB7XG4gIC8vICAgcmV0dXJuIGNoYXIuY2hhckNvZGVBdCgwKVxuICAvLyB9KVxuICByZXR1cm4gQVAubWFwLmNhbGwoc3RyLCBmdW5jdGlvbihjaGFyKSB7XG4gICAgcmV0dXJuIGNoYXIuY2hhckNvZGVBdCgwKVxuICB9KVxufVxuIiwiaW1wb3J0IHtnZXRNSURJT3V0cHV0QnlJZCwgZ2V0TUlESU91dHB1dHN9IGZyb20gJy4vaW5pdF9taWRpJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtidWZmZXJUaW1lfSBmcm9tICcuL3NldHRpbmdzJyAvLyBtaWxsaXNcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJyAvLyBtaWxsaXNcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXJ7XG5cbiAgY29uc3RydWN0b3Ioc29uZyl7XG4gICAgdGhpcy5zb25nID0gc29uZ1xuICB9XG5cblxuICBpbml0KG1pbGxpcyl7XG4gICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyA9IG1pbGxpc1xuICAgIHRoaXMuc29uZ1N0YXJ0TWlsbGlzID0gbWlsbGlzXG4gICAgdGhpcy5ldmVudHMgPSB0aGlzLnNvbmcuX2FsbEV2ZW50c1xuICAgIHRoaXMubnVtRXZlbnRzID0gdGhpcy5ldmVudHMubGVuZ3RoXG4gICAgdGhpcy5pbmRleCA9IDBcbiAgICB0aGlzLm1heHRpbWUgPSAwXG4gICAgdGhpcy5wcmV2TWF4dGltZSA9IDBcbiAgICB0aGlzLmJleW9uZExvb3AgPSBmYWxzZSAvLyB0ZWxscyB1cyBpZiB0aGUgcGxheWhlYWQgaGFzIGFscmVhZHkgcGFzc2VkIHRoZSBsb29wZWQgc2VjdGlvblxuICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZ1N0YXJ0TWlsbGlzKVxuXG4gICAgdGhpcy50aW1lRXZlbnRzSW5kZXggPSAwXG4gICAgdGhpcy5zb25nRXZlbnRzSW5kZXggPSAwXG4gICAgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleCA9IDBcblxuICAgIHRoaXMudGltZUV2ZW50cyA9IHRoaXMuc29uZy5fdGltZUV2ZW50c1xuICAgIHRoaXMuc29uZ0V2ZW50cyA9IHRoaXMuc29uZy5fZXZlbnRzXG4gICAgdGhpcy5zb25nRXZlbnRzLnB1c2godGhpcy5zb25nLl9sYXN0RXZlbnQpXG4gICAgdGhpcy5tZXRyb25vbWVFdmVudHMgPSB0aGlzLnNvbmcuX21ldHJvbm9tZS5ldmVudHNcblxuICAgIHRoaXMubnVtVGltZUV2ZW50cyA9IHRoaXMudGltZUV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLm51bVNvbmdFdmVudHMgPSB0aGlzLnNvbmdFdmVudHMubGVuZ3RoXG4gICAgdGhpcy5udW1NZXRyb25vbWVFdmVudHMgPSB0aGlzLm1ldHJvbm9tZUV2ZW50cy5sZW5ndGhcbiAgfVxuXG5cbiAgc2V0VGltZVN0YW1wKHRpbWVTdGFtcCl7XG4gICAgdGhpcy50aW1lU3RhbXAgPSB0aW1lU3RhbXBcbiAgfVxuXG4gIGdldEV2ZW50czIobWF4dGltZSwgdGltZXN0YW1wKXtcbiAgICBsZXQgbG9vcCA9IHRydWVcbiAgICBsZXQgZXZlbnRcbiAgICBsZXQgcmVzdWx0ID0gW11cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMudGltZUV2ZW50c0luZGV4LCB0aGlzLnNvbmdFdmVudHNJbmRleCwgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleClcbiAgICB3aGlsZShsb29wKXtcblxuICAgICAgbGV0IHN0b3AgPSBmYWxzZVxuXG4gICAgICBpZih0aGlzLnRpbWVFdmVudHNJbmRleCA8IHRoaXMubnVtVGltZUV2ZW50cyl7XG4gICAgICAgIGV2ZW50ID0gdGhpcy50aW1lRXZlbnRzW3RoaXMudGltZUV2ZW50c0luZGV4XVxuICAgICAgICBpZihldmVudC5taWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICB0aGlzLm1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLm1pbGxpc1BlclRpY2spXG4gICAgICAgICAgdGhpcy50aW1lRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHRoaXMuc29uZ0V2ZW50c0luZGV4IDwgdGhpcy5udW1Tb25nRXZlbnRzKXtcbiAgICAgICAgZXZlbnQgPSB0aGlzLnNvbmdFdmVudHNbdGhpcy5zb25nRXZlbnRzSW5kZXhdXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDB4MkYpe1xuICAgICAgICAgIGxvb3AgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgbGV0IG1pbGxpcyA9IGV2ZW50LnRpY2tzICogdGhpcy5taWxsaXNQZXJUaWNrXG4gICAgICAgIGlmKG1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIGV2ZW50LnRpbWUgPSBtaWxsaXMgKyB0aW1lc3RhbXBcbiAgICAgICAgICBldmVudC5taWxsaXMgPSBtaWxsaXNcbiAgICAgICAgICByZXN1bHQucHVzaChldmVudClcbiAgICAgICAgICB0aGlzLnNvbmdFdmVudHNJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN0b3AgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYodGhpcy5zb25nLnVzZU1ldHJvbm9tZSA9PT0gdHJ1ZSAmJiB0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4IDwgdGhpcy5udW1NZXRyb25vbWVFdmVudHMpe1xuICAgICAgICBldmVudCA9IHRoaXMubWV0cm9ub21lRXZlbnRzW3RoaXMubWV0cm9ub21lRXZlbnRzSW5kZXhdXG4gICAgICAgIGxldCBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGlja1xuICAgICAgICBpZihtaWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZXN0YW1wXG4gICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgICAgICAgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN0b3AgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoc3RvcCl7XG4gICAgICAgIGxvb3AgPSBmYWxzZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBzb3J0RXZlbnRzKHJlc3VsdClcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvLyBnZXQgdGhlIGluZGV4IG9mIHRoZSBldmVudCB0aGF0IGhhcyBpdHMgbWlsbGlzIHZhbHVlIGF0IG9yIHJpZ2h0IGFmdGVyIHRoZSBwcm92aWRlZCBtaWxsaXMgdmFsdWVcbiAgc2V0SW5kZXgobWlsbGlzKXtcbiAgICBsZXQgaSA9IDBcbiAgICBsZXQgZXZlbnRcbiAgICBmb3IoZXZlbnQgb2YgdGhpcy5ldmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgICAgIHRoaXMuaW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvLyBpID0gMFxuICAgIC8vIGZvcihldmVudCBvZiB0aGlzLnRpbWVFdmVudHMpe1xuICAgIC8vICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgLy8gICAgIHRoaXMudGltZUV2ZW50c0luZGV4ID0gaTtcbiAgICAvLyAgICAgYnJlYWs7XG4gICAgLy8gICB9XG4gICAgLy8gICBpKys7XG4gICAgLy8gfVxuXG4gICAgdGhpcy5iZXlvbmRMb29wID0gbWlsbGlzID4gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgdGhpcy5ub3RlcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKCl7XG4gICAgbGV0IGV2ZW50cyA9IFtdXG5cbiAgICBpZih0aGlzLnNvbmcuX2xvb3AgPT09IHRydWUgJiYgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gPCBidWZmZXJUaW1lKXtcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ1N0YXJ0TWlsbGlzICsgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gLSAxXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5zb25nLmxvb3BEdXJhdGlvbik7XG4gICAgfVxuXG4gICAgaWYodGhpcy5zb25nLl9sb29wID09PSB0cnVlKXtcblxuICAgICAgaWYodGhpcy5tYXh0aW1lID49IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAmJiB0aGlzLmJleW9uZExvb3AgPT09IGZhbHNlKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnTE9PUCcsIHRoaXMubWF4dGltZSwgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKVxuXG4gICAgICAgIGxldCBkaWZmID0gdGhpcy5tYXh0aW1lIC0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzICsgZGlmZlxuXG4gICAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS1MT09QRUQnLCB0aGlzLm1heHRpbWUsIGRpZmYsIHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzLCB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMpO1xuXG4gICAgICAgIGlmKHRoaXMubG9vcGVkID09PSBmYWxzZSl7XG4gICAgICAgICAgdGhpcy5sb29wZWQgPSB0cnVlO1xuICAgICAgICAgIGxldCBsZWZ0TWlsbGlzID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXNcbiAgICAgICAgICBsZXQgcmlnaHRNaWxsaXMgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXNcblxuICAgICAgICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgICAgICAgIGxldCBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHJpZ2h0TWlsbGlzKXtcbiAgICAgICAgICAgICAgZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpXG5cbiAgICAgICAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGVzLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50LnR5cGUpXG4gICAgICAgICAgICAgIHRoaXMuaW5kZXgrK1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gc3RvcCBvdmVyZmxvd2luZyBub3Rlcy0+IGFkZCBhIG5ldyBub3RlIG9mZiBldmVudCBhdCB0aGUgcG9zaXRpb24gb2YgdGhlIHJpZ2h0IGxvY2F0b3IgKGVuZCBvZiB0aGUgbG9vcClcbiAgICAgICAgICBsZXQgZW5kVGlja3MgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci50aWNrcyAtIDFcbiAgICAgICAgICBsZXQgZW5kTWlsbGlzID0gdGhpcy5zb25nLmNhbGN1bGF0ZVBvc2l0aW9uKHt0eXBlOiAndGlja3MnLCB0YXJnZXQ6IGVuZFRpY2tzLCByZXN1bHQ6ICdtaWxsaXMnfSkubWlsbGlzXG5cbiAgICAgICAgICBmb3IobGV0IG5vdGUgb2YgdGhpcy5ub3Rlcy52YWx1ZXMoKSl7XG4gICAgICAgICAgICBsZXQgbm90ZU9uID0gbm90ZS5ub3RlT25cbiAgICAgICAgICAgIGxldCBub3RlT2ZmID0gbm90ZS5ub3RlT2ZmXG4gICAgICAgICAgICBpZihub3RlT2ZmLm1pbGxpcyA8PSByaWdodE1pbGxpcyl7XG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZXZlbnQgPSBuZXcgTUlESUV2ZW50KGVuZFRpY2tzLCAxMjgsIG5vdGVPbi5kYXRhMSwgMClcbiAgICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IGVuZE1pbGxpc1xuICAgICAgICAgICAgZXZlbnQuX3BhcnQgPSBub3RlT24uX3BhcnRcbiAgICAgICAgICAgIGV2ZW50Ll90cmFjayA9IG5vdGVPbi5fdHJhY2tcbiAgICAgICAgICAgIGV2ZW50Lm1pZGlOb3RlID0gbm90ZVxuICAgICAgICAgICAgZXZlbnQubWlkaU5vdGVJZCA9IG5vdGUuaWRcbiAgICAgICAgICAgIGV2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdhZGRlZCcsIGV2ZW50KVxuICAgICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgICAgfVxuXG4vKlxuICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgYXVkaW8gc2FtcGxlc1xuICAgICAgICAgIGZvcihpIGluIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHMpe1xuICAgICAgICAgICAgaWYodGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cy5oYXNPd25Qcm9wZXJ0eShpKSl7XG4gICAgICAgICAgICAgIGF1ZGlvRXZlbnQgPSB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzW2ldO1xuICAgICAgICAgICAgICBpZihhdWRpb0V2ZW50LmVuZE1pbGxpcyA+IHRoaXMuc29uZy5sb29wRW5kKXtcbiAgICAgICAgICAgICAgICBhdWRpb0V2ZW50LnN0b3BTYW1wbGUodGhpcy5zb25nLmxvb3BFbmQvMTAwMCk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbaV07XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcHBpbmcgYXVkaW8gZXZlbnQnLCBpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiovXG4gICAgICAgICAgdGhpcy5ub3RlcyA9IG5ldyBNYXAoKVxuICAgICAgICAgIHRoaXMuc2V0SW5kZXgobGVmdE1pbGxpcylcbiAgICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvblxuICAgICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgLT0gdGhpcy5zb25nLl9sb29wRHVyYXRpb25cblxuICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnRzLmxlbmd0aClcblxuICAgICAgICAgIC8vIGdldCB0aGUgYXVkaW8gZXZlbnRzIHRoYXQgc3RhcnQgYmVmb3JlIHNvbmcubG9vcFN0YXJ0XG4gICAgICAgICAgLy90aGlzLmdldERhbmdsaW5nQXVkaW9FdmVudHModGhpcy5zb25nLmxvb3BTdGFydCwgZXZlbnRzKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMubG9vcGVkID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKCdzY2hlZHVsZXInLCB0aGlzLmxvb3BlZClcblxuICAgIC8vIG1haW4gbG9vcFxuICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgIGxldCBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWxsaXMsIHRoaXMubWF4dGltZSlcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHRoaXMubWF4dGltZSl7XG5cbiAgICAgICAgLy9ldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcblxuICAgICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC50aW1lID0gKHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIH1lbHNle1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50cztcbiAgfVxuXG5cbiAgdXBkYXRlKGRpZmYpe1xuICAgIHZhciBpLFxuICAgICAgZXZlbnQsXG4gICAgICBudW1FdmVudHMsXG4gICAgICB0cmFjayxcbiAgICAgIGV2ZW50c1xuXG4gICAgdGhpcy5wcmV2TWF4dGltZSA9IHRoaXMubWF4dGltZVxuXG4gICAgaWYodGhpcy5zb25nLnByZWNvdW50aW5nKXtcbiAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIGJ1ZmZlclRpbWVcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5zb25nQ3VycmVudE1pbGxpcylcbiAgICAgIGV2ZW50cyA9IHRoaXMuc29uZy5fbWV0cm9ub21lLmdldFByZWNvdW50RXZlbnRzKHRoaXMubWF4dGltZSlcblxuICAgICAgaWYodGhpcy5tYXh0aW1lID4gdGhpcy5zb25nLl9tZXRyb25vbWUuZW5kTWlsbGlzICYmIHRoaXMucHJlY291bnRpbmdEb25lID09PSBmYWxzZSl7XG4gICAgICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gdHJ1ZVxuICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX3ByZWNvdW50RHVyYXRpb25cblxuICAgICAgICAvLyBzdGFydCBzY2hlZHVsaW5nIGV2ZW50cyBvZiB0aGUgc29uZyAtPiBhZGQgdGhlIGZpcnN0IGV2ZW50cyBvZiB0aGUgc29uZ1xuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCB0aGlzLnNvbmdDdXJyZW50TWlsbGlzKVxuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIGJ1ZmZlclRpbWVcbiAgICAgICAgZXZlbnRzLnB1c2goLi4udGhpcy5nZXRFdmVudHMoKSlcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIGJ1ZmZlclRpbWVcbiAgICAgIC8vZXZlbnRzID0gdGhpcy5zb25nLl9nZXRFdmVudHMyKHRoaXMubWF4dGltZSwgKHRoaXMudGltZVN0YW1wIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpKVxuICAgICAgZXZlbnRzID0gdGhpcy5nZXRFdmVudHMyKHRoaXMubWF4dGltZSwgKHRoaXMudGltZVN0YW1wIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpKVxuICAgICAgLy9jb25zb2xlLmxvZygnZG9uZScsIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMsIGRpZmYsIHRoaXMuaW5kZXgsIGV2ZW50cy5sZW5ndGgpXG4gICAgfVxuXG4gICAgLy8gaWYodGhpcy5zb25nLnVzZU1ldHJvbm9tZSA9PT0gdHJ1ZSl7XG4gICAgLy8gICBsZXQgbWV0cm9ub21lRXZlbnRzID0gdGhpcy5zb25nLl9tZXRyb25vbWUuZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAvLyAgIC8vIGlmKG1ldHJvbm9tZUV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAvLyAgIC8vICAgY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCBtZXRyb25vbWVFdmVudHMpXG4gICAgLy8gICAvLyB9XG4gICAgLy8gICAvLyBtZXRyb25vbWVFdmVudHMuZm9yRWFjaChlID0+IHtcbiAgICAvLyAgIC8vICAgZS50aW1lID0gKHRoaXMudGltZVN0YW1wICsgZS5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgICAvLyAgIC8vIH0pXG4gICAgLy8gICBldmVudHMucHVzaCguLi5tZXRyb25vbWVFdmVudHMpXG4gICAgLy8gfVxuXG4gICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuXG5cbiAgICAvLyBpZihudW1FdmVudHMgPiA1KXtcbiAgICAvLyAgIGNvbnNvbGUubG9nKG51bUV2ZW50cylcbiAgICAvLyB9XG5cbiAgICBmb3IoaSA9IDA7IGkgPCBudW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IGV2ZW50c1tpXVxuICAgICAgdHJhY2sgPSBldmVudC5fdHJhY2tcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCB0aGlzLm1heHRpbWUsIHRoaXMucHJldk1heHRpbWUpXG5cbiAgICAgIC8vIGlmKGV2ZW50Lm1pbGxpcyA+IHRoaXMubWF4dGltZSl7XG4gICAgICAvLyAgIC8vIHNraXAgZXZlbnRzIHRoYXQgd2VyZSBoYXJ2ZXN0IGFjY2lkZW50bHkgd2hpbGUganVtcGluZyB0aGUgcGxheWhlYWQgLT4gc2hvdWxkIGhhcHBlbiB2ZXJ5IHJhcmVseSBpZiBldmVyXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdza2lwJywgZXZlbnQpXG4gICAgICAvLyAgIGNvbnRpbnVlXG4gICAgICAvLyB9XG5cbiAgICAgIGlmKGV2ZW50Ll9wYXJ0Lm11dGVkID09PSB0cnVlIHx8IHRyYWNrLm11dGVkID09PSB0cnVlIHx8IGV2ZW50Lm11dGVkID09PSB0cnVlKXtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvLyB0aGlzIGlzIHVzdWFsbHkgY2F1c2VkIGJ5IHRoZSBzYW1lIG5vdGUgb24gdGhlIHNhbWUgdGlja3MgdmFsdWUsIHdoaWNoIGlzIHByb2JhYmx5IGEgYnVnIGluIHRoZSBtaWRpIGZpbGVcbiAgICAgICAgLy9jb25zb2xlLmluZm8oJ25vIG1pZGlOb3RlSWQnLCBldmVudClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIC8vIC9jb25zb2xlLmxvZyhldmVudC50aWNrcywgZXZlbnQudGltZSwgZXZlbnQubWlsbGlzLCBldmVudC50eXBlLCBldmVudC5fdHJhY2submFtZSlcblxuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJyl7XG4gICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8gY29udmVydCB0byBzZWNvbmRzIGJlY2F1c2UgdGhlIGF1ZGlvIGNvbnRleHQgdXNlcyBzZWNvbmRzIGZvciBzY2hlZHVsaW5nXG4gICAgICAgIHRyYWNrLnByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHRydWUpIC8vIHRydWUgbWVhbnM6IHVzZSBsYXRlbmN5IHRvIGNvbXBlbnNhdGUgdGltaW5nIGZvciBleHRlcm5hbCBNSURJIGRldmljZXMsIHNlZSBUcmFjay5wcm9jZXNzTUlESUV2ZW50XG4gICAgICAgIC8vY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAsIGV2ZW50LnRpbWUsIHRoaXMuaW5kZXgpXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAgICAgdGhpcy5ub3Rlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAgICAgdGhpcy5ub3Rlcy5kZWxldGUoZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuaW5kZXgsIHRoaXMubnVtRXZlbnRzKVxuICAgIC8vcmV0dXJuIHRoaXMuaW5kZXggPj0gMTBcbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLm51bUV2ZW50cyAvLyBsYXN0IGV2ZW50IG9mIHNvbmdcbiAgfVxuXG4vKlxuICBhbGxOb3Rlc09mZigpe1xuICAgIGxldCB0aW1lU3RhbXAgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuICAgIGxldCBvdXRwdXRzID0gZ2V0TUlESU91dHB1dHMoKVxuICAgIG91dHB1dHMuZm9yRWFjaCgob3V0cHV0KSA9PiB7XG4gICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZVN0YW1wKSAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgICB9KVxuICB9XG4qL1xufVxuXG4iLCIvL2ltcG9ydCBnbUluc3RydW1lbnRzIGZyb20gJy4vZ21faW5zdHJ1bWVudHMnXG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0U29uZyA9IHtcbiAgcHBxOiA5NjAsXG4gIGJwbTogMTIwLFxuICBiYXJzOiAxNixcbiAgbG93ZXN0Tm90ZTogMCxcbiAgaGlnaGVzdE5vdGU6IDEyNyxcbiAgbm9taW5hdG9yOiA0LFxuICBkZW5vbWluYXRvcjogNCxcbiAgcXVhbnRpemVWYWx1ZTogOCxcbiAgZml4ZWRMZW5ndGhWYWx1ZTogZmFsc2UsXG4gIHBvc2l0aW9uVHlwZTogJ2FsbCcsXG4gIHVzZU1ldHJvbm9tZTogZmFsc2UsXG4gIGF1dG9TaXplOiB0cnVlLFxuICBwbGF5YmFja1NwZWVkOiAxLFxuICBhdXRvUXVhbnRpemU6IGZhbHNlXG59XG5cbmV4cG9ydCBsZXQgYnVmZmVyVGltZSA9IDIwMFxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QnVmZmVyVGltZSh0aW1lKXtcbiAgYnVmZmVyVGltZSA9IHRpbWVcbn1cblxuLy9wb3J0ZWQgaGVhcnRiZWF0IGluc3RydW1lbnRzOiBodHRwOi8vZ2l0aHViLmNvbS9hYnVkYWFuL2hlYXJ0YmVhdFxuY29uc3QgaGVhcnRiZWF0SW5zdHJ1bWVudHMgPSBuZXcgTWFwKFtcbiAgWydjaXR5LXBpYW5vJywge1xuICAgIG5hbWU6ICdDaXR5IFBpYW5vIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyA0IHZlbG9jaXR5IGxheWVyczogMSAtIDQ4LCA0OSAtIDk2LCA5NyAtIDExMCBhbmQgMTEwIC0gMTI3LiBJbiB0b3RhbCBpdCB1c2VzIDQgKiA4OCA9IDM1MiBzYW1wbGVzJyxcbiAgfV0sXG4gIFsnY2l0eS1waWFuby1saWdodCcsIHtcbiAgICBuYW1lOiAnQ2l0eSBQaWFubyBMaWdodCAocGlhbm8pJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NpdHkgUGlhbm8gbGlnaHQgdXNlcyBzYW1wbGVzIGZyb20gYSBCYWxkd2luIHBpYW5vLCBpdCBoYXMgb25seSAxIHZlbG9jaXR5IGxheWVyIGFuZCB1c2VzIDg4IHNhbXBsZXMnLFxuICB9XSxcbiAgWydjay1pY2Vza2F0ZXMnLCB7XG4gICAgbmFtZTogJ0NLIEljZSBTa2F0ZXMgKHN5bnRoKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIERldHVuaXplZCBzYW1wbGVzJyxcbiAgfV0sXG4gIFsnc2hrLXNxdWFyZXJvb3QnLCB7XG4gICAgbmFtZTogJ1NISyBzcXVhcmVyb290IChzeW50aCknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3Job2RlcycsIHtcbiAgICBuYW1lOiAnUmhvZGVzIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBGcmVlc291bmQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3Job2RlczInLCB7XG4gICAgbmFtZTogJ1Job2RlcyAyIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3RydW1wZXQnLCB7XG4gICAgbmFtZTogJ1RydW1wZXQgKGJyYXNzKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIFNTTyBzYW1wbGVzJyxcbiAgfV0sXG4gIFsndmlvbGluJywge1xuICAgIG5hbWU6ICdWaW9saW4gKHN0cmluZ3MpJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgU1NPIHNhbXBsZXMnLFxuICB9XVxuXSlcbmV4cG9ydCBjb25zdCBnZXRJbnN0cnVtZW50cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBoZWFydGJlYXRJbnN0cnVtZW50c1xufVxuXG4vLyBnbSBzb3VuZHMgZXhwb3J0ZWQgZnJvbSBGbHVpZFN5bnRoIGJ5IEJlbmphbWluIEdsZWl0em1hbjogaHR0cHM6Ly9naXRodWIuY29tL2dsZWl0ei9taWRpLWpzLXNvdW5kZm9udHNcbmNvbnN0IGdtSW5zdHJ1bWVudHMgPSB7XCJhY291c3RpY19ncmFuZF9waWFub1wiOntcIm5hbWVcIjpcIjEgQWNvdXN0aWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJyaWdodF9hY291c3RpY19waWFub1wiOntcIm5hbWVcIjpcIjIgQnJpZ2h0IEFjb3VzdGljIFBpYW5vIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ncmFuZF9waWFub1wiOntcIm5hbWVcIjpcIjMgRWxlY3RyaWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhvbmt5dG9ua19waWFub1wiOntcIm5hbWVcIjpcIjQgSG9ua3ktdG9uayBQaWFubyAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfcGlhbm9fMVwiOntcIm5hbWVcIjpcIjUgRWxlY3RyaWMgUGlhbm8gMSAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfcGlhbm9fMlwiOntcIm5hbWVcIjpcIjYgRWxlY3RyaWMgUGlhbm8gMiAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiaGFycHNpY2hvcmRcIjp7XCJuYW1lXCI6XCI3IEhhcnBzaWNob3JkIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjbGF2aW5ldFwiOntcIm5hbWVcIjpcIjggQ2xhdmluZXQgKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNlbGVzdGFcIjp7XCJuYW1lXCI6XCI5IENlbGVzdGEgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ2xvY2tlbnNwaWVsXCI6e1wibmFtZVwiOlwiMTAgR2xvY2tlbnNwaWVsIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm11c2ljX2JveFwiOntcIm5hbWVcIjpcIjExIE11c2ljIEJveCAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2aWJyYXBob25lXCI6e1wibmFtZVwiOlwiMTIgVmlicmFwaG9uZSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJtYXJpbWJhXCI6e1wibmFtZVwiOlwiMTMgTWFyaW1iYSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ4eWxvcGhvbmVcIjp7XCJuYW1lXCI6XCIxNCBYeWxvcGhvbmUgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidHVidWxhcl9iZWxsc1wiOntcIm5hbWVcIjpcIjE1IFR1YnVsYXIgQmVsbHMgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZHVsY2ltZXJcIjp7XCJuYW1lXCI6XCIxNiBEdWxjaW1lciAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJkcmF3YmFyX29yZ2FuXCI6e1wibmFtZVwiOlwiMTcgRHJhd2JhciBPcmdhbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGVyY3Vzc2l2ZV9vcmdhblwiOntcIm5hbWVcIjpcIjE4IFBlcmN1c3NpdmUgT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJvY2tfb3JnYW5cIjp7XCJuYW1lXCI6XCIxOSBSb2NrIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjaHVyY2hfb3JnYW5cIjp7XCJuYW1lXCI6XCIyMCBDaHVyY2ggT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJlZWRfb3JnYW5cIjp7XCJuYW1lXCI6XCIyMSBSZWVkIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY2NvcmRpb25cIjp7XCJuYW1lXCI6XCIyMiBBY2NvcmRpb24gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhhcm1vbmljYVwiOntcIm5hbWVcIjpcIjIzIEhhcm1vbmljYSAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGFuZ29fYWNjb3JkaW9uXCI6e1wibmFtZVwiOlwiMjQgVGFuZ28gQWNjb3JkaW9uIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY291c3RpY19ndWl0YXJfbnlsb25cIjp7XCJuYW1lXCI6XCIyNSBBY291c3RpYyBHdWl0YXIgKG55bG9uKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFjb3VzdGljX2d1aXRhcl9zdGVlbFwiOntcIm5hbWVcIjpcIjI2IEFjb3VzdGljIEd1aXRhciAoc3RlZWwpIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfZ3VpdGFyX2phenpcIjp7XCJuYW1lXCI6XCIyNyBFbGVjdHJpYyBHdWl0YXIgKGphenopIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfZ3VpdGFyX2NsZWFuXCI6e1wibmFtZVwiOlwiMjggRWxlY3RyaWMgR3VpdGFyIChjbGVhbikgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ndWl0YXJfbXV0ZWRcIjp7XCJuYW1lXCI6XCIyOSBFbGVjdHJpYyBHdWl0YXIgKG11dGVkKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm92ZXJkcml2ZW5fZ3VpdGFyXCI6e1wibmFtZVwiOlwiMzAgT3ZlcmRyaXZlbiBHdWl0YXIgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJkaXN0b3J0aW9uX2d1aXRhclwiOntcIm5hbWVcIjpcIjMxIERpc3RvcnRpb24gR3VpdGFyIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3VpdGFyX2hhcm1vbmljc1wiOntcIm5hbWVcIjpcIjMyIEd1aXRhciBIYXJtb25pY3MgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY291c3RpY19iYXNzXCI6e1wibmFtZVwiOlwiMzMgQWNvdXN0aWMgQmFzcyAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19iYXNzX2ZpbmdlclwiOntcIm5hbWVcIjpcIjM0IEVsZWN0cmljIEJhc3MgKGZpbmdlcikgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfYmFzc19waWNrXCI6e1wibmFtZVwiOlwiMzUgRWxlY3RyaWMgQmFzcyAocGljaykgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnJldGxlc3NfYmFzc1wiOntcIm5hbWVcIjpcIjM2IEZyZXRsZXNzIEJhc3MgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2xhcF9iYXNzXzFcIjp7XCJuYW1lXCI6XCIzNyBTbGFwIEJhc3MgMSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzbGFwX2Jhc3NfMlwiOntcIm5hbWVcIjpcIjM4IFNsYXAgQmFzcyAyIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2Jhc3NfMVwiOntcIm5hbWVcIjpcIjM5IFN5bnRoIEJhc3MgMSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9iYXNzXzJcIjp7XCJuYW1lXCI6XCI0MCBTeW50aCBCYXNzIDIgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidmlvbGluXCI6e1wibmFtZVwiOlwiNDEgVmlvbGluIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInZpb2xhXCI6e1wibmFtZVwiOlwiNDIgVmlvbGEgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2VsbG9cIjp7XCJuYW1lXCI6XCI0MyBDZWxsbyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjb250cmFiYXNzXCI6e1wibmFtZVwiOlwiNDQgQ29udHJhYmFzcyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0cmVtb2xvX3N0cmluZ3NcIjp7XCJuYW1lXCI6XCI0NSBUcmVtb2xvIFN0cmluZ3MgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGl6emljYXRvX3N0cmluZ3NcIjp7XCJuYW1lXCI6XCI0NiBQaXp6aWNhdG8gU3RyaW5ncyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJvcmNoZXN0cmFsX2hhcnBcIjp7XCJuYW1lXCI6XCI0NyBPcmNoZXN0cmFsIEhhcnAgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGltcGFuaVwiOntcIm5hbWVcIjpcIjQ4IFRpbXBhbmkgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RyaW5nX2Vuc2VtYmxlXzFcIjp7XCJuYW1lXCI6XCI0OSBTdHJpbmcgRW5zZW1ibGUgMSAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RyaW5nX2Vuc2VtYmxlXzJcIjp7XCJuYW1lXCI6XCI1MCBTdHJpbmcgRW5zZW1ibGUgMiAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfc3RyaW5nc18xXCI6e1wibmFtZVwiOlwiNTEgU3ludGggU3RyaW5ncyAxIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9zdHJpbmdzXzJcIjp7XCJuYW1lXCI6XCI1MiBTeW50aCBTdHJpbmdzIDIgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNob2lyX2FhaHNcIjp7XCJuYW1lXCI6XCI1MyBDaG9pciBBYWhzIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2b2ljZV9vb2hzXCI6e1wibmFtZVwiOlwiNTQgVm9pY2UgT29ocyAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfY2hvaXJcIjp7XCJuYW1lXCI6XCI1NSBTeW50aCBDaG9pciAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib3JjaGVzdHJhX2hpdFwiOntcIm5hbWVcIjpcIjU2IE9yY2hlc3RyYSBIaXQgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRydW1wZXRcIjp7XCJuYW1lXCI6XCI1NyBUcnVtcGV0IChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0cm9tYm9uZVwiOntcIm5hbWVcIjpcIjU4IFRyb21ib25lIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0dWJhXCI6e1wibmFtZVwiOlwiNTkgVHViYSAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibXV0ZWRfdHJ1bXBldFwiOntcIm5hbWVcIjpcIjYwIE11dGVkIFRydW1wZXQgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZyZW5jaF9ob3JuXCI6e1wibmFtZVwiOlwiNjEgRnJlbmNoIEhvcm4gKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJyYXNzX3NlY3Rpb25cIjp7XCJuYW1lXCI6XCI2MiBCcmFzcyBTZWN0aW9uIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9icmFzc18xXCI6e1wibmFtZVwiOlwiNjMgU3ludGggQnJhc3MgMSAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfYnJhc3NfMlwiOntcIm5hbWVcIjpcIjY0IFN5bnRoIEJyYXNzIDIgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNvcHJhbm9fc2F4XCI6e1wibmFtZVwiOlwiNjUgU29wcmFubyBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWx0b19zYXhcIjp7XCJuYW1lXCI6XCI2NiBBbHRvIFNheCAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0ZW5vcl9zYXhcIjp7XCJuYW1lXCI6XCI2NyBUZW5vciBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFyaXRvbmVfc2F4XCI6e1wibmFtZVwiOlwiNjggQmFyaXRvbmUgU2F4IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9ib2VcIjp7XCJuYW1lXCI6XCI2OSBPYm9lIChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVuZ2xpc2hfaG9yblwiOntcIm5hbWVcIjpcIjcwIEVuZ2xpc2ggSG9ybiAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiYXNzb29uXCI6e1wibmFtZVwiOlwiNzEgQmFzc29vbiAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjbGFyaW5ldFwiOntcIm5hbWVcIjpcIjcyIENsYXJpbmV0IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBpY2NvbG9cIjp7XCJuYW1lXCI6XCI3MyBQaWNjb2xvIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZsdXRlXCI6e1wibmFtZVwiOlwiNzQgRmx1dGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicmVjb3JkZXJcIjp7XCJuYW1lXCI6XCI3NSBSZWNvcmRlciAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYW5fZmx1dGVcIjp7XCJuYW1lXCI6XCI3NiBQYW4gRmx1dGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmxvd25fYm90dGxlXCI6e1wibmFtZVwiOlwiNzcgQmxvd24gQm90dGxlIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNoYWt1aGFjaGlcIjp7XCJuYW1lXCI6XCI3OCBTaGFrdWhhY2hpIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIndoaXN0bGVcIjp7XCJuYW1lXCI6XCI3OSBXaGlzdGxlIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9jYXJpbmFcIjp7XCJuYW1lXCI6XCI4MCBPY2FyaW5hIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfMV9zcXVhcmVcIjp7XCJuYW1lXCI6XCI4MSBMZWFkIDEgKHNxdWFyZSkgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzJfc2F3dG9vdGhcIjp7XCJuYW1lXCI6XCI4MiBMZWFkIDIgKHNhd3Rvb3RoKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfM19jYWxsaW9wZVwiOntcIm5hbWVcIjpcIjgzIExlYWQgMyAoY2FsbGlvcGUpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF80X2NoaWZmXCI6e1wibmFtZVwiOlwiODQgTGVhZCA0IChjaGlmZikgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzVfY2hhcmFuZ1wiOntcIm5hbWVcIjpcIjg1IExlYWQgNSAoY2hhcmFuZykgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzZfdm9pY2VcIjp7XCJuYW1lXCI6XCI4NiBMZWFkIDYgKHZvaWNlKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfN19maWZ0aHNcIjp7XCJuYW1lXCI6XCI4NyBMZWFkIDcgKGZpZnRocykgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzhfYmFzc19fbGVhZFwiOntcIm5hbWVcIjpcIjg4IExlYWQgOCAoYmFzcyArIGxlYWQpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzFfbmV3X2FnZVwiOntcIm5hbWVcIjpcIjg5IFBhZCAxIChuZXcgYWdlKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzJfd2FybVwiOntcIm5hbWVcIjpcIjkwIFBhZCAyICh3YXJtKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzNfcG9seXN5bnRoXCI6e1wibmFtZVwiOlwiOTEgUGFkIDMgKHBvbHlzeW50aCkgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF80X2Nob2lyXCI6e1wibmFtZVwiOlwiOTIgUGFkIDQgKGNob2lyKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzVfYm93ZWRcIjp7XCJuYW1lXCI6XCI5MyBQYWQgNSAoYm93ZWQpIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfNl9tZXRhbGxpY1wiOntcIm5hbWVcIjpcIjk0IFBhZCA2IChtZXRhbGxpYykgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF83X2hhbG9cIjp7XCJuYW1lXCI6XCI5NSBQYWQgNyAoaGFsbykgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF84X3N3ZWVwXCI6e1wibmFtZVwiOlwiOTYgUGFkIDggKHN3ZWVwKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfMV9yYWluXCI6e1wibmFtZVwiOlwiOTcgRlggMSAocmFpbikgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF8yX3NvdW5kdHJhY2tcIjp7XCJuYW1lXCI6XCI5OCBGWCAyIChzb3VuZHRyYWNrKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzNfY3J5c3RhbFwiOntcIm5hbWVcIjpcIjk5IEZYIDMgKGNyeXN0YWwpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNF9hdG1vc3BoZXJlXCI6e1wibmFtZVwiOlwiMTAwIEZYIDQgKGF0bW9zcGhlcmUpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNV9icmlnaHRuZXNzXCI6e1wibmFtZVwiOlwiMTAxIEZYIDUgKGJyaWdodG5lc3MpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNl9nb2JsaW5zXCI6e1wibmFtZVwiOlwiMTAyIEZYIDYgKGdvYmxpbnMpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfN19lY2hvZXNcIjp7XCJuYW1lXCI6XCIxMDMgRlggNyAoZWNob2VzKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4Xzhfc2NpZmlcIjp7XCJuYW1lXCI6XCIxMDQgRlggOCAoc2NpLWZpKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNpdGFyXCI6e1wibmFtZVwiOlwiMTA1IFNpdGFyIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFuam9cIjp7XCJuYW1lXCI6XCIxMDYgQmFuam8gKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzaGFtaXNlblwiOntcIm5hbWVcIjpcIjEwNyBTaGFtaXNlbiAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImtvdG9cIjp7XCJuYW1lXCI6XCIxMDggS290byAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImthbGltYmFcIjp7XCJuYW1lXCI6XCIxMDkgS2FsaW1iYSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJhZ3BpcGVcIjp7XCJuYW1lXCI6XCIxMTAgQmFncGlwZSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZpZGRsZVwiOntcIm5hbWVcIjpcIjExMSBGaWRkbGUgKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzaGFuYWlcIjp7XCJuYW1lXCI6XCIxMTIgU2hhbmFpIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGlua2xlX2JlbGxcIjp7XCJuYW1lXCI6XCIxMTMgVGlua2xlIEJlbGwgKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWdvZ29cIjp7XCJuYW1lXCI6XCIxMTQgQWdvZ28gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RlZWxfZHJ1bXNcIjp7XCJuYW1lXCI6XCIxMTUgU3RlZWwgRHJ1bXMgKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwid29vZGJsb2NrXCI6e1wibmFtZVwiOlwiMTE2IFdvb2RibG9jayAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0YWlrb19kcnVtXCI6e1wibmFtZVwiOlwiMTE3IFRhaWtvIERydW0gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibWVsb2RpY190b21cIjp7XCJuYW1lXCI6XCIxMTggTWVsb2RpYyBUb20gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfZHJ1bVwiOntcIm5hbWVcIjpcIjExOSBTeW50aCBEcnVtIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJldmVyc2VfY3ltYmFsXCI6e1wibmFtZVwiOlwiMTIwIFJldmVyc2UgQ3ltYmFsIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3VpdGFyX2ZyZXRfbm9pc2VcIjp7XCJuYW1lXCI6XCIxMjEgR3VpdGFyIEZyZXQgTm9pc2UgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJicmVhdGhfbm9pc2VcIjp7XCJuYW1lXCI6XCIxMjIgQnJlYXRoIE5vaXNlIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2Vhc2hvcmVcIjp7XCJuYW1lXCI6XCIxMjMgU2Vhc2hvcmUgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiaXJkX3R3ZWV0XCI6e1wibmFtZVwiOlwiMTI0IEJpcmQgVHdlZXQgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0ZWxlcGhvbmVfcmluZ1wiOntcIm5hbWVcIjpcIjEyNSBUZWxlcGhvbmUgUmluZyAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhlbGljb3B0ZXJcIjp7XCJuYW1lXCI6XCIxMjYgSGVsaWNvcHRlciAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFwcGxhdXNlXCI6e1wibmFtZVwiOlwiMTI3IEFwcGxhdXNlIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3Vuc2hvdFwiOntcIm5hbWVcIjpcIjEyOCBHdW5zaG90IChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9fVxubGV0IGdtTWFwID0gbmV3IE1hcCgpXG5PYmplY3Qua2V5cyhnbUluc3RydW1lbnRzKS5mb3JFYWNoKGtleSA9PiB7XG4gIGdtTWFwLnNldChrZXksIGdtSW5zdHJ1bWVudHNba2V5XSlcbn0pXG5leHBvcnQgY29uc3QgZ2V0R01JbnN0cnVtZW50cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBnbU1hcFxufVxuIiwiLy9AIGZsb3dcblxuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQge3BhcnNlVGltZUV2ZW50cywgcGFyc2VFdmVudHMsIHBhcnNlTUlESU5vdGVzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbi8vaW1wb3J0IHthZGRUYXNrLCByZW1vdmVUYXNrfSBmcm9tICcuL2hlYXJ0YmVhdCdcbmltcG9ydCB7Y29udGV4dCwgbWFzdGVyR2Fpbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlcidcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge3NvbmdGcm9tTUlESUZpbGUsIHNvbmdGcm9tTUlESUZpbGVBc3luY30gZnJvbSAnLi9zb25nX2Zyb21fbWlkaWZpbGUnXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y2FsY3VsYXRlUG9zaXRpb259IGZyb20gJy4vcG9zaXRpb24nXG5pbXBvcnQge1BsYXloZWFkfSBmcm9tICcuL3BsYXloZWFkJ1xuaW1wb3J0IHtNZXRyb25vbWV9IGZyb20gJy4vbWV0cm9ub21lJ1xuaW1wb3J0IHthZGRFdmVudExpc3RlbmVyLCByZW1vdmVFdmVudExpc3RlbmVyLCBkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5pbXBvcnQge2RlZmF1bHRTb25nfSBmcm9tICcuL3NldHRpbmdzJ1xuaW1wb3J0IHtzYXZlQXNNSURJRmlsZX0gZnJvbSAnLi9zYXZlX21pZGlmaWxlJ1xuXG5sZXQgc29uZ0luZGV4ID0gMFxubGV0IHJlY29yZGluZ0luZGV4ID0gMFxuXG5cbi8qXG50eXBlIHNvbmdTZXR0aW5ncyA9IHtcbiAgbmFtZTogc3RyaW5nLFxuICBwcHE6IG51bWJlcixcbiAgYnBtOiBudW1iZXIsXG4gIGJhcnM6IG51bWJlcixcbiAgbG93ZXN0Tm90ZTogbnVtYmVyLFxuICBoaWdoZXN0Tm90ZTogbnVtYmVyLFxuICBub21pbmF0b3I6IG51bWJlcixcbiAgZGVub21pbmF0b3I6IG51bWJlcixcbiAgcXVhbnRpemVWYWx1ZTogbnVtYmVyLFxuICBmaXhlZExlbmd0aFZhbHVlOiBudW1iZXIsXG4gIHBvc2l0aW9uVHlwZTogc3RyaW5nLFxuICB1c2VNZXRyb25vbWU6IGJvb2xlYW4sXG4gIGF1dG9TaXplOiBib29sZWFuLFxuICBsb29wOiBib29sZWFuLFxuICBwbGF5YmFja1NwZWVkOiBudW1iZXIsXG4gIGF1dG9RdWFudGl6ZTogYm9vbGVhblxufVxuKi9cblxuZXhwb3J0IGNsYXNzIFNvbmd7XG5cbiAgc3RhdGljIGZyb21NSURJRmlsZShkYXRhKXtcbiAgICByZXR1cm4gc29uZ0Zyb21NSURJRmlsZShkYXRhKVxuICB9XG5cbiAgc3RhdGljIGZyb21NSURJRmlsZUFzeW5jKGRhdGEpe1xuICAgIHJldHVybiBzb25nRnJvbU1JRElGaWxlQXN5bmMoZGF0YSlcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzOiB7fSA9IHt9KXtcblxuICAgIHRoaXMuaWQgPSBgU18ke3NvbmdJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWA7XG5cbiAgICAoe1xuICAgICAgbmFtZTogdGhpcy5uYW1lID0gdGhpcy5pZCxcbiAgICAgIHBwcTogdGhpcy5wcHEgPSBkZWZhdWx0U29uZy5wcHEsXG4gICAgICBicG06IHRoaXMuYnBtID0gZGVmYXVsdFNvbmcuYnBtLFxuICAgICAgYmFyczogdGhpcy5iYXJzID0gZGVmYXVsdFNvbmcuYmFycyxcbiAgICAgIG5vbWluYXRvcjogdGhpcy5ub21pbmF0b3IgPSBkZWZhdWx0U29uZy5ub21pbmF0b3IsXG4gICAgICBkZW5vbWluYXRvcjogdGhpcy5kZW5vbWluYXRvciA9IGRlZmF1bHRTb25nLmRlbm9taW5hdG9yLFxuICAgICAgcXVhbnRpemVWYWx1ZTogdGhpcy5xdWFudGl6ZVZhbHVlID0gZGVmYXVsdFNvbmcucXVhbnRpemVWYWx1ZSxcbiAgICAgIGZpeGVkTGVuZ3RoVmFsdWU6IHRoaXMuZml4ZWRMZW5ndGhWYWx1ZSA9IGRlZmF1bHRTb25nLmZpeGVkTGVuZ3RoVmFsdWUsXG4gICAgICB1c2VNZXRyb25vbWU6IHRoaXMudXNlTWV0cm9ub21lID0gZGVmYXVsdFNvbmcudXNlTWV0cm9ub21lLFxuICAgICAgYXV0b1NpemU6IHRoaXMuYXV0b1NpemUgPSBkZWZhdWx0U29uZy5hdXRvU2l6ZSxcbiAgICAgIHBsYXliYWNrU3BlZWQ6IHRoaXMucGxheWJhY2tTcGVlZCA9IGRlZmF1bHRTb25nLnBsYXliYWNrU3BlZWQsXG4gICAgICBhdXRvUXVhbnRpemU6IHRoaXMuYXV0b1F1YW50aXplID0gZGVmYXVsdFNvbmcuYXV0b1F1YW50aXplLFxuICAgIH0gPSBzZXR0aW5ncyk7XG5cbiAgICB0aGlzLl90aW1lRXZlbnRzID0gW1xuICAgICAgbmV3IE1JRElFdmVudCgwLCBNSURJRXZlbnRUeXBlcy5URU1QTywgdGhpcy5icG0pLFxuICAgICAgbmV3IE1JRElFdmVudCgwLCBNSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSwgdGhpcy5ub21pbmF0b3IsIHRoaXMuZGVub21pbmF0b3IpLFxuICAgIF1cblxuICAgIC8vdGhpcy5fdGltZUV2ZW50cyA9IFtdXG4gICAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IHRydWVcbiAgICB0aGlzLl9sYXN0RXZlbnQgPSBuZXcgTUlESUV2ZW50KDAsIE1JRElFdmVudFR5cGVzLkVORF9PRl9UUkFDSylcbiAgICAvL3RoaXMuX2xhc3RFdmVudC5fcGFydCA9IHt9XG4gICAgLy90aGlzLl9sYXN0RXZlbnQuX3RyYWNrID0ge31cblxuICAgIHRoaXMuX3RyYWNrcyA9IFtdXG4gICAgdGhpcy5fdHJhY2tzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fZXZlbnRzID0gW11cbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9hbGxFdmVudHMgPSBbXSAvLyBNSURJIGV2ZW50cyBhbmQgbWV0cm9ub21lIGV2ZW50c1xuXG4gICAgdGhpcy5fbm90ZXMgPSBbXVxuICAgIHRoaXMuX25vdGVzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fbmV3RXZlbnRzID0gW11cbiAgICB0aGlzLl9tb3ZlZEV2ZW50cyA9IFtdXG4gICAgdGhpcy5fcmVtb3ZlZEV2ZW50cyA9IFtdXG4gICAgdGhpcy5fdHJhbnNwb3NlZEV2ZW50cyA9IFtdXG5cbiAgICB0aGlzLl9uZXdQYXJ0cyA9IFtdXG4gICAgdGhpcy5fY2hhbmdlZFBhcnRzID0gW11cbiAgICB0aGlzLl9yZW1vdmVkUGFydHMgPSBbXVxuXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDBcbiAgICB0aGlzLl9zY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKHRoaXMpXG4gICAgdGhpcy5fcGxheWhlYWQgPSBuZXcgUGxheWhlYWQodGhpcylcblxuICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZVxuICAgIHRoaXMucmVjb3JkaW5nID0gZmFsc2VcbiAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2VcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlXG5cbiAgICB0aGlzLnZvbHVtZSA9IDAuNVxuICAgIHRoaXMuX291dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5fb3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuX291dHB1dC5jb25uZWN0KG1hc3RlckdhaW4pXG5cbiAgICB0aGlzLl9tZXRyb25vbWUgPSBuZXcgTWV0cm9ub21lKHRoaXMpXG4gICAgdGhpcy5fbWV0cm9ub21lRXZlbnRzID0gW11cbiAgICB0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlXG4gICAgdGhpcy5fbWV0cm9ub21lLm11dGUoIXRoaXMudXNlTWV0cm9ub21lKVxuXG4gICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IGZhbHNlXG4gICAgdGhpcy5fbG9vcER1cmF0aW9uID0gMFxuICAgIHRoaXMuX3ByZWNvdW50QmFycyA9IDBcbiAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcbiAgICAvL3RoaXMudXBkYXRlKClcblxuICAgIHRoaXMuX2luZGV4ID0gMFxuICB9XG5cblxuICBfZ2V0RXZlbnRzKG1heHRpbWUsIHRpbWVTdGFtcCl7XG4gICAgbGV0IHJlc3VsdCA9IFtdXG5cbiAgICAvL2NvbnNvbGUubG9nKG1heHRpbWUpXG4gICAgZm9yKGxldCBpID0gdGhpcy5faW5kZXgsIG1heGkgPSB0aGlzLl9hbGxFdmVudHMubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKXtcblxuICAgICAgbGV0IGV2ZW50ID0gdGhpcy5fYWxsRXZlbnRzW2ldXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2luZGV4LCBldmVudClcblxuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVEVNUE8gfHwgZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUpe1xuICAgICAgICBpZihldmVudC5taWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICB0aGlzLm1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrXG4gICAgICAgICAgdGhpcy5faW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG5cbiAgICAgIH1lbHNle1xuICAgICAgICBsZXQgbWlsbGlzID0gZXZlbnQudGlja3MgKiB0aGlzLm1pbGxpc1BlclRpY2tcbiAgICAgICAgaWYobWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgZXZlbnQudGltZSA9IG1pbGxpcyArIHRpbWVTdGFtcFxuICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgICAgICAgIHRoaXMuX2luZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBzb3J0RXZlbnRzKHJlc3VsdClcbiAgICByZXR1cm4gcmVzdWx0XG5cbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIC8vY29uc29sZS5sb2codGhpcy5fZXZlbnRzKVxuICAgIGlmKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMpe1xuICAgICAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IGZhbHNlXG4gICAgICB0aGlzLl91cGRhdGVFdmVudHMgPSB0cnVlXG4gICAgICBwYXJzZVRpbWVFdmVudHModGhpcywgdGhpcy5fdGltZUV2ZW50cylcbiAgICAgIHRoaXMuX21ldHJvbm9tZS5nZXRFdmVudHMoKVxuICAgIH1cbiAgICBpZih0aGlzLl91cGRhdGVFdmVudHMpe1xuICAgICAgcGFyc2VNSURJTm90ZXModGhpcy5fZXZlbnRzKVxuICAgICAgLy90aGlzLl9hbGxFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMsIC4uLnRoaXMuX3RpbWVFdmVudHMpXG4gICAgICAvL3NvcnRFdmVudHModGhpcy5fYWxsRXZlbnRzKVxuICAgICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgICBjb25zb2xlLmxvZygndXBkYXRlJylcbiAgICAgIGxldCBsYXN0RXZlbnQgPSB0aGlzLl9ldmVudHNbdGhpcy5fZXZlbnRzLmxlbmd0aCAtIDFdXG4gICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbigndGlja3MnLCBsYXN0RXZlbnQudGlja3MsICdtaWxsaXMnKVxuICAgICAgdGhpcy5fbGFzdEV2ZW50LnRpY2tzID0gbGFzdEV2ZW50LnRpY2tzXG4gICAgICB0aGlzLl9kdXJhdGlvbk1pbGxpcyA9IHBvc2l0aW9uLm1pbGxpc1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHBvc2l0aW9uLCBsYXN0RXZlbnQsIHRoaXMuX2R1cmF0aW9uTWlsbGlzKVxuICB9XG5cbiAgYWRkVGltZUV2ZW50cyguLi5ldmVudHMpe1xuICAgIC8vQFRPRE86IGZpbHRlciB0aW1lIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrIC0+IHVzZSB0aGUgbGFzdGx5IGFkZGVkIGV2ZW50c1xuICAgIGV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGlmKGV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLlRJTUVfU0lHTkFUVVJFKXtcbiAgICAgICAgdGhpcy5fdXBkYXRlTWV0cm9ub21lRXZlbnRzID0gdHJ1ZVxuICAgICAgfVxuICAgICAgdGhpcy5fdGltZUV2ZW50cy5wdXNoKGV2ZW50KVxuICAgIH0pXG4gICAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IHRydWVcbiAgfVxuXG4gIGFkZFRyYWNrcyguLi50cmFja3Mpe1xuICAgIHRyYWNrcy5mb3JFYWNoKCh0cmFjaykgPT4ge1xuICAgICAgdHJhY2suX3NvbmcgPSB0aGlzXG4gICAgICB0cmFjay5jb25uZWN0KHRoaXMuX291dHB1dClcbiAgICAgIHRoaXMuX3RyYWNrcy5wdXNoKHRyYWNrKVxuICAgICAgdGhpcy5fdHJhY2tzQnlJZC5zZXQodHJhY2suaWQsIHRyYWNrKVxuICAgICAgdGhpcy5fZXZlbnRzLnB1c2goLi4udHJhY2suX2V2ZW50cylcbiAgICB9KVxuICB9XG5cbiAgLy8gcHJlcGFyZSBzb25nIGV2ZW50cyBmb3IgcGxheWJhY2tcbiAgdXBkYXRlXygpOiB2b2lke1xuXG4gICAgbGV0IGNyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuXG4gICAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gZmFsc2VcbiAgICAgICYmIHRoaXMuX3JlbW92ZWRFdmVudHMubGVuZ3RoID09PSAwXG4gICAgICAmJiB0aGlzLl9uZXdFdmVudHMubGVuZ3RoID09PSAwXG4gICAgICAmJiB0aGlzLl9tb3ZlZEV2ZW50cy5sZW5ndGggPT09IDBcbiAgICAgICYmIHRoaXMuX25ld1BhcnRzLmxlbmd0aCA9PT0gMFxuICAgICAgJiYgdGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA9PT0gMFxuICAgICAgJiYgdGhpcy5fcmVzaXplZCA9PT0gZmFsc2VcbiAgICApe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vZGVidWdcbiAgICAvL3RoaXMuaXNQbGF5aW5nID0gdHJ1ZVxuXG4gICAgY29uc29sZS5ncm91cCgndXBkYXRlIHNvbmcnKVxuICAgIGNvbnNvbGUudGltZSgndG90YWwnKVxuXG4gICAgLy8gY2hlY2sgaWYgdGltZSBldmVudHMgYXJlIHVwZGF0ZWRcbiAgICBpZih0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSB0cnVlKXtcbiAgICAgIC8vY29uc29sZS5sb2coJ3VwZGF0ZVRpbWVFdmVudHMnLCB0aGlzLl90aW1lRXZlbnRzLmxlbmd0aClcbiAgICAgIHBhcnNlVGltZUV2ZW50cyh0aGlzLCB0aGlzLl90aW1lRXZlbnRzLCB0aGlzLmlzUGxheWluZylcbiAgICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSBmYWxzZVxuICAgICAgY29uc29sZS5sb2coJ3RpbWUgZXZlbnRzICVPJywgdGhpcy5fdGltZUV2ZW50cylcbiAgICB9XG5cbiAgICAvLyBvbmx5IHBhcnNlIG5ldyBhbmQgbW92ZWQgZXZlbnRzXG4gICAgbGV0IHRvYmVQYXJzZWQgPSBbXVxuXG5cbiAgICAvLyBmaWx0ZXIgcmVtb3ZlZCBwYXJ0c1xuICAgIGNvbnNvbGUubG9nKCdyZW1vdmVkIHBhcnRzICVPJywgdGhpcy5fcmVtb3ZlZFBhcnRzKVxuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICB0aGlzLl9wYXJ0c0J5SWQuZGVsZXRlKHBhcnQuaWQpXG4gICAgICB0aGlzLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4ucGFydC5fZXZlbnRzKVxuICAgIH0pXG5cblxuICAgIC8vIGFkZCBuZXcgcGFydHNcbiAgICBjb25zb2xlLmxvZygnbmV3IHBhcnRzICVPJywgdGhpcy5fbmV3UGFydHMpXG4gICAgdGhpcy5fbmV3UGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgcGFydC5fc29uZyA9IHRoaXNcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5zZXQocGFydC5pZCwgcGFydClcbiAgICAgIC8vdGhpcy5fbmV3RXZlbnRzLnB1c2goLi4ucGFydC5fZXZlbnRzKVxuICAgICAgcGFydC51cGRhdGUoKVxuICAgIH0pXG5cblxuICAgIC8vIHVwZGF0ZSBjaGFuZ2VkIHBhcnRzXG4gICAgY29uc29sZS5sb2coJ2NoYW5nZWQgcGFydHMgJU8nLCB0aGlzLl9jaGFuZ2VkUGFydHMpXG4gICAgdGhpcy5fY2hhbmdlZFBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIHBhcnQudXBkYXRlKClcbiAgICB9KVxuXG4gICAgLy8gcmVtb3ZlIGV2ZW50cyBmcm9tIHJlbW92ZWQgcGFydHNcbiAgICBjb25zb2xlLmxvZygnY2hhbmdlZCBwYXJ0cyAlTycsIHRoaXMuX2NoYW5nZWRQYXJ0cylcbiAgICB0aGlzLl9yZW1vdmVkUGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgdGhpcy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLnBhcnQuX2V2ZW50cylcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZClcbiAgICAgIHBhcnQudXBkYXRlKClcbiAgICB9KVxuXG4gICAgaWYodGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA+IDApe1xuICAgICAgdGhpcy5fcGFydHMgPSBBcnJheS5mcm9tKHRoaXMuX3BhcnRzQnlJZC52YWx1ZXMoKSlcbiAgICB9XG5cblxuICAgIC8vIGZpbHRlciByZW1vdmVkIGV2ZW50c1xuICAgIGNvbnNvbGUubG9nKCdyZW1vdmVkIGV2ZW50cyAlTycsIHRoaXMuX3JlbW92ZWRFdmVudHMpXG4gICAgdGhpcy5fcmVtb3ZlZEV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgdGhpcy5fbm90ZXNCeUlkLmRlbGV0ZShldmVudC5taWRpTm90ZS5pZClcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICAgIH0pXG5cbiAgICBjcmVhdGVFdmVudEFycmF5ID0gdGhpcy5fcmVtb3ZlZEV2ZW50cy5sZW5ndGggPiAwXG5cbiAgICAvLyBhZGQgbmV3IGV2ZW50c1xuICAgIGNvbnNvbGUubG9nKCduZXcgZXZlbnRzICVPJywgdGhpcy5fbmV3RXZlbnRzKVxuICAgIHRoaXMuX25ld0V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5zZXQoZXZlbnQuaWQsIGV2ZW50KVxuICAgICAgdGhpcy5fZXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpXG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmlkKVxuICAgIH0pXG5cbiAgICAvLyBtb3ZlZCBldmVudHMgbmVlZCB0byBiZSBwYXJzZWRcbiAgICBjb25zb2xlLmxvZygnbW92ZWQgJU8nLCB0aGlzLl9tb3ZlZEV2ZW50cylcbiAgICB0aGlzLl9tb3ZlZEV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgdG9iZVBhcnNlZC5wdXNoKGV2ZW50KVxuICAgIH0pXG5cbiAgICAvL3RvYmVQYXJzZWQgPSBbLi4udG9iZVBhcnNlZCwgLi4uQXJyYXkuZnJvbShzb25nLm1vdmVkRXZlbnRzLnZhbHVlcygpKV1cblxuICAgIGNvbnNvbGUudGltZSgncGFyc2UnKVxuICAgIGlmKHRvYmVQYXJzZWQubGVuZ3RoID4gMCl7XG4gICAgICAvL2NvbnNvbGUubG9nKCd0b2JlUGFyc2VkICVPJywgdG9iZVBhcnNlZClcbiAgICAgIHRvYmVQYXJzZWQgPSBbLi4udG9iZVBhcnNlZCwgLi4udGhpcy5fdGltZUV2ZW50c11cbiAgICAgIGNvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycsIHRvYmVQYXJzZWQubGVuZ3RoIC0gdGhpcy5fdGltZUV2ZW50cy5sZW5ndGgpXG4gICAgICBwYXJzZUV2ZW50cyh0b2JlUGFyc2VkLCB0aGlzLmlzUGxheWluZylcbiAgICAgIHRvYmVQYXJzZWQuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuaWQsIGV2ZW50LnR5cGUsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICBpZihldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5OT1RFX09OKXtcbiAgICAgICAgICBpZihldmVudC5taWRpTm90ZSl7XG4gICAgICAgICAgICB0aGlzLl9ub3Rlc0J5SWQuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkLCBldmVudC50eXBlKVxuICAgICAgICAgICAgLy90aGlzLl9ub3Rlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRoaXMuX25vdGVzID0gQXJyYXkuZnJvbSh0aGlzLl9ub3Rlc0J5SWQudmFsdWVzKCkpXG4gICAgfVxuICAgIGNvbnNvbGUudGltZUVuZCgncGFyc2UnKVxuXG5cbiAgICBpZihjcmVhdGVFdmVudEFycmF5KXtcbiAgICAgIGNvbnNvbGUudGltZSgndG8gYXJyYXknKVxuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fbm90ZXMgPSBBcnJheS5mcm9tKHRoaXMuX25vdGVzQnlJZC52YWx1ZXMoKSlcbiAgICAgIGNvbnNvbGUudGltZUVuZCgndG8gYXJyYXknKVxuICAgIH1cbiAgICAvL2RlYnVnZ2VyXG5cbiAgICBjb25zb2xlLnRpbWUoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuICAgIHNvcnRFdmVudHModGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX25vdGVzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gYS5ub3RlT24udGlja3MgLSBiLm5vdGVPbi50aWNrc1xuICAgIH0pXG4gICAgY29uc29sZS50aW1lRW5kKGBzb3J0aW5nICR7dGhpcy5fZXZlbnRzLmxlbmd0aH0gZXZlbnRzYClcblxuICAgIGNvbnNvbGUubG9nKCdub3RlcyAlTycsIHRoaXMuX25vdGVzKVxuXG4gICAgY29uc29sZS50aW1lRW5kKCd0b3RhbCcpXG4gICAgY29uc29sZS50aW1lRW5kKCd1cGRhdGUgc29uZycpXG5cblxuICAgIC8vIGdldCB0aGUgbGFzdCBldmVudCBvZiB0aGlzIHNvbmdcbiAgICBsZXQgbGFzdEV2ZW50ID0gdGhpcy5fZXZlbnRzW3RoaXMuX2V2ZW50cy5sZW5ndGggLSAxXVxuICAgIGxldCBsYXN0VGltZUV2ZW50ID0gdGhpcy5fdGltZUV2ZW50c1t0aGlzLl90aW1lRXZlbnRzLmxlbmd0aCAtIDFdXG4gICAgaWYobGFzdEV2ZW50IGluc3RhbmNlb2YgTUlESUV2ZW50ID09PSBmYWxzZSl7XG4gICAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50XG4gICAgfWVsc2UgaWYobGFzdFRpbWVFdmVudC50aWNrcyA+IGxhc3RFdmVudC50aWNrcyl7XG4gICAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50XG4gICAgfVxuXG4gICAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBkYXRhIG9mIHRoZSBmaXJzdCBiZWF0IGluIHRoZSBiYXIgYWZ0ZXIgdGhlIGxhc3QgYmFyXG4gICAgdGhpcy5iYXJzID0gTWF0aC5tYXgobGFzdEV2ZW50LmJhciwgdGhpcy5iYXJzKVxuICAgIC8vY29uc29sZS5sb2coJ251bSBiYXJzJywgdGhpcy5iYXJzLCBsYXN0RXZlbnQpXG4gICAgbGV0IHRpY2tzID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcywge1xuICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICB0YXJnZXQ6IFt0aGlzLmJhcnMgKyAxXSxcbiAgICAgIHJlc3VsdDogJ3RpY2tzJ1xuICAgIH0pLnRpY2tzXG5cbiAgICAvLyB3ZSB3YW50IHRvIHB1dCB0aGUgRU5EX09GX1RSQUNLIGV2ZW50IGF0IHRoZSB2ZXJ5IGxhc3QgdGljayBvZiB0aGUgbGFzdCBiYXIsIHNvIHdlIGNhbGN1bGF0ZSB0aGF0IHBvc2l0aW9uXG4gICAgbGV0IG1pbGxpcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIHtcbiAgICAgIHR5cGU6ICd0aWNrcycsXG4gICAgICB0YXJnZXQ6IHRpY2tzIC0gMSxcbiAgICAgIHJlc3VsdDogJ21pbGxpcydcbiAgICB9KS5taWxsaXNcblxuICAgIHRoaXMuX2xhc3RFdmVudC50aWNrcyA9IHRpY2tzIC0gMVxuICAgIHRoaXMuX2xhc3RFdmVudC5taWxsaXMgPSBtaWxsaXNcblxuICAgIGNvbnNvbGUubG9nKCdsZW5ndGgnLCB0aGlzLl9sYXN0RXZlbnQudGlja3MsIHRoaXMuX2xhc3RFdmVudC5taWxsaXMsIHRoaXMuYmFycylcblxuXG4gICAgdGhpcy5fZHVyYXRpb25UaWNrcyA9IHRoaXMuX2xhc3RFdmVudC50aWNrc1xuICAgIHRoaXMuX2R1cmF0aW9uTWlsbGlzID0gdGhpcy5fbGFzdEV2ZW50Lm1pbGxpc1xuICAgIGNvbnNvbGUubG9nKHRoaXMuX2R1cmF0aW9uVGlja3MpXG4gICAgdGhpcy5fcGxheWhlYWQudXBkYXRlU29uZygpXG5cbiAgICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlKXtcbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICB9XG4vKlxuICAgIC8vIGFkZCBtZXRyb25vbWUgZXZlbnRzXG4gICAgaWYodGhpcy5fdXBkYXRlTWV0cm9ub21lRXZlbnRzIHx8IHRoaXMuX21ldHJvbm9tZS5iYXJzICE9PSB0aGlzLmJhcnMpe1xuICAgICAgdGhpcy5fbWV0cm9ub21lRXZlbnRzID0gcGFyc2VFdmVudHMoWy4uLnRoaXMuX3RpbWVFdmVudHMsIC4uLnRoaXMuX21ldHJvbm9tZS5nZXRFdmVudHMoKV0pXG4gICAgfVxuICAgIHRoaXMuX2FsbEV2ZW50cyA9IFsuLi50aGlzLl9tZXRyb25vbWVFdmVudHMsIC4uLnRoaXMuX2V2ZW50c11cbiAgICBzb3J0RXZlbnRzKHRoaXMuX2FsbEV2ZW50cylcbiAgICAvL2NvbnNvbGUubG9nKCdhbGwgZXZlbnRzICVPJywgdGhpcy5fYWxsRXZlbnRzKVxuKi9cblxuICAgIHRoaXMuX21ldHJvbm9tZS5nZXRFdmVudHMoKVxuICAgIHRoaXMuX2FsbEV2ZW50cyA9IFsuLi50aGlzLl90aW1lRXZlbnRzLCAuLi50aGlzLl9ldmVudHNdXG4gICAgc29ydEV2ZW50cyh0aGlzLl9hbGxFdmVudHMpXG5cblxuICAgIHRoaXMuX25ld1BhcnRzID0gW11cbiAgICB0aGlzLl9yZW1vdmVkUGFydHMgPSBbXVxuICAgIHRoaXMuX25ld0V2ZW50cyA9IFtdXG4gICAgdGhpcy5fbW92ZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuX3Jlc2l6ZWQgPSBmYWxzZVxuXG4gICAgY29uc29sZS5ncm91cEVuZCgndXBkYXRlIHNvbmcnKVxuICB9XG5cbiAgcGxheSh0eXBlLCAuLi5hcmdzKTogdm9pZHtcbiAgICB0aGlzLl9wbGF5KHR5cGUsIC4uLmFyZ3MpXG4gICAgaWYodGhpcy5fcHJlY291bnRCYXJzID4gMCl7XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncHJlY291bnRpbmcnLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzfSlcbiAgICB9ZWxzZSBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAnc3RhcnRfcmVjb3JkaW5nJywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgfWVsc2V7XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgIH1cbiAgfVxuXG4gIF9wbGF5KHR5cGUsIC4uLmFyZ3Mpe1xuICAgIGlmKHR5cGVvZiB0eXBlICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnNldFBvc2l0aW9uKHR5cGUsIC4uLmFyZ3MpXG4gICAgfVxuICAgIGlmKHRoaXMucGxheWluZyl7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2N1cnJlbnRNaWxsaXMpXG5cbiAgICB0aGlzLl9yZWZlcmVuY2UgPSB0aGlzLl90aW1lU3RhbXAgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuICAgIHRoaXMuX3NjaGVkdWxlci5zZXRUaW1lU3RhbXAodGhpcy5fcmVmZXJlbmNlKVxuICAgIHRoaXMuX3N0YXJ0TWlsbGlzID0gdGhpcy5fY3VycmVudE1pbGxpc1xuXG4gICAgaWYodGhpcy5fcHJlY291bnRCYXJzID4gMCAmJiB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyl7XG4gICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uKClcbiAgICAgIC8vIGNyZWF0ZSBwcmVjb3VudCBldmVudHMsIHRoZSBwbGF5aGVhZCB3aWxsIGJlIG1vdmVkIHRvIHRoZSBmaXJzdCBiZWF0IG9mIHRoZSBjdXJyZW50IGJhclxuICAgICAgdGhpcy5fbWV0cm9ub21lLmNyZWF0ZVByZWNvdW50RXZlbnRzKHBvc2l0aW9uLmJhciwgcG9zaXRpb24uYmFyICsgdGhpcy5fcHJlY291bnRCYXJzLCB0aGlzLl9yZWZlcmVuY2UpXG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24oJ2JhcnNiZWF0cycsIFtwb3NpdGlvbi5iYXJdLCAnbWlsbGlzJykubWlsbGlzXG4gICAgICB0aGlzLl9wcmVjb3VudER1cmF0aW9uID0gdGhpcy5fbWV0cm9ub21lLnByZWNvdW50RHVyYXRpb25cbiAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gdGhpcy5fY3VycmVudE1pbGxpcyArIHRoaXMuX3ByZWNvdW50RHVyYXRpb25cblxuICAgICAgY29uc29sZS5ncm91cCgncHJlY291bnQnKVxuICAgICAgY29uc29sZS5sb2coJ3Bvc2l0aW9uJywgdGhpcy5nZXRQb3NpdGlvbigpKVxuICAgICAgY29uc29sZS5sb2coJ19jdXJyZW50TWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIGNvbnNvbGUubG9nKCdlbmRQcmVjb3VudE1pbGxpcycsIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzKVxuICAgICAgY29uc29sZS5sb2coJ19wcmVjb3VudER1cmF0aW9uJywgdGhpcy5fcHJlY291bnREdXJhdGlvbilcbiAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoJ3ByZWNvdW50JylcbiAgICAgIC8vY29uc29sZS5sb2coJ3ByZWNvdW50RHVyYXRpb24nLCB0aGlzLl9tZXRyb25vbWUuY3JlYXRlUHJlY291bnRFdmVudHModGhpcy5fcHJlY291bnRCYXJzLCB0aGlzLl9yZWZlcmVuY2UpKVxuICAgICAgdGhpcy5wcmVjb3VudGluZyA9IHRydWVcbiAgICB9ZWxzZSB7XG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMucGxheWluZyA9IHRydWVcbiAgICAgIHRoaXMucmVjb3JkaW5nID0gdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmdcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9lbmRQcmVjb3VudE1pbGxpcylcblxuICAgIGlmKHRoaXMucGF1c2VkKXtcbiAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgdGhpcy5fc2NoZWR1bGVyLmluaXQodGhpcy5fY3VycmVudE1pbGxpcylcbiAgICB0aGlzLl9wdWxzZSgpXG4gIH1cblxuXG4gIHBhdXNlKCk6IHZvaWR7XG4gICAgdGhpcy5wYXVzZWQgPSAhdGhpcy5wYXVzZWRcbiAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2VcbiAgICBpZih0aGlzLnBhdXNlZCl7XG4gICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGF1c2UnLCBkYXRhOiB0aGlzLnBhdXNlZH0pXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnBsYXkoKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BhdXNlJywgZGF0YTogdGhpcy5wYXVzZWR9KVxuICAgIH1cbiAgfVxuXG4gIHN0b3AoKTogdm9pZHtcbiAgICBjb25zb2xlLmxvZygnU1RPUCcpXG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgaWYodGhpcy5wbGF5aW5nIHx8IHRoaXMucGF1c2VkKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgfVxuICAgIGlmKHRoaXMuX2N1cnJlbnRNaWxsaXMgIT09IDApe1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIGlmKHRoaXMucmVjb3JkaW5nKXtcbiAgICAgICAgdGhpcy5zdG9wUmVjb3JkaW5nKClcbiAgICAgIH1cbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdG9wJ30pXG4gICAgfVxuICB9XG5cbiAgc3RhcnRSZWNvcmRpbmcoKXtcbiAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fcmVjb3JkSWQgPSBgcmVjb3JkaW5nXyR7cmVjb3JkaW5nSW5kZXgrK30ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5fc3RhcnRSZWNvcmRpbmcodGhpcy5fcmVjb3JkSWQpXG4gICAgfSlcbiAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IHRydWVcbiAgfVxuXG4gIHN0b3BSZWNvcmRpbmcoKXtcbiAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIHRyYWNrLl9zdG9wUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID0gZmFsc2VcbiAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlXG4gICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3N0b3BfcmVjb3JkaW5nJ30pXG4gIH1cblxuICB1bmRvUmVjb3JkaW5nKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2sudW5kb1JlY29yZGluZyh0aGlzLl9yZWNvcmRJZClcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHJlZG9SZWNvcmRpbmcoKXtcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5yZWRvUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICB9XG5cbiAgc2V0TWV0cm9ub21lKGZsYWcpe1xuICAgIGlmKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9ICF0aGlzLnVzZU1ldHJvbm9tZVxuICAgIH1lbHNle1xuICAgICAgdGhpcy51c2VNZXRyb25vbWUgPSBmbGFnXG4gICAgfVxuICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKCF0aGlzLnVzZU1ldHJvbm9tZSlcbiAgfVxuXG4gIGNvbmZpZ3VyZU1ldHJvbm9tZShjb25maWcpe1xuICAgIHRoaXMuX21ldHJvbm9tZS5jb25maWd1cmUoY29uZmlnKVxuICB9XG5cbiAgY29uZmlndXJlKGNvbmZpZyl7XG5cbiAgfVxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICB0cmFjay5hbGxOb3Rlc09mZigpXG4gICAgfSlcblxuICAgIC8vdGhpcy5fc2NoZWR1bGVyLmFsbE5vdGVzT2ZmKClcbiAgICB0aGlzLl9tZXRyb25vbWUuYWxsTm90ZXNPZmYoKVxuICB9XG5cbiAgZ2V0VHJhY2tzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl90cmFja3NdXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuICBnZXRFdmVudHMoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c11cbiAgfVxuXG4gIGdldE5vdGVzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ub3Rlc11cbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKGFyZ3Mpe1xuICAgIHJldHVybiBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCBhcmdzKVxuICB9XG5cbiAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuICBzZXRQb3NpdGlvbih0eXBlLCAuLi5hcmdzKXtcblxuICAgIGxldCB3YXNQbGF5aW5nID0gdGhpcy5wbGF5aW5nXG4gICAgaWYodGhpcy5wbGF5aW5nKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLmFsbE5vdGVzT2ZmKClcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJylcbiAgICAvL2xldCBtaWxsaXMgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnbWlsbGlzJylcbiAgICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IHBvc2l0aW9uLm1pbGxpc1xuICAgIC8vY29uc29sZS5sb2codGhpcy5fY3VycmVudE1pbGxpcylcblxuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgIGRhdGE6IHBvc2l0aW9uXG4gICAgfSlcblxuICAgIGlmKHdhc1BsYXlpbmcpe1xuICAgICAgdGhpcy5fcGxheSgpXG4gICAgfWVsc2V7XG4gICAgICAvL0B0b2RvOiBnZXQgdGhpcyBpbmZvcm1hdGlvbiBmcm9tIGxldCAncG9zaXRpb24nIC0+IHdlIGhhdmUganVzdCBjYWxjdWxhdGVkIHRoZSBwb3NpdGlvblxuICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCdzZXRQb3NpdGlvbicsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gIH1cblxuICBnZXRQb3NpdGlvbigpe1xuICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKS5wb3NpdGlvblxuICB9XG5cbiAgZ2V0UGxheWhlYWQoKXtcbiAgICByZXR1cm4gdGhpcy5fcGxheWhlYWQuZ2V0KClcbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0TGVmdExvY2F0b3IodHlwZSwgLi4uYXJncyl7XG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJylcblxuICAgIGlmKHRoaXMuX2xlZnRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcG9zaXRpb24gZm9yIGxvY2F0b3InKVxuICAgICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0UmlnaHRMb2NhdG9yKHR5cGUsIC4uLmFyZ3Mpe1xuICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKVxuXG4gICAgaWYodGhpcy5fcmlnaHRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBwb3NpdGlvbiBmb3IgbG9jYXRvcicpXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICBzZXRMb29wKGZsYWcgPSBudWxsKXtcblxuICAgIHRoaXMuX2xvb3AgPSBmbGFnICE9PSBudWxsID8gZmxhZyA6ICF0aGlzLl9sb29wXG5cbiAgICBpZih0aGlzLl9yaWdodExvY2F0b3IgPT09IGZhbHNlIHx8IHRoaXMuX2xlZnRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IHRydWVcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gbG9jYXRvcnMgY2FuIG5vdCAoeWV0KSBiZSB1c2VkIHRvIGp1bXAgb3ZlciBhIHNlZ21lbnRcbiAgICBpZih0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzIDw9IHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcyl7XG4gICAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IHRydWVcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5fbG9vcER1cmF0aW9uID0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAtIHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpc1xuICAgIC8vY29uc29sZS5sb2codGhpcy5fbG9vcCwgdGhpcy5fbG9vcER1cmF0aW9uKVxuICAgIHRoaXMuX3NjaGVkdWxlci5iZXlvbmRMb29wID0gdGhpcy5fY3VycmVudE1pbGxpcyA+IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXNcbiAgICByZXR1cm4gdGhpcy5fbG9vcFxuICB9XG5cbiAgc2V0UHJlY291bnQodmFsdWUgPSAwKXtcbiAgICB0aGlzLl9wcmVjb3VudEJhcnMgPSB2YWx1ZVxuICB9XG5cbiAgX3B1bHNlKCk6IHZvaWR7XG4gICAgaWYodGhpcy5wbGF5aW5nID09PSBmYWxzZSAmJiB0aGlzLnByZWNvdW50aW5nID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgbGV0IGRpZmYgPSBub3cgLSB0aGlzLl9yZWZlcmVuY2VcbiAgICB0aGlzLl9jdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICB0aGlzLl9yZWZlcmVuY2UgPSBub3dcblxuICAgIGlmKHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID4gMCl7XG4gICAgICBpZih0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA+IHRoaXMuX2N1cnJlbnRNaWxsaXMpe1xuICAgICAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKGRpZmYpXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9wdWxzZS5iaW5kKHRoaXMpKVxuICAgICAgICAvL3JldHVybiBiZWNhdXNlIGR1cmluZyBwcmVjb3VudGluZyBvbmx5IHByZWNvdW50IG1ldHJvbm9tZSBldmVudHMgZ2V0IHNjaGVkdWxlZFxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPSAwXG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzIC09IHRoaXMuX3ByZWNvdW50RHVyYXRpb25cbiAgICAgIGlmKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nKXtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLnJlY29yZGluZyA9IHRydWVcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlXG4gICAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fc3RhcnRNaWxsaXN9KVxuICAgICAgICAvL2Rpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYodGhpcy5fbG9vcCAmJiB0aGlzLl9jdXJyZW50TWlsbGlzID49IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMpe1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyAtPSB0aGlzLl9sb29wRHVyYXRpb25cbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIC8vdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9sZWZ0TG9jYXRvci5taWxsaXMpIC8vIHBsYXloZWFkIGlzIGEgYml0IGFoZWFkIG9ubHkgZHVyaW5nIHRoaXMgZnJhbWVcbiAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICB0eXBlOiAnbG9vcCcsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9wbGF5aGVhZC51cGRhdGUoJ21pbGxpcycsIGRpZmYpXG4gICAgfVxuXG4gICAgdGhpcy5fdGlja3MgPSB0aGlzLl9wbGF5aGVhZC5nZXQoKS50aWNrc1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzLCB0aGlzLl9kdXJhdGlvbk1pbGxpcylcblxuICAgIGlmKHRoaXMuX2N1cnJlbnRNaWxsaXMgPj0gdGhpcy5fZHVyYXRpb25NaWxsaXMpe1xuICAgICAgaWYodGhpcy5yZWNvcmRpbmcgIT09IHRydWUpe1xuICAgICAgICB0aGlzLnN0b3AoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1lbHNlIGlmKHRoaXMuYXV0b1NpemUgIT09IHRydWUpe1xuICAgICAgICB0aGlzLnN0b3AoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGxldCBldmVudHMgPSB0aGlzLl9tZXRyb25vbWUuYWRkRXZlbnRzKHRoaXMuYmFycywgdGhpcy5iYXJzICsgMSlcbiAgICAgIGxldCB0b2JlUGFyc2VkID0gWy4uLmV2ZW50cywgLi4udGhpcy5fdGltZUV2ZW50c11cbiAgICAgIHNvcnRFdmVudHModG9iZVBhcnNlZClcbiAgICAgIHBhcnNlRXZlbnRzKHRvYmVQYXJzZWQpXG4gICAgICB0aGlzLl9zY2hlZHVsZXIuZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdGhpcy5fc2NoZWR1bGVyLm51bUV2ZW50cyArPSBldmVudHMubGVuZ3RoXG4gICAgICBsZXQgbGFzdEV2ZW50ID0gZXZlbnRzW2V2ZW50cy5sZW5ndGggLSAxXVxuICAgICAgbGV0IGV4dHJhTWlsbGlzID0gbGFzdEV2ZW50LnRpY2tzUGVyQmFyICogbGFzdEV2ZW50Lm1pbGxpc1BlclRpY2tcbiAgICAgIHRoaXMuX2xhc3RFdmVudC50aWNrcyArPSBsYXN0RXZlbnQudGlja3NQZXJCYXJcbiAgICAgIHRoaXMuX2xhc3RFdmVudC5taWxsaXMgKz0gZXh0cmFNaWxsaXNcbiAgICAgIHRoaXMuX2R1cmF0aW9uTWlsbGlzICs9IGV4dHJhTWlsbGlzXG4gICAgICB0aGlzLmJhcnMrK1xuICAgICAgdGhpcy5fcmVzaXplZCA9IHRydWVcbiAgICAgIC8vY29uc29sZS5sb2coJ2xlbmd0aCcsIHRoaXMuX2xhc3RFdmVudC50aWNrcywgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcywgdGhpcy5iYXJzLCBsYXN0RXZlbnQpXG4gICAgfVxuXG4gICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZShkaWZmKVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3B1bHNlLmJpbmQodGhpcykpXG4gIH1cblxuICAvKlxuICAgIGhlbHBlciBtZXRob2Q6IGNvbnZlcnRzIHVzZXIgZnJpZW5kbHkgcG9zaXRpb24gZm9ybWF0IHRvIGludGVybmFsIGZvcm1hdFxuXG4gICAgcG9zaXRpb246XG4gICAgICAtICd0aWNrcycsIDk2MDAwXG4gICAgICAtICdtaWxsaXMnLCAxMjM0XG4gICAgICAtICdwZXJjZW50YWdlJywgNTVcbiAgICAgIC0gJ2JhcnNiZWF0cycsIDEsIDQsIDAsIDI1IC0+IGJhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXG4gICAgICAtICd0aW1lJywgMCwgMywgNDksIDU2NiAtPiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG5cbiAgKi9cbiAgX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsIHJlc3VsdFR5cGUpe1xuICAgIGxldCB0YXJnZXRcblxuICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBjYXNlICdwZXJjZW50YWdlJzpcbiAgICAgICAgLy90YXJnZXQgPSBhcmdzWzBdIHx8IDBcbiAgICAgICAgdGFyZ2V0ID0gYXJncyB8fCAwXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICAgIHRhcmdldCA9IGFyZ3NcbiAgICAgICAgYnJlYWtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5sb2coJ3Vuc3VwcG9ydGVkIHR5cGUnKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCB7XG4gICAgICB0eXBlLFxuICAgICAgdGFyZ2V0LFxuICAgICAgcmVzdWx0OiByZXN1bHRUeXBlLFxuICAgIH0pXG5cbiAgICByZXR1cm4gcG9zaXRpb25cbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spe1xuICAgIHJldHVybiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZClcbiAgfVxuXG4gIHNhdmVBc01JRElGaWxlKG5hbWUpe1xuICAgIHNhdmVBc01JRElGaWxlKHRoaXMsIG5hbWUpXG4gIH1cbn1cbiIsIlxuaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5pbXBvcnQge3BhcnNlTUlESUZpbGV9IGZyb20gJy4vbWlkaWZpbGUnXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtQYXJ0fSBmcm9tICcuL3BhcnQnXG5pbXBvcnQge1RyYWNrfSBmcm9tICcuL3RyYWNrJ1xuaW1wb3J0IHtTb25nfSBmcm9tICcuL3NvbmcnXG5pbXBvcnQge2Jhc2U2NFRvQmluYXJ5fSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge3N0YXR1cywganNvbiwgYXJyYXlCdWZmZXJ9IGZyb20gJy4vZmV0Y2hfaGVscGVycydcblxuY29uc3QgUFBRID0gOTYwXG5cblxuZnVuY3Rpb24gdG9Tb25nKHBhcnNlZCl7XG4gIGxldCB0cmFja3MgPSBwYXJzZWQudHJhY2tzXG4gIGxldCBwcHEgPSBwYXJzZWQuaGVhZGVyLnRpY2tzUGVyQmVhdFxuICBsZXQgcHBxRmFjdG9yID0gUFBRIC8gcHBxIC8vQFRPRE86IGdldCBwcHEgZnJvbSBjb25maWcgLT4gb25seSBuZWNlc3NhcnkgaWYgeW91IHdhbnQgdG8gY2hhbmdlIHRoZSBwcHEgb2YgdGhlIE1JREkgZmlsZSAhXG4gIGxldCB0aW1lRXZlbnRzID0gW11cbiAgbGV0IGJwbSA9IC0xXG4gIGxldCBub21pbmF0b3IgPSAtMVxuICBsZXQgZGVub21pbmF0b3IgPSAtMVxuICBsZXQgbmV3VHJhY2tzID0gW11cblxuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcy52YWx1ZXMoKSl7XG4gICAgbGV0IGxhc3RUaWNrcywgbGFzdFR5cGVcbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IHR5cGVcbiAgICBsZXQgY2hhbm5lbCA9IC0xXG4gICAgbGV0IHRyYWNrTmFtZVxuICAgIGxldCB0cmFja0luc3RydW1lbnROYW1lXG4gICAgbGV0IGV2ZW50cyA9IFtdO1xuXG4gICAgZm9yKGxldCBldmVudCBvZiB0cmFjayl7XG4gICAgICB0aWNrcyArPSAoZXZlbnQuZGVsdGFUaW1lICogcHBxRmFjdG9yKTtcblxuICAgICAgaWYoY2hhbm5lbCA9PT0gLTEgJiYgdHlwZW9mIGV2ZW50LmNoYW5uZWwgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY2hhbm5lbCA9IGV2ZW50LmNoYW5uZWw7XG4gICAgICB9XG4gICAgICB0eXBlID0gZXZlbnQuc3VidHlwZTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVsdGFUaW1lLCB0aWNrcywgdHlwZSk7XG5cbiAgICAgIHN3aXRjaChldmVudC5zdWJ0eXBlKXtcblxuICAgICAgICBjYXNlICd0cmFja05hbWUnOlxuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnaW5zdHJ1bWVudE5hbWUnOlxuICAgICAgICAgIGlmKGV2ZW50LnRleHQpe1xuICAgICAgICAgICAgdHJhY2tJbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg5MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPZmYnOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4ODAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSlcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdzZXRUZW1wbyc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGVtcG8gZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGxldCB0bXAgPSA2MDAwMDAwMCAvIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQ7XG5cbiAgICAgICAgICBpZih0aWNrcyA9PT0gbGFzdFRpY2tzICYmIHR5cGUgPT09IGxhc3RUeXBlKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKCd0ZW1wbyBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCB0bXApO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihicG0gPT09IC0xKXtcbiAgICAgICAgICAgIGJwbSA9IHRtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4NTEsIHRtcCkpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZVNpZ25hdHVyZSc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGlmKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpe1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCd0aW1lIHNpZ25hdHVyZSBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYobm9taW5hdG9yID09PSAtMSl7XG4gICAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5udW1lcmF0b3JcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3JcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4NTgsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpKVxuICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSAnY29udHJvbGxlcic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhCMCwgZXZlbnQuY29udHJvbGxlclR5cGUsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncHJvZ3JhbUNoYW5nZSc6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhDMCwgZXZlbnQucHJvZ3JhbU51bWJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3BpdGNoQmVuZCc6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhFMCwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vY29uc29sZS5sb2codHJhY2submFtZSwgZXZlbnQudHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGxhc3RUeXBlID0gdHlwZVxuICAgICAgbGFzdFRpY2tzID0gdGlja3NcbiAgICB9XG5cbiAgICBpZihldmVudHMubGVuZ3RoID4gMCl7XG4gICAgICAvL2NvbnNvbGUuY291bnQoZXZlbnRzLmxlbmd0aClcbiAgICAgIGxldCBuZXdUcmFjayA9IG5ldyBUcmFjayh0cmFja05hbWUpXG4gICAgICBsZXQgcGFydCA9IG5ldyBQYXJ0KClcbiAgICAgIG5ld1RyYWNrLmFkZFBhcnRzKHBhcnQpXG4gICAgICBwYXJ0LmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgICBuZXdUcmFja3MucHVzaChuZXdUcmFjaylcbiAgICB9XG4gIH1cblxuICBsZXQgc29uZyA9IG5ldyBTb25nKHtcbiAgICBwcHE6IFBQUSxcbiAgICBwbGF5YmFja1NwZWVkOiAxLFxuICAgIC8vcHBxLFxuICAgIGJwbSxcbiAgICBub21pbmF0b3IsXG4gICAgZGVub21pbmF0b3JcbiAgfSlcbiAgc29uZy5hZGRUcmFja3MoLi4ubmV3VHJhY2tzKVxuICBzb25nLmFkZFRpbWVFdmVudHMoLi4udGltZUV2ZW50cylcbiAgc29uZy51cGRhdGUoKVxuICByZXR1cm4gc29uZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZShkYXRhLCBzZXR0aW5ncyA9IHt9KXtcbiAgbGV0IHNvbmcgPSBudWxsO1xuXG4gIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgIHNvbmcgPSB0b1NvbmcocGFyc2VNSURJRmlsZShidWZmZXIpKTtcbiAgfWVsc2UgaWYodHlwZW9mIGRhdGEuaGVhZGVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZGF0YS50cmFja3MgIT09ICd1bmRlZmluZWQnKXtcbiAgICBzb25nID0gdG9Tb25nKGRhdGEpO1xuICB9ZWxzZXtcbiAgICBkYXRhID0gYmFzZTY0VG9CaW5hcnkoZGF0YSk7XG4gICAgaWYoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKXtcbiAgICAgIGxldCBidWZmZXIgPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgICAgIHNvbmcgPSB0b1NvbmcocGFyc2VNSURJRmlsZShidWZmZXIpKTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3dyb25nIGRhdGEnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc29uZ1xuICAvLyB7XG4gIC8vICAgcHBxID0gbmV3UFBRLFxuICAvLyAgIGJwbSA9IG5ld0JQTSxcbiAgLy8gICBwbGF5YmFja1NwZWVkID0gbmV3UGxheWJhY2tTcGVlZCxcbiAgLy8gfSA9IHNldHRpbmdzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbmdGcm9tTUlESUZpbGVBc3luYyh1cmwpe1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGZldGNoKHVybClcbiAgICAudGhlbihzdGF0dXMpXG4gICAgLnRoZW4oYXJyYXlCdWZmZXIpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICByZXNvbHZlKHNvbmdGcm9tTUlESUZpbGUoZGF0YSkpXG4gICAgfSlcbiAgICAuY2F0Y2goZSA9PiB7XG4gICAgICByZWplY3QoZSlcbiAgICB9KVxuICB9KVxufVxuIiwiaW1wb3J0IHtQYXJ0fSBmcm9tICcuL3BhcnQnXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtNSURJTm90ZX0gZnJvbSAnLi9taWRpX25vdGUnXG5pbXBvcnQge2dldE1JRElJbnB1dEJ5SWQsIGdldE1JRElPdXRwdXRCeUlkfSBmcm9tICcuL2luaXRfbWlkaSdcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge0luc3RydW1lbnR9IGZyb20gJy4vaW5zdHJ1bWVudCdcbmltcG9ydCB7TUlESUV2ZW50VHlwZXN9IGZyb20gJy4vcWFtYmknXG5cblxubGV0IHRyYWNrSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBUcmFja3tcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgPSBudWxsKXtcbiAgICB0aGlzLmlkID0gYFRSXyR7dHJhY2tJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcbiAgICB0aGlzLmNoYW5uZWwgPSAwXG4gICAgdGhpcy5tdXRlZCA9IGZhbHNlXG4gICAgdGhpcy52b2x1bWUgPSAwLjVcbiAgICB0aGlzLl9vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMuX291dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLl9taWRpSW5wdXRzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fbWlkaU91dHB1dHMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9zb25nID0gbnVsbFxuICAgIHRoaXMuX3BhcnRzID0gW11cbiAgICB0aGlzLl9wYXJ0c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgdGhpcy5sYXRlbmN5ID0gMTAwXG4gICAgdGhpcy5faW5zdHJ1bWVudCA9IG51bGxcbiAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fcmVjb3JkZWRFdmVudHMgPSBbXVxuICAgIC8vdGhpcy5zZXRJbnN0cnVtZW50KG5ldyBJbnN0cnVtZW50KCdzaW5ld2F2ZScpKVxuICB9XG5cbiAgc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50ID0gbnVsbCl7XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuZGlzY29ubmVjdCgpXG4gICAgfVxuICAgIHRoaXMuX2luc3RydW1lbnQgPSBpbnN0cnVtZW50XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgIH1cbiAgfVxuXG4gIGdldEluc3RydW1lbnQoKXtcbiAgICByZXR1cm4gdGhpcy5faW5zdHJ1bWVudFxuICB9XG5cbiAgY29ubmVjdChvdXRwdXQpe1xuICAgIHRoaXMuX291dHB1dC5jb25uZWN0KG91dHB1dClcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKXtcbiAgICB0aGlzLl9vdXRwdXQuZGlzY29ubmVjdCgpXG4gIH1cblxuICBjb25uZWN0TUlESU91dHB1dHMoLi4ub3V0cHV0cyl7XG4gICAgLy9jb25zb2xlLmxvZyhvdXRwdXRzKVxuICAgIG91dHB1dHMuZm9yRWFjaChvdXRwdXQgPT4ge1xuICAgICAgaWYodHlwZW9mIG91dHB1dCA9PT0gJ3N0cmluZycpe1xuICAgICAgICBvdXRwdXQgPSBnZXRNSURJT3V0cHV0QnlJZChvdXRwdXQpXG4gICAgICB9XG4gICAgICBpZihvdXRwdXQgaW5zdGFuY2VvZiBNSURJT3V0cHV0KXtcbiAgICAgICAgdGhpcy5fbWlkaU91dHB1dHMuc2V0KG91dHB1dC5pZCwgb3V0cHV0KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpT3V0cHV0cylcbiAgfVxuXG4gIGRpc2Nvbm5lY3RNSURJT3V0cHV0cyguLi5vdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gICAgaWYob3V0cHV0cy5sZW5ndGggPT09IDApe1xuICAgICAgdGhpcy5fbWlkaU91dHB1dHMuY2xlYXIoKVxuICAgIH1cbiAgICBvdXRwdXRzLmZvckVhY2gocG9ydCA9PiB7XG4gICAgICBpZihwb3J0IGluc3RhbmNlb2YgTUlESU91dHB1dCl7XG4gICAgICAgIHBvcnQgPSBwb3J0LmlkXG4gICAgICB9XG4gICAgICBpZih0aGlzLl9taWRpT3V0cHV0cy5oYXMocG9ydCkpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdyZW1vdmluZycsIHRoaXMuX21pZGlPdXRwdXRzLmdldChwb3J0KS5uYW1lKVxuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5kZWxldGUocG9ydClcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vdGhpcy5fbWlkaU91dHB1dHMgPSB0aGlzLl9taWRpT3V0cHV0cy5maWx0ZXIoLi4ub3V0cHV0cylcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlPdXRwdXRzKVxuICB9XG5cbiAgY29ubmVjdE1JRElJbnB1dHMoLi4uaW5wdXRzKXtcbiAgICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgICBpZih0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaW5wdXQgPSBnZXRNSURJSW5wdXRCeUlkKGlucHV0KVxuICAgICAgfVxuICAgICAgaWYoaW5wdXQgaW5zdGFuY2VvZiBNSURJSW5wdXQpe1xuXG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuc2V0KGlucHV0LmlkLCBpbnB1dClcblxuICAgICAgICBsZXQgbm90ZSwgbWlkaUV2ZW50XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgZSA9PiB7XG5cbiAgICAgICAgICBtaWRpRXZlbnQgPSBuZXcgTUlESUV2ZW50KHRoaXMuX3NvbmcuX3RpY2tzLCAuLi5lLmRhdGEpXG4gICAgICAgICAgbWlkaUV2ZW50LnRpbWUgPSAwIC8vIHBsYXkgaW1tZWRpYXRlbHlcbiAgICAgICAgICBtaWRpRXZlbnQucmVjb3JkTWlsbGlzID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDBcblxuICAgICAgICAgIGlmKG1pZGlFdmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5OT1RFX09OKXtcbiAgICAgICAgICAgIG5vdGUgPSBuZXcgTUlESU5vdGUobWlkaUV2ZW50KVxuICAgICAgICAgICAgdGhpcy5fdG1wUmVjb3JkZWROb3Rlcy5zZXQobWlkaUV2ZW50LmRhdGExLCBub3RlKVxuICAgICAgICAgIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5OT1RFX09GRil7XG4gICAgICAgICAgICBub3RlID0gdGhpcy5fdG1wUmVjb3JkZWROb3Rlcy5nZXQobWlkaUV2ZW50LmRhdGExKVxuICAgICAgICAgICAgbm90ZS5hZGROb3RlT2ZmKG1pZGlFdmVudClcbiAgICAgICAgICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMuZGVsZXRlKG1pZGlFdmVudC5kYXRhMSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZih0aGlzLl9yZWNvcmRFbmFibGVkID09PSAnbWlkaScgJiYgdGhpcy5fc29uZy5yZWNvcmRpbmcgPT09IHRydWUpe1xuICAgICAgICAgICAgdGhpcy5fcmVjb3JkZWRFdmVudHMucHVzaChtaWRpRXZlbnQpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucHJvY2Vzc01JRElFdmVudChtaWRpRXZlbnQpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlJbnB1dHMpXG4gIH1cblxuICBkaXNjb25uZWN0TUlESUlucHV0cyguLi5pbnB1dHMpe1xuICAgIGlmKGlucHV0cy5sZW5ndGggPT09IDApe1xuICAgICAgdGhpcy5fbWlkaUlucHV0cy5jbGVhcigpXG4gICAgfVxuICAgIGlucHV0cy5mb3JFYWNoKHBvcnQgPT4ge1xuICAgICAgaWYocG9ydCBpbnN0YW5jZW9mIE1JRElJbnB1dCl7XG4gICAgICAgIHBvcnQgPSBwb3J0LmlkXG4gICAgICB9XG4gICAgICBpZih0aGlzLl9taWRpT3V0cHV0cy5oYXMocG9ydCkpe1xuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5kZWxldGUocG9ydClcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vdGhpcy5fbWlkaU91dHB1dHMgPSB0aGlzLl9taWRpT3V0cHV0cy5maWx0ZXIoLi4ub3V0cHV0cylcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlJbnB1dHMpXG4gIH1cblxuICBnZXRNSURJSW5wdXRzKCl7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fbWlkaUlucHV0cy52YWx1ZXMoKSlcbiAgfVxuXG4gIGdldE1JRElPdXRwdXRzKCl7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpXG4gIH1cblxuICBzZXRSZWNvcmRFbmFibGVkKHR5cGUpeyAvLyAnbWlkaScsICdhdWRpbycsIGVtcHR5IG9yIGFueXRoaW5nIHdpbGwgZGlzYWJsZSByZWNvcmRpbmdcbiAgICB0aGlzLl9yZWNvcmRFbmFibGVkID0gdHlwZVxuICB9XG5cbiAgX3N0YXJ0UmVjb3JkaW5nKHJlY29yZElkKXtcbiAgICBpZih0aGlzLl9yZWNvcmRFbmFibGVkID09PSAnbWlkaScpe1xuICAgICAgdGhpcy5fcmVjb3JkSWQgPSByZWNvcmRJZFxuICAgICAgdGhpcy5fcmVjb3JkZWRFdmVudHMgPSBbXVxuICAgICAgdGhpcy5fcmVjb3JkUGFydCA9IG5ldyBQYXJ0KHRoaXMuX3JlY29yZElkKVxuICAgIH1cbiAgfVxuXG4gIF9zdG9wUmVjb3JkaW5nKHJlY29yZElkKXtcbiAgICBpZih0aGlzLl9yZWNvcmRJZCAhPT0gcmVjb3JkSWQpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmKHRoaXMuX3JlY29yZGVkRXZlbnRzLmxlbmd0aCA9PT0gMCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fcmVjb3JkUGFydC5hZGRFdmVudHMoLi4udGhpcy5fcmVjb3JkZWRFdmVudHMpXG4gICAgLy90aGlzLl9zb25nLl9uZXdFdmVudHMucHVzaCguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgICB0aGlzLmFkZFBhcnRzKHRoaXMuX3JlY29yZFBhcnQpXG4gIH1cblxuICB1bmRvUmVjb3JkaW5nKHJlY29yZElkKXtcbiAgICBpZih0aGlzLl9yZWNvcmRJZCAhPT0gcmVjb3JkSWQpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMucmVtb3ZlUGFydHModGhpcy5fcmVjb3JkUGFydClcbiAgICAvL3RoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgfVxuXG4gIHJlZG9SZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5hZGRQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KVxuICB9XG5cbiAgY29weSgpe1xuICAgIGxldCB0ID0gbmV3IFRyYWNrKHRoaXMubmFtZSArICdfY29weScpIC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICBsZXQgcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBsZXQgY29weSA9IHBhcnQuY29weSgpXG4gICAgICBjb25zb2xlLmxvZyhjb3B5KVxuICAgICAgcGFydHMucHVzaChjb3B5KVxuICAgIH0pXG4gICAgdC5hZGRQYXJ0cyguLi5wYXJ0cylcbiAgICB0LnVwZGF0ZSgpXG4gICAgcmV0dXJuIHRcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KVxuICAgIH0pXG4gIH1cblxuICBhZGRQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG4gICAgcGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgcGFydC5fdHJhY2sgPSB0aGlzXG4gICAgICB0aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpXG4gICAgICB0aGlzLl9wYXJ0cy5wdXNoKHBhcnQpXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgcGFydC5fc29uZyA9IHNvbmdcbiAgICAgICAgc29uZy5fbmV3UGFydHMucHVzaChwYXJ0KVxuICAgICAgfVxuXG4gICAgICBsZXQgZXZlbnRzID0gcGFydC5fZXZlbnRzXG4gICAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdGhpc1xuICAgICAgICBpZihzb25nKXtcbiAgICAgICAgICBldmVudC5fc29uZyA9IHNvbmdcbiAgICAgICAgICBzb25nLl9uZXdFdmVudHMucHVzaChldmVudClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB9KVxuICAgICAgdGhpcy5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICByZW1vdmVQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG5cbiAgICBwYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0Ll90cmFjayA9IG51bGxcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCwgcGFydClcbiAgICAgIGlmKHNvbmcpe1xuICAgICAgICBzb25nLl9yZW1vdmVkUGFydHMucHVzaChwYXJ0KVxuICAgICAgfVxuXG4gICAgICBsZXQgZXZlbnRzID0gcGFydC5fZXZlbnRzXG4gICAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgICAgaWYoc29uZyl7XG4gICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICAgICAgLy9zb25nLl9kZWxldGVkRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQsIGV2ZW50KVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuXG4gIHRyYW5zcG9zZVBhcnRzKGFtb3VudDogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICB9XG5cbiAgbW92ZVBhcnRzKHRpY2tzOiBudW1iZXIsIC4uLnBhcnRzKXtcbiAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgcGFydC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gIH1cblxuICBtb3ZlUGFydHNUbyh0aWNrczogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gIH1cblxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0KClcbiAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgdGhpcy5hZGRQYXJ0cyhwKVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBwYXJ0cy5zZXQoZXZlbnQuX3BhcnQpXG4gICAgICBldmVudC5fcGFydCA9IG51bGxcbiAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgIGV2ZW50Ll9zb25nID0gbnVsbFxuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gIH1cblxuICBtb3ZlRXZlbnRzKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlKHRpY2tzKVxuICAgICAgcGFydHMuc2V0KGV2ZW50LnBhcnQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgfVxuXG4gIG1vdmVFdmVudHNUbyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGxldCBwYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgICAgcGFydHMuc2V0KGV2ZW50LnBhcnQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgfVxuXG4gIGdldEV2ZW50cyhmaWx0ZXI6IHN0cmluZ1tdID0gbnVsbCl7IC8vIGNhbiBiZSB1c2UgYXMgZmluZEV2ZW50c1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ldmVudHNdIC8vQFRPRE8gaW1wbGVtZW50IGZpbHRlciAtPiBmaWx0ZXJFdmVudHMoKSBzaG91bGQgYmUgYSB1dGlsaXR5IGZ1bmN0aW9uIChub3QgYSBjbGFzcyBtZXRob2QpXG4gIH1cblxuICBtdXRlKGZsYWc6IGJvb2xlYW4gPSBudWxsKXtcbiAgICBpZihmbGFnKXtcbiAgICAgIHRoaXMuX211dGVkID0gZmxhZ1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5fbXV0ZWQgPSAhdGhpcy5fbXV0ZWRcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKXsgLy8geW91IHNob3VsZCBvbmx5IHVzZSB0aGlzIGluIGh1Z2Ugc29uZ3MgKD4xMDAgdHJhY2tzKVxuICAgIGlmKHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkpe1xuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgfVxuICAgIHNvcnRFdmVudHModGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgfVxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgICB9XG5cbiAgICBsZXQgdGltZVN0YW1wID0gKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwKSArIHRoaXMubGF0ZW5jeVxuICAgIGZvcihsZXQgb3V0cHV0IG9mIHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKXtcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXApIC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHVzZUxhdGVuY3kgPSBmYWxzZSl7XG5cbiAgICBsZXQgbGF0ZW5jeSA9IHVzZUxhdGVuY3kgPyB0aGlzLmxhdGVuY3kgOiAwXG4gICAgLy9jb25zb2xlLmxvZyhsYXRlbmN5KVxuXG4gICAgLy8gc2VuZCB0byBqYXZhc2NyaXB0IGluc3RydW1lbnRcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5uYW1lLCBldmVudClcbiAgICAgIHRoaXMuX2luc3RydW1lbnQucHJvY2Vzc01JRElFdmVudChldmVudCwgZXZlbnQudGltZSAvIDEwMDApXG4gICAgfVxuXG4gICAgLy8gc2VuZCB0byBleHRlcm5hbCBoYXJkd2FyZSBvciBzb2Z0d2FyZSBpbnN0cnVtZW50XG4gICAgZm9yKGxldCBwb3J0IG9mIHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKXtcbiAgICAgIGlmKHBvcnQpe1xuICAgICAgICBpZihldmVudC50eXBlID09PSAxMjggfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCBldmVudC50aW1lICsgbGF0ZW5jeSlcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTkyIHx8IGV2ZW50LnR5cGUgPT09IDIyNCl7XG4gICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMV0sIGV2ZW50LnRpbWUgKyBsYXRlbmN5KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbiIsImltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuXG5jb25zdFxuICBtUEkgPSBNYXRoLlBJLFxuICBtUG93ID0gTWF0aC5wb3csXG4gIG1Sb3VuZCA9IE1hdGgucm91bmQsXG4gIG1GbG9vciA9IE1hdGguZmxvb3IsXG4gIG1SYW5kb20gPSBNYXRoLnJhbmRvbVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROaWNlVGltZShtaWxsaXMpe1xuICBsZXQgaCwgbSwgcywgbXMsXG4gICAgc2Vjb25kcyxcbiAgICB0aW1lQXNTdHJpbmcgPSAnJztcblxuICBzZWNvbmRzID0gbWlsbGlzIC8gMTAwMDsgLy8g4oaSIG1pbGxpcyB0byBzZWNvbmRzXG4gIGggPSBtRmxvb3Ioc2Vjb25kcyAvICg2MCAqIDYwKSk7XG4gIG0gPSBtRmxvb3IoKHNlY29uZHMgJSAoNjAgKiA2MCkpIC8gNjApO1xuICBzID0gbUZsb29yKHNlY29uZHMgJSAoNjApKTtcbiAgbXMgPSBtUm91bmQoKHNlY29uZHMgLSAoaCAqIDM2MDApIC0gKG0gKiA2MCkgLSBzKSAqIDEwMDApO1xuXG4gIHRpbWVBc1N0cmluZyArPSBoICsgJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbSA8IDEwID8gJzAnICsgbSA6IG07XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBzIDwgMTAgPyAnMCcgKyBzIDogcztcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG1zID09PSAwID8gJzAwMCcgOiBtcyA8IDEwID8gJzAwJyArIG1zIDogbXMgPCAxMDAgPyAnMCcgKyBtcyA6IG1zO1xuXG4gIC8vY29uc29sZS5sb2coaCwgbSwgcywgbXMpO1xuICByZXR1cm4ge1xuICAgIGhvdXI6IGgsXG4gICAgbWludXRlOiBtLFxuICAgIHNlY29uZDogcyxcbiAgICBtaWxsaXNlY29uZDogbXMsXG4gICAgdGltZUFzU3RyaW5nOiB0aW1lQXNTdHJpbmcsXG4gICAgdGltZUFzQXJyYXk6IFtoLCBtLCBzLCBtc11cbiAgfTtcbn1cblxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CaW5hcnkoaW5wdXQpe1xuICBsZXQga2V5U3RyID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JyxcbiAgICBieXRlcywgdWFycmF5LCBidWZmZXIsXG4gICAgbGtleTEsIGxrZXkyLFxuICAgIGNocjEsIGNocjIsIGNocjMsXG4gICAgZW5jMSwgZW5jMiwgZW5jMywgZW5jNCxcbiAgICBpLCBqID0gMDtcblxuICBieXRlcyA9IE1hdGguY2VpbCgoMyAqIGlucHV0Lmxlbmd0aCkgLyA0LjApO1xuICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXMpO1xuICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gIGxrZXkxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aCAtIDEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBpZihsa2V5MSA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG4gIGlmKGxrZXkyID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcblxuICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXFw9XS9nLCAnJyk7XG5cbiAgZm9yKGkgPSAwOyBpIDwgYnl0ZXM7IGkgKz0gMykge1xuICAgIC8vZ2V0IHRoZSAzIG9jdGVjdHMgaW4gNCBhc2NpaSBjaGFyc1xuICAgIGVuYzEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMzID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzQgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cbiAgICBjaHIxID0gKGVuYzEgPDwgMikgfCAoZW5jMiA+PiA0KTtcbiAgICBjaHIyID0gKChlbmMyICYgMTUpIDw8IDQpIHwgKGVuYzMgPj4gMik7XG4gICAgY2hyMyA9ICgoZW5jMyAmIDMpIDw8IDYpIHwgZW5jNDtcblxuICAgIHVhcnJheVtpXSA9IGNocjE7XG4gICAgaWYoZW5jMyAhPSA2NCkgdWFycmF5W2krMV0gPSBjaHIyO1xuICAgIGlmKGVuYzQgIT0gNjQpIHVhcnJheVtpKzJdID0gY2hyMztcbiAgfVxuICAvL2NvbnNvbGUubG9nKGJ1ZmZlcik7XG4gIHJldHVybiBidWZmZXI7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVTdHJpbmcobyl7XG4gIGlmKHR5cGVvZiBvICE9ICdvYmplY3QnKXtcbiAgICByZXR1cm4gdHlwZW9mIG87XG4gIH1cblxuICBpZihvID09PSBudWxsKXtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG5cbiAgLy9vYmplY3QsIGFycmF5LCBmdW5jdGlvbiwgZGF0ZSwgcmVnZXhwLCBzdHJpbmcsIG51bWJlciwgYm9vbGVhbiwgZXJyb3JcbiAgbGV0IGludGVybmFsQ2xhc3MgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdFxccyhcXHcrKVxcXS8pWzFdO1xuICByZXR1cm4gaW50ZXJuYWxDbGFzcy50b0xvd2VyQ2FzZSgpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzb3J0RXZlbnRzKGV2ZW50cyl7XG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgbGV0IHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgIHIgPSAtMVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJcbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmQmFzZTY0KGRhdGEpe1xuICBsZXQgcGFzc2VkID0gdHJ1ZTtcbiAgdHJ5e1xuICAgIGF0b2IoZGF0YSk7XG4gIH1jYXRjaChlKXtcbiAgICBwYXNzZWQgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gcGFzc2VkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXF1YWxQb3dlckN1cnZlKG51bVN0ZXBzLCB0eXBlLCBtYXhWYWx1ZSkge1xuICBsZXQgaSwgdmFsdWUsIHBlcmNlbnQsXG4gICAgdmFsdWVzID0gbmV3IEZsb2F0MzJBcnJheShudW1TdGVwcylcblxuICBmb3IoaSA9IDA7IGkgPCBudW1TdGVwczsgaSsrKXtcbiAgICBwZXJjZW50ID0gaSAvIG51bVN0ZXBzXG4gICAgaWYodHlwZSA9PT0gJ2ZhZGVJbicpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcygoMS4wIC0gcGVyY2VudCkgKiAwLjUgKiBtUEkpICogbWF4VmFsdWVcbiAgICB9ZWxzZSBpZih0eXBlID09PSAnZmFkZU91dCcpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcyhwZXJjZW50ICogMC41ICogTWF0aC5QSSkgKiBtYXhWYWx1ZVxuICAgIH1cbiAgICB2YWx1ZXNbaV0gPSB2YWx1ZVxuICAgIGlmKGkgPT09IG51bVN0ZXBzIC0gMSl7XG4gICAgICB2YWx1ZXNbaV0gPSB0eXBlID09PSAnZmFkZUluJyA/IDEgOiAwXG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tNSURJTnVtYmVyKHZhbHVlKXtcbiAgLy9jb25zb2xlLmxvZyh2YWx1ZSk7XG4gIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZih2YWx1ZSA8IDAgfHwgdmFsdWUgPiAxMjcpe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxMjcnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5cbi8qXG4vL29sZCBzY2hvb2wgYWpheFxuXG5leHBvcnQgZnVuY3Rpb24gYWpheChjb25maWcpe1xuICBsZXRcbiAgICByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgbWV0aG9kID0gdHlwZW9mIGNvbmZpZy5tZXRob2QgPT09ICd1bmRlZmluZWQnID8gJ0dFVCcgOiBjb25maWcubWV0aG9kLFxuICAgIGZpbGVTaXplO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICByZWplY3QgPSByZWplY3QgfHwgZnVuY3Rpb24oKXt9O1xuICAgIHJlc29sdmUgPSByZXNvbHZlIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApe1xuICAgICAgICByZWplY3QocmVxdWVzdC5zdGF0dXMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgIGZpbGVTaXplID0gcmVxdWVzdC5yZXNwb25zZS5sZW5ndGg7XG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSwgZmlsZVNpemUpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICBjb25maWcub25FcnJvcihlKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgY29uZmlnLnVybCwgdHJ1ZSk7XG5cbiAgICBpZihjb25maWcub3ZlcnJpZGVNaW1lVHlwZSl7XG4gICAgICByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUpe1xuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKG1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcuZGF0YSl7XG4gICAgICByZXF1ZXN0LnNlbmQoY29uZmlnLmRhdGEpO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cbiovIl19
