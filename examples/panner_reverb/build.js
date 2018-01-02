(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":48}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChannelEffect = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_audio = require('./init_audio');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChannelEffect = exports.ChannelEffect = function () {
  function ChannelEffect() {
    _classCallCheck(this, ChannelEffect);

    this.input = _init_audio.context.createGain();
    this.output = _init_audio.context.createGain();

    this._dry = _init_audio.context.createGain();
    this._wet = _init_audio.context.createGain();

    this._dry.gain.value = 1;
    this._wet.gain.value = 0;

    this.amount = 0;
  }

  _createClass(ChannelEffect, [{
    key: 'init',
    value: function init() {
      this.input.connect(this._dry);
      this._dry.connect(this.output);

      this.input.connect(this._nodeFX);
      this._nodeFX.connect(this._wet);
      this._wet.connect(this.output);
    }
  }, {
    key: 'setAmount',
    value: function setAmount(value) {
      /*
      this.amount = value < 0 ? 0 : value > 1 ? 1 : value;
      var gain1 = Math.cos(this.amount * 0.5 * Math.PI),
          gain2 = Math.cos((1.0 - this.amount) * 0.5 * Math.PI);
      this.gainNode.gain.value = gain2 * this.ratio;
      */

      if (value < 0) {
        value = 0;
      } else if (value > 1) {
        value = 1;
      }

      this.amount = value;
      this._wet.gain.value = this.amount;
      this._dry.gain.value = 1 - this.amount;
      //console.log('wet',this.wetGain.gain.value,'dry',this.dryGain.gain.value);
    }
  }]);

  return ChannelEffect;
}();
},{"./init_audio":11}],5:[function(require,module,exports){
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
exports.ConvolutionReverb = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_audio = require('./init_audio');

var _parse_audio = require('./parse_audio');

var _channel_fx = require('./channel_fx');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConvolutionReverb = exports.ConvolutionReverb = function (_ChannelEffect) {
  _inherits(ConvolutionReverb, _ChannelEffect);

  function ConvolutionReverb(buffer) {
    _classCallCheck(this, ConvolutionReverb);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ConvolutionReverb).call(this));

    _this._nodeFX = _init_audio.context.createConvolver();
    _this.init();

    if (buffer instanceof AudioBuffer) {
      _this._nodeFX.buffer = buffer;
    }
    return _this;
  }

  _createClass(ConvolutionReverb, [{
    key: 'addBuffer',
    value: function addBuffer(buffer) {
      if (buffer instanceof AudioBuffer === false) {
        console.log('argument is not an instance of AudioBuffer', buffer);
        return;
      }
      this._nodeFX.buffer = buffer;
    }
  }, {
    key: 'loadBuffer',
    value: function loadBuffer(url) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        (0, _parse_audio.parseSamples)(url).then(function (buffer) {
          buffer = buffer[0];
          if (buffer instanceof AudioBuffer) {
            _this2._nodeFX.buffer = buffer;
            resolve();
          } else {
            reject('could not parse to AudioBuffer', url);
          }
        });
      });
    }
  }]);

  return ConvolutionReverb;
}(_channel_fx.ChannelEffect);
},{"./channel_fx":4,"./init_audio":11,"./parse_audio":20}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Delay = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_audio = require('./init_audio');

var _channel_fx = require('./channel_fx');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 Credits: http://blog.chrislowis.co.uk/2014/07/23/dub-delay-web-audio-api.html
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */

var Delay = exports.Delay = function (_ChannelEffect) {
  _inherits(Delay, _ChannelEffect);

  function Delay() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Delay);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Delay).call(this));

    _this._nodeFX = _init_audio.context.createDelay();

    var _config$delayTime = config.delayTime;
    _this.delayTime = _config$delayTime === undefined ? 0.2 : _config$delayTime;
    var _config$feedback = config.feedback;
    _this.feedback = _config$feedback === undefined ? 0.7 : _config$feedback;
    var _config$frequency = config.frequency;
    _this.frequency = _config$frequency === undefined ? 1000 : _config$frequency;


    _this._nodeFX.delayTime.value = _this.delayTime;

    _this._feedback = _init_audio.context.createGain();
    _this._feedback.gain.value = _this.feedback;

    _this._filter = _init_audio.context.createBiquadFilter();
    _this._filter.frequency.value = _this.frequency;

    _this._nodeFX.connect(_this._feedback);
    _this._feedback.connect(_this._filter);
    _this._filter.connect(_this._nodeFX);

    _this.init();
    return _this;
  }

  _createClass(Delay, [{
    key: 'setTime',
    value: function setTime(value) {
      this._nodeFX.delayTime.value = this.delayTime = value;
      //console.log('time', value)
    }
  }, {
    key: 'setFeedback',
    value: function setFeedback(value) {
      this._feedback.gain.value = this.feedback = value;
      //console.log('feedback', value)
    }
  }, {
    key: 'setFrequency',
    value: function setFrequency(value) {
      this._filter.frequency.value = this.frequency = value;
      //console.log('frequency', value)
    }
  }]);

  return Delay;
}(_channel_fx.ChannelEffect);

/*
(function () {
  var ctx = new AudioContext();
  audioElement = $('#sliders audio')[0]

  audioElement.addEventListener('play', function(){
    source = ctx.createMediaElementSource(audioElement);

    delay = ctx.createDelay();
    delay.delayTime.value = 0.5;

    feedback = ctx.createGain();
    feedback.gain.value = 0.8;

    filter = ctx.createBiquadFilter();
    filter.frequency.value = 1000;

    delay.connect(feedback);
    feedback.connect(filter);
    filter.connect(delay);

    source.connect(delay);
    source.connect(ctx.destination);
    delay.connect(ctx.destination);
  });

  var controls = $("div#sliders");

  controls.find("input[name='delayTime']").on('input', function() {
    delay.delayTime.value = $(this).val();
  });

  controls.find("input[name='feedback']").on('input', function() {
    feedback.gain.value = $(this).val();
  });

  controls.find("input[name='frequency']").on('input', function() {
    filter.frequency.value = $(this).val();
  });
})();
*/
},{"./channel_fx":4,"./init_audio":11}],8:[function(require,module,exports){
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

var _settings = require('./settings');

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
    var i = loadKeys.indexOf('settings');
    if (i !== -1) {
      (0, _settings.updateSettings)(settings.settings);
      loadKeys.splice(i, 1);
    }
    //console.log(loadKeys)

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
          // initAudio
          returnObj.legacy = data.legacy;
          returnObj.mp3 = data.mp3;
          returnObj.ogg = data.ogg;
        } else if (i === 1) {
          // initMIDI
          returnObj.jazz = data.jazz;
          returnObj.midi = data.midi;
          returnObj.webmidi = data.webmidi;
        } else {
          // Instruments, samples or MIDI files that got loaded during initialization
          //result[loadKeys[i - 2]] = data
          returnObj[loadKeys[i - 2]] = data;
        }
      });

      //console.log(returnObj.jazz)

      if (returnObj.midi === false) {
        console.log('qambi', _qambi2.default.version, '[your browser has no support for MIDI]');
      } else {
        console.log('qambi', _qambi2.default.version);
      }
      resolve(returnObj);
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
},{"./init_audio":11,"./init_midi":12,"./qambi":25,"./sampler":29,"./settings":33,"./song":35}],11:[function(require,module,exports){
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
      // data.ogg = typeof buffers.emptyOgg !== 'undefined'
      // data.mp3 = typeof buffers.emptyMp3 !== 'undefined'
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

require('webmidiapishim');

// you can also embed the shim as a stand-alone script in the html, then you can comment this line out

/*
  Requests MIDI access, queries all inputs and outputs and stores them in alphabetical order
*/

var MIDIAccess = void 0;
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

    var jazz = false;
    var midi = false;
    var webmidi = false;

    if (typeof navigator === 'undefined') {
      initialized = true;
      resolve({ midi: midi });
    } else if (typeof navigator.requestMIDIAccess !== 'undefined') {

      navigator.requestMIDIAccess().then(function onFulFilled(midiAccess) {
        MIDIAccess = midiAccess;
        // @TODO: implement something in webmidiapishim that allows us to detect the Jazz plugin version
        if (typeof midiAccess._jazzInstances !== 'undefined') {
          console.log('jazz');
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
        //reject('Something went wrong while requesting MIDIAccess', e)
        initialized = true;
        resolve({ midi: midi, jazz: jazz });
      });
      // browsers without WebMIDI API
    } else {
        initialized = true;
        resolve({ midi: midi });
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
},{"./util":39,"webmidiapishim":46}],13:[function(require,module,exports){
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

      var time = event.time / 1000;
      var sample = void 0;

      if (isNaN(time)) {
        // this shouldn't happen
        console.error('invalid time value');
        return;
        //time = context.currentTime
      }

      if (time === 0) {
        // this shouldn't happen -> external MIDI keyboards
        console.error('should not happen');
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
              sample.output.disconnect();
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
                        sample.output.disconnect();
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
        sample.output.disconnect();
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
        sample.output.disconnect();
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
    this.track = new _track.Track({ name: this.song.id + '_metronome' });
    this.part = new _part3.Part();
    this.track.addParts(this.part);
    this.track._gainNode.connect(this.song._gainNode);

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
},{"./constants":5,"./init_audio":11,"./midi_event":15,"./parse_events":21,"./part":22,"./position":24,"./sampler":29,"./track":38,"./util":39}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIDIEvent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // @ flow


var _note = require('./note');

var _settings = require('./settings');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instanceIndex = 0;

var MIDIEvent = exports.MIDIEvent = function () {
  function MIDIEvent(ticks, type, data1) {
    var data2 = arguments.length <= 3 || arguments[3] === undefined ? -1 : arguments[3];
    var channel = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];

    _classCallCheck(this, MIDIEvent);

    this.id = this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();
    this.ticks = ticks;
    this.data1 = data1;
    this.data2 = data2;
    this.pitch = (0, _settings.getSettings)().pitch;

    /* test whether type is a status byte or a command: */

    // 1. the higher 4 bits of the status byte form the command
    this.type = (type >> 4) * 16;
    //this.type = this.command = (type >> 4) * 16

    // 2. filter channel events
    if (this.type >= 0x80 && this.type <= 0xE0) {
      // 3. get the channel number
      if (channel > 0) {
        // a channel is set, this overrules the channel number in the status byte
        this.channel = channel;
      } else {
        // extract the channel from the status byte: the lower 4 bits of the status byte form the channel number
        this.channel = type & 0xF;
      }
      //this.status = this.command + this.channel
    } else {
        // 4. not a channel event, set the type and command to the value of type as provided in the constructor
        this.type = type;
        //this.type = this.command = type
        this.channel = 0; // any
      }
    //console.log(type, this.type, this.command, this.status, this.channel, this.id)

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
      this.frequency = this.pitch * Math.pow(2, (this.data1 - 69) / 12);
    }
  }, {
    key: 'updatePitch',
    value: function updatePitch(newPitch) {
      if (newPitch === this.pitch) {
        return;
      }
      this.pitch = newPitch;
      this.transpose(0);
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
},{"./note":19,"./settings":33}],16:[function(require,module,exports){
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

var noteNameMode = void 0;
var pitch = void 0;

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

  var _getSettings = (0, _settings.getSettings)();

  noteNameMode = _getSettings.noteNameMode;
  pitch = _getSettings.pitch;


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
  var mode = arguments.length <= 1 || arguments[1] === undefined ? noteNameMode : arguments[1];

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
  return pitch * pow(2, (number - 69) / 12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
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
      console.log(mode + ' is not a valid note name mode, using "' + noteNameMode + '" instead');
    }
    mode = noteNameMode;
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
},{"./eventlistener":8,"./init_audio":11,"./util":39,"isomorphic-fetch":2}],21:[function(require,module,exports){
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
    var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Part);

    this.id = this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();

    var _settings$name = settings.name;
    this.name = _settings$name === undefined ? this.id : _settings$name;
    var _settings$muted = settings.muted;
    this.muted = _settings$muted === undefined ? false : _settings$muted;


    this._track = null;
    this._song = null;
    this._events = [];
    this._eventsById = new Map();
    this._needsUpdate = false;
    this._createEventArray = false;
    this._start = { millis: 0, ticks: 0 };
    this._end = { millis: 0, ticks: 0 };

    var events = settings.events;

    if (typeof events !== 'undefined') {
      this.addEvents.apply(this, _toConsumableArray(events));
    }
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
  //console.log(song._timeEvents, unit, target)

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
exports.Delay = exports.ConvolutionReverb = exports.Sampler = exports.SimpleSynth = exports.Instrument = exports.Part = exports.Track = exports.Song = exports.MIDINote = exports.MIDIEvent = exports.getNoteData = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.parseMIDIFile = exports.parseSamples = exports.MIDIEventTypes = exports.getSettings = exports.updateSettings = exports.getGMInstruments = exports.getInstruments = exports.init = exports.version = undefined;

var _settings = require('./settings');

var _note = require('./note');

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _part = require('./part');

var _track = require('./track');

var _song = require('./song');

var _instrument = require('./instrument');

var _sampler = require('./sampler');

var _simple_synth = require('./simple_synth');

var _convolution_reverb = require('./convolution_reverb');

var _delay_fx = require('./delay_fx');

var _midifile = require('./midifile');

var _init = require('./init');

var _init_audio = require('./init_audio');

var _init_midi = require('./init_midi');

var _parse_audio = require('./parse_audio');

var _constants = require('./constants');

var _eventlistener = require('./eventlistener');

var version = '1.0.0-beta34';

var getAudioContext = function getAudioContext() {
  return _init_audio.context;
};

var qambi = {
  version: version,

  // from ./settings
  updateSettings: _settings.updateSettings,
  getSettings: _settings.getSettings,

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

  // from ./convolution_reverb
  ConvolutionReverb: _convolution_reverb.ConvolutionReverb,

  // from ./delay_fx
  Delay: _delay_fx.Delay,

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
getInstruments = _settings.getInstruments;
exports.getGMInstruments = _settings.getGMInstruments;
exports.updateSettings = _settings.updateSettings;
exports.getSettings = _settings.getSettings;
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
exports.

// from ./convolution_reverb
ConvolutionReverb = _convolution_reverb.ConvolutionReverb;
exports.

// from ./delay_fx
Delay = _delay_fx.Delay;
},{"./constants":5,"./convolution_reverb":6,"./delay_fx":7,"./eventlistener":8,"./init":10,"./init_audio":11,"./init_midi":12,"./instrument":13,"./midi_event":15,"./midi_note":16,"./midifile":18,"./note":19,"./parse_audio":20,"./part":22,"./sampler":29,"./settings":33,"./simple_synth":34,"./song":35,"./track":38}],26:[function(require,module,exports){
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

  //@override


  _createClass(SampleBuffer, [{
    key: 'start',
    value: function start(time) {
      var _sampleData = this.sampleData;
      var sustainStart = _sampleData.sustainStart;
      var sustainEnd = _sampleData.sustainEnd;
      var segmentStart = _sampleData.segmentStart;
      var segmentDuration = _sampleData.segmentDuration;
      //console.log(sustainStart, sustainEnd, segmentStart, segmentDuration)

      if (sustainStart && sustainEnd) {
        this.source.loop = true;
        this.source.loopStart = sustainStart;
        this.source.loopEnd = sustainEnd;
      }
      if (segmentStart && segmentDuration) {
        console.log(segmentStart, segmentDuration);
        this.source.start(time, segmentStart / 1000, segmentDuration / 1000);
      } else {
        this.source.start(time);
      }
    }
  }]);

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
    _this.clearAllSampleData();
    return _this;
  }

  _createClass(Sampler, [{
    key: 'clearAllSampleData',
    value: function clearAllSampleData() {
      // create a samples data object for all 128 velocity levels of all 128 notes
      this.samplesData = new Array(128).fill(-1);
      this.samplesData = this.samplesData.map(function () {
        return new Array(128).fill(-1);
      });
    }
  }, {
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

      // check if we have to clear the currently loaded samples
      var clearAll = data.clearAll;

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

          if (clearAll === true) {
            _this2.clearAllSampleData();
          }

          if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {

            // single concatenated sample
            if (typeof result.sample !== 'undefined') {

              var buffer = result.sample;
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = Object.keys(data)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var noteId = _step.value;


                  if (noteId === 'sample' || noteId === 'release' || noteId === 'baseUrl' || noteId === 'info') {
                    continue;
                  }

                  var sampleData = {
                    segment: data[noteId],
                    note: parseInt(noteId, 10),
                    buffer: buffer
                  };

                  _this2._updateSampleData(sampleData);
                  //console.log(sampleData)
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
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  var _loop = function _loop() {
                    var noteId = _step2.value;

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

                  for (var _iterator2 = Object.keys(result)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    _loop();
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
      var _data$segment = data.segment;
      var segment = _data$segment === undefined ? [null, null] : _data$segment;
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

      var _segment = _slicedToArray(segment, 2);

      var segmentStart = _segment[0];
      var segmentDuration = _segment[1];

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
          sampleData.segmentStart = segmentStart || sampleData.segmentStart;
          sampleData.segmentDuration = segmentDuration || sampleData.segmentDuration;
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
  //  emptyOgg: 'T2dnUwACAAAAAAAAAABdxd4XAAAAADaS0jQBHgF2b3JiaXMAAAAAAUSsAAAAAAAAgLsAAAAAAAC4AU9nZ1MAAAAAAAAAAAAAXcXeFwEAAAAaXK+QDz3/////////////////MgN2b3JiaXMtAAAAWGlwaC5PcmcgbGliVm9yYmlzIEkgMjAxMDExMDEgKFNjaGF1ZmVudWdnZXQpAAAAAAEFdm9yYmlzH0JDVgEAAAEAGGNUKUaZUtJKiRlzlDFGmWKSSomlhBZCSJ1zFFOpOdeca6y5tSCEEBpTUCkFmVKOUmkZY5ApBZlSEEtJJXQSOiedYxBbScHWmGuLQbYchA2aUkwpxJRSikIIGVOMKcWUUkpCByV0DjrmHFOOSihBuJxzq7WWlmOLqXSSSuckZExCSCmFkkoHpVNOQkg1ltZSKR1zUlJqQegghBBCtiCEDYLQkFUAAAEAwEAQGrIKAFAAABCKoRiKAoSGrAIAMgAABKAojuIojiM5kmNJFhAasgoAAAIAEAAAwHAUSZEUybEkS9IsS9NEUVV91TZVVfZ1Xdd1Xdd1IDRkFQAAAQBASKeZpRogwgxkGAgNWQUAIAAAAEYowhADQkNWAQAAAQAAYig5iCa05nxzjoNmOWgqxeZ0cCLV5kluKubmnHPOOSebc8Y455xzinJmMWgmtOaccxKDZiloJrTmnHOexOZBa6q05pxzxjmng3FGGOecc5q05kFqNtbmnHMWtKY5ai7F5pxzIuXmSW0u1eacc84555xzzjnnnHOqF6dzcE4455xzovbmWm5CF+eccz4Zp3tzQjjnnHPOOeecc84555xzgtCQVQAAEAAAQRg2hnGnIEifo4EYRYhpyKQH3aPDJGgMcgqpR6OjkVLqIJRUxkkpnSA0ZBUAAAgAACGEFFJIIYUUUkghhRRSiCGGGGLIKaecggoqqaSiijLKLLPMMssss8wy67CzzjrsMMQQQwyttBJLTbXVWGOtueecaw7SWmmttdZKKaWUUkopCA1ZBQCAAAAQCBlkkEFGIYUUUoghppxyyimooAJCQ1YBAIAAAAIAAAA8yXNER3RER3RER3RER3REx3M8R5RESZRESbRMy9RMTxVV1ZVdW9Zl3fZtYRd23fd13/d149eFYVmWZVmWZVmWZVmWZVmWZVmC0JBVAAAIAACAEEIIIYUUUkghpRhjzDHnoJNQQiA0ZBUAAAgAIAAAAMBRHMVxJEdyJMmSLEmTNEuzPM3TPE30RFEUTdNURVd0Rd20RdmUTdd0Tdl0VVm1XVm2bdnWbV+Wbd/3fd/3fd/3fd/3fd/3dR0IDVkFAEgAAOhIjqRIiqRIjuM4kiQBoSGrAAAZAAABACiKoziO40iSJEmWpEme5VmiZmqmZ3qqqAKhIasAAEAAAAEAAAAAACia4imm4imi4jmiI0qiZVqipmquKJuy67qu67qu67qu67qu67qu67qu67qu67qu67qu67qu67qu67ouEBqyCgCQAADQkRzJkRxJkRRJkRzJAUJDVgEAMgAAAgBwDMeQFMmxLEvTPM3TPE30RE/0TE8VXdEFQkNWAQCAAAACAAAAAAAwJMNSLEdzNEmUVEu1VE21VEsVVU9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU1TdM0TSA0ZCUAAAQAwGKNweUgISUl5d4QwhCTnjEmIbVeIQSRkt4xBhWDnjKiDHLeQuMQgx4IDVkRAEQBAADGIMcQc8g5R6mTEjnnqHSUGuccpY5SZynFmGLNKJXYUqyNc45SR62jlGIsLXaUUo2pxgIAAAIcAAACLIRCQ1YEAFEAAIQxSCmkFGKMOaecQ4wp55hzhjHmHHOOOeegdFIq55x0TkrEGHOOOaecc1I6J5VzTkonoQAAgAAHAIAAC6HQkBUBQJwAgEGSPE/yNFGUNE8URVN0XVE0XdfyPNX0TFNVPdFUVVNVbdlUVVmWPM80PdNUVc80VdVUVVk2VVWWRVXVbdN1ddt0Vd2Wbdv3XVsWdlFVbd1UXds3Vdf2Xdn2fVnWdWPyPFX1TNN1PdN0ZdV1bVt1XV33TFOWTdeVZdN1bduVZV13Zdn3NdN0XdNVZdl0Xdl2ZVe3XVn2fdN1hd+VZV9XZVkYdl33hVvXleV0Xd1XZVc3Vln2fVvXheHWdWGZPE9VPdN0Xc80XVd1XV9XXdfWNdOUZdN1bdlUXVl2Zdn3XVfWdc80Zdl0Xds2XVeWXVn2fVeWdd10XV9XZVn4VVf2dVnXleHWbeE3Xdf3VVn2hVeWdeHWdWG5dV0YPlX1fVN2heF0Zd/Xhd9Zbl04ltF1fWGVbeFYZVk5fuFYlt33lWV0XV9YbdkYVlkWhl/4neX2feN4dV0Zbt3nzLrvDMfvpPvK09VtY5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=',
  //  emptyMp3: '//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAABAAADQgD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAAA5TEFNRTMuOTlyAc0AAAAAAAAAABSAJAJAQgAAgAAAA0L2YLQxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
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
},{"filesaverjs":1}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_midi = require('./init_midi');

var _init_audio = require('./init_audio');

var _midi_event = require('./midi_event');

var _util = require('./util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// millis

var Scheduler = function () {
  function Scheduler(song) {
    _classCallCheck(this, Scheduler);

    this.song = song;
    this.notes = new Map();
    this.bufferTime = song.bufferTime;
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
      this.timeStamp = timeStamp; // timestamp WebAudio context -> for internal instruments
      this.timeStamp2 = performance.now(); // timestamp since opening webpage -> for external instruments
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

      if (this.song._loop === true && this.song._loopDuration < this.bufferTime) {
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
                event.time2 = this.timeStamp2 + event.millis - this.songStartMillis;
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
                _event.time2 = this.timeStamp2 + _event.millis - this.songStartMillis;
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
              _event2.time2 = this.timeStamp2 + _event2.millis - this.songStartMillis;
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
        this.maxtime = this.songCurrentMillis + this.bufferTime;
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
          this.maxtime = this.songCurrentMillis + this.bufferTime;
          (_events = events).push.apply(_events, _toConsumableArray(this.getEvents()));
          //console.log(events)
        }
      } else {
          this.songCurrentMillis += diff;
          this.maxtime = this.songCurrentMillis + this.bufferTime;
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
            track.processMIDIEvent(event);
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
      var _this = this;

      var timeStamp = performance.now();
      var outputs = (0, _init_midi.getMIDIOutputs)();
      outputs.forEach(function (output) {
        output.send([0xB0, 0x7B, 0x00], timeStamp + _this.bufferTime); // stop all notes
        output.send([0xB0, 0x79, 0x00], timeStamp + _this.bufferTime); // reset all controllers
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
},{"./init_audio":11,"./init_midi":12,"./midi_event":15,"./util":39}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.updateSettings = updateSettings;
exports.getSettings = getSettings;
//import gmInstruments from './gm_instruments'

//const params = ['ppq', 'bpm', 'bars', 'pitch', 'bufferTime', 'lowestNote', 'highestNote', 'noteNameMode', 'nominator', 'denominator', 'quantizeValue', 'fixedLengthValue', 'positionType', 'useMetronome', 'autoSize', 'playbackSpeed', 'autoQuantize', ]

var settings = {
  ppq: 960,
  bpm: 120,
  bars: 16,
  pitch: 440,
  bufferTime: 200,
  lowestNote: 0,
  highestNote: 127,
  noteNameMode: 'sharp',
  nominator: 4,
  denominator: 4,
  quantizeValue: 8,
  fixedLengthValue: false,
  positionType: 'all',
  useMetronome: false,
  autoSize: true,
  playbackSpeed: 1,
  autoQuantize: false,
  volume: 0.5
};

function updateSettings(data) {
  var _data$ppq = data.ppq;
  settings.ppq = _data$ppq === undefined ? settings.ppq : _data$ppq;
  var _data$bpm = data.bpm;
  settings.bpm = _data$bpm === undefined ? settings.bpm : _data$bpm;
  var _data$bars = data.bars;
  settings.bars = _data$bars === undefined ? settings.bars : _data$bars;
  var _data$pitch = data.pitch;
  settings.pitch = _data$pitch === undefined ? settings.pitch : _data$pitch;
  var _data$bufferTime = data.bufferTime;
  settings.bufferTime = _data$bufferTime === undefined ? settings.bufferTime : _data$bufferTime;
  var _data$lowestNote = data.lowestNote;
  settings.lowestNote = _data$lowestNote === undefined ? settings.lowestNote : _data$lowestNote;
  var _data$highestNote = data.highestNote;
  settings.highestNote = _data$highestNote === undefined ? settings.highestNote : _data$highestNote;
  var _data$noteNameMode = data.noteNameMode;
  settings.noteNameMode = _data$noteNameMode === undefined ? settings.noteNameMode : _data$noteNameMode;
  var _data$nominator = data.nominator;
  settings.nominator = _data$nominator === undefined ? settings.nominator : _data$nominator;
  var _data$denominator = data.denominator;
  settings.denominator = _data$denominator === undefined ? settings.denominator : _data$denominator;
  var _data$quantizeValue = data.quantizeValue;
  settings.quantizeValue = _data$quantizeValue === undefined ? settings.quantizeValue : _data$quantizeValue;
  var _data$fixedLengthValu = data.fixedLengthValue;
  settings.fixedLengthValue = _data$fixedLengthValu === undefined ? settings.fixedLengthValue : _data$fixedLengthValu;
  var _data$positionType = data.positionType;
  settings.positionType = _data$positionType === undefined ? settings.positionType : _data$positionType;
  var _data$useMetronome = data.useMetronome;
  settings.useMetronome = _data$useMetronome === undefined ? settings.useMetronome : _data$useMetronome;
  var _data$autoSize = data.autoSize;
  settings.autoSize = _data$autoSize === undefined ? settings.autoSize : _data$autoSize;
  var _data$playbackSpeed = data.playbackSpeed;
  settings.playbackSpeed = _data$playbackSpeed === undefined ? settings.playbackSpeed : _data$playbackSpeed;
  var _data$autoQuantize = data.autoQuantize;
  settings.autoQuantize = _data$autoQuantize === undefined ? settings.autoQuantize : _data$autoQuantize;
  var _data$volume = data.volume;
  settings.volume = _data$volume === undefined ? settings.volume : _data$volume;


  console.log('settings: %O', settings);
}

function getSettings() {
  return _extends({}, settings);
  /*
    let result = {}
    params.forEach(param => {
      switch(param){
        case 'pitch':
          result.pitch = pitch
          break
        case 'noteNameMode':
          result.noteNameMode = noteNameMode
          break
        case 'bufferTime':
          result.bufferTime = bufferTime
          break
        case 'ppq':
          result.ppq = ppq
          break
        default:
          // do nothing
      }
    })
    return result
  */
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
  name: 'SHK2 squareroot (synth)',
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

var _save_midifile = require('./save_midifile');

var _song = require('./song.update');

var _settings = require('./settings');

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
  pitch: number,
  bufferTime: number,
  noteNameMode: string
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
    var defaultSettings = (0, _settings.getSettings)();

    var _settings$name = settings.name;
    this.name = _settings$name === undefined ? this.id : _settings$name;
    var _settings$ppq = settings.ppq;
    this.ppq = _settings$ppq === undefined ? defaultSettings.ppq : _settings$ppq;
    var _settings$bpm = settings.bpm;
    this.bpm = _settings$bpm === undefined ? defaultSettings.bpm : _settings$bpm;
    var _settings$bars = settings.bars;
    this.bars = _settings$bars === undefined ? defaultSettings.bars : _settings$bars;
    var _settings$nominator = settings.nominator;
    this.nominator = _settings$nominator === undefined ? defaultSettings.nominator : _settings$nominator;
    var _settings$denominator = settings.denominator;
    this.denominator = _settings$denominator === undefined ? defaultSettings.denominator : _settings$denominator;
    var _settings$quantizeVal = settings.quantizeValue;
    this.quantizeValue = _settings$quantizeVal === undefined ? defaultSettings.quantizeValue : _settings$quantizeVal;
    var _settings$fixedLength = settings.fixedLengthValue;
    this.fixedLengthValue = _settings$fixedLength === undefined ? defaultSettings.fixedLengthValue : _settings$fixedLength;
    var _settings$useMetronom = settings.useMetronome;
    this.useMetronome = _settings$useMetronom === undefined ? defaultSettings.useMetronome : _settings$useMetronom;
    var _settings$autoSize = settings.autoSize;
    this.autoSize = _settings$autoSize === undefined ? defaultSettings.autoSize : _settings$autoSize;
    var _settings$playbackSpe = settings.playbackSpeed;
    this.playbackSpeed = _settings$playbackSpe === undefined ? defaultSettings.playbackSpeed : _settings$playbackSpe;
    var _settings$autoQuantiz = settings.autoQuantize;
    this.autoQuantize = _settings$autoQuantiz === undefined ? defaultSettings.autoQuantize : _settings$autoQuantiz;
    var _settings$pitch = settings.pitch;
    this.pitch = _settings$pitch === undefined ? defaultSettings.pitch : _settings$pitch;
    var _settings$bufferTime = settings.bufferTime;
    this.bufferTime = _settings$bufferTime === undefined ? defaultSettings.bufferTime : _settings$bufferTime;
    var _settings$noteNameMod = settings.noteNameMode;
    this.noteNameMode = _settings$noteNameMod === undefined ? defaultSettings.noteNameMode : _settings$noteNameMod;
    var _settings$volume = settings.volume;
    this.volume = _settings$volume === undefined ? defaultSettings.volume : _settings$volume;


    this._timeEvents = [];
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

    this._removedTracks = [];

    this._currentMillis = 0;
    this._scheduler = new _scheduler2.default(this);
    this._playhead = new _playhead.Playhead(this);

    this.playing = false;
    this.paused = false;
    this.recording = false;
    this.precounting = false;
    this.stopped = true;
    this.looping = false;

    this._gainNode = _init_audio.context.createGain();
    this._gainNode.gain.value = this.volume;
    this._gainNode.connect(_init_audio.masterGain);

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

    var tracks = settings.tracks;
    var timeEvents = settings.timeEvents;
    //console.log(tracks, timeEvents)

    if (typeof timeEvents === 'undefined') {
      this._timeEvents = [new _midi_event.MIDIEvent(0, _constants.MIDIEventTypes.TEMPO, this.bpm), new _midi_event.MIDIEvent(0, _constants.MIDIEventTypes.TIME_SIGNATURE, this.nominator, this.denominator)];
    } else {
      this.addTimeEvents.apply(this, _toConsumableArray(timeEvents));
    }

    if (typeof tracks !== 'undefined') {
      this.addTracks.apply(this, _toConsumableArray(tracks));
    }

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
        track._gainNode.connect(_this2._gainNode);
        track._songGainNode = _this2._gainNode;
        _this2._tracks.push(track);
        _this2._tracksById.set(track.id, track);
        (_newEvents = _this2._newEvents).push.apply(_newEvents, _toConsumableArray(track._events));
        (_newParts = _this2._newParts).push.apply(_newParts, _toConsumableArray(track._parts));
      });
    }
  }, {
    key: 'removeTracks',
    value: function removeTracks() {
      var _removedTracks;

      (_removedTracks = this._removedTracks).push.apply(_removedTracks, arguments);
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
      //console.log(now, performance.now())
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
    value: function configure(config) {
      var _this7 = this;

      if (typeof config.pitch !== 'undefined') {

        if (config.pitch === this.pitch) {
          return;
        }
        this.pitch = config.pitch;
        this._events.forEach(function (event) {
          event.updatePitch(_this7.pitch);
        });
      }

      if (typeof config.ppq !== 'undefined') {
        var _ret = function () {
          if (config.ppq === _this7.ppq) {
            return {
              v: void 0
            };
          }
          var ppqFactor = config.ppq / _this7.ppq;
          _this7.ppq = config.ppq;
          _this7._allEvents.forEach(function (e) {
            e.ticks = event.ticks * ppqFactor;
          });
          _this7._updateTimeEvents = true;
          _this7.update();
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }

      if (typeof config.playbackSpeed !== 'undefined') {
        if (config.playbackSpeed === this.playbackSpeed) {
          return;
        }
        this.playbackSpeed = config.playbackSpeed;
      }
    }
  }, {
    key: 'allNotesOff',
    value: function allNotesOff() {
      this._tracks.forEach(function (track) {
        track.allNotesOff();
      });

      this._scheduler.allNotesOff();
      this._metronome.allNotesOff();
    }
    /*
      panic(){
        return new Promise(resolve => {
          this._tracks.forEach((track) => {
            track.disconnect(this._gainNode)
          })
          setTimeout(() => {
            this._tracks.forEach((track) => {
              track.connect(this._gainNode)
            })
            resolve()
          }, 100)
        })
      }
    */

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
},{"./constants":5,"./eventlistener":8,"./init_audio":11,"./metronome":14,"./midi_event":15,"./parse_events":21,"./playhead":23,"./position":24,"./save_midifile":31,"./scheduler":32,"./settings":33,"./song.update":36,"./song_from_midifile":37,"./util":39}],36:[function(require,module,exports){
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

  if (this._updateTimeEvents === false && this._removedTracks.length === 0 && this._removedEvents.length === 0 && this._newEvents.length === 0 && this._movedEvents.length === 0 && this._newParts.length === 0 && this._removedParts.length === 0 && this._resized === false) {
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
    //console.log('time events %O', this._timeEvents)
  }

  // only parse new and moved events
  var tobeParsed = [];

  // but parse all events if the time events have been updated
  if (this._updateTimeEvents === true) {
    tobeParsed = [].concat(_toConsumableArray(this._events));
  }

  // TRACKS
  // removed tracks
  if (this._removedTracks.length > 0) {
    this._removedTracks.forEach(function (track) {
      _this._tracksById.delete(track.id);
      track.removeParts(track.getParts());
      track._song = null;
      track._gainNode.disconnect();
      track._songGainNode = null;
    });
  }

  // PARTS
  // removed parts
  //console.log('removed parts %O', this._changedParts)
  if (this._removedParts.length > 0) {
    this._removedParts.forEach(function (part) {
      _this._partsById.delete(part.id);
    });
    this._parts = Array.from(this._partsById.values());
  }

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
    // don't add moved events if the time events have been updated -> they have already been added to the tobeParsed array
    if (_this._updateTimeEvents === false) {
      tobeParsed.push(event);
    }
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
  //console.log(lastEvent, lastTimeEvent)

  // check if song has already any events
  if (lastEvent instanceof _midi_event.MIDIEvent === false) {
    lastEvent = lastTimeEvent;
  } else if (lastTimeEvent.ticks > lastEvent.ticks) {
    lastEvent = lastTimeEvent;
  }
  //console.log(lastEvent, this.bars)

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
  if (this._updateMetronomeEvents || this._metronome.bars !== this.bars || this._updateTimeEvents === true) {
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
  this._updateTimeEvents = false;

  //console.groupEnd('update song')
}
},{"./constants":5,"./eventlistener":8,"./midi_event":15,"./parse_events":21,"./position":24,"./util":39}],37:[function(require,module,exports){
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

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toSong(parsed, settings) {

  var tracks = parsed.tracks;
  var ppq = parsed.header.ticksPerBeat; // the PPQ as set in the loaded MIDI file
  var ppqFactor = 1;

  // check if we need to overrule the PPQ ofs the loaded MIDI file
  if (typeof settings.overrulePPQ === 'undefined' || settings.overrulePPQ === true) {
    var newPPQ = (0, _settings.getSettings)().ppq;
    ppqFactor = newPPQ / ppq;
    ppq = newPPQ;
  }

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
        newTracks.push(new _track.Track({
          name: trackName,
          parts: [new _part.Part({
            events: events
          })]
        }));
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
    ppq: ppq,
    bpm: bpm,
    nominator: nominator,
    denominator: denominator,
    tracks: newTracks,
    timeEvents: timeEvents
  });
  //song.update()
  return song;
}

function songFromMIDIFileSync(data) {
  var settings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var song = null;

  if (data instanceof ArrayBuffer === true) {
    var buffer = new Uint8Array(data);
    song = toSong((0, _midifile.parseMIDIFile)(buffer), settings);
  } else if (typeof data.header !== 'undefined' && typeof data.tracks !== 'undefined') {
    // a MIDI file that has already been parsed
    song = toSong(data, settings);
  } else {
    // a base64 encoded MIDI file
    data = (0, _util.base64ToBinary)(data);
    if (data instanceof ArrayBuffer === true) {
      var _buffer = new Uint8Array(data);
      song = toSong((0, _midifile.parseMIDIFile)(_buffer), settings);
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
  var settings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return new Promise(function (resolve, reject) {
    // fetch(url, {
    //   mode: 'no-cors'
    // })
    (0, _isomorphicFetch2.default)(url).then(_fetch_helpers.status).then(_fetch_helpers.arrayBuffer).then(function (data) {
      resolve(songFromMIDIFileSync(data, settings));
    }).catch(function (e) {
      reject(e);
    });
  });
}
},{"./fetch_helpers":9,"./midi_event":15,"./midifile":18,"./part":22,"./settings":33,"./song":35,"./track":38,"./util":39,"isomorphic-fetch":2}],38:[function(require,module,exports){
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
  function Track() {
    var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Track);

    this.id = this.constructor.name + '_' + instanceIndex++ + '_' + new Date().getTime();

    //console.log(this.name, this.channel, this.muted, this.volume)

    var _settings$name = settings.name;
    this.name = _settings$name === undefined ? this.id : _settings$name;
    var _settings$channel = settings.channel;
    this.channel = _settings$channel === undefined ? 0 : _settings$channel;
    var _settings$muted = settings.muted;
    this.muted = _settings$muted === undefined ? false : _settings$muted;
    var _settings$volume = settings.volume;
    this.volume = _settings$volume === undefined ? 0.5 : _settings$volume;
    this._panner = _init_audio.context.createPanner();
    this._panner.panningModel = 'equalpower';
    this._panner.setPosition(zeroValue, zeroValue, zeroValue);
    this._gainNode = _init_audio.context.createGain();
    this._gainNode.gain.value = this.volume;
    this._panner.connect(this._gainNode);
    //this._gainNode.connect(this._panner)
    this._midiInputs = new Map();
    this._midiOutputs = new Map();
    this._song = null;
    this._parts = [];
    this._partsById = new Map();
    this._events = [];
    this._eventsById = new Map();
    this._needsUpdate = false;
    this._createEventArray = false;
    this._instrument = null;
    this._tmpRecordedNotes = new Map();
    this._recordedEvents = [];
    this.scheduledSamples = new Map();
    this.sustainedSamples = [];
    this.sustainPedalDown = false;
    this.monitor = false;
    this._songGainNode = null;
    this._effects = [];
    this._numEffects = 0;

    var parts = settings.parts;
    var instrument = settings.instrument;

    if (typeof parts !== 'undefined') {
      this.addParts.apply(this, _toConsumableArray(parts));
    }
    if (typeof instrument !== 'undefined') {
      this.setInstrument(instrument);
    }
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
              //console.log(...e.data)
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
  }, {
    key: '_checkEffect',
    value: function _checkEffect(effect) {
      if (effect.input instanceof AudioNode === false || effect.output instanceof AudioNode === false) {
        console.log('A channel fx should have an input and an output implementing the interface AudioNode');
        return false;
      }
      return true;
    }

    // routing: audiosource -> panning -> track output -> [...effect] -> song input

  }, {
    key: 'insertEffect',
    value: function insertEffect(effect) {

      if (this._checkEffect(effect) === false) {
        return;
      }

      var prevEffect = void 0;

      if (this._numEffects === 0) {
        this._gainNode.disconnect(this._songGainNode);
        this._gainNode.connect(effect.input);
        effect.output.connect(this._songGainNode);
      } else {
        prevEffect = this._effects[this._numEffects - 1];
        try {
          prevEffect.output.disconnect(this._songGainNode);
        } catch (e) {
          //Chrome throws an error here which is wrong
        }
        prevEffect.output.connect(effect.input);
        effect.output.connect(this._songGainNode);
      }

      this._effects.push(effect);
      this._numEffects++;
    }
  }, {
    key: 'insertEffectAt',
    value: function insertEffectAt(effect, index) {
      if (this._checkEffect(effect) === false) {
        return;
      }
      var prevEffect = this._effects[index - 1];
      var nextEffect = void 0;

      if (index === this._numEffects) {
        prevEffect.output.disconnect(this._songGainNode);
        prevEffect.output.connect(effect.input);
        effect.input.connect(this._songGainNode);
      } else {
        nextEffect = this._effects[index];
        prevEffect.output.disconnect(nextEffect.input);
        prevEffect.output.connect(effect.input);
        effect.output.connect(nextEffect.input);
      }
      this._effects.splice(index, 0, effect);
      this._numEffects++;
    }

    //removeEffect(effect: Effect){
  }, {
    key: 'removeEffect',
    value: function removeEffect(effect) {
      if (this._checkEffect(effect) === false) {
        return;
      }

      var i = void 0;
      for (i = 0; i < this._numEffects; i++) {
        var fx = this._effects[i];
        if (effect === fx) {
          break;
        }
      }
      this.removeEffectAt(i);
    }
  }, {
    key: 'removeEffectAt',
    value: function removeEffectAt(index) {
      if (isNaN(index) || this._numEffects === 0 || index >= this._numEffects) {
        return;
      }
      var effect = this._effects[index];
      var nextEffect = void 0;
      var prevEffect = void 0;

      //console.log(index, this._effects)

      if (index === 0) {
        // we remove the first effect, so disconnect from output of track
        this._gainNode.disconnect(effect.input);

        if (this._numEffects === 1) {
          // no effects anymore, so connect output of track to input of the song
          try {
            effect.output.disconnect(this._songGainNode);
          } catch (e) {
            //Chrome throws an error here which is wrong
          }
          this._gainNode.connect(this._songGainNode);
        } else {
          // disconnect the removed effect from the next effect in the chain, this is now the first effect in the chain...
          nextEffect = this._effects[index + 1];
          try {
            effect.output.disconnect(nextEffect.input);
          } catch (e) {}
          //Chrome throws an error here which is wrong

          // ... so connect the output of the track to the input of this effect
          this._gainNode.connect(nextEffect.input);
        }
      } else {

        prevEffect = this._effects[index - 1];
        //console.log(prevEffect)
        // disconnect the removed effect from the previous effect in the chain
        try {
          prevEffect.output.disconnect(effect.input);
        } catch (e) {
          //Chrome throws an error here which is wrong
        }

        if (index === this._numEffects - 1) {
          // we remove the last effect in the chain, so disconnect from the input of the song
          try {
            effect.output.disconnect(this._songGainNode);
          } catch (e) {}
          //Chrome throws an error here which is wrong

          // the previous effect is now the last effect to connect it to the input of the song
          prevEffect.output.connect(this._songGainNode);
        } else {
          // disconnect the effect from the next effect in the chain
          nextEffect = this._effects[index];
          effect.output.disconnect(nextEffect.input);
          // connect the previous effect to the next effect
          prevEffect.output.connect(nextEffect.input);
        }
      }

      this._effects.splice(index, 1);
      this._numEffects--;
    }
  }, {
    key: 'getEffects',
    value: function getEffects() {
      return [].concat(_toConsumableArray(this._effects));
    }
  }, {
    key: 'getEffectAt',
    value: function getEffectAt(index) {
      if (isNaN(index)) {
        return null;
      }
      return this._effects[index];
    }
  }, {
    key: 'getOutput',
    value: function getOutput() {
      return this._gainNode;
    }
  }, {
    key: 'getInput',
    value: function getInput() {
      return this._songGainNode;
    }

    // method is called when a MIDI events is send by an external or on-screen keyboard

  }, {
    key: '_preprocessMIDIEvent',
    value: function _preprocessMIDIEvent(midiEvent) {
      var time = _init_audio.context.currentTime * 1000;
      midiEvent.time = time;
      midiEvent.time2 = 0; //performance.now() -> passing 0 has the same effect as performance.now() so we choose the former
      midiEvent.recordMillis = time;
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

      if (typeof event.time === 'undefined') {
        this._preprocessMIDIEvent(event);
        return;
      }

      // send to javascript instrument
      if (this._instrument !== null) {
        //console.log(this.name, event)
        this._instrument.processMIDIEvent(event);
      }

      // send to external hardware or software instrument
      this._sendToExternalMIDIOutputs(event);
    }
  }, {
    key: '_sendToExternalMIDIOutputs',
    value: function _sendToExternalMIDIOutputs(event) {
      //console.log(event.time, event.millis)
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._midiOutputs.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var port = _step.value;

          if (port) {
            if (event.data2 !== -1) {
              port.send([event.type + this.channel, event.data1, event.data2], event.time2);
            } else {
              port.send([event.type + this.channel, event.data1], event.time2);
            }
            // if(event.type === 128 || event.type === 144 || event.type === 176){
            //   port.send([event.type + this.channel, event.data1, event.data2], event.time + latency)
            // }else if(event.type === 192 || event.type === 224){
            //   port.send([event.type, event.data1], event.time + latency)
            // }
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
},{"isomorphic-fetch":2}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createJazzInstance = createJazzInstance;
exports.getJazzInstance = getJazzInstance;

var _util = require('./util');

var jazzPluginInitTime = 100; // milliseconds

/*
  Creates instances of the Jazz plugin if necessary. Initially the MIDIAccess creates one main Jazz instance that is used
  to query all initially connected devices, and to track the devices that are being connected or disconnected at runtime.

  For every MIDIInput and MIDIOutput that is created, MIDIAccess queries the getJazzInstance() method for a Jazz instance
  that still have an available input or output. Because Jazz only allows one input and one output per instance, we
  need to create new instances if more than one MIDI input or output device gets connected.

  Note that an existing Jazz instance doesn't get deleted when both its input and output device are disconnected; instead it
  will be reused if a new device gets connected.
*/

var jazzInstanceNumber = 0;
var jazzInstances = new Map();

function createJazzInstance(callback) {

  var id = 'jazz_' + jazzInstanceNumber++ + '' + Date.now();
  var instance = void 0;
  var objRef = void 0,
      activeX = void 0;

  if ((0, _util.getDevice)().nodejs === true) {
    objRef = new jazzMidi.MIDI();
  } else {
    var o1 = document.createElement('object');
    o1.id = id + 'ie';
    o1.classid = 'CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90';
    activeX = o1;

    var o2 = document.createElement('object');
    o2.id = id;
    o2.type = 'audio/x-jazz';
    o1.appendChild(o2);
    objRef = o2;

    var e = document.createElement('p');
    e.appendChild(document.createTextNode('This page requires the '));

    var a = document.createElement('a');
    a.appendChild(document.createTextNode('Jazz plugin'));
    a.href = 'http://jazz-soft.net/';

    e.appendChild(a);
    e.appendChild(document.createTextNode('.'));
    o2.appendChild(e);

    var insertionPoint = document.getElementById('MIDIPlugin');
    if (!insertionPoint) {
      // Create hidden element
      insertionPoint = document.createElement('div');
      insertionPoint.id = 'MIDIPlugin';
      insertionPoint.style.position = 'absolute';
      insertionPoint.style.visibility = 'hidden';
      insertionPoint.style.left = '-9999px';
      insertionPoint.style.top = '-9999px';
      document.body.appendChild(insertionPoint);
    }
    insertionPoint.appendChild(o1);
  }

  setTimeout(function () {
    if (objRef.isJazz === true) {
      instance = objRef;
    } else if (activeX.isJazz === true) {
      instance = activeX;
    }
    if (typeof instance !== 'undefined') {
      instance._perfTimeZero = performance.now();
      jazzInstances.set(id, instance);
    }
    callback(instance);
  }, jazzPluginInitTime);
}

function getJazzInstance(type, callback) {
  var instance = null;
  var key = type === 'input' ? 'inputInUse' : 'outputInUse';

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = jazzInstances.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var inst = _step.value;

      if (inst[key] !== true) {
        instance = inst;
        break;
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

  if (instance === null) {
    createJazzInstance(callback);
  } else {
    callback(instance);
  }
}
},{"./util":47}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Creates a MIDIAccess instance:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       - Creates MIDIInput and MIDIOutput instances for the initially connected MIDI devices.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       - Keeps track of newly connected devices and creates the necessary instances of MIDIInput and MIDIOutput.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       - Keeps track of disconnected devices and removes them from the inputs and/or outputs map.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       - Creates a unique id for every device and stores these ids by the name of the device:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         so when a device gets disconnected and reconnected again, it will still have the same id. This
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         is in line with the behaviour of the native MIDIAccess object.

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

exports.createMIDIAccess = createMIDIAccess;
exports.dispatchEvent = dispatchEvent;
exports.closeAllMIDIInputs = closeAllMIDIInputs;
exports.getMIDIDeviceId = getMIDIDeviceId;

var _jazz_instance = require('./jazz_instance');

var _midi_input = require('./midi_input');

var _midi_output = require('./midi_output');

var _midiconnection_event = require('./midiconnection_event');

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var midiAccess = void 0;
var jazzInstance = void 0;
var midiInputs = new Map();
var midiOutputs = new Map();
var midiInputIds = new Map();
var midiOutputIds = new Map();
var listeners = new Set();

var MIDIAccess = function () {
  function MIDIAccess(inputs, outputs) {
    _classCallCheck(this, MIDIAccess);

    this.sysexEnabled = true;
    this.inputs = inputs;
    this.outputs = outputs;
  }

  _createClass(MIDIAccess, [{
    key: 'addEventListener',
    value: function addEventListener(type, listener, useCapture) {
      if (type !== 'statechange') {
        return;
      }
      if (listeners.has(listener) === false) {
        listeners.add(listener);
      }
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(type, listener, useCapture) {
      if (type !== 'statechange') {
        return;
      }
      if (listeners.has(listener) === true) {
        listeners.delete(listener);
      }
    }
  }]);

  return MIDIAccess;
}();

function createMIDIAccess() {

  return new Promise(function executor(resolve, reject) {

    if (typeof midiAccess !== 'undefined') {
      resolve(midiAccess);
      return;
    }

    if ((0, _util.getDevice)().browser === 'ie9') {
      reject({ message: 'WebMIDIAPIShim supports Internet Explorer 10 and above.' });
      return;
    }

    (0, _jazz_instance.createJazzInstance)(function (instance) {
      if (typeof instance === 'undefined') {
        reject({ message: 'No access to MIDI devices: browser does not support the WebMIDI API and the Jazz plugin is not installed.' });
        return;
      }

      jazzInstance = instance;

      createMIDIPorts(function () {
        setupListeners();
        midiAccess = new MIDIAccess(midiInputs, midiOutputs);
        resolve(midiAccess);
      });
    });
  });
}

// create MIDIInput and MIDIOutput instances for all initially connected MIDI devices
function createMIDIPorts(callback) {
  var inputs = jazzInstance.MidiInList();
  var outputs = jazzInstance.MidiOutList();
  var numInputs = inputs.length;
  var numOutputs = outputs.length;

  loopCreateMIDIPort(0, numInputs, 'input', inputs, function () {
    loopCreateMIDIPort(0, numOutputs, 'output', outputs, callback);
  });
}

function loopCreateMIDIPort(index, max, type, list, callback) {
  if (index < max) {
    var name = list[index++];
    createMIDIPort(type, name, function () {
      loopCreateMIDIPort(index, max, type, list, callback);
    });
  } else {
    callback();
  }
}

function createMIDIPort(type, name, callback) {
  (0, _jazz_instance.getJazzInstance)(type, function (instance) {
    var port = void 0;
    var info = [name, '', ''];
    if (type === 'input') {
      if (instance.Support('MidiInInfo')) {
        info = instance.MidiInInfo(name);
      }
      port = new _midi_input.MIDIInput(info, instance);
      midiInputs.set(port.id, port);
    } else if (type === 'output') {
      if (instance.Support('MidiOutInfo')) {
        info = instance.MidiOutInfo(name);
      }
      port = new _midi_output.MIDIOutput(info, instance);
      midiOutputs.set(port.id, port);
    }
    callback(port);
  });
}

// lookup function: Jazz gives us the name of the connected/disconnected MIDI devices but we have stored them by id
function getPortByName(ports, name) {
  var port = void 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = ports.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      port = _step.value;

      if (port.name === name) {
        break;
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

  return port;
}

// keep track of connected/disconnected MIDI devices
function setupListeners() {
  jazzInstance.OnDisconnectMidiIn(function (name) {
    var port = getPortByName(midiInputs, name);
    if (typeof port !== 'undefined') {
      port.state = 'disconnected';
      port.close();
      port._jazzInstance.inputInUse = false;
      midiInputs.delete(port.id);
      dispatchEvent(port);
    }
  });

  jazzInstance.OnDisconnectMidiOut(function (name) {
    var port = getPortByName(midiOutputs, name);
    if (typeof port !== 'undefined') {
      port.state = 'disconnected';
      port.close();
      port._jazzInstance.outputInUse = false;
      midiOutputs.delete(port.id);
      dispatchEvent(port);
    }
  });

  jazzInstance.OnConnectMidiIn(function (name) {
    createMIDIPort('input', name, function (port) {
      dispatchEvent(port);
    });
  });

  jazzInstance.OnConnectMidiOut(function (name) {
    createMIDIPort('output', name, function (port) {
      dispatchEvent(port);
    });
  });
}

// when a device gets connected/disconnected both the port and MIDIAccess dispatch a MIDIConnectionEvent
// therefor we call the ports dispatchEvent function here as well
function dispatchEvent(port) {
  port.dispatchEvent(new _midiconnection_event.MIDIConnectionEvent(port, port));

  var evt = new _midiconnection_event.MIDIConnectionEvent(midiAccess, port);

  if (typeof midiAccess.onstatechange === 'function') {
    midiAccess.onstatechange(evt);
  }
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = listeners[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var listener = _step2.value;

      listener(evt);
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

function closeAllMIDIInputs() {
  midiInputs.forEach(function (input) {
    //input.close();
    input._jazzInstance.MidiInClose();
  });
}

// check if we have already created a unique id for this device, if so: reuse it, if not: create a new id and store it
function getMIDIDeviceId(name, type) {
  var id = void 0;
  if (type === 'input') {
    id = midiInputIds.get(name);
    if (typeof id === 'undefined') {
      id = (0, _util.generateUUID)();
      midiInputIds.set(name, id);
    }
  } else if (type === 'output') {
    id = midiOutputIds.get(name);
    if (typeof id === 'undefined') {
      id = (0, _util.generateUUID)();
      midiOutputIds.set(name, id);
    }
  }
  return id;
}
},{"./jazz_instance":40,"./midi_input":42,"./midi_output":43,"./midiconnection_event":44,"./util":47}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIDIInput = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       MIDIInput is a wrapper around an input of a Jazz instance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

var _util = require('./util');

var _midimessage_event = require('./midimessage_event');

var _midiconnection_event = require('./midiconnection_event');

var _midi_access = require('./midi_access');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var midiProc = void 0;
var nodejs = (0, _util.getDevice)().nodejs;

var MIDIInput = exports.MIDIInput = function () {
  function MIDIInput(info, instance) {
    _classCallCheck(this, MIDIInput);

    this.id = (0, _midi_access.getMIDIDeviceId)(info[0], 'input');
    this.name = info[0];
    this.manufacturer = info[1];
    this.version = info[2];
    this.type = 'input';
    this.state = 'connected';
    this.connection = 'pending';

    this.onstatechange = null;
    this._onmidimessage = null;
    // because we need to implicitly open the device when an onmidimessage handler gets added
    // we define a setter that opens the device if the set value is a function
    Object.defineProperty(this, 'onmidimessage', {
      set: function set(value) {
        this._onmidimessage = value;
        if (typeof value === 'function') {
          this.open();
        }
      }
    });

    this._listeners = new Map().set('midimessage', new Set()).set('statechange', new Set());
    this._inLongSysexMessage = false;
    this._sysexBuffer = new Uint8Array();

    this._jazzInstance = instance;
    this._jazzInstance.inputInUse = true;

    // on Linux opening and closing Jazz instances causes the plugin to crash a lot so we open
    // the device here and don't close it when close() is called, see below
    if ((0, _util.getDevice)().platform === 'linux') {
      this._jazzInstance.MidiInOpen(this.name, midiProc.bind(this));
    }
  }

  _createClass(MIDIInput, [{
    key: 'addEventListener',
    value: function addEventListener(type, listener, useCapture) {
      var listeners = this._listeners.get(type);
      if (typeof listeners === 'undefined') {
        return;
      }

      if (listeners.has(listener) === false) {
        listeners.add(listener);
      }
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(type, listener, useCapture) {
      var listeners = this._listeners.get(type);
      if (typeof listeners === 'undefined') {
        return;
      }

      if (listeners.has(listener) === false) {
        listeners.delete(listener);
      }
    }
  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(evt) {
      var listeners = this._listeners.get(evt.type);
      listeners.forEach(function (listener) {
        listener(evt);
      });

      if (evt.type === 'midimessage') {
        if (this._onmidimessage !== null) {
          this._onmidimessage(evt);
        }
      } else if (evt.type === 'statechange') {
        if (this.onstatechange !== null) {
          this.onstatechange(evt);
        }
      }
    }
  }, {
    key: 'open',
    value: function open() {
      if (this.connection === 'open') {
        return;
      }
      if ((0, _util.getDevice)().platform !== 'linux') {
        this._jazzInstance.MidiInOpen(this.name, midiProc.bind(this));
      }
      this.connection = 'open';
      (0, _midi_access.dispatchEvent)(this); // dispatch MIDIConnectionEvent via MIDIAccess
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.connection === 'closed') {
        return;
      }
      if ((0, _util.getDevice)().platform !== 'linux') {
        this._jazzInstance.MidiInClose();
      }
      this.connection = 'closed';
      (0, _midi_access.dispatchEvent)(this); // dispatch MIDIConnectionEvent via MIDIAccess
      this._onmidimessage = null;
      this.onstatechange = null;
      this._listeners.get('midimessage').clear();
      this._listeners.get('statechange').clear();
    }
  }, {
    key: '_appendToSysexBuffer',
    value: function _appendToSysexBuffer(data) {
      var oldLength = this._sysexBuffer.length;
      var tmpBuffer = new Uint8Array(oldLength + data.length);
      tmpBuffer.set(this._sysexBuffer);
      tmpBuffer.set(data, oldLength);
      this._sysexBuffer = tmpBuffer;
    }
  }, {
    key: '_bufferLongSysex',
    value: function _bufferLongSysex(data, initialOffset) {
      var j = initialOffset;
      while (j < data.length) {
        if (data[j] == 0xF7) {
          // end of sysex!
          j++;
          this._appendToSysexBuffer(data.slice(initialOffset, j));
          return j;
        }
        j++;
      }
      // didn't reach the end; just tack it on.
      this._appendToSysexBuffer(data.slice(initialOffset, j));
      this._inLongSysexMessage = true;
      return j;
    }
  }]);

  return MIDIInput;
}();

midiProc = function midiProc(timestamp, data) {
  var length = 0;
  var i = void 0;
  var isSysexMessage = false;

  // Jazz sometimes passes us multiple messages at once, so we need to parse them out and pass them one at a time.

  for (i = 0; i < data.length; i += length) {
    var isValidMessage = true;
    if (this._inLongSysexMessage) {
      i = this._bufferLongSysex(data, i);
      if (data[i - 1] != 0xf7) {
        // ran off the end without hitting the end of the sysex message
        return;
      }
      isSysexMessage = true;
    } else {
      isSysexMessage = false;
      switch (data[i] & 0xF0) {
        case 0x00:
          // Chew up spurious 0x00 bytes.  Fixes a Windows problem.
          length = 1;
          isValidMessage = false;
          break;

        case 0x80: // note off
        case 0x90: // note on
        case 0xA0: // polyphonic aftertouch
        case 0xB0: // control change
        case 0xE0:
          // channel mode
          length = 3;
          break;

        case 0xC0: // program change
        case 0xD0:
          // channel aftertouch
          length = 2;
          break;

        case 0xF0:
          switch (data[i]) {
            case 0xf0:
              // letiable-length sysex.
              i = this._bufferLongSysex(data, i);
              if (data[i - 1] != 0xf7) {
                // ran off the end without hitting the end of the sysex message
                return;
              }
              isSysexMessage = true;
              break;

            case 0xF1: // MTC quarter frame
            case 0xF3:
              // song select
              length = 2;
              break;

            case 0xF2:
              // song position pointer
              length = 3;
              break;

            default:
              length = 1;
              break;
          }
          break;
      }
    }
    if (!isValidMessage) {
      continue;
    }

    var evt = {};
    evt.receivedTime = parseFloat(timestamp.toString()) + this._jazzInstance._perfTimeZero;

    if (isSysexMessage || this._inLongSysexMessage) {
      evt.data = new Uint8Array(this._sysexBuffer);
      this._sysexBuffer = new Uint8Array(0);
      this._inLongSysexMessage = false;
    } else {
      evt.data = new Uint8Array(data.slice(i, length + i));
    }

    if (nodejs) {
      if (this._onmidimessage) {
        this._onmidimessage(evt);
      }
    } else {
      var e = new _midimessage_event.MIDIMessageEvent(this, evt.data, evt.receivedTime);
      this.dispatchEvent(e);
    }
  }
};
},{"./midi_access":41,"./midiconnection_event":44,"./midimessage_event":45,"./util":47}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIDIOutput = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       MIDIOutput is a wrapper around an output of a Jazz instance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

var _util = require('./util');

var _midi_access = require('./midi_access');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIDIOutput = exports.MIDIOutput = function () {
  function MIDIOutput(info, instance) {
    _classCallCheck(this, MIDIOutput);

    this.id = (0, _midi_access.getMIDIDeviceId)(info[0], 'output');
    this.name = info[0];
    this.manufacturer = info[1];
    this.version = info[2];
    this.type = 'output';
    this.state = 'connected';
    this.connection = 'pending';
    this.onmidimessage = null;
    this.onstatechange = null;

    this._listeners = new Set();
    this._inLongSysexMessage = false;
    this._sysexBuffer = new Uint8Array();

    this._jazzInstance = instance;
    this._jazzInstance.outputInUse = true;
    if ((0, _util.getDevice)().platform === 'linux') {
      this._jazzInstance.MidiOutOpen(this.name);
    }
  }

  _createClass(MIDIOutput, [{
    key: 'open',
    value: function open() {
      if (this.connection === 'open') {
        return;
      }
      if ((0, _util.getDevice)().platform !== 'linux') {
        this._jazzInstance.MidiOutOpen(this.name);
      }
      this.connection = 'open';
      (0, _midi_access.dispatchEvent)(this); // dispatch MIDIConnectionEvent via MIDIAccess
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.connection === 'closed') {
        return;
      }
      if ((0, _util.getDevice)().platform !== 'linux') {
        this._jazzInstance.MidiOutClose();
      }
      this.connection = 'closed';
      (0, _midi_access.dispatchEvent)(this); // dispatch MIDIConnectionEvent via MIDIAccess
      this.onstatechange = null;
      this._listeners.clear();
    }
  }, {
    key: 'send',
    value: function send(data, timestamp) {
      var _this = this;

      var delayBeforeSend = 0;

      if (data.length === 0) {
        return false;
      }

      if (timestamp) {
        delayBeforeSend = Math.floor(timestamp - performance.now());
      }

      if (timestamp && delayBeforeSend > 1) {
        setTimeout(function () {
          _this._jazzInstance.MidiOutLong(data);
        }, delayBeforeSend);
      } else {
        this._jazzInstance.MidiOutLong(data);
      }
      return true;
    }
  }, {
    key: 'clear',
    value: function clear() {
      // to be implemented
    }
  }, {
    key: 'addEventListener',
    value: function addEventListener(type, listener, useCapture) {
      if (type !== 'statechange') {
        return;
      }

      if (this._listeners.has(listener) === false) {
        this._listeners.add(listener);
      }
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(type, listener, useCapture) {
      if (type !== 'statechange') {
        return;
      }

      if (this._listeners.has(listener) === false) {
        this._listeners.delete(listener);
      }
    }
  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(evt) {
      this._listeners.forEach(function (listener) {
        listener(evt);
      });

      if (this.onstatechange !== null) {
        this.onstatechange(evt);
      }
    }
  }]);

  return MIDIOutput;
}();
},{"./midi_access":41,"./util":47}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIDIConnectionEvent = exports.MIDIConnectionEvent = function MIDIConnectionEvent(midiAccess, port) {
  _classCallCheck(this, MIDIConnectionEvent);

  this.bubbles = false;
  this.cancelBubble = false;
  this.cancelable = false;
  this.currentTarget = midiAccess;
  this.defaultPrevented = false;
  this.eventPhase = 0;
  this.path = [];
  this.port = port;
  this.returnValue = true;
  this.srcElement = midiAccess;
  this.target = midiAccess;
  this.timeStamp = Date.now();
  this.type = 'statechange';
};
},{}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIDIMessageEvent = exports.MIDIMessageEvent = function MIDIMessageEvent(port, data, receivedTime) {
  _classCallCheck(this, MIDIMessageEvent);

  this.bubbles = false;
  this.cancelBubble = false;
  this.cancelable = false;
  this.currentTarget = port;
  this.data = data;
  this.defaultPrevented = false;
  this.eventPhase = 0;
  this.path = [];
  this.receivedTime = receivedTime;
  this.returnValue = true;
  this.srcElement = port;
  this.target = port;
  this.timeStamp = Date.now();
  this.type = 'midimessage';
};
},{}],46:[function(require,module,exports){
(function (global){
'use strict';

var _midi_access = require('./midi_access');

var _midi_input = require('./midi_input');

var _midi_output = require('./midi_output');

var _midimessage_event = require('./midimessage_event');

/*
  main entry point
*/
//import {createMIDIAccess, closeAllMIDIInputs} from './midi_access'
//import {polyfill, getDevice} from './util'


(function initShim() {

  if (typeof navigator.requestMIDIAccess === 'undefined') {

    global.MIDIInput = _midi_input.MIDIInput;
    global.MIDIOutput = _midi_output.MIDIOutput;
    global.MIDIMessageEvent = _midimessage_event.MIDIMessageEvent;

    //polyfill()

    navigator.requestMIDIAccess = function () {
      console.log('webmidiapishim 1.0.1', navigator.requestMIDIAccess);
      return (0, _midi_access.createMIDIAccess)();
    };
    /*
        if(getDevice().nodejs === true){
          navigator.close = function(){
            // Need to close MIDI input ports, otherwise Node.js will wait for MIDI input forever.
            closeAllMIDIInputs()
          }
        }
    */
  }
})();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./midi_access":41,"./midi_input":42,"./midi_output":43,"./midimessage_event":45}],47:[function(require,module,exports){
(function (process,global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateUUID = generateUUID;
exports.getDevice = getDevice;
exports.polyfillPerformance = polyfillPerformance;
exports.polyfillPromise = polyfillPromise;
exports.polyfill = polyfill;
/*
  A collection of handy util methods
*/

function generateUUID() {
  var d = new Date().getTime();
  var uuid = new Array(64).join('x'); //'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  uuid = uuid.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : r & 0x3 | 0x8).toString(16).toUpperCase();
  });
  return uuid;
}

var device = void 0;

// check on what type of device we are running, note that in this context a device is a computer not a MIDI device
function getDevice() {

  if (typeof device !== 'undefined') {
    return device;
  }

  var platform = 'undetected',
      browser = 'undetected',
      nodejs = false;

  if (navigator.nodejs) {
    platform = process.platform;
    device = {
      platform: platform,
      nodejs: true,
      mobile: platform === 'ios' || platform === 'android'
    };
    return device;
  }

  var ua = navigator.userAgent;

  if (ua.match(/(iPad|iPhone|iPod)/g)) {
    platform = 'ios';
  } else if (ua.indexOf('Android') !== -1) {
    platform = 'android';
  } else if (ua.indexOf('Linux') !== -1) {
    platform = 'linux';
  } else if (ua.indexOf('Macintosh') !== -1) {
    platform = 'osx';
  } else if (ua.indexOf('Windows') !== -1) {
    platform = 'windows';
  }

  if (ua.indexOf('Chrome') !== -1) {
    // chrome, chromium and canary
    browser = 'chrome';

    if (ua.indexOf('OPR') !== -1) {
      browser = 'opera';
    } else if (ua.indexOf('Chromium') !== -1) {
      browser = 'chromium';
    }
  } else if (ua.indexOf('Safari') !== -1) {
    browser = 'safari';
  } else if (ua.indexOf('Firefox') !== -1) {
    browser = 'firefox';
  } else if (ua.indexOf('Trident') !== -1) {
    browser = 'ie';
    if (ua.indexOf('MSIE 9') !== -1) {
      browser = 'ie9';
    }
  }

  if (platform === 'ios') {
    if (ua.indexOf('CriOS') !== -1) {
      browser = 'chrome';
    }
  }

  device = {
    platform: platform,
    browser: browser,
    mobile: platform === 'ios' || platform === 'android',
    nodejs: false
  };
  return device;
}

function polyfillPerformance() {
  if (typeof performance === 'undefined') {
    performance = {};
  }
  Date.now = Date.now || function () {
    return new Date().getTime();
  };

  if (typeof performance.now === 'undefined') {
    (function () {
      var nowOffset = Date.now();
      if (typeof performance.timing !== 'undefined' && typeof performance.timing.navigationStart !== 'undefined') {
        nowOffset = performance.timing.navigationStart;
      }
      performance.now = function now() {
        return Date.now() - nowOffset;
      };
    })();
  }
}

// a very simple implementation of a Promise for Internet Explorer and Nodejs
function polyfillPromise(scope) {
  if (typeof scope.Promise !== 'function') {

    scope.Promise = function (executor) {
      this.executor = executor;
    };

    scope.Promise.prototype.then = function (resolve, reject) {
      if (typeof resolve !== 'function') {
        resolve = function resolve() {};
      }
      if (typeof reject !== 'function') {
        reject = function reject() {};
      }
      this.executor(resolve, reject);
    };
  }
}

function polyfill() {
  var device = getDevice();
  if (device.browser === 'ie') {
    polyfillPromise(window);
  } else if (device.nodejs === true) {
    polyfillPromise(global);
  }
  polyfillPerformance();
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":3}],48:[function(require,module,exports){
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

},{}],49:[function(require,module,exports){
'use strict';

var _qambi = require('qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

document.addEventListener('DOMContentLoaded', function () {

  _qambi2.default.init({
    song: {
      type: 'Song',
      url: '../data/minute_waltz.mid'
    },
    piano: {
      type: 'Instrument',
      url: '../../instruments/heartbeat/city-piano-light.json'
    }
  }).then(main);
});

function main(data) {
  var song = data.song;
  var piano = data.piano;

  var synth = new _qambi.SimpleSynth('sine');

  song.getTracks().forEach(function (track) {
    track.setInstrument(piano);
    //track.setInstrument(synth)
    // listen to all connected MIDI input devices
    track.connectMIDIInputs.apply(track, _toConsumableArray((0, _qambi.getMIDIInputs)()));
    // enable monitor (like in Logic and Cubase)
    track.monitor = true;
  });

  var btnPlay = document.getElementById('play');
  var btnPause = document.getElementById('pause');
  var btnStop = document.getElementById('stop');
  var btnFX = document.getElementById('fx');
  var divLoading = document.getElementById('loading');
  var rangePanner = document.getElementById('panning');
  var rangeReverb = document.getElementById('reverb');
  divLoading.innerHTML = '';

  btnPlay.disabled = false;
  btnPause.disabled = false;
  btnStop.disabled = false;

  btnPlay.addEventListener('click', function () {
    song.play();
  });

  btnPause.addEventListener('click', function () {
    song.pause();
  });

  btnStop.addEventListener('click', function () {
    song.stop();
  });

  // create convolution reverb
  var hasReverb = false;
  var reverb = new _qambi.ConvolutionReverb();
  reverb.loadBuffer('../data/100-Reverb.mp3').then(function () {
    btnFX.disabled = false;
  }, function (e) {
    return console.log(e);
  });

  btnFX.addEventListener('click', function () {
    hasReverb = !hasReverb;
    if (hasReverb) {
      song.getTracks().forEach(function (t) {
        t.insertEffect(reverb);
      });
      btnFX.innerHTML = 'remove reverb';
      rangeReverb.disabled = false;
    } else {
      song.getTracks().forEach(function (t) {
        //t.removeEffect(0)
        //t.removeEffect(reverb)
        t.removeEffectAt(0);
      });
      btnFX.innerHTML = 'add reverb';
      rangeReverb.disabled = true;
      //rangeReverb.value = 0
      //reverb.setAmount(0)
    }
  });

  // very rudimental on-screen keyboard
  var track = song.getTracks()[0];
  var keys = new Map();
  ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'].forEach(function (key) {

    var btnKey = document.getElementById(key);
    keys.set(key, btnKey);

    btnKey.addEventListener('mousedown', startNote, false);
    btnKey.addEventListener('mouseup', stopNote, false);
    btnKey.addEventListener('mouseout', stopNote, false);
  });

  function startNote() {
    var noteNumber = (0, _qambi.getNoteData)({ fullName: this.id }).number;
    track.processMIDIEvent(new _qambi.MIDIEvent(0, _qambi.MIDIEventTypes.NOTE_ON, noteNumber, 100));
  }

  function stopNote() {
    var noteNumber = (0, _qambi.getNoteData)({ fullName: this.id }).number;
    track.processMIDIEvent(new _qambi.MIDIEvent(0, _qambi.MIDIEventTypes.NOTE_OFF, noteNumber));
  }

  // add listeners for all noteon and noteoff events
  song.addEventListener('noteOn', function (e) {
    // console.log(e.data)
    var btn = keys.get(e.data.fullNoteName);
    // check if this key exists on the on-screen keyboard
    if (btn) {
      btn.className = 'key-down';
    }
  });

  song.addEventListener('noteOff', function (e) {
    // console.log(e.data)
    var btn = keys.get(e.data.fullNoteName);
    if (btn) {
      btn.className = 'key-up';
    }
  });

  // set all keys of the on-screen keyboard to the up state when the song stops or pauses
  song.addEventListener('stop', function () {
    keys.forEach(function (key) {
      key.className = 'key-up';
    });
  });

  song.addEventListener('pause', function () {
    keys.forEach(function (key) {
      key.className = 'key-up';
    });
  });

  function setPanning(e) {
    song.getTracks().forEach(function (t) {
      t.setPanning(e.target.valueAsNumber);
    });
    //song.setPanning(e.target.valueAsNumber)
    //console.log(e.target.valueAsNumber)
  }

  rangePanner.addEventListener('mousedown', function (e) {
    rangePanner.addEventListener('mousemove', setPanning, false);
  });

  rangePanner.addEventListener('mouseup', function (e) {
    rangePanner.removeEventListener('mousemove', setPanning, false);
  });

  function setReverb(e) {
    if (hasReverb === false) {
      return;
    }
    reverb.setAmount(e.target.valueAsNumber);
    //console.log(e.target.valueAsNumber)
  }

  rangeReverb.addEventListener('mousedown', function (e) {
    rangeReverb.addEventListener('mousemove', setReverb, false);
  });

  rangeReverb.addEventListener('mouseup', function (e) {
    rangeReverb.removeEventListener('mousemove', setReverb, false);
  });
}

},{"qambi":25}]},{},[49])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZmlsZXNhdmVyanMvRmlsZVNhdmVyLmpzIiwibm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtZmV0Y2gvZmV0Y2gtbnBtLWJyb3dzZXJpZnkuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvY2hhbm5lbF9meC5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2NvbnN0YW50cy5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2NvbnZvbHV0aW9uX3JldmVyYi5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2RlbGF5X2Z4LmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvZXZlbnRsaXN0ZW5lci5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2ZldGNoX2hlbHBlcnMuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9pbml0LmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvaW5pdF9hdWRpby5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2luaXRfbWlkaS5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2luc3RydW1lbnQuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9tZXRyb25vbWUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9taWRpX2V2ZW50LmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvbWlkaV9ub3RlLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvbWlkaV9zdHJlYW0uanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9taWRpZmlsZS5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L25vdGUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9wYXJzZV9hdWRpby5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3BhcnNlX2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3BhcnQuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9wbGF5aGVhZC5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3Bvc2l0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvcWFtYmkuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zYW1wbGUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zYW1wbGVfYnVmZmVyLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2FtcGxlX29zY2lsbGF0b3IuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zYW1wbGVyLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2FtcGxlcy5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3NhdmVfbWlkaWZpbGUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zY2hlZHVsZXIuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zZXR0aW5ncy5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3NpbXBsZV9zeW50aC5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3NvbmcuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zb25nLnVwZGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3NvbmdfZnJvbV9taWRpZmlsZS5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3RyYWNrLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L2phenpfaW5zdGFuY2UuanMiLCJub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9taWRpX2FjY2Vzcy5qcyIsIm5vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L21pZGlfaW5wdXQuanMiLCJub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9taWRpX291dHB1dC5qcyIsIm5vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L21pZGljb25uZWN0aW9uX2V2ZW50LmpzIiwibm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3QvbWlkaW1lc3NhZ2VfZXZlbnQuanMiLCJub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9zaGltLmpzIiwibm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3QvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDanpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqYkE7Ozs7Ozs7O0FBVUEsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVTs7QUFFdEQsa0JBQU0sSUFBTixDQUFXO0FBQ1QsVUFBTTtBQUNKLFlBQU0sTUFERjtBQUVKLFdBQUs7QUFGRCxLQURHO0FBS1QsV0FBTztBQUNMLFlBQU0sWUFERDtBQUVMLFdBQUs7QUFGQTtBQUxFLEdBQVgsRUFVQyxJQVZELENBVU0sSUFWTjtBQVdELENBYkQ7O0FBZ0JBLFNBQVMsSUFBVCxDQUFjLElBQWQsRUFBbUI7QUFBQSxNQUVaLElBRlksR0FFRyxJQUZILENBRVosSUFGWTtBQUFBLE1BRU4sS0FGTSxHQUVHLElBRkgsQ0FFTixLQUZNOztBQUdqQixNQUFJLFFBQVEsdUJBQWdCLE1BQWhCLENBQVo7O0FBRUEsT0FBSyxTQUFMLEdBQWlCLE9BQWpCLENBQXlCLGlCQUFTO0FBQ2hDLFVBQU0sYUFBTixDQUFvQixLQUFwQjs7O0FBR0EsVUFBTSxpQkFBTixpQ0FBMkIsMkJBQTNCOztBQUVBLFVBQU0sT0FBTixHQUFnQixJQUFoQjtBQUNELEdBUEQ7O0FBU0EsTUFBSSxVQUFVLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFkO0FBQ0EsTUFBSSxXQUFXLFNBQVMsY0FBVCxDQUF3QixPQUF4QixDQUFmO0FBQ0EsTUFBSSxVQUFVLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFkO0FBQ0EsTUFBSSxRQUFRLFNBQVMsY0FBVCxDQUF3QixJQUF4QixDQUFaO0FBQ0EsTUFBSSxhQUFhLFNBQVMsY0FBVCxDQUF3QixTQUF4QixDQUFqQjtBQUNBLE1BQUksY0FBYyxTQUFTLGNBQVQsQ0FBd0IsU0FBeEIsQ0FBbEI7QUFDQSxNQUFJLGNBQWMsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQWxCO0FBQ0EsYUFBVyxTQUFYLEdBQXVCLEVBQXZCOztBQUVBLFVBQVEsUUFBUixHQUFtQixLQUFuQjtBQUNBLFdBQVMsUUFBVCxHQUFvQixLQUFwQjtBQUNBLFVBQVEsUUFBUixHQUFtQixLQUFuQjs7QUFFQSxVQUFRLGdCQUFSLENBQXlCLE9BQXpCLEVBQWtDLFlBQVU7QUFDMUMsU0FBSyxJQUFMO0FBQ0QsR0FGRDs7QUFJQSxXQUFTLGdCQUFULENBQTBCLE9BQTFCLEVBQW1DLFlBQVU7QUFDM0MsU0FBSyxLQUFMO0FBQ0QsR0FGRDs7QUFJQSxVQUFRLGdCQUFSLENBQXlCLE9BQXpCLEVBQWtDLFlBQVU7QUFDMUMsU0FBSyxJQUFMO0FBQ0QsR0FGRDs7O0FBTUEsTUFBSSxZQUFZLEtBQWhCO0FBQ0EsTUFBSSxTQUFTLDhCQUFiO0FBQ0EsU0FBTyxVQUFQLENBQWtCLHdCQUFsQixFQUNDLElBREQsQ0FFRSxZQUFNO0FBQ0osVUFBTSxRQUFOLEdBQWlCLEtBQWpCO0FBQ0QsR0FKSCxFQUtFO0FBQUEsV0FBSyxRQUFRLEdBQVIsQ0FBWSxDQUFaLENBQUw7QUFBQSxHQUxGOztBQVFBLFFBQU0sZ0JBQU4sQ0FBdUIsT0FBdkIsRUFBZ0MsWUFBVTtBQUN4QyxnQkFBWSxDQUFDLFNBQWI7QUFDQSxRQUFHLFNBQUgsRUFBYTtBQUNYLFdBQUssU0FBTCxHQUFpQixPQUFqQixDQUF5QixhQUFLO0FBQzVCLFVBQUUsWUFBRixDQUFlLE1BQWY7QUFDRCxPQUZEO0FBR0EsWUFBTSxTQUFOLEdBQWtCLGVBQWxCO0FBQ0Esa0JBQVksUUFBWixHQUF1QixLQUF2QjtBQUNELEtBTkQsTUFNSztBQUNILFdBQUssU0FBTCxHQUFpQixPQUFqQixDQUF5QixhQUFLOzs7QUFHNUIsVUFBRSxjQUFGLENBQWlCLENBQWpCO0FBQ0QsT0FKRDtBQUtBLFlBQU0sU0FBTixHQUFrQixZQUFsQjtBQUNBLGtCQUFZLFFBQVosR0FBdUIsSUFBdkI7OztBQUdEO0FBQ0YsR0FuQkQ7OztBQXVCQSxNQUFJLFFBQVEsS0FBSyxTQUFMLEdBQWlCLENBQWpCLENBQVo7QUFDQSxNQUFJLE9BQU8sSUFBSSxHQUFKLEVBQVg7QUFDQSxHQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYixFQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixJQUEvQixFQUFxQyxJQUFyQyxFQUEyQyxPQUEzQyxDQUFtRCxlQUFPOztBQUV4RCxRQUFJLFNBQVMsU0FBUyxjQUFULENBQXdCLEdBQXhCLENBQWI7QUFDQSxTQUFLLEdBQUwsQ0FBUyxHQUFULEVBQWMsTUFBZDs7QUFFQSxXQUFPLGdCQUFQLENBQXdCLFdBQXhCLEVBQXFDLFNBQXJDLEVBQWdELEtBQWhEO0FBQ0EsV0FBTyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxRQUFuQyxFQUE2QyxLQUE3QztBQUNBLFdBQU8sZ0JBQVAsQ0FBd0IsVUFBeEIsRUFBb0MsUUFBcEMsRUFBOEMsS0FBOUM7QUFDRCxHQVJEOztBQVVBLFdBQVMsU0FBVCxHQUFvQjtBQUNsQixRQUFJLGFBQWEsd0JBQVksRUFBQyxVQUFVLEtBQUssRUFBaEIsRUFBWixFQUFpQyxNQUFsRDtBQUNBLFVBQU0sZ0JBQU4sQ0FBdUIscUJBQWMsQ0FBZCxFQUFpQixzQkFBZSxPQUFoQyxFQUF5QyxVQUF6QyxFQUFxRCxHQUFyRCxDQUF2QjtBQUNEOztBQUVELFdBQVMsUUFBVCxHQUFtQjtBQUNqQixRQUFJLGFBQWEsd0JBQVksRUFBQyxVQUFVLEtBQUssRUFBaEIsRUFBWixFQUFpQyxNQUFsRDtBQUNBLFVBQU0sZ0JBQU4sQ0FBdUIscUJBQWMsQ0FBZCxFQUFpQixzQkFBZSxRQUFoQyxFQUEwQyxVQUExQyxDQUF2QjtBQUNEOzs7QUFHRCxPQUFLLGdCQUFMLENBQXNCLFFBQXRCLEVBQWdDLGFBQUs7O0FBRW5DLFFBQUksTUFBTSxLQUFLLEdBQUwsQ0FBUyxFQUFFLElBQUYsQ0FBTyxZQUFoQixDQUFWOztBQUVBLFFBQUcsR0FBSCxFQUFPO0FBQ0wsVUFBSSxTQUFKLEdBQWdCLFVBQWhCO0FBQ0Q7QUFDRixHQVBEOztBQVNBLE9BQUssZ0JBQUwsQ0FBc0IsU0FBdEIsRUFBaUMsYUFBSzs7QUFFcEMsUUFBSSxNQUFNLEtBQUssR0FBTCxDQUFTLEVBQUUsSUFBRixDQUFPLFlBQWhCLENBQVY7QUFDQSxRQUFHLEdBQUgsRUFBTztBQUNMLFVBQUksU0FBSixHQUFnQixRQUFoQjtBQUNEO0FBQ0YsR0FORDs7O0FBU0EsT0FBSyxnQkFBTCxDQUFzQixNQUF0QixFQUE4QixZQUFNO0FBQ2xDLFNBQUssT0FBTCxDQUFhLGVBQU87QUFDbEIsVUFBSSxTQUFKLEdBQWdCLFFBQWhCO0FBQ0QsS0FGRDtBQUdELEdBSkQ7O0FBTUEsT0FBSyxnQkFBTCxDQUFzQixPQUF0QixFQUErQixZQUFNO0FBQ25DLFNBQUssT0FBTCxDQUFhLGVBQU87QUFDbEIsVUFBSSxTQUFKLEdBQWdCLFFBQWhCO0FBQ0QsS0FGRDtBQUdELEdBSkQ7O0FBTUEsV0FBUyxVQUFULENBQW9CLENBQXBCLEVBQXNCO0FBQ3BCLFNBQUssU0FBTCxHQUFpQixPQUFqQixDQUF5QixhQUFLO0FBQzVCLFFBQUUsVUFBRixDQUFhLEVBQUUsTUFBRixDQUFTLGFBQXRCO0FBQ0QsS0FGRDs7O0FBS0Q7O0FBRUQsY0FBWSxnQkFBWixDQUE2QixXQUE3QixFQUEwQyxhQUFLO0FBQzdDLGdCQUFZLGdCQUFaLENBQTZCLFdBQTdCLEVBQTBDLFVBQTFDLEVBQXNELEtBQXREO0FBQ0QsR0FGRDs7QUFJQSxjQUFZLGdCQUFaLENBQTZCLFNBQTdCLEVBQXdDLGFBQUs7QUFDM0MsZ0JBQVksbUJBQVosQ0FBZ0MsV0FBaEMsRUFBNkMsVUFBN0MsRUFBeUQsS0FBekQ7QUFDRCxHQUZEOztBQUtBLFdBQVMsU0FBVCxDQUFtQixDQUFuQixFQUFxQjtBQUNuQixRQUFHLGNBQWMsS0FBakIsRUFBdUI7QUFDckI7QUFDRDtBQUNELFdBQU8sU0FBUCxDQUFpQixFQUFFLE1BQUYsQ0FBUyxhQUExQjs7QUFFRDs7QUFFRCxjQUFZLGdCQUFaLENBQTZCLFdBQTdCLEVBQTBDLGFBQUs7QUFDN0MsZ0JBQVksZ0JBQVosQ0FBNkIsV0FBN0IsRUFBMEMsU0FBMUMsRUFBcUQsS0FBckQ7QUFDRCxHQUZEOztBQUlBLGNBQVksZ0JBQVosQ0FBNkIsU0FBN0IsRUFBd0MsYUFBSztBQUMzQyxnQkFBWSxtQkFBWixDQUFnQyxXQUFoQyxFQUE2QyxTQUE3QyxFQUF3RCxLQUF4RDtBQUNELEdBRkQ7QUFHRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBGaWxlU2F2ZXIuanNcbiAqIEEgc2F2ZUFzKCkgRmlsZVNhdmVyIGltcGxlbWVudGF0aW9uLlxuICogMS4xLjIwMTYwMzI4XG4gKlxuICogQnkgRWxpIEdyZXksIGh0dHA6Ly9lbGlncmV5LmNvbVxuICogTGljZW5zZTogTUlUXG4gKiAgIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZWxpZ3JleS9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuICovXG5cbi8qZ2xvYmFsIHNlbGYgKi9cbi8qanNsaW50IGJpdHdpc2U6IHRydWUsIGluZGVudDogNCwgbGF4YnJlYWs6IHRydWUsIGxheGNvbW1hOiB0cnVlLCBzbWFydHRhYnM6IHRydWUsIHBsdXNwbHVzOiB0cnVlICovXG5cbi8qISBAc291cmNlIGh0dHA6Ly9wdXJsLmVsaWdyZXkuY29tL2dpdGh1Yi9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvRmlsZVNhdmVyLmpzICovXG5cbnZhciBzYXZlQXMgPSBzYXZlQXMgfHwgKGZ1bmN0aW9uKHZpZXcpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdC8vIElFIDwxMCBpcyBleHBsaWNpdGx5IHVuc3VwcG9ydGVkXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIC9NU0lFIFsxLTldXFwuLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhclxuXHRcdCAgZG9jID0gdmlldy5kb2N1bWVudFxuXHRcdCAgLy8gb25seSBnZXQgVVJMIHdoZW4gbmVjZXNzYXJ5IGluIGNhc2UgQmxvYi5qcyBoYXNuJ3Qgb3ZlcnJpZGRlbiBpdCB5ZXRcblx0XHQsIGdldF9VUkwgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2aWV3LlVSTCB8fCB2aWV3LndlYmtpdFVSTCB8fCB2aWV3O1xuXHRcdH1cblx0XHQsIHNhdmVfbGluayA9IGRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsIFwiYVwiKVxuXHRcdCwgY2FuX3VzZV9zYXZlX2xpbmsgPSBcImRvd25sb2FkXCIgaW4gc2F2ZV9saW5rXG5cdFx0LCBjbGljayA9IGZ1bmN0aW9uKG5vZGUpIHtcblx0XHRcdHZhciBldmVudCA9IG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7XG5cdFx0XHRub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuXHRcdH1cblx0XHQsIGlzX3NhZmFyaSA9IC9WZXJzaW9uXFwvW1xcZFxcLl0rLipTYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcblx0XHQsIHdlYmtpdF9yZXFfZnMgPSB2aWV3LndlYmtpdFJlcXVlc3RGaWxlU3lzdGVtXG5cdFx0LCByZXFfZnMgPSB2aWV3LnJlcXVlc3RGaWxlU3lzdGVtIHx8IHdlYmtpdF9yZXFfZnMgfHwgdmlldy5tb3pSZXF1ZXN0RmlsZVN5c3RlbVxuXHRcdCwgdGhyb3dfb3V0c2lkZSA9IGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHQodmlldy5zZXRJbW1lZGlhdGUgfHwgdmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhyb3cgZXg7XG5cdFx0XHR9LCAwKTtcblx0XHR9XG5cdFx0LCBmb3JjZV9zYXZlYWJsZV90eXBlID0gXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIlxuXHRcdCwgZnNfbWluX3NpemUgPSAwXG5cdFx0Ly8gdGhlIEJsb2IgQVBJIGlzIGZ1bmRhbWVudGFsbHkgYnJva2VuIGFzIHRoZXJlIGlzIG5vIFwiZG93bmxvYWRmaW5pc2hlZFwiIGV2ZW50IHRvIHN1YnNjcmliZSB0b1xuXHRcdCwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0ID0gMTAwMCAqIDQwIC8vIGluIG1zXG5cdFx0LCByZXZva2UgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHR2YXIgcmV2b2tlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKTtcblx0XHRcdFx0fSBlbHNlIHsgLy8gZmlsZSBpcyBhIEZpbGVcblx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0LyogLy8gVGFrZSBub3RlIFczQzpcblx0XHRcdHZhclxuXHRcdFx0ICB1cmkgPSB0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIiA/IGZpbGUgOiBmaWxlLnRvVVJMKClcblx0XHRcdCwgcmV2b2tlciA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHQvLyBpZGVhbHkgRG93bmxvYWRGaW5pc2hlZEV2ZW50LmRhdGEgd291bGQgYmUgdGhlIFVSTCByZXF1ZXN0ZWRcblx0XHRcdFx0aWYgKGV2dC5kYXRhID09PSB1cmkpIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIGZpbGUgaXMgYSBGaWxlXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0O1xuXHRcdFx0dmlldy5hZGRFdmVudExpc3RlbmVyKFwiZG93bmxvYWRmaW5pc2hlZFwiLCByZXZva2VyKTtcblx0XHRcdCovXG5cdFx0XHRzZXRUaW1lb3V0KHJldm9rZXIsIGFyYml0cmFyeV9yZXZva2VfdGltZW91dCk7XG5cdFx0fVxuXHRcdCwgZGlzcGF0Y2ggPSBmdW5jdGlvbihmaWxlc2F2ZXIsIGV2ZW50X3R5cGVzLCBldmVudCkge1xuXHRcdFx0ZXZlbnRfdHlwZXMgPSBbXS5jb25jYXQoZXZlbnRfdHlwZXMpO1xuXHRcdFx0dmFyIGkgPSBldmVudF90eXBlcy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdHZhciBsaXN0ZW5lciA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF90eXBlc1tpXV07XG5cdFx0XHRcdGlmICh0eXBlb2YgbGlzdGVuZXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRsaXN0ZW5lci5jYWxsKGZpbGVzYXZlciwgZXZlbnQgfHwgZmlsZXNhdmVyKTtcblx0XHRcdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRcdFx0dGhyb3dfb3V0c2lkZShleCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCwgYXV0b19ib20gPSBmdW5jdGlvbihibG9iKSB7XG5cdFx0XHQvLyBwcmVwZW5kIEJPTSBmb3IgVVRGLTggWE1MIGFuZCB0ZXh0LyogdHlwZXMgKGluY2x1ZGluZyBIVE1MKVxuXHRcdFx0aWYgKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9iKFtcIlxcdWZlZmZcIiwgYmxvYl0sIHt0eXBlOiBibG9iLnR5cGV9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBibG9iO1xuXHRcdH1cblx0XHQsIEZpbGVTYXZlciA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdC8vIEZpcnN0IHRyeSBhLmRvd25sb2FkLCB0aGVuIHdlYiBmaWxlc3lzdGVtLCB0aGVuIG9iamVjdCBVUkxzXG5cdFx0XHR2YXJcblx0XHRcdFx0ICBmaWxlc2F2ZXIgPSB0aGlzXG5cdFx0XHRcdCwgdHlwZSA9IGJsb2IudHlwZVxuXHRcdFx0XHQsIGJsb2JfY2hhbmdlZCA9IGZhbHNlXG5cdFx0XHRcdCwgb2JqZWN0X3VybFxuXHRcdFx0XHQsIHRhcmdldF92aWV3XG5cdFx0XHRcdCwgZGlzcGF0Y2hfYWxsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgd3JpdGVlbmRcIi5zcGxpdChcIiBcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIG9uIGFueSBmaWxlc3lzIGVycm9ycyByZXZlcnQgdG8gc2F2aW5nIHdpdGggb2JqZWN0IFVSTHNcblx0XHRcdFx0LCBmc19lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICh0YXJnZXRfdmlldyAmJiBpc19zYWZhcmkgJiYgdHlwZW9mIEZpbGVSZWFkZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRcdC8vIFNhZmFyaSBkb2Vzbid0IGFsbG93IGRvd25sb2FkaW5nIG9mIGJsb2IgdXJsc1xuXHRcdFx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdFx0XHRyZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBiYXNlNjREYXRhID0gcmVhZGVyLnJlc3VsdDtcblx0XHRcdFx0XHRcdFx0dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZiA9IFwiZGF0YTphdHRhY2htZW50L2ZpbGVcIiArIGJhc2U2NERhdGEuc2xpY2UoYmFzZTY0RGF0YS5zZWFyY2goL1ssO10vKSk7XG5cdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xuXHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZG9uJ3QgY3JlYXRlIG1vcmUgb2JqZWN0IFVSTHMgdGhhbiBuZWVkZWRcblx0XHRcdFx0XHRpZiAoYmxvYl9jaGFuZ2VkIHx8ICFvYmplY3RfdXJsKSB7XG5cdFx0XHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRhcmdldF92aWV3KSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dmFyIG5ld190YWIgPSB2aWV3Lm9wZW4ob2JqZWN0X3VybCwgXCJfYmxhbmtcIik7XG5cdFx0XHRcdFx0XHRpZiAobmV3X3RhYiA9PT0gdW5kZWZpbmVkICYmIGlzX3NhZmFyaSkge1xuXHRcdFx0XHRcdFx0XHQvL0FwcGxlIGRvIG5vdCBhbGxvdyB3aW5kb3cub3Blbiwgc2VlIGh0dHA6Ly9iaXQubHkvMWtaZmZSSVxuXHRcdFx0XHRcdFx0XHR2aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCwgYWJvcnRhYmxlID0gZnVuY3Rpb24oZnVuYykge1xuXHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmIChmaWxlc2F2ZXIucmVhZHlTdGF0ZSAhPT0gZmlsZXNhdmVyLkRPTkUpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdCwgY3JlYXRlX2lmX25vdF9mb3VuZCA9IHtjcmVhdGU6IHRydWUsIGV4Y2x1c2l2ZTogZmFsc2V9XG5cdFx0XHRcdCwgc2xpY2Vcblx0XHRcdDtcblx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLklOSVQ7XG5cdFx0XHRpZiAoIW5hbWUpIHtcblx0XHRcdFx0bmFtZSA9IFwiZG93bmxvYWRcIjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5fdXNlX3NhdmVfbGluaykge1xuXHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzYXZlX2xpbmsuaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0c2F2ZV9saW5rLmRvd25sb2FkID0gbmFtZTtcblx0XHRcdFx0XHRjbGljayhzYXZlX2xpbmspO1xuXHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdHJldm9rZShvYmplY3RfdXJsKTtcblx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Ly8gT2JqZWN0IGFuZCB3ZWIgZmlsZXN5c3RlbSBVUkxzIGhhdmUgYSBwcm9ibGVtIHNhdmluZyBpbiBHb29nbGUgQ2hyb21lIHdoZW5cblx0XHRcdC8vIHZpZXdlZCBpbiBhIHRhYiwgc28gSSBmb3JjZSBzYXZlIHdpdGggYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXG5cdFx0XHQvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05MTE1OFxuXHRcdFx0Ly8gVXBkYXRlOiBHb29nbGUgZXJyYW50bHkgY2xvc2VkIDkxMTU4LCBJIHN1Ym1pdHRlZCBpdCBhZ2Fpbjpcblx0XHRcdC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0zODk2NDJcblx0XHRcdGlmICh2aWV3LmNocm9tZSAmJiB0eXBlICYmIHR5cGUgIT09IGZvcmNlX3NhdmVhYmxlX3R5cGUpIHtcblx0XHRcdFx0c2xpY2UgPSBibG9iLnNsaWNlIHx8IGJsb2Iud2Via2l0U2xpY2U7XG5cdFx0XHRcdGJsb2IgPSBzbGljZS5jYWxsKGJsb2IsIDAsIGJsb2Iuc2l6ZSwgZm9yY2Vfc2F2ZWFibGVfdHlwZSk7XG5cdFx0XHRcdGJsb2JfY2hhbmdlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHQvLyBTaW5jZSBJIGNhbid0IGJlIHN1cmUgdGhhdCB0aGUgZ3Vlc3NlZCBtZWRpYSB0eXBlIHdpbGwgdHJpZ2dlciBhIGRvd25sb2FkXG5cdFx0XHQvLyBpbiBXZWJLaXQsIEkgYXBwZW5kIC5kb3dubG9hZCB0byB0aGUgZmlsZW5hbWUuXG5cdFx0XHQvLyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NjU0NDBcblx0XHRcdGlmICh3ZWJraXRfcmVxX2ZzICYmIG5hbWUgIT09IFwiZG93bmxvYWRcIikge1xuXHRcdFx0XHRuYW1lICs9IFwiLmRvd25sb2FkXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZSA9PT0gZm9yY2Vfc2F2ZWFibGVfdHlwZSB8fCB3ZWJraXRfcmVxX2ZzKSB7XG5cdFx0XHRcdHRhcmdldF92aWV3ID0gdmlldztcblx0XHRcdH1cblx0XHRcdGlmICghcmVxX2ZzKSB7XG5cdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGZzX21pbl9zaXplICs9IGJsb2Iuc2l6ZTtcblx0XHRcdHJlcV9mcyh2aWV3LlRFTVBPUkFSWSwgZnNfbWluX3NpemUsIGFib3J0YWJsZShmdW5jdGlvbihmcykge1xuXHRcdFx0XHRmcy5yb290LmdldERpcmVjdG9yeShcInNhdmVkXCIsIGNyZWF0ZV9pZl9ub3RfZm91bmQsIGFib3J0YWJsZShmdW5jdGlvbihkaXIpIHtcblx0XHRcdFx0XHR2YXIgc2F2ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlyLmdldEZpbGUobmFtZSwgY3JlYXRlX2lmX25vdF9mb3VuZCwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdFx0ZmlsZS5jcmVhdGVXcml0ZXIoYWJvcnRhYmxlKGZ1bmN0aW9uKHdyaXRlcikge1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci5vbndyaXRlZW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBmaWxlLnRvVVJMKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlZW5kXCIsIGV2ZW50KTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldm9rZShmaWxlKTtcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgZXJyb3IgPSB3cml0ZXIuZXJyb3I7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZXJyb3IuY29kZSAhPT0gZXJyb3IuQUJPUlRfRVJSKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgYWJvcnRcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0d3JpdGVyW1wib25cIiArIGV2ZW50XSA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF07XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLndyaXRlKGJsb2IpO1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0d3JpdGVyLmFib3J0KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuV1JJVElORztcblx0XHRcdFx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdFx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRkaXIuZ2V0RmlsZShuYW1lLCB7Y3JlYXRlOiBmYWxzZX0sIGFib3J0YWJsZShmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdFx0XHQvLyBkZWxldGUgZmlsZSBpZiBpdCBhbHJlYWR5IGV4aXN0c1xuXHRcdFx0XHRcdFx0ZmlsZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdHNhdmUoKTtcblx0XHRcdFx0XHR9KSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHRcdFx0XHRpZiAoZXguY29kZSA9PT0gZXguTk9UX0ZPVU5EX0VSUikge1xuXHRcdFx0XHRcdFx0XHRzYXZlKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmc19lcnJvcigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0fVxuXHRcdCwgRlNfcHJvdG8gPSBGaWxlU2F2ZXIucHJvdG90eXBlXG5cdFx0LCBzYXZlQXMgPSBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pO1xuXHRcdH1cblx0O1xuXHQvLyBJRSAxMCsgKG5hdGl2ZSBzYXZlQXMpXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLCBuYW1lIHx8IFwiZG93bmxvYWRcIik7XG5cdFx0fTtcblx0fVxuXG5cdEZTX3Byb3RvLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZpbGVzYXZlciA9IHRoaXM7XG5cdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwiYWJvcnRcIik7XG5cdH07XG5cdEZTX3Byb3RvLnJlYWR5U3RhdGUgPSBGU19wcm90by5JTklUID0gMDtcblx0RlNfcHJvdG8uV1JJVElORyA9IDE7XG5cdEZTX3Byb3RvLkRPTkUgPSAyO1xuXG5cdEZTX3Byb3RvLmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZXN0YXJ0ID1cblx0RlNfcHJvdG8ub25wcm9ncmVzcyA9XG5cdEZTX3Byb3RvLm9ud3JpdGUgPVxuXHRGU19wcm90by5vbmFib3J0ID1cblx0RlNfcHJvdG8ub25lcnJvciA9XG5cdEZTX3Byb3RvLm9ud3JpdGVlbmQgPVxuXHRcdG51bGw7XG5cblx0cmV0dXJuIHNhdmVBcztcbn0oXG5cdCAgIHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiICYmIHNlbGZcblx0fHwgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3dcblx0fHwgdGhpcy5jb250ZW50XG4pKTtcbi8vIGBzZWxmYCBpcyB1bmRlZmluZWQgaW4gRmlyZWZveCBmb3IgQW5kcm9pZCBjb250ZW50IHNjcmlwdCBjb250ZXh0XG4vLyB3aGlsZSBgdGhpc2AgaXMgbnNJQ29udGVudEZyYW1lTWVzc2FnZU1hbmFnZXJcbi8vIHdpdGggYW4gYXR0cmlidXRlIGBjb250ZW50YCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB3aW5kb3dcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMuc2F2ZUFzID0gc2F2ZUFzO1xufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkZWZpbmUgIT09IG51bGwpICYmIChkZWZpbmUuYW1kICE9PSBudWxsKSkge1xuICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzYXZlQXM7XG4gIH0pO1xufVxuIiwiLy8gdGhlIHdoYXR3Zy1mZXRjaCBwb2x5ZmlsbCBpbnN0YWxscyB0aGUgZmV0Y2goKSBmdW5jdGlvblxuLy8gb24gdGhlIGdsb2JhbCBvYmplY3QgKHdpbmRvdyBvciBzZWxmKVxuLy9cbi8vIFJldHVybiB0aGF0IGFzIHRoZSBleHBvcnQgZm9yIHVzZSBpbiBXZWJwYWNrLCBCcm93c2VyaWZ5IGV0Yy5cbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xubW9kdWxlLmV4cG9ydHMgPSBzZWxmLmZldGNoLmJpbmQoc2VsZik7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuQ2hhbm5lbEVmZmVjdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBDaGFubmVsRWZmZWN0ID0gZXhwb3J0cy5DaGFubmVsRWZmZWN0ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBDaGFubmVsRWZmZWN0KCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDaGFubmVsRWZmZWN0KTtcblxuICAgIHRoaXMuaW5wdXQgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLm91dHB1dCA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlR2FpbigpO1xuXG4gICAgdGhpcy5fZHJ5ID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fd2V0ID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVHYWluKCk7XG5cbiAgICB0aGlzLl9kcnkuZ2Fpbi52YWx1ZSA9IDE7XG4gICAgdGhpcy5fd2V0LmdhaW4udmFsdWUgPSAwO1xuXG4gICAgdGhpcy5hbW91bnQgPSAwO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKENoYW5uZWxFZmZlY3QsIFt7XG4gICAga2V5OiAnaW5pdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICB0aGlzLmlucHV0LmNvbm5lY3QodGhpcy5fZHJ5KTtcbiAgICAgIHRoaXMuX2RyeS5jb25uZWN0KHRoaXMub3V0cHV0KTtcblxuICAgICAgdGhpcy5pbnB1dC5jb25uZWN0KHRoaXMuX25vZGVGWCk7XG4gICAgICB0aGlzLl9ub2RlRlguY29ubmVjdCh0aGlzLl93ZXQpO1xuICAgICAgdGhpcy5fd2V0LmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEFtb3VudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEFtb3VudCh2YWx1ZSkge1xuICAgICAgLypcbiAgICAgIHRoaXMuYW1vdW50ID0gdmFsdWUgPCAwID8gMCA6IHZhbHVlID4gMSA/IDEgOiB2YWx1ZTtcbiAgICAgIHZhciBnYWluMSA9IE1hdGguY29zKHRoaXMuYW1vdW50ICogMC41ICogTWF0aC5QSSksXG4gICAgICAgICAgZ2FpbjIgPSBNYXRoLmNvcygoMS4wIC0gdGhpcy5hbW91bnQpICogMC41ICogTWF0aC5QSSk7XG4gICAgICB0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSBnYWluMiAqIHRoaXMucmF0aW87XG4gICAgICAqL1xuXG4gICAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgIHZhbHVlID0gMDtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgPiAxKSB7XG4gICAgICAgIHZhbHVlID0gMTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hbW91bnQgPSB2YWx1ZTtcbiAgICAgIHRoaXMuX3dldC5nYWluLnZhbHVlID0gdGhpcy5hbW91bnQ7XG4gICAgICB0aGlzLl9kcnkuZ2Fpbi52YWx1ZSA9IDEgLSB0aGlzLmFtb3VudDtcbiAgICAgIC8vY29uc29sZS5sb2coJ3dldCcsdGhpcy53ZXRHYWluLmdhaW4udmFsdWUsJ2RyeScsdGhpcy5kcnlHYWluLmdhaW4udmFsdWUpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBDaGFubmVsRWZmZWN0O1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuLy8gc3RhbmRhcmQgTUlESSBldmVudHNcbnZhciBNSURJRXZlbnRUeXBlcyA9IHt9O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09GRicsIHsgdmFsdWU6IDB4ODAgfSk7IC8vMTI4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09OJywgeyB2YWx1ZTogMHg5MCB9KTsgLy8xNDRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BPTFlfUFJFU1NVUkUnLCB7IHZhbHVlOiAweEEwIH0pOyAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVFJPTF9DSEFOR0UnLCB7IHZhbHVlOiAweEIwIH0pOyAvLzE3NlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUFJPR1JBTV9DSEFOR0UnLCB7IHZhbHVlOiAweEMwIH0pOyAvLzE5MlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ0hBTk5FTF9QUkVTU1VSRScsIHsgdmFsdWU6IDB4RDAgfSk7IC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQSVRDSF9CRU5EJywgeyB2YWx1ZTogMHhFMCB9KTsgLy8yMjRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NZU1RFTV9FWENMVVNJVkUnLCB7IHZhbHVlOiAweEYwIH0pOyAvLzI0MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTUlESV9USU1FQ09ERScsIHsgdmFsdWU6IDI0MSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfUE9TSVRJT04nLCB7IHZhbHVlOiAyNDIgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTT05HX1NFTEVDVCcsIHsgdmFsdWU6IDI0MyB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RVTkVfUkVRVUVTVCcsIHsgdmFsdWU6IDI0NiB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0VPWCcsIHsgdmFsdWU6IDI0NyB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RJTUlOR19DTE9DSycsIHsgdmFsdWU6IDI0OCB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NUQVJUJywgeyB2YWx1ZTogMjUwIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVElOVUUnLCB7IHZhbHVlOiAyNTEgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTVE9QJywgeyB2YWx1ZTogMjUyIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQUNUSVZFX1NFTlNJTkcnLCB7IHZhbHVlOiAyNTQgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTWVNURU1fUkVTRVQnLCB7IHZhbHVlOiAyNTUgfSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RFTVBPJywgeyB2YWx1ZTogMHg1MSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RJTUVfU0lHTkFUVVJFJywgeyB2YWx1ZTogMHg1OCB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0VORF9PRl9UUkFDSycsIHsgdmFsdWU6IDB4MkYgfSk7XG5cbmV4cG9ydHMuTUlESUV2ZW50VHlwZXMgPSBNSURJRXZlbnRUeXBlczsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLkNvbnZvbHV0aW9uUmV2ZXJiID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9wYXJzZV9hdWRpbyA9IHJlcXVpcmUoJy4vcGFyc2VfYXVkaW8nKTtcblxudmFyIF9jaGFubmVsX2Z4ID0gcmVxdWlyZSgnLi9jaGFubmVsX2Z4Jyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIENvbnZvbHV0aW9uUmV2ZXJiID0gZXhwb3J0cy5Db252b2x1dGlvblJldmVyYiA9IGZ1bmN0aW9uIChfQ2hhbm5lbEVmZmVjdCkge1xuICBfaW5oZXJpdHMoQ29udm9sdXRpb25SZXZlcmIsIF9DaGFubmVsRWZmZWN0KTtcblxuICBmdW5jdGlvbiBDb252b2x1dGlvblJldmVyYihidWZmZXIpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29udm9sdXRpb25SZXZlcmIpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbnZvbHV0aW9uUmV2ZXJiKS5jYWxsKHRoaXMpKTtcblxuICAgIF90aGlzLl9ub2RlRlggPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUNvbnZvbHZlcigpO1xuICAgIF90aGlzLmluaXQoKTtcblxuICAgIGlmIChidWZmZXIgaW5zdGFuY2VvZiBBdWRpb0J1ZmZlcikge1xuICAgICAgX3RoaXMuX25vZGVGWC5idWZmZXIgPSBidWZmZXI7XG4gICAgfVxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhDb252b2x1dGlvblJldmVyYiwgW3tcbiAgICBrZXk6ICdhZGRCdWZmZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRCdWZmZXIoYnVmZmVyKSB7XG4gICAgICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgQXVkaW9CdWZmZXIgPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhcmd1bWVudCBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgQXVkaW9CdWZmZXInLCBidWZmZXIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9ub2RlRlguYnVmZmVyID0gYnVmZmVyO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2xvYWRCdWZmZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkQnVmZmVyKHVybCkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICgwLCBfcGFyc2VfYXVkaW8ucGFyc2VTYW1wbGVzKSh1cmwpLnRoZW4oZnVuY3Rpb24gKGJ1ZmZlcikge1xuICAgICAgICAgIGJ1ZmZlciA9IGJ1ZmZlclswXTtcbiAgICAgICAgICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgQXVkaW9CdWZmZXIpIHtcbiAgICAgICAgICAgIF90aGlzMi5fbm9kZUZYLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KCdjb3VsZCBub3QgcGFyc2UgdG8gQXVkaW9CdWZmZXInLCB1cmwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQ29udm9sdXRpb25SZXZlcmI7XG59KF9jaGFubmVsX2Z4LkNoYW5uZWxFZmZlY3QpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuRGVsYXkgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG52YXIgX2NoYW5uZWxfZnggPSByZXF1aXJlKCcuL2NoYW5uZWxfZngnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfSAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDcmVkaXRzOiBodHRwOi8vYmxvZy5jaHJpc2xvd2lzLmNvLnVrLzIwMTQvMDcvMjMvZHViLWRlbGF5LXdlYi1hdWRpby1hcGkuaHRtbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxudmFyIERlbGF5ID0gZXhwb3J0cy5EZWxheSA9IGZ1bmN0aW9uIChfQ2hhbm5lbEVmZmVjdCkge1xuICBfaW5oZXJpdHMoRGVsYXksIF9DaGFubmVsRWZmZWN0KTtcblxuICBmdW5jdGlvbiBEZWxheSgpIHtcbiAgICB2YXIgY29uZmlnID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRGVsYXkpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgT2JqZWN0LmdldFByb3RvdHlwZU9mKERlbGF5KS5jYWxsKHRoaXMpKTtcblxuICAgIF90aGlzLl9ub2RlRlggPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZURlbGF5KCk7XG5cbiAgICB2YXIgX2NvbmZpZyRkZWxheVRpbWUgPSBjb25maWcuZGVsYXlUaW1lO1xuICAgIF90aGlzLmRlbGF5VGltZSA9IF9jb25maWckZGVsYXlUaW1lID09PSB1bmRlZmluZWQgPyAwLjIgOiBfY29uZmlnJGRlbGF5VGltZTtcbiAgICB2YXIgX2NvbmZpZyRmZWVkYmFjayA9IGNvbmZpZy5mZWVkYmFjaztcbiAgICBfdGhpcy5mZWVkYmFjayA9IF9jb25maWckZmVlZGJhY2sgPT09IHVuZGVmaW5lZCA/IDAuNyA6IF9jb25maWckZmVlZGJhY2s7XG4gICAgdmFyIF9jb25maWckZnJlcXVlbmN5ID0gY29uZmlnLmZyZXF1ZW5jeTtcbiAgICBfdGhpcy5mcmVxdWVuY3kgPSBfY29uZmlnJGZyZXF1ZW5jeSA9PT0gdW5kZWZpbmVkID8gMTAwMCA6IF9jb25maWckZnJlcXVlbmN5O1xuXG5cbiAgICBfdGhpcy5fbm9kZUZYLmRlbGF5VGltZS52YWx1ZSA9IF90aGlzLmRlbGF5VGltZTtcblxuICAgIF90aGlzLl9mZWVkYmFjayA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIF90aGlzLl9mZWVkYmFjay5nYWluLnZhbHVlID0gX3RoaXMuZmVlZGJhY2s7XG5cbiAgICBfdGhpcy5fZmlsdGVyID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcbiAgICBfdGhpcy5fZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IF90aGlzLmZyZXF1ZW5jeTtcblxuICAgIF90aGlzLl9ub2RlRlguY29ubmVjdChfdGhpcy5fZmVlZGJhY2spO1xuICAgIF90aGlzLl9mZWVkYmFjay5jb25uZWN0KF90aGlzLl9maWx0ZXIpO1xuICAgIF90aGlzLl9maWx0ZXIuY29ubmVjdChfdGhpcy5fbm9kZUZYKTtcblxuICAgIF90aGlzLmluaXQoKTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoRGVsYXksIFt7XG4gICAga2V5OiAnc2V0VGltZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFRpbWUodmFsdWUpIHtcbiAgICAgIHRoaXMuX25vZGVGWC5kZWxheVRpbWUudmFsdWUgPSB0aGlzLmRlbGF5VGltZSA9IHZhbHVlO1xuICAgICAgLy9jb25zb2xlLmxvZygndGltZScsIHZhbHVlKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEZlZWRiYWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0RmVlZGJhY2sodmFsdWUpIHtcbiAgICAgIHRoaXMuX2ZlZWRiYWNrLmdhaW4udmFsdWUgPSB0aGlzLmZlZWRiYWNrID0gdmFsdWU7XG4gICAgICAvL2NvbnNvbGUubG9nKCdmZWVkYmFjaycsIHZhbHVlKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEZyZXF1ZW5jeScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEZyZXF1ZW5jeSh2YWx1ZSkge1xuICAgICAgdGhpcy5fZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuZnJlcXVlbmN5ID0gdmFsdWU7XG4gICAgICAvL2NvbnNvbGUubG9nKCdmcmVxdWVuY3knLCB2YWx1ZSlcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gRGVsYXk7XG59KF9jaGFubmVsX2Z4LkNoYW5uZWxFZmZlY3QpO1xuXG4vKlxuKGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgYXVkaW9FbGVtZW50ID0gJCgnI3NsaWRlcnMgYXVkaW8nKVswXVxuXG4gIGF1ZGlvRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdwbGF5JywgZnVuY3Rpb24oKXtcbiAgICBzb3VyY2UgPSBjdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKGF1ZGlvRWxlbWVudCk7XG5cbiAgICBkZWxheSA9IGN0eC5jcmVhdGVEZWxheSgpO1xuICAgIGRlbGF5LmRlbGF5VGltZS52YWx1ZSA9IDAuNTtcblxuICAgIGZlZWRiYWNrID0gY3R4LmNyZWF0ZUdhaW4oKTtcbiAgICBmZWVkYmFjay5nYWluLnZhbHVlID0gMC44O1xuXG4gICAgZmlsdGVyID0gY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xuICAgIGZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAxMDAwO1xuXG4gICAgZGVsYXkuY29ubmVjdChmZWVkYmFjayk7XG4gICAgZmVlZGJhY2suY29ubmVjdChmaWx0ZXIpO1xuICAgIGZpbHRlci5jb25uZWN0KGRlbGF5KTtcblxuICAgIHNvdXJjZS5jb25uZWN0KGRlbGF5KTtcbiAgICBzb3VyY2UuY29ubmVjdChjdHguZGVzdGluYXRpb24pO1xuICAgIGRlbGF5LmNvbm5lY3QoY3R4LmRlc3RpbmF0aW9uKTtcbiAgfSk7XG5cbiAgdmFyIGNvbnRyb2xzID0gJChcImRpdiNzbGlkZXJzXCIpO1xuXG4gIGNvbnRyb2xzLmZpbmQoXCJpbnB1dFtuYW1lPSdkZWxheVRpbWUnXVwiKS5vbignaW5wdXQnLCBmdW5jdGlvbigpIHtcbiAgICBkZWxheS5kZWxheVRpbWUudmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICB9KTtcblxuICBjb250cm9scy5maW5kKFwiaW5wdXRbbmFtZT0nZmVlZGJhY2snXVwiKS5vbignaW5wdXQnLCBmdW5jdGlvbigpIHtcbiAgICBmZWVkYmFjay5nYWluLnZhbHVlID0gJCh0aGlzKS52YWwoKTtcbiAgfSk7XG5cbiAgY29udHJvbHMuZmluZChcImlucHV0W25hbWU9J2ZyZXF1ZW5jeSddXCIpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICB9KTtcbn0pKCk7XG4qLyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG5leHBvcnRzLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuZXhwb3J0cy5hZGRFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lcjtcbmV4cG9ydHMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50TGlzdGVuZXI7XG52YXIgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpIHtcbiAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlKVxuICB2YXIgbWFwID0gdm9pZCAwO1xuXG4gIGlmIChldmVudC50eXBlID09PSAnZXZlbnQnKSB7XG4gICAgdmFyIG1pZGlFdmVudCA9IGV2ZW50LmRhdGE7XG4gICAgdmFyIG1pZGlFdmVudFR5cGUgPSBtaWRpRXZlbnQudHlwZTtcbiAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudFR5cGUpXG4gICAgaWYgKGV2ZW50TGlzdGVuZXJzLmhhcyhtaWRpRXZlbnRUeXBlKSkge1xuICAgICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudFR5cGUpO1xuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IG1hcC52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgY2IgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgIGNiKG1pZGlFdmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnRMaXN0ZW5lcnMuaGFzKGV2ZW50LnR5cGUpKVxuICBpZiAoZXZlbnRMaXN0ZW5lcnMuaGFzKGV2ZW50LnR5cGUpID09PSBmYWxzZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKTtcbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IG1hcC52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgdmFyIF9jYiA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgX2NiKGV2ZW50KTtcbiAgICB9XG5cbiAgICAvLyBAdG9kbzogcnVuIGZpbHRlcnMgaGVyZSwgZm9yIGluc3RhbmNlIGlmIGFuIGV2ZW50bGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgdG8gYWxsIE5PVEVfT04gZXZlbnRzLCBjaGVjayB0aGUgdHlwZSBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spIHtcblxuICB2YXIgbWFwID0gdm9pZCAwO1xuICB2YXIgaWQgPSB0eXBlICsgJ18nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgaWYgKGV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSA9PT0gZmFsc2UpIHtcbiAgICBtYXAgPSBuZXcgTWFwKCk7XG4gICAgZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIG1hcCk7XG4gIH0gZWxzZSB7XG4gICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpO1xuICB9XG5cbiAgbWFwLnNldChpZCwgY2FsbGJhY2spO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50TGlzdGVuZXJzKVxuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpIHtcblxuICBpZiAoZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUubG9nKCdubyBldmVudGxpc3RlbmVycyBvZiB0eXBlJyArIHR5cGUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBtYXAgPSBldmVudExpc3RlbmVycy5nZXQodHlwZSk7XG5cbiAgaWYgKHR5cGVvZiBpZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWU7XG4gICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMyA9IGZhbHNlO1xuICAgIHZhciBfaXRlcmF0b3JFcnJvcjMgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMyA9IG1hcC5lbnRyaWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDM7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSAoX3N0ZXAzID0gX2l0ZXJhdG9yMy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWUpIHtcbiAgICAgICAgdmFyIF9zdGVwMyR2YWx1ZSA9IF9zbGljZWRUb0FycmF5KF9zdGVwMy52YWx1ZSwgMik7XG5cbiAgICAgICAgdmFyIGtleSA9IF9zdGVwMyR2YWx1ZVswXTtcbiAgICAgICAgdmFyIHZhbHVlID0gX3N0ZXAzJHZhbHVlWzFdO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGtleSwgdmFsdWUpO1xuICAgICAgICBpZiAodmFsdWUgPT09IGlkKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coa2V5KTtcbiAgICAgICAgICBpZCA9IGtleTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IzID0gdHJ1ZTtcbiAgICAgIF9pdGVyYXRvckVycm9yMyA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyAmJiBfaXRlcmF0b3IzLnJldHVybikge1xuICAgICAgICAgIF9pdGVyYXRvcjMucmV0dXJuKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjMpIHtcbiAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykge1xuICAgICAgbWFwLmRlbGV0ZShpZCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpIHtcbiAgICBtYXAuZGVsZXRlKGlkKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygnY291bGQgbm90IHJlbW92ZSBldmVudGxpc3RlbmVyJyk7XG4gIH1cbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuc3RhdHVzID0gc3RhdHVzO1xuZXhwb3J0cy5qc29uID0ganNvbjtcbmV4cG9ydHMuYXJyYXlCdWZmZXIgPSBhcnJheUJ1ZmZlcjtcbmV4cG9ydHMuZmV0Y2hKU09OID0gZmV0Y2hKU09OO1xuZXhwb3J0cy5mZXRjaEFycmF5YnVmZmVyID0gZmV0Y2hBcnJheWJ1ZmZlcjtcbi8vIGZldGNoIGhlbHBlcnNcblxuZnVuY3Rpb24gc3RhdHVzKHJlc3BvbnNlKSB7XG4gIGlmIChyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2UpO1xuICB9XG4gIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpO1xufVxuXG5mdW5jdGlvbiBqc29uKHJlc3BvbnNlKSB7XG4gIHJldHVybiByZXNwb25zZS5qc29uKCk7XG59XG5cbmZ1bmN0aW9uIGFycmF5QnVmZmVyKHJlc3BvbnNlKSB7XG4gIHJldHVybiByZXNwb25zZS5hcnJheUJ1ZmZlcigpO1xufVxuXG5mdW5jdGlvbiBmZXRjaEpTT04odXJsKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgLy8gZmV0Y2godXJsLCB7XG4gICAgLy8gICBtb2RlOiAnbm8tY29ycydcbiAgICAvLyB9KVxuICAgIGZldGNoKHVybCkudGhlbihzdGF0dXMpLnRoZW4oanNvbikudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgcmVqZWN0KGUpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZmV0Y2hBcnJheWJ1ZmZlcih1cmwpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAvLyBmZXRjaCh1cmwsIHtcbiAgICAvLyAgIG1vZGU6ICduby1jb3JzJ1xuICAgIC8vIH0pXG4gICAgZmV0Y2godXJsKS50aGVuKHN0YXR1cykudGhlbihhcnJheUJ1ZmZlcikudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgcmVqZWN0KGUpO1xuICAgIH0pO1xuICB9KTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLkJsb2IgPSBleHBvcnRzLnJBRiA9IGV4cG9ydHMuZ2V0VXNlck1lZGlhID0gdW5kZWZpbmVkO1xuZXhwb3J0cy5pbml0ID0gaW5pdDtcblxudmFyIF9xYW1iaSA9IHJlcXVpcmUoJy4vcWFtYmknKTtcblxudmFyIF9xYW1iaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9xYW1iaSk7XG5cbnZhciBfc29uZyA9IHJlcXVpcmUoJy4vc29uZycpO1xuXG52YXIgX3NhbXBsZXIgPSByZXF1aXJlKCcuL3NhbXBsZXInKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfaW5pdF9taWRpID0gcmVxdWlyZSgnLi9pbml0X21pZGknKTtcblxudmFyIF9zZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGdldFVzZXJNZWRpYSA9IGV4cG9ydHMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS53YXJuKCdnZXRVc2VyTWVkaWEgaXMgbm90IGF2YWlsYWJsZScpO1xuICB9O1xufSgpO1xuXG52YXIgckFGID0gZXhwb3J0cy5yQUYgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLndhcm4oJ3JlcXVlc3RBbmltYXRpb25GcmFtZSBpcyBub3QgYXZhaWxhYmxlJyk7XG4gIH07XG59KCk7XG5cbnZhciBCbG9iID0gZXhwb3J0cy5CbG9iID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gd2luZG93LkJsb2IgfHwgd2luZG93LndlYmtpdEJsb2I7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLndhcm4oJ0Jsb2IgaXMgbm90IGF2YWlsYWJsZScpO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiBsb2FkSW5zdHJ1bWVudChkYXRhKSB7XG4gIHZhciBzYW1wbGVyID0gbmV3IF9zYW1wbGVyLlNhbXBsZXIoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBzYW1wbGVyLnBhcnNlU2FtcGxlRGF0YShkYXRhKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiByZXNvbHZlKHNhbXBsZXIpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcblxuXG4gIC8vIGxvYWQgc2V0dGluZ3MuaW5zdHJ1bWVudHMgKGFycmF5IG9yIG9iamVjdClcbiAgLy8gbG9hZCBzZXR0aW5ncy5taWRpZmlsZXMgKGFycmF5IG9yIG9iamVjdClcbiAgLypcbiAgIHFhbWJpLmluaXQoe1xuICAgIHNvbmc6IHtcbiAgICAgIHR5cGU6ICdTb25nJyxcbiAgICAgIHVybDogJy4uL2RhdGEvbWludXRlX3dhbHR6Lm1pZCdcbiAgICB9LFxuICAgIHBpYW5vOiB7XG4gICAgICB0eXBlOiAnSW5zdHJ1bWVudCcsXG4gICAgICB1cmw6ICcuLi8uLi9pbnN0cnVtZW50cy9lbGVjdHJpYy1waWFuby5qc29uJ1xuICAgIH1cbiAgfSlcbiAgIHFhbWJpLmluaXQoe1xuICAgIGluc3RydW1lbnRzOiBbJy4uL2luc3RydW1lbnRzL3BpYW5vJywgJy4uL2luc3RydW1lbnRzL3Zpb2xpbiddLFxuICAgIG1pZGlmaWxlczogWycuLi9taWRpL21vemFydC5taWQnXVxuICB9KVxuICAudGhlbigobG9hZGVkKSA9PiB7XG4gICAgbGV0IFtwaWFubywgdmlvbGluXSA9IGxvYWRlZC5pbnN0cnVtZW50c1xuICAgIGxldCBbbW96YXJ0XSA9IGxvYWRlZC5taWRpZmlsZXNcbiAgfSlcbiAgICovXG5cbiAgdmFyIHByb21pc2VzID0gWygwLCBfaW5pdF9hdWRpby5pbml0QXVkaW8pKCksICgwLCBfaW5pdF9taWRpLmluaXRNSURJKSgpXTtcbiAgdmFyIGxvYWRLZXlzID0gdm9pZCAwO1xuXG4gIGlmIChzZXR0aW5ncyAhPT0gbnVsbCkge1xuXG4gICAgbG9hZEtleXMgPSBPYmplY3Qua2V5cyhzZXR0aW5ncyk7XG4gICAgdmFyIGkgPSBsb2FkS2V5cy5pbmRleE9mKCdzZXR0aW5ncycpO1xuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgKDAsIF9zZXR0aW5ncy51cGRhdGVTZXR0aW5ncykoc2V0dGluZ3Muc2V0dGluZ3MpO1xuICAgICAgbG9hZEtleXMuc3BsaWNlKGksIDEpO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKGxvYWRLZXlzKVxuXG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBsb2FkS2V5c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgdmFyIGtleSA9IF9zdGVwLnZhbHVlO1xuXG5cbiAgICAgICAgdmFyIGRhdGEgPSBzZXR0aW5nc1trZXldO1xuXG4gICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICdTb25nJykge1xuICAgICAgICAgIHByb21pc2VzLnB1c2goX3NvbmcuU29uZy5mcm9tTUlESUZpbGUoZGF0YS51cmwpKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdJbnN0cnVtZW50Jykge1xuICAgICAgICAgIHByb21pc2VzLnB1c2gobG9hZEluc3RydW1lbnQoZGF0YSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblxuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgdmFyIHJldHVybk9iaiA9IHt9O1xuXG4gICAgICByZXN1bHQuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSwgaSkge1xuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgIC8vIGluaXRBdWRpb1xuICAgICAgICAgIHJldHVybk9iai5sZWdhY3kgPSBkYXRhLmxlZ2FjeTtcbiAgICAgICAgICByZXR1cm5PYmoubXAzID0gZGF0YS5tcDM7XG4gICAgICAgICAgcmV0dXJuT2JqLm9nZyA9IGRhdGEub2dnO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDEpIHtcbiAgICAgICAgICAvLyBpbml0TUlESVxuICAgICAgICAgIHJldHVybk9iai5qYXp6ID0gZGF0YS5qYXp6O1xuICAgICAgICAgIHJldHVybk9iai5taWRpID0gZGF0YS5taWRpO1xuICAgICAgICAgIHJldHVybk9iai53ZWJtaWRpID0gZGF0YS53ZWJtaWRpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEluc3RydW1lbnRzLCBzYW1wbGVzIG9yIE1JREkgZmlsZXMgdGhhdCBnb3QgbG9hZGVkIGR1cmluZyBpbml0aWFsaXphdGlvblxuICAgICAgICAgIC8vcmVzdWx0W2xvYWRLZXlzW2kgLSAyXV0gPSBkYXRhXG4gICAgICAgICAgcmV0dXJuT2JqW2xvYWRLZXlzW2kgLSAyXV0gPSBkYXRhO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhyZXR1cm5PYmouamF6eilcblxuICAgICAgaWYgKHJldHVybk9iai5taWRpID09PSBmYWxzZSkge1xuICAgICAgICBjb25zb2xlLmxvZygncWFtYmknLCBfcWFtYmkyLmRlZmF1bHQudmVyc2lvbiwgJ1t5b3VyIGJyb3dzZXIgaGFzIG5vIHN1cHBvcnQgZm9yIE1JREldJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygncWFtYmknLCBfcWFtYmkyLmRlZmF1bHQudmVyc2lvbik7XG4gICAgICB9XG4gICAgICByZXNvbHZlKHJldHVybk9iaik7XG4gICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICByZWplY3QoZXJyb3IpO1xuICAgIH0pO1xuICB9KTtcblxuICAvKlxuICAgIFByb21pc2UuYWxsKFtpbml0QXVkaW8oKSwgaW5pdE1JREkoKV0pXG4gICAgLnRoZW4oXG4gICAgKGRhdGEpID0+IHtcbiAgICAgIC8vIHBhcnNlQXVkaW9cbiAgICAgIGxldCBkYXRhQXVkaW8gPSBkYXRhWzBdXG4gIFxuICAgICAgLy8gcGFyc2VNSURJXG4gICAgICBsZXQgZGF0YU1pZGkgPSBkYXRhWzFdXG4gIFxuICAgICAgY2FsbGJhY2soe1xuICAgICAgICBsZWdhY3k6IGRhdGFBdWRpby5sZWdhY3ksXG4gICAgICAgIG1wMzogZGF0YUF1ZGlvLm1wMyxcbiAgICAgICAgb2dnOiBkYXRhQXVkaW8ub2dnLFxuICAgICAgICBtaWRpOiBkYXRhTWlkaS5taWRpLFxuICAgICAgICB3ZWJtaWRpOiBkYXRhTWlkaS53ZWJtaWRpLFxuICAgICAgfSlcbiAgICB9LFxuICAgIChlcnJvcikgPT4ge1xuICAgICAgY2FsbGJhY2soZXJyb3IpXG4gICAgfSlcbiAgKi9cbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBleHBvcnRzLmVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBleHBvcnRzLmdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZXhwb3J0cy5nZXRNYXN0ZXJWb2x1bWUgPSBleHBvcnRzLnNldE1hc3RlclZvbHVtZSA9IGV4cG9ydHMubWFzdGVyQ29tcHJlc3NvciA9IGV4cG9ydHMudW5sb2NrV2ViQXVkaW8gPSBleHBvcnRzLm1hc3RlckdhaW4gPSBleHBvcnRzLmNvbnRleHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNldHMgdXAgdGhlIGJhc2ljIGF1ZGlvIHJvdXRpbmcsIHRlc3RzIHdoaWNoIGF1ZGlvIGZvcm1hdHMgYXJlIHN1cHBvcnRlZCBhbmQgcGFyc2VzIHRoZSBzYW1wbGVzIGZvciB0aGUgbWV0cm9ub21lIHRpY2tzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG5leHBvcnRzLmluaXRBdWRpbyA9IGluaXRBdWRpbztcbmV4cG9ydHMuZ2V0SW5pdERhdGEgPSBnZXRJbml0RGF0YTtcblxudmFyIF9zYW1wbGVzID0gcmVxdWlyZSgnLi9zYW1wbGVzJyk7XG5cbnZhciBfc2FtcGxlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zYW1wbGVzKTtcblxudmFyIF9wYXJzZV9hdWRpbyA9IHJlcXVpcmUoJy4vcGFyc2VfYXVkaW8nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGRhdGEgPSB2b2lkIDA7XG52YXIgbWFzdGVyR2FpbiA9IHZvaWQgMDtcbnZhciBjb21wcmVzc29yID0gdm9pZCAwO1xudmFyIGluaXRpYWxpemVkID0gZmFsc2U7XG5cbnZhciBjb250ZXh0ID0gZXhwb3J0cy5jb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuICAvL2NvbnNvbGUubG9nKCdpbml0IEF1ZGlvQ29udGV4dCcpXG4gIHZhciBjdHggPSB2b2lkIDA7XG4gIGlmICgodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2Yod2luZG93KSkgPT09ICdvYmplY3QnKSB7XG4gICAgdmFyIEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbiAgICBpZiAoQXVkaW9Db250ZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuICAgIH1cbiAgfVxuICBpZiAodHlwZW9mIGN0eCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvL0BUT0RPOiBjcmVhdGUgZHVtbXkgQXVkaW9Db250ZXh0IGZvciB1c2UgaW4gbm9kZSwgc2VlOiBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9hdWRpby1jb250ZXh0XG4gICAgZXhwb3J0cy5jb250ZXh0ID0gY29udGV4dCA9IHtcbiAgICAgIGNyZWF0ZUdhaW46IGZ1bmN0aW9uIGNyZWF0ZUdhaW4oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2FpbjogMVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIGNyZWF0ZU9zY2lsbGF0b3I6IGZ1bmN0aW9uIGNyZWF0ZU9zY2lsbGF0b3IoKSB7fVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGN0eDtcbn0oKTtcblxuZnVuY3Rpb24gaW5pdEF1ZGlvKCkge1xuXG4gIGlmICh0eXBlb2YgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluO1xuICB9XG4gIC8vIGNoZWNrIGZvciBvbGRlciBpbXBsZW1lbnRhdGlvbnMgb2YgV2ViQXVkaW9cbiAgZGF0YSA9IHt9O1xuICB2YXIgc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgZGF0YS5sZWdhY3kgPSBmYWxzZTtcbiAgaWYgKHR5cGVvZiBzb3VyY2Uuc3RhcnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZGF0YS5sZWdhY3kgPSB0cnVlO1xuICB9XG5cbiAgLy8gc2V0IHVwIHRoZSBlbGVtZW50YXJ5IGF1ZGlvIG5vZGVzXG4gIGV4cG9ydHMubWFzdGVyQ29tcHJlc3NvciA9IGNvbXByZXNzb3IgPSBjb250ZXh0LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvcigpO1xuICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gIGV4cG9ydHMuXG4gIC8vY29uc29sZS5sb2coJ2FscmVhZHkgZG9uZScpXG4gIG1hc3RlckdhaW4gPSBtYXN0ZXJHYWluID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gMC41O1xuICBpbml0aWFsaXplZCA9IHRydWU7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblxuICAgICgwLCBfcGFyc2VfYXVkaW8ucGFyc2VTYW1wbGVzKShfc2FtcGxlczIuZGVmYXVsdCkudGhlbihmdW5jdGlvbiBvbkZ1bGZpbGxlZChidWZmZXJzKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGJ1ZmZlcnMpXG4gICAgICAvLyBkYXRhLm9nZyA9IHR5cGVvZiBidWZmZXJzLmVtcHR5T2dnICE9PSAndW5kZWZpbmVkJ1xuICAgICAgLy8gZGF0YS5tcDMgPSB0eXBlb2YgYnVmZmVycy5lbXB0eU1wMyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIGRhdGEubG93dGljayA9IGJ1ZmZlcnMubG93dGljaztcbiAgICAgIGRhdGEuaGlnaHRpY2sgPSBidWZmZXJzLmhpZ2h0aWNrO1xuICAgICAgaWYgKGRhdGEub2dnID09PSBmYWxzZSAmJiBkYXRhLm1wMyA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmVqZWN0KCdObyBzdXBwb3J0IGZvciBvZ2cgbm9yIG1wMyEnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gb25SZWplY3RlZCgpIHtcbiAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgaW5pdGlhbGl6aW5nIEF1ZGlvJyk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG52YXIgX3NldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uIHNldE1hc3RlclZvbHVtZSgpIHtcbiAgdmFyIHZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gMC41IDogYXJndW1lbnRzWzBdO1xuXG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuc2V0TWFzdGVyVm9sdW1lID0gX3NldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uIHNldE1hc3RlclZvbHVtZSgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDAuNSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgaWYgKHZhbHVlID4gMSkge1xuICAgICAgICBjb25zb2xlLmluZm8oJ21heGltYWwgdm9sdW1lIGlzIDEuMCwgdm9sdW1lIGlzIHNldCB0byAxLjAnKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUgPCAwID8gMCA6IHZhbHVlID4gMSA/IDEgOiB2YWx1ZTtcbiAgICAgIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICAgIH07XG4gICAgX3NldE1hc3RlclZvbHVtZSh2YWx1ZSk7XG4gIH1cbn07XG5cbnZhciBfZ2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24gZ2V0TWFzdGVyVm9sdW1lKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1hc3RlclZvbHVtZSA9IF9nZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbiBnZXRNYXN0ZXJWb2x1bWUoKSB7XG4gICAgICByZXR1cm4gbWFzdGVyR2Fpbi5nYWluLnZhbHVlO1xuICAgIH07XG4gICAgcmV0dXJuIF9nZXRNYXN0ZXJWb2x1bWUoKTtcbiAgfVxufTtcblxudmFyIF9nZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uIGdldENvbXByZXNzaW9uUmVkdWN0aW9uKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gX2dldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24gZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24oKSB7XG4gICAgICByZXR1cm4gY29tcHJlc3Nvci5yZWR1Y3Rpb24udmFsdWU7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldENvbXByZXNzaW9uUmVkdWN0aW9uKCk7XG4gIH1cbn07XG5cbnZhciBfZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uIGVuYWJsZU1hc3RlckNvbXByZXNzb3IoKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IF9lbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24gZW5hYmxlTWFzdGVyQ29tcHJlc3NvcihmbGFnKSB7XG4gICAgICBpZiAoZmxhZykge1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb21wcmVzc29yKTtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgfVxuICAgIH07XG4gICAgX2VuYWJsZU1hc3RlckNvbXByZXNzb3IoKTtcbiAgfVxufTtcblxudmFyIF9jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24gY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvcihjZmcpIHtcbiAgLypcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBhdHRhY2s7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBrbmVlOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJhdGlvOyAvLyB1bml0LWxlc3NcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWR1Y3Rpb247IC8vIGluIERlY2liZWxzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVsZWFzZTsgLy8gaW4gU2Vjb25kc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHRocmVzaG9sZDsgLy8gaW4gRGVjaWJlbHNcbiAgICAgQHNlZTogaHR0cDovL3dlYmF1ZGlvLmdpdGh1Yi5pby93ZWItYXVkaW8tYXBpLyN0aGUtZHluYW1pY3Njb21wcmVzc29ybm9kZS1pbnRlcmZhY2VcbiAgKi9cbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gX2NvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbiBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yKGNmZykge1xuICAgICAgdmFyIF9jZmckYXR0YWNrID0gY2ZnLmF0dGFjaztcbiAgICAgIGNvbXByZXNzb3IuYXR0YWNrID0gX2NmZyRhdHRhY2sgPT09IHVuZGVmaW5lZCA/IDAuMDAzIDogX2NmZyRhdHRhY2s7XG4gICAgICB2YXIgX2NmZyRrbmVlID0gY2ZnLmtuZWU7XG4gICAgICBjb21wcmVzc29yLmtuZWUgPSBfY2ZnJGtuZWUgPT09IHVuZGVmaW5lZCA/IDMwIDogX2NmZyRrbmVlO1xuICAgICAgdmFyIF9jZmckcmF0aW8gPSBjZmcucmF0aW87XG4gICAgICBjb21wcmVzc29yLnJhdGlvID0gX2NmZyRyYXRpbyA9PT0gdW5kZWZpbmVkID8gMTIgOiBfY2ZnJHJhdGlvO1xuICAgICAgdmFyIF9jZmckcmVkdWN0aW9uID0gY2ZnLnJlZHVjdGlvbjtcbiAgICAgIGNvbXByZXNzb3IucmVkdWN0aW9uID0gX2NmZyRyZWR1Y3Rpb24gPT09IHVuZGVmaW5lZCA/IDAgOiBfY2ZnJHJlZHVjdGlvbjtcbiAgICAgIHZhciBfY2ZnJHJlbGVhc2UgPSBjZmcucmVsZWFzZTtcbiAgICAgIGNvbXByZXNzb3IucmVsZWFzZSA9IF9jZmckcmVsZWFzZSA9PT0gdW5kZWZpbmVkID8gMC4yNTAgOiBfY2ZnJHJlbGVhc2U7XG4gICAgICB2YXIgX2NmZyR0aHJlc2hvbGQgPSBjZmcudGhyZXNob2xkO1xuICAgICAgY29tcHJlc3Nvci50aHJlc2hvbGQgPSBfY2ZnJHRocmVzaG9sZCA9PT0gdW5kZWZpbmVkID8gLTI0IDogX2NmZyR0aHJlc2hvbGQ7XG4gICAgfTtcbiAgICBfY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvcihjZmcpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRJbml0RGF0YSgpIHtcbiAgcmV0dXJuIGRhdGE7XG59XG5cbi8vIHRoaXMgZG9lc24ndCBzZWVtIHRvIGJlIG5lY2Vzc2FyeSBhbnltb3JlIG9uIGlPUyBhbnltb3JlXG52YXIgX3VubG9ja1dlYkF1ZGlvID0gZnVuY3Rpb24gdW5sb2NrV2ViQXVkaW8oKSB7XG4gIHZhciBzcmMgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcbiAgdmFyIGdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gIGdhaW5Ob2RlLmdhaW4udmFsdWUgPSAwO1xuICBzcmMuY29ubmVjdChnYWluTm9kZSk7XG4gIGdhaW5Ob2RlLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gIGlmICh0eXBlb2Ygc3JjLm5vdGVPbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzcmMuc3RhcnQgPSBzcmMubm90ZU9uO1xuICAgIHNyYy5zdG9wID0gc3JjLm5vdGVPZmY7XG4gIH1cbiAgc3JjLnN0YXJ0KDApO1xuICBzcmMuc3RvcCgwLjAwMSk7XG4gIGV4cG9ydHMudW5sb2NrV2ViQXVkaW8gPSBfdW5sb2NrV2ViQXVkaW8gPSBmdW5jdGlvbiB1bmxvY2tXZWJBdWRpbygpIHt9O1xufTtcblxuZXhwb3J0cy5tYXN0ZXJHYWluID0gbWFzdGVyR2FpbjtcbmV4cG9ydHMudW5sb2NrV2ViQXVkaW8gPSBfdW5sb2NrV2ViQXVkaW87XG5leHBvcnRzLm1hc3RlckNvbXByZXNzb3IgPSBjb21wcmVzc29yO1xuZXhwb3J0cy5zZXRNYXN0ZXJWb2x1bWUgPSBfc2V0TWFzdGVyVm9sdW1lO1xuZXhwb3J0cy5nZXRNYXN0ZXJWb2x1bWUgPSBfZ2V0TWFzdGVyVm9sdW1lO1xuZXhwb3J0cy5nZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IF9nZXRDb21wcmVzc2lvblJlZHVjdGlvbjtcbmV4cG9ydHMuZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IF9lbmFibGVNYXN0ZXJDb21wcmVzc29yO1xuZXhwb3J0cy5jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gX2NvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3I7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nZXRNSURJSW5wdXRCeUlkID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0QnlJZCA9IGV4cG9ydHMuZ2V0TUlESUlucHV0SWRzID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0SWRzID0gZXhwb3J0cy5nZXRNSURJSW5wdXRzID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IGV4cG9ydHMuZ2V0TUlESUFjY2VzcyA9IHVuZGVmaW5lZDtcbmV4cG9ydHMuaW5pdE1JREkgPSBpbml0TUlESTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnJlcXVpcmUoJ3dlYm1pZGlhcGlzaGltJyk7XG5cbi8vIHlvdSBjYW4gYWxzbyBlbWJlZCB0aGUgc2hpbSBhcyBhIHN0YW5kLWFsb25lIHNjcmlwdCBpbiB0aGUgaHRtbCwgdGhlbiB5b3UgY2FuIGNvbW1lbnQgdGhpcyBsaW5lIG91dFxuXG4vKlxuICBSZXF1ZXN0cyBNSURJIGFjY2VzcywgcXVlcmllcyBhbGwgaW5wdXRzIGFuZCBvdXRwdXRzIGFuZCBzdG9yZXMgdGhlbSBpbiBhbHBoYWJldGljYWwgb3JkZXJcbiovXG5cbnZhciBNSURJQWNjZXNzID0gdm9pZCAwO1xudmFyIGluaXRpYWxpemVkID0gZmFsc2U7XG52YXIgaW5wdXRzID0gW107XG52YXIgb3V0cHV0cyA9IFtdO1xudmFyIGlucHV0SWRzID0gW107XG52YXIgb3V0cHV0SWRzID0gW107XG52YXIgaW5wdXRzQnlJZCA9IG5ldyBNYXAoKTtcbnZhciBvdXRwdXRzQnlJZCA9IG5ldyBNYXAoKTtcblxudmFyIHNvbmdNaWRpRXZlbnRMaXN0ZW5lciA9IHZvaWQgMDtcbnZhciBtaWRpRXZlbnRMaXN0ZW5lcklkID0gMDtcblxuZnVuY3Rpb24gZ2V0TUlESXBvcnRzKCkge1xuICBpbnB1dHMgPSBBcnJheS5mcm9tKE1JRElBY2Nlc3MuaW5wdXRzLnZhbHVlcygpKTtcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgaW5wdXRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYS5uYW1lLnRvTG93ZXJDYXNlKCkgPD0gYi5uYW1lLnRvTG93ZXJDYXNlKCkgPyAxIDogLTE7XG4gIH0pO1xuXG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGlucHV0c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgIHZhciBwb3J0ID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgIGlucHV0c0J5SWQuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICAgICAgaW5wdXRJZHMucHVzaChwb3J0LmlkKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb3V0cHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5vdXRwdXRzLnZhbHVlcygpKTtcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgb3V0cHV0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBvdXRwdXRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICB2YXIgX3BvcnQgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgIC8vY29uc29sZS5sb2cocG9ydC5pZCwgcG9ydC5uYW1lKVxuICAgICAgb3V0cHV0c0J5SWQuc2V0KF9wb3J0LmlkLCBfcG9ydCk7XG4gICAgICBvdXRwdXRJZHMucHVzaChfcG9ydC5pZCk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2cob3V0cHV0c0J5SWQpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvcjIucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0TUlESSgpIHtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICB2YXIgamF6eiA9IGZhbHNlO1xuICAgIHZhciBtaWRpID0gZmFsc2U7XG4gICAgdmFyIHdlYm1pZGkgPSBmYWxzZTtcblxuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJykge1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgcmVzb2x2ZSh7IG1pZGk6IG1pZGkgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzICE9PSAndW5kZWZpbmVkJykge1xuXG4gICAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MoKS50aGVuKGZ1bmN0aW9uIG9uRnVsRmlsbGVkKG1pZGlBY2Nlc3MpIHtcbiAgICAgICAgTUlESUFjY2VzcyA9IG1pZGlBY2Nlc3M7XG4gICAgICAgIC8vIEBUT0RPOiBpbXBsZW1lbnQgc29tZXRoaW5nIGluIHdlYm1pZGlhcGlzaGltIHRoYXQgYWxsb3dzIHVzIHRvIGRldGVjdCB0aGUgSmF6eiBwbHVnaW4gdmVyc2lvblxuICAgICAgICBpZiAodHlwZW9mIG1pZGlBY2Nlc3MuX2phenpJbnN0YW5jZXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2phenonKTtcbiAgICAgICAgICBqYXp6ID0gbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlc1swXS5fSmF6ei52ZXJzaW9uO1xuICAgICAgICAgIG1pZGkgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdlYm1pZGkgPSB0cnVlO1xuICAgICAgICAgIG1pZGkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0TUlESXBvcnRzKCk7XG5cbiAgICAgICAgLy8gb25jb25uZWN0IGFuZCBvbmRpc2Nvbm5lY3QgYXJlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIGFuZCBDaHJvbWl1bVxuICAgICAgICBtaWRpQWNjZXNzLm9uY29ubmVjdCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBjb25uZWN0ZWQnLCBlKTtcbiAgICAgICAgICBnZXRNSURJcG9ydHMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBtaWRpQWNjZXNzLm9uZGlzY29ubmVjdCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBkaXNjb25uZWN0ZWQnLCBlKTtcbiAgICAgICAgICBnZXRNSURJcG9ydHMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgIGpheno6IGphenosXG4gICAgICAgICAgbWlkaTogbWlkaSxcbiAgICAgICAgICB3ZWJtaWRpOiB3ZWJtaWRpLFxuICAgICAgICAgIGlucHV0czogaW5wdXRzLFxuICAgICAgICAgIG91dHB1dHM6IG91dHB1dHMsXG4gICAgICAgICAgaW5wdXRzQnlJZDogaW5wdXRzQnlJZCxcbiAgICAgICAgICBvdXRwdXRzQnlJZDogb3V0cHV0c0J5SWRcbiAgICAgICAgfSk7XG4gICAgICB9LCBmdW5jdGlvbiBvblJlamVjdChlKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coZSlcbiAgICAgICAgLy9yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIHJlcXVlc3RpbmcgTUlESUFjY2VzcycsIGUpXG4gICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSh7IG1pZGk6IG1pZGksIGpheno6IGphenogfSk7XG4gICAgICB9KTtcbiAgICAgIC8vIGJyb3dzZXJzIHdpdGhvdXQgV2ViTUlESSBBUElcbiAgICB9IGVsc2Uge1xuICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoeyBtaWRpOiBtaWRpIH0pO1xuICAgICAgfVxuICB9KTtcbn1cblxudmFyIF9nZXRNSURJQWNjZXNzID0gZnVuY3Rpb24gZ2V0TUlESUFjY2VzcygpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5nZXRNSURJQWNjZXNzID0gX2dldE1JRElBY2Nlc3MgPSBmdW5jdGlvbiBnZXRNSURJQWNjZXNzKCkge1xuICAgICAgcmV0dXJuIE1JRElBY2Nlc3M7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElBY2Nlc3MoKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElBY2Nlc3MgPSBfZ2V0TUlESUFjY2VzcztcbnZhciBfZ2V0TUlESU91dHB1dHMgPSBmdW5jdGlvbiBnZXRNSURJT3V0cHV0cygpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IF9nZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uIGdldE1JRElPdXRwdXRzKCkge1xuICAgICAgcmV0dXJuIG91dHB1dHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElPdXRwdXRzKCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IF9nZXRNSURJT3V0cHV0cztcbnZhciBfZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uIGdldE1JRElJbnB1dHMoKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0TUlESUlucHV0cyA9IF9nZXRNSURJSW5wdXRzID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0cygpIHtcbiAgICAgIHJldHVybiBpbnB1dHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElJbnB1dHMoKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElJbnB1dHMgPSBfZ2V0TUlESUlucHV0cztcbnZhciBfZ2V0TUlESU91dHB1dElkcyA9IGZ1bmN0aW9uIGdldE1JRElPdXRwdXRJZHMoKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0TUlESU91dHB1dElkcyA9IF9nZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24gZ2V0TUlESU91dHB1dElkcygpIHtcbiAgICAgIHJldHVybiBvdXRwdXRJZHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElPdXRwdXRJZHMoKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElPdXRwdXRJZHMgPSBfZ2V0TUlESU91dHB1dElkcztcbnZhciBfZ2V0TUlESUlucHV0SWRzID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0SWRzKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElJbnB1dElkcyA9IF9nZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbiBnZXRNSURJSW5wdXRJZHMoKSB7XG4gICAgICByZXR1cm4gaW5wdXRJZHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElJbnB1dElkcygpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydHMuZ2V0TUlESUlucHV0SWRzID0gX2dldE1JRElJbnB1dElkcztcbnZhciBfZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbiBnZXRNSURJT3V0cHV0QnlJZChpZCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElPdXRwdXRCeUlkID0gX2dldE1JRElPdXRwdXRCeUlkID0gZnVuY3Rpb24gZ2V0TUlESU91dHB1dEJ5SWQoX2lkKSB7XG4gICAgICByZXR1cm4gb3V0cHV0c0J5SWQuZ2V0KF9pZCk7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElPdXRwdXRCeUlkKGlkKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElPdXRwdXRCeUlkID0gX2dldE1JRElPdXRwdXRCeUlkO1xudmFyIF9nZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0QnlJZChpZCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElJbnB1dEJ5SWQgPSBfZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uIGdldE1JRElJbnB1dEJ5SWQoX2lkKSB7XG4gICAgICByZXR1cm4gaW5wdXRzQnlJZC5nZXQoX2lkKTtcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0TUlESUlucHV0QnlJZChpZCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLypcbmV4cG9ydCBmdW5jdGlvbiBpbml0TWlkaVNvbmcoc29uZyl7XG5cbiAgc29uZ01pZGlFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgLy9jb25zb2xlLmxvZyhlKVxuICAgIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBlLCB0aGlzKTtcbiAgfTtcblxuICAvLyBieSBkZWZhdWx0IGEgc29uZyBsaXN0ZW5zIHRvIGFsbCBhdmFpbGFibGUgbWlkaS1pbiBwb3J0c1xuICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcblxuICBvdXRwdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpSW5wdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IGlucHV0ID0gaW5wdXRzLmdldChpZCk7XG5cbiAgaWYoaW5wdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBpbnB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlJbnB1dHMuZGVsZXRlKGlkKTtcbiAgICBpbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1lbHNle1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQoaWQsIGlucHV0KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpSW5wdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlPdXRwdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IG91dHB1dCA9IG91dHB1dHMuZ2V0KGlkKTtcblxuICBpZihvdXRwdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBvdXRwdXQgd2l0aCBpZCcsIGlkLCAnZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihmbGFnID09PSBmYWxzZSl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5kZWxldGUoaWQpO1xuICAgIGxldCB0aW1lID0gc29uZy5zY2hlZHVsZXIubGFzdEV2ZW50VGltZSArIDEwMDtcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWUpOyAvLyBzdG9wIGFsbCBub3Rlc1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZSk7IC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICB9ZWxzZXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChpZCwgb3V0cHV0KTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlPdXRwdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIG1pZGlNZXNzYWdlRXZlbnQsIGlucHV0KXtcbiAgbGV0IG1pZGlFdmVudCA9IG5ldyBNaWRpRXZlbnQoc29uZy50aWNrcywgLi4ubWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5taWRpSW5wdXRzLCBpbnB1dCk7XG5cblxuICAgIC8vaWYobWlkaUV2ZW50LmNoYW5uZWwgPT09IHRyYWNrLmNoYW5uZWwgfHwgdHJhY2suY2hhbm5lbCA9PT0gMCB8fCB0cmFjay5jaGFubmVsID09PSAnYW55Jyl7XG4gICAgLy8gIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjayk7XG4gICAgLy99XG5cblxuICAgIC8vIGxpa2UgaW4gQ3ViYXNlLCBtaWRpIGV2ZW50cyBmcm9tIGFsbCBkZXZpY2VzLCBzZW50IG9uIGFueSBtaWRpIGNoYW5uZWwgYXJlIGZvcndhcmRlZCB0byBhbGwgdHJhY2tzXG4gICAgLy8gc2V0IHRyYWNrLm1vbml0b3IgdG8gZmFsc2UgaWYgeW91IGRvbid0IHdhbnQgdG8gcmVjZWl2ZSBtaWRpIGV2ZW50cyBvbiBhIGNlcnRhaW4gdHJhY2tcbiAgICAvLyBub3RlIHRoYXQgdHJhY2subW9uaXRvciBpcyBieSBkZWZhdWx0IHNldCB0byBmYWxzZSBhbmQgdGhhdCB0cmFjay5tb25pdG9yIGlzIGF1dG9tYXRpY2FsbHkgc2V0IHRvIHRydWVcbiAgICAvLyBpZiB5b3UgYXJlIHJlY29yZGluZyBvbiB0aGF0IHRyYWNrXG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5tb25pdG9yLCB0cmFjay5pZCwgaW5wdXQuaWQpO1xuICAgIGlmKHRyYWNrLm1vbml0b3IgPT09IHRydWUgJiYgdHJhY2subWlkaUlucHV0cy5nZXQoaW5wdXQuaWQpICE9PSB1bmRlZmluZWQpe1xuICAgICAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrLCBpbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgbGV0IGxpc3RlbmVycyA9IHNvbmcubWlkaUV2ZW50TGlzdGVuZXJzLmdldChtaWRpRXZlbnQudHlwZSk7XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBmb3IobGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycyl7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKHRyYWNrLCBtaWRpRXZlbnQsIGlucHV0KXtcbiAgbGV0IHNvbmcgPSB0cmFjay5zb25nLFxuICAgIG5vdGUsIGxpc3RlbmVycywgY2hhbm5lbDtcbiAgICAvL2RhdGEgPSBtaWRpTWVzc2FnZUV2ZW50LmRhdGEsXG4gICAgLy9taWRpRXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoc29uZy50aWNrcywgZGF0YVswXSwgZGF0YVsxXSwgZGF0YVsyXSk7XG5cbiAgLy9taWRpRXZlbnQuc291cmNlID0gbWlkaU1lc3NhZ2VFdmVudC5zcmNFbGVtZW50Lm5hbWU7XG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudClcbiAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCBtaWRpRXZlbnQudHlwZSk7XG5cbiAgLy8gYWRkIHRoZSBleGFjdCB0aW1lIG9mIHRoaXMgZXZlbnQgc28gd2UgY2FuIGNhbGN1bGF0ZSBpdHMgdGlja3MgcG9zaXRpb25cbiAgbWlkaUV2ZW50LnJlY29yZE1pbGxpcyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwOyAvLyBtaWxsaXNcbiAgbWlkaUV2ZW50LnN0YXRlID0gJ3JlY29yZGVkJztcblxuICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICBub3RlID0gY3JlYXRlTWlkaU5vdGUobWlkaUV2ZW50KTtcbiAgICB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdID0gbm90ZTtcbiAgICAvL3RyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF0gPSBub3RlO1xuICB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICBub3RlID0gdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvLyBjaGVjayBpZiB0aGUgbm90ZSBleGlzdHM6IGlmIHRoZSB1c2VyIHBsYXlzIG5vdGVzIG9uIGhlciBrZXlib2FyZCBiZWZvcmUgdGhlIG1pZGkgc3lzdGVtIGhhc1xuICAgIC8vIGJlZW4gZnVsbHkgaW5pdGlhbGl6ZWQsIGl0IGNhbiBoYXBwZW4gdGhhdCB0aGUgZmlyc3QgaW5jb21pbmcgbWlkaSBldmVudCBpcyBhIE5PVEUgT0ZGIGV2ZW50XG4gICAgaWYobm90ZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm90ZS5hZGROb3RlT2ZmKG1pZGlFdmVudCk7XG4gICAgZGVsZXRlIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy9kZWxldGUgdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXTtcbiAgfVxuXG4gIC8vY29uc29sZS5sb2coc29uZy5wcmVyb2xsLCBzb25nLnJlY29yZGluZywgdHJhY2sucmVjb3JkRW5hYmxlZCk7XG5cbiAgaWYoKHNvbmcucHJlcm9sbGluZyB8fCBzb25nLnJlY29yZGluZykgJiYgdHJhY2sucmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKXtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIHRyYWNrLnNvbmcucmVjb3JkZWROb3Rlcy5wdXNoKG5vdGUpO1xuICAgIH1cbiAgICB0cmFjay5yZWNvcmRQYXJ0LmFkZEV2ZW50KG1pZGlFdmVudCk7XG4gICAgLy8gc29uZy5yZWNvcmRlZEV2ZW50cyBpcyB1c2VkIGluIHRoZSBrZXkgZWRpdG9yXG4gICAgdHJhY2suc29uZy5yZWNvcmRlZEV2ZW50cy5wdXNoKG1pZGlFdmVudCk7XG4gIH1lbHNlIGlmKHRyYWNrLmVuYWJsZVJldHJvc3BlY3RpdmVSZWNvcmRpbmcpe1xuICAgIHRyYWNrLnJldHJvc3BlY3RpdmVSZWNvcmRpbmcucHVzaChtaWRpRXZlbnQpO1xuICB9XG5cbiAgLy8gY2FsbCBhbGwgbWlkaSBldmVudCBsaXN0ZW5lcnNcbiAgbGlzdGVuZXJzID0gdHJhY2subWlkaUV2ZW50TGlzdGVuZXJzW21pZGlFdmVudC50eXBlXTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIG9iamVjdEZvckVhY2gobGlzdGVuZXJzLCBmdW5jdGlvbihsaXN0ZW5lcil7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoYW5uZWwgPSB0cmFjay5jaGFubmVsO1xuICBpZihjaGFubmVsID09PSAnYW55JyB8fCBjaGFubmVsID09PSB1bmRlZmluZWQgfHwgaXNOYU4oY2hhbm5lbCkgPT09IHRydWUpe1xuICAgIGNoYW5uZWwgPSAwO1xuICB9XG5cbiAgb2JqZWN0Rm9yRWFjaCh0cmFjay5taWRpT3V0cHV0cywgZnVuY3Rpb24ob3V0cHV0KXtcbiAgICAvL2NvbnNvbGUubG9nKCdtaWRpIG91dCcsIG91dHB1dCwgbWlkaUV2ZW50LnR5cGUpO1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjggfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE0NCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyKTtcbiAgICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgICAvLyB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTkyKXtcbiAgICAvLyAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExXSk7XG4gICAgfVxuICAgIC8vb3V0cHV0LnNlbmQoW21pZGlFdmVudC5zdGF0dXMgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICB9KTtcblxuICAvLyBAVE9ETzogbWF5YmUgYSB0cmFjayBzaG91bGQgYmUgYWJsZSB0byBzZW5kIGl0cyBldmVudCB0byBib3RoIGEgbWlkaS1vdXQgcG9ydCBhbmQgYW4gaW50ZXJuYWwgaGVhcnRiZWF0IHNvbmc/XG4gIC8vY29uc29sZS5sb2codHJhY2sucm91dGVUb01pZGlPdXQpO1xuICBpZih0cmFjay5yb3V0ZVRvTWlkaU91dCA9PT0gZmFsc2Upe1xuICAgIG1pZGlFdmVudC50cmFjayA9IHRyYWNrO1xuICAgIHRyYWNrLmluc3RydW1lbnQucHJvY2Vzc0V2ZW50KG1pZGlFdmVudCk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBhZGRNaWRpRXZlbnRMaXN0ZW5lciguLi5hcmdzKXsgLy8gY2FsbGVyIGNhbiBiZSBhIHRyYWNrIG9yIGEgc29uZ1xuXG4gIGxldCBpZCA9IG1pZGlFdmVudExpc3RlbmVySWQrKztcbiAgbGV0IGxpc3RlbmVyO1xuICAgIHR5cGVzID0ge30sXG4gICAgaWRzID0gW10sXG4gICAgbG9vcDtcblxuXG4gIC8vIHNob3VsZCBJIGlubGluZSB0aGlzP1xuICBsb29wID0gZnVuY3Rpb24oYXJncyl7XG4gICAgZm9yKGxldCBhcmcgb2YgYXJncyl7XG4gICAgICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcoYXJnKTtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgICBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgbG9vcChhcmcpO1xuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgIGxpc3RlbmVyID0gYXJnO1xuICAgICAgfWVsc2UgaWYoaXNOYU4oYXJnKSA9PT0gZmFsc2Upe1xuICAgICAgICBhcmcgPSBwYXJzZUludChhcmcsIDEwKTtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgYXJnID0gc2VxdWVuY2VyLm1pZGlFdmVudE51bWJlckJ5TmFtZShhcmcpO1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgbG9vcChhcmdzLCAwLCBhcmdzLmxlbmd0aCk7XG4gIC8vY29uc29sZS5sb2coJ3R5cGVzJywgdHlwZXMsICdsaXN0ZW5lcicsIGxpc3RlbmVyKTtcblxuICBvYmplY3RGb3JFYWNoKHR5cGVzLCBmdW5jdGlvbih0eXBlKXtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgIGlmKG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID0ge307XG4gICAgfVxuICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdID0gbGlzdGVuZXI7XG4gICAgaWRzLnB1c2godHlwZSArICdfJyArIGlkKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhvYmoubWlkaUV2ZW50TGlzdGVuZXJzKTtcbiAgcmV0dXJuIGlkcy5sZW5ndGggPT09IDEgPyBpZHNbMF0gOiBpZHM7XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXIoaWQsIG9iail7XG4gIHZhciB0eXBlO1xuICBpZCA9IGlkLnNwbGl0KCdfJyk7XG4gIHR5cGUgPSBpZFswXTtcbiAgaWQgPSBpZFsxXTtcbiAgZGVsZXRlIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVycygpe1xuXG59XG5cbiovXG5leHBvcnRzLmdldE1JRElJbnB1dEJ5SWQgPSBfZ2V0TUlESUlucHV0QnlJZDsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLkluc3RydW1lbnQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG52YXIgX2V2ZW50bGlzdGVuZXIgPSByZXF1aXJlKCcuL2V2ZW50bGlzdGVuZXInKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIEluc3RydW1lbnQgPSBleHBvcnRzLkluc3RydW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEluc3RydW1lbnQoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEluc3RydW1lbnQpO1xuXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdO1xuICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlO1xuICAgIHRoaXMub3V0cHV0ID0gbnVsbDtcbiAgfVxuXG4gIC8vIG1hbmRhdG9yeVxuXG5cbiAgX2NyZWF0ZUNsYXNzKEluc3RydW1lbnQsIFt7XG4gICAga2V5OiAnY29ubmVjdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbm5lY3Qob3V0cHV0KSB7XG4gICAgICB0aGlzLm91dHB1dCA9IG91dHB1dDtcbiAgICB9XG5cbiAgICAvLyBtYW5kYXRvcnlcblxuICB9LCB7XG4gICAga2V5OiAnZGlzY29ubmVjdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc2Nvbm5lY3QoKSB7XG4gICAgICB0aGlzLm91dHB1dCA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gbWFuZGF0b3J5XG5cbiAgfSwge1xuICAgIGtleTogJ3Byb2Nlc3NNSURJRXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzTUlESUV2ZW50KGV2ZW50KSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgdGltZSA9IGV2ZW50LnRpbWUgLyAxMDAwO1xuICAgICAgdmFyIHNhbXBsZSA9IHZvaWQgMDtcblxuICAgICAgaWYgKGlzTmFOKHRpbWUpKSB7XG4gICAgICAgIC8vIHRoaXMgc2hvdWxkbid0IGhhcHBlblxuICAgICAgICBjb25zb2xlLmVycm9yKCdpbnZhbGlkIHRpbWUgdmFsdWUnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgICAvL3RpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lID09PSAwKSB7XG4gICAgICAgIC8vIHRoaXMgc2hvdWxkbid0IGhhcHBlbiAtPiBleHRlcm5hbCBNSURJIGtleWJvYXJkc1xuICAgICAgICBjb25zb2xlLmVycm9yKCdzaG91bGQgbm90IGhhcHBlbicpO1xuICAgICAgICB0aW1lID0gX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IDE0NCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKDE0NCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG5cbiAgICAgICAgc2FtcGxlID0gdGhpcy5jcmVhdGVTYW1wbGUoZXZlbnQpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIHNhbXBsZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlKVxuICAgICAgICBzYW1wbGUub3V0cHV0LmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuICAgICAgICBzYW1wbGUuc3RhcnQodGltZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxpbmcnLCBldmVudC5pZCwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgLy9jb25zb2xlLmxvZygnc3RhcnQnLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgfSBlbHNlIGlmIChldmVudC50eXBlID09PSAxMjgpIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKDEyOCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG4gICAgICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmdldChldmVudC5taWRpTm90ZUlkKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHNhbXBsZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKCdzYW1wbGUgbm90IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkLCAnIG1pZGlOb3RlJywgZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0aGF0IHRoZSBzdXN0YWluIHBlZGFsIHByZXZlbnRzIHRoZSBhbiBldmVudCB0byB1bnNjaGVkdWxlZFxuICAgICAgICAgIGlmICh0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlSWQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdzdG9wJywgdGltZSwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgICAgICAgc2FtcGxlLm91dHB1dC5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgIF90aGlzLnNjaGVkdWxlZFNhbXBsZXMuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlSWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09IDE3Nikge1xuICAgICAgICAgICAgLy8gc3VzdGFpbiBwZWRhbFxuICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGExID09PSA2NCkge1xuICAgICAgICAgICAgICBpZiAoZXZlbnQuZGF0YTIgPT09IDEyNykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgLy8vKlxuICAgICAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgICAgICAgIGRhdGE6ICdkb3duJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vKi9cbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIGRvd24nKVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGEyID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5mb3JFYWNoKGZ1bmN0aW9uIChtaWRpTm90ZUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNhbXBsZSA9IF90aGlzLnNjaGVkdWxlZFNhbXBsZXMuZ2V0KG1pZGlOb3RlSWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2FtcGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3AnLCBtaWRpTm90ZUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2FtcGxlLm91dHB1dC5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmRlbGV0ZShtaWRpTm90ZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIHVwJywgdGhpcy5zdXN0YWluZWRTYW1wbGVzKVxuICAgICAgICAgICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW107XG4gICAgICAgICAgICAgICAgICAvLy8qXG4gICAgICAgICAgICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogJ3VwJ1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAvLyovXG4gICAgICAgICAgICAgICAgICAvL3RoaXMuc3RvcFN1c3RhaW4odGltZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIHBhbm5pbmdcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuZGF0YTEgPT09IDEwKSB7XG4gICAgICAgICAgICAgICAgLy8gcGFubmluZyBpcyAqbm90KiBleGFjdGx5IHRpbWVkIC0+IG5vdCBwb3NzaWJsZSAoeWV0KSB3aXRoIFdlYkF1ZGlvXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhMiwgcmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcbiAgICAgICAgICAgICAgICAvL3RyYWNrLnNldFBhbm5pbmcocmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcblxuICAgICAgICAgICAgICAgIC8vIHZvbHVtZVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGExID09PSA3KSB7XG4gICAgICAgICAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gbWFuZGF0b3J5XG5cbiAgfSwge1xuICAgIGtleTogJ2FsbE5vdGVzT2ZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWxsTm90ZXNPZmYoKSB7XG4gICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXTtcbiAgICAgIGlmICh0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpIHtcbiAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICBkYXRhOiAndXAnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2U7XG5cbiAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5mb3JFYWNoKGZ1bmN0aW9uIChzYW1wbGUpIHtcbiAgICAgICAgc2FtcGxlLnN0b3AoX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHNhbXBsZS5vdXRwdXQuZGlzY29ubmVjdCgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICAvLyBtYW5kYXRvcnlcblxuICB9LCB7XG4gICAga2V5OiAndW5zY2hlZHVsZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVuc2NoZWR1bGUobWlkaUV2ZW50KSB7XG4gICAgICB2YXIgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmdldChtaWRpRXZlbnQubWlkaU5vdGVJZCk7XG4gICAgICBpZiAoc2FtcGxlKSB7XG4gICAgICAgIHNhbXBsZS5zdG9wKF9pbml0X2F1ZGlvLmNvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICBzYW1wbGUub3V0cHV0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmRlbGV0ZShtaWRpRXZlbnQubWlkaU5vdGVJZCk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEluc3RydW1lbnQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5NZXRyb25vbWUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfdHJhY2sgPSByZXF1aXJlKCcuL3RyYWNrJyk7XG5cbnZhciBfcGFydDMgPSByZXF1aXJlKCcuL3BhcnQnKTtcblxudmFyIF9wYXJzZV9ldmVudHMgPSByZXF1aXJlKCcuL3BhcnNlX2V2ZW50cycpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfcG9zaXRpb24gPSByZXF1aXJlKCcuL3Bvc2l0aW9uJyk7XG5cbnZhciBfc2FtcGxlciA9IHJlcXVpcmUoJy4vc2FtcGxlcicpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9jb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIG1ldGhvZE1hcCA9IG5ldyBNYXAoW1sndm9sdW1lJywgJ3NldFZvbHVtZSddLCBbJ2luc3RydW1lbnQnLCAnc2V0SW5zdHJ1bWVudCddLCBbJ25vdGVOdW1iZXJBY2NlbnRlZFRpY2snLCAnc2V0Tm90ZU51bWJlckFjY2VudGVkVGljayddLCBbJ25vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2snLCAnc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljayddLCBbJ3ZlbG9jaXR5QWNjZW50ZWRUaWNrJywgJ3NldFZlbG9jaXR5QWNjZW50ZWRUaWNrJ10sIFsndmVsb2NpdHlOb25BY2NlbnRlZFRpY2snLCAnc2V0VmVsb2NpdHlOb25BY2NlbnRlZFRpY2snXSwgWydub3RlTGVuZ3RoQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVMZW5ndGhBY2NlbnRlZFRpY2snXSwgWydub3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snXV0pO1xuXG52YXIgTWV0cm9ub21lID0gZXhwb3J0cy5NZXRyb25vbWUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1ldHJvbm9tZShzb25nKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1ldHJvbm9tZSk7XG5cbiAgICB0aGlzLnNvbmcgPSBzb25nO1xuICAgIHRoaXMudHJhY2sgPSBuZXcgX3RyYWNrLlRyYWNrKHsgbmFtZTogdGhpcy5zb25nLmlkICsgJ19tZXRyb25vbWUnIH0pO1xuICAgIHRoaXMucGFydCA9IG5ldyBfcGFydDMuUGFydCgpO1xuICAgIHRoaXMudHJhY2suYWRkUGFydHModGhpcy5wYXJ0KTtcbiAgICB0aGlzLnRyYWNrLl9nYWluTm9kZS5jb25uZWN0KHRoaXMuc29uZy5fZ2Fpbk5vZGUpO1xuXG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gW107XG4gICAgdGhpcy5wcmVjb3VudER1cmF0aW9uID0gMDtcbiAgICB0aGlzLmJhcnMgPSAwO1xuICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIHRoaXMuaW5kZXgyID0gMDtcbiAgICB0aGlzLnByZWNvdW50SW5kZXggPSAwO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhNZXRyb25vbWUsIFt7XG4gICAga2V5OiAncmVzZXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcblxuICAgICAgdmFyIGRhdGEgPSAoMCwgX2luaXRfYXVkaW8uZ2V0SW5pdERhdGEpKCk7XG4gICAgICB2YXIgaW5zdHJ1bWVudCA9IG5ldyBfc2FtcGxlci5TYW1wbGVyKCdtZXRyb25vbWUnKTtcbiAgICAgIGluc3RydW1lbnQudXBkYXRlU2FtcGxlRGF0YSh7XG4gICAgICAgIG5vdGU6IDYwLFxuICAgICAgICBidWZmZXI6IGRhdGEubG93dGlja1xuICAgICAgfSwge1xuICAgICAgICBub3RlOiA2MSxcbiAgICAgICAgYnVmZmVyOiBkYXRhLmhpZ2h0aWNrXG4gICAgICB9KTtcbiAgICAgIHRoaXMudHJhY2suc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KTtcblxuICAgICAgdGhpcy52b2x1bWUgPSAxO1xuXG4gICAgICB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA9IDYxO1xuICAgICAgdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWQgPSA2MDtcblxuICAgICAgdGhpcy52ZWxvY2l0eUFjY2VudGVkID0gMTAwO1xuICAgICAgdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkID0gMTAwO1xuXG4gICAgICB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA9IHRoaXMuc29uZy5wcHEgLyA0OyAvLyBzaXh0ZWVudGggbm90ZXMgLT4gZG9uJ3QgbWFrZSB0aGlzIHRvbyBzaG9ydCBpZiB5b3VyIHNhbXBsZSBoYXMgYSBsb25nIGF0dGFjayFcbiAgICAgIHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkID0gdGhpcy5zb25nLnBwcSAvIDQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY3JlYXRlRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIpIHtcbiAgICAgIHZhciBpZCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/ICdpbml0JyA6IGFyZ3VtZW50c1syXTtcblxuICAgICAgdmFyIGkgPSB2b2lkIDAsXG4gICAgICAgICAgaiA9IHZvaWQgMDtcbiAgICAgIHZhciBwb3NpdGlvbiA9IHZvaWQgMDtcbiAgICAgIHZhciB2ZWxvY2l0eSA9IHZvaWQgMDtcbiAgICAgIHZhciBub3RlTGVuZ3RoID0gdm9pZCAwO1xuICAgICAgdmFyIG5vdGVOdW1iZXIgPSB2b2lkIDA7XG4gICAgICB2YXIgYmVhdHNQZXJCYXIgPSB2b2lkIDA7XG4gICAgICB2YXIgdGlja3NQZXJCZWF0ID0gdm9pZCAwO1xuICAgICAgdmFyIHRpY2tzID0gMDtcbiAgICAgIHZhciBub3RlT24gPSB2b2lkIDAsXG4gICAgICAgICAgbm90ZU9mZiA9IHZvaWQgMDtcbiAgICAgIHZhciBldmVudHMgPSBbXTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhzdGFydEJhciwgZW5kQmFyKTtcblxuICAgICAgZm9yIChpID0gc3RhcnRCYXI7IGkgPD0gZW5kQmFyOyBpKyspIHtcbiAgICAgICAgcG9zaXRpb24gPSAoMCwgX3Bvc2l0aW9uLmNhbGN1bGF0ZVBvc2l0aW9uKSh0aGlzLnNvbmcsIHtcbiAgICAgICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgICAgICB0YXJnZXQ6IFtpXVxuICAgICAgICB9KTtcblxuICAgICAgICBiZWF0c1BlckJhciA9IHBvc2l0aW9uLm5vbWluYXRvcjtcbiAgICAgICAgdGlja3NQZXJCZWF0ID0gcG9zaXRpb24udGlja3NQZXJCZWF0O1xuICAgICAgICB0aWNrcyA9IHBvc2l0aW9uLnRpY2tzO1xuXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBiZWF0c1BlckJhcjsgaisrKSB7XG5cbiAgICAgICAgICBub3RlTnVtYmVyID0gaiA9PT0gMCA/IHRoaXMubm90ZU51bWJlckFjY2VudGVkIDogdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWQ7XG4gICAgICAgICAgbm90ZUxlbmd0aCA9IGogPT09IDAgPyB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA6IHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkO1xuICAgICAgICAgIHZlbG9jaXR5ID0gaiA9PT0gMCA/IHRoaXMudmVsb2NpdHlBY2NlbnRlZCA6IHRoaXMudmVsb2NpdHlOb25BY2NlbnRlZDtcblxuICAgICAgICAgIG5vdGVPbiA9IG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MsIDE0NCwgbm90ZU51bWJlciwgdmVsb2NpdHkpO1xuICAgICAgICAgIG5vdGVPZmYgPSBuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KHRpY2tzICsgbm90ZUxlbmd0aCwgMTI4LCBub3RlTnVtYmVyLCAwKTtcblxuICAgICAgICAgIGlmIChpZCA9PT0gJ3ByZWNvdW50Jykge1xuICAgICAgICAgICAgbm90ZU9uLl90cmFjayA9IHRoaXMudHJhY2s7XG4gICAgICAgICAgICBub3RlT2ZmLl90cmFjayA9IHRoaXMudHJhY2s7XG4gICAgICAgICAgICBub3RlT24uX3BhcnQgPSB7fTtcbiAgICAgICAgICAgIG5vdGVPZmYuX3BhcnQgPSB7fTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBldmVudHMucHVzaChub3RlT24sIG5vdGVPZmYpO1xuICAgICAgICAgIHRpY2tzICs9IHRpY2tzUGVyQmVhdDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZXZlbnRzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50cygpIHtcbiAgICAgIHZhciBzdGFydEJhciA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgIHZhciBfcGFydDtcblxuICAgICAgdmFyIGVuZEJhciA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHRoaXMuc29uZy5iYXJzIDogYXJndW1lbnRzWzFdO1xuICAgICAgdmFyIGlkID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gJ2luaXQnIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICB0aGlzLnBhcnQucmVtb3ZlRXZlbnRzKHRoaXMucGFydC5nZXRFdmVudHMoKSk7XG4gICAgICB0aGlzLmV2ZW50cyA9IHRoaXMuY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIGlkKTtcbiAgICAgIChfcGFydCA9IHRoaXMucGFydCkuYWRkRXZlbnRzLmFwcGx5KF9wYXJ0LCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5ldmVudHMpKTtcbiAgICAgIHRoaXMuYmFycyA9IHRoaXMuc29uZy5iYXJzO1xuICAgICAgLy9jb25zb2xlLmxvZygnZ2V0RXZlbnRzICVPJywgdGhpcy5ldmVudHMpXG4gICAgICB0aGlzLmFsbEV2ZW50cyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5ldmVudHMpLCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5zb25nLl90aW1lRXZlbnRzKSk7XG4gICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmFsbEV2ZW50cylcbiAgICAgICgwLCBfdXRpbC5zb3J0RXZlbnRzKSh0aGlzLmFsbEV2ZW50cyk7XG4gICAgICAoMCwgX3BhcnNlX2V2ZW50cy5wYXJzZU1JRElOb3RlcykodGhpcy5ldmVudHMpO1xuICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEluZGV4MicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEluZGV4MihtaWxsaXMpIHtcbiAgICAgIHRoaXMuaW5kZXgyID0gMDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFdmVudHMyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RXZlbnRzMihtYXh0aW1lLCB0aW1lU3RhbXApIHtcbiAgICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMuaW5kZXgyLCBtYXhpID0gdGhpcy5hbGxFdmVudHMubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKSB7XG5cbiAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5hbGxFdmVudHNbaV07XG5cbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IF9jb25zdGFudHMuTUlESUV2ZW50VHlwZXMuVEVNUE8gfHwgZXZlbnQudHlwZSA9PT0gX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSkge1xuICAgICAgICAgIGlmIChldmVudC5taWxsaXMgPCBtYXh0aW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICAgICAgICAgICAgdGhpcy5pbmRleDIrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGljaztcbiAgICAgICAgICBpZiAobWlsbGlzIDwgbWF4dGltZSkge1xuICAgICAgICAgICAgZXZlbnQudGltZSA9IG1pbGxpcyArIHRpbWVTdGFtcDtcbiAgICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpcztcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXgyKys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhZGRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudHMoKSB7XG4gICAgICB2YXIgc3RhcnRCYXIgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICB2YXIgX2V2ZW50cywgX3BhcnQyO1xuXG4gICAgICB2YXIgZW5kQmFyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gdGhpcy5zb25nLmJhcnMgOiBhcmd1bWVudHNbMV07XG4gICAgICB2YXIgaWQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAnYWRkJyA6IGFyZ3VtZW50c1syXTtcblxuICAgICAgLy8gY29uc29sZS5sb2coc3RhcnRCYXIsIGVuZEJhcilcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZCk7XG4gICAgICAoX2V2ZW50cyA9IHRoaXMuZXZlbnRzKS5wdXNoLmFwcGx5KF9ldmVudHMsIF90b0NvbnN1bWFibGVBcnJheShldmVudHMpKTtcbiAgICAgIChfcGFydDIgPSB0aGlzLnBhcnQpLmFkZEV2ZW50cy5hcHBseShfcGFydDIsIF90b0NvbnN1bWFibGVBcnJheShldmVudHMpKTtcbiAgICAgIHRoaXMuYmFycyA9IGVuZEJhcjtcbiAgICAgIC8vY29uc29sZS5sb2coJ2dldEV2ZW50cyAlTycsIHRoaXMuZXZlbnRzLCBlbmRCYXIpXG4gICAgICByZXR1cm4gZXZlbnRzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NyZWF0ZVByZWNvdW50RXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlUHJlY291bnRFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgdGltZVN0YW1wKSB7XG5cbiAgICAgIHRoaXMudGltZVN0YW1wID0gdGltZVN0YW1wO1xuXG4gICAgICAvLyAgIGxldCBzb25nU3RhcnRQb3NpdGlvbiA9IHRoaXMuc29uZy5nZXRQb3NpdGlvbigpXG5cbiAgICAgIHZhciBzb25nU3RhcnRQb3NpdGlvbiA9ICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMuc29uZywge1xuICAgICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgICAgdGFyZ2V0OiBbc3RhcnRCYXJdLFxuICAgICAgICByZXN1bHQ6ICdtaWxsaXMnXG4gICAgICB9KTtcbiAgICAgIC8vY29uc29sZS5sb2coJ3N0YXJCYXInLCBzb25nU3RhcnRQb3NpdGlvbi5iYXIpXG5cbiAgICAgIHZhciBlbmRQb3MgPSAoMCwgX3Bvc2l0aW9uLmNhbGN1bGF0ZVBvc2l0aW9uKSh0aGlzLnNvbmcsIHtcbiAgICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAgIC8vdGFyZ2V0OiBbc29uZ1N0YXJ0UG9zaXRpb24uYmFyICsgcHJlY291bnQsIHNvbmdTdGFydFBvc2l0aW9uLmJlYXQsIHNvbmdTdGFydFBvc2l0aW9uLnNpeHRlZW50aCwgc29uZ1N0YXJ0UG9zaXRpb24udGlja10sXG4gICAgICAgIHRhcmdldDogW2VuZEJhcl0sXG4gICAgICAgIHJlc3VsdDogJ21pbGxpcydcbiAgICAgIH0pO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKHNvbmdTdGFydFBvc2l0aW9uLCBlbmRQb3MpXG5cbiAgICAgIHRoaXMucHJlY291bnRJbmRleCA9IDA7XG4gICAgICB0aGlzLnN0YXJ0TWlsbGlzID0gc29uZ1N0YXJ0UG9zaXRpb24ubWlsbGlzO1xuICAgICAgdGhpcy5lbmRNaWxsaXMgPSBlbmRQb3MubWlsbGlzO1xuICAgICAgdGhpcy5wcmVjb3VudER1cmF0aW9uID0gZW5kUG9zLm1pbGxpcyAtIHRoaXMuc3RhcnRNaWxsaXM7XG5cbiAgICAgIC8vIGRvIHRoaXMgc28geW91IGNhbiBzdGFydCBwcmVjb3VudGluZyBhdCBhbnkgcG9zaXRpb24gaW4gdGhlIHNvbmdcbiAgICAgIHRoaXMudGltZVN0YW1wIC09IHRoaXMuc3RhcnRNaWxsaXM7XG5cbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5wcmVjb3VudER1cmF0aW9uLCB0aGlzLnN0YXJ0TWlsbGlzLCB0aGlzLmVuZE1pbGxpcylcblxuICAgICAgdGhpcy5wcmVjb3VudEV2ZW50cyA9IHRoaXMuY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIgLSAxLCAncHJlY291bnQnKTtcbiAgICAgIHRoaXMucHJlY291bnRFdmVudHMgPSAoMCwgX3BhcnNlX2V2ZW50cy5wYXJzZUV2ZW50cykoW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnNvbmcuX3RpbWVFdmVudHMpLCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5wcmVjb3VudEV2ZW50cykpKTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhzb25nU3RhcnRQb3NpdGlvbi5iYXIsIGVuZFBvcy5iYXIsIHByZWNvdW50LCB0aGlzLnByZWNvdW50RXZlbnRzLmxlbmd0aCk7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMucHJlY291bnRFdmVudHMubGVuZ3RoLCB0aGlzLnByZWNvdW50RHVyYXRpb24pO1xuICAgICAgcmV0dXJuIHRoaXMucHJlY291bnREdXJhdGlvbjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRQcmVjb3VudEluZGV4JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UHJlY291bnRJbmRleChtaWxsaXMpIHtcbiAgICAgIHZhciBpID0gMDtcbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0aGlzLmV2ZW50c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgZXZlbnQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgIGlmIChldmVudC5taWxsaXMgPj0gbWlsbGlzKSB7XG4gICAgICAgICAgICB0aGlzLnByZWNvdW50SW5kZXggPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKHRoaXMucHJlY291bnRJbmRleCk7XG4gICAgfVxuXG4gICAgLy8gY2FsbGVkIGJ5IHNjaGVkdWxlci5qc1xuXG4gIH0sIHtcbiAgICBrZXk6ICdnZXRQcmVjb3VudEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFByZWNvdW50RXZlbnRzKG1heHRpbWUpIHtcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLnByZWNvdW50RXZlbnRzLFxuICAgICAgICAgIG1heGkgPSBldmVudHMubGVuZ3RoLFxuICAgICAgICAgIGkgPSB2b2lkIDAsXG4gICAgICAgICAgZXZ0ID0gdm9pZCAwLFxuICAgICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgICAvL21heHRpbWUgKz0gdGhpcy5wcmVjb3VudER1cmF0aW9uXG5cbiAgICAgIGZvciAoaSA9IHRoaXMucHJlY291bnRJbmRleDsgaSA8IG1heGk7IGkrKykge1xuICAgICAgICBldnQgPSBldmVudHNbaV07XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCBtYXh0aW1lLCB0aGlzLm1pbGxpcyk7XG4gICAgICAgIGlmIChldnQubWlsbGlzIDwgbWF4dGltZSkge1xuICAgICAgICAgIGV2dC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldnQubWlsbGlzO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGV2dCk7XG4gICAgICAgICAgdGhpcy5wcmVjb3VudEluZGV4Kys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2cocmVzdWx0Lmxlbmd0aCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ211dGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtdXRlKGZsYWcpIHtcbiAgICAgIHRoaXMudHJhY2subXV0ZWQgPSBmbGFnO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FsbE5vdGVzT2ZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWxsTm90ZXNPZmYoKSB7XG4gICAgICB0aGlzLnRyYWNrLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKCk7XG4gICAgfVxuXG4gICAgLy8gPT09PT09PT09PT0gQ09ORklHVVJBVElPTiA9PT09PT09PT09PVxuXG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGVDb25maWcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVDb25maWcoKSB7XG4gICAgICB0aGlzLmluaXQoMSwgdGhpcy5iYXJzLCAndXBkYXRlJyk7XG4gICAgICB0aGlzLmFsbE5vdGVzT2ZmKCk7XG4gICAgICB0aGlzLnNvbmcudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgLy8gYWRkZWQgdG8gcHVibGljIEFQSTogU29uZy5jb25maWd1cmVNZXRyb25vbWUoe30pXG5cbiAgfSwge1xuICAgIGtleTogJ2NvbmZpZ3VyZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbmZpZ3VyZShjb25maWcpIHtcblxuICAgICAgT2JqZWN0LmtleXMoY29uZmlnKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdGhpc1ttZXRob2RNYXAuZ2V0KGtleSldKGNvbmZpZy5rZXkpO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0SW5zdHJ1bWVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEluc3RydW1lbnQoaW5zdHJ1bWVudCkge1xuICAgICAgaWYgKCFpbnN0cnVtZW50IGluc3RhbmNlb2YgSW5zdHJ1bWVudCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ25vdCBhbiBpbnN0YW5jZSBvZiBJbnN0cnVtZW50Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMudHJhY2suc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KTtcbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0Tm90ZUxlbmd0aEFjY2VudGVkVGljaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldE5vdGVMZW5ndGhBY2NlbnRlZFRpY2sodmFsdWUpIHtcbiAgICAgIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgdGhpcy5ub3RlTGVuZ3RoQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldE5vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2sodmFsdWUpIHtcbiAgICAgIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0VmVsb2NpdHlBY2NlbnRlZFRpY2snLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRWZWxvY2l0eUFjY2VudGVkVGljayh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSAoMCwgX3V0aWwuY2hlY2tNSURJTnVtYmVyKSh2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgIT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMudmVsb2NpdHlBY2NlbnRlZCA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9ICgwLCBfdXRpbC5jaGVja01JRElOdW1iZXIpKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2snLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXROb3RlTnVtYmVyQWNjZW50ZWRUaWNrKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9ICgwLCBfdXRpbC5jaGVja01JRElOdW1iZXIpKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldE5vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2sodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gKDAsIF91dGlsLmNoZWNrTUlESU51bWJlcikodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSBmYWxzZSkge1xuICAgICAgICB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRWb2x1bWUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRWb2x1bWUodmFsdWUpIHtcbiAgICAgIHRoaXMudHJhY2suc2V0Vm9sdW1lKHZhbHVlKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTWV0cm9ub21lO1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuTUlESUV2ZW50ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvLyBAIGZsb3dcblxuXG52YXIgX25vdGUgPSByZXF1aXJlKCcuL25vdGUnKTtcblxudmFyIF9zZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIGluc3RhbmNlSW5kZXggPSAwO1xuXG52YXIgTUlESUV2ZW50ID0gZXhwb3J0cy5NSURJRXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1JRElFdmVudCh0aWNrcywgdHlwZSwgZGF0YTEpIHtcbiAgICB2YXIgZGF0YTIgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyAtMSA6IGFyZ3VtZW50c1szXTtcbiAgICB2YXIgY2hhbm5lbCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNCB8fCBhcmd1bWVudHNbNF0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbNF07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESUV2ZW50KTtcblxuICAgIHRoaXMuaWQgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLnRpY2tzID0gdGlja3M7XG4gICAgdGhpcy5kYXRhMSA9IGRhdGExO1xuICAgIHRoaXMuZGF0YTIgPSBkYXRhMjtcbiAgICB0aGlzLnBpdGNoID0gKDAsIF9zZXR0aW5ncy5nZXRTZXR0aW5ncykoKS5waXRjaDtcblxuICAgIC8qIHRlc3Qgd2hldGhlciB0eXBlIGlzIGEgc3RhdHVzIGJ5dGUgb3IgYSBjb21tYW5kOiAqL1xuXG4gICAgLy8gMS4gdGhlIGhpZ2hlciA0IGJpdHMgb2YgdGhlIHN0YXR1cyBieXRlIGZvcm0gdGhlIGNvbW1hbmRcbiAgICB0aGlzLnR5cGUgPSAodHlwZSA+PiA0KSAqIDE2O1xuICAgIC8vdGhpcy50eXBlID0gdGhpcy5jb21tYW5kID0gKHR5cGUgPj4gNCkgKiAxNlxuXG4gICAgLy8gMi4gZmlsdGVyIGNoYW5uZWwgZXZlbnRzXG4gICAgaWYgKHRoaXMudHlwZSA+PSAweDgwICYmIHRoaXMudHlwZSA8PSAweEUwKSB7XG4gICAgICAvLyAzLiBnZXQgdGhlIGNoYW5uZWwgbnVtYmVyXG4gICAgICBpZiAoY2hhbm5lbCA+IDApIHtcbiAgICAgICAgLy8gYSBjaGFubmVsIGlzIHNldCwgdGhpcyBvdmVycnVsZXMgdGhlIGNoYW5uZWwgbnVtYmVyIGluIHRoZSBzdGF0dXMgYnl0ZVxuICAgICAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZXh0cmFjdCB0aGUgY2hhbm5lbCBmcm9tIHRoZSBzdGF0dXMgYnl0ZTogdGhlIGxvd2VyIDQgYml0cyBvZiB0aGUgc3RhdHVzIGJ5dGUgZm9ybSB0aGUgY2hhbm5lbCBudW1iZXJcbiAgICAgICAgdGhpcy5jaGFubmVsID0gdHlwZSAmIDB4RjtcbiAgICAgIH1cbiAgICAgIC8vdGhpcy5zdGF0dXMgPSB0aGlzLmNvbW1hbmQgKyB0aGlzLmNoYW5uZWxcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyA0LiBub3QgYSBjaGFubmVsIGV2ZW50LCBzZXQgdGhlIHR5cGUgYW5kIGNvbW1hbmQgdG8gdGhlIHZhbHVlIG9mIHR5cGUgYXMgcHJvdmlkZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIC8vdGhpcy50eXBlID0gdGhpcy5jb21tYW5kID0gdHlwZVxuICAgICAgICB0aGlzLmNoYW5uZWwgPSAwOyAvLyBhbnlcbiAgICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsIHRoaXMudHlwZSwgdGhpcy5jb21tYW5kLCB0aGlzLnN0YXR1cywgdGhpcy5jaGFubmVsLCB0aGlzLmlkKVxuXG4gICAgLy8gc29tZXRpbWVzIE5PVEVfT0ZGIGV2ZW50cyBhcmUgc2VudCBhcyBOT1RFX09OIGV2ZW50cyB3aXRoIGEgMCB2ZWxvY2l0eSB2YWx1ZVxuICAgIGlmICh0eXBlID09PSAxNDQgJiYgZGF0YTIgPT09IDApIHtcbiAgICAgIHRoaXMudHlwZSA9IDEyODtcbiAgICB9XG5cbiAgICB0aGlzLl9wYXJ0ID0gbnVsbDtcbiAgICB0aGlzLl90cmFjayA9IG51bGw7XG4gICAgdGhpcy5fc29uZyA9IG51bGw7XG5cbiAgICBpZiAodHlwZSA9PT0gMTQ0IHx8IHR5cGUgPT09IDEyOCkge1xuICAgICAgdmFyIF9nZXROb3RlRGF0YSA9ICgwLCBfbm90ZS5nZXROb3RlRGF0YSkoeyBudW1iZXI6IGRhdGExIH0pO1xuXG4gICAgICB0aGlzLm5vdGVOYW1lID0gX2dldE5vdGVEYXRhLm5hbWU7XG4gICAgICB0aGlzLmZ1bGxOb3RlTmFtZSA9IF9nZXROb3RlRGF0YS5mdWxsTmFtZTtcbiAgICAgIHRoaXMuZnJlcXVlbmN5ID0gX2dldE5vdGVEYXRhLmZyZXF1ZW5jeTtcbiAgICAgIHRoaXMub2N0YXZlID0gX2dldE5vdGVEYXRhLm9jdGF2ZTtcbiAgICB9XG4gICAgLy9AVE9ETzogYWRkIGFsbCBvdGhlciBwcm9wZXJ0aWVzXG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTUlESUV2ZW50LCBbe1xuICAgIGtleTogJ2NvcHknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb3B5KCkge1xuICAgICAgdmFyIG0gPSBuZXcgTUlESUV2ZW50KHRoaXMudGlja3MsIHRoaXMudHlwZSwgdGhpcy5kYXRhMSwgdGhpcy5kYXRhMik7XG4gICAgICByZXR1cm4gbTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0cmFuc3Bvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0cmFuc3Bvc2UoYW1vdW50KSB7XG4gICAgICAvLyBtYXkgYmUgYmV0dGVyIGlmIG5vdCBhIHB1YmxpYyBtZXRob2Q/XG4gICAgICB0aGlzLmRhdGExICs9IGFtb3VudDtcbiAgICAgIHRoaXMuZnJlcXVlbmN5ID0gdGhpcy5waXRjaCAqIE1hdGgucG93KDIsICh0aGlzLmRhdGExIC0gNjkpIC8gMTIpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZVBpdGNoJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlUGl0Y2gobmV3UGl0Y2gpIHtcbiAgICAgIGlmIChuZXdQaXRjaCA9PT0gdGhpcy5waXRjaCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnBpdGNoID0gbmV3UGl0Y2g7XG4gICAgICB0aGlzLnRyYW5zcG9zZSgwKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZSh0aWNrcykge1xuICAgICAgdGhpcy50aWNrcyArPSB0aWNrcztcbiAgICAgIGlmICh0aGlzLm1pZGlOb3RlKSB7XG4gICAgICAgIHRoaXMubWlkaU5vdGUudXBkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZVRvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZVRvKHRpY2tzKSB7XG4gICAgICB0aGlzLnRpY2tzID0gdGlja3M7XG4gICAgICBpZiAodGhpcy5taWRpTm90ZSkge1xuICAgICAgICB0aGlzLm1pZGlOb3RlLnVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNSURJRXZlbnQ7XG59KCk7XG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlTUlESUV2ZW50KGV2ZW50KXtcbiAgLy9ldmVudC5ub3RlID0gbnVsbFxuICBldmVudC5ub3RlID0gbnVsbFxuICBldmVudCA9IG51bGxcbn1cbiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5NSURJTm90ZSA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9taWRpX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpX2V2ZW50Jyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBpbnN0YW5jZUluZGV4ID0gMDtcblxudmFyIE1JRElOb3RlID0gZXhwb3J0cy5NSURJTm90ZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTUlESU5vdGUobm90ZW9uLCBub3Rlb2ZmKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1JRElOb3RlKTtcblxuICAgIC8vaWYobm90ZW9uLnR5cGUgIT09IDE0NCB8fCBub3Rlb2ZmLnR5cGUgIT09IDEyOCl7XG4gICAgaWYgKG5vdGVvbi50eXBlICE9PSAxNDQpIHtcbiAgICAgIGNvbnNvbGUud2FybignY2Fubm90IGNyZWF0ZSBNSURJTm90ZScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmlkID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgJ18nICsgaW5zdGFuY2VJbmRleCsrICsgJ18nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdGhpcy5ub3RlT24gPSBub3Rlb247XG4gICAgbm90ZW9uLm1pZGlOb3RlID0gdGhpcztcbiAgICBub3Rlb24ubWlkaU5vdGVJZCA9IHRoaXMuaWQ7XG5cbiAgICBpZiAobm90ZW9mZiBpbnN0YW5jZW9mIF9taWRpX2V2ZW50Lk1JRElFdmVudCkge1xuICAgICAgdGhpcy5ub3RlT2ZmID0gbm90ZW9mZjtcbiAgICAgIG5vdGVvZmYubWlkaU5vdGUgPSB0aGlzO1xuICAgICAgbm90ZW9mZi5taWRpTm90ZUlkID0gdGhpcy5pZDtcbiAgICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IG5vdGVvZmYudGlja3MgLSBub3Rlb24udGlja3M7XG4gICAgICB0aGlzLmR1cmF0aW9uTWlsbGlzID0gLTE7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElOb3RlLCBbe1xuICAgIGtleTogJ2FkZE5vdGVPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGROb3RlT2ZmKG5vdGVvZmYpIHtcbiAgICAgIHRoaXMubm90ZU9mZiA9IG5vdGVvZmY7XG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlID0gdGhpcztcbiAgICAgIG5vdGVvZmYubWlkaU5vdGVJZCA9IHRoaXMuaWQ7XG4gICAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSBub3Rlb2ZmLnRpY2tzIC0gdGhpcy5ub3RlT24udGlja3M7XG4gICAgICB0aGlzLmR1cmF0aW9uTWlsbGlzID0gLTE7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY29weScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvcHkoKSB7XG4gICAgICByZXR1cm4gbmV3IE1JRElOb3RlKHRoaXMubm90ZU9uLmNvcHkoKSwgdGhpcy5ub3RlT2ZmLmNvcHkoKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgLy8gbWF5IHVzZSBhbm90aGVyIG5hbWUgZm9yIHRoaXMgbWV0aG9kXG4gICAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSB0aGlzLm5vdGVPZmYudGlja3MgLSB0aGlzLm5vdGVPbi50aWNrcztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0cmFuc3Bvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0cmFuc3Bvc2UoYW1vdW50KSB7XG4gICAgICB0aGlzLm5vdGVPbi50cmFuc3Bvc2UoYW1vdW50KTtcbiAgICAgIHRoaXMubm90ZU9mZi50cmFuc3Bvc2UoYW1vdW50KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZSh0aWNrcykge1xuICAgICAgdGhpcy5ub3RlT24ubW92ZSh0aWNrcyk7XG4gICAgICB0aGlzLm5vdGVPZmYubW92ZSh0aWNrcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZVRvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZVRvKHRpY2tzKSB7XG4gICAgICB0aGlzLm5vdGVPbi5tb3ZlVG8odGlja3MpO1xuICAgICAgdGhpcy5ub3RlT2ZmLm1vdmVUbyh0aWNrcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndW5yZWdpc3RlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVucmVnaXN0ZXIoKSB7XG4gICAgICBpZiAodGhpcy5wYXJ0KSB7XG4gICAgICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcyk7XG4gICAgICAgIHRoaXMucGFydCA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy50cmFjaykge1xuICAgICAgICB0aGlzLnRyYWNrLnJlbW92ZUV2ZW50cyh0aGlzKTtcbiAgICAgICAgdGhpcy50cmFjayA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zb25nKSB7XG4gICAgICAgIHRoaXMuc29uZy5yZW1vdmVFdmVudHModGhpcyk7XG4gICAgICAgIHRoaXMuc29uZyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElOb3RlO1xufSgpOyIsIi8qXG4gIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBieXRlcyB0aHJvdWdoIHNlcXVlbnRpYWwgcmVhZHNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiAgYWRhcHRlZCB0byB3b3JrIHdpdGggQXJyYXlCdWZmZXIgLT4gVWludDhBcnJheVxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgZmNjID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxudmFyIE1JRElTdHJlYW0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgLy8gYnVmZmVyIGlzIFVpbnQ4QXJyYXlcblxuICBmdW5jdGlvbiBNSURJU3RyZWFtKGJ1ZmZlcikge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJU3RyZWFtKTtcblxuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgLyogcmVhZCBzdHJpbmcgb3IgYW55IG51bWJlciBvZiBieXRlcyAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElTdHJlYW0sIFt7XG4gICAga2V5OiAncmVhZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWQobGVuZ3RoKSB7XG4gICAgICB2YXIgdG9TdHJpbmcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICB2YXIgcmVzdWx0ID0gdm9pZCAwO1xuXG4gICAgICBpZiAodG9TdHJpbmcpIHtcbiAgICAgICAgcmVzdWx0ID0gJyc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKykge1xuICAgICAgICAgIHJlc3VsdCArPSBmY2ModGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxlbmd0aDsgX2krKywgdGhpcy5wb3NpdGlvbisrKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMzItYml0IGludGVnZXIgKi9cblxuICB9LCB7XG4gICAga2V5OiAncmVhZEludDMyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVhZEludDMyKCkge1xuICAgICAgdmFyIHJlc3VsdCA9ICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCAyNCkgKyAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdIDw8IDE2KSArICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMl0gPDwgOCkgKyB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgM107XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDQ7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qIHJlYWQgYSBiaWctZW5kaWFuIDE2LWJpdCBpbnRlZ2VyICovXG5cbiAgfSwge1xuICAgIGtleTogJ3JlYWRJbnQxNicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRJbnQxNigpIHtcbiAgICAgIHZhciByZXN1bHQgPSAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgOCkgKyB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV07XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qIHJlYWQgYW4gOC1iaXQgaW50ZWdlciAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdyZWFkSW50OCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRJbnQ4KHNpZ25lZCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dO1xuICAgICAgaWYgKHNpZ25lZCAmJiByZXN1bHQgPiAxMjcpIHtcbiAgICAgICAgcmVzdWx0IC09IDI1NjtcbiAgICAgIH1cbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZW9mJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZW9mKCkge1xuICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPj0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qIHJlYWQgYSBNSURJLXN0eWxlIGxldGlhYmxlLWxlbmd0aCBpbnRlZ2VyXG4gICAgICAoYmlnLWVuZGlhbiB2YWx1ZSBpbiBncm91cHMgb2YgNyBiaXRzLFxuICAgICAgd2l0aCB0b3AgYml0IHNldCB0byBzaWduaWZ5IHRoYXQgYW5vdGhlciBieXRlIGZvbGxvd3MpXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAncmVhZFZhckludCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRWYXJJbnQoKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gMDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5yZWFkSW50OCgpO1xuICAgICAgICBpZiAoYiAmIDB4ODApIHtcbiAgICAgICAgICByZXN1bHQgKz0gYiAmIDB4N2Y7XG4gICAgICAgICAgcmVzdWx0IDw8PSA3O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8qIGIgaXMgdGhlIGxhc3QgYnl0ZSAqL1xuICAgICAgICAgIHJldHVybiByZXN1bHQgKyBiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVzZXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFBvc2l0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UG9zaXRpb24ocCkge1xuICAgICAgdGhpcy5wb3NpdGlvbiA9IHA7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElTdHJlYW07XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IE1JRElTdHJlYW07IiwiLypcbiAgRXh0cmFjdHMgYWxsIG1pZGkgZXZlbnRzIGZyb20gYSBiaW5hcnkgbWlkaSBmaWxlLCB1c2VzIG1pZGlfc3RyZWFtLmpzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnBhcnNlTUlESUZpbGUgPSBwYXJzZU1JRElGaWxlO1xuXG52YXIgX21pZGlfc3RyZWFtID0gcmVxdWlyZSgnLi9taWRpX3N0cmVhbScpO1xuXG52YXIgX21pZGlfc3RyZWFtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21pZGlfc3RyZWFtKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGxhc3RFdmVudFR5cGVCeXRlID0gdm9pZCAwLFxuICAgIHRyYWNrTmFtZSA9IHZvaWQgMDtcblxuZnVuY3Rpb24gcmVhZENodW5rKHN0cmVhbSkge1xuICB2YXIgaWQgPSBzdHJlYW0ucmVhZCg0LCB0cnVlKTtcbiAgdmFyIGxlbmd0aCA9IHN0cmVhbS5yZWFkSW50MzIoKTtcbiAgLy9jb25zb2xlLmxvZyhsZW5ndGgpO1xuICByZXR1cm4ge1xuICAgICdpZCc6IGlkLFxuICAgICdsZW5ndGgnOiBsZW5ndGgsXG4gICAgJ2RhdGEnOiBzdHJlYW0ucmVhZChsZW5ndGgsIGZhbHNlKVxuICB9O1xufVxuXG5mdW5jdGlvbiByZWFkRXZlbnQoc3RyZWFtKSB7XG4gIHZhciBldmVudCA9IHt9O1xuICB2YXIgbGVuZ3RoO1xuICBldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICB2YXIgZXZlbnRUeXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50VHlwZUJ5dGUsIGV2ZW50VHlwZUJ5dGUgJiAweDgwLCAxNDYgJiAweDBmKTtcbiAgaWYgKChldmVudFR5cGVCeXRlICYgMHhmMCkgPT0gMHhmMCkge1xuICAgIC8qIHN5c3RlbSAvIG1ldGEgZXZlbnQgKi9cbiAgICBpZiAoZXZlbnRUeXBlQnl0ZSA9PSAweGZmKSB7XG4gICAgICAvKiBtZXRhIGV2ZW50ICovXG4gICAgICBldmVudC50eXBlID0gJ21ldGEnO1xuICAgICAgdmFyIHN1YnR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgc3dpdGNoIChzdWJ0eXBlQnl0ZSkge1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG4gICAgICAgICAgaWYgKGxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2VxdWVuY2VOdW1iZXIgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWJlciA9IHN0cmVhbS5yZWFkSW50MTYoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RleHQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAyOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29weXJpZ2h0Tm90aWNlJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RyYWNrTmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2luc3RydW1lbnROYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2x5cmljcyc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtYXJrZXInO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA3OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY3VlUG9pbnQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDIwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWlkaUNoYW5uZWxQcmVmaXgnO1xuICAgICAgICAgIGlmIChsZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIG1pZGlDaGFubmVsUHJlZml4IGV2ZW50IGlzIDEsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jaGFubmVsID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MmY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdlbmRPZlRyYWNrJztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NldFRlbXBvJztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSAzKSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXRUZW1wbyBldmVudCBpcyAzLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdCA9IChzdHJlYW0ucmVhZEludDgoKSA8PCAxNikgKyAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgOCkgKyBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1NDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NtcHRlT2Zmc2V0JztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSA1KSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzbXB0ZU9mZnNldCBldmVudCBpcyA1LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGhvdXJCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWVSYXRlID0ge1xuICAgICAgICAgICAgMHgwMDogMjQsIDB4MjA6IDI1LCAweDQwOiAyOSwgMHg2MDogMzBcbiAgICAgICAgICB9W2hvdXJCeXRlICYgMHg2MF07XG4gICAgICAgICAgZXZlbnQuaG91ciA9IGhvdXJCeXRlICYgMHgxZjtcbiAgICAgICAgICBldmVudC5taW4gPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zZWMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnN1YmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTg6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0aW1lU2lnbmF0dXJlJztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSA0KSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciB0aW1lU2lnbmF0dXJlIGV2ZW50IGlzIDQsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1lcmF0b3IgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5kZW5vbWluYXRvciA9IE1hdGgucG93KDIsIHN0cmVhbS5yZWFkSW50OCgpKTtcbiAgICAgICAgICBldmVudC5tZXRyb25vbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC50aGlydHlzZWNvbmRzID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTk6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdrZXlTaWduYXR1cmUnO1xuICAgICAgICAgIGlmIChsZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQua2V5ID0gc3RyZWFtLnJlYWRJbnQ4KHRydWUpO1xuICAgICAgICAgIGV2ZW50LnNjYWxlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4N2Y6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZXJTcGVjaWZpYyc7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vaWYoc2VxdWVuY2VyLmRlYnVnID49IDIpe1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUud2FybignVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogJyArIHN1YnR5cGVCeXRlKTtcbiAgICAgICAgICAvL31cbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH0gZWxzZSBpZiAoZXZlbnRUeXBlQnl0ZSA9PSAweGYwKSB7XG4gICAgICBldmVudC50eXBlID0gJ3N5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9IGVsc2UgaWYgKGV2ZW50VHlwZUJ5dGUgPT0gMHhmNykge1xuICAgICAgZXZlbnQudHlwZSA9ICdkaXZpZGVkU3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZSBieXRlOiAnICsgZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLyogY2hhbm5lbCBldmVudCAqL1xuICAgIHZhciBwYXJhbTEgPSB2b2lkIDA7XG4gICAgaWYgKChldmVudFR5cGVCeXRlICYgMHg4MCkgPT09IDApIHtcbiAgICAgIC8qIHJ1bm5pbmcgc3RhdHVzIC0gcmV1c2UgbGFzdEV2ZW50VHlwZUJ5dGUgYXMgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgIGV2ZW50VHlwZUJ5dGUgaXMgYWN0dWFsbHkgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgKi9cbiAgICAgIC8vY29uc29sZS5sb2coJ3J1bm5pbmcgc3RhdHVzJyk7XG4gICAgICBwYXJhbTEgPSBldmVudFR5cGVCeXRlO1xuICAgICAgZXZlbnRUeXBlQnl0ZSA9IGxhc3RFdmVudFR5cGVCeXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbTEgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2xhc3QnLCBldmVudFR5cGVCeXRlKTtcbiAgICAgIGxhc3RFdmVudFR5cGVCeXRlID0gZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gICAgdmFyIGV2ZW50VHlwZSA9IGV2ZW50VHlwZUJ5dGUgPj4gNDtcbiAgICBldmVudC5jaGFubmVsID0gZXZlbnRUeXBlQnl0ZSAmIDB4MGY7XG4gICAgZXZlbnQudHlwZSA9ICdjaGFubmVsJztcbiAgICBzd2l0Y2ggKGV2ZW50VHlwZSkge1xuICAgICAgY2FzZSAweDA4OlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MDk6XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmIChldmVudC52ZWxvY2l0eSA9PT0gMCkge1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ25vdGVPbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGI6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29udHJvbGxlcic7XG4gICAgICAgIGV2ZW50LmNvbnRyb2xsZXJUeXBlID0gcGFyYW0xO1xuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGM6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncHJvZ3JhbUNoYW5nZSc7XG4gICAgICAgIGV2ZW50LnByb2dyYW1OdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZDpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjaGFubmVsQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHBhcmFtMTtcbiAgICAgICAgLy9pZih0cmFja05hbWUgPT09ICdTSC1TMS00NC1DMDkgTD1TTUwgSU49Mycpe1xuICAgICAgICAvLyAgICBjb25zb2xlLmxvZygnY2hhbm5lbCBwcmVzc3VyZScsIHRyYWNrTmFtZSwgcGFyYW0xKTtcbiAgICAgICAgLy99XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwaXRjaEJlbmQnO1xuICAgICAgICBldmVudC52YWx1ZSA9IHBhcmFtMSArIChzdHJlYW0ucmVhZEludDgoKSA8PCA3KTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLypcbiAgICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGU7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlKTtcbiAgICAgICAgKi9cblxuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgLypcbiAgICAgICAgICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICAgICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd3ZWlyZG8nLCB0cmFja05hbWUsIHBhcmFtMSwgZXZlbnQudmVsb2NpdHkpO1xuICAgICAgICAqL1xuXG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VNSURJRmlsZShidWZmZXIpIHtcbiAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPT09IGZhbHNlICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2J1ZmZlciBzaG91bGQgYmUgYW4gaW5zdGFuY2Ugb2YgVWludDhBcnJheSBvZiBBcnJheUJ1ZmZlcicpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICB9XG4gIHZhciB0cmFja3MgPSBuZXcgTWFwKCk7XG4gIHZhciBzdHJlYW0gPSBuZXcgX21pZGlfc3RyZWFtMi5kZWZhdWx0KGJ1ZmZlcik7XG5cbiAgdmFyIGhlYWRlckNodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gIGlmIChoZWFkZXJDaHVuay5pZCAhPT0gJ01UaGQnIHx8IGhlYWRlckNodW5rLmxlbmd0aCAhPT0gNikge1xuICAgIHRocm93ICdCYWQgLm1pZCBmaWxlIC0gaGVhZGVyIG5vdCBmb3VuZCc7XG4gIH1cblxuICB2YXIgaGVhZGVyU3RyZWFtID0gbmV3IF9taWRpX3N0cmVhbTIuZGVmYXVsdChoZWFkZXJDaHVuay5kYXRhKTtcbiAgdmFyIGZvcm1hdFR5cGUgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIHZhciB0cmFja0NvdW50ID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICB2YXIgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG4gIGlmICh0aW1lRGl2aXNpb24gJiAweDgwMDApIHtcbiAgICB0aHJvdyAnRXhwcmVzc2luZyB0aW1lIGRpdmlzaW9uIGluIFNNVFBFIGZyYW1lcyBpcyBub3Qgc3VwcG9ydGVkIHlldCc7XG4gIH1cblxuICB2YXIgaGVhZGVyID0ge1xuICAgICdmb3JtYXRUeXBlJzogZm9ybWF0VHlwZSxcbiAgICAndHJhY2tDb3VudCc6IHRyYWNrQ291bnQsXG4gICAgJ3RpY2tzUGVyQmVhdCc6IHRpbWVEaXZpc2lvblxuICB9O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJhY2tDb3VudDsgaSsrKSB7XG4gICAgdHJhY2tOYW1lID0gJ3RyYWNrXycgKyBpO1xuICAgIHZhciB0cmFjayA9IFtdO1xuICAgIHZhciB0cmFja0NodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gICAgaWYgKHRyYWNrQ2h1bmsuaWQgIT09ICdNVHJrJykge1xuICAgICAgdGhyb3cgJ1VuZXhwZWN0ZWQgY2h1bmsgLSBleHBlY3RlZCBNVHJrLCBnb3QgJyArIHRyYWNrQ2h1bmsuaWQ7XG4gICAgfVxuICAgIHZhciB0cmFja1N0cmVhbSA9IG5ldyBfbWlkaV9zdHJlYW0yLmRlZmF1bHQodHJhY2tDaHVuay5kYXRhKTtcbiAgICB3aGlsZSAoIXRyYWNrU3RyZWFtLmVvZigpKSB7XG4gICAgICB2YXIgZXZlbnQgPSByZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuICAgICAgdHJhY2sucHVzaChldmVudCk7XG4gICAgfVxuICAgIHRyYWNrcy5zZXQodHJhY2tOYW1lLCB0cmFjayk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgICdoZWFkZXInOiBoZWFkZXIsXG4gICAgJ3RyYWNrcyc6IHRyYWNrc1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ2V0Tm90ZURhdGEgPSBnZXROb3RlRGF0YTtcblxudmFyIF9zZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKTtcblxudmFyIHBvdyA9IE1hdGgucG93O1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbi8vY29uc3QgY2hlY2tOb3RlTmFtZSA9IC9eW0EtR117MX0oYnswLDJ9fXwjezAsMn0pW1xcLV17MCwxfVswLTldezF9JC9cbnZhciByZWdleENoZWNrTm90ZU5hbWUgPSAvXltBLUddezF9KGJ8YmJ8I3wjIyl7MCwxfSQvO1xudmFyIHJlZ2V4Q2hlY2tGdWxsTm90ZU5hbWUgPSAvXltBLUddezF9KGJ8YmJ8I3wjIyl7MCwxfShcXC0xfFswLTldezF9KSQvO1xudmFyIHJlZ2V4U3BsaXRGdWxsTmFtZSA9IC9eKFtBLUddezF9KGJ8YmJ8I3wjIyl7MCwxfSkoXFwtMXxbMC05XXsxfSkkLztcbnZhciByZWdleEdldE9jdGF2ZSA9IC8oXFwtMXxbMC05XXsxfSkkLztcblxudmFyIG5vdGVOYW1lcyA9IHtcbiAgc2hhcnA6IFsnQycsICdDIycsICdEJywgJ0QjJywgJ0UnLCAnRicsICdGIycsICdHJywgJ0cjJywgJ0EnLCAnQSMnLCAnQiddLFxuICBmbGF0OiBbJ0MnLCAnRGInLCAnRCcsICdFYicsICdFJywgJ0YnLCAnR2InLCAnRycsICdBYicsICdBJywgJ0JiJywgJ0InXSxcbiAgJ2VuaGFybW9uaWMtc2hhcnAnOiBbJ0IjJywgJ0MjJywgJ0MjIycsICdEIycsICdEIyMnLCAnRSMnLCAnRiMnLCAnRiMjJywgJ0cjJywgJ0cjIycsICdBIycsICdBIyMnXSxcbiAgJ2VuaGFybW9uaWMtZmxhdCc6IFsnRGJiJywgJ0RiJywgJ0ViYicsICdFYicsICdGYicsICdHYmInLCAnR2InLCAnQWJiJywgJ0FiJywgJ0JiYicsICdCYicsICdDYiddXG59O1xuXG52YXIgbm90ZU5hbWVNb2RlID0gdm9pZCAwO1xudmFyIHBpdGNoID0gdm9pZCAwO1xuXG4vKlxuICBzZXR0aW5ncyA9IHtcbiAgICBuYW1lOiAnQycsXG4gICAgb2N0YXZlOiA0LFxuICAgIGZ1bGxOYW1lOiAnQzQnLFxuICAgIG51bWJlcjogNjAsXG4gICAgZnJlcXVlbmN5OiAyMzQuMTYgLy8gbm90IHlldCBpbXBsZW1lbnRlZFxuICB9XG4qL1xuZnVuY3Rpb24gZ2V0Tm90ZURhdGEoc2V0dGluZ3MpIHtcbiAgdmFyIGZ1bGxOYW1lID0gc2V0dGluZ3MuZnVsbE5hbWU7XG4gIHZhciBuYW1lID0gc2V0dGluZ3MubmFtZTtcbiAgdmFyIG9jdGF2ZSA9IHNldHRpbmdzLm9jdGF2ZTtcbiAgdmFyIG1vZGUgPSBzZXR0aW5ncy5tb2RlO1xuICB2YXIgbnVtYmVyID0gc2V0dGluZ3MubnVtYmVyO1xuICB2YXIgZnJlcXVlbmN5ID0gc2V0dGluZ3MuZnJlcXVlbmN5O1xuXG4gIHZhciBfZ2V0U2V0dGluZ3MgPSAoMCwgX3NldHRpbmdzLmdldFNldHRpbmdzKSgpO1xuXG4gIG5vdGVOYW1lTW9kZSA9IF9nZXRTZXR0aW5ncy5ub3RlTmFtZU1vZGU7XG4gIHBpdGNoID0gX2dldFNldHRpbmdzLnBpdGNoO1xuXG5cbiAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgZnVsbE5hbWUgIT09ICdzdHJpbmcnICYmIHR5cGVvZiBudW1iZXIgIT09ICdudW1iZXInICYmIHR5cGVvZiBmcmVxdWVuY3kgIT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAobnVtYmVyIDwgMCB8fCBudW1iZXIgPiAxMjcpIHtcbiAgICBjb25zb2xlLmxvZygncGxlYXNlIHByb3ZpZGUgYSBub3RlIGJldHdlZW4gMCAoQy0xKSBhbmQgMTI3IChHOSknKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIG1vZGUgPSBfY2hlY2tOb3RlTmFtZU1vZGUobW9kZSk7XG4gIC8vY29uc29sZS5sb2cobW9kZSlcblxuICBpZiAodHlwZW9mIG51bWJlciA9PT0gJ251bWJlcicpIHtcbiAgICB2YXIgX2dldE5vdGVOYW1lMiA9IF9nZXROb3RlTmFtZShudW1iZXIsIG1vZGUpO1xuXG4gICAgZnVsbE5hbWUgPSBfZ2V0Tm90ZU5hbWUyLmZ1bGxOYW1lO1xuICAgIG5hbWUgPSBfZ2V0Tm90ZU5hbWUyLm5hbWU7XG4gICAgb2N0YXZlID0gX2dldE5vdGVOYW1lMi5vY3RhdmU7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG5cbiAgICBpZiAocmVnZXhDaGVja05vdGVOYW1lLnRlc3QobmFtZSkpIHtcbiAgICAgIGZ1bGxOYW1lID0gJycgKyBuYW1lICsgb2N0YXZlO1xuICAgICAgbnVtYmVyID0gX2dldE5vdGVOdW1iZXIobmFtZSwgb2N0YXZlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ2ludmFsaWQgbmFtZSAnICsgbmFtZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGZ1bGxOYW1lID09PSAnc3RyaW5nJykge1xuXG4gICAgaWYgKHJlZ2V4Q2hlY2tGdWxsTm90ZU5hbWUudGVzdChmdWxsTmFtZSkpIHtcbiAgICAgIHZhciBfc3BsaXRGdWxsTmFtZTIgPSBfc3BsaXRGdWxsTmFtZShmdWxsTmFtZSk7XG5cbiAgICAgIG9jdGF2ZSA9IF9zcGxpdEZ1bGxOYW1lMi5vY3RhdmU7XG4gICAgICBuYW1lID0gX3NwbGl0RnVsbE5hbWUyLm5hbWU7XG5cbiAgICAgIG51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdpbnZhbGlkIGZ1bGxuYW1lICcgKyBmdWxsTmFtZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICB2YXIgZGF0YSA9IHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIG9jdGF2ZTogb2N0YXZlLFxuICAgIGZ1bGxOYW1lOiBmdWxsTmFtZSxcbiAgICBudW1iZXI6IG51bWJlcixcbiAgICBmcmVxdWVuY3k6IF9nZXRGcmVxdWVuY3kobnVtYmVyKSxcbiAgICBibGFja0tleTogX2lzQmxhY2tLZXkobnVtYmVyKVxuICB9O1xuICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBfZ2V0Tm90ZU5hbWUobnVtYmVyKSB7XG4gIHZhciBtb2RlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbm90ZU5hbWVNb2RlIDogYXJndW1lbnRzWzFdO1xuXG4gIC8vbGV0IG9jdGF2ZSA9IE1hdGguZmxvb3IoKG51bWJlciAvIDEyKSAtIDIpLCAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgdmFyIG9jdGF2ZSA9IGZsb29yKG51bWJlciAvIDEyIC0gMSk7XG4gIHZhciBuYW1lID0gbm90ZU5hbWVzW21vZGVdW251bWJlciAlIDEyXTtcbiAgcmV0dXJuIHtcbiAgICBmdWxsTmFtZTogJycgKyBuYW1lICsgb2N0YXZlLFxuICAgIG5hbWU6IG5hbWUsXG4gICAgb2N0YXZlOiBvY3RhdmVcbiAgfTtcbn1cblxuZnVuY3Rpb24gX2dldE9jdGF2ZShmdWxsTmFtZSkge1xuICByZXR1cm4gcGFyc2VJbnQoZnVsbE5hbWUubWF0Y2gocmVnZXhHZXRPY3RhdmUpWzBdLCAxMCk7XG59XG5cbmZ1bmN0aW9uIF9zcGxpdEZ1bGxOYW1lKGZ1bGxOYW1lKSB7XG4gIHZhciBvY3RhdmUgPSBfZ2V0T2N0YXZlKGZ1bGxOYW1lKTtcbiAgcmV0dXJuIHtcbiAgICBvY3RhdmU6IG9jdGF2ZSxcbiAgICBuYW1lOiBmdWxsTmFtZS5yZXBsYWNlKG9jdGF2ZSwgJycpXG4gIH07XG59XG5cbmZ1bmN0aW9uIF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSkge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIHZhciBpbmRleCA9IHZvaWQgMDtcblxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBrZXlzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgdmFyIGtleSA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICB2YXIgbW9kZSA9IG5vdGVOYW1lc1trZXldO1xuICAgICAgaW5kZXggPSBtb2RlLmZpbmRJbmRleChmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4geCA9PT0gbmFtZTtcbiAgICAgIH0pO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL251bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMikgKyAxMiAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgbnVtYmVyID0gaW5kZXggKyAxMiArIG9jdGF2ZSAqIDEyOyAvLyDihpIgbWlkaSBzdGFuZGFyZCArIHNjaWVudGlmaWMgbmFtaW5nLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWlkZGxlX0MgYW5kIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU2NpZW50aWZpY19waXRjaF9ub3RhdGlvblxuXG4gIGlmIChudW1iZXIgPCAwIHx8IG51bWJlciA+IDEyNykge1xuICAgIGNvbnNvbGUubG9nKCdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgYmV0d2VlbiAwIChDLTEpIGFuZCAxMjcgKEc5KScpO1xuICAgIHJldHVybiAtMTtcbiAgfVxuICByZXR1cm4gbnVtYmVyO1xufVxuXG5mdW5jdGlvbiBfZ2V0RnJlcXVlbmN5KG51bWJlcikge1xuICByZXR1cm4gcGl0Y2ggKiBwb3coMiwgKG51bWJlciAtIDY5KSAvIDEyKTsgLy8gbWlkaSBzdGFuZGFyZCwgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01JRElfVHVuaW5nX1N0YW5kYXJkXG59XG5cbi8vQFRPRE86IGNhbGN1bGF0ZSBub3RlIGZyb20gZnJlcXVlbmN5XG5mdW5jdGlvbiBfZ2V0UGl0Y2goaGVydHopIHtcbiAgLy9mbSAgPSAgMiht4oiSNjkpLzEyKDQ0MCBIeikuXG59XG5cbmZ1bmN0aW9uIF9jaGVja05vdGVOYW1lTW9kZShtb2RlKSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgdmFyIHJlc3VsdCA9IGtleXMuaW5jbHVkZXMobW9kZSk7XG4gIC8vY29uc29sZS5sb2cocmVzdWx0KVxuICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgIGlmICh0eXBlb2YgbW9kZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnNvbGUubG9nKG1vZGUgKyAnIGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSBtb2RlLCB1c2luZyBcIicgKyBub3RlTmFtZU1vZGUgKyAnXCIgaW5zdGVhZCcpO1xuICAgIH1cbiAgICBtb2RlID0gbm90ZU5hbWVNb2RlO1xuICB9XG4gIHJldHVybiBtb2RlO1xufVxuXG5mdW5jdGlvbiBfaXNCbGFja0tleShub3RlTnVtYmVyKSB7XG4gIHZhciBibGFjayA9IHZvaWQgMDtcblxuICBzd2l0Y2ggKHRydWUpIHtcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTogLy9DI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAzOiAvL0QjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDY6IC8vRiNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gODogLy9HI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxMDpcbiAgICAgIC8vQSNcbiAgICAgIGJsYWNrID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBibGFjayA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGJsYWNrO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbmV4cG9ydHMuZGVjb2RlU2FtcGxlID0gZGVjb2RlU2FtcGxlO1xuZXhwb3J0cy5wYXJzZVNhbXBsZXMyID0gcGFyc2VTYW1wbGVzMjtcbmV4cG9ydHMucGFyc2VTYW1wbGVzID0gcGFyc2VTYW1wbGVzO1xuXG52YXIgX2lzb21vcnBoaWNGZXRjaCA9IHJlcXVpcmUoJ2lzb21vcnBoaWMtZmV0Y2gnKTtcblxudmFyIF9pc29tb3JwaGljRmV0Y2gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNvbW9ycGhpY0ZldGNoKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX2V2ZW50bGlzdGVuZXIgPSByZXF1aXJlKCcuL2V2ZW50bGlzdGVuZXInKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gZGVjb2RlU2FtcGxlKHNhbXBsZSwgaWQsIGV2ZXJ5KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIHRyeSB7XG4gICAgICBfaW5pdF9hdWRpby5jb250ZXh0LmRlY29kZUF1ZGlvRGF0YShzYW1wbGUsIGZ1bmN0aW9uIG9uU3VjY2VzcyhidWZmZXIpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhpZCwgYnVmZmVyKTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXNvbHZlKHsgaWQ6IGlkLCBidWZmZXI6IGJ1ZmZlciB9KTtcbiAgICAgICAgICBpZiAoZXZlcnkpIHtcbiAgICAgICAgICAgIGV2ZXJ5KHsgaWQ6IGlkLCBidWZmZXI6IGJ1ZmZlciB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShidWZmZXIpO1xuICAgICAgICAgIGlmIChldmVyeSkge1xuICAgICAgICAgICAgZXZlcnkoYnVmZmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIGZ1bmN0aW9uIG9uRXJyb3IoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEgW0lEOiAnICsgaWQgKyAnXScpO1xuICAgICAgICAvL3JlamVjdChlKTsgLy8gZG9uJ3QgdXNlIHJlamVjdCBiZWNhdXNlIHdlIHVzZSB0aGlzIGFzIGEgbmVzdGVkIHByb21pc2UgYW5kIHdlIGRvbid0IHdhbnQgdGhlIHBhcmVudCBwcm9taXNlIHRvIHJlamVjdFxuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJlc29sdmUoeyBpZDogaWQgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2Vycm9yIGRlY29kaW5nIGF1ZGlvZGF0YScsIGlkLCBlKTtcbiAgICAgIGlmICh0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlc29sdmUoeyBpZDogaWQgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gbG9hZEFuZFBhcnNlU2FtcGxlKHVybCwgaWQsIGV2ZXJ5KSB7XG4gIC8vY29uc29sZS5sb2coaWQsIHVybClcbiAgLypcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAnbG9hZGluZycsXG4gICAgICBkYXRhOiB1cmxcbiAgICB9KVxuICB9LCAwKVxuICAqL1xuICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgIHR5cGU6ICdsb2FkaW5nJyxcbiAgICBkYXRhOiB1cmxcbiAgfSk7XG5cbiAgdmFyIGV4ZWN1dG9yID0gZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKHVybClcbiAgICAoMCwgX2lzb21vcnBoaWNGZXRjaDIuZGVmYXVsdCkodXJsLCB7XG4gICAgICBtZXRob2Q6ICdHRVQnXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICByZXNwb25zZS5hcnJheUJ1ZmZlcigpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBkYXRhKVxuICAgICAgICAgIGRlY29kZVNhbXBsZShkYXRhLCBpZCwgZXZlcnkpLnRoZW4ocmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlc29sdmUoeyBpZDogaWQgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBuZXcgUHJvbWlzZShleGVjdXRvcik7XG59XG5cbmZ1bmN0aW9uIGdldFByb21pc2VzKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpIHtcblxuICB2YXIgZ2V0U2FtcGxlID0gZnVuY3Rpb24gZ2V0U2FtcGxlKCkge1xuICAgIGlmIChrZXkgIT09ICdyZWxlYXNlJyAmJiBrZXkgIT09ICdpbmZvJyAmJiBrZXkgIT09ICdzdXN0YWluJykge1xuICAgICAgLy9jb25zb2xlLmxvZyhrZXkpXG4gICAgICBpZiAoc2FtcGxlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcHJvbWlzZXMucHVzaChkZWNvZGVTYW1wbGUoc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzYW1wbGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICgoMCwgX3V0aWwuY2hlY2tJZkJhc2U2NCkoc2FtcGxlKSkge1xuICAgICAgICAgIHByb21pc2VzLnB1c2goZGVjb2RlU2FtcGxlKCgwLCBfdXRpbC5iYXNlNjRUb0JpbmFyeSkoc2FtcGxlKSwga2V5LCBiYXNlVXJsLCBldmVyeSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coYmFzZVVybCArIHNhbXBsZSlcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRBbmRQYXJzZVNhbXBsZShiYXNlVXJsICsgZXNjYXBlKHNhbXBsZSksIGtleSwgZXZlcnkpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICgodHlwZW9mIHNhbXBsZSA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2Yoc2FtcGxlKSkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHNhbXBsZSA9IHNhbXBsZS5zYW1wbGUgfHwgc2FtcGxlLmJ1ZmZlciB8fCBzYW1wbGUuYmFzZTY0IHx8IHNhbXBsZS51cmw7XG4gICAgICAgIGdldFNhbXBsZShwcm9taXNlcywgc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhrZXksIHNhbXBsZSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGUsIHByb21pc2VzLmxlbmd0aClcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZ2V0U2FtcGxlKCk7XG59XG5cbi8vIG9ubHkgZm9yIGludGVybmFsbHkgdXNlIGluIHFhbWJpXG5mdW5jdGlvbiBwYXJzZVNhbXBsZXMyKG1hcHBpbmcpIHtcbiAgdmFyIGV2ZXJ5ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMV07XG5cbiAgdmFyIHR5cGUgPSAoMCwgX3V0aWwudHlwZVN0cmluZykobWFwcGluZyksXG4gICAgICBwcm9taXNlcyA9IFtdLFxuICAgICAgYmFzZVVybCA9ICcnO1xuXG4gIGlmICh0eXBlb2YgbWFwcGluZy5iYXNlVXJsID09PSAnc3RyaW5nJykge1xuICAgIGJhc2VVcmwgPSBtYXBwaW5nLmJhc2VVcmw7XG4gICAgZGVsZXRlIG1hcHBpbmcuYmFzZVVybDtcbiAgfVxuXG4gIC8vY29uc29sZS5sb2cobWFwcGluZywgYmFzZVVybClcblxuICBldmVyeSA9IHR5cGVvZiBldmVyeSA9PT0gJ2Z1bmN0aW9uJyA/IGV2ZXJ5IDogZmFsc2U7XG4gIC8vY29uc29sZS5sb2codHlwZSwgbWFwcGluZylcbiAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgT2JqZWN0LmtleXMobWFwcGluZykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAvLyBpZihpc05hTihrZXkpID09PSBmYWxzZSl7XG4gICAgICAvLyAgIGtleSA9IHBhcnNlSW50KGtleSwgMTApXG4gICAgICAvLyB9XG4gICAgICB2YXIgYSA9IG1hcHBpbmdba2V5XTtcbiAgICAgIC8vY29uc29sZS5sb2coa2V5LCBhLCB0eXBlU3RyaW5nKGEpKVxuICAgICAgaWYgKCgwLCBfdXRpbC50eXBlU3RyaW5nKShhKSA9PT0gJ2FycmF5Jykge1xuICAgICAgICBhLmZvckVhY2goZnVuY3Rpb24gKG1hcCkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2cobWFwKVxuICAgICAgICAgIGdldFByb21pc2VzKHByb21pc2VzLCBtYXAsIGtleSwgYmFzZVVybCwgZXZlcnkpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldFByb21pc2VzKHByb21pc2VzLCBhLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnYXJyYXknKSB7XG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBrZXkgPSB2b2lkIDA7XG4gICAgICBtYXBwaW5nLmZvckVhY2goZnVuY3Rpb24gKHNhbXBsZSkge1xuICAgICAgICAvLyBrZXkgaXMgZGVsaWJlcmF0ZWx5IHVuZGVmaW5lZFxuICAgICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KTtcbiAgICAgIH0pO1xuICAgIH0pKCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKHR5cGUsIHZhbHVlcylcbiAgICAgIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtYXBwaW5nID0ge307XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIC8vIHN1cHBvcnQgZm9yIG11bHRpIGxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgICAgICB2YXIgbWFwID0gbWFwcGluZ1t2YWx1ZS5pZF07XG4gICAgICAgICAgdmFyIHR5cGUgPSAoMCwgX3V0aWwudHlwZVN0cmluZykobWFwKTtcbiAgICAgICAgICBpZiAodHlwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnYXJyYXknKSB7XG4gICAgICAgICAgICAgIG1hcC5wdXNoKHZhbHVlLmJ1ZmZlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IFttYXAsIHZhbHVlLmJ1ZmZlcl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gdmFsdWUuYnVmZmVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vY29uc29sZS5sb2cobWFwcGluZylcbiAgICAgICAgcmVzb2x2ZShtYXBwaW5nKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgICByZXNvbHZlKHZhbHVlcyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBwYXJzZVNhbXBsZXMoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBkYXRhID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgZGF0YVtfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIGlmIChkYXRhLmxlbmd0aCA9PT0gMSAmJiAoMCwgX3V0aWwudHlwZVN0cmluZykoZGF0YVswXSkgIT09ICdzdHJpbmcnKSB7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhWzBdKVxuICAgIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGFbMF0pO1xuICB9XG4gIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGEpO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucGFyc2VUaW1lRXZlbnRzID0gcGFyc2VUaW1lRXZlbnRzO1xuZXhwb3J0cy5wYXJzZUV2ZW50cyA9IHBhcnNlRXZlbnRzO1xuZXhwb3J0cy5wYXJzZU1JRElOb3RlcyA9IHBhcnNlTUlESU5vdGVzO1xuZXhwb3J0cy5maWx0ZXJFdmVudHMgPSBmaWx0ZXJFdmVudHM7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX21pZGlfbm90ZSA9IHJlcXVpcmUoJy4vbWlkaV9ub3RlJyk7XG5cbnZhciBwcHEgPSB2b2lkIDAsXG4gICAgYnBtID0gdm9pZCAwLFxuICAgIGZhY3RvciA9IHZvaWQgMCxcbiAgICBub21pbmF0b3IgPSB2b2lkIDAsXG4gICAgZGVub21pbmF0b3IgPSB2b2lkIDAsXG4gICAgcGxheWJhY2tTcGVlZCA9IHZvaWQgMCxcbiAgICBiYXIgPSB2b2lkIDAsXG4gICAgYmVhdCA9IHZvaWQgMCxcbiAgICBzaXh0ZWVudGggPSB2b2lkIDAsXG4gICAgdGljayA9IHZvaWQgMCxcbiAgICB0aWNrcyA9IHZvaWQgMCxcbiAgICBtaWxsaXMgPSB2b2lkIDAsXG4gICAgbWlsbGlzUGVyVGljayA9IHZvaWQgMCxcbiAgICBzZWNvbmRzUGVyVGljayA9IHZvaWQgMCxcbiAgICB0aWNrc1BlckJlYXQgPSB2b2lkIDAsXG4gICAgdGlja3NQZXJCYXIgPSB2b2lkIDAsXG4gICAgdGlja3NQZXJTaXh0ZWVudGggPSB2b2lkIDAsXG4gICAgbnVtU2l4dGVlbnRoID0gdm9pZCAwLFxuICAgIGRpZmZUaWNrcyA9IHZvaWQgMDtcbi8vcHJldmlvdXNFdmVudFxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKSB7XG4gIHNlY29uZHNQZXJUaWNrID0gMSAvIHBsYXliYWNrU3BlZWQgKiA2MCAvIGJwbSAvIHBwcTtcbiAgbWlsbGlzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrICogMTAwMDtcbiAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLCBicG0sIHBwcSwgcGxheWJhY2tTcGVlZCwgKHBwcSAqIG1pbGxpc1BlclRpY2spKTtcbiAgLy9jb25zb2xlLmxvZyhwcHEpO1xufVxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKSB7XG4gIGZhY3RvciA9IDQgLyBkZW5vbWluYXRvcjtcbiAgbnVtU2l4dGVlbnRoID0gZmFjdG9yICogNDtcbiAgdGlja3NQZXJCZWF0ID0gcHBxICogZmFjdG9yO1xuICB0aWNrc1BlckJhciA9IHRpY2tzUGVyQmVhdCAqIG5vbWluYXRvcjtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBwcHEgLyA0O1xuICAvL2NvbnNvbGUubG9nKGRlbm9taW5hdG9yLCBmYWN0b3IsIG51bVNpeHRlZW50aCwgdGlja3NQZXJCZWF0LCB0aWNrc1BlckJhciwgdGlja3NQZXJTaXh0ZWVudGgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCkge1xuICB2YXIgZmFzdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzFdO1xuXG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIC8vIGlmKGRpZmZUaWNrcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGRpZmZUaWNrcywgZXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudHlwZSlcbiAgLy8gfVxuICB0aWNrICs9IGRpZmZUaWNrcztcbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgLy9wcmV2aW91c0V2ZW50ID0gZXZlbnRcbiAgLy9jb25zb2xlLmxvZyhkaWZmVGlja3MsIG1pbGxpc1BlclRpY2spO1xuICBtaWxsaXMgKz0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcblxuICBpZiAoZmFzdCA9PT0gZmFsc2UpIHtcbiAgICB3aGlsZSAodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCkge1xuICAgICAgc2l4dGVlbnRoKys7XG4gICAgICB0aWNrIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgd2hpbGUgKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCkge1xuICAgICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgICBiZWF0Kys7XG4gICAgICAgIHdoaWxlIChiZWF0ID4gbm9taW5hdG9yKSB7XG4gICAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgICAgYmFyKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VUaW1lRXZlbnRzKHNldHRpbmdzLCB0aW1lRXZlbnRzKSB7XG4gIHZhciBpc1BsYXlpbmcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1syXTtcblxuICAvL2NvbnNvbGUubG9nKCdwYXJzZSB0aW1lIGV2ZW50cycpXG4gIHZhciB0eXBlID0gdm9pZCAwO1xuICB2YXIgZXZlbnQgPSB2b2lkIDA7XG5cbiAgcHBxID0gc2V0dGluZ3MucHBxO1xuICBicG0gPSBzZXR0aW5ncy5icG07XG4gIG5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcjtcbiAgcGxheWJhY2tTcGVlZCA9IHNldHRpbmdzLnBsYXliYWNrU3BlZWQ7XG4gIGJhciA9IDE7XG4gIGJlYXQgPSAxO1xuICBzaXh0ZWVudGggPSAxO1xuICB0aWNrID0gMDtcbiAgdGlja3MgPSAwO1xuICBtaWxsaXMgPSAwO1xuXG4gIHNldFRpY2tEdXJhdGlvbigpO1xuICBzZXRUaWNrc1BlckJlYXQoKTtcblxuICB0aW1lRXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYS50aWNrcyA8PSBiLnRpY2tzID8gLTEgOiAxO1xuICB9KTtcbiAgdmFyIGUgPSAwO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0aW1lRXZlbnRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgZXZlbnQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhlKyssIGV2ZW50LnRpY2tzLCBldmVudC50eXBlKVxuICAgICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICAgIHR5cGUgPSBldmVudC50eXBlO1xuICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG5cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuXG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICAgICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICAgIHNldFRpY2tzUGVyQmVhdCgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICAgIHVwZGF0ZUV2ZW50KGV2ZW50LCBpc1BsYXlpbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXJzQXNTdHJpbmcpO1xuICAgIH1cblxuICAgIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAvL2NvbnNvbGUubG9nKHRpbWVFdmVudHMpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vL2V4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhzb25nLCBldmVudHMpe1xuZnVuY3Rpb24gcGFyc2VFdmVudHMoZXZlbnRzKSB7XG4gIHZhciBpc1BsYXlpbmcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIHZhciBldmVudCA9IHZvaWQgMDtcbiAgdmFyIHN0YXJ0RXZlbnQgPSAwO1xuICB2YXIgbGFzdEV2ZW50VGljayA9IDA7XG4gIHZhciByZXN1bHQgPSBbXTtcblxuICB0aWNrID0gMDtcbiAgdGlja3MgPSAwO1xuICBkaWZmVGlja3MgPSAwO1xuXG4gIC8vbGV0IGV2ZW50cyA9IFtdLmNvbmNhdChldnRzLCBzb25nLl90aW1lRXZlbnRzKTtcbiAgdmFyIG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGg7XG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuXG4gIC8vIG5vdGVvZmYgY29tZXMgYmVmb3JlIG5vdGVvblxuXG4gIC8qXG4gICAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gYS5zb3J0SW5kZXggLSBiLnNvcnRJbmRleDtcbiAgICB9KVxuICAqL1xuXG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKGEudGlja3MgPT09IGIudGlja3MpIHtcbiAgICAgIC8vIGlmKGEudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vICAgcmV0dXJuIC0xXG4gICAgICAvLyB9ZWxzZSBpZihiLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAxXG4gICAgICAvLyB9XG4gICAgICAvLyBzaG9ydDpcbiAgICAgIHZhciByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgaWYgKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgIHIgPSAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3M7XG4gIH0pO1xuICBldmVudCA9IGV2ZW50c1swXTtcbiAgLy9jb25zb2xlLmxvZyhldmVudClcblxuICBicG0gPSBldmVudC5icG07XG4gIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcblxuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG5cbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0RXZlbnQ7IGkgPCBudW1FdmVudHM7IGkrKykge1xuXG4gICAgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuICAgICAgICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgICAgICAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzO1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrcztcbiAgICAgICAgdGlja3MgPSBldmVudC50aWNrcztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLGV2ZW50Lm1pbGxpc1BlclRpY2spO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICAgICAgICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzO1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrcztcbiAgICAgICAgdGlja3MgPSBldmVudC50aWNrcztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub21pbmF0b3IsbnVtU2l4dGVlbnRoLHRpY2tzUGVyU2l4dGVlbnRoKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vY2FzZSAxMjg6XG4gICAgICAgIC8vY2FzZSAxNDQ6XG5cbiAgICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAgIHVwZGF0ZUV2ZW50KGV2ZW50LCBpc1BsYXlpbmcpO1xuICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAqL1xuICAgICAgICByZXN1bHQucHVzaChldmVudCk7XG5cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuYmFyKVxuXG4gICAgICAvLyBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQuZGF0YTIsIGV2ZW50LmJhcnNBc1N0cmluZylcbiAgICAgIC8vIH1cblxuICAgIH1cblxuICAgIC8vIGlmKGkgPCAxMDAgJiYgKGV2ZW50LnR5cGUgPT09IDgxIHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpKXtcbiAgICAvLyAgIC8vY29uc29sZS5sb2coaSwgdGlja3MsIGRpZmZUaWNrcywgbWlsbGlzLCBtaWxsaXNQZXJUaWNrKVxuICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQubWlsbGlzLCAnbm90ZScsIGV2ZW50LmRhdGExLCAndmVsbycsIGV2ZW50LmRhdGEyKVxuICAgIC8vIH1cblxuICAgIGxhc3RFdmVudFRpY2sgPSBldmVudC50aWNrcztcbiAgfVxuICBwYXJzZU1JRElOb3RlcyhyZXN1bHQpO1xuICByZXR1cm4gcmVzdWx0O1xuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGV2ZW50KSB7XG4gIHZhciBmYXN0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMV07XG5cbiAgLy9jb25zb2xlLmxvZyhiYXIsIGJlYXQsIHRpY2tzKVxuICAvL2NvbnNvbGUubG9nKGV2ZW50LCBicG0sIG1pbGxpc1BlclRpY2ssIHRpY2tzLCBtaWxsaXMpO1xuXG4gIGV2ZW50LmJwbSA9IGJwbTtcbiAgZXZlbnQubm9taW5hdG9yID0gbm9taW5hdG9yO1xuICBldmVudC5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuXG4gIGV2ZW50LnRpY2tzUGVyQmFyID0gdGlja3NQZXJCYXI7XG4gIGV2ZW50LnRpY2tzUGVyQmVhdCA9IHRpY2tzUGVyQmVhdDtcbiAgZXZlbnQudGlja3NQZXJTaXh0ZWVudGggPSB0aWNrc1BlclNpeHRlZW50aDtcblxuICBldmVudC5mYWN0b3IgPSBmYWN0b3I7XG4gIGV2ZW50Lm51bVNpeHRlZW50aCA9IG51bVNpeHRlZW50aDtcbiAgZXZlbnQuc2Vjb25kc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljaztcbiAgZXZlbnQubWlsbGlzUGVyVGljayA9IG1pbGxpc1BlclRpY2s7XG5cbiAgZXZlbnQudGlja3MgPSB0aWNrcztcblxuICBldmVudC5taWxsaXMgPSBtaWxsaXM7XG4gIGV2ZW50LnNlY29uZHMgPSBtaWxsaXMgLyAxMDAwO1xuXG4gIGlmIChmYXN0KSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZXZlbnQuYmFyID0gYmFyO1xuICBldmVudC5iZWF0ID0gYmVhdDtcbiAgZXZlbnQuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICBldmVudC50aWNrID0gdGljaztcbiAgLy9ldmVudC5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGljaztcbiAgdmFyIHRpY2tBc1N0cmluZyA9IHRpY2sgPT09IDAgPyAnMDAwJyA6IHRpY2sgPCAxMCA/ICcwMCcgKyB0aWNrIDogdGljayA8IDEwMCA/ICcwJyArIHRpY2sgOiB0aWNrO1xuICBldmVudC5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgdGlja0FzU3RyaW5nO1xuICBldmVudC5iYXJzQXNBcnJheSA9IFtiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja107XG5cbiAgdmFyIHRpbWVEYXRhID0gKDAsIF91dGlsLmdldE5pY2VUaW1lKShtaWxsaXMpO1xuXG4gIGV2ZW50LmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICBldmVudC5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gIGV2ZW50LnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgZXZlbnQubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgZXZlbnQudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICBldmVudC50aW1lQXNBcnJheSA9IHRpbWVEYXRhLnRpbWVBc0FycmF5O1xuXG4gIC8vIGlmKG1pbGxpcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAvLyB9XG59XG5cbnZhciBtaWRpTm90ZUluZGV4ID0gMDtcblxuZnVuY3Rpb24gcGFyc2VNSURJTm90ZXMoZXZlbnRzKSB7XG4gIHZhciBub3RlcyA9IHt9O1xuICB2YXIgbm90ZXNJblRyYWNrID0gdm9pZCAwO1xuICB2YXIgbiA9IDA7XG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gZXZlbnRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICB2YXIgZXZlbnQgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgIGlmICh0eXBlb2YgZXZlbnQuX3BhcnQgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBldmVudC5fdHJhY2sgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdubyBwYXJ0IGFuZC9vciB0cmFjayBzZXQnLCBldmVudCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IDE0NCkge1xuICAgICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdO1xuICAgICAgICBpZiAodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgbm90ZXNJblRyYWNrW2V2ZW50LmRhdGExXSA9IGV2ZW50O1xuICAgICAgfSBlbHNlIGlmIChldmVudC50eXBlID09PSAxMjgpIHtcbiAgICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXTtcbiAgICAgICAgaWYgKHR5cGVvZiBub3Rlc0luVHJhY2sgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmluZm8obisrLCAnbm8gY29ycmVzcG9uZGluZyBub3Rlb24gZXZlbnQgZm91bmQgZm9yIGV2ZW50JywgZXZlbnQuaWQpXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vdGVPbiA9IG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV07XG4gICAgICAgIHZhciBub3RlT2ZmID0gZXZlbnQ7XG4gICAgICAgIGlmICh0eXBlb2Ygbm90ZU9uID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIG5vdGVvbiBldmVudCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV07XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vdGUgPSBuZXcgX21pZGlfbm90ZS5NSURJTm90ZShub3RlT24sIG5vdGVPZmYpO1xuICAgICAgICBub3RlLl90cmFjayA9IG5vdGVPbi5fdHJhY2s7XG4gICAgICAgIG5vdGUgPSBudWxsO1xuICAgICAgICAvLyBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgICAgICAvLyBub3RlT24ubWlkaU5vdGVJZCA9IGlkXG4gICAgICAgIC8vIG5vdGVPbi5vZmYgPSBub3RlT2ZmLmlkXG4gICAgICAgIC8vIG5vdGVPZmYubWlkaU5vdGVJZCA9IGlkXG4gICAgICAgIC8vIG5vdGVPZmYub24gPSBub3RlT24uaWRcbiAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50Ll90cmFjay5pZF1bZXZlbnQuZGF0YTFdO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgT2JqZWN0LmtleXMobm90ZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGRlbGV0ZSBub3Rlc1trZXldO1xuICB9KTtcbiAgbm90ZXMgPSB7fTtcbiAgLy9jb25zb2xlLmxvZyhub3Rlcywgbm90ZXNJblRyYWNrKVxufVxuXG4vLyBub3QgaW4gdXNlIVxuZnVuY3Rpb24gZmlsdGVyRXZlbnRzKGV2ZW50cykge1xuICB2YXIgc3VzdGFpbiA9IHt9O1xuICB2YXIgdG1wUmVzdWx0ID0ge307XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yMyA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IzID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yMyA9IGV2ZW50c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMzsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IChfc3RlcDMgPSBfaXRlcmF0b3IzLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zID0gdHJ1ZSkge1xuICAgICAgdmFyIGV2ZW50ID0gX3N0ZXAzLnZhbHVlO1xuXG4gICAgICBpZiAoZXZlbnQudHlwZSA9PT0gMTc2ICYmIGV2ZW50LmRhdGExID09PSA2NCkge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YTIgPT09IDApIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09IGV2ZW50LnRpY2tzKSB7XG4gICAgICAgICAgICBkZWxldGUgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0bXBSZXN1bHRbZXZlbnQudGlja3NdID0gZXZlbnQ7XG4gICAgICAgICAgZGVsZXRlIHN1c3RhaW5bZXZlbnQudHJhY2tJZF07XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuZGF0YTIgPT09IDEyNykge1xuICAgICAgICAgIHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPSBldmVudC50aWNrcztcbiAgICAgICAgICB0bXBSZXN1bHRbZXZlbnQudGlja3NdID0gZXZlbnQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yMyA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IzID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zICYmIF9pdGVyYXRvcjMucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvcjMucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjMpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IzO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnNvbGUubG9nKHN1c3RhaW4pO1xuICBPYmplY3Qua2V5cyh0bXBSZXN1bHQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBzdXN0YWluRXZlbnQgPSB0bXBSZXN1bHRba2V5XTtcbiAgICBjb25zb2xlLmxvZyhzdXN0YWluRXZlbnQpO1xuICAgIHJlc3VsdC5wdXNoKHN1c3RhaW5FdmVudCk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuUGFydCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLy8gQCBmbG93XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIGluc3RhbmNlSW5kZXggPSAwO1xuXG52YXIgUGFydCA9IGV4cG9ydHMuUGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUGFydCgpIHtcbiAgICB2YXIgc2V0dGluZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYXJ0KTtcblxuICAgIHRoaXMuaWQgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIHZhciBfc2V0dGluZ3MkbmFtZSA9IHNldHRpbmdzLm5hbWU7XG4gICAgdGhpcy5uYW1lID0gX3NldHRpbmdzJG5hbWUgPT09IHVuZGVmaW5lZCA/IHRoaXMuaWQgOiBfc2V0dGluZ3MkbmFtZTtcbiAgICB2YXIgX3NldHRpbmdzJG11dGVkID0gc2V0dGluZ3MubXV0ZWQ7XG4gICAgdGhpcy5tdXRlZCA9IF9zZXR0aW5ncyRtdXRlZCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBfc2V0dGluZ3MkbXV0ZWQ7XG5cblxuICAgIHRoaXMuX3RyYWNrID0gbnVsbDtcbiAgICB0aGlzLl9zb25nID0gbnVsbDtcbiAgICB0aGlzLl9ldmVudHMgPSBbXTtcbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlO1xuICAgIHRoaXMuX3N0YXJ0ID0geyBtaWxsaXM6IDAsIHRpY2tzOiAwIH07XG4gICAgdGhpcy5fZW5kID0geyBtaWxsaXM6IDAsIHRpY2tzOiAwIH07XG5cbiAgICB2YXIgZXZlbnRzID0gc2V0dGluZ3MuZXZlbnRzO1xuXG4gICAgaWYgKHR5cGVvZiBldmVudHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmFkZEV2ZW50cy5hcHBseSh0aGlzLCBfdG9Db25zdW1hYmxlQXJyYXkoZXZlbnRzKSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFBhcnQsIFt7XG4gICAga2V5OiAnY29weScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvcHkoKSB7XG4gICAgICB2YXIgcCA9IG5ldyBQYXJ0KHRoaXMubmFtZSArICdfY29weScpOyAvLyBpbXBsZW1lbnQgZ2V0TmFtZU9mQ29weSgpIGluIHV0aWwgKHNlZSBoZWFydGJlYXQpXG4gICAgICB2YXIgZXZlbnRzID0gW107XG4gICAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIGNvcHkgPSBldmVudC5jb3B5KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGNvcHkpO1xuICAgICAgICBldmVudHMucHVzaChjb3B5KTtcbiAgICAgIH0pO1xuICAgICAgcC5hZGRFdmVudHMuYXBwbHkocCwgZXZlbnRzKTtcbiAgICAgIHAudXBkYXRlKCk7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0cmFuc3Bvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0cmFuc3Bvc2UoYW1vdW50KSB7XG4gICAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQudHJhbnNwb3NlKGFtb3VudCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZSh0aWNrcykge1xuICAgICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50Lm1vdmUodGlja3MpO1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy5fc29uZykge1xuICAgICAgICB2YXIgX3NvbmckX21vdmVkRXZlbnRzO1xuXG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHMgPSB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfbW92ZWRFdmVudHMsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlVG8nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlVG8odGlja3MpIHtcbiAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5tb3ZlVG8odGlja3MpO1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy5fc29uZykge1xuICAgICAgICB2YXIgX3NvbmckX21vdmVkRXZlbnRzMjtcblxuICAgICAgICAoX3NvbmckX21vdmVkRXZlbnRzMiA9IHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9tb3ZlZEV2ZW50czIsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhZGRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudHMoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgIF9ldmVudHM7XG5cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICAgICAgdmFyIHRyYWNrID0gdGhpcy5fdHJhY2s7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgZXZlbnRzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuX3BhcnQgPSBfdGhpcztcbiAgICAgICAgX3RoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudCk7XG4gICAgICAgIGlmICh0cmFjaykge1xuICAgICAgICAgIGV2ZW50Ll90cmFjayA9IHRyYWNrO1xuICAgICAgICAgIGlmICh0cmFjay5fc29uZykge1xuICAgICAgICAgICAgZXZlbnQuX3NvbmcgPSB0cmFjay5fc29uZztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgKF9ldmVudHMgPSB0aGlzLl9ldmVudHMpLnB1c2guYXBwbHkoX2V2ZW50cywgZXZlbnRzKTtcblxuICAgICAgaWYgKHRyYWNrKSB7XG4gICAgICAgIHZhciBfdHJhY2skX2V2ZW50cztcblxuICAgICAgICAoX3RyYWNrJF9ldmVudHMgPSB0cmFjay5fZXZlbnRzKS5wdXNoLmFwcGx5KF90cmFjayRfZXZlbnRzLCBldmVudHMpO1xuICAgICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3NvbmcpIHtcbiAgICAgICAgdmFyIF9zb25nJF9uZXdFdmVudHM7XG5cbiAgICAgICAgKF9zb25nJF9uZXdFdmVudHMgPSB0aGlzLl9zb25nLl9uZXdFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX25ld0V2ZW50cywgZXZlbnRzKTtcbiAgICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXZlbnRzKCkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHZhciB0cmFjayA9IHRoaXMuX3RyYWNrO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuX3BhcnQgPSBudWxsO1xuICAgICAgICBfdGhpczIuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKTtcbiAgICAgICAgaWYgKHRyYWNrKSB7XG4gICAgICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbDtcbiAgICAgICAgICB0cmFjay5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpO1xuICAgICAgICAgIGlmICh0cmFjay5fc29uZykge1xuICAgICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAodHJhY2spIHtcbiAgICAgICAgdHJhY2suX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgdHJhY2suX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3NvbmcpIHtcbiAgICAgICAgdmFyIF9zb25nJF9yZW1vdmVkRXZlbnRzO1xuXG4gICAgICAgIChfc29uZyRfcmVtb3ZlZEV2ZW50cyA9IHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX3JlbW92ZWRFdmVudHMsIGV2ZW50cyk7XG4gICAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKHRoaXMpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWU7XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZUV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVFdmVudHModGlja3MpIHtcbiAgICAgIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgZXZlbnRzID0gQXJyYXkoX2xlbjMgPiAxID8gX2xlbjMgLSAxIDogMCksIF9rZXkzID0gMTsgX2tleTMgPCBfbGVuMzsgX2tleTMrKykge1xuICAgICAgICBldmVudHNbX2tleTMgLSAxXSA9IGFyZ3VtZW50c1tfa2V5M107XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5tb3ZlKHRpY2tzKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMuX3NvbmcpIHtcbiAgICAgICAgdmFyIF9zb25nJF9tb3ZlZEV2ZW50czM7XG5cbiAgICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcyk7XG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHMzID0gdGhpcy5fc29uZy5fbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX21vdmVkRXZlbnRzMywgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVFdmVudHNUbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVFdmVudHNUbyh0aWNrcykge1xuICAgICAgZm9yICh2YXIgX2xlbjQgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuNCA+IDEgPyBfbGVuNCAtIDEgOiAwKSwgX2tleTQgPSAxOyBfa2V5NCA8IF9sZW40OyBfa2V5NCsrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5NCAtIDFdID0gYXJndW1lbnRzW19rZXk0XTtcbiAgICAgIH1cblxuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcyk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHM0O1xuXG4gICAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKHRoaXMpO1xuICAgICAgICAoX3NvbmckX21vdmVkRXZlbnRzNCA9IHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9tb3ZlZEV2ZW50czQsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFdmVudHMoKSB7XG4gICAgICB2YXIgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcbiAgICAgIC8vIGNhbiBiZSB1c2UgYXMgZmluZEV2ZW50c1xuICAgICAgaWYgKHRoaXMuX25lZWRzVXBkYXRlKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTsgLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtdXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbXV0ZSgpIHtcbiAgICAgIHZhciBmbGFnID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgaWYgKGZsYWcpIHtcbiAgICAgICAgdGhpcy5tdXRlZCA9IGZsYWc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm11dGVkID0gIXRoaXMubXV0ZWQ7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgaWYgKHRoaXMuX25lZWRzVXBkYXRlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fY3JlYXRlRXZlbnRBcnJheSkge1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpO1xuICAgICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICAoMCwgX3V0aWwuc29ydEV2ZW50cykodGhpcy5fZXZlbnRzKTtcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgICAvL0BUT0RPOiBjYWxjdWxhdGUgcGFydCBzdGFydCBhbmQgZW5kLCBhbmQgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gUGFydDtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlBsYXloZWFkID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3Bvc2l0aW9uID0gcmVxdWlyZSgnLi9wb3NpdGlvbi5qcycpO1xuXG52YXIgX2V2ZW50bGlzdGVuZXIgPSByZXF1aXJlKCcuL2V2ZW50bGlzdGVuZXIuanMnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgcmFuZ2UgPSAxMDsgLy8gbWlsbGlzZWNvbmRzIG9yIHRpY2tzXG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG5cbnZhciBQbGF5aGVhZCA9IGV4cG9ydHMuUGxheWhlYWQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFBsYXloZWFkKHNvbmcpIHtcbiAgICB2YXIgdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICdhbGwnIDogYXJndW1lbnRzWzFdO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBsYXloZWFkKTtcblxuICAgIHRoaXMuaWQgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLnNvbmcgPSBzb25nO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5sYXN0RXZlbnQgPSBudWxsO1xuICAgIHRoaXMuZGF0YSA9IHt9O1xuXG4gICAgdGhpcy5hY3RpdmVQYXJ0cyA9IFtdO1xuICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbXTtcbiAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IFtdO1xuICB9XG5cbiAgLy8gdW5pdCBjYW4gYmUgJ21pbGxpcycgb3IgJ3RpY2tzJ1xuXG5cbiAgX2NyZWF0ZUNsYXNzKFBsYXloZWFkLCBbe1xuICAgIGtleTogJ3NldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldCh1bml0LCB2YWx1ZSkge1xuICAgICAgdGhpcy51bml0ID0gdW5pdDtcbiAgICAgIHRoaXMuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLmV2ZW50SW5kZXggPSAwO1xuICAgICAgdGhpcy5ub3RlSW5kZXggPSAwO1xuICAgICAgdGhpcy5wYXJ0SW5kZXggPSAwO1xuICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcbiAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUodW5pdCwgZGlmZikge1xuICAgICAgaWYgKGRpZmYgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICAgIH1cbiAgICAgIHRoaXMudW5pdCA9IHVuaXQ7XG4gICAgICB0aGlzLmN1cnJlbnRWYWx1ZSArPSBkaWZmO1xuICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcbiAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlU29uZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVNvbmcoKSB7XG4gICAgICB0aGlzLmV2ZW50cyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5zb25nLl9ldmVudHMpLCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5zb25nLl90aW1lRXZlbnRzKSk7XG4gICAgICAoMCwgX3V0aWwuc29ydEV2ZW50cykodGhpcy5ldmVudHMpO1xuICAgICAgLy9jb25zb2xlLmxvZygnZXZlbnRzICVPJywgdGhpcy5ldmVudHMpXG4gICAgICB0aGlzLm5vdGVzID0gdGhpcy5zb25nLl9ub3RlcztcbiAgICAgIHRoaXMucGFydHMgPSB0aGlzLnNvbmcuX3BhcnRzO1xuICAgICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGg7XG4gICAgICB0aGlzLm51bU5vdGVzID0gdGhpcy5ub3Rlcy5sZW5ndGg7XG4gICAgICB0aGlzLm51bVBhcnRzID0gdGhpcy5wYXJ0cy5sZW5ndGg7XG4gICAgICB0aGlzLnNldCgnbWlsbGlzJywgdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjYWxjdWxhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjYWxjdWxhdGUoKSB7XG4gICAgICB2YXIgaSA9IHZvaWQgMDtcbiAgICAgIHZhciB2YWx1ZSA9IHZvaWQgMDtcbiAgICAgIHZhciBldmVudCA9IHZvaWQgMDtcbiAgICAgIHZhciBub3RlID0gdm9pZCAwO1xuICAgICAgdmFyIHBhcnQgPSB2b2lkIDA7XG4gICAgICB2YXIgcG9zaXRpb24gPSB2b2lkIDA7XG4gICAgICB2YXIgc3RpbGxBY3RpdmVOb3RlcyA9IFtdO1xuICAgICAgdmFyIHN0aWxsQWN0aXZlUGFydHMgPSBbXTtcbiAgICAgIHZhciBjb2xsZWN0ZWRQYXJ0cyA9IG5ldyBTZXQoKTtcbiAgICAgIHZhciBjb2xsZWN0ZWROb3RlcyA9IG5ldyBTZXQoKTtcblxuICAgICAgdGhpcy5kYXRhID0ge307XG4gICAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IFtdO1xuICAgICAgdmFyIHN1c3RhaW5wZWRhbEV2ZW50cyA9IFtdO1xuXG4gICAgICBmb3IgKGkgPSB0aGlzLmV2ZW50SW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKSB7XG4gICAgICAgIGV2ZW50ID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAgIHZhbHVlID0gZXZlbnRbdGhpcy51bml0XTtcbiAgICAgICAgaWYgKHZhbHVlIDw9IHRoaXMuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgLy8gaWYgdGhlIHBsYXloZWFkIGlzIHNldCB0byBhIHBvc2l0aW9uIG9mIHNheSAzMDAwIG1pbGxpcywgd2UgZG9uJ3Qgd2FudCB0byBhZGQgZXZlbnRzIG1vcmUgdGhhdCAxMCB1bml0cyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgICAgaWYgKHZhbHVlID09PSAwIHx8IHZhbHVlID4gdGhpcy5jdXJyZW50VmFsdWUgLSByYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVFdmVudHMucHVzaChldmVudCk7XG4gICAgICAgICAgICAvLyB0aGlzIGRvZXNuJ3Qgd29yayB0b28gd2VsbFxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IDE3Nikge1xuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMilcbiAgICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGExID09PSA2NCkge1xuICAgICAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsMicsXG4gICAgICAgICAgICAgICAgICBkYXRhOiBldmVudC5kYXRhMiA9PT0gMTI3ID8gJ2Rvd24nIDogJ3VwJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN1c3RhaW5wZWRhbEV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyB9ZWxzZXtcbiAgICAgICAgICAgICAgLy8gICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgICAgLy8gICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgICAgIC8vICAgICBkYXRhOiBldmVudFxuICAgICAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5sYXN0RXZlbnQgPSBldmVudDtcbiAgICAgICAgICB0aGlzLmV2ZW50SW5kZXgrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbGV0IG51bSA9IHN1c3RhaW5wZWRhbEV2ZW50cy5sZW5ndGhcbiAgICAgIC8vIGlmKG51bSA+IDApe1xuICAgICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRWYWx1ZSwgbnVtLCBzdXN0YWlucGVkYWxFdmVudHNbbnVtIC0gMV0uZGF0YTIsIHN1c3RhaW5wZWRhbEV2ZW50cylcbiAgICAgIC8vIH1cblxuICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgICAgdGhpcy5kYXRhLmFjdGl2ZUV2ZW50cyA9IHRoaXMuYWN0aXZlRXZlbnRzO1xuXG4gICAgICAvLyBpZiBhIHNvbmcgaGFzIG5vIGV2ZW50cyB5ZXQsIHVzZSB0aGUgZmlyc3QgdGltZSBldmVudCBhcyByZWZlcmVuY2VcbiAgICAgIGlmICh0aGlzLmxhc3RFdmVudCA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxhc3RFdmVudCA9IHRoaXMuc29uZy5fdGltZUV2ZW50c1swXTtcbiAgICAgIH1cblxuICAgICAgcG9zaXRpb24gPSAoMCwgX3Bvc2l0aW9uLmdldFBvc2l0aW9uMikodGhpcy5zb25nLCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlLCAnYWxsJywgdGhpcy5sYXN0RXZlbnQpO1xuICAgICAgdGhpcy5kYXRhLmV2ZW50SW5kZXggPSB0aGlzLmV2ZW50SW5kZXg7XG4gICAgICB0aGlzLmRhdGEubWlsbGlzID0gcG9zaXRpb24ubWlsbGlzO1xuICAgICAgdGhpcy5kYXRhLnRpY2tzID0gcG9zaXRpb24udGlja3M7XG4gICAgICB0aGlzLmRhdGEucG9zaXRpb24gPSBwb3NpdGlvbjtcblxuICAgICAgaWYgKHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IE9iamVjdC5rZXlzKHBvc2l0aW9uKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgICAgZGF0YVtrZXldID0gcG9zaXRpb25ba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZS5pbmRleE9mKCdiYXJzYmVhdHMnKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5kYXRhLmJhciA9IHBvc2l0aW9uLmJhcjtcbiAgICAgICAgdGhpcy5kYXRhLmJlYXQgPSBwb3NpdGlvbi5iZWF0O1xuICAgICAgICB0aGlzLmRhdGEuc2l4dGVlbnRoID0gcG9zaXRpb24uc2l4dGVlbnRoO1xuICAgICAgICB0aGlzLmRhdGEudGljayA9IHBvc2l0aW9uLnRpY2s7XG4gICAgICAgIHRoaXMuZGF0YS5iYXJzQXNTdHJpbmcgPSBwb3NpdGlvbi5iYXJzQXNTdHJpbmc7XG5cbiAgICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmFyID0gcG9zaXRpb24udGlja3NQZXJCYXI7XG4gICAgICAgIHRoaXMuZGF0YS50aWNrc1BlckJlYXQgPSBwb3NpdGlvbi50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRoaXMuZGF0YS50aWNrc1BlclNpeHRlZW50aCA9IHBvc2l0aW9uLnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICB0aGlzLmRhdGEubnVtU2l4dGVlbnRoID0gcG9zaXRpb24ubnVtU2l4dGVlbnRoO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUuaW5kZXhPZigndGltZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRhdGEuaG91ciA9IHBvc2l0aW9uLmhvdXI7XG4gICAgICAgIHRoaXMuZGF0YS5taW51dGUgPSBwb3NpdGlvbi5taW51dGU7XG4gICAgICAgIHRoaXMuZGF0YS5zZWNvbmQgPSBwb3NpdGlvbi5zZWNvbmQ7XG4gICAgICAgIHRoaXMuZGF0YS5taWxsaXNlY29uZCA9IHBvc2l0aW9uLm1pbGxpc2Vjb25kO1xuICAgICAgICB0aGlzLmRhdGEudGltZUFzU3RyaW5nID0gcG9zaXRpb24udGltZUFzU3RyaW5nO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUuaW5kZXhPZigncGVyY2VudGFnZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRhdGEucGVyY2VudGFnZSA9IHBvc2l0aW9uLnBlcmNlbnRhZ2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBhY3RpdmUgbm90ZXNcbiAgICAgIGlmICh0aGlzLnR5cGUuaW5kZXhPZignbm90ZXMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSkge1xuXG4gICAgICAgIC8vIGdldCBhbGwgbm90ZXMgYmV0d2VlbiB0aGUgbm90ZUluZGV4IGFuZCB0aGUgY3VycmVudCBwbGF5aGVhZCBwb3NpdGlvblxuICAgICAgICBmb3IgKGkgPSB0aGlzLm5vdGVJbmRleDsgaSA8IHRoaXMubnVtTm90ZXM7IGkrKykge1xuICAgICAgICAgIG5vdGUgPSB0aGlzLm5vdGVzW2ldO1xuICAgICAgICAgIHZhbHVlID0gbm90ZS5ub3RlT25bdGhpcy51bml0XTtcbiAgICAgICAgICBpZiAodmFsdWUgPD0gdGhpcy5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMubm90ZUluZGV4Kys7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiB0aGUgcGxheWhlYWQgaXMgc2V0IHRvIGEgcG9zaXRpb24gb2Ygc2F5IDMwMDAgbWlsbGlzLCB3ZSBkb24ndCB3YW50IHRvIGFkZCBub3RlcyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50VmFsdWUgPT09IDAgfHwgbm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgICBjb2xsZWN0ZWROb3Rlcy5hZGQobm90ZSk7XG4gICAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ25vdGVPbicsXG4gICAgICAgICAgICAgICAgZGF0YTogbm90ZS5ub3RlT25cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpbHRlciBub3RlcyB0aGF0IGFyZSBubyBsb25nZXIgYWN0aXZlXG4gICAgICAgIGZvciAoaSA9IHRoaXMuYWN0aXZlTm90ZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBub3RlID0gdGhpcy5hY3RpdmVOb3Rlc1tpXTtcbiAgICAgICAgICAvL2lmKG5vdGUubm90ZU9uLnN0YXRlLmluZGV4T2YoJ3JlbW92ZWQnKSA9PT0gMCB8fCB0aGlzLnNvbmcuX25vdGVzQnlJZC5nZXQobm90ZS5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgICBpZiAodGhpcy5zb25nLl9ub3Rlc0J5SWQuZ2V0KG5vdGUuaWQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc2tpcHBpbmcgcmVtb3ZlZCBub3RlJywgbm90ZS5pZCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybignbm90ZSB3aXRoIGlkJywgbm90ZS5pZCwgJ2hhcyBubyBub3RlT2ZmIGV2ZW50Jyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL2lmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkTm90ZXMuaGFzKG5vdGUpID09PSBmYWxzZSl7XG4gICAgICAgICAgaWYgKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHN0aWxsQWN0aXZlTm90ZXMucHVzaChub3RlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICAgICAgdHlwZTogJ25vdGVPZmYnLFxuICAgICAgICAgICAgICBkYXRhOiBub3RlLm5vdGVPZmZcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCB0aGUgc3RpbGwgYWN0aXZlIG5vdGVzIGFuZCB0aGUgbmV3bHkgYWN0aXZlIGV2ZW50cyB0byB0aGUgYWN0aXZlIG5vdGVzIGFycmF5XG4gICAgICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KGNvbGxlY3RlZE5vdGVzLnZhbHVlcygpKSwgc3RpbGxBY3RpdmVOb3Rlcyk7XG4gICAgICAgIHRoaXMuZGF0YS5hY3RpdmVOb3RlcyA9IHRoaXMuYWN0aXZlTm90ZXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBhY3RpdmUgcGFydHNcbiAgICAgIGlmICh0aGlzLnR5cGUuaW5kZXhPZigncGFydHMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSkge1xuXG4gICAgICAgIGZvciAoaSA9IHRoaXMucGFydEluZGV4OyBpIDwgdGhpcy5udW1QYXJ0czsgaSsrKSB7XG4gICAgICAgICAgcGFydCA9IHRoaXMucGFydHNbaV07XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJ0LCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICBpZiAocGFydC5fc3RhcnRbdGhpcy51bml0XSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgY29sbGVjdGVkUGFydHMuYWRkKHBhcnQpO1xuICAgICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICAgICAgdHlwZTogJ3BhcnRPbicsXG4gICAgICAgICAgICAgIGRhdGE6IHBhcnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5wYXJ0SW5kZXgrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmlsdGVyIHBhcnRzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgICAgZm9yIChpID0gdGhpcy5hY3RpdmVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHBhcnQgPSB0aGlzLmFjdGl2ZVBhcnRzW2ldO1xuICAgICAgICAgIC8vaWYocGFydC5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9wYXJ0c0J5SWQuZ2V0KHBhcnQuaWQpID09PSBmYWxzZSl7XG4gICAgICAgICAgaWYgKHRoaXMuc29uZy5fcGFydHNCeUlkLmdldChwYXJ0LmlkKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgcGFydCcsIHBhcnQuaWQpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9pZihwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlICYmIGNvbGxlY3RlZFBhcnRzLmhhcyhwYXJ0KSA9PT0gZmFsc2Upe1xuICAgICAgICAgIGlmIChwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICBzdGlsbEFjdGl2ZVBhcnRzLnB1c2gobm90ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdwYXJ0T2ZmJyxcbiAgICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3RpdmVQYXJ0cyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoY29sbGVjdGVkUGFydHMudmFsdWVzKCkpLCBzdGlsbEFjdGl2ZVBhcnRzKTtcbiAgICAgICAgdGhpcy5kYXRhLmFjdGl2ZVBhcnRzID0gdGhpcy5hY3RpdmVQYXJ0cztcbiAgICAgIH1cblxuICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAgc2V0VHlwZSh0KXtcbiAgICAgICAgdGhpcy50eXBlID0gdDtcbiAgICAgICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gICAgICB9XG4gICAgXG4gICAgXG4gICAgICBhZGRUeXBlKHQpe1xuICAgICAgICB0aGlzLnR5cGUgKz0gJyAnICsgdDtcbiAgICAgICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gICAgICB9XG4gICAgXG4gICAgICByZW1vdmVUeXBlKHQpe1xuICAgICAgICB2YXIgYXJyID0gdGhpcy50eXBlLnNwbGl0KCcgJyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICcnO1xuICAgICAgICBhcnIuZm9yRWFjaChmdW5jdGlvbih0eXBlKXtcbiAgICAgICAgICBpZih0eXBlICE9PSB0KXtcbiAgICAgICAgICAgIHRoaXMudHlwZSArPSB0ICsgJyAnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHlwZS50cmltKCk7XG4gICAgICAgIHRoaXMuc2V0KHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgICAgIH1cbiAgICAqL1xuXG4gIH1dKTtcblxuICByZXR1cm4gUGxheWhlYWQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbmV4cG9ydHMubWlsbGlzVG9UaWNrcyA9IG1pbGxpc1RvVGlja3M7XG5leHBvcnRzLnRpY2tzVG9NaWxsaXMgPSB0aWNrc1RvTWlsbGlzO1xuZXhwb3J0cy5iYXJzVG9NaWxsaXMgPSBiYXJzVG9NaWxsaXM7XG5leHBvcnRzLmJhcnNUb1RpY2tzID0gYmFyc1RvVGlja3M7XG5leHBvcnRzLnRpY2tzVG9CYXJzID0gdGlja3NUb0JhcnM7XG5leHBvcnRzLm1pbGxpc1RvQmFycyA9IG1pbGxpc1RvQmFycztcbmV4cG9ydHMuZ2V0UG9zaXRpb24yID0gZ2V0UG9zaXRpb24yO1xuZXhwb3J0cy5jYWxjdWxhdGVQb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIHN1cHBvcnRlZFR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlJyxcbiAgICBzdXBwb3J0ZWRSZXR1cm5UeXBlcyA9ICdiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIGFsbCcsXG4gICAgZmxvb3IgPSBNYXRoLmZsb29yLFxuICAgIHJvdW5kID0gTWF0aC5yb3VuZDtcblxudmFyXG4vL2xvY2FsXG5icG0gPSB2b2lkIDAsXG4gICAgbm9taW5hdG9yID0gdm9pZCAwLFxuICAgIGRlbm9taW5hdG9yID0gdm9pZCAwLFxuICAgIHRpY2tzUGVyQmVhdCA9IHZvaWQgMCxcbiAgICB0aWNrc1BlckJhciA9IHZvaWQgMCxcbiAgICB0aWNrc1BlclNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICBtaWxsaXNQZXJUaWNrID0gdm9pZCAwLFxuICAgIHNlY29uZHNQZXJUaWNrID0gdm9pZCAwLFxuICAgIG51bVNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICB0aWNrcyA9IHZvaWQgMCxcbiAgICBtaWxsaXMgPSB2b2lkIDAsXG4gICAgZGlmZlRpY2tzID0gdm9pZCAwLFxuICAgIGRpZmZNaWxsaXMgPSB2b2lkIDAsXG4gICAgYmFyID0gdm9pZCAwLFxuICAgIGJlYXQgPSB2b2lkIDAsXG4gICAgc2l4dGVlbnRoID0gdm9pZCAwLFxuICAgIHRpY2sgPSB2b2lkIDAsXG5cblxuLy8gIHR5cGUsXG5pbmRleCA9IHZvaWQgMCxcbiAgICByZXR1cm5UeXBlID0gJ2FsbCcsXG4gICAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcblxuZnVuY3Rpb24gZ2V0VGltZUV2ZW50KHNvbmcsIHVuaXQsIHRhcmdldCkge1xuICAvLyBmaW5kcyB0aGUgdGltZSBldmVudCB0aGF0IGNvbWVzIHRoZSBjbG9zZXN0IGJlZm9yZSB0aGUgdGFyZ2V0IHBvc2l0aW9uXG4gIHZhciB0aW1lRXZlbnRzID0gc29uZy5fdGltZUV2ZW50cztcbiAgLy9jb25zb2xlLmxvZyhzb25nLl90aW1lRXZlbnRzLCB1bml0LCB0YXJnZXQpXG5cbiAgZm9yICh2YXIgaSA9IHRpbWVFdmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgZXZlbnQgPSB0aW1lRXZlbnRzW2ldO1xuICAgIC8vY29uc29sZS5sb2codW5pdCwgdGFyZ2V0LCBldmVudClcbiAgICBpZiAoZXZlbnRbdW5pdF0gPD0gdGFyZ2V0KSB7XG4gICAgICBpbmRleCA9IGk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBtaWxsaXNUb1RpY2tzKHNvbmcsIHRhcmdldE1pbGxpcykge1xuICB2YXIgYmVvcyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBhcmd1bWVudHNbMl07XG5cbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvcztcbiAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXRNaWxsaXMpO1xuICAvL3JldHVybiByb3VuZCh0aWNrcyk7XG4gIHJldHVybiB0aWNrcztcbn1cblxuZnVuY3Rpb24gdGlja3NUb01pbGxpcyhzb25nLCB0YXJnZXRUaWNrcykge1xuICB2YXIgYmVvcyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBhcmd1bWVudHNbMl07XG5cbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvcztcbiAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldFRpY2tzKTtcbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuZnVuY3Rpb24gYmFyc1RvTWlsbGlzKHNvbmcsIHBvc2l0aW9uLCBiZW9zKSB7XG4gIC8vIGJlb3MgPSBiZXlvbmRFbmRPZlNvbmdcbiAgY2FsY3VsYXRlUG9zaXRpb24oc29uZywge1xuICAgIHR5cGU6ICdiYXJzYmVhdCcsXG4gICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgIHJlc3VsdDogJ21pbGxpcycsXG4gICAgYmVvczogYmVvc1xuICB9KTtcbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuZnVuY3Rpb24gYmFyc1RvVGlja3Moc29uZywgcG9zaXRpb24sIGJlb3MpIHtcbiAgLy8gYmVvcyA9IGJleW9uZEVuZE9mU29uZ1xuICBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgIHJlc3VsdDogJ3RpY2tzJyxcbiAgICBiZW9zOiBiZW9zXG4gIH0pO1xuICAvL3JldHVybiByb3VuZCh0aWNrcyk7XG4gIHJldHVybiB0aWNrcztcbn1cblxuZnVuY3Rpb24gdGlja3NUb0JhcnMoc29uZywgdGFyZ2V0KSB7XG4gIHZhciBiZW9zID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGFyZ3VtZW50c1syXTtcblxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zO1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KTtcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJztcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpO1xufVxuXG5mdW5jdGlvbiBtaWxsaXNUb0JhcnMoc29uZywgdGFyZ2V0KSB7XG4gIHZhciBiZW9zID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGFyZ3VtZW50c1syXTtcblxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zO1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldCk7XG4gIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICByZXR1cm5UeXBlID0gJ2JhcnNhbmRiZWF0cyc7XG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoKTtcbn1cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgbWlsbGlzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldE1pbGxpcywgZXZlbnQpIHtcbiAgdmFyIGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZiAoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSkge1xuICAgIGlmICh0YXJnZXRNaWxsaXMgPiBsYXN0RXZlbnQubWlsbGlzKSB7XG4gICAgICB0YXJnZXRNaWxsaXMgPSBsYXN0RXZlbnQubWlsbGlzO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ21pbGxpcycsIHRhcmdldE1pbGxpcyk7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBleGFjdGx5IGF0IHRhcmdldCBtaWxsaXMsIGNhbGN1bGF0ZSB0aGUgZGlmZlxuICBpZiAoZXZlbnQubWlsbGlzID09PSB0YXJnZXRNaWxsaXMpIHtcbiAgICBkaWZmTWlsbGlzID0gMDtcbiAgICBkaWZmVGlja3MgPSAwO1xuICB9IGVsc2Uge1xuICAgIGRpZmZNaWxsaXMgPSB0YXJnZXRNaWxsaXMgLSBldmVudC5taWxsaXM7XG4gICAgZGlmZlRpY2tzID0gZGlmZk1pbGxpcyAvIG1pbGxpc1BlclRpY2s7XG4gIH1cblxuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuXG4gIHJldHVybiB0aWNrcztcbn1cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgdGlja3MgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21UaWNrcyhzb25nLCB0YXJnZXRUaWNrcywgZXZlbnQpIHtcbiAgdmFyIGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZiAoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSkge1xuICAgIGlmICh0YXJnZXRUaWNrcyA+IGxhc3RFdmVudC50aWNrcykge1xuICAgICAgdGFyZ2V0VGlja3MgPSBsYXN0RXZlbnQudGlja3M7XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAndGlja3MnLCB0YXJnZXRUaWNrcyk7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBleGFjdGx5IGF0IHRhcmdldCB0aWNrcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmIChldmVudC50aWNrcyA9PT0gdGFyZ2V0VGlja3MpIHtcbiAgICBkaWZmVGlja3MgPSAwO1xuICAgIGRpZmZNaWxsaXMgPSAwO1xuICB9IGVsc2Uge1xuICAgIGRpZmZUaWNrcyA9IHRhcmdldFRpY2tzIC0gdGlja3M7XG4gICAgZGlmZk1pbGxpcyA9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG4gIH1cblxuICB0aWNrcyArPSBkaWZmVGlja3M7XG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuXG4gIHJldHVybiBtaWxsaXM7XG59XG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIGJhcnMgYW5kIGJlYXRzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tQmFycyhzb25nLCB0YXJnZXRCYXIsIHRhcmdldEJlYXQsIHRhcmdldFNpeHRlZW50aCwgdGFyZ2V0VGljaykge1xuICB2YXIgZXZlbnQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDUgfHwgYXJndW1lbnRzWzVdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzVdO1xuXG4gIC8vY29uc29sZS50aW1lKCdmcm9tQmFycycpO1xuICB2YXIgaSA9IDAsXG4gICAgICBkaWZmQmFycyA9IHZvaWQgMCxcbiAgICAgIGRpZmZCZWF0cyA9IHZvaWQgMCxcbiAgICAgIGRpZmZTaXh0ZWVudGggPSB2b2lkIDAsXG4gICAgICBkaWZmVGljayA9IHZvaWQgMCxcbiAgICAgIGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZiAoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSkge1xuICAgIGlmICh0YXJnZXRCYXIgPiBsYXN0RXZlbnQuYmFyKSB7XG4gICAgICB0YXJnZXRCYXIgPSBsYXN0RXZlbnQuYmFyO1xuICAgIH1cbiAgfVxuXG4gIGlmIChldmVudCA9PT0gbnVsbCkge1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdiYXInLCB0YXJnZXRCYXIpO1xuICB9XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG4gIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuXG4gIC8vY29ycmVjdCB3cm9uZyBwb3NpdGlvbiBkYXRhLCBmb3IgaW5zdGFuY2U6ICczLDMsMiw3ODgnIGJlY29tZXMgJzMsNCw0LDA2OCcgaW4gYSA0LzQgbWVhc3VyZSBhdCBQUFEgNDgwXG4gIHdoaWxlICh0YXJnZXRUaWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKSB7XG4gICAgdGFyZ2V0U2l4dGVlbnRoKys7XG4gICAgdGFyZ2V0VGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgfVxuXG4gIHdoaWxlICh0YXJnZXRTaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpIHtcbiAgICB0YXJnZXRCZWF0Kys7XG4gICAgdGFyZ2V0U2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgfVxuXG4gIHdoaWxlICh0YXJnZXRCZWF0ID4gbm9taW5hdG9yKSB7XG4gICAgdGFyZ2V0QmFyKys7XG4gICAgdGFyZ2V0QmVhdCAtPSBub21pbmF0b3I7XG4gIH1cblxuICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnYmFyJywgdGFyZ2V0QmFyLCBpbmRleCk7XG4gIGZvciAoaSA9IGluZGV4OyBpID49IDA7IGktLSkge1xuICAgIGV2ZW50ID0gc29uZy5fdGltZUV2ZW50c1tpXTtcbiAgICBpZiAoZXZlbnQuYmFyIDw9IHRhcmdldEJhcikge1xuICAgICAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBnZXQgdGhlIGRpZmZlcmVuY2VzXG4gIGRpZmZUaWNrID0gdGFyZ2V0VGljayAtIHRpY2s7XG4gIGRpZmZTaXh0ZWVudGggPSB0YXJnZXRTaXh0ZWVudGggLSBzaXh0ZWVudGg7XG4gIGRpZmZCZWF0cyA9IHRhcmdldEJlYXQgLSBiZWF0O1xuICBkaWZmQmFycyA9IHRhcmdldEJhciAtIGJhcjsgLy9iYXIgaXMgYWx3YXlzIGxlc3MgdGhlbiBvciBlcXVhbCB0byB0YXJnZXRCYXIsIHNvIGRpZmZCYXJzIGlzIGFsd2F5cyA+PSAwXG5cbiAgLy9jb25zb2xlLmxvZygnZGlmZicsZGlmZkJhcnMsZGlmZkJlYXRzLGRpZmZTaXh0ZWVudGgsZGlmZlRpY2spO1xuICAvL2NvbnNvbGUubG9nKCdtaWxsaXMnLG1pbGxpcyx0aWNrc1BlckJhcix0aWNrc1BlckJlYXQsdGlja3NQZXJTaXh0ZWVudGgsbWlsbGlzUGVyVGljayk7XG5cbiAgLy8gY29udmVydCBkaWZmZXJlbmNlcyB0byBtaWxsaXNlY29uZHMgYW5kIHRpY2tzXG4gIGRpZmZNaWxsaXMgPSBkaWZmQmFycyAqIHRpY2tzUGVyQmFyICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSBkaWZmQmVhdHMgKiB0aWNrc1BlckJlYXQgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IGRpZmZTaXh0ZWVudGggKiB0aWNrc1BlclNpeHRlZW50aCAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gZGlmZlRpY2sgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgLy9jb25zb2xlLmxvZyhkaWZmQmFycywgdGlja3NQZXJCYXIsIG1pbGxpc1BlclRpY2ssIGRpZmZNaWxsaXMsIGRpZmZUaWNrcyk7XG5cbiAgLy8gc2V0IGFsbCBjdXJyZW50IHBvc2l0aW9uIGRhdGFcbiAgYmFyID0gdGFyZ2V0QmFyO1xuICBiZWF0ID0gdGFyZ2V0QmVhdDtcbiAgc2l4dGVlbnRoID0gdGFyZ2V0U2l4dGVlbnRoO1xuICB0aWNrID0gdGFyZ2V0VGljaztcbiAgLy9jb25zb2xlLmxvZyh0aWNrLCB0YXJnZXRUaWNrKVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICAvL2NvbnNvbGUubG9nKHRhcmdldEJhciwgdGFyZ2V0QmVhdCwgdGFyZ2V0U2l4dGVlbnRoLCB0YXJnZXRUaWNrLCAnIC0+ICcsIG1pbGxpcyk7XG4gIHRpY2tzICs9IGRpZmZUaWNrcztcblxuICAvL2NvbnNvbGUudGltZUVuZCgnZnJvbUJhcnMnKTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCkge1xuICAvLyBzcHJlYWQgdGhlIGRpZmZlcmVuY2UgaW4gdGljayBvdmVyIGJhcnMsIGJlYXRzIGFuZCBzaXh0ZWVudGhcbiAgdmFyIHRtcCA9IHJvdW5kKGRpZmZUaWNrcyk7XG4gIHdoaWxlICh0bXAgPj0gdGlja3NQZXJTaXh0ZWVudGgpIHtcbiAgICBzaXh0ZWVudGgrKztcbiAgICB0bXAgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgd2hpbGUgKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCkge1xuICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgIGJlYXQrKztcbiAgICAgIHdoaWxlIChiZWF0ID4gbm9taW5hdG9yKSB7XG4gICAgICAgIGJlYXQgLT0gbm9taW5hdG9yO1xuICAgICAgICBiYXIrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdGljayA9IHJvdW5kKHRtcCk7XG59XG5cbi8vIHN0b3JlIHByb3BlcnRpZXMgb2YgZXZlbnQgaW4gbG9jYWwgc2NvcGVcbmZ1bmN0aW9uIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpIHtcblxuICBicG0gPSBldmVudC5icG07XG4gIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcblxuICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgLy9jb25zb2xlLmxvZyhicG0sIGV2ZW50LnR5cGUpO1xuICAvL2NvbnNvbGUubG9nKCd0aWNrcycsIHRpY2tzLCAnbWlsbGlzJywgbWlsbGlzLCAnYmFyJywgYmFyKTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9zaXRpb25EYXRhKHNvbmcpIHtcbiAgdmFyIHRpbWVEYXRhID0gdm9pZCAwLFxuICAgICAgcG9zaXRpb25EYXRhID0ge307XG5cbiAgc3dpdGNoIChyZXR1cm5UeXBlKSB7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgLy9wb3NpdGlvbkRhdGEubWlsbGlzID0gbWlsbGlzO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpcyA9IHJvdW5kKG1pbGxpcyAqIDEwMDApIC8gMTAwMDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNSb3VuZGVkID0gcm91bmQobWlsbGlzKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3MgPSB0aWNrcztcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrcyA9IHJvdW5kKHRpY2tzKTtcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzVW5yb3VuZGVkID0gdGlja3M7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXIgPSBiYXI7XG4gICAgICBwb3NpdGlvbkRhdGEuYmVhdCA9IGJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2sgPSB0aWNrO1xuICAgICAgLy9wb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2tBc1N0cmluZztcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgZ2V0VGlja0FzU3RyaW5nKHRpY2spO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIHRpbWVEYXRhID0gKDAsIF91dGlsLmdldE5pY2VUaW1lKShtaWxsaXMpO1xuICAgICAgcG9zaXRpb25EYXRhLmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2FsbCc6XG4gICAgICAvLyBtaWxsaXNcbiAgICAgIC8vcG9zaXRpb25EYXRhLm1pbGxpcyA9IG1pbGxpcztcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXMgPSByb3VuZChtaWxsaXMgKiAxMDAwKSAvIDEwMDA7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUm91bmRlZCA9IHJvdW5kKG1pbGxpcyk7XG5cbiAgICAgIC8vIHRpY2tzXG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrcyA9IHRpY2tzO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzID0gcm91bmQodGlja3MpO1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3NVbnJvdW5kZWQgPSB0aWNrcztcblxuICAgICAgLy8gYmFyc2JlYXRzXG4gICAgICBwb3NpdGlvbkRhdGEuYmFyID0gYmFyO1xuICAgICAgcG9zaXRpb25EYXRhLmJlYXQgPSBiZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrID0gdGljaztcbiAgICAgIC8vcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIGdldFRpY2tBc1N0cmluZyh0aWNrKTtcblxuICAgICAgLy8gdGltZVxuICAgICAgdGltZURhdGEgPSAoMCwgX3V0aWwuZ2V0TmljZVRpbWUpKG1pbGxpcyk7XG4gICAgICBwb3NpdGlvbkRhdGEuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gICAgICBwb3NpdGlvbkRhdGEubWludXRlID0gdGltZURhdGEubWludXRlO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcblxuICAgICAgLy8gZXh0cmEgZGF0YVxuICAgICAgcG9zaXRpb25EYXRhLmJwbSA9IHJvdW5kKGJwbSAqIHNvbmcucGxheWJhY2tTcGVlZCwgMyk7XG4gICAgICBwb3NpdGlvbkRhdGEubm9taW5hdG9yID0gbm9taW5hdG9yO1xuICAgICAgcG9zaXRpb25EYXRhLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyQmVhdCA9IHRpY2tzUGVyQmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gICAgICBwb3NpdGlvbkRhdGEubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgIC8vIHVzZSB0aWNrcyB0byBtYWtlIHRlbXBvIGNoYW5nZXMgdmlzaWJsZSBieSBhIGZhc3RlciBtb3ZpbmcgcGxheWhlYWRcbiAgICAgIHBvc2l0aW9uRGF0YS5wZXJjZW50YWdlID0gdGlja3MgLyBzb25nLl9kdXJhdGlvblRpY2tzO1xuICAgICAgLy9wb3NpdGlvbkRhdGEucGVyY2VudGFnZSA9IG1pbGxpcyAvIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gcG9zaXRpb25EYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRUaWNrQXNTdHJpbmcodCkge1xuICBpZiAodCA9PT0gMCkge1xuICAgIHQgPSAnMDAwJztcbiAgfSBlbHNlIGlmICh0IDwgMTApIHtcbiAgICB0ID0gJzAwJyArIHQ7XG4gIH0gZWxzZSBpZiAodCA8IDEwMCkge1xuICAgIHQgPSAnMCcgKyB0O1xuICB9XG4gIHJldHVybiB0O1xufVxuXG4vLyB1c2VkIGJ5IHBsYXloZWFkXG5mdW5jdGlvbiBnZXRQb3NpdGlvbjIoc29uZywgdW5pdCwgdGFyZ2V0LCB0eXBlLCBldmVudCkge1xuICBpZiAodW5pdCA9PT0gJ21pbGxpcycpIHtcbiAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldCwgZXZlbnQpO1xuICB9IGVsc2UgaWYgKHVuaXQgPT09ICd0aWNrcycpIHtcbiAgICBmcm9tVGlja3Moc29uZywgdGFyZ2V0LCBldmVudCk7XG4gIH1cbiAgcmV0dXJuVHlwZSA9IHR5cGU7XG4gIGlmIChyZXR1cm5UeXBlID09PSAnYWxsJykge1xuICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICB9XG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG59XG5cbi8vIGltcHJvdmVkIHZlcnNpb24gb2YgZ2V0UG9zaXRpb25cbmZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHNldHRpbmdzKSB7XG4gIHZhciB0eXBlID0gc2V0dGluZ3MudHlwZTtcbiAgdmFyIC8vIGFueSBvZiBiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIHBlcmMgcGVyY2VudGFnZVxuICB0YXJnZXQgPSBzZXR0aW5ncy50YXJnZXQ7XG4gIHZhciBfc2V0dGluZ3MkcmVzdWx0ID0gc2V0dGluZ3MucmVzdWx0O1xuICB2YXIgcmVzdWx0ID0gX3NldHRpbmdzJHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gJ2FsbCcgOiBfc2V0dGluZ3MkcmVzdWx0O1xuICB2YXIgX3NldHRpbmdzJGJlb3MgPSBzZXR0aW5ncy5iZW9zO1xuICB2YXIgYmVvcyA9IF9zZXR0aW5ncyRiZW9zID09PSB1bmRlZmluZWQgPyB0cnVlIDogX3NldHRpbmdzJGJlb3M7XG4gIHZhciBfc2V0dGluZ3Mkc25hcCA9IHNldHRpbmdzLnNuYXA7XG4gIHZhciBzbmFwID0gX3NldHRpbmdzJHNuYXAgPT09IHVuZGVmaW5lZCA/IC0xIDogX3NldHRpbmdzJHNuYXA7XG5cblxuICBpZiAoc3VwcG9ydGVkUmV0dXJuVHlwZXMuaW5kZXhPZihyZXN1bHQpID09PSAtMSkge1xuICAgIGNvbnNvbGUud2FybigndW5zdXBwb3J0ZWQgcmV0dXJuIHR5cGUsIFxcJ2FsbFxcJyB1c2VkIGluc3RlYWQgb2YgXFwnJyArIHJlc3VsdCArICdcXCcnKTtcbiAgICByZXN1bHQgPSAnYWxsJztcbiAgfVxuXG4gIHJldHVyblR5cGUgPSByZXN1bHQ7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3M7XG5cbiAgaWYgKHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgY29uc29sZS5lcnJvcigndW5zdXBwb3J0ZWQgdHlwZSAnICsgdHlwZSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3dpdGNoICh0eXBlKSB7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICB2YXIgX3RhcmdldCA9IF9zbGljZWRUb0FycmF5KHRhcmdldCwgNCk7XG5cbiAgICAgIHZhciBfdGFyZ2V0JCA9IF90YXJnZXRbMF07XG4gICAgICB2YXIgdGFyZ2V0YmFyID0gX3RhcmdldCQgPT09IHVuZGVmaW5lZCA/IDEgOiBfdGFyZ2V0JDtcbiAgICAgIHZhciBfdGFyZ2V0JDIgPSBfdGFyZ2V0WzFdO1xuICAgICAgdmFyIHRhcmdldGJlYXQgPSBfdGFyZ2V0JDIgPT09IHVuZGVmaW5lZCA/IDEgOiBfdGFyZ2V0JDI7XG4gICAgICB2YXIgX3RhcmdldCQzID0gX3RhcmdldFsyXTtcbiAgICAgIHZhciB0YXJnZXRzaXh0ZWVudGggPSBfdGFyZ2V0JDMgPT09IHVuZGVmaW5lZCA/IDEgOiBfdGFyZ2V0JDM7XG4gICAgICB2YXIgX3RhcmdldCQ0ID0gX3RhcmdldFszXTtcbiAgICAgIHZhciB0YXJnZXR0aWNrID0gX3RhcmdldCQ0ID09PSB1bmRlZmluZWQgPyAwIDogX3RhcmdldCQ0O1xuICAgICAgLy9jb25zb2xlLmxvZyh0YXJnZXRiYXIsIHRhcmdldGJlYXQsIHRhcmdldHNpeHRlZW50aCwgdGFyZ2V0dGljaylcblxuICAgICAgZnJvbUJhcnMoc29uZywgdGFyZ2V0YmFyLCB0YXJnZXRiZWF0LCB0YXJnZXRzaXh0ZWVudGgsIHRhcmdldHRpY2spO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuXG4gICAgICB2YXIgX3RhcmdldDIgPSBfc2xpY2VkVG9BcnJheSh0YXJnZXQsIDQpO1xuXG4gICAgICB2YXIgX3RhcmdldDIkID0gX3RhcmdldDJbMF07XG4gICAgICB2YXIgdGFyZ2V0aG91ciA9IF90YXJnZXQyJCA9PT0gdW5kZWZpbmVkID8gMCA6IF90YXJnZXQyJDtcbiAgICAgIHZhciBfdGFyZ2V0MiQyID0gX3RhcmdldDJbMV07XG4gICAgICB2YXIgdGFyZ2V0bWludXRlID0gX3RhcmdldDIkMiA9PT0gdW5kZWZpbmVkID8gMCA6IF90YXJnZXQyJDI7XG4gICAgICB2YXIgX3RhcmdldDIkMyA9IF90YXJnZXQyWzJdO1xuICAgICAgdmFyIHRhcmdldHNlY29uZCA9IF90YXJnZXQyJDMgPT09IHVuZGVmaW5lZCA/IDAgOiBfdGFyZ2V0MiQzO1xuICAgICAgdmFyIF90YXJnZXQyJDQgPSBfdGFyZ2V0MlszXTtcbiAgICAgIHZhciB0YXJnZXRtaWxsaXNlY29uZCA9IF90YXJnZXQyJDQgPT09IHVuZGVmaW5lZCA/IDAgOiBfdGFyZ2V0MiQ0O1xuXG4gICAgICB2YXIgbWlsbGlzID0gMDtcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRob3VyICogNjAgKiA2MCAqIDEwMDA7IC8vaG91cnNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRtaW51dGUgKiA2MCAqIDEwMDA7IC8vbWludXRlc1xuICAgICAgbWlsbGlzICs9IHRhcmdldHNlY29uZCAqIDEwMDA7IC8vc2Vjb25kc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbGxpc2Vjb25kOyAvL21pbGxpc2Vjb25kc1xuXG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgLy9jb25zb2xlLmxvZyhzb25nLCB0YXJnZXQpXG4gICAgICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHRhcmdldCAqIHNvbmcuX2R1cmF0aW9uVGlja3M7IC8vIHRhcmdldCBtdXN0IGJlIGluIHRpY2tzIVxuICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcywgc29uZy5fZHVyYXRpb25UaWNrcylcbiAgICAgIGlmIChzbmFwICE9PSAtMSkge1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzIC8gc25hcCkgKiBzbmFwO1xuICAgICAgICAvL2Zyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGlja3MpO1xuICAgICAgfVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgdmFyIHRtcCA9IGdldFBvc2l0aW9uRGF0YShzb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXA7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qXG5cbi8vQHBhcmFtOiAnbWlsbGlzJywgMTAwMCwgW3RydWVdXG4vL0BwYXJhbTogJ3RpY2tzJywgMTAwMCwgW3RydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDEsIFsnYWxsJywgdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgNjAsIDQsIDMsIDEyMCwgWydhbGwnLCB0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCA2MCwgNCwgMywgMTIwLCBbdHJ1ZSwgJ2FsbCddXG5cbmZ1bmN0aW9uIGNoZWNrUG9zaXRpb24odHlwZSwgYXJncywgcmV0dXJuVHlwZSA9ICdhbGwnKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcbiAgY29uc29sZS5sb2coJy0tLS0+IGNoZWNrUG9zaXRpb246JywgYXJncywgdHlwZVN0cmluZyhhcmdzKSk7XG5cbiAgaWYodHlwZVN0cmluZyhhcmdzKSA9PT0gJ2FycmF5Jyl7XG4gICAgbGV0XG4gICAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIGksIGEsIHBvc2l0aW9uTGVuZ3RoO1xuXG4gICAgdHlwZSA9IGFyZ3NbMF07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBbWydtaWxsaXMnLCAzMDAwXV1cbiAgICBpZih0eXBlU3RyaW5nKGFyZ3NbMF0pID09PSAnYXJyYXknKXtcbiAgICAgIC8vY29uc29sZS53YXJuKCd0aGlzIHNob3VsZG5cXCd0IGhhcHBlbiEnKTtcbiAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgdHlwZSA9IGFyZ3NbMF07XG4gICAgICBudW1BcmdzID0gYXJncy5sZW5ndGg7XG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBbdHlwZV07XG5cbiAgICBjb25zb2xlLmxvZygnY2hlY2sgcG9zaXRpb24nLCBhcmdzLCBudW1BcmdzLCBzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpKTtcblxuICAgIC8vY29uc29sZS5sb2coJ2FyZycsIDAsICctPicsIHR5cGUpO1xuXG4gICAgaWYoc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSAhPT0gLTEpe1xuICAgICAgZm9yKGkgPSAxOyBpIDwgbnVtQXJnczsgaSsrKXtcbiAgICAgICAgYSA9IGFyZ3NbaV07XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2FyZycsIGksICctPicsIGEpO1xuICAgICAgICBpZihhID09PSB0cnVlIHx8IGEgPT09IGZhbHNlKXtcbiAgICAgICAgICBiZXlvbmRFbmRPZlNvbmcgPSBhO1xuICAgICAgICB9ZWxzZSBpZihpc05hTihhKSl7XG4gICAgICAgICAgaWYoc3VwcG9ydGVkUmV0dXJuVHlwZXMuaW5kZXhPZihhKSAhPT0gLTEpe1xuICAgICAgICAgICAgcmV0dXJuVHlwZSA9IGE7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgcG9zaXRpb24ucHVzaChhKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jaGVjayBudW1iZXIgb2YgYXJndW1lbnRzIC0+IGVpdGhlciAxIG51bWJlciBvciA0IG51bWJlcnMgaW4gcG9zaXRpb24sIGUuZy4gWydiYXJzYmVhdHMnLCAxXSBvciBbJ2JhcnNiZWF0cycsIDEsIDEsIDEsIDBdLFxuICAgICAgLy8gb3IgWydwZXJjJywgMC41NiwgbnVtYmVyT2ZUaWNrc1RvU25hcFRvXVxuICAgICAgcG9zaXRpb25MZW5ndGggPSBwb3NpdGlvbi5sZW5ndGg7XG4gICAgICBpZihwb3NpdGlvbkxlbmd0aCAhPT0gMiAmJiBwb3NpdGlvbkxlbmd0aCAhPT0gMyAmJiBwb3NpdGlvbkxlbmd0aCAhPT0gNSl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2cocG9zaXRpb24sIHJldHVyblR5cGUsIGJleW9uZEVuZE9mU29uZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvc2l0aW9uKHNvbmcsIHR5cGUsIGFyZ3Mpe1xuICAvL2NvbnNvbGUubG9nKCdnZXRQb3NpdGlvbicsIGFyZ3MpO1xuXG4gIGlmKHR5cGVvZiBhcmdzID09PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1pbGxpczogMFxuICAgIH1cbiAgfVxuXG4gIGxldCBwb3NpdGlvbiA9IGNoZWNrUG9zaXRpb24odHlwZSwgYXJncyksXG4gICAgbWlsbGlzLCB0bXAsIHNuYXA7XG5cblxuICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgIGVycm9yKCd3cm9uZyBwb3NpdGlvbiBkYXRhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3dpdGNoKHR5cGUpe1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgZnJvbUJhcnMoc29uZywgcG9zaXRpb25bMV0sIHBvc2l0aW9uWzJdLCBwb3NpdGlvblszXSwgcG9zaXRpb25bNF0pO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAgbWlsbGlzID0gMDtcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzFdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogNjAgKiA2MCAqIDEwMDA7IC8vaG91cnNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzJdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogNjAgKiAxMDAwOyAvL21pbnV0ZXNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzNdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogMTAwMDsgLy9zZWNvbmRzXG4gICAgICB0bXAgPSBwb3NpdGlvbls0XSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcDsgLy9taWxsaXNlY29uZHNcblxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGZyb21NaWxsaXMoc29uZywgcG9zaXRpb25bMV0pO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHBvc2l0aW9uWzFdKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgc25hcCA9IHBvc2l0aW9uWzJdO1xuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvblRpY2tzO1xuICAgICAgaWYoc25hcCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdGlja3MgPSBmbG9vcih0aWNrcy9zbmFwKSAqIHNuYXA7XG4gICAgICAgIC8vZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcyk7XG4gICAgICB9XG4gICAgICBmcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICB0bXAgPSBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdkaWZmJywgcG9zaXRpb25bMV0gLSB0bXAucGVyY2VudGFnZSk7XG4gICAgICByZXR1cm4gdG1wO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuKi8iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLkRlbGF5ID0gZXhwb3J0cy5Db252b2x1dGlvblJldmVyYiA9IGV4cG9ydHMuU2FtcGxlciA9IGV4cG9ydHMuU2ltcGxlU3ludGggPSBleHBvcnRzLkluc3RydW1lbnQgPSBleHBvcnRzLlBhcnQgPSBleHBvcnRzLlRyYWNrID0gZXhwb3J0cy5Tb25nID0gZXhwb3J0cy5NSURJTm90ZSA9IGV4cG9ydHMuTUlESUV2ZW50ID0gZXhwb3J0cy5nZXROb3RlRGF0YSA9IGV4cG9ydHMuZ2V0TUlESU91dHB1dHNCeUlkID0gZXhwb3J0cy5nZXRNSURJSW5wdXRzQnlJZCA9IGV4cG9ydHMuZ2V0TUlESU91dHB1dElkcyA9IGV4cG9ydHMuZ2V0TUlESUlucHV0SWRzID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IGV4cG9ydHMuZ2V0TUlESUlucHV0cyA9IGV4cG9ydHMuZ2V0TUlESUFjY2VzcyA9IGV4cG9ydHMuc2V0TWFzdGVyVm9sdW1lID0gZXhwb3J0cy5nZXRNYXN0ZXJWb2x1bWUgPSBleHBvcnRzLmdldEF1ZGlvQ29udGV4dCA9IGV4cG9ydHMucGFyc2VNSURJRmlsZSA9IGV4cG9ydHMucGFyc2VTYW1wbGVzID0gZXhwb3J0cy5NSURJRXZlbnRUeXBlcyA9IGV4cG9ydHMuZ2V0U2V0dGluZ3MgPSBleHBvcnRzLnVwZGF0ZVNldHRpbmdzID0gZXhwb3J0cy5nZXRHTUluc3RydW1lbnRzID0gZXhwb3J0cy5nZXRJbnN0cnVtZW50cyA9IGV4cG9ydHMuaW5pdCA9IGV4cG9ydHMudmVyc2lvbiA9IHVuZGVmaW5lZDtcblxudmFyIF9zZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKTtcblxudmFyIF9ub3RlID0gcmVxdWlyZSgnLi9ub3RlJyk7XG5cbnZhciBfbWlkaV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaV9ldmVudCcpO1xuXG52YXIgX21pZGlfbm90ZSA9IHJlcXVpcmUoJy4vbWlkaV9ub3RlJyk7XG5cbnZhciBfcGFydCA9IHJlcXVpcmUoJy4vcGFydCcpO1xuXG52YXIgX3RyYWNrID0gcmVxdWlyZSgnLi90cmFjaycpO1xuXG52YXIgX3NvbmcgPSByZXF1aXJlKCcuL3NvbmcnKTtcblxudmFyIF9pbnN0cnVtZW50ID0gcmVxdWlyZSgnLi9pbnN0cnVtZW50Jyk7XG5cbnZhciBfc2FtcGxlciA9IHJlcXVpcmUoJy4vc2FtcGxlcicpO1xuXG52YXIgX3NpbXBsZV9zeW50aCA9IHJlcXVpcmUoJy4vc2ltcGxlX3N5bnRoJyk7XG5cbnZhciBfY29udm9sdXRpb25fcmV2ZXJiID0gcmVxdWlyZSgnLi9jb252b2x1dGlvbl9yZXZlcmInKTtcblxudmFyIF9kZWxheV9meCA9IHJlcXVpcmUoJy4vZGVsYXlfZngnKTtcblxudmFyIF9taWRpZmlsZSA9IHJlcXVpcmUoJy4vbWlkaWZpbGUnKTtcblxudmFyIF9pbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG52YXIgX2luaXRfbWlkaSA9IHJlcXVpcmUoJy4vaW5pdF9taWRpJyk7XG5cbnZhciBfcGFyc2VfYXVkaW8gPSByZXF1aXJlKCcuL3BhcnNlX2F1ZGlvJyk7XG5cbnZhciBfY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcblxudmFyIF9ldmVudGxpc3RlbmVyID0gcmVxdWlyZSgnLi9ldmVudGxpc3RlbmVyJyk7XG5cbnZhciB2ZXJzaW9uID0gJzEuMC4wLWJldGEzMSc7XG5cbnZhciBnZXRBdWRpb0NvbnRleHQgPSBmdW5jdGlvbiBnZXRBdWRpb0NvbnRleHQoKSB7XG4gIHJldHVybiBfaW5pdF9hdWRpby5jb250ZXh0O1xufTtcblxudmFyIHFhbWJpID0ge1xuICB2ZXJzaW9uOiB2ZXJzaW9uLFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICB1cGRhdGVTZXR0aW5nczogX3NldHRpbmdzLnVwZGF0ZVNldHRpbmdzLFxuICBnZXRTZXR0aW5nczogX3NldHRpbmdzLmdldFNldHRpbmdzLFxuXG4gIC8vIGZyb20gLi9ub3RlXG4gIGdldE5vdGVEYXRhOiBfbm90ZS5nZXROb3RlRGF0YSxcblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0OiBfaW5pdC5pbml0LFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICBzZXRCdWZmZXJUaW1lOiBfc2V0dGluZ3Muc2V0QnVmZmVyVGltZSxcblxuICAvLyBmcm9tIC4vY29uc3RhbnRzXG4gIE1JRElFdmVudFR5cGVzOiBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlczogX3BhcnNlX2F1ZGlvLnBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vbWlkaWZpbGVcbiAgcGFyc2VNSURJRmlsZTogX21pZGlmaWxlLnBhcnNlTUlESUZpbGUsXG5cbiAgLy8gZnJvbSAuL2luaXRfYXVkaW9cbiAgZ2V0QXVkaW9Db250ZXh0OiBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZTogX2luaXRfYXVkaW8uZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWU6IF9pbml0X2F1ZGlvLnNldE1hc3RlclZvbHVtZSxcblxuICAvLyAuL2luaXRfbWlkaVxuICBnZXRNSURJQWNjZXNzOiBfaW5pdF9taWRpLmdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHM6IF9pbml0X21pZGkuZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHM6IF9pbml0X21pZGkuZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkczogX2luaXRfbWlkaS5nZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHM6IF9pbml0X21pZGkuZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQ6IF9pbml0X21pZGkuZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZDogX2luaXRfbWlkaS5nZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgZ2V0SW5zdHJ1bWVudHM6IF9zZXR0aW5ncy5nZXRJbnN0cnVtZW50cyxcbiAgZ2V0R01JbnN0cnVtZW50czogX3NldHRpbmdzLmdldEdNSW5zdHJ1bWVudHMsXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiAoMCwgX2V2ZW50bGlzdGVuZXIuYWRkRXZlbnRMaXN0ZW5lcikodHlwZSwgY2FsbGJhY2spO1xuICB9LFxuICByZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKSB7XG4gICAgKDAsIF9ldmVudGxpc3RlbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIpKHR5cGUsIGlkKTtcbiAgfSxcblxuXG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIE1JRElFdmVudDogX21pZGlfZXZlbnQuTUlESUV2ZW50LFxuXG4gIC8vIGZyb20gLi9taWRpX25vdGVcbiAgTUlESU5vdGU6IF9taWRpX25vdGUuTUlESU5vdGUsXG5cbiAgLy8gZnJvbSAuL3NvbmdcbiAgU29uZzogX3NvbmcuU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgVHJhY2s6IF90cmFjay5UcmFjayxcblxuICAvLyBmcm9tIC4vcGFydFxuICBQYXJ0OiBfcGFydC5QYXJ0LFxuXG4gIC8vIGZyb20gLi9pbnN0cnVtZW50XG4gIEluc3RydW1lbnQ6IF9pbnN0cnVtZW50Lkluc3RydW1lbnQsXG5cbiAgLy8gZnJvbSAuL3NpbXBsZV9zeW50aFxuICBTaW1wbGVTeW50aDogX3NpbXBsZV9zeW50aC5TaW1wbGVTeW50aCxcblxuICAvLyBmcm9tIC4vc2FtcGxlclxuICBTYW1wbGVyOiBfc2FtcGxlci5TYW1wbGVyLFxuXG4gIC8vIGZyb20gLi9jb252b2x1dGlvbl9yZXZlcmJcbiAgQ29udm9sdXRpb25SZXZlcmI6IF9jb252b2x1dGlvbl9yZXZlcmIuQ29udm9sdXRpb25SZXZlcmIsXG5cbiAgLy8gZnJvbSAuL2RlbGF5X2Z4XG4gIERlbGF5OiBfZGVsYXlfZnguRGVsYXksXG5cbiAgbG9nOiBmdW5jdGlvbiBsb2coaWQpIHtcbiAgICBzd2l0Y2ggKGlkKSB7XG4gICAgICBjYXNlICdmdW5jdGlvbnMnOlxuICAgICAgICBjb25zb2xlLmxvZygnZnVuY3Rpb25zOlxcbiAgICAgICAgICBnZXRBdWRpb0NvbnRleHRcXG4gICAgICAgICAgZ2V0TWFzdGVyVm9sdW1lXFxuICAgICAgICAgIHNldE1hc3RlclZvbHVtZVxcbiAgICAgICAgICBnZXRNSURJQWNjZXNzXFxuICAgICAgICAgIGdldE1JRElJbnB1dHNcXG4gICAgICAgICAgZ2V0TUlESU91dHB1dHNcXG4gICAgICAgICAgZ2V0TUlESUlucHV0SWRzXFxuICAgICAgICAgIGdldE1JRElPdXRwdXRJZHNcXG4gICAgICAgICAgZ2V0TUlESUlucHV0c0J5SWRcXG4gICAgICAgICAgZ2V0TUlESU91dHB1dHNCeUlkXFxuICAgICAgICAgIHBhcnNlTUlESUZpbGVcXG4gICAgICAgICAgc2V0QnVmZmVyVGltZVxcbiAgICAgICAgICBnZXRJbnN0cnVtZW50c1xcbiAgICAgICAgICBnZXRHTUluc3RydW1lbnRzXFxuICAgICAgICAnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gcWFtYmk7XG5leHBvcnRzLnZlcnNpb24gPSB2ZXJzaW9uO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL2luaXRcbmluaXQgPSBfaW5pdC5pbml0O1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL3NldHRpbmdzXG5nZXRJbnN0cnVtZW50cyA9IF9zZXR0aW5ncy5nZXRJbnN0cnVtZW50cztcbmV4cG9ydHMuZ2V0R01JbnN0cnVtZW50cyA9IF9zZXR0aW5ncy5nZXRHTUluc3RydW1lbnRzO1xuZXhwb3J0cy51cGRhdGVTZXR0aW5ncyA9IF9zZXR0aW5ncy51cGRhdGVTZXR0aW5ncztcbmV4cG9ydHMuZ2V0U2V0dGluZ3MgPSBfc2V0dGluZ3MuZ2V0U2V0dGluZ3M7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vY29uc3RhbnRzXG5NSURJRXZlbnRUeXBlcyA9IF9jb25zdGFudHMuTUlESUV2ZW50VHlwZXM7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vdXRpbFxucGFyc2VTYW1wbGVzID0gX3BhcnNlX2F1ZGlvLnBhcnNlU2FtcGxlcztcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9taWRpZmlsZVxucGFyc2VNSURJRmlsZSA9IF9taWRpZmlsZS5wYXJzZU1JRElGaWxlO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL2luaXRfYXVkaW9cbmdldEF1ZGlvQ29udGV4dCA9IGdldEF1ZGlvQ29udGV4dDtcbmV4cG9ydHMuZ2V0TWFzdGVyVm9sdW1lID0gX2luaXRfYXVkaW8uZ2V0TWFzdGVyVm9sdW1lO1xuZXhwb3J0cy5zZXRNYXN0ZXJWb2x1bWUgPSBfaW5pdF9hdWRpby5zZXRNYXN0ZXJWb2x1bWU7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vaW5pdF9taWRpXG5nZXRNSURJQWNjZXNzID0gX2luaXRfbWlkaS5nZXRNSURJQWNjZXNzO1xuZXhwb3J0cy5nZXRNSURJSW5wdXRzID0gX2luaXRfbWlkaS5nZXRNSURJSW5wdXRzO1xuZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IF9pbml0X21pZGkuZ2V0TUlESU91dHB1dHM7XG5leHBvcnRzLmdldE1JRElJbnB1dElkcyA9IF9pbml0X21pZGkuZ2V0TUlESUlucHV0SWRzO1xuZXhwb3J0cy5nZXRNSURJT3V0cHV0SWRzID0gX2luaXRfbWlkaS5nZXRNSURJT3V0cHV0SWRzO1xuZXhwb3J0cy5nZXRNSURJSW5wdXRzQnlJZCA9IF9pbml0X21pZGkuZ2V0TUlESUlucHV0c0J5SWQ7XG5leHBvcnRzLmdldE1JRElPdXRwdXRzQnlJZCA9IF9pbml0X21pZGkuZ2V0TUlESU91dHB1dHNCeUlkO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL25vdGVcbmdldE5vdGVEYXRhID0gX25vdGUuZ2V0Tm90ZURhdGE7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vbWlkaV9ldmVudFxuTUlESUV2ZW50ID0gX21pZGlfZXZlbnQuTUlESUV2ZW50O1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL21pZGlfbm90ZVxuTUlESU5vdGUgPSBfbWlkaV9ub3RlLk1JRElOb3RlO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL3NvbmdcblNvbmcgPSBfc29uZy5Tb25nO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL3RyYWNrXG5UcmFjayA9IF90cmFjay5UcmFjaztcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9wYXJ0XG5QYXJ0ID0gX3BhcnQuUGFydDtcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9pbnN0cnVtZW50XG5JbnN0cnVtZW50ID0gX2luc3RydW1lbnQuSW5zdHJ1bWVudDtcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9zaW1wbGVfc3ludGhcblNpbXBsZVN5bnRoID0gX3NpbXBsZV9zeW50aC5TaW1wbGVTeW50aDtcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9zYW1wbGVyXG5TYW1wbGVyID0gX3NhbXBsZXIuU2FtcGxlcjtcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9jb252b2x1dGlvbl9yZXZlcmJcbkNvbnZvbHV0aW9uUmV2ZXJiID0gX2NvbnZvbHV0aW9uX3JldmVyYi5Db252b2x1dGlvblJldmVyYjtcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9kZWxheV9meFxuRGVsYXkgPSBfZGVsYXlfZnguRGVsYXk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5TYW1wbGUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmV4cG9ydHMuZmFkZU91dCA9IGZhZGVPdXQ7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpby5qcycpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFNhbXBsZSA9IGV4cG9ydHMuU2FtcGxlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTYW1wbGUoc2FtcGxlRGF0YSwgZXZlbnQpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2FtcGxlKTtcblxuICAgIHRoaXMuZXZlbnQgPSBldmVudDtcbiAgICB0aGlzLnNhbXBsZURhdGEgPSBzYW1wbGVEYXRhO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFNhbXBsZSwgW3tcbiAgICBrZXk6ICdzdGFydCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0KHRpbWUpIHtcbiAgICAgIHZhciBfc2FtcGxlRGF0YSA9IHRoaXMuc2FtcGxlRGF0YTtcbiAgICAgIHZhciBzdXN0YWluU3RhcnQgPSBfc2FtcGxlRGF0YS5zdXN0YWluU3RhcnQ7XG4gICAgICB2YXIgc3VzdGFpbkVuZCA9IF9zYW1wbGVEYXRhLnN1c3RhaW5FbmQ7XG4gICAgICAvL2NvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZClcblxuICAgICAgaWYgKHN1c3RhaW5TdGFydCAmJiBzdXN0YWluRW5kKSB7XG4gICAgICAgIHRoaXMuc291cmNlLmxvb3AgPSB0cnVlO1xuICAgICAgICB0aGlzLnNvdXJjZS5sb29wU3RhcnQgPSBzdXN0YWluU3RhcnQ7XG4gICAgICAgIHRoaXMuc291cmNlLmxvb3BFbmQgPSBzdXN0YWluRW5kO1xuICAgICAgfVxuICAgICAgdGhpcy5zb3VyY2Uuc3RhcnQodGltZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc3RvcCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3AodGltZSwgY2IpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBfc2FtcGxlRGF0YTIgPSB0aGlzLnNhbXBsZURhdGE7XG4gICAgICB2YXIgcmVsZWFzZUR1cmF0aW9uID0gX3NhbXBsZURhdGEyLnJlbGVhc2VEdXJhdGlvbjtcbiAgICAgIHZhciByZWxlYXNlRW52ZWxvcGUgPSBfc2FtcGxlRGF0YTIucmVsZWFzZUVudmVsb3BlO1xuICAgICAgdmFyIHJlbGVhc2VFbnZlbG9wZUFycmF5ID0gX3NhbXBsZURhdGEyLnJlbGVhc2VFbnZlbG9wZUFycmF5O1xuICAgICAgLy9jb25zb2xlLmxvZyhyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZSlcblxuICAgICAgdGhpcy5zb3VyY2Uub25lbmRlZCA9IGNiO1xuXG4gICAgICBpZiAocmVsZWFzZUR1cmF0aW9uICYmIHJlbGVhc2VFbnZlbG9wZSkge1xuICAgICAgICB0aGlzLnN0YXJ0UmVsZWFzZVBoYXNlID0gdGltZTtcbiAgICAgICAgdGhpcy5yZWxlYXNlRnVuY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZmFkZU91dChfdGhpcy5vdXRwdXQsIHtcbiAgICAgICAgICAgIHJlbGVhc2VEdXJhdGlvbjogcmVsZWFzZUR1cmF0aW9uLFxuICAgICAgICAgICAgcmVsZWFzZUVudmVsb3BlOiByZWxlYXNlRW52ZWxvcGUsXG4gICAgICAgICAgICByZWxlYXNlRW52ZWxvcGVBcnJheTogcmVsZWFzZUVudmVsb3BlQXJyYXlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUgKyByZWxlYXNlRHVyYXRpb24pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc3RvcCBtb3JlIHRoYW4gb25jZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hlY2tQaGFzZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc3RvcCBtb3JlIHRoYW4gb25jZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY2hlY2tQaGFzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrUGhhc2UoKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGNvbnRleHQuY3VycmVudFRpbWUsIHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UpXG4gICAgICBpZiAoX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZSA+PSB0aGlzLnN0YXJ0UmVsZWFzZVBoYXNlKSB7XG4gICAgICAgIHRoaXMucmVsZWFzZUZ1bmN0aW9uKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmNoZWNrUGhhc2UuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNhbXBsZTtcbn0oKTtcblxuZnVuY3Rpb24gZmFkZU91dChnYWluTm9kZSwgc2V0dGluZ3MpIHtcbiAgdmFyIG5vdyA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3VycmVudFRpbWU7XG4gIHZhciB2YWx1ZXMgPSB2b2lkIDAsXG4gICAgICBpID0gdm9pZCAwLFxuICAgICAgbWF4aSA9IHZvaWQgMDtcblxuICAvL2NvbnNvbGUubG9nKHNldHRpbmdzKVxuICB0cnkge1xuICAgIHN3aXRjaCAoc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlKSB7XG5cbiAgICAgIGNhc2UgJ2xpbmVhcic6XG4gICAgICAgIGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSwgbm93KTtcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjAsIG5vdyArIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdlcXVhbCBwb3dlcic6XG4gICAgICBjYXNlICdlcXVhbF9wb3dlcic6XG4gICAgICAgIHZhbHVlcyA9ICgwLCBfdXRpbC5nZXRFcXVhbFBvd2VyQ3VydmUpKDEwMCwgJ2ZhZGVPdXQnLCBnYWluTm9kZS5nYWluLnZhbHVlKTtcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYXJyYXknOlxuICAgICAgICBtYXhpID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXkubGVuZ3RoO1xuICAgICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1heGkpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbWF4aTsgaSsrKSB7XG4gICAgICAgICAgdmFsdWVzW2ldID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXlbaV0gKiBnYWluTm9kZS5nYWluLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVDdXJ2ZUF0VGltZSh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc2V0VmFsdWVDdXJ2ZUF0VGltZSBhbmQgbGluZWFyUmFtcFRvVmFsdWVBdFRpbWUgbW9yZSB0aGFuIG9uY2VcblxuICAgIC8vY29uc29sZS5sb2codmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAvL2NvbnNvbGUubG9nKGUsIGdhaW5Ob2RlKVxuICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5TYW1wbGVCdWZmZXIgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfc2FtcGxlID0gcmVxdWlyZSgnLi9zYW1wbGUnKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIGluc3RhbmNlSW5kZXggPSAwO1xuXG52YXIgU2FtcGxlQnVmZmVyID0gZXhwb3J0cy5TYW1wbGVCdWZmZXIgPSBmdW5jdGlvbiAoX1NhbXBsZSkge1xuICBfaW5oZXJpdHMoU2FtcGxlQnVmZmVyLCBfU2FtcGxlKTtcblxuICBmdW5jdGlvbiBTYW1wbGVCdWZmZXIoc2FtcGxlRGF0YSwgZXZlbnQpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2FtcGxlQnVmZmVyKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIE9iamVjdC5nZXRQcm90b3R5cGVPZihTYW1wbGVCdWZmZXIpLmNhbGwodGhpcywgc2FtcGxlRGF0YSwgZXZlbnQpKTtcblxuICAgIF90aGlzLmlkID0gX3RoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgaWYgKF90aGlzLnNhbXBsZURhdGEgPT09IC0xIHx8IHR5cGVvZiBfdGhpcy5zYW1wbGVEYXRhLmJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIGNyZWF0ZSBkdW1teSBzb3VyY2VcbiAgICAgIF90aGlzLnNvdXJjZSA9IHtcbiAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge30sXG4gICAgICAgIHN0b3A6IGZ1bmN0aW9uIHN0b3AoKSB7fSxcbiAgICAgICAgY29ubmVjdDogZnVuY3Rpb24gY29ubmVjdCgpIHt9XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBfdGhpcy5zb3VyY2UgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGVEYXRhKVxuICAgICAgX3RoaXMuc291cmNlLmJ1ZmZlciA9IHNhbXBsZURhdGEuYnVmZmVyO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvdXJjZS5idWZmZXIpXG4gICAgfVxuICAgIF90aGlzLm91dHB1dCA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIF90aGlzLnZvbHVtZSA9IGV2ZW50LmRhdGEyIC8gMTI3O1xuICAgIF90aGlzLm91dHB1dC5nYWluLnZhbHVlID0gX3RoaXMudm9sdW1lO1xuICAgIF90aGlzLnNvdXJjZS5jb25uZWN0KF90aGlzLm91dHB1dCk7XG4gICAgLy90aGlzLm91dHB1dC5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgLy9Ab3ZlcnJpZGVcblxuXG4gIF9jcmVhdGVDbGFzcyhTYW1wbGVCdWZmZXIsIFt7XG4gICAga2V5OiAnc3RhcnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFydCh0aW1lKSB7XG4gICAgICB2YXIgX3NhbXBsZURhdGEgPSB0aGlzLnNhbXBsZURhdGE7XG4gICAgICB2YXIgc3VzdGFpblN0YXJ0ID0gX3NhbXBsZURhdGEuc3VzdGFpblN0YXJ0O1xuICAgICAgdmFyIHN1c3RhaW5FbmQgPSBfc2FtcGxlRGF0YS5zdXN0YWluRW5kO1xuICAgICAgdmFyIHNlZ21lbnRTdGFydCA9IF9zYW1wbGVEYXRhLnNlZ21lbnRTdGFydDtcbiAgICAgIHZhciBzZWdtZW50RHVyYXRpb24gPSBfc2FtcGxlRGF0YS5zZWdtZW50RHVyYXRpb247XG4gICAgICAvL2NvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZCwgc2VnbWVudFN0YXJ0LCBzZWdtZW50RHVyYXRpb24pXG5cbiAgICAgIGlmIChzdXN0YWluU3RhcnQgJiYgc3VzdGFpbkVuZCkge1xuICAgICAgICB0aGlzLnNvdXJjZS5sb29wID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zb3VyY2UubG9vcFN0YXJ0ID0gc3VzdGFpblN0YXJ0O1xuICAgICAgICB0aGlzLnNvdXJjZS5sb29wRW5kID0gc3VzdGFpbkVuZDtcbiAgICAgIH1cbiAgICAgIGlmIChzZWdtZW50U3RhcnQgJiYgc2VnbWVudER1cmF0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHNlZ21lbnRTdGFydCwgc2VnbWVudER1cmF0aW9uKTtcbiAgICAgICAgdGhpcy5zb3VyY2Uuc3RhcnQodGltZSwgc2VnbWVudFN0YXJ0IC8gMTAwMCwgc2VnbWVudER1cmF0aW9uIC8gMTAwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU2FtcGxlQnVmZmVyO1xufShfc2FtcGxlLlNhbXBsZSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5TYW1wbGVPc2NpbGxhdG9yID0gdW5kZWZpbmVkO1xuXG52YXIgX3NhbXBsZSA9IHJlcXVpcmUoJy4vc2FtcGxlJyk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBpbnN0YW5jZUluZGV4ID0gMDtcblxudmFyIFNhbXBsZU9zY2lsbGF0b3IgPSBleHBvcnRzLlNhbXBsZU9zY2lsbGF0b3IgPSBmdW5jdGlvbiAoX1NhbXBsZSkge1xuICBfaW5oZXJpdHMoU2FtcGxlT3NjaWxsYXRvciwgX1NhbXBsZSk7XG5cbiAgZnVuY3Rpb24gU2FtcGxlT3NjaWxsYXRvcihzYW1wbGVEYXRhLCBldmVudCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTYW1wbGVPc2NpbGxhdG9yKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIE9iamVjdC5nZXRQcm90b3R5cGVPZihTYW1wbGVPc2NpbGxhdG9yKS5jYWxsKHRoaXMsIHNhbXBsZURhdGEsIGV2ZW50KSk7XG5cbiAgICBfdGhpcy5pZCA9IF90aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIGlmIChfdGhpcy5zYW1wbGVEYXRhID09PSAtMSkge1xuICAgICAgLy8gY3JlYXRlIGR1bW15IHNvdXJjZVxuICAgICAgX3RoaXMuc291cmNlID0ge1xuICAgICAgICBzdGFydDogZnVuY3Rpb24gc3RhcnQoKSB7fSxcbiAgICAgICAgc3RvcDogZnVuY3Rpb24gc3RvcCgpIHt9LFxuICAgICAgICBjb25uZWN0OiBmdW5jdGlvbiBjb25uZWN0KCkge31cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gQFRPRE8gYWRkIHR5cGUgJ2N1c3RvbScgPT4gUGVyaW9kaWNXYXZlXG4gICAgICB2YXIgdHlwZSA9IF90aGlzLnNhbXBsZURhdGEudHlwZTtcbiAgICAgIF90aGlzLnNvdXJjZSA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuXG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnc2luZSc6XG4gICAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgIGNhc2UgJ3Nhd3Rvb3RoJzpcbiAgICAgICAgY2FzZSAndHJpYW5nbGUnOlxuICAgICAgICAgIF90aGlzLnNvdXJjZS50eXBlID0gdHlwZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBfdGhpcy5zb3VyY2UudHlwZSA9ICdzcXVhcmUnO1xuICAgICAgfVxuICAgICAgX3RoaXMuc291cmNlLmZyZXF1ZW5jeS52YWx1ZSA9IGV2ZW50LmZyZXF1ZW5jeTtcbiAgICB9XG4gICAgX3RoaXMub3V0cHV0ID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgX3RoaXMudm9sdW1lID0gZXZlbnQuZGF0YTIgLyAxMjc7XG4gICAgX3RoaXMub3V0cHV0LmdhaW4udmFsdWUgPSBfdGhpcy52b2x1bWU7XG4gICAgX3RoaXMuc291cmNlLmNvbm5lY3QoX3RoaXMub3V0cHV0KTtcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICByZXR1cm4gU2FtcGxlT3NjaWxsYXRvcjtcbn0oX3NhbXBsZS5TYW1wbGUpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuU2FtcGxlciA9IHVuZGVmaW5lZDtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9pbnN0cnVtZW50ID0gcmVxdWlyZSgnLi9pbnN0cnVtZW50Jyk7XG5cbnZhciBfbm90ZSA9IHJlcXVpcmUoJy4vbm90ZScpO1xuXG52YXIgX3BhcnNlX2F1ZGlvID0gcmVxdWlyZSgnLi9wYXJzZV9hdWRpbycpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9mZXRjaF9oZWxwZXJzID0gcmVxdWlyZSgnLi9mZXRjaF9oZWxwZXJzJyk7XG5cbnZhciBfc2FtcGxlX2J1ZmZlciA9IHJlcXVpcmUoJy4vc2FtcGxlX2J1ZmZlcicpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBpbnN0YW5jZUluZGV4ID0gMDtcblxudmFyIFNhbXBsZXIgPSBleHBvcnRzLlNhbXBsZXIgPSBmdW5jdGlvbiAoX0luc3RydW1lbnQpIHtcbiAgX2luaGVyaXRzKFNhbXBsZXIsIF9JbnN0cnVtZW50KTtcblxuICBmdW5jdGlvbiBTYW1wbGVyKG5hbWUpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2FtcGxlcik7XG5cbiAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoU2FtcGxlcikuY2FsbCh0aGlzKSk7XG5cbiAgICBfdGhpcy5pZCA9IF90aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBfdGhpcy5uYW1lID0gbmFtZSB8fCBfdGhpcy5pZDtcbiAgICBfdGhpcy5jbGVhckFsbFNhbXBsZURhdGEoKTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoU2FtcGxlciwgW3tcbiAgICBrZXk6ICdjbGVhckFsbFNhbXBsZURhdGEnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhckFsbFNhbXBsZURhdGEoKSB7XG4gICAgICAvLyBjcmVhdGUgYSBzYW1wbGVzIGRhdGEgb2JqZWN0IGZvciBhbGwgMTI4IHZlbG9jaXR5IGxldmVscyBvZiBhbGwgMTI4IG5vdGVzXG4gICAgICB0aGlzLnNhbXBsZXNEYXRhID0gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSk7XG4gICAgICB0aGlzLnNhbXBsZXNEYXRhID0gdGhpcy5zYW1wbGVzRGF0YS5tYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjcmVhdGVTYW1wbGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVTYW1wbGUoZXZlbnQpIHtcbiAgICAgIHJldHVybiBuZXcgX3NhbXBsZV9idWZmZXIuU2FtcGxlQnVmZmVyKHRoaXMuc2FtcGxlc0RhdGFbZXZlbnQuZGF0YTFdW2V2ZW50LmRhdGEyXSwgZXZlbnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19sb2FkSlNPTicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9sb2FkSlNPTihkYXRhKSB7XG4gICAgICBpZiAoKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihkYXRhKSkgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkYXRhLnVybCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuICgwLCBfZmV0Y2hfaGVscGVycy5mZXRjaEpTT04pKGRhdGEudXJsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gbG9hZCBhbmQgcGFyc2VcblxuICB9LCB7XG4gICAga2V5OiAncGFyc2VTYW1wbGVEYXRhJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGFyc2VTYW1wbGVEYXRhKGRhdGEpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAvLyBjaGVjayBpZiB3ZSBoYXZlIHRvIGNsZWFyIHRoZSBjdXJyZW50bHkgbG9hZGVkIHNhbXBsZXNcbiAgICAgIHZhciBjbGVhckFsbCA9IGRhdGEuY2xlYXJBbGw7XG5cbiAgICAgIC8vIGNoZWNrIGlmIHdlIGhhdmUgdG8gb3ZlcnJ1bGUgdGhlIGJhc2VVcmwgb2YgdGhlIHNhbXBlbHNcbiAgICAgIHZhciBiYXNlVXJsID0gbnVsbDtcbiAgICAgIGlmICh0eXBlb2YgZGF0YS5iYXNlVXJsID09PSAnc3RyaW5nJykge1xuICAgICAgICBiYXNlVXJsID0gZGF0YS5iYXNlVXJsO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGRhdGEucmVsZWFzZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5zZXRSZWxlYXNlKGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygxLCBkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgIH1cblxuICAgICAgLy9yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgX3RoaXMyLl9sb2FkSlNPTihkYXRhKS50aGVuKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhqc29uKVxuICAgICAgICAgIGRhdGEgPSBqc29uO1xuICAgICAgICAgIGlmIChiYXNlVXJsICE9PSBudWxsKSB7XG4gICAgICAgICAgICBqc29uLmJhc2VVcmwgPSBiYXNlVXJsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIGRhdGEucmVsZWFzZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIF90aGlzMi5zZXRSZWxlYXNlKGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coMiwgZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAoMCwgX3BhcnNlX2F1ZGlvLnBhcnNlU2FtcGxlcykoZGF0YSk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgaWYgKGNsZWFyQWxsID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfdGhpczIuY2xlYXJBbGxTYW1wbGVEYXRhKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCh0eXBlb2YgcmVzdWx0ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihyZXN1bHQpKSA9PT0gJ29iamVjdCcpIHtcblxuICAgICAgICAgICAgLy8gc2luZ2xlIGNvbmNhdGVuYXRlZCBzYW1wbGVcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0LnNhbXBsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gcmVzdWx0LnNhbXBsZTtcbiAgICAgICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gT2JqZWN0LmtleXMoZGF0YSlbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgbm90ZUlkID0gX3N0ZXAudmFsdWU7XG5cblxuICAgICAgICAgICAgICAgICAgaWYgKG5vdGVJZCA9PT0gJ3NhbXBsZScgfHwgbm90ZUlkID09PSAncmVsZWFzZScgfHwgbm90ZUlkID09PSAnYmFzZVVybCcgfHwgbm90ZUlkID09PSAnaW5mbycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHZhciBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBzZWdtZW50OiBkYXRhW25vdGVJZF0sXG4gICAgICAgICAgICAgICAgICAgIG5vdGU6IHBhcnNlSW50KG5vdGVJZCwgMTApLFxuICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlclxuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgX3RoaXMyLl91cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpO1xuICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGVEYXRhKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vdGVJZCA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gcmVzdWx0W25vdGVJZF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBzYW1wbGVEYXRhID0gZGF0YVtub3RlSWRdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2FtcGxlRGF0YSBpcyB1bmRlZmluZWQnLCBub3RlSWQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCgwLCBfdXRpbC50eXBlU3RyaW5nKShidWZmZXIpID09PSAnYXJyYXknKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGJ1ZmZlciwgc2FtcGxlRGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICBzYW1wbGVEYXRhLmZvckVhY2goZnVuY3Rpb24gKHNkLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKG5vdGVJZCwgYnVmZmVyW2ldKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2QgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiBidWZmZXJbaV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNkLmJ1ZmZlciA9IGJ1ZmZlcltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNkLm5vdGUgPSBwYXJzZUludChub3RlSWQsIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5fdXBkYXRlU2FtcGxlRGF0YShzZCk7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNhbXBsZURhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHBhcnNlSW50KG5vdGVJZCwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5fdXBkYXRlU2FtcGxlRGF0YShzYW1wbGVEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IE9iamVjdC5rZXlzKHJlc3VsdClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgX2xvb3AoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goZnVuY3Rpb24gKHNhbXBsZSkge1xuICAgICAgICAgICAgICB2YXIgc2FtcGxlRGF0YSA9IGRhdGFbc2FtcGxlXTtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzYW1wbGVEYXRhID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzYW1wbGVEYXRhIGlzIHVuZGVmaW5lZCcsIHNhbXBsZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzYW1wbGVEYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiBzYW1wbGUuYnVmZmVyXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IHNhbXBsZS5idWZmZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHNhbXBsZTtcbiAgICAgICAgICAgICAgICBfdGhpczIuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSk7XG4gICAgICAgICAgICAgICAgLy90aGlzLnVwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vY29uc29sZS5sb2cobmV3IERhdGUoKS5nZXRUaW1lKCkpXG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICBAcGFyYW0gY29uZmlnIChvcHRpb25hbClcbiAgICAgICAge1xuICAgICAgICAgIG5vdGU6IGNhbiBiZSBub3RlIG5hbWUgKEM0KSBvciBub3RlIG51bWJlciAoNjApXG4gICAgICAgICAgYnVmZmVyOiBBdWRpb0J1ZmZlclxuICAgICAgICAgIHN1c3RhaW46IFtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmRdLCAvLyBvcHRpb25hbCwgaW4gbWlsbGlzXG4gICAgICAgICAgcmVsZWFzZTogW3JlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlXSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICBwYW46IHBhblBvc2l0aW9uIC8vIG9wdGlvbmFsXG4gICAgICAgICAgdmVsb2NpdHk6IFt2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZF0gLy8gb3B0aW9uYWwsIGZvciBtdWx0aS1sYXllcmVkIGluc3RydW1lbnRzXG4gICAgICAgIH1cbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGVTYW1wbGVEYXRhJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlU2FtcGxlRGF0YSgpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZGF0YSA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBkYXRhW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKG5vdGVEYXRhKSB7XG4gICAgICAgIC8vIHN1cHBvcnQgZm9yIG11bHRpIGxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub3RlRGF0YSwgdHlwZVN0cmluZyhub3RlRGF0YSkpXG4gICAgICAgIGlmICgoMCwgX3V0aWwudHlwZVN0cmluZykobm90ZURhdGEpID09PSAnYXJyYXknKSB7XG4gICAgICAgICAgbm90ZURhdGEuZm9yRWFjaChmdW5jdGlvbiAodmVsb2NpdHlMYXllcikge1xuICAgICAgICAgICAgX3RoaXMzLl91cGRhdGVTYW1wbGVEYXRhKHZlbG9jaXR5TGF5ZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF90aGlzMy5fdXBkYXRlU2FtcGxlRGF0YShub3RlRGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ191cGRhdGVTYW1wbGVEYXRhJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3VwZGF0ZVNhbXBsZURhdGEoKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgdmFyIGRhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhkYXRhKVxuICAgICAgdmFyIG5vdGUgPSBkYXRhLm5vdGU7XG4gICAgICB2YXIgX2RhdGEkYnVmZmVyID0gZGF0YS5idWZmZXI7XG4gICAgICB2YXIgYnVmZmVyID0gX2RhdGEkYnVmZmVyID09PSB1bmRlZmluZWQgPyBudWxsIDogX2RhdGEkYnVmZmVyO1xuICAgICAgdmFyIF9kYXRhJHN1c3RhaW4gPSBkYXRhLnN1c3RhaW47XG4gICAgICB2YXIgc3VzdGFpbiA9IF9kYXRhJHN1c3RhaW4gPT09IHVuZGVmaW5lZCA/IFtudWxsLCBudWxsXSA6IF9kYXRhJHN1c3RhaW47XG4gICAgICB2YXIgX2RhdGEkc2VnbWVudCA9IGRhdGEuc2VnbWVudDtcbiAgICAgIHZhciBzZWdtZW50ID0gX2RhdGEkc2VnbWVudCA9PT0gdW5kZWZpbmVkID8gW251bGwsIG51bGxdIDogX2RhdGEkc2VnbWVudDtcbiAgICAgIHZhciBfZGF0YSRyZWxlYXNlID0gZGF0YS5yZWxlYXNlO1xuICAgICAgdmFyIHJlbGVhc2UgPSBfZGF0YSRyZWxlYXNlID09PSB1bmRlZmluZWQgPyBbbnVsbCwgJ2xpbmVhciddIDogX2RhdGEkcmVsZWFzZTtcbiAgICAgIHZhciBfZGF0YSRwYW4gPSBkYXRhLnBhbjtcbiAgICAgIHZhciAvLyByZWxlYXNlIGR1cmF0aW9uIGlzIGluIHNlY29uZHMhXG4gICAgICBwYW4gPSBfZGF0YSRwYW4gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBfZGF0YSRwYW47XG4gICAgICB2YXIgX2RhdGEkdmVsb2NpdHkgPSBkYXRhLnZlbG9jaXR5O1xuICAgICAgdmFyIHZlbG9jaXR5ID0gX2RhdGEkdmVsb2NpdHkgPT09IHVuZGVmaW5lZCA/IFswLCAxMjddIDogX2RhdGEkdmVsb2NpdHk7XG5cblxuICAgICAgaWYgKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbm90ZW51bWJlciBvciBhIG5vdGVuYW1lJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gZ2V0IG5vdGVudW1iZXIgZnJvbSBub3RlbmFtZSBhbmQgY2hlY2sgaWYgdGhlIG5vdGVudW1iZXIgaXMgdmFsaWRcbiAgICAgIHZhciBuID0gKDAsIF9ub3RlLmdldE5vdGVEYXRhKSh7IG51bWJlcjogbm90ZSB9KTtcbiAgICAgIGlmIChuID09PSBmYWxzZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ25vdCBhIHZhbGlkIG5vdGUgaWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbm90ZSA9IG4ubnVtYmVyO1xuXG4gICAgICB2YXIgX3N1c3RhaW4gPSBfc2xpY2VkVG9BcnJheShzdXN0YWluLCAyKTtcblxuICAgICAgdmFyIHN1c3RhaW5TdGFydCA9IF9zdXN0YWluWzBdO1xuICAgICAgdmFyIHN1c3RhaW5FbmQgPSBfc3VzdGFpblsxXTtcblxuICAgICAgdmFyIF9yZWxlYXNlID0gX3NsaWNlZFRvQXJyYXkocmVsZWFzZSwgMik7XG5cbiAgICAgIHZhciByZWxlYXNlRHVyYXRpb24gPSBfcmVsZWFzZVswXTtcbiAgICAgIHZhciByZWxlYXNlRW52ZWxvcGUgPSBfcmVsZWFzZVsxXTtcblxuICAgICAgdmFyIF9zZWdtZW50ID0gX3NsaWNlZFRvQXJyYXkoc2VnbWVudCwgMik7XG5cbiAgICAgIHZhciBzZWdtZW50U3RhcnQgPSBfc2VnbWVudFswXTtcbiAgICAgIHZhciBzZWdtZW50RHVyYXRpb24gPSBfc2VnbWVudFsxXTtcblxuICAgICAgdmFyIF92ZWxvY2l0eSA9IF9zbGljZWRUb0FycmF5KHZlbG9jaXR5LCAyKTtcblxuICAgICAgdmFyIHZlbG9jaXR5U3RhcnQgPSBfdmVsb2NpdHlbMF07XG4gICAgICB2YXIgdmVsb2NpdHlFbmQgPSBfdmVsb2NpdHlbMV07XG5cblxuICAgICAgaWYgKHN1c3RhaW4ubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgIHN1c3RhaW5TdGFydCA9IHN1c3RhaW5FbmQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVsZWFzZUR1cmF0aW9uID09PSBudWxsKSB7XG4gICAgICAgIHJlbGVhc2VFbnZlbG9wZSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKG5vdGUsIGJ1ZmZlcilcbiAgICAgIC8vIGNvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZClcbiAgICAgIC8vIGNvbnNvbGUubG9nKHJlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlKVxuICAgICAgLy8gY29uc29sZS5sb2cocGFuKVxuICAgICAgLy8gY29uc29sZS5sb2codmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmQpXG5cbiAgICAgIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV0uZm9yRWFjaChmdW5jdGlvbiAoc2FtcGxlRGF0YSwgaSkge1xuICAgICAgICBpZiAoaSA+PSB2ZWxvY2l0eVN0YXJ0ICYmIGkgPD0gdmVsb2NpdHlFbmQpIHtcbiAgICAgICAgICBpZiAoc2FtcGxlRGF0YSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgIGlkOiBub3RlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gYnVmZmVyIHx8IHNhbXBsZURhdGEuYnVmZmVyO1xuICAgICAgICAgIHNhbXBsZURhdGEuc3VzdGFpblN0YXJ0ID0gc3VzdGFpblN0YXJ0IHx8IHNhbXBsZURhdGEuc3VzdGFpblN0YXJ0O1xuICAgICAgICAgIHNhbXBsZURhdGEuc3VzdGFpbkVuZCA9IHN1c3RhaW5FbmQgfHwgc2FtcGxlRGF0YS5zdXN0YWluRW5kO1xuICAgICAgICAgIHNhbXBsZURhdGEuc2VnbWVudFN0YXJ0ID0gc2VnbWVudFN0YXJ0IHx8IHNhbXBsZURhdGEuc2VnbWVudFN0YXJ0O1xuICAgICAgICAgIHNhbXBsZURhdGEuc2VnbWVudER1cmF0aW9uID0gc2VnbWVudER1cmF0aW9uIHx8IHNhbXBsZURhdGEuc2VnbWVudER1cmF0aW9uO1xuICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uID0gcmVsZWFzZUR1cmF0aW9uIHx8IHNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uO1xuICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gcmVsZWFzZUVudmVsb3BlIHx8IHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlO1xuICAgICAgICAgIHNhbXBsZURhdGEucGFuID0gcGFuIHx8IHNhbXBsZURhdGEucGFuO1xuXG4gICAgICAgICAgaWYgKCgwLCBfdXRpbC50eXBlU3RyaW5nKShzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSkgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXkgPSBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZTtcbiAgICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gJ2FycmF5JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXk7XG4gICAgICAgICAgfVxuICAgICAgICAgIF90aGlzNC5zYW1wbGVzRGF0YVtub3RlXVtpXSA9IHNhbXBsZURhdGE7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZygnJU8nLCB0aGlzLnNhbXBsZXNEYXRhW25vdGVdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gc3RlcmVvIHNwcmVhZFxuXG4gIH0sIHtcbiAgICBrZXk6ICdzZXRLZXlTY2FsaW5nUGFubmluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEtleVNjYWxpbmdQYW5uaW5nKCkge1xuICAgICAgLy8gc2V0cyBwYW5uaW5nIGJhc2VkIG9uIHRoZSBrZXkgdmFsdWUsIGUuZy4gaGlnaGVyIG5vdGVzIGFyZSBwYW5uZWQgbW9yZSB0byB0aGUgcmlnaHQgYW5kIGxvd2VyIG5vdGVzIG1vcmUgdG8gdGhlIGxlZnRcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRLZXlTY2FsaW5nUmVsZWFzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEtleVNjYWxpbmdSZWxlYXNlKCkge31cbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcblxuXG4gICAgLypcbiAgICAgIEBkdXJhdGlvbjogbWlsbGlzZWNvbmRzXG4gICAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3NldFJlbGVhc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRSZWxlYXNlKGR1cmF0aW9uLCBlbnZlbG9wZSkge1xuICAgICAgLy8gc2V0IHJlbGVhc2UgZm9yIGFsbCBrZXlzLCBvdmVycnVsZXMgdmFsdWVzIHNldCBieSBzZXRLZXlTY2FsaW5nUmVsZWFzZSgpXG4gICAgICB0aGlzLnNhbXBsZXNEYXRhLmZvckVhY2goZnVuY3Rpb24gKHNhbXBsZXMsIGlkKSB7XG4gICAgICAgIHNhbXBsZXMuZm9yRWFjaChmdW5jdGlvbiAoc2FtcGxlLCBpKSB7XG4gICAgICAgICAgaWYgKHNhbXBsZSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHNhbXBsZSA9IHtcbiAgICAgICAgICAgICAgaWQ6IGlkXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBzYW1wbGUucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgICAgICAgc2FtcGxlLnJlbGVhc2VFbnZlbG9wZSA9IGVudmVsb3BlO1xuICAgICAgICAgIHNhbXBsZXNbaV0gPSBzYW1wbGU7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGEpXG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNhbXBsZXI7XG59KF9pbnN0cnVtZW50Lkluc3RydW1lbnQpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBzYW1wbGVzID0ge1xuICAvLyAgZW1wdHlPZ2c6ICdUMmRuVXdBQ0FBQUFBQUFBQUFCZHhkNFhBQUFBQURhUzBqUUJIZ0YyYjNKaWFYTUFBQUFBQVVTc0FBQUFBQUFBZ0xzQUFBQUFBQUM0QVU5bloxTUFBQUFBQUFBQUFBQUFYY1hlRndFQUFBQWFYSytRRHozLy8vLy8vLy8vLy8vLy8vLy9NZ04yYjNKaWFYTXRBQUFBV0dsd2FDNVBjbWNnYkdsaVZtOXlZbWx6SUVrZ01qQXhNREV4TURFZ0tGTmphR0YxWm1WdWRXZG5aWFFwQUFBQUFBRUZkbTl5WW1sekgwSkRWZ0VBQUFFQUdHTlVLVWFaVXRKS2lSbHpsREZHbVdLU1NvbWxoQlpDU0oxekZGT3BPZGVjYTZ5NXRTQ0VFQnBUVUNrRm1WS09VbWtaWTVBcEJabFNFRXRKSlhRU09pZWRZeEJiU2NIV21HdUxRYlljaEEyYVVrd3B4SlJTaWtJSUdWT01LY1dVVWtwQ0J5VjBEanJtSEZPT1NpaEJ1Snh6cTdXV2xtT0xxWFNTU3Vja1pFeENTQ21Ga2tvSHBWTk9Ra2cxbHRaU0tSMXpVbEpxUWVnZ2hCQkN0aUNFRFlMUWtGVUFBQUVBd0VBUUdySUtBRkFBQUJDS29SaUtBb1NHckFJQU1nQUFCS0FvanVJb2ppTTVrbU5KRmhBYXNnb0FBQUlBRUFBQXdIQVVTWkVVeWJFa1M5SXNTOU5FVVZWOTFUWlZWZloxWGRkMVhkZDFJRFJrRlFBQUFRQkFTS2VacFJvZ3dneGtHQWdOV1FVQUlBQUFBRVlvd2hBRFFrTldBUUFBQVFBQVlpZzVpQ2EwNW54empvTm1PV2dxeGVaMGNDTFY1a2x1S3VibW5IUE9PU2ViYzhZNDU1eHppbkptTVdnbXRPYWNjeEtEWmlsb0pyVG1uSE9leE9aQmE2cTA1cHh6eGptbmczRkdHT2VjYzVxMDVrRnFOdGJtbkhNV3RLWTVhaTdGNXB4ekl1WG1TVzB1MWVhY2M4NDU1NXh6empubm5IT3FGNmR6Y0U0NDU1eHpvdmJtV201Q0YrZWNjejRacDN0elFqam5uSFBPT2VlY2M4NDU1NXh6Z3RDUVZRQUFFQUFBUVJnMmhuR25JRWlmbzRFWVJZaHB5S1FIM2FQREpHZ01jZ3FwUjZPamtWTHFJSlJVeGtrcG5TQTBaQlVBQUFnQUFDR0VGRkpJSVlVVVVrZ2hoUlJTaUNHR0dHTElLYWVjZ2dvcXFhU2lpakxLTExQTU1zc3NzOHd5NjdDenpqcnNNTVFRUXd5dHRCSkxUYlhWV0dPdHVlZWNhdzdTV21tdHRkWktLYVdVVWtvcENBMVpCUUNBQUFBUUNCbGtrRUZHSVlVVVVvZ2hwcHh5eWltb29BSkNRMVlCQUlBQUFBSUFBQUE4eVhORVIzUkVSM1JFUjNSRVIzUkV4M004UjVSRVNaUkVTYlJNeTlSTVR4VlYxWlZkVzlabDNmWnRZUmQyM2ZkMTMvZDE0OWVGWVZtV1pWbVdaVm1XWlZtV1pWbVdaVm1DMEpCVkFBQUlBQUNBRUVJSUlZVVVVa2docFJoanpESG5vSk5RUWlBMFpCVUFBQWdBSUFBQUFNQlJITVZ4SkVkeUpNbVNMRW1UTkV1elBNM1RQRTMwUkZFVVRkTlVSVmQwUmQyMFJkbVVUZGQwVGRsMFZWbTFYVm0yYmRuV2JWK1diZC8zZmQvM2ZkLzNmZC8zZmQvM2RSMElEVmtGQUVnQUFPaElqcVJJaXFSSWp1TTRraVFCb1NHckFBQVpBQUFCQUNpS296aU80MGlTSkVtV3BFbWU1Vm1pWm1xbVozcXFxQUtoSWFzQUFFQUFBQUVBQUFBQUFDaWE0aW1tNGltaTRqbWlJMHFpWlZxaXBtcXVLSnV5NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N291RUJxeUNnQ1FBQURRa1J6SmtSeEprUlJKa1J6SkFVSkRWZ0VBTWdBQUFnQndETWVRRk1teExFdlRQTTNUUEUzMFJFLzBURThWWGRFRlFrTldBUUNBQUFBQ0FBQUFBQUF3Sk1OU0xFZHpORW1VVkV1MVZFMjFWRXNWVlU5VlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlUxVGRNMFRTQTBaQ1VBQUFRQXdHS053ZVVnSVNVbDVkNFF3aENUbmpFbUliVmVJUVNSa3Q0eEJoV0RuaktpREhMZVF1TVFneDRJRFZrUkFFUUJBQURHSU1jUWM4ZzVSNm1URWpubnFIU1VHdWNjcFk1U1p5bkZtR0xOS0pYWVVxeU5jNDVTUjYyamxHSXNMWGFVVW8ycHhnSUFBQUljQUFBQ0xJUkNRMVlFQUZFQUFJUXhTQ21rRkdLTU9hZWNRNHdwNTVoemhqSG1ISE9PT2VlZ2RGSXE1NXgwVGtyRUdIT09PYWVjYzFJNko1VnpUa29ub1FBQWdBQUhBSUFBQzZIUWtCVUJRSndBZ0VHU1BFL3lORkdVTkU4VVJWTjBYVkUwWGRmeVBOWDBURk5WUGRGVVZWTlZiZGxVVlZtV1BNODBQZE5VVmM4MFZkVlVWVmsyVlZXV1JWWFZiZE4xZGR0MFZkMldiZHYzWFZzV2RsRlZiZDFVWGRzM1ZkZjJYZG4yZlZuV2RXUHlQRlgxVE5OMVBkTjBaZFYxYlZ0MVhWMzNURk9XVGRlVlpkTjFiZHVWWlYxM1pkbjNOZE4wWGROVlpkbDBYZGwyWlZlM1hWbjJmZE4xaGQrVlpWOVhaVmtZZGwzM2hWdlhsZVYwWGQxWFpWYzNWbG4yZlZ2WGhlSFdkV0daUEU5VlBkTjBYYzgwWFZkMVhWOVhYZGZXTmRPVVpkTjFiZGxVWFZsMlpkbjNYVmZXZGM4MFpkbDBYZHMyWFZlV1hWbjJmVmVXZGQxMFhWOVhaVm40VlZmMmRWblhsZUhXYmVFM1hkZjNWVm4yaFZlV2RlSFdkV0c1ZFYwWVBsWDFmVk4yaGVGMFpkL1hoZDlaYmwwNGx0RjFmV0dWYmVGWVpWazVmdUZZbHQzM2xXVjBYVjlZYmRrWVZsa1dobC80bmVYMmZlTjRkVjBaYnQzbnpMcnZETWZ2cFB2SzA5VnRZNWw5M1ZsbVgzZU80Umc2di9EanFhcXZtNjRyREtjc0M3L3Q2OGF6Kzc2eWpLN3IrNm9zQzc4cTI4S3g2Nzd6L0w2d0xLUHMrc0pxeThLdzJyWXgzTDV1TEw5d0hNdHI2OG94Njc1UnRuVjhYM2dLdy9OMGRWMTVabDNIOW5WMDQwYzRmc29BQUlBQkJ3Q0FBQlBLUUtFaEt3S0FPQUVBanlTSm9tUlpvaWhabGlpS3B1aTZvbWk2cnFScHBxbHBubWxhbW1lYXBtbXFzaW1hcml4cG1tbGFubWFhbXFlWnBtaWFybXVhcHF5S3BpbkxwbXJLc21tYXN1eTZzbTI3cm16Ym9tbktzbW1hc215YXBpeTdzcXZicnV6cXVxUlpwcWw1bm1scW5tZWFwbXJLc21tYXJxdDVubXA2bm1pcW5paXFxbXFxcXEycXFpeGJubWVhbXVpcHBpZUtxbXFxcHEyYXFpckxwcXJhc21tcXRteXFxbTI3cXV6NnNtM3J1bW1xc20ycXBpMmJxbXJicnV6cXNpemJ1aTlwbW1scW5tZWFtdWVacG1tYXNteWFxaXRibnFlYW5paXFxdWFKcG1xcXFpeWJwcXJLbHVlWnFpZUtxdXFKbm11YXFpckxwbXJhcW1tYXRteXFxaTJicGlyTHJtMzd2dXZLc202cXFteWJxbXJycG1yS3Ntekx2dS9LcXU2S3BpbkxwcXJhc21tcXNpM2JzdS9Mc3F6N29tbktzbW1xc20ycXFpN0xzbTBiczJ6N3VtaWFzbTJxcGkyYnFpcmJzaTM3dWl6YnV1L0tybStycXF6cnNpMzd1dTc2cm5EcnVqQzhzbXo3cXF6NnVpdmJ1bS9yTXR2MmZVVFRsR1ZUTlczYlZGVlpkbVhaOW1YYjluM1JORzFiVlZWYk5rM1Z0bVZaOW4xWnRtMWhORTNaTmxWVjFrM1Z0RzFabG0xaHRtWGhkbVhadDJWYjluWFhsWFZmMTMzajEyWGQ1cnF5N2N1eXJmdXFxL3EyN3Z2Q2NPdXU4QW9BQUJod0FBQUlNS0VNRkJxeUVnQ0lBZ0FBakdHTU1RaU5VczQ1QjZGUnlqbm5JR1RPUVFnaGxjdzVDQ0dVa2prSG9aU1VNdWNnbEpKU0NLR1VsRm9MSVpTVVVtc0ZBQUFVT0FBQUJOaWdLYkU0UUtFaEt3R0FWQUFBZytOWWx1ZVpvbXJhc21OSm5pZUtxcW1xdHUxSWx1ZUpvbW1xcW0xYm5pZUtwcW1xcnV2cm11ZUpvbW1xcXV2cXVtaWFwcW1xcnV1NnVpNmFvcW1xcXV1NnNxNmJwcXFxcml1N3N1enJwcXFxcXV2S3Jpejd3cXE2cml2THNtM3J3ckNxcnV2S3NtemJ0bS9jdXE3cnZ1Lzd3cEd0NjdvdS9NSXhERWNCQU9BSkRnQkFCVGFzam5CU05CWllhTWhLQUNBREFJQXdCaUdERUVJR0lZU1FVa29ocFpRU0FBQXc0QUFBRUdCQ0dTZzBaRVVBRUNjQUFCaERLYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpJS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLcWFTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS1pWU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVZ29Ba0lwd0FKQjZNS0VNRkJxeUVnQklCUUFBakZGS0tjYWNneEF4NWhoajBFa29LV0xNT2NZY2xKSlM1UnlFRUZKcExiZktPUWdocE5SU2JabHpVbHFMTWVZWU0rZWtwQlJielRtSFVsS0xzZWFhYSs2a3RGWnJyalhuV2xxck5kZWNjODI1dEJacnJqblhuSFBMTWRlY2M4NDU1eGh6empubm5IUE9CUURnTkRnQWdCN1lzRHJDU2RGWVlLRWhLd0dBVkFBQUFobWxHSFBPT2VnUVVvdzU1eHlFRUNLRkdIUE9PUWdoVkl3NTV4eDBFRUtvR0hQTU9RZ2hoSkE1NXh5RUVFSUlJWE1PT3VnZ2hCQkNCeDJFRUVJSW9aVE9RUWdoaEJCS0tDR0VFRUlJSVlRUU9nZ2hoQkJDQ0NHRUVFSUlJWVJTU2dnaGhCQkNDYUdVVUFBQVlJRURBRUNBRGFzam5CU05CUllhc2hJQUFBSUFnQnlXb0ZMT2hFR09RWThOUWNwUk13MUNURG5SbVdKT2FqTVZVNUE1RUoxMEVobHFRZGxlTWdzQUFJQWdBQ0RBQkJBWUlDajRRZ2lJTVFBQVFZak1FQW1GVmJEQW9Bd2FIT1lCd0FORWhFUUFrSmlnU0x1NGdDNERYTkRGWFFkQ0NFSVFnbGdjUUFFSk9EamhoaWZlOElRYm5LQlRWT29nQUFBQUFBQU1BT0FCQU9DZ0FDSWltcXV3dU1ESTBOamc2UEFJQUFBQUFBQVdBUGdBQURnK2dJaUk1aW9zTGpBeU5EWTRPandDQUFBQUFBQUFBQUNBZ0lBQUFBQUFBRUFBQUFDQWdFOW5aMU1BQkFFQUFBQUFBQUFBWGNYZUZ3SUFBQUJxMm5weEFnRUJBQW89JyxcbiAgLy8gIGVtcHR5TXAzOiAnLy91UXhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVNXNW1id0FBQUE4QUFBQUJBQUFEUWdELy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy84QUFBQTVURUZOUlRNdU9UbHlBYzBBQUFBQUFBQUFBQlNBSkFKQVFnQUFnQUFBQTBMMllMUXhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQS8vdVF4QUFEd0FBQnBBQUFBQ0FBQURTQUFBQUVURUZOUlRNdU9Ua3VOVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYnLFxuICBoaWdodGljazogJ1VrbEdSa1FGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZU0FGQUFDeC94Zi9kQURPQUN3QnNQM3ArNkgrekFHb0JPa0NDd0JYL0VINU92eGxBNGtKMndjU0FyVDlFL3V0K0hUMmV2VXg5OG42T0FGNUNDVU13UXZmQ09zSnhBeDBEU0lNRUFxOUJpQUIzdmh6N21Ma1Q5c1IxMzNZeE4yczVRTHYwdnJVQm53Um54dVFKZUVzU0RDaU1kOHlGUzhhS0ZJaG9oVXNDS2o2NHU2MjVPcmFBOUh1eVBuRWxjUCt3eHZKV3RXMjU2MzdWUTBqSFBnbkJURERNMW8wQ3pLTEsrOGh6aGdGRE96OFNlNEo0N0RZVnRHMHo1ZlFxOUxCMTJyZkErajk5cm9IQWhlbEl5TXdJamRUT3VVOG1qd0lPR294aENiNUU1My9qKzNrMy9mVFk4cFR3NHkvVHIrZXc4RE12ZHNrOFJjSFJSa1NLTzR5R1RrSFBrVS9yenp5TmNnc3JSOTREcC81citaczE3ek9uY29EeGhmRTM4V0x5bi9UZU9NaTlyMElSeGxSS0lRenlUbE9QS285eWptV01jb2tEUkxjL1k3cnVkdGR6dS9EMkwxSXUrMjdKY0czeVlyVkx1amwrM1VPWngxVUs1UTBxem1OUERrOFpqZWVNUG9qemhIKy9qTHRQZDVtMGhITEhzWUl3NVRFTU1uQTBqdmo4ZlNPQml3WEFTWmdNek04ZFVCR1FiSStyempwS2tJWnlnWlQ5UWZsY2RhUnlxWEN6NytWd1VQSDc4NHIzSzdzK3YwS0R1OGJ2eWVMTWI0M05qcmhPSW8wZFN2UUhpMFBuUDZpN292ZzNOVHh5NC9HZjhYOHlIL1FCdHZYNTVQMllnYjBGY1Vqc3k0TE5tSTVlamlYTTM4cjdpQzhGSndIUHZvazdkRGdRZGFKemxUS0lzb0Z6c3JWa3VBODdkLzZxQWk3RlEwaDlDbEtNTEV6M1RPck1CY3FZU0Q4RTlBRmQvZFM2a1RmNmRiVTBYblF2OUlIMk1YZlorbG45REVBRnd3ZEZ5OGdpaWI2S2F3cWVDaGdJL1ViSEJPVENaai92dlhlN0lubEZ1RE4zUDNiMGQxRjRnenBpZkcyK3U0RDdRdzFGZndibkNEK0lsZ2pXeUhMSFBNVm9nMm1CTDM3cXZQKzdOdm5ZdVR2NHJ2amZ1Yk42azN3cFBaMC9Xa0VPd3RpRVVzV2N4bStHbDRhT2hoaUZEQVBJd21iQXRuN1RQVnk3N3pxY2VmcjVZSG1IdWxsN2VueWZQbWNBSGdIZXcxUkVyOFZoaGQvRitBVjFSSjBEaWtKV1FOYy9aUDNlZktkN2h2czJ1cjQ2ckhzNXU4ZTlOLzQ4LzBoQS84SEZnd3VEMDRSU0JJUkVxc1FPZzdtQ3NzR01BSlcvWG40Ry9USzhMYnV6dTBJN3FUdm5QSnk5c1g2YlA4NEJMWUliQXdkRDg0UVl4RzdFT2NPREF4d0NGTUVBUUM5KzdQM1N2VFg4WEh3K3U5UjhLVHhJdlNvOStYN1ZRQ1VCSjBJTXd6aURqNFFMaEFHRDlVTXJnblRCWmNCUnYxditYdjJVZlMrOHRmeCt2RVM4N3owK3ZiMytaZjlaZ0VRQlNFSVVBcldDOGtNMlF5ekM1RUpFQWR2QkhnQlhQNW4rK3I0QXZkODlXajA3Zk13OUQzMUp2ZnArVWo5eFFEOUE4UUc1UWhYQ2xFTHJBc3ZDOXdKN2dkNkJXSUMzdjZPKzdUNFBQWk45RUh6V3ZOZjlQejFGdml0K3FMOXJRQ0hBd0VHL3dlQ0NaVUtGd3ZEQ25JSmNBY1FCV2NDYWY4Wi9DRDU1dmFCOWREMHdQU1A5VUwzbS9rNy9NeitKd0V5QXc4RnpBWTdDQnNKYVFrNUNXa0kyZ2F0QkNJQ1lmK2ovRnI2dmZpVjk4NzJzZlpQOTF6NHAvbFIrM0g5emY4OUFyb0VGQWZqQ1AwSmN3bzhDakFKZFFkZ0JTRURrZ0RRL1ZqN1pmblI5NVQyOGZVZDl2MzJWdmcyK25iOCsvNnhBV29FNEFiRENQNEpwQXFiQ3FRSjB3ZUVCZmdDVEFDVC9SMzdNL20rOTY3MklQWTY5Z2IzYWZoVyt0VDhxZitNQWowRmdnY3VDU2NLWEFyaUNjTUlFQWZ5QkpZQ0Z3Q1AvUno3QS9sNzkzejJGL1puOW1IMzdmamQraTM5eWY5cEF0MEVGQWZSQ05rSkdBcXJDWllJdmdaUEJKOEI2UDQvL00zNTB2ZHo5cS8xbGZVcTltejNSUG1pKzNIK2JnRlZCT1FHM3dnSENrd0swQW03Q0NBSENnV21BakFBJyxcbiAgbG93dGljazogJ1VrbEdSbFFGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZVEFGQUFCMC81ditVLzRULzNnQTB3RlRBdVVCK2Y4ZC9uVDkwZjFxL3ViK3RmNDYvbWIvOHdGUUE5Z0M3d0NkL21yK0ZBR1JBM2NFNndKZi9oMzZldm12Kzh2L053UkhCWlVDMi82MCsvLzVFdnVaL2FYL2JnRk9BcDhBenZ6aDl3ZnpMUEY2OHpUNHkvMkJBeWdJZlF3YUVqWVkweDMxSXJ3bDhTT1dIVkVTT2dQaDlOZnBSZUZ0MjJuWUhkZEQyQlhjWmVEYTVJbnFnUER4OW5QKzZnUzRDQllMbncwekVTMFdYeHY0SGtjZ0xoLzFHK0VYMVJOcEQ0d0tpZ1hILzZyNS9mTnU3bFRwaitadTVoSG9YT3RMNzFieXIvUXA5MUw2NHY2T0JPNEpvUTV6RXNrVStoVTFGaVFWZVJQN0VXZ1A0UXIwQklUK3RQaWQ5QzN5MXZDaDhGRHhKdksyOHZ2eXkvTEE4cEx6VS9YUDk1djZ4dnc0L3VEL1JBSzJCU2tLY2c2QkVTY1RaQk1lRXFrUFRReGpDS0VFVndGaS9udjdoL2hwOWFEeUF2SFA4TWZ4THZNKzlQWDB1UFcxOWcvNExmcjcvQzRBS2dOYUJYUUd5d2IwQmhJSFdRZldCMW9JekFqdENGOElId2R0QmFrRFZ3S0xBZVlBOHY5dy9rajgxL25ROTR2MjkvWFg5YnoxYlBVWTlVejFaL2FIK0hyN3lQNE1BaTRGK3djZkNuWUxOZ3lmRFBzTVN3MHNEVUFNZmdyY0I1SUVNd0ZiL2lYOFQvcFQrTy8xWC9NZjhjYnZyTysxOE1MeXZmVlArUmY5d2dBb0JDRUhwd25JQzVFTjRRNUFEM3dPMUF5MENwc0l2d2J2Qk5jQ2JRQXIvblg4T2ZzZit2YjRtdmRhOXJqMXovV1g5cEwzYS9oSCtaWDZSL3duL3ZQL2VRRVNBL0FFK3dZRENjd0tGQXlQRENrTUZRdVNDZTRIVlFiU0JIUURDd0k4QU5MOUpQdVkrSFgyOHZUcTgyUHpkUE1WOUF6MU1mWjQ5ekQ1Z2Z0eC9zUUJCUVhMQjhjSi9ncXBDdzhNaWd3V0RYRU5YUTJyRERVTDdRZ0RCc3dDZHY4Uy9LNzRXUFZrOGhYd291NFA3bXZ1MSs5VDhwejFVdmxpL1pvQndnV1JDY3NNUGcvQ0VFUVI0UkRBRHdvTzl3dXNDVk1INEFSU0Fwbi91ZnpkK1dqM2J2WDc4eHp6eC9MNjhxenoxdlNEOXFYNEdmdmQvYzBBaHdPL0JXd0htZ2h2Q1FFS1ZRb25DbHNKQ3dpSUJoMEYwZ09nQW0wQk93QXgvMDMrWFAwZy9MYjZjUG1YK0YvNHZmaCsrVEg2cy9vcys3LzdjdndML1p6OVhQNU8vM0lBM0FGOUF6c0Y5Z2FVQ0FBS0hndWVDemNMOXdudEIzc0Y0d0l6QUkzOTZmcDErR3YySXZXbjlOMzBwL1hpOW03NEcvcnUrOVA5ay84YUFZRUMxQU1UQlNJRzB3WXVCMWdIa2djQUNHRUlTQWhUQnpFRldBS3QvNUw5MmZ1VSt2WDUwZm1mK1NQNWkvZ2IrQmY0bXZpditTcjdrdnliL1VqK3IvNFgvOHIvK2dDaUFvMEVVQWFSQnp3SVN3anFCM0lIR1FmQ0J2OEZwZ1RNQXBRQUtmNjcrNW41L3ZmbjlqejJ5UFZuOVNMMVJQWHE5U1AzRHZtcis2ZitzUUdLQkFjSCt3aE9DaDBMYXdzM0MyOEtMQW1EQjVBRmZRTm9BVlAvWnYzZSs3UDZzZm5MK0N2NHZQZU05NWIzN2ZlVitKbjUxUG9xL0xMOW12K1lBVllEM2dRdUJtY0hTQWlrQ0lFSTdBZitCdUVGbmdRWEExc0J2Lzl2L3BmOU1QM1cvRmo4cS9zUis2SDZVL28zK21QNnkvcE4rL2Y3eHZ5ZS9XSCtKZjltQUQ0Q1FBUUpCaXNIdGdmNkJ3MEk4UWRzQjFzR3l3VDRBZ2dCQ1Avby9LWDZtUGcxOTU3MmpmYXo5dWYyUy9jTStFMzVFL3RXL2FmLzV3SDFBOEFGS2dma0IvQUhnd2Z4QmxBR2dRVklCTU1DSndHcy80Myt2UDBpL1pyOExmemwrOUg3NmZ2aSs5Zjc1ZnNmL0luOEJQMTAvZWo5Y2Y0Ty83Zi9kQUFjQWFVQkVnS01BaGdEcEFNRUJDRUVEd1RmQTNJRHhRTDhBU29CVXdDRy84NytKLzZoL1JyOXBQeGsvR2I4b1B3Si9YSDl3LzM5L1VEK3FQNDEvOUQvV3dEZUFHc0JBZ0tkQWhFRFFRTkFBMHNEYndPVkE1WURWd1BPQWhnQ1ZBR1JBQT09J1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gc2FtcGxlczsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnNhdmVBc01JRElGaWxlID0gc2F2ZUFzTUlESUZpbGU7XG5cbnZhciBfZmlsZXNhdmVyanMgPSByZXF1aXJlKCdmaWxlc2F2ZXJqcycpO1xuXG52YXIgUFBRID0gOTYwOyAvKlxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFRoaXMgY29kZSBpcyBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vc2VyZ2kvanNtaWRpXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIGluZm86IGh0dHA6Ly93d3cuZGVsdWdlLmNvLz9xPW1pZGktdGVtcG8tYnBtXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICovXG5cbnZhciBIRFJfUFBRID0gc3RyMkJ5dGVzKFBQUS50b1N0cmluZygxNiksIDIpO1xuXG52YXIgSERSX0NIVU5LSUQgPSBbJ00nLmNoYXJDb2RlQXQoMCksICdUJy5jaGFyQ29kZUF0KDApLCAnaCcuY2hhckNvZGVBdCgwKSwgJ2QnLmNoYXJDb2RlQXQoMCldO1xudmFyIEhEUl9DSFVOS19TSVpFID0gWzB4MCwgMHgwLCAweDAsIDB4Nl07IC8vIEhlYWRlciBzaXplIGZvciBTTUZcbnZhciBIRFJfVFlQRTAgPSBbMHgwLCAweDBdOyAvLyBNaWRpIFR5cGUgMCBpZFxudmFyIEhEUl9UWVBFMSA9IFsweDAsIDB4MV07IC8vIE1pZGkgVHlwZSAxIGlkXG4vL0hEUl9QUFEgPSBbMHgwMSwgMHhFMF0gLy8gRGVmYXVsdHMgdG8gNDgwIHRpY2tzIHBlciBiZWF0XG4vL0hEUl9QUFEgPSBbMHgwMCwgMHg4MF0gLy8gRGVmYXVsdHMgdG8gMTI4IHRpY2tzIHBlciBiZWF0XG5cbnZhciBUUktfQ0hVTktJRCA9IFsnTScuY2hhckNvZGVBdCgwKSwgJ1QnLmNoYXJDb2RlQXQoMCksICdyJy5jaGFyQ29kZUF0KDApLCAnaycuY2hhckNvZGVBdCgwKV07XG5cbi8vIE1ldGEgZXZlbnQgY29kZXNcbnZhciBNRVRBX1NFUVVFTkNFID0gMHgwMDtcbnZhciBNRVRBX1RFWFQgPSAweDAxO1xudmFyIE1FVEFfQ09QWVJJR0hUID0gMHgwMjtcbnZhciBNRVRBX1RSQUNLX05BTUUgPSAweDAzO1xudmFyIE1FVEFfSU5TVFJVTUVOVCA9IDB4MDQ7XG52YXIgTUVUQV9MWVJJQyA9IDB4MDU7XG52YXIgTUVUQV9NQVJLRVIgPSAweDA2O1xudmFyIE1FVEFfQ1VFX1BPSU5UID0gMHgwNztcbnZhciBNRVRBX0NIQU5ORUxfUFJFRklYID0gMHgyMDtcbnZhciBNRVRBX0VORF9PRl9UUkFDSyA9IDB4MmY7XG52YXIgTUVUQV9URU1QTyA9IDB4NTE7XG52YXIgTUVUQV9TTVBURSA9IDB4NTQ7XG52YXIgTUVUQV9USU1FX1NJRyA9IDB4NTg7XG52YXIgTUVUQV9LRVlfU0lHID0gMHg1OTtcbnZhciBNRVRBX1NFUV9FVkVOVCA9IDB4N2Y7XG5cbmZ1bmN0aW9uIHNhdmVBc01JRElGaWxlKHNvbmcpIHtcbiAgdmFyIGZpbGVOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gc29uZy5uYW1lIDogYXJndW1lbnRzWzFdO1xuICB2YXIgcHBxID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gOTYwIDogYXJndW1lbnRzWzJdO1xuXG5cbiAgUFBRID0gcHBxO1xuICBIRFJfUFBRID0gc3RyMkJ5dGVzKFBQUS50b1N0cmluZygxNiksIDIpO1xuXG4gIHZhciBieXRlQXJyYXkgPSBbXS5jb25jYXQoSERSX0NIVU5LSUQsIEhEUl9DSFVOS19TSVpFLCBIRFJfVFlQRTEpO1xuICB2YXIgdHJhY2tzID0gc29uZy5nZXRUcmFja3MoKTtcbiAgdmFyIG51bVRyYWNrcyA9IHRyYWNrcy5sZW5ndGggKyAxO1xuICB2YXIgaSA9IHZvaWQgMCxcbiAgICAgIG1heGkgPSB2b2lkIDAsXG4gICAgICB0cmFjayA9IHZvaWQgMCxcbiAgICAgIG1pZGlGaWxlID0gdm9pZCAwLFxuICAgICAgZGVzdGluYXRpb24gPSB2b2lkIDAsXG4gICAgICBiNjQgPSB2b2lkIDA7XG4gIHZhciBhcnJheUJ1ZmZlciA9IHZvaWQgMCxcbiAgICAgIGRhdGFWaWV3ID0gdm9pZCAwLFxuICAgICAgdWludEFycmF5ID0gdm9pZCAwO1xuXG4gIGJ5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQoc3RyMkJ5dGVzKG51bVRyYWNrcy50b1N0cmluZygxNiksIDIpLCBIRFJfUFBRKTtcblxuICAvL2NvbnNvbGUubG9nKGJ5dGVBcnJheSk7XG4gIGJ5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQodHJhY2tUb0J5dGVzKHNvbmcuX3RpbWVFdmVudHMsIHNvbmcuX2R1cmF0aW9uVGlja3MsICd0ZW1wbycpKTtcblxuICBmb3IgKGkgPSAwLCBtYXhpID0gdHJhY2tzLmxlbmd0aDsgaSA8IG1heGk7IGkrKykge1xuICAgIHRyYWNrID0gdHJhY2tzW2ldO1xuICAgIHZhciBpbnN0cnVtZW50ID0gdm9pZCAwO1xuICAgIGlmICh0cmFjay5faW5zdHJ1bWVudCAhPT0gbnVsbCkge1xuICAgICAgaW5zdHJ1bWVudCA9IHRyYWNrLl9pbnN0cnVtZW50LmlkO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIHRyYWNrLl9ldmVudHMubGVuZ3RoLCBpbnN0cnVtZW50KVxuICAgIGJ5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQodHJhY2tUb0J5dGVzKHRyYWNrLl9ldmVudHMsIHNvbmcuX2R1cmF0aW9uVGlja3MsIHRyYWNrLm5hbWUsIGluc3RydW1lbnQpKTtcbiAgICAvL2J5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQodHJhY2tUb0J5dGVzKHRyYWNrLl9ldmVudHMsIHNvbmcuX2xhc3RFdmVudC5pY2tzLCB0cmFjay5uYW1lLCBpbnN0cnVtZW50KSlcbiAgfVxuXG4gIC8vYjY0ID0gYnRvYShjb2RlczJTdHIoYnl0ZUFycmF5KSlcbiAgLy93aW5kb3cubG9jYXRpb24uYXNzaWduKFwiZGF0YTphdWRpby9taWRpO2Jhc2U2NCxcIiArIGI2NClcbiAgLy9jb25zb2xlLmxvZyhiNjQpLy8gc2VuZCB0byBzZXJ2ZXJcblxuICBtYXhpID0gYnl0ZUFycmF5Lmxlbmd0aDtcbiAgYXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIobWF4aSk7XG4gIHVpbnRBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcbiAgZm9yIChpID0gMDsgaSA8IG1heGk7IGkrKykge1xuICAgIHVpbnRBcnJheVtpXSA9IGJ5dGVBcnJheVtpXTtcbiAgfVxuICBtaWRpRmlsZSA9IG5ldyBCbG9iKFt1aW50QXJyYXldLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi94LW1pZGknLCBlbmRpbmdzOiAndHJhbnNwYXJlbnQnIH0pO1xuICBmaWxlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL1xcLm1pZGkkLywgJycpO1xuICAvL2xldCBwYXR0ID0gL1xcLm1pZFtpXXswLDF9JC9cbiAgdmFyIHBhdHQgPSAvXFwubWlkJC87XG4gIHZhciBoYXNFeHRlbnNpb24gPSBwYXR0LnRlc3QoZmlsZU5hbWUpO1xuICBpZiAoaGFzRXh0ZW5zaW9uID09PSBmYWxzZSkge1xuICAgIGZpbGVOYW1lICs9ICcubWlkJztcbiAgfVxuICAvL2NvbnNvbGUubG9nKGZpbGVOYW1lLCBoYXNFeHRlbnNpb24pXG4gICgwLCBfZmlsZXNhdmVyanMuc2F2ZUFzKShtaWRpRmlsZSwgZmlsZU5hbWUpO1xuICAvL3dpbmRvdy5sb2NhdGlvbi5hc3NpZ24od2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwobWlkaUZpbGUpKVxufVxuXG5mdW5jdGlvbiB0cmFja1RvQnl0ZXMoZXZlbnRzLCBsYXN0RXZlbnRUaWNrcywgdHJhY2tOYW1lKSB7XG4gIHZhciBpbnN0cnVtZW50TmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/ICdubyBpbnN0cnVtZW50JyA6IGFyZ3VtZW50c1szXTtcblxuICB2YXIgbGVuZ3RoQnl0ZXMsXG4gICAgICBpLFxuICAgICAgbWF4aSxcbiAgICAgIGV2ZW50LFxuICAgICAgc3RhdHVzLFxuICAgICAgdHJhY2tMZW5ndGgsXG4gICAgICAvLyBudW1iZXIgb2YgYnl0ZXMgaW4gdHJhY2sgY2h1bmtcbiAgdGlja3MgPSAwLFxuICAgICAgZGVsdGEgPSAwLFxuICAgICAgdHJhY2tCeXRlcyA9IFtdO1xuXG4gIGlmICh0cmFja05hbWUpIHtcbiAgICB0cmFja0J5dGVzLnB1c2goMHgwMCk7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAzKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKHRyYWNrTmFtZS5sZW5ndGgpKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoc3RyaW5nVG9OdW1BcnJheSh0cmFja05hbWUpKTtcbiAgfVxuXG4gIGlmIChpbnN0cnVtZW50TmFtZSkge1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDQpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoaW5zdHJ1bWVudE5hbWUubGVuZ3RoKSk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KHN0cmluZ1RvTnVtQXJyYXkoaW5zdHJ1bWVudE5hbWUpKTtcbiAgfVxuXG4gIGZvciAoaSA9IDAsIG1heGkgPSBldmVudHMubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKSB7XG4gICAgZXZlbnQgPSBldmVudHNbaV07XG4gICAgZGVsdGEgPSBldmVudC50aWNrcyAtIHRpY2tzO1xuICAgIGRlbHRhID0gY29udmVydFRvVkxRKGRlbHRhKTtcbiAgICAvL2NvbnNvbGUubG9nKGRlbHRhKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoZGVsdGEpO1xuICAgIC8vdHJhY2tCeXRlcy5wdXNoLmFwcGx5KHRyYWNrQnl0ZXMsIGRlbHRhKTtcbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gMHg4MCB8fCBldmVudC50eXBlID09PSAweDkwKSB7XG4gICAgICAvLyBub3RlIG9mZiwgbm90ZSBvblxuICAgICAgLy9zdGF0dXMgPSBwYXJzZUludChldmVudC50eXBlLnRvU3RyaW5nKDE2KSArIGV2ZW50LmNoYW5uZWwudG9TdHJpbmcoMTYpLCAxNik7XG4gICAgICBzdGF0dXMgPSBldmVudC50eXBlICsgKGV2ZW50LmNoYW5uZWwgfHwgMCk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goc3RhdHVzKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChldmVudC5kYXRhMSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQuZGF0YTIpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gMHg1MSkge1xuICAgICAgLy8gdGVtcG9cbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDUxKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDAzKTsgLy8gbGVuZ3RoXG4gICAgICAvL3RyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoMykpOy8vIGxlbmd0aFxuICAgICAgdmFyIG1pY3JvU2Vjb25kcyA9IE1hdGgucm91bmQoNjAwMDAwMDAgLyBldmVudC5icG0pO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5icG0pXG4gICAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoc3RyMkJ5dGVzKG1pY3JvU2Vjb25kcy50b1N0cmluZygxNiksIDMpKTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09IDB4NTgpIHtcbiAgICAgIC8vIHRpbWUgc2lnbmF0dXJlXG4gICAgICB2YXIgZGVub20gPSBldmVudC5kZW5vbWluYXRvcjtcbiAgICAgIGlmIChkZW5vbSA9PT0gMikge1xuICAgICAgICBkZW5vbSA9IDB4MDE7XG4gICAgICB9IGVsc2UgaWYgKGRlbm9tID09PSA0KSB7XG4gICAgICAgIGRlbm9tID0gMHgwMjtcbiAgICAgIH0gZWxzZSBpZiAoZGVub20gPT09IDgpIHtcbiAgICAgICAgZGVub20gPSAweDAzO1xuICAgICAgfSBlbHNlIGlmIChkZW5vbSA9PT0gMTYpIHtcbiAgICAgICAgZGVub20gPSAweDA0O1xuICAgICAgfSBlbHNlIGlmIChkZW5vbSA9PT0gMzIpIHtcbiAgICAgICAgZGVub20gPSAweDA1O1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5kZW5vbWluYXRvciwgZXZlbnQubm9taW5hdG9yKVxuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4NTgpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4MDQpOyAvLyBsZW5ndGhcbiAgICAgIC8vdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUSg0KSk7Ly8gbGVuZ3RoXG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChkZW5vbSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goUFBRIC8gZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDA4KTsgLy8gMzJuZCBub3RlcyBwZXIgY3JvdGNoZXRcbiAgICAgIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCBldmVudC5ub21pbmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yLCBkZW5vbSwgUFBRL2V2ZW50Lm5vbWluYXRvcik7XG4gICAgfVxuICAgIC8vIHNldCB0aGUgbmV3IHRpY2tzIHJlZmVyZW5jZVxuICAgIC8vY29uc29sZS5sb2coc3RhdHVzLCBldmVudC50aWNrcywgdGlja3MpO1xuICAgIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIH1cbiAgZGVsdGEgPSBsYXN0RXZlbnRUaWNrcyAtIHRpY2tzO1xuICAvL2NvbnNvbGUubG9nKCdkJywgZGVsdGEsICd0JywgdGlja3MsICdsJywgbGFzdEV2ZW50VGlja3MpO1xuICBkZWx0YSA9IGNvbnZlcnRUb1ZMUShkZWx0YSk7XG4gIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCB0aWNrcywgZGVsdGEpO1xuICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoZGVsdGEpO1xuICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gIHRyYWNrQnl0ZXMucHVzaCgweDJGKTtcbiAgdHJhY2tCeXRlcy5wdXNoKDB4MDApO1xuICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgdHJhY2tCeXRlcyk7XG4gIHRyYWNrTGVuZ3RoID0gdHJhY2tCeXRlcy5sZW5ndGg7XG4gIGxlbmd0aEJ5dGVzID0gc3RyMkJ5dGVzKHRyYWNrTGVuZ3RoLnRvU3RyaW5nKDE2KSwgNCk7XG4gIHJldHVybiBbXS5jb25jYXQoVFJLX0NIVU5LSUQsIGxlbmd0aEJ5dGVzLCB0cmFja0J5dGVzKTtcbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuXG4vKlxuICogQ29udmVydHMgYW4gYXJyYXkgb2YgYnl0ZXMgdG8gYSBzdHJpbmcgb2YgaGV4YWRlY2ltYWwgY2hhcmFjdGVycy4gUHJlcGFyZXNcbiAqIGl0IHRvIGJlIGNvbnZlcnRlZCBpbnRvIGEgYmFzZTY0IHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gYnl0ZUFycmF5IHtBcnJheX0gYXJyYXkgb2YgYnl0ZXMgdGhhdCB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZ1xuICogQHJldHVybnMgaGV4YWRlY2ltYWwgc3RyaW5nXG4gKi9cblxuZnVuY3Rpb24gY29kZXMyU3RyKGJ5dGVBcnJheSkge1xuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBieXRlQXJyYXkpO1xufVxuXG4vKlxuICogQ29udmVydHMgYSBTdHJpbmcgb2YgaGV4YWRlY2ltYWwgdmFsdWVzIHRvIGFuIGFycmF5IG9mIGJ5dGVzLiBJdCBjYW4gYWxzb1xuICogYWRkIHJlbWFpbmluZyAnMCcgbmliYmxlcyBpbiBvcmRlciB0byBoYXZlIGVub3VnaCBieXRlcyBpbiB0aGUgYXJyYXkgYXMgdGhlXG4gKiB8ZmluYWxCeXRlc3wgcGFyYW1ldGVyLlxuICpcbiAqIEBwYXJhbSBzdHIge1N0cmluZ30gc3RyaW5nIG9mIGhleGFkZWNpbWFsIHZhbHVlcyBlLmcuICcwOTdCOEEnXG4gKiBAcGFyYW0gZmluYWxCeXRlcyB7SW50ZWdlcn0gT3B0aW9uYWwuIFRoZSBkZXNpcmVkIG51bWJlciBvZiBieXRlcyB0aGF0IHRoZSByZXR1cm5lZCBhcnJheSBzaG91bGQgY29udGFpblxuICogQHJldHVybnMgYXJyYXkgb2YgbmliYmxlcy5cbiAqL1xuXG5mdW5jdGlvbiBzdHIyQnl0ZXMoc3RyLCBmaW5hbEJ5dGVzKSB7XG4gIGlmIChmaW5hbEJ5dGVzKSB7XG4gICAgd2hpbGUgKHN0ci5sZW5ndGggLyAyIDwgZmluYWxCeXRlcykge1xuICAgICAgc3RyID0gJzAnICsgc3RyO1xuICAgIH1cbiAgfVxuXG4gIHZhciBieXRlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gc3RyLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAyKSB7XG4gICAgdmFyIGNoYXJzID0gaSA9PT0gMCA/IHN0cltpXSA6IHN0cltpIC0gMV0gKyBzdHJbaV07XG4gICAgYnl0ZXMudW5zaGlmdChwYXJzZUludChjaGFycywgMTYpKTtcbiAgfVxuXG4gIHJldHVybiBieXRlcztcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGVzIG51bWJlciBvZiB0aWNrcyB0byBNSURJIHRpbWVzdGFtcCBmb3JtYXQsIHJldHVybmluZyBhbiBhcnJheSBvZlxuICogYnl0ZXMgd2l0aCB0aGUgdGltZSB2YWx1ZXMuIE1pZGkgaGFzIGEgdmVyeSBwYXJ0aWN1bGFyIHRpbWUgdG8gZXhwcmVzcyB0aW1lLFxuICogdGFrZSBhIGdvb2QgbG9vayBhdCB0aGUgc3BlYyBiZWZvcmUgZXZlciB0b3VjaGluZyB0aGlzIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB0aWNrcyB7SW50ZWdlcn0gTnVtYmVyIG9mIHRpY2tzIHRvIGJlIHRyYW5zbGF0ZWRcbiAqIEByZXR1cm5zIEFycmF5IG9mIGJ5dGVzIHRoYXQgZm9ybSB0aGUgTUlESSB0aW1lIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRUb1ZMUSh0aWNrcykge1xuICB2YXIgYnVmZmVyID0gdGlja3MgJiAweDdGO1xuXG4gIHdoaWxlICh0aWNrcyA9IHRpY2tzID4+IDcpIHtcbiAgICBidWZmZXIgPDw9IDg7XG4gICAgYnVmZmVyIHw9IHRpY2tzICYgMHg3RiB8IDB4ODA7XG4gIH1cblxuICB2YXIgYkxpc3QgPSBbXTtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBiTGlzdC5wdXNoKGJ1ZmZlciAmIDB4ZmYpO1xuXG4gICAgaWYgKGJ1ZmZlciAmIDB4ODApIHtcbiAgICAgIGJ1ZmZlciA+Pj0gODtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyh0aWNrcywgYkxpc3QpO1xuICByZXR1cm4gYkxpc3Q7XG59XG5cbi8qXG4gKiBDb252ZXJ0cyBhIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIEFTQ0lJIGNoYXIgY29kZXMgZm9yIGV2ZXJ5IGNoYXJhY3RlciBvZlxuICogdGhlIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gc3RyIHtTdHJpbmd9IFN0cmluZyB0byBiZSBjb252ZXJ0ZWRcbiAqIEByZXR1cm5zIGFycmF5IHdpdGggdGhlIGNoYXJjb2RlIHZhbHVlcyBvZiB0aGUgc3RyaW5nXG4gKi9cbnZhciBBUCA9IEFycmF5LnByb3RvdHlwZTtcbmZ1bmN0aW9uIHN0cmluZ1RvTnVtQXJyYXkoc3RyKSB7XG4gIC8vIHJldHVybiBzdHIuc3BsaXQoKS5mb3JFYWNoKGNoYXIgPT4ge1xuICAvLyAgIHJldHVybiBjaGFyLmNoYXJDb2RlQXQoMClcbiAgLy8gfSlcbiAgcmV0dXJuIEFQLm1hcC5jYWxsKHN0ciwgZnVuY3Rpb24gKGNoYXIpIHtcbiAgICByZXR1cm4gY2hhci5jaGFyQ29kZUF0KDApO1xuICB9KTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfaW5pdF9taWRpID0gcmVxdWlyZSgnLi9pbml0X21pZGknKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfbWlkaV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaV9ldmVudCcpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vIG1pbGxpc1xuXG52YXIgU2NoZWR1bGVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTY2hlZHVsZXIoc29uZykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTY2hlZHVsZXIpO1xuXG4gICAgdGhpcy5zb25nID0gc29uZztcbiAgICB0aGlzLm5vdGVzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuYnVmZmVyVGltZSA9IHNvbmcuYnVmZmVyVGltZTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTY2hlZHVsZXIsIFt7XG4gICAga2V5OiAnaW5pdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluaXQobWlsbGlzKSB7XG4gICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gbWlsbGlzO1xuICAgICAgdGhpcy5zb25nU3RhcnRNaWxsaXMgPSBtaWxsaXM7XG4gICAgICB0aGlzLmV2ZW50cyA9IHRoaXMuc29uZy5fYWxsRXZlbnRzO1xuICAgICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGg7XG4gICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAgIHRoaXMubWF4dGltZSA9IDA7XG4gICAgICB0aGlzLnByZXZNYXh0aW1lID0gMDtcbiAgICAgIHRoaXMuYmV5b25kTG9vcCA9IGZhbHNlOyAvLyB0ZWxscyB1cyBpZiB0aGUgcGxheWhlYWQgaGFzIGFscmVhZHkgcGFzc2VkIHRoZSBsb29wZWQgc2VjdGlvblxuICAgICAgdGhpcy5wcmVjb3VudGluZ0RvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMubG9vcGVkID0gZmFsc2U7XG4gICAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZ1N0YXJ0TWlsbGlzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGVTb25nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlU29uZygpIHtcbiAgICAgIC8vdGhpcy5zb25nQ3VycmVudE1pbGxpcyA9IHRoaXMuc29uZy5fY3VycmVudE1pbGxpc1xuICAgICAgdGhpcy5ldmVudHMgPSB0aGlzLnNvbmcuX2FsbEV2ZW50cztcbiAgICAgIHRoaXMubnVtRXZlbnRzID0gdGhpcy5ldmVudHMubGVuZ3RoO1xuICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICB0aGlzLm1heHRpbWUgPSAwO1xuICAgICAgLy90aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlXG4gICAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZy5fY3VycmVudE1pbGxpcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0VGltZVN0YW1wJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VGltZVN0YW1wKHRpbWVTdGFtcCkge1xuICAgICAgdGhpcy50aW1lU3RhbXAgPSB0aW1lU3RhbXA7IC8vIHRpbWVzdGFtcCBXZWJBdWRpbyBjb250ZXh0IC0+IGZvciBpbnRlcm5hbCBpbnN0cnVtZW50c1xuICAgICAgdGhpcy50aW1lU3RhbXAyID0gcGVyZm9ybWFuY2Uubm93KCk7IC8vIHRpbWVzdGFtcCBzaW5jZSBvcGVuaW5nIHdlYnBhZ2UgLT4gZm9yIGV4dGVybmFsIGluc3RydW1lbnRzXG4gICAgfVxuXG4gICAgLy8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgZXZlbnQgdGhhdCBoYXMgaXRzIG1pbGxpcyB2YWx1ZSBhdCBvciByaWdodCBhZnRlciB0aGUgcHJvdmlkZWQgbWlsbGlzIHZhbHVlXG5cbiAgfSwge1xuICAgIGtleTogJ3NldEluZGV4JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0SW5kZXgobWlsbGlzKSB7XG4gICAgICB2YXIgaSA9IDA7XG4gICAgICB2YXIgZXZlbnQgPSB2b2lkIDA7XG4gICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gdGhpcy5ldmVudHNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgICAgZXZlbnQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgIGlmIChldmVudC5taWxsaXMgPj0gbWlsbGlzKSB7XG4gICAgICAgICAgICB0aGlzLmluZGV4ID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmJleW9uZExvb3AgPSBtaWxsaXMgPiB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXM7XG4gICAgICAvLyB0aGlzLm5vdGVzID0gbmV3IE1hcCgpXG4gICAgICAvL3RoaXMubG9vcGVkID0gZmFsc2VcbiAgICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2U7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0RXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RXZlbnRzKCkge1xuICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuXG4gICAgICBpZiAodGhpcy5zb25nLl9sb29wID09PSB0cnVlICYmIHRoaXMuc29uZy5fbG9vcER1cmF0aW9uIDwgdGhpcy5idWZmZXJUaW1lKSB7XG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ1N0YXJ0TWlsbGlzICsgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gLSAxO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5zb25nLmxvb3BEdXJhdGlvbik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnNvbmcuX2xvb3AgPT09IHRydWUpIHtcblxuICAgICAgICBpZiAodGhpcy5tYXh0aW1lID49IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAmJiB0aGlzLmJleW9uZExvb3AgPT09IGZhbHNlKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnTE9PUCcsIHRoaXMubWF4dGltZSwgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKVxuXG4gICAgICAgICAgdmFyIGRpZmYgPSB0aGlzLm1heHRpbWUgLSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXM7XG4gICAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXMgKyBkaWZmO1xuXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLUxPT1BFRCcsIHRoaXMubWF4dGltZSwgZGlmZiwgdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXMsIHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyk7XG5cbiAgICAgICAgICBpZiAodGhpcy5sb29wZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLmxvb3BlZCA9IHRydWU7XG4gICAgICAgICAgICB2YXIgbGVmdE1pbGxpcyA9IHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzO1xuICAgICAgICAgICAgdmFyIHJpZ2h0TWlsbGlzID0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5pbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgICAgICAgIGlmIChldmVudC5taWxsaXMgPCByaWdodE1pbGxpcykge1xuICAgICAgICAgICAgICAgIGV2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuICAgICAgICAgICAgICAgIGV2ZW50LnRpbWUyID0gdGhpcy50aW1lU3RhbXAyICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG4gICAgICAgICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IDE0NCkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5ub3Rlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50LnR5cGUpXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgbm90ZXMtPiBhZGQgYSBuZXcgbm90ZSBvZmYgZXZlbnQgYXQgdGhlIHBvc2l0aW9uIG9mIHRoZSByaWdodCBsb2NhdG9yIChlbmQgb2YgdGhlIGxvb3ApXG4gICAgICAgICAgICB2YXIgZW5kVGlja3MgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci50aWNrcyAtIDE7XG4gICAgICAgICAgICB2YXIgZW5kTWlsbGlzID0gdGhpcy5zb25nLmNhbGN1bGF0ZVBvc2l0aW9uKHsgdHlwZTogJ3RpY2tzJywgdGFyZ2V0OiBlbmRUaWNrcywgcmVzdWx0OiAnbWlsbGlzJyB9KS5taWxsaXM7XG5cbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gdGhpcy5ub3Rlcy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBub3RlID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5vdGVPbiA9IG5vdGUubm90ZU9uO1xuICAgICAgICAgICAgICAgIHZhciBub3RlT2ZmID0gbm90ZS5ub3RlT2ZmO1xuICAgICAgICAgICAgICAgIGlmIChub3RlT2ZmLm1pbGxpcyA8PSByaWdodE1pbGxpcykge1xuICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBfZXZlbnQgPSBuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KGVuZFRpY2tzLCAxMjgsIG5vdGVPbi5kYXRhMSwgMCk7XG4gICAgICAgICAgICAgICAgX2V2ZW50Lm1pbGxpcyA9IGVuZE1pbGxpcztcbiAgICAgICAgICAgICAgICBfZXZlbnQuX3BhcnQgPSBub3RlT24uX3BhcnQ7XG4gICAgICAgICAgICAgICAgX2V2ZW50Ll90cmFjayA9IG5vdGVPbi5fdHJhY2s7XG4gICAgICAgICAgICAgICAgX2V2ZW50Lm1pZGlOb3RlID0gbm90ZTtcbiAgICAgICAgICAgICAgICBfZXZlbnQubWlkaU5vdGVJZCA9IG5vdGUuaWQ7XG4gICAgICAgICAgICAgICAgX2V2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIF9ldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICAgICAgICBfZXZlbnQudGltZTIgPSB0aGlzLnRpbWVTdGFtcDIgKyBfZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnYWRkZWQnLCBldmVudClcbiAgICAgICAgICAgICAgICBldmVudHMucHVzaChfZXZlbnQpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgYXVkaW8gc2FtcGxlc1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGkgaW4gdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHMuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvRXZlbnQgPSB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGF1ZGlvRXZlbnQuZW5kTWlsbGlzID4gdGhpcy5zb25nLmxvb3BFbmQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9FdmVudC5zdG9wU2FtcGxlKHRoaXMuc29uZy5sb29wRW5kLzEwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wcGluZyBhdWRpbyBldmVudCcsIGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm5vdGVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRJbmRleChsZWZ0TWlsbGlzKTtcbiAgICAgICAgICAgIHRoaXMudGltZVN0YW1wICs9IHRoaXMuc29uZy5fbG9vcER1cmF0aW9uO1xuICAgICAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyAtPSB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvbjtcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudHMubGVuZ3RoKVxuXG4gICAgICAgICAgICAvLyBnZXQgdGhlIGF1ZGlvIGV2ZW50cyB0aGF0IHN0YXJ0IGJlZm9yZSBzb25nLmxvb3BTdGFydFxuICAgICAgICAgICAgLy90aGlzLmdldERhbmdsaW5nQXVkaW9FdmVudHModGhpcy5zb25nLmxvb3BTdGFydCwgZXZlbnRzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvb3BlZCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy9jb25zb2xlLmxvZygnc2NoZWR1bGVyJywgdGhpcy5sb29wZWQpXG5cbiAgICAgIC8vIG1haW4gbG9vcFxuICAgICAgZm9yICh2YXIgX2kgPSB0aGlzLmluZGV4OyBfaSA8IHRoaXMubnVtRXZlbnRzOyBfaSsrKSB7XG4gICAgICAgIHZhciBfZXZlbnQyID0gdGhpcy5ldmVudHNbX2ldO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgdGhpcy5tYXh0aW1lKVxuICAgICAgICBpZiAoX2V2ZW50Mi5taWxsaXMgPCB0aGlzLm1heHRpbWUpIHtcblxuICAgICAgICAgIC8vZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG5cbiAgICAgICAgICBpZiAoX2V2ZW50Mi50eXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIF9ldmVudDIudGltZSA9IHRoaXMudGltZVN0YW1wICsgX2V2ZW50Mi5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICAgICAgX2V2ZW50Mi50aW1lMiA9IHRoaXMudGltZVN0YW1wMiArIF9ldmVudDIubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKF9ldmVudDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoZGlmZikge1xuICAgICAgdmFyIGksIGV2ZW50LCBudW1FdmVudHMsIHRyYWNrLCBldmVudHM7XG5cbiAgICAgIHRoaXMucHJldk1heHRpbWUgPSB0aGlzLm1heHRpbWU7XG5cbiAgICAgIGlmICh0aGlzLnNvbmcucHJlY291bnRpbmcpIHtcbiAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyArPSBkaWZmO1xuICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgdGhpcy5idWZmZXJUaW1lO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMpXG4gICAgICAgIGV2ZW50cyA9IHRoaXMuc29uZy5fbWV0cm9ub21lLmdldFByZWNvdW50RXZlbnRzKHRoaXMubWF4dGltZSk7XG5cbiAgICAgICAgLy8gaWYoZXZlbnRzLmxlbmd0aCA+IDApe1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwKVxuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50cylcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmICh0aGlzLm1heHRpbWUgPiB0aGlzLnNvbmcuX21ldHJvbm9tZS5lbmRNaWxsaXMgJiYgdGhpcy5wcmVjb3VudGluZ0RvbmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgdmFyIF9ldmVudHM7XG5cbiAgICAgICAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IHRydWU7XG4gICAgICAgICAgdGhpcy50aW1lU3RhbXAgKz0gdGhpcy5zb25nLl9wcmVjb3VudER1cmF0aW9uO1xuXG4gICAgICAgICAgLy8gc3RhcnQgc2NoZWR1bGluZyBldmVudHMgb2YgdGhlIHNvbmcgLT4gYWRkIHRoZSBmaXJzdCBldmVudHMgb2YgdGhlIHNvbmdcbiAgICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCB0aGlzLnNvbmdDdXJyZW50TWlsbGlzKVxuICAgICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZjtcbiAgICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgdGhpcy5idWZmZXJUaW1lO1xuICAgICAgICAgIChfZXZlbnRzID0gZXZlbnRzKS5wdXNoLmFwcGx5KF9ldmVudHMsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmdldEV2ZW50cygpKSk7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudHMpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyArPSBkaWZmO1xuICAgICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyB0aGlzLmJ1ZmZlclRpbWU7XG4gICAgICAgICAgZXZlbnRzID0gdGhpcy5nZXRFdmVudHMoKTtcbiAgICAgICAgICAvL2V2ZW50cyA9IHRoaXMuc29uZy5fZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAgICAgICAvL2V2ZW50cyA9IHRoaXMuZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdkb25lJywgdGhpcy5zb25nQ3VycmVudE1pbGxpcywgZGlmZiwgdGhpcy5pbmRleCwgZXZlbnRzLmxlbmd0aClcbiAgICAgICAgfVxuXG4gICAgICAvLyBpZih0aGlzLnNvbmcudXNlTWV0cm9ub21lID09PSB0cnVlKXtcbiAgICAgIC8vICAgbGV0IG1ldHJvbm9tZUV2ZW50cyA9IHRoaXMuc29uZy5fbWV0cm9ub21lLmdldEV2ZW50czIodGhpcy5tYXh0aW1lLCAodGhpcy50aW1lU3RhbXAgLSB0aGlzLnNvbmdTdGFydE1pbGxpcykpXG4gICAgICAvLyAgIC8vIGlmKG1ldHJvbm9tZUV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAgIC8vICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLm1heHRpbWUsIG1ldHJvbm9tZUV2ZW50cylcbiAgICAgIC8vICAgLy8gfVxuICAgICAgLy8gICAvLyBtZXRyb25vbWVFdmVudHMuZm9yRWFjaChlID0+IHtcbiAgICAgIC8vICAgLy8gICBlLnRpbWUgPSAodGhpcy50aW1lU3RhbXAgKyBlLm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKVxuICAgICAgLy8gICAvLyB9KVxuICAgICAgLy8gICBldmVudHMucHVzaCguLi5tZXRyb25vbWVFdmVudHMpXG4gICAgICAvLyB9XG5cbiAgICAgIG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGg7XG5cbiAgICAgIC8vIGlmKG51bUV2ZW50cyA+IDUpe1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhudW1FdmVudHMpXG4gICAgICAvLyB9XG5cbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCB0aGlzLnNvbmcuX2N1cnJlbnRNaWxsaXMsICdbZGlmZl0nLCB0aGlzLm1heHRpbWUgLSB0aGlzLnByZXZNYXh0aW1lKVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtRXZlbnRzOyBpKyspIHtcbiAgICAgICAgZXZlbnQgPSBldmVudHNbaV07XG4gICAgICAgIHRyYWNrID0gZXZlbnQuX3RyYWNrO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm1heHRpbWUsIHRoaXMucHJldk1heHRpbWUsIGV2ZW50Lm1pbGxpcylcblxuICAgICAgICAvLyBpZihldmVudC5taWxsaXMgPiB0aGlzLm1heHRpbWUpe1xuICAgICAgICAvLyAgIC8vIHNraXAgZXZlbnRzIHRoYXQgd2VyZSBoYXJ2ZXN0IGFjY2lkZW50bHkgd2hpbGUganVtcGluZyB0aGUgcGxheWhlYWQgLT4gc2hvdWxkIGhhcHBlbiB2ZXJ5IHJhcmVseSBpZiBldmVyXG4gICAgICAgIC8vICAgY29uc29sZS5sb2coJ3NraXAnLCBldmVudClcbiAgICAgICAgLy8gICBjb250aW51ZVxuICAgICAgICAvLyB9XG5cbiAgICAgICAgaWYgKGV2ZW50Ll9wYXJ0ID09PSBudWxsIHx8IHRyYWNrID09PSBudWxsKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC5fcGFydC5tdXRlZCA9PT0gdHJ1ZSB8fCB0cmFjay5tdXRlZCA9PT0gdHJ1ZSB8fCBldmVudC5tdXRlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTI4KSAmJiB0eXBlb2YgZXZlbnQubWlkaU5vdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gdGhpcyBpcyB1c3VhbGx5IGNhdXNlZCBieSB0aGUgc2FtZSBub3RlIG9uIHRoZSBzYW1lIHRpY2tzIHZhbHVlLCB3aGljaCBpcyBwcm9iYWJseSBhIGJ1ZyBpbiB0aGUgbWlkaSBmaWxlXG4gICAgICAgICAgLy9jb25zb2xlLmluZm8oJ25vIG1pZGlOb3RlSWQnLCBldmVudClcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyAvY29uc29sZS5sb2coZXZlbnQudGlja3MsIGV2ZW50LnRpbWUsIGV2ZW50Lm1pbGxpcywgZXZlbnQudHlwZSwgZXZlbnQuX3RyYWNrLm5hbWUpXG5cbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJhY2sucHJvY2Vzc01JRElFdmVudChldmVudCk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwLCBldmVudC50aW1lLCB0aGlzLmluZGV4KVxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IDE0NCkge1xuICAgICAgICAgICAgICB0aGlzLm5vdGVzLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09IDEyOCkge1xuICAgICAgICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShldmVudC5taWRpTm90ZUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmKHRoaXMubm90ZXMuc2l6ZSA+IDApe1xuICAgICAgICAgICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLm5vdGVzKVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5pbmRleCwgdGhpcy5udW1FdmVudHMpXG4gICAgICAvL3JldHVybiB0aGlzLmluZGV4ID49IDEwXG4gICAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLm51bUV2ZW50czsgLy8gbGFzdCBldmVudCBvZiBzb25nXG4gICAgfVxuXG4gICAgLypcbiAgICAgIHVuc2NoZWR1bGUoKXtcbiAgICBcbiAgICAgICAgbGV0IG1pbiA9IHRoaXMuc29uZy5fY3VycmVudE1pbGxpc1xuICAgICAgICBsZXQgbWF4ID0gbWluICsgKGJ1ZmZlclRpbWUgKiAxMDAwKVxuICAgIFxuICAgICAgICAvL2NvbnNvbGUubG9nKCdyZXNjaGVkdWxlJywgdGhpcy5ub3Rlcy5zaXplKVxuICAgICAgICB0aGlzLm5vdGVzLmZvckVhY2goKG5vdGUsIGlkKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2cobm90ZSlcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhub3RlLm5vdGVPbi5taWxsaXMsIG5vdGUubm90ZU9mZi5taWxsaXMsIG1pbiwgbWF4KVxuICAgIFxuICAgICAgICAgIGlmKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJyB8fCBub3RlLnN0YXRlID09PSAncmVtb3ZlZCcpe1xuICAgICAgICAgICAgLy9zYW1wbGUudW5zY2hlZHVsZSgwLCB1bnNjaGVkdWxlQ2FsbGJhY2spO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnTk9URSBJUyBVTkRFRklORUQnKVxuICAgICAgICAgICAgLy9zYW1wbGUuc3RvcCgwKVxuICAgICAgICAgICAgdGhpcy5ub3Rlcy5kZWxldGUoaWQpXG4gICAgICAgICAgfWVsc2UgaWYoKG5vdGUubm90ZU9uLm1pbGxpcyA+PSBtaW4gfHwgbm90ZS5ub3RlT2ZmLm1pbGxpcyA8IG1heCkgPT09IGZhbHNlKXtcbiAgICAgICAgICAgIC8vc2FtcGxlLnN0b3AoMClcbiAgICAgICAgICAgIGxldCBub3RlT24gPSBub3RlLm5vdGVPblxuICAgICAgICAgICAgbGV0IG5vdGVPZmYgPSBuZXcgTUlESUV2ZW50KDAsIDEyOCwgbm90ZU9uLmRhdGExLCAwKVxuICAgICAgICAgICAgbm90ZU9mZi5taWRpTm90ZUlkID0gbm90ZS5pZFxuICAgICAgICAgICAgbm90ZU9mZi50aW1lID0gMC8vY29udGV4dC5jdXJyZW50VGltZSArIG1pblxuICAgICAgICAgICAgbm90ZS5fdHJhY2sucHJvY2Vzc01JRElFdmVudChub3RlT2ZmKVxuICAgICAgICAgICAgdGhpcy5ub3Rlcy5kZWxldGUoaWQpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU1RPUFBJTkcnLCBpZCwgbm90ZS5fdHJhY2submFtZSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC8vY29uc29sZS5sb2coJ05PVEVTJywgdGhpcy5ub3Rlcy5zaXplKVxuICAgICAgICAvL3RoaXMubm90ZXMuY2xlYXIoKVxuICAgICAgfVxuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2FsbE5vdGVzT2ZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWxsTm90ZXNPZmYoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgdGltZVN0YW1wID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICB2YXIgb3V0cHV0cyA9ICgwLCBfaW5pdF9taWRpLmdldE1JRElPdXRwdXRzKSgpO1xuICAgICAgb3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChvdXRwdXQpIHtcbiAgICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aW1lU3RhbXAgKyBfdGhpcy5idWZmZXJUaW1lKTsgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXAgKyBfdGhpcy5idWZmZXJUaW1lKTsgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gICAgICB9KTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU2NoZWR1bGVyO1xufSgpO1xuXG4vKlxuXG4gIGdldEV2ZW50czIobWF4dGltZSwgdGltZXN0YW1wKXtcbiAgICBsZXQgbG9vcCA9IHRydWVcbiAgICBsZXQgZXZlbnRcbiAgICBsZXQgcmVzdWx0ID0gW11cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMudGltZUV2ZW50c0luZGV4LCB0aGlzLnNvbmdFdmVudHNJbmRleCwgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleClcbiAgICB3aGlsZShsb29wKXtcblxuICAgICAgbGV0IHN0b3AgPSBmYWxzZVxuXG4gICAgICBpZih0aGlzLnRpbWVFdmVudHNJbmRleCA8IHRoaXMubnVtVGltZUV2ZW50cyl7XG4gICAgICAgIGV2ZW50ID0gdGhpcy50aW1lRXZlbnRzW3RoaXMudGltZUV2ZW50c0luZGV4XVxuICAgICAgICBpZihldmVudC5taWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICB0aGlzLm1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLm1pbGxpc1BlclRpY2spXG4gICAgICAgICAgdGhpcy50aW1lRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHRoaXMuc29uZ0V2ZW50c0luZGV4IDwgdGhpcy5udW1Tb25nRXZlbnRzKXtcbiAgICAgICAgZXZlbnQgPSB0aGlzLnNvbmdFdmVudHNbdGhpcy5zb25nRXZlbnRzSW5kZXhdXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDB4MkYpe1xuICAgICAgICAgIGxvb3AgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgbGV0IG1pbGxpcyA9IGV2ZW50LnRpY2tzICogdGhpcy5taWxsaXNQZXJUaWNrXG4gICAgICAgIGlmKG1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIGV2ZW50LnRpbWUgPSBtaWxsaXMgKyB0aW1lc3RhbXBcbiAgICAgICAgICBldmVudC5taWxsaXMgPSBtaWxsaXNcbiAgICAgICAgICByZXN1bHQucHVzaChldmVudClcbiAgICAgICAgICB0aGlzLnNvbmdFdmVudHNJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN0b3AgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYodGhpcy5zb25nLnVzZU1ldHJvbm9tZSA9PT0gdHJ1ZSAmJiB0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4IDwgdGhpcy5udW1NZXRyb25vbWVFdmVudHMpe1xuICAgICAgICBldmVudCA9IHRoaXMubWV0cm9ub21lRXZlbnRzW3RoaXMubWV0cm9ub21lRXZlbnRzSW5kZXhdXG4gICAgICAgIGxldCBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGlja1xuICAgICAgICBpZihtaWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZXN0YW1wXG4gICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgICAgICAgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN0b3AgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoc3RvcCl7XG4gICAgICAgIGxvb3AgPSBmYWxzZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBzb3J0RXZlbnRzKHJlc3VsdClcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuXG4qL1xuXG5cbmV4cG9ydHMuZGVmYXVsdCA9IFNjaGVkdWxlcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmV4cG9ydHMudXBkYXRlU2V0dGluZ3MgPSB1cGRhdGVTZXR0aW5ncztcbmV4cG9ydHMuZ2V0U2V0dGluZ3MgPSBnZXRTZXR0aW5ncztcbi8vaW1wb3J0IGdtSW5zdHJ1bWVudHMgZnJvbSAnLi9nbV9pbnN0cnVtZW50cydcblxuLy9jb25zdCBwYXJhbXMgPSBbJ3BwcScsICdicG0nLCAnYmFycycsICdwaXRjaCcsICdidWZmZXJUaW1lJywgJ2xvd2VzdE5vdGUnLCAnaGlnaGVzdE5vdGUnLCAnbm90ZU5hbWVNb2RlJywgJ25vbWluYXRvcicsICdkZW5vbWluYXRvcicsICdxdWFudGl6ZVZhbHVlJywgJ2ZpeGVkTGVuZ3RoVmFsdWUnLCAncG9zaXRpb25UeXBlJywgJ3VzZU1ldHJvbm9tZScsICdhdXRvU2l6ZScsICdwbGF5YmFja1NwZWVkJywgJ2F1dG9RdWFudGl6ZScsIF1cblxudmFyIHNldHRpbmdzID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDE2LFxuICBwaXRjaDogNDQwLFxuICBidWZmZXJUaW1lOiAyMDAsXG4gIGxvd2VzdE5vdGU6IDAsXG4gIGhpZ2hlc3ROb3RlOiAxMjcsXG4gIG5vdGVOYW1lTW9kZTogJ3NoYXJwJyxcbiAgbm9taW5hdG9yOiA0LFxuICBkZW5vbWluYXRvcjogNCxcbiAgcXVhbnRpemVWYWx1ZTogOCxcbiAgZml4ZWRMZW5ndGhWYWx1ZTogZmFsc2UsXG4gIHBvc2l0aW9uVHlwZTogJ2FsbCcsXG4gIHVzZU1ldHJvbm9tZTogZmFsc2UsXG4gIGF1dG9TaXplOiB0cnVlLFxuICBwbGF5YmFja1NwZWVkOiAxLFxuICBhdXRvUXVhbnRpemU6IGZhbHNlLFxuICB2b2x1bWU6IDAuNVxufTtcblxuZnVuY3Rpb24gdXBkYXRlU2V0dGluZ3MoZGF0YSkge1xuICB2YXIgX2RhdGEkcHBxID0gZGF0YS5wcHE7XG4gIHNldHRpbmdzLnBwcSA9IF9kYXRhJHBwcSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MucHBxIDogX2RhdGEkcHBxO1xuICB2YXIgX2RhdGEkYnBtID0gZGF0YS5icG07XG4gIHNldHRpbmdzLmJwbSA9IF9kYXRhJGJwbSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MuYnBtIDogX2RhdGEkYnBtO1xuICB2YXIgX2RhdGEkYmFycyA9IGRhdGEuYmFycztcbiAgc2V0dGluZ3MuYmFycyA9IF9kYXRhJGJhcnMgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmJhcnMgOiBfZGF0YSRiYXJzO1xuICB2YXIgX2RhdGEkcGl0Y2ggPSBkYXRhLnBpdGNoO1xuICBzZXR0aW5ncy5waXRjaCA9IF9kYXRhJHBpdGNoID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5waXRjaCA6IF9kYXRhJHBpdGNoO1xuICB2YXIgX2RhdGEkYnVmZmVyVGltZSA9IGRhdGEuYnVmZmVyVGltZTtcbiAgc2V0dGluZ3MuYnVmZmVyVGltZSA9IF9kYXRhJGJ1ZmZlclRpbWUgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmJ1ZmZlclRpbWUgOiBfZGF0YSRidWZmZXJUaW1lO1xuICB2YXIgX2RhdGEkbG93ZXN0Tm90ZSA9IGRhdGEubG93ZXN0Tm90ZTtcbiAgc2V0dGluZ3MubG93ZXN0Tm90ZSA9IF9kYXRhJGxvd2VzdE5vdGUgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmxvd2VzdE5vdGUgOiBfZGF0YSRsb3dlc3ROb3RlO1xuICB2YXIgX2RhdGEkaGlnaGVzdE5vdGUgPSBkYXRhLmhpZ2hlc3ROb3RlO1xuICBzZXR0aW5ncy5oaWdoZXN0Tm90ZSA9IF9kYXRhJGhpZ2hlc3ROb3RlID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5oaWdoZXN0Tm90ZSA6IF9kYXRhJGhpZ2hlc3ROb3RlO1xuICB2YXIgX2RhdGEkbm90ZU5hbWVNb2RlID0gZGF0YS5ub3RlTmFtZU1vZGU7XG4gIHNldHRpbmdzLm5vdGVOYW1lTW9kZSA9IF9kYXRhJG5vdGVOYW1lTW9kZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3Mubm90ZU5hbWVNb2RlIDogX2RhdGEkbm90ZU5hbWVNb2RlO1xuICB2YXIgX2RhdGEkbm9taW5hdG9yID0gZGF0YS5ub21pbmF0b3I7XG4gIHNldHRpbmdzLm5vbWluYXRvciA9IF9kYXRhJG5vbWluYXRvciA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3Mubm9taW5hdG9yIDogX2RhdGEkbm9taW5hdG9yO1xuICB2YXIgX2RhdGEkZGVub21pbmF0b3IgPSBkYXRhLmRlbm9taW5hdG9yO1xuICBzZXR0aW5ncy5kZW5vbWluYXRvciA9IF9kYXRhJGRlbm9taW5hdG9yID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5kZW5vbWluYXRvciA6IF9kYXRhJGRlbm9taW5hdG9yO1xuICB2YXIgX2RhdGEkcXVhbnRpemVWYWx1ZSA9IGRhdGEucXVhbnRpemVWYWx1ZTtcbiAgc2V0dGluZ3MucXVhbnRpemVWYWx1ZSA9IF9kYXRhJHF1YW50aXplVmFsdWUgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLnF1YW50aXplVmFsdWUgOiBfZGF0YSRxdWFudGl6ZVZhbHVlO1xuICB2YXIgX2RhdGEkZml4ZWRMZW5ndGhWYWx1ID0gZGF0YS5maXhlZExlbmd0aFZhbHVlO1xuICBzZXR0aW5ncy5maXhlZExlbmd0aFZhbHVlID0gX2RhdGEkZml4ZWRMZW5ndGhWYWx1ID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5maXhlZExlbmd0aFZhbHVlIDogX2RhdGEkZml4ZWRMZW5ndGhWYWx1O1xuICB2YXIgX2RhdGEkcG9zaXRpb25UeXBlID0gZGF0YS5wb3NpdGlvblR5cGU7XG4gIHNldHRpbmdzLnBvc2l0aW9uVHlwZSA9IF9kYXRhJHBvc2l0aW9uVHlwZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MucG9zaXRpb25UeXBlIDogX2RhdGEkcG9zaXRpb25UeXBlO1xuICB2YXIgX2RhdGEkdXNlTWV0cm9ub21lID0gZGF0YS51c2VNZXRyb25vbWU7XG4gIHNldHRpbmdzLnVzZU1ldHJvbm9tZSA9IF9kYXRhJHVzZU1ldHJvbm9tZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MudXNlTWV0cm9ub21lIDogX2RhdGEkdXNlTWV0cm9ub21lO1xuICB2YXIgX2RhdGEkYXV0b1NpemUgPSBkYXRhLmF1dG9TaXplO1xuICBzZXR0aW5ncy5hdXRvU2l6ZSA9IF9kYXRhJGF1dG9TaXplID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5hdXRvU2l6ZSA6IF9kYXRhJGF1dG9TaXplO1xuICB2YXIgX2RhdGEkcGxheWJhY2tTcGVlZCA9IGRhdGEucGxheWJhY2tTcGVlZDtcbiAgc2V0dGluZ3MucGxheWJhY2tTcGVlZCA9IF9kYXRhJHBsYXliYWNrU3BlZWQgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLnBsYXliYWNrU3BlZWQgOiBfZGF0YSRwbGF5YmFja1NwZWVkO1xuICB2YXIgX2RhdGEkYXV0b1F1YW50aXplID0gZGF0YS5hdXRvUXVhbnRpemU7XG4gIHNldHRpbmdzLmF1dG9RdWFudGl6ZSA9IF9kYXRhJGF1dG9RdWFudGl6ZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MuYXV0b1F1YW50aXplIDogX2RhdGEkYXV0b1F1YW50aXplO1xuICB2YXIgX2RhdGEkdm9sdW1lID0gZGF0YS52b2x1bWU7XG4gIHNldHRpbmdzLnZvbHVtZSA9IF9kYXRhJHZvbHVtZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3Mudm9sdW1lIDogX2RhdGEkdm9sdW1lO1xuXG5cbiAgY29uc29sZS5sb2coJ3NldHRpbmdzOiAlTycsIHNldHRpbmdzKTtcbn1cblxuZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKSB7XG4gIHJldHVybiBfZXh0ZW5kcyh7fSwgc2V0dGluZ3MpO1xuICAvKlxuICAgIGxldCByZXN1bHQgPSB7fVxuICAgIHBhcmFtcy5mb3JFYWNoKHBhcmFtID0+IHtcbiAgICAgIHN3aXRjaChwYXJhbSl7XG4gICAgICAgIGNhc2UgJ3BpdGNoJzpcbiAgICAgICAgICByZXN1bHQucGl0Y2ggPSBwaXRjaFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ25vdGVOYW1lTW9kZSc6XG4gICAgICAgICAgcmVzdWx0Lm5vdGVOYW1lTW9kZSA9IG5vdGVOYW1lTW9kZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ2J1ZmZlclRpbWUnOlxuICAgICAgICAgIHJlc3VsdC5idWZmZXJUaW1lID0gYnVmZmVyVGltZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3BwcSc6XG4gICAgICAgICAgcmVzdWx0LnBwcSA9IHBwcVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICAqL1xufVxuXG4vL3BvcnRlZCBoZWFydGJlYXQgaW5zdHJ1bWVudHM6IGh0dHA6Ly9naXRodWIuY29tL2FidWRhYW4vaGVhcnRiZWF0XG52YXIgaGVhcnRiZWF0SW5zdHJ1bWVudHMgPSBuZXcgTWFwKFtbJ2NpdHktcGlhbm8nLCB7XG4gIG5hbWU6ICdDaXR5IFBpYW5vIChwaWFubyknLFxuICBkZXNjcmlwdGlvbjogJ0NpdHkgUGlhbm8gdXNlcyBzYW1wbGVzIGZyb20gYSBCYWxkd2luIHBpYW5vLCBpdCBoYXMgNCB2ZWxvY2l0eSBsYXllcnM6IDEgLSA0OCwgNDkgLSA5NiwgOTcgLSAxMTAgYW5kIDExMCAtIDEyNy4gSW4gdG90YWwgaXQgdXNlcyA0ICogODggPSAzNTIgc2FtcGxlcydcbn1dLCBbJ2NpdHktcGlhbm8tbGlnaHQnLCB7XG4gIG5hbWU6ICdDaXR5IFBpYW5vIExpZ2h0IChwaWFubyknLFxuICBkZXNjcmlwdGlvbjogJ0NpdHkgUGlhbm8gbGlnaHQgdXNlcyBzYW1wbGVzIGZyb20gYSBCYWxkd2luIHBpYW5vLCBpdCBoYXMgb25seSAxIHZlbG9jaXR5IGxheWVyIGFuZCB1c2VzIDg4IHNhbXBsZXMnXG59XSwgWydjay1pY2Vza2F0ZXMnLCB7XG4gIG5hbWU6ICdDSyBJY2UgU2thdGVzIChzeW50aCknLFxuICBkZXNjcmlwdGlvbjogJ3VzZXMgRGV0dW5pemVkIHNhbXBsZXMnXG59XSwgWydzaGsyLXNxdWFyZXJvb3QnLCB7XG4gIG5hbWU6ICdTSEsyIHNxdWFyZXJvb3QgKHN5bnRoKScsXG4gIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcydcbn1dLCBbJ3Job2RlcycsIHtcbiAgbmFtZTogJ1Job2RlcyAocGlhbm8pJyxcbiAgZGVzY3JpcHRpb246ICd1c2VzIEZyZWVzb3VuZCBzYW1wbGVzJ1xufV0sIFsncmhvZGVzMicsIHtcbiAgbmFtZTogJ1Job2RlcyAyIChwaWFubyknLFxuICBkZXNjcmlwdGlvbjogJ3VzZXMgRGV0dW5pemVkIHNhbXBsZXMnXG59XSwgWyd0cnVtcGV0Jywge1xuICBuYW1lOiAnVHJ1bXBldCAoYnJhc3MpJyxcbiAgZGVzY3JpcHRpb246ICd1c2VzIFNTTyBzYW1wbGVzJ1xufV0sIFsndmlvbGluJywge1xuICBuYW1lOiAnVmlvbGluIChzdHJpbmdzKScsXG4gIGRlc2NyaXB0aW9uOiAndXNlcyBTU08gc2FtcGxlcydcbn1dXSk7XG52YXIgZ2V0SW5zdHJ1bWVudHMgPSBleHBvcnRzLmdldEluc3RydW1lbnRzID0gZnVuY3Rpb24gZ2V0SW5zdHJ1bWVudHMoKSB7XG4gIHJldHVybiBoZWFydGJlYXRJbnN0cnVtZW50cztcbn07XG5cbi8vIGdtIHNvdW5kcyBleHBvcnRlZCBmcm9tIEZsdWlkU3ludGggYnkgQmVuamFtaW4gR2xlaXR6bWFuOiBodHRwczovL2dpdGh1Yi5jb20vZ2xlaXR6L21pZGktanMtc291bmRmb250c1xudmFyIGdtSW5zdHJ1bWVudHMgPSB7IFwiYWNvdXN0aWNfZ3JhbmRfcGlhbm9cIjogeyBcIm5hbWVcIjogXCIxIEFjb3VzdGljIEdyYW5kIFBpYW5vIChwaWFubylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYnJpZ2h0X2Fjb3VzdGljX3BpYW5vXCI6IHsgXCJuYW1lXCI6IFwiMiBCcmlnaHQgQWNvdXN0aWMgUGlhbm8gKHBpYW5vKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJlbGVjdHJpY19ncmFuZF9waWFub1wiOiB7IFwibmFtZVwiOiBcIjMgRWxlY3RyaWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJob25reXRvbmtfcGlhbm9cIjogeyBcIm5hbWVcIjogXCI0IEhvbmt5LXRvbmsgUGlhbm8gKHBpYW5vKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJlbGVjdHJpY19waWFub18xXCI6IHsgXCJuYW1lXCI6IFwiNSBFbGVjdHJpYyBQaWFubyAxIChwaWFubylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZWxlY3RyaWNfcGlhbm9fMlwiOiB7IFwibmFtZVwiOiBcIjYgRWxlY3RyaWMgUGlhbm8gMiAocGlhbm8pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImhhcnBzaWNob3JkXCI6IHsgXCJuYW1lXCI6IFwiNyBIYXJwc2ljaG9yZCAocGlhbm8pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImNsYXZpbmV0XCI6IHsgXCJuYW1lXCI6IFwiOCBDbGF2aW5ldCAocGlhbm8pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImNlbGVzdGFcIjogeyBcIm5hbWVcIjogXCI5IENlbGVzdGEgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImdsb2NrZW5zcGllbFwiOiB7IFwibmFtZVwiOiBcIjEwIEdsb2NrZW5zcGllbCAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibXVzaWNfYm94XCI6IHsgXCJuYW1lXCI6IFwiMTEgTXVzaWMgQm94IChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ2aWJyYXBob25lXCI6IHsgXCJuYW1lXCI6IFwiMTIgVmlicmFwaG9uZSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibWFyaW1iYVwiOiB7IFwibmFtZVwiOiBcIjEzIE1hcmltYmEgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInh5bG9waG9uZVwiOiB7IFwibmFtZVwiOiBcIjE0IFh5bG9waG9uZSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidHVidWxhcl9iZWxsc1wiOiB7IFwibmFtZVwiOiBcIjE1IFR1YnVsYXIgQmVsbHMgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImR1bGNpbWVyXCI6IHsgXCJuYW1lXCI6IFwiMTYgRHVsY2ltZXIgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImRyYXdiYXJfb3JnYW5cIjogeyBcIm5hbWVcIjogXCIxNyBEcmF3YmFyIE9yZ2FuIChvcmdhbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGVyY3Vzc2l2ZV9vcmdhblwiOiB7IFwibmFtZVwiOiBcIjE4IFBlcmN1c3NpdmUgT3JnYW4gKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJyb2NrX29yZ2FuXCI6IHsgXCJuYW1lXCI6IFwiMTkgUm9jayBPcmdhbiAob3JnYW4pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImNodXJjaF9vcmdhblwiOiB7IFwibmFtZVwiOiBcIjIwIENodXJjaCBPcmdhbiAob3JnYW4pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInJlZWRfb3JnYW5cIjogeyBcIm5hbWVcIjogXCIyMSBSZWVkIE9yZ2FuIChvcmdhbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYWNjb3JkaW9uXCI6IHsgXCJuYW1lXCI6IFwiMjIgQWNjb3JkaW9uIChvcmdhbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiaGFybW9uaWNhXCI6IHsgXCJuYW1lXCI6IFwiMjMgSGFybW9uaWNhIChvcmdhbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidGFuZ29fYWNjb3JkaW9uXCI6IHsgXCJuYW1lXCI6IFwiMjQgVGFuZ28gQWNjb3JkaW9uIChvcmdhbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYWNvdXN0aWNfZ3VpdGFyX255bG9uXCI6IHsgXCJuYW1lXCI6IFwiMjUgQWNvdXN0aWMgR3VpdGFyIChueWxvbikgKGd1aXRhcilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYWNvdXN0aWNfZ3VpdGFyX3N0ZWVsXCI6IHsgXCJuYW1lXCI6IFwiMjYgQWNvdXN0aWMgR3VpdGFyIChzdGVlbCkgKGd1aXRhcilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZWxlY3RyaWNfZ3VpdGFyX2phenpcIjogeyBcIm5hbWVcIjogXCIyNyBFbGVjdHJpYyBHdWl0YXIgKGphenopIChndWl0YXIpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImVsZWN0cmljX2d1aXRhcl9jbGVhblwiOiB7IFwibmFtZVwiOiBcIjI4IEVsZWN0cmljIEd1aXRhciAoY2xlYW4pIChndWl0YXIpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImVsZWN0cmljX2d1aXRhcl9tdXRlZFwiOiB7IFwibmFtZVwiOiBcIjI5IEVsZWN0cmljIEd1aXRhciAobXV0ZWQpIChndWl0YXIpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcIm92ZXJkcml2ZW5fZ3VpdGFyXCI6IHsgXCJuYW1lXCI6IFwiMzAgT3ZlcmRyaXZlbiBHdWl0YXIgKGd1aXRhcilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZGlzdG9ydGlvbl9ndWl0YXJcIjogeyBcIm5hbWVcIjogXCIzMSBEaXN0b3J0aW9uIEd1aXRhciAoZ3VpdGFyKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJndWl0YXJfaGFybW9uaWNzXCI6IHsgXCJuYW1lXCI6IFwiMzIgR3VpdGFyIEhhcm1vbmljcyAoZ3VpdGFyKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhY291c3RpY19iYXNzXCI6IHsgXCJuYW1lXCI6IFwiMzMgQWNvdXN0aWMgQmFzcyAoYmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZWxlY3RyaWNfYmFzc19maW5nZXJcIjogeyBcIm5hbWVcIjogXCIzNCBFbGVjdHJpYyBCYXNzIChmaW5nZXIpIChiYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJlbGVjdHJpY19iYXNzX3BpY2tcIjogeyBcIm5hbWVcIjogXCIzNSBFbGVjdHJpYyBCYXNzIChwaWNrKSAoYmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnJldGxlc3NfYmFzc1wiOiB7IFwibmFtZVwiOiBcIjM2IEZyZXRsZXNzIEJhc3MgKGJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInNsYXBfYmFzc18xXCI6IHsgXCJuYW1lXCI6IFwiMzcgU2xhcCBCYXNzIDEgKGJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInNsYXBfYmFzc18yXCI6IHsgXCJuYW1lXCI6IFwiMzggU2xhcCBCYXNzIDIgKGJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN5bnRoX2Jhc3NfMVwiOiB7IFwibmFtZVwiOiBcIjM5IFN5bnRoIEJhc3MgMSAoYmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3ludGhfYmFzc18yXCI6IHsgXCJuYW1lXCI6IFwiNDAgU3ludGggQmFzcyAyIChiYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ2aW9saW5cIjogeyBcIm5hbWVcIjogXCI0MSBWaW9saW4gKHN0cmluZ3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInZpb2xhXCI6IHsgXCJuYW1lXCI6IFwiNDIgVmlvbGEgKHN0cmluZ3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImNlbGxvXCI6IHsgXCJuYW1lXCI6IFwiNDMgQ2VsbG8gKHN0cmluZ3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImNvbnRyYWJhc3NcIjogeyBcIm5hbWVcIjogXCI0NCBDb250cmFiYXNzIChzdHJpbmdzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0cmVtb2xvX3N0cmluZ3NcIjogeyBcIm5hbWVcIjogXCI0NSBUcmVtb2xvIFN0cmluZ3MgKHN0cmluZ3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInBpenppY2F0b19zdHJpbmdzXCI6IHsgXCJuYW1lXCI6IFwiNDYgUGl6emljYXRvIFN0cmluZ3MgKHN0cmluZ3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcIm9yY2hlc3RyYWxfaGFycFwiOiB7IFwibmFtZVwiOiBcIjQ3IE9yY2hlc3RyYWwgSGFycCAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidGltcGFuaVwiOiB7IFwibmFtZVwiOiBcIjQ4IFRpbXBhbmkgKHN0cmluZ3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN0cmluZ19lbnNlbWJsZV8xXCI6IHsgXCJuYW1lXCI6IFwiNDkgU3RyaW5nIEVuc2VtYmxlIDEgKGVuc2VtYmxlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzdHJpbmdfZW5zZW1ibGVfMlwiOiB7IFwibmFtZVwiOiBcIjUwIFN0cmluZyBFbnNlbWJsZSAyIChlbnNlbWJsZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3ludGhfc3RyaW5nc18xXCI6IHsgXCJuYW1lXCI6IFwiNTEgU3ludGggU3RyaW5ncyAxIChlbnNlbWJsZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3ludGhfc3RyaW5nc18yXCI6IHsgXCJuYW1lXCI6IFwiNTIgU3ludGggU3RyaW5ncyAyIChlbnNlbWJsZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY2hvaXJfYWFoc1wiOiB7IFwibmFtZVwiOiBcIjUzIENob2lyIEFhaHMgKGVuc2VtYmxlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ2b2ljZV9vb2hzXCI6IHsgXCJuYW1lXCI6IFwiNTQgVm9pY2UgT29ocyAoZW5zZW1ibGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN5bnRoX2Nob2lyXCI6IHsgXCJuYW1lXCI6IFwiNTUgU3ludGggQ2hvaXIgKGVuc2VtYmxlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJvcmNoZXN0cmFfaGl0XCI6IHsgXCJuYW1lXCI6IFwiNTYgT3JjaGVzdHJhIEhpdCAoZW5zZW1ibGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInRydW1wZXRcIjogeyBcIm5hbWVcIjogXCI1NyBUcnVtcGV0IChicmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidHJvbWJvbmVcIjogeyBcIm5hbWVcIjogXCI1OCBUcm9tYm9uZSAoYnJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInR1YmFcIjogeyBcIm5hbWVcIjogXCI1OSBUdWJhIChicmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibXV0ZWRfdHJ1bXBldFwiOiB7IFwibmFtZVwiOiBcIjYwIE11dGVkIFRydW1wZXQgKGJyYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJmcmVuY2hfaG9yblwiOiB7IFwibmFtZVwiOiBcIjYxIEZyZW5jaCBIb3JuIChicmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYnJhc3Nfc2VjdGlvblwiOiB7IFwibmFtZVwiOiBcIjYyIEJyYXNzIFNlY3Rpb24gKGJyYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzeW50aF9icmFzc18xXCI6IHsgXCJuYW1lXCI6IFwiNjMgU3ludGggQnJhc3MgMSAoYnJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN5bnRoX2JyYXNzXzJcIjogeyBcIm5hbWVcIjogXCI2NCBTeW50aCBCcmFzcyAyIChicmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic29wcmFub19zYXhcIjogeyBcIm5hbWVcIjogXCI2NSBTb3ByYW5vIFNheCAocmVlZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYWx0b19zYXhcIjogeyBcIm5hbWVcIjogXCI2NiBBbHRvIFNheCAocmVlZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidGVub3Jfc2F4XCI6IHsgXCJuYW1lXCI6IFwiNjcgVGVub3IgU2F4IChyZWVkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJiYXJpdG9uZV9zYXhcIjogeyBcIm5hbWVcIjogXCI2OCBCYXJpdG9uZSBTYXggKHJlZWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcIm9ib2VcIjogeyBcIm5hbWVcIjogXCI2OSBPYm9lIChyZWVkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJlbmdsaXNoX2hvcm5cIjogeyBcIm5hbWVcIjogXCI3MCBFbmdsaXNoIEhvcm4gKHJlZWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImJhc3Nvb25cIjogeyBcIm5hbWVcIjogXCI3MSBCYXNzb29uIChyZWVkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJjbGFyaW5ldFwiOiB7IFwibmFtZVwiOiBcIjcyIENsYXJpbmV0IChyZWVkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwaWNjb2xvXCI6IHsgXCJuYW1lXCI6IFwiNzMgUGljY29sbyAocGlwZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZmx1dGVcIjogeyBcIm5hbWVcIjogXCI3NCBGbHV0ZSAocGlwZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicmVjb3JkZXJcIjogeyBcIm5hbWVcIjogXCI3NSBSZWNvcmRlciAocGlwZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGFuX2ZsdXRlXCI6IHsgXCJuYW1lXCI6IFwiNzYgUGFuIEZsdXRlIChwaXBlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJibG93bl9ib3R0bGVcIjogeyBcIm5hbWVcIjogXCI3NyBCbG93biBCb3R0bGUgKHBpcGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInNoYWt1aGFjaGlcIjogeyBcIm5hbWVcIjogXCI3OCBTaGFrdWhhY2hpIChwaXBlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ3aGlzdGxlXCI6IHsgXCJuYW1lXCI6IFwiNzkgV2hpc3RsZSAocGlwZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwib2NhcmluYVwiOiB7IFwibmFtZVwiOiBcIjgwIE9jYXJpbmEgKHBpcGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImxlYWRfMV9zcXVhcmVcIjogeyBcIm5hbWVcIjogXCI4MSBMZWFkIDEgKHNxdWFyZSkgKHN5bnRobGVhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF8yX3Nhd3Rvb3RoXCI6IHsgXCJuYW1lXCI6IFwiODIgTGVhZCAyIChzYXd0b290aCkgKHN5bnRobGVhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF8zX2NhbGxpb3BlXCI6IHsgXCJuYW1lXCI6IFwiODMgTGVhZCAzIChjYWxsaW9wZSkgKHN5bnRobGVhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF80X2NoaWZmXCI6IHsgXCJuYW1lXCI6IFwiODQgTGVhZCA0IChjaGlmZikgKHN5bnRobGVhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF81X2NoYXJhbmdcIjogeyBcIm5hbWVcIjogXCI4NSBMZWFkIDUgKGNoYXJhbmcpIChzeW50aGxlYWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImxlYWRfNl92b2ljZVwiOiB7IFwibmFtZVwiOiBcIjg2IExlYWQgNiAodm9pY2UpIChzeW50aGxlYWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImxlYWRfN19maWZ0aHNcIjogeyBcIm5hbWVcIjogXCI4NyBMZWFkIDcgKGZpZnRocykgKHN5bnRobGVhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF84X2Jhc3NfX2xlYWRcIjogeyBcIm5hbWVcIjogXCI4OCBMZWFkIDggKGJhc3MgKyBsZWFkKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfMV9uZXdfYWdlXCI6IHsgXCJuYW1lXCI6IFwiODkgUGFkIDEgKG5ldyBhZ2UpIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGFkXzJfd2FybVwiOiB7IFwibmFtZVwiOiBcIjkwIFBhZCAyICh3YXJtKSAoc3ludGhwYWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInBhZF8zX3BvbHlzeW50aFwiOiB7IFwibmFtZVwiOiBcIjkxIFBhZCAzIChwb2x5c3ludGgpIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGFkXzRfY2hvaXJcIjogeyBcIm5hbWVcIjogXCI5MiBQYWQgNCAoY2hvaXIpIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGFkXzVfYm93ZWRcIjogeyBcIm5hbWVcIjogXCI5MyBQYWQgNSAoYm93ZWQpIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGFkXzZfbWV0YWxsaWNcIjogeyBcIm5hbWVcIjogXCI5NCBQYWQgNiAobWV0YWxsaWMpIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGFkXzdfaGFsb1wiOiB7IFwibmFtZVwiOiBcIjk1IFBhZCA3IChoYWxvKSAoc3ludGhwYWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInBhZF84X3N3ZWVwXCI6IHsgXCJuYW1lXCI6IFwiOTYgUGFkIDggKHN3ZWVwKSAoc3ludGhwYWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImZ4XzFfcmFpblwiOiB7IFwibmFtZVwiOiBcIjk3IEZYIDEgKHJhaW4pIChzeW50aGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImZ4XzJfc291bmR0cmFja1wiOiB7IFwibmFtZVwiOiBcIjk4IEZYIDIgKHNvdW5kdHJhY2spIChzeW50aGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImZ4XzNfY3J5c3RhbFwiOiB7IFwibmFtZVwiOiBcIjk5IEZYIDMgKGNyeXN0YWwpIChzeW50aGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImZ4XzRfYXRtb3NwaGVyZVwiOiB7IFwibmFtZVwiOiBcIjEwMCBGWCA0IChhdG1vc3BoZXJlKSAoc3ludGhlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJmeF81X2JyaWdodG5lc3NcIjogeyBcIm5hbWVcIjogXCIxMDEgRlggNSAoYnJpZ2h0bmVzcykgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfNl9nb2JsaW5zXCI6IHsgXCJuYW1lXCI6IFwiMTAyIEZYIDYgKGdvYmxpbnMpIChzeW50aGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImZ4XzdfZWNob2VzXCI6IHsgXCJuYW1lXCI6IFwiMTAzIEZYIDcgKGVjaG9lcykgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfOF9zY2lmaVwiOiB7IFwibmFtZVwiOiBcIjEwNCBGWCA4IChzY2ktZmkpIChzeW50aGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInNpdGFyXCI6IHsgXCJuYW1lXCI6IFwiMTA1IFNpdGFyIChldGhuaWMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImJhbmpvXCI6IHsgXCJuYW1lXCI6IFwiMTA2IEJhbmpvIChldGhuaWMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInNoYW1pc2VuXCI6IHsgXCJuYW1lXCI6IFwiMTA3IFNoYW1pc2VuIChldGhuaWMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImtvdG9cIjogeyBcIm5hbWVcIjogXCIxMDggS290byAoZXRobmljKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJrYWxpbWJhXCI6IHsgXCJuYW1lXCI6IFwiMTA5IEthbGltYmEgKGV0aG5pYylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYmFncGlwZVwiOiB7IFwibmFtZVwiOiBcIjExMCBCYWdwaXBlIChldGhuaWMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImZpZGRsZVwiOiB7IFwibmFtZVwiOiBcIjExMSBGaWRkbGUgKGV0aG5pYylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2hhbmFpXCI6IHsgXCJuYW1lXCI6IFwiMTEyIFNoYW5haSAoZXRobmljKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0aW5rbGVfYmVsbFwiOiB7IFwibmFtZVwiOiBcIjExMyBUaW5rbGUgQmVsbCAocGVyY3Vzc2l2ZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYWdvZ29cIjogeyBcIm5hbWVcIjogXCIxMTQgQWdvZ28gKHBlcmN1c3NpdmUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN0ZWVsX2RydW1zXCI6IHsgXCJuYW1lXCI6IFwiMTE1IFN0ZWVsIERydW1zIChwZXJjdXNzaXZlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ3b29kYmxvY2tcIjogeyBcIm5hbWVcIjogXCIxMTYgV29vZGJsb2NrIChwZXJjdXNzaXZlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0YWlrb19kcnVtXCI6IHsgXCJuYW1lXCI6IFwiMTE3IFRhaWtvIERydW0gKHBlcmN1c3NpdmUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcIm1lbG9kaWNfdG9tXCI6IHsgXCJuYW1lXCI6IFwiMTE4IE1lbG9kaWMgVG9tIChwZXJjdXNzaXZlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzeW50aF9kcnVtXCI6IHsgXCJuYW1lXCI6IFwiMTE5IFN5bnRoIERydW0gKHBlcmN1c3NpdmUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInJldmVyc2VfY3ltYmFsXCI6IHsgXCJuYW1lXCI6IFwiMTIwIFJldmVyc2UgQ3ltYmFsIChzb3VuZGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImd1aXRhcl9mcmV0X25vaXNlXCI6IHsgXCJuYW1lXCI6IFwiMTIxIEd1aXRhciBGcmV0IE5vaXNlIChzb3VuZGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImJyZWF0aF9ub2lzZVwiOiB7IFwibmFtZVwiOiBcIjEyMiBCcmVhdGggTm9pc2UgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2Vhc2hvcmVcIjogeyBcIm5hbWVcIjogXCIxMjMgU2Vhc2hvcmUgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYmlyZF90d2VldFwiOiB7IFwibmFtZVwiOiBcIjEyNCBCaXJkIFR3ZWV0IChzb3VuZGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInRlbGVwaG9uZV9yaW5nXCI6IHsgXCJuYW1lXCI6IFwiMTI1IFRlbGVwaG9uZSBSaW5nIChzb3VuZGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImhlbGljb3B0ZXJcIjogeyBcIm5hbWVcIjogXCIxMjYgSGVsaWNvcHRlciAoc291bmRlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhcHBsYXVzZVwiOiB7IFwibmFtZVwiOiBcIjEyNyBBcHBsYXVzZSAoc291bmRlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJndW5zaG90XCI6IHsgXCJuYW1lXCI6IFwiMTI4IEd1bnNob3QgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0gfTtcbnZhciBnbU1hcCA9IG5ldyBNYXAoKTtcbk9iamVjdC5rZXlzKGdtSW5zdHJ1bWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICBnbU1hcC5zZXQoa2V5LCBnbUluc3RydW1lbnRzW2tleV0pO1xufSk7XG52YXIgZ2V0R01JbnN0cnVtZW50cyA9IGV4cG9ydHMuZ2V0R01JbnN0cnVtZW50cyA9IGZ1bmN0aW9uIGdldEdNSW5zdHJ1bWVudHMoKSB7XG4gIHJldHVybiBnbU1hcDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5TaW1wbGVTeW50aCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9pbnN0cnVtZW50ID0gcmVxdWlyZSgnLi9pbnN0cnVtZW50Jyk7XG5cbnZhciBfc2FtcGxlX29zY2lsbGF0b3IgPSByZXF1aXJlKCcuL3NhbXBsZV9vc2NpbGxhdG9yJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIGluc3RhbmNlSW5kZXggPSAwO1xuXG52YXIgU2ltcGxlU3ludGggPSBleHBvcnRzLlNpbXBsZVN5bnRoID0gZnVuY3Rpb24gKF9JbnN0cnVtZW50KSB7XG4gIF9pbmhlcml0cyhTaW1wbGVTeW50aCwgX0luc3RydW1lbnQpO1xuXG4gIGZ1bmN0aW9uIFNpbXBsZVN5bnRoKHR5cGUsIG5hbWUpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2ltcGxlU3ludGgpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgT2JqZWN0LmdldFByb3RvdHlwZU9mKFNpbXBsZVN5bnRoKS5jYWxsKHRoaXMpKTtcblxuICAgIF90aGlzLmlkID0gX3RoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIF90aGlzLm5hbWUgPSBuYW1lIHx8IF90aGlzLmlkO1xuICAgIF90aGlzLnR5cGUgPSB0eXBlO1xuICAgIF90aGlzLnNhbXBsZURhdGEgPSB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgcmVsZWFzZUR1cmF0aW9uOiAwLjIsXG4gICAgICByZWxlYXNlRW52ZWxvcGU6ICdlcXVhbCBwb3dlcidcbiAgICB9O1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTaW1wbGVTeW50aCwgW3tcbiAgICBrZXk6ICdjcmVhdGVTYW1wbGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVTYW1wbGUoZXZlbnQpIHtcbiAgICAgIHJldHVybiBuZXcgX3NhbXBsZV9vc2NpbGxhdG9yLlNhbXBsZU9zY2lsbGF0b3IodGhpcy5zYW1wbGVEYXRhLCBldmVudCk7XG4gICAgfVxuXG4gICAgLy8gc3RlcmVvIHNwcmVhZFxuXG4gIH0sIHtcbiAgICBrZXk6ICdzZXRLZXlTY2FsaW5nUGFubmluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEtleVNjYWxpbmdQYW5uaW5nKCkge1xuICAgICAgLy8gc2V0cyBwYW5uaW5nIGJhc2VkIG9uIHRoZSBrZXkgdmFsdWUsIGUuZy4gaGlnaGVyIG5vdGVzIGFyZSBwYW5uZWQgbW9yZSB0byB0aGUgcmlnaHQgYW5kIGxvd2VyIG5vdGVzIG1vcmUgdG8gdGhlIGxlZnRcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRLZXlTY2FsaW5nUmVsZWFzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEtleVNjYWxpbmdSZWxlYXNlKCkge31cbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcblxuXG4gICAgLypcbiAgICAgIEBkdXJhdGlvbjogbWlsbGlzZWNvbmRzXG4gICAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3NldFJlbGVhc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRSZWxlYXNlKGR1cmF0aW9uLCBlbnZlbG9wZSkge1xuICAgICAgdGhpcy5zYW1wbGVEYXRhLnJlbGVhc2VEdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgdGhpcy5zYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSA9IGVudmVsb3BlO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTaW1wbGVTeW50aDtcbn0oX2luc3RydW1lbnQuSW5zdHJ1bWVudCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5Tb25nID0gdW5kZWZpbmVkO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLy9AIGZsb3dcblxudmFyIF9jb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG52YXIgX3BhcnNlX2V2ZW50cyA9IHJlcXVpcmUoJy4vcGFyc2VfZXZlbnRzJyk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG52YXIgX3NjaGVkdWxlciA9IHJlcXVpcmUoJy4vc2NoZWR1bGVyJyk7XG5cbnZhciBfc2NoZWR1bGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NjaGVkdWxlcik7XG5cbnZhciBfbWlkaV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaV9ldmVudCcpO1xuXG52YXIgX3NvbmdfZnJvbV9taWRpZmlsZSA9IHJlcXVpcmUoJy4vc29uZ19mcm9tX21pZGlmaWxlJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX3Bvc2l0aW9uID0gcmVxdWlyZSgnLi9wb3NpdGlvbicpO1xuXG52YXIgX3BsYXloZWFkID0gcmVxdWlyZSgnLi9wbGF5aGVhZCcpO1xuXG52YXIgX21ldHJvbm9tZSA9IHJlcXVpcmUoJy4vbWV0cm9ub21lJyk7XG5cbnZhciBfZXZlbnRsaXN0ZW5lciA9IHJlcXVpcmUoJy4vZXZlbnRsaXN0ZW5lcicpO1xuXG52YXIgX3NhdmVfbWlkaWZpbGUgPSByZXF1aXJlKCcuL3NhdmVfbWlkaWZpbGUnKTtcblxudmFyIF9zb25nID0gcmVxdWlyZSgnLi9zb25nLnVwZGF0ZScpO1xuXG52YXIgX3NldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIGluc3RhbmNlSW5kZXggPSAwO1xudmFyIHJlY29yZGluZ0luZGV4ID0gMDtcblxuLypcbnR5cGUgc29uZ1NldHRpbmdzID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIHBwcTogbnVtYmVyLFxuICBicG06IG51bWJlcixcbiAgYmFyczogbnVtYmVyLFxuICBsb3dlc3ROb3RlOiBudW1iZXIsXG4gIGhpZ2hlc3ROb3RlOiBudW1iZXIsXG4gIG5vbWluYXRvcjogbnVtYmVyLFxuICBkZW5vbWluYXRvcjogbnVtYmVyLFxuICBxdWFudGl6ZVZhbHVlOiBudW1iZXIsXG4gIGZpeGVkTGVuZ3RoVmFsdWU6IG51bWJlcixcbiAgcG9zaXRpb25UeXBlOiBzdHJpbmcsXG4gIHVzZU1ldHJvbm9tZTogYm9vbGVhbixcbiAgYXV0b1NpemU6IGJvb2xlYW4sXG4gIGxvb3A6IGJvb2xlYW4sXG4gIHBsYXliYWNrU3BlZWQ6IG51bWJlcixcbiAgYXV0b1F1YW50aXplOiBib29sZWFuLFxuICBwaXRjaDogbnVtYmVyLFxuICBidWZmZXJUaW1lOiBudW1iZXIsXG4gIG5vdGVOYW1lTW9kZTogc3RyaW5nXG59XG4qL1xuXG4vKlxuICAvLyBpbml0aWFsaXplIHNvbmcgd2l0aCB0cmFja3MgYW5kIHBhcnQgc28geW91IGRvIG5vdCBoYXZlIHRvIGNyZWF0ZSB0aGVtIHNlcGFyYXRlbHlcbiAgc2V0dXA6IHtcbiAgICB0aW1lRXZlbnRzOiBbXVxuICAgIHRyYWNrczogW1xuICAgICAgcGFydHMgW11cbiAgICBdXG4gIH1cbiovXG5cbnZhciBTb25nID0gZXhwb3J0cy5Tb25nID0gZnVuY3Rpb24gKCkge1xuICBfY3JlYXRlQ2xhc3MoU29uZywgbnVsbCwgW3tcbiAgICBrZXk6ICdmcm9tTUlESUZpbGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmcm9tTUlESUZpbGUoZGF0YSkge1xuICAgICAgcmV0dXJuICgwLCBfc29uZ19mcm9tX21pZGlmaWxlLnNvbmdGcm9tTUlESUZpbGUpKGRhdGEpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Zyb21NSURJRmlsZVN5bmMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmcm9tTUlESUZpbGVTeW5jKGRhdGEpIHtcbiAgICAgIHJldHVybiAoMCwgX3NvbmdfZnJvbV9taWRpZmlsZS5zb25nRnJvbU1JRElGaWxlU3luYykoZGF0YSk7XG4gICAgfVxuICB9XSk7XG5cbiAgZnVuY3Rpb24gU29uZygpIHtcbiAgICB2YXIgc2V0dGluZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTb25nKTtcblxuICAgIHRoaXMuaWQgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB2YXIgZGVmYXVsdFNldHRpbmdzID0gKDAsIF9zZXR0aW5ncy5nZXRTZXR0aW5ncykoKTtcblxuICAgIHZhciBfc2V0dGluZ3MkbmFtZSA9IHNldHRpbmdzLm5hbWU7XG4gICAgdGhpcy5uYW1lID0gX3NldHRpbmdzJG5hbWUgPT09IHVuZGVmaW5lZCA/IHRoaXMuaWQgOiBfc2V0dGluZ3MkbmFtZTtcbiAgICB2YXIgX3NldHRpbmdzJHBwcSA9IHNldHRpbmdzLnBwcTtcbiAgICB0aGlzLnBwcSA9IF9zZXR0aW5ncyRwcHEgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5wcHEgOiBfc2V0dGluZ3MkcHBxO1xuICAgIHZhciBfc2V0dGluZ3MkYnBtID0gc2V0dGluZ3MuYnBtO1xuICAgIHRoaXMuYnBtID0gX3NldHRpbmdzJGJwbSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLmJwbSA6IF9zZXR0aW5ncyRicG07XG4gICAgdmFyIF9zZXR0aW5ncyRiYXJzID0gc2V0dGluZ3MuYmFycztcbiAgICB0aGlzLmJhcnMgPSBfc2V0dGluZ3MkYmFycyA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLmJhcnMgOiBfc2V0dGluZ3MkYmFycztcbiAgICB2YXIgX3NldHRpbmdzJG5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcjtcbiAgICB0aGlzLm5vbWluYXRvciA9IF9zZXR0aW5ncyRub21pbmF0b3IgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5ub21pbmF0b3IgOiBfc2V0dGluZ3Mkbm9taW5hdG9yO1xuICAgIHZhciBfc2V0dGluZ3MkZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcjtcbiAgICB0aGlzLmRlbm9taW5hdG9yID0gX3NldHRpbmdzJGRlbm9taW5hdG9yID09PSB1bmRlZmluZWQgPyBkZWZhdWx0U2V0dGluZ3MuZGVub21pbmF0b3IgOiBfc2V0dGluZ3MkZGVub21pbmF0b3I7XG4gICAgdmFyIF9zZXR0aW5ncyRxdWFudGl6ZVZhbCA9IHNldHRpbmdzLnF1YW50aXplVmFsdWU7XG4gICAgdGhpcy5xdWFudGl6ZVZhbHVlID0gX3NldHRpbmdzJHF1YW50aXplVmFsID09PSB1bmRlZmluZWQgPyBkZWZhdWx0U2V0dGluZ3MucXVhbnRpemVWYWx1ZSA6IF9zZXR0aW5ncyRxdWFudGl6ZVZhbDtcbiAgICB2YXIgX3NldHRpbmdzJGZpeGVkTGVuZ3RoID0gc2V0dGluZ3MuZml4ZWRMZW5ndGhWYWx1ZTtcbiAgICB0aGlzLmZpeGVkTGVuZ3RoVmFsdWUgPSBfc2V0dGluZ3MkZml4ZWRMZW5ndGggPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5maXhlZExlbmd0aFZhbHVlIDogX3NldHRpbmdzJGZpeGVkTGVuZ3RoO1xuICAgIHZhciBfc2V0dGluZ3MkdXNlTWV0cm9ub20gPSBzZXR0aW5ncy51c2VNZXRyb25vbWU7XG4gICAgdGhpcy51c2VNZXRyb25vbWUgPSBfc2V0dGluZ3MkdXNlTWV0cm9ub20gPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy51c2VNZXRyb25vbWUgOiBfc2V0dGluZ3MkdXNlTWV0cm9ub207XG4gICAgdmFyIF9zZXR0aW5ncyRhdXRvU2l6ZSA9IHNldHRpbmdzLmF1dG9TaXplO1xuICAgIHRoaXMuYXV0b1NpemUgPSBfc2V0dGluZ3MkYXV0b1NpemUgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5hdXRvU2l6ZSA6IF9zZXR0aW5ncyRhdXRvU2l6ZTtcbiAgICB2YXIgX3NldHRpbmdzJHBsYXliYWNrU3BlID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgICB0aGlzLnBsYXliYWNrU3BlZWQgPSBfc2V0dGluZ3MkcGxheWJhY2tTcGUgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5wbGF5YmFja1NwZWVkIDogX3NldHRpbmdzJHBsYXliYWNrU3BlO1xuICAgIHZhciBfc2V0dGluZ3MkYXV0b1F1YW50aXogPSBzZXR0aW5ncy5hdXRvUXVhbnRpemU7XG4gICAgdGhpcy5hdXRvUXVhbnRpemUgPSBfc2V0dGluZ3MkYXV0b1F1YW50aXogPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5hdXRvUXVhbnRpemUgOiBfc2V0dGluZ3MkYXV0b1F1YW50aXo7XG4gICAgdmFyIF9zZXR0aW5ncyRwaXRjaCA9IHNldHRpbmdzLnBpdGNoO1xuICAgIHRoaXMucGl0Y2ggPSBfc2V0dGluZ3MkcGl0Y2ggPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5waXRjaCA6IF9zZXR0aW5ncyRwaXRjaDtcbiAgICB2YXIgX3NldHRpbmdzJGJ1ZmZlclRpbWUgPSBzZXR0aW5ncy5idWZmZXJUaW1lO1xuICAgIHRoaXMuYnVmZmVyVGltZSA9IF9zZXR0aW5ncyRidWZmZXJUaW1lID09PSB1bmRlZmluZWQgPyBkZWZhdWx0U2V0dGluZ3MuYnVmZmVyVGltZSA6IF9zZXR0aW5ncyRidWZmZXJUaW1lO1xuICAgIHZhciBfc2V0dGluZ3Mkbm90ZU5hbWVNb2QgPSBzZXR0aW5ncy5ub3RlTmFtZU1vZGU7XG4gICAgdGhpcy5ub3RlTmFtZU1vZGUgPSBfc2V0dGluZ3Mkbm90ZU5hbWVNb2QgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5ub3RlTmFtZU1vZGUgOiBfc2V0dGluZ3Mkbm90ZU5hbWVNb2Q7XG4gICAgdmFyIF9zZXR0aW5ncyR2b2x1bWUgPSBzZXR0aW5ncy52b2x1bWU7XG4gICAgdGhpcy52b2x1bWUgPSBfc2V0dGluZ3Mkdm9sdW1lID09PSB1bmRlZmluZWQgPyBkZWZhdWx0U2V0dGluZ3Mudm9sdW1lIDogX3NldHRpbmdzJHZvbHVtZTtcblxuXG4gICAgdGhpcy5fdGltZUV2ZW50cyA9IFtdO1xuICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlO1xuICAgIHRoaXMuX2xhc3RFdmVudCA9IG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQoMCwgX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcy5FTkRfT0ZfVFJBQ0spO1xuXG4gICAgdGhpcy5fdHJhY2tzID0gW107XG4gICAgdGhpcy5fdHJhY2tzQnlJZCA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX3BhcnRzID0gW107XG4gICAgdGhpcy5fcGFydHNCeUlkID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fZXZlbnRzID0gW107XG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX2FsbEV2ZW50cyA9IFtdOyAvLyBNSURJIGV2ZW50cyBhbmQgbWV0cm9ub21lIGV2ZW50c1xuXG4gICAgdGhpcy5fbm90ZXMgPSBbXTtcbiAgICB0aGlzLl9ub3Rlc0J5SWQgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9uZXdFdmVudHMgPSBbXTtcbiAgICB0aGlzLl9tb3ZlZEV2ZW50cyA9IFtdO1xuICAgIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXTtcbiAgICB0aGlzLl90cmFuc3Bvc2VkRXZlbnRzID0gW107XG5cbiAgICB0aGlzLl9uZXdQYXJ0cyA9IFtdO1xuICAgIHRoaXMuX2NoYW5nZWRQYXJ0cyA9IFtdO1xuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdO1xuXG4gICAgdGhpcy5fcmVtb3ZlZFRyYWNrcyA9IFtdO1xuXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDA7XG4gICAgdGhpcy5fc2NoZWR1bGVyID0gbmV3IF9zY2hlZHVsZXIyLmRlZmF1bHQodGhpcyk7XG4gICAgdGhpcy5fcGxheWhlYWQgPSBuZXcgX3BsYXloZWFkLlBsYXloZWFkKHRoaXMpO1xuXG4gICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICAgIHRoaXMubG9vcGluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5fZ2Fpbk5vZGUgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9nYWluTm9kZS5nYWluLnZhbHVlID0gdGhpcy52b2x1bWU7XG4gICAgdGhpcy5fZ2Fpbk5vZGUuY29ubmVjdChfaW5pdF9hdWRpby5tYXN0ZXJHYWluKTtcblxuICAgIHRoaXMuX21ldHJvbm9tZSA9IG5ldyBfbWV0cm9ub21lLk1ldHJvbm9tZSh0aGlzKTtcbiAgICB0aGlzLl9tZXRyb25vbWVFdmVudHMgPSBbXTtcbiAgICB0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlO1xuICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKCF0aGlzLnVzZU1ldHJvbm9tZSk7XG5cbiAgICB0aGlzLl9sb29wID0gZmFsc2U7XG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7IG1pbGxpczogMCwgdGlja3M6IDAgfTtcbiAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7IG1pbGxpczogMCwgdGlja3M6IDAgfTtcbiAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IGZhbHNlO1xuICAgIHRoaXMuX2xvb3BEdXJhdGlvbiA9IDA7XG4gICAgdGhpcy5fcHJlY291bnRCYXJzID0gMDtcbiAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDA7XG5cbiAgICB2YXIgdHJhY2tzID0gc2V0dGluZ3MudHJhY2tzO1xuICAgIHZhciB0aW1lRXZlbnRzID0gc2V0dGluZ3MudGltZUV2ZW50cztcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrcywgdGltZUV2ZW50cylcblxuICAgIGlmICh0eXBlb2YgdGltZUV2ZW50cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuX3RpbWVFdmVudHMgPSBbbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCgwLCBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLlRFTVBPLCB0aGlzLmJwbSksIG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQoMCwgX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSwgdGhpcy5ub21pbmF0b3IsIHRoaXMuZGVub21pbmF0b3IpXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hZGRUaW1lRXZlbnRzLmFwcGx5KHRoaXMsIF90b0NvbnN1bWFibGVBcnJheSh0aW1lRXZlbnRzKSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0cmFja3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmFkZFRyYWNrcy5hcHBseSh0aGlzLCBfdG9Db25zdW1hYmxlQXJyYXkodHJhY2tzKSk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTb25nLCBbe1xuICAgIGtleTogJ2FkZFRpbWVFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRUaW1lRXZlbnRzKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBldmVudHNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIC8vQFRPRE86IGZpbHRlciB0aW1lIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrIC0+IHVzZSB0aGUgbGFzdGx5IGFkZGVkIGV2ZW50c1xuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC50eXBlID09PSBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLlRJTUVfU0lHTkFUVVJFKSB7XG4gICAgICAgICAgX3RoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuX3RpbWVFdmVudHMucHVzaChldmVudCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZFRyYWNrcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFRyYWNrcygpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIHRyYWNrcyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgIHRyYWNrc1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuXG4gICAgICB0cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdmFyIF9uZXdFdmVudHMsIF9uZXdQYXJ0cztcblxuICAgICAgICB0cmFjay5fc29uZyA9IF90aGlzMjtcbiAgICAgICAgdHJhY2suX2dhaW5Ob2RlLmNvbm5lY3QoX3RoaXMyLl9nYWluTm9kZSk7XG4gICAgICAgIHRyYWNrLl9zb25nR2Fpbk5vZGUgPSBfdGhpczIuX2dhaW5Ob2RlO1xuICAgICAgICBfdGhpczIuX3RyYWNrcy5wdXNoKHRyYWNrKTtcbiAgICAgICAgX3RoaXMyLl90cmFja3NCeUlkLnNldCh0cmFjay5pZCwgdHJhY2spO1xuICAgICAgICAoX25ld0V2ZW50cyA9IF90aGlzMi5fbmV3RXZlbnRzKS5wdXNoLmFwcGx5KF9uZXdFdmVudHMsIF90b0NvbnN1bWFibGVBcnJheSh0cmFjay5fZXZlbnRzKSk7XG4gICAgICAgIChfbmV3UGFydHMgPSBfdGhpczIuX25ld1BhcnRzKS5wdXNoLmFwcGx5KF9uZXdQYXJ0cywgX3RvQ29uc3VtYWJsZUFycmF5KHRyYWNrLl9wYXJ0cykpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlVHJhY2tzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlVHJhY2tzKCkge1xuICAgICAgdmFyIF9yZW1vdmVkVHJhY2tzO1xuXG4gICAgICAoX3JlbW92ZWRUcmFja3MgPSB0aGlzLl9yZW1vdmVkVHJhY2tzKS5wdXNoLmFwcGx5KF9yZW1vdmVkVHJhY2tzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIF9zb25nLnVwZGF0ZS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3BsYXknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwbGF5KHR5cGUpIHtcbiAgICAgIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4zID4gMSA/IF9sZW4zIC0gMSA6IDApLCBfa2V5MyA9IDE7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcbiAgICAgICAgYXJnc1tfa2V5MyAtIDFdID0gYXJndW1lbnRzW19rZXkzXTtcbiAgICAgIH1cblxuICAgICAgLy91bmxvY2tXZWJBdWRpbygpXG4gICAgICB0aGlzLl9wbGF5LmFwcGx5KHRoaXMsIFt0eXBlXS5jb25jYXQoYXJncykpO1xuICAgICAgaWYgKHRoaXMuX3ByZWNvdW50QmFycyA+IDApIHtcbiAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3ByZWNvdW50aW5nJywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpcyB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3N0YXJ0X3JlY29yZGluZycsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXMgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoeyB0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXMgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX3BsYXknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfcGxheSh0eXBlKSB7XG4gICAgICBpZiAodHlwZW9mIHR5cGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGZvciAodmFyIF9sZW40ID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW40ID4gMSA/IF9sZW40IC0gMSA6IDApLCBfa2V5NCA9IDE7IF9rZXk0IDwgX2xlbjQ7IF9rZXk0KyspIHtcbiAgICAgICAgICBhcmdzW19rZXk0IC0gMV0gPSBhcmd1bWVudHNbX2tleTRdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbi5hcHBseSh0aGlzLCBbdHlwZV0uY29uY2F0KGFyZ3MpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnBsYXlpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2N1cnJlbnRNaWxsaXMpXG5cbiAgICAgIHRoaXMuX3JlZmVyZW5jZSA9IHRoaXMuX3RpbWVTdGFtcCA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwO1xuICAgICAgdGhpcy5fc2NoZWR1bGVyLnNldFRpbWVTdGFtcCh0aGlzLl9yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5fc3RhcnRNaWxsaXMgPSB0aGlzLl9jdXJyZW50TWlsbGlzO1xuXG4gICAgICBpZiAodGhpcy5fcHJlY291bnRCYXJzID4gMCAmJiB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZykge1xuXG4gICAgICAgIC8vIGNyZWF0ZSBwcmVjb3VudCBldmVudHMsIHRoZSBwbGF5aGVhZCB3aWxsIGJlIG1vdmVkIHRvIHRoZSBmaXJzdCBiZWF0IG9mIHRoZSBjdXJyZW50IGJhclxuICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMuX21ldHJvbm9tZS5jcmVhdGVQcmVjb3VudEV2ZW50cyhwb3NpdGlvbi5iYXIsIHBvc2l0aW9uLmJhciArIHRoaXMuX3ByZWNvdW50QmFycywgdGhpcy5fcmVmZXJlbmNlKTtcbiAgICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKCdiYXJzYmVhdHMnLCBbcG9zaXRpb24uYmFyXSwgJ21pbGxpcycpLm1pbGxpcztcbiAgICAgICAgdGhpcy5fcHJlY291bnREdXJhdGlvbiA9IHRoaXMuX21ldHJvbm9tZS5wcmVjb3VudER1cmF0aW9uO1xuICAgICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgKyB0aGlzLl9wcmVjb3VudER1cmF0aW9uO1xuXG4gICAgICAgIC8vIGNvbnNvbGUuZ3JvdXAoJ3ByZWNvdW50JylcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3Bvc2l0aW9uJywgdGhpcy5nZXRQb3NpdGlvbigpKVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnX2N1cnJlbnRNaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnZW5kUHJlY291bnRNaWxsaXMnLCB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcylcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ19wcmVjb3VudER1cmF0aW9uJywgdGhpcy5fcHJlY291bnREdXJhdGlvbilcbiAgICAgICAgLy8gY29uc29sZS5ncm91cEVuZCgncHJlY291bnQnKVxuICAgICAgICAvL2NvbnNvbGUubG9nKCdwcmVjb3VudER1cmF0aW9uJywgdGhpcy5fbWV0cm9ub21lLmNyZWF0ZVByZWNvdW50RXZlbnRzKHRoaXMuX3ByZWNvdW50QmFycywgdGhpcy5fcmVmZXJlbmNlKSlcbiAgICAgICAgdGhpcy5wcmVjb3VudGluZyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDA7XG4gICAgICAgIHRoaXMucGxheWluZyA9IHRydWU7XG4gICAgICAgIHRoaXMucmVjb3JkaW5nID0gdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmc7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2VuZFByZWNvdW50TWlsbGlzKVxuXG4gICAgICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKTtcbiAgICAgIHRoaXMuX3NjaGVkdWxlci5pbml0KHRoaXMuX2N1cnJlbnRNaWxsaXMpO1xuICAgICAgdGhpcy5fbG9vcCA9IHRoaXMubG9vcGluZyAmJiB0aGlzLl9jdXJyZW50TWlsbGlzIDw9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXM7XG4gICAgICB0aGlzLl9wdWxzZSgpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19wdWxzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9wdWxzZSgpIHtcbiAgICAgIGlmICh0aGlzLnBsYXlpbmcgPT09IGZhbHNlICYmIHRoaXMucHJlY291bnRpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3BlcmZvcm1VcGRhdGUgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSA9IGZhbHNlO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdwdWxzZSB1cGRhdGUnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgICAgICBfc29uZy5fdXBkYXRlLmNhbGwodGhpcyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBub3cgPSBfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMDtcbiAgICAgIC8vY29uc29sZS5sb2cobm93LCBwZXJmb3JtYW5jZS5ub3coKSlcbiAgICAgIHZhciBkaWZmID0gbm93IC0gdGhpcy5fcmVmZXJlbmNlO1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyArPSBkaWZmO1xuICAgICAgdGhpcy5fcmVmZXJlbmNlID0gbm93O1xuXG4gICAgICBpZiAodGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPiAwKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA+IHRoaXMuX2N1cnJlbnRNaWxsaXMpIHtcbiAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKGRpZmYpO1xuICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9wdWxzZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAvL3JldHVybiBiZWNhdXNlIGR1cmluZyBwcmVjb3VudGluZyBvbmx5IHByZWNvdW50IG1ldHJvbm9tZSBldmVudHMgZ2V0IHNjaGVkdWxlZFxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gMDtcbiAgICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyAtPSB0aGlzLl9wcmVjb3VudER1cmF0aW9uO1xuICAgICAgICBpZiAodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcpIHtcbiAgICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgIHRoaXMucmVjb3JkaW5nID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fc3RhcnRNaWxsaXMgfSk7XG4gICAgICAgICAgLy9kaXNwYXRjaEV2ZW50KHt0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9sb29wICYmIHRoaXMuX2N1cnJlbnRNaWxsaXMgPj0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcykge1xuICAgICAgICB0aGlzLl9jdXJyZW50TWlsbGlzIC09IHRoaXMuX2xvb3BEdXJhdGlvbjtcbiAgICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKTtcbiAgICAgICAgLy90aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcykgLy8gcGxheWhlYWQgaXMgYSBiaXQgYWhlYWQgb25seSBkdXJpbmcgdGhpcyBmcmFtZVxuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcGxheWhlYWQudXBkYXRlKCdtaWxsaXMnLCBkaWZmKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fdGlja3MgPSB0aGlzLl9wbGF5aGVhZC5nZXQoKS50aWNrcztcblxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzLCB0aGlzLl9kdXJhdGlvbk1pbGxpcylcblxuICAgICAgaWYgKHRoaXMuX2N1cnJlbnRNaWxsaXMgPj0gdGhpcy5fZHVyYXRpb25NaWxsaXMpIHtcbiAgICAgICAgdmFyIF9zY2hlZHVsZXIkZXZlbnRzO1xuXG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZyAhPT0gdHJ1ZSB8fCB0aGlzLmF1dG9TaXplICE9PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCBhbiBleHRyYSBiYXIgdG8gdGhlIHNpemUgb2YgdGhpcyBzb25nXG4gICAgICAgIHZhciBfZXZlbnRzID0gdGhpcy5fbWV0cm9ub21lLmFkZEV2ZW50cyh0aGlzLmJhcnMsIHRoaXMuYmFycyArIDEpO1xuICAgICAgICB2YXIgdG9iZVBhcnNlZCA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoX2V2ZW50cyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl90aW1lRXZlbnRzKSk7XG4gICAgICAgICgwLCBfdXRpbC5zb3J0RXZlbnRzKSh0b2JlUGFyc2VkKTtcbiAgICAgICAgKDAsIF9wYXJzZV9ldmVudHMucGFyc2VFdmVudHMpKHRvYmVQYXJzZWQpO1xuICAgICAgICAoX3NjaGVkdWxlciRldmVudHMgPSB0aGlzLl9zY2hlZHVsZXIuZXZlbnRzKS5wdXNoLmFwcGx5KF9zY2hlZHVsZXIkZXZlbnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoX2V2ZW50cykpO1xuICAgICAgICB0aGlzLl9zY2hlZHVsZXIubnVtRXZlbnRzICs9IF9ldmVudHMubGVuZ3RoO1xuICAgICAgICB2YXIgbGFzdEV2ZW50ID0gX2V2ZW50c1tfZXZlbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICB2YXIgZXh0cmFNaWxsaXMgPSBsYXN0RXZlbnQudGlja3NQZXJCYXIgKiBsYXN0RXZlbnQubWlsbGlzUGVyVGljaztcbiAgICAgICAgdGhpcy5fbGFzdEV2ZW50LnRpY2tzICs9IGxhc3RFdmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcyArPSBleHRyYU1pbGxpcztcbiAgICAgICAgdGhpcy5fZHVyYXRpb25NaWxsaXMgKz0gZXh0cmFNaWxsaXM7XG4gICAgICAgIHRoaXMuYmFycysrO1xuICAgICAgICB0aGlzLl9yZXNpemVkID0gdHJ1ZTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnbGVuZ3RoJywgdGhpcy5fbGFzdEV2ZW50LnRpY2tzLCB0aGlzLl9sYXN0RXZlbnQubWlsbGlzLCB0aGlzLmJhcnMsIGxhc3RFdmVudClcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZShkaWZmKTtcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3B1bHNlLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3BhdXNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGF1c2UoKSB7XG4gICAgICB0aGlzLnBhdXNlZCA9ICF0aGlzLnBhdXNlZDtcbiAgICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hbGxOb3Rlc09mZigpO1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoeyB0eXBlOiAncGF1c2UnLCBkYXRhOiB0aGlzLnBhdXNlZCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoeyB0eXBlOiAncGF1c2UnLCBkYXRhOiB0aGlzLnBhdXNlZCB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzdG9wJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ1NUT1AnKVxuICAgICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5hbGxOb3Rlc09mZigpO1xuICAgICAgaWYgKHRoaXMucGxheWluZyB8fCB0aGlzLnBhdXNlZCkge1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9jdXJyZW50TWlsbGlzICE9PSAwKSB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSAwO1xuICAgICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpO1xuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHtcbiAgICAgICAgICB0aGlzLnN0b3BSZWNvcmRpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoeyB0eXBlOiAnc3RvcCcgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc3RhcnRSZWNvcmRpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFydFJlY29yZGluZygpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fcmVjb3JkSWQgPSAncmVjb3JkaW5nXycgKyByZWNvcmRpbmdJbmRleCsrICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2suX3N0YXJ0UmVjb3JkaW5nKF90aGlzMy5fcmVjb3JkSWQpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc3RvcFJlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgaWYgKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2suX3N0b3BSZWNvcmRpbmcoX3RoaXM0Ll9yZWNvcmRJZCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZTtcbiAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdzdG9wX3JlY29yZGluZycgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndW5kb1JlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVuZG9SZWNvcmRpbmcoKSB7XG4gICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICAgIHRyYWNrLnVuZG9SZWNvcmRpbmcoX3RoaXM1Ll9yZWNvcmRJZCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVkb1JlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlZG9SZWNvcmRpbmcoKSB7XG4gICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICAgIHRyYWNrLnJlZG9SZWNvcmRpbmcoX3RoaXM2Ll9yZWNvcmRJZCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0TWV0cm9ub21lJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0TWV0cm9ub21lKGZsYWcpIHtcbiAgICAgIGlmICh0eXBlb2YgZmxhZyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy51c2VNZXRyb25vbWUgPSAhdGhpcy51c2VNZXRyb25vbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9IGZsYWc7XG4gICAgICB9XG4gICAgICB0aGlzLl9tZXRyb25vbWUubXV0ZSghdGhpcy51c2VNZXRyb25vbWUpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvbmZpZ3VyZU1ldHJvbm9tZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbmZpZ3VyZU1ldHJvbm9tZShjb25maWcpIHtcbiAgICAgIHRoaXMuX21ldHJvbm9tZS5jb25maWd1cmUoY29uZmlnKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb25maWd1cmUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb25maWd1cmUoY29uZmlnKSB7XG4gICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgaWYgKHR5cGVvZiBjb25maWcucGl0Y2ggIT09ICd1bmRlZmluZWQnKSB7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5waXRjaCA9PT0gdGhpcy5waXRjaCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBpdGNoID0gY29uZmlnLnBpdGNoO1xuICAgICAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBldmVudC51cGRhdGVQaXRjaChfdGhpczcucGl0Y2gpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBjb25maWcucHBxICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgX3JldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoY29uZmlnLnBwcSA9PT0gX3RoaXM3LnBwcSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdjogdm9pZCAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgcHBxRmFjdG9yID0gY29uZmlnLnBwcSAvIF90aGlzNy5wcHE7XG4gICAgICAgICAgX3RoaXM3LnBwcSA9IGNvbmZpZy5wcHE7XG4gICAgICAgICAgX3RoaXM3Ll9hbGxFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS50aWNrcyA9IGV2ZW50LnRpY2tzICogcHBxRmFjdG9yO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIF90aGlzNy5fdXBkYXRlVGltZUV2ZW50cyA9IHRydWU7XG4gICAgICAgICAgX3RoaXM3LnVwZGF0ZSgpO1xuICAgICAgICB9KCk7XG5cbiAgICAgICAgaWYgKCh0eXBlb2YgX3JldCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoX3JldCkpID09PSBcIm9iamVjdFwiKSByZXR1cm4gX3JldC52O1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGNvbmZpZy5wbGF5YmFja1NwZWVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoY29uZmlnLnBsYXliYWNrU3BlZWQgPT09IHRoaXMucGxheWJhY2tTcGVlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBsYXliYWNrU3BlZWQgPSBjb25maWcucGxheWJhY2tTcGVlZDtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhbGxOb3Rlc09mZicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFsbE5vdGVzT2ZmKCkge1xuICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICAgIHRyYWNrLmFsbE5vdGVzT2ZmKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fc2NoZWR1bGVyLmFsbE5vdGVzT2ZmKCk7XG4gICAgICB0aGlzLl9tZXRyb25vbWUuYWxsTm90ZXNPZmYoKTtcbiAgICB9XG4gICAgLypcbiAgICAgIHBhbmljKCl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICB0aGlzLl90cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHtcbiAgICAgICAgICAgIHRyYWNrLmRpc2Nvbm5lY3QodGhpcy5fZ2Fpbk5vZGUpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKCh0cmFjaykgPT4ge1xuICAgICAgICAgICAgICB0cmFjay5jb25uZWN0KHRoaXMuX2dhaW5Ob2RlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH0sIDEwMClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdnZXRUcmFja3MnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRUcmFja3MoKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl90cmFja3MpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBhcnRzKCkge1xuICAgICAgcmV0dXJuIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fcGFydHMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFdmVudHMoKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXROb3RlcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldE5vdGVzKCkge1xuICAgICAgcmV0dXJuIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fbm90ZXMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjYWxjdWxhdGVQb3NpdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uKGFyZ3MpIHtcbiAgICAgIHJldHVybiAoMCwgX3Bvc2l0aW9uLmNhbGN1bGF0ZVBvc2l0aW9uKSh0aGlzLCBhcmdzKTtcbiAgICB9XG5cbiAgICAvLyBAYXJncyAtPiBzZWUgX2NhbGN1bGF0ZVBvc2l0aW9uXG5cbiAgfSwge1xuICAgIGtleTogJ3NldFBvc2l0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UG9zaXRpb24odHlwZSkge1xuXG4gICAgICB2YXIgd2FzUGxheWluZyA9IHRoaXMucGxheWluZztcbiAgICAgIGlmICh0aGlzLnBsYXlpbmcpIHtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgX2xlbjUgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjUgPiAxID8gX2xlbjUgLSAxIDogMCksIF9rZXk1ID0gMTsgX2tleTUgPCBfbGVuNTsgX2tleTUrKykge1xuICAgICAgICBhcmdzW19rZXk1IC0gMV0gPSBhcmd1bWVudHNbX2tleTVdO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJyk7XG4gICAgICAvL2xldCBtaWxsaXMgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnbWlsbGlzJylcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gcG9zaXRpb24ubWlsbGlzO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzKVxuXG4gICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgICBkYXRhOiBwb3NpdGlvblxuICAgICAgfSk7XG5cbiAgICAgIGlmICh3YXNQbGF5aW5nKSB7XG4gICAgICAgIHRoaXMuX3BsYXkoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vQHRvZG86IGdldCB0aGlzIGluZm9ybWF0aW9uIGZyb20gbGV0ICdwb3NpdGlvbicgLT4gd2UgaGF2ZSBqdXN0IGNhbGN1bGF0ZWQgdGhlIHBvc2l0aW9uXG4gICAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcyk7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKCdzZXRQb3NpdGlvbicsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0UG9zaXRpb24nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQb3NpdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKS5wb3NpdGlvbjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRQbGF5aGVhZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBsYXloZWFkKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BsYXloZWFkLmdldCgpO1xuICAgIH1cblxuICAgIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cblxuICB9LCB7XG4gICAga2V5OiAnc2V0TGVmdExvY2F0b3InLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRMZWZ0TG9jYXRvcih0eXBlKSB7XG4gICAgICBmb3IgKHZhciBfbGVuNiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuNiA+IDEgPyBfbGVuNiAtIDEgOiAwKSwgX2tleTYgPSAxOyBfa2V5NiA8IF9sZW42OyBfa2V5NisrKSB7XG4gICAgICAgIGFyZ3NbX2tleTYgLSAxXSA9IGFyZ3VtZW50c1tfa2V5Nl07XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2xlZnRMb2NhdG9yID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpO1xuXG4gICAgICBpZiAodGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBwb3NpdGlvbiBmb3IgbG9jYXRvcicpO1xuICAgICAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHsgbWlsbGlzOiAwLCB0aWNrczogMCB9O1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuXG4gIH0sIHtcbiAgICBrZXk6ICdzZXRSaWdodExvY2F0b3InLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRSaWdodExvY2F0b3IodHlwZSkge1xuICAgICAgZm9yICh2YXIgX2xlbjcgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjcgPiAxID8gX2xlbjcgLSAxIDogMCksIF9rZXk3ID0gMTsgX2tleTcgPCBfbGVuNzsgX2tleTcrKykge1xuICAgICAgICBhcmdzW19rZXk3IC0gMV0gPSBhcmd1bWVudHNbX2tleTddO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJyk7XG5cbiAgICAgIGlmICh0aGlzLl9yaWdodExvY2F0b3IgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHsgbWlsbGlzOiAwLCB0aWNrczogMCB9O1xuICAgICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcG9zaXRpb24gZm9yIGxvY2F0b3InKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldExvb3AnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRMb29wKCkge1xuICAgICAgdmFyIGZsYWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuXG5cbiAgICAgIHRoaXMubG9vcGluZyA9IGZsYWcgIT09IG51bGwgPyBmbGFnIDogIXRoaXMuX2xvb3A7XG5cbiAgICAgIGlmICh0aGlzLl9yaWdodExvY2F0b3IgPT09IGZhbHNlIHx8IHRoaXMuX2xlZnRMb2NhdG9yID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sb29waW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gbG9jYXRvcnMgY2FuIG5vdCAoeWV0KSBiZSB1c2VkIHRvIGp1bXAgb3ZlciBhIHNlZ21lbnRcbiAgICAgIGlmICh0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzIDw9IHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcykge1xuICAgICAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sb29waW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fbG9vcER1cmF0aW9uID0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAtIHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcztcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5fbG9vcCwgdGhpcy5fbG9vcER1cmF0aW9uKVxuICAgICAgdGhpcy5fc2NoZWR1bGVyLmJleW9uZExvb3AgPSB0aGlzLl9jdXJyZW50TWlsbGlzID4gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcztcbiAgICAgIHRoaXMuX2xvb3AgPSB0aGlzLmxvb3BpbmcgJiYgdGhpcy5fY3VycmVudE1pbGxpcyA8PSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9sb29wLCB0aGlzLmxvb3BpbmcpXG4gICAgICByZXR1cm4gdGhpcy5sb29waW5nO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFByZWNvdW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UHJlY291bnQoKSB7XG4gICAgICB2YXIgdmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICB0aGlzLl9wcmVjb3VudEJhcnMgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAgaGVscGVyIG1ldGhvZDogY29udmVydHMgdXNlciBmcmllbmRseSBwb3NpdGlvbiBmb3JtYXQgdG8gaW50ZXJuYWwgZm9ybWF0XG4gICAgICAgcG9zaXRpb246XG4gICAgICAgIC0gJ3RpY2tzJywgOTYwMDBcbiAgICAgICAgLSAnbWlsbGlzJywgMTIzNFxuICAgICAgICAtICdwZXJjZW50YWdlJywgNTVcbiAgICAgICAgLSAnYmFyc2JlYXRzJywgMSwgNCwgMCwgMjUgLT4gYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tcbiAgICAgICAgLSAndGltZScsIDAsIDMsIDQ5LCA1NjYgLT4gaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfY2FsY3VsYXRlUG9zaXRpb24nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgcmVzdWx0VHlwZSkge1xuICAgICAgdmFyIHRhcmdldCA9IHZvaWQgMDtcblxuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgICAgY2FzZSAncGVyY2VudGFnZSc6XG4gICAgICAgICAgLy90YXJnZXQgPSBhcmdzWzBdIHx8IDBcbiAgICAgICAgICB0YXJnZXQgPSBhcmdzIHx8IDA7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZSc6XG4gICAgICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICAgICAgdGFyZ2V0ID0gYXJncztcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUubG9nKCd1bnN1cHBvcnRlZCB0eXBlJyk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zaXRpb24gPSAoMCwgX3Bvc2l0aW9uLmNhbGN1bGF0ZVBvc2l0aW9uKSh0aGlzLCB7XG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICByZXN1bHQ6IHJlc3VsdFR5cGVcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWRkRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiAoMCwgX2V2ZW50bGlzdGVuZXIuYWRkRXZlbnRMaXN0ZW5lcikodHlwZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZUV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKSB7XG4gICAgICAoMCwgX2V2ZW50bGlzdGVuZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcikodHlwZSwgaWQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NhdmVBc01JRElGaWxlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2F2ZUFzTUlESUZpbGUobmFtZSkge1xuICAgICAgKDAsIF9zYXZlX21pZGlmaWxlLnNhdmVBc01JRElGaWxlKSh0aGlzLCBuYW1lKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRWb2x1bWUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRWb2x1bWUodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA8IDAgfHwgdmFsdWUgPiAxKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTb25nLnNldFZvbHVtZSgpIGFjY2VwdHMgYSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIDEsIHlvdSBlbnRlcmVkOicsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy52b2x1bWUgPSB2YWx1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRWb2x1bWUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRWb2x1bWUoKSB7XG4gICAgICByZXR1cm4gdGhpcy52b2x1bWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0UGFubmluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFBhbm5pbmcodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA8IC0xIHx8IHZhbHVlID4gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnU29uZy5zZXRQYW5uaW5nKCkgYWNjZXB0cyBhIHZhbHVlIGJldHdlZW4gLTEgKGZ1bGwgbGVmdCkgYW5kIDEgKGZ1bGwgcmlnaHQpLCB5b3UgZW50ZXJlZDonLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xuICAgICAgICB0cmFjay5zZXRQYW5uaW5nKHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcGFubmVyVmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU29uZztcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnVwZGF0ZSA9IHVwZGF0ZTtcbmV4cG9ydHMuX3VwZGF0ZSA9IF91cGRhdGU7XG5cbnZhciBfcGFyc2VfZXZlbnRzID0gcmVxdWlyZSgnLi9wYXJzZV9ldmVudHMnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcblxudmFyIF9wb3NpdGlvbiA9IHJlcXVpcmUoJy4vcG9zaXRpb24nKTtcblxudmFyIF9taWRpX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpX2V2ZW50Jyk7XG5cbnZhciBfZXZlbnRsaXN0ZW5lciA9IHJlcXVpcmUoJy4vZXZlbnRsaXN0ZW5lcicpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH0gLy8gY2FsbGVkIGJ5IHNvbmdcblxuXG5mdW5jdGlvbiB1cGRhdGUoKSB7XG4gIGlmICh0aGlzLnBsYXlpbmcgPT09IGZhbHNlKSB7XG4gICAgX3VwZGF0ZS5jYWxsKHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX3BlcmZvcm1VcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIF91cGRhdGUoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgaWYgKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IGZhbHNlICYmIHRoaXMuX3JlbW92ZWRUcmFja3MubGVuZ3RoID09PSAwICYmIHRoaXMuX3JlbW92ZWRFdmVudHMubGVuZ3RoID09PSAwICYmIHRoaXMuX25ld0V2ZW50cy5sZW5ndGggPT09IDAgJiYgdGhpcy5fbW92ZWRFdmVudHMubGVuZ3RoID09PSAwICYmIHRoaXMuX25ld1BhcnRzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9yZW1vdmVkUGFydHMubGVuZ3RoID09PSAwICYmIHRoaXMuX3Jlc2l6ZWQgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vZGVidWdcbiAgLy90aGlzLmlzUGxheWluZyA9IHRydWVcblxuICAvL2NvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ3VwZGF0ZSBzb25nJylcbiAgY29uc29sZS50aW1lKCd1cGRhdGluZyBzb25nIHRvb2snKTtcblxuICAvLyBUSU1FIEVWRU5UU1xuXG4gIC8vIGNoZWNrIGlmIHRpbWUgZXZlbnRzIGFyZSB1cGRhdGVkXG4gIGlmICh0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSB0cnVlKSB7XG4gICAgLy9jb25zb2xlLmxvZygndXBkYXRlVGltZUV2ZW50cycsIHRoaXMuX3RpbWVFdmVudHMubGVuZ3RoKVxuICAgICgwLCBfcGFyc2VfZXZlbnRzLnBhcnNlVGltZUV2ZW50cykodGhpcywgdGhpcy5fdGltZUV2ZW50cywgdGhpcy5pc1BsYXlpbmcpO1xuICAgIC8vY29uc29sZS5sb2coJ3RpbWUgZXZlbnRzICVPJywgdGhpcy5fdGltZUV2ZW50cylcbiAgfVxuXG4gIC8vIG9ubHkgcGFyc2UgbmV3IGFuZCBtb3ZlZCBldmVudHNcbiAgdmFyIHRvYmVQYXJzZWQgPSBbXTtcblxuICAvLyBidXQgcGFyc2UgYWxsIGV2ZW50cyBpZiB0aGUgdGltZSBldmVudHMgaGF2ZSBiZWVuIHVwZGF0ZWRcbiAgaWYgKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IHRydWUpIHtcbiAgICB0b2JlUGFyc2VkID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgfVxuXG4gIC8vIFRSQUNLU1xuICAvLyByZW1vdmVkIHRyYWNrc1xuICBpZiAodGhpcy5fcmVtb3ZlZFRyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgdGhpcy5fcmVtb3ZlZFRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xuICAgICAgX3RoaXMuX3RyYWNrc0J5SWQuZGVsZXRlKHRyYWNrLmlkKTtcbiAgICAgIHRyYWNrLnJlbW92ZVBhcnRzKHRyYWNrLmdldFBhcnRzKCkpO1xuICAgICAgdHJhY2suX3NvbmcgPSBudWxsO1xuICAgICAgdHJhY2suX2dhaW5Ob2RlLmRpc2Nvbm5lY3QoKTtcbiAgICAgIHRyYWNrLl9zb25nR2Fpbk5vZGUgPSBudWxsO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gUEFSVFNcbiAgLy8gcmVtb3ZlZCBwYXJ0c1xuICAvL2NvbnNvbGUubG9nKCdyZW1vdmVkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKVxuICBpZiAodGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICB0aGlzLl9yZW1vdmVkUGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgICAgX3RoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCk7XG4gICAgfSk7XG4gICAgdGhpcy5fcGFydHMgPSBBcnJheS5mcm9tKHRoaXMuX3BhcnRzQnlJZC52YWx1ZXMoKSk7XG4gIH1cblxuICAvLyBhZGQgbmV3IHBhcnRzXG4gIC8vY29uc29sZS5sb2coJ25ldyBwYXJ0cyAlTycsIHRoaXMuX25ld1BhcnRzKVxuICB0aGlzLl9uZXdQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgcGFydC5fc29uZyA9IF90aGlzO1xuICAgIF90aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpO1xuICAgIHBhcnQudXBkYXRlKCk7XG4gIH0pO1xuXG4gIC8vIHVwZGF0ZSBjaGFuZ2VkIHBhcnRzXG4gIC8vY29uc29sZS5sb2coJ2NoYW5nZWQgcGFydHMgJU8nLCB0aGlzLl9jaGFuZ2VkUGFydHMpXG4gIHRoaXMuX2NoYW5nZWRQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgcGFydC51cGRhdGUoKTtcbiAgfSk7XG5cbiAgLy8gRVZFTlRTXG5cbiAgLy8gZmlsdGVyIHJlbW92ZWQgZXZlbnRzXG4gIC8vY29uc29sZS5sb2coJ3JlbW92ZWQgZXZlbnRzICVPJywgdGhpcy5fcmVtb3ZlZEV2ZW50cylcbiAgdGhpcy5fcmVtb3ZlZEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciB0cmFjayA9IGV2ZW50Lm1pZGlOb3RlLl90cmFjaztcbiAgICAvLyB1bnNjaGVkdWxlIGFsbCByZW1vdmVkIGV2ZW50cyB0aGF0IGFscmVhZHkgaGF2ZSBiZWVuIHNjaGVkdWxlZFxuICAgIGlmIChldmVudC50aW1lID49IF90aGlzLl9jdXJyZW50TWlsbGlzKSB7XG4gICAgICB0cmFjay51bnNjaGVkdWxlKGV2ZW50KTtcbiAgICB9XG4gICAgX3RoaXMuX25vdGVzQnlJZC5kZWxldGUoZXZlbnQubWlkaU5vdGUuaWQpO1xuICAgIF90aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZCk7XG4gIH0pO1xuXG4gIC8vIGFkZCBuZXcgZXZlbnRzXG4gIC8vY29uc29sZS5sb2coJ25ldyBldmVudHMgJU8nLCB0aGlzLl9uZXdFdmVudHMpXG4gIHRoaXMuX25ld0V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgIF90aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpO1xuICAgIF90aGlzLl9ldmVudHMucHVzaChldmVudCk7XG4gICAgdG9iZVBhcnNlZC5wdXNoKGV2ZW50KTtcbiAgfSk7XG5cbiAgLy8gbW92ZWQgZXZlbnRzIG5lZWQgdG8gYmUgcGFyc2VkXG4gIC8vY29uc29sZS5sb2coJ21vdmVkICVPJywgdGhpcy5fbW92ZWRFdmVudHMpXG4gIHRoaXMuX21vdmVkRXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gZG9uJ3QgYWRkIG1vdmVkIGV2ZW50cyBpZiB0aGUgdGltZSBldmVudHMgaGF2ZSBiZWVuIHVwZGF0ZWQgLT4gdGhleSBoYXZlIGFscmVhZHkgYmVlbiBhZGRlZCB0byB0aGUgdG9iZVBhcnNlZCBhcnJheVxuICAgIGlmIChfdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gZmFsc2UpIHtcbiAgICAgIHRvYmVQYXJzZWQucHVzaChldmVudCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBwYXJzZSBhbGwgbmV3IGFuZCBtb3ZlZCBldmVudHNcbiAgaWYgKHRvYmVQYXJzZWQubGVuZ3RoID4gMCkge1xuICAgIC8vY29uc29sZS50aW1lKCdwYXJzZScpXG4gICAgLy9jb25zb2xlLmxvZygndG9iZVBhcnNlZCAlTycsIHRvYmVQYXJzZWQpXG4gICAgLy9jb25zb2xlLmxvZygncGFyc2VFdmVudHMnLCB0b2JlUGFyc2VkLmxlbmd0aClcblxuICAgIHRvYmVQYXJzZWQgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRvYmVQYXJzZWQpLCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fdGltZUV2ZW50cykpO1xuICAgICgwLCBfcGFyc2VfZXZlbnRzLnBhcnNlRXZlbnRzKSh0b2JlUGFyc2VkLCB0aGlzLmlzUGxheWluZyk7XG5cbiAgICAvLyBhZGQgTUlESSBub3RlcyB0byBzb25nXG4gICAgdG9iZVBhcnNlZC5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5pZCwgZXZlbnQudHlwZSwgZXZlbnQubWlkaU5vdGUpXG4gICAgICBpZiAoZXZlbnQudHlwZSA9PT0gX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcy5OT1RFX09OKSB7XG4gICAgICAgIGlmIChldmVudC5taWRpTm90ZSkge1xuICAgICAgICAgIF90aGlzLl9ub3Rlc0J5SWQuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50LnR5cGUpXG4gICAgICAgICAgLy90aGlzLl9ub3Rlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy9jb25zb2xlLnRpbWVFbmQoJ3BhcnNlJylcbiAgfVxuXG4gIGlmICh0b2JlUGFyc2VkLmxlbmd0aCA+IDAgfHwgdGhpcy5fcmVtb3ZlZEV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgLy9jb25zb2xlLnRpbWUoJ3RvIGFycmF5JylcbiAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpO1xuICAgIHRoaXMuX25vdGVzID0gQXJyYXkuZnJvbSh0aGlzLl9ub3Rlc0J5SWQudmFsdWVzKCkpO1xuICAgIC8vY29uc29sZS50aW1lRW5kKCd0byBhcnJheScpXG4gIH1cblxuICAvL2NvbnNvbGUudGltZShgc29ydGluZyAke3RoaXMuX2V2ZW50cy5sZW5ndGh9IGV2ZW50c2ApXG4gICgwLCBfdXRpbC5zb3J0RXZlbnRzKSh0aGlzLl9ldmVudHMpO1xuICB0aGlzLl9ub3Rlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEubm90ZU9uLnRpY2tzIC0gYi5ub3RlT24udGlja3M7XG4gIH0pO1xuICAvL2NvbnNvbGUudGltZUVuZChgc29ydGluZyAke3RoaXMuX2V2ZW50cy5sZW5ndGh9IGV2ZW50c2ApXG5cbiAgLy9jb25zb2xlLmxvZygnbm90ZXMgJU8nLCB0aGlzLl9ub3RlcylcbiAgY29uc29sZS50aW1lRW5kKCd1cGRhdGluZyBzb25nIHRvb2snKTtcblxuICAvLyBTT05HIERVUkFUSU9OXG5cbiAgLy8gZ2V0IHRoZSBsYXN0IGV2ZW50IG9mIHRoaXMgc29uZ1xuICB2YXIgbGFzdEV2ZW50ID0gdGhpcy5fZXZlbnRzW3RoaXMuX2V2ZW50cy5sZW5ndGggLSAxXTtcbiAgdmFyIGxhc3RUaW1lRXZlbnQgPSB0aGlzLl90aW1lRXZlbnRzW3RoaXMuX3RpbWVFdmVudHMubGVuZ3RoIC0gMV07XG4gIC8vY29uc29sZS5sb2cobGFzdEV2ZW50LCBsYXN0VGltZUV2ZW50KVxuXG4gIC8vIGNoZWNrIGlmIHNvbmcgaGFzIGFscmVhZHkgYW55IGV2ZW50c1xuICBpZiAobGFzdEV2ZW50IGluc3RhbmNlb2YgX21pZGlfZXZlbnQuTUlESUV2ZW50ID09PSBmYWxzZSkge1xuICAgIGxhc3RFdmVudCA9IGxhc3RUaW1lRXZlbnQ7XG4gIH0gZWxzZSBpZiAobGFzdFRpbWVFdmVudC50aWNrcyA+IGxhc3RFdmVudC50aWNrcykge1xuICAgIGxhc3RFdmVudCA9IGxhc3RUaW1lRXZlbnQ7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhsYXN0RXZlbnQsIHRoaXMuYmFycylcblxuICAvLyBnZXQgdGhlIHBvc2l0aW9uIGRhdGEgb2YgdGhlIGZpcnN0IGJlYXQgaW4gdGhlIGJhciBhZnRlciB0aGUgbGFzdCBiYXJcbiAgdGhpcy5iYXJzID0gTWF0aC5tYXgobGFzdEV2ZW50LmJhciwgdGhpcy5iYXJzKTtcbiAgdmFyIHRpY2tzID0gKDAsIF9wb3NpdGlvbi5jYWxjdWxhdGVQb3NpdGlvbikodGhpcywge1xuICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgIHRhcmdldDogW3RoaXMuYmFycyArIDFdLFxuICAgIHJlc3VsdDogJ3RpY2tzJ1xuICB9KS50aWNrcztcblxuICAvLyB3ZSB3YW50IHRvIHB1dCB0aGUgRU5EX09GX1RSQUNLIGV2ZW50IGF0IHRoZSB2ZXJ5IGxhc3QgdGljayBvZiB0aGUgbGFzdCBiYXIsIHNvIHdlIGNhbGN1bGF0ZSB0aGF0IHBvc2l0aW9uXG4gIHZhciBtaWxsaXMgPSAoMCwgX3Bvc2l0aW9uLmNhbGN1bGF0ZVBvc2l0aW9uKSh0aGlzLCB7XG4gICAgdHlwZTogJ3RpY2tzJyxcbiAgICB0YXJnZXQ6IHRpY2tzIC0gMSxcbiAgICByZXN1bHQ6ICdtaWxsaXMnXG4gIH0pLm1pbGxpcztcblxuICB0aGlzLl9sYXN0RXZlbnQudGlja3MgPSB0aWNrcyAtIDE7XG4gIHRoaXMuX2xhc3RFdmVudC5taWxsaXMgPSBtaWxsaXM7XG5cbiAgLy9jb25zb2xlLmxvZygnbGVuZ3RoJywgdGhpcy5fbGFzdEV2ZW50LnRpY2tzLCB0aGlzLl9sYXN0RXZlbnQubWlsbGlzLCB0aGlzLmJhcnMpXG5cbiAgdGhpcy5fZHVyYXRpb25UaWNrcyA9IHRoaXMuX2xhc3RFdmVudC50aWNrcztcbiAgdGhpcy5fZHVyYXRpb25NaWxsaXMgPSB0aGlzLl9sYXN0RXZlbnQubWlsbGlzO1xuXG4gIC8vIE1FVFJPTk9NRVxuXG4gIC8vIGFkZCBtZXRyb25vbWUgZXZlbnRzXG4gIGlmICh0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgfHwgdGhpcy5fbWV0cm9ub21lLmJhcnMgIT09IHRoaXMuYmFycyB8fCB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSB0cnVlKSB7XG4gICAgdGhpcy5fbWV0cm9ub21lRXZlbnRzID0gKDAsIF9wYXJzZV9ldmVudHMucGFyc2VFdmVudHMpKFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fdGltZUV2ZW50cyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKCkpKSk7XG4gIH1cbiAgdGhpcy5fYWxsRXZlbnRzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9tZXRyb25vbWVFdmVudHMpLCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fZXZlbnRzKSk7XG4gICgwLCBfdXRpbC5zb3J0RXZlbnRzKSh0aGlzLl9hbGxFdmVudHMpO1xuICAvL2NvbnNvbGUubG9nKCdhbGwgZXZlbnRzICVPJywgdGhpcy5fYWxsRXZlbnRzKVxuXG4gIC8qXG4gICAgdGhpcy5fbWV0cm9ub21lLmdldEV2ZW50cygpXG4gICAgdGhpcy5fYWxsRXZlbnRzID0gWy4uLnRoaXMuX2V2ZW50c11cbiAgICBzb3J0RXZlbnRzKHRoaXMuX2FsbEV2ZW50cylcbiAgKi9cblxuICAvL2NvbnNvbGUubG9nKCdjdXJyZW50IG1pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gIHRoaXMuX3BsYXloZWFkLnVwZGF0ZVNvbmcoKTtcbiAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZVNvbmcoKTtcblxuICBpZiAodGhpcy5wbGF5aW5nID09PSBmYWxzZSkge1xuICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcyk7XG4gICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICBkYXRhOiB0aGlzLl9wbGF5aGVhZC5nZXQoKS5wb3NpdGlvblxuICAgIH0pO1xuICB9XG5cbiAgLy8gcmVzZXRcbiAgdGhpcy5fbmV3UGFydHMgPSBbXTtcbiAgdGhpcy5fcmVtb3ZlZFBhcnRzID0gW107XG4gIHRoaXMuX25ld0V2ZW50cyA9IFtdO1xuICB0aGlzLl9tb3ZlZEV2ZW50cyA9IFtdO1xuICB0aGlzLl9yZW1vdmVkRXZlbnRzID0gW107XG4gIHRoaXMuX3Jlc2l6ZWQgPSBmYWxzZTtcbiAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IGZhbHNlO1xuXG4gIC8vY29uc29sZS5ncm91cEVuZCgndXBkYXRlIHNvbmcnKVxufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuc29uZ0Zyb21NSURJRmlsZVN5bmMgPSBzb25nRnJvbU1JRElGaWxlU3luYztcbmV4cG9ydHMuc29uZ0Zyb21NSURJRmlsZSA9IHNvbmdGcm9tTUlESUZpbGU7XG5cbnZhciBfaXNvbW9ycGhpY0ZldGNoID0gcmVxdWlyZSgnaXNvbW9ycGhpYy1mZXRjaCcpO1xuXG52YXIgX2lzb21vcnBoaWNGZXRjaDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc29tb3JwaGljRmV0Y2gpO1xuXG52YXIgX21pZGlmaWxlID0gcmVxdWlyZSgnLi9taWRpZmlsZScpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF9wYXJ0ID0gcmVxdWlyZSgnLi9wYXJ0Jyk7XG5cbnZhciBfdHJhY2sgPSByZXF1aXJlKCcuL3RyYWNrJyk7XG5cbnZhciBfc29uZyA9IHJlcXVpcmUoJy4vc29uZycpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9mZXRjaF9oZWxwZXJzID0gcmVxdWlyZSgnLi9mZXRjaF9oZWxwZXJzJyk7XG5cbnZhciBfc2V0dGluZ3MgPSByZXF1aXJlKCcuL3NldHRpbmdzJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIHRvU29uZyhwYXJzZWQsIHNldHRpbmdzKSB7XG5cbiAgdmFyIHRyYWNrcyA9IHBhcnNlZC50cmFja3M7XG4gIHZhciBwcHEgPSBwYXJzZWQuaGVhZGVyLnRpY2tzUGVyQmVhdDsgLy8gdGhlIFBQUSBhcyBzZXQgaW4gdGhlIGxvYWRlZCBNSURJIGZpbGVcbiAgdmFyIHBwcUZhY3RvciA9IDE7XG5cbiAgLy8gY2hlY2sgaWYgd2UgbmVlZCB0byBvdmVycnVsZSB0aGUgUFBRIG9mcyB0aGUgbG9hZGVkIE1JREkgZmlsZVxuICBpZiAodHlwZW9mIHNldHRpbmdzLm92ZXJydWxlUFBRID09PSAndW5kZWZpbmVkJyB8fCBzZXR0aW5ncy5vdmVycnVsZVBQUSA9PT0gdHJ1ZSkge1xuICAgIHZhciBuZXdQUFEgPSAoMCwgX3NldHRpbmdzLmdldFNldHRpbmdzKSgpLnBwcTtcbiAgICBwcHFGYWN0b3IgPSBuZXdQUFEgLyBwcHE7XG4gICAgcHBxID0gbmV3UFBRO1xuICB9XG5cbiAgdmFyIHRpbWVFdmVudHMgPSBbXTtcbiAgdmFyIGJwbSA9IC0xO1xuICB2YXIgbm9taW5hdG9yID0gLTE7XG4gIHZhciBkZW5vbWluYXRvciA9IC0xO1xuICB2YXIgbmV3VHJhY2tzID0gW107XG5cbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gdHJhY2tzLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgdmFyIHRyYWNrID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgIHZhciBsYXN0VGlja3MgPSB2b2lkIDAsXG4gICAgICAgICAgbGFzdFR5cGUgPSB2b2lkIDA7XG4gICAgICB2YXIgdGlja3MgPSAwO1xuICAgICAgdmFyIHR5cGUgPSB2b2lkIDA7XG4gICAgICB2YXIgY2hhbm5lbCA9IC0xO1xuICAgICAgdmFyIHRyYWNrTmFtZSA9IHZvaWQgMDtcbiAgICAgIHZhciB0cmFja0luc3RydW1lbnROYW1lID0gdm9pZCAwO1xuICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuXG4gICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICAgICAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IHRyYWNrW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgICAgdmFyIGV2ZW50ID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICAgICAgdGlja3MgKz0gZXZlbnQuZGVsdGFUaW1lICogcHBxRmFjdG9yO1xuXG4gICAgICAgICAgaWYgKGNoYW5uZWwgPT09IC0xICYmIHR5cGVvZiBldmVudC5jaGFubmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY2hhbm5lbCA9IGV2ZW50LmNoYW5uZWw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHR5cGUgPSBldmVudC5zdWJ0eXBlO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVsdGFUaW1lLCB0aWNrcywgdHlwZSk7XG5cbiAgICAgICAgICBzd2l0Y2ggKGV2ZW50LnN1YnR5cGUpIHtcblxuICAgICAgICAgICAgY2FzZSAndHJhY2tOYW1lJzpcbiAgICAgICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2luc3RydW1lbnROYW1lJzpcbiAgICAgICAgICAgICAgaWYgKGV2ZW50LnRleHQpIHtcbiAgICAgICAgICAgICAgICB0cmFja0luc3RydW1lbnROYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbm90ZU9uJzpcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHg5MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ25vdGVPZmYnOlxuICAgICAgICAgICAgICBldmVudHMucHVzaChuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KHRpY2tzLCAweDgwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnc2V0VGVtcG8nOlxuICAgICAgICAgICAgICAvLyBzb21ldGltZXMgMiB0ZW1wbyBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgICAgICB2YXIgdG1wID0gNjAwMDAwMDAgLyBldmVudC5taWNyb3NlY29uZHNQZXJCZWF0O1xuXG4gICAgICAgICAgICAgIGlmICh0aWNrcyA9PT0gbGFzdFRpY2tzICYmIHR5cGUgPT09IGxhc3RUeXBlKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oJ3RlbXBvIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIHRtcCk7XG4gICAgICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChicG0gPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgYnBtID0gdG1wO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRpbWVFdmVudHMucHVzaChuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KHRpY2tzLCAweDUxLCB0bXApKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3RpbWVTaWduYXR1cmUnOlxuICAgICAgICAgICAgICAvLyBzb21ldGltZXMgMiB0aW1lIHNpZ25hdHVyZSBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgICAgICBpZiAobGFzdFRpY2tzID09PSB0aWNrcyAmJiBsYXN0VHlwZSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygndGltZSBzaWduYXR1cmUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2snLCB0aWNrcywgZXZlbnQubnVtZXJhdG9yLCBldmVudC5kZW5vbWluYXRvcik7XG4gICAgICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChub21pbmF0b3IgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbm9taW5hdG9yID0gZXZlbnQubnVtZXJhdG9yO1xuICAgICAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MsIDB4NTgsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2NvbnRyb2xsZXInOlxuICAgICAgICAgICAgICBldmVudHMucHVzaChuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KHRpY2tzLCAweEIwLCBldmVudC5jb250cm9sbGVyVHlwZSwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3Byb2dyYW1DaGFuZ2UnOlxuICAgICAgICAgICAgICBldmVudHMucHVzaChuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KHRpY2tzLCAweEMwLCBldmVudC5wcm9ncmFtTnVtYmVyKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdwaXRjaEJlbmQnOlxuICAgICAgICAgICAgICBldmVudHMucHVzaChuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KHRpY2tzLCAweEUwLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2codHJhY2submFtZSwgZXZlbnQudHlwZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGFzdFR5cGUgPSB0eXBlO1xuICAgICAgICAgIGxhc3RUaWNrcyA9IHRpY2tzO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAvL2NvbnNvbGUuY291bnQoZXZlbnRzLmxlbmd0aClcbiAgICAgICAgbmV3VHJhY2tzLnB1c2gobmV3IF90cmFjay5UcmFjayh7XG4gICAgICAgICAgbmFtZTogdHJhY2tOYW1lLFxuICAgICAgICAgIHBhcnRzOiBbbmV3IF9wYXJ0LlBhcnQoe1xuICAgICAgICAgICAgZXZlbnRzOiBldmVudHNcbiAgICAgICAgICB9KV1cbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgc29uZyA9IG5ldyBfc29uZy5Tb25nKHtcbiAgICBwcHE6IHBwcSxcbiAgICBicG06IGJwbSxcbiAgICBub21pbmF0b3I6IG5vbWluYXRvcixcbiAgICBkZW5vbWluYXRvcjogZGVub21pbmF0b3IsXG4gICAgdHJhY2tzOiBuZXdUcmFja3MsXG4gICAgdGltZUV2ZW50czogdGltZUV2ZW50c1xuICB9KTtcbiAgLy9zb25nLnVwZGF0ZSgpXG4gIHJldHVybiBzb25nO1xufVxuXG5mdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlU3luYyhkYXRhKSB7XG4gIHZhciBzZXR0aW5ncyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gIHZhciBzb25nID0gbnVsbDtcblxuICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKSB7XG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgIHNvbmcgPSB0b1NvbmcoKDAsIF9taWRpZmlsZS5wYXJzZU1JRElGaWxlKShidWZmZXIpLCBzZXR0aW5ncyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEuaGVhZGVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZGF0YS50cmFja3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gYSBNSURJIGZpbGUgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIHBhcnNlZFxuICAgIHNvbmcgPSB0b1NvbmcoZGF0YSwgc2V0dGluZ3MpO1xuICB9IGVsc2Uge1xuICAgIC8vIGEgYmFzZTY0IGVuY29kZWQgTUlESSBmaWxlXG4gICAgZGF0YSA9ICgwLCBfdXRpbC5iYXNlNjRUb0JpbmFyeSkoZGF0YSk7XG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIF9idWZmZXIgPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgICAgIHNvbmcgPSB0b1NvbmcoKDAsIF9taWRpZmlsZS5wYXJzZU1JRElGaWxlKShfYnVmZmVyKSwgc2V0dGluZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKCd3cm9uZyBkYXRhJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNvbmc7XG4gIC8vIHtcbiAgLy8gICBwcHEgPSBuZXdQUFEsXG4gIC8vICAgYnBtID0gbmV3QlBNLFxuICAvLyAgIHBsYXliYWNrU3BlZWQgPSBuZXdQbGF5YmFja1NwZWVkLFxuICAvLyB9ID0gc2V0dGluZ3Ncbn1cblxuZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZSh1cmwpIHtcbiAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMV07XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAvLyBmZXRjaCh1cmwsIHtcbiAgICAvLyAgIG1vZGU6ICduby1jb3JzJ1xuICAgIC8vIH0pXG4gICAgKDAsIF9pc29tb3JwaGljRmV0Y2gyLmRlZmF1bHQpKHVybCkudGhlbihfZmV0Y2hfaGVscGVycy5zdGF0dXMpLnRoZW4oX2ZldGNoX2hlbHBlcnMuYXJyYXlCdWZmZXIpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHJlc29sdmUoc29uZ0Zyb21NSURJRmlsZVN5bmMoZGF0YSwgc2V0dGluZ3MpKTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZSkge1xuICAgICAgcmVqZWN0KGUpO1xuICAgIH0pO1xuICB9KTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlRyYWNrID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3BhcnQgPSByZXF1aXJlKCcuL3BhcnQnKTtcblxudmFyIF9taWRpX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpX2V2ZW50Jyk7XG5cbnZhciBfbWlkaV9ub3RlID0gcmVxdWlyZSgnLi9taWRpX25vdGUnKTtcblxudmFyIF9pbml0X21pZGkgPSByZXF1aXJlKCcuL2luaXRfbWlkaScpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfcWFtYmkgPSByZXF1aXJlKCcuL3FhbWJpJyk7XG5cbnZhciBfZXZlbnRsaXN0ZW5lciA9IHJlcXVpcmUoJy4vZXZlbnRsaXN0ZW5lcicpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIHplcm9WYWx1ZSA9IDAuMDAwMDAwMDAwMDAwMDAwMDE7XG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG5cbnZhciBUcmFjayA9IGV4cG9ydHMuVHJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFRyYWNrKCkge1xuICAgIHZhciBzZXR0aW5ncyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFRyYWNrKTtcblxuICAgIHRoaXMuaWQgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIC8vY29uc29sZS5sb2codGhpcy5uYW1lLCB0aGlzLmNoYW5uZWwsIHRoaXMubXV0ZWQsIHRoaXMudm9sdW1lKVxuXG4gICAgdmFyIF9zZXR0aW5ncyRuYW1lID0gc2V0dGluZ3MubmFtZTtcbiAgICB0aGlzLm5hbWUgPSBfc2V0dGluZ3MkbmFtZSA9PT0gdW5kZWZpbmVkID8gdGhpcy5pZCA6IF9zZXR0aW5ncyRuYW1lO1xuICAgIHZhciBfc2V0dGluZ3MkY2hhbm5lbCA9IHNldHRpbmdzLmNoYW5uZWw7XG4gICAgdGhpcy5jaGFubmVsID0gX3NldHRpbmdzJGNoYW5uZWwgPT09IHVuZGVmaW5lZCA/IDAgOiBfc2V0dGluZ3MkY2hhbm5lbDtcbiAgICB2YXIgX3NldHRpbmdzJG11dGVkID0gc2V0dGluZ3MubXV0ZWQ7XG4gICAgdGhpcy5tdXRlZCA9IF9zZXR0aW5ncyRtdXRlZCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBfc2V0dGluZ3MkbXV0ZWQ7XG4gICAgdmFyIF9zZXR0aW5ncyR2b2x1bWUgPSBzZXR0aW5ncy52b2x1bWU7XG4gICAgdGhpcy52b2x1bWUgPSBfc2V0dGluZ3Mkdm9sdW1lID09PSB1bmRlZmluZWQgPyAwLjUgOiBfc2V0dGluZ3Mkdm9sdW1lO1xuICAgIHRoaXMuX3Bhbm5lciA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlUGFubmVyKCk7XG4gICAgdGhpcy5fcGFubmVyLnBhbm5pbmdNb2RlbCA9ICdlcXVhbHBvd2VyJztcbiAgICB0aGlzLl9wYW5uZXIuc2V0UG9zaXRpb24oemVyb1ZhbHVlLCB6ZXJvVmFsdWUsIHplcm9WYWx1ZSk7XG4gICAgdGhpcy5fZ2Fpbk5vZGUgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9nYWluTm9kZS5nYWluLnZhbHVlID0gdGhpcy52b2x1bWU7XG4gICAgdGhpcy5fcGFubmVyLmNvbm5lY3QodGhpcy5fZ2Fpbk5vZGUpO1xuICAgIC8vdGhpcy5fZ2Fpbk5vZGUuY29ubmVjdCh0aGlzLl9wYW5uZXIpXG4gICAgdGhpcy5fbWlkaUlucHV0cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9taWRpT3V0cHV0cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9zb25nID0gbnVsbDtcbiAgICB0aGlzLl9wYXJ0cyA9IFtdO1xuICAgIHRoaXMuX3BhcnRzQnlJZCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9ldmVudHMgPSBbXTtcbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlO1xuICAgIHRoaXMuX2luc3RydW1lbnQgPSBudWxsO1xuICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcmVjb3JkZWRFdmVudHMgPSBbXTtcbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW107XG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2U7XG4gICAgdGhpcy5tb25pdG9yID0gZmFsc2U7XG4gICAgdGhpcy5fc29uZ0dhaW5Ob2RlID0gbnVsbDtcbiAgICB0aGlzLl9lZmZlY3RzID0gW107XG4gICAgdGhpcy5fbnVtRWZmZWN0cyA9IDA7XG5cbiAgICB2YXIgcGFydHMgPSBzZXR0aW5ncy5wYXJ0cztcbiAgICB2YXIgaW5zdHJ1bWVudCA9IHNldHRpbmdzLmluc3RydW1lbnQ7XG5cbiAgICBpZiAodHlwZW9mIHBhcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5hZGRQYXJ0cy5hcHBseSh0aGlzLCBfdG9Db25zdW1hYmxlQXJyYXkocGFydHMpKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBpbnN0cnVtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhUcmFjaywgW3tcbiAgICBrZXk6ICdzZXRJbnN0cnVtZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0SW5zdHJ1bWVudCgpIHtcbiAgICAgIHZhciBpbnN0cnVtZW50ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgaWYgKGluc3RydW1lbnQgIT09IG51bGxcbiAgICAgIC8vIGNoZWNrIGlmIHRoZSBtYW5kYXRvcnkgZnVuY3Rpb25zIG9mIGFuIGluc3RydW1lbnQgYXJlIHByZXNlbnQgKEludGVyZmFjZSBJbnN0cnVtZW50KVxuICAgICAgICYmIHR5cGVvZiBpbnN0cnVtZW50LmNvbm5lY3QgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGluc3RydW1lbnQuZGlzY29ubmVjdCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBpbnN0cnVtZW50LmFsbE5vdGVzT2ZmID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBpbnN0cnVtZW50LnVuc2NoZWR1bGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVJbnN0cnVtZW50KCk7XG4gICAgICAgIHRoaXMuX2luc3RydW1lbnQgPSBpbnN0cnVtZW50O1xuICAgICAgICB0aGlzLl9pbnN0cnVtZW50LmNvbm5lY3QodGhpcy5fcGFubmVyKTtcbiAgICAgIH0gZWxzZSBpZiAoaW5zdHJ1bWVudCA9PT0gbnVsbCkge1xuICAgICAgICAvLyBpZiB5b3UgcGFzcyBudWxsIGFzIGFyZ3VtZW50IHRoZSBjdXJyZW50IGluc3RydW1lbnQgd2lsbCBiZSByZW1vdmVkLCBzYW1lIGFzIHJlbW92ZUluc3RydW1lbnRcbiAgICAgICAgdGhpcy5yZW1vdmVJbnN0cnVtZW50KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBpbnN0cnVtZW50LCBhbmQgaW5zdHJ1bWVudCBzaG91bGQgaGF2ZSB0aGUgbWV0aG9kcyBcImNvbm5lY3RcIiwgXCJkaXNjb25uZWN0XCIsIFwicHJvY2Vzc01JRElFdmVudFwiLCBcInVuc2NoZWR1bGVcIiBhbmQgXCJhbGxOb3Rlc09mZlwiJyk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlSW5zdHJ1bWVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUluc3RydW1lbnQoKSB7XG4gICAgICBpZiAodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKCk7XG4gICAgICAgIHRoaXMuX2luc3RydW1lbnQuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLl9pbnN0cnVtZW50ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRJbnN0cnVtZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SW5zdHJ1bWVudCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnN0cnVtZW50O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Nvbm5lY3RNSURJT3V0cHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbm5lY3RNSURJT3V0cHV0cygpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBvdXRwdXRzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIG91dHB1dHNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgICAgIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbiAob3V0cHV0KSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3V0cHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIG91dHB1dCA9ICgwLCBfaW5pdF9taWRpLmdldE1JRElPdXRwdXRCeUlkKShvdXRwdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvdXRwdXQgaW5zdGFuY2VvZiBNSURJT3V0cHV0KSB7XG4gICAgICAgICAgX3RoaXMuX21pZGlPdXRwdXRzLnNldChvdXRwdXQuaWQsIG91dHB1dCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpT3V0cHV0cylcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaXNjb25uZWN0TUlESU91dHB1dHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNjb25uZWN0TUlESU91dHB1dHMoKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBvdXRwdXRzID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgb3V0cHV0c1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuXG4gICAgICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gICAgICBpZiAob3V0cHV0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fbWlkaU91dHB1dHMuY2xlYXIoKTtcbiAgICAgIH1cbiAgICAgIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbiAocG9ydCkge1xuICAgICAgICBpZiAocG9ydCBpbnN0YW5jZW9mIE1JRElPdXRwdXQpIHtcbiAgICAgICAgICBwb3J0ID0gcG9ydC5pZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3RoaXMyLl9taWRpT3V0cHV0cy5oYXMocG9ydCkpIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdyZW1vdmluZycsIHRoaXMuX21pZGlPdXRwdXRzLmdldChwb3J0KS5uYW1lKVxuICAgICAgICAgIF90aGlzMi5fbWlkaU91dHB1dHMuZGVsZXRlKHBvcnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vdGhpcy5fbWlkaU91dHB1dHMgPSB0aGlzLl9taWRpT3V0cHV0cy5maWx0ZXIoLi4ub3V0cHV0cylcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaU91dHB1dHMpXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY29ubmVjdE1JRElJbnB1dHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb25uZWN0TUlESUlucHV0cygpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMyA9IGFyZ3VtZW50cy5sZW5ndGgsIGlucHV0cyA9IEFycmF5KF9sZW4zKSwgX2tleTMgPSAwOyBfa2V5MyA8IF9sZW4zOyBfa2V5MysrKSB7XG4gICAgICAgIGlucHV0c1tfa2V5M10gPSBhcmd1bWVudHNbX2tleTNdO1xuICAgICAgfVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBpbnB1dCA9ICgwLCBfaW5pdF9taWRpLmdldE1JRElJbnB1dEJ5SWQpKGlucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBNSURJSW5wdXQpIHtcblxuICAgICAgICAgIF90aGlzMy5fbWlkaUlucHV0cy5zZXQoaW5wdXQuaWQsIGlucHV0KTtcblxuICAgICAgICAgIGlucHV0Lm9ubWlkaW1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKF90aGlzMy5tb25pdG9yID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coLi4uZS5kYXRhKVxuICAgICAgICAgICAgICBfdGhpczMuX3ByZXByb2Nlc3NNSURJRXZlbnQobmV3IChGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5hcHBseShfbWlkaV9ldmVudC5NSURJRXZlbnQsIFtudWxsXS5jb25jYXQoW190aGlzMy5fc29uZy5fdGlja3NdLCBfdG9Db25zdW1hYmxlQXJyYXkoZS5kYXRhKSkpKSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaUlucHV0cylcbiAgICB9XG5cbiAgICAvLyB5b3UgY2FuIHBhc3MgYm90aCBwb3J0IGFuZCBwb3J0IGlkc1xuXG4gIH0sIHtcbiAgICBrZXk6ICdkaXNjb25uZWN0TUlESUlucHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc2Nvbm5lY3RNSURJSW5wdXRzKCkge1xuICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW40ID0gYXJndW1lbnRzLmxlbmd0aCwgaW5wdXRzID0gQXJyYXkoX2xlbjQpLCBfa2V5NCA9IDA7IF9rZXk0IDwgX2xlbjQ7IF9rZXk0KyspIHtcbiAgICAgICAgaW5wdXRzW19rZXk0XSA9IGFyZ3VtZW50c1tfa2V5NF07XG4gICAgICB9XG5cbiAgICAgIGlmIChpbnB1dHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAocG9ydCkge1xuICAgICAgICAgIHBvcnQub25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9taWRpSW5wdXRzLmNsZWFyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgIGlmIChwb3J0IGluc3RhbmNlb2YgTUlESUlucHV0KSB7XG4gICAgICAgICAgcG9ydCA9IHBvcnQuaWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF90aGlzNC5fbWlkaUlucHV0cy5oYXMocG9ydCkpIHtcbiAgICAgICAgICBfdGhpczQuX21pZGlJbnB1dHMuZ2V0KHBvcnQpLm9ubWlkaW1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgIF90aGlzNC5fbWlkaUlucHV0cy5kZWxldGUocG9ydCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy90aGlzLl9taWRpT3V0cHV0cyA9IHRoaXMuX21pZGlPdXRwdXRzLmZpbHRlciguLi5vdXRwdXRzKVxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldE1JRElJbnB1dHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRNSURJSW5wdXRzKCkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fbWlkaUlucHV0cy52YWx1ZXMoKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0TUlESU91dHB1dHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRNSURJT3V0cHV0cygpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRSZWNvcmRFbmFibGVkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UmVjb3JkRW5hYmxlZCh0eXBlKSB7XG4gICAgICAvLyAnbWlkaScsICdhdWRpbycsIGVtcHR5IG9yIGFueXRoaW5nIHdpbGwgZGlzYWJsZSByZWNvcmRpbmdcbiAgICAgIHRoaXMuX3JlY29yZEVuYWJsZWQgPSB0eXBlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19zdGFydFJlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zdGFydFJlY29yZGluZyhyZWNvcmRJZCkge1xuICAgICAgaWYgKHRoaXMuX3JlY29yZEVuYWJsZWQgPT09ICdtaWRpJykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKHJlY29yZElkKVxuICAgICAgICB0aGlzLl9yZWNvcmRJZCA9IHJlY29yZElkO1xuICAgICAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdO1xuICAgICAgICB0aGlzLl9yZWNvcmRQYXJ0ID0gbmV3IF9wYXJ0LlBhcnQodGhpcy5fcmVjb3JkSWQpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19zdG9wUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3N0b3BSZWNvcmRpbmcocmVjb3JkSWQpIHtcbiAgICAgIHZhciBfcmVjb3JkUGFydDtcblxuICAgICAgaWYgKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fcmVjb3JkZWRFdmVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIChfcmVjb3JkUGFydCA9IHRoaXMuX3JlY29yZFBhcnQpLmFkZEV2ZW50cy5hcHBseShfcmVjb3JkUGFydCwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX3JlY29yZGVkRXZlbnRzKSk7XG4gICAgICAvL3RoaXMuX3NvbmcuX25ld0V2ZW50cy5wdXNoKC4uLnRoaXMuX3JlY29yZGVkRXZlbnRzKVxuICAgICAgdGhpcy5hZGRQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1bmRvUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5kb1JlY29yZGluZyhyZWNvcmRJZCkge1xuICAgICAgaWYgKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnJlbW92ZVBhcnRzKHRoaXMuX3JlY29yZFBhcnQpO1xuICAgICAgLy90aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fcmVjb3JkZWRFdmVudHMpXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVkb1JlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlZG9SZWNvcmRpbmcocmVjb3JkSWQpIHtcbiAgICAgIGlmICh0aGlzLl9yZWNvcmRJZCAhPT0gcmVjb3JkSWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5hZGRQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb3B5JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29weSgpIHtcbiAgICAgIHZhciB0ID0gbmV3IFRyYWNrKHRoaXMubmFtZSArICdfY29weScpOyAvLyBpbXBsZW1lbnQgZ2V0TmFtZU9mQ29weSgpIGluIHV0aWwgKHNlZSBoZWFydGJlYXQpXG4gICAgICB2YXIgcGFydHMgPSBbXTtcbiAgICAgIHRoaXMuX3BhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgdmFyIGNvcHkgPSBwYXJ0LmNvcHkoKTtcbiAgICAgICAgY29uc29sZS5sb2coY29weSk7XG4gICAgICAgIHBhcnRzLnB1c2goY29weSk7XG4gICAgICB9KTtcbiAgICAgIHQuYWRkUGFydHMuYXBwbHkodCwgcGFydHMpO1xuICAgICAgdC51cGRhdGUoKTtcbiAgICAgIHJldHVybiB0O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3RyYW5zcG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRyYW5zcG9zZShhbW91bnQpIHtcbiAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZFBhcnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkUGFydHMoKSB7XG4gICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgdmFyIHNvbmcgPSB0aGlzLl9zb25nO1xuXG4gICAgICBmb3IgKHZhciBfbGVuNSA9IGFyZ3VtZW50cy5sZW5ndGgsIHBhcnRzID0gQXJyYXkoX2xlbjUpLCBfa2V5NSA9IDA7IF9rZXk1IDwgX2xlbjU7IF9rZXk1KyspIHtcbiAgICAgICAgcGFydHNbX2tleTVdID0gYXJndW1lbnRzW19rZXk1XTtcbiAgICAgIH1cblxuICAgICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICB2YXIgX2V2ZW50cztcblxuICAgICAgICBwYXJ0Ll90cmFjayA9IF90aGlzNTtcbiAgICAgICAgX3RoaXM1Ll9wYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICBfdGhpczUuX3BhcnRzQnlJZC5zZXQocGFydC5pZCwgcGFydCk7XG5cbiAgICAgICAgdmFyIGV2ZW50cyA9IHBhcnQuX2V2ZW50cztcbiAgICAgICAgKF9ldmVudHMgPSBfdGhpczUuX2V2ZW50cykucHVzaC5hcHBseShfZXZlbnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoZXZlbnRzKSk7XG5cbiAgICAgICAgaWYgKHNvbmcpIHtcbiAgICAgICAgICB2YXIgX3NvbmckX25ld0V2ZW50cztcblxuICAgICAgICAgIHBhcnQuX3NvbmcgPSBzb25nO1xuICAgICAgICAgIHNvbmcuX25ld1BhcnRzLnB1c2gocGFydCk7XG4gICAgICAgICAgKF9zb25nJF9uZXdFdmVudHMgPSBzb25nLl9uZXdFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX25ld0V2ZW50cywgX3RvQ29uc3VtYWJsZUFycmF5KGV2ZW50cykpO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgZXZlbnQuX3RyYWNrID0gX3RoaXM1O1xuICAgICAgICAgIGlmIChzb25nKSB7XG4gICAgICAgICAgICBldmVudC5fc29uZyA9IHNvbmc7XG4gICAgICAgICAgfVxuICAgICAgICAgIF90aGlzNS5fZXZlbnRzQnlJZC5zZXQoZXZlbnQuaWQsIGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVBhcnRzKCkge1xuICAgICAgdmFyIF90aGlzNiA9IHRoaXM7XG5cbiAgICAgIHZhciBzb25nID0gdGhpcy5fc29uZztcblxuICAgICAgZm9yICh2YXIgX2xlbjYgPSBhcmd1bWVudHMubGVuZ3RoLCBwYXJ0cyA9IEFycmF5KF9sZW42KSwgX2tleTYgPSAwOyBfa2V5NiA8IF9sZW42OyBfa2V5NisrKSB7XG4gICAgICAgIHBhcnRzW19rZXk2XSA9IGFyZ3VtZW50c1tfa2V5Nl07XG4gICAgICB9XG5cbiAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgcGFydC5fdHJhY2sgPSBudWxsO1xuICAgICAgICBfdGhpczYuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCwgcGFydCk7XG5cbiAgICAgICAgdmFyIGV2ZW50cyA9IHBhcnQuX2V2ZW50cztcblxuICAgICAgICBpZiAoc29uZykge1xuICAgICAgICAgIHZhciBfc29uZyRfcmVtb3ZlZEV2ZW50cztcblxuICAgICAgICAgIHNvbmcuX3JlbW92ZWRQYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICAgIChfc29uZyRfcmVtb3ZlZEV2ZW50cyA9IHNvbmcuX3JlbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX3JlbW92ZWRFdmVudHMsIF90b0NvbnN1bWFibGVBcnJheShldmVudHMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGw7XG4gICAgICAgICAgaWYgKHNvbmcpIHtcbiAgICAgICAgICAgIGV2ZW50Ll9zb25nID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3RoaXM2Ll9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZCwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0UGFydHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQYXJ0cygpIHtcbiAgICAgIGlmICh0aGlzLl9uZWVkc1VwZGF0ZSkge1xuICAgICAgICB0aGlzLl9wYXJ0cyA9IEFycmF5LmZyb20odGhpcy5fcGFydHNCeUlkLnZhbHVlcygpKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKTtcbiAgICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX3BhcnRzKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndHJhbnNwb3NlUGFydHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0cmFuc3Bvc2VQYXJ0cyhhbW91bnQpIHtcbiAgICAgIGZvciAodmFyIF9sZW43ID0gYXJndW1lbnRzLmxlbmd0aCwgcGFydHMgPSBBcnJheShfbGVuNyA+IDEgPyBfbGVuNyAtIDEgOiAwKSwgX2tleTcgPSAxOyBfa2V5NyA8IF9sZW43OyBfa2V5NysrKSB7XG4gICAgICAgIHBhcnRzW19rZXk3IC0gMV0gPSBhcmd1bWVudHNbX2tleTddO1xuICAgICAgfVxuXG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHBhcnQudHJhbnNwb3NlKGFtb3VudCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlUGFydHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlUGFydHModGlja3MpIHtcbiAgICAgIGZvciAodmFyIF9sZW44ID0gYXJndW1lbnRzLmxlbmd0aCwgcGFydHMgPSBBcnJheShfbGVuOCA+IDEgPyBfbGVuOCAtIDEgOiAwKSwgX2tleTggPSAxOyBfa2V5OCA8IF9sZW44OyBfa2V5OCsrKSB7XG4gICAgICAgIHBhcnRzW19rZXk4IC0gMV0gPSBhcmd1bWVudHNbX2tleThdO1xuICAgICAgfVxuXG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHBhcnQubW92ZSh0aWNrcyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlUGFydHNUbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVQYXJ0c1RvKHRpY2tzKSB7XG4gICAgICBmb3IgKHZhciBfbGVuOSA9IGFyZ3VtZW50cy5sZW5ndGgsIHBhcnRzID0gQXJyYXkoX2xlbjkgPiAxID8gX2xlbjkgLSAxIDogMCksIF9rZXk5ID0gMTsgX2tleTkgPCBfbGVuOTsgX2tleTkrKykge1xuICAgICAgICBwYXJ0c1tfa2V5OSAtIDFdID0gYXJndW1lbnRzW19rZXk5XTtcbiAgICAgIH1cblxuICAgICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBwYXJ0Lm1vdmVUbyh0aWNrcyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLypcbiAgICAgIGFkZEV2ZW50cyguLi5ldmVudHMpe1xuICAgICAgICBsZXQgcCA9IG5ldyBQYXJ0KClcbiAgICAgICAgcC5hZGRFdmVudHMoLi4uZXZlbnRzKVxuICAgICAgICB0aGlzLmFkZFBhcnRzKHApXG4gICAgICB9XG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXZlbnRzKCkge1xuICAgICAgdmFyIF90aGlzNyA9IHRoaXM7XG5cbiAgICAgIHZhciBwYXJ0cyA9IG5ldyBTZXQoKTtcblxuICAgICAgZm9yICh2YXIgX2xlbjEwID0gYXJndW1lbnRzLmxlbmd0aCwgZXZlbnRzID0gQXJyYXkoX2xlbjEwKSwgX2tleTEwID0gMDsgX2tleTEwIDwgX2xlbjEwOyBfa2V5MTArKykge1xuICAgICAgICBldmVudHNbX2tleTEwXSA9IGFyZ3VtZW50c1tfa2V5MTBdO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgcGFydHMuc2V0KGV2ZW50Ll9wYXJ0KTtcbiAgICAgICAgZXZlbnQuX3BhcnQgPSBudWxsO1xuICAgICAgICBldmVudC5fdHJhY2sgPSBudWxsO1xuICAgICAgICBldmVudC5fc29uZyA9IG51bGw7XG4gICAgICAgIF90aGlzNy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpO1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy5fc29uZykge1xuICAgICAgICB2YXIgX3NvbmckX3JlbW92ZWRFdmVudHMyLCBfc29uZyRfY2hhbmdlZFBhcnRzO1xuXG4gICAgICAgIChfc29uZyRfcmVtb3ZlZEV2ZW50czIgPSB0aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9yZW1vdmVkRXZlbnRzMiwgZXZlbnRzKTtcbiAgICAgICAgKF9zb25nJF9jaGFuZ2VkUGFydHMgPSB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMpLnB1c2guYXBwbHkoX3NvbmckX2NoYW5nZWRQYXJ0cywgX3RvQ29uc3VtYWJsZUFycmF5KEFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSkpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZUV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVFdmVudHModGlja3MpIHtcbiAgICAgIHZhciBwYXJ0cyA9IG5ldyBTZXQoKTtcblxuICAgICAgZm9yICh2YXIgX2xlbjExID0gYXJndW1lbnRzLmxlbmd0aCwgZXZlbnRzID0gQXJyYXkoX2xlbjExID4gMSA/IF9sZW4xMSAtIDEgOiAwKSwgX2tleTExID0gMTsgX2tleTExIDwgX2xlbjExOyBfa2V5MTErKykge1xuICAgICAgICBldmVudHNbX2tleTExIC0gMV0gPSBhcmd1bWVudHNbX2tleTExXTtcbiAgICAgIH1cblxuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50Lm1vdmUodGlja3MpO1xuICAgICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydCk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHMsIF9zb25nJF9jaGFuZ2VkUGFydHMyO1xuXG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHMgPSB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfbW92ZWRFdmVudHMsIGV2ZW50cyk7XG4gICAgICAgIChfc29uZyRfY2hhbmdlZFBhcnRzMiA9IHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cykucHVzaC5hcHBseShfc29uZyRfY2hhbmdlZFBhcnRzMiwgX3RvQ29uc3VtYWJsZUFycmF5KEFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSkpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVFdmVudHNUbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVFdmVudHNUbyh0aWNrcykge1xuICAgICAgdmFyIHBhcnRzID0gbmV3IFNldCgpO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMTIgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuMTIgPiAxID8gX2xlbjEyIC0gMSA6IDApLCBfa2V5MTIgPSAxOyBfa2V5MTIgPCBfbGVuMTI7IF9rZXkxMisrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5MTIgLSAxXSA9IGFyZ3VtZW50c1tfa2V5MTJdO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKTtcbiAgICAgICAgcGFydHMuc2V0KGV2ZW50LnBhcnQpO1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy5fc29uZykge1xuICAgICAgICB2YXIgX3NvbmckX21vdmVkRXZlbnRzMiwgX3NvbmckX2NoYW5nZWRQYXJ0czM7XG5cbiAgICAgICAgKF9zb25nJF9tb3ZlZEV2ZW50czIgPSB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfbW92ZWRFdmVudHMyLCBldmVudHMpO1xuICAgICAgICAoX3NvbmckX2NoYW5nZWRQYXJ0czMgPSB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMpLnB1c2guYXBwbHkoX3NvbmckX2NoYW5nZWRQYXJ0czMsIF90b0NvbnN1bWFibGVBcnJheShBcnJheS5mcm9tKHBhcnRzLmVudHJpZXMoKSkpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFdmVudHMoKSB7XG4gICAgICB2YXIgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcbiAgICAgIC8vIGNhbiBiZSB1c2UgYXMgZmluZEV2ZW50c1xuICAgICAgaWYgKHRoaXMuX25lZWRzVXBkYXRlKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTsgLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtdXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbXV0ZSgpIHtcbiAgICAgIHZhciBmbGFnID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgaWYgKGZsYWcpIHtcbiAgICAgICAgdGhpcy5fbXV0ZWQgPSBmbGFnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbXV0ZWQgPSAhdGhpcy5fbXV0ZWQ7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgLy8geW91IHNob3VsZCBvbmx5IHVzZSB0aGlzIGluIGh1Z2Ugc29uZ3MgKD4xMDAgdHJhY2tzKVxuICAgICAgaWYgKHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKTtcbiAgICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgKDAsIF91dGlsLnNvcnRFdmVudHMpKHRoaXMuX2V2ZW50cyk7XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19jaGVja0VmZmVjdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9jaGVja0VmZmVjdChlZmZlY3QpIHtcbiAgICAgIGlmIChlZmZlY3QuaW5wdXQgaW5zdGFuY2VvZiBBdWRpb05vZGUgPT09IGZhbHNlIHx8IGVmZmVjdC5vdXRwdXQgaW5zdGFuY2VvZiBBdWRpb05vZGUgPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBIGNoYW5uZWwgZnggc2hvdWxkIGhhdmUgYW4gaW5wdXQgYW5kIGFuIG91dHB1dCBpbXBsZW1lbnRpbmcgdGhlIGludGVyZmFjZSBBdWRpb05vZGUnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gcm91dGluZzogYXVkaW9zb3VyY2UgLT4gcGFubmluZyAtPiB0cmFjayBvdXRwdXQgLT4gWy4uLmVmZmVjdF0gLT4gc29uZyBpbnB1dFxuXG4gIH0sIHtcbiAgICBrZXk6ICdpbnNlcnRFZmZlY3QnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbnNlcnRFZmZlY3QoZWZmZWN0KSB7XG5cbiAgICAgIGlmICh0aGlzLl9jaGVja0VmZmVjdChlZmZlY3QpID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBwcmV2RWZmZWN0ID0gdm9pZCAwO1xuXG4gICAgICBpZiAodGhpcy5fbnVtRWZmZWN0cyA9PT0gMCkge1xuICAgICAgICB0aGlzLl9nYWluTm9kZS5kaXNjb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICAgIHRoaXMuX2dhaW5Ob2RlLmNvbm5lY3QoZWZmZWN0LmlucHV0KTtcbiAgICAgICAgZWZmZWN0Lm91dHB1dC5jb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcmV2RWZmZWN0ID0gdGhpcy5fZWZmZWN0c1t0aGlzLl9udW1FZmZlY3RzIC0gMV07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcHJldkVmZmVjdC5vdXRwdXQuZGlzY29ubmVjdCh0aGlzLl9zb25nR2Fpbk5vZGUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy9DaHJvbWUgdGhyb3dzIGFuIGVycm9yIGhlcmUgd2hpY2ggaXMgd3JvbmdcbiAgICAgICAgfVxuICAgICAgICBwcmV2RWZmZWN0Lm91dHB1dC5jb25uZWN0KGVmZmVjdC5pbnB1dCk7XG4gICAgICAgIGVmZmVjdC5vdXRwdXQuY29ubmVjdCh0aGlzLl9zb25nR2Fpbk5vZGUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lZmZlY3RzLnB1c2goZWZmZWN0KTtcbiAgICAgIHRoaXMuX251bUVmZmVjdHMrKztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdpbnNlcnRFZmZlY3RBdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluc2VydEVmZmVjdEF0KGVmZmVjdCwgaW5kZXgpIHtcbiAgICAgIGlmICh0aGlzLl9jaGVja0VmZmVjdChlZmZlY3QpID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgcHJldkVmZmVjdCA9IHRoaXMuX2VmZmVjdHNbaW5kZXggLSAxXTtcbiAgICAgIHZhciBuZXh0RWZmZWN0ID0gdm9pZCAwO1xuXG4gICAgICBpZiAoaW5kZXggPT09IHRoaXMuX251bUVmZmVjdHMpIHtcbiAgICAgICAgcHJldkVmZmVjdC5vdXRwdXQuZGlzY29ubmVjdCh0aGlzLl9zb25nR2Fpbk5vZGUpO1xuICAgICAgICBwcmV2RWZmZWN0Lm91dHB1dC5jb25uZWN0KGVmZmVjdC5pbnB1dCk7XG4gICAgICAgIGVmZmVjdC5pbnB1dC5jb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0RWZmZWN0ID0gdGhpcy5fZWZmZWN0c1tpbmRleF07XG4gICAgICAgIHByZXZFZmZlY3Qub3V0cHV0LmRpc2Nvbm5lY3QobmV4dEVmZmVjdC5pbnB1dCk7XG4gICAgICAgIHByZXZFZmZlY3Qub3V0cHV0LmNvbm5lY3QoZWZmZWN0LmlucHV0KTtcbiAgICAgICAgZWZmZWN0Lm91dHB1dC5jb25uZWN0KG5leHRFZmZlY3QuaW5wdXQpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZWZmZWN0cy5zcGxpY2UoaW5kZXgsIDAsIGVmZmVjdCk7XG4gICAgICB0aGlzLl9udW1FZmZlY3RzKys7XG4gICAgfVxuXG4gICAgLy9yZW1vdmVFZmZlY3QoZWZmZWN0OiBFZmZlY3Qpe1xuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRWZmZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRWZmZWN0KGVmZmVjdCkge1xuICAgICAgaWYgKHRoaXMuX2NoZWNrRWZmZWN0KGVmZmVjdCkgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGkgPSB2b2lkIDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5fbnVtRWZmZWN0czsgaSsrKSB7XG4gICAgICAgIHZhciBmeCA9IHRoaXMuX2VmZmVjdHNbaV07XG4gICAgICAgIGlmIChlZmZlY3QgPT09IGZ4KSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMucmVtb3ZlRWZmZWN0QXQoaSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRWZmZWN0QXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFZmZlY3RBdChpbmRleCkge1xuICAgICAgaWYgKGlzTmFOKGluZGV4KSB8fCB0aGlzLl9udW1FZmZlY3RzID09PSAwIHx8IGluZGV4ID49IHRoaXMuX251bUVmZmVjdHMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGVmZmVjdCA9IHRoaXMuX2VmZmVjdHNbaW5kZXhdO1xuICAgICAgdmFyIG5leHRFZmZlY3QgPSB2b2lkIDA7XG4gICAgICB2YXIgcHJldkVmZmVjdCA9IHZvaWQgMDtcblxuICAgICAgLy9jb25zb2xlLmxvZyhpbmRleCwgdGhpcy5fZWZmZWN0cylcblxuICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgIC8vIHdlIHJlbW92ZSB0aGUgZmlyc3QgZWZmZWN0LCBzbyBkaXNjb25uZWN0IGZyb20gb3V0cHV0IG9mIHRyYWNrXG4gICAgICAgIHRoaXMuX2dhaW5Ob2RlLmRpc2Nvbm5lY3QoZWZmZWN0LmlucHV0KTtcblxuICAgICAgICBpZiAodGhpcy5fbnVtRWZmZWN0cyA9PT0gMSkge1xuICAgICAgICAgIC8vIG5vIGVmZmVjdHMgYW55bW9yZSwgc28gY29ubmVjdCBvdXRwdXQgb2YgdHJhY2sgdG8gaW5wdXQgb2YgdGhlIHNvbmdcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZWZmZWN0Lm91dHB1dC5kaXNjb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy9DaHJvbWUgdGhyb3dzIGFuIGVycm9yIGhlcmUgd2hpY2ggaXMgd3JvbmdcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fZ2Fpbk5vZGUuY29ubmVjdCh0aGlzLl9zb25nR2Fpbk5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGRpc2Nvbm5lY3QgdGhlIHJlbW92ZWQgZWZmZWN0IGZyb20gdGhlIG5leHQgZWZmZWN0IGluIHRoZSBjaGFpbiwgdGhpcyBpcyBub3cgdGhlIGZpcnN0IGVmZmVjdCBpbiB0aGUgY2hhaW4uLi5cbiAgICAgICAgICBuZXh0RWZmZWN0ID0gdGhpcy5fZWZmZWN0c1tpbmRleCArIDFdO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBlZmZlY3Qub3V0cHV0LmRpc2Nvbm5lY3QobmV4dEVmZmVjdC5pbnB1dCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAvL0Nocm9tZSB0aHJvd3MgYW4gZXJyb3IgaGVyZSB3aGljaCBpcyB3cm9uZ1xuXG4gICAgICAgICAgLy8gLi4uIHNvIGNvbm5lY3QgdGhlIG91dHB1dCBvZiB0aGUgdHJhY2sgdG8gdGhlIGlucHV0IG9mIHRoaXMgZWZmZWN0XG4gICAgICAgICAgdGhpcy5fZ2Fpbk5vZGUuY29ubmVjdChuZXh0RWZmZWN0LmlucHV0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBwcmV2RWZmZWN0ID0gdGhpcy5fZWZmZWN0c1tpbmRleCAtIDFdO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHByZXZFZmZlY3QpXG4gICAgICAgIC8vIGRpc2Nvbm5lY3QgdGhlIHJlbW92ZWQgZWZmZWN0IGZyb20gdGhlIHByZXZpb3VzIGVmZmVjdCBpbiB0aGUgY2hhaW5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwcmV2RWZmZWN0Lm91dHB1dC5kaXNjb25uZWN0KGVmZmVjdC5pbnB1dCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvL0Nocm9tZSB0aHJvd3MgYW4gZXJyb3IgaGVyZSB3aGljaCBpcyB3cm9uZ1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSB0aGlzLl9udW1FZmZlY3RzIC0gMSkge1xuICAgICAgICAgIC8vIHdlIHJlbW92ZSB0aGUgbGFzdCBlZmZlY3QgaW4gdGhlIGNoYWluLCBzbyBkaXNjb25uZWN0IGZyb20gdGhlIGlucHV0IG9mIHRoZSBzb25nXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGVmZmVjdC5vdXRwdXQuZGlzY29ubmVjdCh0aGlzLl9zb25nR2Fpbk5vZGUpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgLy9DaHJvbWUgdGhyb3dzIGFuIGVycm9yIGhlcmUgd2hpY2ggaXMgd3JvbmdcblxuICAgICAgICAgIC8vIHRoZSBwcmV2aW91cyBlZmZlY3QgaXMgbm93IHRoZSBsYXN0IGVmZmVjdCB0byBjb25uZWN0IGl0IHRvIHRoZSBpbnB1dCBvZiB0aGUgc29uZ1xuICAgICAgICAgIHByZXZFZmZlY3Qub3V0cHV0LmNvbm5lY3QodGhpcy5fc29uZ0dhaW5Ob2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBkaXNjb25uZWN0IHRoZSBlZmZlY3QgZnJvbSB0aGUgbmV4dCBlZmZlY3QgaW4gdGhlIGNoYWluXG4gICAgICAgICAgbmV4dEVmZmVjdCA9IHRoaXMuX2VmZmVjdHNbaW5kZXhdO1xuICAgICAgICAgIGVmZmVjdC5vdXRwdXQuZGlzY29ubmVjdChuZXh0RWZmZWN0LmlucHV0KTtcbiAgICAgICAgICAvLyBjb25uZWN0IHRoZSBwcmV2aW91cyBlZmZlY3QgdG8gdGhlIG5leHQgZWZmZWN0XG4gICAgICAgICAgcHJldkVmZmVjdC5vdXRwdXQuY29ubmVjdChuZXh0RWZmZWN0LmlucHV0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9lZmZlY3RzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl9udW1FZmZlY3RzLS07XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0RWZmZWN0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEVmZmVjdHMoKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9lZmZlY3RzKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0RWZmZWN0QXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFZmZlY3RBdChpbmRleCkge1xuICAgICAgaWYgKGlzTmFOKGluZGV4KSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9lZmZlY3RzW2luZGV4XTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRPdXRwdXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRPdXRwdXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2Fpbk5vZGU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0SW5wdXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnB1dCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zb25nR2Fpbk5vZGU7XG4gICAgfVxuXG4gICAgLy8gbWV0aG9kIGlzIGNhbGxlZCB3aGVuIGEgTUlESSBldmVudHMgaXMgc2VuZCBieSBhbiBleHRlcm5hbCBvciBvbi1zY3JlZW4ga2V5Ym9hcmRcblxuICB9LCB7XG4gICAga2V5OiAnX3ByZXByb2Nlc3NNSURJRXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfcHJlcHJvY2Vzc01JRElFdmVudChtaWRpRXZlbnQpIHtcbiAgICAgIHZhciB0aW1lID0gX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7XG4gICAgICBtaWRpRXZlbnQudGltZSA9IHRpbWU7XG4gICAgICBtaWRpRXZlbnQudGltZTIgPSAwOyAvL3BlcmZvcm1hbmNlLm5vdygpIC0+IHBhc3NpbmcgMCBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzIHBlcmZvcm1hbmNlLm5vdygpIHNvIHdlIGNob29zZSB0aGUgZm9ybWVyXG4gICAgICBtaWRpRXZlbnQucmVjb3JkTWlsbGlzID0gdGltZTtcbiAgICAgIHZhciBub3RlID0gdm9pZCAwO1xuXG4gICAgICBpZiAobWlkaUV2ZW50LnR5cGUgPT09IF9xYW1iaS5NSURJRXZlbnRUeXBlcy5OT1RFX09OKSB7XG4gICAgICAgIG5vdGUgPSBuZXcgX21pZGlfbm90ZS5NSURJTm90ZShtaWRpRXZlbnQpO1xuICAgICAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLnNldChtaWRpRXZlbnQuZGF0YTEsIG5vdGUpO1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgIHR5cGU6ICdub3RlT24nLFxuICAgICAgICAgIGRhdGE6IG1pZGlFdmVudFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAobWlkaUV2ZW50LnR5cGUgPT09IF9xYW1iaS5NSURJRXZlbnRUeXBlcy5OT1RFX09GRikge1xuICAgICAgICBub3RlID0gdGhpcy5fdG1wUmVjb3JkZWROb3Rlcy5nZXQobWlkaUV2ZW50LmRhdGExKTtcbiAgICAgICAgaWYgKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KTtcbiAgICAgICAgdGhpcy5fdG1wUmVjb3JkZWROb3Rlcy5kZWxldGUobWlkaUV2ZW50LmRhdGExKTtcbiAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICB0eXBlOiAnbm90ZU9mZicsXG4gICAgICAgICAgZGF0YTogbWlkaUV2ZW50XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknICYmIHRoaXMuX3NvbmcucmVjb3JkaW5nID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuX3JlY29yZGVkRXZlbnRzLnB1c2gobWlkaUV2ZW50KTtcbiAgICAgIH1cbiAgICAgIHRoaXMucHJvY2Vzc01JRElFdmVudChtaWRpRXZlbnQpO1xuICAgIH1cblxuICAgIC8vIG1ldGhvZCBpcyBjYWxsZWQgYnkgc2NoZWR1bGVyIGR1cmluZyBwbGF5YmFja1xuXG4gIH0sIHtcbiAgICBrZXk6ICdwcm9jZXNzTUlESUV2ZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcHJvY2Vzc01JRElFdmVudChldmVudCkge1xuXG4gICAgICBpZiAodHlwZW9mIGV2ZW50LnRpbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuX3ByZXByb2Nlc3NNSURJRXZlbnQoZXZlbnQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIHNlbmQgdG8gamF2YXNjcmlwdCBpbnN0cnVtZW50XG4gICAgICBpZiAodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMubmFtZSwgZXZlbnQpXG4gICAgICAgIHRoaXMuX2luc3RydW1lbnQucHJvY2Vzc01JRElFdmVudChldmVudCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNlbmQgdG8gZXh0ZXJuYWwgaGFyZHdhcmUgb3Igc29mdHdhcmUgaW5zdHJ1bWVudFxuICAgICAgdGhpcy5fc2VuZFRvRXh0ZXJuYWxNSURJT3V0cHV0cyhldmVudCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX3NlbmRUb0V4dGVybmFsTUlESU91dHB1dHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfc2VuZFRvRXh0ZXJuYWxNSURJT3V0cHV0cyhldmVudCkge1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC50aW1lLCBldmVudC5taWxsaXMpXG4gICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gdGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgICAgdmFyIHBvcnQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgIGlmIChwb3J0KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuZGF0YTIgIT09IC0xKSB7XG4gICAgICAgICAgICAgIHBvcnQuc2VuZChbZXZlbnQudHlwZSArIHRoaXMuY2hhbm5lbCwgZXZlbnQuZGF0YTEsIGV2ZW50LmRhdGEyXSwgZXZlbnQudGltZTIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMV0sIGV2ZW50LnRpbWUyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmKGV2ZW50LnR5cGUgPT09IDEyOCB8fCBldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgICAgICAgIC8vICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCBldmVudC50aW1lICsgbGF0ZW5jeSlcbiAgICAgICAgICAgIC8vIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDE5MiB8fCBldmVudC50eXBlID09PSAyMjQpe1xuICAgICAgICAgICAgLy8gICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUsIGV2ZW50LmRhdGExXSwgZXZlbnQudGltZSArIGxhdGVuY3kpXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1bnNjaGVkdWxlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5zY2hlZHVsZShtaWRpRXZlbnQpIHtcblxuICAgICAgaWYgKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudC51bnNjaGVkdWxlKG1pZGlFdmVudCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9taWRpT3V0cHV0cy5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG1pZGlFdmVudC50eXBlID09PSAxNDQpIHtcbiAgICAgICAgdmFyIG1pZGlOb3RlID0gbWlkaUV2ZW50Lm1pZGlOb3RlO1xuICAgICAgICB2YXIgbm90ZU9mZiA9IG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQoMCwgMTI4LCBtaWRpRXZlbnQuZGF0YTEsIDApO1xuICAgICAgICBub3RlT2ZmLm1pZGlOb3RlSWQgPSBtaWRpTm90ZS5pZDtcbiAgICAgICAgbm90ZU9mZi50aW1lID0gX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZTtcbiAgICAgICAgdGhpcy5fc2VuZFRvRXh0ZXJuYWxNSURJT3V0cHV0cyhub3RlT2ZmLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhbGxOb3Rlc09mZicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFsbE5vdGVzT2ZmKCkge1xuICAgICAgaWYgKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudC5hbGxOb3Rlc09mZigpO1xuICAgICAgfVxuXG4gICAgICAvLyBsZXQgdGltZVN0YW1wID0gKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwKSArIHRoaXMubGF0ZW5jeVxuICAgICAgLy8gZm9yKGxldCBvdXRwdXQgb2YgdGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpe1xuICAgICAgLy8gICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICAgIC8vICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXApIC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgICAgLy8gfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFBhbm5pbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQYW5uaW5nKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPCAtMSB8fCB2YWx1ZSA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1RyYWNrLnNldFBhbm5pbmcoKSBhY2NlcHRzIGEgdmFsdWUgYmV0d2VlbiAtMSAoZnVsbCBsZWZ0KSBhbmQgMSAoZnVsbCByaWdodCksIHlvdSBlbnRlcmVkOicsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHggPSB2YWx1ZTtcbiAgICAgIHZhciB5ID0gMDtcbiAgICAgIHZhciB6ID0gMSAtIE1hdGguYWJzKHgpO1xuXG4gICAgICB4ID0geCA9PT0gMCA/IHplcm9WYWx1ZSA6IHg7XG4gICAgICB5ID0geSA9PT0gMCA/IHplcm9WYWx1ZSA6IHk7XG4gICAgICB6ID0geiA9PT0gMCA/IHplcm9WYWx1ZSA6IHo7XG5cbiAgICAgIHRoaXMuX3Bhbm5lci5zZXRQb3NpdGlvbih4LCB5LCB6KTtcbiAgICAgIHRoaXMuX3Bhbm5pbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldFBhbm5pbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQYW5uaW5nKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Bhbm5pbmdWYWx1ZTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gVHJhY2s7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuZXhwb3J0cy5nZXROaWNlVGltZSA9IGdldE5pY2VUaW1lO1xuZXhwb3J0cy5iYXNlNjRUb0JpbmFyeSA9IGJhc2U2NFRvQmluYXJ5O1xuZXhwb3J0cy50eXBlU3RyaW5nID0gdHlwZVN0cmluZztcbmV4cG9ydHMuc29ydEV2ZW50cyA9IHNvcnRFdmVudHM7XG5leHBvcnRzLmNoZWNrSWZCYXNlNjQgPSBjaGVja0lmQmFzZTY0O1xuZXhwb3J0cy5nZXRFcXVhbFBvd2VyQ3VydmUgPSBnZXRFcXVhbFBvd2VyQ3VydmU7XG5leHBvcnRzLmNoZWNrTUlESU51bWJlciA9IGNoZWNrTUlESU51bWJlcjtcblxudmFyIF9pc29tb3JwaGljRmV0Y2ggPSByZXF1aXJlKCdpc29tb3JwaGljLWZldGNoJyk7XG5cbnZhciBfaXNvbW9ycGhpY0ZldGNoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzb21vcnBoaWNGZXRjaCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBtUEkgPSBNYXRoLlBJLFxuICAgIG1Qb3cgPSBNYXRoLnBvdyxcbiAgICBtUm91bmQgPSBNYXRoLnJvdW5kLFxuICAgIG1GbG9vciA9IE1hdGguZmxvb3IsXG4gICAgbVJhbmRvbSA9IE1hdGgucmFuZG9tO1xuXG5mdW5jdGlvbiBnZXROaWNlVGltZShtaWxsaXMpIHtcbiAgdmFyIGggPSB2b2lkIDAsXG4gICAgICBtID0gdm9pZCAwLFxuICAgICAgcyA9IHZvaWQgMCxcbiAgICAgIG1zID0gdm9pZCAwLFxuICAgICAgc2Vjb25kcyA9IHZvaWQgMCxcbiAgICAgIHRpbWVBc1N0cmluZyA9ICcnO1xuXG4gIHNlY29uZHMgPSBtaWxsaXMgLyAxMDAwOyAvLyDihpIgbWlsbGlzIHRvIHNlY29uZHNcbiAgaCA9IG1GbG9vcihzZWNvbmRzIC8gKDYwICogNjApKTtcbiAgbSA9IG1GbG9vcihzZWNvbmRzICUgKDYwICogNjApIC8gNjApO1xuICBzID0gbUZsb29yKHNlY29uZHMgJSA2MCk7XG4gIG1zID0gbVJvdW5kKChzZWNvbmRzIC0gaCAqIDM2MDAgLSBtICogNjAgLSBzKSAqIDEwMDApO1xuXG4gIHRpbWVBc1N0cmluZyArPSBoICsgJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbSA8IDEwID8gJzAnICsgbSA6IG07XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBzIDwgMTAgPyAnMCcgKyBzIDogcztcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG1zID09PSAwID8gJzAwMCcgOiBtcyA8IDEwID8gJzAwJyArIG1zIDogbXMgPCAxMDAgPyAnMCcgKyBtcyA6IG1zO1xuXG4gIC8vY29uc29sZS5sb2coaCwgbSwgcywgbXMpO1xuICByZXR1cm4ge1xuICAgIGhvdXI6IGgsXG4gICAgbWludXRlOiBtLFxuICAgIHNlY29uZDogcyxcbiAgICBtaWxsaXNlY29uZDogbXMsXG4gICAgdGltZUFzU3RyaW5nOiB0aW1lQXNTdHJpbmcsXG4gICAgdGltZUFzQXJyYXk6IFtoLCBtLCBzLCBtc11cbiAgfTtcbn1cblxuLy8gYWRhcHRlZCB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9kYW5ndWVyL2Jsb2ctZXhhbXBsZXMvYmxvYi9tYXN0ZXIvanMvYmFzZTY0LWJpbmFyeS5qc1xuZnVuY3Rpb24gYmFzZTY0VG9CaW5hcnkoaW5wdXQpIHtcbiAgdmFyIGtleVN0ciA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPScsXG4gICAgICBieXRlcyA9IHZvaWQgMCxcbiAgICAgIHVhcnJheSA9IHZvaWQgMCxcbiAgICAgIGJ1ZmZlciA9IHZvaWQgMCxcbiAgICAgIGxrZXkxID0gdm9pZCAwLFxuICAgICAgbGtleTIgPSB2b2lkIDAsXG4gICAgICBjaHIxID0gdm9pZCAwLFxuICAgICAgY2hyMiA9IHZvaWQgMCxcbiAgICAgIGNocjMgPSB2b2lkIDAsXG4gICAgICBlbmMxID0gdm9pZCAwLFxuICAgICAgZW5jMiA9IHZvaWQgMCxcbiAgICAgIGVuYzMgPSB2b2lkIDAsXG4gICAgICBlbmM0ID0gdm9pZCAwLFxuICAgICAgaSA9IHZvaWQgMCxcbiAgICAgIGogPSAwO1xuXG4gIGJ5dGVzID0gTWF0aC5jZWlsKDMgKiBpbnB1dC5sZW5ndGggLyA0LjApO1xuICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXMpO1xuICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gIGxrZXkxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aCAtIDEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBpZiAobGtleTEgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuICBpZiAobGtleTIgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuXG4gIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csICcnKTtcblxuICBmb3IgKGkgPSAwOyBpIDwgYnl0ZXM7IGkgKz0gMykge1xuICAgIC8vZ2V0IHRoZSAzIG9jdGVjdHMgaW4gNCBhc2NpaSBjaGFyc1xuICAgIGVuYzEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMzID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzQgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cbiAgICBjaHIxID0gZW5jMSA8PCAyIHwgZW5jMiA+PiA0O1xuICAgIGNocjIgPSAoZW5jMiAmIDE1KSA8PCA0IHwgZW5jMyA+PiAyO1xuICAgIGNocjMgPSAoZW5jMyAmIDMpIDw8IDYgfCBlbmM0O1xuXG4gICAgdWFycmF5W2ldID0gY2hyMTtcbiAgICBpZiAoZW5jMyAhPSA2NCkgdWFycmF5W2kgKyAxXSA9IGNocjI7XG4gICAgaWYgKGVuYzQgIT0gNjQpIHVhcnJheVtpICsgMl0gPSBjaHIzO1xuICB9XG4gIC8vY29uc29sZS5sb2coYnVmZmVyKTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gdHlwZVN0cmluZyhvKSB7XG4gIGlmICgodHlwZW9mIG8gPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKG8pKSAhPSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB0eXBlb2YgbyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2Yobyk7XG4gIH1cblxuICBpZiAobyA9PT0gbnVsbCkge1xuICAgIHJldHVybiAnbnVsbCc7XG4gIH1cblxuICAvL29iamVjdCwgYXJyYXksIGZ1bmN0aW9uLCBkYXRlLCByZWdleHAsIHN0cmluZywgbnVtYmVyLCBib29sZWFuLCBlcnJvclxuICB2YXIgaW50ZXJuYWxDbGFzcyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5tYXRjaCgvXFxbb2JqZWN0XFxzKFxcdyspXFxdLylbMV07XG4gIHJldHVybiBpbnRlcm5hbENsYXNzLnRvTG93ZXJDYXNlKCk7XG59XG5cbmZ1bmN0aW9uIHNvcnRFdmVudHMoZXZlbnRzKSB7XG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKGEudGlja3MgPT09IGIudGlja3MpIHtcbiAgICAgIHZhciByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgaWYgKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgIHIgPSAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3M7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjaGVja0lmQmFzZTY0KGRhdGEpIHtcbiAgdmFyIHBhc3NlZCA9IHRydWU7XG4gIHRyeSB7XG4gICAgYXRvYihkYXRhKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHBhc3NlZCA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBwYXNzZWQ7XG59XG5cbmZ1bmN0aW9uIGdldEVxdWFsUG93ZXJDdXJ2ZShudW1TdGVwcywgdHlwZSwgbWF4VmFsdWUpIHtcbiAgdmFyIGkgPSB2b2lkIDAsXG4gICAgICB2YWx1ZSA9IHZvaWQgMCxcbiAgICAgIHBlcmNlbnQgPSB2b2lkIDAsXG4gICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG51bVN0ZXBzKTtcblxuICBmb3IgKGkgPSAwOyBpIDwgbnVtU3RlcHM7IGkrKykge1xuICAgIHBlcmNlbnQgPSBpIC8gbnVtU3RlcHM7XG4gICAgaWYgKHR5cGUgPT09ICdmYWRlSW4nKSB7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKCgxLjAgLSBwZXJjZW50KSAqIDAuNSAqIG1QSSkgKiBtYXhWYWx1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdmYWRlT3V0Jykge1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcyhwZXJjZW50ICogMC41ICogTWF0aC5QSSkgKiBtYXhWYWx1ZTtcbiAgICB9XG4gICAgdmFsdWVzW2ldID0gdmFsdWU7XG4gICAgaWYgKGkgPT09IG51bVN0ZXBzIC0gMSkge1xuICAgICAgdmFsdWVzW2ldID0gdHlwZSA9PT0gJ2ZhZGVJbicgPyAxIDogMDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuZnVuY3Rpb24gY2hlY2tNSURJTnVtYmVyKHZhbHVlKSB7XG4gIC8vY29uc29sZS5sb2codmFsdWUpO1xuICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsdWUgPCAwIHx8IHZhbHVlID4gMTI3KSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEyNycpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8qXG4vL29sZCBzY2hvb2wgYWpheFxuXG5leHBvcnQgZnVuY3Rpb24gYWpheChjb25maWcpe1xuICBsZXRcbiAgICByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgbWV0aG9kID0gdHlwZW9mIGNvbmZpZy5tZXRob2QgPT09ICd1bmRlZmluZWQnID8gJ0dFVCcgOiBjb25maWcubWV0aG9kLFxuICAgIGZpbGVTaXplO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICByZWplY3QgPSByZWplY3QgfHwgZnVuY3Rpb24oKXt9O1xuICAgIHJlc29sdmUgPSByZXNvbHZlIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApe1xuICAgICAgICByZWplY3QocmVxdWVzdC5zdGF0dXMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgIGZpbGVTaXplID0gcmVxdWVzdC5yZXNwb25zZS5sZW5ndGg7XG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSwgZmlsZVNpemUpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICBjb25maWcub25FcnJvcihlKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgY29uZmlnLnVybCwgdHJ1ZSk7XG5cbiAgICBpZihjb25maWcub3ZlcnJpZGVNaW1lVHlwZSl7XG4gICAgICByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUpe1xuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKG1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcuZGF0YSl7XG4gICAgICByZXF1ZXN0LnNlbmQoY29uZmlnLmRhdGEpO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cbiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5jcmVhdGVKYXp6SW5zdGFuY2UgPSBjcmVhdGVKYXp6SW5zdGFuY2U7XG5leHBvcnRzLmdldEphenpJbnN0YW5jZSA9IGdldEphenpJbnN0YW5jZTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBqYXp6UGx1Z2luSW5pdFRpbWUgPSAxMDA7IC8vIG1pbGxpc2Vjb25kc1xuXG4vKlxuICBDcmVhdGVzIGluc3RhbmNlcyBvZiB0aGUgSmF6eiBwbHVnaW4gaWYgbmVjZXNzYXJ5LiBJbml0aWFsbHkgdGhlIE1JRElBY2Nlc3MgY3JlYXRlcyBvbmUgbWFpbiBKYXp6IGluc3RhbmNlIHRoYXQgaXMgdXNlZFxuICB0byBxdWVyeSBhbGwgaW5pdGlhbGx5IGNvbm5lY3RlZCBkZXZpY2VzLCBhbmQgdG8gdHJhY2sgdGhlIGRldmljZXMgdGhhdCBhcmUgYmVpbmcgY29ubmVjdGVkIG9yIGRpc2Nvbm5lY3RlZCBhdCBydW50aW1lLlxuXG4gIEZvciBldmVyeSBNSURJSW5wdXQgYW5kIE1JRElPdXRwdXQgdGhhdCBpcyBjcmVhdGVkLCBNSURJQWNjZXNzIHF1ZXJpZXMgdGhlIGdldEphenpJbnN0YW5jZSgpIG1ldGhvZCBmb3IgYSBKYXp6IGluc3RhbmNlXG4gIHRoYXQgc3RpbGwgaGF2ZSBhbiBhdmFpbGFibGUgaW5wdXQgb3Igb3V0cHV0LiBCZWNhdXNlIEphenogb25seSBhbGxvd3Mgb25lIGlucHV0IGFuZCBvbmUgb3V0cHV0IHBlciBpbnN0YW5jZSwgd2VcbiAgbmVlZCB0byBjcmVhdGUgbmV3IGluc3RhbmNlcyBpZiBtb3JlIHRoYW4gb25lIE1JREkgaW5wdXQgb3Igb3V0cHV0IGRldmljZSBnZXRzIGNvbm5lY3RlZC5cblxuICBOb3RlIHRoYXQgYW4gZXhpc3RpbmcgSmF6eiBpbnN0YW5jZSBkb2Vzbid0IGdldCBkZWxldGVkIHdoZW4gYm90aCBpdHMgaW5wdXQgYW5kIG91dHB1dCBkZXZpY2UgYXJlIGRpc2Nvbm5lY3RlZDsgaW5zdGVhZCBpdFxuICB3aWxsIGJlIHJldXNlZCBpZiBhIG5ldyBkZXZpY2UgZ2V0cyBjb25uZWN0ZWQuXG4qL1xuXG52YXIgamF6ekluc3RhbmNlTnVtYmVyID0gMDtcbnZhciBqYXp6SW5zdGFuY2VzID0gbmV3IE1hcCgpO1xuXG5mdW5jdGlvbiBjcmVhdGVKYXp6SW5zdGFuY2UoY2FsbGJhY2spIHtcblxuICB2YXIgaWQgPSAnamF6el8nICsgamF6ekluc3RhbmNlTnVtYmVyKysgKyAnJyArIERhdGUubm93KCk7XG4gIHZhciBpbnN0YW5jZSA9IHZvaWQgMDtcbiAgdmFyIG9ialJlZiA9IHZvaWQgMCxcbiAgICAgIGFjdGl2ZVggPSB2b2lkIDA7XG5cbiAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkubm9kZWpzID09PSB0cnVlKSB7XG4gICAgb2JqUmVmID0gbmV3IGphenpNaWRpLk1JREkoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbzEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICBvMS5pZCA9IGlkICsgJ2llJztcbiAgICBvMS5jbGFzc2lkID0gJ0NMU0lEOjFBQ0UxNjE4LTFDN0QtNDU2MS1BRUUxLTM0ODQyQUE4NUU5MCc7XG4gICAgYWN0aXZlWCA9IG8xO1xuXG4gICAgdmFyIG8yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2JqZWN0Jyk7XG4gICAgbzIuaWQgPSBpZDtcbiAgICBvMi50eXBlID0gJ2F1ZGlvL3gtamF6eic7XG4gICAgbzEuYXBwZW5kQ2hpbGQobzIpO1xuICAgIG9ialJlZiA9IG8yO1xuXG4gICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnVGhpcyBwYWdlIHJlcXVpcmVzIHRoZSAnKSk7XG5cbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBhLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdKYXp6IHBsdWdpbicpKTtcbiAgICBhLmhyZWYgPSAnaHR0cDovL2phenotc29mdC5uZXQvJztcblxuICAgIGUuYXBwZW5kQ2hpbGQoYSk7XG4gICAgZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnLicpKTtcbiAgICBvMi5hcHBlbmRDaGlsZChlKTtcblxuICAgIHZhciBpbnNlcnRpb25Qb2ludCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdNSURJUGx1Z2luJyk7XG4gICAgaWYgKCFpbnNlcnRpb25Qb2ludCkge1xuICAgICAgLy8gQ3JlYXRlIGhpZGRlbiBlbGVtZW50XG4gICAgICBpbnNlcnRpb25Qb2ludCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgaW5zZXJ0aW9uUG9pbnQuaWQgPSAnTUlESVBsdWdpbic7XG4gICAgICBpbnNlcnRpb25Qb2ludC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBpbnNlcnRpb25Qb2ludC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICBpbnNlcnRpb25Qb2ludC5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnO1xuICAgICAgaW5zZXJ0aW9uUG9pbnQuc3R5bGUudG9wID0gJy05OTk5cHgnO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbnNlcnRpb25Qb2ludCk7XG4gICAgfVxuICAgIGluc2VydGlvblBvaW50LmFwcGVuZENoaWxkKG8xKTtcbiAgfVxuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGlmIChvYmpSZWYuaXNKYXp6ID09PSB0cnVlKSB7XG4gICAgICBpbnN0YW5jZSA9IG9ialJlZjtcbiAgICB9IGVsc2UgaWYgKGFjdGl2ZVguaXNKYXp6ID09PSB0cnVlKSB7XG4gICAgICBpbnN0YW5jZSA9IGFjdGl2ZVg7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgaW5zdGFuY2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpbnN0YW5jZS5fcGVyZlRpbWVaZXJvID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBqYXp6SW5zdGFuY2VzLnNldChpZCwgaW5zdGFuY2UpO1xuICAgIH1cbiAgICBjYWxsYmFjayhpbnN0YW5jZSk7XG4gIH0sIGphenpQbHVnaW5Jbml0VGltZSk7XG59XG5cbmZ1bmN0aW9uIGdldEphenpJbnN0YW5jZSh0eXBlLCBjYWxsYmFjaykge1xuICB2YXIgaW5zdGFuY2UgPSBudWxsO1xuICB2YXIga2V5ID0gdHlwZSA9PT0gJ2lucHV0JyA/ICdpbnB1dEluVXNlJyA6ICdvdXRwdXRJblVzZSc7XG5cbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gamF6ekluc3RhbmNlcy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgIHZhciBpbnN0ID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgIGlmIChpbnN0W2tleV0gIT09IHRydWUpIHtcbiAgICAgICAgaW5zdGFuY2UgPSBpbnN0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGluc3RhbmNlID09PSBudWxsKSB7XG4gICAgY3JlYXRlSmF6ekluc3RhbmNlKGNhbGxiYWNrKTtcbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjayhpbnN0YW5jZSk7XG4gIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDcmVhdGVzIGEgTUlESUFjY2VzcyBpbnN0YW5jZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gQ3JlYXRlcyBNSURJSW5wdXQgYW5kIE1JRElPdXRwdXQgaW5zdGFuY2VzIGZvciB0aGUgaW5pdGlhbGx5IGNvbm5lY3RlZCBNSURJIGRldmljZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIEtlZXBzIHRyYWNrIG9mIG5ld2x5IGNvbm5lY3RlZCBkZXZpY2VzIGFuZCBjcmVhdGVzIHRoZSBuZWNlc3NhcnkgaW5zdGFuY2VzIG9mIE1JRElJbnB1dCBhbmQgTUlESU91dHB1dC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gS2VlcHMgdHJhY2sgb2YgZGlzY29ubmVjdGVkIGRldmljZXMgYW5kIHJlbW92ZXMgdGhlbSBmcm9tIHRoZSBpbnB1dHMgYW5kL29yIG91dHB1dHMgbWFwLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBDcmVhdGVzIGEgdW5pcXVlIGlkIGZvciBldmVyeSBkZXZpY2UgYW5kIHN0b3JlcyB0aGVzZSBpZHMgYnkgdGhlIG5hbWUgb2YgdGhlIGRldmljZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc28gd2hlbiBhIGRldmljZSBnZXRzIGRpc2Nvbm5lY3RlZCBhbmQgcmVjb25uZWN0ZWQgYWdhaW4sIGl0IHdpbGwgc3RpbGwgaGF2ZSB0aGUgc2FtZSBpZC4gVGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcyBpbiBsaW5lIHdpdGggdGhlIGJlaGF2aW91ciBvZiB0aGUgbmF0aXZlIE1JRElBY2Nlc3Mgb2JqZWN0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbmV4cG9ydHMuY3JlYXRlTUlESUFjY2VzcyA9IGNyZWF0ZU1JRElBY2Nlc3M7XG5leHBvcnRzLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuZXhwb3J0cy5jbG9zZUFsbE1JRElJbnB1dHMgPSBjbG9zZUFsbE1JRElJbnB1dHM7XG5leHBvcnRzLmdldE1JRElEZXZpY2VJZCA9IGdldE1JRElEZXZpY2VJZDtcblxudmFyIF9qYXp6X2luc3RhbmNlID0gcmVxdWlyZSgnLi9qYXp6X2luc3RhbmNlJyk7XG5cbnZhciBfbWlkaV9pbnB1dCA9IHJlcXVpcmUoJy4vbWlkaV9pbnB1dCcpO1xuXG52YXIgX21pZGlfb3V0cHV0ID0gcmVxdWlyZSgnLi9taWRpX291dHB1dCcpO1xuXG52YXIgX21pZGljb25uZWN0aW9uX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpY29ubmVjdGlvbl9ldmVudCcpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIG1pZGlBY2Nlc3MgPSB2b2lkIDA7XG52YXIgamF6ekluc3RhbmNlID0gdm9pZCAwO1xudmFyIG1pZGlJbnB1dHMgPSBuZXcgTWFwKCk7XG52YXIgbWlkaU91dHB1dHMgPSBuZXcgTWFwKCk7XG52YXIgbWlkaUlucHV0SWRzID0gbmV3IE1hcCgpO1xudmFyIG1pZGlPdXRwdXRJZHMgPSBuZXcgTWFwKCk7XG52YXIgbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuXG52YXIgTUlESUFjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTUlESUFjY2VzcyhpbnB1dHMsIG91dHB1dHMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESUFjY2Vzcyk7XG5cbiAgICB0aGlzLnN5c2V4RW5hYmxlZCA9IHRydWU7XG4gICAgdGhpcy5pbnB1dHMgPSBpbnB1dHM7XG4gICAgdGhpcy5vdXRwdXRzID0gb3V0cHV0cztcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhNSURJQWNjZXNzLCBbe1xuICAgIGtleTogJ2FkZEV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAobGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IGZhbHNlKSB7XG4gICAgICAgIGxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZUV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAobGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IHRydWUpIHtcbiAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElBY2Nlc3M7XG59KCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZU1JRElBY2Nlc3MoKSB7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgaWYgKHR5cGVvZiBtaWRpQWNjZXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmVzb2x2ZShtaWRpQWNjZXNzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5icm93c2VyID09PSAnaWU5Jykge1xuICAgICAgcmVqZWN0KHsgbWVzc2FnZTogJ1dlYk1JRElBUElTaGltIHN1cHBvcnRzIEludGVybmV0IEV4cGxvcmVyIDEwIGFuZCBhYm92ZS4nIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICgwLCBfamF6el9pbnN0YW5jZS5jcmVhdGVKYXp6SW5zdGFuY2UpKGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgaWYgKHR5cGVvZiBpbnN0YW5jZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVqZWN0KHsgbWVzc2FnZTogJ05vIGFjY2VzcyB0byBNSURJIGRldmljZXM6IGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0aGUgV2ViTUlESSBBUEkgYW5kIHRoZSBKYXp6IHBsdWdpbiBpcyBub3QgaW5zdGFsbGVkLicgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgamF6ekluc3RhbmNlID0gaW5zdGFuY2U7XG5cbiAgICAgIGNyZWF0ZU1JRElQb3J0cyhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNldHVwTGlzdGVuZXJzKCk7XG4gICAgICAgIG1pZGlBY2Nlc3MgPSBuZXcgTUlESUFjY2VzcyhtaWRpSW5wdXRzLCBtaWRpT3V0cHV0cyk7XG4gICAgICAgIHJlc29sdmUobWlkaUFjY2Vzcyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8vIGNyZWF0ZSBNSURJSW5wdXQgYW5kIE1JRElPdXRwdXQgaW5zdGFuY2VzIGZvciBhbGwgaW5pdGlhbGx5IGNvbm5lY3RlZCBNSURJIGRldmljZXNcbmZ1bmN0aW9uIGNyZWF0ZU1JRElQb3J0cyhjYWxsYmFjaykge1xuICB2YXIgaW5wdXRzID0gamF6ekluc3RhbmNlLk1pZGlJbkxpc3QoKTtcbiAgdmFyIG91dHB1dHMgPSBqYXp6SW5zdGFuY2UuTWlkaU91dExpc3QoKTtcbiAgdmFyIG51bUlucHV0cyA9IGlucHV0cy5sZW5ndGg7XG4gIHZhciBudW1PdXRwdXRzID0gb3V0cHV0cy5sZW5ndGg7XG5cbiAgbG9vcENyZWF0ZU1JRElQb3J0KDAsIG51bUlucHV0cywgJ2lucHV0JywgaW5wdXRzLCBmdW5jdGlvbiAoKSB7XG4gICAgbG9vcENyZWF0ZU1JRElQb3J0KDAsIG51bU91dHB1dHMsICdvdXRwdXQnLCBvdXRwdXRzLCBjYWxsYmFjayk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBsb29wQ3JlYXRlTUlESVBvcnQoaW5kZXgsIG1heCwgdHlwZSwgbGlzdCwgY2FsbGJhY2spIHtcbiAgaWYgKGluZGV4IDwgbWF4KSB7XG4gICAgdmFyIG5hbWUgPSBsaXN0W2luZGV4KytdO1xuICAgIGNyZWF0ZU1JRElQb3J0KHR5cGUsIG5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGxvb3BDcmVhdGVNSURJUG9ydChpbmRleCwgbWF4LCB0eXBlLCBsaXN0LCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVNSURJUG9ydCh0eXBlLCBuYW1lLCBjYWxsYmFjaykge1xuICAoMCwgX2phenpfaW5zdGFuY2UuZ2V0SmF6ekluc3RhbmNlKSh0eXBlLCBmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICB2YXIgcG9ydCA9IHZvaWQgMDtcbiAgICB2YXIgaW5mbyA9IFtuYW1lLCAnJywgJyddO1xuICAgIGlmICh0eXBlID09PSAnaW5wdXQnKSB7XG4gICAgICBpZiAoaW5zdGFuY2UuU3VwcG9ydCgnTWlkaUluSW5mbycpKSB7XG4gICAgICAgIGluZm8gPSBpbnN0YW5jZS5NaWRpSW5JbmZvKG5hbWUpO1xuICAgICAgfVxuICAgICAgcG9ydCA9IG5ldyBfbWlkaV9pbnB1dC5NSURJSW5wdXQoaW5mbywgaW5zdGFuY2UpO1xuICAgICAgbWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnb3V0cHV0Jykge1xuICAgICAgaWYgKGluc3RhbmNlLlN1cHBvcnQoJ01pZGlPdXRJbmZvJykpIHtcbiAgICAgICAgaW5mbyA9IGluc3RhbmNlLk1pZGlPdXRJbmZvKG5hbWUpO1xuICAgICAgfVxuICAgICAgcG9ydCA9IG5ldyBfbWlkaV9vdXRwdXQuTUlESU91dHB1dChpbmZvLCBpbnN0YW5jZSk7XG4gICAgICBtaWRpT3V0cHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gICAgfVxuICAgIGNhbGxiYWNrKHBvcnQpO1xuICB9KTtcbn1cblxuLy8gbG9va3VwIGZ1bmN0aW9uOiBKYXp6IGdpdmVzIHVzIHRoZSBuYW1lIG9mIHRoZSBjb25uZWN0ZWQvZGlzY29ubmVjdGVkIE1JREkgZGV2aWNlcyBidXQgd2UgaGF2ZSBzdG9yZWQgdGhlbSBieSBpZFxuZnVuY3Rpb24gZ2V0UG9ydEJ5TmFtZShwb3J0cywgbmFtZSkge1xuICB2YXIgcG9ydCA9IHZvaWQgMDtcbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gcG9ydHMudmFsdWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICBwb3J0ID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgIGlmIChwb3J0Lm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwb3J0O1xufVxuXG4vLyBrZWVwIHRyYWNrIG9mIGNvbm5lY3RlZC9kaXNjb25uZWN0ZWQgTUlESSBkZXZpY2VzXG5mdW5jdGlvbiBzZXR1cExpc3RlbmVycygpIHtcbiAgamF6ekluc3RhbmNlLk9uRGlzY29ubmVjdE1pZGlJbihmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBwb3J0ID0gZ2V0UG9ydEJ5TmFtZShtaWRpSW5wdXRzLCBuYW1lKTtcbiAgICBpZiAodHlwZW9mIHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwb3J0LnN0YXRlID0gJ2Rpc2Nvbm5lY3RlZCc7XG4gICAgICBwb3J0LmNsb3NlKCk7XG4gICAgICBwb3J0Ll9qYXp6SW5zdGFuY2UuaW5wdXRJblVzZSA9IGZhbHNlO1xuICAgICAgbWlkaUlucHV0cy5kZWxldGUocG9ydC5pZCk7XG4gICAgICBkaXNwYXRjaEV2ZW50KHBvcnQpO1xuICAgIH1cbiAgfSk7XG5cbiAgamF6ekluc3RhbmNlLk9uRGlzY29ubmVjdE1pZGlPdXQoZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgcG9ydCA9IGdldFBvcnRCeU5hbWUobWlkaU91dHB1dHMsIG5hbWUpO1xuICAgIGlmICh0eXBlb2YgcG9ydCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBvcnQuc3RhdGUgPSAnZGlzY29ubmVjdGVkJztcbiAgICAgIHBvcnQuY2xvc2UoKTtcbiAgICAgIHBvcnQuX2phenpJbnN0YW5jZS5vdXRwdXRJblVzZSA9IGZhbHNlO1xuICAgICAgbWlkaU91dHB1dHMuZGVsZXRlKHBvcnQuaWQpO1xuICAgICAgZGlzcGF0Y2hFdmVudChwb3J0KTtcbiAgICB9XG4gIH0pO1xuXG4gIGphenpJbnN0YW5jZS5PbkNvbm5lY3RNaWRpSW4oZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBjcmVhdGVNSURJUG9ydCgnaW5wdXQnLCBuYW1lLCBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgZGlzcGF0Y2hFdmVudChwb3J0KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgamF6ekluc3RhbmNlLk9uQ29ubmVjdE1pZGlPdXQoZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBjcmVhdGVNSURJUG9ydCgnb3V0cHV0JywgbmFtZSwgZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgIGRpc3BhdGNoRXZlbnQocG9ydCk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vLyB3aGVuIGEgZGV2aWNlIGdldHMgY29ubmVjdGVkL2Rpc2Nvbm5lY3RlZCBib3RoIHRoZSBwb3J0IGFuZCBNSURJQWNjZXNzIGRpc3BhdGNoIGEgTUlESUNvbm5lY3Rpb25FdmVudFxuLy8gdGhlcmVmb3Igd2UgY2FsbCB0aGUgcG9ydHMgZGlzcGF0Y2hFdmVudCBmdW5jdGlvbiBoZXJlIGFzIHdlbGxcbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQocG9ydCkge1xuICBwb3J0LmRpc3BhdGNoRXZlbnQobmV3IF9taWRpY29ubmVjdGlvbl9ldmVudC5NSURJQ29ubmVjdGlvbkV2ZW50KHBvcnQsIHBvcnQpKTtcblxuICB2YXIgZXZ0ID0gbmV3IF9taWRpY29ubmVjdGlvbl9ldmVudC5NSURJQ29ubmVjdGlvbkV2ZW50KG1pZGlBY2Nlc3MsIHBvcnQpO1xuXG4gIGlmICh0eXBlb2YgbWlkaUFjY2Vzcy5vbnN0YXRlY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgbWlkaUFjY2Vzcy5vbnN0YXRlY2hhbmdlKGV2dCk7XG4gIH1cbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IGxpc3RlbmVyc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgdmFyIGxpc3RlbmVyID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICBsaXN0ZW5lcihldnQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNsb3NlQWxsTUlESUlucHV0cygpIHtcbiAgbWlkaUlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChpbnB1dCkge1xuICAgIC8vaW5wdXQuY2xvc2UoKTtcbiAgICBpbnB1dC5famF6ekluc3RhbmNlLk1pZGlJbkNsb3NlKCk7XG4gIH0pO1xufVxuXG4vLyBjaGVjayBpZiB3ZSBoYXZlIGFscmVhZHkgY3JlYXRlZCBhIHVuaXF1ZSBpZCBmb3IgdGhpcyBkZXZpY2UsIGlmIHNvOiByZXVzZSBpdCwgaWYgbm90OiBjcmVhdGUgYSBuZXcgaWQgYW5kIHN0b3JlIGl0XG5mdW5jdGlvbiBnZXRNSURJRGV2aWNlSWQobmFtZSwgdHlwZSkge1xuICB2YXIgaWQgPSB2b2lkIDA7XG4gIGlmICh0eXBlID09PSAnaW5wdXQnKSB7XG4gICAgaWQgPSBtaWRpSW5wdXRJZHMuZ2V0KG5hbWUpO1xuICAgIGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpZCA9ICgwLCBfdXRpbC5nZW5lcmF0ZVVVSUQpKCk7XG4gICAgICBtaWRpSW5wdXRJZHMuc2V0KG5hbWUsIGlkKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ291dHB1dCcpIHtcbiAgICBpZCA9IG1pZGlPdXRwdXRJZHMuZ2V0KG5hbWUpO1xuICAgIGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpZCA9ICgwLCBfdXRpbC5nZW5lcmF0ZVVVSUQpKCk7XG4gICAgICBtaWRpT3V0cHV0SWRzLnNldChuYW1lLCBpZCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBpZDtcbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLk1JRElJbnB1dCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1JRElJbnB1dCBpcyBhIHdyYXBwZXIgYXJvdW5kIGFuIGlucHV0IG9mIGEgSmF6eiBpbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX21pZGltZXNzYWdlX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpbWVzc2FnZV9ldmVudCcpO1xuXG52YXIgX21pZGljb25uZWN0aW9uX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpY29ubmVjdGlvbl9ldmVudCcpO1xuXG52YXIgX21pZGlfYWNjZXNzID0gcmVxdWlyZSgnLi9taWRpX2FjY2VzcycpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgbWlkaVByb2MgPSB2b2lkIDA7XG52YXIgbm9kZWpzID0gKDAsIF91dGlsLmdldERldmljZSkoKS5ub2RlanM7XG5cbnZhciBNSURJSW5wdXQgPSBleHBvcnRzLk1JRElJbnB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTUlESUlucHV0KGluZm8sIGluc3RhbmNlKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1JRElJbnB1dCk7XG5cbiAgICB0aGlzLmlkID0gKDAsIF9taWRpX2FjY2Vzcy5nZXRNSURJRGV2aWNlSWQpKGluZm9bMF0sICdpbnB1dCcpO1xuICAgIHRoaXMubmFtZSA9IGluZm9bMF07XG4gICAgdGhpcy5tYW51ZmFjdHVyZXIgPSBpbmZvWzFdO1xuICAgIHRoaXMudmVyc2lvbiA9IGluZm9bMl07XG4gICAgdGhpcy50eXBlID0gJ2lucHV0JztcbiAgICB0aGlzLnN0YXRlID0gJ2Nvbm5lY3RlZCc7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gJ3BlbmRpbmcnO1xuXG4gICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICB0aGlzLl9vbm1pZGltZXNzYWdlID0gbnVsbDtcbiAgICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gaW1wbGljaXRseSBvcGVuIHRoZSBkZXZpY2Ugd2hlbiBhbiBvbm1pZGltZXNzYWdlIGhhbmRsZXIgZ2V0cyBhZGRlZFxuICAgIC8vIHdlIGRlZmluZSBhIHNldHRlciB0aGF0IG9wZW5zIHRoZSBkZXZpY2UgaWYgdGhlIHNldCB2YWx1ZSBpcyBhIGZ1bmN0aW9uXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdvbm1pZGltZXNzYWdlJywge1xuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZSA9IHZhbHVlO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBNYXAoKS5zZXQoJ21pZGltZXNzYWdlJywgbmV3IFNldCgpKS5zZXQoJ3N0YXRlY2hhbmdlJywgbmV3IFNldCgpKTtcbiAgICB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UgPSBmYWxzZTtcbiAgICB0aGlzLl9zeXNleEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KCk7XG5cbiAgICB0aGlzLl9qYXp6SW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICB0aGlzLl9qYXp6SW5zdGFuY2UuaW5wdXRJblVzZSA9IHRydWU7XG5cbiAgICAvLyBvbiBMaW51eCBvcGVuaW5nIGFuZCBjbG9zaW5nIEphenogaW5zdGFuY2VzIGNhdXNlcyB0aGUgcGx1Z2luIHRvIGNyYXNoIGEgbG90IHNvIHdlIG9wZW5cbiAgICAvLyB0aGUgZGV2aWNlIGhlcmUgYW5kIGRvbid0IGNsb3NlIGl0IHdoZW4gY2xvc2UoKSBpcyBjYWxsZWQsIHNlZSBiZWxvd1xuICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLnBsYXRmb3JtID09PSAnbGludXgnKSB7XG4gICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaUluT3Blbih0aGlzLm5hbWUsIG1pZGlQcm9jLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhNSURJSW5wdXQsIFt7XG4gICAga2V5OiAnYWRkRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KHR5cGUpO1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGxpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICBsaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQodHlwZSk7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IGZhbHNlKSB7XG4gICAgICAgIGxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Rpc3BhdGNoRXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2dCkge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQoZXZ0LnR5cGUpO1xuICAgICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIGxpc3RlbmVyKGV2dCk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGV2dC50eXBlID09PSAnbWlkaW1lc3NhZ2UnKSB7XG4gICAgICAgIGlmICh0aGlzLl9vbm1pZGltZXNzYWdlICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZShldnQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGV2dC50eXBlID09PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIGlmICh0aGlzLm9uc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UoZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ29wZW4nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ29wZW4nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLnBsYXRmb3JtICE9PSAnbGludXgnKSB7XG4gICAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpSW5PcGVuKHRoaXMubmFtZSwgbWlkaVByb2MuYmluZCh0aGlzKSk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnb3Blbic7XG4gICAgICAoMCwgX21pZGlfYWNjZXNzLmRpc3BhdGNoRXZlbnQpKHRoaXMpOyAvLyBkaXNwYXRjaCBNSURJQ29ubmVjdGlvbkV2ZW50IHZpYSBNSURJQWNjZXNzXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY2xvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb24gPT09ICdjbG9zZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLnBsYXRmb3JtICE9PSAnbGludXgnKSB7XG4gICAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpSW5DbG9zZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ2Nsb3NlZCc7XG4gICAgICAoMCwgX21pZGlfYWNjZXNzLmRpc3BhdGNoRXZlbnQpKHRoaXMpOyAvLyBkaXNwYXRjaCBNSURJQ29ubmVjdGlvbkV2ZW50IHZpYSBNSURJQWNjZXNzXG4gICAgICB0aGlzLl9vbm1pZGltZXNzYWdlID0gbnVsbDtcbiAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuZ2V0KCdtaWRpbWVzc2FnZScpLmNsZWFyKCk7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuZ2V0KCdzdGF0ZWNoYW5nZScpLmNsZWFyKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX2FwcGVuZFRvU3lzZXhCdWZmZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kVG9TeXNleEJ1ZmZlcihkYXRhKSB7XG4gICAgICB2YXIgb2xkTGVuZ3RoID0gdGhpcy5fc3lzZXhCdWZmZXIubGVuZ3RoO1xuICAgICAgdmFyIHRtcEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG9sZExlbmd0aCArIGRhdGEubGVuZ3RoKTtcbiAgICAgIHRtcEJ1ZmZlci5zZXQodGhpcy5fc3lzZXhCdWZmZXIpO1xuICAgICAgdG1wQnVmZmVyLnNldChkYXRhLCBvbGRMZW5ndGgpO1xuICAgICAgdGhpcy5fc3lzZXhCdWZmZXIgPSB0bXBCdWZmZXI7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX2J1ZmZlckxvbmdTeXNleCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9idWZmZXJMb25nU3lzZXgoZGF0YSwgaW5pdGlhbE9mZnNldCkge1xuICAgICAgdmFyIGogPSBpbml0aWFsT2Zmc2V0O1xuICAgICAgd2hpbGUgKGogPCBkYXRhLmxlbmd0aCkge1xuICAgICAgICBpZiAoZGF0YVtqXSA9PSAweEY3KSB7XG4gICAgICAgICAgLy8gZW5kIG9mIHN5c2V4IVxuICAgICAgICAgIGorKztcbiAgICAgICAgICB0aGlzLl9hcHBlbmRUb1N5c2V4QnVmZmVyKGRhdGEuc2xpY2UoaW5pdGlhbE9mZnNldCwgaikpO1xuICAgICAgICAgIHJldHVybiBqO1xuICAgICAgICB9XG4gICAgICAgIGorKztcbiAgICAgIH1cbiAgICAgIC8vIGRpZG4ndCByZWFjaCB0aGUgZW5kOyBqdXN0IHRhY2sgaXQgb24uXG4gICAgICB0aGlzLl9hcHBlbmRUb1N5c2V4QnVmZmVyKGRhdGEuc2xpY2UoaW5pdGlhbE9mZnNldCwgaikpO1xuICAgICAgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlID0gdHJ1ZTtcbiAgICAgIHJldHVybiBqO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNSURJSW5wdXQ7XG59KCk7XG5cbm1pZGlQcm9jID0gZnVuY3Rpb24gbWlkaVByb2ModGltZXN0YW1wLCBkYXRhKSB7XG4gIHZhciBsZW5ndGggPSAwO1xuICB2YXIgaSA9IHZvaWQgMDtcbiAgdmFyIGlzU3lzZXhNZXNzYWdlID0gZmFsc2U7XG5cbiAgLy8gSmF6eiBzb21ldGltZXMgcGFzc2VzIHVzIG11bHRpcGxlIG1lc3NhZ2VzIGF0IG9uY2UsIHNvIHdlIG5lZWQgdG8gcGFyc2UgdGhlbSBvdXQgYW5kIHBhc3MgdGhlbSBvbmUgYXQgYSB0aW1lLlxuXG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSArPSBsZW5ndGgpIHtcbiAgICB2YXIgaXNWYWxpZE1lc3NhZ2UgPSB0cnVlO1xuICAgIGlmICh0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UpIHtcbiAgICAgIGkgPSB0aGlzLl9idWZmZXJMb25nU3lzZXgoZGF0YSwgaSk7XG4gICAgICBpZiAoZGF0YVtpIC0gMV0gIT0gMHhmNykge1xuICAgICAgICAvLyByYW4gb2ZmIHRoZSBlbmQgd2l0aG91dCBoaXR0aW5nIHRoZSBlbmQgb2YgdGhlIHN5c2V4IG1lc3NhZ2VcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaXNTeXNleE1lc3NhZ2UgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpc1N5c2V4TWVzc2FnZSA9IGZhbHNlO1xuICAgICAgc3dpdGNoIChkYXRhW2ldICYgMHhGMCkge1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgLy8gQ2hldyB1cCBzcHVyaW91cyAweDAwIGJ5dGVzLiAgRml4ZXMgYSBXaW5kb3dzIHByb2JsZW0uXG4gICAgICAgICAgbGVuZ3RoID0gMTtcbiAgICAgICAgICBpc1ZhbGlkTWVzc2FnZSA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMHg4MDogLy8gbm90ZSBvZmZcbiAgICAgICAgY2FzZSAweDkwOiAvLyBub3RlIG9uXG4gICAgICAgIGNhc2UgMHhBMDogLy8gcG9seXBob25pYyBhZnRlcnRvdWNoXG4gICAgICAgIGNhc2UgMHhCMDogLy8gY29udHJvbCBjaGFuZ2VcbiAgICAgICAgY2FzZSAweEUwOlxuICAgICAgICAgIC8vIGNoYW5uZWwgbW9kZVxuICAgICAgICAgIGxlbmd0aCA9IDM7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAweEMwOiAvLyBwcm9ncmFtIGNoYW5nZVxuICAgICAgICBjYXNlIDB4RDA6XG4gICAgICAgICAgLy8gY2hhbm5lbCBhZnRlcnRvdWNoXG4gICAgICAgICAgbGVuZ3RoID0gMjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDB4RjA6XG4gICAgICAgICAgc3dpdGNoIChkYXRhW2ldKSB7XG4gICAgICAgICAgICBjYXNlIDB4ZjA6XG4gICAgICAgICAgICAgIC8vIGxldGlhYmxlLWxlbmd0aCBzeXNleC5cbiAgICAgICAgICAgICAgaSA9IHRoaXMuX2J1ZmZlckxvbmdTeXNleChkYXRhLCBpKTtcbiAgICAgICAgICAgICAgaWYgKGRhdGFbaSAtIDFdICE9IDB4ZjcpIHtcbiAgICAgICAgICAgICAgICAvLyByYW4gb2ZmIHRoZSBlbmQgd2l0aG91dCBoaXR0aW5nIHRoZSBlbmQgb2YgdGhlIHN5c2V4IG1lc3NhZ2VcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaXNTeXNleE1lc3NhZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAweEYxOiAvLyBNVEMgcXVhcnRlciBmcmFtZVxuICAgICAgICAgICAgY2FzZSAweEYzOlxuICAgICAgICAgICAgICAvLyBzb25nIHNlbGVjdFxuICAgICAgICAgICAgICBsZW5ndGggPSAyO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAweEYyOlxuICAgICAgICAgICAgICAvLyBzb25nIHBvc2l0aW9uIHBvaW50ZXJcbiAgICAgICAgICAgICAgbGVuZ3RoID0gMztcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIGxlbmd0aCA9IDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFpc1ZhbGlkTWVzc2FnZSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdmFyIGV2dCA9IHt9O1xuICAgIGV2dC5yZWNlaXZlZFRpbWUgPSBwYXJzZUZsb2F0KHRpbWVzdGFtcC50b1N0cmluZygpKSArIHRoaXMuX2phenpJbnN0YW5jZS5fcGVyZlRpbWVaZXJvO1xuXG4gICAgaWYgKGlzU3lzZXhNZXNzYWdlIHx8IHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSkge1xuICAgICAgZXZ0LmRhdGEgPSBuZXcgVWludDhBcnJheSh0aGlzLl9zeXNleEJ1ZmZlcik7XG4gICAgICB0aGlzLl9zeXNleEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KDApO1xuICAgICAgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2dC5kYXRhID0gbmV3IFVpbnQ4QXJyYXkoZGF0YS5zbGljZShpLCBsZW5ndGggKyBpKSk7XG4gICAgfVxuXG4gICAgaWYgKG5vZGVqcykge1xuICAgICAgaWYgKHRoaXMuX29ubWlkaW1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZShldnQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZSA9IG5ldyBfbWlkaW1lc3NhZ2VfZXZlbnQuTUlESU1lc3NhZ2VFdmVudCh0aGlzLCBldnQuZGF0YSwgZXZ0LnJlY2VpdmVkVGltZSk7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfVxuICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuTUlESU91dHB1dCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1JRElPdXRwdXQgaXMgYSB3cmFwcGVyIGFyb3VuZCBhbiBvdXRwdXQgb2YgYSBKYXp6IGluc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfbWlkaV9hY2Nlc3MgPSByZXF1aXJlKCcuL21pZGlfYWNjZXNzJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBNSURJT3V0cHV0ID0gZXhwb3J0cy5NSURJT3V0cHV0ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNSURJT3V0cHV0KGluZm8sIGluc3RhbmNlKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1JRElPdXRwdXQpO1xuXG4gICAgdGhpcy5pZCA9ICgwLCBfbWlkaV9hY2Nlc3MuZ2V0TUlESURldmljZUlkKShpbmZvWzBdLCAnb3V0cHV0Jyk7XG4gICAgdGhpcy5uYW1lID0gaW5mb1swXTtcbiAgICB0aGlzLm1hbnVmYWN0dXJlciA9IGluZm9bMV07XG4gICAgdGhpcy52ZXJzaW9uID0gaW5mb1syXTtcbiAgICB0aGlzLnR5cGUgPSAnb3V0cHV0JztcbiAgICB0aGlzLnN0YXRlID0gJ2Nvbm5lY3RlZCc7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gJ3BlbmRpbmcnO1xuICAgIHRoaXMub25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcblxuICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UgPSBmYWxzZTtcbiAgICB0aGlzLl9zeXNleEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KCk7XG5cbiAgICB0aGlzLl9qYXp6SW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICB0aGlzLl9qYXp6SW5zdGFuY2Uub3V0cHV0SW5Vc2UgPSB0cnVlO1xuICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLnBsYXRmb3JtID09PSAnbGludXgnKSB7XG4gICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaU91dE9wZW4odGhpcy5uYW1lKTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTUlESU91dHB1dCwgW3tcbiAgICBrZXk6ICdvcGVuJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb24gPT09ICdvcGVuJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5wbGF0Zm9ybSAhPT0gJ2xpbnV4Jykge1xuICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaU91dE9wZW4odGhpcy5uYW1lKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdvcGVuJztcbiAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjbG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlPdXRDbG9zZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ2Nsb3NlZCc7XG4gICAgICAoMCwgX21pZGlfYWNjZXNzLmRpc3BhdGNoRXZlbnQpKHRoaXMpOyAvLyBkaXNwYXRjaCBNSURJQ29ubmVjdGlvbkV2ZW50IHZpYSBNSURJQWNjZXNzXG4gICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLmNsZWFyKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2VuZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmQoZGF0YSwgdGltZXN0YW1wKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgZGVsYXlCZWZvcmVTZW5kID0gMDtcblxuICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWVzdGFtcCkge1xuICAgICAgICBkZWxheUJlZm9yZVNlbmQgPSBNYXRoLmZsb29yKHRpbWVzdGFtcCAtIHBlcmZvcm1hbmNlLm5vdygpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWVzdGFtcCAmJiBkZWxheUJlZm9yZVNlbmQgPiAxKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLl9qYXp6SW5zdGFuY2UuTWlkaU91dExvbmcoZGF0YSk7XG4gICAgICAgIH0sIGRlbGF5QmVmb3JlU2VuZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaU91dExvbmcoZGF0YSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjbGVhcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhZGRFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgaWYgKHR5cGUgIT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fbGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZUV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGlzcGF0Y2hFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZ0KSB7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXIoZXZ0KTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGhpcy5vbnN0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZShldnQpO1xuICAgICAgfVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNSURJT3V0cHV0O1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIE1JRElDb25uZWN0aW9uRXZlbnQgPSBleHBvcnRzLk1JRElDb25uZWN0aW9uRXZlbnQgPSBmdW5jdGlvbiBNSURJQ29ubmVjdGlvbkV2ZW50KG1pZGlBY2Nlc3MsIHBvcnQpIHtcbiAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1JRElDb25uZWN0aW9uRXZlbnQpO1xuXG4gIHRoaXMuYnViYmxlcyA9IGZhbHNlO1xuICB0aGlzLmNhbmNlbEJ1YmJsZSA9IGZhbHNlO1xuICB0aGlzLmNhbmNlbGFibGUgPSBmYWxzZTtcbiAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbWlkaUFjY2VzcztcbiAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gIHRoaXMucGF0aCA9IFtdO1xuICB0aGlzLnBvcnQgPSBwb3J0O1xuICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgdGhpcy5zcmNFbGVtZW50ID0gbWlkaUFjY2VzcztcbiAgdGhpcy50YXJnZXQgPSBtaWRpQWNjZXNzO1xuICB0aGlzLnRpbWVTdGFtcCA9IERhdGUubm93KCk7XG4gIHRoaXMudHlwZSA9ICdzdGF0ZWNoYW5nZSc7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIE1JRElNZXNzYWdlRXZlbnQgPSBleHBvcnRzLk1JRElNZXNzYWdlRXZlbnQgPSBmdW5jdGlvbiBNSURJTWVzc2FnZUV2ZW50KHBvcnQsIGRhdGEsIHJlY2VpdmVkVGltZSkge1xuICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESU1lc3NhZ2VFdmVudCk7XG5cbiAgdGhpcy5idWJibGVzID0gZmFsc2U7XG4gIHRoaXMuY2FuY2VsQnViYmxlID0gZmFsc2U7XG4gIHRoaXMuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICB0aGlzLmN1cnJlbnRUYXJnZXQgPSBwb3J0O1xuICB0aGlzLmRhdGEgPSBkYXRhO1xuICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgdGhpcy5ldmVudFBoYXNlID0gMDtcbiAgdGhpcy5wYXRoID0gW107XG4gIHRoaXMucmVjZWl2ZWRUaW1lID0gcmVjZWl2ZWRUaW1lO1xuICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgdGhpcy5zcmNFbGVtZW50ID0gcG9ydDtcbiAgdGhpcy50YXJnZXQgPSBwb3J0O1xuICB0aGlzLnRpbWVTdGFtcCA9IERhdGUubm93KCk7XG4gIHRoaXMudHlwZSA9ICdtaWRpbWVzc2FnZSc7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9taWRpX2FjY2VzcyA9IHJlcXVpcmUoJy4vbWlkaV9hY2Nlc3MnKTtcblxudmFyIF9taWRpX2lucHV0ID0gcmVxdWlyZSgnLi9taWRpX2lucHV0Jyk7XG5cbnZhciBfbWlkaV9vdXRwdXQgPSByZXF1aXJlKCcuL21pZGlfb3V0cHV0Jyk7XG5cbnZhciBfbWlkaW1lc3NhZ2VfZXZlbnQgPSByZXF1aXJlKCcuL21pZGltZXNzYWdlX2V2ZW50Jyk7XG5cbi8qXG4gIG1haW4gZW50cnkgcG9pbnRcbiovXG4vL2ltcG9ydCB7Y3JlYXRlTUlESUFjY2VzcywgY2xvc2VBbGxNSURJSW5wdXRzfSBmcm9tICcuL21pZGlfYWNjZXNzJ1xuLy9pbXBvcnQge3BvbHlmaWxsLCBnZXREZXZpY2V9IGZyb20gJy4vdXRpbCdcblxuXG4oZnVuY3Rpb24gaW5pdFNoaW0oKSB7XG5cbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MgPT09ICd1bmRlZmluZWQnKSB7XG5cbiAgICBnbG9iYWwuTUlESUlucHV0ID0gX21pZGlfaW5wdXQuTUlESUlucHV0O1xuICAgIGdsb2JhbC5NSURJT3V0cHV0ID0gX21pZGlfb3V0cHV0Lk1JRElPdXRwdXQ7XG4gICAgZ2xvYmFsLk1JRElNZXNzYWdlRXZlbnQgPSBfbWlkaW1lc3NhZ2VfZXZlbnQuTUlESU1lc3NhZ2VFdmVudDtcblxuICAgIC8vcG9seWZpbGwoKVxuXG4gICAgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ3dlYm1pZGlhcGlzaGltIDEuMC4xJywgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzKTtcbiAgICAgIHJldHVybiAoMCwgX21pZGlfYWNjZXNzLmNyZWF0ZU1JRElBY2Nlc3MpKCk7XG4gICAgfTtcbiAgICAvKlxuICAgICAgICBpZihnZXREZXZpY2UoKS5ub2RlanMgPT09IHRydWUpe1xuICAgICAgICAgIG5hdmlnYXRvci5jbG9zZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAvLyBOZWVkIHRvIGNsb3NlIE1JREkgaW5wdXQgcG9ydHMsIG90aGVyd2lzZSBOb2RlLmpzIHdpbGwgd2FpdCBmb3IgTUlESSBpbnB1dCBmb3JldmVyLlxuICAgICAgICAgICAgY2xvc2VBbGxNSURJSW5wdXRzKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAqL1xuICB9XG59KSgpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ2VuZXJhdGVVVUlEID0gZ2VuZXJhdGVVVUlEO1xuZXhwb3J0cy5nZXREZXZpY2UgPSBnZXREZXZpY2U7XG5leHBvcnRzLnBvbHlmaWxsUGVyZm9ybWFuY2UgPSBwb2x5ZmlsbFBlcmZvcm1hbmNlO1xuZXhwb3J0cy5wb2x5ZmlsbFByb21pc2UgPSBwb2x5ZmlsbFByb21pc2U7XG5leHBvcnRzLnBvbHlmaWxsID0gcG9seWZpbGw7XG4vKlxuICBBIGNvbGxlY3Rpb24gb2YgaGFuZHkgdXRpbCBtZXRob2RzXG4qL1xuXG5mdW5jdGlvbiBnZW5lcmF0ZVVVSUQoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIHZhciB1dWlkID0gbmV3IEFycmF5KDY0KS5qb2luKCd4Jyk7IC8vJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCc7XG4gIHV1aWQgPSB1dWlkLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24gKGMpIHtcbiAgICB2YXIgciA9IChkICsgTWF0aC5yYW5kb20oKSAqIDE2KSAlIDE2IHwgMDtcbiAgICBkID0gTWF0aC5mbG9vcihkIC8gMTYpO1xuICAgIHJldHVybiAoYyA9PSAneCcgPyByIDogciAmIDB4MyB8IDB4OCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG4gIH0pO1xuICByZXR1cm4gdXVpZDtcbn1cblxudmFyIGRldmljZSA9IHZvaWQgMDtcblxuLy8gY2hlY2sgb24gd2hhdCB0eXBlIG9mIGRldmljZSB3ZSBhcmUgcnVubmluZywgbm90ZSB0aGF0IGluIHRoaXMgY29udGV4dCBhIGRldmljZSBpcyBhIGNvbXB1dGVyIG5vdCBhIE1JREkgZGV2aWNlXG5mdW5jdGlvbiBnZXREZXZpY2UoKSB7XG5cbiAgaWYgKHR5cGVvZiBkZXZpY2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGRldmljZTtcbiAgfVxuXG4gIHZhciBwbGF0Zm9ybSA9ICd1bmRldGVjdGVkJyxcbiAgICAgIGJyb3dzZXIgPSAndW5kZXRlY3RlZCcsXG4gICAgICBub2RlanMgPSBmYWxzZTtcblxuICBpZiAobmF2aWdhdG9yLm5vZGVqcykge1xuICAgIHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybTtcbiAgICBkZXZpY2UgPSB7XG4gICAgICBwbGF0Zm9ybTogcGxhdGZvcm0sXG4gICAgICBub2RlanM6IHRydWUsXG4gICAgICBtb2JpbGU6IHBsYXRmb3JtID09PSAnaW9zJyB8fCBwbGF0Zm9ybSA9PT0gJ2FuZHJvaWQnXG4gICAgfTtcbiAgICByZXR1cm4gZGV2aWNlO1xuICB9XG5cbiAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcblxuICBpZiAodWEubWF0Y2goLyhpUGFkfGlQaG9uZXxpUG9kKS9nKSkge1xuICAgIHBsYXRmb3JtID0gJ2lvcyc7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignQW5kcm9pZCcpICE9PSAtMSkge1xuICAgIHBsYXRmb3JtID0gJ2FuZHJvaWQnO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0xpbnV4JykgIT09IC0xKSB7XG4gICAgcGxhdGZvcm0gPSAnbGludXgnO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ01hY2ludG9zaCcpICE9PSAtMSkge1xuICAgIHBsYXRmb3JtID0gJ29zeCc7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignV2luZG93cycpICE9PSAtMSkge1xuICAgIHBsYXRmb3JtID0gJ3dpbmRvd3MnO1xuICB9XG5cbiAgaWYgKHVhLmluZGV4T2YoJ0Nocm9tZScpICE9PSAtMSkge1xuICAgIC8vIGNocm9tZSwgY2hyb21pdW0gYW5kIGNhbmFyeVxuICAgIGJyb3dzZXIgPSAnY2hyb21lJztcblxuICAgIGlmICh1YS5pbmRleE9mKCdPUFInKSAhPT0gLTEpIHtcbiAgICAgIGJyb3dzZXIgPSAnb3BlcmEnO1xuICAgIH0gZWxzZSBpZiAodWEuaW5kZXhPZignQ2hyb21pdW0nKSAhPT0gLTEpIHtcbiAgICAgIGJyb3dzZXIgPSAnY2hyb21pdW0nO1xuICAgIH1cbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdTYWZhcmknKSAhPT0gLTEpIHtcbiAgICBicm93c2VyID0gJ3NhZmFyaSc7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignRmlyZWZveCcpICE9PSAtMSkge1xuICAgIGJyb3dzZXIgPSAnZmlyZWZveCc7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignVHJpZGVudCcpICE9PSAtMSkge1xuICAgIGJyb3dzZXIgPSAnaWUnO1xuICAgIGlmICh1YS5pbmRleE9mKCdNU0lFIDknKSAhPT0gLTEpIHtcbiAgICAgIGJyb3dzZXIgPSAnaWU5JztcbiAgICB9XG4gIH1cblxuICBpZiAocGxhdGZvcm0gPT09ICdpb3MnKSB7XG4gICAgaWYgKHVhLmluZGV4T2YoJ0NyaU9TJykgIT09IC0xKSB7XG4gICAgICBicm93c2VyID0gJ2Nocm9tZSc7XG4gICAgfVxuICB9XG5cbiAgZGV2aWNlID0ge1xuICAgIHBsYXRmb3JtOiBwbGF0Zm9ybSxcbiAgICBicm93c2VyOiBicm93c2VyLFxuICAgIG1vYmlsZTogcGxhdGZvcm0gPT09ICdpb3MnIHx8IHBsYXRmb3JtID09PSAnYW5kcm9pZCcsXG4gICAgbm9kZWpzOiBmYWxzZVxuICB9O1xuICByZXR1cm4gZGV2aWNlO1xufVxuXG5mdW5jdGlvbiBwb2x5ZmlsbFBlcmZvcm1hbmNlKCkge1xuICBpZiAodHlwZW9mIHBlcmZvcm1hbmNlID09PSAndW5kZWZpbmVkJykge1xuICAgIHBlcmZvcm1hbmNlID0ge307XG4gIH1cbiAgRGF0ZS5ub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gIGlmICh0eXBlb2YgcGVyZm9ybWFuY2Uubm93ID09PSAndW5kZWZpbmVkJykge1xuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbm93T2Zmc2V0ID0gRGF0ZS5ub3coKTtcbiAgICAgIGlmICh0eXBlb2YgcGVyZm9ybWFuY2UudGltaW5nICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbm93T2Zmc2V0ID0gcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydDtcbiAgICAgIH1cbiAgICAgIHBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uIG5vdygpIHtcbiAgICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBub3dPZmZzZXQ7XG4gICAgICB9O1xuICAgIH0pKCk7XG4gIH1cbn1cblxuLy8gYSB2ZXJ5IHNpbXBsZSBpbXBsZW1lbnRhdGlvbiBvZiBhIFByb21pc2UgZm9yIEludGVybmV0IEV4cGxvcmVyIGFuZCBOb2RlanNcbmZ1bmN0aW9uIHBvbHlmaWxsUHJvbWlzZShzY29wZSkge1xuICBpZiAodHlwZW9mIHNjb3BlLlByb21pc2UgIT09ICdmdW5jdGlvbicpIHtcblxuICAgIHNjb3BlLlByb21pc2UgPSBmdW5jdGlvbiAoZXhlY3V0b3IpIHtcbiAgICAgIHRoaXMuZXhlY3V0b3IgPSBleGVjdXRvcjtcbiAgICB9O1xuXG4gICAgc2NvcGUuUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlmICh0eXBlb2YgcmVzb2x2ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXNvbHZlID0gZnVuY3Rpb24gcmVzb2x2ZSgpIHt9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiByZWplY3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmVqZWN0ID0gZnVuY3Rpb24gcmVqZWN0KCkge307XG4gICAgICB9XG4gICAgICB0aGlzLmV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCk7XG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwb2x5ZmlsbCgpIHtcbiAgdmFyIGRldmljZSA9IGdldERldmljZSgpO1xuICBpZiAoZGV2aWNlLmJyb3dzZXIgPT09ICdpZScpIHtcbiAgICBwb2x5ZmlsbFByb21pc2Uod2luZG93KTtcbiAgfSBlbHNlIGlmIChkZXZpY2Uubm9kZWpzID09PSB0cnVlKSB7XG4gICAgcG9seWZpbGxQcm9taXNlKGdsb2JhbCk7XG4gIH1cbiAgcG9seWZpbGxQZXJmb3JtYW5jZSgpO1xufSIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgc2VhcmNoUGFyYW1zOiAnVVJMU2VhcmNoUGFyYW1zJyBpbiBzZWxmLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbiAgZnVuY3Rpb24gaXRlcmF0b3JGb3IoaXRlbXMpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlcmF0b3JcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSwgdGhpcylcblxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBsaXN0ID0gdGhpcy5tYXBbbmFtZV1cbiAgICBpZiAoIWxpc3QpIHtcbiAgICAgIGxpc3QgPSBbXVxuICAgICAgdGhpcy5tYXBbbmFtZV0gPSBsaXN0XG4gICAgfVxuICAgIGxpc3QucHVzaCh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgICByZXR1cm4gdmFsdWVzID8gdmFsdWVzWzBdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSB8fCBbXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IFtub3JtYWxpemVWYWx1ZSh2YWx1ZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLm1hcCkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aGlzLm1hcFtuYW1lXS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIG5hbWUsIHRoaXMpXG4gICAgICB9LCB0aGlzKVxuICAgIH0sIHRoaXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChuYW1lKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IGl0ZW1zLnB1c2godmFsdWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgICB9IGVsc2UgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAvLyBPbmx5IHN1cHBvcnQgQXJyYXlCdWZmZXJzIGZvciBQT1NUIG1ldGhvZC5cbiAgICAgICAgLy8gUmVjZWl2aW5nIEFycmF5QnVmZmVycyBoYXBwZW5zIHZpYSBCbG9icywgaW5zdGVhZC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIHJldHVybiByZWplY3RlZCA/IHJlamVjdGVkIDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuICAgIGlmIChSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IGlucHV0XG4gICAgfVxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSlcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhlYWRlcnMoeGhyKSB7XG4gICAgdmFyIGhlYWQgPSBuZXcgSGVhZGVycygpXG4gICAgdmFyIHBhaXJzID0gKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJykudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgIHBhaXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICB2YXIgc3BsaXQgPSBoZWFkZXIudHJpbSgpLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBzcGxpdC5zaGlmdCgpLnRyaW0oKVxuICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignOicpLnRyaW0oKVxuICAgICAgaGVhZC5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICB9KVxuICAgIHJldHVybiBoZWFkXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXNcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gb3B0aW9ucy5zdGF0dXNUZXh0XG4gICAgdGhpcy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycyA/IG9wdGlvbnMuaGVhZGVycyA6IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3RcbiAgICAgIGlmIChSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSAmJiAhaW5pdCkge1xuICAgICAgICByZXF1ZXN0ID0gaW5wdXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIH1cblxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlVVJMKCkge1xuICAgICAgICBpZiAoJ3Jlc3BvbnNlVVJMJyBpbiB4aHIpIHtcbiAgICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlVVJMXG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdm9pZCBzZWN1cml0eSB3YXJuaW5ncyBvbiBnZXRSZXNwb25zZUhlYWRlciB3aGVuIG5vdCBhbGxvd2VkIGJ5IENPUlNcbiAgICAgICAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICAgICAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzKHhociksXG4gICAgICAgICAgdXJsOiByZXNwb25zZVVSTCgpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsImltcG9ydCBxYW1iaSwge1xuICBnZXRNSURJSW5wdXRzLFxuICBTaW1wbGVTeW50aCxcbiAgZ2V0Tm90ZURhdGEsXG4gIE1JRElFdmVudCxcbiAgTUlESUV2ZW50VHlwZXMsXG4gIENvbnZvbHV0aW9uUmV2ZXJiLFxufSBmcm9tICdxYW1iaSdcblxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblxuICBxYW1iaS5pbml0KHtcbiAgICBzb25nOiB7XG4gICAgICB0eXBlOiAnU29uZycsXG4gICAgICB1cmw6ICcuLi9kYXRhL21pbnV0ZV93YWx0ei5taWQnXG4gICAgfSxcbiAgICBwaWFubzoge1xuICAgICAgdHlwZTogJ0luc3RydW1lbnQnLFxuICAgICAgdXJsOiAnLi4vLi4vaW5zdHJ1bWVudHMvaGVhcnRiZWF0L2NpdHktcGlhbm8tbGlnaHQuanNvbidcbiAgICB9XG4gIH0pXG4gIC50aGVuKG1haW4pXG59KVxuXG5cbmZ1bmN0aW9uIG1haW4oZGF0YSl7XG5cbiAgbGV0IHtzb25nLCBwaWFub30gPSBkYXRhXG4gIGxldCBzeW50aCA9IG5ldyBTaW1wbGVTeW50aCgnc2luZScpXG5cbiAgc29uZy5nZXRUcmFja3MoKS5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICB0cmFjay5zZXRJbnN0cnVtZW50KHBpYW5vKVxuICAgIC8vdHJhY2suc2V0SW5zdHJ1bWVudChzeW50aClcbiAgICAvLyBsaXN0ZW4gdG8gYWxsIGNvbm5lY3RlZCBNSURJIGlucHV0IGRldmljZXNcbiAgICB0cmFjay5jb25uZWN0TUlESUlucHV0cyguLi5nZXRNSURJSW5wdXRzKCkpXG4gICAgLy8gZW5hYmxlIG1vbml0b3IgKGxpa2UgaW4gTG9naWMgYW5kIEN1YmFzZSlcbiAgICB0cmFjay5tb25pdG9yID0gdHJ1ZVxuICB9KVxuXG4gIGxldCBidG5QbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXknKVxuICBsZXQgYnRuUGF1c2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGF1c2UnKVxuICBsZXQgYnRuU3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9wJylcbiAgbGV0IGJ0bkZYID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Z4JylcbiAgbGV0IGRpdkxvYWRpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZycpXG4gIGxldCByYW5nZVBhbm5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYW5uaW5nJylcbiAgbGV0IHJhbmdlUmV2ZXJiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JldmVyYicpXG4gIGRpdkxvYWRpbmcuaW5uZXJIVE1MID0gJydcblxuICBidG5QbGF5LmRpc2FibGVkID0gZmFsc2VcbiAgYnRuUGF1c2UuZGlzYWJsZWQgPSBmYWxzZVxuICBidG5TdG9wLmRpc2FibGVkID0gZmFsc2VcblxuICBidG5QbGF5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzb25nLnBsYXkoKVxuICB9KVxuXG4gIGJ0blBhdXNlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzb25nLnBhdXNlKClcbiAgfSlcblxuICBidG5TdG9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzb25nLnN0b3AoKVxuICB9KVxuXG5cbiAgLy8gY3JlYXRlIGNvbnZvbHV0aW9uIHJldmVyYlxuICBsZXQgaGFzUmV2ZXJiID0gZmFsc2VcbiAgbGV0IHJldmVyYiA9IG5ldyBDb252b2x1dGlvblJldmVyYigpXG4gIHJldmVyYi5sb2FkQnVmZmVyKCcuLi9kYXRhLzEwMC1SZXZlcmIubXAzJylcbiAgLnRoZW4oXG4gICAgKCkgPT4ge1xuICAgICAgYnRuRlguZGlzYWJsZWQgPSBmYWxzZVxuICAgIH0sXG4gICAgZSA9PiBjb25zb2xlLmxvZyhlKVxuICApXG5cbiAgYnRuRlguYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIGhhc1JldmVyYiA9ICFoYXNSZXZlcmJcbiAgICBpZihoYXNSZXZlcmIpe1xuICAgICAgc29uZy5nZXRUcmFja3MoKS5mb3JFYWNoKHQgPT4ge1xuICAgICAgICB0Lmluc2VydEVmZmVjdChyZXZlcmIpXG4gICAgICB9KVxuICAgICAgYnRuRlguaW5uZXJIVE1MID0gJ3JlbW92ZSByZXZlcmInXG4gICAgICByYW5nZVJldmVyYi5kaXNhYmxlZCA9IGZhbHNlXG4gICAgfWVsc2V7XG4gICAgICBzb25nLmdldFRyYWNrcygpLmZvckVhY2godCA9PiB7XG4gICAgICAgIC8vdC5yZW1vdmVFZmZlY3QoMClcbiAgICAgICAgLy90LnJlbW92ZUVmZmVjdChyZXZlcmIpXG4gICAgICAgIHQucmVtb3ZlRWZmZWN0QXQoMClcbiAgICAgIH0pXG4gICAgICBidG5GWC5pbm5lckhUTUwgPSAnYWRkIHJldmVyYidcbiAgICAgIHJhbmdlUmV2ZXJiLmRpc2FibGVkID0gdHJ1ZVxuICAgICAgLy9yYW5nZVJldmVyYi52YWx1ZSA9IDBcbiAgICAgIC8vcmV2ZXJiLnNldEFtb3VudCgwKVxuICAgIH1cbiAgfSlcblxuXG4gIC8vIHZlcnkgcnVkaW1lbnRhbCBvbi1zY3JlZW4ga2V5Ym9hcmRcbiAgbGV0IHRyYWNrID0gc29uZy5nZXRUcmFja3MoKVswXVxuICBsZXQga2V5cyA9IG5ldyBNYXAoKTtcbiAgWydDNCcsICdENCcsICdFNCcsICdGNCcsICdHNCcsICdBNCcsICdCNCddLmZvckVhY2goa2V5ID0+IHtcblxuICAgIGxldCBidG5LZXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkpXG4gICAga2V5cy5zZXQoa2V5LCBidG5LZXkpXG5cbiAgICBidG5LZXkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgc3RhcnROb3RlLCBmYWxzZSlcbiAgICBidG5LZXkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BOb3RlLCBmYWxzZSlcbiAgICBidG5LZXkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBzdG9wTm90ZSwgZmFsc2UpXG4gIH0pXG5cbiAgZnVuY3Rpb24gc3RhcnROb3RlKCl7XG4gICAgbGV0IG5vdGVOdW1iZXIgPSBnZXROb3RlRGF0YSh7ZnVsbE5hbWU6IHRoaXMuaWR9KS5udW1iZXJcbiAgICB0cmFjay5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuTk9URV9PTiwgbm90ZU51bWJlciwgMTAwKSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BOb3RlKCl7XG4gICAgbGV0IG5vdGVOdW1iZXIgPSBnZXROb3RlRGF0YSh7ZnVsbE5hbWU6IHRoaXMuaWR9KS5udW1iZXJcbiAgICB0cmFjay5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuTk9URV9PRkYsIG5vdGVOdW1iZXIpKVxuICB9XG5cbiAgLy8gYWRkIGxpc3RlbmVycyBmb3IgYWxsIG5vdGVvbiBhbmQgbm90ZW9mZiBldmVudHNcbiAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdub3RlT24nLCBlID0+IHtcbiAgICAvLyBjb25zb2xlLmxvZyhlLmRhdGEpXG4gICAgbGV0IGJ0biA9IGtleXMuZ2V0KGUuZGF0YS5mdWxsTm90ZU5hbWUpXG4gICAgLy8gY2hlY2sgaWYgdGhpcyBrZXkgZXhpc3RzIG9uIHRoZSBvbi1zY3JlZW4ga2V5Ym9hcmRcbiAgICBpZihidG4pe1xuICAgICAgYnRuLmNsYXNzTmFtZSA9ICdrZXktZG93bidcbiAgICB9XG4gIH0pXG5cbiAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdub3RlT2ZmJywgZSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2coZS5kYXRhKVxuICAgIGxldCBidG4gPSBrZXlzLmdldChlLmRhdGEuZnVsbE5vdGVOYW1lKVxuICAgIGlmKGJ0bil7XG4gICAgICBidG4uY2xhc3NOYW1lID0gJ2tleS11cCdcbiAgICB9XG4gIH0pXG5cbiAgLy8gc2V0IGFsbCBrZXlzIG9mIHRoZSBvbi1zY3JlZW4ga2V5Ym9hcmQgdG8gdGhlIHVwIHN0YXRlIHdoZW4gdGhlIHNvbmcgc3RvcHMgb3IgcGF1c2VzXG4gIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignc3RvcCcsICgpID0+IHtcbiAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGtleS5jbGFzc05hbWUgPSAna2V5LXVwJ1xuICAgIH0pXG4gIH0pXG5cbiAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdwYXVzZScsICgpID0+IHtcbiAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGtleS5jbGFzc05hbWUgPSAna2V5LXVwJ1xuICAgIH0pXG4gIH0pXG5cbiAgZnVuY3Rpb24gc2V0UGFubmluZyhlKXtcbiAgICBzb25nLmdldFRyYWNrcygpLmZvckVhY2godCA9PiB7XG4gICAgICB0LnNldFBhbm5pbmcoZS50YXJnZXQudmFsdWVBc051bWJlcilcbiAgICB9KVxuICAgIC8vc29uZy5zZXRQYW5uaW5nKGUudGFyZ2V0LnZhbHVlQXNOdW1iZXIpXG4gICAgLy9jb25zb2xlLmxvZyhlLnRhcmdldC52YWx1ZUFzTnVtYmVyKVxuICB9XG5cbiAgcmFuZ2VQYW5uZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZSA9PiB7XG4gICAgcmFuZ2VQYW5uZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2V0UGFubmluZywgZmFsc2UpXG4gIH0pXG5cbiAgcmFuZ2VQYW5uZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGUgPT4ge1xuICAgIHJhbmdlUGFubmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHNldFBhbm5pbmcsIGZhbHNlKVxuICB9KVxuXG5cbiAgZnVuY3Rpb24gc2V0UmV2ZXJiKGUpe1xuICAgIGlmKGhhc1JldmVyYiA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHJldmVyYi5zZXRBbW91bnQoZS50YXJnZXQudmFsdWVBc051bWJlcilcbiAgICAvL2NvbnNvbGUubG9nKGUudGFyZ2V0LnZhbHVlQXNOdW1iZXIpXG4gIH1cblxuICByYW5nZVJldmVyYi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBlID0+IHtcbiAgICByYW5nZVJldmVyYi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBzZXRSZXZlcmIsIGZhbHNlKVxuICB9KVxuXG4gIHJhbmdlUmV2ZXJiLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBlID0+IHtcbiAgICByYW5nZVJldmVyYi5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBzZXRSZXZlcmIsIGZhbHNlKVxuICB9KVxufVxuIl19
