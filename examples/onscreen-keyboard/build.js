(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
'use strict';

var _qambi = require('../../src/qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// use "from 'qambi'" in your own code! so without the extra "../../"

document.addEventListener('DOMContentLoaded', function () {

  // during development is it recommended to set the instrument to 'synth' so you don't have to wait for all piano samples to be loaded and parsed
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

  // set up UI

  var btnPlay = document.getElementById('play');
  var btnPause = document.getElementById('pause');
  var btnStop = document.getElementById('stop');
  var divLoading = document.getElementById('loading');
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
}

},{"../../src/qambi":32}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":13}],5:[function(require,module,exports){
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
},{"./util":12}],6:[function(require,module,exports){
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
},{"./jazz_instance":5,"./midi_input":7,"./midi_output":8,"./midiconnection_event":9,"./util":12}],7:[function(require,module,exports){
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
},{"./midi_access":6,"./midiconnection_event":9,"./midimessage_event":10,"./util":12}],8:[function(require,module,exports){
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
},{"./midi_access":6,"./util":12}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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

},{"./midi_access":6,"./midi_input":7,"./midi_output":8,"./midimessage_event":10}],12:[function(require,module,exports){
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

},{"_process":1}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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
          //result[loadKeys[i - 2]] = data
          returnObj[loadKeys[i - 2]] = data;
        }
      });

      console.log('qambi', _qambi2.default.version);
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

},{"./init_audio":18,"./init_midi":19,"./qambi":32,"./sampler":36,"./settings":40,"./song":42}],18:[function(require,module,exports){
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

},{"./parse_audio":27,"./samples":37}],19:[function(require,module,exports){
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

},{"./util":46,"webmidiapishim":11}],20:[function(require,module,exports){
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

},{"./eventlistener":15,"./init_audio":18}],21:[function(require,module,exports){
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

},{"./constants":14,"./init_audio":18,"./midi_event":22,"./parse_events":28,"./part":29,"./position":31,"./sampler":36,"./track":45,"./util":46}],22:[function(require,module,exports){
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

},{"./note":26,"./settings":40}],23:[function(require,module,exports){
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

},{"./midi_event":22}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{"./midi_stream":24}],26:[function(require,module,exports){
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

},{"./settings":40}],27:[function(require,module,exports){
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

},{"./eventlistener":15,"./init_audio":18,"./util":46,"isomorphic-fetch":4}],28:[function(require,module,exports){
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

},{"./midi_note":23,"./util":46}],29:[function(require,module,exports){
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

},{"./util":46}],30:[function(require,module,exports){
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

},{"./eventlistener.js":15,"./position.js":31,"./util.js":46}],31:[function(require,module,exports){
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

},{"./util":46}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sampler = exports.SimpleSynth = exports.Instrument = exports.Part = exports.Track = exports.Song = exports.MIDINote = exports.MIDIEvent = exports.getNoteData = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.parseMIDIFile = exports.parseSamples = exports.MIDIEventTypes = exports.getSettings = exports.updateSettings = exports.getGMInstruments = exports.getInstruments = exports.init = exports.version = undefined;

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

var _midifile = require('./midifile');

var _init = require('./init');

var _init_audio = require('./init_audio');

var _init_midi = require('./init_midi');

var _parse_audio = require('./parse_audio');

var _constants = require('./constants');

var _eventlistener = require('./eventlistener');

var version = '1.0.0-beta27';

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

},{"./constants":14,"./eventlistener":15,"./init":17,"./init_audio":18,"./init_midi":19,"./instrument":20,"./midi_event":22,"./midi_note":23,"./midifile":25,"./note":26,"./parse_audio":27,"./part":29,"./sampler":36,"./settings":40,"./simple_synth":41,"./song":42,"./track":45}],33:[function(require,module,exports){
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

},{"./init_audio.js":18,"./util.js":46}],34:[function(require,module,exports){
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

},{"./init_audio":18,"./sample":33}],35:[function(require,module,exports){
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

},{"./init_audio":18,"./sample":33}],36:[function(require,module,exports){
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

},{"./fetch_helpers":16,"./instrument":20,"./note":26,"./parse_audio":27,"./sample_buffer":34,"./util":46}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{"filesaverjs":3}],39:[function(require,module,exports){
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

},{"./init_audio":18,"./init_midi":19,"./midi_event":22,"./util":46}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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

},{"./instrument":20,"./sample_oscillator":35}],42:[function(require,module,exports){
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

    this._currentMillis = 0;
    this._scheduler = new _scheduler2.default(this);
    this._playhead = new _playhead.Playhead(this);

    this.playing = false;
    this.paused = false;
    this.recording = false;
    this.precounting = false;
    this.stopped = true;
    this.looping = false;

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
            track.disconnect(this._output)
          })
          setTimeout(() => {
            this._tracks.forEach((track) => {
              track.connect(this._output)
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

},{"./constants":14,"./eventlistener":15,"./init_audio":18,"./metronome":21,"./midi_event":22,"./parse_events":28,"./playhead":30,"./position":31,"./save_midifile":38,"./scheduler":39,"./settings":40,"./song.update":43,"./song_from_midifile":44,"./util":46}],43:[function(require,module,exports){
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
    //console.log('time events %O', this._timeEvents)
  }

  // only parse new and moved events
  var tobeParsed = [];

  // but parse all events if the time events have been updated
  if (this._updateTimeEvents === true) {
    tobeParsed = [].concat(_toConsumableArray(this._events));
  }

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

},{"./constants":14,"./eventlistener":15,"./midi_event":22,"./parse_events":28,"./position":31,"./util":46}],44:[function(require,module,exports){
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

},{"./fetch_helpers":16,"./midi_event":22,"./midifile":25,"./part":29,"./settings":40,"./song":42,"./track":45,"./util":46,"isomorphic-fetch":4}],45:[function(require,module,exports){
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
    this._instrument = null;
    this._tmpRecordedNotes = new Map();
    this._recordedEvents = [];
    this.scheduledSamples = new Map();
    this.sustainedSamples = [];
    this.sustainPedalDown = false;
    this.monitor = false;
    this._songInput = null;
    this._effects = [];

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

    /*
      routing: sample source -> panner -> gain -> [...fx] -> song output
      @TODO: needs some rethinking!
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
  }, {
    key: 'getOutput',
    value: function getOutput() {
      return this._output;
    }
  }, {
    key: 'getInput',
    value: function getInput() {
      return this._songOutput;
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

},{"./eventlistener":15,"./init_audio":18,"./init_midi":19,"./midi_event":22,"./midi_note":23,"./part":29,"./qambi":32,"./util":46}],46:[function(require,module,exports){
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

},{"isomorphic-fetch":4}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwib25zY3JlZW4ta2V5Ym9hcmQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZmlsZXNhdmVyanMvRmlsZVNhdmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtZmV0Y2gvZmV0Y2gtbnBtLWJyb3dzZXJpZnkuanMiLCIuLi9ub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9qYXp6X2luc3RhbmNlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3QvbWlkaV9hY2Nlc3MuanMiLCIuLi9ub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9taWRpX2lucHV0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3QvbWlkaV9vdXRwdXQuanMiLCIuLi9ub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9taWRpY29ubmVjdGlvbl9ldmVudC5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L21pZGltZXNzYWdlX2V2ZW50LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3Qvc2hpbS5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L3V0aWwuanMiLCIuLi9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwiLi4vc3JjL2NvbnN0YW50cy5qcyIsIi4uL3NyYy9ldmVudGxpc3RlbmVyLmpzIiwiLi4vc3JjL2ZldGNoX2hlbHBlcnMuanMiLCIuLi9zcmMvaW5pdC5qcyIsIi4uL3NyYy9pbml0X2F1ZGlvLmpzIiwiLi4vc3JjL2luaXRfbWlkaS5qcyIsIi4uL3NyYy9pbnN0cnVtZW50LmpzIiwiLi4vc3JjL21ldHJvbm9tZS5qcyIsIi4uL3NyYy9taWRpX2V2ZW50LmpzIiwiLi4vc3JjL21pZGlfbm90ZS5qcyIsIi4uL3NyYy9taWRpX3N0cmVhbS5qcyIsIi4uL3NyYy9taWRpZmlsZS5qcyIsIi4uL3NyYy9ub3RlLmpzIiwiLi4vc3JjL3BhcnNlX2F1ZGlvLmpzIiwiLi4vc3JjL3BhcnNlX2V2ZW50cy5qcyIsIi4uL3NyYy9wYXJ0LmpzIiwiLi4vc3JjL3BsYXloZWFkLmpzIiwiLi4vc3JjL3Bvc2l0aW9uLmpzIiwiLi4vc3JjL3FhbWJpLmpzIiwiLi4vc3JjL3NhbXBsZS5qcyIsIi4uL3NyYy9zYW1wbGVfYnVmZmVyLmpzIiwiLi4vc3JjL3NhbXBsZV9vc2NpbGxhdG9yLmpzIiwiLi4vc3JjL3NhbXBsZXIuanMiLCIuLi9zcmMvc2FtcGxlcy5qcyIsIi4uL3NyYy9zYXZlX21pZGlmaWxlLmpzIiwiLi4vc3JjL3NjaGVkdWxlci5qcyIsIi4uL3NyYy9zZXR0aW5ncy5qcyIsIi4uL3NyYy9zaW1wbGVfc3ludGguanMiLCIuLi9zcmMvc29uZy5qcyIsIi4uL3NyYy9zb25nLnVwZGF0ZS5qcyIsIi4uL3NyYy9zb25nX2Zyb21fbWlkaWZpbGUuanMiLCIuLi9zcmMvdHJhY2suanMiLCIuLi9zcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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S0FBekIsRUFBK0I7O0FBRXBDLE1BQUcsTUFBTSxLQUFOLENBQUgsRUFBZ0I7QUFDZCxZQUFRLElBQVIsQ0FBYSx5QkFBYjtBQUNBLFdBQU8sS0FBUDtBQUNEO0FBQ0QsTUFBRyxRQUFRLENBQVIsSUFBYSxRQUFRLEdBQXhCLEVBQTRCO0FBQzFCLFlBQVEsSUFBUixDQUFhLDJDQUFiO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7QUFDRCxTQUFPLEtBQVA7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImltcG9ydCBxYW1iaSwge1xuICBnZXRNSURJSW5wdXRzLFxuICBTaW1wbGVTeW50aCxcbiAgZ2V0Tm90ZURhdGEsXG4gIE1JRElFdmVudCxcbiAgTUlESUV2ZW50VHlwZXMsXG59IGZyb20gJy4uLy4uL3NyYy9xYW1iaScgLy8gdXNlIFwiZnJvbSAncWFtYmknXCIgaW4geW91ciBvd24gY29kZSEgc28gd2l0aG91dCB0aGUgZXh0cmEgXCIuLi8uLi9cIlxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblxuICAvLyBkdXJpbmcgZGV2ZWxvcG1lbnQgaXMgaXQgcmVjb21tZW5kZWQgdG8gc2V0IHRoZSBpbnN0cnVtZW50IHRvICdzeW50aCcgc28geW91IGRvbid0IGhhdmUgdG8gd2FpdCBmb3IgYWxsIHBpYW5vIHNhbXBsZXMgdG8gYmUgbG9hZGVkIGFuZCBwYXJzZWRcbiAgcWFtYmkuaW5pdCh7XG4gICAgc29uZzoge1xuICAgICAgdHlwZTogJ1NvbmcnLFxuICAgICAgdXJsOiAnLi4vZGF0YS9taW51dGVfd2FsdHoubWlkJ1xuICAgIH0sXG4gICAgcGlhbm86IHtcbiAgICAgIHR5cGU6ICdJbnN0cnVtZW50JyxcbiAgICAgIHVybDogJy4uLy4uL2luc3RydW1lbnRzL2hlYXJ0YmVhdC9jaXR5LXBpYW5vLWxpZ2h0Lmpzb24nXG4gICAgfVxuICB9KVxuICAudGhlbihtYWluKVxufSlcblxuXG5mdW5jdGlvbiBtYWluKGRhdGEpe1xuXG4gIGxldCB7c29uZywgcGlhbm99ID0gZGF0YVxuICBsZXQgc3ludGggPSBuZXcgU2ltcGxlU3ludGgoJ3NpbmUnKVxuXG4gIHNvbmcuZ2V0VHJhY2tzKCkuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgdHJhY2suc2V0SW5zdHJ1bWVudChwaWFubylcbiAgICAvL3RyYWNrLnNldEluc3RydW1lbnQoc3ludGgpXG4gICAgLy8gbGlzdGVuIHRvIGFsbCBjb25uZWN0ZWQgTUlESSBpbnB1dCBkZXZpY2VzXG4gICAgdHJhY2suY29ubmVjdE1JRElJbnB1dHMoLi4uZ2V0TUlESUlucHV0cygpKVxuICAgIC8vIGVuYWJsZSBtb25pdG9yIChsaWtlIGluIExvZ2ljIGFuZCBDdWJhc2UpXG4gICAgdHJhY2subW9uaXRvciA9IHRydWVcbiAgfSlcblxuXG4gIC8vIHNldCB1cCBVSVxuXG4gIGxldCBidG5QbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXknKVxuICBsZXQgYnRuUGF1c2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGF1c2UnKVxuICBsZXQgYnRuU3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9wJylcbiAgbGV0IGRpdkxvYWRpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZycpXG4gIGRpdkxvYWRpbmcuaW5uZXJIVE1MID0gJydcblxuICBidG5QbGF5LmRpc2FibGVkID0gZmFsc2VcbiAgYnRuUGF1c2UuZGlzYWJsZWQgPSBmYWxzZVxuICBidG5TdG9wLmRpc2FibGVkID0gZmFsc2VcblxuICBidG5QbGF5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzb25nLnBsYXkoKVxuICB9KVxuXG4gIGJ0blBhdXNlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzb25nLnBhdXNlKClcbiAgfSlcblxuICBidG5TdG9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzb25nLnN0b3AoKVxuICB9KVxuXG4gIC8vIHZlcnkgcnVkaW1lbnRhbCBvbi1zY3JlZW4ga2V5Ym9hcmRcbiAgbGV0IHRyYWNrID0gc29uZy5nZXRUcmFja3MoKVswXVxuICBsZXQga2V5cyA9IG5ldyBNYXAoKTtcbiAgWydDNCcsICdENCcsICdFNCcsICdGNCcsICdHNCcsICdBNCcsICdCNCddLmZvckVhY2goa2V5ID0+IHtcblxuICAgIGxldCBidG5LZXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkpXG4gICAga2V5cy5zZXQoa2V5LCBidG5LZXkpXG5cbiAgICBidG5LZXkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgc3RhcnROb3RlLCBmYWxzZSlcbiAgICBidG5LZXkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BOb3RlLCBmYWxzZSlcbiAgICBidG5LZXkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBzdG9wTm90ZSwgZmFsc2UpXG4gIH0pXG5cbiAgZnVuY3Rpb24gc3RhcnROb3RlKCl7XG4gICAgbGV0IG5vdGVOdW1iZXIgPSBnZXROb3RlRGF0YSh7ZnVsbE5hbWU6IHRoaXMuaWR9KS5udW1iZXJcbiAgICB0cmFjay5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuTk9URV9PTiwgbm90ZU51bWJlciwgMTAwKSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BOb3RlKCl7XG4gICAgbGV0IG5vdGVOdW1iZXIgPSBnZXROb3RlRGF0YSh7ZnVsbE5hbWU6IHRoaXMuaWR9KS5udW1iZXJcbiAgICB0cmFjay5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuTk9URV9PRkYsIG5vdGVOdW1iZXIpKVxuICB9XG5cbiAgLy8gYWRkIGxpc3RlbmVycyBmb3IgYWxsIG5vdGVvbiBhbmQgbm90ZW9mZiBldmVudHNcbiAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdub3RlT24nLCBlID0+IHtcbiAgICAvLyBjb25zb2xlLmxvZyhlLmRhdGEpXG4gICAgbGV0IGJ0biA9IGtleXMuZ2V0KGUuZGF0YS5mdWxsTm90ZU5hbWUpXG4gICAgLy8gY2hlY2sgaWYgdGhpcyBrZXkgZXhpc3RzIG9uIHRoZSBvbi1zY3JlZW4ga2V5Ym9hcmRcbiAgICBpZihidG4pe1xuICAgICAgYnRuLmNsYXNzTmFtZSA9ICdrZXktZG93bidcbiAgICB9XG4gIH0pXG5cbiAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdub3RlT2ZmJywgZSA9PiB7XG4gICAgLy8gY29uc29sZS5sb2coZS5kYXRhKVxuICAgIGxldCBidG4gPSBrZXlzLmdldChlLmRhdGEuZnVsbE5vdGVOYW1lKVxuICAgIGlmKGJ0bil7XG4gICAgICBidG4uY2xhc3NOYW1lID0gJ2tleS11cCdcbiAgICB9XG4gIH0pXG5cbiAgLy8gc2V0IGFsbCBrZXlzIG9mIHRoZSBvbi1zY3JlZW4ga2V5Ym9hcmQgdG8gdGhlIHVwIHN0YXRlIHdoZW4gdGhlIHNvbmcgc3RvcHMgb3IgcGF1c2VzXG4gIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignc3RvcCcsICgpID0+IHtcbiAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGtleS5jbGFzc05hbWUgPSAna2V5LXVwJ1xuICAgIH0pXG4gIH0pXG5cbiAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdwYXVzZScsICgpID0+IHtcbiAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGtleS5jbGFzc05hbWUgPSAna2V5LXVwJ1xuICAgIH0pXG4gIH0pXG59XG4iLCIvKiBGaWxlU2F2ZXIuanNcbiAqIEEgc2F2ZUFzKCkgRmlsZVNhdmVyIGltcGxlbWVudGF0aW9uLlxuICogMS4xLjIwMTYwMzI4XG4gKlxuICogQnkgRWxpIEdyZXksIGh0dHA6Ly9lbGlncmV5LmNvbVxuICogTGljZW5zZTogTUlUXG4gKiAgIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZWxpZ3JleS9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuICovXG5cbi8qZ2xvYmFsIHNlbGYgKi9cbi8qanNsaW50IGJpdHdpc2U6IHRydWUsIGluZGVudDogNCwgbGF4YnJlYWs6IHRydWUsIGxheGNvbW1hOiB0cnVlLCBzbWFydHRhYnM6IHRydWUsIHBsdXNwbHVzOiB0cnVlICovXG5cbi8qISBAc291cmNlIGh0dHA6Ly9wdXJsLmVsaWdyZXkuY29tL2dpdGh1Yi9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvRmlsZVNhdmVyLmpzICovXG5cbnZhciBzYXZlQXMgPSBzYXZlQXMgfHwgKGZ1bmN0aW9uKHZpZXcpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdC8vIElFIDwxMCBpcyBleHBsaWNpdGx5IHVuc3VwcG9ydGVkXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIC9NU0lFIFsxLTldXFwuLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhclxuXHRcdCAgZG9jID0gdmlldy5kb2N1bWVudFxuXHRcdCAgLy8gb25seSBnZXQgVVJMIHdoZW4gbmVjZXNzYXJ5IGluIGNhc2UgQmxvYi5qcyBoYXNuJ3Qgb3ZlcnJpZGRlbiBpdCB5ZXRcblx0XHQsIGdldF9VUkwgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2aWV3LlVSTCB8fCB2aWV3LndlYmtpdFVSTCB8fCB2aWV3O1xuXHRcdH1cblx0XHQsIHNhdmVfbGluayA9IGRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsIFwiYVwiKVxuXHRcdCwgY2FuX3VzZV9zYXZlX2xpbmsgPSBcImRvd25sb2FkXCIgaW4gc2F2ZV9saW5rXG5cdFx0LCBjbGljayA9IGZ1bmN0aW9uKG5vZGUpIHtcblx0XHRcdHZhciBldmVudCA9IG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7XG5cdFx0XHRub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuXHRcdH1cblx0XHQsIGlzX3NhZmFyaSA9IC9WZXJzaW9uXFwvW1xcZFxcLl0rLipTYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcblx0XHQsIHdlYmtpdF9yZXFfZnMgPSB2aWV3LndlYmtpdFJlcXVlc3RGaWxlU3lzdGVtXG5cdFx0LCByZXFfZnMgPSB2aWV3LnJlcXVlc3RGaWxlU3lzdGVtIHx8IHdlYmtpdF9yZXFfZnMgfHwgdmlldy5tb3pSZXF1ZXN0RmlsZVN5c3RlbVxuXHRcdCwgdGhyb3dfb3V0c2lkZSA9IGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHQodmlldy5zZXRJbW1lZGlhdGUgfHwgdmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhyb3cgZXg7XG5cdFx0XHR9LCAwKTtcblx0XHR9XG5cdFx0LCBmb3JjZV9zYXZlYWJsZV90eXBlID0gXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIlxuXHRcdCwgZnNfbWluX3NpemUgPSAwXG5cdFx0Ly8gdGhlIEJsb2IgQVBJIGlzIGZ1bmRhbWVudGFsbHkgYnJva2VuIGFzIHRoZXJlIGlzIG5vIFwiZG93bmxvYWRmaW5pc2hlZFwiIGV2ZW50IHRvIHN1YnNjcmliZSB0b1xuXHRcdCwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0ID0gMTAwMCAqIDQwIC8vIGluIG1zXG5cdFx0LCByZXZva2UgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHR2YXIgcmV2b2tlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKTtcblx0XHRcdFx0fSBlbHNlIHsgLy8gZmlsZSBpcyBhIEZpbGVcblx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0LyogLy8gVGFrZSBub3RlIFczQzpcblx0XHRcdHZhclxuXHRcdFx0ICB1cmkgPSB0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIiA/IGZpbGUgOiBmaWxlLnRvVVJMKClcblx0XHRcdCwgcmV2b2tlciA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHQvLyBpZGVhbHkgRG93bmxvYWRGaW5pc2hlZEV2ZW50LmRhdGEgd291bGQgYmUgdGhlIFVSTCByZXF1ZXN0ZWRcblx0XHRcdFx0aWYgKGV2dC5kYXRhID09PSB1cmkpIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIGZpbGUgaXMgYSBGaWxlXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0O1xuXHRcdFx0dmlldy5hZGRFdmVudExpc3RlbmVyKFwiZG93bmxvYWRmaW5pc2hlZFwiLCByZXZva2VyKTtcblx0XHRcdCovXG5cdFx0XHRzZXRUaW1lb3V0KHJldm9rZXIsIGFyYml0cmFyeV9yZXZva2VfdGltZW91dCk7XG5cdFx0fVxuXHRcdCwgZGlzcGF0Y2ggPSBmdW5jdGlvbihmaWxlc2F2ZXIsIGV2ZW50X3R5cGVzLCBldmVudCkge1xuXHRcdFx0ZXZlbnRfdHlwZXMgPSBbXS5jb25jYXQoZXZlbnRfdHlwZXMpO1xuXHRcdFx0dmFyIGkgPSBldmVudF90eXBlcy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdHZhciBsaXN0ZW5lciA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF90eXBlc1tpXV07XG5cdFx0XHRcdGlmICh0eXBlb2YgbGlzdGVuZXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRsaXN0ZW5lci5jYWxsKGZpbGVzYXZlciwgZXZlbnQgfHwgZmlsZXNhdmVyKTtcblx0XHRcdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRcdFx0dGhyb3dfb3V0c2lkZShleCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCwgYXV0b19ib20gPSBmdW5jdGlvbihibG9iKSB7XG5cdFx0XHQvLyBwcmVwZW5kIEJPTSBmb3IgVVRGLTggWE1MIGFuZCB0ZXh0LyogdHlwZXMgKGluY2x1ZGluZyBIVE1MKVxuXHRcdFx0aWYgKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9iKFtcIlxcdWZlZmZcIiwgYmxvYl0sIHt0eXBlOiBibG9iLnR5cGV9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBibG9iO1xuXHRcdH1cblx0XHQsIEZpbGVTYXZlciA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdC8vIEZpcnN0IHRyeSBhLmRvd25sb2FkLCB0aGVuIHdlYiBmaWxlc3lzdGVtLCB0aGVuIG9iamVjdCBVUkxzXG5cdFx0XHR2YXJcblx0XHRcdFx0ICBmaWxlc2F2ZXIgPSB0aGlzXG5cdFx0XHRcdCwgdHlwZSA9IGJsb2IudHlwZVxuXHRcdFx0XHQsIGJsb2JfY2hhbmdlZCA9IGZhbHNlXG5cdFx0XHRcdCwgb2JqZWN0X3VybFxuXHRcdFx0XHQsIHRhcmdldF92aWV3XG5cdFx0XHRcdCwgZGlzcGF0Y2hfYWxsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgd3JpdGVlbmRcIi5zcGxpdChcIiBcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIG9uIGFueSBmaWxlc3lzIGVycm9ycyByZXZlcnQgdG8gc2F2aW5nIHdpdGggb2JqZWN0IFVSTHNcblx0XHRcdFx0LCBmc19lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICh0YXJnZXRfdmlldyAmJiBpc19zYWZhcmkgJiYgdHlwZW9mIEZpbGVSZWFkZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRcdC8vIFNhZmFyaSBkb2Vzbid0IGFsbG93IGRvd25sb2FkaW5nIG9mIGJsb2IgdXJsc1xuXHRcdFx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdFx0XHRyZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBiYXNlNjREYXRhID0gcmVhZGVyLnJlc3VsdDtcblx0XHRcdFx0XHRcdFx0dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZiA9IFwiZGF0YTphdHRhY2htZW50L2ZpbGVcIiArIGJhc2U2NERhdGEuc2xpY2UoYmFzZTY0RGF0YS5zZWFyY2goL1ssO10vKSk7XG5cdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xuXHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZG9uJ3QgY3JlYXRlIG1vcmUgb2JqZWN0IFVSTHMgdGhhbiBuZWVkZWRcblx0XHRcdFx0XHRpZiAoYmxvYl9jaGFuZ2VkIHx8ICFvYmplY3RfdXJsKSB7XG5cdFx0XHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRhcmdldF92aWV3KSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dmFyIG5ld190YWIgPSB2aWV3Lm9wZW4ob2JqZWN0X3VybCwgXCJfYmxhbmtcIik7XG5cdFx0XHRcdFx0XHRpZiAobmV3X3RhYiA9PT0gdW5kZWZpbmVkICYmIGlzX3NhZmFyaSkge1xuXHRcdFx0XHRcdFx0XHQvL0FwcGxlIGRvIG5vdCBhbGxvdyB3aW5kb3cub3Blbiwgc2VlIGh0dHA6Ly9iaXQubHkvMWtaZmZSSVxuXHRcdFx0XHRcdFx0XHR2aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCwgYWJvcnRhYmxlID0gZnVuY3Rpb24oZnVuYykge1xuXHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmIChmaWxlc2F2ZXIucmVhZHlTdGF0ZSAhPT0gZmlsZXNhdmVyLkRPTkUpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdCwgY3JlYXRlX2lmX25vdF9mb3VuZCA9IHtjcmVhdGU6IHRydWUsIGV4Y2x1c2l2ZTogZmFsc2V9XG5cdFx0XHRcdCwgc2xpY2Vcblx0XHRcdDtcblx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLklOSVQ7XG5cdFx0XHRpZiAoIW5hbWUpIHtcblx0XHRcdFx0bmFtZSA9IFwiZG93bmxvYWRcIjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5fdXNlX3NhdmVfbGluaykge1xuXHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzYXZlX2xpbmsuaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0c2F2ZV9saW5rLmRvd25sb2FkID0gbmFtZTtcblx0XHRcdFx0XHRjbGljayhzYXZlX2xpbmspO1xuXHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdHJldm9rZShvYmplY3RfdXJsKTtcblx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Ly8gT2JqZWN0IGFuZCB3ZWIgZmlsZXN5c3RlbSBVUkxzIGhhdmUgYSBwcm9ibGVtIHNhdmluZyBpbiBHb29nbGUgQ2hyb21lIHdoZW5cblx0XHRcdC8vIHZpZXdlZCBpbiBhIHRhYiwgc28gSSBmb3JjZSBzYXZlIHdpdGggYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXG5cdFx0XHQvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05MTE1OFxuXHRcdFx0Ly8gVXBkYXRlOiBHb29nbGUgZXJyYW50bHkgY2xvc2VkIDkxMTU4LCBJIHN1Ym1pdHRlZCBpdCBhZ2Fpbjpcblx0XHRcdC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0zODk2NDJcblx0XHRcdGlmICh2aWV3LmNocm9tZSAmJiB0eXBlICYmIHR5cGUgIT09IGZvcmNlX3NhdmVhYmxlX3R5cGUpIHtcblx0XHRcdFx0c2xpY2UgPSBibG9iLnNsaWNlIHx8IGJsb2Iud2Via2l0U2xpY2U7XG5cdFx0XHRcdGJsb2IgPSBzbGljZS5jYWxsKGJsb2IsIDAsIGJsb2Iuc2l6ZSwgZm9yY2Vfc2F2ZWFibGVfdHlwZSk7XG5cdFx0XHRcdGJsb2JfY2hhbmdlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHQvLyBTaW5jZSBJIGNhbid0IGJlIHN1cmUgdGhhdCB0aGUgZ3Vlc3NlZCBtZWRpYSB0eXBlIHdpbGwgdHJpZ2dlciBhIGRvd25sb2FkXG5cdFx0XHQvLyBpbiBXZWJLaXQsIEkgYXBwZW5kIC5kb3dubG9hZCB0byB0aGUgZmlsZW5hbWUuXG5cdFx0XHQvLyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NjU0NDBcblx0XHRcdGlmICh3ZWJraXRfcmVxX2ZzICYmIG5hbWUgIT09IFwiZG93bmxvYWRcIikge1xuXHRcdFx0XHRuYW1lICs9IFwiLmRvd25sb2FkXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZSA9PT0gZm9yY2Vfc2F2ZWFibGVfdHlwZSB8fCB3ZWJraXRfcmVxX2ZzKSB7XG5cdFx0XHRcdHRhcmdldF92aWV3ID0gdmlldztcblx0XHRcdH1cblx0XHRcdGlmICghcmVxX2ZzKSB7XG5cdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGZzX21pbl9zaXplICs9IGJsb2Iuc2l6ZTtcblx0XHRcdHJlcV9mcyh2aWV3LlRFTVBPUkFSWSwgZnNfbWluX3NpemUsIGFib3J0YWJsZShmdW5jdGlvbihmcykge1xuXHRcdFx0XHRmcy5yb290LmdldERpcmVjdG9yeShcInNhdmVkXCIsIGNyZWF0ZV9pZl9ub3RfZm91bmQsIGFib3J0YWJsZShmdW5jdGlvbihkaXIpIHtcblx0XHRcdFx0XHR2YXIgc2F2ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlyLmdldEZpbGUobmFtZSwgY3JlYXRlX2lmX25vdF9mb3VuZCwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdFx0ZmlsZS5jcmVhdGVXcml0ZXIoYWJvcnRhYmxlKGZ1bmN0aW9uKHdyaXRlcikge1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci5vbndyaXRlZW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBmaWxlLnRvVVJMKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlZW5kXCIsIGV2ZW50KTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldm9rZShmaWxlKTtcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgZXJyb3IgPSB3cml0ZXIuZXJyb3I7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZXJyb3IuY29kZSAhPT0gZXJyb3IuQUJPUlRfRVJSKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgYWJvcnRcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0d3JpdGVyW1wib25cIiArIGV2ZW50XSA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF07XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLndyaXRlKGJsb2IpO1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0d3JpdGVyLmFib3J0KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuV1JJVElORztcblx0XHRcdFx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdFx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRkaXIuZ2V0RmlsZShuYW1lLCB7Y3JlYXRlOiBmYWxzZX0sIGFib3J0YWJsZShmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdFx0XHQvLyBkZWxldGUgZmlsZSBpZiBpdCBhbHJlYWR5IGV4aXN0c1xuXHRcdFx0XHRcdFx0ZmlsZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdHNhdmUoKTtcblx0XHRcdFx0XHR9KSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHRcdFx0XHRpZiAoZXguY29kZSA9PT0gZXguTk9UX0ZPVU5EX0VSUikge1xuXHRcdFx0XHRcdFx0XHRzYXZlKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmc19lcnJvcigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0fVxuXHRcdCwgRlNfcHJvdG8gPSBGaWxlU2F2ZXIucHJvdG90eXBlXG5cdFx0LCBzYXZlQXMgPSBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pO1xuXHRcdH1cblx0O1xuXHQvLyBJRSAxMCsgKG5hdGl2ZSBzYXZlQXMpXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLCBuYW1lIHx8IFwiZG93bmxvYWRcIik7XG5cdFx0fTtcblx0fVxuXG5cdEZTX3Byb3RvLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZpbGVzYXZlciA9IHRoaXM7XG5cdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwiYWJvcnRcIik7XG5cdH07XG5cdEZTX3Byb3RvLnJlYWR5U3RhdGUgPSBGU19wcm90by5JTklUID0gMDtcblx0RlNfcHJvdG8uV1JJVElORyA9IDE7XG5cdEZTX3Byb3RvLkRPTkUgPSAyO1xuXG5cdEZTX3Byb3RvLmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZXN0YXJ0ID1cblx0RlNfcHJvdG8ub25wcm9ncmVzcyA9XG5cdEZTX3Byb3RvLm9ud3JpdGUgPVxuXHRGU19wcm90by5vbmFib3J0ID1cblx0RlNfcHJvdG8ub25lcnJvciA9XG5cdEZTX3Byb3RvLm9ud3JpdGVlbmQgPVxuXHRcdG51bGw7XG5cblx0cmV0dXJuIHNhdmVBcztcbn0oXG5cdCAgIHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiICYmIHNlbGZcblx0fHwgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3dcblx0fHwgdGhpcy5jb250ZW50XG4pKTtcbi8vIGBzZWxmYCBpcyB1bmRlZmluZWQgaW4gRmlyZWZveCBmb3IgQW5kcm9pZCBjb250ZW50IHNjcmlwdCBjb250ZXh0XG4vLyB3aGlsZSBgdGhpc2AgaXMgbnNJQ29udGVudEZyYW1lTWVzc2FnZU1hbmFnZXJcbi8vIHdpdGggYW4gYXR0cmlidXRlIGBjb250ZW50YCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB3aW5kb3dcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMuc2F2ZUFzID0gc2F2ZUFzO1xufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkZWZpbmUgIT09IG51bGwpICYmIChkZWZpbmUuYW1kICE9PSBudWxsKSkge1xuICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzYXZlQXM7XG4gIH0pO1xufVxuIiwiLy8gdGhlIHdoYXR3Zy1mZXRjaCBwb2x5ZmlsbCBpbnN0YWxscyB0aGUgZmV0Y2goKSBmdW5jdGlvblxuLy8gb24gdGhlIGdsb2JhbCBvYmplY3QgKHdpbmRvdyBvciBzZWxmKVxuLy9cbi8vIFJldHVybiB0aGF0IGFzIHRoZSBleHBvcnQgZm9yIHVzZSBpbiBXZWJwYWNrLCBCcm93c2VyaWZ5IGV0Yy5cbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xubW9kdWxlLmV4cG9ydHMgPSBzZWxmLmZldGNoLmJpbmQoc2VsZik7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNyZWF0ZUphenpJbnN0YW5jZSA9IGNyZWF0ZUphenpJbnN0YW5jZTtcbmV4cG9ydHMuZ2V0SmF6ekluc3RhbmNlID0gZ2V0SmF6ekluc3RhbmNlO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIGphenpQbHVnaW5Jbml0VGltZSA9IDEwMDsgLy8gbWlsbGlzZWNvbmRzXG5cbi8qXG4gIENyZWF0ZXMgaW5zdGFuY2VzIG9mIHRoZSBKYXp6IHBsdWdpbiBpZiBuZWNlc3NhcnkuIEluaXRpYWxseSB0aGUgTUlESUFjY2VzcyBjcmVhdGVzIG9uZSBtYWluIEphenogaW5zdGFuY2UgdGhhdCBpcyB1c2VkXG4gIHRvIHF1ZXJ5IGFsbCBpbml0aWFsbHkgY29ubmVjdGVkIGRldmljZXMsIGFuZCB0byB0cmFjayB0aGUgZGV2aWNlcyB0aGF0IGFyZSBiZWluZyBjb25uZWN0ZWQgb3IgZGlzY29ubmVjdGVkIGF0IHJ1bnRpbWUuXG5cbiAgRm9yIGV2ZXJ5IE1JRElJbnB1dCBhbmQgTUlESU91dHB1dCB0aGF0IGlzIGNyZWF0ZWQsIE1JRElBY2Nlc3MgcXVlcmllcyB0aGUgZ2V0SmF6ekluc3RhbmNlKCkgbWV0aG9kIGZvciBhIEphenogaW5zdGFuY2VcbiAgdGhhdCBzdGlsbCBoYXZlIGFuIGF2YWlsYWJsZSBpbnB1dCBvciBvdXRwdXQuIEJlY2F1c2UgSmF6eiBvbmx5IGFsbG93cyBvbmUgaW5wdXQgYW5kIG9uZSBvdXRwdXQgcGVyIGluc3RhbmNlLCB3ZVxuICBuZWVkIHRvIGNyZWF0ZSBuZXcgaW5zdGFuY2VzIGlmIG1vcmUgdGhhbiBvbmUgTUlESSBpbnB1dCBvciBvdXRwdXQgZGV2aWNlIGdldHMgY29ubmVjdGVkLlxuXG4gIE5vdGUgdGhhdCBhbiBleGlzdGluZyBKYXp6IGluc3RhbmNlIGRvZXNuJ3QgZ2V0IGRlbGV0ZWQgd2hlbiBib3RoIGl0cyBpbnB1dCBhbmQgb3V0cHV0IGRldmljZSBhcmUgZGlzY29ubmVjdGVkOyBpbnN0ZWFkIGl0XG4gIHdpbGwgYmUgcmV1c2VkIGlmIGEgbmV3IGRldmljZSBnZXRzIGNvbm5lY3RlZC5cbiovXG5cbnZhciBqYXp6SW5zdGFuY2VOdW1iZXIgPSAwO1xudmFyIGphenpJbnN0YW5jZXMgPSBuZXcgTWFwKCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUphenpJbnN0YW5jZShjYWxsYmFjaykge1xuXG4gIHZhciBpZCA9ICdqYXp6XycgKyBqYXp6SW5zdGFuY2VOdW1iZXIrKyArICcnICsgRGF0ZS5ub3coKTtcbiAgdmFyIGluc3RhbmNlID0gdm9pZCAwO1xuICB2YXIgb2JqUmVmID0gdm9pZCAwLFxuICAgICAgYWN0aXZlWCA9IHZvaWQgMDtcblxuICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5ub2RlanMgPT09IHRydWUpIHtcbiAgICBvYmpSZWYgPSBuZXcgamF6ek1pZGkuTUlESSgpO1xuICB9IGVsc2Uge1xuICAgIHZhciBvMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29iamVjdCcpO1xuICAgIG8xLmlkID0gaWQgKyAnaWUnO1xuICAgIG8xLmNsYXNzaWQgPSAnQ0xTSUQ6MUFDRTE2MTgtMUM3RC00NTYxLUFFRTEtMzQ4NDJBQTg1RTkwJztcbiAgICBhY3RpdmVYID0gbzE7XG5cbiAgICB2YXIgbzIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICBvMi5pZCA9IGlkO1xuICAgIG8yLnR5cGUgPSAnYXVkaW8veC1qYXp6JztcbiAgICBvMS5hcHBlbmRDaGlsZChvMik7XG4gICAgb2JqUmVmID0gbzI7XG5cbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdUaGlzIHBhZ2UgcmVxdWlyZXMgdGhlICcpKTtcblxuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0phenogcGx1Z2luJykpO1xuICAgIGEuaHJlZiA9ICdodHRwOi8vamF6ei1zb2Z0Lm5ldC8nO1xuXG4gICAgZS5hcHBlbmRDaGlsZChhKTtcbiAgICBlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcuJykpO1xuICAgIG8yLmFwcGVuZENoaWxkKGUpO1xuXG4gICAgdmFyIGluc2VydGlvblBvaW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ01JRElQbHVnaW4nKTtcbiAgICBpZiAoIWluc2VydGlvblBvaW50KSB7XG4gICAgICAvLyBDcmVhdGUgaGlkZGVuIGVsZW1lbnRcbiAgICAgIGluc2VydGlvblBvaW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBpbnNlcnRpb25Qb2ludC5pZCA9ICdNSURJUGx1Z2luJztcbiAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLmxlZnQgPSAnLTk5OTlweCc7XG4gICAgICBpbnNlcnRpb25Qb2ludC5zdHlsZS50b3AgPSAnLTk5OTlweCc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGluc2VydGlvblBvaW50KTtcbiAgICB9XG4gICAgaW5zZXJ0aW9uUG9pbnQuYXBwZW5kQ2hpbGQobzEpO1xuICB9XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG9ialJlZi5pc0phenogPT09IHRydWUpIHtcbiAgICAgIGluc3RhbmNlID0gb2JqUmVmO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZlWC5pc0phenogPT09IHRydWUpIHtcbiAgICAgIGluc3RhbmNlID0gYWN0aXZlWDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBpbnN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGluc3RhbmNlLl9wZXJmVGltZVplcm8gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIGphenpJbnN0YW5jZXMuc2V0KGlkLCBpbnN0YW5jZSk7XG4gICAgfVxuICAgIGNhbGxiYWNrKGluc3RhbmNlKTtcbiAgfSwgamF6elBsdWdpbkluaXRUaW1lKTtcbn1cblxuZnVuY3Rpb24gZ2V0SmF6ekluc3RhbmNlKHR5cGUsIGNhbGxiYWNrKSB7XG4gIHZhciBpbnN0YW5jZSA9IG51bGw7XG4gIHZhciBrZXkgPSB0eXBlID09PSAnaW5wdXQnID8gJ2lucHV0SW5Vc2UnIDogJ291dHB1dEluVXNlJztcblxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBqYXp6SW5zdGFuY2VzLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgdmFyIGluc3QgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgaWYgKGluc3Rba2V5XSAhPT0gdHJ1ZSkge1xuICAgICAgICBpbnN0YW5jZSA9IGluc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICBjcmVhdGVKYXp6SW5zdGFuY2UoY2FsbGJhY2spO1xuICB9IGVsc2Uge1xuICAgIGNhbGxiYWNrKGluc3RhbmNlKTtcbiAgfVxufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENyZWF0ZXMgYSBNSURJQWNjZXNzIGluc3RhbmNlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBDcmVhdGVzIE1JRElJbnB1dCBhbmQgTUlESU91dHB1dCBpbnN0YW5jZXMgZm9yIHRoZSBpbml0aWFsbHkgY29ubmVjdGVkIE1JREkgZGV2aWNlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gS2VlcHMgdHJhY2sgb2YgbmV3bHkgY29ubmVjdGVkIGRldmljZXMgYW5kIGNyZWF0ZXMgdGhlIG5lY2Vzc2FyeSBpbnN0YW5jZXMgb2YgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBLZWVwcyB0cmFjayBvZiBkaXNjb25uZWN0ZWQgZGV2aWNlcyBhbmQgcmVtb3ZlcyB0aGVtIGZyb20gdGhlIGlucHV0cyBhbmQvb3Igb3V0cHV0cyBtYXAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIENyZWF0ZXMgYSB1bmlxdWUgaWQgZm9yIGV2ZXJ5IGRldmljZSBhbmQgc3RvcmVzIHRoZXNlIGlkcyBieSB0aGUgbmFtZSBvZiB0aGUgZGV2aWNlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbyB3aGVuIGEgZGV2aWNlIGdldHMgZGlzY29ubmVjdGVkIGFuZCByZWNvbm5lY3RlZCBhZ2FpbiwgaXQgd2lsbCBzdGlsbCBoYXZlIHRoZSBzYW1lIGlkLiBUaGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzIGluIGxpbmUgd2l0aCB0aGUgYmVoYXZpb3VyIG9mIHRoZSBuYXRpdmUgTUlESUFjY2VzcyBvYmplY3QuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuZXhwb3J0cy5jcmVhdGVNSURJQWNjZXNzID0gY3JlYXRlTUlESUFjY2VzcztcbmV4cG9ydHMuZGlzcGF0Y2hFdmVudCA9IGRpc3BhdGNoRXZlbnQ7XG5leHBvcnRzLmNsb3NlQWxsTUlESUlucHV0cyA9IGNsb3NlQWxsTUlESUlucHV0cztcbmV4cG9ydHMuZ2V0TUlESURldmljZUlkID0gZ2V0TUlESURldmljZUlkO1xuXG52YXIgX2phenpfaW5zdGFuY2UgPSByZXF1aXJlKCcuL2phenpfaW5zdGFuY2UnKTtcblxudmFyIF9taWRpX2lucHV0ID0gcmVxdWlyZSgnLi9taWRpX2lucHV0Jyk7XG5cbnZhciBfbWlkaV9vdXRwdXQgPSByZXF1aXJlKCcuL21pZGlfb3V0cHV0Jyk7XG5cbnZhciBfbWlkaWNvbm5lY3Rpb25fZXZlbnQgPSByZXF1aXJlKCcuL21pZGljb25uZWN0aW9uX2V2ZW50Jyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgbWlkaUFjY2VzcyA9IHZvaWQgMDtcbnZhciBqYXp6SW5zdGFuY2UgPSB2b2lkIDA7XG52YXIgbWlkaUlucHV0cyA9IG5ldyBNYXAoKTtcbnZhciBtaWRpT3V0cHV0cyA9IG5ldyBNYXAoKTtcbnZhciBtaWRpSW5wdXRJZHMgPSBuZXcgTWFwKCk7XG52YXIgbWlkaU91dHB1dElkcyA9IG5ldyBNYXAoKTtcbnZhciBsaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG5cbnZhciBNSURJQWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNSURJQWNjZXNzKGlucHV0cywgb3V0cHV0cykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJQWNjZXNzKTtcblxuICAgIHRoaXMuc3lzZXhFbmFibGVkID0gdHJ1ZTtcbiAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICB0aGlzLm91dHB1dHMgPSBvdXRwdXRzO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElBY2Nlc3MsIFt7XG4gICAga2V5OiAnYWRkRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gdHJ1ZSkge1xuICAgICAgICBsaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTUlESUFjY2Vzcztcbn0oKTtcblxuZnVuY3Rpb24gY3JlYXRlTUlESUFjY2VzcygpIHtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICBpZiAodHlwZW9mIG1pZGlBY2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXNvbHZlKG1pZGlBY2Nlc3MpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLmJyb3dzZXIgPT09ICdpZTknKSB7XG4gICAgICByZWplY3QoeyBtZXNzYWdlOiAnV2ViTUlESUFQSVNoaW0gc3VwcG9ydHMgSW50ZXJuZXQgRXhwbG9yZXIgMTAgYW5kIGFib3ZlLicgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgKDAsIF9qYXp6X2luc3RhbmNlLmNyZWF0ZUphenpJbnN0YW5jZSkoZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgICBpZiAodHlwZW9mIGluc3RhbmNlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZWplY3QoeyBtZXNzYWdlOiAnTm8gYWNjZXNzIHRvIE1JREkgZGV2aWNlczogYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHRoZSBXZWJNSURJIEFQSSBhbmQgdGhlIEphenogcGx1Z2luIGlzIG5vdCBpbnN0YWxsZWQuJyB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBqYXp6SW5zdGFuY2UgPSBpbnN0YW5jZTtcblxuICAgICAgY3JlYXRlTUlESVBvcnRzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0dXBMaXN0ZW5lcnMoKTtcbiAgICAgICAgbWlkaUFjY2VzcyA9IG5ldyBNSURJQWNjZXNzKG1pZGlJbnB1dHMsIG1pZGlPdXRwdXRzKTtcbiAgICAgICAgcmVzb2x2ZShtaWRpQWNjZXNzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gY3JlYXRlIE1JRElJbnB1dCBhbmQgTUlESU91dHB1dCBpbnN0YW5jZXMgZm9yIGFsbCBpbml0aWFsbHkgY29ubmVjdGVkIE1JREkgZGV2aWNlc1xuZnVuY3Rpb24gY3JlYXRlTUlESVBvcnRzKGNhbGxiYWNrKSB7XG4gIHZhciBpbnB1dHMgPSBqYXp6SW5zdGFuY2UuTWlkaUluTGlzdCgpO1xuICB2YXIgb3V0cHV0cyA9IGphenpJbnN0YW5jZS5NaWRpT3V0TGlzdCgpO1xuICB2YXIgbnVtSW5wdXRzID0gaW5wdXRzLmxlbmd0aDtcbiAgdmFyIG51bU91dHB1dHMgPSBvdXRwdXRzLmxlbmd0aDtcblxuICBsb29wQ3JlYXRlTUlESVBvcnQoMCwgbnVtSW5wdXRzLCAnaW5wdXQnLCBpbnB1dHMsIGZ1bmN0aW9uICgpIHtcbiAgICBsb29wQ3JlYXRlTUlESVBvcnQoMCwgbnVtT3V0cHV0cywgJ291dHB1dCcsIG91dHB1dHMsIGNhbGxiYWNrKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGxvb3BDcmVhdGVNSURJUG9ydChpbmRleCwgbWF4LCB0eXBlLCBsaXN0LCBjYWxsYmFjaykge1xuICBpZiAoaW5kZXggPCBtYXgpIHtcbiAgICB2YXIgbmFtZSA9IGxpc3RbaW5kZXgrK107XG4gICAgY3JlYXRlTUlESVBvcnQodHlwZSwgbmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgbG9vcENyZWF0ZU1JRElQb3J0KGluZGV4LCBtYXgsIHR5cGUsIGxpc3QsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjaygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1JRElQb3J0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gICgwLCBfamF6el9pbnN0YW5jZS5nZXRKYXp6SW5zdGFuY2UpKHR5cGUsIGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgIHZhciBwb3J0ID0gdm9pZCAwO1xuICAgIHZhciBpbmZvID0gW25hbWUsICcnLCAnJ107XG4gICAgaWYgKHR5cGUgPT09ICdpbnB1dCcpIHtcbiAgICAgIGlmIChpbnN0YW5jZS5TdXBwb3J0KCdNaWRpSW5JbmZvJykpIHtcbiAgICAgICAgaW5mbyA9IGluc3RhbmNlLk1pZGlJbkluZm8obmFtZSk7XG4gICAgICB9XG4gICAgICBwb3J0ID0gbmV3IF9taWRpX2lucHV0Lk1JRElJbnB1dChpbmZvLCBpbnN0YW5jZSk7XG4gICAgICBtaWRpSW5wdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdvdXRwdXQnKSB7XG4gICAgICBpZiAoaW5zdGFuY2UuU3VwcG9ydCgnTWlkaU91dEluZm8nKSkge1xuICAgICAgICBpbmZvID0gaW5zdGFuY2UuTWlkaU91dEluZm8obmFtZSk7XG4gICAgICB9XG4gICAgICBwb3J0ID0gbmV3IF9taWRpX291dHB1dC5NSURJT3V0cHV0KGluZm8sIGluc3RhbmNlKTtcbiAgICAgIG1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICB9XG4gICAgY2FsbGJhY2socG9ydCk7XG4gIH0pO1xufVxuXG4vLyBsb29rdXAgZnVuY3Rpb246IEphenogZ2l2ZXMgdXMgdGhlIG5hbWUgb2YgdGhlIGNvbm5lY3RlZC9kaXNjb25uZWN0ZWQgTUlESSBkZXZpY2VzIGJ1dCB3ZSBoYXZlIHN0b3JlZCB0aGVtIGJ5IGlkXG5mdW5jdGlvbiBnZXRQb3J0QnlOYW1lKHBvcnRzLCBuYW1lKSB7XG4gIHZhciBwb3J0ID0gdm9pZCAwO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBwb3J0cy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgIHBvcnQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgaWYgKHBvcnQubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvcnQ7XG59XG5cbi8vIGtlZXAgdHJhY2sgb2YgY29ubmVjdGVkL2Rpc2Nvbm5lY3RlZCBNSURJIGRldmljZXNcbmZ1bmN0aW9uIHNldHVwTGlzdGVuZXJzKCkge1xuICBqYXp6SW5zdGFuY2UuT25EaXNjb25uZWN0TWlkaUluKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIHBvcnQgPSBnZXRQb3J0QnlOYW1lKG1pZGlJbnB1dHMsIG5hbWUpO1xuICAgIGlmICh0eXBlb2YgcG9ydCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBvcnQuc3RhdGUgPSAnZGlzY29ubmVjdGVkJztcbiAgICAgIHBvcnQuY2xvc2UoKTtcbiAgICAgIHBvcnQuX2phenpJbnN0YW5jZS5pbnB1dEluVXNlID0gZmFsc2U7XG4gICAgICBtaWRpSW5wdXRzLmRlbGV0ZShwb3J0LmlkKTtcbiAgICAgIGRpc3BhdGNoRXZlbnQocG9ydCk7XG4gICAgfVxuICB9KTtcblxuICBqYXp6SW5zdGFuY2UuT25EaXNjb25uZWN0TWlkaU91dChmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBwb3J0ID0gZ2V0UG9ydEJ5TmFtZShtaWRpT3V0cHV0cywgbmFtZSk7XG4gICAgaWYgKHR5cGVvZiBwb3J0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcG9ydC5zdGF0ZSA9ICdkaXNjb25uZWN0ZWQnO1xuICAgICAgcG9ydC5jbG9zZSgpO1xuICAgICAgcG9ydC5famF6ekluc3RhbmNlLm91dHB1dEluVXNlID0gZmFsc2U7XG4gICAgICBtaWRpT3V0cHV0cy5kZWxldGUocG9ydC5pZCk7XG4gICAgICBkaXNwYXRjaEV2ZW50KHBvcnQpO1xuICAgIH1cbiAgfSk7XG5cbiAgamF6ekluc3RhbmNlLk9uQ29ubmVjdE1pZGlJbihmdW5jdGlvbiAobmFtZSkge1xuICAgIGNyZWF0ZU1JRElQb3J0KCdpbnB1dCcsIG5hbWUsIGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICBkaXNwYXRjaEV2ZW50KHBvcnQpO1xuICAgIH0pO1xuICB9KTtcblxuICBqYXp6SW5zdGFuY2UuT25Db25uZWN0TWlkaU91dChmdW5jdGlvbiAobmFtZSkge1xuICAgIGNyZWF0ZU1JRElQb3J0KCdvdXRwdXQnLCBuYW1lLCBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgZGlzcGF0Y2hFdmVudChwb3J0KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8vIHdoZW4gYSBkZXZpY2UgZ2V0cyBjb25uZWN0ZWQvZGlzY29ubmVjdGVkIGJvdGggdGhlIHBvcnQgYW5kIE1JRElBY2Nlc3MgZGlzcGF0Y2ggYSBNSURJQ29ubmVjdGlvbkV2ZW50XG4vLyB0aGVyZWZvciB3ZSBjYWxsIHRoZSBwb3J0cyBkaXNwYXRjaEV2ZW50IGZ1bmN0aW9uIGhlcmUgYXMgd2VsbFxuZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChwb3J0KSB7XG4gIHBvcnQuZGlzcGF0Y2hFdmVudChuZXcgX21pZGljb25uZWN0aW9uX2V2ZW50Lk1JRElDb25uZWN0aW9uRXZlbnQocG9ydCwgcG9ydCkpO1xuXG4gIHZhciBldnQgPSBuZXcgX21pZGljb25uZWN0aW9uX2V2ZW50Lk1JRElDb25uZWN0aW9uRXZlbnQobWlkaUFjY2VzcywgcG9ydCk7XG5cbiAgaWYgKHR5cGVvZiBtaWRpQWNjZXNzLm9uc3RhdGVjaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICBtaWRpQWNjZXNzLm9uc3RhdGVjaGFuZ2UoZXZ0KTtcbiAgfVxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gbGlzdGVuZXJzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgIGxpc3RlbmVyKGV2dCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VBbGxNSURJSW5wdXRzKCkge1xuICBtaWRpSW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgLy9pbnB1dC5jbG9zZSgpO1xuICAgIGlucHV0Ll9qYXp6SW5zdGFuY2UuTWlkaUluQ2xvc2UoKTtcbiAgfSk7XG59XG5cbi8vIGNoZWNrIGlmIHdlIGhhdmUgYWxyZWFkeSBjcmVhdGVkIGEgdW5pcXVlIGlkIGZvciB0aGlzIGRldmljZSwgaWYgc286IHJldXNlIGl0LCBpZiBub3Q6IGNyZWF0ZSBhIG5ldyBpZCBhbmQgc3RvcmUgaXRcbmZ1bmN0aW9uIGdldE1JRElEZXZpY2VJZChuYW1lLCB0eXBlKSB7XG4gIHZhciBpZCA9IHZvaWQgMDtcbiAgaWYgKHR5cGUgPT09ICdpbnB1dCcpIHtcbiAgICBpZCA9IG1pZGlJbnB1dElkcy5nZXQobmFtZSk7XG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGlkID0gKDAsIF91dGlsLmdlbmVyYXRlVVVJRCkoKTtcbiAgICAgIG1pZGlJbnB1dElkcy5zZXQobmFtZSwgaWQpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnb3V0cHV0Jykge1xuICAgIGlkID0gbWlkaU91dHB1dElkcy5nZXQobmFtZSk7XG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGlkID0gKDAsIF91dGlsLmdlbmVyYXRlVVVJRCkoKTtcbiAgICAgIG1pZGlPdXRwdXRJZHMuc2V0KG5hbWUsIGlkKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGlkO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuTUlESUlucHV0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlESUlucHV0IGlzIGEgd3JhcHBlciBhcm91bmQgYW4gaW5wdXQgb2YgYSBKYXp6IGluc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfbWlkaW1lc3NhZ2VfZXZlbnQgPSByZXF1aXJlKCcuL21pZGltZXNzYWdlX2V2ZW50Jyk7XG5cbnZhciBfbWlkaWNvbm5lY3Rpb25fZXZlbnQgPSByZXF1aXJlKCcuL21pZGljb25uZWN0aW9uX2V2ZW50Jyk7XG5cbnZhciBfbWlkaV9hY2Nlc3MgPSByZXF1aXJlKCcuL21pZGlfYWNjZXNzJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBtaWRpUHJvYyA9IHZvaWQgMDtcbnZhciBub2RlanMgPSAoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLm5vZGVqcztcblxudmFyIE1JRElJbnB1dCA9IGV4cG9ydHMuTUlESUlucHV0ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNSURJSW5wdXQoaW5mbywgaW5zdGFuY2UpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESUlucHV0KTtcblxuICAgIHRoaXMuaWQgPSAoMCwgX21pZGlfYWNjZXNzLmdldE1JRElEZXZpY2VJZCkoaW5mb1swXSwgJ2lucHV0Jyk7XG4gICAgdGhpcy5uYW1lID0gaW5mb1swXTtcbiAgICB0aGlzLm1hbnVmYWN0dXJlciA9IGluZm9bMV07XG4gICAgdGhpcy52ZXJzaW9uID0gaW5mb1syXTtcbiAgICB0aGlzLnR5cGUgPSAnaW5wdXQnO1xuICAgIHRoaXMuc3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSAncGVuZGluZyc7XG5cbiAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UgPSBudWxsO1xuICAgIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBpbXBsaWNpdGx5IG9wZW4gdGhlIGRldmljZSB3aGVuIGFuIG9ubWlkaW1lc3NhZ2UgaGFuZGxlciBnZXRzIGFkZGVkXG4gICAgLy8gd2UgZGVmaW5lIGEgc2V0dGVyIHRoYXQgb3BlbnMgdGhlIGRldmljZSBpZiB0aGUgc2V0IHZhbHVlIGlzIGEgZnVuY3Rpb25cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ29ubWlkaW1lc3NhZ2UnLCB7XG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlID0gdmFsdWU7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IE1hcCgpLnNldCgnbWlkaW1lc3NhZ2UnLCBuZXcgU2V0KCkpLnNldCgnc3RhdGVjaGFuZ2UnLCBuZXcgU2V0KCkpO1xuICAgIHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSA9IGZhbHNlO1xuICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoKTtcblxuICAgIHRoaXMuX2phenpJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgIHRoaXMuX2phenpJbnN0YW5jZS5pbnB1dEluVXNlID0gdHJ1ZTtcblxuICAgIC8vIG9uIExpbnV4IG9wZW5pbmcgYW5kIGNsb3NpbmcgSmF6eiBpbnN0YW5jZXMgY2F1c2VzIHRoZSBwbHVnaW4gdG8gY3Jhc2ggYSBsb3Qgc28gd2Ugb3BlblxuICAgIC8vIHRoZSBkZXZpY2UgaGVyZSBhbmQgZG9uJ3QgY2xvc2UgaXQgd2hlbiBjbG9zZSgpIGlzIGNhbGxlZCwgc2VlIGJlbG93XG4gICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gPT09ICdsaW51eCcpIHtcbiAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpSW5PcGVuKHRoaXMubmFtZSwgbWlkaVByb2MuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElJbnB1dCwgW3tcbiAgICBrZXk6ICdhZGRFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQodHlwZSk7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IGZhbHNlKSB7XG4gICAgICAgIGxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZUV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldCh0eXBlKTtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGlzcGF0Y2hFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZ0KSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldChldnQudHlwZSk7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXIoZXZ0KTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZXZ0LnR5cGUgPT09ICdtaWRpbWVzc2FnZScpIHtcbiAgICAgICAgaWYgKHRoaXMuX29ubWlkaW1lc3NhZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlKGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZXZ0LnR5cGUgPT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgaWYgKHRoaXMub25zdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZShldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnb3BlbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnb3BlbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlJbk9wZW4odGhpcy5uYW1lLCBtaWRpUHJvYy5iaW5kKHRoaXMpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdvcGVuJztcbiAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjbG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlJbkNsb3NlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnY2xvc2VkJztcbiAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UgPSBudWxsO1xuICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5nZXQoJ21pZGltZXNzYWdlJykuY2xlYXIoKTtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5nZXQoJ3N0YXRlY2hhbmdlJykuY2xlYXIoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfYXBwZW5kVG9TeXNleEJ1ZmZlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9hcHBlbmRUb1N5c2V4QnVmZmVyKGRhdGEpIHtcbiAgICAgIHZhciBvbGRMZW5ndGggPSB0aGlzLl9zeXNleEJ1ZmZlci5sZW5ndGg7XG4gICAgICB2YXIgdG1wQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkob2xkTGVuZ3RoICsgZGF0YS5sZW5ndGgpO1xuICAgICAgdG1wQnVmZmVyLnNldCh0aGlzLl9zeXNleEJ1ZmZlcik7XG4gICAgICB0bXBCdWZmZXIuc2V0KGRhdGEsIG9sZExlbmd0aCk7XG4gICAgICB0aGlzLl9zeXNleEJ1ZmZlciA9IHRtcEJ1ZmZlcjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfYnVmZmVyTG9uZ1N5c2V4JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2J1ZmZlckxvbmdTeXNleChkYXRhLCBpbml0aWFsT2Zmc2V0KSB7XG4gICAgICB2YXIgaiA9IGluaXRpYWxPZmZzZXQ7XG4gICAgICB3aGlsZSAoaiA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGlmIChkYXRhW2pdID09IDB4RjcpIHtcbiAgICAgICAgICAvLyBlbmQgb2Ygc3lzZXghXG4gICAgICAgICAgaisrO1xuICAgICAgICAgIHRoaXMuX2FwcGVuZFRvU3lzZXhCdWZmZXIoZGF0YS5zbGljZShpbml0aWFsT2Zmc2V0LCBqKSk7XG4gICAgICAgICAgcmV0dXJuIGo7XG4gICAgICAgIH1cbiAgICAgICAgaisrO1xuICAgICAgfVxuICAgICAgLy8gZGlkbid0IHJlYWNoIHRoZSBlbmQ7IGp1c3QgdGFjayBpdCBvbi5cbiAgICAgIHRoaXMuX2FwcGVuZFRvU3lzZXhCdWZmZXIoZGF0YS5zbGljZShpbml0aWFsT2Zmc2V0LCBqKSk7XG4gICAgICB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UgPSB0cnVlO1xuICAgICAgcmV0dXJuIGo7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElJbnB1dDtcbn0oKTtcblxubWlkaVByb2MgPSBmdW5jdGlvbiBtaWRpUHJvYyh0aW1lc3RhbXAsIGRhdGEpIHtcbiAgdmFyIGxlbmd0aCA9IDA7XG4gIHZhciBpID0gdm9pZCAwO1xuICB2YXIgaXNTeXNleE1lc3NhZ2UgPSBmYWxzZTtcblxuICAvLyBKYXp6IHNvbWV0aW1lcyBwYXNzZXMgdXMgbXVsdGlwbGUgbWVzc2FnZXMgYXQgb25jZSwgc28gd2UgbmVlZCB0byBwYXJzZSB0aGVtIG91dCBhbmQgcGFzcyB0aGVtIG9uZSBhdCBhIHRpbWUuXG5cbiAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IGxlbmd0aCkge1xuICAgIHZhciBpc1ZhbGlkTWVzc2FnZSA9IHRydWU7XG4gICAgaWYgKHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSkge1xuICAgICAgaSA9IHRoaXMuX2J1ZmZlckxvbmdTeXNleChkYXRhLCBpKTtcbiAgICAgIGlmIChkYXRhW2kgLSAxXSAhPSAweGY3KSB7XG4gICAgICAgIC8vIHJhbiBvZmYgdGhlIGVuZCB3aXRob3V0IGhpdHRpbmcgdGhlIGVuZCBvZiB0aGUgc3lzZXggbWVzc2FnZVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpc1N5c2V4TWVzc2FnZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzU3lzZXhNZXNzYWdlID0gZmFsc2U7XG4gICAgICBzd2l0Y2ggKGRhdGFbaV0gJiAweEYwKSB7XG4gICAgICAgIGNhc2UgMHgwMDpcbiAgICAgICAgICAvLyBDaGV3IHVwIHNwdXJpb3VzIDB4MDAgYnl0ZXMuICBGaXhlcyBhIFdpbmRvd3MgcHJvYmxlbS5cbiAgICAgICAgICBsZW5ndGggPSAxO1xuICAgICAgICAgIGlzVmFsaWRNZXNzYWdlID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAweDgwOiAvLyBub3RlIG9mZlxuICAgICAgICBjYXNlIDB4OTA6IC8vIG5vdGUgb25cbiAgICAgICAgY2FzZSAweEEwOiAvLyBwb2x5cGhvbmljIGFmdGVydG91Y2hcbiAgICAgICAgY2FzZSAweEIwOiAvLyBjb250cm9sIGNoYW5nZVxuICAgICAgICBjYXNlIDB4RTA6XG4gICAgICAgICAgLy8gY2hhbm5lbCBtb2RlXG4gICAgICAgICAgbGVuZ3RoID0gMztcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDB4QzA6IC8vIHByb2dyYW0gY2hhbmdlXG4gICAgICAgIGNhc2UgMHhEMDpcbiAgICAgICAgICAvLyBjaGFubmVsIGFmdGVydG91Y2hcbiAgICAgICAgICBsZW5ndGggPSAyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMHhGMDpcbiAgICAgICAgICBzd2l0Y2ggKGRhdGFbaV0pIHtcbiAgICAgICAgICAgIGNhc2UgMHhmMDpcbiAgICAgICAgICAgICAgLy8gbGV0aWFibGUtbGVuZ3RoIHN5c2V4LlxuICAgICAgICAgICAgICBpID0gdGhpcy5fYnVmZmVyTG9uZ1N5c2V4KGRhdGEsIGkpO1xuICAgICAgICAgICAgICBpZiAoZGF0YVtpIC0gMV0gIT0gMHhmNykge1xuICAgICAgICAgICAgICAgIC8vIHJhbiBvZmYgdGhlIGVuZCB3aXRob3V0IGhpdHRpbmcgdGhlIGVuZCBvZiB0aGUgc3lzZXggbWVzc2FnZVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpc1N5c2V4TWVzc2FnZSA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDB4RjE6IC8vIE1UQyBxdWFydGVyIGZyYW1lXG4gICAgICAgICAgICBjYXNlIDB4RjM6XG4gICAgICAgICAgICAgIC8vIHNvbmcgc2VsZWN0XG4gICAgICAgICAgICAgIGxlbmd0aCA9IDI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDB4RjI6XG4gICAgICAgICAgICAgIC8vIHNvbmcgcG9zaXRpb24gcG9pbnRlclxuICAgICAgICAgICAgICBsZW5ndGggPSAzO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgbGVuZ3RoID0gMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzVmFsaWRNZXNzYWdlKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YXIgZXZ0ID0ge307XG4gICAgZXZ0LnJlY2VpdmVkVGltZSA9IHBhcnNlRmxvYXQodGltZXN0YW1wLnRvU3RyaW5nKCkpICsgdGhpcy5famF6ekluc3RhbmNlLl9wZXJmVGltZVplcm87XG5cbiAgICBpZiAoaXNTeXNleE1lc3NhZ2UgfHwgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlKSB7XG4gICAgICBldnQuZGF0YSA9IG5ldyBVaW50OEFycmF5KHRoaXMuX3N5c2V4QnVmZmVyKTtcbiAgICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoMCk7XG4gICAgICB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZ0LmRhdGEgPSBuZXcgVWludDhBcnJheShkYXRhLnNsaWNlKGksIGxlbmd0aCArIGkpKTtcbiAgICB9XG5cbiAgICBpZiAobm9kZWpzKSB7XG4gICAgICBpZiAodGhpcy5fb25taWRpbWVzc2FnZSkge1xuICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlKGV2dCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlID0gbmV3IF9taWRpbWVzc2FnZV9ldmVudC5NSURJTWVzc2FnZUV2ZW50KHRoaXMsIGV2dC5kYXRhLCBldnQucmVjZWl2ZWRUaW1lKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5NSURJT3V0cHV0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlESU91dHB1dCBpcyBhIHdyYXBwZXIgYXJvdW5kIGFuIG91dHB1dCBvZiBhIEphenogaW5zdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9taWRpX2FjY2VzcyA9IHJlcXVpcmUoJy4vbWlkaV9hY2Nlc3MnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIE1JRElPdXRwdXQgPSBleHBvcnRzLk1JRElPdXRwdXQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1JRElPdXRwdXQoaW5mbywgaW5zdGFuY2UpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESU91dHB1dCk7XG5cbiAgICB0aGlzLmlkID0gKDAsIF9taWRpX2FjY2Vzcy5nZXRNSURJRGV2aWNlSWQpKGluZm9bMF0sICdvdXRwdXQnKTtcbiAgICB0aGlzLm5hbWUgPSBpbmZvWzBdO1xuICAgIHRoaXMubWFudWZhY3R1cmVyID0gaW5mb1sxXTtcbiAgICB0aGlzLnZlcnNpb24gPSBpbmZvWzJdO1xuICAgIHRoaXMudHlwZSA9ICdvdXRwdXQnO1xuICAgIHRoaXMuc3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSAncGVuZGluZyc7XG4gICAgdGhpcy5vbm1pZGltZXNzYWdlID0gbnVsbDtcbiAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSA9IGZhbHNlO1xuICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoKTtcblxuICAgIHRoaXMuX2phenpJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgIHRoaXMuX2phenpJbnN0YW5jZS5vdXRwdXRJblVzZSA9IHRydWU7XG4gICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gPT09ICdsaW51eCcpIHtcbiAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0T3Blbih0aGlzLm5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhNSURJT3V0cHV0LCBbe1xuICAgIGtleTogJ29wZW4nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ29wZW4nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLnBsYXRmb3JtICE9PSAnbGludXgnKSB7XG4gICAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0T3Blbih0aGlzLm5hbWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ29wZW4nO1xuICAgICAgKDAsIF9taWRpX2FjY2Vzcy5kaXNwYXRjaEV2ZW50KSh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Nsb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnY2xvc2VkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5wbGF0Zm9ybSAhPT0gJ2xpbnV4Jykge1xuICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaU91dENsb3NlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnY2xvc2VkJztcbiAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuY2xlYXIoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZW5kJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZChkYXRhLCB0aW1lc3RhbXApIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBkZWxheUJlZm9yZVNlbmQgPSAwO1xuXG4gICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZXN0YW1wKSB7XG4gICAgICAgIGRlbGF5QmVmb3JlU2VuZCA9IE1hdGguZmxvb3IodGltZXN0YW1wIC0gcGVyZm9ybWFuY2Uubm93KCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZXN0YW1wICYmIGRlbGF5QmVmb3JlU2VuZCA+IDEpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0TG9uZyhkYXRhKTtcbiAgICAgICAgfSwgZGVsYXlCZWZvcmVTZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0TG9uZyhkYXRhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NsZWFyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZEV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2xpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaXNwYXRjaEV2ZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldnQpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICBsaXN0ZW5lcihldnQpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLm9uc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlKGV2dCk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElPdXRwdXQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTUlESUNvbm5lY3Rpb25FdmVudCA9IGV4cG9ydHMuTUlESUNvbm5lY3Rpb25FdmVudCA9IGZ1bmN0aW9uIE1JRElDb25uZWN0aW9uRXZlbnQobWlkaUFjY2VzcywgcG9ydCkge1xuICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESUNvbm5lY3Rpb25FdmVudCk7XG5cbiAgdGhpcy5idWJibGVzID0gZmFsc2U7XG4gIHRoaXMuY2FuY2VsQnViYmxlID0gZmFsc2U7XG4gIHRoaXMuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICB0aGlzLmN1cnJlbnRUYXJnZXQgPSBtaWRpQWNjZXNzO1xuICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgdGhpcy5ldmVudFBoYXNlID0gMDtcbiAgdGhpcy5wYXRoID0gW107XG4gIHRoaXMucG9ydCA9IHBvcnQ7XG4gIHRoaXMucmV0dXJuVmFsdWUgPSB0cnVlO1xuICB0aGlzLnNyY0VsZW1lbnQgPSBtaWRpQWNjZXNzO1xuICB0aGlzLnRhcmdldCA9IG1pZGlBY2Nlc3M7XG4gIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgdGhpcy50eXBlID0gJ3N0YXRlY2hhbmdlJztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTUlESU1lc3NhZ2VFdmVudCA9IGV4cG9ydHMuTUlESU1lc3NhZ2VFdmVudCA9IGZ1bmN0aW9uIE1JRElNZXNzYWdlRXZlbnQocG9ydCwgZGF0YSwgcmVjZWl2ZWRUaW1lKSB7XG4gIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJTWVzc2FnZUV2ZW50KTtcblxuICB0aGlzLmJ1YmJsZXMgPSBmYWxzZTtcbiAgdGhpcy5jYW5jZWxCdWJibGUgPSBmYWxzZTtcbiAgdGhpcy5jYW5jZWxhYmxlID0gZmFsc2U7XG4gIHRoaXMuY3VycmVudFRhcmdldCA9IHBvcnQ7XG4gIHRoaXMuZGF0YSA9IGRhdGE7XG4gIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICB0aGlzLmV2ZW50UGhhc2UgPSAwO1xuICB0aGlzLnBhdGggPSBbXTtcbiAgdGhpcy5yZWNlaXZlZFRpbWUgPSByZWNlaXZlZFRpbWU7XG4gIHRoaXMucmV0dXJuVmFsdWUgPSB0cnVlO1xuICB0aGlzLnNyY0VsZW1lbnQgPSBwb3J0O1xuICB0aGlzLnRhcmdldCA9IHBvcnQ7XG4gIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgdGhpcy50eXBlID0gJ21pZGltZXNzYWdlJztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX21pZGlfYWNjZXNzID0gcmVxdWlyZSgnLi9taWRpX2FjY2VzcycpO1xuXG52YXIgX21pZGlfaW5wdXQgPSByZXF1aXJlKCcuL21pZGlfaW5wdXQnKTtcblxudmFyIF9taWRpX291dHB1dCA9IHJlcXVpcmUoJy4vbWlkaV9vdXRwdXQnKTtcblxudmFyIF9taWRpbWVzc2FnZV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaW1lc3NhZ2VfZXZlbnQnKTtcblxuLypcbiAgbWFpbiBlbnRyeSBwb2ludFxuKi9cbi8vaW1wb3J0IHtjcmVhdGVNSURJQWNjZXNzLCBjbG9zZUFsbE1JRElJbnB1dHN9IGZyb20gJy4vbWlkaV9hY2Nlc3MnXG4vL2ltcG9ydCB7cG9seWZpbGwsIGdldERldmljZX0gZnJvbSAnLi91dGlsJ1xuXG5cbihmdW5jdGlvbiBpbml0U2hpbSgpIHtcblxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyA9PT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgIGdsb2JhbC5NSURJSW5wdXQgPSBfbWlkaV9pbnB1dC5NSURJSW5wdXQ7XG4gICAgZ2xvYmFsLk1JRElPdXRwdXQgPSBfbWlkaV9vdXRwdXQuTUlESU91dHB1dDtcbiAgICBnbG9iYWwuTUlESU1lc3NhZ2VFdmVudCA9IF9taWRpbWVzc2FnZV9ldmVudC5NSURJTWVzc2FnZUV2ZW50O1xuXG4gICAgLy9wb2x5ZmlsbCgpXG5cbiAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnd2VibWlkaWFwaXNoaW0gMS4wLjEnLCBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MpO1xuICAgICAgcmV0dXJuICgwLCBfbWlkaV9hY2Nlc3MuY3JlYXRlTUlESUFjY2VzcykoKTtcbiAgICB9O1xuICAgIC8qXG4gICAgICAgIGlmKGdldERldmljZSgpLm5vZGVqcyA9PT0gdHJ1ZSl7XG4gICAgICAgICAgbmF2aWdhdG9yLmNsb3NlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vIE5lZWQgdG8gY2xvc2UgTUlESSBpbnB1dCBwb3J0cywgb3RoZXJ3aXNlIE5vZGUuanMgd2lsbCB3YWl0IGZvciBNSURJIGlucHV0IGZvcmV2ZXIuXG4gICAgICAgICAgICBjbG9zZUFsbE1JRElJbnB1dHMoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICovXG4gIH1cbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nZW5lcmF0ZVVVSUQgPSBnZW5lcmF0ZVVVSUQ7XG5leHBvcnRzLmdldERldmljZSA9IGdldERldmljZTtcbmV4cG9ydHMucG9seWZpbGxQZXJmb3JtYW5jZSA9IHBvbHlmaWxsUGVyZm9ybWFuY2U7XG5leHBvcnRzLnBvbHlmaWxsUHJvbWlzZSA9IHBvbHlmaWxsUHJvbWlzZTtcbmV4cG9ydHMucG9seWZpbGwgPSBwb2x5ZmlsbDtcbi8qXG4gIEEgY29sbGVjdGlvbiBvZiBoYW5keSB1dGlsIG1ldGhvZHNcbiovXG5cbmZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgdmFyIHV1aWQgPSBuZXcgQXJyYXkoNjQpLmpvaW4oJ3gnKTsgLy8neHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4JztcbiAgdXVpZCA9IHV1aWQucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xuICAgIHZhciByID0gKGQgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwO1xuICAgIGQgPSBNYXRoLmZsb29yKGQgLyAxNik7XG4gICAgcmV0dXJuIChjID09ICd4JyA/IHIgOiByICYgMHgzIHwgMHg4KS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgfSk7XG4gIHJldHVybiB1dWlkO1xufVxuXG52YXIgZGV2aWNlID0gdm9pZCAwO1xuXG4vLyBjaGVjayBvbiB3aGF0IHR5cGUgb2YgZGV2aWNlIHdlIGFyZSBydW5uaW5nLCBub3RlIHRoYXQgaW4gdGhpcyBjb250ZXh0IGEgZGV2aWNlIGlzIGEgY29tcHV0ZXIgbm90IGEgTUlESSBkZXZpY2VcbmZ1bmN0aW9uIGdldERldmljZSgpIHtcblxuICBpZiAodHlwZW9mIGRldmljZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZGV2aWNlO1xuICB9XG5cbiAgdmFyIHBsYXRmb3JtID0gJ3VuZGV0ZWN0ZWQnLFxuICAgICAgYnJvd3NlciA9ICd1bmRldGVjdGVkJyxcbiAgICAgIG5vZGVqcyA9IGZhbHNlO1xuXG4gIGlmIChuYXZpZ2F0b3Iubm9kZWpzKSB7XG4gICAgcGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtO1xuICAgIGRldmljZSA9IHtcbiAgICAgIHBsYXRmb3JtOiBwbGF0Zm9ybSxcbiAgICAgIG5vZGVqczogdHJ1ZSxcbiAgICAgIG1vYmlsZTogcGxhdGZvcm0gPT09ICdpb3MnIHx8IHBsYXRmb3JtID09PSAnYW5kcm9pZCdcbiAgICB9O1xuICAgIHJldHVybiBkZXZpY2U7XG4gIH1cblxuICB2YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gIGlmICh1YS5tYXRjaCgvKGlQYWR8aVBob25lfGlQb2QpL2cpKSB7XG4gICAgcGxhdGZvcm0gPSAnaW9zJztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdBbmRyb2lkJykgIT09IC0xKSB7XG4gICAgcGxhdGZvcm0gPSAnYW5kcm9pZCc7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignTGludXgnKSAhPT0gLTEpIHtcbiAgICBwbGF0Zm9ybSA9ICdsaW51eCc7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignTWFjaW50b3NoJykgIT09IC0xKSB7XG4gICAgcGxhdGZvcm0gPSAnb3N4JztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdXaW5kb3dzJykgIT09IC0xKSB7XG4gICAgcGxhdGZvcm0gPSAnd2luZG93cyc7XG4gIH1cblxuICBpZiAodWEuaW5kZXhPZignQ2hyb21lJykgIT09IC0xKSB7XG4gICAgLy8gY2hyb21lLCBjaHJvbWl1bSBhbmQgY2FuYXJ5XG4gICAgYnJvd3NlciA9ICdjaHJvbWUnO1xuXG4gICAgaWYgKHVhLmluZGV4T2YoJ09QUicpICE9PSAtMSkge1xuICAgICAgYnJvd3NlciA9ICdvcGVyYSc7XG4gICAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdDaHJvbWl1bScpICE9PSAtMSkge1xuICAgICAgYnJvd3NlciA9ICdjaHJvbWl1bSc7XG4gICAgfVxuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1NhZmFyaScpICE9PSAtMSkge1xuICAgIGJyb3dzZXIgPSAnc2FmYXJpJztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdGaXJlZm94JykgIT09IC0xKSB7XG4gICAgYnJvd3NlciA9ICdmaXJlZm94JztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdUcmlkZW50JykgIT09IC0xKSB7XG4gICAgYnJvd3NlciA9ICdpZSc7XG4gICAgaWYgKHVhLmluZGV4T2YoJ01TSUUgOScpICE9PSAtMSkge1xuICAgICAgYnJvd3NlciA9ICdpZTknO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwbGF0Zm9ybSA9PT0gJ2lvcycpIHtcbiAgICBpZiAodWEuaW5kZXhPZignQ3JpT1MnKSAhPT0gLTEpIHtcbiAgICAgIGJyb3dzZXIgPSAnY2hyb21lJztcbiAgICB9XG4gIH1cblxuICBkZXZpY2UgPSB7XG4gICAgcGxhdGZvcm06IHBsYXRmb3JtLFxuICAgIGJyb3dzZXI6IGJyb3dzZXIsXG4gICAgbW9iaWxlOiBwbGF0Zm9ybSA9PT0gJ2lvcycgfHwgcGxhdGZvcm0gPT09ICdhbmRyb2lkJyxcbiAgICBub2RlanM6IGZhbHNlXG4gIH07XG4gIHJldHVybiBkZXZpY2U7XG59XG5cbmZ1bmN0aW9uIHBvbHlmaWxsUGVyZm9ybWFuY2UoKSB7XG4gIGlmICh0eXBlb2YgcGVyZm9ybWFuY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcGVyZm9ybWFuY2UgPSB7fTtcbiAgfVxuICBEYXRlLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBub3dPZmZzZXQgPSBEYXRlLm5vdygpO1xuICAgICAgaWYgKHR5cGVvZiBwZXJmb3JtYW5jZS50aW1pbmcgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBub3dPZmZzZXQgPSBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0O1xuICAgICAgfVxuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gbm93KCkge1xuICAgICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIG5vd09mZnNldDtcbiAgICAgIH07XG4gICAgfSkoKTtcbiAgfVxufVxuXG4vLyBhIHZlcnkgc2ltcGxlIGltcGxlbWVudGF0aW9uIG9mIGEgUHJvbWlzZSBmb3IgSW50ZXJuZXQgRXhwbG9yZXIgYW5kIE5vZGVqc1xuZnVuY3Rpb24gcG9seWZpbGxQcm9taXNlKHNjb3BlKSB7XG4gIGlmICh0eXBlb2Ygc2NvcGUuUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuXG4gICAgc2NvcGUuUHJvbWlzZSA9IGZ1bmN0aW9uIChleGVjdXRvcikge1xuICAgICAgdGhpcy5leGVjdXRvciA9IGV4ZWN1dG9yO1xuICAgIH07XG5cbiAgICBzY29wZS5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWYgKHR5cGVvZiByZXNvbHZlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlc29sdmUgPSBmdW5jdGlvbiByZXNvbHZlKCkge307XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHJlamVjdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZWplY3QgPSBmdW5jdGlvbiByZWplY3QoKSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICB2YXIgZGV2aWNlID0gZ2V0RGV2aWNlKCk7XG4gIGlmIChkZXZpY2UuYnJvd3NlciA9PT0gJ2llJykge1xuICAgIHBvbHlmaWxsUHJvbWlzZSh3aW5kb3cpO1xuICB9IGVsc2UgaWYgKGRldmljZS5ub2RlanMgPT09IHRydWUpIHtcbiAgICBwb2x5ZmlsbFByb21pc2UoZ2xvYmFsKTtcbiAgfVxuICBwb2x5ZmlsbFBlcmZvcm1hbmNlKCk7XG59IiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMubWFwKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRoaXMubWFwW25hbWVdLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcylcbiAgICAgIH0sIHRoaXMpXG4gICAgfSwgdGhpcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKG5hbWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHsgaXRlbXMucHVzaCh2YWx1ZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIC8vIE9ubHkgc3VwcG9ydCBBcnJheUJ1ZmZlcnMgZm9yIFBPU1QgbWV0aG9kLlxuICAgICAgICAvLyBSZWNlaXZpbmcgQXJyYXlCdWZmZXJzIGhhcHBlbnMgdmlhIEJsb2JzLCBpbnN0ZWFkLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQgOiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG4gICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpKSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gaW5wdXRcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gaGVhZGVycyh4aHIpIHtcbiAgICB2YXIgaGVhZCA9IG5ldyBIZWFkZXJzKClcbiAgICB2YXIgcGFpcnMgPSAoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdFxuICAgICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICAgIHJlcXVlc3QgPSBpbnB1dFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMoeGhyKSxcbiAgICAgICAgICB1cmw6IHJlc3BvbnNlVVJMKClcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiXG4vLyBzdGFuZGFyZCBNSURJIGV2ZW50c1xuY29uc3QgTUlESUV2ZW50VHlwZXMgPSB7fVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09GRicsIHt2YWx1ZTogMHg4MH0pIC8vMTI4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09OJywge3ZhbHVlOiAweDkwfSkgLy8xNDRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BPTFlfUFJFU1NVUkUnLCB7dmFsdWU6IDB4QTB9KSAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVFJPTF9DSEFOR0UnLCB7dmFsdWU6IDB4QjB9KSAvLzE3NlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUFJPR1JBTV9DSEFOR0UnLCB7dmFsdWU6IDB4QzB9KSAvLzE5MlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ0hBTk5FTF9QUkVTU1VSRScsIHt2YWx1ZTogMHhEMH0pIC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQSVRDSF9CRU5EJywge3ZhbHVlOiAweEUwfSkgLy8yMjRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NZU1RFTV9FWENMVVNJVkUnLCB7dmFsdWU6IDB4RjB9KSAvLzI0MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTUlESV9USU1FQ09ERScsIHt2YWx1ZTogMjQxfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfUE9TSVRJT04nLCB7dmFsdWU6IDI0Mn0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTT05HX1NFTEVDVCcsIHt2YWx1ZTogMjQzfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RVTkVfUkVRVUVTVCcsIHt2YWx1ZTogMjQ2fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0VPWCcsIHt2YWx1ZTogMjQ3fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RJTUlOR19DTE9DSycsIHt2YWx1ZTogMjQ4fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NUQVJUJywge3ZhbHVlOiAyNTB9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVElOVUUnLCB7dmFsdWU6IDI1MX0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTVE9QJywge3ZhbHVlOiAyNTJ9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQUNUSVZFX1NFTlNJTkcnLCB7dmFsdWU6IDI1NH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTWVNURU1fUkVTRVQnLCB7dmFsdWU6IDI1NX0pXG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVEVNUE8nLCB7dmFsdWU6IDB4NTF9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNRV9TSUdOQVRVUkUnLCB7dmFsdWU6IDB4NTh9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU5EX09GX1RSQUNLJywge3ZhbHVlOiAweDJGfSlcblxuZXhwb3J0IHtNSURJRXZlbnRUeXBlc31cbiIsImxldCBldmVudExpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldmVudCl7XG4gIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSlcbiAgbGV0IG1hcFxuXG4gIGlmKGV2ZW50LnR5cGUgPT09ICdldmVudCcpe1xuICAgIGxldCBtaWRpRXZlbnQgPSBldmVudC5kYXRhXG4gICAgbGV0IG1pZGlFdmVudFR5cGUgPSBtaWRpRXZlbnQudHlwZVxuICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50VHlwZSlcbiAgICBpZihldmVudExpc3RlbmVycy5oYXMobWlkaUV2ZW50VHlwZSkpe1xuICAgICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudFR5cGUpXG4gICAgICBmb3IobGV0IGNiIG9mIG1hcC52YWx1ZXMoKSl7XG4gICAgICAgIGNiKG1pZGlFdmVudClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUsIGV2ZW50TGlzdGVuZXJzLmhhcyhldmVudC50eXBlKSlcbiAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKGV2ZW50LnR5cGUpID09PSBmYWxzZSl7XG4gICAgcmV0dXJuXG4gIH1cblxuICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnQudHlwZSlcbiAgZm9yKGxldCBjYiBvZiBtYXAudmFsdWVzKCkpe1xuICAgIGNiKGV2ZW50KVxuICB9XG5cblxuICAvLyBAdG9kbzogcnVuIGZpbHRlcnMgaGVyZSwgZm9yIGluc3RhbmNlIGlmIGFuIGV2ZW50bGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgdG8gYWxsIE5PVEVfT04gZXZlbnRzLCBjaGVjayB0aGUgdHlwZSBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGNhbGxiYWNrKXtcblxuICBsZXQgbWFwXG4gIGxldCBpZCA9IGAke3R5cGV9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuXG4gIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSA9PT0gZmFsc2Upe1xuICAgIG1hcCA9IG5ldyBNYXAoKVxuICAgIGV2ZW50TGlzdGVuZXJzLnNldCh0eXBlLCBtYXApXG4gIH1lbHNle1xuICAgIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKVxuICB9XG5cbiAgbWFwLnNldChpZCwgY2FsbGJhY2spXG4gIC8vY29uc29sZS5sb2coZXZlbnRMaXN0ZW5lcnMpXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcblxuICBpZihldmVudExpc3RlbmVycy5oYXModHlwZSkgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmxvZygnbm8gZXZlbnRsaXN0ZW5lcnMgb2YgdHlwZScgKyB0eXBlKVxuICAgIHJldHVyblxuICB9XG5cbiAgbGV0IG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldCh0eXBlKVxuXG4gIGlmKHR5cGVvZiBpZCA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgZm9yKGxldCBba2V5LCB2YWx1ZV0gb2YgbWFwLmVudHJpZXMoKSkge1xuICAgICAgY29uc29sZS5sb2coa2V5LCB2YWx1ZSlcbiAgICAgIGlmKHZhbHVlID09PSBpZCl7XG4gICAgICAgIGNvbnNvbGUubG9nKGtleSlcbiAgICAgICAgaWQgPSBrZXlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYodHlwZW9mIGlkID09PSAnc3RyaW5nJyl7XG4gICAgICBtYXAuZGVsZXRlKGlkKVxuICAgIH1cbiAgfWVsc2UgaWYodHlwZW9mIGlkID09PSAnc3RyaW5nJyl7XG4gICAgbWFwLmRlbGV0ZShpZClcbiAgfWVsc2V7XG4gICAgY29uc29sZS5sb2coJ2NvdWxkIG5vdCByZW1vdmUgZXZlbnRsaXN0ZW5lcicpXG4gIH1cbn1cblxuIiwiLy8gZmV0Y2ggaGVscGVyc1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhdHVzKHJlc3BvbnNlKSB7XG4gIGlmKHJlc3BvbnNlLnN0YXR1cyA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzIDwgMzAwKXtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3BvbnNlKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpXG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGpzb24ocmVzcG9uc2Upe1xuICByZXR1cm4gcmVzcG9uc2UuanNvbigpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUJ1ZmZlcihyZXNwb25zZSl7XG4gIHJldHVybiByZXNwb25zZS5hcnJheUJ1ZmZlcigpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoSlNPTih1cmwpe1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIGZldGNoKHVybCwge1xuICAgIC8vICAgbW9kZTogJ25vLWNvcnMnXG4gICAgLy8gfSlcbiAgICBmZXRjaCh1cmwpXG4gICAgLnRoZW4oc3RhdHVzKVxuICAgIC50aGVuKGpzb24pXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICByZXNvbHZlKGRhdGEpXG4gICAgfSlcbiAgICAuY2F0Y2goZSA9PiB7XG4gICAgICByZWplY3QoZSlcbiAgICB9KVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hBcnJheWJ1ZmZlcih1cmwpe1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIGZldGNoKHVybCwge1xuICAgIC8vICAgbW9kZTogJ25vLWNvcnMnXG4gICAgLy8gfSlcbiAgICBmZXRjaCh1cmwpXG4gICAgLnRoZW4oc3RhdHVzKVxuICAgIC50aGVuKGFycmF5QnVmZmVyKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgcmVzb2x2ZShkYXRhKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cbiIsImltcG9ydCBxYW1iaSBmcm9tICcuL3FhbWJpJ1xuaW1wb3J0IHtTb25nfSBmcm9tICcuL3NvbmcnXG5pbXBvcnQge1NhbXBsZXJ9IGZyb20gJy4vc2FtcGxlcidcbmltcG9ydCB7aW5pdEF1ZGlvfSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge2luaXRNSURJfSBmcm9tICcuL2luaXRfbWlkaSdcbmltcG9ydCB7dXBkYXRlU2V0dGluZ3N9IGZyb20gJy4vc2V0dGluZ3MnXG5cbmV4cG9ydCBsZXQgZ2V0VXNlck1lZGlhID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWFcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ2dldFVzZXJNZWRpYSBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmV4cG9ydCBsZXQgckFGID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ3JlcXVlc3RBbmltYXRpb25GcmFtZSBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmV4cG9ydCBsZXQgQmxvYiA9ICgoKSA9PiB7XG4gIGlmKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gd2luZG93LkJsb2IgfHwgd2luZG93LndlYmtpdEJsb2JcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLndhcm4oJ0Jsb2IgaXMgbm90IGF2YWlsYWJsZScpXG4gIH1cbn0pKClcblxuXG5mdW5jdGlvbiBsb2FkSW5zdHJ1bWVudChkYXRhKXtcbiAgbGV0IHNhbXBsZXIgPSBuZXcgU2FtcGxlcigpXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgc2FtcGxlci5wYXJzZVNhbXBsZURhdGEoZGF0YSlcbiAgICAudGhlbigoKSA9PiByZXNvbHZlKHNhbXBsZXIpKVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChzZXR0aW5ncyA9IG51bGwpOiB2b2lke1xuXG4gIC8vIGxvYWQgc2V0dGluZ3MuaW5zdHJ1bWVudHMgKGFycmF5IG9yIG9iamVjdClcbiAgLy8gbG9hZCBzZXR0aW5ncy5taWRpZmlsZXMgKGFycmF5IG9yIG9iamVjdClcbiAgLypcblxuICBxYW1iaS5pbml0KHtcbiAgICBzb25nOiB7XG4gICAgICB0eXBlOiAnU29uZycsXG4gICAgICB1cmw6ICcuLi9kYXRhL21pbnV0ZV93YWx0ei5taWQnXG4gICAgfSxcbiAgICBwaWFubzoge1xuICAgICAgdHlwZTogJ0luc3RydW1lbnQnLFxuICAgICAgdXJsOiAnLi4vLi4vaW5zdHJ1bWVudHMvZWxlY3RyaWMtcGlhbm8uanNvbidcbiAgICB9XG4gIH0pXG5cbiAgcWFtYmkuaW5pdCh7XG4gICAgaW5zdHJ1bWVudHM6IFsnLi4vaW5zdHJ1bWVudHMvcGlhbm8nLCAnLi4vaW5zdHJ1bWVudHMvdmlvbGluJ10sXG4gICAgbWlkaWZpbGVzOiBbJy4uL21pZGkvbW96YXJ0Lm1pZCddXG4gIH0pXG4gIC50aGVuKChsb2FkZWQpID0+IHtcbiAgICBsZXQgW3BpYW5vLCB2aW9saW5dID0gbG9hZGVkLmluc3RydW1lbnRzXG4gICAgbGV0IFttb3phcnRdID0gbG9hZGVkLm1pZGlmaWxlc1xuICB9KVxuXG4gICovXG5cbiAgbGV0IHByb21pc2VzID0gW2luaXRBdWRpbygpLCBpbml0TUlESSgpXVxuICBsZXQgbG9hZEtleXNcblxuICBpZihzZXR0aW5ncyAhPT0gbnVsbCl7XG5cbiAgICBsb2FkS2V5cyA9IE9iamVjdC5rZXlzKHNldHRpbmdzKVxuICAgIGxldCBpID0gbG9hZEtleXMuaW5kZXhPZignc2V0dGluZ3MnKVxuICAgIGlmKGkgIT09IC0xKXtcbiAgICAgIHVwZGF0ZVNldHRpbmdzKHNldHRpbmdzLnNldHRpbmdzKVxuICAgICAgbG9hZEtleXMuc3BsaWNlKGksIDEpXG4gICAgfVxuICAgIC8vY29uc29sZS5sb2cobG9hZEtleXMpXG5cbiAgICBmb3IobGV0IGtleSBvZiBsb2FkS2V5cyl7XG5cbiAgICAgIGxldCBkYXRhID0gc2V0dGluZ3Nba2V5XVxuXG4gICAgICBpZihkYXRhLnR5cGUgPT09ICdTb25nJyl7XG4gICAgICAgIHByb21pc2VzLnB1c2goU29uZy5mcm9tTUlESUZpbGUoZGF0YS51cmwpKVxuICAgICAgfWVsc2UgaWYoZGF0YS50eXBlID09PSAnSW5zdHJ1bWVudCcpe1xuICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRJbnN0cnVtZW50KGRhdGEpKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIC50aGVuKFxuICAgIChyZXN1bHQpID0+IHtcblxuICAgICAgbGV0IHJldHVybk9iaiA9IHt9XG5cbiAgICAgIHJlc3VsdC5mb3JFYWNoKChkYXRhLCBpKSA9PiB7XG4gICAgICAgIGlmKGkgPT09IDApe1xuICAgICAgICAgIC8vIHBhcnNlQXVkaW9cbiAgICAgICAgICByZXR1cm5PYmoubGVnYWN5ID0gZGF0YS5sZWdhY3lcbiAgICAgICAgICByZXR1cm5PYmoubXAzID0gZGF0YS5tcDNcbiAgICAgICAgICByZXR1cm5PYmoub2dnID0gZGF0YS5vZ2dcbiAgICAgICAgfWVsc2UgaWYoaSA9PT0gMSl7XG4gICAgICAgICAgLy8gcGFyc2VNSURJXG4gICAgICAgICAgcmV0dXJuT2JqLm1pZGkgPSBkYXRhLm1pZGlcbiAgICAgICAgICByZXR1cm5PYmoud2VibWlkaSA9IGRhdGEud2VibWlkaVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAvLyBJbnN0cnVtZW50cywgc2FtcGxlcyBvciBNSURJIGZpbGVzIHRoYXQgZ290IGxvYWRlZCBkdXJpbmcgaW5pdGlhbGl6YXRpb25cbiAgICAgICAgICAvL3Jlc3VsdFtsb2FkS2V5c1tpIC0gMl1dID0gZGF0YVxuICAgICAgICAgIHJldHVybk9ialtsb2FkS2V5c1tpIC0gMl1dID0gZGF0YVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBjb25zb2xlLmxvZygncWFtYmknLCBxYW1iaS52ZXJzaW9uKVxuICAgICAgcmVzb2x2ZShyZXR1cm5PYmopXG4gICAgfSxcbiAgICAoZXJyb3IpID0+IHtcbiAgICAgIHJlamVjdChlcnJvcilcbiAgICB9KVxuICB9KVxuXG5cbi8qXG4gIFByb21pc2UuYWxsKFtpbml0QXVkaW8oKSwgaW5pdE1JREkoKV0pXG4gIC50aGVuKFxuICAoZGF0YSkgPT4ge1xuICAgIC8vIHBhcnNlQXVkaW9cbiAgICBsZXQgZGF0YUF1ZGlvID0gZGF0YVswXVxuXG4gICAgLy8gcGFyc2VNSURJXG4gICAgbGV0IGRhdGFNaWRpID0gZGF0YVsxXVxuXG4gICAgY2FsbGJhY2soe1xuICAgICAgbGVnYWN5OiBkYXRhQXVkaW8ubGVnYWN5LFxuICAgICAgbXAzOiBkYXRhQXVkaW8ubXAzLFxuICAgICAgb2dnOiBkYXRhQXVkaW8ub2dnLFxuICAgICAgbWlkaTogZGF0YU1pZGkubWlkaSxcbiAgICAgIHdlYm1pZGk6IGRhdGFNaWRpLndlYm1pZGksXG4gICAgfSlcbiAgfSxcbiAgKGVycm9yKSA9PiB7XG4gICAgY2FsbGJhY2soZXJyb3IpXG4gIH0pXG4qL1xufVxuXG4iLCIvKlxuICBTZXRzIHVwIHRoZSBiYXNpYyBhdWRpbyByb3V0aW5nLCB0ZXN0cyB3aGljaCBhdWRpbyBmb3JtYXRzIGFyZSBzdXBwb3J0ZWQgYW5kIHBhcnNlcyB0aGUgc2FtcGxlcyBmb3IgdGhlIG1ldHJvbm9tZSB0aWNrcy5cbiovXG5cbmltcG9ydCBzYW1wbGVzIGZyb20gJy4vc2FtcGxlcydcbmltcG9ydCB7cGFyc2VTYW1wbGVzfSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuXG5sZXQgZGF0YVxubGV0IG1hc3RlckdhaW5cbmxldCBjb21wcmVzc29yXG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZVxuXG5cbmV4cG9ydCBsZXQgY29udGV4dCA9IChmdW5jdGlvbigpe1xuICAvL2NvbnNvbGUubG9nKCdpbml0IEF1ZGlvQ29udGV4dCcpXG4gIGxldCBjdHhcbiAgaWYodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpe1xuICAgIGxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHRcbiAgICBpZihBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKVxuICAgIH1cbiAgfVxuICBpZih0eXBlb2YgY3R4ID09PSAndW5kZWZpbmVkJyl7XG4gICAgLy9AVE9ETzogY3JlYXRlIGR1bW15IEF1ZGlvQ29udGV4dCBmb3IgdXNlIGluIG5vZGUsIHNlZTogaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvYXVkaW8tY29udGV4dFxuICAgIGNvbnRleHQgPSB7XG4gICAgICBjcmVhdGVHYWluOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGdhaW46IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZU9zY2lsbGF0b3I6IGZ1bmN0aW9uKCl7fSxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN0eFxufSgpKVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0QXVkaW8oKXtcblxuICBpZih0eXBlb2YgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW5cbiAgfVxuICAvLyBjaGVjayBmb3Igb2xkZXIgaW1wbGVtZW50YXRpb25zIG9mIFdlYkF1ZGlvXG4gIGRhdGEgPSB7fVxuICBsZXQgc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICBkYXRhLmxlZ2FjeSA9IGZhbHNlXG4gIGlmKHR5cGVvZiBzb3VyY2Uuc3RhcnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBkYXRhLmxlZ2FjeSA9IHRydWVcbiAgfVxuXG4gIC8vIHNldCB1cCB0aGUgZWxlbWVudGFyeSBhdWRpbyBub2Rlc1xuICBjb21wcmVzc29yID0gY29udGV4dC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKVxuICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgbWFzdGVyR2FpbiA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSAwLjVcbiAgaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgIHBhcnNlU2FtcGxlcyhzYW1wbGVzKS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQoYnVmZmVycyl7XG4gICAgICAgIC8vY29uc29sZS5sb2coYnVmZmVycylcbiAgICAgICAgZGF0YS5vZ2cgPSB0eXBlb2YgYnVmZmVycy5lbXB0eU9nZyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgZGF0YS5tcDMgPSB0eXBlb2YgYnVmZmVycy5lbXB0eU1wMyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgZGF0YS5sb3d0aWNrID0gYnVmZmVycy5sb3d0aWNrXG4gICAgICAgIGRhdGEuaGlnaHRpY2sgPSBidWZmZXJzLmhpZ2h0aWNrXG4gICAgICAgIGlmKGRhdGEub2dnID09PSBmYWxzZSAmJiBkYXRhLm1wMyA9PT0gZmFsc2Upe1xuICAgICAgICAgIHJlamVjdCgnTm8gc3VwcG9ydCBmb3Igb2dnIG5vciBtcDMhJylcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZShkYXRhKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25SZWplY3RlZCgpe1xuICAgICAgICByZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIGluaXRpYWxpemluZyBBdWRpbycpXG4gICAgICB9XG4gICAgKVxuICB9KVxufVxuXG5cbmxldCBzZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbih2YWx1ZTogbnVtYmVyID0gMC41KTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBzZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbih2YWx1ZTogbnVtYmVyID0gMC41KXtcbiAgICAgIGlmKHZhbHVlID4gMSl7XG4gICAgICAgIGNvbnNvbGUuaW5mbygnbWF4aW1hbCB2b2x1bWUgaXMgMS4wLCB2b2x1bWUgaXMgc2V0IHRvIDEuMCcpO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB2YWx1ZSA8IDAgPyAwIDogdmFsdWUgPiAxID8gMSA6IHZhbHVlXG4gICAgICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0TWFzdGVyVm9sdW1lKHZhbHVlKVxuICB9XG59XG5cblxubGV0IGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBtYXN0ZXJHYWluLmdhaW4udmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIGdldE1hc3RlclZvbHVtZSgpXG4gIH1cbn1cblxuXG5sZXQgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBjb21wcmVzc29yLnJlZHVjdGlvbi52YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24oKVxuICB9XG59XG5cblxubGV0IGVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihmbGFnOiBib29sZWFuKXtcbiAgICAgIGlmKGZsYWcpe1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb21wcmVzc29yKTtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZW5hYmxlTWFzdGVyQ29tcHJlc3NvcigpXG4gIH1cbn1cblxuXG5sZXQgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGNmZyk6IHZvaWR7XG4gIC8qXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gYXR0YWNrOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0ga25lZTsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByYXRpbzsgLy8gdW5pdC1sZXNzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVkdWN0aW9uOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlbGVhc2U7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSB0aHJlc2hvbGQ7IC8vIGluIERlY2liZWxzXG5cbiAgICBAc2VlOiBodHRwOi8vd2ViYXVkaW8uZ2l0aHViLmlvL3dlYi1hdWRpby1hcGkvI3RoZS1keW5hbWljc2NvbXByZXNzb3Jub2RlLWludGVyZmFjZVxuICAqL1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihjZmc6IHt9KXtcbiAgICAgICh7XG4gICAgICAgIGF0dGFjazogY29tcHJlc3Nvci5hdHRhY2sgPSAwLjAwMyxcbiAgICAgICAga25lZTogY29tcHJlc3Nvci5rbmVlID0gMzAsXG4gICAgICAgIHJhdGlvOiBjb21wcmVzc29yLnJhdGlvID0gMTIsXG4gICAgICAgIHJlZHVjdGlvbjogY29tcHJlc3Nvci5yZWR1Y3Rpb24gPSAwLFxuICAgICAgICByZWxlYXNlOiBjb21wcmVzc29yLnJlbGVhc2UgPSAwLjI1MCxcbiAgICAgICAgdGhyZXNob2xkOiBjb21wcmVzc29yLnRocmVzaG9sZCA9IC0yNCxcbiAgICAgIH0gPSBjZmcpXG4gICAgfVxuICAgIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IoY2ZnKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbml0RGF0YSgpe1xuICByZXR1cm4gZGF0YVxufVxuXG4vLyB0aGlzIGRvZXNuJ3Qgc2VlbSB0byBiZSBuZWNlc3NhcnkgYW55bW9yZSBvbiBpT1MgYW55bW9yZVxubGV0IHVubG9ja1dlYkF1ZGlvID0gZnVuY3Rpb24oKXtcbiAgbGV0IHNyYyA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpXG4gIGxldCBnYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gIGdhaW5Ob2RlLmdhaW4udmFsdWUgPSAwXG4gIHNyYy5jb25uZWN0KGdhaW5Ob2RlKVxuICBnYWluTm9kZS5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIGlmKHR5cGVvZiBzcmMubm90ZU9uICE9PSAndW5kZWZpbmVkJyl7XG4gICAgc3JjLnN0YXJ0ID0gc3JjLm5vdGVPblxuICAgIHNyYy5zdG9wID0gc3JjLm5vdGVPZmZcbiAgfVxuICBzcmMuc3RhcnQoMClcbiAgc3JjLnN0b3AoMC4wMDEpXG4gIHVubG9ja1dlYkF1ZGlvID0gZnVuY3Rpb24oKXtcbiAgICAvL2NvbnNvbGUubG9nKCdhbHJlYWR5IGRvbmUnKVxuICB9XG59XG5cbmV4cG9ydCB7bWFzdGVyR2FpbiwgdW5sb2NrV2ViQXVkaW8sIGNvbXByZXNzb3IgYXMgbWFzdGVyQ29tcHJlc3Nvciwgc2V0TWFzdGVyVm9sdW1lLCBnZXRNYXN0ZXJWb2x1bWUsIGdldENvbXByZXNzaW9uUmVkdWN0aW9uLCBlbmFibGVNYXN0ZXJDb21wcmVzc29yLCBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yfVxuIiwiLypcbiAgUmVxdWVzdHMgTUlESSBhY2Nlc3MsIHF1ZXJpZXMgYWxsIGlucHV0cyBhbmQgb3V0cHV0cyBhbmQgc3RvcmVzIHRoZW0gaW4gYWxwaGFiZXRpY2FsIG9yZGVyXG4qL1xuXG5pbXBvcnQge3R5cGVTdHJpbmd9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAnd2VibWlkaWFwaXNoaW0nIC8vIHlvdSBjYW4gYWxzbyBlbWJlZCB0aGUgc2hpbSBhcyBhIHN0YW5kLWFsb25lIHNjcmlwdCBpbiB0aGUgaHRtbCwgdGhlbiB5b3UgY2FuIGNvbW1lbnQgdGhpcyBsaW5lIG91dFxuXG5sZXQgTUlESUFjY2Vzc1xubGV0IGluaXRpYWxpemVkID0gZmFsc2VcbmxldCBpbnB1dHMgPSBbXVxubGV0IG91dHB1dHMgPSBbXVxubGV0IGlucHV0SWRzID0gW11cbmxldCBvdXRwdXRJZHMgPSBbXVxubGV0IGlucHV0c0J5SWQgPSBuZXcgTWFwKClcbmxldCBvdXRwdXRzQnlJZCA9IG5ldyBNYXAoKVxuXG5sZXQgc29uZ01pZGlFdmVudExpc3RlbmVyXG5sZXQgbWlkaUV2ZW50TGlzdGVuZXJJZCA9IDBcblxuXG5mdW5jdGlvbiBnZXRNSURJcG9ydHMoKXtcbiAgaW5wdXRzID0gQXJyYXkuZnJvbShNSURJQWNjZXNzLmlucHV0cy52YWx1ZXMoKSlcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgaW5wdXRzLnNvcnQoKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xKVxuXG4gIGZvcihsZXQgcG9ydCBvZiBpbnB1dHMpe1xuICAgIGlucHV0c0J5SWQuc2V0KHBvcnQuaWQsIHBvcnQpXG4gICAgaW5wdXRJZHMucHVzaChwb3J0LmlkKVxuICB9XG5cbiAgb3V0cHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5vdXRwdXRzLnZhbHVlcygpKVxuXG4gIC8vc29ydCBwb3J0cyBieSBuYW1lIGFzY2VuZGluZ1xuICBvdXRwdXRzLnNvcnQoKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xKVxuXG4gIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgZm9yKGxldCBwb3J0IG9mIG91dHB1dHMpe1xuICAgIC8vY29uc29sZS5sb2cocG9ydC5pZCwgcG9ydC5uYW1lKVxuICAgIG91dHB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KVxuICAgIG91dHB1dElkcy5wdXNoKHBvcnQuaWQpXG4gIH1cbiAgLy9jb25zb2xlLmxvZyhvdXRwdXRzQnlJZClcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdE1JREkoKXtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIGlmKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgcmVzb2x2ZSh7bWlkaTogZmFsc2V9KVxuICAgIH1lbHNlIGlmKHR5cGVvZiBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MgIT09ICd1bmRlZmluZWQnKXtcblxuICAgICAgbGV0IGphenosIG1pZGksIHdlYm1pZGlcblxuICAgICAgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzKCkudGhlbihcblxuICAgICAgICBmdW5jdGlvbiBvbkZ1bEZpbGxlZChtaWRpQWNjZXNzKXtcbiAgICAgICAgICBNSURJQWNjZXNzID0gbWlkaUFjY2Vzc1xuICAgICAgICAgIGlmKHR5cGVvZiBtaWRpQWNjZXNzLl9qYXp6SW5zdGFuY2VzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBqYXp6ID0gbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlc1swXS5fSmF6ei52ZXJzaW9uXG4gICAgICAgICAgICBtaWRpID0gdHJ1ZVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgd2VibWlkaSA9IHRydWVcbiAgICAgICAgICAgIG1pZGkgPSB0cnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZ2V0TUlESXBvcnRzKClcblxuICAgICAgICAgIC8vIG9uY29ubmVjdCBhbmQgb25kaXNjb25uZWN0IGFyZSBub3QgeWV0IGltcGxlbWVudGVkIGluIENocm9tZSBhbmQgQ2hyb21pdW1cbiAgICAgICAgICBtaWRpQWNjZXNzLm9uY29ubmVjdCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBjb25uZWN0ZWQnLCBlKVxuICAgICAgICAgICAgZ2V0TUlESXBvcnRzKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtaWRpQWNjZXNzLm9uZGlzY29ubmVjdCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBkaXNjb25uZWN0ZWQnLCBlKVxuICAgICAgICAgICAgZ2V0TUlESXBvcnRzKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgIGphenosXG4gICAgICAgICAgICBtaWRpLFxuICAgICAgICAgICAgd2VibWlkaSxcbiAgICAgICAgICAgIGlucHV0cyxcbiAgICAgICAgICAgIG91dHB1dHMsXG4gICAgICAgICAgICBpbnB1dHNCeUlkLFxuICAgICAgICAgICAgb3V0cHV0c0J5SWQsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGUpXG4gICAgICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSByZXF1ZXN0aW5nIE1JRElBY2Nlc3MnLCBlKVxuICAgICAgICB9XG4gICAgICApXG4gICAgLy8gYnJvd3NlcnMgd2l0aG91dCBXZWJNSURJIEFQSVxuICAgIH1lbHNle1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICByZXNvbHZlKHttaWRpOiBmYWxzZX0pXG4gICAgfVxuICB9KVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUFjY2VzcyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUFjY2VzcyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gTUlESUFjY2Vzc1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUFjY2VzcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESU91dHB1dHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG91dHB1dHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElPdXRwdXRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElJbnB1dHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElJbnB1dHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGlucHV0c1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0cygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESU91dHB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0SWRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJT3V0cHV0SWRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElJbnB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBpbnB1dElkc1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0SWRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRCeUlkID0gZnVuY3Rpb24oaWQ6IHN0cmluZyl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbihfaWQpe1xuICAgICAgcmV0dXJuIG91dHB1dHNCeUlkLmdldChfaWQpXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJT3V0cHV0QnlJZChpZClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElJbnB1dEJ5SWQgPSBmdW5jdGlvbihpZDogc3RyaW5nKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24oX2lkKXtcbiAgICAgIHJldHVybiBpbnB1dHNCeUlkLmdldChfaWQpXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRCeUlkKGlkKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gaW5pdE1pZGlTb25nKHNvbmcpe1xuXG4gIHNvbmdNaWRpRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGUpe1xuICAgIC8vY29uc29sZS5sb2coZSlcbiAgICBoYW5kbGVNaWRpTWVzc2FnZVNvbmcoc29uZywgZSwgdGhpcyk7XG4gIH07XG5cbiAgLy8gYnkgZGVmYXVsdCBhIHNvbmcgbGlzdGVucyB0byBhbGwgYXZhaWxhYmxlIG1pZGktaW4gcG9ydHNcbiAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgcG9ydC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG5cbiAgb3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaUlucHV0U29uZyhzb25nLCBpZCwgZmxhZyl7XG4gIGxldCBpbnB1dCA9IGlucHV0cy5nZXQoaWQpO1xuXG4gIGlmKGlucHV0ID09PSB1bmRlZmluZWQpe1xuICAgIHdhcm4oJ25vIG1pZGkgaW5wdXQgd2l0aCBpZCcsIGlkLCAnZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihmbGFnID09PSBmYWxzZSl7XG4gICAgc29uZy5taWRpSW5wdXRzLmRlbGV0ZShpZCk7XG4gICAgaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICB9ZWxzZXtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KGlkLCBpbnB1dCk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaUlucHV0KGlkLCBmbGFnKTtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpT3V0cHV0U29uZyhzb25nLCBpZCwgZmxhZyl7XG4gIGxldCBvdXRwdXQgPSBvdXRwdXRzLmdldChpZCk7XG5cbiAgaWYob3V0cHV0ID09PSB1bmRlZmluZWQpe1xuICAgIHdhcm4oJ25vIG1pZGkgb3V0cHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaU91dHB1dHMuZGVsZXRlKGlkKTtcbiAgICBsZXQgdGltZSA9IHNvbmcuc2NoZWR1bGVyLmxhc3RFdmVudFRpbWUgKyAxMDA7XG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aW1lKTsgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWUpOyAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQoaWQsIG91dHB1dCk7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpT3V0cHV0KGlkLCBmbGFnKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBtaWRpTWVzc2FnZUV2ZW50LCBpbnB1dCl7XG4gIGxldCBtaWRpRXZlbnQgPSBuZXcgTWlkaUV2ZW50KHNvbmcudGlja3MsIC4uLm1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIC8vY29uc29sZS5sb2codHJhY2subWlkaUlucHV0cywgaW5wdXQpO1xuXG5cbiAgICAvL2lmKG1pZGlFdmVudC5jaGFubmVsID09PSB0cmFjay5jaGFubmVsIHx8IHRyYWNrLmNoYW5uZWwgPT09IDAgfHwgdHJhY2suY2hhbm5lbCA9PT0gJ2FueScpe1xuICAgIC8vICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2spO1xuICAgIC8vfVxuXG5cbiAgICAvLyBsaWtlIGluIEN1YmFzZSwgbWlkaSBldmVudHMgZnJvbSBhbGwgZGV2aWNlcywgc2VudCBvbiBhbnkgbWlkaSBjaGFubmVsIGFyZSBmb3J3YXJkZWQgdG8gYWxsIHRyYWNrc1xuICAgIC8vIHNldCB0cmFjay5tb25pdG9yIHRvIGZhbHNlIGlmIHlvdSBkb24ndCB3YW50IHRvIHJlY2VpdmUgbWlkaSBldmVudHMgb24gYSBjZXJ0YWluIHRyYWNrXG4gICAgLy8gbm90ZSB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYnkgZGVmYXVsdCBzZXQgdG8gZmFsc2UgYW5kIHRoYXQgdHJhY2subW9uaXRvciBpcyBhdXRvbWF0aWNhbGx5IHNldCB0byB0cnVlXG4gICAgLy8gaWYgeW91IGFyZSByZWNvcmRpbmcgb24gdGhhdCB0cmFja1xuICAgIC8vY29uc29sZS5sb2codHJhY2subW9uaXRvciwgdHJhY2suaWQsIGlucHV0LmlkKTtcbiAgICBpZih0cmFjay5tb25pdG9yID09PSB0cnVlICYmIHRyYWNrLm1pZGlJbnB1dHMuZ2V0KGlucHV0LmlkKSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjaywgaW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBsaXN0ZW5lcnMgPSBzb25nLm1pZGlFdmVudExpc3RlbmVycy5nZXQobWlkaUV2ZW50LnR5cGUpO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgZm9yKGxldCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpe1xuICAgICAgbGlzdGVuZXIobWlkaUV2ZW50LCBpbnB1dCk7XG4gICAgfVxuICB9XG59XG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayh0cmFjaywgbWlkaUV2ZW50LCBpbnB1dCl7XG4gIGxldCBzb25nID0gdHJhY2suc29uZyxcbiAgICBub3RlLCBsaXN0ZW5lcnMsIGNoYW5uZWw7XG4gICAgLy9kYXRhID0gbWlkaU1lc3NhZ2VFdmVudC5kYXRhLFxuICAgIC8vbWlkaUV2ZW50ID0gY3JlYXRlTWlkaUV2ZW50KHNvbmcudGlja3MsIGRhdGFbMF0sIGRhdGFbMV0sIGRhdGFbMl0pO1xuXG4gIC8vbWlkaUV2ZW50LnNvdXJjZSA9IG1pZGlNZXNzYWdlRXZlbnQuc3JjRWxlbWVudC5uYW1lO1xuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQpXG4gIC8vY29uc29sZS5sb2coJy0tLS0+JywgbWlkaUV2ZW50LnR5cGUpO1xuXG4gIC8vIGFkZCB0aGUgZXhhY3QgdGltZSBvZiB0aGlzIGV2ZW50IHNvIHdlIGNhbiBjYWxjdWxhdGUgaXRzIHRpY2tzIHBvc2l0aW9uXG4gIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMDsgLy8gbWlsbGlzXG4gIG1pZGlFdmVudC5zdGF0ZSA9ICdyZWNvcmRlZCc7XG5cbiAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgbm90ZSA9IGNyZWF0ZU1pZGlOb3RlKG1pZGlFdmVudCk7XG4gICAgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXSA9IG5vdGU7XG4gICAgLy90cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdID0gbm90ZTtcbiAgfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgbm90ZSA9IHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy8gY2hlY2sgaWYgdGhlIG5vdGUgZXhpc3RzOiBpZiB0aGUgdXNlciBwbGF5cyBub3RlcyBvbiBoZXIga2V5Ym9hcmQgYmVmb3JlIHRoZSBtaWRpIHN5c3RlbSBoYXNcbiAgICAvLyBiZWVuIGZ1bGx5IGluaXRpYWxpemVkLCBpdCBjYW4gaGFwcGVuIHRoYXQgdGhlIGZpcnN0IGluY29taW5nIG1pZGkgZXZlbnQgaXMgYSBOT1RFIE9GRiBldmVudFxuICAgIGlmKG5vdGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5vdGUuYWRkTm90ZU9mZihtaWRpRXZlbnQpO1xuICAgIGRlbGV0ZSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vZGVsZXRlIHRyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF07XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKHNvbmcucHJlcm9sbCwgc29uZy5yZWNvcmRpbmcsIHRyYWNrLnJlY29yZEVuYWJsZWQpO1xuXG4gIGlmKChzb25nLnByZXJvbGxpbmcgfHwgc29uZy5yZWNvcmRpbmcpICYmIHRyYWNrLnJlY29yZEVuYWJsZWQgPT09ICdtaWRpJyl7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICB0cmFjay5zb25nLnJlY29yZGVkTm90ZXMucHVzaChub3RlKTtcbiAgICB9XG4gICAgdHJhY2sucmVjb3JkUGFydC5hZGRFdmVudChtaWRpRXZlbnQpO1xuICAgIC8vIHNvbmcucmVjb3JkZWRFdmVudHMgaXMgdXNlZCBpbiB0aGUga2V5IGVkaXRvclxuICAgIHRyYWNrLnNvbmcucmVjb3JkZWRFdmVudHMucHVzaChtaWRpRXZlbnQpO1xuICB9ZWxzZSBpZih0cmFjay5lbmFibGVSZXRyb3NwZWN0aXZlUmVjb3JkaW5nKXtcbiAgICB0cmFjay5yZXRyb3NwZWN0aXZlUmVjb3JkaW5nLnB1c2gobWlkaUV2ZW50KTtcbiAgfVxuXG4gIC8vIGNhbGwgYWxsIG1pZGkgZXZlbnQgbGlzdGVuZXJzXG4gIGxpc3RlbmVycyA9IHRyYWNrLm1pZGlFdmVudExpc3RlbmVyc1ttaWRpRXZlbnQudHlwZV07XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBvYmplY3RGb3JFYWNoKGxpc3RlbmVycywgZnVuY3Rpb24obGlzdGVuZXIpe1xuICAgICAgbGlzdGVuZXIobWlkaUV2ZW50LCBpbnB1dCk7XG4gICAgfSk7XG4gIH1cblxuICBjaGFubmVsID0gdHJhY2suY2hhbm5lbDtcbiAgaWYoY2hhbm5lbCA9PT0gJ2FueScgfHwgY2hhbm5lbCA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKGNoYW5uZWwpID09PSB0cnVlKXtcbiAgICBjaGFubmVsID0gMDtcbiAgfVxuXG4gIG9iamVjdEZvckVhY2godHJhY2subWlkaU91dHB1dHMsIGZ1bmN0aW9uKG91dHB1dCl7XG4gICAgLy9jb25zb2xlLmxvZygnbWlkaSBvdXQnLCBvdXRwdXQsIG1pZGlFdmVudC50eXBlKTtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4IHx8IG1pZGlFdmVudC50eXBlID09PSAxNDQgfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMik7XG4gICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gICAgLy8gfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE5Mil7XG4gICAgLy8gICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMV0pO1xuICAgIH1cbiAgICAvL291dHB1dC5zZW5kKFttaWRpRXZlbnQuc3RhdHVzICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgfSk7XG5cbiAgLy8gQFRPRE86IG1heWJlIGEgdHJhY2sgc2hvdWxkIGJlIGFibGUgdG8gc2VuZCBpdHMgZXZlbnQgdG8gYm90aCBhIG1pZGktb3V0IHBvcnQgYW5kIGFuIGludGVybmFsIGhlYXJ0YmVhdCBzb25nP1xuICAvL2NvbnNvbGUubG9nKHRyYWNrLnJvdXRlVG9NaWRpT3V0KTtcbiAgaWYodHJhY2sucm91dGVUb01pZGlPdXQgPT09IGZhbHNlKXtcbiAgICBtaWRpRXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICB0cmFjay5pbnN0cnVtZW50LnByb2Nlc3NFdmVudChtaWRpRXZlbnQpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gYWRkTWlkaUV2ZW50TGlzdGVuZXIoLi4uYXJncyl7IC8vIGNhbGxlciBjYW4gYmUgYSB0cmFjayBvciBhIHNvbmdcblxuICBsZXQgaWQgPSBtaWRpRXZlbnRMaXN0ZW5lcklkKys7XG4gIGxldCBsaXN0ZW5lcjtcbiAgICB0eXBlcyA9IHt9LFxuICAgIGlkcyA9IFtdLFxuICAgIGxvb3A7XG5cblxuICAvLyBzaG91bGQgSSBpbmxpbmUgdGhpcz9cbiAgbG9vcCA9IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgIGZvcihsZXQgYXJnIG9mIGFyZ3Mpe1xuICAgICAgbGV0IHR5cGUgPSB0eXBlU3RyaW5nKGFyZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgICAgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgIGxvb3AoYXJnKTtcbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdmdW5jdGlvbicpe1xuICAgICAgICBsaXN0ZW5lciA9IGFyZztcbiAgICAgIH1lbHNlIGlmKGlzTmFOKGFyZykgPT09IGZhbHNlKXtcbiAgICAgICAgYXJnID0gcGFyc2VJbnQoYXJnLCAxMCk7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpe1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIGFyZyA9IHNlcXVlbmNlci5taWRpRXZlbnROdW1iZXJCeU5hbWUoYXJnKTtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGxvb3AoYXJncywgMCwgYXJncy5sZW5ndGgpO1xuICAvL2NvbnNvbGUubG9nKCd0eXBlcycsIHR5cGVzLCAnbGlzdGVuZXInLCBsaXN0ZW5lcik7XG5cbiAgb2JqZWN0Rm9yRWFjaCh0eXBlcywgZnVuY3Rpb24odHlwZSl7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICBpZihvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID09PSB1bmRlZmluZWQpe1xuICAgICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9IHt9O1xuICAgIH1cbiAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdW2lkXSA9IGxpc3RlbmVyO1xuICAgIGlkcy5wdXNoKHR5cGUgKyAnXycgKyBpZCk7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2cob2JqLm1pZGlFdmVudExpc3RlbmVycyk7XG4gIHJldHVybiBpZHMubGVuZ3RoID09PSAxID8gaWRzWzBdIDogaWRzO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVyKGlkLCBvYmope1xuICB2YXIgdHlwZTtcbiAgaWQgPSBpZC5zcGxpdCgnXycpO1xuICB0eXBlID0gaWRbMF07XG4gIGlkID0gaWRbMV07XG4gIGRlbGV0ZSBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdW2lkXTtcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcnMoKXtcblxufVxuXG4qL1xuIiwiaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcblxuZXhwb3J0IGNsYXNzIEluc3RydW1lbnR7XG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXVxuICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG4gICAgdGhpcy5vdXRwdXQgPSBudWxsXG4gIH1cblxuICAvLyBtYW5kYXRvcnlcbiAgY29ubmVjdChvdXRwdXQpe1xuICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0XG4gIH1cblxuICAvLyBtYW5kYXRvcnlcbiAgZGlzY29ubmVjdCgpe1xuICAgIHRoaXMub3V0cHV0ID0gbnVsbFxuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQpe1xuICAgIGxldCB0aW1lID0gZXZlbnQudGltZSAvIDEwMDBcbiAgICBsZXQgc2FtcGxlXG5cbiAgICBpZihpc05hTih0aW1lKSl7XG4gICAgICAvLyB0aGlzIHNob3VsZG4ndCBoYXBwZW5cbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2ludmFsaWQgdGltZSB2YWx1ZScpXG4gICAgICByZXR1cm5cbiAgICAgIC8vdGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVcbiAgICB9XG5cbiAgICBpZih0aW1lID09PSAwKXtcbiAgICAgIC8vIHRoaXMgc2hvdWxkbid0IGhhcHBlbiAtPiBleHRlcm5hbCBNSURJIGtleWJvYXJkc1xuICAgICAgY29uc29sZS5lcnJvcignc2hvdWxkIG5vdCBoYXBwZW4nKVxuICAgICAgdGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVcbiAgICB9XG5cbiAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgLy9jb25zb2xlLmxvZygxNDQsICc6JywgdGltZSwgY29udGV4dC5jdXJyZW50VGltZSwgZXZlbnQubWlsbGlzKVxuXG4gICAgICBzYW1wbGUgPSB0aGlzLmNyZWF0ZVNhbXBsZShldmVudClcbiAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgc2FtcGxlKVxuICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGUpXG4gICAgICBzYW1wbGUub3V0cHV0LmNvbm5lY3QodGhpcy5vdXRwdXQpXG4gICAgICBzYW1wbGUuc3RhcnQodGltZSlcbiAgICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxpbmcnLCBldmVudC5pZCwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIC8vY29uc29sZS5sb2coJ3N0YXJ0JywgZXZlbnQubWlkaU5vdGVJZClcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgLy9jb25zb2xlLmxvZygxMjgsICc6JywgdGltZSwgY29udGV4dC5jdXJyZW50VGltZSwgZXZlbnQubWlsbGlzKVxuICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmdldChldmVudC5taWRpTm90ZUlkKVxuICAgICAgaWYodHlwZW9mIHNhbXBsZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbygnc2FtcGxlIG5vdCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZCwgJyBtaWRpTm90ZScsIGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0aGF0IHRoZSBzdXN0YWluIHBlZGFsIHByZXZlbnRzIHRoZSBhbiBldmVudCB0byB1bnNjaGVkdWxlZFxuICAgICAgaWYodGhpcy5zdXN0YWluUGVkYWxEb3duID09PSB0cnVlKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkKVxuICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMucHVzaChldmVudC5taWRpTm90ZUlkKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsICgpID0+IHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnc3RvcCcsIHRpbWUsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmRlbGV0ZShldmVudC5taWRpTm90ZUlkKVxuICAgICAgICB9KVxuICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICB9XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vIHN1c3RhaW4gcGVkYWxcbiAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IHRydWVcbiAgICAgICAgICAvLy8qXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgIGRhdGE6ICdkb3duJ1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8qL1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgZG93bicpXG4gICAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5mb3JFYWNoKChtaWRpTm90ZUlkKSA9PiB7XG4gICAgICAgICAgICBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZ2V0KG1pZGlOb3RlSWQpXG4gICAgICAgICAgICBpZihzYW1wbGUpe1xuICAgICAgICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICAgICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wJywgbWlkaU5vdGVJZClcbiAgICAgICAgICAgICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZGVsZXRlKG1pZGlOb3RlSWQpXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIHVwJywgdGhpcy5zdXN0YWluZWRTYW1wbGVzKVxuICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgICAgICAgLy8vKlxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbCcsXG4gICAgICAgICAgICBkYXRhOiAndXAnXG4gICAgICAgICAgfSlcbiAgICAgICAgICAvLyovXG4gICAgICAgICAgLy90aGlzLnN0b3BTdXN0YWluKHRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgIC8vIHBhbm5pbmdcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGExID09PSAxMCl7XG4gICAgICAgIC8vIHBhbm5pbmcgaXMgKm5vdCogZXhhY3RseSB0aW1lZCAtPiBub3QgcG9zc2libGUgKHlldCkgd2l0aCBXZWJBdWRpb1xuICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEyLCByZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuICAgICAgICAvL3RyYWNrLnNldFBhbm5pbmcocmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcblxuICAgICAgLy8gdm9sdW1lXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gNyl7XG4gICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICBpZih0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpe1xuICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICBkYXRhOiAndXAnXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmZvckVhY2goc2FtcGxlID0+IHtcbiAgICAgIHNhbXBsZS5zdG9wKGNvbnRleHQuY3VycmVudFRpbWUpXG4gICAgfSlcbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuY2xlYXIoKVxuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG4gIHVuc2NoZWR1bGUobWlkaUV2ZW50KXtcbiAgICBsZXQgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmdldChtaWRpRXZlbnQubWlkaU5vdGVJZClcbiAgICBpZihzYW1wbGUpe1xuICAgICAgc2FtcGxlLnN0b3AoY29udGV4dC5jdXJyZW50VGltZSlcbiAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5kZWxldGUobWlkaUV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQge1RyYWNrfSBmcm9tICcuL3RyYWNrJ1xuaW1wb3J0IHtQYXJ0fSBmcm9tICcuL3BhcnQnXG5pbXBvcnQge3BhcnNlRXZlbnRzLCBwYXJzZU1JRElOb3Rlc30gZnJvbSAnLi9wYXJzZV9ldmVudHMnXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtjaGVja01JRElOdW1iZXJ9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y2FsY3VsYXRlUG9zaXRpb259IGZyb20gJy4vcG9zaXRpb24nXG5pbXBvcnQge1NhbXBsZXJ9IGZyb20gJy4vc2FtcGxlcidcbmltcG9ydCB7Z2V0SW5pdERhdGF9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7TUlESUV2ZW50VHlwZXN9IGZyb20gJy4vY29uc3RhbnRzJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwnXG5cblxubGV0XG4gIG1ldGhvZE1hcCA9IG5ldyBNYXAoW1xuICAgIFsndm9sdW1lJywgJ3NldFZvbHVtZSddLFxuICAgIFsnaW5zdHJ1bWVudCcsICdzZXRJbnN0cnVtZW50J10sXG4gICAgWydub3RlTnVtYmVyQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2snXSxcbiAgICBbJ25vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2snLCAnc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljayddLFxuICAgIFsndmVsb2NpdHlBY2NlbnRlZFRpY2snLCAnc2V0VmVsb2NpdHlBY2NlbnRlZFRpY2snXSxcbiAgICBbJ3ZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrJywgJ3NldFZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTGVuZ3RoQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVMZW5ndGhBY2NlbnRlZFRpY2snXSxcbiAgICBbJ25vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snLCAnc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayddXG4gIF0pO1xuXG5leHBvcnQgY2xhc3MgTWV0cm9ub21le1xuXG4gIGNvbnN0cnVjdG9yKHNvbmcpe1xuICAgIHRoaXMuc29uZyA9IHNvbmdcbiAgICB0aGlzLnRyYWNrID0gbmV3IFRyYWNrKHtuYW1lOiB0aGlzLnNvbmcuaWQgKyAnX21ldHJvbm9tZSd9KVxuICAgIHRoaXMucGFydCA9IG5ldyBQYXJ0KClcbiAgICB0aGlzLnRyYWNrLmFkZFBhcnRzKHRoaXMucGFydClcbiAgICB0aGlzLnRyYWNrLmNvbm5lY3QodGhpcy5zb25nLl9vdXRwdXQpXG5cbiAgICB0aGlzLmV2ZW50cyA9IFtdXG4gICAgdGhpcy5wcmVjb3VudEV2ZW50cyA9IFtdXG4gICAgdGhpcy5wcmVjb3VudER1cmF0aW9uID0gMFxuICAgIHRoaXMuYmFycyA9IDBcbiAgICB0aGlzLmluZGV4ID0gMFxuICAgIHRoaXMuaW5kZXgyID0gMFxuICAgIHRoaXMucHJlY291bnRJbmRleCA9IDBcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuXG4gIHJlc2V0KCl7XG5cbiAgICBsZXQgZGF0YSA9IGdldEluaXREYXRhKClcbiAgICBsZXQgaW5zdHJ1bWVudCA9IG5ldyBTYW1wbGVyKCdtZXRyb25vbWUnKVxuICAgIGluc3RydW1lbnQudXBkYXRlU2FtcGxlRGF0YSh7XG4gICAgICBub3RlOiA2MCxcbiAgICAgIGJ1ZmZlcjogZGF0YS5sb3d0aWNrLFxuICAgIH0sIHtcbiAgICAgIG5vdGU6IDYxLFxuICAgICAgYnVmZmVyOiBkYXRhLmhpZ2h0aWNrLFxuICAgIH0pXG4gICAgdGhpcy50cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpXG5cbiAgICB0aGlzLnZvbHVtZSA9IDFcblxuICAgIHRoaXMubm90ZU51bWJlckFjY2VudGVkID0gNjFcbiAgICB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZCA9IDYwXG5cbiAgICB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgPSAxMDBcbiAgICB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQgPSAxMDBcblxuICAgIHRoaXMubm90ZUxlbmd0aEFjY2VudGVkID0gdGhpcy5zb25nLnBwcSAvIDQgLy8gc2l4dGVlbnRoIG5vdGVzIC0+IGRvbid0IG1ha2UgdGhpcyB0b28gc2hvcnQgaWYgeW91ciBzYW1wbGUgaGFzIGEgbG9uZyBhdHRhY2shXG4gICAgdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQgPSB0aGlzLnNvbmcucHBxIC8gNFxuICB9XG5cbiAgY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIGlkID0gJ2luaXQnKXtcbiAgICBsZXQgaSwgalxuICAgIGxldCBwb3NpdGlvblxuICAgIGxldCB2ZWxvY2l0eVxuICAgIGxldCBub3RlTGVuZ3RoXG4gICAgbGV0IG5vdGVOdW1iZXJcbiAgICBsZXQgYmVhdHNQZXJCYXJcbiAgICBsZXQgdGlja3NQZXJCZWF0XG4gICAgbGV0IHRpY2tzID0gMFxuICAgIGxldCBub3RlT24sIG5vdGVPZmZcbiAgICBsZXQgZXZlbnRzID0gW11cblxuICAgIC8vY29uc29sZS5sb2coc3RhcnRCYXIsIGVuZEJhcik7XG5cbiAgICBmb3IoaSA9IHN0YXJ0QmFyOyBpIDw9IGVuZEJhcjsgaSsrKXtcbiAgICAgIHBvc2l0aW9uID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcy5zb25nLCB7XG4gICAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgICB0YXJnZXQ6IFtpXSxcbiAgICAgIH0pXG5cbiAgICAgIGJlYXRzUGVyQmFyID0gcG9zaXRpb24ubm9taW5hdG9yXG4gICAgICB0aWNrc1BlckJlYXQgPSBwb3NpdGlvbi50aWNrc1BlckJlYXRcbiAgICAgIHRpY2tzID0gcG9zaXRpb24udGlja3NcblxuICAgICAgZm9yKGogPSAwOyBqIDwgYmVhdHNQZXJCYXI7IGorKyl7XG5cbiAgICAgICAgbm90ZU51bWJlciA9IGogPT09IDAgPyB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA6IHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkXG4gICAgICAgIG5vdGVMZW5ndGggPSBqID09PSAwID8gdGhpcy5ub3RlTGVuZ3RoQWNjZW50ZWQgOiB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZFxuICAgICAgICB2ZWxvY2l0eSA9IGogPT09IDAgPyB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgOiB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWRcblxuICAgICAgICBub3RlT24gPSBuZXcgTUlESUV2ZW50KHRpY2tzLCAxNDQsIG5vdGVOdW1iZXIsIHZlbG9jaXR5KVxuICAgICAgICBub3RlT2ZmID0gbmV3IE1JRElFdmVudCh0aWNrcyArIG5vdGVMZW5ndGgsIDEyOCwgbm90ZU51bWJlciwgMClcblxuICAgICAgICBpZihpZCA9PT0gJ3ByZWNvdW50Jyl7XG4gICAgICAgICAgbm90ZU9uLl90cmFjayA9IHRoaXMudHJhY2tcbiAgICAgICAgICBub3RlT2ZmLl90cmFjayA9IHRoaXMudHJhY2tcbiAgICAgICAgICBub3RlT24uX3BhcnQgPSB7fVxuICAgICAgICAgIG5vdGVPZmYuX3BhcnQgPSB7fVxuICAgICAgICB9XG5cbiAgICAgICAgZXZlbnRzLnB1c2gobm90ZU9uLCBub3RlT2ZmKVxuICAgICAgICB0aWNrcyArPSB0aWNrc1BlckJlYXRcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXZlbnRzXG4gIH1cblxuXG4gIGdldEV2ZW50cyhzdGFydEJhciA9IDEsIGVuZEJhciA9IHRoaXMuc29uZy5iYXJzLCBpZCA9ICdpbml0Jyl7XG4gICAgdGhpcy5wYXJ0LnJlbW92ZUV2ZW50cyh0aGlzLnBhcnQuZ2V0RXZlbnRzKCkpXG4gICAgdGhpcy5ldmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZClcbiAgICB0aGlzLnBhcnQuYWRkRXZlbnRzKC4uLnRoaXMuZXZlbnRzKVxuICAgIHRoaXMuYmFycyA9IHRoaXMuc29uZy5iYXJzXG4gICAgLy9jb25zb2xlLmxvZygnZ2V0RXZlbnRzICVPJywgdGhpcy5ldmVudHMpXG4gICAgdGhpcy5hbGxFdmVudHMgPSBbLi4udGhpcy5ldmVudHMsIC4uLnRoaXMuc29uZy5fdGltZUV2ZW50c11cbiAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmFsbEV2ZW50cylcbiAgICBzb3J0RXZlbnRzKHRoaXMuYWxsRXZlbnRzKVxuICAgIHBhcnNlTUlESU5vdGVzKHRoaXMuZXZlbnRzKVxuICAgIHJldHVybiB0aGlzLmV2ZW50c1xuICB9XG5cblxuICBzZXRJbmRleDIobWlsbGlzKXtcbiAgICB0aGlzLmluZGV4MiA9IDBcbiAgfVxuXG4gIGdldEV2ZW50czIobWF4dGltZSwgdGltZVN0YW1wKXtcbiAgICBsZXQgcmVzdWx0ID0gW11cblxuICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXgyLCBtYXhpID0gdGhpcy5hbGxFdmVudHMubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKXtcblxuICAgICAgbGV0IGV2ZW50ID0gdGhpcy5hbGxFdmVudHNbaV1cblxuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVEVNUE8gfHwgZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUpe1xuICAgICAgICBpZihldmVudC5taWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICB0aGlzLm1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrXG4gICAgICAgICAgdGhpcy5pbmRleDIrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG5cbiAgICAgIH1lbHNle1xuICAgICAgICBsZXQgbWlsbGlzID0gZXZlbnQudGlja3MgKiB0aGlzLm1pbGxpc1BlclRpY2tcbiAgICAgICAgaWYobWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgZXZlbnQudGltZSA9IG1pbGxpcyArIHRpbWVTdGFtcFxuICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgICAgICAgIHRoaXMuaW5kZXgyKytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuXG4gIGFkZEV2ZW50cyhzdGFydEJhciA9IDEsIGVuZEJhciA9IHRoaXMuc29uZy5iYXJzLCBpZCA9ICdhZGQnKXtcbiAgICAvLyBjb25zb2xlLmxvZyhzdGFydEJhciwgZW5kQmFyKVxuICAgIGxldCBldmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZClcbiAgICB0aGlzLmV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICB0aGlzLnBhcnQuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICB0aGlzLmJhcnMgPSBlbmRCYXJcbiAgICAvL2NvbnNvbGUubG9nKCdnZXRFdmVudHMgJU8nLCB0aGlzLmV2ZW50cywgZW5kQmFyKVxuICAgIHJldHVybiBldmVudHNcbiAgfVxuXG5cbiAgY3JlYXRlUHJlY291bnRFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgdGltZVN0YW1wKXtcblxuICAgIHRoaXMudGltZVN0YW1wID0gdGltZVN0YW1wXG5cbi8vICAgbGV0IHNvbmdTdGFydFBvc2l0aW9uID0gdGhpcy5zb25nLmdldFBvc2l0aW9uKClcblxuICAgIGxldCBzb25nU3RhcnRQb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICB0YXJnZXQ6IFtzdGFydEJhcl0sXG4gICAgICByZXN1bHQ6ICdtaWxsaXMnLFxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZygnc3RhckJhcicsIHNvbmdTdGFydFBvc2l0aW9uLmJhcilcblxuICAgIGxldCBlbmRQb3MgPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLnNvbmcsIHtcbiAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgLy90YXJnZXQ6IFtzb25nU3RhcnRQb3NpdGlvbi5iYXIgKyBwcmVjb3VudCwgc29uZ1N0YXJ0UG9zaXRpb24uYmVhdCwgc29uZ1N0YXJ0UG9zaXRpb24uc2l4dGVlbnRoLCBzb25nU3RhcnRQb3NpdGlvbi50aWNrXSxcbiAgICAgIHRhcmdldDogW2VuZEJhcl0sXG4gICAgICByZXN1bHQ6ICdtaWxsaXMnLFxuICAgIH0pXG5cbiAgICAvL2NvbnNvbGUubG9nKHNvbmdTdGFydFBvc2l0aW9uLCBlbmRQb3MpXG5cbiAgICB0aGlzLnByZWNvdW50SW5kZXggPSAwXG4gICAgdGhpcy5zdGFydE1pbGxpcyA9IHNvbmdTdGFydFBvc2l0aW9uLm1pbGxpc1xuICAgIHRoaXMuZW5kTWlsbGlzID0gZW5kUG9zLm1pbGxpc1xuICAgIHRoaXMucHJlY291bnREdXJhdGlvbiA9IGVuZFBvcy5taWxsaXMgLSB0aGlzLnN0YXJ0TWlsbGlzXG5cbiAgICAvLyBkbyB0aGlzIHNvIHlvdSBjYW4gc3RhcnQgcHJlY291bnRpbmcgYXQgYW55IHBvc2l0aW9uIGluIHRoZSBzb25nXG4gICAgdGhpcy50aW1lU3RhbXAgLT0gdGhpcy5zdGFydE1pbGxpc1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnByZWNvdW50RHVyYXRpb24sIHRoaXMuc3RhcnRNaWxsaXMsIHRoaXMuZW5kTWlsbGlzKVxuXG4gICAgdGhpcy5wcmVjb3VudEV2ZW50cyA9IHRoaXMuY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIgLSAxLCAncHJlY291bnQnKTtcbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gcGFyc2VFdmVudHMoWy4uLnRoaXMuc29uZy5fdGltZUV2ZW50cywgLi4udGhpcy5wcmVjb3VudEV2ZW50c10pXG5cbiAgICAvL2NvbnNvbGUubG9nKHNvbmdTdGFydFBvc2l0aW9uLmJhciwgZW5kUG9zLmJhciwgcHJlY291bnQsIHRoaXMucHJlY291bnRFdmVudHMubGVuZ3RoKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMucHJlY291bnRFdmVudHMubGVuZ3RoLCB0aGlzLnByZWNvdW50RHVyYXRpb24pO1xuICAgIHJldHVybiB0aGlzLnByZWNvdW50RHVyYXRpb25cbiAgfVxuXG5cbiAgc2V0UHJlY291bnRJbmRleChtaWxsaXMpe1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IobGV0IGV2ZW50IG9mIHRoaXMuZXZlbnRzKXtcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpe1xuICAgICAgICB0aGlzLnByZWNvdW50SW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gICAgY29uc29sZS5sb2codGhpcy5wcmVjb3VudEluZGV4KVxuICB9XG5cblxuICAvLyBjYWxsZWQgYnkgc2NoZWR1bGVyLmpzXG4gIGdldFByZWNvdW50RXZlbnRzKG1heHRpbWUpe1xuICAgIGxldCBldmVudHMgPSB0aGlzLnByZWNvdW50RXZlbnRzLFxuICAgICAgbWF4aSA9IGV2ZW50cy5sZW5ndGgsIGksIGV2dCxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgLy9tYXh0aW1lICs9IHRoaXMucHJlY291bnREdXJhdGlvblxuXG4gICAgZm9yKGkgPSB0aGlzLnByZWNvdW50SW5kZXg7IGkgPCBtYXhpOyBpKyspe1xuICAgICAgZXZ0ID0gZXZlbnRzW2ldO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWxsaXMsIG1heHRpbWUsIHRoaXMubWlsbGlzKTtcbiAgICAgIGlmKGV2dC5taWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgZXZ0LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2dC5taWxsaXNcbiAgICAgICAgcmVzdWx0LnB1c2goZXZ0KVxuICAgICAgICB0aGlzLnByZWNvdW50SW5kZXgrK1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHJlc3VsdC5sZW5ndGgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuXG4gIG11dGUoZmxhZyl7XG4gICAgdGhpcy50cmFjay5tdXRlZCA9IGZsYWdcbiAgfVxuXG5cbiAgYWxsTm90ZXNPZmYoKXtcbiAgICB0aGlzLnRyYWNrLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgfVxuXG5cbiAgLy8gPT09PT09PT09PT0gQ09ORklHVVJBVElPTiA9PT09PT09PT09PVxuXG4gIHVwZGF0ZUNvbmZpZygpe1xuICAgIHRoaXMuaW5pdCgxLCB0aGlzLmJhcnMsICd1cGRhdGUnKVxuICAgIHRoaXMuYWxsTm90ZXNPZmYoKVxuICAgIHRoaXMuc29uZy51cGRhdGUoKVxuICB9XG5cbiAgLy8gYWRkZWQgdG8gcHVibGljIEFQSTogU29uZy5jb25maWd1cmVNZXRyb25vbWUoe30pXG4gIGNvbmZpZ3VyZShjb25maWcpe1xuXG4gICAgT2JqZWN0LmtleXMoY29uZmlnKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICB0aGlzW21ldGhvZE1hcC5nZXQoa2V5KV0oY29uZmlnLmtleSk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRJbnN0cnVtZW50KGluc3RydW1lbnQpe1xuICAgIGlmKCFpbnN0cnVtZW50IGluc3RhbmNlb2YgSW5zdHJ1bWVudCl7XG4gICAgICBjb25zb2xlLndhcm4oJ25vdCBhbiBpbnN0YW5jZSBvZiBJbnN0cnVtZW50JylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnRyYWNrLnNldEluc3RydW1lbnQoaW5zdHJ1bWVudClcbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXROb3RlTGVuZ3RoQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICBpZihpc05hTih2YWx1ZSkpe1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA9IHZhbHVlO1xuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0VmVsb2NpdHlBY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy52ZWxvY2l0eUFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldFZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICB2YWx1ZSA9IGNoZWNrTUlESU51bWJlcih2YWx1ZSk7XG4gICAgaWYodmFsdWUgIT09IGZhbHNlKXtcbiAgICAgIHRoaXMudmVsb2NpdHlOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXROb3RlTnVtYmVyQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICB2YWx1ZSA9IGNoZWNrTUlESU51bWJlcih2YWx1ZSk7XG4gICAgaWYodmFsdWUgIT09IGZhbHNlKXtcbiAgICAgIHRoaXMubm90ZU51bWJlckFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Vm9sdW1lKHZhbHVlKXtcbiAgICB0aGlzLnRyYWNrLnNldFZvbHVtZSh2YWx1ZSk7XG4gIH1cbn1cblxuIiwiLy8gQCBmbG93XG5pbXBvcnQge2dldE5vdGVEYXRhfSBmcm9tICcuL25vdGUnXG5pbXBvcnQge2dldFNldHRpbmdzfSBmcm9tICcuL3NldHRpbmdzJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIE1JRElFdmVudHtcblxuICBjb25zdHJ1Y3Rvcih0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXIgPSAtMSwgY2hhbm5lbDpudW1iZXIgPSAwKXtcbiAgICB0aGlzLmlkID0gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV8ke2luc3RhbmNlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy50aWNrcyA9IHRpY2tzXG4gICAgdGhpcy5kYXRhMSA9IGRhdGExXG4gICAgdGhpcy5kYXRhMiA9IGRhdGEyXG4gICAgdGhpcy5waXRjaCA9IGdldFNldHRpbmdzKCkucGl0Y2hcblxuICAgIC8qIHRlc3Qgd2hldGhlciB0eXBlIGlzIGEgc3RhdHVzIGJ5dGUgb3IgYSBjb21tYW5kOiAqL1xuXG4gICAgLy8gMS4gdGhlIGhpZ2hlciA0IGJpdHMgb2YgdGhlIHN0YXR1cyBieXRlIGZvcm0gdGhlIGNvbW1hbmRcbiAgICB0aGlzLnR5cGUgPSAodHlwZSA+PiA0KSAqIDE2XG4gICAgLy90aGlzLnR5cGUgPSB0aGlzLmNvbW1hbmQgPSAodHlwZSA+PiA0KSAqIDE2XG5cbiAgICAvLyAyLiBmaWx0ZXIgY2hhbm5lbCBldmVudHNcbiAgICBpZih0aGlzLnR5cGUgPj0gMHg4MCAmJiB0aGlzLnR5cGUgPD0gMHhFMCl7XG4gICAgICAvLyAzLiBnZXQgdGhlIGNoYW5uZWwgbnVtYmVyXG4gICAgICBpZihjaGFubmVsID4gMCl7XG4gICAgICAgIC8vIGEgY2hhbm5lbCBpcyBzZXQsIHRoaXMgb3ZlcnJ1bGVzIHRoZSBjaGFubmVsIG51bWJlciBpbiB0aGUgc3RhdHVzIGJ5dGVcbiAgICAgICAgdGhpcy5jaGFubmVsID0gY2hhbm5lbFxuICAgICAgfWVsc2V7XG4gICAgICAgIC8vIGV4dHJhY3QgdGhlIGNoYW5uZWwgZnJvbSB0aGUgc3RhdHVzIGJ5dGU6IHRoZSBsb3dlciA0IGJpdHMgb2YgdGhlIHN0YXR1cyBieXRlIGZvcm0gdGhlIGNoYW5uZWwgbnVtYmVyXG4gICAgICAgIHRoaXMuY2hhbm5lbCA9ICh0eXBlICYgMHhGKVxuICAgICAgfVxuICAgICAgLy90aGlzLnN0YXR1cyA9IHRoaXMuY29tbWFuZCArIHRoaXMuY2hhbm5lbFxuICAgIH1lbHNle1xuICAgICAgLy8gNC4gbm90IGEgY2hhbm5lbCBldmVudCwgc2V0IHRoZSB0eXBlIGFuZCBjb21tYW5kIHRvIHRoZSB2YWx1ZSBvZiB0eXBlIGFzIHByb3ZpZGVkIGluIHRoZSBjb25zdHJ1Y3RvclxuICAgICAgdGhpcy50eXBlID0gdHlwZVxuICAgICAgLy90aGlzLnR5cGUgPSB0aGlzLmNvbW1hbmQgPSB0eXBlXG4gICAgICB0aGlzLmNoYW5uZWwgPSAwIC8vIGFueVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsIHRoaXMudHlwZSwgdGhpcy5jb21tYW5kLCB0aGlzLnN0YXR1cywgdGhpcy5jaGFubmVsLCB0aGlzLmlkKVxuXG4gICAgLy8gc29tZXRpbWVzIE5PVEVfT0ZGIGV2ZW50cyBhcmUgc2VudCBhcyBOT1RFX09OIGV2ZW50cyB3aXRoIGEgMCB2ZWxvY2l0eSB2YWx1ZVxuICAgIGlmKHR5cGUgPT09IDE0NCAmJiBkYXRhMiA9PT0gMCl7XG4gICAgICB0aGlzLnR5cGUgPSAxMjhcbiAgICB9XG5cbiAgICB0aGlzLl9wYXJ0ID0gbnVsbFxuICAgIHRoaXMuX3RyYWNrID0gbnVsbFxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG5cbiAgICBpZih0eXBlID09PSAxNDQgfHwgdHlwZSA9PT0gMTI4KXtcbiAgICAgICh7XG4gICAgICAgIG5hbWU6IHRoaXMubm90ZU5hbWUsXG4gICAgICAgIGZ1bGxOYW1lOiB0aGlzLmZ1bGxOb3RlTmFtZSxcbiAgICAgICAgZnJlcXVlbmN5OiB0aGlzLmZyZXF1ZW5jeSxcbiAgICAgICAgb2N0YXZlOiB0aGlzLm9jdGF2ZVxuICAgICAgfSA9IGdldE5vdGVEYXRhKHtudW1iZXI6IGRhdGExfSkpXG4gICAgfVxuICAgIC8vQFRPRE86IGFkZCBhbGwgb3RoZXIgcHJvcGVydGllc1xuICB9XG5cbiAgY29weSgpe1xuICAgIGxldCBtID0gbmV3IE1JRElFdmVudCh0aGlzLnRpY2tzLCB0aGlzLnR5cGUsIHRoaXMuZGF0YTEsIHRoaXMuZGF0YTIpXG4gICAgcmV0dXJuIG1cbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcil7IC8vIG1heSBiZSBiZXR0ZXIgaWYgbm90IGEgcHVibGljIG1ldGhvZD9cbiAgICB0aGlzLmRhdGExICs9IGFtb3VudFxuICAgIHRoaXMuZnJlcXVlbmN5ID0gdGhpcy5waXRjaCAqIE1hdGgucG93KDIsICh0aGlzLmRhdGExIC0gNjkpIC8gMTIpXG4gIH1cblxuICB1cGRhdGVQaXRjaChuZXdQaXRjaCl7XG4gICAgaWYobmV3UGl0Y2ggPT09IHRoaXMucGl0Y2gpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMucGl0Y2ggPSBuZXdQaXRjaFxuICAgIHRoaXMudHJhbnNwb3NlKDApXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMudGlja3MgKz0gdGlja3NcbiAgICBpZih0aGlzLm1pZGlOb3RlKXtcbiAgICAgIHRoaXMubWlkaU5vdGUudXBkYXRlKClcbiAgICB9XG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcil7XG4gICAgdGhpcy50aWNrcyA9IHRpY2tzXG4gICAgaWYodGhpcy5taWRpTm90ZSl7XG4gICAgICB0aGlzLm1pZGlOb3RlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG59XG5cblxuLypcbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVNSURJRXZlbnQoZXZlbnQpe1xuICAvL2V2ZW50Lm5vdGUgPSBudWxsXG4gIGV2ZW50Lm5vdGUgPSBudWxsXG4gIGV2ZW50ID0gbnVsbFxufVxuKi9cbiIsImltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgTUlESU5vdGV7XG5cbiAgY29uc3RydWN0b3Iobm90ZW9uOiBNSURJRXZlbnQsIG5vdGVvZmY6IE1JRElFdmVudCl7XG4gICAgLy9pZihub3Rlb24udHlwZSAhPT0gMTQ0IHx8IG5vdGVvZmYudHlwZSAhPT0gMTI4KXtcbiAgICBpZihub3Rlb24udHlwZSAhPT0gMTQ0KXtcbiAgICAgIGNvbnNvbGUud2FybignY2Fubm90IGNyZWF0ZSBNSURJTm90ZScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubm90ZU9uID0gbm90ZW9uXG4gICAgbm90ZW9uLm1pZGlOb3RlID0gdGhpc1xuICAgIG5vdGVvbi5taWRpTm90ZUlkID0gdGhpcy5pZFxuXG4gICAgaWYobm90ZW9mZiBpbnN0YW5jZW9mIE1JRElFdmVudCl7XG4gICAgICB0aGlzLm5vdGVPZmYgPSBub3Rlb2ZmXG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlID0gdGhpc1xuICAgICAgbm90ZW9mZi5taWRpTm90ZUlkID0gdGhpcy5pZFxuICAgICAgdGhpcy5kdXJhdGlvblRpY2tzID0gbm90ZW9mZi50aWNrcyAtIG5vdGVvbi50aWNrc1xuICAgICAgdGhpcy5kdXJhdGlvbk1pbGxpcyA9IC0xXG4gICAgfVxuICB9XG5cbiAgYWRkTm90ZU9mZihub3Rlb2ZmKXtcbiAgICB0aGlzLm5vdGVPZmYgPSBub3Rlb2ZmXG4gICAgbm90ZW9mZi5taWRpTm90ZSA9IHRoaXNcbiAgICBub3Rlb2ZmLm1pZGlOb3RlSWQgPSB0aGlzLmlkXG4gICAgdGhpcy5kdXJhdGlvblRpY2tzID0gbm90ZW9mZi50aWNrcyAtIHRoaXMubm90ZU9uLnRpY2tzXG4gICAgdGhpcy5kdXJhdGlvbk1pbGxpcyA9IC0xXG4gIH1cblxuICBjb3B5KCl7XG4gICAgcmV0dXJuIG5ldyBNSURJTm90ZSh0aGlzLm5vdGVPbi5jb3B5KCksIHRoaXMubm90ZU9mZi5jb3B5KCkpXG4gIH1cblxuICB1cGRhdGUoKXsgLy8gbWF5IHVzZSBhbm90aGVyIG5hbWUgZm9yIHRoaXMgbWV0aG9kXG4gICAgdGhpcy5kdXJhdGlvblRpY2tzID0gdGhpcy5ub3RlT2ZmLnRpY2tzIC0gdGhpcy5ub3RlT24udGlja3NcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcik6IHZvaWR7XG4gICAgdGhpcy5ub3RlT24udHJhbnNwb3NlKGFtb3VudClcbiAgICB0aGlzLm5vdGVPZmYudHJhbnNwb3NlKGFtb3VudClcbiAgfVxuXG4gIG1vdmUodGlja3M6IG51bWJlcik6IHZvaWR7XG4gICAgdGhpcy5ub3RlT24ubW92ZSh0aWNrcylcbiAgICB0aGlzLm5vdGVPZmYubW92ZSh0aWNrcylcbiAgfVxuXG4gIG1vdmVUbyh0aWNrczogbnVtYmVyKTogdm9pZHtcbiAgICB0aGlzLm5vdGVPbi5tb3ZlVG8odGlja3MpXG4gICAgdGhpcy5ub3RlT2ZmLm1vdmVUbyh0aWNrcylcbiAgfVxuXG4gIHVucmVnaXN0ZXIoKXtcbiAgICBpZih0aGlzLnBhcnQpe1xuICAgICAgdGhpcy5wYXJ0LnJlbW92ZUV2ZW50cyh0aGlzKVxuICAgICAgdGhpcy5wYXJ0ID0gbnVsbFxuICAgIH1cbiAgICBpZih0aGlzLnRyYWNrKXtcbiAgICAgIHRoaXMudHJhY2sucmVtb3ZlRXZlbnRzKHRoaXMpXG4gICAgICB0aGlzLnRyYWNrID0gbnVsbFxuICAgIH1cbiAgICBpZih0aGlzLnNvbmcpe1xuICAgICAgdGhpcy5zb25nLnJlbW92ZUV2ZW50cyh0aGlzKVxuICAgICAgdGhpcy5zb25nID0gbnVsbFxuICAgIH1cbiAgfVxufVxuXG4iLCIvKlxuICBXcmFwcGVyIGZvciBhY2Nlc3NpbmcgYnl0ZXMgdGhyb3VnaCBzZXF1ZW50aWFsIHJlYWRzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4gIGFkYXB0ZWQgdG8gd29yayB3aXRoIEFycmF5QnVmZmVyIC0+IFVpbnQ4QXJyYXlcbiovXG5cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNSURJU3RyZWFte1xuXG4gIC8vIGJ1ZmZlciBpcyBVaW50OEFycmF5XG4gIGNvbnN0cnVjdG9yKGJ1ZmZlcil7XG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICAvKiByZWFkIHN0cmluZyBvciBhbnkgbnVtYmVyIG9mIGJ5dGVzICovXG4gIHJlYWQobGVuZ3RoLCB0b1N0cmluZyA9IHRydWUpIHtcbiAgICBsZXQgcmVzdWx0O1xuXG4gICAgaWYodG9TdHJpbmcpe1xuICAgICAgcmVzdWx0ID0gJyc7XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdCArPSBmY2ModGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9ZWxzZXtcbiAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDMyLWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQzMigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDI0KSArXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdIDw8IDE2KSArXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDJdIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAzXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSA0O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAxNi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MTYoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV1cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhbiA4LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQ4KHNpZ25lZCkge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXTtcbiAgICBpZihzaWduZWQgJiYgcmVzdWx0ID4gMTI3KXtcbiAgICAgIHJlc3VsdCAtPSAyNTY7XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb24gKz0gMTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZW9mKCkge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uID49IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBNSURJLXN0eWxlIGxldGlhYmxlLWxlbmd0aCBpbnRlZ2VyXG4gICAgKGJpZy1lbmRpYW4gdmFsdWUgaW4gZ3JvdXBzIG9mIDcgYml0cyxcbiAgICB3aXRoIHRvcCBiaXQgc2V0IHRvIHNpZ25pZnkgdGhhdCBhbm90aGVyIGJ5dGUgZm9sbG93cylcbiAgKi9cbiAgcmVhZFZhckludCgpIHtcbiAgICBsZXQgcmVzdWx0ID0gMDtcbiAgICB3aGlsZSh0cnVlKSB7XG4gICAgICBsZXQgYiA9IHRoaXMucmVhZEludDgoKTtcbiAgICAgIGlmIChiICYgMHg4MCkge1xuICAgICAgICByZXN1bHQgKz0gKGIgJiAweDdmKTtcbiAgICAgICAgcmVzdWx0IDw8PSA3O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyogYiBpcyB0aGUgbGFzdCBieXRlICovXG4gICAgICAgIHJldHVybiByZXN1bHQgKyBiO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlc2V0KCl7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICBzZXRQb3NpdGlvbihwKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gcDtcbiAgfVxufVxuIiwiLypcbiAgRXh0cmFjdHMgYWxsIG1pZGkgZXZlbnRzIGZyb20gYSBiaW5hcnkgbWlkaSBmaWxlLCB1c2VzIG1pZGlfc3RyZWFtLmpzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBNSURJU3RyZWFtIGZyb20gJy4vbWlkaV9zdHJlYW0nO1xuXG5sZXRcbiAgbGFzdEV2ZW50VHlwZUJ5dGUsXG4gIHRyYWNrTmFtZTtcblxuXG5mdW5jdGlvbiByZWFkQ2h1bmsoc3RyZWFtKXtcbiAgbGV0IGlkID0gc3RyZWFtLnJlYWQoNCwgdHJ1ZSk7XG4gIGxldCBsZW5ndGggPSBzdHJlYW0ucmVhZEludDMyKCk7XG4gIC8vY29uc29sZS5sb2cobGVuZ3RoKTtcbiAgcmV0dXJue1xuICAgICdpZCc6IGlkLFxuICAgICdsZW5ndGgnOiBsZW5ndGgsXG4gICAgJ2RhdGEnOiBzdHJlYW0ucmVhZChsZW5ndGgsIGZhbHNlKVxuICB9O1xufVxuXG5cbmZ1bmN0aW9uIHJlYWRFdmVudChzdHJlYW0pe1xuICB2YXIgZXZlbnQgPSB7fTtcbiAgdmFyIGxlbmd0aDtcbiAgZXZlbnQuZGVsdGFUaW1lID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgbGV0IGV2ZW50VHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgLy9jb25zb2xlLmxvZyhldmVudFR5cGVCeXRlLCBldmVudFR5cGVCeXRlICYgMHg4MCwgMTQ2ICYgMHgwZik7XG4gIGlmKChldmVudFR5cGVCeXRlICYgMHhmMCkgPT0gMHhmMCl7XG4gICAgLyogc3lzdGVtIC8gbWV0YSBldmVudCAqL1xuICAgIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmZil7XG4gICAgICAvKiBtZXRhIGV2ZW50ICovXG4gICAgICBldmVudC50eXBlID0gJ21ldGEnO1xuICAgICAgbGV0IHN1YnR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgc3dpdGNoKHN1YnR5cGVCeXRlKXtcbiAgICAgICAgY2FzZSAweDAwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VOdW1iZXInO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMil7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXF1ZW5jZU51bWJlciBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtYmVyID0gc3RyZWFtLnJlYWRJbnQxNigpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGV4dCc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDI6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb3B5cmlnaHROb3RpY2UnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAzOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndHJhY2tOYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICB0cmFja05hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA0OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnaW5zdHJ1bWVudE5hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA1OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbHlyaWNzJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21hcmtlcic7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDc6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjdWVQb2ludCc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MjA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtaWRpQ2hhbm5lbFByZWZpeCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAxKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIG1pZGlDaGFubmVsUHJlZml4IGV2ZW50IGlzIDEsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jaGFubmVsID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MmY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdlbmRPZlRyYWNrJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDApe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgZW5kT2ZUcmFjayBldmVudCBpcyAwLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXRUZW1wbyc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAzKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNldFRlbXBvIGV2ZW50IGlzIDMsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5taWNyb3NlY29uZHNQZXJCZWF0ID0gKFxuICAgICAgICAgICAgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDE2KSArXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgOCkgK1xuICAgICAgICAgICAgc3RyZWFtLnJlYWRJbnQ4KClcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU0OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc21wdGVPZmZzZXQnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gNSl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzbXB0ZU9mZnNldCBldmVudCBpcyA1LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGhvdXJCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWVSYXRlID17XG4gICAgICAgICAgICAweDAwOiAyNCwgMHgyMDogMjUsIDB4NDA6IDI5LCAweDYwOiAzMFxuICAgICAgICAgIH1baG91ckJ5dGUgJiAweDYwXTtcbiAgICAgICAgICBldmVudC5ob3VyID0gaG91ckJ5dGUgJiAweDFmO1xuICAgICAgICAgIGV2ZW50Lm1pbiA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnNlYyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc3ViZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RpbWVTaWduYXR1cmUnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gNCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciB0aW1lU2lnbmF0dXJlIGV2ZW50IGlzIDQsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1lcmF0b3IgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5kZW5vbWluYXRvciA9IE1hdGgucG93KDIsIHN0cmVhbS5yZWFkSW50OCgpKTtcbiAgICAgICAgICBldmVudC5tZXRyb25vbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC50aGlydHlzZWNvbmRzID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTk6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdrZXlTaWduYXR1cmUnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMil7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBrZXlTaWduYXR1cmUgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmtleSA9IHN0cmVhbS5yZWFkSW50OCh0cnVlKTtcbiAgICAgICAgICBldmVudC5zY2FsZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDdmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VyU3BlY2lmaWMnO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvL2lmKHNlcXVlbmNlci5kZWJ1ZyA+PSAyKXtcbiAgICAgICAgICAvLyAgICBjb25zb2xlLndhcm4oJ1VucmVjb2duaXNlZCBtZXRhIGV2ZW50IHN1YnR5cGU6ICcgKyBzdWJ0eXBlQnl0ZSk7XG4gICAgICAgICAgLy99XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICB9XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4ZjApe1xuICAgICAgZXZlbnQudHlwZSA9ICdzeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2UgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGY3KXtcbiAgICAgIGV2ZW50LnR5cGUgPSAnZGl2aWRlZFN5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlIGJ5dGU6ICcgKyBldmVudFR5cGVCeXRlO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgLyogY2hhbm5lbCBldmVudCAqL1xuICAgIGxldCBwYXJhbTE7XG4gICAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweDgwKSA9PT0gMCl7XG4gICAgICAvKiBydW5uaW5nIHN0YXR1cyAtIHJldXNlIGxhc3RFdmVudFR5cGVCeXRlIGFzIHRoZSBldmVudCB0eXBlLlxuICAgICAgICBldmVudFR5cGVCeXRlIGlzIGFjdHVhbGx5IHRoZSBmaXJzdCBwYXJhbWV0ZXJcbiAgICAgICovXG4gICAgICAvL2NvbnNvbGUubG9nKCdydW5uaW5nIHN0YXR1cycpO1xuICAgICAgcGFyYW0xID0gZXZlbnRUeXBlQnl0ZTtcbiAgICAgIGV2ZW50VHlwZUJ5dGUgPSBsYXN0RXZlbnRUeXBlQnl0ZTtcbiAgICB9ZWxzZXtcbiAgICAgIHBhcmFtMSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgLy9jb25zb2xlLmxvZygnbGFzdCcsIGV2ZW50VHlwZUJ5dGUpO1xuICAgICAgbGFzdEV2ZW50VHlwZUJ5dGUgPSBldmVudFR5cGVCeXRlO1xuICAgIH1cbiAgICBsZXQgZXZlbnRUeXBlID0gZXZlbnRUeXBlQnl0ZSA+PiA0O1xuICAgIGV2ZW50LmNoYW5uZWwgPSBldmVudFR5cGVCeXRlICYgMHgwZjtcbiAgICBldmVudC50eXBlID0gJ2NoYW5uZWwnO1xuICAgIHN3aXRjaCAoZXZlbnRUeXBlKXtcbiAgICAgIGNhc2UgMHgwODpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT2ZmJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDA5OlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBpZihldmVudC52ZWxvY2l0eSA9PT0gMCl7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT2ZmJztcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ25vdGVPbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGI6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29udHJvbGxlcic7XG4gICAgICAgIGV2ZW50LmNvbnRyb2xsZXJUeXBlID0gcGFyYW0xO1xuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGM6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncHJvZ3JhbUNoYW5nZSc7XG4gICAgICAgIGV2ZW50LnByb2dyYW1OdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZDpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjaGFubmVsQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHBhcmFtMTtcbiAgICAgICAgLy9pZih0cmFja05hbWUgPT09ICdTSC1TMS00NC1DMDkgTD1TTUwgSU49Mycpe1xuICAgICAgICAvLyAgICBjb25zb2xlLmxvZygnY2hhbm5lbCBwcmVzc3VyZScsIHRyYWNrTmFtZSwgcGFyYW0xKTtcbiAgICAgICAgLy99XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwaXRjaEJlbmQnO1xuICAgICAgICBldmVudC52YWx1ZSA9IHBhcmFtMSArIChzdHJlYW0ucmVhZEludDgoKSA8PCA3KTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLypcbiAgICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGU7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlKTtcbiAgICAgICAgKi9cblxuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbi8qXG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgY29uc29sZS5sb2coJ3dlaXJkbycsIHRyYWNrTmFtZSwgcGFyYW0xLCBldmVudC52ZWxvY2l0eSk7XG4qL1xuXG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNSURJRmlsZShidWZmZXIpe1xuICBpZihidWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5ID09PSBmYWxzZSAmJiBidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUuZXJyb3IoJ2J1ZmZlciBzaG91bGQgYmUgYW4gaW5zdGFuY2Ugb2YgVWludDhBcnJheSBvZiBBcnJheUJ1ZmZlcicpXG4gICAgcmV0dXJuXG4gIH1cbiAgaWYoYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe1xuICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgfVxuICBsZXQgdHJhY2tzID0gbmV3IE1hcCgpO1xuICBsZXQgc3RyZWFtID0gbmV3IE1JRElTdHJlYW0oYnVmZmVyKTtcblxuICBsZXQgaGVhZGVyQ2h1bmsgPSByZWFkQ2h1bmsoc3RyZWFtKTtcbiAgaWYoaGVhZGVyQ2h1bmsuaWQgIT09ICdNVGhkJyB8fCBoZWFkZXJDaHVuay5sZW5ndGggIT09IDYpe1xuICAgIHRocm93ICdCYWQgLm1pZCBmaWxlIC0gaGVhZGVyIG5vdCBmb3VuZCc7XG4gIH1cblxuICBsZXQgaGVhZGVyU3RyZWFtID0gbmV3IE1JRElTdHJlYW0oaGVhZGVyQ2h1bmsuZGF0YSk7XG4gIGxldCBmb3JtYXRUeXBlID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdHJhY2tDb3VudCA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgbGV0IHRpbWVEaXZpc2lvbiA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcblxuICBpZih0aW1lRGl2aXNpb24gJiAweDgwMDApe1xuICAgIHRocm93ICdFeHByZXNzaW5nIHRpbWUgZGl2aXNpb24gaW4gU01UUEUgZnJhbWVzIGlzIG5vdCBzdXBwb3J0ZWQgeWV0JztcbiAgfVxuXG4gIGxldCBoZWFkZXIgPXtcbiAgICAnZm9ybWF0VHlwZSc6IGZvcm1hdFR5cGUsXG4gICAgJ3RyYWNrQ291bnQnOiB0cmFja0NvdW50LFxuICAgICd0aWNrc1BlckJlYXQnOiB0aW1lRGl2aXNpb25cbiAgfTtcblxuICBmb3IobGV0IGkgPSAwOyBpIDwgdHJhY2tDb3VudDsgaSsrKXtcbiAgICB0cmFja05hbWUgPSAndHJhY2tfJyArIGk7XG4gICAgbGV0IHRyYWNrID0gW107XG4gICAgbGV0IHRyYWNrQ2h1bmsgPSByZWFkQ2h1bmsoc3RyZWFtKTtcbiAgICBpZih0cmFja0NodW5rLmlkICE9PSAnTVRyaycpe1xuICAgICAgdGhyb3cgJ1VuZXhwZWN0ZWQgY2h1bmsgLSBleHBlY3RlZCBNVHJrLCBnb3QgJysgdHJhY2tDaHVuay5pZDtcbiAgICB9XG4gICAgbGV0IHRyYWNrU3RyZWFtID0gbmV3IE1JRElTdHJlYW0odHJhY2tDaHVuay5kYXRhKTtcbiAgICB3aGlsZSghdHJhY2tTdHJlYW0uZW9mKCkpe1xuICAgICAgbGV0IGV2ZW50ID0gcmVhZEV2ZW50KHRyYWNrU3RyZWFtKTtcbiAgICAgIHRyYWNrLnB1c2goZXZlbnQpO1xuICAgIH1cbiAgICB0cmFja3Muc2V0KHRyYWNrTmFtZSwgdHJhY2spO1xuICB9XG5cbiAgcmV0dXJue1xuICAgICdoZWFkZXInOiBoZWFkZXIsXG4gICAgJ3RyYWNrcyc6IHRyYWNrc1xuICB9O1xufSIsImltcG9ydCB7Z2V0U2V0dGluZ3N9IGZyb20gJy4vc2V0dGluZ3MnXG5cbmNvbnN0IHBvdyA9IE1hdGgucG93XG5jb25zdCBmbG9vciA9IE1hdGguZmxvb3Jcbi8vY29uc3QgY2hlY2tOb3RlTmFtZSA9IC9eW0EtR117MX0oYnswLDJ9fXwjezAsMn0pW1xcLV17MCwxfVswLTldezF9JC9cbmNvbnN0IHJlZ2V4Q2hlY2tOb3RlTmFtZSA9IC9eW0EtR117MX0oYnxiYnwjfCMjKXswLDF9JC9cbmNvbnN0IHJlZ2V4Q2hlY2tGdWxsTm90ZU5hbWUgPSAvXltBLUddezF9KGJ8YmJ8I3wjIyl7MCwxfShcXC0xfFswLTldezF9KSQvXG5jb25zdCByZWdleFNwbGl0RnVsbE5hbWUgPSAvXihbQS1HXXsxfShifGJifCN8IyMpezAsMX0pKFxcLTF8WzAtOV17MX0pJC9cbmNvbnN0IHJlZ2V4R2V0T2N0YXZlID0gLyhcXC0xfFswLTldezF9KSQvXG5cbmNvbnN0IG5vdGVOYW1lcyA9IHtcbiAgc2hhcnA6IFsnQycsICdDIycsICdEJywgJ0QjJywgJ0UnLCAnRicsICdGIycsICdHJywgJ0cjJywgJ0EnLCAnQSMnLCAnQiddLFxuICBmbGF0OiBbJ0MnLCAnRGInLCAnRCcsICdFYicsICdFJywgJ0YnLCAnR2InLCAnRycsICdBYicsICdBJywgJ0JiJywgJ0InXSxcbiAgJ2VuaGFybW9uaWMtc2hhcnAnOiBbJ0IjJywgJ0MjJywgJ0MjIycsICdEIycsICdEIyMnLCAnRSMnLCAnRiMnLCAnRiMjJywgJ0cjJywgJ0cjIycsICdBIycsICdBIyMnXSxcbiAgJ2VuaGFybW9uaWMtZmxhdCc6IFsnRGJiJywgJ0RiJywgJ0ViYicsICdFYicsICdGYicsICdHYmInLCAnR2InLCAnQWJiJywgJ0FiJywgJ0JiYicsICdCYicsICdDYiddXG59XG5cbmxldCBub3RlTmFtZU1vZGVcbmxldCBwaXRjaFxuXG4vKlxuICBzZXR0aW5ncyA9IHtcbiAgICBuYW1lOiAnQycsXG4gICAgb2N0YXZlOiA0LFxuICAgIGZ1bGxOYW1lOiAnQzQnLFxuICAgIG51bWJlcjogNjAsXG4gICAgZnJlcXVlbmN5OiAyMzQuMTYgLy8gbm90IHlldCBpbXBsZW1lbnRlZFxuICB9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVEYXRhKHNldHRpbmdzKXtcbiAgbGV0IHtcbiAgICBmdWxsTmFtZSxcbiAgICBuYW1lLFxuICAgIG9jdGF2ZSxcbiAgICBtb2RlLFxuICAgIG51bWJlcixcbiAgICBmcmVxdWVuY3ksXG4gIH0gPSBzZXR0aW5ncztcblxuICAoe25vdGVOYW1lTW9kZSwgcGl0Y2h9ID0gZ2V0U2V0dGluZ3MoKSlcblxuICBpZihcbiAgICAgICB0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZydcbiAgICAmJiB0eXBlb2YgZnVsbE5hbWUgIT09ICdzdHJpbmcnXG4gICAgJiYgdHlwZW9mIG51bWJlciAhPT0gJ251bWJlcidcbiAgICAmJiB0eXBlb2YgZnJlcXVlbmN5ICE9PSAnbnVtYmVyJyl7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmKG51bWJlciA8IDAgfHwgbnVtYmVyID4gMTI3KXtcbiAgICBjb25zb2xlLmxvZygncGxlYXNlIHByb3ZpZGUgYSBub3RlIGJldHdlZW4gMCAoQy0xKSBhbmQgMTI3IChHOSknKVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBtb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpXG4gIC8vY29uc29sZS5sb2cobW9kZSlcblxuICBpZih0eXBlb2YgbnVtYmVyID09PSAnbnVtYmVyJyl7XG4gICAgKHtcbiAgICAgIGZ1bGxOYW1lLFxuICAgICAgbmFtZSxcbiAgICAgIG9jdGF2ZVxuICAgIH0gPSBfZ2V0Tm90ZU5hbWUobnVtYmVyLCBtb2RlKSlcblxuICB9ZWxzZSBpZih0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpe1xuXG4gICAgaWYocmVnZXhDaGVja05vdGVOYW1lLnRlc3QobmFtZSkpe1xuICAgICAgZnVsbE5hbWUgPSBgJHtuYW1lfSR7b2N0YXZlfWBcbiAgICAgIG51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSlcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUubG9nKGBpbnZhbGlkIG5hbWUgJHtuYW1lfWApXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICB9ZWxzZSBpZih0eXBlb2YgZnVsbE5hbWUgPT09ICdzdHJpbmcnKXtcblxuICAgIGlmKHJlZ2V4Q2hlY2tGdWxsTm90ZU5hbWUudGVzdChmdWxsTmFtZSkpe1xuICAgICAgKHtcbiAgICAgICAgb2N0YXZlLFxuICAgICAgICBuYW1lLFxuICAgICAgIH0gPSBfc3BsaXRGdWxsTmFtZShmdWxsTmFtZSkpXG4gICAgICBudW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpXG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmxvZyhgaW52YWxpZCBmdWxsbmFtZSAke2Z1bGxOYW1lfWApXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIGxldCBkYXRhID0ge1xuICAgIG5hbWUsXG4gICAgb2N0YXZlLFxuICAgIGZ1bGxOYW1lLFxuICAgIG51bWJlcixcbiAgICBmcmVxdWVuY3k6IF9nZXRGcmVxdWVuY3kobnVtYmVyKSxcbiAgICBibGFja0tleTogX2lzQmxhY2tLZXkobnVtYmVyKSxcbiAgfVxuICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gIHJldHVybiBkYXRhXG59XG5cblxuZnVuY3Rpb24gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSA9IG5vdGVOYW1lTW9kZSkge1xuICAvL2xldCBvY3RhdmUgPSBNYXRoLmZsb29yKChudW1iZXIgLyAxMikgLSAyKSwgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBvY3RhdmUgPSBmbG9vcigobnVtYmVyIC8gMTIpIC0gMSlcbiAgbGV0IG5hbWUgPSBub3RlTmFtZXNbbW9kZV1bbnVtYmVyICUgMTJdXG4gIHJldHVybiB7XG4gICAgZnVsbE5hbWU6IGAke25hbWV9JHtvY3RhdmV9YCxcbiAgICBuYW1lLFxuICAgIG9jdGF2ZSxcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIF9nZXRPY3RhdmUoZnVsbE5hbWUpe1xuICByZXR1cm4gcGFyc2VJbnQoZnVsbE5hbWUubWF0Y2gocmVnZXhHZXRPY3RhdmUpWzBdLCAxMClcbn1cblxuXG5mdW5jdGlvbiBfc3BsaXRGdWxsTmFtZShmdWxsTmFtZSl7XG4gIGxldCBvY3RhdmUgPSBfZ2V0T2N0YXZlKGZ1bGxOYW1lKVxuICByZXR1cm57XG4gICAgb2N0YXZlLFxuICAgIG5hbWU6IGZ1bGxOYW1lLnJlcGxhY2Uob2N0YXZlLCAnJylcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSkge1xuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcylcbiAgbGV0IGluZGV4XG5cbiAgZm9yKGxldCBrZXkgb2Yga2V5cyl7XG4gICAgbGV0IG1vZGUgPSBub3RlTmFtZXNba2V5XVxuICAgIGluZGV4ID0gbW9kZS5maW5kSW5kZXgoeCA9PiB4ID09PSBuYW1lKVxuICAgIGlmKGluZGV4ICE9PSAtMSl7XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIC8vbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKSArIDEyIC8vIOKGkiBpbiBDdWJhc2UgY2VudHJhbCBDID0gQzMgaW5zdGVhZCBvZiBDNFxuICBsZXQgbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKS8vIOKGkiBtaWRpIHN0YW5kYXJkICsgc2NpZW50aWZpYyBuYW1pbmcsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NaWRkbGVfQyBhbmQgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TY2llbnRpZmljX3BpdGNoX25vdGF0aW9uXG5cbiAgaWYobnVtYmVyIDwgMCB8fCBudW1iZXIgPiAxMjcpe1xuICAgIGNvbnNvbGUubG9nKCdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgYmV0d2VlbiAwIChDLTEpIGFuZCAxMjcgKEc5KScpXG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgcmV0dXJuIG51bWJlclxufVxuXG5cbmZ1bmN0aW9uIF9nZXRGcmVxdWVuY3kobnVtYmVyKXtcbiAgcmV0dXJuIHBpdGNoICogcG93KDIsIChudW1iZXIgLSA2OSkgLyAxMikgLy8gbWlkaSBzdGFuZGFyZCwgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01JRElfVHVuaW5nX1N0YW5kYXJkXG59XG5cblxuLy9AVE9ETzogY2FsY3VsYXRlIG5vdGUgZnJvbSBmcmVxdWVuY3lcbmZ1bmN0aW9uIF9nZXRQaXRjaChoZXJ0eil7XG4gIC8vZm0gID0gIDIobeKIkjY5KS8xMig0NDAgSHopLlxufVxuXG5cbmZ1bmN0aW9uIF9jaGVja05vdGVOYW1lTW9kZShtb2RlKXtcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpXG4gIGxldCByZXN1bHQgPSBrZXlzLmluY2x1ZGVzKG1vZGUpXG4gIC8vY29uc29sZS5sb2cocmVzdWx0KVxuICBpZihyZXN1bHQgPT09IGZhbHNlKXtcbiAgICBpZih0eXBlb2YgbW9kZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgY29uc29sZS5sb2coYCR7bW9kZX0gaXMgbm90IGEgdmFsaWQgbm90ZSBuYW1lIG1vZGUsIHVzaW5nIFwiJHtub3RlTmFtZU1vZGV9XCIgaW5zdGVhZGApXG4gICAgfVxuICAgIG1vZGUgPSBub3RlTmFtZU1vZGVcbiAgfVxuICByZXR1cm4gbW9kZVxufVxuXG5cbmZ1bmN0aW9uIF9pc0JsYWNrS2V5KG5vdGVOdW1iZXIpe1xuICBsZXQgYmxhY2tcblxuICBzd2l0Y2godHJ1ZSl7XG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDE6Ly9DI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAzOi8vRCNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gNjovL0YjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDg6Ly9HI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxMDovL0EjXG4gICAgICBibGFjayA9IHRydWVcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBibGFjayA9IGZhbHNlXG4gIH1cblxuICByZXR1cm4gYmxhY2tcbn1cbiIsImltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge3R5cGVTdHJpbmcsIGNoZWNrSWZCYXNlNjQsIGJhc2U2NFRvQmluYXJ5fSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcblxuXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU2FtcGxlKHNhbXBsZSwgaWQsIGV2ZXJ5KXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIHRyeXtcbiAgICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSxcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MoYnVmZmVyKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBidWZmZXIpO1xuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWQsIGJ1ZmZlcn0pXG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KHtpZCwgYnVmZmVyfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoYnVmZmVyKTtcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25FcnJvcigpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEgW0lEOiAke2lkfV1gKTtcbiAgICAgICAgICAvL3JlamVjdChlKTsgLy8gZG9uJ3QgdXNlIHJlamVjdCBiZWNhdXNlIHdlIHVzZSB0aGlzIGFzIGEgbmVzdGVkIHByb21pc2UgYW5kIHdlIGRvbid0IHdhbnQgdGhlIHBhcmVudCBwcm9taXNlIHRvIHJlamVjdFxuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgfWNhdGNoKGUpe1xuICAgICAgY29uc29sZS53YXJuKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSlcbiAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZXNvbHZlKHtpZH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5cbmZ1bmN0aW9uIGxvYWRBbmRQYXJzZVNhbXBsZSh1cmwsIGlkLCBldmVyeSl7XG4gIC8vY29uc29sZS5sb2coaWQsIHVybClcbiAgLypcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAnbG9hZGluZycsXG4gICAgICBkYXRhOiB1cmxcbiAgICB9KVxuICB9LCAwKVxuICAqL1xuICBkaXNwYXRjaEV2ZW50KHtcbiAgICB0eXBlOiAnbG9hZGluZycsXG4gICAgZGF0YTogdXJsXG4gIH0pXG5cbiAgbGV0IGV4ZWN1dG9yID0gZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgLy8gY29uc29sZS5sb2codXJsKVxuICAgIGZldGNoKHVybCwge1xuICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgIH0pLnRoZW4oXG4gICAgICBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGlmKHJlc3BvbnNlLm9rKXtcbiAgICAgICAgICByZXNwb25zZS5hcnJheUJ1ZmZlcigpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBkYXRhKVxuICAgICAgICAgICAgZGVjb2RlU2FtcGxlKGRhdGEsIGlkLCBldmVyeSkudGhlbihyZXNvbHZlKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNlIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApXG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKVxufVxuXG5cbmZ1bmN0aW9uIGdldFByb21pc2VzKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpe1xuXG4gIGNvbnN0IGdldFNhbXBsZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYoa2V5ICE9PSAncmVsZWFzZScgJiYga2V5ICE9PSAnaW5mbycgJiYga2V5ICE9PSAnc3VzdGFpbicpe1xuICAgICAgLy9jb25zb2xlLmxvZyhrZXkpXG4gICAgICBpZihzYW1wbGUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgICAgIHByb21pc2VzLnB1c2goZGVjb2RlU2FtcGxlKHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSkpXG4gICAgICB9ZWxzZSBpZih0eXBlb2Ygc2FtcGxlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlmKGNoZWNrSWZCYXNlNjQoc2FtcGxlKSl7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChkZWNvZGVTYW1wbGUoYmFzZTY0VG9CaW5hcnkoc2FtcGxlKSwga2V5LCBiYXNlVXJsLCBldmVyeSkpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIC8vY29uc29sZS5sb2coYmFzZVVybCArIHNhbXBsZSlcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRBbmRQYXJzZVNhbXBsZShiYXNlVXJsICsgZXNjYXBlKHNhbXBsZSksIGtleSwgZXZlcnkpKVxuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZih0eXBlb2Ygc2FtcGxlID09PSAnb2JqZWN0Jyl7XG4gICAgICAgIHNhbXBsZSA9IHNhbXBsZS5zYW1wbGUgfHwgc2FtcGxlLmJ1ZmZlciB8fCBzYW1wbGUuYmFzZTY0IHx8IHNhbXBsZS51cmxcbiAgICAgICAgZ2V0U2FtcGxlKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpXG4gICAgICAgIC8vY29uc29sZS5sb2coa2V5LCBzYW1wbGUpXG4gICAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlLCBwcm9taXNlcy5sZW5ndGgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0U2FtcGxlKClcbn1cblxuXG4vLyBvbmx5IGZvciBpbnRlcm5hbGx5IHVzZSBpbiBxYW1iaVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2FtcGxlczIobWFwcGluZywgZXZlcnkgPSBmYWxzZSl7XG4gIGxldCB0eXBlID0gdHlwZVN0cmluZyhtYXBwaW5nKSxcbiAgICBwcm9taXNlcyA9IFtdLFxuICAgIGJhc2VVcmwgPSAnJ1xuXG4gIGlmKHR5cGVvZiBtYXBwaW5nLmJhc2VVcmwgPT09ICdzdHJpbmcnKXtcbiAgICBiYXNlVXJsID0gbWFwcGluZy5iYXNlVXJsXG4gICAgZGVsZXRlIG1hcHBpbmcuYmFzZVVybFxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhtYXBwaW5nLCBiYXNlVXJsKVxuXG4gIGV2ZXJ5ID0gdHlwZW9mIGV2ZXJ5ID09PSAnZnVuY3Rpb24nID8gZXZlcnkgOiBmYWxzZVxuICAvL2NvbnNvbGUubG9nKHR5cGUsIG1hcHBpbmcpXG4gIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICBPYmplY3Qua2V5cyhtYXBwaW5nKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAvLyBpZihpc05hTihrZXkpID09PSBmYWxzZSl7XG4gICAgICAvLyAgIGtleSA9IHBhcnNlSW50KGtleSwgMTApXG4gICAgICAvLyB9XG4gICAgICBsZXQgYSA9IG1hcHBpbmdba2V5XVxuICAgICAgLy9jb25zb2xlLmxvZyhrZXksIGEsIHR5cGVTdHJpbmcoYSkpXG4gICAgICBpZih0eXBlU3RyaW5nKGEpID09PSAnYXJyYXknKXtcbiAgICAgICAgYS5mb3JFYWNoKG1hcCA9PiB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhtYXApXG4gICAgICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIG1hcCwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgYSwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICAgIH1cbiAgICB9KVxuICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICBsZXQga2V5XG4gICAgbWFwcGluZy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSl7XG4gICAgICAvLyBrZXkgaXMgZGVsaWJlcmF0ZWx5IHVuZGVmaW5lZFxuICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIC50aGVuKCh2YWx1ZXMpID0+IHtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSwgdmFsdWVzKVxuICAgICAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgICAgICBtYXBwaW5nID0ge31cbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIC8vIHN1cHBvcnQgZm9yIG11bHRpIGxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgICAgICBsZXQgbWFwID0gbWFwcGluZ1t2YWx1ZS5pZF1cbiAgICAgICAgICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcobWFwKVxuICAgICAgICAgIGlmKHR5cGUgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICAgICAgICBtYXAucHVzaCh2YWx1ZS5idWZmZXIpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgbWFwcGluZ1t2YWx1ZS5pZF0gPSBbbWFwLCB2YWx1ZS5idWZmZXJdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IHZhbHVlLmJ1ZmZlclxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtYXBwaW5nKVxuICAgICAgICByZXNvbHZlKG1hcHBpbmcpXG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2FtcGxlcyguLi5kYXRhKXtcbiAgaWYoZGF0YS5sZW5ndGggPT09IDEgJiYgdHlwZVN0cmluZyhkYXRhWzBdKSAhPT0gJ3N0cmluZycpe1xuICAgIC8vY29uc29sZS5sb2coZGF0YVswXSlcbiAgICByZXR1cm4gcGFyc2VTYW1wbGVzMihkYXRhWzBdKVxuICB9XG4gIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGEpXG59XG4iLCJpbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtNSURJTm90ZX0gZnJvbSAnLi9taWRpX25vdGUnO1xuXG5sZXRcbiAgcHBxLFxuICBicG0sXG4gIGZhY3RvcixcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcbiAgcGxheWJhY2tTcGVlZCxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcbiAgdGlja3MsXG4gIG1pbGxpcyxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIGRpZmZUaWNrc1xuICAvL3ByZXZpb3VzRXZlbnRcblxuZnVuY3Rpb24gc2V0VGlja0R1cmF0aW9uKCl7XG4gIHNlY29uZHNQZXJUaWNrID0gKDEgLyBwbGF5YmFja1NwZWVkICogNjApIC8gYnBtIC8gcHBxO1xuICBtaWxsaXNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2sgKiAxMDAwO1xuICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssIGJwbSwgcHBxLCBwbGF5YmFja1NwZWVkLCAocHBxICogbWlsbGlzUGVyVGljaykpO1xuICAvL2NvbnNvbGUubG9nKHBwcSk7XG59XG5cblxuZnVuY3Rpb24gc2V0VGlja3NQZXJCZWF0KCl7XG4gIGZhY3RvciA9ICg0IC8gZGVub21pbmF0b3IpO1xuICBudW1TaXh0ZWVudGggPSBmYWN0b3IgKiA0O1xuICB0aWNrc1BlckJlYXQgPSBwcHEgKiBmYWN0b3I7XG4gIHRpY2tzUGVyQmFyID0gdGlja3NQZXJCZWF0ICogbm9taW5hdG9yO1xuICB0aWNrc1BlclNpeHRlZW50aCA9IHBwcSAvIDQ7XG4gIC8vY29uc29sZS5sb2coZGVub21pbmF0b3IsIGZhY3RvciwgbnVtU2l4dGVlbnRoLCB0aWNrc1BlckJlYXQsIHRpY2tzUGVyQmFyLCB0aWNrc1BlclNpeHRlZW50aCk7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlUG9zaXRpb24oZXZlbnQsIGZhc3QgPSBmYWxzZSl7XG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIC8vIGlmKGRpZmZUaWNrcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGRpZmZUaWNrcywgZXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudHlwZSlcbiAgLy8gfVxuICB0aWNrICs9IGRpZmZUaWNrcztcbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgLy9wcmV2aW91c0V2ZW50ID0gZXZlbnRcbiAgLy9jb25zb2xlLmxvZyhkaWZmVGlja3MsIG1pbGxpc1BlclRpY2spO1xuICBtaWxsaXMgKz0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcblxuICBpZihmYXN0ID09PSBmYWxzZSl7XG4gICAgd2hpbGUodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgICBzaXh0ZWVudGgrKztcbiAgICAgIHRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgICBiZWF0Kys7XG4gICAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICAgIGJlYXQgLT0gbm9taW5hdG9yO1xuICAgICAgICAgIGJhcisrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGltZUV2ZW50cyhzZXR0aW5ncywgdGltZUV2ZW50cywgaXNQbGF5aW5nID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZSB0aW1lIGV2ZW50cycpXG4gIGxldCB0eXBlO1xuICBsZXQgZXZlbnQ7XG5cbiAgcHBxID0gc2V0dGluZ3MucHBxO1xuICBicG0gPSBzZXR0aW5ncy5icG07XG4gIG5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcjtcbiAgcGxheWJhY2tTcGVlZCA9IHNldHRpbmdzLnBsYXliYWNrU3BlZWQ7XG4gIGJhciA9IDE7XG4gIGJlYXQgPSAxO1xuICBzaXh0ZWVudGggPSAxO1xuICB0aWNrID0gMDtcbiAgdGlja3MgPSAwO1xuICBtaWxsaXMgPSAwO1xuXG4gIHNldFRpY2tEdXJhdGlvbigpO1xuICBzZXRUaWNrc1BlckJlYXQoKTtcblxuICB0aW1lRXZlbnRzLnNvcnQoKGEsIGIpID0+IChhLnRpY2tzIDw9IGIudGlja3MpID8gLTEgOiAxKTtcbiAgbGV0IGUgPSAwO1xuICBmb3IoZXZlbnQgb2YgdGltZUV2ZW50cyl7XG4gICAgLy9jb25zb2xlLmxvZyhlKyssIGV2ZW50LnRpY2tzLCBldmVudC50eXBlKVxuICAgIC8vZXZlbnQuc29uZyA9IHNvbmc7XG4gICAgdHlwZSA9IGV2ZW50LnR5cGU7XG4gICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG5cbiAgICBzd2l0Y2godHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgc2V0VGlja3NQZXJCZWF0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvL3RpbWUgZGF0YSBvZiB0aW1lIGV2ZW50IGlzIHZhbGlkIGZyb20gKGFuZCBpbmNsdWRlZCkgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aW1lIGV2ZW50XG4gICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXJzQXNTdHJpbmcpO1xuICB9XG5cbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xuICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgLy9jb25zb2xlLmxvZyh0aW1lRXZlbnRzKTtcbn1cblxuXG4vL2V4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhzb25nLCBldmVudHMpe1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKGV2ZW50cywgaXNQbGF5aW5nID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIGxldCBldmVudDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG4gIGxldCByZXN1bHQgPSBbXVxuXG4gIHRpY2sgPSAwXG4gIHRpY2tzID0gMFxuICBkaWZmVGlja3MgPSAwXG5cbiAgLy9sZXQgZXZlbnRzID0gW10uY29uY2F0KGV2dHMsIHNvbmcuX3RpbWVFdmVudHMpO1xuICBsZXQgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcblxuICAvLyBub3Rlb2ZmIGNvbWVzIGJlZm9yZSBub3Rlb25cblxuLypcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEuc29ydEluZGV4IC0gYi5zb3J0SW5kZXg7XG4gIH0pXG4qL1xuXG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgLy8gaWYoYS50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gLTFcbiAgICAgIC8vIH1lbHNlIGlmKGIudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vICAgcmV0dXJuIDFcbiAgICAgIC8vIH1cbiAgICAgIC8vIHNob3J0OlxuICAgICAgbGV0IHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgIHIgPSAtMVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJcbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4gIH0pXG4gIGV2ZW50ID0gZXZlbnRzWzBdXG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG5cblxuICBicG0gPSBldmVudC5icG07XG4gIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcblxuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG5cbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cblxuICBmb3IobGV0IGkgPSBzdGFydEV2ZW50OyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuXG4gICAgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcbiAgICAgICAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gICAgICAgIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljayxldmVudC5taWxsaXNQZXJUaWNrKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgICAgICAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICAgICAgICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobm9taW5hdG9yLG51bVNpeHRlZW50aCx0aWNrc1BlclNpeHRlZW50aCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuXG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAvL2Nhc2UgMTI4OlxuICAgICAgLy9jYXNlIDE0NDpcblxuICAgICAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcbiAgICAgICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4vKlxuICAgICAgICBldmVudC5taWxsaXMgPSBtaWxsaXNcbiovXG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuXG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuYmFyKVxuXG4gICAgICAgIC8vIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50LmRhdGEyLCBldmVudC5iYXJzQXNTdHJpbmcpXG4gICAgICAgIC8vIH1cblxuICAgIH1cblxuXG4gICAgLy8gaWYoaSA8IDEwMCAmJiAoZXZlbnQudHlwZSA9PT0gODEgfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkpe1xuICAgIC8vICAgLy9jb25zb2xlLmxvZyhpLCB0aWNrcywgZGlmZlRpY2tzLCBtaWxsaXMsIG1pbGxpc1BlclRpY2spXG4gICAgLy8gICBjb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5taWxsaXMsICdub3RlJywgZXZlbnQuZGF0YTEsICd2ZWxvJywgZXZlbnQuZGF0YTIpXG4gICAgLy8gfVxuXG4gICAgbGFzdEV2ZW50VGljayA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIHBhcnNlTUlESU5vdGVzKHJlc3VsdClcbiAgcmV0dXJuIHJlc3VsdFxuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnQoZXZlbnQsIGZhc3QgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coYmFyLCBiZWF0LCB0aWNrcylcbiAgLy9jb25zb2xlLmxvZyhldmVudCwgYnBtLCBtaWxsaXNQZXJUaWNrLCB0aWNrcywgbWlsbGlzKTtcblxuICBldmVudC5icG0gPSBicG07XG4gIGV2ZW50Lm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgZXZlbnQuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICBldmVudC50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICBldmVudC50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gIGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgZXZlbnQuZmFjdG9yID0gZmFjdG9yO1xuICBldmVudC5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gIGV2ZW50LnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG4gIGV2ZW50Lm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuXG5cbiAgZXZlbnQudGlja3MgPSB0aWNrcztcblxuICBldmVudC5taWxsaXMgPSBtaWxsaXM7XG4gIGV2ZW50LnNlY29uZHMgPSBtaWxsaXMgLyAxMDAwO1xuXG4gIGlmKGZhc3Qpe1xuICAgIHJldHVyblxuICB9XG5cbiAgZXZlbnQuYmFyID0gYmFyO1xuICBldmVudC5iZWF0ID0gYmVhdDtcbiAgZXZlbnQuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICBldmVudC50aWNrID0gdGljaztcbiAgLy9ldmVudC5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGljaztcbiAgdmFyIHRpY2tBc1N0cmluZyA9IHRpY2sgPT09IDAgPyAnMDAwJyA6IHRpY2sgPCAxMCA/ICcwMCcgKyB0aWNrIDogdGljayA8IDEwMCA/ICcwJyArIHRpY2sgOiB0aWNrO1xuICBldmVudC5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgdGlja0FzU3RyaW5nO1xuICBldmVudC5iYXJzQXNBcnJheSA9IFtiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja107XG5cblxuICB2YXIgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuXG4gIGV2ZW50LmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICBldmVudC5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gIGV2ZW50LnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgZXZlbnQubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgZXZlbnQudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICBldmVudC50aW1lQXNBcnJheSA9IHRpbWVEYXRhLnRpbWVBc0FycmF5O1xuXG4gIC8vIGlmKG1pbGxpcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAvLyB9XG5cblxufVxuXG5cbmxldCBtaWRpTm90ZUluZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNSURJTm90ZXMoZXZlbnRzKXtcbiAgbGV0IG5vdGVzID0ge31cbiAgbGV0IG5vdGVzSW5UcmFja1xuICBsZXQgbiA9IDBcbiAgLy9jb25zb2xlLmxvZyhldmVudHMpXG4gIGZvcihsZXQgZXZlbnQgb2YgZXZlbnRzKXtcbiAgICBpZih0eXBlb2YgZXZlbnQuX3BhcnQgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBldmVudC5fdHJhY2sgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUubG9nKCdubyBwYXJ0IGFuZC9vciB0cmFjayBzZXQnLCBldmVudClcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdXG4gICAgICBpZih0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50Ll90cmFjay5pZF0gPSB7fVxuICAgICAgfVxuICAgICAgbm90ZXNJblRyYWNrW2V2ZW50LmRhdGExXSA9IGV2ZW50XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50Ll90cmFjay5pZF1cbiAgICAgIGlmKHR5cGVvZiBub3Rlc0luVHJhY2sgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy9jb25zb2xlLmluZm8obisrLCAnbm8gY29ycmVzcG9uZGluZyBub3Rlb24gZXZlbnQgZm91bmQgZm9yIGV2ZW50JywgZXZlbnQuaWQpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBsZXQgbm90ZU9uID0gbm90ZXNJblRyYWNrW2V2ZW50LmRhdGExXVxuICAgICAgbGV0IG5vdGVPZmYgPSBldmVudFxuICAgICAgaWYodHlwZW9mIG5vdGVPbiA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBub3Rlb24gZXZlbnQgZm9yIGV2ZW50JywgZXZlbnQuaWQpXG4gICAgICAgIGRlbGV0ZSBub3Rlc1tldmVudC5fdHJhY2suaWRdW2V2ZW50LmRhdGExXVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbGV0IG5vdGUgPSBuZXcgTUlESU5vdGUobm90ZU9uLCBub3RlT2ZmKVxuICAgICAgbm90ZS5fdHJhY2sgPSBub3RlT24uX3RyYWNrXG4gICAgICBub3RlID0gbnVsbFxuICAgICAgLy8gbGV0IGlkID0gYE1OXyR7bWlkaU5vdGVJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICAgIC8vIG5vdGVPbi5taWRpTm90ZUlkID0gaWRcbiAgICAgIC8vIG5vdGVPbi5vZmYgPSBub3RlT2ZmLmlkXG4gICAgICAvLyBub3RlT2ZmLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgLy8gbm90ZU9mZi5vbiA9IG5vdGVPbi5pZFxuICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50Ll90cmFjay5pZF1bZXZlbnQuZGF0YTFdXG4gICAgfVxuICB9XG4gIE9iamVjdC5rZXlzKG5vdGVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgZGVsZXRlIG5vdGVzW2tleV1cbiAgfSlcbiAgbm90ZXMgPSB7fVxuICAvL2NvbnNvbGUubG9nKG5vdGVzLCBub3Rlc0luVHJhY2spXG59XG5cblxuLy8gbm90IGluIHVzZSFcbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJFdmVudHMoZXZlbnRzKXtcbiAgbGV0IHN1c3RhaW4gPSB7fVxuICBsZXQgdG1wUmVzdWx0ID0ge31cbiAgbGV0IHJlc3VsdCA9IFtdXG4gIGZvcihsZXQgZXZlbnQgb2YgZXZlbnRzKXtcbiAgICBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgaWYodHlwZW9mIHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9ZWxzZSBpZihzdXN0YWluW2V2ZW50LnRyYWNrSWRdID09PSBldmVudC50aWNrcyl7XG4gICAgICAgICAgZGVsZXRlIHRtcFJlc3VsdFtldmVudC50aWNrc11cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgICBkZWxldGUgc3VzdGFpbltldmVudC50cmFja0lkXVxuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTIgPT09IDEyNyl7XG4gICAgICAgIHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPSBldmVudC50aWNrc1xuICAgICAgICB0bXBSZXN1bHRbZXZlbnQudGlja3NdID0gZXZlbnRcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgIH1cbiAgfVxuICBjb25zb2xlLmxvZyhzdXN0YWluKVxuICBPYmplY3Qua2V5cyh0bXBSZXN1bHQpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICBsZXQgc3VzdGFpbkV2ZW50ID0gdG1wUmVzdWx0W2tleV1cbiAgICBjb25zb2xlLmxvZyhzdXN0YWluRXZlbnQpXG4gICAgcmVzdWx0LnB1c2goc3VzdGFpbkV2ZW50KVxuICB9KVxuICByZXR1cm4gcmVzdWx0XG59XG4iLCIvLyBAIGZsb3dcblxuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwnXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgUGFydHtcblxuICBjb25zdHJ1Y3RvcihzZXR0aW5ncyA9IHt9KXtcbiAgICB0aGlzLmlkID0gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV8ke2luc3RhbmNlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gO1xuXG4gICAgKHtcbiAgICAgIG5hbWU6IHRoaXMubmFtZSA9IHRoaXMuaWQsXG4gICAgICBtdXRlZDogdGhpcy5tdXRlZCA9IGZhbHNlLFxuICAgIH0gPSBzZXR0aW5ncyk7XG5cbiAgICB0aGlzLl90cmFjayA9IG51bGxcbiAgICB0aGlzLl9zb25nID0gbnVsbFxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB0aGlzLl9zdGFydCA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgIHRoaXMuX2VuZCA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuXG4gICAgbGV0IHtldmVudHN9ID0gc2V0dGluZ3NcbiAgICBpZih0eXBlb2YgZXZlbnRzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgfVxuICB9XG5cbiAgY29weSgpe1xuICAgIGxldCBwID0gbmV3IFBhcnQodGhpcy5uYW1lICsgJ19jb3B5JykgLy8gaW1wbGVtZW50IGdldE5hbWVPZkNvcHkoKSBpbiB1dGlsIChzZWUgaGVhcnRiZWF0KVxuICAgIGxldCBldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIGxldCBjb3B5ID0gZXZlbnQuY29weSgpXG4gICAgICBjb25zb2xlLmxvZyhjb3B5KVxuICAgICAgZXZlbnRzLnB1c2goY29weSlcbiAgICB9KVxuICAgIHAuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICBwLnVwZGF0ZSgpXG4gICAgcmV0dXJuIHBcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZSh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgICBsZXQgdHJhY2sgPSB0aGlzLl90cmFja1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuX3BhcnQgPSB0aGlzXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IHRyYWNrXG4gICAgICAgIGlmKHRyYWNrLl9zb25nKXtcbiAgICAgICAgICBldmVudC5fc29uZyA9IHRyYWNrLl9zb25nXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuX2V2ZW50cy5wdXNoKC4uLmV2ZW50cylcblxuICAgIGlmKHRyYWNrKXtcbiAgICAgIHRyYWNrLl9ldmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgfVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbmV3RXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICByZW1vdmVFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgdHJhY2sgPSB0aGlzLl90cmFja1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuX3BhcnQgPSBudWxsXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbFxuICAgICAgICB0cmFjay5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgICAgIGlmKHRyYWNrLl9zb25nKXtcbiAgICAgICAgICBldmVudC5fc29uZyA9IG51bGxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYodHJhY2spe1xuICAgICAgdHJhY2suX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgICAgdHJhY2suX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gICAgfVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKHRoaXMpXG4gICAgfVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlRXZlbnRzKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCh0aGlzKVxuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZUV2ZW50c1RvKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlVG8odGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKHRoaXMpXG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuXG4gIGdldEV2ZW50cyhmaWx0ZXI6IHN0cmluZ1tdID0gbnVsbCl7IC8vIGNhbiBiZSB1c2UgYXMgZmluZEV2ZW50c1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ldmVudHNdIC8vQFRPRE8gaW1wbGVtZW50IGZpbHRlciAtPiBmaWx0ZXJFdmVudHMoKSBzaG91bGQgYmUgYSB1dGlsaXR5IGZ1bmN0aW9uIChub3QgYSBjbGFzcyBtZXRob2QpXG4gIH1cblxuICBtdXRlKGZsYWc6IGJvb2xlYW4gPSBudWxsKXtcbiAgICBpZihmbGFnKXtcbiAgICAgIHRoaXMubXV0ZWQgPSBmbGFnXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLm11dGVkID0gIXRoaXMubXV0ZWRcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKXtcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmKHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkpe1xuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgfVxuICAgIHNvcnRFdmVudHModGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICAvL0BUT0RPOiBjYWxjdWxhdGUgcGFydCBzdGFydCBhbmQgZW5kLCBhbmQgaGlnaGVzdCBhbmQgbG93ZXN0IG5vdGVcbiAgfVxufVxuIiwiaW1wb3J0IHtnZXRQb3NpdGlvbjJ9IGZyb20gJy4vcG9zaXRpb24uanMnXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lci5qcydcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsLmpzJ1xuXG5jb25zdCByYW5nZSA9IDEwIC8vIG1pbGxpc2Vjb25kcyBvciB0aWNrc1xubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBQbGF5aGVhZHtcblxuICBjb25zdHJ1Y3Rvcihzb25nLCB0eXBlID0gJ2FsbCcpe1xuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLnNvbmcgPSBzb25nXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMubGFzdEV2ZW50ID0gbnVsbFxuICAgIHRoaXMuZGF0YSA9IHt9XG5cbiAgICB0aGlzLmFjdGl2ZVBhcnRzID0gW11cbiAgICB0aGlzLmFjdGl2ZU5vdGVzID0gW11cbiAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IFtdXG4gIH1cblxuICAvLyB1bml0IGNhbiBiZSAnbWlsbGlzJyBvciAndGlja3MnXG4gIHNldCh1bml0LCB2YWx1ZSl7XG4gICAgdGhpcy51bml0ID0gdW5pdFxuICAgIHRoaXMuY3VycmVudFZhbHVlID0gdmFsdWVcbiAgICB0aGlzLmV2ZW50SW5kZXggPSAwXG4gICAgdGhpcy5ub3RlSW5kZXggPSAwXG4gICAgdGhpcy5wYXJ0SW5kZXggPSAwXG4gICAgdGhpcy5jYWxjdWxhdGUoKVxuICAgIHJldHVybiB0aGlzLmRhdGFcbiAgfVxuXG5cbiAgZ2V0KCl7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICB1cGRhdGUodW5pdCwgZGlmZil7XG4gICAgaWYoZGlmZiA9PT0gMCl7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhXG4gICAgfVxuICAgIHRoaXMudW5pdCA9IHVuaXRcbiAgICB0aGlzLmN1cnJlbnRWYWx1ZSArPSBkaWZmXG4gICAgdGhpcy5jYWxjdWxhdGUoKVxuICAgIHJldHVybiB0aGlzLmRhdGFcbiAgfVxuXG5cbiAgdXBkYXRlU29uZygpe1xuICAgIHRoaXMuZXZlbnRzID0gWy4uLnRoaXMuc29uZy5fZXZlbnRzLCAuLi50aGlzLnNvbmcuX3RpbWVFdmVudHNdXG4gICAgc29ydEV2ZW50cyh0aGlzLmV2ZW50cylcbiAgICAvL2NvbnNvbGUubG9nKCdldmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICB0aGlzLm5vdGVzID0gdGhpcy5zb25nLl9ub3Rlc1xuICAgIHRoaXMucGFydHMgPSB0aGlzLnNvbmcuX3BhcnRzXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLm51bU5vdGVzID0gdGhpcy5ub3Rlcy5sZW5ndGhcbiAgICB0aGlzLm51bVBhcnRzID0gdGhpcy5wYXJ0cy5sZW5ndGhcbiAgICB0aGlzLnNldCgnbWlsbGlzJywgdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzKVxuICB9XG5cblxuICBjYWxjdWxhdGUoKXtcbiAgICBsZXQgaVxuICAgIGxldCB2YWx1ZVxuICAgIGxldCBldmVudFxuICAgIGxldCBub3RlXG4gICAgbGV0IHBhcnRcbiAgICBsZXQgcG9zaXRpb25cbiAgICBsZXQgc3RpbGxBY3RpdmVOb3RlcyA9IFtdXG4gICAgbGV0IHN0aWxsQWN0aXZlUGFydHMgPSBbXVxuICAgIGxldCBjb2xsZWN0ZWRQYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGxldCBjb2xsZWN0ZWROb3RlcyA9IG5ldyBTZXQoKVxuXG4gICAgdGhpcy5kYXRhID0ge31cbiAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IFtdXG4gICAgbGV0IHN1c3RhaW5wZWRhbEV2ZW50cyA9IFtdXG5cbiAgICBmb3IoaSA9IHRoaXMuZXZlbnRJbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspe1xuICAgICAgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXVxuICAgICAgdmFsdWUgPSBldmVudFt0aGlzLnVuaXRdXG4gICAgICBpZih2YWx1ZSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgIC8vIGlmIHRoZSBwbGF5aGVhZCBpcyBzZXQgdG8gYSBwb3NpdGlvbiBvZiBzYXkgMzAwMCBtaWxsaXMsIHdlIGRvbid0IHdhbnQgdG8gYWRkIGV2ZW50cyBtb3JlIHRoYXQgMTAgdW5pdHMgYmVmb3JlIHRoZSBwbGF5aGVhZFxuICAgICAgICBpZih2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA+IHRoaXMuY3VycmVudFZhbHVlIC0gcmFuZ2Upe1xuICAgICAgICAgIHRoaXMuYWN0aXZlRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgICAgLy8gdGhpcyBkb2Vzbid0IHdvcmsgdG9vIHdlbGxcbiAgICAgICAgICBpZihldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTIpXG4gICAgICAgICAgICBpZihldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsMicsXG4gICAgICAgICAgICAgICAgZGF0YTogZXZlbnQuZGF0YTIgPT09IDEyNyA/ICdkb3duJyA6ICd1cCdcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgc3VzdGFpbnBlZGFsRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgLy8gfWVsc2V7XG4gICAgICAgICAgLy8gICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAvLyAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgICAvLyAgICAgZGF0YTogZXZlbnRcbiAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICAgICAgZGF0YTogZXZlbnRcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdEV2ZW50ID0gZXZlbnRcbiAgICAgICAgdGhpcy5ldmVudEluZGV4KytcbiAgICAgIH1lbHNle1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBsZXQgbnVtID0gc3VzdGFpbnBlZGFsRXZlbnRzLmxlbmd0aFxuICAgIC8vIGlmKG51bSA+IDApe1xuICAgIC8vICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50VmFsdWUsIG51bSwgc3VzdGFpbnBlZGFsRXZlbnRzW251bSAtIDFdLmRhdGEyLCBzdXN0YWlucGVkYWxFdmVudHMpXG4gICAgLy8gfVxuXG4gICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgIHRoaXMuZGF0YS5hY3RpdmVFdmVudHMgPSB0aGlzLmFjdGl2ZUV2ZW50c1xuXG4gICAgLy8gaWYgYSBzb25nIGhhcyBubyBldmVudHMgeWV0LCB1c2UgdGhlIGZpcnN0IHRpbWUgZXZlbnQgYXMgcmVmZXJlbmNlXG4gICAgaWYodGhpcy5sYXN0RXZlbnQgPT09IG51bGwpe1xuICAgICAgdGhpcy5sYXN0RXZlbnQgPSB0aGlzLnNvbmcuX3RpbWVFdmVudHNbMF1cbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IGdldFBvc2l0aW9uMih0aGlzLnNvbmcsIHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUsICdhbGwnLCB0aGlzLmxhc3RFdmVudClcbiAgICB0aGlzLmRhdGEuZXZlbnRJbmRleCA9IHRoaXMuZXZlbnRJbmRleFxuICAgIHRoaXMuZGF0YS5taWxsaXMgPSBwb3NpdGlvbi5taWxsaXNcbiAgICB0aGlzLmRhdGEudGlja3MgPSBwb3NpdGlvbi50aWNrc1xuICAgIHRoaXMuZGF0YS5wb3NpdGlvbiA9IHBvc2l0aW9uXG5cbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKXtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhXG4gICAgICBmb3IobGV0IGtleSBvZiBPYmplY3Qua2V5cyhwb3NpdGlvbikpe1xuICAgICAgICBkYXRhW2tleV0gPSBwb3NpdGlvbltrZXldXG4gICAgICB9XG4gICAgfWVsc2UgaWYodGhpcy50eXBlLmluZGV4T2YoJ2JhcnNiZWF0cycpICE9PSAtMSl7XG4gICAgICB0aGlzLmRhdGEuYmFyID0gcG9zaXRpb24uYmFyXG4gICAgICB0aGlzLmRhdGEuYmVhdCA9IHBvc2l0aW9uLmJlYXRcbiAgICAgIHRoaXMuZGF0YS5zaXh0ZWVudGggPSBwb3NpdGlvbi5zaXh0ZWVudGhcbiAgICAgIHRoaXMuZGF0YS50aWNrID0gcG9zaXRpb24udGlja1xuICAgICAgdGhpcy5kYXRhLmJhcnNBc1N0cmluZyA9IHBvc2l0aW9uLmJhcnNBc1N0cmluZ1xuXG4gICAgICB0aGlzLmRhdGEudGlja3NQZXJCYXIgPSBwb3NpdGlvbi50aWNrc1BlckJhclxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmVhdCA9IHBvc2l0aW9uLnRpY2tzUGVyQmVhdFxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gcG9zaXRpb24udGlja3NQZXJTaXh0ZWVudGhcbiAgICAgIHRoaXMuZGF0YS5udW1TaXh0ZWVudGggPSBwb3NpdGlvbi5udW1TaXh0ZWVudGhcblxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCd0aW1lJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5ob3VyID0gcG9zaXRpb24uaG91clxuICAgICAgdGhpcy5kYXRhLm1pbnV0ZSA9IHBvc2l0aW9uLm1pbnV0ZVxuICAgICAgdGhpcy5kYXRhLnNlY29uZCA9IHBvc2l0aW9uLnNlY29uZFxuICAgICAgdGhpcy5kYXRhLm1pbGxpc2Vjb25kID0gcG9zaXRpb24ubWlsbGlzZWNvbmRcbiAgICAgIHRoaXMuZGF0YS50aW1lQXNTdHJpbmcgPSBwb3NpdGlvbi50aW1lQXNTdHJpbmdcblxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCdwZXJjZW50YWdlJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5wZXJjZW50YWdlID0gcG9zaXRpb24ucGVyY2VudGFnZVxuICAgIH1cblxuICAgIC8vIGdldCBhY3RpdmUgbm90ZXNcbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZignbm90ZXMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG5cbiAgICAgIC8vIGdldCBhbGwgbm90ZXMgYmV0d2VlbiB0aGUgbm90ZUluZGV4IGFuZCB0aGUgY3VycmVudCBwbGF5aGVhZCBwb3NpdGlvblxuICAgICAgZm9yKGkgPSB0aGlzLm5vdGVJbmRleDsgaSA8IHRoaXMubnVtTm90ZXM7IGkrKyl7XG4gICAgICAgIG5vdGUgPSB0aGlzLm5vdGVzW2ldXG4gICAgICAgIHZhbHVlID0gbm90ZS5ub3RlT25bdGhpcy51bml0XVxuICAgICAgICBpZih2YWx1ZSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgdGhpcy5ub3RlSW5kZXgrK1xuICAgICAgICAgIGlmKHR5cGVvZiBub3RlLm5vdGVPZmYgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBpZiB0aGUgcGxheWhlYWQgaXMgc2V0IHRvIGEgcG9zaXRpb24gb2Ygc2F5IDMwMDAgbWlsbGlzLCB3ZSBkb24ndCB3YW50IHRvIGFkZCBub3RlcyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgICAgaWYodGhpcy5jdXJyZW50VmFsdWUgPT09IDAgfHwgbm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgICBjb2xsZWN0ZWROb3Rlcy5hZGQobm90ZSlcbiAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgICB0eXBlOiAnbm90ZU9uJyxcbiAgICAgICAgICAgICAgZGF0YTogbm90ZS5ub3RlT25cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBmaWx0ZXIgbm90ZXMgdGhhdCBhcmUgbm8gbG9uZ2VyIGFjdGl2ZVxuICAgICAgZm9yKGkgPSB0aGlzLmFjdGl2ZU5vdGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcbiAgICAgICAgbm90ZSA9IHRoaXMuYWN0aXZlTm90ZXNbaV07XG4gICAgICAgIC8vaWYobm90ZS5ub3RlT24uc3RhdGUuaW5kZXhPZigncmVtb3ZlZCcpID09PSAwIHx8IHRoaXMuc29uZy5fbm90ZXNCeUlkLmdldChub3RlLmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICBpZih0aGlzLnNvbmcuX25vdGVzQnlJZC5nZXQobm90ZS5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdza2lwcGluZyByZW1vdmVkIG5vdGUnLCBub3RlLmlkKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHR5cGVvZiBub3RlLm5vdGVPZmYgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ25vdGUgd2l0aCBpZCcsIG5vdGUuaWQsICdoYXMgbm8gbm90ZU9mZiBldmVudCcpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZihub3RlLm5vdGVPZmZbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlICYmIGNvbGxlY3RlZE5vdGVzLmhhcyhub3RlKSA9PT0gZmFsc2Upe1xuICAgICAgICBpZihub3RlLm5vdGVPZmZbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICBzdGlsbEFjdGl2ZU5vdGVzLnB1c2gobm90ZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ25vdGVPZmYnLFxuICAgICAgICAgICAgZGF0YTogbm90ZS5ub3RlT2ZmXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBhZGQgdGhlIHN0aWxsIGFjdGl2ZSBub3RlcyBhbmQgdGhlIG5ld2x5IGFjdGl2ZSBldmVudHMgdG8gdGhlIGFjdGl2ZSBub3RlcyBhcnJheVxuICAgICAgdGhpcy5hY3RpdmVOb3RlcyA9IFsuLi5jb2xsZWN0ZWROb3Rlcy52YWx1ZXMoKSwgLi4uc3RpbGxBY3RpdmVOb3Rlc11cbiAgICAgIHRoaXMuZGF0YS5hY3RpdmVOb3RlcyA9IHRoaXMuYWN0aXZlTm90ZXNcbiAgICB9XG5cblxuICAgIC8vIGdldCBhY3RpdmUgcGFydHNcbiAgICBpZih0aGlzLnR5cGUuaW5kZXhPZigncGFydHMnKSAhPT0gLTEgfHwgdGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG5cbiAgICAgIGZvcihpID0gdGhpcy5wYXJ0SW5kZXg7IGkgPCB0aGlzLm51bVBhcnRzOyBpKyspe1xuICAgICAgICBwYXJ0ID0gdGhpcy5wYXJ0c1tpXVxuICAgICAgICAvL2NvbnNvbGUubG9nKHBhcnQsIHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgICAgICBpZihwYXJ0Ll9zdGFydFt0aGlzLnVuaXRdIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICBjb2xsZWN0ZWRQYXJ0cy5hZGQocGFydClcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdwYXJ0T24nLFxuICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgIH0pXG4gICAgICAgICAgdGhpcy5wYXJ0SW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgICAgLy8gZmlsdGVyIHBhcnRzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgIGZvcihpID0gdGhpcy5hY3RpdmVQYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgICAgIHBhcnQgPSB0aGlzLmFjdGl2ZVBhcnRzW2ldO1xuICAgICAgICAvL2lmKHBhcnQuc3RhdGUuaW5kZXhPZigncmVtb3ZlZCcpID09PSAwIHx8IHRoaXMuc29uZy5fcGFydHNCeUlkLmdldChwYXJ0LmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICBpZih0aGlzLnNvbmcuX3BhcnRzQnlJZC5nZXQocGFydC5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdza2lwcGluZyByZW1vdmVkIHBhcnQnLCBwYXJ0LmlkKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYocGFydC5fZW5kW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSAmJiBjb2xsZWN0ZWRQYXJ0cy5oYXMocGFydCkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYocGFydC5fZW5kW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgc3RpbGxBY3RpdmVQYXJ0cy5wdXNoKG5vdGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdwYXJ0T2ZmJyxcbiAgICAgICAgICAgIGRhdGE6IHBhcnRcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWN0aXZlUGFydHMgPSBbLi4uY29sbGVjdGVkUGFydHMudmFsdWVzKCksIC4uLnN0aWxsQWN0aXZlUGFydHNdXG4gICAgICB0aGlzLmRhdGEuYWN0aXZlUGFydHMgPSB0aGlzLmFjdGl2ZVBhcnRzXG4gICAgfVxuXG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgfSlcblxuICB9XG5cbi8qXG4gIHNldFR5cGUodCl7XG4gICAgdGhpcy50eXBlID0gdDtcbiAgICB0aGlzLnNldCh0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG5cblxuICBhZGRUeXBlKHQpe1xuICAgIHRoaXMudHlwZSArPSAnICcgKyB0O1xuICAgIHRoaXMuc2V0KHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gIH1cblxuICByZW1vdmVUeXBlKHQpe1xuICAgIHZhciBhcnIgPSB0aGlzLnR5cGUuc3BsaXQoJyAnKTtcbiAgICB0aGlzLnR5cGUgPSAnJztcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbih0eXBlKXtcbiAgICAgIGlmKHR5cGUgIT09IHQpe1xuICAgICAgICB0aGlzLnR5cGUgKz0gdCArICcgJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnR5cGUudHJpbSgpO1xuICAgIHRoaXMuc2V0KHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG4qL1xuXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7Z2V0TmljZVRpbWV9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0XG4gIHN1cHBvcnRlZFR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlJyxcbiAgc3VwcG9ydGVkUmV0dXJuVHlwZXMgPSAnYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBhbGwnLFxuICBmbG9vciA9IE1hdGguZmxvb3IsXG4gIHJvdW5kID0gTWF0aC5yb3VuZDtcblxuXG5sZXRcbiAgLy9sb2NhbFxuICBicG0sXG4gIG5vbWluYXRvcixcbiAgZGVub21pbmF0b3IsXG5cbiAgdGlja3NQZXJCZWF0LFxuICB0aWNrc1BlckJhcixcbiAgdGlja3NQZXJTaXh0ZWVudGgsXG5cbiAgbWlsbGlzUGVyVGljayxcbiAgc2Vjb25kc1BlclRpY2ssXG4gIG51bVNpeHRlZW50aCxcblxuICB0aWNrcyxcbiAgbWlsbGlzLFxuICBkaWZmVGlja3MsXG4gIGRpZmZNaWxsaXMsXG5cbiAgYmFyLFxuICBiZWF0LFxuICBzaXh0ZWVudGgsXG4gIHRpY2ssXG5cbi8vICB0eXBlLFxuICBpbmRleCxcbiAgcmV0dXJuVHlwZSA9ICdhbGwnLFxuICBiZXlvbmRFbmRPZlNvbmcgPSB0cnVlO1xuXG5cbmZ1bmN0aW9uIGdldFRpbWVFdmVudChzb25nLCB1bml0LCB0YXJnZXQpe1xuICAvLyBmaW5kcyB0aGUgdGltZSBldmVudCB0aGF0IGNvbWVzIHRoZSBjbG9zZXN0IGJlZm9yZSB0aGUgdGFyZ2V0IHBvc2l0aW9uXG4gIGxldCB0aW1lRXZlbnRzID0gc29uZy5fdGltZUV2ZW50c1xuICAvL2NvbnNvbGUubG9nKHNvbmcuX3RpbWVFdmVudHMsIHVuaXQsIHRhcmdldClcblxuICBmb3IobGV0IGkgPSB0aW1lRXZlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcbiAgICBsZXQgZXZlbnQgPSB0aW1lRXZlbnRzW2ldO1xuICAgIC8vY29uc29sZS5sb2codW5pdCwgdGFyZ2V0LCBldmVudClcbiAgICBpZihldmVudFt1bml0XSA8PSB0YXJnZXQpe1xuICAgICAgaW5kZXggPSBpXG4gICAgICByZXR1cm4gZXZlbnRcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9UaWNrcyhzb25nLCB0YXJnZXRNaWxsaXMsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldE1pbGxpcylcbiAgLy9yZXR1cm4gcm91bmQodGlja3MpO1xuICByZXR1cm4gdGlja3Ncbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdGlja3NUb01pbGxpcyhzb25nLCB0YXJnZXRUaWNrcywgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21UaWNrcyhzb25nLCB0YXJnZXRUaWNrcylcbiAgcmV0dXJuIG1pbGxpc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBiYXJzVG9NaWxsaXMoc29uZywgcG9zaXRpb24sIGJlb3MpeyAvLyBiZW9zID0gYmV5b25kRW5kT2ZTb25nXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXQnLFxuICAgIHBvc2l0aW9uLFxuICAgIHJlc3VsdDogJ21pbGxpcycsXG4gICAgYmVvcyxcbiAgfSlcbiAgcmV0dXJuIG1pbGxpc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBiYXJzVG9UaWNrcyhzb25nLCBwb3NpdGlvbiwgYmVvcyl7IC8vIGJlb3MgPSBiZXlvbmRFbmRPZlNvbmdcbiAgY2FsY3VsYXRlUG9zaXRpb24oc29uZywge1xuICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgIHBvc2l0aW9uLFxuICAgIHJlc3VsdDogJ3RpY2tzJyxcbiAgICBiZW9zXG4gIH0pXG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tzVG9CYXJzKHNvbmcsIHRhcmdldCwgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21UaWNrcyhzb25nLCB0YXJnZXQpXG4gIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJ1xuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKClcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9CYXJzKHNvbmcsIHRhcmdldCwgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0KVxuICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICByZXR1cm5UeXBlID0gJ2JhcnNhbmRiZWF0cydcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpXG59XG5cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgbWlsbGlzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldE1pbGxpcywgZXZlbnQpe1xuICBsZXQgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2Upe1xuICAgIGlmKHRhcmdldE1pbGxpcyA+IGxhc3RFdmVudC5taWxsaXMpe1xuICAgICAgdGFyZ2V0TWlsbGlzID0gbGFzdEV2ZW50Lm1pbGxpcztcbiAgICB9XG4gIH1cblxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnbWlsbGlzJywgdGFyZ2V0TWlsbGlzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IG1pbGxpcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmKGV2ZW50Lm1pbGxpcyA9PT0gdGFyZ2V0TWlsbGlzKXtcbiAgICBkaWZmTWlsbGlzID0gMDtcbiAgICBkaWZmVGlja3MgPSAwO1xuICB9ZWxzZXtcbiAgICBkaWZmTWlsbGlzID0gdGFyZ2V0TWlsbGlzIC0gZXZlbnQubWlsbGlzO1xuICAgIGRpZmZUaWNrcyA9IGRpZmZNaWxsaXMgLyBtaWxsaXNQZXJUaWNrO1xuICB9XG5cbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG4gIHRpY2tzICs9IGRpZmZUaWNrcztcblxuICByZXR1cm4gdGlja3M7XG59XG5cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgdGlja3MgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21UaWNrcyhzb25nLCB0YXJnZXRUaWNrcywgZXZlbnQpe1xuICBsZXQgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2Upe1xuICAgIGlmKHRhcmdldFRpY2tzID4gbGFzdEV2ZW50LnRpY2tzKXtcbiAgICAgIHRhcmdldFRpY2tzID0gbGFzdEV2ZW50LnRpY2tzO1xuICAgIH1cbiAgfVxuXG4gIGlmKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICd0aWNrcycsIHRhcmdldFRpY2tzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IHRpY2tzLCBjYWxjdWxhdGUgdGhlIGRpZmZcbiAgaWYoZXZlbnQudGlja3MgPT09IHRhcmdldFRpY2tzKXtcbiAgICBkaWZmVGlja3MgPSAwO1xuICAgIGRpZmZNaWxsaXMgPSAwO1xuICB9ZWxzZXtcbiAgICBkaWZmVGlja3MgPSB0YXJnZXRUaWNrcyAtIHRpY2tzO1xuICAgIGRpZmZNaWxsaXMgPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuICB9XG5cbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcblxuICByZXR1cm4gbWlsbGlzO1xufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIGJhcnMgYW5kIGJlYXRzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tQmFycyhzb25nLCB0YXJnZXRCYXIsIHRhcmdldEJlYXQsIHRhcmdldFNpeHRlZW50aCwgdGFyZ2V0VGljaywgZXZlbnQgPSBudWxsKXtcbiAgLy9jb25zb2xlLnRpbWUoJ2Zyb21CYXJzJyk7XG4gIGxldCBpID0gMCxcbiAgICBkaWZmQmFycyxcbiAgICBkaWZmQmVhdHMsXG4gICAgZGlmZlNpeHRlZW50aCxcbiAgICBkaWZmVGljayxcbiAgICBsYXN0RXZlbnQgPSBzb25nLl9sYXN0RXZlbnQ7XG5cbiAgaWYoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSl7XG4gICAgaWYodGFyZ2V0QmFyID4gbGFzdEV2ZW50LmJhcil7XG4gICAgICB0YXJnZXRCYXIgPSBsYXN0RXZlbnQuYmFyO1xuICAgIH1cbiAgfVxuXG4gIGlmKGV2ZW50ID09PSBudWxsKXtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnYmFyJywgdGFyZ2V0QmFyKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvL2NvcnJlY3Qgd3JvbmcgcG9zaXRpb24gZGF0YSwgZm9yIGluc3RhbmNlOiAnMywzLDIsNzg4JyBiZWNvbWVzICczLDQsNCwwNjgnIGluIGEgNC80IG1lYXN1cmUgYXQgUFBRIDQ4MFxuICB3aGlsZSh0YXJnZXRUaWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICB0YXJnZXRTaXh0ZWVudGgrKztcbiAgICB0YXJnZXRUaWNrIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICB9XG5cbiAgd2hpbGUodGFyZ2V0U2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKXtcbiAgICB0YXJnZXRCZWF0Kys7XG4gICAgdGFyZ2V0U2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgfVxuXG4gIHdoaWxlKHRhcmdldEJlYXQgPiBub21pbmF0b3Ipe1xuICAgIHRhcmdldEJhcisrO1xuICAgIHRhcmdldEJlYXQgLT0gbm9taW5hdG9yO1xuICB9XG5cbiAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ2JhcicsIHRhcmdldEJhciwgaW5kZXgpO1xuICBmb3IoaSA9IGluZGV4OyBpID49IDA7IGktLSl7XG4gICAgZXZlbnQgPSBzb25nLl90aW1lRXZlbnRzW2ldO1xuICAgIGlmKGV2ZW50LmJhciA8PSB0YXJnZXRCYXIpe1xuICAgICAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBnZXQgdGhlIGRpZmZlcmVuY2VzXG4gIGRpZmZUaWNrID0gdGFyZ2V0VGljayAtIHRpY2s7XG4gIGRpZmZTaXh0ZWVudGggPSB0YXJnZXRTaXh0ZWVudGggLSBzaXh0ZWVudGg7XG4gIGRpZmZCZWF0cyA9IHRhcmdldEJlYXQgLSBiZWF0O1xuICBkaWZmQmFycyA9IHRhcmdldEJhciAtIGJhcjsgLy9iYXIgaXMgYWx3YXlzIGxlc3MgdGhlbiBvciBlcXVhbCB0byB0YXJnZXRCYXIsIHNvIGRpZmZCYXJzIGlzIGFsd2F5cyA+PSAwXG5cbiAgLy9jb25zb2xlLmxvZygnZGlmZicsZGlmZkJhcnMsZGlmZkJlYXRzLGRpZmZTaXh0ZWVudGgsZGlmZlRpY2spO1xuICAvL2NvbnNvbGUubG9nKCdtaWxsaXMnLG1pbGxpcyx0aWNrc1BlckJhcix0aWNrc1BlckJlYXQsdGlja3NQZXJTaXh0ZWVudGgsbWlsbGlzUGVyVGljayk7XG5cbiAgLy8gY29udmVydCBkaWZmZXJlbmNlcyB0byBtaWxsaXNlY29uZHMgYW5kIHRpY2tzXG4gIGRpZmZNaWxsaXMgPSAoZGlmZkJhcnMgKiB0aWNrc1BlckJhcikgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IChkaWZmQmVhdHMgKiB0aWNrc1BlckJlYXQpICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSAoZGlmZlNpeHRlZW50aCAqIHRpY2tzUGVyU2l4dGVlbnRoKSAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gZGlmZlRpY2sgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgLy9jb25zb2xlLmxvZyhkaWZmQmFycywgdGlja3NQZXJCYXIsIG1pbGxpc1BlclRpY2ssIGRpZmZNaWxsaXMsIGRpZmZUaWNrcyk7XG5cbiAgLy8gc2V0IGFsbCBjdXJyZW50IHBvc2l0aW9uIGRhdGFcbiAgYmFyID0gdGFyZ2V0QmFyO1xuICBiZWF0ID0gdGFyZ2V0QmVhdDtcbiAgc2l4dGVlbnRoID0gdGFyZ2V0U2l4dGVlbnRoO1xuICB0aWNrID0gdGFyZ2V0VGljaztcbiAgLy9jb25zb2xlLmxvZyh0aWNrLCB0YXJnZXRUaWNrKVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICAvL2NvbnNvbGUubG9nKHRhcmdldEJhciwgdGFyZ2V0QmVhdCwgdGFyZ2V0U2l4dGVlbnRoLCB0YXJnZXRUaWNrLCAnIC0+ICcsIG1pbGxpcyk7XG4gIHRpY2tzICs9IGRpZmZUaWNrcztcblxuICAvL2NvbnNvbGUudGltZUVuZCgnZnJvbUJhcnMnKTtcbn1cblxuXG5mdW5jdGlvbiBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKXtcbiAgLy8gc3ByZWFkIHRoZSBkaWZmZXJlbmNlIGluIHRpY2sgb3ZlciBiYXJzLCBiZWF0cyBhbmQgc2l4dGVlbnRoXG4gIGxldCB0bXAgPSByb3VuZChkaWZmVGlja3MpO1xuICB3aGlsZSh0bXAgPj0gdGlja3NQZXJTaXh0ZWVudGgpe1xuICAgIHNpeHRlZW50aCsrO1xuICAgIHRtcCAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgIGJlYXQrKztcbiAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgYmFyKys7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHRpY2sgPSByb3VuZCh0bXApO1xufVxuXG5cbi8vIHN0b3JlIHByb3BlcnRpZXMgb2YgZXZlbnQgaW4gbG9jYWwgc2NvcGVcbmZ1bmN0aW9uIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpe1xuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcbiAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBiYXIgPSBldmVudC5iYXI7XG4gIGJlYXQgPSBldmVudC5iZWF0O1xuICBzaXh0ZWVudGggPSBldmVudC5zaXh0ZWVudGg7XG4gIHRpY2sgPSBldmVudC50aWNrO1xuXG4gIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAvL2NvbnNvbGUubG9nKGJwbSwgZXZlbnQudHlwZSk7XG4gIC8vY29uc29sZS5sb2coJ3RpY2tzJywgdGlja3MsICdtaWxsaXMnLCBtaWxsaXMsICdiYXInLCBiYXIpO1xufVxuXG5cbmZ1bmN0aW9uIGdldFBvc2l0aW9uRGF0YShzb25nKXtcbiAgbGV0IHRpbWVEYXRhLFxuICAgIHBvc2l0aW9uRGF0YSA9IHt9O1xuXG4gIHN3aXRjaChyZXR1cm5UeXBlKXtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5taWxsaXMgPSBtaWxsaXM7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzID0gcm91bmQobWlsbGlzICogMTAwMCkgLyAxMDAwO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1JvdW5kZWQgPSByb3VuZChtaWxsaXMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrcyA9IHRpY2tzO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzID0gcm91bmQodGlja3MpO1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3NVbnJvdW5kZWQgPSB0aWNrcztcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgcG9zaXRpb25EYXRhLmJhciA9IGJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5iZWF0ID0gYmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEudGljayA9IHRpY2s7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGlja0FzU3RyaW5nO1xuICAgICAgcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyBnZXRUaWNrQXNTdHJpbmcodGljayk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuICAgICAgcG9zaXRpb25EYXRhLmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2FsbCc6XG4gICAgICAvLyBtaWxsaXNcbiAgICAgIC8vcG9zaXRpb25EYXRhLm1pbGxpcyA9IG1pbGxpcztcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXMgPSByb3VuZChtaWxsaXMgKiAxMDAwKSAvIDEwMDA7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUm91bmRlZCA9IHJvdW5kKG1pbGxpcyk7XG5cbiAgICAgIC8vIHRpY2tzXG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrcyA9IHRpY2tzO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzID0gcm91bmQodGlja3MpO1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3NVbnJvdW5kZWQgPSB0aWNrcztcblxuICAgICAgLy8gYmFyc2JlYXRzXG4gICAgICBwb3NpdGlvbkRhdGEuYmFyID0gYmFyO1xuICAgICAgcG9zaXRpb25EYXRhLmJlYXQgPSBiZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrID0gdGljaztcbiAgICAgIC8vcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIGdldFRpY2tBc1N0cmluZyh0aWNrKTtcblxuICAgICAgLy8gdGltZVxuICAgICAgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuICAgICAgcG9zaXRpb25EYXRhLmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG5cbiAgICAgIC8vIGV4dHJhIGRhdGFcbiAgICAgIHBvc2l0aW9uRGF0YS5icG0gPSByb3VuZChicG0gKiBzb25nLnBsYXliYWNrU3BlZWQsIDMpO1xuICAgICAgcG9zaXRpb25EYXRhLm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuXG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJTaXh0ZWVudGggPSB0aWNrc1BlclNpeHRlZW50aDtcblxuICAgICAgcG9zaXRpb25EYXRhLm51bVNpeHRlZW50aCA9IG51bVNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuXG4gICAgICAvLyB1c2UgdGlja3MgdG8gbWFrZSB0ZW1wbyBjaGFuZ2VzIHZpc2libGUgYnkgYSBmYXN0ZXIgbW92aW5nIHBsYXloZWFkXG4gICAgICBwb3NpdGlvbkRhdGEucGVyY2VudGFnZSA9IHRpY2tzIC8gc29uZy5fZHVyYXRpb25UaWNrcztcbiAgICAgIC8vcG9zaXRpb25EYXRhLnBlcmNlbnRhZ2UgPSBtaWxsaXMgLyBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsXG4gIH1cblxuICByZXR1cm4gcG9zaXRpb25EYXRhXG59XG5cblxuZnVuY3Rpb24gZ2V0VGlja0FzU3RyaW5nKHQpe1xuICBpZih0ID09PSAwKXtcbiAgICB0ID0gJzAwMCdcbiAgfWVsc2UgaWYodCA8IDEwKXtcbiAgICB0ID0gJzAwJyArIHRcbiAgfWVsc2UgaWYodCA8IDEwMCl7XG4gICAgdCA9ICcwJyArIHRcbiAgfVxuICByZXR1cm4gdFxufVxuXG5cbi8vIHVzZWQgYnkgcGxheWhlYWRcbmV4cG9ydCBmdW5jdGlvbiBnZXRQb3NpdGlvbjIoc29uZywgdW5pdCwgdGFyZ2V0LCB0eXBlLCBldmVudCl7XG4gIGlmKHVuaXQgPT09ICdtaWxsaXMnKXtcbiAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldCwgZXZlbnQpO1xuICB9ZWxzZSBpZih1bml0ID09PSAndGlja3MnKXtcbiAgICBmcm9tVGlja3Moc29uZywgdGFyZ2V0LCBldmVudCk7XG4gIH1cbiAgcmV0dXJuVHlwZSA9IHR5cGVcbiAgaWYocmV0dXJuVHlwZSA9PT0gJ2FsbCcpe1xuICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICB9XG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG59XG5cblxuLy8gaW1wcm92ZWQgdmVyc2lvbiBvZiBnZXRQb3NpdGlvblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHNldHRpbmdzKXtcbiAgbGV0IHtcbiAgICB0eXBlLCAvLyBhbnkgb2YgYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBwZXJjIHBlcmNlbnRhZ2VcbiAgICB0YXJnZXQsIC8vIGlmIHR5cGUgaXMgYmFyc2JlYXRzIG9yIHRpbWUsIHRhcmdldCBtdXN0IGJlIGFuIGFycmF5LCBlbHNlIGlmIG11c3QgYmUgYSBudW1iZXJcbiAgICByZXN1bHQ6IHJlc3VsdCA9ICdhbGwnLCAvLyBhbnkgb2YgYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBhbGxcbiAgICBiZW9zOiBiZW9zID0gdHJ1ZSxcbiAgICBzbmFwOiBzbmFwID0gLTFcbiAgfSA9IHNldHRpbmdzXG5cbiAgaWYoc3VwcG9ydGVkUmV0dXJuVHlwZXMuaW5kZXhPZihyZXN1bHQpID09PSAtMSl7XG4gICAgY29uc29sZS53YXJuKGB1bnN1cHBvcnRlZCByZXR1cm4gdHlwZSwgJ2FsbCcgdXNlZCBpbnN0ZWFkIG9mICcke3Jlc3VsdH0nYClcbiAgICByZXN1bHQgPSAnYWxsJ1xuICB9XG5cbiAgcmV0dXJuVHlwZSA9IHJlc3VsdFxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG5cbiAgaWYoc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSA9PT0gLTEpe1xuICAgIGNvbnNvbGUuZXJyb3IoYHVuc3VwcG9ydGVkIHR5cGUgJHt0eXBlfWApXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuXG4gIHN3aXRjaCh0eXBlKXtcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIGxldCBbdGFyZ2V0YmFyID0gMSwgdGFyZ2V0YmVhdCA9IDEsIHRhcmdldHNpeHRlZW50aCA9IDEsIHRhcmdldHRpY2sgPSAwXSA9IHRhcmdldFxuICAgICAgLy9jb25zb2xlLmxvZyh0YXJnZXRiYXIsIHRhcmdldGJlYXQsIHRhcmdldHNpeHRlZW50aCwgdGFyZ2V0dGljaylcbiAgICAgIGZyb21CYXJzKHNvbmcsIHRhcmdldGJhciwgdGFyZ2V0YmVhdCwgdGFyZ2V0c2l4dGVlbnRoLCB0YXJnZXR0aWNrKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICAvLyBjYWxjdWxhdGUgbWlsbGlzIG91dCBvZiB0aW1lIGFycmF5OiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG4gICAgICBsZXQgW3RhcmdldGhvdXIgPSAwLCB0YXJnZXRtaW51dGUgPSAwLCB0YXJnZXRzZWNvbmQgPSAwLCB0YXJnZXRtaWxsaXNlY29uZCA9IDBdID0gdGFyZ2V0XG4gICAgICBsZXQgbWlsbGlzID0gMFxuICAgICAgbWlsbGlzICs9IHRhcmdldGhvdXIgKiA2MCAqIDYwICogMTAwMCAvL2hvdXJzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0bWludXRlICogNjAgKiAxMDAwIC8vbWludXRlc1xuICAgICAgbWlsbGlzICs9IHRhcmdldHNlY29uZCAqIDEwMDAgLy9zZWNvbmRzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0bWlsbGlzZWNvbmQgLy9taWxsaXNlY29uZHNcblxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0KVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIC8vY29uc29sZS5sb2coc29uZywgdGFyZ2V0KVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldClcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICdwZXJjJzpcbiAgICBjYXNlICdwZXJjZW50YWdlJzpcblxuICAgICAgLy9taWxsaXMgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICAvL2Zyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzKTtcblxuICAgICAgdGlja3MgPSB0YXJnZXQgKiBzb25nLl9kdXJhdGlvblRpY2tzIC8vIHRhcmdldCBtdXN0IGJlIGluIHRpY2tzIVxuICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcywgc29uZy5fZHVyYXRpb25UaWNrcylcbiAgICAgIGlmKHNuYXAgIT09IC0xKXtcbiAgICAgICAgdGlja3MgPSBmbG9vcih0aWNrcyAvIHNuYXApICogc25hcDtcbiAgICAgICAgLy9mcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRpY2tzKTtcbiAgICAgIH1cbiAgICAgIGZyb21UaWNrcyhzb25nLCB0aWNrcylcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICBsZXQgdG1wID0gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG4gICAgICAvL2NvbnNvbGUubG9nKCdkaWZmJywgcG9zaXRpb25bMV0gLSB0bXAucGVyY2VudGFnZSk7XG4gICAgICByZXR1cm4gdG1wXG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuLypcblxuLy9AcGFyYW06ICdtaWxsaXMnLCAxMDAwLCBbdHJ1ZV1cbi8vQHBhcmFtOiAndGlja3MnLCAxMDAwLCBbdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgMSwgWydhbGwnLCB0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCA2MCwgNCwgMywgMTIwLCBbJ2FsbCcsIHRydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDYwLCA0LCAzLCAxMjAsIFt0cnVlLCAnYWxsJ11cblxuZnVuY3Rpb24gY2hlY2tQb3NpdGlvbih0eXBlLCBhcmdzLCByZXR1cm5UeXBlID0gJ2FsbCcpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSB0cnVlO1xuICBjb25zb2xlLmxvZygnLS0tLT4gY2hlY2tQb3NpdGlvbjonLCBhcmdzLCB0eXBlU3RyaW5nKGFyZ3MpKTtcblxuICBpZih0eXBlU3RyaW5nKGFyZ3MpID09PSAnYXJyYXknKXtcbiAgICBsZXRcbiAgICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICAgIHBvc2l0aW9uLFxuICAgICAgaSwgYSwgcG9zaXRpb25MZW5ndGg7XG5cbiAgICB0eXBlID0gYXJnc1swXTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIFtbJ21pbGxpcycsIDMwMDBdXVxuICAgIGlmKHR5cGVTdHJpbmcoYXJnc1swXSkgPT09ICdhcnJheScpe1xuICAgICAgLy9jb25zb2xlLndhcm4oJ3RoaXMgc2hvdWxkblxcJ3QgaGFwcGVuIScpO1xuICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICB0eXBlID0gYXJnc1swXTtcbiAgICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IFt0eXBlXTtcblxuICAgIGNvbnNvbGUubG9nKCdjaGVjayBwb3NpdGlvbicsIGFyZ3MsIG51bUFyZ3MsIHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkpO1xuXG4gICAgLy9jb25zb2xlLmxvZygnYXJnJywgMCwgJy0+JywgdHlwZSk7XG5cbiAgICBpZihzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpICE9PSAtMSl7XG4gICAgICBmb3IoaSA9IDE7IGkgPCBudW1BcmdzOyBpKyspe1xuICAgICAgICBhID0gYXJnc1tpXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnYXJnJywgaSwgJy0+JywgYSk7XG4gICAgICAgIGlmKGEgPT09IHRydWUgfHwgYSA9PT0gZmFsc2Upe1xuICAgICAgICAgIGJleW9uZEVuZE9mU29uZyA9IGE7XG4gICAgICAgIH1lbHNlIGlmKGlzTmFOKGEpKXtcbiAgICAgICAgICBpZihzdXBwb3J0ZWRSZXR1cm5UeXBlcy5pbmRleE9mKGEpICE9PSAtMSl7XG4gICAgICAgICAgICByZXR1cm5UeXBlID0gYTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICBwb3NpdGlvbi5wdXNoKGEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL2NoZWNrIG51bWJlciBvZiBhcmd1bWVudHMgLT4gZWl0aGVyIDEgbnVtYmVyIG9yIDQgbnVtYmVycyBpbiBwb3NpdGlvbiwgZS5nLiBbJ2JhcnNiZWF0cycsIDFdIG9yIFsnYmFyc2JlYXRzJywgMSwgMSwgMSwgMF0sXG4gICAgICAvLyBvciBbJ3BlcmMnLCAwLjU2LCBudW1iZXJPZlRpY2tzVG9TbmFwVG9dXG4gICAgICBwb3NpdGlvbkxlbmd0aCA9IHBvc2l0aW9uLmxlbmd0aDtcbiAgICAgIGlmKHBvc2l0aW9uTGVuZ3RoICE9PSAyICYmIHBvc2l0aW9uTGVuZ3RoICE9PSAzICYmIHBvc2l0aW9uTGVuZ3RoICE9PSA1KXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZyhwb3NpdGlvbiwgcmV0dXJuVHlwZSwgYmV5b25kRW5kT2ZTb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9zaXRpb24oc29uZywgdHlwZSwgYXJncyl7XG4gIC8vY29uc29sZS5sb2coJ2dldFBvc2l0aW9uJywgYXJncyk7XG5cbiAgaWYodHlwZW9mIGFyZ3MgPT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4ge1xuICAgICAgbWlsbGlzOiAwXG4gICAgfVxuICB9XG5cbiAgbGV0IHBvc2l0aW9uID0gY2hlY2tQb3NpdGlvbih0eXBlLCBhcmdzKSxcbiAgICBtaWxsaXMsIHRtcCwgc25hcDtcblxuXG4gIGlmKHBvc2l0aW9uID09PSBmYWxzZSl7XG4gICAgZXJyb3IoJ3dyb25nIHBvc2l0aW9uIGRhdGEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzd2l0Y2godHlwZSl7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBmcm9tQmFycyhzb25nLCBwb3NpdGlvblsxXSwgcG9zaXRpb25bMl0sIHBvc2l0aW9uWzNdLCBwb3NpdGlvbls0XSk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICAvLyBjYWxjdWxhdGUgbWlsbGlzIG91dCBvZiB0aW1lIGFycmF5OiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG4gICAgICBtaWxsaXMgPSAwO1xuICAgICAgdG1wID0gcG9zaXRpb25bMV0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiA2MCAqIDYwICogMTAwMDsgLy9ob3Vyc1xuICAgICAgdG1wID0gcG9zaXRpb25bMl0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiA2MCAqIDEwMDA7IC8vbWludXRlc1xuICAgICAgdG1wID0gcG9zaXRpb25bM10gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXAgKiAxMDAwOyAvL3NlY29uZHNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzRdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wOyAvL21pbGxpc2Vjb25kc1xuXG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBwb3NpdGlvblsxXSk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICBmcm9tVGlja3Moc29uZywgcG9zaXRpb25bMV0pO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAncGVyYyc6XG4gICAgY2FzZSAncGVyY2VudGFnZSc6XG4gICAgICBzbmFwID0gcG9zaXRpb25bMl07XG5cbiAgICAgIC8vbWlsbGlzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgLy9mcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pbGxpcyk7XG5cbiAgICAgIHRpY2tzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uVGlja3M7XG4gICAgICBpZihzbmFwICE9PSB1bmRlZmluZWQpe1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzL3NuYXApICogc25hcDtcbiAgICAgICAgLy9mcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRpY2tzKTtcbiAgICAgIH1cbiAgICAgIGZyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHRtcCA9IGdldFBvc2l0aW9uRGF0YShzb25nKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXA7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4qL1xuXG4iLCJjb25zdCB2ZXJzaW9uID0gJzEuMC4wLWJldGEyNydcblxuaW1wb3J0IHtcbiAgdXBkYXRlU2V0dGluZ3MsXG4gIGdldFNldHRpbmdzLFxufSBmcm9tICcuL3NldHRpbmdzJ1xuXG5pbXBvcnQge1xuICBnZXROb3RlRGF0YSxcbn0gZnJvbSAnLi9ub3RlJ1xuXG5pbXBvcnQge1xuICBNSURJRXZlbnRcbn0gZnJvbSAnLi9taWRpX2V2ZW50J1xuXG5pbXBvcnR7XG4gIE1JRElOb3RlLFxufSBmcm9tICcuL21pZGlfbm90ZSdcblxuaW1wb3J0e1xuICBQYXJ0LFxufSBmcm9tICcuL3BhcnQnXG5cbmltcG9ydHtcbiAgVHJhY2ssXG59IGZyb20gJy4vdHJhY2snXG5cbmltcG9ydCB7XG4gIFNvbmcsXG59IGZyb20gJy4vc29uZydcblxuaW1wb3J0IHtcbiAgSW5zdHJ1bWVudCxcbn0gZnJvbSAnLi9pbnN0cnVtZW50J1xuXG5pbXBvcnQge1xuICBTYW1wbGVyLFxufSBmcm9tICcuL3NhbXBsZXInXG5cbmltcG9ydCB7XG4gIFNpbXBsZVN5bnRoLFxufSBmcm9tICcuL3NpbXBsZV9zeW50aCdcblxuaW1wb3J0IHtcbiAgcGFyc2VNSURJRmlsZVxufSBmcm9tICcuL21pZGlmaWxlJ1xuXG5pbXBvcnQge1xuICBpbml0LFxufSBmcm9tICcuL2luaXQnXG5cbmltcG9ydCB7XG4gIGNvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxufSBmcm9tICcuL2luaXRfYXVkaW8nXG5cbmltcG9ydCB7XG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG59IGZyb20gJy4vaW5pdF9taWRpJ1xuXG5pbXBvcnQge1xuICBwYXJzZVNhbXBsZXMsXG59IGZyb20gJy4vcGFyc2VfYXVkaW8nXG5cbmltcG9ydCB7XG4gIE1JRElFdmVudFR5cGVzLFxufSBmcm9tICcuL2NvbnN0YW50cydcblxuaW1wb3J0IHtcbiAgc2V0QnVmZmVyVGltZSxcbiAgZ2V0SW5zdHJ1bWVudHMsXG4gIGdldEdNSW5zdHJ1bWVudHMsXG59IGZyb20gJy4vc2V0dGluZ3MnXG5cbmltcG9ydCB7XG4gIGFkZEV2ZW50TGlzdGVuZXIsXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIsXG4gIGRpc3BhdGNoRXZlbnRcbn0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5cbmNvbnN0IGdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBjb250ZXh0XG59XG5cbmNvbnN0IHFhbWJpID0ge1xuICB2ZXJzaW9uLFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICB1cGRhdGVTZXR0aW5ncyxcbiAgZ2V0U2V0dGluZ3MsXG5cbiAgLy8gZnJvbSAuL25vdGVcbiAgZ2V0Tm90ZURhdGEsXG5cblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICBzZXRCdWZmZXJUaW1lLFxuXG4gIC8vIGZyb20gLi9jb25zdGFudHNcbiAgTUlESUV2ZW50VHlwZXMsXG5cbiAgLy8gZnJvbSAuL3V0aWxcbiAgcGFyc2VTYW1wbGVzLFxuXG4gIC8vIGZyb20gLi9taWRpZmlsZVxuICBwYXJzZU1JRElGaWxlLFxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG5cbiAgLy8gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICBnZXRJbnN0cnVtZW50cyxcbiAgZ2V0R01JbnN0cnVtZW50cyxcblxuICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKXtcbiAgICByZXR1cm4gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaylcbiAgfSxcblxuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKVxuICB9LFxuXG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIE1JRElFdmVudCxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIE1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIFNvbmcsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIFRyYWNrLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIFBhcnQsXG5cbiAgLy8gZnJvbSAuL2luc3RydW1lbnRcbiAgSW5zdHJ1bWVudCxcblxuICAvLyBmcm9tIC4vc2ltcGxlX3N5bnRoXG4gIFNpbXBsZVN5bnRoLFxuXG4gIC8vIGZyb20gLi9zYW1wbGVyXG4gIFNhbXBsZXIsXG5cbiAgbG9nKGlkKXtcbiAgICBzd2l0Y2goaWQpe1xuICAgICAgY2FzZSAnZnVuY3Rpb25zJzpcbiAgICAgICAgY29uc29sZS5sb2coYGZ1bmN0aW9uczpcbiAgICAgICAgICBnZXRBdWRpb0NvbnRleHRcbiAgICAgICAgICBnZXRNYXN0ZXJWb2x1bWVcbiAgICAgICAgICBzZXRNYXN0ZXJWb2x1bWVcbiAgICAgICAgICBnZXRNSURJQWNjZXNzXG4gICAgICAgICAgZ2V0TUlESUlucHV0c1xuICAgICAgICAgIGdldE1JRElPdXRwdXRzXG4gICAgICAgICAgZ2V0TUlESUlucHV0SWRzXG4gICAgICAgICAgZ2V0TUlESU91dHB1dElkc1xuICAgICAgICAgIGdldE1JRElJbnB1dHNCeUlkXG4gICAgICAgICAgZ2V0TUlESU91dHB1dHNCeUlkXG4gICAgICAgICAgcGFyc2VNSURJRmlsZVxuICAgICAgICAgIHNldEJ1ZmZlclRpbWVcbiAgICAgICAgICBnZXRJbnN0cnVtZW50c1xuICAgICAgICAgIGdldEdNSW5zdHJ1bWVudHNcbiAgICAgICAgYClcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBxYW1iaVxuXG5leHBvcnQge1xuICB2ZXJzaW9uLFxuXG4gIC8vIGZyb20gLi9pbml0XG4gIGluaXQsXG5cbiAgLy8gZnJvbSAuL3NldHRpbmdzXG4gIGdldEluc3RydW1lbnRzLFxuICBnZXRHTUluc3RydW1lbnRzLFxuICB1cGRhdGVTZXR0aW5ncyxcbiAgZ2V0U2V0dGluZ3MsXG5cbiAgLy8gZnJvbSAuL2NvbnN0YW50c1xuICBNSURJRXZlbnRUeXBlcyxcblxuICAvLyBmcm9tIC4vdXRpbFxuICBwYXJzZVNhbXBsZXMsXG5cbiAgLy8gZnJvbSAuL21pZGlmaWxlXG4gIHBhcnNlTUlESUZpbGUsXG5cbiAgLy8gZnJvbSAuL2luaXRfYXVkaW9cbiAgZ2V0QXVkaW9Db250ZXh0LFxuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZSxcblxuICAvLyBmcm9tIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgLy8gZnJvbSAuL25vdGVcbiAgZ2V0Tm90ZURhdGEsXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgTUlESUV2ZW50LFxuXG4gIC8vIGZyb20gLi9taWRpX25vdGVcbiAgTUlESU5vdGUsXG5cbiAgLy8gZnJvbSAuL3NvbmdcbiAgU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgVHJhY2ssXG5cbiAgLy8gZnJvbSAuL3BhcnRcbiAgUGFydCxcblxuICAvLyBmcm9tIC4vaW5zdHJ1bWVudFxuICBJbnN0cnVtZW50LFxuXG4gIC8vIGZyb20gLi9zaW1wbGVfc3ludGhcbiAgU2ltcGxlU3ludGgsXG5cbiAgLy8gZnJvbSAuL3NhbXBsZXJcbiAgU2FtcGxlcixcbn1cbiIsImltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvLmpzJ1xuaW1wb3J0IHtnZXRFcXVhbFBvd2VyQ3VydmV9IGZyb20gJy4vdXRpbC5qcydcblxuZXhwb3J0IGNsYXNzIFNhbXBsZXtcblxuICBjb25zdHJ1Y3RvcihzYW1wbGVEYXRhLCBldmVudCl7XG4gICAgdGhpcy5ldmVudCA9IGV2ZW50XG4gICAgdGhpcy5zYW1wbGVEYXRhID0gc2FtcGxlRGF0YVxuICB9XG5cbiAgc3RhcnQodGltZSl7XG4gICAgbGV0IHtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmR9ID0gdGhpcy5zYW1wbGVEYXRhXG4gICAgLy9jb25zb2xlLmxvZyhzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmQpXG4gICAgaWYoc3VzdGFpblN0YXJ0ICYmIHN1c3RhaW5FbmQpe1xuICAgICAgdGhpcy5zb3VyY2UubG9vcCA9IHRydWVcbiAgICAgIHRoaXMuc291cmNlLmxvb3BTdGFydCA9IHN1c3RhaW5TdGFydFxuICAgICAgdGhpcy5zb3VyY2UubG9vcEVuZCA9IHN1c3RhaW5FbmRcbiAgICB9XG4gICAgdGhpcy5zb3VyY2Uuc3RhcnQodGltZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIGNiKXtcbiAgICBsZXQge3JlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlLCByZWxlYXNlRW52ZWxvcGVBcnJheX0gPSB0aGlzLnNhbXBsZURhdGFcbiAgICAvL2NvbnNvbGUubG9nKHJlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlKVxuICAgIHRoaXMuc291cmNlLm9uZW5kZWQgPSBjYlxuXG4gICAgaWYocmVsZWFzZUR1cmF0aW9uICYmIHJlbGVhc2VFbnZlbG9wZSl7XG4gICAgICB0aGlzLnN0YXJ0UmVsZWFzZVBoYXNlID0gdGltZVxuICAgICAgdGhpcy5yZWxlYXNlRnVuY3Rpb24gPSAoKSA9PiB7XG4gICAgICAgIGZhZGVPdXQodGhpcy5vdXRwdXQsIHtcbiAgICAgICAgICByZWxlYXNlRHVyYXRpb24sXG4gICAgICAgICAgcmVsZWFzZUVudmVsb3BlLFxuICAgICAgICAgIHJlbGVhc2VFbnZlbG9wZUFycmF5LFxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgdHJ5e1xuICAgICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUgKyByZWxlYXNlRHVyYXRpb24pXG4gICAgICB9Y2F0Y2goZSl7XG4gICAgICAgIC8vIGluIEZpcmVmb3ggYW5kIFNhZmFyaSB5b3UgY2FuIG5vdCBjYWxsIHN0b3AgbW9yZSB0aGFuIG9uY2VcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hlY2tQaGFzZSgpXG4gICAgfWVsc2V7XG4gICAgICB0cnl7XG4gICAgICAgIHRoaXMuc291cmNlLnN0b3AodGltZSlcbiAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc3RvcCBtb3JlIHRoYW4gb25jZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrUGhhc2UoKXtcbiAgICAvL2NvbnNvbGUubG9nKGNvbnRleHQuY3VycmVudFRpbWUsIHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UpXG4gICAgaWYoY29udGV4dC5jdXJyZW50VGltZSA+PSB0aGlzLnN0YXJ0UmVsZWFzZVBoYXNlKXtcbiAgICAgIHRoaXMucmVsZWFzZUZ1bmN0aW9uKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5jaGVja1BoYXNlLmJpbmQodGhpcykpXG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZmFkZU91dChnYWluTm9kZSwgc2V0dGluZ3Mpe1xuICBsZXQgbm93ID0gY29udGV4dC5jdXJyZW50VGltZVxuICBsZXQgdmFsdWVzLCBpLCBtYXhpXG5cbiAgLy9jb25zb2xlLmxvZyhzZXR0aW5ncylcbiAgdHJ5e1xuICAgIHN3aXRjaChzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpe1xuXG4gICAgICBjYXNlICdsaW5lYXInOlxuICAgICAgICBnYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGdhaW5Ob2RlLmdhaW4udmFsdWUsIG5vdylcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjAsIG5vdyArIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnZXF1YWwgcG93ZXInOlxuICAgICAgY2FzZSAnZXF1YWxfcG93ZXInOlxuICAgICAgICB2YWx1ZXMgPSBnZXRFcXVhbFBvd2VyQ3VydmUoMTAwLCAnZmFkZU91dCcsIGdhaW5Ob2RlLmdhaW4udmFsdWUpXG4gICAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVDdXJ2ZUF0VGltZSh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdhcnJheSc6XG4gICAgICAgIG1heGkgPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheS5sZW5ndGhcbiAgICAgICAgdmFsdWVzID0gbmV3IEZsb2F0MzJBcnJheShtYXhpKVxuICAgICAgICBmb3IoaSA9IDA7IGkgPCBtYXhpOyBpKyspe1xuICAgICAgICAgIHZhbHVlc1tpXSA9IHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZUFycmF5W2ldICogZ2Fpbk5vZGUuZ2Fpbi52YWx1ZVxuICAgICAgICB9XG4gICAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVDdXJ2ZUF0VGltZSh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgICAgICBicmVha1xuXG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfWNhdGNoKGUpe1xuICAgIC8vIGluIEZpcmVmb3ggYW5kIFNhZmFyaSB5b3UgY2FuIG5vdCBjYWxsIHNldFZhbHVlQ3VydmVBdFRpbWUgYW5kIGxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lIG1vcmUgdGhhbiBvbmNlXG5cbiAgICAvL2NvbnNvbGUubG9nKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgLy9jb25zb2xlLmxvZyhlLCBnYWluTm9kZSlcbiAgfVxufVxuIiwiaW1wb3J0IHtTYW1wbGV9IGZyb20gJy4vc2FtcGxlJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgU2FtcGxlQnVmZmVyIGV4dGVuZHMgU2FtcGxle1xuXG4gIGNvbnN0cnVjdG9yKHNhbXBsZURhdGEsIGV2ZW50KXtcbiAgICBzdXBlcihzYW1wbGVEYXRhLCBldmVudClcbiAgICB0aGlzLmlkID0gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV8ke2luc3RhbmNlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG5cbiAgICBpZih0aGlzLnNhbXBsZURhdGEgPT09IC0xIHx8IHR5cGVvZiB0aGlzLnNhbXBsZURhdGEuYnVmZmVyID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAvLyBjcmVhdGUgZHVtbXkgc291cmNlXG4gICAgICB0aGlzLnNvdXJjZSA9IHtcbiAgICAgICAgc3RhcnQoKXt9LFxuICAgICAgICBzdG9wKCl7fSxcbiAgICAgICAgY29ubmVjdCgpe30sXG4gICAgICB9XG5cbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGVEYXRhKVxuICAgICAgdGhpcy5zb3VyY2UuYnVmZmVyID0gc2FtcGxlRGF0YS5idWZmZXI7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc291cmNlLmJ1ZmZlcilcbiAgICB9XG4gICAgdGhpcy5vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMudm9sdW1lID0gZXZlbnQuZGF0YTIgLyAxMjdcbiAgICB0aGlzLm91dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLnNvdXJjZS5jb25uZWN0KHRoaXMub3V0cHV0KVxuICAgIC8vdGhpcy5vdXRwdXQuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICB9XG5cbiAgLy9Ab3ZlcnJpZGVcbiAgc3RhcnQodGltZSl7XG4gICAgbGV0IHtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmQsIHNlZ21lbnRTdGFydCwgc2VnbWVudER1cmF0aW9ufSA9IHRoaXMuc2FtcGxlRGF0YVxuICAgIC8vY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kLCBzZWdtZW50U3RhcnQsIHNlZ21lbnREdXJhdGlvbilcbiAgICBpZihzdXN0YWluU3RhcnQgJiYgc3VzdGFpbkVuZCl7XG4gICAgICB0aGlzLnNvdXJjZS5sb29wID0gdHJ1ZVxuICAgICAgdGhpcy5zb3VyY2UubG9vcFN0YXJ0ID0gc3VzdGFpblN0YXJ0XG4gICAgICB0aGlzLnNvdXJjZS5sb29wRW5kID0gc3VzdGFpbkVuZFxuICAgIH1cbiAgICBpZihzZWdtZW50U3RhcnQgJiYgc2VnbWVudER1cmF0aW9uKXtcbiAgICAgIGNvbnNvbGUubG9nKHNlZ21lbnRTdGFydCwgc2VnbWVudER1cmF0aW9uKVxuICAgICAgdGhpcy5zb3VyY2Uuc3RhcnQodGltZSwgc2VnbWVudFN0YXJ0IC8gMTAwMCwgc2VnbWVudER1cmF0aW9uIC8gMTAwMClcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHtTYW1wbGV9IGZyb20gJy4vc2FtcGxlJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgU2FtcGxlT3NjaWxsYXRvciBleHRlbmRzIFNhbXBsZXtcblxuICBjb25zdHJ1Y3RvcihzYW1wbGVEYXRhLCBldmVudCl7XG4gICAgc3VwZXIoc2FtcGxlRGF0YSwgZXZlbnQpXG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuXG4gICAgaWYodGhpcy5zYW1wbGVEYXRhID09PSAtMSl7XG4gICAgICAvLyBjcmVhdGUgZHVtbXkgc291cmNlXG4gICAgICB0aGlzLnNvdXJjZSA9IHtcbiAgICAgICAgc3RhcnQoKXt9LFxuICAgICAgICBzdG9wKCl7fSxcbiAgICAgICAgY29ubmVjdCgpe30sXG4gICAgICB9XG5cbiAgICB9ZWxzZXtcblxuICAgICAgLy8gQFRPRE8gYWRkIHR5cGUgJ2N1c3RvbScgPT4gUGVyaW9kaWNXYXZlXG4gICAgICBsZXQgdHlwZSA9IHRoaXMuc2FtcGxlRGF0YS50eXBlXG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpXG5cbiAgICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgICAgY2FzZSAnc2luZSc6XG4gICAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgIGNhc2UgJ3Nhd3Rvb3RoJzpcbiAgICAgICAgY2FzZSAndHJpYW5nbGUnOlxuICAgICAgICAgIHRoaXMuc291cmNlLnR5cGUgPSB0eXBlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aGlzLnNvdXJjZS50eXBlID0gJ3NxdWFyZSdcbiAgICAgIH1cbiAgICAgIHRoaXMuc291cmNlLmZyZXF1ZW5jeS52YWx1ZSA9IGV2ZW50LmZyZXF1ZW5jeVxuICAgIH1cbiAgICB0aGlzLm91dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy52b2x1bWUgPSBldmVudC5kYXRhMiAvIDEyN1xuICAgIHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuc291cmNlLmNvbm5lY3QodGhpcy5vdXRwdXQpXG4gICAgLy90aGlzLm91dHB1dC5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIH1cbn1cbiIsImltcG9ydCB7SW5zdHJ1bWVudH0gZnJvbSAnLi9pbnN0cnVtZW50J1xuaW1wb3J0IHtnZXROb3RlRGF0YX0gZnJvbSAnLi9ub3RlJ1xuaW1wb3J0IHtwYXJzZVNhbXBsZXN9IGZyb20gJy4vcGFyc2VfYXVkaW8nXG5pbXBvcnQge3R5cGVTdHJpbmd9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7ZmV0Y2hKU09OfSBmcm9tICcuL2ZldGNoX2hlbHBlcnMnXG5pbXBvcnQge1NhbXBsZUJ1ZmZlcn0gZnJvbSAnLi9zYW1wbGVfYnVmZmVyJ1xuXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgU2FtcGxlciBleHRlbmRzIEluc3RydW1lbnR7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKXtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgdGhpcy5pZFxuICAgIHRoaXMuY2xlYXJBbGxTYW1wbGVEYXRhKClcbiAgfVxuXG4gIGNsZWFyQWxsU2FtcGxlRGF0YSgpe1xuICAgIC8vIGNyZWF0ZSBhIHNhbXBsZXMgZGF0YSBvYmplY3QgZm9yIGFsbCAxMjggdmVsb2NpdHkgbGV2ZWxzIG9mIGFsbCAxMjggbm90ZXNcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSlcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gdGhpcy5zYW1wbGVzRGF0YS5tYXAoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKVxuICAgIH0pXG4gIH1cblxuICBjcmVhdGVTYW1wbGUoZXZlbnQpe1xuICAgIHJldHVybiBuZXcgU2FtcGxlQnVmZmVyKHRoaXMuc2FtcGxlc0RhdGFbZXZlbnQuZGF0YTFdW2V2ZW50LmRhdGEyXSwgZXZlbnQpXG4gIH1cblxuICBfbG9hZEpTT04oZGF0YSl7XG4gICAgaWYodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkYXRhLnVybCA9PT0gJ3N0cmluZycpe1xuICAgICAgcmV0dXJuIGZldGNoSlNPTihkYXRhLnVybClcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkYXRhKVxuICB9XG5cbiAgLy8gbG9hZCBhbmQgcGFyc2VcbiAgcGFyc2VTYW1wbGVEYXRhKGRhdGEpe1xuXG4gICAgLy8gY2hlY2sgaWYgd2UgaGF2ZSB0byBjbGVhciB0aGUgY3VycmVudGx5IGxvYWRlZCBzYW1wbGVzXG4gICAgbGV0IGNsZWFyQWxsID0gZGF0YS5jbGVhckFsbFxuXG4gICAgLy8gY2hlY2sgaWYgd2UgaGF2ZSB0byBvdmVycnVsZSB0aGUgYmFzZVVybCBvZiB0aGUgc2FtcGVsc1xuICAgIGxldCBiYXNlVXJsID0gbnVsbFxuICAgIGlmKHR5cGVvZiBkYXRhLmJhc2VVcmwgPT09ICdzdHJpbmcnKXtcbiAgICAgIGJhc2VVcmwgPSBkYXRhLmJhc2VVcmxcbiAgICB9XG5cbiAgICBpZih0eXBlb2YgZGF0YS5yZWxlYXNlICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAvL2NvbnNvbGUubG9nKDEsIGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgIH1cblxuICAgIC8vcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fbG9hZEpTT04oZGF0YSlcbiAgICAgIC50aGVuKChqc29uKSA9PiB7XG4gICAgICAgIC8vY29uc29sZS5sb2coanNvbilcbiAgICAgICAgZGF0YSA9IGpzb25cbiAgICAgICAgaWYoYmFzZVVybCAhPT0gbnVsbCl7XG4gICAgICAgICAganNvbi5iYXNlVXJsID0gYmFzZVVybFxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygyLCBkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VTYW1wbGVzKGRhdGEpXG4gICAgICB9KVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuXG4gICAgICAgIGlmKGNsZWFyQWxsID09PSB0cnVlKXtcbiAgICAgICAgICB0aGlzLmNsZWFyQWxsU2FtcGxlRGF0YSgpXG4gICAgICAgIH1cblxuICAgICAgICBpZih0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0Jyl7XG5cbiAgICAgICAgICAvLyBzaW5nbGUgY29uY2F0ZW5hdGVkIHNhbXBsZVxuICAgICAgICAgIGlmKHR5cGVvZiByZXN1bHQuc2FtcGxlICE9PSAndW5kZWZpbmVkJyl7XG5cbiAgICAgICAgICAgIGxldCBidWZmZXIgPSByZXN1bHQuc2FtcGxlXG4gICAgICAgICAgICBmb3IobGV0IG5vdGVJZCBvZiBPYmplY3Qua2V5cyhkYXRhKSkge1xuXG4gICAgICAgICAgICAgIGlmKFxuICAgICAgICAgICAgICAgIG5vdGVJZCA9PT0gJ3NhbXBsZScgfHxcbiAgICAgICAgICAgICAgICBub3RlSWQgPT09ICdyZWxlYXNlJyB8fFxuICAgICAgICAgICAgICAgIG5vdGVJZCA9PT0gJ2Jhc2VVcmwnIHx8XG4gICAgICAgICAgICAgICAgbm90ZUlkID09PSAnaW5mbydcbiAgICAgICAgICAgICAgKXtcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgbGV0IHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgc2VnbWVudDogZGF0YVtub3RlSWRdLFxuICAgICAgICAgICAgICAgIG5vdGU6IHBhcnNlSW50KG5vdGVJZCwgMTApLFxuICAgICAgICAgICAgICAgIGJ1ZmZlclxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2FtcGxlRGF0YShzYW1wbGVEYXRhKVxuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZURhdGEpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9ZWxzZXtcblxuICAgICAgICAgICAgZm9yKGxldCBub3RlSWQgb2YgT2JqZWN0LmtleXMocmVzdWx0KSkge1xuICAgICAgICAgICAgICBsZXQgYnVmZmVyID0gcmVzdWx0W25vdGVJZF1cbiAgICAgICAgICAgICAgbGV0IHNhbXBsZURhdGEgPSBkYXRhW25vdGVJZF1cblxuXG4gICAgICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NhbXBsZURhdGEgaXMgdW5kZWZpbmVkJywgbm90ZUlkKVxuICAgICAgICAgICAgICB9ZWxzZSBpZih0eXBlU3RyaW5nKGJ1ZmZlcikgPT09ICdhcnJheScpe1xuXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhidWZmZXIsIHNhbXBsZURhdGEpXG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5mb3JFYWNoKChzZCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhub3RlSWQsIGJ1ZmZlcltpXSlcbiAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBzZCA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgICAgICAgICBzZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlcltpXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgc2QuYnVmZmVyID0gYnVmZmVyW2ldXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzZC5ub3RlID0gcGFyc2VJbnQobm90ZUlkLCAxMClcbiAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEoc2QpXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICB9ZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiBidWZmZXJcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gYnVmZmVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHBhcnNlSW50KG5vdGVJZCwgMTApXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2FtcGxlRGF0YShzYW1wbGVEYXRhKVxuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgfWVsc2V7XG5cbiAgICAgICAgICByZXN1bHQuZm9yRWFjaCgoc2FtcGxlKSA9PiB7XG4gICAgICAgICAgICBsZXQgc2FtcGxlRGF0YSA9IGRhdGFbc2FtcGxlXVxuICAgICAgICAgICAgaWYodHlwZW9mIHNhbXBsZURhdGEgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NhbXBsZURhdGEgaXMgdW5kZWZpbmVkJywgc2FtcGxlKVxuICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICBidWZmZXI6IHNhbXBsZS5idWZmZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gc2FtcGxlLmJ1ZmZlclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHNhbXBsZVxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpXG4gICAgICAgICAgICAgIC8vdGhpcy51cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcblxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2cobmV3IERhdGUoKS5nZXRUaW1lKCkpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLypcbiAgICBAcGFyYW0gY29uZmlnIChvcHRpb25hbClcbiAgICAgIHtcbiAgICAgICAgbm90ZTogY2FuIGJlIG5vdGUgbmFtZSAoQzQpIG9yIG5vdGUgbnVtYmVyICg2MClcbiAgICAgICAgYnVmZmVyOiBBdWRpb0J1ZmZlclxuICAgICAgICBzdXN0YWluOiBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSwgLy8gb3B0aW9uYWwsIGluIG1pbGxpc1xuICAgICAgICByZWxlYXNlOiBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdLCAvLyBvcHRpb25hbFxuICAgICAgICBwYW46IHBhblBvc2l0aW9uIC8vIG9wdGlvbmFsXG4gICAgICAgIHZlbG9jaXR5OiBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdIC8vIG9wdGlvbmFsLCBmb3IgbXVsdGktbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgfVxuICAqL1xuICB1cGRhdGVTYW1wbGVEYXRhKC4uLmRhdGEpe1xuICAgIGRhdGEuZm9yRWFjaChub3RlRGF0YSA9PiB7XG4gICAgICAvLyBzdXBwb3J0IGZvciBtdWx0aSBsYXllcmVkIGluc3RydW1lbnRzXG4gICAgICAvL2NvbnNvbGUubG9nKG5vdGVEYXRhLCB0eXBlU3RyaW5nKG5vdGVEYXRhKSlcbiAgICAgIGlmKHR5cGVTdHJpbmcobm90ZURhdGEpID09PSAnYXJyYXknKXtcbiAgICAgICAgbm90ZURhdGEuZm9yRWFjaCh2ZWxvY2l0eUxheWVyID0+IHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHZlbG9jaXR5TGF5ZXIpXG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2FtcGxlRGF0YShub3RlRGF0YSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgX3VwZGF0ZVNhbXBsZURhdGEoZGF0YSA9IHt9KXtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gICAgbGV0IHtcbiAgICAgIG5vdGUsXG4gICAgICBidWZmZXIgPSBudWxsLFxuICAgICAgc3VzdGFpbiA9IFtudWxsLCBudWxsXSxcbiAgICAgIHNlZ21lbnQgPSBbbnVsbCwgbnVsbF0sXG4gICAgICByZWxlYXNlID0gW251bGwsICdsaW5lYXInXSwgLy8gcmVsZWFzZSBkdXJhdGlvbiBpcyBpbiBzZWNvbmRzIVxuICAgICAgcGFuID0gbnVsbCxcbiAgICAgIHZlbG9jaXR5ID0gWzAsIDEyN10sXG4gICAgfSA9IGRhdGFcblxuICAgIGlmKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbm90ZW51bWJlciBvciBhIG5vdGVuYW1lJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGdldCBub3RlbnVtYmVyIGZyb20gbm90ZW5hbWUgYW5kIGNoZWNrIGlmIHRoZSBub3RlbnVtYmVyIGlzIHZhbGlkXG4gICAgbGV0IG4gPSBnZXROb3RlRGF0YSh7bnVtYmVyOiBub3RlfSlcbiAgICBpZihuID09PSBmYWxzZSl7XG4gICAgICBjb25zb2xlLndhcm4oJ25vdCBhIHZhbGlkIG5vdGUgaWQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG5vdGUgPSBuLm51bWJlclxuXG4gICAgbGV0IFtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmRdID0gc3VzdGFpblxuICAgIGxldCBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdID0gcmVsZWFzZVxuICAgIGxldCBbc2VnbWVudFN0YXJ0LCBzZWdtZW50RHVyYXRpb25dID0gc2VnbWVudFxuICAgIGxldCBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdID0gdmVsb2NpdHlcblxuICAgIGlmKHN1c3RhaW4ubGVuZ3RoICE9PSAyKXtcbiAgICAgIHN1c3RhaW5TdGFydCA9IHN1c3RhaW5FbmQgPSBudWxsXG4gICAgfVxuXG4gICAgaWYocmVsZWFzZUR1cmF0aW9uID09PSBudWxsKXtcbiAgICAgIHJlbGVhc2VFbnZlbG9wZSA9IG51bGxcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhub3RlLCBidWZmZXIpXG4gICAgLy8gY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKVxuICAgIC8vIGNvbnNvbGUubG9nKHJlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlKVxuICAgIC8vIGNvbnNvbGUubG9nKHBhbilcbiAgICAvLyBjb25zb2xlLmxvZyh2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZClcblxuXG4gICAgdGhpcy5zYW1wbGVzRGF0YVtub3RlXS5mb3JFYWNoKChzYW1wbGVEYXRhLCBpKSA9PiB7XG4gICAgICBpZihpID49IHZlbG9jaXR5U3RhcnQgJiYgaSA8PSB2ZWxvY2l0eUVuZCl7XG4gICAgICAgIGlmKHNhbXBsZURhdGEgPT09IC0xKXtcbiAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgaWQ6IG5vdGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IGJ1ZmZlciB8fCBzYW1wbGVEYXRhLmJ1ZmZlclxuICAgICAgICBzYW1wbGVEYXRhLnN1c3RhaW5TdGFydCA9IHN1c3RhaW5TdGFydCB8fCBzYW1wbGVEYXRhLnN1c3RhaW5TdGFydFxuICAgICAgICBzYW1wbGVEYXRhLnN1c3RhaW5FbmQgPSBzdXN0YWluRW5kIHx8IHNhbXBsZURhdGEuc3VzdGFpbkVuZFxuICAgICAgICBzYW1wbGVEYXRhLnNlZ21lbnRTdGFydCA9IHNlZ21lbnRTdGFydCB8fCBzYW1wbGVEYXRhLnNlZ21lbnRTdGFydFxuICAgICAgICBzYW1wbGVEYXRhLnNlZ21lbnREdXJhdGlvbiA9IHNlZ21lbnREdXJhdGlvbiB8fCBzYW1wbGVEYXRhLnNlZ21lbnREdXJhdGlvblxuICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VEdXJhdGlvbiA9IHJlbGVhc2VEdXJhdGlvbiB8fCBzYW1wbGVEYXRhLnJlbGVhc2VEdXJhdGlvblxuICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSA9IHJlbGVhc2VFbnZlbG9wZSB8fCBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZVxuICAgICAgICBzYW1wbGVEYXRhLnBhbiA9IHBhbiB8fCBzYW1wbGVEYXRhLnBhblxuXG4gICAgICAgIGlmKHR5cGVTdHJpbmcoc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUpID09PSAnYXJyYXknKXtcbiAgICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZUFycmF5ID0gc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVcbiAgICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSA9ICdhcnJheSdcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGVsZXRlIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNhbXBsZXNEYXRhW25vdGVdW2ldID0gc2FtcGxlRGF0YVxuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZygnJU8nLCB0aGlzLnNhbXBsZXNEYXRhW25vdGVdKVxuICAgIH0pXG4gIH1cblxuXG4gIC8vIHN0ZXJlbyBzcHJlYWRcbiAgc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKXtcbiAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICB9XG5cbiAgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcbiAgfVxuXG4gIC8qXG4gICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAqL1xuICBzZXRSZWxlYXNlKGR1cmF0aW9uOiBudW1iZXIsIGVudmVsb3BlKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBmb3IgYWxsIGtleXMsIG92ZXJydWxlcyB2YWx1ZXMgc2V0IGJ5IHNldEtleVNjYWxpbmdSZWxlYXNlKClcbiAgICB0aGlzLnNhbXBsZXNEYXRhLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlcywgaWQpe1xuICAgICAgc2FtcGxlcy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSwgaSl7XG4gICAgICAgIGlmKHNhbXBsZSA9PT0gLTEpe1xuICAgICAgICAgIHNhbXBsZSA9IHtcbiAgICAgICAgICAgIGlkOiBpZFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzYW1wbGUucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb25cbiAgICAgICAgc2FtcGxlLnJlbGVhc2VFbnZlbG9wZSA9IGVudmVsb3BlXG4gICAgICAgIHNhbXBsZXNbaV0gPSBzYW1wbGVcbiAgICAgIH0pXG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGEpXG4gIH1cbn1cbiIsImNvbnN0IHNhbXBsZXMgPSB7XG4gIGVtcHR5T2dnOiAnVDJkblV3QUNBQUFBQUFBQUFBQmR4ZDRYQUFBQUFEYVMwalFCSGdGMmIzSmlhWE1BQUFBQUFVU3NBQUFBQUFBQWdMc0FBQUFBQUFDNEFVOW5aMU1BQUFBQUFBQUFBQUFBWGNYZUZ3RUFBQUFhWEsrUUR6My8vLy8vLy8vLy8vLy8vLy8vTWdOMmIzSmlhWE10QUFBQVdHbHdhQzVQY21jZ2JHbGlWbTl5WW1seklFa2dNakF4TURFeE1ERWdLRk5qYUdGMVptVnVkV2RuWlhRcEFBQUFBQUVGZG05eVltbHpIMEpEVmdFQUFBRUFHR05VS1VhWlV0SktpUmx6bERGR21XS1NTb21saEJaQ1NKMXpGRk9wT2RlY2E2eTV0U0NFRUJwVFVDa0ZtVktPVW1rWlk1QXBCWmxTRUV0SkpYUVNPaWVkWXhCYlNjSFdtR3VMUWJZY2hBMmFVa3dweEpSU2lrSUlHVk9NS2NXVVVrcENCeVYwRGpybUhGT09TaWhCdUp4enE3V1dsbU9McVhTU1N1Y2taRXhDU0NtRmtrb0hwVk5PUWtnMWx0WlNLUjF6VWxKcVFlZ2doQkJDdGlDRURZTFFrRlVBQUFFQXdFQVFHcklLQUZBQUFCQ0tvUmlLQW9TR3JBSUFNZ0FBQktBb2p1SW9qaU01a21OSkZoQWFzZ29BQUFJQUVBQUF3SEFVU1pFVXliRWtTOUlzUzlORVVWVjkxVFpWVmZaMVhkZDFYZGQxSURSa0ZRQUFBUUJBU0tlWnBSb2d3Z3hrR0FnTldRVUFJQUFBQUVZb3doQURRa05XQVFBQUFRQUFZaWc1aUNhMDVueHpqb05tT1dncXhlWjBjQ0xWNWtsdUt1Ym1uSFBPT1NlYmM4WTQ1NXh6aW5KbU1XZ210T2FjY3hLRFppbG9KclRtbkhPZXhPWkJhNnEwNXB4enhqbW5nM0ZHR09lY2M1cTA1a0ZxTnRibW5ITVd0S1k1YWk3RjVweHpJdVhtU1cwdTFlYWNjODQ1NTV4enpqbm5uSE9xRjZkemNFNDQ1NXh6b3ZibVdtNUNGK2VjY3o0WnAzdHpRampubkhQT09lZWNjODQ1NTV4emd0Q1FWUUFBRUFBQVFSZzJobkduSUVpZm80RVlSWWhweUtRSDNhUERKR2dNY2dxcFI2T2prVkxxSUpSVXhra3BuU0EwWkJVQUFBZ0FBQ0dFRkZKSUlZVVVVa2doaFJSU2lDR0dHR0xJS2FlY2dnb3FxYVNpaWpMS0xMUE1Nc3Nzczh3eTY3Q3p6anJzTU1RUVF3eXR0QkpMVGJYVldHT3R1ZWVjYXc3U1dtbXR0ZFpLS2FXVVVrb3BDQTFaQlFDQUFBQVFDQmxra0VGR0lZVVVVb2docHB4eXlpbW9vQUpDUTFZQkFJQUFBQUlBQUFBOHlYTkVSM1JFUjNSRVIzUkVSM1JFeDNNOFI1UkVTWlJFU2JSTXk5Uk1UeFZWMVpWZFc5WmwzZlp0WVJkMjNmZDEzL2QxNDllRllWbVdaVm1XWlZtV1pWbVdaVm1XWlZtQzBKQlZBQUFJQUFDQUVFSUlJWVVVVWtnaHBSaGp6REhub0pOUVFpQTBaQlVBQUFnQUlBQUFBTUJSSE1WeEpFZHlKTW1TTEVtVE5FdXpQTTNUUEUzMFJGRVVUZE5VUlZkMFJkMjBSZG1VVGRkMFRkbDBWVm0xWFZtMmJkbldiVitXYmQvM2ZkLzNmZC8zZmQvM2ZkLzNkUjBJRFZrRkFFZ0FBT2hJanFSSWlxUklqdU00a2lRQm9TR3JBQUFaQUFBQkFDaUtvemlPNDBpU0pFbVdwRW1lNVZtaVptcW1aM3FxcUFLaElhc0FBRUFBQUFFQUFBQUFBQ2lhNGltbTRpbWk0am1pSTBxaVpWcWlwbXF1S0p1eTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdvdUVCcXlDZ0NRQUFEUWtSekprUnhKa1JSSmtSekpBVUpEVmdFQU1nQUFBZ0J3RE1lUUZNbXhMRXZUUE0zVFBFMzBSRS8wVEU4VlhkRUZRa05XQVFDQUFBQUNBQUFBQUFBd0pNTlNMRWR6TkVtVVZFdTFWRTIxVkVzVlZVOVZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVMVRkTTBUU0EwWkNVQUFBUUF3R0tOd2VVZ0lTVWw1ZDRRd2hDVG5qRW1JYlZlSVFTUmt0NHhCaFdEbmpLaURITGVRdU1RZ3g0SURWa1JBRVFCQUFER0lNY1FjOGc1UjZtVEVqbm5xSFNVR3VjY3BZNVNaeW5GbUdMTktKWFlVcXlOYzQ1U1I2MmpsR0lzTFhhVVVvMnB4Z0lBQUFJY0FBQUNMSVJDUTFZRUFGRUFBSVF4U0Nta0ZHS01PYWVjUTR3cDU1aHpoakhtSEhPT09lZWdkRklxNTV4MFRrckVHSE9PT2FlY2MxSTZKNVZ6VGtvbm9RQUFnQUFIQUlBQUM2SFFrQlVCUUp3QWdFR1NQRS95TkZHVU5FOFVSVk4wWFZFMFhkZnlQTlgwVEZOVlBkRlVWVk5WYmRsVVZWbVdQTTgwUGROVVZjODBWZFZVVlZrMlZWV1dSVlhWYmROMWRkdDBWZDJXYmR2M1hWc1dkbEZWYmQxVVhkczNWZGYyWGRuMmZWbldkV1B5UEZYMVROTjFQZE4wWmRWMWJWdDFYVjMzVEZPV1RkZVZaZE4xYmR1VlpWMTNaZG4zTmROMFhkTlZaZGwwWGRsMlpWZTNYVm4yZmROMWhkK1ZaVjlYWlZrWWRsMzNoVnZYbGVWMFhkMVhaVmMzVmxuMmZWdlhoZUhXZFdHWlBFOVZQZE4wWGM4MFhWZDFYVjlYWGRmV05kT1VaZE4xYmRsVVhWbDJaZG4zWFZmV2RjODBaZGwwWGRzMlhWZVdYVm4yZlZlV2RkMTBYVjlYWlZuNFZWZjJkVm5YbGVIV2JlRTNYZGYzVlZuMmhWZVdkZUhXZFdHNWRWMFlQbFgxZlZOMmhlRjBaZC9YaGQ5WmJsMDRsdEYxZldHVmJlRllaVms1ZnVGWWx0MzNsV1YwWFY5WWJka1lWbGtXaGwvNG5lWDJmZU40ZFYwWmJ0M256THJ2RE1mdnBQdkswOVZ0WTVsOTNWbG1YM2VPNFJnNnYvRGpxYXF2bTY0ckRLY3NDNy90Njhheis3NnlqSzdyKzZvc0M3OHEyOEt4Njc3ei9MNndMS1BzK3NKcXk4S3cycll4M0w1dUxMOXdITXRyNjhveDY3NVJ0blY4WDNnS3cvTjBkVjE1WmwzSDluVjA0MGM0ZnNvQUFJQUJCd0NBQUJQS1FLRWhLd0tBT0FFQWp5U0pvbVJab2loWmxpaUtwdWk2b21pNnJxUnBwcWxwbm1sYW1tZWFwbW1xc2ltYXJpeHBtbWxhbm1hYW1xZVpwbWlhcm11YXBxeUtwaW5McG1yS3NtbWFzdXk2c20yN3JtemJvbW5Lc21tYXNteWFwaXk3c3F2YnJ1enF1cVJacHFsNW5tbHFubWVhcG1yS3NtbWFycXQ1bm1wNm5taXFuaWlxcW1xcXFxMnFxaXhibm1lYW11aXBwaWVLcW1xcXBxMmFxaXJMcHFyYXNtbXF0bXlxcW0yN3F1ejZzbTNydW1tcXNtMnFwaTJicW1yYnJ1enFzaXpidWk5cG1tbHFubWVhbXVlWnBtbWFzbXlhcWl0Ym5xZWFuaWlxcXVhSnBtcXFxaXlicHFyS2x1ZVpxaWVLcXVxSm5tdWFxaXJMcG1yYXFtbWF0bXlxcWkyYnBpckxybTM3dnV2S3NtNnFxbXlicW1ycnBtcktzbXpMdnUvS3F1NktwaW5McHFyYXNtbXFzaTNic3UvTHNxejdvbW5Lc21tcXNtMnFxaTdMc20wYnMyejd1bWlhc20ycXBpMmJxaXJic2kzN3VpemJ1dS9Lcm0rcnFxenJzaTM3dXU3NnJuRHJ1akM4c216N3FxejZ1aXZidW0vck10djJmVVRUbEdWVE5XM2JWRlZaZG1YWjltWGI5bjNSTkcxYlZWVmJOazNWdG1WWjluMVp0bTFoTkUzWk5sVlYxazNWdEcxWmxtMWh0bVhoZG1YWnQyVmI5blhYbFhWZjEzM2oxMlhkNXJxeTdjdXlyZnVxcS9xMjd2dkNjT3V1OEFvQUFCaHdBQUFJTUtFTUZCcXlFZ0NJQWdBQWpHR01NUWlOVXM0NUI2RlJ5am5uSUdUT1FRZ2hsY3c1Q0NHVWtqa0hvWlNVTXVjZ2xKSlNDS0dVbEZvTElaU1VVbXNGQUFBVU9BQUFCTmlnS2JFNFFLRWhLd0dBVkFBQWcrTllsdWVab21yYXNtTkpuaWVLcXFtcXR1MUlsdWVKb21tcXFtMWJuaWVLcHFtcXJ1dnJtdWVKb21tcXF1dnF1bWlhcHFtcXJ1dTZ1aTZhb3FtcXF1dTZzcTZicHFxcXJpdTdzdXpycHFxcXF1dktyaXo3d3FxNnJpdkxzbTNyd3JDcXJ1dktzbXpidG0vY3VxN3J2dS83d3BHdDY3b3UvTUl4REVjQkFPQUpEZ0JBQlRhc2puQlNOQlpZYU1oS0FDQURBSUF3QmlHREVFSUdJWVNRVWtvaHBaUVNBQUF3NEFBQUVHQkNHU2cwWkVVQUVDY0FBQmhES2FTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKSUthV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS3FhU1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0taVlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWdvQWtJcHdBSkI2TUtFTUZCcXlFZ0JJQlFBQWpGRktLY2FjZ3hBeDVoaGowRWtvS1dMTU9jWWNsSkpTNVJ5RUVGSnBMYmZLT1FnaHBOUlNiWmx6VWxxTE1lWVlNK2VrcEJSYnpUbUhVbEtMc2VhYWErNmt0RlpycmpYbldscXJOZGVjYzgyNXRCWnJyam5YbkhQTE1kZWNjODQ1NXhoenpqbm5uSFBPQlFEZ05EZ0FnQjdZc0RyQ1NkRllZS0VoS3dHQVZBQUFBaG1sR0hQT09lZ1FVb3c1NXh5RUVDS0ZHSFBPT1FnaFZJdzU1eHgwRUVLb0dIUE1PUWdoaEpBNTV4eUVFRUlJSVhNT091Z2doQkJDQngyRUVFSUlvWlRPUVFnaGhCQktLQ0dFRUVJSUlZUVFPZ2doaEJCQ0NDR0VFRUlJSVlSU1NnZ2hoQkJDQ2FHVVVBQUFZSUVEQUVDQURhc2puQlNOQlJZYXNoSUFBQUlBZ0J5V29GTE9oRUdPUVk4TlFjcFJNdzFDVERuUm1XSk9hak1WVTVBNUVKMTBFaGxxUWRsZU1nc0FBSUFnQUNEQUJCQVlJQ2o0UWdpSU1RQUFRWWpNRUFtRlZiREFvQXdhSE9ZQndBTkVoRVFBa0ppZ1NMdTRnQzREWE5ERlhRZENDRUlRZ2xnY1FBRUpPRGpoaGlmZThJUWJuS0JUVk9vZ0FBQUFBQUFNQU9BQkFPQ2dBQ0lpbXF1d3VNREkwTmpnNlBBSUFBQUFBQUFXQVBnQUFEZytnSWlJNWlvc0xqQXlORFk0T2p3Q0FBQUFBQUFBQUFDQWdJQUFBQUFBQUVBQUFBQ0FnRTluWjFNQUJBRUFBQUFBQUFBQVhjWGVGd0lBQUFCcTJucHhBZ0VCQUFvPScsXG4gIGVtcHR5TXAzOiAnLy9zUXhBQUR3QUFCcEFBQUFDQUFBRFNBQUFBRVRFRk5SVE11T1RrdU5WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVT0nLFxuICBoaWdodGljazogJ1VrbEdSa1FGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZU0FGQUFDeC94Zi9kQURPQUN3QnNQM3ArNkgrekFHb0JPa0NDd0JYL0VINU92eGxBNGtKMndjU0FyVDlFL3V0K0hUMmV2VXg5OG42T0FGNUNDVU13UXZmQ09zSnhBeDBEU0lNRUFxOUJpQUIzdmh6N21Ma1Q5c1IxMzNZeE4yczVRTHYwdnJVQm53Um54dVFKZUVzU0RDaU1kOHlGUzhhS0ZJaG9oVXNDS2o2NHU2MjVPcmFBOUh1eVBuRWxjUCt3eHZKV3RXMjU2MzdWUTBqSFBnbkJURERNMW8wQ3pLTEsrOGh6aGdGRE96OFNlNEo0N0RZVnRHMHo1ZlFxOUxCMTJyZkErajk5cm9IQWhlbEl5TXdJamRUT3VVOG1qd0lPR294aENiNUU1My9qKzNrMy9mVFk4cFR3NHkvVHIrZXc4RE12ZHNrOFJjSFJSa1NLTzR5R1RrSFBrVS9yenp5TmNnc3JSOTREcC81citaczE3ek9uY29EeGhmRTM4V0x5bi9UZU9NaTlyMElSeGxSS0lRenlUbE9QS285eWptV01jb2tEUkxjL1k3cnVkdGR6dS9EMkwxSXUrMjdKY0czeVlyVkx1amwrM1VPWngxVUs1UTBxem1OUERrOFpqZWVNUG9qemhIKy9qTHRQZDVtMGhITEhzWUl3NVRFTU1uQTBqdmo4ZlNPQml3WEFTWmdNek04ZFVCR1FiSStyempwS2tJWnlnWlQ5UWZsY2RhUnlxWEN6NytWd1VQSDc4NHIzSzdzK3YwS0R1OGJ2eWVMTWI0M05qcmhPSW8wZFN2UUhpMFBuUDZpN292ZzNOVHh5NC9HZjhYOHlIL1FCdHZYNTVQMllnYjBGY1Vqc3k0TE5tSTVlamlYTTM4cjdpQzhGSndIUHZvazdkRGdRZGFKemxUS0lzb0Z6c3JWa3VBODdkLzZxQWk3RlEwaDlDbEtNTEV6M1RPck1CY3FZU0Q4RTlBRmQvZFM2a1RmNmRiVTBYblF2OUlIMk1YZlorbG45REVBRnd3ZEZ5OGdpaWI2S2F3cWVDaGdJL1ViSEJPVENaai92dlhlN0lubEZ1RE4zUDNiMGQxRjRnenBpZkcyK3U0RDdRdzFGZndibkNEK0lsZ2pXeUhMSFBNVm9nMm1CTDM3cXZQKzdOdm5ZdVR2NHJ2amZ1Yk42azN3cFBaMC9Xa0VPd3RpRVVzV2N4bStHbDRhT2hoaUZEQVBJd21iQXRuN1RQVnk3N3pxY2VmcjVZSG1IdWxsN2VueWZQbWNBSGdIZXcxUkVyOFZoaGQvRitBVjFSSjBEaWtKV1FOYy9aUDNlZktkN2h2czJ1cjQ2ckhzNXU4ZTlOLzQ4LzBoQS84SEZnd3VEMDRSU0JJUkVxc1FPZzdtQ3NzR01BSlcvWG40Ry9USzhMYnV6dTBJN3FUdm5QSnk5c1g2YlA4NEJMWUliQXdkRDg0UVl4RzdFT2NPREF4d0NGTUVBUUM5KzdQM1N2VFg4WEh3K3U5UjhLVHhJdlNvOStYN1ZRQ1VCSjBJTXd6aURqNFFMaEFHRDlVTXJnblRCWmNCUnYxditYdjJVZlMrOHRmeCt2RVM4N3owK3ZiMytaZjlaZ0VRQlNFSVVBcldDOGtNMlF5ekM1RUpFQWR2QkhnQlhQNW4rK3I0QXZkODlXajA3Zk13OUQzMUp2ZnArVWo5eFFEOUE4UUc1UWhYQ2xFTHJBc3ZDOXdKN2dkNkJXSUMzdjZPKzdUNFBQWk45RUh6V3ZOZjlQejFGdml0K3FMOXJRQ0hBd0VHL3dlQ0NaVUtGd3ZEQ25JSmNBY1FCV2NDYWY4Wi9DRDU1dmFCOWREMHdQU1A5VUwzbS9rNy9NeitKd0V5QXc4RnpBWTdDQnNKYVFrNUNXa0kyZ2F0QkNJQ1lmK2ovRnI2dmZpVjk4NzJzZlpQOTF6NHAvbFIrM0g5emY4OUFyb0VGQWZqQ1AwSmN3bzhDakFKZFFkZ0JTRURrZ0RRL1ZqN1pmblI5NVQyOGZVZDl2MzJWdmcyK25iOCsvNnhBV29FNEFiRENQNEpwQXFiQ3FRSjB3ZUVCZmdDVEFDVC9SMzdNL20rOTY3MklQWTY5Z2IzYWZoVyt0VDhxZitNQWowRmdnY3VDU2NLWEFyaUNjTUlFQWZ5QkpZQ0Z3Q1AvUno3QS9sNzkzejJGL1puOW1IMzdmamQraTM5eWY5cEF0MEVGQWZSQ05rSkdBcXJDWllJdmdaUEJKOEI2UDQvL00zNTB2ZHo5cS8xbGZVcTltejNSUG1pKzNIK2JnRlZCT1FHM3dnSENrd0swQW03Q0NBSENnV21BakFBJyxcbiAgbG93dGljazogJ1VrbEdSbFFGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZVEFGQUFCMC81ditVLzRULzNnQTB3RlRBdVVCK2Y4ZC9uVDkwZjFxL3ViK3RmNDYvbWIvOHdGUUE5Z0M3d0NkL21yK0ZBR1JBM2NFNndKZi9oMzZldm12Kzh2L053UkhCWlVDMi82MCsvLzVFdnVaL2FYL2JnRk9BcDhBenZ6aDl3ZnpMUEY2OHpUNHkvMkJBeWdJZlF3YUVqWVkweDMxSXJ3bDhTT1dIVkVTT2dQaDlOZnBSZUZ0MjJuWUhkZEQyQlhjWmVEYTVJbnFnUER4OW5QKzZnUzRDQllMbncwekVTMFdYeHY0SGtjZ0xoLzFHK0VYMVJOcEQ0d0tpZ1hILzZyNS9mTnU3bFRwaitadTVoSG9YT3RMNzFieXIvUXA5MUw2NHY2T0JPNEpvUTV6RXNrVStoVTFGaVFWZVJQN0VXZ1A0UXIwQklUK3RQaWQ5QzN5MXZDaDhGRHhKdksyOHZ2eXkvTEE4cEx6VS9YUDk1djZ4dnc0L3VEL1JBSzJCU2tLY2c2QkVTY1RaQk1lRXFrUFRReGpDS0VFVndGaS9udjdoL2hwOWFEeUF2SFA4TWZ4THZNKzlQWDB1UFcxOWcvNExmcjcvQzRBS2dOYUJYUUd5d2IwQmhJSFdRZldCMW9JekFqdENGOElId2R0QmFrRFZ3S0xBZVlBOHY5dy9rajgxL25ROTR2MjkvWFg5YnoxYlBVWTlVejFaL2FIK0hyN3lQNE1BaTRGK3djZkNuWUxOZ3lmRFBzTVN3MHNEVUFNZmdyY0I1SUVNd0ZiL2lYOFQvcFQrTy8xWC9NZjhjYnZyTysxOE1MeXZmVlArUmY5d2dBb0JDRUhwd25JQzVFTjRRNUFEM3dPMUF5MENwc0l2d2J2Qk5jQ2JRQXIvblg4T2ZzZit2YjRtdmRhOXJqMXovV1g5cEwzYS9oSCtaWDZSL3duL3ZQL2VRRVNBL0FFK3dZRENjd0tGQXlQRENrTUZRdVNDZTRIVlFiU0JIUURDd0k4QU5MOUpQdVkrSFgyOHZUcTgyUHpkUE1WOUF6MU1mWjQ5ekQ1Z2Z0eC9zUUJCUVhMQjhjSi9ncXBDdzhNaWd3V0RYRU5YUTJyRERVTDdRZ0RCc3dDZHY4Uy9LNzRXUFZrOGhYd291NFA3bXZ1MSs5VDhwejFVdmxpL1pvQndnV1JDY3NNUGcvQ0VFUVI0UkRBRHdvTzl3dXNDVk1INEFSU0Fwbi91ZnpkK1dqM2J2WDc4eHp6eC9MNjhxenoxdlNEOXFYNEdmdmQvYzBBaHdPL0JXd0htZ2h2Q1FFS1ZRb25DbHNKQ3dpSUJoMEYwZ09nQW0wQk93QXgvMDMrWFAwZy9MYjZjUG1YK0YvNHZmaCsrVEg2cy9vcys3LzdjdndML1p6OVhQNU8vM0lBM0FGOUF6c0Y5Z2FVQ0FBS0hndWVDemNMOXdudEIzc0Y0d0l6QUkzOTZmcDErR3YySXZXbjlOMzBwL1hpOW03NEcvcnUrOVA5ay84YUFZRUMxQU1UQlNJRzB3WXVCMWdIa2djQUNHRUlTQWhUQnpFRldBS3QvNUw5MmZ1VSt2WDUwZm1mK1NQNWkvZ2IrQmY0bXZpditTcjdrdnliL1VqK3IvNFgvOHIvK2dDaUFvMEVVQWFSQnp3SVN3anFCM0lIR1FmQ0J2OEZwZ1RNQXBRQUtmNjcrNW41L3ZmbjlqejJ5UFZuOVNMMVJQWHE5U1AzRHZtcis2ZitzUUdLQkFjSCt3aE9DaDBMYXdzM0MyOEtMQW1EQjVBRmZRTm9BVlAvWnYzZSs3UDZzZm5MK0N2NHZQZU05NWIzN2ZlVitKbjUxUG9xL0xMOW12K1lBVllEM2dRdUJtY0hTQWlrQ0lFSTdBZitCdUVGbmdRWEExc0J2Lzl2L3BmOU1QM1cvRmo4cS9zUis2SDZVL28zK21QNnkvcE4rL2Y3eHZ5ZS9XSCtKZjltQUQ0Q1FBUUpCaXNIdGdmNkJ3MEk4UWRzQjFzR3l3VDRBZ2dCQ1Avby9LWDZtUGcxOTU3MmpmYXo5dWYyUy9jTStFMzVFL3RXL2FmLzV3SDFBOEFGS2dma0IvQUhnd2Z4QmxBR2dRVklCTU1DSndHcy80Myt2UDBpL1pyOExmemwrOUg3NmZ2aSs5Zjc1ZnNmL0luOEJQMTAvZWo5Y2Y0Ty83Zi9kQUFjQWFVQkVnS01BaGdEcEFNRUJDRUVEd1RmQTNJRHhRTDhBU29CVXdDRy84NytKLzZoL1JyOXBQeGsvR2I4b1B3Si9YSDl3LzM5L1VEK3FQNDEvOUQvV3dEZUFHc0JBZ0tkQWhFRFFRTkFBMHNEYndPVkE1WURWd1BPQWhnQ1ZBR1JBQT09Jyxcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2FtcGxlc1xuIiwiLypcblxuXG5UaGlzIGNvZGUgaXMgYmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL3NlcmdpL2pzbWlkaVxuXG5pbmZvOiBodHRwOi8vd3d3LmRlbHVnZS5jby8/cT1taWRpLXRlbXBvLWJwbVxuXG4qL1xuXG5cbmltcG9ydCB7c2F2ZUFzfSBmcm9tICdmaWxlc2F2ZXJqcydcblxubGV0IFBQUSA9IDk2MFxubGV0IEhEUl9QUFEgPSBzdHIyQnl0ZXMoUFBRLnRvU3RyaW5nKDE2KSwgMilcblxuY29uc3QgSERSX0NIVU5LSUQgPSBbXG4gICdNJy5jaGFyQ29kZUF0KDApLFxuICAnVCcuY2hhckNvZGVBdCgwKSxcbiAgJ2gnLmNoYXJDb2RlQXQoMCksXG4gICdkJy5jaGFyQ29kZUF0KDApXG5dXG5jb25zdCBIRFJfQ0hVTktfU0laRSA9IFsweDAsIDB4MCwgMHgwLCAweDZdIC8vIEhlYWRlciBzaXplIGZvciBTTUZcbmNvbnN0IEhEUl9UWVBFMCA9IFsweDAsIDB4MF0gLy8gTWlkaSBUeXBlIDAgaWRcbmNvbnN0IEhEUl9UWVBFMSA9IFsweDAsIDB4MV0gLy8gTWlkaSBUeXBlIDEgaWRcbi8vSERSX1BQUSA9IFsweDAxLCAweEUwXSAvLyBEZWZhdWx0cyB0byA0ODAgdGlja3MgcGVyIGJlYXRcbi8vSERSX1BQUSA9IFsweDAwLCAweDgwXSAvLyBEZWZhdWx0cyB0byAxMjggdGlja3MgcGVyIGJlYXRcblxuY29uc3QgVFJLX0NIVU5LSUQgPSBbXG4gICdNJy5jaGFyQ29kZUF0KDApLFxuICAnVCcuY2hhckNvZGVBdCgwKSxcbiAgJ3InLmNoYXJDb2RlQXQoMCksXG4gICdrJy5jaGFyQ29kZUF0KDApXG5dXG5cbi8vIE1ldGEgZXZlbnQgY29kZXNcbmNvbnN0IE1FVEFfU0VRVUVOQ0UgPSAweDAwXG5jb25zdCBNRVRBX1RFWFQgPSAweDAxXG5jb25zdCBNRVRBX0NPUFlSSUdIVCA9IDB4MDJcbmNvbnN0IE1FVEFfVFJBQ0tfTkFNRSA9IDB4MDNcbmNvbnN0IE1FVEFfSU5TVFJVTUVOVCA9IDB4MDRcbmNvbnN0IE1FVEFfTFlSSUMgPSAweDA1XG5jb25zdCBNRVRBX01BUktFUiA9IDB4MDZcbmNvbnN0IE1FVEFfQ1VFX1BPSU5UID0gMHgwN1xuY29uc3QgTUVUQV9DSEFOTkVMX1BSRUZJWCA9IDB4MjBcbmNvbnN0IE1FVEFfRU5EX09GX1RSQUNLID0gMHgyZlxuY29uc3QgTUVUQV9URU1QTyA9IDB4NTFcbmNvbnN0IE1FVEFfU01QVEUgPSAweDU0XG5jb25zdCBNRVRBX1RJTUVfU0lHID0gMHg1OFxuY29uc3QgTUVUQV9LRVlfU0lHID0gMHg1OVxuY29uc3QgTUVUQV9TRVFfRVZFTlQgPSAweDdmXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVBc01JRElGaWxlKHNvbmcsIGZpbGVOYW1lID0gc29uZy5uYW1lLCBwcHEgPSA5NjApIHtcblxuICBQUFEgPSBwcHFcbiAgSERSX1BQUSA9IHN0cjJCeXRlcyhQUFEudG9TdHJpbmcoMTYpLCAyKVxuXG4gIGxldCBieXRlQXJyYXkgPSBbXS5jb25jYXQoSERSX0NIVU5LSUQsIEhEUl9DSFVOS19TSVpFLCBIRFJfVFlQRTEpXG4gIGxldCB0cmFja3MgPSBzb25nLmdldFRyYWNrcygpXG4gIGxldCBudW1UcmFja3MgPSB0cmFja3MubGVuZ3RoICsgMVxuICBsZXQgaSwgbWF4aSwgdHJhY2ssIG1pZGlGaWxlLCBkZXN0aW5hdGlvbiwgYjY0XG4gIGxldCBhcnJheUJ1ZmZlciwgZGF0YVZpZXcsIHVpbnRBcnJheVxuXG4gIGJ5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQoc3RyMkJ5dGVzKG51bVRyYWNrcy50b1N0cmluZygxNiksIDIpLCBIRFJfUFBRKVxuXG4gIC8vY29uc29sZS5sb2coYnl0ZUFycmF5KTtcbiAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdCh0cmFja1RvQnl0ZXMoc29uZy5fdGltZUV2ZW50cywgc29uZy5fZHVyYXRpb25UaWNrcywgJ3RlbXBvJykpXG5cbiAgZm9yKGkgPSAwLCBtYXhpID0gdHJhY2tzLmxlbmd0aDsgaSA8IG1heGk7IGkrKyl7XG4gICAgdHJhY2sgPSB0cmFja3NbaV07XG4gICAgbGV0IGluc3RydW1lbnRcbiAgICBpZih0cmFjay5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICBpbnN0cnVtZW50ID0gdHJhY2suX2luc3RydW1lbnQuaWRcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCB0cmFjay5fZXZlbnRzLmxlbmd0aCwgaW5zdHJ1bWVudClcbiAgICBieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHRyYWNrVG9CeXRlcyh0cmFjay5fZXZlbnRzLCBzb25nLl9kdXJhdGlvblRpY2tzLCB0cmFjay5uYW1lLCBpbnN0cnVtZW50KSlcbiAgICAvL2J5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQodHJhY2tUb0J5dGVzKHRyYWNrLl9ldmVudHMsIHNvbmcuX2xhc3RFdmVudC5pY2tzLCB0cmFjay5uYW1lLCBpbnN0cnVtZW50KSlcbiAgfVxuXG4gIC8vYjY0ID0gYnRvYShjb2RlczJTdHIoYnl0ZUFycmF5KSlcbiAgLy93aW5kb3cubG9jYXRpb24uYXNzaWduKFwiZGF0YTphdWRpby9taWRpO2Jhc2U2NCxcIiArIGI2NClcbiAgLy9jb25zb2xlLmxvZyhiNjQpLy8gc2VuZCB0byBzZXJ2ZXJcblxuICBtYXhpID0gYnl0ZUFycmF5Lmxlbmd0aFxuICBhcnJheUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihtYXhpKVxuICB1aW50QXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcilcbiAgZm9yKGkgPSAwOyBpIDwgbWF4aTsgaSsrKXtcbiAgICB1aW50QXJyYXlbaV0gPSBieXRlQXJyYXlbaV1cbiAgfVxuICBtaWRpRmlsZSA9IG5ldyBCbG9iKFt1aW50QXJyYXldLCB7dHlwZTogJ2FwcGxpY2F0aW9uL3gtbWlkaScsIGVuZGluZ3M6ICd0cmFuc3BhcmVudCd9KVxuICBmaWxlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL1xcLm1pZGkkLywgJycpXG4gIC8vbGV0IHBhdHQgPSAvXFwubWlkW2ldezAsMX0kL1xuICBsZXQgcGF0dCA9IC9cXC5taWQkL1xuICBsZXQgaGFzRXh0ZW5zaW9uID0gcGF0dC50ZXN0KGZpbGVOYW1lKVxuICBpZihoYXNFeHRlbnNpb24gPT09IGZhbHNlKXtcbiAgICBmaWxlTmFtZSArPSAnLm1pZCdcbiAgfVxuICAvL2NvbnNvbGUubG9nKGZpbGVOYW1lLCBoYXNFeHRlbnNpb24pXG4gIHNhdmVBcyhtaWRpRmlsZSwgZmlsZU5hbWUpXG4gIC8vd2luZG93LmxvY2F0aW9uLmFzc2lnbih3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChtaWRpRmlsZSkpXG59XG5cblxuZnVuY3Rpb24gdHJhY2tUb0J5dGVzKGV2ZW50cywgbGFzdEV2ZW50VGlja3MsIHRyYWNrTmFtZSwgaW5zdHJ1bWVudE5hbWUgPSAnbm8gaW5zdHJ1bWVudCcpe1xuICB2YXIgbGVuZ3RoQnl0ZXMsXG4gICAgaSwgbWF4aSwgZXZlbnQsIHN0YXR1cyxcbiAgICB0cmFja0xlbmd0aCwgLy8gbnVtYmVyIG9mIGJ5dGVzIGluIHRyYWNrIGNodW5rXG4gICAgdGlja3MgPSAwLFxuICAgIGRlbHRhID0gMCxcbiAgICB0cmFja0J5dGVzID0gW107XG5cbiAgaWYodHJhY2tOYW1lKXtcbiAgICB0cmFja0J5dGVzLnB1c2goMHgwMCk7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAzKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKHRyYWNrTmFtZS5sZW5ndGgpKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoc3RyaW5nVG9OdW1BcnJheSh0cmFja05hbWUpKTtcbiAgfVxuXG4gIGlmKGluc3RydW1lbnROYW1lKXtcbiAgICB0cmFja0J5dGVzLnB1c2goMHgwMCk7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDA0KTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKGluc3RydW1lbnROYW1lLmxlbmd0aCkpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHJpbmdUb051bUFycmF5KGluc3RydW1lbnROYW1lKSk7XG4gIH1cblxuICBmb3IoaSA9IDAsIG1heGkgPSBldmVudHMubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKXtcbiAgICBldmVudCA9IGV2ZW50c1tpXTtcbiAgICBkZWx0YSA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gICAgZGVsdGEgPSBjb252ZXJ0VG9WTFEoZGVsdGEpO1xuICAgIC8vY29uc29sZS5sb2coZGVsdGEpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChkZWx0YSk7XG4gICAgLy90cmFja0J5dGVzLnB1c2guYXBwbHkodHJhY2tCeXRlcywgZGVsdGEpO1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDB4ODAgfHwgZXZlbnQudHlwZSA9PT0gMHg5MCl7IC8vIG5vdGUgb2ZmLCBub3RlIG9uXG4gICAgICAvL3N0YXR1cyA9IHBhcnNlSW50KGV2ZW50LnR5cGUudG9TdHJpbmcoMTYpICsgZXZlbnQuY2hhbm5lbC50b1N0cmluZygxNiksIDE2KTtcbiAgICAgIHN0YXR1cyA9IGV2ZW50LnR5cGUgKyAoZXZlbnQuY2hhbm5lbCB8fCAwKVxuICAgICAgdHJhY2tCeXRlcy5wdXNoKHN0YXR1cyk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQuZGF0YTEpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKGV2ZW50LmRhdGEyKTtcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAweDUxKXsgLy8gdGVtcG9cbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDUxKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDAzKTsvLyBsZW5ndGhcbiAgICAgIC8vdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUSgzKSk7Ly8gbGVuZ3RoXG4gICAgICB2YXIgbWljcm9TZWNvbmRzID0gTWF0aC5yb3VuZCg2MDAwMDAwMCAvIGV2ZW50LmJwbSk7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJwbSlcbiAgICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHIyQnl0ZXMobWljcm9TZWNvbmRzLnRvU3RyaW5nKDE2KSwgMykpO1xuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDB4NTgpeyAvLyB0aW1lIHNpZ25hdHVyZVxuICAgICAgdmFyIGRlbm9tID0gZXZlbnQuZGVub21pbmF0b3I7XG4gICAgICBpZihkZW5vbSA9PT0gMil7XG4gICAgICAgIGRlbm9tID0gMHgwMTtcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSA0KXtcbiAgICAgICAgZGVub20gPSAweDAyO1xuICAgICAgfWVsc2UgaWYoZGVub20gPT09IDgpe1xuICAgICAgICBkZW5vbSA9IDB4MDM7XG4gICAgICB9ZWxzZSBpZihkZW5vbSA9PT0gMTYpe1xuICAgICAgICBkZW5vbSA9IDB4MDQ7XG4gICAgICB9ZWxzZSBpZihkZW5vbSA9PT0gMzIpe1xuICAgICAgICBkZW5vbSA9IDB4MDU7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRlbm9taW5hdG9yLCBldmVudC5ub21pbmF0b3IpXG4gICAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHg1OCk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHgwNCk7Ly8gbGVuZ3RoXG4gICAgICAvL3RyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoNCkpOy8vIGxlbmd0aFxuICAgICAgdHJhY2tCeXRlcy5wdXNoKGV2ZW50Lm5vbWluYXRvcik7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZGVub20pO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKFBQUSAvIGV2ZW50Lm5vbWluYXRvcik7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHgwOCk7IC8vIDMybmQgbm90ZXMgcGVyIGNyb3RjaGV0XG4gICAgICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgZXZlbnQubm9taW5hdG9yLCBldmVudC5kZW5vbWluYXRvciwgZGVub20sIFBQUS9ldmVudC5ub21pbmF0b3IpO1xuICAgIH1cbiAgICAvLyBzZXQgdGhlIG5ldyB0aWNrcyByZWZlcmVuY2VcbiAgICAvL2NvbnNvbGUubG9nKHN0YXR1cywgZXZlbnQudGlja3MsIHRpY2tzKTtcbiAgICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIGRlbHRhID0gbGFzdEV2ZW50VGlja3MgLSB0aWNrcztcbiAgLy9jb25zb2xlLmxvZygnZCcsIGRlbHRhLCAndCcsIHRpY2tzLCAnbCcsIGxhc3RFdmVudFRpY2tzKTtcbiAgZGVsdGEgPSBjb252ZXJ0VG9WTFEoZGVsdGEpO1xuICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgdGlja3MsIGRlbHRhKTtcbiAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGRlbHRhKTtcbiAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICB0cmFja0J5dGVzLnB1c2goMHgyRik7XG4gIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgLy9jb25zb2xlLmxvZyh0cmFja05hbWUsIHRyYWNrQnl0ZXMpO1xuICB0cmFja0xlbmd0aCA9IHRyYWNrQnl0ZXMubGVuZ3RoO1xuICBsZW5ndGhCeXRlcyA9IHN0cjJCeXRlcyh0cmFja0xlbmd0aC50b1N0cmluZygxNiksIDQpO1xuICByZXR1cm4gW10uY29uY2F0KFRSS19DSFVOS0lELCBsZW5ndGhCeXRlcywgdHJhY2tCeXRlcyk7XG59XG5cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuXG4vKlxuICogQ29udmVydHMgYW4gYXJyYXkgb2YgYnl0ZXMgdG8gYSBzdHJpbmcgb2YgaGV4YWRlY2ltYWwgY2hhcmFjdGVycy4gUHJlcGFyZXNcbiAqIGl0IHRvIGJlIGNvbnZlcnRlZCBpbnRvIGEgYmFzZTY0IHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gYnl0ZUFycmF5IHtBcnJheX0gYXJyYXkgb2YgYnl0ZXMgdGhhdCB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZ1xuICogQHJldHVybnMgaGV4YWRlY2ltYWwgc3RyaW5nXG4gKi9cblxuZnVuY3Rpb24gY29kZXMyU3RyKGJ5dGVBcnJheSkge1xuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBieXRlQXJyYXkpO1xufVxuXG4vKlxuICogQ29udmVydHMgYSBTdHJpbmcgb2YgaGV4YWRlY2ltYWwgdmFsdWVzIHRvIGFuIGFycmF5IG9mIGJ5dGVzLiBJdCBjYW4gYWxzb1xuICogYWRkIHJlbWFpbmluZyAnMCcgbmliYmxlcyBpbiBvcmRlciB0byBoYXZlIGVub3VnaCBieXRlcyBpbiB0aGUgYXJyYXkgYXMgdGhlXG4gKiB8ZmluYWxCeXRlc3wgcGFyYW1ldGVyLlxuICpcbiAqIEBwYXJhbSBzdHIge1N0cmluZ30gc3RyaW5nIG9mIGhleGFkZWNpbWFsIHZhbHVlcyBlLmcuICcwOTdCOEEnXG4gKiBAcGFyYW0gZmluYWxCeXRlcyB7SW50ZWdlcn0gT3B0aW9uYWwuIFRoZSBkZXNpcmVkIG51bWJlciBvZiBieXRlcyB0aGF0IHRoZSByZXR1cm5lZCBhcnJheSBzaG91bGQgY29udGFpblxuICogQHJldHVybnMgYXJyYXkgb2YgbmliYmxlcy5cbiAqL1xuXG5mdW5jdGlvbiBzdHIyQnl0ZXMoc3RyLCBmaW5hbEJ5dGVzKSB7XG4gIGlmIChmaW5hbEJ5dGVzKSB7XG4gICAgd2hpbGUgKChzdHIubGVuZ3RoIC8gMikgPCBmaW5hbEJ5dGVzKSB7XG4gICAgICBzdHIgPSAnMCcgKyBzdHI7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJ5dGVzID0gW107XG4gIGZvciAodmFyIGkgPSBzdHIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDIpIHtcbiAgICB2YXIgY2hhcnMgPSBpID09PSAwID8gc3RyW2ldIDogc3RyW2kgLSAxXSArIHN0cltpXTtcbiAgICBieXRlcy51bnNoaWZ0KHBhcnNlSW50KGNoYXJzLCAxNikpO1xuICB9XG5cbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG5cbi8qKlxuICogVHJhbnNsYXRlcyBudW1iZXIgb2YgdGlja3MgdG8gTUlESSB0aW1lc3RhbXAgZm9ybWF0LCByZXR1cm5pbmcgYW4gYXJyYXkgb2ZcbiAqIGJ5dGVzIHdpdGggdGhlIHRpbWUgdmFsdWVzLiBNaWRpIGhhcyBhIHZlcnkgcGFydGljdWxhciB0aW1lIHRvIGV4cHJlc3MgdGltZSxcbiAqIHRha2UgYSBnb29kIGxvb2sgYXQgdGhlIHNwZWMgYmVmb3JlIGV2ZXIgdG91Y2hpbmcgdGhpcyBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gdGlja3Mge0ludGVnZXJ9IE51bWJlciBvZiB0aWNrcyB0byBiZSB0cmFuc2xhdGVkXG4gKiBAcmV0dXJucyBBcnJheSBvZiBieXRlcyB0aGF0IGZvcm0gdGhlIE1JREkgdGltZSB2YWx1ZVxuICovXG5mdW5jdGlvbiBjb252ZXJ0VG9WTFEodGlja3MpIHtcbiAgdmFyIGJ1ZmZlciA9IHRpY2tzICYgMHg3RjtcblxuICB3aGlsZSh0aWNrcyA9IHRpY2tzID4+IDcpIHtcbiAgICBidWZmZXIgPDw9IDg7XG4gICAgYnVmZmVyIHw9ICgodGlja3MgJiAweDdGKSB8IDB4ODApO1xuICB9XG5cbiAgdmFyIGJMaXN0ID0gW107XG4gIHdoaWxlKHRydWUpIHtcbiAgICBiTGlzdC5wdXNoKGJ1ZmZlciAmIDB4ZmYpO1xuXG4gICAgaWYgKGJ1ZmZlciAmIDB4ODApIHtcbiAgICAgIGJ1ZmZlciA+Pj0gODtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyh0aWNrcywgYkxpc3QpO1xuICByZXR1cm4gYkxpc3Q7XG59XG5cblxuLypcbiAqIENvbnZlcnRzIGEgc3RyaW5nIGludG8gYW4gYXJyYXkgb2YgQVNDSUkgY2hhciBjb2RlcyBmb3IgZXZlcnkgY2hhcmFjdGVyIG9mXG4gKiB0aGUgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBzdHIge1N0cmluZ30gU3RyaW5nIHRvIGJlIGNvbnZlcnRlZFxuICogQHJldHVybnMgYXJyYXkgd2l0aCB0aGUgY2hhcmNvZGUgdmFsdWVzIG9mIHRoZSBzdHJpbmdcbiAqL1xuY29uc3QgQVAgPSBBcnJheS5wcm90b3R5cGVcbmZ1bmN0aW9uIHN0cmluZ1RvTnVtQXJyYXkoc3RyKSB7XG4gIC8vIHJldHVybiBzdHIuc3BsaXQoKS5mb3JFYWNoKGNoYXIgPT4ge1xuICAvLyAgIHJldHVybiBjaGFyLmNoYXJDb2RlQXQoMClcbiAgLy8gfSlcbiAgcmV0dXJuIEFQLm1hcC5jYWxsKHN0ciwgZnVuY3Rpb24oY2hhcikge1xuICAgIHJldHVybiBjaGFyLmNoYXJDb2RlQXQoMClcbiAgfSlcbn1cbiIsImltcG9ydCB7Z2V0TUlESU91dHB1dEJ5SWQsIGdldE1JRElPdXRwdXRzfSBmcm9tICcuL2luaXRfbWlkaSdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJyAvLyBtaWxsaXNcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXJ7XG5cbiAgY29uc3RydWN0b3Ioc29uZyl7XG4gICAgdGhpcy5zb25nID0gc29uZ1xuICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLmJ1ZmZlclRpbWUgPSBzb25nLmJ1ZmZlclRpbWVcbiAgfVxuXG5cbiAgaW5pdChtaWxsaXMpe1xuICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSBtaWxsaXNcbiAgICB0aGlzLnNvbmdTdGFydE1pbGxpcyA9IG1pbGxpc1xuICAgIHRoaXMuZXZlbnRzID0gdGhpcy5zb25nLl9hbGxFdmVudHNcbiAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aFxuICAgIHRoaXMuaW5kZXggPSAwXG4gICAgdGhpcy5tYXh0aW1lID0gMFxuICAgIHRoaXMucHJldk1heHRpbWUgPSAwXG4gICAgdGhpcy5iZXlvbmRMb29wID0gZmFsc2UgLy8gdGVsbHMgdXMgaWYgdGhlIHBsYXloZWFkIGhhcyBhbHJlYWR5IHBhc3NlZCB0aGUgbG9vcGVkIHNlY3Rpb25cbiAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlXG4gICAgdGhpcy5sb29wZWQgPSBmYWxzZVxuICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gIH1cblxuXG4gIHVwZGF0ZVNvbmcoKXtcbiAgICAvL3RoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSB0aGlzLnNvbmcuX2N1cnJlbnRNaWxsaXNcbiAgICB0aGlzLmV2ZW50cyA9IHRoaXMuc29uZy5fYWxsRXZlbnRzXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLmluZGV4ID0gMFxuICAgIHRoaXMubWF4dGltZSA9IDBcbiAgICAvL3RoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZy5fY3VycmVudE1pbGxpcylcbiAgfVxuXG5cbiAgc2V0VGltZVN0YW1wKHRpbWVTdGFtcCl7XG4gICAgdGhpcy50aW1lU3RhbXAgPSB0aW1lU3RhbXAgLy8gdGltZXN0YW1wIFdlYkF1ZGlvIGNvbnRleHQgLT4gZm9yIGludGVybmFsIGluc3RydW1lbnRzXG4gICAgdGhpcy50aW1lU3RhbXAyID0gcGVyZm9ybWFuY2Uubm93KCkgLy8gdGltZXN0YW1wIHNpbmNlIG9wZW5pbmcgd2VicGFnZSAtPiBmb3IgZXh0ZXJuYWwgaW5zdHJ1bWVudHNcbiAgfVxuXG4gIC8vIGdldCB0aGUgaW5kZXggb2YgdGhlIGV2ZW50IHRoYXQgaGFzIGl0cyBtaWxsaXMgdmFsdWUgYXQgb3IgcmlnaHQgYWZ0ZXIgdGhlIHByb3ZpZGVkIG1pbGxpcyB2YWx1ZVxuICBzZXRJbmRleChtaWxsaXMpe1xuICAgIGxldCBpID0gMFxuICAgIGxldCBldmVudFxuICAgIGZvcihldmVudCBvZiB0aGlzLmV2ZW50cyl7XG4gICAgICBpZihldmVudC5taWxsaXMgPj0gbWlsbGlzKXtcbiAgICAgICAgdGhpcy5pbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cblxuICAgIHRoaXMuYmV5b25kTG9vcCA9IG1pbGxpcyA+IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgIC8vIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICAvL3RoaXMubG9vcGVkID0gZmFsc2VcbiAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlXG4gIH1cblxuXG4gIGdldEV2ZW50cygpe1xuICAgIGxldCBldmVudHMgPSBbXVxuXG4gICAgaWYodGhpcy5zb25nLl9sb29wID09PSB0cnVlICYmIHRoaXMuc29uZy5fbG9vcER1cmF0aW9uIDwgdGhpcy5idWZmZXJUaW1lKXtcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ1N0YXJ0TWlsbGlzICsgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gLSAxXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5zb25nLmxvb3BEdXJhdGlvbik7XG4gICAgfVxuXG4gICAgaWYodGhpcy5zb25nLl9sb29wID09PSB0cnVlKXtcblxuICAgICAgaWYodGhpcy5tYXh0aW1lID49IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAmJiB0aGlzLmJleW9uZExvb3AgPT09IGZhbHNlKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnTE9PUCcsIHRoaXMubWF4dGltZSwgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKVxuXG4gICAgICAgIGxldCBkaWZmID0gdGhpcy5tYXh0aW1lIC0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzICsgZGlmZlxuXG4gICAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS1MT09QRUQnLCB0aGlzLm1heHRpbWUsIGRpZmYsIHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzLCB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMpO1xuXG4gICAgICAgIGlmKHRoaXMubG9vcGVkID09PSBmYWxzZSl7XG4gICAgICAgICAgdGhpcy5sb29wZWQgPSB0cnVlO1xuICAgICAgICAgIGxldCBsZWZ0TWlsbGlzID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXNcbiAgICAgICAgICBsZXQgcmlnaHRNaWxsaXMgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXNcblxuICAgICAgICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgICAgICAgIGxldCBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHJpZ2h0TWlsbGlzKXtcbiAgICAgICAgICAgICAgZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgICAgICAgZXZlbnQudGltZTIgPSB0aGlzLnRpbWVTdGFtcDIgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpc1xuICAgICAgICAgICAgICBldmVudHMucHVzaChldmVudClcblxuICAgICAgICAgICAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQudHlwZSlcbiAgICAgICAgICAgICAgdGhpcy5pbmRleCsrXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBzdG9wIG92ZXJmbG93aW5nIG5vdGVzLT4gYWRkIGEgbmV3IG5vdGUgb2ZmIGV2ZW50IGF0IHRoZSBwb3NpdGlvbiBvZiB0aGUgcmlnaHQgbG9jYXRvciAoZW5kIG9mIHRoZSBsb29wKVxuICAgICAgICAgIGxldCBlbmRUaWNrcyA9IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLnRpY2tzIC0gMVxuICAgICAgICAgIGxldCBlbmRNaWxsaXMgPSB0aGlzLnNvbmcuY2FsY3VsYXRlUG9zaXRpb24oe3R5cGU6ICd0aWNrcycsIHRhcmdldDogZW5kVGlja3MsIHJlc3VsdDogJ21pbGxpcyd9KS5taWxsaXNcblxuICAgICAgICAgIGZvcihsZXQgbm90ZSBvZiB0aGlzLm5vdGVzLnZhbHVlcygpKXtcbiAgICAgICAgICAgIGxldCBub3RlT24gPSBub3RlLm5vdGVPblxuICAgICAgICAgICAgbGV0IG5vdGVPZmYgPSBub3RlLm5vdGVPZmZcbiAgICAgICAgICAgIGlmKG5vdGVPZmYubWlsbGlzIDw9IHJpZ2h0TWlsbGlzKXtcbiAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBldmVudCA9IG5ldyBNSURJRXZlbnQoZW5kVGlja3MsIDEyOCwgbm90ZU9uLmRhdGExLCAwKVxuICAgICAgICAgICAgZXZlbnQubWlsbGlzID0gZW5kTWlsbGlzXG4gICAgICAgICAgICBldmVudC5fcGFydCA9IG5vdGVPbi5fcGFydFxuICAgICAgICAgICAgZXZlbnQuX3RyYWNrID0gbm90ZU9uLl90cmFja1xuICAgICAgICAgICAgZXZlbnQubWlkaU5vdGUgPSBub3RlXG4gICAgICAgICAgICBldmVudC5taWRpTm90ZUlkID0gbm90ZS5pZFxuICAgICAgICAgICAgZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgICAgIGV2ZW50LnRpbWUyID0gdGhpcy50aW1lU3RhbXAyICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2FkZGVkJywgZXZlbnQpXG4gICAgICAgICAgICBldmVudHMucHVzaChldmVudClcbiAgICAgICAgICB9XG5cbi8qXG4gICAgICAgICAgLy8gc3RvcCBvdmVyZmxvd2luZyBhdWRpbyBzYW1wbGVzXG4gICAgICAgICAgZm9yKGkgaW4gdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cyl7XG4gICAgICAgICAgICBpZih0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzLmhhc093blByb3BlcnR5KGkpKXtcbiAgICAgICAgICAgICAgYXVkaW9FdmVudCA9IHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbaV07XG4gICAgICAgICAgICAgIGlmKGF1ZGlvRXZlbnQuZW5kTWlsbGlzID4gdGhpcy5zb25nLmxvb3BFbmQpe1xuICAgICAgICAgICAgICAgIGF1ZGlvRXZlbnQuc3RvcFNhbXBsZSh0aGlzLnNvbmcubG9vcEVuZC8xMDAwKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50c1tpXTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wcGluZyBhdWRpbyBldmVudCcsIGkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuKi9cbiAgICAgICAgICB0aGlzLm5vdGVzID0gbmV3IE1hcCgpXG4gICAgICAgICAgdGhpcy5zZXRJbmRleChsZWZ0TWlsbGlzKVxuICAgICAgICAgIHRoaXMudGltZVN0YW1wICs9IHRoaXMuc29uZy5fbG9vcER1cmF0aW9uXG4gICAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyAtPSB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvblxuXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudHMubGVuZ3RoKVxuXG4gICAgICAgICAgLy8gZ2V0IHRoZSBhdWRpbyBldmVudHMgdGhhdCBzdGFydCBiZWZvcmUgc29uZy5sb29wU3RhcnRcbiAgICAgICAgICAvL3RoaXMuZ2V0RGFuZ2xpbmdBdWRpb0V2ZW50cyh0aGlzLnNvbmcubG9vcFN0YXJ0LCBldmVudHMpO1xuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5sb29wZWQgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxlcicsIHRoaXMubG9vcGVkKVxuXG4gICAgLy8gbWFpbiBsb29wXG4gICAgZm9yKGxldCBpID0gdGhpcy5pbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspe1xuICAgICAgbGV0IGV2ZW50ID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgdGhpcy5tYXh0aW1lKVxuICAgICAgaWYoZXZlbnQubWlsbGlzIDwgdGhpcy5tYXh0aW1lKXtcblxuICAgICAgICAvL2V2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50LnRpbWUgPSAodGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgICAgICAgICBldmVudC50aW1lMiA9ICh0aGlzLnRpbWVTdGFtcDIgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXZlbnRzO1xuICB9XG5cblxuICB1cGRhdGUoZGlmZil7XG4gICAgdmFyIGksXG4gICAgICBldmVudCxcbiAgICAgIG51bUV2ZW50cyxcbiAgICAgIHRyYWNrLFxuICAgICAgZXZlbnRzXG5cbiAgICB0aGlzLnByZXZNYXh0aW1lID0gdGhpcy5tYXh0aW1lXG5cbiAgICBpZih0aGlzLnNvbmcucHJlY291bnRpbmcpe1xuICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyArPSBkaWZmXG4gICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgdGhpcy5idWZmZXJUaW1lXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMpXG4gICAgICBldmVudHMgPSB0aGlzLnNvbmcuX21ldHJvbm9tZS5nZXRQcmVjb3VudEV2ZW50cyh0aGlzLm1heHRpbWUpXG5cbiAgICAgIC8vIGlmKGV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAgIC8vICAgY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50cylcbiAgICAgIC8vIH1cblxuICAgICAgaWYodGhpcy5tYXh0aW1lID4gdGhpcy5zb25nLl9tZXRyb25vbWUuZW5kTWlsbGlzICYmIHRoaXMucHJlY291bnRpbmdEb25lID09PSBmYWxzZSl7XG4gICAgICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gdHJ1ZVxuICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX3ByZWNvdW50RHVyYXRpb25cblxuICAgICAgICAvLyBzdGFydCBzY2hlZHVsaW5nIGV2ZW50cyBvZiB0aGUgc29uZyAtPiBhZGQgdGhlIGZpcnN0IGV2ZW50cyBvZiB0aGUgc29uZ1xuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCB0aGlzLnNvbmdDdXJyZW50TWlsbGlzKVxuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIHRoaXMuYnVmZmVyVGltZVxuICAgICAgICBldmVudHMucHVzaCguLi50aGlzLmdldEV2ZW50cygpKVxuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIHRoaXMuYnVmZmVyVGltZVxuICAgICAgZXZlbnRzID0gdGhpcy5nZXRFdmVudHMoKVxuICAgICAgLy9ldmVudHMgPSB0aGlzLnNvbmcuX2dldEV2ZW50czIodGhpcy5tYXh0aW1lLCAodGhpcy50aW1lU3RhbXAgLSB0aGlzLnNvbmdTdGFydE1pbGxpcykpXG4gICAgICAvL2V2ZW50cyA9IHRoaXMuZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAgIC8vY29uc29sZS5sb2coJ2RvbmUnLCB0aGlzLnNvbmdDdXJyZW50TWlsbGlzLCBkaWZmLCB0aGlzLmluZGV4LCBldmVudHMubGVuZ3RoKVxuICAgIH1cblxuICAgIC8vIGlmKHRoaXMuc29uZy51c2VNZXRyb25vbWUgPT09IHRydWUpe1xuICAgIC8vICAgbGV0IG1ldHJvbm9tZUV2ZW50cyA9IHRoaXMuc29uZy5fbWV0cm9ub21lLmdldEV2ZW50czIodGhpcy5tYXh0aW1lLCAodGhpcy50aW1lU3RhbXAgLSB0aGlzLnNvbmdTdGFydE1pbGxpcykpXG4gICAgLy8gICAvLyBpZihtZXRyb25vbWVFdmVudHMubGVuZ3RoID4gMCl7XG4gICAgLy8gICAvLyAgIGNvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgbWV0cm9ub21lRXZlbnRzKVxuICAgIC8vICAgLy8gfVxuICAgIC8vICAgLy8gbWV0cm9ub21lRXZlbnRzLmZvckVhY2goZSA9PiB7XG4gICAgLy8gICAvLyAgIGUudGltZSA9ICh0aGlzLnRpbWVTdGFtcCArIGUubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gICAgLy8gICAvLyB9KVxuICAgIC8vICAgZXZlbnRzLnB1c2goLi4ubWV0cm9ub21lRXZlbnRzKVxuICAgIC8vIH1cblxuICAgIG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGhcblxuXG4gICAgLy8gaWYobnVtRXZlbnRzID4gNSl7XG4gICAgLy8gICBjb25zb2xlLmxvZyhudW1FdmVudHMpXG4gICAgLy8gfVxuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLm1heHRpbWUsIHRoaXMuc29uZy5fY3VycmVudE1pbGxpcywgJ1tkaWZmXScsIHRoaXMubWF4dGltZSAtIHRoaXMucHJldk1heHRpbWUpXG5cbiAgICBmb3IoaSA9IDA7IGkgPCBudW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IGV2ZW50c1tpXVxuICAgICAgdHJhY2sgPSBldmVudC5fdHJhY2tcbiAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5wcmV2TWF4dGltZSwgZXZlbnQubWlsbGlzKVxuXG4gICAgICAvLyBpZihldmVudC5taWxsaXMgPiB0aGlzLm1heHRpbWUpe1xuICAgICAgLy8gICAvLyBza2lwIGV2ZW50cyB0aGF0IHdlcmUgaGFydmVzdCBhY2NpZGVudGx5IHdoaWxlIGp1bXBpbmcgdGhlIHBsYXloZWFkIC0+IHNob3VsZCBoYXBwZW4gdmVyeSByYXJlbHkgaWYgZXZlclxuICAgICAgLy8gICBjb25zb2xlLmxvZygnc2tpcCcsIGV2ZW50KVxuICAgICAgLy8gICBjb250aW51ZVxuICAgICAgLy8gfVxuXG4gICAgICBpZihldmVudC5fcGFydCA9PT0gbnVsbCB8fCB0cmFjayA9PT0gbnVsbCl7XG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAgICAgICB0aGlzLm5vdGVzLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYoZXZlbnQuX3BhcnQubXV0ZWQgPT09IHRydWUgfHwgdHJhY2subXV0ZWQgPT09IHRydWUgfHwgZXZlbnQubXV0ZWQgPT09IHRydWUpe1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZigoZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkgJiYgdHlwZW9mIGV2ZW50Lm1pZGlOb3RlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vIHRoaXMgaXMgdXN1YWxseSBjYXVzZWQgYnkgdGhlIHNhbWUgbm90ZSBvbiB0aGUgc2FtZSB0aWNrcyB2YWx1ZSwgd2hpY2ggaXMgcHJvYmFibHkgYSBidWcgaW4gdGhlIG1pZGkgZmlsZVxuICAgICAgICAvL2NvbnNvbGUuaW5mbygnbm8gbWlkaU5vdGVJZCcsIGV2ZW50KVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgLy8gL2NvbnNvbGUubG9nKGV2ZW50LnRpY2tzLCBldmVudC50aW1lLCBldmVudC5taWxsaXMsIGV2ZW50LnR5cGUsIGV2ZW50Ll90cmFjay5uYW1lKVxuXG4gICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1lbHNle1xuICAgICAgICB0cmFjay5wcm9jZXNzTUlESUV2ZW50KGV2ZW50KVxuICAgICAgICAvL2NvbnNvbGUubG9nKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwLCBldmVudC50aW1lLCB0aGlzLmluZGV4KVxuICAgICAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgICAgIHRoaXMubm90ZXMuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYodGhpcy5ub3Rlcy5zaXplID4gMCl7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2codGhpcy5ub3RlcylcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuaW5kZXgsIHRoaXMubnVtRXZlbnRzKVxuICAgIC8vcmV0dXJuIHRoaXMuaW5kZXggPj0gMTBcbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLm51bUV2ZW50cyAvLyBsYXN0IGV2ZW50IG9mIHNvbmdcbiAgfVxuXG4vKlxuICB1bnNjaGVkdWxlKCl7XG5cbiAgICBsZXQgbWluID0gdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzXG4gICAgbGV0IG1heCA9IG1pbiArIChidWZmZXJUaW1lICogMTAwMClcblxuICAgIC8vY29uc29sZS5sb2coJ3Jlc2NoZWR1bGUnLCB0aGlzLm5vdGVzLnNpemUpXG4gICAgdGhpcy5ub3Rlcy5mb3JFYWNoKChub3RlLCBpZCkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2cobm90ZSlcbiAgICAgIC8vIGNvbnNvbGUubG9nKG5vdGUubm90ZU9uLm1pbGxpcywgbm90ZS5ub3RlT2ZmLm1pbGxpcywgbWluLCBtYXgpXG5cbiAgICAgIGlmKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJyB8fCBub3RlLnN0YXRlID09PSAncmVtb3ZlZCcpe1xuICAgICAgICAvL3NhbXBsZS51bnNjaGVkdWxlKDAsIHVuc2NoZWR1bGVDYWxsYmFjayk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ05PVEUgSVMgVU5ERUZJTkVEJylcbiAgICAgICAgLy9zYW1wbGUuc3RvcCgwKVxuICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShpZClcbiAgICAgIH1lbHNlIGlmKChub3RlLm5vdGVPbi5taWxsaXMgPj0gbWluIHx8IG5vdGUubm90ZU9mZi5taWxsaXMgPCBtYXgpID09PSBmYWxzZSl7XG4gICAgICAgIC8vc2FtcGxlLnN0b3AoMClcbiAgICAgICAgbGV0IG5vdGVPbiA9IG5vdGUubm90ZU9uXG4gICAgICAgIGxldCBub3RlT2ZmID0gbmV3IE1JRElFdmVudCgwLCAxMjgsIG5vdGVPbi5kYXRhMSwgMClcbiAgICAgICAgbm90ZU9mZi5taWRpTm90ZUlkID0gbm90ZS5pZFxuICAgICAgICBub3RlT2ZmLnRpbWUgPSAwLy9jb250ZXh0LmN1cnJlbnRUaW1lICsgbWluXG4gICAgICAgIG5vdGUuX3RyYWNrLnByb2Nlc3NNSURJRXZlbnQobm90ZU9mZilcbiAgICAgICAgdGhpcy5ub3Rlcy5kZWxldGUoaWQpXG4gICAgICAgIGNvbnNvbGUubG9nKCdTVE9QUElORycsIGlkLCBub3RlLl90cmFjay5uYW1lKVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZygnTk9URVMnLCB0aGlzLm5vdGVzLnNpemUpXG4gICAgLy90aGlzLm5vdGVzLmNsZWFyKClcbiAgfVxuKi9cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIGxldCB0aW1lU3RhbXAgPSBwZXJmb3JtYW5jZS5ub3coKVxuICAgIGxldCBvdXRwdXRzID0gZ2V0TUlESU91dHB1dHMoKVxuICAgIG91dHB1dHMuZm9yRWFjaCgob3V0cHV0KSA9PiB7XG4gICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWVTdGFtcCArIHRoaXMuYnVmZmVyVGltZSkgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZVN0YW1wICsgdGhpcy5idWZmZXJUaW1lKSAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgICB9KVxuICB9XG59XG5cblxuLypcblxuICBnZXRFdmVudHMyKG1heHRpbWUsIHRpbWVzdGFtcCl7XG4gICAgbGV0IGxvb3AgPSB0cnVlXG4gICAgbGV0IGV2ZW50XG4gICAgbGV0IHJlc3VsdCA9IFtdXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnRpbWVFdmVudHNJbmRleCwgdGhpcy5zb25nRXZlbnRzSW5kZXgsIHRoaXMubWV0cm9ub21lRXZlbnRzSW5kZXgpXG4gICAgd2hpbGUobG9vcCl7XG5cbiAgICAgIGxldCBzdG9wID0gZmFsc2VcblxuICAgICAgaWYodGhpcy50aW1lRXZlbnRzSW5kZXggPCB0aGlzLm51bVRpbWVFdmVudHMpe1xuICAgICAgICBldmVudCA9IHRoaXMudGltZUV2ZW50c1t0aGlzLnRpbWVFdmVudHNJbmRleF1cbiAgICAgICAgaWYoZXZlbnQubWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgdGhpcy5taWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGlja1xuICAgICAgICAgIC8vY29uc29sZS5sb2codGhpcy5taWxsaXNQZXJUaWNrKVxuICAgICAgICAgIHRoaXMudGltZUV2ZW50c0luZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3RvcCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZih0aGlzLnNvbmdFdmVudHNJbmRleCA8IHRoaXMubnVtU29uZ0V2ZW50cyl7XG4gICAgICAgIGV2ZW50ID0gdGhpcy5zb25nRXZlbnRzW3RoaXMuc29uZ0V2ZW50c0luZGV4XVxuICAgICAgICBpZihldmVudC50eXBlID09PSAweDJGKXtcbiAgICAgICAgICBsb29wID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGxldCBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGlja1xuICAgICAgICBpZihtaWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZXN0YW1wXG4gICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgICAgICAgdGhpcy5zb25nRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHRoaXMuc29uZy51c2VNZXRyb25vbWUgPT09IHRydWUgJiYgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleCA8IHRoaXMubnVtTWV0cm9ub21lRXZlbnRzKXtcbiAgICAgICAgZXZlbnQgPSB0aGlzLm1ldHJvbm9tZUV2ZW50c1t0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4XVxuICAgICAgICBsZXQgbWlsbGlzID0gZXZlbnQudGlja3MgKiB0aGlzLm1pbGxpc1BlclRpY2tcbiAgICAgICAgaWYobWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgZXZlbnQudGltZSA9IG1pbGxpcyArIHRpbWVzdGFtcFxuICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgICAgICAgIHRoaXMubWV0cm9ub21lRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHN0b3Ape1xuICAgICAgICBsb29wID0gZmFsc2VcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgc29ydEV2ZW50cyhyZXN1bHQpXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cblxuKi9cbiIsIi8vaW1wb3J0IGdtSW5zdHJ1bWVudHMgZnJvbSAnLi9nbV9pbnN0cnVtZW50cydcblxuLy9jb25zdCBwYXJhbXMgPSBbJ3BwcScsICdicG0nLCAnYmFycycsICdwaXRjaCcsICdidWZmZXJUaW1lJywgJ2xvd2VzdE5vdGUnLCAnaGlnaGVzdE5vdGUnLCAnbm90ZU5hbWVNb2RlJywgJ25vbWluYXRvcicsICdkZW5vbWluYXRvcicsICdxdWFudGl6ZVZhbHVlJywgJ2ZpeGVkTGVuZ3RoVmFsdWUnLCAncG9zaXRpb25UeXBlJywgJ3VzZU1ldHJvbm9tZScsICdhdXRvU2l6ZScsICdwbGF5YmFja1NwZWVkJywgJ2F1dG9RdWFudGl6ZScsIF1cblxubGV0IHNldHRpbmdzID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDE2LFxuICBwaXRjaDogNDQwLFxuICBidWZmZXJUaW1lOiAyMDAsXG4gIGxvd2VzdE5vdGU6IDAsXG4gIGhpZ2hlc3ROb3RlOiAxMjcsXG4gIG5vdGVOYW1lTW9kZTogJ3NoYXJwJyxcbiAgbm9taW5hdG9yOiA0LFxuICBkZW5vbWluYXRvcjogNCxcbiAgcXVhbnRpemVWYWx1ZTogOCxcbiAgZml4ZWRMZW5ndGhWYWx1ZTogZmFsc2UsXG4gIHBvc2l0aW9uVHlwZTogJ2FsbCcsXG4gIHVzZU1ldHJvbm9tZTogZmFsc2UsXG4gIGF1dG9TaXplOiB0cnVlLFxuICBwbGF5YmFja1NwZWVkOiAxLFxuICBhdXRvUXVhbnRpemU6IGZhbHNlLFxuICB2b2x1bWU6IDAuNSxcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2V0dGluZ3MoZGF0YSl7XG4gICh7XG4gICAgcHBxOiBzZXR0aW5ncy5wcHEgPSBzZXR0aW5ncy5wcHEsXG4gICAgYnBtOiBzZXR0aW5ncy5icG0gPSBzZXR0aW5ncy5icG0sXG4gICAgYmFyczogc2V0dGluZ3MuYmFycyA9IHNldHRpbmdzLmJhcnMsXG4gICAgcGl0Y2g6IHNldHRpbmdzLnBpdGNoID0gc2V0dGluZ3MucGl0Y2gsXG4gICAgYnVmZmVyVGltZTogc2V0dGluZ3MuYnVmZmVyVGltZSA9IHNldHRpbmdzLmJ1ZmZlclRpbWUsXG4gICAgbG93ZXN0Tm90ZTogc2V0dGluZ3MubG93ZXN0Tm90ZSA9IHNldHRpbmdzLmxvd2VzdE5vdGUsXG4gICAgaGlnaGVzdE5vdGU6IHNldHRpbmdzLmhpZ2hlc3ROb3RlID0gc2V0dGluZ3MuaGlnaGVzdE5vdGUsXG4gICAgbm90ZU5hbWVNb2RlOiBzZXR0aW5ncy5ub3RlTmFtZU1vZGUgPSBzZXR0aW5ncy5ub3RlTmFtZU1vZGUsXG4gICAgbm9taW5hdG9yOiBzZXR0aW5ncy5ub21pbmF0b3IgPSBzZXR0aW5ncy5ub21pbmF0b3IsXG4gICAgZGVub21pbmF0b3I6IHNldHRpbmdzLmRlbm9taW5hdG9yID0gc2V0dGluZ3MuZGVub21pbmF0b3IsXG4gICAgcXVhbnRpemVWYWx1ZTogc2V0dGluZ3MucXVhbnRpemVWYWx1ZSA9IHNldHRpbmdzLnF1YW50aXplVmFsdWUsXG4gICAgZml4ZWRMZW5ndGhWYWx1ZTogc2V0dGluZ3MuZml4ZWRMZW5ndGhWYWx1ZSA9IHNldHRpbmdzLmZpeGVkTGVuZ3RoVmFsdWUsXG4gICAgcG9zaXRpb25UeXBlOiBzZXR0aW5ncy5wb3NpdGlvblR5cGUgPSBzZXR0aW5ncy5wb3NpdGlvblR5cGUsXG4gICAgdXNlTWV0cm9ub21lOiBzZXR0aW5ncy51c2VNZXRyb25vbWUgPSBzZXR0aW5ncy51c2VNZXRyb25vbWUsXG4gICAgYXV0b1NpemU6IHNldHRpbmdzLmF1dG9TaXplID0gc2V0dGluZ3MuYXV0b1NpemUsXG4gICAgcGxheWJhY2tTcGVlZDogc2V0dGluZ3MucGxheWJhY2tTcGVlZCA9IHNldHRpbmdzLnBsYXliYWNrU3BlZWQsXG4gICAgYXV0b1F1YW50aXplOiBzZXR0aW5ncy5hdXRvUXVhbnRpemUgPSBzZXR0aW5ncy5hdXRvUXVhbnRpemUsXG4gICAgdm9sdW1lOiBzZXR0aW5ncy52b2x1bWUgPSBzZXR0aW5ncy52b2x1bWUsXG4gIH0gPSBkYXRhKVxuXG4gIGNvbnNvbGUubG9nKCdzZXR0aW5nczogJU8nLCBzZXR0aW5ncylcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2V0dGluZ3MoLi4ucGFyYW1zKXtcbiAgcmV0dXJuIHsuLi5zZXR0aW5nc31cbi8qXG4gIGxldCByZXN1bHQgPSB7fVxuICBwYXJhbXMuZm9yRWFjaChwYXJhbSA9PiB7XG4gICAgc3dpdGNoKHBhcmFtKXtcbiAgICAgIGNhc2UgJ3BpdGNoJzpcbiAgICAgICAgcmVzdWx0LnBpdGNoID0gcGl0Y2hcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ25vdGVOYW1lTW9kZSc6XG4gICAgICAgIHJlc3VsdC5ub3RlTmFtZU1vZGUgPSBub3RlTmFtZU1vZGVcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2J1ZmZlclRpbWUnOlxuICAgICAgICByZXN1bHQuYnVmZmVyVGltZSA9IGJ1ZmZlclRpbWVcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3BwcSc6XG4gICAgICAgIHJlc3VsdC5wcHEgPSBwcHFcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICB9XG4gIH0pXG4gIHJldHVybiByZXN1bHRcbiovXG59XG5cblxuLy9wb3J0ZWQgaGVhcnRiZWF0IGluc3RydW1lbnRzOiBodHRwOi8vZ2l0aHViLmNvbS9hYnVkYWFuL2hlYXJ0YmVhdFxuY29uc3QgaGVhcnRiZWF0SW5zdHJ1bWVudHMgPSBuZXcgTWFwKFtcbiAgWydjaXR5LXBpYW5vJywge1xuICAgIG5hbWU6ICdDaXR5IFBpYW5vIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyA0IHZlbG9jaXR5IGxheWVyczogMSAtIDQ4LCA0OSAtIDk2LCA5NyAtIDExMCBhbmQgMTEwIC0gMTI3LiBJbiB0b3RhbCBpdCB1c2VzIDQgKiA4OCA9IDM1MiBzYW1wbGVzJyxcbiAgfV0sXG4gIFsnY2l0eS1waWFuby1saWdodCcsIHtcbiAgICBuYW1lOiAnQ2l0eSBQaWFubyBMaWdodCAocGlhbm8pJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NpdHkgUGlhbm8gbGlnaHQgdXNlcyBzYW1wbGVzIGZyb20gYSBCYWxkd2luIHBpYW5vLCBpdCBoYXMgb25seSAxIHZlbG9jaXR5IGxheWVyIGFuZCB1c2VzIDg4IHNhbXBsZXMnLFxuICB9XSxcbiAgWydjay1pY2Vza2F0ZXMnLCB7XG4gICAgbmFtZTogJ0NLIEljZSBTa2F0ZXMgKHN5bnRoKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIERldHVuaXplZCBzYW1wbGVzJyxcbiAgfV0sXG4gIFsnc2hrMi1zcXVhcmVyb290Jywge1xuICAgIG5hbWU6ICdTSEsyIHNxdWFyZXJvb3QgKHN5bnRoKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIERldHVuaXplZCBzYW1wbGVzJyxcbiAgfV0sXG4gIFsncmhvZGVzJywge1xuICAgIG5hbWU6ICdSaG9kZXMgKHBpYW5vKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIEZyZWVzb3VuZCBzYW1wbGVzJyxcbiAgfV0sXG4gIFsncmhvZGVzMicsIHtcbiAgICBuYW1lOiAnUmhvZGVzIDIgKHBpYW5vKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIERldHVuaXplZCBzYW1wbGVzJyxcbiAgfV0sXG4gIFsndHJ1bXBldCcsIHtcbiAgICBuYW1lOiAnVHJ1bXBldCAoYnJhc3MpJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgU1NPIHNhbXBsZXMnLFxuICB9XSxcbiAgWyd2aW9saW4nLCB7XG4gICAgbmFtZTogJ1Zpb2xpbiAoc3RyaW5ncyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBTU08gc2FtcGxlcycsXG4gIH1dXG5dKVxuZXhwb3J0IGNvbnN0IGdldEluc3RydW1lbnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGhlYXJ0YmVhdEluc3RydW1lbnRzXG59XG5cbi8vIGdtIHNvdW5kcyBleHBvcnRlZCBmcm9tIEZsdWlkU3ludGggYnkgQmVuamFtaW4gR2xlaXR6bWFuOiBodHRwczovL2dpdGh1Yi5jb20vZ2xlaXR6L21pZGktanMtc291bmRmb250c1xuY29uc3QgZ21JbnN0cnVtZW50cyA9IHtcImFjb3VzdGljX2dyYW5kX3BpYW5vXCI6e1wibmFtZVwiOlwiMSBBY291c3RpYyBHcmFuZCBQaWFubyAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYnJpZ2h0X2Fjb3VzdGljX3BpYW5vXCI6e1wibmFtZVwiOlwiMiBCcmlnaHQgQWNvdXN0aWMgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX2dyYW5kX3BpYW5vXCI6e1wibmFtZVwiOlwiMyBFbGVjdHJpYyBHcmFuZCBQaWFubyAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiaG9ua3l0b25rX3BpYW5vXCI6e1wibmFtZVwiOlwiNCBIb25reS10b25rIFBpYW5vIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19waWFub18xXCI6e1wibmFtZVwiOlwiNSBFbGVjdHJpYyBQaWFubyAxIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19waWFub18yXCI6e1wibmFtZVwiOlwiNiBFbGVjdHJpYyBQaWFubyAyIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJoYXJwc2ljaG9yZFwiOntcIm5hbWVcIjpcIjcgSGFycHNpY2hvcmQgKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNsYXZpbmV0XCI6e1wibmFtZVwiOlwiOCBDbGF2aW5ldCAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2VsZXN0YVwiOntcIm5hbWVcIjpcIjkgQ2VsZXN0YSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJnbG9ja2Vuc3BpZWxcIjp7XCJuYW1lXCI6XCIxMCBHbG9ja2Vuc3BpZWwgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibXVzaWNfYm94XCI6e1wibmFtZVwiOlwiMTEgTXVzaWMgQm94IChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInZpYnJhcGhvbmVcIjp7XCJuYW1lXCI6XCIxMiBWaWJyYXBob25lIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm1hcmltYmFcIjp7XCJuYW1lXCI6XCIxMyBNYXJpbWJhIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInh5bG9waG9uZVwiOntcIm5hbWVcIjpcIjE0IFh5bG9waG9uZSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0dWJ1bGFyX2JlbGxzXCI6e1wibmFtZVwiOlwiMTUgVHVidWxhciBCZWxscyAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJkdWxjaW1lclwiOntcIm5hbWVcIjpcIjE2IER1bGNpbWVyIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImRyYXdiYXJfb3JnYW5cIjp7XCJuYW1lXCI6XCIxNyBEcmF3YmFyIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwZXJjdXNzaXZlX29yZ2FuXCI6e1wibmFtZVwiOlwiMTggUGVyY3Vzc2l2ZSBPcmdhbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicm9ja19vcmdhblwiOntcIm5hbWVcIjpcIjE5IFJvY2sgT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNodXJjaF9vcmdhblwiOntcIm5hbWVcIjpcIjIwIENodXJjaCBPcmdhbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicmVlZF9vcmdhblwiOntcIm5hbWVcIjpcIjIxIFJlZWQgT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFjY29yZGlvblwiOntcIm5hbWVcIjpcIjIyIEFjY29yZGlvbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiaGFybW9uaWNhXCI6e1wibmFtZVwiOlwiMjMgSGFybW9uaWNhIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0YW5nb19hY2NvcmRpb25cIjp7XCJuYW1lXCI6XCIyNCBUYW5nbyBBY2NvcmRpb24gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFjb3VzdGljX2d1aXRhcl9ueWxvblwiOntcIm5hbWVcIjpcIjI1IEFjb3VzdGljIEd1aXRhciAobnlsb24pIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWNvdXN0aWNfZ3VpdGFyX3N0ZWVsXCI6e1wibmFtZVwiOlwiMjYgQWNvdXN0aWMgR3VpdGFyIChzdGVlbCkgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ndWl0YXJfamF6elwiOntcIm5hbWVcIjpcIjI3IEVsZWN0cmljIEd1aXRhciAoamF6eikgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ndWl0YXJfY2xlYW5cIjp7XCJuYW1lXCI6XCIyOCBFbGVjdHJpYyBHdWl0YXIgKGNsZWFuKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX2d1aXRhcl9tdXRlZFwiOntcIm5hbWVcIjpcIjI5IEVsZWN0cmljIEd1aXRhciAobXV0ZWQpIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib3ZlcmRyaXZlbl9ndWl0YXJcIjp7XCJuYW1lXCI6XCIzMCBPdmVyZHJpdmVuIEd1aXRhciAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImRpc3RvcnRpb25fZ3VpdGFyXCI6e1wibmFtZVwiOlwiMzEgRGlzdG9ydGlvbiBHdWl0YXIgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJndWl0YXJfaGFybW9uaWNzXCI6e1wibmFtZVwiOlwiMzIgR3VpdGFyIEhhcm1vbmljcyAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFjb3VzdGljX2Jhc3NcIjp7XCJuYW1lXCI6XCIzMyBBY291c3RpYyBCYXNzIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX2Jhc3NfZmluZ2VyXCI6e1wibmFtZVwiOlwiMzQgRWxlY3RyaWMgQmFzcyAoZmluZ2VyKSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19iYXNzX3BpY2tcIjp7XCJuYW1lXCI6XCIzNSBFbGVjdHJpYyBCYXNzIChwaWNrKSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmcmV0bGVzc19iYXNzXCI6e1wibmFtZVwiOlwiMzYgRnJldGxlc3MgQmFzcyAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzbGFwX2Jhc3NfMVwiOntcIm5hbWVcIjpcIjM3IFNsYXAgQmFzcyAxIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNsYXBfYmFzc18yXCI6e1wibmFtZVwiOlwiMzggU2xhcCBCYXNzIDIgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfYmFzc18xXCI6e1wibmFtZVwiOlwiMzkgU3ludGggQmFzcyAxIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2Jhc3NfMlwiOntcIm5hbWVcIjpcIjQwIFN5bnRoIEJhc3MgMiAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2aW9saW5cIjp7XCJuYW1lXCI6XCI0MSBWaW9saW4gKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidmlvbGFcIjp7XCJuYW1lXCI6XCI0MiBWaW9sYSAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjZWxsb1wiOntcIm5hbWVcIjpcIjQzIENlbGxvIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNvbnRyYWJhc3NcIjp7XCJuYW1lXCI6XCI0NCBDb250cmFiYXNzIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRyZW1vbG9fc3RyaW5nc1wiOntcIm5hbWVcIjpcIjQ1IFRyZW1vbG8gU3RyaW5ncyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwaXp6aWNhdG9fc3RyaW5nc1wiOntcIm5hbWVcIjpcIjQ2IFBpenppY2F0byBTdHJpbmdzIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9yY2hlc3RyYWxfaGFycFwiOntcIm5hbWVcIjpcIjQ3IE9yY2hlc3RyYWwgSGFycCAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0aW1wYW5pXCI6e1wibmFtZVwiOlwiNDggVGltcGFuaSAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzdHJpbmdfZW5zZW1ibGVfMVwiOntcIm5hbWVcIjpcIjQ5IFN0cmluZyBFbnNlbWJsZSAxIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzdHJpbmdfZW5zZW1ibGVfMlwiOntcIm5hbWVcIjpcIjUwIFN0cmluZyBFbnNlbWJsZSAyIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9zdHJpbmdzXzFcIjp7XCJuYW1lXCI6XCI1MSBTeW50aCBTdHJpbmdzIDEgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX3N0cmluZ3NfMlwiOntcIm5hbWVcIjpcIjUyIFN5bnRoIFN0cmluZ3MgMiAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2hvaXJfYWFoc1wiOntcIm5hbWVcIjpcIjUzIENob2lyIEFhaHMgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInZvaWNlX29vaHNcIjp7XCJuYW1lXCI6XCI1NCBWb2ljZSBPb2hzIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9jaG9pclwiOntcIm5hbWVcIjpcIjU1IFN5bnRoIENob2lyIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJvcmNoZXN0cmFfaGl0XCI6e1wibmFtZVwiOlwiNTYgT3JjaGVzdHJhIEhpdCAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidHJ1bXBldFwiOntcIm5hbWVcIjpcIjU3IFRydW1wZXQgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRyb21ib25lXCI6e1wibmFtZVwiOlwiNTggVHJvbWJvbmUgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInR1YmFcIjp7XCJuYW1lXCI6XCI1OSBUdWJhIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJtdXRlZF90cnVtcGV0XCI6e1wibmFtZVwiOlwiNjAgTXV0ZWQgVHJ1bXBldCAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnJlbmNoX2hvcm5cIjp7XCJuYW1lXCI6XCI2MSBGcmVuY2ggSG9ybiAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYnJhc3Nfc2VjdGlvblwiOntcIm5hbWVcIjpcIjYyIEJyYXNzIFNlY3Rpb24gKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2JyYXNzXzFcIjp7XCJuYW1lXCI6XCI2MyBTeW50aCBCcmFzcyAxIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9icmFzc18yXCI6e1wibmFtZVwiOlwiNjQgU3ludGggQnJhc3MgMiAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic29wcmFub19zYXhcIjp7XCJuYW1lXCI6XCI2NSBTb3ByYW5vIFNheCAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhbHRvX3NheFwiOntcIm5hbWVcIjpcIjY2IEFsdG8gU2F4IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRlbm9yX3NheFwiOntcIm5hbWVcIjpcIjY3IFRlbm9yIFNheCAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiYXJpdG9uZV9zYXhcIjp7XCJuYW1lXCI6XCI2OCBCYXJpdG9uZSBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib2JvZVwiOntcIm5hbWVcIjpcIjY5IE9ib2UgKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZW5nbGlzaF9ob3JuXCI6e1wibmFtZVwiOlwiNzAgRW5nbGlzaCBIb3JuIChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJhc3Nvb25cIjp7XCJuYW1lXCI6XCI3MSBCYXNzb29uIChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNsYXJpbmV0XCI6e1wibmFtZVwiOlwiNzIgQ2xhcmluZXQgKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGljY29sb1wiOntcIm5hbWVcIjpcIjczIFBpY2NvbG8gKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZmx1dGVcIjp7XCJuYW1lXCI6XCI3NCBGbHV0ZSAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJyZWNvcmRlclwiOntcIm5hbWVcIjpcIjc1IFJlY29yZGVyIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhbl9mbHV0ZVwiOntcIm5hbWVcIjpcIjc2IFBhbiBGbHV0ZSAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJibG93bl9ib3R0bGVcIjp7XCJuYW1lXCI6XCI3NyBCbG93biBCb3R0bGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2hha3VoYWNoaVwiOntcIm5hbWVcIjpcIjc4IFNoYWt1aGFjaGkgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwid2hpc3RsZVwiOntcIm5hbWVcIjpcIjc5IFdoaXN0bGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib2NhcmluYVwiOntcIm5hbWVcIjpcIjgwIE9jYXJpbmEgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF8xX3NxdWFyZVwiOntcIm5hbWVcIjpcIjgxIExlYWQgMSAoc3F1YXJlKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfMl9zYXd0b290aFwiOntcIm5hbWVcIjpcIjgyIExlYWQgMiAoc2F3dG9vdGgpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF8zX2NhbGxpb3BlXCI6e1wibmFtZVwiOlwiODMgTGVhZCAzIChjYWxsaW9wZSkgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzRfY2hpZmZcIjp7XCJuYW1lXCI6XCI4NCBMZWFkIDQgKGNoaWZmKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfNV9jaGFyYW5nXCI6e1wibmFtZVwiOlwiODUgTGVhZCA1IChjaGFyYW5nKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfNl92b2ljZVwiOntcIm5hbWVcIjpcIjg2IExlYWQgNiAodm9pY2UpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF83X2ZpZnRoc1wiOntcIm5hbWVcIjpcIjg3IExlYWQgNyAoZmlmdGhzKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfOF9iYXNzX19sZWFkXCI6e1wibmFtZVwiOlwiODggTGVhZCA4IChiYXNzICsgbGVhZCkgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfMV9uZXdfYWdlXCI6e1wibmFtZVwiOlwiODkgUGFkIDEgKG5ldyBhZ2UpIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfMl93YXJtXCI6e1wibmFtZVwiOlwiOTAgUGFkIDIgKHdhcm0pIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfM19wb2x5c3ludGhcIjp7XCJuYW1lXCI6XCI5MSBQYWQgMyAocG9seXN5bnRoKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzRfY2hvaXJcIjp7XCJuYW1lXCI6XCI5MiBQYWQgNCAoY2hvaXIpIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfNV9ib3dlZFwiOntcIm5hbWVcIjpcIjkzIFBhZCA1IChib3dlZCkgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF82X21ldGFsbGljXCI6e1wibmFtZVwiOlwiOTQgUGFkIDYgKG1ldGFsbGljKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzdfaGFsb1wiOntcIm5hbWVcIjpcIjk1IFBhZCA3IChoYWxvKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzhfc3dlZXBcIjp7XCJuYW1lXCI6XCI5NiBQYWQgOCAoc3dlZXApIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF8xX3JhaW5cIjp7XCJuYW1lXCI6XCI5NyBGWCAxIChyYWluKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzJfc291bmR0cmFja1wiOntcIm5hbWVcIjpcIjk4IEZYIDIgKHNvdW5kdHJhY2spIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfM19jcnlzdGFsXCI6e1wibmFtZVwiOlwiOTkgRlggMyAoY3J5c3RhbCkgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF80X2F0bW9zcGhlcmVcIjp7XCJuYW1lXCI6XCIxMDAgRlggNCAoYXRtb3NwaGVyZSkgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF81X2JyaWdodG5lc3NcIjp7XCJuYW1lXCI6XCIxMDEgRlggNSAoYnJpZ2h0bmVzcykgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF82X2dvYmxpbnNcIjp7XCJuYW1lXCI6XCIxMDIgRlggNiAoZ29ibGlucykgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF83X2VjaG9lc1wiOntcIm5hbWVcIjpcIjEwMyBGWCA3IChlY2hvZXMpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfOF9zY2lmaVwiOntcIm5hbWVcIjpcIjEwNCBGWCA4IChzY2ktZmkpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2l0YXJcIjp7XCJuYW1lXCI6XCIxMDUgU2l0YXIgKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiYW5qb1wiOntcIm5hbWVcIjpcIjEwNiBCYW5qbyAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNoYW1pc2VuXCI6e1wibmFtZVwiOlwiMTA3IFNoYW1pc2VuIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwia290b1wiOntcIm5hbWVcIjpcIjEwOCBLb3RvIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwia2FsaW1iYVwiOntcIm5hbWVcIjpcIjEwOSBLYWxpbWJhIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFncGlwZVwiOntcIm5hbWVcIjpcIjExMCBCYWdwaXBlIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZmlkZGxlXCI6e1wibmFtZVwiOlwiMTExIEZpZGRsZSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNoYW5haVwiOntcIm5hbWVcIjpcIjExMiBTaGFuYWkgKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0aW5rbGVfYmVsbFwiOntcIm5hbWVcIjpcIjExMyBUaW5rbGUgQmVsbCAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhZ29nb1wiOntcIm5hbWVcIjpcIjExNCBBZ29nbyAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzdGVlbF9kcnVtc1wiOntcIm5hbWVcIjpcIjExNSBTdGVlbCBEcnVtcyAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ3b29kYmxvY2tcIjp7XCJuYW1lXCI6XCIxMTYgV29vZGJsb2NrIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRhaWtvX2RydW1cIjp7XCJuYW1lXCI6XCIxMTcgVGFpa28gRHJ1bSAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJtZWxvZGljX3RvbVwiOntcIm5hbWVcIjpcIjExOCBNZWxvZGljIFRvbSAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9kcnVtXCI6e1wibmFtZVwiOlwiMTE5IFN5bnRoIERydW0gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicmV2ZXJzZV9jeW1iYWxcIjp7XCJuYW1lXCI6XCIxMjAgUmV2ZXJzZSBDeW1iYWwgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJndWl0YXJfZnJldF9ub2lzZVwiOntcIm5hbWVcIjpcIjEyMSBHdWl0YXIgRnJldCBOb2lzZSAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJyZWF0aF9ub2lzZVwiOntcIm5hbWVcIjpcIjEyMiBCcmVhdGggTm9pc2UgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzZWFzaG9yZVwiOntcIm5hbWVcIjpcIjEyMyBTZWFzaG9yZSAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJpcmRfdHdlZXRcIjp7XCJuYW1lXCI6XCIxMjQgQmlyZCBUd2VldCAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRlbGVwaG9uZV9yaW5nXCI6e1wibmFtZVwiOlwiMTI1IFRlbGVwaG9uZSBSaW5nIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiaGVsaWNvcHRlclwiOntcIm5hbWVcIjpcIjEyNiBIZWxpY29wdGVyIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYXBwbGF1c2VcIjp7XCJuYW1lXCI6XCIxMjcgQXBwbGF1c2UgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJndW5zaG90XCI6e1wibmFtZVwiOlwiMTI4IEd1bnNob3QgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn19XG5sZXQgZ21NYXAgPSBuZXcgTWFwKClcbk9iamVjdC5rZXlzKGdtSW5zdHJ1bWVudHMpLmZvckVhY2goa2V5ID0+IHtcbiAgZ21NYXAuc2V0KGtleSwgZ21JbnN0cnVtZW50c1trZXldKVxufSlcbmV4cG9ydCBjb25zdCBnZXRHTUluc3RydW1lbnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGdtTWFwXG59XG5cbiIsImltcG9ydCB7SW5zdHJ1bWVudH0gZnJvbSAnLi9pbnN0cnVtZW50J1xuaW1wb3J0IHtTYW1wbGVPc2NpbGxhdG9yfSBmcm9tICcuL3NhbXBsZV9vc2NpbGxhdG9yJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFNpbXBsZVN5bnRoIGV4dGVuZHMgSW5zdHJ1bWVudHtcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyl7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5zYW1wbGVEYXRhID0ge1xuICAgICAgdHlwZSxcbiAgICAgIHJlbGVhc2VEdXJhdGlvbjogMC4yLFxuICAgICAgcmVsZWFzZUVudmVsb3BlOiAnZXF1YWwgcG93ZXInXG4gICAgfVxuICB9XG5cbiAgY3JlYXRlU2FtcGxlKGV2ZW50KXtcbiAgICByZXR1cm4gbmV3IFNhbXBsZU9zY2lsbGF0b3IodGhpcy5zYW1wbGVEYXRhLCBldmVudClcbiAgfVxuXG4gIC8vIHN0ZXJlbyBzcHJlYWRcbiAgc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKXtcbiAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICB9XG5cbiAgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcbiAgfVxuXG4gIC8qXG4gICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAqL1xuICBzZXRSZWxlYXNlKGR1cmF0aW9uOiBudW1iZXIsIGVudmVsb3BlKXtcbiAgICB0aGlzLnNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb25cbiAgICB0aGlzLnNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gZW52ZWxvcGVcbiAgfVxufVxuIiwiLy9AIGZsb3dcblxuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQge3BhcnNlRXZlbnRzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbmltcG9ydCB7Y29udGV4dCwgbWFzdGVyR2FpbiwgdW5sb2NrV2ViQXVkaW99IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi9zY2hlZHVsZXInXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtzb25nRnJvbU1JRElGaWxlLCBzb25nRnJvbU1JRElGaWxlU3luY30gZnJvbSAnLi9zb25nX2Zyb21fbWlkaWZpbGUnXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y2FsY3VsYXRlUG9zaXRpb259IGZyb20gJy4vcG9zaXRpb24nXG5pbXBvcnQge1BsYXloZWFkfSBmcm9tICcuL3BsYXloZWFkJ1xuaW1wb3J0IHtNZXRyb25vbWV9IGZyb20gJy4vbWV0cm9ub21lJ1xuaW1wb3J0IHthZGRFdmVudExpc3RlbmVyLCByZW1vdmVFdmVudExpc3RlbmVyLCBkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5pbXBvcnQge3NhdmVBc01JRElGaWxlfSBmcm9tICcuL3NhdmVfbWlkaWZpbGUnXG5pbXBvcnQge3VwZGF0ZSwgX3VwZGF0ZX0gZnJvbSAnLi9zb25nLnVwZGF0ZSdcbmltcG9ydCB7Z2V0U2V0dGluZ3N9IGZyb20gJy4vc2V0dGluZ3MnXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxubGV0IHJlY29yZGluZ0luZGV4ID0gMFxuXG5cbi8qXG50eXBlIHNvbmdTZXR0aW5ncyA9IHtcbiAgbmFtZTogc3RyaW5nLFxuICBwcHE6IG51bWJlcixcbiAgYnBtOiBudW1iZXIsXG4gIGJhcnM6IG51bWJlcixcbiAgbG93ZXN0Tm90ZTogbnVtYmVyLFxuICBoaWdoZXN0Tm90ZTogbnVtYmVyLFxuICBub21pbmF0b3I6IG51bWJlcixcbiAgZGVub21pbmF0b3I6IG51bWJlcixcbiAgcXVhbnRpemVWYWx1ZTogbnVtYmVyLFxuICBmaXhlZExlbmd0aFZhbHVlOiBudW1iZXIsXG4gIHBvc2l0aW9uVHlwZTogc3RyaW5nLFxuICB1c2VNZXRyb25vbWU6IGJvb2xlYW4sXG4gIGF1dG9TaXplOiBib29sZWFuLFxuICBsb29wOiBib29sZWFuLFxuICBwbGF5YmFja1NwZWVkOiBudW1iZXIsXG4gIGF1dG9RdWFudGl6ZTogYm9vbGVhbixcbiAgcGl0Y2g6IG51bWJlcixcbiAgYnVmZmVyVGltZTogbnVtYmVyLFxuICBub3RlTmFtZU1vZGU6IHN0cmluZ1xufVxuKi9cblxuLypcbiAgLy8gaW5pdGlhbGl6ZSBzb25nIHdpdGggdHJhY2tzIGFuZCBwYXJ0IHNvIHlvdSBkbyBub3QgaGF2ZSB0byBjcmVhdGUgdGhlbSBzZXBhcmF0ZWx5XG4gIHNldHVwOiB7XG4gICAgdGltZUV2ZW50czogW11cbiAgICB0cmFja3M6IFtcbiAgICAgIHBhcnRzIFtdXG4gICAgXVxuICB9XG4qL1xuXG5leHBvcnQgY2xhc3MgU29uZ3tcblxuICBzdGF0aWMgZnJvbU1JRElGaWxlKGRhdGEpe1xuICAgIHJldHVybiBzb25nRnJvbU1JRElGaWxlKGRhdGEpXG4gIH1cblxuICBzdGF0aWMgZnJvbU1JRElGaWxlU3luYyhkYXRhKXtcbiAgICByZXR1cm4gc29uZ0Zyb21NSURJRmlsZVN5bmMoZGF0YSlcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzOiB7fSA9IHt9KXtcblxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICBsZXQgZGVmYXVsdFNldHRpbmdzID0gZ2V0U2V0dGluZ3MoKTtcblxuICAgICh7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUgPSB0aGlzLmlkLFxuICAgICAgcHBxOiB0aGlzLnBwcSA9IGRlZmF1bHRTZXR0aW5ncy5wcHEsXG4gICAgICBicG06IHRoaXMuYnBtID0gZGVmYXVsdFNldHRpbmdzLmJwbSxcbiAgICAgIGJhcnM6IHRoaXMuYmFycyA9IGRlZmF1bHRTZXR0aW5ncy5iYXJzLFxuICAgICAgbm9taW5hdG9yOiB0aGlzLm5vbWluYXRvciA9IGRlZmF1bHRTZXR0aW5ncy5ub21pbmF0b3IsXG4gICAgICBkZW5vbWluYXRvcjogdGhpcy5kZW5vbWluYXRvciA9IGRlZmF1bHRTZXR0aW5ncy5kZW5vbWluYXRvcixcbiAgICAgIHF1YW50aXplVmFsdWU6IHRoaXMucXVhbnRpemVWYWx1ZSA9IGRlZmF1bHRTZXR0aW5ncy5xdWFudGl6ZVZhbHVlLFxuICAgICAgZml4ZWRMZW5ndGhWYWx1ZTogdGhpcy5maXhlZExlbmd0aFZhbHVlID0gZGVmYXVsdFNldHRpbmdzLmZpeGVkTGVuZ3RoVmFsdWUsXG4gICAgICB1c2VNZXRyb25vbWU6IHRoaXMudXNlTWV0cm9ub21lID0gZGVmYXVsdFNldHRpbmdzLnVzZU1ldHJvbm9tZSxcbiAgICAgIGF1dG9TaXplOiB0aGlzLmF1dG9TaXplID0gZGVmYXVsdFNldHRpbmdzLmF1dG9TaXplLFxuICAgICAgcGxheWJhY2tTcGVlZDogdGhpcy5wbGF5YmFja1NwZWVkID0gZGVmYXVsdFNldHRpbmdzLnBsYXliYWNrU3BlZWQsXG4gICAgICBhdXRvUXVhbnRpemU6IHRoaXMuYXV0b1F1YW50aXplID0gZGVmYXVsdFNldHRpbmdzLmF1dG9RdWFudGl6ZSxcbiAgICAgIHBpdGNoOiB0aGlzLnBpdGNoID0gZGVmYXVsdFNldHRpbmdzLnBpdGNoLFxuICAgICAgYnVmZmVyVGltZTogdGhpcy5idWZmZXJUaW1lID0gZGVmYXVsdFNldHRpbmdzLmJ1ZmZlclRpbWUsXG4gICAgICBub3RlTmFtZU1vZGU6IHRoaXMubm90ZU5hbWVNb2RlID0gZGVmYXVsdFNldHRpbmdzLm5vdGVOYW1lTW9kZSxcbiAgICAgIHZvbHVtZTogdGhpcy52b2x1bWUgPSBkZWZhdWx0U2V0dGluZ3Mudm9sdW1lLFxuICAgIH0gPSBzZXR0aW5ncyk7XG5cbiAgICB0aGlzLl90aW1lRXZlbnRzID0gW11cbiAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICAgIHRoaXMuX2xhc3RFdmVudCA9IG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuRU5EX09GX1RSQUNLKVxuXG4gICAgdGhpcy5fdHJhY2tzID0gW11cbiAgICB0aGlzLl90cmFja3NCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9wYXJ0cyA9IFtdXG4gICAgdGhpcy5fcGFydHNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX2FsbEV2ZW50cyA9IFtdIC8vIE1JREkgZXZlbnRzIGFuZCBtZXRyb25vbWUgZXZlbnRzXG5cbiAgICB0aGlzLl9ub3RlcyA9IFtdXG4gICAgdGhpcy5fbm90ZXNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9uZXdFdmVudHMgPSBbXVxuICAgIHRoaXMuX21vdmVkRXZlbnRzID0gW11cbiAgICB0aGlzLl9yZW1vdmVkRXZlbnRzID0gW11cbiAgICB0aGlzLl90cmFuc3Bvc2VkRXZlbnRzID0gW11cblxuICAgIHRoaXMuX25ld1BhcnRzID0gW11cbiAgICB0aGlzLl9jaGFuZ2VkUGFydHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdXG5cbiAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gMFxuICAgIHRoaXMuX3NjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIodGhpcylcbiAgICB0aGlzLl9wbGF5aGVhZCA9IG5ldyBQbGF5aGVhZCh0aGlzKVxuXG4gICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZVxuICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZVxuICAgIHRoaXMuc3RvcHBlZCA9IHRydWVcbiAgICB0aGlzLmxvb3BpbmcgPSBmYWxzZVxuXG4gICAgdGhpcy5fb3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLl9vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3QobWFzdGVyR2FpbilcblxuICAgIHRoaXMuX21ldHJvbm9tZSA9IG5ldyBNZXRyb25vbWUodGhpcylcbiAgICB0aGlzLl9tZXRyb25vbWVFdmVudHMgPSBbXVxuICAgIHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyA9IHRydWVcbiAgICB0aGlzLl9tZXRyb25vbWUubXV0ZSghdGhpcy51c2VNZXRyb25vbWUpXG5cbiAgICB0aGlzLl9sb29wID0gZmFsc2VcbiAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgIHRoaXMuX2lsbGVnYWxMb29wID0gZmFsc2VcbiAgICB0aGlzLl9sb29wRHVyYXRpb24gPSAwXG4gICAgdGhpcy5fcHJlY291bnRCYXJzID0gMFxuICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gMFxuXG4gICAgbGV0IHt0cmFja3MsIHRpbWVFdmVudHN9ID0gc2V0dGluZ3NcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrcywgdGltZUV2ZW50cylcbiAgICBpZih0eXBlb2YgdGltZUV2ZW50cyA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy5fdGltZUV2ZW50cyA9IFtcbiAgICAgICAgbmV3IE1JRElFdmVudCgwLCBNSURJRXZlbnRUeXBlcy5URU1QTywgdGhpcy5icG0pLFxuICAgICAgICBuZXcgTUlESUV2ZW50KDAsIE1JRElFdmVudFR5cGVzLlRJTUVfU0lHTkFUVVJFLCB0aGlzLm5vbWluYXRvciwgdGhpcy5kZW5vbWluYXRvciksXG4gICAgICBdXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmFkZFRpbWVFdmVudHMoLi4udGltZUV2ZW50cylcbiAgICB9XG5cbiAgICBpZih0eXBlb2YgdHJhY2tzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLmFkZFRyYWNrcyguLi50cmFja3MpXG4gICAgfVxuXG5cbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cblxuICBhZGRUaW1lRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgLy9AVE9ETzogZmlsdGVyIHRpbWUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2sgLT4gdXNlIHRoZSBsYXN0bHkgYWRkZWQgZXZlbnRzXG4gICAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUpe1xuICAgICAgICB0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlXG4gICAgICB9XG4gICAgICB0aGlzLl90aW1lRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgfSlcbiAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICB9XG5cbiAgYWRkVHJhY2tzKC4uLnRyYWNrcyl7XG4gICAgdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICB0cmFjay5fc29uZyA9IHRoaXNcbiAgICAgIHRyYWNrLmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgICAgdGhpcy5fdHJhY2tzLnB1c2godHJhY2spXG4gICAgICB0aGlzLl90cmFja3NCeUlkLnNldCh0cmFjay5pZCwgdHJhY2spXG4gICAgICB0aGlzLl9uZXdFdmVudHMucHVzaCguLi50cmFjay5fZXZlbnRzKVxuICAgICAgdGhpcy5fbmV3UGFydHMucHVzaCguLi50cmFjay5fcGFydHMpXG4gICAgfSlcbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIHVwZGF0ZS5jYWxsKHRoaXMpXG4gIH1cblxuICBwbGF5KHR5cGUsIC4uLmFyZ3MpOiB2b2lke1xuICAgIC8vdW5sb2NrV2ViQXVkaW8oKVxuICAgIHRoaXMuX3BsYXkodHlwZSwgLi4uYXJncylcbiAgICBpZih0aGlzLl9wcmVjb3VudEJhcnMgPiAwKXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwcmVjb3VudGluZycsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgIH1lbHNlIGlmKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID09PSB0cnVlKXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdGFydF9yZWNvcmRpbmcnLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzfSlcbiAgICB9ZWxzZXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgfVxuICB9XG5cbiAgX3BsYXkodHlwZSwgLi4uYXJncyl7XG4gICAgaWYodHlwZW9mIHR5cGUgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24odHlwZSwgLi4uYXJncylcbiAgICB9XG4gICAgaWYodGhpcy5wbGF5aW5nKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vY29uc29sZS5sb2codGhpcy5fY3VycmVudE1pbGxpcylcblxuICAgIHRoaXMuX3JlZmVyZW5jZSA9IHRoaXMuX3RpbWVTdGFtcCA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgdGhpcy5fc2NoZWR1bGVyLnNldFRpbWVTdGFtcCh0aGlzLl9yZWZlcmVuY2UpXG4gICAgdGhpcy5fc3RhcnRNaWxsaXMgPSB0aGlzLl9jdXJyZW50TWlsbGlzXG5cbiAgICBpZih0aGlzLl9wcmVjb3VudEJhcnMgPiAwICYmIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nKXtcblxuICAgICAgLy8gY3JlYXRlIHByZWNvdW50IGV2ZW50cywgdGhlIHBsYXloZWFkIHdpbGwgYmUgbW92ZWQgdG8gdGhlIGZpcnN0IGJlYXQgb2YgdGhlIGN1cnJlbnQgYmFyXG4gICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uKClcbiAgICAgIHRoaXMuX21ldHJvbm9tZS5jcmVhdGVQcmVjb3VudEV2ZW50cyhwb3NpdGlvbi5iYXIsIHBvc2l0aW9uLmJhciArIHRoaXMuX3ByZWNvdW50QmFycywgdGhpcy5fcmVmZXJlbmNlKVxuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKCdiYXJzYmVhdHMnLCBbcG9zaXRpb24uYmFyXSwgJ21pbGxpcycpLm1pbGxpc1xuICAgICAgdGhpcy5fcHJlY291bnREdXJhdGlvbiA9IHRoaXMuX21ldHJvbm9tZS5wcmVjb3VudER1cmF0aW9uXG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgKyB0aGlzLl9wcmVjb3VudER1cmF0aW9uXG5cbiAgICAgIC8vIGNvbnNvbGUuZ3JvdXAoJ3ByZWNvdW50JylcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdwb3NpdGlvbicsIHRoaXMuZ2V0UG9zaXRpb24oKSlcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdfY3VycmVudE1pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgICAvLyBjb25zb2xlLmxvZygnZW5kUHJlY291bnRNaWxsaXMnLCB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcylcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdfcHJlY291bnREdXJhdGlvbicsIHRoaXMuX3ByZWNvdW50RHVyYXRpb24pXG4gICAgICAvLyBjb25zb2xlLmdyb3VwRW5kKCdwcmVjb3VudCcpXG4gICAgICAvL2NvbnNvbGUubG9nKCdwcmVjb3VudER1cmF0aW9uJywgdGhpcy5fbWV0cm9ub21lLmNyZWF0ZVByZWNvdW50RXZlbnRzKHRoaXMuX3ByZWNvdW50QmFycywgdGhpcy5fcmVmZXJlbmNlKSlcbiAgICAgIHRoaXMucHJlY291bnRpbmcgPSB0cnVlXG4gICAgfWVsc2Uge1xuICAgICAgdGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPSAwXG4gICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlXG4gICAgICB0aGlzLnJlY29yZGluZyA9IHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nXG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fZW5kUHJlY291bnRNaWxsaXMpXG5cbiAgICBpZih0aGlzLnBhdXNlZCl7XG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgIHRoaXMuX3NjaGVkdWxlci5pbml0KHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgdGhpcy5fbG9vcCA9IHRoaXMubG9vcGluZyAmJiB0aGlzLl9jdXJyZW50TWlsbGlzIDw9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXNcbiAgICB0aGlzLl9wdWxzZSgpXG4gIH1cblxuICBfcHVsc2UoKTogdm9pZHtcbiAgICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlICYmIHRoaXMucHJlY291bnRpbmcgPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmKHRoaXMuX3BlcmZvcm1VcGRhdGUgPT09IHRydWUpe1xuICAgICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSA9IGZhbHNlXG4gICAgICAvL2NvbnNvbGUubG9nKCdwdWxzZSB1cGRhdGUnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgICAgX3VwZGF0ZS5jYWxsKHRoaXMpXG4gICAgfVxuXG4gICAgbGV0IG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgLy9jb25zb2xlLmxvZyhub3csIHBlcmZvcm1hbmNlLm5vdygpKVxuICAgIGxldCBkaWZmID0gbm93IC0gdGhpcy5fcmVmZXJlbmNlXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyArPSBkaWZmXG4gICAgdGhpcy5fcmVmZXJlbmNlID0gbm93XG5cbiAgICBpZih0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA+IDApe1xuICAgICAgaWYodGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPiB0aGlzLl9jdXJyZW50TWlsbGlzKXtcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZShkaWZmKVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcHVsc2UuYmluZCh0aGlzKSlcbiAgICAgICAgLy9yZXR1cm4gYmVjYXVzZSBkdXJpbmcgcHJlY291bnRpbmcgb25seSBwcmVjb3VudCBtZXRyb25vbWUgZXZlbnRzIGdldCBzY2hlZHVsZWRcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gMFxuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyAtPSB0aGlzLl9wcmVjb3VudER1cmF0aW9uXG4gICAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyl7XG4gICAgICAgIHRoaXMucGxheWluZyA9IHRydWVcbiAgICAgICAgdGhpcy5yZWNvcmRpbmcgPSB0cnVlXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZVxuICAgICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX3N0YXJ0TWlsbGlzfSlcbiAgICAgICAgLy9kaXNwYXRjaEV2ZW50KHt0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKHRoaXMuX2xvb3AgJiYgdGhpcy5fY3VycmVudE1pbGxpcyA+PSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzKXtcbiAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgLT0gdGhpcy5fbG9vcER1cmF0aW9uXG4gICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgICAvL3RoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzKSAvLyBwbGF5aGVhZCBpcyBhIGJpdCBhaGVhZCBvbmx5IGR1cmluZyB0aGlzIGZyYW1lXG4gICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgdHlwZTogJ2xvb3AnLFxuICAgICAgICBkYXRhOiBudWxsXG4gICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5fcGxheWhlYWQudXBkYXRlKCdtaWxsaXMnLCBkaWZmKVxuICAgIH1cblxuICAgIHRoaXMuX3RpY2tzID0gdGhpcy5fcGxheWhlYWQuZ2V0KCkudGlja3NcblxuICAgIC8vY29uc29sZS5sb2codGhpcy5fY3VycmVudE1pbGxpcywgdGhpcy5fZHVyYXRpb25NaWxsaXMpXG5cbiAgICBpZih0aGlzLl9jdXJyZW50TWlsbGlzID49IHRoaXMuX2R1cmF0aW9uTWlsbGlzKXtcbiAgICAgIGlmKHRoaXMucmVjb3JkaW5nICE9PSB0cnVlIHx8IHRoaXMuYXV0b1NpemUgIT09IHRydWUpe1xuICAgICAgICB0aGlzLnN0b3AoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIGFkZCBhbiBleHRyYSBiYXIgdG8gdGhlIHNpemUgb2YgdGhpcyBzb25nXG4gICAgICBsZXQgZXZlbnRzID0gdGhpcy5fbWV0cm9ub21lLmFkZEV2ZW50cyh0aGlzLmJhcnMsIHRoaXMuYmFycyArIDEpXG4gICAgICBsZXQgdG9iZVBhcnNlZCA9IFsuLi5ldmVudHMsIC4uLnRoaXMuX3RpbWVFdmVudHNdXG4gICAgICBzb3J0RXZlbnRzKHRvYmVQYXJzZWQpXG4gICAgICBwYXJzZUV2ZW50cyh0b2JlUGFyc2VkKVxuICAgICAgdGhpcy5fc2NoZWR1bGVyLmV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NjaGVkdWxlci5udW1FdmVudHMgKz0gZXZlbnRzLmxlbmd0aFxuICAgICAgbGV0IGxhc3RFdmVudCA9IGV2ZW50c1tldmVudHMubGVuZ3RoIC0gMV1cbiAgICAgIGxldCBleHRyYU1pbGxpcyA9IGxhc3RFdmVudC50aWNrc1BlckJhciAqIGxhc3RFdmVudC5taWxsaXNQZXJUaWNrXG4gICAgICB0aGlzLl9sYXN0RXZlbnQudGlja3MgKz0gbGFzdEV2ZW50LnRpY2tzUGVyQmFyXG4gICAgICB0aGlzLl9sYXN0RXZlbnQubWlsbGlzICs9IGV4dHJhTWlsbGlzXG4gICAgICB0aGlzLl9kdXJhdGlvbk1pbGxpcyArPSBleHRyYU1pbGxpc1xuICAgICAgdGhpcy5iYXJzKytcbiAgICAgIHRoaXMuX3Jlc2l6ZWQgPSB0cnVlXG4gICAgICAvL2NvbnNvbGUubG9nKCdsZW5ndGgnLCB0aGlzLl9sYXN0RXZlbnQudGlja3MsIHRoaXMuX2xhc3RFdmVudC5taWxsaXMsIHRoaXMuYmFycywgbGFzdEV2ZW50KVxuICAgIH1cblxuICAgIHRoaXMuX3NjaGVkdWxlci51cGRhdGUoZGlmZilcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9wdWxzZS5iaW5kKHRoaXMpKVxuICB9XG5cbiAgcGF1c2UoKTogdm9pZHtcbiAgICB0aGlzLnBhdXNlZCA9ICF0aGlzLnBhdXNlZFxuICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZVxuICAgIGlmKHRoaXMucGF1c2VkKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLmFsbE5vdGVzT2ZmKClcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwYXVzZScsIGRhdGE6IHRoaXMucGF1c2VkfSlcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMucGxheSgpXG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGF1c2UnLCBkYXRhOiB0aGlzLnBhdXNlZH0pXG4gICAgfVxuICB9XG5cbiAgc3RvcCgpOiB2b2lke1xuICAgIC8vY29uc29sZS5sb2coJ1NUT1AnKVxuICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZVxuICAgIHRoaXMuYWxsTm90ZXNPZmYoKVxuICAgIGlmKHRoaXMucGxheWluZyB8fCB0aGlzLnBhdXNlZCl7XG4gICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZVxuICAgIH1cbiAgICBpZih0aGlzLl9jdXJyZW50TWlsbGlzICE9PSAwKXtcbiAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSAwXG4gICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgICBpZih0aGlzLnJlY29yZGluZyl7XG4gICAgICAgIHRoaXMuc3RvcFJlY29yZGluZygpXG4gICAgICB9XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAnc3RvcCd9KVxuICAgIH1cbiAgfVxuXG4gIHN0YXJ0UmVjb3JkaW5nKCl7XG4gICAgaWYodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IHRydWUpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX3JlY29yZElkID0gYHJlY29yZGluZ18ke3JlY29yZGluZ0luZGV4Kyt9JHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2suX3N0YXJ0UmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPSB0cnVlXG4gIH1cblxuICBzdG9wUmVjb3JkaW5nKCl7XG4gICAgaWYodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5fc3RvcFJlY29yZGluZyh0aGlzLl9yZWNvcmRJZClcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IGZhbHNlXG4gICAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZVxuICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdG9wX3JlY29yZGluZyd9KVxuICB9XG5cbiAgdW5kb1JlY29yZGluZygpe1xuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIHRyYWNrLnVuZG9SZWNvcmRpbmcodGhpcy5fcmVjb3JkSWQpXG4gICAgfSlcbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cblxuICByZWRvUmVjb3JkaW5nKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2sucmVkb1JlY29yZGluZyh0aGlzLl9yZWNvcmRJZClcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHNldE1ldHJvbm9tZShmbGFnKXtcbiAgICBpZih0eXBlb2YgZmxhZyA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy51c2VNZXRyb25vbWUgPSAhdGhpcy51c2VNZXRyb25vbWVcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMudXNlTWV0cm9ub21lID0gZmxhZ1xuICAgIH1cbiAgICB0aGlzLl9tZXRyb25vbWUubXV0ZSghdGhpcy51c2VNZXRyb25vbWUpXG4gIH1cblxuICBjb25maWd1cmVNZXRyb25vbWUoY29uZmlnKXtcbiAgICB0aGlzLl9tZXRyb25vbWUuY29uZmlndXJlKGNvbmZpZylcbiAgfVxuXG4gIGNvbmZpZ3VyZShjb25maWcpe1xuXG4gICAgaWYodHlwZW9mIGNvbmZpZy5waXRjaCAhPT0gJ3VuZGVmaW5lZCcpe1xuXG4gICAgICBpZihjb25maWcucGl0Y2ggPT09IHRoaXMucGl0Y2gpe1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMucGl0Y2ggPSBjb25maWcucGl0Y2hcbiAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgZXZlbnQudXBkYXRlUGl0Y2godGhpcy5waXRjaClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGNvbmZpZy5wcHEgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGlmKGNvbmZpZy5wcHEgPT09IHRoaXMucHBxKXtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBsZXQgcHBxRmFjdG9yID0gY29uZmlnLnBwcSAvIHRoaXMucHBxXG4gICAgICB0aGlzLnBwcSA9IGNvbmZpZy5wcHFcbiAgICAgIHRoaXMuX2FsbEV2ZW50cy5mb3JFYWNoKGUgPT4ge1xuICAgICAgICBlLnRpY2tzID0gZXZlbnQudGlja3MgKiBwcHFGYWN0b3JcbiAgICAgIH0pXG4gICAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cblxuICAgIGlmKHR5cGVvZiBjb25maWcucGxheWJhY2tTcGVlZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgaWYoY29uZmlnLnBsYXliYWNrU3BlZWQgPT09IHRoaXMucGxheWJhY2tTcGVlZCl7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5wbGF5YmFja1NwZWVkID0gY29uZmlnLnBsYXliYWNrU3BlZWRcbiAgICB9XG4gIH1cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKCh0cmFjaykgPT4ge1xuICAgICAgdHJhY2suYWxsTm90ZXNPZmYoKVxuICAgIH0pXG5cbiAgICB0aGlzLl9zY2hlZHVsZXIuYWxsTm90ZXNPZmYoKVxuICAgIHRoaXMuX21ldHJvbm9tZS5hbGxOb3Rlc09mZigpXG4gIH1cbi8qXG4gIHBhbmljKCl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICAgIHRyYWNrLmRpc2Nvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgICAgfSlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl90cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHtcbiAgICAgICAgICB0cmFjay5jb25uZWN0KHRoaXMuX291dHB1dClcbiAgICAgICAgfSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9LCAxMDApXG4gICAgfSlcbiAgfVxuKi9cbiAgZ2V0VHJhY2tzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl90cmFja3NdXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuICBnZXRFdmVudHMoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c11cbiAgfVxuXG4gIGdldE5vdGVzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ub3Rlc11cbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKGFyZ3Mpe1xuICAgIHJldHVybiBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCBhcmdzKVxuICB9XG5cbiAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuICBzZXRQb3NpdGlvbih0eXBlLCAuLi5hcmdzKXtcblxuICAgIGxldCB3YXNQbGF5aW5nID0gdGhpcy5wbGF5aW5nXG4gICAgaWYodGhpcy5wbGF5aW5nKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLmFsbE5vdGVzT2ZmKClcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJylcbiAgICAvL2xldCBtaWxsaXMgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnbWlsbGlzJylcbiAgICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IHBvc2l0aW9uLm1pbGxpc1xuICAgIC8vY29uc29sZS5sb2codGhpcy5fY3VycmVudE1pbGxpcylcblxuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgIGRhdGE6IHBvc2l0aW9uXG4gICAgfSlcblxuICAgIGlmKHdhc1BsYXlpbmcpe1xuICAgICAgdGhpcy5fcGxheSgpXG4gICAgfWVsc2V7XG4gICAgICAvL0B0b2RvOiBnZXQgdGhpcyBpbmZvcm1hdGlvbiBmcm9tIGxldCAncG9zaXRpb24nIC0+IHdlIGhhdmUganVzdCBjYWxjdWxhdGVkIHRoZSBwb3NpdGlvblxuICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCdzZXRQb3NpdGlvbicsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gIH1cblxuICBnZXRQb3NpdGlvbigpe1xuICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKS5wb3NpdGlvblxuICB9XG5cbiAgZ2V0UGxheWhlYWQoKXtcbiAgICByZXR1cm4gdGhpcy5fcGxheWhlYWQuZ2V0KClcbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0TGVmdExvY2F0b3IodHlwZSwgLi4uYXJncyl7XG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJylcblxuICAgIGlmKHRoaXMuX2xlZnRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcG9zaXRpb24gZm9yIGxvY2F0b3InKVxuICAgICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0UmlnaHRMb2NhdG9yKHR5cGUsIC4uLmFyZ3Mpe1xuICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKVxuXG4gICAgaWYodGhpcy5fcmlnaHRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBwb3NpdGlvbiBmb3IgbG9jYXRvcicpXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICBzZXRMb29wKGZsYWcgPSBudWxsKXtcblxuICAgIHRoaXMubG9vcGluZyA9IGZsYWcgIT09IG51bGwgPyBmbGFnIDogIXRoaXMuX2xvb3BcblxuICAgIGlmKHRoaXMuX3JpZ2h0TG9jYXRvciA9PT0gZmFsc2UgfHwgdGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKXtcbiAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZVxuICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgICB0aGlzLmxvb3BpbmcgPSBmYWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gbG9jYXRvcnMgY2FuIG5vdCAoeWV0KSBiZSB1c2VkIHRvIGp1bXAgb3ZlciBhIHNlZ21lbnRcbiAgICBpZih0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzIDw9IHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcyl7XG4gICAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IHRydWVcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZVxuICAgICAgdGhpcy5sb29waW5nID0gZmFsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuX2xvb3BEdXJhdGlvbiA9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMgLSB0aGlzLl9sZWZ0TG9jYXRvci5taWxsaXNcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2xvb3AsIHRoaXMuX2xvb3BEdXJhdGlvbilcbiAgICB0aGlzLl9zY2hlZHVsZXIuYmV5b25kTG9vcCA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgPiB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgdGhpcy5fbG9vcCA9IHRoaXMubG9vcGluZyAmJiB0aGlzLl9jdXJyZW50TWlsbGlzIDw9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXNcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2xvb3AsIHRoaXMubG9vcGluZylcbiAgICByZXR1cm4gdGhpcy5sb29waW5nXG4gIH1cblxuICBzZXRQcmVjb3VudCh2YWx1ZSA9IDApe1xuICAgIHRoaXMuX3ByZWNvdW50QmFycyA9IHZhbHVlXG4gIH1cblxuICAvKlxuICAgIGhlbHBlciBtZXRob2Q6IGNvbnZlcnRzIHVzZXIgZnJpZW5kbHkgcG9zaXRpb24gZm9ybWF0IHRvIGludGVybmFsIGZvcm1hdFxuXG4gICAgcG9zaXRpb246XG4gICAgICAtICd0aWNrcycsIDk2MDAwXG4gICAgICAtICdtaWxsaXMnLCAxMjM0XG4gICAgICAtICdwZXJjZW50YWdlJywgNTVcbiAgICAgIC0gJ2JhcnNiZWF0cycsIDEsIDQsIDAsIDI1IC0+IGJhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXG4gICAgICAtICd0aW1lJywgMCwgMywgNDksIDU2NiAtPiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG5cbiAgKi9cbiAgX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsIHJlc3VsdFR5cGUpe1xuICAgIGxldCB0YXJnZXRcblxuICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBjYXNlICdwZXJjZW50YWdlJzpcbiAgICAgICAgLy90YXJnZXQgPSBhcmdzWzBdIHx8IDBcbiAgICAgICAgdGFyZ2V0ID0gYXJncyB8fCAwXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICAgIHRhcmdldCA9IGFyZ3NcbiAgICAgICAgYnJlYWtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5sb2coJ3Vuc3VwcG9ydGVkIHR5cGUnKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCB7XG4gICAgICB0eXBlLFxuICAgICAgdGFyZ2V0LFxuICAgICAgcmVzdWx0OiByZXN1bHRUeXBlLFxuICAgIH0pXG5cbiAgICByZXR1cm4gcG9zaXRpb25cbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spe1xuICAgIHJldHVybiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZClcbiAgfVxuXG4gIHNhdmVBc01JRElGaWxlKG5hbWUpe1xuICAgIHNhdmVBc01JRElGaWxlKHRoaXMsIG5hbWUpXG4gIH1cblxuICBzZXRWb2x1bWUodmFsdWUpe1xuICAgIGlmKHZhbHVlIDwgMCB8fCB2YWx1ZSA+IDEpe1xuICAgICAgY29uc29sZS5sb2coJ1Nvbmcuc2V0Vm9sdW1lKCkgYWNjZXB0cyBhIHZhbHVlIGJldHdlZW4gMCBhbmQgMSwgeW91IGVudGVyZWQ6JywgdmFsdWUpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy52b2x1bWUgPSB2YWx1ZVxuICB9XG5cbiAgZ2V0Vm9sdW1lKCl7XG4gICAgcmV0dXJuIHRoaXMudm9sdW1lXG4gIH1cblxuICBzZXRQYW5uaW5nKHZhbHVlKXtcbiAgICBpZih2YWx1ZSA8IC0xIHx8IHZhbHVlID4gMSl7XG4gICAgICBjb25zb2xlLmxvZygnU29uZy5zZXRQYW5uaW5nKCkgYWNjZXB0cyBhIHZhbHVlIGJldHdlZW4gLTEgKGZ1bGwgbGVmdCkgYW5kIDEgKGZ1bGwgcmlnaHQpLCB5b3UgZW50ZXJlZDonLCB2YWx1ZSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5zZXRQYW5uaW5nKHZhbHVlKVxuICAgIH0pXG4gICAgdGhpcy5fcGFubmVyVmFsdWUgPSB2YWx1ZVxuICB9XG59XG4iLCIvLyBjYWxsZWQgYnkgc29uZ1xuaW1wb3J0IHtwYXJzZVRpbWVFdmVudHMsIHBhcnNlRXZlbnRzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQge2NhbGN1bGF0ZVBvc2l0aW9ufSBmcm9tICcuL3Bvc2l0aW9uJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGUoKTp2b2lke1xuICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlKXtcbiAgICBfdXBkYXRlLmNhbGwodGhpcylcbiAgfWVsc2V7XG4gICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSA9IHRydWVcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX3VwZGF0ZSgpOnZvaWR7XG5cbiAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gZmFsc2VcbiAgICAmJiB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA9PT0gMFxuICAgICYmIHRoaXMuX25ld0V2ZW50cy5sZW5ndGggPT09IDBcbiAgICAmJiB0aGlzLl9tb3ZlZEV2ZW50cy5sZW5ndGggPT09IDBcbiAgICAmJiB0aGlzLl9uZXdQYXJ0cy5sZW5ndGggPT09IDBcbiAgICAmJiB0aGlzLl9yZW1vdmVkUGFydHMubGVuZ3RoID09PSAwXG4gICAgJiYgdGhpcy5fcmVzaXplZCA9PT0gZmFsc2VcbiAgKXtcbiAgICByZXR1cm5cbiAgfVxuICAvL2RlYnVnXG4gIC8vdGhpcy5pc1BsYXlpbmcgPSB0cnVlXG5cbiAgLy9jb25zb2xlLmdyb3VwQ29sbGFwc2VkKCd1cGRhdGUgc29uZycpXG4gIGNvbnNvbGUudGltZSgndXBkYXRpbmcgc29uZyB0b29rJylcblxuXG4vLyBUSU1FIEVWRU5UU1xuXG4gIC8vIGNoZWNrIGlmIHRpbWUgZXZlbnRzIGFyZSB1cGRhdGVkXG4gIGlmKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IHRydWUpe1xuICAgIC8vY29uc29sZS5sb2coJ3VwZGF0ZVRpbWVFdmVudHMnLCB0aGlzLl90aW1lRXZlbnRzLmxlbmd0aClcbiAgICBwYXJzZVRpbWVFdmVudHModGhpcywgdGhpcy5fdGltZUV2ZW50cywgdGhpcy5pc1BsYXlpbmcpXG4gICAgLy9jb25zb2xlLmxvZygndGltZSBldmVudHMgJU8nLCB0aGlzLl90aW1lRXZlbnRzKVxuICB9XG5cbiAgLy8gb25seSBwYXJzZSBuZXcgYW5kIG1vdmVkIGV2ZW50c1xuICBsZXQgdG9iZVBhcnNlZCA9IFtdXG5cbiAgLy8gYnV0IHBhcnNlIGFsbCBldmVudHMgaWYgdGhlIHRpbWUgZXZlbnRzIGhhdmUgYmVlbiB1cGRhdGVkXG4gIGlmKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IHRydWUpe1xuICAgIHRvYmVQYXJzZWQgPSBbLi4udGhpcy5fZXZlbnRzXVxuICB9XG5cblxuLy8gUEFSVFNcblxuICAvLyBmaWx0ZXIgcmVtb3ZlZCBwYXJ0c1xuICAvL2NvbnNvbGUubG9nKCdyZW1vdmVkIHBhcnRzICVPJywgdGhpcy5fcmVtb3ZlZFBhcnRzKVxuICB0aGlzLl9yZW1vdmVkUGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZClcbiAgfSlcblxuXG4gIC8vIGFkZCBuZXcgcGFydHNcbiAgLy9jb25zb2xlLmxvZygnbmV3IHBhcnRzICVPJywgdGhpcy5fbmV3UGFydHMpXG4gIHRoaXMuX25ld1BhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICBwYXJ0Ll9zb25nID0gdGhpc1xuICAgIHRoaXMuX3BhcnRzQnlJZC5zZXQocGFydC5pZCwgcGFydClcbiAgICBwYXJ0LnVwZGF0ZSgpXG4gIH0pXG5cblxuICAvLyB1cGRhdGUgY2hhbmdlZCBwYXJ0c1xuICAvL2NvbnNvbGUubG9nKCdjaGFuZ2VkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKVxuICB0aGlzLl9jaGFuZ2VkUGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgIHBhcnQudXBkYXRlKClcbiAgfSlcblxuXG4gIC8vIHJlbW92ZWQgcGFydHNcbiAgLy9jb25zb2xlLmxvZygncmVtb3ZlZCBwYXJ0cyAlTycsIHRoaXMuX2NoYW5nZWRQYXJ0cylcbiAgdGhpcy5fcmVtb3ZlZFBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICB0aGlzLl9wYXJ0c0J5SWQuZGVsZXRlKHBhcnQuaWQpXG4gIH0pXG5cbiAgaWYodGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA+IDApe1xuICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpXG4gIH1cblxuXG4vLyBFVkVOVFNcblxuICAvLyBmaWx0ZXIgcmVtb3ZlZCBldmVudHNcbiAgLy9jb25zb2xlLmxvZygncmVtb3ZlZCBldmVudHMgJU8nLCB0aGlzLl9yZW1vdmVkRXZlbnRzKVxuICB0aGlzLl9yZW1vdmVkRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgbGV0IHRyYWNrID0gZXZlbnQubWlkaU5vdGUuX3RyYWNrXG4gICAgLy8gdW5zY2hlZHVsZSBhbGwgcmVtb3ZlZCBldmVudHMgdGhhdCBhbHJlYWR5IGhhdmUgYmVlbiBzY2hlZHVsZWRcbiAgICBpZihldmVudC50aW1lID49IHRoaXMuX2N1cnJlbnRNaWxsaXMpe1xuICAgICAgdHJhY2sudW5zY2hlZHVsZShldmVudClcbiAgICB9XG4gICAgdGhpcy5fbm90ZXNCeUlkLmRlbGV0ZShldmVudC5taWRpTm90ZS5pZClcbiAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgfSlcblxuXG4gIC8vIGFkZCBuZXcgZXZlbnRzXG4gIC8vY29uc29sZS5sb2coJ25ldyBldmVudHMgJU8nLCB0aGlzLl9uZXdFdmVudHMpXG4gIHRoaXMuX25ld0V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgIHRoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudClcbiAgICB0aGlzLl9ldmVudHMucHVzaChldmVudClcbiAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpXG4gIH0pXG5cblxuICAvLyBtb3ZlZCBldmVudHMgbmVlZCB0byBiZSBwYXJzZWRcbiAgLy9jb25zb2xlLmxvZygnbW92ZWQgJU8nLCB0aGlzLl9tb3ZlZEV2ZW50cylcbiAgdGhpcy5fbW92ZWRFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAvLyBkb24ndCBhZGQgbW92ZWQgZXZlbnRzIGlmIHRoZSB0aW1lIGV2ZW50cyBoYXZlIGJlZW4gdXBkYXRlZCAtPiB0aGV5IGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIHRoZSB0b2JlUGFyc2VkIGFycmF5XG4gICAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gZmFsc2Upe1xuICAgICAgdG9iZVBhcnNlZC5wdXNoKGV2ZW50KVxuICAgIH1cbiAgfSlcblxuXG4gIC8vIHBhcnNlIGFsbCBuZXcgYW5kIG1vdmVkIGV2ZW50c1xuICBpZih0b2JlUGFyc2VkLmxlbmd0aCA+IDApe1xuICAgIC8vY29uc29sZS50aW1lKCdwYXJzZScpXG4gICAgLy9jb25zb2xlLmxvZygndG9iZVBhcnNlZCAlTycsIHRvYmVQYXJzZWQpXG4gICAgLy9jb25zb2xlLmxvZygncGFyc2VFdmVudHMnLCB0b2JlUGFyc2VkLmxlbmd0aClcblxuICAgIHRvYmVQYXJzZWQgPSBbLi4udG9iZVBhcnNlZCwgLi4udGhpcy5fdGltZUV2ZW50c11cbiAgICBwYXJzZUV2ZW50cyh0b2JlUGFyc2VkLCB0aGlzLmlzUGxheWluZylcblxuICAgIC8vIGFkZCBNSURJIG5vdGVzIHRvIHNvbmdcbiAgICB0b2JlUGFyc2VkLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5pZCwgZXZlbnQudHlwZSwgZXZlbnQubWlkaU5vdGUpXG4gICAgICBpZihldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5OT1RFX09OKXtcbiAgICAgICAgaWYoZXZlbnQubWlkaU5vdGUpe1xuICAgICAgICAgIHRoaXMuX25vdGVzQnlJZC5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkLCBldmVudC50eXBlKVxuICAgICAgICAgIC8vdGhpcy5fbm90ZXMucHVzaChldmVudC5taWRpTm90ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLnRpbWVFbmQoJ3BhcnNlJylcbiAgfVxuXG4gIGlmKHRvYmVQYXJzZWQubGVuZ3RoID4gMCB8fCB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA+IDApe1xuICAgIC8vY29uc29sZS50aW1lKCd0byBhcnJheScpXG4gICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgIHRoaXMuX25vdGVzID0gQXJyYXkuZnJvbSh0aGlzLl9ub3Rlc0J5SWQudmFsdWVzKCkpXG4gICAgLy9jb25zb2xlLnRpbWVFbmQoJ3RvIGFycmF5JylcbiAgfVxuXG5cbiAgLy9jb25zb2xlLnRpbWUoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuICBzb3J0RXZlbnRzKHRoaXMuX2V2ZW50cylcbiAgdGhpcy5fbm90ZXMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gYS5ub3RlT24udGlja3MgLSBiLm5vdGVPbi50aWNrc1xuICB9KVxuICAvL2NvbnNvbGUudGltZUVuZChgc29ydGluZyAke3RoaXMuX2V2ZW50cy5sZW5ndGh9IGV2ZW50c2ApXG5cbiAgLy9jb25zb2xlLmxvZygnbm90ZXMgJU8nLCB0aGlzLl9ub3RlcylcbiAgY29uc29sZS50aW1lRW5kKCd1cGRhdGluZyBzb25nIHRvb2snKVxuXG5cbi8vIFNPTkcgRFVSQVRJT05cblxuICAvLyBnZXQgdGhlIGxhc3QgZXZlbnQgb2YgdGhpcyBzb25nXG4gIGxldCBsYXN0RXZlbnQgPSB0aGlzLl9ldmVudHNbdGhpcy5fZXZlbnRzLmxlbmd0aCAtIDFdXG4gIGxldCBsYXN0VGltZUV2ZW50ID0gdGhpcy5fdGltZUV2ZW50c1t0aGlzLl90aW1lRXZlbnRzLmxlbmd0aCAtIDFdXG4gIC8vY29uc29sZS5sb2cobGFzdEV2ZW50LCBsYXN0VGltZUV2ZW50KVxuXG4gIC8vIGNoZWNrIGlmIHNvbmcgaGFzIGFscmVhZHkgYW55IGV2ZW50c1xuICBpZihsYXN0RXZlbnQgaW5zdGFuY2VvZiBNSURJRXZlbnQgPT09IGZhbHNlKXtcbiAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50XG4gIH1lbHNlIGlmKGxhc3RUaW1lRXZlbnQudGlja3MgPiBsYXN0RXZlbnQudGlja3Mpe1xuICAgIGxhc3RFdmVudCA9IGxhc3RUaW1lRXZlbnRcbiAgfVxuICAvL2NvbnNvbGUubG9nKGxhc3RFdmVudCwgdGhpcy5iYXJzKVxuXG4gIC8vIGdldCB0aGUgcG9zaXRpb24gZGF0YSBvZiB0aGUgZmlyc3QgYmVhdCBpbiB0aGUgYmFyIGFmdGVyIHRoZSBsYXN0IGJhclxuICB0aGlzLmJhcnMgPSBNYXRoLm1heChsYXN0RXZlbnQuYmFyLCB0aGlzLmJhcnMpXG4gIGxldCB0aWNrcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICB0YXJnZXQ6IFt0aGlzLmJhcnMgKyAxXSxcbiAgICByZXN1bHQ6ICd0aWNrcydcbiAgfSkudGlja3NcblxuICAvLyB3ZSB3YW50IHRvIHB1dCB0aGUgRU5EX09GX1RSQUNLIGV2ZW50IGF0IHRoZSB2ZXJ5IGxhc3QgdGljayBvZiB0aGUgbGFzdCBiYXIsIHNvIHdlIGNhbGN1bGF0ZSB0aGF0IHBvc2l0aW9uXG4gIGxldCBtaWxsaXMgPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCB7XG4gICAgdHlwZTogJ3RpY2tzJyxcbiAgICB0YXJnZXQ6IHRpY2tzIC0gMSxcbiAgICByZXN1bHQ6ICdtaWxsaXMnXG4gIH0pLm1pbGxpc1xuXG4gIHRoaXMuX2xhc3RFdmVudC50aWNrcyA9IHRpY2tzIC0gMVxuICB0aGlzLl9sYXN0RXZlbnQubWlsbGlzID0gbWlsbGlzXG5cbiAgLy9jb25zb2xlLmxvZygnbGVuZ3RoJywgdGhpcy5fbGFzdEV2ZW50LnRpY2tzLCB0aGlzLl9sYXN0RXZlbnQubWlsbGlzLCB0aGlzLmJhcnMpXG5cbiAgdGhpcy5fZHVyYXRpb25UaWNrcyA9IHRoaXMuX2xhc3RFdmVudC50aWNrc1xuICB0aGlzLl9kdXJhdGlvbk1pbGxpcyA9IHRoaXMuX2xhc3RFdmVudC5taWxsaXNcblxuXG4vLyBNRVRST05PTUVcblxuICAvLyBhZGQgbWV0cm9ub21lIGV2ZW50c1xuICBpZih0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgfHwgdGhpcy5fbWV0cm9ub21lLmJhcnMgIT09IHRoaXMuYmFycyB8fCB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSB0cnVlKXtcbiAgICB0aGlzLl9tZXRyb25vbWVFdmVudHMgPSBwYXJzZUV2ZW50cyhbLi4udGhpcy5fdGltZUV2ZW50cywgLi4udGhpcy5fbWV0cm9ub21lLmdldEV2ZW50cygpXSlcbiAgfVxuICB0aGlzLl9hbGxFdmVudHMgPSBbLi4udGhpcy5fbWV0cm9ub21lRXZlbnRzLCAuLi50aGlzLl9ldmVudHNdXG4gIHNvcnRFdmVudHModGhpcy5fYWxsRXZlbnRzKVxuICAvL2NvbnNvbGUubG9nKCdhbGwgZXZlbnRzICVPJywgdGhpcy5fYWxsRXZlbnRzKVxuXG4vKlxuICB0aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKClcbiAgdGhpcy5fYWxsRXZlbnRzID0gWy4uLnRoaXMuX2V2ZW50c11cbiAgc29ydEV2ZW50cyh0aGlzLl9hbGxFdmVudHMpXG4qL1xuXG4gIC8vY29uc29sZS5sb2coJ2N1cnJlbnQgbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgdGhpcy5fcGxheWhlYWQudXBkYXRlU29uZygpXG4gIHRoaXMuX3NjaGVkdWxlci51cGRhdGVTb25nKClcblxuICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlKXtcbiAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgZGF0YTogdGhpcy5fcGxheWhlYWQuZ2V0KCkucG9zaXRpb25cbiAgICB9KVxuICB9XG5cbiAgLy8gcmVzZXRcbiAgdGhpcy5fbmV3UGFydHMgPSBbXVxuICB0aGlzLl9yZW1vdmVkUGFydHMgPSBbXVxuICB0aGlzLl9uZXdFdmVudHMgPSBbXVxuICB0aGlzLl9tb3ZlZEV2ZW50cyA9IFtdXG4gIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXVxuICB0aGlzLl9yZXNpemVkID0gZmFsc2VcbiAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IGZhbHNlXG5cbiAgLy9jb25zb2xlLmdyb3VwRW5kKCd1cGRhdGUgc29uZycpXG59XG4iLCJpbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCB7cGFyc2VNSURJRmlsZX0gZnJvbSAnLi9taWRpZmlsZSdcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7VHJhY2t9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge1Nvbmd9IGZyb20gJy4vc29uZydcbmltcG9ydCB7YmFzZTY0VG9CaW5hcnl9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7c3RhdHVzLCBqc29uLCBhcnJheUJ1ZmZlcn0gZnJvbSAnLi9mZXRjaF9oZWxwZXJzJ1xuaW1wb3J0IHtnZXRTZXR0aW5nc30gZnJvbSAnLi9zZXR0aW5ncydcblxuXG5mdW5jdGlvbiB0b1NvbmcocGFyc2VkLCBzZXR0aW5ncyl7XG5cbiAgbGV0IHRyYWNrcyA9IHBhcnNlZC50cmFja3NcbiAgbGV0IHBwcSA9IHBhcnNlZC5oZWFkZXIudGlja3NQZXJCZWF0IC8vIHRoZSBQUFEgYXMgc2V0IGluIHRoZSBsb2FkZWQgTUlESSBmaWxlXG4gIGxldCBwcHFGYWN0b3IgPSAxXG5cbiAgLy8gY2hlY2sgaWYgd2UgbmVlZCB0byBvdmVycnVsZSB0aGUgUFBRIG9mcyB0aGUgbG9hZGVkIE1JREkgZmlsZVxuICBpZih0eXBlb2Ygc2V0dGluZ3Mub3ZlcnJ1bGVQUFEgPT09ICd1bmRlZmluZWQnIHx8IHNldHRpbmdzLm92ZXJydWxlUFBRID09PSB0cnVlKXtcbiAgICBsZXQgbmV3UFBRID0gZ2V0U2V0dGluZ3MoKS5wcHFcbiAgICBwcHFGYWN0b3IgPSBuZXdQUFEgLyBwcHFcbiAgICBwcHEgPSBuZXdQUFFcbiAgfVxuXG4gIGxldCB0aW1lRXZlbnRzID0gW11cbiAgbGV0IGJwbSA9IC0xXG4gIGxldCBub21pbmF0b3IgPSAtMVxuICBsZXQgZGVub21pbmF0b3IgPSAtMVxuICBsZXQgbmV3VHJhY2tzID0gW11cblxuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcy52YWx1ZXMoKSl7XG4gICAgbGV0IGxhc3RUaWNrcywgbGFzdFR5cGVcbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IHR5cGVcbiAgICBsZXQgY2hhbm5lbCA9IC0xXG4gICAgbGV0IHRyYWNrTmFtZVxuICAgIGxldCB0cmFja0luc3RydW1lbnROYW1lXG4gICAgbGV0IGV2ZW50cyA9IFtdO1xuXG4gICAgZm9yKGxldCBldmVudCBvZiB0cmFjayl7XG4gICAgICB0aWNrcyArPSAoZXZlbnQuZGVsdGFUaW1lICogcHBxRmFjdG9yKTtcblxuICAgICAgaWYoY2hhbm5lbCA9PT0gLTEgJiYgdHlwZW9mIGV2ZW50LmNoYW5uZWwgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY2hhbm5lbCA9IGV2ZW50LmNoYW5uZWw7XG4gICAgICB9XG4gICAgICB0eXBlID0gZXZlbnQuc3VidHlwZTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVsdGFUaW1lLCB0aWNrcywgdHlwZSk7XG5cbiAgICAgIHN3aXRjaChldmVudC5zdWJ0eXBlKXtcblxuICAgICAgICBjYXNlICd0cmFja05hbWUnOlxuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnaW5zdHJ1bWVudE5hbWUnOlxuICAgICAgICAgIGlmKGV2ZW50LnRleHQpe1xuICAgICAgICAgICAgdHJhY2tJbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg5MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPZmYnOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4ODAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSlcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdzZXRUZW1wbyc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGVtcG8gZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGxldCB0bXAgPSA2MDAwMDAwMCAvIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQ7XG5cbiAgICAgICAgICBpZih0aWNrcyA9PT0gbGFzdFRpY2tzICYmIHR5cGUgPT09IGxhc3RUeXBlKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKCd0ZW1wbyBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCB0bXApO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihicG0gPT09IC0xKXtcbiAgICAgICAgICAgIGJwbSA9IHRtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4NTEsIHRtcCkpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZVNpZ25hdHVyZSc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGlmKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpe1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCd0aW1lIHNpZ25hdHVyZSBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYobm9taW5hdG9yID09PSAtMSl7XG4gICAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5udW1lcmF0b3JcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3JcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4NTgsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpKVxuICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSAnY29udHJvbGxlcic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhCMCwgZXZlbnQuY29udHJvbGxlclR5cGUsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncHJvZ3JhbUNoYW5nZSc6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhDMCwgZXZlbnQucHJvZ3JhbU51bWJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3BpdGNoQmVuZCc6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhFMCwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vY29uc29sZS5sb2codHJhY2submFtZSwgZXZlbnQudHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGxhc3RUeXBlID0gdHlwZVxuICAgICAgbGFzdFRpY2tzID0gdGlja3NcbiAgICB9XG5cbiAgICBpZihldmVudHMubGVuZ3RoID4gMCl7XG4gICAgICAvL2NvbnNvbGUuY291bnQoZXZlbnRzLmxlbmd0aClcbiAgICAgIG5ld1RyYWNrcy5wdXNoKG5ldyBUcmFjayh7XG4gICAgICAgIG5hbWU6IHRyYWNrTmFtZSxcbiAgICAgICAgcGFydHM6IFtcbiAgICAgICAgICBuZXcgUGFydCh7XG4gICAgICAgICAgICBldmVudHM6IGV2ZW50c1xuICAgICAgICAgIH0pXG4gICAgICAgIF1cbiAgICAgIH0pKVxuICAgIH1cbiAgfVxuXG4gIGxldCBzb25nID0gbmV3IFNvbmcoe1xuICAgIHBwcSxcbiAgICBicG0sXG4gICAgbm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yLFxuICAgIHRyYWNrczogbmV3VHJhY2tzLFxuICAgIHRpbWVFdmVudHM6IHRpbWVFdmVudHNcbiAgfSlcbiAgLy9zb25nLnVwZGF0ZSgpXG4gIHJldHVybiBzb25nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlU3luYyhkYXRhLCBzZXR0aW5ncyA9IHt9KXtcbiAgbGV0IHNvbmcgPSBudWxsO1xuXG4gIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgIHNvbmcgPSB0b1NvbmcocGFyc2VNSURJRmlsZShidWZmZXIpLCBzZXR0aW5ncyk7XG4gIH1lbHNlIGlmKHR5cGVvZiBkYXRhLmhlYWRlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRhdGEudHJhY2tzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgLy8gYSBNSURJIGZpbGUgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIHBhcnNlZFxuICAgIHNvbmcgPSB0b1NvbmcoZGF0YSwgc2V0dGluZ3MpO1xuICB9ZWxzZXtcbiAgICAvLyBhIGJhc2U2NCBlbmNvZGVkIE1JREkgZmlsZVxuICAgIGRhdGEgPSBiYXNlNjRUb0JpbmFyeShkYXRhKTtcbiAgICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgc29uZyA9IHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlciksIHNldHRpbmdzKTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3dyb25nIGRhdGEnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc29uZ1xuICAvLyB7XG4gIC8vICAgcHBxID0gbmV3UFBRLFxuICAvLyAgIGJwbSA9IG5ld0JQTSxcbiAgLy8gICBwbGF5YmFja1NwZWVkID0gbmV3UGxheWJhY2tTcGVlZCxcbiAgLy8gfSA9IHNldHRpbmdzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbmdGcm9tTUlESUZpbGUodXJsLCBzZXR0aW5ncyA9IHt9KXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBmZXRjaCh1cmwsIHtcbiAgICAvLyAgIG1vZGU6ICduby1jb3JzJ1xuICAgIC8vIH0pXG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihhcnJheUJ1ZmZlcilcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJlc29sdmUoc29uZ0Zyb21NSURJRmlsZVN5bmMoZGF0YSwgc2V0dGluZ3MpKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cbiIsImltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7TUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuaW1wb3J0IHtnZXRNSURJSW5wdXRCeUlkLCBnZXRNSURJT3V0cHV0QnlJZH0gZnJvbSAnLi9pbml0X21pZGknXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9xYW1iaSdcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5jb25zdCB6ZXJvVmFsdWUgPSAwLjAwMDAwMDAwMDAwMDAwMDAxXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFRyYWNre1xuXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzID0ge30pe1xuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWA7XG5cbiAgICAoe1xuICAgICAgbmFtZTogdGhpcy5uYW1lID0gdGhpcy5pZCxcbiAgICAgIGNoYW5uZWw6IHRoaXMuY2hhbm5lbCA9IDAsXG4gICAgICBtdXRlZDogdGhpcy5tdXRlZCA9IGZhbHNlLFxuICAgICAgdm9sdW1lOiB0aGlzLnZvbHVtZSA9IDAuNSxcbiAgICB9ID0gc2V0dGluZ3MpO1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLm5hbWUsIHRoaXMuY2hhbm5lbCwgdGhpcy5tdXRlZCwgdGhpcy52b2x1bWUpXG5cbiAgICB0aGlzLl9wYW5uZXIgPSBjb250ZXh0LmNyZWF0ZVBhbm5lcigpXG4gICAgdGhpcy5fcGFubmVyLnBhbm5pbmdNb2RlbCA9ICdlcXVhbHBvd2VyJ1xuICAgIHRoaXMuX3Bhbm5lci5zZXRQb3NpdGlvbih6ZXJvVmFsdWUsIHplcm9WYWx1ZSwgemVyb1ZhbHVlKVxuICAgIHRoaXMuX291dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5fb3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuX3Bhbm5lci5jb25uZWN0KHRoaXMuX291dHB1dClcbiAgICAvL3RoaXMuX291dHB1dC5jb25uZWN0KHRoaXMuX3Bhbm5lcilcbiAgICB0aGlzLl9taWRpSW5wdXRzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fbWlkaU91dHB1dHMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9zb25nID0gbnVsbFxuICAgIHRoaXMuX3BhcnRzID0gW11cbiAgICB0aGlzLl9wYXJ0c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgdGhpcy5faW5zdHJ1bWVudCA9IG51bGxcbiAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fcmVjb3JkZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICB0aGlzLm1vbml0b3IgPSBmYWxzZVxuICAgIHRoaXMuX3NvbmdJbnB1dCA9IG51bGxcbiAgICB0aGlzLl9lZmZlY3RzID0gW11cblxuICAgIGxldCB7cGFydHMsIGluc3RydW1lbnR9ID0gc2V0dGluZ3NcbiAgICBpZih0eXBlb2YgcGFydHMgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuYWRkUGFydHMoLi4ucGFydHMpXG4gICAgfVxuICAgIGlmKHR5cGVvZiBpbnN0cnVtZW50ICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnNldEluc3RydW1lbnQoaW5zdHJ1bWVudClcbiAgICB9XG4gIH1cblxuICBzZXRJbnN0cnVtZW50KGluc3RydW1lbnQgPSBudWxsKXtcbiAgICBpZihpbnN0cnVtZW50ICE9PSBudWxsXG4gICAgICAvLyBjaGVjayBpZiB0aGUgbWFuZGF0b3J5IGZ1bmN0aW9ucyBvZiBhbiBpbnN0cnVtZW50IGFyZSBwcmVzZW50IChJbnRlcmZhY2UgSW5zdHJ1bWVudClcbiAgICAgICYmIHR5cGVvZiBpbnN0cnVtZW50LmNvbm5lY3QgPT09ICdmdW5jdGlvbidcbiAgICAgICYmIHR5cGVvZiBpbnN0cnVtZW50LmRpc2Nvbm5lY3QgPT09ICdmdW5jdGlvbidcbiAgICAgICYmIHR5cGVvZiBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQgPT09ICdmdW5jdGlvbidcbiAgICAgICYmIHR5cGVvZiBpbnN0cnVtZW50LmFsbE5vdGVzT2ZmID09PSAnZnVuY3Rpb24nXG4gICAgICAmJiB0eXBlb2YgaW5zdHJ1bWVudC51bnNjaGVkdWxlID09PSAnZnVuY3Rpb24nXG4gICAgKXtcbiAgICAgIHRoaXMucmVtb3ZlSW5zdHJ1bWVudCgpXG4gICAgICB0aGlzLl9pbnN0cnVtZW50ID0gaW5zdHJ1bWVudFxuICAgICAgdGhpcy5faW5zdHJ1bWVudC5jb25uZWN0KHRoaXMuX3Bhbm5lcilcbiAgICB9ZWxzZSBpZihpbnN0cnVtZW50ID09PSBudWxsKXtcbiAgICAgIC8vIGlmIHlvdSBwYXNzIG51bGwgYXMgYXJndW1lbnQgdGhlIGN1cnJlbnQgaW5zdHJ1bWVudCB3aWxsIGJlIHJlbW92ZWQsIHNhbWUgYXMgcmVtb3ZlSW5zdHJ1bWVudFxuICAgICAgdGhpcy5yZW1vdmVJbnN0cnVtZW50KClcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIGluc3RydW1lbnQsIGFuZCBpbnN0cnVtZW50IHNob3VsZCBoYXZlIHRoZSBtZXRob2RzIFwiY29ubmVjdFwiLCBcImRpc2Nvbm5lY3RcIiwgXCJwcm9jZXNzTUlESUV2ZW50XCIsIFwidW5zY2hlZHVsZVwiIGFuZCBcImFsbE5vdGVzT2ZmXCInKVxuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUluc3RydW1lbnQoKXtcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICAgICAgdGhpcy5faW5zdHJ1bWVudC5kaXNjb25uZWN0KClcbiAgICAgIHRoaXMuX2luc3RydW1lbnQgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgZ2V0SW5zdHJ1bWVudCgpe1xuICAgIHJldHVybiB0aGlzLl9pbnN0cnVtZW50XG4gIH1cblxuICBjb25uZWN0TUlESU91dHB1dHMoLi4ub3V0cHV0cyl7XG4gICAgLy9jb25zb2xlLmxvZyhvdXRwdXRzKVxuICAgIG91dHB1dHMuZm9yRWFjaChvdXRwdXQgPT4ge1xuICAgICAgaWYodHlwZW9mIG91dHB1dCA9PT0gJ3N0cmluZycpe1xuICAgICAgICBvdXRwdXQgPSBnZXRNSURJT3V0cHV0QnlJZChvdXRwdXQpXG4gICAgICB9XG4gICAgICBpZihvdXRwdXQgaW5zdGFuY2VvZiBNSURJT3V0cHV0KXtcbiAgICAgICAgdGhpcy5fbWlkaU91dHB1dHMuc2V0KG91dHB1dC5pZCwgb3V0cHV0KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpT3V0cHV0cylcbiAgfVxuXG4gIGRpc2Nvbm5lY3RNSURJT3V0cHV0cyguLi5vdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gICAgaWYob3V0cHV0cy5sZW5ndGggPT09IDApe1xuICAgICAgdGhpcy5fbWlkaU91dHB1dHMuY2xlYXIoKVxuICAgIH1cbiAgICBvdXRwdXRzLmZvckVhY2gocG9ydCA9PiB7XG4gICAgICBpZihwb3J0IGluc3RhbmNlb2YgTUlESU91dHB1dCl7XG4gICAgICAgIHBvcnQgPSBwb3J0LmlkXG4gICAgICB9XG4gICAgICBpZih0aGlzLl9taWRpT3V0cHV0cy5oYXMocG9ydCkpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdyZW1vdmluZycsIHRoaXMuX21pZGlPdXRwdXRzLmdldChwb3J0KS5uYW1lKVxuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5kZWxldGUocG9ydClcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vdGhpcy5fbWlkaU91dHB1dHMgPSB0aGlzLl9taWRpT3V0cHV0cy5maWx0ZXIoLi4ub3V0cHV0cylcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlPdXRwdXRzKVxuICB9XG5cbiAgY29ubmVjdE1JRElJbnB1dHMoLi4uaW5wdXRzKXtcbiAgICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgICBpZih0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaW5wdXQgPSBnZXRNSURJSW5wdXRCeUlkKGlucHV0KVxuICAgICAgfVxuICAgICAgaWYoaW5wdXQgaW5zdGFuY2VvZiBNSURJSW5wdXQpe1xuXG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuc2V0KGlucHV0LmlkLCBpbnB1dClcblxuICAgICAgICBpbnB1dC5vbm1pZGltZXNzYWdlID0gZSA9PiB7XG4gICAgICAgICAgaWYodGhpcy5tb25pdG9yID09PSB0cnVlKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coLi4uZS5kYXRhKVxuICAgICAgICAgICAgdGhpcy5fcHJlcHJvY2Vzc01JRElFdmVudChuZXcgTUlESUV2ZW50KHRoaXMuX3NvbmcuX3RpY2tzLCAuLi5lLmRhdGEpKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICB9XG5cbiAgLy8geW91IGNhbiBwYXNzIGJvdGggcG9ydCBhbmQgcG9ydCBpZHNcbiAgZGlzY29ubmVjdE1JRElJbnB1dHMoLi4uaW5wdXRzKXtcbiAgICBpZihpbnB1dHMubGVuZ3RoID09PSAwKXtcbiAgICAgIHRoaXMuX21pZGlJbnB1dHMuZm9yRWFjaChwb3J0ID0+IHtcbiAgICAgICAgcG9ydC5vbm1pZGltZXNzYWdlID0gbnVsbFxuICAgICAgfSlcbiAgICAgIHRoaXMuX21pZGlJbnB1dHMuY2xlYXIoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlucHV0cy5mb3JFYWNoKHBvcnQgPT4ge1xuICAgICAgaWYocG9ydCBpbnN0YW5jZW9mIE1JRElJbnB1dCl7XG4gICAgICAgIHBvcnQgPSBwb3J0LmlkXG4gICAgICB9XG4gICAgICBpZih0aGlzLl9taWRpSW5wdXRzLmhhcyhwb3J0KSl7XG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuZ2V0KHBvcnQpLm9ubWlkaW1lc3NhZ2UgPSBudWxsXG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuZGVsZXRlKHBvcnQpXG4gICAgICB9XG4gICAgfSlcbiAgICAvL3RoaXMuX21pZGlPdXRwdXRzID0gdGhpcy5fbWlkaU91dHB1dHMuZmlsdGVyKC4uLm91dHB1dHMpXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICB9XG5cbiAgZ2V0TUlESUlucHV0cygpe1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX21pZGlJbnB1dHMudmFsdWVzKCkpXG4gIH1cblxuICBnZXRNSURJT3V0cHV0cygpe1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKVxuICB9XG5cbiAgc2V0UmVjb3JkRW5hYmxlZCh0eXBlKXsgLy8gJ21pZGknLCAnYXVkaW8nLCBlbXB0eSBvciBhbnl0aGluZyB3aWxsIGRpc2FibGUgcmVjb3JkaW5nXG4gICAgdGhpcy5fcmVjb3JkRW5hYmxlZCA9IHR5cGVcbiAgfVxuXG4gIF9zdGFydFJlY29yZGluZyhyZWNvcmRJZCl7XG4gICAgaWYodGhpcy5fcmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKXtcbiAgICAgIC8vY29uc29sZS5sb2cocmVjb3JkSWQpXG4gICAgICB0aGlzLl9yZWNvcmRJZCA9IHJlY29yZElkXG4gICAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdXG4gICAgICB0aGlzLl9yZWNvcmRQYXJ0ID0gbmV3IFBhcnQodGhpcy5fcmVjb3JkSWQpXG4gICAgfVxuICB9XG5cbiAgX3N0b3BSZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYodGhpcy5fcmVjb3JkZWRFdmVudHMubGVuZ3RoID09PSAwKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl9yZWNvcmRQYXJ0LmFkZEV2ZW50cyguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgICAvL3RoaXMuX3NvbmcuX25ld0V2ZW50cy5wdXNoKC4uLnRoaXMuX3JlY29yZGVkRXZlbnRzKVxuICAgIHRoaXMuYWRkUGFydHModGhpcy5fcmVjb3JkUGFydClcbiAgfVxuXG4gIHVuZG9SZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5yZW1vdmVQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KVxuICAgIC8vdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX3JlY29yZGVkRXZlbnRzKVxuICB9XG5cbiAgcmVkb1JlY29yZGluZyhyZWNvcmRJZCl7XG4gICAgaWYodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmFkZFBhcnRzKHRoaXMuX3JlY29yZFBhcnQpXG4gIH1cblxuICBjb3B5KCl7XG4gICAgbGV0IHQgPSBuZXcgVHJhY2sodGhpcy5uYW1lICsgJ19jb3B5JykgLy8gaW1wbGVtZW50IGdldE5hbWVPZkNvcHkoKSBpbiB1dGlsIChzZWUgaGVhcnRiZWF0KVxuICAgIGxldCBwYXJ0cyA9IFtdXG4gICAgdGhpcy5fcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIGxldCBjb3B5ID0gcGFydC5jb3B5KClcbiAgICAgIGNvbnNvbGUubG9nKGNvcHkpXG4gICAgICBwYXJ0cy5wdXNoKGNvcHkpXG4gICAgfSlcbiAgICB0LmFkZFBhcnRzKC4uLnBhcnRzKVxuICAgIHQudXBkYXRlKClcbiAgICByZXR1cm4gdFxuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnRyYW5zcG9zZShhbW91bnQpXG4gICAgfSlcbiAgfVxuXG4gIGFkZFBhcnRzKC4uLnBhcnRzKXtcbiAgICBsZXQgc29uZyA9IHRoaXMuX3NvbmdcblxuICAgIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcblxuICAgICAgcGFydC5fdHJhY2sgPSB0aGlzXG4gICAgICB0aGlzLl9wYXJ0cy5wdXNoKHBhcnQpXG4gICAgICB0aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpXG5cbiAgICAgIGxldCBldmVudHMgPSBwYXJ0Ll9ldmVudHNcbiAgICAgIHRoaXMuX2V2ZW50cy5wdXNoKC4uLmV2ZW50cylcblxuICAgICAgaWYoc29uZyl7XG4gICAgICAgIHBhcnQuX3NvbmcgPSBzb25nXG4gICAgICAgIHNvbmcuX25ld1BhcnRzLnB1c2gocGFydClcbiAgICAgICAgc29uZy5fbmV3RXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdGhpc1xuICAgICAgICBpZihzb25nKXtcbiAgICAgICAgICBldmVudC5fc29uZyA9IHNvbmdcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICByZW1vdmVQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG5cbiAgICBwYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0Ll90cmFjayA9IG51bGxcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCwgcGFydClcblxuICAgICAgbGV0IGV2ZW50cyA9IHBhcnQuX2V2ZW50c1xuXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgc29uZy5fcmVtb3ZlZFBhcnRzLnB1c2gocGFydClcbiAgICAgICAgc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIH1cblxuICAgICAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgICBldmVudC5fdHJhY2sgPSBudWxsXG4gICAgICAgIGlmKHNvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkLCBldmVudClcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZVxuICB9XG5cbiAgZ2V0UGFydHMoKXtcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSl7XG4gICAgICB0aGlzLl9wYXJ0cyA9IEFycmF5LmZyb20odGhpcy5fcGFydHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX3BhcnRzXVxuICB9XG5cblxuICB0cmFuc3Bvc2VQYXJ0cyhhbW91bnQ6IG51bWJlciwgLi4ucGFydHMpe1xuICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBwYXJ0LnRyYW5zcG9zZShhbW91bnQpXG4gICAgfSlcbiAgfVxuXG4gIG1vdmVQYXJ0cyh0aWNrczogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQubW92ZSh0aWNrcylcbiAgICB9KVxuICB9XG5cbiAgbW92ZVBhcnRzVG8odGlja3M6IG51bWJlciwgLi4ucGFydHMpe1xuICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBwYXJ0Lm1vdmVUbyh0aWNrcylcbiAgICB9KVxuICB9XG4vKlxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0KClcbiAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgdGhpcy5hZGRQYXJ0cyhwKVxuICB9XG4qL1xuICByZW1vdmVFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcGFydHMgPSBuZXcgU2V0KClcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIHBhcnRzLnNldChldmVudC5fcGFydClcbiAgICAgIGV2ZW50Ll9wYXJ0ID0gbnVsbFxuICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbFxuICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHModGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBsZXQgcGFydHMgPSBuZXcgU2V0KClcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCguLi5BcnJheS5mcm9tKHBhcnRzLmVudHJpZXMoKSkpXG4gICAgfVxuICB9XG5cbiAgbW92ZUV2ZW50c1RvKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlVG8odGlja3MpXG4gICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCguLi5BcnJheS5mcm9tKHBhcnRzLmVudHJpZXMoKSkpXG4gICAgfVxuICB9XG5cbiAgZ2V0RXZlbnRzKGZpbHRlcjogc3RyaW5nW10gPSBudWxsKXsgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c10gLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgfVxuXG4gIG11dGUoZmxhZzogYm9vbGVhbiA9IG51bGwpe1xuICAgIGlmKGZsYWcpe1xuICAgICAgdGhpcy5fbXV0ZWQgPSBmbGFnXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9tdXRlZCA9ICF0aGlzLl9tdXRlZFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpeyAvLyB5b3Ugc2hvdWxkIG9ubHkgdXNlIHRoaXMgaW4gaHVnZSBzb25ncyAoPjEwMCB0cmFja3MpXG4gICAgaWYodGhpcy5fY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB9XG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICB9XG5cbiAgLypcbiAgICByb3V0aW5nOiBzYW1wbGUgc291cmNlIC0+IHBhbm5lciAtPiBnYWluIC0+IFsuLi5meF0gLT4gc29uZyBvdXRwdXRcbiAgICBAVE9ETzogbmVlZHMgc29tZSByZXRoaW5raW5nIVxuICAqL1xuICBjb25uZWN0KHNvbmdPdXRwdXQpe1xuICAgIHRoaXMuX3NvbmdPdXRwdXQgPSBzb25nT3V0cHV0XG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3QodGhpcy5fc29uZ091dHB1dClcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKXtcbiAgICB0aGlzLl9vdXRwdXQuZGlzY29ubmVjdCh0aGlzLl9zb25nT3V0cHV0KVxuICAgIHRoaXMuX3NvbmdPdXRwdXQgPSBudWxsXG4gIH1cblxuICBfY2hlY2tFZmZlY3QoZWZmZWN0KXtcbiAgICBpZih0eXBlb2YgZWZmZWN0LnNldElucHV0ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlZmZlY3Quc2V0T3V0cHV0ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlZmZlY3QuZ2V0T3V0cHV0ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlZmZlY3QuZGlzY29ubmVjdCAhPT0gJ2Z1bmN0aW9uJyl7XG4gICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBjaGFubmVsIGZ4LCBhbmQgY2hhbm5lbCBmeCBzaG91bGQgaGF2ZSB0aGUgbWV0aG9kcyBcInNldElucHV0XCIsIFwic2V0T3V0cHV0XCIsIFwiZ2V0T3V0cHV0XCIgYW5kIFwiZGlzY29ubmVjdFwiJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgYWRkRWZmZWN0KGVmZmVjdCl7XG4gICAgaWYodGhpcy5fY2hlY2tFZmZlY3QoZWZmZWN0KSA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBudW1GWCA9IHRoaXMuX2VmZmVjdHMubGVuZ3RoXG4gICAgbGV0IGxhc3RGWFxuICAgIGxldCBvdXRwdXRcbiAgICBpZihudW1GWCA9PT0gMCl7XG4gICAgICBsYXN0RlggPSB0aGlzLl9vdXRwdXRcbiAgICAgIGxhc3RGWC5kaXNjb25uZWN0KHRoaXMuX3NvbmdPdXRwdXQpXG4gICAgICBvdXRwdXQgPSB0aGlzLl9vdXRwdXRcbiAgICB9ZWxzZXtcbiAgICAgIGxhc3RGWCA9IHRoaXMuX2VmZmVjdHNbbnVtRlggLSAxXVxuICAgICAgbGFzdEZYLmRpc2Nvbm5lY3QoKVxuICAgICAgb3V0cHV0ID0gbGFzdEZYLmdldE91dHB1dCgpXG4gICAgfVxuXG4gICAgZWZmZWN0LnNldElucHV0KG91dHB1dClcbiAgICBlZmZlY3Quc2V0T3V0cHV0KHRoaXMuX3NvbmdPdXRwdXQpXG5cbiAgICB0aGlzLl9lZmZlY3RzLnB1c2goZWZmZWN0KVxuICB9XG5cbiAgYWRkRWZmZWN0QXQoZWZmZWN0LCBpbmRleDogbnVtYmVyKXtcbiAgICBpZih0aGlzLl9jaGVja0VmZmVjdChlZmZlY3QpID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fZWZmZWN0cy5zcGxpY2UoaW5kZXgsIDAsIGVmZmVjdClcbiAgfVxuXG4gIHJlbW92ZUVmZmVjdChpbmRleDogbnVtYmVyKXtcbiAgICBpZihpc05hTihpbmRleCkpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VmZmVjdHMuZm9yRWFjaChmeCA9PiB7XG4gICAgICBmeC5kaXNjb25uZWN0KClcbiAgICB9KVxuICAgIHRoaXMuX2VmZmVjdHMuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgbGV0IG51bUZYID0gdGhpcy5fZWZmZWN0cy5sZW5ndGhcblxuICAgIGlmKG51bUZYID09PSAwKXtcbiAgICAgIHRoaXMuX291dHB1dC5jb25uZWN0KHRoaXMuX3NvbmdPdXRwdXQpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgbGFzdEZYID0gdGhpcy5fb3V0cHV0XG4gICAgdGhpcy5fZWZmZWN0cy5mb3JFYWNoKChmeCwgaSkgPT4ge1xuICAgICAgZnguc2V0SW5wdXQobGFzdEZYKVxuICAgICAgaWYoaSA9PT0gbnVtRlggLSAxKXtcbiAgICAgICAgZnguc2V0T3V0cHV0KHRoaXMuX3NvbmdPdXRwdXQpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZnguc2V0T3V0cHV0KHRoaXMuX2VmZmVjdHNbaSArIDFdKVxuICAgICAgfVxuICAgICAgbGFzdEZYID0gZnhcbiAgICB9KVxuICB9XG5cbiAgZ2V0RWZmZWN0cygpe1xuICAgIHJldHVybiB0aGlzLl9lZmZlY3RzXG4gIH1cblxuICBnZXRFZmZlY3RBdChpbmRleDogbnVtYmVyKXtcbiAgICBpZihpc05hTihpbmRleCkpe1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VmZmVjdHNbaW5kZXhdXG4gIH1cblxuICBnZXRPdXRwdXQoKXtcbiAgICByZXR1cm4gdGhpcy5fb3V0cHV0XG4gIH1cblxuICBnZXRJbnB1dCgpe1xuICAgIHJldHVybiB0aGlzLl9zb25nT3V0cHV0XG4gIH1cblxuICAvLyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gYSBNSURJIGV2ZW50cyBpcyBzZW5kIGJ5IGFuIGV4dGVybmFsIG9yIG9uLXNjcmVlbiBrZXlib2FyZFxuICBfcHJlcHJvY2Vzc01JRElFdmVudChtaWRpRXZlbnQpe1xuICAgIGxldCB0aW1lID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDBcbiAgICBtaWRpRXZlbnQudGltZSA9IHRpbWVcbiAgICBtaWRpRXZlbnQudGltZTIgPSAwLy9wZXJmb3JtYW5jZS5ub3coKSAtPiBwYXNzaW5nIDAgaGFzIHRoZSBzYW1lIGVmZmVjdCBhcyBwZXJmb3JtYW5jZS5ub3coKSBzbyB3ZSBjaG9vc2UgdGhlIGZvcm1lclxuICAgIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSB0aW1lXG4gICAgbGV0IG5vdGVcblxuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5OT1RFX09OKXtcbiAgICAgIG5vdGUgPSBuZXcgTUlESU5vdGUobWlkaUV2ZW50KVxuICAgICAgdGhpcy5fdG1wUmVjb3JkZWROb3Rlcy5zZXQobWlkaUV2ZW50LmRhdGExLCBub3RlKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgIHR5cGU6ICdub3RlT24nLFxuICAgICAgICBkYXRhOiBtaWRpRXZlbnRcbiAgICAgIH0pXG4gICAgfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT0ZGKXtcbiAgICAgIG5vdGUgPSB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmdldChtaWRpRXZlbnQuZGF0YTEpXG4gICAgICBpZih0eXBlb2Ygbm90ZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIG5vdGUuYWRkTm90ZU9mZihtaWRpRXZlbnQpXG4gICAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmRlbGV0ZShtaWRpRXZlbnQuZGF0YTEpXG4gICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgdHlwZTogJ25vdGVPZmYnLFxuICAgICAgICBkYXRhOiBtaWRpRXZlbnRcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYodGhpcy5fcmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknICYmIHRoaXMuX3NvbmcucmVjb3JkaW5nID09PSB0cnVlKXtcbiAgICAgIHRoaXMuX3JlY29yZGVkRXZlbnRzLnB1c2gobWlkaUV2ZW50KVxuICAgIH1cbiAgICB0aGlzLnByb2Nlc3NNSURJRXZlbnQobWlkaUV2ZW50KVxuICB9XG5cbiAgLy8gbWV0aG9kIGlzIGNhbGxlZCBieSBzY2hlZHVsZXIgZHVyaW5nIHBsYXliYWNrXG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQpe1xuXG4gICAgaWYodHlwZW9mIGV2ZW50LnRpbWUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuX3ByZXByb2Nlc3NNSURJRXZlbnQoZXZlbnQpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBzZW5kIHRvIGphdmFzY3JpcHQgaW5zdHJ1bWVudFxuICAgIGlmKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpe1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLm5hbWUsIGV2ZW50KVxuICAgICAgdGhpcy5faW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KGV2ZW50KVxuICAgIH1cblxuICAgIC8vIHNlbmQgdG8gZXh0ZXJuYWwgaGFyZHdhcmUgb3Igc29mdHdhcmUgaW5zdHJ1bWVudFxuICAgIHRoaXMuX3NlbmRUb0V4dGVybmFsTUlESU91dHB1dHMoZXZlbnQpXG4gIH1cblxuICBfc2VuZFRvRXh0ZXJuYWxNSURJT3V0cHV0cyhldmVudCl7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudC50aW1lLCBldmVudC5taWxsaXMpXG4gICAgZm9yKGxldCBwb3J0IG9mIHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKXtcbiAgICAgIGlmKHBvcnQpe1xuICAgICAgICBpZihldmVudC5kYXRhMiAhPT0gLTEpe1xuICAgICAgICAgIHBvcnQuc2VuZChbZXZlbnQudHlwZSArIHRoaXMuY2hhbm5lbCwgZXZlbnQuZGF0YTEsIGV2ZW50LmRhdGEyXSwgZXZlbnQudGltZTIpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHBvcnQuc2VuZChbZXZlbnQudHlwZSArIHRoaXMuY2hhbm5lbCwgZXZlbnQuZGF0YTFdLCBldmVudC50aW1lMilcbiAgICAgICAgfVxuICAgICAgICAvLyBpZihldmVudC50eXBlID09PSAxMjggfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAgIC8vICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCBldmVudC50aW1lICsgbGF0ZW5jeSlcbiAgICAgICAgLy8gfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTkyIHx8IGV2ZW50LnR5cGUgPT09IDIyNCl7XG4gICAgICAgIC8vICAgcG9ydC5zZW5kKFtldmVudC50eXBlLCBldmVudC5kYXRhMV0sIGV2ZW50LnRpbWUgKyBsYXRlbmN5KVxuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdW5zY2hlZHVsZShtaWRpRXZlbnQpe1xuXG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LnVuc2NoZWR1bGUobWlkaUV2ZW50KVxuICAgIH1cblxuICAgIGlmKHRoaXMuX21pZGlPdXRwdXRzLnNpemUgPT09IDApe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICBsZXQgbWlkaU5vdGUgPSBtaWRpRXZlbnQubWlkaU5vdGVcbiAgICAgIGxldCBub3RlT2ZmID0gbmV3IE1JRElFdmVudCgwLCAxMjgsIG1pZGlFdmVudC5kYXRhMSwgMClcbiAgICAgIG5vdGVPZmYubWlkaU5vdGVJZCA9IG1pZGlOb3RlLmlkXG4gICAgICBub3RlT2ZmLnRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gICAgICB0aGlzLl9zZW5kVG9FeHRlcm5hbE1JRElPdXRwdXRzKG5vdGVPZmYsIHRydWUpXG4gICAgfVxuICB9XG5cbiAgYWxsTm90ZXNPZmYoKXtcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICAgIH1cblxuICAgIC8vIGxldCB0aW1lU3RhbXAgPSAoY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApICsgdGhpcy5sYXRlbmN5XG4gICAgLy8gZm9yKGxldCBvdXRwdXQgb2YgdGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpe1xuICAgIC8vICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aW1lU3RhbXApIC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgLy8gICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gICAgLy8gfVxuICB9XG5cbiAgc2V0UGFubmluZyh2YWx1ZSl7XG4gICAgaWYodmFsdWUgPCAtMSB8fCB2YWx1ZSA+IDEpe1xuICAgICAgY29uc29sZS5sb2coJ1RyYWNrLnNldFBhbm5pbmcoKSBhY2NlcHRzIGEgdmFsdWUgYmV0d2VlbiAtMSAoZnVsbCBsZWZ0KSBhbmQgMSAoZnVsbCByaWdodCksIHlvdSBlbnRlcmVkOicsIHZhbHVlKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCB4ID0gdmFsdWVcbiAgICBsZXQgeSA9IDBcbiAgICBsZXQgeiA9IDEgLSBNYXRoLmFicyh4KVxuXG4gICAgeCA9IHggPT09IDAgPyB6ZXJvVmFsdWUgOiB4XG4gICAgeSA9IHkgPT09IDAgPyB6ZXJvVmFsdWUgOiB5XG4gICAgeiA9IHogPT09IDAgPyB6ZXJvVmFsdWUgOiB6XG5cbiAgICB0aGlzLl9wYW5uZXIuc2V0UG9zaXRpb24oeCwgeSwgeilcbiAgICB0aGlzLl9wYW5uaW5nVmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgZ2V0UGFubmluZygpe1xuICAgIHJldHVybiB0aGlzLl9wYW5uaW5nVmFsdWVcbiAgfVxuXG59XG4iLCJpbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcblxuY29uc3RcbiAgbVBJID0gTWF0aC5QSSxcbiAgbVBvdyA9IE1hdGgucG93LFxuICBtUm91bmQgPSBNYXRoLnJvdW5kLFxuICBtRmxvb3IgPSBNYXRoLmZsb29yLFxuICBtUmFuZG9tID0gTWF0aC5yYW5kb21cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmljZVRpbWUobWlsbGlzKXtcbiAgbGV0IGgsIG0sIHMsIG1zLFxuICAgIHNlY29uZHMsXG4gICAgdGltZUFzU3RyaW5nID0gJyc7XG5cbiAgc2Vjb25kcyA9IG1pbGxpcyAvIDEwMDA7IC8vIOKGkiBtaWxsaXMgdG8gc2Vjb25kc1xuICBoID0gbUZsb29yKHNlY29uZHMgLyAoNjAgKiA2MCkpO1xuICBtID0gbUZsb29yKChzZWNvbmRzICUgKDYwICogNjApKSAvIDYwKTtcbiAgcyA9IG1GbG9vcihzZWNvbmRzICUgKDYwKSk7XG4gIG1zID0gbVJvdW5kKChzZWNvbmRzIC0gKGggKiAzNjAwKSAtIChtICogNjApIC0gcykgKiAxMDAwKTtcblxuICB0aW1lQXNTdHJpbmcgKz0gaCArICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG0gPCAxMCA/ICcwJyArIG0gOiBtO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gcyA8IDEwID8gJzAnICsgcyA6IHM7XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtcyA9PT0gMCA/ICcwMDAnIDogbXMgPCAxMCA/ICcwMCcgKyBtcyA6IG1zIDwgMTAwID8gJzAnICsgbXMgOiBtcztcblxuICAvL2NvbnNvbGUubG9nKGgsIG0sIHMsIG1zKTtcbiAgcmV0dXJuIHtcbiAgICBob3VyOiBoLFxuICAgIG1pbnV0ZTogbSxcbiAgICBzZWNvbmQ6IHMsXG4gICAgbWlsbGlzZWNvbmQ6IG1zLFxuICAgIHRpbWVBc1N0cmluZzogdGltZUFzU3RyaW5nLFxuICAgIHRpbWVBc0FycmF5OiBbaCwgbSwgcywgbXNdXG4gIH07XG59XG5cblxuLy8gYWRhcHRlZCB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9kYW5ndWVyL2Jsb2ctZXhhbXBsZXMvYmxvYi9tYXN0ZXIvanMvYmFzZTY0LWJpbmFyeS5qc1xuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvQmluYXJ5KGlucHV0KXtcbiAgbGV0IGtleVN0ciA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPScsXG4gICAgYnl0ZXMsIHVhcnJheSwgYnVmZmVyLFxuICAgIGxrZXkxLCBsa2V5MixcbiAgICBjaHIxLCBjaHIyLCBjaHIzLFxuICAgIGVuYzEsIGVuYzIsIGVuYzMsIGVuYzQsXG4gICAgaSwgaiA9IDA7XG5cbiAgYnl0ZXMgPSBNYXRoLmNlaWwoKDMgKiBpbnB1dC5sZW5ndGgpIC8gNC4wKTtcbiAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVzKTtcbiAgdWFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblxuICBsa2V5MSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGggLSAxKSk7XG4gIGxrZXkyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aCAtIDEpKTtcbiAgaWYobGtleTEgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuICBpZihsa2V5MiA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG5cbiAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgJycpO1xuXG4gIGZvcihpID0gMDsgaSA8IGJ5dGVzOyBpICs9IDMpIHtcbiAgICAvL2dldCB0aGUgMyBvY3RlY3RzIGluIDQgYXNjaWkgY2hhcnNcbiAgICBlbmMxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMyA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmM0ID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuXG4gICAgY2hyMSA9IChlbmMxIDw8IDIpIHwgKGVuYzIgPj4gNCk7XG4gICAgY2hyMiA9ICgoZW5jMiAmIDE1KSA8PCA0KSB8IChlbmMzID4+IDIpO1xuICAgIGNocjMgPSAoKGVuYzMgJiAzKSA8PCA2KSB8IGVuYzQ7XG5cbiAgICB1YXJyYXlbaV0gPSBjaHIxO1xuICAgIGlmKGVuYzMgIT0gNjQpIHVhcnJheVtpKzFdID0gY2hyMjtcbiAgICBpZihlbmM0ICE9IDY0KSB1YXJyYXlbaSsyXSA9IGNocjM7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhidWZmZXIpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0eXBlU3RyaW5nKG8pe1xuICBpZih0eXBlb2YgbyAhPSAnb2JqZWN0Jyl7XG4gICAgcmV0dXJuIHR5cGVvZiBvO1xuICB9XG5cbiAgaWYobyA9PT0gbnVsbCl7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuXG4gIC8vb2JqZWN0LCBhcnJheSwgZnVuY3Rpb24sIGRhdGUsIHJlZ2V4cCwgc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIGVycm9yXG4gIGxldCBpbnRlcm5hbENsYXNzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9cXFtvYmplY3RcXHMoXFx3KylcXF0vKVsxXTtcbiAgcmV0dXJuIGludGVybmFsQ2xhc3MudG9Mb3dlckNhc2UoKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc29ydEV2ZW50cyhldmVudHMpe1xuICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICBpZihhLnRpY2tzID09PSBiLnRpY2tzKXtcbiAgICAgIGxldCByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgaWYoYS50eXBlID09PSAxNzYgJiYgYi50eXBlID09PSAxNDQpe1xuICAgICAgICByID0gLTFcbiAgICAgIH1cbiAgICAgIHJldHVybiByXG4gICAgfVxuICAgIHJldHVybiBhLnRpY2tzIC0gYi50aWNrc1xuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJZkJhc2U2NChkYXRhKXtcbiAgbGV0IHBhc3NlZCA9IHRydWU7XG4gIHRyeXtcbiAgICBhdG9iKGRhdGEpO1xuICB9Y2F0Y2goZSl7XG4gICAgcGFzc2VkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBhc3NlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVxdWFsUG93ZXJDdXJ2ZShudW1TdGVwcywgdHlwZSwgbWF4VmFsdWUpIHtcbiAgbGV0IGksIHZhbHVlLCBwZXJjZW50LFxuICAgIHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtU3RlcHMpXG5cbiAgZm9yKGkgPSAwOyBpIDwgbnVtU3RlcHM7IGkrKyl7XG4gICAgcGVyY2VudCA9IGkgLyBudW1TdGVwc1xuICAgIGlmKHR5cGUgPT09ICdmYWRlSW4nKXtcbiAgICAgIHZhbHVlID0gTWF0aC5jb3MoKDEuMCAtIHBlcmNlbnQpICogMC41ICogbVBJKSAqIG1heFZhbHVlXG4gICAgfWVsc2UgaWYodHlwZSA9PT0gJ2ZhZGVPdXQnKXtcbiAgICAgIHZhbHVlID0gTWF0aC5jb3MocGVyY2VudCAqIDAuNSAqIE1hdGguUEkpICogbWF4VmFsdWVcbiAgICB9XG4gICAgdmFsdWVzW2ldID0gdmFsdWVcbiAgICBpZihpID09PSBudW1TdGVwcyAtIDEpe1xuICAgICAgdmFsdWVzW2ldID0gdHlwZSA9PT0gJ2ZhZGVJbicgPyAxIDogMFxuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWVzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrTUlESU51bWJlcih2YWx1ZSl7XG4gIC8vY29uc29sZS5sb2codmFsdWUpO1xuICBpZihpc05hTih2YWx1ZSkpe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYodmFsdWUgPCAwIHx8IHZhbHVlID4gMTI3KXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTI3Jyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuXG4vKlxuLy9vbGQgc2Nob29sIGFqYXhcblxuZXhwb3J0IGZ1bmN0aW9uIGFqYXgoY29uZmlnKXtcbiAgbGV0XG4gICAgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpLFxuICAgIG1ldGhvZCA9IHR5cGVvZiBjb25maWcubWV0aG9kID09PSAndW5kZWZpbmVkJyA/ICdHRVQnIDogY29uZmlnLm1ldGhvZCxcbiAgICBmaWxlU2l6ZTtcblxuICBmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3Qpe1xuXG4gICAgcmVqZWN0ID0gcmVqZWN0IHx8IGZ1bmN0aW9uKCl7fTtcbiAgICByZXNvbHZlID0gcmVzb2x2ZSB8fCBmdW5jdGlvbigpe307XG5cbiAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICBpZihyZXF1ZXN0LnN0YXR1cyAhPT0gMjAwKXtcbiAgICAgICAgcmVqZWN0KHJlcXVlc3Quc3RhdHVzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZihjb25maWcucmVzcG9uc2VUeXBlID09PSAnanNvbicpe1xuICAgICAgICBmaWxlU2l6ZSA9IHJlcXVlc3QucmVzcG9uc2UubGVuZ3RoO1xuICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSksIGZpbGVTaXplKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZShyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKGUpe1xuICAgICAgY29uZmlnLm9uRXJyb3IoZSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub3BlbihtZXRob2QsIGNvbmZpZy51cmwsIHRydWUpO1xuXG4gICAgaWYoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpe1xuICAgICAgcmVxdWVzdC5vdmVycmlkZU1pbWVUeXBlKGNvbmZpZy5vdmVycmlkZU1pbWVUeXBlKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcucmVzcG9uc2VUeXBlKXtcbiAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihtZXRob2QgPT09ICdQT1NUJykge1xuICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLmRhdGEpe1xuICAgICAgcmVxdWVzdC5zZW5kKGNvbmZpZy5kYXRhKTtcbiAgICB9ZWxzZXtcbiAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShleGVjdXRvcik7XG59XG4qLyJdfQ==
