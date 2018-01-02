(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _qambi = require('qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {

  var song = void 0;
  var track = void 0;
  var sampler = void 0;
  var basePath = '../../'; // you may have to adjust this path according to your folder layout

  _qambi2.default.init().then(function () {
    song = new _qambi.Song();
    track = new _qambi.Track();
    sampler = new _qambi.Sampler();
    song.addTracks(track);
    track.setInstrument(sampler);
    track.monitor = true;
    initUI();
  });

  function initUI() {

    // setup drowndown menu for MIDI inputs

    var selectMIDIIn = document.getElementById('midiin');
    var MIDIInputs = (0, _qambi.getMIDIInputs)();
    var html = '<option id="-1">select MIDI in</option>';

    MIDIInputs.forEach(function (port) {
      html += '<option id="' + port.id + '">' + port.name + '</option>';
    });
    selectMIDIIn.innerHTML = html;

    selectMIDIIn.addEventListener('change', function () {
      var portId = selectMIDIIn.options[selectMIDIIn.selectedIndex].id;
      track.disconnectMIDIInputs(); // no arguments means disconnect from all inputs
      track.connectMIDIInputs(portId);
    });

    // setup drowndown menu for banks and instruments

    var selectBank = document.getElementById('bank');
    var selectInstrument = document.getElementById('instrument');
    var path = basePath + '/instruments/heartbeat';

    var optionsHeartbeat = '<option id="select">select instrument</option>';
    var heartbeatInstruments = (0, _qambi.getInstruments)();
    heartbeatInstruments.forEach(function (instr, key) {
      optionsHeartbeat += '<option id="' + key + '">' + instr.name + '</option>';
    });

    var gmInstruments = (0, _qambi.getGMInstruments)();
    var optionsGM = '<option id="select">select instrument</option>';
    gmInstruments.forEach(function (instr, key) {
      optionsGM += '<option id="' + key + '">' + instr.name + '</option>';
    });

    selectBank.addEventListener('change', function () {
      var key = selectBank.options[selectBank.selectedIndex].id;
      console.log(key);
      if (key === 'heartbeat') {
        selectInstrument.innerHTML = optionsHeartbeat;
        path = basePath + '/instruments/heartbeat';
      } else if (key === 'fluidsynth') {
        selectInstrument.innerHTML = optionsGM;
        path = basePath + '/instruments/fluidsynth';
      }
    });

    selectInstrument.innerHTML = optionsHeartbeat;
    selectInstrument.addEventListener('change', function () {
      var key = selectInstrument.options[selectInstrument.selectedIndex].id;
      var url = path + '/' + key + '.json';

      // option 1: clear the samples of the currently loaded instrument after the new samples have been loaded
      sampler.parseSampleData({ url: url, clearAll: true }).then(function () {
        console.log('loaded: ' + key);
      });
      /*
            // option 2: clear the samples of the currently loaded instrument before loading the new samples
            sampler.clearAllSampleData()
            sampler.parseSampleData({url})
            .then(() => {
              console.log(`loaded: ${key}`)
            })
      */
    });
  }
});

},{"qambi":26}],2:[function(require,module,exports){
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

},{"whatwg-fetch":50}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
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
    var timeout = runTimeout(cleanUpNextTick);
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
    runClearTimeout(timeout);
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
        runTimeout(drainQueue);
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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
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
},{"./init_audio":12}],6:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (ConvolutionReverb.__proto__ || Object.getPrototypeOf(ConvolutionReverb)).call(this));

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
},{"./channel_fx":5,"./init_audio":12,"./parse_audio":21}],8:[function(require,module,exports){
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
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Delay);

    var _this = _possibleConstructorReturn(this, (Delay.__proto__ || Object.getPrototypeOf(Delay)).call(this));

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
},{"./channel_fx":5,"./init_audio":12}],9:[function(require,module,exports){
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
        var _step3$value = _slicedToArray(_step3.value, 2),
            key = _step3$value[0],
            value = _step3$value[1];

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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
  var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


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
},{"./init_audio":12,"./init_midi":13,"./qambi":26,"./sampler":30,"./settings":34,"./song":36}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureMasterCompressor = exports.enableMasterCompressor = exports.getCompressionReduction = exports.getMasterVolume = exports.setMasterVolume = exports.masterCompressor = exports.unlockWebAudio = exports.masterGain = exports.context = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /*
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
  exports.masterGain = masterGain = context.createGain();
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
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.5;

  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.setMasterVolume = _setMasterVolume = function setMasterVolume() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.5;

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
  exports.unlockWebAudio = _unlockWebAudio = function unlockWebAudio() {
    //console.log('already done')
  };
};

exports.masterGain = masterGain;
exports.unlockWebAudio = _unlockWebAudio;
exports.masterCompressor = compressor;
exports.setMasterVolume = _setMasterVolume;
exports.getMasterVolume = _getMasterVolume;
exports.getCompressionReduction = _getCompressionReduction;
exports.enableMasterCompressor = _enableMasterCompressor;
exports.configureMasterCompressor = _configureMasterCompressor;
},{"./parse_audio":21,"./samples":31}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMIDIInputById = exports.getMIDIOutputById = exports.getMIDIInputIds = exports.getMIDIOutputIds = exports.getMIDIInputs = exports.getMIDIOutputs = exports.getMIDIAccess = undefined;
exports.initMIDI = initMIDI;

var _util = require('./util');

require('web-midi-api-shim');

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
},{"./util":40,"web-midi-api-shim":41}],14:[function(require,module,exports){
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
},{"./eventlistener":9,"./init_audio":12}],15:[function(require,module,exports){
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
      var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'init';

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
      var startBar = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      var _part;

      var endBar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.song.bars;
      var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'init';

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
      var startBar = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      var _events, _part2;

      var endBar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.song.bars;
      var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'add';

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
},{"./constants":6,"./init_audio":12,"./midi_event":16,"./parse_events":22,"./part":23,"./position":25,"./sampler":30,"./track":39,"./util":40}],16:[function(require,module,exports){
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
    var data2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;
    var channel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

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
},{"./note":20,"./settings":34}],17:[function(require,module,exports){
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
},{"./midi_event":16}],18:[function(require,module,exports){
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
      var toString = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

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
},{}],19:[function(require,module,exports){
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
},{"./midi_stream":18}],20:[function(require,module,exports){
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
  var fullName = settings.fullName,
      name = settings.name,
      octave = settings.octave,
      mode = settings.mode,
      number = settings.number,
      frequency = settings.frequency;

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
    //console.log(data)
  };return data;
}

function _getNoteName(number) {
  var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noteNameMode;

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
},{"./settings":34}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
  var every = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

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
    var key = void 0;
    mapping.forEach(function (sample) {
      // key is deliberately undefined
      getPromises(promises, sample, key, baseUrl, every);
    });
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
},{"./eventlistener":9,"./init_audio":12,"./util":40,"isomorphic-fetch":3}],22:[function(require,module,exports){
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
  var fast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

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
  var isPlaying = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

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
  var isPlaying = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

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
  var fast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

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
},{"./midi_note":17,"./util":40}],23:[function(require,module,exports){
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
    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      // can be use as findEvents
      if (this._needsUpdate) {
        this.update();
      }
      return [].concat(_toConsumableArray(this._events)); //@TODO implement filter -> filterEvents() should be a utility function (not a class method)
    }
  }, {
    key: 'mute',
    value: function mute() {
      var flag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

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
},{"./util":40}],24:[function(require,module,exports){
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
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'all';

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
},{"./eventlistener.js":9,"./position.js":25,"./util.js":40}],25:[function(require,module,exports){
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
  var beos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  beyondEndOfSong = beos;
  fromMillis(song, targetMillis);
  //return round(ticks);
  return ticks;
}

function ticksToMillis(song, targetTicks) {
  var beos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

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
  var beos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  beyondEndOfSong = beos;
  fromTicks(song, target);
  calculateBarsAndBeats();
  returnType = 'barsandbeats';
  return getPositionData();
}

function millisToBars(song, target) {
  var beos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

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
  var event = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

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
  var type = settings.type,
      target = settings.target,
      _settings$result = settings.result,
      result = _settings$result === undefined ? 'all' : _settings$result,
      _settings$beos = settings.beos,
      beos = _settings$beos === undefined ? true : _settings$beos,
      _settings$snap = settings.snap,
      snap = _settings$snap === undefined ? -1 : _settings$snap;


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
      var _target = _slicedToArray(target, 4),
          _target$ = _target[0],
          targetbar = _target$ === undefined ? 1 : _target$,
          _target$2 = _target[1],
          targetbeat = _target$2 === undefined ? 1 : _target$2,
          _target$3 = _target[2],
          targetsixteenth = _target$3 === undefined ? 1 : _target$3,
          _target$4 = _target[3],
          targettick = _target$4 === undefined ? 0 : _target$4;
      //console.log(targetbar, targetbeat, targetsixteenth, targettick)


      fromBars(song, targetbar, targetbeat, targetsixteenth, targettick);
      return getPositionData(song);

    case 'time':
      // calculate millis out of time array: hours, minutes, seconds, millis
      var _target2 = _slicedToArray(target, 4),
          _target2$ = _target2[0],
          targethour = _target2$ === undefined ? 0 : _target2$,
          _target2$2 = _target2[1],
          targetminute = _target2$2 === undefined ? 0 : _target2$2,
          _target2$3 = _target2[2],
          targetsecond = _target2$3 === undefined ? 0 : _target2$3,
          _target2$4 = _target2[3],
          targetmillisecond = _target2$4 === undefined ? 0 : _target2$4;

      var _millis = 0;
      _millis += targethour * 60 * 60 * 1000; //hours
      _millis += targetminute * 60 * 1000; //minutes
      _millis += targetsecond * 1000; //seconds
      _millis += targetmillisecond; //milliseconds

      fromMillis(song, _millis);
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
},{"./util":40}],26:[function(require,module,exports){
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

var version = '1.0.0-beta35';

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
exports.init = _init.init;
exports.getInstruments = _settings.getInstruments;
exports.getGMInstruments = _settings.getGMInstruments;
exports.updateSettings = _settings.updateSettings;
exports.getSettings = _settings.getSettings;
exports.MIDIEventTypes = _constants.MIDIEventTypes;
exports.parseSamples = _parse_audio.parseSamples;
exports.parseMIDIFile = _midifile.parseMIDIFile;
exports.getAudioContext = getAudioContext;
exports.getMasterVolume = _init_audio.getMasterVolume;
exports.setMasterVolume = _init_audio.setMasterVolume;
exports.getMIDIAccess = _init_midi.getMIDIAccess;
exports.getMIDIInputs = _init_midi.getMIDIInputs;
exports.getMIDIOutputs = _init_midi.getMIDIOutputs;
exports.getMIDIInputIds = _init_midi.getMIDIInputIds;
exports.getMIDIOutputIds = _init_midi.getMIDIOutputIds;
exports.getMIDIInputsById = _init_midi.getMIDIInputsById;
exports.getMIDIOutputsById = _init_midi.getMIDIOutputsById;
exports.getNoteData = _note.getNoteData;
exports.MIDIEvent = _midi_event.MIDIEvent;
exports.MIDINote = _midi_note.MIDINote;
exports.Song = _song.Song;
exports.Track = _track.Track;
exports.Part = _part.Part;
exports.Instrument = _instrument.Instrument;
exports.SimpleSynth = _simple_synth.SimpleSynth;
exports.Sampler = _sampler.Sampler;
exports.ConvolutionReverb = _convolution_reverb.ConvolutionReverb;
exports.Delay = _delay_fx.Delay;
},{"./constants":6,"./convolution_reverb":7,"./delay_fx":8,"./eventlistener":9,"./init":11,"./init_audio":12,"./init_midi":13,"./instrument":14,"./midi_event":16,"./midi_note":17,"./midifile":19,"./note":20,"./parse_audio":21,"./part":23,"./sampler":30,"./settings":34,"./simple_synth":35,"./song":36,"./track":39}],27:[function(require,module,exports){
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
      var _sampleData = this.sampleData,
          sustainStart = _sampleData.sustainStart,
          sustainEnd = _sampleData.sustainEnd;
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

      var _sampleData2 = this.sampleData,
          releaseDuration = _sampleData2.releaseDuration,
          releaseEnvelope = _sampleData2.releaseEnvelope,
          releaseEnvelopeArray = _sampleData2.releaseEnvelopeArray;
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
},{"./init_audio.js":12,"./util.js":40}],28:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (SampleBuffer.__proto__ || Object.getPrototypeOf(SampleBuffer)).call(this, sampleData, event));

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
      var _sampleData = this.sampleData,
          sustainStart = _sampleData.sustainStart,
          sustainEnd = _sampleData.sustainEnd,
          segmentStart = _sampleData.segmentStart,
          segmentDuration = _sampleData.segmentDuration;
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
},{"./init_audio":12,"./sample":27}],29:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (SampleOscillator.__proto__ || Object.getPrototypeOf(SampleOscillator)).call(this, sampleData, event));

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
},{"./init_audio":12,"./sample":27}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sampler = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

    var _this = _possibleConstructorReturn(this, (Sampler.__proto__ || Object.getPrototypeOf(Sampler)).call(this));

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

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      //console.log(data)
      var note = data.note,
          _data$buffer = data.buffer,
          buffer = _data$buffer === undefined ? null : _data$buffer,
          _data$sustain = data.sustain,
          sustain = _data$sustain === undefined ? [null, null] : _data$sustain,
          _data$segment = data.segment,
          segment = _data$segment === undefined ? [null, null] : _data$segment,
          _data$release = data.release,
          release = _data$release === undefined ? [null, 'linear'] : _data$release,
          _data$pan = data.pan,
          pan = _data$pan === undefined ? null : _data$pan,
          _data$velocity = data.velocity,
          velocity = _data$velocity === undefined ? [0, 127] : _data$velocity;


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

      var _sustain = _slicedToArray(sustain, 2),
          sustainStart = _sustain[0],
          sustainEnd = _sustain[1];

      var _release = _slicedToArray(release, 2),
          releaseDuration = _release[0],
          releaseEnvelope = _release[1];

      var _segment = _slicedToArray(segment, 2),
          segmentStart = _segment[0],
          segmentDuration = _segment[1];

      var _velocity = _slicedToArray(velocity, 2),
          velocityStart = _velocity[0],
          velocityEnd = _velocity[1];

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
},{"./fetch_helpers":10,"./instrument":14,"./note":20,"./parse_audio":21,"./sample_buffer":28,"./util":40}],31:[function(require,module,exports){
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
},{}],32:[function(require,module,exports){
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
  var fileName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : song.name;
  var ppq = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 960;


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
  var instrumentName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'no instrument';

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
},{"filesaverjs":2}],33:[function(require,module,exports){
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
},{"./init_audio":12,"./init_midi":13,"./midi_event":16,"./util":40}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (SimpleSynth.__proto__ || Object.getPrototypeOf(SimpleSynth)).call(this));

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
},{"./instrument":14,"./sample_oscillator":29}],36:[function(require,module,exports){
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
    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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

    var tracks = settings.tracks,
        timeEvents = settings.timeEvents;
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
        if (config.ppq === this.ppq) {
          return;
        }
        var ppqFactor = config.ppq / this.ppq;
        this.ppq = config.ppq;
        this._allEvents.forEach(function (e) {
          e.ticks = event.ticks * ppqFactor;
        });
        this._updateTimeEvents = true;
        this.update();
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
      var flag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


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
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

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
},{"./constants":6,"./eventlistener":9,"./init_audio":12,"./metronome":15,"./midi_event":16,"./parse_events":22,"./playhead":24,"./position":25,"./save_midifile":32,"./scheduler":33,"./settings":34,"./song.update":37,"./song_from_midifile":38,"./util":40}],37:[function(require,module,exports){
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
},{"./constants":6,"./eventlistener":9,"./midi_event":16,"./parse_events":22,"./position":25,"./util":40}],38:[function(require,module,exports){
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
  var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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
  var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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
},{"./fetch_helpers":10,"./midi_event":16,"./midifile":19,"./part":23,"./settings":34,"./song":36,"./track":39,"./util":40,"isomorphic-fetch":3}],39:[function(require,module,exports){
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
    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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

    var parts = settings.parts,
        instrument = settings.instrument;

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
      var instrument = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

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
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      // can be use as findEvents
      if (this._needsUpdate) {
        this.update();
      }
      return [].concat(_toConsumableArray(this._events)); //@TODO implement filter -> filterEvents() should be a utility function (not a class method)
    }
  }, {
    key: 'mute',
    value: function mute() {
      var flag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

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
},{"./eventlistener":9,"./init_audio":12,"./init_midi":13,"./midi_event":16,"./midi_note":17,"./part":23,"./qambi":26,"./util":40}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
},{"isomorphic-fetch":3}],41:[function(require,module,exports){
'use strict';

var _midi_access = require('./midi/midi_access');

var _util = require('./util/util');

var _midi_input = require('./midi/midi_input');

var _midi_output = require('./midi/midi_output');

var _midimessage_event = require('./midi/midimessage_event');

var midiAccess = void 0;

var init = function init() {
    if (!navigator.requestMIDIAccess) {
        // Add some functionality to older browsers
        (0, _util.polyfill)();

        navigator.requestMIDIAccess = function () {
            // Singleton-ish, no need to create multiple instances of MIDIAccess
            if (midiAccess === undefined) {
                midiAccess = (0, _midi_access.createMIDIAccess)();
                // Add WebMIDI API globals
                var scope = (0, _util.getScope)();
                scope.MIDIInput = _midi_input.MIDIInput;
                scope.MIDIOutput = _midi_output.MIDIOutput;
                scope.MIDIMessageEvent = _midimessage_event.MIDIMessageEvent;
            }
            return midiAccess;
        };
        if ((0, _util.getDevice)().nodejs === true) {
            navigator.close = function () {
                // For Nodejs applications we need to add a method that closes all MIDI input ports,
                // otherwise Nodejs will wait for MIDI input forever.
                (0, _midi_access.closeAllMIDIInputs)();
            };
        }
    }
};

init();

},{"./midi/midi_access":42,"./midi/midi_input":43,"./midi/midi_output":44,"./midi/midimessage_event":46,"./util/util":49}],42:[function(require,module,exports){
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         is in line with the behavior of the native MIDIAccess object.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

exports.createMIDIAccess = createMIDIAccess;
exports.dispatchEvent = dispatchEvent;
exports.closeAllMIDIInputs = closeAllMIDIInputs;
exports.getMIDIDeviceId = getMIDIDeviceId;

var _midi_input = require('./midi_input');

var _midi_input2 = _interopRequireDefault(_midi_input);

var _midi_output = require('./midi_output');

var _midi_output2 = _interopRequireDefault(_midi_output);

var _midiconnection_event = require('./midiconnection_event');

var _midiconnection_event2 = _interopRequireDefault(_midiconnection_event);

var _jazz_instance = require('../util/jazz_instance');

var _util = require('../util/util');

var _store = require('../util/store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var midiAccess = void 0;
var jazzInstance = void 0;
var midiInputs = new _store2.default();
var midiOutputs = new _store2.default();
var midiInputIds = new _store2.default();
var midiOutputIds = new _store2.default();
var listeners = new _store2.default();

var MIDIAccess = function () {
    function MIDIAccess(midiInputs, midiOutputs) {
        _classCallCheck(this, MIDIAccess);

        this.sysexEnabled = true;
        this.inputs = midiInputs;
        this.outputs = midiOutputs;
    }

    _createClass(MIDIAccess, [{
        key: 'addEventListener',
        value: function addEventListener(type, listener) {
            if (type !== 'statechange') {
                return;
            }
            if (listeners.has(listener) === false) {
                listeners.add(listener);
            }
        }
    }, {
        key: 'removeEventListener',
        value: function removeEventListener(type, listener) {
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
    return new Promise(function (resolve, reject) {
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
                reject({ message: 'No access to MIDI devices: your browser does not support the WebMIDI API and the Jazz plugin is not installed.' });
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
            port = new _midi_input2.default(info, instance);
            midiInputs.set(port.id, port);
        } else if (type === 'output') {
            if (instance.Support('MidiOutInfo')) {
                info = instance.MidiOutInfo(name);
            }
            port = new _midi_output2.default(info, instance);
            midiOutputs.set(port.id, port);
        }
        callback(port);
    });
}

// lookup function: Jazz gives us the name of the connected/disconnected MIDI devices but we have stored them by id
function getPortByName(ports, name) {
    var port = void 0;
    var values = ports.values();
    for (var i = 0; i < values.length; i += 1) {
        port = values[i];
        if (port.name === name) {
            break;
        }
    }
    return port;
}

// keep track of connected/disconnected MIDI devices
function setupListeners() {
    jazzInstance.OnDisconnectMidiIn(function (name) {
        var port = getPortByName(midiInputs, name);
        if (port !== undefined) {
            port.state = 'disconnected';
            port.close();
            port._jazzInstance.inputInUse = false;
            midiInputs.delete(port.id);
            dispatchEvent(port);
        }
    });

    jazzInstance.OnDisconnectMidiOut(function (name) {
        var port = getPortByName(midiOutputs, name);
        if (port !== undefined) {
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
    port.dispatchEvent(new _midiconnection_event2.default(port, port));

    var evt = new _midiconnection_event2.default(midiAccess, port);

    if (typeof midiAccess.onstatechange === 'function') {
        midiAccess.onstatechange(evt);
    }
    listeners.forEach(function (listener) {
        return listener(evt);
    });
}

function closeAllMIDIInputs() {
    midiInputs.forEach(function (input) {
        // input.close();
        input._jazzInstance.MidiInClose();
    });
}

// check if we have already created a unique id for this device, if so: reuse it, if not: create a new id and store it
function getMIDIDeviceId(name, type) {
    var id = void 0;
    if (type === 'input') {
        id = midiInputIds.get(name);
        if (id === undefined) {
            id = (0, _util.generateUUID)();
            midiInputIds.set(name, id);
        }
    } else if (type === 'output') {
        id = midiOutputIds.get(name);
        if (id === undefined) {
            id = (0, _util.generateUUID)();
            midiOutputIds.set(name, id);
        }
    }
    return id;
}

},{"../util/jazz_instance":47,"../util/store":48,"../util/util":49,"./midi_input":43,"./midi_output":44,"./midiconnection_event":45}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       MIDIInput is a wrapper around an input of a Jazz instance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

var _midimessage_event = require('./midimessage_event');

var _midimessage_event2 = _interopRequireDefault(_midimessage_event);

var _midiconnection_event = require('./midiconnection_event');

var _midiconnection_event2 = _interopRequireDefault(_midiconnection_event);

var _midi_access = require('./midi_access');

var _util = require('../util/util');

var _store = require('../util/store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var midiProc = void 0;
var nodejs = (0, _util.getDevice)().nodejs;

var MIDIInput = function () {
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

        this._listeners = new _store2.default().set('midimessage', new _store2.default()).set('statechange', new _store2.default());
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
        value: function addEventListener(type, listener) {
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
        value: function removeEventListener(type, listener) {
            var listeners = this._listeners.get(type);
            if (typeof listeners === 'undefined') {
                return;
            }

            if (listeners.has(listener) === true) {
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
                    j += 1;
                    this._appendToSysexBuffer(data.slice(initialOffset, j));
                    return j;
                }
                j += 1;
            }
            // didn't reach the end; just tack it on.
            this._appendToSysexBuffer(data.slice(initialOffset, j));
            this._inLongSysexMessage = true;
            return j;
        }
    }]);

    return MIDIInput;
}();

exports.default = MIDIInput;


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
            var e = new _midimessage_event2.default(this, evt.data, evt.receivedTime);
            this.dispatchEvent(e);
        }
    }
};

},{"../util/store":48,"../util/util":49,"./midi_access":42,"./midiconnection_event":45,"./midimessage_event":46}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       MIDIOutput is a wrapper around an output of a Jazz instance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */


var _util = require('../util/util');

var _store = require('../util/store');

var _store2 = _interopRequireDefault(_store);

var _midi_access = require('./midi_access');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIDIOutput = function () {
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

        this._listeners = new _store2.default();
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
        value: function addEventListener(type, listener) {
            if (type !== 'statechange') {
                return;
            }

            if (this._listeners.has(listener) === false) {
                this._listeners.add(listener);
            }
        }
    }, {
        key: 'removeEventListener',
        value: function removeEventListener(type, listener) {
            if (type !== 'statechange') {
                return;
            }

            if (this._listeners.has(listener) === true) {
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

exports.default = MIDIOutput;

},{"../util/store":48,"../util/util":49,"./midi_access":42}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIDIConnectionEvent = function MIDIConnectionEvent(midiAccess, port) {
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

exports.default = MIDIConnectionEvent;

},{}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MIDIMessageEvent = function MIDIMessageEvent(port, data, receivedTime) {
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

exports.default = MIDIMessageEvent;

},{}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createJazzInstance = createJazzInstance;
exports.getJazzInstance = getJazzInstance;

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-underscore-dangle: 0 */

/*
  Creates instances of the Jazz plugin if necessary. Initially the MIDIAccess creates one main Jazz instance that is used
  to query all initially connected devices, and to track the devices that are being connected or disconnected at runtime.

  For every MIDIInput and MIDIOutput that is created, MIDIAccess queries the getJazzInstance() method for a Jazz instance
  that still have an available input or output. Because Jazz only allows one input and one output per instance, we
  need to create new instances if more than one MIDI input or output device gets connected.

  Note that an existing Jazz instance doesn't get deleted when both its input and output device are disconnected; instead it
  will be reused if a new device gets connected.
*/

var jazzPluginInitTime = (0, _util.getDevice)().browser === 'firefox' ? 200 : 100; // 200 ms timeout for Firefox v.55

var jazzInstanceNumber = 0;
var jazzInstances = new _store2.default();

function createJazzInstance(callback) {
    var id = 'jazz_' + jazzInstanceNumber + '_' + Date.now();
    jazzInstanceNumber += 1;
    var objRef = void 0;
    var activeX = void 0;

    if ((0, _util.getDevice)().nodejs === true) {
        // jazzMidi is added to the global variable navigator in the node environment
        objRef = new navigator.jazzMidi.MIDI();
    } else {
        /*
            generate this html:
             <object id="Jazz1" classid="CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90" class="hidden">
                <object id="Jazz2" type="audio/x-jazz" class="hidden">
                    <p style="visibility:visible;">This page requires <a href=http://jazz-soft.net>Jazz-Plugin</a> ...</p>
                </object>
            </object>
        */

        activeX = document.createElement('object');
        activeX.id = id + 'ie';
        activeX.classid = 'CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90';

        objRef = document.createElement('object');
        objRef.id = id;
        objRef.type = 'audio/x-jazz';

        activeX.appendChild(objRef);

        var p = document.createElement('p');
        p.appendChild(document.createTextNode('This page requires the '));

        var a = document.createElement('a');
        a.appendChild(document.createTextNode('Jazz plugin'));
        a.href = 'http://jazz-soft.net/';

        p.appendChild(a);
        p.appendChild(document.createTextNode('.'));

        objRef.appendChild(p);

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
        insertionPoint.appendChild(activeX);
    }

    setTimeout(function () {
        var instance = null;
        if (objRef.isJazz === true) {
            instance = objRef;
        } else if (activeX.isJazz === true) {
            instance = activeX;
        }
        if (instance !== null) {
            instance._perfTimeZero = performance.now();
            jazzInstances.set(jazzInstanceNumber, instance);
        }
        callback(instance);
    }, jazzPluginInitTime);
}

function getJazzInstance(type, callback) {
    var key = type === 'input' ? 'inputInUse' : 'outputInUse';
    var instance = null;

    var values = jazzInstances.values();
    for (var i = 0; i < values.length; i += 1) {
        var inst = values[i];
        if (inst[key] !== true) {
            instance = inst;
            break;
        }
    }

    if (instance === null) {
        createJazzInstance(callback);
    } else {
        callback(instance);
    }
}

},{"./store":48,"./util":49}],48:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// es5 implementation of both Map and Set

var idIndex = 0;

var Store = function () {
    function Store() {
        _classCallCheck(this, Store);

        this.store = {};
        this.keys = [];
    }

    _createClass(Store, [{
        key: "add",
        value: function add(obj) {
            var id = "" + new Date().getTime() + idIndex;
            idIndex += 1;
            this.keys.push(id);
            this.store[id] = obj;
        }
    }, {
        key: "set",
        value: function set(id, obj) {
            this.keys.push(id);
            this.store[id] = obj;
            return this;
        }
    }, {
        key: "get",
        value: function get(id) {
            return this.store[id];
        }
    }, {
        key: "has",
        value: function has(id) {
            return this.keys.indexOf(id) !== -1;
        }
    }, {
        key: "delete",
        value: function _delete(id) {
            delete this.store[id];
            var index = this.keys.indexOf(id);
            if (index > -1) {
                this.keys.splice(index, 1);
            }
            return this;
        }
    }, {
        key: "values",
        value: function values() {
            var elements = [];
            var l = this.keys.length;
            for (var i = 0; i < l; i += 1) {
                var element = this.store[this.keys[i]];
                elements.push(element);
            }
            return elements;
        }
    }, {
        key: "forEach",
        value: function forEach(cb) {
            var l = this.keys.length;
            for (var i = 0; i < l; i += 1) {
                var element = this.store[this.keys[i]];
                cb(element);
            }
        }
    }, {
        key: "clear",
        value: function clear() {
            this.keys = [];
            this.store = {};
        }
    }]);

    return Store;
}();

exports.default = Store;

},{}],49:[function(require,module,exports){
(function (process,global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getScope = getScope;
exports.getDevice = getDevice;
exports.generateUUID = generateUUID;
exports.polyfill = polyfill;
var Scope = void 0;
var device = null;

// check if we are in a browser or in Nodejs
function getScope() {
    if (typeof Scope !== 'undefined') {
        return Scope;
    }
    Scope = null;
    if (typeof window !== 'undefined') {
        Scope = window;
    } else if (typeof global !== 'undefined') {
        Scope = global;
    }
    // console.log('scope', scope);
    return Scope;
}

// check on what type of device we are running, note that in this context
// a device is a computer not a MIDI device
function getDevice() {
    var scope = getScope();
    if (device !== null) {
        return device;
    }

    var platform = 'undetected';
    var browser = 'undetected';

    if (scope.navigator.node === true) {
        device = {
            platform: process.platform,
            nodejs: true,
            mobile: platform === 'ios' || platform === 'android'
        };
        return device;
    }

    var ua = scope.navigator.userAgent;

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

// polyfill for window.performance.now()
var polyfillPerformance = function polyfillPerformance() {
    var scope = getScope();
    if (typeof scope.performance === 'undefined') {
        scope.performance = {};
    }
    Date.now = Date.now || function () {
        return new Date().getTime();
    };

    if (typeof scope.performance.now === 'undefined') {
        var nowOffset = Date.now();
        if (typeof scope.performance.timing !== 'undefined' && typeof scope.performance.timing.navigationStart !== 'undefined') {
            nowOffset = scope.performance.timing.navigationStart;
        }
        scope.performance.now = function now() {
            return Date.now() - nowOffset;
        };
    }
};

// generates UUID for MIDI devices
function generateUUID() {
    var d = new Date().getTime();
    var uuid = new Array(64).join('x'); // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    uuid = uuid.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : r & 0x3 | 0x8).toString(16).toUpperCase();
    });
    return uuid;
}

// a very simple implementation of a Promise for Internet Explorer and Nodejs
var polyfillPromise = function polyfillPromise() {
    var scope = getScope();
    if (typeof scope.Promise !== 'function') {
        scope.Promise = function promise(executor) {
            this.executor = executor;
        };

        scope.Promise.prototype.then = function then(resolve, reject) {
            if (typeof resolve !== 'function') {
                resolve = function resolve() {};
            }
            if (typeof reject !== 'function') {
                reject = function reject() {};
            }
            this.executor(resolve, reject);
        };
    }
};

function polyfill() {
    var d = getDevice();
    // console.log(device);
    if (d.browser === 'ie' || d.nodejs === true) {
        polyfillPromise();
    }
    polyfillPerformance();
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":4}],50:[function(require,module,exports){
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

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
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
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
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
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
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
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
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
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
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

    if (input instanceof Request) {
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
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
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
    return new Request(this, { body: this._bodyInit })
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

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
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
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtYWluLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZpbGVzYXZlcmpzL0ZpbGVTYXZlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9pc29tb3JwaGljLWZldGNoL2ZldGNoLW5wbS1icm93c2VyaWZ5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2NoYW5uZWxfZnguanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9jb25zdGFudHMuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9jb252b2x1dGlvbl9yZXZlcmIuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9kZWxheV9meC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2V2ZW50bGlzdGVuZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9mZXRjaF9oZWxwZXJzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvaW5pdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L2luaXRfYXVkaW8uanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9pbml0X21pZGkuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9pbnN0cnVtZW50LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvbWV0cm9ub21lLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvbWlkaV9ldmVudC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L21pZGlfbm90ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L21pZGlfc3RyZWFtLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvbWlkaWZpbGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9ub3RlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvcGFyc2VfYXVkaW8uanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9wYXJzZV9ldmVudHMuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9wYXJ0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3QvcGxheWhlYWQuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9wb3NpdGlvbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3FhbWJpLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2FtcGxlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2FtcGxlX2J1ZmZlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3NhbXBsZV9vc2NpbGxhdG9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2FtcGxlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3NhbXBsZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zYXZlX21pZGlmaWxlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2NoZWR1bGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc2V0dGluZ3MuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zaW1wbGVfc3ludGguanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zb25nLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3FhbWJpL2Rpc3Qvc29uZy51cGRhdGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC9zb25nX2Zyb21fbWlkaWZpbGUuanMiLCIuLi9ub2RlX21vZHVsZXMvcWFtYmkvZGlzdC90cmFjay5qcyIsIi4uL25vZGVfbW9kdWxlcy9xYW1iaS9kaXN0L3V0aWwuanMiLCIuLi9ub2RlX21vZHVsZXMvd2ViLW1pZGktYXBpLXNoaW0vZGlzdC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWItbWlkaS1hcGktc2hpbS9kaXN0L21pZGkvbWlkaV9hY2Nlc3MuanMiLCIuLi9ub2RlX21vZHVsZXMvd2ViLW1pZGktYXBpLXNoaW0vZGlzdC9taWRpL21pZGlfaW5wdXQuanMiLCIuLi9ub2RlX21vZHVsZXMvd2ViLW1pZGktYXBpLXNoaW0vZGlzdC9taWRpL21pZGlfb3V0cHV0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYi1taWRpLWFwaS1zaGltL2Rpc3QvbWlkaS9taWRpY29ubmVjdGlvbl9ldmVudC5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWItbWlkaS1hcGktc2hpbS9kaXN0L21pZGkvbWlkaW1lc3NhZ2VfZXZlbnQuanMiLCIuLi9ub2RlX21vZHVsZXMvd2ViLW1pZGktYXBpLXNoaW0vZGlzdC91dGlsL2phenpfaW5zdGFuY2UuanMiLCIuLi9ub2RlX21vZHVsZXMvd2ViLW1pZGktYXBpLXNoaW0vZGlzdC91dGlsL3N0b3JlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYi1taWRpLWFwaS1zaGltL2Rpc3QvdXRpbC91dGlsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQVNBLFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQVk7O0FBRXhELE1BQUksYUFBSjtBQUNBLE1BQUksY0FBSjtBQUNBLE1BQUksZ0JBQUo7QUFDQSxNQUFNLFdBQVcsUUFBakIsQ0FMd0QsQ0FLOUI7O0FBRTFCLGtCQUFNLElBQU4sR0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFdBQU8saUJBQVA7QUFDQSxZQUFRLGtCQUFSO0FBQ0EsY0FBVSxvQkFBVjtBQUNBLFNBQUssU0FBTCxDQUFlLEtBQWY7QUFDQSxVQUFNLGFBQU4sQ0FBb0IsT0FBcEI7QUFDQSxVQUFNLE9BQU4sR0FBZ0IsSUFBaEI7QUFDQTtBQUNELEdBVEg7O0FBV0EsV0FBUyxNQUFULEdBQWtCOztBQUVoQjs7QUFFQSxRQUFJLGVBQWUsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQW5CO0FBQ0EsUUFBSSxhQUFhLDJCQUFqQjtBQUNBLFFBQUksT0FBTyx5Q0FBWDs7QUFFQSxlQUFXLE9BQVgsQ0FBbUIsZ0JBQVE7QUFDekIsK0JBQXVCLEtBQUssRUFBNUIsVUFBbUMsS0FBSyxJQUF4QztBQUNELEtBRkQ7QUFHQSxpQkFBYSxTQUFiLEdBQXlCLElBQXpCOztBQUVBLGlCQUFhLGdCQUFiLENBQThCLFFBQTlCLEVBQXdDLFlBQU07QUFDNUMsVUFBSSxTQUFTLGFBQWEsT0FBYixDQUFxQixhQUFhLGFBQWxDLEVBQWlELEVBQTlEO0FBQ0EsWUFBTSxvQkFBTixHQUY0QyxDQUVmO0FBQzdCLFlBQU0saUJBQU4sQ0FBd0IsTUFBeEI7QUFDRCxLQUpEOztBQU9BOztBQUVBLFFBQUksYUFBYSxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBakI7QUFDQSxRQUFJLG1CQUFtQixTQUFTLGNBQVQsQ0FBd0IsWUFBeEIsQ0FBdkI7QUFDQSxRQUFJLE9BQVUsUUFBViwyQkFBSjs7QUFFQSxRQUFJLG1CQUFtQixnREFBdkI7QUFDQSxRQUFJLHVCQUF1Qiw0QkFBM0I7QUFDQSx5QkFBcUIsT0FBckIsQ0FBNkIsVUFBQyxLQUFELEVBQVEsR0FBUixFQUFnQjtBQUMzQywyQ0FBbUMsR0FBbkMsVUFBMkMsTUFBTSxJQUFqRDtBQUNELEtBRkQ7O0FBSUEsUUFBSSxnQkFBZ0IsOEJBQXBCO0FBQ0EsUUFBSSxZQUFZLGdEQUFoQjtBQUNBLGtCQUFjLE9BQWQsQ0FBc0IsVUFBQyxLQUFELEVBQVEsR0FBUixFQUFnQjtBQUNwQyxvQ0FBNEIsR0FBNUIsVUFBb0MsTUFBTSxJQUExQztBQUNELEtBRkQ7O0FBSUEsZUFBVyxnQkFBWCxDQUE0QixRQUE1QixFQUFzQyxZQUFNO0FBQzFDLFVBQUksTUFBTSxXQUFXLE9BQVgsQ0FBbUIsV0FBVyxhQUE5QixFQUE2QyxFQUF2RDtBQUNBLGNBQVEsR0FBUixDQUFZLEdBQVo7QUFDQSxVQUFJLFFBQVEsV0FBWixFQUF5QjtBQUN2Qix5QkFBaUIsU0FBakIsR0FBNkIsZ0JBQTdCO0FBQ0EsZUFBVSxRQUFWO0FBQ0QsT0FIRCxNQUdPLElBQUksUUFBUSxZQUFaLEVBQTBCO0FBQy9CLHlCQUFpQixTQUFqQixHQUE2QixTQUE3QjtBQUNBLGVBQVUsUUFBVjtBQUNEO0FBQ0YsS0FWRDs7QUFZQSxxQkFBaUIsU0FBakIsR0FBNkIsZ0JBQTdCO0FBQ0EscUJBQWlCLGdCQUFqQixDQUFrQyxRQUFsQyxFQUE0QyxZQUFNO0FBQ2hELFVBQUksTUFBTSxpQkFBaUIsT0FBakIsQ0FBeUIsaUJBQWlCLGFBQTFDLEVBQXlELEVBQW5FO0FBQ0EsVUFBSSxNQUFTLElBQVQsU0FBaUIsR0FBakIsVUFBSjs7QUFHQTtBQUNBLGNBQVEsZUFBUixDQUF3QixFQUFFLFFBQUYsRUFBTyxVQUFVLElBQWpCLEVBQXhCLEVBQ0csSUFESCxDQUNRLFlBQU07QUFDVixnQkFBUSxHQUFSLGNBQXVCLEdBQXZCO0FBQ0QsT0FISDtBQUlBOzs7Ozs7OztBQVFELEtBbEJEO0FBbUJEO0FBQ0YsQ0F6RkQ7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzllQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3haQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25kQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3p5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0MUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgcWFtYmksIHtcbiAgU29uZyxcbiAgVHJhY2ssXG4gIFNhbXBsZXIsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldEluc3RydW1lbnRzLFxuICBnZXRHTUluc3RydW1lbnRzLFxufSBmcm9tICdxYW1iaSdcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcblxuICBsZXQgc29uZ1xuICBsZXQgdHJhY2tcbiAgbGV0IHNhbXBsZXJcbiAgY29uc3QgYmFzZVBhdGggPSAnLi4vLi4vJyAvLyB5b3UgbWF5IGhhdmUgdG8gYWRqdXN0IHRoaXMgcGF0aCBhY2NvcmRpbmcgdG8geW91ciBmb2xkZXIgbGF5b3V0XG5cbiAgcWFtYmkuaW5pdCgpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgc29uZyA9IG5ldyBTb25nKClcbiAgICAgIHRyYWNrID0gbmV3IFRyYWNrKClcbiAgICAgIHNhbXBsZXIgPSBuZXcgU2FtcGxlcigpXG4gICAgICBzb25nLmFkZFRyYWNrcyh0cmFjaylcbiAgICAgIHRyYWNrLnNldEluc3RydW1lbnQoc2FtcGxlcilcbiAgICAgIHRyYWNrLm1vbml0b3IgPSB0cnVlXG4gICAgICBpbml0VUkoKVxuICAgIH0pXG5cbiAgZnVuY3Rpb24gaW5pdFVJKCkge1xuXG4gICAgLy8gc2V0dXAgZHJvd25kb3duIG1lbnUgZm9yIE1JREkgaW5wdXRzXG5cbiAgICBsZXQgc2VsZWN0TUlESUluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pZGlpbicpXG4gICAgbGV0IE1JRElJbnB1dHMgPSBnZXRNSURJSW5wdXRzKClcbiAgICBsZXQgaHRtbCA9ICc8b3B0aW9uIGlkPVwiLTFcIj5zZWxlY3QgTUlESSBpbjwvb3B0aW9uPidcblxuICAgIE1JRElJbnB1dHMuZm9yRWFjaChwb3J0ID0+IHtcbiAgICAgIGh0bWwgKz0gYDxvcHRpb24gaWQ9XCIke3BvcnQuaWR9XCI+JHtwb3J0Lm5hbWV9PC9vcHRpb24+YFxuICAgIH0pXG4gICAgc2VsZWN0TUlESUluLmlubmVySFRNTCA9IGh0bWxcblxuICAgIHNlbGVjdE1JRElJbi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBsZXQgcG9ydElkID0gc2VsZWN0TUlESUluLm9wdGlvbnNbc2VsZWN0TUlESUluLnNlbGVjdGVkSW5kZXhdLmlkXG4gICAgICB0cmFjay5kaXNjb25uZWN0TUlESUlucHV0cygpIC8vIG5vIGFyZ3VtZW50cyBtZWFucyBkaXNjb25uZWN0IGZyb20gYWxsIGlucHV0c1xuICAgICAgdHJhY2suY29ubmVjdE1JRElJbnB1dHMocG9ydElkKVxuICAgIH0pXG5cblxuICAgIC8vIHNldHVwIGRyb3duZG93biBtZW51IGZvciBiYW5rcyBhbmQgaW5zdHJ1bWVudHNcblxuICAgIGxldCBzZWxlY3RCYW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbmsnKVxuICAgIGxldCBzZWxlY3RJbnN0cnVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luc3RydW1lbnQnKVxuICAgIGxldCBwYXRoID0gYCR7YmFzZVBhdGh9L2luc3RydW1lbnRzL2hlYXJ0YmVhdGBcblxuICAgIGxldCBvcHRpb25zSGVhcnRiZWF0ID0gJzxvcHRpb24gaWQ9XCJzZWxlY3RcIj5zZWxlY3QgaW5zdHJ1bWVudDwvb3B0aW9uPidcbiAgICBsZXQgaGVhcnRiZWF0SW5zdHJ1bWVudHMgPSBnZXRJbnN0cnVtZW50cygpXG4gICAgaGVhcnRiZWF0SW5zdHJ1bWVudHMuZm9yRWFjaCgoaW5zdHIsIGtleSkgPT4ge1xuICAgICAgb3B0aW9uc0hlYXJ0YmVhdCArPSBgPG9wdGlvbiBpZD1cIiR7a2V5fVwiPiR7aW5zdHIubmFtZX08L29wdGlvbj5gXG4gICAgfSlcblxuICAgIGxldCBnbUluc3RydW1lbnRzID0gZ2V0R01JbnN0cnVtZW50cygpXG4gICAgbGV0IG9wdGlvbnNHTSA9ICc8b3B0aW9uIGlkPVwic2VsZWN0XCI+c2VsZWN0IGluc3RydW1lbnQ8L29wdGlvbj4nXG4gICAgZ21JbnN0cnVtZW50cy5mb3JFYWNoKChpbnN0ciwga2V5KSA9PiB7XG4gICAgICBvcHRpb25zR00gKz0gYDxvcHRpb24gaWQ9XCIke2tleX1cIj4ke2luc3RyLm5hbWV9PC9vcHRpb24+YFxuICAgIH0pXG5cbiAgICBzZWxlY3RCYW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgIGxldCBrZXkgPSBzZWxlY3RCYW5rLm9wdGlvbnNbc2VsZWN0QmFuay5zZWxlY3RlZEluZGV4XS5pZFxuICAgICAgY29uc29sZS5sb2coa2V5KVxuICAgICAgaWYgKGtleSA9PT0gJ2hlYXJ0YmVhdCcpIHtcbiAgICAgICAgc2VsZWN0SW5zdHJ1bWVudC5pbm5lckhUTUwgPSBvcHRpb25zSGVhcnRiZWF0XG4gICAgICAgIHBhdGggPSBgJHtiYXNlUGF0aH0vaW5zdHJ1bWVudHMvaGVhcnRiZWF0YFxuICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdmbHVpZHN5bnRoJykge1xuICAgICAgICBzZWxlY3RJbnN0cnVtZW50LmlubmVySFRNTCA9IG9wdGlvbnNHTVxuICAgICAgICBwYXRoID0gYCR7YmFzZVBhdGh9L2luc3RydW1lbnRzL2ZsdWlkc3ludGhgXG4gICAgICB9XG4gICAgfSlcblxuICAgIHNlbGVjdEluc3RydW1lbnQuaW5uZXJIVE1MID0gb3B0aW9uc0hlYXJ0YmVhdFxuICAgIHNlbGVjdEluc3RydW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgbGV0IGtleSA9IHNlbGVjdEluc3RydW1lbnQub3B0aW9uc1tzZWxlY3RJbnN0cnVtZW50LnNlbGVjdGVkSW5kZXhdLmlkXG4gICAgICBsZXQgdXJsID0gYCR7cGF0aH0vJHtrZXl9Lmpzb25gXG5cblxuICAgICAgLy8gb3B0aW9uIDE6IGNsZWFyIHRoZSBzYW1wbGVzIG9mIHRoZSBjdXJyZW50bHkgbG9hZGVkIGluc3RydW1lbnQgYWZ0ZXIgdGhlIG5ldyBzYW1wbGVzIGhhdmUgYmVlbiBsb2FkZWRcbiAgICAgIHNhbXBsZXIucGFyc2VTYW1wbGVEYXRhKHsgdXJsLCBjbGVhckFsbDogdHJ1ZSB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coYGxvYWRlZDogJHtrZXl9YClcbiAgICAgICAgfSlcbiAgICAgIC8qXG4gICAgICAgICAgICAvLyBvcHRpb24gMjogY2xlYXIgdGhlIHNhbXBsZXMgb2YgdGhlIGN1cnJlbnRseSBsb2FkZWQgaW5zdHJ1bWVudCBiZWZvcmUgbG9hZGluZyB0aGUgbmV3IHNhbXBsZXNcbiAgICAgICAgICAgIHNhbXBsZXIuY2xlYXJBbGxTYW1wbGVEYXRhKClcbiAgICAgICAgICAgIHNhbXBsZXIucGFyc2VTYW1wbGVEYXRhKHt1cmx9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgbG9hZGVkOiAke2tleX1gKVxuICAgICAgICAgICAgfSlcbiAgICAgICovXG4gICAgfSlcbiAgfVxufSlcbiIsIi8qIEZpbGVTYXZlci5qc1xuICogQSBzYXZlQXMoKSBGaWxlU2F2ZXIgaW1wbGVtZW50YXRpb24uXG4gKiAxLjEuMjAxNjAzMjhcbiAqXG4gKiBCeSBFbGkgR3JleSwgaHR0cDovL2VsaWdyZXkuY29tXG4gKiBMaWNlbnNlOiBNSVRcbiAqICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbGlncmV5L0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4gKi9cblxuLypnbG9iYWwgc2VsZiAqL1xuLypqc2xpbnQgYml0d2lzZTogdHJ1ZSwgaW5kZW50OiA0LCBsYXhicmVhazogdHJ1ZSwgbGF4Y29tbWE6IHRydWUsIHNtYXJ0dGFiczogdHJ1ZSwgcGx1c3BsdXM6IHRydWUgKi9cblxuLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cblxudmFyIHNhdmVBcyA9IHNhdmVBcyB8fCAoZnVuY3Rpb24odmlldykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0Ly8gSUUgPDEwIGlzIGV4cGxpY2l0bHkgdW5zdXBwb3J0ZWRcblx0aWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgL01TSUUgWzEtOV1cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyXG5cdFx0ICBkb2MgPSB2aWV3LmRvY3VtZW50XG5cdFx0ICAvLyBvbmx5IGdldCBVUkwgd2hlbiBuZWNlc3NhcnkgaW4gY2FzZSBCbG9iLmpzIGhhc24ndCBvdmVycmlkZGVuIGl0IHlldFxuXHRcdCwgZ2V0X1VSTCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHZpZXcuVVJMIHx8IHZpZXcud2Via2l0VVJMIHx8IHZpZXc7XG5cdFx0fVxuXHRcdCwgc2F2ZV9saW5rID0gZG9jLmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIiwgXCJhXCIpXG5cdFx0LCBjYW5fdXNlX3NhdmVfbGluayA9IFwiZG93bmxvYWRcIiBpbiBzYXZlX2xpbmtcblx0XHQsIGNsaWNrID0gZnVuY3Rpb24obm9kZSkge1xuXHRcdFx0dmFyIGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKTtcblx0XHRcdG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG5cdFx0fVxuXHRcdCwgaXNfc2FmYXJpID0gL1ZlcnNpb25cXC9bXFxkXFwuXSsuKlNhZmFyaS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KVxuXHRcdCwgd2Via2l0X3JlcV9mcyA9IHZpZXcud2Via2l0UmVxdWVzdEZpbGVTeXN0ZW1cblx0XHQsIHJlcV9mcyA9IHZpZXcucmVxdWVzdEZpbGVTeXN0ZW0gfHwgd2Via2l0X3JlcV9mcyB8fCB2aWV3Lm1velJlcXVlc3RGaWxlU3lzdGVtXG5cdFx0LCB0aHJvd19vdXRzaWRlID0gZnVuY3Rpb24oZXgpIHtcblx0XHRcdCh2aWV3LnNldEltbWVkaWF0ZSB8fCB2aWV3LnNldFRpbWVvdXQpKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aHJvdyBleDtcblx0XHRcdH0sIDApO1xuXHRcdH1cblx0XHQsIGZvcmNlX3NhdmVhYmxlX3R5cGUgPSBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiXG5cdFx0LCBmc19taW5fc2l6ZSA9IDBcblx0XHQvLyB0aGUgQmxvYiBBUEkgaXMgZnVuZGFtZW50YWxseSBicm9rZW4gYXMgdGhlcmUgaXMgbm8gXCJkb3dubG9hZGZpbmlzaGVkXCIgZXZlbnQgdG8gc3Vic2NyaWJlIHRvXG5cdFx0LCBhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQgPSAxMDAwICogNDAgLy8gaW4gbXNcblx0XHQsIHJldm9rZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdHZhciByZXZva2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHR9IGVsc2UgeyAvLyBmaWxlIGlzIGEgRmlsZVxuXHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHQvKiAvLyBUYWtlIG5vdGUgVzNDOlxuXHRcdFx0dmFyXG5cdFx0XHQgIHVyaSA9IHR5cGVvZiBmaWxlID09PSBcInN0cmluZ1wiID8gZmlsZSA6IGZpbGUudG9VUkwoKVxuXHRcdFx0LCByZXZva2VyID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdC8vIGlkZWFseSBEb3dubG9hZEZpbmlzaGVkRXZlbnQuZGF0YSB3b3VsZCBiZSB0aGUgVVJMIHJlcXVlc3RlZFxuXHRcdFx0XHRpZiAoZXZ0LmRhdGEgPT09IHVyaSkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRcdGdldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHsgLy8gZmlsZSBpcyBhIEZpbGVcblx0XHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQ7XG5cdFx0XHR2aWV3LmFkZEV2ZW50TGlzdGVuZXIoXCJkb3dubG9hZGZpbmlzaGVkXCIsIHJldm9rZXIpO1xuXHRcdFx0Ki9cblx0XHRcdHNldFRpbWVvdXQocmV2b2tlciwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0KTtcblx0XHR9XG5cdFx0LCBkaXNwYXRjaCA9IGZ1bmN0aW9uKGZpbGVzYXZlciwgZXZlbnRfdHlwZXMsIGV2ZW50KSB7XG5cdFx0XHRldmVudF90eXBlcyA9IFtdLmNvbmNhdChldmVudF90eXBlcyk7XG5cdFx0XHR2YXIgaSA9IGV2ZW50X3R5cGVzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0dmFyIGxpc3RlbmVyID0gZmlsZXNhdmVyW1wib25cIiArIGV2ZW50X3R5cGVzW2ldXTtcblx0XHRcdFx0aWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGxpc3RlbmVyLmNhbGwoZmlsZXNhdmVyLCBldmVudCB8fCBmaWxlc2F2ZXIpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGV4KSB7XG5cdFx0XHRcdFx0XHR0aHJvd19vdXRzaWRlKGV4KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0LCBhdXRvX2JvbSA9IGZ1bmN0aW9uKGJsb2IpIHtcblx0XHRcdC8vIHByZXBlbmQgQk9NIGZvciBVVEYtOCBYTUwgYW5kIHRleHQvKiB0eXBlcyAoaW5jbHVkaW5nIEhUTUwpXG5cdFx0XHRpZiAoL15cXHMqKD86dGV4dFxcL1xcUyp8YXBwbGljYXRpb25cXC94bWx8XFxTKlxcL1xcUypcXCt4bWwpXFxzKjsuKmNoYXJzZXRcXHMqPVxccyp1dGYtOC9pLnRlc3QoYmxvYi50eXBlKSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2IoW1wiXFx1ZmVmZlwiLCBibG9iXSwge3R5cGU6IGJsb2IudHlwZX0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGJsb2I7XG5cdFx0fVxuXHRcdCwgRmlsZVNhdmVyID0gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRmlyc3QgdHJ5IGEuZG93bmxvYWQsIHRoZW4gd2ViIGZpbGVzeXN0ZW0sIHRoZW4gb2JqZWN0IFVSTHNcblx0XHRcdHZhclxuXHRcdFx0XHQgIGZpbGVzYXZlciA9IHRoaXNcblx0XHRcdFx0LCB0eXBlID0gYmxvYi50eXBlXG5cdFx0XHRcdCwgYmxvYl9jaGFuZ2VkID0gZmFsc2Vcblx0XHRcdFx0LCBvYmplY3RfdXJsXG5cdFx0XHRcdCwgdGFyZ2V0X3ZpZXdcblx0XHRcdFx0LCBkaXNwYXRjaF9hbGwgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSB3cml0ZWVuZFwiLnNwbGl0KFwiIFwiKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gb24gYW55IGZpbGVzeXMgZXJyb3JzIHJldmVydCB0byBzYXZpbmcgd2l0aCBvYmplY3QgVVJMc1xuXHRcdFx0XHQsIGZzX2Vycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKHRhcmdldF92aWV3ICYmIGlzX3NhZmFyaSAmJiB0eXBlb2YgRmlsZVJlYWRlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRcdFx0Ly8gU2FmYXJpIGRvZXNuJ3QgYWxsb3cgZG93bmxvYWRpbmcgb2YgYmxvYiB1cmxzXG5cdFx0XHRcdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdFx0XHRcdHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGJhc2U2NERhdGEgPSByZWFkZXIucmVzdWx0O1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gXCJkYXRhOmF0dGFjaG1lbnQvZmlsZVwiICsgYmFzZTY0RGF0YS5zbGljZShiYXNlNjREYXRhLnNlYXJjaCgvWyw7XS8pKTtcblx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7XG5cdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5JTklUO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBkb24ndCBjcmVhdGUgbW9yZSBvYmplY3QgVVJMcyB0aGFuIG5lZWRlZFxuXHRcdFx0XHRcdGlmIChibG9iX2NoYW5nZWQgfHwgIW9iamVjdF91cmwpIHtcblx0XHRcdFx0XHRcdG9iamVjdF91cmwgPSBnZXRfVVJMKCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGFyZ2V0X3ZpZXcpIHtcblx0XHRcdFx0XHRcdHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgbmV3X3RhYiA9IHZpZXcub3BlbihvYmplY3RfdXJsLCBcIl9ibGFua1wiKTtcblx0XHRcdFx0XHRcdGlmIChuZXdfdGFiID09PSB1bmRlZmluZWQgJiYgaXNfc2FmYXJpKSB7XG5cdFx0XHRcdFx0XHRcdC8vQXBwbGUgZG8gbm90IGFsbG93IHdpbmRvdy5vcGVuLCBzZWUgaHR0cDovL2JpdC5seS8xa1pmZlJJXG5cdFx0XHRcdFx0XHRcdHZpZXcubG9jYXRpb24uaHJlZiA9IG9iamVjdF91cmxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRyZXZva2Uob2JqZWN0X3VybCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0LCBhYm9ydGFibGUgPSBmdW5jdGlvbihmdW5jKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKGZpbGVzYXZlci5yZWFkeVN0YXRlICE9PSBmaWxlc2F2ZXIuRE9ORSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0LCBjcmVhdGVfaWZfbm90X2ZvdW5kID0ge2NyZWF0ZTogdHJ1ZSwgZXhjbHVzaXZlOiBmYWxzZX1cblx0XHRcdFx0LCBzbGljZVxuXHRcdFx0O1xuXHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblx0XHRcdGlmICghbmFtZSkge1xuXHRcdFx0XHRuYW1lID0gXCJkb3dubG9hZFwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbl91c2Vfc2F2ZV9saW5rKSB7XG5cdFx0XHRcdG9iamVjdF91cmwgPSBnZXRfVVJMKCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHNhdmVfbGluay5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHRzYXZlX2xpbmsuZG93bmxvYWQgPSBuYW1lO1xuXHRcdFx0XHRcdGNsaWNrKHNhdmVfbGluayk7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHQvLyBPYmplY3QgYW5kIHdlYiBmaWxlc3lzdGVtIFVSTHMgaGF2ZSBhIHByb2JsZW0gc2F2aW5nIGluIEdvb2dsZSBDaHJvbWUgd2hlblxuXHRcdFx0Ly8gdmlld2VkIGluIGEgdGFiLCBzbyBJIGZvcmNlIHNhdmUgd2l0aCBhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cblx0XHRcdC8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkxMTU4XG5cdFx0XHQvLyBVcGRhdGU6IEdvb2dsZSBlcnJhbnRseSBjbG9zZWQgOTExNTgsIEkgc3VibWl0dGVkIGl0IGFnYWluOlxuXHRcdFx0Ly8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTM4OTY0MlxuXHRcdFx0aWYgKHZpZXcuY2hyb21lICYmIHR5cGUgJiYgdHlwZSAhPT0gZm9yY2Vfc2F2ZWFibGVfdHlwZSkge1xuXHRcdFx0XHRzbGljZSA9IGJsb2Iuc2xpY2UgfHwgYmxvYi53ZWJraXRTbGljZTtcblx0XHRcdFx0YmxvYiA9IHNsaWNlLmNhbGwoYmxvYiwgMCwgYmxvYi5zaXplLCBmb3JjZV9zYXZlYWJsZV90eXBlKTtcblx0XHRcdFx0YmxvYl9jaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdC8vIFNpbmNlIEkgY2FuJ3QgYmUgc3VyZSB0aGF0IHRoZSBndWVzc2VkIG1lZGlhIHR5cGUgd2lsbCB0cmlnZ2VyIGEgZG93bmxvYWRcblx0XHRcdC8vIGluIFdlYktpdCwgSSBhcHBlbmQgLmRvd25sb2FkIHRvIHRoZSBmaWxlbmFtZS5cblx0XHRcdC8vIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD02NTQ0MFxuXHRcdFx0aWYgKHdlYmtpdF9yZXFfZnMgJiYgbmFtZSAhPT0gXCJkb3dubG9hZFwiKSB7XG5cdFx0XHRcdG5hbWUgKz0gXCIuZG93bmxvYWRcIjtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlID09PSBmb3JjZV9zYXZlYWJsZV90eXBlIHx8IHdlYmtpdF9yZXFfZnMpIHtcblx0XHRcdFx0dGFyZ2V0X3ZpZXcgPSB2aWV3O1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFyZXFfZnMpIHtcblx0XHRcdFx0ZnNfZXJyb3IoKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0ZnNfbWluX3NpemUgKz0gYmxvYi5zaXplO1xuXHRcdFx0cmVxX2ZzKHZpZXcuVEVNUE9SQVJZLCBmc19taW5fc2l6ZSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZzKSB7XG5cdFx0XHRcdGZzLnJvb3QuZ2V0RGlyZWN0b3J5KFwic2F2ZWRcIiwgY3JlYXRlX2lmX25vdF9mb3VuZCwgYWJvcnRhYmxlKGZ1bmN0aW9uKGRpcikge1xuXHRcdFx0XHRcdHZhciBzYXZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXIuZ2V0RmlsZShuYW1lLCBjcmVhdGVfaWZfbm90X2ZvdW5kLCBhYm9ydGFibGUoZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHRcdFx0XHRmaWxlLmNyZWF0ZVdyaXRlcihhYm9ydGFibGUoZnVuY3Rpb24od3JpdGVyKSB7XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLm9ud3JpdGVlbmQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZiA9IGZpbGUudG9VUkwoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdFx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwid3JpdGVlbmRcIiwgZXZlbnQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV2b2tlKGZpbGUpO1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBlcnJvciA9IHdyaXRlci5lcnJvcjtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChlcnJvci5jb2RlICE9PSBlcnJvci5BQk9SVF9FUlIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZnNfZXJyb3IoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSBhYm9ydFwiLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR3cml0ZXJbXCJvblwiICsgZXZlbnRdID0gZmlsZXNhdmVyW1wib25cIiArIGV2ZW50XTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR3cml0ZXIud3JpdGUoYmxvYik7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR3cml0ZXIuYWJvcnQoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5XUklUSU5HO1xuXHRcdFx0XHRcdFx0XHR9KSwgZnNfZXJyb3IpO1xuXHRcdFx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGRpci5nZXRGaWxlKG5hbWUsIHtjcmVhdGU6IGZhbHNlfSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdC8vIGRlbGV0ZSBmaWxlIGlmIGl0IGFscmVhZHkgZXhpc3RzXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0c2F2ZSgpO1xuXHRcdFx0XHRcdH0pLCBhYm9ydGFibGUoZnVuY3Rpb24oZXgpIHtcblx0XHRcdFx0XHRcdGlmIChleC5jb2RlID09PSBleC5OT1RfRk9VTkRfRVJSKSB7XG5cdFx0XHRcdFx0XHRcdHNhdmUoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSkpO1xuXHRcdFx0XHR9KSwgZnNfZXJyb3IpO1xuXHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHR9XG5cdFx0LCBGU19wcm90byA9IEZpbGVTYXZlci5wcm90b3R5cGVcblx0XHQsIHNhdmVBcyA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbGVTYXZlcihibG9iLCBuYW1lLCBub19hdXRvX2JvbSk7XG5cdFx0fVxuXHQ7XG5cdC8vIElFIDEwKyAobmF0aXZlIHNhdmVBcylcblx0aWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgbmF2aWdhdG9yLm1zU2F2ZU9yT3BlbkJsb2IpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKGJsb2IsIG5hbWUgfHwgXCJkb3dubG9hZFwiKTtcblx0XHR9O1xuXHR9XG5cblx0RlNfcHJvdG8uYWJvcnQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZmlsZXNhdmVyID0gdGhpcztcblx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdGRpc3BhdGNoKGZpbGVzYXZlciwgXCJhYm9ydFwiKTtcblx0fTtcblx0RlNfcHJvdG8ucmVhZHlTdGF0ZSA9IEZTX3Byb3RvLklOSVQgPSAwO1xuXHRGU19wcm90by5XUklUSU5HID0gMTtcblx0RlNfcHJvdG8uRE9ORSA9IDI7XG5cblx0RlNfcHJvdG8uZXJyb3IgPVxuXHRGU19wcm90by5vbndyaXRlc3RhcnQgPVxuXHRGU19wcm90by5vbnByb2dyZXNzID1cblx0RlNfcHJvdG8ub253cml0ZSA9XG5cdEZTX3Byb3RvLm9uYWJvcnQgPVxuXHRGU19wcm90by5vbmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZWVuZCA9XG5cdFx0bnVsbDtcblxuXHRyZXR1cm4gc2F2ZUFzO1xufShcblx0ICAgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgJiYgc2VsZlxuXHR8fCB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvd1xuXHR8fCB0aGlzLmNvbnRlbnRcbikpO1xuLy8gYHNlbGZgIGlzIHVuZGVmaW5lZCBpbiBGaXJlZm94IGZvciBBbmRyb2lkIGNvbnRlbnQgc2NyaXB0IGNvbnRleHRcbi8vIHdoaWxlIGB0aGlzYCBpcyBuc0lDb250ZW50RnJhbWVNZXNzYWdlTWFuYWdlclxuLy8gd2l0aCBhbiBhdHRyaWJ1dGUgYGNvbnRlbnRgIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHdpbmRvd1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cy5zYXZlQXMgPSBzYXZlQXM7XG59IGVsc2UgaWYgKCh0eXBlb2YgZGVmaW5lICE9PSBcInVuZGVmaW5lZFwiICYmIGRlZmluZSAhPT0gbnVsbCkgJiYgKGRlZmluZS5hbWQgIT09IG51bGwpKSB7XG4gIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNhdmVBcztcbiAgfSk7XG59XG4iLCIvLyB0aGUgd2hhdHdnLWZldGNoIHBvbHlmaWxsIGluc3RhbGxzIHRoZSBmZXRjaCgpIGZ1bmN0aW9uXG4vLyBvbiB0aGUgZ2xvYmFsIG9iamVjdCAod2luZG93IG9yIHNlbGYpXG4vL1xuLy8gUmV0dXJuIHRoYXQgYXMgdGhlIGV4cG9ydCBmb3IgdXNlIGluIFdlYnBhY2ssIEJyb3dzZXJpZnkgZXRjLlxucmVxdWlyZSgnd2hhdHdnLWZldGNoJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHNlbGYuZmV0Y2guYmluZChzZWxmKTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLkNoYW5uZWxFZmZlY3QgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgQ2hhbm5lbEVmZmVjdCA9IGV4cG9ydHMuQ2hhbm5lbEVmZmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQ2hhbm5lbEVmZmVjdCgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2hhbm5lbEVmZmVjdCk7XG5cbiAgICB0aGlzLmlucHV0ID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5vdXRwdXQgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcblxuICAgIHRoaXMuX2RyeSA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX3dldCA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlR2FpbigpO1xuXG4gICAgdGhpcy5fZHJ5LmdhaW4udmFsdWUgPSAxO1xuICAgIHRoaXMuX3dldC5nYWluLnZhbHVlID0gMDtcblxuICAgIHRoaXMuYW1vdW50ID0gMDtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhDaGFubmVsRWZmZWN0LCBbe1xuICAgIGtleTogJ2luaXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgdGhpcy5pbnB1dC5jb25uZWN0KHRoaXMuX2RyeSk7XG4gICAgICB0aGlzLl9kcnkuY29ubmVjdCh0aGlzLm91dHB1dCk7XG5cbiAgICAgIHRoaXMuaW5wdXQuY29ubmVjdCh0aGlzLl9ub2RlRlgpO1xuICAgICAgdGhpcy5fbm9kZUZYLmNvbm5lY3QodGhpcy5fd2V0KTtcbiAgICAgIHRoaXMuX3dldC5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRBbW91bnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRBbW91bnQodmFsdWUpIHtcbiAgICAgIC8qXG4gICAgICB0aGlzLmFtb3VudCA9IHZhbHVlIDwgMCA/IDAgOiB2YWx1ZSA+IDEgPyAxIDogdmFsdWU7XG4gICAgICB2YXIgZ2FpbjEgPSBNYXRoLmNvcyh0aGlzLmFtb3VudCAqIDAuNSAqIE1hdGguUEkpLFxuICAgICAgICAgIGdhaW4yID0gTWF0aC5jb3MoKDEuMCAtIHRoaXMuYW1vdW50KSAqIDAuNSAqIE1hdGguUEkpO1xuICAgICAgdGhpcy5nYWluTm9kZS5nYWluLnZhbHVlID0gZ2FpbjIgKiB0aGlzLnJhdGlvO1xuICAgICAgKi9cblxuICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICB2YWx1ZSA9IDA7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlID4gMSkge1xuICAgICAgICB2YWx1ZSA9IDE7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYW1vdW50ID0gdmFsdWU7XG4gICAgICB0aGlzLl93ZXQuZ2Fpbi52YWx1ZSA9IHRoaXMuYW1vdW50O1xuICAgICAgdGhpcy5fZHJ5LmdhaW4udmFsdWUgPSAxIC0gdGhpcy5hbW91bnQ7XG4gICAgICAvL2NvbnNvbGUubG9nKCd3ZXQnLHRoaXMud2V0R2Fpbi5nYWluLnZhbHVlLCdkcnknLHRoaXMuZHJ5R2Fpbi5nYWluLnZhbHVlKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQ2hhbm5lbEVmZmVjdDtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbi8vIHN0YW5kYXJkIE1JREkgZXZlbnRzXG52YXIgTUlESUV2ZW50VHlwZXMgPSB7fTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTk9URV9PRkYnLCB7IHZhbHVlOiAweDgwIH0pOyAvLzEyOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTk9URV9PTicsIHsgdmFsdWU6IDB4OTAgfSk7IC8vMTQ0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQT0xZX1BSRVNTVVJFJywgeyB2YWx1ZTogMHhBMCB9KTsgLy8xNjBcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0NPTlRST0xfQ0hBTkdFJywgeyB2YWx1ZTogMHhCMCB9KTsgLy8xNzZcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BST0dSQU1fQ0hBTkdFJywgeyB2YWx1ZTogMHhDMCB9KTsgLy8xOTJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0NIQU5ORUxfUFJFU1NVUkUnLCB7IHZhbHVlOiAweEQwIH0pOyAvLzIwOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUElUQ0hfQkVORCcsIHsgdmFsdWU6IDB4RTAgfSk7IC8vMjI0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTWVNURU1fRVhDTFVTSVZFJywgeyB2YWx1ZTogMHhGMCB9KTsgLy8yNDBcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ01JRElfVElNRUNPREUnLCB7IHZhbHVlOiAyNDEgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTT05HX1BPU0lUSU9OJywgeyB2YWx1ZTogMjQyIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU09OR19TRUxFQ1QnLCB7IHZhbHVlOiAyNDMgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdUVU5FX1JFUVVFU1QnLCB7IHZhbHVlOiAyNDYgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdFT1gnLCB7IHZhbHVlOiAyNDcgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdUSU1JTkdfQ0xPQ0snLCB7IHZhbHVlOiAyNDggfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTVEFSVCcsIHsgdmFsdWU6IDI1MCB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0NPTlRJTlVFJywgeyB2YWx1ZTogMjUxIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1RPUCcsIHsgdmFsdWU6IDI1MiB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0FDVElWRV9TRU5TSU5HJywgeyB2YWx1ZTogMjU0IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1lTVEVNX1JFU0VUJywgeyB2YWx1ZTogMjU1IH0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdURU1QTycsIHsgdmFsdWU6IDB4NTEgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdUSU1FX1NJR05BVFVSRScsIHsgdmFsdWU6IDB4NTggfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdFTkRfT0ZfVFJBQ0snLCB7IHZhbHVlOiAweDJGIH0pO1xuXG5leHBvcnRzLk1JRElFdmVudFR5cGVzID0gTUlESUV2ZW50VHlwZXM7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5Db252b2x1dGlvblJldmVyYiA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfcGFyc2VfYXVkaW8gPSByZXF1aXJlKCcuL3BhcnNlX2F1ZGlvJyk7XG5cbnZhciBfY2hhbm5lbF9meCA9IHJlcXVpcmUoJy4vY2hhbm5lbF9meCcpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBDb252b2x1dGlvblJldmVyYiA9IGV4cG9ydHMuQ29udm9sdXRpb25SZXZlcmIgPSBmdW5jdGlvbiAoX0NoYW5uZWxFZmZlY3QpIHtcbiAgX2luaGVyaXRzKENvbnZvbHV0aW9uUmV2ZXJiLCBfQ2hhbm5lbEVmZmVjdCk7XG5cbiAgZnVuY3Rpb24gQ29udm9sdXRpb25SZXZlcmIoYnVmZmVyKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENvbnZvbHV0aW9uUmV2ZXJiKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChDb252b2x1dGlvblJldmVyYi5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbnZvbHV0aW9uUmV2ZXJiKSkuY2FsbCh0aGlzKSk7XG5cbiAgICBfdGhpcy5fbm9kZUZYID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVDb252b2x2ZXIoKTtcbiAgICBfdGhpcy5pbml0KCk7XG5cbiAgICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgQXVkaW9CdWZmZXIpIHtcbiAgICAgIF90aGlzLl9ub2RlRlguYnVmZmVyID0gYnVmZmVyO1xuICAgIH1cbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoQ29udm9sdXRpb25SZXZlcmIsIFt7XG4gICAga2V5OiAnYWRkQnVmZmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkQnVmZmVyKGJ1ZmZlcikge1xuICAgICAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyID09PSBmYWxzZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnYXJndW1lbnQgaXMgbm90IGFuIGluc3RhbmNlIG9mIEF1ZGlvQnVmZmVyJywgYnVmZmVyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fbm9kZUZYLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdsb2FkQnVmZmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZEJ1ZmZlcih1cmwpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAoMCwgX3BhcnNlX2F1ZGlvLnBhcnNlU2FtcGxlcykodXJsKS50aGVuKGZ1bmN0aW9uIChidWZmZXIpIHtcbiAgICAgICAgICBidWZmZXIgPSBidWZmZXJbMF07XG4gICAgICAgICAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyKSB7XG4gICAgICAgICAgICBfdGhpczIuX25vZGVGWC5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlamVjdCgnY291bGQgbm90IHBhcnNlIHRvIEF1ZGlvQnVmZmVyJywgdXJsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIENvbnZvbHV0aW9uUmV2ZXJiO1xufShfY2hhbm5lbF9meC5DaGFubmVsRWZmZWN0KTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLkRlbGF5ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9jaGFubmVsX2Z4ID0gcmVxdWlyZSgnLi9jaGFubmVsX2Z4Jyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH0gLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3JlZGl0czogaHR0cDovL2Jsb2cuY2hyaXNsb3dpcy5jby51ay8yMDE0LzA3LzIzL2R1Yi1kZWxheS13ZWItYXVkaW8tYXBpLmh0bWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbnZhciBEZWxheSA9IGV4cG9ydHMuRGVsYXkgPSBmdW5jdGlvbiAoX0NoYW5uZWxFZmZlY3QpIHtcbiAgX2luaGVyaXRzKERlbGF5LCBfQ2hhbm5lbEVmZmVjdCk7XG5cbiAgZnVuY3Rpb24gRGVsYXkoKSB7XG4gICAgdmFyIGNvbmZpZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRGVsYXkpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKERlbGF5Ll9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRGVsYXkpKS5jYWxsKHRoaXMpKTtcblxuICAgIF90aGlzLl9ub2RlRlggPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZURlbGF5KCk7XG5cbiAgICB2YXIgX2NvbmZpZyRkZWxheVRpbWUgPSBjb25maWcuZGVsYXlUaW1lO1xuICAgIF90aGlzLmRlbGF5VGltZSA9IF9jb25maWckZGVsYXlUaW1lID09PSB1bmRlZmluZWQgPyAwLjIgOiBfY29uZmlnJGRlbGF5VGltZTtcbiAgICB2YXIgX2NvbmZpZyRmZWVkYmFjayA9IGNvbmZpZy5mZWVkYmFjaztcbiAgICBfdGhpcy5mZWVkYmFjayA9IF9jb25maWckZmVlZGJhY2sgPT09IHVuZGVmaW5lZCA/IDAuNyA6IF9jb25maWckZmVlZGJhY2s7XG4gICAgdmFyIF9jb25maWckZnJlcXVlbmN5ID0gY29uZmlnLmZyZXF1ZW5jeTtcbiAgICBfdGhpcy5mcmVxdWVuY3kgPSBfY29uZmlnJGZyZXF1ZW5jeSA9PT0gdW5kZWZpbmVkID8gMTAwMCA6IF9jb25maWckZnJlcXVlbmN5O1xuXG5cbiAgICBfdGhpcy5fbm9kZUZYLmRlbGF5VGltZS52YWx1ZSA9IF90aGlzLmRlbGF5VGltZTtcblxuICAgIF90aGlzLl9mZWVkYmFjayA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIF90aGlzLl9mZWVkYmFjay5nYWluLnZhbHVlID0gX3RoaXMuZmVlZGJhY2s7XG5cbiAgICBfdGhpcy5fZmlsdGVyID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcbiAgICBfdGhpcy5fZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IF90aGlzLmZyZXF1ZW5jeTtcblxuICAgIF90aGlzLl9ub2RlRlguY29ubmVjdChfdGhpcy5fZmVlZGJhY2spO1xuICAgIF90aGlzLl9mZWVkYmFjay5jb25uZWN0KF90aGlzLl9maWx0ZXIpO1xuICAgIF90aGlzLl9maWx0ZXIuY29ubmVjdChfdGhpcy5fbm9kZUZYKTtcblxuICAgIF90aGlzLmluaXQoKTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoRGVsYXksIFt7XG4gICAga2V5OiAnc2V0VGltZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFRpbWUodmFsdWUpIHtcbiAgICAgIHRoaXMuX25vZGVGWC5kZWxheVRpbWUudmFsdWUgPSB0aGlzLmRlbGF5VGltZSA9IHZhbHVlO1xuICAgICAgLy9jb25zb2xlLmxvZygndGltZScsIHZhbHVlKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEZlZWRiYWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0RmVlZGJhY2sodmFsdWUpIHtcbiAgICAgIHRoaXMuX2ZlZWRiYWNrLmdhaW4udmFsdWUgPSB0aGlzLmZlZWRiYWNrID0gdmFsdWU7XG4gICAgICAvL2NvbnNvbGUubG9nKCdmZWVkYmFjaycsIHZhbHVlKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEZyZXF1ZW5jeScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEZyZXF1ZW5jeSh2YWx1ZSkge1xuICAgICAgdGhpcy5fZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuZnJlcXVlbmN5ID0gdmFsdWU7XG4gICAgICAvL2NvbnNvbGUubG9nKCdmcmVxdWVuY3knLCB2YWx1ZSlcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gRGVsYXk7XG59KF9jaGFubmVsX2Z4LkNoYW5uZWxFZmZlY3QpO1xuXG4vKlxuKGZ1bmN0aW9uICgpIHtcbiAgdmFyIGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgYXVkaW9FbGVtZW50ID0gJCgnI3NsaWRlcnMgYXVkaW8nKVswXVxuXG4gIGF1ZGlvRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdwbGF5JywgZnVuY3Rpb24oKXtcbiAgICBzb3VyY2UgPSBjdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKGF1ZGlvRWxlbWVudCk7XG5cbiAgICBkZWxheSA9IGN0eC5jcmVhdGVEZWxheSgpO1xuICAgIGRlbGF5LmRlbGF5VGltZS52YWx1ZSA9IDAuNTtcblxuICAgIGZlZWRiYWNrID0gY3R4LmNyZWF0ZUdhaW4oKTtcbiAgICBmZWVkYmFjay5nYWluLnZhbHVlID0gMC44O1xuXG4gICAgZmlsdGVyID0gY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xuICAgIGZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAxMDAwO1xuXG4gICAgZGVsYXkuY29ubmVjdChmZWVkYmFjayk7XG4gICAgZmVlZGJhY2suY29ubmVjdChmaWx0ZXIpO1xuICAgIGZpbHRlci5jb25uZWN0KGRlbGF5KTtcblxuICAgIHNvdXJjZS5jb25uZWN0KGRlbGF5KTtcbiAgICBzb3VyY2UuY29ubmVjdChjdHguZGVzdGluYXRpb24pO1xuICAgIGRlbGF5LmNvbm5lY3QoY3R4LmRlc3RpbmF0aW9uKTtcbiAgfSk7XG5cbiAgdmFyIGNvbnRyb2xzID0gJChcImRpdiNzbGlkZXJzXCIpO1xuXG4gIGNvbnRyb2xzLmZpbmQoXCJpbnB1dFtuYW1lPSdkZWxheVRpbWUnXVwiKS5vbignaW5wdXQnLCBmdW5jdGlvbigpIHtcbiAgICBkZWxheS5kZWxheVRpbWUudmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICB9KTtcblxuICBjb250cm9scy5maW5kKFwiaW5wdXRbbmFtZT0nZmVlZGJhY2snXVwiKS5vbignaW5wdXQnLCBmdW5jdGlvbigpIHtcbiAgICBmZWVkYmFjay5nYWluLnZhbHVlID0gJCh0aGlzKS52YWwoKTtcbiAgfSk7XG5cbiAgY29udHJvbHMuZmluZChcImlucHV0W25hbWU9J2ZyZXF1ZW5jeSddXCIpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICB9KTtcbn0pKCk7XG4qLyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG5leHBvcnRzLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuZXhwb3J0cy5hZGRFdmVudExpc3RlbmVyID0gYWRkRXZlbnRMaXN0ZW5lcjtcbmV4cG9ydHMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50TGlzdGVuZXI7XG52YXIgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpIHtcbiAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlKVxuICB2YXIgbWFwID0gdm9pZCAwO1xuXG4gIGlmIChldmVudC50eXBlID09PSAnZXZlbnQnKSB7XG4gICAgdmFyIG1pZGlFdmVudCA9IGV2ZW50LmRhdGE7XG4gICAgdmFyIG1pZGlFdmVudFR5cGUgPSBtaWRpRXZlbnQudHlwZTtcbiAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudFR5cGUpXG4gICAgaWYgKGV2ZW50TGlzdGVuZXJzLmhhcyhtaWRpRXZlbnRUeXBlKSkge1xuICAgICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudFR5cGUpO1xuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IG1hcC52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgY2IgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgIGNiKG1pZGlFdmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnRMaXN0ZW5lcnMuaGFzKGV2ZW50LnR5cGUpKVxuICBpZiAoZXZlbnRMaXN0ZW5lcnMuaGFzKGV2ZW50LnR5cGUpID09PSBmYWxzZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKTtcbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IG1hcC52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgdmFyIF9jYiA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgX2NiKGV2ZW50KTtcbiAgICB9XG5cbiAgICAvLyBAdG9kbzogcnVuIGZpbHRlcnMgaGVyZSwgZm9yIGluc3RhbmNlIGlmIGFuIGV2ZW50bGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgdG8gYWxsIE5PVEVfT04gZXZlbnRzLCBjaGVjayB0aGUgdHlwZSBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spIHtcblxuICB2YXIgbWFwID0gdm9pZCAwO1xuICB2YXIgaWQgPSB0eXBlICsgJ18nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgaWYgKGV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSA9PT0gZmFsc2UpIHtcbiAgICBtYXAgPSBuZXcgTWFwKCk7XG4gICAgZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIG1hcCk7XG4gIH0gZWxzZSB7XG4gICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpO1xuICB9XG5cbiAgbWFwLnNldChpZCwgY2FsbGJhY2spO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50TGlzdGVuZXJzKVxuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpIHtcblxuICBpZiAoZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUubG9nKCdubyBldmVudGxpc3RlbmVycyBvZiB0eXBlJyArIHR5cGUpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBtYXAgPSBldmVudExpc3RlbmVycy5nZXQodHlwZSk7XG5cbiAgaWYgKHR5cGVvZiBpZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWU7XG4gICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMyA9IGZhbHNlO1xuICAgIHZhciBfaXRlcmF0b3JFcnJvcjMgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMyA9IG1hcC5lbnRyaWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDM7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSAoX3N0ZXAzID0gX2l0ZXJhdG9yMy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWUpIHtcbiAgICAgICAgdmFyIF9zdGVwMyR2YWx1ZSA9IF9zbGljZWRUb0FycmF5KF9zdGVwMy52YWx1ZSwgMiksXG4gICAgICAgICAgICBrZXkgPSBfc3RlcDMkdmFsdWVbMF0sXG4gICAgICAgICAgICB2YWx1ZSA9IF9zdGVwMyR2YWx1ZVsxXTtcblxuICAgICAgICBjb25zb2xlLmxvZyhrZXksIHZhbHVlKTtcbiAgICAgICAgaWYgKHZhbHVlID09PSBpZCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICAgICAgaWQgPSBrZXk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kaWRJdGVyYXRvckVycm9yMyA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvcjMgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgJiYgX2l0ZXJhdG9yMy5yZXR1cm4pIHtcbiAgICAgICAgICBfaXRlcmF0b3IzLnJldHVybigpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IzKSB7XG4gICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG1hcC5kZWxldGUoaWQpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgbWFwLmRlbGV0ZShpZCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coJ2NvdWxkIG5vdCByZW1vdmUgZXZlbnRsaXN0ZW5lcicpO1xuICB9XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnN0YXR1cyA9IHN0YXR1cztcbmV4cG9ydHMuanNvbiA9IGpzb247XG5leHBvcnRzLmFycmF5QnVmZmVyID0gYXJyYXlCdWZmZXI7XG5leHBvcnRzLmZldGNoSlNPTiA9IGZldGNoSlNPTjtcbmV4cG9ydHMuZmV0Y2hBcnJheWJ1ZmZlciA9IGZldGNoQXJyYXlidWZmZXI7XG4vLyBmZXRjaCBoZWxwZXJzXG5cbmZ1bmN0aW9uIHN0YXR1cyhyZXNwb25zZSkge1xuICBpZiAocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpKTtcbn1cblxuZnVuY3Rpb24ganNvbihyZXNwb25zZSkge1xuICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xufVxuXG5mdW5jdGlvbiBhcnJheUJ1ZmZlcihyZXNwb25zZSkge1xuICByZXR1cm4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKTtcbn1cblxuZnVuY3Rpb24gZmV0Y2hKU09OKHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIC8vIGZldGNoKHVybCwge1xuICAgIC8vICAgbW9kZTogJ25vLWNvcnMnXG4gICAgLy8gfSlcbiAgICBmZXRjaCh1cmwpLnRoZW4oc3RhdHVzKS50aGVuKGpzb24pLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgIHJlamVjdChlKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGZldGNoQXJyYXlidWZmZXIodXJsKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgLy8gZmV0Y2godXJsLCB7XG4gICAgLy8gICBtb2RlOiAnbm8tY29ycydcbiAgICAvLyB9KVxuICAgIGZldGNoKHVybCkudGhlbihzdGF0dXMpLnRoZW4oYXJyYXlCdWZmZXIpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgIHJlamVjdChlKTtcbiAgICB9KTtcbiAgfSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5CbG9iID0gZXhwb3J0cy5yQUYgPSBleHBvcnRzLmdldFVzZXJNZWRpYSA9IHVuZGVmaW5lZDtcbmV4cG9ydHMuaW5pdCA9IGluaXQ7XG5cbnZhciBfcWFtYmkgPSByZXF1aXJlKCcuL3FhbWJpJyk7XG5cbnZhciBfcWFtYmkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcWFtYmkpO1xuXG52YXIgX3NvbmcgPSByZXF1aXJlKCcuL3NvbmcnKTtcblxudmFyIF9zYW1wbGVyID0gcmVxdWlyZSgnLi9zYW1wbGVyJyk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG52YXIgX2luaXRfbWlkaSA9IHJlcXVpcmUoJy4vaW5pdF9taWRpJyk7XG5cbnZhciBfc2V0dGluZ3MgPSByZXF1aXJlKCcuL3NldHRpbmdzJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBnZXRVc2VyTWVkaWEgPSBleHBvcnRzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUud2FybignZ2V0VXNlck1lZGlhIGlzIG5vdCBhdmFpbGFibGUnKTtcbiAgfTtcbn0oKTtcblxudmFyIHJBRiA9IGV4cG9ydHMuckFGID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS53YXJuKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgaXMgbm90IGF2YWlsYWJsZScpO1xuICB9O1xufSgpO1xuXG52YXIgQmxvYiA9IGV4cG9ydHMuQmxvYiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5CbG9iIHx8IHdpbmRvdy53ZWJraXRCbG9iO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS53YXJuKCdCbG9iIGlzIG5vdCBhdmFpbGFibGUnKTtcbiAgfTtcbn0oKTtcblxuZnVuY3Rpb24gbG9hZEluc3RydW1lbnQoZGF0YSkge1xuICB2YXIgc2FtcGxlciA9IG5ldyBfc2FtcGxlci5TYW1wbGVyKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgc2FtcGxlci5wYXJzZVNhbXBsZURhdGEoZGF0YSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZShzYW1wbGVyKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIHZhciBzZXR0aW5ncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogbnVsbDtcblxuXG4gIC8vIGxvYWQgc2V0dGluZ3MuaW5zdHJ1bWVudHMgKGFycmF5IG9yIG9iamVjdClcbiAgLy8gbG9hZCBzZXR0aW5ncy5taWRpZmlsZXMgKGFycmF5IG9yIG9iamVjdClcbiAgLypcbiAgIHFhbWJpLmluaXQoe1xuICAgIHNvbmc6IHtcbiAgICAgIHR5cGU6ICdTb25nJyxcbiAgICAgIHVybDogJy4uL2RhdGEvbWludXRlX3dhbHR6Lm1pZCdcbiAgICB9LFxuICAgIHBpYW5vOiB7XG4gICAgICB0eXBlOiAnSW5zdHJ1bWVudCcsXG4gICAgICB1cmw6ICcuLi8uLi9pbnN0cnVtZW50cy9lbGVjdHJpYy1waWFuby5qc29uJ1xuICAgIH1cbiAgfSlcbiAgIHFhbWJpLmluaXQoe1xuICAgIGluc3RydW1lbnRzOiBbJy4uL2luc3RydW1lbnRzL3BpYW5vJywgJy4uL2luc3RydW1lbnRzL3Zpb2xpbiddLFxuICAgIG1pZGlmaWxlczogWycuLi9taWRpL21vemFydC5taWQnXVxuICB9KVxuICAudGhlbigobG9hZGVkKSA9PiB7XG4gICAgbGV0IFtwaWFubywgdmlvbGluXSA9IGxvYWRlZC5pbnN0cnVtZW50c1xuICAgIGxldCBbbW96YXJ0XSA9IGxvYWRlZC5taWRpZmlsZXNcbiAgfSlcbiAgICovXG5cbiAgdmFyIHByb21pc2VzID0gWygwLCBfaW5pdF9hdWRpby5pbml0QXVkaW8pKCksICgwLCBfaW5pdF9taWRpLmluaXRNSURJKSgpXTtcbiAgdmFyIGxvYWRLZXlzID0gdm9pZCAwO1xuXG4gIGlmIChzZXR0aW5ncyAhPT0gbnVsbCkge1xuXG4gICAgbG9hZEtleXMgPSBPYmplY3Qua2V5cyhzZXR0aW5ncyk7XG4gICAgdmFyIGkgPSBsb2FkS2V5cy5pbmRleE9mKCdzZXR0aW5ncycpO1xuICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgKDAsIF9zZXR0aW5ncy51cGRhdGVTZXR0aW5ncykoc2V0dGluZ3Muc2V0dGluZ3MpO1xuICAgICAgbG9hZEtleXMuc3BsaWNlKGksIDEpO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKGxvYWRLZXlzKVxuXG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBsb2FkS2V5c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgdmFyIGtleSA9IF9zdGVwLnZhbHVlO1xuXG5cbiAgICAgICAgdmFyIGRhdGEgPSBzZXR0aW5nc1trZXldO1xuXG4gICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICdTb25nJykge1xuICAgICAgICAgIHByb21pc2VzLnB1c2goX3NvbmcuU29uZy5mcm9tTUlESUZpbGUoZGF0YS51cmwpKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdJbnN0cnVtZW50Jykge1xuICAgICAgICAgIHByb21pc2VzLnB1c2gobG9hZEluc3RydW1lbnQoZGF0YSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblxuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblxuICAgICAgdmFyIHJldHVybk9iaiA9IHt9O1xuXG4gICAgICByZXN1bHQuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSwgaSkge1xuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgIC8vIGluaXRBdWRpb1xuICAgICAgICAgIHJldHVybk9iai5sZWdhY3kgPSBkYXRhLmxlZ2FjeTtcbiAgICAgICAgICByZXR1cm5PYmoubXAzID0gZGF0YS5tcDM7XG4gICAgICAgICAgcmV0dXJuT2JqLm9nZyA9IGRhdGEub2dnO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDEpIHtcbiAgICAgICAgICAvLyBpbml0TUlESVxuICAgICAgICAgIHJldHVybk9iai5qYXp6ID0gZGF0YS5qYXp6O1xuICAgICAgICAgIHJldHVybk9iai5taWRpID0gZGF0YS5taWRpO1xuICAgICAgICAgIHJldHVybk9iai53ZWJtaWRpID0gZGF0YS53ZWJtaWRpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEluc3RydW1lbnRzLCBzYW1wbGVzIG9yIE1JREkgZmlsZXMgdGhhdCBnb3QgbG9hZGVkIGR1cmluZyBpbml0aWFsaXphdGlvblxuICAgICAgICAgIC8vcmVzdWx0W2xvYWRLZXlzW2kgLSAyXV0gPSBkYXRhXG4gICAgICAgICAgcmV0dXJuT2JqW2xvYWRLZXlzW2kgLSAyXV0gPSBkYXRhO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhyZXR1cm5PYmouamF6eilcblxuICAgICAgaWYgKHJldHVybk9iai5taWRpID09PSBmYWxzZSkge1xuICAgICAgICBjb25zb2xlLmxvZygncWFtYmknLCBfcWFtYmkyLmRlZmF1bHQudmVyc2lvbiwgJ1t5b3VyIGJyb3dzZXIgaGFzIG5vIHN1cHBvcnQgZm9yIE1JREldJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygncWFtYmknLCBfcWFtYmkyLmRlZmF1bHQudmVyc2lvbik7XG4gICAgICB9XG4gICAgICByZXNvbHZlKHJldHVybk9iaik7XG4gICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICByZWplY3QoZXJyb3IpO1xuICAgIH0pO1xuICB9KTtcblxuICAvKlxuICAgIFByb21pc2UuYWxsKFtpbml0QXVkaW8oKSwgaW5pdE1JREkoKV0pXG4gICAgLnRoZW4oXG4gICAgKGRhdGEpID0+IHtcbiAgICAgIC8vIHBhcnNlQXVkaW9cbiAgICAgIGxldCBkYXRhQXVkaW8gPSBkYXRhWzBdXG4gIFxuICAgICAgLy8gcGFyc2VNSURJXG4gICAgICBsZXQgZGF0YU1pZGkgPSBkYXRhWzFdXG4gIFxuICAgICAgY2FsbGJhY2soe1xuICAgICAgICBsZWdhY3k6IGRhdGFBdWRpby5sZWdhY3ksXG4gICAgICAgIG1wMzogZGF0YUF1ZGlvLm1wMyxcbiAgICAgICAgb2dnOiBkYXRhQXVkaW8ub2dnLFxuICAgICAgICBtaWRpOiBkYXRhTWlkaS5taWRpLFxuICAgICAgICB3ZWJtaWRpOiBkYXRhTWlkaS53ZWJtaWRpLFxuICAgICAgfSlcbiAgICB9LFxuICAgIChlcnJvcikgPT4ge1xuICAgICAgY2FsbGJhY2soZXJyb3IpXG4gICAgfSlcbiAgKi9cbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBleHBvcnRzLmVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBleHBvcnRzLmdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZXhwb3J0cy5nZXRNYXN0ZXJWb2x1bWUgPSBleHBvcnRzLnNldE1hc3RlclZvbHVtZSA9IGV4cG9ydHMubWFzdGVyQ29tcHJlc3NvciA9IGV4cG9ydHMudW5sb2NrV2ViQXVkaW8gPSBleHBvcnRzLm1hc3RlckdhaW4gPSBleHBvcnRzLmNvbnRleHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2V0cyB1cCB0aGUgYmFzaWMgYXVkaW8gcm91dGluZywgdGVzdHMgd2hpY2ggYXVkaW8gZm9ybWF0cyBhcmUgc3VwcG9ydGVkIGFuZCBwYXJzZXMgdGhlIHNhbXBsZXMgZm9yIHRoZSBtZXRyb25vbWUgdGlja3MuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG5leHBvcnRzLmluaXRBdWRpbyA9IGluaXRBdWRpbztcbmV4cG9ydHMuZ2V0SW5pdERhdGEgPSBnZXRJbml0RGF0YTtcblxudmFyIF9zYW1wbGVzID0gcmVxdWlyZSgnLi9zYW1wbGVzJyk7XG5cbnZhciBfc2FtcGxlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zYW1wbGVzKTtcblxudmFyIF9wYXJzZV9hdWRpbyA9IHJlcXVpcmUoJy4vcGFyc2VfYXVkaW8nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGRhdGEgPSB2b2lkIDA7XG52YXIgbWFzdGVyR2FpbiA9IHZvaWQgMDtcbnZhciBjb21wcmVzc29yID0gdm9pZCAwO1xudmFyIGluaXRpYWxpemVkID0gZmFsc2U7XG5cbnZhciBjb250ZXh0ID0gZXhwb3J0cy5jb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuICAvL2NvbnNvbGUubG9nKCdpbml0IEF1ZGlvQ29udGV4dCcpXG4gIHZhciBjdHggPSB2b2lkIDA7XG4gIGlmICgodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2Yod2luZG93KSkgPT09ICdvYmplY3QnKSB7XG4gICAgdmFyIEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbiAgICBpZiAoQXVkaW9Db250ZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuICAgIH1cbiAgfVxuICBpZiAodHlwZW9mIGN0eCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvL0BUT0RPOiBjcmVhdGUgZHVtbXkgQXVkaW9Db250ZXh0IGZvciB1c2UgaW4gbm9kZSwgc2VlOiBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9hdWRpby1jb250ZXh0XG4gICAgZXhwb3J0cy5jb250ZXh0ID0gY29udGV4dCA9IHtcbiAgICAgIGNyZWF0ZUdhaW46IGZ1bmN0aW9uIGNyZWF0ZUdhaW4oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2FpbjogMVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIGNyZWF0ZU9zY2lsbGF0b3I6IGZ1bmN0aW9uIGNyZWF0ZU9zY2lsbGF0b3IoKSB7fVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGN0eDtcbn0oKTtcblxuZnVuY3Rpb24gaW5pdEF1ZGlvKCkge1xuXG4gIGlmICh0eXBlb2YgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluO1xuICB9XG4gIC8vIGNoZWNrIGZvciBvbGRlciBpbXBsZW1lbnRhdGlvbnMgb2YgV2ViQXVkaW9cbiAgZGF0YSA9IHt9O1xuICB2YXIgc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgZGF0YS5sZWdhY3kgPSBmYWxzZTtcbiAgaWYgKHR5cGVvZiBzb3VyY2Uuc3RhcnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZGF0YS5sZWdhY3kgPSB0cnVlO1xuICB9XG5cbiAgLy8gc2V0IHVwIHRoZSBlbGVtZW50YXJ5IGF1ZGlvIG5vZGVzXG4gIGV4cG9ydHMubWFzdGVyQ29tcHJlc3NvciA9IGNvbXByZXNzb3IgPSBjb250ZXh0LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvcigpO1xuICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gIGV4cG9ydHMubWFzdGVyR2FpbiA9IG1hc3RlckdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSAwLjU7XG4gIGluaXRpYWxpemVkID0gdHJ1ZTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgKDAsIF9wYXJzZV9hdWRpby5wYXJzZVNhbXBsZXMpKF9zYW1wbGVzMi5kZWZhdWx0KS50aGVuKGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGJ1ZmZlcnMpIHtcbiAgICAgIC8vY29uc29sZS5sb2coYnVmZmVycylcbiAgICAgIC8vIGRhdGEub2dnID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlPZ2cgIT09ICd1bmRlZmluZWQnXG4gICAgICAvLyBkYXRhLm1wMyA9IHR5cGVvZiBidWZmZXJzLmVtcHR5TXAzICE9PSAndW5kZWZpbmVkJ1xuICAgICAgZGF0YS5sb3d0aWNrID0gYnVmZmVycy5sb3d0aWNrO1xuICAgICAgZGF0YS5oaWdodGljayA9IGJ1ZmZlcnMuaGlnaHRpY2s7XG4gICAgICBpZiAoZGF0YS5vZ2cgPT09IGZhbHNlICYmIGRhdGEubXAzID09PSBmYWxzZSkge1xuICAgICAgICByZWplY3QoJ05vIHN1cHBvcnQgZm9yIG9nZyBub3IgbXAzIScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBvblJlamVjdGVkKCkge1xuICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSBpbml0aWFsaXppbmcgQXVkaW8nKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbnZhciBfc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24gc2V0TWFzdGVyVm9sdW1lKCkge1xuICB2YXIgdmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDAuNTtcblxuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLnNldE1hc3RlclZvbHVtZSA9IF9zZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbiBzZXRNYXN0ZXJWb2x1bWUoKSB7XG4gICAgICB2YXIgdmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDAuNTtcblxuICAgICAgaWYgKHZhbHVlID4gMSkge1xuICAgICAgICBjb25zb2xlLmluZm8oJ21heGltYWwgdm9sdW1lIGlzIDEuMCwgdm9sdW1lIGlzIHNldCB0byAxLjAnKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUgPCAwID8gMCA6IHZhbHVlID4gMSA/IDEgOiB2YWx1ZTtcbiAgICAgIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICAgIH07XG4gICAgX3NldE1hc3RlclZvbHVtZSh2YWx1ZSk7XG4gIH1cbn07XG5cbnZhciBfZ2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24gZ2V0TWFzdGVyVm9sdW1lKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1hc3RlclZvbHVtZSA9IF9nZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbiBnZXRNYXN0ZXJWb2x1bWUoKSB7XG4gICAgICByZXR1cm4gbWFzdGVyR2Fpbi5nYWluLnZhbHVlO1xuICAgIH07XG4gICAgcmV0dXJuIF9nZXRNYXN0ZXJWb2x1bWUoKTtcbiAgfVxufTtcblxudmFyIF9nZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uIGdldENvbXByZXNzaW9uUmVkdWN0aW9uKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gX2dldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24gZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24oKSB7XG4gICAgICByZXR1cm4gY29tcHJlc3Nvci5yZWR1Y3Rpb24udmFsdWU7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldENvbXByZXNzaW9uUmVkdWN0aW9uKCk7XG4gIH1cbn07XG5cbnZhciBfZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uIGVuYWJsZU1hc3RlckNvbXByZXNzb3IoKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IF9lbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24gZW5hYmxlTWFzdGVyQ29tcHJlc3NvcihmbGFnKSB7XG4gICAgICBpZiAoZmxhZykge1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb21wcmVzc29yKTtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgfVxuICAgIH07XG4gICAgX2VuYWJsZU1hc3RlckNvbXByZXNzb3IoKTtcbiAgfVxufTtcblxudmFyIF9jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24gY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvcihjZmcpIHtcbiAgLypcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBhdHRhY2s7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBrbmVlOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJhdGlvOyAvLyB1bml0LWxlc3NcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWR1Y3Rpb247IC8vIGluIERlY2liZWxzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVsZWFzZTsgLy8gaW4gU2Vjb25kc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHRocmVzaG9sZDsgLy8gaW4gRGVjaWJlbHNcbiAgICAgQHNlZTogaHR0cDovL3dlYmF1ZGlvLmdpdGh1Yi5pby93ZWItYXVkaW8tYXBpLyN0aGUtZHluYW1pY3Njb21wcmVzc29ybm9kZS1pbnRlcmZhY2VcbiAgKi9cbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gX2NvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbiBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yKGNmZykge1xuICAgICAgdmFyIF9jZmckYXR0YWNrID0gY2ZnLmF0dGFjaztcbiAgICAgIGNvbXByZXNzb3IuYXR0YWNrID0gX2NmZyRhdHRhY2sgPT09IHVuZGVmaW5lZCA/IDAuMDAzIDogX2NmZyRhdHRhY2s7XG4gICAgICB2YXIgX2NmZyRrbmVlID0gY2ZnLmtuZWU7XG4gICAgICBjb21wcmVzc29yLmtuZWUgPSBfY2ZnJGtuZWUgPT09IHVuZGVmaW5lZCA/IDMwIDogX2NmZyRrbmVlO1xuICAgICAgdmFyIF9jZmckcmF0aW8gPSBjZmcucmF0aW87XG4gICAgICBjb21wcmVzc29yLnJhdGlvID0gX2NmZyRyYXRpbyA9PT0gdW5kZWZpbmVkID8gMTIgOiBfY2ZnJHJhdGlvO1xuICAgICAgdmFyIF9jZmckcmVkdWN0aW9uID0gY2ZnLnJlZHVjdGlvbjtcbiAgICAgIGNvbXByZXNzb3IucmVkdWN0aW9uID0gX2NmZyRyZWR1Y3Rpb24gPT09IHVuZGVmaW5lZCA/IDAgOiBfY2ZnJHJlZHVjdGlvbjtcbiAgICAgIHZhciBfY2ZnJHJlbGVhc2UgPSBjZmcucmVsZWFzZTtcbiAgICAgIGNvbXByZXNzb3IucmVsZWFzZSA9IF9jZmckcmVsZWFzZSA9PT0gdW5kZWZpbmVkID8gMC4yNTAgOiBfY2ZnJHJlbGVhc2U7XG4gICAgICB2YXIgX2NmZyR0aHJlc2hvbGQgPSBjZmcudGhyZXNob2xkO1xuICAgICAgY29tcHJlc3Nvci50aHJlc2hvbGQgPSBfY2ZnJHRocmVzaG9sZCA9PT0gdW5kZWZpbmVkID8gLTI0IDogX2NmZyR0aHJlc2hvbGQ7XG4gICAgfTtcbiAgICBfY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvcihjZmcpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRJbml0RGF0YSgpIHtcbiAgcmV0dXJuIGRhdGE7XG59XG5cbi8vIHRoaXMgZG9lc24ndCBzZWVtIHRvIGJlIG5lY2Vzc2FyeSBhbnltb3JlIG9uIGlPUyBhbnltb3JlXG52YXIgX3VubG9ja1dlYkF1ZGlvID0gZnVuY3Rpb24gdW5sb2NrV2ViQXVkaW8oKSB7XG4gIHZhciBzcmMgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcbiAgdmFyIGdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gIGdhaW5Ob2RlLmdhaW4udmFsdWUgPSAwO1xuICBzcmMuY29ubmVjdChnYWluTm9kZSk7XG4gIGdhaW5Ob2RlLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gIGlmICh0eXBlb2Ygc3JjLm5vdGVPbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzcmMuc3RhcnQgPSBzcmMubm90ZU9uO1xuICAgIHNyYy5zdG9wID0gc3JjLm5vdGVPZmY7XG4gIH1cbiAgc3JjLnN0YXJ0KDApO1xuICBzcmMuc3RvcCgwLjAwMSk7XG4gIGV4cG9ydHMudW5sb2NrV2ViQXVkaW8gPSBfdW5sb2NrV2ViQXVkaW8gPSBmdW5jdGlvbiB1bmxvY2tXZWJBdWRpbygpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdhbHJlYWR5IGRvbmUnKVxuICB9O1xufTtcblxuZXhwb3J0cy5tYXN0ZXJHYWluID0gbWFzdGVyR2FpbjtcbmV4cG9ydHMudW5sb2NrV2ViQXVkaW8gPSBfdW5sb2NrV2ViQXVkaW87XG5leHBvcnRzLm1hc3RlckNvbXByZXNzb3IgPSBjb21wcmVzc29yO1xuZXhwb3J0cy5zZXRNYXN0ZXJWb2x1bWUgPSBfc2V0TWFzdGVyVm9sdW1lO1xuZXhwb3J0cy5nZXRNYXN0ZXJWb2x1bWUgPSBfZ2V0TWFzdGVyVm9sdW1lO1xuZXhwb3J0cy5nZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IF9nZXRDb21wcmVzc2lvblJlZHVjdGlvbjtcbmV4cG9ydHMuZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IF9lbmFibGVNYXN0ZXJDb21wcmVzc29yO1xuZXhwb3J0cy5jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gX2NvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3I7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nZXRNSURJSW5wdXRCeUlkID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0QnlJZCA9IGV4cG9ydHMuZ2V0TUlESUlucHV0SWRzID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0SWRzID0gZXhwb3J0cy5nZXRNSURJSW5wdXRzID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IGV4cG9ydHMuZ2V0TUlESUFjY2VzcyA9IHVuZGVmaW5lZDtcbmV4cG9ydHMuaW5pdE1JREkgPSBpbml0TUlESTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnJlcXVpcmUoJ3dlYi1taWRpLWFwaS1zaGltJyk7XG5cbi8vIHlvdSBjYW4gYWxzbyBlbWJlZCB0aGUgc2hpbSBhcyBhIHN0YW5kLWFsb25lIHNjcmlwdCBpbiB0aGUgaHRtbCwgdGhlbiB5b3UgY2FuIGNvbW1lbnQgdGhpcyBsaW5lIG91dFxuXG4vKlxuICBSZXF1ZXN0cyBNSURJIGFjY2VzcywgcXVlcmllcyBhbGwgaW5wdXRzIGFuZCBvdXRwdXRzIGFuZCBzdG9yZXMgdGhlbSBpbiBhbHBoYWJldGljYWwgb3JkZXJcbiovXG5cbnZhciBNSURJQWNjZXNzID0gdm9pZCAwO1xudmFyIGluaXRpYWxpemVkID0gZmFsc2U7XG52YXIgaW5wdXRzID0gW107XG52YXIgb3V0cHV0cyA9IFtdO1xudmFyIGlucHV0SWRzID0gW107XG52YXIgb3V0cHV0SWRzID0gW107XG52YXIgaW5wdXRzQnlJZCA9IG5ldyBNYXAoKTtcbnZhciBvdXRwdXRzQnlJZCA9IG5ldyBNYXAoKTtcblxudmFyIHNvbmdNaWRpRXZlbnRMaXN0ZW5lciA9IHZvaWQgMDtcbnZhciBtaWRpRXZlbnRMaXN0ZW5lcklkID0gMDtcblxuZnVuY3Rpb24gZ2V0TUlESXBvcnRzKCkge1xuICBpbnB1dHMgPSBBcnJheS5mcm9tKE1JRElBY2Nlc3MuaW5wdXRzLnZhbHVlcygpKTtcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgaW5wdXRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYS5uYW1lLnRvTG93ZXJDYXNlKCkgPD0gYi5uYW1lLnRvTG93ZXJDYXNlKCkgPyAxIDogLTE7XG4gIH0pO1xuXG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGlucHV0c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgIHZhciBwb3J0ID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgIGlucHV0c0J5SWQuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICAgICAgaW5wdXRJZHMucHVzaChwb3J0LmlkKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb3V0cHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5vdXRwdXRzLnZhbHVlcygpKTtcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgb3V0cHV0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBvdXRwdXRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICB2YXIgX3BvcnQgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgIC8vY29uc29sZS5sb2cocG9ydC5pZCwgcG9ydC5uYW1lKVxuICAgICAgb3V0cHV0c0J5SWQuc2V0KF9wb3J0LmlkLCBfcG9ydCk7XG4gICAgICBvdXRwdXRJZHMucHVzaChfcG9ydC5pZCk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2cob3V0cHV0c0J5SWQpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvcjIucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0TUlESSgpIHtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICB2YXIgamF6eiA9IGZhbHNlO1xuICAgIHZhciBtaWRpID0gZmFsc2U7XG4gICAgdmFyIHdlYm1pZGkgPSBmYWxzZTtcblxuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJykge1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgcmVzb2x2ZSh7IG1pZGk6IG1pZGkgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzICE9PSAndW5kZWZpbmVkJykge1xuXG4gICAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MoKS50aGVuKGZ1bmN0aW9uIG9uRnVsRmlsbGVkKG1pZGlBY2Nlc3MpIHtcbiAgICAgICAgTUlESUFjY2VzcyA9IG1pZGlBY2Nlc3M7XG4gICAgICAgIC8vIEBUT0RPOiBpbXBsZW1lbnQgc29tZXRoaW5nIGluIHdlYm1pZGlhcGlzaGltIHRoYXQgYWxsb3dzIHVzIHRvIGRldGVjdCB0aGUgSmF6eiBwbHVnaW4gdmVyc2lvblxuICAgICAgICBpZiAodHlwZW9mIG1pZGlBY2Nlc3MuX2phenpJbnN0YW5jZXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2phenonKTtcbiAgICAgICAgICBqYXp6ID0gbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlc1swXS5fSmF6ei52ZXJzaW9uO1xuICAgICAgICAgIG1pZGkgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdlYm1pZGkgPSB0cnVlO1xuICAgICAgICAgIG1pZGkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0TUlESXBvcnRzKCk7XG5cbiAgICAgICAgLy8gb25jb25uZWN0IGFuZCBvbmRpc2Nvbm5lY3QgYXJlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIGFuZCBDaHJvbWl1bVxuICAgICAgICBtaWRpQWNjZXNzLm9uY29ubmVjdCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBjb25uZWN0ZWQnLCBlKTtcbiAgICAgICAgICBnZXRNSURJcG9ydHMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBtaWRpQWNjZXNzLm9uZGlzY29ubmVjdCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBkaXNjb25uZWN0ZWQnLCBlKTtcbiAgICAgICAgICBnZXRNSURJcG9ydHMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgIGpheno6IGphenosXG4gICAgICAgICAgbWlkaTogbWlkaSxcbiAgICAgICAgICB3ZWJtaWRpOiB3ZWJtaWRpLFxuICAgICAgICAgIGlucHV0czogaW5wdXRzLFxuICAgICAgICAgIG91dHB1dHM6IG91dHB1dHMsXG4gICAgICAgICAgaW5wdXRzQnlJZDogaW5wdXRzQnlJZCxcbiAgICAgICAgICBvdXRwdXRzQnlJZDogb3V0cHV0c0J5SWRcbiAgICAgICAgfSk7XG4gICAgICB9LCBmdW5jdGlvbiBvblJlamVjdChlKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coZSlcbiAgICAgICAgLy9yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIHJlcXVlc3RpbmcgTUlESUFjY2VzcycsIGUpXG4gICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZSh7IG1pZGk6IG1pZGksIGpheno6IGphenogfSk7XG4gICAgICB9KTtcbiAgICAgIC8vIGJyb3dzZXJzIHdpdGhvdXQgV2ViTUlESSBBUElcbiAgICB9IGVsc2Uge1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgcmVzb2x2ZSh7IG1pZGk6IG1pZGkgfSk7XG4gICAgfVxuICB9KTtcbn1cblxudmFyIF9nZXRNSURJQWNjZXNzID0gZnVuY3Rpb24gZ2V0TUlESUFjY2VzcygpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5nZXRNSURJQWNjZXNzID0gX2dldE1JRElBY2Nlc3MgPSBmdW5jdGlvbiBnZXRNSURJQWNjZXNzKCkge1xuICAgICAgcmV0dXJuIE1JRElBY2Nlc3M7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElBY2Nlc3MoKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElBY2Nlc3MgPSBfZ2V0TUlESUFjY2VzcztcbnZhciBfZ2V0TUlESU91dHB1dHMgPSBmdW5jdGlvbiBnZXRNSURJT3V0cHV0cygpIHtcbiAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0Jyk7XG4gIH0gZWxzZSB7XG4gICAgZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IF9nZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uIGdldE1JRElPdXRwdXRzKCkge1xuICAgICAgcmV0dXJuIG91dHB1dHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElPdXRwdXRzKCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IF9nZXRNSURJT3V0cHV0cztcbnZhciBfZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uIGdldE1JRElJbnB1dHMoKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0TUlESUlucHV0cyA9IF9nZXRNSURJSW5wdXRzID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0cygpIHtcbiAgICAgIHJldHVybiBpbnB1dHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElJbnB1dHMoKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElJbnB1dHMgPSBfZ2V0TUlESUlucHV0cztcbnZhciBfZ2V0TUlESU91dHB1dElkcyA9IGZ1bmN0aW9uIGdldE1JRElPdXRwdXRJZHMoKSB7XG4gIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpO1xuICB9IGVsc2Uge1xuICAgIGV4cG9ydHMuZ2V0TUlESU91dHB1dElkcyA9IF9nZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24gZ2V0TUlESU91dHB1dElkcygpIHtcbiAgICAgIHJldHVybiBvdXRwdXRJZHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElPdXRwdXRJZHMoKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElPdXRwdXRJZHMgPSBfZ2V0TUlESU91dHB1dElkcztcbnZhciBfZ2V0TUlESUlucHV0SWRzID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0SWRzKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElJbnB1dElkcyA9IF9nZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbiBnZXRNSURJSW5wdXRJZHMoKSB7XG4gICAgICByZXR1cm4gaW5wdXRJZHM7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElJbnB1dElkcygpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydHMuZ2V0TUlESUlucHV0SWRzID0gX2dldE1JRElJbnB1dElkcztcbnZhciBfZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbiBnZXRNSURJT3V0cHV0QnlJZChpZCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElPdXRwdXRCeUlkID0gX2dldE1JRElPdXRwdXRCeUlkID0gZnVuY3Rpb24gZ2V0TUlESU91dHB1dEJ5SWQoX2lkKSB7XG4gICAgICByZXR1cm4gb3V0cHV0c0J5SWQuZ2V0KF9pZCk7XG4gICAgfTtcbiAgICByZXR1cm4gX2dldE1JRElPdXRwdXRCeUlkKGlkKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnRzLmdldE1JRElPdXRwdXRCeUlkID0gX2dldE1JRElPdXRwdXRCeUlkO1xudmFyIF9nZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24gZ2V0TUlESUlucHV0QnlJZChpZCkge1xuICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKTtcbiAgfSBlbHNlIHtcbiAgICBleHBvcnRzLmdldE1JRElJbnB1dEJ5SWQgPSBfZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uIGdldE1JRElJbnB1dEJ5SWQoX2lkKSB7XG4gICAgICByZXR1cm4gaW5wdXRzQnlJZC5nZXQoX2lkKTtcbiAgICB9O1xuICAgIHJldHVybiBfZ2V0TUlESUlucHV0QnlJZChpZCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLypcbmV4cG9ydCBmdW5jdGlvbiBpbml0TWlkaVNvbmcoc29uZyl7XG5cbiAgc29uZ01pZGlFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgLy9jb25zb2xlLmxvZyhlKVxuICAgIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBlLCB0aGlzKTtcbiAgfTtcblxuICAvLyBieSBkZWZhdWx0IGEgc29uZyBsaXN0ZW5zIHRvIGFsbCBhdmFpbGFibGUgbWlkaS1pbiBwb3J0c1xuICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcblxuICBvdXRwdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpSW5wdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IGlucHV0ID0gaW5wdXRzLmdldChpZCk7XG5cbiAgaWYoaW5wdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBpbnB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlJbnB1dHMuZGVsZXRlKGlkKTtcbiAgICBpbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1lbHNle1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQoaWQsIGlucHV0KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpSW5wdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlPdXRwdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IG91dHB1dCA9IG91dHB1dHMuZ2V0KGlkKTtcblxuICBpZihvdXRwdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBvdXRwdXQgd2l0aCBpZCcsIGlkLCAnZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihmbGFnID09PSBmYWxzZSl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5kZWxldGUoaWQpO1xuICAgIGxldCB0aW1lID0gc29uZy5zY2hlZHVsZXIubGFzdEV2ZW50VGltZSArIDEwMDtcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWUpOyAvLyBzdG9wIGFsbCBub3Rlc1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZSk7IC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICB9ZWxzZXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChpZCwgb3V0cHV0KTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlPdXRwdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIG1pZGlNZXNzYWdlRXZlbnQsIGlucHV0KXtcbiAgbGV0IG1pZGlFdmVudCA9IG5ldyBNaWRpRXZlbnQoc29uZy50aWNrcywgLi4ubWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5taWRpSW5wdXRzLCBpbnB1dCk7XG5cblxuICAgIC8vaWYobWlkaUV2ZW50LmNoYW5uZWwgPT09IHRyYWNrLmNoYW5uZWwgfHwgdHJhY2suY2hhbm5lbCA9PT0gMCB8fCB0cmFjay5jaGFubmVsID09PSAnYW55Jyl7XG4gICAgLy8gIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjayk7XG4gICAgLy99XG5cblxuICAgIC8vIGxpa2UgaW4gQ3ViYXNlLCBtaWRpIGV2ZW50cyBmcm9tIGFsbCBkZXZpY2VzLCBzZW50IG9uIGFueSBtaWRpIGNoYW5uZWwgYXJlIGZvcndhcmRlZCB0byBhbGwgdHJhY2tzXG4gICAgLy8gc2V0IHRyYWNrLm1vbml0b3IgdG8gZmFsc2UgaWYgeW91IGRvbid0IHdhbnQgdG8gcmVjZWl2ZSBtaWRpIGV2ZW50cyBvbiBhIGNlcnRhaW4gdHJhY2tcbiAgICAvLyBub3RlIHRoYXQgdHJhY2subW9uaXRvciBpcyBieSBkZWZhdWx0IHNldCB0byBmYWxzZSBhbmQgdGhhdCB0cmFjay5tb25pdG9yIGlzIGF1dG9tYXRpY2FsbHkgc2V0IHRvIHRydWVcbiAgICAvLyBpZiB5b3UgYXJlIHJlY29yZGluZyBvbiB0aGF0IHRyYWNrXG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5tb25pdG9yLCB0cmFjay5pZCwgaW5wdXQuaWQpO1xuICAgIGlmKHRyYWNrLm1vbml0b3IgPT09IHRydWUgJiYgdHJhY2subWlkaUlucHV0cy5nZXQoaW5wdXQuaWQpICE9PSB1bmRlZmluZWQpe1xuICAgICAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrLCBpbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgbGV0IGxpc3RlbmVycyA9IHNvbmcubWlkaUV2ZW50TGlzdGVuZXJzLmdldChtaWRpRXZlbnQudHlwZSk7XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBmb3IobGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycyl7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKHRyYWNrLCBtaWRpRXZlbnQsIGlucHV0KXtcbiAgbGV0IHNvbmcgPSB0cmFjay5zb25nLFxuICAgIG5vdGUsIGxpc3RlbmVycywgY2hhbm5lbDtcbiAgICAvL2RhdGEgPSBtaWRpTWVzc2FnZUV2ZW50LmRhdGEsXG4gICAgLy9taWRpRXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoc29uZy50aWNrcywgZGF0YVswXSwgZGF0YVsxXSwgZGF0YVsyXSk7XG5cbiAgLy9taWRpRXZlbnQuc291cmNlID0gbWlkaU1lc3NhZ2VFdmVudC5zcmNFbGVtZW50Lm5hbWU7XG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudClcbiAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCBtaWRpRXZlbnQudHlwZSk7XG5cbiAgLy8gYWRkIHRoZSBleGFjdCB0aW1lIG9mIHRoaXMgZXZlbnQgc28gd2UgY2FuIGNhbGN1bGF0ZSBpdHMgdGlja3MgcG9zaXRpb25cbiAgbWlkaUV2ZW50LnJlY29yZE1pbGxpcyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwOyAvLyBtaWxsaXNcbiAgbWlkaUV2ZW50LnN0YXRlID0gJ3JlY29yZGVkJztcblxuICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICBub3RlID0gY3JlYXRlTWlkaU5vdGUobWlkaUV2ZW50KTtcbiAgICB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdID0gbm90ZTtcbiAgICAvL3RyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF0gPSBub3RlO1xuICB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICBub3RlID0gdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvLyBjaGVjayBpZiB0aGUgbm90ZSBleGlzdHM6IGlmIHRoZSB1c2VyIHBsYXlzIG5vdGVzIG9uIGhlciBrZXlib2FyZCBiZWZvcmUgdGhlIG1pZGkgc3lzdGVtIGhhc1xuICAgIC8vIGJlZW4gZnVsbHkgaW5pdGlhbGl6ZWQsIGl0IGNhbiBoYXBwZW4gdGhhdCB0aGUgZmlyc3QgaW5jb21pbmcgbWlkaSBldmVudCBpcyBhIE5PVEUgT0ZGIGV2ZW50XG4gICAgaWYobm90ZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm90ZS5hZGROb3RlT2ZmKG1pZGlFdmVudCk7XG4gICAgZGVsZXRlIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy9kZWxldGUgdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXTtcbiAgfVxuXG4gIC8vY29uc29sZS5sb2coc29uZy5wcmVyb2xsLCBzb25nLnJlY29yZGluZywgdHJhY2sucmVjb3JkRW5hYmxlZCk7XG5cbiAgaWYoKHNvbmcucHJlcm9sbGluZyB8fCBzb25nLnJlY29yZGluZykgJiYgdHJhY2sucmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKXtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIHRyYWNrLnNvbmcucmVjb3JkZWROb3Rlcy5wdXNoKG5vdGUpO1xuICAgIH1cbiAgICB0cmFjay5yZWNvcmRQYXJ0LmFkZEV2ZW50KG1pZGlFdmVudCk7XG4gICAgLy8gc29uZy5yZWNvcmRlZEV2ZW50cyBpcyB1c2VkIGluIHRoZSBrZXkgZWRpdG9yXG4gICAgdHJhY2suc29uZy5yZWNvcmRlZEV2ZW50cy5wdXNoKG1pZGlFdmVudCk7XG4gIH1lbHNlIGlmKHRyYWNrLmVuYWJsZVJldHJvc3BlY3RpdmVSZWNvcmRpbmcpe1xuICAgIHRyYWNrLnJldHJvc3BlY3RpdmVSZWNvcmRpbmcucHVzaChtaWRpRXZlbnQpO1xuICB9XG5cbiAgLy8gY2FsbCBhbGwgbWlkaSBldmVudCBsaXN0ZW5lcnNcbiAgbGlzdGVuZXJzID0gdHJhY2subWlkaUV2ZW50TGlzdGVuZXJzW21pZGlFdmVudC50eXBlXTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIG9iamVjdEZvckVhY2gobGlzdGVuZXJzLCBmdW5jdGlvbihsaXN0ZW5lcil7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoYW5uZWwgPSB0cmFjay5jaGFubmVsO1xuICBpZihjaGFubmVsID09PSAnYW55JyB8fCBjaGFubmVsID09PSB1bmRlZmluZWQgfHwgaXNOYU4oY2hhbm5lbCkgPT09IHRydWUpe1xuICAgIGNoYW5uZWwgPSAwO1xuICB9XG5cbiAgb2JqZWN0Rm9yRWFjaCh0cmFjay5taWRpT3V0cHV0cywgZnVuY3Rpb24ob3V0cHV0KXtcbiAgICAvL2NvbnNvbGUubG9nKCdtaWRpIG91dCcsIG91dHB1dCwgbWlkaUV2ZW50LnR5cGUpO1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjggfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE0NCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyKTtcbiAgICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgICAvLyB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTkyKXtcbiAgICAvLyAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExXSk7XG4gICAgfVxuICAgIC8vb3V0cHV0LnNlbmQoW21pZGlFdmVudC5zdGF0dXMgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICB9KTtcblxuICAvLyBAVE9ETzogbWF5YmUgYSB0cmFjayBzaG91bGQgYmUgYWJsZSB0byBzZW5kIGl0cyBldmVudCB0byBib3RoIGEgbWlkaS1vdXQgcG9ydCBhbmQgYW4gaW50ZXJuYWwgaGVhcnRiZWF0IHNvbmc/XG4gIC8vY29uc29sZS5sb2codHJhY2sucm91dGVUb01pZGlPdXQpO1xuICBpZih0cmFjay5yb3V0ZVRvTWlkaU91dCA9PT0gZmFsc2Upe1xuICAgIG1pZGlFdmVudC50cmFjayA9IHRyYWNrO1xuICAgIHRyYWNrLmluc3RydW1lbnQucHJvY2Vzc0V2ZW50KG1pZGlFdmVudCk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBhZGRNaWRpRXZlbnRMaXN0ZW5lciguLi5hcmdzKXsgLy8gY2FsbGVyIGNhbiBiZSBhIHRyYWNrIG9yIGEgc29uZ1xuXG4gIGxldCBpZCA9IG1pZGlFdmVudExpc3RlbmVySWQrKztcbiAgbGV0IGxpc3RlbmVyO1xuICAgIHR5cGVzID0ge30sXG4gICAgaWRzID0gW10sXG4gICAgbG9vcDtcblxuXG4gIC8vIHNob3VsZCBJIGlubGluZSB0aGlzP1xuICBsb29wID0gZnVuY3Rpb24oYXJncyl7XG4gICAgZm9yKGxldCBhcmcgb2YgYXJncyl7XG4gICAgICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcoYXJnKTtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgICBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgbG9vcChhcmcpO1xuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgIGxpc3RlbmVyID0gYXJnO1xuICAgICAgfWVsc2UgaWYoaXNOYU4oYXJnKSA9PT0gZmFsc2Upe1xuICAgICAgICBhcmcgPSBwYXJzZUludChhcmcsIDEwKTtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgYXJnID0gc2VxdWVuY2VyLm1pZGlFdmVudE51bWJlckJ5TmFtZShhcmcpO1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgbG9vcChhcmdzLCAwLCBhcmdzLmxlbmd0aCk7XG4gIC8vY29uc29sZS5sb2coJ3R5cGVzJywgdHlwZXMsICdsaXN0ZW5lcicsIGxpc3RlbmVyKTtcblxuICBvYmplY3RGb3JFYWNoKHR5cGVzLCBmdW5jdGlvbih0eXBlKXtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgIGlmKG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID0ge307XG4gICAgfVxuICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdID0gbGlzdGVuZXI7XG4gICAgaWRzLnB1c2godHlwZSArICdfJyArIGlkKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhvYmoubWlkaUV2ZW50TGlzdGVuZXJzKTtcbiAgcmV0dXJuIGlkcy5sZW5ndGggPT09IDEgPyBpZHNbMF0gOiBpZHM7XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXIoaWQsIG9iail7XG4gIHZhciB0eXBlO1xuICBpZCA9IGlkLnNwbGl0KCdfJyk7XG4gIHR5cGUgPSBpZFswXTtcbiAgaWQgPSBpZFsxXTtcbiAgZGVsZXRlIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVycygpe1xuXG59XG5cbiovXG5cbmV4cG9ydHMuZ2V0TUlESUlucHV0QnlJZCA9IF9nZXRNSURJSW5wdXRCeUlkOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuSW5zdHJ1bWVudCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfZXZlbnRsaXN0ZW5lciA9IHJlcXVpcmUoJy4vZXZlbnRsaXN0ZW5lcicpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgSW5zdHJ1bWVudCA9IGV4cG9ydHMuSW5zdHJ1bWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gSW5zdHJ1bWVudCgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5zdHJ1bWVudCk7XG5cbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW107XG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2U7XG4gICAgdGhpcy5vdXRwdXQgPSBudWxsO1xuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG5cblxuICBfY3JlYXRlQ2xhc3MoSW5zdHJ1bWVudCwgW3tcbiAgICBrZXk6ICdjb25uZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29ubmVjdChvdXRwdXQpIHtcbiAgICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0O1xuICAgIH1cblxuICAgIC8vIG1hbmRhdG9yeVxuXG4gIH0sIHtcbiAgICBrZXk6ICdkaXNjb25uZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzY29ubmVjdCgpIHtcbiAgICAgIHRoaXMub3V0cHV0ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBtYW5kYXRvcnlcblxuICB9LCB7XG4gICAga2V5OiAncHJvY2Vzc01JRElFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciB0aW1lID0gZXZlbnQudGltZSAvIDEwMDA7XG4gICAgICB2YXIgc2FtcGxlID0gdm9pZCAwO1xuXG4gICAgICBpZiAoaXNOYU4odGltZSkpIHtcbiAgICAgICAgLy8gdGhpcyBzaG91bGRuJ3QgaGFwcGVuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2ludmFsaWQgdGltZSB2YWx1ZScpO1xuICAgICAgICByZXR1cm47XG4gICAgICAgIC8vdGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWUgPT09IDApIHtcbiAgICAgICAgLy8gdGhpcyBzaG91bGRuJ3QgaGFwcGVuIC0+IGV4dGVybmFsIE1JREkga2V5Ym9hcmRzXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ3Nob3VsZCBub3QgaGFwcGVuJyk7XG4gICAgICAgIHRpbWUgPSBfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXZlbnQudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coMTQ0LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcblxuICAgICAgICBzYW1wbGUgPSB0aGlzLmNyZWF0ZVNhbXBsZShldmVudCk7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgc2FtcGxlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGUpXG4gICAgICAgIHNhbXBsZS5vdXRwdXQuY29ubmVjdCh0aGlzLm91dHB1dCk7XG4gICAgICAgIHNhbXBsZS5zdGFydCh0aW1lKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnc2NoZWR1bGluZycsIGV2ZW50LmlkLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgICAvL2NvbnNvbGUubG9nKCdzdGFydCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09IDEyOCkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKDEyOCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG4gICAgICAgIHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5nZXQoZXZlbnQubWlkaU5vdGVJZCk7XG4gICAgICAgIGlmICh0eXBlb2Ygc2FtcGxlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vY29uc29sZS5pbmZvKCdzYW1wbGUgbm90IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkLCAnIG1pZGlOb3RlJywgZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0aGF0IHRoZSBzdXN0YWluIHBlZGFsIHByZXZlbnRzIHRoZSBhbiBldmVudCB0byB1bnNjaGVkdWxlZFxuICAgICAgICBpZiAodGhpcy5zdXN0YWluUGVkYWxEb3duID09PSB0cnVlKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkKVxuICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdzdG9wJywgdGltZSwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgICAgIHNhbXBsZS5vdXRwdXQuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgX3RoaXMuc2NoZWR1bGVkU2FtcGxlcy5kZWxldGUoZXZlbnQubWlkaU5vdGVJZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09IDE3Nikge1xuICAgICAgICAvLyBzdXN0YWluIHBlZGFsXG4gICAgICAgIGlmIChldmVudC5kYXRhMSA9PT0gNjQpIHtcbiAgICAgICAgICBpZiAoZXZlbnQuZGF0YTIgPT09IDEyNykge1xuICAgICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vLypcbiAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgICAgICBkYXRhOiAnZG93bidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8qL1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3VzdGFpbiBwZWRhbCBkb3duJylcbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGEyID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5mb3JFYWNoKGZ1bmN0aW9uIChtaWRpTm90ZUlkKSB7XG4gICAgICAgICAgICAgIHNhbXBsZSA9IF90aGlzLnNjaGVkdWxlZFNhbXBsZXMuZ2V0KG1pZGlOb3RlSWQpO1xuICAgICAgICAgICAgICBpZiAoc2FtcGxlKSB7XG4gICAgICAgICAgICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgICAgICAgICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3AnLCBtaWRpTm90ZUlkKVxuICAgICAgICAgICAgICAgICAgc2FtcGxlLm91dHB1dC5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICBfdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmRlbGV0ZShtaWRpTm90ZUlkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIHVwJywgdGhpcy5zdXN0YWluZWRTYW1wbGVzKVxuICAgICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW107XG4gICAgICAgICAgICAvLy8qXG4gICAgICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgICAgZGF0YTogJ3VwJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyovXG4gICAgICAgICAgICAvL3RoaXMuc3RvcFN1c3RhaW4odGltZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gcGFubmluZ1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGExID09PSAxMCkge1xuICAgICAgICAgIC8vIHBhbm5pbmcgaXMgKm5vdCogZXhhY3RseSB0aW1lZCAtPiBub3QgcG9zc2libGUgKHlldCkgd2l0aCBXZWJBdWRpb1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZGF0YTIsIHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG4gICAgICAgICAgLy90cmFjay5zZXRQYW5uaW5nKHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG5cbiAgICAgICAgICAvLyB2b2x1bWVcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5kYXRhMSA9PT0gNykge1xuICAgICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBtYW5kYXRvcnlcblxuICB9LCB7XG4gICAga2V5OiAnYWxsTm90ZXNPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhbGxOb3Rlc09mZigpIHtcbiAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdO1xuICAgICAgaWYgKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgIGRhdGE6ICd1cCdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZTtcblxuICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmZvckVhY2goZnVuY3Rpb24gKHNhbXBsZSkge1xuICAgICAgICBzYW1wbGUuc3RvcChfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgc2FtcGxlLm91dHB1dC5kaXNjb25uZWN0KCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5jbGVhcigpO1xuICAgIH1cblxuICAgIC8vIG1hbmRhdG9yeVxuXG4gIH0sIHtcbiAgICBrZXk6ICd1bnNjaGVkdWxlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5zY2hlZHVsZShtaWRpRXZlbnQpIHtcbiAgICAgIHZhciBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZ2V0KG1pZGlFdmVudC5taWRpTm90ZUlkKTtcbiAgICAgIGlmIChzYW1wbGUpIHtcbiAgICAgICAgc2FtcGxlLnN0b3AoX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHNhbXBsZS5vdXRwdXQuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZGVsZXRlKG1pZGlFdmVudC5taWRpTm90ZUlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gSW5zdHJ1bWVudDtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLk1ldHJvbm9tZSA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF90cmFjayA9IHJlcXVpcmUoJy4vdHJhY2snKTtcblxudmFyIF9wYXJ0MyA9IHJlcXVpcmUoJy4vcGFydCcpO1xuXG52YXIgX3BhcnNlX2V2ZW50cyA9IHJlcXVpcmUoJy4vcGFyc2VfZXZlbnRzJyk7XG5cbnZhciBfbWlkaV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaV9ldmVudCcpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9wb3NpdGlvbiA9IHJlcXVpcmUoJy4vcG9zaXRpb24nKTtcblxudmFyIF9zYW1wbGVyID0gcmVxdWlyZSgnLi9zYW1wbGVyJyk7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpbycpO1xuXG52YXIgX2NvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgbWV0aG9kTWFwID0gbmV3IE1hcChbWyd2b2x1bWUnLCAnc2V0Vm9sdW1lJ10sIFsnaW5zdHJ1bWVudCcsICdzZXRJbnN0cnVtZW50J10sIFsnbm90ZU51bWJlckFjY2VudGVkVGljaycsICdzZXROb3RlTnVtYmVyQWNjZW50ZWRUaWNrJ10sIFsnbm90ZU51bWJlck5vbkFjY2VudGVkVGljaycsICdzZXROb3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJ10sIFsndmVsb2NpdHlBY2NlbnRlZFRpY2snLCAnc2V0VmVsb2NpdHlBY2NlbnRlZFRpY2snXSwgWyd2ZWxvY2l0eU5vbkFjY2VudGVkVGljaycsICdzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljayddLCBbJ25vdGVMZW5ndGhBY2NlbnRlZFRpY2snLCAnc2V0Tm90ZUxlbmd0aEFjY2VudGVkVGljayddLCBbJ25vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snLCAnc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayddXSk7XG5cbnZhciBNZXRyb25vbWUgPSBleHBvcnRzLk1ldHJvbm9tZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTWV0cm9ub21lKHNvbmcpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWV0cm9ub21lKTtcblxuICAgIHRoaXMuc29uZyA9IHNvbmc7XG4gICAgdGhpcy50cmFjayA9IG5ldyBfdHJhY2suVHJhY2soeyBuYW1lOiB0aGlzLnNvbmcuaWQgKyAnX21ldHJvbm9tZScgfSk7XG4gICAgdGhpcy5wYXJ0ID0gbmV3IF9wYXJ0My5QYXJ0KCk7XG4gICAgdGhpcy50cmFjay5hZGRQYXJ0cyh0aGlzLnBhcnQpO1xuICAgIHRoaXMudHJhY2suX2dhaW5Ob2RlLmNvbm5lY3QodGhpcy5zb25nLl9nYWluTm9kZSk7XG5cbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSBbXTtcbiAgICB0aGlzLnByZWNvdW50RHVyYXRpb24gPSAwO1xuICAgIHRoaXMuYmFycyA9IDA7XG4gICAgdGhpcy5pbmRleCA9IDA7XG4gICAgdGhpcy5pbmRleDIgPSAwO1xuICAgIHRoaXMucHJlY291bnRJbmRleCA9IDA7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1ldHJvbm9tZSwgW3tcbiAgICBrZXk6ICdyZXNldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuXG4gICAgICB2YXIgZGF0YSA9ICgwLCBfaW5pdF9hdWRpby5nZXRJbml0RGF0YSkoKTtcbiAgICAgIHZhciBpbnN0cnVtZW50ID0gbmV3IF9zYW1wbGVyLlNhbXBsZXIoJ21ldHJvbm9tZScpO1xuICAgICAgaW5zdHJ1bWVudC51cGRhdGVTYW1wbGVEYXRhKHtcbiAgICAgICAgbm90ZTogNjAsXG4gICAgICAgIGJ1ZmZlcjogZGF0YS5sb3d0aWNrXG4gICAgICB9LCB7XG4gICAgICAgIG5vdGU6IDYxLFxuICAgICAgICBidWZmZXI6IGRhdGEuaGlnaHRpY2tcbiAgICAgIH0pO1xuICAgICAgdGhpcy50cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpO1xuXG4gICAgICB0aGlzLnZvbHVtZSA9IDE7XG5cbiAgICAgIHRoaXMubm90ZU51bWJlckFjY2VudGVkID0gNjE7XG4gICAgICB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZCA9IDYwO1xuXG4gICAgICB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgPSAxMDA7XG4gICAgICB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQgPSAxMDA7XG5cbiAgICAgIHRoaXMubm90ZUxlbmd0aEFjY2VudGVkID0gdGhpcy5zb25nLnBwcSAvIDQ7IC8vIHNpeHRlZW50aCBub3RlcyAtPiBkb24ndCBtYWtlIHRoaXMgdG9vIHNob3J0IGlmIHlvdXIgc2FtcGxlIGhhcyBhIGxvbmcgYXR0YWNrIVxuICAgICAgdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQgPSB0aGlzLnNvbmcucHBxIC8gNDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjcmVhdGVFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhcikge1xuICAgICAgdmFyIGlkID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAnaW5pdCc7XG5cbiAgICAgIHZhciBpID0gdm9pZCAwLFxuICAgICAgICAgIGogPSB2b2lkIDA7XG4gICAgICB2YXIgcG9zaXRpb24gPSB2b2lkIDA7XG4gICAgICB2YXIgdmVsb2NpdHkgPSB2b2lkIDA7XG4gICAgICB2YXIgbm90ZUxlbmd0aCA9IHZvaWQgMDtcbiAgICAgIHZhciBub3RlTnVtYmVyID0gdm9pZCAwO1xuICAgICAgdmFyIGJlYXRzUGVyQmFyID0gdm9pZCAwO1xuICAgICAgdmFyIHRpY2tzUGVyQmVhdCA9IHZvaWQgMDtcbiAgICAgIHZhciB0aWNrcyA9IDA7XG4gICAgICB2YXIgbm90ZU9uID0gdm9pZCAwLFxuICAgICAgICAgIG5vdGVPZmYgPSB2b2lkIDA7XG4gICAgICB2YXIgZXZlbnRzID0gW107XG5cbiAgICAgIC8vY29uc29sZS5sb2coc3RhcnRCYXIsIGVuZEJhcik7XG5cbiAgICAgIGZvciAoaSA9IHN0YXJ0QmFyOyBpIDw9IGVuZEJhcjsgaSsrKSB7XG4gICAgICAgIHBvc2l0aW9uID0gKDAsIF9wb3NpdGlvbi5jYWxjdWxhdGVQb3NpdGlvbikodGhpcy5zb25nLCB7XG4gICAgICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAgICAgdGFyZ2V0OiBbaV1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgYmVhdHNQZXJCYXIgPSBwb3NpdGlvbi5ub21pbmF0b3I7XG4gICAgICAgIHRpY2tzUGVyQmVhdCA9IHBvc2l0aW9uLnRpY2tzUGVyQmVhdDtcbiAgICAgICAgdGlja3MgPSBwb3NpdGlvbi50aWNrcztcblxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgYmVhdHNQZXJCYXI7IGorKykge1xuXG4gICAgICAgICAgbm90ZU51bWJlciA9IGogPT09IDAgPyB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA6IHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkO1xuICAgICAgICAgIG5vdGVMZW5ndGggPSBqID09PSAwID8gdGhpcy5ub3RlTGVuZ3RoQWNjZW50ZWQgOiB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZDtcbiAgICAgICAgICB2ZWxvY2l0eSA9IGogPT09IDAgPyB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgOiB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQ7XG5cbiAgICAgICAgICBub3RlT24gPSBuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KHRpY2tzLCAxNDQsIG5vdGVOdW1iZXIsIHZlbG9jaXR5KTtcbiAgICAgICAgICBub3RlT2ZmID0gbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcyArIG5vdGVMZW5ndGgsIDEyOCwgbm90ZU51bWJlciwgMCk7XG5cbiAgICAgICAgICBpZiAoaWQgPT09ICdwcmVjb3VudCcpIHtcbiAgICAgICAgICAgIG5vdGVPbi5fdHJhY2sgPSB0aGlzLnRyYWNrO1xuICAgICAgICAgICAgbm90ZU9mZi5fdHJhY2sgPSB0aGlzLnRyYWNrO1xuICAgICAgICAgICAgbm90ZU9uLl9wYXJ0ID0ge307XG4gICAgICAgICAgICBub3RlT2ZmLl9wYXJ0ID0ge307XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXZlbnRzLnB1c2gobm90ZU9uLCBub3RlT2ZmKTtcbiAgICAgICAgICB0aWNrcyArPSB0aWNrc1BlckJlYXQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFdmVudHMoKSB7XG4gICAgICB2YXIgc3RhcnRCYXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDE7XG5cbiAgICAgIHZhciBfcGFydDtcblxuICAgICAgdmFyIGVuZEJhciA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogdGhpcy5zb25nLmJhcnM7XG4gICAgICB2YXIgaWQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6ICdpbml0JztcblxuICAgICAgdGhpcy5wYXJ0LnJlbW92ZUV2ZW50cyh0aGlzLnBhcnQuZ2V0RXZlbnRzKCkpO1xuICAgICAgdGhpcy5ldmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZCk7XG4gICAgICAoX3BhcnQgPSB0aGlzLnBhcnQpLmFkZEV2ZW50cy5hcHBseShfcGFydCwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuZXZlbnRzKSk7XG4gICAgICB0aGlzLmJhcnMgPSB0aGlzLnNvbmcuYmFycztcbiAgICAgIC8vY29uc29sZS5sb2coJ2dldEV2ZW50cyAlTycsIHRoaXMuZXZlbnRzKVxuICAgICAgdGhpcy5hbGxFdmVudHMgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuZXZlbnRzKSwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuc29uZy5fdGltZUV2ZW50cykpO1xuICAgICAgLy8gY29uc29sZS5sb2codGhpcy5hbGxFdmVudHMpXG4gICAgICAoMCwgX3V0aWwuc29ydEV2ZW50cykodGhpcy5hbGxFdmVudHMpO1xuICAgICAgKDAsIF9wYXJzZV9ldmVudHMucGFyc2VNSURJTm90ZXMpKHRoaXMuZXZlbnRzKTtcbiAgICAgIHJldHVybiB0aGlzLmV2ZW50cztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRJbmRleDInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRJbmRleDIobWlsbGlzKSB7XG4gICAgICB0aGlzLmluZGV4MiA9IDA7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0RXZlbnRzMicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50czIobWF4dGltZSwgdGltZVN0YW1wKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLmluZGV4MiwgbWF4aSA9IHRoaXMuYWxsRXZlbnRzLmxlbmd0aDsgaSA8IG1heGk7IGkrKykge1xuXG4gICAgICAgIHZhciBldmVudCA9IHRoaXMuYWxsRXZlbnRzW2ldO1xuXG4gICAgICAgIGlmIChldmVudC50eXBlID09PSBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLlRFTVBPIHx8IGV2ZW50LnR5cGUgPT09IF9jb25zdGFudHMuTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUpIHtcbiAgICAgICAgICBpZiAoZXZlbnQubWlsbGlzIDwgbWF4dGltZSkge1xuICAgICAgICAgICAgdGhpcy5taWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgICAgICAgICAgIHRoaXMuaW5kZXgyKys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgbWlsbGlzID0gZXZlbnQudGlja3MgKiB0aGlzLm1pbGxpc1BlclRpY2s7XG4gICAgICAgICAgaWYgKG1pbGxpcyA8IG1heHRpbWUpIHtcbiAgICAgICAgICAgIGV2ZW50LnRpbWUgPSBtaWxsaXMgKyB0aW1lU3RhbXA7XG4gICAgICAgICAgICBldmVudC5taWxsaXMgPSBtaWxsaXM7XG4gICAgICAgICAgICByZXN1bHQucHVzaChldmVudCk7XG4gICAgICAgICAgICB0aGlzLmluZGV4MisrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWRkRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRzKCkge1xuICAgICAgdmFyIHN0YXJ0QmFyID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAxO1xuXG4gICAgICB2YXIgX2V2ZW50cywgX3BhcnQyO1xuXG4gICAgICB2YXIgZW5kQmFyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB0aGlzLnNvbmcuYmFycztcbiAgICAgIHZhciBpZCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogJ2FkZCc7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0QmFyLCBlbmRCYXIpXG4gICAgICB2YXIgZXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgaWQpO1xuICAgICAgKF9ldmVudHMgPSB0aGlzLmV2ZW50cykucHVzaC5hcHBseShfZXZlbnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoZXZlbnRzKSk7XG4gICAgICAoX3BhcnQyID0gdGhpcy5wYXJ0KS5hZGRFdmVudHMuYXBwbHkoX3BhcnQyLCBfdG9Db25zdW1hYmxlQXJyYXkoZXZlbnRzKSk7XG4gICAgICB0aGlzLmJhcnMgPSBlbmRCYXI7XG4gICAgICAvL2NvbnNvbGUubG9nKCdnZXRFdmVudHMgJU8nLCB0aGlzLmV2ZW50cywgZW5kQmFyKVxuICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjcmVhdGVQcmVjb3VudEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZVByZWNvdW50RXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIHRpbWVTdGFtcCkge1xuXG4gICAgICB0aGlzLnRpbWVTdGFtcCA9IHRpbWVTdGFtcDtcblxuICAgICAgLy8gICBsZXQgc29uZ1N0YXJ0UG9zaXRpb24gPSB0aGlzLnNvbmcuZ2V0UG9zaXRpb24oKVxuXG4gICAgICB2YXIgc29uZ1N0YXJ0UG9zaXRpb24gPSAoMCwgX3Bvc2l0aW9uLmNhbGN1bGF0ZVBvc2l0aW9uKSh0aGlzLnNvbmcsIHtcbiAgICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAgIHRhcmdldDogW3N0YXJ0QmFyXSxcbiAgICAgICAgcmVzdWx0OiAnbWlsbGlzJ1xuICAgICAgfSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdzdGFyQmFyJywgc29uZ1N0YXJ0UG9zaXRpb24uYmFyKVxuXG4gICAgICB2YXIgZW5kUG9zID0gKDAsIF9wb3NpdGlvbi5jYWxjdWxhdGVQb3NpdGlvbikodGhpcy5zb25nLCB7XG4gICAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgICAvL3RhcmdldDogW3NvbmdTdGFydFBvc2l0aW9uLmJhciArIHByZWNvdW50LCBzb25nU3RhcnRQb3NpdGlvbi5iZWF0LCBzb25nU3RhcnRQb3NpdGlvbi5zaXh0ZWVudGgsIHNvbmdTdGFydFBvc2l0aW9uLnRpY2tdLFxuICAgICAgICB0YXJnZXQ6IFtlbmRCYXJdLFxuICAgICAgICByZXN1bHQ6ICdtaWxsaXMnXG4gICAgICB9KTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhzb25nU3RhcnRQb3NpdGlvbiwgZW5kUG9zKVxuXG4gICAgICB0aGlzLnByZWNvdW50SW5kZXggPSAwO1xuICAgICAgdGhpcy5zdGFydE1pbGxpcyA9IHNvbmdTdGFydFBvc2l0aW9uLm1pbGxpcztcbiAgICAgIHRoaXMuZW5kTWlsbGlzID0gZW5kUG9zLm1pbGxpcztcbiAgICAgIHRoaXMucHJlY291bnREdXJhdGlvbiA9IGVuZFBvcy5taWxsaXMgLSB0aGlzLnN0YXJ0TWlsbGlzO1xuXG4gICAgICAvLyBkbyB0aGlzIHNvIHlvdSBjYW4gc3RhcnQgcHJlY291bnRpbmcgYXQgYW55IHBvc2l0aW9uIGluIHRoZSBzb25nXG4gICAgICB0aGlzLnRpbWVTdGFtcCAtPSB0aGlzLnN0YXJ0TWlsbGlzO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMucHJlY291bnREdXJhdGlvbiwgdGhpcy5zdGFydE1pbGxpcywgdGhpcy5lbmRNaWxsaXMpXG5cbiAgICAgIHRoaXMucHJlY291bnRFdmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyIC0gMSwgJ3ByZWNvdW50Jyk7XG4gICAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gKDAsIF9wYXJzZV9ldmVudHMucGFyc2VFdmVudHMpKFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5zb25nLl90aW1lRXZlbnRzKSwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMucHJlY291bnRFdmVudHMpKSk7XG5cbiAgICAgIC8vY29uc29sZS5sb2coc29uZ1N0YXJ0UG9zaXRpb24uYmFyLCBlbmRQb3MuYmFyLCBwcmVjb3VudCwgdGhpcy5wcmVjb3VudEV2ZW50cy5sZW5ndGgpO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnByZWNvdW50RXZlbnRzLmxlbmd0aCwgdGhpcy5wcmVjb3VudER1cmF0aW9uKTtcbiAgICAgIHJldHVybiB0aGlzLnByZWNvdW50RHVyYXRpb247XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0UHJlY291bnRJbmRleCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFByZWNvdW50SW5kZXgobWlsbGlzKSB7XG4gICAgICB2YXIgaSA9IDA7XG4gICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gdGhpcy5ldmVudHNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgICAgdmFyIGV2ZW50ID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgICAgICBpZiAoZXZlbnQubWlsbGlzID49IG1pbGxpcykge1xuICAgICAgICAgICAgdGhpcy5wcmVjb3VudEluZGV4ID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnByZWNvdW50SW5kZXgpO1xuICAgIH1cblxuICAgIC8vIGNhbGxlZCBieSBzY2hlZHVsZXIuanNcblxuICB9LCB7XG4gICAga2V5OiAnZ2V0UHJlY291bnRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQcmVjb3VudEV2ZW50cyhtYXh0aW1lKSB7XG4gICAgICB2YXIgZXZlbnRzID0gdGhpcy5wcmVjb3VudEV2ZW50cyxcbiAgICAgICAgICBtYXhpID0gZXZlbnRzLmxlbmd0aCxcbiAgICAgICAgICBpID0gdm9pZCAwLFxuICAgICAgICAgIGV2dCA9IHZvaWQgMCxcbiAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgLy9tYXh0aW1lICs9IHRoaXMucHJlY291bnREdXJhdGlvblxuXG4gICAgICBmb3IgKGkgPSB0aGlzLnByZWNvdW50SW5kZXg7IGkgPCBtYXhpOyBpKyspIHtcbiAgICAgICAgZXZ0ID0gZXZlbnRzW2ldO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgbWF4dGltZSwgdGhpcy5taWxsaXMpO1xuICAgICAgICBpZiAoZXZ0Lm1pbGxpcyA8IG1heHRpbWUpIHtcbiAgICAgICAgICBldnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZ0Lm1pbGxpcztcbiAgICAgICAgICByZXN1bHQucHVzaChldnQpO1xuICAgICAgICAgIHRoaXMucHJlY291bnRJbmRleCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKHJlc3VsdC5sZW5ndGgpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtdXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbXV0ZShmbGFnKSB7XG4gICAgICB0aGlzLnRyYWNrLm11dGVkID0gZmxhZztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhbGxOb3Rlc09mZicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFsbE5vdGVzT2ZmKCkge1xuICAgICAgdGhpcy50cmFjay5faW5zdHJ1bWVudC5hbGxOb3Rlc09mZigpO1xuICAgIH1cblxuICAgIC8vID09PT09PT09PT09IENPTkZJR1VSQVRJT04gPT09PT09PT09PT1cblxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlQ29uZmlnJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlQ29uZmlnKCkge1xuICAgICAgdGhpcy5pbml0KDEsIHRoaXMuYmFycywgJ3VwZGF0ZScpO1xuICAgICAgdGhpcy5hbGxOb3Rlc09mZigpO1xuICAgICAgdGhpcy5zb25nLnVwZGF0ZSgpO1xuICAgIH1cblxuICAgIC8vIGFkZGVkIHRvIHB1YmxpYyBBUEk6IFNvbmcuY29uZmlndXJlTWV0cm9ub21lKHt9KVxuXG4gIH0sIHtcbiAgICBrZXk6ICdjb25maWd1cmUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb25maWd1cmUoY29uZmlnKSB7XG5cbiAgICAgIE9iamVjdC5rZXlzKGNvbmZpZykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHRoaXNbbWV0aG9kTWFwLmdldChrZXkpXShjb25maWcua2V5KTtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEluc3RydW1lbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRJbnN0cnVtZW50KGluc3RydW1lbnQpIHtcbiAgICAgIGlmICghaW5zdHJ1bWVudCBpbnN0YW5jZW9mIEluc3RydW1lbnQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdub3QgYW4gaW5zdGFuY2Ugb2YgSW5zdHJ1bWVudCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnRyYWNrLnNldEluc3RydW1lbnQoaW5zdHJ1bWVudCk7XG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldE5vdGVMZW5ndGhBY2NlbnRlZFRpY2snLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXROb3RlTGVuZ3RoQWNjZW50ZWRUaWNrKHZhbHVlKSB7XG4gICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubm90ZUxlbmd0aEFjY2VudGVkID0gdmFsdWU7XG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldE5vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXROb3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrKHZhbHVlKSB7XG4gICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFZlbG9jaXR5QWNjZW50ZWRUaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VmVsb2NpdHlBY2NlbnRlZFRpY2sodmFsdWUpIHtcbiAgICAgIHZhbHVlID0gKDAsIF91dGlsLmNoZWNrTUlESU51bWJlcikodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSBmYWxzZSkge1xuICAgICAgICB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0VmVsb2NpdHlOb25BY2NlbnRlZFRpY2snLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljayh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSAoMCwgX3V0aWwuY2hlY2tNSURJTnVtYmVyKSh2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgIT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMudmVsb2NpdHlOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXROb3RlTnVtYmVyQWNjZW50ZWRUaWNrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Tm90ZU51bWJlckFjY2VudGVkVGljayh2YWx1ZSkge1xuICAgICAgdmFsdWUgPSAoMCwgX3V0aWwuY2hlY2tNSURJTnVtYmVyKSh2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgIT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMubm90ZU51bWJlckFjY2VudGVkID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldE5vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2snLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXROb3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9ICgwLCBfdXRpbC5jaGVja01JRElOdW1iZXIpKHZhbHVlKTtcbiAgICAgIGlmICh2YWx1ZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0Vm9sdW1lJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Vm9sdW1lKHZhbHVlKSB7XG4gICAgICB0aGlzLnRyYWNrLnNldFZvbHVtZSh2YWx1ZSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1ldHJvbm9tZTtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLk1JRElFdmVudCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLy8gQCBmbG93XG5cblxudmFyIF9ub3RlID0gcmVxdWlyZSgnLi9ub3RlJyk7XG5cbnZhciBfc2V0dGluZ3MgPSByZXF1aXJlKCcuL3NldHRpbmdzJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBpbnN0YW5jZUluZGV4ID0gMDtcblxudmFyIE1JRElFdmVudCA9IGV4cG9ydHMuTUlESUV2ZW50ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNSURJRXZlbnQodGlja3MsIHR5cGUsIGRhdGExKSB7XG4gICAgdmFyIGRhdGEyID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAtMTtcbiAgICB2YXIgY2hhbm5lbCA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogMDtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJRXZlbnQpO1xuXG4gICAgdGhpcy5pZCA9IHRoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMudGlja3MgPSB0aWNrcztcbiAgICB0aGlzLmRhdGExID0gZGF0YTE7XG4gICAgdGhpcy5kYXRhMiA9IGRhdGEyO1xuICAgIHRoaXMucGl0Y2ggPSAoMCwgX3NldHRpbmdzLmdldFNldHRpbmdzKSgpLnBpdGNoO1xuXG4gICAgLyogdGVzdCB3aGV0aGVyIHR5cGUgaXMgYSBzdGF0dXMgYnl0ZSBvciBhIGNvbW1hbmQ6ICovXG5cbiAgICAvLyAxLiB0aGUgaGlnaGVyIDQgYml0cyBvZiB0aGUgc3RhdHVzIGJ5dGUgZm9ybSB0aGUgY29tbWFuZFxuICAgIHRoaXMudHlwZSA9ICh0eXBlID4+IDQpICogMTY7XG4gICAgLy90aGlzLnR5cGUgPSB0aGlzLmNvbW1hbmQgPSAodHlwZSA+PiA0KSAqIDE2XG5cbiAgICAvLyAyLiBmaWx0ZXIgY2hhbm5lbCBldmVudHNcbiAgICBpZiAodGhpcy50eXBlID49IDB4ODAgJiYgdGhpcy50eXBlIDw9IDB4RTApIHtcbiAgICAgIC8vIDMuIGdldCB0aGUgY2hhbm5lbCBudW1iZXJcbiAgICAgIGlmIChjaGFubmVsID4gMCkge1xuICAgICAgICAvLyBhIGNoYW5uZWwgaXMgc2V0LCB0aGlzIG92ZXJydWxlcyB0aGUgY2hhbm5lbCBudW1iZXIgaW4gdGhlIHN0YXR1cyBieXRlXG4gICAgICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBleHRyYWN0IHRoZSBjaGFubmVsIGZyb20gdGhlIHN0YXR1cyBieXRlOiB0aGUgbG93ZXIgNCBiaXRzIG9mIHRoZSBzdGF0dXMgYnl0ZSBmb3JtIHRoZSBjaGFubmVsIG51bWJlclxuICAgICAgICB0aGlzLmNoYW5uZWwgPSB0eXBlICYgMHhGO1xuICAgICAgfVxuICAgICAgLy90aGlzLnN0YXR1cyA9IHRoaXMuY29tbWFuZCArIHRoaXMuY2hhbm5lbFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyA0LiBub3QgYSBjaGFubmVsIGV2ZW50LCBzZXQgdGhlIHR5cGUgYW5kIGNvbW1hbmQgdG8gdGhlIHZhbHVlIG9mIHR5cGUgYXMgcHJvdmlkZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgLy90aGlzLnR5cGUgPSB0aGlzLmNvbW1hbmQgPSB0eXBlXG4gICAgICB0aGlzLmNoYW5uZWwgPSAwOyAvLyBhbnlcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLCB0aGlzLnR5cGUsIHRoaXMuY29tbWFuZCwgdGhpcy5zdGF0dXMsIHRoaXMuY2hhbm5lbCwgdGhpcy5pZClcblxuICAgIC8vIHNvbWV0aW1lcyBOT1RFX09GRiBldmVudHMgYXJlIHNlbnQgYXMgTk9URV9PTiBldmVudHMgd2l0aCBhIDAgdmVsb2NpdHkgdmFsdWVcbiAgICBpZiAodHlwZSA9PT0gMTQ0ICYmIGRhdGEyID09PSAwKSB7XG4gICAgICB0aGlzLnR5cGUgPSAxMjg7XG4gICAgfVxuXG4gICAgdGhpcy5fcGFydCA9IG51bGw7XG4gICAgdGhpcy5fdHJhY2sgPSBudWxsO1xuICAgIHRoaXMuX3NvbmcgPSBudWxsO1xuXG4gICAgaWYgKHR5cGUgPT09IDE0NCB8fCB0eXBlID09PSAxMjgpIHtcbiAgICAgIHZhciBfZ2V0Tm90ZURhdGEgPSAoMCwgX25vdGUuZ2V0Tm90ZURhdGEpKHsgbnVtYmVyOiBkYXRhMSB9KTtcblxuICAgICAgdGhpcy5ub3RlTmFtZSA9IF9nZXROb3RlRGF0YS5uYW1lO1xuICAgICAgdGhpcy5mdWxsTm90ZU5hbWUgPSBfZ2V0Tm90ZURhdGEuZnVsbE5hbWU7XG4gICAgICB0aGlzLmZyZXF1ZW5jeSA9IF9nZXROb3RlRGF0YS5mcmVxdWVuY3k7XG4gICAgICB0aGlzLm9jdGF2ZSA9IF9nZXROb3RlRGF0YS5vY3RhdmU7XG4gICAgfVxuICAgIC8vQFRPRE86IGFkZCBhbGwgb3RoZXIgcHJvcGVydGllc1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElFdmVudCwgW3tcbiAgICBrZXk6ICdjb3B5JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29weSgpIHtcbiAgICAgIHZhciBtID0gbmV3IE1JRElFdmVudCh0aGlzLnRpY2tzLCB0aGlzLnR5cGUsIHRoaXMuZGF0YTEsIHRoaXMuZGF0YTIpO1xuICAgICAgcmV0dXJuIG07XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndHJhbnNwb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdHJhbnNwb3NlKGFtb3VudCkge1xuICAgICAgLy8gbWF5IGJlIGJldHRlciBpZiBub3QgYSBwdWJsaWMgbWV0aG9kP1xuICAgICAgdGhpcy5kYXRhMSArPSBhbW91bnQ7XG4gICAgICB0aGlzLmZyZXF1ZW5jeSA9IHRoaXMucGl0Y2ggKiBNYXRoLnBvdygyLCAodGhpcy5kYXRhMSAtIDY5KSAvIDEyKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGVQaXRjaCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVBpdGNoKG5ld1BpdGNoKSB7XG4gICAgICBpZiAobmV3UGl0Y2ggPT09IHRoaXMucGl0Y2gpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5waXRjaCA9IG5ld1BpdGNoO1xuICAgICAgdGhpcy50cmFuc3Bvc2UoMCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmUodGlja3MpIHtcbiAgICAgIHRoaXMudGlja3MgKz0gdGlja3M7XG4gICAgICBpZiAodGhpcy5taWRpTm90ZSkge1xuICAgICAgICB0aGlzLm1pZGlOb3RlLnVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVUbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVUbyh0aWNrcykge1xuICAgICAgdGhpcy50aWNrcyA9IHRpY2tzO1xuICAgICAgaWYgKHRoaXMubWlkaU5vdGUpIHtcbiAgICAgICAgdGhpcy5taWRpTm90ZS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTUlESUV2ZW50O1xufSgpO1xuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZU1JRElFdmVudChldmVudCl7XG4gIC8vZXZlbnQubm90ZSA9IG51bGxcbiAgZXZlbnQubm90ZSA9IG51bGxcbiAgZXZlbnQgPSBudWxsXG59XG4qLyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuTUlESU5vdGUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfbWlkaV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaV9ldmVudCcpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG5cbnZhciBNSURJTm90ZSA9IGV4cG9ydHMuTUlESU5vdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1JRElOb3RlKG5vdGVvbiwgbm90ZW9mZikge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJTm90ZSk7XG5cbiAgICAvL2lmKG5vdGVvbi50eXBlICE9PSAxNDQgfHwgbm90ZW9mZi50eXBlICE9PSAxMjgpe1xuICAgIGlmIChub3Rlb24udHlwZSAhPT0gMTQ0KSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2Nhbm5vdCBjcmVhdGUgTUlESU5vdGUnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5pZCA9IHRoaXMuY29uc3RydWN0b3IubmFtZSArICdfJyArIGluc3RhbmNlSW5kZXgrKyArICdfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMubm90ZU9uID0gbm90ZW9uO1xuICAgIG5vdGVvbi5taWRpTm90ZSA9IHRoaXM7XG4gICAgbm90ZW9uLm1pZGlOb3RlSWQgPSB0aGlzLmlkO1xuXG4gICAgaWYgKG5vdGVvZmYgaW5zdGFuY2VvZiBfbWlkaV9ldmVudC5NSURJRXZlbnQpIHtcbiAgICAgIHRoaXMubm90ZU9mZiA9IG5vdGVvZmY7XG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlID0gdGhpcztcbiAgICAgIG5vdGVvZmYubWlkaU5vdGVJZCA9IHRoaXMuaWQ7XG4gICAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSBub3Rlb2ZmLnRpY2tzIC0gbm90ZW9uLnRpY2tzO1xuICAgICAgdGhpcy5kdXJhdGlvbk1pbGxpcyA9IC0xO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhNSURJTm90ZSwgW3tcbiAgICBrZXk6ICdhZGROb3RlT2ZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkTm90ZU9mZihub3Rlb2ZmKSB7XG4gICAgICB0aGlzLm5vdGVPZmYgPSBub3Rlb2ZmO1xuICAgICAgbm90ZW9mZi5taWRpTm90ZSA9IHRoaXM7XG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlSWQgPSB0aGlzLmlkO1xuICAgICAgdGhpcy5kdXJhdGlvblRpY2tzID0gbm90ZW9mZi50aWNrcyAtIHRoaXMubm90ZU9uLnRpY2tzO1xuICAgICAgdGhpcy5kdXJhdGlvbk1pbGxpcyA9IC0xO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvcHknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb3B5KCkge1xuICAgICAgcmV0dXJuIG5ldyBNSURJTm90ZSh0aGlzLm5vdGVPbi5jb3B5KCksIHRoaXMubm90ZU9mZi5jb3B5KCkpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIC8vIG1heSB1c2UgYW5vdGhlciBuYW1lIGZvciB0aGlzIG1ldGhvZFxuICAgICAgdGhpcy5kdXJhdGlvblRpY2tzID0gdGhpcy5ub3RlT2ZmLnRpY2tzIC0gdGhpcy5ub3RlT24udGlja3M7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndHJhbnNwb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdHJhbnNwb3NlKGFtb3VudCkge1xuICAgICAgdGhpcy5ub3RlT24udHJhbnNwb3NlKGFtb3VudCk7XG4gICAgICB0aGlzLm5vdGVPZmYudHJhbnNwb3NlKGFtb3VudCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmUodGlja3MpIHtcbiAgICAgIHRoaXMubm90ZU9uLm1vdmUodGlja3MpO1xuICAgICAgdGhpcy5ub3RlT2ZmLm1vdmUodGlja3MpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVUbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVUbyh0aWNrcykge1xuICAgICAgdGhpcy5ub3RlT24ubW92ZVRvKHRpY2tzKTtcbiAgICAgIHRoaXMubm90ZU9mZi5tb3ZlVG8odGlja3MpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VucmVnaXN0ZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1bnJlZ2lzdGVyKCkge1xuICAgICAgaWYgKHRoaXMucGFydCkge1xuICAgICAgICB0aGlzLnBhcnQucmVtb3ZlRXZlbnRzKHRoaXMpO1xuICAgICAgICB0aGlzLnBhcnQgPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMudHJhY2spIHtcbiAgICAgICAgdGhpcy50cmFjay5yZW1vdmVFdmVudHModGhpcyk7XG4gICAgICAgIHRoaXMudHJhY2sgPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc29uZykge1xuICAgICAgICB0aGlzLnNvbmcucmVtb3ZlRXZlbnRzKHRoaXMpO1xuICAgICAgICB0aGlzLnNvbmcgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNSURJTm90ZTtcbn0oKTsiLCIvKlxuICBXcmFwcGVyIGZvciBhY2Nlc3NpbmcgYnl0ZXMgdGhyb3VnaCBzZXF1ZW50aWFsIHJlYWRzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4gIGFkYXB0ZWQgdG8gd29yayB3aXRoIEFycmF5QnVmZmVyIC0+IFVpbnQ4QXJyYXlcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIGZjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbnZhciBNSURJU3RyZWFtID0gZnVuY3Rpb24gKCkge1xuXG4gIC8vIGJ1ZmZlciBpcyBVaW50OEFycmF5XG4gIGZ1bmN0aW9uIE1JRElTdHJlYW0oYnVmZmVyKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1JRElTdHJlYW0pO1xuXG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICAvKiByZWFkIHN0cmluZyBvciBhbnkgbnVtYmVyIG9mIGJ5dGVzICovXG5cblxuICBfY3JlYXRlQ2xhc3MoTUlESVN0cmVhbSwgW3tcbiAgICBrZXk6ICdyZWFkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVhZChsZW5ndGgpIHtcbiAgICAgIHZhciB0b1N0cmluZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogdHJ1ZTtcblxuICAgICAgdmFyIHJlc3VsdCA9IHZvaWQgMDtcblxuICAgICAgaWYgKHRvU3RyaW5nKSB7XG4gICAgICAgIHJlc3VsdCA9ICcnO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspIHtcbiAgICAgICAgICByZXN1bHQgKz0gZmNjKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsZW5ndGg7IF9pKyssIHRoaXMucG9zaXRpb24rKykge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qIHJlYWQgYSBiaWctZW5kaWFuIDMyLWJpdCBpbnRlZ2VyICovXG5cbiAgfSwge1xuICAgIGtleTogJ3JlYWRJbnQzMicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRJbnQzMigpIHtcbiAgICAgIHZhciByZXN1bHQgPSAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgMjQpICsgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXSA8PCAxNikgKyAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDJdIDw8IDgpICsgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDNdO1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSA0O1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiByZWFkIGEgYmlnLWVuZGlhbiAxNi1iaXQgaW50ZWdlciAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdyZWFkSW50MTYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZWFkSW50MTYoKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDgpICsgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdO1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKiByZWFkIGFuIDgtYml0IGludGVnZXIgKi9cblxuICB9LCB7XG4gICAga2V5OiAncmVhZEludDgnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZWFkSW50OChzaWduZWQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXTtcbiAgICAgIGlmIChzaWduZWQgJiYgcmVzdWx0ID4gMTI3KSB7XG4gICAgICAgIHJlc3VsdCAtPSAyNTY7XG4gICAgICB9XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDE7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2VvZicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGVvZigpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uID49IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvKiByZWFkIGEgTUlESS1zdHlsZSBsZXRpYWJsZS1sZW5ndGggaW50ZWdlclxuICAgICAgKGJpZy1lbmRpYW4gdmFsdWUgaW4gZ3JvdXBzIG9mIDcgYml0cyxcbiAgICAgIHdpdGggdG9wIGJpdCBzZXQgdG8gc2lnbmlmeSB0aGF0IGFub3RoZXIgYnl0ZSBmb2xsb3dzKVxuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3JlYWRWYXJJbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZWFkVmFySW50KCkge1xuICAgICAgdmFyIHJlc3VsdCA9IDA7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgYiA9IHRoaXMucmVhZEludDgoKTtcbiAgICAgICAgaWYgKGIgJiAweDgwKSB7XG4gICAgICAgICAgcmVzdWx0ICs9IGIgJiAweDdmO1xuICAgICAgICAgIHJlc3VsdCA8PD0gNztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvKiBiIGlzIHRoZSBsYXN0IGJ5dGUgKi9cbiAgICAgICAgICByZXR1cm4gcmVzdWx0ICsgYjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3Jlc2V0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRQb3NpdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFBvc2l0aW9uKHApIHtcbiAgICAgIHRoaXMucG9zaXRpb24gPSBwO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNSURJU3RyZWFtO1xufSgpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBNSURJU3RyZWFtOyIsIi8qXG4gIEV4dHJhY3RzIGFsbCBtaWRpIGV2ZW50cyBmcm9tIGEgYmluYXJ5IG1pZGkgZmlsZSwgdXNlcyBtaWRpX3N0cmVhbS5qc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5wYXJzZU1JRElGaWxlID0gcGFyc2VNSURJRmlsZTtcblxudmFyIF9taWRpX3N0cmVhbSA9IHJlcXVpcmUoJy4vbWlkaV9zdHJlYW0nKTtcblxudmFyIF9taWRpX3N0cmVhbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taWRpX3N0cmVhbSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBsYXN0RXZlbnRUeXBlQnl0ZSA9IHZvaWQgMCxcbiAgICB0cmFja05hbWUgPSB2b2lkIDA7XG5cbmZ1bmN0aW9uIHJlYWRDaHVuayhzdHJlYW0pIHtcbiAgdmFyIGlkID0gc3RyZWFtLnJlYWQoNCwgdHJ1ZSk7XG4gIHZhciBsZW5ndGggPSBzdHJlYW0ucmVhZEludDMyKCk7XG4gIC8vY29uc29sZS5sb2cobGVuZ3RoKTtcbiAgcmV0dXJuIHtcbiAgICAnaWQnOiBpZCxcbiAgICAnbGVuZ3RoJzogbGVuZ3RoLFxuICAgICdkYXRhJzogc3RyZWFtLnJlYWQobGVuZ3RoLCBmYWxzZSlcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVhZEV2ZW50KHN0cmVhbSkge1xuICB2YXIgZXZlbnQgPSB7fTtcbiAgdmFyIGxlbmd0aDtcbiAgZXZlbnQuZGVsdGFUaW1lID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgdmFyIGV2ZW50VHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgLy9jb25zb2xlLmxvZyhldmVudFR5cGVCeXRlLCBldmVudFR5cGVCeXRlICYgMHg4MCwgMTQ2ICYgMHgwZik7XG4gIGlmICgoZXZlbnRUeXBlQnl0ZSAmIDB4ZjApID09IDB4ZjApIHtcbiAgICAvKiBzeXN0ZW0gLyBtZXRhIGV2ZW50ICovXG4gICAgaWYgKGV2ZW50VHlwZUJ5dGUgPT0gMHhmZikge1xuICAgICAgLyogbWV0YSBldmVudCAqL1xuICAgICAgZXZlbnQudHlwZSA9ICdtZXRhJztcbiAgICAgIHZhciBzdWJ0eXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIHN3aXRjaCAoc3VidHlwZUJ5dGUpIHtcbiAgICAgICAgY2FzZSAweDAwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VOdW1iZXInO1xuICAgICAgICAgIGlmIChsZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNlcXVlbmNlTnVtYmVyIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1iZXIgPSBzdHJlYW0ucmVhZEludDE2KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvcHlyaWdodE5vdGljZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDM6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0cmFja05hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdpbnN0cnVtZW50TmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDU6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdseXJpY3MnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA2OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWFya2VyJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2N1ZVBvaW50JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21pZGlDaGFubmVsUHJlZml4JztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBtaWRpQ2hhbm5lbFByZWZpeCBldmVudCBpcyAxLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQuY2hhbm5lbCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDJmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnZW5kT2ZUcmFjayc7XG4gICAgICAgICAgaWYgKGxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgZW5kT2ZUcmFjayBldmVudCBpcyAwLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXRUZW1wbyc7XG4gICAgICAgICAgaWYgKGxlbmd0aCAhPT0gMykge1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2V0VGVtcG8gZXZlbnQgaXMgMywgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQgPSAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgMTYpICsgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDgpICsgc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzbXB0ZU9mZnNldCc7XG4gICAgICAgICAgaWYgKGxlbmd0aCAhPT0gNSkge1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc21wdGVPZmZzZXQgZXZlbnQgaXMgNSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBob3VyQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lUmF0ZSA9IHtcbiAgICAgICAgICAgIDB4MDA6IDI0LCAweDIwOiAyNSwgMHg0MDogMjksIDB4NjA6IDMwXG4gICAgICAgICAgfVtob3VyQnl0ZSAmIDB4NjBdO1xuICAgICAgICAgIGV2ZW50LmhvdXIgPSBob3VyQnl0ZSAmIDB4MWY7XG4gICAgICAgICAgZXZlbnQubWluID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc2VjID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zdWJmcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU4OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGltZVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYgKGxlbmd0aCAhPT0gNCkge1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgdGltZVNpZ25hdHVyZSBldmVudCBpcyA0LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtZXJhdG9yID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZGVub21pbmF0b3IgPSBNYXRoLnBvdygyLCBzdHJlYW0ucmVhZEludDgoKSk7XG4gICAgICAgICAgZXZlbnQubWV0cm9ub21lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQudGhpcnR5c2Vjb25kcyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU5OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAna2V5U2lnbmF0dXJlJztcbiAgICAgICAgICBpZiAobGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBrZXlTaWduYXR1cmUgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmtleSA9IHN0cmVhbS5yZWFkSW50OCh0cnVlKTtcbiAgICAgICAgICBldmVudC5zY2FsZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDdmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VyU3BlY2lmaWMnO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvL2lmKHNlcXVlbmNlci5kZWJ1ZyA+PSAyKXtcbiAgICAgICAgICAvLyAgICBjb25zb2xlLndhcm4oJ1VucmVjb2duaXNlZCBtZXRhIGV2ZW50IHN1YnR5cGU6ICcgKyBzdWJ0eXBlQnl0ZSk7XG4gICAgICAgICAgLy99XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICB9XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9IGVsc2UgaWYgKGV2ZW50VHlwZUJ5dGUgPT0gMHhmMCkge1xuICAgICAgZXZlbnQudHlwZSA9ICdzeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfSBlbHNlIGlmIChldmVudFR5cGVCeXRlID09IDB4ZjcpIHtcbiAgICAgIGV2ZW50LnR5cGUgPSAnZGl2aWRlZFN5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogJyArIGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8qIGNoYW5uZWwgZXZlbnQgKi9cbiAgICB2YXIgcGFyYW0xID0gdm9pZCAwO1xuICAgIGlmICgoZXZlbnRUeXBlQnl0ZSAmIDB4ODApID09PSAwKSB7XG4gICAgICAvKiBydW5uaW5nIHN0YXR1cyAtIHJldXNlIGxhc3RFdmVudFR5cGVCeXRlIGFzIHRoZSBldmVudCB0eXBlLlxuICAgICAgICBldmVudFR5cGVCeXRlIGlzIGFjdHVhbGx5IHRoZSBmaXJzdCBwYXJhbWV0ZXJcbiAgICAgICovXG4gICAgICAvL2NvbnNvbGUubG9nKCdydW5uaW5nIHN0YXR1cycpO1xuICAgICAgcGFyYW0xID0gZXZlbnRUeXBlQnl0ZTtcbiAgICAgIGV2ZW50VHlwZUJ5dGUgPSBsYXN0RXZlbnRUeXBlQnl0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyYW0xID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdsYXN0JywgZXZlbnRUeXBlQnl0ZSk7XG4gICAgICBsYXN0RXZlbnRUeXBlQnl0ZSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICAgIHZhciBldmVudFR5cGUgPSBldmVudFR5cGVCeXRlID4+IDQ7XG4gICAgZXZlbnQuY2hhbm5lbCA9IGV2ZW50VHlwZUJ5dGUgJiAweDBmO1xuICAgIGV2ZW50LnR5cGUgPSAnY2hhbm5lbCc7XG4gICAgc3dpdGNoIChldmVudFR5cGUpIHtcbiAgICAgIGNhc2UgMHgwODpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT2ZmJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDA5OlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBpZiAoZXZlbnQudmVsb2NpdHkgPT09IDApIHtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdub3RlT24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGE6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZUFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC5hbW91bnQgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBiOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvbnRyb2xsZXInO1xuICAgICAgICBldmVudC5jb250cm9sbGVyVHlwZSA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBjOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Byb2dyYW1DaGFuZ2UnO1xuICAgICAgICBldmVudC5wcm9ncmFtTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGQ6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY2hhbm5lbEFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5hbW91bnQgPSBwYXJhbTE7XG4gICAgICAgIC8vaWYodHJhY2tOYW1lID09PSAnU0gtUzEtNDQtQzA5IEw9U01MIElOPTMnKXtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ2NoYW5uZWwgcHJlc3N1cmUnLCB0cmFja05hbWUsIHBhcmFtMSk7XG4gICAgICAgIC8vfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGU6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncGl0Y2hCZW5kJztcbiAgICAgICAgZXZlbnQudmFsdWUgPSBwYXJhbTEgKyAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgNyk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8qXG4gICAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlO1xuICAgICAgICBjb25zb2xlLmxvZygnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZSk7XG4gICAgICAgICovXG5cbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIC8qXG4gICAgICAgICAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2VpcmRvJywgdHJhY2tOYW1lLCBwYXJhbTEsIGV2ZW50LnZlbG9jaXR5KTtcbiAgICAgICAgKi9cblxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlTUlESUZpbGUoYnVmZmVyKSB7XG4gIGlmIChidWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5ID09PSBmYWxzZSAmJiBidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gZmFsc2UpIHtcbiAgICBjb25zb2xlLmVycm9yKCdidWZmZXIgc2hvdWxkIGJlIGFuIGluc3RhbmNlIG9mIFVpbnQ4QXJyYXkgb2YgQXJyYXlCdWZmZXInKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgfVxuICB2YXIgdHJhY2tzID0gbmV3IE1hcCgpO1xuICB2YXIgc3RyZWFtID0gbmV3IF9taWRpX3N0cmVhbTIuZGVmYXVsdChidWZmZXIpO1xuXG4gIHZhciBoZWFkZXJDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICBpZiAoaGVhZGVyQ2h1bmsuaWQgIT09ICdNVGhkJyB8fCBoZWFkZXJDaHVuay5sZW5ndGggIT09IDYpIHtcbiAgICB0aHJvdyAnQmFkIC5taWQgZmlsZSAtIGhlYWRlciBub3QgZm91bmQnO1xuICB9XG5cbiAgdmFyIGhlYWRlclN0cmVhbSA9IG5ldyBfbWlkaV9zdHJlYW0yLmRlZmF1bHQoaGVhZGVyQ2h1bmsuZGF0YSk7XG4gIHZhciBmb3JtYXRUeXBlID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICB2YXIgdHJhY2tDb3VudCA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgdmFyIHRpbWVEaXZpc2lvbiA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcblxuICBpZiAodGltZURpdmlzaW9uICYgMHg4MDAwKSB7XG4gICAgdGhyb3cgJ0V4cHJlc3NpbmcgdGltZSBkaXZpc2lvbiBpbiBTTVRQRSBmcmFtZXMgaXMgbm90IHN1cHBvcnRlZCB5ZXQnO1xuICB9XG5cbiAgdmFyIGhlYWRlciA9IHtcbiAgICAnZm9ybWF0VHlwZSc6IGZvcm1hdFR5cGUsXG4gICAgJ3RyYWNrQ291bnQnOiB0cmFja0NvdW50LFxuICAgICd0aWNrc1BlckJlYXQnOiB0aW1lRGl2aXNpb25cbiAgfTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYWNrQ291bnQ7IGkrKykge1xuICAgIHRyYWNrTmFtZSA9ICd0cmFja18nICsgaTtcbiAgICB2YXIgdHJhY2sgPSBbXTtcbiAgICB2YXIgdHJhY2tDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICAgIGlmICh0cmFja0NodW5rLmlkICE9PSAnTVRyaycpIHtcbiAgICAgIHRocm93ICdVbmV4cGVjdGVkIGNodW5rIC0gZXhwZWN0ZWQgTVRyaywgZ290ICcgKyB0cmFja0NodW5rLmlkO1xuICAgIH1cbiAgICB2YXIgdHJhY2tTdHJlYW0gPSBuZXcgX21pZGlfc3RyZWFtMi5kZWZhdWx0KHRyYWNrQ2h1bmsuZGF0YSk7XG4gICAgd2hpbGUgKCF0cmFja1N0cmVhbS5lb2YoKSkge1xuICAgICAgdmFyIGV2ZW50ID0gcmVhZEV2ZW50KHRyYWNrU3RyZWFtKTtcbiAgICAgIHRyYWNrLnB1c2goZXZlbnQpO1xuICAgIH1cbiAgICB0cmFja3Muc2V0KHRyYWNrTmFtZSwgdHJhY2spO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAnaGVhZGVyJzogaGVhZGVyLFxuICAgICd0cmFja3MnOiB0cmFja3NcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdldE5vdGVEYXRhID0gZ2V0Tm90ZURhdGE7XG5cbnZhciBfc2V0dGluZ3MgPSByZXF1aXJlKCcuL3NldHRpbmdzJyk7XG5cbnZhciBwb3cgPSBNYXRoLnBvdztcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG4vL2NvbnN0IGNoZWNrTm90ZU5hbWUgPSAvXltBLUddezF9KGJ7MCwyfX18I3swLDJ9KVtcXC1dezAsMX1bMC05XXsxfSQvXG52YXIgcmVnZXhDaGVja05vdGVOYW1lID0gL15bQS1HXXsxfShifGJifCN8IyMpezAsMX0kLztcbnZhciByZWdleENoZWNrRnVsbE5vdGVOYW1lID0gL15bQS1HXXsxfShifGJifCN8IyMpezAsMX0oXFwtMXxbMC05XXsxfSkkLztcbnZhciByZWdleFNwbGl0RnVsbE5hbWUgPSAvXihbQS1HXXsxfShifGJifCN8IyMpezAsMX0pKFxcLTF8WzAtOV17MX0pJC87XG52YXIgcmVnZXhHZXRPY3RhdmUgPSAvKFxcLTF8WzAtOV17MX0pJC87XG5cbnZhciBub3RlTmFtZXMgPSB7XG4gIHNoYXJwOiBbJ0MnLCAnQyMnLCAnRCcsICdEIycsICdFJywgJ0YnLCAnRiMnLCAnRycsICdHIycsICdBJywgJ0EjJywgJ0InXSxcbiAgZmxhdDogWydDJywgJ0RiJywgJ0QnLCAnRWInLCAnRScsICdGJywgJ0diJywgJ0cnLCAnQWInLCAnQScsICdCYicsICdCJ10sXG4gICdlbmhhcm1vbmljLXNoYXJwJzogWydCIycsICdDIycsICdDIyMnLCAnRCMnLCAnRCMjJywgJ0UjJywgJ0YjJywgJ0YjIycsICdHIycsICdHIyMnLCAnQSMnLCAnQSMjJ10sXG4gICdlbmhhcm1vbmljLWZsYXQnOiBbJ0RiYicsICdEYicsICdFYmInLCAnRWInLCAnRmInLCAnR2JiJywgJ0diJywgJ0FiYicsICdBYicsICdCYmInLCAnQmInLCAnQ2InXVxufTtcblxudmFyIG5vdGVOYW1lTW9kZSA9IHZvaWQgMDtcbnZhciBwaXRjaCA9IHZvaWQgMDtcblxuLypcbiAgc2V0dGluZ3MgPSB7XG4gICAgbmFtZTogJ0MnLFxuICAgIG9jdGF2ZTogNCxcbiAgICBmdWxsTmFtZTogJ0M0JyxcbiAgICBudW1iZXI6IDYwLFxuICAgIGZyZXF1ZW5jeTogMjM0LjE2IC8vIG5vdCB5ZXQgaW1wbGVtZW50ZWRcbiAgfVxuKi9cbmZ1bmN0aW9uIGdldE5vdGVEYXRhKHNldHRpbmdzKSB7XG4gIHZhciBmdWxsTmFtZSA9IHNldHRpbmdzLmZ1bGxOYW1lLFxuICAgICAgbmFtZSA9IHNldHRpbmdzLm5hbWUsXG4gICAgICBvY3RhdmUgPSBzZXR0aW5ncy5vY3RhdmUsXG4gICAgICBtb2RlID0gc2V0dGluZ3MubW9kZSxcbiAgICAgIG51bWJlciA9IHNldHRpbmdzLm51bWJlcixcbiAgICAgIGZyZXF1ZW5jeSA9IHNldHRpbmdzLmZyZXF1ZW5jeTtcblxuICB2YXIgX2dldFNldHRpbmdzID0gKDAsIF9zZXR0aW5ncy5nZXRTZXR0aW5ncykoKTtcblxuICBub3RlTmFtZU1vZGUgPSBfZ2V0U2V0dGluZ3Mubm90ZU5hbWVNb2RlO1xuICBwaXRjaCA9IF9nZXRTZXR0aW5ncy5waXRjaDtcblxuXG4gIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycgJiYgdHlwZW9mIGZ1bGxOYW1lICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgbnVtYmVyICE9PSAnbnVtYmVyJyAmJiB0eXBlb2YgZnJlcXVlbmN5ICE9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKG51bWJlciA8IDAgfHwgbnVtYmVyID4gMTI3KSB7XG4gICAgY29uc29sZS5sb2coJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBiZXR3ZWVuIDAgKEMtMSkgYW5kIDEyNyAoRzkpJyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBtb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpO1xuICAvL2NvbnNvbGUubG9nKG1vZGUpXG5cbiAgaWYgKHR5cGVvZiBudW1iZXIgPT09ICdudW1iZXInKSB7XG4gICAgdmFyIF9nZXROb3RlTmFtZTIgPSBfZ2V0Tm90ZU5hbWUobnVtYmVyLCBtb2RlKTtcblxuICAgIGZ1bGxOYW1lID0gX2dldE5vdGVOYW1lMi5mdWxsTmFtZTtcbiAgICBuYW1lID0gX2dldE5vdGVOYW1lMi5uYW1lO1xuICAgIG9jdGF2ZSA9IF9nZXROb3RlTmFtZTIub2N0YXZlO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuXG4gICAgaWYgKHJlZ2V4Q2hlY2tOb3RlTmFtZS50ZXN0KG5hbWUpKSB7XG4gICAgICBmdWxsTmFtZSA9ICcnICsgbmFtZSArIG9jdGF2ZTtcbiAgICAgIG51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdpbnZhbGlkIG5hbWUgJyArIG5hbWUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBmdWxsTmFtZSA9PT0gJ3N0cmluZycpIHtcblxuICAgIGlmIChyZWdleENoZWNrRnVsbE5vdGVOYW1lLnRlc3QoZnVsbE5hbWUpKSB7XG4gICAgICB2YXIgX3NwbGl0RnVsbE5hbWUyID0gX3NwbGl0RnVsbE5hbWUoZnVsbE5hbWUpO1xuXG4gICAgICBvY3RhdmUgPSBfc3BsaXRGdWxsTmFtZTIub2N0YXZlO1xuICAgICAgbmFtZSA9IF9zcGxpdEZ1bGxOYW1lMi5uYW1lO1xuXG4gICAgICBudW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnaW52YWxpZCBmdWxsbmFtZSAnICsgZnVsbE5hbWUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgdmFyIGRhdGEgPSB7XG4gICAgbmFtZTogbmFtZSxcbiAgICBvY3RhdmU6IG9jdGF2ZSxcbiAgICBmdWxsTmFtZTogZnVsbE5hbWUsXG4gICAgbnVtYmVyOiBudW1iZXIsXG4gICAgZnJlcXVlbmN5OiBfZ2V0RnJlcXVlbmN5KG51bWJlciksXG4gICAgYmxhY2tLZXk6IF9pc0JsYWNrS2V5KG51bWJlcilcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gIH07cmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIF9nZXROb3RlTmFtZShudW1iZXIpIHtcbiAgdmFyIG1vZGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IG5vdGVOYW1lTW9kZTtcblxuICAvL2xldCBvY3RhdmUgPSBNYXRoLmZsb29yKChudW1iZXIgLyAxMikgLSAyKSwgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIHZhciBvY3RhdmUgPSBmbG9vcihudW1iZXIgLyAxMiAtIDEpO1xuICB2YXIgbmFtZSA9IG5vdGVOYW1lc1ttb2RlXVtudW1iZXIgJSAxMl07XG4gIHJldHVybiB7XG4gICAgZnVsbE5hbWU6ICcnICsgbmFtZSArIG9jdGF2ZSxcbiAgICBuYW1lOiBuYW1lLFxuICAgIG9jdGF2ZTogb2N0YXZlXG4gIH07XG59XG5cbmZ1bmN0aW9uIF9nZXRPY3RhdmUoZnVsbE5hbWUpIHtcbiAgcmV0dXJuIHBhcnNlSW50KGZ1bGxOYW1lLm1hdGNoKHJlZ2V4R2V0T2N0YXZlKVswXSwgMTApO1xufVxuXG5mdW5jdGlvbiBfc3BsaXRGdWxsTmFtZShmdWxsTmFtZSkge1xuICB2YXIgb2N0YXZlID0gX2dldE9jdGF2ZShmdWxsTmFtZSk7XG4gIHJldHVybiB7XG4gICAgb2N0YXZlOiBvY3RhdmUsXG4gICAgbmFtZTogZnVsbE5hbWUucmVwbGFjZShvY3RhdmUsICcnKVxuICB9O1xufVxuXG5mdW5jdGlvbiBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpIHtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICB2YXIgaW5kZXggPSB2b2lkIDA7XG5cbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yID0ga2V5c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgIHZhciBrZXkgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgdmFyIG1vZGUgPSBub3RlTmFtZXNba2V5XTtcbiAgICAgIGluZGV4ID0gbW9kZS5maW5kSW5kZXgoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIHggPT09IG5hbWU7XG4gICAgICB9KTtcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9udW1iZXIgPSAoaW5kZXggKyAxMikgKyAob2N0YXZlICogMTIpICsgMTIgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIG51bWJlciA9IGluZGV4ICsgMTIgKyBvY3RhdmUgKiAxMjsgLy8g4oaSIG1pZGkgc3RhbmRhcmQgKyBzY2llbnRpZmljIG5hbWluZywgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01pZGRsZV9DIGFuZCBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NjaWVudGlmaWNfcGl0Y2hfbm90YXRpb25cblxuICBpZiAobnVtYmVyIDwgMCB8fCBudW1iZXIgPiAxMjcpIHtcbiAgICBjb25zb2xlLmxvZygncGxlYXNlIHByb3ZpZGUgYSBub3RlIGJldHdlZW4gMCAoQy0xKSBhbmQgMTI3IChHOSknKTtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgcmV0dXJuIG51bWJlcjtcbn1cblxuZnVuY3Rpb24gX2dldEZyZXF1ZW5jeShudW1iZXIpIHtcbiAgcmV0dXJuIHBpdGNoICogcG93KDIsIChudW1iZXIgLSA2OSkgLyAxMik7IC8vIG1pZGkgc3RhbmRhcmQsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NSURJX1R1bmluZ19TdGFuZGFyZFxufVxuXG4vL0BUT0RPOiBjYWxjdWxhdGUgbm90ZSBmcm9tIGZyZXF1ZW5jeVxuZnVuY3Rpb24gX2dldFBpdGNoKGhlcnR6KSB7XG4gIC8vZm0gID0gIDIobeKIkjY5KS8xMig0NDAgSHopLlxufVxuXG5mdW5jdGlvbiBfY2hlY2tOb3RlTmFtZU1vZGUobW9kZSkge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIHZhciByZXN1bHQgPSBrZXlzLmluY2x1ZGVzKG1vZGUpO1xuICAvL2NvbnNvbGUubG9nKHJlc3VsdClcbiAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICBpZiAodHlwZW9mIG1vZGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zb2xlLmxvZyhtb2RlICsgJyBpcyBub3QgYSB2YWxpZCBub3RlIG5hbWUgbW9kZSwgdXNpbmcgXCInICsgbm90ZU5hbWVNb2RlICsgJ1wiIGluc3RlYWQnKTtcbiAgICB9XG4gICAgbW9kZSA9IG5vdGVOYW1lTW9kZTtcbiAgfVxuICByZXR1cm4gbW9kZTtcbn1cblxuZnVuY3Rpb24gX2lzQmxhY2tLZXkobm90ZU51bWJlcikge1xuICB2YXIgYmxhY2sgPSB2b2lkIDA7XG5cbiAgc3dpdGNoICh0cnVlKSB7XG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDE6IC8vQyNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMzogLy9EI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSA2OiAvL0YjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDg6IC8vRyNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTA6XG4gICAgICAvL0EjXG4gICAgICBibGFjayA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYmxhY2sgPSBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBibGFjaztcbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuZXhwb3J0cy5kZWNvZGVTYW1wbGUgPSBkZWNvZGVTYW1wbGU7XG5leHBvcnRzLnBhcnNlU2FtcGxlczIgPSBwYXJzZVNhbXBsZXMyO1xuZXhwb3J0cy5wYXJzZVNhbXBsZXMgPSBwYXJzZVNhbXBsZXM7XG5cbnZhciBfaXNvbW9ycGhpY0ZldGNoID0gcmVxdWlyZSgnaXNvbW9ycGhpYy1mZXRjaCcpO1xuXG52YXIgX2lzb21vcnBoaWNGZXRjaDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc29tb3JwaGljRmV0Y2gpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfZXZlbnRsaXN0ZW5lciA9IHJlcXVpcmUoJy4vZXZlbnRsaXN0ZW5lcicpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBkZWNvZGVTYW1wbGUoc2FtcGxlLCBpZCwgZXZlcnkpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgdHJ5IHtcbiAgICAgIF9pbml0X2F1ZGlvLmNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSwgZnVuY3Rpb24gb25TdWNjZXNzKGJ1ZmZlcikge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBidWZmZXIpO1xuICAgICAgICBpZiAodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJlc29sdmUoeyBpZDogaWQsIGJ1ZmZlcjogYnVmZmVyIH0pO1xuICAgICAgICAgIGlmIChldmVyeSkge1xuICAgICAgICAgICAgZXZlcnkoeyBpZDogaWQsIGJ1ZmZlcjogYnVmZmVyIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKGV2ZXJ5KSB7XG4gICAgICAgICAgICBldmVyeShidWZmZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgZnVuY3Rpb24gb25FcnJvcigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yIGRlY29kaW5nIGF1ZGlvZGF0YSBbSUQ6ICcgKyBpZCArICddJyk7XG4gICAgICAgIC8vcmVqZWN0KGUpOyAvLyBkb24ndCB1c2UgcmVqZWN0IGJlY2F1c2Ugd2UgdXNlIHRoaXMgYXMgYSBuZXN0ZWQgcHJvbWlzZSBhbmQgd2UgZG9uJ3Qgd2FudCB0aGUgcGFyZW50IHByb21pc2UgdG8gcmVqZWN0XG4gICAgICAgIGlmICh0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSh7IGlkOiBpZCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpO1xuICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVzb2x2ZSh7IGlkOiBpZCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBsb2FkQW5kUGFyc2VTYW1wbGUodXJsLCBpZCwgZXZlcnkpIHtcbiAgLy9jb25zb2xlLmxvZyhpZCwgdXJsKVxuICAvKlxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdsb2FkaW5nJyxcbiAgICAgIGRhdGE6IHVybFxuICAgIH0pXG4gIH0sIDApXG4gICovXG4gICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgdHlwZTogJ2xvYWRpbmcnLFxuICAgIGRhdGE6IHVybFxuICB9KTtcblxuICB2YXIgZXhlY3V0b3IgPSBmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlKSB7XG4gICAgLy8gY29uc29sZS5sb2codXJsKVxuICAgICgwLCBfaXNvbW9ycGhpY0ZldGNoMi5kZWZhdWx0KSh1cmwsIHtcbiAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHJlc3BvbnNlLmFycmF5QnVmZmVyKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coaWQsIGRhdGEpXG4gICAgICAgICAgZGVjb2RlU2FtcGxlKGRhdGEsIGlkLCBldmVyeSkudGhlbihyZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVzb2x2ZSh7IGlkOiBpZCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvbWlzZXMocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSkge1xuXG4gIHZhciBnZXRTYW1wbGUgPSBmdW5jdGlvbiBnZXRTYW1wbGUoKSB7XG4gICAgaWYgKGtleSAhPT0gJ3JlbGVhc2UnICYmIGtleSAhPT0gJ2luZm8nICYmIGtleSAhPT0gJ3N1c3RhaW4nKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGtleSlcbiAgICAgIGlmIChzYW1wbGUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICBwcm9taXNlcy5wdXNoKGRlY29kZVNhbXBsZShzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbXBsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKCgwLCBfdXRpbC5jaGVja0lmQmFzZTY0KShzYW1wbGUpKSB7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChkZWNvZGVTYW1wbGUoKDAsIF91dGlsLmJhc2U2NFRvQmluYXJ5KShzYW1wbGUpLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhiYXNlVXJsICsgc2FtcGxlKVxuICAgICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKGJhc2VVcmwgKyBlc2NhcGUoc2FtcGxlKSwga2V5LCBldmVyeSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCh0eXBlb2Ygc2FtcGxlID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihzYW1wbGUpKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgc2FtcGxlID0gc2FtcGxlLnNhbXBsZSB8fCBzYW1wbGUuYnVmZmVyIHx8IHNhbXBsZS5iYXNlNjQgfHwgc2FtcGxlLnVybDtcbiAgICAgICAgZ2V0U2FtcGxlKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGtleSwgc2FtcGxlKVxuICAgICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZSwgcHJvbWlzZXMubGVuZ3RoKVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBnZXRTYW1wbGUoKTtcbn1cblxuLy8gb25seSBmb3IgaW50ZXJuYWxseSB1c2UgaW4gcWFtYmlcbmZ1bmN0aW9uIHBhcnNlU2FtcGxlczIobWFwcGluZykge1xuICB2YXIgZXZlcnkgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXG4gIHZhciB0eXBlID0gKDAsIF91dGlsLnR5cGVTdHJpbmcpKG1hcHBpbmcpLFxuICAgICAgcHJvbWlzZXMgPSBbXSxcbiAgICAgIGJhc2VVcmwgPSAnJztcblxuICBpZiAodHlwZW9mIG1hcHBpbmcuYmFzZVVybCA9PT0gJ3N0cmluZycpIHtcbiAgICBiYXNlVXJsID0gbWFwcGluZy5iYXNlVXJsO1xuICAgIGRlbGV0ZSBtYXBwaW5nLmJhc2VVcmw7XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKG1hcHBpbmcsIGJhc2VVcmwpXG5cbiAgZXZlcnkgPSB0eXBlb2YgZXZlcnkgPT09ICdmdW5jdGlvbicgPyBldmVyeSA6IGZhbHNlO1xuICAvL2NvbnNvbGUubG9nKHR5cGUsIG1hcHBpbmcpXG4gIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xuICAgIE9iamVjdC5rZXlzKG1hcHBpbmcpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgLy8gaWYoaXNOYU4oa2V5KSA9PT0gZmFsc2Upe1xuICAgICAgLy8gICBrZXkgPSBwYXJzZUludChrZXksIDEwKVxuICAgICAgLy8gfVxuICAgICAgdmFyIGEgPSBtYXBwaW5nW2tleV07XG4gICAgICAvL2NvbnNvbGUubG9nKGtleSwgYSwgdHlwZVN0cmluZyhhKSlcbiAgICAgIGlmICgoMCwgX3V0aWwudHlwZVN0cmluZykoYSkgPT09ICdhcnJheScpIHtcbiAgICAgICAgYS5mb3JFYWNoKGZ1bmN0aW9uIChtYXApIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKG1hcClcbiAgICAgICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgbWFwLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgYSwga2V5LCBiYXNlVXJsLCBldmVyeSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2FycmF5Jykge1xuICAgIHZhciBrZXkgPSB2b2lkIDA7XG4gICAgbWFwcGluZy5mb3JFYWNoKGZ1bmN0aW9uIChzYW1wbGUpIHtcbiAgICAgIC8vIGtleSBpcyBkZWxpYmVyYXRlbHkgdW5kZWZpbmVkXG4gICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSwgdmFsdWVzKVxuICAgICAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1hcHBpbmcgPSB7fTtcbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgLy8gc3VwcG9ydCBmb3IgbXVsdGkgbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgICAgIHZhciBtYXAgPSBtYXBwaW5nW3ZhbHVlLmlkXTtcbiAgICAgICAgICB2YXIgdHlwZSA9ICgwLCBfdXRpbC50eXBlU3RyaW5nKShtYXApO1xuICAgICAgICAgIGlmICh0eXBlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgICAgbWFwLnB1c2godmFsdWUuYnVmZmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gW21hcCwgdmFsdWUuYnVmZmVyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWFwcGluZ1t2YWx1ZS5pZF0gPSB2YWx1ZS5idWZmZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtYXBwaW5nKVxuICAgICAgICByZXNvbHZlKG1hcHBpbmcpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnYXJyYXknKSB7XG4gICAgICAgIHJlc29sdmUodmFsdWVzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU2FtcGxlcygpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGRhdGEgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBkYXRhW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgaWYgKGRhdGEubGVuZ3RoID09PSAxICYmICgwLCBfdXRpbC50eXBlU3RyaW5nKShkYXRhWzBdKSAhPT0gJ3N0cmluZycpIHtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGFbMF0pXG4gICAgcmV0dXJuIHBhcnNlU2FtcGxlczIoZGF0YVswXSk7XG4gIH1cbiAgcmV0dXJuIHBhcnNlU2FtcGxlczIoZGF0YSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5wYXJzZVRpbWVFdmVudHMgPSBwYXJzZVRpbWVFdmVudHM7XG5leHBvcnRzLnBhcnNlRXZlbnRzID0gcGFyc2VFdmVudHM7XG5leHBvcnRzLnBhcnNlTUlESU5vdGVzID0gcGFyc2VNSURJTm90ZXM7XG5leHBvcnRzLmZpbHRlckV2ZW50cyA9IGZpbHRlckV2ZW50cztcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfbWlkaV9ub3RlID0gcmVxdWlyZSgnLi9taWRpX25vdGUnKTtcblxudmFyIHBwcSA9IHZvaWQgMCxcbiAgICBicG0gPSB2b2lkIDAsXG4gICAgZmFjdG9yID0gdm9pZCAwLFxuICAgIG5vbWluYXRvciA9IHZvaWQgMCxcbiAgICBkZW5vbWluYXRvciA9IHZvaWQgMCxcbiAgICBwbGF5YmFja1NwZWVkID0gdm9pZCAwLFxuICAgIGJhciA9IHZvaWQgMCxcbiAgICBiZWF0ID0gdm9pZCAwLFxuICAgIHNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICB0aWNrID0gdm9pZCAwLFxuICAgIHRpY2tzID0gdm9pZCAwLFxuICAgIG1pbGxpcyA9IHZvaWQgMCxcbiAgICBtaWxsaXNQZXJUaWNrID0gdm9pZCAwLFxuICAgIHNlY29uZHNQZXJUaWNrID0gdm9pZCAwLFxuICAgIHRpY2tzUGVyQmVhdCA9IHZvaWQgMCxcbiAgICB0aWNrc1BlckJhciA9IHZvaWQgMCxcbiAgICB0aWNrc1BlclNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICBudW1TaXh0ZWVudGggPSB2b2lkIDAsXG4gICAgZGlmZlRpY2tzID0gdm9pZCAwO1xuLy9wcmV2aW91c0V2ZW50XG5cbmZ1bmN0aW9uIHNldFRpY2tEdXJhdGlvbigpIHtcbiAgc2Vjb25kc1BlclRpY2sgPSAxIC8gcGxheWJhY2tTcGVlZCAqIDYwIC8gYnBtIC8gcHBxO1xuICBtaWxsaXNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2sgKiAxMDAwO1xuICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssIGJwbSwgcHBxLCBwbGF5YmFja1NwZWVkLCAocHBxICogbWlsbGlzUGVyVGljaykpO1xuICAvL2NvbnNvbGUubG9nKHBwcSk7XG59XG5cbmZ1bmN0aW9uIHNldFRpY2tzUGVyQmVhdCgpIHtcbiAgZmFjdG9yID0gNCAvIGRlbm9taW5hdG9yO1xuICBudW1TaXh0ZWVudGggPSBmYWN0b3IgKiA0O1xuICB0aWNrc1BlckJlYXQgPSBwcHEgKiBmYWN0b3I7XG4gIHRpY2tzUGVyQmFyID0gdGlja3NQZXJCZWF0ICogbm9taW5hdG9yO1xuICB0aWNrc1BlclNpeHRlZW50aCA9IHBwcSAvIDQ7XG4gIC8vY29uc29sZS5sb2coZGVub21pbmF0b3IsIGZhY3RvciwgbnVtU2l4dGVlbnRoLCB0aWNrc1BlckJlYXQsIHRpY2tzUGVyQmFyLCB0aWNrc1BlclNpeHRlZW50aCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVBvc2l0aW9uKGV2ZW50KSB7XG4gIHZhciBmYXN0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcblxuICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzO1xuICAvLyBpZihkaWZmVGlja3MgPCAwKXtcbiAgLy8gICBjb25zb2xlLmxvZyhkaWZmVGlja3MsIGV2ZW50LnRpY2tzLCBwcmV2aW91c0V2ZW50LnRpY2tzLCBwcmV2aW91c0V2ZW50LnR5cGUpXG4gIC8vIH1cbiAgdGljayArPSBkaWZmVGlja3M7XG4gIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIC8vcHJldmlvdXNFdmVudCA9IGV2ZW50XG4gIC8vY29uc29sZS5sb2coZGlmZlRpY2tzLCBtaWxsaXNQZXJUaWNrKTtcbiAgbWlsbGlzICs9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG5cbiAgaWYgKGZhc3QgPT09IGZhbHNlKSB7XG4gICAgd2hpbGUgKHRpY2sgPj0gdGlja3NQZXJTaXh0ZWVudGgpIHtcbiAgICAgIHNpeHRlZW50aCsrO1xuICAgICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICAgIHdoaWxlIChzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpIHtcbiAgICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgICAgYmVhdCsrO1xuICAgICAgICB3aGlsZSAoYmVhdCA+IG5vbWluYXRvcikge1xuICAgICAgICAgIGJlYXQgLT0gbm9taW5hdG9yO1xuICAgICAgICAgIGJhcisrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGltZUV2ZW50cyhzZXR0aW5ncywgdGltZUV2ZW50cykge1xuICB2YXIgaXNQbGF5aW5nID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcblxuICAvL2NvbnNvbGUubG9nKCdwYXJzZSB0aW1lIGV2ZW50cycpXG4gIHZhciB0eXBlID0gdm9pZCAwO1xuICB2YXIgZXZlbnQgPSB2b2lkIDA7XG5cbiAgcHBxID0gc2V0dGluZ3MucHBxO1xuICBicG0gPSBzZXR0aW5ncy5icG07XG4gIG5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcjtcbiAgcGxheWJhY2tTcGVlZCA9IHNldHRpbmdzLnBsYXliYWNrU3BlZWQ7XG4gIGJhciA9IDE7XG4gIGJlYXQgPSAxO1xuICBzaXh0ZWVudGggPSAxO1xuICB0aWNrID0gMDtcbiAgdGlja3MgPSAwO1xuICBtaWxsaXMgPSAwO1xuXG4gIHNldFRpY2tEdXJhdGlvbigpO1xuICBzZXRUaWNrc1BlckJlYXQoKTtcblxuICB0aW1lRXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICByZXR1cm4gYS50aWNrcyA8PSBiLnRpY2tzID8gLTEgOiAxO1xuICB9KTtcbiAgdmFyIGUgPSAwO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0aW1lRXZlbnRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgZXZlbnQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgLy9jb25zb2xlLmxvZyhlKyssIGV2ZW50LnRpY2tzLCBldmVudC50eXBlKVxuICAgICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICAgIHR5cGUgPSBldmVudC50eXBlO1xuICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG5cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuXG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICAgICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICAgIHNldFRpY2tzUGVyQmVhdCgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICAgIHVwZGF0ZUV2ZW50KGV2ZW50LCBpc1BsYXlpbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXJzQXNTdHJpbmcpO1xuICAgIH1cblxuICAgIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAvL2NvbnNvbGUubG9nKHRpbWVFdmVudHMpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vL2V4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhzb25nLCBldmVudHMpe1xuZnVuY3Rpb24gcGFyc2VFdmVudHMoZXZlbnRzKSB7XG4gIHZhciBpc1BsYXlpbmcgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXG4gIC8vY29uc29sZS5sb2coJ3BhcnNlRXZlbnRzJylcbiAgdmFyIGV2ZW50ID0gdm9pZCAwO1xuICB2YXIgc3RhcnRFdmVudCA9IDA7XG4gIHZhciBsYXN0RXZlbnRUaWNrID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIGRpZmZUaWNrcyA9IDA7XG5cbiAgLy9sZXQgZXZlbnRzID0gW10uY29uY2F0KGV2dHMsIHNvbmcuX3RpbWVFdmVudHMpO1xuICB2YXIgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aDtcbiAgLy9jb25zb2xlLmxvZyhldmVudHMpXG5cbiAgLy8gbm90ZW9mZiBjb21lcyBiZWZvcmUgbm90ZW9uXG5cbiAgLypcbiAgICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBhLnNvcnRJbmRleCAtIGIuc29ydEluZGV4O1xuICAgIH0pXG4gICovXG5cbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoYS50aWNrcyA9PT0gYi50aWNrcykge1xuICAgICAgLy8gaWYoYS50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gLTFcbiAgICAgIC8vIH1lbHNlIGlmKGIudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vICAgcmV0dXJuIDFcbiAgICAgIC8vIH1cbiAgICAgIC8vIHNob3J0OlxuICAgICAgdmFyIHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZiAoYS50eXBlID09PSAxNzYgJiYgYi50eXBlID09PSAxNDQpIHtcbiAgICAgICAgciA9IC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIHJldHVybiBhLnRpY2tzIC0gYi50aWNrcztcbiAgfSk7XG4gIGV2ZW50ID0gZXZlbnRzWzBdO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuXG5cbiAgYnBtID0gZXZlbnQuYnBtO1xuICBmYWN0b3IgPSBldmVudC5mYWN0b3I7XG4gIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcblxuICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuXG4gIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICBiYXIgPSBldmVudC5iYXI7XG4gIGJlYXQgPSBldmVudC5iZWF0O1xuICBzaXh0ZWVudGggPSBldmVudC5zaXh0ZWVudGg7XG4gIHRpY2sgPSBldmVudC50aWNrO1xuXG4gIGZvciAodmFyIGkgPSBzdGFydEV2ZW50OyBpIDwgbnVtRXZlbnRzOyBpKyspIHtcblxuICAgIGV2ZW50ID0gZXZlbnRzW2ldO1xuXG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcbiAgICAgICAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gICAgICAgIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgICAgICAgdGljayArPSBkaWZmVGlja3M7XG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3M7XG4gICAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljayxldmVudC5taWxsaXNQZXJUaWNrKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgICAgICAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICAgICAgICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgICAgICAgdGljayArPSBkaWZmVGlja3M7XG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3M7XG4gICAgICAgIC8vY29uc29sZS5sb2cobm9taW5hdG9yLG51bVNpeHRlZW50aCx0aWNrc1BlclNpeHRlZW50aCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuXG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vY2FzZSAxMjg6XG4gICAgICAgIC8vY2FzZSAxNDQ6XG5cbiAgICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAgIHVwZGF0ZUV2ZW50KGV2ZW50LCBpc1BsYXlpbmcpO1xuICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAqL1xuICAgICAgICByZXN1bHQucHVzaChldmVudCk7XG5cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuYmFyKVxuXG4gICAgICAvLyBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQuZGF0YTIsIGV2ZW50LmJhcnNBc1N0cmluZylcbiAgICAgIC8vIH1cblxuICAgIH1cblxuICAgIC8vIGlmKGkgPCAxMDAgJiYgKGV2ZW50LnR5cGUgPT09IDgxIHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpKXtcbiAgICAvLyAgIC8vY29uc29sZS5sb2coaSwgdGlja3MsIGRpZmZUaWNrcywgbWlsbGlzLCBtaWxsaXNQZXJUaWNrKVxuICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQubWlsbGlzLCAnbm90ZScsIGV2ZW50LmRhdGExLCAndmVsbycsIGV2ZW50LmRhdGEyKVxuICAgIC8vIH1cblxuICAgIGxhc3RFdmVudFRpY2sgPSBldmVudC50aWNrcztcbiAgfVxuICBwYXJzZU1JRElOb3RlcyhyZXN1bHQpO1xuICByZXR1cm4gcmVzdWx0O1xuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGV2ZW50KSB7XG4gIHZhciBmYXN0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcblxuICAvL2NvbnNvbGUubG9nKGJhciwgYmVhdCwgdGlja3MpXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuICBldmVudC50aWNrcyA9IHRpY2tzO1xuXG4gIGV2ZW50Lm1pbGxpcyA9IG1pbGxpcztcbiAgZXZlbnQuc2Vjb25kcyA9IG1pbGxpcyAvIDEwMDA7XG5cbiAgaWYgKGZhc3QpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBldmVudC5iYXIgPSBiYXI7XG4gIGV2ZW50LmJlYXQgPSBiZWF0O1xuICBldmVudC5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gIGV2ZW50LnRpY2sgPSB0aWNrO1xuICAvL2V2ZW50LmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrO1xuICB2YXIgdGlja0FzU3RyaW5nID0gdGljayA9PT0gMCA/ICcwMDAnIDogdGljayA8IDEwID8gJzAwJyArIHRpY2sgOiB0aWNrIDwgMTAwID8gJzAnICsgdGljayA6IHRpY2s7XG4gIGV2ZW50LmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gIGV2ZW50LmJhcnNBc0FycmF5ID0gW2JhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXTtcblxuICB2YXIgdGltZURhdGEgPSAoMCwgX3V0aWwuZ2V0TmljZVRpbWUpKG1pbGxpcyk7XG5cbiAgZXZlbnQuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gIGV2ZW50Lm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgZXZlbnQuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICBldmVudC5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICBldmVudC50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG4gIGV2ZW50LnRpbWVBc0FycmF5ID0gdGltZURhdGEudGltZUFzQXJyYXk7XG5cbiAgLy8gaWYobWlsbGlzIDwgMCl7XG4gIC8vICAgY29uc29sZS5sb2coZXZlbnQpXG4gIC8vIH1cblxufVxuXG52YXIgbWlkaU5vdGVJbmRleCA9IDA7XG5cbmZ1bmN0aW9uIHBhcnNlTUlESU5vdGVzKGV2ZW50cykge1xuICB2YXIgbm90ZXMgPSB7fTtcbiAgdmFyIG5vdGVzSW5UcmFjayA9IHZvaWQgMDtcbiAgdmFyIG4gPSAwO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IGV2ZW50c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgdmFyIGV2ZW50ID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICBpZiAodHlwZW9mIGV2ZW50Ll9wYXJ0ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZXZlbnQuX3RyYWNrID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zb2xlLmxvZygnbm8gcGFydCBhbmQvb3IgdHJhY2sgc2V0JywgZXZlbnQpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChldmVudC50eXBlID09PSAxNDQpIHtcbiAgICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXTtcbiAgICAgICAgaWYgKHR5cGVvZiBub3Rlc0luVHJhY2sgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudDtcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gMTI4KSB7XG4gICAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50Ll90cmFjay5pZF07XG4gICAgICAgIGlmICh0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIGNvcnJlc3BvbmRpbmcgbm90ZW9uIGV2ZW50IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub3RlT24gPSBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdO1xuICAgICAgICB2YXIgbm90ZU9mZiA9IGV2ZW50O1xuICAgICAgICBpZiAodHlwZW9mIG5vdGVPbiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBub3Rlb24gZXZlbnQgZm9yIGV2ZW50JywgZXZlbnQuaWQpXG4gICAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50Ll90cmFjay5pZF1bZXZlbnQuZGF0YTFdO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub3RlID0gbmV3IF9taWRpX25vdGUuTUlESU5vdGUobm90ZU9uLCBub3RlT2ZmKTtcbiAgICAgICAgbm90ZS5fdHJhY2sgPSBub3RlT24uX3RyYWNrO1xuICAgICAgICBub3RlID0gbnVsbDtcbiAgICAgICAgLy8gbGV0IGlkID0gYE1OXyR7bWlkaU5vdGVJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICAgICAgLy8gbm90ZU9uLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgICAvLyBub3RlT24ub2ZmID0gbm90ZU9mZi5pZFxuICAgICAgICAvLyBub3RlT2ZmLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgICAvLyBub3RlT2ZmLm9uID0gbm90ZU9uLmlkXG4gICAgICAgIGRlbGV0ZSBub3Rlc1tldmVudC5fdHJhY2suaWRdW2V2ZW50LmRhdGExXTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvcjIucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5rZXlzKG5vdGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBkZWxldGUgbm90ZXNba2V5XTtcbiAgfSk7XG4gIG5vdGVzID0ge307XG4gIC8vY29uc29sZS5sb2cobm90ZXMsIG5vdGVzSW5UcmFjaylcbn1cblxuLy8gbm90IGluIHVzZSFcbmZ1bmN0aW9uIGZpbHRlckV2ZW50cyhldmVudHMpIHtcbiAgdmFyIHN1c3RhaW4gPSB7fTtcbiAgdmFyIHRtcFJlc3VsdCA9IHt9O1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvcjMgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yMyA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvcjMgPSBldmVudHNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDM7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSAoX3N0ZXAzID0gX2l0ZXJhdG9yMy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWUpIHtcbiAgICAgIHZhciBldmVudCA9IF9zdGVwMy52YWx1ZTtcblxuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEyID09PSAwKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBzdXN0YWluW2V2ZW50LnRyYWNrSWRdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChzdXN0YWluW2V2ZW50LnRyYWNrSWRdID09PSBldmVudC50aWNrcykge1xuICAgICAgICAgICAgZGVsZXRlIHRtcFJlc3VsdFtldmVudC50aWNrc107XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50O1xuICAgICAgICAgIGRlbGV0ZSBzdXN0YWluW2V2ZW50LnRyYWNrSWRdO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGEyID09PSAxMjcpIHtcbiAgICAgICAgICBzdXN0YWluW2V2ZW50LnRyYWNrSWRdID0gZXZlbnQudGlja3M7XG4gICAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQucHVzaChldmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvcjMgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yMyA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyAmJiBfaXRlcmF0b3IzLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IzLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IzKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zb2xlLmxvZyhzdXN0YWluKTtcbiAgT2JqZWN0LmtleXModG1wUmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgc3VzdGFpbkV2ZW50ID0gdG1wUmVzdWx0W2tleV07XG4gICAgY29uc29sZS5sb2coc3VzdGFpbkV2ZW50KTtcbiAgICByZXN1bHQucHVzaChzdXN0YWluRXZlbnQpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlBhcnQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7IC8vIEAgZmxvd1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBpbnN0YW5jZUluZGV4ID0gMDtcblxudmFyIFBhcnQgPSBleHBvcnRzLlBhcnQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFBhcnQoKSB7XG4gICAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYXJ0KTtcblxuICAgIHRoaXMuaWQgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIHZhciBfc2V0dGluZ3MkbmFtZSA9IHNldHRpbmdzLm5hbWU7XG4gICAgdGhpcy5uYW1lID0gX3NldHRpbmdzJG5hbWUgPT09IHVuZGVmaW5lZCA/IHRoaXMuaWQgOiBfc2V0dGluZ3MkbmFtZTtcbiAgICB2YXIgX3NldHRpbmdzJG11dGVkID0gc2V0dGluZ3MubXV0ZWQ7XG4gICAgdGhpcy5tdXRlZCA9IF9zZXR0aW5ncyRtdXRlZCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBfc2V0dGluZ3MkbXV0ZWQ7XG5cblxuICAgIHRoaXMuX3RyYWNrID0gbnVsbDtcbiAgICB0aGlzLl9zb25nID0gbnVsbDtcbiAgICB0aGlzLl9ldmVudHMgPSBbXTtcbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlO1xuICAgIHRoaXMuX3N0YXJ0ID0geyBtaWxsaXM6IDAsIHRpY2tzOiAwIH07XG4gICAgdGhpcy5fZW5kID0geyBtaWxsaXM6IDAsIHRpY2tzOiAwIH07XG5cbiAgICB2YXIgZXZlbnRzID0gc2V0dGluZ3MuZXZlbnRzO1xuXG4gICAgaWYgKHR5cGVvZiBldmVudHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmFkZEV2ZW50cy5hcHBseSh0aGlzLCBfdG9Db25zdW1hYmxlQXJyYXkoZXZlbnRzKSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFBhcnQsIFt7XG4gICAga2V5OiAnY29weScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvcHkoKSB7XG4gICAgICB2YXIgcCA9IG5ldyBQYXJ0KHRoaXMubmFtZSArICdfY29weScpOyAvLyBpbXBsZW1lbnQgZ2V0TmFtZU9mQ29weSgpIGluIHV0aWwgKHNlZSBoZWFydGJlYXQpXG4gICAgICB2YXIgZXZlbnRzID0gW107XG4gICAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIGNvcHkgPSBldmVudC5jb3B5KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGNvcHkpO1xuICAgICAgICBldmVudHMucHVzaChjb3B5KTtcbiAgICAgIH0pO1xuICAgICAgcC5hZGRFdmVudHMuYXBwbHkocCwgZXZlbnRzKTtcbiAgICAgIHAudXBkYXRlKCk7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0cmFuc3Bvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0cmFuc3Bvc2UoYW1vdW50KSB7XG4gICAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQudHJhbnNwb3NlKGFtb3VudCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZSh0aWNrcykge1xuICAgICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50Lm1vdmUodGlja3MpO1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy5fc29uZykge1xuICAgICAgICB2YXIgX3NvbmckX21vdmVkRXZlbnRzO1xuXG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHMgPSB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfbW92ZWRFdmVudHMsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlVG8nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlVG8odGlja3MpIHtcbiAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5tb3ZlVG8odGlja3MpO1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy5fc29uZykge1xuICAgICAgICB2YXIgX3NvbmckX21vdmVkRXZlbnRzMjtcblxuICAgICAgICAoX3NvbmckX21vdmVkRXZlbnRzMiA9IHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9tb3ZlZEV2ZW50czIsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhZGRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudHMoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgIF9ldmVudHM7XG5cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICAgICAgdmFyIHRyYWNrID0gdGhpcy5fdHJhY2s7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgZXZlbnRzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuX3BhcnQgPSBfdGhpcztcbiAgICAgICAgX3RoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudCk7XG4gICAgICAgIGlmICh0cmFjaykge1xuICAgICAgICAgIGV2ZW50Ll90cmFjayA9IHRyYWNrO1xuICAgICAgICAgIGlmICh0cmFjay5fc29uZykge1xuICAgICAgICAgICAgZXZlbnQuX3NvbmcgPSB0cmFjay5fc29uZztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgKF9ldmVudHMgPSB0aGlzLl9ldmVudHMpLnB1c2guYXBwbHkoX2V2ZW50cywgZXZlbnRzKTtcblxuICAgICAgaWYgKHRyYWNrKSB7XG4gICAgICAgIHZhciBfdHJhY2skX2V2ZW50cztcblxuICAgICAgICAoX3RyYWNrJF9ldmVudHMgPSB0cmFjay5fZXZlbnRzKS5wdXNoLmFwcGx5KF90cmFjayRfZXZlbnRzLCBldmVudHMpO1xuICAgICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3NvbmcpIHtcbiAgICAgICAgdmFyIF9zb25nJF9uZXdFdmVudHM7XG5cbiAgICAgICAgKF9zb25nJF9uZXdFdmVudHMgPSB0aGlzLl9zb25nLl9uZXdFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX25ld0V2ZW50cywgZXZlbnRzKTtcbiAgICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXZlbnRzKCkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHZhciB0cmFjayA9IHRoaXMuX3RyYWNrO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuX3BhcnQgPSBudWxsO1xuICAgICAgICBfdGhpczIuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKTtcbiAgICAgICAgaWYgKHRyYWNrKSB7XG4gICAgICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbDtcbiAgICAgICAgICB0cmFjay5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpO1xuICAgICAgICAgIGlmICh0cmFjay5fc29uZykge1xuICAgICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAodHJhY2spIHtcbiAgICAgICAgdHJhY2suX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgdHJhY2suX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3NvbmcpIHtcbiAgICAgICAgdmFyIF9zb25nJF9yZW1vdmVkRXZlbnRzO1xuXG4gICAgICAgIChfc29uZyRfcmVtb3ZlZEV2ZW50cyA9IHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX3JlbW92ZWRFdmVudHMsIGV2ZW50cyk7XG4gICAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKHRoaXMpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWU7XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZUV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVFdmVudHModGlja3MpIHtcbiAgICAgIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgZXZlbnRzID0gQXJyYXkoX2xlbjMgPiAxID8gX2xlbjMgLSAxIDogMCksIF9rZXkzID0gMTsgX2tleTMgPCBfbGVuMzsgX2tleTMrKykge1xuICAgICAgICBldmVudHNbX2tleTMgLSAxXSA9IGFyZ3VtZW50c1tfa2V5M107XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5tb3ZlKHRpY2tzKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMuX3NvbmcpIHtcbiAgICAgICAgdmFyIF9zb25nJF9tb3ZlZEV2ZW50czM7XG5cbiAgICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcyk7XG4gICAgICAgIChfc29uZyRfbW92ZWRFdmVudHMzID0gdGhpcy5fc29uZy5fbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX21vdmVkRXZlbnRzMywgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVFdmVudHNUbycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVFdmVudHNUbyh0aWNrcykge1xuICAgICAgZm9yICh2YXIgX2xlbjQgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuNCA+IDEgPyBfbGVuNCAtIDEgOiAwKSwgX2tleTQgPSAxOyBfa2V5NCA8IF9sZW40OyBfa2V5NCsrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5NCAtIDFdID0gYXJndW1lbnRzW19rZXk0XTtcbiAgICAgIH1cblxuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcyk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHM0O1xuXG4gICAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKHRoaXMpO1xuICAgICAgICAoX3NvbmckX21vdmVkRXZlbnRzNCA9IHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9tb3ZlZEV2ZW50czQsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFdmVudHMoKSB7XG4gICAgICB2YXIgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBudWxsO1xuICAgICAgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgICBpZiAodGhpcy5fbmVlZHNVcGRhdGUpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpOyAvL0BUT0RPIGltcGxlbWVudCBmaWx0ZXIgLT4gZmlsdGVyRXZlbnRzKCkgc2hvdWxkIGJlIGEgdXRpbGl0eSBmdW5jdGlvbiAobm90IGEgY2xhc3MgbWV0aG9kKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ211dGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtdXRlKCkge1xuICAgICAgdmFyIGZsYWcgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IG51bGw7XG5cbiAgICAgIGlmIChmbGFnKSB7XG4gICAgICAgIHRoaXMubXV0ZWQgPSBmbGFnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tdXRlZCA9ICF0aGlzLm11dGVkO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIGlmICh0aGlzLl9uZWVkc1VwZGF0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKTtcbiAgICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgKDAsIF91dGlsLnNvcnRFdmVudHMpKHRoaXMuX2V2ZW50cyk7XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgLy9AVE9ETzogY2FsY3VsYXRlIHBhcnQgc3RhcnQgYW5kIGVuZCwgYW5kIGhpZ2hlc3QgYW5kIGxvd2VzdCBub3RlXG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFBhcnQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5QbGF5aGVhZCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9wb3NpdGlvbiA9IHJlcXVpcmUoJy4vcG9zaXRpb24uanMnKTtcblxudmFyIF9ldmVudGxpc3RlbmVyID0gcmVxdWlyZSgnLi9ldmVudGxpc3RlbmVyLmpzJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIHJhbmdlID0gMTA7IC8vIG1pbGxpc2Vjb25kcyBvciB0aWNrc1xudmFyIGluc3RhbmNlSW5kZXggPSAwO1xuXG52YXIgUGxheWhlYWQgPSBleHBvcnRzLlBsYXloZWFkID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQbGF5aGVhZChzb25nKSB7XG4gICAgdmFyIHR5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6ICdhbGwnO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBsYXloZWFkKTtcblxuICAgIHRoaXMuaWQgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLnNvbmcgPSBzb25nO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5sYXN0RXZlbnQgPSBudWxsO1xuICAgIHRoaXMuZGF0YSA9IHt9O1xuXG4gICAgdGhpcy5hY3RpdmVQYXJ0cyA9IFtdO1xuICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbXTtcbiAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IFtdO1xuICB9XG5cbiAgLy8gdW5pdCBjYW4gYmUgJ21pbGxpcycgb3IgJ3RpY2tzJ1xuXG5cbiAgX2NyZWF0ZUNsYXNzKFBsYXloZWFkLCBbe1xuICAgIGtleTogJ3NldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldCh1bml0LCB2YWx1ZSkge1xuICAgICAgdGhpcy51bml0ID0gdW5pdDtcbiAgICAgIHRoaXMuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLmV2ZW50SW5kZXggPSAwO1xuICAgICAgdGhpcy5ub3RlSW5kZXggPSAwO1xuICAgICAgdGhpcy5wYXJ0SW5kZXggPSAwO1xuICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcbiAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUodW5pdCwgZGlmZikge1xuICAgICAgaWYgKGRpZmYgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICAgIH1cbiAgICAgIHRoaXMudW5pdCA9IHVuaXQ7XG4gICAgICB0aGlzLmN1cnJlbnRWYWx1ZSArPSBkaWZmO1xuICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcbiAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlU29uZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVNvbmcoKSB7XG4gICAgICB0aGlzLmV2ZW50cyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5zb25nLl9ldmVudHMpLCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5zb25nLl90aW1lRXZlbnRzKSk7XG4gICAgICAoMCwgX3V0aWwuc29ydEV2ZW50cykodGhpcy5ldmVudHMpO1xuICAgICAgLy9jb25zb2xlLmxvZygnZXZlbnRzICVPJywgdGhpcy5ldmVudHMpXG4gICAgICB0aGlzLm5vdGVzID0gdGhpcy5zb25nLl9ub3RlcztcbiAgICAgIHRoaXMucGFydHMgPSB0aGlzLnNvbmcuX3BhcnRzO1xuICAgICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGg7XG4gICAgICB0aGlzLm51bU5vdGVzID0gdGhpcy5ub3Rlcy5sZW5ndGg7XG4gICAgICB0aGlzLm51bVBhcnRzID0gdGhpcy5wYXJ0cy5sZW5ndGg7XG4gICAgICB0aGlzLnNldCgnbWlsbGlzJywgdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjYWxjdWxhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjYWxjdWxhdGUoKSB7XG4gICAgICB2YXIgaSA9IHZvaWQgMDtcbiAgICAgIHZhciB2YWx1ZSA9IHZvaWQgMDtcbiAgICAgIHZhciBldmVudCA9IHZvaWQgMDtcbiAgICAgIHZhciBub3RlID0gdm9pZCAwO1xuICAgICAgdmFyIHBhcnQgPSB2b2lkIDA7XG4gICAgICB2YXIgcG9zaXRpb24gPSB2b2lkIDA7XG4gICAgICB2YXIgc3RpbGxBY3RpdmVOb3RlcyA9IFtdO1xuICAgICAgdmFyIHN0aWxsQWN0aXZlUGFydHMgPSBbXTtcbiAgICAgIHZhciBjb2xsZWN0ZWRQYXJ0cyA9IG5ldyBTZXQoKTtcbiAgICAgIHZhciBjb2xsZWN0ZWROb3RlcyA9IG5ldyBTZXQoKTtcblxuICAgICAgdGhpcy5kYXRhID0ge307XG4gICAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IFtdO1xuICAgICAgdmFyIHN1c3RhaW5wZWRhbEV2ZW50cyA9IFtdO1xuXG4gICAgICBmb3IgKGkgPSB0aGlzLmV2ZW50SW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKSB7XG4gICAgICAgIGV2ZW50ID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAgIHZhbHVlID0gZXZlbnRbdGhpcy51bml0XTtcbiAgICAgICAgaWYgKHZhbHVlIDw9IHRoaXMuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgLy8gaWYgdGhlIHBsYXloZWFkIGlzIHNldCB0byBhIHBvc2l0aW9uIG9mIHNheSAzMDAwIG1pbGxpcywgd2UgZG9uJ3Qgd2FudCB0byBhZGQgZXZlbnRzIG1vcmUgdGhhdCAxMCB1bml0cyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgICAgaWYgKHZhbHVlID09PSAwIHx8IHZhbHVlID4gdGhpcy5jdXJyZW50VmFsdWUgLSByYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVFdmVudHMucHVzaChldmVudCk7XG4gICAgICAgICAgICAvLyB0aGlzIGRvZXNuJ3Qgd29yayB0b28gd2VsbFxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IDE3Nikge1xuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMilcbiAgICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGExID09PSA2NCkge1xuICAgICAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsMicsXG4gICAgICAgICAgICAgICAgICBkYXRhOiBldmVudC5kYXRhMiA9PT0gMTI3ID8gJ2Rvd24nIDogJ3VwJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN1c3RhaW5wZWRhbEV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyB9ZWxzZXtcbiAgICAgICAgICAgICAgLy8gICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgICAgLy8gICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgICAgIC8vICAgICBkYXRhOiBldmVudFxuICAgICAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5sYXN0RXZlbnQgPSBldmVudDtcbiAgICAgICAgICB0aGlzLmV2ZW50SW5kZXgrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbGV0IG51bSA9IHN1c3RhaW5wZWRhbEV2ZW50cy5sZW5ndGhcbiAgICAgIC8vIGlmKG51bSA+IDApe1xuICAgICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRWYWx1ZSwgbnVtLCBzdXN0YWlucGVkYWxFdmVudHNbbnVtIC0gMV0uZGF0YTIsIHN1c3RhaW5wZWRhbEV2ZW50cylcbiAgICAgIC8vIH1cblxuICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgICAgdGhpcy5kYXRhLmFjdGl2ZUV2ZW50cyA9IHRoaXMuYWN0aXZlRXZlbnRzO1xuXG4gICAgICAvLyBpZiBhIHNvbmcgaGFzIG5vIGV2ZW50cyB5ZXQsIHVzZSB0aGUgZmlyc3QgdGltZSBldmVudCBhcyByZWZlcmVuY2VcbiAgICAgIGlmICh0aGlzLmxhc3RFdmVudCA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxhc3RFdmVudCA9IHRoaXMuc29uZy5fdGltZUV2ZW50c1swXTtcbiAgICAgIH1cblxuICAgICAgcG9zaXRpb24gPSAoMCwgX3Bvc2l0aW9uLmdldFBvc2l0aW9uMikodGhpcy5zb25nLCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlLCAnYWxsJywgdGhpcy5sYXN0RXZlbnQpO1xuICAgICAgdGhpcy5kYXRhLmV2ZW50SW5kZXggPSB0aGlzLmV2ZW50SW5kZXg7XG4gICAgICB0aGlzLmRhdGEubWlsbGlzID0gcG9zaXRpb24ubWlsbGlzO1xuICAgICAgdGhpcy5kYXRhLnRpY2tzID0gcG9zaXRpb24udGlja3M7XG4gICAgICB0aGlzLmRhdGEucG9zaXRpb24gPSBwb3NpdGlvbjtcblxuICAgICAgaWYgKHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IE9iamVjdC5rZXlzKHBvc2l0aW9uKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgICAgZGF0YVtrZXldID0gcG9zaXRpb25ba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZS5pbmRleE9mKCdiYXJzYmVhdHMnKSAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5kYXRhLmJhciA9IHBvc2l0aW9uLmJhcjtcbiAgICAgICAgdGhpcy5kYXRhLmJlYXQgPSBwb3NpdGlvbi5iZWF0O1xuICAgICAgICB0aGlzLmRhdGEuc2l4dGVlbnRoID0gcG9zaXRpb24uc2l4dGVlbnRoO1xuICAgICAgICB0aGlzLmRhdGEudGljayA9IHBvc2l0aW9uLnRpY2s7XG4gICAgICAgIHRoaXMuZGF0YS5iYXJzQXNTdHJpbmcgPSBwb3NpdGlvbi5iYXJzQXNTdHJpbmc7XG5cbiAgICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmFyID0gcG9zaXRpb24udGlja3NQZXJCYXI7XG4gICAgICAgIHRoaXMuZGF0YS50aWNrc1BlckJlYXQgPSBwb3NpdGlvbi50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRoaXMuZGF0YS50aWNrc1BlclNpeHRlZW50aCA9IHBvc2l0aW9uLnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICB0aGlzLmRhdGEubnVtU2l4dGVlbnRoID0gcG9zaXRpb24ubnVtU2l4dGVlbnRoO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUuaW5kZXhPZigndGltZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRhdGEuaG91ciA9IHBvc2l0aW9uLmhvdXI7XG4gICAgICAgIHRoaXMuZGF0YS5taW51dGUgPSBwb3NpdGlvbi5taW51dGU7XG4gICAgICAgIHRoaXMuZGF0YS5zZWNvbmQgPSBwb3NpdGlvbi5zZWNvbmQ7XG4gICAgICAgIHRoaXMuZGF0YS5taWxsaXNlY29uZCA9IHBvc2l0aW9uLm1pbGxpc2Vjb25kO1xuICAgICAgICB0aGlzLmRhdGEudGltZUFzU3RyaW5nID0gcG9zaXRpb24udGltZUFzU3RyaW5nO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUuaW5kZXhPZigncGVyY2VudGFnZScpICE9PSAtMSkge1xuICAgICAgICB0aGlzLmRhdGEucGVyY2VudGFnZSA9IHBvc2l0aW9uLnBlcmNlbnRhZ2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBhY3RpdmUgbm90ZXNcbiAgICAgIGlmICh0aGlzLnR5cGUuaW5kZXhPZignbm90ZXMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSkge1xuXG4gICAgICAgIC8vIGdldCBhbGwgbm90ZXMgYmV0d2VlbiB0aGUgbm90ZUluZGV4IGFuZCB0aGUgY3VycmVudCBwbGF5aGVhZCBwb3NpdGlvblxuICAgICAgICBmb3IgKGkgPSB0aGlzLm5vdGVJbmRleDsgaSA8IHRoaXMubnVtTm90ZXM7IGkrKykge1xuICAgICAgICAgIG5vdGUgPSB0aGlzLm5vdGVzW2ldO1xuICAgICAgICAgIHZhbHVlID0gbm90ZS5ub3RlT25bdGhpcy51bml0XTtcbiAgICAgICAgICBpZiAodmFsdWUgPD0gdGhpcy5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMubm90ZUluZGV4Kys7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiB0aGUgcGxheWhlYWQgaXMgc2V0IHRvIGEgcG9zaXRpb24gb2Ygc2F5IDMwMDAgbWlsbGlzLCB3ZSBkb24ndCB3YW50IHRvIGFkZCBub3RlcyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50VmFsdWUgPT09IDAgfHwgbm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgICBjb2xsZWN0ZWROb3Rlcy5hZGQobm90ZSk7XG4gICAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ25vdGVPbicsXG4gICAgICAgICAgICAgICAgZGF0YTogbm90ZS5ub3RlT25cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpbHRlciBub3RlcyB0aGF0IGFyZSBubyBsb25nZXIgYWN0aXZlXG4gICAgICAgIGZvciAoaSA9IHRoaXMuYWN0aXZlTm90ZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBub3RlID0gdGhpcy5hY3RpdmVOb3Rlc1tpXTtcbiAgICAgICAgICAvL2lmKG5vdGUubm90ZU9uLnN0YXRlLmluZGV4T2YoJ3JlbW92ZWQnKSA9PT0gMCB8fCB0aGlzLnNvbmcuX25vdGVzQnlJZC5nZXQobm90ZS5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgICBpZiAodGhpcy5zb25nLl9ub3Rlc0J5SWQuZ2V0KG5vdGUuaWQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc2tpcHBpbmcgcmVtb3ZlZCBub3RlJywgbm90ZS5pZCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybignbm90ZSB3aXRoIGlkJywgbm90ZS5pZCwgJ2hhcyBubyBub3RlT2ZmIGV2ZW50Jyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL2lmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkTm90ZXMuaGFzKG5vdGUpID09PSBmYWxzZSl7XG4gICAgICAgICAgaWYgKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHN0aWxsQWN0aXZlTm90ZXMucHVzaChub3RlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICAgICAgdHlwZTogJ25vdGVPZmYnLFxuICAgICAgICAgICAgICBkYXRhOiBub3RlLm5vdGVPZmZcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCB0aGUgc3RpbGwgYWN0aXZlIG5vdGVzIGFuZCB0aGUgbmV3bHkgYWN0aXZlIGV2ZW50cyB0byB0aGUgYWN0aXZlIG5vdGVzIGFycmF5XG4gICAgICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KGNvbGxlY3RlZE5vdGVzLnZhbHVlcygpKSwgc3RpbGxBY3RpdmVOb3Rlcyk7XG4gICAgICAgIHRoaXMuZGF0YS5hY3RpdmVOb3RlcyA9IHRoaXMuYWN0aXZlTm90ZXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBhY3RpdmUgcGFydHNcbiAgICAgIGlmICh0aGlzLnR5cGUuaW5kZXhPZigncGFydHMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSkge1xuXG4gICAgICAgIGZvciAoaSA9IHRoaXMucGFydEluZGV4OyBpIDwgdGhpcy5udW1QYXJ0czsgaSsrKSB7XG4gICAgICAgICAgcGFydCA9IHRoaXMucGFydHNbaV07XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJ0LCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICBpZiAocGFydC5fc3RhcnRbdGhpcy51bml0XSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgY29sbGVjdGVkUGFydHMuYWRkKHBhcnQpO1xuICAgICAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgICAgICAgdHlwZTogJ3BhcnRPbicsXG4gICAgICAgICAgICAgIGRhdGE6IHBhcnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5wYXJ0SW5kZXgrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmlsdGVyIHBhcnRzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgICAgZm9yIChpID0gdGhpcy5hY3RpdmVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHBhcnQgPSB0aGlzLmFjdGl2ZVBhcnRzW2ldO1xuICAgICAgICAgIC8vaWYocGFydC5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9wYXJ0c0J5SWQuZ2V0KHBhcnQuaWQpID09PSBmYWxzZSl7XG4gICAgICAgICAgaWYgKHRoaXMuc29uZy5fcGFydHNCeUlkLmdldChwYXJ0LmlkKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgcGFydCcsIHBhcnQuaWQpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9pZihwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlICYmIGNvbGxlY3RlZFBhcnRzLmhhcyhwYXJ0KSA9PT0gZmFsc2Upe1xuICAgICAgICAgIGlmIChwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICBzdGlsbEFjdGl2ZVBhcnRzLnB1c2gobm90ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgICAgIHR5cGU6ICdwYXJ0T2ZmJyxcbiAgICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3RpdmVQYXJ0cyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoY29sbGVjdGVkUGFydHMudmFsdWVzKCkpLCBzdGlsbEFjdGl2ZVBhcnRzKTtcbiAgICAgICAgdGhpcy5kYXRhLmFjdGl2ZVBhcnRzID0gdGhpcy5hY3RpdmVQYXJ0cztcbiAgICAgIH1cblxuICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHtcbiAgICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAgc2V0VHlwZSh0KXtcbiAgICAgICAgdGhpcy50eXBlID0gdDtcbiAgICAgICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gICAgICB9XG4gICAgXG4gICAgXG4gICAgICBhZGRUeXBlKHQpe1xuICAgICAgICB0aGlzLnR5cGUgKz0gJyAnICsgdDtcbiAgICAgICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gICAgICB9XG4gICAgXG4gICAgICByZW1vdmVUeXBlKHQpe1xuICAgICAgICB2YXIgYXJyID0gdGhpcy50eXBlLnNwbGl0KCcgJyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICcnO1xuICAgICAgICBhcnIuZm9yRWFjaChmdW5jdGlvbih0eXBlKXtcbiAgICAgICAgICBpZih0eXBlICE9PSB0KXtcbiAgICAgICAgICAgIHRoaXMudHlwZSArPSB0ICsgJyAnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHlwZS50cmltKCk7XG4gICAgICAgIHRoaXMuc2V0KHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgICAgIH1cbiAgICAqL1xuXG4gIH1dKTtcblxuICByZXR1cm4gUGxheWhlYWQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KCk7XG5cbmV4cG9ydHMubWlsbGlzVG9UaWNrcyA9IG1pbGxpc1RvVGlja3M7XG5leHBvcnRzLnRpY2tzVG9NaWxsaXMgPSB0aWNrc1RvTWlsbGlzO1xuZXhwb3J0cy5iYXJzVG9NaWxsaXMgPSBiYXJzVG9NaWxsaXM7XG5leHBvcnRzLmJhcnNUb1RpY2tzID0gYmFyc1RvVGlja3M7XG5leHBvcnRzLnRpY2tzVG9CYXJzID0gdGlja3NUb0JhcnM7XG5leHBvcnRzLm1pbGxpc1RvQmFycyA9IG1pbGxpc1RvQmFycztcbmV4cG9ydHMuZ2V0UG9zaXRpb24yID0gZ2V0UG9zaXRpb24yO1xuZXhwb3J0cy5jYWxjdWxhdGVQb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIHN1cHBvcnRlZFR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlJyxcbiAgICBzdXBwb3J0ZWRSZXR1cm5UeXBlcyA9ICdiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIGFsbCcsXG4gICAgZmxvb3IgPSBNYXRoLmZsb29yLFxuICAgIHJvdW5kID0gTWF0aC5yb3VuZDtcblxudmFyXG4vL2xvY2FsXG5icG0gPSB2b2lkIDAsXG4gICAgbm9taW5hdG9yID0gdm9pZCAwLFxuICAgIGRlbm9taW5hdG9yID0gdm9pZCAwLFxuICAgIHRpY2tzUGVyQmVhdCA9IHZvaWQgMCxcbiAgICB0aWNrc1BlckJhciA9IHZvaWQgMCxcbiAgICB0aWNrc1BlclNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICBtaWxsaXNQZXJUaWNrID0gdm9pZCAwLFxuICAgIHNlY29uZHNQZXJUaWNrID0gdm9pZCAwLFxuICAgIG51bVNpeHRlZW50aCA9IHZvaWQgMCxcbiAgICB0aWNrcyA9IHZvaWQgMCxcbiAgICBtaWxsaXMgPSB2b2lkIDAsXG4gICAgZGlmZlRpY2tzID0gdm9pZCAwLFxuICAgIGRpZmZNaWxsaXMgPSB2b2lkIDAsXG4gICAgYmFyID0gdm9pZCAwLFxuICAgIGJlYXQgPSB2b2lkIDAsXG4gICAgc2l4dGVlbnRoID0gdm9pZCAwLFxuICAgIHRpY2sgPSB2b2lkIDAsXG5cblxuLy8gIHR5cGUsXG5pbmRleCA9IHZvaWQgMCxcbiAgICByZXR1cm5UeXBlID0gJ2FsbCcsXG4gICAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcblxuZnVuY3Rpb24gZ2V0VGltZUV2ZW50KHNvbmcsIHVuaXQsIHRhcmdldCkge1xuICAvLyBmaW5kcyB0aGUgdGltZSBldmVudCB0aGF0IGNvbWVzIHRoZSBjbG9zZXN0IGJlZm9yZSB0aGUgdGFyZ2V0IHBvc2l0aW9uXG4gIHZhciB0aW1lRXZlbnRzID0gc29uZy5fdGltZUV2ZW50cztcbiAgLy9jb25zb2xlLmxvZyhzb25nLl90aW1lRXZlbnRzLCB1bml0LCB0YXJnZXQpXG5cbiAgZm9yICh2YXIgaSA9IHRpbWVFdmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgZXZlbnQgPSB0aW1lRXZlbnRzW2ldO1xuICAgIC8vY29uc29sZS5sb2codW5pdCwgdGFyZ2V0LCBldmVudClcbiAgICBpZiAoZXZlbnRbdW5pdF0gPD0gdGFyZ2V0KSB7XG4gICAgICBpbmRleCA9IGk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBtaWxsaXNUb1RpY2tzKHNvbmcsIHRhcmdldE1pbGxpcykge1xuICB2YXIgYmVvcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogdHJ1ZTtcblxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zO1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldE1pbGxpcyk7XG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzO1xufVxuXG5mdW5jdGlvbiB0aWNrc1RvTWlsbGlzKHNvbmcsIHRhcmdldFRpY2tzKSB7XG4gIHZhciBiZW9zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB0cnVlO1xuXG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3M7XG4gIGZyb21UaWNrcyhzb25nLCB0YXJnZXRUaWNrcyk7XG4gIHJldHVybiBtaWxsaXM7XG59XG5cbmZ1bmN0aW9uIGJhcnNUb01pbGxpcyhzb25nLCBwb3NpdGlvbiwgYmVvcykge1xuICAvLyBiZW9zID0gYmV5b25kRW5kT2ZTb25nXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXQnLFxuICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICByZXN1bHQ6ICdtaWxsaXMnLFxuICAgIGJlb3M6IGJlb3NcbiAgfSk7XG4gIHJldHVybiBtaWxsaXM7XG59XG5cbmZ1bmN0aW9uIGJhcnNUb1RpY2tzKHNvbmcsIHBvc2l0aW9uLCBiZW9zKSB7XG4gIC8vIGJlb3MgPSBiZXlvbmRFbmRPZlNvbmdcbiAgY2FsY3VsYXRlUG9zaXRpb24oc29uZywge1xuICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICByZXN1bHQ6ICd0aWNrcycsXG4gICAgYmVvczogYmVvc1xuICB9KTtcbiAgLy9yZXR1cm4gcm91bmQodGlja3MpO1xuICByZXR1cm4gdGlja3M7XG59XG5cbmZ1bmN0aW9uIHRpY2tzVG9CYXJzKHNvbmcsIHRhcmdldCkge1xuICB2YXIgYmVvcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogdHJ1ZTtcblxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zO1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KTtcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJztcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpO1xufVxuXG5mdW5jdGlvbiBtaWxsaXNUb0JhcnMoc29uZywgdGFyZ2V0KSB7XG4gIHZhciBiZW9zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB0cnVlO1xuXG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3M7XG4gIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0KTtcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJztcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpO1xufVxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciBtaWxsaXMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0TWlsbGlzLCBldmVudCkge1xuICB2YXIgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmIChiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKSB7XG4gICAgaWYgKHRhcmdldE1pbGxpcyA+IGxhc3RFdmVudC5taWxsaXMpIHtcbiAgICAgIHRhcmdldE1pbGxpcyA9IGxhc3RFdmVudC5taWxsaXM7XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnbWlsbGlzJywgdGFyZ2V0TWlsbGlzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IG1pbGxpcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmIChldmVudC5taWxsaXMgPT09IHRhcmdldE1pbGxpcykge1xuICAgIGRpZmZNaWxsaXMgPSAwO1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gIH0gZWxzZSB7XG4gICAgZGlmZk1pbGxpcyA9IHRhcmdldE1pbGxpcyAtIGV2ZW50Lm1pbGxpcztcbiAgICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgcmV0dXJuIHRpY2tzO1xufVxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciB0aWNrcyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbVRpY2tzKHNvbmcsIHRhcmdldFRpY2tzLCBldmVudCkge1xuICB2YXIgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmIChiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKSB7XG4gICAgaWYgKHRhcmdldFRpY2tzID4gbGFzdEV2ZW50LnRpY2tzKSB7XG4gICAgICB0YXJnZXRUaWNrcyA9IGxhc3RFdmVudC50aWNrcztcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICd0aWNrcycsIHRhcmdldFRpY2tzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IHRpY2tzLCBjYWxjdWxhdGUgdGhlIGRpZmZcbiAgaWYgKGV2ZW50LnRpY2tzID09PSB0YXJnZXRUaWNrcykge1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gICAgZGlmZk1pbGxpcyA9IDA7XG4gIH0gZWxzZSB7XG4gICAgZGlmZlRpY2tzID0gdGFyZ2V0VGlja3MgLSB0aWNrcztcbiAgICBkaWZmTWlsbGlzID0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIHRpY2tzICs9IGRpZmZUaWNrcztcbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG5cbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgYmFycyBhbmQgYmVhdHMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21CYXJzKHNvbmcsIHRhcmdldEJhciwgdGFyZ2V0QmVhdCwgdGFyZ2V0U2l4dGVlbnRoLCB0YXJnZXRUaWNrKSB7XG4gIHZhciBldmVudCA9IGFyZ3VtZW50cy5sZW5ndGggPiA1ICYmIGFyZ3VtZW50c1s1XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzVdIDogbnVsbDtcblxuICAvL2NvbnNvbGUudGltZSgnZnJvbUJhcnMnKTtcbiAgdmFyIGkgPSAwLFxuICAgICAgZGlmZkJhcnMgPSB2b2lkIDAsXG4gICAgICBkaWZmQmVhdHMgPSB2b2lkIDAsXG4gICAgICBkaWZmU2l4dGVlbnRoID0gdm9pZCAwLFxuICAgICAgZGlmZlRpY2sgPSB2b2lkIDAsXG4gICAgICBsYXN0RXZlbnQgPSBzb25nLl9sYXN0RXZlbnQ7XG5cbiAgaWYgKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2UpIHtcbiAgICBpZiAodGFyZ2V0QmFyID4gbGFzdEV2ZW50LmJhcikge1xuICAgICAgdGFyZ2V0QmFyID0gbGFzdEV2ZW50LmJhcjtcbiAgICB9XG4gIH1cblxuICBpZiAoZXZlbnQgPT09IG51bGwpIHtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnYmFyJywgdGFyZ2V0QmFyKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvL2NvcnJlY3Qgd3JvbmcgcG9zaXRpb24gZGF0YSwgZm9yIGluc3RhbmNlOiAnMywzLDIsNzg4JyBiZWNvbWVzICczLDQsNCwwNjgnIGluIGEgNC80IG1lYXN1cmUgYXQgUFBRIDQ4MFxuICB3aGlsZSAodGFyZ2V0VGljayA+PSB0aWNrc1BlclNpeHRlZW50aCkge1xuICAgIHRhcmdldFNpeHRlZW50aCsrO1xuICAgIHRhcmdldFRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gIH1cblxuICB3aGlsZSAodGFyZ2V0U2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKSB7XG4gICAgdGFyZ2V0QmVhdCsrO1xuICAgIHRhcmdldFNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gIH1cblxuICB3aGlsZSAodGFyZ2V0QmVhdCA+IG5vbWluYXRvcikge1xuICAgIHRhcmdldEJhcisrO1xuICAgIHRhcmdldEJlYXQgLT0gbm9taW5hdG9yO1xuICB9XG5cbiAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ2JhcicsIHRhcmdldEJhciwgaW5kZXgpO1xuICBmb3IgKGkgPSBpbmRleDsgaSA+PSAwOyBpLS0pIHtcbiAgICBldmVudCA9IHNvbmcuX3RpbWVFdmVudHNbaV07XG4gICAgaWYgKGV2ZW50LmJhciA8PSB0YXJnZXRCYXIpIHtcbiAgICAgIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlc1xuICBkaWZmVGljayA9IHRhcmdldFRpY2sgLSB0aWNrO1xuICBkaWZmU2l4dGVlbnRoID0gdGFyZ2V0U2l4dGVlbnRoIC0gc2l4dGVlbnRoO1xuICBkaWZmQmVhdHMgPSB0YXJnZXRCZWF0IC0gYmVhdDtcbiAgZGlmZkJhcnMgPSB0YXJnZXRCYXIgLSBiYXI7IC8vYmFyIGlzIGFsd2F5cyBsZXNzIHRoZW4gb3IgZXF1YWwgdG8gdGFyZ2V0QmFyLCBzbyBkaWZmQmFycyBpcyBhbHdheXMgPj0gMFxuXG4gIC8vY29uc29sZS5sb2coJ2RpZmYnLGRpZmZCYXJzLGRpZmZCZWF0cyxkaWZmU2l4dGVlbnRoLGRpZmZUaWNrKTtcbiAgLy9jb25zb2xlLmxvZygnbWlsbGlzJyxtaWxsaXMsdGlja3NQZXJCYXIsdGlja3NQZXJCZWF0LHRpY2tzUGVyU2l4dGVlbnRoLG1pbGxpc1BlclRpY2spO1xuXG4gIC8vIGNvbnZlcnQgZGlmZmVyZW5jZXMgdG8gbWlsbGlzZWNvbmRzIGFuZCB0aWNrc1xuICBkaWZmTWlsbGlzID0gZGlmZkJhcnMgKiB0aWNrc1BlckJhciAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gZGlmZkJlYXRzICogdGlja3NQZXJCZWF0ICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSBkaWZmU2l4dGVlbnRoICogdGlja3NQZXJTaXh0ZWVudGggKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IGRpZmZUaWNrICogbWlsbGlzUGVyVGljaztcbiAgZGlmZlRpY2tzID0gZGlmZk1pbGxpcyAvIG1pbGxpc1BlclRpY2s7XG4gIC8vY29uc29sZS5sb2coZGlmZkJhcnMsIHRpY2tzUGVyQmFyLCBtaWxsaXNQZXJUaWNrLCBkaWZmTWlsbGlzLCBkaWZmVGlja3MpO1xuXG4gIC8vIHNldCBhbGwgY3VycmVudCBwb3NpdGlvbiBkYXRhXG4gIGJhciA9IHRhcmdldEJhcjtcbiAgYmVhdCA9IHRhcmdldEJlYXQ7XG4gIHNpeHRlZW50aCA9IHRhcmdldFNpeHRlZW50aDtcbiAgdGljayA9IHRhcmdldFRpY2s7XG4gIC8vY29uc29sZS5sb2codGljaywgdGFyZ2V0VGljaylcblxuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcbiAgLy9jb25zb2xlLmxvZyh0YXJnZXRCYXIsIHRhcmdldEJlYXQsIHRhcmdldFNpeHRlZW50aCwgdGFyZ2V0VGljaywgJyAtPiAnLCBtaWxsaXMpO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgLy9jb25zb2xlLnRpbWVFbmQoJ2Zyb21CYXJzJyk7XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpIHtcbiAgLy8gc3ByZWFkIHRoZSBkaWZmZXJlbmNlIGluIHRpY2sgb3ZlciBiYXJzLCBiZWF0cyBhbmQgc2l4dGVlbnRoXG4gIHZhciB0bXAgPSByb3VuZChkaWZmVGlja3MpO1xuICB3aGlsZSAodG1wID49IHRpY2tzUGVyU2l4dGVlbnRoKSB7XG4gICAgc2l4dGVlbnRoKys7XG4gICAgdG1wIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICAgIHdoaWxlIChzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpIHtcbiAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICBiZWF0Kys7XG4gICAgICB3aGlsZSAoYmVhdCA+IG5vbWluYXRvcikge1xuICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgYmFyKys7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHRpY2sgPSByb3VuZCh0bXApO1xufVxuXG4vLyBzdG9yZSBwcm9wZXJ0aWVzIG9mIGV2ZW50IGluIGxvY2FsIHNjb3BlXG5mdW5jdGlvbiBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KSB7XG5cbiAgYnBtID0gZXZlbnQuYnBtO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG4gIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIC8vY29uc29sZS5sb2coYnBtLCBldmVudC50eXBlKTtcbiAgLy9jb25zb2xlLmxvZygndGlja3MnLCB0aWNrcywgJ21pbGxpcycsIG1pbGxpcywgJ2JhcicsIGJhcik7XG59XG5cbmZ1bmN0aW9uIGdldFBvc2l0aW9uRGF0YShzb25nKSB7XG4gIHZhciB0aW1lRGF0YSA9IHZvaWQgMCxcbiAgICAgIHBvc2l0aW9uRGF0YSA9IHt9O1xuXG4gIHN3aXRjaCAocmV0dXJuVHlwZSkge1xuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIC8vcG9zaXRpb25EYXRhLm1pbGxpcyA9IG1pbGxpcztcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXMgPSByb3VuZChtaWxsaXMgKiAxMDAwKSAvIDEwMDA7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUm91bmRlZCA9IHJvdW5kKG1pbGxpcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzID0gdGlja3M7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3MgPSByb3VuZCh0aWNrcyk7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrc1Vucm91bmRlZCA9IHRpY2tzO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyID0gYmFyO1xuICAgICAgcG9zaXRpb25EYXRhLmJlYXQgPSBiZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrID0gdGljaztcbiAgICAgIC8vcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIGdldFRpY2tBc1N0cmluZyh0aWNrKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICB0aW1lRGF0YSA9ICgwLCBfdXRpbC5nZXROaWNlVGltZSkobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhbGwnOlxuICAgICAgLy8gbWlsbGlzXG4gICAgICAvL3Bvc2l0aW9uRGF0YS5taWxsaXMgPSBtaWxsaXM7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzID0gcm91bmQobWlsbGlzICogMTAwMCkgLyAxMDAwO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1JvdW5kZWQgPSByb3VuZChtaWxsaXMpO1xuXG4gICAgICAvLyB0aWNrc1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3MgPSB0aWNrcztcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrcyA9IHJvdW5kKHRpY2tzKTtcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzVW5yb3VuZGVkID0gdGlja3M7XG5cbiAgICAgIC8vIGJhcnNiZWF0c1xuICAgICAgcG9zaXRpb25EYXRhLmJhciA9IGJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5iZWF0ID0gYmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEudGljayA9IHRpY2s7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGlja0FzU3RyaW5nO1xuICAgICAgcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyBnZXRUaWNrQXNTdHJpbmcodGljayk7XG5cbiAgICAgIC8vIHRpbWVcbiAgICAgIHRpbWVEYXRhID0gKDAsIF91dGlsLmdldE5pY2VUaW1lKShtaWxsaXMpO1xuICAgICAgcG9zaXRpb25EYXRhLmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG5cbiAgICAgIC8vIGV4dHJhIGRhdGFcbiAgICAgIHBvc2l0aW9uRGF0YS5icG0gPSByb3VuZChicG0gKiBzb25nLnBsYXliYWNrU3BlZWQsIDMpO1xuICAgICAgcG9zaXRpb25EYXRhLm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuXG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJTaXh0ZWVudGggPSB0aWNrc1BlclNpeHRlZW50aDtcblxuICAgICAgcG9zaXRpb25EYXRhLm51bVNpeHRlZW50aCA9IG51bVNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuXG4gICAgICAvLyB1c2UgdGlja3MgdG8gbWFrZSB0ZW1wbyBjaGFuZ2VzIHZpc2libGUgYnkgYSBmYXN0ZXIgbW92aW5nIHBsYXloZWFkXG4gICAgICBwb3NpdGlvbkRhdGEucGVyY2VudGFnZSA9IHRpY2tzIC8gc29uZy5fZHVyYXRpb25UaWNrcztcbiAgICAgIC8vcG9zaXRpb25EYXRhLnBlcmNlbnRhZ2UgPSBtaWxsaXMgLyBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHBvc2l0aW9uRGF0YTtcbn1cblxuZnVuY3Rpb24gZ2V0VGlja0FzU3RyaW5nKHQpIHtcbiAgaWYgKHQgPT09IDApIHtcbiAgICB0ID0gJzAwMCc7XG4gIH0gZWxzZSBpZiAodCA8IDEwKSB7XG4gICAgdCA9ICcwMCcgKyB0O1xuICB9IGVsc2UgaWYgKHQgPCAxMDApIHtcbiAgICB0ID0gJzAnICsgdDtcbiAgfVxuICByZXR1cm4gdDtcbn1cblxuLy8gdXNlZCBieSBwbGF5aGVhZFxuZnVuY3Rpb24gZ2V0UG9zaXRpb24yKHNvbmcsIHVuaXQsIHRhcmdldCwgdHlwZSwgZXZlbnQpIHtcbiAgaWYgKHVuaXQgPT09ICdtaWxsaXMnKSB7XG4gICAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQsIGV2ZW50KTtcbiAgfSBlbHNlIGlmICh1bml0ID09PSAndGlja3MnKSB7XG4gICAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldCwgZXZlbnQpO1xuICB9XG4gIHJldHVyblR5cGUgPSB0eXBlO1xuICBpZiAocmV0dXJuVHlwZSA9PT0gJ2FsbCcpIHtcbiAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgfVxuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xufVxuXG4vLyBpbXByb3ZlZCB2ZXJzaW9uIG9mIGdldFBvc2l0aW9uXG5mdW5jdGlvbiBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCBzZXR0aW5ncykge1xuICB2YXIgdHlwZSA9IHNldHRpbmdzLnR5cGUsXG4gICAgICB0YXJnZXQgPSBzZXR0aW5ncy50YXJnZXQsXG4gICAgICBfc2V0dGluZ3MkcmVzdWx0ID0gc2V0dGluZ3MucmVzdWx0LFxuICAgICAgcmVzdWx0ID0gX3NldHRpbmdzJHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gJ2FsbCcgOiBfc2V0dGluZ3MkcmVzdWx0LFxuICAgICAgX3NldHRpbmdzJGJlb3MgPSBzZXR0aW5ncy5iZW9zLFxuICAgICAgYmVvcyA9IF9zZXR0aW5ncyRiZW9zID09PSB1bmRlZmluZWQgPyB0cnVlIDogX3NldHRpbmdzJGJlb3MsXG4gICAgICBfc2V0dGluZ3Mkc25hcCA9IHNldHRpbmdzLnNuYXAsXG4gICAgICBzbmFwID0gX3NldHRpbmdzJHNuYXAgPT09IHVuZGVmaW5lZCA/IC0xIDogX3NldHRpbmdzJHNuYXA7XG5cblxuICBpZiAoc3VwcG9ydGVkUmV0dXJuVHlwZXMuaW5kZXhPZihyZXN1bHQpID09PSAtMSkge1xuICAgIGNvbnNvbGUud2FybigndW5zdXBwb3J0ZWQgcmV0dXJuIHR5cGUsIFxcJ2FsbFxcJyB1c2VkIGluc3RlYWQgb2YgXFwnJyArIHJlc3VsdCArICdcXCcnKTtcbiAgICByZXN1bHQgPSAnYWxsJztcbiAgfVxuXG4gIHJldHVyblR5cGUgPSByZXN1bHQ7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3M7XG5cbiAgaWYgKHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgY29uc29sZS5lcnJvcigndW5zdXBwb3J0ZWQgdHlwZSAnICsgdHlwZSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3dpdGNoICh0eXBlKSB7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICB2YXIgX3RhcmdldCA9IF9zbGljZWRUb0FycmF5KHRhcmdldCwgNCksXG4gICAgICAgICAgX3RhcmdldCQgPSBfdGFyZ2V0WzBdLFxuICAgICAgICAgIHRhcmdldGJhciA9IF90YXJnZXQkID09PSB1bmRlZmluZWQgPyAxIDogX3RhcmdldCQsXG4gICAgICAgICAgX3RhcmdldCQyID0gX3RhcmdldFsxXSxcbiAgICAgICAgICB0YXJnZXRiZWF0ID0gX3RhcmdldCQyID09PSB1bmRlZmluZWQgPyAxIDogX3RhcmdldCQyLFxuICAgICAgICAgIF90YXJnZXQkMyA9IF90YXJnZXRbMl0sXG4gICAgICAgICAgdGFyZ2V0c2l4dGVlbnRoID0gX3RhcmdldCQzID09PSB1bmRlZmluZWQgPyAxIDogX3RhcmdldCQzLFxuICAgICAgICAgIF90YXJnZXQkNCA9IF90YXJnZXRbM10sXG4gICAgICAgICAgdGFyZ2V0dGljayA9IF90YXJnZXQkNCA9PT0gdW5kZWZpbmVkID8gMCA6IF90YXJnZXQkNDtcbiAgICAgIC8vY29uc29sZS5sb2codGFyZ2V0YmFyLCB0YXJnZXRiZWF0LCB0YXJnZXRzaXh0ZWVudGgsIHRhcmdldHRpY2spXG5cblxuICAgICAgZnJvbUJhcnMoc29uZywgdGFyZ2V0YmFyLCB0YXJnZXRiZWF0LCB0YXJnZXRzaXh0ZWVudGgsIHRhcmdldHRpY2spO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAgdmFyIF90YXJnZXQyID0gX3NsaWNlZFRvQXJyYXkodGFyZ2V0LCA0KSxcbiAgICAgICAgICBfdGFyZ2V0MiQgPSBfdGFyZ2V0MlswXSxcbiAgICAgICAgICB0YXJnZXRob3VyID0gX3RhcmdldDIkID09PSB1bmRlZmluZWQgPyAwIDogX3RhcmdldDIkLFxuICAgICAgICAgIF90YXJnZXQyJDIgPSBfdGFyZ2V0MlsxXSxcbiAgICAgICAgICB0YXJnZXRtaW51dGUgPSBfdGFyZ2V0MiQyID09PSB1bmRlZmluZWQgPyAwIDogX3RhcmdldDIkMixcbiAgICAgICAgICBfdGFyZ2V0MiQzID0gX3RhcmdldDJbMl0sXG4gICAgICAgICAgdGFyZ2V0c2Vjb25kID0gX3RhcmdldDIkMyA9PT0gdW5kZWZpbmVkID8gMCA6IF90YXJnZXQyJDMsXG4gICAgICAgICAgX3RhcmdldDIkNCA9IF90YXJnZXQyWzNdLFxuICAgICAgICAgIHRhcmdldG1pbGxpc2Vjb25kID0gX3RhcmdldDIkNCA9PT0gdW5kZWZpbmVkID8gMCA6IF90YXJnZXQyJDQ7XG5cbiAgICAgIHZhciBfbWlsbGlzID0gMDtcbiAgICAgIF9taWxsaXMgKz0gdGFyZ2V0aG91ciAqIDYwICogNjAgKiAxMDAwOyAvL2hvdXJzXG4gICAgICBfbWlsbGlzICs9IHRhcmdldG1pbnV0ZSAqIDYwICogMTAwMDsgLy9taW51dGVzXG4gICAgICBfbWlsbGlzICs9IHRhcmdldHNlY29uZCAqIDEwMDA7IC8vc2Vjb25kc1xuICAgICAgX21pbGxpcyArPSB0YXJnZXRtaWxsaXNlY29uZDsgLy9taWxsaXNlY29uZHNcblxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBfbWlsbGlzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldCk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICAvL2NvbnNvbGUubG9nKHNvbmcsIHRhcmdldClcbiAgICAgIGZyb21UaWNrcyhzb25nLCB0YXJnZXQpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAncGVyYyc6XG4gICAgY2FzZSAncGVyY2VudGFnZSc6XG5cbiAgICAgIC8vbWlsbGlzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgLy9mcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pbGxpcyk7XG5cbiAgICAgIHRpY2tzID0gdGFyZ2V0ICogc29uZy5fZHVyYXRpb25UaWNrczsgLy8gdGFyZ2V0IG11c3QgYmUgaW4gdGlja3MhXG4gICAgICAvL2NvbnNvbGUubG9nKHRpY2tzLCBzb25nLl9kdXJhdGlvblRpY2tzKVxuICAgICAgaWYgKHNuYXAgIT09IC0xKSB7XG4gICAgICAgIHRpY2tzID0gZmxvb3IodGlja3MgLyBzbmFwKSAqIHNuYXA7XG4gICAgICAgIC8vZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcyk7XG4gICAgICB9XG4gICAgICBmcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICB2YXIgdG1wID0gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZygnZGlmZicsIHBvc2l0aW9uWzFdIC0gdG1wLnBlcmNlbnRhZ2UpO1xuICAgICAgcmV0dXJuIHRtcDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLypcblxuLy9AcGFyYW06ICdtaWxsaXMnLCAxMDAwLCBbdHJ1ZV1cbi8vQHBhcmFtOiAndGlja3MnLCAxMDAwLCBbdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgMSwgWydhbGwnLCB0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCA2MCwgNCwgMywgMTIwLCBbJ2FsbCcsIHRydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDYwLCA0LCAzLCAxMjAsIFt0cnVlLCAnYWxsJ11cblxuZnVuY3Rpb24gY2hlY2tQb3NpdGlvbih0eXBlLCBhcmdzLCByZXR1cm5UeXBlID0gJ2FsbCcpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSB0cnVlO1xuICBjb25zb2xlLmxvZygnLS0tLT4gY2hlY2tQb3NpdGlvbjonLCBhcmdzLCB0eXBlU3RyaW5nKGFyZ3MpKTtcblxuICBpZih0eXBlU3RyaW5nKGFyZ3MpID09PSAnYXJyYXknKXtcbiAgICBsZXRcbiAgICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICAgIHBvc2l0aW9uLFxuICAgICAgaSwgYSwgcG9zaXRpb25MZW5ndGg7XG5cbiAgICB0eXBlID0gYXJnc1swXTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIFtbJ21pbGxpcycsIDMwMDBdXVxuICAgIGlmKHR5cGVTdHJpbmcoYXJnc1swXSkgPT09ICdhcnJheScpe1xuICAgICAgLy9jb25zb2xlLndhcm4oJ3RoaXMgc2hvdWxkblxcJ3QgaGFwcGVuIScpO1xuICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICB0eXBlID0gYXJnc1swXTtcbiAgICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IFt0eXBlXTtcblxuICAgIGNvbnNvbGUubG9nKCdjaGVjayBwb3NpdGlvbicsIGFyZ3MsIG51bUFyZ3MsIHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkpO1xuXG4gICAgLy9jb25zb2xlLmxvZygnYXJnJywgMCwgJy0+JywgdHlwZSk7XG5cbiAgICBpZihzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpICE9PSAtMSl7XG4gICAgICBmb3IoaSA9IDE7IGkgPCBudW1BcmdzOyBpKyspe1xuICAgICAgICBhID0gYXJnc1tpXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnYXJnJywgaSwgJy0+JywgYSk7XG4gICAgICAgIGlmKGEgPT09IHRydWUgfHwgYSA9PT0gZmFsc2Upe1xuICAgICAgICAgIGJleW9uZEVuZE9mU29uZyA9IGE7XG4gICAgICAgIH1lbHNlIGlmKGlzTmFOKGEpKXtcbiAgICAgICAgICBpZihzdXBwb3J0ZWRSZXR1cm5UeXBlcy5pbmRleE9mKGEpICE9PSAtMSl7XG4gICAgICAgICAgICByZXR1cm5UeXBlID0gYTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICBwb3NpdGlvbi5wdXNoKGEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL2NoZWNrIG51bWJlciBvZiBhcmd1bWVudHMgLT4gZWl0aGVyIDEgbnVtYmVyIG9yIDQgbnVtYmVycyBpbiBwb3NpdGlvbiwgZS5nLiBbJ2JhcnNiZWF0cycsIDFdIG9yIFsnYmFyc2JlYXRzJywgMSwgMSwgMSwgMF0sXG4gICAgICAvLyBvciBbJ3BlcmMnLCAwLjU2LCBudW1iZXJPZlRpY2tzVG9TbmFwVG9dXG4gICAgICBwb3NpdGlvbkxlbmd0aCA9IHBvc2l0aW9uLmxlbmd0aDtcbiAgICAgIGlmKHBvc2l0aW9uTGVuZ3RoICE9PSAyICYmIHBvc2l0aW9uTGVuZ3RoICE9PSAzICYmIHBvc2l0aW9uTGVuZ3RoICE9PSA1KXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyhwb3NpdGlvbiwgcmV0dXJuVHlwZSwgYmV5b25kRW5kT2ZTb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9zaXRpb24oc29uZywgdHlwZSwgYXJncyl7XG4gIC8vY29uc29sZS5sb2coJ2dldFBvc2l0aW9uJywgYXJncyk7XG5cbiAgaWYodHlwZW9mIGFyZ3MgPT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4ge1xuICAgICAgbWlsbGlzOiAwXG4gICAgfVxuICB9XG5cbiAgbGV0IHBvc2l0aW9uID0gY2hlY2tQb3NpdGlvbih0eXBlLCBhcmdzKSxcbiAgICBtaWxsaXMsIHRtcCwgc25hcDtcblxuXG4gIGlmKHBvc2l0aW9uID09PSBmYWxzZSl7XG4gICAgZXJyb3IoJ3dyb25nIHBvc2l0aW9uIGRhdGEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzd2l0Y2godHlwZSl7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBmcm9tQmFycyhzb25nLCBwb3NpdGlvblsxXSwgcG9zaXRpb25bMl0sIHBvc2l0aW9uWzNdLCBwb3NpdGlvbls0XSk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICAvLyBjYWxjdWxhdGUgbWlsbGlzIG91dCBvZiB0aW1lIGFycmF5OiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG4gICAgICBtaWxsaXMgPSAwO1xuICAgICAgdG1wID0gcG9zaXRpb25bMV0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiA2MCAqIDYwICogMTAwMDsgLy9ob3Vyc1xuICAgICAgdG1wID0gcG9zaXRpb25bMl0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiA2MCAqIDEwMDA7IC8vbWludXRlc1xuICAgICAgdG1wID0gcG9zaXRpb25bM10gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiAxMDAwOyAvL3NlY29uZHNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzRdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wOyAvL21pbGxpc2Vjb25kc1xuXG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBwb3NpdGlvblsxXSk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICBmcm9tVGlja3Moc29uZywgcG9zaXRpb25bMV0pO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAncGVyYyc6XG4gICAgY2FzZSAncGVyY2VudGFnZSc6XG4gICAgICBzbmFwID0gcG9zaXRpb25bMl07XG5cbiAgICAgIC8vbWlsbGlzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgLy9mcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pbGxpcyk7XG5cbiAgICAgIHRpY2tzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uVGlja3M7XG4gICAgICBpZihzbmFwICE9PSB1bmRlZmluZWQpe1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzL3NuYXApICogc25hcDtcbiAgICAgICAgLy9mcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRpY2tzKTtcbiAgICAgIH1cbiAgICAgIGZyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHRtcCA9IGdldFBvc2l0aW9uRGF0YShzb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXA7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4qLyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuRGVsYXkgPSBleHBvcnRzLkNvbnZvbHV0aW9uUmV2ZXJiID0gZXhwb3J0cy5TYW1wbGVyID0gZXhwb3J0cy5TaW1wbGVTeW50aCA9IGV4cG9ydHMuSW5zdHJ1bWVudCA9IGV4cG9ydHMuUGFydCA9IGV4cG9ydHMuVHJhY2sgPSBleHBvcnRzLlNvbmcgPSBleHBvcnRzLk1JRElOb3RlID0gZXhwb3J0cy5NSURJRXZlbnQgPSBleHBvcnRzLmdldE5vdGVEYXRhID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0c0J5SWQgPSBleHBvcnRzLmdldE1JRElJbnB1dHNCeUlkID0gZXhwb3J0cy5nZXRNSURJT3V0cHV0SWRzID0gZXhwb3J0cy5nZXRNSURJSW5wdXRJZHMgPSBleHBvcnRzLmdldE1JRElPdXRwdXRzID0gZXhwb3J0cy5nZXRNSURJSW5wdXRzID0gZXhwb3J0cy5nZXRNSURJQWNjZXNzID0gZXhwb3J0cy5zZXRNYXN0ZXJWb2x1bWUgPSBleHBvcnRzLmdldE1hc3RlclZvbHVtZSA9IGV4cG9ydHMuZ2V0QXVkaW9Db250ZXh0ID0gZXhwb3J0cy5wYXJzZU1JRElGaWxlID0gZXhwb3J0cy5wYXJzZVNhbXBsZXMgPSBleHBvcnRzLk1JRElFdmVudFR5cGVzID0gZXhwb3J0cy5nZXRTZXR0aW5ncyA9IGV4cG9ydHMudXBkYXRlU2V0dGluZ3MgPSBleHBvcnRzLmdldEdNSW5zdHJ1bWVudHMgPSBleHBvcnRzLmdldEluc3RydW1lbnRzID0gZXhwb3J0cy5pbml0ID0gZXhwb3J0cy52ZXJzaW9uID0gdW5kZWZpbmVkO1xuXG52YXIgX3NldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpO1xuXG52YXIgX25vdGUgPSByZXF1aXJlKCcuL25vdGUnKTtcblxudmFyIF9taWRpX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpX2V2ZW50Jyk7XG5cbnZhciBfbWlkaV9ub3RlID0gcmVxdWlyZSgnLi9taWRpX25vdGUnKTtcblxudmFyIF9wYXJ0ID0gcmVxdWlyZSgnLi9wYXJ0Jyk7XG5cbnZhciBfdHJhY2sgPSByZXF1aXJlKCcuL3RyYWNrJyk7XG5cbnZhciBfc29uZyA9IHJlcXVpcmUoJy4vc29uZycpO1xuXG52YXIgX2luc3RydW1lbnQgPSByZXF1aXJlKCcuL2luc3RydW1lbnQnKTtcblxudmFyIF9zYW1wbGVyID0gcmVxdWlyZSgnLi9zYW1wbGVyJyk7XG5cbnZhciBfc2ltcGxlX3N5bnRoID0gcmVxdWlyZSgnLi9zaW1wbGVfc3ludGgnKTtcblxudmFyIF9jb252b2x1dGlvbl9yZXZlcmIgPSByZXF1aXJlKCcuL2NvbnZvbHV0aW9uX3JldmVyYicpO1xuXG52YXIgX2RlbGF5X2Z4ID0gcmVxdWlyZSgnLi9kZWxheV9meCcpO1xuXG52YXIgX21pZGlmaWxlID0gcmVxdWlyZSgnLi9taWRpZmlsZScpO1xuXG52YXIgX2luaXQgPSByZXF1aXJlKCcuL2luaXQnKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfaW5pdF9taWRpID0gcmVxdWlyZSgnLi9pbml0X21pZGknKTtcblxudmFyIF9wYXJzZV9hdWRpbyA9IHJlcXVpcmUoJy4vcGFyc2VfYXVkaW8nKTtcblxudmFyIF9jb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG52YXIgX2V2ZW50bGlzdGVuZXIgPSByZXF1aXJlKCcuL2V2ZW50bGlzdGVuZXInKTtcblxudmFyIHZlcnNpb24gPSAnMS4wLjAtYmV0YTM1JztcblxudmFyIGdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uIGdldEF1ZGlvQ29udGV4dCgpIHtcbiAgcmV0dXJuIF9pbml0X2F1ZGlvLmNvbnRleHQ7XG59O1xuXG52YXIgcWFtYmkgPSB7XG4gIHZlcnNpb246IHZlcnNpb24sXG5cbiAgLy8gZnJvbSAuL3NldHRpbmdzXG4gIHVwZGF0ZVNldHRpbmdzOiBfc2V0dGluZ3MudXBkYXRlU2V0dGluZ3MsXG4gIGdldFNldHRpbmdzOiBfc2V0dGluZ3MuZ2V0U2V0dGluZ3MsXG5cbiAgLy8gZnJvbSAuL25vdGVcbiAgZ2V0Tm90ZURhdGE6IF9ub3RlLmdldE5vdGVEYXRhLFxuXG4gIC8vIGZyb20gLi9pbml0XG4gIGluaXQ6IF9pbml0LmluaXQsXG5cbiAgLy8gZnJvbSAuL3NldHRpbmdzXG4gIHNldEJ1ZmZlclRpbWU6IF9zZXR0aW5ncy5zZXRCdWZmZXJUaW1lLFxuXG4gIC8vIGZyb20gLi9jb25zdGFudHNcbiAgTUlESUV2ZW50VHlwZXM6IF9jb25zdGFudHMuTUlESUV2ZW50VHlwZXMsXG5cbiAgLy8gZnJvbSAuL3V0aWxcbiAgcGFyc2VTYW1wbGVzOiBfcGFyc2VfYXVkaW8ucGFyc2VTYW1wbGVzLFxuXG4gIC8vIGZyb20gLi9taWRpZmlsZVxuICBwYXJzZU1JRElGaWxlOiBfbWlkaWZpbGUucGFyc2VNSURJRmlsZSxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQ6IGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lOiBfaW5pdF9hdWRpby5nZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZTogX2luaXRfYXVkaW8uc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3M6IF9pbml0X21pZGkuZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0czogX2luaXRfbWlkaS5nZXRNSURJSW5wdXRzLFxuICBnZXRNSURJT3V0cHV0czogX2luaXRfbWlkaS5nZXRNSURJT3V0cHV0cyxcbiAgZ2V0TUlESUlucHV0SWRzOiBfaW5pdF9taWRpLmdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkczogX2luaXRfbWlkaS5nZXRNSURJT3V0cHV0SWRzLFxuICBnZXRNSURJSW5wdXRzQnlJZDogX2luaXRfbWlkaS5nZXRNSURJSW5wdXRzQnlJZCxcbiAgZ2V0TUlESU91dHB1dHNCeUlkOiBfaW5pdF9taWRpLmdldE1JRElPdXRwdXRzQnlJZCxcblxuICBnZXRJbnN0cnVtZW50czogX3NldHRpbmdzLmdldEluc3RydW1lbnRzLFxuICBnZXRHTUluc3RydW1lbnRzOiBfc2V0dGluZ3MuZ2V0R01JbnN0cnVtZW50cyxcblxuICBhZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuICgwLCBfZXZlbnRsaXN0ZW5lci5hZGRFdmVudExpc3RlbmVyKSh0eXBlLCBjYWxsYmFjayk7XG4gIH0sXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpIHtcbiAgICAoMCwgX2V2ZW50bGlzdGVuZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcikodHlwZSwgaWQpO1xuICB9LFxuXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgTUlESUV2ZW50OiBfbWlkaV9ldmVudC5NSURJRXZlbnQsXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBNSURJTm90ZTogX21pZGlfbm90ZS5NSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBTb25nOiBfc29uZy5Tb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBUcmFjazogX3RyYWNrLlRyYWNrLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIFBhcnQ6IF9wYXJ0LlBhcnQsXG5cbiAgLy8gZnJvbSAuL2luc3RydW1lbnRcbiAgSW5zdHJ1bWVudDogX2luc3RydW1lbnQuSW5zdHJ1bWVudCxcblxuICAvLyBmcm9tIC4vc2ltcGxlX3N5bnRoXG4gIFNpbXBsZVN5bnRoOiBfc2ltcGxlX3N5bnRoLlNpbXBsZVN5bnRoLFxuXG4gIC8vIGZyb20gLi9zYW1wbGVyXG4gIFNhbXBsZXI6IF9zYW1wbGVyLlNhbXBsZXIsXG5cbiAgLy8gZnJvbSAuL2NvbnZvbHV0aW9uX3JldmVyYlxuICBDb252b2x1dGlvblJldmVyYjogX2NvbnZvbHV0aW9uX3JldmVyYi5Db252b2x1dGlvblJldmVyYixcblxuICAvLyBmcm9tIC4vZGVsYXlfZnhcbiAgRGVsYXk6IF9kZWxheV9meC5EZWxheSxcblxuICBsb2c6IGZ1bmN0aW9uIGxvZyhpZCkge1xuICAgIHN3aXRjaCAoaWQpIHtcbiAgICAgIGNhc2UgJ2Z1bmN0aW9ucyc6XG4gICAgICAgIGNvbnNvbGUubG9nKCdmdW5jdGlvbnM6XFxuICAgICAgICAgIGdldEF1ZGlvQ29udGV4dFxcbiAgICAgICAgICBnZXRNYXN0ZXJWb2x1bWVcXG4gICAgICAgICAgc2V0TWFzdGVyVm9sdW1lXFxuICAgICAgICAgIGdldE1JRElBY2Nlc3NcXG4gICAgICAgICAgZ2V0TUlESUlucHV0c1xcbiAgICAgICAgICBnZXRNSURJT3V0cHV0c1xcbiAgICAgICAgICBnZXRNSURJSW5wdXRJZHNcXG4gICAgICAgICAgZ2V0TUlESU91dHB1dElkc1xcbiAgICAgICAgICBnZXRNSURJSW5wdXRzQnlJZFxcbiAgICAgICAgICBnZXRNSURJT3V0cHV0c0J5SWRcXG4gICAgICAgICAgcGFyc2VNSURJRmlsZVxcbiAgICAgICAgICBzZXRCdWZmZXJUaW1lXFxuICAgICAgICAgIGdldEluc3RydW1lbnRzXFxuICAgICAgICAgIGdldEdNSW5zdHJ1bWVudHNcXG4gICAgICAgICcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSBxYW1iaTtcbmV4cG9ydHMudmVyc2lvbiA9IHZlcnNpb247XG5leHBvcnRzLmluaXQgPSBfaW5pdC5pbml0O1xuZXhwb3J0cy5nZXRJbnN0cnVtZW50cyA9IF9zZXR0aW5ncy5nZXRJbnN0cnVtZW50cztcbmV4cG9ydHMuZ2V0R01JbnN0cnVtZW50cyA9IF9zZXR0aW5ncy5nZXRHTUluc3RydW1lbnRzO1xuZXhwb3J0cy51cGRhdGVTZXR0aW5ncyA9IF9zZXR0aW5ncy51cGRhdGVTZXR0aW5ncztcbmV4cG9ydHMuZ2V0U2V0dGluZ3MgPSBfc2V0dGluZ3MuZ2V0U2V0dGluZ3M7XG5leHBvcnRzLk1JRElFdmVudFR5cGVzID0gX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcztcbmV4cG9ydHMucGFyc2VTYW1wbGVzID0gX3BhcnNlX2F1ZGlvLnBhcnNlU2FtcGxlcztcbmV4cG9ydHMucGFyc2VNSURJRmlsZSA9IF9taWRpZmlsZS5wYXJzZU1JRElGaWxlO1xuZXhwb3J0cy5nZXRBdWRpb0NvbnRleHQgPSBnZXRBdWRpb0NvbnRleHQ7XG5leHBvcnRzLmdldE1hc3RlclZvbHVtZSA9IF9pbml0X2F1ZGlvLmdldE1hc3RlclZvbHVtZTtcbmV4cG9ydHMuc2V0TWFzdGVyVm9sdW1lID0gX2luaXRfYXVkaW8uc2V0TWFzdGVyVm9sdW1lO1xuZXhwb3J0cy5nZXRNSURJQWNjZXNzID0gX2luaXRfbWlkaS5nZXRNSURJQWNjZXNzO1xuZXhwb3J0cy5nZXRNSURJSW5wdXRzID0gX2luaXRfbWlkaS5nZXRNSURJSW5wdXRzO1xuZXhwb3J0cy5nZXRNSURJT3V0cHV0cyA9IF9pbml0X21pZGkuZ2V0TUlESU91dHB1dHM7XG5leHBvcnRzLmdldE1JRElJbnB1dElkcyA9IF9pbml0X21pZGkuZ2V0TUlESUlucHV0SWRzO1xuZXhwb3J0cy5nZXRNSURJT3V0cHV0SWRzID0gX2luaXRfbWlkaS5nZXRNSURJT3V0cHV0SWRzO1xuZXhwb3J0cy5nZXRNSURJSW5wdXRzQnlJZCA9IF9pbml0X21pZGkuZ2V0TUlESUlucHV0c0J5SWQ7XG5leHBvcnRzLmdldE1JRElPdXRwdXRzQnlJZCA9IF9pbml0X21pZGkuZ2V0TUlESU91dHB1dHNCeUlkO1xuZXhwb3J0cy5nZXROb3RlRGF0YSA9IF9ub3RlLmdldE5vdGVEYXRhO1xuZXhwb3J0cy5NSURJRXZlbnQgPSBfbWlkaV9ldmVudC5NSURJRXZlbnQ7XG5leHBvcnRzLk1JRElOb3RlID0gX21pZGlfbm90ZS5NSURJTm90ZTtcbmV4cG9ydHMuU29uZyA9IF9zb25nLlNvbmc7XG5leHBvcnRzLlRyYWNrID0gX3RyYWNrLlRyYWNrO1xuZXhwb3J0cy5QYXJ0ID0gX3BhcnQuUGFydDtcbmV4cG9ydHMuSW5zdHJ1bWVudCA9IF9pbnN0cnVtZW50Lkluc3RydW1lbnQ7XG5leHBvcnRzLlNpbXBsZVN5bnRoID0gX3NpbXBsZV9zeW50aC5TaW1wbGVTeW50aDtcbmV4cG9ydHMuU2FtcGxlciA9IF9zYW1wbGVyLlNhbXBsZXI7XG5leHBvcnRzLkNvbnZvbHV0aW9uUmV2ZXJiID0gX2NvbnZvbHV0aW9uX3JldmVyYi5Db252b2x1dGlvblJldmVyYjtcbmV4cG9ydHMuRGVsYXkgPSBfZGVsYXlfZnguRGVsYXk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5TYW1wbGUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmV4cG9ydHMuZmFkZU91dCA9IGZhZGVPdXQ7XG5cbnZhciBfaW5pdF9hdWRpbyA9IHJlcXVpcmUoJy4vaW5pdF9hdWRpby5qcycpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFNhbXBsZSA9IGV4cG9ydHMuU2FtcGxlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTYW1wbGUoc2FtcGxlRGF0YSwgZXZlbnQpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2FtcGxlKTtcblxuICAgIHRoaXMuZXZlbnQgPSBldmVudDtcbiAgICB0aGlzLnNhbXBsZURhdGEgPSBzYW1wbGVEYXRhO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFNhbXBsZSwgW3tcbiAgICBrZXk6ICdzdGFydCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0KHRpbWUpIHtcbiAgICAgIHZhciBfc2FtcGxlRGF0YSA9IHRoaXMuc2FtcGxlRGF0YSxcbiAgICAgICAgICBzdXN0YWluU3RhcnQgPSBfc2FtcGxlRGF0YS5zdXN0YWluU3RhcnQsXG4gICAgICAgICAgc3VzdGFpbkVuZCA9IF9zYW1wbGVEYXRhLnN1c3RhaW5FbmQ7XG4gICAgICAvL2NvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZClcblxuICAgICAgaWYgKHN1c3RhaW5TdGFydCAmJiBzdXN0YWluRW5kKSB7XG4gICAgICAgIHRoaXMuc291cmNlLmxvb3AgPSB0cnVlO1xuICAgICAgICB0aGlzLnNvdXJjZS5sb29wU3RhcnQgPSBzdXN0YWluU3RhcnQ7XG4gICAgICAgIHRoaXMuc291cmNlLmxvb3BFbmQgPSBzdXN0YWluRW5kO1xuICAgICAgfVxuICAgICAgdGhpcy5zb3VyY2Uuc3RhcnQodGltZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc3RvcCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3AodGltZSwgY2IpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBfc2FtcGxlRGF0YTIgPSB0aGlzLnNhbXBsZURhdGEsXG4gICAgICAgICAgcmVsZWFzZUR1cmF0aW9uID0gX3NhbXBsZURhdGEyLnJlbGVhc2VEdXJhdGlvbixcbiAgICAgICAgICByZWxlYXNlRW52ZWxvcGUgPSBfc2FtcGxlRGF0YTIucmVsZWFzZUVudmVsb3BlLFxuICAgICAgICAgIHJlbGVhc2VFbnZlbG9wZUFycmF5ID0gX3NhbXBsZURhdGEyLnJlbGVhc2VFbnZlbG9wZUFycmF5O1xuICAgICAgLy9jb25zb2xlLmxvZyhyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZSlcblxuICAgICAgdGhpcy5zb3VyY2Uub25lbmRlZCA9IGNiO1xuXG4gICAgICBpZiAocmVsZWFzZUR1cmF0aW9uICYmIHJlbGVhc2VFbnZlbG9wZSkge1xuICAgICAgICB0aGlzLnN0YXJ0UmVsZWFzZVBoYXNlID0gdGltZTtcbiAgICAgICAgdGhpcy5yZWxlYXNlRnVuY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZmFkZU91dChfdGhpcy5vdXRwdXQsIHtcbiAgICAgICAgICAgIHJlbGVhc2VEdXJhdGlvbjogcmVsZWFzZUR1cmF0aW9uLFxuICAgICAgICAgICAgcmVsZWFzZUVudmVsb3BlOiByZWxlYXNlRW52ZWxvcGUsXG4gICAgICAgICAgICByZWxlYXNlRW52ZWxvcGVBcnJheTogcmVsZWFzZUVudmVsb3BlQXJyYXlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUgKyByZWxlYXNlRHVyYXRpb24pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc3RvcCBtb3JlIHRoYW4gb25jZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hlY2tQaGFzZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc3RvcCBtb3JlIHRoYW4gb25jZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY2hlY2tQaGFzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrUGhhc2UoKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGNvbnRleHQuY3VycmVudFRpbWUsIHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UpXG4gICAgICBpZiAoX2luaXRfYXVkaW8uY29udGV4dC5jdXJyZW50VGltZSA+PSB0aGlzLnN0YXJ0UmVsZWFzZVBoYXNlKSB7XG4gICAgICAgIHRoaXMucmVsZWFzZUZ1bmN0aW9uKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmNoZWNrUGhhc2UuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNhbXBsZTtcbn0oKTtcblxuZnVuY3Rpb24gZmFkZU91dChnYWluTm9kZSwgc2V0dGluZ3MpIHtcbiAgdmFyIG5vdyA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3VycmVudFRpbWU7XG4gIHZhciB2YWx1ZXMgPSB2b2lkIDAsXG4gICAgICBpID0gdm9pZCAwLFxuICAgICAgbWF4aSA9IHZvaWQgMDtcblxuICAvL2NvbnNvbGUubG9nKHNldHRpbmdzKVxuICB0cnkge1xuICAgIHN3aXRjaCAoc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlKSB7XG5cbiAgICAgIGNhc2UgJ2xpbmVhcic6XG4gICAgICAgIGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSwgbm93KTtcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjAsIG5vdyArIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdlcXVhbCBwb3dlcic6XG4gICAgICBjYXNlICdlcXVhbF9wb3dlcic6XG4gICAgICAgIHZhbHVlcyA9ICgwLCBfdXRpbC5nZXRFcXVhbFBvd2VyQ3VydmUpKDEwMCwgJ2ZhZGVPdXQnLCBnYWluTm9kZS5nYWluLnZhbHVlKTtcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYXJyYXknOlxuICAgICAgICBtYXhpID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXkubGVuZ3RoO1xuICAgICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1heGkpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbWF4aTsgaSsrKSB7XG4gICAgICAgICAgdmFsdWVzW2ldID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXlbaV0gKiBnYWluTm9kZS5nYWluLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVDdXJ2ZUF0VGltZSh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc2V0VmFsdWVDdXJ2ZUF0VGltZSBhbmQgbGluZWFyUmFtcFRvVmFsdWVBdFRpbWUgbW9yZSB0aGFuIG9uY2VcblxuICAgIC8vY29uc29sZS5sb2codmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAvL2NvbnNvbGUubG9nKGUsIGdhaW5Ob2RlKVxuICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5TYW1wbGVCdWZmZXIgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfc2FtcGxlID0gcmVxdWlyZSgnLi9zYW1wbGUnKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIGluc3RhbmNlSW5kZXggPSAwO1xuXG52YXIgU2FtcGxlQnVmZmVyID0gZXhwb3J0cy5TYW1wbGVCdWZmZXIgPSBmdW5jdGlvbiAoX1NhbXBsZSkge1xuICBfaW5oZXJpdHMoU2FtcGxlQnVmZmVyLCBfU2FtcGxlKTtcblxuICBmdW5jdGlvbiBTYW1wbGVCdWZmZXIoc2FtcGxlRGF0YSwgZXZlbnQpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2FtcGxlQnVmZmVyKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChTYW1wbGVCdWZmZXIuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTYW1wbGVCdWZmZXIpKS5jYWxsKHRoaXMsIHNhbXBsZURhdGEsIGV2ZW50KSk7XG5cbiAgICBfdGhpcy5pZCA9IF90aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIGlmIChfdGhpcy5zYW1wbGVEYXRhID09PSAtMSB8fCB0eXBlb2YgX3RoaXMuc2FtcGxlRGF0YS5idWZmZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBjcmVhdGUgZHVtbXkgc291cmNlXG4gICAgICBfdGhpcy5zb3VyY2UgPSB7XG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbiBzdGFydCgpIHt9LFxuICAgICAgICBzdG9wOiBmdW5jdGlvbiBzdG9wKCkge30sXG4gICAgICAgIGNvbm5lY3Q6IGZ1bmN0aW9uIGNvbm5lY3QoKSB7fVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgX3RoaXMuc291cmNlID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlRGF0YSlcbiAgICAgIF90aGlzLnNvdXJjZS5idWZmZXIgPSBzYW1wbGVEYXRhLmJ1ZmZlcjtcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5zb3VyY2UuYnVmZmVyKVxuICAgIH1cbiAgICBfdGhpcy5vdXRwdXQgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBfdGhpcy52b2x1bWUgPSBldmVudC5kYXRhMiAvIDEyNztcbiAgICBfdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IF90aGlzLnZvbHVtZTtcbiAgICBfdGhpcy5zb3VyY2UuY29ubmVjdChfdGhpcy5vdXRwdXQpO1xuICAgIC8vdGhpcy5vdXRwdXQuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIC8vQG92ZXJyaWRlXG5cblxuICBfY3JlYXRlQ2xhc3MoU2FtcGxlQnVmZmVyLCBbe1xuICAgIGtleTogJ3N0YXJ0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RhcnQodGltZSkge1xuICAgICAgdmFyIF9zYW1wbGVEYXRhID0gdGhpcy5zYW1wbGVEYXRhLFxuICAgICAgICAgIHN1c3RhaW5TdGFydCA9IF9zYW1wbGVEYXRhLnN1c3RhaW5TdGFydCxcbiAgICAgICAgICBzdXN0YWluRW5kID0gX3NhbXBsZURhdGEuc3VzdGFpbkVuZCxcbiAgICAgICAgICBzZWdtZW50U3RhcnQgPSBfc2FtcGxlRGF0YS5zZWdtZW50U3RhcnQsXG4gICAgICAgICAgc2VnbWVudER1cmF0aW9uID0gX3NhbXBsZURhdGEuc2VnbWVudER1cmF0aW9uO1xuICAgICAgLy9jb25zb2xlLmxvZyhzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmQsIHNlZ21lbnRTdGFydCwgc2VnbWVudER1cmF0aW9uKVxuXG4gICAgICBpZiAoc3VzdGFpblN0YXJ0ICYmIHN1c3RhaW5FbmQpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UubG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuc291cmNlLmxvb3BTdGFydCA9IHN1c3RhaW5TdGFydDtcbiAgICAgICAgdGhpcy5zb3VyY2UubG9vcEVuZCA9IHN1c3RhaW5FbmQ7XG4gICAgICB9XG4gICAgICBpZiAoc2VnbWVudFN0YXJ0ICYmIHNlZ21lbnREdXJhdGlvbikge1xuICAgICAgICBjb25zb2xlLmxvZyhzZWdtZW50U3RhcnQsIHNlZ21lbnREdXJhdGlvbik7XG4gICAgICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUsIHNlZ21lbnRTdGFydCAvIDEwMDAsIHNlZ21lbnREdXJhdGlvbiAvIDEwMDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zb3VyY2Uuc3RhcnQodGltZSk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNhbXBsZUJ1ZmZlcjtcbn0oX3NhbXBsZS5TYW1wbGUpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuU2FtcGxlT3NjaWxsYXRvciA9IHVuZGVmaW5lZDtcblxudmFyIF9zYW1wbGUgPSByZXF1aXJlKCcuL3NhbXBsZScpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG5cbnZhciBTYW1wbGVPc2NpbGxhdG9yID0gZXhwb3J0cy5TYW1wbGVPc2NpbGxhdG9yID0gZnVuY3Rpb24gKF9TYW1wbGUpIHtcbiAgX2luaGVyaXRzKFNhbXBsZU9zY2lsbGF0b3IsIF9TYW1wbGUpO1xuXG4gIGZ1bmN0aW9uIFNhbXBsZU9zY2lsbGF0b3Ioc2FtcGxlRGF0YSwgZXZlbnQpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2FtcGxlT3NjaWxsYXRvcik7XG5cbiAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoU2FtcGxlT3NjaWxsYXRvci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFNhbXBsZU9zY2lsbGF0b3IpKS5jYWxsKHRoaXMsIHNhbXBsZURhdGEsIGV2ZW50KSk7XG5cbiAgICBfdGhpcy5pZCA9IF90aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIGlmIChfdGhpcy5zYW1wbGVEYXRhID09PSAtMSkge1xuICAgICAgLy8gY3JlYXRlIGR1bW15IHNvdXJjZVxuICAgICAgX3RoaXMuc291cmNlID0ge1xuICAgICAgICBzdGFydDogZnVuY3Rpb24gc3RhcnQoKSB7fSxcbiAgICAgICAgc3RvcDogZnVuY3Rpb24gc3RvcCgpIHt9LFxuICAgICAgICBjb25uZWN0OiBmdW5jdGlvbiBjb25uZWN0KCkge31cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gQFRPRE8gYWRkIHR5cGUgJ2N1c3RvbScgPT4gUGVyaW9kaWNXYXZlXG4gICAgICB2YXIgdHlwZSA9IF90aGlzLnNhbXBsZURhdGEudHlwZTtcbiAgICAgIF90aGlzLnNvdXJjZSA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuXG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnc2luZSc6XG4gICAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgIGNhc2UgJ3Nhd3Rvb3RoJzpcbiAgICAgICAgY2FzZSAndHJpYW5nbGUnOlxuICAgICAgICAgIF90aGlzLnNvdXJjZS50eXBlID0gdHlwZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBfdGhpcy5zb3VyY2UudHlwZSA9ICdzcXVhcmUnO1xuICAgICAgfVxuICAgICAgX3RoaXMuc291cmNlLmZyZXF1ZW5jeS52YWx1ZSA9IGV2ZW50LmZyZXF1ZW5jeTtcbiAgICB9XG4gICAgX3RoaXMub3V0cHV0ID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgX3RoaXMudm9sdW1lID0gZXZlbnQuZGF0YTIgLyAxMjc7XG4gICAgX3RoaXMub3V0cHV0LmdhaW4udmFsdWUgPSBfdGhpcy52b2x1bWU7XG4gICAgX3RoaXMuc291cmNlLmNvbm5lY3QoX3RoaXMub3V0cHV0KTtcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICByZXR1cm4gU2FtcGxlT3NjaWxsYXRvcjtcbn0oX3NhbXBsZS5TYW1wbGUpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuU2FtcGxlciA9IHVuZGVmaW5lZDtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7IH0gfTsgfSgpO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfaW5zdHJ1bWVudCA9IHJlcXVpcmUoJy4vaW5zdHJ1bWVudCcpO1xuXG52YXIgX25vdGUgPSByZXF1aXJlKCcuL25vdGUnKTtcblxudmFyIF9wYXJzZV9hdWRpbyA9IHJlcXVpcmUoJy4vcGFyc2VfYXVkaW8nKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfZmV0Y2hfaGVscGVycyA9IHJlcXVpcmUoJy4vZmV0Y2hfaGVscGVycycpO1xuXG52YXIgX3NhbXBsZV9idWZmZXIgPSByZXF1aXJlKCcuL3NhbXBsZV9idWZmZXInKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG5cbnZhciBTYW1wbGVyID0gZXhwb3J0cy5TYW1wbGVyID0gZnVuY3Rpb24gKF9JbnN0cnVtZW50KSB7XG4gIF9pbmhlcml0cyhTYW1wbGVyLCBfSW5zdHJ1bWVudCk7XG5cbiAgZnVuY3Rpb24gU2FtcGxlcihuYW1lKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNhbXBsZXIpO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFNhbXBsZXIuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTYW1wbGVyKSkuY2FsbCh0aGlzKSk7XG5cbiAgICBfdGhpcy5pZCA9IF90aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBfdGhpcy5uYW1lID0gbmFtZSB8fCBfdGhpcy5pZDtcbiAgICBfdGhpcy5jbGVhckFsbFNhbXBsZURhdGEoKTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoU2FtcGxlciwgW3tcbiAgICBrZXk6ICdjbGVhckFsbFNhbXBsZURhdGEnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhckFsbFNhbXBsZURhdGEoKSB7XG4gICAgICAvLyBjcmVhdGUgYSBzYW1wbGVzIGRhdGEgb2JqZWN0IGZvciBhbGwgMTI4IHZlbG9jaXR5IGxldmVscyBvZiBhbGwgMTI4IG5vdGVzXG4gICAgICB0aGlzLnNhbXBsZXNEYXRhID0gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSk7XG4gICAgICB0aGlzLnNhbXBsZXNEYXRhID0gdGhpcy5zYW1wbGVzRGF0YS5tYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjcmVhdGVTYW1wbGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVTYW1wbGUoZXZlbnQpIHtcbiAgICAgIHJldHVybiBuZXcgX3NhbXBsZV9idWZmZXIuU2FtcGxlQnVmZmVyKHRoaXMuc2FtcGxlc0RhdGFbZXZlbnQuZGF0YTFdW2V2ZW50LmRhdGEyXSwgZXZlbnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19sb2FkSlNPTicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9sb2FkSlNPTihkYXRhKSB7XG4gICAgICBpZiAoKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihkYXRhKSkgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkYXRhLnVybCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuICgwLCBfZmV0Y2hfaGVscGVycy5mZXRjaEpTT04pKGRhdGEudXJsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGF0YSk7XG4gICAgfVxuXG4gICAgLy8gbG9hZCBhbmQgcGFyc2VcblxuICB9LCB7XG4gICAga2V5OiAncGFyc2VTYW1wbGVEYXRhJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGFyc2VTYW1wbGVEYXRhKGRhdGEpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAvLyBjaGVjayBpZiB3ZSBoYXZlIHRvIGNsZWFyIHRoZSBjdXJyZW50bHkgbG9hZGVkIHNhbXBsZXNcbiAgICAgIHZhciBjbGVhckFsbCA9IGRhdGEuY2xlYXJBbGw7XG5cbiAgICAgIC8vIGNoZWNrIGlmIHdlIGhhdmUgdG8gb3ZlcnJ1bGUgdGhlIGJhc2VVcmwgb2YgdGhlIHNhbXBlbHNcbiAgICAgIHZhciBiYXNlVXJsID0gbnVsbDtcbiAgICAgIGlmICh0eXBlb2YgZGF0YS5iYXNlVXJsID09PSAnc3RyaW5nJykge1xuICAgICAgICBiYXNlVXJsID0gZGF0YS5iYXNlVXJsO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGRhdGEucmVsZWFzZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5zZXRSZWxlYXNlKGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygxLCBkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgIH1cblxuICAgICAgLy9yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgX3RoaXMyLl9sb2FkSlNPTihkYXRhKS50aGVuKGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhqc29uKVxuICAgICAgICAgIGRhdGEgPSBqc29uO1xuICAgICAgICAgIGlmIChiYXNlVXJsICE9PSBudWxsKSB7XG4gICAgICAgICAgICBqc29uLmJhc2VVcmwgPSBiYXNlVXJsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIGRhdGEucmVsZWFzZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIF90aGlzMi5zZXRSZWxlYXNlKGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coMiwgZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAoMCwgX3BhcnNlX2F1ZGlvLnBhcnNlU2FtcGxlcykoZGF0YSk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXG4gICAgICAgICAgaWYgKGNsZWFyQWxsID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfdGhpczIuY2xlYXJBbGxTYW1wbGVEYXRhKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCh0eXBlb2YgcmVzdWx0ID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihyZXN1bHQpKSA9PT0gJ29iamVjdCcpIHtcblxuICAgICAgICAgICAgLy8gc2luZ2xlIGNvbmNhdGVuYXRlZCBzYW1wbGVcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0LnNhbXBsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gcmVzdWx0LnNhbXBsZTtcbiAgICAgICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gT2JqZWN0LmtleXMoZGF0YSlbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgbm90ZUlkID0gX3N0ZXAudmFsdWU7XG5cblxuICAgICAgICAgICAgICAgICAgaWYgKG5vdGVJZCA9PT0gJ3NhbXBsZScgfHwgbm90ZUlkID09PSAncmVsZWFzZScgfHwgbm90ZUlkID09PSAnYmFzZVVybCcgfHwgbm90ZUlkID09PSAnaW5mbycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHZhciBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBzZWdtZW50OiBkYXRhW25vdGVJZF0sXG4gICAgICAgICAgICAgICAgICAgIG5vdGU6IHBhcnNlSW50KG5vdGVJZCwgMTApLFxuICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlclxuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgX3RoaXMyLl91cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpO1xuICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGVEYXRhKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gICAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKCkge1xuICAgICAgICAgICAgICAgICAgdmFyIG5vdGVJZCA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgdmFyIGJ1ZmZlciA9IHJlc3VsdFtub3RlSWRdO1xuICAgICAgICAgICAgICAgICAgdmFyIHNhbXBsZURhdGEgPSBkYXRhW25vdGVJZF07XG5cbiAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NhbXBsZURhdGEgaXMgdW5kZWZpbmVkJywgbm90ZUlkKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKDAsIF91dGlsLnR5cGVTdHJpbmcpKGJ1ZmZlcikgPT09ICdhcnJheScpIHtcblxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGJ1ZmZlciwgc2FtcGxlRGF0YSlcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChzZCwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobm90ZUlkLCBidWZmZXJbaV0pXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlcltpXVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2QuYnVmZmVyID0gYnVmZmVyW2ldO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBzZC5ub3RlID0gcGFyc2VJbnQobm90ZUlkLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLl91cGRhdGVTYW1wbGVEYXRhKHNkKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiBidWZmZXJcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gYnVmZmVyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHBhcnNlSW50KG5vdGVJZCwgMTApO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBPYmplY3Qua2V5cyhyZXN1bHQpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICBfbG9vcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgcmVzdWx0LmZvckVhY2goZnVuY3Rpb24gKHNhbXBsZSkge1xuICAgICAgICAgICAgICB2YXIgc2FtcGxlRGF0YSA9IGRhdGFbc2FtcGxlXTtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzYW1wbGVEYXRhID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzYW1wbGVEYXRhIGlzIHVuZGVmaW5lZCcsIHNhbXBsZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzYW1wbGVEYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiBzYW1wbGUuYnVmZmVyXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IHNhbXBsZS5idWZmZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHNhbXBsZTtcbiAgICAgICAgICAgICAgICBfdGhpczIuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSk7XG4gICAgICAgICAgICAgICAgLy90aGlzLnVwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vY29uc29sZS5sb2cobmV3IERhdGUoKS5nZXRUaW1lKCkpXG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICBAcGFyYW0gY29uZmlnIChvcHRpb25hbClcbiAgICAgICAge1xuICAgICAgICAgIG5vdGU6IGNhbiBiZSBub3RlIG5hbWUgKEM0KSBvciBub3RlIG51bWJlciAoNjApXG4gICAgICAgICAgYnVmZmVyOiBBdWRpb0J1ZmZlclxuICAgICAgICAgIHN1c3RhaW46IFtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmRdLCAvLyBvcHRpb25hbCwgaW4gbWlsbGlzXG4gICAgICAgICAgcmVsZWFzZTogW3JlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlXSwgLy8gb3B0aW9uYWxcbiAgICAgICAgICBwYW46IHBhblBvc2l0aW9uIC8vIG9wdGlvbmFsXG4gICAgICAgICAgdmVsb2NpdHk6IFt2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZF0gLy8gb3B0aW9uYWwsIGZvciBtdWx0aS1sYXllcmVkIGluc3RydW1lbnRzXG4gICAgICAgIH1cbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGVTYW1wbGVEYXRhJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlU2FtcGxlRGF0YSgpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZGF0YSA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBkYXRhW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKG5vdGVEYXRhKSB7XG4gICAgICAgIC8vIHN1cHBvcnQgZm9yIG11bHRpIGxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub3RlRGF0YSwgdHlwZVN0cmluZyhub3RlRGF0YSkpXG4gICAgICAgIGlmICgoMCwgX3V0aWwudHlwZVN0cmluZykobm90ZURhdGEpID09PSAnYXJyYXknKSB7XG4gICAgICAgICAgbm90ZURhdGEuZm9yRWFjaChmdW5jdGlvbiAodmVsb2NpdHlMYXllcikge1xuICAgICAgICAgICAgX3RoaXMzLl91cGRhdGVTYW1wbGVEYXRhKHZlbG9jaXR5TGF5ZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF90aGlzMy5fdXBkYXRlU2FtcGxlRGF0YShub3RlRGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ191cGRhdGVTYW1wbGVEYXRhJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3VwZGF0ZVNhbXBsZURhdGEoKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgdmFyIGRhdGEgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuXG4gICAgICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gICAgICB2YXIgbm90ZSA9IGRhdGEubm90ZSxcbiAgICAgICAgICBfZGF0YSRidWZmZXIgPSBkYXRhLmJ1ZmZlcixcbiAgICAgICAgICBidWZmZXIgPSBfZGF0YSRidWZmZXIgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBfZGF0YSRidWZmZXIsXG4gICAgICAgICAgX2RhdGEkc3VzdGFpbiA9IGRhdGEuc3VzdGFpbixcbiAgICAgICAgICBzdXN0YWluID0gX2RhdGEkc3VzdGFpbiA9PT0gdW5kZWZpbmVkID8gW251bGwsIG51bGxdIDogX2RhdGEkc3VzdGFpbixcbiAgICAgICAgICBfZGF0YSRzZWdtZW50ID0gZGF0YS5zZWdtZW50LFxuICAgICAgICAgIHNlZ21lbnQgPSBfZGF0YSRzZWdtZW50ID09PSB1bmRlZmluZWQgPyBbbnVsbCwgbnVsbF0gOiBfZGF0YSRzZWdtZW50LFxuICAgICAgICAgIF9kYXRhJHJlbGVhc2UgPSBkYXRhLnJlbGVhc2UsXG4gICAgICAgICAgcmVsZWFzZSA9IF9kYXRhJHJlbGVhc2UgPT09IHVuZGVmaW5lZCA/IFtudWxsLCAnbGluZWFyJ10gOiBfZGF0YSRyZWxlYXNlLFxuICAgICAgICAgIF9kYXRhJHBhbiA9IGRhdGEucGFuLFxuICAgICAgICAgIHBhbiA9IF9kYXRhJHBhbiA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IF9kYXRhJHBhbixcbiAgICAgICAgICBfZGF0YSR2ZWxvY2l0eSA9IGRhdGEudmVsb2NpdHksXG4gICAgICAgICAgdmVsb2NpdHkgPSBfZGF0YSR2ZWxvY2l0eSA9PT0gdW5kZWZpbmVkID8gWzAsIDEyN10gOiBfZGF0YSR2ZWxvY2l0eTtcblxuXG4gICAgICBpZiAodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBub3RlbnVtYmVyIG9yIGEgbm90ZW5hbWUnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBnZXQgbm90ZW51bWJlciBmcm9tIG5vdGVuYW1lIGFuZCBjaGVjayBpZiB0aGUgbm90ZW51bWJlciBpcyB2YWxpZFxuICAgICAgdmFyIG4gPSAoMCwgX25vdGUuZ2V0Tm90ZURhdGEpKHsgbnVtYmVyOiBub3RlIH0pO1xuICAgICAgaWYgKG4gPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybignbm90IGEgdmFsaWQgbm90ZSBpZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBub3RlID0gbi5udW1iZXI7XG5cbiAgICAgIHZhciBfc3VzdGFpbiA9IF9zbGljZWRUb0FycmF5KHN1c3RhaW4sIDIpLFxuICAgICAgICAgIHN1c3RhaW5TdGFydCA9IF9zdXN0YWluWzBdLFxuICAgICAgICAgIHN1c3RhaW5FbmQgPSBfc3VzdGFpblsxXTtcblxuICAgICAgdmFyIF9yZWxlYXNlID0gX3NsaWNlZFRvQXJyYXkocmVsZWFzZSwgMiksXG4gICAgICAgICAgcmVsZWFzZUR1cmF0aW9uID0gX3JlbGVhc2VbMF0sXG4gICAgICAgICAgcmVsZWFzZUVudmVsb3BlID0gX3JlbGVhc2VbMV07XG5cbiAgICAgIHZhciBfc2VnbWVudCA9IF9zbGljZWRUb0FycmF5KHNlZ21lbnQsIDIpLFxuICAgICAgICAgIHNlZ21lbnRTdGFydCA9IF9zZWdtZW50WzBdLFxuICAgICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IF9zZWdtZW50WzFdO1xuXG4gICAgICB2YXIgX3ZlbG9jaXR5ID0gX3NsaWNlZFRvQXJyYXkodmVsb2NpdHksIDIpLFxuICAgICAgICAgIHZlbG9jaXR5U3RhcnQgPSBfdmVsb2NpdHlbMF0sXG4gICAgICAgICAgdmVsb2NpdHlFbmQgPSBfdmVsb2NpdHlbMV07XG5cbiAgICAgIGlmIChzdXN0YWluLmxlbmd0aCAhPT0gMikge1xuICAgICAgICBzdXN0YWluU3RhcnQgPSBzdXN0YWluRW5kID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlbGVhc2VEdXJhdGlvbiA9PT0gbnVsbCkge1xuICAgICAgICByZWxlYXNlRW52ZWxvcGUgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBjb25zb2xlLmxvZyhub3RlLCBidWZmZXIpXG4gICAgICAvLyBjb25zb2xlLmxvZyhzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmQpXG4gICAgICAvLyBjb25zb2xlLmxvZyhyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZSlcbiAgICAgIC8vIGNvbnNvbGUubG9nKHBhbilcbiAgICAgIC8vIGNvbnNvbGUubG9nKHZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kKVxuXG5cbiAgICAgIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV0uZm9yRWFjaChmdW5jdGlvbiAoc2FtcGxlRGF0YSwgaSkge1xuICAgICAgICBpZiAoaSA+PSB2ZWxvY2l0eVN0YXJ0ICYmIGkgPD0gdmVsb2NpdHlFbmQpIHtcbiAgICAgICAgICBpZiAoc2FtcGxlRGF0YSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgIGlkOiBub3RlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gYnVmZmVyIHx8IHNhbXBsZURhdGEuYnVmZmVyO1xuICAgICAgICAgIHNhbXBsZURhdGEuc3VzdGFpblN0YXJ0ID0gc3VzdGFpblN0YXJ0IHx8IHNhbXBsZURhdGEuc3VzdGFpblN0YXJ0O1xuICAgICAgICAgIHNhbXBsZURhdGEuc3VzdGFpbkVuZCA9IHN1c3RhaW5FbmQgfHwgc2FtcGxlRGF0YS5zdXN0YWluRW5kO1xuICAgICAgICAgIHNhbXBsZURhdGEuc2VnbWVudFN0YXJ0ID0gc2VnbWVudFN0YXJ0IHx8IHNhbXBsZURhdGEuc2VnbWVudFN0YXJ0O1xuICAgICAgICAgIHNhbXBsZURhdGEuc2VnbWVudER1cmF0aW9uID0gc2VnbWVudER1cmF0aW9uIHx8IHNhbXBsZURhdGEuc2VnbWVudER1cmF0aW9uO1xuICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uID0gcmVsZWFzZUR1cmF0aW9uIHx8IHNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uO1xuICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gcmVsZWFzZUVudmVsb3BlIHx8IHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlO1xuICAgICAgICAgIHNhbXBsZURhdGEucGFuID0gcGFuIHx8IHNhbXBsZURhdGEucGFuO1xuXG4gICAgICAgICAgaWYgKCgwLCBfdXRpbC50eXBlU3RyaW5nKShzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSkgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXkgPSBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZTtcbiAgICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gJ2FycmF5JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXk7XG4gICAgICAgICAgfVxuICAgICAgICAgIF90aGlzNC5zYW1wbGVzRGF0YVtub3RlXVtpXSA9IHNhbXBsZURhdGE7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZygnJU8nLCB0aGlzLnNhbXBsZXNEYXRhW25vdGVdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gc3RlcmVvIHNwcmVhZFxuXG4gIH0sIHtcbiAgICBrZXk6ICdzZXRLZXlTY2FsaW5nUGFubmluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEtleVNjYWxpbmdQYW5uaW5nKCkge1xuICAgICAgLy8gc2V0cyBwYW5uaW5nIGJhc2VkIG9uIHRoZSBrZXkgdmFsdWUsIGUuZy4gaGlnaGVyIG5vdGVzIGFyZSBwYW5uZWQgbW9yZSB0byB0aGUgcmlnaHQgYW5kIGxvd2VyIG5vdGVzIG1vcmUgdG8gdGhlIGxlZnRcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRLZXlTY2FsaW5nUmVsZWFzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEtleVNjYWxpbmdSZWxlYXNlKCkge31cbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcblxuXG4gICAgLypcbiAgICAgIEBkdXJhdGlvbjogbWlsbGlzZWNvbmRzXG4gICAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3NldFJlbGVhc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRSZWxlYXNlKGR1cmF0aW9uLCBlbnZlbG9wZSkge1xuICAgICAgLy8gc2V0IHJlbGVhc2UgZm9yIGFsbCBrZXlzLCBvdmVycnVsZXMgdmFsdWVzIHNldCBieSBzZXRLZXlTY2FsaW5nUmVsZWFzZSgpXG4gICAgICB0aGlzLnNhbXBsZXNEYXRhLmZvckVhY2goZnVuY3Rpb24gKHNhbXBsZXMsIGlkKSB7XG4gICAgICAgIHNhbXBsZXMuZm9yRWFjaChmdW5jdGlvbiAoc2FtcGxlLCBpKSB7XG4gICAgICAgICAgaWYgKHNhbXBsZSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHNhbXBsZSA9IHtcbiAgICAgICAgICAgICAgaWQ6IGlkXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBzYW1wbGUucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgICAgICAgc2FtcGxlLnJlbGVhc2VFbnZlbG9wZSA9IGVudmVsb3BlO1xuICAgICAgICAgIHNhbXBsZXNbaV0gPSBzYW1wbGU7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGEpXG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNhbXBsZXI7XG59KF9pbnN0cnVtZW50Lkluc3RydW1lbnQpOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBzYW1wbGVzID0ge1xuICAvLyAgZW1wdHlPZ2c6ICdUMmRuVXdBQ0FBQUFBQUFBQUFCZHhkNFhBQUFBQURhUzBqUUJIZ0YyYjNKaWFYTUFBQUFBQVVTc0FBQUFBQUFBZ0xzQUFBQUFBQUM0QVU5bloxTUFBQUFBQUFBQUFBQUFYY1hlRndFQUFBQWFYSytRRHozLy8vLy8vLy8vLy8vLy8vLy9NZ04yYjNKaWFYTXRBQUFBV0dsd2FDNVBjbWNnYkdsaVZtOXlZbWx6SUVrZ01qQXhNREV4TURFZ0tGTmphR0YxWm1WdWRXZG5aWFFwQUFBQUFBRUZkbTl5WW1sekgwSkRWZ0VBQUFFQUdHTlVLVWFaVXRKS2lSbHpsREZHbVdLU1NvbWxoQlpDU0oxekZGT3BPZGVjYTZ5NXRTQ0VFQnBUVUNrRm1WS09VbWtaWTVBcEJabFNFRXRKSlhRU09pZWRZeEJiU2NIV21HdUxRYlljaEEyYVVrd3B4SlJTaWtJSUdWT01LY1dVVWtwQ0J5VjBEanJtSEZPT1NpaEJ1Snh6cTdXV2xtT0xxWFNTU3Vja1pFeENTQ21Ga2tvSHBWTk9Ra2cxbHRaU0tSMXpVbEpxUWVnZ2hCQkN0aUNFRFlMUWtGVUFBQUVBd0VBUUdySUtBRkFBQUJDS29SaUtBb1NHckFJQU1nQUFCS0FvanVJb2ppTTVrbU5KRmhBYXNnb0FBQUlBRUFBQXdIQVVTWkVVeWJFa1M5SXNTOU5FVVZWOTFUWlZWZloxWGRkMVhkZDFJRFJrRlFBQUFRQkFTS2VacFJvZ3dneGtHQWdOV1FVQUlBQUFBRVlvd2hBRFFrTldBUUFBQVFBQVlpZzVpQ2EwNW54empvTm1PV2dxeGVaMGNDTFY1a2x1S3VibW5IUE9PU2ViYzhZNDU1eHppbkptTVdnbXRPYWNjeEtEWmlsb0pyVG1uSE9leE9aQmE2cTA1cHh6eGptbmczRkdHT2VjYzVxMDVrRnFOdGJtbkhNV3RLWTVhaTdGNXB4ekl1WG1TVzB1MWVhY2M4NDU1NXh6empubm5IT3FGNmR6Y0U0NDU1eHpvdmJtV201Q0YrZWNjejRacDN0elFqam5uSFBPT2VlY2M4NDU1NXh6Z3RDUVZRQUFFQUFBUVJnMmhuR25JRWlmbzRFWVJZaHB5S1FIM2FQREpHZ01jZ3FwUjZPamtWTHFJSlJVeGtrcG5TQTBaQlVBQUFnQUFDR0VGRkpJSVlVVVVrZ2hoUlJTaUNHR0dHTElLYWVjZ2dvcXFhU2lpakxLTExQTU1zc3NzOHd5NjdDenpqcnNNTVFRUXd5dHRCSkxUYlhWV0dPdHVlZWNhdzdTV21tdHRkWktLYVdVVWtvcENBMVpCUUNBQUFBUUNCbGtrRUZHSVlVVVVvZ2hwcHh5eWltb29BSkNRMVlCQUlBQUFBSUFBQUE4eVhORVIzUkVSM1JFUjNSRVIzUkV4M004UjVSRVNaUkVTYlJNeTlSTVR4VlYxWlZkVzlabDNmWnRZUmQyM2ZkMTMvZDE0OWVGWVZtV1pWbVdaVm1XWlZtV1pWbVdaVm1DMEpCVkFBQUlBQUNBRUVJSUlZVVVVa2docFJoanpESG5vSk5RUWlBMFpCVUFBQWdBSUFBQUFNQlJITVZ4SkVkeUpNbVNMRW1UTkV1elBNM1RQRTMwUkZFVVRkTlVSVmQwUmQyMFJkbVVUZGQwVGRsMFZWbTFYVm0yYmRuV2JWK1diZC8zZmQvM2ZkLzNmZC8zZmQvM2RSMElEVmtGQUVnQUFPaElqcVJJaXFSSWp1TTRraVFCb1NHckFBQVpBQUFCQUNpS296aU80MGlTSkVtV3BFbWU1Vm1pWm1xbVozcXFxQUtoSWFzQUFFQUFBQUVBQUFBQUFDaWE0aW1tNGltaTRqbWlJMHFpWlZxaXBtcXVLSnV5NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N291RUJxeUNnQ1FBQURRa1J6SmtSeEprUlJKa1J6SkFVSkRWZ0VBTWdBQUFnQndETWVRRk1teExFdlRQTTNUUEUzMFJFLzBURThWWGRFRlFrTldBUUNBQUFBQ0FBQUFBQUF3Sk1OU0xFZHpORW1VVkV1MVZFMjFWRXNWVlU5VlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlUxVGRNMFRTQTBaQ1VBQUFRQXdHS053ZVVnSVNVbDVkNFF3aENUbmpFbUliVmVJUVNSa3Q0eEJoV0RuaktpREhMZVF1TVFneDRJRFZrUkFFUUJBQURHSU1jUWM4ZzVSNm1URWpubnFIU1VHdWNjcFk1U1p5bkZtR0xOS0pYWVVxeU5jNDVTUjYyamxHSXNMWGFVVW8ycHhnSUFBQUljQUFBQ0xJUkNRMVlFQUZFQUFJUXhTQ21rRkdLTU9hZWNRNHdwNTVoemhqSG1ISE9PT2VlZ2RGSXE1NXgwVGtyRUdIT09PYWVjYzFJNko1VnpUa29ub1FBQWdBQUhBSUFBQzZIUWtCVUJRSndBZ0VHU1BFL3lORkdVTkU4VVJWTjBYVkUwWGRmeVBOWDBURk5WUGRGVVZWTlZiZGxVVlZtV1BNODBQZE5VVmM4MFZkVlVWVmsyVlZXV1JWWFZiZE4xZGR0MFZkMldiZHYzWFZzV2RsRlZiZDFVWGRzM1ZkZjJYZG4yZlZuV2RXUHlQRlgxVE5OMVBkTjBaZFYxYlZ0MVhWMzNURk9XVGRlVlpkTjFiZHVWWlYxM1pkbjNOZE4wWGROVlpkbDBYZGwyWlZlM1hWbjJmZE4xaGQrVlpWOVhaVmtZZGwzM2hWdlhsZVYwWGQxWFpWYzNWbG4yZlZ2WGhlSFdkV0daUEU5VlBkTjBYYzgwWFZkMVhWOVhYZGZXTmRPVVpkTjFiZGxVWFZsMlpkbjNYVmZXZGM4MFpkbDBYZHMyWFZlV1hWbjJmVmVXZGQxMFhWOVhaVm40VlZmMmRWblhsZUhXYmVFM1hkZjNWVm4yaFZlV2RlSFdkV0c1ZFYwWVBsWDFmVk4yaGVGMFpkL1hoZDlaYmwwNGx0RjFmV0dWYmVGWVpWazVmdUZZbHQzM2xXVjBYVjlZYmRrWVZsa1dobC80bmVYMmZlTjRkVjBaYnQzbnpMcnZETWZ2cFB2SzA5VnRZNWw5M1ZsbVgzZU80Umc2di9EanFhcXZtNjRyREtjc0M3L3Q2OGF6Kzc2eWpLN3IrNm9zQzc4cTI4S3g2Nzd6L0w2d0xLUHMrc0pxeThLdzJyWXgzTDV1TEw5d0hNdHI2OG94Njc1UnRuVjhYM2dLdy9OMGRWMTVabDNIOW5WMDQwYzRmc29BQUlBQkJ3Q0FBQlBLUUtFaEt3S0FPQUVBanlTSm9tUlpvaWhabGlpS3B1aTZvbWk2cnFScHBxbHBubWxhbW1lYXBtbXFzaW1hcml4cG1tbGFubWFhbXFlWnBtaWFybXVhcHF5S3BpbkxwbXJLc21tYXN1eTZzbTI3cm16Ym9tbktzbW1hc215YXBpeTdzcXZicnV6cXVxUlpwcWw1bm1scW5tZWFwbXJLc21tYXJxdDVubXA2bm1pcW5paXFxbXFxcXEycXFpeGJubWVhbXVpcHBpZUtxbXFxcHEyYXFpckxwcXJhc21tcXRteXFxbTI3cXV6NnNtM3J1bW1xc20ycXBpMmJxbXJicnV6cXNpemJ1aTlwbW1scW5tZWFtdWVacG1tYXNteWFxaXRibnFlYW5paXFxdWFKcG1xcXFpeWJwcXJLbHVlWnFpZUtxdXFKbm11YXFpckxwbXJhcW1tYXRteXFxaTJicGlyTHJtMzd2dXZLc202cXFteWJxbXJycG1yS3Ntekx2dS9LcXU2S3BpbkxwcXJhc21tcXNpM2JzdS9Mc3F6N29tbktzbW1xc20ycXFpN0xzbTBiczJ6N3VtaWFzbTJxcGkyYnFpcmJzaTM3dWl6YnV1L0tybStycXF6cnNpMzd1dTc2cm5EcnVqQzhzbXo3cXF6NnVpdmJ1bS9yTXR2MmZVVFRsR1ZUTlczYlZGVlpkbVhaOW1YYjluM1JORzFiVlZWYk5rM1Z0bVZaOW4xWnRtMWhORTNaTmxWVjFrM1Z0RzFabG0xaHRtWGhkbVhadDJWYjluWFhsWFZmMTMzajEyWGQ1cnF5N2N1eXJmdXFxL3EyN3Z2Q2NPdXU4QW9BQUJod0FBQUlNS0VNRkJxeUVnQ0lBZ0FBakdHTU1RaU5VczQ1QjZGUnlqbm5JR1RPUVFnaGxjdzVDQ0dVa2prSG9aU1VNdWNnbEpKU0NLR1VsRm9MSVpTVVVtc0ZBQUFVT0FBQUJOaWdLYkU0UUtFaEt3R0FWQUFBZytOWWx1ZVpvbXJhc21OSm5pZUtxcW1xdHUxSWx1ZUpvbW1xcW0xYm5pZUtwcW1xcnV2cm11ZUpvbW1xcXV2cXVtaWFwcW1xcnV1NnVpNmFvcW1xcXV1NnNxNmJwcXFxcml1N3N1enJwcXFxcXV2S3Jpejd3cXE2cml2THNtM3J3ckNxcnV2S3NtemJ0bS9jdXE3cnZ1Lzd3cEd0NjdvdS9NSXhERWNCQU9BSkRnQkFCVGFzam5CU05CWllhTWhLQUNBREFJQXdCaUdERUVJR0lZU1FVa29ocFpRU0FBQXc0QUFBRUdCQ0dTZzBaRVVBRUNjQUFCaERLYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpJS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLcWFTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS1pWU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVZ29Ba0lwd0FKQjZNS0VNRkJxeUVnQklCUUFBakZGS0tjYWNneEF4NWhoajBFa29LV0xNT2NZY2xKSlM1UnlFRUZKcExiZktPUWdocE5SU2JabHpVbHFMTWVZWU0rZWtwQlJielRtSFVsS0xzZWFhYSs2a3RGWnJyalhuV2xxck5kZWNjODI1dEJacnJqblhuSFBMTWRlY2M4NDU1eGh6empubm5IUE9CUURnTkRnQWdCN1lzRHJDU2RGWVlLRWhLd0dBVkFBQUFobWxHSFBPT2VnUVVvdzU1eHlFRUNLRkdIUE9PUWdoVkl3NTV4eDBFRUtvR0hQTU9RZ2hoSkE1NXh5RUVFSUlJWE1PT3VnZ2hCQkNCeDJFRUVJSW9aVE9RUWdoaEJCS0tDR0VFRUlJSVlRUU9nZ2hoQkJDQ0NHRUVFSUlJWVJTU2dnaGhCQkNDYUdVVUFBQVlJRURBRUNBRGFzam5CU05CUllhc2hJQUFBSUFnQnlXb0ZMT2hFR09RWThOUWNwUk13MUNURG5SbVdKT2FqTVZVNUE1RUoxMEVobHFRZGxlTWdzQUFJQWdBQ0RBQkJBWUlDajRRZ2lJTVFBQVFZak1FQW1GVmJEQW9Bd2FIT1lCd0FORWhFUUFrSmlnU0x1NGdDNERYTkRGWFFkQ0NFSVFnbGdjUUFFSk9EamhoaWZlOElRYm5LQlRWT29nQUFBQUFBQU1BT0FCQU9DZ0FDSWltcXV3dU1ESTBOamc2UEFJQUFBQUFBQVdBUGdBQURnK2dJaUk1aW9zTGpBeU5EWTRPandDQUFBQUFBQUFBQUNBZ0lBQUFBQUFBRUFBQUFDQWdFOW5aMU1BQkFFQUFBQUFBQUFBWGNYZUZ3SUFBQUJxMm5weEFnRUJBQW89JyxcbiAgLy8gIGVtcHR5TXAzOiAnLy91UXhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVNXNW1id0FBQUE4QUFBQUJBQUFEUWdELy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy84QUFBQTVURUZOUlRNdU9UbHlBYzBBQUFBQUFBQUFBQlNBSkFKQVFnQUFnQUFBQTBMMllMUXhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQS8vdVF4QUFEd0FBQnBBQUFBQ0FBQURTQUFBQUVURUZOUlRNdU9Ua3VOVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYnLFxuICBoaWdodGljazogJ1VrbEdSa1FGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZU0FGQUFDeC94Zi9kQURPQUN3QnNQM3ArNkgrekFHb0JPa0NDd0JYL0VINU92eGxBNGtKMndjU0FyVDlFL3V0K0hUMmV2VXg5OG42T0FGNUNDVU13UXZmQ09zSnhBeDBEU0lNRUFxOUJpQUIzdmh6N21Ma1Q5c1IxMzNZeE4yczVRTHYwdnJVQm53Um54dVFKZUVzU0RDaU1kOHlGUzhhS0ZJaG9oVXNDS2o2NHU2MjVPcmFBOUh1eVBuRWxjUCt3eHZKV3RXMjU2MzdWUTBqSFBnbkJURERNMW8wQ3pLTEsrOGh6aGdGRE96OFNlNEo0N0RZVnRHMHo1ZlFxOUxCMTJyZkErajk5cm9IQWhlbEl5TXdJamRUT3VVOG1qd0lPR294aENiNUU1My9qKzNrMy9mVFk4cFR3NHkvVHIrZXc4RE12ZHNrOFJjSFJSa1NLTzR5R1RrSFBrVS9yenp5TmNnc3JSOTREcC81citaczE3ek9uY29EeGhmRTM4V0x5bi9UZU9NaTlyMElSeGxSS0lRenlUbE9QS285eWptV01jb2tEUkxjL1k3cnVkdGR6dS9EMkwxSXUrMjdKY0czeVlyVkx1amwrM1VPWngxVUs1UTBxem1OUERrOFpqZWVNUG9qemhIKy9qTHRQZDVtMGhITEhzWUl3NVRFTU1uQTBqdmo4ZlNPQml3WEFTWmdNek04ZFVCR1FiSStyempwS2tJWnlnWlQ5UWZsY2RhUnlxWEN6NytWd1VQSDc4NHIzSzdzK3YwS0R1OGJ2eWVMTWI0M05qcmhPSW8wZFN2UUhpMFBuUDZpN292ZzNOVHh5NC9HZjhYOHlIL1FCdHZYNTVQMllnYjBGY1Vqc3k0TE5tSTVlamlYTTM4cjdpQzhGSndIUHZvazdkRGdRZGFKemxUS0lzb0Z6c3JWa3VBODdkLzZxQWk3RlEwaDlDbEtNTEV6M1RPck1CY3FZU0Q4RTlBRmQvZFM2a1RmNmRiVTBYblF2OUlIMk1YZlorbG45REVBRnd3ZEZ5OGdpaWI2S2F3cWVDaGdJL1ViSEJPVENaai92dlhlN0lubEZ1RE4zUDNiMGQxRjRnenBpZkcyK3U0RDdRdzFGZndibkNEK0lsZ2pXeUhMSFBNVm9nMm1CTDM3cXZQKzdOdm5ZdVR2NHJ2amZ1Yk42azN3cFBaMC9Xa0VPd3RpRVVzV2N4bStHbDRhT2hoaUZEQVBJd21iQXRuN1RQVnk3N3pxY2VmcjVZSG1IdWxsN2VueWZQbWNBSGdIZXcxUkVyOFZoaGQvRitBVjFSSjBEaWtKV1FOYy9aUDNlZktkN2h2czJ1cjQ2ckhzNXU4ZTlOLzQ4LzBoQS84SEZnd3VEMDRSU0JJUkVxc1FPZzdtQ3NzR01BSlcvWG40Ry9USzhMYnV6dTBJN3FUdm5QSnk5c1g2YlA4NEJMWUliQXdkRDg0UVl4RzdFT2NPREF4d0NGTUVBUUM5KzdQM1N2VFg4WEh3K3U5UjhLVHhJdlNvOStYN1ZRQ1VCSjBJTXd6aURqNFFMaEFHRDlVTXJnblRCWmNCUnYxditYdjJVZlMrOHRmeCt2RVM4N3owK3ZiMytaZjlaZ0VRQlNFSVVBcldDOGtNMlF5ekM1RUpFQWR2QkhnQlhQNW4rK3I0QXZkODlXajA3Zk13OUQzMUp2ZnArVWo5eFFEOUE4UUc1UWhYQ2xFTHJBc3ZDOXdKN2dkNkJXSUMzdjZPKzdUNFBQWk45RUh6V3ZOZjlQejFGdml0K3FMOXJRQ0hBd0VHL3dlQ0NaVUtGd3ZEQ25JSmNBY1FCV2NDYWY4Wi9DRDU1dmFCOWREMHdQU1A5VUwzbS9rNy9NeitKd0V5QXc4RnpBWTdDQnNKYVFrNUNXa0kyZ2F0QkNJQ1lmK2ovRnI2dmZpVjk4NzJzZlpQOTF6NHAvbFIrM0g5emY4OUFyb0VGQWZqQ1AwSmN3bzhDakFKZFFkZ0JTRURrZ0RRL1ZqN1pmblI5NVQyOGZVZDl2MzJWdmcyK25iOCsvNnhBV29FNEFiRENQNEpwQXFiQ3FRSjB3ZUVCZmdDVEFDVC9SMzdNL20rOTY3MklQWTY5Z2IzYWZoVyt0VDhxZitNQWowRmdnY3VDU2NLWEFyaUNjTUlFQWZ5QkpZQ0Z3Q1AvUno3QS9sNzkzejJGL1puOW1IMzdmamQraTM5eWY5cEF0MEVGQWZSQ05rSkdBcXJDWllJdmdaUEJKOEI2UDQvL00zNTB2ZHo5cS8xbGZVcTltejNSUG1pKzNIK2JnRlZCT1FHM3dnSENrd0swQW03Q0NBSENnV21BakFBJyxcbiAgbG93dGljazogJ1VrbEdSbFFGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZVEFGQUFCMC81ditVLzRULzNnQTB3RlRBdVVCK2Y4ZC9uVDkwZjFxL3ViK3RmNDYvbWIvOHdGUUE5Z0M3d0NkL21yK0ZBR1JBM2NFNndKZi9oMzZldm12Kzh2L053UkhCWlVDMi82MCsvLzVFdnVaL2FYL2JnRk9BcDhBenZ6aDl3ZnpMUEY2OHpUNHkvMkJBeWdJZlF3YUVqWVkweDMxSXJ3bDhTT1dIVkVTT2dQaDlOZnBSZUZ0MjJuWUhkZEQyQlhjWmVEYTVJbnFnUER4OW5QKzZnUzRDQllMbncwekVTMFdYeHY0SGtjZ0xoLzFHK0VYMVJOcEQ0d0tpZ1hILzZyNS9mTnU3bFRwaitadTVoSG9YT3RMNzFieXIvUXA5MUw2NHY2T0JPNEpvUTV6RXNrVStoVTFGaVFWZVJQN0VXZ1A0UXIwQklUK3RQaWQ5QzN5MXZDaDhGRHhKdksyOHZ2eXkvTEE4cEx6VS9YUDk1djZ4dnc0L3VEL1JBSzJCU2tLY2c2QkVTY1RaQk1lRXFrUFRReGpDS0VFVndGaS9udjdoL2hwOWFEeUF2SFA4TWZ4THZNKzlQWDB1UFcxOWcvNExmcjcvQzRBS2dOYUJYUUd5d2IwQmhJSFdRZldCMW9JekFqdENGOElId2R0QmFrRFZ3S0xBZVlBOHY5dy9rajgxL25ROTR2MjkvWFg5YnoxYlBVWTlVejFaL2FIK0hyN3lQNE1BaTRGK3djZkNuWUxOZ3lmRFBzTVN3MHNEVUFNZmdyY0I1SUVNd0ZiL2lYOFQvcFQrTy8xWC9NZjhjYnZyTysxOE1MeXZmVlArUmY5d2dBb0JDRUhwd25JQzVFTjRRNUFEM3dPMUF5MENwc0l2d2J2Qk5jQ2JRQXIvblg4T2ZzZit2YjRtdmRhOXJqMXovV1g5cEwzYS9oSCtaWDZSL3duL3ZQL2VRRVNBL0FFK3dZRENjd0tGQXlQRENrTUZRdVNDZTRIVlFiU0JIUURDd0k4QU5MOUpQdVkrSFgyOHZUcTgyUHpkUE1WOUF6MU1mWjQ5ekQ1Z2Z0eC9zUUJCUVhMQjhjSi9ncXBDdzhNaWd3V0RYRU5YUTJyRERVTDdRZ0RCc3dDZHY4Uy9LNzRXUFZrOGhYd291NFA3bXZ1MSs5VDhwejFVdmxpL1pvQndnV1JDY3NNUGcvQ0VFUVI0UkRBRHdvTzl3dXNDVk1INEFSU0Fwbi91ZnpkK1dqM2J2WDc4eHp6eC9MNjhxenoxdlNEOXFYNEdmdmQvYzBBaHdPL0JXd0htZ2h2Q1FFS1ZRb25DbHNKQ3dpSUJoMEYwZ09nQW0wQk93QXgvMDMrWFAwZy9MYjZjUG1YK0YvNHZmaCsrVEg2cy9vcys3LzdjdndML1p6OVhQNU8vM0lBM0FGOUF6c0Y5Z2FVQ0FBS0hndWVDemNMOXdudEIzc0Y0d0l6QUkzOTZmcDErR3YySXZXbjlOMzBwL1hpOW03NEcvcnUrOVA5ay84YUFZRUMxQU1UQlNJRzB3WXVCMWdIa2djQUNHRUlTQWhUQnpFRldBS3QvNUw5MmZ1VSt2WDUwZm1mK1NQNWkvZ2IrQmY0bXZpditTcjdrdnliL1VqK3IvNFgvOHIvK2dDaUFvMEVVQWFSQnp3SVN3anFCM0lIR1FmQ0J2OEZwZ1RNQXBRQUtmNjcrNW41L3ZmbjlqejJ5UFZuOVNMMVJQWHE5U1AzRHZtcis2ZitzUUdLQkFjSCt3aE9DaDBMYXdzM0MyOEtMQW1EQjVBRmZRTm9BVlAvWnYzZSs3UDZzZm5MK0N2NHZQZU05NWIzN2ZlVitKbjUxUG9xL0xMOW12K1lBVllEM2dRdUJtY0hTQWlrQ0lFSTdBZitCdUVGbmdRWEExc0J2Lzl2L3BmOU1QM1cvRmo4cS9zUis2SDZVL28zK21QNnkvcE4rL2Y3eHZ5ZS9XSCtKZjltQUQ0Q1FBUUpCaXNIdGdmNkJ3MEk4UWRzQjFzR3l3VDRBZ2dCQ1Avby9LWDZtUGcxOTU3MmpmYXo5dWYyUy9jTStFMzVFL3RXL2FmLzV3SDFBOEFGS2dma0IvQUhnd2Z4QmxBR2dRVklCTU1DSndHcy80Myt2UDBpL1pyOExmemwrOUg3NmZ2aSs5Zjc1ZnNmL0luOEJQMTAvZWo5Y2Y0Ty83Zi9kQUFjQWFVQkVnS01BaGdEcEFNRUJDRUVEd1RmQTNJRHhRTDhBU29CVXdDRy84NytKLzZoL1JyOXBQeGsvR2I4b1B3Si9YSDl3LzM5L1VEK3FQNDEvOUQvV3dEZUFHc0JBZ0tkQWhFRFFRTkFBMHNEYndPVkE1WURWd1BPQWhnQ1ZBR1JBQT09J1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gc2FtcGxlczsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnNhdmVBc01JRElGaWxlID0gc2F2ZUFzTUlESUZpbGU7XG5cbnZhciBfZmlsZXNhdmVyanMgPSByZXF1aXJlKCdmaWxlc2F2ZXJqcycpO1xuXG52YXIgUFBRID0gOTYwOyAvKlxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFRoaXMgY29kZSBpcyBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vc2VyZ2kvanNtaWRpXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIGluZm86IGh0dHA6Ly93d3cuZGVsdWdlLmNvLz9xPW1pZGktdGVtcG8tYnBtXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICovXG5cbnZhciBIRFJfUFBRID0gc3RyMkJ5dGVzKFBQUS50b1N0cmluZygxNiksIDIpO1xuXG52YXIgSERSX0NIVU5LSUQgPSBbJ00nLmNoYXJDb2RlQXQoMCksICdUJy5jaGFyQ29kZUF0KDApLCAnaCcuY2hhckNvZGVBdCgwKSwgJ2QnLmNoYXJDb2RlQXQoMCldO1xudmFyIEhEUl9DSFVOS19TSVpFID0gWzB4MCwgMHgwLCAweDAsIDB4Nl07IC8vIEhlYWRlciBzaXplIGZvciBTTUZcbnZhciBIRFJfVFlQRTAgPSBbMHgwLCAweDBdOyAvLyBNaWRpIFR5cGUgMCBpZFxudmFyIEhEUl9UWVBFMSA9IFsweDAsIDB4MV07IC8vIE1pZGkgVHlwZSAxIGlkXG4vL0hEUl9QUFEgPSBbMHgwMSwgMHhFMF0gLy8gRGVmYXVsdHMgdG8gNDgwIHRpY2tzIHBlciBiZWF0XG4vL0hEUl9QUFEgPSBbMHgwMCwgMHg4MF0gLy8gRGVmYXVsdHMgdG8gMTI4IHRpY2tzIHBlciBiZWF0XG5cbnZhciBUUktfQ0hVTktJRCA9IFsnTScuY2hhckNvZGVBdCgwKSwgJ1QnLmNoYXJDb2RlQXQoMCksICdyJy5jaGFyQ29kZUF0KDApLCAnaycuY2hhckNvZGVBdCgwKV07XG5cbi8vIE1ldGEgZXZlbnQgY29kZXNcbnZhciBNRVRBX1NFUVVFTkNFID0gMHgwMDtcbnZhciBNRVRBX1RFWFQgPSAweDAxO1xudmFyIE1FVEFfQ09QWVJJR0hUID0gMHgwMjtcbnZhciBNRVRBX1RSQUNLX05BTUUgPSAweDAzO1xudmFyIE1FVEFfSU5TVFJVTUVOVCA9IDB4MDQ7XG52YXIgTUVUQV9MWVJJQyA9IDB4MDU7XG52YXIgTUVUQV9NQVJLRVIgPSAweDA2O1xudmFyIE1FVEFfQ1VFX1BPSU5UID0gMHgwNztcbnZhciBNRVRBX0NIQU5ORUxfUFJFRklYID0gMHgyMDtcbnZhciBNRVRBX0VORF9PRl9UUkFDSyA9IDB4MmY7XG52YXIgTUVUQV9URU1QTyA9IDB4NTE7XG52YXIgTUVUQV9TTVBURSA9IDB4NTQ7XG52YXIgTUVUQV9USU1FX1NJRyA9IDB4NTg7XG52YXIgTUVUQV9LRVlfU0lHID0gMHg1OTtcbnZhciBNRVRBX1NFUV9FVkVOVCA9IDB4N2Y7XG5cbmZ1bmN0aW9uIHNhdmVBc01JRElGaWxlKHNvbmcpIHtcbiAgdmFyIGZpbGVOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBzb25nLm5hbWU7XG4gIHZhciBwcHEgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IDk2MDtcblxuXG4gIFBQUSA9IHBwcTtcbiAgSERSX1BQUSA9IHN0cjJCeXRlcyhQUFEudG9TdHJpbmcoMTYpLCAyKTtcblxuICB2YXIgYnl0ZUFycmF5ID0gW10uY29uY2F0KEhEUl9DSFVOS0lELCBIRFJfQ0hVTktfU0laRSwgSERSX1RZUEUxKTtcbiAgdmFyIHRyYWNrcyA9IHNvbmcuZ2V0VHJhY2tzKCk7XG4gIHZhciBudW1UcmFja3MgPSB0cmFja3MubGVuZ3RoICsgMTtcbiAgdmFyIGkgPSB2b2lkIDAsXG4gICAgICBtYXhpID0gdm9pZCAwLFxuICAgICAgdHJhY2sgPSB2b2lkIDAsXG4gICAgICBtaWRpRmlsZSA9IHZvaWQgMCxcbiAgICAgIGRlc3RpbmF0aW9uID0gdm9pZCAwLFxuICAgICAgYjY0ID0gdm9pZCAwO1xuICB2YXIgYXJyYXlCdWZmZXIgPSB2b2lkIDAsXG4gICAgICBkYXRhVmlldyA9IHZvaWQgMCxcbiAgICAgIHVpbnRBcnJheSA9IHZvaWQgMDtcblxuICBieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHN0cjJCeXRlcyhudW1UcmFja3MudG9TdHJpbmcoMTYpLCAyKSwgSERSX1BQUSk7XG5cbiAgLy9jb25zb2xlLmxvZyhieXRlQXJyYXkpO1xuICBieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHRyYWNrVG9CeXRlcyhzb25nLl90aW1lRXZlbnRzLCBzb25nLl9kdXJhdGlvblRpY2tzLCAndGVtcG8nKSk7XG5cbiAgZm9yIChpID0gMCwgbWF4aSA9IHRyYWNrcy5sZW5ndGg7IGkgPCBtYXhpOyBpKyspIHtcbiAgICB0cmFjayA9IHRyYWNrc1tpXTtcbiAgICB2YXIgaW5zdHJ1bWVudCA9IHZvaWQgMDtcbiAgICBpZiAodHJhY2suX2luc3RydW1lbnQgIT09IG51bGwpIHtcbiAgICAgIGluc3RydW1lbnQgPSB0cmFjay5faW5zdHJ1bWVudC5pZDtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCB0cmFjay5fZXZlbnRzLmxlbmd0aCwgaW5zdHJ1bWVudClcbiAgICBieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHRyYWNrVG9CeXRlcyh0cmFjay5fZXZlbnRzLCBzb25nLl9kdXJhdGlvblRpY2tzLCB0cmFjay5uYW1lLCBpbnN0cnVtZW50KSk7XG4gICAgLy9ieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHRyYWNrVG9CeXRlcyh0cmFjay5fZXZlbnRzLCBzb25nLl9sYXN0RXZlbnQuaWNrcywgdHJhY2submFtZSwgaW5zdHJ1bWVudCkpXG4gIH1cblxuICAvL2I2NCA9IGJ0b2EoY29kZXMyU3RyKGJ5dGVBcnJheSkpXG4gIC8vd2luZG93LmxvY2F0aW9uLmFzc2lnbihcImRhdGE6YXVkaW8vbWlkaTtiYXNlNjQsXCIgKyBiNjQpXG4gIC8vY29uc29sZS5sb2coYjY0KS8vIHNlbmQgdG8gc2VydmVyXG5cbiAgbWF4aSA9IGJ5dGVBcnJheS5sZW5ndGg7XG4gIGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG1heGkpO1xuICB1aW50QXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcik7XG4gIGZvciAoaSA9IDA7IGkgPCBtYXhpOyBpKyspIHtcbiAgICB1aW50QXJyYXlbaV0gPSBieXRlQXJyYXlbaV07XG4gIH1cbiAgbWlkaUZpbGUgPSBuZXcgQmxvYihbdWludEFycmF5XSwgeyB0eXBlOiAnYXBwbGljYXRpb24veC1taWRpJywgZW5kaW5nczogJ3RyYW5zcGFyZW50JyB9KTtcbiAgZmlsZU5hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKC9cXC5taWRpJC8sICcnKTtcbiAgLy9sZXQgcGF0dCA9IC9cXC5taWRbaV17MCwxfSQvXG4gIHZhciBwYXR0ID0gL1xcLm1pZCQvO1xuICB2YXIgaGFzRXh0ZW5zaW9uID0gcGF0dC50ZXN0KGZpbGVOYW1lKTtcbiAgaWYgKGhhc0V4dGVuc2lvbiA9PT0gZmFsc2UpIHtcbiAgICBmaWxlTmFtZSArPSAnLm1pZCc7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhmaWxlTmFtZSwgaGFzRXh0ZW5zaW9uKVxuICAoMCwgX2ZpbGVzYXZlcmpzLnNhdmVBcykobWlkaUZpbGUsIGZpbGVOYW1lKTtcbiAgLy93aW5kb3cubG9jYXRpb24uYXNzaWduKHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKG1pZGlGaWxlKSlcbn1cblxuZnVuY3Rpb24gdHJhY2tUb0J5dGVzKGV2ZW50cywgbGFzdEV2ZW50VGlja3MsIHRyYWNrTmFtZSkge1xuICB2YXIgaW5zdHJ1bWVudE5hbWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6ICdubyBpbnN0cnVtZW50JztcblxuICB2YXIgbGVuZ3RoQnl0ZXMsXG4gICAgICBpLFxuICAgICAgbWF4aSxcbiAgICAgIGV2ZW50LFxuICAgICAgc3RhdHVzLFxuICAgICAgdHJhY2tMZW5ndGgsXG4gICAgICAvLyBudW1iZXIgb2YgYnl0ZXMgaW4gdHJhY2sgY2h1bmtcbiAgdGlja3MgPSAwLFxuICAgICAgZGVsdGEgPSAwLFxuICAgICAgdHJhY2tCeXRlcyA9IFtdO1xuXG4gIGlmICh0cmFja05hbWUpIHtcbiAgICB0cmFja0J5dGVzLnB1c2goMHgwMCk7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAzKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKHRyYWNrTmFtZS5sZW5ndGgpKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoc3RyaW5nVG9OdW1BcnJheSh0cmFja05hbWUpKTtcbiAgfVxuXG4gIGlmIChpbnN0cnVtZW50TmFtZSkge1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDQpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoaW5zdHJ1bWVudE5hbWUubGVuZ3RoKSk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KHN0cmluZ1RvTnVtQXJyYXkoaW5zdHJ1bWVudE5hbWUpKTtcbiAgfVxuXG4gIGZvciAoaSA9IDAsIG1heGkgPSBldmVudHMubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKSB7XG4gICAgZXZlbnQgPSBldmVudHNbaV07XG4gICAgZGVsdGEgPSBldmVudC50aWNrcyAtIHRpY2tzO1xuICAgIGRlbHRhID0gY29udmVydFRvVkxRKGRlbHRhKTtcbiAgICAvL2NvbnNvbGUubG9nKGRlbHRhKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoZGVsdGEpO1xuICAgIC8vdHJhY2tCeXRlcy5wdXNoLmFwcGx5KHRyYWNrQnl0ZXMsIGRlbHRhKTtcbiAgICBpZiAoZXZlbnQudHlwZSA9PT0gMHg4MCB8fCBldmVudC50eXBlID09PSAweDkwKSB7XG4gICAgICAvLyBub3RlIG9mZiwgbm90ZSBvblxuICAgICAgLy9zdGF0dXMgPSBwYXJzZUludChldmVudC50eXBlLnRvU3RyaW5nKDE2KSArIGV2ZW50LmNoYW5uZWwudG9TdHJpbmcoMTYpLCAxNik7XG4gICAgICBzdGF0dXMgPSBldmVudC50eXBlICsgKGV2ZW50LmNoYW5uZWwgfHwgMCk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goc3RhdHVzKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChldmVudC5kYXRhMSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQuZGF0YTIpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gMHg1MSkge1xuICAgICAgLy8gdGVtcG9cbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDUxKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDAzKTsgLy8gbGVuZ3RoXG4gICAgICAvL3RyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoMykpOy8vIGxlbmd0aFxuICAgICAgdmFyIG1pY3JvU2Vjb25kcyA9IE1hdGgucm91bmQoNjAwMDAwMDAgLyBldmVudC5icG0pO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5icG0pXG4gICAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoc3RyMkJ5dGVzKG1pY3JvU2Vjb25kcy50b1N0cmluZygxNiksIDMpKTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09IDB4NTgpIHtcbiAgICAgIC8vIHRpbWUgc2lnbmF0dXJlXG4gICAgICB2YXIgZGVub20gPSBldmVudC5kZW5vbWluYXRvcjtcbiAgICAgIGlmIChkZW5vbSA9PT0gMikge1xuICAgICAgICBkZW5vbSA9IDB4MDE7XG4gICAgICB9IGVsc2UgaWYgKGRlbm9tID09PSA0KSB7XG4gICAgICAgIGRlbm9tID0gMHgwMjtcbiAgICAgIH0gZWxzZSBpZiAoZGVub20gPT09IDgpIHtcbiAgICAgICAgZGVub20gPSAweDAzO1xuICAgICAgfSBlbHNlIGlmIChkZW5vbSA9PT0gMTYpIHtcbiAgICAgICAgZGVub20gPSAweDA0O1xuICAgICAgfSBlbHNlIGlmIChkZW5vbSA9PT0gMzIpIHtcbiAgICAgICAgZGVub20gPSAweDA1O1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5kZW5vbWluYXRvciwgZXZlbnQubm9taW5hdG9yKVxuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4NTgpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4MDQpOyAvLyBsZW5ndGhcbiAgICAgIC8vdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUSg0KSk7Ly8gbGVuZ3RoXG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChkZW5vbSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goUFBRIC8gZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDA4KTsgLy8gMzJuZCBub3RlcyBwZXIgY3JvdGNoZXRcbiAgICAgIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCBldmVudC5ub21pbmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yLCBkZW5vbSwgUFBRL2V2ZW50Lm5vbWluYXRvcik7XG4gICAgfVxuICAgIC8vIHNldCB0aGUgbmV3IHRpY2tzIHJlZmVyZW5jZVxuICAgIC8vY29uc29sZS5sb2coc3RhdHVzLCBldmVudC50aWNrcywgdGlja3MpO1xuICAgIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIH1cbiAgZGVsdGEgPSBsYXN0RXZlbnRUaWNrcyAtIHRpY2tzO1xuICAvL2NvbnNvbGUubG9nKCdkJywgZGVsdGEsICd0JywgdGlja3MsICdsJywgbGFzdEV2ZW50VGlja3MpO1xuICBkZWx0YSA9IGNvbnZlcnRUb1ZMUShkZWx0YSk7XG4gIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCB0aWNrcywgZGVsdGEpO1xuICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoZGVsdGEpO1xuICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gIHRyYWNrQnl0ZXMucHVzaCgweDJGKTtcbiAgdHJhY2tCeXRlcy5wdXNoKDB4MDApO1xuICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgdHJhY2tCeXRlcyk7XG4gIHRyYWNrTGVuZ3RoID0gdHJhY2tCeXRlcy5sZW5ndGg7XG4gIGxlbmd0aEJ5dGVzID0gc3RyMkJ5dGVzKHRyYWNrTGVuZ3RoLnRvU3RyaW5nKDE2KSwgNCk7XG4gIHJldHVybiBbXS5jb25jYXQoVFJLX0NIVU5LSUQsIGxlbmd0aEJ5dGVzLCB0cmFja0J5dGVzKTtcbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuXG4vKlxuICogQ29udmVydHMgYW4gYXJyYXkgb2YgYnl0ZXMgdG8gYSBzdHJpbmcgb2YgaGV4YWRlY2ltYWwgY2hhcmFjdGVycy4gUHJlcGFyZXNcbiAqIGl0IHRvIGJlIGNvbnZlcnRlZCBpbnRvIGEgYmFzZTY0IHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gYnl0ZUFycmF5IHtBcnJheX0gYXJyYXkgb2YgYnl0ZXMgdGhhdCB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZ1xuICogQHJldHVybnMgaGV4YWRlY2ltYWwgc3RyaW5nXG4gKi9cblxuZnVuY3Rpb24gY29kZXMyU3RyKGJ5dGVBcnJheSkge1xuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBieXRlQXJyYXkpO1xufVxuXG4vKlxuICogQ29udmVydHMgYSBTdHJpbmcgb2YgaGV4YWRlY2ltYWwgdmFsdWVzIHRvIGFuIGFycmF5IG9mIGJ5dGVzLiBJdCBjYW4gYWxzb1xuICogYWRkIHJlbWFpbmluZyAnMCcgbmliYmxlcyBpbiBvcmRlciB0byBoYXZlIGVub3VnaCBieXRlcyBpbiB0aGUgYXJyYXkgYXMgdGhlXG4gKiB8ZmluYWxCeXRlc3wgcGFyYW1ldGVyLlxuICpcbiAqIEBwYXJhbSBzdHIge1N0cmluZ30gc3RyaW5nIG9mIGhleGFkZWNpbWFsIHZhbHVlcyBlLmcuICcwOTdCOEEnXG4gKiBAcGFyYW0gZmluYWxCeXRlcyB7SW50ZWdlcn0gT3B0aW9uYWwuIFRoZSBkZXNpcmVkIG51bWJlciBvZiBieXRlcyB0aGF0IHRoZSByZXR1cm5lZCBhcnJheSBzaG91bGQgY29udGFpblxuICogQHJldHVybnMgYXJyYXkgb2YgbmliYmxlcy5cbiAqL1xuXG5mdW5jdGlvbiBzdHIyQnl0ZXMoc3RyLCBmaW5hbEJ5dGVzKSB7XG4gIGlmIChmaW5hbEJ5dGVzKSB7XG4gICAgd2hpbGUgKHN0ci5sZW5ndGggLyAyIDwgZmluYWxCeXRlcykge1xuICAgICAgc3RyID0gJzAnICsgc3RyO1xuICAgIH1cbiAgfVxuXG4gIHZhciBieXRlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gc3RyLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAyKSB7XG4gICAgdmFyIGNoYXJzID0gaSA9PT0gMCA/IHN0cltpXSA6IHN0cltpIC0gMV0gKyBzdHJbaV07XG4gICAgYnl0ZXMudW5zaGlmdChwYXJzZUludChjaGFycywgMTYpKTtcbiAgfVxuXG4gIHJldHVybiBieXRlcztcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGVzIG51bWJlciBvZiB0aWNrcyB0byBNSURJIHRpbWVzdGFtcCBmb3JtYXQsIHJldHVybmluZyBhbiBhcnJheSBvZlxuICogYnl0ZXMgd2l0aCB0aGUgdGltZSB2YWx1ZXMuIE1pZGkgaGFzIGEgdmVyeSBwYXJ0aWN1bGFyIHRpbWUgdG8gZXhwcmVzcyB0aW1lLFxuICogdGFrZSBhIGdvb2QgbG9vayBhdCB0aGUgc3BlYyBiZWZvcmUgZXZlciB0b3VjaGluZyB0aGlzIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB0aWNrcyB7SW50ZWdlcn0gTnVtYmVyIG9mIHRpY2tzIHRvIGJlIHRyYW5zbGF0ZWRcbiAqIEByZXR1cm5zIEFycmF5IG9mIGJ5dGVzIHRoYXQgZm9ybSB0aGUgTUlESSB0aW1lIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRUb1ZMUSh0aWNrcykge1xuICB2YXIgYnVmZmVyID0gdGlja3MgJiAweDdGO1xuXG4gIHdoaWxlICh0aWNrcyA9IHRpY2tzID4+IDcpIHtcbiAgICBidWZmZXIgPDw9IDg7XG4gICAgYnVmZmVyIHw9IHRpY2tzICYgMHg3RiB8IDB4ODA7XG4gIH1cblxuICB2YXIgYkxpc3QgPSBbXTtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBiTGlzdC5wdXNoKGJ1ZmZlciAmIDB4ZmYpO1xuXG4gICAgaWYgKGJ1ZmZlciAmIDB4ODApIHtcbiAgICAgIGJ1ZmZlciA+Pj0gODtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyh0aWNrcywgYkxpc3QpO1xuICByZXR1cm4gYkxpc3Q7XG59XG5cbi8qXG4gKiBDb252ZXJ0cyBhIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIEFTQ0lJIGNoYXIgY29kZXMgZm9yIGV2ZXJ5IGNoYXJhY3RlciBvZlxuICogdGhlIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gc3RyIHtTdHJpbmd9IFN0cmluZyB0byBiZSBjb252ZXJ0ZWRcbiAqIEByZXR1cm5zIGFycmF5IHdpdGggdGhlIGNoYXJjb2RlIHZhbHVlcyBvZiB0aGUgc3RyaW5nXG4gKi9cbnZhciBBUCA9IEFycmF5LnByb3RvdHlwZTtcbmZ1bmN0aW9uIHN0cmluZ1RvTnVtQXJyYXkoc3RyKSB7XG4gIC8vIHJldHVybiBzdHIuc3BsaXQoKS5mb3JFYWNoKGNoYXIgPT4ge1xuICAvLyAgIHJldHVybiBjaGFyLmNoYXJDb2RlQXQoMClcbiAgLy8gfSlcbiAgcmV0dXJuIEFQLm1hcC5jYWxsKHN0ciwgZnVuY3Rpb24gKGNoYXIpIHtcbiAgICByZXR1cm4gY2hhci5jaGFyQ29kZUF0KDApO1xuICB9KTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfaW5pdF9taWRpID0gcmVxdWlyZSgnLi9pbml0X21pZGknKTtcblxudmFyIF9pbml0X2F1ZGlvID0gcmVxdWlyZSgnLi9pbml0X2F1ZGlvJyk7XG5cbnZhciBfbWlkaV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaV9ldmVudCcpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vIG1pbGxpc1xuXG5cbnZhciBTY2hlZHVsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFNjaGVkdWxlcihzb25nKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNjaGVkdWxlcik7XG5cbiAgICB0aGlzLnNvbmcgPSBzb25nO1xuICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5idWZmZXJUaW1lID0gc29uZy5idWZmZXJUaW1lO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFNjaGVkdWxlciwgW3tcbiAgICBrZXk6ICdpbml0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdChtaWxsaXMpIHtcbiAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSBtaWxsaXM7XG4gICAgICB0aGlzLnNvbmdTdGFydE1pbGxpcyA9IG1pbGxpcztcbiAgICAgIHRoaXMuZXZlbnRzID0gdGhpcy5zb25nLl9hbGxFdmVudHM7XG4gICAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aDtcbiAgICAgIHRoaXMuaW5kZXggPSAwO1xuICAgICAgdGhpcy5tYXh0aW1lID0gMDtcbiAgICAgIHRoaXMucHJldk1heHRpbWUgPSAwO1xuICAgICAgdGhpcy5iZXlvbmRMb29wID0gZmFsc2U7IC8vIHRlbGxzIHVzIGlmIHRoZSBwbGF5aGVhZCBoYXMgYWxyZWFkeSBwYXNzZWQgdGhlIGxvb3BlZCBzZWN0aW9uXG4gICAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5sb29wZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRNaWxsaXMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZVNvbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVTb25nKCkge1xuICAgICAgLy90aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzXG4gICAgICB0aGlzLmV2ZW50cyA9IHRoaXMuc29uZy5fYWxsRXZlbnRzO1xuICAgICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGg7XG4gICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICAgIHRoaXMubWF4dGltZSA9IDA7XG4gICAgICAvL3RoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nLl9jdXJyZW50TWlsbGlzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRUaW1lU3RhbXAnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRUaW1lU3RhbXAodGltZVN0YW1wKSB7XG4gICAgICB0aGlzLnRpbWVTdGFtcCA9IHRpbWVTdGFtcDsgLy8gdGltZXN0YW1wIFdlYkF1ZGlvIGNvbnRleHQgLT4gZm9yIGludGVybmFsIGluc3RydW1lbnRzXG4gICAgICB0aGlzLnRpbWVTdGFtcDIgPSBwZXJmb3JtYW5jZS5ub3coKTsgLy8gdGltZXN0YW1wIHNpbmNlIG9wZW5pbmcgd2VicGFnZSAtPiBmb3IgZXh0ZXJuYWwgaW5zdHJ1bWVudHNcbiAgICB9XG5cbiAgICAvLyBnZXQgdGhlIGluZGV4IG9mIHRoZSBldmVudCB0aGF0IGhhcyBpdHMgbWlsbGlzIHZhbHVlIGF0IG9yIHJpZ2h0IGFmdGVyIHRoZSBwcm92aWRlZCBtaWxsaXMgdmFsdWVcblxuICB9LCB7XG4gICAga2V5OiAnc2V0SW5kZXgnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRJbmRleChtaWxsaXMpIHtcbiAgICAgIHZhciBpID0gMDtcbiAgICAgIHZhciBldmVudCA9IHZvaWQgMDtcbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0aGlzLmV2ZW50c1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICBldmVudCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYmV5b25kTG9vcCA9IG1pbGxpcyA+IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcztcbiAgICAgIC8vIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICAgIC8vdGhpcy5sb29wZWQgPSBmYWxzZVxuICAgICAgdGhpcy5wcmVjb3VudGluZ0RvbmUgPSBmYWxzZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFdmVudHMoKSB7XG4gICAgICB2YXIgZXZlbnRzID0gW107XG5cbiAgICAgIGlmICh0aGlzLnNvbmcuX2xvb3AgPT09IHRydWUgJiYgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gPCB0aGlzLmJ1ZmZlclRpbWUpIHtcbiAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nU3RhcnRNaWxsaXMgKyB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvbiAtIDE7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCB0aGlzLnNvbmcubG9vcER1cmF0aW9uKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc29uZy5fbG9vcCA9PT0gdHJ1ZSkge1xuXG4gICAgICAgIGlmICh0aGlzLm1heHRpbWUgPj0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzICYmIHRoaXMuYmV5b25kTG9vcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdMT09QJywgdGhpcy5tYXh0aW1lLCB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMpXG5cbiAgICAgICAgICB2YXIgZGlmZiA9IHRoaXMubWF4dGltZSAtIHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcztcbiAgICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmcuX2xlZnRMb2NhdG9yLm1pbGxpcyArIGRpZmY7XG5cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tTE9PUEVEJywgdGhpcy5tYXh0aW1lLCBkaWZmLCB0aGlzLnNvbmcuX2xlZnRMb2NhdG9yLm1pbGxpcywgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKTtcblxuICAgICAgICAgIGlmICh0aGlzLmxvb3BlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMubG9vcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBsZWZ0TWlsbGlzID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXM7XG4gICAgICAgICAgICB2YXIgcmlnaHRNaWxsaXMgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXM7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgICAgICAgaWYgKGV2ZW50Lm1pbGxpcyA8IHJpZ2h0TWlsbGlzKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG4gICAgICAgICAgICAgICAgZXZlbnQudGltZTIgPSB0aGlzLnRpbWVTdGFtcDIgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLm5vdGVzLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQudHlwZSlcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3RvcCBvdmVyZmxvd2luZyBub3Rlcy0+IGFkZCBhIG5ldyBub3RlIG9mZiBldmVudCBhdCB0aGUgcG9zaXRpb24gb2YgdGhlIHJpZ2h0IGxvY2F0b3IgKGVuZCBvZiB0aGUgbG9vcClcbiAgICAgICAgICAgIHZhciBlbmRUaWNrcyA9IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLnRpY2tzIC0gMTtcbiAgICAgICAgICAgIHZhciBlbmRNaWxsaXMgPSB0aGlzLnNvbmcuY2FsY3VsYXRlUG9zaXRpb24oeyB0eXBlOiAndGlja3MnLCB0YXJnZXQ6IGVuZFRpY2tzLCByZXN1bHQ6ICdtaWxsaXMnIH0pLm1pbGxpcztcblxuICAgICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSB0aGlzLm5vdGVzLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vdGUgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgICAgICAgICAgICB2YXIgbm90ZU9uID0gbm90ZS5ub3RlT247XG4gICAgICAgICAgICAgICAgdmFyIG5vdGVPZmYgPSBub3RlLm5vdGVPZmY7XG4gICAgICAgICAgICAgICAgaWYgKG5vdGVPZmYubWlsbGlzIDw9IHJpZ2h0TWlsbGlzKSB7XG4gICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIF9ldmVudCA9IG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQoZW5kVGlja3MsIDEyOCwgbm90ZU9uLmRhdGExLCAwKTtcbiAgICAgICAgICAgICAgICBfZXZlbnQubWlsbGlzID0gZW5kTWlsbGlzO1xuICAgICAgICAgICAgICAgIF9ldmVudC5fcGFydCA9IG5vdGVPbi5fcGFydDtcbiAgICAgICAgICAgICAgICBfZXZlbnQuX3RyYWNrID0gbm90ZU9uLl90cmFjaztcbiAgICAgICAgICAgICAgICBfZXZlbnQubWlkaU5vdGUgPSBub3RlO1xuICAgICAgICAgICAgICAgIF9ldmVudC5taWRpTm90ZUlkID0gbm90ZS5pZDtcbiAgICAgICAgICAgICAgICBfZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgX2V2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuICAgICAgICAgICAgICAgIF9ldmVudC50aW1lMiA9IHRoaXMudGltZVN0YW1wMiArIF9ldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdhZGRlZCcsIGV2ZW50KVxuICAgICAgICAgICAgICAgIGV2ZW50cy5wdXNoKF9ldmVudCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RvcCBvdmVyZmxvd2luZyBhdWRpbyBzYW1wbGVzXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IoaSBpbiB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cy5oYXNPd25Qcm9wZXJ0eShpKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9FdmVudCA9IHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXVkaW9FdmVudC5lbmRNaWxsaXMgPiB0aGlzLnNvbmcubG9vcEVuZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdWRpb0V2ZW50LnN0b3BTYW1wbGUodGhpcy5zb25nLmxvb3BFbmQvMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3BwaW5nIGF1ZGlvIGV2ZW50JywgaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICovXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgICAgICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0aGlzLnNldEluZGV4KGxlZnRNaWxsaXMpO1xuICAgICAgICAgICAgdGhpcy50aW1lU3RhbXAgKz0gdGhpcy5zb25nLl9sb29wRHVyYXRpb247XG4gICAgICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzIC09IHRoaXMuc29uZy5fbG9vcER1cmF0aW9uO1xuXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50cy5sZW5ndGgpXG5cbiAgICAgICAgICAgIC8vIGdldCB0aGUgYXVkaW8gZXZlbnRzIHRoYXQgc3RhcnQgYmVmb3JlIHNvbmcubG9vcFN0YXJ0XG4gICAgICAgICAgICAvL3RoaXMuZ2V0RGFuZ2xpbmdBdWRpb0V2ZW50cyh0aGlzLnNvbmcubG9vcFN0YXJ0LCBldmVudHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxvb3BlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxlcicsIHRoaXMubG9vcGVkKVxuXG4gICAgICAvLyBtYWluIGxvb3BcbiAgICAgIGZvciAodmFyIF9pID0gdGhpcy5pbmRleDsgX2kgPCB0aGlzLm51bUV2ZW50czsgX2krKykge1xuICAgICAgICB2YXIgX2V2ZW50MiA9IHRoaXMuZXZlbnRzW19pXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWxsaXMsIHRoaXMubWF4dGltZSlcbiAgICAgICAgaWYgKF9ldmVudDIubWlsbGlzIDwgdGhpcy5tYXh0aW1lKSB7XG5cbiAgICAgICAgICAvL2V2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuXG4gICAgICAgICAgaWYgKF9ldmVudDIudHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2V2ZW50Mi50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBfZXZlbnQyLm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuICAgICAgICAgICAgX2V2ZW50Mi50aW1lMiA9IHRoaXMudGltZVN0YW1wMiArIF9ldmVudDIubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG4gICAgICAgICAgICBldmVudHMucHVzaChfZXZlbnQyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZXZlbnRzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZShkaWZmKSB7XG4gICAgICB2YXIgaSwgZXZlbnQsIG51bUV2ZW50cywgdHJhY2ssIGV2ZW50cztcblxuICAgICAgdGhpcy5wcmV2TWF4dGltZSA9IHRoaXMubWF4dGltZTtcblxuICAgICAgaWYgKHRoaXMuc29uZy5wcmVjb3VudGluZykge1xuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmY7XG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyB0aGlzLmJ1ZmZlclRpbWU7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5zb25nQ3VycmVudE1pbGxpcylcbiAgICAgICAgZXZlbnRzID0gdGhpcy5zb25nLl9tZXRyb25vbWUuZ2V0UHJlY291bnRFdmVudHModGhpcy5tYXh0aW1lKTtcblxuICAgICAgICAvLyBpZihldmVudHMubGVuZ3RoID4gMCl7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApXG4gICAgICAgIC8vICAgY29uc29sZS5sb2coZXZlbnRzKVxuICAgICAgICAvLyB9XG5cbiAgICAgICAgaWYgKHRoaXMubWF4dGltZSA+IHRoaXMuc29uZy5fbWV0cm9ub21lLmVuZE1pbGxpcyAmJiB0aGlzLnByZWNvdW50aW5nRG9uZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICB2YXIgX2V2ZW50cztcblxuICAgICAgICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX3ByZWNvdW50RHVyYXRpb247XG5cbiAgICAgICAgICAvLyBzdGFydCBzY2hlZHVsaW5nIGV2ZW50cyBvZiB0aGUgc29uZyAtPiBhZGQgdGhlIGZpcnN0IGV2ZW50cyBvZiB0aGUgc29uZ1xuICAgICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSB0aGlzLnNvbmdTdGFydE1pbGxpcztcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCctLS0tPicsIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMpXG4gICAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyArPSBkaWZmO1xuICAgICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyB0aGlzLmJ1ZmZlclRpbWU7XG4gICAgICAgICAgKF9ldmVudHMgPSBldmVudHMpLnB1c2guYXBwbHkoX2V2ZW50cywgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuZ2V0RXZlbnRzKCkpKTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyArPSBkaWZmO1xuICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgdGhpcy5idWZmZXJUaW1lO1xuICAgICAgICBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpO1xuICAgICAgICAvL2V2ZW50cyA9IHRoaXMuc29uZy5fZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAgICAgLy9ldmVudHMgPSB0aGlzLmdldEV2ZW50czIodGhpcy5tYXh0aW1lLCAodGhpcy50aW1lU3RhbXAgLSB0aGlzLnNvbmdTdGFydE1pbGxpcykpXG4gICAgICAgIC8vY29uc29sZS5sb2coJ2RvbmUnLCB0aGlzLnNvbmdDdXJyZW50TWlsbGlzLCBkaWZmLCB0aGlzLmluZGV4LCBldmVudHMubGVuZ3RoKVxuICAgICAgfVxuXG4gICAgICAvLyBpZih0aGlzLnNvbmcudXNlTWV0cm9ub21lID09PSB0cnVlKXtcbiAgICAgIC8vICAgbGV0IG1ldHJvbm9tZUV2ZW50cyA9IHRoaXMuc29uZy5fbWV0cm9ub21lLmdldEV2ZW50czIodGhpcy5tYXh0aW1lLCAodGhpcy50aW1lU3RhbXAgLSB0aGlzLnNvbmdTdGFydE1pbGxpcykpXG4gICAgICAvLyAgIC8vIGlmKG1ldHJvbm9tZUV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAgIC8vICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLm1heHRpbWUsIG1ldHJvbm9tZUV2ZW50cylcbiAgICAgIC8vICAgLy8gfVxuICAgICAgLy8gICAvLyBtZXRyb25vbWVFdmVudHMuZm9yRWFjaChlID0+IHtcbiAgICAgIC8vICAgLy8gICBlLnRpbWUgPSAodGhpcy50aW1lU3RhbXAgKyBlLm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKVxuICAgICAgLy8gICAvLyB9KVxuICAgICAgLy8gICBldmVudHMucHVzaCguLi5tZXRyb25vbWVFdmVudHMpXG4gICAgICAvLyB9XG5cbiAgICAgIG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGg7XG5cbiAgICAgIC8vIGlmKG51bUV2ZW50cyA+IDUpe1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhudW1FdmVudHMpXG4gICAgICAvLyB9XG5cbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCB0aGlzLnNvbmcuX2N1cnJlbnRNaWxsaXMsICdbZGlmZl0nLCB0aGlzLm1heHRpbWUgLSB0aGlzLnByZXZNYXh0aW1lKVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtRXZlbnRzOyBpKyspIHtcbiAgICAgICAgZXZlbnQgPSBldmVudHNbaV07XG4gICAgICAgIHRyYWNrID0gZXZlbnQuX3RyYWNrO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm1heHRpbWUsIHRoaXMucHJldk1heHRpbWUsIGV2ZW50Lm1pbGxpcylcblxuICAgICAgICAvLyBpZihldmVudC5taWxsaXMgPiB0aGlzLm1heHRpbWUpe1xuICAgICAgICAvLyAgIC8vIHNraXAgZXZlbnRzIHRoYXQgd2VyZSBoYXJ2ZXN0IGFjY2lkZW50bHkgd2hpbGUganVtcGluZyB0aGUgcGxheWhlYWQgLT4gc2hvdWxkIGhhcHBlbiB2ZXJ5IHJhcmVseSBpZiBldmVyXG4gICAgICAgIC8vICAgY29uc29sZS5sb2coJ3NraXAnLCBldmVudClcbiAgICAgICAgLy8gICBjb250aW51ZVxuICAgICAgICAvLyB9XG5cbiAgICAgICAgaWYgKGV2ZW50Ll9wYXJ0ID09PSBudWxsIHx8IHRyYWNrID09PSBudWxsKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC5fcGFydC5tdXRlZCA9PT0gdHJ1ZSB8fCB0cmFjay5tdXRlZCA9PT0gdHJ1ZSB8fCBldmVudC5tdXRlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTI4KSAmJiB0eXBlb2YgZXZlbnQubWlkaU5vdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gdGhpcyBpcyB1c3VhbGx5IGNhdXNlZCBieSB0aGUgc2FtZSBub3RlIG9uIHRoZSBzYW1lIHRpY2tzIHZhbHVlLCB3aGljaCBpcyBwcm9iYWJseSBhIGJ1ZyBpbiB0aGUgbWlkaSBmaWxlXG4gICAgICAgICAgLy9jb25zb2xlLmluZm8oJ25vIG1pZGlOb3RlSWQnLCBldmVudClcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyAvY29uc29sZS5sb2coZXZlbnQudGlja3MsIGV2ZW50LnRpbWUsIGV2ZW50Lm1pbGxpcywgZXZlbnQudHlwZSwgZXZlbnQuX3RyYWNrLm5hbWUpXG5cbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyYWNrLnByb2Nlc3NNSURJRXZlbnQoZXZlbnQpO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAsIGV2ZW50LnRpbWUsIHRoaXMuaW5kZXgpXG4gICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IDE0NCkge1xuICAgICAgICAgICAgdGhpcy5ub3Rlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gMTI4KSB7XG4gICAgICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShldmVudC5taWRpTm90ZUlkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gaWYodGhpcy5ub3Rlcy5zaXplID4gMCl7XG4gICAgICAgICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLm5vdGVzKVxuICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLmluZGV4LCB0aGlzLm51bUV2ZW50cylcbiAgICAgIC8vcmV0dXJuIHRoaXMuaW5kZXggPj0gMTBcbiAgICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubnVtRXZlbnRzOyAvLyBsYXN0IGV2ZW50IG9mIHNvbmdcbiAgICB9XG5cbiAgICAvKlxuICAgICAgdW5zY2hlZHVsZSgpe1xuICAgIFxuICAgICAgICBsZXQgbWluID0gdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzXG4gICAgICAgIGxldCBtYXggPSBtaW4gKyAoYnVmZmVyVGltZSAqIDEwMDApXG4gICAgXG4gICAgICAgIC8vY29uc29sZS5sb2coJ3Jlc2NoZWR1bGUnLCB0aGlzLm5vdGVzLnNpemUpXG4gICAgICAgIHRoaXMubm90ZXMuZm9yRWFjaCgobm90ZSwgaWQpID0+IHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhub3RlKVxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG5vdGUubm90ZU9uLm1pbGxpcywgbm90ZS5ub3RlT2ZmLm1pbGxpcywgbWluLCBtYXgpXG4gICAgXG4gICAgICAgICAgaWYodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnIHx8IG5vdGUuc3RhdGUgPT09ICdyZW1vdmVkJyl7XG4gICAgICAgICAgICAvL3NhbXBsZS51bnNjaGVkdWxlKDAsIHVuc2NoZWR1bGVDYWxsYmFjayk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdOT1RFIElTIFVOREVGSU5FRCcpXG4gICAgICAgICAgICAvL3NhbXBsZS5zdG9wKDApXG4gICAgICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShpZClcbiAgICAgICAgICB9ZWxzZSBpZigobm90ZS5ub3RlT24ubWlsbGlzID49IG1pbiB8fCBub3RlLm5vdGVPZmYubWlsbGlzIDwgbWF4KSA9PT0gZmFsc2Upe1xuICAgICAgICAgICAgLy9zYW1wbGUuc3RvcCgwKVxuICAgICAgICAgICAgbGV0IG5vdGVPbiA9IG5vdGUubm90ZU9uXG4gICAgICAgICAgICBsZXQgbm90ZU9mZiA9IG5ldyBNSURJRXZlbnQoMCwgMTI4LCBub3RlT24uZGF0YTEsIDApXG4gICAgICAgICAgICBub3RlT2ZmLm1pZGlOb3RlSWQgPSBub3RlLmlkXG4gICAgICAgICAgICBub3RlT2ZmLnRpbWUgPSAwLy9jb250ZXh0LmN1cnJlbnRUaW1lICsgbWluXG4gICAgICAgICAgICBub3RlLl90cmFjay5wcm9jZXNzTUlESUV2ZW50KG5vdGVPZmYpXG4gICAgICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShpZClcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTVE9QUElORycsIGlkLCBub3RlLl90cmFjay5uYW1lKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLy9jb25zb2xlLmxvZygnTk9URVMnLCB0aGlzLm5vdGVzLnNpemUpXG4gICAgICAgIC8vdGhpcy5ub3Rlcy5jbGVhcigpXG4gICAgICB9XG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnYWxsTm90ZXNPZmYnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhbGxOb3Rlc09mZigpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciB0aW1lU3RhbXAgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIHZhciBvdXRwdXRzID0gKDAsIF9pbml0X21pZGkuZ2V0TUlESU91dHB1dHMpKCk7XG4gICAgICBvdXRwdXRzLmZvckVhY2goZnVuY3Rpb24gKG91dHB1dCkge1xuICAgICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWVTdGFtcCArIF90aGlzLmJ1ZmZlclRpbWUpOyAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWVTdGFtcCArIF90aGlzLmJ1ZmZlclRpbWUpOyAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTY2hlZHVsZXI7XG59KCk7XG5cbi8qXG5cbiAgZ2V0RXZlbnRzMihtYXh0aW1lLCB0aW1lc3RhbXApe1xuICAgIGxldCBsb29wID0gdHJ1ZVxuICAgIGxldCBldmVudFxuICAgIGxldCByZXN1bHQgPSBbXVxuICAgIC8vY29uc29sZS5sb2codGhpcy50aW1lRXZlbnRzSW5kZXgsIHRoaXMuc29uZ0V2ZW50c0luZGV4LCB0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4KVxuICAgIHdoaWxlKGxvb3Ape1xuXG4gICAgICBsZXQgc3RvcCA9IGZhbHNlXG5cbiAgICAgIGlmKHRoaXMudGltZUV2ZW50c0luZGV4IDwgdGhpcy5udW1UaW1lRXZlbnRzKXtcbiAgICAgICAgZXZlbnQgPSB0aGlzLnRpbWVFdmVudHNbdGhpcy50aW1lRXZlbnRzSW5kZXhdXG4gICAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIHRoaXMubWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2tcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMubWlsbGlzUGVyVGljaylcbiAgICAgICAgICB0aGlzLnRpbWVFdmVudHNJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN0b3AgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYodGhpcy5zb25nRXZlbnRzSW5kZXggPCB0aGlzLm51bVNvbmdFdmVudHMpe1xuICAgICAgICBldmVudCA9IHRoaXMuc29uZ0V2ZW50c1t0aGlzLnNvbmdFdmVudHNJbmRleF1cbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMHgyRil7XG4gICAgICAgICAgbG9vcCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBsZXQgbWlsbGlzID0gZXZlbnQudGlja3MgKiB0aGlzLm1pbGxpc1BlclRpY2tcbiAgICAgICAgaWYobWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgZXZlbnQudGltZSA9IG1pbGxpcyArIHRpbWVzdGFtcFxuICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgICAgICAgIHRoaXMuc29uZ0V2ZW50c0luZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3RvcCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZih0aGlzLnNvbmcudXNlTWV0cm9ub21lID09PSB0cnVlICYmIHRoaXMubWV0cm9ub21lRXZlbnRzSW5kZXggPCB0aGlzLm51bU1ldHJvbm9tZUV2ZW50cyl7XG4gICAgICAgIGV2ZW50ID0gdGhpcy5tZXRyb25vbWVFdmVudHNbdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleF1cbiAgICAgICAgbGV0IG1pbGxpcyA9IGV2ZW50LnRpY2tzICogdGhpcy5taWxsaXNQZXJUaWNrXG4gICAgICAgIGlmKG1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIGV2ZW50LnRpbWUgPSBtaWxsaXMgKyB0aW1lc3RhbXBcbiAgICAgICAgICBldmVudC5taWxsaXMgPSBtaWxsaXNcbiAgICAgICAgICByZXN1bHQucHVzaChldmVudClcbiAgICAgICAgICB0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3RvcCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihzdG9wKXtcbiAgICAgICAgbG9vcCA9IGZhbHNlXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIHNvcnRFdmVudHMocmVzdWx0KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG5cbiovXG5cblxuZXhwb3J0cy5kZWZhdWx0ID0gU2NoZWR1bGVyOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZXhwb3J0cy51cGRhdGVTZXR0aW5ncyA9IHVwZGF0ZVNldHRpbmdzO1xuZXhwb3J0cy5nZXRTZXR0aW5ncyA9IGdldFNldHRpbmdzO1xuLy9pbXBvcnQgZ21JbnN0cnVtZW50cyBmcm9tICcuL2dtX2luc3RydW1lbnRzJ1xuXG4vL2NvbnN0IHBhcmFtcyA9IFsncHBxJywgJ2JwbScsICdiYXJzJywgJ3BpdGNoJywgJ2J1ZmZlclRpbWUnLCAnbG93ZXN0Tm90ZScsICdoaWdoZXN0Tm90ZScsICdub3RlTmFtZU1vZGUnLCAnbm9taW5hdG9yJywgJ2Rlbm9taW5hdG9yJywgJ3F1YW50aXplVmFsdWUnLCAnZml4ZWRMZW5ndGhWYWx1ZScsICdwb3NpdGlvblR5cGUnLCAndXNlTWV0cm9ub21lJywgJ2F1dG9TaXplJywgJ3BsYXliYWNrU3BlZWQnLCAnYXV0b1F1YW50aXplJywgXVxuXG52YXIgc2V0dGluZ3MgPSB7XG4gIHBwcTogOTYwLFxuICBicG06IDEyMCxcbiAgYmFyczogMTYsXG4gIHBpdGNoOiA0NDAsXG4gIGJ1ZmZlclRpbWU6IDIwMCxcbiAgbG93ZXN0Tm90ZTogMCxcbiAgaGlnaGVzdE5vdGU6IDEyNyxcbiAgbm90ZU5hbWVNb2RlOiAnc2hhcnAnLFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIHBsYXliYWNrU3BlZWQ6IDEsXG4gIGF1dG9RdWFudGl6ZTogZmFsc2UsXG4gIHZvbHVtZTogMC41XG59O1xuXG5mdW5jdGlvbiB1cGRhdGVTZXR0aW5ncyhkYXRhKSB7XG4gIHZhciBfZGF0YSRwcHEgPSBkYXRhLnBwcTtcbiAgc2V0dGluZ3MucHBxID0gX2RhdGEkcHBxID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5wcHEgOiBfZGF0YSRwcHE7XG4gIHZhciBfZGF0YSRicG0gPSBkYXRhLmJwbTtcbiAgc2V0dGluZ3MuYnBtID0gX2RhdGEkYnBtID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5icG0gOiBfZGF0YSRicG07XG4gIHZhciBfZGF0YSRiYXJzID0gZGF0YS5iYXJzO1xuICBzZXR0aW5ncy5iYXJzID0gX2RhdGEkYmFycyA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MuYmFycyA6IF9kYXRhJGJhcnM7XG4gIHZhciBfZGF0YSRwaXRjaCA9IGRhdGEucGl0Y2g7XG4gIHNldHRpbmdzLnBpdGNoID0gX2RhdGEkcGl0Y2ggPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLnBpdGNoIDogX2RhdGEkcGl0Y2g7XG4gIHZhciBfZGF0YSRidWZmZXJUaW1lID0gZGF0YS5idWZmZXJUaW1lO1xuICBzZXR0aW5ncy5idWZmZXJUaW1lID0gX2RhdGEkYnVmZmVyVGltZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MuYnVmZmVyVGltZSA6IF9kYXRhJGJ1ZmZlclRpbWU7XG4gIHZhciBfZGF0YSRsb3dlc3ROb3RlID0gZGF0YS5sb3dlc3ROb3RlO1xuICBzZXR0aW5ncy5sb3dlc3ROb3RlID0gX2RhdGEkbG93ZXN0Tm90ZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MubG93ZXN0Tm90ZSA6IF9kYXRhJGxvd2VzdE5vdGU7XG4gIHZhciBfZGF0YSRoaWdoZXN0Tm90ZSA9IGRhdGEuaGlnaGVzdE5vdGU7XG4gIHNldHRpbmdzLmhpZ2hlc3ROb3RlID0gX2RhdGEkaGlnaGVzdE5vdGUgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmhpZ2hlc3ROb3RlIDogX2RhdGEkaGlnaGVzdE5vdGU7XG4gIHZhciBfZGF0YSRub3RlTmFtZU1vZGUgPSBkYXRhLm5vdGVOYW1lTW9kZTtcbiAgc2V0dGluZ3Mubm90ZU5hbWVNb2RlID0gX2RhdGEkbm90ZU5hbWVNb2RlID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5ub3RlTmFtZU1vZGUgOiBfZGF0YSRub3RlTmFtZU1vZGU7XG4gIHZhciBfZGF0YSRub21pbmF0b3IgPSBkYXRhLm5vbWluYXRvcjtcbiAgc2V0dGluZ3Mubm9taW5hdG9yID0gX2RhdGEkbm9taW5hdG9yID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5ub21pbmF0b3IgOiBfZGF0YSRub21pbmF0b3I7XG4gIHZhciBfZGF0YSRkZW5vbWluYXRvciA9IGRhdGEuZGVub21pbmF0b3I7XG4gIHNldHRpbmdzLmRlbm9taW5hdG9yID0gX2RhdGEkZGVub21pbmF0b3IgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmRlbm9taW5hdG9yIDogX2RhdGEkZGVub21pbmF0b3I7XG4gIHZhciBfZGF0YSRxdWFudGl6ZVZhbHVlID0gZGF0YS5xdWFudGl6ZVZhbHVlO1xuICBzZXR0aW5ncy5xdWFudGl6ZVZhbHVlID0gX2RhdGEkcXVhbnRpemVWYWx1ZSA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MucXVhbnRpemVWYWx1ZSA6IF9kYXRhJHF1YW50aXplVmFsdWU7XG4gIHZhciBfZGF0YSRmaXhlZExlbmd0aFZhbHUgPSBkYXRhLmZpeGVkTGVuZ3RoVmFsdWU7XG4gIHNldHRpbmdzLmZpeGVkTGVuZ3RoVmFsdWUgPSBfZGF0YSRmaXhlZExlbmd0aFZhbHUgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmZpeGVkTGVuZ3RoVmFsdWUgOiBfZGF0YSRmaXhlZExlbmd0aFZhbHU7XG4gIHZhciBfZGF0YSRwb3NpdGlvblR5cGUgPSBkYXRhLnBvc2l0aW9uVHlwZTtcbiAgc2V0dGluZ3MucG9zaXRpb25UeXBlID0gX2RhdGEkcG9zaXRpb25UeXBlID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5wb3NpdGlvblR5cGUgOiBfZGF0YSRwb3NpdGlvblR5cGU7XG4gIHZhciBfZGF0YSR1c2VNZXRyb25vbWUgPSBkYXRhLnVzZU1ldHJvbm9tZTtcbiAgc2V0dGluZ3MudXNlTWV0cm9ub21lID0gX2RhdGEkdXNlTWV0cm9ub21lID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy51c2VNZXRyb25vbWUgOiBfZGF0YSR1c2VNZXRyb25vbWU7XG4gIHZhciBfZGF0YSRhdXRvU2l6ZSA9IGRhdGEuYXV0b1NpemU7XG4gIHNldHRpbmdzLmF1dG9TaXplID0gX2RhdGEkYXV0b1NpemUgPT09IHVuZGVmaW5lZCA/IHNldHRpbmdzLmF1dG9TaXplIDogX2RhdGEkYXV0b1NpemU7XG4gIHZhciBfZGF0YSRwbGF5YmFja1NwZWVkID0gZGF0YS5wbGF5YmFja1NwZWVkO1xuICBzZXR0aW5ncy5wbGF5YmFja1NwZWVkID0gX2RhdGEkcGxheWJhY2tTcGVlZCA9PT0gdW5kZWZpbmVkID8gc2V0dGluZ3MucGxheWJhY2tTcGVlZCA6IF9kYXRhJHBsYXliYWNrU3BlZWQ7XG4gIHZhciBfZGF0YSRhdXRvUXVhbnRpemUgPSBkYXRhLmF1dG9RdWFudGl6ZTtcbiAgc2V0dGluZ3MuYXV0b1F1YW50aXplID0gX2RhdGEkYXV0b1F1YW50aXplID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy5hdXRvUXVhbnRpemUgOiBfZGF0YSRhdXRvUXVhbnRpemU7XG4gIHZhciBfZGF0YSR2b2x1bWUgPSBkYXRhLnZvbHVtZTtcbiAgc2V0dGluZ3Mudm9sdW1lID0gX2RhdGEkdm9sdW1lID09PSB1bmRlZmluZWQgPyBzZXR0aW5ncy52b2x1bWUgOiBfZGF0YSR2b2x1bWU7XG5cblxuICBjb25zb2xlLmxvZygnc2V0dGluZ3M6ICVPJywgc2V0dGluZ3MpO1xufVxuXG5mdW5jdGlvbiBnZXRTZXR0aW5ncygpIHtcbiAgcmV0dXJuIF9leHRlbmRzKHt9LCBzZXR0aW5ncyk7XG4gIC8qXG4gICAgbGV0IHJlc3VsdCA9IHt9XG4gICAgcGFyYW1zLmZvckVhY2gocGFyYW0gPT4ge1xuICAgICAgc3dpdGNoKHBhcmFtKXtcbiAgICAgICAgY2FzZSAncGl0Y2gnOlxuICAgICAgICAgIHJlc3VsdC5waXRjaCA9IHBpdGNoXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnbm90ZU5hbWVNb2RlJzpcbiAgICAgICAgICByZXN1bHQubm90ZU5hbWVNb2RlID0gbm90ZU5hbWVNb2RlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnYnVmZmVyVGltZSc6XG4gICAgICAgICAgcmVzdWx0LmJ1ZmZlclRpbWUgPSBidWZmZXJUaW1lXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAncHBxJzpcbiAgICAgICAgICByZXN1bHQucHBxID0gcHBxXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gICovXG59XG5cbi8vcG9ydGVkIGhlYXJ0YmVhdCBpbnN0cnVtZW50czogaHR0cDovL2dpdGh1Yi5jb20vYWJ1ZGFhbi9oZWFydGJlYXRcbnZhciBoZWFydGJlYXRJbnN0cnVtZW50cyA9IG5ldyBNYXAoW1snY2l0eS1waWFubycsIHtcbiAgbmFtZTogJ0NpdHkgUGlhbm8gKHBpYW5vKScsXG4gIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyA0IHZlbG9jaXR5IGxheWVyczogMSAtIDQ4LCA0OSAtIDk2LCA5NyAtIDExMCBhbmQgMTEwIC0gMTI3LiBJbiB0b3RhbCBpdCB1c2VzIDQgKiA4OCA9IDM1MiBzYW1wbGVzJ1xufV0sIFsnY2l0eS1waWFuby1saWdodCcsIHtcbiAgbmFtZTogJ0NpdHkgUGlhbm8gTGlnaHQgKHBpYW5vKScsXG4gIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyBsaWdodCB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyBvbmx5IDEgdmVsb2NpdHkgbGF5ZXIgYW5kIHVzZXMgODggc2FtcGxlcydcbn1dLCBbJ2NrLWljZXNrYXRlcycsIHtcbiAgbmFtZTogJ0NLIEljZSBTa2F0ZXMgKHN5bnRoKScsXG4gIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcydcbn1dLCBbJ3NoazItc3F1YXJlcm9vdCcsIHtcbiAgbmFtZTogJ1NISzIgc3F1YXJlcm9vdCAoc3ludGgpJyxcbiAgZGVzY3JpcHRpb246ICd1c2VzIERldHVuaXplZCBzYW1wbGVzJ1xufV0sIFsncmhvZGVzJywge1xuICBuYW1lOiAnUmhvZGVzIChwaWFubyknLFxuICBkZXNjcmlwdGlvbjogJ3VzZXMgRnJlZXNvdW5kIHNhbXBsZXMnXG59XSwgWydyaG9kZXMyJywge1xuICBuYW1lOiAnUmhvZGVzIDIgKHBpYW5vKScsXG4gIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcydcbn1dLCBbJ3RydW1wZXQnLCB7XG4gIG5hbWU6ICdUcnVtcGV0IChicmFzcyknLFxuICBkZXNjcmlwdGlvbjogJ3VzZXMgU1NPIHNhbXBsZXMnXG59XSwgWyd2aW9saW4nLCB7XG4gIG5hbWU6ICdWaW9saW4gKHN0cmluZ3MpJyxcbiAgZGVzY3JpcHRpb246ICd1c2VzIFNTTyBzYW1wbGVzJ1xufV1dKTtcbnZhciBnZXRJbnN0cnVtZW50cyA9IGV4cG9ydHMuZ2V0SW5zdHJ1bWVudHMgPSBmdW5jdGlvbiBnZXRJbnN0cnVtZW50cygpIHtcbiAgcmV0dXJuIGhlYXJ0YmVhdEluc3RydW1lbnRzO1xufTtcblxuLy8gZ20gc291bmRzIGV4cG9ydGVkIGZyb20gRmx1aWRTeW50aCBieSBCZW5qYW1pbiBHbGVpdHptYW46IGh0dHBzOi8vZ2l0aHViLmNvbS9nbGVpdHovbWlkaS1qcy1zb3VuZGZvbnRzXG52YXIgZ21JbnN0cnVtZW50cyA9IHsgXCJhY291c3RpY19ncmFuZF9waWFub1wiOiB7IFwibmFtZVwiOiBcIjEgQWNvdXN0aWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJicmlnaHRfYWNvdXN0aWNfcGlhbm9cIjogeyBcIm5hbWVcIjogXCIyIEJyaWdodCBBY291c3RpYyBQaWFubyAocGlhbm8pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImVsZWN0cmljX2dyYW5kX3BpYW5vXCI6IHsgXCJuYW1lXCI6IFwiMyBFbGVjdHJpYyBHcmFuZCBQaWFubyAocGlhbm8pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImhvbmt5dG9ua19waWFub1wiOiB7IFwibmFtZVwiOiBcIjQgSG9ua3ktdG9uayBQaWFubyAocGlhbm8pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImVsZWN0cmljX3BpYW5vXzFcIjogeyBcIm5hbWVcIjogXCI1IEVsZWN0cmljIFBpYW5vIDEgKHBpYW5vKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJlbGVjdHJpY19waWFub18yXCI6IHsgXCJuYW1lXCI6IFwiNiBFbGVjdHJpYyBQaWFubyAyIChwaWFubylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiaGFycHNpY2hvcmRcIjogeyBcIm5hbWVcIjogXCI3IEhhcnBzaWNob3JkIChwaWFubylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY2xhdmluZXRcIjogeyBcIm5hbWVcIjogXCI4IENsYXZpbmV0IChwaWFubylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY2VsZXN0YVwiOiB7IFwibmFtZVwiOiBcIjkgQ2VsZXN0YSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZ2xvY2tlbnNwaWVsXCI6IHsgXCJuYW1lXCI6IFwiMTAgR2xvY2tlbnNwaWVsIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJtdXNpY19ib3hcIjogeyBcIm5hbWVcIjogXCIxMSBNdXNpYyBCb3ggKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInZpYnJhcGhvbmVcIjogeyBcIm5hbWVcIjogXCIxMiBWaWJyYXBob25lIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJtYXJpbWJhXCI6IHsgXCJuYW1lXCI6IFwiMTMgTWFyaW1iYSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwieHlsb3Bob25lXCI6IHsgXCJuYW1lXCI6IFwiMTQgWHlsb3Bob25lIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0dWJ1bGFyX2JlbGxzXCI6IHsgXCJuYW1lXCI6IFwiMTUgVHVidWxhciBCZWxscyAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZHVsY2ltZXJcIjogeyBcIm5hbWVcIjogXCIxNiBEdWxjaW1lciAoY2hyb21hdGljcGVyY3Vzc2lvbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZHJhd2Jhcl9vcmdhblwiOiB7IFwibmFtZVwiOiBcIjE3IERyYXdiYXIgT3JnYW4gKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwZXJjdXNzaXZlX29yZ2FuXCI6IHsgXCJuYW1lXCI6IFwiMTggUGVyY3Vzc2l2ZSBPcmdhbiAob3JnYW4pXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInJvY2tfb3JnYW5cIjogeyBcIm5hbWVcIjogXCIxOSBSb2NrIE9yZ2FuIChvcmdhbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY2h1cmNoX29yZ2FuXCI6IHsgXCJuYW1lXCI6IFwiMjAgQ2h1cmNoIE9yZ2FuIChvcmdhbilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicmVlZF9vcmdhblwiOiB7IFwibmFtZVwiOiBcIjIxIFJlZWQgT3JnYW4gKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhY2NvcmRpb25cIjogeyBcIm5hbWVcIjogXCIyMiBBY2NvcmRpb24gKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJoYXJtb25pY2FcIjogeyBcIm5hbWVcIjogXCIyMyBIYXJtb25pY2EgKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0YW5nb19hY2NvcmRpb25cIjogeyBcIm5hbWVcIjogXCIyNCBUYW5nbyBBY2NvcmRpb24gKG9yZ2FuKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhY291c3RpY19ndWl0YXJfbnlsb25cIjogeyBcIm5hbWVcIjogXCIyNSBBY291c3RpYyBHdWl0YXIgKG55bG9uKSAoZ3VpdGFyKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhY291c3RpY19ndWl0YXJfc3RlZWxcIjogeyBcIm5hbWVcIjogXCIyNiBBY291c3RpYyBHdWl0YXIgKHN0ZWVsKSAoZ3VpdGFyKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJlbGVjdHJpY19ndWl0YXJfamF6elwiOiB7IFwibmFtZVwiOiBcIjI3IEVsZWN0cmljIEd1aXRhciAoamF6eikgKGd1aXRhcilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZWxlY3RyaWNfZ3VpdGFyX2NsZWFuXCI6IHsgXCJuYW1lXCI6IFwiMjggRWxlY3RyaWMgR3VpdGFyIChjbGVhbikgKGd1aXRhcilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZWxlY3RyaWNfZ3VpdGFyX211dGVkXCI6IHsgXCJuYW1lXCI6IFwiMjkgRWxlY3RyaWMgR3VpdGFyIChtdXRlZCkgKGd1aXRhcilcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwib3ZlcmRyaXZlbl9ndWl0YXJcIjogeyBcIm5hbWVcIjogXCIzMCBPdmVyZHJpdmVuIEd1aXRhciAoZ3VpdGFyKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJkaXN0b3J0aW9uX2d1aXRhclwiOiB7IFwibmFtZVwiOiBcIjMxIERpc3RvcnRpb24gR3VpdGFyIChndWl0YXIpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImd1aXRhcl9oYXJtb25pY3NcIjogeyBcIm5hbWVcIjogXCIzMiBHdWl0YXIgSGFybW9uaWNzIChndWl0YXIpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImFjb3VzdGljX2Jhc3NcIjogeyBcIm5hbWVcIjogXCIzMyBBY291c3RpYyBCYXNzIChiYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJlbGVjdHJpY19iYXNzX2ZpbmdlclwiOiB7IFwibmFtZVwiOiBcIjM0IEVsZWN0cmljIEJhc3MgKGZpbmdlcikgKGJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImVsZWN0cmljX2Jhc3NfcGlja1wiOiB7IFwibmFtZVwiOiBcIjM1IEVsZWN0cmljIEJhc3MgKHBpY2spIChiYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJmcmV0bGVzc19iYXNzXCI6IHsgXCJuYW1lXCI6IFwiMzYgRnJldGxlc3MgQmFzcyAoYmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2xhcF9iYXNzXzFcIjogeyBcIm5hbWVcIjogXCIzNyBTbGFwIEJhc3MgMSAoYmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2xhcF9iYXNzXzJcIjogeyBcIm5hbWVcIjogXCIzOCBTbGFwIEJhc3MgMiAoYmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3ludGhfYmFzc18xXCI6IHsgXCJuYW1lXCI6IFwiMzkgU3ludGggQmFzcyAxIChiYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzeW50aF9iYXNzXzJcIjogeyBcIm5hbWVcIjogXCI0MCBTeW50aCBCYXNzIDIgKGJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInZpb2xpblwiOiB7IFwibmFtZVwiOiBcIjQxIFZpb2xpbiAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidmlvbGFcIjogeyBcIm5hbWVcIjogXCI0MiBWaW9sYSAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY2VsbG9cIjogeyBcIm5hbWVcIjogXCI0MyBDZWxsbyAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiY29udHJhYmFzc1wiOiB7IFwibmFtZVwiOiBcIjQ0IENvbnRyYWJhc3MgKHN0cmluZ3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInRyZW1vbG9fc3RyaW5nc1wiOiB7IFwibmFtZVwiOiBcIjQ1IFRyZW1vbG8gU3RyaW5ncyAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGl6emljYXRvX3N0cmluZ3NcIjogeyBcIm5hbWVcIjogXCI0NiBQaXp6aWNhdG8gU3RyaW5ncyAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwib3JjaGVzdHJhbF9oYXJwXCI6IHsgXCJuYW1lXCI6IFwiNDcgT3JjaGVzdHJhbCBIYXJwIChzdHJpbmdzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0aW1wYW5pXCI6IHsgXCJuYW1lXCI6IFwiNDggVGltcGFuaSAoc3RyaW5ncylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3RyaW5nX2Vuc2VtYmxlXzFcIjogeyBcIm5hbWVcIjogXCI0OSBTdHJpbmcgRW5zZW1ibGUgMSAoZW5zZW1ibGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN0cmluZ19lbnNlbWJsZV8yXCI6IHsgXCJuYW1lXCI6IFwiNTAgU3RyaW5nIEVuc2VtYmxlIDIgKGVuc2VtYmxlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzeW50aF9zdHJpbmdzXzFcIjogeyBcIm5hbWVcIjogXCI1MSBTeW50aCBTdHJpbmdzIDEgKGVuc2VtYmxlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzeW50aF9zdHJpbmdzXzJcIjogeyBcIm5hbWVcIjogXCI1MiBTeW50aCBTdHJpbmdzIDIgKGVuc2VtYmxlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJjaG9pcl9hYWhzXCI6IHsgXCJuYW1lXCI6IFwiNTMgQ2hvaXIgQWFocyAoZW5zZW1ibGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInZvaWNlX29vaHNcIjogeyBcIm5hbWVcIjogXCI1NCBWb2ljZSBPb2hzIChlbnNlbWJsZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3ludGhfY2hvaXJcIjogeyBcIm5hbWVcIjogXCI1NSBTeW50aCBDaG9pciAoZW5zZW1ibGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcIm9yY2hlc3RyYV9oaXRcIjogeyBcIm5hbWVcIjogXCI1NiBPcmNoZXN0cmEgSGl0IChlbnNlbWJsZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidHJ1bXBldFwiOiB7IFwibmFtZVwiOiBcIjU3IFRydW1wZXQgKGJyYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0cm9tYm9uZVwiOiB7IFwibmFtZVwiOiBcIjU4IFRyb21ib25lIChicmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidHViYVwiOiB7IFwibmFtZVwiOiBcIjU5IFR1YmEgKGJyYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJtdXRlZF90cnVtcGV0XCI6IHsgXCJuYW1lXCI6IFwiNjAgTXV0ZWQgVHJ1bXBldCAoYnJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImZyZW5jaF9ob3JuXCI6IHsgXCJuYW1lXCI6IFwiNjEgRnJlbmNoIEhvcm4gKGJyYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJicmFzc19zZWN0aW9uXCI6IHsgXCJuYW1lXCI6IFwiNjIgQnJhc3MgU2VjdGlvbiAoYnJhc3MpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN5bnRoX2JyYXNzXzFcIjogeyBcIm5hbWVcIjogXCI2MyBTeW50aCBCcmFzcyAxIChicmFzcylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3ludGhfYnJhc3NfMlwiOiB7IFwibmFtZVwiOiBcIjY0IFN5bnRoIEJyYXNzIDIgKGJyYXNzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzb3ByYW5vX3NheFwiOiB7IFwibmFtZVwiOiBcIjY1IFNvcHJhbm8gU2F4IChyZWVkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhbHRvX3NheFwiOiB7IFwibmFtZVwiOiBcIjY2IEFsdG8gU2F4IChyZWVkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJ0ZW5vcl9zYXhcIjogeyBcIm5hbWVcIjogXCI2NyBUZW5vciBTYXggKHJlZWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImJhcml0b25lX3NheFwiOiB7IFwibmFtZVwiOiBcIjY4IEJhcml0b25lIFNheCAocmVlZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwib2JvZVwiOiB7IFwibmFtZVwiOiBcIjY5IE9ib2UgKHJlZWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImVuZ2xpc2hfaG9yblwiOiB7IFwibmFtZVwiOiBcIjcwIEVuZ2xpc2ggSG9ybiAocmVlZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYmFzc29vblwiOiB7IFwibmFtZVwiOiBcIjcxIEJhc3Nvb24gKHJlZWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImNsYXJpbmV0XCI6IHsgXCJuYW1lXCI6IFwiNzIgQ2xhcmluZXQgKHJlZWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInBpY2NvbG9cIjogeyBcIm5hbWVcIjogXCI3MyBQaWNjb2xvIChwaXBlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJmbHV0ZVwiOiB7IFwibmFtZVwiOiBcIjc0IEZsdXRlIChwaXBlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJyZWNvcmRlclwiOiB7IFwibmFtZVwiOiBcIjc1IFJlY29yZGVyIChwaXBlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYW5fZmx1dGVcIjogeyBcIm5hbWVcIjogXCI3NiBQYW4gRmx1dGUgKHBpcGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImJsb3duX2JvdHRsZVwiOiB7IFwibmFtZVwiOiBcIjc3IEJsb3duIEJvdHRsZSAocGlwZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2hha3VoYWNoaVwiOiB7IFwibmFtZVwiOiBcIjc4IFNoYWt1aGFjaGkgKHBpcGUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcIndoaXN0bGVcIjogeyBcIm5hbWVcIjogXCI3OSBXaGlzdGxlIChwaXBlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJvY2FyaW5hXCI6IHsgXCJuYW1lXCI6IFwiODAgT2NhcmluYSAocGlwZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF8xX3NxdWFyZVwiOiB7IFwibmFtZVwiOiBcIjgxIExlYWQgMSAoc3F1YXJlKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJsZWFkXzJfc2F3dG9vdGhcIjogeyBcIm5hbWVcIjogXCI4MiBMZWFkIDIgKHNhd3Rvb3RoKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJsZWFkXzNfY2FsbGlvcGVcIjogeyBcIm5hbWVcIjogXCI4MyBMZWFkIDMgKGNhbGxpb3BlKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJsZWFkXzRfY2hpZmZcIjogeyBcIm5hbWVcIjogXCI4NCBMZWFkIDQgKGNoaWZmKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJsZWFkXzVfY2hhcmFuZ1wiOiB7IFwibmFtZVwiOiBcIjg1IExlYWQgNSAoY2hhcmFuZykgKHN5bnRobGVhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF82X3ZvaWNlXCI6IHsgXCJuYW1lXCI6IFwiODYgTGVhZCA2ICh2b2ljZSkgKHN5bnRobGVhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibGVhZF83X2ZpZnRoc1wiOiB7IFwibmFtZVwiOiBcIjg3IExlYWQgNyAoZmlmdGhzKSAoc3ludGhsZWFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJsZWFkXzhfYmFzc19fbGVhZFwiOiB7IFwibmFtZVwiOiBcIjg4IExlYWQgOCAoYmFzcyArIGxlYWQpIChzeW50aGxlYWQpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInBhZF8xX25ld19hZ2VcIjogeyBcIm5hbWVcIjogXCI4OSBQYWQgMSAobmV3IGFnZSkgKHN5bnRocGFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfMl93YXJtXCI6IHsgXCJuYW1lXCI6IFwiOTAgUGFkIDIgKHdhcm0pIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGFkXzNfcG9seXN5bnRoXCI6IHsgXCJuYW1lXCI6IFwiOTEgUGFkIDMgKHBvbHlzeW50aCkgKHN5bnRocGFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfNF9jaG9pclwiOiB7IFwibmFtZVwiOiBcIjkyIFBhZCA0IChjaG9pcikgKHN5bnRocGFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfNV9ib3dlZFwiOiB7IFwibmFtZVwiOiBcIjkzIFBhZCA1IChib3dlZCkgKHN5bnRocGFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfNl9tZXRhbGxpY1wiOiB7IFwibmFtZVwiOiBcIjk0IFBhZCA2IChtZXRhbGxpYykgKHN5bnRocGFkKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJwYWRfN19oYWxvXCI6IHsgXCJuYW1lXCI6IFwiOTUgUGFkIDcgKGhhbG8pIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicGFkXzhfc3dlZXBcIjogeyBcIm5hbWVcIjogXCI5NiBQYWQgOCAoc3dlZXApIChzeW50aHBhZClcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfMV9yYWluXCI6IHsgXCJuYW1lXCI6IFwiOTcgRlggMSAocmFpbikgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfMl9zb3VuZHRyYWNrXCI6IHsgXCJuYW1lXCI6IFwiOTggRlggMiAoc291bmR0cmFjaykgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfM19jcnlzdGFsXCI6IHsgXCJuYW1lXCI6IFwiOTkgRlggMyAoY3J5c3RhbCkgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfNF9hdG1vc3BoZXJlXCI6IHsgXCJuYW1lXCI6IFwiMTAwIEZYIDQgKGF0bW9zcGhlcmUpIChzeW50aGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImZ4XzVfYnJpZ2h0bmVzc1wiOiB7IFwibmFtZVwiOiBcIjEwMSBGWCA1IChicmlnaHRuZXNzKSAoc3ludGhlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJmeF82X2dvYmxpbnNcIjogeyBcIm5hbWVcIjogXCIxMDIgRlggNiAoZ29ibGlucykgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZnhfN19lY2hvZXNcIjogeyBcIm5hbWVcIjogXCIxMDMgRlggNyAoZWNob2VzKSAoc3ludGhlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJmeF84X3NjaWZpXCI6IHsgXCJuYW1lXCI6IFwiMTA0IEZYIDggKHNjaS1maSkgKHN5bnRoZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2l0YXJcIjogeyBcIm5hbWVcIjogXCIxMDUgU2l0YXIgKGV0aG5pYylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYmFuam9cIjogeyBcIm5hbWVcIjogXCIxMDYgQmFuam8gKGV0aG5pYylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic2hhbWlzZW5cIjogeyBcIm5hbWVcIjogXCIxMDcgU2hhbWlzZW4gKGV0aG5pYylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwia290b1wiOiB7IFwibmFtZVwiOiBcIjEwOCBLb3RvIChldGhuaWMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImthbGltYmFcIjogeyBcIm5hbWVcIjogXCIxMDkgS2FsaW1iYSAoZXRobmljKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJiYWdwaXBlXCI6IHsgXCJuYW1lXCI6IFwiMTEwIEJhZ3BpcGUgKGV0aG5pYylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZmlkZGxlXCI6IHsgXCJuYW1lXCI6IFwiMTExIEZpZGRsZSAoZXRobmljKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzaGFuYWlcIjogeyBcIm5hbWVcIjogXCIxMTIgU2hhbmFpIChldGhuaWMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInRpbmtsZV9iZWxsXCI6IHsgXCJuYW1lXCI6IFwiMTEzIFRpbmtsZSBCZWxsIChwZXJjdXNzaXZlKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJhZ29nb1wiOiB7IFwibmFtZVwiOiBcIjExNCBBZ29nbyAocGVyY3Vzc2l2ZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwic3RlZWxfZHJ1bXNcIjogeyBcIm5hbWVcIjogXCIxMTUgU3RlZWwgRHJ1bXMgKHBlcmN1c3NpdmUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcIndvb2RibG9ja1wiOiB7IFwibmFtZVwiOiBcIjExNiBXb29kYmxvY2sgKHBlcmN1c3NpdmUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInRhaWtvX2RydW1cIjogeyBcIm5hbWVcIjogXCIxMTcgVGFpa28gRHJ1bSAocGVyY3Vzc2l2ZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwibWVsb2RpY190b21cIjogeyBcIm5hbWVcIjogXCIxMTggTWVsb2RpYyBUb20gKHBlcmN1c3NpdmUpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcInN5bnRoX2RydW1cIjogeyBcIm5hbWVcIjogXCIxMTkgU3ludGggRHJ1bSAocGVyY3Vzc2l2ZSlcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwicmV2ZXJzZV9jeW1iYWxcIjogeyBcIm5hbWVcIjogXCIxMjAgUmV2ZXJzZSBDeW1iYWwgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiZ3VpdGFyX2ZyZXRfbm9pc2VcIjogeyBcIm5hbWVcIjogXCIxMjEgR3VpdGFyIEZyZXQgTm9pc2UgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiYnJlYXRoX25vaXNlXCI6IHsgXCJuYW1lXCI6IFwiMTIyIEJyZWF0aCBOb2lzZSAoc291bmRlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJzZWFzaG9yZVwiOiB7IFwibmFtZVwiOiBcIjEyMyBTZWFzaG9yZSAoc291bmRlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSwgXCJiaXJkX3R3ZWV0XCI6IHsgXCJuYW1lXCI6IFwiMTI0IEJpcmQgVHdlZXQgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwidGVsZXBob25lX3JpbmdcIjogeyBcIm5hbWVcIjogXCIxMjUgVGVsZXBob25lIFJpbmcgKHNvdW5kZWZmZWN0cylcIiwgXCJkZXNjcmlwdGlvblwiOiBcIkZsdWlkc3ludGggc2FtcGxlc1wiIH0sIFwiaGVsaWNvcHRlclwiOiB7IFwibmFtZVwiOiBcIjEyNiBIZWxpY29wdGVyIChzb3VuZGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImFwcGxhdXNlXCI6IHsgXCJuYW1lXCI6IFwiMTI3IEFwcGxhdXNlIChzb3VuZGVmZmVjdHMpXCIsIFwiZGVzY3JpcHRpb25cIjogXCJGbHVpZHN5bnRoIHNhbXBsZXNcIiB9LCBcImd1bnNob3RcIjogeyBcIm5hbWVcIjogXCIxMjggR3Vuc2hvdCAoc291bmRlZmZlY3RzKVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiRmx1aWRzeW50aCBzYW1wbGVzXCIgfSB9O1xudmFyIGdtTWFwID0gbmV3IE1hcCgpO1xuT2JqZWN0LmtleXMoZ21JbnN0cnVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGdtTWFwLnNldChrZXksIGdtSW5zdHJ1bWVudHNba2V5XSk7XG59KTtcbnZhciBnZXRHTUluc3RydW1lbnRzID0gZXhwb3J0cy5nZXRHTUluc3RydW1lbnRzID0gZnVuY3Rpb24gZ2V0R01JbnN0cnVtZW50cygpIHtcbiAgcmV0dXJuIGdtTWFwO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlNpbXBsZVN5bnRoID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX2luc3RydW1lbnQgPSByZXF1aXJlKCcuL2luc3RydW1lbnQnKTtcblxudmFyIF9zYW1wbGVfb3NjaWxsYXRvciA9IHJlcXVpcmUoJy4vc2FtcGxlX29zY2lsbGF0b3InKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgaW5zdGFuY2VJbmRleCA9IDA7XG5cbnZhciBTaW1wbGVTeW50aCA9IGV4cG9ydHMuU2ltcGxlU3ludGggPSBmdW5jdGlvbiAoX0luc3RydW1lbnQpIHtcbiAgX2luaGVyaXRzKFNpbXBsZVN5bnRoLCBfSW5zdHJ1bWVudCk7XG5cbiAgZnVuY3Rpb24gU2ltcGxlU3ludGgodHlwZSwgbmFtZSkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTaW1wbGVTeW50aCk7XG5cbiAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoU2ltcGxlU3ludGguX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTaW1wbGVTeW50aCkpLmNhbGwodGhpcykpO1xuXG4gICAgX3RoaXMuaWQgPSBfdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgJ18nICsgaW5zdGFuY2VJbmRleCsrICsgJ18nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgX3RoaXMubmFtZSA9IG5hbWUgfHwgX3RoaXMuaWQ7XG4gICAgX3RoaXMudHlwZSA9IHR5cGU7XG4gICAgX3RoaXMuc2FtcGxlRGF0YSA9IHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICByZWxlYXNlRHVyYXRpb246IDAuMixcbiAgICAgIHJlbGVhc2VFbnZlbG9wZTogJ2VxdWFsIHBvd2VyJ1xuICAgIH07XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFNpbXBsZVN5bnRoLCBbe1xuICAgIGtleTogJ2NyZWF0ZVNhbXBsZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZVNhbXBsZShldmVudCkge1xuICAgICAgcmV0dXJuIG5ldyBfc2FtcGxlX29zY2lsbGF0b3IuU2FtcGxlT3NjaWxsYXRvcih0aGlzLnNhbXBsZURhdGEsIGV2ZW50KTtcbiAgICB9XG5cbiAgICAvLyBzdGVyZW8gc3ByZWFkXG5cbiAgfSwge1xuICAgIGtleTogJ3NldEtleVNjYWxpbmdQYW5uaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKSB7XG4gICAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldEtleVNjYWxpbmdSZWxlYXNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0S2V5U2NhbGluZ1JlbGVhc2UoKSB7fVxuICAgIC8vIHNldCByZWxlYXNlIGJhc2VkIG9uIGtleSB2YWx1ZVxuXG5cbiAgICAvKlxuICAgICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICAgIEBlbnZlbG9wZTogbGluZWFyIHwgZXF1YWxfcG93ZXIgfCBhcnJheSBvZiBpbnQgdmFsdWVzXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnc2V0UmVsZWFzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFJlbGVhc2UoZHVyYXRpb24sIGVudmVsb3BlKSB7XG4gICAgICB0aGlzLnNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgICB0aGlzLnNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gZW52ZWxvcGU7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNpbXBsZVN5bnRoO1xufShfaW5zdHJ1bWVudC5JbnN0cnVtZW50KTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlNvbmcgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7IC8vQCBmbG93XG5cbnZhciBfY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcblxudmFyIF9wYXJzZV9ldmVudHMgPSByZXF1aXJlKCcuL3BhcnNlX2V2ZW50cycpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9zY2hlZHVsZXIgPSByZXF1aXJlKCcuL3NjaGVkdWxlcicpO1xuXG52YXIgX3NjaGVkdWxlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zY2hlZHVsZXIpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF9zb25nX2Zyb21fbWlkaWZpbGUgPSByZXF1aXJlKCcuL3NvbmdfZnJvbV9taWRpZmlsZScpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9wb3NpdGlvbiA9IHJlcXVpcmUoJy4vcG9zaXRpb24nKTtcblxudmFyIF9wbGF5aGVhZCA9IHJlcXVpcmUoJy4vcGxheWhlYWQnKTtcblxudmFyIF9tZXRyb25vbWUgPSByZXF1aXJlKCcuL21ldHJvbm9tZScpO1xuXG52YXIgX2V2ZW50bGlzdGVuZXIgPSByZXF1aXJlKCcuL2V2ZW50bGlzdGVuZXInKTtcblxudmFyIF9zYXZlX21pZGlmaWxlID0gcmVxdWlyZSgnLi9zYXZlX21pZGlmaWxlJyk7XG5cbnZhciBfc29uZyA9IHJlcXVpcmUoJy4vc29uZy51cGRhdGUnKTtcblxudmFyIF9zZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBpbnN0YW5jZUluZGV4ID0gMDtcbnZhciByZWNvcmRpbmdJbmRleCA9IDA7XG5cbi8qXG50eXBlIHNvbmdTZXR0aW5ncyA9IHtcbiAgbmFtZTogc3RyaW5nLFxuICBwcHE6IG51bWJlcixcbiAgYnBtOiBudW1iZXIsXG4gIGJhcnM6IG51bWJlcixcbiAgbG93ZXN0Tm90ZTogbnVtYmVyLFxuICBoaWdoZXN0Tm90ZTogbnVtYmVyLFxuICBub21pbmF0b3I6IG51bWJlcixcbiAgZGVub21pbmF0b3I6IG51bWJlcixcbiAgcXVhbnRpemVWYWx1ZTogbnVtYmVyLFxuICBmaXhlZExlbmd0aFZhbHVlOiBudW1iZXIsXG4gIHBvc2l0aW9uVHlwZTogc3RyaW5nLFxuICB1c2VNZXRyb25vbWU6IGJvb2xlYW4sXG4gIGF1dG9TaXplOiBib29sZWFuLFxuICBsb29wOiBib29sZWFuLFxuICBwbGF5YmFja1NwZWVkOiBudW1iZXIsXG4gIGF1dG9RdWFudGl6ZTogYm9vbGVhbixcbiAgcGl0Y2g6IG51bWJlcixcbiAgYnVmZmVyVGltZTogbnVtYmVyLFxuICBub3RlTmFtZU1vZGU6IHN0cmluZ1xufVxuKi9cblxuLypcbiAgLy8gaW5pdGlhbGl6ZSBzb25nIHdpdGggdHJhY2tzIGFuZCBwYXJ0IHNvIHlvdSBkbyBub3QgaGF2ZSB0byBjcmVhdGUgdGhlbSBzZXBhcmF0ZWx5XG4gIHNldHVwOiB7XG4gICAgdGltZUV2ZW50czogW11cbiAgICB0cmFja3M6IFtcbiAgICAgIHBhcnRzIFtdXG4gICAgXVxuICB9XG4qL1xuXG52YXIgU29uZyA9IGV4cG9ydHMuU29uZyA9IGZ1bmN0aW9uICgpIHtcbiAgX2NyZWF0ZUNsYXNzKFNvbmcsIG51bGwsIFt7XG4gICAga2V5OiAnZnJvbU1JRElGaWxlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZnJvbU1JRElGaWxlKGRhdGEpIHtcbiAgICAgIHJldHVybiAoMCwgX3NvbmdfZnJvbV9taWRpZmlsZS5zb25nRnJvbU1JRElGaWxlKShkYXRhKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdmcm9tTUlESUZpbGVTeW5jJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZnJvbU1JRElGaWxlU3luYyhkYXRhKSB7XG4gICAgICByZXR1cm4gKDAsIF9zb25nX2Zyb21fbWlkaWZpbGUuc29uZ0Zyb21NSURJRmlsZVN5bmMpKGRhdGEpO1xuICAgIH1cbiAgfV0pO1xuXG4gIGZ1bmN0aW9uIFNvbmcoKSB7XG4gICAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTb25nKTtcblxuICAgIHRoaXMuaWQgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnXycgKyBpbnN0YW5jZUluZGV4KysgKyAnXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB2YXIgZGVmYXVsdFNldHRpbmdzID0gKDAsIF9zZXR0aW5ncy5nZXRTZXR0aW5ncykoKTtcblxuICAgIHZhciBfc2V0dGluZ3MkbmFtZSA9IHNldHRpbmdzLm5hbWU7XG4gICAgdGhpcy5uYW1lID0gX3NldHRpbmdzJG5hbWUgPT09IHVuZGVmaW5lZCA/IHRoaXMuaWQgOiBfc2V0dGluZ3MkbmFtZTtcbiAgICB2YXIgX3NldHRpbmdzJHBwcSA9IHNldHRpbmdzLnBwcTtcbiAgICB0aGlzLnBwcSA9IF9zZXR0aW5ncyRwcHEgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5wcHEgOiBfc2V0dGluZ3MkcHBxO1xuICAgIHZhciBfc2V0dGluZ3MkYnBtID0gc2V0dGluZ3MuYnBtO1xuICAgIHRoaXMuYnBtID0gX3NldHRpbmdzJGJwbSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLmJwbSA6IF9zZXR0aW5ncyRicG07XG4gICAgdmFyIF9zZXR0aW5ncyRiYXJzID0gc2V0dGluZ3MuYmFycztcbiAgICB0aGlzLmJhcnMgPSBfc2V0dGluZ3MkYmFycyA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFNldHRpbmdzLmJhcnMgOiBfc2V0dGluZ3MkYmFycztcbiAgICB2YXIgX3NldHRpbmdzJG5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcjtcbiAgICB0aGlzLm5vbWluYXRvciA9IF9zZXR0aW5ncyRub21pbmF0b3IgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5ub21pbmF0b3IgOiBfc2V0dGluZ3Mkbm9taW5hdG9yO1xuICAgIHZhciBfc2V0dGluZ3MkZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcjtcbiAgICB0aGlzLmRlbm9taW5hdG9yID0gX3NldHRpbmdzJGRlbm9taW5hdG9yID09PSB1bmRlZmluZWQgPyBkZWZhdWx0U2V0dGluZ3MuZGVub21pbmF0b3IgOiBfc2V0dGluZ3MkZGVub21pbmF0b3I7XG4gICAgdmFyIF9zZXR0aW5ncyRxdWFudGl6ZVZhbCA9IHNldHRpbmdzLnF1YW50aXplVmFsdWU7XG4gICAgdGhpcy5xdWFudGl6ZVZhbHVlID0gX3NldHRpbmdzJHF1YW50aXplVmFsID09PSB1bmRlZmluZWQgPyBkZWZhdWx0U2V0dGluZ3MucXVhbnRpemVWYWx1ZSA6IF9zZXR0aW5ncyRxdWFudGl6ZVZhbDtcbiAgICB2YXIgX3NldHRpbmdzJGZpeGVkTGVuZ3RoID0gc2V0dGluZ3MuZml4ZWRMZW5ndGhWYWx1ZTtcbiAgICB0aGlzLmZpeGVkTGVuZ3RoVmFsdWUgPSBfc2V0dGluZ3MkZml4ZWRMZW5ndGggPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5maXhlZExlbmd0aFZhbHVlIDogX3NldHRpbmdzJGZpeGVkTGVuZ3RoO1xuICAgIHZhciBfc2V0dGluZ3MkdXNlTWV0cm9ub20gPSBzZXR0aW5ncy51c2VNZXRyb25vbWU7XG4gICAgdGhpcy51c2VNZXRyb25vbWUgPSBfc2V0dGluZ3MkdXNlTWV0cm9ub20gPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy51c2VNZXRyb25vbWUgOiBfc2V0dGluZ3MkdXNlTWV0cm9ub207XG4gICAgdmFyIF9zZXR0aW5ncyRhdXRvU2l6ZSA9IHNldHRpbmdzLmF1dG9TaXplO1xuICAgIHRoaXMuYXV0b1NpemUgPSBfc2V0dGluZ3MkYXV0b1NpemUgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5hdXRvU2l6ZSA6IF9zZXR0aW5ncyRhdXRvU2l6ZTtcbiAgICB2YXIgX3NldHRpbmdzJHBsYXliYWNrU3BlID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgICB0aGlzLnBsYXliYWNrU3BlZWQgPSBfc2V0dGluZ3MkcGxheWJhY2tTcGUgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5wbGF5YmFja1NwZWVkIDogX3NldHRpbmdzJHBsYXliYWNrU3BlO1xuICAgIHZhciBfc2V0dGluZ3MkYXV0b1F1YW50aXogPSBzZXR0aW5ncy5hdXRvUXVhbnRpemU7XG4gICAgdGhpcy5hdXRvUXVhbnRpemUgPSBfc2V0dGluZ3MkYXV0b1F1YW50aXogPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5hdXRvUXVhbnRpemUgOiBfc2V0dGluZ3MkYXV0b1F1YW50aXo7XG4gICAgdmFyIF9zZXR0aW5ncyRwaXRjaCA9IHNldHRpbmdzLnBpdGNoO1xuICAgIHRoaXMucGl0Y2ggPSBfc2V0dGluZ3MkcGl0Y2ggPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5waXRjaCA6IF9zZXR0aW5ncyRwaXRjaDtcbiAgICB2YXIgX3NldHRpbmdzJGJ1ZmZlclRpbWUgPSBzZXR0aW5ncy5idWZmZXJUaW1lO1xuICAgIHRoaXMuYnVmZmVyVGltZSA9IF9zZXR0aW5ncyRidWZmZXJUaW1lID09PSB1bmRlZmluZWQgPyBkZWZhdWx0U2V0dGluZ3MuYnVmZmVyVGltZSA6IF9zZXR0aW5ncyRidWZmZXJUaW1lO1xuICAgIHZhciBfc2V0dGluZ3Mkbm90ZU5hbWVNb2QgPSBzZXR0aW5ncy5ub3RlTmFtZU1vZGU7XG4gICAgdGhpcy5ub3RlTmFtZU1vZGUgPSBfc2V0dGluZ3Mkbm90ZU5hbWVNb2QgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRTZXR0aW5ncy5ub3RlTmFtZU1vZGUgOiBfc2V0dGluZ3Mkbm90ZU5hbWVNb2Q7XG4gICAgdmFyIF9zZXR0aW5ncyR2b2x1bWUgPSBzZXR0aW5ncy52b2x1bWU7XG4gICAgdGhpcy52b2x1bWUgPSBfc2V0dGluZ3Mkdm9sdW1lID09PSB1bmRlZmluZWQgPyBkZWZhdWx0U2V0dGluZ3Mudm9sdW1lIDogX3NldHRpbmdzJHZvbHVtZTtcblxuXG4gICAgdGhpcy5fdGltZUV2ZW50cyA9IFtdO1xuICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlO1xuICAgIHRoaXMuX2xhc3RFdmVudCA9IG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQoMCwgX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcy5FTkRfT0ZfVFJBQ0spO1xuXG4gICAgdGhpcy5fdHJhY2tzID0gW107XG4gICAgdGhpcy5fdHJhY2tzQnlJZCA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX3BhcnRzID0gW107XG4gICAgdGhpcy5fcGFydHNCeUlkID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5fZXZlbnRzID0gW107XG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX2FsbEV2ZW50cyA9IFtdOyAvLyBNSURJIGV2ZW50cyBhbmQgbWV0cm9ub21lIGV2ZW50c1xuXG4gICAgdGhpcy5fbm90ZXMgPSBbXTtcbiAgICB0aGlzLl9ub3Rlc0J5SWQgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9uZXdFdmVudHMgPSBbXTtcbiAgICB0aGlzLl9tb3ZlZEV2ZW50cyA9IFtdO1xuICAgIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXTtcbiAgICB0aGlzLl90cmFuc3Bvc2VkRXZlbnRzID0gW107XG5cbiAgICB0aGlzLl9uZXdQYXJ0cyA9IFtdO1xuICAgIHRoaXMuX2NoYW5nZWRQYXJ0cyA9IFtdO1xuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdO1xuXG4gICAgdGhpcy5fcmVtb3ZlZFRyYWNrcyA9IFtdO1xuXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDA7XG4gICAgdGhpcy5fc2NoZWR1bGVyID0gbmV3IF9zY2hlZHVsZXIyLmRlZmF1bHQodGhpcyk7XG4gICAgdGhpcy5fcGxheWhlYWQgPSBuZXcgX3BsYXloZWFkLlBsYXloZWFkKHRoaXMpO1xuXG4gICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICAgIHRoaXMubG9vcGluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5fZ2Fpbk5vZGUgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9nYWluTm9kZS5nYWluLnZhbHVlID0gdGhpcy52b2x1bWU7XG4gICAgdGhpcy5fZ2Fpbk5vZGUuY29ubmVjdChfaW5pdF9hdWRpby5tYXN0ZXJHYWluKTtcblxuICAgIHRoaXMuX21ldHJvbm9tZSA9IG5ldyBfbWV0cm9ub21lLk1ldHJvbm9tZSh0aGlzKTtcbiAgICB0aGlzLl9tZXRyb25vbWVFdmVudHMgPSBbXTtcbiAgICB0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlO1xuICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKCF0aGlzLnVzZU1ldHJvbm9tZSk7XG5cbiAgICB0aGlzLl9sb29wID0gZmFsc2U7XG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7IG1pbGxpczogMCwgdGlja3M6IDAgfTtcbiAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7IG1pbGxpczogMCwgdGlja3M6IDAgfTtcbiAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IGZhbHNlO1xuICAgIHRoaXMuX2xvb3BEdXJhdGlvbiA9IDA7XG4gICAgdGhpcy5fcHJlY291bnRCYXJzID0gMDtcbiAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDA7XG5cbiAgICB2YXIgdHJhY2tzID0gc2V0dGluZ3MudHJhY2tzLFxuICAgICAgICB0aW1lRXZlbnRzID0gc2V0dGluZ3MudGltZUV2ZW50cztcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrcywgdGltZUV2ZW50cylcblxuICAgIGlmICh0eXBlb2YgdGltZUV2ZW50cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuX3RpbWVFdmVudHMgPSBbbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCgwLCBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLlRFTVBPLCB0aGlzLmJwbSksIG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQoMCwgX2NvbnN0YW50cy5NSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSwgdGhpcy5ub21pbmF0b3IsIHRoaXMuZGVub21pbmF0b3IpXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hZGRUaW1lRXZlbnRzLmFwcGx5KHRoaXMsIF90b0NvbnN1bWFibGVBcnJheSh0aW1lRXZlbnRzKSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0cmFja3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmFkZFRyYWNrcy5hcHBseSh0aGlzLCBfdG9Db25zdW1hYmxlQXJyYXkodHJhY2tzKSk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTb25nLCBbe1xuICAgIGtleTogJ2FkZFRpbWVFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRUaW1lRXZlbnRzKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBldmVudHNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIC8vQFRPRE86IGZpbHRlciB0aW1lIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrIC0+IHVzZSB0aGUgbGFzdGx5IGFkZGVkIGV2ZW50c1xuICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC50eXBlID09PSBfY29uc3RhbnRzLk1JRElFdmVudFR5cGVzLlRJTUVfU0lHTkFUVVJFKSB7XG4gICAgICAgICAgX3RoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuX3RpbWVFdmVudHMucHVzaChldmVudCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZFRyYWNrcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFRyYWNrcygpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIHRyYWNrcyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgIHRyYWNrc1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuXG4gICAgICB0cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdmFyIF9uZXdFdmVudHMsIF9uZXdQYXJ0cztcblxuICAgICAgICB0cmFjay5fc29uZyA9IF90aGlzMjtcbiAgICAgICAgdHJhY2suX2dhaW5Ob2RlLmNvbm5lY3QoX3RoaXMyLl9nYWluTm9kZSk7XG4gICAgICAgIHRyYWNrLl9zb25nR2Fpbk5vZGUgPSBfdGhpczIuX2dhaW5Ob2RlO1xuICAgICAgICBfdGhpczIuX3RyYWNrcy5wdXNoKHRyYWNrKTtcbiAgICAgICAgX3RoaXMyLl90cmFja3NCeUlkLnNldCh0cmFjay5pZCwgdHJhY2spO1xuICAgICAgICAoX25ld0V2ZW50cyA9IF90aGlzMi5fbmV3RXZlbnRzKS5wdXNoLmFwcGx5KF9uZXdFdmVudHMsIF90b0NvbnN1bWFibGVBcnJheSh0cmFjay5fZXZlbnRzKSk7XG4gICAgICAgIChfbmV3UGFydHMgPSBfdGhpczIuX25ld1BhcnRzKS5wdXNoLmFwcGx5KF9uZXdQYXJ0cywgX3RvQ29uc3VtYWJsZUFycmF5KHRyYWNrLl9wYXJ0cykpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlVHJhY2tzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlVHJhY2tzKCkge1xuICAgICAgdmFyIF9yZW1vdmVkVHJhY2tzO1xuXG4gICAgICAoX3JlbW92ZWRUcmFja3MgPSB0aGlzLl9yZW1vdmVkVHJhY2tzKS5wdXNoLmFwcGx5KF9yZW1vdmVkVHJhY2tzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VwZGF0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIF9zb25nLnVwZGF0ZS5jYWxsKHRoaXMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3BsYXknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwbGF5KHR5cGUpIHtcbiAgICAgIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4zID4gMSA/IF9sZW4zIC0gMSA6IDApLCBfa2V5MyA9IDE7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcbiAgICAgICAgYXJnc1tfa2V5MyAtIDFdID0gYXJndW1lbnRzW19rZXkzXTtcbiAgICAgIH1cblxuICAgICAgLy91bmxvY2tXZWJBdWRpbygpXG4gICAgICB0aGlzLl9wbGF5LmFwcGx5KHRoaXMsIFt0eXBlXS5jb25jYXQoYXJncykpO1xuICAgICAgaWYgKHRoaXMuX3ByZWNvdW50QmFycyA+IDApIHtcbiAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3ByZWNvdW50aW5nJywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpcyB9KTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLmRpc3BhdGNoRXZlbnQpKHsgdHlwZTogJ3N0YXJ0X3JlY29yZGluZycsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXMgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoeyB0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXMgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX3BsYXknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfcGxheSh0eXBlKSB7XG4gICAgICBpZiAodHlwZW9mIHR5cGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGZvciAodmFyIF9sZW40ID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW40ID4gMSA/IF9sZW40IC0gMSA6IDApLCBfa2V5NCA9IDE7IF9rZXk0IDwgX2xlbjQ7IF9rZXk0KyspIHtcbiAgICAgICAgICBhcmdzW19rZXk0IC0gMV0gPSBhcmd1bWVudHNbX2tleTRdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbi5hcHBseSh0aGlzLCBbdHlwZV0uY29uY2F0KGFyZ3MpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnBsYXlpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2N1cnJlbnRNaWxsaXMpXG5cbiAgICAgIHRoaXMuX3JlZmVyZW5jZSA9IHRoaXMuX3RpbWVTdGFtcCA9IF9pbml0X2F1ZGlvLmNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwO1xuICAgICAgdGhpcy5fc2NoZWR1bGVyLnNldFRpbWVTdGFtcCh0aGlzLl9yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5fc3RhcnRNaWxsaXMgPSB0aGlzLl9jdXJyZW50TWlsbGlzO1xuXG4gICAgICBpZiAodGhpcy5fcHJlY291bnRCYXJzID4gMCAmJiB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZykge1xuXG4gICAgICAgIC8vIGNyZWF0ZSBwcmVjb3VudCBldmVudHMsIHRoZSBwbGF5aGVhZCB3aWxsIGJlIG1vdmVkIHRvIHRoZSBmaXJzdCBiZWF0IG9mIHRoZSBjdXJyZW50IGJhclxuICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMuX21ldHJvbm9tZS5jcmVhdGVQcmVjb3VudEV2ZW50cyhwb3NpdGlvbi5iYXIsIHBvc2l0aW9uLmJhciArIHRoaXMuX3ByZWNvdW50QmFycywgdGhpcy5fcmVmZXJlbmNlKTtcbiAgICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKCdiYXJzYmVhdHMnLCBbcG9zaXRpb24uYmFyXSwgJ21pbGxpcycpLm1pbGxpcztcbiAgICAgICAgdGhpcy5fcHJlY291bnREdXJhdGlvbiA9IHRoaXMuX21ldHJvbm9tZS5wcmVjb3VudER1cmF0aW9uO1xuICAgICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgKyB0aGlzLl9wcmVjb3VudER1cmF0aW9uO1xuXG4gICAgICAgIC8vIGNvbnNvbGUuZ3JvdXAoJ3ByZWNvdW50JylcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3Bvc2l0aW9uJywgdGhpcy5nZXRQb3NpdGlvbigpKVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnX2N1cnJlbnRNaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnZW5kUHJlY291bnRNaWxsaXMnLCB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcylcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ19wcmVjb3VudER1cmF0aW9uJywgdGhpcy5fcHJlY291bnREdXJhdGlvbilcbiAgICAgICAgLy8gY29uc29sZS5ncm91cEVuZCgncHJlY291bnQnKVxuICAgICAgICAvL2NvbnNvbGUubG9nKCdwcmVjb3VudER1cmF0aW9uJywgdGhpcy5fbWV0cm9ub21lLmNyZWF0ZVByZWNvdW50RXZlbnRzKHRoaXMuX3ByZWNvdW50QmFycywgdGhpcy5fcmVmZXJlbmNlKSlcbiAgICAgICAgdGhpcy5wcmVjb3VudGluZyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDA7XG4gICAgICAgIHRoaXMucGxheWluZyA9IHRydWU7XG4gICAgICAgIHRoaXMucmVjb3JkaW5nID0gdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmc7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2VuZFByZWNvdW50TWlsbGlzKVxuXG4gICAgICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKTtcbiAgICAgIHRoaXMuX3NjaGVkdWxlci5pbml0KHRoaXMuX2N1cnJlbnRNaWxsaXMpO1xuICAgICAgdGhpcy5fbG9vcCA9IHRoaXMubG9vcGluZyAmJiB0aGlzLl9jdXJyZW50TWlsbGlzIDw9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXM7XG4gICAgICB0aGlzLl9wdWxzZSgpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19wdWxzZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9wdWxzZSgpIHtcbiAgICAgIGlmICh0aGlzLnBsYXlpbmcgPT09IGZhbHNlICYmIHRoaXMucHJlY291bnRpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3BlcmZvcm1VcGRhdGUgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSA9IGZhbHNlO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdwdWxzZSB1cGRhdGUnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgICAgICBfc29uZy5fdXBkYXRlLmNhbGwodGhpcyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBub3cgPSBfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMDtcbiAgICAgIC8vY29uc29sZS5sb2cobm93LCBwZXJmb3JtYW5jZS5ub3coKSlcbiAgICAgIHZhciBkaWZmID0gbm93IC0gdGhpcy5fcmVmZXJlbmNlO1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyArPSBkaWZmO1xuICAgICAgdGhpcy5fcmVmZXJlbmNlID0gbm93O1xuXG4gICAgICBpZiAodGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPiAwKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA+IHRoaXMuX2N1cnJlbnRNaWxsaXMpIHtcbiAgICAgICAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKGRpZmYpO1xuICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9wdWxzZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAvL3JldHVybiBiZWNhdXNlIGR1cmluZyBwcmVjb3VudGluZyBvbmx5IHByZWNvdW50IG1ldHJvbm9tZSBldmVudHMgZ2V0IHNjaGVkdWxlZFxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gMDtcbiAgICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyAtPSB0aGlzLl9wcmVjb3VudER1cmF0aW9uO1xuICAgICAgICBpZiAodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcpIHtcbiAgICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgIHRoaXMucmVjb3JkaW5nID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fc3RhcnRNaWxsaXMgfSk7XG4gICAgICAgICAgLy9kaXNwYXRjaEV2ZW50KHt0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9sb29wICYmIHRoaXMuX2N1cnJlbnRNaWxsaXMgPj0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcykge1xuICAgICAgICB0aGlzLl9jdXJyZW50TWlsbGlzIC09IHRoaXMuX2xvb3BEdXJhdGlvbjtcbiAgICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKTtcbiAgICAgICAgLy90aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcykgLy8gcGxheWhlYWQgaXMgYSBiaXQgYWhlYWQgb25seSBkdXJpbmcgdGhpcyBmcmFtZVxuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcGxheWhlYWQudXBkYXRlKCdtaWxsaXMnLCBkaWZmKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fdGlja3MgPSB0aGlzLl9wbGF5aGVhZC5nZXQoKS50aWNrcztcblxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzLCB0aGlzLl9kdXJhdGlvbk1pbGxpcylcblxuICAgICAgaWYgKHRoaXMuX2N1cnJlbnRNaWxsaXMgPj0gdGhpcy5fZHVyYXRpb25NaWxsaXMpIHtcbiAgICAgICAgdmFyIF9zY2hlZHVsZXIkZXZlbnRzO1xuXG4gICAgICAgIGlmICh0aGlzLnJlY29yZGluZyAhPT0gdHJ1ZSB8fCB0aGlzLmF1dG9TaXplICE9PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCBhbiBleHRyYSBiYXIgdG8gdGhlIHNpemUgb2YgdGhpcyBzb25nXG4gICAgICAgIHZhciBfZXZlbnRzID0gdGhpcy5fbWV0cm9ub21lLmFkZEV2ZW50cyh0aGlzLmJhcnMsIHRoaXMuYmFycyArIDEpO1xuICAgICAgICB2YXIgdG9iZVBhcnNlZCA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoX2V2ZW50cyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl90aW1lRXZlbnRzKSk7XG4gICAgICAgICgwLCBfdXRpbC5zb3J0RXZlbnRzKSh0b2JlUGFyc2VkKTtcbiAgICAgICAgKDAsIF9wYXJzZV9ldmVudHMucGFyc2VFdmVudHMpKHRvYmVQYXJzZWQpO1xuICAgICAgICAoX3NjaGVkdWxlciRldmVudHMgPSB0aGlzLl9zY2hlZHVsZXIuZXZlbnRzKS5wdXNoLmFwcGx5KF9zY2hlZHVsZXIkZXZlbnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoX2V2ZW50cykpO1xuICAgICAgICB0aGlzLl9zY2hlZHVsZXIubnVtRXZlbnRzICs9IF9ldmVudHMubGVuZ3RoO1xuICAgICAgICB2YXIgbGFzdEV2ZW50ID0gX2V2ZW50c1tfZXZlbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICB2YXIgZXh0cmFNaWxsaXMgPSBsYXN0RXZlbnQudGlja3NQZXJCYXIgKiBsYXN0RXZlbnQubWlsbGlzUGVyVGljaztcbiAgICAgICAgdGhpcy5fbGFzdEV2ZW50LnRpY2tzICs9IGxhc3RFdmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcyArPSBleHRyYU1pbGxpcztcbiAgICAgICAgdGhpcy5fZHVyYXRpb25NaWxsaXMgKz0gZXh0cmFNaWxsaXM7XG4gICAgICAgIHRoaXMuYmFycysrO1xuICAgICAgICB0aGlzLl9yZXNpemVkID0gdHJ1ZTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnbGVuZ3RoJywgdGhpcy5fbGFzdEV2ZW50LnRpY2tzLCB0aGlzLl9sYXN0RXZlbnQubWlsbGlzLCB0aGlzLmJhcnMsIGxhc3RFdmVudClcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZShkaWZmKTtcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3B1bHNlLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3BhdXNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGF1c2UoKSB7XG4gICAgICB0aGlzLnBhdXNlZCA9ICF0aGlzLnBhdXNlZDtcbiAgICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hbGxOb3Rlc09mZigpO1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoeyB0eXBlOiAncGF1c2UnLCBkYXRhOiB0aGlzLnBhdXNlZCB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoeyB0eXBlOiAncGF1c2UnLCBkYXRhOiB0aGlzLnBhdXNlZCB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzdG9wJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ1NUT1AnKVxuICAgICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5hbGxOb3Rlc09mZigpO1xuICAgICAgaWYgKHRoaXMucGxheWluZyB8fCB0aGlzLnBhdXNlZCkge1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9jdXJyZW50TWlsbGlzICE9PSAwKSB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSAwO1xuICAgICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpO1xuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHtcbiAgICAgICAgICB0aGlzLnN0b3BSZWNvcmRpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoeyB0eXBlOiAnc3RvcCcgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc3RhcnRSZWNvcmRpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFydFJlY29yZGluZygpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fcmVjb3JkSWQgPSAncmVjb3JkaW5nXycgKyByZWNvcmRpbmdJbmRleCsrICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2suX3N0YXJ0UmVjb3JkaW5nKF90aGlzMy5fcmVjb3JkSWQpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc3RvcFJlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgaWYgKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2suX3N0b3BSZWNvcmRpbmcoX3RoaXM0Ll9yZWNvcmRJZCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZTtcbiAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7IHR5cGU6ICdzdG9wX3JlY29yZGluZycgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndW5kb1JlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVuZG9SZWNvcmRpbmcoKSB7XG4gICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICAgIHRyYWNrLnVuZG9SZWNvcmRpbmcoX3RoaXM1Ll9yZWNvcmRJZCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVkb1JlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlZG9SZWNvcmRpbmcoKSB7XG4gICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICAgIHRyYWNrLnJlZG9SZWNvcmRpbmcoX3RoaXM2Ll9yZWNvcmRJZCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0TWV0cm9ub21lJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0TWV0cm9ub21lKGZsYWcpIHtcbiAgICAgIGlmICh0eXBlb2YgZmxhZyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy51c2VNZXRyb25vbWUgPSAhdGhpcy51c2VNZXRyb25vbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9IGZsYWc7XG4gICAgICB9XG4gICAgICB0aGlzLl9tZXRyb25vbWUubXV0ZSghdGhpcy51c2VNZXRyb25vbWUpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvbmZpZ3VyZU1ldHJvbm9tZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbmZpZ3VyZU1ldHJvbm9tZShjb25maWcpIHtcbiAgICAgIHRoaXMuX21ldHJvbm9tZS5jb25maWd1cmUoY29uZmlnKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb25maWd1cmUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb25maWd1cmUoY29uZmlnKSB7XG4gICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgaWYgKHR5cGVvZiBjb25maWcucGl0Y2ggIT09ICd1bmRlZmluZWQnKSB7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5waXRjaCA9PT0gdGhpcy5waXRjaCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBpdGNoID0gY29uZmlnLnBpdGNoO1xuICAgICAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBldmVudC51cGRhdGVQaXRjaChfdGhpczcucGl0Y2gpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBjb25maWcucHBxICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoY29uZmlnLnBwcSA9PT0gdGhpcy5wcHEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBwcUZhY3RvciA9IGNvbmZpZy5wcHEgLyB0aGlzLnBwcTtcbiAgICAgICAgdGhpcy5wcHEgPSBjb25maWcucHBxO1xuICAgICAgICB0aGlzLl9hbGxFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGUudGlja3MgPSBldmVudC50aWNrcyAqIHBwcUZhY3RvcjtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlO1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGNvbmZpZy5wbGF5YmFja1NwZWVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoY29uZmlnLnBsYXliYWNrU3BlZWQgPT09IHRoaXMucGxheWJhY2tTcGVlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBsYXliYWNrU3BlZWQgPSBjb25maWcucGxheWJhY2tTcGVlZDtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdhbGxOb3Rlc09mZicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFsbE5vdGVzT2ZmKCkge1xuICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHRyYWNrKSB7XG4gICAgICAgIHRyYWNrLmFsbE5vdGVzT2ZmKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fc2NoZWR1bGVyLmFsbE5vdGVzT2ZmKCk7XG4gICAgICB0aGlzLl9tZXRyb25vbWUuYWxsTm90ZXNPZmYoKTtcbiAgICB9XG4gICAgLypcbiAgICAgIHBhbmljKCl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICB0aGlzLl90cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHtcbiAgICAgICAgICAgIHRyYWNrLmRpc2Nvbm5lY3QodGhpcy5fZ2Fpbk5vZGUpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKCh0cmFjaykgPT4ge1xuICAgICAgICAgICAgICB0cmFjay5jb25uZWN0KHRoaXMuX2dhaW5Ob2RlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH0sIDEwMClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdnZXRUcmFja3MnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRUcmFja3MoKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl90cmFja3MpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBhcnRzKCkge1xuICAgICAgcmV0dXJuIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fcGFydHMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRFdmVudHMoKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9ldmVudHMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXROb3RlcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldE5vdGVzKCkge1xuICAgICAgcmV0dXJuIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fbm90ZXMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjYWxjdWxhdGVQb3NpdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uKGFyZ3MpIHtcbiAgICAgIHJldHVybiAoMCwgX3Bvc2l0aW9uLmNhbGN1bGF0ZVBvc2l0aW9uKSh0aGlzLCBhcmdzKTtcbiAgICB9XG5cbiAgICAvLyBAYXJncyAtPiBzZWUgX2NhbGN1bGF0ZVBvc2l0aW9uXG5cbiAgfSwge1xuICAgIGtleTogJ3NldFBvc2l0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UG9zaXRpb24odHlwZSkge1xuXG4gICAgICB2YXIgd2FzUGxheWluZyA9IHRoaXMucGxheWluZztcbiAgICAgIGlmICh0aGlzLnBsYXlpbmcpIHtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgX2xlbjUgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjUgPiAxID8gX2xlbjUgLSAxIDogMCksIF9rZXk1ID0gMTsgX2tleTUgPCBfbGVuNTsgX2tleTUrKykge1xuICAgICAgICBhcmdzW19rZXk1IC0gMV0gPSBhcmd1bWVudHNbX2tleTVdO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJyk7XG4gICAgICAvL2xldCBtaWxsaXMgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnbWlsbGlzJylcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gcG9zaXRpb24ubWlsbGlzO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzKVxuXG4gICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgICBkYXRhOiBwb3NpdGlvblxuICAgICAgfSk7XG5cbiAgICAgIGlmICh3YXNQbGF5aW5nKSB7XG4gICAgICAgIHRoaXMuX3BsYXkoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vQHRvZG86IGdldCB0aGlzIGluZm9ybWF0aW9uIGZyb20gbGV0ICdwb3NpdGlvbicgLT4gd2UgaGF2ZSBqdXN0IGNhbGN1bGF0ZWQgdGhlIHBvc2l0aW9uXG4gICAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcyk7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKCdzZXRQb3NpdGlvbicsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0UG9zaXRpb24nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQb3NpdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKS5wb3NpdGlvbjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRQbGF5aGVhZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBsYXloZWFkKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BsYXloZWFkLmdldCgpO1xuICAgIH1cblxuICAgIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cblxuICB9LCB7XG4gICAga2V5OiAnc2V0TGVmdExvY2F0b3InLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRMZWZ0TG9jYXRvcih0eXBlKSB7XG4gICAgICBmb3IgKHZhciBfbGVuNiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuNiA+IDEgPyBfbGVuNiAtIDEgOiAwKSwgX2tleTYgPSAxOyBfa2V5NiA8IF9sZW42OyBfa2V5NisrKSB7XG4gICAgICAgIGFyZ3NbX2tleTYgLSAxXSA9IGFyZ3VtZW50c1tfa2V5Nl07XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2xlZnRMb2NhdG9yID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpO1xuXG4gICAgICBpZiAodGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBwb3NpdGlvbiBmb3IgbG9jYXRvcicpO1xuICAgICAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHsgbWlsbGlzOiAwLCB0aWNrczogMCB9O1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuXG4gIH0sIHtcbiAgICBrZXk6ICdzZXRSaWdodExvY2F0b3InLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRSaWdodExvY2F0b3IodHlwZSkge1xuICAgICAgZm9yICh2YXIgX2xlbjcgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjcgPiAxID8gX2xlbjcgLSAxIDogMCksIF9rZXk3ID0gMTsgX2tleTcgPCBfbGVuNzsgX2tleTcrKykge1xuICAgICAgICBhcmdzW19rZXk3IC0gMV0gPSBhcmd1bWVudHNbX2tleTddO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJyk7XG5cbiAgICAgIGlmICh0aGlzLl9yaWdodExvY2F0b3IgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHsgbWlsbGlzOiAwLCB0aWNrczogMCB9O1xuICAgICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcG9zaXRpb24gZm9yIGxvY2F0b3InKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldExvb3AnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRMb29wKCkge1xuICAgICAgdmFyIGZsYWcgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IG51bGw7XG5cblxuICAgICAgdGhpcy5sb29waW5nID0gZmxhZyAhPT0gbnVsbCA/IGZsYWcgOiAhdGhpcy5fbG9vcDtcblxuICAgICAgaWYgKHRoaXMuX3JpZ2h0TG9jYXRvciA9PT0gZmFsc2UgfHwgdGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxvb3BpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBsb2NhdG9ycyBjYW4gbm90ICh5ZXQpIGJlIHVzZWQgdG8ganVtcCBvdmVyIGEgc2VnbWVudFxuICAgICAgaWYgKHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMgPD0gdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzKSB7XG4gICAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxvb3BpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9sb29wRHVyYXRpb24gPSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzIC0gdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9sb29wLCB0aGlzLl9sb29wRHVyYXRpb24pXG4gICAgICB0aGlzLl9zY2hlZHVsZXIuYmV5b25kTG9vcCA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgPiB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzO1xuICAgICAgdGhpcy5fbG9vcCA9IHRoaXMubG9vcGluZyAmJiB0aGlzLl9jdXJyZW50TWlsbGlzIDw9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXM7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2xvb3AsIHRoaXMubG9vcGluZylcbiAgICAgIHJldHVybiB0aGlzLmxvb3Bpbmc7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0UHJlY291bnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQcmVjb3VudCgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMDtcblxuICAgICAgdGhpcy5fcHJlY291bnRCYXJzID0gdmFsdWU7XG4gICAgfVxuXG4gICAgLypcbiAgICAgIGhlbHBlciBtZXRob2Q6IGNvbnZlcnRzIHVzZXIgZnJpZW5kbHkgcG9zaXRpb24gZm9ybWF0IHRvIGludGVybmFsIGZvcm1hdFxuICAgICAgIHBvc2l0aW9uOlxuICAgICAgICAtICd0aWNrcycsIDk2MDAwXG4gICAgICAgIC0gJ21pbGxpcycsIDEyMzRcbiAgICAgICAgLSAncGVyY2VudGFnZScsIDU1XG4gICAgICAgIC0gJ2JhcnNiZWF0cycsIDEsIDQsIDAsIDI1IC0+IGJhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXG4gICAgICAgIC0gJ3RpbWUnLCAwLCAzLCA0OSwgNTY2IC0+IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX2NhbGN1bGF0ZVBvc2l0aW9uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsIHJlc3VsdFR5cGUpIHtcbiAgICAgIHZhciB0YXJnZXQgPSB2b2lkIDA7XG5cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICd0aWNrcyc6XG4gICAgICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgICAgIC8vdGFyZ2V0ID0gYXJnc1swXSB8fCAwXG4gICAgICAgICAgdGFyZ2V0ID0gYXJncyB8fCAwO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgICAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgICAgIHRhcmdldCA9IGFyZ3M7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLmxvZygndW5zdXBwb3J0ZWQgdHlwZScpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHBvc2l0aW9uID0gKDAsIF9wb3NpdGlvbi5jYWxjdWxhdGVQb3NpdGlvbikodGhpcywge1xuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgcmVzdWx0OiByZXN1bHRUeXBlXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZEV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gKDAsIF9ldmVudGxpc3RlbmVyLmFkZEV2ZW50TGlzdGVuZXIpKHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCkge1xuICAgICAgKDAsIF9ldmVudGxpc3RlbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIpKHR5cGUsIGlkKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzYXZlQXNNSURJRmlsZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNhdmVBc01JRElGaWxlKG5hbWUpIHtcbiAgICAgICgwLCBfc2F2ZV9taWRpZmlsZS5zYXZlQXNNSURJRmlsZSkodGhpcywgbmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0Vm9sdW1lJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Vm9sdW1lKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPCAwIHx8IHZhbHVlID4gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnU29uZy5zZXRWb2x1bWUoKSBhY2NlcHRzIGEgdmFsdWUgYmV0d2VlbiAwIGFuZCAxLCB5b3UgZW50ZXJlZDonLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMudm9sdW1lID0gdmFsdWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0Vm9sdW1lJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Vm9sdW1lKCkge1xuICAgICAgcmV0dXJuIHRoaXMudm9sdW1lO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFBhbm5pbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRQYW5uaW5nKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPCAtMSB8fCB2YWx1ZSA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Nvbmcuc2V0UGFubmluZygpIGFjY2VwdHMgYSB2YWx1ZSBiZXR3ZWVuIC0xIChmdWxsIGxlZnQpIGFuZCAxIChmdWxsIHJpZ2h0KSwgeW91IGVudGVyZWQ6JywgdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgICAgdHJhY2suc2V0UGFubmluZyh2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3Bhbm5lclZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNvbmc7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy51cGRhdGUgPSB1cGRhdGU7XG5leHBvcnRzLl91cGRhdGUgPSBfdXBkYXRlO1xuXG52YXIgX3BhcnNlX2V2ZW50cyA9IHJlcXVpcmUoJy4vcGFyc2VfZXZlbnRzJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX2NvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbnZhciBfcG9zaXRpb24gPSByZXF1aXJlKCcuL3Bvc2l0aW9uJyk7XG5cbnZhciBfbWlkaV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaV9ldmVudCcpO1xuXG52YXIgX2V2ZW50bGlzdGVuZXIgPSByZXF1aXJlKCcuL2V2ZW50bGlzdGVuZXInKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9IC8vIGNhbGxlZCBieSBzb25nXG5cblxuZnVuY3Rpb24gdXBkYXRlKCkge1xuICBpZiAodGhpcy5wbGF5aW5nID09PSBmYWxzZSkge1xuICAgIF91cGRhdGUuY2FsbCh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9wZXJmb3JtVXBkYXRlID0gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXBkYXRlKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIGlmICh0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSBmYWxzZSAmJiB0aGlzLl9yZW1vdmVkVHJhY2tzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9uZXdFdmVudHMubGVuZ3RoID09PSAwICYmIHRoaXMuX21vdmVkRXZlbnRzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9uZXdQYXJ0cy5sZW5ndGggPT09IDAgJiYgdGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLl9yZXNpemVkID09PSBmYWxzZSkge1xuICAgIHJldHVybjtcbiAgfVxuICAvL2RlYnVnXG4gIC8vdGhpcy5pc1BsYXlpbmcgPSB0cnVlXG5cbiAgLy9jb25zb2xlLmdyb3VwQ29sbGFwc2VkKCd1cGRhdGUgc29uZycpXG4gIGNvbnNvbGUudGltZSgndXBkYXRpbmcgc29uZyB0b29rJyk7XG5cbiAgLy8gVElNRSBFVkVOVFNcblxuICAvLyBjaGVjayBpZiB0aW1lIGV2ZW50cyBhcmUgdXBkYXRlZFxuICBpZiAodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gdHJ1ZSkge1xuICAgIC8vY29uc29sZS5sb2coJ3VwZGF0ZVRpbWVFdmVudHMnLCB0aGlzLl90aW1lRXZlbnRzLmxlbmd0aClcbiAgICAoMCwgX3BhcnNlX2V2ZW50cy5wYXJzZVRpbWVFdmVudHMpKHRoaXMsIHRoaXMuX3RpbWVFdmVudHMsIHRoaXMuaXNQbGF5aW5nKTtcbiAgICAvL2NvbnNvbGUubG9nKCd0aW1lIGV2ZW50cyAlTycsIHRoaXMuX3RpbWVFdmVudHMpXG4gIH1cblxuICAvLyBvbmx5IHBhcnNlIG5ldyBhbmQgbW92ZWQgZXZlbnRzXG4gIHZhciB0b2JlUGFyc2VkID0gW107XG5cbiAgLy8gYnV0IHBhcnNlIGFsbCBldmVudHMgaWYgdGhlIHRpbWUgZXZlbnRzIGhhdmUgYmVlbiB1cGRhdGVkXG4gIGlmICh0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSB0cnVlKSB7XG4gICAgdG9iZVBhcnNlZCA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fZXZlbnRzKSk7XG4gIH1cblxuICAvLyBUUkFDS1NcbiAgLy8gcmVtb3ZlZCB0cmFja3NcbiAgaWYgKHRoaXMuX3JlbW92ZWRUcmFja3MubGVuZ3RoID4gMCkge1xuICAgIHRoaXMuX3JlbW92ZWRUcmFja3MuZm9yRWFjaChmdW5jdGlvbiAodHJhY2spIHtcbiAgICAgIF90aGlzLl90cmFja3NCeUlkLmRlbGV0ZSh0cmFjay5pZCk7XG4gICAgICB0cmFjay5yZW1vdmVQYXJ0cyh0cmFjay5nZXRQYXJ0cygpKTtcbiAgICAgIHRyYWNrLl9zb25nID0gbnVsbDtcbiAgICAgIHRyYWNrLl9nYWluTm9kZS5kaXNjb25uZWN0KCk7XG4gICAgICB0cmFjay5fc29uZ0dhaW5Ob2RlID0gbnVsbDtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFBBUlRTXG4gIC8vIHJlbW92ZWQgcGFydHNcbiAgLy9jb25zb2xlLmxvZygncmVtb3ZlZCBwYXJ0cyAlTycsIHRoaXMuX2NoYW5nZWRQYXJ0cylcbiAgaWYgKHRoaXMuX3JlbW92ZWRQYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgdGhpcy5fcmVtb3ZlZFBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgIF90aGlzLl9wYXJ0c0J5SWQuZGVsZXRlKHBhcnQuaWQpO1xuICAgIH0pO1xuICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpO1xuICB9XG5cbiAgLy8gYWRkIG5ldyBwYXJ0c1xuICAvL2NvbnNvbGUubG9nKCduZXcgcGFydHMgJU8nLCB0aGlzLl9uZXdQYXJ0cylcbiAgdGhpcy5fbmV3UGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgIHBhcnQuX3NvbmcgPSBfdGhpcztcbiAgICBfdGhpcy5fcGFydHNCeUlkLnNldChwYXJ0LmlkLCBwYXJ0KTtcbiAgICBwYXJ0LnVwZGF0ZSgpO1xuICB9KTtcblxuICAvLyB1cGRhdGUgY2hhbmdlZCBwYXJ0c1xuICAvL2NvbnNvbGUubG9nKCdjaGFuZ2VkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKVxuICB0aGlzLl9jaGFuZ2VkUGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgIHBhcnQudXBkYXRlKCk7XG4gIH0pO1xuXG4gIC8vIEVWRU5UU1xuXG4gIC8vIGZpbHRlciByZW1vdmVkIGV2ZW50c1xuICAvL2NvbnNvbGUubG9nKCdyZW1vdmVkIGV2ZW50cyAlTycsIHRoaXMuX3JlbW92ZWRFdmVudHMpXG4gIHRoaXMuX3JlbW92ZWRFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgdHJhY2sgPSBldmVudC5taWRpTm90ZS5fdHJhY2s7XG4gICAgLy8gdW5zY2hlZHVsZSBhbGwgcmVtb3ZlZCBldmVudHMgdGhhdCBhbHJlYWR5IGhhdmUgYmVlbiBzY2hlZHVsZWRcbiAgICBpZiAoZXZlbnQudGltZSA+PSBfdGhpcy5fY3VycmVudE1pbGxpcykge1xuICAgICAgdHJhY2sudW5zY2hlZHVsZShldmVudCk7XG4gICAgfVxuICAgIF90aGlzLl9ub3Rlc0J5SWQuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlLmlkKTtcbiAgICBfdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpO1xuICB9KTtcblxuICAvLyBhZGQgbmV3IGV2ZW50c1xuICAvL2NvbnNvbGUubG9nKCduZXcgZXZlbnRzICVPJywgdGhpcy5fbmV3RXZlbnRzKVxuICB0aGlzLl9uZXdFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBfdGhpcy5fZXZlbnRzQnlJZC5zZXQoZXZlbnQuaWQsIGV2ZW50KTtcbiAgICBfdGhpcy5fZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgIHRvYmVQYXJzZWQucHVzaChldmVudCk7XG4gIH0pO1xuXG4gIC8vIG1vdmVkIGV2ZW50cyBuZWVkIHRvIGJlIHBhcnNlZFxuICAvL2NvbnNvbGUubG9nKCdtb3ZlZCAlTycsIHRoaXMuX21vdmVkRXZlbnRzKVxuICB0aGlzLl9tb3ZlZEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vIGRvbid0IGFkZCBtb3ZlZCBldmVudHMgaWYgdGhlIHRpbWUgZXZlbnRzIGhhdmUgYmVlbiB1cGRhdGVkIC0+IHRoZXkgaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gdGhlIHRvYmVQYXJzZWQgYXJyYXlcbiAgICBpZiAoX3RoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IGZhbHNlKSB7XG4gICAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gcGFyc2UgYWxsIG5ldyBhbmQgbW92ZWQgZXZlbnRzXG4gIGlmICh0b2JlUGFyc2VkLmxlbmd0aCA+IDApIHtcbiAgICAvL2NvbnNvbGUudGltZSgncGFyc2UnKVxuICAgIC8vY29uc29sZS5sb2coJ3RvYmVQYXJzZWQgJU8nLCB0b2JlUGFyc2VkKVxuICAgIC8vY29uc29sZS5sb2coJ3BhcnNlRXZlbnRzJywgdG9iZVBhcnNlZC5sZW5ndGgpXG5cbiAgICB0b2JlUGFyc2VkID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0b2JlUGFyc2VkKSwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX3RpbWVFdmVudHMpKTtcbiAgICAoMCwgX3BhcnNlX2V2ZW50cy5wYXJzZUV2ZW50cykodG9iZVBhcnNlZCwgdGhpcy5pc1BsYXlpbmcpO1xuXG4gICAgLy8gYWRkIE1JREkgbm90ZXMgdG8gc29uZ1xuICAgIHRvYmVQYXJzZWQuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuaWQsIGV2ZW50LnR5cGUsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IF9jb25zdGFudHMuTUlESUV2ZW50VHlwZXMuTk9URV9PTikge1xuICAgICAgICBpZiAoZXZlbnQubWlkaU5vdGUpIHtcbiAgICAgICAgICBfdGhpcy5fbm90ZXNCeUlkLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSk7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkLCBldmVudC50eXBlKVxuICAgICAgICAgIC8vdGhpcy5fbm90ZXMucHVzaChldmVudC5taWRpTm90ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIC8vY29uc29sZS50aW1lRW5kKCdwYXJzZScpXG4gIH1cblxuICBpZiAodG9iZVBhcnNlZC5sZW5ndGggPiAwIHx8IHRoaXMuX3JlbW92ZWRFdmVudHMubGVuZ3RoID4gMCkge1xuICAgIC8vY29uc29sZS50aW1lKCd0byBhcnJheScpXG4gICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKTtcbiAgICB0aGlzLl9ub3RlcyA9IEFycmF5LmZyb20odGhpcy5fbm90ZXNCeUlkLnZhbHVlcygpKTtcbiAgICAvL2NvbnNvbGUudGltZUVuZCgndG8gYXJyYXknKVxuICB9XG5cbiAgLy9jb25zb2xlLnRpbWUoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuICAoMCwgX3V0aWwuc29ydEV2ZW50cykodGhpcy5fZXZlbnRzKTtcbiAgdGhpcy5fbm90ZXMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBhLm5vdGVPbi50aWNrcyAtIGIubm90ZU9uLnRpY2tzO1xuICB9KTtcbiAgLy9jb25zb2xlLnRpbWVFbmQoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuXG4gIC8vY29uc29sZS5sb2coJ25vdGVzICVPJywgdGhpcy5fbm90ZXMpXG4gIGNvbnNvbGUudGltZUVuZCgndXBkYXRpbmcgc29uZyB0b29rJyk7XG5cbiAgLy8gU09ORyBEVVJBVElPTlxuXG4gIC8vIGdldCB0aGUgbGFzdCBldmVudCBvZiB0aGlzIHNvbmdcbiAgdmFyIGxhc3RFdmVudCA9IHRoaXMuX2V2ZW50c1t0aGlzLl9ldmVudHMubGVuZ3RoIC0gMV07XG4gIHZhciBsYXN0VGltZUV2ZW50ID0gdGhpcy5fdGltZUV2ZW50c1t0aGlzLl90aW1lRXZlbnRzLmxlbmd0aCAtIDFdO1xuICAvL2NvbnNvbGUubG9nKGxhc3RFdmVudCwgbGFzdFRpbWVFdmVudClcblxuICAvLyBjaGVjayBpZiBzb25nIGhhcyBhbHJlYWR5IGFueSBldmVudHNcbiAgaWYgKGxhc3RFdmVudCBpbnN0YW5jZW9mIF9taWRpX2V2ZW50Lk1JRElFdmVudCA9PT0gZmFsc2UpIHtcbiAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50O1xuICB9IGVsc2UgaWYgKGxhc3RUaW1lRXZlbnQudGlja3MgPiBsYXN0RXZlbnQudGlja3MpIHtcbiAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50O1xuICB9XG4gIC8vY29uc29sZS5sb2cobGFzdEV2ZW50LCB0aGlzLmJhcnMpXG5cbiAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBkYXRhIG9mIHRoZSBmaXJzdCBiZWF0IGluIHRoZSBiYXIgYWZ0ZXIgdGhlIGxhc3QgYmFyXG4gIHRoaXMuYmFycyA9IE1hdGgubWF4KGxhc3RFdmVudC5iYXIsIHRoaXMuYmFycyk7XG4gIHZhciB0aWNrcyA9ICgwLCBfcG9zaXRpb24uY2FsY3VsYXRlUG9zaXRpb24pKHRoaXMsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICB0YXJnZXQ6IFt0aGlzLmJhcnMgKyAxXSxcbiAgICByZXN1bHQ6ICd0aWNrcydcbiAgfSkudGlja3M7XG5cbiAgLy8gd2Ugd2FudCB0byBwdXQgdGhlIEVORF9PRl9UUkFDSyBldmVudCBhdCB0aGUgdmVyeSBsYXN0IHRpY2sgb2YgdGhlIGxhc3QgYmFyLCBzbyB3ZSBjYWxjdWxhdGUgdGhhdCBwb3NpdGlvblxuICB2YXIgbWlsbGlzID0gKDAsIF9wb3NpdGlvbi5jYWxjdWxhdGVQb3NpdGlvbikodGhpcywge1xuICAgIHR5cGU6ICd0aWNrcycsXG4gICAgdGFyZ2V0OiB0aWNrcyAtIDEsXG4gICAgcmVzdWx0OiAnbWlsbGlzJ1xuICB9KS5taWxsaXM7XG5cbiAgdGhpcy5fbGFzdEV2ZW50LnRpY2tzID0gdGlja3MgLSAxO1xuICB0aGlzLl9sYXN0RXZlbnQubWlsbGlzID0gbWlsbGlzO1xuXG4gIC8vY29uc29sZS5sb2coJ2xlbmd0aCcsIHRoaXMuX2xhc3RFdmVudC50aWNrcywgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcywgdGhpcy5iYXJzKVxuXG4gIHRoaXMuX2R1cmF0aW9uVGlja3MgPSB0aGlzLl9sYXN0RXZlbnQudGlja3M7XG4gIHRoaXMuX2R1cmF0aW9uTWlsbGlzID0gdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcztcblxuICAvLyBNRVRST05PTUVcblxuICAvLyBhZGQgbWV0cm9ub21lIGV2ZW50c1xuICBpZiAodGhpcy5fdXBkYXRlTWV0cm9ub21lRXZlbnRzIHx8IHRoaXMuX21ldHJvbm9tZS5iYXJzICE9PSB0aGlzLmJhcnMgfHwgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gdHJ1ZSkge1xuICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9ICgwLCBfcGFyc2VfZXZlbnRzLnBhcnNlRXZlbnRzKShbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX3RpbWVFdmVudHMpLCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fbWV0cm9ub21lLmdldEV2ZW50cygpKSkpO1xuICB9XG4gIHRoaXMuX2FsbEV2ZW50cyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fbWV0cm9ub21lRXZlbnRzKSwgX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2V2ZW50cykpO1xuICAoMCwgX3V0aWwuc29ydEV2ZW50cykodGhpcy5fYWxsRXZlbnRzKTtcbiAgLy9jb25zb2xlLmxvZygnYWxsIGV2ZW50cyAlTycsIHRoaXMuX2FsbEV2ZW50cylcblxuICAvKlxuICAgIHRoaXMuX21ldHJvbm9tZS5nZXRFdmVudHMoKVxuICAgIHRoaXMuX2FsbEV2ZW50cyA9IFsuLi50aGlzLl9ldmVudHNdXG4gICAgc29ydEV2ZW50cyh0aGlzLl9hbGxFdmVudHMpXG4gICovXG5cbiAgLy9jb25zb2xlLmxvZygnY3VycmVudCBtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICB0aGlzLl9wbGF5aGVhZC51cGRhdGVTb25nKCk7XG4gIHRoaXMuX3NjaGVkdWxlci51cGRhdGVTb25nKCk7XG5cbiAgaWYgKHRoaXMucGxheWluZyA9PT0gZmFsc2UpIHtcbiAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpO1xuICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgZGF0YTogdGhpcy5fcGxheWhlYWQuZ2V0KCkucG9zaXRpb25cbiAgICB9KTtcbiAgfVxuXG4gIC8vIHJlc2V0XG4gIHRoaXMuX25ld1BhcnRzID0gW107XG4gIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdO1xuICB0aGlzLl9uZXdFdmVudHMgPSBbXTtcbiAgdGhpcy5fbW92ZWRFdmVudHMgPSBbXTtcbiAgdGhpcy5fcmVtb3ZlZEV2ZW50cyA9IFtdO1xuICB0aGlzLl9yZXNpemVkID0gZmFsc2U7XG4gIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSBmYWxzZTtcblxuICAvL2NvbnNvbGUuZ3JvdXBFbmQoJ3VwZGF0ZSBzb25nJylcbn0iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnNvbmdGcm9tTUlESUZpbGVTeW5jID0gc29uZ0Zyb21NSURJRmlsZVN5bmM7XG5leHBvcnRzLnNvbmdGcm9tTUlESUZpbGUgPSBzb25nRnJvbU1JRElGaWxlO1xuXG52YXIgX2lzb21vcnBoaWNGZXRjaCA9IHJlcXVpcmUoJ2lzb21vcnBoaWMtZmV0Y2gnKTtcblxudmFyIF9pc29tb3JwaGljRmV0Y2gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNvbW9ycGhpY0ZldGNoKTtcblxudmFyIF9taWRpZmlsZSA9IHJlcXVpcmUoJy4vbWlkaWZpbGUnKTtcblxudmFyIF9taWRpX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpX2V2ZW50Jyk7XG5cbnZhciBfcGFydCA9IHJlcXVpcmUoJy4vcGFydCcpO1xuXG52YXIgX3RyYWNrID0gcmVxdWlyZSgnLi90cmFjaycpO1xuXG52YXIgX3NvbmcgPSByZXF1aXJlKCcuL3NvbmcnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfZmV0Y2hfaGVscGVycyA9IHJlcXVpcmUoJy4vZmV0Y2hfaGVscGVycycpO1xuXG52YXIgX3NldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiB0b1NvbmcocGFyc2VkLCBzZXR0aW5ncykge1xuXG4gIHZhciB0cmFja3MgPSBwYXJzZWQudHJhY2tzO1xuICB2YXIgcHBxID0gcGFyc2VkLmhlYWRlci50aWNrc1BlckJlYXQ7IC8vIHRoZSBQUFEgYXMgc2V0IGluIHRoZSBsb2FkZWQgTUlESSBmaWxlXG4gIHZhciBwcHFGYWN0b3IgPSAxO1xuXG4gIC8vIGNoZWNrIGlmIHdlIG5lZWQgdG8gb3ZlcnJ1bGUgdGhlIFBQUSBvZnMgdGhlIGxvYWRlZCBNSURJIGZpbGVcbiAgaWYgKHR5cGVvZiBzZXR0aW5ncy5vdmVycnVsZVBQUSA9PT0gJ3VuZGVmaW5lZCcgfHwgc2V0dGluZ3Mub3ZlcnJ1bGVQUFEgPT09IHRydWUpIHtcbiAgICB2YXIgbmV3UFBRID0gKDAsIF9zZXR0aW5ncy5nZXRTZXR0aW5ncykoKS5wcHE7XG4gICAgcHBxRmFjdG9yID0gbmV3UFBRIC8gcHBxO1xuICAgIHBwcSA9IG5ld1BQUTtcbiAgfVxuXG4gIHZhciB0aW1lRXZlbnRzID0gW107XG4gIHZhciBicG0gPSAtMTtcbiAgdmFyIG5vbWluYXRvciA9IC0xO1xuICB2YXIgZGVub21pbmF0b3IgPSAtMTtcbiAgdmFyIG5ld1RyYWNrcyA9IFtdO1xuXG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHRyYWNrcy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgIHZhciB0cmFjayA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICB2YXIgbGFzdFRpY2tzID0gdm9pZCAwLFxuICAgICAgICAgIGxhc3RUeXBlID0gdm9pZCAwO1xuICAgICAgdmFyIHRpY2tzID0gMDtcbiAgICAgIHZhciB0eXBlID0gdm9pZCAwO1xuICAgICAgdmFyIGNoYW5uZWwgPSAtMTtcbiAgICAgIHZhciB0cmFja05hbWUgPSB2b2lkIDA7XG4gICAgICB2YXIgdHJhY2tJbnN0cnVtZW50TmFtZSA9IHZvaWQgMDtcbiAgICAgIHZhciBldmVudHMgPSBbXTtcblxuICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSB0cmFja1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwMjsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IChfc3RlcDIgPSBfaXRlcmF0b3IyLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBldmVudCA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgICAgIHRpY2tzICs9IGV2ZW50LmRlbHRhVGltZSAqIHBwcUZhY3RvcjtcblxuICAgICAgICAgIGlmIChjaGFubmVsID09PSAtMSAmJiB0eXBlb2YgZXZlbnQuY2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNoYW5uZWwgPSBldmVudC5jaGFubmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0eXBlID0gZXZlbnQuc3VidHlwZTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRlbHRhVGltZSwgdGlja3MsIHR5cGUpO1xuXG4gICAgICAgICAgc3dpdGNoIChldmVudC5zdWJ0eXBlKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ3RyYWNrTmFtZSc6XG4gICAgICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdpbnN0cnVtZW50TmFtZSc6XG4gICAgICAgICAgICAgIGlmIChldmVudC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgdHJhY2tJbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBfbWlkaV9ldmVudC5NSURJRXZlbnQodGlja3MsIDB4OTAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdub3RlT2ZmJzpcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHg4MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3NldFRlbXBvJzpcbiAgICAgICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGVtcG8gZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICAgICAgdmFyIHRtcCA9IDYwMDAwMDAwIC8gZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdDtcblxuICAgICAgICAgICAgICBpZiAodGlja3MgPT09IGxhc3RUaWNrcyAmJiB0eXBlID09PSBsYXN0VHlwZSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKCd0ZW1wbyBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCB0bXApO1xuICAgICAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoYnBtID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGJwbSA9IHRtcDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHg1MSwgdG1wKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICd0aW1lU2lnbmF0dXJlJzpcbiAgICAgICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICAgICAgaWYgKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ3RpbWUgc2lnbmF0dXJlIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAobm9taW5hdG9yID09PSAtMSkge1xuICAgICAgICAgICAgICAgIG5vbWluYXRvciA9IGV2ZW50Lm51bWVyYXRvcjtcbiAgICAgICAgICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRpbWVFdmVudHMucHVzaChuZXcgX21pZGlfZXZlbnQuTUlESUV2ZW50KHRpY2tzLCAweDU4LCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdjb250cm9sbGVyJzpcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHhCMCwgZXZlbnQuY29udHJvbGxlclR5cGUsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdwcm9ncmFtQ2hhbmdlJzpcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHhDMCwgZXZlbnQucHJvZ3JhbU51bWJlcikpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAncGl0Y2hCZW5kJzpcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2gobmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCh0aWNrcywgMHhFMCwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIGV2ZW50LnR5cGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxhc3RUeXBlID0gdHlwZTtcbiAgICAgICAgICBsYXN0VGlja3MgPSB0aWNrcztcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy9jb25zb2xlLmNvdW50KGV2ZW50cy5sZW5ndGgpXG4gICAgICAgIG5ld1RyYWNrcy5wdXNoKG5ldyBfdHJhY2suVHJhY2soe1xuICAgICAgICAgIG5hbWU6IHRyYWNrTmFtZSxcbiAgICAgICAgICBwYXJ0czogW25ldyBfcGFydC5QYXJ0KHtcbiAgICAgICAgICAgIGV2ZW50czogZXZlbnRzXG4gICAgICAgICAgfSldXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIHNvbmcgPSBuZXcgX3NvbmcuU29uZyh7XG4gICAgcHBxOiBwcHEsXG4gICAgYnBtOiBicG0sXG4gICAgbm9taW5hdG9yOiBub21pbmF0b3IsXG4gICAgZGVub21pbmF0b3I6IGRlbm9taW5hdG9yLFxuICAgIHRyYWNrczogbmV3VHJhY2tzLFxuICAgIHRpbWVFdmVudHM6IHRpbWVFdmVudHNcbiAgfSk7XG4gIC8vc29uZy51cGRhdGUoKVxuICByZXR1cm4gc29uZztcbn1cblxuZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZVN5bmMoZGF0YSkge1xuICB2YXIgc2V0dGluZ3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gIHZhciBzb25nID0gbnVsbDtcblxuICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKSB7XG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgIHNvbmcgPSB0b1NvbmcoKDAsIF9taWRpZmlsZS5wYXJzZU1JRElGaWxlKShidWZmZXIpLCBzZXR0aW5ncyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEuaGVhZGVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZGF0YS50cmFja3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gYSBNSURJIGZpbGUgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIHBhcnNlZFxuICAgIHNvbmcgPSB0b1NvbmcoZGF0YSwgc2V0dGluZ3MpO1xuICB9IGVsc2Uge1xuICAgIC8vIGEgYmFzZTY0IGVuY29kZWQgTUlESSBmaWxlXG4gICAgZGF0YSA9ICgwLCBfdXRpbC5iYXNlNjRUb0JpbmFyeSkoZGF0YSk7XG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIF9idWZmZXIgPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgICAgIHNvbmcgPSB0b1NvbmcoKDAsIF9taWRpZmlsZS5wYXJzZU1JRElGaWxlKShfYnVmZmVyKSwgc2V0dGluZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKCd3cm9uZyBkYXRhJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNvbmc7XG4gIC8vIHtcbiAgLy8gICBwcHEgPSBuZXdQUFEsXG4gIC8vICAgYnBtID0gbmV3QlBNLFxuICAvLyAgIHBsYXliYWNrU3BlZWQgPSBuZXdQbGF5YmFja1NwZWVkLFxuICAvLyB9ID0gc2V0dGluZ3Ncbn1cblxuZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZSh1cmwpIHtcbiAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIC8vIGZldGNoKHVybCwge1xuICAgIC8vICAgbW9kZTogJ25vLWNvcnMnXG4gICAgLy8gfSlcbiAgICAoMCwgX2lzb21vcnBoaWNGZXRjaDIuZGVmYXVsdCkodXJsKS50aGVuKF9mZXRjaF9oZWxwZXJzLnN0YXR1cykudGhlbihfZmV0Y2hfaGVscGVycy5hcnJheUJ1ZmZlcikudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgcmVzb2x2ZShzb25nRnJvbU1JRElGaWxlU3luYyhkYXRhLCBzZXR0aW5ncykpO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICByZWplY3QoZSk7XG4gICAgfSk7XG4gIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuVHJhY2sgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcGFydCA9IHJlcXVpcmUoJy4vcGFydCcpO1xuXG52YXIgX21pZGlfZXZlbnQgPSByZXF1aXJlKCcuL21pZGlfZXZlbnQnKTtcblxudmFyIF9taWRpX25vdGUgPSByZXF1aXJlKCcuL21pZGlfbm90ZScpO1xuXG52YXIgX2luaXRfbWlkaSA9IHJlcXVpcmUoJy4vaW5pdF9taWRpJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX2luaXRfYXVkaW8gPSByZXF1aXJlKCcuL2luaXRfYXVkaW8nKTtcblxudmFyIF9xYW1iaSA9IHJlcXVpcmUoJy4vcWFtYmknKTtcblxudmFyIF9ldmVudGxpc3RlbmVyID0gcmVxdWlyZSgnLi9ldmVudGxpc3RlbmVyJyk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgemVyb1ZhbHVlID0gMC4wMDAwMDAwMDAwMDAwMDAwMTtcbnZhciBpbnN0YW5jZUluZGV4ID0gMDtcblxudmFyIFRyYWNrID0gZXhwb3J0cy5UcmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gVHJhY2soKSB7XG4gICAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFjayk7XG5cbiAgICB0aGlzLmlkID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgJ18nICsgaW5zdGFuY2VJbmRleCsrICsgJ18nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMubmFtZSwgdGhpcy5jaGFubmVsLCB0aGlzLm11dGVkLCB0aGlzLnZvbHVtZSlcblxuICAgIHZhciBfc2V0dGluZ3MkbmFtZSA9IHNldHRpbmdzLm5hbWU7XG4gICAgdGhpcy5uYW1lID0gX3NldHRpbmdzJG5hbWUgPT09IHVuZGVmaW5lZCA/IHRoaXMuaWQgOiBfc2V0dGluZ3MkbmFtZTtcbiAgICB2YXIgX3NldHRpbmdzJGNoYW5uZWwgPSBzZXR0aW5ncy5jaGFubmVsO1xuICAgIHRoaXMuY2hhbm5lbCA9IF9zZXR0aW5ncyRjaGFubmVsID09PSB1bmRlZmluZWQgPyAwIDogX3NldHRpbmdzJGNoYW5uZWw7XG4gICAgdmFyIF9zZXR0aW5ncyRtdXRlZCA9IHNldHRpbmdzLm11dGVkO1xuICAgIHRoaXMubXV0ZWQgPSBfc2V0dGluZ3MkbXV0ZWQgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX3NldHRpbmdzJG11dGVkO1xuICAgIHZhciBfc2V0dGluZ3Mkdm9sdW1lID0gc2V0dGluZ3Mudm9sdW1lO1xuICAgIHRoaXMudm9sdW1lID0gX3NldHRpbmdzJHZvbHVtZSA9PT0gdW5kZWZpbmVkID8gMC41IDogX3NldHRpbmdzJHZvbHVtZTtcbiAgICB0aGlzLl9wYW5uZXIgPSBfaW5pdF9hdWRpby5jb250ZXh0LmNyZWF0ZVBhbm5lcigpO1xuICAgIHRoaXMuX3Bhbm5lci5wYW5uaW5nTW9kZWwgPSAnZXF1YWxwb3dlcic7XG4gICAgdGhpcy5fcGFubmVyLnNldFBvc2l0aW9uKHplcm9WYWx1ZSwgemVyb1ZhbHVlLCB6ZXJvVmFsdWUpO1xuICAgIHRoaXMuX2dhaW5Ob2RlID0gX2luaXRfYXVkaW8uY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lO1xuICAgIHRoaXMuX3Bhbm5lci5jb25uZWN0KHRoaXMuX2dhaW5Ob2RlKTtcbiAgICAvL3RoaXMuX2dhaW5Ob2RlLmNvbm5lY3QodGhpcy5fcGFubmVyKVxuICAgIHRoaXMuX21pZGlJbnB1dHMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fbWlkaU91dHB1dHMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fc29uZyA9IG51bGw7XG4gICAgdGhpcy5fcGFydHMgPSBbXTtcbiAgICB0aGlzLl9wYXJ0c0J5SWQgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZXZlbnRzID0gW107XG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZTtcbiAgICB0aGlzLl9pbnN0cnVtZW50ID0gbnVsbDtcbiAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3JlY29yZGVkRXZlbnRzID0gW107XG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdO1xuICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlO1xuICAgIHRoaXMubW9uaXRvciA9IGZhbHNlO1xuICAgIHRoaXMuX3NvbmdHYWluTm9kZSA9IG51bGw7XG4gICAgdGhpcy5fZWZmZWN0cyA9IFtdO1xuICAgIHRoaXMuX251bUVmZmVjdHMgPSAwO1xuXG4gICAgdmFyIHBhcnRzID0gc2V0dGluZ3MucGFydHMsXG4gICAgICAgIGluc3RydW1lbnQgPSBzZXR0aW5ncy5pbnN0cnVtZW50O1xuXG4gICAgaWYgKHR5cGVvZiBwYXJ0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuYWRkUGFydHMuYXBwbHkodGhpcywgX3RvQ29uc3VtYWJsZUFycmF5KHBhcnRzKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgaW5zdHJ1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoVHJhY2ssIFt7XG4gICAga2V5OiAnc2V0SW5zdHJ1bWVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEluc3RydW1lbnQoKSB7XG4gICAgICB2YXIgaW5zdHJ1bWVudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogbnVsbDtcblxuICAgICAgaWYgKGluc3RydW1lbnQgIT09IG51bGxcbiAgICAgIC8vIGNoZWNrIGlmIHRoZSBtYW5kYXRvcnkgZnVuY3Rpb25zIG9mIGFuIGluc3RydW1lbnQgYXJlIHByZXNlbnQgKEludGVyZmFjZSBJbnN0cnVtZW50KVxuICAgICAgJiYgdHlwZW9mIGluc3RydW1lbnQuY29ubmVjdCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgaW5zdHJ1bWVudC5kaXNjb25uZWN0ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGluc3RydW1lbnQuYWxsTm90ZXNPZmYgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGluc3RydW1lbnQudW5zY2hlZHVsZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnJlbW92ZUluc3RydW1lbnQoKTtcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudCA9IGluc3RydW1lbnQ7XG4gICAgICAgIHRoaXMuX2luc3RydW1lbnQuY29ubmVjdCh0aGlzLl9wYW5uZXIpO1xuICAgICAgfSBlbHNlIGlmIChpbnN0cnVtZW50ID09PSBudWxsKSB7XG4gICAgICAgIC8vIGlmIHlvdSBwYXNzIG51bGwgYXMgYXJndW1lbnQgdGhlIGN1cnJlbnQgaW5zdHJ1bWVudCB3aWxsIGJlIHJlbW92ZWQsIHNhbWUgYXMgcmVtb3ZlSW5zdHJ1bWVudFxuICAgICAgICB0aGlzLnJlbW92ZUluc3RydW1lbnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIGluc3RydW1lbnQsIGFuZCBpbnN0cnVtZW50IHNob3VsZCBoYXZlIHRoZSBtZXRob2RzIFwiY29ubmVjdFwiLCBcImRpc2Nvbm5lY3RcIiwgXCJwcm9jZXNzTUlESUV2ZW50XCIsIFwidW5zY2hlZHVsZVwiIGFuZCBcImFsbE5vdGVzT2ZmXCInKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVJbnN0cnVtZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlSW5zdHJ1bWVudCgpIHtcbiAgICAgIGlmICh0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKTtcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudC5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMuX2luc3RydW1lbnQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEluc3RydW1lbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJbnN0cnVtZW50KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2luc3RydW1lbnQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY29ubmVjdE1JRElPdXRwdXRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29ubmVjdE1JRElPdXRwdXRzKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIG91dHB1dHMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgb3V0cHV0c1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgLy9jb25zb2xlLmxvZyhvdXRwdXRzKVxuICAgICAgb3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChvdXRwdXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvdXRwdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgb3V0cHV0ID0gKDAsIF9pbml0X21pZGkuZ2V0TUlESU91dHB1dEJ5SWQpKG91dHB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG91dHB1dCBpbnN0YW5jZW9mIE1JRElPdXRwdXQpIHtcbiAgICAgICAgICBfdGhpcy5fbWlkaU91dHB1dHMuc2V0KG91dHB1dC5pZCwgb3V0cHV0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlPdXRwdXRzKVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Rpc2Nvbm5lY3RNSURJT3V0cHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc2Nvbm5lY3RNSURJT3V0cHV0cygpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIG91dHB1dHMgPSBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICBvdXRwdXRzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG5cbiAgICAgIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgICAgIGlmIChvdXRwdXRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5jbGVhcigpO1xuICAgICAgfVxuICAgICAgb3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgIGlmIChwb3J0IGluc3RhbmNlb2YgTUlESU91dHB1dCkge1xuICAgICAgICAgIHBvcnQgPSBwb3J0LmlkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfdGhpczIuX21pZGlPdXRwdXRzLmhhcyhwb3J0KSkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3JlbW92aW5nJywgdGhpcy5fbWlkaU91dHB1dHMuZ2V0KHBvcnQpLm5hbWUpXG4gICAgICAgICAgX3RoaXMyLl9taWRpT3V0cHV0cy5kZWxldGUocG9ydCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy90aGlzLl9taWRpT3V0cHV0cyA9IHRoaXMuX21pZGlPdXRwdXRzLmZpbHRlciguLi5vdXRwdXRzKVxuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpT3V0cHV0cylcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb25uZWN0TUlESUlucHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbm5lY3RNSURJSW5wdXRzKCkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW4zID0gYXJndW1lbnRzLmxlbmd0aCwgaW5wdXRzID0gQXJyYXkoX2xlbjMpLCBfa2V5MyA9IDA7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcbiAgICAgICAgaW5wdXRzW19rZXkzXSA9IGFyZ3VtZW50c1tfa2V5M107XG4gICAgICB9XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlucHV0ID0gKDAsIF9pbml0X21pZGkuZ2V0TUlESUlucHV0QnlJZCkoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIE1JRElJbnB1dCkge1xuXG4gICAgICAgICAgX3RoaXMzLl9taWRpSW5wdXRzLnNldChpbnB1dC5pZCwgaW5wdXQpO1xuXG4gICAgICAgICAgaW5wdXQub25taWRpbWVzc2FnZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMzLm1vbml0b3IgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyguLi5lLmRhdGEpXG4gICAgICAgICAgICAgIF90aGlzMy5fcHJlcHJvY2Vzc01JRElFdmVudChuZXcgKEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmFwcGx5KF9taWRpX2V2ZW50Lk1JRElFdmVudCwgW251bGxdLmNvbmNhdChbX3RoaXMzLl9zb25nLl90aWNrc10sIF90b0NvbnN1bWFibGVBcnJheShlLmRhdGEpKSkpKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICAgIH1cblxuICAgIC8vIHlvdSBjYW4gcGFzcyBib3RoIHBvcnQgYW5kIHBvcnQgaWRzXG5cbiAgfSwge1xuICAgIGtleTogJ2Rpc2Nvbm5lY3RNSURJSW5wdXRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzY29ubmVjdE1JRElJbnB1dHMoKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbjQgPSBhcmd1bWVudHMubGVuZ3RoLCBpbnB1dHMgPSBBcnJheShfbGVuNCksIF9rZXk0ID0gMDsgX2tleTQgPCBfbGVuNDsgX2tleTQrKykge1xuICAgICAgICBpbnB1dHNbX2tleTRdID0gYXJndW1lbnRzW19rZXk0XTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlucHV0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5fbWlkaUlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgICAgcG9ydC5vbm1pZGltZXNzYWdlID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuY2xlYXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgICAgaWYgKHBvcnQgaW5zdGFuY2VvZiBNSURJSW5wdXQpIHtcbiAgICAgICAgICBwb3J0ID0gcG9ydC5pZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3RoaXM0Ll9taWRpSW5wdXRzLmhhcyhwb3J0KSkge1xuICAgICAgICAgIF90aGlzNC5fbWlkaUlucHV0cy5nZXQocG9ydCkub25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgICAgICAgX3RoaXM0Ll9taWRpSW5wdXRzLmRlbGV0ZShwb3J0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvL3RoaXMuX21pZGlPdXRwdXRzID0gdGhpcy5fbWlkaU91dHB1dHMuZmlsdGVyKC4uLm91dHB1dHMpXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlJbnB1dHMpXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0TUlESUlucHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldE1JRElJbnB1dHMoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9taWRpSW5wdXRzLnZhbHVlcygpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRNSURJT3V0cHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldE1JRElPdXRwdXRzKCkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NldFJlY29yZEVuYWJsZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRSZWNvcmRFbmFibGVkKHR5cGUpIHtcbiAgICAgIC8vICdtaWRpJywgJ2F1ZGlvJywgZW1wdHkgb3IgYW55dGhpbmcgd2lsbCBkaXNhYmxlIHJlY29yZGluZ1xuICAgICAgdGhpcy5fcmVjb3JkRW5hYmxlZCA9IHR5cGU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX3N0YXJ0UmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3N0YXJ0UmVjb3JkaW5nKHJlY29yZElkKSB7XG4gICAgICBpZiAodGhpcy5fcmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2cocmVjb3JkSWQpXG4gICAgICAgIHRoaXMuX3JlY29yZElkID0gcmVjb3JkSWQ7XG4gICAgICAgIHRoaXMuX3JlY29yZGVkRXZlbnRzID0gW107XG4gICAgICAgIHRoaXMuX3JlY29yZFBhcnQgPSBuZXcgX3BhcnQuUGFydCh0aGlzLl9yZWNvcmRJZCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX3N0b3BSZWNvcmRpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfc3RvcFJlY29yZGluZyhyZWNvcmRJZCkge1xuICAgICAgdmFyIF9yZWNvcmRQYXJ0O1xuXG4gICAgICBpZiAodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9yZWNvcmRlZEV2ZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgKF9yZWNvcmRQYXJ0ID0gdGhpcy5fcmVjb3JkUGFydCkuYWRkRXZlbnRzLmFwcGx5KF9yZWNvcmRQYXJ0LCBfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fcmVjb3JkZWRFdmVudHMpKTtcbiAgICAgIC8vdGhpcy5fc29uZy5fbmV3RXZlbnRzLnB1c2goLi4udGhpcy5fcmVjb3JkZWRFdmVudHMpXG4gICAgICB0aGlzLmFkZFBhcnRzKHRoaXMuX3JlY29yZFBhcnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3VuZG9SZWNvcmRpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1bmRvUmVjb3JkaW5nKHJlY29yZElkKSB7XG4gICAgICBpZiAodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVtb3ZlUGFydHModGhpcy5fcmVjb3JkUGFydCk7XG4gICAgICAvL3RoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZWRvUmVjb3JkaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVkb1JlY29yZGluZyhyZWNvcmRJZCkge1xuICAgICAgaWYgKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmFkZFBhcnRzKHRoaXMuX3JlY29yZFBhcnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvcHknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb3B5KCkge1xuICAgICAgdmFyIHQgPSBuZXcgVHJhY2sodGhpcy5uYW1lICsgJ19jb3B5Jyk7IC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgICAgdGhpcy5fcGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICB2YXIgY29weSA9IHBhcnQuY29weSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhjb3B5KTtcbiAgICAgICAgcGFydHMucHVzaChjb3B5KTtcbiAgICAgIH0pO1xuICAgICAgdC5hZGRQYXJ0cy5hcHBseSh0LCBwYXJ0cyk7XG4gICAgICB0LnVwZGF0ZSgpO1xuICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndHJhbnNwb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdHJhbnNwb3NlKGFtb3VudCkge1xuICAgICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnRyYW5zcG9zZShhbW91bnQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWRkUGFydHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRQYXJ0cygpIHtcbiAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICB2YXIgc29uZyA9IHRoaXMuX3Nvbmc7XG5cbiAgICAgIGZvciAodmFyIF9sZW41ID0gYXJndW1lbnRzLmxlbmd0aCwgcGFydHMgPSBBcnJheShfbGVuNSksIF9rZXk1ID0gMDsgX2tleTUgPCBfbGVuNTsgX2tleTUrKykge1xuICAgICAgICBwYXJ0c1tfa2V5NV0gPSBhcmd1bWVudHNbX2tleTVdO1xuICAgICAgfVxuXG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHZhciBfZXZlbnRzO1xuXG4gICAgICAgIHBhcnQuX3RyYWNrID0gX3RoaXM1O1xuICAgICAgICBfdGhpczUuX3BhcnRzLnB1c2gocGFydCk7XG4gICAgICAgIF90aGlzNS5fcGFydHNCeUlkLnNldChwYXJ0LmlkLCBwYXJ0KTtcblxuICAgICAgICB2YXIgZXZlbnRzID0gcGFydC5fZXZlbnRzO1xuICAgICAgICAoX2V2ZW50cyA9IF90aGlzNS5fZXZlbnRzKS5wdXNoLmFwcGx5KF9ldmVudHMsIF90b0NvbnN1bWFibGVBcnJheShldmVudHMpKTtcblxuICAgICAgICBpZiAoc29uZykge1xuICAgICAgICAgIHZhciBfc29uZyRfbmV3RXZlbnRzO1xuXG4gICAgICAgICAgcGFydC5fc29uZyA9IHNvbmc7XG4gICAgICAgICAgc29uZy5fbmV3UGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgICAoX3NvbmckX25ld0V2ZW50cyA9IHNvbmcuX25ld0V2ZW50cykucHVzaC5hcHBseShfc29uZyRfbmV3RXZlbnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoZXZlbnRzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBldmVudC5fdHJhY2sgPSBfdGhpczU7XG4gICAgICAgICAgaWYgKHNvbmcpIHtcbiAgICAgICAgICAgIGV2ZW50Ll9zb25nID0gc29uZztcbiAgICAgICAgICB9XG4gICAgICAgICAgX3RoaXM1Ll9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZVBhcnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlUGFydHMoKSB7XG4gICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgdmFyIHNvbmcgPSB0aGlzLl9zb25nO1xuXG4gICAgICBmb3IgKHZhciBfbGVuNiA9IGFyZ3VtZW50cy5sZW5ndGgsIHBhcnRzID0gQXJyYXkoX2xlbjYpLCBfa2V5NiA9IDA7IF9rZXk2IDwgX2xlbjY7IF9rZXk2KyspIHtcbiAgICAgICAgcGFydHNbX2tleTZdID0gYXJndW1lbnRzW19rZXk2XTtcbiAgICAgIH1cblxuICAgICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBwYXJ0Ll90cmFjayA9IG51bGw7XG4gICAgICAgIF90aGlzNi5fcGFydHNCeUlkLmRlbGV0ZShwYXJ0LmlkLCBwYXJ0KTtcblxuICAgICAgICB2YXIgZXZlbnRzID0gcGFydC5fZXZlbnRzO1xuXG4gICAgICAgIGlmIChzb25nKSB7XG4gICAgICAgICAgdmFyIF9zb25nJF9yZW1vdmVkRXZlbnRzO1xuXG4gICAgICAgICAgc29uZy5fcmVtb3ZlZFBhcnRzLnB1c2gocGFydCk7XG4gICAgICAgICAgKF9zb25nJF9yZW1vdmVkRXZlbnRzID0gc29uZy5fcmVtb3ZlZEV2ZW50cykucHVzaC5hcHBseShfc29uZyRfcmVtb3ZlZEV2ZW50cywgX3RvQ29uc3VtYWJsZUFycmF5KGV2ZW50cykpO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbDtcbiAgICAgICAgICBpZiAoc29uZykge1xuICAgICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfdGhpczYuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBhcnRzKCkge1xuICAgICAgaWYgKHRoaXMuX25lZWRzVXBkYXRlKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpO1xuICAgICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fcGFydHMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd0cmFuc3Bvc2VQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRyYW5zcG9zZVBhcnRzKGFtb3VudCkge1xuICAgICAgZm9yICh2YXIgX2xlbjcgPSBhcmd1bWVudHMubGVuZ3RoLCBwYXJ0cyA9IEFycmF5KF9sZW43ID4gMSA/IF9sZW43IC0gMSA6IDApLCBfa2V5NyA9IDE7IF9rZXk3IDwgX2xlbjc7IF9rZXk3KyspIHtcbiAgICAgICAgcGFydHNbX2tleTcgLSAxXSA9IGFyZ3VtZW50c1tfa2V5N107XG4gICAgICB9XG5cbiAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgcGFydC50cmFuc3Bvc2UoYW1vdW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVQYXJ0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVQYXJ0cyh0aWNrcykge1xuICAgICAgZm9yICh2YXIgX2xlbjggPSBhcmd1bWVudHMubGVuZ3RoLCBwYXJ0cyA9IEFycmF5KF9sZW44ID4gMSA/IF9sZW44IC0gMSA6IDApLCBfa2V5OCA9IDE7IF9rZXk4IDwgX2xlbjg7IF9rZXk4KyspIHtcbiAgICAgICAgcGFydHNbX2tleTggLSAxXSA9IGFyZ3VtZW50c1tfa2V5OF07XG4gICAgICB9XG5cbiAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgcGFydC5tb3ZlKHRpY2tzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ21vdmVQYXJ0c1RvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZVBhcnRzVG8odGlja3MpIHtcbiAgICAgIGZvciAodmFyIF9sZW45ID0gYXJndW1lbnRzLmxlbmd0aCwgcGFydHMgPSBBcnJheShfbGVuOSA+IDEgPyBfbGVuOSAtIDEgOiAwKSwgX2tleTkgPSAxOyBfa2V5OSA8IF9sZW45OyBfa2V5OSsrKSB7XG4gICAgICAgIHBhcnRzW19rZXk5IC0gMV0gPSBhcmd1bWVudHNbX2tleTldO1xuICAgICAgfVxuXG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIHBhcnQubW92ZVRvKHRpY2tzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKlxuICAgICAgYWRkRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgICAgIGxldCBwID0gbmV3IFBhcnQoKVxuICAgICAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgICAgIHRoaXMuYWRkUGFydHMocClcbiAgICAgIH1cbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFdmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudHMoKSB7XG4gICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgdmFyIHBhcnRzID0gbmV3IFNldCgpO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMTAgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuMTApLCBfa2V5MTAgPSAwOyBfa2V5MTAgPCBfbGVuMTA7IF9rZXkxMCsrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5MTBdID0gYXJndW1lbnRzW19rZXkxMF07XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBwYXJ0cy5zZXQoZXZlbnQuX3BhcnQpO1xuICAgICAgICBldmVudC5fcGFydCA9IG51bGw7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGw7XG4gICAgICAgIGV2ZW50Ll9zb25nID0gbnVsbDtcbiAgICAgICAgX3RoaXM3Ll9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZCk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfcmVtb3ZlZEV2ZW50czIsIF9zb25nJF9jaGFuZ2VkUGFydHM7XG5cbiAgICAgICAgKF9zb25nJF9yZW1vdmVkRXZlbnRzMiA9IHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMpLnB1c2guYXBwbHkoX3NvbmckX3JlbW92ZWRFdmVudHMyLCBldmVudHMpO1xuICAgICAgICAoX3NvbmckX2NoYW5nZWRQYXJ0cyA9IHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cykucHVzaC5hcHBseShfc29uZyRfY2hhbmdlZFBhcnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdtb3ZlRXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZUV2ZW50cyh0aWNrcykge1xuICAgICAgdmFyIHBhcnRzID0gbmV3IFNldCgpO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMTEgPSBhcmd1bWVudHMubGVuZ3RoLCBldmVudHMgPSBBcnJheShfbGVuMTEgPiAxID8gX2xlbjExIC0gMSA6IDApLCBfa2V5MTEgPSAxOyBfa2V5MTEgPCBfbGVuMTE7IF9rZXkxMSsrKSB7XG4gICAgICAgIGV2ZW50c1tfa2V5MTEgLSAxXSA9IGFyZ3VtZW50c1tfa2V5MTFdO1xuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQubW92ZSh0aWNrcyk7XG4gICAgICAgIHBhcnRzLnNldChldmVudC5wYXJ0KTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMuX3NvbmcpIHtcbiAgICAgICAgdmFyIF9zb25nJF9tb3ZlZEV2ZW50cywgX3NvbmckX2NoYW5nZWRQYXJ0czI7XG5cbiAgICAgICAgKF9zb25nJF9tb3ZlZEV2ZW50cyA9IHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9tb3ZlZEV2ZW50cywgZXZlbnRzKTtcbiAgICAgICAgKF9zb25nJF9jaGFuZ2VkUGFydHMyID0gdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzKS5wdXNoLmFwcGx5KF9zb25nJF9jaGFuZ2VkUGFydHMyLCBfdG9Db25zdW1hYmxlQXJyYXkoQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKSk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbW92ZUV2ZW50c1RvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZUV2ZW50c1RvKHRpY2tzKSB7XG4gICAgICB2YXIgcGFydHMgPSBuZXcgU2V0KCk7XG5cbiAgICAgIGZvciAodmFyIF9sZW4xMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGV2ZW50cyA9IEFycmF5KF9sZW4xMiA+IDEgPyBfbGVuMTIgLSAxIDogMCksIF9rZXkxMiA9IDE7IF9rZXkxMiA8IF9sZW4xMjsgX2tleTEyKyspIHtcbiAgICAgICAgZXZlbnRzW19rZXkxMiAtIDFdID0gYXJndW1lbnRzW19rZXkxMl07XG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5tb3ZlVG8odGlja3MpO1xuICAgICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydCk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9zb25nKSB7XG4gICAgICAgIHZhciBfc29uZyRfbW92ZWRFdmVudHMyLCBfc29uZyRfY2hhbmdlZFBhcnRzMztcblxuICAgICAgICAoX3NvbmckX21vdmVkRXZlbnRzMiA9IHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzKS5wdXNoLmFwcGx5KF9zb25nJF9tb3ZlZEV2ZW50czIsIGV2ZW50cyk7XG4gICAgICAgIChfc29uZyRfY2hhbmdlZFBhcnRzMyA9IHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cykucHVzaC5hcHBseShfc29uZyRfY2hhbmdlZFBhcnRzMywgX3RvQ29uc3VtYWJsZUFycmF5KEFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSkpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldEV2ZW50cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV2ZW50cygpIHtcbiAgICAgIHZhciBmaWx0ZXIgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IG51bGw7XG4gICAgICAvLyBjYW4gYmUgdXNlIGFzIGZpbmRFdmVudHNcbiAgICAgIGlmICh0aGlzLl9uZWVkc1VwZGF0ZSkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5fZXZlbnRzKSk7IC8vQFRPRE8gaW1wbGVtZW50IGZpbHRlciAtPiBmaWx0ZXJFdmVudHMoKSBzaG91bGQgYmUgYSB1dGlsaXR5IGZ1bmN0aW9uIChub3QgYSBjbGFzcyBtZXRob2QpXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbXV0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG11dGUoKSB7XG4gICAgICB2YXIgZmxhZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogbnVsbDtcblxuICAgICAgaWYgKGZsYWcpIHtcbiAgICAgICAgdGhpcy5fbXV0ZWQgPSBmbGFnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbXV0ZWQgPSAhdGhpcy5fbXV0ZWQ7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndXBkYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgLy8geW91IHNob3VsZCBvbmx5IHVzZSB0aGlzIGluIGh1Z2Ugc29uZ3MgKD4xMDAgdHJhY2tzKVxuICAgICAgaWYgKHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKTtcbiAgICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgKDAsIF91dGlsLnNvcnRFdmVudHMpKHRoaXMuX2V2ZW50cyk7XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19jaGVja0VmZmVjdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9jaGVja0VmZmVjdChlZmZlY3QpIHtcbiAgICAgIGlmIChlZmZlY3QuaW5wdXQgaW5zdGFuY2VvZiBBdWRpb05vZGUgPT09IGZhbHNlIHx8IGVmZmVjdC5vdXRwdXQgaW5zdGFuY2VvZiBBdWRpb05vZGUgPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBIGNoYW5uZWwgZnggc2hvdWxkIGhhdmUgYW4gaW5wdXQgYW5kIGFuIG91dHB1dCBpbXBsZW1lbnRpbmcgdGhlIGludGVyZmFjZSBBdWRpb05vZGUnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gcm91dGluZzogYXVkaW9zb3VyY2UgLT4gcGFubmluZyAtPiB0cmFjayBvdXRwdXQgLT4gWy4uLmVmZmVjdF0gLT4gc29uZyBpbnB1dFxuXG4gIH0sIHtcbiAgICBrZXk6ICdpbnNlcnRFZmZlY3QnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbnNlcnRFZmZlY3QoZWZmZWN0KSB7XG5cbiAgICAgIGlmICh0aGlzLl9jaGVja0VmZmVjdChlZmZlY3QpID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBwcmV2RWZmZWN0ID0gdm9pZCAwO1xuXG4gICAgICBpZiAodGhpcy5fbnVtRWZmZWN0cyA9PT0gMCkge1xuICAgICAgICB0aGlzLl9nYWluTm9kZS5kaXNjb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICAgIHRoaXMuX2dhaW5Ob2RlLmNvbm5lY3QoZWZmZWN0LmlucHV0KTtcbiAgICAgICAgZWZmZWN0Lm91dHB1dC5jb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcmV2RWZmZWN0ID0gdGhpcy5fZWZmZWN0c1t0aGlzLl9udW1FZmZlY3RzIC0gMV07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcHJldkVmZmVjdC5vdXRwdXQuZGlzY29ubmVjdCh0aGlzLl9zb25nR2Fpbk5vZGUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy9DaHJvbWUgdGhyb3dzIGFuIGVycm9yIGhlcmUgd2hpY2ggaXMgd3JvbmdcbiAgICAgICAgfVxuICAgICAgICBwcmV2RWZmZWN0Lm91dHB1dC5jb25uZWN0KGVmZmVjdC5pbnB1dCk7XG4gICAgICAgIGVmZmVjdC5vdXRwdXQuY29ubmVjdCh0aGlzLl9zb25nR2Fpbk5vZGUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lZmZlY3RzLnB1c2goZWZmZWN0KTtcbiAgICAgIHRoaXMuX251bUVmZmVjdHMrKztcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdpbnNlcnRFZmZlY3RBdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluc2VydEVmZmVjdEF0KGVmZmVjdCwgaW5kZXgpIHtcbiAgICAgIGlmICh0aGlzLl9jaGVja0VmZmVjdChlZmZlY3QpID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgcHJldkVmZmVjdCA9IHRoaXMuX2VmZmVjdHNbaW5kZXggLSAxXTtcbiAgICAgIHZhciBuZXh0RWZmZWN0ID0gdm9pZCAwO1xuXG4gICAgICBpZiAoaW5kZXggPT09IHRoaXMuX251bUVmZmVjdHMpIHtcbiAgICAgICAgcHJldkVmZmVjdC5vdXRwdXQuZGlzY29ubmVjdCh0aGlzLl9zb25nR2Fpbk5vZGUpO1xuICAgICAgICBwcmV2RWZmZWN0Lm91dHB1dC5jb25uZWN0KGVmZmVjdC5pbnB1dCk7XG4gICAgICAgIGVmZmVjdC5pbnB1dC5jb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0RWZmZWN0ID0gdGhpcy5fZWZmZWN0c1tpbmRleF07XG4gICAgICAgIHByZXZFZmZlY3Qub3V0cHV0LmRpc2Nvbm5lY3QobmV4dEVmZmVjdC5pbnB1dCk7XG4gICAgICAgIHByZXZFZmZlY3Qub3V0cHV0LmNvbm5lY3QoZWZmZWN0LmlucHV0KTtcbiAgICAgICAgZWZmZWN0Lm91dHB1dC5jb25uZWN0KG5leHRFZmZlY3QuaW5wdXQpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZWZmZWN0cy5zcGxpY2UoaW5kZXgsIDAsIGVmZmVjdCk7XG4gICAgICB0aGlzLl9udW1FZmZlY3RzKys7XG4gICAgfVxuXG4gICAgLy9yZW1vdmVFZmZlY3QoZWZmZWN0OiBFZmZlY3Qpe1xuXG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFZmZlY3QnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFZmZlY3QoZWZmZWN0KSB7XG4gICAgICBpZiAodGhpcy5fY2hlY2tFZmZlY3QoZWZmZWN0KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgaSA9IHZvaWQgMDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLl9udW1FZmZlY3RzOyBpKyspIHtcbiAgICAgICAgdmFyIGZ4ID0gdGhpcy5fZWZmZWN0c1tpXTtcbiAgICAgICAgaWYgKGVmZmVjdCA9PT0gZngpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5yZW1vdmVFZmZlY3RBdChpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFZmZlY3RBdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUVmZmVjdEF0KGluZGV4KSB7XG4gICAgICBpZiAoaXNOYU4oaW5kZXgpIHx8IHRoaXMuX251bUVmZmVjdHMgPT09IDAgfHwgaW5kZXggPj0gdGhpcy5fbnVtRWZmZWN0cykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgZWZmZWN0ID0gdGhpcy5fZWZmZWN0c1tpbmRleF07XG4gICAgICB2YXIgbmV4dEVmZmVjdCA9IHZvaWQgMDtcbiAgICAgIHZhciBwcmV2RWZmZWN0ID0gdm9pZCAwO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKGluZGV4LCB0aGlzLl9lZmZlY3RzKVxuXG4gICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgLy8gd2UgcmVtb3ZlIHRoZSBmaXJzdCBlZmZlY3QsIHNvIGRpc2Nvbm5lY3QgZnJvbSBvdXRwdXQgb2YgdHJhY2tcbiAgICAgICAgdGhpcy5fZ2Fpbk5vZGUuZGlzY29ubmVjdChlZmZlY3QuaW5wdXQpO1xuXG4gICAgICAgIGlmICh0aGlzLl9udW1FZmZlY3RzID09PSAxKSB7XG4gICAgICAgICAgLy8gbm8gZWZmZWN0cyBhbnltb3JlLCBzbyBjb25uZWN0IG91dHB1dCBvZiB0cmFjayB0byBpbnB1dCBvZiB0aGUgc29uZ1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBlZmZlY3Qub3V0cHV0LmRpc2Nvbm5lY3QodGhpcy5fc29uZ0dhaW5Ob2RlKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvL0Nocm9tZSB0aHJvd3MgYW4gZXJyb3IgaGVyZSB3aGljaCBpcyB3cm9uZ1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9nYWluTm9kZS5jb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gZGlzY29ubmVjdCB0aGUgcmVtb3ZlZCBlZmZlY3QgZnJvbSB0aGUgbmV4dCBlZmZlY3QgaW4gdGhlIGNoYWluLCB0aGlzIGlzIG5vdyB0aGUgZmlyc3QgZWZmZWN0IGluIHRoZSBjaGFpbi4uLlxuICAgICAgICAgIG5leHRFZmZlY3QgPSB0aGlzLl9lZmZlY3RzW2luZGV4ICsgMV07XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGVmZmVjdC5vdXRwdXQuZGlzY29ubmVjdChuZXh0RWZmZWN0LmlucHV0KTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgIC8vQ2hyb21lIHRocm93cyBhbiBlcnJvciBoZXJlIHdoaWNoIGlzIHdyb25nXG5cbiAgICAgICAgICAvLyAuLi4gc28gY29ubmVjdCB0aGUgb3V0cHV0IG9mIHRoZSB0cmFjayB0byB0aGUgaW5wdXQgb2YgdGhpcyBlZmZlY3RcbiAgICAgICAgICB0aGlzLl9nYWluTm9kZS5jb25uZWN0KG5leHRFZmZlY3QuaW5wdXQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHByZXZFZmZlY3QgPSB0aGlzLl9lZmZlY3RzW2luZGV4IC0gMV07XG4gICAgICAgIC8vY29uc29sZS5sb2cocHJldkVmZmVjdClcbiAgICAgICAgLy8gZGlzY29ubmVjdCB0aGUgcmVtb3ZlZCBlZmZlY3QgZnJvbSB0aGUgcHJldmlvdXMgZWZmZWN0IGluIHRoZSBjaGFpblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHByZXZFZmZlY3Qub3V0cHV0LmRpc2Nvbm5lY3QoZWZmZWN0LmlucHV0KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vQ2hyb21lIHRocm93cyBhbiBlcnJvciBoZXJlIHdoaWNoIGlzIHdyb25nXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5kZXggPT09IHRoaXMuX251bUVmZmVjdHMgLSAxKSB7XG4gICAgICAgICAgLy8gd2UgcmVtb3ZlIHRoZSBsYXN0IGVmZmVjdCBpbiB0aGUgY2hhaW4sIHNvIGRpc2Nvbm5lY3QgZnJvbSB0aGUgaW5wdXQgb2YgdGhlIHNvbmdcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZWZmZWN0Lm91dHB1dC5kaXNjb25uZWN0KHRoaXMuX3NvbmdHYWluTm9kZSk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAvL0Nocm9tZSB0aHJvd3MgYW4gZXJyb3IgaGVyZSB3aGljaCBpcyB3cm9uZ1xuXG4gICAgICAgICAgLy8gdGhlIHByZXZpb3VzIGVmZmVjdCBpcyBub3cgdGhlIGxhc3QgZWZmZWN0IHRvIGNvbm5lY3QgaXQgdG8gdGhlIGlucHV0IG9mIHRoZSBzb25nXG4gICAgICAgICAgcHJldkVmZmVjdC5vdXRwdXQuY29ubmVjdCh0aGlzLl9zb25nR2Fpbk5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGRpc2Nvbm5lY3QgdGhlIGVmZmVjdCBmcm9tIHRoZSBuZXh0IGVmZmVjdCBpbiB0aGUgY2hhaW5cbiAgICAgICAgICBuZXh0RWZmZWN0ID0gdGhpcy5fZWZmZWN0c1tpbmRleF07XG4gICAgICAgICAgZWZmZWN0Lm91dHB1dC5kaXNjb25uZWN0KG5leHRFZmZlY3QuaW5wdXQpO1xuICAgICAgICAgIC8vIGNvbm5lY3QgdGhlIHByZXZpb3VzIGVmZmVjdCB0byB0aGUgbmV4dCBlZmZlY3RcbiAgICAgICAgICBwcmV2RWZmZWN0Lm91dHB1dC5jb25uZWN0KG5leHRFZmZlY3QuaW5wdXQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VmZmVjdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHRoaXMuX251bUVmZmVjdHMtLTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFZmZlY3RzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RWZmZWN0cygpIHtcbiAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuX2VmZmVjdHMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRFZmZlY3RBdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEVmZmVjdEF0KGluZGV4KSB7XG4gICAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2VmZmVjdHNbaW5kZXhdO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2dldE91dHB1dCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldE91dHB1dCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nYWluTm9kZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdnZXRJbnB1dCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldElucHV0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NvbmdHYWluTm9kZTtcbiAgICB9XG5cbiAgICAvLyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gYSBNSURJIGV2ZW50cyBpcyBzZW5kIGJ5IGFuIGV4dGVybmFsIG9yIG9uLXNjcmVlbiBrZXlib2FyZFxuXG4gIH0sIHtcbiAgICBrZXk6ICdfcHJlcHJvY2Vzc01JRElFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9wcmVwcm9jZXNzTUlESUV2ZW50KG1pZGlFdmVudCkge1xuICAgICAgdmFyIHRpbWUgPSBfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMDtcbiAgICAgIG1pZGlFdmVudC50aW1lID0gdGltZTtcbiAgICAgIG1pZGlFdmVudC50aW1lMiA9IDA7IC8vcGVyZm9ybWFuY2Uubm93KCkgLT4gcGFzc2luZyAwIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXMgcGVyZm9ybWFuY2Uubm93KCkgc28gd2UgY2hvb3NlIHRoZSBmb3JtZXJcbiAgICAgIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSB0aW1lO1xuICAgICAgdmFyIG5vdGUgPSB2b2lkIDA7XG5cbiAgICAgIGlmIChtaWRpRXZlbnQudHlwZSA9PT0gX3FhbWJpLk1JRElFdmVudFR5cGVzLk5PVEVfT04pIHtcbiAgICAgICAgbm90ZSA9IG5ldyBfbWlkaV9ub3RlLk1JRElOb3RlKG1pZGlFdmVudCk7XG4gICAgICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMuc2V0KG1pZGlFdmVudC5kYXRhMSwgbm90ZSk7XG4gICAgICAgICgwLCBfZXZlbnRsaXN0ZW5lci5kaXNwYXRjaEV2ZW50KSh7XG4gICAgICAgICAgdHlwZTogJ25vdGVPbicsXG4gICAgICAgICAgZGF0YTogbWlkaUV2ZW50XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChtaWRpRXZlbnQudHlwZSA9PT0gX3FhbWJpLk1JRElFdmVudFR5cGVzLk5PVEVfT0ZGKSB7XG4gICAgICAgIG5vdGUgPSB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmdldChtaWRpRXZlbnQuZGF0YTEpO1xuICAgICAgICBpZiAodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG5vdGUuYWRkTm90ZU9mZihtaWRpRXZlbnQpO1xuICAgICAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmRlbGV0ZShtaWRpRXZlbnQuZGF0YTEpO1xuICAgICAgICAoMCwgX2V2ZW50bGlzdGVuZXIuZGlzcGF0Y2hFdmVudCkoe1xuICAgICAgICAgIHR5cGU6ICdub3RlT2ZmJyxcbiAgICAgICAgICBkYXRhOiBtaWRpRXZlbnRcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9yZWNvcmRFbmFibGVkID09PSAnbWlkaScgJiYgdGhpcy5fc29uZy5yZWNvcmRpbmcgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5fcmVjb3JkZWRFdmVudHMucHVzaChtaWRpRXZlbnQpO1xuICAgICAgfVxuICAgICAgdGhpcy5wcm9jZXNzTUlESUV2ZW50KG1pZGlFdmVudCk7XG4gICAgfVxuXG4gICAgLy8gbWV0aG9kIGlzIGNhbGxlZCBieSBzY2hlZHVsZXIgZHVyaW5nIHBsYXliYWNrXG5cbiAgfSwge1xuICAgIGtleTogJ3Byb2Nlc3NNSURJRXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzTUlESUV2ZW50KGV2ZW50KSB7XG5cbiAgICAgIGlmICh0eXBlb2YgZXZlbnQudGltZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5fcHJlcHJvY2Vzc01JRElFdmVudChldmVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gc2VuZCB0byBqYXZhc2NyaXB0IGluc3RydW1lbnRcbiAgICAgIGlmICh0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5uYW1lLCBldmVudClcbiAgICAgICAgdGhpcy5faW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KGV2ZW50KTtcbiAgICAgIH1cblxuICAgICAgLy8gc2VuZCB0byBleHRlcm5hbCBoYXJkd2FyZSBvciBzb2Z0d2FyZSBpbnN0cnVtZW50XG4gICAgICB0aGlzLl9zZW5kVG9FeHRlcm5hbE1JRElPdXRwdXRzKGV2ZW50KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfc2VuZFRvRXh0ZXJuYWxNSURJT3V0cHV0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zZW5kVG9FeHRlcm5hbE1JRElPdXRwdXRzKGV2ZW50KSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnRpbWUsIGV2ZW50Lm1pbGxpcylcbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0aGlzLl9taWRpT3V0cHV0cy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgcG9ydCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgICAgaWYgKHBvcnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5kYXRhMiAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCBldmVudC50aW1lMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExXSwgZXZlbnQudGltZTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYoZXZlbnQudHlwZSA9PT0gMTI4IHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgICAgICAgLy8gICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMl0sIGV2ZW50LnRpbWUgKyBsYXRlbmN5KVxuICAgICAgICAgICAgLy8gfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTkyIHx8IGV2ZW50LnR5cGUgPT09IDIyNCl7XG4gICAgICAgICAgICAvLyAgIHBvcnQuc2VuZChbZXZlbnQudHlwZSwgZXZlbnQuZGF0YTFdLCBldmVudC50aW1lICsgbGF0ZW5jeSlcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3Vuc2NoZWR1bGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1bnNjaGVkdWxlKG1pZGlFdmVudCkge1xuXG4gICAgICBpZiAodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9pbnN0cnVtZW50LnVuc2NoZWR1bGUobWlkaUV2ZW50KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX21pZGlPdXRwdXRzLnNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobWlkaUV2ZW50LnR5cGUgPT09IDE0NCkge1xuICAgICAgICB2YXIgbWlkaU5vdGUgPSBtaWRpRXZlbnQubWlkaU5vdGU7XG4gICAgICAgIHZhciBub3RlT2ZmID0gbmV3IF9taWRpX2V2ZW50Lk1JRElFdmVudCgwLCAxMjgsIG1pZGlFdmVudC5kYXRhMSwgMCk7XG4gICAgICAgIG5vdGVPZmYubWlkaU5vdGVJZCA9IG1pZGlOb3RlLmlkO1xuICAgICAgICBub3RlT2ZmLnRpbWUgPSBfaW5pdF9hdWRpby5jb250ZXh0LmN1cnJlbnRUaW1lO1xuICAgICAgICB0aGlzLl9zZW5kVG9FeHRlcm5hbE1JRElPdXRwdXRzKG5vdGVPZmYsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FsbE5vdGVzT2ZmJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWxsTm90ZXNPZmYoKSB7XG4gICAgICBpZiAodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGxldCB0aW1lU3RhbXAgPSAoY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApICsgdGhpcy5sYXRlbmN5XG4gICAgICAvLyBmb3IobGV0IG91dHB1dCBvZiB0aGlzLl9taWRpT3V0cHV0cy52YWx1ZXMoKSl7XG4gICAgICAvLyAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgLy8gICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gICAgICAvLyB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2V0UGFubmluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFBhbm5pbmcodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA8IC0xIHx8IHZhbHVlID4gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnVHJhY2suc2V0UGFubmluZygpIGFjY2VwdHMgYSB2YWx1ZSBiZXR3ZWVuIC0xIChmdWxsIGxlZnQpIGFuZCAxIChmdWxsIHJpZ2h0KSwgeW91IGVudGVyZWQ6JywgdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgeCA9IHZhbHVlO1xuICAgICAgdmFyIHkgPSAwO1xuICAgICAgdmFyIHogPSAxIC0gTWF0aC5hYnMoeCk7XG5cbiAgICAgIHggPSB4ID09PSAwID8gemVyb1ZhbHVlIDogeDtcbiAgICAgIHkgPSB5ID09PSAwID8gemVyb1ZhbHVlIDogeTtcbiAgICAgIHogPSB6ID09PSAwID8gemVyb1ZhbHVlIDogejtcblxuICAgICAgdGhpcy5fcGFubmVyLnNldFBvc2l0aW9uKHgsIHksIHopO1xuICAgICAgdGhpcy5fcGFubmluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0UGFubmluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFBhbm5pbmcoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFubmluZ1ZhbHVlO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBUcmFjaztcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuZXhwb3J0cy5nZXROaWNlVGltZSA9IGdldE5pY2VUaW1lO1xuZXhwb3J0cy5iYXNlNjRUb0JpbmFyeSA9IGJhc2U2NFRvQmluYXJ5O1xuZXhwb3J0cy50eXBlU3RyaW5nID0gdHlwZVN0cmluZztcbmV4cG9ydHMuc29ydEV2ZW50cyA9IHNvcnRFdmVudHM7XG5leHBvcnRzLmNoZWNrSWZCYXNlNjQgPSBjaGVja0lmQmFzZTY0O1xuZXhwb3J0cy5nZXRFcXVhbFBvd2VyQ3VydmUgPSBnZXRFcXVhbFBvd2VyQ3VydmU7XG5leHBvcnRzLmNoZWNrTUlESU51bWJlciA9IGNoZWNrTUlESU51bWJlcjtcblxudmFyIF9pc29tb3JwaGljRmV0Y2ggPSByZXF1aXJlKCdpc29tb3JwaGljLWZldGNoJyk7XG5cbnZhciBfaXNvbW9ycGhpY0ZldGNoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzb21vcnBoaWNGZXRjaCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciBtUEkgPSBNYXRoLlBJLFxuICAgIG1Qb3cgPSBNYXRoLnBvdyxcbiAgICBtUm91bmQgPSBNYXRoLnJvdW5kLFxuICAgIG1GbG9vciA9IE1hdGguZmxvb3IsXG4gICAgbVJhbmRvbSA9IE1hdGgucmFuZG9tO1xuXG5mdW5jdGlvbiBnZXROaWNlVGltZShtaWxsaXMpIHtcbiAgdmFyIGggPSB2b2lkIDAsXG4gICAgICBtID0gdm9pZCAwLFxuICAgICAgcyA9IHZvaWQgMCxcbiAgICAgIG1zID0gdm9pZCAwLFxuICAgICAgc2Vjb25kcyA9IHZvaWQgMCxcbiAgICAgIHRpbWVBc1N0cmluZyA9ICcnO1xuXG4gIHNlY29uZHMgPSBtaWxsaXMgLyAxMDAwOyAvLyDihpIgbWlsbGlzIHRvIHNlY29uZHNcbiAgaCA9IG1GbG9vcihzZWNvbmRzIC8gKDYwICogNjApKTtcbiAgbSA9IG1GbG9vcihzZWNvbmRzICUgKDYwICogNjApIC8gNjApO1xuICBzID0gbUZsb29yKHNlY29uZHMgJSA2MCk7XG4gIG1zID0gbVJvdW5kKChzZWNvbmRzIC0gaCAqIDM2MDAgLSBtICogNjAgLSBzKSAqIDEwMDApO1xuXG4gIHRpbWVBc1N0cmluZyArPSBoICsgJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbSA8IDEwID8gJzAnICsgbSA6IG07XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBzIDwgMTAgPyAnMCcgKyBzIDogcztcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG1zID09PSAwID8gJzAwMCcgOiBtcyA8IDEwID8gJzAwJyArIG1zIDogbXMgPCAxMDAgPyAnMCcgKyBtcyA6IG1zO1xuXG4gIC8vY29uc29sZS5sb2coaCwgbSwgcywgbXMpO1xuICByZXR1cm4ge1xuICAgIGhvdXI6IGgsXG4gICAgbWludXRlOiBtLFxuICAgIHNlY29uZDogcyxcbiAgICBtaWxsaXNlY29uZDogbXMsXG4gICAgdGltZUFzU3RyaW5nOiB0aW1lQXNTdHJpbmcsXG4gICAgdGltZUFzQXJyYXk6IFtoLCBtLCBzLCBtc11cbiAgfTtcbn1cblxuLy8gYWRhcHRlZCB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9kYW5ndWVyL2Jsb2ctZXhhbXBsZXMvYmxvYi9tYXN0ZXIvanMvYmFzZTY0LWJpbmFyeS5qc1xuZnVuY3Rpb24gYmFzZTY0VG9CaW5hcnkoaW5wdXQpIHtcbiAgdmFyIGtleVN0ciA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPScsXG4gICAgICBieXRlcyA9IHZvaWQgMCxcbiAgICAgIHVhcnJheSA9IHZvaWQgMCxcbiAgICAgIGJ1ZmZlciA9IHZvaWQgMCxcbiAgICAgIGxrZXkxID0gdm9pZCAwLFxuICAgICAgbGtleTIgPSB2b2lkIDAsXG4gICAgICBjaHIxID0gdm9pZCAwLFxuICAgICAgY2hyMiA9IHZvaWQgMCxcbiAgICAgIGNocjMgPSB2b2lkIDAsXG4gICAgICBlbmMxID0gdm9pZCAwLFxuICAgICAgZW5jMiA9IHZvaWQgMCxcbiAgICAgIGVuYzMgPSB2b2lkIDAsXG4gICAgICBlbmM0ID0gdm9pZCAwLFxuICAgICAgaSA9IHZvaWQgMCxcbiAgICAgIGogPSAwO1xuXG4gIGJ5dGVzID0gTWF0aC5jZWlsKDMgKiBpbnB1dC5sZW5ndGggLyA0LjApO1xuICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXMpO1xuICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gIGxrZXkxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aCAtIDEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBpZiAobGtleTEgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuICBpZiAobGtleTIgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuXG4gIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csICcnKTtcblxuICBmb3IgKGkgPSAwOyBpIDwgYnl0ZXM7IGkgKz0gMykge1xuICAgIC8vZ2V0IHRoZSAzIG9jdGVjdHMgaW4gNCBhc2NpaSBjaGFyc1xuICAgIGVuYzEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMzID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzQgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cbiAgICBjaHIxID0gZW5jMSA8PCAyIHwgZW5jMiA+PiA0O1xuICAgIGNocjIgPSAoZW5jMiAmIDE1KSA8PCA0IHwgZW5jMyA+PiAyO1xuICAgIGNocjMgPSAoZW5jMyAmIDMpIDw8IDYgfCBlbmM0O1xuXG4gICAgdWFycmF5W2ldID0gY2hyMTtcbiAgICBpZiAoZW5jMyAhPSA2NCkgdWFycmF5W2kgKyAxXSA9IGNocjI7XG4gICAgaWYgKGVuYzQgIT0gNjQpIHVhcnJheVtpICsgMl0gPSBjaHIzO1xuICB9XG4gIC8vY29uc29sZS5sb2coYnVmZmVyKTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gdHlwZVN0cmluZyhvKSB7XG4gIGlmICgodHlwZW9mIG8gPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKG8pKSAhPSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB0eXBlb2YgbyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2Yobyk7XG4gIH1cblxuICBpZiAobyA9PT0gbnVsbCkge1xuICAgIHJldHVybiAnbnVsbCc7XG4gIH1cblxuICAvL29iamVjdCwgYXJyYXksIGZ1bmN0aW9uLCBkYXRlLCByZWdleHAsIHN0cmluZywgbnVtYmVyLCBib29sZWFuLCBlcnJvclxuICB2YXIgaW50ZXJuYWxDbGFzcyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5tYXRjaCgvXFxbb2JqZWN0XFxzKFxcdyspXFxdLylbMV07XG4gIHJldHVybiBpbnRlcm5hbENsYXNzLnRvTG93ZXJDYXNlKCk7XG59XG5cbmZ1bmN0aW9uIHNvcnRFdmVudHMoZXZlbnRzKSB7XG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKGEudGlja3MgPT09IGIudGlja3MpIHtcbiAgICAgIHZhciByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgaWYgKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KSB7XG4gICAgICAgIHIgPSAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3M7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjaGVja0lmQmFzZTY0KGRhdGEpIHtcbiAgdmFyIHBhc3NlZCA9IHRydWU7XG4gIHRyeSB7XG4gICAgYXRvYihkYXRhKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHBhc3NlZCA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBwYXNzZWQ7XG59XG5cbmZ1bmN0aW9uIGdldEVxdWFsUG93ZXJDdXJ2ZShudW1TdGVwcywgdHlwZSwgbWF4VmFsdWUpIHtcbiAgdmFyIGkgPSB2b2lkIDAsXG4gICAgICB2YWx1ZSA9IHZvaWQgMCxcbiAgICAgIHBlcmNlbnQgPSB2b2lkIDAsXG4gICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG51bVN0ZXBzKTtcblxuICBmb3IgKGkgPSAwOyBpIDwgbnVtU3RlcHM7IGkrKykge1xuICAgIHBlcmNlbnQgPSBpIC8gbnVtU3RlcHM7XG4gICAgaWYgKHR5cGUgPT09ICdmYWRlSW4nKSB7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKCgxLjAgLSBwZXJjZW50KSAqIDAuNSAqIG1QSSkgKiBtYXhWYWx1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdmYWRlT3V0Jykge1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcyhwZXJjZW50ICogMC41ICogTWF0aC5QSSkgKiBtYXhWYWx1ZTtcbiAgICB9XG4gICAgdmFsdWVzW2ldID0gdmFsdWU7XG4gICAgaWYgKGkgPT09IG51bVN0ZXBzIC0gMSkge1xuICAgICAgdmFsdWVzW2ldID0gdHlwZSA9PT0gJ2ZhZGVJbicgPyAxIDogMDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuZnVuY3Rpb24gY2hlY2tNSURJTnVtYmVyKHZhbHVlKSB7XG4gIC8vY29uc29sZS5sb2codmFsdWUpO1xuICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsdWUgPCAwIHx8IHZhbHVlID4gMTI3KSB7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEyNycpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8qXG4vL29sZCBzY2hvb2wgYWpheFxuXG5leHBvcnQgZnVuY3Rpb24gYWpheChjb25maWcpe1xuICBsZXRcbiAgICByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgbWV0aG9kID0gdHlwZW9mIGNvbmZpZy5tZXRob2QgPT09ICd1bmRlZmluZWQnID8gJ0dFVCcgOiBjb25maWcubWV0aG9kLFxuICAgIGZpbGVTaXplO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICByZWplY3QgPSByZWplY3QgfHwgZnVuY3Rpb24oKXt9O1xuICAgIHJlc29sdmUgPSByZXNvbHZlIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApe1xuICAgICAgICByZWplY3QocmVxdWVzdC5zdGF0dXMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgIGZpbGVTaXplID0gcmVxdWVzdC5yZXNwb25zZS5sZW5ndGg7XG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSwgZmlsZVNpemUpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICBjb25maWcub25FcnJvcihlKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgY29uZmlnLnVybCwgdHJ1ZSk7XG5cbiAgICBpZihjb25maWcub3ZlcnJpZGVNaW1lVHlwZSl7XG4gICAgICByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUpe1xuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKG1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcuZGF0YSl7XG4gICAgICByZXF1ZXN0LnNlbmQoY29uZmlnLmRhdGEpO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cbiovIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX21pZGlfYWNjZXNzID0gcmVxdWlyZSgnLi9taWRpL21pZGlfYWNjZXNzJyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC91dGlsJyk7XG5cbnZhciBfbWlkaV9pbnB1dCA9IHJlcXVpcmUoJy4vbWlkaS9taWRpX2lucHV0Jyk7XG5cbnZhciBfbWlkaV9vdXRwdXQgPSByZXF1aXJlKCcuL21pZGkvbWlkaV9vdXRwdXQnKTtcblxudmFyIF9taWRpbWVzc2FnZV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaS9taWRpbWVzc2FnZV9ldmVudCcpO1xuXG52YXIgbWlkaUFjY2VzcyA9IHZvaWQgMDtcblxudmFyIGluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICAgIGlmICghbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzKSB7XG4gICAgICAgIC8vIEFkZCBzb21lIGZ1bmN0aW9uYWxpdHkgdG8gb2xkZXIgYnJvd3NlcnNcbiAgICAgICAgKDAsIF91dGlsLnBvbHlmaWxsKSgpO1xuXG4gICAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIFNpbmdsZXRvbi1pc2gsIG5vIG5lZWQgdG8gY3JlYXRlIG11bHRpcGxlIGluc3RhbmNlcyBvZiBNSURJQWNjZXNzXG4gICAgICAgICAgICBpZiAobWlkaUFjY2VzcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWlkaUFjY2VzcyA9ICgwLCBfbWlkaV9hY2Nlc3MuY3JlYXRlTUlESUFjY2VzcykoKTtcbiAgICAgICAgICAgICAgICAvLyBBZGQgV2ViTUlESSBBUEkgZ2xvYmFsc1xuICAgICAgICAgICAgICAgIHZhciBzY29wZSA9ICgwLCBfdXRpbC5nZXRTY29wZSkoKTtcbiAgICAgICAgICAgICAgICBzY29wZS5NSURJSW5wdXQgPSBfbWlkaV9pbnB1dC5NSURJSW5wdXQ7XG4gICAgICAgICAgICAgICAgc2NvcGUuTUlESU91dHB1dCA9IF9taWRpX291dHB1dC5NSURJT3V0cHV0O1xuICAgICAgICAgICAgICAgIHNjb3BlLk1JRElNZXNzYWdlRXZlbnQgPSBfbWlkaW1lc3NhZ2VfZXZlbnQuTUlESU1lc3NhZ2VFdmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtaWRpQWNjZXNzO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5ub2RlanMgPT09IHRydWUpIHtcbiAgICAgICAgICAgIG5hdmlnYXRvci5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgTm9kZWpzIGFwcGxpY2F0aW9ucyB3ZSBuZWVkIHRvIGFkZCBhIG1ldGhvZCB0aGF0IGNsb3NlcyBhbGwgTUlESSBpbnB1dCBwb3J0cyxcbiAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgTm9kZWpzIHdpbGwgd2FpdCBmb3IgTUlESSBpbnB1dCBmb3JldmVyLlxuICAgICAgICAgICAgICAgICgwLCBfbWlkaV9hY2Nlc3MuY2xvc2VBbGxNSURJSW5wdXRzKSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmluaXQoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3JlYXRlcyBhIE1JRElBY2Nlc3MgaW5zdGFuY2U6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIENyZWF0ZXMgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0IGluc3RhbmNlcyBmb3IgdGhlIGluaXRpYWxseSBjb25uZWN0ZWQgTUlESSBkZXZpY2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBLZWVwcyB0cmFjayBvZiBuZXdseSBjb25uZWN0ZWQgZGV2aWNlcyBhbmQgY3JlYXRlcyB0aGUgbmVjZXNzYXJ5IGluc3RhbmNlcyBvZiBNSURJSW5wdXQgYW5kIE1JRElPdXRwdXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIEtlZXBzIHRyYWNrIG9mIGRpc2Nvbm5lY3RlZCBkZXZpY2VzIGFuZCByZW1vdmVzIHRoZW0gZnJvbSB0aGUgaW5wdXRzIGFuZC9vciBvdXRwdXRzIG1hcC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gQ3JlYXRlcyBhIHVuaXF1ZSBpZCBmb3IgZXZlcnkgZGV2aWNlIGFuZCBzdG9yZXMgdGhlc2UgaWRzIGJ5IHRoZSBuYW1lIG9mIHRoZSBkZXZpY2U6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvIHdoZW4gYSBkZXZpY2UgZ2V0cyBkaXNjb25uZWN0ZWQgYW5kIHJlY29ubmVjdGVkIGFnYWluLCBpdCB3aWxsIHN0aWxsIGhhdmUgdGhlIHNhbWUgaWQuIFRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXMgaW4gbGluZSB3aXRoIHRoZSBiZWhhdmlvciBvZiB0aGUgbmF0aXZlIE1JRElBY2Nlc3Mgb2JqZWN0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbmV4cG9ydHMuY3JlYXRlTUlESUFjY2VzcyA9IGNyZWF0ZU1JRElBY2Nlc3M7XG5leHBvcnRzLmRpc3BhdGNoRXZlbnQgPSBkaXNwYXRjaEV2ZW50O1xuZXhwb3J0cy5jbG9zZUFsbE1JRElJbnB1dHMgPSBjbG9zZUFsbE1JRElJbnB1dHM7XG5leHBvcnRzLmdldE1JRElEZXZpY2VJZCA9IGdldE1JRElEZXZpY2VJZDtcblxudmFyIF9taWRpX2lucHV0ID0gcmVxdWlyZSgnLi9taWRpX2lucHV0Jyk7XG5cbnZhciBfbWlkaV9pbnB1dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taWRpX2lucHV0KTtcblxudmFyIF9taWRpX291dHB1dCA9IHJlcXVpcmUoJy4vbWlkaV9vdXRwdXQnKTtcblxudmFyIF9taWRpX291dHB1dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taWRpX291dHB1dCk7XG5cbnZhciBfbWlkaWNvbm5lY3Rpb25fZXZlbnQgPSByZXF1aXJlKCcuL21pZGljb25uZWN0aW9uX2V2ZW50Jyk7XG5cbnZhciBfbWlkaWNvbm5lY3Rpb25fZXZlbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWlkaWNvbm5lY3Rpb25fZXZlbnQpO1xuXG52YXIgX2phenpfaW5zdGFuY2UgPSByZXF1aXJlKCcuLi91dGlsL2phenpfaW5zdGFuY2UnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi4vdXRpbC91dGlsJyk7XG5cbnZhciBfc3RvcmUgPSByZXF1aXJlKCcuLi91dGlsL3N0b3JlJyk7XG5cbnZhciBfc3RvcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3RvcmUpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgbWlkaUFjY2VzcyA9IHZvaWQgMDtcbnZhciBqYXp6SW5zdGFuY2UgPSB2b2lkIDA7XG52YXIgbWlkaUlucHV0cyA9IG5ldyBfc3RvcmUyLmRlZmF1bHQoKTtcbnZhciBtaWRpT3V0cHV0cyA9IG5ldyBfc3RvcmUyLmRlZmF1bHQoKTtcbnZhciBtaWRpSW5wdXRJZHMgPSBuZXcgX3N0b3JlMi5kZWZhdWx0KCk7XG52YXIgbWlkaU91dHB1dElkcyA9IG5ldyBfc3RvcmUyLmRlZmF1bHQoKTtcbnZhciBsaXN0ZW5lcnMgPSBuZXcgX3N0b3JlMi5kZWZhdWx0KCk7XG5cbnZhciBNSURJQWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE1JRElBY2Nlc3MobWlkaUlucHV0cywgbWlkaU91dHB1dHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1JRElBY2Nlc3MpO1xuXG4gICAgICAgIHRoaXMuc3lzZXhFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbnB1dHMgPSBtaWRpSW5wdXRzO1xuICAgICAgICB0aGlzLm91dHB1dHMgPSBtaWRpT3V0cHV0cztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTUlESUFjY2VzcywgW3tcbiAgICAgICAga2V5OiAnYWRkRXZlbnRMaXN0ZW5lcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE1JRElBY2Nlc3M7XG59KCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZU1JRElBY2Nlc3MoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtaWRpQWNjZXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVzb2x2ZShtaWRpQWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLmJyb3dzZXIgPT09ICdpZTknKSB7XG4gICAgICAgICAgICByZWplY3QoeyBtZXNzYWdlOiAnV2ViTUlESUFQSVNoaW0gc3VwcG9ydHMgSW50ZXJuZXQgRXhwbG9yZXIgMTAgYW5kIGFib3ZlLicgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAoMCwgX2phenpfaW5zdGFuY2UuY3JlYXRlSmF6ekluc3RhbmNlKShmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5zdGFuY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KHsgbWVzc2FnZTogJ05vIGFjY2VzcyB0byBNSURJIGRldmljZXM6IHlvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHRoZSBXZWJNSURJIEFQSSBhbmQgdGhlIEphenogcGx1Z2luIGlzIG5vdCBpbnN0YWxsZWQuJyB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGphenpJbnN0YW5jZSA9IGluc3RhbmNlO1xuXG4gICAgICAgICAgICBjcmVhdGVNSURJUG9ydHMoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNldHVwTGlzdGVuZXJzKCk7XG4gICAgICAgICAgICAgICAgbWlkaUFjY2VzcyA9IG5ldyBNSURJQWNjZXNzKG1pZGlJbnB1dHMsIG1pZGlPdXRwdXRzKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG1pZGlBY2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG4vLyBjcmVhdGUgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0IGluc3RhbmNlcyBmb3IgYWxsIGluaXRpYWxseSBjb25uZWN0ZWQgTUlESSBkZXZpY2VzXG5mdW5jdGlvbiBjcmVhdGVNSURJUG9ydHMoY2FsbGJhY2spIHtcbiAgICB2YXIgaW5wdXRzID0gamF6ekluc3RhbmNlLk1pZGlJbkxpc3QoKTtcbiAgICB2YXIgb3V0cHV0cyA9IGphenpJbnN0YW5jZS5NaWRpT3V0TGlzdCgpO1xuICAgIHZhciBudW1JbnB1dHMgPSBpbnB1dHMubGVuZ3RoO1xuICAgIHZhciBudW1PdXRwdXRzID0gb3V0cHV0cy5sZW5ndGg7XG5cbiAgICBsb29wQ3JlYXRlTUlESVBvcnQoMCwgbnVtSW5wdXRzLCAnaW5wdXQnLCBpbnB1dHMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbG9vcENyZWF0ZU1JRElQb3J0KDAsIG51bU91dHB1dHMsICdvdXRwdXQnLCBvdXRwdXRzLCBjYWxsYmFjayk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGxvb3BDcmVhdGVNSURJUG9ydChpbmRleCwgbWF4LCB0eXBlLCBsaXN0LCBjYWxsYmFjaykge1xuICAgIGlmIChpbmRleCA8IG1heCkge1xuICAgICAgICB2YXIgbmFtZSA9IGxpc3RbaW5kZXgrK107XG4gICAgICAgIGNyZWF0ZU1JRElQb3J0KHR5cGUsIG5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxvb3BDcmVhdGVNSURJUG9ydChpbmRleCwgbWF4LCB0eXBlLCBsaXN0LCBjYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVNSURJUG9ydCh0eXBlLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICgwLCBfamF6el9pbnN0YW5jZS5nZXRKYXp6SW5zdGFuY2UpKHR5cGUsIGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgICB2YXIgcG9ydCA9IHZvaWQgMDtcbiAgICAgICAgdmFyIGluZm8gPSBbbmFtZSwgJycsICcnXTtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdpbnB1dCcpIHtcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5TdXBwb3J0KCdNaWRpSW5JbmZvJykpIHtcbiAgICAgICAgICAgICAgICBpbmZvID0gaW5zdGFuY2UuTWlkaUluSW5mbyhuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvcnQgPSBuZXcgX21pZGlfaW5wdXQyLmRlZmF1bHQoaW5mbywgaW5zdGFuY2UpO1xuICAgICAgICAgICAgbWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ291dHB1dCcpIHtcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5TdXBwb3J0KCdNaWRpT3V0SW5mbycpKSB7XG4gICAgICAgICAgICAgICAgaW5mbyA9IGluc3RhbmNlLk1pZGlPdXRJbmZvKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9ydCA9IG5ldyBfbWlkaV9vdXRwdXQyLmRlZmF1bHQoaW5mbywgaW5zdGFuY2UpO1xuICAgICAgICAgICAgbWlkaU91dHB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKHBvcnQpO1xuICAgIH0pO1xufVxuXG4vLyBsb29rdXAgZnVuY3Rpb246IEphenogZ2l2ZXMgdXMgdGhlIG5hbWUgb2YgdGhlIGNvbm5lY3RlZC9kaXNjb25uZWN0ZWQgTUlESSBkZXZpY2VzIGJ1dCB3ZSBoYXZlIHN0b3JlZCB0aGVtIGJ5IGlkXG5mdW5jdGlvbiBnZXRQb3J0QnlOYW1lKHBvcnRzLCBuYW1lKSB7XG4gICAgdmFyIHBvcnQgPSB2b2lkIDA7XG4gICAgdmFyIHZhbHVlcyA9IHBvcnRzLnZhbHVlcygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHBvcnQgPSB2YWx1ZXNbaV07XG4gICAgICAgIGlmIChwb3J0Lm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwb3J0O1xufVxuXG4vLyBrZWVwIHRyYWNrIG9mIGNvbm5lY3RlZC9kaXNjb25uZWN0ZWQgTUlESSBkZXZpY2VzXG5mdW5jdGlvbiBzZXR1cExpc3RlbmVycygpIHtcbiAgICBqYXp6SW5zdGFuY2UuT25EaXNjb25uZWN0TWlkaUluKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHZhciBwb3J0ID0gZ2V0UG9ydEJ5TmFtZShtaWRpSW5wdXRzLCBuYW1lKTtcbiAgICAgICAgaWYgKHBvcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcG9ydC5zdGF0ZSA9ICdkaXNjb25uZWN0ZWQnO1xuICAgICAgICAgICAgcG9ydC5jbG9zZSgpO1xuICAgICAgICAgICAgcG9ydC5famF6ekluc3RhbmNlLmlucHV0SW5Vc2UgPSBmYWxzZTtcbiAgICAgICAgICAgIG1pZGlJbnB1dHMuZGVsZXRlKHBvcnQuaWQpO1xuICAgICAgICAgICAgZGlzcGF0Y2hFdmVudChwb3J0KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgamF6ekluc3RhbmNlLk9uRGlzY29ubmVjdE1pZGlPdXQoZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIHBvcnQgPSBnZXRQb3J0QnlOYW1lKG1pZGlPdXRwdXRzLCBuYW1lKTtcbiAgICAgICAgaWYgKHBvcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcG9ydC5zdGF0ZSA9ICdkaXNjb25uZWN0ZWQnO1xuICAgICAgICAgICAgcG9ydC5jbG9zZSgpO1xuICAgICAgICAgICAgcG9ydC5famF6ekluc3RhbmNlLm91dHB1dEluVXNlID0gZmFsc2U7XG4gICAgICAgICAgICBtaWRpT3V0cHV0cy5kZWxldGUocG9ydC5pZCk7XG4gICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHBvcnQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBqYXp6SW5zdGFuY2UuT25Db25uZWN0TWlkaUluKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGNyZWF0ZU1JRElQb3J0KCdpbnB1dCcsIG5hbWUsIGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHBvcnQpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGphenpJbnN0YW5jZS5PbkNvbm5lY3RNaWRpT3V0KGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGNyZWF0ZU1JRElQb3J0KCdvdXRwdXQnLCBuYW1lLCBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgICAgICAgZGlzcGF0Y2hFdmVudChwb3J0KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbi8vIHdoZW4gYSBkZXZpY2UgZ2V0cyBjb25uZWN0ZWQvZGlzY29ubmVjdGVkIGJvdGggdGhlIHBvcnQgYW5kIE1JRElBY2Nlc3MgZGlzcGF0Y2ggYSBNSURJQ29ubmVjdGlvbkV2ZW50XG4vLyB0aGVyZWZvciB3ZSBjYWxsIHRoZSBwb3J0cyBkaXNwYXRjaEV2ZW50IGZ1bmN0aW9uIGhlcmUgYXMgd2VsbFxuZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChwb3J0KSB7XG4gICAgcG9ydC5kaXNwYXRjaEV2ZW50KG5ldyBfbWlkaWNvbm5lY3Rpb25fZXZlbnQyLmRlZmF1bHQocG9ydCwgcG9ydCkpO1xuXG4gICAgdmFyIGV2dCA9IG5ldyBfbWlkaWNvbm5lY3Rpb25fZXZlbnQyLmRlZmF1bHQobWlkaUFjY2VzcywgcG9ydCk7XG5cbiAgICBpZiAodHlwZW9mIG1pZGlBY2Nlc3Mub25zdGF0ZWNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtaWRpQWNjZXNzLm9uc3RhdGVjaGFuZ2UoZXZ0KTtcbiAgICB9XG4gICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcihldnQpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjbG9zZUFsbE1JRElJbnB1dHMoKSB7XG4gICAgbWlkaUlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAvLyBpbnB1dC5jbG9zZSgpO1xuICAgICAgICBpbnB1dC5famF6ekluc3RhbmNlLk1pZGlJbkNsb3NlKCk7XG4gICAgfSk7XG59XG5cbi8vIGNoZWNrIGlmIHdlIGhhdmUgYWxyZWFkeSBjcmVhdGVkIGEgdW5pcXVlIGlkIGZvciB0aGlzIGRldmljZSwgaWYgc286IHJldXNlIGl0LCBpZiBub3Q6IGNyZWF0ZSBhIG5ldyBpZCBhbmQgc3RvcmUgaXRcbmZ1bmN0aW9uIGdldE1JRElEZXZpY2VJZChuYW1lLCB0eXBlKSB7XG4gICAgdmFyIGlkID0gdm9pZCAwO1xuICAgIGlmICh0eXBlID09PSAnaW5wdXQnKSB7XG4gICAgICAgIGlkID0gbWlkaUlucHV0SWRzLmdldChuYW1lKTtcbiAgICAgICAgaWYgKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlkID0gKDAsIF91dGlsLmdlbmVyYXRlVVVJRCkoKTtcbiAgICAgICAgICAgIG1pZGlJbnB1dElkcy5zZXQobmFtZSwgaWQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnb3V0cHV0Jykge1xuICAgICAgICBpZCA9IG1pZGlPdXRwdXRJZHMuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWQgPSAoMCwgX3V0aWwuZ2VuZXJhdGVVVUlEKSgpO1xuICAgICAgICAgICAgbWlkaU91dHB1dElkcy5zZXQobmFtZSwgaWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpZDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1pZGlfYWNjZXNzLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlESUlucHV0IGlzIGEgd3JhcHBlciBhcm91bmQgYW4gaW5wdXQgb2YgYSBKYXp6IGluc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxudmFyIF9taWRpbWVzc2FnZV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaW1lc3NhZ2VfZXZlbnQnKTtcblxudmFyIF9taWRpbWVzc2FnZV9ldmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taWRpbWVzc2FnZV9ldmVudCk7XG5cbnZhciBfbWlkaWNvbm5lY3Rpb25fZXZlbnQgPSByZXF1aXJlKCcuL21pZGljb25uZWN0aW9uX2V2ZW50Jyk7XG5cbnZhciBfbWlkaWNvbm5lY3Rpb25fZXZlbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWlkaWNvbm5lY3Rpb25fZXZlbnQpO1xuXG52YXIgX21pZGlfYWNjZXNzID0gcmVxdWlyZSgnLi9taWRpX2FjY2VzcycpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuLi91dGlsL3V0aWwnKTtcblxudmFyIF9zdG9yZSA9IHJlcXVpcmUoJy4uL3V0aWwvc3RvcmUnKTtcblxudmFyIF9zdG9yZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zdG9yZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBtaWRpUHJvYyA9IHZvaWQgMDtcbnZhciBub2RlanMgPSAoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLm5vZGVqcztcblxudmFyIE1JRElJbnB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNSURJSW5wdXQoaW5mbywgaW5zdGFuY2UpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1JRElJbnB1dCk7XG5cbiAgICAgICAgdGhpcy5pZCA9ICgwLCBfbWlkaV9hY2Nlc3MuZ2V0TUlESURldmljZUlkKShpbmZvWzBdLCAnaW5wdXQnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gaW5mb1swXTtcbiAgICAgICAgdGhpcy5tYW51ZmFjdHVyZXIgPSBpbmZvWzFdO1xuICAgICAgICB0aGlzLnZlcnNpb24gPSBpbmZvWzJdO1xuICAgICAgICB0aGlzLnR5cGUgPSAnaW5wdXQnO1xuICAgICAgICB0aGlzLnN0YXRlID0gJ2Nvbm5lY3RlZCc7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdwZW5kaW5nJztcblxuICAgICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlID0gbnVsbDtcbiAgICAgICAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGltcGxpY2l0bHkgb3BlbiB0aGUgZGV2aWNlIHdoZW4gYW4gb25taWRpbWVzc2FnZSBoYW5kbGVyIGdldHMgYWRkZWRcbiAgICAgICAgLy8gd2UgZGVmaW5lIGEgc2V0dGVyIHRoYXQgb3BlbnMgdGhlIGRldmljZSBpZiB0aGUgc2V0IHZhbHVlIGlzIGEgZnVuY3Rpb25cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdvbm1pZGltZXNzYWdlJywge1xuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IG5ldyBfc3RvcmUyLmRlZmF1bHQoKS5zZXQoJ21pZGltZXNzYWdlJywgbmV3IF9zdG9yZTIuZGVmYXVsdCgpKS5zZXQoJ3N0YXRlY2hhbmdlJywgbmV3IF9zdG9yZTIuZGVmYXVsdCgpKTtcbiAgICAgICAgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoKTtcblxuICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLmlucHV0SW5Vc2UgPSB0cnVlO1xuXG4gICAgICAgIC8vIG9uIExpbnV4IG9wZW5pbmcgYW5kIGNsb3NpbmcgSmF6eiBpbnN0YW5jZXMgY2F1c2VzIHRoZSBwbHVnaW4gdG8gY3Jhc2ggYSBsb3Qgc28gd2Ugb3BlblxuICAgICAgICAvLyB0aGUgZGV2aWNlIGhlcmUgYW5kIGRvbid0IGNsb3NlIGl0IHdoZW4gY2xvc2UoKSBpcyBjYWxsZWQsIHNlZSBiZWxvd1xuICAgICAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5wbGF0Zm9ybSA9PT0gJ2xpbnV4Jykge1xuICAgICAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlJbk9wZW4odGhpcy5uYW1lLCBtaWRpUHJvYy5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhNSURJSW5wdXQsIFt7XG4gICAgICAgIGtleTogJ2FkZEV2ZW50TGlzdGVuZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQodHlwZSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldCh0eXBlKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Rpc3BhdGNoRXZlbnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldnQpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGV2dC50eXBlKTtcbiAgICAgICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyKGV2dCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGV2dC50eXBlID09PSAnbWlkaW1lc3NhZ2UnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29ubWlkaW1lc3NhZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZShldnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZ0LnR5cGUgPT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbnN0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZShldnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb3BlbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ29wZW4nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaUluT3Blbih0aGlzLm5hbWUsIG1pZGlQcm9jLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ29wZW4nO1xuICAgICAgICAgICAgKDAsIF9taWRpX2FjY2Vzcy5kaXNwYXRjaEV2ZW50KSh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbG9zZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb24gPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaUluQ2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdjbG9zZWQnO1xuICAgICAgICAgICAgKDAsIF9taWRpX2FjY2Vzcy5kaXNwYXRjaEV2ZW50KSh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgICAgICAgICAgdGhpcy5fb25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmdldCgnbWlkaW1lc3NhZ2UnKS5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmdldCgnc3RhdGVjaGFuZ2UnKS5jbGVhcigpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdfYXBwZW5kVG9TeXNleEJ1ZmZlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBfYXBwZW5kVG9TeXNleEJ1ZmZlcihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgb2xkTGVuZ3RoID0gdGhpcy5fc3lzZXhCdWZmZXIubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIHRtcEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG9sZExlbmd0aCArIGRhdGEubGVuZ3RoKTtcbiAgICAgICAgICAgIHRtcEJ1ZmZlci5zZXQodGhpcy5fc3lzZXhCdWZmZXIpO1xuICAgICAgICAgICAgdG1wQnVmZmVyLnNldChkYXRhLCBvbGRMZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5fc3lzZXhCdWZmZXIgPSB0bXBCdWZmZXI7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ19idWZmZXJMb25nU3lzZXgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gX2J1ZmZlckxvbmdTeXNleChkYXRhLCBpbml0aWFsT2Zmc2V0KSB7XG4gICAgICAgICAgICB2YXIgaiA9IGluaXRpYWxPZmZzZXQ7XG4gICAgICAgICAgICB3aGlsZSAoaiA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbal0gPT0gMHhGNykge1xuICAgICAgICAgICAgICAgICAgICAvLyBlbmQgb2Ygc3lzZXghXG4gICAgICAgICAgICAgICAgICAgIGogKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXBwZW5kVG9TeXNleEJ1ZmZlcihkYXRhLnNsaWNlKGluaXRpYWxPZmZzZXQsIGopKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGo7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGogKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGRpZG4ndCByZWFjaCB0aGUgZW5kOyBqdXN0IHRhY2sgaXQgb24uXG4gICAgICAgICAgICB0aGlzLl9hcHBlbmRUb1N5c2V4QnVmZmVyKGRhdGEuc2xpY2UoaW5pdGlhbE9mZnNldCwgaikpO1xuICAgICAgICAgICAgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBqO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE1JRElJbnB1dDtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTUlESUlucHV0O1xuXG5cbm1pZGlQcm9jID0gZnVuY3Rpb24gbWlkaVByb2ModGltZXN0YW1wLCBkYXRhKSB7XG4gICAgdmFyIGxlbmd0aCA9IDA7XG4gICAgdmFyIGkgPSB2b2lkIDA7XG4gICAgdmFyIGlzU3lzZXhNZXNzYWdlID0gZmFsc2U7XG5cbiAgICAvLyBKYXp6IHNvbWV0aW1lcyBwYXNzZXMgdXMgbXVsdGlwbGUgbWVzc2FnZXMgYXQgb25jZSwgc28gd2UgbmVlZCB0byBwYXJzZSB0aGVtIG91dCBhbmQgcGFzcyB0aGVtIG9uZSBhdCBhIHRpbWUuXG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkgKz0gbGVuZ3RoKSB7XG4gICAgICAgIHZhciBpc1ZhbGlkTWVzc2FnZSA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGkgPSB0aGlzLl9idWZmZXJMb25nU3lzZXgoZGF0YSwgaSk7XG4gICAgICAgICAgICBpZiAoZGF0YVtpIC0gMV0gIT0gMHhmNykge1xuICAgICAgICAgICAgICAgIC8vIHJhbiBvZmYgdGhlIGVuZCB3aXRob3V0IGhpdHRpbmcgdGhlIGVuZCBvZiB0aGUgc3lzZXggbWVzc2FnZVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlzU3lzZXhNZXNzYWdlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlzU3lzZXhNZXNzYWdlID0gZmFsc2U7XG4gICAgICAgICAgICBzd2l0Y2ggKGRhdGFbaV0gJiAweEYwKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAweDAwOlxuICAgICAgICAgICAgICAgICAgICAvLyBDaGV3IHVwIHNwdXJpb3VzIDB4MDAgYnl0ZXMuICBGaXhlcyBhIFdpbmRvd3MgcHJvYmxlbS5cbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gMTtcbiAgICAgICAgICAgICAgICAgICAgaXNWYWxpZE1lc3NhZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIDB4ODA6IC8vIG5vdGUgb2ZmXG4gICAgICAgICAgICAgICAgY2FzZSAweDkwOiAvLyBub3RlIG9uXG4gICAgICAgICAgICAgICAgY2FzZSAweEEwOiAvLyBwb2x5cGhvbmljIGFmdGVydG91Y2hcbiAgICAgICAgICAgICAgICBjYXNlIDB4QjA6IC8vIGNvbnRyb2wgY2hhbmdlXG4gICAgICAgICAgICAgICAgY2FzZSAweEUwOlxuICAgICAgICAgICAgICAgICAgICAvLyBjaGFubmVsIG1vZGVcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gMztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIDB4QzA6IC8vIHByb2dyYW0gY2hhbmdlXG4gICAgICAgICAgICAgICAgY2FzZSAweEQwOlxuICAgICAgICAgICAgICAgICAgICAvLyBjaGFubmVsIGFmdGVydG91Y2hcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIDB4RjA6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZGF0YVtpXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAweGYwOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldGlhYmxlLWxlbmd0aCBzeXNleC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpID0gdGhpcy5fYnVmZmVyTG9uZ1N5c2V4KGRhdGEsIGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhW2kgLSAxXSAhPSAweGY3KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJhbiBvZmYgdGhlIGVuZCB3aXRob3V0IGhpdHRpbmcgdGhlIGVuZCBvZiB0aGUgc3lzZXggbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3lzZXhNZXNzYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAweEYxOiAvLyBNVEMgcXVhcnRlciBmcmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAweEYzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvbmcgc2VsZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAweEYyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvbmcgcG9zaXRpb24gcG9pbnRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aCA9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzVmFsaWRNZXNzYWdlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBldnQgPSB7fTtcbiAgICAgICAgZXZ0LnJlY2VpdmVkVGltZSA9IHBhcnNlRmxvYXQodGltZXN0YW1wLnRvU3RyaW5nKCkpICsgdGhpcy5famF6ekluc3RhbmNlLl9wZXJmVGltZVplcm87XG5cbiAgICAgICAgaWYgKGlzU3lzZXhNZXNzYWdlIHx8IHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSkge1xuICAgICAgICAgICAgZXZ0LmRhdGEgPSBuZXcgVWludDhBcnJheSh0aGlzLl9zeXNleEJ1ZmZlcik7XG4gICAgICAgICAgICB0aGlzLl9zeXNleEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KDApO1xuICAgICAgICAgICAgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldnQuZGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEuc2xpY2UoaSwgbGVuZ3RoICsgaSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vZGVqcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX29ubWlkaW1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlKGV2dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZSA9IG5ldyBfbWlkaW1lc3NhZ2VfZXZlbnQyLmRlZmF1bHQodGhpcywgZXZ0LmRhdGEsIGV2dC5yZWNlaXZlZFRpbWUpO1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1pZGlfaW5wdXQuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNSURJT3V0cHV0IGlzIGEgd3JhcHBlciBhcm91bmQgYW4gb3V0cHV0IG9mIGEgSmF6eiBpbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG5cblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi4vdXRpbC91dGlsJyk7XG5cbnZhciBfc3RvcmUgPSByZXF1aXJlKCcuLi91dGlsL3N0b3JlJyk7XG5cbnZhciBfc3RvcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3RvcmUpO1xuXG52YXIgX21pZGlfYWNjZXNzID0gcmVxdWlyZSgnLi9taWRpX2FjY2VzcycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTUlESU91dHB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNSURJT3V0cHV0KGluZm8sIGluc3RhbmNlKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJT3V0cHV0KTtcblxuICAgICAgICB0aGlzLmlkID0gKDAsIF9taWRpX2FjY2Vzcy5nZXRNSURJRGV2aWNlSWQpKGluZm9bMF0sICdvdXRwdXQnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gaW5mb1swXTtcbiAgICAgICAgdGhpcy5tYW51ZmFjdHVyZXIgPSBpbmZvWzFdO1xuICAgICAgICB0aGlzLnZlcnNpb24gPSBpbmZvWzJdO1xuICAgICAgICB0aGlzLnR5cGUgPSAnb3V0cHV0JztcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdjb25uZWN0ZWQnO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb24gPSAncGVuZGluZyc7XG4gICAgICAgIHRoaXMub25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IF9zdG9yZTIuZGVmYXVsdCgpO1xuICAgICAgICB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fc3lzZXhCdWZmZXIgPSBuZXcgVWludDhBcnJheSgpO1xuXG4gICAgICAgIHRoaXMuX2phenpJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2Uub3V0cHV0SW5Vc2UgPSB0cnVlO1xuICAgICAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5wbGF0Zm9ybSA9PT0gJ2xpbnV4Jykge1xuICAgICAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlPdXRPcGVuKHRoaXMubmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTUlESU91dHB1dCwgW3tcbiAgICAgICAga2V5OiAnb3BlbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ29wZW4nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaU91dE9wZW4odGhpcy5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdvcGVuJztcbiAgICAgICAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2xvc2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLnBsYXRmb3JtICE9PSAnbGludXgnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlPdXRDbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ2Nsb3NlZCc7XG4gICAgICAgICAgICAoMCwgX21pZGlfYWNjZXNzLmRpc3BhdGNoRXZlbnQpKHRoaXMpOyAvLyBkaXNwYXRjaCBNSURJQ29ubmVjdGlvbkV2ZW50IHZpYSBNSURJQWNjZXNzXG4gICAgICAgICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NlbmQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZChkYXRhLCB0aW1lc3RhbXApIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBkZWxheUJlZm9yZVNlbmQgPSAwO1xuXG4gICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICBkZWxheUJlZm9yZVNlbmQgPSBNYXRoLmZsb29yKHRpbWVzdGFtcCAtIHBlcmZvcm1hbmNlLm5vdygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVzdGFtcCAmJiBkZWxheUJlZm9yZVNlbmQgPiAxKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLl9qYXp6SW5zdGFuY2UuTWlkaU91dExvbmcoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSwgZGVsYXlCZWZvcmVTZW5kKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlPdXRMb25nKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NsZWFyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWRkRXZlbnRMaXN0ZW5lcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX2xpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW1vdmVFdmVudExpc3RlbmVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5fbGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGlzcGF0Y2hFdmVudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2dCkge1xuICAgICAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIoZXZ0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vbnN0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlKGV2dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gTUlESU91dHB1dDtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTUlESU91dHB1dDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1pZGlfb3V0cHV0LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTUlESUNvbm5lY3Rpb25FdmVudCA9IGZ1bmN0aW9uIE1JRElDb25uZWN0aW9uRXZlbnQobWlkaUFjY2VzcywgcG9ydCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJQ29ubmVjdGlvbkV2ZW50KTtcblxuICAgIHRoaXMuYnViYmxlcyA9IGZhbHNlO1xuICAgIHRoaXMuY2FuY2VsQnViYmxlID0gZmFsc2U7XG4gICAgdGhpcy5jYW5jZWxhYmxlID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbWlkaUFjY2VzcztcbiAgICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmV2ZW50UGhhc2UgPSAwO1xuICAgIHRoaXMucGF0aCA9IFtdO1xuICAgIHRoaXMucG9ydCA9IHBvcnQ7XG4gICAgdGhpcy5yZXR1cm5WYWx1ZSA9IHRydWU7XG4gICAgdGhpcy5zcmNFbGVtZW50ID0gbWlkaUFjY2VzcztcbiAgICB0aGlzLnRhcmdldCA9IG1pZGlBY2Nlc3M7XG4gICAgdGhpcy50aW1lU3RhbXAgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMudHlwZSA9ICdzdGF0ZWNoYW5nZSc7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSBNSURJQ29ubmVjdGlvbkV2ZW50O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWlkaWNvbm5lY3Rpb25fZXZlbnQuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBNSURJTWVzc2FnZUV2ZW50ID0gZnVuY3Rpb24gTUlESU1lc3NhZ2VFdmVudChwb3J0LCBkYXRhLCByZWNlaXZlZFRpbWUpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESU1lc3NhZ2VFdmVudCk7XG5cbiAgICB0aGlzLmJ1YmJsZXMgPSBmYWxzZTtcbiAgICB0aGlzLmNhbmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgIHRoaXMuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuY3VycmVudFRhcmdldCA9IHBvcnQ7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmV2ZW50UGhhc2UgPSAwO1xuICAgIHRoaXMucGF0aCA9IFtdO1xuICAgIHRoaXMucmVjZWl2ZWRUaW1lID0gcmVjZWl2ZWRUaW1lO1xuICAgIHRoaXMucmV0dXJuVmFsdWUgPSB0cnVlO1xuICAgIHRoaXMuc3JjRWxlbWVudCA9IHBvcnQ7XG4gICAgdGhpcy50YXJnZXQgPSBwb3J0O1xuICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnR5cGUgPSAnbWlkaW1lc3NhZ2UnO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gTUlESU1lc3NhZ2VFdmVudDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1pZGltZXNzYWdlX2V2ZW50LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5jcmVhdGVKYXp6SW5zdGFuY2UgPSBjcmVhdGVKYXp6SW5zdGFuY2U7XG5leHBvcnRzLmdldEphenpJbnN0YW5jZSA9IGdldEphenpJbnN0YW5jZTtcblxudmFyIF9zdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmUnKTtcblxudmFyIF9zdG9yZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zdG9yZSk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG4vKiBlc2xpbnQgbm8tdW5kZXJzY29yZS1kYW5nbGU6IDAgKi9cblxuLypcbiAgQ3JlYXRlcyBpbnN0YW5jZXMgb2YgdGhlIEphenogcGx1Z2luIGlmIG5lY2Vzc2FyeS4gSW5pdGlhbGx5IHRoZSBNSURJQWNjZXNzIGNyZWF0ZXMgb25lIG1haW4gSmF6eiBpbnN0YW5jZSB0aGF0IGlzIHVzZWRcbiAgdG8gcXVlcnkgYWxsIGluaXRpYWxseSBjb25uZWN0ZWQgZGV2aWNlcywgYW5kIHRvIHRyYWNrIHRoZSBkZXZpY2VzIHRoYXQgYXJlIGJlaW5nIGNvbm5lY3RlZCBvciBkaXNjb25uZWN0ZWQgYXQgcnVudGltZS5cblxuICBGb3IgZXZlcnkgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0IHRoYXQgaXMgY3JlYXRlZCwgTUlESUFjY2VzcyBxdWVyaWVzIHRoZSBnZXRKYXp6SW5zdGFuY2UoKSBtZXRob2QgZm9yIGEgSmF6eiBpbnN0YW5jZVxuICB0aGF0IHN0aWxsIGhhdmUgYW4gYXZhaWxhYmxlIGlucHV0IG9yIG91dHB1dC4gQmVjYXVzZSBKYXp6IG9ubHkgYWxsb3dzIG9uZSBpbnB1dCBhbmQgb25lIG91dHB1dCBwZXIgaW5zdGFuY2UsIHdlXG4gIG5lZWQgdG8gY3JlYXRlIG5ldyBpbnN0YW5jZXMgaWYgbW9yZSB0aGFuIG9uZSBNSURJIGlucHV0IG9yIG91dHB1dCBkZXZpY2UgZ2V0cyBjb25uZWN0ZWQuXG5cbiAgTm90ZSB0aGF0IGFuIGV4aXN0aW5nIEphenogaW5zdGFuY2UgZG9lc24ndCBnZXQgZGVsZXRlZCB3aGVuIGJvdGggaXRzIGlucHV0IGFuZCBvdXRwdXQgZGV2aWNlIGFyZSBkaXNjb25uZWN0ZWQ7IGluc3RlYWQgaXRcbiAgd2lsbCBiZSByZXVzZWQgaWYgYSBuZXcgZGV2aWNlIGdldHMgY29ubmVjdGVkLlxuKi9cblxudmFyIGphenpQbHVnaW5Jbml0VGltZSA9ICgwLCBfdXRpbC5nZXREZXZpY2UpKCkuYnJvd3NlciA9PT0gJ2ZpcmVmb3gnID8gMjAwIDogMTAwOyAvLyAyMDAgbXMgdGltZW91dCBmb3IgRmlyZWZveCB2LjU1XG5cbnZhciBqYXp6SW5zdGFuY2VOdW1iZXIgPSAwO1xudmFyIGphenpJbnN0YW5jZXMgPSBuZXcgX3N0b3JlMi5kZWZhdWx0KCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUphenpJbnN0YW5jZShjYWxsYmFjaykge1xuICAgIHZhciBpZCA9ICdqYXp6XycgKyBqYXp6SW5zdGFuY2VOdW1iZXIgKyAnXycgKyBEYXRlLm5vdygpO1xuICAgIGphenpJbnN0YW5jZU51bWJlciArPSAxO1xuICAgIHZhciBvYmpSZWYgPSB2b2lkIDA7XG4gICAgdmFyIGFjdGl2ZVggPSB2b2lkIDA7XG5cbiAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5ub2RlanMgPT09IHRydWUpIHtcbiAgICAgICAgLy8gamF6ek1pZGkgaXMgYWRkZWQgdG8gdGhlIGdsb2JhbCB2YXJpYWJsZSBuYXZpZ2F0b3IgaW4gdGhlIG5vZGUgZW52aXJvbm1lbnRcbiAgICAgICAgb2JqUmVmID0gbmV3IG5hdmlnYXRvci5qYXp6TWlkaS5NSURJKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLypcbiAgICAgICAgICAgIGdlbmVyYXRlIHRoaXMgaHRtbDpcbiAgICAgICAgICAgICA8b2JqZWN0IGlkPVwiSmF6ejFcIiBjbGFzc2lkPVwiQ0xTSUQ6MUFDRTE2MTgtMUM3RC00NTYxLUFFRTEtMzQ4NDJBQTg1RTkwXCIgY2xhc3M9XCJoaWRkZW5cIj5cbiAgICAgICAgICAgICAgICA8b2JqZWN0IGlkPVwiSmF6ejJcIiB0eXBlPVwiYXVkaW8veC1qYXp6XCIgY2xhc3M9XCJoaWRkZW5cIj5cbiAgICAgICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJ2aXNpYmlsaXR5OnZpc2libGU7XCI+VGhpcyBwYWdlIHJlcXVpcmVzIDxhIGhyZWY9aHR0cDovL2phenotc29mdC5uZXQ+SmF6ei1QbHVnaW48L2E+IC4uLjwvcD5cbiAgICAgICAgICAgICAgICA8L29iamVjdD5cbiAgICAgICAgICAgIDwvb2JqZWN0PlxuICAgICAgICAqL1xuXG4gICAgICAgIGFjdGl2ZVggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICAgICAgYWN0aXZlWC5pZCA9IGlkICsgJ2llJztcbiAgICAgICAgYWN0aXZlWC5jbGFzc2lkID0gJ0NMU0lEOjFBQ0UxNjE4LTFDN0QtNDU2MS1BRUUxLTM0ODQyQUE4NUU5MCc7XG5cbiAgICAgICAgb2JqUmVmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2JqZWN0Jyk7XG4gICAgICAgIG9ialJlZi5pZCA9IGlkO1xuICAgICAgICBvYmpSZWYudHlwZSA9ICdhdWRpby94LWphenonO1xuXG4gICAgICAgIGFjdGl2ZVguYXBwZW5kQ2hpbGQob2JqUmVmKTtcblxuICAgICAgICB2YXIgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgcC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnVGhpcyBwYWdlIHJlcXVpcmVzIHRoZSAnKSk7XG5cbiAgICAgICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGEuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0phenogcGx1Z2luJykpO1xuICAgICAgICBhLmhyZWYgPSAnaHR0cDovL2phenotc29mdC5uZXQvJztcblxuICAgICAgICBwLmFwcGVuZENoaWxkKGEpO1xuICAgICAgICBwLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcuJykpO1xuXG4gICAgICAgIG9ialJlZi5hcHBlbmRDaGlsZChwKTtcblxuICAgICAgICB2YXIgaW5zZXJ0aW9uUG9pbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnTUlESVBsdWdpbicpO1xuICAgICAgICBpZiAoIWluc2VydGlvblBvaW50KSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgaGlkZGVuIGVsZW1lbnRcbiAgICAgICAgICAgIGluc2VydGlvblBvaW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBpbnNlcnRpb25Qb2ludC5pZCA9ICdNSURJUGx1Z2luJztcbiAgICAgICAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgICAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLmxlZnQgPSAnLTk5OTlweCc7XG4gICAgICAgICAgICBpbnNlcnRpb25Qb2ludC5zdHlsZS50b3AgPSAnLTk5OTlweCc7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGluc2VydGlvblBvaW50KTtcbiAgICAgICAgfVxuICAgICAgICBpbnNlcnRpb25Qb2ludC5hcHBlbmRDaGlsZChhY3RpdmVYKTtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgaWYgKG9ialJlZi5pc0phenogPT09IHRydWUpIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gb2JqUmVmO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZVguaXNKYXp6ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IGFjdGl2ZVg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluc3RhbmNlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpbnN0YW5jZS5fcGVyZlRpbWVaZXJvID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICBqYXp6SW5zdGFuY2VzLnNldChqYXp6SW5zdGFuY2VOdW1iZXIsIGluc3RhbmNlKTtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayhpbnN0YW5jZSk7XG4gICAgfSwgamF6elBsdWdpbkluaXRUaW1lKTtcbn1cblxuZnVuY3Rpb24gZ2V0SmF6ekluc3RhbmNlKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGtleSA9IHR5cGUgPT09ICdpbnB1dCcgPyAnaW5wdXRJblVzZScgOiAnb3V0cHV0SW5Vc2UnO1xuICAgIHZhciBpbnN0YW5jZSA9IG51bGw7XG5cbiAgICB2YXIgdmFsdWVzID0gamF6ekluc3RhbmNlcy52YWx1ZXMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgaW5zdCA9IHZhbHVlc1tpXTtcbiAgICAgICAgaWYgKGluc3Rba2V5XSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSBpbnN0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICAgICAgY3JlYXRlSmF6ekluc3RhbmNlKGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayhpbnN0YW5jZSk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9amF6el9pbnN0YW5jZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vLyBlczUgaW1wbGVtZW50YXRpb24gb2YgYm90aCBNYXAgYW5kIFNldFxuXG52YXIgaWRJbmRleCA9IDA7XG5cbnZhciBTdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTdG9yZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFN0b3JlKTtcblxuICAgICAgICB0aGlzLnN0b3JlID0ge307XG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTdG9yZSwgW3tcbiAgICAgICAga2V5OiBcImFkZFwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkKG9iaikge1xuICAgICAgICAgICAgdmFyIGlkID0gXCJcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgaWRJbmRleDtcbiAgICAgICAgICAgIGlkSW5kZXggKz0gMTtcbiAgICAgICAgICAgIHRoaXMua2V5cy5wdXNoKGlkKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcmVbaWRdID0gb2JqO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwic2V0XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXQoaWQsIG9iaikge1xuICAgICAgICAgICAgdGhpcy5rZXlzLnB1c2goaWQpO1xuICAgICAgICAgICAgdGhpcy5zdG9yZVtpZF0gPSBvYmo7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImdldFwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0KGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdG9yZVtpZF07XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJoYXNcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhcyhpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMua2V5cy5pbmRleE9mKGlkKSAhPT0gLTE7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJkZWxldGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIF9kZWxldGUoaWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnN0b3JlW2lkXTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMua2V5cy5pbmRleE9mKGlkKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInZhbHVlc1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdmFsdWVzKCkge1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gW107XG4gICAgICAgICAgICB2YXIgbCA9IHRoaXMua2V5cy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5zdG9yZVt0aGlzLmtleXNbaV1dO1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudHM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJmb3JFYWNoXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JFYWNoKGNiKSB7XG4gICAgICAgICAgICB2YXIgbCA9IHRoaXMua2V5cy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5zdG9yZVt0aGlzLmtleXNbaV1dO1xuICAgICAgICAgICAgICAgIGNiKGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiY2xlYXJcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgICAgICAgdGhpcy5rZXlzID0gW107XG4gICAgICAgICAgICB0aGlzLnN0b3JlID0ge307XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU3RvcmU7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFN0b3JlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RvcmUuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdldFNjb3BlID0gZ2V0U2NvcGU7XG5leHBvcnRzLmdldERldmljZSA9IGdldERldmljZTtcbmV4cG9ydHMuZ2VuZXJhdGVVVUlEID0gZ2VuZXJhdGVVVUlEO1xuZXhwb3J0cy5wb2x5ZmlsbCA9IHBvbHlmaWxsO1xudmFyIFNjb3BlID0gdm9pZCAwO1xudmFyIGRldmljZSA9IG51bGw7XG5cbi8vIGNoZWNrIGlmIHdlIGFyZSBpbiBhIGJyb3dzZXIgb3IgaW4gTm9kZWpzXG5mdW5jdGlvbiBnZXRTY29wZSgpIHtcbiAgICBpZiAodHlwZW9mIFNjb3BlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gU2NvcGU7XG4gICAgfVxuICAgIFNjb3BlID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgU2NvcGUgPSB3aW5kb3c7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBTY29wZSA9IGdsb2JhbDtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coJ3Njb3BlJywgc2NvcGUpO1xuICAgIHJldHVybiBTY29wZTtcbn1cblxuLy8gY2hlY2sgb24gd2hhdCB0eXBlIG9mIGRldmljZSB3ZSBhcmUgcnVubmluZywgbm90ZSB0aGF0IGluIHRoaXMgY29udGV4dFxuLy8gYSBkZXZpY2UgaXMgYSBjb21wdXRlciBub3QgYSBNSURJIGRldmljZVxuZnVuY3Rpb24gZ2V0RGV2aWNlKCkge1xuICAgIHZhciBzY29wZSA9IGdldFNjb3BlKCk7XG4gICAgaWYgKGRldmljZSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGV2aWNlO1xuICAgIH1cblxuICAgIHZhciBwbGF0Zm9ybSA9ICd1bmRldGVjdGVkJztcbiAgICB2YXIgYnJvd3NlciA9ICd1bmRldGVjdGVkJztcblxuICAgIGlmIChzY29wZS5uYXZpZ2F0b3Iubm9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICBkZXZpY2UgPSB7XG4gICAgICAgICAgICBwbGF0Zm9ybTogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgICAgICAgICAgIG5vZGVqczogdHJ1ZSxcbiAgICAgICAgICAgIG1vYmlsZTogcGxhdGZvcm0gPT09ICdpb3MnIHx8IHBsYXRmb3JtID09PSAnYW5kcm9pZCdcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGRldmljZTtcbiAgICB9XG5cbiAgICB2YXIgdWEgPSBzY29wZS5uYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gICAgaWYgKHVhLm1hdGNoKC8oaVBhZHxpUGhvbmV8aVBvZCkvZykpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnaW9zJztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0FuZHJvaWQnKSAhPT0gLTEpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnYW5kcm9pZCc7XG4gICAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdMaW51eCcpICE9PSAtMSkge1xuICAgICAgICBwbGF0Zm9ybSA9ICdsaW51eCc7XG4gICAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdNYWNpbnRvc2gnKSAhPT0gLTEpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnb3N4JztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1dpbmRvd3MnKSAhPT0gLTEpIHtcbiAgICAgICAgcGxhdGZvcm0gPSAnd2luZG93cyc7XG4gICAgfVxuXG4gICAgaWYgKHVhLmluZGV4T2YoJ0Nocm9tZScpICE9PSAtMSkge1xuICAgICAgICAvLyBjaHJvbWUsIGNocm9taXVtIGFuZCBjYW5hcnlcbiAgICAgICAgYnJvd3NlciA9ICdjaHJvbWUnO1xuXG4gICAgICAgIGlmICh1YS5pbmRleE9mKCdPUFInKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyb3dzZXIgPSAnb3BlcmEnO1xuICAgICAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0Nocm9taXVtJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicm93c2VyID0gJ2Nocm9taXVtJztcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodWEuaW5kZXhPZignU2FmYXJpJykgIT09IC0xKSB7XG4gICAgICAgIGJyb3dzZXIgPSAnc2FmYXJpJztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSAhPT0gLTEpIHtcbiAgICAgICAgYnJvd3NlciA9ICdmaXJlZm94JztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1RyaWRlbnQnKSAhPT0gLTEpIHtcbiAgICAgICAgYnJvd3NlciA9ICdpZSc7XG4gICAgICAgIGlmICh1YS5pbmRleE9mKCdNU0lFIDknKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGJyb3dzZXIgPSAnaWU5JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwbGF0Zm9ybSA9PT0gJ2lvcycpIHtcbiAgICAgICAgaWYgKHVhLmluZGV4T2YoJ0NyaU9TJykgIT09IC0xKSB7XG4gICAgICAgICAgICBicm93c2VyID0gJ2Nocm9tZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXZpY2UgPSB7XG4gICAgICAgIHBsYXRmb3JtOiBwbGF0Zm9ybSxcbiAgICAgICAgYnJvd3NlcjogYnJvd3NlcixcbiAgICAgICAgbW9iaWxlOiBwbGF0Zm9ybSA9PT0gJ2lvcycgfHwgcGxhdGZvcm0gPT09ICdhbmRyb2lkJyxcbiAgICAgICAgbm9kZWpzOiBmYWxzZVxuICAgIH07XG4gICAgcmV0dXJuIGRldmljZTtcbn1cblxuLy8gcG9seWZpbGwgZm9yIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxudmFyIHBvbHlmaWxsUGVyZm9ybWFuY2UgPSBmdW5jdGlvbiBwb2x5ZmlsbFBlcmZvcm1hbmNlKCkge1xuICAgIHZhciBzY29wZSA9IGdldFNjb3BlKCk7XG4gICAgaWYgKHR5cGVvZiBzY29wZS5wZXJmb3JtYW5jZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc2NvcGUucGVyZm9ybWFuY2UgPSB7fTtcbiAgICB9XG4gICAgRGF0ZS5ub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBzY29wZS5wZXJmb3JtYW5jZS5ub3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBub3dPZmZzZXQgPSBEYXRlLm5vdygpO1xuICAgICAgICBpZiAodHlwZW9mIHNjb3BlLnBlcmZvcm1hbmNlLnRpbWluZyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHNjb3BlLnBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBub3dPZmZzZXQgPSBzY29wZS5wZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLnBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uIG5vdygpIHtcbiAgICAgICAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbm93T2Zmc2V0O1xuICAgICAgICB9O1xuICAgIH1cbn07XG5cbi8vIGdlbmVyYXRlcyBVVUlEIGZvciBNSURJIGRldmljZXNcbmZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgICB2YXIgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHZhciB1dWlkID0gbmV3IEFycmF5KDY0KS5qb2luKCd4Jyk7IC8vICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnO1xuICAgIHV1aWQgPSB1dWlkLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgdmFyIHIgPSAoZCArIE1hdGgucmFuZG9tKCkgKiAxNikgJSAxNiB8IDA7XG4gICAgICAgIGQgPSBNYXRoLmZsb29yKGQgLyAxNik7XG4gICAgICAgIHJldHVybiAoYyA9PT0gJ3gnID8gciA6IHIgJiAweDMgfCAweDgpLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICAgIH0pO1xuICAgIHJldHVybiB1dWlkO1xufVxuXG4vLyBhIHZlcnkgc2ltcGxlIGltcGxlbWVudGF0aW9uIG9mIGEgUHJvbWlzZSBmb3IgSW50ZXJuZXQgRXhwbG9yZXIgYW5kIE5vZGVqc1xudmFyIHBvbHlmaWxsUHJvbWlzZSA9IGZ1bmN0aW9uIHBvbHlmaWxsUHJvbWlzZSgpIHtcbiAgICB2YXIgc2NvcGUgPSBnZXRTY29wZSgpO1xuICAgIGlmICh0eXBlb2Ygc2NvcGUuUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzY29wZS5Qcm9taXNlID0gZnVuY3Rpb24gcHJvbWlzZShleGVjdXRvcikge1xuICAgICAgICAgICAgdGhpcy5leGVjdXRvciA9IGV4ZWN1dG9yO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLlByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiB0aGVuKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXNvbHZlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSA9IGZ1bmN0aW9uIHJlc29sdmUoKSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0ID0gZnVuY3Rpb24gcmVqZWN0KCkge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH07XG4gICAgfVxufTtcblxuZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gICAgdmFyIGQgPSBnZXREZXZpY2UoKTtcbiAgICAvLyBjb25zb2xlLmxvZyhkZXZpY2UpO1xuICAgIGlmIChkLmJyb3dzZXIgPT09ICdpZScgfHwgZC5ub2RlanMgPT09IHRydWUpIHtcbiAgICAgICAgcG9seWZpbGxQcm9taXNlKCk7XG4gICAgfVxuICAgIHBvbHlmaWxsUGVyZm9ybWFuY2UoKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWwuanMubWFwIiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlcikge1xuICAgIHZhciB2aWV3Q2xhc3NlcyA9IFtcbiAgICAgICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDY0QXJyYXldJ1xuICAgIF1cblxuICAgIHZhciBpc0RhdGFWaWV3ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbiAgICB9XG5cbiAgICB2YXIgaXNBcnJheUJ1ZmZlclZpZXcgPSBBcnJheUJ1ZmZlci5pc1ZpZXcgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHZpZXdDbGFzc2VzLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpID4gLTFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgICB0aGlzLmFwcGVuZChoZWFkZXJbMF0sIGhlYWRlclsxXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV1cbiAgICB0aGlzLm1hcFtuYW1lXSA9IG9sZFZhbHVlID8gb2xkVmFsdWUrJywnK3ZhbHVlIDogdmFsdWVcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IHRoaXMubWFwW25hbWVdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm1hcCkge1xuICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEFycmF5QnVmZmVyQXNUZXh0KGJ1Zikge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIHZhciBjaGFycyA9IG5ldyBBcnJheSh2aWV3Lmxlbmd0aClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pXG4gICAgfVxuICAgIHJldHVybiBjaGFycy5qb2luKCcnKVxuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyQ2xvbmUoYnVmKSB7XG4gICAgaWYgKGJ1Zi5zbGljZSkge1xuICAgICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zi5ieXRlTGVuZ3RoKVxuICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSlcbiAgICAgIHJldHVybiB2aWV3LmJ1ZmZlclxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIHN1cHBvcnQuYmxvYiAmJiBpc0RhdGFWaWV3KGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkuYnVmZmVyKVxuICAgICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIChBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSB8fCBpc0FycmF5QnVmZmVyVmlldyhib2R5KSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBjb25zdW1lZCh0aGlzKSB8fCBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IFN0cmluZyhpbnB1dClcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcywgeyBib2R5OiB0aGlzLl9ib2R5SW5pdCB9KVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhlYWRlcnMocmF3SGVhZGVycykge1xuICAgIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKVxuICAgIHJhd0hlYWRlcnMuc3BsaXQoL1xccj9cXG4vKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHBhcnRzLnNoaWZ0KCkudHJpbSgpXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKClcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gJ3N0YXR1cycgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzIDogMjAwXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJ1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMudXJsID0gJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgPyB4aHIucmVzcG9uc2VVUkwgOiBvcHRpb25zLmhlYWRlcnMuZ2V0KCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiJdfQ==
