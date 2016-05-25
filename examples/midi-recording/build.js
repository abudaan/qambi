(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _qambi = require('../../src/qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {

  _qambi2.default.init().then(function () {
    main();
  });
});

function main() {
  var song = new _qambi.Song({ bars: 4, autoSize: false });
  var track = new _qambi.Track();
  track.setRecordEnabled('midi');
  track.setInstrument(new _qambi.SimpleSynth('square'));
  song.addTracks(track);
  song.update();

  var btnPlay = document.getElementById('play');
  var btnPause = document.getElementById('pause');
  var btnStop = document.getElementById('stop');
  var btnRecord = document.getElementById('record');
  var btnUndoRecord = document.getElementById('record-undo');
  var btnMetronome = document.getElementById('metronome');
  var divTempo = document.getElementById('tempo');
  var divPosition = document.getElementById('position');
  var divPositionTime = document.getElementById('position_time');
  var rangePosition = document.getElementById('playhead');
  var selectMIDIIn = document.getElementById('midiin');
  var selectPrecount = document.getElementById('precount');
  var userInteraction = false;

  btnPlay.disabled = false;
  btnPause.disabled = false;
  btnStop.disabled = false;
  btnRecord.disabled = false;
  btnMetronome.disabled = false;

  var MIDIInputs = (0, _qambi.getMIDIInputs)();
  var html = '<option id="-1">select MIDI in</option>';
  MIDIInputs.forEach(function (port) {
    html += '<option id="' + port.id + '">' + port.name + '</option>';
  });
  selectMIDIIn.innerHTML = html;

  selectMIDIIn.addEventListener('change', function (e) {
    var portId = selectMIDIIn.options[selectMIDIIn.selectedIndex].id;
    track.disconnectMIDIInputs(); // no arguments means disconnect from all inputs
    track.connectMIDIInputs(portId);
  });

  selectPrecount.addEventListener('change', function (e) {
    var numBars = parseInt(selectPrecount.options[selectPrecount.selectedIndex].id, 10);
    song.setPrecount(numBars);
  });

  btnMetronome.addEventListener('click', function () {
    song.setMetronome(); // if no arguments are provided it simply toggles
    btnMetronome.innerHTML = song.useMetronome ? 'metronome off' : 'metronome on';
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

  btnRecord.addEventListener('click', function () {
    if (btnRecord.className === 'neutral') {
      song.startRecording();
      btnRecord.className = 'recording';
    } else if (btnRecord.className === 'recording') {
      song.stopRecording();
      btnRecord.className = 'neutral';
    }
  });

  btnUndoRecord.addEventListener('click', function () {
    if (btnUndoRecord.innerHTML === 'undo record') {
      song.undoRecording();
      btnUndoRecord.innerHTML = 'redo record';
    } else {
      song.redoRecording();
      btnUndoRecord.innerHTML = 'undo record';
    }
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

  song.addEventListener('stop_recording', function (e) {
    btnUndoRecord.disabled = false;
    btnRecord.className = 'neutral';
  });

  song.addEventListener('start_recording', function (e) {
    btnUndoRecord.disabled = true;
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

},{"../../src/qambi":24}],2:[function(require,module,exports){
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

},{"./init_audio":9,"./init_midi":10,"./instrument":11,"./qambi":24,"./song":34}],9:[function(require,module,exports){
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

},{"./parse_audio":19,"./samples":29}],10:[function(require,module,exports){
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

},{"./util":38}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instrument = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _instrument = require('./instrument.process_midievent');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Instrument = exports.Instrument = function () {
  function Instrument() {
    _classCallCheck(this, Instrument);

    this.scheduledSamples = {};
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
    value: function processMIDIEvent(event, time) {
      _instrument.processMIDIEvent.call(this, event, time);
    }

    // mandatory

  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      _instrument.allNotesOff.call(this);
    }
  }]);

  return Instrument;
}();

},{"./instrument.process_midievent":12}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processMIDIEvent = processMIDIEvent;
exports.allNotesOff = allNotesOff;

var _init_audio = require('./init_audio');

function processMIDIEvent(event, time) {
  var _this = this;

  //console.log(event, time)
  var sample = void 0;
  var unschedule = false;

  if (isNaN(time)) {
    // this shouldn't happen
    console.error('invalid time value');
    return;
    //time = context.currentTime
  }

  // two cases whereby the event neess to be processed immediately
  if (time === 0) {
    // this is an event that is send from an external MIDI keyboard
    time = _init_audio.context.currentTime;
  } else if (time === -1) {
    // this is an event that has been unscheduled by the scheduler, for instance because the event has been deleted
    time = _init_audio.context.currentTime;
    unschedule = true;
  }

  if (event.type === 144) {
    //console.log(144, ':', time, context.currentTime, event.millis)

    sample = this.createSample(event);
    this.scheduledSamples[event.midiNoteId] = sample;
    //console.log(sample)
    sample.output.connect(this.output || _init_audio.context.destination);
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

      // we don't want that the sustain pedal prevents the an event to unscheduled
      if (this.sustainPedalDown === true && unschedule === false) {
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
            dispatchEvent({
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
              dispatchEvent({
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

// allows you to call allNotesOff per track/instrument
function allNotesOff() {
  var _this2 = this;

  this.sustainedSamples = [];
  if (this.sustainPedalDown === true) {
    dispatchEvent({
      type: 'sustainpedal',
      data: 'up'
    });
  }
  this.sustainPedalDown = false;

  Object.keys(this.scheduledSamples).forEach(function (sampleId) {
    //console.log('  stopping', sampleId, this.id)
    var sample = _this2.scheduledSamples[sampleId];
    //console.log(sample)
    _this2.scheduledSamples[sampleId].stop(_init_audio.context.currentTime, function () {
      //console.log('allNotesOff', sample.event.midiNoteId)
      delete _this2.scheduledSamples[sample.event.midiNoteId];
    });
  });
  this.scheduledSamples = {};

  //console.log('allNotesOff', this.sustainedSamples.length, this.scheduledSamples)
}

},{"./init_audio":9}],13:[function(require,module,exports){
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

},{"./constants":5,"./init_audio":9,"./midi_event":14,"./parse_events":20,"./part":21,"./position":23,"./sampler":28,"./track":37,"./util":38}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// @ flow

var instanceIndex = 0;

var MIDIEvent = exports.MIDIEvent = function () {
  function MIDIEvent(ticks, type, data1) {
    var data2 = arguments.length <= 3 || arguments[3] === undefined ? -1 : arguments[3];

    _classCallCheck(this, MIDIEvent);

    this.id = this.constructor.name + "_" + instanceIndex++ + "_" + new Date().getTime();
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

},{"./util":38}],19:[function(require,module,exports){
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

},{"./eventlistener":6,"./init_audio":9,"./util":38,"isomorphic-fetch":3}],20:[function(require,module,exports){
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

},{"./midi_note":15,"./util":38}],21:[function(require,module,exports){
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

},{"./util":38}],22:[function(require,module,exports){
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
      //this.set('millis', this.song._millis)
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

},{"./eventlistener.js":6,"./position.js":23,"./util.js":38}],23:[function(require,module,exports){
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

},{"./util":38}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sampler = exports.SimpleSynth = exports.Instrument = exports.Part = exports.Track = exports.Song = exports.MIDINote = exports.MIDIEvent = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.parseMIDIFile = exports.parseSamples = exports.MIDIEventTypes = exports.getGMInstruments = exports.getInstruments = exports.setBufferTime = exports.init = exports.version = undefined;

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

var version = '1.0.0-beta19';

var getAudioContext = function getAudioContext() {
  return _init_audio.context;
};

var qambi = {
  version: version,

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

},{"./constants":5,"./eventlistener":6,"./init":8,"./init_audio":9,"./init_midi":10,"./instrument":11,"./midi_event":14,"./midi_note":15,"./midifile":17,"./parse_audio":19,"./part":21,"./sampler":28,"./settings":32,"./simple_synth":33,"./song":34,"./track":37}],25:[function(require,module,exports){
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

  //console.log(settings)
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
}

},{"./init_audio.js":9,"./util.js":38}],26:[function(require,module,exports){
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

},{"./init_audio":9,"./sample":25}],27:[function(require,module,exports){
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

},{"./init_audio":9,"./sample":25}],28:[function(require,module,exports){
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
  }]);

  return Sampler;
}(_instrument.Instrument);

},{"./fetch_helpers":7,"./instrument":11,"./note":18,"./parse_audio":19,"./sample_buffer":26,"./util":38}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{"filesaverjs":2}],31:[function(require,module,exports){
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
      this.looped = false;
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

      for (i = 0; i < numEvents; i++) {
        event = events[i];
        track = event._track;
        //console.log(event.millis, this.maxtime, this.prevMaxtime)

        // if(event.millis > this.maxtime){
        //   // skip events that were harvest accidently while jumping the playhead -> should happen very rarely if ever
        //   console.log('skip', event)
        //   continue
        // }

        if (event._part === null || track === null) {
          console.log(event);
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
  }, {
    key: 'reschedule',
    value: function reschedule() {
      var _this = this;

      var min = this.song._currentMillis;
      var max = min + _settings.bufferTime * 1000;

      //console.log('reschedule', this.notes.size)
      this.notes.forEach(function (note, id) {
        // console.log(note)
        // console.log(note.noteOn.millis, note.noteOff.millis, min, max)

        if (typeof note === 'undefined' || note.state === 'removed') {
          //sample.unschedule(0, unscheduleCallback);
          console.log('note is undefined');
          //sample.stop(0)
          _this.notes.delete(id);
        } else if ((note.noteOn.millis >= min && note.noteOff.millis < max) === false) {
          //sample.stop(0)
          var noteOn = note.noteOn;
          var noteOff = new _midi_event.MIDIEvent(0, 128, noteOn.data1, 0);
          noteOff.midiNoteId = note.id;
          noteOff.time = 0; //context.currentTime + min
          note._track.processMIDIEvent(noteOff);
          _this.notes.delete(id);
        }
      });
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

},{"./init_audio":9,"./init_midi":10,"./midi_event":14,"./settings":32,"./util":38}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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
    _this.scheduledSamples = {};
    _this.sustainedSamples = [];
    _this.sustainPedalDown = false;
    _this.sampleData = {
      type: type,
      releaseDuration: 0.3,
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

},{"./instrument":11,"./sample_oscillator":27}],34:[function(require,module,exports){
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
      this._pulse();
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

},{"./constants":5,"./eventlistener":6,"./init_audio":9,"./metronome":13,"./midi_event":14,"./parse_events":20,"./playhead":22,"./position":23,"./save_midifile":30,"./scheduler":31,"./settings":32,"./song.update":35,"./song_from_midifile":36,"./util":38}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.update = update;

var _parse_events = require('./parse_events');

var _util = require('./util');

var _constants = require('./constants');

var _position = require('./position');

var _midi_event = require('./midi_event');

var _eventlistener = require('./eventlistener');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // called by song


function update() {
  var _this = this;

  if (this._updateTimeEvents === false && this._removedEvents.length === 0 && this._newEvents.length === 0 && this._movedEvents.length === 0 && this._newParts.length === 0 && this._removedParts.length === 0 && this._resized === false) {
    return;
  }
  //debug
  //this.isPlaying = true

  console.group('update song');
  console.time('total');

  // TIME EVENTS

  // check if time events are updated
  if (this._updateTimeEvents === true) {
    //console.log('updateTimeEvents', this._timeEvents.length)
    (0, _parse_events.parseTimeEvents)(this, this._timeEvents, this.isPlaying);
    this._updateTimeEvents = false;
    console.log('time events %O', this._timeEvents);
  }

  // only parse new and moved events
  var tobeParsed = [];

  // PARTS

  // filter removed parts
  console.log('removed parts %O', this._removedParts);
  this._removedParts.forEach(function (part) {
    _this._partsById.delete(part.id);
  });

  // add new parts
  console.log('new parts %O', this._newParts);
  this._newParts.forEach(function (part) {
    part._song = _this;
    _this._partsById.set(part.id, part);
    part.update();
  });

  // update changed parts
  console.log('changed parts %O', this._changedParts);
  this._changedParts.forEach(function (part) {
    part.update();
  });

  // removed parts
  console.log('removed parts %O', this._changedParts);
  this._removedParts.forEach(function (part) {
    _this._partsById.delete(part.id);
  });

  if (this._removedParts.length > 0) {
    this._parts = Array.from(this._partsById.values());
  }

  // EVENTS

  // filter removed events
  console.log('removed events %O', this._removedEvents);
  this._removedEvents.forEach(function (event) {
    _this._notesById.delete(event.midiNote.id);
    _this._eventsById.delete(event.id);
  });

  // add new events
  console.log('new events %O', this._newEvents);
  this._newEvents.forEach(function (event) {
    _this._eventsById.set(event.id, event);
    _this._events.push(event);
    tobeParsed.push(event);
  });

  // moved events need to be parsed
  console.log('moved %O', this._movedEvents);
  this._movedEvents.forEach(function (event) {
    tobeParsed.push(event);
  });

  // parse all new and moved events
  if (tobeParsed.length > 0) {
    console.time('parse');
    //console.log('tobeParsed %O', tobeParsed)
    console.log('parseEvents', tobeParsed.length);

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
    console.timeEnd('parse');
  }

  if (tobeParsed.length > 0 || this._removedEvents.length > 0) {
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
  console.timeEnd('update song');

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

  console.log('length', this._lastEvent.ticks, this._lastEvent.millis, this.bars);

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

  console.log('current millis', this._currentMillis);
  this._playhead.updateSong();
  this._scheduler.init(this._currentMillis);
  this._scheduler.reschedule();

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

  console.groupEnd('update song');
}

},{"./constants":5,"./eventlistener":6,"./midi_event":14,"./parse_events":20,"./position":23,"./util":38}],36:[function(require,module,exports){
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

},{"./fetch_helpers":7,"./midi_event":14,"./midifile":17,"./part":21,"./song":34,"./track":37,"./util":38,"isomorphic-fetch":3}],37:[function(require,module,exports){
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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instanceIndex = 0;

var Track = exports.Track = function () {
  function Track() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    _classCallCheck(this, Track);

    this.id = this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();
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
    this.scheduledSamples = {};
    this.sustainedSamples = [];
    this.sustainPedalDown = false;
    //this.setInstrument(new Instrument('sinewave'))
  }

  _createClass(Track, [{
    key: 'setInstrument',
    value: function setInstrument() {
      var instrument = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (instrument !== null
      // check if the mandatory functions of an instrument are present (Interface Instrument)
       && typeof instrument.connect === 'function' && typeof instrument.disconnect === 'function' && typeof instrument.processMIDIEvent === 'function' && typeof instrument.allNotesOff === 'function') {
        this.removeInstrument();
        this._instrument = instrument;
        this._instrument.connect(this._output);
      } else if (instrument === null) {
        // if you pass null as argument the current instrument will be removed, same as removeInstrument
        this.removeInstrument();
      } else {
        console.log('Invalid instrument, and instrument should have the methods "connect", "disconnect", "processMIDIEvent" and "allNotesOff"');
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
              midiEvent.time = 0; // play immediately -> see Instrument.processMIDIEvent
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
    key: 'setPanning',
    value: function setPanning() {
      // add pannernode -> reverb will be an channel FX
    }
  }, {
    key: 'addEffect',
    value: function addEffect() {}
  }, {
    key: 'addEffectAt',
    value: function addEffectAt(index) {}
  }, {
    key: 'removeEffect',
    value: function removeEffect(index) {}
  }, {
    key: 'getEffects',
    value: function getEffects() {}
  }, {
    key: 'getEffectAt',
    value: function getEffectAt(index) {}

    // method is called by scheduler during playback and directly when used with an external keyboard

  }, {
    key: 'processMIDIEvent',
    value: function processMIDIEvent(event) {
      var useLatency = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


      var latency = useLatency ? this.latency : 0;

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
  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      if (this._instrument !== null) {
        this._instrument.allNotesOff();
      }
    }
  }]);

  return Track;
}();

},{"./init_audio":9,"./init_midi":10,"./midi_event":14,"./midi_note":15,"./part":21,"./qambi":24,"./util":38}],38:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtaWRpLXJlY29yZGluZy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9maWxlc2F2ZXJqcy9GaWxlU2F2ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvaXNvbW9ycGhpYy1mZXRjaC9mZXRjaC1ucG0tYnJvd3NlcmlmeS5qcyIsIi4uL25vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCIuLi9zcmMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL2V2ZW50bGlzdGVuZXIuanMiLCIuLi9zcmMvZmV0Y2hfaGVscGVycy5qcyIsIi4uL3NyYy9pbml0LmpzIiwiLi4vc3JjL2luaXRfYXVkaW8uanMiLCIuLi9zcmMvaW5pdF9taWRpLmpzIiwiLi4vc3JjL2luc3RydW1lbnQuanMiLCIuLi9zcmMvaW5zdHJ1bWVudC5wcm9jZXNzX21pZGlldmVudC5qcyIsIi4uL3NyYy9tZXRyb25vbWUuanMiLCIuLi9zcmMvbWlkaV9ldmVudC5qcyIsIi4uL3NyYy9taWRpX25vdGUuanMiLCIuLi9zcmMvbWlkaV9zdHJlYW0uanMiLCIuLi9zcmMvbWlkaWZpbGUuanMiLCIuLi9zcmMvbm90ZS5qcyIsIi4uL3NyYy9wYXJzZV9hdWRpby5qcyIsIi4uL3NyYy9wYXJzZV9ldmVudHMuanMiLCIuLi9zcmMvcGFydC5qcyIsIi4uL3NyYy9wbGF5aGVhZC5qcyIsIi4uL3NyYy9wb3NpdGlvbi5qcyIsIi4uL3NyYy9xYW1iaS5qcyIsIi4uL3NyYy9zYW1wbGUuanMiLCIuLi9zcmMvc2FtcGxlX2J1ZmZlci5qcyIsIi4uL3NyYy9zYW1wbGVfb3NjaWxsYXRvci5qcyIsIi4uL3NyYy9zYW1wbGVyLmpzIiwiLi4vc3JjL3NhbXBsZXMuanMiLCIuLi9zcmMvc2F2ZV9taWRpZmlsZS5qcyIsIi4uL3NyYy9zY2hlZHVsZXIuanMiLCIuLi9zcmMvc2V0dGluZ3MuanMiLCIuLi9zcmMvc2ltcGxlX3N5bnRoLmpzIiwiLi4vc3JjL3NvbmcuanMiLCIuLi9zcmMvc29uZy51cGRhdGUuanMiLCIuLi9zcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwiLi4vc3JjL3RyYWNrLmpzIiwiLi4vc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7QUFRQSxTQUFTLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFVOztBQUV0RCxrQkFBTSxJQUFOLEdBQ0MsSUFERCxDQUNNLFlBQU07QUFDVjtBQUNELEdBSEQ7QUFJRCxDQU5EOztBQVNBLFNBQVMsSUFBVCxHQUFlO0FBQ2IsTUFBSSxPQUFPLGdCQUFTLEVBQUMsTUFBTSxDQUFQLEVBQVUsVUFBVSxLQUFwQixFQUFULENBQVg7QUFDQSxNQUFJLFFBQVEsa0JBQVo7QUFDQSxRQUFNLGdCQUFOLENBQXVCLE1BQXZCO0FBQ0EsUUFBTSxhQUFOLENBQW9CLHVCQUFnQixRQUFoQixDQUFwQjtBQUNBLE9BQUssU0FBTCxDQUFlLEtBQWY7QUFDQSxPQUFLLE1BQUw7O0FBRUEsTUFBSSxVQUFVLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFkO0FBQ0EsTUFBSSxXQUFXLFNBQVMsY0FBVCxDQUF3QixPQUF4QixDQUFmO0FBQ0EsTUFBSSxVQUFVLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFkO0FBQ0EsTUFBSSxZQUFZLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUFoQjtBQUNBLE1BQUksZ0JBQWdCLFNBQVMsY0FBVCxDQUF3QixhQUF4QixDQUFwQjtBQUNBLE1BQUksZUFBZSxTQUFTLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBbkI7QUFDQSxNQUFJLFdBQVcsU0FBUyxjQUFULENBQXdCLE9BQXhCLENBQWY7QUFDQSxNQUFJLGNBQWMsU0FBUyxjQUFULENBQXdCLFVBQXhCLENBQWxCO0FBQ0EsTUFBSSxrQkFBa0IsU0FBUyxjQUFULENBQXdCLGVBQXhCLENBQXRCO0FBQ0EsTUFBSSxnQkFBZ0IsU0FBUyxjQUFULENBQXdCLFVBQXhCLENBQXBCO0FBQ0EsTUFB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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UDtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBxYW1iaSwge1xuICBTb25nLFxuICBUcmFjayxcbiAgU2ltcGxlU3ludGgsXG4gIGdldE1JRElJbnB1dHMsXG59IGZyb20gJy4uLy4uL3NyYy9xYW1iaSdcblxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblxuICBxYW1iaS5pbml0KClcbiAgLnRoZW4oKCkgPT4ge1xuICAgIG1haW4oKVxuICB9KVxufSlcblxuXG5mdW5jdGlvbiBtYWluKCl7XG4gIGxldCBzb25nID0gbmV3IFNvbmcoe2JhcnM6IDQsIGF1dG9TaXplOiBmYWxzZX0pXG4gIGxldCB0cmFjayA9IG5ldyBUcmFjaygpXG4gIHRyYWNrLnNldFJlY29yZEVuYWJsZWQoJ21pZGknKVxuICB0cmFjay5zZXRJbnN0cnVtZW50KG5ldyBTaW1wbGVTeW50aCgnc3F1YXJlJykpXG4gIHNvbmcuYWRkVHJhY2tzKHRyYWNrKVxuICBzb25nLnVwZGF0ZSgpXG5cbiAgbGV0IGJ0blBsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheScpXG4gIGxldCBidG5QYXVzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXVzZScpXG4gIGxldCBidG5TdG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3AnKVxuICBsZXQgYnRuUmVjb3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY29yZCcpXG4gIGxldCBidG5VbmRvUmVjb3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY29yZC11bmRvJylcbiAgbGV0IGJ0bk1ldHJvbm9tZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZXRyb25vbWUnKVxuICBsZXQgZGl2VGVtcG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVtcG8nKVxuICBsZXQgZGl2UG9zaXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zaXRpb24nKVxuICBsZXQgZGl2UG9zaXRpb25UaW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bvc2l0aW9uX3RpbWUnKVxuICBsZXQgcmFuZ2VQb3NpdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5aGVhZCcpXG4gIGxldCBzZWxlY3RNSURJSW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlkaWluJylcbiAgbGV0IHNlbGVjdFByZWNvdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByZWNvdW50JylcbiAgbGV0IHVzZXJJbnRlcmFjdGlvbiA9IGZhbHNlXG5cbiAgYnRuUGxheS5kaXNhYmxlZCA9IGZhbHNlXG4gIGJ0blBhdXNlLmRpc2FibGVkID0gZmFsc2VcbiAgYnRuU3RvcC5kaXNhYmxlZCA9IGZhbHNlXG4gIGJ0blJlY29yZC5kaXNhYmxlZCA9IGZhbHNlXG4gIGJ0bk1ldHJvbm9tZS5kaXNhYmxlZCA9IGZhbHNlXG5cblxuICBsZXQgTUlESUlucHV0cyA9IGdldE1JRElJbnB1dHMoKVxuICBsZXQgaHRtbCA9ICc8b3B0aW9uIGlkPVwiLTFcIj5zZWxlY3QgTUlESSBpbjwvb3B0aW9uPidcbiAgTUlESUlucHV0cy5mb3JFYWNoKHBvcnQgPT4ge1xuICAgIGh0bWwgKz0gYDxvcHRpb24gaWQ9XCIke3BvcnQuaWR9XCI+JHtwb3J0Lm5hbWV9PC9vcHRpb24+YFxuICB9KVxuICBzZWxlY3RNSURJSW4uaW5uZXJIVE1MID0gaHRtbFxuXG4gIHNlbGVjdE1JRElJbi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBlID0+IHtcbiAgICBsZXQgcG9ydElkID0gc2VsZWN0TUlESUluLm9wdGlvbnNbc2VsZWN0TUlESUluLnNlbGVjdGVkSW5kZXhdLmlkXG4gICAgdHJhY2suZGlzY29ubmVjdE1JRElJbnB1dHMoKSAvLyBubyBhcmd1bWVudHMgbWVhbnMgZGlzY29ubmVjdCBmcm9tIGFsbCBpbnB1dHNcbiAgICB0cmFjay5jb25uZWN0TUlESUlucHV0cyhwb3J0SWQpXG4gIH0pXG5cbiAgc2VsZWN0UHJlY291bnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZSA9PiB7XG4gICAgbGV0IG51bUJhcnMgPSBwYXJzZUludChzZWxlY3RQcmVjb3VudC5vcHRpb25zW3NlbGVjdFByZWNvdW50LnNlbGVjdGVkSW5kZXhdLmlkLCAxMClcbiAgICBzb25nLnNldFByZWNvdW50KG51bUJhcnMpXG4gIH0pXG5cbiAgYnRuTWV0cm9ub21lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzb25nLnNldE1ldHJvbm9tZSgpIC8vIGlmIG5vIGFyZ3VtZW50cyBhcmUgcHJvdmlkZWQgaXQgc2ltcGx5IHRvZ2dsZXNcbiAgICBidG5NZXRyb25vbWUuaW5uZXJIVE1MID0gc29uZy51c2VNZXRyb25vbWUgPyAnbWV0cm9ub21lIG9mZicgOiAnbWV0cm9ub21lIG9uJ1xuICB9KVxuXG4gIGJ0blBsYXkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHNvbmcucGxheSgpXG4gIH0pXG5cbiAgYnRuUGF1c2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHNvbmcucGF1c2UoKVxuICB9KVxuXG4gIGJ0blN0b3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHNvbmcuc3RvcCgpXG4gIH0pXG5cbiAgYnRuUmVjb3JkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBpZihidG5SZWNvcmQuY2xhc3NOYW1lID09PSAnbmV1dHJhbCcpe1xuICAgICAgc29uZy5zdGFydFJlY29yZGluZygpXG4gICAgICBidG5SZWNvcmQuY2xhc3NOYW1lID0gJ3JlY29yZGluZydcbiAgICB9ZWxzZSBpZihidG5SZWNvcmQuY2xhc3NOYW1lID09PSAncmVjb3JkaW5nJyl7XG4gICAgICBzb25nLnN0b3BSZWNvcmRpbmcoKVxuICAgICAgYnRuUmVjb3JkLmNsYXNzTmFtZSA9ICduZXV0cmFsJ1xuICAgIH1cbiAgfSlcblxuICBidG5VbmRvUmVjb3JkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBpZihidG5VbmRvUmVjb3JkLmlubmVySFRNTCA9PT0gJ3VuZG8gcmVjb3JkJyl7XG4gICAgICBzb25nLnVuZG9SZWNvcmRpbmcoKVxuICAgICAgYnRuVW5kb1JlY29yZC5pbm5lckhUTUwgPSAncmVkbyByZWNvcmQnXG4gICAgfWVsc2V7XG4gICAgICBzb25nLnJlZG9SZWNvcmRpbmcoKVxuICAgICAgYnRuVW5kb1JlY29yZC5pbm5lckhUTUwgPSAndW5kbyByZWNvcmQnXG4gICAgfVxuICB9KVxuXG4gIGxldCBwb3NpdGlvbiA9IHNvbmcuZ2V0UG9zaXRpb24oKVxuICBkaXZQb3NpdGlvbi5pbm5lckhUTUwgPSBwb3NpdGlvbi5iYXJzQXNTdHJpbmdcbiAgZGl2UG9zaXRpb25UaW1lLmlubmVySFRNTCA9IHBvc2l0aW9uLnRpbWVBc1N0cmluZ1xuICBkaXZUZW1wby5pbm5lckhUTUwgPSBgdGVtcG86ICR7cG9zaXRpb24uYnBtfSBicG1gXG5cbiAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdwb3NpdGlvbicsIGV2ZW50ID0+IHtcbiAgICBkaXZQb3NpdGlvbi5pbm5lckhUTUwgPSBldmVudC5kYXRhLmJhcnNBc1N0cmluZ1xuICAgIGRpdlBvc2l0aW9uVGltZS5pbm5lckhUTUwgPSBldmVudC5kYXRhLnRpbWVBc1N0cmluZ1xuICAgIGRpdlRlbXBvLmlubmVySFRNTCA9IGB0ZW1wbzogJHtldmVudC5kYXRhLmJwbX0gYnBtYFxuICAgIGlmKCF1c2VySW50ZXJhY3Rpb24pe1xuICAgICAgcmFuZ2VQb3NpdGlvbi52YWx1ZSA9IGV2ZW50LmRhdGEucGVyY2VudGFnZVxuICAgIH1cbiAgfSlcblxuICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ3N0b3BfcmVjb3JkaW5nJywgZSA9PiB7XG4gICAgYnRuVW5kb1JlY29yZC5kaXNhYmxlZCA9IGZhbHNlXG4gICAgYnRuUmVjb3JkLmNsYXNzTmFtZSA9ICduZXV0cmFsJ1xuICB9KVxuXG4gIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignc3RhcnRfcmVjb3JkaW5nJywgZSA9PiB7XG4gICAgYnRuVW5kb1JlY29yZC5kaXNhYmxlZCA9IHRydWVcbiAgfSlcblxuICByYW5nZVBvc2l0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBlID0+IHtcbiAgICByYW5nZVBvc2l0aW9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHJhbmdlTGlzdGVuZXIpXG4gICAgdXNlckludGVyYWN0aW9uID0gZmFsc2VcbiAgfSlcblxuICByYW5nZVBvc2l0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGUgPT4ge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcuc2V0UG9zaXRpb24oJ3BlcmNlbnRhZ2UnLCBlLnRhcmdldC52YWx1ZUFzTnVtYmVyKVxuICAgIH0sIDApXG4gICAgcmFuZ2VQb3NpdGlvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByYW5nZUxpc3RlbmVyKVxuICAgIHVzZXJJbnRlcmFjdGlvbiA9IHRydWVcbiAgfSlcblxuICBjb25zdCByYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgc29uZy5zZXRQb3NpdGlvbigncGVyY2VudGFnZScsIGUudGFyZ2V0LnZhbHVlQXNOdW1iZXIpXG4gIH1cbn1cbiIsIi8qIEZpbGVTYXZlci5qc1xuICogQSBzYXZlQXMoKSBGaWxlU2F2ZXIgaW1wbGVtZW50YXRpb24uXG4gKiAxLjEuMjAxNjAzMjhcbiAqXG4gKiBCeSBFbGkgR3JleSwgaHR0cDovL2VsaWdyZXkuY29tXG4gKiBMaWNlbnNlOiBNSVRcbiAqICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbGlncmV5L0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4gKi9cblxuLypnbG9iYWwgc2VsZiAqL1xuLypqc2xpbnQgYml0d2lzZTogdHJ1ZSwgaW5kZW50OiA0LCBsYXhicmVhazogdHJ1ZSwgbGF4Y29tbWE6IHRydWUsIHNtYXJ0dGFiczogdHJ1ZSwgcGx1c3BsdXM6IHRydWUgKi9cblxuLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cblxudmFyIHNhdmVBcyA9IHNhdmVBcyB8fCAoZnVuY3Rpb24odmlldykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0Ly8gSUUgPDEwIGlzIGV4cGxpY2l0bHkgdW5zdXBwb3J0ZWRcblx0aWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgL01TSUUgWzEtOV1cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyXG5cdFx0ICBkb2MgPSB2aWV3LmRvY3VtZW50XG5cdFx0ICAvLyBvbmx5IGdldCBVUkwgd2hlbiBuZWNlc3NhcnkgaW4gY2FzZSBCbG9iLmpzIGhhc24ndCBvdmVycmlkZGVuIGl0IHlldFxuXHRcdCwgZ2V0X1VSTCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHZpZXcuVVJMIHx8IHZpZXcud2Via2l0VVJMIHx8IHZpZXc7XG5cdFx0fVxuXHRcdCwgc2F2ZV9saW5rID0gZG9jLmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIiwgXCJhXCIpXG5cdFx0LCBjYW5fdXNlX3NhdmVfbGluayA9IFwiZG93bmxvYWRcIiBpbiBzYXZlX2xpbmtcblx0XHQsIGNsaWNrID0gZnVuY3Rpb24obm9kZSkge1xuXHRcdFx0dmFyIGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKTtcblx0XHRcdG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG5cdFx0fVxuXHRcdCwgaXNfc2FmYXJpID0gL1ZlcnNpb25cXC9bXFxkXFwuXSsuKlNhZmFyaS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KVxuXHRcdCwgd2Via2l0X3JlcV9mcyA9IHZpZXcud2Via2l0UmVxdWVzdEZpbGVTeXN0ZW1cblx0XHQsIHJlcV9mcyA9IHZpZXcucmVxdWVzdEZpbGVTeXN0ZW0gfHwgd2Via2l0X3JlcV9mcyB8fCB2aWV3Lm1velJlcXVlc3RGaWxlU3lzdGVtXG5cdFx0LCB0aHJvd19vdXRzaWRlID0gZnVuY3Rpb24oZXgpIHtcblx0XHRcdCh2aWV3LnNldEltbWVkaWF0ZSB8fCB2aWV3LnNldFRpbWVvdXQpKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aHJvdyBleDtcblx0XHRcdH0sIDApO1xuXHRcdH1cblx0XHQsIGZvcmNlX3NhdmVhYmxlX3R5cGUgPSBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiXG5cdFx0LCBmc19taW5fc2l6ZSA9IDBcblx0XHQvLyB0aGUgQmxvYiBBUEkgaXMgZnVuZGFtZW50YWxseSBicm9rZW4gYXMgdGhlcmUgaXMgbm8gXCJkb3dubG9hZGZpbmlzaGVkXCIgZXZlbnQgdG8gc3Vic2NyaWJlIHRvXG5cdFx0LCBhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQgPSAxMDAwICogNDAgLy8gaW4gbXNcblx0XHQsIHJldm9rZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdHZhciByZXZva2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHR9IGVsc2UgeyAvLyBmaWxlIGlzIGEgRmlsZVxuXHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHQvKiAvLyBUYWtlIG5vdGUgVzNDOlxuXHRcdFx0dmFyXG5cdFx0XHQgIHVyaSA9IHR5cGVvZiBmaWxlID09PSBcInN0cmluZ1wiID8gZmlsZSA6IGZpbGUudG9VUkwoKVxuXHRcdFx0LCByZXZva2VyID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdC8vIGlkZWFseSBEb3dubG9hZEZpbmlzaGVkRXZlbnQuZGF0YSB3b3VsZCBiZSB0aGUgVVJMIHJlcXVlc3RlZFxuXHRcdFx0XHRpZiAoZXZ0LmRhdGEgPT09IHVyaSkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRcdGdldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHsgLy8gZmlsZSBpcyBhIEZpbGVcblx0XHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQ7XG5cdFx0XHR2aWV3LmFkZEV2ZW50TGlzdGVuZXIoXCJkb3dubG9hZGZpbmlzaGVkXCIsIHJldm9rZXIpO1xuXHRcdFx0Ki9cblx0XHRcdHNldFRpbWVvdXQocmV2b2tlciwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0KTtcblx0XHR9XG5cdFx0LCBkaXNwYXRjaCA9IGZ1bmN0aW9uKGZpbGVzYXZlciwgZXZlbnRfdHlwZXMsIGV2ZW50KSB7XG5cdFx0XHRldmVudF90eXBlcyA9IFtdLmNvbmNhdChldmVudF90eXBlcyk7XG5cdFx0XHR2YXIgaSA9IGV2ZW50X3R5cGVzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0dmFyIGxpc3RlbmVyID0gZmlsZXNhdmVyW1wib25cIiArIGV2ZW50X3R5cGVzW2ldXTtcblx0XHRcdFx0aWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGxpc3RlbmVyLmNhbGwoZmlsZXNhdmVyLCBldmVudCB8fCBmaWxlc2F2ZXIpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGV4KSB7XG5cdFx0XHRcdFx0XHR0aHJvd19vdXRzaWRlKGV4KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0LCBhdXRvX2JvbSA9IGZ1bmN0aW9uKGJsb2IpIHtcblx0XHRcdC8vIHByZXBlbmQgQk9NIGZvciBVVEYtOCBYTUwgYW5kIHRleHQvKiB0eXBlcyAoaW5jbHVkaW5nIEhUTUwpXG5cdFx0XHRpZiAoL15cXHMqKD86dGV4dFxcL1xcUyp8YXBwbGljYXRpb25cXC94bWx8XFxTKlxcL1xcUypcXCt4bWwpXFxzKjsuKmNoYXJzZXRcXHMqPVxccyp1dGYtOC9pLnRlc3QoYmxvYi50eXBlKSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2IoW1wiXFx1ZmVmZlwiLCBibG9iXSwge3R5cGU6IGJsb2IudHlwZX0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGJsb2I7XG5cdFx0fVxuXHRcdCwgRmlsZVNhdmVyID0gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRmlyc3QgdHJ5IGEuZG93bmxvYWQsIHRoZW4gd2ViIGZpbGVzeXN0ZW0sIHRoZW4gb2JqZWN0IFVSTHNcblx0XHRcdHZhclxuXHRcdFx0XHQgIGZpbGVzYXZlciA9IHRoaXNcblx0XHRcdFx0LCB0eXBlID0gYmxvYi50eXBlXG5cdFx0XHRcdCwgYmxvYl9jaGFuZ2VkID0gZmFsc2Vcblx0XHRcdFx0LCBvYmplY3RfdXJsXG5cdFx0XHRcdCwgdGFyZ2V0X3ZpZXdcblx0XHRcdFx0LCBkaXNwYXRjaF9hbGwgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSB3cml0ZWVuZFwiLnNwbGl0KFwiIFwiKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gb24gYW55IGZpbGVzeXMgZXJyb3JzIHJldmVydCB0byBzYXZpbmcgd2l0aCBvYmplY3QgVVJMc1xuXHRcdFx0XHQsIGZzX2Vycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKHRhcmdldF92aWV3ICYmIGlzX3NhZmFyaSAmJiB0eXBlb2YgRmlsZVJlYWRlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRcdFx0Ly8gU2FmYXJpIGRvZXNuJ3QgYWxsb3cgZG93bmxvYWRpbmcgb2YgYmxvYiB1cmxzXG5cdFx0XHRcdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdFx0XHRcdHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGJhc2U2NERhdGEgPSByZWFkZXIucmVzdWx0O1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gXCJkYXRhOmF0dGFjaG1lbnQvZmlsZVwiICsgYmFzZTY0RGF0YS5zbGljZShiYXNlNjREYXRhLnNlYXJjaCgvWyw7XS8pKTtcblx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7XG5cdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5JTklUO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBkb24ndCBjcmVhdGUgbW9yZSBvYmplY3QgVVJMcyB0aGFuIG5lZWRlZFxuXHRcdFx0XHRcdGlmIChibG9iX2NoYW5nZWQgfHwgIW9iamVjdF91cmwpIHtcblx0XHRcdFx0XHRcdG9iamVjdF91cmwgPSBnZXRfVVJMKCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGFyZ2V0X3ZpZXcpIHtcblx0XHRcdFx0XHRcdHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgbmV3X3RhYiA9IHZpZXcub3BlbihvYmplY3RfdXJsLCBcIl9ibGFua1wiKTtcblx0XHRcdFx0XHRcdGlmIChuZXdfdGFiID09PSB1bmRlZmluZWQgJiYgaXNfc2FmYXJpKSB7XG5cdFx0XHRcdFx0XHRcdC8vQXBwbGUgZG8gbm90IGFsbG93IHdpbmRvdy5vcGVuLCBzZWUgaHR0cDovL2JpdC5seS8xa1pmZlJJXG5cdFx0XHRcdFx0XHRcdHZpZXcubG9jYXRpb24uaHJlZiA9IG9iamVjdF91cmxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRyZXZva2Uob2JqZWN0X3VybCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0LCBhYm9ydGFibGUgPSBmdW5jdGlvbihmdW5jKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKGZpbGVzYXZlci5yZWFkeVN0YXRlICE9PSBmaWxlc2F2ZXIuRE9ORSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0LCBjcmVhdGVfaWZfbm90X2ZvdW5kID0ge2NyZWF0ZTogdHJ1ZSwgZXhjbHVzaXZlOiBmYWxzZX1cblx0XHRcdFx0LCBzbGljZVxuXHRcdFx0O1xuXHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblx0XHRcdGlmICghbmFtZSkge1xuXHRcdFx0XHRuYW1lID0gXCJkb3dubG9hZFwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbl91c2Vfc2F2ZV9saW5rKSB7XG5cdFx0XHRcdG9iamVjdF91cmwgPSBnZXRfVVJMKCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHNhdmVfbGluay5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHRzYXZlX2xpbmsuZG93bmxvYWQgPSBuYW1lO1xuXHRcdFx0XHRcdGNsaWNrKHNhdmVfbGluayk7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHQvLyBPYmplY3QgYW5kIHdlYiBmaWxlc3lzdGVtIFVSTHMgaGF2ZSBhIHByb2JsZW0gc2F2aW5nIGluIEdvb2dsZSBDaHJvbWUgd2hlblxuXHRcdFx0Ly8gdmlld2VkIGluIGEgdGFiLCBzbyBJIGZvcmNlIHNhdmUgd2l0aCBhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cblx0XHRcdC8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkxMTU4XG5cdFx0XHQvLyBVcGRhdGU6IEdvb2dsZSBlcnJhbnRseSBjbG9zZWQgOTExNTgsIEkgc3VibWl0dGVkIGl0IGFnYWluOlxuXHRcdFx0Ly8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTM4OTY0MlxuXHRcdFx0aWYgKHZpZXcuY2hyb21lICYmIHR5cGUgJiYgdHlwZSAhPT0gZm9yY2Vfc2F2ZWFibGVfdHlwZSkge1xuXHRcdFx0XHRzbGljZSA9IGJsb2Iuc2xpY2UgfHwgYmxvYi53ZWJraXRTbGljZTtcblx0XHRcdFx0YmxvYiA9IHNsaWNlLmNhbGwoYmxvYiwgMCwgYmxvYi5zaXplLCBmb3JjZV9zYXZlYWJsZV90eXBlKTtcblx0XHRcdFx0YmxvYl9jaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdC8vIFNpbmNlIEkgY2FuJ3QgYmUgc3VyZSB0aGF0IHRoZSBndWVzc2VkIG1lZGlhIHR5cGUgd2lsbCB0cmlnZ2VyIGEgZG93bmxvYWRcblx0XHRcdC8vIGluIFdlYktpdCwgSSBhcHBlbmQgLmRvd25sb2FkIHRvIHRoZSBmaWxlbmFtZS5cblx0XHRcdC8vIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD02NTQ0MFxuXHRcdFx0aWYgKHdlYmtpdF9yZXFfZnMgJiYgbmFtZSAhPT0gXCJkb3dubG9hZFwiKSB7XG5cdFx0XHRcdG5hbWUgKz0gXCIuZG93bmxvYWRcIjtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlID09PSBmb3JjZV9zYXZlYWJsZV90eXBlIHx8IHdlYmtpdF9yZXFfZnMpIHtcblx0XHRcdFx0dGFyZ2V0X3ZpZXcgPSB2aWV3O1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFyZXFfZnMpIHtcblx0XHRcdFx0ZnNfZXJyb3IoKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0ZnNfbWluX3NpemUgKz0gYmxvYi5zaXplO1xuXHRcdFx0cmVxX2ZzKHZpZXcuVEVNUE9SQVJZLCBmc19taW5fc2l6ZSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZzKSB7XG5cdFx0XHRcdGZzLnJvb3QuZ2V0RGlyZWN0b3J5KFwic2F2ZWRcIiwgY3JlYXRlX2lmX25vdF9mb3VuZCwgYWJvcnRhYmxlKGZ1bmN0aW9uKGRpcikge1xuXHRcdFx0XHRcdHZhciBzYXZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXIuZ2V0RmlsZShuYW1lLCBjcmVhdGVfaWZfbm90X2ZvdW5kLCBhYm9ydGFibGUoZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHRcdFx0XHRmaWxlLmNyZWF0ZVdyaXRlcihhYm9ydGFibGUoZnVuY3Rpb24od3JpdGVyKSB7XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLm9ud3JpdGVlbmQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZiA9IGZpbGUudG9VUkwoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdFx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwid3JpdGVlbmRcIiwgZXZlbnQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV2b2tlKGZpbGUpO1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBlcnJvciA9IHdyaXRlci5lcnJvcjtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChlcnJvci5jb2RlICE9PSBlcnJvci5BQk9SVF9FUlIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZnNfZXJyb3IoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSBhYm9ydFwiLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR3cml0ZXJbXCJvblwiICsgZXZlbnRdID0gZmlsZXNhdmVyW1wib25cIiArIGV2ZW50XTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR3cml0ZXIud3JpdGUoYmxvYik7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR3cml0ZXIuYWJvcnQoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5XUklUSU5HO1xuXHRcdFx0XHRcdFx0XHR9KSwgZnNfZXJyb3IpO1xuXHRcdFx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGRpci5nZXRGaWxlKG5hbWUsIHtjcmVhdGU6IGZhbHNlfSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdC8vIGRlbGV0ZSBmaWxlIGlmIGl0IGFscmVhZHkgZXhpc3RzXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0c2F2ZSgpO1xuXHRcdFx0XHRcdH0pLCBhYm9ydGFibGUoZnVuY3Rpb24oZXgpIHtcblx0XHRcdFx0XHRcdGlmIChleC5jb2RlID09PSBleC5OT1RfRk9VTkRfRVJSKSB7XG5cdFx0XHRcdFx0XHRcdHNhdmUoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSkpO1xuXHRcdFx0XHR9KSwgZnNfZXJyb3IpO1xuXHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHR9XG5cdFx0LCBGU19wcm90byA9IEZpbGVTYXZlci5wcm90b3R5cGVcblx0XHQsIHNhdmVBcyA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbGVTYXZlcihibG9iLCBuYW1lLCBub19hdXRvX2JvbSk7XG5cdFx0fVxuXHQ7XG5cdC8vIElFIDEwKyAobmF0aXZlIHNhdmVBcylcblx0aWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgbmF2aWdhdG9yLm1zU2F2ZU9yT3BlbkJsb2IpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKGJsb2IsIG5hbWUgfHwgXCJkb3dubG9hZFwiKTtcblx0XHR9O1xuXHR9XG5cblx0RlNfcHJvdG8uYWJvcnQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZmlsZXNhdmVyID0gdGhpcztcblx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdGRpc3BhdGNoKGZpbGVzYXZlciwgXCJhYm9ydFwiKTtcblx0fTtcblx0RlNfcHJvdG8ucmVhZHlTdGF0ZSA9IEZTX3Byb3RvLklOSVQgPSAwO1xuXHRGU19wcm90by5XUklUSU5HID0gMTtcblx0RlNfcHJvdG8uRE9ORSA9IDI7XG5cblx0RlNfcHJvdG8uZXJyb3IgPVxuXHRGU19wcm90by5vbndyaXRlc3RhcnQgPVxuXHRGU19wcm90by5vbnByb2dyZXNzID1cblx0RlNfcHJvdG8ub253cml0ZSA9XG5cdEZTX3Byb3RvLm9uYWJvcnQgPVxuXHRGU19wcm90by5vbmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZWVuZCA9XG5cdFx0bnVsbDtcblxuXHRyZXR1cm4gc2F2ZUFzO1xufShcblx0ICAgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgJiYgc2VsZlxuXHR8fCB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvd1xuXHR8fCB0aGlzLmNvbnRlbnRcbikpO1xuLy8gYHNlbGZgIGlzIHVuZGVmaW5lZCBpbiBGaXJlZm94IGZvciBBbmRyb2lkIGNvbnRlbnQgc2NyaXB0IGNvbnRleHRcbi8vIHdoaWxlIGB0aGlzYCBpcyBuc0lDb250ZW50RnJhbWVNZXNzYWdlTWFuYWdlclxuLy8gd2l0aCBhbiBhdHRyaWJ1dGUgYGNvbnRlbnRgIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHdpbmRvd1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cy5zYXZlQXMgPSBzYXZlQXM7XG59IGVsc2UgaWYgKCh0eXBlb2YgZGVmaW5lICE9PSBcInVuZGVmaW5lZFwiICYmIGRlZmluZSAhPT0gbnVsbCkgJiYgKGRlZmluZS5hbWQgIT09IG51bGwpKSB7XG4gIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNhdmVBcztcbiAgfSk7XG59XG4iLCIvLyB0aGUgd2hhdHdnLWZldGNoIHBvbHlmaWxsIGluc3RhbGxzIHRoZSBmZXRjaCgpIGZ1bmN0aW9uXG4vLyBvbiB0aGUgZ2xvYmFsIG9iamVjdCAod2luZG93IG9yIHNlbGYpXG4vL1xuLy8gUmV0dXJuIHRoYXQgYXMgdGhlIGV4cG9ydCBmb3IgdXNlIGluIFdlYnBhY2ssIEJyb3dzZXJpZnkgZXRjLlxucmVxdWlyZSgnd2hhdHdnLWZldGNoJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHNlbGYuZmV0Y2guYmluZChzZWxmKTtcbiIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgc2VhcmNoUGFyYW1zOiAnVVJMU2VhcmNoUGFyYW1zJyBpbiBzZWxmLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbiAgZnVuY3Rpb24gaXRlcmF0b3JGb3IoaXRlbXMpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlcmF0b3JcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSwgdGhpcylcblxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBsaXN0ID0gdGhpcy5tYXBbbmFtZV1cbiAgICBpZiAoIWxpc3QpIHtcbiAgICAgIGxpc3QgPSBbXVxuICAgICAgdGhpcy5tYXBbbmFtZV0gPSBsaXN0XG4gICAgfVxuICAgIGxpc3QucHVzaCh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgICByZXR1cm4gdmFsdWVzID8gdmFsdWVzWzBdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSB8fCBbXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IFtub3JtYWxpemVWYWx1ZSh2YWx1ZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLm1hcCkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aGlzLm1hcFtuYW1lXS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIG5hbWUsIHRoaXMpXG4gICAgICB9LCB0aGlzKVxuICAgIH0sIHRoaXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChuYW1lKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IGl0ZW1zLnB1c2godmFsdWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgICB9IGVsc2UgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAvLyBPbmx5IHN1cHBvcnQgQXJyYXlCdWZmZXJzIGZvciBQT1NUIG1ldGhvZC5cbiAgICAgICAgLy8gUmVjZWl2aW5nIEFycmF5QnVmZmVycyBoYXBwZW5zIHZpYSBCbG9icywgaW5zdGVhZC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIHJldHVybiByZWplY3RlZCA/IHJlamVjdGVkIDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuICAgIGlmIChSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IGlucHV0XG4gICAgfVxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSlcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhlYWRlcnMoeGhyKSB7XG4gICAgdmFyIGhlYWQgPSBuZXcgSGVhZGVycygpXG4gICAgdmFyIHBhaXJzID0gKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJykudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgIHBhaXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICB2YXIgc3BsaXQgPSBoZWFkZXIudHJpbSgpLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBzcGxpdC5zaGlmdCgpLnRyaW0oKVxuICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignOicpLnRyaW0oKVxuICAgICAgaGVhZC5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICB9KVxuICAgIHJldHVybiBoZWFkXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXNcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gb3B0aW9ucy5zdGF0dXNUZXh0XG4gICAgdGhpcy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycyA/IG9wdGlvbnMuaGVhZGVycyA6IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3RcbiAgICAgIGlmIChSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSAmJiAhaW5pdCkge1xuICAgICAgICByZXF1ZXN0ID0gaW5wdXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIH1cblxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlVVJMKCkge1xuICAgICAgICBpZiAoJ3Jlc3BvbnNlVVJMJyBpbiB4aHIpIHtcbiAgICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlVVJMXG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdm9pZCBzZWN1cml0eSB3YXJuaW5ncyBvbiBnZXRSZXNwb25zZUhlYWRlciB3aGVuIG5vdCBhbGxvd2VkIGJ5IENPUlNcbiAgICAgICAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICAgICAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzKHhociksXG4gICAgICAgICAgdXJsOiByZXNwb25zZVVSTCgpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsIlxuLy8gc3RhbmRhcmQgTUlESSBldmVudHNcbmNvbnN0IE1JRElFdmVudFR5cGVzID0ge31cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTk9URV9PRkYnLCB7dmFsdWU6IDB4ODB9KSAvLzEyOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTk9URV9PTicsIHt2YWx1ZTogMHg5MH0pIC8vMTQ0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQT0xZX1BSRVNTVVJFJywge3ZhbHVlOiAweEEwfSkgLy8xNjBcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0NPTlRST0xfQ0hBTkdFJywge3ZhbHVlOiAweEIwfSkgLy8xNzZcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BST0dSQU1fQ0hBTkdFJywge3ZhbHVlOiAweEMwfSkgLy8xOTJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0NIQU5ORUxfUFJFU1NVUkUnLCB7dmFsdWU6IDB4RDB9KSAvLzIwOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUElUQ0hfQkVORCcsIHt2YWx1ZTogMHhFMH0pIC8vMjI0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTWVNURU1fRVhDTFVTSVZFJywge3ZhbHVlOiAweEYwfSkgLy8yNDBcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ01JRElfVElNRUNPREUnLCB7dmFsdWU6IDI0MX0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTT05HX1BPU0lUSU9OJywge3ZhbHVlOiAyNDJ9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU09OR19TRUxFQ1QnLCB7dmFsdWU6IDI0M30pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdUVU5FX1JFUVVFU1QnLCB7dmFsdWU6IDI0Nn0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdFT1gnLCB7dmFsdWU6IDI0N30pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdUSU1JTkdfQ0xPQ0snLCB7dmFsdWU6IDI0OH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTVEFSVCcsIHt2YWx1ZTogMjUwfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0NPTlRJTlVFJywge3ZhbHVlOiAyNTF9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1RPUCcsIHt2YWx1ZTogMjUyfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0FDVElWRV9TRU5TSU5HJywge3ZhbHVlOiAyNTR9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1lTVEVNX1JFU0VUJywge3ZhbHVlOiAyNTV9KVxuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RFTVBPJywge3ZhbHVlOiAweDUxfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RJTUVfU0lHTkFUVVJFJywge3ZhbHVlOiAweDU4fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0VORF9PRl9UUkFDSycsIHt2YWx1ZTogMHgyRn0pXG5cbmV4cG9ydCB7TUlESUV2ZW50VHlwZXN9XG4iLCJsZXQgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpe1xuICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUpXG4gIGxldCBtYXBcblxuICBpZihldmVudC50eXBlID09PSAnZXZlbnQnKXtcbiAgICBsZXQgbWlkaUV2ZW50ID0gZXZlbnQuZGF0YVxuICAgIGxldCBtaWRpRXZlbnRUeXBlID0gbWlkaUV2ZW50LnR5cGVcbiAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudFR5cGUpXG4gICAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKG1pZGlFdmVudFR5cGUpKXtcbiAgICAgIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldChtaWRpRXZlbnRUeXBlKVxuICAgICAgZm9yKGxldCBjYiBvZiBtYXAudmFsdWVzKCkpe1xuICAgICAgICBjYihtaWRpRXZlbnQpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudExpc3RlbmVycy5oYXMoZXZlbnQudHlwZSkpXG4gIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyhldmVudC50eXBlKSA9PT0gZmFsc2Upe1xuICAgIHJldHVyblxuICB9XG5cbiAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpXG4gIGZvcihsZXQgY2Igb2YgbWFwLnZhbHVlcygpKXtcbiAgICBjYihldmVudClcbiAgfVxuXG5cbiAgLy8gQHRvZG86IHJ1biBmaWx0ZXJzIGhlcmUsIGZvciBpbnN0YW5jZSBpZiBhbiBldmVudGxpc3RlbmVyIGhhcyBiZWVuIGFkZGVkIHRvIGFsbCBOT1RFX09OIGV2ZW50cywgY2hlY2sgdGhlIHR5cGUgb2YgdGhlIGluY29taW5nIGV2ZW50XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBjYWxsYmFjayl7XG5cbiAgbGV0IG1hcFxuICBsZXQgaWQgPSBgJHt0eXBlfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcblxuICBpZihldmVudExpc3RlbmVycy5oYXModHlwZSkgPT09IGZhbHNlKXtcbiAgICBtYXAgPSBuZXcgTWFwKClcbiAgICBldmVudExpc3RlbmVycy5zZXQodHlwZSwgbWFwKVxuICB9ZWxzZXtcbiAgICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQodHlwZSlcbiAgfVxuXG4gIG1hcC5zZXQoaWQsIGNhbGxiYWNrKVxuICAvL2NvbnNvbGUubG9nKGV2ZW50TGlzdGVuZXJzKVxuICByZXR1cm4gaWRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG5cbiAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5sb2coJ25vIGV2ZW50bGlzdGVuZXJzIG9mIHR5cGUnICsgdHlwZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGxldCBtYXAgPSBldmVudExpc3RlbmVycy5nZXQodHlwZSlcblxuICBpZih0eXBlb2YgaWQgPT09ICdmdW5jdGlvbicpe1xuICAgIGZvcihsZXQgW2tleSwgdmFsdWVdIG9mIG1hcC5lbnRyaWVzKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKGtleSwgdmFsdWUpXG4gICAgICBpZih2YWx1ZSA9PT0gaWQpe1xuICAgICAgICBjb25zb2xlLmxvZyhrZXkpXG4gICAgICAgIGlkID0ga2V5XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpe1xuICAgICAgbWFwLmRlbGV0ZShpZClcbiAgICB9XG4gIH1lbHNlIGlmKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpe1xuICAgIG1hcC5kZWxldGUoaWQpXG4gIH1lbHNle1xuICAgIGNvbnNvbGUubG9nKCdjb3VsZCBub3QgcmVtb3ZlIGV2ZW50bGlzdGVuZXInKVxuICB9XG59XG5cbiIsIi8vIGZldGNoIGhlbHBlcnNcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXR1cyhyZXNwb25zZSkge1xuICBpZihyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCl7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpKVxuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBqc29uKHJlc3BvbnNlKXtcbiAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlCdWZmZXIocmVzcG9uc2Upe1xuICByZXR1cm4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaEpTT04odXJsKXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBmZXRjaCh1cmwsIHtcbiAgICAvLyAgIG1vZGU6ICduby1jb3JzJ1xuICAgIC8vIH0pXG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihqc29uKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgcmVzb2x2ZShkYXRhKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoQXJyYXlidWZmZXIodXJsKXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBmZXRjaCh1cmwsIHtcbiAgICAvLyAgIG1vZGU6ICduby1jb3JzJ1xuICAgIC8vIH0pXG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihhcnJheUJ1ZmZlcilcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJlc29sdmUoZGF0YSlcbiAgICB9KVxuICAgIC5jYXRjaChlID0+IHtcbiAgICAgIHJlamVjdChlKVxuICAgIH0pXG4gIH0pXG59XG4iLCJpbXBvcnQgcWFtYmkgZnJvbSAnLi9xYW1iaSdcbmltcG9ydCB7U29uZ30gZnJvbSAnLi9zb25nJ1xuaW1wb3J0IHtJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5pbXBvcnQge2luaXRBdWRpb30gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtpbml0TUlESX0gZnJvbSAnLi9pbml0X21pZGknXG5cbmV4cG9ydCBsZXQgZ2V0VXNlck1lZGlhID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWFcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ2dldFVzZXJNZWRpYSBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmV4cG9ydCBsZXQgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ3JlcXVlc3RBbmltYXRpb25GcmFtZSBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmV4cG9ydCBsZXQgQmxvYiA9ICgoKSA9PiB7XG4gIGlmKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gd2luZG93LkJsb2IgfHwgd2luZG93LndlYmtpdEJsb2JcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ0Jsb2IgaXMgbm90IGF2YWlsYWJsZScpXG4gIH1cbn0pKClcblxuXG5mdW5jdGlvbiBsb2FkSW5zdHJ1bWVudChkYXRhKXtcbiAgbGV0IGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudCgpXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaW5zdHJ1bWVudC5wYXJzZVNhbXBsZURhdGEoZGF0YSlcbiAgICAudGhlbigoKSA9PiByZXNvbHZlKGluc3RydW1lbnQpKVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChzZXR0aW5ncyA9IG51bGwpOiB2b2lke1xuXG4gIC8vIGxvYWQgc2V0dGluZ3MuaW5zdHJ1bWVudHMgKGFycmF5IG9yIG9iamVjdClcbiAgLy8gbG9hZCBzZXR0aW5ncy5taWRpZmlsZXMgKGFycmF5IG9yIG9iamVjdClcbiAgLypcblxuICBxYW1iaS5pbml0KHtcbiAgICBzb25nOiB7XG4gICAgICB0eXBlOiAnU29uZycsXG4gICAgICB1cmw6ICcuLi9kYXRhL21pbnV0ZV93YWx0ei5taWQnXG4gICAgfSxcbiAgICBwaWFubzoge1xuICAgICAgdHlwZTogJ0luc3RydW1lbnQnLFxuICAgICAgdXJsOiAnLi4vLi4vaW5zdHJ1bWVudHMvZWxlY3RyaWMtcGlhbm8uanNvbidcbiAgICB9XG4gIH0pXG5cbiAgcWFtYmkuaW5pdCh7XG4gICAgaW5zdHJ1bWVudHM6IFsnLi4vaW5zdHJ1bWVudHMvcGlhbm8nLCAnLi4vaW5zdHJ1bWVudHMvdmlvbGluJ10sXG4gICAgbWlkaWZpbGVzOiBbJy4uL21pZGkvbW96YXJ0Lm1pZCddXG4gIH0pXG4gIC50aGVuKChsb2FkZWQpID0+IHtcbiAgICBsZXQgW3BpYW5vLCB2aW9saW5dID0gbG9hZGVkLmluc3RydW1lbnRzXG4gICAgbGV0IFttb3phcnRdID0gbG9hZGVkLm1pZGlmaWxlc1xuICB9KVxuXG4gICovXG5cbiAgbGV0IHByb21pc2VzID0gW2luaXRBdWRpbygpLCBpbml0TUlESSgpXVxuICBsZXQgbG9hZEtleXNcblxuICBpZihzZXR0aW5ncyAhPT0gbnVsbCl7XG4gICAgbG9hZEtleXMgPSBPYmplY3Qua2V5cyhzZXR0aW5ncylcbiAgICBmb3IobGV0IGtleSBvZiBsb2FkS2V5cyl7XG4gICAgICBsZXQgZGF0YSA9IHNldHRpbmdzW2tleV1cblxuICAgICAgaWYoZGF0YS50eXBlID09PSAnU29uZycpe1xuICAgICAgICBwcm9taXNlcy5wdXNoKFNvbmcuZnJvbU1JRElGaWxlKGRhdGEudXJsKSlcbiAgICAgIH1lbHNlIGlmKGRhdGEudHlwZSA9PT0gJ0luc3RydW1lbnQnKXtcbiAgICAgICAgcHJvbWlzZXMucHVzaChsb2FkSW5zdHJ1bWVudChkYXRhKSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICBQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICAudGhlbihcbiAgICAocmVzdWx0KSA9PiB7XG5cbiAgICAgIGxldCByZXR1cm5PYmogPSB7fVxuXG4gICAgICByZXN1bHQuZm9yRWFjaCgoZGF0YSwgaSkgPT4ge1xuICAgICAgICBpZihpID09PSAwKXtcbiAgICAgICAgICAvLyBwYXJzZUF1ZGlvXG4gICAgICAgICAgcmV0dXJuT2JqLmxlZ2FjeSA9IGRhdGEubGVnYWN5XG4gICAgICAgICAgcmV0dXJuT2JqLm1wMyA9IGRhdGEubXAzXG4gICAgICAgICAgcmV0dXJuT2JqLm9nZyA9IGRhdGEub2dnXG4gICAgICAgIH1lbHNlIGlmKGkgPT09IDEpe1xuICAgICAgICAgIC8vIHBhcnNlTUlESVxuICAgICAgICAgIHJldHVybk9iai5taWRpID0gZGF0YS5taWRpXG4gICAgICAgICAgcmV0dXJuT2JqLndlYm1pZGkgPSBkYXRhLndlYm1pZGlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy8gSW5zdHJ1bWVudHMsIHNhbXBsZXMgb3IgTUlESSBmaWxlcyB0aGF0IGdvdCBsb2FkZWQgZHVyaW5nIGluaXRpYWxpemF0aW9uXG4gICAgICAgICAgcmVzdWx0W2xvYWRLZXlzW2kgLSAyXV0gPSBkYXRhXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGNvbnNvbGUubG9nKCdxYW1iaScsIHFhbWJpLnZlcnNpb24pXG4gICAgICByZXNvbHZlKHJlc3VsdClcbiAgICB9LFxuICAgIChlcnJvcikgPT4ge1xuICAgICAgcmVqZWN0KGVycm9yKVxuICAgIH0pXG4gIH0pXG5cblxuLypcbiAgUHJvbWlzZS5hbGwoW2luaXRBdWRpbygpLCBpbml0TUlESSgpXSlcbiAgLnRoZW4oXG4gIChkYXRhKSA9PiB7XG4gICAgLy8gcGFyc2VBdWRpb1xuICAgIGxldCBkYXRhQXVkaW8gPSBkYXRhWzBdXG5cbiAgICAvLyBwYXJzZU1JRElcbiAgICBsZXQgZGF0YU1pZGkgPSBkYXRhWzFdXG5cbiAgICBjYWxsYmFjayh7XG4gICAgICBsZWdhY3k6IGRhdGFBdWRpby5sZWdhY3ksXG4gICAgICBtcDM6IGRhdGFBdWRpby5tcDMsXG4gICAgICBvZ2c6IGRhdGFBdWRpby5vZ2csXG4gICAgICBtaWRpOiBkYXRhTWlkaS5taWRpLFxuICAgICAgd2VibWlkaTogZGF0YU1pZGkud2VibWlkaSxcbiAgICB9KVxuICB9LFxuICAoZXJyb3IpID0+IHtcbiAgICBjYWxsYmFjayhlcnJvcilcbiAgfSlcbiovXG59XG4iLCIvKlxuICBTZXRzIHVwIHRoZSBiYXNpYyBhdWRpbyByb3V0aW5nLCB0ZXN0cyB3aGljaCBhdWRpbyBmb3JtYXRzIGFyZSBzdXBwb3J0ZWQgYW5kIHBhcnNlcyB0aGUgc2FtcGxlcyBmb3IgdGhlIG1ldHJvbm9tZSB0aWNrcy5cbiovXG5cbmltcG9ydCBzYW1wbGVzIGZyb20gJy4vc2FtcGxlcydcbmltcG9ydCB7cGFyc2VTYW1wbGVzfSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuXG5sZXRcbiAgbWFzdGVyR2FpbixcbiAgY29tcHJlc3NvcixcbiAgaW5pdGlhbGl6ZWQgPSBmYWxzZSxcbiAgZGF0YVxuXG5leHBvcnQgbGV0IGNvbnRleHQgPSAoZnVuY3Rpb24oKXtcbiAgLy9jb25zb2xlLmxvZygnaW5pdCBBdWRpb0NvbnRleHQnKVxuICBsZXQgY3R4XG4gIGlmKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKXtcbiAgICBsZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0XG4gICAgaWYoQXVkaW9Db250ZXh0ICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICBjdHggPSBuZXcgQXVkaW9Db250ZXh0KClcbiAgICB9XG4gIH1cbiAgaWYodHlwZW9mIGN0eCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIC8vQFRPRE86IGNyZWF0ZSBkdW1teSBBdWRpb0NvbnRleHQgZm9yIHVzZSBpbiBub2RlLCBzZWU6IGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2F1ZGlvLWNvbnRleHRcbiAgICBjb250ZXh0ID0ge1xuICAgICAgY3JlYXRlR2FpbjogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBnYWluOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjcmVhdGVPc2NpbGxhdG9yOiBmdW5jdGlvbigpe30sXG4gICAgfVxuICB9XG4gIHJldHVybiBjdHhcbn0oKSlcblxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEF1ZGlvKCl7XG5cbiAgaWYodHlwZW9mIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluXG4gIH1cbiAgLy8gY2hlY2sgZm9yIG9sZGVyIGltcGxlbWVudGF0aW9ucyBvZiBXZWJBdWRpb1xuICBkYXRhID0ge31cbiAgbGV0IHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgZGF0YS5sZWdhY3kgPSBmYWxzZVxuICBpZih0eXBlb2Ygc291cmNlLnN0YXJ0ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZGF0YS5sZWdhY3kgPSB0cnVlXG4gIH1cblxuICAvLyBzZXQgdXAgdGhlIGVsZW1lbnRhcnkgYXVkaW8gbm9kZXNcbiAgY29tcHJlc3NvciA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKClcbiAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlKClcbiAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IDAuNVxuICBpbml0aWFsaXplZCA9IHRydWVcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgcGFyc2VTYW1wbGVzKHNhbXBsZXMpLnRoZW4oXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChidWZmZXJzKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhidWZmZXJzKVxuICAgICAgICBkYXRhLm9nZyA9IHR5cGVvZiBidWZmZXJzLmVtcHR5T2dnICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICBkYXRhLm1wMyA9IHR5cGVvZiBidWZmZXJzLmVtcHR5TXAzICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICBkYXRhLmxvd3RpY2sgPSBidWZmZXJzLmxvd3RpY2tcbiAgICAgICAgZGF0YS5oaWdodGljayA9IGJ1ZmZlcnMuaGlnaHRpY2tcbiAgICAgICAgaWYoZGF0YS5vZ2cgPT09IGZhbHNlICYmIGRhdGEubXAzID09PSBmYWxzZSl7XG4gICAgICAgICAgcmVqZWN0KCdObyBzdXBwb3J0IGZvciBvZ2cgbm9yIG1wMyEnKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKGRhdGEpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKCl7XG4gICAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgaW5pdGlhbGl6aW5nIEF1ZGlvJylcbiAgICAgIH1cbiAgICApXG4gIH0pXG59XG5cblxubGV0IHNldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKHZhbHVlOiBudW1iZXIgPSAwLjUpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIHNldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKHZhbHVlOiBudW1iZXIgPSAwLjUpe1xuICAgICAgaWYodmFsdWUgPiAxKXtcbiAgICAgICAgY29uc29sZS5pbmZvKCdtYXhpbWFsIHZvbHVtZSBpcyAxLjAsIHZvbHVtZSBpcyBzZXQgdG8gMS4wJyk7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHZhbHVlIDwgMCA/IDAgOiB2YWx1ZSA+IDEgPyAxIDogdmFsdWVcbiAgICAgIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXRNYXN0ZXJWb2x1bWUodmFsdWUpXG4gIH1cbn1cblxuXG5sZXQgZ2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TWFzdGVyVm9sdW1lKClcbiAgfVxufVxuXG5cbmxldCBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGNvbXByZXNzb3IucmVkdWN0aW9uLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRDb21wcmVzc2lvblJlZHVjdGlvbigpXG4gIH1cbn1cblxuXG5sZXQgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGZsYWc6IGJvb2xlYW4pe1xuICAgICAgaWYoZmxhZyl7XG4gICAgICAgIG1hc3RlckdhaW4uZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbXByZXNzb3IpO1xuICAgICAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIGNvbXByZXNzb3IuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICBlbmFibGVNYXN0ZXJDb21wcmVzc29yKClcbiAgfVxufVxuXG5cbmxldCBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oY2ZnKTogdm9pZHtcbiAgLypcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBhdHRhY2s7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBrbmVlOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJhdGlvOyAvLyB1bml0LWxlc3NcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWR1Y3Rpb247IC8vIGluIERlY2liZWxzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVsZWFzZTsgLy8gaW4gU2Vjb25kc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHRocmVzaG9sZDsgLy8gaW4gRGVjaWJlbHNcblxuICAgIEBzZWU6IGh0dHA6Ly93ZWJhdWRpby5naXRodWIuaW8vd2ViLWF1ZGlvLWFwaS8jdGhlLWR5bmFtaWNzY29tcHJlc3Nvcm5vZGUtaW50ZXJmYWNlXG4gICovXG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGNmZzoge30pe1xuICAgICAgKHtcbiAgICAgICAgYXR0YWNrOiBjb21wcmVzc29yLmF0dGFjayA9IDAuMDAzLFxuICAgICAgICBrbmVlOiBjb21wcmVzc29yLmtuZWUgPSAzMCxcbiAgICAgICAgcmF0aW86IGNvbXByZXNzb3IucmF0aW8gPSAxMixcbiAgICAgICAgcmVkdWN0aW9uOiBjb21wcmVzc29yLnJlZHVjdGlvbiA9IDAsXG4gICAgICAgIHJlbGVhc2U6IGNvbXByZXNzb3IucmVsZWFzZSA9IDAuMjUwLFxuICAgICAgICB0aHJlc2hvbGQ6IGNvbXByZXNzb3IudGhyZXNob2xkID0gLTI0LFxuICAgICAgfSA9IGNmZylcbiAgICB9XG4gICAgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvcihjZmcpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEluaXREYXRhKCl7XG4gIHJldHVybiBkYXRhXG59XG5cbmV4cG9ydCB7bWFzdGVyR2FpbiwgY29tcHJlc3NvciBhcyBtYXN0ZXJDb21wcmVzc29yLCBzZXRNYXN0ZXJWb2x1bWUsIGdldE1hc3RlclZvbHVtZSwgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24sIGVuYWJsZU1hc3RlckNvbXByZXNzb3IsIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3J9XG4iLCIvKlxuICBSZXF1ZXN0cyBNSURJIGFjY2VzcywgcXVlcmllcyBhbGwgaW5wdXRzIGFuZCBvdXRwdXRzIGFuZCBzdG9yZXMgdGhlbSBpbiBhbHBoYWJldGljYWwgb3JkZXJcbiovXG5cbmltcG9ydCB7dHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJ1xuXG5cbmxldCBNSURJQWNjZXNzXG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZVxubGV0IGlucHV0cyA9IFtdXG5sZXQgb3V0cHV0cyA9IFtdXG5sZXQgaW5wdXRJZHMgPSBbXVxubGV0IG91dHB1dElkcyA9IFtdXG5sZXQgaW5wdXRzQnlJZCA9IG5ldyBNYXAoKVxubGV0IG91dHB1dHNCeUlkID0gbmV3IE1hcCgpXG5cbmxldCBzb25nTWlkaUV2ZW50TGlzdGVuZXJcbmxldCBtaWRpRXZlbnRMaXN0ZW5lcklkID0gMFxuXG5cbmZ1bmN0aW9uIGdldE1JRElwb3J0cygpe1xuICBpbnB1dHMgPSBBcnJheS5mcm9tKE1JRElBY2Nlc3MuaW5wdXRzLnZhbHVlcygpKVxuXG4gIC8vc29ydCBwb3J0cyBieSBuYW1lIGFzY2VuZGluZ1xuICBpbnB1dHMuc29ydCgoYSwgYikgPT4gYS5uYW1lLnRvTG93ZXJDYXNlKCkgPD0gYi5uYW1lLnRvTG93ZXJDYXNlKCkgPyAxIDogLTEpXG5cbiAgZm9yKGxldCBwb3J0IG9mIGlucHV0cyl7XG4gICAgaW5wdXRzQnlJZC5zZXQocG9ydC5pZCwgcG9ydClcbiAgICBpbnB1dElkcy5wdXNoKHBvcnQuaWQpXG4gIH1cblxuICBvdXRwdXRzID0gQXJyYXkuZnJvbShNSURJQWNjZXNzLm91dHB1dHMudmFsdWVzKCkpXG5cbiAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gIG91dHB1dHMuc29ydCgoYSwgYikgPT4gYS5uYW1lLnRvTG93ZXJDYXNlKCkgPD0gYi5uYW1lLnRvTG93ZXJDYXNlKCkgPyAxIDogLTEpXG5cbiAgLy9jb25zb2xlLmxvZyhvdXRwdXRzKVxuICBmb3IobGV0IHBvcnQgb2Ygb3V0cHV0cyl7XG4gICAgLy9jb25zb2xlLmxvZyhwb3J0LmlkLCBwb3J0Lm5hbWUpXG4gICAgb3V0cHV0c0J5SWQuc2V0KHBvcnQuaWQsIHBvcnQpXG4gICAgb3V0cHV0SWRzLnB1c2gocG9ydC5pZClcbiAgfVxuICAvL2NvbnNvbGUubG9nKG91dHB1dHNCeUlkKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0TUlESSgpe1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3Qpe1xuXG4gICAgaWYodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICByZXNvbHZlKHttaWRpOiBmYWxzZX0pXG4gICAgfWVsc2UgaWYodHlwZW9mIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyAhPT0gJ3VuZGVmaW5lZCcpe1xuXG4gICAgICBsZXQgamF6eiwgbWlkaSwgd2VibWlkaVxuXG4gICAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MoKS50aGVuKFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uRnVsRmlsbGVkKG1pZGlBY2Nlc3Mpe1xuICAgICAgICAgIE1JRElBY2Nlc3MgPSBtaWRpQWNjZXNzXG4gICAgICAgICAgaWYodHlwZW9mIG1pZGlBY2Nlc3MuX2phenpJbnN0YW5jZXMgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGphenogPSBtaWRpQWNjZXNzLl9qYXp6SW5zdGFuY2VzWzBdLl9KYXp6LnZlcnNpb25cbiAgICAgICAgICAgIG1pZGkgPSB0cnVlXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB3ZWJtaWRpID0gdHJ1ZVxuICAgICAgICAgICAgbWlkaSA9IHRydWVcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBnZXRNSURJcG9ydHMoKVxuXG4gICAgICAgICAgLy8gb25jb25uZWN0IGFuZCBvbmRpc2Nvbm5lY3QgYXJlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIGFuZCBDaHJvbWl1bVxuICAgICAgICAgIG1pZGlBY2Nlc3Mub25jb25uZWN0ID0gZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGV2aWNlIGNvbm5lY3RlZCcsIGUpXG4gICAgICAgICAgICBnZXRNSURJcG9ydHMoKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG1pZGlBY2Nlc3Mub25kaXNjb25uZWN0ID0gZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZGV2aWNlIGRpc2Nvbm5lY3RlZCcsIGUpXG4gICAgICAgICAgICBnZXRNSURJcG9ydHMoKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgamF6eixcbiAgICAgICAgICAgIG1pZGksXG4gICAgICAgICAgICB3ZWJtaWRpLFxuICAgICAgICAgICAgaW5wdXRzLFxuICAgICAgICAgICAgb3V0cHV0cyxcbiAgICAgICAgICAgIGlucHV0c0J5SWQsXG4gICAgICAgICAgICBvdXRwdXRzQnlJZCxcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KGUpe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZSlcbiAgICAgICAgICByZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIHJlcXVlc3RpbmcgTUlESUFjY2VzcycsIGUpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAvLyBicm93c2VycyB3aXRob3V0IFdlYk1JREkgQVBJXG4gICAgfWVsc2V7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgIHJlc29sdmUoe21pZGk6IGZhbHNlfSlcbiAgICB9XG4gIH0pXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJQWNjZXNzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJQWNjZXNzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBNSURJQWNjZXNzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJQWNjZXNzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0c1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gaW5wdXRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBvdXRwdXRJZHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElPdXRwdXRJZHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUlucHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGlucHV0SWRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRJZHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbihpZDogc3RyaW5nKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0QnlJZCA9IGZ1bmN0aW9uKF9pZCl7XG4gICAgICByZXR1cm4gb3V0cHV0c0J5SWQuZ2V0KF9pZClcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElPdXRwdXRCeUlkKGlkKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElJbnB1dEJ5SWQgPSBmdW5jdGlvbihfaWQpe1xuICAgICAgcmV0dXJuIGlucHV0c0J5SWQuZ2V0KF9pZClcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElJbnB1dEJ5SWQoaWQpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuLypcbmV4cG9ydCBmdW5jdGlvbiBpbml0TWlkaVNvbmcoc29uZyl7XG5cbiAgc29uZ01pZGlFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgLy9jb25zb2xlLmxvZyhlKVxuICAgIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBlLCB0aGlzKTtcbiAgfTtcblxuICAvLyBieSBkZWZhdWx0IGEgc29uZyBsaXN0ZW5zIHRvIGFsbCBhdmFpbGFibGUgbWlkaS1pbiBwb3J0c1xuICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcblxuICBvdXRwdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpSW5wdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IGlucHV0ID0gaW5wdXRzLmdldChpZCk7XG5cbiAgaWYoaW5wdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBpbnB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlJbnB1dHMuZGVsZXRlKGlkKTtcbiAgICBpbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1lbHNle1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQoaWQsIGlucHV0KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpSW5wdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlPdXRwdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IG91dHB1dCA9IG91dHB1dHMuZ2V0KGlkKTtcblxuICBpZihvdXRwdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBvdXRwdXQgd2l0aCBpZCcsIGlkLCAnZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihmbGFnID09PSBmYWxzZSl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5kZWxldGUoaWQpO1xuICAgIGxldCB0aW1lID0gc29uZy5zY2hlZHVsZXIubGFzdEV2ZW50VGltZSArIDEwMDtcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWUpOyAvLyBzdG9wIGFsbCBub3Rlc1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZSk7IC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICB9ZWxzZXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChpZCwgb3V0cHV0KTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlPdXRwdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIG1pZGlNZXNzYWdlRXZlbnQsIGlucHV0KXtcbiAgbGV0IG1pZGlFdmVudCA9IG5ldyBNaWRpRXZlbnQoc29uZy50aWNrcywgLi4ubWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5taWRpSW5wdXRzLCBpbnB1dCk7XG5cblxuICAgIC8vaWYobWlkaUV2ZW50LmNoYW5uZWwgPT09IHRyYWNrLmNoYW5uZWwgfHwgdHJhY2suY2hhbm5lbCA9PT0gMCB8fCB0cmFjay5jaGFubmVsID09PSAnYW55Jyl7XG4gICAgLy8gIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjayk7XG4gICAgLy99XG5cblxuICAgIC8vIGxpa2UgaW4gQ3ViYXNlLCBtaWRpIGV2ZW50cyBmcm9tIGFsbCBkZXZpY2VzLCBzZW50IG9uIGFueSBtaWRpIGNoYW5uZWwgYXJlIGZvcndhcmRlZCB0byBhbGwgdHJhY2tzXG4gICAgLy8gc2V0IHRyYWNrLm1vbml0b3IgdG8gZmFsc2UgaWYgeW91IGRvbid0IHdhbnQgdG8gcmVjZWl2ZSBtaWRpIGV2ZW50cyBvbiBhIGNlcnRhaW4gdHJhY2tcbiAgICAvLyBub3RlIHRoYXQgdHJhY2subW9uaXRvciBpcyBieSBkZWZhdWx0IHNldCB0byBmYWxzZSBhbmQgdGhhdCB0cmFjay5tb25pdG9yIGlzIGF1dG9tYXRpY2FsbHkgc2V0IHRvIHRydWVcbiAgICAvLyBpZiB5b3UgYXJlIHJlY29yZGluZyBvbiB0aGF0IHRyYWNrXG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5tb25pdG9yLCB0cmFjay5pZCwgaW5wdXQuaWQpO1xuICAgIGlmKHRyYWNrLm1vbml0b3IgPT09IHRydWUgJiYgdHJhY2subWlkaUlucHV0cy5nZXQoaW5wdXQuaWQpICE9PSB1bmRlZmluZWQpe1xuICAgICAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrLCBpbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgbGV0IGxpc3RlbmVycyA9IHNvbmcubWlkaUV2ZW50TGlzdGVuZXJzLmdldChtaWRpRXZlbnQudHlwZSk7XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBmb3IobGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycyl7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKHRyYWNrLCBtaWRpRXZlbnQsIGlucHV0KXtcbiAgbGV0IHNvbmcgPSB0cmFjay5zb25nLFxuICAgIG5vdGUsIGxpc3RlbmVycywgY2hhbm5lbDtcbiAgICAvL2RhdGEgPSBtaWRpTWVzc2FnZUV2ZW50LmRhdGEsXG4gICAgLy9taWRpRXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoc29uZy50aWNrcywgZGF0YVswXSwgZGF0YVsxXSwgZGF0YVsyXSk7XG5cbiAgLy9taWRpRXZlbnQuc291cmNlID0gbWlkaU1lc3NhZ2VFdmVudC5zcmNFbGVtZW50Lm5hbWU7XG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudClcbiAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCBtaWRpRXZlbnQudHlwZSk7XG5cbiAgLy8gYWRkIHRoZSBleGFjdCB0aW1lIG9mIHRoaXMgZXZlbnQgc28gd2UgY2FuIGNhbGN1bGF0ZSBpdHMgdGlja3MgcG9zaXRpb25cbiAgbWlkaUV2ZW50LnJlY29yZE1pbGxpcyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwOyAvLyBtaWxsaXNcbiAgbWlkaUV2ZW50LnN0YXRlID0gJ3JlY29yZGVkJztcblxuICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICBub3RlID0gY3JlYXRlTWlkaU5vdGUobWlkaUV2ZW50KTtcbiAgICB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdID0gbm90ZTtcbiAgICAvL3RyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF0gPSBub3RlO1xuICB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICBub3RlID0gdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvLyBjaGVjayBpZiB0aGUgbm90ZSBleGlzdHM6IGlmIHRoZSB1c2VyIHBsYXlzIG5vdGVzIG9uIGhlciBrZXlib2FyZCBiZWZvcmUgdGhlIG1pZGkgc3lzdGVtIGhhc1xuICAgIC8vIGJlZW4gZnVsbHkgaW5pdGlhbGl6ZWQsIGl0IGNhbiBoYXBwZW4gdGhhdCB0aGUgZmlyc3QgaW5jb21pbmcgbWlkaSBldmVudCBpcyBhIE5PVEUgT0ZGIGV2ZW50XG4gICAgaWYobm90ZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm90ZS5hZGROb3RlT2ZmKG1pZGlFdmVudCk7XG4gICAgZGVsZXRlIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy9kZWxldGUgdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXTtcbiAgfVxuXG4gIC8vY29uc29sZS5sb2coc29uZy5wcmVyb2xsLCBzb25nLnJlY29yZGluZywgdHJhY2sucmVjb3JkRW5hYmxlZCk7XG5cbiAgaWYoKHNvbmcucHJlcm9sbGluZyB8fCBzb25nLnJlY29yZGluZykgJiYgdHJhY2sucmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKXtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIHRyYWNrLnNvbmcucmVjb3JkZWROb3Rlcy5wdXNoKG5vdGUpO1xuICAgIH1cbiAgICB0cmFjay5yZWNvcmRQYXJ0LmFkZEV2ZW50KG1pZGlFdmVudCk7XG4gICAgLy8gc29uZy5yZWNvcmRlZEV2ZW50cyBpcyB1c2VkIGluIHRoZSBrZXkgZWRpdG9yXG4gICAgdHJhY2suc29uZy5yZWNvcmRlZEV2ZW50cy5wdXNoKG1pZGlFdmVudCk7XG4gIH1lbHNlIGlmKHRyYWNrLmVuYWJsZVJldHJvc3BlY3RpdmVSZWNvcmRpbmcpe1xuICAgIHRyYWNrLnJldHJvc3BlY3RpdmVSZWNvcmRpbmcucHVzaChtaWRpRXZlbnQpO1xuICB9XG5cbiAgLy8gY2FsbCBhbGwgbWlkaSBldmVudCBsaXN0ZW5lcnNcbiAgbGlzdGVuZXJzID0gdHJhY2subWlkaUV2ZW50TGlzdGVuZXJzW21pZGlFdmVudC50eXBlXTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIG9iamVjdEZvckVhY2gobGlzdGVuZXJzLCBmdW5jdGlvbihsaXN0ZW5lcil7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoYW5uZWwgPSB0cmFjay5jaGFubmVsO1xuICBpZihjaGFubmVsID09PSAnYW55JyB8fCBjaGFubmVsID09PSB1bmRlZmluZWQgfHwgaXNOYU4oY2hhbm5lbCkgPT09IHRydWUpe1xuICAgIGNoYW5uZWwgPSAwO1xuICB9XG5cbiAgb2JqZWN0Rm9yRWFjaCh0cmFjay5taWRpT3V0cHV0cywgZnVuY3Rpb24ob3V0cHV0KXtcbiAgICAvL2NvbnNvbGUubG9nKCdtaWRpIG91dCcsIG91dHB1dCwgbWlkaUV2ZW50LnR5cGUpO1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjggfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE0NCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyKTtcbiAgICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgICAvLyB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTkyKXtcbiAgICAvLyAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExXSk7XG4gICAgfVxuICAgIC8vb3V0cHV0LnNlbmQoW21pZGlFdmVudC5zdGF0dXMgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICB9KTtcblxuICAvLyBAVE9ETzogbWF5YmUgYSB0cmFjayBzaG91bGQgYmUgYWJsZSB0byBzZW5kIGl0cyBldmVudCB0byBib3RoIGEgbWlkaS1vdXQgcG9ydCBhbmQgYW4gaW50ZXJuYWwgaGVhcnRiZWF0IHNvbmc/XG4gIC8vY29uc29sZS5sb2codHJhY2sucm91dGVUb01pZGlPdXQpO1xuICBpZih0cmFjay5yb3V0ZVRvTWlkaU91dCA9PT0gZmFsc2Upe1xuICAgIG1pZGlFdmVudC50cmFjayA9IHRyYWNrO1xuICAgIHRyYWNrLmluc3RydW1lbnQucHJvY2Vzc0V2ZW50KG1pZGlFdmVudCk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBhZGRNaWRpRXZlbnRMaXN0ZW5lciguLi5hcmdzKXsgLy8gY2FsbGVyIGNhbiBiZSBhIHRyYWNrIG9yIGEgc29uZ1xuXG4gIGxldCBpZCA9IG1pZGlFdmVudExpc3RlbmVySWQrKztcbiAgbGV0IGxpc3RlbmVyO1xuICAgIHR5cGVzID0ge30sXG4gICAgaWRzID0gW10sXG4gICAgbG9vcDtcblxuXG4gIC8vIHNob3VsZCBJIGlubGluZSB0aGlzP1xuICBsb29wID0gZnVuY3Rpb24oYXJncyl7XG4gICAgZm9yKGxldCBhcmcgb2YgYXJncyl7XG4gICAgICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcoYXJnKTtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgICBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgbG9vcChhcmcpO1xuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgIGxpc3RlbmVyID0gYXJnO1xuICAgICAgfWVsc2UgaWYoaXNOYU4oYXJnKSA9PT0gZmFsc2Upe1xuICAgICAgICBhcmcgPSBwYXJzZUludChhcmcsIDEwKTtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgYXJnID0gc2VxdWVuY2VyLm1pZGlFdmVudE51bWJlckJ5TmFtZShhcmcpO1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgbG9vcChhcmdzLCAwLCBhcmdzLmxlbmd0aCk7XG4gIC8vY29uc29sZS5sb2coJ3R5cGVzJywgdHlwZXMsICdsaXN0ZW5lcicsIGxpc3RlbmVyKTtcblxuICBvYmplY3RGb3JFYWNoKHR5cGVzLCBmdW5jdGlvbih0eXBlKXtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgIGlmKG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID0ge307XG4gICAgfVxuICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdID0gbGlzdGVuZXI7XG4gICAgaWRzLnB1c2godHlwZSArICdfJyArIGlkKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhvYmoubWlkaUV2ZW50TGlzdGVuZXJzKTtcbiAgcmV0dXJuIGlkcy5sZW5ndGggPT09IDEgPyBpZHNbMF0gOiBpZHM7XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXIoaWQsIG9iail7XG4gIHZhciB0eXBlO1xuICBpZCA9IGlkLnNwbGl0KCdfJyk7XG4gIHR5cGUgPSBpZFswXTtcbiAgaWQgPSBpZFsxXTtcbiAgZGVsZXRlIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVycygpe1xuXG59XG5cbiovXG4iLCJpbXBvcnQge3Byb2Nlc3NNSURJRXZlbnQsIGFsbE5vdGVzT2ZmfSBmcm9tICcuL2luc3RydW1lbnQucHJvY2Vzc19taWRpZXZlbnQnXG5cbmV4cG9ydCBjbGFzcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0ge31cbiAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXVxuICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG4gICAgdGhpcy5vdXRwdXQgPSBudWxsXG4gIH1cblxuICAvLyBtYW5kYXRvcnlcbiAgY29ubmVjdChvdXRwdXQpe1xuICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0XG4gIH1cblxuICAvLyBtYW5kYXRvcnlcbiAgZGlzY29ubmVjdCgpe1xuICAgIHRoaXMub3V0cHV0ID0gbnVsbFxuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHRpbWUpe1xuICAgIHByb2Nlc3NNSURJRXZlbnQuY2FsbCh0aGlzLCBldmVudCwgdGltZSlcbiAgfVxuXG4gIC8vIG1hbmRhdG9yeVxuICBhbGxOb3Rlc09mZigpe1xuICAgIGFsbE5vdGVzT2ZmLmNhbGwodGhpcylcbiAgfVxufVxuIiwiaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHRpbWUpe1xuICAvL2NvbnNvbGUubG9nKGV2ZW50LCB0aW1lKVxuICBsZXQgc2FtcGxlXG4gIGxldCB1bnNjaGVkdWxlID0gZmFsc2VcblxuICBpZihpc05hTih0aW1lKSl7XG4gICAgLy8gdGhpcyBzaG91bGRuJ3QgaGFwcGVuXG4gICAgY29uc29sZS5lcnJvcignaW52YWxpZCB0aW1lIHZhbHVlJylcbiAgICByZXR1cm5cbiAgICAvL3RpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gIH1cblxuICAvLyB0d28gY2FzZXMgd2hlcmVieSB0aGUgZXZlbnQgbmVlc3MgdG8gYmUgcHJvY2Vzc2VkIGltbWVkaWF0ZWx5XG4gIGlmKHRpbWUgPT09IDApe1xuICAgIC8vIHRoaXMgaXMgYW4gZXZlbnQgdGhhdCBpcyBzZW5kIGZyb20gYW4gZXh0ZXJuYWwgTUlESSBrZXlib2FyZFxuICAgIHRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gIH1lbHNlIGlmKHRpbWUgPT09IC0xKXtcbiAgICAvLyB0aGlzIGlzIGFuIGV2ZW50IHRoYXQgaGFzIGJlZW4gdW5zY2hlZHVsZWQgYnkgdGhlIHNjaGVkdWxlciwgZm9yIGluc3RhbmNlIGJlY2F1c2UgdGhlIGV2ZW50IGhhcyBiZWVuIGRlbGV0ZWRcbiAgICB0aW1lID0gY29udGV4dC5jdXJyZW50VGltZVxuICAgIHVuc2NoZWR1bGUgPSB0cnVlXG4gIH1cblxuICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgIC8vY29uc29sZS5sb2coMTQ0LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcblxuICAgIHNhbXBsZSA9IHRoaXMuY3JlYXRlU2FtcGxlKGV2ZW50KVxuICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXSA9IHNhbXBsZVxuICAgIC8vY29uc29sZS5sb2coc2FtcGxlKVxuICAgIHNhbXBsZS5vdXRwdXQuY29ubmVjdCh0aGlzLm91dHB1dCB8fCBjb250ZXh0LmRlc3RpbmF0aW9uKVxuICAgIHNhbXBsZS5zdGFydCh0aW1lKVxuICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxpbmcnLCBldmVudC5pZCwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAvL2NvbnNvbGUubG9nKCdzdGFydCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgLy9jb25zb2xlLmxvZygxMjgsICc6JywgdGltZSwgY29udGV4dC5jdXJyZW50VGltZSwgZXZlbnQubWlsbGlzKVxuICAgIHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXVxuICAgIGlmKHR5cGVvZiBzYW1wbGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIC8vY29uc29sZS5pbmZvKCdzYW1wbGUgbm90IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkLCAnIG1pZGlOb3RlJywgZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyB3ZSBkb24ndCB3YW50IHRoYXQgdGhlIHN1c3RhaW4gcGVkYWwgcHJldmVudHMgdGhlIGFuIGV2ZW50IHRvIHVuc2NoZWR1bGVkXG4gICAgaWYodGhpcy5zdXN0YWluUGVkYWxEb3duID09PSB0cnVlICYmIHVuc2NoZWR1bGUgPT09IGZhbHNlKXtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgfWVsc2V7XG4gICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3AnLCB0aW1lLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICB9KVxuICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgIH1cbiAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAvLyBzdXN0YWluIHBlZGFsXG4gICAgaWYoZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSB0cnVlXG4gICAgICAgIC8vLypcbiAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbCcsXG4gICAgICAgICAgZGF0YTogJ2Rvd24nXG4gICAgICAgIH0pXG4gICAgICAgIC8vKi9cbiAgICAgICAgLy9jb25zb2xlLmxvZygnc3VzdGFpbiBwZWRhbCBkb3duJylcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLmZvckVhY2goKG1pZGlOb3RlSWQpID0+IHtcbiAgICAgICAgICBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbbWlkaU5vdGVJZF1cbiAgICAgICAgICBpZihzYW1wbGUpe1xuICAgICAgICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgICAgICAgICAgc2FtcGxlLnN0b3AodGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wJywgbWlkaU5vdGVJZClcbiAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1ttaWRpTm90ZUlkXVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgdXAnLCB0aGlzLnN1c3RhaW5lZFNhbXBsZXMpXG4gICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgICAgIC8vLypcbiAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbCcsXG4gICAgICAgICAgZGF0YTogJ3VwJ1xuICAgICAgICB9KVxuICAgICAgICAvLyovXG4gICAgICAgIC8vdGhpcy5zdG9wU3VzdGFpbih0aW1lKTtcbiAgICAgIH1cblxuICAgIC8vIHBhbm5pbmdcbiAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gMTApe1xuICAgICAgLy8gcGFubmluZyBpcyAqbm90KiBleGFjdGx5IHRpbWVkIC0+IG5vdCBwb3NzaWJsZSAoeWV0KSB3aXRoIFdlYkF1ZGlvXG4gICAgICAvL2NvbnNvbGUubG9nKGRhdGEyLCByZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuICAgICAgLy90cmFjay5zZXRQYW5uaW5nKHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG5cbiAgICAvLyB2b2x1bWVcbiAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gNyl7XG4gICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgIH1cbiAgfVxufVxuXG5cbi8vIGFsbG93cyB5b3UgdG8gY2FsbCBhbGxOb3Rlc09mZiBwZXIgdHJhY2svaW5zdHJ1bWVudFxuZXhwb3J0IGZ1bmN0aW9uIGFsbE5vdGVzT2ZmKCl7XG4gIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gIGlmKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSl7XG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgIGRhdGE6ICd1cCdcbiAgICB9KVxuICB9XG4gIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG5cbiAgT2JqZWN0LmtleXModGhpcy5zY2hlZHVsZWRTYW1wbGVzKS5mb3JFYWNoKChzYW1wbGVJZCkgPT4ge1xuICAgIC8vY29uc29sZS5sb2coJyAgc3RvcHBpbmcnLCBzYW1wbGVJZCwgdGhpcy5pZClcbiAgICBsZXQgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzW3NhbXBsZUlkXVxuICAgIC8vY29uc29sZS5sb2coc2FtcGxlKVxuICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tzYW1wbGVJZF0uc3RvcChjb250ZXh0LmN1cnJlbnRUaW1lLCAoKSA9PiB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdhbGxOb3Rlc09mZicsIHNhbXBsZS5ldmVudC5taWRpTm90ZUlkKVxuICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tzYW1wbGUuZXZlbnQubWlkaU5vdGVJZF1cbiAgICB9KVxuICB9KVxuICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSB7fVxuXG4gIC8vY29uc29sZS5sb2coJ2FsbE5vdGVzT2ZmJywgdGhpcy5zdXN0YWluZWRTYW1wbGVzLmxlbmd0aCwgdGhpcy5zY2hlZHVsZWRTYW1wbGVzKVxufVxuIiwiaW1wb3J0IHtUcmFja30gZnJvbSAnLi90cmFjaydcbmltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtwYXJzZUV2ZW50cywgcGFyc2VNSURJTm90ZXN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7Y2hlY2tNSURJTnVtYmVyfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2NhbGN1bGF0ZVBvc2l0aW9ufSBmcm9tICcuL3Bvc2l0aW9uJ1xuaW1wb3J0IHtTYW1wbGVyfSBmcm9tICcuL3NhbXBsZXInXG5pbXBvcnQge2dldEluaXREYXRhfSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge01JRElFdmVudFR5cGVzfSBmcm9tICcuL2NvbnN0YW50cydcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuXG5cbmxldFxuICBtZXRob2RNYXAgPSBuZXcgTWFwKFtcbiAgICBbJ3ZvbHVtZScsICdzZXRWb2x1bWUnXSxcbiAgICBbJ2luc3RydW1lbnQnLCAnc2V0SW5zdHJ1bWVudCddLFxuICAgIFsnbm90ZU51bWJlckFjY2VudGVkVGljaycsICdzZXROb3RlTnVtYmVyQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2snXSxcbiAgICBbJ3ZlbG9jaXR5QWNjZW50ZWRUaWNrJywgJ3NldFZlbG9jaXR5QWNjZW50ZWRUaWNrJ10sXG4gICAgWyd2ZWxvY2l0eU5vbkFjY2VudGVkVGljaycsICdzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljayddLFxuICAgIFsnbm90ZUxlbmd0aEFjY2VudGVkVGljaycsICdzZXROb3RlTGVuZ3RoQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snXVxuICBdKTtcblxuZXhwb3J0IGNsYXNzIE1ldHJvbm9tZXtcblxuICBjb25zdHJ1Y3Rvcihzb25nKXtcbiAgICB0aGlzLnNvbmcgPSBzb25nXG4gICAgdGhpcy50cmFjayA9IG5ldyBUcmFjayh0aGlzLnNvbmcuaWQgKyAnX21ldHJvbm9tZScpXG4gICAgdGhpcy5wYXJ0ID0gbmV3IFBhcnQoKVxuICAgIHRoaXMudHJhY2suYWRkUGFydHModGhpcy5wYXJ0KVxuICAgIHRoaXMudHJhY2suY29ubmVjdCh0aGlzLnNvbmcuX291dHB1dClcblxuICAgIHRoaXMuZXZlbnRzID0gW11cbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gW11cbiAgICB0aGlzLnByZWNvdW50RHVyYXRpb24gPSAwXG4gICAgdGhpcy5iYXJzID0gMFxuICAgIHRoaXMuaW5kZXggPSAwXG4gICAgdGhpcy5pbmRleDIgPSAwXG4gICAgdGhpcy5wcmVjb3VudEluZGV4ID0gMFxuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG5cbiAgcmVzZXQoKXtcblxuICAgIGxldCBkYXRhID0gZ2V0SW5pdERhdGEoKVxuICAgIGxldCBpbnN0cnVtZW50ID0gbmV3IFNhbXBsZXIoJ21ldHJvbm9tZScpXG4gICAgaW5zdHJ1bWVudC51cGRhdGVTYW1wbGVEYXRhKHtcbiAgICAgIG5vdGU6IDYwLFxuICAgICAgYnVmZmVyOiBkYXRhLmxvd3RpY2ssXG4gICAgfSwge1xuICAgICAgbm90ZTogNjEsXG4gICAgICBidWZmZXI6IGRhdGEuaGlnaHRpY2ssXG4gICAgfSlcbiAgICB0aGlzLnRyYWNrLnNldEluc3RydW1lbnQoaW5zdHJ1bWVudClcblxuICAgIHRoaXMudm9sdW1lID0gMVxuXG4gICAgdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgPSA2MVxuICAgIHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkID0gNjBcblxuICAgIHRoaXMudmVsb2NpdHlBY2NlbnRlZCA9IDEwMFxuICAgIHRoaXMudmVsb2NpdHlOb25BY2NlbnRlZCA9IDEwMFxuXG4gICAgdGhpcy5ub3RlTGVuZ3RoQWNjZW50ZWQgPSB0aGlzLnNvbmcucHBxIC8gNCAvLyBzaXh0ZWVudGggbm90ZXMgLT4gZG9uJ3QgbWFrZSB0aGlzIHRvbyBzaG9ydCBpZiB5b3VyIHNhbXBsZSBoYXMgYSBsb25nIGF0dGFjayFcbiAgICB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZCA9IHRoaXMuc29uZy5wcHEgLyA0XG4gIH1cblxuICBjcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgaWQgPSAnaW5pdCcpe1xuICAgIGxldCBpLCBqXG4gICAgbGV0IHBvc2l0aW9uXG4gICAgbGV0IHZlbG9jaXR5XG4gICAgbGV0IG5vdGVMZW5ndGhcbiAgICBsZXQgbm90ZU51bWJlclxuICAgIGxldCBiZWF0c1BlckJhclxuICAgIGxldCB0aWNrc1BlckJlYXRcbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IG5vdGVPbiwgbm90ZU9mZlxuICAgIGxldCBldmVudHMgPSBbXVxuXG4gICAgLy9jb25zb2xlLmxvZyhzdGFydEJhciwgZW5kQmFyKTtcblxuICAgIGZvcihpID0gc3RhcnRCYXI7IGkgPD0gZW5kQmFyOyBpKyspe1xuICAgICAgcG9zaXRpb24gPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLnNvbmcsIHtcbiAgICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAgIHRhcmdldDogW2ldLFxuICAgICAgfSlcblxuICAgICAgYmVhdHNQZXJCYXIgPSBwb3NpdGlvbi5ub21pbmF0b3JcbiAgICAgIHRpY2tzUGVyQmVhdCA9IHBvc2l0aW9uLnRpY2tzUGVyQmVhdFxuICAgICAgdGlja3MgPSBwb3NpdGlvbi50aWNrc1xuXG4gICAgICBmb3IoaiA9IDA7IGogPCBiZWF0c1BlckJhcjsgaisrKXtcblxuICAgICAgICBub3RlTnVtYmVyID0gaiA9PT0gMCA/IHRoaXMubm90ZU51bWJlckFjY2VudGVkIDogdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWRcbiAgICAgICAgbm90ZUxlbmd0aCA9IGogPT09IDAgPyB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA6IHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkXG4gICAgICAgIHZlbG9jaXR5ID0gaiA9PT0gMCA/IHRoaXMudmVsb2NpdHlBY2NlbnRlZCA6IHRoaXMudmVsb2NpdHlOb25BY2NlbnRlZFxuXG4gICAgICAgIG5vdGVPbiA9IG5ldyBNSURJRXZlbnQodGlja3MsIDE0NCwgbm90ZU51bWJlciwgdmVsb2NpdHkpXG4gICAgICAgIG5vdGVPZmYgPSBuZXcgTUlESUV2ZW50KHRpY2tzICsgbm90ZUxlbmd0aCwgMTI4LCBub3RlTnVtYmVyLCAwKVxuXG4gICAgICAgIGlmKGlkID09PSAncHJlY291bnQnKXtcbiAgICAgICAgICBub3RlT24uX3RyYWNrID0gdGhpcy50cmFja1xuICAgICAgICAgIG5vdGVPZmYuX3RyYWNrID0gdGhpcy50cmFja1xuICAgICAgICAgIG5vdGVPbi5fcGFydCA9IHt9XG4gICAgICAgICAgbm90ZU9mZi5fcGFydCA9IHt9XG4gICAgICAgIH1cblxuICAgICAgICBldmVudHMucHVzaChub3RlT24sIG5vdGVPZmYpXG4gICAgICAgIHRpY2tzICs9IHRpY2tzUGVyQmVhdFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldmVudHNcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKHN0YXJ0QmFyID0gMSwgZW5kQmFyID0gdGhpcy5zb25nLmJhcnMsIGlkID0gJ2luaXQnKXtcbiAgICB0aGlzLnBhcnQucmVtb3ZlRXZlbnRzKHRoaXMucGFydC5nZXRFdmVudHMoKSlcbiAgICB0aGlzLmV2ZW50cyA9IHRoaXMuY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIGlkKVxuICAgIHRoaXMucGFydC5hZGRFdmVudHMoLi4udGhpcy5ldmVudHMpXG4gICAgdGhpcy5iYXJzID0gdGhpcy5zb25nLmJhcnNcbiAgICAvL2NvbnNvbGUubG9nKCdnZXRFdmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICB0aGlzLmFsbEV2ZW50cyA9IFsuLi50aGlzLmV2ZW50cywgLi4udGhpcy5zb25nLl90aW1lRXZlbnRzXVxuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuYWxsRXZlbnRzKVxuICAgIHNvcnRFdmVudHModGhpcy5hbGxFdmVudHMpXG4gICAgcGFyc2VNSURJTm90ZXModGhpcy5ldmVudHMpXG4gICAgcmV0dXJuIHRoaXMuZXZlbnRzXG4gIH1cblxuXG4gIHNldEluZGV4MihtaWxsaXMpe1xuICAgIHRoaXMuaW5kZXgyID0gMFxuICB9XG5cbiAgZ2V0RXZlbnRzMihtYXh0aW1lLCB0aW1lU3RhbXApe1xuICAgIGxldCByZXN1bHQgPSBbXVxuXG4gICAgZm9yKGxldCBpID0gdGhpcy5pbmRleDIsIG1heGkgPSB0aGlzLmFsbEV2ZW50cy5sZW5ndGg7IGkgPCBtYXhpOyBpKyspe1xuXG4gICAgICBsZXQgZXZlbnQgPSB0aGlzLmFsbEV2ZW50c1tpXVxuXG4gICAgICBpZihldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5URU1QTyB8fCBldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSl7XG4gICAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIHRoaXMubWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2tcbiAgICAgICAgICB0aGlzLmluZGV4MisrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cblxuICAgICAgfWVsc2V7XG4gICAgICAgIGxldCBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGlja1xuICAgICAgICBpZihtaWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZVN0YW1wXG4gICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgICAgICAgdGhpcy5pbmRleDIrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG5cbiAgYWRkRXZlbnRzKHN0YXJ0QmFyID0gMSwgZW5kQmFyID0gdGhpcy5zb25nLmJhcnMsIGlkID0gJ2FkZCcpe1xuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0QmFyLCBlbmRCYXIpXG4gICAgbGV0IGV2ZW50cyA9IHRoaXMuY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIGlkKVxuICAgIHRoaXMuZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIHRoaXMucGFydC5hZGRFdmVudHMoLi4uZXZlbnRzKVxuICAgIHRoaXMuYmFycyA9IGVuZEJhclxuICAgIC8vY29uc29sZS5sb2coJ2dldEV2ZW50cyAlTycsIHRoaXMuZXZlbnRzLCBlbmRCYXIpXG4gICAgcmV0dXJuIGV2ZW50c1xuICB9XG5cblxuICBjcmVhdGVQcmVjb3VudEV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCB0aW1lU3RhbXApe1xuXG4gICAgdGhpcy50aW1lU3RhbXAgPSB0aW1lU3RhbXBcblxuLy8gICBsZXQgc29uZ1N0YXJ0UG9zaXRpb24gPSB0aGlzLnNvbmcuZ2V0UG9zaXRpb24oKVxuXG4gICAgbGV0IHNvbmdTdGFydFBvc2l0aW9uID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcy5zb25nLCB7XG4gICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgIHRhcmdldDogW3N0YXJ0QmFyXSxcbiAgICAgIHJlc3VsdDogJ21pbGxpcycsXG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKCdzdGFyQmFyJywgc29uZ1N0YXJ0UG9zaXRpb24uYmFyKVxuXG4gICAgbGV0IGVuZFBvcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAvL3RhcmdldDogW3NvbmdTdGFydFBvc2l0aW9uLmJhciArIHByZWNvdW50LCBzb25nU3RhcnRQb3NpdGlvbi5iZWF0LCBzb25nU3RhcnRQb3NpdGlvbi5zaXh0ZWVudGgsIHNvbmdTdGFydFBvc2l0aW9uLnRpY2tdLFxuICAgICAgdGFyZ2V0OiBbZW5kQmFyXSxcbiAgICAgIHJlc3VsdDogJ21pbGxpcycsXG4gICAgfSlcblxuICAgIC8vY29uc29sZS5sb2coc29uZ1N0YXJ0UG9zaXRpb24sIGVuZFBvcylcblxuICAgIHRoaXMucHJlY291bnRJbmRleCA9IDBcbiAgICB0aGlzLnN0YXJ0TWlsbGlzID0gc29uZ1N0YXJ0UG9zaXRpb24ubWlsbGlzXG4gICAgdGhpcy5lbmRNaWxsaXMgPSBlbmRQb3MubWlsbGlzXG4gICAgdGhpcy5wcmVjb3VudER1cmF0aW9uID0gZW5kUG9zLm1pbGxpcyAtIHRoaXMuc3RhcnRNaWxsaXNcblxuICAgIC8vIGRvIHRoaXMgc28geW91IGNhbiBzdGFydCBwcmVjb3VudGluZyBhdCBhbnkgcG9zaXRpb24gaW4gdGhlIHNvbmdcbiAgICB0aGlzLnRpbWVTdGFtcCAtPSB0aGlzLnN0YXJ0TWlsbGlzXG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMucHJlY291bnREdXJhdGlvbiwgdGhpcy5zdGFydE1pbGxpcywgdGhpcy5lbmRNaWxsaXMpXG5cbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciAtIDEsICdwcmVjb3VudCcpO1xuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSBwYXJzZUV2ZW50cyhbLi4udGhpcy5zb25nLl90aW1lRXZlbnRzLCAuLi50aGlzLnByZWNvdW50RXZlbnRzXSlcblxuICAgIC8vY29uc29sZS5sb2coc29uZ1N0YXJ0UG9zaXRpb24uYmFyLCBlbmRQb3MuYmFyLCBwcmVjb3VudCwgdGhpcy5wcmVjb3VudEV2ZW50cy5sZW5ndGgpO1xuICAgIC8vY29uc29sZS5sb2codGhpcy5wcmVjb3VudEV2ZW50cy5sZW5ndGgsIHRoaXMucHJlY291bnREdXJhdGlvbik7XG4gICAgcmV0dXJuIHRoaXMucHJlY291bnREdXJhdGlvblxuICB9XG5cblxuICBzZXRQcmVjb3VudEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvcihsZXQgZXZlbnQgb2YgdGhpcy5ldmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgICAgIHRoaXMucHJlY291bnRJbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyh0aGlzLnByZWNvdW50SW5kZXgpXG4gIH1cblxuXG4gIC8vIGNhbGxlZCBieSBzY2hlZHVsZXIuanNcbiAgZ2V0UHJlY291bnRFdmVudHMobWF4dGltZSl7XG4gICAgbGV0IGV2ZW50cyA9IHRoaXMucHJlY291bnRFdmVudHMsXG4gICAgICBtYXhpID0gZXZlbnRzLmxlbmd0aCwgaSwgZXZ0LFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgICAvL21heHRpbWUgKz0gdGhpcy5wcmVjb3VudER1cmF0aW9uXG5cbiAgICBmb3IoaSA9IHRoaXMucHJlY291bnRJbmRleDsgaSA8IG1heGk7IGkrKyl7XG4gICAgICBldnQgPSBldmVudHNbaV07XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgbWF4dGltZSwgdGhpcy5taWxsaXMpO1xuICAgICAgaWYoZXZ0Lm1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICBldnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZ0Lm1pbGxpc1xuICAgICAgICByZXN1bHQucHVzaChldnQpXG4gICAgICAgIHRoaXMucHJlY291bnRJbmRleCsrXG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2cocmVzdWx0Lmxlbmd0aCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG5cbiAgbXV0ZShmbGFnKXtcbiAgICB0aGlzLnRyYWNrLm11dGVkID0gZmxhZ1xuICB9XG5cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMudHJhY2suX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICB9XG5cblxuICAvLyA9PT09PT09PT09PSBDT05GSUdVUkFUSU9OID09PT09PT09PT09XG5cbiAgdXBkYXRlQ29uZmlnKCl7XG4gICAgdGhpcy5pbml0KDEsIHRoaXMuYmFycywgJ3VwZGF0ZScpXG4gICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgdGhpcy5zb25nLnVwZGF0ZSgpXG4gIH1cblxuICAvLyBhZGRlZCB0byBwdWJsaWMgQVBJOiBTb25nLmNvbmZpZ3VyZU1ldHJvbm9tZSh7fSlcbiAgY29uZmlndXJlKGNvbmZpZyl7XG5cbiAgICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgIHRoaXNbbWV0aG9kTWFwLmdldChrZXkpXShjb25maWcua2V5KTtcbiAgICB9LCB0aGlzKTtcblxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldEluc3RydW1lbnQoaW5zdHJ1bWVudCl7XG4gICAgaWYoIWluc3RydW1lbnQgaW5zdGFuY2VvZiBJbnN0cnVtZW50KXtcbiAgICAgIGNvbnNvbGUud2Fybignbm90IGFuIGluc3RhbmNlIG9mIEluc3RydW1lbnQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMudHJhY2suc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVMZW5ndGhBY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMubm90ZUxlbmd0aEFjY2VudGVkID0gdmFsdWU7XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgaWYoaXNOYU4odmFsdWUpKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWZWxvY2l0eUFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0VmVsb2NpdHlOb25BY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWb2x1bWUodmFsdWUpe1xuICAgIHRoaXMudHJhY2suc2V0Vm9sdW1lKHZhbHVlKTtcbiAgfVxufVxuXG4iLCIvLyBAIGZsb3dcblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBNSURJRXZlbnR7XG5cbiAgY29uc3RydWN0b3IodGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyID0gLTEpe1xuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLnRpY2tzID0gdGlja3NcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5kYXRhMSA9IGRhdGExXG4gICAgdGhpcy5kYXRhMiA9IGRhdGEyXG4gICAgdGhpcy5mcmVxdWVuY3kgPSA0NDAgKiBNYXRoLnBvdygyLCAoZGF0YTEgLSA2OSkgLyAxMilcblxuICAgIGlmKGRhdGExID09PSAxNDQgJiYgZGF0YTIgPT09IDApe1xuICAgICAgdGhpcy5kYXRhMSA9IDEyOFxuICAgIH1cblxuICAgIHRoaXMuX3BhcnQgPSBudWxsXG4gICAgdGhpcy5fdHJhY2sgPSBudWxsXG4gICAgdGhpcy5fc29uZyA9IG51bGxcbiAgICAvL0BUT0RPOiBhZGQgYWxsIG90aGVyIHByb3BlcnRpZXNcbiAgfVxuXG4gIGNvcHkoKXtcbiAgICBsZXQgbSA9IG5ldyBNSURJRXZlbnQodGhpcy50aWNrcywgdGhpcy50eXBlLCB0aGlzLmRhdGExLCB0aGlzLmRhdGEyKVxuICAgIHJldHVybiBtXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpeyAvLyBtYXkgYmUgYmV0dGVyIGlmIG5vdCBhIHB1YmxpYyBtZXRob2Q/XG4gICAgdGhpcy5kYXRhMSArPSBhbW91bnRcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IDQ0MCAqIE1hdGgucG93KDIsICh0aGlzLmRhdGExIC0gNjkpIC8gMTIpXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMudGlja3MgKz0gdGlja3NcbiAgICBpZih0aGlzLm1pZGlOb3RlKXtcbiAgICAgIHRoaXMubWlkaU5vdGUudXBkYXRlKClcbiAgICB9XG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcil7XG4gICAgdGhpcy50aWNrcyA9IHRpY2tzXG4gICAgaWYodGhpcy5taWRpTm90ZSl7XG4gICAgICB0aGlzLm1pZGlOb3RlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG59XG5cblxuLypcbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVNSURJRXZlbnQoZXZlbnQpe1xuICAvL2V2ZW50Lm5vdGUgPSBudWxsXG4gIGV2ZW50Lm5vdGUgPSBudWxsXG4gIGV2ZW50ID0gbnVsbFxufVxuKi9cbiIsImltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgTUlESU5vdGV7XG5cbiAgY29uc3RydWN0b3Iobm90ZW9uOiBNSURJRXZlbnQsIG5vdGVvZmY6IE1JRElFdmVudCl7XG4gICAgLy9pZihub3Rlb24udHlwZSAhPT0gMTQ0IHx8IG5vdGVvZmYudHlwZSAhPT0gMTI4KXtcbiAgICBpZihub3Rlb24udHlwZSAhPT0gMTQ0KXtcbiAgICAgIGNvbnNvbGUud2FybignY2Fubm90IGNyZWF0ZSBNSURJTm90ZScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubm90ZU9uID0gbm90ZW9uXG4gICAgbm90ZW9uLm1pZGlOb3RlID0gdGhpc1xuICAgIG5vdGVvbi5taWRpTm90ZUlkID0gdGhpcy5pZFxuXG4gICAgaWYobm90ZW9mZiBpbnN0YW5jZW9mIE1JRElFdmVudCl7XG4gICAgICB0aGlzLm5vdGVPZmYgPSBub3Rlb2ZmXG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlID0gdGhpc1xuICAgICAgbm90ZW9mZi5taWRpTm90ZUlkID0gdGhpcy5pZFxuICAgICAgdGhpcy5kdXJhdGlvblRpY2tzID0gbm90ZW9mZi50aWNrcyAtIG5vdGVvbi50aWNrc1xuICAgICAgdGhpcy5kdXJhdGlvbk1pbGxpcyA9IC0xXG4gICAgfVxuICB9XG5cbiAgYWRkTm90ZU9mZihub3Rlb2ZmKXtcbiAgICB0aGlzLm5vdGVPZmYgPSBub3Rlb2ZmXG4gICAgbm90ZW9mZi5taWRpTm90ZSA9IHRoaXNcbiAgICBub3Rlb2ZmLm1pZGlOb3RlSWQgPSB0aGlzLmlkXG4gICAgdGhpcy5kdXJhdGlvblRpY2tzID0gbm90ZW9mZi50aWNrcyAtIHRoaXMubm90ZU9uLnRpY2tzXG4gICAgdGhpcy5kdXJhdGlvbk1pbGxpcyA9IC0xXG4gIH1cblxuICBjb3B5KCl7XG4gICAgcmV0dXJuIG5ldyBNSURJTm90ZSh0aGlzLm5vdGVPbi5jb3B5KCksIHRoaXMubm90ZU9mZi5jb3B5KCkpXG4gIH1cblxuICB1cGRhdGUoKXsgLy8gbWF5IHVzZSBhbm90aGVyIG5hbWUgZm9yIHRoaXMgbWV0aG9kXG4gICAgdGhpcy5kdXJhdGlvblRpY2tzID0gdGhpcy5ub3RlT2ZmLnRpY2tzIC0gdGhpcy5ub3RlT24udGlja3NcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcik6IHZvaWR7XG4gICAgdGhpcy5ub3RlT24udHJhbnNwb3NlKGFtb3VudClcbiAgICB0aGlzLm5vdGVPZmYudHJhbnNwb3NlKGFtb3VudClcbiAgfVxuXG4gIG1vdmUodGlja3M6IG51bWJlcik6IHZvaWR7XG4gICAgdGhpcy5ub3RlT24ubW92ZSh0aWNrcylcbiAgICB0aGlzLm5vdGVPZmYubW92ZSh0aWNrcylcbiAgfVxuXG4gIG1vdmVUbyh0aWNrczogbnVtYmVyKTogdm9pZHtcbiAgICB0aGlzLm5vdGVPbi5tb3ZlVG8odGlja3MpXG4gICAgdGhpcy5ub3RlT2ZmLm1vdmVUbyh0aWNrcylcbiAgfVxuXG4gIHVucmVnaXN0ZXIoKXtcbiAgICBpZih0aGlzLnBhcnQpe1xuICAgICAgdGhpcy5wYXJ0LnJlbW92ZUV2ZW50cyh0aGlzKVxuICAgICAgdGhpcy5wYXJ0ID0gbnVsbFxuICAgIH1cbiAgICBpZih0aGlzLnRyYWNrKXtcbiAgICAgIHRoaXMudHJhY2sucmVtb3ZlRXZlbnRzKHRoaXMpXG4gICAgICB0aGlzLnRyYWNrID0gbnVsbFxuICAgIH1cbiAgICBpZih0aGlzLnNvbmcpe1xuICAgICAgdGhpcy5zb25nLnJlbW92ZUV2ZW50cyh0aGlzKVxuICAgICAgdGhpcy5zb25nID0gbnVsbFxuICAgIH1cbiAgfVxufVxuXG4iLCIvKlxuICBXcmFwcGVyIGZvciBhY2Nlc3NpbmcgYnl0ZXMgdGhyb3VnaCBzZXF1ZW50aWFsIHJlYWRzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4gIGFkYXB0ZWQgdG8gd29yayB3aXRoIEFycmF5QnVmZmVyIC0+IFVpbnQ4QXJyYXlcbiovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNSURJU3RyZWFte1xuXG4gIC8vIGJ1ZmZlciBpcyBVaW50OEFycmF5XG4gIGNvbnN0cnVjdG9yKGJ1ZmZlcil7XG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICAvKiByZWFkIHN0cmluZyBvciBhbnkgbnVtYmVyIG9mIGJ5dGVzICovXG4gIHJlYWQobGVuZ3RoLCB0b1N0cmluZyA9IHRydWUpIHtcbiAgICBsZXQgcmVzdWx0O1xuXG4gICAgaWYodG9TdHJpbmcpe1xuICAgICAgcmVzdWx0ID0gJyc7XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdCArPSBmY2ModGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9ZWxzZXtcbiAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDMyLWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQzMigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDI0KSArXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdIDw8IDE2KSArXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDJdIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAzXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSA0O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAxNi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MTYoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV1cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhbiA4LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQ4KHNpZ25lZCkge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXTtcbiAgICBpZihzaWduZWQgJiYgcmVzdWx0ID4gMTI3KXtcbiAgICAgIHJlc3VsdCAtPSAyNTY7XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb24gKz0gMTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZW9mKCkge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uID49IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBNSURJLXN0eWxlIGxldGlhYmxlLWxlbmd0aCBpbnRlZ2VyXG4gICAgKGJpZy1lbmRpYW4gdmFsdWUgaW4gZ3JvdXBzIG9mIDcgYml0cyxcbiAgICB3aXRoIHRvcCBiaXQgc2V0IHRvIHNpZ25pZnkgdGhhdCBhbm90aGVyIGJ5dGUgZm9sbG93cylcbiAgKi9cbiAgcmVhZFZhckludCgpIHtcbiAgICBsZXQgcmVzdWx0ID0gMDtcbiAgICB3aGlsZSh0cnVlKSB7XG4gICAgICBsZXQgYiA9IHRoaXMucmVhZEludDgoKTtcbiAgICAgIGlmIChiICYgMHg4MCkge1xuICAgICAgICByZXN1bHQgKz0gKGIgJiAweDdmKTtcbiAgICAgICAgcmVzdWx0IDw8PSA3O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyogYiBpcyB0aGUgbGFzdCBieXRlICovXG4gICAgICAgIHJldHVybiByZXN1bHQgKyBiO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc2V0KCl7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICBzZXRQb3NpdGlvbihwKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gcDtcbiAgfVxufVxuIiwiLypcbiAgRXh0cmFjdHMgYWxsIG1pZGkgZXZlbnRzIGZyb20gYSBiaW5hcnkgbWlkaSBmaWxlLCB1c2VzIG1pZGlfc3RyZWFtLmpzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBNSURJU3RyZWFtIGZyb20gJy4vbWlkaV9zdHJlYW0nO1xuXG5sZXRcbiAgbGFzdEV2ZW50VHlwZUJ5dGUsXG4gIHRyYWNrTmFtZTtcblxuXG5mdW5jdGlvbiByZWFkQ2h1bmsoc3RyZWFtKXtcbiAgbGV0IGlkID0gc3RyZWFtLnJlYWQoNCwgdHJ1ZSk7XG4gIGxldCBsZW5ndGggPSBzdHJlYW0ucmVhZEludDMyKCk7XG4gIC8vY29uc29sZS5sb2cobGVuZ3RoKTtcbiAgcmV0dXJue1xuICAgICdpZCc6IGlkLFxuICAgICdsZW5ndGgnOiBsZW5ndGgsXG4gICAgJ2RhdGEnOiBzdHJlYW0ucmVhZChsZW5ndGgsIGZhbHNlKVxuICB9O1xufVxuXG5cbmZ1bmN0aW9uIHJlYWRFdmVudChzdHJlYW0pe1xuICB2YXIgZXZlbnQgPSB7fTtcbiAgdmFyIGxlbmd0aDtcbiAgZXZlbnQuZGVsdGFUaW1lID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgbGV0IGV2ZW50VHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgLy9jb25zb2xlLmxvZyhldmVudFR5cGVCeXRlLCBldmVudFR5cGVCeXRlICYgMHg4MCwgMTQ2ICYgMHgwZik7XG4gIGlmKChldmVudFR5cGVCeXRlICYgMHhmMCkgPT0gMHhmMCl7XG4gICAgLyogc3lzdGVtIC8gbWV0YSBldmVudCAqL1xuICAgIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmZil7XG4gICAgICAvKiBtZXRhIGV2ZW50ICovXG4gICAgICBldmVudC50eXBlID0gJ21ldGEnO1xuICAgICAgbGV0IHN1YnR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgc3dpdGNoKHN1YnR5cGVCeXRlKXtcbiAgICAgICAgY2FzZSAweDAwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VOdW1iZXInO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMil7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXF1ZW5jZU51bWJlciBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtYmVyID0gc3RyZWFtLnJlYWRJbnQxNigpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGV4dCc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDI6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb3B5cmlnaHROb3RpY2UnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAzOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndHJhY2tOYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICB0cmFja05hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA0OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnaW5zdHJ1bWVudE5hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA1OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbHlyaWNzJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21hcmtlcic7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDc6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjdWVQb2ludCc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MjA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtaWRpQ2hhbm5lbFByZWZpeCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAxKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIG1pZGlDaGFubmVsUHJlZml4IGV2ZW50IGlzIDEsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jaGFubmVsID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MmY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdlbmRPZlRyYWNrJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDApe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgZW5kT2ZUcmFjayBldmVudCBpcyAwLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXRUZW1wbyc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAzKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNldFRlbXBvIGV2ZW50IGlzIDMsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5taWNyb3NlY29uZHNQZXJCZWF0ID0gKFxuICAgICAgICAgICAgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDE2KSArXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgOCkgK1xuICAgICAgICAgICAgc3RyZWFtLnJlYWRJbnQ4KClcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU0OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc21wdGVPZmZzZXQnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gNSl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzbXB0ZU9mZnNldCBldmVudCBpcyA1LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGhvdXJCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWVSYXRlID17XG4gICAgICAgICAgICAweDAwOiAyNCwgMHgyMDogMjUsIDB4NDA6IDI5LCAweDYwOiAzMFxuICAgICAgICAgIH1baG91ckJ5dGUgJiAweDYwXTtcbiAgICAgICAgICBldmVudC5ob3VyID0gaG91ckJ5dGUgJiAweDFmO1xuICAgICAgICAgIGV2ZW50Lm1pbiA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnNlYyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc3ViZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RpbWVTaWduYXR1cmUnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gNCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciB0aW1lU2lnbmF0dXJlIGV2ZW50IGlzIDQsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1lcmF0b3IgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5kZW5vbWluYXRvciA9IE1hdGgucG93KDIsIHN0cmVhbS5yZWFkSW50OCgpKTtcbiAgICAgICAgICBldmVudC5tZXRyb25vbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC50aGlydHlzZWNvbmRzID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTk6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdrZXlTaWduYXR1cmUnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMil7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBrZXlTaWduYXR1cmUgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmtleSA9IHN0cmVhbS5yZWFkSW50OCh0cnVlKTtcbiAgICAgICAgICBldmVudC5zY2FsZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDdmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VyU3BlY2lmaWMnO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvL2lmKHNlcXVlbmNlci5kZWJ1ZyA+PSAyKXtcbiAgICAgICAgICAvLyAgICBjb25zb2xlLndhcm4oJ1VucmVjb2duaXNlZCBtZXRhIGV2ZW50IHN1YnR5cGU6ICcgKyBzdWJ0eXBlQnl0ZSk7XG4gICAgICAgICAgLy99XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICB9XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4ZjApe1xuICAgICAgZXZlbnQudHlwZSA9ICdzeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2UgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGY3KXtcbiAgICAgIGV2ZW50LnR5cGUgPSAnZGl2aWRlZFN5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlIGJ5dGU6ICcgKyBldmVudFR5cGVCeXRlO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgLyogY2hhbm5lbCBldmVudCAqL1xuICAgIGxldCBwYXJhbTE7XG4gICAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweDgwKSA9PT0gMCl7XG4gICAgICAvKiBydW5uaW5nIHN0YXR1cyAtIHJldXNlIGxhc3RFdmVudFR5cGVCeXRlIGFzIHRoZSBldmVudCB0eXBlLlxuICAgICAgICBldmVudFR5cGVCeXRlIGlzIGFjdHVhbGx5IHRoZSBmaXJzdCBwYXJhbWV0ZXJcbiAgICAgICovXG4gICAgICAvL2NvbnNvbGUubG9nKCdydW5uaW5nIHN0YXR1cycpO1xuICAgICAgcGFyYW0xID0gZXZlbnRUeXBlQnl0ZTtcbiAgICAgIGV2ZW50VHlwZUJ5dGUgPSBsYXN0RXZlbnRUeXBlQnl0ZTtcbiAgICB9ZWxzZXtcbiAgICAgIHBhcmFtMSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgLy9jb25zb2xlLmxvZygnbGFzdCcsIGV2ZW50VHlwZUJ5dGUpO1xuICAgICAgbGFzdEV2ZW50VHlwZUJ5dGUgPSBldmVudFR5cGVCeXRlO1xuICAgIH1cbiAgICBsZXQgZXZlbnRUeXBlID0gZXZlbnRUeXBlQnl0ZSA+PiA0O1xuICAgIGV2ZW50LmNoYW5uZWwgPSBldmVudFR5cGVCeXRlICYgMHgwZjtcbiAgICBldmVudC50eXBlID0gJ2NoYW5uZWwnO1xuICAgIHN3aXRjaCAoZXZlbnRUeXBlKXtcbiAgICAgIGNhc2UgMHgwODpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT2ZmJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDA5OlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBpZihldmVudC52ZWxvY2l0eSA9PT0gMCl7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT2ZmJztcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ25vdGVPbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGI6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29udHJvbGxlcic7XG4gICAgICAgIGV2ZW50LmNvbnRyb2xsZXJUeXBlID0gcGFyYW0xO1xuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGM6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncHJvZ3JhbUNoYW5nZSc7XG4gICAgICAgIGV2ZW50LnByb2dyYW1OdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZDpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjaGFubmVsQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHBhcmFtMTtcbiAgICAgICAgLy9pZih0cmFja05hbWUgPT09ICdTSC1TMS00NC1DMDkgTD1TTUwgSU49Mycpe1xuICAgICAgICAvLyAgICBjb25zb2xlLmxvZygnY2hhbm5lbCBwcmVzc3VyZScsIHRyYWNrTmFtZSwgcGFyYW0xKTtcbiAgICAgICAgLy99XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwaXRjaEJlbmQnO1xuICAgICAgICBldmVudC52YWx1ZSA9IHBhcmFtMSArIChzdHJlYW0ucmVhZEludDgoKSA8PCA3KTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLypcbiAgICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGU7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlKTtcbiAgICAgICAgKi9cblxuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbi8qXG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgY29uc29sZS5sb2coJ3dlaXJkbycsIHRyYWNrTmFtZSwgcGFyYW0xLCBldmVudC52ZWxvY2l0eSk7XG4qL1xuXG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNSURJRmlsZShidWZmZXIpe1xuICBpZihidWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5ID09PSBmYWxzZSAmJiBidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUuZXJyb3IoJ2J1ZmZlciBzaG91bGQgYmUgYW4gaW5zdGFuY2Ugb2YgVWludDhBcnJheSBvZiBBcnJheUJ1ZmZlcicpXG4gICAgcmV0dXJuXG4gIH1cbiAgaWYoYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe1xuICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgfVxuICBsZXQgdHJhY2tzID0gbmV3IE1hcCgpO1xuICBsZXQgc3RyZWFtID0gbmV3IE1JRElTdHJlYW0oYnVmZmVyKTtcblxuICBsZXQgaGVhZGVyQ2h1bmsgPSByZWFkQ2h1bmsoc3RyZWFtKTtcbiAgaWYoaGVhZGVyQ2h1bmsuaWQgIT09ICdNVGhkJyB8fCBoZWFkZXJDaHVuay5sZW5ndGggIT09IDYpe1xuICAgIHRocm93ICdCYWQgLm1pZCBmaWxlIC0gaGVhZGVyIG5vdCBmb3VuZCc7XG4gIH1cblxuICBsZXQgaGVhZGVyU3RyZWFtID0gbmV3IE1JRElTdHJlYW0oaGVhZGVyQ2h1bmsuZGF0YSk7XG4gIGxldCBmb3JtYXRUeXBlID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdHJhY2tDb3VudCA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgbGV0IHRpbWVEaXZpc2lvbiA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcblxuICBpZih0aW1lRGl2aXNpb24gJiAweDgwMDApe1xuICAgIHRocm93ICdFeHByZXNzaW5nIHRpbWUgZGl2aXNpb24gaW4gU01UUEUgZnJhbWVzIGlzIG5vdCBzdXBwb3J0ZWQgeWV0JztcbiAgfVxuXG4gIGxldCBoZWFkZXIgPXtcbiAgICAnZm9ybWF0VHlwZSc6IGZvcm1hdFR5cGUsXG4gICAgJ3RyYWNrQ291bnQnOiB0cmFja0NvdW50LFxuICAgICd0aWNrc1BlckJlYXQnOiB0aW1lRGl2aXNpb25cbiAgfTtcblxuICBmb3IobGV0IGkgPSAwOyBpIDwgdHJhY2tDb3VudDsgaSsrKXtcbiAgICB0cmFja05hbWUgPSAndHJhY2tfJyArIGk7XG4gICAgbGV0IHRyYWNrID0gW107XG4gICAgbGV0IHRyYWNrQ2h1bmsgPSByZWFkQ2h1bmsoc3RyZWFtKTtcbiAgICBpZih0cmFja0NodW5rLmlkICE9PSAnTVRyaycpe1xuICAgICAgdGhyb3cgJ1VuZXhwZWN0ZWQgY2h1bmsgLSBleHBlY3RlZCBNVHJrLCBnb3QgJysgdHJhY2tDaHVuay5pZDtcbiAgICB9XG4gICAgbGV0IHRyYWNrU3RyZWFtID0gbmV3IE1JRElTdHJlYW0odHJhY2tDaHVuay5kYXRhKTtcbiAgICB3aGlsZSghdHJhY2tTdHJlYW0uZW9mKCkpe1xuICAgICAgbGV0IGV2ZW50ID0gcmVhZEV2ZW50KHRyYWNrU3RyZWFtKTtcbiAgICAgIHRyYWNrLnB1c2goZXZlbnQpO1xuICAgIH1cbiAgICB0cmFja3Muc2V0KHRyYWNrTmFtZSwgdHJhY2spO1xuICB9XG5cbiAgcmV0dXJue1xuICAgICdoZWFkZXInOiBoZWFkZXIsXG4gICAgJ3RyYWNrcyc6IHRyYWNrc1xuICB9O1xufSIsIi8qXG4gIEFkZHMgYSBmdW5jdGlvbiB0byBjcmVhdGUgYSBub3RlIG9iamVjdCB0aGF0IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGEgbXVzaWNhbCBub3RlOlxuICAgIC0gbmFtZSwgZS5nLiAnQydcbiAgICAtIG9jdGF2ZSwgIC0xIC0gOVxuICAgIC0gZnVsbE5hbWU6ICdDMSdcbiAgICAtIGZyZXF1ZW5jeTogMjM0LjE2LCBiYXNlZCBvbiB0aGUgYmFzaWMgcGl0Y2hcbiAgICAtIG51bWJlcjogNjAgbWlkaSBub3RlIG51bWJlclxuXG4gIEFkZHMgc2V2ZXJhbCB1dGlsaXR5IG1ldGhvZHMgb3JnYW5pc2VkIGFyb3VuZCB0aGUgbm90ZSBvYmplY3RcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnO1xuXG5sZXRcbiAgZXJyb3JNc2csXG4gIHdhcm5pbmdNc2csXG4gIHBvdyA9IE1hdGgucG93LFxuICBmbG9vciA9IE1hdGguZmxvb3I7XG5cbmNvbnN0IG5vdGVOYW1lcyA9IHtcbiAgJ3NoYXJwJyA6IFsnQycsICdDIycsICdEJywgJ0QjJywgJ0UnLCAnRicsICdGIycsICdHJywgJ0cjJywgJ0EnLCAnQSMnLCAnQiddLFxuICAnZmxhdCcgOiBbJ0MnLCAnRGInLCAnRCcsICdFYicsICdFJywgJ0YnLCAnR2InLCAnRycsICdBYicsICdBJywgJ0JiJywgJ0InXSxcbiAgJ2VuaGFybW9uaWMtc2hhcnAnIDogWydCIycsICdDIycsICdDIyMnLCAnRCMnLCAnRCMjJywgJ0UjJywgJ0YjJywgJ0YjIycsICdHIycsICdHIyMnLCAnQSMnLCAnQSMjJ10sXG4gICdlbmhhcm1vbmljLWZsYXQnIDogWydEYmInLCAnRGInLCAnRWJiJywgJ0ViJywgJ0ZiJywgJ0diYicsICdHYicsICdBYmInLCAnQWInLCAnQmJiJywgJ0JiJywgJ0NiJ11cbn07XG5cblxuLypcbiAgYXJndW1lbnRzXG4gIC0gbm90ZU51bWJlcjogNjBcbiAgLSBub3RlTnVtYmVyIGFuZCBub3RlbmFtZSBtb2RlOiA2MCwgJ3NoYXJwJ1xuICAtIG5vdGVOYW1lOiAnQyM0J1xuICAtIG5hbWUgYW5kIG9jdGF2ZTogJ0MjJywgNFxuICAtIG5vdGUgbmFtZSwgb2N0YXZlLCBub3RlIG5hbWUgbW9kZTogJ0QnLCA0LCAnc2hhcnAnXG4gIC0gZGF0YSBvYmplY3Q6XG4gICAge1xuICAgICAgbmFtZTogJ0MnLFxuICAgICAgb2N0YXZlOiA0XG4gICAgfVxuICAgIG9yXG4gICAge1xuICAgICAgZnJlcXVlbmN5OiAyMzQuMTZcbiAgICB9XG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTm90ZSguLi5hcmdzKXtcbiAgbGV0XG4gICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoLFxuICAgIGRhdGEsXG4gICAgb2N0YXZlLFxuICAgIG5vdGVOYW1lLFxuICAgIG5vdGVOdW1iZXIsXG4gICAgbm90ZU5hbWVNb2RlLFxuICAgIGFyZzAgPSBhcmdzWzBdLFxuICAgIGFyZzEgPSBhcmdzWzFdLFxuICAgIGFyZzIgPSBhcmdzWzJdLFxuICAgIHR5cGUwID0gdHlwZVN0cmluZyhhcmcwKSxcbiAgICB0eXBlMSA9IHR5cGVTdHJpbmcoYXJnMSksXG4gICAgdHlwZTIgPSB0eXBlU3RyaW5nKGFyZzIpO1xuXG4gIGVycm9yTXNnID0gJyc7XG4gIHdhcm5pbmdNc2cgPSAnJztcblxuICAvLyBhcmd1bWVudDogbm90ZSBudW1iZXJcbiAgLy9jb25zb2xlLmxvZyhudW1BcmdzLCB0eXBlMClcbiAgaWYobnVtQXJncyA9PT0gMSAmJiB0eXBlMCA9PT0gJ251bWJlcicpe1xuICAgIGlmKGFyZzAgPCAwIHx8IGFyZzAgPiAxMjcpe1xuICAgICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYSBub3RlIG51bWJlciA+PSAwIGFuZCA8PSAxMjcgJyArICBhcmcwO1xuICAgIH1lbHNle1xuICAgICAgbm90ZU51bWJlciA9IGFyZzA7XG4gICAgICBkYXRhID0gX2dldE5vdGVOYW1lKG5vdGVOdW1iZXIpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICB9XG5cblxuICAvLyBhcmd1bWVudHM6IGZ1bGwgbm90ZSBuYW1lXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDEgJiYgdHlwZTAgPT09ICdzdHJpbmcnKXtcbiAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCk7XG4gICAgaWYoZXJyb3JNc2cgPT09ICcnKXtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsIG9jdGF2ZSk7XG4gICAgfVxuXG4gIC8vIGFyZ3VtZW50czogbm90ZSBuYW1lLCBvY3RhdmVcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMiAmJiB0eXBlMCA9PT0gJ3N0cmluZycgJiYgdHlwZTEgPT09ICdudW1iZXInKXtcbiAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCwgYXJnMSk7XG4gICAgaWYoZXJyb3JNc2cgPT09ICcnKXtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsIG9jdGF2ZSk7XG4gICAgfVxuXG4gIC8vIGFyZ3VtZW50czogZnVsbCBub3RlIG5hbWUsIG5vdGUgbmFtZSBtb2RlIC0+IGZvciBjb252ZXJ0aW5nIGJldHdlZW4gbm90ZSBuYW1lIG1vZGVzXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnc3RyaW5nJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzApO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZU1vZGUgPSBfY2hlY2tOb3RlTmFtZU1vZGUoYXJnMSk7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuXG4gIC8vIGFyZ3VtZW50czogbm90ZSBudW1iZXIsIG5vdGUgbmFtZSBtb2RlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIgJiYgdHlwZVN0cmluZyhhcmcwKSA9PT0gJ251bWJlcicgJiYgdHlwZVN0cmluZyhhcmcxKSA9PT0gJ3N0cmluZycpe1xuICAgIGlmKGFyZzAgPCAwIHx8IGFyZzAgPiAxMjcpe1xuICAgICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYSBub3RlIG51bWJlciA+PSAwIGFuZCA8PSAxMjcgJyArIGFyZzA7XG4gICAgfWVsc2V7XG4gICAgICBub3RlTmFtZU1vZGUgPSBfY2hlY2tOb3RlTmFtZU1vZGUoYXJnMSk7XG4gICAgICBub3RlTnVtYmVyID0gYXJnMDtcbiAgICAgIGRhdGEgPSBfZ2V0Tm90ZU5hbWUobm90ZU51bWJlciwgbm90ZU5hbWVNb2RlKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgfVxuXG5cbiAgLy8gYXJndW1lbnRzOiBub3RlIG5hbWUsIG9jdGF2ZSwgbm90ZSBuYW1lIG1vZGVcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMyAmJiB0eXBlMCA9PT0gJ3N0cmluZycgJiYgdHlwZTEgPT09ICdudW1iZXInICYmIHR5cGUyID09PSAnc3RyaW5nJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzAsIGFyZzEpO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZU1vZGUgPSBfY2hlY2tOb3RlTmFtZU1vZGUoYXJnMik7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLG9jdGF2ZSk7XG4gICAgfVxuXG4gIH1lbHNle1xuICAgIGVycm9yTXNnID0gJ3dyb25nIGFyZ3VtZW50cywgcGxlYXNlIGNvbnN1bHQgZG9jdW1lbnRhdGlvbic7XG4gIH1cblxuICBpZihlcnJvck1zZyl7XG4gICAgY29uc29sZS5lcnJvcihlcnJvck1zZyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYod2FybmluZ01zZyl7XG4gICAgY29uc29sZS53YXJuKHdhcm5pbmdNc2cpO1xuICB9XG5cbiAgbGV0IG5vdGUgPSB7XG4gICAgbmFtZTogbm90ZU5hbWUsXG4gICAgb2N0YXZlOiBvY3RhdmUsXG4gICAgZnVsbE5hbWU6IG5vdGVOYW1lICsgb2N0YXZlLFxuICAgIG51bWJlcjogbm90ZU51bWJlcixcbiAgICBmcmVxdWVuY3k6IF9nZXRGcmVxdWVuY3kobm90ZU51bWJlciksXG4gICAgYmxhY2tLZXk6IF9pc0JsYWNrS2V5KG5vdGVOdW1iZXIpXG4gIH1cbiAgT2JqZWN0LmZyZWV6ZShub3RlKTtcbiAgcmV0dXJuIG5vdGU7XG59XG5cblxuLy9mdW5jdGlvbiBfZ2V0Tm90ZU5hbWUobnVtYmVyLCBtb2RlID0gY29uZmlnLmdldCgnbm90ZU5hbWVNb2RlJykpIHtcbmZ1bmN0aW9uIF9nZXROb3RlTmFtZShudW1iZXIsIG1vZGUgPSAnc2hhcnAnKSB7XG4gIC8vbGV0IG9jdGF2ZSA9IE1hdGguZmxvb3IoKG51bWJlciAvIDEyKSAtIDIpLCAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgbGV0IG9jdGF2ZSA9IGZsb29yKChudW1iZXIgLyAxMikgLSAxKTtcbiAgbGV0IG5vdGVOYW1lID0gbm90ZU5hbWVzW21vZGVdW251bWJlciAlIDEyXTtcbiAgcmV0dXJuIFtub3RlTmFtZSwgb2N0YXZlXTtcbn1cblxuXG5mdW5jdGlvbiBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpIHtcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgaW5kZXg7XG5cbiAgZm9yKGxldCBrZXkgb2Yga2V5cyl7XG4gICAgbGV0IG1vZGUgPSBub3RlTmFtZXNba2V5XTtcbiAgICBpbmRleCA9IG1vZGUuZmluZEluZGV4KHggPT4geCA9PT0gbmFtZSk7XG4gICAgaWYoaW5kZXggIT09IC0xKXtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKSArIDEyOyAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgbGV0IG51bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMik7Ly8g4oaSIG1pZGkgc3RhbmRhcmQgKyBzY2llbnRpZmljIG5hbWluZywgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01pZGRsZV9DIGFuZCBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NjaWVudGlmaWNfcGl0Y2hfbm90YXRpb25cblxuICBpZihudW1iZXIgPCAwIHx8IG51bWJlciA+IDEyNyl7XG4gICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYSBub3RlIGJldHdlZW4gQzAgYW5kIEcxMCc7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJldHVybiBudW1iZXI7XG59XG5cblxuZnVuY3Rpb24gX2dldEZyZXF1ZW5jeShudW1iZXIpe1xuICAvL3JldHVybiBjb25maWcuZ2V0KCdwaXRjaCcpICogcG93KDIsKG51bWJlciAtIDY5KS8xMik7IC8vIG1pZGkgc3RhbmRhcmQsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NSURJX1R1bmluZ19TdGFuZGFyZFxuICByZXR1cm4gNDQwICogcG93KDIsKG51bWJlciAtIDY5KS8xMik7IC8vIG1pZGkgc3RhbmRhcmQsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NSURJX1R1bmluZ19TdGFuZGFyZFxufVxuXG5cbi8vIFRPRE86IGNhbGN1bGF0ZSBub3RlIGZyb20gZnJlcXVlbmN5XG5mdW5jdGlvbiBfZ2V0UGl0Y2goaGVydHope1xuICAvL2ZtICA9ICAyKG3iiJI2OSkvMTIoNDQwIEh6KS5cbn1cblxuXG5mdW5jdGlvbiBfY2hlY2tOb3RlTmFtZU1vZGUobW9kZSl7XG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgbGV0IHJlc3VsdCA9IGtleXMuZmluZCh4ID0+IHggPT09IG1vZGUpICE9PSB1bmRlZmluZWQ7XG4gIGlmKHJlc3VsdCA9PT0gZmFsc2Upe1xuICAgIC8vbW9kZSA9IGNvbmZpZy5nZXQoJ25vdGVOYW1lTW9kZScpO1xuICAgIG1vZGUgPSAnc2hhcnAnO1xuICAgIHdhcm5pbmdNc2cgPSBtb2RlICsgJyBpcyBub3QgYSB2YWxpZCBub3RlIG5hbWUgbW9kZSwgdXNpbmcgXCInICsgbW9kZSArICdcIiBpbnN0ZWFkJztcbiAgfVxuICByZXR1cm4gbW9kZTtcbn1cblxuXG5mdW5jdGlvbiBfY2hlY2tOb3RlTmFtZSguLi5hcmdzKXtcbiAgbGV0XG4gICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoLFxuICAgIGFyZzAgPSBhcmdzWzBdLFxuICAgIGFyZzEgPSBhcmdzWzFdLFxuICAgIGNoYXIsXG4gICAgbmFtZSA9ICcnLFxuICAgIG9jdGF2ZSA9ICcnO1xuXG4gIC8vIGV4dHJhY3Qgb2N0YXZlIGZyb20gbm90ZSBuYW1lXG4gIGlmKG51bUFyZ3MgPT09IDEpe1xuICAgIGZvcihjaGFyIG9mIGFyZzApe1xuICAgICAgaWYoaXNOYU4oY2hhcikgJiYgY2hhciAhPT0gJy0nKXtcbiAgICAgICAgbmFtZSArPSBjaGFyO1xuICAgICAgfWVsc2V7XG4gICAgICAgIG9jdGF2ZSArPSBjaGFyO1xuICAgICAgfVxuICAgIH1cbiAgICBpZihvY3RhdmUgPT09ICcnKXtcbiAgICAgIG9jdGF2ZSA9IDA7XG4gICAgfVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyKXtcbiAgICBuYW1lID0gYXJnMDtcbiAgICBvY3RhdmUgPSBhcmcxO1xuICB9XG5cbiAgLy8gY2hlY2sgaWYgbm90ZSBuYW1lIGlzIHZhbGlkXG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgbGV0IGluZGV4ID0gLTE7XG5cbiAgZm9yKGxldCBrZXkgb2Yga2V5cyl7XG4gICAgbGV0IG1vZGUgPSBub3RlTmFtZXNba2V5XTtcbiAgICBpbmRleCA9IG1vZGUuZmluZEluZGV4KHggPT4geCA9PT0gbmFtZSk7XG4gICAgaWYoaW5kZXggIT09IC0xKXtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmKGluZGV4ID09PSAtMSl7XG4gICAgZXJyb3JNc2cgPSBhcmcwICsgJyBpcyBub3QgYSB2YWxpZCBub3RlIG5hbWUsIHBsZWFzZSB1c2UgbGV0dGVycyBBIC0gRyBhbmQgaWYgbmVjZXNzYXJ5IGFuIGFjY2lkZW50YWwgbGlrZSAjLCAjIywgYiBvciBiYiwgZm9sbG93ZWQgYnkgYSBudW1iZXIgZm9yIHRoZSBvY3RhdmUnO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKG9jdGF2ZSA8IC0xIHx8IG9jdGF2ZSA+IDkpe1xuICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGFuIG9jdGF2ZSBiZXR3ZWVuIC0xIGFuZCA5JztcbiAgICByZXR1cm47XG4gIH1cblxuICBvY3RhdmUgPSBwYXJzZUludChvY3RhdmUsIDEwKTtcbiAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDAsIDEpLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnN1YnN0cmluZygxKTtcblxuICAvL2NvbnNvbGUubG9nKG5hbWUsJ3wnLG9jdGF2ZSk7XG4gIHJldHVybiBbbmFtZSwgb2N0YXZlXTtcbn1cblxuXG5cbmZ1bmN0aW9uIF9pc0JsYWNrS2V5KG5vdGVOdW1iZXIpe1xuICBsZXQgYmxhY2s7XG5cbiAgc3dpdGNoKHRydWUpe1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxOi8vQyNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMzovL0QjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDY6Ly9GI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSA4Oi8vRyNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTA6Ly9BI1xuICAgICAgYmxhY2sgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJsYWNrID0gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gYmxhY2s7XG59XG5cblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlTnVtYmVyKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLm51bWJlcjtcbiAgfVxuICByZXR1cm4gZXJyb3JNc2c7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLm5hbWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlT2N0YXZlKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLm9jdGF2ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZ1bGxOb3RlTmFtZSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5mdWxsTmFtZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZyZXF1ZW5jeSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5mcmVxdWVuY3k7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0JsYWNrS2V5KC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmJsYWNrS2V5O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsImltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge3R5cGVTdHJpbmcsIGNoZWNrSWZCYXNlNjQsIGJhc2U2NFRvQmluYXJ5fSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcblxuXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU2FtcGxlKHNhbXBsZSwgaWQsIGV2ZXJ5KXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIHRyeXtcbiAgICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSxcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MoYnVmZmVyKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBidWZmZXIpO1xuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWQsIGJ1ZmZlcn0pXG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KHtpZCwgYnVmZmVyfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoYnVmZmVyKTtcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25FcnJvcihlKXtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhICR7ZX0gW0lEOiAke2lkfV1gKTtcbiAgICAgICAgICAvL3JlamVjdChlKTsgLy8gZG9uJ3QgdXNlIHJlamVjdCBiZWNhdXNlIHdlIHVzZSB0aGlzIGFzIGEgbmVzdGVkIHByb21pc2UgYW5kIHdlIGRvbid0IHdhbnQgdGhlIHBhcmVudCBwcm9taXNlIHRvIHJlamVjdFxuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgfWNhdGNoKGUpe1xuICAgICAgY29uc29sZS53YXJuKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSlcbiAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZXNvbHZlKHtpZH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5cbmZ1bmN0aW9uIGxvYWRBbmRQYXJzZVNhbXBsZSh1cmwsIGlkLCBldmVyeSl7XG4gIC8vY29uc29sZS5sb2coaWQsIHVybClcbiAgLypcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAnbG9hZGluZycsXG4gICAgICBkYXRhOiB1cmxcbiAgICB9KVxuICB9LCAwKVxuICAqL1xuICBkaXNwYXRjaEV2ZW50KHtcbiAgICB0eXBlOiAnbG9hZGluZycsXG4gICAgZGF0YTogdXJsXG4gIH0pXG5cbiAgbGV0IGV4ZWN1dG9yID0gZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgZmV0Y2godXJsLCB7XG4gICAgICBtZXRob2Q6ICdHRVQnXG4gICAgfSkudGhlbihcbiAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgaWYocmVzcG9uc2Uub2spe1xuICAgICAgICAgIHJlc3BvbnNlLmFycmF5QnVmZmVyKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coaWQsIGRhdGEpXG4gICAgICAgICAgICBkZWNvZGVTYW1wbGUoZGF0YSwgaWQsIGV2ZXJ5KS50aGVuKHJlc29sdmUpXG4gICAgICAgICAgfSlcbiAgICAgICAgfWVsc2UgaWYodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIClcbiAgfVxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpXG59XG5cblxuZnVuY3Rpb24gZ2V0UHJvbWlzZXMocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSl7XG5cbiAgY29uc3QgZ2V0U2FtcGxlID0gZnVuY3Rpb24oKXtcbiAgICBpZihrZXkgIT09ICdyZWxlYXNlJyAmJiBrZXkgIT09ICdpbmZvJyAmJiBrZXkgIT09ICdzdXN0YWluJyl7XG4gICAgICAvL2NvbnNvbGUubG9nKGtleSlcbiAgICAgIGlmKHNhbXBsZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXtcbiAgICAgICAgcHJvbWlzZXMucHVzaChkZWNvZGVTYW1wbGUoc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KSlcbiAgICAgIH1lbHNlIGlmKHR5cGVvZiBzYW1wbGUgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaWYoY2hlY2tJZkJhc2U2NChzYW1wbGUpKXtcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGRlY29kZVNhbXBsZShiYXNlNjRUb0JpbmFyeShzYW1wbGUpLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhiYXNlVXJsICsgc2FtcGxlKVxuICAgICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKGJhc2VVcmwgKyBlc2NhcGUoc2FtcGxlKSwga2V5LCBldmVyeSkpXG4gICAgICAgIH1cbiAgICAgIH1lbHNlIGlmKHR5cGVvZiBzYW1wbGUgPT09ICdvYmplY3QnKXtcbiAgICAgICAgc2FtcGxlID0gc2FtcGxlLnNhbXBsZSB8fCBzYW1wbGUuYnVmZmVyIHx8IHNhbXBsZS5iYXNlNjQgfHwgc2FtcGxlLnVybFxuICAgICAgICBnZXRTYW1wbGUocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhrZXksIHNhbXBsZSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGUsIHByb21pc2VzLmxlbmd0aClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRTYW1wbGUoKVxufVxuXG5cbi8vIG9ubHkgZm9yIGludGVybmFsbHkgdXNlIGluIHFhbWJpXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGVzMihtYXBwaW5nLCBldmVyeSA9IGZhbHNlKXtcbiAgbGV0IHR5cGUgPSB0eXBlU3RyaW5nKG1hcHBpbmcpLFxuICAgIHByb21pc2VzID0gW10sXG4gICAgYmFzZVVybCA9ICcnXG5cbiAgaWYodHlwZW9mIG1hcHBpbmcuYmFzZVVybCA9PT0gJ3N0cmluZycpe1xuICAgIGJhc2VVcmwgPSBtYXBwaW5nLmJhc2VVcmxcbiAgICBkZWxldGUgbWFwcGluZy5iYXNlVXJsXG4gIH1cblxuICAvL2NvbnNvbGUubG9nKG1hcHBpbmcsIGJhc2VVcmwpXG5cbiAgZXZlcnkgPSB0eXBlb2YgZXZlcnkgPT09ICdmdW5jdGlvbicgPyBldmVyeSA6IGZhbHNlXG4gIC8vY29uc29sZS5sb2codHlwZSwgbWFwcGluZylcbiAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgIE9iamVjdC5rZXlzKG1hcHBpbmcpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgIC8vIGlmKGlzTmFOKGtleSkgPT09IGZhbHNlKXtcbiAgICAgIC8vICAga2V5ID0gcGFyc2VJbnQoa2V5LCAxMClcbiAgICAgIC8vIH1cbiAgICAgIGxldCBhID0gbWFwcGluZ1trZXldXG4gICAgICAvL2NvbnNvbGUubG9nKGtleSwgYSwgdHlwZVN0cmluZyhhKSlcbiAgICAgIGlmKHR5cGVTdHJpbmcoYSkgPT09ICdhcnJheScpe1xuICAgICAgICBhLmZvckVhY2gobWFwID0+IHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKG1hcClcbiAgICAgICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgbWFwLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGdldFByb21pc2VzKHByb21pc2VzLCBhLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KVxuICAgICAgfVxuICAgIH0pXG4gIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgIGxldCBrZXlcbiAgICBtYXBwaW5nLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlKXtcbiAgICAgIC8vIGtleSBpcyBkZWxpYmVyYXRlbHkgdW5kZWZpbmVkXG4gICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgLnRoZW4oKHZhbHVlcykgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZyh0eXBlLCB2YWx1ZXMpXG4gICAgICBpZih0eXBlID09PSAnb2JqZWN0Jyl7XG4gICAgICAgIG1hcHBpbmcgPSB7fVxuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgLy8gc3VwcG9ydCBmb3IgbXVsdGkgbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgICAgIGxldCBtYXAgPSBtYXBwaW5nW3ZhbHVlLmlkXVxuICAgICAgICAgIGxldCB0eXBlID0gdHlwZVN0cmluZyhtYXApXG4gICAgICAgICAgaWYodHlwZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgICAgICAgIG1hcC5wdXNoKHZhbHVlLmJ1ZmZlcilcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IFttYXAsIHZhbHVlLmJ1ZmZlcl1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gdmFsdWUuYnVmZmVyXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAvL2NvbnNvbGUubG9nKG1hcHBpbmcpXG4gICAgICAgIHJlc29sdmUobWFwcGluZylcbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICByZXNvbHZlKHZhbHVlcyk7XG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGVzKC4uLmRhdGEpe1xuICBpZihkYXRhLmxlbmd0aCA9PT0gMSAmJiB0eXBlU3RyaW5nKGRhdGFbMF0pICE9PSAnc3RyaW5nJyl7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhWzBdKVxuICAgIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGFbMF0pXG4gIH1cbiAgcmV0dXJuIHBhcnNlU2FtcGxlczIoZGF0YSlcbn1cbiIsImltcG9ydCB7Z2V0TmljZVRpbWV9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge01JRElOb3RlfSBmcm9tICcuL21pZGlfbm90ZSc7XG5cbmxldFxuICBwcHEsXG4gIGJwbSxcbiAgZmFjdG9yLFxuICBub21pbmF0b3IsXG4gIGRlbm9taW5hdG9yLFxuICBwbGF5YmFja1NwZWVkLFxuXG4gIGJhcixcbiAgYmVhdCxcbiAgc2l4dGVlbnRoLFxuICB0aWNrLFxuICB0aWNrcyxcbiAgbWlsbGlzLFxuXG4gIG1pbGxpc1BlclRpY2ssXG4gIHNlY29uZHNQZXJUaWNrLFxuXG4gIHRpY2tzUGVyQmVhdCxcbiAgdGlja3NQZXJCYXIsXG4gIHRpY2tzUGVyU2l4dGVlbnRoLFxuICBudW1TaXh0ZWVudGgsXG5cbiAgZGlmZlRpY2tzXG4gIC8vcHJldmlvdXNFdmVudFxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKXtcbiAgc2Vjb25kc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHE7XG4gIG1pbGxpc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljayAqIDEwMDA7XG4gIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljaywgYnBtLCBwcHEsIHBsYXliYWNrU3BlZWQsIChwcHEgKiBtaWxsaXNQZXJUaWNrKSk7XG4gIC8vY29uc29sZS5sb2cocHBxKTtcbn1cblxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKXtcbiAgZmFjdG9yID0gKDQgLyBkZW5vbWluYXRvcik7XG4gIG51bVNpeHRlZW50aCA9IGZhY3RvciAqIDQ7XG4gIHRpY2tzUGVyQmVhdCA9IHBwcSAqIGZhY3RvcjtcbiAgdGlja3NQZXJCYXIgPSB0aWNrc1BlckJlYXQgKiBub21pbmF0b3I7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gcHBxIC8gNDtcbiAgLy9jb25zb2xlLmxvZyhkZW5vbWluYXRvciwgZmFjdG9yLCBudW1TaXh0ZWVudGgsIHRpY2tzUGVyQmVhdCwgdGlja3NQZXJCYXIsIHRpY2tzUGVyU2l4dGVlbnRoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCwgZmFzdCA9IGZhbHNlKXtcbiAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgLy8gaWYoZGlmZlRpY2tzIDwgMCl7XG4gIC8vICAgY29uc29sZS5sb2coZGlmZlRpY2tzLCBldmVudC50aWNrcywgcHJldmlvdXNFdmVudC50aWNrcywgcHJldmlvdXNFdmVudC50eXBlKVxuICAvLyB9XG4gIHRpY2sgKz0gZGlmZlRpY2tzO1xuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICAvL3ByZXZpb3VzRXZlbnQgPSBldmVudFxuICAvL2NvbnNvbGUubG9nKGRpZmZUaWNrcywgbWlsbGlzUGVyVGljayk7XG4gIG1pbGxpcyArPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuXG4gIGlmKGZhc3QgPT09IGZhbHNlKXtcbiAgICB3aGlsZSh0aWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCsrO1xuICAgICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICAgIHdoaWxlKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICAgIGJlYXQrKztcbiAgICAgICAgd2hpbGUoYmVhdCA+IG5vbWluYXRvcil7XG4gICAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgICAgYmFyKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUaW1lRXZlbnRzKHNldHRpbmdzLCB0aW1lRXZlbnRzLCBpc1BsYXlpbmcgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlIHRpbWUgZXZlbnRzJylcbiAgbGV0IHR5cGU7XG4gIGxldCBldmVudDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuICBsZXQgZSA9IDA7XG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGUrKywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG4gICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcblxuICAgIHN3aXRjaCh0eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgc2V0VGlja0R1cmF0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBzZXRUaWNrc1BlckJlYXQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICB1cGRhdGVFdmVudChldmVudCwgaXNQbGF5aW5nKTtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJhcnNBc1N0cmluZyk7XG4gIH1cblxuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG4gIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAvL2NvbnNvbGUubG9nKHRpbWVFdmVudHMpO1xufVxuXG5cbi8vZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKHNvbmcsIGV2ZW50cyl7XG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoZXZlbnRzLCBpc1BsYXlpbmcgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlRXZlbnRzJylcbiAgbGV0IGV2ZW50O1xuICBsZXQgc3RhcnRFdmVudCA9IDA7XG4gIGxldCBsYXN0RXZlbnRUaWNrID0gMDtcbiAgbGV0IHJlc3VsdCA9IFtdXG5cbiAgdGljayA9IDBcbiAgdGlja3MgPSAwXG4gIGRpZmZUaWNrcyA9IDBcblxuICAvL2xldCBldmVudHMgPSBbXS5jb25jYXQoZXZ0cywgc29uZy5fdGltZUV2ZW50cyk7XG4gIGxldCBudW1FdmVudHMgPSBldmVudHMubGVuZ3RoXG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuXG4gIC8vIG5vdGVvZmYgY29tZXMgYmVmb3JlIG5vdGVvblxuXG4vKlxuICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gYS5zb3J0SW5kZXggLSBiLnNvcnRJbmRleDtcbiAgfSlcbiovXG5cbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICAvLyBpZihhLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAtMVxuICAgICAgLy8gfWVsc2UgaWYoYi50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gMVxuICAgICAgLy8gfVxuICAgICAgLy8gc2hvcnQ6XG4gICAgICBsZXQgciA9IGEudHlwZSAtIGIudHlwZTtcbiAgICAgIGlmKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgciA9IC0xXG4gICAgICB9XG4gICAgICByZXR1cm4gclxuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3NcbiAgfSlcbiAgZXZlbnQgPSBldmVudHNbMF1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcblxuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcblxuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuXG4gIGZvcihsZXQgaSA9IHN0YXJ0RXZlbnQ7IGkgPCBudW1FdmVudHM7IGkrKyl7XG5cbiAgICBldmVudCA9IGV2ZW50c1tpXTtcblxuICAgIHN3aXRjaChldmVudC50eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuICAgICAgICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgICAgICAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzXG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLGV2ZW50Lm1pbGxpc1BlclRpY2spO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICAgICAgICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzXG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub21pbmF0b3IsbnVtU2l4dGVlbnRoLHRpY2tzUGVyU2l4dGVlbnRoKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG5cblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgIC8vY2FzZSAxMjg6XG4gICAgICAvL2Nhc2UgMTQ0OlxuICAgICAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcbiAgICAgICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJhcilcblxuICAgICAgICAvLyBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhldmVudC5kYXRhMiwgZXZlbnQuYmFyc0FzU3RyaW5nKVxuICAgICAgICAvLyB9XG5cbiAgICB9XG5cblxuICAgIC8vIGlmKGkgPCAxMDAgJiYgKGV2ZW50LnR5cGUgPT09IDgxIHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpKXtcbiAgICAvLyAgIC8vY29uc29sZS5sb2coaSwgdGlja3MsIGRpZmZUaWNrcywgbWlsbGlzLCBtaWxsaXNQZXJUaWNrKVxuICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQubWlsbGlzLCAnbm90ZScsIGV2ZW50LmRhdGExLCAndmVsbycsIGV2ZW50LmRhdGEyKVxuICAgIC8vIH1cblxuICAgIGxhc3RFdmVudFRpY2sgPSBldmVudC50aWNrcztcbiAgfVxuICBwYXJzZU1JRElOb3RlcyhyZXN1bHQpXG4gIHJldHVybiByZXN1bHRcbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGV2ZW50LCBmYXN0ID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKGJhciwgYmVhdCwgdGlja3MpXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuXG4gIGV2ZW50LnRpY2tzID0gdGlja3M7XG5cbiAgZXZlbnQubWlsbGlzID0gbWlsbGlzO1xuICBldmVudC5zZWNvbmRzID0gbWlsbGlzIC8gMTAwMDtcblxuICBpZihmYXN0KXtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGV2ZW50LmJhciA9IGJhcjtcbiAgZXZlbnQuYmVhdCA9IGJlYXQ7XG4gIGV2ZW50LnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgZXZlbnQudGljayA9IHRpY2s7XG4gIC8vZXZlbnQuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2s7XG4gIHZhciB0aWNrQXNTdHJpbmcgPSB0aWNrID09PSAwID8gJzAwMCcgOiB0aWNrIDwgMTAgPyAnMDAnICsgdGljayA6IHRpY2sgPCAxMDAgPyAnMCcgKyB0aWNrIDogdGljaztcbiAgZXZlbnQuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIHRpY2tBc1N0cmluZztcbiAgZXZlbnQuYmFyc0FzQXJyYXkgPSBbYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tdO1xuXG5cbiAgdmFyIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcblxuICBldmVudC5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgZXZlbnQubWludXRlID0gdGltZURhdGEubWludXRlO1xuICBldmVudC5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gIGV2ZW50Lm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gIGV2ZW50LnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgZXZlbnQudGltZUFzQXJyYXkgPSB0aW1lRGF0YS50aW1lQXNBcnJheTtcblxuICAvLyBpZihtaWxsaXMgPCAwKXtcbiAgLy8gICBjb25zb2xlLmxvZyhldmVudClcbiAgLy8gfVxuXG5cbn1cblxuXG5sZXQgbWlkaU5vdGVJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESU5vdGVzKGV2ZW50cyl7XG4gIGxldCBub3RlcyA9IHt9XG4gIGxldCBub3Rlc0luVHJhY2tcbiAgbGV0IG4gPSAwXG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgaWYodHlwZW9mIGV2ZW50Ll9wYXJ0ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZXZlbnQuX3RyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBjb25zb2xlLmxvZygnbm8gcGFydCBhbmQvb3IgdHJhY2sgc2V0JywgZXZlbnQpXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdID0ge31cbiAgICAgIH1cbiAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudFxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdXG4gICAgICBpZih0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIGNvcnJlc3BvbmRpbmcgbm90ZW9uIGV2ZW50IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbGV0IG5vdGVPbiA9IG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV1cbiAgICAgIGxldCBub3RlT2ZmID0gZXZlbnRcbiAgICAgIGlmKHR5cGVvZiBub3RlT24gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy9jb25zb2xlLmluZm8obisrLCAnbm8gbm90ZW9uIGV2ZW50IGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlID0gbmV3IE1JRElOb3RlKG5vdGVPbiwgbm90ZU9mZilcbiAgICAgIG5vdGUuX3RyYWNrID0gbm90ZU9uLl90cmFja1xuICAgICAgbm90ZSA9IG51bGxcbiAgICAgIC8vIGxldCBpZCA9IGBNTl8ke21pZGlOb3RlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgICAvLyBub3RlT24ubWlkaU5vdGVJZCA9IGlkXG4gICAgICAvLyBub3RlT24ub2ZmID0gbm90ZU9mZi5pZFxuICAgICAgLy8gbm90ZU9mZi5taWRpTm90ZUlkID0gaWRcbiAgICAgIC8vIG5vdGVPZmYub24gPSBub3RlT24uaWRcbiAgICAgIGRlbGV0ZSBub3Rlc1tldmVudC5fdHJhY2suaWRdW2V2ZW50LmRhdGExXVxuICAgIH1cbiAgfVxuICBPYmplY3Qua2V5cyhub3RlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGRlbGV0ZSBub3Rlc1trZXldXG4gIH0pXG4gIG5vdGVzID0ge31cbiAgLy9jb25zb2xlLmxvZyhub3Rlcywgbm90ZXNJblRyYWNrKVxufVxuXG5cbi8vIG5vdCBpbiB1c2UhXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyRXZlbnRzKGV2ZW50cyl7XG4gIGxldCBzdXN0YWluID0ge31cbiAgbGV0IHRtcFJlc3VsdCA9IHt9XG4gIGxldCByZXN1bHQgPSBbXVxuICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTc2ICYmIGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICBpZihldmVudC5kYXRhMiA9PT0gMCl7XG4gICAgICAgIGlmKHR5cGVvZiBzdXN0YWluW2V2ZW50LnRyYWNrSWRdID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfWVsc2UgaWYoc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gZXZlbnQudGlja3Mpe1xuICAgICAgICAgIGRlbGV0ZSB0bXBSZXN1bHRbZXZlbnQudGlja3NdXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICB0bXBSZXN1bHRbZXZlbnQudGlja3NdID0gZXZlbnRcbiAgICAgICAgZGVsZXRlIHN1c3RhaW5bZXZlbnQudHJhY2tJZF1cbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICBzdXN0YWluW2V2ZW50LnRyYWNrSWRdID0gZXZlbnQudGlja3NcbiAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICByZXN1bHQucHVzaChldmVudClcbiAgICB9XG4gIH1cbiAgY29uc29sZS5sb2coc3VzdGFpbilcbiAgT2JqZWN0LmtleXModG1wUmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgbGV0IHN1c3RhaW5FdmVudCA9IHRtcFJlc3VsdFtrZXldXG4gICAgY29uc29sZS5sb2coc3VzdGFpbkV2ZW50KVxuICAgIHJlc3VsdC5wdXNoKHN1c3RhaW5FdmVudClcbiAgfSlcbiAgcmV0dXJuIHJlc3VsdFxufVxuIiwiLy8gQCBmbG93XG5cbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFBhcnR7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gbnVsbCl7XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgdGhpcy5pZFxuICAgIHRoaXMubXV0ZWQgPSBmYWxzZVxuICAgIHRoaXMuX3RyYWNrID0gbnVsbFxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG4gICAgdGhpcy5fZXZlbnRzID0gW11cbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuICAgIHRoaXMuX3N0YXJ0ID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gICAgdGhpcy5fZW5kID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gIH1cblxuICBjb3B5KCl7XG4gICAgbGV0IHAgPSBuZXcgUGFydCh0aGlzLm5hbWUgKyAnX2NvcHknKSAvLyBpbXBsZW1lbnQgZ2V0TmFtZU9mQ29weSgpIGluIHV0aWwgKHNlZSBoZWFydGJlYXQpXG4gICAgbGV0IGV2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgbGV0IGNvcHkgPSBldmVudC5jb3B5KClcbiAgICAgIGNvbnNvbGUubG9nKGNvcHkpXG4gICAgICBldmVudHMucHVzaChjb3B5KVxuICAgIH0pXG4gICAgcC5hZGRFdmVudHMoLi4uZXZlbnRzKVxuICAgIHAudXBkYXRlKClcbiAgICByZXR1cm4gcFxuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnRyYW5zcG9zZShhbW91bnQpXG4gICAgfSlcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmUodGlja3M6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlVG8odGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIGFkZEV2ZW50cyguLi5ldmVudHMpe1xuICAgIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICAgIGxldCB0cmFjayA9IHRoaXMuX3RyYWNrXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5fcGFydCA9IHRoaXNcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudClcbiAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdHJhY2tcbiAgICAgICAgaWYodHJhY2suX3Nvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gdHJhY2suX3NvbmdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuXG4gICAgaWYodHJhY2spe1xuICAgICAgdHJhY2suX2V2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRyYWNrLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICB9XG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9uZXdFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCh0aGlzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIHJlbW92ZUV2ZW50cyguLi5ldmVudHMpe1xuICAgIGxldCB0cmFjayA9IHRoaXMuX3RyYWNrXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5fcGFydCA9IG51bGxcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICAgICAgaWYodHJhY2spe1xuICAgICAgICBldmVudC5fdHJhY2sgPSBudWxsXG4gICAgICAgIHRyYWNrLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICAgICAgaWYodHJhY2suX3Nvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gbnVsbFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBpZih0cmFjayl7XG4gICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgICB0cmFjay5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgICB9XG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcylcbiAgICB9XG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHModGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKHRoaXMpXG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlRXZlbnRzVG8odGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcylcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKGZpbHRlcjogc3RyaW5nW10gPSBudWxsKXsgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c10gLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgfVxuXG4gIG11dGUoZmxhZzogYm9vbGVhbiA9IG51bGwpe1xuICAgIGlmKGZsYWcpe1xuICAgICAgdGhpcy5tdXRlZCA9IGZsYWdcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMubXV0ZWQgPSAhdGhpcy5tdXRlZFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYodGhpcy5fY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB9XG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIC8vQFRPRE86IGNhbGN1bGF0ZSBwYXJ0IHN0YXJ0IGFuZCBlbmQsIGFuZCBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZVxuICB9XG59XG4iLCJpbXBvcnQge2dldFBvc2l0aW9uMn0gZnJvbSAnLi9wb3NpdGlvbi5qcydcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyLmpzJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwuanMnXG5cbmNvbnN0IHJhbmdlID0gMTAgLy8gbWlsbGlzZWNvbmRzIG9yIHRpY2tzXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFBsYXloZWFke1xuXG4gIGNvbnN0cnVjdG9yKHNvbmcsIHR5cGUgPSAnYWxsJyl7XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMuc29uZyA9IHNvbmdcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5sYXN0RXZlbnQgPSBudWxsXG4gICAgdGhpcy5kYXRhID0ge31cblxuICAgIHRoaXMuYWN0aXZlUGFydHMgPSBbXVxuICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbXVxuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW11cbiAgfVxuXG4gIC8vIHVuaXQgY2FuIGJlICdtaWxsaXMnIG9yICd0aWNrcydcbiAgc2V0KHVuaXQsIHZhbHVlKXtcbiAgICB0aGlzLnVuaXQgPSB1bml0XG4gICAgdGhpcy5jdXJyZW50VmFsdWUgPSB2YWx1ZVxuICAgIHRoaXMuZXZlbnRJbmRleCA9IDBcbiAgICB0aGlzLm5vdGVJbmRleCA9IDBcbiAgICB0aGlzLnBhcnRJbmRleCA9IDBcbiAgICB0aGlzLmNhbGN1bGF0ZSgpXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICBnZXQoKXtcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuXG4gIHVwZGF0ZSh1bml0LCBkaWZmKXtcbiAgICBpZihkaWZmID09PSAwKXtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFcbiAgICB9XG4gICAgdGhpcy51bml0ID0gdW5pdFxuICAgIHRoaXMuY3VycmVudFZhbHVlICs9IGRpZmZcbiAgICB0aGlzLmNhbGN1bGF0ZSgpXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICB1cGRhdGVTb25nKCl7XG4gICAgdGhpcy5ldmVudHMgPSBbLi4udGhpcy5zb25nLl9ldmVudHMsIC4uLnRoaXMuc29uZy5fdGltZUV2ZW50c11cbiAgICBzb3J0RXZlbnRzKHRoaXMuZXZlbnRzKVxuICAgIC8vY29uc29sZS5sb2coJ2V2ZW50cyAlTycsIHRoaXMuZXZlbnRzKVxuICAgIHRoaXMubm90ZXMgPSB0aGlzLnNvbmcuX25vdGVzXG4gICAgdGhpcy5wYXJ0cyA9IHRoaXMuc29uZy5fcGFydHNcbiAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aFxuICAgIHRoaXMubnVtTm90ZXMgPSB0aGlzLm5vdGVzLmxlbmd0aFxuICAgIHRoaXMubnVtUGFydHMgPSB0aGlzLnBhcnRzLmxlbmd0aFxuICAgIC8vdGhpcy5zZXQoJ21pbGxpcycsIHRoaXMuc29uZy5fbWlsbGlzKVxuICB9XG5cblxuICBjYWxjdWxhdGUoKXtcbiAgICBsZXQgaVxuICAgIGxldCB2YWx1ZVxuICAgIGxldCBldmVudFxuICAgIGxldCBub3RlXG4gICAgbGV0IHBhcnRcbiAgICBsZXQgcG9zaXRpb25cbiAgICBsZXQgc3RpbGxBY3RpdmVOb3RlcyA9IFtdXG4gICAgbGV0IHN0aWxsQWN0aXZlUGFydHMgPSBbXVxuICAgIGxldCBjb2xsZWN0ZWRQYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGxldCBjb2xsZWN0ZWROb3RlcyA9IG5ldyBTZXQoKVxuXG4gICAgdGhpcy5kYXRhID0ge31cbiAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IFtdXG5cbiAgICBmb3IoaSA9IHRoaXMuZXZlbnRJbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspe1xuICAgICAgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXVxuICAgICAgdmFsdWUgPSBldmVudFt0aGlzLnVuaXRdXG4gICAgICBpZih2YWx1ZSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgIC8vIGlmIHRoZSBwbGF5aGVhZCBpcyBzZXQgdG8gYSBwb3NpdGlvbiBvZiBzYXkgMzAwMCBtaWxsaXMsIHdlIGRvbid0IHdhbnQgdG8gYWRkIGV2ZW50cyBtb3JlIHRoYXQgMTAgdW5pdHMgYmVmb3JlIHRoZSBwbGF5aGVhZFxuICAgICAgICBpZih2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA+IHRoaXMuY3VycmVudFZhbHVlIC0gcmFuZ2Upe1xuICAgICAgICAgIHRoaXMuYWN0aXZlRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgICAgLy8gdGhpcyBkb2Vzbid0IHdvcmsgdG9vIHdlbGxcbiAgICAgICAgICBpZihldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTIpXG4gICAgICAgICAgICBpZihldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsMicsXG4gICAgICAgICAgICAgICAgZGF0YTogZXZlbnQuZGF0YTIgPT09IDEyNyA/ICdkb3duJyA6ICd1cCdcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAvLyB9ZWxzZXtcbiAgICAgICAgICAvLyAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgIC8vICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICAgIC8vICAgICBkYXRhOiBldmVudFxuICAgICAgICAgIC8vICAgfSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgICBkYXRhOiBldmVudFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0RXZlbnQgPSBldmVudFxuICAgICAgICB0aGlzLmV2ZW50SW5kZXgrK1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tJylcbiAgICB0aGlzLmRhdGEuYWN0aXZlRXZlbnRzID0gdGhpcy5hY3RpdmVFdmVudHNcblxuICAgIC8vIGlmIGEgc29uZyBoYXMgbm8gZXZlbnRzIHlldCwgdXNlIHRoZSBmaXJzdCB0aW1lIGV2ZW50IGFzIHJlZmVyZW5jZVxuICAgIGlmKHRoaXMubGFzdEV2ZW50ID09PSBudWxsKXtcbiAgICAgIHRoaXMubGFzdEV2ZW50ID0gdGhpcy5zb25nLl90aW1lRXZlbnRzWzBdXG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBnZXRQb3NpdGlvbjIodGhpcy5zb25nLCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlLCAnYWxsJywgdGhpcy5sYXN0RXZlbnQpXG4gICAgdGhpcy5kYXRhLmV2ZW50SW5kZXggPSB0aGlzLmV2ZW50SW5kZXhcbiAgICB0aGlzLmRhdGEubWlsbGlzID0gcG9zaXRpb24ubWlsbGlzXG4gICAgdGhpcy5kYXRhLnRpY2tzID0gcG9zaXRpb24udGlja3NcbiAgICB0aGlzLmRhdGEucG9zaXRpb24gPSBwb3NpdGlvblxuXG4gICAgaWYodGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVxuICAgICAgZm9yKGxldCBrZXkgb2YgT2JqZWN0LmtleXMocG9zaXRpb24pKXtcbiAgICAgICAgZGF0YVtrZXldID0gcG9zaXRpb25ba2V5XVxuICAgICAgfVxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCdiYXJzYmVhdHMnKSAhPT0gLTEpe1xuICAgICAgdGhpcy5kYXRhLmJhciA9IHBvc2l0aW9uLmJhclxuICAgICAgdGhpcy5kYXRhLmJlYXQgPSBwb3NpdGlvbi5iZWF0XG4gICAgICB0aGlzLmRhdGEuc2l4dGVlbnRoID0gcG9zaXRpb24uc2l4dGVlbnRoXG4gICAgICB0aGlzLmRhdGEudGljayA9IHBvc2l0aW9uLnRpY2tcbiAgICAgIHRoaXMuZGF0YS5iYXJzQXNTdHJpbmcgPSBwb3NpdGlvbi5iYXJzQXNTdHJpbmdcblxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmFyID0gcG9zaXRpb24udGlja3NQZXJCYXJcbiAgICAgIHRoaXMuZGF0YS50aWNrc1BlckJlYXQgPSBwb3NpdGlvbi50aWNrc1BlckJlYXRcbiAgICAgIHRoaXMuZGF0YS50aWNrc1BlclNpeHRlZW50aCA9IHBvc2l0aW9uLnRpY2tzUGVyU2l4dGVlbnRoXG4gICAgICB0aGlzLmRhdGEubnVtU2l4dGVlbnRoID0gcG9zaXRpb24ubnVtU2l4dGVlbnRoXG5cbiAgICB9ZWxzZSBpZih0aGlzLnR5cGUuaW5kZXhPZigndGltZScpICE9PSAtMSl7XG4gICAgICB0aGlzLmRhdGEuaG91ciA9IHBvc2l0aW9uLmhvdXJcbiAgICAgIHRoaXMuZGF0YS5taW51dGUgPSBwb3NpdGlvbi5taW51dGVcbiAgICAgIHRoaXMuZGF0YS5zZWNvbmQgPSBwb3NpdGlvbi5zZWNvbmRcbiAgICAgIHRoaXMuZGF0YS5taWxsaXNlY29uZCA9IHBvc2l0aW9uLm1pbGxpc2Vjb25kXG4gICAgICB0aGlzLmRhdGEudGltZUFzU3RyaW5nID0gcG9zaXRpb24udGltZUFzU3RyaW5nXG5cbiAgICB9ZWxzZSBpZih0aGlzLnR5cGUuaW5kZXhPZigncGVyY2VudGFnZScpICE9PSAtMSl7XG4gICAgICB0aGlzLmRhdGEucGVyY2VudGFnZSA9IHBvc2l0aW9uLnBlcmNlbnRhZ2VcbiAgICB9XG5cbiAgICAvLyBnZXQgYWN0aXZlIG5vdGVzXG4gICAgaWYodGhpcy50eXBlLmluZGV4T2YoJ25vdGVzJykgIT09IC0xIHx8IHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpe1xuXG4gICAgICAvLyBnZXQgYWxsIG5vdGVzIGJldHdlZW4gdGhlIG5vdGVJbmRleCBhbmQgdGhlIGN1cnJlbnQgcGxheWhlYWQgcG9zaXRpb25cbiAgICAgIGZvcihpID0gdGhpcy5ub3RlSW5kZXg7IGkgPCB0aGlzLm51bU5vdGVzOyBpKyspe1xuICAgICAgICBub3RlID0gdGhpcy5ub3Rlc1tpXVxuICAgICAgICB2YWx1ZSA9IG5vdGUubm90ZU9uW3RoaXMudW5pdF1cbiAgICAgICAgaWYodmFsdWUgPD0gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHRoaXMubm90ZUluZGV4KytcbiAgICAgICAgICBpZih0eXBlb2Ygbm90ZS5ub3RlT2ZmID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gaWYgdGhlIHBsYXloZWFkIGlzIHNldCB0byBhIHBvc2l0aW9uIG9mIHNheSAzMDAwIG1pbGxpcywgd2UgZG9uJ3Qgd2FudCB0byBhZGQgbm90ZXMgYmVmb3JlIHRoZSBwbGF5aGVhZFxuICAgICAgICAgIGlmKHRoaXMuY3VycmVudFZhbHVlID09PSAwIHx8IG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgICAgY29sbGVjdGVkTm90ZXMuYWRkKG5vdGUpXG4gICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgICAgdHlwZTogJ25vdGVPbicsXG4gICAgICAgICAgICAgIGRhdGE6IG5vdGVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBmaWx0ZXIgbm90ZXMgdGhhdCBhcmUgbm8gbG9uZ2VyIGFjdGl2ZVxuICAgICAgZm9yKGkgPSB0aGlzLmFjdGl2ZU5vdGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcbiAgICAgICAgbm90ZSA9IHRoaXMuYWN0aXZlTm90ZXNbaV07XG4gICAgICAgIC8vaWYobm90ZS5ub3RlT24uc3RhdGUuaW5kZXhPZigncmVtb3ZlZCcpID09PSAwIHx8IHRoaXMuc29uZy5fbm90ZXNCeUlkLmdldChub3RlLmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICBpZih0aGlzLnNvbmcuX25vdGVzQnlJZC5nZXQobm90ZS5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdza2lwcGluZyByZW1vdmVkIG5vdGUnLCBub3RlLmlkKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHR5cGVvZiBub3RlLm5vdGVPZmYgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ25vdGUgd2l0aCBpZCcsIG5vdGUuaWQsICdoYXMgbm8gbm90ZU9mZiBldmVudCcpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZihub3RlLm5vdGVPZmZbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlICYmIGNvbGxlY3RlZE5vdGVzLmhhcyhub3RlKSA9PT0gZmFsc2Upe1xuICAgICAgICBpZihub3RlLm5vdGVPZmZbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICBzdGlsbEFjdGl2ZU5vdGVzLnB1c2gobm90ZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ25vdGVPZmYnLFxuICAgICAgICAgICAgZGF0YTogbm90ZVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHRoZSBzdGlsbCBhY3RpdmUgbm90ZXMgYW5kIHRoZSBuZXdseSBhY3RpdmUgZXZlbnRzIHRvIHRoZSBhY3RpdmUgbm90ZXMgYXJyYXlcbiAgICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbLi4uY29sbGVjdGVkTm90ZXMudmFsdWVzKCksIC4uLnN0aWxsQWN0aXZlTm90ZXNdXG4gICAgICB0aGlzLmRhdGEuYWN0aXZlTm90ZXMgPSB0aGlzLmFjdGl2ZU5vdGVzXG4gICAgfVxuXG5cbiAgICAvLyBnZXQgYWN0aXZlIHBhcnRzXG4gICAgaWYodGhpcy50eXBlLmluZGV4T2YoJ3BhcnRzJykgIT09IC0xIHx8IHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpe1xuXG4gICAgICBmb3IoaSA9IHRoaXMucGFydEluZGV4OyBpIDwgdGhpcy5udW1QYXJ0czsgaSsrKXtcbiAgICAgICAgcGFydCA9IHRoaXMucGFydHNbaV1cbiAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJ0LCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgaWYocGFydC5fc3RhcnRbdGhpcy51bml0XSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgY29sbGVjdGVkUGFydHMuYWRkKHBhcnQpXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAncGFydE9uJyxcbiAgICAgICAgICAgIGRhdGE6IHBhcnRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRoaXMucGFydEluZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIC8vIGZpbHRlciBwYXJ0cyB0aGF0IGFyZSBubyBsb25nZXIgYWN0aXZlXG4gICAgICBmb3IoaSA9IHRoaXMuYWN0aXZlUGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgICBwYXJ0ID0gdGhpcy5hY3RpdmVQYXJ0c1tpXTtcbiAgICAgICAgLy9pZihwYXJ0LnN0YXRlLmluZGV4T2YoJ3JlbW92ZWQnKSA9PT0gMCB8fCB0aGlzLnNvbmcuX3BhcnRzQnlJZC5nZXQocGFydC5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYodGhpcy5zb25nLl9wYXJ0c0J5SWQuZ2V0KHBhcnQuaWQpID09PSBmYWxzZSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc2tpcHBpbmcgcmVtb3ZlZCBwYXJ0JywgcGFydC5pZCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmKHBhcnQuX2VuZFt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkUGFydHMuaGFzKHBhcnQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHBhcnQuX2VuZFt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHN0aWxsQWN0aXZlUGFydHMucHVzaChub3RlKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAncGFydE9mZicsXG4gICAgICAgICAgICBkYXRhOiBwYXJ0XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFjdGl2ZVBhcnRzID0gWy4uLmNvbGxlY3RlZFBhcnRzLnZhbHVlcygpLCAuLi5zdGlsbEFjdGl2ZVBhcnRzXVxuICAgICAgdGhpcy5kYXRhLmFjdGl2ZVBhcnRzID0gdGhpcy5hY3RpdmVQYXJ0c1xuICAgIH1cblxuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YVxuICAgIH0pXG5cbiAgfVxuXG4vKlxuICBzZXRUeXBlKHQpe1xuICAgIHRoaXMudHlwZSA9IHQ7XG4gICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgfVxuXG5cbiAgYWRkVHlwZSh0KXtcbiAgICB0aGlzLnR5cGUgKz0gJyAnICsgdDtcbiAgICB0aGlzLnNldCh0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG5cbiAgcmVtb3ZlVHlwZSh0KXtcbiAgICB2YXIgYXJyID0gdGhpcy50eXBlLnNwbGl0KCcgJyk7XG4gICAgdGhpcy50eXBlID0gJyc7XG4gICAgYXJyLmZvckVhY2goZnVuY3Rpb24odHlwZSl7XG4gICAgICBpZih0eXBlICE9PSB0KXtcbiAgICAgICAgdGhpcy50eXBlICs9IHQgKyAnICc7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy50eXBlLnRyaW0oKTtcbiAgICB0aGlzLnNldCh0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgfVxuKi9cblxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdFxuICBzdXBwb3J0ZWRUeXBlcyA9ICdiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIHBlcmMgcGVyY2VudGFnZScsXG4gIHN1cHBvcnRlZFJldHVyblR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgYWxsJyxcbiAgZmxvb3IgPSBNYXRoLmZsb29yLFxuICByb3VuZCA9IE1hdGgucm91bmQ7XG5cblxubGV0XG4gIC8vbG9jYWxcbiAgYnBtLFxuICBub21pbmF0b3IsXG4gIGRlbm9taW5hdG9yLFxuXG4gIHRpY2tzUGVyQmVhdCxcbiAgdGlja3NQZXJCYXIsXG4gIHRpY2tzUGVyU2l4dGVlbnRoLFxuXG4gIG1pbGxpc1BlclRpY2ssXG4gIHNlY29uZHNQZXJUaWNrLFxuICBudW1TaXh0ZWVudGgsXG5cbiAgdGlja3MsXG4gIG1pbGxpcyxcbiAgZGlmZlRpY2tzLFxuICBkaWZmTWlsbGlzLFxuXG4gIGJhcixcbiAgYmVhdCxcbiAgc2l4dGVlbnRoLFxuICB0aWNrLFxuXG4vLyAgdHlwZSxcbiAgaW5kZXgsXG4gIHJldHVyblR5cGUgPSAnYWxsJyxcbiAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcblxuXG5mdW5jdGlvbiBnZXRUaW1lRXZlbnQoc29uZywgdW5pdCwgdGFyZ2V0KXtcbiAgLy8gZmluZHMgdGhlIHRpbWUgZXZlbnQgdGhhdCBjb21lcyB0aGUgY2xvc2VzdCBiZWZvcmUgdGhlIHRhcmdldCBwb3NpdGlvblxuICBsZXQgdGltZUV2ZW50cyA9IHNvbmcuX3RpbWVFdmVudHNcblxuICBmb3IobGV0IGkgPSB0aW1lRXZlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcbiAgICBsZXQgZXZlbnQgPSB0aW1lRXZlbnRzW2ldO1xuICAgIC8vY29uc29sZS5sb2codW5pdCwgdGFyZ2V0LCBldmVudClcbiAgICBpZihldmVudFt1bml0XSA8PSB0YXJnZXQpe1xuICAgICAgaW5kZXggPSBpXG4gICAgICByZXR1cm4gZXZlbnRcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9UaWNrcyhzb25nLCB0YXJnZXRNaWxsaXMsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldE1pbGxpcylcbiAgLy9yZXR1cm4gcm91bmQodGlja3MpO1xuICByZXR1cm4gdGlja3Ncbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdGlja3NUb01pbGxpcyhzb25nLCB0YXJnZXRUaWNrcywgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21UaWNrcyhzb25nLCB0YXJnZXRUaWNrcylcbiAgcmV0dXJuIG1pbGxpc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBiYXJzVG9NaWxsaXMoc29uZywgcG9zaXRpb24sIGJlb3MpeyAvLyBiZW9zID0gYmV5b25kRW5kT2ZTb25nXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXQnLFxuICAgIHBvc2l0aW9uLFxuICAgIHJlc3VsdDogJ21pbGxpcycsXG4gICAgYmVvcyxcbiAgfSlcbiAgcmV0dXJuIG1pbGxpc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBiYXJzVG9UaWNrcyhzb25nLCBwb3NpdGlvbiwgYmVvcyl7IC8vIGJlb3MgPSBiZXlvbmRFbmRPZlNvbmdcbiAgY2FsY3VsYXRlUG9zaXRpb24oc29uZywge1xuICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgIHBvc2l0aW9uLFxuICAgIHJlc3VsdDogJ3RpY2tzJyxcbiAgICBiZW9zXG4gIH0pXG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tzVG9CYXJzKHNvbmcsIHRhcmdldCwgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21UaWNrcyhzb25nLCB0YXJnZXQpXG4gIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJ1xuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKClcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9CYXJzKHNvbmcsIHRhcmdldCwgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0KVxuICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICByZXR1cm5UeXBlID0gJ2JhcnNhbmRiZWF0cydcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpXG59XG5cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgbWlsbGlzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldE1pbGxpcywgZXZlbnQpe1xuICBsZXQgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2Upe1xuICAgIGlmKHRhcmdldE1pbGxpcyA+IGxhc3RFdmVudC5taWxsaXMpe1xuICAgICAgdGFyZ2V0TWlsbGlzID0gbGFzdEV2ZW50Lm1pbGxpcztcbiAgICB9XG4gIH1cblxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnbWlsbGlzJywgdGFyZ2V0TWlsbGlzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IG1pbGxpcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmKGV2ZW50Lm1pbGxpcyA9PT0gdGFyZ2V0TWlsbGlzKXtcbiAgICBkaWZmTWlsbGlzID0gMDtcbiAgICBkaWZmVGlja3MgPSAwO1xuICB9ZWxzZXtcbiAgICBkaWZmTWlsbGlzID0gdGFyZ2V0TWlsbGlzIC0gZXZlbnQubWlsbGlzO1xuICAgIGRpZmZUaWNrcyA9IGRpZmZNaWxsaXMgLyBtaWxsaXNQZXJUaWNrO1xuICB9XG5cbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG4gIHRpY2tzICs9IGRpZmZUaWNrcztcblxuICByZXR1cm4gdGlja3M7XG59XG5cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgdGlja3MgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21UaWNrcyhzb25nLCB0YXJnZXRUaWNrcywgZXZlbnQpe1xuICBsZXQgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2Upe1xuICAgIGlmKHRhcmdldFRpY2tzID4gbGFzdEV2ZW50LnRpY2tzKXtcbiAgICAgIHRhcmdldFRpY2tzID0gbGFzdEV2ZW50LnRpY2tzO1xuICAgIH1cbiAgfVxuXG4gIGlmKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICd0aWNrcycsIHRhcmdldFRpY2tzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IHRpY2tzLCBjYWxjdWxhdGUgdGhlIGRpZmZcbiAgaWYoZXZlbnQudGlja3MgPT09IHRhcmdldFRpY2tzKXtcbiAgICBkaWZmVGlja3MgPSAwO1xuICAgIGRpZmZNaWxsaXMgPSAwO1xuICB9ZWxzZXtcbiAgICBkaWZmVGlja3MgPSB0YXJnZXRUaWNrcyAtIHRpY2tzO1xuICAgIGRpZmZNaWxsaXMgPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuICB9XG5cbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcblxuICByZXR1cm4gbWlsbGlzO1xufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIGJhcnMgYW5kIGJlYXRzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tQmFycyhzb25nLCB0YXJnZXRCYXIsIHRhcmdldEJlYXQsIHRhcmdldFNpeHRlZW50aCwgdGFyZ2V0VGljaywgZXZlbnQgPSBudWxsKXtcbiAgLy9jb25zb2xlLnRpbWUoJ2Zyb21CYXJzJyk7XG4gIGxldCBpID0gMCxcbiAgICBkaWZmQmFycyxcbiAgICBkaWZmQmVhdHMsXG4gICAgZGlmZlNpeHRlZW50aCxcbiAgICBkaWZmVGljayxcbiAgICBsYXN0RXZlbnQgPSBzb25nLl9sYXN0RXZlbnQ7XG5cbiAgaWYoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSl7XG4gICAgaWYodGFyZ2V0QmFyID4gbGFzdEV2ZW50LmJhcil7XG4gICAgICB0YXJnZXRCYXIgPSBsYXN0RXZlbnQuYmFyO1xuICAgIH1cbiAgfVxuXG4gIGlmKGV2ZW50ID09PSBudWxsKXtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnYmFyJywgdGFyZ2V0QmFyKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvL2NvcnJlY3Qgd3JvbmcgcG9zaXRpb24gZGF0YSwgZm9yIGluc3RhbmNlOiAnMywzLDIsNzg4JyBiZWNvbWVzICczLDQsNCwwNjgnIGluIGEgNC80IG1lYXN1cmUgYXQgUFBRIDQ4MFxuICB3aGlsZSh0YXJnZXRUaWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICB0YXJnZXRTaXh0ZWVudGgrKztcbiAgICB0YXJnZXRUaWNrIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICB9XG5cbiAgd2hpbGUodGFyZ2V0U2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKXtcbiAgICB0YXJnZXRCZWF0Kys7XG4gICAgdGFyZ2V0U2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgfVxuXG4gIHdoaWxlKHRhcmdldEJlYXQgPiBub21pbmF0b3Ipe1xuICAgIHRhcmdldEJhcisrO1xuICAgIHRhcmdldEJlYXQgLT0gbm9taW5hdG9yO1xuICB9XG5cbiAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ2JhcicsIHRhcmdldEJhciwgaW5kZXgpO1xuICBmb3IoaSA9IGluZGV4OyBpID49IDA7IGktLSl7XG4gICAgZXZlbnQgPSBzb25nLl90aW1lRXZlbnRzW2ldO1xuICAgIGlmKGV2ZW50LmJhciA8PSB0YXJnZXRCYXIpe1xuICAgICAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBnZXQgdGhlIGRpZmZlcmVuY2VzXG4gIGRpZmZUaWNrID0gdGFyZ2V0VGljayAtIHRpY2s7XG4gIGRpZmZTaXh0ZWVudGggPSB0YXJnZXRTaXh0ZWVudGggLSBzaXh0ZWVudGg7XG4gIGRpZmZCZWF0cyA9IHRhcmdldEJlYXQgLSBiZWF0O1xuICBkaWZmQmFycyA9IHRhcmdldEJhciAtIGJhcjsgLy9iYXIgaXMgYWx3YXlzIGxlc3MgdGhlbiBvciBlcXVhbCB0byB0YXJnZXRCYXIsIHNvIGRpZmZCYXJzIGlzIGFsd2F5cyA+PSAwXG5cbiAgLy9jb25zb2xlLmxvZygnZGlmZicsZGlmZkJhcnMsZGlmZkJlYXRzLGRpZmZTaXh0ZWVudGgsZGlmZlRpY2spO1xuICAvL2NvbnNvbGUubG9nKCdtaWxsaXMnLG1pbGxpcyx0aWNrc1BlckJhcix0aWNrc1BlckJlYXQsdGlja3NQZXJTaXh0ZWVudGgsbWlsbGlzUGVyVGljayk7XG5cbiAgLy8gY29udmVydCBkaWZmZXJlbmNlcyB0byBtaWxsaXNlY29uZHMgYW5kIHRpY2tzXG4gIGRpZmZNaWxsaXMgPSAoZGlmZkJhcnMgKiB0aWNrc1BlckJhcikgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IChkaWZmQmVhdHMgKiB0aWNrc1BlckJlYXQpICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSAoZGlmZlNpeHRlZW50aCAqIHRpY2tzUGVyU2l4dGVlbnRoKSAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gZGlmZlRpY2sgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgLy9jb25zb2xlLmxvZyhkaWZmQmFycywgdGlja3NQZXJCYXIsIG1pbGxpc1BlclRpY2ssIGRpZmZNaWxsaXMsIGRpZmZUaWNrcyk7XG5cbiAgLy8gc2V0IGFsbCBjdXJyZW50IHBvc2l0aW9uIGRhdGFcbiAgYmFyID0gdGFyZ2V0QmFyO1xuICBiZWF0ID0gdGFyZ2V0QmVhdDtcbiAgc2l4dGVlbnRoID0gdGFyZ2V0U2l4dGVlbnRoO1xuICB0aWNrID0gdGFyZ2V0VGljaztcbiAgLy9jb25zb2xlLmxvZyh0aWNrLCB0YXJnZXRUaWNrKVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICAvL2NvbnNvbGUubG9nKHRhcmdldEJhciwgdGFyZ2V0QmVhdCwgdGFyZ2V0U2l4dGVlbnRoLCB0YXJnZXRUaWNrLCAnIC0+ICcsIG1pbGxpcyk7XG4gIHRpY2tzICs9IGRpZmZUaWNrcztcblxuICAvL2NvbnNvbGUudGltZUVuZCgnZnJvbUJhcnMnKTtcbn1cblxuXG5mdW5jdGlvbiBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKXtcbiAgLy8gc3ByZWFkIHRoZSBkaWZmZXJlbmNlIGluIHRpY2sgb3ZlciBiYXJzLCBiZWF0cyBhbmQgc2l4dGVlbnRoXG4gIGxldCB0bXAgPSByb3VuZChkaWZmVGlja3MpO1xuICB3aGlsZSh0bXAgPj0gdGlja3NQZXJTaXh0ZWVudGgpe1xuICAgIHNpeHRlZW50aCsrO1xuICAgIHRtcCAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgIGJlYXQrKztcbiAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgYmFyKys7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHRpY2sgPSByb3VuZCh0bXApO1xufVxuXG5cbi8vIHN0b3JlIHByb3BlcnRpZXMgb2YgZXZlbnQgaW4gbG9jYWwgc2NvcGVcbmZ1bmN0aW9uIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpe1xuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcbiAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBiYXIgPSBldmVudC5iYXI7XG4gIGJlYXQgPSBldmVudC5iZWF0O1xuICBzaXh0ZWVudGggPSBldmVudC5zaXh0ZWVudGg7XG4gIHRpY2sgPSBldmVudC50aWNrO1xuXG4gIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAvL2NvbnNvbGUubG9nKGJwbSwgZXZlbnQudHlwZSk7XG4gIC8vY29uc29sZS5sb2coJ3RpY2tzJywgdGlja3MsICdtaWxsaXMnLCBtaWxsaXMsICdiYXInLCBiYXIpO1xufVxuXG5cbmZ1bmN0aW9uIGdldFBvc2l0aW9uRGF0YShzb25nKXtcbiAgbGV0IHRpbWVEYXRhLFxuICAgIHBvc2l0aW9uRGF0YSA9IHt9O1xuXG4gIHN3aXRjaChyZXR1cm5UeXBlKXtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5taWxsaXMgPSBtaWxsaXM7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzID0gcm91bmQobWlsbGlzICogMTAwMCkgLyAxMDAwO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1JvdW5kZWQgPSByb3VuZChtaWxsaXMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrcyA9IHRpY2tzO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzID0gcm91bmQodGlja3MpO1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3NVbnJvdW5kZWQgPSB0aWNrcztcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgcG9zaXRpb25EYXRhLmJhciA9IGJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5iZWF0ID0gYmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEudGljayA9IHRpY2s7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGlja0FzU3RyaW5nO1xuICAgICAgcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyBnZXRUaWNrQXNTdHJpbmcodGljayk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuICAgICAgcG9zaXRpb25EYXRhLmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2FsbCc6XG4gICAgICAvLyBtaWxsaXNcbiAgICAgIC8vcG9zaXRpb25EYXRhLm1pbGxpcyA9IG1pbGxpcztcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXMgPSByb3VuZChtaWxsaXMgKiAxMDAwKSAvIDEwMDA7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUm91bmRlZCA9IHJvdW5kKG1pbGxpcyk7XG5cbiAgICAgIC8vIHRpY2tzXG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrcyA9IHRpY2tzO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzID0gcm91bmQodGlja3MpO1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3NVbnJvdW5kZWQgPSB0aWNrcztcblxuICAgICAgLy8gYmFyc2JlYXRzXG4gICAgICBwb3NpdGlvbkRhdGEuYmFyID0gYmFyO1xuICAgICAgcG9zaXRpb25EYXRhLmJlYXQgPSBiZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrID0gdGljaztcbiAgICAgIC8vcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIGdldFRpY2tBc1N0cmluZyh0aWNrKTtcblxuICAgICAgLy8gdGltZVxuICAgICAgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuICAgICAgcG9zaXRpb25EYXRhLmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG5cbiAgICAgIC8vIGV4dHJhIGRhdGFcbiAgICAgIHBvc2l0aW9uRGF0YS5icG0gPSByb3VuZChicG0gKiBzb25nLnBsYXliYWNrU3BlZWQsIDMpO1xuICAgICAgcG9zaXRpb25EYXRhLm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuXG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJTaXh0ZWVudGggPSB0aWNrc1BlclNpeHRlZW50aDtcblxuICAgICAgcG9zaXRpb25EYXRhLm51bVNpeHRlZW50aCA9IG51bVNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuXG4gICAgICAvLyB1c2UgdGlja3MgdG8gbWFrZSB0ZW1wbyBjaGFuZ2VzIHZpc2libGUgYnkgYSBmYXN0ZXIgbW92aW5nIHBsYXloZWFkXG4gICAgICBwb3NpdGlvbkRhdGEucGVyY2VudGFnZSA9IHRpY2tzIC8gc29uZy5fZHVyYXRpb25UaWNrcztcbiAgICAgIC8vcG9zaXRpb25EYXRhLnBlcmNlbnRhZ2UgPSBtaWxsaXMgLyBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsXG4gIH1cblxuICByZXR1cm4gcG9zaXRpb25EYXRhXG59XG5cblxuZnVuY3Rpb24gZ2V0VGlja0FzU3RyaW5nKHQpe1xuICBpZih0ID09PSAwKXtcbiAgICB0ID0gJzAwMCdcbiAgfWVsc2UgaWYodCA8IDEwKXtcbiAgICB0ID0gJzAwJyArIHRcbiAgfWVsc2UgaWYodCA8IDEwMCl7XG4gICAgdCA9ICcwJyArIHRcbiAgfVxuICByZXR1cm4gdFxufVxuXG5cbi8vIHVzZWQgYnkgcGxheWhlYWRcbmV4cG9ydCBmdW5jdGlvbiBnZXRQb3NpdGlvbjIoc29uZywgdW5pdCwgdGFyZ2V0LCB0eXBlLCBldmVudCl7XG4gIGlmKHVuaXQgPT09ICdtaWxsaXMnKXtcbiAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldCwgZXZlbnQpO1xuICB9ZWxzZSBpZih1bml0ID09PSAndGlja3MnKXtcbiAgICBmcm9tVGlja3Moc29uZywgdGFyZ2V0LCBldmVudCk7XG4gIH1cbiAgcmV0dXJuVHlwZSA9IHR5cGVcbiAgaWYocmV0dXJuVHlwZSA9PT0gJ2FsbCcpe1xuICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICB9XG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG59XG5cblxuLy8gaW1wcm92ZWQgdmVyc2lvbiBvZiBnZXRQb3NpdGlvblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHNldHRpbmdzKXtcbiAgbGV0IHtcbiAgICB0eXBlLCAvLyBhbnkgb2YgYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBwZXJjIHBlcmNlbnRhZ2VcbiAgICB0YXJnZXQsIC8vIGlmIHR5cGUgaXMgYmFyc2JlYXRzIG9yIHRpbWUsIHRhcmdldCBtdXN0IGJlIGFuIGFycmF5LCBlbHNlIGlmIG11c3QgYmUgYSBudW1iZXJcbiAgICByZXN1bHQ6IHJlc3VsdCA9ICdhbGwnLCAvLyBhbnkgb2YgYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBhbGxcbiAgICBiZW9zOiBiZW9zID0gdHJ1ZSxcbiAgICBzbmFwOiBzbmFwID0gLTFcbiAgfSA9IHNldHRpbmdzXG5cbiAgaWYoc3VwcG9ydGVkUmV0dXJuVHlwZXMuaW5kZXhPZihyZXN1bHQpID09PSAtMSl7XG4gICAgY29uc29sZS53YXJuKGB1bnN1cHBvcnRlZCByZXR1cm4gdHlwZSwgJ2FsbCcgdXNlZCBpbnN0ZWFkIG9mICcke3Jlc3VsdH0nYClcbiAgICByZXN1bHQgPSAnYWxsJ1xuICB9XG5cbiAgcmV0dXJuVHlwZSA9IHJlc3VsdFxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG5cbiAgaWYoc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSA9PT0gLTEpe1xuICAgIGNvbnNvbGUuZXJyb3IoYHVuc3VwcG9ydGVkIHR5cGUgJHt0eXBlfWApXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuXG4gIHN3aXRjaCh0eXBlKXtcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIGxldCBbdGFyZ2V0YmFyID0gMSwgdGFyZ2V0YmVhdCA9IDEsIHRhcmdldHNpeHRlZW50aCA9IDEsIHRhcmdldHRpY2sgPSAwXSA9IHRhcmdldFxuICAgICAgLy9jb25zb2xlLmxvZyh0YXJnZXRiYXIsIHRhcmdldGJlYXQsIHRhcmdldHNpeHRlZW50aCwgdGFyZ2V0dGljaylcbiAgICAgIGZyb21CYXJzKHNvbmcsIHRhcmdldGJhciwgdGFyZ2V0YmVhdCwgdGFyZ2V0c2l4dGVlbnRoLCB0YXJnZXR0aWNrKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICAvLyBjYWxjdWxhdGUgbWlsbGlzIG91dCBvZiB0aW1lIGFycmF5OiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG4gICAgICBsZXQgW3RhcmdldGhvdXIgPSAwLCB0YXJnZXRtaW51dGUgPSAwLCB0YXJnZXRzZWNvbmQgPSAwLCB0YXJnZXRtaWxsaXNlY29uZCA9IDBdID0gdGFyZ2V0XG4gICAgICBsZXQgbWlsbGlzID0gMFxuICAgICAgbWlsbGlzICs9IHRhcmdldGhvdXIgKiA2MCAqIDYwICogMTAwMCAvL2hvdXJzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0bWludXRlICogNjAgKiAxMDAwIC8vbWludXRlc1xuICAgICAgbWlsbGlzICs9IHRhcmdldHNlY29uZCAqIDEwMDAgLy9zZWNvbmRzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0bWlsbGlzZWNvbmQgLy9taWxsaXNlY29uZHNcblxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0KVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIC8vY29uc29sZS5sb2coc29uZywgdGFyZ2V0KVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldClcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICdwZXJjJzpcbiAgICBjYXNlICdwZXJjZW50YWdlJzpcblxuICAgICAgLy9taWxsaXMgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICAvL2Zyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzKTtcblxuICAgICAgdGlja3MgPSB0YXJnZXQgKiBzb25nLl9kdXJhdGlvblRpY2tzIC8vIHRhcmdldCBtdXN0IGJlIGluIHRpY2tzIVxuICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcywgc29uZy5fZHVyYXRpb25UaWNrcylcbiAgICAgIGlmKHNuYXAgIT09IC0xKXtcbiAgICAgICAgdGlja3MgPSBmbG9vcih0aWNrcyAvIHNuYXApICogc25hcDtcbiAgICAgICAgLy9mcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRpY2tzKTtcbiAgICAgIH1cbiAgICAgIGZyb21UaWNrcyhzb25nLCB0aWNrcylcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICBsZXQgdG1wID0gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG4gICAgICAvL2NvbnNvbGUubG9nKCdkaWZmJywgcG9zaXRpb25bMV0gLSB0bXAucGVyY2VudGFnZSk7XG4gICAgICByZXR1cm4gdG1wXG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuLypcblxuLy9AcGFyYW06ICdtaWxsaXMnLCAxMDAwLCBbdHJ1ZV1cbi8vQHBhcmFtOiAndGlja3MnLCAxMDAwLCBbdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgMSwgWydhbGwnLCB0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCA2MCwgNCwgMywgMTIwLCBbJ2FsbCcsIHRydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDYwLCA0LCAzLCAxMjAsIFt0cnVlLCAnYWxsJ11cblxuZnVuY3Rpb24gY2hlY2tQb3NpdGlvbih0eXBlLCBhcmdzLCByZXR1cm5UeXBlID0gJ2FsbCcpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSB0cnVlO1xuICBjb25zb2xlLmxvZygnLS0tLT4gY2hlY2tQb3NpdGlvbjonLCBhcmdzLCB0eXBlU3RyaW5nKGFyZ3MpKTtcblxuICBpZih0eXBlU3RyaW5nKGFyZ3MpID09PSAnYXJyYXknKXtcbiAgICBsZXRcbiAgICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICAgIHBvc2l0aW9uLFxuICAgICAgaSwgYSwgcG9zaXRpb25MZW5ndGg7XG5cbiAgICB0eXBlID0gYXJnc1swXTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIFtbJ21pbGxpcycsIDMwMDBdXVxuICAgIGlmKHR5cGVTdHJpbmcoYXJnc1swXSkgPT09ICdhcnJheScpe1xuICAgICAgLy9jb25zb2xlLndhcm4oJ3RoaXMgc2hvdWxkblxcJ3QgaGFwcGVuIScpO1xuICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICB0eXBlID0gYXJnc1swXTtcbiAgICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IFt0eXBlXTtcblxuICAgIGNvbnNvbGUubG9nKCdjaGVjayBwb3NpdGlvbicsIGFyZ3MsIG51bUFyZ3MsIHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkpO1xuXG4gICAgLy9jb25zb2xlLmxvZygnYXJnJywgMCwgJy0+JywgdHlwZSk7XG5cbiAgICBpZihzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpICE9PSAtMSl7XG4gICAgICBmb3IoaSA9IDE7IGkgPCBudW1BcmdzOyBpKyspe1xuICAgICAgICBhID0gYXJnc1tpXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnYXJnJywgaSwgJy0+JywgYSk7XG4gICAgICAgIGlmKGEgPT09IHRydWUgfHwgYSA9PT0gZmFsc2Upe1xuICAgICAgICAgIGJleW9uZEVuZE9mU29uZyA9IGE7XG4gICAgICAgIH1lbHNlIGlmKGlzTmFOKGEpKXtcbiAgICAgICAgICBpZihzdXBwb3J0ZWRSZXR1cm5UeXBlcy5pbmRleE9mKGEpICE9PSAtMSl7XG4gICAgICAgICAgICByZXR1cm5UeXBlID0gYTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICBwb3NpdGlvbi5wdXNoKGEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL2NoZWNrIG51bWJlciBvZiBhcmd1bWVudHMgLT4gZWl0aGVyIDEgbnVtYmVyIG9yIDQgbnVtYmVycyBpbiBwb3NpdGlvbiwgZS5nLiBbJ2JhcnNiZWF0cycsIDFdIG9yIFsnYmFyc2JlYXRzJywgMSwgMSwgMSwgMF0sXG4gICAgICAvLyBvciBbJ3BlcmMnLCAwLjU2LCBudW1iZXJPZlRpY2tzVG9TbmFwVG9dXG4gICAgICBwb3NpdGlvbkxlbmd0aCA9IHBvc2l0aW9uLmxlbmd0aDtcbiAgICAgIGlmKHBvc2l0aW9uTGVuZ3RoICE9PSAyICYmIHBvc2l0aW9uTGVuZ3RoICE9PSAzICYmIHBvc2l0aW9uTGVuZ3RoICE9PSA1KXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyhwb3NpdGlvbiwgcmV0dXJuVHlwZSwgYmV5b25kRW5kT2ZTb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9zaXRpb24oc29uZywgdHlwZSwgYXJncyl7XG4gIC8vY29uc29sZS5sb2coJ2dldFBvc2l0aW9uJywgYXJncyk7XG5cbiAgaWYodHlwZW9mIGFyZ3MgPT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4ge1xuICAgICAgbWlsbGlzOiAwXG4gICAgfVxuICB9XG5cbiAgbGV0IHBvc2l0aW9uID0gY2hlY2tQb3NpdGlvbih0eXBlLCBhcmdzKSxcbiAgICBtaWxsaXMsIHRtcCwgc25hcDtcblxuXG4gIGlmKHBvc2l0aW9uID09PSBmYWxzZSl7XG4gICAgZXJyb3IoJ3dyb25nIHBvc2l0aW9uIGRhdGEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzd2l0Y2godHlwZSl7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBmcm9tQmFycyhzb25nLCBwb3NpdGlvblsxXSwgcG9zaXRpb25bMl0sIHBvc2l0aW9uWzNdLCBwb3NpdGlvbls0XSk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICAvLyBjYWxjdWxhdGUgbWlsbGlzIG91dCBvZiB0aW1lIGFycmF5OiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG4gICAgICBtaWxsaXMgPSAwO1xuICAgICAgdG1wID0gcG9zaXRpb25bMV0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiA2MCAqIDYwICogMTAwMDsgLy9ob3Vyc1xuICAgICAgdG1wID0gcG9zaXRpb25bMl0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiA2MCAqIDEwMDA7IC8vbWludXRlc1xuICAgICAgdG1wID0gcG9zaXRpb25bM10gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiAxMDAwOyAvL3NlY29uZHNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzRdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wOyAvL21pbGxpc2Vjb25kc1xuXG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBwb3NpdGlvblsxXSk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICBmcm9tVGlja3Moc29uZywgcG9zaXRpb25bMV0pO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAncGVyYyc6XG4gICAgY2FzZSAncGVyY2VudGFnZSc6XG4gICAgICBzbmFwID0gcG9zaXRpb25bMl07XG5cbiAgICAgIC8vbWlsbGlzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgLy9mcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pbGxpcyk7XG5cbiAgICAgIHRpY2tzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uVGlja3M7XG4gICAgICBpZihzbmFwICE9PSB1bmRlZmluZWQpe1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzL3NuYXApICogc25hcDtcbiAgICAgICAgLy9mcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRpY2tzKTtcbiAgICAgIH1cbiAgICAgIGZyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHRtcCA9IGdldFBvc2l0aW9uRGF0YShzb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXA7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4qL1xuXG4iLCJjb25zdCB2ZXJzaW9uID0gJzEuMC4wLWJldGExOSdcblxuaW1wb3J0IHtcbiAgTUlESUV2ZW50XG59IGZyb20gJy4vbWlkaV9ldmVudCdcblxuaW1wb3J0e1xuICBNSURJTm90ZSxcbn0gZnJvbSAnLi9taWRpX25vdGUnXG5cbmltcG9ydHtcbiAgUGFydCxcbn0gZnJvbSAnLi9wYXJ0J1xuXG5pbXBvcnR7XG4gIFRyYWNrLFxufSBmcm9tICcuL3RyYWNrJ1xuXG5pbXBvcnQge1xuICBTb25nLFxufSBmcm9tICcuL3NvbmcnXG5cbmltcG9ydCB7XG4gIEluc3RydW1lbnQsXG59IGZyb20gJy4vaW5zdHJ1bWVudCdcblxuaW1wb3J0IHtcbiAgU2FtcGxlcixcbn0gZnJvbSAnLi9zYW1wbGVyJ1xuXG5pbXBvcnQge1xuICBTaW1wbGVTeW50aCxcbn0gZnJvbSAnLi9zaW1wbGVfc3ludGgnXG5cbmltcG9ydCB7XG4gIHBhcnNlTUlESUZpbGVcbn0gZnJvbSAnLi9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgaW5pdCxcbn0gZnJvbSAnLi9pbml0J1xuXG5pbXBvcnQge1xuICBjb250ZXh0LFxuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZSxcbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5pbXBvcnQge1xuICBnZXRNSURJQWNjZXNzLFxuICBnZXRNSURJSW5wdXRzLFxuICBnZXRNSURJT3V0cHV0cyxcbiAgZ2V0TUlESUlucHV0SWRzLFxuICBnZXRNSURJT3V0cHV0SWRzLFxuICBnZXRNSURJSW5wdXRzQnlJZCxcbiAgZ2V0TUlESU91dHB1dHNCeUlkLFxufSBmcm9tICcuL2luaXRfbWlkaSdcblxuaW1wb3J0IHtcbiAgcGFyc2VTYW1wbGVzLFxufSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuXG5pbXBvcnQge1xuICBNSURJRXZlbnRUeXBlcyxcbn0gZnJvbSAnLi9jb25zdGFudHMnXG5cbmltcG9ydCB7XG4gIHNldEJ1ZmZlclRpbWUsXG4gIGdldEluc3RydW1lbnRzLFxuICBnZXRHTUluc3RydW1lbnRzLFxufSBmcm9tICcuL3NldHRpbmdzJ1xuXG5pbXBvcnQge1xuICBhZGRFdmVudExpc3RlbmVyLFxuICByZW1vdmVFdmVudExpc3RlbmVyLFxuICBkaXNwYXRjaEV2ZW50XG59IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcblxuXG5jb25zdCBnZXRBdWRpb0NvbnRleHQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gY29udGV4dFxufVxuXG5jb25zdCBxYW1iaSA9IHtcbiAgdmVyc2lvbixcblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICBzZXRCdWZmZXJUaW1lLFxuXG4gIC8vIGZyb20gLi9jb25zdGFudHNcbiAgTUlESUV2ZW50VHlwZXMsXG5cbiAgLy8gZnJvbSAuL3V0aWxcbiAgcGFyc2VTYW1wbGVzLFxuXG4gIC8vIGZyb20gLi9taWRpZmlsZVxuICBwYXJzZU1JRElGaWxlLFxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG5cbiAgLy8gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICBnZXRJbnN0cnVtZW50cyxcbiAgZ2V0R01JbnN0cnVtZW50cyxcblxuICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKXtcbiAgICByZXR1cm4gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaylcbiAgfSxcblxuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKVxuICB9LFxuXG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIE1JRElFdmVudCxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIE1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIFNvbmcsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIFRyYWNrLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIFBhcnQsXG5cbiAgLy8gZnJvbSAuL2luc3RydW1lbnRcbiAgSW5zdHJ1bWVudCxcblxuICAvLyBmcm9tIC4vc2ltcGxlX3N5bnRoXG4gIFNpbXBsZVN5bnRoLFxuXG4gIC8vIGZyb20gLi9zYW1wbGVyXG4gIFNhbXBsZXIsXG5cbiAgbG9nKGlkKXtcbiAgICBzd2l0Y2goaWQpe1xuICAgICAgY2FzZSAnZnVuY3Rpb25zJzpcbiAgICAgICAgY29uc29sZS5sb2coYGZ1bmN0aW9uczpcbiAgICAgICAgICBnZXRBdWRpb0NvbnRleHRcbiAgICAgICAgICBnZXRNYXN0ZXJWb2x1bWVcbiAgICAgICAgICBzZXRNYXN0ZXJWb2x1bWVcbiAgICAgICAgICBnZXRNSURJQWNjZXNzXG4gICAgICAgICAgZ2V0TUlESUlucHV0c1xuICAgICAgICAgIGdldE1JRElPdXRwdXRzXG4gICAgICAgICAgZ2V0TUlESUlucHV0SWRzXG4gICAgICAgICAgZ2V0TUlESU91dHB1dElkc1xuICAgICAgICAgIGdldE1JRElJbnB1dHNCeUlkXG4gICAgICAgICAgZ2V0TUlESU91dHB1dHNCeUlkXG4gICAgICAgICAgcGFyc2VNSURJRmlsZVxuICAgICAgICAgIHNldEJ1ZmZlclRpbWVcbiAgICAgICAgICBnZXRJbnN0cnVtZW50c1xuICAgICAgICAgIGdldEdNSW5zdHJ1bWVudHNcbiAgICAgICAgYClcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBxYW1iaVxuXG5leHBvcnQge1xuICB2ZXJzaW9uLFxuXG4gIC8vIGZyb20gLi9pbml0XG4gIGluaXQsXG5cbiAgLy8gZnJvbSAuL3NldHRpbmdzXG4gIHNldEJ1ZmZlclRpbWUsXG4gIGdldEluc3RydW1lbnRzLFxuICBnZXRHTUluc3RydW1lbnRzLFxuXG4gIC8vIGZyb20gLi9jb25zdGFudHNcbiAgTUlESUV2ZW50VHlwZXMsXG5cbiAgLy8gZnJvbSAuL3V0aWxcbiAgcGFyc2VTYW1wbGVzLFxuXG4gIC8vIGZyb20gLi9taWRpZmlsZVxuICBwYXJzZU1JRElGaWxlLFxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG5cbiAgLy8gZnJvbSAuL2luaXRfbWlkaVxuICBnZXRNSURJQWNjZXNzLFxuICBnZXRNSURJSW5wdXRzLFxuICBnZXRNSURJT3V0cHV0cyxcbiAgZ2V0TUlESUlucHV0SWRzLFxuICBnZXRNSURJT3V0cHV0SWRzLFxuICBnZXRNSURJSW5wdXRzQnlJZCxcbiAgZ2V0TUlESU91dHB1dHNCeUlkLFxuXG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIE1JRElFdmVudCxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIE1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIFNvbmcsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIFRyYWNrLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIFBhcnQsXG5cbiAgLy8gZnJvbSAuL2luc3RydW1lbnRcbiAgSW5zdHJ1bWVudCxcblxuICAvLyBmcm9tIC4vc2ltcGxlX3N5bnRoXG4gIFNpbXBsZVN5bnRoLFxuXG4gIC8vIGZyb20gLi9zYW1wbGVyXG4gIFNhbXBsZXIsXG59XG4iLCJpbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpby5qcydcbmltcG9ydCB7Z2V0RXF1YWxQb3dlckN1cnZlfSBmcm9tICcuL3V0aWwuanMnXG5cbmV4cG9ydCBjbGFzcyBTYW1wbGV7XG5cbiAgY29uc3RydWN0b3Ioc2FtcGxlRGF0YSwgZXZlbnQpe1xuICAgIHRoaXMuZXZlbnQgPSBldmVudFxuICAgIHRoaXMuc2FtcGxlRGF0YSA9IHNhbXBsZURhdGFcbiAgfVxuXG4gIHN0YXJ0KHRpbWUpe1xuICAgIGxldCB7c3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kfSA9IHRoaXMuc2FtcGxlRGF0YVxuICAgIC8vY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKVxuICAgIGlmKHN1c3RhaW5TdGFydCAmJiBzdXN0YWluRW5kKXtcbiAgICAgIHRoaXMuc291cmNlLmxvb3AgPSB0cnVlXG4gICAgICB0aGlzLnNvdXJjZS5sb29wU3RhcnQgPSBzdXN0YWluU3RhcnRcbiAgICAgIHRoaXMuc291cmNlLmxvb3BFbmQgPSBzdXN0YWluRW5kXG4gICAgfVxuICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBjYil7XG4gICAgbGV0IHtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZSwgcmVsZWFzZUVudmVsb3BlQXJyYXl9ID0gdGhpcy5zYW1wbGVEYXRhXG4gICAgLy9jb25zb2xlLmxvZyhyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZSlcbiAgICB0aGlzLnNvdXJjZS5vbmVuZGVkID0gY2JcblxuICAgIGlmKHJlbGVhc2VEdXJhdGlvbiAmJiByZWxlYXNlRW52ZWxvcGUpe1xuICAgICAgdGhpcy5zdGFydFJlbGVhc2VQaGFzZSA9IHRpbWVcbiAgICAgIHRoaXMucmVsZWFzZUZ1bmN0aW9uID0gKCkgPT4ge1xuICAgICAgICBmYWRlT3V0KHRoaXMub3V0cHV0LCB7XG4gICAgICAgICAgcmVsZWFzZUR1cmF0aW9uLFxuICAgICAgICAgIHJlbGVhc2VFbnZlbG9wZSxcbiAgICAgICAgICByZWxlYXNlRW52ZWxvcGVBcnJheSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHRoaXMuc291cmNlLnN0b3AodGltZSArIHJlbGVhc2VEdXJhdGlvbilcbiAgICAgIHRoaXMuY2hlY2tQaGFzZSgpXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUpXG4gICAgfVxuICB9XG5cbiAgY2hlY2tQaGFzZSgpe1xuICAgIC8vY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSwgdGhpcy5zdGFydFJlbGVhc2VQaGFzZSlcbiAgICBpZihjb250ZXh0LmN1cnJlbnRUaW1lID49IHRoaXMuc3RhcnRSZWxlYXNlUGhhc2Upe1xuICAgICAgdGhpcy5yZWxlYXNlRnVuY3Rpb24oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmNoZWNrUGhhc2UuYmluZCh0aGlzKSlcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBmYWRlT3V0KGdhaW5Ob2RlLCBzZXR0aW5ncyl7XG4gIGxldCBub3cgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gIGxldCB2YWx1ZXMsIGksIG1heGlcblxuICAvL2NvbnNvbGUubG9nKHNldHRpbmdzKVxuICBzd2l0Y2goc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlKXtcblxuICAgIGNhc2UgJ2xpbmVhcic6XG4gICAgICBnYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5Ob2RlLmdhaW4udmFsdWUsIG5vdylcbiAgICAgIGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4wLCBub3cgKyBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnZXF1YWwgcG93ZXInOlxuICAgIGNhc2UgJ2VxdWFsX3Bvd2VyJzpcbiAgICAgIHZhbHVlcyA9IGdldEVxdWFsUG93ZXJDdXJ2ZSgxMDAsICdmYWRlT3V0JywgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSlcbiAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVDdXJ2ZUF0VGltZSh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIG1heGkgPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheS5sZW5ndGhcbiAgICAgIHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkobWF4aSlcbiAgICAgIGZvcihpID0gMDsgaSA8IG1heGk7IGkrKyl7XG4gICAgICAgIHZhbHVlc1tpXSA9IHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZUFycmF5W2ldICogZ2Fpbk5vZGUuZ2Fpbi52YWx1ZVxuICAgICAgfVxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgfVxufVxuIiwiaW1wb3J0IHtTYW1wbGV9IGZyb20gJy4vc2FtcGxlJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgU2FtcGxlQnVmZmVyIGV4dGVuZHMgU2FtcGxle1xuXG4gIGNvbnN0cnVjdG9yKHNhbXBsZURhdGEsIGV2ZW50KXtcbiAgICBzdXBlcihzYW1wbGVEYXRhLCBldmVudClcbiAgICB0aGlzLmlkID0gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV8ke2luc3RhbmNlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG5cbiAgICBpZih0aGlzLnNhbXBsZURhdGEgPT09IC0xIHx8IHR5cGVvZiB0aGlzLnNhbXBsZURhdGEuYnVmZmVyID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAvLyBjcmVhdGUgZHVtbXkgc291cmNlXG4gICAgICB0aGlzLnNvdXJjZSA9IHtcbiAgICAgICAgc3RhcnQoKXt9LFxuICAgICAgICBzdG9wKCl7fSxcbiAgICAgICAgY29ubmVjdCgpe30sXG4gICAgICB9XG5cbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGVEYXRhKVxuICAgICAgdGhpcy5zb3VyY2UuYnVmZmVyID0gc2FtcGxlRGF0YS5idWZmZXI7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc291cmNlLmJ1ZmZlcilcbiAgICB9XG4gICAgdGhpcy5vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMudm9sdW1lID0gZXZlbnQuZGF0YTIgLyAxMjdcbiAgICB0aGlzLm91dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLnNvdXJjZS5jb25uZWN0KHRoaXMub3V0cHV0KVxuICAgIC8vdGhpcy5vdXRwdXQuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICB9XG59XG4iLCJpbXBvcnQge1NhbXBsZX0gZnJvbSAnLi9zYW1wbGUnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBTYW1wbGVPc2NpbGxhdG9yIGV4dGVuZHMgU2FtcGxle1xuXG4gIGNvbnN0cnVjdG9yKHNhbXBsZURhdGEsIGV2ZW50KXtcbiAgICBzdXBlcihzYW1wbGVEYXRhLCBldmVudClcbiAgICB0aGlzLmlkID0gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV8ke2luc3RhbmNlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG5cbiAgICBpZih0aGlzLnNhbXBsZURhdGEgPT09IC0xKXtcbiAgICAgIC8vIGNyZWF0ZSBkdW1teSBzb3VyY2VcbiAgICAgIHRoaXMuc291cmNlID0ge1xuICAgICAgICBzdGFydCgpe30sXG4gICAgICAgIHN0b3AoKXt9LFxuICAgICAgICBjb25uZWN0KCl7fSxcbiAgICAgIH1cblxuICAgIH1lbHNle1xuXG4gICAgICAvLyBAVE9ETyBhZGQgdHlwZSAnY3VzdG9tJyA9PiBQZXJpb2RpY1dhdmVcbiAgICAgIGxldCB0eXBlID0gdGhpcy5zYW1wbGVEYXRhLnR5cGVcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKClcblxuICAgICAgc3dpdGNoKHR5cGUpe1xuICAgICAgICBjYXNlICdzaW5lJzpcbiAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgY2FzZSAnc2F3dG9vdGgnOlxuICAgICAgICBjYXNlICd0cmlhbmdsZSc6XG4gICAgICAgICAgdGhpcy5zb3VyY2UudHlwZSA9IHR5cGVcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRoaXMuc291cmNlLnR5cGUgPSAnc3F1YXJlJ1xuICAgICAgfVxuICAgICAgdGhpcy5zb3VyY2UuZnJlcXVlbmN5LnZhbHVlID0gZXZlbnQuZnJlcXVlbmN5XG4gICAgfVxuICAgIHRoaXMub3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLnZvbHVtZSA9IGV2ZW50LmRhdGEyIC8gMTI3XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5zb3VyY2UuY29ubmVjdCh0aGlzLm91dHB1dClcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgfVxufVxuIiwiaW1wb3J0IHtJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5pbXBvcnQge2NyZWF0ZU5vdGV9IGZyb20gJy4vbm90ZSdcbmltcG9ydCB7cGFyc2VTYW1wbGVzfSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2ZldGNoSlNPTn0gZnJvbSAnLi9mZXRjaF9oZWxwZXJzJ1xuaW1wb3J0IHtTYW1wbGVCdWZmZXJ9IGZyb20gJy4vc2FtcGxlX2J1ZmZlcidcblxuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFNhbXBsZXIgZXh0ZW5kcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyl7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcblxuICAgIC8vIGNyZWF0ZSBhIHNhbXBsZXMgZGF0YSBvYmplY3QgZm9yIGFsbCAxMjggdmVsb2NpdHkgbGV2ZWxzIG9mIGFsbCAxMjggbm90ZXNcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSlcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gdGhpcy5zYW1wbGVzRGF0YS5tYXAoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKVxuICAgIH0pXG4gIH1cblxuICBjcmVhdGVTYW1wbGUoZXZlbnQpe1xuICAgIHJldHVybiBuZXcgU2FtcGxlQnVmZmVyKHRoaXMuc2FtcGxlc0RhdGFbZXZlbnQuZGF0YTFdW2V2ZW50LmRhdGEyXSwgZXZlbnQpXG4gIH1cblxuICBfbG9hZEpTT04oZGF0YSl7XG4gICAgaWYodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkYXRhLnVybCA9PT0gJ3N0cmluZycpe1xuICAgICAgcmV0dXJuIGZldGNoSlNPTihkYXRhLnVybClcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkYXRhKVxuICB9XG5cbiAgLy8gbG9hZCBhbmQgcGFyc2VcbiAgcGFyc2VTYW1wbGVEYXRhKGRhdGEpe1xuXG4gICAgLy8gY2hlY2sgaWYgd2UgaGF2ZSB0byBvdmVycnVsZSB0aGUgYmFzZVVybCBvZiB0aGUgc2FtcGVsc1xuICAgIGxldCBiYXNlVXJsID0gbnVsbFxuICAgIGlmKHR5cGVvZiBkYXRhLmJhc2VVcmwgPT09ICdzdHJpbmcnKXtcbiAgICAgIGJhc2VVcmwgPSBkYXRhLmJhc2VVcmxcbiAgICB9XG5cbiAgICBpZih0eXBlb2YgZGF0YS5yZWxlYXNlICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAvL2NvbnNvbGUubG9nKDEsIGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgIH1cblxuICAgIC8vcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fbG9hZEpTT04oZGF0YSlcbiAgICAgIC50aGVuKChqc29uKSA9PiB7XG4gICAgICAgIC8vY29uc29sZS5sb2coanNvbilcbiAgICAgICAgZGF0YSA9IGpzb25cbiAgICAgICAgaWYoYmFzZVVybCAhPT0gbnVsbCl7XG4gICAgICAgICAganNvbi5iYXNlVXJsID0gYmFzZVVybFxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygyLCBkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VTYW1wbGVzKGRhdGEpXG4gICAgICB9KVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICBpZih0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgZm9yKGxldCBub3RlSWQgb2YgT2JqZWN0LmtleXMocmVzdWx0KSkge1xuICAgICAgICAgICAgbGV0IGJ1ZmZlciA9IHJlc3VsdFtub3RlSWRdXG4gICAgICAgICAgICBsZXQgc2FtcGxlRGF0YSA9IGRhdGFbbm90ZUlkXVxuXG5cbiAgICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzYW1wbGVEYXRhIGlzIHVuZGVmaW5lZCcsIG5vdGVJZClcbiAgICAgICAgICAgIH1lbHNlIGlmKHR5cGVTdHJpbmcoYnVmZmVyKSA9PT0gJ2FycmF5Jyl7XG5cbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhidWZmZXIsIHNhbXBsZURhdGEpXG4gICAgICAgICAgICAgIHNhbXBsZURhdGEuZm9yRWFjaCgoc2QsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKG5vdGVJZCwgYnVmZmVyW2ldKVxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBzZCA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgICAgICAgc2QgPSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyW2ldXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICBzZC5idWZmZXIgPSBidWZmZXJbaV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2Qubm90ZSA9IHBhcnNlSW50KG5vdGVJZCwgMTApXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2FtcGxlRGF0YShzZClcbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfWVsc2Uge1xuXG4gICAgICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IGJ1ZmZlclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHBhcnNlSW50KG5vdGVJZCwgMTApXG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICB9ZWxzZXtcblxuICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKChzYW1wbGUpID0+IHtcbiAgICAgICAgICAgIGxldCBzYW1wbGVEYXRhID0gZGF0YVtzYW1wbGVdXG4gICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2FtcGxlRGF0YSBpcyB1bmRlZmluZWQnLCBzYW1wbGUpXG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogc2FtcGxlLmJ1ZmZlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBzYW1wbGUuYnVmZmVyXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2FtcGxlRGF0YS5ub3RlID0gc2FtcGxlXG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcbiAgICAgICAgICAgICAgLy90aGlzLnVwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuXG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyhuZXcgRGF0ZSgpLmdldFRpbWUoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKlxuICAgIEBwYXJhbSBjb25maWcgKG9wdGlvbmFsKVxuICAgICAge1xuICAgICAgICBub3RlOiBjYW4gYmUgbm90ZSBuYW1lIChDNCkgb3Igbm90ZSBudW1iZXIgKDYwKVxuICAgICAgICBidWZmZXI6IEF1ZGlvQnVmZmVyXG4gICAgICAgIHN1c3RhaW46IFtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmRdLCAvLyBvcHRpb25hbCwgaW4gbWlsbGlzXG4gICAgICAgIHJlbGVhc2U6IFtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZV0sIC8vIG9wdGlvbmFsXG4gICAgICAgIHBhbjogcGFuUG9zaXRpb24gLy8gb3B0aW9uYWxcbiAgICAgICAgdmVsb2NpdHk6IFt2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZF0gLy8gb3B0aW9uYWwsIGZvciBtdWx0aS1sYXllcmVkIGluc3RydW1lbnRzXG4gICAgICB9XG4gICovXG4gIHVwZGF0ZVNhbXBsZURhdGEoLi4uZGF0YSl7XG4gICAgZGF0YS5mb3JFYWNoKG5vdGVEYXRhID0+IHtcbiAgICAgIC8vIHN1cHBvcnQgZm9yIG11bHRpIGxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgIC8vY29uc29sZS5sb2cobm90ZURhdGEsIHR5cGVTdHJpbmcobm90ZURhdGEpKVxuICAgICAgaWYodHlwZVN0cmluZyhub3RlRGF0YSkgPT09ICdhcnJheScpe1xuICAgICAgICBub3RlRGF0YS5mb3JFYWNoKHZlbG9jaXR5TGF5ZXIgPT4ge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEodmVsb2NpdHlMYXllcilcbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKG5vdGVEYXRhKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjbGVhclNhbXBsZURhdGEoKXtcblxuICB9XG5cbiAgX3VwZGF0ZVNhbXBsZURhdGEoZGF0YSA9IHt9KXtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gICAgbGV0IHtcbiAgICAgIG5vdGUsXG4gICAgICBidWZmZXIgPSBudWxsLFxuICAgICAgc3VzdGFpbiA9IFtudWxsLCBudWxsXSxcbiAgICAgIHJlbGVhc2UgPSBbbnVsbCwgJ2xpbmVhciddLCAvLyByZWxlYXNlIGR1cmF0aW9uIGlzIGluIHNlY29uZHMhXG4gICAgICBwYW4gPSBudWxsLFxuICAgICAgdmVsb2NpdHkgPSBbMCwgMTI3XSxcbiAgICB9ID0gZGF0YVxuXG4gICAgaWYodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBub3RlbnVtYmVyIG9yIGEgbm90ZW5hbWUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZ2V0IG5vdGVudW1iZXIgZnJvbSBub3RlbmFtZSBhbmQgY2hlY2sgaWYgdGhlIG5vdGVudW1iZXIgaXMgdmFsaWRcbiAgICBsZXQgbiA9IGNyZWF0ZU5vdGUobm90ZSlcbiAgICBpZihuID09PSBmYWxzZSl7XG4gICAgICBjb25zb2xlLndhcm4oJ25vdCBhIHZhbGlkIG5vdGUgaWQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG5vdGUgPSBuLm51bWJlclxuXG4gICAgbGV0IFtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmRdID0gc3VzdGFpblxuICAgIGxldCBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdID0gcmVsZWFzZVxuICAgIGxldCBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdID0gdmVsb2NpdHlcblxuICAgIGlmKHN1c3RhaW4ubGVuZ3RoICE9PSAyKXtcbiAgICAgIHN1c3RhaW5TdGFydCA9IHN1c3RhaW5FbmQgPSBudWxsXG4gICAgfVxuXG4gICAgaWYocmVsZWFzZUR1cmF0aW9uID09PSBudWxsKXtcbiAgICAgIHJlbGVhc2VFbnZlbG9wZSA9IG51bGxcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhub3RlLCBidWZmZXIpXG4gICAgLy8gY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKVxuICAgIC8vIGNvbnNvbGUubG9nKHJlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlKVxuICAgIC8vIGNvbnNvbGUubG9nKHBhbilcbiAgICAvLyBjb25zb2xlLmxvZyh2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZClcblxuXG4gICAgdGhpcy5zYW1wbGVzRGF0YVtub3RlXS5mb3JFYWNoKChzYW1wbGVEYXRhLCBpKSA9PiB7XG4gICAgICBpZihpID49IHZlbG9jaXR5U3RhcnQgJiYgaSA8PSB2ZWxvY2l0eUVuZCl7XG4gICAgICAgIGlmKHNhbXBsZURhdGEgPT09IC0xKXtcbiAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgaWQ6IG5vdGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IGJ1ZmZlciB8fCBzYW1wbGVEYXRhLmJ1ZmZlclxuICAgICAgICBzYW1wbGVEYXRhLnN1c3RhaW5TdGFydCA9IHN1c3RhaW5TdGFydCB8fCBzYW1wbGVEYXRhLnN1c3RhaW5TdGFydFxuICAgICAgICBzYW1wbGVEYXRhLnN1c3RhaW5FbmQgPSBzdXN0YWluRW5kIHx8IHNhbXBsZURhdGEuc3VzdGFpbkVuZFxuICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VEdXJhdGlvbiA9IHJlbGVhc2VEdXJhdGlvbiB8fCBzYW1wbGVEYXRhLnJlbGVhc2VEdXJhdGlvblxuICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSA9IHJlbGVhc2VFbnZlbG9wZSB8fCBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZVxuICAgICAgICBzYW1wbGVEYXRhLnBhbiA9IHBhbiB8fCBzYW1wbGVEYXRhLnBhblxuXG4gICAgICAgIGlmKHR5cGVTdHJpbmcoc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUpID09PSAnYXJyYXknKXtcbiAgICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZUFycmF5ID0gc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVcbiAgICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSA9ICdhcnJheSdcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGVsZXRlIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNhbXBsZXNEYXRhW25vdGVdW2ldID0gc2FtcGxlRGF0YVxuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZygnJU8nLCB0aGlzLnNhbXBsZXNEYXRhW25vdGVdKVxuICAgIH0pXG4gIH1cblxuXG4gIC8vIHN0ZXJlbyBzcHJlYWRcbiAgc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKXtcbiAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICB9XG5cbiAgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcbiAgfVxuXG4gIC8qXG4gICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAqL1xuICBzZXRSZWxlYXNlKGR1cmF0aW9uOiBudW1iZXIsIGVudmVsb3BlKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBmb3IgYWxsIGtleXMsIG92ZXJydWxlcyB2YWx1ZXMgc2V0IGJ5IHNldEtleVNjYWxpbmdSZWxlYXNlKClcbiAgICB0aGlzLnNhbXBsZXNEYXRhLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlcywgaWQpe1xuICAgICAgc2FtcGxlcy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSwgaSl7XG4gICAgICAgIGlmKHNhbXBsZSA9PT0gLTEpe1xuICAgICAgICAgIHNhbXBsZSA9IHtcbiAgICAgICAgICAgIGlkOiBpZFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzYW1wbGUucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb25cbiAgICAgICAgc2FtcGxlLnJlbGVhc2VFbnZlbG9wZSA9IGVudmVsb3BlXG4gICAgICAgIHNhbXBsZXNbaV0gPSBzYW1wbGVcbiAgICAgIH0pXG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGEpXG4gIH1cbn1cbiIsImNvbnN0IHNhbXBsZXMgPSB7XG4gIGVtcHR5T2dnOiAnVDJkblV3QUNBQUFBQUFBQUFBQmR4ZDRYQUFBQUFEYVMwalFCSGdGMmIzSmlhWE1BQUFBQUFVU3NBQUFBQUFBQWdMc0FBQUFBQUFDNEFVOW5aMU1BQUFBQUFBQUFBQUFBWGNYZUZ3RUFBQUFhWEsrUUR6My8vLy8vLy8vLy8vLy8vLy8vTWdOMmIzSmlhWE10QUFBQVdHbHdhQzVQY21jZ2JHbGlWbTl5WW1seklFa2dNakF4TURFeE1ERWdLRk5qYUdGMVptVnVkV2RuWlhRcEFBQUFBQUVGZG05eVltbHpIMEpEVmdFQUFBRUFHR05VS1VhWlV0SktpUmx6bERGR21XS1NTb21saEJaQ1NKMXpGRk9wT2RlY2E2eTV0U0NFRUJwVFVDa0ZtVktPVW1rWlk1QXBCWmxTRUV0SkpYUVNPaWVkWXhCYlNjSFdtR3VMUWJZY2hBMmFVa3dweEpSU2lrSUlHVk9NS2NXVVVrcENCeVYwRGpybUhGT09TaWhCdUp4enE3V1dsbU9McVhTU1N1Y2taRXhDU0NtRmtrb0hwVk5PUWtnMWx0WlNLUjF6VWxKcVFlZ2doQkJDdGlDRURZTFFrRlVBQUFFQXdFQVFHcklLQUZBQUFCQ0tvUmlLQW9TR3JBSUFNZ0FBQktBb2p1SW9qaU01a21OSkZoQWFzZ29BQUFJQUVBQUF3SEFVU1pFVXliRWtTOUlzUzlORVVWVjkxVFpWVmZaMVhkZDFYZGQxSURSa0ZRQUFBUUJBU0tlWnBSb2d3Z3hrR0FnTldRVUFJQUFBQUVZb3doQURRa05XQVFBQUFRQUFZaWc1aUNhMDVueHpqb05tT1dncXhlWjBjQ0xWNWtsdUt1Ym1uSFBPT1NlYmM4WTQ1NXh6aW5KbU1XZ210T2FjY3hLRFppbG9KclRtbkhPZXhPWkJhNnEwNXB4enhqbW5nM0ZHR09lY2M1cTA1a0ZxTnRibW5ITVd0S1k1YWk3RjVweHpJdVhtU1cwdTFlYWNjODQ1NTV4enpqbm5uSE9xRjZkemNFNDQ1NXh6b3ZibVdtNUNGK2VjY3o0WnAzdHpRampubkhQT09lZWNjODQ1NTV4emd0Q1FWUUFBRUFBQVFSZzJobkduSUVpZm80RVlSWWhweUtRSDNhUERKR2dNY2dxcFI2T2prVkxxSUpSVXhra3BuU0EwWkJVQUFBZ0FBQ0dFRkZKSUlZVVVVa2doaFJSU2lDR0dHR0xJS2FlY2dnb3FxYVNpaWpMS0xMUE1Nc3Nzczh3eTY3Q3p6anJzTU1RUVF3eXR0QkpMVGJYVldHT3R1ZWVjYXc3U1dtbXR0ZFpLS2FXVVVrb3BDQTFaQlFDQUFBQVFDQmxra0VGR0lZVVVVb2docHB4eXlpbW9vQUpDUTFZQkFJQUFBQUlBQUFBOHlYTkVSM1JFUjNSRVIzUkVSM1JFeDNNOFI1UkVTWlJFU2JSTXk5Uk1UeFZWMVpWZFc5WmwzZlp0WVJkMjNmZDEzL2QxNDllRllWbVdaVm1XWlZtV1pWbVdaVm1XWlZtQzBKQlZBQUFJQUFDQUVFSUlJWVVVVWtnaHBSaGp6REhub0pOUVFpQTBaQlVBQUFnQUlBQUFBTUJSSE1WeEpFZHlKTW1TTEVtVE5FdXpQTTNUUEUzMFJGRVVUZE5VUlZkMFJkMjBSZG1VVGRkMFRkbDBWVm0xWFZtMmJkbldiVitXYmQvM2ZkLzNmZC8zZmQvM2ZkLzNkUjBJRFZrRkFFZ0FBT2hJanFSSWlxUklqdU00a2lRQm9TR3JBQUFaQUFBQkFDaUtvemlPNDBpU0pFbVdwRW1lNVZtaVptcW1aM3FxcUFLaElhc0FBRUFBQUFFQUFBQUFBQ2lhNGltbTRpbWk0am1pSTBxaVpWcWlwbXF1S0p1eTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdvdUVCcXlDZ0NRQUFEUWtSekprUnhKa1JSSmtSekpBVUpEVmdFQU1nQUFBZ0J3RE1lUUZNbXhMRXZUUE0zVFBFMzBSRS8wVEU4VlhkRUZRa05XQVFDQUFBQUNBQUFBQUFBd0pNTlNMRWR6TkVtVVZFdTFWRTIxVkVzVlZVOVZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVMVRkTTBUU0EwWkNVQUFBUUF3R0tOd2VVZ0lTVWw1ZDRRd2hDVG5qRW1JYlZlSVFTUmt0NHhCaFdEbmpLaURITGVRdU1RZ3g0SURWa1JBRVFCQUFER0lNY1FjOGc1UjZtVEVqbm5xSFNVR3VjY3BZNVNaeW5GbUdMTktKWFlVcXlOYzQ1U1I2MmpsR0lzTFhhVVVvMnB4Z0lBQUFJY0FBQUNMSVJDUTFZRUFGRUFBSVF4U0Nta0ZHS01PYWVjUTR3cDU1aHpoakhtSEhPT09lZWdkRklxNTV4MFRrckVHSE9PT2FlY2MxSTZKNVZ6VGtvbm9RQUFnQUFIQUlBQUM2SFFrQlVCUUp3QWdFR1NQRS95TkZHVU5FOFVSVk4wWFZFMFhkZnlQTlgwVEZOVlBkRlVWVk5WYmRsVVZWbVdQTTgwUGROVVZjODBWZFZVVlZrMlZWV1dSVlhWYmROMWRkdDBWZDJXYmR2M1hWc1dkbEZWYmQxVVhkczNWZGYyWGRuMmZWbldkV1B5UEZYMVROTjFQZE4wWmRWMWJWdDFYVjMzVEZPV1RkZVZaZE4xYmR1VlpWMTNaZG4zTmROMFhkTlZaZGwwWGRsMlpWZTNYVm4yZmROMWhkK1ZaVjlYWlZrWWRsMzNoVnZYbGVWMFhkMVhaVmMzVmxuMmZWdlhoZUhXZFdHWlBFOVZQZE4wWGM4MFhWZDFYVjlYWGRmV05kT1VaZE4xYmRsVVhWbDJaZG4zWFZmV2RjODBaZGwwWGRzMlhWZVdYVm4yZlZlV2RkMTBYVjlYWlZuNFZWZjJkVm5YbGVIV2JlRTNYZGYzVlZuMmhWZVdkZUhXZFdHNWRWMFlQbFgxZlZOMmhlRjBaZC9YaGQ5WmJsMDRsdEYxZldHVmJlRllaVms1ZnVGWWx0MzNsV1YwWFY5WWJka1lWbGtXaGwvNG5lWDJmZU40ZFYwWmJ0M256THJ2RE1mdnBQdkswOVZ0WTVsOTNWbG1YM2VPNFJnNnYvRGpxYXF2bTY0ckRLY3NDNy90Njhheis3NnlqSzdyKzZvc0M3OHEyOEt4Njc3ei9MNndMS1BzK3NKcXk4S3cycll4M0w1dUxMOXdITXRyNjhveDY3NVJ0blY4WDNnS3cvTjBkVjE1WmwzSDluVjA0MGM0ZnNvQUFJQUJCd0NBQUJQS1FLRWhLd0tBT0FFQWp5U0pvbVJab2loWmxpaUtwdWk2b21pNnJxUnBwcWxwbm1sYW1tZWFwbW1xc2ltYXJpeHBtbWxhbm1hYW1xZVpwbWlhcm11YXBxeUtwaW5McG1yS3NtbWFzdXk2c20yN3JtemJvbW5Lc21tYXNteWFwaXk3c3F2YnJ1enF1cVJacHFsNW5tbHFubWVhcG1yS3NtbWFycXQ1bm1wNm5taXFuaWlxcW1xcXFxMnFxaXhibm1lYW11aXBwaWVLcW1xcXBxMmFxaXJMcHFyYXNtbXF0bXlxcW0yN3F1ejZzbTNydW1tcXNtMnFwaTJicW1yYnJ1enFzaXpidWk5cG1tbHFubWVhbXVlWnBtbWFzbXlhcWl0Ym5xZWFuaWlxcXVhSnBtcXFxaXlicHFyS2x1ZVpxaWVLcXVxSm5tdWFxaXJMcG1yYXFtbWF0bXlxcWkyYnBpckxybTM3dnV2S3NtNnFxbXlicW1ycnBtcktzbXpMdnUvS3F1NktwaW5McHFyYXNtbXFzaTNic3UvTHNxejdvbW5Lc21tcXNtMnFxaTdMc20wYnMyejd1bWlhc20ycXBpMmJxaXJic2kzN3VpemJ1dS9Lcm0rcnFxenJzaTM3dXU3NnJuRHJ1akM4c216N3FxejZ1aXZidW0vck10djJmVVRUbEdWVE5XM2JWRlZaZG1YWjltWGI5bjNSTkcxYlZWVmJOazNWdG1WWjluMVp0bTFoTkUzWk5sVlYxazNWdEcxWmxtMWh0bVhoZG1YWnQyVmI5blhYbFhWZjEzM2oxMlhkNXJxeTdjdXlyZnVxcS9xMjd2dkNjT3V1OEFvQUFCaHdBQUFJTUtFTUZCcXlFZ0NJQWdBQWpHR01NUWlOVXM0NUI2RlJ5am5uSUdUT1FRZ2hsY3c1Q0NHVWtqa0hvWlNVTXVjZ2xKSlNDS0dVbEZvTElaU1VVbXNGQUFBVU9BQUFCTmlnS2JFNFFLRWhLd0dBVkFBQWcrTllsdWVab21yYXNtTkpuaWVLcXFtcXR1MUlsdWVKb21tcXFtMWJuaWVLcHFtcXJ1dnJtdWVKb21tcXF1dnF1bWlhcHFtcXJ1dTZ1aTZhb3FtcXF1dTZzcTZicHFxcXJpdTdzdXpycHFxcXF1dktyaXo3d3FxNnJpdkxzbTNyd3JDcXJ1dktzbXpidG0vY3VxN3J2dS83d3BHdDY3b3UvTUl4REVjQkFPQUpEZ0JBQlRhc2puQlNOQlpZYU1oS0FDQURBSUF3QmlHREVFSUdJWVNRVWtvaHBaUVNBQUF3NEFBQUVHQkNHU2cwWkVVQUVDY0FBQmhES2FTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKSUthV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS3FhU1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0taVlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWdvQWtJcHdBSkI2TUtFTUZCcXlFZ0JJQlFBQWpGRktLY2FjZ3hBeDVoaGowRWtvS1dMTU9jWWNsSkpTNVJ5RUVGSnBMYmZLT1FnaHBOUlNiWmx6VWxxTE1lWVlNK2VrcEJSYnpUbUhVbEtMc2VhYWErNmt0RlpycmpYbldscXJOZGVjYzgyNXRCWnJyam5YbkhQTE1kZWNjODQ1NXhoenpqbm5uSFBPQlFEZ05EZ0FnQjdZc0RyQ1NkRllZS0VoS3dHQVZBQUFBaG1sR0hQT09lZ1FVb3c1NXh5RUVDS0ZHSFBPT1FnaFZJdzU1eHgwRUVLb0dIUE1PUWdoaEpBNTV4eUVFRUlJSVhNT091Z2doQkJDQngyRUVFSUlvWlRPUVFnaGhCQktLQ0dFRUVJSUlZUVFPZ2doaEJCQ0NDR0VFRUlJSVlSU1NnZ2hoQkJDQ2FHVVVBQUFZSUVEQUVDQURhc2puQlNOQlJZYXNoSUFBQUlBZ0J5V29GTE9oRUdPUVk4TlFjcFJNdzFDVERuUm1XSk9hak1WVTVBNUVKMTBFaGxxUWRsZU1nc0FBSUFnQUNEQUJCQVlJQ2o0UWdpSU1RQUFRWWpNRUFtRlZiREFvQXdhSE9ZQndBTkVoRVFBa0ppZ1NMdTRnQzREWE5ERlhRZENDRUlRZ2xnY1FBRUpPRGpoaGlmZThJUWJuS0JUVk9vZ0FBQUFBQUFNQU9BQkFPQ2dBQ0lpbXF1d3VNREkwTmpnNlBBSUFBQUFBQUFXQVBnQUFEZytnSWlJNWlvc0xqQXlORFk0T2p3Q0FBQUFBQUFBQUFDQWdJQUFBQUFBQUVBQUFBQ0FnRTluWjFNQUJBRUFBQUFBQUFBQVhjWGVGd0lBQUFCcTJucHhBZ0VCQUFvPScsXG4gIGVtcHR5TXAzOiAnLy9zUXhBQUR3QUFCcEFBQUFDQUFBRFNBQUFBRVRFRk5SVE11T1RrdU5WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVT0nLFxuICBoaWdodGljazogJ1VrbEdSa1FGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZU0FGQUFDeC94Zi9kQURPQUN3QnNQM3ArNkgrekFHb0JPa0NDd0JYL0VINU92eGxBNGtKMndjU0FyVDlFL3V0K0hUMmV2VXg5OG42T0FGNUNDVU13UXZmQ09zSnhBeDBEU0lNRUFxOUJpQUIzdmh6N21Ma1Q5c1IxMzNZeE4yczVRTHYwdnJVQm53Um54dVFKZUVzU0RDaU1kOHlGUzhhS0ZJaG9oVXNDS2o2NHU2MjVPcmFBOUh1eVBuRWxjUCt3eHZKV3RXMjU2MzdWUTBqSFBnbkJURERNMW8wQ3pLTEsrOGh6aGdGRE96OFNlNEo0N0RZVnRHMHo1ZlFxOUxCMTJyZkErajk5cm9IQWhlbEl5TXdJamRUT3VVOG1qd0lPR294aENiNUU1My9qKzNrMy9mVFk4cFR3NHkvVHIrZXc4RE12ZHNrOFJjSFJSa1NLTzR5R1RrSFBrVS9yenp5TmNnc3JSOTREcC81citaczE3ek9uY29EeGhmRTM4V0x5bi9UZU9NaTlyMElSeGxSS0lRenlUbE9QS285eWptV01jb2tEUkxjL1k3cnVkdGR6dS9EMkwxSXUrMjdKY0czeVlyVkx1amwrM1VPWngxVUs1UTBxem1OUERrOFpqZWVNUG9qemhIKy9qTHRQZDVtMGhITEhzWUl3NVRFTU1uQTBqdmo4ZlNPQml3WEFTWmdNek04ZFVCR1FiSStyempwS2tJWnlnWlQ5UWZsY2RhUnlxWEN6NytWd1VQSDc4NHIzSzdzK3YwS0R1OGJ2eWVMTWI0M05qcmhPSW8wZFN2UUhpMFBuUDZpN292ZzNOVHh5NC9HZjhYOHlIL1FCdHZYNTVQMllnYjBGY1Vqc3k0TE5tSTVlamlYTTM4cjdpQzhGSndIUHZvazdkRGdRZGFKemxUS0lzb0Z6c3JWa3VBODdkLzZxQWk3RlEwaDlDbEtNTEV6M1RPck1CY3FZU0Q4RTlBRmQvZFM2a1RmNmRiVTBYblF2OUlIMk1YZlorbG45REVBRnd3ZEZ5OGdpaWI2S2F3cWVDaGdJL1ViSEJPVENaai92dlhlN0lubEZ1RE4zUDNiMGQxRjRnenBpZkcyK3U0RDdRdzFGZndibkNEK0lsZ2pXeUhMSFBNVm9nMm1CTDM3cXZQKzdOdm5ZdVR2NHJ2amZ1Yk42azN3cFBaMC9Xa0VPd3RpRVVzV2N4bStHbDRhT2hoaUZEQVBJd21iQXRuN1RQVnk3N3pxY2VmcjVZSG1IdWxsN2VueWZQbWNBSGdIZXcxUkVyOFZoaGQvRitBVjFSSjBEaWtKV1FOYy9aUDNlZktkN2h2czJ1cjQ2ckhzNXU4ZTlOLzQ4LzBoQS84SEZnd3VEMDRSU0JJUkVxc1FPZzdtQ3NzR01BSlcvWG40Ry9USzhMYnV6dTBJN3FUdm5QSnk5c1g2YlA4NEJMWUliQXdkRDg0UVl4RzdFT2NPREF4d0NGTUVBUUM5KzdQM1N2VFg4WEh3K3U5UjhLVHhJdlNvOStYN1ZRQ1VCSjBJTXd6aURqNFFMaEFHRDlVTXJnblRCWmNCUnYxditYdjJVZlMrOHRmeCt2RVM4N3owK3ZiMytaZjlaZ0VRQlNFSVVBcldDOGtNMlF5ekM1RUpFQWR2QkhnQlhQNW4rK3I0QXZkODlXajA3Zk13OUQzMUp2ZnArVWo5eFFEOUE4UUc1UWhYQ2xFTHJBc3ZDOXdKN2dkNkJXSUMzdjZPKzdUNFBQWk45RUh6V3ZOZjlQejFGdml0K3FMOXJRQ0hBd0VHL3dlQ0NaVUtGd3ZEQ25JSmNBY1FCV2NDYWY4Wi9DRDU1dmFCOWREMHdQU1A5VUwzbS9rNy9NeitKd0V5QXc4RnpBWTdDQnNKYVFrNUNXa0kyZ2F0QkNJQ1lmK2ovRnI2dmZpVjk4NzJzZlpQOTF6NHAvbFIrM0g5emY4OUFyb0VGQWZqQ1AwSmN3bzhDakFKZFFkZ0JTRURrZ0RRL1ZqN1pmblI5NVQyOGZVZDl2MzJWdmcyK25iOCsvNnhBV29FNEFiRENQNEpwQXFiQ3FRSjB3ZUVCZmdDVEFDVC9SMzdNL20rOTY3MklQWTY5Z2IzYWZoVyt0VDhxZitNQWowRmdnY3VDU2NLWEFyaUNjTUlFQWZ5QkpZQ0Z3Q1AvUno3QS9sNzkzejJGL1puOW1IMzdmamQraTM5eWY5cEF0MEVGQWZSQ05rSkdBcXJDWllJdmdaUEJKOEI2UDQvL00zNTB2ZHo5cS8xbGZVcTltejNSUG1pKzNIK2JnRlZCT1FHM3dnSENrd0swQW03Q0NBSENnV21BakFBJyxcbiAgbG93dGljazogJ1VrbEdSbFFGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZVEFGQUFCMC81ditVLzRULzNnQTB3RlRBdVVCK2Y4ZC9uVDkwZjFxL3ViK3RmNDYvbWIvOHdGUUE5Z0M3d0NkL21yK0ZBR1JBM2NFNndKZi9oMzZldm12Kzh2L053UkhCWlVDMi82MCsvLzVFdnVaL2FYL2JnRk9BcDhBenZ6aDl3ZnpMUEY2OHpUNHkvMkJBeWdJZlF3YUVqWVkweDMxSXJ3bDhTT1dIVkVTT2dQaDlOZnBSZUZ0MjJuWUhkZEQyQlhjWmVEYTVJbnFnUER4OW5QKzZnUzRDQllMbncwekVTMFdYeHY0SGtjZ0xoLzFHK0VYMVJOcEQ0d0tpZ1hILzZyNS9mTnU3bFRwaitadTVoSG9YT3RMNzFieXIvUXA5MUw2NHY2T0JPNEpvUTV6RXNrVStoVTFGaVFWZVJQN0VXZ1A0UXIwQklUK3RQaWQ5QzN5MXZDaDhGRHhKdksyOHZ2eXkvTEE4cEx6VS9YUDk1djZ4dnc0L3VEL1JBSzJCU2tLY2c2QkVTY1RaQk1lRXFrUFRReGpDS0VFVndGaS9udjdoL2hwOWFEeUF2SFA4TWZ4THZNKzlQWDB1UFcxOWcvNExmcjcvQzRBS2dOYUJYUUd5d2IwQmhJSFdRZldCMW9JekFqdENGOElId2R0QmFrRFZ3S0xBZVlBOHY5dy9rajgxL25ROTR2MjkvWFg5YnoxYlBVWTlVejFaL2FIK0hyN3lQNE1BaTRGK3djZkNuWUxOZ3lmRFBzTVN3MHNEVUFNZmdyY0I1SUVNd0ZiL2lYOFQvcFQrTy8xWC9NZjhjYnZyTysxOE1MeXZmVlArUmY5d2dBb0JDRUhwd25JQzVFTjRRNUFEM3dPMUF5MENwc0l2d2J2Qk5jQ2JRQXIvblg4T2ZzZit2YjRtdmRhOXJqMXovV1g5cEwzYS9oSCtaWDZSL3duL3ZQL2VRRVNBL0FFK3dZRENjd0tGQXlQRENrTUZRdVNDZTRIVlFiU0JIUURDd0k4QU5MOUpQdVkrSFgyOHZUcTgyUHpkUE1WOUF6MU1mWjQ5ekQ1Z2Z0eC9zUUJCUVhMQjhjSi9ncXBDdzhNaWd3V0RYRU5YUTJyRERVTDdRZ0RCc3dDZHY4Uy9LNzRXUFZrOGhYd291NFA3bXZ1MSs5VDhwejFVdmxpL1pvQndnV1JDY3NNUGcvQ0VFUVI0UkRBRHdvTzl3dXNDVk1INEFSU0Fwbi91ZnpkK1dqM2J2WDc4eHp6eC9MNjhxenoxdlNEOXFYNEdmdmQvYzBBaHdPL0JXd0htZ2h2Q1FFS1ZRb25DbHNKQ3dpSUJoMEYwZ09nQW0wQk93QXgvMDMrWFAwZy9MYjZjUG1YK0YvNHZmaCsrVEg2cy9vcys3LzdjdndML1p6OVhQNU8vM0lBM0FGOUF6c0Y5Z2FVQ0FBS0hndWVDemNMOXdudEIzc0Y0d0l6QUkzOTZmcDErR3YySXZXbjlOMzBwL1hpOW03NEcvcnUrOVA5ay84YUFZRUMxQU1UQlNJRzB3WXVCMWdIa2djQUNHRUlTQWhUQnpFRldBS3QvNUw5MmZ1VSt2WDUwZm1mK1NQNWkvZ2IrQmY0bXZpditTcjdrdnliL1VqK3IvNFgvOHIvK2dDaUFvMEVVQWFSQnp3SVN3anFCM0lIR1FmQ0J2OEZwZ1RNQXBRQUtmNjcrNW41L3ZmbjlqejJ5UFZuOVNMMVJQWHE5U1AzRHZtcis2ZitzUUdLQkFjSCt3aE9DaDBMYXdzM0MyOEtMQW1EQjVBRmZRTm9BVlAvWnYzZSs3UDZzZm5MK0N2NHZQZU05NWIzN2ZlVitKbjUxUG9xL0xMOW12K1lBVllEM2dRdUJtY0hTQWlrQ0lFSTdBZitCdUVGbmdRWEExc0J2Lzl2L3BmOU1QM1cvRmo4cS9zUis2SDZVL28zK21QNnkvcE4rL2Y3eHZ5ZS9XSCtKZjltQUQ0Q1FBUUpCaXNIdGdmNkJ3MEk4UWRzQjFzR3l3VDRBZ2dCQ1Avby9LWDZtUGcxOTU3MmpmYXo5dWYyUy9jTStFMzVFL3RXL2FmLzV3SDFBOEFGS2dma0IvQUhnd2Z4QmxBR2dRVklCTU1DSndHcy80Myt2UDBpL1pyOExmemwrOUg3NmZ2aSs5Zjc1ZnNmL0luOEJQMTAvZWo5Y2Y0Ty83Zi9kQUFjQWFVQkVnS01BaGdEcEFNRUJDRUVEd1RmQTNJRHhRTDhBU29CVXdDRy84NytKLzZoL1JyOXBQeGsvR2I4b1B3Si9YSDl3LzM5L1VEK3FQNDEvOUQvV3dEZUFHc0JBZ0tkQWhFRFFRTkFBMHNEYndPVkE1WURWd1BPQWhnQ1ZBR1JBQT09Jyxcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2FtcGxlc1xuIiwiLypcblxuXG5UaGlzIGNvZGUgaXMgYmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL3NlcmdpL2pzbWlkaVxuXG5pbmZvOiBodHRwOi8vd3d3LmRlbHVnZS5jby8/cT1taWRpLXRlbXBvLWJwbVxuXG4qL1xuXG5cbmltcG9ydCB7c2F2ZUFzfSBmcm9tICdmaWxlc2F2ZXJqcydcblxubGV0IFBQUSA9IDk2MFxubGV0IEhEUl9QUFEgPSBzdHIyQnl0ZXMoUFBRLnRvU3RyaW5nKDE2KSwgMilcblxuY29uc3QgSERSX0NIVU5LSUQgPSBbXG4gICdNJy5jaGFyQ29kZUF0KDApLFxuICAnVCcuY2hhckNvZGVBdCgwKSxcbiAgJ2gnLmNoYXJDb2RlQXQoMCksXG4gICdkJy5jaGFyQ29kZUF0KDApXG5dXG5jb25zdCBIRFJfQ0hVTktfU0laRSA9IFsweDAsIDB4MCwgMHgwLCAweDZdIC8vIEhlYWRlciBzaXplIGZvciBTTUZcbmNvbnN0IEhEUl9UWVBFMCA9IFsweDAsIDB4MF0gLy8gTWlkaSBUeXBlIDAgaWRcbmNvbnN0IEhEUl9UWVBFMSA9IFsweDAsIDB4MV0gLy8gTWlkaSBUeXBlIDEgaWRcbi8vSERSX1BQUSA9IFsweDAxLCAweEUwXSAvLyBEZWZhdWx0cyB0byA0ODAgdGlja3MgcGVyIGJlYXRcbi8vSERSX1BQUSA9IFsweDAwLCAweDgwXSAvLyBEZWZhdWx0cyB0byAxMjggdGlja3MgcGVyIGJlYXRcblxuY29uc3QgVFJLX0NIVU5LSUQgPSBbXG4gICdNJy5jaGFyQ29kZUF0KDApLFxuICAnVCcuY2hhckNvZGVBdCgwKSxcbiAgJ3InLmNoYXJDb2RlQXQoMCksXG4gICdrJy5jaGFyQ29kZUF0KDApXG5dXG5cbi8vIE1ldGEgZXZlbnQgY29kZXNcbmNvbnN0IE1FVEFfU0VRVUVOQ0UgPSAweDAwXG5jb25zdCBNRVRBX1RFWFQgPSAweDAxXG5jb25zdCBNRVRBX0NPUFlSSUdIVCA9IDB4MDJcbmNvbnN0IE1FVEFfVFJBQ0tfTkFNRSA9IDB4MDNcbmNvbnN0IE1FVEFfSU5TVFJVTUVOVCA9IDB4MDRcbmNvbnN0IE1FVEFfTFlSSUMgPSAweDA1XG5jb25zdCBNRVRBX01BUktFUiA9IDB4MDZcbmNvbnN0IE1FVEFfQ1VFX1BPSU5UID0gMHgwN1xuY29uc3QgTUVUQV9DSEFOTkVMX1BSRUZJWCA9IDB4MjBcbmNvbnN0IE1FVEFfRU5EX09GX1RSQUNLID0gMHgyZlxuY29uc3QgTUVUQV9URU1QTyA9IDB4NTFcbmNvbnN0IE1FVEFfU01QVEUgPSAweDU0XG5jb25zdCBNRVRBX1RJTUVfU0lHID0gMHg1OFxuY29uc3QgTUVUQV9LRVlfU0lHID0gMHg1OVxuY29uc3QgTUVUQV9TRVFfRVZFTlQgPSAweDdmXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVBc01JRElGaWxlKHNvbmcsIGZpbGVOYW1lID0gc29uZy5uYW1lLCBwcHEgPSA5NjApIHtcblxuICBQUFEgPSBwcHFcbiAgSERSX1BQUSA9IHN0cjJCeXRlcyhQUFEudG9TdHJpbmcoMTYpLCAyKVxuXG4gIGxldCBieXRlQXJyYXkgPSBbXS5jb25jYXQoSERSX0NIVU5LSUQsIEhEUl9DSFVOS19TSVpFLCBIRFJfVFlQRTEpXG4gIGxldCB0cmFja3MgPSBzb25nLmdldFRyYWNrcygpXG4gIGxldCBudW1UcmFja3MgPSB0cmFja3MubGVuZ3RoICsgMVxuICBsZXQgaSwgbWF4aSwgdHJhY2ssIG1pZGlGaWxlLCBkZXN0aW5hdGlvbiwgYjY0XG4gIGxldCBhcnJheUJ1ZmZlciwgZGF0YVZpZXcsIHVpbnRBcnJheVxuXG4gIGJ5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQoc3RyMkJ5dGVzKG51bVRyYWNrcy50b1N0cmluZygxNiksIDIpLCBIRFJfUFBRKVxuXG4gIC8vY29uc29sZS5sb2coYnl0ZUFycmF5KTtcbiAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdCh0cmFja1RvQnl0ZXMoc29uZy5fdGltZUV2ZW50cywgc29uZy5fZHVyYXRpb25UaWNrcywgJ3RlbXBvJykpXG5cbiAgZm9yKGkgPSAwLCBtYXhpID0gdHJhY2tzLmxlbmd0aDsgaSA8IG1heGk7IGkrKyl7XG4gICAgdHJhY2sgPSB0cmFja3NbaV07XG4gICAgbGV0IGluc3RydW1lbnRcbiAgICBpZih0cmFjay5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICBpbnN0cnVtZW50ID0gdHJhY2suX2luc3RydW1lbnQuaWRcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCB0cmFjay5fZXZlbnRzLmxlbmd0aCwgaW5zdHJ1bWVudClcbiAgICBieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHRyYWNrVG9CeXRlcyh0cmFjay5fZXZlbnRzLCBzb25nLl9kdXJhdGlvblRpY2tzLCB0cmFjay5uYW1lLCBpbnN0cnVtZW50KSlcbiAgICAvL2J5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQodHJhY2tUb0J5dGVzKHRyYWNrLl9ldmVudHMsIHNvbmcuX2xhc3RFdmVudC5pY2tzLCB0cmFjay5uYW1lLCBpbnN0cnVtZW50KSlcbiAgfVxuXG4gIC8vYjY0ID0gYnRvYShjb2RlczJTdHIoYnl0ZUFycmF5KSlcbiAgLy93aW5kb3cubG9jYXRpb24uYXNzaWduKFwiZGF0YTphdWRpby9taWRpO2Jhc2U2NCxcIiArIGI2NClcbiAgLy9jb25zb2xlLmxvZyhiNjQpLy8gc2VuZCB0byBzZXJ2ZXJcblxuICBtYXhpID0gYnl0ZUFycmF5Lmxlbmd0aFxuICBhcnJheUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihtYXhpKVxuICB1aW50QXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcilcbiAgZm9yKGkgPSAwOyBpIDwgbWF4aTsgaSsrKXtcbiAgICB1aW50QXJyYXlbaV0gPSBieXRlQXJyYXlbaV1cbiAgfVxuICBtaWRpRmlsZSA9IG5ldyBCbG9iKFt1aW50QXJyYXldLCB7dHlwZTogJ2FwcGxpY2F0aW9uL3gtbWlkaScsIGVuZGluZ3M6ICd0cmFuc3BhcmVudCd9KVxuICBmaWxlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL1xcLm1pZGkkLywgJycpXG4gIC8vbGV0IHBhdHQgPSAvXFwubWlkW2ldezAsMX0kL1xuICBsZXQgcGF0dCA9IC9cXC5taWQkL1xuICBsZXQgaGFzRXh0ZW5zaW9uID0gcGF0dC50ZXN0KGZpbGVOYW1lKVxuICBpZihoYXNFeHRlbnNpb24gPT09IGZhbHNlKXtcbiAgICBmaWxlTmFtZSArPSAnLm1pZCdcbiAgfVxuICAvL2NvbnNvbGUubG9nKGZpbGVOYW1lLCBoYXNFeHRlbnNpb24pXG4gIHNhdmVBcyhtaWRpRmlsZSwgZmlsZU5hbWUpXG4gIC8vd2luZG93LmxvY2F0aW9uLmFzc2lnbih3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChtaWRpRmlsZSkpXG59XG5cblxuZnVuY3Rpb24gdHJhY2tUb0J5dGVzKGV2ZW50cywgbGFzdEV2ZW50VGlja3MsIHRyYWNrTmFtZSwgaW5zdHJ1bWVudE5hbWUgPSAnbm8gaW5zdHJ1bWVudCcpe1xuICB2YXIgbGVuZ3RoQnl0ZXMsXG4gICAgaSwgbWF4aSwgZXZlbnQsIHN0YXR1cyxcbiAgICB0cmFja0xlbmd0aCwgLy8gbnVtYmVyIG9mIGJ5dGVzIGluIHRyYWNrIGNodW5rXG4gICAgdGlja3MgPSAwLFxuICAgIGRlbHRhID0gMCxcbiAgICB0cmFja0J5dGVzID0gW107XG5cbiAgaWYodHJhY2tOYW1lKXtcbiAgICB0cmFja0J5dGVzLnB1c2goMHgwMCk7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAzKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKHRyYWNrTmFtZS5sZW5ndGgpKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoc3RyaW5nVG9OdW1BcnJheSh0cmFja05hbWUpKTtcbiAgfVxuXG4gIGlmKGluc3RydW1lbnROYW1lKXtcbiAgICB0cmFja0J5dGVzLnB1c2goMHgwMCk7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDA0KTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKGluc3RydW1lbnROYW1lLmxlbmd0aCkpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHJpbmdUb051bUFycmF5KGluc3RydW1lbnROYW1lKSk7XG4gIH1cblxuICBmb3IoaSA9IDAsIG1heGkgPSBldmVudHMubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKXtcbiAgICBldmVudCA9IGV2ZW50c1tpXTtcbiAgICBkZWx0YSA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gICAgZGVsdGEgPSBjb252ZXJ0VG9WTFEoZGVsdGEpO1xuICAgIC8vY29uc29sZS5sb2coZGVsdGEpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChkZWx0YSk7XG4gICAgLy90cmFja0J5dGVzLnB1c2guYXBwbHkodHJhY2tCeXRlcywgZGVsdGEpO1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDB4ODAgfHwgZXZlbnQudHlwZSA9PT0gMHg5MCl7IC8vIG5vdGUgb2ZmLCBub3RlIG9uXG4gICAgICAvL3N0YXR1cyA9IHBhcnNlSW50KGV2ZW50LnR5cGUudG9TdHJpbmcoMTYpICsgZXZlbnQuY2hhbm5lbC50b1N0cmluZygxNiksIDE2KTtcbiAgICAgIHN0YXR1cyA9IGV2ZW50LnR5cGUgKyAoZXZlbnQuY2hhbm5lbCB8fCAwKVxuICAgICAgdHJhY2tCeXRlcy5wdXNoKHN0YXR1cyk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQuZGF0YTEpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKGV2ZW50LmRhdGEyKTtcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAweDUxKXsgLy8gdGVtcG9cbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDUxKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDAzKTsvLyBsZW5ndGhcbiAgICAgIC8vdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUSgzKSk7Ly8gbGVuZ3RoXG4gICAgICB2YXIgbWljcm9TZWNvbmRzID0gTWF0aC5yb3VuZCg2MDAwMDAwMCAvIGV2ZW50LmJwbSk7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJwbSlcbiAgICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHIyQnl0ZXMobWljcm9TZWNvbmRzLnRvU3RyaW5nKDE2KSwgMykpO1xuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDB4NTgpeyAvLyB0aW1lIHNpZ25hdHVyZVxuICAgICAgdmFyIGRlbm9tID0gZXZlbnQuZGVub21pbmF0b3I7XG4gICAgICBpZihkZW5vbSA9PT0gMil7XG4gICAgICAgIGRlbm9tID0gMHgwMTtcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSA0KXtcbiAgICAgICAgZGVub20gPSAweDAyO1xuICAgICAgfWVsc2UgaWYoZGVub20gPT09IDgpe1xuICAgICAgICBkZW5vbSA9IDB4MDM7XG4gICAgICB9ZWxzZSBpZihkZW5vbSA9PT0gMTYpe1xuICAgICAgICBkZW5vbSA9IDB4MDQ7XG4gICAgICB9ZWxzZSBpZihkZW5vbSA9PT0gMzIpe1xuICAgICAgICBkZW5vbSA9IDB4MDU7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRlbm9taW5hdG9yLCBldmVudC5ub21pbmF0b3IpXG4gICAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHg1OCk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHgwNCk7Ly8gbGVuZ3RoXG4gICAgICAvL3RyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoNCkpOy8vIGxlbmd0aFxuICAgICAgdHJhY2tCeXRlcy5wdXNoKGV2ZW50Lm5vbWluYXRvcik7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZGVub20pO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKFBQUSAvIGV2ZW50Lm5vbWluYXRvcik7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHgwOCk7IC8vIDMybmQgbm90ZXMgcGVyIGNyb3RjaGV0XG4gICAgICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgZXZlbnQubm9taW5hdG9yLCBldmVudC5kZW5vbWluYXRvciwgZGVub20sIFBQUS9ldmVudC5ub21pbmF0b3IpO1xuICAgIH1cbiAgICAvLyBzZXQgdGhlIG5ldyB0aWNrcyByZWZlcmVuY2VcbiAgICAvL2NvbnNvbGUubG9nKHN0YXR1cywgZXZlbnQudGlja3MsIHRpY2tzKTtcbiAgICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIGRlbHRhID0gbGFzdEV2ZW50VGlja3MgLSB0aWNrcztcbiAgLy9jb25zb2xlLmxvZygnZCcsIGRlbHRhLCAndCcsIHRpY2tzLCAnbCcsIGxhc3RFdmVudFRpY2tzKTtcbiAgZGVsdGEgPSBjb252ZXJ0VG9WTFEoZGVsdGEpO1xuICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgdGlja3MsIGRlbHRhKTtcbiAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGRlbHRhKTtcbiAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICB0cmFja0J5dGVzLnB1c2goMHgyRik7XG4gIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgLy9jb25zb2xlLmxvZyh0cmFja05hbWUsIHRyYWNrQnl0ZXMpO1xuICB0cmFja0xlbmd0aCA9IHRyYWNrQnl0ZXMubGVuZ3RoO1xuICBsZW5ndGhCeXRlcyA9IHN0cjJCeXRlcyh0cmFja0xlbmd0aC50b1N0cmluZygxNiksIDQpO1xuICByZXR1cm4gW10uY29uY2F0KFRSS19DSFVOS0lELCBsZW5ndGhCeXRlcywgdHJhY2tCeXRlcyk7XG59XG5cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuXG4vKlxuICogQ29udmVydHMgYW4gYXJyYXkgb2YgYnl0ZXMgdG8gYSBzdHJpbmcgb2YgaGV4YWRlY2ltYWwgY2hhcmFjdGVycy4gUHJlcGFyZXNcbiAqIGl0IHRvIGJlIGNvbnZlcnRlZCBpbnRvIGEgYmFzZTY0IHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gYnl0ZUFycmF5IHtBcnJheX0gYXJyYXkgb2YgYnl0ZXMgdGhhdCB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZ1xuICogQHJldHVybnMgaGV4YWRlY2ltYWwgc3RyaW5nXG4gKi9cblxuZnVuY3Rpb24gY29kZXMyU3RyKGJ5dGVBcnJheSkge1xuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBieXRlQXJyYXkpO1xufVxuXG4vKlxuICogQ29udmVydHMgYSBTdHJpbmcgb2YgaGV4YWRlY2ltYWwgdmFsdWVzIHRvIGFuIGFycmF5IG9mIGJ5dGVzLiBJdCBjYW4gYWxzb1xuICogYWRkIHJlbWFpbmluZyAnMCcgbmliYmxlcyBpbiBvcmRlciB0byBoYXZlIGVub3VnaCBieXRlcyBpbiB0aGUgYXJyYXkgYXMgdGhlXG4gKiB8ZmluYWxCeXRlc3wgcGFyYW1ldGVyLlxuICpcbiAqIEBwYXJhbSBzdHIge1N0cmluZ30gc3RyaW5nIG9mIGhleGFkZWNpbWFsIHZhbHVlcyBlLmcuICcwOTdCOEEnXG4gKiBAcGFyYW0gZmluYWxCeXRlcyB7SW50ZWdlcn0gT3B0aW9uYWwuIFRoZSBkZXNpcmVkIG51bWJlciBvZiBieXRlcyB0aGF0IHRoZSByZXR1cm5lZCBhcnJheSBzaG91bGQgY29udGFpblxuICogQHJldHVybnMgYXJyYXkgb2YgbmliYmxlcy5cbiAqL1xuXG5mdW5jdGlvbiBzdHIyQnl0ZXMoc3RyLCBmaW5hbEJ5dGVzKSB7XG4gIGlmIChmaW5hbEJ5dGVzKSB7XG4gICAgd2hpbGUgKChzdHIubGVuZ3RoIC8gMikgPCBmaW5hbEJ5dGVzKSB7XG4gICAgICBzdHIgPSAnMCcgKyBzdHI7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJ5dGVzID0gW107XG4gIGZvciAodmFyIGkgPSBzdHIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDIpIHtcbiAgICB2YXIgY2hhcnMgPSBpID09PSAwID8gc3RyW2ldIDogc3RyW2kgLSAxXSArIHN0cltpXTtcbiAgICBieXRlcy51bnNoaWZ0KHBhcnNlSW50KGNoYXJzLCAxNikpO1xuICB9XG5cbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG5cbi8qKlxuICogVHJhbnNsYXRlcyBudW1iZXIgb2YgdGlja3MgdG8gTUlESSB0aW1lc3RhbXAgZm9ybWF0LCByZXR1cm5pbmcgYW4gYXJyYXkgb2ZcbiAqIGJ5dGVzIHdpdGggdGhlIHRpbWUgdmFsdWVzLiBNaWRpIGhhcyBhIHZlcnkgcGFydGljdWxhciB0aW1lIHRvIGV4cHJlc3MgdGltZSxcbiAqIHRha2UgYSBnb29kIGxvb2sgYXQgdGhlIHNwZWMgYmVmb3JlIGV2ZXIgdG91Y2hpbmcgdGhpcyBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gdGlja3Mge0ludGVnZXJ9IE51bWJlciBvZiB0aWNrcyB0byBiZSB0cmFuc2xhdGVkXG4gKiBAcmV0dXJucyBBcnJheSBvZiBieXRlcyB0aGF0IGZvcm0gdGhlIE1JREkgdGltZSB2YWx1ZVxuICovXG5mdW5jdGlvbiBjb252ZXJ0VG9WTFEodGlja3MpIHtcbiAgdmFyIGJ1ZmZlciA9IHRpY2tzICYgMHg3RjtcblxuICB3aGlsZSh0aWNrcyA9IHRpY2tzID4+IDcpIHtcbiAgICBidWZmZXIgPDw9IDg7XG4gICAgYnVmZmVyIHw9ICgodGlja3MgJiAweDdGKSB8IDB4ODApO1xuICB9XG5cbiAgdmFyIGJMaXN0ID0gW107XG4gIHdoaWxlKHRydWUpIHtcbiAgICBiTGlzdC5wdXNoKGJ1ZmZlciAmIDB4ZmYpO1xuXG4gICAgaWYgKGJ1ZmZlciAmIDB4ODApIHtcbiAgICAgIGJ1ZmZlciA+Pj0gODtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyh0aWNrcywgYkxpc3QpO1xuICByZXR1cm4gYkxpc3Q7XG59XG5cblxuLypcbiAqIENvbnZlcnRzIGEgc3RyaW5nIGludG8gYW4gYXJyYXkgb2YgQVNDSUkgY2hhciBjb2RlcyBmb3IgZXZlcnkgY2hhcmFjdGVyIG9mXG4gKiB0aGUgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBzdHIge1N0cmluZ30gU3RyaW5nIHRvIGJlIGNvbnZlcnRlZFxuICogQHJldHVybnMgYXJyYXkgd2l0aCB0aGUgY2hhcmNvZGUgdmFsdWVzIG9mIHRoZSBzdHJpbmdcbiAqL1xuY29uc3QgQVAgPSBBcnJheS5wcm90b3R5cGVcbmZ1bmN0aW9uIHN0cmluZ1RvTnVtQXJyYXkoc3RyKSB7XG4gIC8vIHJldHVybiBzdHIuc3BsaXQoKS5mb3JFYWNoKGNoYXIgPT4ge1xuICAvLyAgIHJldHVybiBjaGFyLmNoYXJDb2RlQXQoMClcbiAgLy8gfSlcbiAgcmV0dXJuIEFQLm1hcC5jYWxsKHN0ciwgZnVuY3Rpb24oY2hhcikge1xuICAgIHJldHVybiBjaGFyLmNoYXJDb2RlQXQoMClcbiAgfSlcbn1cbiIsImltcG9ydCB7Z2V0TUlESU91dHB1dEJ5SWQsIGdldE1JRElPdXRwdXRzfSBmcm9tICcuL2luaXRfbWlkaSdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7YnVmZmVyVGltZX0gZnJvbSAnLi9zZXR0aW5ncycgLy8gbWlsbGlzXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCcgLy8gbWlsbGlzXG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZWR1bGVye1xuXG4gIGNvbnN0cnVjdG9yKHNvbmcpe1xuICAgIHRoaXMuc29uZyA9IHNvbmdcbiAgICB0aGlzLm5vdGVzID0gbmV3IE1hcCgpXG4gIH1cblxuXG4gIGluaXQobWlsbGlzKXtcbiAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gbWlsbGlzXG4gICAgdGhpcy5zb25nU3RhcnRNaWxsaXMgPSBtaWxsaXNcbiAgICB0aGlzLmV2ZW50cyA9IHRoaXMuc29uZy5fYWxsRXZlbnRzXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLmluZGV4ID0gMFxuICAgIHRoaXMubWF4dGltZSA9IDBcbiAgICB0aGlzLnByZXZNYXh0aW1lID0gMFxuICAgIHRoaXMuYmV5b25kTG9vcCA9IGZhbHNlIC8vIHRlbGxzIHVzIGlmIHRoZSBwbGF5aGVhZCBoYXMgYWxyZWFkeSBwYXNzZWQgdGhlIGxvb3BlZCBzZWN0aW9uXG4gICAgdGhpcy5wcmVjb3VudGluZ0RvbmUgPSBmYWxzZVxuICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gIH1cblxuICBzZXRUaW1lU3RhbXAodGltZVN0YW1wKXtcbiAgICB0aGlzLnRpbWVTdGFtcCA9IHRpbWVTdGFtcFxuICB9XG5cbiAgLy8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgZXZlbnQgdGhhdCBoYXMgaXRzIG1pbGxpcyB2YWx1ZSBhdCBvciByaWdodCBhZnRlciB0aGUgcHJvdmlkZWQgbWlsbGlzIHZhbHVlXG4gIHNldEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwXG4gICAgbGV0IGV2ZW50XG4gICAgZm9yKGV2ZW50IG9mIHRoaXMuZXZlbnRzKXtcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpe1xuICAgICAgICB0aGlzLmluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgdGhpcy5iZXlvbmRMb29wID0gbWlsbGlzID4gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgLy8gdGhpcy5ub3RlcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMubG9vcGVkID0gZmFsc2VcbiAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlXG4gIH1cblxuXG4gIGdldEV2ZW50cygpe1xuICAgIGxldCBldmVudHMgPSBbXVxuXG4gICAgaWYodGhpcy5zb25nLl9sb29wID09PSB0cnVlICYmIHRoaXMuc29uZy5fbG9vcER1cmF0aW9uIDwgYnVmZmVyVGltZSl7XG4gICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdTdGFydE1pbGxpcyArIHRoaXMuc29uZy5fbG9vcER1cmF0aW9uIC0gMVxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLm1heHRpbWUsIHRoaXMuc29uZy5sb29wRHVyYXRpb24pO1xuICAgIH1cblxuICAgIGlmKHRoaXMuc29uZy5fbG9vcCA9PT0gdHJ1ZSl7XG5cbiAgICAgIGlmKHRoaXMubWF4dGltZSA+PSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMgJiYgdGhpcy5iZXlvbmRMb29wID09PSBmYWxzZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ0xPT1AnLCB0aGlzLm1heHRpbWUsIHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcylcblxuICAgICAgICBsZXQgZGlmZiA9IHRoaXMubWF4dGltZSAtIHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmcuX2xlZnRMb2NhdG9yLm1pbGxpcyArIGRpZmZcblxuICAgICAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tTE9PUEVEJywgdGhpcy5tYXh0aW1lLCBkaWZmLCB0aGlzLnNvbmcuX2xlZnRMb2NhdG9yLm1pbGxpcywgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKTtcblxuICAgICAgICBpZih0aGlzLmxvb3BlZCA9PT0gZmFsc2Upe1xuICAgICAgICAgIHRoaXMubG9vcGVkID0gdHJ1ZTtcbiAgICAgICAgICBsZXQgbGVmdE1pbGxpcyA9IHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzXG4gICAgICAgICAgbGV0IHJpZ2h0TWlsbGlzID0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG5cbiAgICAgICAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICAgICAgICBsZXQgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgICAgICBpZihldmVudC5taWxsaXMgPCByaWdodE1pbGxpcyl7XG4gICAgICAgICAgICAgIGV2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzXG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KVxuXG4gICAgICAgICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3Rlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkLCBldmVudC50eXBlKVxuICAgICAgICAgICAgICB0aGlzLmluZGV4KytcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgbm90ZXMtPiBhZGQgYSBuZXcgbm90ZSBvZmYgZXZlbnQgYXQgdGhlIHBvc2l0aW9uIG9mIHRoZSByaWdodCBsb2NhdG9yIChlbmQgb2YgdGhlIGxvb3ApXG4gICAgICAgICAgbGV0IGVuZFRpY2tzID0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IudGlja3MgLSAxXG4gICAgICAgICAgbGV0IGVuZE1pbGxpcyA9IHRoaXMuc29uZy5jYWxjdWxhdGVQb3NpdGlvbih7dHlwZTogJ3RpY2tzJywgdGFyZ2V0OiBlbmRUaWNrcywgcmVzdWx0OiAnbWlsbGlzJ30pLm1pbGxpc1xuXG4gICAgICAgICAgZm9yKGxldCBub3RlIG9mIHRoaXMubm90ZXMudmFsdWVzKCkpe1xuICAgICAgICAgICAgbGV0IG5vdGVPbiA9IG5vdGUubm90ZU9uXG4gICAgICAgICAgICBsZXQgbm90ZU9mZiA9IG5vdGUubm90ZU9mZlxuICAgICAgICAgICAgaWYobm90ZU9mZi5taWxsaXMgPD0gcmlnaHRNaWxsaXMpe1xuICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGV2ZW50ID0gbmV3IE1JRElFdmVudChlbmRUaWNrcywgMTI4LCBub3RlT24uZGF0YTEsIDApXG4gICAgICAgICAgICBldmVudC5taWxsaXMgPSBlbmRNaWxsaXNcbiAgICAgICAgICAgIGV2ZW50Ll9wYXJ0ID0gbm90ZU9uLl9wYXJ0XG4gICAgICAgICAgICBldmVudC5fdHJhY2sgPSBub3RlT24uX3RyYWNrXG4gICAgICAgICAgICBldmVudC5taWRpTm90ZSA9IG5vdGVcbiAgICAgICAgICAgIGV2ZW50Lm1pZGlOb3RlSWQgPSBub3RlLmlkXG4gICAgICAgICAgICBldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpc1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnYWRkZWQnLCBldmVudClcbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgICAgIH1cblxuLypcbiAgICAgICAgICAvLyBzdG9wIG92ZXJmbG93aW5nIGF1ZGlvIHNhbXBsZXNcbiAgICAgICAgICBmb3IoaSBpbiB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzKXtcbiAgICAgICAgICAgIGlmKHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHMuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgICBhdWRpb0V2ZW50ID0gdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50c1tpXTtcbiAgICAgICAgICAgICAgaWYoYXVkaW9FdmVudC5lbmRNaWxsaXMgPiB0aGlzLnNvbmcubG9vcEVuZCl7XG4gICAgICAgICAgICAgICAgYXVkaW9FdmVudC5zdG9wU2FtcGxlKHRoaXMuc29uZy5sb29wRW5kLzEwMDApO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3BwaW5nIGF1ZGlvIGV2ZW50JywgaSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4qL1xuICAgICAgICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICAgICAgICB0aGlzLnNldEluZGV4KGxlZnRNaWxsaXMpXG4gICAgICAgICAgdGhpcy50aW1lU3RhbXAgKz0gdGhpcy5zb25nLl9sb29wRHVyYXRpb25cbiAgICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzIC09IHRoaXMuc29uZy5fbG9vcER1cmF0aW9uXG5cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50cy5sZW5ndGgpXG5cbiAgICAgICAgICAvLyBnZXQgdGhlIGF1ZGlvIGV2ZW50cyB0aGF0IHN0YXJ0IGJlZm9yZSBzb25nLmxvb3BTdGFydFxuICAgICAgICAgIC8vdGhpcy5nZXREYW5nbGluZ0F1ZGlvRXZlbnRzKHRoaXMuc29uZy5sb29wU3RhcnQsIGV2ZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmxvb3BlZCA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZygnc2NoZWR1bGVyJywgdGhpcy5sb29wZWQpXG5cbiAgICAvLyBtYWluIGxvb3BcbiAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBsZXQgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCB0aGlzLm1heHRpbWUpXG4gICAgICBpZihldmVudC5taWxsaXMgPCB0aGlzLm1heHRpbWUpe1xuXG4gICAgICAgIC8vZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG5cbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJyl7XG4gICAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZXZlbnQudGltZSA9ICh0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKVxuICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBldmVudHM7XG4gIH1cblxuXG4gIHVwZGF0ZShkaWZmKXtcbiAgICB2YXIgaSxcbiAgICAgIGV2ZW50LFxuICAgICAgbnVtRXZlbnRzLFxuICAgICAgdHJhY2ssXG4gICAgICBldmVudHNcblxuICAgIHRoaXMucHJldk1heHRpbWUgPSB0aGlzLm1heHRpbWVcblxuICAgIGlmKHRoaXMuc29uZy5wcmVjb3VudGluZyl7XG4gICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyBidWZmZXJUaW1lXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMpXG4gICAgICBldmVudHMgPSB0aGlzLnNvbmcuX21ldHJvbm9tZS5nZXRQcmVjb3VudEV2ZW50cyh0aGlzLm1heHRpbWUpXG5cbiAgICAgIC8vIGlmKGV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAgIC8vICAgY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50cylcbiAgICAgIC8vIH1cblxuICAgICAgaWYodGhpcy5tYXh0aW1lID4gdGhpcy5zb25nLl9tZXRyb25vbWUuZW5kTWlsbGlzICYmIHRoaXMucHJlY291bnRpbmdEb25lID09PSBmYWxzZSl7XG4gICAgICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gdHJ1ZVxuICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX3ByZWNvdW50RHVyYXRpb25cblxuICAgICAgICAvLyBzdGFydCBzY2hlZHVsaW5nIGV2ZW50cyBvZiB0aGUgc29uZyAtPiBhZGQgdGhlIGZpcnN0IGV2ZW50cyBvZiB0aGUgc29uZ1xuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCB0aGlzLnNvbmdDdXJyZW50TWlsbGlzKVxuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIGJ1ZmZlclRpbWVcbiAgICAgICAgZXZlbnRzLnB1c2goLi4udGhpcy5nZXRFdmVudHMoKSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudHMpXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyBidWZmZXJUaW1lXG4gICAgICBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpXG4gICAgICAvL2V2ZW50cyA9IHRoaXMuc29uZy5fZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAgIC8vZXZlbnRzID0gdGhpcy5nZXRFdmVudHMyKHRoaXMubWF4dGltZSwgKHRoaXMudGltZVN0YW1wIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpKVxuICAgICAgLy9jb25zb2xlLmxvZygnZG9uZScsIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMsIGRpZmYsIHRoaXMuaW5kZXgsIGV2ZW50cy5sZW5ndGgpXG4gICAgfVxuXG4gICAgLy8gaWYodGhpcy5zb25nLnVzZU1ldHJvbm9tZSA9PT0gdHJ1ZSl7XG4gICAgLy8gICBsZXQgbWV0cm9ub21lRXZlbnRzID0gdGhpcy5zb25nLl9tZXRyb25vbWUuZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAvLyAgIC8vIGlmKG1ldHJvbm9tZUV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAvLyAgIC8vICAgY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCBtZXRyb25vbWVFdmVudHMpXG4gICAgLy8gICAvLyB9XG4gICAgLy8gICAvLyBtZXRyb25vbWVFdmVudHMuZm9yRWFjaChlID0+IHtcbiAgICAvLyAgIC8vICAgZS50aW1lID0gKHRoaXMudGltZVN0YW1wICsgZS5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgICAvLyAgIC8vIH0pXG4gICAgLy8gICBldmVudHMucHVzaCguLi5tZXRyb25vbWVFdmVudHMpXG4gICAgLy8gfVxuXG4gICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuXG5cbiAgICAvLyBpZihudW1FdmVudHMgPiA1KXtcbiAgICAvLyAgIGNvbnNvbGUubG9nKG51bUV2ZW50cylcbiAgICAvLyB9XG5cbiAgICBmb3IoaSA9IDA7IGkgPCBudW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IGV2ZW50c1tpXVxuICAgICAgdHJhY2sgPSBldmVudC5fdHJhY2tcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCB0aGlzLm1heHRpbWUsIHRoaXMucHJldk1heHRpbWUpXG5cbiAgICAgIC8vIGlmKGV2ZW50Lm1pbGxpcyA+IHRoaXMubWF4dGltZSl7XG4gICAgICAvLyAgIC8vIHNraXAgZXZlbnRzIHRoYXQgd2VyZSBoYXJ2ZXN0IGFjY2lkZW50bHkgd2hpbGUganVtcGluZyB0aGUgcGxheWhlYWQgLT4gc2hvdWxkIGhhcHBlbiB2ZXJ5IHJhcmVseSBpZiBldmVyXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdza2lwJywgZXZlbnQpXG4gICAgICAvLyAgIGNvbnRpbnVlXG4gICAgICAvLyB9XG5cbiAgICAgIGlmKGV2ZW50Ll9wYXJ0ID09PSBudWxsIHx8IHRyYWNrID09PSBudWxsKXtcbiAgICAgICAgY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmKGV2ZW50Ll9wYXJ0Lm11dGVkID09PSB0cnVlIHx8IHRyYWNrLm11dGVkID09PSB0cnVlIHx8IGV2ZW50Lm11dGVkID09PSB0cnVlKXtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvLyB0aGlzIGlzIHVzdWFsbHkgY2F1c2VkIGJ5IHRoZSBzYW1lIG5vdGUgb24gdGhlIHNhbWUgdGlja3MgdmFsdWUsIHdoaWNoIGlzIHByb2JhYmx5IGEgYnVnIGluIHRoZSBtaWRpIGZpbGVcbiAgICAgICAgLy9jb25zb2xlLmluZm8oJ25vIG1pZGlOb3RlSWQnLCBldmVudClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIC8vIC9jb25zb2xlLmxvZyhldmVudC50aWNrcywgZXZlbnQudGltZSwgZXZlbnQubWlsbGlzLCBldmVudC50eXBlLCBldmVudC5fdHJhY2submFtZSlcblxuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJyl7XG4gICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8gY29udmVydCB0byBzZWNvbmRzIGJlY2F1c2UgdGhlIGF1ZGlvIGNvbnRleHQgdXNlcyBzZWNvbmRzIGZvciBzY2hlZHVsaW5nXG4gICAgICAgIHRyYWNrLnByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHRydWUpIC8vIHRydWUgbWVhbnM6IHVzZSBsYXRlbmN5IHRvIGNvbXBlbnNhdGUgdGltaW5nIGZvciBleHRlcm5hbCBNSURJIGRldmljZXMsIHNlZSBUcmFjay5wcm9jZXNzTUlESUV2ZW50XG4gICAgICAgIC8vY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAsIGV2ZW50LnRpbWUsIHRoaXMuaW5kZXgpXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAgICAgdGhpcy5ub3Rlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAgICAgdGhpcy5ub3Rlcy5kZWxldGUoZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgfVxuICAgICAgICAvLyBpZih0aGlzLm5vdGVzLnNpemUgPiAwKXtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLm5vdGVzKVxuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5pbmRleCwgdGhpcy5udW1FdmVudHMpXG4gICAgLy9yZXR1cm4gdGhpcy5pbmRleCA+PSAxMFxuICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubnVtRXZlbnRzIC8vIGxhc3QgZXZlbnQgb2Ygc29uZ1xuICB9XG5cbiAgcmVzY2hlZHVsZSgpe1xuXG4gICAgbGV0IG1pbiA9IHRoaXMuc29uZy5fY3VycmVudE1pbGxpc1xuICAgIGxldCBtYXggPSBtaW4gKyAoYnVmZmVyVGltZSAqIDEwMDApXG5cbiAgICAvL2NvbnNvbGUubG9nKCdyZXNjaGVkdWxlJywgdGhpcy5ub3Rlcy5zaXplKVxuICAgIHRoaXMubm90ZXMuZm9yRWFjaCgobm90ZSwgaWQpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKG5vdGUpXG4gICAgICAvLyBjb25zb2xlLmxvZyhub3RlLm5vdGVPbi5taWxsaXMsIG5vdGUubm90ZU9mZi5taWxsaXMsIG1pbiwgbWF4KVxuXG4gICAgICBpZih0eXBlb2Ygbm90ZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbm90ZS5zdGF0ZSA9PT0gJ3JlbW92ZWQnKXtcbiAgICAgICAgLy9zYW1wbGUudW5zY2hlZHVsZSgwLCB1bnNjaGVkdWxlQ2FsbGJhY2spO1xuICAgICAgICBjb25zb2xlLmxvZygnbm90ZSBpcyB1bmRlZmluZWQnKVxuICAgICAgICAvL3NhbXBsZS5zdG9wKDApXG4gICAgICAgIHRoaXMubm90ZXMuZGVsZXRlKGlkKVxuICAgICAgfWVsc2UgaWYoKG5vdGUubm90ZU9uLm1pbGxpcyA+PSBtaW4gJiYgbm90ZS5ub3RlT2ZmLm1pbGxpcyA8IG1heCkgPT09IGZhbHNlKXtcbiAgICAgICAgLy9zYW1wbGUuc3RvcCgwKVxuICAgICAgICBsZXQgbm90ZU9uID0gbm90ZS5ub3RlT25cbiAgICAgICAgbGV0IG5vdGVPZmYgPSBuZXcgTUlESUV2ZW50KDAsIDEyOCwgbm90ZU9uLmRhdGExLCAwKVxuICAgICAgICBub3RlT2ZmLm1pZGlOb3RlSWQgPSBub3RlLmlkXG4gICAgICAgIG5vdGVPZmYudGltZSA9IDAvL2NvbnRleHQuY3VycmVudFRpbWUgKyBtaW5cbiAgICAgICAgbm90ZS5fdHJhY2sucHJvY2Vzc01JRElFdmVudChub3RlT2ZmKVxuICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShpZClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbi8qXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgbGV0IHRpbWVTdGFtcCA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgbGV0IG91dHB1dHMgPSBnZXRNSURJT3V0cHV0cygpXG4gICAgb3V0cHV0cy5mb3JFYWNoKChvdXRwdXQpID0+IHtcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXApIC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgIH0pXG4gIH1cbiovXG59XG5cblxuLypcblxuICBnZXRFdmVudHMyKG1heHRpbWUsIHRpbWVzdGFtcCl7XG4gICAgbGV0IGxvb3AgPSB0cnVlXG4gICAgbGV0IGV2ZW50XG4gICAgbGV0IHJlc3VsdCA9IFtdXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnRpbWVFdmVudHNJbmRleCwgdGhpcy5zb25nRXZlbnRzSW5kZXgsIHRoaXMubWV0cm9ub21lRXZlbnRzSW5kZXgpXG4gICAgd2hpbGUobG9vcCl7XG5cbiAgICAgIGxldCBzdG9wID0gZmFsc2VcblxuICAgICAgaWYodGhpcy50aW1lRXZlbnRzSW5kZXggPCB0aGlzLm51bVRpbWVFdmVudHMpe1xuICAgICAgICBldmVudCA9IHRoaXMudGltZUV2ZW50c1t0aGlzLnRpbWVFdmVudHNJbmRleF1cbiAgICAgICAgaWYoZXZlbnQubWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgdGhpcy5taWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGlja1xuICAgICAgICAgIC8vY29uc29sZS5sb2codGhpcy5taWxsaXNQZXJUaWNrKVxuICAgICAgICAgIHRoaXMudGltZUV2ZW50c0luZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3RvcCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZih0aGlzLnNvbmdFdmVudHNJbmRleCA8IHRoaXMubnVtU29uZ0V2ZW50cyl7XG4gICAgICAgIGV2ZW50ID0gdGhpcy5zb25nRXZlbnRzW3RoaXMuc29uZ0V2ZW50c0luZGV4XVxuICAgICAgICBpZihldmVudC50eXBlID09PSAweDJGKXtcbiAgICAgICAgICBsb29wID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGxldCBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGlja1xuICAgICAgICBpZihtaWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZXN0YW1wXG4gICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgICAgICAgdGhpcy5zb25nRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHRoaXMuc29uZy51c2VNZXRyb25vbWUgPT09IHRydWUgJiYgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleCA8IHRoaXMubnVtTWV0cm9ub21lRXZlbnRzKXtcbiAgICAgICAgZXZlbnQgPSB0aGlzLm1ldHJvbm9tZUV2ZW50c1t0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4XVxuICAgICAgICBsZXQgbWlsbGlzID0gZXZlbnQudGlja3MgKiB0aGlzLm1pbGxpc1BlclRpY2tcbiAgICAgICAgaWYobWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgZXZlbnQudGltZSA9IG1pbGxpcyArIHRpbWVzdGFtcFxuICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgICAgICAgIHRoaXMubWV0cm9ub21lRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHN0b3Ape1xuICAgICAgICBsb29wID0gZmFsc2VcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgc29ydEV2ZW50cyhyZXN1bHQpXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cblxuKi9cbiIsIi8vaW1wb3J0IGdtSW5zdHJ1bWVudHMgZnJvbSAnLi9nbV9pbnN0cnVtZW50cydcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRTb25nID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDE2LFxuICBsb3dlc3ROb3RlOiAwLFxuICBoaWdoZXN0Tm90ZTogMTI3LFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIHBsYXliYWNrU3BlZWQ6IDEsXG4gIGF1dG9RdWFudGl6ZTogZmFsc2Vcbn1cblxuZXhwb3J0IGxldCBidWZmZXJUaW1lID0gMjAwXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRCdWZmZXJUaW1lKHRpbWUpe1xuICBidWZmZXJUaW1lID0gdGltZVxufVxuXG4vL3BvcnRlZCBoZWFydGJlYXQgaW5zdHJ1bWVudHM6IGh0dHA6Ly9naXRodWIuY29tL2FidWRhYW4vaGVhcnRiZWF0XG5jb25zdCBoZWFydGJlYXRJbnN0cnVtZW50cyA9IG5ldyBNYXAoW1xuICBbJ2NpdHktcGlhbm8nLCB7XG4gICAgbmFtZTogJ0NpdHkgUGlhbm8gKHBpYW5vKScsXG4gICAgZGVzY3JpcHRpb246ICdDaXR5IFBpYW5vIHVzZXMgc2FtcGxlcyBmcm9tIGEgQmFsZHdpbiBwaWFubywgaXQgaGFzIDQgdmVsb2NpdHkgbGF5ZXJzOiAxIC0gNDgsIDQ5IC0gOTYsIDk3IC0gMTEwIGFuZCAxMTAgLSAxMjcuIEluIHRvdGFsIGl0IHVzZXMgNCAqIDg4ID0gMzUyIHNhbXBsZXMnLFxuICB9XSxcbiAgWydjaXR5LXBpYW5vLWxpZ2h0Jywge1xuICAgIG5hbWU6ICdDaXR5IFBpYW5vIExpZ2h0IChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyBsaWdodCB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyBvbmx5IDEgdmVsb2NpdHkgbGF5ZXIgYW5kIHVzZXMgODggc2FtcGxlcycsXG4gIH1dLFxuICBbJ2NrLWljZXNrYXRlcycsIHtcbiAgICBuYW1lOiAnQ0sgSWNlIFNrYXRlcyAoc3ludGgpJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgRGV0dW5pemVkIHNhbXBsZXMnLFxuICB9XSxcbiAgWydzaGsyLXNxdWFyZXJvb3QnLCB7XG4gICAgbmFtZTogJ1NISyBzcXVhcmVyb290IChzeW50aCknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3Job2RlcycsIHtcbiAgICBuYW1lOiAnUmhvZGVzIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBGcmVlc291bmQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3Job2RlczInLCB7XG4gICAgbmFtZTogJ1Job2RlcyAyIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3RydW1wZXQnLCB7XG4gICAgbmFtZTogJ1RydW1wZXQgKGJyYXNzKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIFNTTyBzYW1wbGVzJyxcbiAgfV0sXG4gIFsndmlvbGluJywge1xuICAgIG5hbWU6ICdWaW9saW4gKHN0cmluZ3MpJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgU1NPIHNhbXBsZXMnLFxuICB9XVxuXSlcbmV4cG9ydCBjb25zdCBnZXRJbnN0cnVtZW50cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBoZWFydGJlYXRJbnN0cnVtZW50c1xufVxuXG4vLyBnbSBzb3VuZHMgZXhwb3J0ZWQgZnJvbSBGbHVpZFN5bnRoIGJ5IEJlbmphbWluIEdsZWl0em1hbjogaHR0cHM6Ly9naXRodWIuY29tL2dsZWl0ei9taWRpLWpzLXNvdW5kZm9udHNcbmNvbnN0IGdtSW5zdHJ1bWVudHMgPSB7XCJhY291c3RpY19ncmFuZF9waWFub1wiOntcIm5hbWVcIjpcIjEgQWNvdXN0aWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJyaWdodF9hY291c3RpY19waWFub1wiOntcIm5hbWVcIjpcIjIgQnJpZ2h0IEFjb3VzdGljIFBpYW5vIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ncmFuZF9waWFub1wiOntcIm5hbWVcIjpcIjMgRWxlY3RyaWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhvbmt5dG9ua19waWFub1wiOntcIm5hbWVcIjpcIjQgSG9ua3ktdG9uayBQaWFubyAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfcGlhbm9fMVwiOntcIm5hbWVcIjpcIjUgRWxlY3RyaWMgUGlhbm8gMSAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfcGlhbm9fMlwiOntcIm5hbWVcIjpcIjYgRWxlY3RyaWMgUGlhbm8gMiAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiaGFycHNpY2hvcmRcIjp7XCJuYW1lXCI6XCI3IEhhcnBzaWNob3JkIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjbGF2aW5ldFwiOntcIm5hbWVcIjpcIjggQ2xhdmluZXQgKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNlbGVzdGFcIjp7XCJuYW1lXCI6XCI5IENlbGVzdGEgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ2xvY2tlbnNwaWVsXCI6e1wibmFtZVwiOlwiMTAgR2xvY2tlbnNwaWVsIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm11c2ljX2JveFwiOntcIm5hbWVcIjpcIjExIE11c2ljIEJveCAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2aWJyYXBob25lXCI6e1wibmFtZVwiOlwiMTIgVmlicmFwaG9uZSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJtYXJpbWJhXCI6e1wibmFtZVwiOlwiMTMgTWFyaW1iYSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ4eWxvcGhvbmVcIjp7XCJuYW1lXCI6XCIxNCBYeWxvcGhvbmUgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidHVidWxhcl9iZWxsc1wiOntcIm5hbWVcIjpcIjE1IFR1YnVsYXIgQmVsbHMgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZHVsY2ltZXJcIjp7XCJuYW1lXCI6XCIxNiBEdWxjaW1lciAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJkcmF3YmFyX29yZ2FuXCI6e1wibmFtZVwiOlwiMTcgRHJhd2JhciBPcmdhbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGVyY3Vzc2l2ZV9vcmdhblwiOntcIm5hbWVcIjpcIjE4IFBlcmN1c3NpdmUgT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJvY2tfb3JnYW5cIjp7XCJuYW1lXCI6XCIxOSBSb2NrIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjaHVyY2hfb3JnYW5cIjp7XCJuYW1lXCI6XCIyMCBDaHVyY2ggT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJlZWRfb3JnYW5cIjp7XCJuYW1lXCI6XCIyMSBSZWVkIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY2NvcmRpb25cIjp7XCJuYW1lXCI6XCIyMiBBY2NvcmRpb24gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhhcm1vbmljYVwiOntcIm5hbWVcIjpcIjIzIEhhcm1vbmljYSAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGFuZ29fYWNjb3JkaW9uXCI6e1wibmFtZVwiOlwiMjQgVGFuZ28gQWNjb3JkaW9uIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY291c3RpY19ndWl0YXJfbnlsb25cIjp7XCJuYW1lXCI6XCIyNSBBY291c3RpYyBHdWl0YXIgKG55bG9uKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFjb3VzdGljX2d1aXRhcl9zdGVlbFwiOntcIm5hbWVcIjpcIjI2IEFjb3VzdGljIEd1aXRhciAoc3RlZWwpIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfZ3VpdGFyX2phenpcIjp7XCJuYW1lXCI6XCIyNyBFbGVjdHJpYyBHdWl0YXIgKGphenopIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfZ3VpdGFyX2NsZWFuXCI6e1wibmFtZVwiOlwiMjggRWxlY3RyaWMgR3VpdGFyIChjbGVhbikgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ndWl0YXJfbXV0ZWRcIjp7XCJuYW1lXCI6XCIyOSBFbGVjdHJpYyBHdWl0YXIgKG11dGVkKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm92ZXJkcml2ZW5fZ3VpdGFyXCI6e1wibmFtZVwiOlwiMzAgT3ZlcmRyaXZlbiBHdWl0YXIgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJkaXN0b3J0aW9uX2d1aXRhclwiOntcIm5hbWVcIjpcIjMxIERpc3RvcnRpb24gR3VpdGFyIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3VpdGFyX2hhcm1vbmljc1wiOntcIm5hbWVcIjpcIjMyIEd1aXRhciBIYXJtb25pY3MgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY291c3RpY19iYXNzXCI6e1wibmFtZVwiOlwiMzMgQWNvdXN0aWMgQmFzcyAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19iYXNzX2ZpbmdlclwiOntcIm5hbWVcIjpcIjM0IEVsZWN0cmljIEJhc3MgKGZpbmdlcikgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfYmFzc19waWNrXCI6e1wibmFtZVwiOlwiMzUgRWxlY3RyaWMgQmFzcyAocGljaykgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnJldGxlc3NfYmFzc1wiOntcIm5hbWVcIjpcIjM2IEZyZXRsZXNzIEJhc3MgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2xhcF9iYXNzXzFcIjp7XCJuYW1lXCI6XCIzNyBTbGFwIEJhc3MgMSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzbGFwX2Jhc3NfMlwiOntcIm5hbWVcIjpcIjM4IFNsYXAgQmFzcyAyIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2Jhc3NfMVwiOntcIm5hbWVcIjpcIjM5IFN5bnRoIEJhc3MgMSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9iYXNzXzJcIjp7XCJuYW1lXCI6XCI0MCBTeW50aCBCYXNzIDIgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidmlvbGluXCI6e1wibmFtZVwiOlwiNDEgVmlvbGluIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInZpb2xhXCI6e1wibmFtZVwiOlwiNDIgVmlvbGEgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2VsbG9cIjp7XCJuYW1lXCI6XCI0MyBDZWxsbyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjb250cmFiYXNzXCI6e1wibmFtZVwiOlwiNDQgQ29udHJhYmFzcyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0cmVtb2xvX3N0cmluZ3NcIjp7XCJuYW1lXCI6XCI0NSBUcmVtb2xvIFN0cmluZ3MgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGl6emljYXRvX3N0cmluZ3NcIjp7XCJuYW1lXCI6XCI0NiBQaXp6aWNhdG8gU3RyaW5ncyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJvcmNoZXN0cmFsX2hhcnBcIjp7XCJuYW1lXCI6XCI0NyBPcmNoZXN0cmFsIEhhcnAgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGltcGFuaVwiOntcIm5hbWVcIjpcIjQ4IFRpbXBhbmkgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RyaW5nX2Vuc2VtYmxlXzFcIjp7XCJuYW1lXCI6XCI0OSBTdHJpbmcgRW5zZW1ibGUgMSAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RyaW5nX2Vuc2VtYmxlXzJcIjp7XCJuYW1lXCI6XCI1MCBTdHJpbmcgRW5zZW1ibGUgMiAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfc3RyaW5nc18xXCI6e1wibmFtZVwiOlwiNTEgU3ludGggU3RyaW5ncyAxIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9zdHJpbmdzXzJcIjp7XCJuYW1lXCI6XCI1MiBTeW50aCBTdHJpbmdzIDIgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNob2lyX2FhaHNcIjp7XCJuYW1lXCI6XCI1MyBDaG9pciBBYWhzIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2b2ljZV9vb2hzXCI6e1wibmFtZVwiOlwiNTQgVm9pY2UgT29ocyAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfY2hvaXJcIjp7XCJuYW1lXCI6XCI1NSBTeW50aCBDaG9pciAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib3JjaGVzdHJhX2hpdFwiOntcIm5hbWVcIjpcIjU2IE9yY2hlc3RyYSBIaXQgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRydW1wZXRcIjp7XCJuYW1lXCI6XCI1NyBUcnVtcGV0IChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0cm9tYm9uZVwiOntcIm5hbWVcIjpcIjU4IFRyb21ib25lIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0dWJhXCI6e1wibmFtZVwiOlwiNTkgVHViYSAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibXV0ZWRfdHJ1bXBldFwiOntcIm5hbWVcIjpcIjYwIE11dGVkIFRydW1wZXQgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZyZW5jaF9ob3JuXCI6e1wibmFtZVwiOlwiNjEgRnJlbmNoIEhvcm4gKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJyYXNzX3NlY3Rpb25cIjp7XCJuYW1lXCI6XCI2MiBCcmFzcyBTZWN0aW9uIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9icmFzc18xXCI6e1wibmFtZVwiOlwiNjMgU3ludGggQnJhc3MgMSAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfYnJhc3NfMlwiOntcIm5hbWVcIjpcIjY0IFN5bnRoIEJyYXNzIDIgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNvcHJhbm9fc2F4XCI6e1wibmFtZVwiOlwiNjUgU29wcmFubyBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWx0b19zYXhcIjp7XCJuYW1lXCI6XCI2NiBBbHRvIFNheCAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0ZW5vcl9zYXhcIjp7XCJuYW1lXCI6XCI2NyBUZW5vciBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFyaXRvbmVfc2F4XCI6e1wibmFtZVwiOlwiNjggQmFyaXRvbmUgU2F4IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9ib2VcIjp7XCJuYW1lXCI6XCI2OSBPYm9lIChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVuZ2xpc2hfaG9yblwiOntcIm5hbWVcIjpcIjcwIEVuZ2xpc2ggSG9ybiAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiYXNzb29uXCI6e1wibmFtZVwiOlwiNzEgQmFzc29vbiAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjbGFyaW5ldFwiOntcIm5hbWVcIjpcIjcyIENsYXJpbmV0IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBpY2NvbG9cIjp7XCJuYW1lXCI6XCI3MyBQaWNjb2xvIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZsdXRlXCI6e1wibmFtZVwiOlwiNzQgRmx1dGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicmVjb3JkZXJcIjp7XCJuYW1lXCI6XCI3NSBSZWNvcmRlciAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYW5fZmx1dGVcIjp7XCJuYW1lXCI6XCI3NiBQYW4gRmx1dGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmxvd25fYm90dGxlXCI6e1wibmFtZVwiOlwiNzcgQmxvd24gQm90dGxlIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNoYWt1aGFjaGlcIjp7XCJuYW1lXCI6XCI3OCBTaGFrdWhhY2hpIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIndoaXN0bGVcIjp7XCJuYW1lXCI6XCI3OSBXaGlzdGxlIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9jYXJpbmFcIjp7XCJuYW1lXCI6XCI4MCBPY2FyaW5hIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfMV9zcXVhcmVcIjp7XCJuYW1lXCI6XCI4MSBMZWFkIDEgKHNxdWFyZSkgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzJfc2F3dG9vdGhcIjp7XCJuYW1lXCI6XCI4MiBMZWFkIDIgKHNhd3Rvb3RoKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfM19jYWxsaW9wZVwiOntcIm5hbWVcIjpcIjgzIExlYWQgMyAoY2FsbGlvcGUpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF80X2NoaWZmXCI6e1wibmFtZVwiOlwiODQgTGVhZCA0IChjaGlmZikgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzVfY2hhcmFuZ1wiOntcIm5hbWVcIjpcIjg1IExlYWQgNSAoY2hhcmFuZykgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzZfdm9pY2VcIjp7XCJuYW1lXCI6XCI4NiBMZWFkIDYgKHZvaWNlKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfN19maWZ0aHNcIjp7XCJuYW1lXCI6XCI4NyBMZWFkIDcgKGZpZnRocykgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzhfYmFzc19fbGVhZFwiOntcIm5hbWVcIjpcIjg4IExlYWQgOCAoYmFzcyArIGxlYWQpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzFfbmV3X2FnZVwiOntcIm5hbWVcIjpcIjg5IFBhZCAxIChuZXcgYWdlKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzJfd2FybVwiOntcIm5hbWVcIjpcIjkwIFBhZCAyICh3YXJtKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzNfcG9seXN5bnRoXCI6e1wibmFtZVwiOlwiOTEgUGFkIDMgKHBvbHlzeW50aCkgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF80X2Nob2lyXCI6e1wibmFtZVwiOlwiOTIgUGFkIDQgKGNob2lyKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzVfYm93ZWRcIjp7XCJuYW1lXCI6XCI5MyBQYWQgNSAoYm93ZWQpIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfNl9tZXRhbGxpY1wiOntcIm5hbWVcIjpcIjk0IFBhZCA2IChtZXRhbGxpYykgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF83X2hhbG9cIjp7XCJuYW1lXCI6XCI5NSBQYWQgNyAoaGFsbykgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF84X3N3ZWVwXCI6e1wibmFtZVwiOlwiOTYgUGFkIDggKHN3ZWVwKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfMV9yYWluXCI6e1wibmFtZVwiOlwiOTcgRlggMSAocmFpbikgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF8yX3NvdW5kdHJhY2tcIjp7XCJuYW1lXCI6XCI5OCBGWCAyIChzb3VuZHRyYWNrKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzNfY3J5c3RhbFwiOntcIm5hbWVcIjpcIjk5IEZYIDMgKGNyeXN0YWwpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNF9hdG1vc3BoZXJlXCI6e1wibmFtZVwiOlwiMTAwIEZYIDQgKGF0bW9zcGhlcmUpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNV9icmlnaHRuZXNzXCI6e1wibmFtZVwiOlwiMTAxIEZYIDUgKGJyaWdodG5lc3MpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNl9nb2JsaW5zXCI6e1wibmFtZVwiOlwiMTAyIEZYIDYgKGdvYmxpbnMpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfN19lY2hvZXNcIjp7XCJuYW1lXCI6XCIxMDMgRlggNyAoZWNob2VzKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4Xzhfc2NpZmlcIjp7XCJuYW1lXCI6XCIxMDQgRlggOCAoc2NpLWZpKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNpdGFyXCI6e1wibmFtZVwiOlwiMTA1IFNpdGFyIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFuam9cIjp7XCJuYW1lXCI6XCIxMDYgQmFuam8gKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzaGFtaXNlblwiOntcIm5hbWVcIjpcIjEwNyBTaGFtaXNlbiAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImtvdG9cIjp7XCJuYW1lXCI6XCIxMDggS290byAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImthbGltYmFcIjp7XCJuYW1lXCI6XCIxMDkgS2FsaW1iYSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJhZ3BpcGVcIjp7XCJuYW1lXCI6XCIxMTAgQmFncGlwZSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZpZGRsZVwiOntcIm5hbWVcIjpcIjExMSBGaWRkbGUgKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzaGFuYWlcIjp7XCJuYW1lXCI6XCIxMTIgU2hhbmFpIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGlua2xlX2JlbGxcIjp7XCJuYW1lXCI6XCIxMTMgVGlua2xlIEJlbGwgKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWdvZ29cIjp7XCJuYW1lXCI6XCIxMTQgQWdvZ28gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RlZWxfZHJ1bXNcIjp7XCJuYW1lXCI6XCIxMTUgU3RlZWwgRHJ1bXMgKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwid29vZGJsb2NrXCI6e1wibmFtZVwiOlwiMTE2IFdvb2RibG9jayAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0YWlrb19kcnVtXCI6e1wibmFtZVwiOlwiMTE3IFRhaWtvIERydW0gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibWVsb2RpY190b21cIjp7XCJuYW1lXCI6XCIxMTggTWVsb2RpYyBUb20gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfZHJ1bVwiOntcIm5hbWVcIjpcIjExOSBTeW50aCBEcnVtIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJldmVyc2VfY3ltYmFsXCI6e1wibmFtZVwiOlwiMTIwIFJldmVyc2UgQ3ltYmFsIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3VpdGFyX2ZyZXRfbm9pc2VcIjp7XCJuYW1lXCI6XCIxMjEgR3VpdGFyIEZyZXQgTm9pc2UgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJicmVhdGhfbm9pc2VcIjp7XCJuYW1lXCI6XCIxMjIgQnJlYXRoIE5vaXNlIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2Vhc2hvcmVcIjp7XCJuYW1lXCI6XCIxMjMgU2Vhc2hvcmUgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiaXJkX3R3ZWV0XCI6e1wibmFtZVwiOlwiMTI0IEJpcmQgVHdlZXQgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0ZWxlcGhvbmVfcmluZ1wiOntcIm5hbWVcIjpcIjEyNSBUZWxlcGhvbmUgUmluZyAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhlbGljb3B0ZXJcIjp7XCJuYW1lXCI6XCIxMjYgSGVsaWNvcHRlciAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFwcGxhdXNlXCI6e1wibmFtZVwiOlwiMTI3IEFwcGxhdXNlIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3Vuc2hvdFwiOntcIm5hbWVcIjpcIjEyOCBHdW5zaG90IChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9fVxubGV0IGdtTWFwID0gbmV3IE1hcCgpXG5PYmplY3Qua2V5cyhnbUluc3RydW1lbnRzKS5mb3JFYWNoKGtleSA9PiB7XG4gIGdtTWFwLnNldChrZXksIGdtSW5zdHJ1bWVudHNba2V5XSlcbn0pXG5leHBvcnQgY29uc3QgZ2V0R01JbnN0cnVtZW50cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBnbU1hcFxufVxuIiwiaW1wb3J0IHtJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5pbXBvcnQge1NhbXBsZU9zY2lsbGF0b3J9IGZyb20gJy4vc2FtcGxlX29zY2lsbGF0b3InXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgU2ltcGxlU3ludGggZXh0ZW5kcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgbmFtZTogc3RyaW5nKXtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgdGhpcy5pZFxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSB7fVxuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICB0aGlzLnNhbXBsZURhdGEgPSB7XG4gICAgICB0eXBlLFxuICAgICAgcmVsZWFzZUR1cmF0aW9uOiAwLjMsXG4gICAgICByZWxlYXNlRW52ZWxvcGU6ICdlcXVhbCBwb3dlcidcbiAgICB9XG4gIH1cblxuICBjcmVhdGVTYW1wbGUoZXZlbnQpe1xuICAgIHJldHVybiBuZXcgU2FtcGxlT3NjaWxsYXRvcih0aGlzLnNhbXBsZURhdGEsIGV2ZW50KVxuICB9XG5cbiAgLy8gc3RlcmVvIHNwcmVhZFxuICBzZXRLZXlTY2FsaW5nUGFubmluZygpe1xuICAgIC8vIHNldHMgcGFubmluZyBiYXNlZCBvbiB0aGUga2V5IHZhbHVlLCBlLmcuIGhpZ2hlciBub3RlcyBhcmUgcGFubmVkIG1vcmUgdG8gdGhlIHJpZ2h0IGFuZCBsb3dlciBub3RlcyBtb3JlIHRvIHRoZSBsZWZ0XG4gIH1cblxuICBzZXRLZXlTY2FsaW5nUmVsZWFzZSgpe1xuICAgIC8vIHNldCByZWxlYXNlIGJhc2VkIG9uIGtleSB2YWx1ZVxuICB9XG5cbiAgLypcbiAgICBAZHVyYXRpb246IG1pbGxpc2Vjb25kc1xuICAgIEBlbnZlbG9wZTogbGluZWFyIHwgZXF1YWxfcG93ZXIgfCBhcnJheSBvZiBpbnQgdmFsdWVzXG4gICovXG4gIHNldFJlbGVhc2UoZHVyYXRpb246IG51bWJlciwgZW52ZWxvcGUpe1xuICAgIHRoaXMuc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb24gPSBkdXJhdGlvblxuICAgIHRoaXMuc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSBlbnZlbG9wZVxuICB9XG59XG4iLCIvL0AgZmxvd1xuXG5pbXBvcnQge01JRElFdmVudFR5cGVzfSBmcm9tICcuL2NvbnN0YW50cydcbmltcG9ydCB7cGFyc2VFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtjb250ZXh0LCBtYXN0ZXJHYWlufSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQgU2NoZWR1bGVyIGZyb20gJy4vc2NoZWR1bGVyJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7c29uZ0Zyb21NSURJRmlsZSwgc29uZ0Zyb21NSURJRmlsZVN5bmN9IGZyb20gJy4vc29uZ19mcm9tX21pZGlmaWxlJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2NhbGN1bGF0ZVBvc2l0aW9ufSBmcm9tICcuL3Bvc2l0aW9uJ1xuaW1wb3J0IHtQbGF5aGVhZH0gZnJvbSAnLi9wbGF5aGVhZCdcbmltcG9ydCB7TWV0cm9ub21lfSBmcm9tICcuL21ldHJvbm9tZSdcbmltcG9ydCB7YWRkRXZlbnRMaXN0ZW5lciwgcmVtb3ZlRXZlbnRMaXN0ZW5lciwgZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuaW1wb3J0IHtkZWZhdWx0U29uZ30gZnJvbSAnLi9zZXR0aW5ncydcbmltcG9ydCB7c2F2ZUFzTUlESUZpbGV9IGZyb20gJy4vc2F2ZV9taWRpZmlsZSdcbmltcG9ydCB7dXBkYXRlfSBmcm9tICcuL3NvbmcudXBkYXRlJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcbmxldCByZWNvcmRpbmdJbmRleCA9IDBcblxuXG4vKlxudHlwZSBzb25nU2V0dGluZ3MgPSB7XG4gIG5hbWU6IHN0cmluZyxcbiAgcHBxOiBudW1iZXIsXG4gIGJwbTogbnVtYmVyLFxuICBiYXJzOiBudW1iZXIsXG4gIGxvd2VzdE5vdGU6IG51bWJlcixcbiAgaGlnaGVzdE5vdGU6IG51bWJlcixcbiAgbm9taW5hdG9yOiBudW1iZXIsXG4gIGRlbm9taW5hdG9yOiBudW1iZXIsXG4gIHF1YW50aXplVmFsdWU6IG51bWJlcixcbiAgZml4ZWRMZW5ndGhWYWx1ZTogbnVtYmVyLFxuICBwb3NpdGlvblR5cGU6IHN0cmluZyxcbiAgdXNlTWV0cm9ub21lOiBib29sZWFuLFxuICBhdXRvU2l6ZTogYm9vbGVhbixcbiAgbG9vcDogYm9vbGVhbixcbiAgcGxheWJhY2tTcGVlZDogbnVtYmVyLFxuICBhdXRvUXVhbnRpemU6IGJvb2xlYW4sXG59XG4qL1xuXG4vKlxuICAvLyBpbml0aWFsaXplIHNvbmcgd2l0aCB0cmFja3MgYW5kIHBhcnQgc28geW91IGRvIG5vdCBoYXZlIHRvIGNyZWF0ZSB0aGVtIHNlcGFyYXRlbHlcbiAgc2V0dXA6IHtcbiAgICB0aW1lRXZlbnRzOiBbXVxuICAgIHRyYWNrczogW1xuICAgICAgcGFydHMgW11cbiAgICBdXG4gIH1cbiovXG5cbmV4cG9ydCBjbGFzcyBTb25ne1xuXG4gIHN0YXRpYyBmcm9tTUlESUZpbGUoZGF0YSl7XG4gICAgcmV0dXJuIHNvbmdGcm9tTUlESUZpbGUoZGF0YSlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tTUlESUZpbGVTeW5jKGRhdGEpe1xuICAgIHJldHVybiBzb25nRnJvbU1JRElGaWxlU3luYyhkYXRhKVxuICB9XG5cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3M6IHt9ID0ge30pe1xuXG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YDtcblxuICAgICh7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUgPSB0aGlzLmlkLFxuICAgICAgcHBxOiB0aGlzLnBwcSA9IGRlZmF1bHRTb25nLnBwcSxcbiAgICAgIGJwbTogdGhpcy5icG0gPSBkZWZhdWx0U29uZy5icG0sXG4gICAgICBiYXJzOiB0aGlzLmJhcnMgPSBkZWZhdWx0U29uZy5iYXJzLFxuICAgICAgbm9taW5hdG9yOiB0aGlzLm5vbWluYXRvciA9IGRlZmF1bHRTb25nLm5vbWluYXRvcixcbiAgICAgIGRlbm9taW5hdG9yOiB0aGlzLmRlbm9taW5hdG9yID0gZGVmYXVsdFNvbmcuZGVub21pbmF0b3IsXG4gICAgICBxdWFudGl6ZVZhbHVlOiB0aGlzLnF1YW50aXplVmFsdWUgPSBkZWZhdWx0U29uZy5xdWFudGl6ZVZhbHVlLFxuICAgICAgZml4ZWRMZW5ndGhWYWx1ZTogdGhpcy5maXhlZExlbmd0aFZhbHVlID0gZGVmYXVsdFNvbmcuZml4ZWRMZW5ndGhWYWx1ZSxcbiAgICAgIHVzZU1ldHJvbm9tZTogdGhpcy51c2VNZXRyb25vbWUgPSBkZWZhdWx0U29uZy51c2VNZXRyb25vbWUsXG4gICAgICBhdXRvU2l6ZTogdGhpcy5hdXRvU2l6ZSA9IGRlZmF1bHRTb25nLmF1dG9TaXplLFxuICAgICAgcGxheWJhY2tTcGVlZDogdGhpcy5wbGF5YmFja1NwZWVkID0gZGVmYXVsdFNvbmcucGxheWJhY2tTcGVlZCxcbiAgICAgIGF1dG9RdWFudGl6ZTogdGhpcy5hdXRvUXVhbnRpemUgPSBkZWZhdWx0U29uZy5hdXRvUXVhbnRpemUsXG4gICAgfSA9IHNldHRpbmdzKTtcblxuICAgIHRoaXMuX3RpbWVFdmVudHMgPSBbXG4gICAgICBuZXcgTUlESUV2ZW50KDAsIE1JRElFdmVudFR5cGVzLlRFTVBPLCB0aGlzLmJwbSksXG4gICAgICBuZXcgTUlESUV2ZW50KDAsIE1JRElFdmVudFR5cGVzLlRJTUVfU0lHTkFUVVJFLCB0aGlzLm5vbWluYXRvciwgdGhpcy5kZW5vbWluYXRvciksXG4gICAgXVxuXG4gICAgLy90aGlzLl90aW1lRXZlbnRzID0gW11cbiAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICAgIHRoaXMuX2xhc3RFdmVudCA9IG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuRU5EX09GX1RSQUNLKVxuXG4gICAgdGhpcy5fdHJhY2tzID0gW11cbiAgICB0aGlzLl90cmFja3NCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9wYXJ0cyA9IFtdXG4gICAgdGhpcy5fcGFydHNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX2FsbEV2ZW50cyA9IFtdIC8vIE1JREkgZXZlbnRzIGFuZCBtZXRyb25vbWUgZXZlbnRzXG5cbiAgICB0aGlzLl9ub3RlcyA9IFtdXG4gICAgdGhpcy5fbm90ZXNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9uZXdFdmVudHMgPSBbXVxuICAgIHRoaXMuX21vdmVkRXZlbnRzID0gW11cbiAgICB0aGlzLl9yZW1vdmVkRXZlbnRzID0gW11cbiAgICB0aGlzLl90cmFuc3Bvc2VkRXZlbnRzID0gW11cblxuICAgIHRoaXMuX25ld1BhcnRzID0gW11cbiAgICB0aGlzLl9jaGFuZ2VkUGFydHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdXG5cbiAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gMFxuICAgIHRoaXMuX3NjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIodGhpcylcbiAgICB0aGlzLl9wbGF5aGVhZCA9IG5ldyBQbGF5aGVhZCh0aGlzKVxuXG4gICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZVxuICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZVxuICAgIHRoaXMuc3RvcHBlZCA9IHRydWVcblxuICAgIHRoaXMudm9sdW1lID0gMC41XG4gICAgdGhpcy5fb3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLl9vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3QobWFzdGVyR2FpbilcblxuICAgIHRoaXMuX21ldHJvbm9tZSA9IG5ldyBNZXRyb25vbWUodGhpcylcbiAgICB0aGlzLl9tZXRyb25vbWVFdmVudHMgPSBbXVxuICAgIHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyA9IHRydWVcbiAgICB0aGlzLl9tZXRyb25vbWUubXV0ZSghdGhpcy51c2VNZXRyb25vbWUpXG5cbiAgICB0aGlzLl9sb29wID0gZmFsc2VcbiAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgIHRoaXMuX2lsbGVnYWxMb29wID0gZmFsc2VcbiAgICB0aGlzLl9sb29wRHVyYXRpb24gPSAwXG4gICAgdGhpcy5fcHJlY291bnRCYXJzID0gMFxuICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gMFxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIGFkZFRpbWVFdmVudHMoLi4uZXZlbnRzKXtcbiAgICAvL0BUT0RPOiBmaWx0ZXIgdGltZSBldmVudHMgb24gdGhlIHNhbWUgdGljayAtPiB1c2UgdGhlIGxhc3RseSBhZGRlZCBldmVudHNcbiAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBpZihldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSl7XG4gICAgICAgIHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyA9IHRydWVcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RpbWVFdmVudHMucHVzaChldmVudClcbiAgICB9KVxuICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlXG4gIH1cblxuICBhZGRUcmFja3MoLi4udHJhY2tzKXtcbiAgICB0cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHtcbiAgICAgIHRyYWNrLl9zb25nID0gdGhpc1xuICAgICAgdHJhY2suY29ubmVjdCh0aGlzLl9vdXRwdXQpXG4gICAgICB0aGlzLl90cmFja3MucHVzaCh0cmFjaylcbiAgICAgIHRoaXMuX3RyYWNrc0J5SWQuc2V0KHRyYWNrLmlkLCB0cmFjaylcbiAgICAgIHRoaXMuX25ld0V2ZW50cy5wdXNoKC4uLnRyYWNrLl9ldmVudHMpXG4gICAgICB0aGlzLl9uZXdQYXJ0cy5wdXNoKC4uLnRyYWNrLl9wYXJ0cylcbiAgICB9KVxuICB9XG5cbiAgdXBkYXRlKCl7XG4gICAgdXBkYXRlLmNhbGwodGhpcylcbiAgfVxuXG4gIHBsYXkodHlwZSwgLi4uYXJncyk6IHZvaWR7XG4gICAgdGhpcy5fcGxheSh0eXBlLCAuLi5hcmdzKVxuICAgIGlmKHRoaXMuX3ByZWNvdW50QmFycyA+IDApe1xuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3ByZWNvdW50aW5nJywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgfWVsc2UgaWYodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IHRydWUpe1xuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3N0YXJ0X3JlY29yZGluZycsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgIH1lbHNle1xuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BsYXknLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzfSlcbiAgICB9XG4gIH1cblxuICBfcGxheSh0eXBlLCAuLi5hcmdzKXtcbiAgICBpZih0eXBlb2YgdHlwZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy5zZXRQb3NpdGlvbih0eXBlLCAuLi5hcmdzKVxuICAgIH1cbiAgICBpZih0aGlzLnBsYXlpbmcpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzKVxuXG4gICAgdGhpcy5fcmVmZXJlbmNlID0gdGhpcy5fdGltZVN0YW1wID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDBcbiAgICB0aGlzLl9zY2hlZHVsZXIuc2V0VGltZVN0YW1wKHRoaXMuX3JlZmVyZW5jZSlcbiAgICB0aGlzLl9zdGFydE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXNcblxuICAgIGlmKHRoaXMuX3ByZWNvdW50QmFycyA+IDAgJiYgdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcpe1xuXG4gICAgICAvLyBjcmVhdGUgcHJlY291bnQgZXZlbnRzLCB0aGUgcGxheWhlYWQgd2lsbCBiZSBtb3ZlZCB0byB0aGUgZmlyc3QgYmVhdCBvZiB0aGUgY3VycmVudCBiYXJcbiAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb24oKVxuICAgICAgdGhpcy5fbWV0cm9ub21lLmNyZWF0ZVByZWNvdW50RXZlbnRzKHBvc2l0aW9uLmJhciwgcG9zaXRpb24uYmFyICsgdGhpcy5fcHJlY291bnRCYXJzLCB0aGlzLl9yZWZlcmVuY2UpXG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24oJ2JhcnNiZWF0cycsIFtwb3NpdGlvbi5iYXJdLCAnbWlsbGlzJykubWlsbGlzXG4gICAgICB0aGlzLl9wcmVjb3VudER1cmF0aW9uID0gdGhpcy5fbWV0cm9ub21lLnByZWNvdW50RHVyYXRpb25cbiAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gdGhpcy5fY3VycmVudE1pbGxpcyArIHRoaXMuX3ByZWNvdW50RHVyYXRpb25cblxuICAgICAgLy8gY29uc29sZS5ncm91cCgncHJlY291bnQnKVxuICAgICAgLy8gY29uc29sZS5sb2coJ3Bvc2l0aW9uJywgdGhpcy5nZXRQb3NpdGlvbigpKVxuICAgICAgLy8gY29uc29sZS5sb2coJ19jdXJyZW50TWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdlbmRQcmVjb3VudE1pbGxpcycsIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzKVxuICAgICAgLy8gY29uc29sZS5sb2coJ19wcmVjb3VudER1cmF0aW9uJywgdGhpcy5fcHJlY291bnREdXJhdGlvbilcbiAgICAgIC8vIGNvbnNvbGUuZ3JvdXBFbmQoJ3ByZWNvdW50JylcbiAgICAgIC8vY29uc29sZS5sb2coJ3ByZWNvdW50RHVyYXRpb24nLCB0aGlzLl9tZXRyb25vbWUuY3JlYXRlUHJlY291bnRFdmVudHModGhpcy5fcHJlY291bnRCYXJzLCB0aGlzLl9yZWZlcmVuY2UpKVxuICAgICAgdGhpcy5wcmVjb3VudGluZyA9IHRydWVcbiAgICB9ZWxzZSB7XG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMucGxheWluZyA9IHRydWVcbiAgICAgIHRoaXMucmVjb3JkaW5nID0gdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmdcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9lbmRQcmVjb3VudE1pbGxpcylcblxuICAgIGlmKHRoaXMucGF1c2VkKXtcbiAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgdGhpcy5fc2NoZWR1bGVyLmluaXQodGhpcy5fY3VycmVudE1pbGxpcylcbiAgICB0aGlzLl9wdWxzZSgpXG4gIH1cblxuICBfcHVsc2UoKTogdm9pZHtcbiAgICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlICYmIHRoaXMucHJlY291bnRpbmcgPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgbm93ID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDBcbiAgICBsZXQgZGlmZiA9IG5vdyAtIHRoaXMuX3JlZmVyZW5jZVxuICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgIHRoaXMuX3JlZmVyZW5jZSA9IG5vd1xuXG4gICAgaWYodGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPiAwKXtcbiAgICAgIGlmKHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID4gdGhpcy5fY3VycmVudE1pbGxpcyl7XG4gICAgICAgIHRoaXMuX3NjaGVkdWxlci51cGRhdGUoZGlmZilcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3B1bHNlLmJpbmQodGhpcykpXG4gICAgICAgIC8vcmV0dXJuIGJlY2F1c2UgZHVyaW5nIHByZWNvdW50aW5nIG9ubHkgcHJlY291bnQgbWV0cm9ub21lIGV2ZW50cyBnZXQgc2NoZWR1bGVkXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgLT0gdGhpcy5fcHJlY291bnREdXJhdGlvblxuICAgICAgaWYodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcpe1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlXG4gICAgICAgIHRoaXMucmVjb3JkaW5nID0gdHJ1ZVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMucGxheWluZyA9IHRydWVcbiAgICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BsYXknLCBkYXRhOiB0aGlzLl9zdGFydE1pbGxpc30pXG4gICAgICAgIC8vZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BsYXknLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZih0aGlzLl9sb29wICYmIHRoaXMuX2N1cnJlbnRNaWxsaXMgPj0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcyl7XG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzIC09IHRoaXMuX2xvb3BEdXJhdGlvblxuICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgICAgLy90aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcykgLy8gcGxheWhlYWQgaXMgYSBiaXQgYWhlYWQgb25seSBkdXJpbmcgdGhpcyBmcmFtZVxuICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgICAgZGF0YTogbnVsbFxuICAgICAgfSlcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuX3BsYXloZWFkLnVwZGF0ZSgnbWlsbGlzJywgZGlmZilcbiAgICB9XG5cbiAgICB0aGlzLl90aWNrcyA9IHRoaXMuX3BsYXloZWFkLmdldCgpLnRpY2tzXG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2N1cnJlbnRNaWxsaXMsIHRoaXMuX2R1cmF0aW9uTWlsbGlzKVxuXG4gICAgaWYodGhpcy5fY3VycmVudE1pbGxpcyA+PSB0aGlzLl9kdXJhdGlvbk1pbGxpcyl7XG4gICAgICBpZih0aGlzLnJlY29yZGluZyAhPT0gdHJ1ZSB8fCB0aGlzLmF1dG9TaXplICE9PSB0cnVlKXtcbiAgICAgICAgdGhpcy5zdG9wKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBhZGQgYW4gZXh0cmEgYmFyIHRvIHRoZSBzaXplIG9mIHRoaXMgc29uZ1xuICAgICAgbGV0IGV2ZW50cyA9IHRoaXMuX21ldHJvbm9tZS5hZGRFdmVudHModGhpcy5iYXJzLCB0aGlzLmJhcnMgKyAxKVxuICAgICAgbGV0IHRvYmVQYXJzZWQgPSBbLi4uZXZlbnRzLCAuLi50aGlzLl90aW1lRXZlbnRzXVxuICAgICAgc29ydEV2ZW50cyh0b2JlUGFyc2VkKVxuICAgICAgcGFyc2VFdmVudHModG9iZVBhcnNlZClcbiAgICAgIHRoaXMuX3NjaGVkdWxlci5ldmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zY2hlZHVsZXIubnVtRXZlbnRzICs9IGV2ZW50cy5sZW5ndGhcbiAgICAgIGxldCBsYXN0RXZlbnQgPSBldmVudHNbZXZlbnRzLmxlbmd0aCAtIDFdXG4gICAgICBsZXQgZXh0cmFNaWxsaXMgPSBsYXN0RXZlbnQudGlja3NQZXJCYXIgKiBsYXN0RXZlbnQubWlsbGlzUGVyVGlja1xuICAgICAgdGhpcy5fbGFzdEV2ZW50LnRpY2tzICs9IGxhc3RFdmVudC50aWNrc1BlckJhclxuICAgICAgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcyArPSBleHRyYU1pbGxpc1xuICAgICAgdGhpcy5fZHVyYXRpb25NaWxsaXMgKz0gZXh0cmFNaWxsaXNcbiAgICAgIHRoaXMuYmFycysrXG4gICAgICB0aGlzLl9yZXNpemVkID0gdHJ1ZVxuICAgICAgLy9jb25zb2xlLmxvZygnbGVuZ3RoJywgdGhpcy5fbGFzdEV2ZW50LnRpY2tzLCB0aGlzLl9sYXN0RXZlbnQubWlsbGlzLCB0aGlzLmJhcnMsIGxhc3RFdmVudClcbiAgICB9XG5cbiAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKGRpZmYpXG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcHVsc2UuYmluZCh0aGlzKSlcbiAgfVxuXG4gIHBhdXNlKCk6IHZvaWR7XG4gICAgdGhpcy5wYXVzZWQgPSAhdGhpcy5wYXVzZWRcbiAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2VcbiAgICBpZih0aGlzLnBhdXNlZCl7XG4gICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGF1c2UnLCBkYXRhOiB0aGlzLnBhdXNlZH0pXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnBsYXkoKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BhdXNlJywgZGF0YTogdGhpcy5wYXVzZWR9KVxuICAgIH1cbiAgfVxuXG4gIHN0b3AoKTogdm9pZHtcbiAgICAvL2NvbnNvbGUubG9nKCdTVE9QJylcbiAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2VcbiAgICB0aGlzLmFsbE5vdGVzT2ZmKClcbiAgICBpZih0aGlzLnBsYXlpbmcgfHwgdGhpcy5wYXVzZWQpe1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcbiAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcbiAgICB9XG4gICAgaWYodGhpcy5fY3VycmVudE1pbGxpcyAhPT0gMCl7XG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gMFxuICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgICAgaWYodGhpcy5yZWNvcmRpbmcpe1xuICAgICAgICB0aGlzLnN0b3BSZWNvcmRpbmcoKVxuICAgICAgfVxuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3N0b3AnfSlcbiAgICB9XG4gIH1cblxuICBzdGFydFJlY29yZGluZygpe1xuICAgIGlmKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID09PSB0cnVlKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl9yZWNvcmRJZCA9IGByZWNvcmRpbmdfJHtyZWNvcmRpbmdJbmRleCsrfSR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIHRyYWNrLl9zdGFydFJlY29yZGluZyh0aGlzLl9yZWNvcmRJZClcbiAgICB9KVxuICAgIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID0gdHJ1ZVxuICB9XG5cbiAgc3RvcFJlY29yZGluZygpe1xuICAgIGlmKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2suX3N0b3BSZWNvcmRpbmcodGhpcy5fcmVjb3JkSWQpXG4gICAgfSlcbiAgICB0aGlzLnVwZGF0ZSgpXG4gICAgdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPSBmYWxzZVxuICAgIHRoaXMucmVjb3JkaW5nID0gZmFsc2VcbiAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAnc3RvcF9yZWNvcmRpbmcnfSlcbiAgfVxuXG4gIHVuZG9SZWNvcmRpbmcoKXtcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay51bmRvUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICB9XG5cbiAgcmVkb1JlY29yZGluZygpe1xuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIHRyYWNrLnJlZG9SZWNvcmRpbmcodGhpcy5fcmVjb3JkSWQpXG4gICAgfSlcbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cblxuICBzZXRNZXRyb25vbWUoZmxhZyl7XG4gICAgaWYodHlwZW9mIGZsYWcgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMudXNlTWV0cm9ub21lID0gIXRoaXMudXNlTWV0cm9ub21lXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9IGZsYWdcbiAgICB9XG4gICAgdGhpcy5fbWV0cm9ub21lLm11dGUoIXRoaXMudXNlTWV0cm9ub21lKVxuICB9XG5cbiAgY29uZmlndXJlTWV0cm9ub21lKGNvbmZpZyl7XG4gICAgdGhpcy5fbWV0cm9ub21lLmNvbmZpZ3VyZShjb25maWcpXG4gIH1cblxuICBjb25maWd1cmUoY29uZmlnKXtcblxuICB9XG5cbiAgYWxsTm90ZXNPZmYoKXtcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHtcbiAgICAgIHRyYWNrLmFsbE5vdGVzT2ZmKClcbiAgICB9KVxuXG4gICAgLy90aGlzLl9zY2hlZHVsZXIuYWxsTm90ZXNPZmYoKVxuICAgIHRoaXMuX21ldHJvbm9tZS5hbGxOb3Rlc09mZigpXG4gIH1cblxuICBnZXRUcmFja3MoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX3RyYWNrc11cbiAgfVxuXG4gIGdldFBhcnRzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9wYXJ0c11cbiAgfVxuXG4gIGdldEV2ZW50cygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fZXZlbnRzXVxuICB9XG5cbiAgZ2V0Tm90ZXMoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX25vdGVzXVxuICB9XG5cbiAgY2FsY3VsYXRlUG9zaXRpb24oYXJncyl7XG4gICAgcmV0dXJuIGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIGFyZ3MpXG4gIH1cblxuICAvLyBAYXJncyAtPiBzZWUgX2NhbGN1bGF0ZVBvc2l0aW9uXG4gIHNldFBvc2l0aW9uKHR5cGUsIC4uLmFyZ3Mpe1xuXG4gICAgbGV0IHdhc1BsYXlpbmcgPSB0aGlzLnBsYXlpbmdcbiAgICBpZih0aGlzLnBsYXlpbmcpe1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKVxuICAgIH1cblxuICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKVxuICAgIC8vbGV0IG1pbGxpcyA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdtaWxsaXMnKVxuICAgIGlmKHBvc2l0aW9uID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gcG9zaXRpb24ubWlsbGlzXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzKVxuXG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgZGF0YTogcG9zaXRpb25cbiAgICB9KVxuXG4gICAgaWYod2FzUGxheWluZyl7XG4gICAgICB0aGlzLl9wbGF5KClcbiAgICB9ZWxzZXtcbiAgICAgIC8vQHRvZG86IGdldCB0aGlzIGluZm9ybWF0aW9uIGZyb20gbGV0ICdwb3NpdGlvbicgLT4gd2UgaGF2ZSBqdXN0IGNhbGN1bGF0ZWQgdGhlIHBvc2l0aW9uXG4gICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coJ3NldFBvc2l0aW9uJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgfVxuXG4gIGdldFBvc2l0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXloZWFkLmdldCgpLnBvc2l0aW9uXG4gIH1cblxuICBnZXRQbGF5aGVhZCgpe1xuICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKVxuICB9XG5cbiAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuICBzZXRMZWZ0TG9jYXRvcih0eXBlLCAuLi5hcmdzKXtcbiAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKVxuXG4gICAgaWYodGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKXtcbiAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBwb3NpdGlvbiBmb3IgbG9jYXRvcicpXG4gICAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuICBzZXRSaWdodExvY2F0b3IodHlwZSwgLi4uYXJncyl7XG4gICAgdGhpcy5fcmlnaHRMb2NhdG9yID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpXG5cbiAgICBpZih0aGlzLl9yaWdodExvY2F0b3IgPT09IGZhbHNlKXtcbiAgICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIHBvc2l0aW9uIGZvciBsb2NhdG9yJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIHNldExvb3AoZmxhZyA9IG51bGwpe1xuXG4gICAgdGhpcy5fbG9vcCA9IGZsYWcgIT09IG51bGwgPyBmbGFnIDogIXRoaXMuX2xvb3BcblxuICAgIGlmKHRoaXMuX3JpZ2h0TG9jYXRvciA9PT0gZmFsc2UgfHwgdGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKXtcbiAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZVxuICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBsb2NhdG9ycyBjYW4gbm90ICh5ZXQpIGJlIHVzZWQgdG8ganVtcCBvdmVyIGEgc2VnbWVudFxuICAgIGlmKHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMgPD0gdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzKXtcbiAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZVxuICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9sb29wRHVyYXRpb24gPSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzIC0gdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9sb29wLCB0aGlzLl9sb29wRHVyYXRpb24pXG4gICAgdGhpcy5fc2NoZWR1bGVyLmJleW9uZExvb3AgPSB0aGlzLl9jdXJyZW50TWlsbGlzID4gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgIHJldHVybiB0aGlzLl9sb29wXG4gIH1cblxuICBzZXRQcmVjb3VudCh2YWx1ZSA9IDApe1xuICAgIHRoaXMuX3ByZWNvdW50QmFycyA9IHZhbHVlXG4gIH1cblxuICAvKlxuICAgIGhlbHBlciBtZXRob2Q6IGNvbnZlcnRzIHVzZXIgZnJpZW5kbHkgcG9zaXRpb24gZm9ybWF0IHRvIGludGVybmFsIGZvcm1hdFxuXG4gICAgcG9zaXRpb246XG4gICAgICAtICd0aWNrcycsIDk2MDAwXG4gICAgICAtICdtaWxsaXMnLCAxMjM0XG4gICAgICAtICdwZXJjZW50YWdlJywgNTVcbiAgICAgIC0gJ2JhcnNiZWF0cycsIDEsIDQsIDAsIDI1IC0+IGJhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXG4gICAgICAtICd0aW1lJywgMCwgMywgNDksIDU2NiAtPiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG5cbiAgKi9cbiAgX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsIHJlc3VsdFR5cGUpe1xuICAgIGxldCB0YXJnZXRcblxuICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBjYXNlICdwZXJjZW50YWdlJzpcbiAgICAgICAgLy90YXJnZXQgPSBhcmdzWzBdIHx8IDBcbiAgICAgICAgdGFyZ2V0ID0gYXJncyB8fCAwXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICAgIHRhcmdldCA9IGFyZ3NcbiAgICAgICAgYnJlYWtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5sb2coJ3Vuc3VwcG9ydGVkIHR5cGUnKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCB7XG4gICAgICB0eXBlLFxuICAgICAgdGFyZ2V0LFxuICAgICAgcmVzdWx0OiByZXN1bHRUeXBlLFxuICAgIH0pXG5cbiAgICByZXR1cm4gcG9zaXRpb25cbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spe1xuICAgIHJldHVybiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZClcbiAgfVxuXG4gIHNhdmVBc01JRElGaWxlKG5hbWUpe1xuICAgIHNhdmVBc01JRElGaWxlKHRoaXMsIG5hbWUpXG4gIH1cbn1cbiIsIi8vIGNhbGxlZCBieSBzb25nXG5pbXBvcnQge3BhcnNlVGltZUV2ZW50cywgcGFyc2VFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge01JRElFdmVudFR5cGVzfSBmcm9tICcuL2NvbnN0YW50cydcbmltcG9ydCB7Y2FsY3VsYXRlUG9zaXRpb259IGZyb20gJy4vcG9zaXRpb24nXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGUoKTp2b2lke1xuXG4gIGlmKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IGZhbHNlXG4gICAgJiYgdGhpcy5fcmVtb3ZlZEV2ZW50cy5sZW5ndGggPT09IDBcbiAgICAmJiB0aGlzLl9uZXdFdmVudHMubGVuZ3RoID09PSAwXG4gICAgJiYgdGhpcy5fbW92ZWRFdmVudHMubGVuZ3RoID09PSAwXG4gICAgJiYgdGhpcy5fbmV3UGFydHMubGVuZ3RoID09PSAwXG4gICAgJiYgdGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA9PT0gMFxuICAgICYmIHRoaXMuX3Jlc2l6ZWQgPT09IGZhbHNlXG4gICl7XG4gICAgcmV0dXJuXG4gIH1cbiAgLy9kZWJ1Z1xuICAvL3RoaXMuaXNQbGF5aW5nID0gdHJ1ZVxuXG4gIGNvbnNvbGUuZ3JvdXAoJ3VwZGF0ZSBzb25nJylcbiAgY29uc29sZS50aW1lKCd0b3RhbCcpXG5cblxuLy8gVElNRSBFVkVOVFNcblxuICAvLyBjaGVjayBpZiB0aW1lIGV2ZW50cyBhcmUgdXBkYXRlZFxuICBpZih0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSB0cnVlKXtcbiAgICAvL2NvbnNvbGUubG9nKCd1cGRhdGVUaW1lRXZlbnRzJywgdGhpcy5fdGltZUV2ZW50cy5sZW5ndGgpXG4gICAgcGFyc2VUaW1lRXZlbnRzKHRoaXMsIHRoaXMuX3RpbWVFdmVudHMsIHRoaXMuaXNQbGF5aW5nKVxuICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSBmYWxzZVxuICAgIGNvbnNvbGUubG9nKCd0aW1lIGV2ZW50cyAlTycsIHRoaXMuX3RpbWVFdmVudHMpXG4gIH1cblxuICAvLyBvbmx5IHBhcnNlIG5ldyBhbmQgbW92ZWQgZXZlbnRzXG4gIGxldCB0b2JlUGFyc2VkID0gW11cblxuXG4vLyBQQVJUU1xuXG4gIC8vIGZpbHRlciByZW1vdmVkIHBhcnRzXG4gIGNvbnNvbGUubG9nKCdyZW1vdmVkIHBhcnRzICVPJywgdGhpcy5fcmVtb3ZlZFBhcnRzKVxuICB0aGlzLl9yZW1vdmVkUGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZClcbiAgfSlcblxuXG4gIC8vIGFkZCBuZXcgcGFydHNcbiAgY29uc29sZS5sb2coJ25ldyBwYXJ0cyAlTycsIHRoaXMuX25ld1BhcnRzKVxuICB0aGlzLl9uZXdQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgcGFydC5fc29uZyA9IHRoaXNcbiAgICB0aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpXG4gICAgcGFydC51cGRhdGUoKVxuICB9KVxuXG5cbiAgLy8gdXBkYXRlIGNoYW5nZWQgcGFydHNcbiAgY29uc29sZS5sb2coJ2NoYW5nZWQgcGFydHMgJU8nLCB0aGlzLl9jaGFuZ2VkUGFydHMpXG4gIHRoaXMuX2NoYW5nZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgcGFydC51cGRhdGUoKVxuICB9KVxuXG5cbiAgLy8gcmVtb3ZlZCBwYXJ0c1xuICBjb25zb2xlLmxvZygncmVtb3ZlZCBwYXJ0cyAlTycsIHRoaXMuX2NoYW5nZWRQYXJ0cylcbiAgdGhpcy5fcmVtb3ZlZFBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICB0aGlzLl9wYXJ0c0J5SWQuZGVsZXRlKHBhcnQuaWQpXG4gIH0pXG5cbiAgaWYodGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA+IDApe1xuICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpXG4gIH1cblxuXG4vLyBFVkVOVFNcblxuICAvLyBmaWx0ZXIgcmVtb3ZlZCBldmVudHNcbiAgY29uc29sZS5sb2coJ3JlbW92ZWQgZXZlbnRzICVPJywgdGhpcy5fcmVtb3ZlZEV2ZW50cylcbiAgdGhpcy5fcmVtb3ZlZEV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgIHRoaXMuX25vdGVzQnlJZC5kZWxldGUoZXZlbnQubWlkaU5vdGUuaWQpXG4gICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gIH0pXG5cblxuICAvLyBhZGQgbmV3IGV2ZW50c1xuICBjb25zb2xlLmxvZygnbmV3IGV2ZW50cyAlTycsIHRoaXMuX25ld0V2ZW50cylcbiAgdGhpcy5fbmV3RXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgdGhpcy5fZXZlbnRzQnlJZC5zZXQoZXZlbnQuaWQsIGV2ZW50KVxuICAgIHRoaXMuX2V2ZW50cy5wdXNoKGV2ZW50KVxuICAgIHRvYmVQYXJzZWQucHVzaChldmVudClcbiAgfSlcblxuXG4gIC8vIG1vdmVkIGV2ZW50cyBuZWVkIHRvIGJlIHBhcnNlZFxuICBjb25zb2xlLmxvZygnbW92ZWQgJU8nLCB0aGlzLl9tb3ZlZEV2ZW50cylcbiAgdGhpcy5fbW92ZWRFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpXG4gIH0pXG5cblxuICAvLyBwYXJzZSBhbGwgbmV3IGFuZCBtb3ZlZCBldmVudHNcbiAgaWYodG9iZVBhcnNlZC5sZW5ndGggPiAwKXtcbiAgICBjb25zb2xlLnRpbWUoJ3BhcnNlJylcbiAgICAvL2NvbnNvbGUubG9nKCd0b2JlUGFyc2VkICVPJywgdG9iZVBhcnNlZClcbiAgICBjb25zb2xlLmxvZygncGFyc2VFdmVudHMnLCB0b2JlUGFyc2VkLmxlbmd0aClcblxuICAgIHRvYmVQYXJzZWQgPSBbLi4udG9iZVBhcnNlZCwgLi4udGhpcy5fdGltZUV2ZW50c11cbiAgICBwYXJzZUV2ZW50cyh0b2JlUGFyc2VkLCB0aGlzLmlzUGxheWluZylcblxuICAgIC8vIGFkZCBNSURJIG5vdGVzIHRvIHNvbmdcbiAgICB0b2JlUGFyc2VkLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5pZCwgZXZlbnQudHlwZSwgZXZlbnQubWlkaU5vdGUpXG4gICAgICBpZihldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5OT1RFX09OKXtcbiAgICAgICAgaWYoZXZlbnQubWlkaU5vdGUpe1xuICAgICAgICAgIHRoaXMuX25vdGVzQnlJZC5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkLCBldmVudC50eXBlKVxuICAgICAgICAgIC8vdGhpcy5fbm90ZXMucHVzaChldmVudC5taWRpTm90ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgY29uc29sZS50aW1lRW5kKCdwYXJzZScpXG4gIH1cblxuXG4gIGlmKHRvYmVQYXJzZWQubGVuZ3RoID4gMCB8fCB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA+IDApe1xuICAgIGNvbnNvbGUudGltZSgndG8gYXJyYXknKVxuICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSlcbiAgICB0aGlzLl9ub3RlcyA9IEFycmF5LmZyb20odGhpcy5fbm90ZXNCeUlkLnZhbHVlcygpKVxuICAgIGNvbnNvbGUudGltZUVuZCgndG8gYXJyYXknKVxuICB9XG5cblxuICBjb25zb2xlLnRpbWUoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuICBzb3J0RXZlbnRzKHRoaXMuX2V2ZW50cylcbiAgdGhpcy5fbm90ZXMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gYS5ub3RlT24udGlja3MgLSBiLm5vdGVPbi50aWNrc1xuICB9KVxuICBjb25zb2xlLnRpbWVFbmQoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuXG4gIGNvbnNvbGUubG9nKCdub3RlcyAlTycsIHRoaXMuX25vdGVzKVxuICBjb25zb2xlLnRpbWVFbmQoJ3RvdGFsJylcbiAgY29uc29sZS50aW1lRW5kKCd1cGRhdGUgc29uZycpXG5cblxuLy8gU09ORyBEVVJBVElPTlxuXG4gIC8vIGdldCB0aGUgbGFzdCBldmVudCBvZiB0aGlzIHNvbmdcbiAgbGV0IGxhc3RFdmVudCA9IHRoaXMuX2V2ZW50c1t0aGlzLl9ldmVudHMubGVuZ3RoIC0gMV1cbiAgbGV0IGxhc3RUaW1lRXZlbnQgPSB0aGlzLl90aW1lRXZlbnRzW3RoaXMuX3RpbWVFdmVudHMubGVuZ3RoIC0gMV1cblxuICAvLyBjaGVjayBpZiBzb25nIGhhcyBhbHJlYWR5IGFueSBldmVudHNcbiAgaWYobGFzdEV2ZW50IGluc3RhbmNlb2YgTUlESUV2ZW50ID09PSBmYWxzZSl7XG4gICAgbGFzdEV2ZW50ID0gbGFzdFRpbWVFdmVudFxuICB9ZWxzZSBpZihsYXN0VGltZUV2ZW50LnRpY2tzID4gbGFzdEV2ZW50LnRpY2tzKXtcbiAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50XG4gIH1cblxuICAvLyBnZXQgdGhlIHBvc2l0aW9uIGRhdGEgb2YgdGhlIGZpcnN0IGJlYXQgaW4gdGhlIGJhciBhZnRlciB0aGUgbGFzdCBiYXJcbiAgdGhpcy5iYXJzID0gTWF0aC5tYXgobGFzdEV2ZW50LmJhciwgdGhpcy5iYXJzKVxuICBsZXQgdGlja3MgPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgdGFyZ2V0OiBbdGhpcy5iYXJzICsgMV0sXG4gICAgcmVzdWx0OiAndGlja3MnXG4gIH0pLnRpY2tzXG5cbiAgLy8gd2Ugd2FudCB0byBwdXQgdGhlIEVORF9PRl9UUkFDSyBldmVudCBhdCB0aGUgdmVyeSBsYXN0IHRpY2sgb2YgdGhlIGxhc3QgYmFyLCBzbyB3ZSBjYWxjdWxhdGUgdGhhdCBwb3NpdGlvblxuICBsZXQgbWlsbGlzID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcywge1xuICAgIHR5cGU6ICd0aWNrcycsXG4gICAgdGFyZ2V0OiB0aWNrcyAtIDEsXG4gICAgcmVzdWx0OiAnbWlsbGlzJ1xuICB9KS5taWxsaXNcblxuICB0aGlzLl9sYXN0RXZlbnQudGlja3MgPSB0aWNrcyAtIDFcbiAgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuXG4gIGNvbnNvbGUubG9nKCdsZW5ndGgnLCB0aGlzLl9sYXN0RXZlbnQudGlja3MsIHRoaXMuX2xhc3RFdmVudC5taWxsaXMsIHRoaXMuYmFycylcblxuICB0aGlzLl9kdXJhdGlvblRpY2tzID0gdGhpcy5fbGFzdEV2ZW50LnRpY2tzXG4gIHRoaXMuX2R1cmF0aW9uTWlsbGlzID0gdGhpcy5fbGFzdEV2ZW50Lm1pbGxpc1xuXG5cbi8vIE1FVFJPTk9NRVxuXG4gIC8vIGFkZCBtZXRyb25vbWUgZXZlbnRzXG4gIGlmKHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyB8fCB0aGlzLl9tZXRyb25vbWUuYmFycyAhPT0gdGhpcy5iYXJzKXtcbiAgICB0aGlzLl9tZXRyb25vbWVFdmVudHMgPSBwYXJzZUV2ZW50cyhbLi4udGhpcy5fdGltZUV2ZW50cywgLi4udGhpcy5fbWV0cm9ub21lLmdldEV2ZW50cygpXSlcbiAgfVxuICB0aGlzLl9hbGxFdmVudHMgPSBbLi4udGhpcy5fbWV0cm9ub21lRXZlbnRzLCAuLi50aGlzLl9ldmVudHNdXG4gIHNvcnRFdmVudHModGhpcy5fYWxsRXZlbnRzKVxuICAvL2NvbnNvbGUubG9nKCdhbGwgZXZlbnRzICVPJywgdGhpcy5fYWxsRXZlbnRzKVxuXG4vKlxuICB0aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKClcbiAgdGhpcy5fYWxsRXZlbnRzID0gWy4uLnRoaXMuX2V2ZW50c11cbiAgc29ydEV2ZW50cyh0aGlzLl9hbGxFdmVudHMpXG4qL1xuXG4gIGNvbnNvbGUubG9nKCdjdXJyZW50IG1pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gIHRoaXMuX3BsYXloZWFkLnVwZGF0ZVNvbmcoKVxuICB0aGlzLl9zY2hlZHVsZXIuaW5pdCh0aGlzLl9jdXJyZW50TWlsbGlzKVxuICB0aGlzLl9zY2hlZHVsZXIucmVzY2hlZHVsZSgpXG5cbiAgaWYodGhpcy5wbGF5aW5nID09PSBmYWxzZSl7XG4gICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgIGRhdGE6IHRoaXMuX3BsYXloZWFkLmdldCgpLnBvc2l0aW9uXG4gICAgfSlcbiAgfVxuXG4gIC8vIHJlc2V0XG4gIHRoaXMuX25ld1BhcnRzID0gW11cbiAgdGhpcy5fcmVtb3ZlZFBhcnRzID0gW11cbiAgdGhpcy5fbmV3RXZlbnRzID0gW11cbiAgdGhpcy5fbW92ZWRFdmVudHMgPSBbXVxuICB0aGlzLl9yZW1vdmVkRXZlbnRzID0gW11cbiAgdGhpcy5fcmVzaXplZCA9IGZhbHNlXG5cbiAgY29uc29sZS5ncm91cEVuZCgndXBkYXRlIHNvbmcnKVxufVxuIiwiaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5pbXBvcnQge3BhcnNlTUlESUZpbGV9IGZyb20gJy4vbWlkaWZpbGUnXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtQYXJ0fSBmcm9tICcuL3BhcnQnXG5pbXBvcnQge1RyYWNrfSBmcm9tICcuL3RyYWNrJ1xuaW1wb3J0IHtTb25nfSBmcm9tICcuL3NvbmcnXG5pbXBvcnQge2Jhc2U2NFRvQmluYXJ5fSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge3N0YXR1cywganNvbiwgYXJyYXlCdWZmZXJ9IGZyb20gJy4vZmV0Y2hfaGVscGVycydcblxuY29uc3QgUFBRID0gOTYwXG5cblxuZnVuY3Rpb24gdG9Tb25nKHBhcnNlZCl7XG4gIGxldCB0cmFja3MgPSBwYXJzZWQudHJhY2tzXG4gIGxldCBwcHEgPSBwYXJzZWQuaGVhZGVyLnRpY2tzUGVyQmVhdFxuICBsZXQgcHBxRmFjdG9yID0gUFBRIC8gcHBxIC8vQFRPRE86IGdldCBwcHEgZnJvbSBjb25maWcgLT4gb25seSBuZWNlc3NhcnkgaWYgeW91IHdhbnQgdG8gY2hhbmdlIHRoZSBwcHEgb2YgdGhlIE1JREkgZmlsZSAhXG4gIGxldCB0aW1lRXZlbnRzID0gW11cbiAgbGV0IGJwbSA9IC0xXG4gIGxldCBub21pbmF0b3IgPSAtMVxuICBsZXQgZGVub21pbmF0b3IgPSAtMVxuICBsZXQgbmV3VHJhY2tzID0gW11cblxuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcy52YWx1ZXMoKSl7XG4gICAgbGV0IGxhc3RUaWNrcywgbGFzdFR5cGVcbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IHR5cGVcbiAgICBsZXQgY2hhbm5lbCA9IC0xXG4gICAgbGV0IHRyYWNrTmFtZVxuICAgIGxldCB0cmFja0luc3RydW1lbnROYW1lXG4gICAgbGV0IGV2ZW50cyA9IFtdO1xuXG4gICAgZm9yKGxldCBldmVudCBvZiB0cmFjayl7XG4gICAgICB0aWNrcyArPSAoZXZlbnQuZGVsdGFUaW1lICogcHBxRmFjdG9yKTtcblxuICAgICAgaWYoY2hhbm5lbCA9PT0gLTEgJiYgdHlwZW9mIGV2ZW50LmNoYW5uZWwgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY2hhbm5lbCA9IGV2ZW50LmNoYW5uZWw7XG4gICAgICB9XG4gICAgICB0eXBlID0gZXZlbnQuc3VidHlwZTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVsdGFUaW1lLCB0aWNrcywgdHlwZSk7XG5cbiAgICAgIHN3aXRjaChldmVudC5zdWJ0eXBlKXtcblxuICAgICAgICBjYXNlICd0cmFja05hbWUnOlxuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnaW5zdHJ1bWVudE5hbWUnOlxuICAgICAgICAgIGlmKGV2ZW50LnRleHQpe1xuICAgICAgICAgICAgdHJhY2tJbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg5MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPZmYnOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4ODAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSlcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdzZXRUZW1wbyc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGVtcG8gZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGxldCB0bXAgPSA2MDAwMDAwMCAvIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQ7XG5cbiAgICAgICAgICBpZih0aWNrcyA9PT0gbGFzdFRpY2tzICYmIHR5cGUgPT09IGxhc3RUeXBlKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKCd0ZW1wbyBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCB0bXApO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihicG0gPT09IC0xKXtcbiAgICAgICAgICAgIGJwbSA9IHRtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4NTEsIHRtcCkpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZVNpZ25hdHVyZSc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGlmKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpe1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCd0aW1lIHNpZ25hdHVyZSBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYobm9taW5hdG9yID09PSAtMSl7XG4gICAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5udW1lcmF0b3JcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3JcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4NTgsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpKVxuICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSAnY29udHJvbGxlcic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhCMCwgZXZlbnQuY29udHJvbGxlclR5cGUsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncHJvZ3JhbUNoYW5nZSc6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhDMCwgZXZlbnQucHJvZ3JhbU51bWJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3BpdGNoQmVuZCc6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhFMCwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vY29uc29sZS5sb2codHJhY2submFtZSwgZXZlbnQudHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGxhc3RUeXBlID0gdHlwZVxuICAgICAgbGFzdFRpY2tzID0gdGlja3NcbiAgICB9XG5cbiAgICBpZihldmVudHMubGVuZ3RoID4gMCl7XG4gICAgICAvL2NvbnNvbGUuY291bnQoZXZlbnRzLmxlbmd0aClcbiAgICAgIGxldCBuZXdUcmFjayA9IG5ldyBUcmFjayh0cmFja05hbWUpXG4gICAgICBsZXQgcGFydCA9IG5ldyBQYXJ0KClcbiAgICAgIG5ld1RyYWNrLmFkZFBhcnRzKHBhcnQpXG4gICAgICBwYXJ0LmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgICBuZXdUcmFja3MucHVzaChuZXdUcmFjaylcbiAgICB9XG4gIH1cblxuICBsZXQgc29uZyA9IG5ldyBTb25nKHtcbiAgICBwcHE6IFBQUSxcbiAgICBwbGF5YmFja1NwZWVkOiAxLFxuICAgIC8vcHBxLFxuICAgIGJwbSxcbiAgICBub21pbmF0b3IsXG4gICAgZGVub21pbmF0b3JcbiAgfSlcbiAgc29uZy5hZGRUcmFja3MoLi4ubmV3VHJhY2tzKVxuICBzb25nLmFkZFRpbWVFdmVudHMoLi4udGltZUV2ZW50cylcbiAgc29uZy51cGRhdGUoKVxuICByZXR1cm4gc29uZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZVN5bmMoZGF0YSwgc2V0dGluZ3MgPSB7fSl7XG4gIGxldCBzb25nID0gbnVsbDtcblxuICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgIGxldCBidWZmZXIgPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgICBzb25nID0gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gIH1lbHNlIGlmKHR5cGVvZiBkYXRhLmhlYWRlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRhdGEudHJhY2tzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgc29uZyA9IHRvU29uZyhkYXRhKTtcbiAgfWVsc2V7XG4gICAgZGF0YSA9IGJhc2U2NFRvQmluYXJ5KGRhdGEpO1xuICAgIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gICAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgICBzb25nID0gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKCd3cm9uZyBkYXRhJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNvbmdcbiAgLy8ge1xuICAvLyAgIHBwcSA9IG5ld1BQUSxcbiAgLy8gICBicG0gPSBuZXdCUE0sXG4gIC8vICAgcGxheWJhY2tTcGVlZCA9IG5ld1BsYXliYWNrU3BlZWQsXG4gIC8vIH0gPSBzZXR0aW5nc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlKHVybCl7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gZmV0Y2godXJsLCB7XG4gICAgLy8gICBtb2RlOiAnbm8tY29ycydcbiAgICAvLyB9KVxuICAgIGZldGNoKHVybClcbiAgICAudGhlbihzdGF0dXMpXG4gICAgLnRoZW4oYXJyYXlCdWZmZXIpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICByZXNvbHZlKHNvbmdGcm9tTUlESUZpbGVTeW5jKGRhdGEpKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cbiIsImltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7TUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuaW1wb3J0IHtnZXRNSURJSW5wdXRCeUlkLCBnZXRNSURJT3V0cHV0QnlJZH0gZnJvbSAnLi9pbml0X21pZGknXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9xYW1iaSdcblxuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFRyYWNre1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IG51bGwpe1xuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcbiAgICB0aGlzLmNoYW5uZWwgPSAwXG4gICAgdGhpcy5tdXRlZCA9IGZhbHNlXG4gICAgdGhpcy52b2x1bWUgPSAwLjVcbiAgICB0aGlzLl9vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMuX291dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLl9taWRpSW5wdXRzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fbWlkaU91dHB1dHMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9zb25nID0gbnVsbFxuICAgIHRoaXMuX3BhcnRzID0gW11cbiAgICB0aGlzLl9wYXJ0c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgdGhpcy5sYXRlbmN5ID0gMTAwXG4gICAgdGhpcy5faW5zdHJ1bWVudCA9IG51bGxcbiAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fcmVjb3JkZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcyA9IHt9XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICAgIC8vdGhpcy5zZXRJbnN0cnVtZW50KG5ldyBJbnN0cnVtZW50KCdzaW5ld2F2ZScpKVxuICB9XG5cbiAgc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50ID0gbnVsbCl7XG4gICAgaWYoaW5zdHJ1bWVudCAhPT0gbnVsbFxuICAgICAgLy8gY2hlY2sgaWYgdGhlIG1hbmRhdG9yeSBmdW5jdGlvbnMgb2YgYW4gaW5zdHJ1bWVudCBhcmUgcHJlc2VudCAoSW50ZXJmYWNlIEluc3RydW1lbnQpXG4gICAgICAmJiB0eXBlb2YgaW5zdHJ1bWVudC5jb25uZWN0ID09PSAnZnVuY3Rpb24nXG4gICAgICAmJiB0eXBlb2YgaW5zdHJ1bWVudC5kaXNjb25uZWN0ID09PSAnZnVuY3Rpb24nXG4gICAgICAmJiB0eXBlb2YgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50ID09PSAnZnVuY3Rpb24nXG4gICAgICAmJiB0eXBlb2YgaW5zdHJ1bWVudC5hbGxOb3Rlc09mZiA9PT0gJ2Z1bmN0aW9uJ1xuICAgICl7XG4gICAgICB0aGlzLnJlbW92ZUluc3RydW1lbnQoKVxuICAgICAgdGhpcy5faW5zdHJ1bWVudCA9IGluc3RydW1lbnRcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuY29ubmVjdCh0aGlzLl9vdXRwdXQpXG4gICAgfWVsc2UgaWYoaW5zdHJ1bWVudCA9PT0gbnVsbCl7XG4gICAgICAvLyBpZiB5b3UgcGFzcyBudWxsIGFzIGFyZ3VtZW50IHRoZSBjdXJyZW50IGluc3RydW1lbnQgd2lsbCBiZSByZW1vdmVkLCBzYW1lIGFzIHJlbW92ZUluc3RydW1lbnRcbiAgICAgIHRoaXMucmVtb3ZlSW5zdHJ1bWVudCgpXG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBpbnN0cnVtZW50LCBhbmQgaW5zdHJ1bWVudCBzaG91bGQgaGF2ZSB0aGUgbWV0aG9kcyBcImNvbm5lY3RcIiwgXCJkaXNjb25uZWN0XCIsIFwicHJvY2Vzc01JRElFdmVudFwiIGFuZCBcImFsbE5vdGVzT2ZmXCInKVxuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUluc3RydW1lbnQoKXtcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICAgICAgdGhpcy5faW5zdHJ1bWVudC5kaXNjb25uZWN0KClcbiAgICAgIHRoaXMuX2luc3RydW1lbnQgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgZ2V0SW5zdHJ1bWVudCgpe1xuICAgIHJldHVybiB0aGlzLl9pbnN0cnVtZW50XG4gIH1cblxuICBjb25uZWN0KG91dHB1dCl7XG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3Qob3V0cHV0KVxuICB9XG5cbiAgZGlzY29ubmVjdCgpe1xuICAgIHRoaXMuX291dHB1dC5kaXNjb25uZWN0KClcbiAgfVxuXG4gIGNvbm5lY3RNSURJT3V0cHV0cyguLi5vdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gICAgb3V0cHV0cy5mb3JFYWNoKG91dHB1dCA9PiB7XG4gICAgICBpZih0eXBlb2Ygb3V0cHV0ID09PSAnc3RyaW5nJyl7XG4gICAgICAgIG91dHB1dCA9IGdldE1JRElPdXRwdXRCeUlkKG91dHB1dClcbiAgICAgIH1cbiAgICAgIGlmKG91dHB1dCBpbnN0YW5jZW9mIE1JRElPdXRwdXQpe1xuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5zZXQob3V0cHV0LmlkLCBvdXRwdXQpXG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlPdXRwdXRzKVxuICB9XG5cbiAgZGlzY29ubmVjdE1JRElPdXRwdXRzKC4uLm91dHB1dHMpe1xuICAgIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgICBpZihvdXRwdXRzLmxlbmd0aCA9PT0gMCl7XG4gICAgICB0aGlzLl9taWRpT3V0cHV0cy5jbGVhcigpXG4gICAgfVxuICAgIG91dHB1dHMuZm9yRWFjaChwb3J0ID0+IHtcbiAgICAgIGlmKHBvcnQgaW5zdGFuY2VvZiBNSURJT3V0cHV0KXtcbiAgICAgICAgcG9ydCA9IHBvcnQuaWRcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuX21pZGlPdXRwdXRzLmhhcyhwb3J0KSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3JlbW92aW5nJywgdGhpcy5fbWlkaU91dHB1dHMuZ2V0KHBvcnQpLm5hbWUpXG4gICAgICAgIHRoaXMuX21pZGlPdXRwdXRzLmRlbGV0ZShwb3J0KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy90aGlzLl9taWRpT3V0cHV0cyA9IHRoaXMuX21pZGlPdXRwdXRzLmZpbHRlciguLi5vdXRwdXRzKVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaU91dHB1dHMpXG4gIH1cblxuICBjb25uZWN0TUlESUlucHV0cyguLi5pbnB1dHMpe1xuICAgIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgIGlmKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpe1xuICAgICAgICBpbnB1dCA9IGdldE1JRElJbnB1dEJ5SWQoaW5wdXQpXG4gICAgICB9XG4gICAgICBpZihpbnB1dCBpbnN0YW5jZW9mIE1JRElJbnB1dCl7XG5cbiAgICAgICAgdGhpcy5fbWlkaUlucHV0cy5zZXQoaW5wdXQuaWQsIGlucHV0KVxuXG4gICAgICAgIGxldCBub3RlLCBtaWRpRXZlbnRcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBlID0+IHtcblxuICAgICAgICAgIG1pZGlFdmVudCA9IG5ldyBNSURJRXZlbnQodGhpcy5fc29uZy5fdGlja3MsIC4uLmUuZGF0YSlcbiAgICAgICAgICBtaWRpRXZlbnQudGltZSA9IDAgLy8gcGxheSBpbW1lZGlhdGVseSAtPiBzZWUgSW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50XG4gICAgICAgICAgbWlkaUV2ZW50LnJlY29yZE1pbGxpcyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG5cbiAgICAgICAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuTk9URV9PTil7XG4gICAgICAgICAgICBub3RlID0gbmV3IE1JRElOb3RlKG1pZGlFdmVudClcbiAgICAgICAgICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMuc2V0KG1pZGlFdmVudC5kYXRhMSwgbm90ZSlcbiAgICAgICAgICB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuTk9URV9PRkYpe1xuICAgICAgICAgICAgbm90ZSA9IHRoaXMuX3RtcFJlY29yZGVkTm90ZXMuZ2V0KG1pZGlFdmVudC5kYXRhMSlcbiAgICAgICAgICAgIG5vdGUuYWRkTm90ZU9mZihtaWRpRXZlbnQpXG4gICAgICAgICAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmRlbGV0ZShtaWRpRXZlbnQuZGF0YTEpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYodGhpcy5fcmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknICYmIHRoaXMuX3NvbmcucmVjb3JkaW5nID09PSB0cnVlKXtcbiAgICAgICAgICAgIHRoaXMuX3JlY29yZGVkRXZlbnRzLnB1c2gobWlkaUV2ZW50KVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnByb2Nlc3NNSURJRXZlbnQobWlkaUV2ZW50KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICB9XG5cbiAgZGlzY29ubmVjdE1JRElJbnB1dHMoLi4uaW5wdXRzKXtcbiAgICBpZihpbnB1dHMubGVuZ3RoID09PSAwKXtcbiAgICAgIHRoaXMuX21pZGlJbnB1dHMuY2xlYXIoKVxuICAgIH1cbiAgICBpbnB1dHMuZm9yRWFjaChwb3J0ID0+IHtcbiAgICAgIGlmKHBvcnQgaW5zdGFuY2VvZiBNSURJSW5wdXQpe1xuICAgICAgICBwb3J0ID0gcG9ydC5pZFxuICAgICAgfVxuICAgICAgaWYodGhpcy5fbWlkaU91dHB1dHMuaGFzKHBvcnQpKXtcbiAgICAgICAgdGhpcy5fbWlkaU91dHB1dHMuZGVsZXRlKHBvcnQpXG4gICAgICB9XG4gICAgfSlcbiAgICAvL3RoaXMuX21pZGlPdXRwdXRzID0gdGhpcy5fbWlkaU91dHB1dHMuZmlsdGVyKC4uLm91dHB1dHMpXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICB9XG5cbiAgZ2V0TUlESUlucHV0cygpe1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX21pZGlJbnB1dHMudmFsdWVzKCkpXG4gIH1cblxuICBnZXRNSURJT3V0cHV0cygpe1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKVxuICB9XG5cbiAgc2V0UmVjb3JkRW5hYmxlZCh0eXBlKXsgLy8gJ21pZGknLCAnYXVkaW8nLCBlbXB0eSBvciBhbnl0aGluZyB3aWxsIGRpc2FibGUgcmVjb3JkaW5nXG4gICAgdGhpcy5fcmVjb3JkRW5hYmxlZCA9IHR5cGVcbiAgfVxuXG4gIF9zdGFydFJlY29yZGluZyhyZWNvcmRJZCl7XG4gICAgaWYodGhpcy5fcmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKXtcbiAgICAgIC8vY29uc29sZS5sb2cocmVjb3JkSWQpXG4gICAgICB0aGlzLl9yZWNvcmRJZCA9IHJlY29yZElkXG4gICAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdXG4gICAgICB0aGlzLl9yZWNvcmRQYXJ0ID0gbmV3IFBhcnQodGhpcy5fcmVjb3JkSWQpXG4gICAgfVxuICB9XG5cbiAgX3N0b3BSZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYodGhpcy5fcmVjb3JkZWRFdmVudHMubGVuZ3RoID09PSAwKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl9yZWNvcmRQYXJ0LmFkZEV2ZW50cyguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgICAvL3RoaXMuX3NvbmcuX25ld0V2ZW50cy5wdXNoKC4uLnRoaXMuX3JlY29yZGVkRXZlbnRzKVxuICAgIHRoaXMuYWRkUGFydHModGhpcy5fcmVjb3JkUGFydClcbiAgfVxuXG4gIHVuZG9SZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5yZW1vdmVQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KVxuICAgIC8vdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX3JlY29yZGVkRXZlbnRzKVxuICB9XG5cbiAgcmVkb1JlY29yZGluZyhyZWNvcmRJZCl7XG4gICAgaWYodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmFkZFBhcnRzKHRoaXMuX3JlY29yZFBhcnQpXG4gIH1cblxuICBjb3B5KCl7XG4gICAgbGV0IHQgPSBuZXcgVHJhY2sodGhpcy5uYW1lICsgJ19jb3B5JykgLy8gaW1wbGVtZW50IGdldE5hbWVPZkNvcHkoKSBpbiB1dGlsIChzZWUgaGVhcnRiZWF0KVxuICAgIGxldCBwYXJ0cyA9IFtdXG4gICAgdGhpcy5fcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIGxldCBjb3B5ID0gcGFydC5jb3B5KClcbiAgICAgIGNvbnNvbGUubG9nKGNvcHkpXG4gICAgICBwYXJ0cy5wdXNoKGNvcHkpXG4gICAgfSlcbiAgICB0LmFkZFBhcnRzKC4uLnBhcnRzKVxuICAgIHQudXBkYXRlKClcbiAgICByZXR1cm4gdFxuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnRyYW5zcG9zZShhbW91bnQpXG4gICAgfSlcbiAgfVxuXG4gIGFkZFBhcnRzKC4uLnBhcnRzKXtcbiAgICBsZXQgc29uZyA9IHRoaXMuX3NvbmdcblxuICAgIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcblxuICAgICAgcGFydC5fdHJhY2sgPSB0aGlzXG4gICAgICB0aGlzLl9wYXJ0cy5wdXNoKHBhcnQpXG4gICAgICB0aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpXG5cbiAgICAgIGxldCBldmVudHMgPSBwYXJ0Ll9ldmVudHNcbiAgICAgIHRoaXMuX2V2ZW50cy5wdXNoKC4uLmV2ZW50cylcblxuICAgICAgaWYoc29uZyl7XG4gICAgICAgIHBhcnQuX3NvbmcgPSBzb25nXG4gICAgICAgIHNvbmcuX25ld1BhcnRzLnB1c2gocGFydClcbiAgICAgICAgc29uZy5fbmV3RXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdGhpc1xuICAgICAgICBpZihzb25nKXtcbiAgICAgICAgICBldmVudC5fc29uZyA9IHNvbmdcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICByZW1vdmVQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG5cbiAgICBwYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0Ll90cmFjayA9IG51bGxcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCwgcGFydClcblxuICAgICAgbGV0IGV2ZW50cyA9IHBhcnQuX2V2ZW50c1xuXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgc29uZy5fcmVtb3ZlZFBhcnRzLnB1c2gocGFydClcbiAgICAgICAgc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIH1cblxuICAgICAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgICBldmVudC5fdHJhY2sgPSBudWxsXG4gICAgICAgIGlmKHNvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkLCBldmVudClcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZVxuICB9XG5cbiAgZ2V0UGFydHMoKXtcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSl7XG4gICAgICB0aGlzLl9wYXJ0cyA9IEFycmF5LmZyb20odGhpcy5fcGFydHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX3BhcnRzXVxuICB9XG5cblxuICB0cmFuc3Bvc2VQYXJ0cyhhbW91bnQ6IG51bWJlciwgLi4ucGFydHMpe1xuICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBwYXJ0LnRyYW5zcG9zZShhbW91bnQpXG4gICAgfSlcbiAgfVxuXG4gIG1vdmVQYXJ0cyh0aWNrczogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQubW92ZSh0aWNrcylcbiAgICB9KVxuICB9XG5cbiAgbW92ZVBhcnRzVG8odGlja3M6IG51bWJlciwgLi4ucGFydHMpe1xuICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBwYXJ0Lm1vdmVUbyh0aWNrcylcbiAgICB9KVxuICB9XG4vKlxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0KClcbiAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgdGhpcy5hZGRQYXJ0cyhwKVxuICB9XG4qL1xuICByZW1vdmVFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcGFydHMgPSBuZXcgU2V0KClcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIHBhcnRzLnNldChldmVudC5fcGFydClcbiAgICAgIGV2ZW50Ll9wYXJ0ID0gbnVsbFxuICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbFxuICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHModGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBsZXQgcGFydHMgPSBuZXcgU2V0KClcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCguLi5BcnJheS5mcm9tKHBhcnRzLmVudHJpZXMoKSkpXG4gICAgfVxuICB9XG5cbiAgbW92ZUV2ZW50c1RvKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlVG8odGlja3MpXG4gICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCguLi5BcnJheS5mcm9tKHBhcnRzLmVudHJpZXMoKSkpXG4gICAgfVxuICB9XG5cbiAgZ2V0RXZlbnRzKGZpbHRlcjogc3RyaW5nW10gPSBudWxsKXsgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c10gLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgfVxuXG4gIG11dGUoZmxhZzogYm9vbGVhbiA9IG51bGwpe1xuICAgIGlmKGZsYWcpe1xuICAgICAgdGhpcy5fbXV0ZWQgPSBmbGFnXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9tdXRlZCA9ICF0aGlzLl9tdXRlZFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpeyAvLyB5b3Ugc2hvdWxkIG9ubHkgdXNlIHRoaXMgaW4gaHVnZSBzb25ncyAoPjEwMCB0cmFja3MpXG4gICAgaWYodGhpcy5fY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB9XG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICB9XG5cbiAgYWxsTm90ZXNPZmYoKXtcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICAgIH1cblxuICAgIGxldCB0aW1lU3RhbXAgPSAoY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApICsgdGhpcy5sYXRlbmN5XG4gICAgZm9yKGxldCBvdXRwdXQgb2YgdGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpe1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aW1lU3RhbXApIC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gICAgfVxuICB9XG5cbiAgc2V0UGFubmluZygpe1xuICAgIC8vIGFkZCBwYW5uZXJub2RlIC0+IHJldmVyYiB3aWxsIGJlIGFuIGNoYW5uZWwgRlhcbiAgfVxuXG4gIGFkZEVmZmVjdCgpe1xuXG4gIH1cblxuICBhZGRFZmZlY3RBdChpbmRleDogbnVtYmVyKXtcblxuICB9XG5cbiAgcmVtb3ZlRWZmZWN0KGluZGV4OiBudW1iZXIpe1xuXG4gIH1cblxuICBnZXRFZmZlY3RzKCl7XG5cbiAgfVxuXG4gIGdldEVmZmVjdEF0KGluZGV4OiBudW1iZXIpe1xuXG4gIH1cblxuICAvLyBtZXRob2QgaXMgY2FsbGVkIGJ5IHNjaGVkdWxlciBkdXJpbmcgcGxheWJhY2sgYW5kIGRpcmVjdGx5IHdoZW4gdXNlZCB3aXRoIGFuIGV4dGVybmFsIGtleWJvYXJkXG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHVzZUxhdGVuY3kgPSBmYWxzZSl7XG5cbiAgICBsZXQgbGF0ZW5jeSA9IHVzZUxhdGVuY3kgPyB0aGlzLmxhdGVuY3kgOiAwXG5cbiAgICAvLyBzZW5kIHRvIGphdmFzY3JpcHQgaW5zdHJ1bWVudFxuICAgIGlmKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpe1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLm5hbWUsIGV2ZW50KVxuICAgICAgdGhpcy5faW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KGV2ZW50LCBldmVudC50aW1lIC8gMTAwMClcbiAgICB9XG5cbiAgICAvLyBzZW5kIHRvIGV4dGVybmFsIGhhcmR3YXJlIG9yIHNvZnR3YXJlIGluc3RydW1lbnRcbiAgICBmb3IobGV0IHBvcnQgb2YgdGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpe1xuICAgICAgaWYocG9ydCl7XG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDEyOCB8fCBldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMl0sIGV2ZW50LnRpbWUgKyBsYXRlbmN5KVxuICAgICAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxOTIgfHwgZXZlbnQudHlwZSA9PT0gMjI0KXtcbiAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExXSwgZXZlbnQudGltZSArIGxhdGVuY3kpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIGlmKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpe1xuICAgICAgdGhpcy5faW5zdHJ1bWVudC5hbGxOb3Rlc09mZigpXG4gICAgfVxuICB9XG5cbn1cbiIsImltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuXG5jb25zdFxuICBtUEkgPSBNYXRoLlBJLFxuICBtUG93ID0gTWF0aC5wb3csXG4gIG1Sb3VuZCA9IE1hdGgucm91bmQsXG4gIG1GbG9vciA9IE1hdGguZmxvb3IsXG4gIG1SYW5kb20gPSBNYXRoLnJhbmRvbVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROaWNlVGltZShtaWxsaXMpe1xuICBsZXQgaCwgbSwgcywgbXMsXG4gICAgc2Vjb25kcyxcbiAgICB0aW1lQXNTdHJpbmcgPSAnJztcblxuICBzZWNvbmRzID0gbWlsbGlzIC8gMTAwMDsgLy8g4oaSIG1pbGxpcyB0byBzZWNvbmRzXG4gIGggPSBtRmxvb3Ioc2Vjb25kcyAvICg2MCAqIDYwKSk7XG4gIG0gPSBtRmxvb3IoKHNlY29uZHMgJSAoNjAgKiA2MCkpIC8gNjApO1xuICBzID0gbUZsb29yKHNlY29uZHMgJSAoNjApKTtcbiAgbXMgPSBtUm91bmQoKHNlY29uZHMgLSAoaCAqIDM2MDApIC0gKG0gKiA2MCkgLSBzKSAqIDEwMDApO1xuXG4gIHRpbWVBc1N0cmluZyArPSBoICsgJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbSA8IDEwID8gJzAnICsgbSA6IG07XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBzIDwgMTAgPyAnMCcgKyBzIDogcztcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG1zID09PSAwID8gJzAwMCcgOiBtcyA8IDEwID8gJzAwJyArIG1zIDogbXMgPCAxMDAgPyAnMCcgKyBtcyA6IG1zO1xuXG4gIC8vY29uc29sZS5sb2coaCwgbSwgcywgbXMpO1xuICByZXR1cm4ge1xuICAgIGhvdXI6IGgsXG4gICAgbWludXRlOiBtLFxuICAgIHNlY29uZDogcyxcbiAgICBtaWxsaXNlY29uZDogbXMsXG4gICAgdGltZUFzU3RyaW5nOiB0aW1lQXNTdHJpbmcsXG4gICAgdGltZUFzQXJyYXk6IFtoLCBtLCBzLCBtc11cbiAgfTtcbn1cblxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CaW5hcnkoaW5wdXQpe1xuICBsZXQga2V5U3RyID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JyxcbiAgICBieXRlcywgdWFycmF5LCBidWZmZXIsXG4gICAgbGtleTEsIGxrZXkyLFxuICAgIGNocjEsIGNocjIsIGNocjMsXG4gICAgZW5jMSwgZW5jMiwgZW5jMywgZW5jNCxcbiAgICBpLCBqID0gMDtcblxuICBieXRlcyA9IE1hdGguY2VpbCgoMyAqIGlucHV0Lmxlbmd0aCkgLyA0LjApO1xuICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXMpO1xuICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gIGxrZXkxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aCAtIDEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBpZihsa2V5MSA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG4gIGlmKGxrZXkyID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcblxuICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXFw9XS9nLCAnJyk7XG5cbiAgZm9yKGkgPSAwOyBpIDwgYnl0ZXM7IGkgKz0gMykge1xuICAgIC8vZ2V0IHRoZSAzIG9jdGVjdHMgaW4gNCBhc2NpaSBjaGFyc1xuICAgIGVuYzEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMzID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzQgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cbiAgICBjaHIxID0gKGVuYzEgPDwgMikgfCAoZW5jMiA+PiA0KTtcbiAgICBjaHIyID0gKChlbmMyICYgMTUpIDw8IDQpIHwgKGVuYzMgPj4gMik7XG4gICAgY2hyMyA9ICgoZW5jMyAmIDMpIDw8IDYpIHwgZW5jNDtcblxuICAgIHVhcnJheVtpXSA9IGNocjE7XG4gICAgaWYoZW5jMyAhPSA2NCkgdWFycmF5W2krMV0gPSBjaHIyO1xuICAgIGlmKGVuYzQgIT0gNjQpIHVhcnJheVtpKzJdID0gY2hyMztcbiAgfVxuICAvL2NvbnNvbGUubG9nKGJ1ZmZlcik7XG4gIHJldHVybiBidWZmZXI7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVTdHJpbmcobyl7XG4gIGlmKHR5cGVvZiBvICE9ICdvYmplY3QnKXtcbiAgICByZXR1cm4gdHlwZW9mIG87XG4gIH1cblxuICBpZihvID09PSBudWxsKXtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG5cbiAgLy9vYmplY3QsIGFycmF5LCBmdW5jdGlvbiwgZGF0ZSwgcmVnZXhwLCBzdHJpbmcsIG51bWJlciwgYm9vbGVhbiwgZXJyb3JcbiAgbGV0IGludGVybmFsQ2xhc3MgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdFxccyhcXHcrKVxcXS8pWzFdO1xuICByZXR1cm4gaW50ZXJuYWxDbGFzcy50b0xvd2VyQ2FzZSgpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzb3J0RXZlbnRzKGV2ZW50cyl7XG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgbGV0IHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgIHIgPSAtMVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJcbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmQmFzZTY0KGRhdGEpe1xuICBsZXQgcGFzc2VkID0gdHJ1ZTtcbiAgdHJ5e1xuICAgIGF0b2IoZGF0YSk7XG4gIH1jYXRjaChlKXtcbiAgICBwYXNzZWQgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gcGFzc2VkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXF1YWxQb3dlckN1cnZlKG51bVN0ZXBzLCB0eXBlLCBtYXhWYWx1ZSkge1xuICBsZXQgaSwgdmFsdWUsIHBlcmNlbnQsXG4gICAgdmFsdWVzID0gbmV3IEZsb2F0MzJBcnJheShudW1TdGVwcylcblxuICBmb3IoaSA9IDA7IGkgPCBudW1TdGVwczsgaSsrKXtcbiAgICBwZXJjZW50ID0gaSAvIG51bVN0ZXBzXG4gICAgaWYodHlwZSA9PT0gJ2ZhZGVJbicpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcygoMS4wIC0gcGVyY2VudCkgKiAwLjUgKiBtUEkpICogbWF4VmFsdWVcbiAgICB9ZWxzZSBpZih0eXBlID09PSAnZmFkZU91dCcpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcyhwZXJjZW50ICogMC41ICogTWF0aC5QSSkgKiBtYXhWYWx1ZVxuICAgIH1cbiAgICB2YWx1ZXNbaV0gPSB2YWx1ZVxuICAgIGlmKGkgPT09IG51bVN0ZXBzIC0gMSl7XG4gICAgICB2YWx1ZXNbaV0gPSB0eXBlID09PSAnZmFkZUluJyA/IDEgOiAwXG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tNSURJTnVtYmVyKHZhbHVlKXtcbiAgLy9jb25zb2xlLmxvZyh2YWx1ZSk7XG4gIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZih2YWx1ZSA8IDAgfHwgdmFsdWUgPiAxMjcpe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxMjcnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5cbi8qXG4vL29sZCBzY2hvb2wgYWpheFxuXG5leHBvcnQgZnVuY3Rpb24gYWpheChjb25maWcpe1xuICBsZXRcbiAgICByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgbWV0aG9kID0gdHlwZW9mIGNvbmZpZy5tZXRob2QgPT09ICd1bmRlZmluZWQnID8gJ0dFVCcgOiBjb25maWcubWV0aG9kLFxuICAgIGZpbGVTaXplO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICByZWplY3QgPSByZWplY3QgfHwgZnVuY3Rpb24oKXt9O1xuICAgIHJlc29sdmUgPSByZXNvbHZlIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApe1xuICAgICAgICByZWplY3QocmVxdWVzdC5zdGF0dXMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgIGZpbGVTaXplID0gcmVxdWVzdC5yZXNwb25zZS5sZW5ndGg7XG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSwgZmlsZVNpemUpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICBjb25maWcub25FcnJvcihlKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgY29uZmlnLnVybCwgdHJ1ZSk7XG5cbiAgICBpZihjb25maWcub3ZlcnJpZGVNaW1lVHlwZSl7XG4gICAgICByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUpe1xuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKG1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcuZGF0YSl7XG4gICAgICByZXF1ZXN0LnNlbmQoY29uZmlnLmRhdGEpO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cbiovIl19
