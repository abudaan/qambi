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

  _qambi2.default.init().then(function () {
    main();
  });
});

function main() {
  var song = new _qambi.Song({ bars: 2, autoSize: false });
  var track = new _qambi.Track();
  var part = new _qambi.Part();
  var velocity = 10;
  var noteDuration = 959;
  part.addEvents(new _qambi.MIDIEvent(960 * 0, 144, 60, velocity), new _qambi.MIDIEvent(960 * 0 + noteDuration, 128, 60, 0), new _qambi.MIDIEvent(960 * 1, 144, 62, velocity), new _qambi.MIDIEvent(960 * 1 + noteDuration, 128, 62, 0), new _qambi.MIDIEvent(960 * 2, 144, 64, velocity), new _qambi.MIDIEvent(960 * 2 + noteDuration, 128, 64, 0), new _qambi.MIDIEvent(960 * 3, 144, 65, velocity), new _qambi.MIDIEvent(960 * 3 + noteDuration, 128, 65, 0), new _qambi.MIDIEvent(960 * 4, 144, 67, velocity), new _qambi.MIDIEvent(960 * 4 + noteDuration, 128, 67, 0), new _qambi.MIDIEvent(960 * 5, 144, 65, velocity), new _qambi.MIDIEvent(960 * 5 + noteDuration, 128, 65, 0), new _qambi.MIDIEvent(960 * 6, 144, 64, velocity), new _qambi.MIDIEvent(960 * 6 + noteDuration, 128, 64, 0), new _qambi.MIDIEvent(960 * 7, 144, 62, velocity), new _qambi.MIDIEvent(960 * 7 + noteDuration, 128, 62, 0));

  track.addParts(part);
  track.setInstrument(new _qambi.SimpleSynth('sine'));
  track.connectMIDIOutputs.apply(track, _toConsumableArray((0, _qambi.getMIDIOutputs)()));
  song.addTracks(track);
  song.update();
  song.setLeftLocator('barsbeats', 1);
  song.setRightLocator('barsbeats', 3);

  var btnPlay = document.getElementById('play');
  var btnPause = document.getElementById('pause');
  var btnStop = document.getElementById('stop');
  var btnDelete = document.getElementById('delete');
  var btnLoop = document.getElementById('loop');
  var btnMetronome = document.getElementById('metronome');
  var divTempo = document.getElementById('tempo');
  var divPosition = document.getElementById('position');
  var divPositionTime = document.getElementById('position_time');
  var rangePosition = document.getElementById('playhead');
  var userInteraction = false;
  var deleted = false;
  var looped = false;

  btnPlay.disabled = false;
  btnPause.disabled = false;
  btnStop.disabled = false;
  btnLoop.disabled = false;
  btnDelete.disabled = false;
  btnMetronome.disabled = false;

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

  btnLoop.addEventListener('click', function () {
    looped = !looped;
    if (looped) {
      btnLoop.innerHTML = 'loop off';
    } else {
      btnLoop.innerHTML = 'loop on';
    }
    song.setLoop(looped);
  });

  btnDelete.addEventListener('click', function () {
    deleted = !deleted;
    if (deleted) {
      btnDelete.innerHTML = 'undo remove';
      //track.removeParts(part)
      song.removeParts(track);
      song.update();
    } else {
      btnDelete.innerHTML = 'remove track';
      song.addTrack(track);
      //track.addParts(part)
      song.update();
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

},{"qambi":25}]},{},[49])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZmlsZXNhdmVyanMvRmlsZVNhdmVyLmpzIiwibm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtZmV0Y2gvZmV0Y2gtbnBtLWJyb3dzZXJpZnkuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvY2hhbm5lbF9meC5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2NvbnN0YW50cy5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2NvbnZvbHV0aW9uX3JldmVyYi5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2RlbGF5X2Z4LmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvZXZlbnRsaXN0ZW5lci5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2ZldGNoX2hlbHBlcnMuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9pbml0LmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvaW5pdF9hdWRpby5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2luaXRfbWlkaS5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2luc3RydW1lbnQuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9tZXRyb25vbWUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9taWRpX2V2ZW50LmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvbWlkaV9ub3RlLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvbWlkaV9zdHJlYW0uanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9taWRpZmlsZS5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L25vdGUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9wYXJzZV9hdWRpby5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3BhcnNlX2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3BhcnQuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9wbGF5aGVhZC5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3Bvc2l0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvcWFtYmkuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zYW1wbGUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zYW1wbGVfYnVmZmVyLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2FtcGxlX29zY2lsbGF0b3IuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zYW1wbGVyLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2FtcGxlcy5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3NhdmVfbWlkaWZpbGUuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zY2hlZHVsZXIuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zZXR0aW5ncy5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3NpbXBsZV9zeW50aC5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3NvbmcuanMiLCJub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zb25nLnVwZGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3NvbmdfZnJvbV9taWRpZmlsZS5qcyIsIm5vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3RyYWNrLmpzIiwibm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L2phenpfaW5zdGFuY2UuanMiLCJub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9taWRpX2FjY2Vzcy5qcyIsIm5vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L21pZGlfaW5wdXQuanMiLCJub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9taWRpX291dHB1dC5qcyIsIm5vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L21pZGljb25uZWN0aW9uX2V2ZW50LmpzIiwibm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3QvbWlkaW1lc3NhZ2VfZXZlbnQuanMiLCJub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9zaGltLmpzIiwibm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3QvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDanpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqYkE7Ozs7Ozs7O0FBVUEsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVTs7QUFFdEQsa0JBQU0sSUFBTixHQUNDLElBREQsQ0FDTSxZQUFNO0FBQ1Y7QUFDRCxHQUhEO0FBSUQsQ0FORDs7QUFTQSxTQUFTLElBQVQsR0FBZTtBQUNiLE1BQUksT0FBTyxnQkFBUyxFQUFDLE1BQU0sQ0FBUCxFQUFVLFVBQVUsS0FBcEIsRUFBVCxDQUFYO0FBQ0EsTUFBSSxRQUFRLGtCQUFaO0FBQ0EsTUFBSSxPQUFPLGlCQUFYO0FBQ0EsTUFBSSxXQUFXLEVBQWY7QUFDQSxNQUFJLGVBQWUsR0FBbkI7QUFDQSxPQUFLLFNBQUwsQ0FDRSxxQkFBYyxNQUFNLENBQXBCLEVBQXVCLEdBQXZCLEVBQTRCLEVBQTVCLEVBQWdDLFFBQWhDLENBREYsRUFFRSxxQkFBYyxNQUFNLENBQU4sR0FBVSxZQUF4QixFQUFzQyxHQUF0QyxFQUEyQyxFQUEzQyxFQUErQyxDQUEvQyxDQUZGLEVBR0UscUJBQWMsTUFBTSxDQUFwQixFQUF1QixHQUF2QixFQUE0QixFQUE1QixFQUFnQyxRQUFoQyxDQUhGLEVBSUUscUJBQWMsTUFBTSxDQUFOLEdBQVUsWUFBeEIsRUFBc0MsR0FBdEMsRUFBMkMsRUFBM0MsRUFBK0MsQ0FBL0MsQ0FKRixFQUtFLHFCQUFjLE1BQU0sQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEIsRUFBNUIsRUFBZ0MsUUFBaEMsQ0FMRixFQU1FLHFCQUFjLE1BQU0sQ0FBTixHQUFVLFlBQXhCLEVBQXNDLEdBQXRDLEVBQTJDLEVBQTNDLEVBQStDLENBQS9DLENBTkYsRUFPRSxxQkFBYyxNQUFNLENBQXBCLEVBQXVCLEdBQXZCLEVBQTRCLEVBQTVCLEVBQWdDLFFBQWhDLENBUEYsRUFRRSxxQkFBYyxNQUFNLENBQU4sR0FBVSxZQUF4QixFQUFzQyxHQUF0QyxFQUEyQyxFQUEzQyxFQUErQyxDQUEvQyxDQVJGLEVBU0UscUJBQWMsTUFBTSxDQUFwQixFQUF1QixHQUF2QixFQUE0QixFQUE1QixFQUFnQyxRQUFoQyxDQVRGLEVBVUUscUJBQWMsTUFBTSxDQUFOLEdBQVUsWUFBeEIsRUFBc0MsR0FBdEMsRUFBMkMsRUFBM0MsRUFBK0MsQ0FBL0MsQ0FWRixFQVdFLHFCQUFjLE1BQU0sQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEIsRUFBNUIsRUFBZ0MsUUFBaEMsQ0FYRixFQVlFLHFCQUFjLE1BQU0sQ0FBTixHQUFVLFlBQXhCLEVBQXNDLEdBQXRDLEVBQTJDLEVBQTNDLEVBQStDLENBQS9DLENBWkYsRUFhRSxxQkFBYyxNQUFNLENBQXBCLEVBQXVCLEdBQXZCLEVBQTRCLEVBQTVCLEVBQWdDLFFBQWhDLENBYkYsRUFjRSxxQkFBYyxNQUFNLENBQU4sR0FBVSxZQUF4QixFQUFzQyxHQUF0QyxFQUEyQyxFQUEzQyxFQUErQyxDQUEvQyxDQWRGLEVBZUUscUJBQWMsTUFBTSxDQUFwQixFQUF1QixHQUF2QixFQUE0QixFQUE1QixFQUFnQyxRQUFoQyxDQWZGLEVBZ0JFLHFCQUFjLE1BQU0sQ0FBTixHQUFVLFlBQXhCLEVBQXNDLEdBQXRDLEVBQTJDLEVBQTNDLEVBQStDLENBQS9DLENBaEJGOztBQW1CQSxRQUFNLFFBQU4sQ0FBZSxJQUFmO0FBQ0EsUUFBTSxhQUFOLENBQW9CLHVCQUFnQixNQUFoQixDQUFwQjtBQUNBLFFBQU0sa0JBQU4saUNBQTRCLDRCQUE1QjtBQUNBLE9BQUssU0FBTCxDQUFlLEtBQWY7QUFDQSxPQUFLLE1BQUw7QUFDQSxPQUFLLGNBQUwsQ0FBb0IsV0FBcEIsRUFBaUMsQ0FBakM7QUFDQSxPQUFLLGVBQUwsQ0FBcUIsV0FBckIsRUFBa0MsQ0FBbEM7O0FBRUEsTUFBSSxVQUFVLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFkO0FBQ0EsTUFBSSxXQUFXLFNBQVMsY0FBVCxDQUF3QixPQUF4QixDQUFmO0FBQ0EsTUFBSSxVQUFVLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFkO0FBQ0EsTUFBSSxZQUFZLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUFoQjtBQUNBLE1BQUksVUFBVSxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBZDtBQUNBLE1BQUksZUFBZSxTQUFTLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBbkI7QUFDQSxNQUFJLFdBQVcsU0FBUyxjQUFULENBQXdCLE9BQXhCLENBQWY7QUFDQSxNQUFJLGNBQWMsU0FBUyxjQUFULENBQXdCLFVBQXhCLENBQWxCO0FBQ0EsTUFBSSxrQkFBa0IsU0FBUyxjQUFULENBQXdCLGVBQXhCLENBQXRCO0FBQ0EsTUFBSSxnQkFBZ0IsU0FBUyxjQUFULENBQXdCLFVBQXhCLENBQXBCO0FBQ0EsTUFBSSxrQkFBa0IsS0FBdEI7QUFDQSxNQUFJLFVBQVUsS0FBZDtBQUNBLE1BQUksU0FBUyxLQUFiOztBQUVBLFVBQVEsUUFBUixHQUFtQixLQUFuQjtBQUNBLFdBQVMsUUFBVCxHQUFvQixLQUFwQjtBQUNBLFVBQVEsUUFBUixHQUFtQixLQUFuQjtBQUNBLFVBQVEsUUFBUixHQUFtQixLQUFuQjtBQUNBLFlBQVUsUUFBVixHQUFxQixLQUFyQjtBQUNBLGVBQWEsUUFBYixHQUF3QixLQUF4Qjs7QUFHQSxlQUFhLGdCQUFiLENBQThCLE9BQTlCLEVBQXVDLFlBQVU7QUFDL0MsU0FBSyxZQUFMLEc7QUFDQSxpQkFBYSxTQUFiLEdBQXlCLEtBQUssWUFBTCxHQUFvQixlQUFwQixHQUFzQyxjQUEvRDtBQUNELEdBSEQ7O0FBS0EsVUFBUSxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxZQUFVO0FBQzFDLFNBQUssSUFBTDtBQUNELEdBRkQ7O0FBSUEsV0FBUyxnQkFBVCxDQUEwQixPQUExQixFQUFtQyxZQUFVO0FBQzNDLFNBQUssS0FBTDtBQUNELEdBRkQ7O0FBSUEsVUFBUSxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxZQUFVO0FBQzFDLFNBQUssSUFBTDtBQUNELEdBRkQ7O0FBSUEsVUFBUSxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxZQUFVO0FBQzFDLGFBQVMsQ0FBQyxNQUFWO0FBQ0EsUUFBRyxNQUFILEVBQVU7QUFDUixjQUFRLFNBQVIsR0FBb0IsVUFBcEI7QUFDRCxLQUZELE1BRU07QUFDSixjQUFRLFNBQVIsR0FBb0IsU0FBcEI7QUFDRDtBQUNELFNBQUssT0FBTCxDQUFhLE1BQWI7QUFDRCxHQVJEOztBQVVBLFlBQVUsZ0JBQVYsQ0FBMkIsT0FBM0IsRUFBb0MsWUFBVTtBQUM1QyxjQUFVLENBQUMsT0FBWDtBQUNBLFFBQUcsT0FBSCxFQUFXO0FBQ1QsZ0JBQVUsU0FBVixHQUFzQixhQUF0Qjs7QUFFQSxXQUFLLFdBQUwsQ0FBaUIsS0FBakI7QUFDQSxXQUFLLE1BQUw7QUFDRCxLQUxELE1BS007QUFDSixnQkFBVSxTQUFWLEdBQXNCLGNBQXRCO0FBQ0EsV0FBSyxRQUFMLENBQWMsS0FBZDs7QUFFQSxXQUFLLE1BQUw7QUFDRDtBQUNGLEdBYkQ7O0FBZUEsTUFBSSxXQUFXLEtBQUssV0FBTCxFQUFmO0FBQ0EsY0FBWSxTQUFaLEdBQXdCLFNBQVMsWUFBakM7QUFDQSxrQkFBZ0IsU0FBaEIsR0FBNEIsU0FBUyxZQUFyQztBQUNBLFdBQVMsU0FBVCxlQUErQixTQUFTLEdBQXhDOztBQUVBLE9BQUssZ0JBQUwsQ0FBc0IsVUFBdEIsRUFBa0MsaUJBQVM7QUFDekMsZ0JBQVksU0FBWixHQUF3QixNQUFNLElBQU4sQ0FBVyxZQUFuQztBQUNBLG9CQUFnQixTQUFoQixHQUE0QixNQUFNLElBQU4sQ0FBVyxZQUF2QztBQUNBLGFBQVMsU0FBVCxlQUErQixNQUFNLElBQU4sQ0FBVyxHQUExQztBQUNBLFFBQUcsQ0FBQyxlQUFKLEVBQW9CO0FBQ2xCLG9CQUFjLEtBQWQsR0FBc0IsTUFBTSxJQUFOLENBQVcsVUFBakM7QUFDRDtBQUNGLEdBUEQ7O0FBVUEsZ0JBQWMsZ0JBQWQsQ0FBK0IsU0FBL0IsRUFBMEMsYUFBSztBQUM3QyxrQkFBYyxtQkFBZCxDQUFrQyxXQUFsQyxFQUErQyxhQUEvQztBQUNBLHNCQUFrQixLQUFsQjtBQUNELEdBSEQ7O0FBS0EsZ0JBQWMsZ0JBQWQsQ0FBK0IsV0FBL0IsRUFBNEMsYUFBSztBQUMvQyxlQUFXLFlBQVU7QUFDbkIsV0FBSyxXQUFMLENBQWlCLFlBQWpCLEVBQStCLEVBQUUsTUFBRixDQUFTLGFBQXhDO0FBQ0QsS0FGRCxFQUVHLENBRkg7QUFHQSxrQkFBYyxnQkFBZCxDQUErQixXQUEvQixFQUE0QyxhQUE1QztBQUNBLHNCQUFrQixJQUFsQjtBQUNELEdBTkQ7O0FBUUEsTUFBTSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBUyxDQUFULEVBQVc7QUFDL0IsU0FBSyxXQUFMLENBQWlCLFlBQWpCLEVBQStCLEVBQUUsTUFBRixDQUFTLGFBQXhDO0FBQ0QsR0FGRDtBQUdEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIEZpbGVTYXZlci5qc1xuICogQSBzYXZlQXMoKSBGaWxlU2F2ZXIgaW1wbGVtZW50YXRpb24uXG4gKiAxLjEuMjAxNjAzMjhcbiAqXG4gKiBCeSBFbGkgR3JleSwgaHR0cDovL2VsaWdyZXkuY29tXG4gKiBMaWNlbnNlOiBNSVRcbiAqICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbGlncmV5L0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4gKi9cblxuLypnbG9iYWwgc2VsZiAqL1xuLypqc2xpbnQgYml0d2lzZTogdHJ1ZSwgaW5kZW50OiA0LCBsYXhicmVhazogdHJ1ZSwgbGF4Y29tbWE6IHRydWUsIHNtYXJ0dGFiczogdHJ1ZSwgcGx1c3BsdXM6IHRydWUgKi9cblxuLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cblxudmFyIHNhdmVBcyA9IHNhdmVBcyB8fCAoZnVuY3Rpb24odmlldykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0Ly8gSUUgPDEwIGlzIGV4cGxpY2l0bHkgdW5zdXBwb3J0ZWRcblx0aWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgL01TSUUgWzEtOV1cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyXG5cdFx0ICBkb2MgPSB2aWV3LmRvY3VtZW50XG5cdFx0ICAvLyBvbmx5IGdldCBVUkwgd2hlbiBuZWNlc3NhcnkgaW4gY2FzZSBCbG9iLmpzIGhhc24ndCBvdmVycmlkZGVuIGl0IHlldFxuXHRcdCwgZ2V0X1VSTCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHZpZXcuVVJMIHx8IHZpZXcud2Via2l0VVJMIHx8IHZpZXc7XG5cdFx0fVxuXHRcdCwgc2F2ZV9saW5rID0gZG9jLmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIiwgXCJhXCIpXG5cdFx0LCBjYW5fdXNlX3NhdmVfbGluayA9IFwiZG93bmxvYWRcIiBpbiBzYXZlX2xpbmtcblx0XHQsIGNsaWNrID0gZnVuY3Rpb24obm9kZSkge1xuXHRcdFx0dmFyIGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKTtcblx0XHRcdG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG5cdFx0fVxuXHRcdCwgaXNfc2FmYXJpID0gL1ZlcnNpb25cXC9bXFxkXFwuXSsuKlNhZmFyaS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KVxuXHRcdCwgd2Via2l0X3JlcV9mcyA9IHZpZXcud2Via2l0UmVxdWVzdEZpbGVTeXN0ZW1cblx0XHQsIHJlcV9mcyA9IHZpZXcucmVxdWVzdEZpbGVTeXN0ZW0gfHwgd2Via2l0X3JlcV9mcyB8fCB2aWV3Lm1velJlcXVlc3RGaWxlU3lzdGVtXG5cdFx0LCB0aHJvd19vdXRzaWRlID0gZnVuY3Rpb24oZXgpIHtcblx0XHRcdCh2aWV3LnNldEltbWVkaWF0ZSB8fCB2aWV3LnNldFRpbWVvdXQpKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aHJvdyBleDtcblx0XHRcdH0sIDApO1xuXHRcdH1cblx0XHQsIGZvcmNlX3NhdmVhYmxlX3R5cGUgPSBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiXG5cdFx0LCBmc19taW5fc2l6ZSA9IDBcblx0XHQvLyB0aGUgQmxvYiBBUEkgaXMgZnVuZGFtZW50YWxseSBicm9rZW4gYXMgdGhlcmUgaXMgbm8gXCJkb3dubG9hZGZpbmlzaGVkXCIgZXZlbnQgdG8gc3Vic2NyaWJlIHRvXG5cdFx0LCBhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQgPSAxMDAwICogNDAgLy8gaW4gbXNcblx0XHQsIHJldm9rZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdHZhciByZXZva2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHR9IGVsc2UgeyAvLyBmaWxlIGlzIGEgRmlsZVxuXHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHQvKiAvLyBUYWtlIG5vdGUgVzNDOlxuXHRcdFx0dmFyXG5cdFx0XHQgIHVyaSA9IHR5cGVvZiBmaWxlID09PSBcInN0cmluZ1wiID8gZmlsZSA6IGZpbGUudG9VUkwoKVxuXHRcdFx0LCByZXZva2VyID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdC8vIGlkZWFseSBEb3dubG9hZEZpbmlzaGVkRXZlbnQuZGF0YSB3b3VsZCBiZSB0aGUgVVJMIHJlcXVlc3RlZFxuXHRcdFx0XHRpZiAoZXZ0LmRhdGEgPT09IHVyaSkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRcdGdldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHsgLy8gZmlsZSBpcyBhIEZpbGVcblx0XHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQ7XG5cdFx0XHR2aWV3LmFkZEV2ZW50TGlzdGVuZXIoXCJkb3dubG9hZGZpbmlzaGVkXCIsIHJldm9rZXIpO1xuXHRcdFx0Ki9cblx0XHRcdHNldFRpbWVvdXQocmV2b2tlciwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0KTtcblx0XHR9XG5cdFx0LCBkaXNwYXRjaCA9IGZ1bmN0aW9uKGZpbGVzYXZlciwgZXZlbnRfdHlwZXMsIGV2ZW50KSB7XG5cdFx0XHRldmVudF90eXBlcyA9IFtdLmNvbmNhdChldmVudF90eXBlcyk7XG5cdFx0XHR2YXIgaSA9IGV2ZW50X3R5cGVzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0dmFyIGxpc3RlbmVyID0gZmlsZXNhdmVyW1wib25cIiArIGV2ZW50X3R5cGVzW2ldXTtcblx0XHRcdFx0aWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGxpc3RlbmVyLmNhbGwoZmlsZXNhdmVyLCBldmVudCB8fCBmaWxlc2F2ZXIpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGV4KSB7XG5cdFx0XHRcdFx0XHR0aHJvd19vdXRzaWRlKGV4KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0LCBhdXRvX2JvbSA9IGZ1bmN0aW9uKGJsb2IpIHtcblx0XHRcdC8vIHByZXBlbmQgQk9NIGZvciBVVEYtOCBYTUwgYW5kIHRleHQvKiB0eXBlcyAoaW5jbHVkaW5nIEhUTUwpXG5cdFx0XHRpZiAoL15cXHMqKD86dGV4dFxcL1xcUyp8YXBwbGljYXRpb25cXC94bWx8XFxTKlxcL1xcUypcXCt4bWwpXFxzKjsuKmNoYXJzZXRcXHMqPVxccyp1dGYtOC9pLnRlc3QoYmxvYi50eXBlKSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2IoW1wiXFx1ZmVmZlwiLCBibG9iXSwge3R5cGU6IGJsb2IudHlwZX0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGJsb2I7XG5cdFx0fVxuXHRcdCwgRmlsZVNhdmVyID0gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRmlyc3QgdHJ5IGEuZG93bmxvYWQsIHRoZW4gd2ViIGZpbGVzeXN0ZW0sIHRoZW4gb2JqZWN0IFVSTHNcblx0XHRcdHZhclxuXHRcdFx0XHQgIGZpbGVzYXZlciA9IHRoaXNcblx0XHRcdFx0LCB0eXBlID0gYmxvYi50eXBlXG5cdFx0XHRcdCwgYmxvYl9jaGFuZ2VkID0gZmFsc2Vcblx0XHRcdFx0LCBvYmplY3RfdXJsXG5cdFx0XHRcdCwgdGFyZ2V0X3ZpZXdcblx0XHRcdFx0LCBkaXNwYXRjaF9hbGwgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSB3cml0ZWVuZFwiLnNwbGl0KFwiIFwiKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gb24gYW55IGZpbGVzeXMgZXJyb3JzIHJldmVydCB0byBzYXZpbmcgd2l0aCBvYmplY3QgVVJMc1xuXHRcdFx0XHQsIGZzX2Vycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKHRhcmdldF92aWV3ICYmIGlzX3NhZmFyaSAmJiB0eXBlb2YgRmlsZVJlYWRlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRcdFx0Ly8gU2FmYXJpIGRvZXNuJ3QgYWxsb3cgZG93bmxvYWRpbmcgb2YgYmxvYiB1cmxzXG5cdFx0XHRcdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdFx0XHRcdHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGJhc2U2NERhdGEgPSByZWFkZXIucmVzdWx0O1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gXCJkYXRhOmF0dGFjaG1lbnQvZmlsZVwiICsgYmFzZTY0RGF0YS5zbGljZShiYXNlNjREYXRhLnNlYXJjaCgvWyw7XS8pKTtcblx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7XG5cdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5JTklUO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBkb24ndCBjcmVhdGUgbW9yZSBvYmplY3QgVVJMcyB0aGFuIG5lZWRlZFxuXHRcdFx0XHRcdGlmIChibG9iX2NoYW5nZWQgfHwgIW9iamVjdF91cmwpIHtcblx0XHRcdFx0XHRcdG9iamVjdF91cmwgPSBnZXRfVVJMKCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGFyZ2V0X3ZpZXcpIHtcblx0XHRcdFx0XHRcdHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgbmV3X3RhYiA9IHZpZXcub3BlbihvYmplY3RfdXJsLCBcIl9ibGFua1wiKTtcblx0XHRcdFx0XHRcdGlmIChuZXdfdGFiID09PSB1bmRlZmluZWQgJiYgaXNfc2FmYXJpKSB7XG5cdFx0XHRcdFx0XHRcdC8vQXBwbGUgZG8gbm90IGFsbG93IHdpbmRvdy5vcGVuLCBzZWUgaHR0cDovL2JpdC5seS8xa1pmZlJJXG5cdFx0XHRcdFx0XHRcdHZpZXcubG9jYXRpb24uaHJlZiA9IG9iamVjdF91cmxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRyZXZva2Uob2JqZWN0X3VybCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0LCBhYm9ydGFibGUgPSBmdW5jdGlvbihmdW5jKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKGZpbGVzYXZlci5yZWFkeVN0YXRlICE9PSBmaWxlc2F2ZXIuRE9ORSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0LCBjcmVhdGVfaWZfbm90X2ZvdW5kID0ge2NyZWF0ZTogdHJ1ZSwgZXhjbHVzaXZlOiBmYWxzZX1cblx0XHRcdFx0LCBzbGljZVxuXHRcdFx0O1xuXHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblx0XHRcdGlmICghbmFtZSkge1xuXHRcdFx0XHRuYW1lID0gXCJkb3dubG9hZFwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbl91c2Vfc2F2ZV9saW5rKSB7XG5cdFx0XHRcdG9iamVjdF91cmwgPSBnZXRfVVJMKCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHNhdmVfbGluay5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHRzYXZlX2xpbmsuZG93bmxvYWQgPSBuYW1lO1xuXHRcdFx0XHRcdGNsaWNrKHNhdmVfbGluayk7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHQvLyBPYmplY3QgYW5kIHdlYiBmaWxlc3lzdGVtIFVSTHMgaGF2ZSBhIHByb2JsZW0gc2F2aW5nIGluIEdvb2dsZSBDaHJvbWUgd2hlblxuXHRcdFx0Ly8gdmlld2VkIGluIGEgdGFiLCBzbyBJIGZvcmNlIHNhdmUgd2l0aCBhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cblx0XHRcdC8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkxMTU4XG5cdFx0XHQvLyBVcGRhdGU6IEdvb2dsZSBlcnJhbnRseSBjbG9zZWQgOTExNTgsIEkgc3VibWl0dGVkIGl0IGFnYWluOlxuXHRcdFx0Ly8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTM4OTY0MlxuXHRcdFx0aWYgKHZpZXcuY2hyb21lICYmIHR5cGUgJiYgdHlwZSAhPT0gZm9yY2Vfc2F2ZWFibGVfdHlwZSkge1xuXHRcdFx0XHRzbGljZSA9IGJsb2Iuc2xpY2UgfHwgYmxvYi53ZWJraXRTbGljZTtcblx0XHRcdFx0YmxvYiA9IHNsaWNlLmNhbGwoYmxvYiwgMCwgYmxvYi5zaXplLCBmb3JjZV9zYXZlYWJsZV90eXBlKTtcblx0XHRcdFx0YmxvYl9jaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdC8vIFNpbmNlIEkgY2FuJ3QgYmUgc3VyZSB0aGF0IHRoZSBndWVzc2VkIG1lZGlhIHR5cGUgd2lsbCB0cmlnZ2VyIGEgZG93bmxvYWRcblx0XHRcdC8vIGluIFdlYktpdCwgSSBhcHBlbmQgLmRvd25sb2FkIHRvIHRoZSBmaWxlbmFtZS5cblx0XHRcdC8vIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD02NTQ0MFxuXHRcdFx0aWYgKHdlYmtpdF9yZXFfZnMgJiYgbmFtZSAhPT0gXCJkb3dubG9hZFwiKSB7XG5cdFx0XHRcdG5hbWUgKz0gXCIuZG93bmxvYWRcIjtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlID09PSBmb3JjZV9zYXZlYWJsZV90eXBlIHx8IHdlYmtpdF9yZXFfZnMpIHtcblx0XHRcdFx0dGFyZ2V0X3ZpZXcgPSB2aWV3O1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFyZXFfZnMpIHtcblx0XHRcdFx0ZnNfZXJyb3IoKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0ZnNfbWluX3NpemUgKz0gYmxvYi5zaXplO1xuXHRcdFx0cmVxX2ZzKHZpZXcuVEVNUE9SQVJZLCBmc19taW5fc2l6ZSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZzKSB7XG5cdFx0XHRcdGZzLnJvb3QuZ2V0RGlyZWN0b3J5KFwic2F2ZWRcIiwgY3JlYXRlX2lmX25vdF9mb3VuZCwgYWJvcnRhYmxlKGZ1bmN0aW9uKGRpcikge1xuXHRcdFx0XHRcdHZhciBzYXZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXIuZ2V0RmlsZShuYW1lLCBjcmVhdGVfaWZfbm90X2ZvdW5kLCBhYm9ydGFibGUoZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHRcdFx0XHRmaWxlLmNyZWF0ZVdyaXRlcihhYm9ydGFibGUoZnVuY3Rpb24od3JpdGVyKSB7XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLm9ud3JpdGVlbmQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZiA9IGZpbGUudG9VUkwoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdFx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwid3JpdGVlbmRcIiwgZXZlbnQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV2b2tlKGZpbGUpO1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBlcnJvciA9IHdyaXRlci5lcnJvcjtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChlcnJvci5jb2RlICE9PSBlcnJvci5BQk9SVF9FUlIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZnNfZXJyb3IoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSBhYm9ydFwiLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR3cml0ZXJbXCJvblwiICsgZXZlbnRdID0gZmlsZXNhdmVyW1wib25cIiArIGV2ZW50XTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR3cml0ZXIud3JpdGUoYmxvYik7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR3cml0ZXIuYWJvcnQoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5XUklUSU5HO1xuXHRcdFx0XHRcdFx0XHR9KSwgZnNfZXJyb3IpO1xuXHRcdFx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGRpci5nZXRGaWxlKG5hbWUsIHtjcmVhdGU6IGZhbHNlfSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdC8vIGRlbGV0ZSBmaWxlIGlmIGl0IGFscmVhZHkgZXhpc3RzXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0c2F2ZSgpO1xuXHRcdFx0XHRcdH0pLCBhYm9ydGFibGUoZnVuY3Rpb24oZXgpIHtcblx0XHRcdFx0XHRcdGlmIChleC5jb2RlID09PSBleC5OT1RfRk9VTkRfRVJSKSB7XG5cdFx0XHRcdFx0XHRcdHNhdmUoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSkpO1xuXHRcdFx0XHR9KSwgZnNfZXJyb3IpO1xuXHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHR9XG5cdFx0LCBGU19wcm90byA9IEZpbGVTYXZlci5wcm90b3R5cGVcblx0XHQsIHNhdmVBcyA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbGVTYXZlcihibG9iLCBuYW1lLCBub19hdXRvX2JvbSk7XG5cdFx0fVxuXHQ7XG5cdC8vIElFIDEwKyAobmF0aXZlIHNhdmVBcylcblx0aWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgbmF2aWdhdG9yLm1zU2F2ZU9yT3BlbkJsb2IpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKGJsb2IsIG5hbWUgfHwgXCJkb3dubG9hZFwiKTtcblx0XHR9O1xuXHR9XG5cblx0RlNfcHJvdG8uYWJvcnQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZmlsZXNhdmVyID0gdGhpcztcblx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdGRpc3BhdGNoKGZpbGVzYXZlciwgXCJhYm9ydFwiKTtcblx0fTtcblx0RlNfcHJvdG8ucmVhZHlTdGF0ZSA9IEZTX3Byb3RvLklOSVQgPSAwO1xuXHRGU19wcm90by5XUklUSU5HID0gMTtcblx0RlNfcHJvdG8uRE9ORSA9IDI7XG5cblx0RlNfcHJvdG8uZXJyb3IgPVxuXHRGU19wcm90by5vbndyaXRlc3RhcnQgPVxuXHRGU19wcm90by5vbnByb2dyZXNzID1cblx0RlNfcHJvdG8ub253cml0ZSA9XG5cdEZTX3Byb3RvLm9uYWJvcnQgPVxuXHRGU19wcm90by5vbmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZWVuZCA9XG5cdFx0bnVsbDtcblxuXHRyZXR1cm4gc2F2ZUFzO1xufShcblx0ICAgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgJiYgc2VsZlxuXHR8fCB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvd1xuXHR8fCB0aGlzLmNvbnRlbnRcbikpO1xuLy8gYHNlbGZgIGlzIHVuZGVmaW5lZCBpbiBGaXJlZm94IGZvciBBbmRyb2lkIGNvbnRlbnQgc2NyaXB0IGNvbnRleHRcbi8vIHdoaWxlIGB0aGlzYCBpcyBuc0lDb250ZW50RnJhbWVNZXNzYWdlTWFuYWdlclxuLy8gd2l0aCBhbiBhdHRyaWJ1dGUgYGNvbnRlbnRgIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHdpbmRvd1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cy5zYXZlQXMgPSBzYXZlQXM7XG59IGVsc2UgaWYgKCh0eXBlb2YgZGVmaW5lICE9PSBcInVuZGVmaW5lZFwiICYmIGRlZmluZSAhPT0gbnVsbCkgJiYgKGRlZmluZS5hbWQgIT09IG51bGwpKSB7XG4gIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNhdmVBcztcbiAgfSk7XG59XG4iLCIvLyB0aGUgd2hhdHdnLWZldGNoIHBvbHlmaWxsIGluc3RhbGxzIHRoZSBmZXRjaCgpIGZ1bmN0aW9uXG4vLyBvbiB0aGUgZ2xvYmFsIG9iamVjdCAod2luZG93IG9yIHNlbGYpXG4vL1xuLy8gUmV0dXJuIHRoYXQgYXMgdGhlIGV4cG9ydCBmb3IgdXNlIGluIFdlYnBhY2ssIEJyb3dzZXJpZnkgZXRjLlxucmVxdWlyZSgnd2hhdHdnLWZldGNoJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHNlbGYuZmV0Y2guYmluZChzZWxmKTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5DaGFubmVsRWZmZWN0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIENoYW5uZWxFZmZlY3QgPSBleHBvcnRzLkNoYW5uZWxFZmZlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENoYW5uZWxFZmZlY3QoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENoYW5uZWxFZmZlY3QpO1xuXG4gICAgdGhpcy5pbnB1dCA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMub3V0cHV0ID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVHYWluKCk7XG5cbiAgICB0aGlzLl9kcnkgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl93ZXQgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcblxuICAgIHRoaXMuX2RyeS5nYWluLnZhbHVlID0gMTtcbiAgICB0aGlzLl93ZXQuZ2Fpbi52YWx1ZSA9IDA7XG5cbiAgICB0aGlzLmFtb3VudCA9IDA7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoQ2hhbm5lbEVmZmVjdCwgW3tcbiAgICBrZXk6ICdpbml0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgIHRoaXMuaW5wdXQuY29ubmVjdCh0aGlzLl9kcnkpO1xuICAgICAgdGhpcy5fZHJ5LmNvbm5lY3QodGhpcy5vdXRwdXQpO1xuXG4gICAgICB0aGlzLmlucHV0LmNvbm5lY3QodGhpcy5fbm9kZUZYKTtcbiAgICAgIHRoaXMuX25vZGVGWC5jb25uZWN0KHRoaXMuX3dldCk7XG4gICAgICB0aGlzLl93ZXQuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0QW1vdW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0QW1vdW50KHZhbHVlKSB7XG4gICAgICAvKlxuICAgICAgdGhpcy5hbW91bnQgPSB2YWx1ZSA8IDAgPyAwIDogdmFsdWUgPiAxID8gMSA6IHZhbHVlO1xuICAgICAgdmFyIGdhaW4xID0gTWF0aC5jb3ModGhpcy5hbW91bnQgKiAwLjUgKiBNYXRoLlBJKSxcbiAgICAgICAgICBnYWluMiA9IE1hdGguY29zKCgxLjAgLSB0aGlzLmFtb3VudCkgKiAwLjUgKiBNYXRoLlBJKTtcbiAgICAgIHRoaXMuZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IGdhaW4yICogdGhpcy5yYXRpbztcbiAgICAgICovXG5cbiAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgdmFsdWUgPSAwO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA+IDEpIHtcbiAgICAgICAgdmFsdWUgPSAxO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFtb3VudCA9IHZhbHVlO1xuICAgICAgdGhpcy5fd2V0LmdhaW4udmFsdWUgPSB0aGlzLmFtb3VudDtcbiAgICAgIHRoaXMuX2RyeS5nYWluLnZhbHVlID0gMSAtIHRoaXMuYW1vdW50O1xuICAgICAgLy9jb25zb2xlLmxvZygnd2V0Jyx0aGlzLndldEdhaW4uZ2Fpbi52YWx1ZSwnZHJ5Jyx0aGlzLmRyeUdhaW4uZ2Fpbi52YWx1ZSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIENoYW5uZWxFZmZlY3Q7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG4vLyBzdGFuZGFyZCBNSURJIGV2ZW50c1xudmFyIE1JRElFdmVudFR5cGVzID0ge307XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ05PVEVfT0ZGJywgeyB2YWx1ZTogMHg4MCB9KTsgLy8xMjhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ05PVEVfT04nLCB7IHZhbHVlOiAweDkwIH0pOyAvLzE0NFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUE9MWV9QUkVTU1VSRScsIHsgdmFsdWU6IDB4QTAgfSk7IC8vMTYwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDT05UUk9MX0NIQU5HRScsIHsgdmFsdWU6IDB4QjAgfSk7IC8vMTc2XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQUk9HUkFNX0NIQU5HRScsIHsgdmFsdWU6IDB4QzAgfSk7IC8vMTkyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDSEFOTkVMX1BSRVNTVVJFJywgeyB2YWx1ZTogMHhEMCB9KTsgLy8yMDhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BJVENIX0JFTkQnLCB7IHZhbHVlOiAweEUwIH0pOyAvLzIyNFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1lTVEVNX0VYQ0xVU0lWRScsIHsgdmFsdWU6IDB4RjAgfSk7IC8vMjQwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdNSURJX1RJTUVDT0RFJywgeyB2YWx1ZTogMjQxIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU09OR19QT1NJVElPTicsIHsgdmFsdWU6IDI0MiB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfU0VMRUNUJywgeyB2YWx1ZTogMjQzIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVFVORV9SRVFVRVNUJywgeyB2YWx1ZTogMjQ2IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU9YJywgeyB2YWx1ZTogMjQ3IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNSU5HX0NMT0NLJywgeyB2YWx1ZTogMjQ4IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1RBUlQnLCB7IHZhbHVlOiAyNTAgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDT05USU5VRScsIHsgdmFsdWU6IDI1MSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NUT1AnLCB7IHZhbHVlOiAyNTIgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdBQ1RJVkVfU0VOU0lORycsIHsgdmFsdWU6IDI1NCB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NZU1RFTV9SRVNFVCcsIHsgdmFsdWU6IDI1NSB9KTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVEVNUE8nLCB7IHZhbHVlOiAweDUxIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNRV9TSUdOQVRVUkUnLCB7IHZhbHVlOiAweDU4IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU5EX09GX1RSQUNLJywgeyB2YWx1ZTogMHgyRiB9KTtcblxuZXhwb3J0cy5NSURJRXZlbnRUeXBlcyA9IE1JRElFdmVudFR5cGVzOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuQ29udm9sdXRpb25SZXZlcmIgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG52YXIgX3BhcnNlX2F1ZGlvID0gcmVxdWlyZSgnLi9wYXJzZV9hdWRpbycpO1xuXG52YXIgX2NoYW5uZWxfZnggPSByZXF1aXJlKCcuL2NoYW5uZWxfZngnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgQ29udm9sdXRpb25SZXZlcmIgPSBleHBvcnRzLkNvbnZvbHV0aW9uUmV2ZXJiID0gZnVuY3Rpb24gKF9DaGFubmVsRWZmZWN0KSB7XG4gIF9pbmhlcml0cyhDb252b2x1dGlvblJldmVyYiwgX0NoYW5uZWxFZmZlY3QpO1xuXG4gIGZ1bmN0aW9uIENvbnZvbHV0aW9uUmV2ZXJiKGJ1ZmZlcikge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb252b2x1dGlvblJldmVyYik7XG5cbiAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29udm9sdXRpb25SZXZlcmIpLmNhbGwodGhpcykpO1xuXG4gICAgX3RoaXMuX25vZGVGWCA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlQ29udm9sdmVyKCk7XG4gICAgX3RoaXMuaW5pdCgpO1xuXG4gICAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyKSB7XG4gICAgICBfdGhpcy5fbm9kZUZYLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICB9XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKENvbnZvbHV0aW9uUmV2ZXJiLCBbe1xuICAgIGtleTogJ2FkZEJ1ZmZlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEJ1ZmZlcihidWZmZXIpIHtcbiAgICAgIGlmIChidWZmZXIgaW5zdGFuY2VvZiBBdWRpb0J1ZmZlciA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2FyZ3VtZW50IGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBBdWRpb0J1ZmZlcicsIGJ1ZmZlcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX25vZGVGWC5idWZmZXIgPSBidWZmZXI7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbG9hZEJ1ZmZlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWRCdWZmZXIodXJsKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgKDAsIF9wYXJzZV9hdWRpby5wYXJzZVNhbXBsZXMpKHVybCkudGhlbihmdW5jdGlvbiAoYnVmZmVyKSB7XG4gICAgICAgICAgYnVmZmVyID0gYnVmZmVyWzBdO1xuICAgICAgICAgIGlmIChidWZmZXIgaW5zdGFuY2VvZiBBdWRpb0J1ZmZlcikge1xuICAgICAgICAgICAgX3RoaXMyLl9ub2RlRlguYnVmZmVyID0gYnVmZmVyO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QoJ2NvdWxkIG5vdCBwYXJzZSB0byBBdWRpb0J1ZmZlcicsIHVybCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBDb252b2x1dGlvblJldmVyYjtcbn0oX2NoYW5uZWxfZnguQ2hhbm5lbEVmZmVjdCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5EZWxheSA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfY2hhbm5lbF9meCA9IHJlcXVpcmUoJy4vY2hhbm5lbF9meCcpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENyZWRpdHM6IGh0dHA6Ly9ibG9nLmNocmlzbG93aXMuY28udWsvMjAxNC8wNy8yMy9kdWItZGVsYXktd2ViLWF1ZGlvLWFwaS5odG1sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG52YXIgRGVsYXkgPSBleHBvcnRzLkRlbGF5ID0gZnVuY3Rpb24gKF9DaGFubmVsRWZmZWN0KSB7XG4gIF9pbmhlcml0cyhEZWxheSwgX0NoYW5uZWxFZmZlY3QpO1xuXG4gIGZ1bmN0aW9uIERlbGF5KCkge1xuICAgIHZhciBjb25maWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEZWxheSk7XG5cbiAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRGVsYXkpLmNhbGwodGhpcykpO1xuXG4gICAgX3RoaXMuX25vZGVGWCA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlRGVsYXkoKTtcblxuICAgIHZhciBfY29uZmlnJGRlbGF5VGltZSA9IGNvbmZpZy5kZWxheVRpbWU7XG4gICAgX3RoaXMuZGVsYXlUaW1lID0gX2NvbmZpZyRkZWxheVRpbWUgPT09IHVuZGVmaW5lZCA/IDAuMiA6IF9jb25maWckZGVsYXlUaW1lO1xuICAgIHZhciBfY29uZmlnJGZlZWRiYWNrID0gY29uZmlnLmZlZWRiYWNrO1xuICAgIF90aGlzLmZlZWRiYWNrID0gX2NvbmZpZyRmZWVkYmFjayA9PT0gdW5kZWZpbmVkID8gMC43IDogX2NvbmZpZyRmZWVkYmFjaztcbiAgICB2YXIgX2NvbmZpZyRmcmVxdWVuY3kgPSBjb25maWcuZnJlcXVlbmN5O1xuICAgIF90aGlzLmZyZXF1ZW5jeSA9IF9jb25maWckZnJlcXVlbmN5ID09PSB1bmRlZmluZWQgPyAxMDAwIDogX2NvbmZpZyRmcmVxdWVuY3k7XG5cblxuICAgIF90aGlzLl9ub2RlRlguZGVsYXlUaW1lLnZhbHVlID0gX3RoaXMuZGVsYXlUaW1lO1xuXG4gICAgX3RoaXMuX2ZlZWRiYWNrID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgX3RoaXMuX2ZlZWRiYWNrLmdhaW4udmFsdWUgPSBfdGhpcy5mZWVkYmFjaztcblxuICAgIF90aGlzLl9maWx0ZXIgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xuICAgIF90aGlzLl9maWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gX3RoaXMuZnJlcXVlbmN5O1xuXG4gICAgX3RoaXMuX25vZGVGWC5jb25uZWN0KF90aGlzLl9mZWVkYmFjayk7XG4gICAgX3RoaXMuX2ZlZWRiYWNrLmNvbm5lY3QoX3RoaXMuX2ZpbHRlcik7XG4gICAgX3RoaXMuX2ZpbHRlci5jb25uZWN0KF90aGlzLl9ub2RlRlgpO1xuXG4gICAgX3RoaXMuaW5pdCgpO1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhEZWxheSwgW3tcbiAgICBrZXk6ICdzZXRUaW1lJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VGltZSh2YWx1ZSkge1xuICAgICAgdGhpcy5fbm9kZUZYLmRlbGF5VGltZS52YWx1ZSA9IHRoaXMuZGVsYXlUaW1lID0gdmFsdWU7XG4gICAgICAvL2NvbnNvbGUubG9nKCd0aW1lJywgdmFsdWUpXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0RmVlZGJhY2snLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRGZWVkYmFjayh2YWx1ZSkge1xuICAgICAgdGhpcy5fZmVlZGJhY2suZ2Fpbi52YWx1ZSA9IHRoaXMuZmVlZGJhY2sgPSB2YWx1ZTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2ZlZWRiYWNrJywgdmFsdWUpXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0RnJlcXVlbmN5JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0RnJlcXVlbmN5KHZhbHVlKSB7XG4gICAgICB0aGlzLl9maWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gdGhpcy5mcmVxdWVuY3kgPSB2YWx1ZTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2ZyZXF1ZW5jeScsIHZhbHVlKVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBEZWxheTtcbn0oX2NoYW5uZWxfZnguQ2hhbm5lbEVmZmVjdCk7XG5cbi8qXG4oZnVuY3Rpb24gKCkge1xuICB2YXIgY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuICBhdWRpb0VsZW1lbnQgPSAkKCcjc2xpZGVycyBhdWRpbycpWzBdXG5cbiAgYXVkaW9FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXknLCBmdW5jdGlvbigpe1xuICAgIHNvdXJjZSA9IGN0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UoYXVkaW9FbGVtZW50KTtcblxuICAgIGRlbGF5ID0gY3R4LmNyZWF0ZURlbGF5KCk7XG4gICAgZGVsYXkuZGVsYXlUaW1lLnZhbHVlID0gMC41O1xuXG4gICAgZmVlZGJhY2sgPSBjdHguY3JlYXRlR2FpbigpO1xuICAgIGZlZWRiYWNrLmdhaW4udmFsdWUgPSAwLjg7XG5cbiAgICBmaWx0ZXIgPSBjdHguY3JlYXRlQmlxdWFkRmlsdGVyKCk7XG4gICAgZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IDEwMDA7XG5cbiAgICBkZWxheS5jb25uZWN0KGZlZWRiYWNrKTtcbiAgICBmZWVkYmFjay5jb25uZWN0KGZpbHRlcik7XG4gICAgZmlsdGVyLmNvbm5lY3QoZGVsYXkpO1xuXG4gICAgc291cmNlLmNvbm5lY3QoZGVsYXkpO1xuICAgIHNvdXJjZS5jb25uZWN0KGN0eC5kZXN0aW5hdGlvbik7XG4gICAgZGVsYXkuY29ubmVjdChjdHguZGVzdGluYXRpb24pO1xuICB9KTtcblxuICB2YXIgY29udHJvbHMgPSAkKFwiZGl2I3NsaWRlcnNcIik7XG5cbiAgY29udHJvbHMuZmluZChcImlucHV0W25hbWU9J2RlbGF5VGltZSddXCIpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKCkge1xuICAgIGRlbGF5LmRlbGF5VGltZS52YWx1ZSA9ICQodGhpcykudmFsKCk7XG4gIH0pO1xuXG4gIGNvbnRyb2xzLmZpbmQoXCJpbnB1dFtuYW1lPSdmZWVkYmFjayddXCIpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKCkge1xuICAgIGZlZWRiYWNrLmdhaW4udmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICB9KTtcblxuICBjb250cm9scy5maW5kKFwiaW5wdXRbbmFtZT0nZnJlcXVlbmN5J11cIikub24oJ2lucHV0JywgZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9ICQodGhpcykudmFsKCk7XG4gIH0pO1xufSkoKTtcbiovIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbmV4cG9ydHMuZGlzcGF0Y2hFdmVudCA9IGRpc3BhdGNoRXZlbnQ7XG5leHBvcnRzLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyO1xuZXhwb3J0cy5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcbnZhciBldmVudExpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldmVudCkge1xuICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUpXG4gIHZhciBtYXAgPSB2b2lkIDA7XG5cbiAgaWYgKGV2ZW50LnR5cGUgPT09ICdldmVudCcpIHtcbiAgICB2YXIgbWlkaUV2ZW50ID0gZXZlbnQuZGF0YTtcbiAgICB2YXIgbWlkaUV2ZW50VHlwZSA9IG1pZGlFdmVudC50eXBlO1xuICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50VHlwZSlcbiAgICBpZiAoZXZlbnRMaXN0ZW5lcnMuaGFzKG1pZGlFdmVudFR5cGUpKSB7XG4gICAgICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQobWlkaUV2ZW50VHlwZSk7XG4gICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gbWFwLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBjYiA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgICAgY2IobWlkaUV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudExpc3RlbmVycy5oYXMoZXZlbnQudHlwZSkpXG4gIGlmIChldmVudExpc3RlbmVycy5oYXMoZXZlbnQudHlwZSkgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gbWFwLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICB2YXIgX2NiID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICBfY2IoZXZlbnQpO1xuICAgIH1cblxuICAgIC8vIEB0b2RvOiBydW4gZmlsdGVycyBoZXJlLCBmb3IgaW5zdGFuY2UgaWYgYW4gZXZlbnRsaXN0ZW5lciBoYXMgYmVlbiBhZGRlZCB0byBhbGwgTk9URV9PTiBldmVudHMsIGNoZWNrIHRoZSB0eXBlIG9mIHRoZSBpbmNvbWluZyBldmVudFxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaykge1xuXG4gIHZhciBtYXAgPSB2b2lkIDA7XG4gIHZhciBpZCA9IHR5cGUgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICBpZiAoZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpID09PSBmYWxzZSkge1xuICAgIG1hcCA9IG5ldyBNYXAoKTtcbiAgICBldmVudExpc3RlbmVycy5zZXQodHlwZSwgbWFwKTtcbiAgfSBlbHNlIHtcbiAgICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQodHlwZSk7XG4gIH1cblxuICBtYXAuc2V0KGlkLCBjYWxsYmFjayk7XG4gIC8vY29uc29sZS5sb2coZXZlbnRMaXN0ZW5lcnMpXG4gIHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCkge1xuXG4gIGlmIChldmVudExpc3RlbmVycy5oYXModHlwZSkgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS5sb2coJ25vIGV2ZW50bGlzdGVuZXJzIG9mIHR5cGUnICsgdHlwZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKTtcblxuICBpZiAodHlwZW9mIGlkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zID0gdHJ1ZTtcbiAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzID0gZmFsc2U7XG4gICAgdmFyIF9pdGVyYXRvckVycm9yMyA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IzID0gbWFwLmVudHJpZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMzsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IChfc3RlcDMgPSBfaXRlcmF0b3IzLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zID0gdHJ1ZSkge1xuICAgICAgICB2YXIgX3N0ZXAzJHZhbHVlID0gX3NsaWNlZFRvQXJyYXkoX3N0ZXAzLnZhbHVlLCAyKTtcblxuICAgICAgICB2YXIga2V5ID0gX3N0ZXAzJHZhbHVlWzBdO1xuICAgICAgICB2YXIgdmFsdWUgPSBfc3RlcDMkdmFsdWVbMV07XG5cbiAgICAgICAgY29uc29sZS5sb2coa2V5LCB2YWx1ZSk7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gaWQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAgICAgIGlkID0ga2V5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvcjMgPSB0cnVlO1xuICAgICAgX2l0ZXJhdG9yRXJyb3IzID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zICYmIF9pdGVyYXRvcjMucmV0dXJuKSB7XG4gICAgICAgICAgX2l0ZXJhdG9yMy5yZXR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMykge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBtYXAuZGVsZXRlKGlkKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykge1xuICAgIG1hcC5kZWxldGUoaWQpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdjb3VsZCBub3QgcmVtb3ZlIGV2ZW50bGlzdGVuZXInKTtcbiAgfVxufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5zdGF0dXMgPSBzdGF0dXM7XG5leHBvcnRzLmpzb24gPSBqc29uO1xuZXhwb3J0cy5hcnJheUJ1ZmZlciA9IGFycmF5QnVmZmVyO1xuZXhwb3J0cy5mZXRjaEpTT04gPSBmZXRjaEpTT047XG5leHBvcnRzLmZldGNoQXJyYXlidWZmZXIgPSBmZXRjaEFycmF5YnVmZmVyO1xuLy8gZmV0Y2ggaGVscGVyc1xuXG5mdW5jdGlvbiBzdGF0dXMocmVzcG9uc2UpIHtcbiAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSk7XG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0KSk7XG59XG5cbmZ1bmN0aW9uIGpzb24ocmVzcG9uc2UpIHtcbiAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbn1cblxuZnVuY3Rpb24gYXJyYXlCdWZmZXIocmVzcG9uc2UpIHtcbiAgcmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKCk7XG59XG5cbmZ1bmN0aW9uIGZldGNoSlNPTih1cmwpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAvLyBmZXRjaCh1cmwsIHtcbiAgICAvLyAgIG1vZGU6ICduby1jb3JzJ1xuICAgIC8vIH0pXG4gICAgZmV0Y2godXJsKS50aGVuKHN0YXR1cykudGhlbihqc29uKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICByZXNvbHZlKGRhdGEpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICByZWplY3QoZSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBmZXRjaEFycmF5YnVmZmVyKHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIC8vIGZldGNoKHVybCwge1xuICAgIC8vICAgbW9kZTogJ25vLWNvcnMnXG4gICAgLy8gfSlcbiAgICBmZXRjaCh1cmwpLnRoZW4oc3RhdHVzKS50aGVuKGFycmF5QnVmZmVyKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICByZXNvbHZlKGRhdGEpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICByZWplY3QoZSk7XG4gICAgfSk7XG4gIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuQmxvYiA9IGV4cG9ydHMuckFGID0gZXhwb3J0cy5nZXRVc2VyTWVkaWEgPSB1bmRlZmluZWQ7XG5leHBvcnRzLmluaXQgPSBpbml0O1xuXG52YXIgX3FhbWJpID0gcmVxdWlyZSgnLi9xYW1iaScpO1xuXG52YXIgX3FhbWJpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3FhbWJpKTtcblxudmFyIF9zb25nID0gcmVxdWlyZSgnLi9zb25nJyk7XG5cbnZhciBfc2FtcGxlciA9IHJlcXVpcmUoJy4vc2FtcGxlcicpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9pbml0X21pZGkgPSByZXF1aXJlKCcuL2luaXRfbWlkaScpO1xuXG52YXIgX3NldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgZ2V0VXNlck1lZGlhID0gZXhwb3J0cy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWE7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLndhcm4oJ2dldFVzZXJNZWRpYSBpcyBub3QgYXZhaWxhYmxlJyk7XG4gIH07XG59KCk7XG5cbnZhciByQUYgPSBleHBvcnRzLnJBRiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUud2FybigncmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlzIG5vdCBhdmFpbGFibGUnKTtcbiAgfTtcbn0oKTtcblxudmFyIEJsb2IgPSBleHBvcnRzLkJsb2IgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiB3aW5kb3cuQmxvYiB8fCB3aW5kb3cud2Via2l0QmxvYjtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUud2FybignQmxvYiBpcyBub3QgYXZhaWxhYmxlJyk7XG4gIH07XG59KCk7XG5cbmZ1bmN0aW9uIGxvYWRJbnN0cnVtZW50KGRhdGEpIHtcbiAgdmFyIHNhbXBsZXIgPSBuZXcgX3NhbXBsZXIuU2FtcGxlcigpO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHNhbXBsZXIucGFyc2VTYW1wbGVEYXRhKGRhdGEpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHJlc29sdmUoc2FtcGxlcik7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpbml0KCkge1xuICB2YXIgc2V0dGluZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuXG5cbiAgLy8gbG9hZCBzZXR0aW5ncy5pbnN0cnVtZW50cyAoYXJyYXkgb3Igb2JqZWN0KVxuICAvLyBsb2FkIHNldHRpbmdzLm1pZGlmaWxlcyAoYXJyYXkgb3Igb2JqZWN0KVxuICAvKlxuICAgcWFtYmkuaW5pdCh7XG4gICAgc29uZzoge1xuICAgICAgdHlwZTogJ1NvbmcnLFxuICAgICAgdXJsOiAnLi4vZGF0YS9taW51dGVfd2FsdHoubWlkJ1xuICAgIH0sXG4gICAgcGlhbm86IHtcbiAgICAgIHR5cGU6ICdJbnN0cnVtZW50JyxcbiAgICAgIHVybDogJy4uLy4uL2luc3RydW1lbnRzL2VsZWN0cmljLXBpYW5vLmpzb24nXG4gICAgfVxuICB9KVxuICAgcWFtYmkuaW5pdCh7XG4gICAgaW5zdHJ1bWVudHM6IFsnLi4vaW5zdHJ1bWVudHMvcGlhbm8nLCAnLi4vaW5zdHJ1bWVudHMvdmlvbGluJ10sXG4gICAgbWlkaWZpbGVzOiBbJy4uL21pZGkvbW96YXJ0Lm1pZCddXG4gIH0pXG4gIC50aGVuKChsb2FkZWQpID0+IHtcbiAgICBsZXQgW3BpYW5vLCB2aW9saW5dID0gbG9hZGVkLmluc3RydW1lbnRzXG4gICAgbGV0IFttb3phcnRdID0gbG9hZGVkLm1pZGlmaWxlc1xuICB9KVxuICAgKi9cblxuICB2YXIgcHJvbWlzZXMgPSBbKDAsIF9pbml0X2F1ZGlvLmluaXRBdWRpbykoKSwgKDAsIF9pbml0X21pZGkuaW5pdE1JREkpKCldO1xuICB2YXIgbG9hZEtleXMgPSB2b2lkIDA7XG5cbiAgaWYgKHNldHRpbmdzICE9PSBudWxsKSB7XG5cbiAgICBsb2FkS2V5cyA9IE9iamVjdC5rZXlzKHNldHRpbmdzKTtcbiAgICB2YXIgaSA9IGxvYWRLZXlzLmluZGV4T2YoJ3NldHRpbmdzJyk7XG4gICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICAoMCwgX3NldHRpbmdzLnVwZGF0ZVNldHRpbmdzKShzZXR0aW5ncy5zZXR0aW5ncyk7XG4gICAgICBsb2FkS2V5cy5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2cobG9hZEtleXMpXG5cbiAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGxvYWRLZXlzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICB2YXIga2V5ID0gX3N0ZXAudmFsdWU7XG5cblxuICAgICAgICB2YXIgZGF0YSA9IHNldHRpbmdzW2tleV07XG5cbiAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gJ1NvbmcnKSB7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChfc29uZy5Tb25nLmZyb21NSURJRmlsZShkYXRhLnVybCkpO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gJ0luc3RydW1lbnQnKSB7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChsb2FkSW5zdHJ1bWVudChkYXRhKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICB2YXIgcmV0dXJuT2JqID0ge307XG5cbiAgICAgIHJlc3VsdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhLCBpKSB7XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgLy8gaW5pdEF1ZGlvXG4gICAgICAgICAgcmV0dXJuT2JqLmxlZ2FjeSA9IGRhdGEubGVnYWN5O1xuICAgICAgICAgIHJldHVybk9iai5tcDMgPSBkYXRhLm1wMztcbiAgICAgICAgICByZXR1cm5PYmoub2dnID0gZGF0YS5vZ2c7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMSkge1xuICAgICAgICAgIC8vIGluaXRNSURJXG4gICAgICAgICAgcmV0dXJuT2JqLmphenogPSBkYXRhLmpheno7XG4gICAgICAgICAgcmV0dXJuT2JqLm1pZGkgPSBkYXRhLm1pZGk7XG4gICAgICAgICAgcmV0dXJuT2JqLndlYm1pZGkgPSBkYXRhLndlYm1pZGk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSW5zdHJ1bWVudHMsIHNhbXBsZXMgb3IgTUlESSBmaWxlcyB0aGF0IGdvdCBsb2FkZWQgZHVyaW5nIGluaXRpYWxpemF0aW9uXG4gICAgICAgICAgLy9yZXN1bHRbbG9hZEtleXNbaSAtIDJdXSA9IGRhdGFcbiAgICAgICAgICByZXR1cm5PYmpbbG9hZEtleXNbaSAtIDJdXSA9IGRhdGE7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKHJldHVybk9iai5qYXp6KVxuXG4gICAgICBpZiAocmV0dXJuT2JqLm1pZGkgPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdxYW1iaScsIF9xYW1iaTIuZGVmYXVsdC52ZXJzaW9uLCAnW3lvdXIgYnJvd3NlciBoYXMgbm8gc3VwcG9ydCBmb3IgTUlESV0nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdxYW1iaScsIF9xYW1iaTIuZGVmYXVsdC52ZXJzaW9uKTtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUocmV0dXJuT2JqKTtcbiAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIHJlamVjdChlcnJvcik7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8qXG4gICAgUHJvbWlzZS5hbGwoW2luaXRBdWRpbygpLCBpbml0TUlESSgpXSlcbiAgICAudGhlbihcbiAgICAoZGF0YSkgPT4ge1xuICAgICAgLy8gcGFyc2VBdWRpb1xuICAgICAgbGV0IGRhdGFBdWRpbyA9IGRhdGFbMF1cbiAgXG4gICAgICAvLyBwYXJzZU1JRElcbiAgICAgIGxldCBkYXRhTWlkaSA9IGRhdGFbMV1cbiAgXG4gICAgICBjYWxsYmFjayh7XG4gICAgICAgIGxlZ2FjeTogZGF0YUF1ZGlvLmxlZ2FjeSxcbiAgICAgICAgbXAzOiBkYXRhQXVkaW8ubXAzLFxuICAgICAgICBvZ2c6IGRhdGFBdWRpby5vZ2csXG4gICAgICAgIG1pZGk6IGRhdGFNaWRpLm1pZGksXG4gICAgICAgIHdlYm1pZGk6IGRhdGFNaWRpLndlYm1pZGksXG4gICAgICB9KVxuICAgIH0sXG4gICAgKGVycm9yKSA9PiB7XG4gICAgICBjYWxsYmFjayhlcnJvcilcbiAgICB9KVxuICAqL1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGV4cG9ydHMuZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGV4cG9ydHMuZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBleHBvcnRzLmdldE1hc3RlclZvbHVtZSA9IGV4cG9ydHMuc2V0TWFzdGVyVm9sdW1lID0gZXhwb3J0cy5tYXN0ZXJDb21wcmVzc29yID0gZXhwb3J0cy51bmxvY2tXZWJBdWRpbyA9IGV4cG9ydHMubWFzdGVyR2FpbiA9IGV4cG9ydHMuY29udGV4dCA9IHVuZGVmaW5lZDtcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2V0cyB1cCB0aGUgYmFzaWMgYXVkaW8gcm91dGluZywgdGVzdHMgd2hpY2ggYXVkaW8gZm9ybWF0cyBhcmUgc3VwcG9ydGVkIGFuZCBwYXJzZXMgdGhlIHNhbXBsZXMgZm9yIHRoZSBtZXRyb25vbWUgdGlja3MuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbmV4cG9ydHMuaW5pdEF1ZGlvID0gaW5pdEF1ZGlvO1xuZXhwb3J0cy5nZXRJbml0RGF0YSA9IGdldEluaXREYXRhO1xuXG52YXIgX3NhbXBsZXMgPSByZXF1aXJlKCcuL3NhbXBsZXMnKTtcblxudmFyIF9zYW1wbGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NhbXBsZXMpO1xuXG52YXIgX3BhcnNlX2F1ZGlvID0gcmVxdWlyZSgnLi9wYXJzZV9hdWRpbycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgZGF0YSA9IHZvaWQgMDtcbnZhciBtYXN0ZXJHYWluID0gdm9pZCAwO1xudmFyIGNvbXByZXNzb3IgPSB2b2lkIDA7XG52YXIgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxudmFyIGNvbnRleHQgPSBleHBvcnRzLmNvbnRleHQgPSBmdW5jdGlvbiAoKSB7XG4gIC8vY29uc29sZS5sb2coJ2luaXQgQXVkaW9Db250ZXh0JylcbiAgdmFyIGN0eCA9IHZvaWQgMDtcbiAgaWYgKCh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZih3aW5kb3cpKSA9PT0gJ29iamVjdCcpIHtcbiAgICB2YXIgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuICAgIGlmIChBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XG4gICAgfVxuICB9XG4gIGlmICh0eXBlb2YgY3R4ID09PSAndW5kZWZpbmVkJykge1xuICAgIC8vQFRPRE86IGNyZWF0ZSBkdW1teSBBdWRpb0NvbnRleHQgZm9yIHVzZSBpbiBub2RlLCBzZWU6IGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2F1ZGlvLWNvbnRleHRcbiAgICBleHBvcnRzLmNvbnRleHQgPSBjb250ZXh0ID0ge1xuICAgICAgY3JlYXRlR2FpbjogZnVuY3Rpb24gY3JlYXRlR2FpbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBnYWluOiAxXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgY3JlYXRlT3NjaWxsYXRvcjogZnVuY3Rpb24gY3JlYXRlT3NjaWxsYXRvcigpIHt9XG4gICAgfTtcbiAgfVxuICByZXR1cm4gY3R4O1xufSgpO1xuXG5mdW5jdGlvbiBpbml0QXVkaW8oKSB7XG5cbiAgaWYgKHR5cGVvZiBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW47XG4gIH1cbiAgLy8gY2hlY2sgZm9yIG9sZGVyIGltcGxlbWVudGF0aW9ucyBvZiBXZWJBdWRpb1xuICBkYXRhID0ge307XG4gIHZhciBzb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICBkYXRhLmxlZ2FjeSA9IGZhbHNlO1xuICBpZiAodHlwZW9mIHNvdXJjZS5zdGFydCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBkYXRhLmxlZ2FjeSA9IHRydWU7XG4gIH1cblxuICAvLyBzZXQgdXAgdGhlIGVsZW1lbnRhcnkgYXVkaW8gbm9kZXNcbiAgZXhwb3J0cy5tYXN0ZXJDb21wcmVzc29yID0gY29tcHJlc3NvciA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKCk7XG4gIGNvbXByZXNzb3IuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgZXhwb3J0cy5cbiAgLy9jb25zb2xlLmxvZygnYWxyZWFkeSBkb25lJylcbiAgbWFzdGVyR2FpbiA9IG1hc3RlckdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSAwLjU7XG4gIGluaXRpYWxpemVkID0gdHJ1ZTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgKDAsIF9wYXJzZV9hdWRpby5wYXJzZVNhbXBsZXMpKF9zYW1wbGVzMi5kZWZhdWx0KS50aGVuKGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGJ1ZmZlcnMpIHtcbiAgICAgIC8vY29uc29sZS5sb2coYnVmZmVycylcbiAgICAgIC8vIGRhdGEub2dnID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlPZ2cgIT09ICd1bmRlZmluZWQnXG4gICAgICAvLyBkYXRhLm1wMyA9IHR5cGVvZiBidWZmZXJzLmVtcHR5TXAzICE9PSAndW5kZWZpbmVkJ1xuICAgICAgZGF0YS5sb3d0aWNrID0gYnVmZmVycy5sb3d0aWNrO1xuICAgICAgZGF0YS5oaWdodGljayA9IGJ1ZmZlcnMuaGlnaHRpY2s7XG4gICAgICBpZiAoZGF0YS5vZ2cgPT09IGZhbHNlICYmIGRhdGEubXAzID09PSBmYWxzZSkge1xuICAgICAgICByZWplY3QoJ05vIHN1cHBvcnQgZm9yIG9nZyBub3IgbXAzIScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBvblJlamVjdGVkKCkge1xuICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSBpbml0aWFsaXppbmcgQXVkaW8nKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbnZhciBfc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24gc2V0TWFzdGVyVm9sdW1lKCkge1xuICB2YXIgdmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAwLjUgOiBhcmd1bWVudHNbMF07XG5cbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5zZXRNYXN0ZXJWb2x1bWUgPSBfc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24gc2V0TWFzdGVyVm9sdW1lKCkge1xuICAgICAgdmFyIHZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gMC41IDogYXJndW1lbnRzWzBdO1xuXG4gICAgICBpZiAodmFsdWUgPiAxKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbygnbWF4aW1hbCB2b2x1bWUgaXMgMS4wLCB2b2x1bWUgaXMgc2V0IHRvIDEuMCcpO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB2YWx1ZSA8IDAgPyAwIDogdmFsdWUgPiAxID8gMSA6IHZhbHVlO1xuICAgICAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gdmFsdWU7XG4gICAgfTtcbiAgICBfc2V0TWFzdGVyVm9sdW1lKHZhbHVlKTtcbiAgfVxufTtcblxudmFyIF9nZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbiBnZXRNYXN0ZXJWb2x1bWUoKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0TWFzdGVyVm9sdW1lID0gX2dldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uIGdldE1hc3RlclZvbHVtZSgpIHtcbiAgICAgIHJldHVybiBtYXN0ZXJHYWluLmdhaW4udmFsdWU7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1hc3RlclZvbHVtZSgpO1xuICB9XG59O1xuXG52YXIgX2dldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24gZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24oKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBfZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbiBnZXRDb21wcmVzc2lvblJlZHVjdGlvbigpIHtcbiAgICAgIHJldHVybiBjb21wcmVzc29yLnJlZHVjdGlvbi52YWx1ZTtcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24oKTtcbiAgfVxufTtcblxudmFyIF9lbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24gZW5hYmxlTWFzdGVyQ29tcHJlc3NvcigpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5lbmFibGVNYXN0ZXJDb21wcmVzc29yID0gX2VuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbiBlbmFibGVNYXN0ZXJDb21wcmVzc29yKGZsYWcpIHtcbiAgICAgIGlmIChmbGFnKSB7XG4gICAgICAgIG1hc3RlckdhaW4uZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbXByZXNzb3IpO1xuICAgICAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIGNvbXByZXNzb3IuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9XG4gICAgfTtcbiAgICBfZW5hYmxlTWFzdGVyQ29tcHJlc3NvcigpO1xuICB9XG59O1xuXG52YXIgX2NvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbiBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yKGNmZykge1xuICAvKlxuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGF0dGFjazsgLy8gaW4gU2Vjb25kc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGtuZWU7IC8vIGluIERlY2liZWxzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmF0aW87IC8vIHVuaXQtbGVzc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlZHVjdGlvbjsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWxlYXNlOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gdGhyZXNob2xkOyAvLyBpbiBEZWNpYmVsc1xuICAgICBAc2VlOiBodHRwOi8vd2ViYXVkaW8uZ2l0aHViLmlvL3dlYi1hdWRpby1hcGkvI3RoZS1keW5hbWljc2NvbXByZXNzb3Jub2RlLWludGVyZmFjZVxuICAqL1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBfY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IoY2ZnKSB7XG4gICAgICB2YXIgX2NmZyRhdHRhY2sgPSBjZmcuYXR0YWNrO1xuICAgICAgY29tcHJlc3Nvci5hdHRhY2sgPSBfY2ZnJGF0dGFjayA9PT0gdW5kZWZpbmVkID8gMC4wMDMgOiBfY2ZnJGF0dGFjaztcbiAgICAgIHZhciBfY2ZnJGtuZWUgPSBjZmcua25lZTtcbiAgICAgIGNvbXByZXNzb3Iua25lZSA9IF9jZmcka25lZSA9PT0gdW5kZWZpbmVkID8gMzAgOiBfY2ZnJGtuZWU7XG4gICAgICB2YXIgX2NmZyRyYXRpbyA9IGNmZy5yYXRpbztcbiAgICAgIGNvbXByZXNzb3IucmF0aW8gPSBfY2ZnJHJhdGlvID09PSB1bmRlZmluZWQgPyAxMiA6IF9jZmckcmF0aW87XG4gICAgICB2YXIgX2NmZyRyZWR1Y3Rpb24gPSBjZmcucmVkdWN0aW9uO1xuICAgICAgY29tcHJlc3Nvci5yZWR1Y3Rpb24gPSBfY2ZnJHJlZHVjdGlvbiA9PT0gdW5kZWZpbmVkID8gMCA6IF9jZmckcmVkdWN0aW9uO1xuICAgICAgdmFyIF9jZmckcmVsZWFzZSA9IGNmZy5yZWxlYXNlO1xuICAgICAgY29tcHJlc3Nvci5yZWxlYXNlID0gX2NmZyRyZWxlYXNlID09PSB1bmRlZmluZWQgPyAwLjI1MCA6IF9jZmckcmVsZWFzZTtcbiAgICAgIHZhciBfY2ZnJHRocmVzaG9sZCA9IGNmZy50aHJlc2hvbGQ7XG4gICAgICBjb21wcmVzc29yLnRocmVzaG9sZCA9IF9jZmckdGhyZXNob2xkID09PSB1bmRlZmluZWQgPyAtMjQgOiBfY2ZnJHRocmVzaG9sZDtcbiAgICB9O1xuICAgIF9jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yKGNmZyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldEluaXREYXRhKCkge1xuICByZXR1cm4gZGF0YTtcbn1cblxuLy8gdGhpcyBkb2Vzbid0IHNlZW0gdG8gYmUgbmVjZXNzYXJ5IGFueW1vcmUgb24gaU9TIGFueW1vcmVcbnZhciBfdW5sb2NrV2ViQXVkaW8gPSBmdW5jdGlvbiB1bmxvY2tXZWJBdWRpbygpIHtcbiAgdmFyIHNyYyA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICB2YXIgZ2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDA7XG4gIHNyYy5jb25uZWN0KGdhaW5Ob2RlKTtcbiAgZ2Fpbk5vZGUuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgaWYgKHR5cGVvZiBzcmMubm90ZU9uICE9PSAndW5kZWZpbmVkJykge1xuICAgIHNyYy5zdGFydCA9IHNyYy5ub3RlT247XG4gICAgc3JjLnN0b3AgPSBzcmMubm90ZU9mZjtcbiAgfVxuICBzcmMuc3RhcnQoMCk7XG4gIHNyYy5zdG9wKDAuMDAxKTtcbiAgZXhwb3J0cy51bmxvY2tXZWJBdWRpbyA9IF91bmxvY2tXZWJBdWRpbyA9IGZ1bmN0aW9uIHVubG9ja1dlYkF1ZGlvKCkge307XG59O1xuXG5leHBvcnRzLm1hc3RlckdhaW4gPSBtYXN0ZXJHYWluO1xuZXhwb3J0cy51bmxvY2tXZWJBdWRpbyA9IF91bmxvY2tXZWJBdWRpbztcbmV4cG9ydHMubWFzdGVyQ29tcHJlc3NvciA9IGNvbXByZXNzb3I7XG5leHBvcnRzLnNldE1hc3RlclZvbHVtZSA9IF9zZXRNYXN0ZXJWb2x1bWU7XG5leHBvcnRzLmdldE1hc3RlclZvbHVtZSA9IF9nZXRNYXN0ZXJWb2x1bWU7XG5leHBvcnRzLmdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gX2dldENvbXByZXNzaW9uUmVkdWN0aW9uO1xuZXhwb3J0cy5lbmFibGVNYXN0ZXJDb21wcmVzc29yID0gX2VuYWJsZU1hc3RlckNvbXByZXNzb3I7XG5leHBvcnRzLmNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBfY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvcjsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdldE1JRElJbnB1dEJ5SWQgPSBleHBvcnRzLmdldE1JRElPdXRwdXRCeUlkID0gZXhwb3J0cy5nZXRNSURJSW5wdXRJZHMgPSBleHBvcnRzLmdldE1JRElPdXRwdXRJZHMgPSBleHBvcnRzLmdldE1JRElJbnB1dHMgPSBleHBvcnRzLmdldE1JRElPdXRwdXRzID0gZXhwb3J0cy5nZXRNSURJQWNjZXNzID0gdW5kZWZpbmVkO1xuZXhwb3J0cy5pbml0TUlESSA9IGluaXRNSURJO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxucmVxdWlyZSgnd2VibWlkaWFwaXNoaW0nKTtcblxuLy8geW91IGNhbiBhbHNvIGVtYmVkIHRoZSBzaGltIGFzIGEgc3RhbmQtYWxvbmUgc2NyaXB0IGluIHRoZSBodG1sLCB0aGVuIHlvdSBjYW4gY29tbWVudCB0aGlzIGxpbmUgb3V0XG5cbi8qXG4gIFJlcXVlc3RzIE1JREkgYWNjZXNzLCBxdWVyaWVzIGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgYW5kIHN0b3JlcyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxuKi9cblxudmFyIE1JRElBY2Nlc3MgPSB2b2lkIDA7XG52YXIgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbnZhciBpbnB1dHMgPSBbXTtcbnZhciBvdXRwdXRzID0gW107XG52YXIgaW5wdXRJZHMgPSBbXTtcbnZhciBvdXRwdXRJZHMgPSBbXTtcbnZhciBpbnB1dHNCeUlkID0gbmV3IE1hcCgpO1xudmFyIG91dHB1dHNCeUlkID0gbmV3IE1hcCgpO1xuXG52YXIgc29uZ01pZGlFdmVudExpc3RlbmVyID0gdm9pZCAwO1xudmFyIG1pZGlFdmVudExpc3RlbmVySWQgPSAwO1xuXG5mdW5jdGlvbiBnZXRNSURJcG9ydHMoKSB7XG4gIGlucHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5pbnB1dHMudmFsdWVzKCkpO1xuXG4gIC8vc29ydCBwb3J0cyBieSBuYW1lIGFzY2VuZGluZ1xuICBpbnB1dHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMTtcbiAgfSk7XG5cbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gaW5wdXRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgdmFyIHBvcnQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgaW5wdXRzQnlJZC5zZXQocG9ydC5pZCwgcG9ydCk7XG4gICAgICBpbnB1dElkcy5wdXNoKHBvcnQuaWQpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvdXRwdXRzID0gQXJyYXkuZnJvbShNSURJQWNjZXNzLm91dHB1dHMudmFsdWVzKCkpO1xuXG4gIC8vc29ydCBwb3J0cyBieSBuYW1lIGFzY2VuZGluZ1xuICBvdXRwdXRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYS5uYW1lLnRvTG93ZXJDYXNlKCkgPD0gYi5uYW1lLnRvTG93ZXJDYXNlKCkgPyAxIDogLTE7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IG91dHB1dHNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgIHZhciBfcG9ydCA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhwb3J0LmlkLCBwb3J0Lm5hbWUpXG4gICAgICBvdXRwdXRzQnlJZC5zZXQoX3BvcnQuaWQsIF9wb3J0KTtcbiAgICAgIG91dHB1dElkcy5wdXNoKF9wb3J0LmlkKTtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyhvdXRwdXRzQnlJZClcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXRNSURJKCkge1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3QpIHtcblxuICAgIHZhciBqYXp6ID0gZmFsc2U7XG4gICAgdmFyIG1pZGkgPSBmYWxzZTtcbiAgICB2YXIgd2VibWlkaSA9IGZhbHNlO1xuXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICByZXNvbHZlKHsgbWlkaTogbWlkaSB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG5cbiAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcygpLnRoZW4oZnVuY3Rpb24gb25GdWxGaWxsZWQobWlkaUFjY2Vzcykge1xuICAgICAgICBNSURJQWNjZXNzID0gbWlkaUFjY2VzcztcbiAgICAgICAgLy8gQFRPRE86IGltcGxlbWVudCBzb21ldGhpbmcgaW4gd2VibWlkaWFwaXNoaW0gdGhhdCBhbGxvd3MgdXMgdG8gZGV0ZWN0IHRoZSBKYXp6IHBsdWdpbiB2ZXJzaW9uXG4gICAgICAgIGlmICh0eXBlb2YgbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnamF6eicpO1xuICAgICAgICAgIGphenogPSBtaWRpQWNjZXNzLl9qYXp6SW5zdGFuY2VzWzBdLl9KYXp6LnZlcnNpb247XG4gICAgICAgICAgbWlkaSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2VibWlkaSA9IHRydWU7XG4gICAgICAgICAgbWlkaSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRNSURJcG9ydHMoKTtcblxuICAgICAgICAvLyBvbmNvbm5lY3QgYW5kIG9uZGlzY29ubmVjdCBhcmUgbm90IHlldCBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgYW5kIENocm9taXVtXG4gICAgICAgIG1pZGlBY2Nlc3Mub25jb25uZWN0ID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnZGV2aWNlIGNvbm5lY3RlZCcsIGUpO1xuICAgICAgICAgIGdldE1JRElwb3J0cygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIG1pZGlBY2Nlc3Mub25kaXNjb25uZWN0ID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnZGV2aWNlIGRpc2Nvbm5lY3RlZCcsIGUpO1xuICAgICAgICAgIGdldE1JRElwb3J0cygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgamF6ejogamF6eixcbiAgICAgICAgICBtaWRpOiBtaWRpLFxuICAgICAgICAgIHdlYm1pZGk6IHdlYm1pZGksXG4gICAgICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICAgICAgb3V0cHV0czogb3V0cHV0cyxcbiAgICAgICAgICBpbnB1dHNCeUlkOiBpbnB1dHNCeUlkLFxuICAgICAgICAgIG91dHB1dHNCeUlkOiBvdXRwdXRzQnlJZFxuICAgICAgICB9KTtcbiAgICAgIH0sIGZ1bmN0aW9uIG9uUmVqZWN0KGUpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhlKVxuICAgICAgICAvL3JlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgcmVxdWVzdGluZyBNSURJQWNjZXNzJywgZSlcbiAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKHsgbWlkaTogbWlkaSwgamF6ejogamF6eiB9KTtcbiAgICAgIH0pO1xuICAgICAgLy8gYnJvd3NlcnMgd2l0aG91dCBXZWJNSURJIEFQSVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSh7IG1pZGk6IG1pZGkgfSk7XG4gICAgICB9XG4gIH0pO1xufVxuXG52YXIgX2dldE1JRElBY2Nlc3MgPSBmdW5jdGlvbiBnZXRNSURJQWNjZXNzKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElBY2Nlc3MgPSBfZ2V0TUlESUFjY2VzcyA9IGZ1bmN0aW9uIGdldE1JRElBY2Nlc3MoKSB7XG4gICAgICByZXR1cm4gTUlESUFjY2VzcztcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0TUlESUFjY2VzcygpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydHMuZ2V0TUlESUFjY2VzcyA9IF9nZXRNSURJQWNjZXNzO1xudmFyIF9nZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uIGdldE1JRElPdXRwdXRzKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElPdXRwdXRzID0gX2dldE1JRElPdXRwdXRzID0gZnVuY3Rpb24gZ2V0TUlESU91dHB1dHMoKSB7XG4gICAgICByZXR1cm4gb3V0cHV0cztcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0TUlESU91dHB1dHMoKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElPdXRwdXRzID0gX2dldE1JRElPdXRwdXRzO1xudmFyIF9nZXRNSURJSW5wdXRzID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0cygpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5nZXRNSURJSW5wdXRzID0gX2dldE1JRElJbnB1dHMgPSBmdW5jdGlvbiBnZXRNSURJSW5wdXRzKCkge1xuICAgICAgcmV0dXJuIGlucHV0cztcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0TUlESUlucHV0cygpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydHMuZ2V0TUlESUlucHV0cyA9IF9nZXRNSURJSW5wdXRzO1xudmFyIF9nZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24gZ2V0TUlESU91dHB1dElkcygpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5nZXRNSURJT3V0cHV0SWRzID0gX2dldE1JRElPdXRwdXRJZHMgPSBmdW5jdGlvbiBnZXRNSURJT3V0cHV0SWRzKCkge1xuICAgICAgcmV0dXJuIG91dHB1dElkcztcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0TUlESU91dHB1dElkcygpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydHMuZ2V0TUlESU91dHB1dElkcyA9IF9nZXRNSURJT3V0cHV0SWRzO1xudmFyIF9nZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbiBnZXRNSURJSW5wdXRJZHMoKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0TUlESUlucHV0SWRzID0gX2dldE1JRElJbnB1dElkcyA9IGZ1bmN0aW9uIGdldE1JRElJbnB1dElkcygpIHtcbiAgICAgIHJldHVybiBpbnB1dElkcztcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0TUlESUlucHV0SWRzKCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuZXhwb3J0cy5nZXRNSURJSW5wdXRJZHMgPSBfZ2V0TUlESUlucHV0SWRzO1xudmFyIF9nZXRNSURJT3V0cHV0QnlJZCA9IGZ1bmN0aW9uIGdldE1JRElPdXRwdXRCeUlkKGlkKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0TUlESU91dHB1dEJ5SWQgPSBfZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbiBnZXRNSURJT3V0cHV0QnlJZChfaWQpIHtcbiAgICAgIHJldHVybiBvdXRwdXRzQnlJZC5nZXQoX2lkKTtcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0TUlESU91dHB1dEJ5SWQoaWQpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydHMuZ2V0TUlESU91dHB1dEJ5SWQgPSBfZ2V0TUlESU91dHB1dEJ5SWQ7XG52YXIgX2dldE1JRElJbnB1dEJ5SWQgPSBmdW5jdGlvbiBnZXRNSURJSW5wdXRCeUlkKGlkKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0TUlESUlucHV0QnlJZCA9IF9nZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0QnlJZChfaWQpIHtcbiAgICAgIHJldHVybiBpbnB1dHNCeUlkLmdldChfaWQpO1xuICAgIH07XG4gICAgcmV0dXJuIF9nZXRNSURJSW5wdXRCeUlkKGlkKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNaWRpU29uZyhzb25nKXtcblxuICBzb25nTWlkaUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKXtcbiAgICAvL2NvbnNvbGUubG9nKGUpXG4gICAgaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIGUsIHRoaXMpO1xuICB9O1xuXG4gIC8vIGJ5IGRlZmF1bHQgYSBzb25nIGxpc3RlbnMgdG8gYWxsIGF2YWlsYWJsZSBtaWRpLWluIHBvcnRzXG4gIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHBvcnQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xuXG4gIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlJbnB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgaW5wdXQgPSBpbnB1dHMuZ2V0KGlkKTtcblxuICBpZihpbnB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIGlucHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaUlucHV0cy5kZWxldGUoaWQpO1xuICAgIGlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChpZCwgaW5wdXQpO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlJbnB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaU91dHB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgb3V0cHV0ID0gb3V0cHV0cy5nZXQoaWQpO1xuXG4gIGlmKG91dHB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIG91dHB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLmRlbGV0ZShpZCk7XG4gICAgbGV0IHRpbWUgPSBzb25nLnNjaGVkdWxlci5sYXN0RXZlbnRUaW1lICsgMTAwO1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZSk7IC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lKTsgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gIH1lbHNle1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KGlkLCBvdXRwdXQpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaU91dHB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVNvbmcoc29uZywgbWlkaU1lc3NhZ2VFdmVudCwgaW5wdXQpe1xuICBsZXQgbWlkaUV2ZW50ID0gbmV3IE1pZGlFdmVudChzb25nLnRpY2tzLCAuLi5taWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1pZGlJbnB1dHMsIGlucHV0KTtcblxuXG4gICAgLy9pZihtaWRpRXZlbnQuY2hhbm5lbCA9PT0gdHJhY2suY2hhbm5lbCB8fCB0cmFjay5jaGFubmVsID09PSAwIHx8IHRyYWNrLmNoYW5uZWwgPT09ICdhbnknKXtcbiAgICAvLyAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrKTtcbiAgICAvL31cblxuXG4gICAgLy8gbGlrZSBpbiBDdWJhc2UsIG1pZGkgZXZlbnRzIGZyb20gYWxsIGRldmljZXMsIHNlbnQgb24gYW55IG1pZGkgY2hhbm5lbCBhcmUgZm9yd2FyZGVkIHRvIGFsbCB0cmFja3NcbiAgICAvLyBzZXQgdHJhY2subW9uaXRvciB0byBmYWxzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byByZWNlaXZlIG1pZGkgZXZlbnRzIG9uIGEgY2VydGFpbiB0cmFja1xuICAgIC8vIG5vdGUgdGhhdCB0cmFjay5tb25pdG9yIGlzIGJ5IGRlZmF1bHQgc2V0IHRvIGZhbHNlIGFuZCB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYXV0b21hdGljYWxseSBzZXQgdG8gdHJ1ZVxuICAgIC8vIGlmIHlvdSBhcmUgcmVjb3JkaW5nIG9uIHRoYXQgdHJhY2tcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1vbml0b3IsIHRyYWNrLmlkLCBpbnB1dC5pZCk7XG4gICAgaWYodHJhY2subW9uaXRvciA9PT0gdHJ1ZSAmJiB0cmFjay5taWRpSW5wdXRzLmdldChpbnB1dC5pZCkgIT09IHVuZGVmaW5lZCl7XG4gICAgICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2ssIGlucHV0KTtcbiAgICB9XG4gIH1cblxuICBsZXQgbGlzdGVuZXJzID0gc29uZy5taWRpRXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudC50eXBlKTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIGZvcihsZXQgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH1cbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sodHJhY2ssIG1pZGlFdmVudCwgaW5wdXQpe1xuICBsZXQgc29uZyA9IHRyYWNrLnNvbmcsXG4gICAgbm90ZSwgbGlzdGVuZXJzLCBjaGFubmVsO1xuICAgIC8vZGF0YSA9IG1pZGlNZXNzYWdlRXZlbnQuZGF0YSxcbiAgICAvL21pZGlFdmVudCA9IGNyZWF0ZU1pZGlFdmVudChzb25nLnRpY2tzLCBkYXRhWzBdLCBkYXRhWzFdLCBkYXRhWzJdKTtcblxuICAvL21pZGlFdmVudC5zb3VyY2UgPSBtaWRpTWVzc2FnZUV2ZW50LnNyY0VsZW1lbnQubmFtZTtcbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50KVxuICAvL2NvbnNvbGUubG9nKCctLS0tPicsIG1pZGlFdmVudC50eXBlKTtcblxuICAvLyBhZGQgdGhlIGV4YWN0IHRpbWUgb2YgdGhpcyBldmVudCBzbyB3ZSBjYW4gY2FsY3VsYXRlIGl0cyB0aWNrcyBwb3NpdGlvblxuICBtaWRpRXZlbnQucmVjb3JkTWlsbGlzID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7IC8vIG1pbGxpc1xuICBtaWRpRXZlbnQuc3RhdGUgPSAncmVjb3JkZWQnO1xuXG4gIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgIG5vdGUgPSBjcmVhdGVNaWRpTm90ZShtaWRpRXZlbnQpO1xuICAgIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV0gPSBub3RlO1xuICAgIC8vdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXSA9IG5vdGU7XG4gIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjgpe1xuICAgIG5vdGUgPSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vIGNoZWNrIGlmIHRoZSBub3RlIGV4aXN0czogaWYgdGhlIHVzZXIgcGxheXMgbm90ZXMgb24gaGVyIGtleWJvYXJkIGJlZm9yZSB0aGUgbWlkaSBzeXN0ZW0gaGFzXG4gICAgLy8gYmVlbiBmdWxseSBpbml0aWFsaXplZCwgaXQgY2FuIGhhcHBlbiB0aGF0IHRoZSBmaXJzdCBpbmNvbWluZyBtaWRpIGV2ZW50IGlzIGEgTk9URSBPRkYgZXZlbnRcbiAgICBpZihub3RlID09PSB1bmRlZmluZWQpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KTtcbiAgICBkZWxldGUgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvL2RlbGV0ZSB0cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdO1xuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhzb25nLnByZXJvbGwsIHNvbmcucmVjb3JkaW5nLCB0cmFjay5yZWNvcmRFbmFibGVkKTtcblxuICBpZigoc29uZy5wcmVyb2xsaW5nIHx8IHNvbmcucmVjb3JkaW5nKSAmJiB0cmFjay5yZWNvcmRFbmFibGVkID09PSAnbWlkaScpe1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgICAgdHJhY2suc29uZy5yZWNvcmRlZE5vdGVzLnB1c2gobm90ZSk7XG4gICAgfVxuICAgIHRyYWNrLnJlY29yZFBhcnQuYWRkRXZlbnQobWlkaUV2ZW50KTtcbiAgICAvLyBzb25nLnJlY29yZGVkRXZlbnRzIGlzIHVzZWQgaW4gdGhlIGtleSBlZGl0b3JcbiAgICB0cmFjay5zb25nLnJlY29yZGVkRXZlbnRzLnB1c2gobWlkaUV2ZW50KTtcbiAgfWVsc2UgaWYodHJhY2suZW5hYmxlUmV0cm9zcGVjdGl2ZVJlY29yZGluZyl7XG4gICAgdHJhY2sucmV0cm9zcGVjdGl2ZVJlY29yZGluZy5wdXNoKG1pZGlFdmVudCk7XG4gIH1cblxuICAvLyBjYWxsIGFsbCBtaWRpIGV2ZW50IGxpc3RlbmVyc1xuICBsaXN0ZW5lcnMgPSB0cmFjay5taWRpRXZlbnRMaXN0ZW5lcnNbbWlkaUV2ZW50LnR5cGVdO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgb2JqZWN0Rm9yRWFjaChsaXN0ZW5lcnMsIGZ1bmN0aW9uKGxpc3RlbmVyKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhbm5lbCA9IHRyYWNrLmNoYW5uZWw7XG4gIGlmKGNoYW5uZWwgPT09ICdhbnknIHx8IGNoYW5uZWwgPT09IHVuZGVmaW5lZCB8fCBpc05hTihjaGFubmVsKSA9PT0gdHJ1ZSl7XG4gICAgY2hhbm5lbCA9IDA7XG4gIH1cblxuICBvYmplY3RGb3JFYWNoKHRyYWNrLm1pZGlPdXRwdXRzLCBmdW5jdGlvbihvdXRwdXQpe1xuICAgIC8vY29uc29sZS5sb2coJ21pZGkgb3V0Jywgb3V0cHV0LCBtaWRpRXZlbnQudHlwZSk7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTQ0IHx8IG1pZGlFdmVudC50eXBlID09PSAxNzYpe1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTIpO1xuICAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICAgIC8vIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxOTIpe1xuICAgIC8vICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTFdKTtcbiAgICB9XG4gICAgLy9vdXRwdXQuc2VuZChbbWlkaUV2ZW50LnN0YXR1cyArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gIH0pO1xuXG4gIC8vIEBUT0RPOiBtYXliZSBhIHRyYWNrIHNob3VsZCBiZSBhYmxlIHRvIHNlbmQgaXRzIGV2ZW50IHRvIGJvdGggYSBtaWRpLW91dCBwb3J0IGFuZCBhbiBpbnRlcm5hbCBoZWFydGJlYXQgc29uZz9cbiAgLy9jb25zb2xlLmxvZyh0cmFjay5yb3V0ZVRvTWlkaU91dCk7XG4gIGlmKHRyYWNrLnJvdXRlVG9NaWRpT3V0ID09PSBmYWxzZSl7XG4gICAgbWlkaUV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgdHJhY2suaW5zdHJ1bWVudC5wcm9jZXNzRXZlbnQobWlkaUV2ZW50KTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGFkZE1pZGlFdmVudExpc3RlbmVyKC4uLmFyZ3MpeyAvLyBjYWxsZXIgY2FuIGJlIGEgdHJhY2sgb3IgYSBzb25nXG5cbiAgbGV0IGlkID0gbWlkaUV2ZW50TGlzdGVuZXJJZCsrO1xuICBsZXQgbGlzdGVuZXI7XG4gICAgdHlwZXMgPSB7fSxcbiAgICBpZHMgPSBbXSxcbiAgICBsb29wO1xuXG5cbiAgLy8gc2hvdWxkIEkgaW5saW5lIHRoaXM/XG4gIGxvb3AgPSBmdW5jdGlvbihhcmdzKXtcbiAgICBmb3IobGV0IGFyZyBvZiBhcmdzKXtcbiAgICAgIGxldCB0eXBlID0gdHlwZVN0cmluZyhhcmcpO1xuICAgICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICAgIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICBsb29wKGFyZyk7XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgbGlzdGVuZXIgPSBhcmc7XG4gICAgICB9ZWxzZSBpZihpc05hTihhcmcpID09PSBmYWxzZSl7XG4gICAgICAgIGFyZyA9IHBhcnNlSW50KGFyZywgMTApO1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICBhcmcgPSBzZXF1ZW5jZXIubWlkaUV2ZW50TnVtYmVyQnlOYW1lKGFyZyk7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBsb29wKGFyZ3MsIDAsIGFyZ3MubGVuZ3RoKTtcbiAgLy9jb25zb2xlLmxvZygndHlwZXMnLCB0eXBlcywgJ2xpc3RlbmVyJywgbGlzdGVuZXIpO1xuXG4gIG9iamVjdEZvckVhY2godHlwZXMsIGZ1bmN0aW9uKHR5cGUpe1xuICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgaWYob2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPSB7fTtcbiAgICB9XG4gICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF0gPSBsaXN0ZW5lcjtcbiAgICBpZHMucHVzaCh0eXBlICsgJ18nICsgaWQpO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKG9iai5taWRpRXZlbnRMaXN0ZW5lcnMpO1xuICByZXR1cm4gaWRzLmxlbmd0aCA9PT0gMSA/IGlkc1swXSA6IGlkcztcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcihpZCwgb2JqKXtcbiAgdmFyIHR5cGU7XG4gIGlkID0gaWQuc3BsaXQoJ18nKTtcbiAgdHlwZSA9IGlkWzBdO1xuICBpZCA9IGlkWzFdO1xuICBkZWxldGUgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF07XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXJzKCl7XG5cbn1cblxuKi9cbmV4cG9ydHMuZ2V0TUlESUlucHV0QnlJZCA9IF9nZXRNSURJSW5wdXRCeUlkOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuSW5zdHJ1bWVudCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfZXZlbnRsaXN0ZW5lciA9IHJlcXVpcmUoJy4vZXZlbnRsaXN0ZW5lcicpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgSW5zdHJ1bWVudCA9IGV4cG9ydHMuSW5zdHJ1bWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gSW5zdHJ1bWVudCgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5zdHJ1bWVudCk7XG5cbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW107XG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2U7XG4gICAgdGhpcy5vdXRwdXQgPSBudWxsO1xuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG5cblxuICBfY3JlYXRlQ2xhc3MoSW5zdHJ1bWVudCwgW3tcbiAgICBrZXk6ICdjb25uZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29ubmVjdChvdXRwdXQpIHtcbiAgICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0O1xuICAgIH1cblxuICAgIC8vIG1hbmRhdG9yeVxuXG4gIH0sIHtcbiAgICBrZXk6ICdkaXNjb25uZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzY29ubmVjdCgpIHtcbiAgICAgIHRoaXMub3V0cHV0ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBtYW5kYXRvcnlcblxuICB9LCB7XG4gICAga2V5OiAncHJvY2Vzc01JRElFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciB0aW1lID0gZXZlbnQudGltZSAvIDEwMDA7XG4gICAgICB2YXIgc2FtcGxlID0gdm9pZCAwO1xuXG4gICAgICBpZiAoaXNOYU4odGltZSkpIHtcbiAgICAgICAgLy8gdGhpcyBzaG91bGRuJ3QgaGFwcGVuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2ludmFsaWQgdGltZSB2YWx1ZScpO1xuICAgICAgICByZXR1cm47XG4gICAgICAgIC8vdGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWUgPT09IDApIHtcbiAgICAgICAgLy8gdGhpcyBzaG91bGRuJ3QgaGFwcGVuIC0+IGV4dGVybmFsIE1JREkga2V5Ym9hcmRzXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ3Nob3VsZCBub3QgaGFwcGVuJyk7XG4gICAgICAgIHRpbWUgPSBfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXZlbnQudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coMTQ0LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcblxuICAgICAgICBzYW1wbGUgPSB0aGlzLmNyZWF0ZVNhbXBsZShldmVudCk7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgc2FtcGxlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGUpXG4gICAgICAgIHNhbXBsZS5vdXRwdXQuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gICAgICAgIHNhbXBsZS5zdGFydCh0aW1lKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnc2NoZWR1bGluZycsIGV2ZW50LmlkLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgICAvL2NvbnNvbGUubG9nKCdzdGFydCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09IDEyOCkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coMTI4LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcbiAgICAgICAgICBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZ2V0KGV2ZW50Lm1pZGlOb3RlSWQpO1xuICAgICAgICAgIGlmICh0eXBlb2Ygc2FtcGxlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oJ3NhbXBsZSBub3QgZm91bmQgZm9yIGV2ZW50JywgZXZlbnQuaWQsICcgbWlkaU5vdGUnLCBldmVudC5taWRpTm90ZUlkLCBldmVudClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRoYXQgdGhlIHN1c3RhaW4gcGVkYWwgcHJldmVudHMgdGhlIGFuIGV2ZW50IHRvIHVuc2NoZWR1bGVkXG4gICAgICAgICAgaWYgKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkKVxuICAgICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLnB1c2goZXZlbnQubWlkaU5vdGVJZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3N0b3AnLCB0aW1lLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgICAgICAgICBzYW1wbGUub3V0cHV0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgX3RoaXMuc2NoZWR1bGVkU2FtcGxlcy5kZWxldGUoZXZlbnQubWlkaU5vdGVJZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vc2FtcGxlLnN0b3AodGltZSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gMTc2KSB7XG4gICAgICAgICAgICAvLyBzdXN0YWluIHBlZGFsXG4gICAgICAgICAgICBpZiAoZXZlbnQuZGF0YTEgPT09IDY0KSB7XG4gICAgICAgICAgICAgIGlmIChldmVudC5kYXRhMiA9PT0gMTI3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAvLy8qXG4gICAgICAgICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgICAgICAgICAgZGF0YTogJ2Rvd24nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8qL1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgZG93bicpXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuZGF0YTIgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLmZvckVhY2goZnVuY3Rpb24gKG1pZGlOb3RlSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlID0gX3RoaXMuc2NoZWR1bGVkU2FtcGxlcy5nZXQobWlkaU5vdGVJZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzYW1wbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICAgICAgICAgICAgICAgICAgc2FtcGxlLnN0b3AodGltZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIG1pZGlOb3RlSWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1wbGUub3V0cHV0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNjaGVkdWxlZFNhbXBsZXMuZGVsZXRlKG1pZGlOb3RlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgdXAnLCB0aGlzLnN1c3RhaW5lZFNhbXBsZXMpXG4gICAgICAgICAgICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgIC8vLypcbiAgICAgICAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiAndXAnXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIC8vKi9cbiAgICAgICAgICAgICAgICAgIC8vdGhpcy5zdG9wU3VzdGFpbih0aW1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gcGFubmluZ1xuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5kYXRhMSA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICAvLyBwYW5uaW5nIGlzICpub3QqIGV4YWN0bHkgdGltZWQgLT4gbm90IHBvc3NpYmxlICh5ZXQpIHdpdGggV2ViQXVkaW9cbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEyLCByZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuICAgICAgICAgICAgICAgIC8vdHJhY2suc2V0UGFubmluZyhyZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gdm9sdW1lXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuZGF0YTEgPT09IDcpIHtcbiAgICAgICAgICAgICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBtYW5kYXRvcnlcblxuICB9LCB7XG4gICAga2V5OiAnYWxsTm90ZXNPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhbGxOb3Rlc09mZigpIHtcbiAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdO1xuICAgICAgaWYgKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgIGRhdGE6ICd1cCdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZTtcblxuICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmZvckVhY2goZnVuY3Rpb24gKHNhbXBsZSkge1xuICAgICAgICBzYW1wbGUuc3RvcChfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgc2FtcGxlLm91dHB1dC5kaXNjb25uZWN0KCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5jbGVhcigpO1xuICAgIH1cblxuICAgIC8vIG1hbmRhdG9yeVxuXG4gIH0sIHtcbiAgICBrZXk6ICd1bnNjaGVkdWxlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5zY2hlZHVsZShtaWRpRXZlbnQpIHtcbiAgICAgIHZhciBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZ2V0KG1pZGlFdmVudC5taWRpTm90ZUlkKTtcbiAgICAgIGlmIChzYW1wbGUpIHtcbiAgICAgICAgc2FtcGxlLnN0b3AoX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHNhbXBsZS5vdXRwdXQuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZGVsZXRlKG1pZGlFdmVudC5taWRpTm90ZUlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gSW5zdHJ1bWVudDtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLk1ldHJvbm9tZSA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF90cmFjayA9IHJlcXVpcmUoJy4vdHJhY2snKTtcblxudmFyIF9wYXJ0MyA9IHJlcXVpcmUoJy4vcGFydCcpO1xuXG52YXIgX3BhcnNlX2V2ZW50cyA9IHJlcXVpcmUoJy4vcGFyc2VfZXZlbnRzJyk7XG5cbnZhciBfbWlkaV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaV9ldmVudCcpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9wb3NpdGlvbiA9IHJlcXVpcmUoJy4vcG9zaXRpb24nKTtcblxudmFyIF9zYW1wbGVyID0gcmVxdWlyZSgnLi9zYW1wbGVyJyk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG52YXIgX2NvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgbWV0aG9kTWFwID0gbmV3IE1hcChbWyd2b2x1bWUnLCAnc2V0Vm9sdW1lJ10sIFsnaW5zdHJ1bWVudCcsICdzZXRJbnN0cnVtZW50J10sIFsnbm90ZU51bWJlckFjY2VudGVkVGljaycsICdzZXROb3RlTnVtYmVyQWNjZW50ZWRUaWNrJ10sIFsnbm90ZU51bWJlck5vbkFjY2VudGVkVGljaycsICdzZXROb3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJ10sIFsndmVsb2NpdHlBY2NlbnRlZFRpY2snLCAnc2V0VmVsb2NpdHlBY2NlbnRlZFRpY2snXSwgWyd2ZWxvY2l0eU5vbkFjY2VudGVkVGljaycsICdzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljayddLCBbJ25vdGVMZW5ndGhBY2NlbnRlZFRpY2snLCAnc2V0Tm90ZUxlbmd0aEFjY2VudGVkVGljayddLCBbJ25vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snLCAnc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayddXSk7XG5cbnZhciBNZXRyb25vbWUgPSBleHBvcnRzLk1ldHJvbm9tZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTWV0cm9ub21lKHNvbmcpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWV0cm9ub21lKTtcblxuICAgIHRoaXMuc29uZyA9IHNvbmc7XG4gICAgdGhpcy50cmFjayA9IG5ldyBfdHJhY2suVHJhY2soeyBuYW1lOiB0aGlzLnNvbmcuaWQgKyAnX21ldHJvbm9tZScgfSk7XG4gICAgdGhpcy5wYXJ0ID0gbmV3IF9wYXJ0My5QYXJ0KCk7XG4gICAgdGhpcy50cmFjay5hZGRQYXJ0cyh0aGlzLnBhcnQpO1xuICAgIHRoaXMudHJhY2suX2dhaW5Ob2RlLmNvbm5lY3QodGhpcy5zb25nLl9nYWluTm9kZSk7XG5cbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSBbXTtcbiAgICB0aGlzLnByZWNvdW50RHVyYXRpb24gPSAwO1xuICAgIHRoaXMuYmFycyA9IDA7XG4gICAgdGhpcy5pbmRleCA9IDA7XG4gICAgdGhpcy5pbmRleDIgPSAwO1xuICAgIHRoaXMucHJlY291bnRJbmRleCA9IDA7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1ldHJvbm9tZSwgW3tcbiAgICBrZXk6ICdyZXNldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuXG4gICAgICB2YXIgZGF0YSA9ICgwLCBfaW5pdF9hdWRpby5nZXRJbml0RGF0YSkoKTtcbiAgICAgIHZhciBpbnN0cnVtZW50ID0gbmV3IF9zYW1wbGVyLlNhbXBsZXIoJ21ldHJvbm9tZScpO1xuICAgICAgaW5zdHJ1bWVudC51cGRhdGVTYW1wbGVEYXRhKHtcbiAgICAgICAgbm90ZTogNjAsXG4gICAgICAgIGJ1ZmZlcjogZGF0YS5sb3d0aWNrXG4gICAgICB9LCB7XG4gICAgICAgIG5vdGU6IDYxLFxuICAgICAgICBidWZmZXI6IGRhdGEuaGlnaHRpY2tcbiAgICAgIH0pO1xuICAgICAgdGhpcy50cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpO1xuXG4gICAgICB0aGlzLnZvbHVtZSA9IDE7XG5cbiAgICAgIHRoaXMubm90ZU51bWJlckFjY2VudGVkID0gNjE7XG4gICAgICB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZCA9IDYwO1xuXG4gICAgICB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgPSAxMDA7XG4gICAgICB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQgPSAxMDA7XG5cbiAgICAgIHRoaXMubm90ZUxlbmd0aEFjY2VudGVkID0gdGhpcy5zb25nLnBwcSAvIDQ7IC8vIHNpeHRlZW50aCBub3RlcyAtPiBkb24ndCBtYWtlIHRoaXMgdG9vIHNob3J0IGlmIHlvdXIgc2FtcGxlIGhhcyBhIGxvbmcgYXR0YWNrIVxuICAgICAgdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQgPSB0aGlzLnNvbmcucHBxIC8gNDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjcmVhdGVFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhcikge1xuICAgICAgdmFyIGlkID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gJ2luaXQnIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICB2YXIgaSA9IHZvaWQgMCxcbiAgICAgICAgICBqID0gdm9pZCAwO1xuICAgICAgdmFyIHBvc2l0aW9uID0gdm9pZCAwO1xuICAgICAgdmFyIHZlbG9jaXR5ID0gdm9pZCAwO1xuICAgICAgdmFyIG5vdGVMZW5ndGggPSB2b2lkIDA7XG4gICAgICB2YXIgbm90ZU51bWJlciA9IHZvaWQgMDtcbiAgICAgIHZhciBiZWF0c1BlckJhciA9IHZvaWQgMDtcbiAgICAgIHZhciB0aWNrc1BlckJlYXQgPSB2b2lkIDA7XG4gICAgICB2YXIgdGlja3MgPSAwO1xuICAgICAgdmFyIG5vdGVPbiA9IHZvaWQgMCxcbiAgICAgICAgICBub3RlT2ZmID0gdm9pZCAwO1xuICAgICAgdmFyIGV2ZW50cyA9IFtdO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKHN0YXJ0QmFyLCBlbmRCYXIpO1xuXG4gICAgICBmb3IgKGkgPSBzdGFydEJhcjsgaSA8PSBlbmRCYXI7IGkrKykge1xuICAgICAgICBwb3NpdGlvbiA9ICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMuc29uZywge1xuICAgICAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgICAgIHRhcmdldDogW2ldXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGJlYXRzUGVyQmFyID0gcG9zaXRpb24ubm9taW5hdG9yO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBwb3NpdGlvbi50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRpY2tzID0gcG9zaXRpb24udGlja3M7XG5cbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGJlYXRzUGVyQmFyOyBqKyspIHtcblxuICAgICAgICAgIG5vdGVOdW1iZXIgPSBqID09PSAwID8gdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgOiB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZDtcbiAgICAgICAgICBub3RlTGVuZ3RoID0gaiA9PT0gMCA/IHRoaXMubm90ZUxlbmd0aEFjY2VudGVkIDogdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQ7XG4gICAgICAgICAgdmVsb2NpdHkgPSBqID09PSAwID8gdGhpcy52ZWxvY2l0eUFjY2VudGVkIDogdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkO1xuXG4gICAgICAgICAgbm90ZU9uID0gbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMTQ0LCBub3RlTnVtYmVyLCB2ZWxvY2l0eSk7XG4gICAgICAgICAgbm90ZU9mZiA9IG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MgKyBub3RlTGVuZ3RoLCAxMjgsIG5vdGVOdW1iZXIsIDApO1xuXG4gICAgICAgICAgaWYgKGlkID09PSAncHJlY291bnQnKSB7XG4gICAgICAgICAgICBub3RlT24uX3RyYWNrID0gdGhpcy50cmFjaztcbiAgICAgICAgICAgIG5vdGVPZmYuX3RyYWNrID0gdGhpcy50cmFjaztcbiAgICAgICAgICAgIG5vdGVPbi5fcGFydCA9IHt9O1xuICAgICAgICAgICAgbm90ZU9mZi5fcGFydCA9IHt9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5vdGVPbiwgbm90ZU9mZik7XG4gICAgICAgICAgdGlja3MgKz0gdGlja3NQZXJCZWF0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBldmVudHM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0RXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RXZlbnRzKCkge1xuICAgICAgdmFyIHN0YXJ0QmFyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgdmFyIF9wYXJ0O1xuXG4gICAgICB2YXIgZW5kQmFyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gdGhpcy5zb25nLmJhcnMgOiBhcmd1bWVudHNbMV07XG4gICAgICB2YXIgaWQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAnaW5pdCcgOiBhcmd1bWVudHNbMl07XG5cbiAgICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcy5wYXJ0LmdldEV2ZW50cygpKTtcbiAgICAgIHRoaXMuZXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgaWQpO1xuICAgICAgKF9wYXJ0ID0gdGhpcy5wYXJ0KS5hZGRFdmVudHMuYXBwbHkoX3BhcnQsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmV2ZW50cykpO1xuICAgICAgdGhpcy5iYXJzID0gdGhpcy5zb25nLmJhcnM7XG4gICAgICAvL2NvbnNvbGUubG9nKCdnZXRFdmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICAgIHRoaXMuYWxsRXZlbnRzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmV2ZW50cyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnNvbmcuX3RpbWVFdmVudHMpKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuYWxsRXZlbnRzKVxuICAgICAgKDAsIF91dGlsLnNvcnRFdmVudHMpKHRoaXMuYWxsRXZlbnRzKTtcbiAgICAgICgwLCBfcGFyc2VfZXZlbnRzLnBhcnNlTUlESU5vdGVzKSh0aGlzLmV2ZW50cyk7XG4gICAgICByZXR1cm4gdGhpcy5ldmVudHM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0SW5kZXgyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0SW5kZXgyKG1pbGxpcykge1xuICAgICAgdGhpcy5pbmRleDIgPSAwO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50czInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFdmVudHMyKG1heHRpbWUsIHRpbWVTdGFtcCkge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy5pbmRleDIsIG1heGkgPSB0aGlzLmFsbEV2ZW50cy5sZW5ndGg7IGkgPCBtYXhpOyBpKyspIHtcblxuICAgICAgICB2YXIgZXZlbnQgPSB0aGlzLmFsbEV2ZW50c1tpXTtcblxuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcy5URU1QTyB8fCBldmVudC50eXBlID09PSBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLlRJTUVfU0lHTkFUVVJFKSB7XG4gICAgICAgICAgaWYgKGV2ZW50Lm1pbGxpcyA8IG1heHRpbWUpIHtcbiAgICAgICAgICAgIHRoaXMubWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gICAgICAgICAgICB0aGlzLmluZGV4MisrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIG1pbGxpcyA9IGV2ZW50LnRpY2tzICogdGhpcy5taWxsaXNQZXJUaWNrO1xuICAgICAgICAgIGlmIChtaWxsaXMgPCBtYXh0aW1lKSB7XG4gICAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZVN0YW1wO1xuICAgICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgdGhpcy5pbmRleDIrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEV2ZW50cygpIHtcbiAgICAgIHZhciBzdGFydEJhciA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgIHZhciBfZXZlbnRzLCBfcGFydDI7XG5cbiAgICAgIHZhciBlbmRCYXIgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB0aGlzLnNvbmcuYmFycyA6IGFyZ3VtZW50c1sxXTtcbiAgICAgIHZhciBpZCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/ICdhZGQnIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyhzdGFydEJhciwgZW5kQmFyKVxuICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIGlkKTtcbiAgICAgIChfZXZlbnRzID0gdGhpcy5ldmVudHMpLnB1c2guYXBwbHkoX2V2ZW50cywgX3RvQ29uc3VtYWJsZUFycmF5KGV2ZW50cykpO1xuICAgICAgKF9wYXJ0MiA9IHRoaXMucGFydCkuYWRkRXZlbnRzLmFwcGx5KF9wYXJ0MiwgX3RvQ29uc3VtYWJsZUFycmF5KGV2ZW50cykpO1xuICAgICAgdGhpcy5iYXJzID0gZW5kQmFyO1xuICAgICAgLy9jb25zb2xlLmxvZygnZ2V0RXZlbnRzICVPJywgdGhpcy5ldmVudHMsIGVuZEJhcilcbiAgICAgIHJldHVybiBldmVudHM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY3JlYXRlUHJlY291bnRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVQcmVjb3VudEV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCB0aW1lU3RhbXApIHtcblxuICAgICAgdGhpcy50aW1lU3RhbXAgPSB0aW1lU3RhbXA7XG5cbiAgICAgIC8vICAgbGV0IHNvbmdTdGFydFBvc2l0aW9uID0gdGhpcy5zb25nLmdldFBvc2l0aW9uKClcblxuICAgICAgdmFyIHNvbmdTdGFydFBvc2l0aW9uID0gKDAsIF9wb3NpdGlvbi5jYWxjdWxhdGVQb3NpdGlvbikodGhpcy5zb25nLCB7XG4gICAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgICB0YXJnZXQ6IFtzdGFydEJhcl0sXG4gICAgICAgIHJlc3VsdDogJ21pbGxpcydcbiAgICAgIH0pO1xuICAgICAgLy9jb25zb2xlLmxvZygnc3RhckJhcicsIHNvbmdTdGFydFBvc2l0aW9uLmJhcilcblxuICAgICAgdmFyIGVuZFBvcyA9ICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMuc29uZywge1xuICAgICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgICAgLy90YXJnZXQ6IFtzb25nU3RhcnRQb3NpdGlvbi5iYXIgKyBwcmVjb3VudCwgc29uZ1N0YXJ0UG9zaXRpb24uYmVhdCwgc29uZ1N0YXJ0UG9zaXRpb24uc2l4dGVlbnRoLCBzb25nU3RhcnRQb3NpdGlvbi50aWNrXSxcbiAgICAgICAgdGFyZ2V0OiBbZW5kQmFyXSxcbiAgICAgICAgcmVzdWx0OiAnbWlsbGlzJ1xuICAgICAgfSk7XG5cbiAgICAgIC8vY29uc29sZS5sb2coc29uZ1N0YXJ0UG9zaXRpb24sIGVuZFBvcylcblxuICAgICAgdGhpcy5wcmVjb3VudEluZGV4ID0gMDtcbiAgICAgIHRoaXMuc3RhcnRNaWxsaXMgPSBzb25nU3RhcnRQb3NpdGlvbi5taWxsaXM7XG4gICAgICB0aGlzLmVuZE1pbGxpcyA9IGVuZFBvcy5taWxsaXM7XG4gICAgICB0aGlzLnByZWNvdW50RHVyYXRpb24gPSBlbmRQb3MubWlsbGlzIC0gdGhpcy5zdGFydE1pbGxpcztcblxuICAgICAgLy8gZG8gdGhpcyBzbyB5b3UgY2FuIHN0YXJ0IHByZWNvdW50aW5nIGF0IGFueSBwb3NpdGlvbiBpbiB0aGUgc29uZ1xuICAgICAgdGhpcy50aW1lU3RhbXAgLT0gdGhpcy5zdGFydE1pbGxpcztcblxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnByZWNvdW50RHVyYXRpb24sIHRoaXMuc3RhcnRNaWxsaXMsIHRoaXMuZW5kTWlsbGlzKVxuXG4gICAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciAtIDEsICdwcmVjb3VudCcpO1xuICAgICAgdGhpcy5wcmVjb3VudEV2ZW50cyA9ICgwLCBfcGFyc2VfZXZlbnRzLnBhcnNlRXZlbnRzKShbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuc29uZy5fdGltZUV2ZW50cyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnByZWNvdW50RXZlbnRzKSkpO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKHNvbmdTdGFydFBvc2l0aW9uLmJhciwgZW5kUG9zLmJhciwgcHJlY291bnQsIHRoaXMucHJlY291bnRFdmVudHMubGVuZ3RoKTtcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5wcmVjb3VudEV2ZW50cy5sZW5ndGgsIHRoaXMucHJlY291bnREdXJhdGlvbik7XG4gICAgICByZXR1cm4gdGhpcy5wcmVjb3VudER1cmF0aW9uO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFByZWNvdW50SW5kZXgnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQcmVjb3VudEluZGV4KG1pbGxpcykge1xuICAgICAgdmFyIGkgPSAwO1xuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHRoaXMuZXZlbnRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBldmVudCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpIHtcbiAgICAgICAgICAgIHRoaXMucHJlY291bnRJbmRleCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2codGhpcy5wcmVjb3VudEluZGV4KTtcbiAgICB9XG5cbiAgICAvLyBjYWxsZWQgYnkgc2NoZWR1bGVyLmpzXG5cbiAgfSwge1xuICAgIGtleTogJ2dldFByZWNvdW50RXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UHJlY291bnRFdmVudHMobWF4dGltZSkge1xuICAgICAgdmFyIGV2ZW50cyA9IHRoaXMucHJlY291bnRFdmVudHMsXG4gICAgICAgICAgbWF4aSA9IGV2ZW50cy5sZW5ndGgsXG4gICAgICAgICAgaSA9IHZvaWQgMCxcbiAgICAgICAgICBldnQgPSB2b2lkIDAsXG4gICAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICAgIC8vbWF4dGltZSArPSB0aGlzLnByZWNvdW50RHVyYXRpb25cblxuICAgICAgZm9yIChpID0gdGhpcy5wcmVjb3VudEluZGV4OyBpIDwgbWF4aTsgaSsrKSB7XG4gICAgICAgIGV2dCA9IGV2ZW50c1tpXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWxsaXMsIG1heHRpbWUsIHRoaXMubWlsbGlzKTtcbiAgICAgICAgaWYgKGV2dC5taWxsaXMgPCBtYXh0aW1lKSB7XG4gICAgICAgICAgZXZ0LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2dC5taWxsaXM7XG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZ0KTtcbiAgICAgICAgICB0aGlzLnByZWNvdW50SW5kZXgrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyhyZXN1bHQubGVuZ3RoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbXV0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG11dGUoZmxhZykge1xuICAgICAgdGhpcy50cmFjay5tdXRlZCA9IGZsYWc7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWxsTm90ZXNPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhbGxOb3Rlc09mZigpIHtcbiAgICAgIHRoaXMudHJhY2suX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKTtcbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PSBDT05GSUdVUkFUSU9OID09PT09PT09PT09XG5cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZUNvbmZpZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUNvbmZpZygpIHtcbiAgICAgIHRoaXMuaW5pdCgxLCB0aGlzLmJhcnMsICd1cGRhdGUnKTtcbiAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKTtcbiAgICAgIHRoaXMuc29uZy51cGRhdGUoKTtcbiAgICB9XG5cbiAgICAvLyBhZGRlZCB0byBwdWJsaWMgQVBJOiBTb25nLmNvbmZpZ3VyZU1ldHJvbm9tZSh7fSlcblxuICB9LCB7XG4gICAga2V5OiAnY29uZmlndXJlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29uZmlndXJlKGNvbmZpZykge1xuXG4gICAgICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB0aGlzW21ldGhvZE1hcC5nZXQoa2V5KV0oY29uZmlnLmtleSk7XG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRJbnN0cnVtZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KSB7XG4gICAgICBpZiAoIWluc3RydW1lbnQgaW5zdGFuY2VvZiBJbnN0cnVtZW50KSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignbm90IGFuIGluc3RhbmNlIG9mIEluc3RydW1lbnQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy50cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpO1xuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXROb3RlTGVuZ3RoQWNjZW50ZWRUaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Tm90ZUxlbmd0aEFjY2VudGVkVGljayh2YWx1ZSkge1xuICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA9IHZhbHVlO1xuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXROb3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayh2YWx1ZSkge1xuICAgICAgaWYgKGlzTmFOKHZhbHVlKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRWZWxvY2l0eUFjY2VudGVkVGljaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFZlbG9jaXR5QWNjZW50ZWRUaWNrKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9ICgwLCBfdXRpbC5jaGVja01JRElOdW1iZXIpKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy52ZWxvY2l0eUFjY2VudGVkID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VmVsb2NpdHlOb25BY2NlbnRlZFRpY2sodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gKDAsIF91dGlsLmNoZWNrTUlESU51bWJlcikodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSBmYWxzZSkge1xuICAgICAgICB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0Tm90ZU51bWJlckFjY2VudGVkVGljaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2sodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gKDAsIF91dGlsLmNoZWNrTUlESU51bWJlcikodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSBmYWxzZSkge1xuICAgICAgICB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXROb3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljayh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSAoMCwgX3V0aWwuY2hlY2tNSURJTnVtYmVyKSh2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgIT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFZvbHVtZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFZvbHVtZSh2YWx1ZSkge1xuICAgICAgdGhpcy50cmFjay5zZXRWb2x1bWUodmFsdWUpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNZXRyb25vbWU7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5NSURJRXZlbnQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7IC8vIEAgZmxvd1xuXG5cbnZhciBfbm90ZSA9IHJlcXVpcmUoJy4vbm90ZScpO1xuXG52YXIgX3NldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG5cbnZhciBNSURJRXZlbnQgPSBleHBvcnRzLk1JRElFdmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTUlESUV2ZW50KHRpY2tzLCB0eXBlLCBkYXRhMSkge1xuICAgIHZhciBkYXRhMiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/IC0xIDogYXJndW1lbnRzWzNdO1xuICAgIHZhciBjaGFubmVsID0gYXJndW1lbnRzLmxlbmd0aCA8PSA0IHx8IGFyZ3VtZW50c1s0XSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1s0XTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJRXZlbnQpO1xuXG4gICAgdGhpcy5pZCA9IHRoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMudGlja3MgPSB0aWNrcztcbiAgICB0aGlzLmRhdGExID0gZGF0YTE7XG4gICAgdGhpcy5kYXRhMiA9IGRhdGEyO1xuICAgIHRoaXMucGl0Y2ggPSAoMCwgX3NldHRpbmdzLmdldFNldHRpbmdzKSgpLnBpdGNoO1xuXG4gICAgLyogdGVzdCB3aGV0aGVyIHR5cGUgaXMgYSBzdGF0dXMgYnl0ZSBvciBhIGNvbW1hbmQ6ICovXG5cbiAgICAvLyAxLiB0aGUgaGlnaGVyIDQgYml0cyBvZiB0aGUgc3RhdHVzIGJ5dGUgZm9ybSB0aGUgY29tbWFuZFxuICAgIHRoaXMudHlwZSA9ICh0eXBlID4+IDQpICogMTY7XG4gICAgLy90aGlzLnR5cGUgPSB0aGlzLmNvbW1hbmQgPSAodHlwZSA+PiA0KSAqIDE2XG5cbiAgICAvLyAyLiBmaWx0ZXIgY2hhbm5lbCBldmVudHNcbiAgICBpZiAodGhpcy50eXBlID49IDB4ODAgJiYgdGhpcy50eXBlIDw9IDB4RTApIHtcbiAgICAgIC8vIDMuIGdldCB0aGUgY2hhbm5lbCBudW1iZXJcbiAgICAgIGlmIChjaGFubmVsID4gMCkge1xuICAgICAgICAvLyBhIGNoYW5uZWwgaXMgc2V0LCB0aGlzIG92ZXJydWxlcyB0aGUgY2hhbm5lbCBudW1iZXIgaW4gdGhlIHN0YXR1cyBieXRlXG4gICAgICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBleHRyYWN0IHRoZSBjaGFubmVsIGZyb20gdGhlIHN0YXR1cyBieXRlOiB0aGUgbG93ZXIgNCBiaXRzIG9mIHRoZSBzdGF0dXMgYnl0ZSBmb3JtIHRoZSBjaGFubmVsIG51bWJlclxuICAgICAgICB0aGlzLmNoYW5uZWwgPSB0eXBlICYgMHhGO1xuICAgICAgfVxuICAgICAgLy90aGlzLnN0YXR1cyA9IHRoaXMuY29tbWFuZCArIHRoaXMuY2hhbm5lbFxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIDQuIG5vdCBhIGNoYW5uZWwgZXZlbnQsIHNldCB0aGUgdHlwZSBhbmQgY29tbWFuZCB0byB0aGUgdmFsdWUgb2YgdHlwZSBhcyBwcm92aWRlZCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgLy90aGlzLnR5cGUgPSB0aGlzLmNvbW1hbmQgPSB0eXBlXG4gICAgICAgIHRoaXMuY2hhbm5lbCA9IDA7IC8vIGFueVxuICAgICAgfVxuICAgIC8vY29uc29sZS5sb2codHlwZSwgdGhpcy50eXBlLCB0aGlzLmNvbW1hbmQsIHRoaXMuc3RhdHVzLCB0aGlzLmNoYW5uZWwsIHRoaXMuaWQpXG5cbiAgICAvLyBzb21ldGltZXMgTk9URV9PRkYgZXZlbnRzIGFyZSBzZW50IGFzIE5PVEVfT04gZXZlbnRzIHdpdGggYSAwIHZlbG9jaXR5IHZhbHVlXG4gICAgaWYgKHR5cGUgPT09IDE0NCAmJiBkYXRhMiA9PT0gMCkge1xuICAgICAgdGhpcy50eXBlID0gMTI4O1xuICAgIH1cblxuICAgIHRoaXMuX3BhcnQgPSBudWxsO1xuICAgIHRoaXMuX3RyYWNrID0gbnVsbDtcbiAgICB0aGlzLl9zb25nID0gbnVsbDtcblxuICAgIGlmICh0eXBlID09PSAxNDQgfHwgdHlwZSA9PT0gMTI4KSB7XG4gICAgICB2YXIgX2dldE5vdGVEYXRhID0gKDAsIF9ub3RlLmdldE5vdGVEYXRhKSh7IG51bWJlcjogZGF0YTEgfSk7XG5cbiAgICAgIHRoaXMubm90ZU5hbWUgPSBfZ2V0Tm90ZURhdGEubmFtZTtcbiAgICAgIHRoaXMuZnVsbE5vdGVOYW1lID0gX2dldE5vdGVEYXRhLmZ1bGxOYW1lO1xuICAgICAgdGhpcy5mcmVxdWVuY3kgPSBfZ2V0Tm90ZURhdGEuZnJlcXVlbmN5O1xuICAgICAgdGhpcy5vY3RhdmUgPSBfZ2V0Tm90ZURhdGEub2N0YXZlO1xuICAgIH1cbiAgICAvL0BUT0RPOiBhZGQgYWxsIG90aGVyIHByb3BlcnRpZXNcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhNSURJRXZlbnQsIFt7XG4gICAga2V5OiAnY29weScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvcHkoKSB7XG4gICAgICB2YXIgbSA9IG5ldyBNSURJRXZlbnQodGhpcy50aWNrcywgdGhpcy50eXBlLCB0aGlzLmRhdGExLCB0aGlzLmRhdGEyKTtcbiAgICAgIHJldHVybiBtO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3RyYW5zcG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRyYW5zcG9zZShhbW91bnQpIHtcbiAgICAgIC8vIG1heSBiZSBiZXR0ZXIgaWYgbm90IGEgcHVibGljIG1ldGhvZD9cbiAgICAgIHRoaXMuZGF0YTEgKz0gYW1vdW50O1xuICAgICAgdGhpcy5mcmVxdWVuY3kgPSB0aGlzLnBpdGNoICogTWF0aC5wb3coMiwgKHRoaXMuZGF0YTEgLSA2OSkgLyAxMik7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlUGl0Y2gnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVQaXRjaChuZXdQaXRjaCkge1xuICAgICAgaWYgKG5ld1BpdGNoID09PSB0aGlzLnBpdGNoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMucGl0Y2ggPSBuZXdQaXRjaDtcbiAgICAgIHRoaXMudHJhbnNwb3NlKDApO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlKHRpY2tzKSB7XG4gICAgICB0aGlzLnRpY2tzICs9IHRpY2tzO1xuICAgICAgaWYgKHRoaXMubWlkaU5vdGUpIHtcbiAgICAgICAgdGhpcy5taWRpTm90ZS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlVG8nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlVG8odGlja3MpIHtcbiAgICAgIHRoaXMudGlja3MgPSB0aWNrcztcbiAgICAgIGlmICh0aGlzLm1pZGlOb3RlKSB7XG4gICAgICAgIHRoaXMubWlkaU5vdGUudXBkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElFdmVudDtcbn0oKTtcblxuLypcbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVNSURJRXZlbnQoZXZlbnQpe1xuICAvL2V2ZW50Lm5vdGUgPSBudWxsXG4gIGV2ZW50Lm5vdGUgPSBudWxsXG4gIGV2ZW50ID0gbnVsbFxufVxuKi8iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLk1JRElOb3RlID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIGluc3RhbmNlSW5kZXggPSAwO1xuXG52YXIgTUlESU5vdGUgPSBleHBvcnRzLk1JRElOb3RlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNSURJTm90ZShub3Rlb24sIG5vdGVvZmYpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESU5vdGUpO1xuXG4gICAgLy9pZihub3Rlb24udHlwZSAhPT0gMTQ0IHx8IG5vdGVvZmYudHlwZSAhPT0gMTI4KXtcbiAgICBpZiAobm90ZW9uLnR5cGUgIT09IDE0NCkge1xuICAgICAgY29uc29sZS53YXJuKCdjYW5ub3QgY3JlYXRlIE1JRElOb3RlJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaWQgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLm5vdGVPbiA9IG5vdGVvbjtcbiAgICBub3Rlb24ubWlkaU5vdGUgPSB0aGlzO1xuICAgIG5vdGVvbi5taWRpTm90ZUlkID0gdGhpcy5pZDtcblxuICAgIGlmIChub3Rlb2ZmIGluc3RhbmNlb2YgX21pZGlfZXZlbnQuTUlESUV2ZW50KSB7XG4gICAgICB0aGlzLm5vdGVPZmYgPSBub3Rlb2ZmO1xuICAgICAgbm90ZW9mZi5taWRpTm90ZSA9IHRoaXM7XG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlSWQgPSB0aGlzLmlkO1xuICAgICAgdGhpcy5kdXJhdGlvblRpY2tzID0gbm90ZW9mZi50aWNrcyAtIG5vdGVvbi50aWNrcztcbiAgICAgIHRoaXMuZHVyYXRpb25NaWxsaXMgPSAtMTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTUlESU5vdGUsIFt7XG4gICAga2V5OiAnYWRkTm90ZU9mZicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZE5vdGVPZmYobm90ZW9mZikge1xuICAgICAgdGhpcy5ub3RlT2ZmID0gbm90ZW9mZjtcbiAgICAgIG5vdGVvZmYubWlkaU5vdGUgPSB0aGlzO1xuICAgICAgbm90ZW9mZi5taWRpTm90ZUlkID0gdGhpcy5pZDtcbiAgICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IG5vdGVvZmYudGlja3MgLSB0aGlzLm5vdGVPbi50aWNrcztcbiAgICAgIHRoaXMuZHVyYXRpb25NaWxsaXMgPSAtMTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb3B5JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29weSgpIHtcbiAgICAgIHJldHVybiBuZXcgTUlESU5vdGUodGhpcy5ub3RlT24uY29weSgpLCB0aGlzLm5vdGVPZmYuY29weSgpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAvLyBtYXkgdXNlIGFub3RoZXIgbmFtZSBmb3IgdGhpcyBtZXRob2RcbiAgICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IHRoaXMubm90ZU9mZi50aWNrcyAtIHRoaXMubm90ZU9uLnRpY2tzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3RyYW5zcG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRyYW5zcG9zZShhbW91bnQpIHtcbiAgICAgIHRoaXMubm90ZU9uLnRyYW5zcG9zZShhbW91bnQpO1xuICAgICAgdGhpcy5ub3RlT2ZmLnRyYW5zcG9zZShhbW91bnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlKHRpY2tzKSB7XG4gICAgICB0aGlzLm5vdGVPbi5tb3ZlKHRpY2tzKTtcbiAgICAgIHRoaXMubm90ZU9mZi5tb3ZlKHRpY2tzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlVG8nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlVG8odGlja3MpIHtcbiAgICAgIHRoaXMubm90ZU9uLm1vdmVUbyh0aWNrcyk7XG4gICAgICB0aGlzLm5vdGVPZmYubW92ZVRvKHRpY2tzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1bnJlZ2lzdGVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5yZWdpc3RlcigpIHtcbiAgICAgIGlmICh0aGlzLnBhcnQpIHtcbiAgICAgICAgdGhpcy5wYXJ0LnJlbW92ZUV2ZW50cyh0aGlzKTtcbiAgICAgICAgdGhpcy5wYXJ0ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnRyYWNrKSB7XG4gICAgICAgIHRoaXMudHJhY2sucmVtb3ZlRXZlbnRzKHRoaXMpO1xuICAgICAgICB0aGlzLnRyYWNrID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNvbmcpIHtcbiAgICAgICAgdGhpcy5zb25nLnJlbW92ZUV2ZW50cyh0aGlzKTtcbiAgICAgICAgdGhpcy5zb25nID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTUlESU5vdGU7XG59KCk7IiwiLypcbiAgV3JhcHBlciBmb3IgYWNjZXNzaW5nIGJ5dGVzIHRocm91Z2ggc2VxdWVudGlhbCByZWFkc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuICBhZGFwdGVkIHRvIHdvcmsgd2l0aCBBcnJheUJ1ZmZlciAtPiBVaW50OEFycmF5XG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBmY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG52YXIgTUlESVN0cmVhbSA9IGZ1bmN0aW9uICgpIHtcblxuICAvLyBidWZmZXIgaXMgVWludDhBcnJheVxuXG4gIGZ1bmN0aW9uIE1JRElTdHJlYW0oYnVmZmVyKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1JRElTdHJlYW0pO1xuXG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICAvKiByZWFkIHN0cmluZyBvciBhbnkgbnVtYmVyIG9mIGJ5dGVzICovXG5cblxuICBfY3JlYXRlQ2xhc3MoTUlESVN0cmVhbSwgW3tcbiAgICBrZXk6ICdyZWFkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVhZChsZW5ndGgpIHtcbiAgICAgIHZhciB0b1N0cmluZyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgIHZhciByZXN1bHQgPSB2b2lkIDA7XG5cbiAgICAgIGlmICh0b1N0cmluZykge1xuICAgICAgICByZXN1bHQgPSAnJztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKSB7XG4gICAgICAgICAgcmVzdWx0ICs9IGZjYyh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGVuZ3RoOyBfaSsrLCB0aGlzLnBvc2l0aW9uKyspIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiByZWFkIGEgYmlnLWVuZGlhbiAzMi1iaXQgaW50ZWdlciAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdyZWFkSW50MzInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZWFkSW50MzIoKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDI0KSArICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV0gPDwgMTYpICsgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAyXSA8PCA4KSArIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAzXTtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gNDtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMTYtYml0IGludGVnZXIgKi9cblxuICB9LCB7XG4gICAga2V5OiAncmVhZEludDE2JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVhZEludDE2KCkge1xuICAgICAgdmFyIHJlc3VsdCA9ICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCA4KSArIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXTtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyogcmVhZCBhbiA4LWJpdCBpbnRlZ2VyICovXG5cbiAgfSwge1xuICAgIGtleTogJ3JlYWRJbnQ4JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVhZEludDgoc2lnbmVkKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl07XG4gICAgICBpZiAoc2lnbmVkICYmIHJlc3VsdCA+IDEyNykge1xuICAgICAgICByZXN1bHQgLT0gMjU2O1xuICAgICAgfVxuICAgICAgdGhpcy5wb3NpdGlvbiArPSAxO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdlb2YnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBlb2YoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbiA+PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgfVxuXG4gICAgLyogcmVhZCBhIE1JREktc3R5bGUgbGV0aWFibGUtbGVuZ3RoIGludGVnZXJcbiAgICAgIChiaWctZW5kaWFuIHZhbHVlIGluIGdyb3VwcyBvZiA3IGJpdHMsXG4gICAgICB3aXRoIHRvcCBiaXQgc2V0IHRvIHNpZ25pZnkgdGhhdCBhbm90aGVyIGJ5dGUgZm9sbG93cylcbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdyZWFkVmFySW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVhZFZhckludCgpIHtcbiAgICAgIHZhciByZXN1bHQgPSAwO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmIChiICYgMHg4MCkge1xuICAgICAgICAgIHJlc3VsdCArPSBiICYgMHg3ZjtcbiAgICAgICAgICByZXN1bHQgPDw9IDc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLyogYiBpcyB0aGUgbGFzdCBieXRlICovXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdCArIGI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZXNldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0UG9zaXRpb24nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQb3NpdGlvbihwKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uID0gcDtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTUlESVN0cmVhbTtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTUlESVN0cmVhbTsiLCIvKlxuICBFeHRyYWN0cyBhbGwgbWlkaSBldmVudHMgZnJvbSBhIGJpbmFyeSBtaWRpIGZpbGUsIHVzZXMgbWlkaV9zdHJlYW0uanNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucGFyc2VNSURJRmlsZSA9IHBhcnNlTUlESUZpbGU7XG5cbnZhciBfbWlkaV9zdHJlYW0gPSByZXF1aXJlKCcuL21pZGlfc3RyZWFtJyk7XG5cbnZhciBfbWlkaV9zdHJlYW0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWlkaV9zdHJlYW0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgbGFzdEV2ZW50VHlwZUJ5dGUgPSB2b2lkIDAsXG4gICAgdHJhY2tOYW1lID0gdm9pZCAwO1xuXG5mdW5jdGlvbiByZWFkQ2h1bmsoc3RyZWFtKSB7XG4gIHZhciBpZCA9IHN0cmVhbS5yZWFkKDQsIHRydWUpO1xuICB2YXIgbGVuZ3RoID0gc3RyZWFtLnJlYWRJbnQzMigpO1xuICAvL2NvbnNvbGUubG9nKGxlbmd0aCk7XG4gIHJldHVybiB7XG4gICAgJ2lkJzogaWQsXG4gICAgJ2xlbmd0aCc6IGxlbmd0aCxcbiAgICAnZGF0YSc6IHN0cmVhbS5yZWFkKGxlbmd0aCwgZmFsc2UpXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlYWRFdmVudChzdHJlYW0pIHtcbiAgdmFyIGV2ZW50ID0ge307XG4gIHZhciBsZW5ndGg7XG4gIGV2ZW50LmRlbHRhVGltZSA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gIHZhciBldmVudFR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gIC8vY29uc29sZS5sb2coZXZlbnRUeXBlQnl0ZSwgZXZlbnRUeXBlQnl0ZSAmIDB4ODAsIDE0NiAmIDB4MGYpO1xuICBpZiAoKGV2ZW50VHlwZUJ5dGUgJiAweGYwKSA9PSAweGYwKSB7XG4gICAgLyogc3lzdGVtIC8gbWV0YSBldmVudCAqL1xuICAgIGlmIChldmVudFR5cGVCeXRlID09IDB4ZmYpIHtcbiAgICAgIC8qIG1ldGEgZXZlbnQgKi9cbiAgICAgIGV2ZW50LnR5cGUgPSAnbWV0YSc7XG4gICAgICB2YXIgc3VidHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBzd2l0Y2ggKHN1YnR5cGVCeXRlKSB7XG4gICAgICAgIGNhc2UgMHgwMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlTnVtYmVyJztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXF1ZW5jZU51bWJlciBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtYmVyID0gc3RyZWFtLnJlYWRJbnQxNigpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGV4dCc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDI6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb3B5cmlnaHROb3RpY2UnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAzOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndHJhY2tOYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICB0cmFja05hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA0OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnaW5zdHJ1bWVudE5hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA1OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbHlyaWNzJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21hcmtlcic7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDc6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjdWVQb2ludCc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MjA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtaWRpQ2hhbm5lbFByZWZpeCc7XG4gICAgICAgICAgaWYgKGxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgbWlkaUNoYW5uZWxQcmVmaXggZXZlbnQgaXMgMSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmNoYW5uZWwgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2VuZE9mVHJhY2snO1xuICAgICAgICAgIGlmIChsZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGVuZE9mVHJhY2sgZXZlbnQgaXMgMCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDUxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2V0VGVtcG8nO1xuICAgICAgICAgIGlmIChsZW5ndGggIT09IDMpIHtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNldFRlbXBvIGV2ZW50IGlzIDMsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5taWNyb3NlY29uZHNQZXJCZWF0ID0gKHN0cmVhbS5yZWFkSW50OCgpIDw8IDE2KSArIChzdHJlYW0ucmVhZEludDgoKSA8PCA4KSArIHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU0OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc21wdGVPZmZzZXQnO1xuICAgICAgICAgIGlmIChsZW5ndGggIT09IDUpIHtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNtcHRlT2Zmc2V0IGV2ZW50IGlzIDUsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgaG91ckJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZVJhdGUgPSB7XG4gICAgICAgICAgICAweDAwOiAyNCwgMHgyMDogMjUsIDB4NDA6IDI5LCAweDYwOiAzMFxuICAgICAgICAgIH1baG91ckJ5dGUgJiAweDYwXTtcbiAgICAgICAgICBldmVudC5ob3VyID0gaG91ckJ5dGUgJiAweDFmO1xuICAgICAgICAgIGV2ZW50Lm1pbiA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnNlYyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc3ViZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RpbWVTaWduYXR1cmUnO1xuICAgICAgICAgIGlmIChsZW5ndGggIT09IDQpIHtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWVyYXRvciA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmRlbm9taW5hdG9yID0gTWF0aC5wb3coMiwgc3RyZWFtLnJlYWRJbnQ4KCkpO1xuICAgICAgICAgIGV2ZW50Lm1ldHJvbm9tZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnRoaXJ0eXNlY29uZHMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1OTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2tleVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYgKGxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Iga2V5U2lnbmF0dXJlIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5rZXkgPSBzdHJlYW0ucmVhZEludDgodHJ1ZSk7XG4gICAgICAgICAgZXZlbnQuc2NhbGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg3ZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlclNwZWNpZmljJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9pZihzZXF1ZW5jZXIuZGVidWcgPj0gMil7XG4gICAgICAgICAgLy8gICAgY29uc29sZS53YXJuKCdVbnJlY29nbmlzZWQgbWV0YSBldmVudCBzdWJ0eXBlOiAnICsgc3VidHlwZUJ5dGUpO1xuICAgICAgICAgIC8vfVxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfVxuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfSBlbHNlIGlmIChldmVudFR5cGVCeXRlID09IDB4ZjApIHtcbiAgICAgIGV2ZW50LnR5cGUgPSAnc3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH0gZWxzZSBpZiAoZXZlbnRUeXBlQnl0ZSA9PSAweGY3KSB7XG4gICAgICBldmVudC50eXBlID0gJ2RpdmlkZWRTeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlIGJ5dGU6ICcgKyBldmVudFR5cGVCeXRlO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvKiBjaGFubmVsIGV2ZW50ICovXG4gICAgdmFyIHBhcmFtMSA9IHZvaWQgMDtcbiAgICBpZiAoKGV2ZW50VHlwZUJ5dGUgJiAweDgwKSA9PT0gMCkge1xuICAgICAgLyogcnVubmluZyBzdGF0dXMgLSByZXVzZSBsYXN0RXZlbnRUeXBlQnl0ZSBhcyB0aGUgZXZlbnQgdHlwZS5cbiAgICAgICAgZXZlbnRUeXBlQnl0ZSBpcyBhY3R1YWxseSB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gICAgICAqL1xuICAgICAgLy9jb25zb2xlLmxvZygncnVubmluZyBzdGF0dXMnKTtcbiAgICAgIHBhcmFtMSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgICBldmVudFR5cGVCeXRlID0gbGFzdEV2ZW50VHlwZUJ5dGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmFtMSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgLy9jb25zb2xlLmxvZygnbGFzdCcsIGV2ZW50VHlwZUJ5dGUpO1xuICAgICAgbGFzdEV2ZW50VHlwZUJ5dGUgPSBldmVudFR5cGVCeXRlO1xuICAgIH1cbiAgICB2YXIgZXZlbnRUeXBlID0gZXZlbnRUeXBlQnl0ZSA+PiA0O1xuICAgIGV2ZW50LmNoYW5uZWwgPSBldmVudFR5cGVCeXRlICYgMHgwZjtcbiAgICBldmVudC50eXBlID0gJ2NoYW5uZWwnO1xuICAgIHN3aXRjaCAoZXZlbnRUeXBlKSB7XG4gICAgICBjYXNlIDB4MDg6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwOTpcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgaWYgKGV2ZW50LnZlbG9jaXR5ID09PSAwKSB7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT2ZmJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBhOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYjpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb250cm9sbGVyJztcbiAgICAgICAgZXZlbnQuY29udHJvbGxlclR5cGUgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYzpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwcm9ncmFtQ2hhbmdlJztcbiAgICAgICAgZXZlbnQucHJvZ3JhbU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBkOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NoYW5uZWxBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gcGFyYW0xO1xuICAgICAgICAvL2lmKHRyYWNrTmFtZSA9PT0gJ1NILVMxLTQ0LUMwOSBMPVNNTCBJTj0zJyl7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCdjaGFubmVsIHByZXNzdXJlJywgdHJhY2tOYW1lLCBwYXJhbTEpO1xuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBlOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3BpdGNoQmVuZCc7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gcGFyYW0xICsgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDcpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvKlxuICAgICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgY29uc29sZS5sb2coJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgICAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dlaXJkbycsIHRyYWNrTmFtZSwgcGFyYW0xLCBldmVudC52ZWxvY2l0eSk7XG4gICAgICAgICovXG5cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZU1JRElGaWxlKGJ1ZmZlcikge1xuICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSA9PT0gZmFsc2UgJiYgYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS5lcnJvcignYnVmZmVyIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiBVaW50OEFycmF5IG9mIEFycmF5QnVmZmVyJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gIH1cbiAgdmFyIHRyYWNrcyA9IG5ldyBNYXAoKTtcbiAgdmFyIHN0cmVhbSA9IG5ldyBfbWlkaV9zdHJlYW0yLmRlZmF1bHQoYnVmZmVyKTtcblxuICB2YXIgaGVhZGVyQ2h1bmsgPSByZWFkQ2h1bmsoc3RyZWFtKTtcbiAgaWYgKGhlYWRlckNodW5rLmlkICE9PSAnTVRoZCcgfHwgaGVhZGVyQ2h1bmsubGVuZ3RoICE9PSA2KSB7XG4gICAgdGhyb3cgJ0JhZCAubWlkIGZpbGUgLSBoZWFkZXIgbm90IGZvdW5kJztcbiAgfVxuXG4gIHZhciBoZWFkZXJTdHJlYW0gPSBuZXcgX21pZGlfc3RyZWFtMi5kZWZhdWx0KGhlYWRlckNodW5rLmRhdGEpO1xuICB2YXIgZm9ybWF0VHlwZSA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgdmFyIHRyYWNrQ291bnQgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIHZhciB0aW1lRGl2aXNpb24gPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG5cbiAgaWYgKHRpbWVEaXZpc2lvbiAmIDB4ODAwMCkge1xuICAgIHRocm93ICdFeHByZXNzaW5nIHRpbWUgZGl2aXNpb24gaW4gU01UUEUgZnJhbWVzIGlzIG5vdCBzdXBwb3J0ZWQgeWV0JztcbiAgfVxuXG4gIHZhciBoZWFkZXIgPSB7XG4gICAgJ2Zvcm1hdFR5cGUnOiBmb3JtYXRUeXBlLFxuICAgICd0cmFja0NvdW50JzogdHJhY2tDb3VudCxcbiAgICAndGlja3NQZXJCZWF0JzogdGltZURpdmlzaW9uXG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja0NvdW50OyBpKyspIHtcbiAgICB0cmFja05hbWUgPSAndHJhY2tfJyArIGk7XG4gICAgdmFyIHRyYWNrID0gW107XG4gICAgdmFyIHRyYWNrQ2h1bmsgPSByZWFkQ2h1bmsoc3RyZWFtKTtcbiAgICBpZiAodHJhY2tDaHVuay5pZCAhPT0gJ01UcmsnKSB7XG4gICAgICB0aHJvdyAnVW5leHBlY3RlZCBjaHVuayAtIGV4cGVjdGVkIE1UcmssIGdvdCAnICsgdHJhY2tDaHVuay5pZDtcbiAgICB9XG4gICAgdmFyIHRyYWNrU3RyZWFtID0gbmV3IF9taWRpX3N0cmVhbTIuZGVmYXVsdCh0cmFja0NodW5rLmRhdGEpO1xuICAgIHdoaWxlICghdHJhY2tTdHJlYW0uZW9mKCkpIHtcbiAgICAgIHZhciBldmVudCA9IHJlYWRFdmVudCh0cmFja1N0cmVhbSk7XG4gICAgICB0cmFjay5wdXNoKGV2ZW50KTtcbiAgICB9XG4gICAgdHJhY2tzLnNldCh0cmFja05hbWUsIHRyYWNrKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgJ2hlYWRlcic6IGhlYWRlcixcbiAgICAndHJhY2tzJzogdHJhY2tzXG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nZXROb3RlRGF0YSA9IGdldE5vdGVEYXRhO1xuXG52YXIgX3NldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpO1xuXG52YXIgcG93ID0gTWF0aC5wb3c7XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuLy9jb25zdCBjaGVja05vdGVOYW1lID0gL15bQS1HXXsxfShiezAsMn19fCN7MCwyfSlbXFwtXXswLDF9WzAtOV17MX0kL1xudmFyIHJlZ2V4Q2hlY2tOb3RlTmFtZSA9IC9eW0EtR117MX0oYnxiYnwjfCMjKXswLDF9JC87XG52YXIgcmVnZXhDaGVja0Z1bGxOb3RlTmFtZSA9IC9eW0EtR117MX0oYnxiYnwjfCMjKXswLDF9KFxcLTF8WzAtOV17MX0pJC87XG52YXIgcmVnZXhTcGxpdEZ1bGxOYW1lID0gL14oW0EtR117MX0oYnxiYnwjfCMjKXswLDF9KShcXC0xfFswLTldezF9KSQvO1xudmFyIHJlZ2V4R2V0T2N0YXZlID0gLyhcXC0xfFswLTldezF9KSQvO1xuXG52YXIgbm90ZU5hbWVzID0ge1xuICBzaGFycDogWydDJywgJ0MjJywgJ0QnLCAnRCMnLCAnRScsICdGJywgJ0YjJywgJ0cnLCAnRyMnLCAnQScsICdBIycsICdCJ10sXG4gIGZsYXQ6IFsnQycsICdEYicsICdEJywgJ0ViJywgJ0UnLCAnRicsICdHYicsICdHJywgJ0FiJywgJ0EnLCAnQmInLCAnQiddLFxuICAnZW5oYXJtb25pYy1zaGFycCc6IFsnQiMnLCAnQyMnLCAnQyMjJywgJ0QjJywgJ0QjIycsICdFIycsICdGIycsICdGIyMnLCAnRyMnLCAnRyMjJywgJ0EjJywgJ0EjIyddLFxuICAnZW5oYXJtb25pYy1mbGF0JzogWydEYmInLCAnRGInLCAnRWJiJywgJ0ViJywgJ0ZiJywgJ0diYicsICdHYicsICdBYmInLCAnQWInLCAnQmJiJywgJ0JiJywgJ0NiJ11cbn07XG5cbnZhciBub3RlTmFtZU1vZGUgPSB2b2lkIDA7XG52YXIgcGl0Y2ggPSB2b2lkIDA7XG5cbi8qXG4gIHNldHRpbmdzID0ge1xuICAgIG5hbWU6ICdDJyxcbiAgICBvY3RhdmU6IDQsXG4gICAgZnVsbE5hbWU6ICdDNCcsXG4gICAgbnVtYmVyOiA2MCxcbiAgICBmcmVxdWVuY3k6IDIzNC4xNiAvLyBub3QgeWV0IGltcGxlbWVudGVkXG4gIH1cbiovXG5mdW5jdGlvbiBnZXROb3RlRGF0YShzZXR0aW5ncykge1xuICB2YXIgZnVsbE5hbWUgPSBzZXR0aW5ncy5mdWxsTmFtZTtcbiAgdmFyIG5hbWUgPSBzZXR0aW5ncy5uYW1lO1xuICB2YXIgb2N0YXZlID0gc2V0dGluZ3Mub2N0YXZlO1xuICB2YXIgbW9kZSA9IHNldHRpbmdzLm1vZGU7XG4gIHZhciBudW1iZXIgPSBzZXR0aW5ncy5udW1iZXI7XG4gIHZhciBmcmVxdWVuY3kgPSBzZXR0aW5ncy5mcmVxdWVuY3k7XG5cbiAgdmFyIF9nZXRTZXR0aW5ncyA9ICgwLCBfc2V0dGluZ3MuZ2V0U2V0dGluZ3MpKCk7XG5cbiAgbm90ZU5hbWVNb2RlID0gX2dldFNldHRpbmdzLm5vdGVOYW1lTW9kZTtcbiAgcGl0Y2ggPSBfZ2V0U2V0dGluZ3MucGl0Y2g7XG5cblxuICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnICYmIHR5cGVvZiBmdWxsTmFtZSAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIG51bWJlciAhPT0gJ251bWJlcicgJiYgdHlwZW9mIGZyZXF1ZW5jeSAhPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmIChudW1iZXIgPCAwIHx8IG51bWJlciA+IDEyNykge1xuICAgIGNvbnNvbGUubG9nKCdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgYmV0d2VlbiAwIChDLTEpIGFuZCAxMjcgKEc5KScpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShtb2RlKTtcbiAgLy9jb25zb2xlLmxvZyhtb2RlKVxuXG4gIGlmICh0eXBlb2YgbnVtYmVyID09PSAnbnVtYmVyJykge1xuICAgIHZhciBfZ2V0Tm90ZU5hbWUyID0gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSk7XG5cbiAgICBmdWxsTmFtZSA9IF9nZXROb3RlTmFtZTIuZnVsbE5hbWU7XG4gICAgbmFtZSA9IF9nZXROb3RlTmFtZTIubmFtZTtcbiAgICBvY3RhdmUgPSBfZ2V0Tm90ZU5hbWUyLm9jdGF2ZTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHtcblxuICAgIGlmIChyZWdleENoZWNrTm90ZU5hbWUudGVzdChuYW1lKSkge1xuICAgICAgZnVsbE5hbWUgPSAnJyArIG5hbWUgKyBvY3RhdmU7XG4gICAgICBudW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnaW52YWxpZCBuYW1lICcgKyBuYW1lKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgZnVsbE5hbWUgPT09ICdzdHJpbmcnKSB7XG5cbiAgICBpZiAocmVnZXhDaGVja0Z1bGxOb3RlTmFtZS50ZXN0KGZ1bGxOYW1lKSkge1xuICAgICAgdmFyIF9zcGxpdEZ1bGxOYW1lMiA9IF9zcGxpdEZ1bGxOYW1lKGZ1bGxOYW1lKTtcblxuICAgICAgb2N0YXZlID0gX3NwbGl0RnVsbE5hbWUyLm9jdGF2ZTtcbiAgICAgIG5hbWUgPSBfc3BsaXRGdWxsTmFtZTIubmFtZTtcblxuICAgICAgbnVtYmVyID0gX2dldE5vdGVOdW1iZXIobmFtZSwgb2N0YXZlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ2ludmFsaWQgZnVsbG5hbWUgJyArIGZ1bGxOYW1lKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHZhciBkYXRhID0ge1xuICAgIG5hbWU6IG5hbWUsXG4gICAgb2N0YXZlOiBvY3RhdmUsXG4gICAgZnVsbE5hbWU6IGZ1bGxOYW1lLFxuICAgIG51bWJlcjogbnVtYmVyLFxuICAgIGZyZXF1ZW5jeTogX2dldEZyZXF1ZW5jeShudW1iZXIpLFxuICAgIGJsYWNrS2V5OiBfaXNCbGFja0tleShudW1iZXIpXG4gIH07XG4gIC8vY29uc29sZS5sb2coZGF0YSlcbiAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIF9nZXROb3RlTmFtZShudW1iZXIpIHtcbiAgdmFyIG1vZGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBub3RlTmFtZU1vZGUgOiBhcmd1bWVudHNbMV07XG5cbiAgLy9sZXQgb2N0YXZlID0gTWF0aC5mbG9vcigobnVtYmVyIC8gMTIpIC0gMiksIC8vIOKGkiBpbiBDdWJhc2UgY2VudHJhbCBDID0gQzMgaW5zdGVhZCBvZiBDNFxuICB2YXIgb2N0YXZlID0gZmxvb3IobnVtYmVyIC8gMTIgLSAxKTtcbiAgdmFyIG5hbWUgPSBub3RlTmFtZXNbbW9kZV1bbnVtYmVyICUgMTJdO1xuICByZXR1cm4ge1xuICAgIGZ1bGxOYW1lOiAnJyArIG5hbWUgKyBvY3RhdmUsXG4gICAgbmFtZTogbmFtZSxcbiAgICBvY3RhdmU6IG9jdGF2ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBfZ2V0T2N0YXZlKGZ1bGxOYW1lKSB7XG4gIHJldHVybiBwYXJzZUludChmdWxsTmFtZS5tYXRjaChyZWdleEdldE9jdGF2ZSlbMF0sIDEwKTtcbn1cblxuZnVuY3Rpb24gX3NwbGl0RnVsbE5hbWUoZnVsbE5hbWUpIHtcbiAgdmFyIG9jdGF2ZSA9IF9nZXRPY3RhdmUoZnVsbE5hbWUpO1xuICByZXR1cm4ge1xuICAgIG9jdGF2ZTogb2N0YXZlLFxuICAgIG5hbWU6IGZ1bGxOYW1lLnJlcGxhY2Uob2N0YXZlLCAnJylcbiAgfTtcbn1cblxuZnVuY3Rpb24gX2dldE5vdGVOdW1iZXIobmFtZSwgb2N0YXZlKSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgdmFyIGluZGV4ID0gdm9pZCAwO1xuXG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGtleXNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICB2YXIga2V5ID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgIHZhciBtb2RlID0gbm90ZU5hbWVzW2tleV07XG4gICAgICBpbmRleCA9IG1vZGUuZmluZEluZGV4KGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiB4ID09PSBuYW1lO1xuICAgICAgfSk7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKSArIDEyIC8vIOKGkiBpbiBDdWJhc2UgY2VudHJhbCBDID0gQzMgaW5zdGVhZCBvZiBDNFxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBudW1iZXIgPSBpbmRleCArIDEyICsgb2N0YXZlICogMTI7IC8vIOKGkiBtaWRpIHN0YW5kYXJkICsgc2NpZW50aWZpYyBuYW1pbmcsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NaWRkbGVfQyBhbmQgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TY2llbnRpZmljX3BpdGNoX25vdGF0aW9uXG5cbiAgaWYgKG51bWJlciA8IDAgfHwgbnVtYmVyID4gMTI3KSB7XG4gICAgY29uc29sZS5sb2coJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBiZXR3ZWVuIDAgKEMtMSkgYW5kIDEyNyAoRzkpJyk7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIHJldHVybiBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIF9nZXRGcmVxdWVuY3kobnVtYmVyKSB7XG4gIHJldHVybiBwaXRjaCAqIHBvdygyLCAobnVtYmVyIC0gNjkpIC8gMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbn1cblxuLy9AVE9ETzogY2FsY3VsYXRlIG5vdGUgZnJvbSBmcmVxdWVuY3lcbmZ1bmN0aW9uIF9nZXRQaXRjaChoZXJ0eikge1xuICAvL2ZtICA9ICAyKG3iiJI2OSkvMTIoNDQwIEh6KS5cbn1cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpIHtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICB2YXIgcmVzdWx0ID0ga2V5cy5pbmNsdWRlcyhtb2RlKTtcbiAgLy9jb25zb2xlLmxvZyhyZXN1bHQpXG4gIGlmIChyZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgaWYgKHR5cGVvZiBtb2RlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc29sZS5sb2cobW9kZSArICcgaXMgbm90IGEgdmFsaWQgbm90ZSBuYW1lIG1vZGUsIHVzaW5nIFwiJyArIG5vdGVOYW1lTW9kZSArICdcIiBpbnN0ZWFkJyk7XG4gICAgfVxuICAgIG1vZGUgPSBub3RlTmFtZU1vZGU7XG4gIH1cbiAgcmV0dXJuIG1vZGU7XG59XG5cbmZ1bmN0aW9uIF9pc0JsYWNrS2V5KG5vdGVOdW1iZXIpIHtcbiAgdmFyIGJsYWNrID0gdm9pZCAwO1xuXG4gIHN3aXRjaCAodHJ1ZSkge1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxOiAvL0MjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDM6IC8vRCNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gNjogLy9GI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSA4OiAvL0cjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDEwOlxuICAgICAgLy9BI1xuICAgICAgYmxhY2sgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJsYWNrID0gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gYmxhY2s7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuZXhwb3J0cy5kZWNvZGVTYW1wbGUgPSBkZWNvZGVTYW1wbGU7XG5leHBvcnRzLnBhcnNlU2FtcGxlczIgPSBwYXJzZVNhbXBsZXMyO1xuZXhwb3J0cy5wYXJzZVNhbXBsZXMgPSBwYXJzZVNhbXBsZXM7XG5cbnZhciBfaXNvbW9ycGhpY0ZldGNoID0gcmVxdWlyZSgnaXNvbW9ycGhpYy1mZXRjaCcpO1xuXG52YXIgX2lzb21vcnBoaWNGZXRjaDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc29tb3JwaGljRmV0Y2gpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfZXZlbnRsaXN0ZW5lciA9IHJlcXVpcmUoJy4vZXZlbnRsaXN0ZW5lcicpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBkZWNvZGVTYW1wbGUoc2FtcGxlLCBpZCwgZXZlcnkpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgdHJ5IHtcbiAgICAgIF9pbml0X2F1ZGlvLmNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSwgZnVuY3Rpb24gb25TdWNjZXNzKGJ1ZmZlcikge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBidWZmZXIpO1xuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJlc29sdmUoeyBpZDogaWQsIGJ1ZmZlcjogYnVmZmVyIH0pO1xuICAgICAgICAgIGlmIChldmVyeSkge1xuICAgICAgICAgICAgZXZlcnkoeyBpZDogaWQsIGJ1ZmZlcjogYnVmZmVyIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKGV2ZXJ5KSB7XG4gICAgICAgICAgICBldmVyeShidWZmZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgZnVuY3Rpb24gb25FcnJvcigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yIGRlY29kaW5nIGF1ZGlvZGF0YSBbSUQ6ICcgKyBpZCArICddJyk7XG4gICAgICAgIC8vcmVqZWN0KGUpOyAvLyBkb24ndCB1c2UgcmVqZWN0IGJlY2F1c2Ugd2UgdXNlIHRoaXMgYXMgYSBuZXN0ZWQgcHJvbWlzZSBhbmQgd2UgZG9uJ3Qgd2FudCB0aGUgcGFyZW50IHByb21pc2UgdG8gcmVqZWN0XG4gICAgICAgIGlmICh0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSh7IGlkOiBpZCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpO1xuICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVzb2x2ZSh7IGlkOiBpZCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBsb2FkQW5kUGFyc2VTYW1wbGUodXJsLCBpZCwgZXZlcnkpIHtcbiAgLy9jb25zb2xlLmxvZyhpZCwgdXJsKVxuICAvKlxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdsb2FkaW5nJyxcbiAgICAgIGRhdGE6IHVybFxuICAgIH0pXG4gIH0sIDApXG4gICovXG4gICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgdHlwZTogJ2xvYWRpbmcnLFxuICAgIGRhdGE6IHVybFxuICB9KTtcblxuICB2YXIgZXhlY3V0b3IgPSBmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlKSB7XG4gICAgLy8gY29uc29sZS5sb2codXJsKVxuICAgICgwLCBfaXNvbW9ycGhpY0ZldGNoMi5kZWZhdWx0KSh1cmwsIHtcbiAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHJlc3BvbnNlLmFycmF5QnVmZmVyKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coaWQsIGRhdGEpXG4gICAgICAgICAgZGVjb2RlU2FtcGxlKGRhdGEsIGlkLCBldmVyeSkudGhlbihyZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVzb2x2ZSh7IGlkOiBpZCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvbWlzZXMocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSkge1xuXG4gIHZhciBnZXRTYW1wbGUgPSBmdW5jdGlvbiBnZXRTYW1wbGUoKSB7XG4gICAgaWYgKGtleSAhPT0gJ3JlbGVhc2UnICYmIGtleSAhPT0gJ2luZm8nICYmIGtleSAhPT0gJ3N1c3RhaW4nKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGtleSlcbiAgICAgIGlmIChzYW1wbGUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICBwcm9taXNlcy5wdXNoKGRlY29kZVNhbXBsZShzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbXBsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKCgwLCBfdXRpbC5jaGVja0lmQmFzZTY0KShzYW1wbGUpKSB7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChkZWNvZGVTYW1wbGUoKDAsIF91dGlsLmJhc2U2NFRvQmluYXJ5KShzYW1wbGUpLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhiYXNlVXJsICsgc2FtcGxlKVxuICAgICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKGJhc2VVcmwgKyBlc2NhcGUoc2FtcGxlKSwga2V5LCBldmVyeSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCh0eXBlb2Ygc2FtcGxlID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihzYW1wbGUpKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgc2FtcGxlID0gc2FtcGxlLnNhbXBsZSB8fCBzYW1wbGUuYnVmZmVyIHx8IHNhbXBsZS5iYXNlNjQgfHwgc2FtcGxlLnVybDtcbiAgICAgICAgZ2V0U2FtcGxlKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGtleSwgc2FtcGxlKVxuICAgICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZSwgcHJvbWlzZXMubGVuZ3RoKVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBnZXRTYW1wbGUoKTtcbn1cblxuLy8gb25seSBmb3IgaW50ZXJuYWxseSB1c2UgaW4gcWFtYmlcbmZ1bmN0aW9uIHBhcnNlU2FtcGxlczIobWFwcGluZykge1xuICB2YXIgZXZlcnkgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICB2YXIgdHlwZSA9ICgwLCBfdXRpbC50eXBlU3RyaW5nKShtYXBwaW5nKSxcbiAgICAgIHByb21pc2VzID0gW10sXG4gICAgICBiYXNlVXJsID0gJyc7XG5cbiAgaWYgKHR5cGVvZiBtYXBwaW5nLmJhc2VVcmwgPT09ICdzdHJpbmcnKSB7XG4gICAgYmFzZVVybCA9IG1hcHBpbmcuYmFzZVVybDtcbiAgICBkZWxldGUgbWFwcGluZy5iYXNlVXJsO1xuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhtYXBwaW5nLCBiYXNlVXJsKVxuXG4gIGV2ZXJ5ID0gdHlwZW9mIGV2ZXJ5ID09PSAnZnVuY3Rpb24nID8gZXZlcnkgOiBmYWxzZTtcbiAgLy9jb25zb2xlLmxvZyh0eXBlLCBtYXBwaW5nKVxuICBpZiAodHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBPYmplY3Qua2V5cyhtYXBwaW5nKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIC8vIGlmKGlzTmFOKGtleSkgPT09IGZhbHNlKXtcbiAgICAgIC8vICAga2V5ID0gcGFyc2VJbnQoa2V5LCAxMClcbiAgICAgIC8vIH1cbiAgICAgIHZhciBhID0gbWFwcGluZ1trZXldO1xuICAgICAgLy9jb25zb2xlLmxvZyhrZXksIGEsIHR5cGVTdHJpbmcoYSkpXG4gICAgICBpZiAoKDAsIF91dGlsLnR5cGVTdHJpbmcpKGEpID09PSAnYXJyYXknKSB7XG4gICAgICAgIGEuZm9yRWFjaChmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhtYXApXG4gICAgICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIG1hcCwga2V5LCBiYXNlVXJsLCBldmVyeSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIGEsIGtleSwgYmFzZVVybCwgZXZlcnkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdhcnJheScpIHtcbiAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGtleSA9IHZvaWQgMDtcbiAgICAgIG1hcHBpbmcuZm9yRWFjaChmdW5jdGlvbiAoc2FtcGxlKSB7XG4gICAgICAgIC8vIGtleSBpcyBkZWxpYmVyYXRlbHkgdW5kZWZpbmVkXG4gICAgICAgIGdldFByb21pc2VzKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpO1xuICAgICAgfSk7XG4gICAgfSkoKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSwgdmFsdWVzKVxuICAgICAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1hcHBpbmcgPSB7fTtcbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgLy8gc3VwcG9ydCBmb3IgbXVsdGkgbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgICAgIHZhciBtYXAgPSBtYXBwaW5nW3ZhbHVlLmlkXTtcbiAgICAgICAgICB2YXIgdHlwZSA9ICgwLCBfdXRpbC50eXBlU3RyaW5nKShtYXApO1xuICAgICAgICAgIGlmICh0eXBlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgICAgbWFwLnB1c2godmFsdWUuYnVmZmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gW21hcCwgdmFsdWUuYnVmZmVyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWFwcGluZ1t2YWx1ZS5pZF0gPSB2YWx1ZS5idWZmZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtYXBwaW5nKVxuICAgICAgICByZXNvbHZlKG1hcHBpbmcpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnYXJyYXknKSB7XG4gICAgICAgIHJlc29sdmUodmFsdWVzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU2FtcGxlcygpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGRhdGEgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBkYXRhW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgaWYgKGRhdGEubGVuZ3RoID09PSAxICYmICgwLCBfdXRpbC50eXBlU3RyaW5nKShkYXRhWzBdKSAhPT0gJ3N0cmluZycpIHtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGFbMF0pXG4gICAgcmV0dXJuIHBhcnNlU2FtcGxlczIoZGF0YVswXSk7XG4gIH1cbiAgcmV0dXJuIHBhcnNlU2FtcGxlczIoZGF0YSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5wYXJzZVRpbWVFdmVudHMgPSBwYXJzZVRpbWVFdmVudHM7XG5leHBvcnRzLnBhcnNlRXZlbnRzID0gcGFyc2VFdmVudHM7XG5leHBvcnRzLnBhcnNlTUlESU5vdGVzID0gcGFyc2VNSURJTm90ZXM7XG5leHBvcnRzLmZpbHRlckV2ZW50cyA9IGZpbHRlckV2ZW50cztcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfbWlkaV9ub3RlID0gcmVxdWlyZSgnLi9taWRpX25vdGUnKTtcblxudmFyIHBwcSA9IHZvaWQgMCxcbiAgICBicG0gPSB2b2lkIDAsXG4gICAgZmFjdG9yID0gdm9pZCAwLFxuICAgIG5vbWluYXRvciA9IHZvaWQgMCxcbiAgICBkZW5vbWluYXRvciA9IHZvaWQgMCxcbiAgICBwbGF5YmFja1NwZWVkID0gdm9pZCAwLFxuICAgIGJhciA9IHZvaWQgMCxcbiAgICBiZWF0ID0gdm9pZCAwLFxuICAgIHNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICB0aWNrID0gdm9pZCAwLFxuICAgIHRpY2tzID0gdm9pZCAwLFxuICAgIG1pbGxpcyA9IHZvaWQgMCxcbiAgICBtaWxsaXNQZXJUaWNrID0gdm9pZCAwLFxuICAgIHNlY29uZHNQZXJUaWNrID0gdm9pZCAwLFxuICAgIHRpY2tzUGVyQmVhdCA9IHZvaWQgMCxcbiAgICB0aWNrc1BlckJhciA9IHZvaWQgMCxcbiAgICB0aWNrc1BlclNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICBudW1TaXh0ZWVudGggPSB2b2lkIDAsXG4gICAgZGlmZlRpY2tzID0gdm9pZCAwO1xuLy9wcmV2aW91c0V2ZW50XG5cbmZ1bmN0aW9uIHNldFRpY2tEdXJhdGlvbigpIHtcbiAgc2Vjb25kc1BlclRpY2sgPSAxIC8gcGxheWJhY2tTcGVlZCAqIDYwIC8gYnBtIC8gcHBxO1xuICBtaWxsaXNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2sgKiAxMDAwO1xuICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssIGJwbSwgcHBxLCBwbGF5YmFja1NwZWVkLCAocHBxICogbWlsbGlzUGVyVGljaykpO1xuICAvL2NvbnNvbGUubG9nKHBwcSk7XG59XG5cbmZ1bmN0aW9uIHNldFRpY2tzUGVyQmVhdCgpIHtcbiAgZmFjdG9yID0gNCAvIGRlbm9taW5hdG9yO1xuICBudW1TaXh0ZWVudGggPSBmYWN0b3IgKiA0O1xuICB0aWNrc1BlckJlYXQgPSBwcHEgKiBmYWN0b3I7XG4gIHRpY2tzUGVyQmFyID0gdGlja3NQZXJCZWF0ICogbm9taW5hdG9yO1xuICB0aWNrc1BlclNpeHRlZW50aCA9IHBwcSAvIDQ7XG4gIC8vY29uc29sZS5sb2coZGVub21pbmF0b3IsIGZhY3RvciwgbnVtU2l4dGVlbnRoLCB0aWNrc1BlckJlYXQsIHRpY2tzUGVyQmFyLCB0aWNrc1BlclNpeHRlZW50aCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVBvc2l0aW9uKGV2ZW50KSB7XG4gIHZhciBmYXN0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMV07XG5cbiAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgLy8gaWYoZGlmZlRpY2tzIDwgMCl7XG4gIC8vICAgY29uc29sZS5sb2coZGlmZlRpY2tzLCBldmVudC50aWNrcywgcHJldmlvdXNFdmVudC50aWNrcywgcHJldmlvdXNFdmVudC50eXBlKVxuICAvLyB9XG4gIHRpY2sgKz0gZGlmZlRpY2tzO1xuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICAvL3ByZXZpb3VzRXZlbnQgPSBldmVudFxuICAvL2NvbnNvbGUubG9nKGRpZmZUaWNrcywgbWlsbGlzUGVyVGljayk7XG4gIG1pbGxpcyArPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuXG4gIGlmIChmYXN0ID09PSBmYWxzZSkge1xuICAgIHdoaWxlICh0aWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKSB7XG4gICAgICBzaXh0ZWVudGgrKztcbiAgICAgIHRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICB3aGlsZSAoc2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKSB7XG4gICAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICAgIGJlYXQrKztcbiAgICAgICAgd2hpbGUgKGJlYXQgPiBub21pbmF0b3IpIHtcbiAgICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgICBiYXIrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZVRpbWVFdmVudHMoc2V0dGluZ3MsIHRpbWVFdmVudHMpIHtcbiAgdmFyIGlzUGxheWluZyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzJdO1xuXG4gIC8vY29uc29sZS5sb2coJ3BhcnNlIHRpbWUgZXZlbnRzJylcbiAgdmFyIHR5cGUgPSB2b2lkIDA7XG4gIHZhciBldmVudCA9IHZvaWQgMDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhLnRpY2tzIDw9IGIudGlja3MgPyAtMSA6IDE7XG4gIH0pO1xuICB2YXIgZSA9IDA7XG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHRpbWVFdmVudHNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICBldmVudCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKGUrKywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG4gICAgICAvL2V2ZW50LnNvbmcgPSBzb25nO1xuICAgICAgdHlwZSA9IGV2ZW50LnR5cGU7XG4gICAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcblxuICAgICAgc3dpdGNoICh0eXBlKSB7XG5cbiAgICAgICAgY2FzZSAweDUxOlxuICAgICAgICAgIGJwbSA9IGV2ZW50LmRhdGExO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgICAgc2V0VGlja0R1cmF0aW9uKCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAweDU4OlxuICAgICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgICAgc2V0VGlja3NQZXJCZWF0KCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy90aW1lIGRhdGEgb2YgdGltZSBldmVudCBpcyB2YWxpZCBmcm9tIChhbmQgaW5jbHVkZWQpIHRoZSBwb3NpdGlvbiBvZiB0aGUgdGltZSBldmVudFxuICAgICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJhcnNBc1N0cmluZyk7XG4gICAgfVxuXG4gICAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xuICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAgIC8vY29uc29sZS5sb2codGltZUV2ZW50cyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKHNvbmcsIGV2ZW50cyl7XG5mdW5jdGlvbiBwYXJzZUV2ZW50cyhldmVudHMpIHtcbiAgdmFyIGlzUGxheWluZyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzFdO1xuXG4gIC8vY29uc29sZS5sb2coJ3BhcnNlRXZlbnRzJylcbiAgdmFyIGV2ZW50ID0gdm9pZCAwO1xuICB2YXIgc3RhcnRFdmVudCA9IDA7XG4gIHZhciBsYXN0RXZlbnRUaWNrID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIGRpZmZUaWNrcyA9IDA7XG5cbiAgLy9sZXQgZXZlbnRzID0gW10uY29uY2F0KGV2dHMsIHNvbmcuX3RpbWVFdmVudHMpO1xuICB2YXIgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aDtcbiAgLy9jb25zb2xlLmxvZyhldmVudHMpXG5cbiAgLy8gbm90ZW9mZiBjb21lcyBiZWZvcmUgbm90ZW9uXG5cbiAgLypcbiAgICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBhLnNvcnRJbmRleCAtIGIuc29ydEluZGV4O1xuICAgIH0pXG4gICovXG5cbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoYS50aWNrcyA9PT0gYi50aWNrcykge1xuICAgICAgLy8gaWYoYS50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gLTFcbiAgICAgIC8vIH1lbHNlIGlmKGIudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vICAgcmV0dXJuIDFcbiAgICAgIC8vIH1cbiAgICAgIC8vIHNob3J0OlxuICAgICAgdmFyIHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZiAoYS50eXBlID09PSAxNzYgJiYgYi50eXBlID09PSAxNDQpIHtcbiAgICAgICAgciA9IC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIHJldHVybiBhLnRpY2tzIC0gYi50aWNrcztcbiAgfSk7XG4gIGV2ZW50ID0gZXZlbnRzWzBdO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcblxuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuICBmb3IgKHZhciBpID0gc3RhcnRFdmVudDsgaSA8IG51bUV2ZW50czsgaSsrKSB7XG5cbiAgICBldmVudCA9IGV2ZW50c1tpXTtcblxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuXG4gICAgICBjYXNlIDB4NTE6XG4gICAgICAgIGJwbSA9IGV2ZW50LmRhdGExO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG4gICAgICAgIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICAgICAgICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gICAgICAgIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzO1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICAgICAgICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssZXZlbnQubWlsbGlzUGVyVGljayk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBmYWN0b3IgPSBldmVudC5mYWN0b3I7XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG4gICAgICAgIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gICAgICAgIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgICAgICAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gICAgICAgIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzO1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICAgICAgICAvL2NvbnNvbGUubG9nKG5vbWluYXRvcixudW1TaXh0ZWVudGgsdGlja3NQZXJTaXh0ZWVudGgpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy9jYXNlIDEyODpcbiAgICAgICAgLy9jYXNlIDE0NDpcblxuICAgICAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcbiAgICAgICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAgIC8qXG4gICAgICAgICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICovXG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXIpXG5cbiAgICAgIC8vIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhldmVudC5kYXRhMiwgZXZlbnQuYmFyc0FzU3RyaW5nKVxuICAgICAgLy8gfVxuXG4gICAgfVxuXG4gICAgLy8gaWYoaSA8IDEwMCAmJiAoZXZlbnQudHlwZSA9PT0gODEgfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkpe1xuICAgIC8vICAgLy9jb25zb2xlLmxvZyhpLCB0aWNrcywgZGlmZlRpY2tzLCBtaWxsaXMsIG1pbGxpc1BlclRpY2spXG4gICAgLy8gICBjb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5taWxsaXMsICdub3RlJywgZXZlbnQuZGF0YTEsICd2ZWxvJywgZXZlbnQuZGF0YTIpXG4gICAgLy8gfVxuXG4gICAgbGFzdEV2ZW50VGljayA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIHBhcnNlTUlESU5vdGVzKHJlc3VsdCk7XG4gIHJldHVybiByZXN1bHQ7XG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbn1cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnQoZXZlbnQpIHtcbiAgdmFyIGZhc3QgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICAvL2NvbnNvbGUubG9nKGJhciwgYmVhdCwgdGlja3MpXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuICBldmVudC50aWNrcyA9IHRpY2tzO1xuXG4gIGV2ZW50Lm1pbGxpcyA9IG1pbGxpcztcbiAgZXZlbnQuc2Vjb25kcyA9IG1pbGxpcyAvIDEwMDA7XG5cbiAgaWYgKGZhc3QpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBldmVudC5iYXIgPSBiYXI7XG4gIGV2ZW50LmJlYXQgPSBiZWF0O1xuICBldmVudC5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gIGV2ZW50LnRpY2sgPSB0aWNrO1xuICAvL2V2ZW50LmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrO1xuICB2YXIgdGlja0FzU3RyaW5nID0gdGljayA9PT0gMCA/ICcwMDAnIDogdGljayA8IDEwID8gJzAwJyArIHRpY2sgOiB0aWNrIDwgMTAwID8gJzAnICsgdGljayA6IHRpY2s7XG4gIGV2ZW50LmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gIGV2ZW50LmJhcnNBc0FycmF5ID0gW2JhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXTtcblxuICB2YXIgdGltZURhdGEgPSAoMCwgX3V0aWwuZ2V0TmljZVRpbWUpKG1pbGxpcyk7XG5cbiAgZXZlbnQuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gIGV2ZW50Lm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgZXZlbnQuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICBldmVudC5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICBldmVudC50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG4gIGV2ZW50LnRpbWVBc0FycmF5ID0gdGltZURhdGEudGltZUFzQXJyYXk7XG5cbiAgLy8gaWYobWlsbGlzIDwgMCl7XG4gIC8vICAgY29uc29sZS5sb2coZXZlbnQpXG4gIC8vIH1cbn1cblxudmFyIG1pZGlOb3RlSW5kZXggPSAwO1xuXG5mdW5jdGlvbiBwYXJzZU1JRElOb3RlcyhldmVudHMpIHtcbiAgdmFyIG5vdGVzID0ge307XG4gIHZhciBub3Rlc0luVHJhY2sgPSB2b2lkIDA7XG4gIHZhciBuID0gMDtcbiAgLy9jb25zb2xlLmxvZyhldmVudHMpXG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBldmVudHNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgIHZhciBldmVudCA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgaWYgKHR5cGVvZiBldmVudC5fcGFydCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGV2ZW50Ll90cmFjayA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ25vIHBhcnQgYW5kL29yIHRyYWNrIHNldCcsIGV2ZW50KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoZXZlbnQudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50Ll90cmFjay5pZF07XG4gICAgICAgIGlmICh0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50Ll90cmFjay5pZF0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdID0gZXZlbnQ7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09IDEyOCkge1xuICAgICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdO1xuICAgICAgICBpZiAodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBjb3JyZXNwb25kaW5nIG5vdGVvbiBldmVudCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbm90ZU9uID0gbm90ZXNJblRyYWNrW2V2ZW50LmRhdGExXTtcbiAgICAgICAgdmFyIG5vdGVPZmYgPSBldmVudDtcbiAgICAgICAgaWYgKHR5cGVvZiBub3RlT24gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmluZm8obisrLCAnbm8gbm90ZW9uIGV2ZW50IGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICAgIGRlbGV0ZSBub3Rlc1tldmVudC5fdHJhY2suaWRdW2V2ZW50LmRhdGExXTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbm90ZSA9IG5ldyBfbWlkaV9ub3RlLk1JRElOb3RlKG5vdGVPbiwgbm90ZU9mZik7XG4gICAgICAgIG5vdGUuX3RyYWNrID0gbm90ZU9uLl90cmFjaztcbiAgICAgICAgbm90ZSA9IG51bGw7XG4gICAgICAgIC8vIGxldCBpZCA9IGBNTl8ke21pZGlOb3RlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgICAgIC8vIG5vdGVPbi5taWRpTm90ZUlkID0gaWRcbiAgICAgICAgLy8gbm90ZU9uLm9mZiA9IG5vdGVPZmYuaWRcbiAgICAgICAgLy8gbm90ZU9mZi5taWRpTm90ZUlkID0gaWRcbiAgICAgICAgLy8gbm90ZU9mZi5vbiA9IG5vdGVPbi5pZFxuICAgICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV07XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBPYmplY3Qua2V5cyhub3RlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgZGVsZXRlIG5vdGVzW2tleV07XG4gIH0pO1xuICBub3RlcyA9IHt9O1xuICAvL2NvbnNvbGUubG9nKG5vdGVzLCBub3Rlc0luVHJhY2spXG59XG5cbi8vIG5vdCBpbiB1c2UhXG5mdW5jdGlvbiBmaWx0ZXJFdmVudHMoZXZlbnRzKSB7XG4gIHZhciBzdXN0YWluID0ge307XG4gIHZhciB0bXBSZXN1bHQgPSB7fTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvcjMgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IzID0gZXZlbnRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAzOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24zID0gKF9zdGVwMyA9IF9pdGVyYXRvcjMubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSB0cnVlKSB7XG4gICAgICB2YXIgZXZlbnQgPSBfc3RlcDMudmFsdWU7XG5cbiAgICAgIGlmIChldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KSB7XG4gICAgICAgIGlmIChldmVudC5kYXRhMiA9PT0gMCkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gZXZlbnQudGlja3MpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0bXBSZXN1bHRbZXZlbnQudGlja3NdO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudDtcbiAgICAgICAgICBkZWxldGUgc3VzdGFpbltldmVudC50cmFja0lkXTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5kYXRhMiA9PT0gMTI3KSB7XG4gICAgICAgICAgc3VzdGFpbltldmVudC50cmFja0lkXSA9IGV2ZW50LnRpY2tzO1xuICAgICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IzID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvcjMgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgJiYgX2l0ZXJhdG9yMy5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yMy5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMykge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjM7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc29sZS5sb2coc3VzdGFpbik7XG4gIE9iamVjdC5rZXlzKHRtcFJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHN1c3RhaW5FdmVudCA9IHRtcFJlc3VsdFtrZXldO1xuICAgIGNvbnNvbGUubG9nKHN1c3RhaW5FdmVudCk7XG4gICAgcmVzdWx0LnB1c2goc3VzdGFpbkV2ZW50KTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5QYXJ0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvLyBAIGZsb3dcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG5cbnZhciBQYXJ0ID0gZXhwb3J0cy5QYXJ0ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQYXJ0KCkge1xuICAgIHZhciBzZXR0aW5ncyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBhcnQpO1xuXG4gICAgdGhpcy5pZCA9IHRoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgdmFyIF9zZXR0aW5ncyRuYW1lID0gc2V0dGluZ3MubmFtZTtcbiAgICB0aGlzLm5hbWUgPSBfc2V0dGluZ3MkbmFtZSA9PT0gdW5kZWZpbmVkID8gdGhpcy5pZCA6IF9zZXR0aW5ncyRuYW1lO1xuICAgIHZhciBfc2V0dGluZ3MkbXV0ZWQgPSBzZXR0aW5ncy5tdXRlZDtcbiAgICB0aGlzLm11dGVkID0gX3NldHRpbmdzJG11dGVkID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IF9zZXR0aW5ncyRtdXRlZDtcblxuXG4gICAgdGhpcy5fdHJhY2sgPSBudWxsO1xuICAgIHRoaXMuX3NvbmcgPSBudWxsO1xuICAgIHRoaXMuX2V2ZW50cyA9IFtdO1xuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2U7XG4gICAgdGhpcy5fc3RhcnQgPSB7IG1pbGxpczogMCwgdGlja3M6IDAgfTtcbiAgICB0aGlzLl9lbmQgPSB7IG1pbGxpczogMCwgdGlja3M6IDAgfTtcblxuICAgIHZhciBldmVudHMgPSBzZXR0aW5ncy5ldmVudHM7XG5cbiAgICBpZiAodHlwZW9mIGV2ZW50cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuYWRkRXZlbnRzLmFwcGx5KHRoaXMsIF90b0NvbnN1bWFibGVBcnJheShldmVudHMpKTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoUGFydCwgW3tcbiAgICBrZXk6ICdjb3B5JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29weSgpIHtcbiAgICAgIHZhciBwID0gbmV3IFBhcnQodGhpcy5uYW1lICsgJ19jb3B5Jyk7IC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICAgIHZhciBldmVudHMgPSBbXTtcbiAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgY29weSA9IGV2ZW50LmNvcHkoKTtcbiAgICAgICAgY29uc29sZS5sb2coY29weSk7XG4gICAgICAgIGV2ZW50cy5wdXNoKGNvcHkpO1xuICAgICAgfSk7XG4gICAgICBwLmFkZEV2ZW50cy5hcHBseShwLCBldmVudHMpO1xuICAgICAgcC51cGRhdGUoKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3RyYW5zcG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRyYW5zcG9zZShhbW91bnQpIHtcbiAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlKHRpY2tzKSB7XG4gICAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQubW92ZSh0aWNrcyk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHM7XG5cbiAgICAgICAgKF9zb25nJF9tb3ZlZEV2ZW50cyA9IHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9tb3ZlZEV2ZW50cywgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVUbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVUbyh0aWNrcykge1xuICAgICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcyk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHMyO1xuXG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHMyID0gdGhpcy5fc29uZy5fbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX21vdmVkRXZlbnRzMiwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEV2ZW50cygpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgX2V2ZW50cztcblxuICAgICAgLy9jb25zb2xlLmxvZyhldmVudHMpXG4gICAgICB2YXIgdHJhY2sgPSB0aGlzLl90cmFjaztcblxuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBldmVudHNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5fcGFydCA9IF90aGlzO1xuICAgICAgICBfdGhpcy5fZXZlbnRzQnlJZC5zZXQoZXZlbnQuaWQsIGV2ZW50KTtcbiAgICAgICAgaWYgKHRyYWNrKSB7XG4gICAgICAgICAgZXZlbnQuX3RyYWNrID0gdHJhY2s7XG4gICAgICAgICAgaWYgKHRyYWNrLl9zb25nKSB7XG4gICAgICAgICAgICBldmVudC5fc29uZyA9IHRyYWNrLl9zb25nO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAoX2V2ZW50cyA9IHRoaXMuX2V2ZW50cykucHVzaC5hcHBseShfZXZlbnRzLCBldmVudHMpO1xuXG4gICAgICBpZiAodHJhY2spIHtcbiAgICAgICAgdmFyIF90cmFjayRfZXZlbnRzO1xuXG4gICAgICAgIChfdHJhY2skX2V2ZW50cyA9IHRyYWNrLl9ldmVudHMpLnB1c2guYXBwbHkoX3RyYWNrJF9ldmVudHMsIGV2ZW50cyk7XG4gICAgICAgIHRyYWNrLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fc29uZykge1xuICAgICAgICB2YXIgX3NvbmckX25ld0V2ZW50cztcblxuICAgICAgICAoX3NvbmckX25ld0V2ZW50cyA9IHRoaXMuX3NvbmcuX25ld0V2ZW50cykucHVzaC5hcHBseShfc29uZyRfbmV3RXZlbnRzLCBldmVudHMpO1xuICAgICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCh0aGlzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudHMoKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgdmFyIHRyYWNrID0gdGhpcy5fdHJhY2s7XG5cbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgZXZlbnRzID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgZXZlbnRzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5fcGFydCA9IG51bGw7XG4gICAgICAgIF90aGlzMi5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpO1xuICAgICAgICBpZiAodHJhY2spIHtcbiAgICAgICAgICBldmVudC5fdHJhY2sgPSBudWxsO1xuICAgICAgICAgIHRyYWNrLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZCk7XG4gICAgICAgICAgaWYgKHRyYWNrLl9zb25nKSB7XG4gICAgICAgICAgICBldmVudC5fc29uZyA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICh0cmFjaykge1xuICAgICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICB0cmFjay5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fc29uZykge1xuICAgICAgICB2YXIgX3NvbmckX3JlbW92ZWRFdmVudHM7XG5cbiAgICAgICAgKF9zb25nJF9yZW1vdmVkRXZlbnRzID0gdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfcmVtb3ZlZEV2ZW50cywgZXZlbnRzKTtcbiAgICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZUV2ZW50cyh0aWNrcykge1xuICAgICAgZm9yICh2YXIgX2xlbjMgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuMyA+IDEgPyBfbGVuMyAtIDEgOiAwKSwgX2tleTMgPSAxOyBfa2V5MyA8IF9sZW4zOyBfa2V5MysrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5MyAtIDFdID0gYXJndW1lbnRzW19rZXkzXTtcbiAgICAgIH1cblxuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50Lm1vdmUodGlja3MpO1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy5fc29uZykge1xuICAgICAgICB2YXIgX3NvbmckX21vdmVkRXZlbnRzMztcblxuICAgICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCh0aGlzKTtcbiAgICAgICAgKF9zb25nJF9tb3ZlZEV2ZW50czMgPSB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfbW92ZWRFdmVudHMzLCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fZXZlbnRzKSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZUV2ZW50c1RvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZUV2ZW50c1RvKHRpY2tzKSB7XG4gICAgICBmb3IgKHZhciBfbGVuNCA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW40ID4gMSA/IF9sZW40IC0gMSA6IDApLCBfa2V5NCA9IDE7IF9rZXk0IDwgX2xlbjQ7IF9rZXk0KyspIHtcbiAgICAgICAgZXZlbnRzW19rZXk0IC0gMV0gPSBhcmd1bWVudHNbX2tleTRdO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMuX3NvbmcpIHtcbiAgICAgICAgdmFyIF9zb25nJF9tb3ZlZEV2ZW50czQ7XG5cbiAgICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcyk7XG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHM0ID0gdGhpcy5fc29uZy5fbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX21vdmVkRXZlbnRzNCwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50cygpIHtcbiAgICAgIHZhciBmaWx0ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuICAgICAgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgICBpZiAodGhpcy5fbmVlZHNVcGRhdGUpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpOyAvL0BUT0RPIGltcGxlbWVudCBmaWx0ZXIgLT4gZmlsdGVyRXZlbnRzKCkgc2hvdWxkIGJlIGEgdXRpbGl0eSBmdW5jdGlvbiAobm90IGEgY2xhc3MgbWV0aG9kKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ211dGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtdXRlKCkge1xuICAgICAgdmFyIGZsYWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICBpZiAoZmxhZykge1xuICAgICAgICB0aGlzLm11dGVkID0gZmxhZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubXV0ZWQgPSAhdGhpcy5tdXRlZDtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICBpZiAodGhpcy5fbmVlZHNVcGRhdGUgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9jcmVhdGVFdmVudEFycmF5KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgICgwLCBfdXRpbC5zb3J0RXZlbnRzKSh0aGlzLl9ldmVudHMpO1xuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICAgIC8vQFRPRE86IGNhbGN1bGF0ZSBwYXJ0IHN0YXJ0IGFuZCBlbmQsIGFuZCBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBQYXJ0O1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuUGxheWhlYWQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcG9zaXRpb24gPSByZXF1aXJlKCcuL3Bvc2l0aW9uLmpzJyk7XG5cbnZhciBfZXZlbnRsaXN0ZW5lciA9IHJlcXVpcmUoJy4vZXZlbnRsaXN0ZW5lci5qcycpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciByYW5nZSA9IDEwOyAvLyBtaWxsaXNlY29uZHMgb3IgdGlja3NcbnZhciBpbnN0YW5jZUluZGV4ID0gMDtcblxudmFyIFBsYXloZWFkID0gZXhwb3J0cy5QbGF5aGVhZCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUGxheWhlYWQoc29uZykge1xuICAgIHZhciB0eXBlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ2FsbCcgOiBhcmd1bWVudHNbMV07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGxheWhlYWQpO1xuXG4gICAgdGhpcy5pZCA9IHRoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMuc29uZyA9IHNvbmc7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmxhc3RFdmVudCA9IG51bGw7XG4gICAgdGhpcy5kYXRhID0ge307XG5cbiAgICB0aGlzLmFjdGl2ZVBhcnRzID0gW107XG4gICAgdGhpcy5hY3RpdmVOb3RlcyA9IFtdO1xuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW107XG4gIH1cblxuICAvLyB1bml0IGNhbiBiZSAnbWlsbGlzJyBvciAndGlja3MnXG5cblxuICBfY3JlYXRlQ2xhc3MoUGxheWhlYWQsIFt7XG4gICAga2V5OiAnc2V0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0KHVuaXQsIHZhbHVlKSB7XG4gICAgICB0aGlzLnVuaXQgPSB1bml0O1xuICAgICAgdGhpcy5jdXJyZW50VmFsdWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMuZXZlbnRJbmRleCA9IDA7XG4gICAgICB0aGlzLm5vdGVJbmRleCA9IDA7XG4gICAgICB0aGlzLnBhcnRJbmRleCA9IDA7XG4gICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSh1bml0LCBkaWZmKSB7XG4gICAgICBpZiAoZGlmZiA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhO1xuICAgICAgfVxuICAgICAgdGhpcy51bml0ID0gdW5pdDtcbiAgICAgIHRoaXMuY3VycmVudFZhbHVlICs9IGRpZmY7XG4gICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGVTb25nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlU29uZygpIHtcbiAgICAgIHRoaXMuZXZlbnRzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnNvbmcuX2V2ZW50cyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnNvbmcuX3RpbWVFdmVudHMpKTtcbiAgICAgICgwLCBfdXRpbC5zb3J0RXZlbnRzKSh0aGlzLmV2ZW50cyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdldmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICAgIHRoaXMubm90ZXMgPSB0aGlzLnNvbmcuX25vdGVzO1xuICAgICAgdGhpcy5wYXJ0cyA9IHRoaXMuc29uZy5fcGFydHM7XG4gICAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aDtcbiAgICAgIHRoaXMubnVtTm90ZXMgPSB0aGlzLm5vdGVzLmxlbmd0aDtcbiAgICAgIHRoaXMubnVtUGFydHMgPSB0aGlzLnBhcnRzLmxlbmd0aDtcbiAgICAgIHRoaXMuc2V0KCdtaWxsaXMnLCB0aGlzLnNvbmcuX2N1cnJlbnRNaWxsaXMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NhbGN1bGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNhbGN1bGF0ZSgpIHtcbiAgICAgIHZhciBpID0gdm9pZCAwO1xuICAgICAgdmFyIHZhbHVlID0gdm9pZCAwO1xuICAgICAgdmFyIGV2ZW50ID0gdm9pZCAwO1xuICAgICAgdmFyIG5vdGUgPSB2b2lkIDA7XG4gICAgICB2YXIgcGFydCA9IHZvaWQgMDtcbiAgICAgIHZhciBwb3NpdGlvbiA9IHZvaWQgMDtcbiAgICAgIHZhciBzdGlsbEFjdGl2ZU5vdGVzID0gW107XG4gICAgICB2YXIgc3RpbGxBY3RpdmVQYXJ0cyA9IFtdO1xuICAgICAgdmFyIGNvbGxlY3RlZFBhcnRzID0gbmV3IFNldCgpO1xuICAgICAgdmFyIGNvbGxlY3RlZE5vdGVzID0gbmV3IFNldCgpO1xuXG4gICAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW107XG4gICAgICB2YXIgc3VzdGFpbnBlZGFsRXZlbnRzID0gW107XG5cbiAgICAgIGZvciAoaSA9IHRoaXMuZXZlbnRJbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspIHtcbiAgICAgICAgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgICAgdmFsdWUgPSBldmVudFt0aGlzLnVuaXRdO1xuICAgICAgICBpZiAodmFsdWUgPD0gdGhpcy5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAvLyBpZiB0aGUgcGxheWhlYWQgaXMgc2V0IHRvIGEgcG9zaXRpb24gb2Ygc2F5IDMwMDAgbWlsbGlzLCB3ZSBkb24ndCB3YW50IHRvIGFkZCBldmVudHMgbW9yZSB0aGF0IDEwIHVuaXRzIGJlZm9yZSB0aGUgcGxheWhlYWRcbiAgICAgICAgICBpZiAodmFsdWUgPT09IDAgfHwgdmFsdWUgPiB0aGlzLmN1cnJlbnRWYWx1ZSAtIHJhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgIC8vIHRoaXMgZG9lc24ndCB3b3JrIHRvbyB3ZWxsXG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gMTc2KSB7XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQuZGF0YTEsIGV2ZW50LmRhdGEyKVxuICAgICAgICAgICAgICBpZiAoZXZlbnQuZGF0YTEgPT09IDY0KSB7XG4gICAgICAgICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwyJyxcbiAgICAgICAgICAgICAgICAgIGRhdGE6IGV2ZW50LmRhdGEyID09PSAxMjcgPyAnZG93bicgOiAndXAnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3VzdGFpbnBlZGFsRXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIH1lbHNle1xuICAgICAgICAgICAgICAvLyAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgICAvLyAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgICAgICAgLy8gICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgICAgIC8vICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgICAgICAgZGF0YTogZXZlbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxhc3RFdmVudCA9IGV2ZW50O1xuICAgICAgICAgIHRoaXMuZXZlbnRJbmRleCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBsZXQgbnVtID0gc3VzdGFpbnBlZGFsRXZlbnRzLmxlbmd0aFxuICAgICAgLy8gaWYobnVtID4gMCl7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFZhbHVlLCBudW0sIHN1c3RhaW5wZWRhbEV2ZW50c1tudW0gLSAxXS5kYXRhMiwgc3VzdGFpbnBlZGFsRXZlbnRzKVxuICAgICAgLy8gfVxuXG4gICAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgICB0aGlzLmRhdGEuYWN0aXZlRXZlbnRzID0gdGhpcy5hY3RpdmVFdmVudHM7XG5cbiAgICAgIC8vIGlmIGEgc29uZyBoYXMgbm8gZXZlbnRzIHlldCwgdXNlIHRoZSBmaXJzdCB0aW1lIGV2ZW50IGFzIHJlZmVyZW5jZVxuICAgICAgaWYgKHRoaXMubGFzdEV2ZW50ID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMubGFzdEV2ZW50ID0gdGhpcy5zb25nLl90aW1lRXZlbnRzWzBdO1xuICAgICAgfVxuXG4gICAgICBwb3NpdGlvbiA9ICgwLCBfcG9zaXRpb24uZ2V0UG9zaXRpb24yKSh0aGlzLnNvbmcsIHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUsICdhbGwnLCB0aGlzLmxhc3RFdmVudCk7XG4gICAgICB0aGlzLmRhdGEuZXZlbnRJbmRleCA9IHRoaXMuZXZlbnRJbmRleDtcbiAgICAgIHRoaXMuZGF0YS5taWxsaXMgPSBwb3NpdGlvbi5taWxsaXM7XG4gICAgICB0aGlzLmRhdGEudGlja3MgPSBwb3NpdGlvbi50aWNrcztcbiAgICAgIHRoaXMuZGF0YS5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXG4gICAgICBpZiAodGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gT2JqZWN0LmtleXMocG9zaXRpb24pW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIGtleSA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgICAgICBkYXRhW2tleV0gPSBwb3NpdGlvbltrZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlLmluZGV4T2YoJ2JhcnNiZWF0cycpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRhdGEuYmFyID0gcG9zaXRpb24uYmFyO1xuICAgICAgICB0aGlzLmRhdGEuYmVhdCA9IHBvc2l0aW9uLmJlYXQ7XG4gICAgICAgIHRoaXMuZGF0YS5zaXh0ZWVudGggPSBwb3NpdGlvbi5zaXh0ZWVudGg7XG4gICAgICAgIHRoaXMuZGF0YS50aWNrID0gcG9zaXRpb24udGljaztcbiAgICAgICAgdGhpcy5kYXRhLmJhcnNBc1N0cmluZyA9IHBvc2l0aW9uLmJhcnNBc1N0cmluZztcblxuICAgICAgICB0aGlzLmRhdGEudGlja3NQZXJCYXIgPSBwb3NpdGlvbi50aWNrc1BlckJhcjtcbiAgICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmVhdCA9IHBvc2l0aW9uLnRpY2tzUGVyQmVhdDtcbiAgICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gcG9zaXRpb24udGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICAgIHRoaXMuZGF0YS5udW1TaXh0ZWVudGggPSBwb3NpdGlvbi5udW1TaXh0ZWVudGg7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZS5pbmRleE9mKCd0aW1lJykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMuZGF0YS5ob3VyID0gcG9zaXRpb24uaG91cjtcbiAgICAgICAgdGhpcy5kYXRhLm1pbnV0ZSA9IHBvc2l0aW9uLm1pbnV0ZTtcbiAgICAgICAgdGhpcy5kYXRhLnNlY29uZCA9IHBvc2l0aW9uLnNlY29uZDtcbiAgICAgICAgdGhpcy5kYXRhLm1pbGxpc2Vjb25kID0gcG9zaXRpb24ubWlsbGlzZWNvbmQ7XG4gICAgICAgIHRoaXMuZGF0YS50aW1lQXNTdHJpbmcgPSBwb3NpdGlvbi50aW1lQXNTdHJpbmc7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZS5pbmRleE9mKCdwZXJjZW50YWdlJykgIT09IC0xKSB7XG4gICAgICAgIHRoaXMuZGF0YS5wZXJjZW50YWdlID0gcG9zaXRpb24ucGVyY2VudGFnZTtcbiAgICAgIH1cblxuICAgICAgLy8gZ2V0IGFjdGl2ZSBub3Rlc1xuICAgICAgaWYgKHRoaXMudHlwZS5pbmRleE9mKCdub3RlcycpICE9PSAtMSB8fCB0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKSB7XG5cbiAgICAgICAgLy8gZ2V0IGFsbCBub3RlcyBiZXR3ZWVuIHRoZSBub3RlSW5kZXggYW5kIHRoZSBjdXJyZW50IHBsYXloZWFkIHBvc2l0aW9uXG4gICAgICAgIGZvciAoaSA9IHRoaXMubm90ZUluZGV4OyBpIDwgdGhpcy5udW1Ob3RlczsgaSsrKSB7XG4gICAgICAgICAgbm90ZSA9IHRoaXMubm90ZXNbaV07XG4gICAgICAgICAgdmFsdWUgPSBub3RlLm5vdGVPblt0aGlzLnVuaXRdO1xuICAgICAgICAgIGlmICh2YWx1ZSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5ub3RlSW5kZXgrKztcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygbm90ZS5ub3RlT2ZmID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIHRoZSBwbGF5aGVhZCBpcyBzZXQgdG8gYSBwb3NpdGlvbiBvZiBzYXkgMzAwMCBtaWxsaXMsIHdlIGRvbid0IHdhbnQgdG8gYWRkIG5vdGVzIGJlZm9yZSB0aGUgcGxheWhlYWRcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRWYWx1ZSA9PT0gMCB8fCBub3RlLm5vdGVPZmZbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICAgIGNvbGxlY3RlZE5vdGVzLmFkZChub3RlKTtcbiAgICAgICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbm90ZU9uJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBub3RlLm5vdGVPblxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmlsdGVyIG5vdGVzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgICAgZm9yIChpID0gdGhpcy5hY3RpdmVOb3Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIG5vdGUgPSB0aGlzLmFjdGl2ZU5vdGVzW2ldO1xuICAgICAgICAgIC8vaWYobm90ZS5ub3RlT24uc3RhdGUuaW5kZXhPZigncmVtb3ZlZCcpID09PSAwIHx8IHRoaXMuc29uZy5fbm90ZXNCeUlkLmdldChub3RlLmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIGlmICh0aGlzLnNvbmcuX25vdGVzQnlJZC5nZXQobm90ZS5pZCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdza2lwcGluZyByZW1vdmVkIG5vdGUnLCBub3RlLmlkKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0eXBlb2Ygbm90ZS5ub3RlT2ZmID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdub3RlIHdpdGggaWQnLCBub3RlLmlkLCAnaGFzIG5vIG5vdGVPZmYgZXZlbnQnKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vaWYobm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSAmJiBjb2xsZWN0ZWROb3Rlcy5oYXMobm90ZSkgPT09IGZhbHNlKXtcbiAgICAgICAgICBpZiAobm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgc3RpbGxBY3RpdmVOb3Rlcy5wdXNoKG5vdGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgICAgICB0eXBlOiAnbm90ZU9mZicsXG4gICAgICAgICAgICAgIGRhdGE6IG5vdGUubm90ZU9mZlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHRoZSBzdGlsbCBhY3RpdmUgbm90ZXMgYW5kIHRoZSBuZXdseSBhY3RpdmUgZXZlbnRzIHRvIHRoZSBhY3RpdmUgbm90ZXMgYXJyYXlcbiAgICAgICAgdGhpcy5hY3RpdmVOb3RlcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoY29sbGVjdGVkTm90ZXMudmFsdWVzKCkpLCBzdGlsbEFjdGl2ZU5vdGVzKTtcbiAgICAgICAgdGhpcy5kYXRhLmFjdGl2ZU5vdGVzID0gdGhpcy5hY3RpdmVOb3RlcztcbiAgICAgIH1cblxuICAgICAgLy8gZ2V0IGFjdGl2ZSBwYXJ0c1xuICAgICAgaWYgKHRoaXMudHlwZS5pbmRleE9mKCdwYXJ0cycpICE9PSAtMSB8fCB0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKSB7XG5cbiAgICAgICAgZm9yIChpID0gdGhpcy5wYXJ0SW5kZXg7IGkgPCB0aGlzLm51bVBhcnRzOyBpKyspIHtcbiAgICAgICAgICBwYXJ0ID0gdGhpcy5wYXJ0c1tpXTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKHBhcnQsIHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgIGlmIChwYXJ0Ll9zdGFydFt0aGlzLnVuaXRdIDw9IHRoaXMuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICBjb2xsZWN0ZWRQYXJ0cy5hZGQocGFydCk7XG4gICAgICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgICAgICB0eXBlOiAncGFydE9uJyxcbiAgICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnBhcnRJbmRleCsrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmaWx0ZXIgcGFydHMgdGhhdCBhcmUgbm8gbG9uZ2VyIGFjdGl2ZVxuICAgICAgICBmb3IgKGkgPSB0aGlzLmFjdGl2ZVBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgcGFydCA9IHRoaXMuYWN0aXZlUGFydHNbaV07XG4gICAgICAgICAgLy9pZihwYXJ0LnN0YXRlLmluZGV4T2YoJ3JlbW92ZWQnKSA9PT0gMCB8fCB0aGlzLnNvbmcuX3BhcnRzQnlJZC5nZXQocGFydC5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgICBpZiAodGhpcy5zb25nLl9wYXJ0c0J5SWQuZ2V0KHBhcnQuaWQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc2tpcHBpbmcgcmVtb3ZlZCBwYXJ0JywgcGFydC5pZCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL2lmKHBhcnQuX2VuZFt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkUGFydHMuaGFzKHBhcnQpID09PSBmYWxzZSl7XG4gICAgICAgICAgaWYgKHBhcnQuX2VuZFt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHN0aWxsQWN0aXZlUGFydHMucHVzaChub3RlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICAgICAgdHlwZTogJ3BhcnRPZmYnLFxuICAgICAgICAgICAgICBkYXRhOiBwYXJ0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGl2ZVBhcnRzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShjb2xsZWN0ZWRQYXJ0cy52YWx1ZXMoKSksIHN0aWxsQWN0aXZlUGFydHMpO1xuICAgICAgICB0aGlzLmRhdGEuYWN0aXZlUGFydHMgPSB0aGlzLmFjdGl2ZVBhcnRzO1xuICAgICAgfVxuXG4gICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgICBkYXRhOiB0aGlzLmRhdGFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICBzZXRUeXBlKHQpe1xuICAgICAgICB0aGlzLnR5cGUgPSB0O1xuICAgICAgICB0aGlzLnNldCh0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgICAgIH1cbiAgICBcbiAgICBcbiAgICAgIGFkZFR5cGUodCl7XG4gICAgICAgIHRoaXMudHlwZSArPSAnICcgKyB0O1xuICAgICAgICB0aGlzLnNldCh0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgICAgIH1cbiAgICBcbiAgICAgIHJlbW92ZVR5cGUodCl7XG4gICAgICAgIHZhciBhcnIgPSB0aGlzLnR5cGUuc3BsaXQoJyAnKTtcbiAgICAgICAgdGhpcy50eXBlID0gJyc7XG4gICAgICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpe1xuICAgICAgICAgIGlmKHR5cGUgIT09IHQpe1xuICAgICAgICAgICAgdGhpcy50eXBlICs9IHQgKyAnICc7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50eXBlLnRyaW0oKTtcbiAgICAgICAgdGhpcy5zZXQodGhpcy5jdXJyZW50VmFsdWUpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICAgICAgfVxuICAgICovXG5cbiAgfV0pO1xuXG4gIHJldHVybiBQbGF5aGVhZDtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheSA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfSByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IHJldHVybiBhcnI7IH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7IHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7IH0gZWxzZSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpOyB9IH07IH0oKTtcblxuZXhwb3J0cy5taWxsaXNUb1RpY2tzID0gbWlsbGlzVG9UaWNrcztcbmV4cG9ydHMudGlja3NUb01pbGxpcyA9IHRpY2tzVG9NaWxsaXM7XG5leHBvcnRzLmJhcnNUb01pbGxpcyA9IGJhcnNUb01pbGxpcztcbmV4cG9ydHMuYmFyc1RvVGlja3MgPSBiYXJzVG9UaWNrcztcbmV4cG9ydHMudGlja3NUb0JhcnMgPSB0aWNrc1RvQmFycztcbmV4cG9ydHMubWlsbGlzVG9CYXJzID0gbWlsbGlzVG9CYXJzO1xuZXhwb3J0cy5nZXRQb3NpdGlvbjIgPSBnZXRQb3NpdGlvbjI7XG5leHBvcnRzLmNhbGN1bGF0ZVBvc2l0aW9uID0gY2FsY3VsYXRlUG9zaXRpb247XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgc3VwcG9ydGVkVHlwZXMgPSAnYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBwZXJjIHBlcmNlbnRhZ2UnLFxuICAgIHN1cHBvcnRlZFJldHVyblR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgYWxsJyxcbiAgICBmbG9vciA9IE1hdGguZmxvb3IsXG4gICAgcm91bmQgPSBNYXRoLnJvdW5kO1xuXG52YXJcbi8vbG9jYWxcbmJwbSA9IHZvaWQgMCxcbiAgICBub21pbmF0b3IgPSB2b2lkIDAsXG4gICAgZGVub21pbmF0b3IgPSB2b2lkIDAsXG4gICAgdGlja3NQZXJCZWF0ID0gdm9pZCAwLFxuICAgIHRpY2tzUGVyQmFyID0gdm9pZCAwLFxuICAgIHRpY2tzUGVyU2l4dGVlbnRoID0gdm9pZCAwLFxuICAgIG1pbGxpc1BlclRpY2sgPSB2b2lkIDAsXG4gICAgc2Vjb25kc1BlclRpY2sgPSB2b2lkIDAsXG4gICAgbnVtU2l4dGVlbnRoID0gdm9pZCAwLFxuICAgIHRpY2tzID0gdm9pZCAwLFxuICAgIG1pbGxpcyA9IHZvaWQgMCxcbiAgICBkaWZmVGlja3MgPSB2b2lkIDAsXG4gICAgZGlmZk1pbGxpcyA9IHZvaWQgMCxcbiAgICBiYXIgPSB2b2lkIDAsXG4gICAgYmVhdCA9IHZvaWQgMCxcbiAgICBzaXh0ZWVudGggPSB2b2lkIDAsXG4gICAgdGljayA9IHZvaWQgMCxcblxuXG4vLyAgdHlwZSxcbmluZGV4ID0gdm9pZCAwLFxuICAgIHJldHVyblR5cGUgPSAnYWxsJyxcbiAgICBiZXlvbmRFbmRPZlNvbmcgPSB0cnVlO1xuXG5mdW5jdGlvbiBnZXRUaW1lRXZlbnQoc29uZywgdW5pdCwgdGFyZ2V0KSB7XG4gIC8vIGZpbmRzIHRoZSB0aW1lIGV2ZW50IHRoYXQgY29tZXMgdGhlIGNsb3Nlc3QgYmVmb3JlIHRoZSB0YXJnZXQgcG9zaXRpb25cbiAgdmFyIHRpbWVFdmVudHMgPSBzb25nLl90aW1lRXZlbnRzO1xuICAvL2NvbnNvbGUubG9nKHNvbmcuX3RpbWVFdmVudHMsIHVuaXQsIHRhcmdldClcblxuICBmb3IgKHZhciBpID0gdGltZUV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBldmVudCA9IHRpbWVFdmVudHNbaV07XG4gICAgLy9jb25zb2xlLmxvZyh1bml0LCB0YXJnZXQsIGV2ZW50KVxuICAgIGlmIChldmVudFt1bml0XSA8PSB0YXJnZXQpIHtcbiAgICAgIGluZGV4ID0gaTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIG1pbGxpc1RvVGlja3Moc29uZywgdGFyZ2V0TWlsbGlzKSB7XG4gIHZhciBiZW9zID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGFyZ3VtZW50c1syXTtcblxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zO1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldE1pbGxpcyk7XG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzO1xufVxuXG5mdW5jdGlvbiB0aWNrc1RvTWlsbGlzKHNvbmcsIHRhcmdldFRpY2tzKSB7XG4gIHZhciBiZW9zID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGFyZ3VtZW50c1syXTtcblxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zO1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0VGlja3MpO1xuICByZXR1cm4gbWlsbGlzO1xufVxuXG5mdW5jdGlvbiBiYXJzVG9NaWxsaXMoc29uZywgcG9zaXRpb24sIGJlb3MpIHtcbiAgLy8gYmVvcyA9IGJleW9uZEVuZE9mU29uZ1xuICBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0JyxcbiAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgcmVzdWx0OiAnbWlsbGlzJyxcbiAgICBiZW9zOiBiZW9zXG4gIH0pO1xuICByZXR1cm4gbWlsbGlzO1xufVxuXG5mdW5jdGlvbiBiYXJzVG9UaWNrcyhzb25nLCBwb3NpdGlvbiwgYmVvcykge1xuICAvLyBiZW9zID0gYmV5b25kRW5kT2ZTb25nXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgcmVzdWx0OiAndGlja3MnLFxuICAgIGJlb3M6IGJlb3NcbiAgfSk7XG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzO1xufVxuXG5mdW5jdGlvbiB0aWNrc1RvQmFycyhzb25nLCB0YXJnZXQpIHtcbiAgdmFyIGJlb3MgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyB0cnVlIDogYXJndW1lbnRzWzJdO1xuXG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3M7XG4gIGZyb21UaWNrcyhzb25nLCB0YXJnZXQpO1xuICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgcmV0dXJuVHlwZSA9ICdiYXJzYW5kYmVhdHMnO1xuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKCk7XG59XG5cbmZ1bmN0aW9uIG1pbGxpc1RvQmFycyhzb25nLCB0YXJnZXQpIHtcbiAgdmFyIGJlb3MgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyB0cnVlIDogYXJndW1lbnRzWzJdO1xuXG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3M7XG4gIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0KTtcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJztcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpO1xufVxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciBtaWxsaXMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0TWlsbGlzLCBldmVudCkge1xuICB2YXIgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmIChiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKSB7XG4gICAgaWYgKHRhcmdldE1pbGxpcyA+IGxhc3RFdmVudC5taWxsaXMpIHtcbiAgICAgIHRhcmdldE1pbGxpcyA9IGxhc3RFdmVudC5taWxsaXM7XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnbWlsbGlzJywgdGFyZ2V0TWlsbGlzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IG1pbGxpcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmIChldmVudC5taWxsaXMgPT09IHRhcmdldE1pbGxpcykge1xuICAgIGRpZmZNaWxsaXMgPSAwO1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gIH0gZWxzZSB7XG4gICAgZGlmZk1pbGxpcyA9IHRhcmdldE1pbGxpcyAtIGV2ZW50Lm1pbGxpcztcbiAgICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgcmV0dXJuIHRpY2tzO1xufVxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciB0aWNrcyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbVRpY2tzKHNvbmcsIHRhcmdldFRpY2tzLCBldmVudCkge1xuICB2YXIgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmIChiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKSB7XG4gICAgaWYgKHRhcmdldFRpY2tzID4gbGFzdEV2ZW50LnRpY2tzKSB7XG4gICAgICB0YXJnZXRUaWNrcyA9IGxhc3RFdmVudC50aWNrcztcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICd0aWNrcycsIHRhcmdldFRpY2tzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IHRpY2tzLCBjYWxjdWxhdGUgdGhlIGRpZmZcbiAgaWYgKGV2ZW50LnRpY2tzID09PSB0YXJnZXRUaWNrcykge1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gICAgZGlmZk1pbGxpcyA9IDA7XG4gIH0gZWxzZSB7XG4gICAgZGlmZlRpY2tzID0gdGFyZ2V0VGlja3MgLSB0aWNrcztcbiAgICBkaWZmTWlsbGlzID0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIHRpY2tzICs9IGRpZmZUaWNrcztcbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG5cbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgYmFycyBhbmQgYmVhdHMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21CYXJzKHNvbmcsIHRhcmdldEJhciwgdGFyZ2V0QmVhdCwgdGFyZ2V0U2l4dGVlbnRoLCB0YXJnZXRUaWNrKSB7XG4gIHZhciBldmVudCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNSB8fCBhcmd1bWVudHNbNV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbNV07XG5cbiAgLy9jb25zb2xlLnRpbWUoJ2Zyb21CYXJzJyk7XG4gIHZhciBpID0gMCxcbiAgICAgIGRpZmZCYXJzID0gdm9pZCAwLFxuICAgICAgZGlmZkJlYXRzID0gdm9pZCAwLFxuICAgICAgZGlmZlNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICAgIGRpZmZUaWNrID0gdm9pZCAwLFxuICAgICAgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmIChiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKSB7XG4gICAgaWYgKHRhcmdldEJhciA+IGxhc3RFdmVudC5iYXIpIHtcbiAgICAgIHRhcmdldEJhciA9IGxhc3RFdmVudC5iYXI7XG4gICAgfVxuICB9XG5cbiAgaWYgKGV2ZW50ID09PSBudWxsKSB7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ2JhcicsIHRhcmdldEJhcik7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy9jb3JyZWN0IHdyb25nIHBvc2l0aW9uIGRhdGEsIGZvciBpbnN0YW5jZTogJzMsMywyLDc4OCcgYmVjb21lcyAnMyw0LDQsMDY4JyBpbiBhIDQvNCBtZWFzdXJlIGF0IFBQUSA0ODBcbiAgd2hpbGUgKHRhcmdldFRpY2sgPj0gdGlja3NQZXJTaXh0ZWVudGgpIHtcbiAgICB0YXJnZXRTaXh0ZWVudGgrKztcbiAgICB0YXJnZXRUaWNrIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICB9XG5cbiAgd2hpbGUgKHRhcmdldFNpeHRlZW50aCA+IG51bVNpeHRlZW50aCkge1xuICAgIHRhcmdldEJlYXQrKztcbiAgICB0YXJnZXRTaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICB9XG5cbiAgd2hpbGUgKHRhcmdldEJlYXQgPiBub21pbmF0b3IpIHtcbiAgICB0YXJnZXRCYXIrKztcbiAgICB0YXJnZXRCZWF0IC09IG5vbWluYXRvcjtcbiAgfVxuXG4gIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdiYXInLCB0YXJnZXRCYXIsIGluZGV4KTtcbiAgZm9yIChpID0gaW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgZXZlbnQgPSBzb25nLl90aW1lRXZlbnRzW2ldO1xuICAgIGlmIChldmVudC5iYXIgPD0gdGFyZ2V0QmFyKSB7XG4gICAgICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIGdldCB0aGUgZGlmZmVyZW5jZXNcbiAgZGlmZlRpY2sgPSB0YXJnZXRUaWNrIC0gdGljaztcbiAgZGlmZlNpeHRlZW50aCA9IHRhcmdldFNpeHRlZW50aCAtIHNpeHRlZW50aDtcbiAgZGlmZkJlYXRzID0gdGFyZ2V0QmVhdCAtIGJlYXQ7XG4gIGRpZmZCYXJzID0gdGFyZ2V0QmFyIC0gYmFyOyAvL2JhciBpcyBhbHdheXMgbGVzcyB0aGVuIG9yIGVxdWFsIHRvIHRhcmdldEJhciwgc28gZGlmZkJhcnMgaXMgYWx3YXlzID49IDBcblxuICAvL2NvbnNvbGUubG9nKCdkaWZmJyxkaWZmQmFycyxkaWZmQmVhdHMsZGlmZlNpeHRlZW50aCxkaWZmVGljayk7XG4gIC8vY29uc29sZS5sb2coJ21pbGxpcycsbWlsbGlzLHRpY2tzUGVyQmFyLHRpY2tzUGVyQmVhdCx0aWNrc1BlclNpeHRlZW50aCxtaWxsaXNQZXJUaWNrKTtcblxuICAvLyBjb252ZXJ0IGRpZmZlcmVuY2VzIHRvIG1pbGxpc2Vjb25kcyBhbmQgdGlja3NcbiAgZGlmZk1pbGxpcyA9IGRpZmZCYXJzICogdGlja3NQZXJCYXIgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IGRpZmZCZWF0cyAqIHRpY2tzUGVyQmVhdCAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gZGlmZlNpeHRlZW50aCAqIHRpY2tzUGVyU2l4dGVlbnRoICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSBkaWZmVGljayAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZUaWNrcyA9IGRpZmZNaWxsaXMgLyBtaWxsaXNQZXJUaWNrO1xuICAvL2NvbnNvbGUubG9nKGRpZmZCYXJzLCB0aWNrc1BlckJhciwgbWlsbGlzUGVyVGljaywgZGlmZk1pbGxpcywgZGlmZlRpY2tzKTtcblxuICAvLyBzZXQgYWxsIGN1cnJlbnQgcG9zaXRpb24gZGF0YVxuICBiYXIgPSB0YXJnZXRCYXI7XG4gIGJlYXQgPSB0YXJnZXRCZWF0O1xuICBzaXh0ZWVudGggPSB0YXJnZXRTaXh0ZWVudGg7XG4gIHRpY2sgPSB0YXJnZXRUaWNrO1xuICAvL2NvbnNvbGUubG9nKHRpY2ssIHRhcmdldFRpY2spXG5cbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG4gIC8vY29uc29sZS5sb2codGFyZ2V0QmFyLCB0YXJnZXRCZWF0LCB0YXJnZXRTaXh0ZWVudGgsIHRhcmdldFRpY2ssICcgLT4gJywgbWlsbGlzKTtcbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuXG4gIC8vY29uc29sZS50aW1lRW5kKCdmcm9tQmFycycpO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKSB7XG4gIC8vIHNwcmVhZCB0aGUgZGlmZmVyZW5jZSBpbiB0aWNrIG92ZXIgYmFycywgYmVhdHMgYW5kIHNpeHRlZW50aFxuICB2YXIgdG1wID0gcm91bmQoZGlmZlRpY2tzKTtcbiAgd2hpbGUgKHRtcCA+PSB0aWNrc1BlclNpeHRlZW50aCkge1xuICAgIHNpeHRlZW50aCsrO1xuICAgIHRtcCAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICB3aGlsZSAoc2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKSB7XG4gICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgYmVhdCsrO1xuICAgICAgd2hpbGUgKGJlYXQgPiBub21pbmF0b3IpIHtcbiAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgIGJhcisrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB0aWNrID0gcm91bmQodG1wKTtcbn1cblxuLy8gc3RvcmUgcHJvcGVydGllcyBvZiBldmVudCBpbiBsb2NhbCBzY29wZVxuZnVuY3Rpb24gZ2V0RGF0YUZyb21FdmVudChldmVudCkge1xuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcbiAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBiYXIgPSBldmVudC5iYXI7XG4gIGJlYXQgPSBldmVudC5iZWF0O1xuICBzaXh0ZWVudGggPSBldmVudC5zaXh0ZWVudGg7XG4gIHRpY2sgPSBldmVudC50aWNrO1xuXG4gIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAvL2NvbnNvbGUubG9nKGJwbSwgZXZlbnQudHlwZSk7XG4gIC8vY29uc29sZS5sb2coJ3RpY2tzJywgdGlja3MsICdtaWxsaXMnLCBtaWxsaXMsICdiYXInLCBiYXIpO1xufVxuXG5mdW5jdGlvbiBnZXRQb3NpdGlvbkRhdGEoc29uZykge1xuICB2YXIgdGltZURhdGEgPSB2b2lkIDAsXG4gICAgICBwb3NpdGlvbkRhdGEgPSB7fTtcblxuICBzd2l0Y2ggKHJldHVyblR5cGUpIHtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5taWxsaXMgPSBtaWxsaXM7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzID0gcm91bmQobWlsbGlzICogMTAwMCkgLyAxMDAwO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1JvdW5kZWQgPSByb3VuZChtaWxsaXMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrcyA9IHRpY2tzO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzID0gcm91bmQodGlja3MpO1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3NVbnJvdW5kZWQgPSB0aWNrcztcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgcG9zaXRpb25EYXRhLmJhciA9IGJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5iZWF0ID0gYmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEudGljayA9IHRpY2s7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGlja0FzU3RyaW5nO1xuICAgICAgcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyBnZXRUaWNrQXNTdHJpbmcodGljayk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgdGltZURhdGEgPSAoMCwgX3V0aWwuZ2V0TmljZVRpbWUpKG1pbGxpcyk7XG4gICAgICBwb3NpdGlvbkRhdGEuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gICAgICBwb3NpdGlvbkRhdGEubWludXRlID0gdGltZURhdGEubWludXRlO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIC8vIG1pbGxpc1xuICAgICAgLy9wb3NpdGlvbkRhdGEubWlsbGlzID0gbWlsbGlzO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpcyA9IHJvdW5kKG1pbGxpcyAqIDEwMDApIC8gMTAwMDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNSb3VuZGVkID0gcm91bmQobWlsbGlzKTtcblxuICAgICAgLy8gdGlja3NcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzID0gdGlja3M7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3MgPSByb3VuZCh0aWNrcyk7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrc1Vucm91bmRlZCA9IHRpY2tzO1xuXG4gICAgICAvLyBiYXJzYmVhdHNcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXIgPSBiYXI7XG4gICAgICBwb3NpdGlvbkRhdGEuYmVhdCA9IGJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2sgPSB0aWNrO1xuICAgICAgLy9wb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2tBc1N0cmluZztcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgZ2V0VGlja0FzU3RyaW5nKHRpY2spO1xuXG4gICAgICAvLyB0aW1lXG4gICAgICB0aW1lRGF0YSA9ICgwLCBfdXRpbC5nZXROaWNlVGltZSkobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuXG4gICAgICAvLyBleHRyYSBkYXRhXG4gICAgICBwb3NpdGlvbkRhdGEuYnBtID0gcm91bmQoYnBtICogc29uZy5wbGF5YmFja1NwZWVkLCAzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gICAgICBwb3NpdGlvbkRhdGEuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyQmFyID0gdGlja3NQZXJCYXI7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgICAgIHBvc2l0aW9uRGF0YS5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUGVyVGljayA9IG1pbGxpc1BlclRpY2s7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljaztcblxuICAgICAgLy8gdXNlIHRpY2tzIHRvIG1ha2UgdGVtcG8gY2hhbmdlcyB2aXNpYmxlIGJ5IGEgZmFzdGVyIG1vdmluZyBwbGF5aGVhZFxuICAgICAgcG9zaXRpb25EYXRhLnBlcmNlbnRhZ2UgPSB0aWNrcyAvIHNvbmcuX2R1cmF0aW9uVGlja3M7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5wZXJjZW50YWdlID0gbWlsbGlzIC8gc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbkRhdGE7XG59XG5cbmZ1bmN0aW9uIGdldFRpY2tBc1N0cmluZyh0KSB7XG4gIGlmICh0ID09PSAwKSB7XG4gICAgdCA9ICcwMDAnO1xuICB9IGVsc2UgaWYgKHQgPCAxMCkge1xuICAgIHQgPSAnMDAnICsgdDtcbiAgfSBlbHNlIGlmICh0IDwgMTAwKSB7XG4gICAgdCA9ICcwJyArIHQ7XG4gIH1cbiAgcmV0dXJuIHQ7XG59XG5cbi8vIHVzZWQgYnkgcGxheWhlYWRcbmZ1bmN0aW9uIGdldFBvc2l0aW9uMihzb25nLCB1bml0LCB0YXJnZXQsIHR5cGUsIGV2ZW50KSB7XG4gIGlmICh1bml0ID09PSAnbWlsbGlzJykge1xuICAgIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0LCBldmVudCk7XG4gIH0gZWxzZSBpZiAodW5pdCA9PT0gJ3RpY2tzJykge1xuICAgIGZyb21UaWNrcyhzb25nLCB0YXJnZXQsIGV2ZW50KTtcbiAgfVxuICByZXR1cm5UeXBlID0gdHlwZTtcbiAgaWYgKHJldHVyblR5cGUgPT09ICdhbGwnKSB7XG4gICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gIH1cbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcbn1cblxuLy8gaW1wcm92ZWQgdmVyc2lvbiBvZiBnZXRQb3NpdGlvblxuZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb24oc29uZywgc2V0dGluZ3MpIHtcbiAgdmFyIHR5cGUgPSBzZXR0aW5ncy50eXBlO1xuICB2YXIgLy8gYW55IG9mIGJhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlXG4gIHRhcmdldCA9IHNldHRpbmdzLnRhcmdldDtcbiAgdmFyIF9zZXR0aW5ncyRyZXN1bHQgPSBzZXR0aW5ncy5yZXN1bHQ7XG4gIHZhciByZXN1bHQgPSBfc2V0dGluZ3MkcmVzdWx0ID09PSB1bmRlZmluZWQgPyAnYWxsJyA6IF9zZXR0aW5ncyRyZXN1bHQ7XG4gIHZhciBfc2V0dGluZ3MkYmVvcyA9IHNldHRpbmdzLmJlb3M7XG4gIHZhciBiZW9zID0gX3NldHRpbmdzJGJlb3MgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBfc2V0dGluZ3MkYmVvcztcbiAgdmFyIF9zZXR0aW5ncyRzbmFwID0gc2V0dGluZ3Muc25hcDtcbiAgdmFyIHNuYXAgPSBfc2V0dGluZ3Mkc25hcCA9PT0gdW5kZWZpbmVkID8gLTEgOiBfc2V0dGluZ3Mkc25hcDtcblxuXG4gIGlmIChzdXBwb3J0ZWRSZXR1cm5UeXBlcy5pbmRleE9mKHJlc3VsdCkgPT09IC0xKSB7XG4gICAgY29uc29sZS53YXJuKCd1bnN1cHBvcnRlZCByZXR1cm4gdHlwZSwgXFwnYWxsXFwnIHVzZWQgaW5zdGVhZCBvZiBcXCcnICsgcmVzdWx0ICsgJ1xcJycpO1xuICAgIHJlc3VsdCA9ICdhbGwnO1xuICB9XG5cbiAgcmV0dXJuVHlwZSA9IHJlc3VsdDtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvcztcblxuICBpZiAoc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSA9PT0gLTEpIHtcbiAgICBjb25zb2xlLmVycm9yKCd1bnN1cHBvcnRlZCB0eXBlICcgKyB0eXBlKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzd2l0Y2ggKHR5cGUpIHtcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIHZhciBfdGFyZ2V0ID0gX3NsaWNlZFRvQXJyYXkodGFyZ2V0LCA0KTtcblxuICAgICAgdmFyIF90YXJnZXQkID0gX3RhcmdldFswXTtcbiAgICAgIHZhciB0YXJnZXRiYXIgPSBfdGFyZ2V0JCA9PT0gdW5kZWZpbmVkID8gMSA6IF90YXJnZXQkO1xuICAgICAgdmFyIF90YXJnZXQkMiA9IF90YXJnZXRbMV07XG4gICAgICB2YXIgdGFyZ2V0YmVhdCA9IF90YXJnZXQkMiA9PT0gdW5kZWZpbmVkID8gMSA6IF90YXJnZXQkMjtcbiAgICAgIHZhciBfdGFyZ2V0JDMgPSBfdGFyZ2V0WzJdO1xuICAgICAgdmFyIHRhcmdldHNpeHRlZW50aCA9IF90YXJnZXQkMyA9PT0gdW5kZWZpbmVkID8gMSA6IF90YXJnZXQkMztcbiAgICAgIHZhciBfdGFyZ2V0JDQgPSBfdGFyZ2V0WzNdO1xuICAgICAgdmFyIHRhcmdldHRpY2sgPSBfdGFyZ2V0JDQgPT09IHVuZGVmaW5lZCA/IDAgOiBfdGFyZ2V0JDQ7XG4gICAgICAvL2NvbnNvbGUubG9nKHRhcmdldGJhciwgdGFyZ2V0YmVhdCwgdGFyZ2V0c2l4dGVlbnRoLCB0YXJnZXR0aWNrKVxuXG4gICAgICBmcm9tQmFycyhzb25nLCB0YXJnZXRiYXIsIHRhcmdldGJlYXQsIHRhcmdldHNpeHRlZW50aCwgdGFyZ2V0dGljayk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICAvLyBjYWxjdWxhdGUgbWlsbGlzIG91dCBvZiB0aW1lIGFycmF5OiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG5cbiAgICAgIHZhciBfdGFyZ2V0MiA9IF9zbGljZWRUb0FycmF5KHRhcmdldCwgNCk7XG5cbiAgICAgIHZhciBfdGFyZ2V0MiQgPSBfdGFyZ2V0MlswXTtcbiAgICAgIHZhciB0YXJnZXRob3VyID0gX3RhcmdldDIkID09PSB1bmRlZmluZWQgPyAwIDogX3RhcmdldDIkO1xuICAgICAgdmFyIF90YXJnZXQyJDIgPSBfdGFyZ2V0MlsxXTtcbiAgICAgIHZhciB0YXJnZXRtaW51dGUgPSBfdGFyZ2V0MiQyID09PSB1bmRlZmluZWQgPyAwIDogX3RhcmdldDIkMjtcbiAgICAgIHZhciBfdGFyZ2V0MiQzID0gX3RhcmdldDJbMl07XG4gICAgICB2YXIgdGFyZ2V0c2Vjb25kID0gX3RhcmdldDIkMyA9PT0gdW5kZWZpbmVkID8gMCA6IF90YXJnZXQyJDM7XG4gICAgICB2YXIgX3RhcmdldDIkNCA9IF90YXJnZXQyWzNdO1xuICAgICAgdmFyIHRhcmdldG1pbGxpc2Vjb25kID0gX3RhcmdldDIkNCA9PT0gdW5kZWZpbmVkID8gMCA6IF90YXJnZXQyJDQ7XG5cbiAgICAgIHZhciBtaWxsaXMgPSAwO1xuICAgICAgbWlsbGlzICs9IHRhcmdldGhvdXIgKiA2MCAqIDYwICogMTAwMDsgLy9ob3Vyc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbnV0ZSAqIDYwICogMTAwMDsgLy9taW51dGVzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0c2Vjb25kICogMTAwMDsgLy9zZWNvbmRzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0bWlsbGlzZWNvbmQ7IC8vbWlsbGlzZWNvbmRzXG5cbiAgICAgIGZyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldCk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICAvL2NvbnNvbGUubG9nKHNvbmcsIHRhcmdldClcbiAgICAgIGZyb21UaWNrcyhzb25nLCB0YXJnZXQpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAncGVyYyc6XG4gICAgY2FzZSAncGVyY2VudGFnZSc6XG5cbiAgICAgIC8vbWlsbGlzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgLy9mcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pbGxpcyk7XG5cbiAgICAgIHRpY2tzID0gdGFyZ2V0ICogc29uZy5fZHVyYXRpb25UaWNrczsgLy8gdGFyZ2V0IG11c3QgYmUgaW4gdGlja3MhXG4gICAgICAvL2NvbnNvbGUubG9nKHRpY2tzLCBzb25nLl9kdXJhdGlvblRpY2tzKVxuICAgICAgaWYgKHNuYXAgIT09IC0xKSB7XG4gICAgICAgIHRpY2tzID0gZmxvb3IodGlja3MgLyBzbmFwKSAqIHNuYXA7XG4gICAgICAgIC8vZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcyk7XG4gICAgICB9XG4gICAgICBmcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICB2YXIgdG1wID0gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZygnZGlmZicsIHBvc2l0aW9uWzFdIC0gdG1wLnBlcmNlbnRhZ2UpO1xuICAgICAgcmV0dXJuIHRtcDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLypcblxuLy9AcGFyYW06ICdtaWxsaXMnLCAxMDAwLCBbdHJ1ZV1cbi8vQHBhcmFtOiAndGlja3MnLCAxMDAwLCBbdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgMSwgWydhbGwnLCB0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCA2MCwgNCwgMywgMTIwLCBbJ2FsbCcsIHRydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDYwLCA0LCAzLCAxMjAsIFt0cnVlLCAnYWxsJ11cblxuZnVuY3Rpb24gY2hlY2tQb3NpdGlvbih0eXBlLCBhcmdzLCByZXR1cm5UeXBlID0gJ2FsbCcpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSB0cnVlO1xuICBjb25zb2xlLmxvZygnLS0tLT4gY2hlY2tQb3NpdGlvbjonLCBhcmdzLCB0eXBlU3RyaW5nKGFyZ3MpKTtcblxuICBpZih0eXBlU3RyaW5nKGFyZ3MpID09PSAnYXJyYXknKXtcbiAgICBsZXRcbiAgICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICAgIHBvc2l0aW9uLFxuICAgICAgaSwgYSwgcG9zaXRpb25MZW5ndGg7XG5cbiAgICB0eXBlID0gYXJnc1swXTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIFtbJ21pbGxpcycsIDMwMDBdXVxuICAgIGlmKHR5cGVTdHJpbmcoYXJnc1swXSkgPT09ICdhcnJheScpe1xuICAgICAgLy9jb25zb2xlLndhcm4oJ3RoaXMgc2hvdWxkblxcJ3QgaGFwcGVuIScpO1xuICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICB0eXBlID0gYXJnc1swXTtcbiAgICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IFt0eXBlXTtcblxuICAgIGNvbnNvbGUubG9nKCdjaGVjayBwb3NpdGlvbicsIGFyZ3MsIG51bUFyZ3MsIHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkpO1xuXG4gICAgLy9jb25zb2xlLmxvZygnYXJnJywgMCwgJy0+JywgdHlwZSk7XG5cbiAgICBpZihzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpICE9PSAtMSl7XG4gICAgICBmb3IoaSA9IDE7IGkgPCBudW1BcmdzOyBpKyspe1xuICAgICAgICBhID0gYXJnc1tpXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnYXJnJywgaSwgJy0+JywgYSk7XG4gICAgICAgIGlmKGEgPT09IHRydWUgfHwgYSA9PT0gZmFsc2Upe1xuICAgICAgICAgIGJleW9uZEVuZE9mU29uZyA9IGE7XG4gICAgICAgIH1lbHNlIGlmKGlzTmFOKGEpKXtcbiAgICAgICAgICBpZihzdXBwb3J0ZWRSZXR1cm5UeXBlcy5pbmRleE9mKGEpICE9PSAtMSl7XG4gICAgICAgICAgICByZXR1cm5UeXBlID0gYTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICBwb3NpdGlvbi5wdXNoKGEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL2NoZWNrIG51bWJlciBvZiBhcmd1bWVudHMgLT4gZWl0aGVyIDEgbnVtYmVyIG9yIDQgbnVtYmVycyBpbiBwb3NpdGlvbiwgZS5nLiBbJ2JhcnNiZWF0cycsIDFdIG9yIFsnYmFyc2JlYXRzJywgMSwgMSwgMSwgMF0sXG4gICAgICAvLyBvciBbJ3BlcmMnLCAwLjU2LCBudW1iZXJPZlRpY2tzVG9TbmFwVG9dXG4gICAgICBwb3NpdGlvbkxlbmd0aCA9IHBvc2l0aW9uLmxlbmd0aDtcbiAgICAgIGlmKHBvc2l0aW9uTGVuZ3RoICE9PSAyICYmIHBvc2l0aW9uTGVuZ3RoICE9PSAzICYmIHBvc2l0aW9uTGVuZ3RoICE9PSA1KXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyhwb3NpdGlvbiwgcmV0dXJuVHlwZSwgYmV5b25kRW5kT2ZTb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9zaXRpb24oc29uZywgdHlwZSwgYXJncyl7XG4gIC8vY29uc29sZS5sb2coJ2dldFBvc2l0aW9uJywgYXJncyk7XG5cbiAgaWYodHlwZW9mIGFyZ3MgPT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4ge1xuICAgICAgbWlsbGlzOiAwXG4gICAgfVxuICB9XG5cbiAgbGV0IHBvc2l0aW9uID0gY2hlY2tQb3NpdGlvbih0eXBlLCBhcmdzKSxcbiAgICBtaWxsaXMsIHRtcCwgc25hcDtcblxuXG4gIGlmKHBvc2l0aW9uID09PSBmYWxzZSl7XG4gICAgZXJyb3IoJ3dyb25nIHBvc2l0aW9uIGRhdGEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzd2l0Y2godHlwZSl7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBmcm9tQmFycyhzb25nLCBwb3NpdGlvblsxXSwgcG9zaXRpb25bMl0sIHBvc2l0aW9uWzNdLCBwb3NpdGlvbls0XSk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICAvLyBjYWxjdWxhdGUgbWlsbGlzIG91dCBvZiB0aW1lIGFycmF5OiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG4gICAgICBtaWxsaXMgPSAwO1xuICAgICAgdG1wID0gcG9zaXRpb25bMV0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiA2MCAqIDYwICogMTAwMDsgLy9ob3Vyc1xuICAgICAgdG1wID0gcG9zaXRpb25bMl0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiA2MCAqIDEwMDA7IC8vbWludXRlc1xuICAgICAgdG1wID0gcG9zaXRpb25bM10gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiAxMDAwOyAvL3NlY29uZHNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzRdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wOyAvL21pbGxpc2Vjb25kc1xuXG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBwb3NpdGlvblsxXSk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICBmcm9tVGlja3Moc29uZywgcG9zaXRpb25bMV0pO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAncGVyYyc6XG4gICAgY2FzZSAncGVyY2VudGFnZSc6XG4gICAgICBzbmFwID0gcG9zaXRpb25bMl07XG5cbiAgICAgIC8vbWlsbGlzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgLy9mcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pbGxpcyk7XG5cbiAgICAgIHRpY2tzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uVGlja3M7XG4gICAgICBpZihzbmFwICE9PSB1bmRlZmluZWQpe1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzL3NuYXApICogc25hcDtcbiAgICAgICAgLy9mcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRpY2tzKTtcbiAgICAgIH1cbiAgICAgIGZyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHRtcCA9IGdldFBvc2l0aW9uRGF0YShzb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXA7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4qLyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuRGVsYXkgPSBleHBvcnRzLkNvbnZvbHV0aW9uUmV2ZXJiID0gZXhwb3J0cy5TYW1wbGVyID0gZXhwb3J0cy5TaW1wbGVTeW50aCA9IGV4cG9ydHMuSW5zdHJ1bWVudCA9IGV4cG9ydHMuUGFydCA9IGV4cG9ydHMuVHJhY2sgPSBleHBvcnRzLlNvbmcgPSBleHBvcnRzLk1JRElOb3RlID0gZXhwb3J0cy5NSURJRXZlbnQgPSBleHBvcnRzLmdldE5vdGVEYXRhID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0c0J5SWQgPSBleHBvcnRzLmdldE1JRElJbnB1dHNCeUlkID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0SWRzID0gZXhwb3J0cy5nZXRNSURJSW5wdXRJZHMgPSBleHBvcnRzLmdldE1JRElPdXRwdXRzID0gZXhwb3J0cy5nZXRNSURJSW5wdXRzID0gZXhwb3J0cy5nZXRNSURJQWNjZXNzID0gZXhwb3J0cy5zZXRNYXN0ZXJWb2x1bWUgPSBleHBvcnRzLmdldE1hc3RlclZvbHVtZSA9IGV4cG9ydHMuZ2V0QXVkaW9Db250ZXh0ID0gZXhwb3J0cy5wYXJzZU1JRElGaWxlID0gZXhwb3J0cy5wYXJzZVNhbXBsZXMgPSBleHBvcnRzLk1JRElFdmVudFR5cGVzID0gZXhwb3J0cy5nZXRTZXR0aW5ncyA9IGV4cG9ydHMudXBkYXRlU2V0dGluZ3MgPSBleHBvcnRzLmdldEdNSW5zdHJ1bWVudHMgPSBleHBvcnRzLmdldEluc3RydW1lbnRzID0gZXhwb3J0cy5pbml0ID0gZXhwb3J0cy52ZXJzaW9uID0gdW5kZWZpbmVkO1xuXG52YXIgX3NldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpO1xuXG52YXIgX25vdGUgPSByZXF1aXJlKCcuL25vdGUnKTtcblxudmFyIF9taWRpX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpX2V2ZW50Jyk7XG5cbnZhciBfbWlkaV9ub3RlID0gcmVxdWlyZSgnLi9taWRpX25vdGUnKTtcblxudmFyIF9wYXJ0ID0gcmVxdWlyZSgnLi9wYXJ0Jyk7XG5cbnZhciBfdHJhY2sgPSByZXF1aXJlKCcuL3RyYWNrJyk7XG5cbnZhciBfc29uZyA9IHJlcXVpcmUoJy4vc29uZycpO1xuXG52YXIgX2luc3RydW1lbnQgPSByZXF1aXJlKCcuL2luc3RydW1lbnQnKTtcblxudmFyIF9zYW1wbGVyID0gcmVxdWlyZSgnLi9zYW1wbGVyJyk7XG5cbnZhciBfc2ltcGxlX3N5bnRoID0gcmVxdWlyZSgnLi9zaW1wbGVfc3ludGgnKTtcblxudmFyIF9jb252b2x1dGlvbl9yZXZlcmIgPSByZXF1aXJlKCcuL2NvbnZvbHV0aW9uX3JldmVyYicpO1xuXG52YXIgX2RlbGF5X2Z4ID0gcmVxdWlyZSgnLi9kZWxheV9meCcpO1xuXG52YXIgX21pZGlmaWxlID0gcmVxdWlyZSgnLi9taWRpZmlsZScpO1xuXG52YXIgX2luaXQgPSByZXF1aXJlKCcuL2luaXQnKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfaW5pdF9taWRpID0gcmVxdWlyZSgnLi9pbml0X21pZGknKTtcblxudmFyIF9wYXJzZV9hdWRpbyA9IHJlcXVpcmUoJy4vcGFyc2VfYXVkaW8nKTtcblxudmFyIF9jb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG52YXIgX2V2ZW50bGlzdGVuZXIgPSByZXF1aXJlKCcuL2V2ZW50bGlzdGVuZXInKTtcblxudmFyIHZlcnNpb24gPSAnMS4wLjAtYmV0YTMxJztcblxudmFyIGdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uIGdldEF1ZGlvQ29udGV4dCgpIHtcbiAgcmV0dXJuIF9pbml0X2F1ZGlvLmNvbnRleHQ7XG59O1xuXG52YXIgcWFtYmkgPSB7XG4gIHZlcnNpb246IHZlcnNpb24sXG5cbiAgLy8gZnJvbSAuL3NldHRpbmdzXG4gIHVwZGF0ZVNldHRpbmdzOiBfc2V0dGluZ3MudXBkYXRlU2V0dGluZ3MsXG4gIGdldFNldHRpbmdzOiBfc2V0dGluZ3MuZ2V0U2V0dGluZ3MsXG5cbiAgLy8gZnJvbSAuL25vdGVcbiAgZ2V0Tm90ZURhdGE6IF9ub3RlLmdldE5vdGVEYXRhLFxuXG4gIC8vIGZyb20gLi9pbml0XG4gIGluaXQ6IF9pbml0LmluaXQsXG5cbiAgLy8gZnJvbSAuL3NldHRpbmdzXG4gIHNldEJ1ZmZlclRpbWU6IF9zZXR0aW5ncy5zZXRCdWZmZXJUaW1lLFxuXG4gIC8vIGZyb20gLi9jb25zdGFudHNcbiAgTUlESUV2ZW50VHlwZXM6IF9jb25zdGFudHMuTUlESUV2ZW50VHlwZXMsXG5cbiAgLy8gZnJvbSAuL3V0aWxcbiAgcGFyc2VTYW1wbGVzOiBfcGFyc2VfYXVkaW8ucGFyc2VTYW1wbGVzLFxuXG4gIC8vIGZyb20gLi9taWRpZmlsZVxuICBwYXJzZU1JRElGaWxlOiBfbWlkaWZpbGUucGFyc2VNSURJRmlsZSxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQ6IGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lOiBfaW5pdF9hdWRpby5nZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZTogX2luaXRfYXVkaW8uc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3M6IF9pbml0X21pZGkuZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0czogX2luaXRfbWlkaS5nZXRNSURJSW5wdXRzLFxuICBnZXRNSURJT3V0cHV0czogX2luaXRfbWlkaS5nZXRNSURJT3V0cHV0cyxcbiAgZ2V0TUlESUlucHV0SWRzOiBfaW5pdF9taWRpLmdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkczogX2luaXRfbWlkaS5nZXRNSURJT3V0cHV0SWRzLFxuICBnZXRNSURJSW5wdXRzQnlJZDogX2luaXRfbWlkaS5nZXRNSURJSW5wdXRzQnlJZCxcbiAgZ2V0TUlESU91dHB1dHNCeUlkOiBfaW5pdF9taWRpLmdldE1JRElPdXRwdXRzQnlJZCxcblxuICBnZXRJbnN0cnVtZW50czogX3NldHRpbmdzLmdldEluc3RydW1lbnRzLFxuICBnZXRHTUluc3RydW1lbnRzOiBfc2V0dGluZ3MuZ2V0R01JbnN0cnVtZW50cyxcblxuICBhZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuICgwLCBfZXZlbnRsaXN0ZW5lci5hZGRFdmVudExpc3RlbmVyKSh0eXBlLCBjYWxsYmFjayk7XG4gIH0sXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpIHtcbiAgICAoMCwgX2V2ZW50bGlzdGVuZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcikodHlwZSwgaWQpO1xuICB9LFxuXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgTUlESUV2ZW50OiBfbWlkaV9ldmVudC5NSURJRXZlbnQsXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBNSURJTm90ZTogX21pZGlfbm90ZS5NSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBTb25nOiBfc29uZy5Tb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBUcmFjazogX3RyYWNrLlRyYWNrLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIFBhcnQ6IF9wYXJ0LlBhcnQsXG5cbiAgLy8gZnJvbSAuL2luc3RydW1lbnRcbiAgSW5zdHJ1bWVudDogX2luc3RydW1lbnQuSW5zdHJ1bWVudCxcblxuICAvLyBmcm9tIC4vc2ltcGxlX3N5bnRoXG4gIFNpbXBsZVN5bnRoOiBfc2ltcGxlX3N5bnRoLlNpbXBsZVN5bnRoLFxuXG4gIC8vIGZyb20gLi9zYW1wbGVyXG4gIFNhbXBsZXI6IF9zYW1wbGVyLlNhbXBsZXIsXG5cbiAgLy8gZnJvbSAuL2NvbnZvbHV0aW9uX3JldmVyYlxuICBDb252b2x1dGlvblJldmVyYjogX2NvbnZvbHV0aW9uX3JldmVyYi5Db252b2x1dGlvblJldmVyYixcblxuICAvLyBmcm9tIC4vZGVsYXlfZnhcbiAgRGVsYXk6IF9kZWxheV9meC5EZWxheSxcblxuICBsb2c6IGZ1bmN0aW9uIGxvZyhpZCkge1xuICAgIHN3aXRjaCAoaWQpIHtcbiAgICAgIGNhc2UgJ2Z1bmN0aW9ucyc6XG4gICAgICAgIGNvbnNvbGUubG9nKCdmdW5jdGlvbnM6XFxuICAgICAgICAgIGdldEF1ZGlvQ29udGV4dFxcbiAgICAgICAgICBnZXRNYXN0ZXJWb2x1bWVcXG4gICAgICAgICAgc2V0TWFzdGVyVm9sdW1lXFxuICAgICAgICAgIGdldE1JRElBY2Nlc3NcXG4gICAgICAgICAgZ2V0TUlESUlucHV0c1xcbiAgICAgICAgICBnZXRNSURJT3V0cHV0c1xcbiAgICAgICAgICBnZXRNSURJSW5wdXRJZHNcXG4gICAgICAgICAgZ2V0TUlESU91dHB1dElkc1xcbiAgICAgICAgICBnZXRNSURJSW5wdXRzQnlJZFxcbiAgICAgICAgICBnZXRNSURJT3V0cHV0c0J5SWRcXG4gICAgICAgICAgcGFyc2VNSURJRmlsZVxcbiAgICAgICAgICBzZXRCdWZmZXJUaW1lXFxuICAgICAgICAgIGdldEluc3RydW1lbnRzXFxuICAgICAgICAgIGdldEdNSW5zdHJ1bWVudHNcXG4gICAgICAgICcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSBxYW1iaTtcbmV4cG9ydHMudmVyc2lvbiA9IHZlcnNpb247XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vaW5pdFxuaW5pdCA9IF9pbml0LmluaXQ7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vc2V0dGluZ3NcbmdldEluc3RydW1lbnRzID0gX3NldHRpbmdzLmdldEluc3RydW1lbnRzO1xuZXhwb3J0cy5nZXRHTUluc3RydW1lbnRzID0gX3NldHRpbmdzLmdldEdNSW5zdHJ1bWVudHM7XG5leHBvcnRzLnVwZGF0ZVNldHRpbmdzID0gX3NldHRpbmdzLnVwZGF0ZVNldHRpbmdzO1xuZXhwb3J0cy5nZXRTZXR0aW5ncyA9IF9zZXR0aW5ncy5nZXRTZXR0aW5ncztcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9jb25zdGFudHNcbk1JRElFdmVudFR5cGVzID0gX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcztcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi91dGlsXG5wYXJzZVNhbXBsZXMgPSBfcGFyc2VfYXVkaW8ucGFyc2VTYW1wbGVzO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL21pZGlmaWxlXG5wYXJzZU1JRElGaWxlID0gX21pZGlmaWxlLnBhcnNlTUlESUZpbGU7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vaW5pdF9hdWRpb1xuZ2V0QXVkaW9Db250ZXh0ID0gZ2V0QXVkaW9Db250ZXh0O1xuZXhwb3J0cy5nZXRNYXN0ZXJWb2x1bWUgPSBfaW5pdF9hdWRpby5nZXRNYXN0ZXJWb2x1bWU7XG5leHBvcnRzLnNldE1hc3RlclZvbHVtZSA9IF9pbml0X2F1ZGlvLnNldE1hc3RlclZvbHVtZTtcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9pbml0X21pZGlcbmdldE1JRElBY2Nlc3MgPSBfaW5pdF9taWRpLmdldE1JRElBY2Nlc3M7XG5leHBvcnRzLmdldE1JRElJbnB1dHMgPSBfaW5pdF9taWRpLmdldE1JRElJbnB1dHM7XG5leHBvcnRzLmdldE1JRElPdXRwdXRzID0gX2luaXRfbWlkaS5nZXRNSURJT3V0cHV0cztcbmV4cG9ydHMuZ2V0TUlESUlucHV0SWRzID0gX2luaXRfbWlkaS5nZXRNSURJSW5wdXRJZHM7XG5leHBvcnRzLmdldE1JRElPdXRwdXRJZHMgPSBfaW5pdF9taWRpLmdldE1JRElPdXRwdXRJZHM7XG5leHBvcnRzLmdldE1JRElJbnB1dHNCeUlkID0gX2luaXRfbWlkaS5nZXRNSURJSW5wdXRzQnlJZDtcbmV4cG9ydHMuZ2V0TUlESU91dHB1dHNCeUlkID0gX2luaXRfbWlkaS5nZXRNSURJT3V0cHV0c0J5SWQ7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vbm90ZVxuZ2V0Tm90ZURhdGEgPSBfbm90ZS5nZXROb3RlRGF0YTtcbmV4cG9ydHMuXG5cbi8vIGZyb20gLi9taWRpX2V2ZW50XG5NSURJRXZlbnQgPSBfbWlkaV9ldmVudC5NSURJRXZlbnQ7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vbWlkaV9ub3RlXG5NSURJTm90ZSA9IF9taWRpX25vdGUuTUlESU5vdGU7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vc29uZ1xuU29uZyA9IF9zb25nLlNvbmc7XG5leHBvcnRzLlxuXG4vLyBmcm9tIC4vdHJhY2tcblRyYWNrID0gX3RyYWNrLlRyYWNrO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL3BhcnRcblBhcnQgPSBfcGFydC5QYXJ0O1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL2luc3RydW1lbnRcbkluc3RydW1lbnQgPSBfaW5zdHJ1bWVudC5JbnN0cnVtZW50O1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL3NpbXBsZV9zeW50aFxuU2ltcGxlU3ludGggPSBfc2ltcGxlX3N5bnRoLlNpbXBsZVN5bnRoO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL3NhbXBsZXJcblNhbXBsZXIgPSBfc2FtcGxlci5TYW1wbGVyO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL2NvbnZvbHV0aW9uX3JldmVyYlxuQ29udm9sdXRpb25SZXZlcmIgPSBfY29udm9sdXRpb25fcmV2ZXJiLkNvbnZvbHV0aW9uUmV2ZXJiO1xuZXhwb3J0cy5cblxuLy8gZnJvbSAuL2RlbGF5X2Z4XG5EZWxheSA9IF9kZWxheV9meC5EZWxheTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlNhbXBsZSA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZXhwb3J0cy5mYWRlT3V0ID0gZmFkZU91dDtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvLmpzJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgU2FtcGxlID0gZXhwb3J0cy5TYW1wbGUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFNhbXBsZShzYW1wbGVEYXRhLCBldmVudCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTYW1wbGUpO1xuXG4gICAgdGhpcy5ldmVudCA9IGV2ZW50O1xuICAgIHRoaXMuc2FtcGxlRGF0YSA9IHNhbXBsZURhdGE7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoU2FtcGxlLCBbe1xuICAgIGtleTogJ3N0YXJ0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RhcnQodGltZSkge1xuICAgICAgdmFyIF9zYW1wbGVEYXRhID0gdGhpcy5zYW1wbGVEYXRhO1xuICAgICAgdmFyIHN1c3RhaW5TdGFydCA9IF9zYW1wbGVEYXRhLnN1c3RhaW5TdGFydDtcbiAgICAgIHZhciBzdXN0YWluRW5kID0gX3NhbXBsZURhdGEuc3VzdGFpbkVuZDtcbiAgICAgIC8vY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKVxuXG4gICAgICBpZiAoc3VzdGFpblN0YXJ0ICYmIHN1c3RhaW5FbmQpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UubG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuc291cmNlLmxvb3BTdGFydCA9IHN1c3RhaW5TdGFydDtcbiAgICAgICAgdGhpcy5zb3VyY2UubG9vcEVuZCA9IHN1c3RhaW5FbmQ7XG4gICAgICB9XG4gICAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzdG9wJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcCh0aW1lLCBjYikge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIF9zYW1wbGVEYXRhMiA9IHRoaXMuc2FtcGxlRGF0YTtcbiAgICAgIHZhciByZWxlYXNlRHVyYXRpb24gPSBfc2FtcGxlRGF0YTIucmVsZWFzZUR1cmF0aW9uO1xuICAgICAgdmFyIHJlbGVhc2VFbnZlbG9wZSA9IF9zYW1wbGVEYXRhMi5yZWxlYXNlRW52ZWxvcGU7XG4gICAgICB2YXIgcmVsZWFzZUVudmVsb3BlQXJyYXkgPSBfc2FtcGxlRGF0YTIucmVsZWFzZUVudmVsb3BlQXJyYXk7XG4gICAgICAvL2NvbnNvbGUubG9nKHJlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlKVxuXG4gICAgICB0aGlzLnNvdXJjZS5vbmVuZGVkID0gY2I7XG5cbiAgICAgIGlmIChyZWxlYXNlRHVyYXRpb24gJiYgcmVsZWFzZUVudmVsb3BlKSB7XG4gICAgICAgIHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UgPSB0aW1lO1xuICAgICAgICB0aGlzLnJlbGVhc2VGdW5jdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBmYWRlT3V0KF90aGlzLm91dHB1dCwge1xuICAgICAgICAgICAgcmVsZWFzZUR1cmF0aW9uOiByZWxlYXNlRHVyYXRpb24sXG4gICAgICAgICAgICByZWxlYXNlRW52ZWxvcGU6IHJlbGVhc2VFbnZlbG9wZSxcbiAgICAgICAgICAgIHJlbGVhc2VFbnZlbG9wZUFycmF5OiByZWxlYXNlRW52ZWxvcGVBcnJheVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuc291cmNlLnN0b3AodGltZSArIHJlbGVhc2VEdXJhdGlvbik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBpbiBGaXJlZm94IGFuZCBTYWZhcmkgeW91IGNhbiBub3QgY2FsbCBzdG9wIG1vcmUgdGhhbiBvbmNlXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGVja1BoYXNlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuc291cmNlLnN0b3AodGltZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBpbiBGaXJlZm94IGFuZCBTYWZhcmkgeW91IGNhbiBub3QgY2FsbCBzdG9wIG1vcmUgdGhhbiBvbmNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjaGVja1BoYXNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2hlY2tQaGFzZSgpIHtcbiAgICAgIC8vY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSwgdGhpcy5zdGFydFJlbGVhc2VQaGFzZSlcbiAgICAgIGlmIChfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lID49IHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UpIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlRnVuY3Rpb24oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuY2hlY2tQaGFzZS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU2FtcGxlO1xufSgpO1xuXG5mdW5jdGlvbiBmYWRlT3V0KGdhaW5Ob2RlLCBzZXR0aW5ncykge1xuICB2YXIgbm93ID0gX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZTtcbiAgdmFyIHZhbHVlcyA9IHZvaWQgMCxcbiAgICAgIGkgPSB2b2lkIDAsXG4gICAgICBtYXhpID0gdm9pZCAwO1xuXG4gIC8vY29uc29sZS5sb2coc2V0dGluZ3MpXG4gIHRyeSB7XG4gICAgc3dpdGNoIChzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpIHtcblxuICAgICAgY2FzZSAnbGluZWFyJzpcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluTm9kZS5nYWluLnZhbHVlLCBub3cpO1xuICAgICAgICBnYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgbm93ICsgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2VxdWFsIHBvd2VyJzpcbiAgICAgIGNhc2UgJ2VxdWFsX3Bvd2VyJzpcbiAgICAgICAgdmFsdWVzID0gKDAsIF91dGlsLmdldEVxdWFsUG93ZXJDdXJ2ZSkoMTAwLCAnZmFkZU91dCcsIGdhaW5Ob2RlLmdhaW4udmFsdWUpO1xuICAgICAgICBnYWluTm9kZS5nYWluLnNldFZhbHVlQ3VydmVBdFRpbWUodmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdhcnJheSc6XG4gICAgICAgIG1heGkgPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheS5sZW5ndGg7XG4gICAgICAgIHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkobWF4aSk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBtYXhpOyBpKyspIHtcbiAgICAgICAgICB2YWx1ZXNbaV0gPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheVtpXSAqIGdhaW5Ob2RlLmdhaW4udmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBpbiBGaXJlZm94IGFuZCBTYWZhcmkgeW91IGNhbiBub3QgY2FsbCBzZXRWYWx1ZUN1cnZlQXRUaW1lIGFuZCBsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSBtb3JlIHRoYW4gb25jZVxuXG4gICAgLy9jb25zb2xlLmxvZyh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgIC8vY29uc29sZS5sb2coZSwgZ2Fpbk5vZGUpXG4gIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlNhbXBsZUJ1ZmZlciA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9zYW1wbGUgPSByZXF1aXJlKCcuL3NhbXBsZScpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG5cbnZhciBTYW1wbGVCdWZmZXIgPSBleHBvcnRzLlNhbXBsZUJ1ZmZlciA9IGZ1bmN0aW9uIChfU2FtcGxlKSB7XG4gIF9pbmhlcml0cyhTYW1wbGVCdWZmZXIsIF9TYW1wbGUpO1xuXG4gIGZ1bmN0aW9uIFNhbXBsZUJ1ZmZlcihzYW1wbGVEYXRhLCBldmVudCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTYW1wbGVCdWZmZXIpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgT2JqZWN0LmdldFByb3RvdHlwZU9mKFNhbXBsZUJ1ZmZlcikuY2FsbCh0aGlzLCBzYW1wbGVEYXRhLCBldmVudCkpO1xuXG4gICAgX3RoaXMuaWQgPSBfdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgJ18nICsgaW5zdGFuY2VJbmRleCsrICsgJ18nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICBpZiAoX3RoaXMuc2FtcGxlRGF0YSA9PT0gLTEgfHwgdHlwZW9mIF90aGlzLnNhbXBsZURhdGEuYnVmZmVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gY3JlYXRlIGR1bW15IHNvdXJjZVxuICAgICAgX3RoaXMuc291cmNlID0ge1xuICAgICAgICBzdGFydDogZnVuY3Rpb24gc3RhcnQoKSB7fSxcbiAgICAgICAgc3RvcDogZnVuY3Rpb24gc3RvcCgpIHt9LFxuICAgICAgICBjb25uZWN0OiBmdW5jdGlvbiBjb25uZWN0KCkge31cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIF90aGlzLnNvdXJjZSA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZURhdGEpXG4gICAgICBfdGhpcy5zb3VyY2UuYnVmZmVyID0gc2FtcGxlRGF0YS5idWZmZXI7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc291cmNlLmJ1ZmZlcilcbiAgICB9XG4gICAgX3RoaXMub3V0cHV0ID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgX3RoaXMudm9sdW1lID0gZXZlbnQuZGF0YTIgLyAxMjc7XG4gICAgX3RoaXMub3V0cHV0LmdhaW4udmFsdWUgPSBfdGhpcy52b2x1bWU7XG4gICAgX3RoaXMuc291cmNlLmNvbm5lY3QoX3RoaXMub3V0cHV0KTtcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICAvL0BvdmVycmlkZVxuXG5cbiAgX2NyZWF0ZUNsYXNzKFNhbXBsZUJ1ZmZlciwgW3tcbiAgICBrZXk6ICdzdGFydCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0KHRpbWUpIHtcbiAgICAgIHZhciBfc2FtcGxlRGF0YSA9IHRoaXMuc2FtcGxlRGF0YTtcbiAgICAgIHZhciBzdXN0YWluU3RhcnQgPSBfc2FtcGxlRGF0YS5zdXN0YWluU3RhcnQ7XG4gICAgICB2YXIgc3VzdGFpbkVuZCA9IF9zYW1wbGVEYXRhLnN1c3RhaW5FbmQ7XG4gICAgICB2YXIgc2VnbWVudFN0YXJ0ID0gX3NhbXBsZURhdGEuc2VnbWVudFN0YXJ0O1xuICAgICAgdmFyIHNlZ21lbnREdXJhdGlvbiA9IF9zYW1wbGVEYXRhLnNlZ21lbnREdXJhdGlvbjtcbiAgICAgIC8vY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kLCBzZWdtZW50U3RhcnQsIHNlZ21lbnREdXJhdGlvbilcblxuICAgICAgaWYgKHN1c3RhaW5TdGFydCAmJiBzdXN0YWluRW5kKSB7XG4gICAgICAgIHRoaXMuc291cmNlLmxvb3AgPSB0cnVlO1xuICAgICAgICB0aGlzLnNvdXJjZS5sb29wU3RhcnQgPSBzdXN0YWluU3RhcnQ7XG4gICAgICAgIHRoaXMuc291cmNlLmxvb3BFbmQgPSBzdXN0YWluRW5kO1xuICAgICAgfVxuICAgICAgaWYgKHNlZ21lbnRTdGFydCAmJiBzZWdtZW50RHVyYXRpb24pIHtcbiAgICAgICAgY29uc29sZS5sb2coc2VnbWVudFN0YXJ0LCBzZWdtZW50RHVyYXRpb24pO1xuICAgICAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lLCBzZWdtZW50U3RhcnQgLyAxMDAwLCBzZWdtZW50RHVyYXRpb24gLyAxMDAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTYW1wbGVCdWZmZXI7XG59KF9zYW1wbGUuU2FtcGxlKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlNhbXBsZU9zY2lsbGF0b3IgPSB1bmRlZmluZWQ7XG5cbnZhciBfc2FtcGxlID0gcmVxdWlyZSgnLi9zYW1wbGUnKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIGluc3RhbmNlSW5kZXggPSAwO1xuXG52YXIgU2FtcGxlT3NjaWxsYXRvciA9IGV4cG9ydHMuU2FtcGxlT3NjaWxsYXRvciA9IGZ1bmN0aW9uIChfU2FtcGxlKSB7XG4gIF9pbmhlcml0cyhTYW1wbGVPc2NpbGxhdG9yLCBfU2FtcGxlKTtcblxuICBmdW5jdGlvbiBTYW1wbGVPc2NpbGxhdG9yKHNhbXBsZURhdGEsIGV2ZW50KSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNhbXBsZU9zY2lsbGF0b3IpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgT2JqZWN0LmdldFByb3RvdHlwZU9mKFNhbXBsZU9zY2lsbGF0b3IpLmNhbGwodGhpcywgc2FtcGxlRGF0YSwgZXZlbnQpKTtcblxuICAgIF90aGlzLmlkID0gX3RoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgaWYgKF90aGlzLnNhbXBsZURhdGEgPT09IC0xKSB7XG4gICAgICAvLyBjcmVhdGUgZHVtbXkgc291cmNlXG4gICAgICBfdGhpcy5zb3VyY2UgPSB7XG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbiBzdGFydCgpIHt9LFxuICAgICAgICBzdG9wOiBmdW5jdGlvbiBzdG9wKCkge30sXG4gICAgICAgIGNvbm5lY3Q6IGZ1bmN0aW9uIGNvbm5lY3QoKSB7fVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyBAVE9ETyBhZGQgdHlwZSAnY3VzdG9tJyA9PiBQZXJpb2RpY1dhdmVcbiAgICAgIHZhciB0eXBlID0gX3RoaXMuc2FtcGxlRGF0YS50eXBlO1xuICAgICAgX3RoaXMuc291cmNlID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG5cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdzaW5lJzpcbiAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgY2FzZSAnc2F3dG9vdGgnOlxuICAgICAgICBjYXNlICd0cmlhbmdsZSc6XG4gICAgICAgICAgX3RoaXMuc291cmNlLnR5cGUgPSB0eXBlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIF90aGlzLnNvdXJjZS50eXBlID0gJ3NxdWFyZSc7XG4gICAgICB9XG4gICAgICBfdGhpcy5zb3VyY2UuZnJlcXVlbmN5LnZhbHVlID0gZXZlbnQuZnJlcXVlbmN5O1xuICAgIH1cbiAgICBfdGhpcy5vdXRwdXQgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBfdGhpcy52b2x1bWUgPSBldmVudC5kYXRhMiAvIDEyNztcbiAgICBfdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IF90aGlzLnZvbHVtZTtcbiAgICBfdGhpcy5zb3VyY2UuY29ubmVjdChfdGhpcy5vdXRwdXQpO1xuICAgIC8vdGhpcy5vdXRwdXQuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIHJldHVybiBTYW1wbGVPc2NpbGxhdG9yO1xufShfc2FtcGxlLlNhbXBsZSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5TYW1wbGVyID0gdW5kZWZpbmVkO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX2luc3RydW1lbnQgPSByZXF1aXJlKCcuL2luc3RydW1lbnQnKTtcblxudmFyIF9ub3RlID0gcmVxdWlyZSgnLi9ub3RlJyk7XG5cbnZhciBfcGFyc2VfYXVkaW8gPSByZXF1aXJlKCcuL3BhcnNlX2F1ZGlvJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX2ZldGNoX2hlbHBlcnMgPSByZXF1aXJlKCcuL2ZldGNoX2hlbHBlcnMnKTtcblxudmFyIF9zYW1wbGVfYnVmZmVyID0gcmVxdWlyZSgnLi9zYW1wbGVfYnVmZmVyJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIGluc3RhbmNlSW5kZXggPSAwO1xuXG52YXIgU2FtcGxlciA9IGV4cG9ydHMuU2FtcGxlciA9IGZ1bmN0aW9uIChfSW5zdHJ1bWVudCkge1xuICBfaW5oZXJpdHMoU2FtcGxlciwgX0luc3RydW1lbnQpO1xuXG4gIGZ1bmN0aW9uIFNhbXBsZXIobmFtZSkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTYW1wbGVyKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIE9iamVjdC5nZXRQcm90b3R5cGVPZihTYW1wbGVyKS5jYWxsKHRoaXMpKTtcblxuICAgIF90aGlzLmlkID0gX3RoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIF90aGlzLm5hbWUgPSBuYW1lIHx8IF90aGlzLmlkO1xuICAgIF90aGlzLmNsZWFyQWxsU2FtcGxlRGF0YSgpO1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTYW1wbGVyLCBbe1xuICAgIGtleTogJ2NsZWFyQWxsU2FtcGxlRGF0YScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyQWxsU2FtcGxlRGF0YSgpIHtcbiAgICAgIC8vIGNyZWF0ZSBhIHNhbXBsZXMgZGF0YSBvYmplY3QgZm9yIGFsbCAxMjggdmVsb2NpdHkgbGV2ZWxzIG9mIGFsbCAxMjggbm90ZXNcbiAgICAgIHRoaXMuc2FtcGxlc0RhdGEgPSBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKTtcbiAgICAgIHRoaXMuc2FtcGxlc0RhdGEgPSB0aGlzLnNhbXBsZXNEYXRhLm1hcChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NyZWF0ZVNhbXBsZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZVNhbXBsZShldmVudCkge1xuICAgICAgcmV0dXJuIG5ldyBfc2FtcGxlX2J1ZmZlci5TYW1wbGVCdWZmZXIodGhpcy5zYW1wbGVzRGF0YVtldmVudC5kYXRhMV1bZXZlbnQuZGF0YTJdLCBldmVudCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX2xvYWRKU09OJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2xvYWRKU09OKGRhdGEpIHtcbiAgICAgIGlmICgodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGRhdGEpKSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGRhdGEudXJsID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gKDAsIF9mZXRjaF9oZWxwZXJzLmZldGNoSlNPTikoZGF0YS51cmwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkYXRhKTtcbiAgICB9XG5cbiAgICAvLyBsb2FkIGFuZCBwYXJzZVxuXG4gIH0sIHtcbiAgICBrZXk6ICdwYXJzZVNhbXBsZURhdGEnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwYXJzZVNhbXBsZURhdGEoZGF0YSkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIC8vIGNoZWNrIGlmIHdlIGhhdmUgdG8gY2xlYXIgdGhlIGN1cnJlbnRseSBsb2FkZWQgc2FtcGxlc1xuICAgICAgdmFyIGNsZWFyQWxsID0gZGF0YS5jbGVhckFsbDtcblxuICAgICAgLy8gY2hlY2sgaWYgd2UgaGF2ZSB0byBvdmVycnVsZSB0aGUgYmFzZVVybCBvZiB0aGUgc2FtcGVsc1xuICAgICAgdmFyIGJhc2VVcmwgPSBudWxsO1xuICAgICAgaWYgKHR5cGVvZiBkYXRhLmJhc2VVcmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGJhc2VVcmwgPSBkYXRhLmJhc2VVcmw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YS5yZWxlYXNlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pO1xuICAgICAgICAvL2NvbnNvbGUubG9nKDEsIGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgICAgfVxuXG4gICAgICAvL3JldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBfdGhpczIuX2xvYWRKU09OKGRhdGEpLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGpzb24pXG4gICAgICAgICAgZGF0YSA9IGpzb247XG4gICAgICAgICAgaWYgKGJhc2VVcmwgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGpzb24uYmFzZVVybCA9IGJhc2VVcmw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YS5yZWxlYXNlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgX3RoaXMyLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygyLCBkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICgwLCBfcGFyc2VfYXVkaW8ucGFyc2VTYW1wbGVzKShkYXRhKTtcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG5cbiAgICAgICAgICBpZiAoY2xlYXJBbGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF90aGlzMi5jbGVhckFsbFNhbXBsZURhdGEoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoKHR5cGVvZiByZXN1bHQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHJlc3VsdCkpID09PSAnb2JqZWN0Jykge1xuXG4gICAgICAgICAgICAvLyBzaW5nbGUgY29uY2F0ZW5hdGVkIHNhbXBsZVxuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQuc2FtcGxlICE9PSAndW5kZWZpbmVkJykge1xuXG4gICAgICAgICAgICAgIHZhciBidWZmZXIgPSByZXN1bHQuc2FtcGxlO1xuICAgICAgICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBPYmplY3Qua2V5cyhkYXRhKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBub3RlSWQgPSBfc3RlcC52YWx1ZTtcblxuXG4gICAgICAgICAgICAgICAgICBpZiAobm90ZUlkID09PSAnc2FtcGxlJyB8fCBub3RlSWQgPT09ICdyZWxlYXNlJyB8fCBub3RlSWQgPT09ICdiYXNlVXJsJyB8fCBub3RlSWQgPT09ICdpbmZvJykge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgdmFyIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnQ6IGRhdGFbbm90ZUlkXSxcbiAgICAgICAgICAgICAgICAgICAgbm90ZTogcGFyc2VJbnQobm90ZUlkLCAxMCksXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICBfdGhpczIuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSk7XG4gICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZURhdGEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgICAgICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm90ZUlkID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBidWZmZXIgPSByZXN1bHRbbm90ZUlkXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNhbXBsZURhdGEgPSBkYXRhW25vdGVJZF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzYW1wbGVEYXRhID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzYW1wbGVEYXRhIGlzIHVuZGVmaW5lZCcsIG5vdGVJZCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKDAsIF91dGlsLnR5cGVTdHJpbmcpKGJ1ZmZlcikgPT09ICdhcnJheScpIHtcblxuICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYnVmZmVyLCBzYW1wbGVEYXRhKVxuICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZURhdGEuZm9yRWFjaChmdW5jdGlvbiAoc2QsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobm90ZUlkLCBidWZmZXJbaV0pXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNkID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlcltpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2QuYnVmZmVyID0gYnVmZmVyW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2Qubm90ZSA9IHBhcnNlSW50KG5vdGVJZCwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLl91cGRhdGVTYW1wbGVEYXRhKHNkKTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5ub3RlID0gcGFyc2VJbnQobm90ZUlkLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLl91cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gT2JqZWN0LmtleXMocmVzdWx0KVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfbG9vcCgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICAgICAgICAgICAgICAgIF9pdGVyYXRvcjIucmV0dXJuKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICByZXN1bHQuZm9yRWFjaChmdW5jdGlvbiAoc2FtcGxlKSB7XG4gICAgICAgICAgICAgIHZhciBzYW1wbGVEYXRhID0gZGF0YVtzYW1wbGVdO1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHNhbXBsZURhdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NhbXBsZURhdGEgaXMgdW5kZWZpbmVkJywgc2FtcGxlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNhbXBsZURhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBidWZmZXI6IHNhbXBsZS5idWZmZXJcbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gc2FtcGxlLmJ1ZmZlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5ub3RlID0gc2FtcGxlO1xuICAgICAgICAgICAgICAgIF90aGlzMi5fdXBkYXRlU2FtcGxlRGF0YShzYW1wbGVEYXRhKTtcbiAgICAgICAgICAgICAgICAvL3RoaXMudXBkYXRlU2FtcGxlRGF0YShzYW1wbGVEYXRhKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhuZXcgRGF0ZSgpLmdldFRpbWUoKSlcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgIEBwYXJhbSBjb25maWcgKG9wdGlvbmFsKVxuICAgICAgICB7XG4gICAgICAgICAgbm90ZTogY2FuIGJlIG5vdGUgbmFtZSAoQzQpIG9yIG5vdGUgbnVtYmVyICg2MClcbiAgICAgICAgICBidWZmZXI6IEF1ZGlvQnVmZmVyXG4gICAgICAgICAgc3VzdGFpbjogW3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZF0sIC8vIG9wdGlvbmFsLCBpbiBtaWxsaXNcbiAgICAgICAgICByZWxlYXNlOiBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdLCAvLyBvcHRpb25hbFxuICAgICAgICAgIHBhbjogcGFuUG9zaXRpb24gLy8gb3B0aW9uYWxcbiAgICAgICAgICB2ZWxvY2l0eTogW3ZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kXSAvLyBvcHRpb25hbCwgZm9yIG11bHRpLWxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgICAgfVxuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZVNhbXBsZURhdGEnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVTYW1wbGVEYXRhKCkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBkYXRhID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGRhdGFbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAobm90ZURhdGEpIHtcbiAgICAgICAgLy8gc3VwcG9ydCBmb3IgbXVsdGkgbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgICAvL2NvbnNvbGUubG9nKG5vdGVEYXRhLCB0eXBlU3RyaW5nKG5vdGVEYXRhKSlcbiAgICAgICAgaWYgKCgwLCBfdXRpbC50eXBlU3RyaW5nKShub3RlRGF0YSkgPT09ICdhcnJheScpIHtcbiAgICAgICAgICBub3RlRGF0YS5mb3JFYWNoKGZ1bmN0aW9uICh2ZWxvY2l0eUxheWVyKSB7XG4gICAgICAgICAgICBfdGhpczMuX3VwZGF0ZVNhbXBsZURhdGEodmVsb2NpdHlMYXllcik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMzLl91cGRhdGVTYW1wbGVEYXRhKG5vdGVEYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX3VwZGF0ZVNhbXBsZURhdGEnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlU2FtcGxlRGF0YSgpIHtcbiAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICB2YXIgZGF0YSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gICAgICB2YXIgbm90ZSA9IGRhdGEubm90ZTtcbiAgICAgIHZhciBfZGF0YSRidWZmZXIgPSBkYXRhLmJ1ZmZlcjtcbiAgICAgIHZhciBidWZmZXIgPSBfZGF0YSRidWZmZXIgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBfZGF0YSRidWZmZXI7XG4gICAgICB2YXIgX2RhdGEkc3VzdGFpbiA9IGRhdGEuc3VzdGFpbjtcbiAgICAgIHZhciBzdXN0YWluID0gX2RhdGEkc3VzdGFpbiA9PT0gdW5kZWZpbmVkID8gW251bGwsIG51bGxdIDogX2RhdGEkc3VzdGFpbjtcbiAgICAgIHZhciBfZGF0YSRzZWdtZW50ID0gZGF0YS5zZWdtZW50O1xuICAgICAgdmFyIHNlZ21lbnQgPSBfZGF0YSRzZWdtZW50ID09PSB1bmRlZmluZWQgPyBbbnVsbCwgbnVsbF0gOiBfZGF0YSRzZWdtZW50O1xuICAgICAgdmFyIF9kYXRhJHJlbGVhc2UgPSBkYXRhLnJlbGVhc2U7XG4gICAgICB2YXIgcmVsZWFzZSA9IF9kYXRhJHJlbGVhc2UgPT09IHVuZGVmaW5lZCA/IFtudWxsLCAnbGluZWFyJ10gOiBfZGF0YSRyZWxlYXNlO1xuICAgICAgdmFyIF9kYXRhJHBhbiA9IGRhdGEucGFuO1xuICAgICAgdmFyIC8vIHJlbGVhc2UgZHVyYXRpb24gaXMgaW4gc2Vjb25kcyFcbiAgICAgIHBhbiA9IF9kYXRhJHBhbiA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IF9kYXRhJHBhbjtcbiAgICAgIHZhciBfZGF0YSR2ZWxvY2l0eSA9IGRhdGEudmVsb2NpdHk7XG4gICAgICB2YXIgdmVsb2NpdHkgPSBfZGF0YSR2ZWxvY2l0eSA9PT0gdW5kZWZpbmVkID8gWzAsIDEyN10gOiBfZGF0YSR2ZWxvY2l0eTtcblxuXG4gICAgICBpZiAodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBub3RlbnVtYmVyIG9yIGEgbm90ZW5hbWUnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBnZXQgbm90ZW51bWJlciBmcm9tIG5vdGVuYW1lIGFuZCBjaGVjayBpZiB0aGUgbm90ZW51bWJlciBpcyB2YWxpZFxuICAgICAgdmFyIG4gPSAoMCwgX25vdGUuZ2V0Tm90ZURhdGEpKHsgbnVtYmVyOiBub3RlIH0pO1xuICAgICAgaWYgKG4gPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignbm90IGEgdmFsaWQgbm90ZSBpZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBub3RlID0gbi5udW1iZXI7XG5cbiAgICAgIHZhciBfc3VzdGFpbiA9IF9zbGljZWRUb0FycmF5KHN1c3RhaW4sIDIpO1xuXG4gICAgICB2YXIgc3VzdGFpblN0YXJ0ID0gX3N1c3RhaW5bMF07XG4gICAgICB2YXIgc3VzdGFpbkVuZCA9IF9zdXN0YWluWzFdO1xuXG4gICAgICB2YXIgX3JlbGVhc2UgPSBfc2xpY2VkVG9BcnJheShyZWxlYXNlLCAyKTtcblxuICAgICAgdmFyIHJlbGVhc2VEdXJhdGlvbiA9IF9yZWxlYXNlWzBdO1xuICAgICAgdmFyIHJlbGVhc2VFbnZlbG9wZSA9IF9yZWxlYXNlWzFdO1xuXG4gICAgICB2YXIgX3NlZ21lbnQgPSBfc2xpY2VkVG9BcnJheShzZWdtZW50LCAyKTtcblxuICAgICAgdmFyIHNlZ21lbnRTdGFydCA9IF9zZWdtZW50WzBdO1xuICAgICAgdmFyIHNlZ21lbnREdXJhdGlvbiA9IF9zZWdtZW50WzFdO1xuXG4gICAgICB2YXIgX3ZlbG9jaXR5ID0gX3NsaWNlZFRvQXJyYXkodmVsb2NpdHksIDIpO1xuXG4gICAgICB2YXIgdmVsb2NpdHlTdGFydCA9IF92ZWxvY2l0eVswXTtcbiAgICAgIHZhciB2ZWxvY2l0eUVuZCA9IF92ZWxvY2l0eVsxXTtcblxuXG4gICAgICBpZiAoc3VzdGFpbi5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgc3VzdGFpblN0YXJ0ID0gc3VzdGFpbkVuZCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWxlYXNlRHVyYXRpb24gPT09IG51bGwpIHtcbiAgICAgICAgcmVsZWFzZUVudmVsb3BlID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gY29uc29sZS5sb2cobm90ZSwgYnVmZmVyKVxuICAgICAgLy8gY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKVxuICAgICAgLy8gY29uc29sZS5sb2cocmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUpXG4gICAgICAvLyBjb25zb2xlLmxvZyhwYW4pXG4gICAgICAvLyBjb25zb2xlLmxvZyh2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZClcblxuICAgICAgdGhpcy5zYW1wbGVzRGF0YVtub3RlXS5mb3JFYWNoKGZ1bmN0aW9uIChzYW1wbGVEYXRhLCBpKSB7XG4gICAgICAgIGlmIChpID49IHZlbG9jaXR5U3RhcnQgJiYgaSA8PSB2ZWxvY2l0eUVuZCkge1xuICAgICAgICAgIGlmIChzYW1wbGVEYXRhID09PSAtMSkge1xuICAgICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgaWQ6IG5vdGVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBidWZmZXIgfHwgc2FtcGxlRGF0YS5idWZmZXI7XG4gICAgICAgICAgc2FtcGxlRGF0YS5zdXN0YWluU3RhcnQgPSBzdXN0YWluU3RhcnQgfHwgc2FtcGxlRGF0YS5zdXN0YWluU3RhcnQ7XG4gICAgICAgICAgc2FtcGxlRGF0YS5zdXN0YWluRW5kID0gc3VzdGFpbkVuZCB8fCBzYW1wbGVEYXRhLnN1c3RhaW5FbmQ7XG4gICAgICAgICAgc2FtcGxlRGF0YS5zZWdtZW50U3RhcnQgPSBzZWdtZW50U3RhcnQgfHwgc2FtcGxlRGF0YS5zZWdtZW50U3RhcnQ7XG4gICAgICAgICAgc2FtcGxlRGF0YS5zZWdtZW50RHVyYXRpb24gPSBzZWdtZW50RHVyYXRpb24gfHwgc2FtcGxlRGF0YS5zZWdtZW50RHVyYXRpb247XG4gICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb24gPSByZWxlYXNlRHVyYXRpb24gfHwgc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb247XG4gICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSByZWxlYXNlRW52ZWxvcGUgfHwgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGU7XG4gICAgICAgICAgc2FtcGxlRGF0YS5wYW4gPSBwYW4gfHwgc2FtcGxlRGF0YS5wYW47XG5cbiAgICAgICAgICBpZiAoKDAsIF91dGlsLnR5cGVTdHJpbmcpKHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlKSA9PT0gJ2FycmF5Jykge1xuICAgICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVBcnJheSA9IHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlO1xuICAgICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSAnYXJyYXknO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVBcnJheTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3RoaXM0LnNhbXBsZXNEYXRhW25vdGVdW2ldID0gc2FtcGxlRGF0YTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV0pXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBzdGVyZW8gc3ByZWFkXG5cbiAgfSwge1xuICAgIGtleTogJ3NldEtleVNjYWxpbmdQYW5uaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKSB7XG4gICAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEtleVNjYWxpbmdSZWxlYXNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0S2V5U2NhbGluZ1JlbGVhc2UoKSB7fVxuICAgIC8vIHNldCByZWxlYXNlIGJhc2VkIG9uIGtleSB2YWx1ZVxuXG5cbiAgICAvKlxuICAgICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICAgIEBlbnZlbG9wZTogbGluZWFyIHwgZXF1YWxfcG93ZXIgfCBhcnJheSBvZiBpbnQgdmFsdWVzXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnc2V0UmVsZWFzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFJlbGVhc2UoZHVyYXRpb24sIGVudmVsb3BlKSB7XG4gICAgICAvLyBzZXQgcmVsZWFzZSBmb3IgYWxsIGtleXMsIG92ZXJydWxlcyB2YWx1ZXMgc2V0IGJ5IHNldEtleVNjYWxpbmdSZWxlYXNlKClcbiAgICAgIHRoaXMuc2FtcGxlc0RhdGEuZm9yRWFjaChmdW5jdGlvbiAoc2FtcGxlcywgaWQpIHtcbiAgICAgICAgc2FtcGxlcy5mb3JFYWNoKGZ1bmN0aW9uIChzYW1wbGUsIGkpIHtcbiAgICAgICAgICBpZiAoc2FtcGxlID09PSAtMSkge1xuICAgICAgICAgICAgc2FtcGxlID0ge1xuICAgICAgICAgICAgICBpZDogaWRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIHNhbXBsZS5yZWxlYXNlRHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgICAgICBzYW1wbGUucmVsZWFzZUVudmVsb3BlID0gZW52ZWxvcGU7XG4gICAgICAgICAgc2FtcGxlc1tpXSA9IHNhbXBsZTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIC8vY29uc29sZS5sb2coJyVPJywgdGhpcy5zYW1wbGVzRGF0YSlcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU2FtcGxlcjtcbn0oX2luc3RydW1lbnQuSW5zdHJ1bWVudCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xudmFyIHNhbXBsZXMgPSB7XG4gIC8vICBlbXB0eU9nZzogJ1QyZG5Vd0FDQUFBQUFBQUFBQUJkeGQ0WEFBQUFBRGFTMGpRQkhnRjJiM0ppYVhNQUFBQUFBVVNzQUFBQUFBQUFnTHNBQUFBQUFBQzRBVTluWjFNQUFBQUFBQUFBQUFBQVhjWGVGd0VBQUFBYVhLK1FEejMvLy8vLy8vLy8vLy8vLy8vL01nTjJiM0ppYVhNdEFBQUFXR2x3YUM1UGNtY2diR2xpVm05eVltbHpJRWtnTWpBeE1ERXhNREVnS0ZOamFHRjFabVZ1ZFdkblpYUXBBQUFBQUFFRmRtOXlZbWx6SDBKRFZnRUFBQUVBR0dOVUtVYVpVdEpLaVJsemxERkdtV0tTU29tbGhCWkNTSjF6RkZPcE9kZWNhNnk1dFNDRUVCcFRVQ2tGbVZLT1Vta1pZNUFwQlpsU0VFdEpKWFFTT2llZFl4QmJTY0hXbUd1TFFiWWNoQTJhVWt3cHhKUlNpa0lJR1ZPTUtjV1VVa3BDQnlWMERqcm1IRk9PU2loQnVKeHpxN1dXbG1PTHFYU1NTdWNrWkV4Q1NDbUZra29IcFZOT1FrZzFsdFpTS1IxelVsSnFRZWdnaEJCQ3RpQ0VEWUxRa0ZVQUFBRUF3RUFRR3JJS0FGQUFBQkNLb1JpS0FvU0dyQUlBTWdBQUJLQW9qdUlvamlNNWttTkpGaEFhc2dvQUFBSUFFQUFBd0hBVVNaRVV5YkVrUzlJc1M5TkVVVlY5MVRaVlZmWjFYZGQxWGRkMUlEUmtGUUFBQVFCQVNLZVpwUm9nd2d4a0dBZ05XUVVBSUFBQUFFWW93aEFEUWtOV0FRQUFBUUFBWWlnNWlDYTA1bnh6am9ObU9XZ3F4ZVowY0NMVjVrbHVLdWJtbkhQT09TZWJjOFk0NTV4emluSm1NV2dtdE9hY2N4S0RaaWxvSnJUbW5IT2V4T1pCYTZxMDVweHp4am1uZzNGR0dPZWNjNXEwNWtGcU50Ym1uSE1XdEtZNWFpN0Y1cHh6SXVYbVNXMHUxZWFjYzg0NTU1eHp6am5ubkhPcUY2ZHpjRTQ0NTV4em92Ym1XbTVDRitlY2N6NFpwM3R6UWpqbm5IUE9PZWVjYzg0NTU1eHpndENRVlFBQUVBQUFRUmcyaG5HbklFaWZvNEVZUllocHlLUUgzYVBESkdnTWNncXBSNk9qa1ZMcUlKUlV4a2twblNBMFpCVUFBQWdBQUNHRUZGSklJWVVVVWtnaGhSUlNpQ0dHR0dMSUthZWNnZ29xcWFTaWlqTEtMTFBNTXNzc3M4d3k2N0N6empyc01NUVFRd3l0dEJKTFRiWFZXR090dWVlY2F3N1NXbW10dGRaS0thV1VVa29wQ0ExWkJRQ0FBQUFRQ0Jsa2tFRkdJWVVVVW9naHBweHl5aW1vb0FKQ1ExWUJBSUFBQUFJQUFBQTh5WE5FUjNSRVIzUkVSM1JFUjNSRXgzTThSNVJFU1pSRVNiUk15OVJNVHhWVjFaVmRXOVpsM2ZadFlSZDIzZmQxMy9kMTQ5ZUZZVm1XWlZtV1pWbVdaVm1XWlZtV1pWbUMwSkJWQUFBSUFBQ0FFRUlJSVlVVVVrZ2hwUmhqekRIbm9KTlFRaUEwWkJVQUFBZ0FJQUFBQU1CUkhNVnhKRWR5Sk1tU0xFbVRORXV6UE0zVFBFMzBSRkVVVGROVVJWZDBSZDIwUmRtVVRkZDBUZGwwVlZtMVhWbTJiZG5XYlYrV2JkLzNmZC8zZmQvM2ZkLzNmZC8zZFIwSURWa0ZBRWdBQU9oSWpxUklpcVJJanVNNGtpUUJvU0dyQUFBWkFBQUJBQ2lLb3ppTzQwaVNKRW1XcEVtZTVWbWlabXFtWjNxcXFBS2hJYXNBQUVBQUFBRUFBQUFBQUNpYTRpbW00aW1pNGptaUkwcWlaVnFpcG1xdUtKdXk2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3b3VFQnF5Q2dDUUFBRFFrUnpKa1J4SmtSUkprUnpKQVVKRFZnRUFNZ0FBQWdCd0RNZVFGTW14TEV2VFBNM1RQRTMwUkUvMFRFOFZYZEVGUWtOV0FRQ0FBQUFDQUFBQUFBQXdKTU5TTEVkek5FbVVWRXUxVkUyMVZFc1ZWVTlWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVTFUZE0wVFNBMFpDVUFBQVFBd0dLTndlVWdJU1VsNWQ0UXdoQ1RuakVtSWJWZUlRU1JrdDR4QmhXRG5qS2lESExlUXVNUWd4NElEVmtSQUVRQkFBREdJTWNRYzhnNVI2bVRFam5ucUhTVUd1Y2NwWTVTWnluRm1HTE5LSlhZVXF5TmM0NVNSNjJqbEdJc0xYYVVVbzJweGdJQUFBSWNBQUFDTElSQ1ExWUVBRkVBQUlReFNDbWtGR0tNT2FlY1E0d3A1NWh6aGpIbUhIT09PZWVnZEZJcTU1eDBUa3JFR0hPT09hZWNjMUk2SjVWelRrb25vUUFBZ0FBSEFJQUFDNkhRa0JVQlFKd0FnRUdTUEUveU5GR1VORThVUlZOMFhWRTBYZGZ5UE5YMFRGTlZQZEZVVlZOVmJkbFVWVm1XUE04MFBkTlVWYzgwVmRWVVZWazJWVldXUlZYVmJkTjFkZHQwVmQyV2JkdjNYVnNXZGxGVmJkMVVYZHMzVmRmMlhkbjJmVm5XZFdQeVBGWDFUTk4xUGROMFpkVjFiVnQxWFYzM1RGT1dUZGVWWmROMWJkdVZaVjEzWmRuM05kTjBYZE5WWmRsMFhkbDJaVmUzWFZuMmZkTjFoZCtWWlY5WFpWa1lkbDMzaFZ2WGxlVjBYZDFYWlZjM1ZsbjJmVnZYaGVIV2RXR1pQRTlWUGROMFhjODBYVmQxWFY5WFhkZldOZE9VWmROMWJkbFVYVmwyWmRuM1hWZldkYzgwWmRsMFhkczJYVmVXWFZuMmZWZVdkZDEwWFY5WFpWbjRWVmYyZFZuWGxlSFdiZUUzWGRmM1ZWbjJoVmVXZGVIV2RXRzVkVjBZUGxYMWZWTjJoZUYwWmQvWGhkOVpibDA0bHRGMWZXR1ZiZUZZWlZrNWZ1RllsdDMzbFdWMFhWOVliZGtZVmxrV2hsLzRuZVgyZmVONGRWMFpidDNuekxydkRNZnZwUHZLMDlWdFk1bDkzVmxtWDNlTzRSZzZ2L0RqcWFxdm02NHJES2NzQzcvdDY4YXorNzZ5aks3cis2b3NDNzhxMjhLeDY3N3ovTDZ3TEtQcytzSnF5OEt3MnJZeDNMNXVMTDl3SE10cjY4b3g2NzVSdG5WOFgzZ0t3L04wZFYxNVpsM0g5blYwNDBjNGZzb0FBSUFCQndDQUFCUEtRS0VoS3dLQU9BRUFqeVNKb21SWm9paFpsaWlLcHVpNm9taTZycVJwcHFscG5tbGFtbWVhcG1tcXNpbWFyaXhwbW1sYW5tYWFtcWVacG1pYXJtdWFwcXlLcGluTHBtcktzbW1hc3V5NnNtMjdybXpib21uS3NtbWFzbXlhcGl5N3NxdmJydXpxdXFSWnBxbDVubWxxbm1lYXBtcktzbW1hcnF0NW5tcDZubWlxbmlpcXFtcXFxcTJxcWl4Ym5tZWFtdWlwcGllS3FtcXFwcTJhcWlyTHBxcmFzbW1xdG15cXFtMjdxdXo2c20zcnVtbXFzbTJxcGkyYnFtcmJydXpxc2l6YnVpOXBtbWxxbm1lYW11ZVpwbW1hc215YXFpdGJucWVhbmlpcXF1YUpwbXFxcWl5YnBxcktsdWVacWllS3F1cUpubXVhcWlyTHBtcmFxbW1hdG15cXFpMmJwaXJMcm0zN3Z1dktzbTZxcW15YnFtcnJwbXJLc216THZ1L0txdTZLcGluTHBxcmFzbW1xc2kzYnN1L0xzcXo3b21uS3NtbXFzbTJxcWk3THNtMGJzMno3dW1pYXNtMnFwaTJicWlyYnNpMzd1aXpidXUvS3JtK3JxcXpyc2kzN3V1NzZybkRydWpDOHNtejdxcXo2dWl2YnVtL3JNdHYyZlVUVGxHVlROVzNiVkZWWmRtWFo5bVhiOW4zUk5HMWJWVlZiTmszVnRtVlo5bjFadG0xaE5FM1pObFZWMWszVnRHMVpsbTFodG1YaGRtWFp0MlZiOW5YWGxYVmYxMzNqMTJYZDVycXk3Y3V5cmZ1cXEvcTI3dnZDY091dThBb0FBQmh3QUFBSU1LRU1GQnF5RWdDSUFnQUFqR0dNTVFpTlVzNDVCNkZSeWpubklHVE9RUWdobGN3NUNDR1VramtIb1pTVU11Y2dsSkpTQ0tHVWxGb0xJWlNVVW1zRkFBQVVPQUFBQk5pZ0tiRTRRS0VoS3dHQVZBQUFnK05ZbHVlWm9tcmFzbU5KbmllS3FxbXF0dTFJbHVlSm9tbXFxbTFibmllS3BxbXFydXZybXVlSm9tbXFxdXZxdW1pYXBxbXFydXU2dWk2YW9xbXFxdXU2c3E2YnBxcXFyaXU3c3V6cnBxcXFxdXZLcml6N3dxcTZyaXZMc20zcndyQ3FydXZLc216YnRtL2N1cTdydnUvN3dwR3Q2N291L01JeERFY0JBT0FKRGdCQUJUYXNqbkJTTkJaWWFNaEtBQ0FEQUlBd0JpR0RFRUlHSVlTUVVrb2hwWlFTQUFBdzRBQUFFR0JDR1NnMFpFVUFFQ2NBQUJoREthU1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSklLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktxYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLWlZTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVnb0FrSXB3QUpCNk1LRU1GQnF5RWdCSUJRQUFqRkZLS2NhY2d4QXg1aGhqMEVrb0tXTE1PY1ljbEpKUzVSeUVFRkpwTGJmS09RZ2hwTlJTYlpselVscUxNZVlZTStla3BCUmJ6VG1IVWxLTHNlYWFhKzZrdEZacnJqWG5XbHFyTmRlY2M4MjV0QlpycmpuWG5IUExNZGVjYzg0NTV4aHp6am5ubkhQT0JRRGdORGdBZ0I3WXNEckNTZEZZWUtFaEt3R0FWQUFBQWhtbEdIUE9PZWdRVW93NTV4eUVFQ0tGR0hQT09RZ2hWSXc1NXh4MEVFS29HSFBNT1FnaGhKQTU1eHlFRUVJSUlYTU9PdWdnaEJCQ0J4MkVFRUlJb1pUT1FRZ2hoQkJLS0NHRUVFSUlJWVFRT2dnaGhCQkNDQ0dFRUVJSUlZUlNTZ2doaEJCQ0NhR1VVQUFBWUlFREFFQ0FEYXNqbkJTTkJSWWFzaElBQUFJQWdCeVdvRkxPaEVHT1FZOE5RY3BSTXcxQ1REblJtV0pPYWpNVlU1QTVFSjEwRWhscVFkbGVNZ3NBQUlBZ0FDREFCQkFZSUNqNFFnaUlNUUFBUVlqTUVBbUZWYkRBb0F3YUhPWUJ3QU5FaEVRQWtKaWdTTHU0Z0M0RFhOREZYUWRDQ0VJUWdsZ2NRQUVKT0RqaGhpZmU4SVFibktCVFZPb2dBQUFBQUFBTUFPQUJBT0NnQUNJaW1xdXd1TURJME5qZzZQQUlBQUFBQUFBV0FQZ0FBRGcrZ0lpSTVpb3NMakF5TkRZNE9qd0NBQUFBQUFBQUFBQ0FnSUFBQUFBQUFFQUFBQUNBZ0U5bloxTUFCQUVBQUFBQUFBQUFYY1hlRndJQUFBQnEybnB4QWdFQkFBbz0nLFxuICAvLyAgZW1wdHlNcDM6ICcvL3VReEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBU1c1bWJ3QUFBQThBQUFBQkFBQURRZ0QvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzhBQUFBNVRFRk5SVE11T1RseUFjMEFBQUFBQUFBQUFCU0FKQUpBUWdBQWdBQUFBMEwyWUxReEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBLy91UXhBQUR3QUFCcEFBQUFDQUFBRFNBQUFBRVRFRk5SVE11T1RrdU5WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVicsXG4gIGhpZ2h0aWNrOiAnVWtsR1JrUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlTQUZBQUN4L3hmL2RBRE9BQ3dCc1AzcCs2SCt6QUdvQk9rQ0N3QlgvRUg1T3Z4bEE0a0oyd2NTQXJUOUUvdXQrSFQyZXZVeDk4bjZPQUY1Q0NVTXdRdmZDT3NKeEF4MERTSU1FQXE5QmlBQjN2aHo3bUxrVDlzUjEzM1l4TjJzNVFMdjB2clVCbndSbnh1UUplRXNTRENpTWQ4eUZTOGFLRklob2hVc0NLajY0dTYyNU9yYUE5SHV5UG5FbGNQK3d4dkpXdFcyNTYzN1ZRMGpIUGduQlRERE0xbzBDektMSys4aHpoZ0ZET3o4U2U0SjQ3RFlWdEcwejVmUXE5TEIxMnJmQStqOTlyb0hBaGVsSXlNd0lqZFRPdVU4bWp3SU9Hb3hoQ2I1RTUzL2orM2szL2ZUWThwVHc0eS9UcitldzhETXZkc2s4UmNIUlJrU0tPNHlHVGtIUGtVL3J6enlOY2dzclI5NERwLzVyK1pzMTd6T25jb0R4aGZFMzhXTHluL1RlT01pOXIwSVJ4bFJLSVF6eVRsT1BLbzl5am1XTWNva0RSTGMvWTdydWR0ZHp1L0QyTDFJdSsyN0pjRzN5WXJWTHVqbCszVU9aeDFVSzVRMHF6bU5QRGs4WmplZU1Qb2p6aEgrL2pMdFBkNW0waEhMSHNZSXc1VEVNTW5BMGp2ajhmU09CaXdYQVNaZ016TThkVUJHUWJJK3J6anBLa0laeWdaVDlRZmxjZGFSeXFYQ3o3K1Z3VVBINzg0cjNLN3MrdjBLRHU4YnZ5ZUxNYjQzTmpyaE9JbzBkU3ZRSGkwUG5QNmk3b3ZnM05UeHk0L0dmOFg4eUgvUUJ0dlg1NVAyWWdiMEZjVWpzeTRMTm1JNWVqaVhNMzhyN2lDOEZKd0hQdm9rN2REZ1FkYUp6bFRLSXNvRnpzclZrdUE4N2QvNnFBaTdGUTBoOUNsS01MRXozVE9yTUJjcVlTRDhFOUFGZC9kUzZrVGY2ZGJVMFhuUXY5SUgyTVhmWitsbjlERUFGd3dkRnk4Z2lpYjZLYXdxZUNoZ0kvVWJIQk9UQ1pqL3Z2WGU3SW5sRnVETjNQM2IwZDFGNGd6cGlmRzIrdTREN1F3MUZmd2JuQ0QrSWxnald5SExIUE1Wb2cybUJMMzdxdlArN052bll1VHY0cnZqZnViTjZrM3dwUFowL1drRU93dGlFVXNXY3htK0dsNGFPaGhpRkRBUEl3bWJBdG43VFBWeTc3enFjZWZyNVlIbUh1bGw3ZW55ZlBtY0FIZ0hldzFSRXI4VmhoZC9GK0FWMVJKMERpa0pXUU5jL1pQM2VmS2Q3aHZzMnVyNDZySHM1dThlOU4vNDgvMGhBLzhIRmd3dUQwNFJTQklSRXFzUU9nN21Dc3NHTUFKVy9YbjRHL1RLOExidXp1MEk3cVR2blBKeTlzWDZiUDg0QkxZSWJBd2REODRRWXhHN0VPY09EQXh3Q0ZNRUFRQzkrN1AzU3ZUWDhYSHcrdTlSOEtUeEl2U285K1g3VlFDVUJKMElNd3ppRGo0UUxoQUdEOVVNcmduVEJaY0JSdjF2K1h2MlVmUys4dGZ4K3ZFUzg3ejArdmIzK1pmOVpnRVFCU0VJVUFyV0M4a00yUXl6QzVFSkVBZHZCSGdCWFA1bisrcjRBdmQ4OVdqMDdmTXc5RDMxSnZmcCtVajl4UUQ5QThRRzVRaFhDbEVMckFzdkM5d0o3Z2Q2QldJQzN2Nk8rN1Q0UFBaTjlFSHpXdk5mOVB6MUZ2aXQrcUw5clFDSEF3RUcvd2VDQ1pVS0Z3dkRDbklKY0FjUUJXY0NhZjhaL0NENTV2YUI5ZEQwd1BTUDlVTDNtL2s3L016K0p3RXlBdzhGekFZN0NCc0phUWs1Q1drSTJnYXRCQ0lDWWYrai9GcjZ2ZmlWOTg3MnNmWlA5MXo0cC9sUiszSDl6Zjg5QXJvRUZBZmpDUDBKY3dvOENqQUpkUWRnQlNFRGtnRFEvVmo3WmZuUjk1VDI4ZlVkOXYzMlZ2ZzIrbmI4Ky82eEFXb0U0QWJEQ1A0SnBBcWJDcVFKMHdlRUJmZ0NUQUNUL1IzN00vbSs5NjcySVBZNjlnYjNhZmhXK3RUOHFmK01BajBGZ2djdUNTY0tYQXJpQ2NNSUVBZnlCSllDRndDUC9SejdBL2w3OTN6MkYvWm45bUgzN2ZqZCtpMzl5ZjlwQXQwRUZBZlJDTmtKR0FxckNaWUl2Z1pQQko4QjZQNC8vTTM1MHZkejlxLzFsZlVxOW16M1JQbWkrM0grYmdGVkJPUUczd2dIQ2t3SzBBbTdDQ0FIQ2dXbUFqQUEnLFxuICBsb3d0aWNrOiAnVWtsR1JsUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlUQUZBQUIwLzV2K1UvNFQvM2dBMHdGVEF1VUIrZjhkL25UOTBmMXEvdWIrdGY0Ni9tYi84d0ZRQTlnQzd3Q2QvbXIrRkFHUkEzY0U2d0pmL2gzNmV2bXYrOHYvTndSSEJaVUMyLzYwKy8vNUV2dVovYVgvYmdGT0FwOEF6dnpoOXdmekxQRjY4elQ0eS8yQkF5Z0lmUXdhRWpZWTB4MzFJcndsOFNPV0hWRVNPZ1BoOU5mcFJlRnQyMm5ZSGRkRDJCWGNaZURhNUlucWdQRHg5blArNmdTNENCWUxudzB6RVMwV1h4djRIa2NnTGgvMUcrRVgxUk5wRDR3S2lnWEgvNnI1L2ZOdTdsVHBqK1p1NWhIb1hPdEw3MWJ5ci9RcDkxTDY0djZPQk80Sm9RNXpFc2tVK2hVMUZpUVZlUlA3RVdnUDRRcjBCSVQrdFBpZDlDM3kxdkNoOEZEeEp2SzI4dnZ5eS9MQThwTHpVL1hQOTV2Nnh2dzQvdUQvUkFLMkJTa0tjZzZCRVNjVFpCTWVFcWtQVFF4akNLRUVWd0ZpL252N2gvaHA5YUR5QXZIUDhNZnhMdk0rOVBYMHVQVzE5Zy80TGZyNy9DNEFLZ05hQlhRR3l3YjBCaElIV1FmV0Ixb0l6QWp0Q0Y4SUh3ZHRCYWtEVndLTEFlWUE4djl3L2tqODEvblE5NHYyOS9YWDliejFiUFVZOVV6MVovYUgrSHI3eVA0TUFpNEYrd2NmQ25ZTE5neWZEUHNNU3cwc0RVQU1mZ3JjQjVJRU13RmIvaVg4VC9wVCtPLzFYL01mOGNidnJPKzE4TUx5dmZWUCtSZjl3Z0FvQkNFSHB3bklDNUVONFE1QUQzd08xQXkwQ3BzSXZ3YnZCTmNDYlFBci9uWDhPZnNmK3ZiNG12ZGE5cmoxei9XWDlwTDNhL2hIK1pYNlIvd24vdlAvZVFFU0EvQUUrd1lEQ2N3S0ZBeVBEQ2tNRlF1U0NlNEhWUWJTQkhRREN3SThBTkw5SlB1WStIWDI4dlRxODJQemRQTVY5QXoxTWZaNDl6RDVnZnR4L3NRQkJRWExCOGNKL2dxcEN3OE1pZ3dXRFhFTlhRMnJERFVMN1FnREJzd0NkdjhTL0s3NFdQVms4aFh3b3U0UDdtdnUxKzlUOHB6MVV2bGkvWm9Cd2dXUkNjc01QZy9DRUVRUjRSREFEd29POXd1c0NWTUg0QVJTQXBuL3VmemQrV2ozYnZYNzh4enp4L0w2OHF6ejF2U0Q5cVg0R2Z2ZC9jMEFod08vQld3SG1naHZDUUVLVlFvbkNsc0pDd2lJQmgwRjBnT2dBbTBCT3dBeC8wMytYUDBnL0xiNmNQbVgrRi80dmZoKytUSDZzL29zKzcvN2N2d0wvWno5WFA1Ty8zSUEzQUY5QXpzRjlnYVVDQUFLSGd1ZUN6Y0w5d250QjNzRjR3SXpBSTM5NmZwMStHdjJJdlduOU4zMHAvWGk5bTc0Ry9ydSs5UDlrLzhhQVlFQzFBTVRCU0lHMHdZdUIxZ0hrZ2NBQ0dFSVNBaFRCekVGV0FLdC81TDkyZnVVK3ZYNTBmbWYrU1A1aS9nYitCZjRtdml2K1NyN2t2eWIvVWorci80WC84ci8rZ0NpQW8wRVVBYVJCendJU3dqcUIzSUhHUWZDQnY4RnBnVE1BcFFBS2Y2Nys1bjUvdmZuOWp6MnlQVm45U0wxUlBYcTlTUDNEdm1yKzZmK3NRR0tCQWNIK3doT0NoMExhd3MzQzI4S0xBbURCNUFGZlFOb0FWUC9adjNlKzdQNnNmbkwrQ3Y0dlBlTTk1YjM3ZmVWK0puNTFQb3EvTEw5bXYrWUFWWUQzZ1F1Qm1jSFNBaWtDSUVJN0FmK0J1RUZuZ1FYQTFzQnYvOXYvcGY5TVAzVy9GajhxL3NSKzZINlUvbzMrbVA2eS9wTisvZjd4dnllL1dIK0pmOW1BRDRDUUFRSkJpc0h0Z2Y2QncwSThRZHNCMXNHeXdUNEFnZ0JDUC9vL0tYNm1QZzE5NTcyamZhejl1ZjJTL2NNK0UzNUUvdFcvYWYvNXdIMUE4QUZLZ2ZrQi9BSGd3ZnhCbEFHZ1FWSUJNTUNKd0dzLzQzK3ZQMGkvWnI4TGZ6bCs5SDc2ZnZpKzlmNzVmc2YvSW44QlAxMC9lajljZjRPLzdmL2RBQWNBYVVCRWdLTUFoZ0RwQU1FQkNFRUR3VGZBM0lEeFFMOEFTb0JVd0NHLzg3K0ovNmgvUnI5cFB4ay9HYjhvUHdKL1hIOXcvMzkvVUQrcVA0MS85RC9Xd0RlQUdzQkFnS2RBaEVEUVFOQUEwc0Rid09WQTVZRFZ3UE9BaGdDVkFHUkFBPT0nXG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSBzYW1wbGVzOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuc2F2ZUFzTUlESUZpbGUgPSBzYXZlQXNNSURJRmlsZTtcblxudmFyIF9maWxlc2F2ZXJqcyA9IHJlcXVpcmUoJ2ZpbGVzYXZlcmpzJyk7XG5cbnZhciBQUFEgPSA5NjA7IC8qXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgVGhpcyBjb2RlIGlzIGJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9zZXJnaS9qc21pZGlcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgaW5mbzogaHR0cDovL3d3dy5kZWx1Z2UuY28vP3E9bWlkaS10ZW1wby1icG1cbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgKi9cblxudmFyIEhEUl9QUFEgPSBzdHIyQnl0ZXMoUFBRLnRvU3RyaW5nKDE2KSwgMik7XG5cbnZhciBIRFJfQ0hVTktJRCA9IFsnTScuY2hhckNvZGVBdCgwKSwgJ1QnLmNoYXJDb2RlQXQoMCksICdoJy5jaGFyQ29kZUF0KDApLCAnZCcuY2hhckNvZGVBdCgwKV07XG52YXIgSERSX0NIVU5LX1NJWkUgPSBbMHgwLCAweDAsIDB4MCwgMHg2XTsgLy8gSGVhZGVyIHNpemUgZm9yIFNNRlxudmFyIEhEUl9UWVBFMCA9IFsweDAsIDB4MF07IC8vIE1pZGkgVHlwZSAwIGlkXG52YXIgSERSX1RZUEUxID0gWzB4MCwgMHgxXTsgLy8gTWlkaSBUeXBlIDEgaWRcbi8vSERSX1BQUSA9IFsweDAxLCAweEUwXSAvLyBEZWZhdWx0cyB0byA0ODAgdGlja3MgcGVyIGJlYXRcbi8vSERSX1BQUSA9IFsweDAwLCAweDgwXSAvLyBEZWZhdWx0cyB0byAxMjggdGlja3MgcGVyIGJlYXRcblxudmFyIFRSS19DSFVOS0lEID0gWydNJy5jaGFyQ29kZUF0KDApLCAnVCcuY2hhckNvZGVBdCgwKSwgJ3InLmNoYXJDb2RlQXQoMCksICdrJy5jaGFyQ29kZUF0KDApXTtcblxuLy8gTWV0YSBldmVudCBjb2Rlc1xudmFyIE1FVEFfU0VRVUVOQ0UgPSAweDAwO1xudmFyIE1FVEFfVEVYVCA9IDB4MDE7XG52YXIgTUVUQV9DT1BZUklHSFQgPSAweDAyO1xudmFyIE1FVEFfVFJBQ0tfTkFNRSA9IDB4MDM7XG52YXIgTUVUQV9JTlNUUlVNRU5UID0gMHgwNDtcbnZhciBNRVRBX0xZUklDID0gMHgwNTtcbnZhciBNRVRBX01BUktFUiA9IDB4MDY7XG52YXIgTUVUQV9DVUVfUE9JTlQgPSAweDA3O1xudmFyIE1FVEFfQ0hBTk5FTF9QUkVGSVggPSAweDIwO1xudmFyIE1FVEFfRU5EX09GX1RSQUNLID0gMHgyZjtcbnZhciBNRVRBX1RFTVBPID0gMHg1MTtcbnZhciBNRVRBX1NNUFRFID0gMHg1NDtcbnZhciBNRVRBX1RJTUVfU0lHID0gMHg1ODtcbnZhciBNRVRBX0tFWV9TSUcgPSAweDU5O1xudmFyIE1FVEFfU0VRX0VWRU5UID0gMHg3ZjtcblxuZnVuY3Rpb24gc2F2ZUFzTUlESUZpbGUoc29uZykge1xuICB2YXIgZmlsZU5hbWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBzb25nLm5hbWUgOiBhcmd1bWVudHNbMV07XG4gIHZhciBwcHEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyA5NjAgOiBhcmd1bWVudHNbMl07XG5cblxuICBQUFEgPSBwcHE7XG4gIEhEUl9QUFEgPSBzdHIyQnl0ZXMoUFBRLnRvU3RyaW5nKDE2KSwgMik7XG5cbiAgdmFyIGJ5dGVBcnJheSA9IFtdLmNvbmNhdChIRFJfQ0hVTktJRCwgSERSX0NIVU5LX1NJWkUsIEhEUl9UWVBFMSk7XG4gIHZhciB0cmFja3MgPSBzb25nLmdldFRyYWNrcygpO1xuICB2YXIgbnVtVHJhY2tzID0gdHJhY2tzLmxlbmd0aCArIDE7XG4gIHZhciBpID0gdm9pZCAwLFxuICAgICAgbWF4aSA9IHZvaWQgMCxcbiAgICAgIHRyYWNrID0gdm9pZCAwLFxuICAgICAgbWlkaUZpbGUgPSB2b2lkIDAsXG4gICAgICBkZXN0aW5hdGlvbiA9IHZvaWQgMCxcbiAgICAgIGI2NCA9IHZvaWQgMDtcbiAgdmFyIGFycmF5QnVmZmVyID0gdm9pZCAwLFxuICAgICAgZGF0YVZpZXcgPSB2b2lkIDAsXG4gICAgICB1aW50QXJyYXkgPSB2b2lkIDA7XG5cbiAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdChzdHIyQnl0ZXMobnVtVHJhY2tzLnRvU3RyaW5nKDE2KSwgMiksIEhEUl9QUFEpO1xuXG4gIC8vY29uc29sZS5sb2coYnl0ZUFycmF5KTtcbiAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdCh0cmFja1RvQnl0ZXMoc29uZy5fdGltZUV2ZW50cywgc29uZy5fZHVyYXRpb25UaWNrcywgJ3RlbXBvJykpO1xuXG4gIGZvciAoaSA9IDAsIG1heGkgPSB0cmFja3MubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKSB7XG4gICAgdHJhY2sgPSB0cmFja3NbaV07XG4gICAgdmFyIGluc3RydW1lbnQgPSB2b2lkIDA7XG4gICAgaWYgKHRyYWNrLl9pbnN0cnVtZW50ICE9PSBudWxsKSB7XG4gICAgICBpbnN0cnVtZW50ID0gdHJhY2suX2luc3RydW1lbnQuaWQ7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codHJhY2submFtZSwgdHJhY2suX2V2ZW50cy5sZW5ndGgsIGluc3RydW1lbnQpXG4gICAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdCh0cmFja1RvQnl0ZXModHJhY2suX2V2ZW50cywgc29uZy5fZHVyYXRpb25UaWNrcywgdHJhY2submFtZSwgaW5zdHJ1bWVudCkpO1xuICAgIC8vYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdCh0cmFja1RvQnl0ZXModHJhY2suX2V2ZW50cywgc29uZy5fbGFzdEV2ZW50Lmlja3MsIHRyYWNrLm5hbWUsIGluc3RydW1lbnQpKVxuICB9XG5cbiAgLy9iNjQgPSBidG9hKGNvZGVzMlN0cihieXRlQXJyYXkpKVxuICAvL3dpbmRvdy5sb2NhdGlvbi5hc3NpZ24oXCJkYXRhOmF1ZGlvL21pZGk7YmFzZTY0LFwiICsgYjY0KVxuICAvL2NvbnNvbGUubG9nKGI2NCkvLyBzZW5kIHRvIHNlcnZlclxuXG4gIG1heGkgPSBieXRlQXJyYXkubGVuZ3RoO1xuICBhcnJheUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihtYXhpKTtcbiAgdWludEFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpO1xuICBmb3IgKGkgPSAwOyBpIDwgbWF4aTsgaSsrKSB7XG4gICAgdWludEFycmF5W2ldID0gYnl0ZUFycmF5W2ldO1xuICB9XG4gIG1pZGlGaWxlID0gbmV3IEJsb2IoW3VpbnRBcnJheV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL3gtbWlkaScsIGVuZGluZ3M6ICd0cmFuc3BhcmVudCcgfSk7XG4gIGZpbGVOYW1lID0gZmlsZU5hbWUucmVwbGFjZSgvXFwubWlkaSQvLCAnJyk7XG4gIC8vbGV0IHBhdHQgPSAvXFwubWlkW2ldezAsMX0kL1xuICB2YXIgcGF0dCA9IC9cXC5taWQkLztcbiAgdmFyIGhhc0V4dGVuc2lvbiA9IHBhdHQudGVzdChmaWxlTmFtZSk7XG4gIGlmIChoYXNFeHRlbnNpb24gPT09IGZhbHNlKSB7XG4gICAgZmlsZU5hbWUgKz0gJy5taWQnO1xuICB9XG4gIC8vY29uc29sZS5sb2coZmlsZU5hbWUsIGhhc0V4dGVuc2lvbilcbiAgKDAsIF9maWxlc2F2ZXJqcy5zYXZlQXMpKG1pZGlGaWxlLCBmaWxlTmFtZSk7XG4gIC8vd2luZG93LmxvY2F0aW9uLmFzc2lnbih3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChtaWRpRmlsZSkpXG59XG5cbmZ1bmN0aW9uIHRyYWNrVG9CeXRlcyhldmVudHMsIGxhc3RFdmVudFRpY2tzLCB0cmFja05hbWUpIHtcbiAgdmFyIGluc3RydW1lbnROYW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gJ25vIGluc3RydW1lbnQnIDogYXJndW1lbnRzWzNdO1xuXG4gIHZhciBsZW5ndGhCeXRlcyxcbiAgICAgIGksXG4gICAgICBtYXhpLFxuICAgICAgZXZlbnQsXG4gICAgICBzdGF0dXMsXG4gICAgICB0cmFja0xlbmd0aCxcbiAgICAgIC8vIG51bWJlciBvZiBieXRlcyBpbiB0cmFjayBjaHVua1xuICB0aWNrcyA9IDAsXG4gICAgICBkZWx0YSA9IDAsXG4gICAgICB0cmFja0J5dGVzID0gW107XG5cbiAgaWYgKHRyYWNrTmFtZSkge1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDMpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEodHJhY2tOYW1lLmxlbmd0aCkpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHJpbmdUb051bUFycmF5KHRyYWNrTmFtZSkpO1xuICB9XG5cbiAgaWYgKGluc3RydW1lbnROYW1lKSB7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDApO1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHgwNCk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUShpbnN0cnVtZW50TmFtZS5sZW5ndGgpKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoc3RyaW5nVG9OdW1BcnJheShpbnN0cnVtZW50TmFtZSkpO1xuICB9XG5cbiAgZm9yIChpID0gMCwgbWF4aSA9IGV2ZW50cy5sZW5ndGg7IGkgPCBtYXhpOyBpKyspIHtcbiAgICBldmVudCA9IGV2ZW50c1tpXTtcbiAgICBkZWx0YSA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gICAgZGVsdGEgPSBjb252ZXJ0VG9WTFEoZGVsdGEpO1xuICAgIC8vY29uc29sZS5sb2coZGVsdGEpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChkZWx0YSk7XG4gICAgLy90cmFja0J5dGVzLnB1c2guYXBwbHkodHJhY2tCeXRlcywgZGVsdGEpO1xuICAgIGlmIChldmVudC50eXBlID09PSAweDgwIHx8IGV2ZW50LnR5cGUgPT09IDB4OTApIHtcbiAgICAgIC8vIG5vdGUgb2ZmLCBub3RlIG9uXG4gICAgICAvL3N0YXR1cyA9IHBhcnNlSW50KGV2ZW50LnR5cGUudG9TdHJpbmcoMTYpICsgZXZlbnQuY2hhbm5lbC50b1N0cmluZygxNiksIDE2KTtcbiAgICAgIHN0YXR1cyA9IGV2ZW50LnR5cGUgKyAoZXZlbnQuY2hhbm5lbCB8fCAwKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChzdGF0dXMpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKGV2ZW50LmRhdGExKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChldmVudC5kYXRhMik7XG4gICAgfSBlbHNlIGlmIChldmVudC50eXBlID09PSAweDUxKSB7XG4gICAgICAvLyB0ZW1wb1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4NTEpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4MDMpOyAvLyBsZW5ndGhcbiAgICAgIC8vdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUSgzKSk7Ly8gbGVuZ3RoXG4gICAgICB2YXIgbWljcm9TZWNvbmRzID0gTWF0aC5yb3VuZCg2MDAwMDAwMCAvIGV2ZW50LmJwbSk7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJwbSlcbiAgICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHIyQnl0ZXMobWljcm9TZWNvbmRzLnRvU3RyaW5nKDE2KSwgMykpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gMHg1OCkge1xuICAgICAgLy8gdGltZSBzaWduYXR1cmVcbiAgICAgIHZhciBkZW5vbSA9IGV2ZW50LmRlbm9taW5hdG9yO1xuICAgICAgaWYgKGRlbm9tID09PSAyKSB7XG4gICAgICAgIGRlbm9tID0gMHgwMTtcbiAgICAgIH0gZWxzZSBpZiAoZGVub20gPT09IDQpIHtcbiAgICAgICAgZGVub20gPSAweDAyO1xuICAgICAgfSBlbHNlIGlmIChkZW5vbSA9PT0gOCkge1xuICAgICAgICBkZW5vbSA9IDB4MDM7XG4gICAgICB9IGVsc2UgaWYgKGRlbm9tID09PSAxNikge1xuICAgICAgICBkZW5vbSA9IDB4MDQ7XG4gICAgICB9IGVsc2UgaWYgKGRlbm9tID09PSAzMikge1xuICAgICAgICBkZW5vbSA9IDB4MDU7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRlbm9taW5hdG9yLCBldmVudC5ub21pbmF0b3IpXG4gICAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHg1OCk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHgwNCk7IC8vIGxlbmd0aFxuICAgICAgLy90cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKDQpKTsvLyBsZW5ndGhcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChldmVudC5ub21pbmF0b3IpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKGRlbm9tKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChQUFEgLyBldmVudC5ub21pbmF0b3IpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4MDgpOyAvLyAzMm5kIG5vdGVzIHBlciBjcm90Y2hldFxuICAgICAgLy9jb25zb2xlLmxvZyh0cmFja05hbWUsIGV2ZW50Lm5vbWluYXRvciwgZXZlbnQuZGVub21pbmF0b3IsIGRlbm9tLCBQUFEvZXZlbnQubm9taW5hdG9yKTtcbiAgICB9XG4gICAgLy8gc2V0IHRoZSBuZXcgdGlja3MgcmVmZXJlbmNlXG4gICAgLy9jb25zb2xlLmxvZyhzdGF0dXMsIGV2ZW50LnRpY2tzLCB0aWNrcyk7XG4gICAgdGlja3MgPSBldmVudC50aWNrcztcbiAgfVxuICBkZWx0YSA9IGxhc3RFdmVudFRpY2tzIC0gdGlja3M7XG4gIC8vY29uc29sZS5sb2coJ2QnLCBkZWx0YSwgJ3QnLCB0aWNrcywgJ2wnLCBsYXN0RXZlbnRUaWNrcyk7XG4gIGRlbHRhID0gY29udmVydFRvVkxRKGRlbHRhKTtcbiAgLy9jb25zb2xlLmxvZyh0cmFja05hbWUsIHRpY2tzLCBkZWx0YSk7XG4gIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChkZWx0YSk7XG4gIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgdHJhY2tCeXRlcy5wdXNoKDB4MkYpO1xuICB0cmFja0J5dGVzLnB1c2goMHgwMCk7XG4gIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCB0cmFja0J5dGVzKTtcbiAgdHJhY2tMZW5ndGggPSB0cmFja0J5dGVzLmxlbmd0aDtcbiAgbGVuZ3RoQnl0ZXMgPSBzdHIyQnl0ZXModHJhY2tMZW5ndGgudG9TdHJpbmcoMTYpLCA0KTtcbiAgcmV0dXJuIFtdLmNvbmNhdChUUktfQ0hVTktJRCwgbGVuZ3RoQnl0ZXMsIHRyYWNrQnl0ZXMpO1xufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5cbi8qXG4gKiBDb252ZXJ0cyBhbiBhcnJheSBvZiBieXRlcyB0byBhIHN0cmluZyBvZiBoZXhhZGVjaW1hbCBjaGFyYWN0ZXJzLiBQcmVwYXJlc1xuICogaXQgdG8gYmUgY29udmVydGVkIGludG8gYSBiYXNlNjQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBieXRlQXJyYXkge0FycmF5fSBhcnJheSBvZiBieXRlcyB0aGF0IHdpbGwgYmUgY29udmVydGVkIHRvIGEgc3RyaW5nXG4gKiBAcmV0dXJucyBoZXhhZGVjaW1hbCBzdHJpbmdcbiAqL1xuXG5mdW5jdGlvbiBjb2RlczJTdHIoYnl0ZUFycmF5KSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGJ5dGVBcnJheSk7XG59XG5cbi8qXG4gKiBDb252ZXJ0cyBhIFN0cmluZyBvZiBoZXhhZGVjaW1hbCB2YWx1ZXMgdG8gYW4gYXJyYXkgb2YgYnl0ZXMuIEl0IGNhbiBhbHNvXG4gKiBhZGQgcmVtYWluaW5nICcwJyBuaWJibGVzIGluIG9yZGVyIHRvIGhhdmUgZW5vdWdoIGJ5dGVzIGluIHRoZSBhcnJheSBhcyB0aGVcbiAqIHxmaW5hbEJ5dGVzfCBwYXJhbWV0ZXIuXG4gKlxuICogQHBhcmFtIHN0ciB7U3RyaW5nfSBzdHJpbmcgb2YgaGV4YWRlY2ltYWwgdmFsdWVzIGUuZy4gJzA5N0I4QSdcbiAqIEBwYXJhbSBmaW5hbEJ5dGVzIHtJbnRlZ2VyfSBPcHRpb25hbC4gVGhlIGRlc2lyZWQgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgdGhlIHJldHVybmVkIGFycmF5IHNob3VsZCBjb250YWluXG4gKiBAcmV0dXJucyBhcnJheSBvZiBuaWJibGVzLlxuICovXG5cbmZ1bmN0aW9uIHN0cjJCeXRlcyhzdHIsIGZpbmFsQnl0ZXMpIHtcbiAgaWYgKGZpbmFsQnl0ZXMpIHtcbiAgICB3aGlsZSAoc3RyLmxlbmd0aCAvIDIgPCBmaW5hbEJ5dGVzKSB7XG4gICAgICBzdHIgPSAnMCcgKyBzdHI7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJ5dGVzID0gW107XG4gIGZvciAodmFyIGkgPSBzdHIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDIpIHtcbiAgICB2YXIgY2hhcnMgPSBpID09PSAwID8gc3RyW2ldIDogc3RyW2kgLSAxXSArIHN0cltpXTtcbiAgICBieXRlcy51bnNoaWZ0KHBhcnNlSW50KGNoYXJzLCAxNikpO1xuICB9XG5cbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG4vKipcbiAqIFRyYW5zbGF0ZXMgbnVtYmVyIG9mIHRpY2tzIHRvIE1JREkgdGltZXN0YW1wIGZvcm1hdCwgcmV0dXJuaW5nIGFuIGFycmF5IG9mXG4gKiBieXRlcyB3aXRoIHRoZSB0aW1lIHZhbHVlcy4gTWlkaSBoYXMgYSB2ZXJ5IHBhcnRpY3VsYXIgdGltZSB0byBleHByZXNzIHRpbWUsXG4gKiB0YWtlIGEgZ29vZCBsb29rIGF0IHRoZSBzcGVjIGJlZm9yZSBldmVyIHRvdWNoaW5nIHRoaXMgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHRpY2tzIHtJbnRlZ2VyfSBOdW1iZXIgb2YgdGlja3MgdG8gYmUgdHJhbnNsYXRlZFxuICogQHJldHVybnMgQXJyYXkgb2YgYnl0ZXMgdGhhdCBmb3JtIHRoZSBNSURJIHRpbWUgdmFsdWVcbiAqL1xuZnVuY3Rpb24gY29udmVydFRvVkxRKHRpY2tzKSB7XG4gIHZhciBidWZmZXIgPSB0aWNrcyAmIDB4N0Y7XG5cbiAgd2hpbGUgKHRpY2tzID0gdGlja3MgPj4gNykge1xuICAgIGJ1ZmZlciA8PD0gODtcbiAgICBidWZmZXIgfD0gdGlja3MgJiAweDdGIHwgMHg4MDtcbiAgfVxuXG4gIHZhciBiTGlzdCA9IFtdO1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIGJMaXN0LnB1c2goYnVmZmVyICYgMHhmZik7XG5cbiAgICBpZiAoYnVmZmVyICYgMHg4MCkge1xuICAgICAgYnVmZmVyID4+PSA4O1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKHRpY2tzLCBiTGlzdCk7XG4gIHJldHVybiBiTGlzdDtcbn1cblxuLypcbiAqIENvbnZlcnRzIGEgc3RyaW5nIGludG8gYW4gYXJyYXkgb2YgQVNDSUkgY2hhciBjb2RlcyBmb3IgZXZlcnkgY2hhcmFjdGVyIG9mXG4gKiB0aGUgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBzdHIge1N0cmluZ30gU3RyaW5nIHRvIGJlIGNvbnZlcnRlZFxuICogQHJldHVybnMgYXJyYXkgd2l0aCB0aGUgY2hhcmNvZGUgdmFsdWVzIG9mIHRoZSBzdHJpbmdcbiAqL1xudmFyIEFQID0gQXJyYXkucHJvdG90eXBlO1xuZnVuY3Rpb24gc3RyaW5nVG9OdW1BcnJheShzdHIpIHtcbiAgLy8gcmV0dXJuIHN0ci5zcGxpdCgpLmZvckVhY2goY2hhciA9PiB7XG4gIC8vICAgcmV0dXJuIGNoYXIuY2hhckNvZGVBdCgwKVxuICAvLyB9KVxuICByZXR1cm4gQVAubWFwLmNhbGwoc3RyLCBmdW5jdGlvbiAoY2hhcikge1xuICAgIHJldHVybiBjaGFyLmNoYXJDb2RlQXQoMCk7XG4gIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9pbml0X21pZGkgPSByZXF1aXJlKCcuL2luaXRfbWlkaScpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9taWRpX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpX2V2ZW50Jyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy8gbWlsbGlzXG5cbnZhciBTY2hlZHVsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFNjaGVkdWxlcihzb25nKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNjaGVkdWxlcik7XG5cbiAgICB0aGlzLnNvbmcgPSBzb25nO1xuICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5idWZmZXJUaW1lID0gc29uZy5idWZmZXJUaW1lO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFNjaGVkdWxlciwgW3tcbiAgICBrZXk6ICdpbml0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChtaWxsaXMpIHtcbiAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSBtaWxsaXM7XG4gICAgICB0aGlzLnNvbmdTdGFydE1pbGxpcyA9IG1pbGxpcztcbiAgICAgIHRoaXMuZXZlbnRzID0gdGhpcy5zb25nLl9hbGxFdmVudHM7XG4gICAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aDtcbiAgICAgIHRoaXMuaW5kZXggPSAwO1xuICAgICAgdGhpcy5tYXh0aW1lID0gMDtcbiAgICAgIHRoaXMucHJldk1heHRpbWUgPSAwO1xuICAgICAgdGhpcy5iZXlvbmRMb29wID0gZmFsc2U7IC8vIHRlbGxzIHVzIGlmIHRoZSBwbGF5aGVhZCBoYXMgYWxyZWFkeSBwYXNzZWQgdGhlIGxvb3BlZCBzZWN0aW9uXG4gICAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5sb29wZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRNaWxsaXMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZVNvbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVTb25nKCkge1xuICAgICAgLy90aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzXG4gICAgICB0aGlzLmV2ZW50cyA9IHRoaXMuc29uZy5fYWxsRXZlbnRzO1xuICAgICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGg7XG4gICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAgIHRoaXMubWF4dGltZSA9IDA7XG4gICAgICAvL3RoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nLl9jdXJyZW50TWlsbGlzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRUaW1lU3RhbXAnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRUaW1lU3RhbXAodGltZVN0YW1wKSB7XG4gICAgICB0aGlzLnRpbWVTdGFtcCA9IHRpbWVTdGFtcDsgLy8gdGltZXN0YW1wIFdlYkF1ZGlvIGNvbnRleHQgLT4gZm9yIGludGVybmFsIGluc3RydW1lbnRzXG4gICAgICB0aGlzLnRpbWVTdGFtcDIgPSBwZXJmb3JtYW5jZS5ub3coKTsgLy8gdGltZXN0YW1wIHNpbmNlIG9wZW5pbmcgd2VicGFnZSAtPiBmb3IgZXh0ZXJuYWwgaW5zdHJ1bWVudHNcbiAgICB9XG5cbiAgICAvLyBnZXQgdGhlIGluZGV4IG9mIHRoZSBldmVudCB0aGF0IGhhcyBpdHMgbWlsbGlzIHZhbHVlIGF0IG9yIHJpZ2h0IGFmdGVyIHRoZSBwcm92aWRlZCBtaWxsaXMgdmFsdWVcblxuICB9LCB7XG4gICAga2V5OiAnc2V0SW5kZXgnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRJbmRleChtaWxsaXMpIHtcbiAgICAgIHZhciBpID0gMDtcbiAgICAgIHZhciBldmVudCA9IHZvaWQgMDtcbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0aGlzLmV2ZW50c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICBldmVudCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYmV5b25kTG9vcCA9IG1pbGxpcyA+IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcztcbiAgICAgIC8vIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICAgIC8vdGhpcy5sb29wZWQgPSBmYWxzZVxuICAgICAgdGhpcy5wcmVjb3VudGluZ0RvbmUgPSBmYWxzZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFdmVudHMoKSB7XG4gICAgICB2YXIgZXZlbnRzID0gW107XG5cbiAgICAgIGlmICh0aGlzLnNvbmcuX2xvb3AgPT09IHRydWUgJiYgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gPCB0aGlzLmJ1ZmZlclRpbWUpIHtcbiAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nU3RhcnRNaWxsaXMgKyB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvbiAtIDE7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCB0aGlzLnNvbmcubG9vcER1cmF0aW9uKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc29uZy5fbG9vcCA9PT0gdHJ1ZSkge1xuXG4gICAgICAgIGlmICh0aGlzLm1heHRpbWUgPj0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzICYmIHRoaXMuYmV5b25kTG9vcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdMT09QJywgdGhpcy5tYXh0aW1lLCB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMpXG5cbiAgICAgICAgICB2YXIgZGlmZiA9IHRoaXMubWF4dGltZSAtIHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcztcbiAgICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmcuX2xlZnRMb2NhdG9yLm1pbGxpcyArIGRpZmY7XG5cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tTE9PUEVEJywgdGhpcy5tYXh0aW1lLCBkaWZmLCB0aGlzLnNvbmcuX2xlZnRMb2NhdG9yLm1pbGxpcywgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKTtcblxuICAgICAgICAgIGlmICh0aGlzLmxvb3BlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMubG9vcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBsZWZ0TWlsbGlzID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXM7XG4gICAgICAgICAgICB2YXIgcmlnaHRNaWxsaXMgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXM7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgICAgICAgaWYgKGV2ZW50Lm1pbGxpcyA8IHJpZ2h0TWlsbGlzKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG4gICAgICAgICAgICAgICAgZXZlbnQudGltZTIgPSB0aGlzLnRpbWVTdGFtcDIgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLm5vdGVzLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQudHlwZSlcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3RvcCBvdmVyZmxvd2luZyBub3Rlcy0+IGFkZCBhIG5ldyBub3RlIG9mZiBldmVudCBhdCB0aGUgcG9zaXRpb24gb2YgdGhlIHJpZ2h0IGxvY2F0b3IgKGVuZCBvZiB0aGUgbG9vcClcbiAgICAgICAgICAgIHZhciBlbmRUaWNrcyA9IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLnRpY2tzIC0gMTtcbiAgICAgICAgICAgIHZhciBlbmRNaWxsaXMgPSB0aGlzLnNvbmcuY2FsY3VsYXRlUG9zaXRpb24oeyB0eXBlOiAndGlja3MnLCB0YXJnZXQ6IGVuZFRpY2tzLCByZXN1bHQ6ICdtaWxsaXMnIH0pLm1pbGxpcztcblxuICAgICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSB0aGlzLm5vdGVzLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vdGUgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgICAgICAgICAgICB2YXIgbm90ZU9uID0gbm90ZS5ub3RlT247XG4gICAgICAgICAgICAgICAgdmFyIG5vdGVPZmYgPSBub3RlLm5vdGVPZmY7XG4gICAgICAgICAgICAgICAgaWYgKG5vdGVPZmYubWlsbGlzIDw9IHJpZ2h0TWlsbGlzKSB7XG4gICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIF9ldmVudCA9IG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQoZW5kVGlja3MsIDEyOCwgbm90ZU9uLmRhdGExLCAwKTtcbiAgICAgICAgICAgICAgICBfZXZlbnQubWlsbGlzID0gZW5kTWlsbGlzO1xuICAgICAgICAgICAgICAgIF9ldmVudC5fcGFydCA9IG5vdGVPbi5fcGFydDtcbiAgICAgICAgICAgICAgICBfZXZlbnQuX3RyYWNrID0gbm90ZU9uLl90cmFjaztcbiAgICAgICAgICAgICAgICBfZXZlbnQubWlkaU5vdGUgPSBub3RlO1xuICAgICAgICAgICAgICAgIF9ldmVudC5taWRpTm90ZUlkID0gbm90ZS5pZDtcbiAgICAgICAgICAgICAgICBfZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgX2V2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuICAgICAgICAgICAgICAgIF9ldmVudC50aW1lMiA9IHRoaXMudGltZVN0YW1wMiArIF9ldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdhZGRlZCcsIGV2ZW50KVxuICAgICAgICAgICAgICAgIGV2ZW50cy5wdXNoKF9ldmVudCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RvcCBvdmVyZmxvd2luZyBhdWRpbyBzYW1wbGVzXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IoaSBpbiB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cy5oYXNPd25Qcm9wZXJ0eShpKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9FdmVudCA9IHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXVkaW9FdmVudC5lbmRNaWxsaXMgPiB0aGlzLnNvbmcubG9vcEVuZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdWRpb0V2ZW50LnN0b3BTYW1wbGUodGhpcy5zb25nLmxvb3BFbmQvMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3BwaW5nIGF1ZGlvIGV2ZW50JywgaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICovXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgICAgICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLnNldEluZGV4KGxlZnRNaWxsaXMpO1xuICAgICAgICAgICAgdGhpcy50aW1lU3RhbXAgKz0gdGhpcy5zb25nLl9sb29wRHVyYXRpb247XG4gICAgICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzIC09IHRoaXMuc29uZy5fbG9vcER1cmF0aW9uO1xuXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50cy5sZW5ndGgpXG5cbiAgICAgICAgICAgIC8vIGdldCB0aGUgYXVkaW8gZXZlbnRzIHRoYXQgc3RhcnQgYmVmb3JlIHNvbmcubG9vcFN0YXJ0XG4gICAgICAgICAgICAvL3RoaXMuZ2V0RGFuZ2xpbmdBdWRpb0V2ZW50cyh0aGlzLnNvbmcubG9vcFN0YXJ0LCBldmVudHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9vcGVkID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL2NvbnNvbGUubG9nKCdzY2hlZHVsZXInLCB0aGlzLmxvb3BlZClcblxuICAgICAgLy8gbWFpbiBsb29wXG4gICAgICBmb3IgKHZhciBfaSA9IHRoaXMuaW5kZXg7IF9pIDwgdGhpcy5udW1FdmVudHM7IF9pKyspIHtcbiAgICAgICAgdmFyIF9ldmVudDIgPSB0aGlzLmV2ZW50c1tfaV07XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCB0aGlzLm1heHRpbWUpXG4gICAgICAgIGlmIChfZXZlbnQyLm1pbGxpcyA8IHRoaXMubWF4dGltZSkge1xuXG4gICAgICAgICAgLy9ldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcblxuICAgICAgICAgIGlmIChfZXZlbnQyLnR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgX2V2ZW50Mi50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBfZXZlbnQyLm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuICAgICAgICAgICAgICBfZXZlbnQyLnRpbWUyID0gdGhpcy50aW1lU3RhbXAyICsgX2V2ZW50Mi5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2goX2V2ZW50Mik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZXZlbnRzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZShkaWZmKSB7XG4gICAgICB2YXIgaSwgZXZlbnQsIG51bUV2ZW50cywgdHJhY2ssIGV2ZW50cztcblxuICAgICAgdGhpcy5wcmV2TWF4dGltZSA9IHRoaXMubWF4dGltZTtcblxuICAgICAgaWYgKHRoaXMuc29uZy5wcmVjb3VudGluZykge1xuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmY7XG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyB0aGlzLmJ1ZmZlclRpbWU7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5zb25nQ3VycmVudE1pbGxpcylcbiAgICAgICAgZXZlbnRzID0gdGhpcy5zb25nLl9tZXRyb25vbWUuZ2V0UHJlY291bnRFdmVudHModGhpcy5tYXh0aW1lKTtcblxuICAgICAgICAvLyBpZihldmVudHMubGVuZ3RoID4gMCl7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApXG4gICAgICAgIC8vICAgY29uc29sZS5sb2coZXZlbnRzKVxuICAgICAgICAvLyB9XG5cbiAgICAgICAgaWYgKHRoaXMubWF4dGltZSA+IHRoaXMuc29uZy5fbWV0cm9ub21lLmVuZE1pbGxpcyAmJiB0aGlzLnByZWNvdW50aW5nRG9uZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICB2YXIgX2V2ZW50cztcblxuICAgICAgICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX3ByZWNvdW50RHVyYXRpb247XG5cbiAgICAgICAgICAvLyBzdGFydCBzY2hlZHVsaW5nIGV2ZW50cyBvZiB0aGUgc29uZyAtPiBhZGQgdGhlIGZpcnN0IGV2ZW50cyBvZiB0aGUgc29uZ1xuICAgICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCctLS0tPicsIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMpXG4gICAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyArPSBkaWZmO1xuICAgICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyB0aGlzLmJ1ZmZlclRpbWU7XG4gICAgICAgICAgKF9ldmVudHMgPSBldmVudHMpLnB1c2guYXBwbHkoX2V2ZW50cywgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuZ2V0RXZlbnRzKCkpKTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmY7XG4gICAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIHRoaXMuYnVmZmVyVGltZTtcbiAgICAgICAgICBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpO1xuICAgICAgICAgIC8vZXZlbnRzID0gdGhpcy5zb25nLl9nZXRFdmVudHMyKHRoaXMubWF4dGltZSwgKHRoaXMudGltZVN0YW1wIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpKVxuICAgICAgICAgIC8vZXZlbnRzID0gdGhpcy5nZXRFdmVudHMyKHRoaXMubWF4dGltZSwgKHRoaXMudGltZVN0YW1wIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpKVxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ2RvbmUnLCB0aGlzLnNvbmdDdXJyZW50TWlsbGlzLCBkaWZmLCB0aGlzLmluZGV4LCBldmVudHMubGVuZ3RoKVxuICAgICAgICB9XG5cbiAgICAgIC8vIGlmKHRoaXMuc29uZy51c2VNZXRyb25vbWUgPT09IHRydWUpe1xuICAgICAgLy8gICBsZXQgbWV0cm9ub21lRXZlbnRzID0gdGhpcy5zb25nLl9tZXRyb25vbWUuZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAgIC8vICAgLy8gaWYobWV0cm9ub21lRXZlbnRzLmxlbmd0aCA+IDApe1xuICAgICAgLy8gICAvLyAgIGNvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgbWV0cm9ub21lRXZlbnRzKVxuICAgICAgLy8gICAvLyB9XG4gICAgICAvLyAgIC8vIG1ldHJvbm9tZUV2ZW50cy5mb3JFYWNoKGUgPT4ge1xuICAgICAgLy8gICAvLyAgIGUudGltZSA9ICh0aGlzLnRpbWVTdGFtcCArIGUubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gICAgICAvLyAgIC8vIH0pXG4gICAgICAvLyAgIGV2ZW50cy5wdXNoKC4uLm1ldHJvbm9tZUV2ZW50cylcbiAgICAgIC8vIH1cblxuICAgICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aDtcblxuICAgICAgLy8gaWYobnVtRXZlbnRzID4gNSl7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKG51bUV2ZW50cylcbiAgICAgIC8vIH1cblxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLm1heHRpbWUsIHRoaXMuc29uZy5fY3VycmVudE1pbGxpcywgJ1tkaWZmXScsIHRoaXMubWF4dGltZSAtIHRoaXMucHJldk1heHRpbWUpXG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1FdmVudHM7IGkrKykge1xuICAgICAgICBldmVudCA9IGV2ZW50c1tpXTtcbiAgICAgICAgdHJhY2sgPSBldmVudC5fdHJhY2s7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5wcmV2TWF4dGltZSwgZXZlbnQubWlsbGlzKVxuXG4gICAgICAgIC8vIGlmKGV2ZW50Lm1pbGxpcyA+IHRoaXMubWF4dGltZSl7XG4gICAgICAgIC8vICAgLy8gc2tpcCBldmVudHMgdGhhdCB3ZXJlIGhhcnZlc3QgYWNjaWRlbnRseSB3aGlsZSBqdW1waW5nIHRoZSBwbGF5aGVhZCAtPiBzaG91bGQgaGFwcGVuIHZlcnkgcmFyZWx5IGlmIGV2ZXJcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZygnc2tpcCcsIGV2ZW50KVxuICAgICAgICAvLyAgIGNvbnRpbnVlXG4gICAgICAgIC8vIH1cblxuICAgICAgICBpZiAoZXZlbnQuX3BhcnQgPT09IG51bGwgfHwgdHJhY2sgPT09IG51bGwpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgICAgdGhpcy5ub3Rlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Ll9wYXJ0Lm11dGVkID09PSB0cnVlIHx8IHRyYWNrLm11dGVkID09PSB0cnVlIHx8IGV2ZW50Lm11dGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyB0aGlzIGlzIHVzdWFsbHkgY2F1c2VkIGJ5IHRoZSBzYW1lIG5vdGUgb24gdGhlIHNhbWUgdGlja3MgdmFsdWUsIHdoaWNoIGlzIHByb2JhYmx5IGEgYnVnIGluIHRoZSBtaWRpIGZpbGVcbiAgICAgICAgICAvL2NvbnNvbGUuaW5mbygnbm8gbWlkaU5vdGVJZCcsIGV2ZW50KVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIC9jb25zb2xlLmxvZyhldmVudC50aWNrcywgZXZlbnQudGltZSwgZXZlbnQubWlsbGlzLCBldmVudC50eXBlLCBldmVudC5fdHJhY2submFtZSlcblxuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cmFjay5wcm9jZXNzTUlESUV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAsIGV2ZW50LnRpbWUsIHRoaXMuaW5kZXgpXG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gMTI4KSB7XG4gICAgICAgICAgICAgIHRoaXMubm90ZXMuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYodGhpcy5ub3Rlcy5zaXplID4gMCl7XG4gICAgICAgICAgICAvLyAgIGNvbnNvbGUubG9nKHRoaXMubm90ZXMpXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLmluZGV4LCB0aGlzLm51bUV2ZW50cylcbiAgICAgIC8vcmV0dXJuIHRoaXMuaW5kZXggPj0gMTBcbiAgICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubnVtRXZlbnRzOyAvLyBsYXN0IGV2ZW50IG9mIHNvbmdcbiAgICB9XG5cbiAgICAvKlxuICAgICAgdW5zY2hlZHVsZSgpe1xuICAgIFxuICAgICAgICBsZXQgbWluID0gdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzXG4gICAgICAgIGxldCBtYXggPSBtaW4gKyAoYnVmZmVyVGltZSAqIDEwMDApXG4gICAgXG4gICAgICAgIC8vY29uc29sZS5sb2coJ3Jlc2NoZWR1bGUnLCB0aGlzLm5vdGVzLnNpemUpXG4gICAgICAgIHRoaXMubm90ZXMuZm9yRWFjaCgobm90ZSwgaWQpID0+IHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhub3RlKVxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG5vdGUubm90ZU9uLm1pbGxpcywgbm90ZS5ub3RlT2ZmLm1pbGxpcywgbWluLCBtYXgpXG4gICAgXG4gICAgICAgICAgaWYodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnIHx8IG5vdGUuc3RhdGUgPT09ICdyZW1vdmVkJyl7XG4gICAgICAgICAgICAvL3NhbXBsZS51bnNjaGVkdWxlKDAsIHVuc2NoZWR1bGVDYWxsYmFjayk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdOT1RFIElTIFVOREVGSU5FRCcpXG4gICAgICAgICAgICAvL3NhbXBsZS5zdG9wKDApXG4gICAgICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShpZClcbiAgICAgICAgICB9ZWxzZSBpZigobm90ZS5ub3RlT24ubWlsbGlzID49IG1pbiB8fCBub3RlLm5vdGVPZmYubWlsbGlzIDwgbWF4KSA9PT0gZmFsc2Upe1xuICAgICAgICAgICAgLy9zYW1wbGUuc3RvcCgwKVxuICAgICAgICAgICAgbGV0IG5vdGVPbiA9IG5vdGUubm90ZU9uXG4gICAgICAgICAgICBsZXQgbm90ZU9mZiA9IG5ldyBNSURJRXZlbnQoMCwgMTI4LCBub3RlT24uZGF0YTEsIDApXG4gICAgICAgICAgICBub3RlT2ZmLm1pZGlOb3RlSWQgPSBub3RlLmlkXG4gICAgICAgICAgICBub3RlT2ZmLnRpbWUgPSAwLy9jb250ZXh0LmN1cnJlbnRUaW1lICsgbWluXG4gICAgICAgICAgICBub3RlLl90cmFjay5wcm9jZXNzTUlESUV2ZW50KG5vdGVPZmYpXG4gICAgICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShpZClcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTVE9QUElORycsIGlkLCBub3RlLl90cmFjay5uYW1lKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLy9jb25zb2xlLmxvZygnTk9URVMnLCB0aGlzLm5vdGVzLnNpemUpXG4gICAgICAgIC8vdGhpcy5ub3Rlcy5jbGVhcigpXG4gICAgICB9XG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnYWxsTm90ZXNPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhbGxOb3Rlc09mZigpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciB0aW1lU3RhbXAgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIHZhciBvdXRwdXRzID0gKDAsIF9pbml0X21pZGkuZ2V0TUlESU91dHB1dHMpKCk7XG4gICAgICBvdXRwdXRzLmZvckVhY2goZnVuY3Rpb24gKG91dHB1dCkge1xuICAgICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWVTdGFtcCArIF90aGlzLmJ1ZmZlclRpbWUpOyAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWVTdGFtcCArIF90aGlzLmJ1ZmZlclRpbWUpOyAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTY2hlZHVsZXI7XG59KCk7XG5cbi8qXG5cbiAgZ2V0RXZlbnRzMihtYXh0aW1lLCB0aW1lc3RhbXApe1xuICAgIGxldCBsb29wID0gdHJ1ZVxuICAgIGxldCBldmVudFxuICAgIGxldCByZXN1bHQgPSBbXVxuICAgIC8vY29uc29sZS5sb2codGhpcy50aW1lRXZlbnRzSW5kZXgsIHRoaXMuc29uZ0V2ZW50c0luZGV4LCB0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4KVxuICAgIHdoaWxlKGxvb3Ape1xuXG4gICAgICBsZXQgc3RvcCA9IGZhbHNlXG5cbiAgICAgIGlmKHRoaXMudGltZUV2ZW50c0luZGV4IDwgdGhpcy5udW1UaW1lRXZlbnRzKXtcbiAgICAgICAgZXZlbnQgPSB0aGlzLnRpbWVFdmVudHNbdGhpcy50aW1lRXZlbnRzSW5kZXhdXG4gICAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIHRoaXMubWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2tcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMubWlsbGlzUGVyVGljaylcbiAgICAgICAgICB0aGlzLnRpbWVFdmVudHNJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN0b3AgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYodGhpcy5zb25nRXZlbnRzSW5kZXggPCB0aGlzLm51bVNvbmdFdmVudHMpe1xuICAgICAgICBldmVudCA9IHRoaXMuc29uZ0V2ZW50c1t0aGlzLnNvbmdFdmVudHNJbmRleF1cbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMHgyRil7XG4gICAgICAgICAgbG9vcCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbWlsbGlzID0gZXZlbnQudGlja3MgKiB0aGlzLm1pbGxpc1BlclRpY2tcbiAgICAgICAgaWYobWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgZXZlbnQudGltZSA9IG1pbGxpcyArIHRpbWVzdGFtcFxuICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgICAgICAgIHRoaXMuc29uZ0V2ZW50c0luZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3RvcCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZih0aGlzLnNvbmcudXNlTWV0cm9ub21lID09PSB0cnVlICYmIHRoaXMubWV0cm9ub21lRXZlbnRzSW5kZXggPCB0aGlzLm51bU1ldHJvbm9tZUV2ZW50cyl7XG4gICAgICAgIGV2ZW50ID0gdGhpcy5tZXRyb25vbWVFdmVudHNbdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleF1cbiAgICAgICAgbGV0IG1pbGxpcyA9IGV2ZW50LnRpY2tzICogdGhpcy5taWxsaXNQZXJUaWNrXG4gICAgICAgIGlmKG1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIGV2ZW50LnRpbWUgPSBtaWxsaXMgKyB0aW1lc3RhbXBcbiAgICAgICAgICBldmVudC5taWxsaXMgPSBtaWxsaXNcbiAgICAgICAgICByZXN1bHQucHVzaChldmVudClcbiAgICAgICAgICB0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3RvcCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihzdG9wKXtcbiAgICAgICAgbG9vcCA9IGZhbHNlXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIHNvcnRFdmVudHMocmVzdWx0KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG5cbiovXG5cblxuZXhwb3J0cy5kZWZhdWx0ID0gU2NoZWR1bGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZXhwb3J0cy51cGRhdGVTZXR0aW5ncyA9IHVwZGF0ZVNldHRpbmdzO1xuZXhwb3J0cy5nZXRTZXR0aW5ncyA9IGdldFNldHRpbmdzO1xuLy9pbXBvcnQgZ21JbnN0cnVtZW50cyBmcm9tICcuL2dtX2luc3RydW1lbnRzJ1xuXG4vL2NvbnN0IHBhcmFtcyA9IFsncHBxJywgJ2JwbScsICdiYXJzJywgJ3BpdGNoJywgJ2J1ZmZlclRpbWUnLCAnbG93ZXN0Tm90ZScsICdoaWdoZXN0Tm90ZScsICdub3RlTmFtZU1vZGUnLCAnbm9taW5hdG9yJywgJ2Rlbm9taW5hdG9yJywgJ3F1YW50aXplVmFsdWUnLCAnZml4ZWRMZW5ndGhWYWx1ZScsICdwb3NpdGlvblR5cGUnLCAndXNlTWV0cm9ub21lJywgJ2F1dG9TaXplJywgJ3BsYXliYWNrU3BlZWQnLCAnYXV0b1F1YW50aXplJywgXVxuXG52YXIgc2V0dGluZ3MgPSB7XG4gIHBwcTogOTYwLFxuICBicG06IDEyMCxcbiAgYmFyczogMTYsXG4gIHBpdGNoOiA0NDAsXG4gIGJ1ZmZlclRpbWU6IDIwMCxcbiAgbG93ZXN0Tm90ZTogMCxcbiAgaGlnaGVzdE5vdGU6IDEyNyxcbiAgbm90ZU5hbWVNb2RlOiAnc2hhcnAnLFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIHBsYXliYWNrU3BlZWQ6IDEsXG4gIGF1dG9RdWFudGl6ZTogZmFsc2UsXG4gIHZvbHVtZTogMC41XG59O1xuXG5mdW5jdGlvbiB1cGRhdGVTZXR0aW5ncyhkYXRhKSB7XG4gIHZhciBfZGF0YSRwcHEgPSBkYXRhLnBwcTtcbiAgc2V0dGluZ3MucHBxID0gX2RhdGEkcHBxID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5wcHEgOiBfZGF0YSRwcHE7XG4gIHZhciBfZGF0YSRicG0gPSBkYXRhLmJwbTtcbiAgc2V0dGluZ3MuYnBtID0gX2RhdGEkYnBtID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5icG0gOiBfZGF0YSRicG07XG4gIHZhciBfZGF0YSRiYXJzID0gZGF0YS5iYXJzO1xuICBzZXR0aW5ncy5iYXJzID0gX2RhdGEkYmFycyA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MuYmFycyA6IF9kYXRhJGJhcnM7XG4gIHZhciBfZGF0YSRwaXRjaCA9IGRhdGEucGl0Y2g7XG4gIHNldHRpbmdzLnBpdGNoID0gX2RhdGEkcGl0Y2ggPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLnBpdGNoIDogX2RhdGEkcGl0Y2g7XG4gIHZhciBfZGF0YSRidWZmZXJUaW1lID0gZGF0YS5idWZmZXJUaW1lO1xuICBzZXR0aW5ncy5idWZmZXJUaW1lID0gX2RhdGEkYnVmZmVyVGltZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MuYnVmZmVyVGltZSA6IF9kYXRhJGJ1ZmZlclRpbWU7XG4gIHZhciBfZGF0YSRsb3dlc3ROb3RlID0gZGF0YS5sb3dlc3ROb3RlO1xuICBzZXR0aW5ncy5sb3dlc3ROb3RlID0gX2RhdGEkbG93ZXN0Tm90ZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MubG93ZXN0Tm90ZSA6IF9kYXRhJGxvd2VzdE5vdGU7XG4gIHZhciBfZGF0YSRoaWdoZXN0Tm90ZSA9IGRhdGEuaGlnaGVzdE5vdGU7XG4gIHNldHRpbmdzLmhpZ2hlc3ROb3RlID0gX2RhdGEkaGlnaGVzdE5vdGUgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmhpZ2hlc3ROb3RlIDogX2RhdGEkaGlnaGVzdE5vdGU7XG4gIHZhciBfZGF0YSRub3RlTmFtZU1vZGUgPSBkYXRhLm5vdGVOYW1lTW9kZTtcbiAgc2V0dGluZ3Mubm90ZU5hbWVNb2RlID0gX2RhdGEkbm90ZU5hbWVNb2RlID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5ub3RlTmFtZU1vZGUgOiBfZGF0YSRub3RlTmFtZU1vZGU7XG4gIHZhciBfZGF0YSRub21pbmF0b3IgPSBkYXRhLm5vbWluYXRvcjtcbiAgc2V0dGluZ3Mubm9taW5hdG9yID0gX2RhdGEkbm9taW5hdG9yID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5ub21pbmF0b3IgOiBfZGF0YSRub21pbmF0b3I7XG4gIHZhciBfZGF0YSRkZW5vbWluYXRvciA9IGRhdGEuZGVub21pbmF0b3I7XG4gIHNldHRpbmdzLmRlbm9taW5hdG9yID0gX2RhdGEkZGVub21pbmF0b3IgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmRlbm9taW5hdG9yIDogX2RhdGEkZGVub21pbmF0b3I7XG4gIHZhciBfZGF0YSRxdWFudGl6ZVZhbHVlID0gZGF0YS5xdWFudGl6ZVZhbHVlO1xuICBzZXR0aW5ncy5xdWFudGl6ZVZhbHVlID0gX2RhdGEkcXVhbnRpemVWYWx1ZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MucXVhbnRpemVWYWx1ZSA6IF9kYXRhJHF1YW50aXplVmFsdWU7XG4gIHZhciBfZGF0YSRmaXhlZExlbmd0aFZhbHUgPSBkYXRhLmZpeGVkTGVuZ3RoVmFsdWU7XG4gIHNldHRpbmdzLmZpeGVkTGVuZ3RoVmFsdWUgPSBfZGF0YSRmaXhlZExlbmd0aFZhbHUgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmZpeGVkTGVuZ3RoVmFsdWUgOiBfZGF0YSRmaXhlZExlbmd0aFZhbHU7XG4gIHZhciBfZGF0YSRwb3NpdGlvblR5cGUgPSBkYXRhLnBvc2l0aW9uVHlwZTtcbiAgc2V0dGluZ3MucG9zaXRpb25UeXBlID0gX2RhdGEkcG9zaXRpb25UeXBlID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5wb3NpdGlvblR5cGUgOiBfZGF0YSRwb3NpdGlvblR5cGU7XG4gIHZhciBfZGF0YSR1c2VNZXRyb25vbWUgPSBkYXRhLnVzZU1ldHJvbm9tZTtcbiAgc2V0dGluZ3MudXNlTWV0cm9ub21lID0gX2RhdGEkdXNlTWV0cm9ub21lID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy51c2VNZXRyb25vbWUgOiBfZGF0YSR1c2VNZXRyb25vbWU7XG4gIHZhciBfZGF0YSRhdXRvU2l6ZSA9IGRhdGEuYXV0b1NpemU7XG4gIHNldHRpbmdzLmF1dG9TaXplID0gX2RhdGEkYXV0b1NpemUgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmF1dG9TaXplIDogX2RhdGEkYXV0b1NpemU7XG4gIHZhciBfZGF0YSRwbGF5YmFja1NwZWVkID0gZGF0YS5wbGF5YmFja1NwZWVkO1xuICBzZXR0aW5ncy5wbGF5YmFja1NwZWVkID0gX2RhdGEkcGxheWJhY2tTcGVlZCA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MucGxheWJhY2tTcGVlZCA6IF9kYXRhJHBsYXliYWNrU3BlZWQ7XG4gIHZhciBfZGF0YSRhdXRvUXVhbnRpemUgPSBkYXRhLmF1dG9RdWFudGl6ZTtcbiAgc2V0dGluZ3MuYXV0b1F1YW50aXplID0gX2RhdGEkYXV0b1F1YW50aXplID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5hdXRvUXVhbnRpemUgOiBfZGF0YSRhdXRvUXVhbnRpemU7XG4gIHZhciBfZGF0YSR2b2x1bWUgPSBkYXRhLnZvbHVtZTtcbiAgc2V0dGluZ3Mudm9sdW1lID0gX2RhdGEkdm9sdW1lID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy52b2x1bWUgOiBfZGF0YSR2b2x1bWU7XG5cblxuICBjb25zb2xlLmxvZygnc2V0dGluZ3M6ICVPJywgc2V0dGluZ3MpO1xufVxuXG5mdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcbiAgcmV0dXJuIF9leHRlbmRzKHt9LCBzZXR0aW5ncyk7XG4gIC8qXG4gICAgbGV0IHJlc3VsdCA9IHt9XG4gICAgcGFyYW1zLmZvckVhY2gocGFyYW0gPT4ge1xuICAgICAgc3dpdGNoKHBhcmFtKXtcbiAgICAgICAgY2FzZSAncGl0Y2gnOlxuICAgICAgICAgIHJlc3VsdC5waXRjaCA9IHBpdGNoXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnbm90ZU5hbWVNb2RlJzpcbiAgICAgICAgICByZXN1bHQubm90ZU5hbWVNb2RlID0gbm90ZU5hbWVNb2RlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnYnVmZmVyVGltZSc6XG4gICAgICAgICAgcmVzdWx0LmJ1ZmZlclRpbWUgPSBidWZmZXJUaW1lXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAncHBxJzpcbiAgICAgICAgICByZXN1bHQucHBxID0gcHBxXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gICovXG59XG5cbi8vcG9ydGVkIGhlYXJ0YmVhdCBpbnN0cnVtZW50czogaHR0cDovL2dpdGh1Yi5jb20vYWJ1ZGFhbi9oZWFydGJlYXRcbnZhciBoZWFydGJlYXRJbnN0cnVtZW50cyA9IG5ldyBNYXAoW1snY2l0eS1waWFubycsIHtcbiAgbmFtZTogJ0NpdHkgUGlhbm8gKHBpYW5vKScsXG4gIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyA0IHZlbG9jaXR5IGxheWVyczogMSAtIDQ4LCA0OSAtIDk2LCA5NyAtIDExMCBhbmQgMTEwIC0gMTI3LiBJbiB0b3RhbCBpdCB1c2VzIDQgKiA4OCA9IDM1MiBzYW1wbGVzJ1xufV0sIFsnY2l0eS1waWFuby1saWdodCcsIHtcbiAgbmFtZTogJ0NpdHkgUGlhbm8gTGlnaHQgKHBpYW5vKScsXG4gIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyBsaWdodCB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyBvbmx5IDEgdmVsb2NpdHkgbGF5ZXIgYW5kIHVzZXMgODggc2FtcGxlcydcbn1dLCBbJ2NrLWljZXNrYXRlcycsIHtcbiAgbmFtZTogJ0NLIEljZSBTa2F0ZXMgKHN5bnRoKScsXG4gIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcydcbn1dLCBbJ3NoazItc3F1YXJlcm9vdCcsIHtcbiAgbmFtZTogJ1NISzIgc3F1YXJlcm9vdCAoc3ludGgpJyxcbiAgZGVzY3JpcHRpb246ICd1c2VzIERldHVuaXplZCBzYW1wbGVzJ1xufV0sIFsncmhvZGVzJywge1xuICBuYW1lOiAnUmhvZGVzIChwaWFubyknLFxuICBkZXNjcmlwdGlvbjogJ3VzZXMgRnJlZXNvdW5kIHNhbXBsZXMnXG59XSwgWydyaG9kZXMyJywge1xuICBuYW1lOiAnUmhvZGVzIDIgKHBpYW5vKScsXG4gIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcydcbn1dLCBbJ3RydW1wZXQnLCB7XG4gIG5hbWU6ICdUcnVtcGV0IChicmFzcyknLFxuICBkZXNjcmlwdGlvbjogJ3VzZXMgU1NPIHNhbXBsZXMnXG59XSwgWyd2aW9saW4nLCB7XG4gIG5hbWU6ICdWaW9saW4gKHN0cmluZ3MpJyxcbiAgZGVzY3JpcHRpb246ICd1c2VzIFNTTyBzYW1wbGVzJ1xufV1dKTtcbnZhciBnZXRJbnN0cnVtZW50cyA9IGV4cG9ydHMuZ2V0SW5zdHJ1bWVudHMgPSBmdW5jdGlvbiBnZXRJbnN0cnVtZW50cygpIHtcbiAgcmV0dXJuIGhlYXJ0YmVhdEluc3RydW1lbnRzO1xufTtcblxuLy8gZ20gc291bmRzIGV4cG9ydGVkIGZyb20gRmx1aWRTeW50aCBieSBCZW5qYW1pbiBHbGVpdHptYW46IGh0dHBzOi8vZ2l0aHViLmNvbS9nbGVpdHovbWlkaS1qcy1zb3VuZGZvbnRzXG52YXIgZ21JbnN0cnVtZW50cyA9IHsgXCJhY291c3RpY19ncmFuZF9waWFub1wiOiB7IFwibmFtZVwiOiBcIjEgQWNvdXN0aWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJicmlnaHRfYWNvdXN0aWNfcGlhbm9cIjogeyBcIm5hbWVcIjogXCIyIEJyaWdodCBBY291c3RpYyBQaWFubyAocGlhbm8pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImVsZWN0cmljX2dyYW5kX3BpYW5vXCI6IHsgXCJuYW1lXCI6IFwiMyBFbGVjdHJpYyBHcmFuZCBQaWFubyAocGlhbm8pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImhvbmt5dG9ua19waWFub1wiOiB7IFwibmFtZVwiOiBcIjQgSG9ua3ktdG9uayBQaWFubyAocGlhbm8pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImVsZWN0cmljX3BpYW5vXzFcIjogeyBcIm5hbWVcIjogXCI1IEVsZWN0cmljIFBpYW5vIDEgKHBpYW5vKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJlbGVjdHJpY19waWFub18yXCI6IHsgXCJuYW1lXCI6IFwiNiBFbGVjdHJpYyBQaWFubyAyIChwaWFubylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiaGFycHNpY2hvcmRcIjogeyBcIm5hbWVcIjogXCI3IEhhcnBzaWNob3JkIChwaWFubylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY2xhdmluZXRcIjogeyBcIm5hbWVcIjogXCI4IENsYXZpbmV0IChwaWFubylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY2VsZXN0YVwiOiB7IFwibmFtZVwiOiBcIjkgQ2VsZXN0YSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZ2xvY2tlbnNwaWVsXCI6IHsgXCJuYW1lXCI6IFwiMTAgR2xvY2tlbnNwaWVsIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJtdXNpY19ib3hcIjogeyBcIm5hbWVcIjogXCIxMSBNdXNpYyBCb3ggKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInZpYnJhcGhvbmVcIjogeyBcIm5hbWVcIjogXCIxMiBWaWJyYXBob25lIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJtYXJpbWJhXCI6IHsgXCJuYW1lXCI6IFwiMTMgTWFyaW1iYSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwieHlsb3Bob25lXCI6IHsgXCJuYW1lXCI6IFwiMTQgWHlsb3Bob25lIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0dWJ1bGFyX2JlbGxzXCI6IHsgXCJuYW1lXCI6IFwiMTUgVHVidWxhciBCZWxscyAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZHVsY2ltZXJcIjogeyBcIm5hbWVcIjogXCIxNiBEdWxjaW1lciAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZHJhd2Jhcl9vcmdhblwiOiB7IFwibmFtZVwiOiBcIjE3IERyYXdiYXIgT3JnYW4gKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwZXJjdXNzaXZlX29yZ2FuXCI6IHsgXCJuYW1lXCI6IFwiMTggUGVyY3Vzc2l2ZSBPcmdhbiAob3JnYW4pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInJvY2tfb3JnYW5cIjogeyBcIm5hbWVcIjogXCIxOSBSb2NrIE9yZ2FuIChvcmdhbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY2h1cmNoX29yZ2FuXCI6IHsgXCJuYW1lXCI6IFwiMjAgQ2h1cmNoIE9yZ2FuIChvcmdhbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicmVlZF9vcmdhblwiOiB7IFwibmFtZVwiOiBcIjIxIFJlZWQgT3JnYW4gKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhY2NvcmRpb25cIjogeyBcIm5hbWVcIjogXCIyMiBBY2NvcmRpb24gKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJoYXJtb25pY2FcIjogeyBcIm5hbWVcIjogXCIyMyBIYXJtb25pY2EgKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0YW5nb19hY2NvcmRpb25cIjogeyBcIm5hbWVcIjogXCIyNCBUYW5nbyBBY2NvcmRpb24gKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhY291c3RpY19ndWl0YXJfbnlsb25cIjogeyBcIm5hbWVcIjogXCIyNSBBY291c3RpYyBHdWl0YXIgKG55bG9uKSAoZ3VpdGFyKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhY291c3RpY19ndWl0YXJfc3RlZWxcIjogeyBcIm5hbWVcIjogXCIyNiBBY291c3RpYyBHdWl0YXIgKHN0ZWVsKSAoZ3VpdGFyKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJlbGVjdHJpY19ndWl0YXJfamF6elwiOiB7IFwibmFtZVwiOiBcIjI3IEVsZWN0cmljIEd1aXRhciAoamF6eikgKGd1aXRhcilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZWxlY3RyaWNfZ3VpdGFyX2NsZWFuXCI6IHsgXCJuYW1lXCI6IFwiMjggRWxlY3RyaWMgR3VpdGFyIChjbGVhbikgKGd1aXRhcilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZWxlY3RyaWNfZ3VpdGFyX211dGVkXCI6IHsgXCJuYW1lXCI6IFwiMjkgRWxlY3RyaWMgR3VpdGFyIChtdXRlZCkgKGd1aXRhcilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwib3ZlcmRyaXZlbl9ndWl0YXJcIjogeyBcIm5hbWVcIjogXCIzMCBPdmVyZHJpdmVuIEd1aXRhciAoZ3VpdGFyKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJkaXN0b3J0aW9uX2d1aXRhclwiOiB7IFwibmFtZVwiOiBcIjMxIERpc3RvcnRpb24gR3VpdGFyIChndWl0YXIpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImd1aXRhcl9oYXJtb25pY3NcIjogeyBcIm5hbWVcIjogXCIzMiBHdWl0YXIgSGFybW9uaWNzIChndWl0YXIpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImFjb3VzdGljX2Jhc3NcIjogeyBcIm5hbWVcIjogXCIzMyBBY291c3RpYyBCYXNzIChiYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJlbGVjdHJpY19iYXNzX2ZpbmdlclwiOiB7IFwibmFtZVwiOiBcIjM0IEVsZWN0cmljIEJhc3MgKGZpbmdlcikgKGJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImVsZWN0cmljX2Jhc3NfcGlja1wiOiB7IFwibmFtZVwiOiBcIjM1IEVsZWN0cmljIEJhc3MgKHBpY2spIChiYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJmcmV0bGVzc19iYXNzXCI6IHsgXCJuYW1lXCI6IFwiMzYgRnJldGxlc3MgQmFzcyAoYmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2xhcF9iYXNzXzFcIjogeyBcIm5hbWVcIjogXCIzNyBTbGFwIEJhc3MgMSAoYmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2xhcF9iYXNzXzJcIjogeyBcIm5hbWVcIjogXCIzOCBTbGFwIEJhc3MgMiAoYmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3ludGhfYmFzc18xXCI6IHsgXCJuYW1lXCI6IFwiMzkgU3ludGggQmFzcyAxIChiYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzeW50aF9iYXNzXzJcIjogeyBcIm5hbWVcIjogXCI0MCBTeW50aCBCYXNzIDIgKGJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInZpb2xpblwiOiB7IFwibmFtZVwiOiBcIjQxIFZpb2xpbiAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidmlvbGFcIjogeyBcIm5hbWVcIjogXCI0MiBWaW9sYSAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY2VsbG9cIjogeyBcIm5hbWVcIjogXCI0MyBDZWxsbyAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY29udHJhYmFzc1wiOiB7IFwibmFtZVwiOiBcIjQ0IENvbnRyYWJhc3MgKHN0cmluZ3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInRyZW1vbG9fc3RyaW5nc1wiOiB7IFwibmFtZVwiOiBcIjQ1IFRyZW1vbG8gU3RyaW5ncyAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGl6emljYXRvX3N0cmluZ3NcIjogeyBcIm5hbWVcIjogXCI0NiBQaXp6aWNhdG8gU3RyaW5ncyAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwib3JjaGVzdHJhbF9oYXJwXCI6IHsgXCJuYW1lXCI6IFwiNDcgT3JjaGVzdHJhbCBIYXJwIChzdHJpbmdzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0aW1wYW5pXCI6IHsgXCJuYW1lXCI6IFwiNDggVGltcGFuaSAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3RyaW5nX2Vuc2VtYmxlXzFcIjogeyBcIm5hbWVcIjogXCI0OSBTdHJpbmcgRW5zZW1ibGUgMSAoZW5zZW1ibGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN0cmluZ19lbnNlbWJsZV8yXCI6IHsgXCJuYW1lXCI6IFwiNTAgU3RyaW5nIEVuc2VtYmxlIDIgKGVuc2VtYmxlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzeW50aF9zdHJpbmdzXzFcIjogeyBcIm5hbWVcIjogXCI1MSBTeW50aCBTdHJpbmdzIDEgKGVuc2VtYmxlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzeW50aF9zdHJpbmdzXzJcIjogeyBcIm5hbWVcIjogXCI1MiBTeW50aCBTdHJpbmdzIDIgKGVuc2VtYmxlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJjaG9pcl9hYWhzXCI6IHsgXCJuYW1lXCI6IFwiNTMgQ2hvaXIgQWFocyAoZW5zZW1ibGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInZvaWNlX29vaHNcIjogeyBcIm5hbWVcIjogXCI1NCBWb2ljZSBPb2hzIChlbnNlbWJsZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3ludGhfY2hvaXJcIjogeyBcIm5hbWVcIjogXCI1NSBTeW50aCBDaG9pciAoZW5zZW1ibGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcIm9yY2hlc3RyYV9oaXRcIjogeyBcIm5hbWVcIjogXCI1NiBPcmNoZXN0cmEgSGl0IChlbnNlbWJsZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidHJ1bXBldFwiOiB7IFwibmFtZVwiOiBcIjU3IFRydW1wZXQgKGJyYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0cm9tYm9uZVwiOiB7IFwibmFtZVwiOiBcIjU4IFRyb21ib25lIChicmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidHViYVwiOiB7IFwibmFtZVwiOiBcIjU5IFR1YmEgKGJyYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJtdXRlZF90cnVtcGV0XCI6IHsgXCJuYW1lXCI6IFwiNjAgTXV0ZWQgVHJ1bXBldCAoYnJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImZyZW5jaF9ob3JuXCI6IHsgXCJuYW1lXCI6IFwiNjEgRnJlbmNoIEhvcm4gKGJyYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJicmFzc19zZWN0aW9uXCI6IHsgXCJuYW1lXCI6IFwiNjIgQnJhc3MgU2VjdGlvbiAoYnJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN5bnRoX2JyYXNzXzFcIjogeyBcIm5hbWVcIjogXCI2MyBTeW50aCBCcmFzcyAxIChicmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3ludGhfYnJhc3NfMlwiOiB7IFwibmFtZVwiOiBcIjY0IFN5bnRoIEJyYXNzIDIgKGJyYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzb3ByYW5vX3NheFwiOiB7IFwibmFtZVwiOiBcIjY1IFNvcHJhbm8gU2F4IChyZWVkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhbHRvX3NheFwiOiB7IFwibmFtZVwiOiBcIjY2IEFsdG8gU2F4IChyZWVkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0ZW5vcl9zYXhcIjogeyBcIm5hbWVcIjogXCI2NyBUZW5vciBTYXggKHJlZWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImJhcml0b25lX3NheFwiOiB7IFwibmFtZVwiOiBcIjY4IEJhcml0b25lIFNheCAocmVlZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwib2JvZVwiOiB7IFwibmFtZVwiOiBcIjY5IE9ib2UgKHJlZWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImVuZ2xpc2hfaG9yblwiOiB7IFwibmFtZVwiOiBcIjcwIEVuZ2xpc2ggSG9ybiAocmVlZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYmFzc29vblwiOiB7IFwibmFtZVwiOiBcIjcxIEJhc3Nvb24gKHJlZWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImNsYXJpbmV0XCI6IHsgXCJuYW1lXCI6IFwiNzIgQ2xhcmluZXQgKHJlZWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInBpY2NvbG9cIjogeyBcIm5hbWVcIjogXCI3MyBQaWNjb2xvIChwaXBlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJmbHV0ZVwiOiB7IFwibmFtZVwiOiBcIjc0IEZsdXRlIChwaXBlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJyZWNvcmRlclwiOiB7IFwibmFtZVwiOiBcIjc1IFJlY29yZGVyIChwaXBlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYW5fZmx1dGVcIjogeyBcIm5hbWVcIjogXCI3NiBQYW4gRmx1dGUgKHBpcGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImJsb3duX2JvdHRsZVwiOiB7IFwibmFtZVwiOiBcIjc3IEJsb3duIEJvdHRsZSAocGlwZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2hha3VoYWNoaVwiOiB7IFwibmFtZVwiOiBcIjc4IFNoYWt1aGFjaGkgKHBpcGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcIndoaXN0bGVcIjogeyBcIm5hbWVcIjogXCI3OSBXaGlzdGxlIChwaXBlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJvY2FyaW5hXCI6IHsgXCJuYW1lXCI6IFwiODAgT2NhcmluYSAocGlwZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF8xX3NxdWFyZVwiOiB7IFwibmFtZVwiOiBcIjgxIExlYWQgMSAoc3F1YXJlKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJsZWFkXzJfc2F3dG9vdGhcIjogeyBcIm5hbWVcIjogXCI4MiBMZWFkIDIgKHNhd3Rvb3RoKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJsZWFkXzNfY2FsbGlvcGVcIjogeyBcIm5hbWVcIjogXCI4MyBMZWFkIDMgKGNhbGxpb3BlKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJsZWFkXzRfY2hpZmZcIjogeyBcIm5hbWVcIjogXCI4NCBMZWFkIDQgKGNoaWZmKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJsZWFkXzVfY2hhcmFuZ1wiOiB7IFwibmFtZVwiOiBcIjg1IExlYWQgNSAoY2hhcmFuZykgKHN5bnRobGVhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF82X3ZvaWNlXCI6IHsgXCJuYW1lXCI6IFwiODYgTGVhZCA2ICh2b2ljZSkgKHN5bnRobGVhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF83X2ZpZnRoc1wiOiB7IFwibmFtZVwiOiBcIjg3IExlYWQgNyAoZmlmdGhzKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJsZWFkXzhfYmFzc19fbGVhZFwiOiB7IFwibmFtZVwiOiBcIjg4IExlYWQgOCAoYmFzcyArIGxlYWQpIChzeW50aGxlYWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInBhZF8xX25ld19hZ2VcIjogeyBcIm5hbWVcIjogXCI4OSBQYWQgMSAobmV3IGFnZSkgKHN5bnRocGFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfMl93YXJtXCI6IHsgXCJuYW1lXCI6IFwiOTAgUGFkIDIgKHdhcm0pIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGFkXzNfcG9seXN5bnRoXCI6IHsgXCJuYW1lXCI6IFwiOTEgUGFkIDMgKHBvbHlzeW50aCkgKHN5bnRocGFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfNF9jaG9pclwiOiB7IFwibmFtZVwiOiBcIjkyIFBhZCA0IChjaG9pcikgKHN5bnRocGFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfNV9ib3dlZFwiOiB7IFwibmFtZVwiOiBcIjkzIFBhZCA1IChib3dlZCkgKHN5bnRocGFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfNl9tZXRhbGxpY1wiOiB7IFwibmFtZVwiOiBcIjk0IFBhZCA2IChtZXRhbGxpYykgKHN5bnRocGFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfN19oYWxvXCI6IHsgXCJuYW1lXCI6IFwiOTUgUGFkIDcgKGhhbG8pIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGFkXzhfc3dlZXBcIjogeyBcIm5hbWVcIjogXCI5NiBQYWQgOCAoc3dlZXApIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfMV9yYWluXCI6IHsgXCJuYW1lXCI6IFwiOTcgRlggMSAocmFpbikgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfMl9zb3VuZHRyYWNrXCI6IHsgXCJuYW1lXCI6IFwiOTggRlggMiAoc291bmR0cmFjaykgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfM19jcnlzdGFsXCI6IHsgXCJuYW1lXCI6IFwiOTkgRlggMyAoY3J5c3RhbCkgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfNF9hdG1vc3BoZXJlXCI6IHsgXCJuYW1lXCI6IFwiMTAwIEZYIDQgKGF0bW9zcGhlcmUpIChzeW50aGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImZ4XzVfYnJpZ2h0bmVzc1wiOiB7IFwibmFtZVwiOiBcIjEwMSBGWCA1IChicmlnaHRuZXNzKSAoc3ludGhlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJmeF82X2dvYmxpbnNcIjogeyBcIm5hbWVcIjogXCIxMDIgRlggNiAoZ29ibGlucykgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfN19lY2hvZXNcIjogeyBcIm5hbWVcIjogXCIxMDMgRlggNyAoZWNob2VzKSAoc3ludGhlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJmeF84X3NjaWZpXCI6IHsgXCJuYW1lXCI6IFwiMTA0IEZYIDggKHNjaS1maSkgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2l0YXJcIjogeyBcIm5hbWVcIjogXCIxMDUgU2l0YXIgKGV0aG5pYylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYmFuam9cIjogeyBcIm5hbWVcIjogXCIxMDYgQmFuam8gKGV0aG5pYylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2hhbWlzZW5cIjogeyBcIm5hbWVcIjogXCIxMDcgU2hhbWlzZW4gKGV0aG5pYylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwia290b1wiOiB7IFwibmFtZVwiOiBcIjEwOCBLb3RvIChldGhuaWMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImthbGltYmFcIjogeyBcIm5hbWVcIjogXCIxMDkgS2FsaW1iYSAoZXRobmljKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJiYWdwaXBlXCI6IHsgXCJuYW1lXCI6IFwiMTEwIEJhZ3BpcGUgKGV0aG5pYylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZmlkZGxlXCI6IHsgXCJuYW1lXCI6IFwiMTExIEZpZGRsZSAoZXRobmljKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzaGFuYWlcIjogeyBcIm5hbWVcIjogXCIxMTIgU2hhbmFpIChldGhuaWMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInRpbmtsZV9iZWxsXCI6IHsgXCJuYW1lXCI6IFwiMTEzIFRpbmtsZSBCZWxsIChwZXJjdXNzaXZlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhZ29nb1wiOiB7IFwibmFtZVwiOiBcIjExNCBBZ29nbyAocGVyY3Vzc2l2ZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3RlZWxfZHJ1bXNcIjogeyBcIm5hbWVcIjogXCIxMTUgU3RlZWwgRHJ1bXMgKHBlcmN1c3NpdmUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcIndvb2RibG9ja1wiOiB7IFwibmFtZVwiOiBcIjExNiBXb29kYmxvY2sgKHBlcmN1c3NpdmUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInRhaWtvX2RydW1cIjogeyBcIm5hbWVcIjogXCIxMTcgVGFpa28gRHJ1bSAocGVyY3Vzc2l2ZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibWVsb2RpY190b21cIjogeyBcIm5hbWVcIjogXCIxMTggTWVsb2RpYyBUb20gKHBlcmN1c3NpdmUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN5bnRoX2RydW1cIjogeyBcIm5hbWVcIjogXCIxMTkgU3ludGggRHJ1bSAocGVyY3Vzc2l2ZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicmV2ZXJzZV9jeW1iYWxcIjogeyBcIm5hbWVcIjogXCIxMjAgUmV2ZXJzZSBDeW1iYWwgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZ3VpdGFyX2ZyZXRfbm9pc2VcIjogeyBcIm5hbWVcIjogXCIxMjEgR3VpdGFyIEZyZXQgTm9pc2UgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYnJlYXRoX25vaXNlXCI6IHsgXCJuYW1lXCI6IFwiMTIyIEJyZWF0aCBOb2lzZSAoc291bmRlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzZWFzaG9yZVwiOiB7IFwibmFtZVwiOiBcIjEyMyBTZWFzaG9yZSAoc291bmRlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJiaXJkX3R3ZWV0XCI6IHsgXCJuYW1lXCI6IFwiMTI0IEJpcmQgVHdlZXQgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidGVsZXBob25lX3JpbmdcIjogeyBcIm5hbWVcIjogXCIxMjUgVGVsZXBob25lIFJpbmcgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiaGVsaWNvcHRlclwiOiB7IFwibmFtZVwiOiBcIjEyNiBIZWxpY29wdGVyIChzb3VuZGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImFwcGxhdXNlXCI6IHsgXCJuYW1lXCI6IFwiMTI3IEFwcGxhdXNlIChzb3VuZGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImd1bnNob3RcIjogeyBcIm5hbWVcIjogXCIxMjggR3Vuc2hvdCAoc291bmRlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSB9O1xudmFyIGdtTWFwID0gbmV3IE1hcCgpO1xuT2JqZWN0LmtleXMoZ21JbnN0cnVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGdtTWFwLnNldChrZXksIGdtSW5zdHJ1bWVudHNba2V5XSk7XG59KTtcbnZhciBnZXRHTUluc3RydW1lbnRzID0gZXhwb3J0cy5nZXRHTUluc3RydW1lbnRzID0gZnVuY3Rpb24gZ2V0R01JbnN0cnVtZW50cygpIHtcbiAgcmV0dXJuIGdtTWFwO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlNpbXBsZVN5bnRoID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX2luc3RydW1lbnQgPSByZXF1aXJlKCcuL2luc3RydW1lbnQnKTtcblxudmFyIF9zYW1wbGVfb3NjaWxsYXRvciA9IHJlcXVpcmUoJy4vc2FtcGxlX29zY2lsbGF0b3InKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG5cbnZhciBTaW1wbGVTeW50aCA9IGV4cG9ydHMuU2ltcGxlU3ludGggPSBmdW5jdGlvbiAoX0luc3RydW1lbnQpIHtcbiAgX2luaGVyaXRzKFNpbXBsZVN5bnRoLCBfSW5zdHJ1bWVudCk7XG5cbiAgZnVuY3Rpb24gU2ltcGxlU3ludGgodHlwZSwgbmFtZSkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTaW1wbGVTeW50aCk7XG5cbiAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoU2ltcGxlU3ludGgpLmNhbGwodGhpcykpO1xuXG4gICAgX3RoaXMuaWQgPSBfdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgJ18nICsgaW5zdGFuY2VJbmRleCsrICsgJ18nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgX3RoaXMubmFtZSA9IG5hbWUgfHwgX3RoaXMuaWQ7XG4gICAgX3RoaXMudHlwZSA9IHR5cGU7XG4gICAgX3RoaXMuc2FtcGxlRGF0YSA9IHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICByZWxlYXNlRHVyYXRpb246IDAuMixcbiAgICAgIHJlbGVhc2VFbnZlbG9wZTogJ2VxdWFsIHBvd2VyJ1xuICAgIH07XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFNpbXBsZVN5bnRoLCBbe1xuICAgIGtleTogJ2NyZWF0ZVNhbXBsZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZVNhbXBsZShldmVudCkge1xuICAgICAgcmV0dXJuIG5ldyBfc2FtcGxlX29zY2lsbGF0b3IuU2FtcGxlT3NjaWxsYXRvcih0aGlzLnNhbXBsZURhdGEsIGV2ZW50KTtcbiAgICB9XG5cbiAgICAvLyBzdGVyZW8gc3ByZWFkXG5cbiAgfSwge1xuICAgIGtleTogJ3NldEtleVNjYWxpbmdQYW5uaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKSB7XG4gICAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEtleVNjYWxpbmdSZWxlYXNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0S2V5U2NhbGluZ1JlbGVhc2UoKSB7fVxuICAgIC8vIHNldCByZWxlYXNlIGJhc2VkIG9uIGtleSB2YWx1ZVxuXG5cbiAgICAvKlxuICAgICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICAgIEBlbnZlbG9wZTogbGluZWFyIHwgZXF1YWxfcG93ZXIgfCBhcnJheSBvZiBpbnQgdmFsdWVzXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnc2V0UmVsZWFzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFJlbGVhc2UoZHVyYXRpb24sIGVudmVsb3BlKSB7XG4gICAgICB0aGlzLnNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgICB0aGlzLnNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gZW52ZWxvcGU7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNpbXBsZVN5bnRoO1xufShfaW5zdHJ1bWVudC5JbnN0cnVtZW50KTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlNvbmcgPSB1bmRlZmluZWQ7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvL0AgZmxvd1xuXG52YXIgX2NvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbnZhciBfcGFyc2VfZXZlbnRzID0gcmVxdWlyZSgnLi9wYXJzZV9ldmVudHMnKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfc2NoZWR1bGVyID0gcmVxdWlyZSgnLi9zY2hlZHVsZXInKTtcblxudmFyIF9zY2hlZHVsZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2NoZWR1bGVyKTtcblxudmFyIF9taWRpX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpX2V2ZW50Jyk7XG5cbnZhciBfc29uZ19mcm9tX21pZGlmaWxlID0gcmVxdWlyZSgnLi9zb25nX2Zyb21fbWlkaWZpbGUnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfcG9zaXRpb24gPSByZXF1aXJlKCcuL3Bvc2l0aW9uJyk7XG5cbnZhciBfcGxheWhlYWQgPSByZXF1aXJlKCcuL3BsYXloZWFkJyk7XG5cbnZhciBfbWV0cm9ub21lID0gcmVxdWlyZSgnLi9tZXRyb25vbWUnKTtcblxudmFyIF9ldmVudGxpc3RlbmVyID0gcmVxdWlyZSgnLi9ldmVudGxpc3RlbmVyJyk7XG5cbnZhciBfc2F2ZV9taWRpZmlsZSA9IHJlcXVpcmUoJy4vc2F2ZV9taWRpZmlsZScpO1xuXG52YXIgX3NvbmcgPSByZXF1aXJlKCcuL3NvbmcudXBkYXRlJyk7XG5cbnZhciBfc2V0dGluZ3MgPSByZXF1aXJlKCcuL3NldHRpbmdzJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG52YXIgcmVjb3JkaW5nSW5kZXggPSAwO1xuXG4vKlxudHlwZSBzb25nU2V0dGluZ3MgPSB7XG4gIG5hbWU6IHN0cmluZyxcbiAgcHBxOiBudW1iZXIsXG4gIGJwbTogbnVtYmVyLFxuICBiYXJzOiBudW1iZXIsXG4gIGxvd2VzdE5vdGU6IG51bWJlcixcbiAgaGlnaGVzdE5vdGU6IG51bWJlcixcbiAgbm9taW5hdG9yOiBudW1iZXIsXG4gIGRlbm9taW5hdG9yOiBudW1iZXIsXG4gIHF1YW50aXplVmFsdWU6IG51bWJlcixcbiAgZml4ZWRMZW5ndGhWYWx1ZTogbnVtYmVyLFxuICBwb3NpdGlvblR5cGU6IHN0cmluZyxcbiAgdXNlTWV0cm9ub21lOiBib29sZWFuLFxuICBhdXRvU2l6ZTogYm9vbGVhbixcbiAgbG9vcDogYm9vbGVhbixcbiAgcGxheWJhY2tTcGVlZDogbnVtYmVyLFxuICBhdXRvUXVhbnRpemU6IGJvb2xlYW4sXG4gIHBpdGNoOiBudW1iZXIsXG4gIGJ1ZmZlclRpbWU6IG51bWJlcixcbiAgbm90ZU5hbWVNb2RlOiBzdHJpbmdcbn1cbiovXG5cbi8qXG4gIC8vIGluaXRpYWxpemUgc29uZyB3aXRoIHRyYWNrcyBhbmQgcGFydCBzbyB5b3UgZG8gbm90IGhhdmUgdG8gY3JlYXRlIHRoZW0gc2VwYXJhdGVseVxuICBzZXR1cDoge1xuICAgIHRpbWVFdmVudHM6IFtdXG4gICAgdHJhY2tzOiBbXG4gICAgICBwYXJ0cyBbXVxuICAgIF1cbiAgfVxuKi9cblxudmFyIFNvbmcgPSBleHBvcnRzLlNvbmcgPSBmdW5jdGlvbiAoKSB7XG4gIF9jcmVhdGVDbGFzcyhTb25nLCBudWxsLCBbe1xuICAgIGtleTogJ2Zyb21NSURJRmlsZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZyb21NSURJRmlsZShkYXRhKSB7XG4gICAgICByZXR1cm4gKDAsIF9zb25nX2Zyb21fbWlkaWZpbGUuc29uZ0Zyb21NSURJRmlsZSkoZGF0YSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZnJvbU1JRElGaWxlU3luYycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZyb21NSURJRmlsZVN5bmMoZGF0YSkge1xuICAgICAgcmV0dXJuICgwLCBfc29uZ19mcm9tX21pZGlmaWxlLnNvbmdGcm9tTUlESUZpbGVTeW5jKShkYXRhKTtcbiAgICB9XG4gIH1dKTtcblxuICBmdW5jdGlvbiBTb25nKCkge1xuICAgIHZhciBzZXR0aW5ncyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNvbmcpO1xuXG4gICAgdGhpcy5pZCA9IHRoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHZhciBkZWZhdWx0U2V0dGluZ3MgPSAoMCwgX3NldHRpbmdzLmdldFNldHRpbmdzKSgpO1xuXG4gICAgdmFyIF9zZXR0aW5ncyRuYW1lID0gc2V0dGluZ3MubmFtZTtcbiAgICB0aGlzLm5hbWUgPSBfc2V0dGluZ3MkbmFtZSA9PT0gdW5kZWZpbmVkID8gdGhpcy5pZCA6IF9zZXR0aW5ncyRuYW1lO1xuICAgIHZhciBfc2V0dGluZ3MkcHBxID0gc2V0dGluZ3MucHBxO1xuICAgIHRoaXMucHBxID0gX3NldHRpbmdzJHBwcSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLnBwcSA6IF9zZXR0aW5ncyRwcHE7XG4gICAgdmFyIF9zZXR0aW5ncyRicG0gPSBzZXR0aW5ncy5icG07XG4gICAgdGhpcy5icG0gPSBfc2V0dGluZ3MkYnBtID09PSB1bmRlZmluZWQgPyBkZWZhdWx0U2V0dGluZ3MuYnBtIDogX3NldHRpbmdzJGJwbTtcbiAgICB2YXIgX3NldHRpbmdzJGJhcnMgPSBzZXR0aW5ncy5iYXJzO1xuICAgIHRoaXMuYmFycyA9IF9zZXR0aW5ncyRiYXJzID09PSB1bmRlZmluZWQgPyBkZWZhdWx0U2V0dGluZ3MuYmFycyA6IF9zZXR0aW5ncyRiYXJzO1xuICAgIHZhciBfc2V0dGluZ3Mkbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICAgIHRoaXMubm9taW5hdG9yID0gX3NldHRpbmdzJG5vbWluYXRvciA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLm5vbWluYXRvciA6IF9zZXR0aW5ncyRub21pbmF0b3I7XG4gICAgdmFyIF9zZXR0aW5ncyRkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICAgIHRoaXMuZGVub21pbmF0b3IgPSBfc2V0dGluZ3MkZGVub21pbmF0b3IgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5kZW5vbWluYXRvciA6IF9zZXR0aW5ncyRkZW5vbWluYXRvcjtcbiAgICB2YXIgX3NldHRpbmdzJHF1YW50aXplVmFsID0gc2V0dGluZ3MucXVhbnRpemVWYWx1ZTtcbiAgICB0aGlzLnF1YW50aXplVmFsdWUgPSBfc2V0dGluZ3MkcXVhbnRpemVWYWwgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5xdWFudGl6ZVZhbHVlIDogX3NldHRpbmdzJHF1YW50aXplVmFsO1xuICAgIHZhciBfc2V0dGluZ3MkZml4ZWRMZW5ndGggPSBzZXR0aW5ncy5maXhlZExlbmd0aFZhbHVlO1xuICAgIHRoaXMuZml4ZWRMZW5ndGhWYWx1ZSA9IF9zZXR0aW5ncyRmaXhlZExlbmd0aCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLmZpeGVkTGVuZ3RoVmFsdWUgOiBfc2V0dGluZ3MkZml4ZWRMZW5ndGg7XG4gICAgdmFyIF9zZXR0aW5ncyR1c2VNZXRyb25vbSA9IHNldHRpbmdzLnVzZU1ldHJvbm9tZTtcbiAgICB0aGlzLnVzZU1ldHJvbm9tZSA9IF9zZXR0aW5ncyR1c2VNZXRyb25vbSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLnVzZU1ldHJvbm9tZSA6IF9zZXR0aW5ncyR1c2VNZXRyb25vbTtcbiAgICB2YXIgX3NldHRpbmdzJGF1dG9TaXplID0gc2V0dGluZ3MuYXV0b1NpemU7XG4gICAgdGhpcy5hdXRvU2l6ZSA9IF9zZXR0aW5ncyRhdXRvU2l6ZSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLmF1dG9TaXplIDogX3NldHRpbmdzJGF1dG9TaXplO1xuICAgIHZhciBfc2V0dGluZ3MkcGxheWJhY2tTcGUgPSBzZXR0aW5ncy5wbGF5YmFja1NwZWVkO1xuICAgIHRoaXMucGxheWJhY2tTcGVlZCA9IF9zZXR0aW5ncyRwbGF5YmFja1NwZSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLnBsYXliYWNrU3BlZWQgOiBfc2V0dGluZ3MkcGxheWJhY2tTcGU7XG4gICAgdmFyIF9zZXR0aW5ncyRhdXRvUXVhbnRpeiA9IHNldHRpbmdzLmF1dG9RdWFudGl6ZTtcbiAgICB0aGlzLmF1dG9RdWFudGl6ZSA9IF9zZXR0aW5ncyRhdXRvUXVhbnRpeiA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLmF1dG9RdWFudGl6ZSA6IF9zZXR0aW5ncyRhdXRvUXVhbnRpejtcbiAgICB2YXIgX3NldHRpbmdzJHBpdGNoID0gc2V0dGluZ3MucGl0Y2g7XG4gICAgdGhpcy5waXRjaCA9IF9zZXR0aW5ncyRwaXRjaCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLnBpdGNoIDogX3NldHRpbmdzJHBpdGNoO1xuICAgIHZhciBfc2V0dGluZ3MkYnVmZmVyVGltZSA9IHNldHRpbmdzLmJ1ZmZlclRpbWU7XG4gICAgdGhpcy5idWZmZXJUaW1lID0gX3NldHRpbmdzJGJ1ZmZlclRpbWUgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5idWZmZXJUaW1lIDogX3NldHRpbmdzJGJ1ZmZlclRpbWU7XG4gICAgdmFyIF9zZXR0aW5ncyRub3RlTmFtZU1vZCA9IHNldHRpbmdzLm5vdGVOYW1lTW9kZTtcbiAgICB0aGlzLm5vdGVOYW1lTW9kZSA9IF9zZXR0aW5ncyRub3RlTmFtZU1vZCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLm5vdGVOYW1lTW9kZSA6IF9zZXR0aW5ncyRub3RlTmFtZU1vZDtcbiAgICB2YXIgX3NldHRpbmdzJHZvbHVtZSA9IHNldHRpbmdzLnZvbHVtZTtcbiAgICB0aGlzLnZvbHVtZSA9IF9zZXR0aW5ncyR2b2x1bWUgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy52b2x1bWUgOiBfc2V0dGluZ3Mkdm9sdW1lO1xuXG5cbiAgICB0aGlzLl90aW1lRXZlbnRzID0gW107XG4gICAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IHRydWU7XG4gICAgdGhpcy5fbGFzdEV2ZW50ID0gbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCgwLCBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLkVORF9PRl9UUkFDSyk7XG5cbiAgICB0aGlzLl90cmFja3MgPSBbXTtcbiAgICB0aGlzLl90cmFja3NCeUlkID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fcGFydHMgPSBbXTtcbiAgICB0aGlzLl9wYXJ0c0J5SWQgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9ldmVudHMgPSBbXTtcbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fYWxsRXZlbnRzID0gW107IC8vIE1JREkgZXZlbnRzIGFuZCBtZXRyb25vbWUgZXZlbnRzXG5cbiAgICB0aGlzLl9ub3RlcyA9IFtdO1xuICAgIHRoaXMuX25vdGVzQnlJZCA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX25ld0V2ZW50cyA9IFtdO1xuICAgIHRoaXMuX21vdmVkRXZlbnRzID0gW107XG4gICAgdGhpcy5fcmVtb3ZlZEV2ZW50cyA9IFtdO1xuICAgIHRoaXMuX3RyYW5zcG9zZWRFdmVudHMgPSBbXTtcblxuICAgIHRoaXMuX25ld1BhcnRzID0gW107XG4gICAgdGhpcy5fY2hhbmdlZFBhcnRzID0gW107XG4gICAgdGhpcy5fcmVtb3ZlZFBhcnRzID0gW107XG5cbiAgICB0aGlzLl9yZW1vdmVkVHJhY2tzID0gW107XG5cbiAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gMDtcbiAgICB0aGlzLl9zY2hlZHVsZXIgPSBuZXcgX3NjaGVkdWxlcjIuZGVmYXVsdCh0aGlzKTtcbiAgICB0aGlzLl9wbGF5aGVhZCA9IG5ldyBfcGxheWhlYWQuUGxheWhlYWQodGhpcyk7XG5cbiAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMucmVjb3JkaW5nID0gZmFsc2U7XG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlO1xuICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgdGhpcy5sb29waW5nID0gZmFsc2U7XG5cbiAgICB0aGlzLl9nYWluTm9kZSA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZTtcbiAgICB0aGlzLl9nYWluTm9kZS5jb25uZWN0KF9pbml0X2F1ZGlvLm1hc3RlckdhaW4pO1xuXG4gICAgdGhpcy5fbWV0cm9ub21lID0gbmV3IF9tZXRyb25vbWUuTWV0cm9ub21lKHRoaXMpO1xuICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9IFtdO1xuICAgIHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyA9IHRydWU7XG4gICAgdGhpcy5fbWV0cm9ub21lLm11dGUoIXRoaXMudXNlTWV0cm9ub21lKTtcblxuICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHsgbWlsbGlzOiAwLCB0aWNrczogMCB9O1xuICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHsgbWlsbGlzOiAwLCB0aWNrczogMCB9O1xuICAgIHRoaXMuX2lsbGVnYWxMb29wID0gZmFsc2U7XG4gICAgdGhpcy5fbG9vcER1cmF0aW9uID0gMDtcbiAgICB0aGlzLl9wcmVjb3VudEJhcnMgPSAwO1xuICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gMDtcblxuICAgIHZhciB0cmFja3MgPSBzZXR0aW5ncy50cmFja3M7XG4gICAgdmFyIHRpbWVFdmVudHMgPSBzZXR0aW5ncy50aW1lRXZlbnRzO1xuICAgIC8vY29uc29sZS5sb2codHJhY2tzLCB0aW1lRXZlbnRzKVxuXG4gICAgaWYgKHR5cGVvZiB0aW1lRXZlbnRzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5fdGltZUV2ZW50cyA9IFtuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KDAsIF9jb25zdGFudHMuTUlESUV2ZW50VHlwZXMuVEVNUE8sIHRoaXMuYnBtKSwgbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCgwLCBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLlRJTUVfU0lHTkFUVVJFLCB0aGlzLm5vbWluYXRvciwgdGhpcy5kZW5vbWluYXRvcildO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkZFRpbWVFdmVudHMuYXBwbHkodGhpcywgX3RvQ29uc3VtYWJsZUFycmF5KHRpbWVFdmVudHMpKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHRyYWNrcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuYWRkVHJhY2tzLmFwcGx5KHRoaXMsIF90b0NvbnN1bWFibGVBcnJheSh0cmFja3MpKTtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFNvbmcsIFt7XG4gICAga2V5OiAnYWRkVGltZUV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFRpbWVFdmVudHMoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZXZlbnRzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgLy9AVE9ETzogZmlsdGVyIHRpbWUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2sgLT4gdXNlIHRoZSBsYXN0bHkgYWRkZWQgZXZlbnRzXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IF9jb25zdGFudHMuTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUpIHtcbiAgICAgICAgICBfdGhpcy5fdXBkYXRlTWV0cm9ub21lRXZlbnRzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBfdGhpcy5fdGltZUV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWRkVHJhY2tzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkVHJhY2tzKCkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgdHJhY2tzID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgdHJhY2tzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG5cbiAgICAgIHRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xuICAgICAgICB2YXIgX25ld0V2ZW50cywgX25ld1BhcnRzO1xuXG4gICAgICAgIHRyYWNrLl9zb25nID0gX3RoaXMyO1xuICAgICAgICB0cmFjay5fZ2Fpbk5vZGUuY29ubmVjdChfdGhpczIuX2dhaW5Ob2RlKTtcbiAgICAgICAgdHJhY2suX3NvbmdHYWluTm9kZSA9IF90aGlzMi5fZ2Fpbk5vZGU7XG4gICAgICAgIF90aGlzMi5fdHJhY2tzLnB1c2godHJhY2spO1xuICAgICAgICBfdGhpczIuX3RyYWNrc0J5SWQuc2V0KHRyYWNrLmlkLCB0cmFjayk7XG4gICAgICAgIChfbmV3RXZlbnRzID0gX3RoaXMyLl9uZXdFdmVudHMpLnB1c2guYXBwbHkoX25ld0V2ZW50cywgX3RvQ29uc3VtYWJsZUFycmF5KHRyYWNrLl9ldmVudHMpKTtcbiAgICAgICAgKF9uZXdQYXJ0cyA9IF90aGlzMi5fbmV3UGFydHMpLnB1c2guYXBwbHkoX25ld1BhcnRzLCBfdG9Db25zdW1hYmxlQXJyYXkodHJhY2suX3BhcnRzKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVUcmFja3MnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVUcmFja3MoKSB7XG4gICAgICB2YXIgX3JlbW92ZWRUcmFja3M7XG5cbiAgICAgIChfcmVtb3ZlZFRyYWNrcyA9IHRoaXMuX3JlbW92ZWRUcmFja3MpLnB1c2guYXBwbHkoX3JlbW92ZWRUcmFja3MsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgX3NvbmcudXBkYXRlLmNhbGwodGhpcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncGxheScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHBsYXkodHlwZSkge1xuICAgICAgZm9yICh2YXIgX2xlbjMgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjMgPiAxID8gX2xlbjMgLSAxIDogMCksIF9rZXkzID0gMTsgX2tleTMgPCBfbGVuMzsgX2tleTMrKykge1xuICAgICAgICBhcmdzW19rZXkzIC0gMV0gPSBhcmd1bWVudHNbX2tleTNdO1xuICAgICAgfVxuXG4gICAgICAvL3VubG9ja1dlYkF1ZGlvKClcbiAgICAgIHRoaXMuX3BsYXkuYXBwbHkodGhpcywgW3R5cGVdLmNvbmNhdChhcmdzKSk7XG4gICAgICBpZiAodGhpcy5fcHJlY291bnRCYXJzID4gMCkge1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoeyB0eXBlOiAncHJlY291bnRpbmcnLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzIH0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoeyB0eXBlOiAnc3RhcnRfcmVjb3JkaW5nJywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpcyB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpcyB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfcGxheScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9wbGF5KHR5cGUpIHtcbiAgICAgIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZm9yICh2YXIgX2xlbjQgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjQgPiAxID8gX2xlbjQgLSAxIDogMCksIF9rZXk0ID0gMTsgX2tleTQgPCBfbGVuNDsgX2tleTQrKykge1xuICAgICAgICAgIGFyZ3NbX2tleTQgLSAxXSA9IGFyZ3VtZW50c1tfa2V5NF07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uLmFwcGx5KHRoaXMsIFt0eXBlXS5jb25jYXQoYXJncykpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGxheWluZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5fY3VycmVudE1pbGxpcylcblxuICAgICAgdGhpcy5fcmVmZXJlbmNlID0gdGhpcy5fdGltZVN0YW1wID0gX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7XG4gICAgICB0aGlzLl9zY2hlZHVsZXIuc2V0VGltZVN0YW1wKHRoaXMuX3JlZmVyZW5jZSk7XG4gICAgICB0aGlzLl9zdGFydE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXM7XG5cbiAgICAgIGlmICh0aGlzLl9wcmVjb3VudEJhcnMgPiAwICYmIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nKSB7XG5cbiAgICAgICAgLy8gY3JlYXRlIHByZWNvdW50IGV2ZW50cywgdGhlIHBsYXloZWFkIHdpbGwgYmUgbW92ZWQgdG8gdGhlIGZpcnN0IGJlYXQgb2YgdGhlIGN1cnJlbnQgYmFyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5fbWV0cm9ub21lLmNyZWF0ZVByZWNvdW50RXZlbnRzKHBvc2l0aW9uLmJhciwgcG9zaXRpb24uYmFyICsgdGhpcy5fcHJlY291bnRCYXJzLCB0aGlzLl9yZWZlcmVuY2UpO1xuICAgICAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24oJ2JhcnNiZWF0cycsIFtwb3NpdGlvbi5iYXJdLCAnbWlsbGlzJykubWlsbGlzO1xuICAgICAgICB0aGlzLl9wcmVjb3VudER1cmF0aW9uID0gdGhpcy5fbWV0cm9ub21lLnByZWNvdW50RHVyYXRpb247XG4gICAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gdGhpcy5fY3VycmVudE1pbGxpcyArIHRoaXMuX3ByZWNvdW50RHVyYXRpb247XG5cbiAgICAgICAgLy8gY29uc29sZS5ncm91cCgncHJlY291bnQnKVxuICAgICAgICAvLyBjb25zb2xlLmxvZygncG9zaXRpb24nLCB0aGlzLmdldFBvc2l0aW9uKCkpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdfY3VycmVudE1pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdlbmRQcmVjb3VudE1pbGxpcycsIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzKVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnX3ByZWNvdW50RHVyYXRpb24nLCB0aGlzLl9wcmVjb3VudER1cmF0aW9uKVxuICAgICAgICAvLyBjb25zb2xlLmdyb3VwRW5kKCdwcmVjb3VudCcpXG4gICAgICAgIC8vY29uc29sZS5sb2coJ3ByZWNvdW50RHVyYXRpb24nLCB0aGlzLl9tZXRyb25vbWUuY3JlYXRlUHJlY291bnRFdmVudHModGhpcy5fcHJlY291bnRCYXJzLCB0aGlzLl9yZWZlcmVuY2UpKVxuICAgICAgICB0aGlzLnByZWNvdW50aW5nID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gMDtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yZWNvcmRpbmcgPSB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZztcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5fZW5kUHJlY291bnRNaWxsaXMpXG5cbiAgICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpO1xuICAgICAgdGhpcy5fc2NoZWR1bGVyLmluaXQodGhpcy5fY3VycmVudE1pbGxpcyk7XG4gICAgICB0aGlzLl9sb29wID0gdGhpcy5sb29waW5nICYmIHRoaXMuX2N1cnJlbnRNaWxsaXMgPD0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcztcbiAgICAgIHRoaXMuX3B1bHNlKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX3B1bHNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3B1bHNlKCkge1xuICAgICAgaWYgKHRoaXMucGxheWluZyA9PT0gZmFsc2UgJiYgdGhpcy5wcmVjb3VudGluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcGVyZm9ybVVwZGF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLl9wZXJmb3JtVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3B1bHNlIHVwZGF0ZScsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgICAgIF9zb25nLl91cGRhdGUuY2FsbCh0aGlzKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG5vdyA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwO1xuICAgICAgLy9jb25zb2xlLmxvZyhub3csIHBlcmZvcm1hbmNlLm5vdygpKVxuICAgICAgdmFyIGRpZmYgPSBub3cgLSB0aGlzLl9yZWZlcmVuY2U7XG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzICs9IGRpZmY7XG4gICAgICB0aGlzLl9yZWZlcmVuY2UgPSBub3c7XG5cbiAgICAgIGlmICh0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA+IDApIHtcbiAgICAgICAgaWYgKHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID4gdGhpcy5fY3VycmVudE1pbGxpcykge1xuICAgICAgICAgIHRoaXMuX3NjaGVkdWxlci51cGRhdGUoZGlmZik7XG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3B1bHNlLmJpbmQodGhpcykpO1xuICAgICAgICAgIC8vcmV0dXJuIGJlY2F1c2UgZHVyaW5nIHByZWNvdW50aW5nIG9ubHkgcHJlY291bnQgbWV0cm9ub21lIGV2ZW50cyBnZXQgc2NoZWR1bGVkXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPSAwO1xuICAgICAgICB0aGlzLl9jdXJyZW50TWlsbGlzIC09IHRoaXMuX3ByZWNvdW50RHVyYXRpb247XG4gICAgICAgIGlmICh0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZykge1xuICAgICAgICAgIHRoaXMucGxheWluZyA9IHRydWU7XG4gICAgICAgICAgdGhpcy5yZWNvcmRpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucGxheWluZyA9IHRydWU7XG4gICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3BsYXknLCBkYXRhOiB0aGlzLl9zdGFydE1pbGxpcyB9KTtcbiAgICAgICAgICAvL2Rpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2xvb3AgJiYgdGhpcy5fY3VycmVudE1pbGxpcyA+PSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzKSB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgLT0gdGhpcy5fbG9vcER1cmF0aW9uO1xuICAgICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpO1xuICAgICAgICAvL3RoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzKSAvLyBwbGF5aGVhZCBpcyBhIGJpdCBhaGVhZCBvbmx5IGR1cmluZyB0aGlzIGZyYW1lXG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgdHlwZTogJ2xvb3AnLFxuICAgICAgICAgIGRhdGE6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wbGF5aGVhZC51cGRhdGUoJ21pbGxpcycsIGRpZmYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl90aWNrcyA9IHRoaXMuX3BsYXloZWFkLmdldCgpLnRpY2tzO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2N1cnJlbnRNaWxsaXMsIHRoaXMuX2R1cmF0aW9uTWlsbGlzKVxuXG4gICAgICBpZiAodGhpcy5fY3VycmVudE1pbGxpcyA+PSB0aGlzLl9kdXJhdGlvbk1pbGxpcykge1xuICAgICAgICB2YXIgX3NjaGVkdWxlciRldmVudHM7XG5cbiAgICAgICAgaWYgKHRoaXMucmVjb3JkaW5nICE9PSB0cnVlIHx8IHRoaXMuYXV0b1NpemUgIT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gYWRkIGFuIGV4dHJhIGJhciB0byB0aGUgc2l6ZSBvZiB0aGlzIHNvbmdcbiAgICAgICAgdmFyIF9ldmVudHMgPSB0aGlzLl9tZXRyb25vbWUuYWRkRXZlbnRzKHRoaXMuYmFycywgdGhpcy5iYXJzICsgMSk7XG4gICAgICAgIHZhciB0b2JlUGFyc2VkID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShfZXZlbnRzKSwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX3RpbWVFdmVudHMpKTtcbiAgICAgICAgKDAsIF91dGlsLnNvcnRFdmVudHMpKHRvYmVQYXJzZWQpO1xuICAgICAgICAoMCwgX3BhcnNlX2V2ZW50cy5wYXJzZUV2ZW50cykodG9iZVBhcnNlZCk7XG4gICAgICAgIChfc2NoZWR1bGVyJGV2ZW50cyA9IHRoaXMuX3NjaGVkdWxlci5ldmVudHMpLnB1c2guYXBwbHkoX3NjaGVkdWxlciRldmVudHMsIF90b0NvbnN1bWFibGVBcnJheShfZXZlbnRzKSk7XG4gICAgICAgIHRoaXMuX3NjaGVkdWxlci5udW1FdmVudHMgKz0gX2V2ZW50cy5sZW5ndGg7XG4gICAgICAgIHZhciBsYXN0RXZlbnQgPSBfZXZlbnRzW19ldmVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgIHZhciBleHRyYU1pbGxpcyA9IGxhc3RFdmVudC50aWNrc1BlckJhciAqIGxhc3RFdmVudC5taWxsaXNQZXJUaWNrO1xuICAgICAgICB0aGlzLl9sYXN0RXZlbnQudGlja3MgKz0gbGFzdEV2ZW50LnRpY2tzUGVyQmFyO1xuICAgICAgICB0aGlzLl9sYXN0RXZlbnQubWlsbGlzICs9IGV4dHJhTWlsbGlzO1xuICAgICAgICB0aGlzLl9kdXJhdGlvbk1pbGxpcyArPSBleHRyYU1pbGxpcztcbiAgICAgICAgdGhpcy5iYXJzKys7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZWQgPSB0cnVlO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdsZW5ndGgnLCB0aGlzLl9sYXN0RXZlbnQudGlja3MsIHRoaXMuX2xhc3RFdmVudC5taWxsaXMsIHRoaXMuYmFycywgbGFzdEV2ZW50KVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKGRpZmYpO1xuXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcHVsc2UuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncGF1c2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwYXVzZSgpIHtcbiAgICAgIHRoaXMucGF1c2VkID0gIXRoaXMucGF1c2VkO1xuICAgICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlO1xuICAgICAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFsbE5vdGVzT2ZmKCk7XG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdwYXVzZScsIGRhdGE6IHRoaXMucGF1c2VkIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdwYXVzZScsIGRhdGE6IHRoaXMucGF1c2VkIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3N0b3AnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgLy9jb25zb2xlLmxvZygnU1RPUCcpXG4gICAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmFsbE5vdGVzT2ZmKCk7XG4gICAgICBpZiAodGhpcy5wbGF5aW5nIHx8IHRoaXMucGF1c2VkKSB7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2N1cnJlbnRNaWxsaXMgIT09IDApIHtcbiAgICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDA7XG4gICAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcyk7XG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZykge1xuICAgICAgICAgIHRoaXMuc3RvcFJlY29yZGluZygpO1xuICAgICAgICB9XG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdzdG9wJyB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzdGFydFJlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0UmVjb3JkaW5nKCkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIGlmICh0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9yZWNvcmRJZCA9ICdyZWNvcmRpbmdfJyArIHJlY29yZGluZ0luZGV4KysgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xuICAgICAgICB0cmFjay5fc3RhcnRSZWNvcmRpbmcoX3RoaXMzLl9yZWNvcmRJZCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzdG9wUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcFJlY29yZGluZygpIHtcbiAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFjaykge1xuICAgICAgICB0cmFjay5fc3RvcFJlY29yZGluZyhfdGhpczQuX3JlY29yZElkKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3N0b3BfcmVjb3JkaW5nJyB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1bmRvUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5kb1JlY29yZGluZygpIHtcbiAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2sudW5kb1JlY29yZGluZyhfdGhpczUuX3JlY29yZElkKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZWRvUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVkb1JlY29yZGluZygpIHtcbiAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuXG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2sucmVkb1JlY29yZGluZyhfdGhpczYuX3JlY29yZElkKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRNZXRyb25vbWUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRNZXRyb25vbWUoZmxhZykge1xuICAgICAgaWYgKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9ICF0aGlzLnVzZU1ldHJvbm9tZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXNlTWV0cm9ub21lID0gZmxhZztcbiAgICAgIH1cbiAgICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKCF0aGlzLnVzZU1ldHJvbm9tZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY29uZmlndXJlTWV0cm9ub21lJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29uZmlndXJlTWV0cm9ub21lKGNvbmZpZykge1xuICAgICAgdGhpcy5fbWV0cm9ub21lLmNvbmZpZ3VyZShjb25maWcpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvbmZpZ3VyZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbmZpZ3VyZShjb25maWcpIHtcbiAgICAgIHZhciBfdGhpczcgPSB0aGlzO1xuXG4gICAgICBpZiAodHlwZW9mIGNvbmZpZy5waXRjaCAhPT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgICAgICBpZiAoY29uZmlnLnBpdGNoID09PSB0aGlzLnBpdGNoKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGl0Y2ggPSBjb25maWcucGl0Y2g7XG4gICAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIGV2ZW50LnVwZGF0ZVBpdGNoKF90aGlzNy5waXRjaCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGNvbmZpZy5wcHEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBfcmV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChjb25maWcucHBxID09PSBfdGhpczcucHBxKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICB2OiB2b2lkIDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBwcHFGYWN0b3IgPSBjb25maWcucHBxIC8gX3RoaXM3LnBwcTtcbiAgICAgICAgICBfdGhpczcucHBxID0gY29uZmlnLnBwcTtcbiAgICAgICAgICBfdGhpczcuX2FsbEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnRpY2tzID0gZXZlbnQudGlja3MgKiBwcHFGYWN0b3I7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgX3RoaXM3Ll91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZTtcbiAgICAgICAgICBfdGhpczcudXBkYXRlKCk7XG4gICAgICAgIH0oKTtcblxuICAgICAgICBpZiAoKHR5cGVvZiBfcmV0ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihfcmV0KSkgPT09IFwib2JqZWN0XCIpIHJldHVybiBfcmV0LnY7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgY29uZmlnLnBsYXliYWNrU3BlZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmIChjb25maWcucGxheWJhY2tTcGVlZCA9PT0gdGhpcy5wbGF5YmFja1NwZWVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGxheWJhY2tTcGVlZCA9IGNvbmZpZy5wbGF5YmFja1NwZWVkO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FsbE5vdGVzT2ZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWxsTm90ZXNPZmYoKSB7XG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2suYWxsTm90ZXNPZmYoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9zY2hlZHVsZXIuYWxsTm90ZXNPZmYoKTtcbiAgICAgIHRoaXMuX21ldHJvbm9tZS5hbGxOb3Rlc09mZigpO1xuICAgIH1cbiAgICAvKlxuICAgICAgcGFuaWMoKXtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKCh0cmFjaykgPT4ge1xuICAgICAgICAgICAgdHJhY2suZGlzY29ubmVjdCh0aGlzLl9nYWluTm9kZSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICAgICAgICAgIHRyYWNrLmNvbm5lY3QodGhpcy5fZ2Fpbk5vZGUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfSwgMTAwKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2dldFRyYWNrcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFRyYWNrcygpIHtcbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX3RyYWNrcykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldFBhcnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UGFydHMoKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9wYXJ0cykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50cygpIHtcbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldE5vdGVzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Tm90ZXMoKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ub3RlcykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NhbGN1bGF0ZVBvc2l0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb24oYXJncykge1xuICAgICAgcmV0dXJuICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMsIGFyZ3MpO1xuICAgIH1cblxuICAgIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cblxuICB9LCB7XG4gICAga2V5OiAnc2V0UG9zaXRpb24nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQb3NpdGlvbih0eXBlKSB7XG5cbiAgICAgIHZhciB3YXNQbGF5aW5nID0gdGhpcy5wbGF5aW5nO1xuICAgICAgaWYgKHRoaXMucGxheWluZykge1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hbGxOb3Rlc09mZigpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBfbGVuNSA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuNSA+IDEgPyBfbGVuNSAtIDEgOiAwKSwgX2tleTUgPSAxOyBfa2V5NSA8IF9sZW41OyBfa2V5NSsrKSB7XG4gICAgICAgIGFyZ3NbX2tleTUgLSAxXSA9IGFyZ3VtZW50c1tfa2V5NV07XG4gICAgICB9XG5cbiAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKTtcbiAgICAgIC8vbGV0IG1pbGxpcyA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdtaWxsaXMnKVxuICAgICAgaWYgKHBvc2l0aW9uID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSBwb3NpdGlvbi5taWxsaXM7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2N1cnJlbnRNaWxsaXMpXG5cbiAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICAgIGRhdGE6IHBvc2l0aW9uXG4gICAgICB9KTtcblxuICAgICAgaWYgKHdhc1BsYXlpbmcpIHtcbiAgICAgICAgdGhpcy5fcGxheSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9AdG9kbzogZ2V0IHRoaXMgaW5mb3JtYXRpb24gZnJvbSBsZXQgJ3Bvc2l0aW9uJyAtPiB3ZSBoYXZlIGp1c3QgY2FsY3VsYXRlZCB0aGUgcG9zaXRpb25cbiAgICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coJ3NldFBvc2l0aW9uJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRQb3NpdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBvc2l0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BsYXloZWFkLmdldCgpLnBvc2l0aW9uO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldFBsYXloZWFkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UGxheWhlYWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGxheWhlYWQuZ2V0KCk7XG4gICAgfVxuXG4gICAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuXG4gIH0sIHtcbiAgICBrZXk6ICdzZXRMZWZ0TG9jYXRvcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldExlZnRMb2NhdG9yKHR5cGUpIHtcbiAgICAgIGZvciAodmFyIF9sZW42ID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW42ID4gMSA/IF9sZW42IC0gMSA6IDApLCBfa2V5NiA9IDE7IF9rZXk2IDwgX2xlbjY7IF9rZXk2KyspIHtcbiAgICAgICAgYXJnc1tfa2V5NiAtIDFdID0gYXJndW1lbnRzW19rZXk2XTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fbGVmdExvY2F0b3IgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJyk7XG5cbiAgICAgIGlmICh0aGlzLl9sZWZ0TG9jYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIHBvc2l0aW9uIGZvciBsb2NhdG9yJyk7XG4gICAgICAgIHRoaXMuX2xlZnRMb2NhdG9yID0geyBtaWxsaXM6IDAsIHRpY2tzOiAwIH07XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBAYXJncyAtPiBzZWUgX2NhbGN1bGF0ZVBvc2l0aW9uXG5cbiAgfSwge1xuICAgIGtleTogJ3NldFJpZ2h0TG9jYXRvcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFJpZ2h0TG9jYXRvcih0eXBlKSB7XG4gICAgICBmb3IgKHZhciBfbGVuNyA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuNyA+IDEgPyBfbGVuNyAtIDEgOiAwKSwgX2tleTcgPSAxOyBfa2V5NyA8IF9sZW43OyBfa2V5NysrKSB7XG4gICAgICAgIGFyZ3NbX2tleTcgLSAxXSA9IGFyZ3VtZW50c1tfa2V5N107XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKTtcblxuICAgICAgaWYgKHRoaXMuX3JpZ2h0TG9jYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5fcmlnaHRMb2NhdG9yID0geyBtaWxsaXM6IDAsIHRpY2tzOiAwIH07XG4gICAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBwb3NpdGlvbiBmb3IgbG9jYXRvcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0TG9vcCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldExvb3AoKSB7XG4gICAgICB2YXIgZmxhZyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMF07XG5cblxuICAgICAgdGhpcy5sb29waW5nID0gZmxhZyAhPT0gbnVsbCA/IGZsYWcgOiAhdGhpcy5fbG9vcDtcblxuICAgICAgaWYgKHRoaXMuX3JpZ2h0TG9jYXRvciA9PT0gZmFsc2UgfHwgdGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxvb3BpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBsb2NhdG9ycyBjYW4gbm90ICh5ZXQpIGJlIHVzZWQgdG8ganVtcCBvdmVyIGEgc2VnbWVudFxuICAgICAgaWYgKHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMgPD0gdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzKSB7XG4gICAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxvb3BpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9sb29wRHVyYXRpb24gPSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzIC0gdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9sb29wLCB0aGlzLl9sb29wRHVyYXRpb24pXG4gICAgICB0aGlzLl9zY2hlZHVsZXIuYmV5b25kTG9vcCA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgPiB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzO1xuICAgICAgdGhpcy5fbG9vcCA9IHRoaXMubG9vcGluZyAmJiB0aGlzLl9jdXJyZW50TWlsbGlzIDw9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXM7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2xvb3AsIHRoaXMubG9vcGluZylcbiAgICAgIHJldHVybiB0aGlzLmxvb3Bpbmc7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0UHJlY291bnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQcmVjb3VudCgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgIHRoaXMuX3ByZWNvdW50QmFycyA9IHZhbHVlO1xuICAgIH1cblxuICAgIC8qXG4gICAgICBoZWxwZXIgbWV0aG9kOiBjb252ZXJ0cyB1c2VyIGZyaWVuZGx5IHBvc2l0aW9uIGZvcm1hdCB0byBpbnRlcm5hbCBmb3JtYXRcbiAgICAgICBwb3NpdGlvbjpcbiAgICAgICAgLSAndGlja3MnLCA5NjAwMFxuICAgICAgICAtICdtaWxsaXMnLCAxMjM0XG4gICAgICAgIC0gJ3BlcmNlbnRhZ2UnLCA1NVxuICAgICAgICAtICdiYXJzYmVhdHMnLCAxLCA0LCAwLCAyNSAtPiBiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja1xuICAgICAgICAtICd0aW1lJywgMCwgMywgNDksIDU2NiAtPiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ19jYWxjdWxhdGVQb3NpdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCByZXN1bHRUeXBlKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gdm9pZCAwO1xuXG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAndGlja3MnOlxuICAgICAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgICBjYXNlICdwZXJjZW50YWdlJzpcbiAgICAgICAgICAvL3RhcmdldCA9IGFyZ3NbMF0gfHwgMFxuICAgICAgICAgIHRhcmdldCA9IGFyZ3MgfHwgMDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0aW1lJzpcbiAgICAgICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICAgICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgICAgICB0YXJnZXQgPSBhcmdzO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Vuc3VwcG9ydGVkIHR5cGUnKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBwb3NpdGlvbiA9ICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMsIHtcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHJlc3VsdDogcmVzdWx0VHlwZVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhZGRFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuICgwLCBfZXZlbnRsaXN0ZW5lci5hZGRFdmVudExpc3RlbmVyKSh0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpIHtcbiAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5yZW1vdmVFdmVudExpc3RlbmVyKSh0eXBlLCBpZCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2F2ZUFzTUlESUZpbGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzYXZlQXNNSURJRmlsZShuYW1lKSB7XG4gICAgICAoMCwgX3NhdmVfbWlkaWZpbGUuc2F2ZUFzTUlESUZpbGUpKHRoaXMsIG5hbWUpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFZvbHVtZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFZvbHVtZSh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlIDwgMCB8fCB2YWx1ZSA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Nvbmcuc2V0Vm9sdW1lKCkgYWNjZXB0cyBhIHZhbHVlIGJldHdlZW4gMCBhbmQgMSwgeW91IGVudGVyZWQ6JywgdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnZvbHVtZSA9IHZhbHVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldFZvbHVtZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFZvbHVtZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnZvbHVtZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRQYW5uaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UGFubmluZyh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlIDwgLTEgfHwgdmFsdWUgPiAxKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTb25nLnNldFBhbm5pbmcoKSBhY2NlcHRzIGEgdmFsdWUgYmV0d2VlbiAtMSAoZnVsbCBsZWZ0KSBhbmQgMSAoZnVsbCByaWdodCksIHlvdSBlbnRlcmVkOicsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICAgIHRyYWNrLnNldFBhbm5pbmcodmFsdWUpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9wYW5uZXJWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTb25nO1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMudXBkYXRlID0gdXBkYXRlO1xuZXhwb3J0cy5fdXBkYXRlID0gX3VwZGF0ZTtcblxudmFyIF9wYXJzZV9ldmVudHMgPSByZXF1aXJlKCcuL3BhcnNlX2V2ZW50cycpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9jb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG52YXIgX3Bvc2l0aW9uID0gcmVxdWlyZSgnLi9wb3NpdGlvbicpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF9ldmVudGxpc3RlbmVyID0gcmVxdWlyZSgnLi9ldmVudGxpc3RlbmVyJyk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfSAvLyBjYWxsZWQgYnkgc29uZ1xuXG5cbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgaWYgKHRoaXMucGxheWluZyA9PT0gZmFsc2UpIHtcbiAgICBfdXBkYXRlLmNhbGwodGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3VwZGF0ZSgpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICBpZiAodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gZmFsc2UgJiYgdGhpcy5fcmVtb3ZlZFRyYWNrcy5sZW5ndGggPT09IDAgJiYgdGhpcy5fcmVtb3ZlZEV2ZW50cy5sZW5ndGggPT09IDAgJiYgdGhpcy5fbmV3RXZlbnRzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9tb3ZlZEV2ZW50cy5sZW5ndGggPT09IDAgJiYgdGhpcy5fbmV3UGFydHMubGVuZ3RoID09PSAwICYmIHRoaXMuX3JlbW92ZWRQYXJ0cy5sZW5ndGggPT09IDAgJiYgdGhpcy5fcmVzaXplZCA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy9kZWJ1Z1xuICAvL3RoaXMuaXNQbGF5aW5nID0gdHJ1ZVxuXG4gIC8vY29uc29sZS5ncm91cENvbGxhcHNlZCgndXBkYXRlIHNvbmcnKVxuICBjb25zb2xlLnRpbWUoJ3VwZGF0aW5nIHNvbmcgdG9vaycpO1xuXG4gIC8vIFRJTUUgRVZFTlRTXG5cbiAgLy8gY2hlY2sgaWYgdGltZSBldmVudHMgYXJlIHVwZGF0ZWRcbiAgaWYgKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IHRydWUpIHtcbiAgICAvL2NvbnNvbGUubG9nKCd1cGRhdGVUaW1lRXZlbnRzJywgdGhpcy5fdGltZUV2ZW50cy5sZW5ndGgpXG4gICAgKDAsIF9wYXJzZV9ldmVudHMucGFyc2VUaW1lRXZlbnRzKSh0aGlzLCB0aGlzLl90aW1lRXZlbnRzLCB0aGlzLmlzUGxheWluZyk7XG4gICAgLy9jb25zb2xlLmxvZygndGltZSBldmVudHMgJU8nLCB0aGlzLl90aW1lRXZlbnRzKVxuICB9XG5cbiAgLy8gb25seSBwYXJzZSBuZXcgYW5kIG1vdmVkIGV2ZW50c1xuICB2YXIgdG9iZVBhcnNlZCA9IFtdO1xuXG4gIC8vIGJ1dCBwYXJzZSBhbGwgZXZlbnRzIGlmIHRoZSB0aW1lIGV2ZW50cyBoYXZlIGJlZW4gdXBkYXRlZFxuICBpZiAodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gdHJ1ZSkge1xuICAgIHRvYmVQYXJzZWQgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICB9XG5cbiAgLy8gVFJBQ0tTXG4gIC8vIHJlbW92ZWQgdHJhY2tzXG4gIGlmICh0aGlzLl9yZW1vdmVkVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICB0aGlzLl9yZW1vdmVkVHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICBfdGhpcy5fdHJhY2tzQnlJZC5kZWxldGUodHJhY2suaWQpO1xuICAgICAgdHJhY2sucmVtb3ZlUGFydHModHJhY2suZ2V0UGFydHMoKSk7XG4gICAgICB0cmFjay5fc29uZyA9IG51bGw7XG4gICAgICB0cmFjay5fZ2Fpbk5vZGUuZGlzY29ubmVjdCgpO1xuICAgICAgdHJhY2suX3NvbmdHYWluTm9kZSA9IG51bGw7XG4gICAgfSk7XG4gIH1cblxuICAvLyBQQVJUU1xuICAvLyByZW1vdmVkIHBhcnRzXG4gIC8vY29uc29sZS5sb2coJ3JlbW92ZWQgcGFydHMgJU8nLCB0aGlzLl9jaGFuZ2VkUGFydHMpXG4gIGlmICh0aGlzLl9yZW1vdmVkUGFydHMubGVuZ3RoID4gMCkge1xuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICBfdGhpcy5fcGFydHNCeUlkLmRlbGV0ZShwYXJ0LmlkKTtcbiAgICB9KTtcbiAgICB0aGlzLl9wYXJ0cyA9IEFycmF5LmZyb20odGhpcy5fcGFydHNCeUlkLnZhbHVlcygpKTtcbiAgfVxuXG4gIC8vIGFkZCBuZXcgcGFydHNcbiAgLy9jb25zb2xlLmxvZygnbmV3IHBhcnRzICVPJywgdGhpcy5fbmV3UGFydHMpXG4gIHRoaXMuX25ld1BhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICBwYXJ0Ll9zb25nID0gX3RoaXM7XG4gICAgX3RoaXMuX3BhcnRzQnlJZC5zZXQocGFydC5pZCwgcGFydCk7XG4gICAgcGFydC51cGRhdGUoKTtcbiAgfSk7XG5cbiAgLy8gdXBkYXRlIGNoYW5nZWQgcGFydHNcbiAgLy9jb25zb2xlLmxvZygnY2hhbmdlZCBwYXJ0cyAlTycsIHRoaXMuX2NoYW5nZWRQYXJ0cylcbiAgdGhpcy5fY2hhbmdlZFBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICBwYXJ0LnVwZGF0ZSgpO1xuICB9KTtcblxuICAvLyBFVkVOVFNcblxuICAvLyBmaWx0ZXIgcmVtb3ZlZCBldmVudHNcbiAgLy9jb25zb2xlLmxvZygncmVtb3ZlZCBldmVudHMgJU8nLCB0aGlzLl9yZW1vdmVkRXZlbnRzKVxuICB0aGlzLl9yZW1vdmVkRXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIHRyYWNrID0gZXZlbnQubWlkaU5vdGUuX3RyYWNrO1xuICAgIC8vIHVuc2NoZWR1bGUgYWxsIHJlbW92ZWQgZXZlbnRzIHRoYXQgYWxyZWFkeSBoYXZlIGJlZW4gc2NoZWR1bGVkXG4gICAgaWYgKGV2ZW50LnRpbWUgPj0gX3RoaXMuX2N1cnJlbnRNaWxsaXMpIHtcbiAgICAgIHRyYWNrLnVuc2NoZWR1bGUoZXZlbnQpO1xuICAgIH1cbiAgICBfdGhpcy5fbm90ZXNCeUlkLmRlbGV0ZShldmVudC5taWRpTm90ZS5pZCk7XG4gICAgX3RoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKTtcbiAgfSk7XG5cbiAgLy8gYWRkIG5ldyBldmVudHNcbiAgLy9jb25zb2xlLmxvZygnbmV3IGV2ZW50cyAlTycsIHRoaXMuX25ld0V2ZW50cylcbiAgdGhpcy5fbmV3RXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgX3RoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudCk7XG4gICAgX3RoaXMuX2V2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpO1xuICB9KTtcblxuICAvLyBtb3ZlZCBldmVudHMgbmVlZCB0byBiZSBwYXJzZWRcbiAgLy9jb25zb2xlLmxvZygnbW92ZWQgJU8nLCB0aGlzLl9tb3ZlZEV2ZW50cylcbiAgdGhpcy5fbW92ZWRFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAvLyBkb24ndCBhZGQgbW92ZWQgZXZlbnRzIGlmIHRoZSB0aW1lIGV2ZW50cyBoYXZlIGJlZW4gdXBkYXRlZCAtPiB0aGV5IGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIHRoZSB0b2JlUGFyc2VkIGFycmF5XG4gICAgaWYgKF90aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSBmYWxzZSkge1xuICAgICAgdG9iZVBhcnNlZC5wdXNoKGV2ZW50KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHBhcnNlIGFsbCBuZXcgYW5kIG1vdmVkIGV2ZW50c1xuICBpZiAodG9iZVBhcnNlZC5sZW5ndGggPiAwKSB7XG4gICAgLy9jb25zb2xlLnRpbWUoJ3BhcnNlJylcbiAgICAvL2NvbnNvbGUubG9nKCd0b2JlUGFyc2VkICVPJywgdG9iZVBhcnNlZClcbiAgICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycsIHRvYmVQYXJzZWQubGVuZ3RoKVxuXG4gICAgdG9iZVBhcnNlZCA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodG9iZVBhcnNlZCksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl90aW1lRXZlbnRzKSk7XG4gICAgKDAsIF9wYXJzZV9ldmVudHMucGFyc2VFdmVudHMpKHRvYmVQYXJzZWQsIHRoaXMuaXNQbGF5aW5nKTtcblxuICAgIC8vIGFkZCBNSURJIG5vdGVzIHRvIHNvbmdcbiAgICB0b2JlUGFyc2VkLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmlkLCBldmVudC50eXBlLCBldmVudC5taWRpTm90ZSlcbiAgICAgIGlmIChldmVudC50eXBlID09PSBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLk5PVEVfT04pIHtcbiAgICAgICAgaWYgKGV2ZW50Lm1pZGlOb3RlKSB7XG4gICAgICAgICAgX3RoaXMuX25vdGVzQnlJZC5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQudHlwZSlcbiAgICAgICAgICAvL3RoaXMuX25vdGVzLnB1c2goZXZlbnQubWlkaU5vdGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICAvL2NvbnNvbGUudGltZUVuZCgncGFyc2UnKVxuICB9XG5cbiAgaWYgKHRvYmVQYXJzZWQubGVuZ3RoID4gMCB8fCB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAvL2NvbnNvbGUudGltZSgndG8gYXJyYXknKVxuICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSk7XG4gICAgdGhpcy5fbm90ZXMgPSBBcnJheS5mcm9tKHRoaXMuX25vdGVzQnlJZC52YWx1ZXMoKSk7XG4gICAgLy9jb25zb2xlLnRpbWVFbmQoJ3RvIGFycmF5JylcbiAgfVxuXG4gIC8vY29uc29sZS50aW1lKGBzb3J0aW5nICR7dGhpcy5fZXZlbnRzLmxlbmd0aH0gZXZlbnRzYClcbiAgKDAsIF91dGlsLnNvcnRFdmVudHMpKHRoaXMuX2V2ZW50cyk7XG4gIHRoaXMuX25vdGVzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYS5ub3RlT24udGlja3MgLSBiLm5vdGVPbi50aWNrcztcbiAgfSk7XG4gIC8vY29uc29sZS50aW1lRW5kKGBzb3J0aW5nICR7dGhpcy5fZXZlbnRzLmxlbmd0aH0gZXZlbnRzYClcblxuICAvL2NvbnNvbGUubG9nKCdub3RlcyAlTycsIHRoaXMuX25vdGVzKVxuICBjb25zb2xlLnRpbWVFbmQoJ3VwZGF0aW5nIHNvbmcgdG9vaycpO1xuXG4gIC8vIFNPTkcgRFVSQVRJT05cblxuICAvLyBnZXQgdGhlIGxhc3QgZXZlbnQgb2YgdGhpcyBzb25nXG4gIHZhciBsYXN0RXZlbnQgPSB0aGlzLl9ldmVudHNbdGhpcy5fZXZlbnRzLmxlbmd0aCAtIDFdO1xuICB2YXIgbGFzdFRpbWVFdmVudCA9IHRoaXMuX3RpbWVFdmVudHNbdGhpcy5fdGltZUV2ZW50cy5sZW5ndGggLSAxXTtcbiAgLy9jb25zb2xlLmxvZyhsYXN0RXZlbnQsIGxhc3RUaW1lRXZlbnQpXG5cbiAgLy8gY2hlY2sgaWYgc29uZyBoYXMgYWxyZWFkeSBhbnkgZXZlbnRzXG4gIGlmIChsYXN0RXZlbnQgaW5zdGFuY2VvZiBfbWlkaV9ldmVudC5NSURJRXZlbnQgPT09IGZhbHNlKSB7XG4gICAgbGFzdEV2ZW50ID0gbGFzdFRpbWVFdmVudDtcbiAgfSBlbHNlIGlmIChsYXN0VGltZUV2ZW50LnRpY2tzID4gbGFzdEV2ZW50LnRpY2tzKSB7XG4gICAgbGFzdEV2ZW50ID0gbGFzdFRpbWVFdmVudDtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGxhc3RFdmVudCwgdGhpcy5iYXJzKVxuXG4gIC8vIGdldCB0aGUgcG9zaXRpb24gZGF0YSBvZiB0aGUgZmlyc3QgYmVhdCBpbiB0aGUgYmFyIGFmdGVyIHRoZSBsYXN0IGJhclxuICB0aGlzLmJhcnMgPSBNYXRoLm1heChsYXN0RXZlbnQuYmFyLCB0aGlzLmJhcnMpO1xuICB2YXIgdGlja3MgPSAoMCwgX3Bvc2l0aW9uLmNhbGN1bGF0ZVBvc2l0aW9uKSh0aGlzLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgdGFyZ2V0OiBbdGhpcy5iYXJzICsgMV0sXG4gICAgcmVzdWx0OiAndGlja3MnXG4gIH0pLnRpY2tzO1xuXG4gIC8vIHdlIHdhbnQgdG8gcHV0IHRoZSBFTkRfT0ZfVFJBQ0sgZXZlbnQgYXQgdGhlIHZlcnkgbGFzdCB0aWNrIG9mIHRoZSBsYXN0IGJhciwgc28gd2UgY2FsY3VsYXRlIHRoYXQgcG9zaXRpb25cbiAgdmFyIG1pbGxpcyA9ICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMsIHtcbiAgICB0eXBlOiAndGlja3MnLFxuICAgIHRhcmdldDogdGlja3MgLSAxLFxuICAgIHJlc3VsdDogJ21pbGxpcydcbiAgfSkubWlsbGlzO1xuXG4gIHRoaXMuX2xhc3RFdmVudC50aWNrcyA9IHRpY2tzIC0gMTtcbiAgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcyA9IG1pbGxpcztcblxuICAvL2NvbnNvbGUubG9nKCdsZW5ndGgnLCB0aGlzLl9sYXN0RXZlbnQudGlja3MsIHRoaXMuX2xhc3RFdmVudC5taWxsaXMsIHRoaXMuYmFycylcblxuICB0aGlzLl9kdXJhdGlvblRpY2tzID0gdGhpcy5fbGFzdEV2ZW50LnRpY2tzO1xuICB0aGlzLl9kdXJhdGlvbk1pbGxpcyA9IHRoaXMuX2xhc3RFdmVudC5taWxsaXM7XG5cbiAgLy8gTUVUUk9OT01FXG5cbiAgLy8gYWRkIG1ldHJvbm9tZSBldmVudHNcbiAgaWYgKHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyB8fCB0aGlzLl9tZXRyb25vbWUuYmFycyAhPT0gdGhpcy5iYXJzIHx8IHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IHRydWUpIHtcbiAgICB0aGlzLl9tZXRyb25vbWVFdmVudHMgPSAoMCwgX3BhcnNlX2V2ZW50cy5wYXJzZUV2ZW50cykoW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl90aW1lRXZlbnRzKSwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX21ldHJvbm9tZS5nZXRFdmVudHMoKSkpKTtcbiAgfVxuICB0aGlzLl9hbGxFdmVudHMgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX21ldHJvbm9tZUV2ZW50cyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgKDAsIF91dGlsLnNvcnRFdmVudHMpKHRoaXMuX2FsbEV2ZW50cyk7XG4gIC8vY29uc29sZS5sb2coJ2FsbCBldmVudHMgJU8nLCB0aGlzLl9hbGxFdmVudHMpXG5cbiAgLypcbiAgICB0aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKClcbiAgICB0aGlzLl9hbGxFdmVudHMgPSBbLi4udGhpcy5fZXZlbnRzXVxuICAgIHNvcnRFdmVudHModGhpcy5fYWxsRXZlbnRzKVxuICAqL1xuXG4gIC8vY29uc29sZS5sb2coJ2N1cnJlbnQgbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgdGhpcy5fcGxheWhlYWQudXBkYXRlU29uZygpO1xuICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlU29uZygpO1xuXG4gIGlmICh0aGlzLnBsYXlpbmcgPT09IGZhbHNlKSB7XG4gICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKTtcbiAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgIGRhdGE6IHRoaXMuX3BsYXloZWFkLmdldCgpLnBvc2l0aW9uXG4gICAgfSk7XG4gIH1cblxuICAvLyByZXNldFxuICB0aGlzLl9uZXdQYXJ0cyA9IFtdO1xuICB0aGlzLl9yZW1vdmVkUGFydHMgPSBbXTtcbiAgdGhpcy5fbmV3RXZlbnRzID0gW107XG4gIHRoaXMuX21vdmVkRXZlbnRzID0gW107XG4gIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXTtcbiAgdGhpcy5fcmVzaXplZCA9IGZhbHNlO1xuICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gZmFsc2U7XG5cbiAgLy9jb25zb2xlLmdyb3VwRW5kKCd1cGRhdGUgc29uZycpXG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5zb25nRnJvbU1JRElGaWxlU3luYyA9IHNvbmdGcm9tTUlESUZpbGVTeW5jO1xuZXhwb3J0cy5zb25nRnJvbU1JRElGaWxlID0gc29uZ0Zyb21NSURJRmlsZTtcblxudmFyIF9pc29tb3JwaGljRmV0Y2ggPSByZXF1aXJlKCdpc29tb3JwaGljLWZldGNoJyk7XG5cbnZhciBfaXNvbW9ycGhpY0ZldGNoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzb21vcnBoaWNGZXRjaCk7XG5cbnZhciBfbWlkaWZpbGUgPSByZXF1aXJlKCcuL21pZGlmaWxlJyk7XG5cbnZhciBfbWlkaV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaV9ldmVudCcpO1xuXG52YXIgX3BhcnQgPSByZXF1aXJlKCcuL3BhcnQnKTtcblxudmFyIF90cmFjayA9IHJlcXVpcmUoJy4vdHJhY2snKTtcblxudmFyIF9zb25nID0gcmVxdWlyZSgnLi9zb25nJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX2ZldGNoX2hlbHBlcnMgPSByZXF1aXJlKCcuL2ZldGNoX2hlbHBlcnMnKTtcblxudmFyIF9zZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gdG9Tb25nKHBhcnNlZCwgc2V0dGluZ3MpIHtcblxuICB2YXIgdHJhY2tzID0gcGFyc2VkLnRyYWNrcztcbiAgdmFyIHBwcSA9IHBhcnNlZC5oZWFkZXIudGlja3NQZXJCZWF0OyAvLyB0aGUgUFBRIGFzIHNldCBpbiB0aGUgbG9hZGVkIE1JREkgZmlsZVxuICB2YXIgcHBxRmFjdG9yID0gMTtcblxuICAvLyBjaGVjayBpZiB3ZSBuZWVkIHRvIG92ZXJydWxlIHRoZSBQUFEgb2ZzIHRoZSBsb2FkZWQgTUlESSBmaWxlXG4gIGlmICh0eXBlb2Ygc2V0dGluZ3Mub3ZlcnJ1bGVQUFEgPT09ICd1bmRlZmluZWQnIHx8IHNldHRpbmdzLm92ZXJydWxlUFBRID09PSB0cnVlKSB7XG4gICAgdmFyIG5ld1BQUSA9ICgwLCBfc2V0dGluZ3MuZ2V0U2V0dGluZ3MpKCkucHBxO1xuICAgIHBwcUZhY3RvciA9IG5ld1BQUSAvIHBwcTtcbiAgICBwcHEgPSBuZXdQUFE7XG4gIH1cblxuICB2YXIgdGltZUV2ZW50cyA9IFtdO1xuICB2YXIgYnBtID0gLTE7XG4gIHZhciBub21pbmF0b3IgPSAtMTtcbiAgdmFyIGRlbm9taW5hdG9yID0gLTE7XG4gIHZhciBuZXdUcmFja3MgPSBbXTtcblxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0cmFja3MudmFsdWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICB2YXIgdHJhY2sgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgdmFyIGxhc3RUaWNrcyA9IHZvaWQgMCxcbiAgICAgICAgICBsYXN0VHlwZSA9IHZvaWQgMDtcbiAgICAgIHZhciB0aWNrcyA9IDA7XG4gICAgICB2YXIgdHlwZSA9IHZvaWQgMDtcbiAgICAgIHZhciBjaGFubmVsID0gLTE7XG4gICAgICB2YXIgdHJhY2tOYW1lID0gdm9pZCAwO1xuICAgICAgdmFyIHRyYWNrSW5zdHJ1bWVudE5hbWUgPSB2b2lkIDA7XG4gICAgICB2YXIgZXZlbnRzID0gW107XG5cbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gdHJhY2tbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgZXZlbnQgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgICAgICB0aWNrcyArPSBldmVudC5kZWx0YVRpbWUgKiBwcHFGYWN0b3I7XG5cbiAgICAgICAgICBpZiAoY2hhbm5lbCA9PT0gLTEgJiYgdHlwZW9mIGV2ZW50LmNoYW5uZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjaGFubmVsID0gZXZlbnQuY2hhbm5lbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdHlwZSA9IGV2ZW50LnN1YnR5cGU7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5kZWx0YVRpbWUsIHRpY2tzLCB0eXBlKTtcblxuICAgICAgICAgIHN3aXRjaCAoZXZlbnQuc3VidHlwZSkge1xuXG4gICAgICAgICAgICBjYXNlICd0cmFja05hbWUnOlxuICAgICAgICAgICAgICB0cmFja05hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnaW5zdHJ1bWVudE5hbWUnOlxuICAgICAgICAgICAgICBpZiAoZXZlbnQudGV4dCkge1xuICAgICAgICAgICAgICAgIHRyYWNrSW5zdHJ1bWVudE5hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdub3RlT24nOlxuICAgICAgICAgICAgICBldmVudHMucHVzaChuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KHRpY2tzLCAweDkwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbm90ZU9mZic6XG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MsIDB4ODAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdzZXRUZW1wbyc6XG4gICAgICAgICAgICAgIC8vIHNvbWV0aW1lcyAyIHRlbXBvIGV2ZW50cyBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uIGluIHRpY2tzXG4gICAgICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgICAgIHZhciB0bXAgPSA2MDAwMDAwMCAvIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQ7XG5cbiAgICAgICAgICAgICAgaWYgKHRpY2tzID09PSBsYXN0VGlja3MgJiYgdHlwZSA9PT0gbGFzdFR5cGUpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUuaW5mbygndGVtcG8gZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2snLCB0aWNrcywgdG1wKTtcbiAgICAgICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKGJwbSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBicG0gPSB0bXA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MsIDB4NTEsIHRtcCkpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAndGltZVNpZ25hdHVyZSc6XG4gICAgICAgICAgICAgIC8vIHNvbWV0aW1lcyAyIHRpbWUgc2lnbmF0dXJlIGV2ZW50cyBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uIGluIHRpY2tzXG4gICAgICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgICAgIGlmIChsYXN0VGlja3MgPT09IHRpY2tzICYmIGxhc3RUeXBlID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCd0aW1lIHNpZ25hdHVyZSBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKTtcbiAgICAgICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKG5vbWluYXRvciA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5udW1lcmF0b3I7XG4gICAgICAgICAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHg1OCwgZXZlbnQubnVtZXJhdG9yLCBldmVudC5kZW5vbWluYXRvcikpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnY29udHJvbGxlcic6XG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MsIDB4QjAsIGV2ZW50LmNvbnRyb2xsZXJUeXBlLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAncHJvZ3JhbUNoYW5nZSc6XG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MsIDB4QzAsIGV2ZW50LnByb2dyYW1OdW1iZXIpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3BpdGNoQmVuZCc6XG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MsIDB4RTAsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCBldmVudC50eXBlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsYXN0VHlwZSA9IHR5cGU7XG4gICAgICAgICAgbGFzdFRpY2tzID0gdGlja3M7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgICAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgICAgIF9pdGVyYXRvcjIucmV0dXJuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vY29uc29sZS5jb3VudChldmVudHMubGVuZ3RoKVxuICAgICAgICBuZXdUcmFja3MucHVzaChuZXcgX3RyYWNrLlRyYWNrKHtcbiAgICAgICAgICBuYW1lOiB0cmFja05hbWUsXG4gICAgICAgICAgcGFydHM6IFtuZXcgX3BhcnQuUGFydCh7XG4gICAgICAgICAgICBldmVudHM6IGV2ZW50c1xuICAgICAgICAgIH0pXVxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBzb25nID0gbmV3IF9zb25nLlNvbmcoe1xuICAgIHBwcTogcHBxLFxuICAgIGJwbTogYnBtLFxuICAgIG5vbWluYXRvcjogbm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yOiBkZW5vbWluYXRvcixcbiAgICB0cmFja3M6IG5ld1RyYWNrcyxcbiAgICB0aW1lRXZlbnRzOiB0aW1lRXZlbnRzXG4gIH0pO1xuICAvL3NvbmcudXBkYXRlKClcbiAgcmV0dXJuIHNvbmc7XG59XG5cbmZ1bmN0aW9uIHNvbmdGcm9tTUlESUZpbGVTeW5jKGRhdGEpIHtcbiAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMV07XG5cbiAgdmFyIHNvbmcgPSBudWxsO1xuXG4gIGlmIChkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpIHtcbiAgICB2YXIgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgc29uZyA9IHRvU29uZygoMCwgX21pZGlmaWxlLnBhcnNlTUlESUZpbGUpKGJ1ZmZlciksIHNldHRpbmdzKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YS5oZWFkZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkYXRhLnRyYWNrcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBhIE1JREkgZmlsZSB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gcGFyc2VkXG4gICAgc29uZyA9IHRvU29uZyhkYXRhLCBzZXR0aW5ncyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYSBiYXNlNjQgZW5jb2RlZCBNSURJIGZpbGVcbiAgICBkYXRhID0gKDAsIF91dGlsLmJhc2U2NFRvQmluYXJ5KShkYXRhKTtcbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKSB7XG4gICAgICB2YXIgX2J1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgc29uZyA9IHRvU29uZygoMCwgX21pZGlmaWxlLnBhcnNlTUlESUZpbGUpKF9idWZmZXIpLCBzZXR0aW5ncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3dyb25nIGRhdGEnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc29uZztcbiAgLy8ge1xuICAvLyAgIHBwcSA9IG5ld1BQUSxcbiAgLy8gICBicG0gPSBuZXdCUE0sXG4gIC8vICAgcGxheWJhY2tTcGVlZCA9IG5ld1BsYXliYWNrU3BlZWQsXG4gIC8vIH0gPSBzZXR0aW5nc1xufVxuXG5mdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlKHVybCkge1xuICB2YXIgc2V0dGluZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIC8vIGZldGNoKHVybCwge1xuICAgIC8vICAgbW9kZTogJ25vLWNvcnMnXG4gICAgLy8gfSlcbiAgICAoMCwgX2lzb21vcnBoaWNGZXRjaDIuZGVmYXVsdCkodXJsKS50aGVuKF9mZXRjaF9oZWxwZXJzLnN0YXR1cykudGhlbihfZmV0Y2hfaGVscGVycy5hcnJheUJ1ZmZlcikudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgcmVzb2x2ZShzb25nRnJvbU1JRElGaWxlU3luYyhkYXRhLCBzZXR0aW5ncykpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICByZWplY3QoZSk7XG4gICAgfSk7XG4gIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuVHJhY2sgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcGFydCA9IHJlcXVpcmUoJy4vcGFydCcpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF9taWRpX25vdGUgPSByZXF1aXJlKCcuL21pZGlfbm90ZScpO1xuXG52YXIgX2luaXRfbWlkaSA9IHJlcXVpcmUoJy4vaW5pdF9taWRpJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9xYW1iaSA9IHJlcXVpcmUoJy4vcWFtYmknKTtcblxudmFyIF9ldmVudGxpc3RlbmVyID0gcmVxdWlyZSgnLi9ldmVudGxpc3RlbmVyJyk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgemVyb1ZhbHVlID0gMC4wMDAwMDAwMDAwMDAwMDAwMTtcbnZhciBpbnN0YW5jZUluZGV4ID0gMDtcblxudmFyIFRyYWNrID0gZXhwb3J0cy5UcmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gVHJhY2soKSB7XG4gICAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVHJhY2spO1xuXG4gICAgdGhpcy5pZCA9IHRoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLm5hbWUsIHRoaXMuY2hhbm5lbCwgdGhpcy5tdXRlZCwgdGhpcy52b2x1bWUpXG5cbiAgICB2YXIgX3NldHRpbmdzJG5hbWUgPSBzZXR0aW5ncy5uYW1lO1xuICAgIHRoaXMubmFtZSA9IF9zZXR0aW5ncyRuYW1lID09PSB1bmRlZmluZWQgPyB0aGlzLmlkIDogX3NldHRpbmdzJG5hbWU7XG4gICAgdmFyIF9zZXR0aW5ncyRjaGFubmVsID0gc2V0dGluZ3MuY2hhbm5lbDtcbiAgICB0aGlzLmNoYW5uZWwgPSBfc2V0dGluZ3MkY2hhbm5lbCA9PT0gdW5kZWZpbmVkID8gMCA6IF9zZXR0aW5ncyRjaGFubmVsO1xuICAgIHZhciBfc2V0dGluZ3MkbXV0ZWQgPSBzZXR0aW5ncy5tdXRlZDtcbiAgICB0aGlzLm11dGVkID0gX3NldHRpbmdzJG11dGVkID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IF9zZXR0aW5ncyRtdXRlZDtcbiAgICB2YXIgX3NldHRpbmdzJHZvbHVtZSA9IHNldHRpbmdzLnZvbHVtZTtcbiAgICB0aGlzLnZvbHVtZSA9IF9zZXR0aW5ncyR2b2x1bWUgPT09IHVuZGVmaW5lZCA/IDAuNSA6IF9zZXR0aW5ncyR2b2x1bWU7XG4gICAgdGhpcy5fcGFubmVyID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVQYW5uZXIoKTtcbiAgICB0aGlzLl9wYW5uZXIucGFubmluZ01vZGVsID0gJ2VxdWFscG93ZXInO1xuICAgIHRoaXMuX3Bhbm5lci5zZXRQb3NpdGlvbih6ZXJvVmFsdWUsIHplcm9WYWx1ZSwgemVyb1ZhbHVlKTtcbiAgICB0aGlzLl9nYWluTm9kZSA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZTtcbiAgICB0aGlzLl9wYW5uZXIuY29ubmVjdCh0aGlzLl9nYWluTm9kZSk7XG4gICAgLy90aGlzLl9nYWluTm9kZS5jb25uZWN0KHRoaXMuX3Bhbm5lcilcbiAgICB0aGlzLl9taWRpSW5wdXRzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX21pZGlPdXRwdXRzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3NvbmcgPSBudWxsO1xuICAgIHRoaXMuX3BhcnRzID0gW107XG4gICAgdGhpcy5fcGFydHNCeUlkID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2V2ZW50cyA9IFtdO1xuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2U7XG4gICAgdGhpcy5faW5zdHJ1bWVudCA9IG51bGw7XG4gICAgdGhpcy5fdG1wUmVjb3JkZWROb3RlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdO1xuICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXTtcbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZTtcbiAgICB0aGlzLm1vbml0b3IgPSBmYWxzZTtcbiAgICB0aGlzLl9zb25nR2Fpbk5vZGUgPSBudWxsO1xuICAgIHRoaXMuX2VmZmVjdHMgPSBbXTtcbiAgICB0aGlzLl9udW1FZmZlY3RzID0gMDtcblxuICAgIHZhciBwYXJ0cyA9IHNldHRpbmdzLnBhcnRzO1xuICAgIHZhciBpbnN0cnVtZW50ID0gc2V0dGluZ3MuaW5zdHJ1bWVudDtcblxuICAgIGlmICh0eXBlb2YgcGFydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmFkZFBhcnRzLmFwcGx5KHRoaXMsIF90b0NvbnN1bWFibGVBcnJheShwYXJ0cykpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGluc3RydW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLnNldEluc3RydW1lbnQoaW5zdHJ1bWVudCk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFRyYWNrLCBbe1xuICAgIGtleTogJ3NldEluc3RydW1lbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRJbnN0cnVtZW50KCkge1xuICAgICAgdmFyIGluc3RydW1lbnQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICBpZiAoaW5zdHJ1bWVudCAhPT0gbnVsbFxuICAgICAgLy8gY2hlY2sgaWYgdGhlIG1hbmRhdG9yeSBmdW5jdGlvbnMgb2YgYW4gaW5zdHJ1bWVudCBhcmUgcHJlc2VudCAoSW50ZXJmYWNlIEluc3RydW1lbnQpXG4gICAgICAgJiYgdHlwZW9mIGluc3RydW1lbnQuY29ubmVjdCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgaW5zdHJ1bWVudC5kaXNjb25uZWN0ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGluc3RydW1lbnQuYWxsTm90ZXNPZmYgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGluc3RydW1lbnQudW5zY2hlZHVsZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnJlbW92ZUluc3RydW1lbnQoKTtcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudCA9IGluc3RydW1lbnQ7XG4gICAgICAgIHRoaXMuX2luc3RydW1lbnQuY29ubmVjdCh0aGlzLl9wYW5uZXIpO1xuICAgICAgfSBlbHNlIGlmIChpbnN0cnVtZW50ID09PSBudWxsKSB7XG4gICAgICAgIC8vIGlmIHlvdSBwYXNzIG51bGwgYXMgYXJndW1lbnQgdGhlIGN1cnJlbnQgaW5zdHJ1bWVudCB3aWxsIGJlIHJlbW92ZWQsIHNhbWUgYXMgcmVtb3ZlSW5zdHJ1bWVudFxuICAgICAgICB0aGlzLnJlbW92ZUluc3RydW1lbnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIGluc3RydW1lbnQsIGFuZCBpbnN0cnVtZW50IHNob3VsZCBoYXZlIHRoZSBtZXRob2RzIFwiY29ubmVjdFwiLCBcImRpc2Nvbm5lY3RcIiwgXCJwcm9jZXNzTUlESUV2ZW50XCIsIFwidW5zY2hlZHVsZVwiIGFuZCBcImFsbE5vdGVzT2ZmXCInKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVJbnN0cnVtZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlSW5zdHJ1bWVudCgpIHtcbiAgICAgIGlmICh0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKTtcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudC5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMuX2luc3RydW1lbnQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEluc3RydW1lbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0cnVtZW50KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2luc3RydW1lbnQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY29ubmVjdE1JRElPdXRwdXRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29ubmVjdE1JRElPdXRwdXRzKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIG91dHB1dHMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgb3V0cHV0c1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgLy9jb25zb2xlLmxvZyhvdXRwdXRzKVxuICAgICAgb3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChvdXRwdXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvdXRwdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgb3V0cHV0ID0gKDAsIF9pbml0X21pZGkuZ2V0TUlESU91dHB1dEJ5SWQpKG91dHB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG91dHB1dCBpbnN0YW5jZW9mIE1JRElPdXRwdXQpIHtcbiAgICAgICAgICBfdGhpcy5fbWlkaU91dHB1dHMuc2V0KG91dHB1dC5pZCwgb3V0cHV0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlPdXRwdXRzKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Rpc2Nvbm5lY3RNSURJT3V0cHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc2Nvbm5lY3RNSURJT3V0cHV0cygpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIG91dHB1dHMgPSBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICBvdXRwdXRzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG5cbiAgICAgIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgICAgIGlmIChvdXRwdXRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5jbGVhcigpO1xuICAgICAgfVxuICAgICAgb3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgIGlmIChwb3J0IGluc3RhbmNlb2YgTUlESU91dHB1dCkge1xuICAgICAgICAgIHBvcnQgPSBwb3J0LmlkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfdGhpczIuX21pZGlPdXRwdXRzLmhhcyhwb3J0KSkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3JlbW92aW5nJywgdGhpcy5fbWlkaU91dHB1dHMuZ2V0KHBvcnQpLm5hbWUpXG4gICAgICAgICAgX3RoaXMyLl9taWRpT3V0cHV0cy5kZWxldGUocG9ydCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy90aGlzLl9taWRpT3V0cHV0cyA9IHRoaXMuX21pZGlPdXRwdXRzLmZpbHRlciguLi5vdXRwdXRzKVxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpT3V0cHV0cylcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb25uZWN0TUlESUlucHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbm5lY3RNSURJSW5wdXRzKCkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgaW5wdXRzID0gQXJyYXkoX2xlbjMpLCBfa2V5MyA9IDA7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcbiAgICAgICAgaW5wdXRzW19rZXkzXSA9IGFyZ3VtZW50c1tfa2V5M107XG4gICAgICB9XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlucHV0ID0gKDAsIF9pbml0X21pZGkuZ2V0TUlESUlucHV0QnlJZCkoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIE1JRElJbnB1dCkge1xuXG4gICAgICAgICAgX3RoaXMzLl9taWRpSW5wdXRzLnNldChpbnB1dC5pZCwgaW5wdXQpO1xuXG4gICAgICAgICAgaW5wdXQub25taWRpbWVzc2FnZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMzLm1vbml0b3IgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyguLi5lLmRhdGEpXG4gICAgICAgICAgICAgIF90aGlzMy5fcHJlcHJvY2Vzc01JRElFdmVudChuZXcgKEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmFwcGx5KF9taWRpX2V2ZW50Lk1JRElFdmVudCwgW251bGxdLmNvbmNhdChbX3RoaXMzLl9zb25nLl90aWNrc10sIF90b0NvbnN1bWFibGVBcnJheShlLmRhdGEpKSkpKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICAgIH1cblxuICAgIC8vIHlvdSBjYW4gcGFzcyBib3RoIHBvcnQgYW5kIHBvcnQgaWRzXG5cbiAgfSwge1xuICAgIGtleTogJ2Rpc2Nvbm5lY3RNSURJSW5wdXRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzY29ubmVjdE1JRElJbnB1dHMoKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbjQgPSBhcmd1bWVudHMubGVuZ3RoLCBpbnB1dHMgPSBBcnJheShfbGVuNCksIF9rZXk0ID0gMDsgX2tleTQgPCBfbGVuNDsgX2tleTQrKykge1xuICAgICAgICBpbnB1dHNbX2tleTRdID0gYXJndW1lbnRzW19rZXk0XTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlucHV0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fbWlkaUlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgICAgcG9ydC5vbm1pZGltZXNzYWdlID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuY2xlYXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgICAgaWYgKHBvcnQgaW5zdGFuY2VvZiBNSURJSW5wdXQpIHtcbiAgICAgICAgICBwb3J0ID0gcG9ydC5pZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3RoaXM0Ll9taWRpSW5wdXRzLmhhcyhwb3J0KSkge1xuICAgICAgICAgIF90aGlzNC5fbWlkaUlucHV0cy5nZXQocG9ydCkub25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgICAgICAgX3RoaXM0Ll9taWRpSW5wdXRzLmRlbGV0ZShwb3J0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvL3RoaXMuX21pZGlPdXRwdXRzID0gdGhpcy5fbWlkaU91dHB1dHMuZmlsdGVyKC4uLm91dHB1dHMpXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlJbnB1dHMpXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0TUlESUlucHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldE1JRElJbnB1dHMoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9taWRpSW5wdXRzLnZhbHVlcygpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRNSURJT3V0cHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldE1JRElPdXRwdXRzKCkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFJlY29yZEVuYWJsZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRSZWNvcmRFbmFibGVkKHR5cGUpIHtcbiAgICAgIC8vICdtaWRpJywgJ2F1ZGlvJywgZW1wdHkgb3IgYW55dGhpbmcgd2lsbCBkaXNhYmxlIHJlY29yZGluZ1xuICAgICAgdGhpcy5fcmVjb3JkRW5hYmxlZCA9IHR5cGU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX3N0YXJ0UmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3N0YXJ0UmVjb3JkaW5nKHJlY29yZElkKSB7XG4gICAgICBpZiAodGhpcy5fcmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2cocmVjb3JkSWQpXG4gICAgICAgIHRoaXMuX3JlY29yZElkID0gcmVjb3JkSWQ7XG4gICAgICAgIHRoaXMuX3JlY29yZGVkRXZlbnRzID0gW107XG4gICAgICAgIHRoaXMuX3JlY29yZFBhcnQgPSBuZXcgX3BhcnQuUGFydCh0aGlzLl9yZWNvcmRJZCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX3N0b3BSZWNvcmRpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfc3RvcFJlY29yZGluZyhyZWNvcmRJZCkge1xuICAgICAgdmFyIF9yZWNvcmRQYXJ0O1xuXG4gICAgICBpZiAodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9yZWNvcmRlZEV2ZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgKF9yZWNvcmRQYXJ0ID0gdGhpcy5fcmVjb3JkUGFydCkuYWRkRXZlbnRzLmFwcGx5KF9yZWNvcmRQYXJ0LCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fcmVjb3JkZWRFdmVudHMpKTtcbiAgICAgIC8vdGhpcy5fc29uZy5fbmV3RXZlbnRzLnB1c2goLi4udGhpcy5fcmVjb3JkZWRFdmVudHMpXG4gICAgICB0aGlzLmFkZFBhcnRzKHRoaXMuX3JlY29yZFBhcnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VuZG9SZWNvcmRpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1bmRvUmVjb3JkaW5nKHJlY29yZElkKSB7XG4gICAgICBpZiAodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVtb3ZlUGFydHModGhpcy5fcmVjb3JkUGFydCk7XG4gICAgICAvL3RoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZWRvUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVkb1JlY29yZGluZyhyZWNvcmRJZCkge1xuICAgICAgaWYgKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmFkZFBhcnRzKHRoaXMuX3JlY29yZFBhcnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvcHknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb3B5KCkge1xuICAgICAgdmFyIHQgPSBuZXcgVHJhY2sodGhpcy5uYW1lICsgJ19jb3B5Jyk7IC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgICAgdGhpcy5fcGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICB2YXIgY29weSA9IHBhcnQuY29weSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhjb3B5KTtcbiAgICAgICAgcGFydHMucHVzaChjb3B5KTtcbiAgICAgIH0pO1xuICAgICAgdC5hZGRQYXJ0cy5hcHBseSh0LCBwYXJ0cyk7XG4gICAgICB0LnVwZGF0ZSgpO1xuICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndHJhbnNwb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdHJhbnNwb3NlKGFtb3VudCkge1xuICAgICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnRyYW5zcG9zZShhbW91bnQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWRkUGFydHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRQYXJ0cygpIHtcbiAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICB2YXIgc29uZyA9IHRoaXMuX3Nvbmc7XG5cbiAgICAgIGZvciAodmFyIF9sZW41ID0gYXJndW1lbnRzLmxlbmd0aCwgcGFydHMgPSBBcnJheShfbGVuNSksIF9rZXk1ID0gMDsgX2tleTUgPCBfbGVuNTsgX2tleTUrKykge1xuICAgICAgICBwYXJ0c1tfa2V5NV0gPSBhcmd1bWVudHNbX2tleTVdO1xuICAgICAgfVxuXG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHZhciBfZXZlbnRzO1xuXG4gICAgICAgIHBhcnQuX3RyYWNrID0gX3RoaXM1O1xuICAgICAgICBfdGhpczUuX3BhcnRzLnB1c2gocGFydCk7XG4gICAgICAgIF90aGlzNS5fcGFydHNCeUlkLnNldChwYXJ0LmlkLCBwYXJ0KTtcblxuICAgICAgICB2YXIgZXZlbnRzID0gcGFydC5fZXZlbnRzO1xuICAgICAgICAoX2V2ZW50cyA9IF90aGlzNS5fZXZlbnRzKS5wdXNoLmFwcGx5KF9ldmVudHMsIF90b0NvbnN1bWFibGVBcnJheShldmVudHMpKTtcblxuICAgICAgICBpZiAoc29uZykge1xuICAgICAgICAgIHZhciBfc29uZyRfbmV3RXZlbnRzO1xuXG4gICAgICAgICAgcGFydC5fc29uZyA9IHNvbmc7XG4gICAgICAgICAgc29uZy5fbmV3UGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgICAoX3NvbmckX25ld0V2ZW50cyA9IHNvbmcuX25ld0V2ZW50cykucHVzaC5hcHBseShfc29uZyRfbmV3RXZlbnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoZXZlbnRzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBldmVudC5fdHJhY2sgPSBfdGhpczU7XG4gICAgICAgICAgaWYgKHNvbmcpIHtcbiAgICAgICAgICAgIGV2ZW50Ll9zb25nID0gc29uZztcbiAgICAgICAgICB9XG4gICAgICAgICAgX3RoaXM1Ll9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZVBhcnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlUGFydHMoKSB7XG4gICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgdmFyIHNvbmcgPSB0aGlzLl9zb25nO1xuXG4gICAgICBmb3IgKHZhciBfbGVuNiA9IGFyZ3VtZW50cy5sZW5ndGgsIHBhcnRzID0gQXJyYXkoX2xlbjYpLCBfa2V5NiA9IDA7IF9rZXk2IDwgX2xlbjY7IF9rZXk2KyspIHtcbiAgICAgICAgcGFydHNbX2tleTZdID0gYXJndW1lbnRzW19rZXk2XTtcbiAgICAgIH1cblxuICAgICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBwYXJ0Ll90cmFjayA9IG51bGw7XG4gICAgICAgIF90aGlzNi5fcGFydHNCeUlkLmRlbGV0ZShwYXJ0LmlkLCBwYXJ0KTtcblxuICAgICAgICB2YXIgZXZlbnRzID0gcGFydC5fZXZlbnRzO1xuXG4gICAgICAgIGlmIChzb25nKSB7XG4gICAgICAgICAgdmFyIF9zb25nJF9yZW1vdmVkRXZlbnRzO1xuXG4gICAgICAgICAgc29uZy5fcmVtb3ZlZFBhcnRzLnB1c2gocGFydCk7XG4gICAgICAgICAgKF9zb25nJF9yZW1vdmVkRXZlbnRzID0gc29uZy5fcmVtb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfcmVtb3ZlZEV2ZW50cywgX3RvQ29uc3VtYWJsZUFycmF5KGV2ZW50cykpO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbDtcbiAgICAgICAgICBpZiAoc29uZykge1xuICAgICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfdGhpczYuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBhcnRzKCkge1xuICAgICAgaWYgKHRoaXMuX25lZWRzVXBkYXRlKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpO1xuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fcGFydHMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0cmFuc3Bvc2VQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRyYW5zcG9zZVBhcnRzKGFtb3VudCkge1xuICAgICAgZm9yICh2YXIgX2xlbjcgPSBhcmd1bWVudHMubGVuZ3RoLCBwYXJ0cyA9IEFycmF5KF9sZW43ID4gMSA/IF9sZW43IC0gMSA6IDApLCBfa2V5NyA9IDE7IF9rZXk3IDwgX2xlbjc7IF9rZXk3KyspIHtcbiAgICAgICAgcGFydHNbX2tleTcgLSAxXSA9IGFyZ3VtZW50c1tfa2V5N107XG4gICAgICB9XG5cbiAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgcGFydC50cmFuc3Bvc2UoYW1vdW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVQYXJ0cyh0aWNrcykge1xuICAgICAgZm9yICh2YXIgX2xlbjggPSBhcmd1bWVudHMubGVuZ3RoLCBwYXJ0cyA9IEFycmF5KF9sZW44ID4gMSA/IF9sZW44IC0gMSA6IDApLCBfa2V5OCA9IDE7IF9rZXk4IDwgX2xlbjg7IF9rZXk4KyspIHtcbiAgICAgICAgcGFydHNbX2tleTggLSAxXSA9IGFyZ3VtZW50c1tfa2V5OF07XG4gICAgICB9XG5cbiAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgcGFydC5tb3ZlKHRpY2tzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVQYXJ0c1RvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZVBhcnRzVG8odGlja3MpIHtcbiAgICAgIGZvciAodmFyIF9sZW45ID0gYXJndW1lbnRzLmxlbmd0aCwgcGFydHMgPSBBcnJheShfbGVuOSA+IDEgPyBfbGVuOSAtIDEgOiAwKSwgX2tleTkgPSAxOyBfa2V5OSA8IF9sZW45OyBfa2V5OSsrKSB7XG4gICAgICAgIHBhcnRzW19rZXk5IC0gMV0gPSBhcmd1bWVudHNbX2tleTldO1xuICAgICAgfVxuXG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHBhcnQubW92ZVRvKHRpY2tzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKlxuICAgICAgYWRkRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgICAgIGxldCBwID0gbmV3IFBhcnQoKVxuICAgICAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgICAgIHRoaXMuYWRkUGFydHMocClcbiAgICAgIH1cbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudHMoKSB7XG4gICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgdmFyIHBhcnRzID0gbmV3IFNldCgpO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMTAgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuMTApLCBfa2V5MTAgPSAwOyBfa2V5MTAgPCBfbGVuMTA7IF9rZXkxMCsrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5MTBdID0gYXJndW1lbnRzW19rZXkxMF07XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBwYXJ0cy5zZXQoZXZlbnQuX3BhcnQpO1xuICAgICAgICBldmVudC5fcGFydCA9IG51bGw7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGw7XG4gICAgICAgIGV2ZW50Ll9zb25nID0gbnVsbDtcbiAgICAgICAgX3RoaXM3Ll9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZCk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfcmVtb3ZlZEV2ZW50czIsIF9zb25nJF9jaGFuZ2VkUGFydHM7XG5cbiAgICAgICAgKF9zb25nJF9yZW1vdmVkRXZlbnRzMiA9IHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX3JlbW92ZWRFdmVudHMyLCBldmVudHMpO1xuICAgICAgICAoX3NvbmckX2NoYW5nZWRQYXJ0cyA9IHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cykucHVzaC5hcHBseShfc29uZyRfY2hhbmdlZFBhcnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZUV2ZW50cyh0aWNrcykge1xuICAgICAgdmFyIHBhcnRzID0gbmV3IFNldCgpO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMTEgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuMTEgPiAxID8gX2xlbjExIC0gMSA6IDApLCBfa2V5MTEgPSAxOyBfa2V5MTEgPCBfbGVuMTE7IF9rZXkxMSsrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5MTEgLSAxXSA9IGFyZ3VtZW50c1tfa2V5MTFdO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQubW92ZSh0aWNrcyk7XG4gICAgICAgIHBhcnRzLnNldChldmVudC5wYXJ0KTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMuX3NvbmcpIHtcbiAgICAgICAgdmFyIF9zb25nJF9tb3ZlZEV2ZW50cywgX3NvbmckX2NoYW5nZWRQYXJ0czI7XG5cbiAgICAgICAgKF9zb25nJF9tb3ZlZEV2ZW50cyA9IHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9tb3ZlZEV2ZW50cywgZXZlbnRzKTtcbiAgICAgICAgKF9zb25nJF9jaGFuZ2VkUGFydHMyID0gdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzKS5wdXNoLmFwcGx5KF9zb25nJF9jaGFuZ2VkUGFydHMyLCBfdG9Db25zdW1hYmxlQXJyYXkoQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKSk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZUV2ZW50c1RvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZUV2ZW50c1RvKHRpY2tzKSB7XG4gICAgICB2YXIgcGFydHMgPSBuZXcgU2V0KCk7XG5cbiAgICAgIGZvciAodmFyIF9sZW4xMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW4xMiA+IDEgPyBfbGVuMTIgLSAxIDogMCksIF9rZXkxMiA9IDE7IF9rZXkxMiA8IF9sZW4xMjsgX2tleTEyKyspIHtcbiAgICAgICAgZXZlbnRzW19rZXkxMiAtIDFdID0gYXJndW1lbnRzW19rZXkxMl07XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5tb3ZlVG8odGlja3MpO1xuICAgICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydCk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHMyLCBfc29uZyRfY2hhbmdlZFBhcnRzMztcblxuICAgICAgICAoX3NvbmckX21vdmVkRXZlbnRzMiA9IHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9tb3ZlZEV2ZW50czIsIGV2ZW50cyk7XG4gICAgICAgIChfc29uZyRfY2hhbmdlZFBhcnRzMyA9IHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cykucHVzaC5hcHBseShfc29uZyRfY2hhbmdlZFBhcnRzMywgX3RvQ29uc3VtYWJsZUFycmF5KEFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSkpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50cygpIHtcbiAgICAgIHZhciBmaWx0ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuICAgICAgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgICBpZiAodGhpcy5fbmVlZHNVcGRhdGUpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpOyAvL0BUT0RPIGltcGxlbWVudCBmaWx0ZXIgLT4gZmlsdGVyRXZlbnRzKCkgc2hvdWxkIGJlIGEgdXRpbGl0eSBmdW5jdGlvbiAobm90IGEgY2xhc3MgbWV0aG9kKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ211dGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtdXRlKCkge1xuICAgICAgdmFyIGZsYWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICBpZiAoZmxhZykge1xuICAgICAgICB0aGlzLl9tdXRlZCA9IGZsYWc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9tdXRlZCA9ICF0aGlzLl9tdXRlZDtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAvLyB5b3Ugc2hvdWxkIG9ubHkgdXNlIHRoaXMgaW4gaHVnZSBzb25ncyAoPjEwMCB0cmFja3MpXG4gICAgICBpZiAodGhpcy5fY3JlYXRlRXZlbnRBcnJheSkge1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpO1xuICAgICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICAoMCwgX3V0aWwuc29ydEV2ZW50cykodGhpcy5fZXZlbnRzKTtcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX2NoZWNrRWZmZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2NoZWNrRWZmZWN0KGVmZmVjdCkge1xuICAgICAgaWYgKGVmZmVjdC5pbnB1dCBpbnN0YW5jZW9mIEF1ZGlvTm9kZSA9PT0gZmFsc2UgfHwgZWZmZWN0Lm91dHB1dCBpbnN0YW5jZW9mIEF1ZGlvTm9kZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0EgY2hhbm5lbCBmeCBzaG91bGQgaGF2ZSBhbiBpbnB1dCBhbmQgYW4gb3V0cHV0IGltcGxlbWVudGluZyB0aGUgaW50ZXJmYWNlIEF1ZGlvTm9kZScpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyByb3V0aW5nOiBhdWRpb3NvdXJjZSAtPiBwYW5uaW5nIC0+IHRyYWNrIG91dHB1dCAtPiBbLi4uZWZmZWN0XSAtPiBzb25nIGlucHV0XG5cbiAgfSwge1xuICAgIGtleTogJ2luc2VydEVmZmVjdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluc2VydEVmZmVjdChlZmZlY3QpIHtcblxuICAgICAgaWYgKHRoaXMuX2NoZWNrRWZmZWN0KGVmZmVjdCkgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHByZXZFZmZlY3QgPSB2b2lkIDA7XG5cbiAgICAgIGlmICh0aGlzLl9udW1FZmZlY3RzID09PSAwKSB7XG4gICAgICAgIHRoaXMuX2dhaW5Ob2RlLmRpc2Nvbm5lY3QodGhpcy5fc29uZ0dhaW5Ob2RlKTtcbiAgICAgICAgdGhpcy5fZ2Fpbk5vZGUuY29ubmVjdChlZmZlY3QuaW5wdXQpO1xuICAgICAgICBlZmZlY3Qub3V0cHV0LmNvbm5lY3QodGhpcy5fc29uZ0dhaW5Ob2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByZXZFZmZlY3QgPSB0aGlzLl9lZmZlY3RzW3RoaXMuX251bUVmZmVjdHMgLSAxXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwcmV2RWZmZWN0Lm91dHB1dC5kaXNjb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvL0Nocm9tZSB0aHJvd3MgYW4gZXJyb3IgaGVyZSB3aGljaCBpcyB3cm9uZ1xuICAgICAgICB9XG4gICAgICAgIHByZXZFZmZlY3Qub3V0cHV0LmNvbm5lY3QoZWZmZWN0LmlucHV0KTtcbiAgICAgICAgZWZmZWN0Lm91dHB1dC5jb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VmZmVjdHMucHVzaChlZmZlY3QpO1xuICAgICAgdGhpcy5fbnVtRWZmZWN0cysrO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2luc2VydEVmZmVjdEF0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5zZXJ0RWZmZWN0QXQoZWZmZWN0LCBpbmRleCkge1xuICAgICAgaWYgKHRoaXMuX2NoZWNrRWZmZWN0KGVmZmVjdCkgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBwcmV2RWZmZWN0ID0gdGhpcy5fZWZmZWN0c1tpbmRleCAtIDFdO1xuICAgICAgdmFyIG5leHRFZmZlY3QgPSB2b2lkIDA7XG5cbiAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5fbnVtRWZmZWN0cykge1xuICAgICAgICBwcmV2RWZmZWN0Lm91dHB1dC5kaXNjb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICAgIHByZXZFZmZlY3Qub3V0cHV0LmNvbm5lY3QoZWZmZWN0LmlucHV0KTtcbiAgICAgICAgZWZmZWN0LmlucHV0LmNvbm5lY3QodGhpcy5fc29uZ0dhaW5Ob2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRFZmZlY3QgPSB0aGlzLl9lZmZlY3RzW2luZGV4XTtcbiAgICAgICAgcHJldkVmZmVjdC5vdXRwdXQuZGlzY29ubmVjdChuZXh0RWZmZWN0LmlucHV0KTtcbiAgICAgICAgcHJldkVmZmVjdC5vdXRwdXQuY29ubmVjdChlZmZlY3QuaW5wdXQpO1xuICAgICAgICBlZmZlY3Qub3V0cHV0LmNvbm5lY3QobmV4dEVmZmVjdC5pbnB1dCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9lZmZlY3RzLnNwbGljZShpbmRleCwgMCwgZWZmZWN0KTtcbiAgICAgIHRoaXMuX251bUVmZmVjdHMrKztcbiAgICB9XG5cbiAgICAvL3JlbW92ZUVmZmVjdChlZmZlY3Q6IEVmZmVjdCl7XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFZmZlY3QnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFZmZlY3QoZWZmZWN0KSB7XG4gICAgICBpZiAodGhpcy5fY2hlY2tFZmZlY3QoZWZmZWN0KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgaSA9IHZvaWQgMDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLl9udW1FZmZlY3RzOyBpKyspIHtcbiAgICAgICAgdmFyIGZ4ID0gdGhpcy5fZWZmZWN0c1tpXTtcbiAgICAgICAgaWYgKGVmZmVjdCA9PT0gZngpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5yZW1vdmVFZmZlY3RBdChpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFZmZlY3RBdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUVmZmVjdEF0KGluZGV4KSB7XG4gICAgICBpZiAoaXNOYU4oaW5kZXgpIHx8IHRoaXMuX251bUVmZmVjdHMgPT09IDAgfHwgaW5kZXggPj0gdGhpcy5fbnVtRWZmZWN0cykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgZWZmZWN0ID0gdGhpcy5fZWZmZWN0c1tpbmRleF07XG4gICAgICB2YXIgbmV4dEVmZmVjdCA9IHZvaWQgMDtcbiAgICAgIHZhciBwcmV2RWZmZWN0ID0gdm9pZCAwO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKGluZGV4LCB0aGlzLl9lZmZlY3RzKVxuXG4gICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgLy8gd2UgcmVtb3ZlIHRoZSBmaXJzdCBlZmZlY3QsIHNvIGRpc2Nvbm5lY3QgZnJvbSBvdXRwdXQgb2YgdHJhY2tcbiAgICAgICAgdGhpcy5fZ2Fpbk5vZGUuZGlzY29ubmVjdChlZmZlY3QuaW5wdXQpO1xuXG4gICAgICAgIGlmICh0aGlzLl9udW1FZmZlY3RzID09PSAxKSB7XG4gICAgICAgICAgLy8gbm8gZWZmZWN0cyBhbnltb3JlLCBzbyBjb25uZWN0IG91dHB1dCBvZiB0cmFjayB0byBpbnB1dCBvZiB0aGUgc29uZ1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBlZmZlY3Qub3V0cHV0LmRpc2Nvbm5lY3QodGhpcy5fc29uZ0dhaW5Ob2RlKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvL0Nocm9tZSB0aHJvd3MgYW4gZXJyb3IgaGVyZSB3aGljaCBpcyB3cm9uZ1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9nYWluTm9kZS5jb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gZGlzY29ubmVjdCB0aGUgcmVtb3ZlZCBlZmZlY3QgZnJvbSB0aGUgbmV4dCBlZmZlY3QgaW4gdGhlIGNoYWluLCB0aGlzIGlzIG5vdyB0aGUgZmlyc3QgZWZmZWN0IGluIHRoZSBjaGFpbi4uLlxuICAgICAgICAgIG5leHRFZmZlY3QgPSB0aGlzLl9lZmZlY3RzW2luZGV4ICsgMV07XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGVmZmVjdC5vdXRwdXQuZGlzY29ubmVjdChuZXh0RWZmZWN0LmlucHV0KTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgIC8vQ2hyb21lIHRocm93cyBhbiBlcnJvciBoZXJlIHdoaWNoIGlzIHdyb25nXG5cbiAgICAgICAgICAvLyAuLi4gc28gY29ubmVjdCB0aGUgb3V0cHV0IG9mIHRoZSB0cmFjayB0byB0aGUgaW5wdXQgb2YgdGhpcyBlZmZlY3RcbiAgICAgICAgICB0aGlzLl9nYWluTm9kZS5jb25uZWN0KG5leHRFZmZlY3QuaW5wdXQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHByZXZFZmZlY3QgPSB0aGlzLl9lZmZlY3RzW2luZGV4IC0gMV07XG4gICAgICAgIC8vY29uc29sZS5sb2cocHJldkVmZmVjdClcbiAgICAgICAgLy8gZGlzY29ubmVjdCB0aGUgcmVtb3ZlZCBlZmZlY3QgZnJvbSB0aGUgcHJldmlvdXMgZWZmZWN0IGluIHRoZSBjaGFpblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHByZXZFZmZlY3Qub3V0cHV0LmRpc2Nvbm5lY3QoZWZmZWN0LmlucHV0KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vQ2hyb21lIHRocm93cyBhbiBlcnJvciBoZXJlIHdoaWNoIGlzIHdyb25nXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5kZXggPT09IHRoaXMuX251bUVmZmVjdHMgLSAxKSB7XG4gICAgICAgICAgLy8gd2UgcmVtb3ZlIHRoZSBsYXN0IGVmZmVjdCBpbiB0aGUgY2hhaW4sIHNvIGRpc2Nvbm5lY3QgZnJvbSB0aGUgaW5wdXQgb2YgdGhlIHNvbmdcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZWZmZWN0Lm91dHB1dC5kaXNjb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAvL0Nocm9tZSB0aHJvd3MgYW4gZXJyb3IgaGVyZSB3aGljaCBpcyB3cm9uZ1xuXG4gICAgICAgICAgLy8gdGhlIHByZXZpb3VzIGVmZmVjdCBpcyBub3cgdGhlIGxhc3QgZWZmZWN0IHRvIGNvbm5lY3QgaXQgdG8gdGhlIGlucHV0IG9mIHRoZSBzb25nXG4gICAgICAgICAgcHJldkVmZmVjdC5vdXRwdXQuY29ubmVjdCh0aGlzLl9zb25nR2Fpbk5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGRpc2Nvbm5lY3QgdGhlIGVmZmVjdCBmcm9tIHRoZSBuZXh0IGVmZmVjdCBpbiB0aGUgY2hhaW5cbiAgICAgICAgICBuZXh0RWZmZWN0ID0gdGhpcy5fZWZmZWN0c1tpbmRleF07XG4gICAgICAgICAgZWZmZWN0Lm91dHB1dC5kaXNjb25uZWN0KG5leHRFZmZlY3QuaW5wdXQpO1xuICAgICAgICAgIC8vIGNvbm5lY3QgdGhlIHByZXZpb3VzIGVmZmVjdCB0byB0aGUgbmV4dCBlZmZlY3RcbiAgICAgICAgICBwcmV2RWZmZWN0Lm91dHB1dC5jb25uZWN0KG5leHRFZmZlY3QuaW5wdXQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VmZmVjdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHRoaXMuX251bUVmZmVjdHMtLTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFZmZlY3RzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RWZmZWN0cygpIHtcbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2VmZmVjdHMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFZmZlY3RBdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEVmZmVjdEF0KGluZGV4KSB7XG4gICAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2VmZmVjdHNbaW5kZXhdO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldE91dHB1dCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldE91dHB1dCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nYWluTm9kZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRJbnB1dCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldElucHV0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NvbmdHYWluTm9kZTtcbiAgICB9XG5cbiAgICAvLyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gYSBNSURJIGV2ZW50cyBpcyBzZW5kIGJ5IGFuIGV4dGVybmFsIG9yIG9uLXNjcmVlbiBrZXlib2FyZFxuXG4gIH0sIHtcbiAgICBrZXk6ICdfcHJlcHJvY2Vzc01JRElFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9wcmVwcm9jZXNzTUlESUV2ZW50KG1pZGlFdmVudCkge1xuICAgICAgdmFyIHRpbWUgPSBfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMDtcbiAgICAgIG1pZGlFdmVudC50aW1lID0gdGltZTtcbiAgICAgIG1pZGlFdmVudC50aW1lMiA9IDA7IC8vcGVyZm9ybWFuY2Uubm93KCkgLT4gcGFzc2luZyAwIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXMgcGVyZm9ybWFuY2Uubm93KCkgc28gd2UgY2hvb3NlIHRoZSBmb3JtZXJcbiAgICAgIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSB0aW1lO1xuICAgICAgdmFyIG5vdGUgPSB2b2lkIDA7XG5cbiAgICAgIGlmIChtaWRpRXZlbnQudHlwZSA9PT0gX3FhbWJpLk1JRElFdmVudFR5cGVzLk5PVEVfT04pIHtcbiAgICAgICAgbm90ZSA9IG5ldyBfbWlkaV9ub3RlLk1JRElOb3RlKG1pZGlFdmVudCk7XG4gICAgICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMuc2V0KG1pZGlFdmVudC5kYXRhMSwgbm90ZSk7XG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgdHlwZTogJ25vdGVPbicsXG4gICAgICAgICAgZGF0YTogbWlkaUV2ZW50XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChtaWRpRXZlbnQudHlwZSA9PT0gX3FhbWJpLk1JRElFdmVudFR5cGVzLk5PVEVfT0ZGKSB7XG4gICAgICAgIG5vdGUgPSB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmdldChtaWRpRXZlbnQuZGF0YTEpO1xuICAgICAgICBpZiAodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG5vdGUuYWRkTm90ZU9mZihtaWRpRXZlbnQpO1xuICAgICAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmRlbGV0ZShtaWRpRXZlbnQuZGF0YTEpO1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgIHR5cGU6ICdub3RlT2ZmJyxcbiAgICAgICAgICBkYXRhOiBtaWRpRXZlbnRcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9yZWNvcmRFbmFibGVkID09PSAnbWlkaScgJiYgdGhpcy5fc29uZy5yZWNvcmRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5fcmVjb3JkZWRFdmVudHMucHVzaChtaWRpRXZlbnQpO1xuICAgICAgfVxuICAgICAgdGhpcy5wcm9jZXNzTUlESUV2ZW50KG1pZGlFdmVudCk7XG4gICAgfVxuXG4gICAgLy8gbWV0aG9kIGlzIGNhbGxlZCBieSBzY2hlZHVsZXIgZHVyaW5nIHBsYXliYWNrXG5cbiAgfSwge1xuICAgIGtleTogJ3Byb2Nlc3NNSURJRXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzTUlESUV2ZW50KGV2ZW50KSB7XG5cbiAgICAgIGlmICh0eXBlb2YgZXZlbnQudGltZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5fcHJlcHJvY2Vzc01JRElFdmVudChldmVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gc2VuZCB0byBqYXZhc2NyaXB0IGluc3RydW1lbnRcbiAgICAgIGlmICh0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5uYW1lLCBldmVudClcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KGV2ZW50KTtcbiAgICAgIH1cblxuICAgICAgLy8gc2VuZCB0byBleHRlcm5hbCBoYXJkd2FyZSBvciBzb2Z0d2FyZSBpbnN0cnVtZW50XG4gICAgICB0aGlzLl9zZW5kVG9FeHRlcm5hbE1JRElPdXRwdXRzKGV2ZW50KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfc2VuZFRvRXh0ZXJuYWxNSURJT3V0cHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zZW5kVG9FeHRlcm5hbE1JRElPdXRwdXRzKGV2ZW50KSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnRpbWUsIGV2ZW50Lm1pbGxpcylcbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0aGlzLl9taWRpT3V0cHV0cy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgcG9ydCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHBvcnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5kYXRhMiAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCBldmVudC50aW1lMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExXSwgZXZlbnQudGltZTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYoZXZlbnQudHlwZSA9PT0gMTI4IHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgICAgICAgLy8gICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMl0sIGV2ZW50LnRpbWUgKyBsYXRlbmN5KVxuICAgICAgICAgICAgLy8gfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTkyIHx8IGV2ZW50LnR5cGUgPT09IDIyNCl7XG4gICAgICAgICAgICAvLyAgIHBvcnQuc2VuZChbZXZlbnQudHlwZSwgZXZlbnQuZGF0YTFdLCBldmVudC50aW1lICsgbGF0ZW5jeSlcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3Vuc2NoZWR1bGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1bnNjaGVkdWxlKG1pZGlFdmVudCkge1xuXG4gICAgICBpZiAodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9pbnN0cnVtZW50LnVuc2NoZWR1bGUobWlkaUV2ZW50KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX21pZGlPdXRwdXRzLnNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobWlkaUV2ZW50LnR5cGUgPT09IDE0NCkge1xuICAgICAgICB2YXIgbWlkaU5vdGUgPSBtaWRpRXZlbnQubWlkaU5vdGU7XG4gICAgICAgIHZhciBub3RlT2ZmID0gbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCgwLCAxMjgsIG1pZGlFdmVudC5kYXRhMSwgMCk7XG4gICAgICAgIG5vdGVPZmYubWlkaU5vdGVJZCA9IG1pZGlOb3RlLmlkO1xuICAgICAgICBub3RlT2ZmLnRpbWUgPSBfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lO1xuICAgICAgICB0aGlzLl9zZW5kVG9FeHRlcm5hbE1JRElPdXRwdXRzKG5vdGVPZmYsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FsbE5vdGVzT2ZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWxsTm90ZXNPZmYoKSB7XG4gICAgICBpZiAodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGxldCB0aW1lU3RhbXAgPSAoY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApICsgdGhpcy5sYXRlbmN5XG4gICAgICAvLyBmb3IobGV0IG91dHB1dCBvZiB0aGlzLl9taWRpT3V0cHV0cy52YWx1ZXMoKSl7XG4gICAgICAvLyAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgLy8gICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gICAgICAvLyB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0UGFubmluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFBhbm5pbmcodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA8IC0xIHx8IHZhbHVlID4gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnVHJhY2suc2V0UGFubmluZygpIGFjY2VwdHMgYSB2YWx1ZSBiZXR3ZWVuIC0xIChmdWxsIGxlZnQpIGFuZCAxIChmdWxsIHJpZ2h0KSwgeW91IGVudGVyZWQ6JywgdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgeCA9IHZhbHVlO1xuICAgICAgdmFyIHkgPSAwO1xuICAgICAgdmFyIHogPSAxIC0gTWF0aC5hYnMoeCk7XG5cbiAgICAgIHggPSB4ID09PSAwID8gemVyb1ZhbHVlIDogeDtcbiAgICAgIHkgPSB5ID09PSAwID8gemVyb1ZhbHVlIDogeTtcbiAgICAgIHogPSB6ID09PSAwID8gemVyb1ZhbHVlIDogejtcblxuICAgICAgdGhpcy5fcGFubmVyLnNldFBvc2l0aW9uKHgsIHksIHopO1xuICAgICAgdGhpcy5fcGFubmluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0UGFubmluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBhbm5pbmcoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFubmluZ1ZhbHVlO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBUcmFjaztcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG5leHBvcnRzLmdldE5pY2VUaW1lID0gZ2V0TmljZVRpbWU7XG5leHBvcnRzLmJhc2U2NFRvQmluYXJ5ID0gYmFzZTY0VG9CaW5hcnk7XG5leHBvcnRzLnR5cGVTdHJpbmcgPSB0eXBlU3RyaW5nO1xuZXhwb3J0cy5zb3J0RXZlbnRzID0gc29ydEV2ZW50cztcbmV4cG9ydHMuY2hlY2tJZkJhc2U2NCA9IGNoZWNrSWZCYXNlNjQ7XG5leHBvcnRzLmdldEVxdWFsUG93ZXJDdXJ2ZSA9IGdldEVxdWFsUG93ZXJDdXJ2ZTtcbmV4cG9ydHMuY2hlY2tNSURJTnVtYmVyID0gY2hlY2tNSURJTnVtYmVyO1xuXG52YXIgX2lzb21vcnBoaWNGZXRjaCA9IHJlcXVpcmUoJ2lzb21vcnBoaWMtZmV0Y2gnKTtcblxudmFyIF9pc29tb3JwaGljRmV0Y2gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNvbW9ycGhpY0ZldGNoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIG1QSSA9IE1hdGguUEksXG4gICAgbVBvdyA9IE1hdGgucG93LFxuICAgIG1Sb3VuZCA9IE1hdGgucm91bmQsXG4gICAgbUZsb29yID0gTWF0aC5mbG9vcixcbiAgICBtUmFuZG9tID0gTWF0aC5yYW5kb207XG5cbmZ1bmN0aW9uIGdldE5pY2VUaW1lKG1pbGxpcykge1xuICB2YXIgaCA9IHZvaWQgMCxcbiAgICAgIG0gPSB2b2lkIDAsXG4gICAgICBzID0gdm9pZCAwLFxuICAgICAgbXMgPSB2b2lkIDAsXG4gICAgICBzZWNvbmRzID0gdm9pZCAwLFxuICAgICAgdGltZUFzU3RyaW5nID0gJyc7XG5cbiAgc2Vjb25kcyA9IG1pbGxpcyAvIDEwMDA7IC8vIOKGkiBtaWxsaXMgdG8gc2Vjb25kc1xuICBoID0gbUZsb29yKHNlY29uZHMgLyAoNjAgKiA2MCkpO1xuICBtID0gbUZsb29yKHNlY29uZHMgJSAoNjAgKiA2MCkgLyA2MCk7XG4gIHMgPSBtRmxvb3Ioc2Vjb25kcyAlIDYwKTtcbiAgbXMgPSBtUm91bmQoKHNlY29uZHMgLSBoICogMzYwMCAtIG0gKiA2MCAtIHMpICogMTAwMCk7XG5cbiAgdGltZUFzU3RyaW5nICs9IGggKyAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtIDwgMTAgPyAnMCcgKyBtIDogbTtcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IHMgPCAxMCA/ICcwJyArIHMgOiBzO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbXMgPT09IDAgPyAnMDAwJyA6IG1zIDwgMTAgPyAnMDAnICsgbXMgOiBtcyA8IDEwMCA/ICcwJyArIG1zIDogbXM7XG5cbiAgLy9jb25zb2xlLmxvZyhoLCBtLCBzLCBtcyk7XG4gIHJldHVybiB7XG4gICAgaG91cjogaCxcbiAgICBtaW51dGU6IG0sXG4gICAgc2Vjb25kOiBzLFxuICAgIG1pbGxpc2Vjb25kOiBtcyxcbiAgICB0aW1lQXNTdHJpbmc6IHRpbWVBc1N0cmluZyxcbiAgICB0aW1lQXNBcnJheTogW2gsIG0sIHMsIG1zXVxuICB9O1xufVxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5mdW5jdGlvbiBiYXNlNjRUb0JpbmFyeShpbnB1dCkge1xuICB2YXIga2V5U3RyID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JyxcbiAgICAgIGJ5dGVzID0gdm9pZCAwLFxuICAgICAgdWFycmF5ID0gdm9pZCAwLFxuICAgICAgYnVmZmVyID0gdm9pZCAwLFxuICAgICAgbGtleTEgPSB2b2lkIDAsXG4gICAgICBsa2V5MiA9IHZvaWQgMCxcbiAgICAgIGNocjEgPSB2b2lkIDAsXG4gICAgICBjaHIyID0gdm9pZCAwLFxuICAgICAgY2hyMyA9IHZvaWQgMCxcbiAgICAgIGVuYzEgPSB2b2lkIDAsXG4gICAgICBlbmMyID0gdm9pZCAwLFxuICAgICAgZW5jMyA9IHZvaWQgMCxcbiAgICAgIGVuYzQgPSB2b2lkIDAsXG4gICAgICBpID0gdm9pZCAwLFxuICAgICAgaiA9IDA7XG5cbiAgYnl0ZXMgPSBNYXRoLmNlaWwoMyAqIGlucHV0Lmxlbmd0aCAvIDQuMCk7XG4gIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihieXRlcyk7XG4gIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgbGtleTEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBsa2V5MiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGggLSAxKSk7XG4gIGlmIChsa2V5MSA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG4gIGlmIChsa2V5MiA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG5cbiAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgJycpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBieXRlczsgaSArPSAzKSB7XG4gICAgLy9nZXQgdGhlIDMgb2N0ZWN0cyBpbiA0IGFzY2lpIGNoYXJzXG4gICAgZW5jMSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzMgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jNCA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcblxuICAgIGNocjEgPSBlbmMxIDw8IDIgfCBlbmMyID4+IDQ7XG4gICAgY2hyMiA9IChlbmMyICYgMTUpIDw8IDQgfCBlbmMzID4+IDI7XG4gICAgY2hyMyA9IChlbmMzICYgMykgPDwgNiB8IGVuYzQ7XG5cbiAgICB1YXJyYXlbaV0gPSBjaHIxO1xuICAgIGlmIChlbmMzICE9IDY0KSB1YXJyYXlbaSArIDFdID0gY2hyMjtcbiAgICBpZiAoZW5jNCAhPSA2NCkgdWFycmF5W2kgKyAyXSA9IGNocjM7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhidWZmZXIpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5mdW5jdGlvbiB0eXBlU3RyaW5nKG8pIHtcbiAgaWYgKCh0eXBlb2YgbyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YobykpICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihvKTtcbiAgfVxuXG4gIGlmIChvID09PSBudWxsKSB7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuXG4gIC8vb2JqZWN0LCBhcnJheSwgZnVuY3Rpb24sIGRhdGUsIHJlZ2V4cCwgc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIGVycm9yXG4gIHZhciBpbnRlcm5hbENsYXNzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9cXFtvYmplY3RcXHMoXFx3KylcXF0vKVsxXTtcbiAgcmV0dXJuIGludGVybmFsQ2xhc3MudG9Mb3dlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gc29ydEV2ZW50cyhldmVudHMpIHtcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoYS50aWNrcyA9PT0gYi50aWNrcykge1xuICAgICAgdmFyIHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZiAoYS50eXBlID09PSAxNzYgJiYgYi50eXBlID09PSAxNDQpIHtcbiAgICAgICAgciA9IC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIHJldHVybiBhLnRpY2tzIC0gYi50aWNrcztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrSWZCYXNlNjQoZGF0YSkge1xuICB2YXIgcGFzc2VkID0gdHJ1ZTtcbiAgdHJ5IHtcbiAgICBhdG9iKGRhdGEpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcGFzc2VkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBhc3NlZDtcbn1cblxuZnVuY3Rpb24gZ2V0RXF1YWxQb3dlckN1cnZlKG51bVN0ZXBzLCB0eXBlLCBtYXhWYWx1ZSkge1xuICB2YXIgaSA9IHZvaWQgMCxcbiAgICAgIHZhbHVlID0gdm9pZCAwLFxuICAgICAgcGVyY2VudCA9IHZvaWQgMCxcbiAgICAgIHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtU3RlcHMpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBudW1TdGVwczsgaSsrKSB7XG4gICAgcGVyY2VudCA9IGkgLyBudW1TdGVwcztcbiAgICBpZiAodHlwZSA9PT0gJ2ZhZGVJbicpIHtcbiAgICAgIHZhbHVlID0gTWF0aC5jb3MoKDEuMCAtIHBlcmNlbnQpICogMC41ICogbVBJKSAqIG1heFZhbHVlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2ZhZGVPdXQnKSB7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKHBlcmNlbnQgKiAwLjUgKiBNYXRoLlBJKSAqIG1heFZhbHVlO1xuICAgIH1cbiAgICB2YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICBpZiAoaSA9PT0gbnVtU3RlcHMgLSAxKSB7XG4gICAgICB2YWx1ZXNbaV0gPSB0eXBlID09PSAnZmFkZUluJyA/IDEgOiAwO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWVzO1xufVxuXG5mdW5jdGlvbiBjaGVja01JRElOdW1iZXIodmFsdWUpIHtcbiAgLy9jb25zb2xlLmxvZyh2YWx1ZSk7XG4gIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWx1ZSA8IDAgfHwgdmFsdWUgPiAxMjcpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTI3Jyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLypcbi8vb2xkIHNjaG9vbCBhamF4XG5cbmV4cG9ydCBmdW5jdGlvbiBhamF4KGNvbmZpZyl7XG4gIGxldFxuICAgIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcbiAgICBtZXRob2QgPSB0eXBlb2YgY29uZmlnLm1ldGhvZCA9PT0gJ3VuZGVmaW5lZCcgPyAnR0VUJyA6IGNvbmZpZy5tZXRob2QsXG4gICAgZmlsZVNpemU7XG5cbiAgZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIHJlamVjdCA9IHJlamVjdCB8fCBmdW5jdGlvbigpe307XG4gICAgcmVzb2x2ZSA9IHJlc29sdmUgfHwgZnVuY3Rpb24oKXt9O1xuXG4gICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgaWYocmVxdWVzdC5zdGF0dXMgIT09IDIwMCl7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LnN0YXR1cyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgZmlsZVNpemUgPSByZXF1ZXN0LnJlc3BvbnNlLmxlbmd0aDtcbiAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpLCBmaWxlU2l6ZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKXtcbiAgICAgIGNvbmZpZy5vbkVycm9yKGUpO1xuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBjb25maWcudXJsLCB0cnVlKTtcblxuICAgIGlmKGNvbmZpZy5vdmVycmlkZU1pbWVUeXBlKXtcbiAgICAgIHJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZShjb25maWcub3ZlcnJpZGVNaW1lVHlwZSk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSl7XG4gICAgICBpZihjb25maWcucmVzcG9uc2VUeXBlID09PSAnanNvbicpe1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICAgIH1lbHNle1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYobWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5kYXRhKXtcbiAgICAgIHJlcXVlc3Quc2VuZChjb25maWcuZGF0YSk7XG4gICAgfWVsc2V7XG4gICAgICByZXF1ZXN0LnNlbmQoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xufVxuKi8iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNyZWF0ZUphenpJbnN0YW5jZSA9IGNyZWF0ZUphenpJbnN0YW5jZTtcbmV4cG9ydHMuZ2V0SmF6ekluc3RhbmNlID0gZ2V0SmF6ekluc3RhbmNlO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIGphenpQbHVnaW5Jbml0VGltZSA9IDEwMDsgLy8gbWlsbGlzZWNvbmRzXG5cbi8qXG4gIENyZWF0ZXMgaW5zdGFuY2VzIG9mIHRoZSBKYXp6IHBsdWdpbiBpZiBuZWNlc3NhcnkuIEluaXRpYWxseSB0aGUgTUlESUFjY2VzcyBjcmVhdGVzIG9uZSBtYWluIEphenogaW5zdGFuY2UgdGhhdCBpcyB1c2VkXG4gIHRvIHF1ZXJ5IGFsbCBpbml0aWFsbHkgY29ubmVjdGVkIGRldmljZXMsIGFuZCB0byB0cmFjayB0aGUgZGV2aWNlcyB0aGF0IGFyZSBiZWluZyBjb25uZWN0ZWQgb3IgZGlzY29ubmVjdGVkIGF0IHJ1bnRpbWUuXG5cbiAgRm9yIGV2ZXJ5IE1JRElJbnB1dCBhbmQgTUlESU91dHB1dCB0aGF0IGlzIGNyZWF0ZWQsIE1JRElBY2Nlc3MgcXVlcmllcyB0aGUgZ2V0SmF6ekluc3RhbmNlKCkgbWV0aG9kIGZvciBhIEphenogaW5zdGFuY2VcbiAgdGhhdCBzdGlsbCBoYXZlIGFuIGF2YWlsYWJsZSBpbnB1dCBvciBvdXRwdXQuIEJlY2F1c2UgSmF6eiBvbmx5IGFsbG93cyBvbmUgaW5wdXQgYW5kIG9uZSBvdXRwdXQgcGVyIGluc3RhbmNlLCB3ZVxuICBuZWVkIHRvIGNyZWF0ZSBuZXcgaW5zdGFuY2VzIGlmIG1vcmUgdGhhbiBvbmUgTUlESSBpbnB1dCBvciBvdXRwdXQgZGV2aWNlIGdldHMgY29ubmVjdGVkLlxuXG4gIE5vdGUgdGhhdCBhbiBleGlzdGluZyBKYXp6IGluc3RhbmNlIGRvZXNuJ3QgZ2V0IGRlbGV0ZWQgd2hlbiBib3RoIGl0cyBpbnB1dCBhbmQgb3V0cHV0IGRldmljZSBhcmUgZGlzY29ubmVjdGVkOyBpbnN0ZWFkIGl0XG4gIHdpbGwgYmUgcmV1c2VkIGlmIGEgbmV3IGRldmljZSBnZXRzIGNvbm5lY3RlZC5cbiovXG5cbnZhciBqYXp6SW5zdGFuY2VOdW1iZXIgPSAwO1xudmFyIGphenpJbnN0YW5jZXMgPSBuZXcgTWFwKCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUphenpJbnN0YW5jZShjYWxsYmFjaykge1xuXG4gIHZhciBpZCA9ICdqYXp6XycgKyBqYXp6SW5zdGFuY2VOdW1iZXIrKyArICcnICsgRGF0ZS5ub3coKTtcbiAgdmFyIGluc3RhbmNlID0gdm9pZCAwO1xuICB2YXIgb2JqUmVmID0gdm9pZCAwLFxuICAgICAgYWN0aXZlWCA9IHZvaWQgMDtcblxuICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5ub2RlanMgPT09IHRydWUpIHtcbiAgICBvYmpSZWYgPSBuZXcgamF6ek1pZGkuTUlESSgpO1xuICB9IGVsc2Uge1xuICAgIHZhciBvMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29iamVjdCcpO1xuICAgIG8xLmlkID0gaWQgKyAnaWUnO1xuICAgIG8xLmNsYXNzaWQgPSAnQ0xTSUQ6MUFDRTE2MTgtMUM3RC00NTYxLUFFRTEtMzQ4NDJBQTg1RTkwJztcbiAgICBhY3RpdmVYID0gbzE7XG5cbiAgICB2YXIgbzIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICBvMi5pZCA9IGlkO1xuICAgIG8yLnR5cGUgPSAnYXVkaW8veC1qYXp6JztcbiAgICBvMS5hcHBlbmRDaGlsZChvMik7XG4gICAgb2JqUmVmID0gbzI7XG5cbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdUaGlzIHBhZ2UgcmVxdWlyZXMgdGhlICcpKTtcblxuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0phenogcGx1Z2luJykpO1xuICAgIGEuaHJlZiA9ICdodHRwOi8vamF6ei1zb2Z0Lm5ldC8nO1xuXG4gICAgZS5hcHBlbmRDaGlsZChhKTtcbiAgICBlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcuJykpO1xuICAgIG8yLmFwcGVuZENoaWxkKGUpO1xuXG4gICAgdmFyIGluc2VydGlvblBvaW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ01JRElQbHVnaW4nKTtcbiAgICBpZiAoIWluc2VydGlvblBvaW50KSB7XG4gICAgICAvLyBDcmVhdGUgaGlkZGVuIGVsZW1lbnRcbiAgICAgIGluc2VydGlvblBvaW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBpbnNlcnRpb25Qb2ludC5pZCA9ICdNSURJUGx1Z2luJztcbiAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLmxlZnQgPSAnLTk5OTlweCc7XG4gICAgICBpbnNlcnRpb25Qb2ludC5zdHlsZS50b3AgPSAnLTk5OTlweCc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGluc2VydGlvblBvaW50KTtcbiAgICB9XG4gICAgaW5zZXJ0aW9uUG9pbnQuYXBwZW5kQ2hpbGQobzEpO1xuICB9XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG9ialJlZi5pc0phenogPT09IHRydWUpIHtcbiAgICAgIGluc3RhbmNlID0gb2JqUmVmO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZlWC5pc0phenogPT09IHRydWUpIHtcbiAgICAgIGluc3RhbmNlID0gYWN0aXZlWDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBpbnN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGluc3RhbmNlLl9wZXJmVGltZVplcm8gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIGphenpJbnN0YW5jZXMuc2V0KGlkLCBpbnN0YW5jZSk7XG4gICAgfVxuICAgIGNhbGxiYWNrKGluc3RhbmNlKTtcbiAgfSwgamF6elBsdWdpbkluaXRUaW1lKTtcbn1cblxuZnVuY3Rpb24gZ2V0SmF6ekluc3RhbmNlKHR5cGUsIGNhbGxiYWNrKSB7XG4gIHZhciBpbnN0YW5jZSA9IG51bGw7XG4gIHZhciBrZXkgPSB0eXBlID09PSAnaW5wdXQnID8gJ2lucHV0SW5Vc2UnIDogJ291dHB1dEluVXNlJztcblxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBqYXp6SW5zdGFuY2VzLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgdmFyIGluc3QgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgaWYgKGluc3Rba2V5XSAhPT0gdHJ1ZSkge1xuICAgICAgICBpbnN0YW5jZSA9IGluc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICBjcmVhdGVKYXp6SW5zdGFuY2UoY2FsbGJhY2spO1xuICB9IGVsc2Uge1xuICAgIGNhbGxiYWNrKGluc3RhbmNlKTtcbiAgfVxufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENyZWF0ZXMgYSBNSURJQWNjZXNzIGluc3RhbmNlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBDcmVhdGVzIE1JRElJbnB1dCBhbmQgTUlESU91dHB1dCBpbnN0YW5jZXMgZm9yIHRoZSBpbml0aWFsbHkgY29ubmVjdGVkIE1JREkgZGV2aWNlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gS2VlcHMgdHJhY2sgb2YgbmV3bHkgY29ubmVjdGVkIGRldmljZXMgYW5kIGNyZWF0ZXMgdGhlIG5lY2Vzc2FyeSBpbnN0YW5jZXMgb2YgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBLZWVwcyB0cmFjayBvZiBkaXNjb25uZWN0ZWQgZGV2aWNlcyBhbmQgcmVtb3ZlcyB0aGVtIGZyb20gdGhlIGlucHV0cyBhbmQvb3Igb3V0cHV0cyBtYXAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIENyZWF0ZXMgYSB1bmlxdWUgaWQgZm9yIGV2ZXJ5IGRldmljZSBhbmQgc3RvcmVzIHRoZXNlIGlkcyBieSB0aGUgbmFtZSBvZiB0aGUgZGV2aWNlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbyB3aGVuIGEgZGV2aWNlIGdldHMgZGlzY29ubmVjdGVkIGFuZCByZWNvbm5lY3RlZCBhZ2FpbiwgaXQgd2lsbCBzdGlsbCBoYXZlIHRoZSBzYW1lIGlkLiBUaGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzIGluIGxpbmUgd2l0aCB0aGUgYmVoYXZpb3VyIG9mIHRoZSBuYXRpdmUgTUlESUFjY2VzcyBvYmplY3QuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuZXhwb3J0cy5jcmVhdGVNSURJQWNjZXNzID0gY3JlYXRlTUlESUFjY2VzcztcbmV4cG9ydHMuZGlzcGF0Y2hFdmVudCA9IGRpc3BhdGNoRXZlbnQ7XG5leHBvcnRzLmNsb3NlQWxsTUlESUlucHV0cyA9IGNsb3NlQWxsTUlESUlucHV0cztcbmV4cG9ydHMuZ2V0TUlESURldmljZUlkID0gZ2V0TUlESURldmljZUlkO1xuXG52YXIgX2phenpfaW5zdGFuY2UgPSByZXF1aXJlKCcuL2phenpfaW5zdGFuY2UnKTtcblxudmFyIF9taWRpX2lucHV0ID0gcmVxdWlyZSgnLi9taWRpX2lucHV0Jyk7XG5cbnZhciBfbWlkaV9vdXRwdXQgPSByZXF1aXJlKCcuL21pZGlfb3V0cHV0Jyk7XG5cbnZhciBfbWlkaWNvbm5lY3Rpb25fZXZlbnQgPSByZXF1aXJlKCcuL21pZGljb25uZWN0aW9uX2V2ZW50Jyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgbWlkaUFjY2VzcyA9IHZvaWQgMDtcbnZhciBqYXp6SW5zdGFuY2UgPSB2b2lkIDA7XG52YXIgbWlkaUlucHV0cyA9IG5ldyBNYXAoKTtcbnZhciBtaWRpT3V0cHV0cyA9IG5ldyBNYXAoKTtcbnZhciBtaWRpSW5wdXRJZHMgPSBuZXcgTWFwKCk7XG52YXIgbWlkaU91dHB1dElkcyA9IG5ldyBNYXAoKTtcbnZhciBsaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG5cbnZhciBNSURJQWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNSURJQWNjZXNzKGlucHV0cywgb3V0cHV0cykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJQWNjZXNzKTtcblxuICAgIHRoaXMuc3lzZXhFbmFibGVkID0gdHJ1ZTtcbiAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICB0aGlzLm91dHB1dHMgPSBvdXRwdXRzO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElBY2Nlc3MsIFt7XG4gICAga2V5OiAnYWRkRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gdHJ1ZSkge1xuICAgICAgICBsaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTUlESUFjY2Vzcztcbn0oKTtcblxuZnVuY3Rpb24gY3JlYXRlTUlESUFjY2VzcygpIHtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICBpZiAodHlwZW9mIG1pZGlBY2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXNvbHZlKG1pZGlBY2Nlc3MpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLmJyb3dzZXIgPT09ICdpZTknKSB7XG4gICAgICByZWplY3QoeyBtZXNzYWdlOiAnV2ViTUlESUFQSVNoaW0gc3VwcG9ydHMgSW50ZXJuZXQgRXhwbG9yZXIgMTAgYW5kIGFib3ZlLicgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgKDAsIF9qYXp6X2luc3RhbmNlLmNyZWF0ZUphenpJbnN0YW5jZSkoZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgICBpZiAodHlwZW9mIGluc3RhbmNlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZWplY3QoeyBtZXNzYWdlOiAnTm8gYWNjZXNzIHRvIE1JREkgZGV2aWNlczogYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHRoZSBXZWJNSURJIEFQSSBhbmQgdGhlIEphenogcGx1Z2luIGlzIG5vdCBpbnN0YWxsZWQuJyB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBqYXp6SW5zdGFuY2UgPSBpbnN0YW5jZTtcblxuICAgICAgY3JlYXRlTUlESVBvcnRzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0dXBMaXN0ZW5lcnMoKTtcbiAgICAgICAgbWlkaUFjY2VzcyA9IG5ldyBNSURJQWNjZXNzKG1pZGlJbnB1dHMsIG1pZGlPdXRwdXRzKTtcbiAgICAgICAgcmVzb2x2ZShtaWRpQWNjZXNzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gY3JlYXRlIE1JRElJbnB1dCBhbmQgTUlESU91dHB1dCBpbnN0YW5jZXMgZm9yIGFsbCBpbml0aWFsbHkgY29ubmVjdGVkIE1JREkgZGV2aWNlc1xuZnVuY3Rpb24gY3JlYXRlTUlESVBvcnRzKGNhbGxiYWNrKSB7XG4gIHZhciBpbnB1dHMgPSBqYXp6SW5zdGFuY2UuTWlkaUluTGlzdCgpO1xuICB2YXIgb3V0cHV0cyA9IGphenpJbnN0YW5jZS5NaWRpT3V0TGlzdCgpO1xuICB2YXIgbnVtSW5wdXRzID0gaW5wdXRzLmxlbmd0aDtcbiAgdmFyIG51bU91dHB1dHMgPSBvdXRwdXRzLmxlbmd0aDtcblxuICBsb29wQ3JlYXRlTUlESVBvcnQoMCwgbnVtSW5wdXRzLCAnaW5wdXQnLCBpbnB1dHMsIGZ1bmN0aW9uICgpIHtcbiAgICBsb29wQ3JlYXRlTUlESVBvcnQoMCwgbnVtT3V0cHV0cywgJ291dHB1dCcsIG91dHB1dHMsIGNhbGxiYWNrKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGxvb3BDcmVhdGVNSURJUG9ydChpbmRleCwgbWF4LCB0eXBlLCBsaXN0LCBjYWxsYmFjaykge1xuICBpZiAoaW5kZXggPCBtYXgpIHtcbiAgICB2YXIgbmFtZSA9IGxpc3RbaW5kZXgrK107XG4gICAgY3JlYXRlTUlESVBvcnQodHlwZSwgbmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgbG9vcENyZWF0ZU1JRElQb3J0KGluZGV4LCBtYXgsIHR5cGUsIGxpc3QsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjaygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1JRElQb3J0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gICgwLCBfamF6el9pbnN0YW5jZS5nZXRKYXp6SW5zdGFuY2UpKHR5cGUsIGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgIHZhciBwb3J0ID0gdm9pZCAwO1xuICAgIHZhciBpbmZvID0gW25hbWUsICcnLCAnJ107XG4gICAgaWYgKHR5cGUgPT09ICdpbnB1dCcpIHtcbiAgICAgIGlmIChpbnN0YW5jZS5TdXBwb3J0KCdNaWRpSW5JbmZvJykpIHtcbiAgICAgICAgaW5mbyA9IGluc3RhbmNlLk1pZGlJbkluZm8obmFtZSk7XG4gICAgICB9XG4gICAgICBwb3J0ID0gbmV3IF9taWRpX2lucHV0Lk1JRElJbnB1dChpbmZvLCBpbnN0YW5jZSk7XG4gICAgICBtaWRpSW5wdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdvdXRwdXQnKSB7XG4gICAgICBpZiAoaW5zdGFuY2UuU3VwcG9ydCgnTWlkaU91dEluZm8nKSkge1xuICAgICAgICBpbmZvID0gaW5zdGFuY2UuTWlkaU91dEluZm8obmFtZSk7XG4gICAgICB9XG4gICAgICBwb3J0ID0gbmV3IF9taWRpX291dHB1dC5NSURJT3V0cHV0KGluZm8sIGluc3RhbmNlKTtcbiAgICAgIG1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICB9XG4gICAgY2FsbGJhY2socG9ydCk7XG4gIH0pO1xufVxuXG4vLyBsb29rdXAgZnVuY3Rpb246IEphenogZ2l2ZXMgdXMgdGhlIG5hbWUgb2YgdGhlIGNvbm5lY3RlZC9kaXNjb25uZWN0ZWQgTUlESSBkZXZpY2VzIGJ1dCB3ZSBoYXZlIHN0b3JlZCB0aGVtIGJ5IGlkXG5mdW5jdGlvbiBnZXRQb3J0QnlOYW1lKHBvcnRzLCBuYW1lKSB7XG4gIHZhciBwb3J0ID0gdm9pZCAwO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBwb3J0cy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgIHBvcnQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgaWYgKHBvcnQubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvcnQ7XG59XG5cbi8vIGtlZXAgdHJhY2sgb2YgY29ubmVjdGVkL2Rpc2Nvbm5lY3RlZCBNSURJIGRldmljZXNcbmZ1bmN0aW9uIHNldHVwTGlzdGVuZXJzKCkge1xuICBqYXp6SW5zdGFuY2UuT25EaXNjb25uZWN0TWlkaUluKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIHBvcnQgPSBnZXRQb3J0QnlOYW1lKG1pZGlJbnB1dHMsIG5hbWUpO1xuICAgIGlmICh0eXBlb2YgcG9ydCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBvcnQuc3RhdGUgPSAnZGlzY29ubmVjdGVkJztcbiAgICAgIHBvcnQuY2xvc2UoKTtcbiAgICAgIHBvcnQuX2phenpJbnN0YW5jZS5pbnB1dEluVXNlID0gZmFsc2U7XG4gICAgICBtaWRpSW5wdXRzLmRlbGV0ZShwb3J0LmlkKTtcbiAgICAgIGRpc3BhdGNoRXZlbnQocG9ydCk7XG4gICAgfVxuICB9KTtcblxuICBqYXp6SW5zdGFuY2UuT25EaXNjb25uZWN0TWlkaU91dChmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBwb3J0ID0gZ2V0UG9ydEJ5TmFtZShtaWRpT3V0cHV0cywgbmFtZSk7XG4gICAgaWYgKHR5cGVvZiBwb3J0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcG9ydC5zdGF0ZSA9ICdkaXNjb25uZWN0ZWQnO1xuICAgICAgcG9ydC5jbG9zZSgpO1xuICAgICAgcG9ydC5famF6ekluc3RhbmNlLm91dHB1dEluVXNlID0gZmFsc2U7XG4gICAgICBtaWRpT3V0cHV0cy5kZWxldGUocG9ydC5pZCk7XG4gICAgICBkaXNwYXRjaEV2ZW50KHBvcnQpO1xuICAgIH1cbiAgfSk7XG5cbiAgamF6ekluc3RhbmNlLk9uQ29ubmVjdE1pZGlJbihmdW5jdGlvbiAobmFtZSkge1xuICAgIGNyZWF0ZU1JRElQb3J0KCdpbnB1dCcsIG5hbWUsIGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICBkaXNwYXRjaEV2ZW50KHBvcnQpO1xuICAgIH0pO1xuICB9KTtcblxuICBqYXp6SW5zdGFuY2UuT25Db25uZWN0TWlkaU91dChmdW5jdGlvbiAobmFtZSkge1xuICAgIGNyZWF0ZU1JRElQb3J0KCdvdXRwdXQnLCBuYW1lLCBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgZGlzcGF0Y2hFdmVudChwb3J0KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8vIHdoZW4gYSBkZXZpY2UgZ2V0cyBjb25uZWN0ZWQvZGlzY29ubmVjdGVkIGJvdGggdGhlIHBvcnQgYW5kIE1JRElBY2Nlc3MgZGlzcGF0Y2ggYSBNSURJQ29ubmVjdGlvbkV2ZW50XG4vLyB0aGVyZWZvciB3ZSBjYWxsIHRoZSBwb3J0cyBkaXNwYXRjaEV2ZW50IGZ1bmN0aW9uIGhlcmUgYXMgd2VsbFxuZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChwb3J0KSB7XG4gIHBvcnQuZGlzcGF0Y2hFdmVudChuZXcgX21pZGljb25uZWN0aW9uX2V2ZW50Lk1JRElDb25uZWN0aW9uRXZlbnQocG9ydCwgcG9ydCkpO1xuXG4gIHZhciBldnQgPSBuZXcgX21pZGljb25uZWN0aW9uX2V2ZW50Lk1JRElDb25uZWN0aW9uRXZlbnQobWlkaUFjY2VzcywgcG9ydCk7XG5cbiAgaWYgKHR5cGVvZiBtaWRpQWNjZXNzLm9uc3RhdGVjaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICBtaWRpQWNjZXNzLm9uc3RhdGVjaGFuZ2UoZXZ0KTtcbiAgfVxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gbGlzdGVuZXJzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgIGxpc3RlbmVyKGV2dCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VBbGxNSURJSW5wdXRzKCkge1xuICBtaWRpSW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgLy9pbnB1dC5jbG9zZSgpO1xuICAgIGlucHV0Ll9qYXp6SW5zdGFuY2UuTWlkaUluQ2xvc2UoKTtcbiAgfSk7XG59XG5cbi8vIGNoZWNrIGlmIHdlIGhhdmUgYWxyZWFkeSBjcmVhdGVkIGEgdW5pcXVlIGlkIGZvciB0aGlzIGRldmljZSwgaWYgc286IHJldXNlIGl0LCBpZiBub3Q6IGNyZWF0ZSBhIG5ldyBpZCBhbmQgc3RvcmUgaXRcbmZ1bmN0aW9uIGdldE1JRElEZXZpY2VJZChuYW1lLCB0eXBlKSB7XG4gIHZhciBpZCA9IHZvaWQgMDtcbiAgaWYgKHR5cGUgPT09ICdpbnB1dCcpIHtcbiAgICBpZCA9IG1pZGlJbnB1dElkcy5nZXQobmFtZSk7XG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGlkID0gKDAsIF91dGlsLmdlbmVyYXRlVVVJRCkoKTtcbiAgICAgIG1pZGlJbnB1dElkcy5zZXQobmFtZSwgaWQpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnb3V0cHV0Jykge1xuICAgIGlkID0gbWlkaU91dHB1dElkcy5nZXQobmFtZSk7XG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGlkID0gKDAsIF91dGlsLmdlbmVyYXRlVVVJRCkoKTtcbiAgICAgIG1pZGlPdXRwdXRJZHMuc2V0KG5hbWUsIGlkKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGlkO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuTUlESUlucHV0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlESUlucHV0IGlzIGEgd3JhcHBlciBhcm91bmQgYW4gaW5wdXQgb2YgYSBKYXp6IGluc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfbWlkaW1lc3NhZ2VfZXZlbnQgPSByZXF1aXJlKCcuL21pZGltZXNzYWdlX2V2ZW50Jyk7XG5cbnZhciBfbWlkaWNvbm5lY3Rpb25fZXZlbnQgPSByZXF1aXJlKCcuL21pZGljb25uZWN0aW9uX2V2ZW50Jyk7XG5cbnZhciBfbWlkaV9hY2Nlc3MgPSByZXF1aXJlKCcuL21pZGlfYWNjZXNzJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBtaWRpUHJvYyA9IHZvaWQgMDtcbnZhciBub2RlanMgPSAoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLm5vZGVqcztcblxudmFyIE1JRElJbnB1dCA9IGV4cG9ydHMuTUlESUlucHV0ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNSURJSW5wdXQoaW5mbywgaW5zdGFuY2UpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESUlucHV0KTtcblxuICAgIHRoaXMuaWQgPSAoMCwgX21pZGlfYWNjZXNzLmdldE1JRElEZXZpY2VJZCkoaW5mb1swXSwgJ2lucHV0Jyk7XG4gICAgdGhpcy5uYW1lID0gaW5mb1swXTtcbiAgICB0aGlzLm1hbnVmYWN0dXJlciA9IGluZm9bMV07XG4gICAgdGhpcy52ZXJzaW9uID0gaW5mb1syXTtcbiAgICB0aGlzLnR5cGUgPSAnaW5wdXQnO1xuICAgIHRoaXMuc3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSAncGVuZGluZyc7XG5cbiAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UgPSBudWxsO1xuICAgIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBpbXBsaWNpdGx5IG9wZW4gdGhlIGRldmljZSB3aGVuIGFuIG9ubWlkaW1lc3NhZ2UgaGFuZGxlciBnZXRzIGFkZGVkXG4gICAgLy8gd2UgZGVmaW5lIGEgc2V0dGVyIHRoYXQgb3BlbnMgdGhlIGRldmljZSBpZiB0aGUgc2V0IHZhbHVlIGlzIGEgZnVuY3Rpb25cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ29ubWlkaW1lc3NhZ2UnLCB7XG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlID0gdmFsdWU7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IE1hcCgpLnNldCgnbWlkaW1lc3NhZ2UnLCBuZXcgU2V0KCkpLnNldCgnc3RhdGVjaGFuZ2UnLCBuZXcgU2V0KCkpO1xuICAgIHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSA9IGZhbHNlO1xuICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoKTtcblxuICAgIHRoaXMuX2phenpJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgIHRoaXMuX2phenpJbnN0YW5jZS5pbnB1dEluVXNlID0gdHJ1ZTtcblxuICAgIC8vIG9uIExpbnV4IG9wZW5pbmcgYW5kIGNsb3NpbmcgSmF6eiBpbnN0YW5jZXMgY2F1c2VzIHRoZSBwbHVnaW4gdG8gY3Jhc2ggYSBsb3Qgc28gd2Ugb3BlblxuICAgIC8vIHRoZSBkZXZpY2UgaGVyZSBhbmQgZG9uJ3QgY2xvc2UgaXQgd2hlbiBjbG9zZSgpIGlzIGNhbGxlZCwgc2VlIGJlbG93XG4gICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gPT09ICdsaW51eCcpIHtcbiAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpSW5PcGVuKHRoaXMubmFtZSwgbWlkaVByb2MuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElJbnB1dCwgW3tcbiAgICBrZXk6ICdhZGRFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQodHlwZSk7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IGZhbHNlKSB7XG4gICAgICAgIGxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZUV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldCh0eXBlKTtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGlzcGF0Y2hFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZ0KSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldChldnQudHlwZSk7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXIoZXZ0KTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZXZ0LnR5cGUgPT09ICdtaWRpbWVzc2FnZScpIHtcbiAgICAgICAgaWYgKHRoaXMuX29ubWlkaW1lc3NhZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlKGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZXZ0LnR5cGUgPT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgaWYgKHRoaXMub25zdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZShldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnb3BlbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnb3BlbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlJbk9wZW4odGhpcy5uYW1lLCBtaWRpUHJvYy5iaW5kKHRoaXMpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdvcGVuJztcbiAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjbG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlJbkNsb3NlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnY2xvc2VkJztcbiAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UgPSBudWxsO1xuICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5nZXQoJ21pZGltZXNzYWdlJykuY2xlYXIoKTtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5nZXQoJ3N0YXRlY2hhbmdlJykuY2xlYXIoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfYXBwZW5kVG9TeXNleEJ1ZmZlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9hcHBlbmRUb1N5c2V4QnVmZmVyKGRhdGEpIHtcbiAgICAgIHZhciBvbGRMZW5ndGggPSB0aGlzLl9zeXNleEJ1ZmZlci5sZW5ndGg7XG4gICAgICB2YXIgdG1wQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkob2xkTGVuZ3RoICsgZGF0YS5sZW5ndGgpO1xuICAgICAgdG1wQnVmZmVyLnNldCh0aGlzLl9zeXNleEJ1ZmZlcik7XG4gICAgICB0bXBCdWZmZXIuc2V0KGRhdGEsIG9sZExlbmd0aCk7XG4gICAgICB0aGlzLl9zeXNleEJ1ZmZlciA9IHRtcEJ1ZmZlcjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfYnVmZmVyTG9uZ1N5c2V4JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2J1ZmZlckxvbmdTeXNleChkYXRhLCBpbml0aWFsT2Zmc2V0KSB7XG4gICAgICB2YXIgaiA9IGluaXRpYWxPZmZzZXQ7XG4gICAgICB3aGlsZSAoaiA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGlmIChkYXRhW2pdID09IDB4RjcpIHtcbiAgICAgICAgICAvLyBlbmQgb2Ygc3lzZXghXG4gICAgICAgICAgaisrO1xuICAgICAgICAgIHRoaXMuX2FwcGVuZFRvU3lzZXhCdWZmZXIoZGF0YS5zbGljZShpbml0aWFsT2Zmc2V0LCBqKSk7XG4gICAgICAgICAgcmV0dXJuIGo7XG4gICAgICAgIH1cbiAgICAgICAgaisrO1xuICAgICAgfVxuICAgICAgLy8gZGlkbid0IHJlYWNoIHRoZSBlbmQ7IGp1c3QgdGFjayBpdCBvbi5cbiAgICAgIHRoaXMuX2FwcGVuZFRvU3lzZXhCdWZmZXIoZGF0YS5zbGljZShpbml0aWFsT2Zmc2V0LCBqKSk7XG4gICAgICB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UgPSB0cnVlO1xuICAgICAgcmV0dXJuIGo7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElJbnB1dDtcbn0oKTtcblxubWlkaVByb2MgPSBmdW5jdGlvbiBtaWRpUHJvYyh0aW1lc3RhbXAsIGRhdGEpIHtcbiAgdmFyIGxlbmd0aCA9IDA7XG4gIHZhciBpID0gdm9pZCAwO1xuICB2YXIgaXNTeXNleE1lc3NhZ2UgPSBmYWxzZTtcblxuICAvLyBKYXp6IHNvbWV0aW1lcyBwYXNzZXMgdXMgbXVsdGlwbGUgbWVzc2FnZXMgYXQgb25jZSwgc28gd2UgbmVlZCB0byBwYXJzZSB0aGVtIG91dCBhbmQgcGFzcyB0aGVtIG9uZSBhdCBhIHRpbWUuXG5cbiAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IGxlbmd0aCkge1xuICAgIHZhciBpc1ZhbGlkTWVzc2FnZSA9IHRydWU7XG4gICAgaWYgKHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSkge1xuICAgICAgaSA9IHRoaXMuX2J1ZmZlckxvbmdTeXNleChkYXRhLCBpKTtcbiAgICAgIGlmIChkYXRhW2kgLSAxXSAhPSAweGY3KSB7XG4gICAgICAgIC8vIHJhbiBvZmYgdGhlIGVuZCB3aXRob3V0IGhpdHRpbmcgdGhlIGVuZCBvZiB0aGUgc3lzZXggbWVzc2FnZVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpc1N5c2V4TWVzc2FnZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzU3lzZXhNZXNzYWdlID0gZmFsc2U7XG4gICAgICBzd2l0Y2ggKGRhdGFbaV0gJiAweEYwKSB7XG4gICAgICAgIGNhc2UgMHgwMDpcbiAgICAgICAgICAvLyBDaGV3IHVwIHNwdXJpb3VzIDB4MDAgYnl0ZXMuICBGaXhlcyBhIFdpbmRvd3MgcHJvYmxlbS5cbiAgICAgICAgICBsZW5ndGggPSAxO1xuICAgICAgICAgIGlzVmFsaWRNZXNzYWdlID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAweDgwOiAvLyBub3RlIG9mZlxuICAgICAgICBjYXNlIDB4OTA6IC8vIG5vdGUgb25cbiAgICAgICAgY2FzZSAweEEwOiAvLyBwb2x5cGhvbmljIGFmdGVydG91Y2hcbiAgICAgICAgY2FzZSAweEIwOiAvLyBjb250cm9sIGNoYW5nZVxuICAgICAgICBjYXNlIDB4RTA6XG4gICAgICAgICAgLy8gY2hhbm5lbCBtb2RlXG4gICAgICAgICAgbGVuZ3RoID0gMztcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDB4QzA6IC8vIHByb2dyYW0gY2hhbmdlXG4gICAgICAgIGNhc2UgMHhEMDpcbiAgICAgICAgICAvLyBjaGFubmVsIGFmdGVydG91Y2hcbiAgICAgICAgICBsZW5ndGggPSAyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMHhGMDpcbiAgICAgICAgICBzd2l0Y2ggKGRhdGFbaV0pIHtcbiAgICAgICAgICAgIGNhc2UgMHhmMDpcbiAgICAgICAgICAgICAgLy8gbGV0aWFibGUtbGVuZ3RoIHN5c2V4LlxuICAgICAgICAgICAgICBpID0gdGhpcy5fYnVmZmVyTG9uZ1N5c2V4KGRhdGEsIGkpO1xuICAgICAgICAgICAgICBpZiAoZGF0YVtpIC0gMV0gIT0gMHhmNykge1xuICAgICAgICAgICAgICAgIC8vIHJhbiBvZmYgdGhlIGVuZCB3aXRob3V0IGhpdHRpbmcgdGhlIGVuZCBvZiB0aGUgc3lzZXggbWVzc2FnZVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpc1N5c2V4TWVzc2FnZSA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDB4RjE6IC8vIE1UQyBxdWFydGVyIGZyYW1lXG4gICAgICAgICAgICBjYXNlIDB4RjM6XG4gICAgICAgICAgICAgIC8vIHNvbmcgc2VsZWN0XG4gICAgICAgICAgICAgIGxlbmd0aCA9IDI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDB4RjI6XG4gICAgICAgICAgICAgIC8vIHNvbmcgcG9zaXRpb24gcG9pbnRlclxuICAgICAgICAgICAgICBsZW5ndGggPSAzO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgbGVuZ3RoID0gMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzVmFsaWRNZXNzYWdlKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YXIgZXZ0ID0ge307XG4gICAgZXZ0LnJlY2VpdmVkVGltZSA9IHBhcnNlRmxvYXQodGltZXN0YW1wLnRvU3RyaW5nKCkpICsgdGhpcy5famF6ekluc3RhbmNlLl9wZXJmVGltZVplcm87XG5cbiAgICBpZiAoaXNTeXNleE1lc3NhZ2UgfHwgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlKSB7XG4gICAgICBldnQuZGF0YSA9IG5ldyBVaW50OEFycmF5KHRoaXMuX3N5c2V4QnVmZmVyKTtcbiAgICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoMCk7XG4gICAgICB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZ0LmRhdGEgPSBuZXcgVWludDhBcnJheShkYXRhLnNsaWNlKGksIGxlbmd0aCArIGkpKTtcbiAgICB9XG5cbiAgICBpZiAobm9kZWpzKSB7XG4gICAgICBpZiAodGhpcy5fb25taWRpbWVzc2FnZSkge1xuICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlKGV2dCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlID0gbmV3IF9taWRpbWVzc2FnZV9ldmVudC5NSURJTWVzc2FnZUV2ZW50KHRoaXMsIGV2dC5kYXRhLCBldnQucmVjZWl2ZWRUaW1lKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5NSURJT3V0cHV0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlESU91dHB1dCBpcyBhIHdyYXBwZXIgYXJvdW5kIGFuIG91dHB1dCBvZiBhIEphenogaW5zdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9taWRpX2FjY2VzcyA9IHJlcXVpcmUoJy4vbWlkaV9hY2Nlc3MnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIE1JRElPdXRwdXQgPSBleHBvcnRzLk1JRElPdXRwdXQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1JRElPdXRwdXQoaW5mbywgaW5zdGFuY2UpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESU91dHB1dCk7XG5cbiAgICB0aGlzLmlkID0gKDAsIF9taWRpX2FjY2Vzcy5nZXRNSURJRGV2aWNlSWQpKGluZm9bMF0sICdvdXRwdXQnKTtcbiAgICB0aGlzLm5hbWUgPSBpbmZvWzBdO1xuICAgIHRoaXMubWFudWZhY3R1cmVyID0gaW5mb1sxXTtcbiAgICB0aGlzLnZlcnNpb24gPSBpbmZvWzJdO1xuICAgIHRoaXMudHlwZSA9ICdvdXRwdXQnO1xuICAgIHRoaXMuc3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSAncGVuZGluZyc7XG4gICAgdGhpcy5vbm1pZGltZXNzYWdlID0gbnVsbDtcbiAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSA9IGZhbHNlO1xuICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoKTtcblxuICAgIHRoaXMuX2phenpJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgIHRoaXMuX2phenpJbnN0YW5jZS5vdXRwdXRJblVzZSA9IHRydWU7XG4gICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gPT09ICdsaW51eCcpIHtcbiAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0T3Blbih0aGlzLm5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhNSURJT3V0cHV0LCBbe1xuICAgIGtleTogJ29wZW4nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ29wZW4nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLnBsYXRmb3JtICE9PSAnbGludXgnKSB7XG4gICAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0T3Blbih0aGlzLm5hbWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ29wZW4nO1xuICAgICAgKDAsIF9taWRpX2FjY2Vzcy5kaXNwYXRjaEV2ZW50KSh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Nsb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnY2xvc2VkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5wbGF0Zm9ybSAhPT0gJ2xpbnV4Jykge1xuICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaU91dENsb3NlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnY2xvc2VkJztcbiAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuY2xlYXIoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZW5kJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZChkYXRhLCB0aW1lc3RhbXApIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBkZWxheUJlZm9yZVNlbmQgPSAwO1xuXG4gICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZXN0YW1wKSB7XG4gICAgICAgIGRlbGF5QmVmb3JlU2VuZCA9IE1hdGguZmxvb3IodGltZXN0YW1wIC0gcGVyZm9ybWFuY2Uubm93KCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZXN0YW1wICYmIGRlbGF5QmVmb3JlU2VuZCA+IDEpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0TG9uZyhkYXRhKTtcbiAgICAgICAgfSwgZGVsYXlCZWZvcmVTZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0TG9uZyhkYXRhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NsZWFyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZEV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2xpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaXNwYXRjaEV2ZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldnQpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICBsaXN0ZW5lcihldnQpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLm9uc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlKGV2dCk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElPdXRwdXQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTUlESUNvbm5lY3Rpb25FdmVudCA9IGV4cG9ydHMuTUlESUNvbm5lY3Rpb25FdmVudCA9IGZ1bmN0aW9uIE1JRElDb25uZWN0aW9uRXZlbnQobWlkaUFjY2VzcywgcG9ydCkge1xuICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESUNvbm5lY3Rpb25FdmVudCk7XG5cbiAgdGhpcy5idWJibGVzID0gZmFsc2U7XG4gIHRoaXMuY2FuY2VsQnViYmxlID0gZmFsc2U7XG4gIHRoaXMuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICB0aGlzLmN1cnJlbnRUYXJnZXQgPSBtaWRpQWNjZXNzO1xuICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgdGhpcy5ldmVudFBoYXNlID0gMDtcbiAgdGhpcy5wYXRoID0gW107XG4gIHRoaXMucG9ydCA9IHBvcnQ7XG4gIHRoaXMucmV0dXJuVmFsdWUgPSB0cnVlO1xuICB0aGlzLnNyY0VsZW1lbnQgPSBtaWRpQWNjZXNzO1xuICB0aGlzLnRhcmdldCA9IG1pZGlBY2Nlc3M7XG4gIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgdGhpcy50eXBlID0gJ3N0YXRlY2hhbmdlJztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTUlESU1lc3NhZ2VFdmVudCA9IGV4cG9ydHMuTUlESU1lc3NhZ2VFdmVudCA9IGZ1bmN0aW9uIE1JRElNZXNzYWdlRXZlbnQocG9ydCwgZGF0YSwgcmVjZWl2ZWRUaW1lKSB7XG4gIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJTWVzc2FnZUV2ZW50KTtcblxuICB0aGlzLmJ1YmJsZXMgPSBmYWxzZTtcbiAgdGhpcy5jYW5jZWxCdWJibGUgPSBmYWxzZTtcbiAgdGhpcy5jYW5jZWxhYmxlID0gZmFsc2U7XG4gIHRoaXMuY3VycmVudFRhcmdldCA9IHBvcnQ7XG4gIHRoaXMuZGF0YSA9IGRhdGE7XG4gIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICB0aGlzLmV2ZW50UGhhc2UgPSAwO1xuICB0aGlzLnBhdGggPSBbXTtcbiAgdGhpcy5yZWNlaXZlZFRpbWUgPSByZWNlaXZlZFRpbWU7XG4gIHRoaXMucmV0dXJuVmFsdWUgPSB0cnVlO1xuICB0aGlzLnNyY0VsZW1lbnQgPSBwb3J0O1xuICB0aGlzLnRhcmdldCA9IHBvcnQ7XG4gIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgdGhpcy50eXBlID0gJ21pZGltZXNzYWdlJztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX21pZGlfYWNjZXNzID0gcmVxdWlyZSgnLi9taWRpX2FjY2VzcycpO1xuXG52YXIgX21pZGlfaW5wdXQgPSByZXF1aXJlKCcuL21pZGlfaW5wdXQnKTtcblxudmFyIF9taWRpX291dHB1dCA9IHJlcXVpcmUoJy4vbWlkaV9vdXRwdXQnKTtcblxudmFyIF9taWRpbWVzc2FnZV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaW1lc3NhZ2VfZXZlbnQnKTtcblxuLypcbiAgbWFpbiBlbnRyeSBwb2ludFxuKi9cbi8vaW1wb3J0IHtjcmVhdGVNSURJQWNjZXNzLCBjbG9zZUFsbE1JRElJbnB1dHN9IGZyb20gJy4vbWlkaV9hY2Nlc3MnXG4vL2ltcG9ydCB7cG9seWZpbGwsIGdldERldmljZX0gZnJvbSAnLi91dGlsJ1xuXG5cbihmdW5jdGlvbiBpbml0U2hpbSgpIHtcblxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyA9PT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgIGdsb2JhbC5NSURJSW5wdXQgPSBfbWlkaV9pbnB1dC5NSURJSW5wdXQ7XG4gICAgZ2xvYmFsLk1JRElPdXRwdXQgPSBfbWlkaV9vdXRwdXQuTUlESU91dHB1dDtcbiAgICBnbG9iYWwuTUlESU1lc3NhZ2VFdmVudCA9IF9taWRpbWVzc2FnZV9ldmVudC5NSURJTWVzc2FnZUV2ZW50O1xuXG4gICAgLy9wb2x5ZmlsbCgpXG5cbiAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnd2VibWlkaWFwaXNoaW0gMS4wLjEnLCBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MpO1xuICAgICAgcmV0dXJuICgwLCBfbWlkaV9hY2Nlc3MuY3JlYXRlTUlESUFjY2VzcykoKTtcbiAgICB9O1xuICAgIC8qXG4gICAgICAgIGlmKGdldERldmljZSgpLm5vZGVqcyA9PT0gdHJ1ZSl7XG4gICAgICAgICAgbmF2aWdhdG9yLmNsb3NlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vIE5lZWQgdG8gY2xvc2UgTUlESSBpbnB1dCBwb3J0cywgb3RoZXJ3aXNlIE5vZGUuanMgd2lsbCB3YWl0IGZvciBNSURJIGlucHV0IGZvcmV2ZXIuXG4gICAgICAgICAgICBjbG9zZUFsbE1JRElJbnB1dHMoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICovXG4gIH1cbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nZW5lcmF0ZVVVSUQgPSBnZW5lcmF0ZVVVSUQ7XG5leHBvcnRzLmdldERldmljZSA9IGdldERldmljZTtcbmV4cG9ydHMucG9seWZpbGxQZXJmb3JtYW5jZSA9IHBvbHlmaWxsUGVyZm9ybWFuY2U7XG5leHBvcnRzLnBvbHlmaWxsUHJvbWlzZSA9IHBvbHlmaWxsUHJvbWlzZTtcbmV4cG9ydHMucG9seWZpbGwgPSBwb2x5ZmlsbDtcbi8qXG4gIEEgY29sbGVjdGlvbiBvZiBoYW5keSB1dGlsIG1ldGhvZHNcbiovXG5cbmZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgdmFyIHV1aWQgPSBuZXcgQXJyYXkoNjQpLmpvaW4oJ3gnKTsgLy8neHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4JztcbiAgdXVpZCA9IHV1aWQucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xuICAgIHZhciByID0gKGQgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwO1xuICAgIGQgPSBNYXRoLmZsb29yKGQgLyAxNik7XG4gICAgcmV0dXJuIChjID09ICd4JyA/IHIgOiByICYgMHgzIHwgMHg4KS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgfSk7XG4gIHJldHVybiB1dWlkO1xufVxuXG52YXIgZGV2aWNlID0gdm9pZCAwO1xuXG4vLyBjaGVjayBvbiB3aGF0IHR5cGUgb2YgZGV2aWNlIHdlIGFyZSBydW5uaW5nLCBub3RlIHRoYXQgaW4gdGhpcyBjb250ZXh0IGEgZGV2aWNlIGlzIGEgY29tcHV0ZXIgbm90IGEgTUlESSBkZXZpY2VcbmZ1bmN0aW9uIGdldERldmljZSgpIHtcblxuICBpZiAodHlwZW9mIGRldmljZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZGV2aWNlO1xuICB9XG5cbiAgdmFyIHBsYXRmb3JtID0gJ3VuZGV0ZWN0ZWQnLFxuICAgICAgYnJvd3NlciA9ICd1bmRldGVjdGVkJyxcbiAgICAgIG5vZGVqcyA9IGZhbHNlO1xuXG4gIGlmIChuYXZpZ2F0b3Iubm9kZWpzKSB7XG4gICAgcGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtO1xuICAgIGRldmljZSA9IHtcbiAgICAgIHBsYXRmb3JtOiBwbGF0Zm9ybSxcbiAgICAgIG5vZGVqczogdHJ1ZSxcbiAgICAgIG1vYmlsZTogcGxhdGZvcm0gPT09ICdpb3MnIHx8IHBsYXRmb3JtID09PSAnYW5kcm9pZCdcbiAgICB9O1xuICAgIHJldHVybiBkZXZpY2U7XG4gIH1cblxuICB2YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gIGlmICh1YS5tYXRjaCgvKGlQYWR8aVBob25lfGlQb2QpL2cpKSB7XG4gICAgcGxhdGZvcm0gPSAnaW9zJztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdBbmRyb2lkJykgIT09IC0xKSB7XG4gICAgcGxhdGZvcm0gPSAnYW5kcm9pZCc7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignTGludXgnKSAhPT0gLTEpIHtcbiAgICBwbGF0Zm9ybSA9ICdsaW51eCc7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignTWFjaW50b3NoJykgIT09IC0xKSB7XG4gICAgcGxhdGZvcm0gPSAnb3N4JztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdXaW5kb3dzJykgIT09IC0xKSB7XG4gICAgcGxhdGZvcm0gPSAnd2luZG93cyc7XG4gIH1cblxuICBpZiAodWEuaW5kZXhPZignQ2hyb21lJykgIT09IC0xKSB7XG4gICAgLy8gY2hyb21lLCBjaHJvbWl1bSBhbmQgY2FuYXJ5XG4gICAgYnJvd3NlciA9ICdjaHJvbWUnO1xuXG4gICAgaWYgKHVhLmluZGV4T2YoJ09QUicpICE9PSAtMSkge1xuICAgICAgYnJvd3NlciA9ICdvcGVyYSc7XG4gICAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdDaHJvbWl1bScpICE9PSAtMSkge1xuICAgICAgYnJvd3NlciA9ICdjaHJvbWl1bSc7XG4gICAgfVxuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1NhZmFyaScpICE9PSAtMSkge1xuICAgIGJyb3dzZXIgPSAnc2FmYXJpJztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdGaXJlZm94JykgIT09IC0xKSB7XG4gICAgYnJvd3NlciA9ICdmaXJlZm94JztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdUcmlkZW50JykgIT09IC0xKSB7XG4gICAgYnJvd3NlciA9ICdpZSc7XG4gICAgaWYgKHVhLmluZGV4T2YoJ01TSUUgOScpICE9PSAtMSkge1xuICAgICAgYnJvd3NlciA9ICdpZTknO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwbGF0Zm9ybSA9PT0gJ2lvcycpIHtcbiAgICBpZiAodWEuaW5kZXhPZignQ3JpT1MnKSAhPT0gLTEpIHtcbiAgICAgIGJyb3dzZXIgPSAnY2hyb21lJztcbiAgICB9XG4gIH1cblxuICBkZXZpY2UgPSB7XG4gICAgcGxhdGZvcm06IHBsYXRmb3JtLFxuICAgIGJyb3dzZXI6IGJyb3dzZXIsXG4gICAgbW9iaWxlOiBwbGF0Zm9ybSA9PT0gJ2lvcycgfHwgcGxhdGZvcm0gPT09ICdhbmRyb2lkJyxcbiAgICBub2RlanM6IGZhbHNlXG4gIH07XG4gIHJldHVybiBkZXZpY2U7XG59XG5cbmZ1bmN0aW9uIHBvbHlmaWxsUGVyZm9ybWFuY2UoKSB7XG4gIGlmICh0eXBlb2YgcGVyZm9ybWFuY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcGVyZm9ybWFuY2UgPSB7fTtcbiAgfVxuICBEYXRlLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBub3dPZmZzZXQgPSBEYXRlLm5vdygpO1xuICAgICAgaWYgKHR5cGVvZiBwZXJmb3JtYW5jZS50aW1pbmcgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBub3dPZmZzZXQgPSBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0O1xuICAgICAgfVxuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gbm93KCkge1xuICAgICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIG5vd09mZnNldDtcbiAgICAgIH07XG4gICAgfSkoKTtcbiAgfVxufVxuXG4vLyBhIHZlcnkgc2ltcGxlIGltcGxlbWVudGF0aW9uIG9mIGEgUHJvbWlzZSBmb3IgSW50ZXJuZXQgRXhwbG9yZXIgYW5kIE5vZGVqc1xuZnVuY3Rpb24gcG9seWZpbGxQcm9taXNlKHNjb3BlKSB7XG4gIGlmICh0eXBlb2Ygc2NvcGUuUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuXG4gICAgc2NvcGUuUHJvbWlzZSA9IGZ1bmN0aW9uIChleGVjdXRvcikge1xuICAgICAgdGhpcy5leGVjdXRvciA9IGV4ZWN1dG9yO1xuICAgIH07XG5cbiAgICBzY29wZS5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWYgKHR5cGVvZiByZXNvbHZlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlc29sdmUgPSBmdW5jdGlvbiByZXNvbHZlKCkge307XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHJlamVjdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZWplY3QgPSBmdW5jdGlvbiByZWplY3QoKSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICB2YXIgZGV2aWNlID0gZ2V0RGV2aWNlKCk7XG4gIGlmIChkZXZpY2UuYnJvd3NlciA9PT0gJ2llJykge1xuICAgIHBvbHlmaWxsUHJvbWlzZSh3aW5kb3cpO1xuICB9IGVsc2UgaWYgKGRldmljZS5ub2RlanMgPT09IHRydWUpIHtcbiAgICBwb2x5ZmlsbFByb21pc2UoZ2xvYmFsKTtcbiAgfVxuICBwb2x5ZmlsbFBlcmZvcm1hbmNlKCk7XG59IiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMubWFwKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRoaXMubWFwW25hbWVdLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcylcbiAgICAgIH0sIHRoaXMpXG4gICAgfSwgdGhpcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKG5hbWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHsgaXRlbXMucHVzaCh2YWx1ZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIC8vIE9ubHkgc3VwcG9ydCBBcnJheUJ1ZmZlcnMgZm9yIFBPU1QgbWV0aG9kLlxuICAgICAgICAvLyBSZWNlaXZpbmcgQXJyYXlCdWZmZXJzIGhhcHBlbnMgdmlhIEJsb2JzLCBpbnN0ZWFkLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQgOiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG4gICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpKSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gaW5wdXRcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gaGVhZGVycyh4aHIpIHtcbiAgICB2YXIgaGVhZCA9IG5ldyBIZWFkZXJzKClcbiAgICB2YXIgcGFpcnMgPSAoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdFxuICAgICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICAgIHJlcXVlc3QgPSBpbnB1dFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMoeGhyKSxcbiAgICAgICAgICB1cmw6IHJlc3BvbnNlVVJMKClcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiaW1wb3J0IHFhbWJpLCB7XG4gIFNvbmcsXG4gIFRyYWNrLFxuICBQYXJ0LFxuICBNSURJRXZlbnQsXG4gIFNpbXBsZVN5bnRoLFxuICBnZXRNSURJT3V0cHV0cyxcbn0gZnJvbSAncWFtYmknXG5cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG5cbiAgcWFtYmkuaW5pdCgpXG4gIC50aGVuKCgpID0+IHtcbiAgICBtYWluKClcbiAgfSlcbn0pXG5cblxuZnVuY3Rpb24gbWFpbigpe1xuICBsZXQgc29uZyA9IG5ldyBTb25nKHtiYXJzOiAyLCBhdXRvU2l6ZTogZmFsc2V9KVxuICBsZXQgdHJhY2sgPSBuZXcgVHJhY2soKVxuICBsZXQgcGFydCA9IG5ldyBQYXJ0KClcbiAgbGV0IHZlbG9jaXR5ID0gMTBcbiAgbGV0IG5vdGVEdXJhdGlvbiA9IDk1OVxuICBwYXJ0LmFkZEV2ZW50cyhcbiAgICBuZXcgTUlESUV2ZW50KDk2MCAqIDAsIDE0NCwgNjAsIHZlbG9jaXR5KSxcbiAgICBuZXcgTUlESUV2ZW50KDk2MCAqIDAgKyBub3RlRHVyYXRpb24sIDEyOCwgNjAsIDApLFxuICAgIG5ldyBNSURJRXZlbnQoOTYwICogMSwgMTQ0LCA2MiwgdmVsb2NpdHkpLFxuICAgIG5ldyBNSURJRXZlbnQoOTYwICogMSArIG5vdGVEdXJhdGlvbiwgMTI4LCA2MiwgMCksXG4gICAgbmV3IE1JRElFdmVudCg5NjAgKiAyLCAxNDQsIDY0LCB2ZWxvY2l0eSksXG4gICAgbmV3IE1JRElFdmVudCg5NjAgKiAyICsgbm90ZUR1cmF0aW9uLCAxMjgsIDY0LCAwKSxcbiAgICBuZXcgTUlESUV2ZW50KDk2MCAqIDMsIDE0NCwgNjUsIHZlbG9jaXR5KSxcbiAgICBuZXcgTUlESUV2ZW50KDk2MCAqIDMgKyBub3RlRHVyYXRpb24sIDEyOCwgNjUsIDApLFxuICAgIG5ldyBNSURJRXZlbnQoOTYwICogNCwgMTQ0LCA2NywgdmVsb2NpdHkpLFxuICAgIG5ldyBNSURJRXZlbnQoOTYwICogNCArIG5vdGVEdXJhdGlvbiwgMTI4LCA2NywgMCksXG4gICAgbmV3IE1JRElFdmVudCg5NjAgKiA1LCAxNDQsIDY1LCB2ZWxvY2l0eSksXG4gICAgbmV3IE1JRElFdmVudCg5NjAgKiA1ICsgbm90ZUR1cmF0aW9uLCAxMjgsIDY1LCAwKSxcbiAgICBuZXcgTUlESUV2ZW50KDk2MCAqIDYsIDE0NCwgNjQsIHZlbG9jaXR5KSxcbiAgICBuZXcgTUlESUV2ZW50KDk2MCAqIDYgKyBub3RlRHVyYXRpb24sIDEyOCwgNjQsIDApLFxuICAgIG5ldyBNSURJRXZlbnQoOTYwICogNywgMTQ0LCA2MiwgdmVsb2NpdHkpLFxuICAgIG5ldyBNSURJRXZlbnQoOTYwICogNyArIG5vdGVEdXJhdGlvbiwgMTI4LCA2MiwgMCksXG4gIClcblxuICB0cmFjay5hZGRQYXJ0cyhwYXJ0KVxuICB0cmFjay5zZXRJbnN0cnVtZW50KG5ldyBTaW1wbGVTeW50aCgnc2luZScpKVxuICB0cmFjay5jb25uZWN0TUlESU91dHB1dHMoLi4uZ2V0TUlESU91dHB1dHMoKSlcbiAgc29uZy5hZGRUcmFja3ModHJhY2spXG4gIHNvbmcudXBkYXRlKClcbiAgc29uZy5zZXRMZWZ0TG9jYXRvcignYmFyc2JlYXRzJywgMSlcbiAgc29uZy5zZXRSaWdodExvY2F0b3IoJ2JhcnNiZWF0cycsIDMpXG5cbiAgbGV0IGJ0blBsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheScpXG4gIGxldCBidG5QYXVzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXVzZScpXG4gIGxldCBidG5TdG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3AnKVxuICBsZXQgYnRuRGVsZXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbGV0ZScpXG4gIGxldCBidG5Mb29wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvb3AnKVxuICBsZXQgYnRuTWV0cm9ub21lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJvbm9tZScpXG4gIGxldCBkaXZUZW1wbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZW1wbycpXG4gIGxldCBkaXZQb3NpdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwb3NpdGlvbicpXG4gIGxldCBkaXZQb3NpdGlvblRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zaXRpb25fdGltZScpXG4gIGxldCByYW5nZVBvc2l0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXloZWFkJylcbiAgbGV0IHVzZXJJbnRlcmFjdGlvbiA9IGZhbHNlXG4gIGxldCBkZWxldGVkID0gZmFsc2VcbiAgbGV0IGxvb3BlZCA9IGZhbHNlXG5cbiAgYnRuUGxheS5kaXNhYmxlZCA9IGZhbHNlXG4gIGJ0blBhdXNlLmRpc2FibGVkID0gZmFsc2VcbiAgYnRuU3RvcC5kaXNhYmxlZCA9IGZhbHNlXG4gIGJ0bkxvb3AuZGlzYWJsZWQgPSBmYWxzZVxuICBidG5EZWxldGUuZGlzYWJsZWQgPSBmYWxzZVxuICBidG5NZXRyb25vbWUuZGlzYWJsZWQgPSBmYWxzZVxuXG5cbiAgYnRuTWV0cm9ub21lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzb25nLnNldE1ldHJvbm9tZSgpIC8vIGlmIG5vIGFyZ3VtZW50cyBhcmUgcHJvdmlkZWQgaXQgc2ltcGx5IHRvZ2dsZXNcbiAgICBidG5NZXRyb25vbWUuaW5uZXJIVE1MID0gc29uZy51c2VNZXRyb25vbWUgPyAnbWV0cm9ub21lIG9mZicgOiAnbWV0cm9ub21lIG9uJ1xuICB9KVxuXG4gIGJ0blBsYXkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHNvbmcucGxheSgpXG4gIH0pXG5cbiAgYnRuUGF1c2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHNvbmcucGF1c2UoKVxuICB9KVxuXG4gIGJ0blN0b3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHNvbmcuc3RvcCgpXG4gIH0pXG5cbiAgYnRuTG9vcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgbG9vcGVkID0gIWxvb3BlZFxuICAgIGlmKGxvb3BlZCl7XG4gICAgICBidG5Mb29wLmlubmVySFRNTCA9ICdsb29wIG9mZidcbiAgICB9ZWxzZSB7XG4gICAgICBidG5Mb29wLmlubmVySFRNTCA9ICdsb29wIG9uJ1xuICAgIH1cbiAgICBzb25nLnNldExvb3AobG9vcGVkKVxuICB9KVxuXG4gIGJ0bkRlbGV0ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgZGVsZXRlZCA9ICFkZWxldGVkXG4gICAgaWYoZGVsZXRlZCl7XG4gICAgICBidG5EZWxldGUuaW5uZXJIVE1MID0gJ3VuZG8gcmVtb3ZlJ1xuICAgICAgLy90cmFjay5yZW1vdmVQYXJ0cyhwYXJ0KVxuICAgICAgc29uZy5yZW1vdmVQYXJ0cyh0cmFjaylcbiAgICAgIHNvbmcudXBkYXRlKClcbiAgICB9ZWxzZSB7XG4gICAgICBidG5EZWxldGUuaW5uZXJIVE1MID0gJ3JlbW92ZSB0cmFjaydcbiAgICAgIHNvbmcuYWRkVHJhY2sodHJhY2spXG4gICAgICAvL3RyYWNrLmFkZFBhcnRzKHBhcnQpXG4gICAgICBzb25nLnVwZGF0ZSgpXG4gICAgfVxuICB9KVxuXG4gIGxldCBwb3NpdGlvbiA9IHNvbmcuZ2V0UG9zaXRpb24oKVxuICBkaXZQb3NpdGlvbi5pbm5lckhUTUwgPSBwb3NpdGlvbi5iYXJzQXNTdHJpbmdcbiAgZGl2UG9zaXRpb25UaW1lLmlubmVySFRNTCA9IHBvc2l0aW9uLnRpbWVBc1N0cmluZ1xuICBkaXZUZW1wby5pbm5lckhUTUwgPSBgdGVtcG86ICR7cG9zaXRpb24uYnBtfSBicG1gXG5cbiAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdwb3NpdGlvbicsIGV2ZW50ID0+IHtcbiAgICBkaXZQb3NpdGlvbi5pbm5lckhUTUwgPSBldmVudC5kYXRhLmJhcnNBc1N0cmluZ1xuICAgIGRpdlBvc2l0aW9uVGltZS5pbm5lckhUTUwgPSBldmVudC5kYXRhLnRpbWVBc1N0cmluZ1xuICAgIGRpdlRlbXBvLmlubmVySFRNTCA9IGB0ZW1wbzogJHtldmVudC5kYXRhLmJwbX0gYnBtYFxuICAgIGlmKCF1c2VySW50ZXJhY3Rpb24pe1xuICAgICAgcmFuZ2VQb3NpdGlvbi52YWx1ZSA9IGV2ZW50LmRhdGEucGVyY2VudGFnZVxuICAgIH1cbiAgfSlcblxuXG4gIHJhbmdlUG9zaXRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGUgPT4ge1xuICAgIHJhbmdlUG9zaXRpb24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmFuZ2VMaXN0ZW5lcilcbiAgICB1c2VySW50ZXJhY3Rpb24gPSBmYWxzZVxuICB9KVxuXG4gIHJhbmdlUG9zaXRpb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZSA9PiB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc29uZy5zZXRQb3NpdGlvbigncGVyY2VudGFnZScsIGUudGFyZ2V0LnZhbHVlQXNOdW1iZXIpXG4gICAgfSwgMClcbiAgICByYW5nZVBvc2l0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHJhbmdlTGlzdGVuZXIpXG4gICAgdXNlckludGVyYWN0aW9uID0gdHJ1ZVxuICB9KVxuXG4gIGNvbnN0IHJhbmdlTGlzdGVuZXIgPSBmdW5jdGlvbihlKXtcbiAgICBzb25nLnNldFBvc2l0aW9uKCdwZXJjZW50YWdlJywgZS50YXJnZXQudmFsdWVBc051bWJlcilcbiAgfVxufVxuIl19
