(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _qambi = require('../../src/qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// use "from 'qambi'" in your own code! so without the extra "../../"

document.addEventListener('DOMContentLoaded', function () {

  var song = void 0;
  var track = void 0;
  var instrument = void 0;

  _qambi2.default.init().then(function () {
    song = new _qambi.Song();
    track = new _qambi.Track();
    instrument = new _qambi.Instrument();
    song.addTracks(track);
    track.setInstrument(instrument);
    initUI();
  });

  function initUI() {

    var btnPlay = document.getElementById('play');
    var btnPause = document.getElementById('pause');
    var btnStop = document.getElementById('stop');
    var btnMetronome = document.getElementById('metronome');
    var divTempo = document.getElementById('tempo');
    var divPosition = document.getElementById('position');
    var divPositionTime = document.getElementById('position_time');
    var rangePosition = document.getElementById('playhead');
    var selectMIDIIn = document.getElementById('midiin');
    var selectInstrument = document.getElementById('instrument');
    var userInteraction = false;

    btnPlay.disabled = false;
    btnPause.disabled = false;
    btnStop.disabled = false;
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

    html = '<option id="select">select instrument</option>';

    var heartbeatInstruments = (0, _qambi.getInstruments)();
    heartbeatInstruments.forEach(function (instr, key) {
      html += '<option id="' + key + '">' + instr.name + '</option>';
    });

    //html += '<option id="separator">---</option>'

    var gmInstruments = (0, _qambi.getGMInstruments)();
    gmInstruments.forEach(function (instr, key) {
      html += '<option id="' + key + '">' + instr.name + '</option>';
    });
    selectInstrument.innerHTML = html;

    selectInstrument.addEventListener('change', function () {
      var instrumentFileName = selectInstrument.options[selectInstrument.selectedIndex].id;
      var url = '';
      if (heartbeatInstruments.has(instrumentFileName)) {
        url = '../../instruments/heartbeat/' + instrumentFileName + '.json';
      } else if (gmInstruments.has(instrumentFileName)) {
        url = '../../instruments/fluidsynth/' + instrumentFileName + '.json';
      } else {
        return;
      }
      instrument.parseSampleData({ url: url }).then(function () {
        console.log('loaded: ' + instrumentFileName);
      });
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
  }
});

},{"../../src/qambi":33}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"_process":2}],13:[function(require,module,exports){
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
exports.ConvolutionReverb = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_audio = require('./init_audio');

var _parse_audio = require('./parse_audio');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConvolutionReverb = exports.ConvolutionReverb = function () {
  function ConvolutionReverb(buffer) {
    _classCallCheck(this, ConvolutionReverb);

    this._nodeFX = _init_audio.context.createConvolver();

    if (buffer instanceof AudioBuffer) {
      this._nodeFX.buffer = buffer;
    }
    this.input = _init_audio.context.createGain();
    this.output = _init_audio.context.createGain();

    this._dry = _init_audio.context.createGain();
    this._wet = _init_audio.context.createGain();

    this._dry.gain.value = 1;
    this._wet.gain.value = 0;

    this.input.connect(this._dry);
    this._dry.connect(this.output);

    this.input.connect(this._nodeFX);
    this._nodeFX.connect(this._wet);
    this._wet.connect(this.output);

    this.amount = 0;
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
      var _this = this;

      return new Promise(function (resolve, reject) {
        (0, _parse_audio.parseSamples)(url).then(function (buffer) {
          buffer = buffer[0];
          if (buffer instanceof AudioBuffer) {
            _this._nodeFX.buffer = buffer;
            resolve();
          } else {
            reject('could not parse to AudioBuffer', url);
          }
        });
      });
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

  return ConvolutionReverb;
}();

},{"./init_audio":19,"./parse_audio":28}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{"./init_audio":19,"./init_midi":20,"./qambi":33,"./sampler":37,"./settings":41,"./song":43}],19:[function(require,module,exports){
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

},{"./parse_audio":28,"./samples":38}],20:[function(require,module,exports){
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

},{"./util":47,"webmidiapishim":11}],21:[function(require,module,exports){
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

},{"./eventlistener":16,"./init_audio":19}],22:[function(require,module,exports){
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

},{"./constants":14,"./init_audio":19,"./midi_event":23,"./parse_events":29,"./part":30,"./position":32,"./sampler":37,"./track":46,"./util":47}],23:[function(require,module,exports){
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

},{"./note":27,"./settings":41}],24:[function(require,module,exports){
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

},{"./midi_event":23}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{"./midi_stream":25}],27:[function(require,module,exports){
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

},{"./settings":41}],28:[function(require,module,exports){
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

},{"./eventlistener":16,"./init_audio":19,"./util":47,"isomorphic-fetch":4}],29:[function(require,module,exports){
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

},{"./midi_note":24,"./util":47}],30:[function(require,module,exports){
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

},{"./util":47}],31:[function(require,module,exports){
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

},{"./eventlistener.js":16,"./position.js":32,"./util.js":47}],32:[function(require,module,exports){
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

},{"./util":47}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConvolutionReverb = exports.Sampler = exports.SimpleSynth = exports.Instrument = exports.Part = exports.Track = exports.Song = exports.MIDINote = exports.MIDIEvent = exports.getNoteData = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.parseMIDIFile = exports.parseSamples = exports.MIDIEventTypes = exports.getSettings = exports.updateSettings = exports.getGMInstruments = exports.getInstruments = exports.init = exports.version = undefined;

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

var _midifile = require('./midifile');

var _init = require('./init');

var _init_audio = require('./init_audio');

var _init_midi = require('./init_midi');

var _parse_audio = require('./parse_audio');

var _constants = require('./constants');

var _eventlistener = require('./eventlistener');

var version = '1.0.0-beta28';

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

},{"./constants":14,"./convolution_reverb":15,"./eventlistener":16,"./init":18,"./init_audio":19,"./init_midi":20,"./instrument":21,"./midi_event":23,"./midi_note":24,"./midifile":26,"./note":27,"./parse_audio":28,"./part":30,"./sampler":37,"./settings":41,"./simple_synth":42,"./song":43,"./track":46}],34:[function(require,module,exports){
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

},{"./init_audio.js":19,"./util.js":47}],35:[function(require,module,exports){
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

},{"./init_audio":19,"./sample":34}],36:[function(require,module,exports){
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

},{"./init_audio":19,"./sample":34}],37:[function(require,module,exports){
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

},{"./fetch_helpers":17,"./instrument":21,"./note":27,"./parse_audio":28,"./sample_buffer":35,"./util":47}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var samples = {
  //  emptyOgg: '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Y5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=',
  //  emptyMp3: '//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAABAAADQgD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAAA5TEFNRTMuOTlyAc0AAAAAAAAAABSAJAJAQgAAgAAAA0L2YLQxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
  hightick: 'UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAACx/xf/dADOACwBsP3p+6H+zAGoBOkCCwBX/EH5OvxlA4kJ2wcSArT9E/ut+HT2evUx98n6OAF5CCUMwQvfCOsJxAx0DSIMEAq9BiAB3vhz7mLkT9sR133YxN2s5QLv0vrUBnwRnxuQJeEsSDCiMd8yFS8aKFIhohUsCKj64u625OraA9HuyPnElcP+wxvJWtW25637VQ0jHPgnBTDDM1o0CzKLK+8hzhgFDOz8Se4J47DYVtG0z5fQq9LB12rfA+j99roHAhelIyMwIjdTOuU8mjwIOGoxhCb5E53/j+3k3/fTY8pTw4y/Tr+ew8DMvdsk8RcHRRkSKO4yGTkHPkU/rzzyNcgsrR94Dp/5r+Zs17zOncoDxhfE38WLyn/TeOMi9r0IRxlRKIQzyTlOPKo9yjmWMcokDRLc/Y7rudtdzu/D2L1Iu+27JcG3yYrVLujl+3UOZx1UK5Q0qzmNPDk8ZjeeMPojzhH+/jLtPd5m0hHLHsYIw5TEMMnA0jvj8fSOBiwXASZgMzM8dUBGQbI+rzjpKkIZygZT9QflcdaRyqXCz7+VwUPH784r3K7s+v0KDu8bvyeLMb43NjrhOIo0dSvQHi0PnP6i7ovg3NTxy4/Gf8X8yH/QBtvX55P2Ygb0FcUjsy4LNmI5ejiXM38r7iC8FJwHPvok7dDgQdaJzlTKIsoFzsrVkuA87d/6qAi7FQ0h9ClKMLEz3TOrMBcqYSD8E9AFd/dS6kTf6dbU0XnQv9IH2MXfZ+ln9DEAFwwdFy8giib6KawqeChgI/UbHBOTCZj/vvXe7InlFuDN3P3b0d1F4gzpifG2+u4D7Qw1FfwbnCD+IlgjWyHLHPMVog2mBL37qvP+7NvnYuTv4rvjfubN6k3wpPZ0/WkEOwtiEUsWcxm+Gl4aOhhiFDAPIwmbAtn7TPVy77zqcefr5YHmHull7enyfPmcAHgHew1REr8Vhhd/F+AV1RJ0DikJWQNc/ZP3efKd7hvs2ur46rHs5u8e9N/48/0hA/8HFgwuD04RSBIREqsQOg7mCssGMAJW/Xn4G/TK8Lbuzu0I7qTvnPJy9sX6bP84BLYIbAwdD84QYxG7EOcODAxwCFMEAQC9+7P3SvTX8XHw+u9R8KTxIvSo9+X7VQCUBJ0IMwziDj4QLhAGD9UMrgnTBZcBRv1v+Xv2UfS+8tfx+vES87z0+vb3+Zf9ZgEQBSEIUArWC8kM2QyzC5EJEAdvBHgBXP5n++r4Avd89Wj07fMw9D31Jvfp+Uj9xQD9A8QG5QhXClELrAsvC9wJ7gd6BWIC3v6O+7T4PPZN9EHzWvNf9Pz1Fvit+qL9rQCHAwEG/weCCZUKFwvDCnIJcAcQBWcCaf8Z/CD55vaB9dD0wPSP9UL3m/k7/Mz+JwEyAw8FzAY7CBsJaQk5CWkI2gatBCICYf+j/Fr6vfiV9872sfZP91z4p/lR+3H9zf89AroEFAfjCP0Jcwo8CjAJdQdgBSEDkgDQ/Vj7ZfnR95T28fUd9v32Vvg2+nb8+/6xAWoE4AbDCP4JpAqbCqQJ0weEBfgCTACT/R37M/m+9672IPY69gb3afhW+tT8qf+MAj0FggcuCScKXAriCcMIEAfyBJYCFwCP/Rz7A/l793z2F/Zn9mH37fjd+i39yf9pAt0EFAfRCNkJGAqrCZYIvgZPBJ8B6P4//M350vdz9q/1lfUq9mz3RPmi+3H+bgFVBOQG3wgHCkwK0Am7CCAHCgWmAjAA',
  lowtick: 'UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAAB0/5v+U/4T/3gA0wFTAuUB+f8d/nT90f1q/ub+tf46/mb/8wFQA9gC7wCd/mr+FAGRA3cE6wJf/h36evmv+8v/NwRHBZUC2/60+//5EvuZ/aX/bgFOAp8Azvzh9wfzLPF68zT4y/2BAygIfQwaEjYY0x31Irwl8SOWHVESOgPh9NfpReFt22nYHddD2BXcZeDa5InqgPDx9nP+6gS4CBYLnw0zES0WXxv4HkcgLh/1G+EX1RNpD4wKigXH/6r5/fNu7lTpj+Zu5hHoXOtL71byr/Qp91L64v6OBO4JoQ5zEskU+hU1FiQVeRP7EWgP4Qr0BIT+tPid9C3y1vCh8FDxJvK28vvyy/LA8pLzU/XP95v6xvw4/uD/RAK2BSkKcg6BEScTZBMeEqkPTQxjCKEEVwFi/nv7h/hp9aDyAvHP8MfxLvM+9PX0uPW19g/4Lfr7/C4AKgNaBXQGywb0BhIHWQfWB1oIzAjtCF8IHwdtBakDVwKLAeYA8v9w/kj81/nQ94v29/XX9bz1bPUY9Uz1Z/aH+Hr7yP4MAi4F+wcfCnYLNgyfDPsMSw0sDUAMfgrcB5IEMwFb/iX8T/pT+O/1X/Mf8cbvrO+18MLyvfVP+Rf9wgAoBCEHpwnIC5EN4Q5AD3wO1Ay0CpsIvwbvBNcCbQAr/nX8Ofsf+vb4mvda9rj1z/WX9pL3a/hH+ZX6R/wn/vP/eQESA/AE+wYDCcwKFAyPDCkMFQuSCe4HVQbSBHQDCwI8ANL9JPuY+HX28vTq82PzdPMV9Az1MfZ49zD5gftx/sQBBQXLB8cJ/gqpCw8MigwWDXENXQ2rDDUL7QgDBswCdv8S/K74WPVk8hXwou4P7mvu1+9T8pz1Uvli/ZoBwgWRCcsMPg/CEEQR4RDADwoO9wusCVMH4ARSApn/ufzd+Wj3bvX78xzzx/L68qzz1vSD9qX4Gfvd/c0AhwO/BWwHmghvCQEKVQonClsJCwiIBh0F0gOgAm0BOwAx/03+XP0g/Lb6cPmX+F/4vfh++TH6s/os+7/7cvwL/Zz9XP5O/3IA3AF9AzsF9gaUCAAKHgueCzcL9wntB3sF4wIzAI396fp1+Gv2IvWn9N30p/Xi9m74G/ru+9P9k/8aAYEC1AMTBSIG0wYuB1gHkgcACGEISAhTBzEFWAKt/5L92fuU+vX50fmf+SP5i/gb+Bf4mviv+Sr7kvyb/Uj+r/4X/8r/+gCiAo0EUAaRBzwISwjqB3IHGQfCBv8FpgTMApQAKf67+5n5/vfn9jz2yPVn9SL1RPXq9SP3Dvmr+6f+sQGKBAcH+whOCh0Laws3C28KLAmDB5AFfQNoAVP/Zv3e+7P6sfnL+Cv4vPeM95b37feV+Jn51Poq/LL9mv+YAVYD3gQuBmcHSAikCIEI7Af+BuEFngQXA1sBv/9v/pf9MP3W/Fj8q/sR+6H6U/o3+mP6y/pN+/f7xvye/WH+Jf9mAD4CQAQJBisHtgf6Bw0I8QdsB1sGywT4AggBCP/o/KX6mPg19572jfaz9uf2S/cM+E35E/tW/af/5wH1A8AFKgfkB/AHgwfxBlAGgQVIBMMCJwGs/43+vP0i/Zr8Lfzl+9H76fvi+9f75fsf/In8BP10/ej9cf4O/7f/dAAcAaUBEgKMAhgDpAMEBCEEDwTfA3IDxQL8ASoBUwCG/87+J/6h/Rr9pPxk/Gb8oPwJ/XH9w/39/UD+qP41/9D/WwDeAGsBAgKdAhEDQQNAA0sDbwOVA5YDVwPOAhgCVAGRAA=='
};

exports.default = samples;

},{}],39:[function(require,module,exports){
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

},{"filesaverjs":3}],40:[function(require,module,exports){
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

},{"./init_audio":19,"./init_midi":20,"./midi_event":23,"./util":47}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
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

},{"./instrument":21,"./sample_oscillator":36}],43:[function(require,module,exports){
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

},{"./constants":14,"./eventlistener":16,"./init_audio":19,"./metronome":22,"./midi_event":23,"./parse_events":29,"./playhead":31,"./position":32,"./save_midifile":39,"./scheduler":40,"./settings":41,"./song.update":44,"./song_from_midifile":45,"./util":47}],44:[function(require,module,exports){
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

},{"./constants":14,"./eventlistener":16,"./midi_event":23,"./parse_events":29,"./position":32,"./util":47}],45:[function(require,module,exports){
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

},{"./fetch_helpers":17,"./midi_event":23,"./midifile":26,"./part":30,"./settings":41,"./song":43,"./track":46,"./util":47,"isomorphic-fetch":4}],46:[function(require,module,exports){
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

    // routing: audiosource -> panning -> track output -> effect -> song input

  }, {
    key: 'addEffect',
    value: function addEffect(effect) {

      //@TODO: add fx rack (currently only 1 fx can be added)

      this._output.disconnect(this._songOutput);
      this._output.connect(effect.input);
      effect.output.connect(this._songOutput);

      // if(this._checkEffect(effect) === false){
      //   return
      // }
      // let numFX = this._effects.length
      // let lastFX
      // let output
      // if(numFX === 0){
      //   lastFX = this._output
      //   lastFX.disconnect(this._songOutput)
      //   output = this._output
      // }else{
      //   lastFX = this._effects[numFX - 1]
      //   lastFX.disconnect()
      //   output = lastFX.getOutput()
      // }

      // effect.setInput(output)
      // effect.setOutput(this._songOutput)

      // this._effects.push(effect)
    }
  }, {
    key: 'addEffectAt',
    value: function addEffectAt(effect, index) {
      if (this._checkEffect(effect) === false) {
        return;
      }
      this._effects.splice(index, 0, effect);
    }

    //removeEffect(index: number){
  }, {
    key: 'removeEffect',
    value: function removeEffect(effect) {
      this._output.disconnect(effect.input);
      try {
        effect.output.disconnect(this._songOutput);
      } catch (e) {
        // Chrome throws an error here, which is wrong
      }
      this._output.connect(this._songOutput);

      // if(isNaN(index)){
      //   return
      // }
      // this._effects.forEach(fx => {
      //   fx.disconnect()
      // })
      // this._effects.splice(index, 1)

      // let numFX = this._effects.length

      // if(numFX === 0){
      //   this._output.connect(this._songOutput)
      //   return
      // }

      // let lastFX = this._output
      // this._effects.forEach((fx, i) => {
      //   fx.setInput(lastFX)
      //   if(i === numFX - 1){
      //     fx.setOutput(this._songOutput)
      //   }else{
      //     fx.setOutput(this._effects[i + 1])
      //   }
      //   lastFX = fx
      // })
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

},{"./eventlistener":16,"./init_audio":19,"./init_midi":20,"./midi_event":23,"./midi_note":24,"./part":30,"./qambi":33,"./util":47}],47:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZmlsZXNhdmVyanMvRmlsZVNhdmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtZmV0Y2gvZmV0Y2gtbnBtLWJyb3dzZXJpZnkuanMiLCIuLi9ub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9qYXp6X2luc3RhbmNlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3QvbWlkaV9hY2Nlc3MuanMiLCIuLi9ub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9taWRpX2lucHV0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3QvbWlkaV9vdXRwdXQuanMiLCIuLi9ub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9taWRpY29ubmVjdGlvbl9ldmVudC5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L21pZGltZXNzYWdlX2V2ZW50LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3Qvc2hpbS5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L3V0aWwuanMiLCIuLi9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwiLi4vc3JjL2NvbnN0YW50cy5qcyIsIi4uL3NyYy9jb252b2x1dGlvbl9yZXZlcmIuanMiLCIuLi9zcmMvZXZlbnRsaXN0ZW5lci5qcyIsIi4uL3NyYy9mZXRjaF9oZWxwZXJzLmpzIiwiLi4vc3JjL2luaXQuanMiLCIuLi9zcmMvaW5pdF9hdWRpby5qcyIsIi4uL3NyYy9pbml0X21pZGkuanMiLCIuLi9zcmMvaW5zdHJ1bWVudC5qcyIsIi4uL3NyYy9tZXRyb25vbWUuanMiLCIuLi9zcmMvbWlkaV9ldmVudC5qcyIsIi4uL3NyYy9taWRpX25vdGUuanMiLCIuLi9zcmMvbWlkaV9zdHJlYW0uanMiLCIuLi9zcmMvbWlkaWZpbGUuanMiLCIuLi9zcmMvbm90ZS5qcyIsIi4uL3NyYy9wYXJzZV9hdWRpby5qcyIsIi4uL3NyYy9wYXJzZV9ldmVudHMuanMiLCIuLi9zcmMvcGFydC5qcyIsIi4uL3NyYy9wbGF5aGVhZC5qcyIsIi4uL3NyYy9wb3NpdGlvbi5qcyIsIi4uL3NyYy9xYW1iaS5qcyIsIi4uL3NyYy9zYW1wbGUuanMiLCIuLi9zcmMvc2FtcGxlX2J1ZmZlci5qcyIsIi4uL3NyYy9zYW1wbGVfb3NjaWxsYXRvci5qcyIsIi4uL3NyYy9zYW1wbGVyLmpzIiwiLi4vc3JjL3NhbXBsZXMuanMiLCIuLi9zcmMvc2F2ZV9taWRpZmlsZS5qcyIsIi4uL3NyYy9zY2hlZHVsZXIuanMiLCIuLi9zcmMvc2V0dGluZ3MuanMiLCIuLi9zcmMvc2ltcGxlX3N5bnRoLmpzIiwiLi4vc3JjL3NvbmcuanMiLCIuLi9zcmMvc29uZy51cGRhdGUuanMiLCIuLi9zcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwiLi4vc3JjL3RyYWNrLmpzIiwiLi4vc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7Ozs7OztBQVVBLFNBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQVU7O0FBRXRELE1BQUksYUFBSjtBQUNBLE1BQUksY0FBSjtBQUNBLE1BQUksbUJBQUo7O0FBRUEsa0JBQU0sSUFBTixHQUNDLElBREQsQ0FDTSxZQUFNO0FBQ1YsV0FBTyxpQkFBUDtBQUNBLFlBQVEsa0JBQVI7QUFDQSxpQkFBYSx1QkFBYjtBQUNBLFNBQUssU0FBTCxDQUFlLEtBQWY7QUFDQSxVQUFNLGFBQU4sQ0FBb0IsVUFBcEI7QUFDQTtBQUNELEdBUkQ7O0FBV0EsV0FBUyxNQUFULEdBQWlCOztBQUVmLFFBQUksVUFBVSxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBZDtBQUNBLFFBQUksV0FB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QUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q0EsUUFBRyxTQUFTLFFBQVosRUFBcUI7QUFDbkIsY0FBUSxLQUFLLEdBQUwsQ0FBUyxDQUFDLE1BQU0sT0FBUCxJQUFrQixHQUFsQixHQUF3QixHQUFqQyxJQUF3QyxRQUFoRDtBQUNELEtBRkQsTUFFTSxJQUFHLFNBQVMsU0FBWixFQUFzQjtBQUMxQixjQUFRLEtBQUssR0FBTCxDQUFTLFVBQVUsR0FBVixHQUFnQixLQUFLLEVBQTlCLElBQW9DLFFBQTVDO0FBQ0Q7QUFDRCxXQUFPLENBQVAsSUFBWSxLQUFaO0FBQ0EsUUFBRyxNQUFNLFdBQVcsQ0FBcEIsRUFBc0I7QUFDcEIsYUFBTyxDQUFQLElBQVksU0FBUyxRQUFULEdBQW9CLENBQXBCLEdBQXdCLENBQXBDO0FBQ0Q7QUFDRjtBQUNELFNBQU8sTUFBUDtBQUNEOztBQUdNLFNBQVMsZUFBVCxDQUF5QixLQUF6QixFQUErQjs7QUFFcEMsTUFBRyxNQUFNLEtBQU4sQ0FBSCxFQUFnQjtBQUNkLFlBQVEsSUFBUixDQUFhLHlCQUFiO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7QUFDRCxNQUFHLFFBQVEsQ0FBUixJQUFhLFFBQVEsR0FBeEIsRUFBNEI7QUFDMUIsWUFBUSxJQUFSLENBQWEsMkNBQWI7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNELFNBQU8sS0FBUDtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBxYW1iaSwge1xuICBTb25nLFxuICBUcmFjayxcbiAgSW5zdHJ1bWVudCxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0SW5zdHJ1bWVudHMsXG4gIGdldEdNSW5zdHJ1bWVudHMsXG59IGZyb20gJy4uLy4uL3NyYy9xYW1iaScgLy8gdXNlIFwiZnJvbSAncWFtYmknXCIgaW4geW91ciBvd24gY29kZSEgc28gd2l0aG91dCB0aGUgZXh0cmEgXCIuLi8uLi9cIlxuXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xuXG4gIGxldCBzb25nXG4gIGxldCB0cmFja1xuICBsZXQgaW5zdHJ1bWVudFxuXG4gIHFhbWJpLmluaXQoKVxuICAudGhlbigoKSA9PiB7XG4gICAgc29uZyA9IG5ldyBTb25nKClcbiAgICB0cmFjayA9IG5ldyBUcmFjaygpXG4gICAgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50KClcbiAgICBzb25nLmFkZFRyYWNrcyh0cmFjaylcbiAgICB0cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpXG4gICAgaW5pdFVJKClcbiAgfSlcblxuXG4gIGZ1bmN0aW9uIGluaXRVSSgpe1xuXG4gICAgbGV0IGJ0blBsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheScpXG4gICAgbGV0IGJ0blBhdXNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhdXNlJylcbiAgICBsZXQgYnRuU3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9wJylcbiAgICBsZXQgYnRuTWV0cm9ub21lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJvbm9tZScpXG4gICAgbGV0IGRpdlRlbXBvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RlbXBvJylcbiAgICBsZXQgZGl2UG9zaXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zaXRpb24nKVxuICAgIGxldCBkaXZQb3NpdGlvblRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zaXRpb25fdGltZScpXG4gICAgbGV0IHJhbmdlUG9zaXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheWhlYWQnKVxuICAgIGxldCBzZWxlY3RNSURJSW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlkaWluJylcbiAgICBsZXQgc2VsZWN0SW5zdHJ1bWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnN0cnVtZW50JylcbiAgICBsZXQgdXNlckludGVyYWN0aW9uID0gZmFsc2VcblxuICAgIGJ0blBsYXkuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0blBhdXNlLmRpc2FibGVkID0gZmFsc2VcbiAgICBidG5TdG9wLmRpc2FibGVkID0gZmFsc2VcbiAgICBidG5NZXRyb25vbWUuZGlzYWJsZWQgPSBmYWxzZVxuXG5cbiAgICBsZXQgTUlESUlucHV0cyA9IGdldE1JRElJbnB1dHMoKVxuICAgIGxldCBodG1sID0gJzxvcHRpb24gaWQ9XCItMVwiPnNlbGVjdCBNSURJIGluPC9vcHRpb24+J1xuICAgIE1JRElJbnB1dHMuZm9yRWFjaChwb3J0ID0+IHtcbiAgICAgIGh0bWwgKz0gYDxvcHRpb24gaWQ9XCIke3BvcnQuaWR9XCI+JHtwb3J0Lm5hbWV9PC9vcHRpb24+YFxuICAgIH0pXG4gICAgc2VsZWN0TUlESUluLmlubmVySFRNTCA9IGh0bWxcblxuICAgIHNlbGVjdE1JRElJbi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBlID0+IHtcbiAgICAgIGxldCBwb3J0SWQgPSBzZWxlY3RNSURJSW4ub3B0aW9uc1tzZWxlY3RNSURJSW4uc2VsZWN0ZWRJbmRleF0uaWRcbiAgICAgIHRyYWNrLmRpc2Nvbm5lY3RNSURJSW5wdXRzKCkgLy8gbm8gYXJndW1lbnRzIG1lYW5zIGRpc2Nvbm5lY3QgZnJvbSBhbGwgaW5wdXRzXG4gICAgICB0cmFjay5jb25uZWN0TUlESUlucHV0cyhwb3J0SWQpXG4gICAgfSlcblxuICAgIGh0bWwgPSAnPG9wdGlvbiBpZD1cInNlbGVjdFwiPnNlbGVjdCBpbnN0cnVtZW50PC9vcHRpb24+J1xuXG4gICAgbGV0IGhlYXJ0YmVhdEluc3RydW1lbnRzID0gZ2V0SW5zdHJ1bWVudHMoKVxuICAgIGhlYXJ0YmVhdEluc3RydW1lbnRzLmZvckVhY2goKGluc3RyLCBrZXkpID0+IHtcbiAgICAgIGh0bWwgKz0gYDxvcHRpb24gaWQ9XCIke2tleX1cIj4ke2luc3RyLm5hbWV9PC9vcHRpb24+YFxuICAgIH0pXG5cbiAgICAvL2h0bWwgKz0gJzxvcHRpb24gaWQ9XCJzZXBhcmF0b3JcIj4tLS08L29wdGlvbj4nXG5cbiAgICBsZXQgZ21JbnN0cnVtZW50cyA9IGdldEdNSW5zdHJ1bWVudHMoKVxuICAgIGdtSW5zdHJ1bWVudHMuZm9yRWFjaCgoaW5zdHIsIGtleSkgPT4ge1xuICAgICAgaHRtbCArPSBgPG9wdGlvbiBpZD1cIiR7a2V5fVwiPiR7aW5zdHIubmFtZX08L29wdGlvbj5gXG4gICAgfSlcbiAgICBzZWxlY3RJbnN0cnVtZW50LmlubmVySFRNTCA9IGh0bWxcblxuICAgIHNlbGVjdEluc3RydW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgbGV0IGluc3RydW1lbnRGaWxlTmFtZSA9IHNlbGVjdEluc3RydW1lbnQub3B0aW9uc1tzZWxlY3RJbnN0cnVtZW50LnNlbGVjdGVkSW5kZXhdLmlkXG4gICAgICBsZXQgdXJsID0gJydcbiAgICAgIGlmKGhlYXJ0YmVhdEluc3RydW1lbnRzLmhhcyhpbnN0cnVtZW50RmlsZU5hbWUpKXtcbiAgICAgICAgdXJsID0gYC4uLy4uL2luc3RydW1lbnRzL2hlYXJ0YmVhdC8ke2luc3RydW1lbnRGaWxlTmFtZX0uanNvbmBcbiAgICAgIH1lbHNlIGlmKGdtSW5zdHJ1bWVudHMuaGFzKGluc3RydW1lbnRGaWxlTmFtZSkpe1xuICAgICAgICB1cmwgPSBgLi4vLi4vaW5zdHJ1bWVudHMvZmx1aWRzeW50aC8ke2luc3RydW1lbnRGaWxlTmFtZX0uanNvbmBcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGluc3RydW1lbnQucGFyc2VTYW1wbGVEYXRhKHt1cmx9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgbG9hZGVkOiAke2luc3RydW1lbnRGaWxlTmFtZX1gKVxuICAgICAgfSlcbiAgICB9KVxuXG5cbiAgICBidG5NZXRyb25vbWUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgc29uZy5zZXRNZXRyb25vbWUoKSAvLyBpZiBubyBhcmd1bWVudHMgYXJlIHByb3ZpZGVkIGl0IHNpbXBseSB0b2dnbGVzXG4gICAgICBidG5NZXRyb25vbWUuaW5uZXJIVE1MID0gc29uZy51c2VNZXRyb25vbWUgPyAnbWV0cm9ub21lIG9mZicgOiAnbWV0cm9ub21lIG9uJ1xuICAgIH0pXG5cbiAgICBidG5QbGF5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcucGxheSgpXG4gICAgfSlcblxuICAgIGJ0blBhdXNlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcucGF1c2UoKVxuICAgIH0pXG5cbiAgICBidG5TdG9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgIHNvbmcuc3RvcCgpXG4gICAgfSlcblxuXG4gICAgbGV0IHBvc2l0aW9uID0gc29uZy5nZXRQb3NpdGlvbigpXG4gICAgZGl2UG9zaXRpb24uaW5uZXJIVE1MID0gcG9zaXRpb24uYmFyc0FzU3RyaW5nXG4gICAgZGl2UG9zaXRpb25UaW1lLmlubmVySFRNTCA9IHBvc2l0aW9uLnRpbWVBc1N0cmluZ1xuICAgIGRpdlRlbXBvLmlubmVySFRNTCA9IGB0ZW1wbzogJHtwb3NpdGlvbi5icG19IGJwbWBcblxuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcigncG9zaXRpb24nLCBldmVudCA9PiB7XG4gICAgICBkaXZQb3NpdGlvbi5pbm5lckhUTUwgPSBldmVudC5kYXRhLmJhcnNBc1N0cmluZ1xuICAgICAgZGl2UG9zaXRpb25UaW1lLmlubmVySFRNTCA9IGV2ZW50LmRhdGEudGltZUFzU3RyaW5nXG4gICAgICBkaXZUZW1wby5pbm5lckhUTUwgPSBgdGVtcG86ICR7ZXZlbnQuZGF0YS5icG19IGJwbWBcbiAgICAgIGlmKCF1c2VySW50ZXJhY3Rpb24pe1xuICAgICAgICByYW5nZVBvc2l0aW9uLnZhbHVlID0gZXZlbnQuZGF0YS5wZXJjZW50YWdlXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG59KVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiBGaWxlU2F2ZXIuanNcbiAqIEEgc2F2ZUFzKCkgRmlsZVNhdmVyIGltcGxlbWVudGF0aW9uLlxuICogMS4xLjIwMTYwMzI4XG4gKlxuICogQnkgRWxpIEdyZXksIGh0dHA6Ly9lbGlncmV5LmNvbVxuICogTGljZW5zZTogTUlUXG4gKiAgIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZWxpZ3JleS9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuICovXG5cbi8qZ2xvYmFsIHNlbGYgKi9cbi8qanNsaW50IGJpdHdpc2U6IHRydWUsIGluZGVudDogNCwgbGF4YnJlYWs6IHRydWUsIGxheGNvbW1hOiB0cnVlLCBzbWFydHRhYnM6IHRydWUsIHBsdXNwbHVzOiB0cnVlICovXG5cbi8qISBAc291cmNlIGh0dHA6Ly9wdXJsLmVsaWdyZXkuY29tL2dpdGh1Yi9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvRmlsZVNhdmVyLmpzICovXG5cbnZhciBzYXZlQXMgPSBzYXZlQXMgfHwgKGZ1bmN0aW9uKHZpZXcpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdC8vIElFIDwxMCBpcyBleHBsaWNpdGx5IHVuc3VwcG9ydGVkXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIC9NU0lFIFsxLTldXFwuLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhclxuXHRcdCAgZG9jID0gdmlldy5kb2N1bWVudFxuXHRcdCAgLy8gb25seSBnZXQgVVJMIHdoZW4gbmVjZXNzYXJ5IGluIGNhc2UgQmxvYi5qcyBoYXNuJ3Qgb3ZlcnJpZGRlbiBpdCB5ZXRcblx0XHQsIGdldF9VUkwgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2aWV3LlVSTCB8fCB2aWV3LndlYmtpdFVSTCB8fCB2aWV3O1xuXHRcdH1cblx0XHQsIHNhdmVfbGluayA9IGRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsIFwiYVwiKVxuXHRcdCwgY2FuX3VzZV9zYXZlX2xpbmsgPSBcImRvd25sb2FkXCIgaW4gc2F2ZV9saW5rXG5cdFx0LCBjbGljayA9IGZ1bmN0aW9uKG5vZGUpIHtcblx0XHRcdHZhciBldmVudCA9IG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7XG5cdFx0XHRub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuXHRcdH1cblx0XHQsIGlzX3NhZmFyaSA9IC9WZXJzaW9uXFwvW1xcZFxcLl0rLipTYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcblx0XHQsIHdlYmtpdF9yZXFfZnMgPSB2aWV3LndlYmtpdFJlcXVlc3RGaWxlU3lzdGVtXG5cdFx0LCByZXFfZnMgPSB2aWV3LnJlcXVlc3RGaWxlU3lzdGVtIHx8IHdlYmtpdF9yZXFfZnMgfHwgdmlldy5tb3pSZXF1ZXN0RmlsZVN5c3RlbVxuXHRcdCwgdGhyb3dfb3V0c2lkZSA9IGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHQodmlldy5zZXRJbW1lZGlhdGUgfHwgdmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhyb3cgZXg7XG5cdFx0XHR9LCAwKTtcblx0XHR9XG5cdFx0LCBmb3JjZV9zYXZlYWJsZV90eXBlID0gXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIlxuXHRcdCwgZnNfbWluX3NpemUgPSAwXG5cdFx0Ly8gdGhlIEJsb2IgQVBJIGlzIGZ1bmRhbWVudGFsbHkgYnJva2VuIGFzIHRoZXJlIGlzIG5vIFwiZG93bmxvYWRmaW5pc2hlZFwiIGV2ZW50IHRvIHN1YnNjcmliZSB0b1xuXHRcdCwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0ID0gMTAwMCAqIDQwIC8vIGluIG1zXG5cdFx0LCByZXZva2UgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHR2YXIgcmV2b2tlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKTtcblx0XHRcdFx0fSBlbHNlIHsgLy8gZmlsZSBpcyBhIEZpbGVcblx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0LyogLy8gVGFrZSBub3RlIFczQzpcblx0XHRcdHZhclxuXHRcdFx0ICB1cmkgPSB0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIiA/IGZpbGUgOiBmaWxlLnRvVVJMKClcblx0XHRcdCwgcmV2b2tlciA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHQvLyBpZGVhbHkgRG93bmxvYWRGaW5pc2hlZEV2ZW50LmRhdGEgd291bGQgYmUgdGhlIFVSTCByZXF1ZXN0ZWRcblx0XHRcdFx0aWYgKGV2dC5kYXRhID09PSB1cmkpIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIGZpbGUgaXMgYSBGaWxlXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0O1xuXHRcdFx0dmlldy5hZGRFdmVudExpc3RlbmVyKFwiZG93bmxvYWRmaW5pc2hlZFwiLCByZXZva2VyKTtcblx0XHRcdCovXG5cdFx0XHRzZXRUaW1lb3V0KHJldm9rZXIsIGFyYml0cmFyeV9yZXZva2VfdGltZW91dCk7XG5cdFx0fVxuXHRcdCwgZGlzcGF0Y2ggPSBmdW5jdGlvbihmaWxlc2F2ZXIsIGV2ZW50X3R5cGVzLCBldmVudCkge1xuXHRcdFx0ZXZlbnRfdHlwZXMgPSBbXS5jb25jYXQoZXZlbnRfdHlwZXMpO1xuXHRcdFx0dmFyIGkgPSBldmVudF90eXBlcy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdHZhciBsaXN0ZW5lciA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF90eXBlc1tpXV07XG5cdFx0XHRcdGlmICh0eXBlb2YgbGlzdGVuZXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRsaXN0ZW5lci5jYWxsKGZpbGVzYXZlciwgZXZlbnQgfHwgZmlsZXNhdmVyKTtcblx0XHRcdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRcdFx0dGhyb3dfb3V0c2lkZShleCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCwgYXV0b19ib20gPSBmdW5jdGlvbihibG9iKSB7XG5cdFx0XHQvLyBwcmVwZW5kIEJPTSBmb3IgVVRGLTggWE1MIGFuZCB0ZXh0LyogdHlwZXMgKGluY2x1ZGluZyBIVE1MKVxuXHRcdFx0aWYgKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9iKFtcIlxcdWZlZmZcIiwgYmxvYl0sIHt0eXBlOiBibG9iLnR5cGV9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBibG9iO1xuXHRcdH1cblx0XHQsIEZpbGVTYXZlciA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdC8vIEZpcnN0IHRyeSBhLmRvd25sb2FkLCB0aGVuIHdlYiBmaWxlc3lzdGVtLCB0aGVuIG9iamVjdCBVUkxzXG5cdFx0XHR2YXJcblx0XHRcdFx0ICBmaWxlc2F2ZXIgPSB0aGlzXG5cdFx0XHRcdCwgdHlwZSA9IGJsb2IudHlwZVxuXHRcdFx0XHQsIGJsb2JfY2hhbmdlZCA9IGZhbHNlXG5cdFx0XHRcdCwgb2JqZWN0X3VybFxuXHRcdFx0XHQsIHRhcmdldF92aWV3XG5cdFx0XHRcdCwgZGlzcGF0Y2hfYWxsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgd3JpdGVlbmRcIi5zcGxpdChcIiBcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIG9uIGFueSBmaWxlc3lzIGVycm9ycyByZXZlcnQgdG8gc2F2aW5nIHdpdGggb2JqZWN0IFVSTHNcblx0XHRcdFx0LCBmc19lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICh0YXJnZXRfdmlldyAmJiBpc19zYWZhcmkgJiYgdHlwZW9mIEZpbGVSZWFkZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRcdC8vIFNhZmFyaSBkb2Vzbid0IGFsbG93IGRvd25sb2FkaW5nIG9mIGJsb2IgdXJsc1xuXHRcdFx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdFx0XHRyZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBiYXNlNjREYXRhID0gcmVhZGVyLnJlc3VsdDtcblx0XHRcdFx0XHRcdFx0dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZiA9IFwiZGF0YTphdHRhY2htZW50L2ZpbGVcIiArIGJhc2U2NERhdGEuc2xpY2UoYmFzZTY0RGF0YS5zZWFyY2goL1ssO10vKSk7XG5cdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xuXHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZG9uJ3QgY3JlYXRlIG1vcmUgb2JqZWN0IFVSTHMgdGhhbiBuZWVkZWRcblx0XHRcdFx0XHRpZiAoYmxvYl9jaGFuZ2VkIHx8ICFvYmplY3RfdXJsKSB7XG5cdFx0XHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRhcmdldF92aWV3KSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dmFyIG5ld190YWIgPSB2aWV3Lm9wZW4ob2JqZWN0X3VybCwgXCJfYmxhbmtcIik7XG5cdFx0XHRcdFx0XHRpZiAobmV3X3RhYiA9PT0gdW5kZWZpbmVkICYmIGlzX3NhZmFyaSkge1xuXHRcdFx0XHRcdFx0XHQvL0FwcGxlIGRvIG5vdCBhbGxvdyB3aW5kb3cub3Blbiwgc2VlIGh0dHA6Ly9iaXQubHkvMWtaZmZSSVxuXHRcdFx0XHRcdFx0XHR2aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCwgYWJvcnRhYmxlID0gZnVuY3Rpb24oZnVuYykge1xuXHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmIChmaWxlc2F2ZXIucmVhZHlTdGF0ZSAhPT0gZmlsZXNhdmVyLkRPTkUpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdCwgY3JlYXRlX2lmX25vdF9mb3VuZCA9IHtjcmVhdGU6IHRydWUsIGV4Y2x1c2l2ZTogZmFsc2V9XG5cdFx0XHRcdCwgc2xpY2Vcblx0XHRcdDtcblx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLklOSVQ7XG5cdFx0XHRpZiAoIW5hbWUpIHtcblx0XHRcdFx0bmFtZSA9IFwiZG93bmxvYWRcIjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5fdXNlX3NhdmVfbGluaykge1xuXHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzYXZlX2xpbmsuaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0c2F2ZV9saW5rLmRvd25sb2FkID0gbmFtZTtcblx0XHRcdFx0XHRjbGljayhzYXZlX2xpbmspO1xuXHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdHJldm9rZShvYmplY3RfdXJsKTtcblx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Ly8gT2JqZWN0IGFuZCB3ZWIgZmlsZXN5c3RlbSBVUkxzIGhhdmUgYSBwcm9ibGVtIHNhdmluZyBpbiBHb29nbGUgQ2hyb21lIHdoZW5cblx0XHRcdC8vIHZpZXdlZCBpbiBhIHRhYiwgc28gSSBmb3JjZSBzYXZlIHdpdGggYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXG5cdFx0XHQvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05MTE1OFxuXHRcdFx0Ly8gVXBkYXRlOiBHb29nbGUgZXJyYW50bHkgY2xvc2VkIDkxMTU4LCBJIHN1Ym1pdHRlZCBpdCBhZ2Fpbjpcblx0XHRcdC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0zODk2NDJcblx0XHRcdGlmICh2aWV3LmNocm9tZSAmJiB0eXBlICYmIHR5cGUgIT09IGZvcmNlX3NhdmVhYmxlX3R5cGUpIHtcblx0XHRcdFx0c2xpY2UgPSBibG9iLnNsaWNlIHx8IGJsb2Iud2Via2l0U2xpY2U7XG5cdFx0XHRcdGJsb2IgPSBzbGljZS5jYWxsKGJsb2IsIDAsIGJsb2Iuc2l6ZSwgZm9yY2Vfc2F2ZWFibGVfdHlwZSk7XG5cdFx0XHRcdGJsb2JfY2hhbmdlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHQvLyBTaW5jZSBJIGNhbid0IGJlIHN1cmUgdGhhdCB0aGUgZ3Vlc3NlZCBtZWRpYSB0eXBlIHdpbGwgdHJpZ2dlciBhIGRvd25sb2FkXG5cdFx0XHQvLyBpbiBXZWJLaXQsIEkgYXBwZW5kIC5kb3dubG9hZCB0byB0aGUgZmlsZW5hbWUuXG5cdFx0XHQvLyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NjU0NDBcblx0XHRcdGlmICh3ZWJraXRfcmVxX2ZzICYmIG5hbWUgIT09IFwiZG93bmxvYWRcIikge1xuXHRcdFx0XHRuYW1lICs9IFwiLmRvd25sb2FkXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZSA9PT0gZm9yY2Vfc2F2ZWFibGVfdHlwZSB8fCB3ZWJraXRfcmVxX2ZzKSB7XG5cdFx0XHRcdHRhcmdldF92aWV3ID0gdmlldztcblx0XHRcdH1cblx0XHRcdGlmICghcmVxX2ZzKSB7XG5cdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGZzX21pbl9zaXplICs9IGJsb2Iuc2l6ZTtcblx0XHRcdHJlcV9mcyh2aWV3LlRFTVBPUkFSWSwgZnNfbWluX3NpemUsIGFib3J0YWJsZShmdW5jdGlvbihmcykge1xuXHRcdFx0XHRmcy5yb290LmdldERpcmVjdG9yeShcInNhdmVkXCIsIGNyZWF0ZV9pZl9ub3RfZm91bmQsIGFib3J0YWJsZShmdW5jdGlvbihkaXIpIHtcblx0XHRcdFx0XHR2YXIgc2F2ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlyLmdldEZpbGUobmFtZSwgY3JlYXRlX2lmX25vdF9mb3VuZCwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdFx0ZmlsZS5jcmVhdGVXcml0ZXIoYWJvcnRhYmxlKGZ1bmN0aW9uKHdyaXRlcikge1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci5vbndyaXRlZW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBmaWxlLnRvVVJMKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlZW5kXCIsIGV2ZW50KTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldm9rZShmaWxlKTtcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgZXJyb3IgPSB3cml0ZXIuZXJyb3I7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZXJyb3IuY29kZSAhPT0gZXJyb3IuQUJPUlRfRVJSKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgYWJvcnRcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0d3JpdGVyW1wib25cIiArIGV2ZW50XSA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF07XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLndyaXRlKGJsb2IpO1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0d3JpdGVyLmFib3J0KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuV1JJVElORztcblx0XHRcdFx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdFx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRkaXIuZ2V0RmlsZShuYW1lLCB7Y3JlYXRlOiBmYWxzZX0sIGFib3J0YWJsZShmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdFx0XHQvLyBkZWxldGUgZmlsZSBpZiBpdCBhbHJlYWR5IGV4aXN0c1xuXHRcdFx0XHRcdFx0ZmlsZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdHNhdmUoKTtcblx0XHRcdFx0XHR9KSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHRcdFx0XHRpZiAoZXguY29kZSA9PT0gZXguTk9UX0ZPVU5EX0VSUikge1xuXHRcdFx0XHRcdFx0XHRzYXZlKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmc19lcnJvcigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0fVxuXHRcdCwgRlNfcHJvdG8gPSBGaWxlU2F2ZXIucHJvdG90eXBlXG5cdFx0LCBzYXZlQXMgPSBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pO1xuXHRcdH1cblx0O1xuXHQvLyBJRSAxMCsgKG5hdGl2ZSBzYXZlQXMpXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLCBuYW1lIHx8IFwiZG93bmxvYWRcIik7XG5cdFx0fTtcblx0fVxuXG5cdEZTX3Byb3RvLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZpbGVzYXZlciA9IHRoaXM7XG5cdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwiYWJvcnRcIik7XG5cdH07XG5cdEZTX3Byb3RvLnJlYWR5U3RhdGUgPSBGU19wcm90by5JTklUID0gMDtcblx0RlNfcHJvdG8uV1JJVElORyA9IDE7XG5cdEZTX3Byb3RvLkRPTkUgPSAyO1xuXG5cdEZTX3Byb3RvLmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZXN0YXJ0ID1cblx0RlNfcHJvdG8ub25wcm9ncmVzcyA9XG5cdEZTX3Byb3RvLm9ud3JpdGUgPVxuXHRGU19wcm90by5vbmFib3J0ID1cblx0RlNfcHJvdG8ub25lcnJvciA9XG5cdEZTX3Byb3RvLm9ud3JpdGVlbmQgPVxuXHRcdG51bGw7XG5cblx0cmV0dXJuIHNhdmVBcztcbn0oXG5cdCAgIHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiICYmIHNlbGZcblx0fHwgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3dcblx0fHwgdGhpcy5jb250ZW50XG4pKTtcbi8vIGBzZWxmYCBpcyB1bmRlZmluZWQgaW4gRmlyZWZveCBmb3IgQW5kcm9pZCBjb250ZW50IHNjcmlwdCBjb250ZXh0XG4vLyB3aGlsZSBgdGhpc2AgaXMgbnNJQ29udGVudEZyYW1lTWVzc2FnZU1hbmFnZXJcbi8vIHdpdGggYW4gYXR0cmlidXRlIGBjb250ZW50YCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB3aW5kb3dcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMuc2F2ZUFzID0gc2F2ZUFzO1xufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkZWZpbmUgIT09IG51bGwpICYmIChkZWZpbmUuYW1kICE9PSBudWxsKSkge1xuICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzYXZlQXM7XG4gIH0pO1xufVxuIiwiLy8gdGhlIHdoYXR3Zy1mZXRjaCBwb2x5ZmlsbCBpbnN0YWxscyB0aGUgZmV0Y2goKSBmdW5jdGlvblxuLy8gb24gdGhlIGdsb2JhbCBvYmplY3QgKHdpbmRvdyBvciBzZWxmKVxuLy9cbi8vIFJldHVybiB0aGF0IGFzIHRoZSBleHBvcnQgZm9yIHVzZSBpbiBXZWJwYWNrLCBCcm93c2VyaWZ5IGV0Yy5cbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xubW9kdWxlLmV4cG9ydHMgPSBzZWxmLmZldGNoLmJpbmQoc2VsZik7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNyZWF0ZUphenpJbnN0YW5jZSA9IGNyZWF0ZUphenpJbnN0YW5jZTtcbmV4cG9ydHMuZ2V0SmF6ekluc3RhbmNlID0gZ2V0SmF6ekluc3RhbmNlO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIGphenpQbHVnaW5Jbml0VGltZSA9IDEwMDsgLy8gbWlsbGlzZWNvbmRzXG5cbi8qXG4gIENyZWF0ZXMgaW5zdGFuY2VzIG9mIHRoZSBKYXp6IHBsdWdpbiBpZiBuZWNlc3NhcnkuIEluaXRpYWxseSB0aGUgTUlESUFjY2VzcyBjcmVhdGVzIG9uZSBtYWluIEphenogaW5zdGFuY2UgdGhhdCBpcyB1c2VkXG4gIHRvIHF1ZXJ5IGFsbCBpbml0aWFsbHkgY29ubmVjdGVkIGRldmljZXMsIGFuZCB0byB0cmFjayB0aGUgZGV2aWNlcyB0aGF0IGFyZSBiZWluZyBjb25uZWN0ZWQgb3IgZGlzY29ubmVjdGVkIGF0IHJ1bnRpbWUuXG5cbiAgRm9yIGV2ZXJ5IE1JRElJbnB1dCBhbmQgTUlESU91dHB1dCB0aGF0IGlzIGNyZWF0ZWQsIE1JRElBY2Nlc3MgcXVlcmllcyB0aGUgZ2V0SmF6ekluc3RhbmNlKCkgbWV0aG9kIGZvciBhIEphenogaW5zdGFuY2VcbiAgdGhhdCBzdGlsbCBoYXZlIGFuIGF2YWlsYWJsZSBpbnB1dCBvciBvdXRwdXQuIEJlY2F1c2UgSmF6eiBvbmx5IGFsbG93cyBvbmUgaW5wdXQgYW5kIG9uZSBvdXRwdXQgcGVyIGluc3RhbmNlLCB3ZVxuICBuZWVkIHRvIGNyZWF0ZSBuZXcgaW5zdGFuY2VzIGlmIG1vcmUgdGhhbiBvbmUgTUlESSBpbnB1dCBvciBvdXRwdXQgZGV2aWNlIGdldHMgY29ubmVjdGVkLlxuXG4gIE5vdGUgdGhhdCBhbiBleGlzdGluZyBKYXp6IGluc3RhbmNlIGRvZXNuJ3QgZ2V0IGRlbGV0ZWQgd2hlbiBib3RoIGl0cyBpbnB1dCBhbmQgb3V0cHV0IGRldmljZSBhcmUgZGlzY29ubmVjdGVkOyBpbnN0ZWFkIGl0XG4gIHdpbGwgYmUgcmV1c2VkIGlmIGEgbmV3IGRldmljZSBnZXRzIGNvbm5lY3RlZC5cbiovXG5cbnZhciBqYXp6SW5zdGFuY2VOdW1iZXIgPSAwO1xudmFyIGphenpJbnN0YW5jZXMgPSBuZXcgTWFwKCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUphenpJbnN0YW5jZShjYWxsYmFjaykge1xuXG4gIHZhciBpZCA9ICdqYXp6XycgKyBqYXp6SW5zdGFuY2VOdW1iZXIrKyArICcnICsgRGF0ZS5ub3coKTtcbiAgdmFyIGluc3RhbmNlID0gdm9pZCAwO1xuICB2YXIgb2JqUmVmID0gdm9pZCAwLFxuICAgICAgYWN0aXZlWCA9IHZvaWQgMDtcblxuICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5ub2RlanMgPT09IHRydWUpIHtcbiAgICBvYmpSZWYgPSBuZXcgamF6ek1pZGkuTUlESSgpO1xuICB9IGVsc2Uge1xuICAgIHZhciBvMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29iamVjdCcpO1xuICAgIG8xLmlkID0gaWQgKyAnaWUnO1xuICAgIG8xLmNsYXNzaWQgPSAnQ0xTSUQ6MUFDRTE2MTgtMUM3RC00NTYxLUFFRTEtMzQ4NDJBQTg1RTkwJztcbiAgICBhY3RpdmVYID0gbzE7XG5cbiAgICB2YXIgbzIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvYmplY3QnKTtcbiAgICBvMi5pZCA9IGlkO1xuICAgIG8yLnR5cGUgPSAnYXVkaW8veC1qYXp6JztcbiAgICBvMS5hcHBlbmRDaGlsZChvMik7XG4gICAgb2JqUmVmID0gbzI7XG5cbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdUaGlzIHBhZ2UgcmVxdWlyZXMgdGhlICcpKTtcblxuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0phenogcGx1Z2luJykpO1xuICAgIGEuaHJlZiA9ICdodHRwOi8vamF6ei1zb2Z0Lm5ldC8nO1xuXG4gICAgZS5hcHBlbmRDaGlsZChhKTtcbiAgICBlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcuJykpO1xuICAgIG8yLmFwcGVuZENoaWxkKGUpO1xuXG4gICAgdmFyIGluc2VydGlvblBvaW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ01JRElQbHVnaW4nKTtcbiAgICBpZiAoIWluc2VydGlvblBvaW50KSB7XG4gICAgICAvLyBDcmVhdGUgaGlkZGVuIGVsZW1lbnRcbiAgICAgIGluc2VydGlvblBvaW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBpbnNlcnRpb25Qb2ludC5pZCA9ICdNSURJUGx1Z2luJztcbiAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLmxlZnQgPSAnLTk5OTlweCc7XG4gICAgICBpbnNlcnRpb25Qb2ludC5zdHlsZS50b3AgPSAnLTk5OTlweCc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGluc2VydGlvblBvaW50KTtcbiAgICB9XG4gICAgaW5zZXJ0aW9uUG9pbnQuYXBwZW5kQ2hpbGQobzEpO1xuICB9XG5cbiAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG9ialJlZi5pc0phenogPT09IHRydWUpIHtcbiAgICAgIGluc3RhbmNlID0gb2JqUmVmO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZlWC5pc0phenogPT09IHRydWUpIHtcbiAgICAgIGluc3RhbmNlID0gYWN0aXZlWDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBpbnN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGluc3RhbmNlLl9wZXJmVGltZVplcm8gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIGphenpJbnN0YW5jZXMuc2V0KGlkLCBpbnN0YW5jZSk7XG4gICAgfVxuICAgIGNhbGxiYWNrKGluc3RhbmNlKTtcbiAgfSwgamF6elBsdWdpbkluaXRUaW1lKTtcbn1cblxuZnVuY3Rpb24gZ2V0SmF6ekluc3RhbmNlKHR5cGUsIGNhbGxiYWNrKSB7XG4gIHZhciBpbnN0YW5jZSA9IG51bGw7XG4gIHZhciBrZXkgPSB0eXBlID09PSAnaW5wdXQnID8gJ2lucHV0SW5Vc2UnIDogJ291dHB1dEluVXNlJztcblxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBqYXp6SW5zdGFuY2VzLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgdmFyIGluc3QgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgaWYgKGluc3Rba2V5XSAhPT0gdHJ1ZSkge1xuICAgICAgICBpbnN0YW5jZSA9IGluc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICBjcmVhdGVKYXp6SW5zdGFuY2UoY2FsbGJhY2spO1xuICB9IGVsc2Uge1xuICAgIGNhbGxiYWNrKGluc3RhbmNlKTtcbiAgfVxufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTsgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENyZWF0ZXMgYSBNSURJQWNjZXNzIGluc3RhbmNlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBDcmVhdGVzIE1JRElJbnB1dCBhbmQgTUlESU91dHB1dCBpbnN0YW5jZXMgZm9yIHRoZSBpbml0aWFsbHkgY29ubmVjdGVkIE1JREkgZGV2aWNlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gS2VlcHMgdHJhY2sgb2YgbmV3bHkgY29ubmVjdGVkIGRldmljZXMgYW5kIGNyZWF0ZXMgdGhlIG5lY2Vzc2FyeSBpbnN0YW5jZXMgb2YgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBLZWVwcyB0cmFjayBvZiBkaXNjb25uZWN0ZWQgZGV2aWNlcyBhbmQgcmVtb3ZlcyB0aGVtIGZyb20gdGhlIGlucHV0cyBhbmQvb3Igb3V0cHV0cyBtYXAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIENyZWF0ZXMgYSB1bmlxdWUgaWQgZm9yIGV2ZXJ5IGRldmljZSBhbmQgc3RvcmVzIHRoZXNlIGlkcyBieSB0aGUgbmFtZSBvZiB0aGUgZGV2aWNlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbyB3aGVuIGEgZGV2aWNlIGdldHMgZGlzY29ubmVjdGVkIGFuZCByZWNvbm5lY3RlZCBhZ2FpbiwgaXQgd2lsbCBzdGlsbCBoYXZlIHRoZSBzYW1lIGlkLiBUaGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzIGluIGxpbmUgd2l0aCB0aGUgYmVoYXZpb3VyIG9mIHRoZSBuYXRpdmUgTUlESUFjY2VzcyBvYmplY3QuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxuZXhwb3J0cy5jcmVhdGVNSURJQWNjZXNzID0gY3JlYXRlTUlESUFjY2VzcztcbmV4cG9ydHMuZGlzcGF0Y2hFdmVudCA9IGRpc3BhdGNoRXZlbnQ7XG5leHBvcnRzLmNsb3NlQWxsTUlESUlucHV0cyA9IGNsb3NlQWxsTUlESUlucHV0cztcbmV4cG9ydHMuZ2V0TUlESURldmljZUlkID0gZ2V0TUlESURldmljZUlkO1xuXG52YXIgX2phenpfaW5zdGFuY2UgPSByZXF1aXJlKCcuL2phenpfaW5zdGFuY2UnKTtcblxudmFyIF9taWRpX2lucHV0ID0gcmVxdWlyZSgnLi9taWRpX2lucHV0Jyk7XG5cbnZhciBfbWlkaV9vdXRwdXQgPSByZXF1aXJlKCcuL21pZGlfb3V0cHV0Jyk7XG5cbnZhciBfbWlkaWNvbm5lY3Rpb25fZXZlbnQgPSByZXF1aXJlKCcuL21pZGljb25uZWN0aW9uX2V2ZW50Jyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgbWlkaUFjY2VzcyA9IHZvaWQgMDtcbnZhciBqYXp6SW5zdGFuY2UgPSB2b2lkIDA7XG52YXIgbWlkaUlucHV0cyA9IG5ldyBNYXAoKTtcbnZhciBtaWRpT3V0cHV0cyA9IG5ldyBNYXAoKTtcbnZhciBtaWRpSW5wdXRJZHMgPSBuZXcgTWFwKCk7XG52YXIgbWlkaU91dHB1dElkcyA9IG5ldyBNYXAoKTtcbnZhciBsaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG5cbnZhciBNSURJQWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNSURJQWNjZXNzKGlucHV0cywgb3V0cHV0cykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJQWNjZXNzKTtcblxuICAgIHRoaXMuc3lzZXhFbmFibGVkID0gdHJ1ZTtcbiAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICB0aGlzLm91dHB1dHMgPSBvdXRwdXRzO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElBY2Nlc3MsIFt7XG4gICAga2V5OiAnYWRkRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gdHJ1ZSkge1xuICAgICAgICBsaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTUlESUFjY2Vzcztcbn0oKTtcblxuZnVuY3Rpb24gY3JlYXRlTUlESUFjY2VzcygpIHtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICBpZiAodHlwZW9mIG1pZGlBY2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXNvbHZlKG1pZGlBY2Nlc3MpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLmJyb3dzZXIgPT09ICdpZTknKSB7XG4gICAgICByZWplY3QoeyBtZXNzYWdlOiAnV2ViTUlESUFQSVNoaW0gc3VwcG9ydHMgSW50ZXJuZXQgRXhwbG9yZXIgMTAgYW5kIGFib3ZlLicgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgKDAsIF9qYXp6X2luc3RhbmNlLmNyZWF0ZUphenpJbnN0YW5jZSkoZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgICBpZiAodHlwZW9mIGluc3RhbmNlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZWplY3QoeyBtZXNzYWdlOiAnTm8gYWNjZXNzIHRvIE1JREkgZGV2aWNlczogYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHRoZSBXZWJNSURJIEFQSSBhbmQgdGhlIEphenogcGx1Z2luIGlzIG5vdCBpbnN0YWxsZWQuJyB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBqYXp6SW5zdGFuY2UgPSBpbnN0YW5jZTtcblxuICAgICAgY3JlYXRlTUlESVBvcnRzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0dXBMaXN0ZW5lcnMoKTtcbiAgICAgICAgbWlkaUFjY2VzcyA9IG5ldyBNSURJQWNjZXNzKG1pZGlJbnB1dHMsIG1pZGlPdXRwdXRzKTtcbiAgICAgICAgcmVzb2x2ZShtaWRpQWNjZXNzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gY3JlYXRlIE1JRElJbnB1dCBhbmQgTUlESU91dHB1dCBpbnN0YW5jZXMgZm9yIGFsbCBpbml0aWFsbHkgY29ubmVjdGVkIE1JREkgZGV2aWNlc1xuZnVuY3Rpb24gY3JlYXRlTUlESVBvcnRzKGNhbGxiYWNrKSB7XG4gIHZhciBpbnB1dHMgPSBqYXp6SW5zdGFuY2UuTWlkaUluTGlzdCgpO1xuICB2YXIgb3V0cHV0cyA9IGphenpJbnN0YW5jZS5NaWRpT3V0TGlzdCgpO1xuICB2YXIgbnVtSW5wdXRzID0gaW5wdXRzLmxlbmd0aDtcbiAgdmFyIG51bU91dHB1dHMgPSBvdXRwdXRzLmxlbmd0aDtcblxuICBsb29wQ3JlYXRlTUlESVBvcnQoMCwgbnVtSW5wdXRzLCAnaW5wdXQnLCBpbnB1dHMsIGZ1bmN0aW9uICgpIHtcbiAgICBsb29wQ3JlYXRlTUlESVBvcnQoMCwgbnVtT3V0cHV0cywgJ291dHB1dCcsIG91dHB1dHMsIGNhbGxiYWNrKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGxvb3BDcmVhdGVNSURJUG9ydChpbmRleCwgbWF4LCB0eXBlLCBsaXN0LCBjYWxsYmFjaykge1xuICBpZiAoaW5kZXggPCBtYXgpIHtcbiAgICB2YXIgbmFtZSA9IGxpc3RbaW5kZXgrK107XG4gICAgY3JlYXRlTUlESVBvcnQodHlwZSwgbmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgbG9vcENyZWF0ZU1JRElQb3J0KGluZGV4LCBtYXgsIHR5cGUsIGxpc3QsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjaygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1JRElQb3J0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gICgwLCBfamF6el9pbnN0YW5jZS5nZXRKYXp6SW5zdGFuY2UpKHR5cGUsIGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgIHZhciBwb3J0ID0gdm9pZCAwO1xuICAgIHZhciBpbmZvID0gW25hbWUsICcnLCAnJ107XG4gICAgaWYgKHR5cGUgPT09ICdpbnB1dCcpIHtcbiAgICAgIGlmIChpbnN0YW5jZS5TdXBwb3J0KCdNaWRpSW5JbmZvJykpIHtcbiAgICAgICAgaW5mbyA9IGluc3RhbmNlLk1pZGlJbkluZm8obmFtZSk7XG4gICAgICB9XG4gICAgICBwb3J0ID0gbmV3IF9taWRpX2lucHV0Lk1JRElJbnB1dChpbmZvLCBpbnN0YW5jZSk7XG4gICAgICBtaWRpSW5wdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdvdXRwdXQnKSB7XG4gICAgICBpZiAoaW5zdGFuY2UuU3VwcG9ydCgnTWlkaU91dEluZm8nKSkge1xuICAgICAgICBpbmZvID0gaW5zdGFuY2UuTWlkaU91dEluZm8obmFtZSk7XG4gICAgICB9XG4gICAgICBwb3J0ID0gbmV3IF9taWRpX291dHB1dC5NSURJT3V0cHV0KGluZm8sIGluc3RhbmNlKTtcbiAgICAgIG1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICB9XG4gICAgY2FsbGJhY2socG9ydCk7XG4gIH0pO1xufVxuXG4vLyBsb29rdXAgZnVuY3Rpb246IEphenogZ2l2ZXMgdXMgdGhlIG5hbWUgb2YgdGhlIGNvbm5lY3RlZC9kaXNjb25uZWN0ZWQgTUlESSBkZXZpY2VzIGJ1dCB3ZSBoYXZlIHN0b3JlZCB0aGVtIGJ5IGlkXG5mdW5jdGlvbiBnZXRQb3J0QnlOYW1lKHBvcnRzLCBuYW1lKSB7XG4gIHZhciBwb3J0ID0gdm9pZCAwO1xuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBwb3J0cy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgIHBvcnQgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgaWYgKHBvcnQubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBvcnQ7XG59XG5cbi8vIGtlZXAgdHJhY2sgb2YgY29ubmVjdGVkL2Rpc2Nvbm5lY3RlZCBNSURJIGRldmljZXNcbmZ1bmN0aW9uIHNldHVwTGlzdGVuZXJzKCkge1xuICBqYXp6SW5zdGFuY2UuT25EaXNjb25uZWN0TWlkaUluKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIHBvcnQgPSBnZXRQb3J0QnlOYW1lKG1pZGlJbnB1dHMsIG5hbWUpO1xuICAgIGlmICh0eXBlb2YgcG9ydCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBvcnQuc3RhdGUgPSAnZGlzY29ubmVjdGVkJztcbiAgICAgIHBvcnQuY2xvc2UoKTtcbiAgICAgIHBvcnQuX2phenpJbnN0YW5jZS5pbnB1dEluVXNlID0gZmFsc2U7XG4gICAgICBtaWRpSW5wdXRzLmRlbGV0ZShwb3J0LmlkKTtcbiAgICAgIGRpc3BhdGNoRXZlbnQocG9ydCk7XG4gICAgfVxuICB9KTtcblxuICBqYXp6SW5zdGFuY2UuT25EaXNjb25uZWN0TWlkaU91dChmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBwb3J0ID0gZ2V0UG9ydEJ5TmFtZShtaWRpT3V0cHV0cywgbmFtZSk7XG4gICAgaWYgKHR5cGVvZiBwb3J0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcG9ydC5zdGF0ZSA9ICdkaXNjb25uZWN0ZWQnO1xuICAgICAgcG9ydC5jbG9zZSgpO1xuICAgICAgcG9ydC5famF6ekluc3RhbmNlLm91dHB1dEluVXNlID0gZmFsc2U7XG4gICAgICBtaWRpT3V0cHV0cy5kZWxldGUocG9ydC5pZCk7XG4gICAgICBkaXNwYXRjaEV2ZW50KHBvcnQpO1xuICAgIH1cbiAgfSk7XG5cbiAgamF6ekluc3RhbmNlLk9uQ29ubmVjdE1pZGlJbihmdW5jdGlvbiAobmFtZSkge1xuICAgIGNyZWF0ZU1JRElQb3J0KCdpbnB1dCcsIG5hbWUsIGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICBkaXNwYXRjaEV2ZW50KHBvcnQpO1xuICAgIH0pO1xuICB9KTtcblxuICBqYXp6SW5zdGFuY2UuT25Db25uZWN0TWlkaU91dChmdW5jdGlvbiAobmFtZSkge1xuICAgIGNyZWF0ZU1JRElQb3J0KCdvdXRwdXQnLCBuYW1lLCBmdW5jdGlvbiAocG9ydCkge1xuICAgICAgZGlzcGF0Y2hFdmVudChwb3J0KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8vIHdoZW4gYSBkZXZpY2UgZ2V0cyBjb25uZWN0ZWQvZGlzY29ubmVjdGVkIGJvdGggdGhlIHBvcnQgYW5kIE1JRElBY2Nlc3MgZGlzcGF0Y2ggYSBNSURJQ29ubmVjdGlvbkV2ZW50XG4vLyB0aGVyZWZvciB3ZSBjYWxsIHRoZSBwb3J0cyBkaXNwYXRjaEV2ZW50IGZ1bmN0aW9uIGhlcmUgYXMgd2VsbFxuZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChwb3J0KSB7XG4gIHBvcnQuZGlzcGF0Y2hFdmVudChuZXcgX21pZGljb25uZWN0aW9uX2V2ZW50Lk1JRElDb25uZWN0aW9uRXZlbnQocG9ydCwgcG9ydCkpO1xuXG4gIHZhciBldnQgPSBuZXcgX21pZGljb25uZWN0aW9uX2V2ZW50Lk1JRElDb25uZWN0aW9uRXZlbnQobWlkaUFjY2VzcywgcG9ydCk7XG5cbiAgaWYgKHR5cGVvZiBtaWRpQWNjZXNzLm9uc3RhdGVjaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICBtaWRpQWNjZXNzLm9uc3RhdGVjaGFuZ2UoZXZ0KTtcbiAgfVxuICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gbGlzdGVuZXJzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgIGxpc3RlbmVyKGV2dCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xvc2VBbGxNSURJSW5wdXRzKCkge1xuICBtaWRpSW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgLy9pbnB1dC5jbG9zZSgpO1xuICAgIGlucHV0Ll9qYXp6SW5zdGFuY2UuTWlkaUluQ2xvc2UoKTtcbiAgfSk7XG59XG5cbi8vIGNoZWNrIGlmIHdlIGhhdmUgYWxyZWFkeSBjcmVhdGVkIGEgdW5pcXVlIGlkIGZvciB0aGlzIGRldmljZSwgaWYgc286IHJldXNlIGl0LCBpZiBub3Q6IGNyZWF0ZSBhIG5ldyBpZCBhbmQgc3RvcmUgaXRcbmZ1bmN0aW9uIGdldE1JRElEZXZpY2VJZChuYW1lLCB0eXBlKSB7XG4gIHZhciBpZCA9IHZvaWQgMDtcbiAgaWYgKHR5cGUgPT09ICdpbnB1dCcpIHtcbiAgICBpZCA9IG1pZGlJbnB1dElkcy5nZXQobmFtZSk7XG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGlkID0gKDAsIF91dGlsLmdlbmVyYXRlVVVJRCkoKTtcbiAgICAgIG1pZGlJbnB1dElkcy5zZXQobmFtZSwgaWQpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnb3V0cHV0Jykge1xuICAgIGlkID0gbWlkaU91dHB1dElkcy5nZXQobmFtZSk7XG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGlkID0gKDAsIF91dGlsLmdlbmVyYXRlVVVJRCkoKTtcbiAgICAgIG1pZGlPdXRwdXRJZHMuc2V0KG5hbWUsIGlkKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGlkO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuTUlESUlucHV0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlESUlucHV0IGlzIGEgd3JhcHBlciBhcm91bmQgYW4gaW5wdXQgb2YgYSBKYXp6IGluc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfbWlkaW1lc3NhZ2VfZXZlbnQgPSByZXF1aXJlKCcuL21pZGltZXNzYWdlX2V2ZW50Jyk7XG5cbnZhciBfbWlkaWNvbm5lY3Rpb25fZXZlbnQgPSByZXF1aXJlKCcuL21pZGljb25uZWN0aW9uX2V2ZW50Jyk7XG5cbnZhciBfbWlkaV9hY2Nlc3MgPSByZXF1aXJlKCcuL21pZGlfYWNjZXNzJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBtaWRpUHJvYyA9IHZvaWQgMDtcbnZhciBub2RlanMgPSAoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLm5vZGVqcztcblxudmFyIE1JRElJbnB1dCA9IGV4cG9ydHMuTUlESUlucHV0ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNSURJSW5wdXQoaW5mbywgaW5zdGFuY2UpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESUlucHV0KTtcblxuICAgIHRoaXMuaWQgPSAoMCwgX21pZGlfYWNjZXNzLmdldE1JRElEZXZpY2VJZCkoaW5mb1swXSwgJ2lucHV0Jyk7XG4gICAgdGhpcy5uYW1lID0gaW5mb1swXTtcbiAgICB0aGlzLm1hbnVmYWN0dXJlciA9IGluZm9bMV07XG4gICAgdGhpcy52ZXJzaW9uID0gaW5mb1syXTtcbiAgICB0aGlzLnR5cGUgPSAnaW5wdXQnO1xuICAgIHRoaXMuc3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSAncGVuZGluZyc7XG5cbiAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UgPSBudWxsO1xuICAgIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBpbXBsaWNpdGx5IG9wZW4gdGhlIGRldmljZSB3aGVuIGFuIG9ubWlkaW1lc3NhZ2UgaGFuZGxlciBnZXRzIGFkZGVkXG4gICAgLy8gd2UgZGVmaW5lIGEgc2V0dGVyIHRoYXQgb3BlbnMgdGhlIGRldmljZSBpZiB0aGUgc2V0IHZhbHVlIGlzIGEgZnVuY3Rpb25cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ29ubWlkaW1lc3NhZ2UnLCB7XG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlID0gdmFsdWU7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IE1hcCgpLnNldCgnbWlkaW1lc3NhZ2UnLCBuZXcgU2V0KCkpLnNldCgnc3RhdGVjaGFuZ2UnLCBuZXcgU2V0KCkpO1xuICAgIHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSA9IGZhbHNlO1xuICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoKTtcblxuICAgIHRoaXMuX2phenpJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgIHRoaXMuX2phenpJbnN0YW5jZS5pbnB1dEluVXNlID0gdHJ1ZTtcblxuICAgIC8vIG9uIExpbnV4IG9wZW5pbmcgYW5kIGNsb3NpbmcgSmF6eiBpbnN0YW5jZXMgY2F1c2VzIHRoZSBwbHVnaW4gdG8gY3Jhc2ggYSBsb3Qgc28gd2Ugb3BlblxuICAgIC8vIHRoZSBkZXZpY2UgaGVyZSBhbmQgZG9uJ3QgY2xvc2UgaXQgd2hlbiBjbG9zZSgpIGlzIGNhbGxlZCwgc2VlIGJlbG93XG4gICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gPT09ICdsaW51eCcpIHtcbiAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpSW5PcGVuKHRoaXMubmFtZSwgbWlkaVByb2MuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElJbnB1dCwgW3tcbiAgICBrZXk6ICdhZGRFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycy5nZXQodHlwZSk7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IGZhbHNlKSB7XG4gICAgICAgIGxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZUV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldCh0eXBlKTtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGlzcGF0Y2hFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZ0KSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldChldnQudHlwZSk7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXIoZXZ0KTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZXZ0LnR5cGUgPT09ICdtaWRpbWVzc2FnZScpIHtcbiAgICAgICAgaWYgKHRoaXMuX29ubWlkaW1lc3NhZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlKGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZXZ0LnR5cGUgPT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgaWYgKHRoaXMub25zdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZShldnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnb3BlbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnb3BlbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlJbk9wZW4odGhpcy5uYW1lLCBtaWRpUHJvYy5iaW5kKHRoaXMpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdvcGVuJztcbiAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjbG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlJbkNsb3NlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnY2xvc2VkJztcbiAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UgPSBudWxsO1xuICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5nZXQoJ21pZGltZXNzYWdlJykuY2xlYXIoKTtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5nZXQoJ3N0YXRlY2hhbmdlJykuY2xlYXIoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfYXBwZW5kVG9TeXNleEJ1ZmZlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9hcHBlbmRUb1N5c2V4QnVmZmVyKGRhdGEpIHtcbiAgICAgIHZhciBvbGRMZW5ndGggPSB0aGlzLl9zeXNleEJ1ZmZlci5sZW5ndGg7XG4gICAgICB2YXIgdG1wQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkob2xkTGVuZ3RoICsgZGF0YS5sZW5ndGgpO1xuICAgICAgdG1wQnVmZmVyLnNldCh0aGlzLl9zeXNleEJ1ZmZlcik7XG4gICAgICB0bXBCdWZmZXIuc2V0KGRhdGEsIG9sZExlbmd0aCk7XG4gICAgICB0aGlzLl9zeXNleEJ1ZmZlciA9IHRtcEJ1ZmZlcjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfYnVmZmVyTG9uZ1N5c2V4JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2J1ZmZlckxvbmdTeXNleChkYXRhLCBpbml0aWFsT2Zmc2V0KSB7XG4gICAgICB2YXIgaiA9IGluaXRpYWxPZmZzZXQ7XG4gICAgICB3aGlsZSAoaiA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGlmIChkYXRhW2pdID09IDB4RjcpIHtcbiAgICAgICAgICAvLyBlbmQgb2Ygc3lzZXghXG4gICAgICAgICAgaisrO1xuICAgICAgICAgIHRoaXMuX2FwcGVuZFRvU3lzZXhCdWZmZXIoZGF0YS5zbGljZShpbml0aWFsT2Zmc2V0LCBqKSk7XG4gICAgICAgICAgcmV0dXJuIGo7XG4gICAgICAgIH1cbiAgICAgICAgaisrO1xuICAgICAgfVxuICAgICAgLy8gZGlkbid0IHJlYWNoIHRoZSBlbmQ7IGp1c3QgdGFjayBpdCBvbi5cbiAgICAgIHRoaXMuX2FwcGVuZFRvU3lzZXhCdWZmZXIoZGF0YS5zbGljZShpbml0aWFsT2Zmc2V0LCBqKSk7XG4gICAgICB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UgPSB0cnVlO1xuICAgICAgcmV0dXJuIGo7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElJbnB1dDtcbn0oKTtcblxubWlkaVByb2MgPSBmdW5jdGlvbiBtaWRpUHJvYyh0aW1lc3RhbXAsIGRhdGEpIHtcbiAgdmFyIGxlbmd0aCA9IDA7XG4gIHZhciBpID0gdm9pZCAwO1xuICB2YXIgaXNTeXNleE1lc3NhZ2UgPSBmYWxzZTtcblxuICAvLyBKYXp6IHNvbWV0aW1lcyBwYXNzZXMgdXMgbXVsdGlwbGUgbWVzc2FnZXMgYXQgb25jZSwgc28gd2UgbmVlZCB0byBwYXJzZSB0aGVtIG91dCBhbmQgcGFzcyB0aGVtIG9uZSBhdCBhIHRpbWUuXG5cbiAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IGxlbmd0aCkge1xuICAgIHZhciBpc1ZhbGlkTWVzc2FnZSA9IHRydWU7XG4gICAgaWYgKHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSkge1xuICAgICAgaSA9IHRoaXMuX2J1ZmZlckxvbmdTeXNleChkYXRhLCBpKTtcbiAgICAgIGlmIChkYXRhW2kgLSAxXSAhPSAweGY3KSB7XG4gICAgICAgIC8vIHJhbiBvZmYgdGhlIGVuZCB3aXRob3V0IGhpdHRpbmcgdGhlIGVuZCBvZiB0aGUgc3lzZXggbWVzc2FnZVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpc1N5c2V4TWVzc2FnZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzU3lzZXhNZXNzYWdlID0gZmFsc2U7XG4gICAgICBzd2l0Y2ggKGRhdGFbaV0gJiAweEYwKSB7XG4gICAgICAgIGNhc2UgMHgwMDpcbiAgICAgICAgICAvLyBDaGV3IHVwIHNwdXJpb3VzIDB4MDAgYnl0ZXMuICBGaXhlcyBhIFdpbmRvd3MgcHJvYmxlbS5cbiAgICAgICAgICBsZW5ndGggPSAxO1xuICAgICAgICAgIGlzVmFsaWRNZXNzYWdlID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAweDgwOiAvLyBub3RlIG9mZlxuICAgICAgICBjYXNlIDB4OTA6IC8vIG5vdGUgb25cbiAgICAgICAgY2FzZSAweEEwOiAvLyBwb2x5cGhvbmljIGFmdGVydG91Y2hcbiAgICAgICAgY2FzZSAweEIwOiAvLyBjb250cm9sIGNoYW5nZVxuICAgICAgICBjYXNlIDB4RTA6XG4gICAgICAgICAgLy8gY2hhbm5lbCBtb2RlXG4gICAgICAgICAgbGVuZ3RoID0gMztcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDB4QzA6IC8vIHByb2dyYW0gY2hhbmdlXG4gICAgICAgIGNhc2UgMHhEMDpcbiAgICAgICAgICAvLyBjaGFubmVsIGFmdGVydG91Y2hcbiAgICAgICAgICBsZW5ndGggPSAyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMHhGMDpcbiAgICAgICAgICBzd2l0Y2ggKGRhdGFbaV0pIHtcbiAgICAgICAgICAgIGNhc2UgMHhmMDpcbiAgICAgICAgICAgICAgLy8gbGV0aWFibGUtbGVuZ3RoIHN5c2V4LlxuICAgICAgICAgICAgICBpID0gdGhpcy5fYnVmZmVyTG9uZ1N5c2V4KGRhdGEsIGkpO1xuICAgICAgICAgICAgICBpZiAoZGF0YVtpIC0gMV0gIT0gMHhmNykge1xuICAgICAgICAgICAgICAgIC8vIHJhbiBvZmYgdGhlIGVuZCB3aXRob3V0IGhpdHRpbmcgdGhlIGVuZCBvZiB0aGUgc3lzZXggbWVzc2FnZVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpc1N5c2V4TWVzc2FnZSA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDB4RjE6IC8vIE1UQyBxdWFydGVyIGZyYW1lXG4gICAgICAgICAgICBjYXNlIDB4RjM6XG4gICAgICAgICAgICAgIC8vIHNvbmcgc2VsZWN0XG4gICAgICAgICAgICAgIGxlbmd0aCA9IDI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIDB4RjI6XG4gICAgICAgICAgICAgIC8vIHNvbmcgcG9zaXRpb24gcG9pbnRlclxuICAgICAgICAgICAgICBsZW5ndGggPSAzO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgbGVuZ3RoID0gMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzVmFsaWRNZXNzYWdlKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YXIgZXZ0ID0ge307XG4gICAgZXZ0LnJlY2VpdmVkVGltZSA9IHBhcnNlRmxvYXQodGltZXN0YW1wLnRvU3RyaW5nKCkpICsgdGhpcy5famF6ekluc3RhbmNlLl9wZXJmVGltZVplcm87XG5cbiAgICBpZiAoaXNTeXNleE1lc3NhZ2UgfHwgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlKSB7XG4gICAgICBldnQuZGF0YSA9IG5ldyBVaW50OEFycmF5KHRoaXMuX3N5c2V4QnVmZmVyKTtcbiAgICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoMCk7XG4gICAgICB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZ0LmRhdGEgPSBuZXcgVWludDhBcnJheShkYXRhLnNsaWNlKGksIGxlbmd0aCArIGkpKTtcbiAgICB9XG5cbiAgICBpZiAobm9kZWpzKSB7XG4gICAgICBpZiAodGhpcy5fb25taWRpbWVzc2FnZSkge1xuICAgICAgICB0aGlzLl9vbm1pZGltZXNzYWdlKGV2dCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlID0gbmV3IF9taWRpbWVzc2FnZV9ldmVudC5NSURJTWVzc2FnZUV2ZW50KHRoaXMsIGV2dC5kYXRhLCBldnQucmVjZWl2ZWRUaW1lKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5NSURJT3V0cHV0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlESU91dHB1dCBpcyBhIHdyYXBwZXIgYXJvdW5kIGFuIG91dHB1dCBvZiBhIEphenogaW5zdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9taWRpX2FjY2VzcyA9IHJlcXVpcmUoJy4vbWlkaV9hY2Nlc3MnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIE1JRElPdXRwdXQgPSBleHBvcnRzLk1JRElPdXRwdXQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1JRElPdXRwdXQoaW5mbywgaW5zdGFuY2UpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESU91dHB1dCk7XG5cbiAgICB0aGlzLmlkID0gKDAsIF9taWRpX2FjY2Vzcy5nZXRNSURJRGV2aWNlSWQpKGluZm9bMF0sICdvdXRwdXQnKTtcbiAgICB0aGlzLm5hbWUgPSBpbmZvWzBdO1xuICAgIHRoaXMubWFudWZhY3R1cmVyID0gaW5mb1sxXTtcbiAgICB0aGlzLnZlcnNpb24gPSBpbmZvWzJdO1xuICAgIHRoaXMudHlwZSA9ICdvdXRwdXQnO1xuICAgIHRoaXMuc3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSAncGVuZGluZyc7XG4gICAgdGhpcy5vbm1pZGltZXNzYWdlID0gbnVsbDtcbiAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSA9IGZhbHNlO1xuICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoKTtcblxuICAgIHRoaXMuX2phenpJbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgIHRoaXMuX2phenpJbnN0YW5jZS5vdXRwdXRJblVzZSA9IHRydWU7XG4gICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gPT09ICdsaW51eCcpIHtcbiAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0T3Blbih0aGlzLm5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhNSURJT3V0cHV0LCBbe1xuICAgIGtleTogJ29wZW4nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgaWYgKHRoaXMuY29ubmVjdGlvbiA9PT0gJ29wZW4nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLnBsYXRmb3JtICE9PSAnbGludXgnKSB7XG4gICAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0T3Blbih0aGlzLm5hbWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ29wZW4nO1xuICAgICAgKDAsIF9taWRpX2FjY2Vzcy5kaXNwYXRjaEV2ZW50KSh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Nsb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnY2xvc2VkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5wbGF0Zm9ybSAhPT0gJ2xpbnV4Jykge1xuICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaU91dENsb3NlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnY2xvc2VkJztcbiAgICAgICgwLCBfbWlkaV9hY2Nlc3MuZGlzcGF0Y2hFdmVudCkodGhpcyk7IC8vIGRpc3BhdGNoIE1JRElDb25uZWN0aW9uRXZlbnQgdmlhIE1JRElBY2Nlc3NcbiAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuY2xlYXIoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZW5kJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZChkYXRhLCB0aW1lc3RhbXApIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBkZWxheUJlZm9yZVNlbmQgPSAwO1xuXG4gICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZXN0YW1wKSB7XG4gICAgICAgIGRlbGF5QmVmb3JlU2VuZCA9IE1hdGguZmxvb3IodGltZXN0YW1wIC0gcGVyZm9ybWFuY2Uubm93KCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZXN0YW1wICYmIGRlbGF5QmVmb3JlU2VuZCA+IDEpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0TG9uZyhkYXRhKTtcbiAgICAgICAgfSwgZGVsYXlCZWZvcmVTZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0TG9uZyhkYXRhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NsZWFyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZEV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICBpZiAodHlwZSAhPT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2xpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaXNwYXRjaEV2ZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldnQpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICBsaXN0ZW5lcihldnQpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLm9uc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlKGV2dCk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1JRElPdXRwdXQ7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTUlESUNvbm5lY3Rpb25FdmVudCA9IGV4cG9ydHMuTUlESUNvbm5lY3Rpb25FdmVudCA9IGZ1bmN0aW9uIE1JRElDb25uZWN0aW9uRXZlbnQobWlkaUFjY2VzcywgcG9ydCkge1xuICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTUlESUNvbm5lY3Rpb25FdmVudCk7XG5cbiAgdGhpcy5idWJibGVzID0gZmFsc2U7XG4gIHRoaXMuY2FuY2VsQnViYmxlID0gZmFsc2U7XG4gIHRoaXMuY2FuY2VsYWJsZSA9IGZhbHNlO1xuICB0aGlzLmN1cnJlbnRUYXJnZXQgPSBtaWRpQWNjZXNzO1xuICB0aGlzLmRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgdGhpcy5ldmVudFBoYXNlID0gMDtcbiAgdGhpcy5wYXRoID0gW107XG4gIHRoaXMucG9ydCA9IHBvcnQ7XG4gIHRoaXMucmV0dXJuVmFsdWUgPSB0cnVlO1xuICB0aGlzLnNyY0VsZW1lbnQgPSBtaWRpQWNjZXNzO1xuICB0aGlzLnRhcmdldCA9IG1pZGlBY2Nlc3M7XG4gIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgdGhpcy50eXBlID0gJ3N0YXRlY2hhbmdlJztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTUlESU1lc3NhZ2VFdmVudCA9IGV4cG9ydHMuTUlESU1lc3NhZ2VFdmVudCA9IGZ1bmN0aW9uIE1JRElNZXNzYWdlRXZlbnQocG9ydCwgZGF0YSwgcmVjZWl2ZWRUaW1lKSB7XG4gIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJTWVzc2FnZUV2ZW50KTtcblxuICB0aGlzLmJ1YmJsZXMgPSBmYWxzZTtcbiAgdGhpcy5jYW5jZWxCdWJibGUgPSBmYWxzZTtcbiAgdGhpcy5jYW5jZWxhYmxlID0gZmFsc2U7XG4gIHRoaXMuY3VycmVudFRhcmdldCA9IHBvcnQ7XG4gIHRoaXMuZGF0YSA9IGRhdGE7XG4gIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICB0aGlzLmV2ZW50UGhhc2UgPSAwO1xuICB0aGlzLnBhdGggPSBbXTtcbiAgdGhpcy5yZWNlaXZlZFRpbWUgPSByZWNlaXZlZFRpbWU7XG4gIHRoaXMucmV0dXJuVmFsdWUgPSB0cnVlO1xuICB0aGlzLnNyY0VsZW1lbnQgPSBwb3J0O1xuICB0aGlzLnRhcmdldCA9IHBvcnQ7XG4gIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgdGhpcy50eXBlID0gJ21pZGltZXNzYWdlJztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX21pZGlfYWNjZXNzID0gcmVxdWlyZSgnLi9taWRpX2FjY2VzcycpO1xuXG52YXIgX21pZGlfaW5wdXQgPSByZXF1aXJlKCcuL21pZGlfaW5wdXQnKTtcblxudmFyIF9taWRpX291dHB1dCA9IHJlcXVpcmUoJy4vbWlkaV9vdXRwdXQnKTtcblxudmFyIF9taWRpbWVzc2FnZV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaW1lc3NhZ2VfZXZlbnQnKTtcblxuLypcbiAgbWFpbiBlbnRyeSBwb2ludFxuKi9cbi8vaW1wb3J0IHtjcmVhdGVNSURJQWNjZXNzLCBjbG9zZUFsbE1JRElJbnB1dHN9IGZyb20gJy4vbWlkaV9hY2Nlc3MnXG4vL2ltcG9ydCB7cG9seWZpbGwsIGdldERldmljZX0gZnJvbSAnLi91dGlsJ1xuXG5cbihmdW5jdGlvbiBpbml0U2hpbSgpIHtcblxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyA9PT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgIGdsb2JhbC5NSURJSW5wdXQgPSBfbWlkaV9pbnB1dC5NSURJSW5wdXQ7XG4gICAgZ2xvYmFsLk1JRElPdXRwdXQgPSBfbWlkaV9vdXRwdXQuTUlESU91dHB1dDtcbiAgICBnbG9iYWwuTUlESU1lc3NhZ2VFdmVudCA9IF9taWRpbWVzc2FnZV9ldmVudC5NSURJTWVzc2FnZUV2ZW50O1xuXG4gICAgLy9wb2x5ZmlsbCgpXG5cbiAgICBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnd2VibWlkaWFwaXNoaW0gMS4wLjEnLCBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MpO1xuICAgICAgcmV0dXJuICgwLCBfbWlkaV9hY2Nlc3MuY3JlYXRlTUlESUFjY2VzcykoKTtcbiAgICB9O1xuICAgIC8qXG4gICAgICAgIGlmKGdldERldmljZSgpLm5vZGVqcyA9PT0gdHJ1ZSl7XG4gICAgICAgICAgbmF2aWdhdG9yLmNsb3NlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vIE5lZWQgdG8gY2xvc2UgTUlESSBpbnB1dCBwb3J0cywgb3RoZXJ3aXNlIE5vZGUuanMgd2lsbCB3YWl0IGZvciBNSURJIGlucHV0IGZvcmV2ZXIuXG4gICAgICAgICAgICBjbG9zZUFsbE1JRElJbnB1dHMoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICovXG4gIH1cbn0pKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nZW5lcmF0ZVVVSUQgPSBnZW5lcmF0ZVVVSUQ7XG5leHBvcnRzLmdldERldmljZSA9IGdldERldmljZTtcbmV4cG9ydHMucG9seWZpbGxQZXJmb3JtYW5jZSA9IHBvbHlmaWxsUGVyZm9ybWFuY2U7XG5leHBvcnRzLnBvbHlmaWxsUHJvbWlzZSA9IHBvbHlmaWxsUHJvbWlzZTtcbmV4cG9ydHMucG9seWZpbGwgPSBwb2x5ZmlsbDtcbi8qXG4gIEEgY29sbGVjdGlvbiBvZiBoYW5keSB1dGlsIG1ldGhvZHNcbiovXG5cbmZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgdmFyIHV1aWQgPSBuZXcgQXJyYXkoNjQpLmpvaW4oJ3gnKTsgLy8neHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4JztcbiAgdXVpZCA9IHV1aWQucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xuICAgIHZhciByID0gKGQgKyBNYXRoLnJhbmRvbSgpICogMTYpICUgMTYgfCAwO1xuICAgIGQgPSBNYXRoLmZsb29yKGQgLyAxNik7XG4gICAgcmV0dXJuIChjID09ICd4JyA/IHIgOiByICYgMHgzIHwgMHg4KS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgfSk7XG4gIHJldHVybiB1dWlkO1xufVxuXG52YXIgZGV2aWNlID0gdm9pZCAwO1xuXG4vLyBjaGVjayBvbiB3aGF0IHR5cGUgb2YgZGV2aWNlIHdlIGFyZSBydW5uaW5nLCBub3RlIHRoYXQgaW4gdGhpcyBjb250ZXh0IGEgZGV2aWNlIGlzIGEgY29tcHV0ZXIgbm90IGEgTUlESSBkZXZpY2VcbmZ1bmN0aW9uIGdldERldmljZSgpIHtcblxuICBpZiAodHlwZW9mIGRldmljZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZGV2aWNlO1xuICB9XG5cbiAgdmFyIHBsYXRmb3JtID0gJ3VuZGV0ZWN0ZWQnLFxuICAgICAgYnJvd3NlciA9ICd1bmRldGVjdGVkJyxcbiAgICAgIG5vZGVqcyA9IGZhbHNlO1xuXG4gIGlmIChuYXZpZ2F0b3Iubm9kZWpzKSB7XG4gICAgcGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtO1xuICAgIGRldmljZSA9IHtcbiAgICAgIHBsYXRmb3JtOiBwbGF0Zm9ybSxcbiAgICAgIG5vZGVqczogdHJ1ZSxcbiAgICAgIG1vYmlsZTogcGxhdGZvcm0gPT09ICdpb3MnIHx8IHBsYXRmb3JtID09PSAnYW5kcm9pZCdcbiAgICB9O1xuICAgIHJldHVybiBkZXZpY2U7XG4gIH1cblxuICB2YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gIGlmICh1YS5tYXRjaCgvKGlQYWR8aVBob25lfGlQb2QpL2cpKSB7XG4gICAgcGxhdGZvcm0gPSAnaW9zJztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdBbmRyb2lkJykgIT09IC0xKSB7XG4gICAgcGxhdGZvcm0gPSAnYW5kcm9pZCc7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignTGludXgnKSAhPT0gLTEpIHtcbiAgICBwbGF0Zm9ybSA9ICdsaW51eCc7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignTWFjaW50b3NoJykgIT09IC0xKSB7XG4gICAgcGxhdGZvcm0gPSAnb3N4JztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdXaW5kb3dzJykgIT09IC0xKSB7XG4gICAgcGxhdGZvcm0gPSAnd2luZG93cyc7XG4gIH1cblxuICBpZiAodWEuaW5kZXhPZignQ2hyb21lJykgIT09IC0xKSB7XG4gICAgLy8gY2hyb21lLCBjaHJvbWl1bSBhbmQgY2FuYXJ5XG4gICAgYnJvd3NlciA9ICdjaHJvbWUnO1xuXG4gICAgaWYgKHVhLmluZGV4T2YoJ09QUicpICE9PSAtMSkge1xuICAgICAgYnJvd3NlciA9ICdvcGVyYSc7XG4gICAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdDaHJvbWl1bScpICE9PSAtMSkge1xuICAgICAgYnJvd3NlciA9ICdjaHJvbWl1bSc7XG4gICAgfVxuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1NhZmFyaScpICE9PSAtMSkge1xuICAgIGJyb3dzZXIgPSAnc2FmYXJpJztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdGaXJlZm94JykgIT09IC0xKSB7XG4gICAgYnJvd3NlciA9ICdmaXJlZm94JztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdUcmlkZW50JykgIT09IC0xKSB7XG4gICAgYnJvd3NlciA9ICdpZSc7XG4gICAgaWYgKHVhLmluZGV4T2YoJ01TSUUgOScpICE9PSAtMSkge1xuICAgICAgYnJvd3NlciA9ICdpZTknO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwbGF0Zm9ybSA9PT0gJ2lvcycpIHtcbiAgICBpZiAodWEuaW5kZXhPZignQ3JpT1MnKSAhPT0gLTEpIHtcbiAgICAgIGJyb3dzZXIgPSAnY2hyb21lJztcbiAgICB9XG4gIH1cblxuICBkZXZpY2UgPSB7XG4gICAgcGxhdGZvcm06IHBsYXRmb3JtLFxuICAgIGJyb3dzZXI6IGJyb3dzZXIsXG4gICAgbW9iaWxlOiBwbGF0Zm9ybSA9PT0gJ2lvcycgfHwgcGxhdGZvcm0gPT09ICdhbmRyb2lkJyxcbiAgICBub2RlanM6IGZhbHNlXG4gIH07XG4gIHJldHVybiBkZXZpY2U7XG59XG5cbmZ1bmN0aW9uIHBvbHlmaWxsUGVyZm9ybWFuY2UoKSB7XG4gIGlmICh0eXBlb2YgcGVyZm9ybWFuY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcGVyZm9ybWFuY2UgPSB7fTtcbiAgfVxuICBEYXRlLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBub3dPZmZzZXQgPSBEYXRlLm5vdygpO1xuICAgICAgaWYgKHR5cGVvZiBwZXJmb3JtYW5jZS50aW1pbmcgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBub3dPZmZzZXQgPSBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0O1xuICAgICAgfVxuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gbm93KCkge1xuICAgICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIG5vd09mZnNldDtcbiAgICAgIH07XG4gICAgfSkoKTtcbiAgfVxufVxuXG4vLyBhIHZlcnkgc2ltcGxlIGltcGxlbWVudGF0aW9uIG9mIGEgUHJvbWlzZSBmb3IgSW50ZXJuZXQgRXhwbG9yZXIgYW5kIE5vZGVqc1xuZnVuY3Rpb24gcG9seWZpbGxQcm9taXNlKHNjb3BlKSB7XG4gIGlmICh0eXBlb2Ygc2NvcGUuUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuXG4gICAgc2NvcGUuUHJvbWlzZSA9IGZ1bmN0aW9uIChleGVjdXRvcikge1xuICAgICAgdGhpcy5leGVjdXRvciA9IGV4ZWN1dG9yO1xuICAgIH07XG5cbiAgICBzY29wZS5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWYgKHR5cGVvZiByZXNvbHZlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlc29sdmUgPSBmdW5jdGlvbiByZXNvbHZlKCkge307XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHJlamVjdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZWplY3QgPSBmdW5jdGlvbiByZWplY3QoKSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICB2YXIgZGV2aWNlID0gZ2V0RGV2aWNlKCk7XG4gIGlmIChkZXZpY2UuYnJvd3NlciA9PT0gJ2llJykge1xuICAgIHBvbHlmaWxsUHJvbWlzZSh3aW5kb3cpO1xuICB9IGVsc2UgaWYgKGRldmljZS5ub2RlanMgPT09IHRydWUpIHtcbiAgICBwb2x5ZmlsbFByb21pc2UoZ2xvYmFsKTtcbiAgfVxuICBwb2x5ZmlsbFBlcmZvcm1hbmNlKCk7XG59IiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMubWFwKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRoaXMubWFwW25hbWVdLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcylcbiAgICAgIH0sIHRoaXMpXG4gICAgfSwgdGhpcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKG5hbWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHsgaXRlbXMucHVzaCh2YWx1ZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIC8vIE9ubHkgc3VwcG9ydCBBcnJheUJ1ZmZlcnMgZm9yIFBPU1QgbWV0aG9kLlxuICAgICAgICAvLyBSZWNlaXZpbmcgQXJyYXlCdWZmZXJzIGhhcHBlbnMgdmlhIEJsb2JzLCBpbnN0ZWFkLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQgOiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG4gICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpKSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gaW5wdXRcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gaGVhZGVycyh4aHIpIHtcbiAgICB2YXIgaGVhZCA9IG5ldyBIZWFkZXJzKClcbiAgICB2YXIgcGFpcnMgPSAoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdFxuICAgICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICAgIHJlcXVlc3QgPSBpbnB1dFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMoeGhyKSxcbiAgICAgICAgICB1cmw6IHJlc3BvbnNlVVJMKClcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiXG4vLyBzdGFuZGFyZCBNSURJIGV2ZW50c1xuY29uc3QgTUlESUV2ZW50VHlwZXMgPSB7fVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09GRicsIHt2YWx1ZTogMHg4MH0pIC8vMTI4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdOT1RFX09OJywge3ZhbHVlOiAweDkwfSkgLy8xNDRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BPTFlfUFJFU1NVUkUnLCB7dmFsdWU6IDB4QTB9KSAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVFJPTF9DSEFOR0UnLCB7dmFsdWU6IDB4QjB9KSAvLzE3NlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUFJPR1JBTV9DSEFOR0UnLCB7dmFsdWU6IDB4QzB9KSAvLzE5MlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ0hBTk5FTF9QUkVTU1VSRScsIHt2YWx1ZTogMHhEMH0pIC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQSVRDSF9CRU5EJywge3ZhbHVlOiAweEUwfSkgLy8yMjRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NZU1RFTV9FWENMVVNJVkUnLCB7dmFsdWU6IDB4RjB9KSAvLzI0MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnTUlESV9USU1FQ09ERScsIHt2YWx1ZTogMjQxfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfUE9TSVRJT04nLCB7dmFsdWU6IDI0Mn0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTT05HX1NFTEVDVCcsIHt2YWx1ZTogMjQzfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RVTkVfUkVRVUVTVCcsIHt2YWx1ZTogMjQ2fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ0VPWCcsIHt2YWx1ZTogMjQ3fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1RJTUlOR19DTE9DSycsIHt2YWx1ZTogMjQ4fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NUQVJUJywge3ZhbHVlOiAyNTB9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQ09OVElOVUUnLCB7dmFsdWU6IDI1MX0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTVE9QJywge3ZhbHVlOiAyNTJ9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnQUNUSVZFX1NFTlNJTkcnLCB7dmFsdWU6IDI1NH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdTWVNURU1fUkVTRVQnLCB7dmFsdWU6IDI1NX0pXG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVEVNUE8nLCB7dmFsdWU6IDB4NTF9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNRV9TSUdOQVRVUkUnLCB7dmFsdWU6IDB4NTh9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU5EX09GX1RSQUNLJywge3ZhbHVlOiAweDJGfSlcblxuZXhwb3J0IHtNSURJRXZlbnRUeXBlc31cbiIsImltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtwYXJzZVNhbXBsZXN9IGZyb20gJy4vcGFyc2VfYXVkaW8nXG5cbmV4cG9ydCBjbGFzcyBDb252b2x1dGlvblJldmVyYntcblxuICBjb25zdHJ1Y3RvcihidWZmZXIpe1xuICAgIHRoaXMuX25vZGVGWCA9IGNvbnRleHQuY3JlYXRlQ29udm9sdmVyKClcblxuICAgIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyKXtcbiAgICAgIHRoaXMuX25vZGVGWC5idWZmZXIgPSBidWZmZXJcbiAgICB9XG4gICAgdGhpcy5pbnB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuXG4gICAgdGhpcy5fZHJ5ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLl93ZXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuXG4gICAgdGhpcy5fZHJ5LmdhaW4udmFsdWUgPSAxXG4gICAgdGhpcy5fd2V0LmdhaW4udmFsdWUgPSAwXG5cbiAgICB0aGlzLmlucHV0LmNvbm5lY3QodGhpcy5fZHJ5KVxuICAgIHRoaXMuX2RyeS5jb25uZWN0KHRoaXMub3V0cHV0KVxuXG4gICAgdGhpcy5pbnB1dC5jb25uZWN0KHRoaXMuX25vZGVGWClcbiAgICB0aGlzLl9ub2RlRlguY29ubmVjdCh0aGlzLl93ZXQpXG4gICAgdGhpcy5fd2V0LmNvbm5lY3QodGhpcy5vdXRwdXQpXG5cbiAgICB0aGlzLmFtb3VudCA9IDBcbiAgfVxuXG4gIGFkZEJ1ZmZlcihidWZmZXIpe1xuICAgIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyID09PSBmYWxzZSl7XG4gICAgICBjb25zb2xlLmxvZygnYXJndW1lbnQgaXMgbm90IGFuIGluc3RhbmNlIG9mIEF1ZGlvQnVmZmVyJywgYnVmZmVyKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX25vZGVGWC5idWZmZXIgPSBidWZmZXJcbiAgfVxuXG4gIGxvYWRCdWZmZXIodXJsKXtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcGFyc2VTYW1wbGVzKHVybClcbiAgICAgIC50aGVuKFxuICAgICAgICBidWZmZXIgPT4ge1xuICAgICAgICAgIGJ1ZmZlciA9IGJ1ZmZlclswXVxuICAgICAgICAgIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyKXtcbiAgICAgICAgICAgIHRoaXMuX25vZGVGWC5idWZmZXIgPSBidWZmZXJcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVqZWN0KCdjb3VsZCBub3QgcGFyc2UgdG8gQXVkaW9CdWZmZXInLCB1cmwpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIHNldEFtb3VudCh2YWx1ZSl7XG4gICAgLypcbiAgICB0aGlzLmFtb3VudCA9IHZhbHVlIDwgMCA/IDAgOiB2YWx1ZSA+IDEgPyAxIDogdmFsdWU7XG4gICAgdmFyIGdhaW4xID0gTWF0aC5jb3ModGhpcy5hbW91bnQgKiAwLjUgKiBNYXRoLlBJKSxcbiAgICAgICAgZ2FpbjIgPSBNYXRoLmNvcygoMS4wIC0gdGhpcy5hbW91bnQpICogMC41ICogTWF0aC5QSSk7XG4gICAgdGhpcy5nYWluTm9kZS5nYWluLnZhbHVlID0gZ2FpbjIgKiB0aGlzLnJhdGlvO1xuICAgICovXG5cbiAgICBpZih2YWx1ZSA8IDApe1xuICAgICAgdmFsdWUgPSAwXG4gICAgfWVsc2UgaWYodmFsdWUgPiAxKXtcbiAgICAgIHZhbHVlID0gMVxuICAgIH1cblxuICAgIHRoaXMuYW1vdW50ID0gdmFsdWVcbiAgICB0aGlzLl93ZXQuZ2Fpbi52YWx1ZSA9IHRoaXMuYW1vdW50XG4gICAgdGhpcy5fZHJ5LmdhaW4udmFsdWUgPSAxIC0gdGhpcy5hbW91bnRcbiAgICAvL2NvbnNvbGUubG9nKCd3ZXQnLHRoaXMud2V0R2Fpbi5nYWluLnZhbHVlLCdkcnknLHRoaXMuZHJ5R2Fpbi5nYWluLnZhbHVlKTtcbiAgfVxufVxuIiwibGV0IGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2ZW50KXtcbiAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlKVxuICBsZXQgbWFwXG5cbiAgaWYoZXZlbnQudHlwZSA9PT0gJ2V2ZW50Jyl7XG4gICAgbGV0IG1pZGlFdmVudCA9IGV2ZW50LmRhdGFcbiAgICBsZXQgbWlkaUV2ZW50VHlwZSA9IG1pZGlFdmVudC50eXBlXG4gICAgLy9jb25zb2xlLmxvZyhtaWRpRXZlbnRUeXBlKVxuICAgIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyhtaWRpRXZlbnRUeXBlKSl7XG4gICAgICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQobWlkaUV2ZW50VHlwZSlcbiAgICAgIGZvcihsZXQgY2Igb2YgbWFwLnZhbHVlcygpKXtcbiAgICAgICAgY2IobWlkaUV2ZW50KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnRMaXN0ZW5lcnMuaGFzKGV2ZW50LnR5cGUpKVxuICBpZihldmVudExpc3RlbmVycy5oYXMoZXZlbnQudHlwZSkgPT09IGZhbHNlKXtcbiAgICByZXR1cm5cbiAgfVxuXG4gIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKVxuICBmb3IobGV0IGNiIG9mIG1hcC52YWx1ZXMoKSl7XG4gICAgY2IoZXZlbnQpXG4gIH1cblxuXG4gIC8vIEB0b2RvOiBydW4gZmlsdGVycyBoZXJlLCBmb3IgaW5zdGFuY2UgaWYgYW4gZXZlbnRsaXN0ZW5lciBoYXMgYmVlbiBhZGRlZCB0byBhbGwgTk9URV9PTiBldmVudHMsIGNoZWNrIHRoZSB0eXBlIG9mIHRoZSBpbmNvbWluZyBldmVudFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgY2FsbGJhY2spe1xuXG4gIGxldCBtYXBcbiAgbGV0IGlkID0gYCR7dHlwZX1fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG5cbiAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpID09PSBmYWxzZSl7XG4gICAgbWFwID0gbmV3IE1hcCgpXG4gICAgZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIG1hcClcbiAgfWVsc2V7XG4gICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpXG4gIH1cblxuICBtYXAuc2V0KGlkLCBjYWxsYmFjaylcbiAgLy9jb25zb2xlLmxvZyhldmVudExpc3RlbmVycylcbiAgcmV0dXJuIGlkXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpe1xuXG4gIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUubG9nKCdubyBldmVudGxpc3RlbmVycyBvZiB0eXBlJyArIHR5cGUpXG4gICAgcmV0dXJuXG4gIH1cblxuICBsZXQgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpXG5cbiAgaWYodHlwZW9mIGlkID09PSAnZnVuY3Rpb24nKXtcbiAgICBmb3IobGV0IFtrZXksIHZhbHVlXSBvZiBtYXAuZW50cmllcygpKSB7XG4gICAgICBjb25zb2xlLmxvZyhrZXksIHZhbHVlKVxuICAgICAgaWYodmFsdWUgPT09IGlkKXtcbiAgICAgICAgY29uc29sZS5sb2coa2V5KVxuICAgICAgICBpZCA9IGtleVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBpZih0eXBlb2YgaWQgPT09ICdzdHJpbmcnKXtcbiAgICAgIG1hcC5kZWxldGUoaWQpXG4gICAgfVxuICB9ZWxzZSBpZih0eXBlb2YgaWQgPT09ICdzdHJpbmcnKXtcbiAgICBtYXAuZGVsZXRlKGlkKVxuICB9ZWxzZXtcbiAgICBjb25zb2xlLmxvZygnY291bGQgbm90IHJlbW92ZSBldmVudGxpc3RlbmVyJylcbiAgfVxufVxuXG4iLCIvLyBmZXRjaCBoZWxwZXJzXG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0dXMocmVzcG9uc2UpIHtcbiAgaWYocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApe1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2UpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0KSlcblxufVxuXG5leHBvcnQgZnVuY3Rpb24ganNvbihyZXNwb25zZSl7XG4gIHJldHVybiByZXNwb25zZS5qc29uKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFycmF5QnVmZmVyKHJlc3BvbnNlKXtcbiAgcmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKClcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hKU09OKHVybCl7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gZmV0Y2godXJsLCB7XG4gICAgLy8gICBtb2RlOiAnbm8tY29ycydcbiAgICAvLyB9KVxuICAgIGZldGNoKHVybClcbiAgICAudGhlbihzdGF0dXMpXG4gICAgLnRoZW4oanNvbilcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJlc29sdmUoZGF0YSlcbiAgICB9KVxuICAgIC5jYXRjaChlID0+IHtcbiAgICAgIHJlamVjdChlKVxuICAgIH0pXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaEFycmF5YnVmZmVyKHVybCl7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gZmV0Y2godXJsLCB7XG4gICAgLy8gICBtb2RlOiAnbm8tY29ycydcbiAgICAvLyB9KVxuICAgIGZldGNoKHVybClcbiAgICAudGhlbihzdGF0dXMpXG4gICAgLnRoZW4oYXJyYXlCdWZmZXIpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICByZXNvbHZlKGRhdGEpXG4gICAgfSlcbiAgICAuY2F0Y2goZSA9PiB7XG4gICAgICByZWplY3QoZSlcbiAgICB9KVxuICB9KVxufVxuIiwiaW1wb3J0IHFhbWJpIGZyb20gJy4vcWFtYmknXG5pbXBvcnQge1Nvbmd9IGZyb20gJy4vc29uZydcbmltcG9ydCB7U2FtcGxlcn0gZnJvbSAnLi9zYW1wbGVyJ1xuaW1wb3J0IHtpbml0QXVkaW99IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7aW5pdE1JREl9IGZyb20gJy4vaW5pdF9taWRpJ1xuaW1wb3J0IHt1cGRhdGVTZXR0aW5nc30gZnJvbSAnLi9zZXR0aW5ncydcblxuZXhwb3J0IGxldCBnZXRVc2VyTWVkaWEgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybignZ2V0VXNlck1lZGlhIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZXhwb3J0IGxldCByQUYgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybigncmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZXhwb3J0IGxldCBCbG9iID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB3aW5kb3cuQmxvYiB8fCB3aW5kb3cud2Via2l0QmxvYlxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybignQmxvYiBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmZ1bmN0aW9uIGxvYWRJbnN0cnVtZW50KGRhdGEpe1xuICBsZXQgc2FtcGxlciA9IG5ldyBTYW1wbGVyKClcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBzYW1wbGVyLnBhcnNlU2FtcGxlRGF0YShkYXRhKVxuICAgIC50aGVuKCgpID0+IHJlc29sdmUoc2FtcGxlcikpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KHNldHRpbmdzID0gbnVsbCk6IHZvaWR7XG5cbiAgLy8gbG9hZCBzZXR0aW5ncy5pbnN0cnVtZW50cyAoYXJyYXkgb3Igb2JqZWN0KVxuICAvLyBsb2FkIHNldHRpbmdzLm1pZGlmaWxlcyAoYXJyYXkgb3Igb2JqZWN0KVxuICAvKlxuXG4gIHFhbWJpLmluaXQoe1xuICAgIHNvbmc6IHtcbiAgICAgIHR5cGU6ICdTb25nJyxcbiAgICAgIHVybDogJy4uL2RhdGEvbWludXRlX3dhbHR6Lm1pZCdcbiAgICB9LFxuICAgIHBpYW5vOiB7XG4gICAgICB0eXBlOiAnSW5zdHJ1bWVudCcsXG4gICAgICB1cmw6ICcuLi8uLi9pbnN0cnVtZW50cy9lbGVjdHJpYy1waWFuby5qc29uJ1xuICAgIH1cbiAgfSlcblxuICBxYW1iaS5pbml0KHtcbiAgICBpbnN0cnVtZW50czogWycuLi9pbnN0cnVtZW50cy9waWFubycsICcuLi9pbnN0cnVtZW50cy92aW9saW4nXSxcbiAgICBtaWRpZmlsZXM6IFsnLi4vbWlkaS9tb3phcnQubWlkJ11cbiAgfSlcbiAgLnRoZW4oKGxvYWRlZCkgPT4ge1xuICAgIGxldCBbcGlhbm8sIHZpb2xpbl0gPSBsb2FkZWQuaW5zdHJ1bWVudHNcbiAgICBsZXQgW21vemFydF0gPSBsb2FkZWQubWlkaWZpbGVzXG4gIH0pXG5cbiAgKi9cblxuICBsZXQgcHJvbWlzZXMgPSBbaW5pdEF1ZGlvKCksIGluaXRNSURJKCldXG4gIGxldCBsb2FkS2V5c1xuXG4gIGlmKHNldHRpbmdzICE9PSBudWxsKXtcblxuICAgIGxvYWRLZXlzID0gT2JqZWN0LmtleXMoc2V0dGluZ3MpXG4gICAgbGV0IGkgPSBsb2FkS2V5cy5pbmRleE9mKCdzZXR0aW5ncycpXG4gICAgaWYoaSAhPT0gLTEpe1xuICAgICAgdXBkYXRlU2V0dGluZ3Moc2V0dGluZ3Muc2V0dGluZ3MpXG4gICAgICBsb2FkS2V5cy5zcGxpY2UoaSwgMSlcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyhsb2FkS2V5cylcblxuICAgIGZvcihsZXQga2V5IG9mIGxvYWRLZXlzKXtcblxuICAgICAgbGV0IGRhdGEgPSBzZXR0aW5nc1trZXldXG5cbiAgICAgIGlmKGRhdGEudHlwZSA9PT0gJ1NvbmcnKXtcbiAgICAgICAgcHJvbWlzZXMucHVzaChTb25nLmZyb21NSURJRmlsZShkYXRhLnVybCkpXG4gICAgICB9ZWxzZSBpZihkYXRhLnR5cGUgPT09ICdJbnN0cnVtZW50Jyl7XG4gICAgICAgIHByb21pc2VzLnB1c2gobG9hZEluc3RydW1lbnQoZGF0YSkpXG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgLnRoZW4oXG4gICAgKHJlc3VsdCkgPT4ge1xuXG4gICAgICBsZXQgcmV0dXJuT2JqID0ge31cblxuICAgICAgcmVzdWx0LmZvckVhY2goKGRhdGEsIGkpID0+IHtcbiAgICAgICAgaWYoaSA9PT0gMCl7XG4gICAgICAgICAgLy8gaW5pdEF1ZGlvXG4gICAgICAgICAgcmV0dXJuT2JqLmxlZ2FjeSA9IGRhdGEubGVnYWN5XG4gICAgICAgICAgcmV0dXJuT2JqLm1wMyA9IGRhdGEubXAzXG4gICAgICAgICAgcmV0dXJuT2JqLm9nZyA9IGRhdGEub2dnXG4gICAgICAgIH1lbHNlIGlmKGkgPT09IDEpe1xuICAgICAgICAgIC8vIGluaXRNSURJXG4gICAgICAgICAgcmV0dXJuT2JqLmphenogPSBkYXRhLmphenpcbiAgICAgICAgICByZXR1cm5PYmoubWlkaSA9IGRhdGEubWlkaVxuICAgICAgICAgIHJldHVybk9iai53ZWJtaWRpID0gZGF0YS53ZWJtaWRpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIC8vIEluc3RydW1lbnRzLCBzYW1wbGVzIG9yIE1JREkgZmlsZXMgdGhhdCBnb3QgbG9hZGVkIGR1cmluZyBpbml0aWFsaXphdGlvblxuICAgICAgICAgIC8vcmVzdWx0W2xvYWRLZXlzW2kgLSAyXV0gPSBkYXRhXG4gICAgICAgICAgcmV0dXJuT2JqW2xvYWRLZXlzW2kgLSAyXV0gPSBkYXRhXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vY29uc29sZS5sb2cocmV0dXJuT2JqLmphenopXG5cbiAgICAgIGlmKHJldHVybk9iai5taWRpID09PSBmYWxzZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdxYW1iaScsIHFhbWJpLnZlcnNpb24sICdbeW91ciBicm93c2VyIGhhcyBubyBzdXBwb3J0IGZvciBNSURJXScpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS5sb2coJ3FhbWJpJywgcWFtYmkudmVyc2lvbilcbiAgICAgIH1cbiAgICAgIHJlc29sdmUocmV0dXJuT2JqKVxuICAgIH0sXG4gICAgKGVycm9yKSA9PiB7XG4gICAgICByZWplY3QoZXJyb3IpXG4gICAgfSlcbiAgfSlcblxuXG4vKlxuICBQcm9taXNlLmFsbChbaW5pdEF1ZGlvKCksIGluaXRNSURJKCldKVxuICAudGhlbihcbiAgKGRhdGEpID0+IHtcbiAgICAvLyBwYXJzZUF1ZGlvXG4gICAgbGV0IGRhdGFBdWRpbyA9IGRhdGFbMF1cblxuICAgIC8vIHBhcnNlTUlESVxuICAgIGxldCBkYXRhTWlkaSA9IGRhdGFbMV1cblxuICAgIGNhbGxiYWNrKHtcbiAgICAgIGxlZ2FjeTogZGF0YUF1ZGlvLmxlZ2FjeSxcbiAgICAgIG1wMzogZGF0YUF1ZGlvLm1wMyxcbiAgICAgIG9nZzogZGF0YUF1ZGlvLm9nZyxcbiAgICAgIG1pZGk6IGRhdGFNaWRpLm1pZGksXG4gICAgICB3ZWJtaWRpOiBkYXRhTWlkaS53ZWJtaWRpLFxuICAgIH0pXG4gIH0sXG4gIChlcnJvcikgPT4ge1xuICAgIGNhbGxiYWNrKGVycm9yKVxuICB9KVxuKi9cbn1cblxuIiwiLypcbiAgU2V0cyB1cCB0aGUgYmFzaWMgYXVkaW8gcm91dGluZywgdGVzdHMgd2hpY2ggYXVkaW8gZm9ybWF0cyBhcmUgc3VwcG9ydGVkIGFuZCBwYXJzZXMgdGhlIHNhbXBsZXMgZm9yIHRoZSBtZXRyb25vbWUgdGlja3MuXG4qL1xuXG5pbXBvcnQgc2FtcGxlcyBmcm9tICcuL3NhbXBsZXMnXG5pbXBvcnQge3BhcnNlU2FtcGxlc30gZnJvbSAnLi9wYXJzZV9hdWRpbydcblxubGV0IGRhdGFcbmxldCBtYXN0ZXJHYWluXG5sZXQgY29tcHJlc3NvclxubGV0IGluaXRpYWxpemVkID0gZmFsc2VcblxuXG5leHBvcnQgbGV0IGNvbnRleHQgPSAoZnVuY3Rpb24oKXtcbiAgLy9jb25zb2xlLmxvZygnaW5pdCBBdWRpb0NvbnRleHQnKVxuICBsZXQgY3R4XG4gIGlmKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKXtcbiAgICBsZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0XG4gICAgaWYoQXVkaW9Db250ZXh0ICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICBjdHggPSBuZXcgQXVkaW9Db250ZXh0KClcbiAgICB9XG4gIH1cbiAgaWYodHlwZW9mIGN0eCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIC8vQFRPRE86IGNyZWF0ZSBkdW1teSBBdWRpb0NvbnRleHQgZm9yIHVzZSBpbiBub2RlLCBzZWU6IGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2F1ZGlvLWNvbnRleHRcbiAgICBjb250ZXh0ID0ge1xuICAgICAgY3JlYXRlR2FpbjogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBnYWluOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjcmVhdGVPc2NpbGxhdG9yOiBmdW5jdGlvbigpe30sXG4gICAgfVxuICB9XG4gIHJldHVybiBjdHhcbn0oKSlcblxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEF1ZGlvKCl7XG5cbiAgaWYodHlwZW9mIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluXG4gIH1cbiAgLy8gY2hlY2sgZm9yIG9sZGVyIGltcGxlbWVudGF0aW9ucyBvZiBXZWJBdWRpb1xuICBkYXRhID0ge31cbiAgbGV0IHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgZGF0YS5sZWdhY3kgPSBmYWxzZVxuICBpZih0eXBlb2Ygc291cmNlLnN0YXJ0ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZGF0YS5sZWdhY3kgPSB0cnVlXG4gIH1cblxuICAvLyBzZXQgdXAgdGhlIGVsZW1lbnRhcnkgYXVkaW8gbm9kZXNcbiAgY29tcHJlc3NvciA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKClcbiAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICBtYXN0ZXJHYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gMC41XG4gIGluaXRpYWxpemVkID0gdHJ1ZVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICBwYXJzZVNhbXBsZXMoc2FtcGxlcykudGhlbihcbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGJ1ZmZlcnMpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKGJ1ZmZlcnMpXG4gICAgICAgIC8vIGRhdGEub2dnID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlPZ2cgIT09ICd1bmRlZmluZWQnXG4gICAgICAgIC8vIGRhdGEubXAzID0gdHlwZW9mIGJ1ZmZlcnMuZW1wdHlNcDMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgIGRhdGEubG93dGljayA9IGJ1ZmZlcnMubG93dGlja1xuICAgICAgICBkYXRhLmhpZ2h0aWNrID0gYnVmZmVycy5oaWdodGlja1xuICAgICAgICBpZihkYXRhLm9nZyA9PT0gZmFsc2UgJiYgZGF0YS5tcDMgPT09IGZhbHNlKXtcbiAgICAgICAgICByZWplY3QoJ05vIHN1cHBvcnQgZm9yIG9nZyBub3IgbXAzIScpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJlc29sdmUoZGF0YSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoKXtcbiAgICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSBpbml0aWFsaXppbmcgQXVkaW8nKVxuICAgICAgfVxuICAgIClcbiAgfSlcbn1cblxuXG5sZXQgc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24odmFsdWU6IG51bWJlciA9IDAuNSk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24odmFsdWU6IG51bWJlciA9IDAuNSl7XG4gICAgICBpZih2YWx1ZSA+IDEpe1xuICAgICAgICBjb25zb2xlLmluZm8oJ21heGltYWwgdm9sdW1lIGlzIDEuMCwgdm9sdW1lIGlzIHNldCB0byAxLjAnKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUgPCAwID8gMCA6IHZhbHVlID4gMSA/IDEgOiB2YWx1ZVxuICAgICAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldE1hc3RlclZvbHVtZSh2YWx1ZSlcbiAgfVxufVxuXG5cbmxldCBnZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbWFzdGVyR2Fpbi5nYWluLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRNYXN0ZXJWb2x1bWUoKVxuICB9XG59XG5cblxubGV0IGdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gY29tcHJlc3Nvci5yZWR1Y3Rpb24udmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIGdldENvbXByZXNzaW9uUmVkdWN0aW9uKClcbiAgfVxufVxuXG5cbmxldCBlbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBlbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oZmxhZzogYm9vbGVhbil7XG4gICAgICBpZihmbGFnKXtcbiAgICAgICAgbWFzdGVyR2Fpbi5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmNvbm5lY3QoY29tcHJlc3Nvcik7XG4gICAgICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIGVuYWJsZU1hc3RlckNvbXByZXNzb3IoKVxuICB9XG59XG5cblxubGV0IGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihjZmcpOiB2b2lke1xuICAvKlxuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGF0dGFjazsgLy8gaW4gU2Vjb25kc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGtuZWU7IC8vIGluIERlY2liZWxzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmF0aW87IC8vIHVuaXQtbGVzc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlZHVjdGlvbjsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWxlYXNlOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gdGhyZXNob2xkOyAvLyBpbiBEZWNpYmVsc1xuXG4gICAgQHNlZTogaHR0cDovL3dlYmF1ZGlvLmdpdGh1Yi5pby93ZWItYXVkaW8tYXBpLyN0aGUtZHluYW1pY3Njb21wcmVzc29ybm9kZS1pbnRlcmZhY2VcbiAgKi9cbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oY2ZnOiB7fSl7XG4gICAgICAoe1xuICAgICAgICBhdHRhY2s6IGNvbXByZXNzb3IuYXR0YWNrID0gMC4wMDMsXG4gICAgICAgIGtuZWU6IGNvbXByZXNzb3Iua25lZSA9IDMwLFxuICAgICAgICByYXRpbzogY29tcHJlc3Nvci5yYXRpbyA9IDEyLFxuICAgICAgICByZWR1Y3Rpb246IGNvbXByZXNzb3IucmVkdWN0aW9uID0gMCxcbiAgICAgICAgcmVsZWFzZTogY29tcHJlc3Nvci5yZWxlYXNlID0gMC4yNTAsXG4gICAgICAgIHRocmVzaG9sZDogY29tcHJlc3Nvci50aHJlc2hvbGQgPSAtMjQsXG4gICAgICB9ID0gY2ZnKVxuICAgIH1cbiAgICBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yKGNmZylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5pdERhdGEoKXtcbiAgcmV0dXJuIGRhdGFcbn1cblxuLy8gdGhpcyBkb2Vzbid0IHNlZW0gdG8gYmUgbmVjZXNzYXJ5IGFueW1vcmUgb24gaU9TIGFueW1vcmVcbmxldCB1bmxvY2tXZWJBdWRpbyA9IGZ1bmN0aW9uKCl7XG4gIGxldCBzcmMgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKVxuICBsZXQgZ2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICBnYWluTm9kZS5nYWluLnZhbHVlID0gMFxuICBzcmMuY29ubmVjdChnYWluTm9kZSlcbiAgZ2Fpbk5vZGUuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICBpZih0eXBlb2Ygc3JjLm5vdGVPbiAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHNyYy5zdGFydCA9IHNyYy5ub3RlT25cbiAgICBzcmMuc3RvcCA9IHNyYy5ub3RlT2ZmXG4gIH1cbiAgc3JjLnN0YXJ0KDApXG4gIHNyYy5zdG9wKDAuMDAxKVxuICB1bmxvY2tXZWJBdWRpbyA9IGZ1bmN0aW9uKCl7XG4gICAgLy9jb25zb2xlLmxvZygnYWxyZWFkeSBkb25lJylcbiAgfVxufVxuXG5leHBvcnQge21hc3RlckdhaW4sIHVubG9ja1dlYkF1ZGlvLCBjb21wcmVzc29yIGFzIG1hc3RlckNvbXByZXNzb3IsIHNldE1hc3RlclZvbHVtZSwgZ2V0TWFzdGVyVm9sdW1lLCBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiwgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciwgY29uZmlndXJlTWFzdGVyQ29tcHJlc3Nvcn1cbiIsIi8qXG4gIFJlcXVlc3RzIE1JREkgYWNjZXNzLCBxdWVyaWVzIGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgYW5kIHN0b3JlcyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxuKi9cblxuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgJ3dlYm1pZGlhcGlzaGltJyAvLyB5b3UgY2FuIGFsc28gZW1iZWQgdGhlIHNoaW0gYXMgYSBzdGFuZC1hbG9uZSBzY3JpcHQgaW4gdGhlIGh0bWwsIHRoZW4geW91IGNhbiBjb21tZW50IHRoaXMgbGluZSBvdXRcblxubGV0IE1JRElBY2Nlc3NcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlXG5sZXQgaW5wdXRzID0gW11cbmxldCBvdXRwdXRzID0gW11cbmxldCBpbnB1dElkcyA9IFtdXG5sZXQgb3V0cHV0SWRzID0gW11cbmxldCBpbnB1dHNCeUlkID0gbmV3IE1hcCgpXG5sZXQgb3V0cHV0c0J5SWQgPSBuZXcgTWFwKClcblxubGV0IHNvbmdNaWRpRXZlbnRMaXN0ZW5lclxubGV0IG1pZGlFdmVudExpc3RlbmVySWQgPSAwXG5cblxuZnVuY3Rpb24gZ2V0TUlESXBvcnRzKCl7XG4gIGlucHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5pbnB1dHMudmFsdWVzKCkpXG5cbiAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gIGlucHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSlcblxuICBmb3IobGV0IHBvcnQgb2YgaW5wdXRzKXtcbiAgICBpbnB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KVxuICAgIGlucHV0SWRzLnB1c2gocG9ydC5pZClcbiAgfVxuXG4gIG91dHB1dHMgPSBBcnJheS5mcm9tKE1JRElBY2Nlc3Mub3V0cHV0cy52YWx1ZXMoKSlcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgb3V0cHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSlcblxuICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gIGZvcihsZXQgcG9ydCBvZiBvdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKHBvcnQuaWQsIHBvcnQubmFtZSlcbiAgICBvdXRwdXRzQnlJZC5zZXQocG9ydC5pZCwgcG9ydClcbiAgICBvdXRwdXRJZHMucHVzaChwb3J0LmlkKVxuICB9XG4gIC8vY29uc29sZS5sb2cob3V0cHV0c0J5SWQpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNSURJKCl7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICBsZXQgamF6eiA9IGZhbHNlXG4gICAgbGV0IG1pZGkgPSBmYWxzZVxuICAgIGxldCB3ZWJtaWRpID0gZmFsc2VcblxuICAgIGlmKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgcmVzb2x2ZSh7bWlkaX0pXG4gICAgfWVsc2UgaWYodHlwZW9mIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyAhPT0gJ3VuZGVmaW5lZCcpe1xuXG5cbiAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcygpLnRoZW4oXG5cbiAgICAgICAgZnVuY3Rpb24gb25GdWxGaWxsZWQobWlkaUFjY2Vzcyl7XG4gICAgICAgICAgTUlESUFjY2VzcyA9IG1pZGlBY2Nlc3NcbiAgICAgICAgICAvLyBAVE9ETzogaW1wbGVtZW50IHNvbWV0aGluZyBpbiB3ZWJtaWRpYXBpc2hpbSB0aGF0IGFsbG93cyB1cyB0byBkZXRlY3QgdGhlIEphenogcGx1Z2luIHZlcnNpb25cbiAgICAgICAgICBpZih0eXBlb2YgbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlcyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2phenonKVxuICAgICAgICAgICAgamF6eiA9IG1pZGlBY2Nlc3MuX2phenpJbnN0YW5jZXNbMF0uX0phenoudmVyc2lvblxuICAgICAgICAgICAgbWlkaSA9IHRydWVcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHdlYm1pZGkgPSB0cnVlXG4gICAgICAgICAgICBtaWRpID0gdHJ1ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGdldE1JRElwb3J0cygpXG5cbiAgICAgICAgICAvLyBvbmNvbm5lY3QgYW5kIG9uZGlzY29ubmVjdCBhcmUgbm90IHlldCBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgYW5kIENocm9taXVtXG4gICAgICAgICAgbWlkaUFjY2Vzcy5vbmNvbm5lY3QgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgY29ubmVjdGVkJywgZSlcbiAgICAgICAgICAgIGdldE1JRElwb3J0cygpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWlkaUFjY2Vzcy5vbmRpc2Nvbm5lY3QgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgZGlzY29ubmVjdGVkJywgZSlcbiAgICAgICAgICAgIGdldE1JRElwb3J0cygpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICBqYXp6LFxuICAgICAgICAgICAgbWlkaSxcbiAgICAgICAgICAgIHdlYm1pZGksXG4gICAgICAgICAgICBpbnB1dHMsXG4gICAgICAgICAgICBvdXRwdXRzLFxuICAgICAgICAgICAgaW5wdXRzQnlJZCxcbiAgICAgICAgICAgIG91dHB1dHNCeUlkLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3QoZSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhlKVxuICAgICAgICAgIC8vcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSByZXF1ZXN0aW5nIE1JRElBY2Nlc3MnLCBlKVxuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgICAgIHJlc29sdmUoe21pZGksIGphenp9KVxuICAgICAgICB9XG4gICAgICApXG4gICAgLy8gYnJvd3NlcnMgd2l0aG91dCBXZWJNSURJIEFQSVxuICAgIH1lbHNle1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICByZXNvbHZlKHttaWRpfSlcbiAgICB9XG4gIH0pXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJQWNjZXNzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJQWNjZXNzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBNSURJQWNjZXNzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJQWNjZXNzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0c1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gaW5wdXRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBvdXRwdXRJZHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElPdXRwdXRJZHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUlucHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGlucHV0SWRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRJZHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbihpZDogc3RyaW5nKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0QnlJZCA9IGZ1bmN0aW9uKF9pZCl7XG4gICAgICByZXR1cm4gb3V0cHV0c0J5SWQuZ2V0KF9pZClcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElPdXRwdXRCeUlkKGlkKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElJbnB1dEJ5SWQgPSBmdW5jdGlvbihfaWQpe1xuICAgICAgcmV0dXJuIGlucHV0c0J5SWQuZ2V0KF9pZClcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElJbnB1dEJ5SWQoaWQpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuLypcbmV4cG9ydCBmdW5jdGlvbiBpbml0TWlkaVNvbmcoc29uZyl7XG5cbiAgc29uZ01pZGlFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSl7XG4gICAgLy9jb25zb2xlLmxvZyhlKVxuICAgIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBlLCB0aGlzKTtcbiAgfTtcblxuICAvLyBieSBkZWZhdWx0IGEgc29uZyBsaXN0ZW5zIHRvIGFsbCBhdmFpbGFibGUgbWlkaS1pbiBwb3J0c1xuICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcblxuICBvdXRwdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpSW5wdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IGlucHV0ID0gaW5wdXRzLmdldChpZCk7XG5cbiAgaWYoaW5wdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBpbnB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlJbnB1dHMuZGVsZXRlKGlkKTtcbiAgICBpbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1lbHNle1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQoaWQsIGlucHV0KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpSW5wdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlPdXRwdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IG91dHB1dCA9IG91dHB1dHMuZ2V0KGlkKTtcblxuICBpZihvdXRwdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBvdXRwdXQgd2l0aCBpZCcsIGlkLCAnZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihmbGFnID09PSBmYWxzZSl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5kZWxldGUoaWQpO1xuICAgIGxldCB0aW1lID0gc29uZy5zY2hlZHVsZXIubGFzdEV2ZW50VGltZSArIDEwMDtcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWUpOyAvLyBzdG9wIGFsbCBub3Rlc1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZSk7IC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICB9ZWxzZXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChpZCwgb3V0cHV0KTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlPdXRwdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIG1pZGlNZXNzYWdlRXZlbnQsIGlucHV0KXtcbiAgbGV0IG1pZGlFdmVudCA9IG5ldyBNaWRpRXZlbnQoc29uZy50aWNrcywgLi4ubWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5taWRpSW5wdXRzLCBpbnB1dCk7XG5cblxuICAgIC8vaWYobWlkaUV2ZW50LmNoYW5uZWwgPT09IHRyYWNrLmNoYW5uZWwgfHwgdHJhY2suY2hhbm5lbCA9PT0gMCB8fCB0cmFjay5jaGFubmVsID09PSAnYW55Jyl7XG4gICAgLy8gIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjayk7XG4gICAgLy99XG5cblxuICAgIC8vIGxpa2UgaW4gQ3ViYXNlLCBtaWRpIGV2ZW50cyBmcm9tIGFsbCBkZXZpY2VzLCBzZW50IG9uIGFueSBtaWRpIGNoYW5uZWwgYXJlIGZvcndhcmRlZCB0byBhbGwgdHJhY2tzXG4gICAgLy8gc2V0IHRyYWNrLm1vbml0b3IgdG8gZmFsc2UgaWYgeW91IGRvbid0IHdhbnQgdG8gcmVjZWl2ZSBtaWRpIGV2ZW50cyBvbiBhIGNlcnRhaW4gdHJhY2tcbiAgICAvLyBub3RlIHRoYXQgdHJhY2subW9uaXRvciBpcyBieSBkZWZhdWx0IHNldCB0byBmYWxzZSBhbmQgdGhhdCB0cmFjay5tb25pdG9yIGlzIGF1dG9tYXRpY2FsbHkgc2V0IHRvIHRydWVcbiAgICAvLyBpZiB5b3UgYXJlIHJlY29yZGluZyBvbiB0aGF0IHRyYWNrXG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5tb25pdG9yLCB0cmFjay5pZCwgaW5wdXQuaWQpO1xuICAgIGlmKHRyYWNrLm1vbml0b3IgPT09IHRydWUgJiYgdHJhY2subWlkaUlucHV0cy5nZXQoaW5wdXQuaWQpICE9PSB1bmRlZmluZWQpe1xuICAgICAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrLCBpbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgbGV0IGxpc3RlbmVycyA9IHNvbmcubWlkaUV2ZW50TGlzdGVuZXJzLmdldChtaWRpRXZlbnQudHlwZSk7XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBmb3IobGV0IGxpc3RlbmVyIG9mIGxpc3RlbmVycyl7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKHRyYWNrLCBtaWRpRXZlbnQsIGlucHV0KXtcbiAgbGV0IHNvbmcgPSB0cmFjay5zb25nLFxuICAgIG5vdGUsIGxpc3RlbmVycywgY2hhbm5lbDtcbiAgICAvL2RhdGEgPSBtaWRpTWVzc2FnZUV2ZW50LmRhdGEsXG4gICAgLy9taWRpRXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoc29uZy50aWNrcywgZGF0YVswXSwgZGF0YVsxXSwgZGF0YVsyXSk7XG5cbiAgLy9taWRpRXZlbnQuc291cmNlID0gbWlkaU1lc3NhZ2VFdmVudC5zcmNFbGVtZW50Lm5hbWU7XG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudClcbiAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCBtaWRpRXZlbnQudHlwZSk7XG5cbiAgLy8gYWRkIHRoZSBleGFjdCB0aW1lIG9mIHRoaXMgZXZlbnQgc28gd2UgY2FuIGNhbGN1bGF0ZSBpdHMgdGlja3MgcG9zaXRpb25cbiAgbWlkaUV2ZW50LnJlY29yZE1pbGxpcyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwOyAvLyBtaWxsaXNcbiAgbWlkaUV2ZW50LnN0YXRlID0gJ3JlY29yZGVkJztcblxuICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICBub3RlID0gY3JlYXRlTWlkaU5vdGUobWlkaUV2ZW50KTtcbiAgICB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdID0gbm90ZTtcbiAgICAvL3RyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF0gPSBub3RlO1xuICB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICBub3RlID0gdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvLyBjaGVjayBpZiB0aGUgbm90ZSBleGlzdHM6IGlmIHRoZSB1c2VyIHBsYXlzIG5vdGVzIG9uIGhlciBrZXlib2FyZCBiZWZvcmUgdGhlIG1pZGkgc3lzdGVtIGhhc1xuICAgIC8vIGJlZW4gZnVsbHkgaW5pdGlhbGl6ZWQsIGl0IGNhbiBoYXBwZW4gdGhhdCB0aGUgZmlyc3QgaW5jb21pbmcgbWlkaSBldmVudCBpcyBhIE5PVEUgT0ZGIGV2ZW50XG4gICAgaWYobm90ZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm90ZS5hZGROb3RlT2ZmKG1pZGlFdmVudCk7XG4gICAgZGVsZXRlIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy9kZWxldGUgdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXTtcbiAgfVxuXG4gIC8vY29uc29sZS5sb2coc29uZy5wcmVyb2xsLCBzb25nLnJlY29yZGluZywgdHJhY2sucmVjb3JkRW5hYmxlZCk7XG5cbiAgaWYoKHNvbmcucHJlcm9sbGluZyB8fCBzb25nLnJlY29yZGluZykgJiYgdHJhY2sucmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKXtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIHRyYWNrLnNvbmcucmVjb3JkZWROb3Rlcy5wdXNoKG5vdGUpO1xuICAgIH1cbiAgICB0cmFjay5yZWNvcmRQYXJ0LmFkZEV2ZW50KG1pZGlFdmVudCk7XG4gICAgLy8gc29uZy5yZWNvcmRlZEV2ZW50cyBpcyB1c2VkIGluIHRoZSBrZXkgZWRpdG9yXG4gICAgdHJhY2suc29uZy5yZWNvcmRlZEV2ZW50cy5wdXNoKG1pZGlFdmVudCk7XG4gIH1lbHNlIGlmKHRyYWNrLmVuYWJsZVJldHJvc3BlY3RpdmVSZWNvcmRpbmcpe1xuICAgIHRyYWNrLnJldHJvc3BlY3RpdmVSZWNvcmRpbmcucHVzaChtaWRpRXZlbnQpO1xuICB9XG5cbiAgLy8gY2FsbCBhbGwgbWlkaSBldmVudCBsaXN0ZW5lcnNcbiAgbGlzdGVuZXJzID0gdHJhY2subWlkaUV2ZW50TGlzdGVuZXJzW21pZGlFdmVudC50eXBlXTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIG9iamVjdEZvckVhY2gobGlzdGVuZXJzLCBmdW5jdGlvbihsaXN0ZW5lcil7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoYW5uZWwgPSB0cmFjay5jaGFubmVsO1xuICBpZihjaGFubmVsID09PSAnYW55JyB8fCBjaGFubmVsID09PSB1bmRlZmluZWQgfHwgaXNOYU4oY2hhbm5lbCkgPT09IHRydWUpe1xuICAgIGNoYW5uZWwgPSAwO1xuICB9XG5cbiAgb2JqZWN0Rm9yRWFjaCh0cmFjay5taWRpT3V0cHV0cywgZnVuY3Rpb24ob3V0cHV0KXtcbiAgICAvL2NvbnNvbGUubG9nKCdtaWRpIG91dCcsIG91dHB1dCwgbWlkaUV2ZW50LnR5cGUpO1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjggfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE0NCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyKTtcbiAgICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgICAvLyB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTkyKXtcbiAgICAvLyAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExXSk7XG4gICAgfVxuICAgIC8vb3V0cHV0LnNlbmQoW21pZGlFdmVudC5zdGF0dXMgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICB9KTtcblxuICAvLyBAVE9ETzogbWF5YmUgYSB0cmFjayBzaG91bGQgYmUgYWJsZSB0byBzZW5kIGl0cyBldmVudCB0byBib3RoIGEgbWlkaS1vdXQgcG9ydCBhbmQgYW4gaW50ZXJuYWwgaGVhcnRiZWF0IHNvbmc/XG4gIC8vY29uc29sZS5sb2codHJhY2sucm91dGVUb01pZGlPdXQpO1xuICBpZih0cmFjay5yb3V0ZVRvTWlkaU91dCA9PT0gZmFsc2Upe1xuICAgIG1pZGlFdmVudC50cmFjayA9IHRyYWNrO1xuICAgIHRyYWNrLmluc3RydW1lbnQucHJvY2Vzc0V2ZW50KG1pZGlFdmVudCk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBhZGRNaWRpRXZlbnRMaXN0ZW5lciguLi5hcmdzKXsgLy8gY2FsbGVyIGNhbiBiZSBhIHRyYWNrIG9yIGEgc29uZ1xuXG4gIGxldCBpZCA9IG1pZGlFdmVudExpc3RlbmVySWQrKztcbiAgbGV0IGxpc3RlbmVyO1xuICAgIHR5cGVzID0ge30sXG4gICAgaWRzID0gW10sXG4gICAgbG9vcDtcblxuXG4gIC8vIHNob3VsZCBJIGlubGluZSB0aGlzP1xuICBsb29wID0gZnVuY3Rpb24oYXJncyl7XG4gICAgZm9yKGxldCBhcmcgb2YgYXJncyl7XG4gICAgICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcoYXJnKTtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgICBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgbG9vcChhcmcpO1xuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgIGxpc3RlbmVyID0gYXJnO1xuICAgICAgfWVsc2UgaWYoaXNOYU4oYXJnKSA9PT0gZmFsc2Upe1xuICAgICAgICBhcmcgPSBwYXJzZUludChhcmcsIDEwKTtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgYXJnID0gc2VxdWVuY2VyLm1pZGlFdmVudE51bWJlckJ5TmFtZShhcmcpO1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgbG9vcChhcmdzLCAwLCBhcmdzLmxlbmd0aCk7XG4gIC8vY29uc29sZS5sb2coJ3R5cGVzJywgdHlwZXMsICdsaXN0ZW5lcicsIGxpc3RlbmVyKTtcblxuICBvYmplY3RGb3JFYWNoKHR5cGVzLCBmdW5jdGlvbih0eXBlKXtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgIGlmKG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID0ge307XG4gICAgfVxuICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdID0gbGlzdGVuZXI7XG4gICAgaWRzLnB1c2godHlwZSArICdfJyArIGlkKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhvYmoubWlkaUV2ZW50TGlzdGVuZXJzKTtcbiAgcmV0dXJuIGlkcy5sZW5ndGggPT09IDEgPyBpZHNbMF0gOiBpZHM7XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXIoaWQsIG9iail7XG4gIHZhciB0eXBlO1xuICBpZCA9IGlkLnNwbGl0KCdfJyk7XG4gIHR5cGUgPSBpZFswXTtcbiAgaWQgPSBpZFsxXTtcbiAgZGVsZXRlIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVycygpe1xuXG59XG5cbiovXG4iLCJpbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5leHBvcnQgY2xhc3MgSW5zdHJ1bWVudHtcblxuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICB0aGlzLm91dHB1dCA9IG51bGxcbiAgfVxuXG4gIC8vIG1hbmRhdG9yeVxuICBjb25uZWN0KG91dHB1dCl7XG4gICAgdGhpcy5vdXRwdXQgPSBvdXRwdXRcbiAgfVxuXG4gIC8vIG1hbmRhdG9yeVxuICBkaXNjb25uZWN0KCl7XG4gICAgdGhpcy5vdXRwdXQgPSBudWxsXG4gIH1cblxuICAvLyBtYW5kYXRvcnlcbiAgcHJvY2Vzc01JRElFdmVudChldmVudCl7XG4gICAgbGV0IHRpbWUgPSBldmVudC50aW1lIC8gMTAwMFxuICAgIGxldCBzYW1wbGVcblxuICAgIGlmKGlzTmFOKHRpbWUpKXtcbiAgICAgIC8vIHRoaXMgc2hvdWxkbid0IGhhcHBlblxuICAgICAgY29uc29sZS5lcnJvcignaW52YWxpZCB0aW1lIHZhbHVlJylcbiAgICAgIHJldHVyblxuICAgICAgLy90aW1lID0gY29udGV4dC5jdXJyZW50VGltZVxuICAgIH1cblxuICAgIGlmKHRpbWUgPT09IDApe1xuICAgICAgLy8gdGhpcyBzaG91bGRuJ3QgaGFwcGVuIC0+IGV4dGVybmFsIE1JREkga2V5Ym9hcmRzXG4gICAgICBjb25zb2xlLmVycm9yKCdzaG91bGQgbm90IGhhcHBlbicpXG4gICAgICB0aW1lID0gY29udGV4dC5jdXJyZW50VGltZVxuICAgIH1cblxuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAvL2NvbnNvbGUubG9nKDE0NCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG5cbiAgICAgIHNhbXBsZSA9IHRoaXMuY3JlYXRlU2FtcGxlKGV2ZW50KVxuICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLnNldChldmVudC5taWRpTm90ZUlkLCBzYW1wbGUpXG4gICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZSlcbiAgICAgIHNhbXBsZS5vdXRwdXQuY29ubmVjdCh0aGlzLm91dHB1dClcbiAgICAgIHNhbXBsZS5zdGFydCh0aW1lKVxuICAgICAgLy9jb25zb2xlLmxvZygnc2NoZWR1bGluZycsIGV2ZW50LmlkLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgLy9jb25zb2xlLmxvZygnc3RhcnQnLCBldmVudC5taWRpTm90ZUlkKVxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAvL2NvbnNvbGUubG9nKDEyOCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG4gICAgICBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZ2V0KGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICBpZih0eXBlb2Ygc2FtcGxlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKCdzYW1wbGUgbm90IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkLCAnIG1pZGlOb3RlJywgZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyB3ZSBkb24ndCB3YW50IHRoYXQgdGhlIHN1c3RhaW4gcGVkYWwgcHJldmVudHMgdGhlIGFuIGV2ZW50IHRvIHVuc2NoZWR1bGVkXG4gICAgICBpZih0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc2FtcGxlLnN0b3AodGltZSwgKCkgPT4ge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdzdG9wJywgdGltZSwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgICBzYW1wbGUub3V0cHV0LmRpc2Nvbm5lY3QoKVxuICAgICAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5kZWxldGUoZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgfSlcbiAgICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgICAgfVxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAvLyBzdXN0YWluIHBlZGFsXG4gICAgICBpZihldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICBpZihldmVudC5kYXRhMiA9PT0gMTI3KXtcbiAgICAgICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSB0cnVlXG4gICAgICAgICAgLy8vKlxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbCcsXG4gICAgICAgICAgICBkYXRhOiAnZG93bidcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vKi9cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIGRvd24nKVxuICAgICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMCl7XG4gICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMuZm9yRWFjaCgobWlkaU5vdGVJZCkgPT4ge1xuICAgICAgICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmdldChtaWRpTm90ZUlkKVxuICAgICAgICAgICAgaWYoc2FtcGxlKXtcbiAgICAgICAgICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgICAgICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIG1pZGlOb3RlSWQpXG4gICAgICAgICAgICAgICAgc2FtcGxlLm91dHB1dC5kaXNjb25uZWN0KClcbiAgICAgICAgICAgICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZGVsZXRlKG1pZGlOb3RlSWQpXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIHVwJywgdGhpcy5zdXN0YWluZWRTYW1wbGVzKVxuICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgICAgICAgLy8vKlxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbCcsXG4gICAgICAgICAgICBkYXRhOiAndXAnXG4gICAgICAgICAgfSlcbiAgICAgICAgICAvLyovXG4gICAgICAgICAgLy90aGlzLnN0b3BTdXN0YWluKHRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgIC8vIHBhbm5pbmdcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGExID09PSAxMCl7XG4gICAgICAgIC8vIHBhbm5pbmcgaXMgKm5vdCogZXhhY3RseSB0aW1lZCAtPiBub3QgcG9zc2libGUgKHlldCkgd2l0aCBXZWJBdWRpb1xuICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEyLCByZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuICAgICAgICAvL3RyYWNrLnNldFBhbm5pbmcocmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcblxuICAgICAgLy8gdm9sdW1lXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gNyl7XG4gICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICBpZih0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpe1xuICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICBkYXRhOiAndXAnXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmZvckVhY2goc2FtcGxlID0+IHtcbiAgICAgIHNhbXBsZS5zdG9wKGNvbnRleHQuY3VycmVudFRpbWUpXG4gICAgICBzYW1wbGUub3V0cHV0LmRpc2Nvbm5lY3QoKVxuICAgIH0pXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmNsZWFyKClcbiAgfVxuXG4gIC8vIG1hbmRhdG9yeVxuICB1bnNjaGVkdWxlKG1pZGlFdmVudCl7XG4gICAgbGV0IHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5nZXQobWlkaUV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgaWYoc2FtcGxlKXtcbiAgICAgIHNhbXBsZS5zdG9wKGNvbnRleHQuY3VycmVudFRpbWUpXG4gICAgICBzYW1wbGUub3V0cHV0LmRpc2Nvbm5lY3QoKVxuICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmRlbGV0ZShtaWRpRXZlbnQubWlkaU5vdGVJZClcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7VHJhY2t9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7cGFyc2VFdmVudHMsIHBhcnNlTUlESU5vdGVzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge2NoZWNrTUlESU51bWJlcn0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtjYWxjdWxhdGVQb3NpdGlvbn0gZnJvbSAnLi9wb3NpdGlvbidcbmltcG9ydCB7U2FtcGxlcn0gZnJvbSAnLi9zYW1wbGVyJ1xuaW1wb3J0IHtnZXRJbml0RGF0YX0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcblxuXG5sZXRcbiAgbWV0aG9kTWFwID0gbmV3IE1hcChbXG4gICAgWyd2b2x1bWUnLCAnc2V0Vm9sdW1lJ10sXG4gICAgWydpbnN0cnVtZW50JywgJ3NldEluc3RydW1lbnQnXSxcbiAgICBbJ25vdGVOdW1iZXJBY2NlbnRlZFRpY2snLCAnc2V0Tm90ZU51bWJlckFjY2VudGVkVGljayddLFxuICAgIFsnbm90ZU51bWJlck5vbkFjY2VudGVkVGljaycsICdzZXROb3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJ10sXG4gICAgWyd2ZWxvY2l0eUFjY2VudGVkVGljaycsICdzZXRWZWxvY2l0eUFjY2VudGVkVGljayddLFxuICAgIFsndmVsb2NpdHlOb25BY2NlbnRlZFRpY2snLCAnc2V0VmVsb2NpdHlOb25BY2NlbnRlZFRpY2snXSxcbiAgICBbJ25vdGVMZW5ndGhBY2NlbnRlZFRpY2snLCAnc2V0Tm90ZUxlbmd0aEFjY2VudGVkVGljayddLFxuICAgIFsnbm90ZUxlbmd0aE5vbkFjY2VudGVkVGljaycsICdzZXROb3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrJ11cbiAgXSk7XG5cbmV4cG9ydCBjbGFzcyBNZXRyb25vbWV7XG5cbiAgY29uc3RydWN0b3Ioc29uZyl7XG4gICAgdGhpcy5zb25nID0gc29uZ1xuICAgIHRoaXMudHJhY2sgPSBuZXcgVHJhY2soe25hbWU6IHRoaXMuc29uZy5pZCArICdfbWV0cm9ub21lJ30pXG4gICAgdGhpcy5wYXJ0ID0gbmV3IFBhcnQoKVxuICAgIHRoaXMudHJhY2suYWRkUGFydHModGhpcy5wYXJ0KVxuICAgIHRoaXMudHJhY2suY29ubmVjdCh0aGlzLnNvbmcuX291dHB1dClcblxuICAgIHRoaXMuZXZlbnRzID0gW11cbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gW11cbiAgICB0aGlzLnByZWNvdW50RHVyYXRpb24gPSAwXG4gICAgdGhpcy5iYXJzID0gMFxuICAgIHRoaXMuaW5kZXggPSAwXG4gICAgdGhpcy5pbmRleDIgPSAwXG4gICAgdGhpcy5wcmVjb3VudEluZGV4ID0gMFxuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG5cbiAgcmVzZXQoKXtcblxuICAgIGxldCBkYXRhID0gZ2V0SW5pdERhdGEoKVxuICAgIGxldCBpbnN0cnVtZW50ID0gbmV3IFNhbXBsZXIoJ21ldHJvbm9tZScpXG4gICAgaW5zdHJ1bWVudC51cGRhdGVTYW1wbGVEYXRhKHtcbiAgICAgIG5vdGU6IDYwLFxuICAgICAgYnVmZmVyOiBkYXRhLmxvd3RpY2ssXG4gICAgfSwge1xuICAgICAgbm90ZTogNjEsXG4gICAgICBidWZmZXI6IGRhdGEuaGlnaHRpY2ssXG4gICAgfSlcbiAgICB0aGlzLnRyYWNrLnNldEluc3RydW1lbnQoaW5zdHJ1bWVudClcblxuICAgIHRoaXMudm9sdW1lID0gMVxuXG4gICAgdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgPSA2MVxuICAgIHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkID0gNjBcblxuICAgIHRoaXMudmVsb2NpdHlBY2NlbnRlZCA9IDEwMFxuICAgIHRoaXMudmVsb2NpdHlOb25BY2NlbnRlZCA9IDEwMFxuXG4gICAgdGhpcy5ub3RlTGVuZ3RoQWNjZW50ZWQgPSB0aGlzLnNvbmcucHBxIC8gNCAvLyBzaXh0ZWVudGggbm90ZXMgLT4gZG9uJ3QgbWFrZSB0aGlzIHRvbyBzaG9ydCBpZiB5b3VyIHNhbXBsZSBoYXMgYSBsb25nIGF0dGFjayFcbiAgICB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZCA9IHRoaXMuc29uZy5wcHEgLyA0XG4gIH1cblxuICBjcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgaWQgPSAnaW5pdCcpe1xuICAgIGxldCBpLCBqXG4gICAgbGV0IHBvc2l0aW9uXG4gICAgbGV0IHZlbG9jaXR5XG4gICAgbGV0IG5vdGVMZW5ndGhcbiAgICBsZXQgbm90ZU51bWJlclxuICAgIGxldCBiZWF0c1BlckJhclxuICAgIGxldCB0aWNrc1BlckJlYXRcbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IG5vdGVPbiwgbm90ZU9mZlxuICAgIGxldCBldmVudHMgPSBbXVxuXG4gICAgLy9jb25zb2xlLmxvZyhzdGFydEJhciwgZW5kQmFyKTtcblxuICAgIGZvcihpID0gc3RhcnRCYXI7IGkgPD0gZW5kQmFyOyBpKyspe1xuICAgICAgcG9zaXRpb24gPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLnNvbmcsIHtcbiAgICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAgIHRhcmdldDogW2ldLFxuICAgICAgfSlcblxuICAgICAgYmVhdHNQZXJCYXIgPSBwb3NpdGlvbi5ub21pbmF0b3JcbiAgICAgIHRpY2tzUGVyQmVhdCA9IHBvc2l0aW9uLnRpY2tzUGVyQmVhdFxuICAgICAgdGlja3MgPSBwb3NpdGlvbi50aWNrc1xuXG4gICAgICBmb3IoaiA9IDA7IGogPCBiZWF0c1BlckJhcjsgaisrKXtcblxuICAgICAgICBub3RlTnVtYmVyID0gaiA9PT0gMCA/IHRoaXMubm90ZU51bWJlckFjY2VudGVkIDogdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWRcbiAgICAgICAgbm90ZUxlbmd0aCA9IGogPT09IDAgPyB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA6IHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkXG4gICAgICAgIHZlbG9jaXR5ID0gaiA9PT0gMCA/IHRoaXMudmVsb2NpdHlBY2NlbnRlZCA6IHRoaXMudmVsb2NpdHlOb25BY2NlbnRlZFxuXG4gICAgICAgIG5vdGVPbiA9IG5ldyBNSURJRXZlbnQodGlja3MsIDE0NCwgbm90ZU51bWJlciwgdmVsb2NpdHkpXG4gICAgICAgIG5vdGVPZmYgPSBuZXcgTUlESUV2ZW50KHRpY2tzICsgbm90ZUxlbmd0aCwgMTI4LCBub3RlTnVtYmVyLCAwKVxuXG4gICAgICAgIGlmKGlkID09PSAncHJlY291bnQnKXtcbiAgICAgICAgICBub3RlT24uX3RyYWNrID0gdGhpcy50cmFja1xuICAgICAgICAgIG5vdGVPZmYuX3RyYWNrID0gdGhpcy50cmFja1xuICAgICAgICAgIG5vdGVPbi5fcGFydCA9IHt9XG4gICAgICAgICAgbm90ZU9mZi5fcGFydCA9IHt9XG4gICAgICAgIH1cblxuICAgICAgICBldmVudHMucHVzaChub3RlT24sIG5vdGVPZmYpXG4gICAgICAgIHRpY2tzICs9IHRpY2tzUGVyQmVhdFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldmVudHNcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKHN0YXJ0QmFyID0gMSwgZW5kQmFyID0gdGhpcy5zb25nLmJhcnMsIGlkID0gJ2luaXQnKXtcbiAgICB0aGlzLnBhcnQucmVtb3ZlRXZlbnRzKHRoaXMucGFydC5nZXRFdmVudHMoKSlcbiAgICB0aGlzLmV2ZW50cyA9IHRoaXMuY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIGlkKVxuICAgIHRoaXMucGFydC5hZGRFdmVudHMoLi4udGhpcy5ldmVudHMpXG4gICAgdGhpcy5iYXJzID0gdGhpcy5zb25nLmJhcnNcbiAgICAvL2NvbnNvbGUubG9nKCdnZXRFdmVudHMgJU8nLCB0aGlzLmV2ZW50cylcbiAgICB0aGlzLmFsbEV2ZW50cyA9IFsuLi50aGlzLmV2ZW50cywgLi4udGhpcy5zb25nLl90aW1lRXZlbnRzXVxuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuYWxsRXZlbnRzKVxuICAgIHNvcnRFdmVudHModGhpcy5hbGxFdmVudHMpXG4gICAgcGFyc2VNSURJTm90ZXModGhpcy5ldmVudHMpXG4gICAgcmV0dXJuIHRoaXMuZXZlbnRzXG4gIH1cblxuXG4gIHNldEluZGV4MihtaWxsaXMpe1xuICAgIHRoaXMuaW5kZXgyID0gMFxuICB9XG5cbiAgZ2V0RXZlbnRzMihtYXh0aW1lLCB0aW1lU3RhbXApe1xuICAgIGxldCByZXN1bHQgPSBbXVxuXG4gICAgZm9yKGxldCBpID0gdGhpcy5pbmRleDIsIG1heGkgPSB0aGlzLmFsbEV2ZW50cy5sZW5ndGg7IGkgPCBtYXhpOyBpKyspe1xuXG4gICAgICBsZXQgZXZlbnQgPSB0aGlzLmFsbEV2ZW50c1tpXVxuXG4gICAgICBpZihldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5URU1QTyB8fCBldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSl7XG4gICAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIHRoaXMubWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2tcbiAgICAgICAgICB0aGlzLmluZGV4MisrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cblxuICAgICAgfWVsc2V7XG4gICAgICAgIGxldCBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGlja1xuICAgICAgICBpZihtaWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZVN0YW1wXG4gICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgICAgICAgdGhpcy5pbmRleDIrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG5cbiAgYWRkRXZlbnRzKHN0YXJ0QmFyID0gMSwgZW5kQmFyID0gdGhpcy5zb25nLmJhcnMsIGlkID0gJ2FkZCcpe1xuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0QmFyLCBlbmRCYXIpXG4gICAgbGV0IGV2ZW50cyA9IHRoaXMuY3JlYXRlRXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIGlkKVxuICAgIHRoaXMuZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIHRoaXMucGFydC5hZGRFdmVudHMoLi4uZXZlbnRzKVxuICAgIHRoaXMuYmFycyA9IGVuZEJhclxuICAgIC8vY29uc29sZS5sb2coJ2dldEV2ZW50cyAlTycsIHRoaXMuZXZlbnRzLCBlbmRCYXIpXG4gICAgcmV0dXJuIGV2ZW50c1xuICB9XG5cblxuICBjcmVhdGVQcmVjb3VudEV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCB0aW1lU3RhbXApe1xuXG4gICAgdGhpcy50aW1lU3RhbXAgPSB0aW1lU3RhbXBcblxuLy8gICBsZXQgc29uZ1N0YXJ0UG9zaXRpb24gPSB0aGlzLnNvbmcuZ2V0UG9zaXRpb24oKVxuXG4gICAgbGV0IHNvbmdTdGFydFBvc2l0aW9uID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcy5zb25nLCB7XG4gICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgIHRhcmdldDogW3N0YXJ0QmFyXSxcbiAgICAgIHJlc3VsdDogJ21pbGxpcycsXG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKCdzdGFyQmFyJywgc29uZ1N0YXJ0UG9zaXRpb24uYmFyKVxuXG4gICAgbGV0IGVuZFBvcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgICAvL3RhcmdldDogW3NvbmdTdGFydFBvc2l0aW9uLmJhciArIHByZWNvdW50LCBzb25nU3RhcnRQb3NpdGlvbi5iZWF0LCBzb25nU3RhcnRQb3NpdGlvbi5zaXh0ZWVudGgsIHNvbmdTdGFydFBvc2l0aW9uLnRpY2tdLFxuICAgICAgdGFyZ2V0OiBbZW5kQmFyXSxcbiAgICAgIHJlc3VsdDogJ21pbGxpcycsXG4gICAgfSlcblxuICAgIC8vY29uc29sZS5sb2coc29uZ1N0YXJ0UG9zaXRpb24sIGVuZFBvcylcblxuICAgIHRoaXMucHJlY291bnRJbmRleCA9IDBcbiAgICB0aGlzLnN0YXJ0TWlsbGlzID0gc29uZ1N0YXJ0UG9zaXRpb24ubWlsbGlzXG4gICAgdGhpcy5lbmRNaWxsaXMgPSBlbmRQb3MubWlsbGlzXG4gICAgdGhpcy5wcmVjb3VudER1cmF0aW9uID0gZW5kUG9zLm1pbGxpcyAtIHRoaXMuc3RhcnRNaWxsaXNcblxuICAgIC8vIGRvIHRoaXMgc28geW91IGNhbiBzdGFydCBwcmVjb3VudGluZyBhdCBhbnkgcG9zaXRpb24gaW4gdGhlIHNvbmdcbiAgICB0aGlzLnRpbWVTdGFtcCAtPSB0aGlzLnN0YXJ0TWlsbGlzXG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMucHJlY291bnREdXJhdGlvbiwgdGhpcy5zdGFydE1pbGxpcywgdGhpcy5lbmRNaWxsaXMpXG5cbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciAtIDEsICdwcmVjb3VudCcpO1xuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSBwYXJzZUV2ZW50cyhbLi4udGhpcy5zb25nLl90aW1lRXZlbnRzLCAuLi50aGlzLnByZWNvdW50RXZlbnRzXSlcblxuICAgIC8vY29uc29sZS5sb2coc29uZ1N0YXJ0UG9zaXRpb24uYmFyLCBlbmRQb3MuYmFyLCBwcmVjb3VudCwgdGhpcy5wcmVjb3VudEV2ZW50cy5sZW5ndGgpO1xuICAgIC8vY29uc29sZS5sb2codGhpcy5wcmVjb3VudEV2ZW50cy5sZW5ndGgsIHRoaXMucHJlY291bnREdXJhdGlvbik7XG4gICAgcmV0dXJuIHRoaXMucHJlY291bnREdXJhdGlvblxuICB9XG5cblxuICBzZXRQcmVjb3VudEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvcihsZXQgZXZlbnQgb2YgdGhpcy5ldmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgICAgIHRoaXMucHJlY291bnRJbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyh0aGlzLnByZWNvdW50SW5kZXgpXG4gIH1cblxuXG4gIC8vIGNhbGxlZCBieSBzY2hlZHVsZXIuanNcbiAgZ2V0UHJlY291bnRFdmVudHMobWF4dGltZSl7XG4gICAgbGV0IGV2ZW50cyA9IHRoaXMucHJlY291bnRFdmVudHMsXG4gICAgICBtYXhpID0gZXZlbnRzLmxlbmd0aCwgaSwgZXZ0LFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgICAvL21heHRpbWUgKz0gdGhpcy5wcmVjb3VudER1cmF0aW9uXG5cbiAgICBmb3IoaSA9IHRoaXMucHJlY291bnRJbmRleDsgaSA8IG1heGk7IGkrKyl7XG4gICAgICBldnQgPSBldmVudHNbaV07XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgbWF4dGltZSwgdGhpcy5taWxsaXMpO1xuICAgICAgaWYoZXZ0Lm1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICBldnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZ0Lm1pbGxpc1xuICAgICAgICByZXN1bHQucHVzaChldnQpXG4gICAgICAgIHRoaXMucHJlY291bnRJbmRleCsrXG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2cocmVzdWx0Lmxlbmd0aCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG5cbiAgbXV0ZShmbGFnKXtcbiAgICB0aGlzLnRyYWNrLm11dGVkID0gZmxhZ1xuICB9XG5cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMudHJhY2suX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICB9XG5cblxuICAvLyA9PT09PT09PT09PSBDT05GSUdVUkFUSU9OID09PT09PT09PT09XG5cbiAgdXBkYXRlQ29uZmlnKCl7XG4gICAgdGhpcy5pbml0KDEsIHRoaXMuYmFycywgJ3VwZGF0ZScpXG4gICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgdGhpcy5zb25nLnVwZGF0ZSgpXG4gIH1cblxuICAvLyBhZGRlZCB0byBwdWJsaWMgQVBJOiBTb25nLmNvbmZpZ3VyZU1ldHJvbm9tZSh7fSlcbiAgY29uZmlndXJlKGNvbmZpZyl7XG5cbiAgICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgIHRoaXNbbWV0aG9kTWFwLmdldChrZXkpXShjb25maWcua2V5KTtcbiAgICB9LCB0aGlzKTtcblxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldEluc3RydW1lbnQoaW5zdHJ1bWVudCl7XG4gICAgaWYoIWluc3RydW1lbnQgaW5zdGFuY2VvZiBJbnN0cnVtZW50KXtcbiAgICAgIGNvbnNvbGUud2Fybignbm90IGFuIGluc3RhbmNlIG9mIEluc3RydW1lbnQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMudHJhY2suc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVMZW5ndGhBY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMubm90ZUxlbmd0aEFjY2VudGVkID0gdmFsdWU7XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgaWYoaXNOYU4odmFsdWUpKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWZWxvY2l0eUFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLnZlbG9jaXR5QWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0VmVsb2NpdHlOb25BY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2sodmFsdWUpe1xuICAgIHZhbHVlID0gY2hlY2tNSURJTnVtYmVyKHZhbHVlKTtcbiAgICBpZih2YWx1ZSAhPT0gZmFsc2Upe1xuICAgICAgdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWb2x1bWUodmFsdWUpe1xuICAgIHRoaXMudHJhY2suc2V0Vm9sdW1lKHZhbHVlKTtcbiAgfVxufVxuXG4iLCIvLyBAIGZsb3dcbmltcG9ydCB7Z2V0Tm90ZURhdGF9IGZyb20gJy4vbm90ZSdcbmltcG9ydCB7Z2V0U2V0dGluZ3N9IGZyb20gJy4vc2V0dGluZ3MnXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgTUlESUV2ZW50e1xuXG4gIGNvbnN0cnVjdG9yKHRpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlciA9IC0xLCBjaGFubmVsOm51bWJlciA9IDApe1xuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLnRpY2tzID0gdGlja3NcbiAgICB0aGlzLmRhdGExID0gZGF0YTFcbiAgICB0aGlzLmRhdGEyID0gZGF0YTJcbiAgICB0aGlzLnBpdGNoID0gZ2V0U2V0dGluZ3MoKS5waXRjaFxuXG4gICAgLyogdGVzdCB3aGV0aGVyIHR5cGUgaXMgYSBzdGF0dXMgYnl0ZSBvciBhIGNvbW1hbmQ6ICovXG5cbiAgICAvLyAxLiB0aGUgaGlnaGVyIDQgYml0cyBvZiB0aGUgc3RhdHVzIGJ5dGUgZm9ybSB0aGUgY29tbWFuZFxuICAgIHRoaXMudHlwZSA9ICh0eXBlID4+IDQpICogMTZcbiAgICAvL3RoaXMudHlwZSA9IHRoaXMuY29tbWFuZCA9ICh0eXBlID4+IDQpICogMTZcblxuICAgIC8vIDIuIGZpbHRlciBjaGFubmVsIGV2ZW50c1xuICAgIGlmKHRoaXMudHlwZSA+PSAweDgwICYmIHRoaXMudHlwZSA8PSAweEUwKXtcbiAgICAgIC8vIDMuIGdldCB0aGUgY2hhbm5lbCBudW1iZXJcbiAgICAgIGlmKGNoYW5uZWwgPiAwKXtcbiAgICAgICAgLy8gYSBjaGFubmVsIGlzIHNldCwgdGhpcyBvdmVycnVsZXMgdGhlIGNoYW5uZWwgbnVtYmVyIGluIHRoZSBzdGF0dXMgYnl0ZVxuICAgICAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsXG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8gZXh0cmFjdCB0aGUgY2hhbm5lbCBmcm9tIHRoZSBzdGF0dXMgYnl0ZTogdGhlIGxvd2VyIDQgYml0cyBvZiB0aGUgc3RhdHVzIGJ5dGUgZm9ybSB0aGUgY2hhbm5lbCBudW1iZXJcbiAgICAgICAgdGhpcy5jaGFubmVsID0gKHR5cGUgJiAweEYpXG4gICAgICB9XG4gICAgICAvL3RoaXMuc3RhdHVzID0gdGhpcy5jb21tYW5kICsgdGhpcy5jaGFubmVsXG4gICAgfWVsc2V7XG4gICAgICAvLyA0LiBub3QgYSBjaGFubmVsIGV2ZW50LCBzZXQgdGhlIHR5cGUgYW5kIGNvbW1hbmQgdG8gdGhlIHZhbHVlIG9mIHR5cGUgYXMgcHJvdmlkZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgICAvL3RoaXMudHlwZSA9IHRoaXMuY29tbWFuZCA9IHR5cGVcbiAgICAgIHRoaXMuY2hhbm5lbCA9IDAgLy8gYW55XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codHlwZSwgdGhpcy50eXBlLCB0aGlzLmNvbW1hbmQsIHRoaXMuc3RhdHVzLCB0aGlzLmNoYW5uZWwsIHRoaXMuaWQpXG5cbiAgICAvLyBzb21ldGltZXMgTk9URV9PRkYgZXZlbnRzIGFyZSBzZW50IGFzIE5PVEVfT04gZXZlbnRzIHdpdGggYSAwIHZlbG9jaXR5IHZhbHVlXG4gICAgaWYodHlwZSA9PT0gMTQ0ICYmIGRhdGEyID09PSAwKXtcbiAgICAgIHRoaXMudHlwZSA9IDEyOFxuICAgIH1cblxuICAgIHRoaXMuX3BhcnQgPSBudWxsXG4gICAgdGhpcy5fdHJhY2sgPSBudWxsXG4gICAgdGhpcy5fc29uZyA9IG51bGxcblxuICAgIGlmKHR5cGUgPT09IDE0NCB8fCB0eXBlID09PSAxMjgpe1xuICAgICAgKHtcbiAgICAgICAgbmFtZTogdGhpcy5ub3RlTmFtZSxcbiAgICAgICAgZnVsbE5hbWU6IHRoaXMuZnVsbE5vdGVOYW1lLFxuICAgICAgICBmcmVxdWVuY3k6IHRoaXMuZnJlcXVlbmN5LFxuICAgICAgICBvY3RhdmU6IHRoaXMub2N0YXZlXG4gICAgICB9ID0gZ2V0Tm90ZURhdGEoe251bWJlcjogZGF0YTF9KSlcbiAgICB9XG4gICAgLy9AVE9ETzogYWRkIGFsbCBvdGhlciBwcm9wZXJ0aWVzXG4gIH1cblxuICBjb3B5KCl7XG4gICAgbGV0IG0gPSBuZXcgTUlESUV2ZW50KHRoaXMudGlja3MsIHRoaXMudHlwZSwgdGhpcy5kYXRhMSwgdGhpcy5kYXRhMilcbiAgICByZXR1cm4gbVxuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKXsgLy8gbWF5IGJlIGJldHRlciBpZiBub3QgYSBwdWJsaWMgbWV0aG9kP1xuICAgIHRoaXMuZGF0YTEgKz0gYW1vdW50XG4gICAgdGhpcy5mcmVxdWVuY3kgPSB0aGlzLnBpdGNoICogTWF0aC5wb3coMiwgKHRoaXMuZGF0YTEgLSA2OSkgLyAxMilcbiAgfVxuXG4gIHVwZGF0ZVBpdGNoKG5ld1BpdGNoKXtcbiAgICBpZihuZXdQaXRjaCA9PT0gdGhpcy5waXRjaCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5waXRjaCA9IG5ld1BpdGNoXG4gICAgdGhpcy50cmFuc3Bvc2UoMClcbiAgfVxuXG4gIG1vdmUodGlja3M6IG51bWJlcil7XG4gICAgdGhpcy50aWNrcyArPSB0aWNrc1xuICAgIGlmKHRoaXMubWlkaU5vdGUpe1xuICAgICAgdGhpcy5taWRpTm90ZS51cGRhdGUoKVxuICAgIH1cbiAgfVxuXG4gIG1vdmVUbyh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLnRpY2tzID0gdGlja3NcbiAgICBpZih0aGlzLm1pZGlOb3RlKXtcbiAgICAgIHRoaXMubWlkaU5vdGUudXBkYXRlKClcbiAgICB9XG4gIH1cbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZU1JRElFdmVudChldmVudCl7XG4gIC8vZXZlbnQubm90ZSA9IG51bGxcbiAgZXZlbnQubm90ZSA9IG51bGxcbiAgZXZlbnQgPSBudWxsXG59XG4qL1xuIiwiaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBNSURJTm90ZXtcblxuICBjb25zdHJ1Y3Rvcihub3Rlb246IE1JRElFdmVudCwgbm90ZW9mZjogTUlESUV2ZW50KXtcbiAgICAvL2lmKG5vdGVvbi50eXBlICE9PSAxNDQgfHwgbm90ZW9mZi50eXBlICE9PSAxMjgpe1xuICAgIGlmKG5vdGVvbi50eXBlICE9PSAxNDQpe1xuICAgICAgY29uc29sZS53YXJuKCdjYW5ub3QgY3JlYXRlIE1JRElOb3RlJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmlkID0gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV8ke2luc3RhbmNlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5ub3RlT24gPSBub3Rlb25cbiAgICBub3Rlb24ubWlkaU5vdGUgPSB0aGlzXG4gICAgbm90ZW9uLm1pZGlOb3RlSWQgPSB0aGlzLmlkXG5cbiAgICBpZihub3Rlb2ZmIGluc3RhbmNlb2YgTUlESUV2ZW50KXtcbiAgICAgIHRoaXMubm90ZU9mZiA9IG5vdGVvZmZcbiAgICAgIG5vdGVvZmYubWlkaU5vdGUgPSB0aGlzXG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlSWQgPSB0aGlzLmlkXG4gICAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSBub3Rlb2ZmLnRpY2tzIC0gbm90ZW9uLnRpY2tzXG4gICAgICB0aGlzLmR1cmF0aW9uTWlsbGlzID0gLTFcbiAgICB9XG4gIH1cblxuICBhZGROb3RlT2ZmKG5vdGVvZmYpe1xuICAgIHRoaXMubm90ZU9mZiA9IG5vdGVvZmZcbiAgICBub3Rlb2ZmLm1pZGlOb3RlID0gdGhpc1xuICAgIG5vdGVvZmYubWlkaU5vdGVJZCA9IHRoaXMuaWRcbiAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSBub3Rlb2ZmLnRpY2tzIC0gdGhpcy5ub3RlT24udGlja3NcbiAgICB0aGlzLmR1cmF0aW9uTWlsbGlzID0gLTFcbiAgfVxuXG4gIGNvcHkoKXtcbiAgICByZXR1cm4gbmV3IE1JRElOb3RlKHRoaXMubm90ZU9uLmNvcHkoKSwgdGhpcy5ub3RlT2ZmLmNvcHkoKSlcbiAgfVxuXG4gIHVwZGF0ZSgpeyAvLyBtYXkgdXNlIGFub3RoZXIgbmFtZSBmb3IgdGhpcyBtZXRob2RcbiAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSB0aGlzLm5vdGVPZmYudGlja3MgLSB0aGlzLm5vdGVPbi50aWNrc1xuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKTogdm9pZHtcbiAgICB0aGlzLm5vdGVPbi50cmFuc3Bvc2UoYW1vdW50KVxuICAgIHRoaXMubm90ZU9mZi50cmFuc3Bvc2UoYW1vdW50KVxuICB9XG5cbiAgbW92ZSh0aWNrczogbnVtYmVyKTogdm9pZHtcbiAgICB0aGlzLm5vdGVPbi5tb3ZlKHRpY2tzKVxuICAgIHRoaXMubm90ZU9mZi5tb3ZlKHRpY2tzKVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLm1vdmVUbyh0aWNrcylcbiAgICB0aGlzLm5vdGVPZmYubW92ZVRvKHRpY2tzKVxuICB9XG5cbiAgdW5yZWdpc3Rlcigpe1xuICAgIGlmKHRoaXMucGFydCl7XG4gICAgICB0aGlzLnBhcnQucmVtb3ZlRXZlbnRzKHRoaXMpXG4gICAgICB0aGlzLnBhcnQgPSBudWxsXG4gICAgfVxuICAgIGlmKHRoaXMudHJhY2spe1xuICAgICAgdGhpcy50cmFjay5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMudHJhY2sgPSBudWxsXG4gICAgfVxuICAgIGlmKHRoaXMuc29uZyl7XG4gICAgICB0aGlzLnNvbmcucmVtb3ZlRXZlbnRzKHRoaXMpXG4gICAgICB0aGlzLnNvbmcgPSBudWxsXG4gICAgfVxuICB9XG59XG5cbiIsIi8qXG4gIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBieXRlcyB0aHJvdWdoIHNlcXVlbnRpYWwgcmVhZHNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiAgYWRhcHRlZCB0byB3b3JrIHdpdGggQXJyYXlCdWZmZXIgLT4gVWludDhBcnJheVxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElTdHJlYW17XG5cbiAgLy8gYnVmZmVyIGlzIFVpbnQ4QXJyYXlcbiAgY29uc3RydWN0b3IoYnVmZmVyKXtcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIC8qIHJlYWQgc3RyaW5nIG9yIGFueSBudW1iZXIgb2YgYnl0ZXMgKi9cbiAgcmVhZChsZW5ndGgsIHRvU3RyaW5nID0gdHJ1ZSkge1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICBpZih0b1N0cmluZyl7XG4gICAgICByZXN1bHQgPSAnJztcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0ICs9IGZjYyh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1lbHNle1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMzItYml0IGludGVnZXIgKi9cbiAgcmVhZEludDMyKCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgMjQpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV0gPDwgMTYpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDNdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDE2LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQxNigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGFuIDgtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDgoc2lnbmVkKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dO1xuICAgIGlmKHNpZ25lZCAmJiByZXN1bHQgPiAxMjcpe1xuICAgICAgcmVzdWx0IC09IDI1NjtcbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbiArPSAxO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBlb2YoKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPj0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICB9XG5cbiAgLyogcmVhZCBhIE1JREktc3R5bGUgbGV0aWFibGUtbGVuZ3RoIGludGVnZXJcbiAgICAoYmlnLWVuZGlhbiB2YWx1ZSBpbiBncm91cHMgb2YgNyBiaXRzLFxuICAgIHdpdGggdG9wIGJpdCBzZXQgdG8gc2lnbmlmeSB0aGF0IGFub3RoZXIgYnl0ZSBmb2xsb3dzKVxuICAqL1xuICByZWFkVmFySW50KCkge1xuICAgIGxldCByZXN1bHQgPSAwO1xuICAgIHdoaWxlKHRydWUpIHtcbiAgICAgIGxldCBiID0gdGhpcy5yZWFkSW50OCgpO1xuICAgICAgaWYgKGIgJiAweDgwKSB7XG4gICAgICAgIHJlc3VsdCArPSAoYiAmIDB4N2YpO1xuICAgICAgICByZXN1bHQgPDw9IDc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBiIGlzIHRoZSBsYXN0IGJ5dGUgKi9cbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIGI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIHNldFBvc2l0aW9uKHApe1xuICAgIHRoaXMucG9zaXRpb24gPSBwO1xuICB9XG59XG4iLCIvKlxuICBFeHRyYWN0cyBhbGwgbWlkaSBldmVudHMgZnJvbSBhIGJpbmFyeSBtaWRpIGZpbGUsIHVzZXMgbWlkaV9zdHJlYW0uanNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE1JRElTdHJlYW0gZnJvbSAnLi9taWRpX3N0cmVhbSc7XG5cbmxldFxuICBsYXN0RXZlbnRUeXBlQnl0ZSxcbiAgdHJhY2tOYW1lO1xuXG5cbmZ1bmN0aW9uIHJlYWRDaHVuayhzdHJlYW0pe1xuICBsZXQgaWQgPSBzdHJlYW0ucmVhZCg0LCB0cnVlKTtcbiAgbGV0IGxlbmd0aCA9IHN0cmVhbS5yZWFkSW50MzIoKTtcbiAgLy9jb25zb2xlLmxvZyhsZW5ndGgpO1xuICByZXR1cm57XG4gICAgJ2lkJzogaWQsXG4gICAgJ2xlbmd0aCc6IGxlbmd0aCxcbiAgICAnZGF0YSc6IHN0cmVhbS5yZWFkKGxlbmd0aCwgZmFsc2UpXG4gIH07XG59XG5cblxuZnVuY3Rpb24gcmVhZEV2ZW50KHN0cmVhbSl7XG4gIHZhciBldmVudCA9IHt9O1xuICB2YXIgbGVuZ3RoO1xuICBldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICBsZXQgZXZlbnRUeXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50VHlwZUJ5dGUsIGV2ZW50VHlwZUJ5dGUgJiAweDgwLCAxNDYgJiAweDBmKTtcbiAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweGYwKSA9PSAweGYwKXtcbiAgICAvKiBzeXN0ZW0gLyBtZXRhIGV2ZW50ICovXG4gICAgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGZmKXtcbiAgICAgIC8qIG1ldGEgZXZlbnQgKi9cbiAgICAgIGV2ZW50LnR5cGUgPSAnbWV0YSc7XG4gICAgICBsZXQgc3VidHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBzd2l0Y2goc3VidHlwZUJ5dGUpe1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNlcXVlbmNlTnVtYmVyIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1iZXIgPSBzdHJlYW0ucmVhZEludDE2KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvcHlyaWdodE5vdGljZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDM6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0cmFja05hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdpbnN0cnVtZW50TmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDU6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdseXJpY3MnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA2OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWFya2VyJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2N1ZVBvaW50JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21pZGlDaGFubmVsUHJlZml4JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDEpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgbWlkaUNoYW5uZWxQcmVmaXggZXZlbnQgaXMgMSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmNoYW5uZWwgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2VuZE9mVHJhY2snO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NldFRlbXBvJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDMpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2V0VGVtcG8gZXZlbnQgaXMgMywgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQgPSAoXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgMTYpICtcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCA4KSArXG4gICAgICAgICAgICBzdHJlYW0ucmVhZEludDgoKVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzbXB0ZU9mZnNldCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA1KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNtcHRlT2Zmc2V0IGV2ZW50IGlzIDUsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgaG91ckJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZVJhdGUgPXtcbiAgICAgICAgICAgIDB4MDA6IDI0LCAweDIwOiAyNSwgMHg0MDogMjksIDB4NjA6IDMwXG4gICAgICAgICAgfVtob3VyQnl0ZSAmIDB4NjBdO1xuICAgICAgICAgIGV2ZW50LmhvdXIgPSBob3VyQnl0ZSAmIDB4MWY7XG4gICAgICAgICAgZXZlbnQubWluID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc2VjID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zdWJmcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU4OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGltZVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA0KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWVyYXRvciA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmRlbm9taW5hdG9yID0gTWF0aC5wb3coMiwgc3RyZWFtLnJlYWRJbnQ4KCkpO1xuICAgICAgICAgIGV2ZW50Lm1ldHJvbm9tZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnRoaXJ0eXNlY29uZHMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1OTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2tleVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQua2V5ID0gc3RyZWFtLnJlYWRJbnQ4KHRydWUpO1xuICAgICAgICAgIGV2ZW50LnNjYWxlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4N2Y6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZXJTcGVjaWZpYyc7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vaWYoc2VxdWVuY2VyLmRlYnVnID49IDIpe1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUud2FybignVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogJyArIHN1YnR5cGVCeXRlKTtcbiAgICAgICAgICAvL31cbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmMCl7XG4gICAgICBldmVudC50eXBlID0gJ3N5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4Zjcpe1xuICAgICAgZXZlbnQudHlwZSA9ICdkaXZpZGVkU3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogJyArIGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICB9ZWxzZXtcbiAgICAvKiBjaGFubmVsIGV2ZW50ICovXG4gICAgbGV0IHBhcmFtMTtcbiAgICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ODApID09PSAwKXtcbiAgICAgIC8qIHJ1bm5pbmcgc3RhdHVzIC0gcmV1c2UgbGFzdEV2ZW50VHlwZUJ5dGUgYXMgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgIGV2ZW50VHlwZUJ5dGUgaXMgYWN0dWFsbHkgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgKi9cbiAgICAgIC8vY29uc29sZS5sb2coJ3J1bm5pbmcgc3RhdHVzJyk7XG4gICAgICBwYXJhbTEgPSBldmVudFR5cGVCeXRlO1xuICAgICAgZXZlbnRUeXBlQnl0ZSA9IGxhc3RFdmVudFR5cGVCeXRlO1xuICAgIH1lbHNle1xuICAgICAgcGFyYW0xID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdsYXN0JywgZXZlbnRUeXBlQnl0ZSk7XG4gICAgICBsYXN0RXZlbnRUeXBlQnl0ZSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICAgIGxldCBldmVudFR5cGUgPSBldmVudFR5cGVCeXRlID4+IDQ7XG4gICAgZXZlbnQuY2hhbm5lbCA9IGV2ZW50VHlwZUJ5dGUgJiAweDBmO1xuICAgIGV2ZW50LnR5cGUgPSAnY2hhbm5lbCc7XG4gICAgc3dpdGNoIChldmVudFR5cGUpe1xuICAgICAgY2FzZSAweDA4OlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MDk6XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmKGV2ZW50LnZlbG9jaXR5ID09PSAwKXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBhOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYjpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb250cm9sbGVyJztcbiAgICAgICAgZXZlbnQuY29udHJvbGxlclR5cGUgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYzpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwcm9ncmFtQ2hhbmdlJztcbiAgICAgICAgZXZlbnQucHJvZ3JhbU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBkOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NoYW5uZWxBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gcGFyYW0xO1xuICAgICAgICAvL2lmKHRyYWNrTmFtZSA9PT0gJ1NILVMxLTQ0LUMwOSBMPVNNTCBJTj0zJyl7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCdjaGFubmVsIHByZXNzdXJlJywgdHJhY2tOYW1lLCBwYXJhbTEpO1xuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBlOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3BpdGNoQmVuZCc7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gcGFyYW0xICsgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDcpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvKlxuICAgICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgY29uc29sZS5sb2coJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuLypcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICBjb25zb2xlLmxvZygnd2VpcmRvJywgdHJhY2tOYW1lLCBwYXJhbTEsIGV2ZW50LnZlbG9jaXR5KTtcbiovXG5cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElGaWxlKGJ1ZmZlcil7XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPT09IGZhbHNlICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcignYnVmZmVyIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiBVaW50OEFycmF5IG9mIEFycmF5QnVmZmVyJylcbiAgICByZXR1cm5cbiAgfVxuICBpZihidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICB9XG4gIGxldCB0cmFja3MgPSBuZXcgTWFwKCk7XG4gIGxldCBzdHJlYW0gPSBuZXcgTUlESVN0cmVhbShidWZmZXIpO1xuXG4gIGxldCBoZWFkZXJDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICBpZihoZWFkZXJDaHVuay5pZCAhPT0gJ01UaGQnIHx8IGhlYWRlckNodW5rLmxlbmd0aCAhPT0gNil7XG4gICAgdGhyb3cgJ0JhZCAubWlkIGZpbGUgLSBoZWFkZXIgbm90IGZvdW5kJztcbiAgfVxuXG4gIGxldCBoZWFkZXJTdHJlYW0gPSBuZXcgTUlESVN0cmVhbShoZWFkZXJDaHVuay5kYXRhKTtcbiAgbGV0IGZvcm1hdFR5cGUgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0cmFja0NvdW50ID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG4gIGlmKHRpbWVEaXZpc2lvbiAmIDB4ODAwMCl7XG4gICAgdGhyb3cgJ0V4cHJlc3NpbmcgdGltZSBkaXZpc2lvbiBpbiBTTVRQRSBmcmFtZXMgaXMgbm90IHN1cHBvcnRlZCB5ZXQnO1xuICB9XG5cbiAgbGV0IGhlYWRlciA9e1xuICAgICdmb3JtYXRUeXBlJzogZm9ybWF0VHlwZSxcbiAgICAndHJhY2tDb3VudCc6IHRyYWNrQ291bnQsXG4gICAgJ3RpY2tzUGVyQmVhdCc6IHRpbWVEaXZpc2lvblxuICB9O1xuXG4gIGZvcihsZXQgaSA9IDA7IGkgPCB0cmFja0NvdW50OyBpKyspe1xuICAgIHRyYWNrTmFtZSA9ICd0cmFja18nICsgaTtcbiAgICBsZXQgdHJhY2sgPSBbXTtcbiAgICBsZXQgdHJhY2tDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICAgIGlmKHRyYWNrQ2h1bmsuaWQgIT09ICdNVHJrJyl7XG4gICAgICB0aHJvdyAnVW5leHBlY3RlZCBjaHVuayAtIGV4cGVjdGVkIE1UcmssIGdvdCAnKyB0cmFja0NodW5rLmlkO1xuICAgIH1cbiAgICBsZXQgdHJhY2tTdHJlYW0gPSBuZXcgTUlESVN0cmVhbSh0cmFja0NodW5rLmRhdGEpO1xuICAgIHdoaWxlKCF0cmFja1N0cmVhbS5lb2YoKSl7XG4gICAgICBsZXQgZXZlbnQgPSByZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuICAgICAgdHJhY2sucHVzaChldmVudCk7XG4gICAgfVxuICAgIHRyYWNrcy5zZXQodHJhY2tOYW1lLCB0cmFjayk7XG4gIH1cblxuICByZXR1cm57XG4gICAgJ2hlYWRlcic6IGhlYWRlcixcbiAgICAndHJhY2tzJzogdHJhY2tzXG4gIH07XG59IiwiaW1wb3J0IHtnZXRTZXR0aW5nc30gZnJvbSAnLi9zZXR0aW5ncydcblxuY29uc3QgcG93ID0gTWF0aC5wb3dcbmNvbnN0IGZsb29yID0gTWF0aC5mbG9vclxuLy9jb25zdCBjaGVja05vdGVOYW1lID0gL15bQS1HXXsxfShiezAsMn19fCN7MCwyfSlbXFwtXXswLDF9WzAtOV17MX0kL1xuY29uc3QgcmVnZXhDaGVja05vdGVOYW1lID0gL15bQS1HXXsxfShifGJifCN8IyMpezAsMX0kL1xuY29uc3QgcmVnZXhDaGVja0Z1bGxOb3RlTmFtZSA9IC9eW0EtR117MX0oYnxiYnwjfCMjKXswLDF9KFxcLTF8WzAtOV17MX0pJC9cbmNvbnN0IHJlZ2V4U3BsaXRGdWxsTmFtZSA9IC9eKFtBLUddezF9KGJ8YmJ8I3wjIyl7MCwxfSkoXFwtMXxbMC05XXsxfSkkL1xuY29uc3QgcmVnZXhHZXRPY3RhdmUgPSAvKFxcLTF8WzAtOV17MX0pJC9cblxuY29uc3Qgbm90ZU5hbWVzID0ge1xuICBzaGFycDogWydDJywgJ0MjJywgJ0QnLCAnRCMnLCAnRScsICdGJywgJ0YjJywgJ0cnLCAnRyMnLCAnQScsICdBIycsICdCJ10sXG4gIGZsYXQ6IFsnQycsICdEYicsICdEJywgJ0ViJywgJ0UnLCAnRicsICdHYicsICdHJywgJ0FiJywgJ0EnLCAnQmInLCAnQiddLFxuICAnZW5oYXJtb25pYy1zaGFycCc6IFsnQiMnLCAnQyMnLCAnQyMjJywgJ0QjJywgJ0QjIycsICdFIycsICdGIycsICdGIyMnLCAnRyMnLCAnRyMjJywgJ0EjJywgJ0EjIyddLFxuICAnZW5oYXJtb25pYy1mbGF0JzogWydEYmInLCAnRGInLCAnRWJiJywgJ0ViJywgJ0ZiJywgJ0diYicsICdHYicsICdBYmInLCAnQWInLCAnQmJiJywgJ0JiJywgJ0NiJ11cbn1cblxubGV0IG5vdGVOYW1lTW9kZVxubGV0IHBpdGNoXG5cbi8qXG4gIHNldHRpbmdzID0ge1xuICAgIG5hbWU6ICdDJyxcbiAgICBvY3RhdmU6IDQsXG4gICAgZnVsbE5hbWU6ICdDNCcsXG4gICAgbnVtYmVyOiA2MCxcbiAgICBmcmVxdWVuY3k6IDIzNC4xNiAvLyBub3QgeWV0IGltcGxlbWVudGVkXG4gIH1cbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZURhdGEoc2V0dGluZ3Mpe1xuICBsZXQge1xuICAgIGZ1bGxOYW1lLFxuICAgIG5hbWUsXG4gICAgb2N0YXZlLFxuICAgIG1vZGUsXG4gICAgbnVtYmVyLFxuICAgIGZyZXF1ZW5jeSxcbiAgfSA9IHNldHRpbmdzO1xuXG4gICh7bm90ZU5hbWVNb2RlLCBwaXRjaH0gPSBnZXRTZXR0aW5ncygpKVxuXG4gIGlmKFxuICAgICAgIHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJ1xuICAgICYmIHR5cGVvZiBmdWxsTmFtZSAhPT0gJ3N0cmluZydcbiAgICAmJiB0eXBlb2YgbnVtYmVyICE9PSAnbnVtYmVyJ1xuICAgICYmIHR5cGVvZiBmcmVxdWVuY3kgIT09ICdudW1iZXInKXtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYobnVtYmVyIDwgMCB8fCBudW1iZXIgPiAxMjcpe1xuICAgIGNvbnNvbGUubG9nKCdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgYmV0d2VlbiAwIChDLTEpIGFuZCAxMjcgKEc5KScpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIG1vZGUgPSBfY2hlY2tOb3RlTmFtZU1vZGUobW9kZSlcbiAgLy9jb25zb2xlLmxvZyhtb2RlKVxuXG4gIGlmKHR5cGVvZiBudW1iZXIgPT09ICdudW1iZXInKXtcbiAgICAoe1xuICAgICAgZnVsbE5hbWUsXG4gICAgICBuYW1lLFxuICAgICAgb2N0YXZlXG4gICAgfSA9IF9nZXROb3RlTmFtZShudW1iZXIsIG1vZGUpKVxuXG4gIH1lbHNlIGlmKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyl7XG5cbiAgICBpZihyZWdleENoZWNrTm90ZU5hbWUudGVzdChuYW1lKSl7XG4gICAgICBmdWxsTmFtZSA9IGAke25hbWV9JHtvY3RhdmV9YFxuICAgICAgbnVtYmVyID0gX2dldE5vdGVOdW1iZXIobmFtZSwgb2N0YXZlKVxuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5sb2coYGludmFsaWQgbmFtZSAke25hbWV9YClcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gIH1lbHNlIGlmKHR5cGVvZiBmdWxsTmFtZSA9PT0gJ3N0cmluZycpe1xuXG4gICAgaWYocmVnZXhDaGVja0Z1bGxOb3RlTmFtZS50ZXN0KGZ1bGxOYW1lKSl7XG4gICAgICAoe1xuICAgICAgICBvY3RhdmUsXG4gICAgICAgIG5hbWUsXG4gICAgICAgfSA9IF9zcGxpdEZ1bGxOYW1lKGZ1bGxOYW1lKSlcbiAgICAgIG51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSlcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUubG9nKGBpbnZhbGlkIGZ1bGxuYW1lICR7ZnVsbE5hbWV9YClcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgbGV0IGRhdGEgPSB7XG4gICAgbmFtZSxcbiAgICBvY3RhdmUsXG4gICAgZnVsbE5hbWUsXG4gICAgbnVtYmVyLFxuICAgIGZyZXF1ZW5jeTogX2dldEZyZXF1ZW5jeShudW1iZXIpLFxuICAgIGJsYWNrS2V5OiBfaXNCbGFja0tleShudW1iZXIpLFxuICB9XG4gIC8vY29uc29sZS5sb2coZGF0YSlcbiAgcmV0dXJuIGRhdGFcbn1cblxuXG5mdW5jdGlvbiBfZ2V0Tm90ZU5hbWUobnVtYmVyLCBtb2RlID0gbm90ZU5hbWVNb2RlKSB7XG4gIC8vbGV0IG9jdGF2ZSA9IE1hdGguZmxvb3IoKG51bWJlciAvIDEyKSAtIDIpLCAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgbGV0IG9jdGF2ZSA9IGZsb29yKChudW1iZXIgLyAxMikgLSAxKVxuICBsZXQgbmFtZSA9IG5vdGVOYW1lc1ttb2RlXVtudW1iZXIgJSAxMl1cbiAgcmV0dXJuIHtcbiAgICBmdWxsTmFtZTogYCR7bmFtZX0ke29jdGF2ZX1gLFxuICAgIG5hbWUsXG4gICAgb2N0YXZlLFxuICB9XG59XG5cblxuZnVuY3Rpb24gX2dldE9jdGF2ZShmdWxsTmFtZSl7XG4gIHJldHVybiBwYXJzZUludChmdWxsTmFtZS5tYXRjaChyZWdleEdldE9jdGF2ZSlbMF0sIDEwKVxufVxuXG5cbmZ1bmN0aW9uIF9zcGxpdEZ1bGxOYW1lKGZ1bGxOYW1lKXtcbiAgbGV0IG9jdGF2ZSA9IF9nZXRPY3RhdmUoZnVsbE5hbWUpXG4gIHJldHVybntcbiAgICBvY3RhdmUsXG4gICAgbmFtZTogZnVsbE5hbWUucmVwbGFjZShvY3RhdmUsICcnKVxuICB9XG59XG5cblxuZnVuY3Rpb24gX2dldE5vdGVOdW1iZXIobmFtZSwgb2N0YXZlKSB7XG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKVxuICBsZXQgaW5kZXhcblxuICBmb3IobGV0IGtleSBvZiBrZXlzKXtcbiAgICBsZXQgbW9kZSA9IG5vdGVOYW1lc1trZXldXG4gICAgaW5kZXggPSBtb2RlLmZpbmRJbmRleCh4ID0+IHggPT09IG5hbWUpXG4gICAgaWYoaW5kZXggIT09IC0xKXtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgLy9udW1iZXIgPSAoaW5kZXggKyAxMikgKyAob2N0YXZlICogMTIpICsgMTIgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBudW1iZXIgPSAoaW5kZXggKyAxMikgKyAob2N0YXZlICogMTIpLy8g4oaSIG1pZGkgc3RhbmRhcmQgKyBzY2llbnRpZmljIG5hbWluZywgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01pZGRsZV9DIGFuZCBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NjaWVudGlmaWNfcGl0Y2hfbm90YXRpb25cblxuICBpZihudW1iZXIgPCAwIHx8IG51bWJlciA+IDEyNyl7XG4gICAgY29uc29sZS5sb2coJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBiZXR3ZWVuIDAgKEMtMSkgYW5kIDEyNyAoRzkpJylcbiAgICByZXR1cm4gLTFcbiAgfVxuICByZXR1cm4gbnVtYmVyXG59XG5cblxuZnVuY3Rpb24gX2dldEZyZXF1ZW5jeShudW1iZXIpe1xuICByZXR1cm4gcGl0Y2ggKiBwb3coMiwgKG51bWJlciAtIDY5KSAvIDEyKSAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbn1cblxuXG4vL0BUT0RPOiBjYWxjdWxhdGUgbm90ZSBmcm9tIGZyZXF1ZW5jeVxuZnVuY3Rpb24gX2dldFBpdGNoKGhlcnR6KXtcbiAgLy9mbSAgPSAgMiht4oiSNjkpLzEyKDQ0MCBIeikuXG59XG5cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpe1xuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcylcbiAgbGV0IHJlc3VsdCA9IGtleXMuaW5jbHVkZXMobW9kZSlcbiAgLy9jb25zb2xlLmxvZyhyZXN1bHQpXG4gIGlmKHJlc3VsdCA9PT0gZmFsc2Upe1xuICAgIGlmKHR5cGVvZiBtb2RlICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICBjb25zb2xlLmxvZyhgJHttb2RlfSBpcyBub3QgYSB2YWxpZCBub3RlIG5hbWUgbW9kZSwgdXNpbmcgXCIke25vdGVOYW1lTW9kZX1cIiBpbnN0ZWFkYClcbiAgICB9XG4gICAgbW9kZSA9IG5vdGVOYW1lTW9kZVxuICB9XG4gIHJldHVybiBtb2RlXG59XG5cblxuZnVuY3Rpb24gX2lzQmxhY2tLZXkobm90ZU51bWJlcil7XG4gIGxldCBibGFja1xuXG4gIHN3aXRjaCh0cnVlKXtcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTovL0MjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDM6Ly9EI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSA2Oi8vRiNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gODovL0cjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDEwOi8vQSNcbiAgICAgIGJsYWNrID0gdHJ1ZVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJsYWNrID0gZmFsc2VcbiAgfVxuXG4gIHJldHVybiBibGFja1xufVxuIiwiaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7dHlwZVN0cmluZywgY2hlY2tJZkJhc2U2NCwgYmFzZTY0VG9CaW5hcnl9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVTYW1wbGUoc2FtcGxlLCBpZCwgZXZlcnkpe1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgdHJ5e1xuICAgICAgY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoc2FtcGxlLFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2VzcyhidWZmZXIpe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coaWQsIGJ1ZmZlcik7XG4gICAgICAgICAgaWYodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICByZXNvbHZlKHtpZCwgYnVmZmVyfSlcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoe2lkLCBidWZmZXJ9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZShidWZmZXIpO1xuICAgICAgICAgICAgaWYoZXZlcnkpe1xuICAgICAgICAgICAgICBldmVyeShidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmdW5jdGlvbiBvbkVycm9yKCl7XG4gICAgICAgICAgY29uc29sZS5sb2coYGVycm9yIGRlY29kaW5nIGF1ZGlvZGF0YSBbSUQ6ICR7aWR9XWApO1xuICAgICAgICAgIC8vcmVqZWN0KGUpOyAvLyBkb24ndCB1c2UgcmVqZWN0IGJlY2F1c2Ugd2UgdXNlIHRoaXMgYXMgYSBuZXN0ZWQgcHJvbWlzZSBhbmQgd2UgZG9uJ3Qgd2FudCB0aGUgcGFyZW50IHByb21pc2UgdG8gcmVqZWN0XG4gICAgICAgICAgaWYodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICByZXNvbHZlKHtpZH0pXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9Y2F0Y2goZSl7XG4gICAgICBjb25zb2xlLndhcm4oJ2Vycm9yIGRlY29kaW5nIGF1ZGlvZGF0YScsIGlkLCBlKVxuICAgICAgaWYodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKClcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cblxuZnVuY3Rpb24gbG9hZEFuZFBhcnNlU2FtcGxlKHVybCwgaWQsIGV2ZXJ5KXtcbiAgLy9jb25zb2xlLmxvZyhpZCwgdXJsKVxuICAvKlxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdsb2FkaW5nJyxcbiAgICAgIGRhdGE6IHVybFxuICAgIH0pXG4gIH0sIDApXG4gICovXG4gIGRpc3BhdGNoRXZlbnQoe1xuICAgIHR5cGU6ICdsb2FkaW5nJyxcbiAgICBkYXRhOiB1cmxcbiAgfSlcblxuICBsZXQgZXhlY3V0b3IgPSBmdW5jdGlvbihyZXNvbHZlKXtcbiAgICAvLyBjb25zb2xlLmxvZyh1cmwpXG4gICAgZmV0Y2godXJsLCB7XG4gICAgICBtZXRob2Q6ICdHRVQnXG4gICAgfSkudGhlbihcbiAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgaWYocmVzcG9uc2Uub2spe1xuICAgICAgICAgIHJlc3BvbnNlLmFycmF5QnVmZmVyKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coaWQsIGRhdGEpXG4gICAgICAgICAgICBkZWNvZGVTYW1wbGUoZGF0YSwgaWQsIGV2ZXJ5KS50aGVuKHJlc29sdmUpXG4gICAgICAgICAgfSlcbiAgICAgICAgfWVsc2UgaWYodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIClcbiAgfVxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpXG59XG5cblxuZnVuY3Rpb24gZ2V0UHJvbWlzZXMocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSl7XG5cbiAgY29uc3QgZ2V0U2FtcGxlID0gZnVuY3Rpb24oKXtcbiAgICBpZihrZXkgIT09ICdyZWxlYXNlJyAmJiBrZXkgIT09ICdpbmZvJyAmJiBrZXkgIT09ICdzdXN0YWluJyl7XG4gICAgICAvL2NvbnNvbGUubG9nKGtleSlcbiAgICAgIGlmKHNhbXBsZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXtcbiAgICAgICAgcHJvbWlzZXMucHVzaChkZWNvZGVTYW1wbGUoc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KSlcbiAgICAgIH1lbHNlIGlmKHR5cGVvZiBzYW1wbGUgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaWYoY2hlY2tJZkJhc2U2NChzYW1wbGUpKXtcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGRlY29kZVNhbXBsZShiYXNlNjRUb0JpbmFyeShzYW1wbGUpLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhiYXNlVXJsICsgc2FtcGxlKVxuICAgICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKGJhc2VVcmwgKyBlc2NhcGUoc2FtcGxlKSwga2V5LCBldmVyeSkpXG4gICAgICAgIH1cbiAgICAgIH1lbHNlIGlmKHR5cGVvZiBzYW1wbGUgPT09ICdvYmplY3QnKXtcbiAgICAgICAgc2FtcGxlID0gc2FtcGxlLnNhbXBsZSB8fCBzYW1wbGUuYnVmZmVyIHx8IHNhbXBsZS5iYXNlNjQgfHwgc2FtcGxlLnVybFxuICAgICAgICBnZXRTYW1wbGUocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhrZXksIHNhbXBsZSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGUsIHByb21pc2VzLmxlbmd0aClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRTYW1wbGUoKVxufVxuXG5cbi8vIG9ubHkgZm9yIGludGVybmFsbHkgdXNlIGluIHFhbWJpXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGVzMihtYXBwaW5nLCBldmVyeSA9IGZhbHNlKXtcbiAgbGV0IHR5cGUgPSB0eXBlU3RyaW5nKG1hcHBpbmcpLFxuICAgIHByb21pc2VzID0gW10sXG4gICAgYmFzZVVybCA9ICcnXG5cbiAgaWYodHlwZW9mIG1hcHBpbmcuYmFzZVVybCA9PT0gJ3N0cmluZycpe1xuICAgIGJhc2VVcmwgPSBtYXBwaW5nLmJhc2VVcmxcbiAgICBkZWxldGUgbWFwcGluZy5iYXNlVXJsXG4gIH1cblxuICAvL2NvbnNvbGUubG9nKG1hcHBpbmcsIGJhc2VVcmwpXG5cbiAgZXZlcnkgPSB0eXBlb2YgZXZlcnkgPT09ICdmdW5jdGlvbicgPyBldmVyeSA6IGZhbHNlXG4gIC8vY29uc29sZS5sb2codHlwZSwgbWFwcGluZylcbiAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgIE9iamVjdC5rZXlzKG1hcHBpbmcpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgIC8vIGlmKGlzTmFOKGtleSkgPT09IGZhbHNlKXtcbiAgICAgIC8vICAga2V5ID0gcGFyc2VJbnQoa2V5LCAxMClcbiAgICAgIC8vIH1cbiAgICAgIGxldCBhID0gbWFwcGluZ1trZXldXG4gICAgICAvL2NvbnNvbGUubG9nKGtleSwgYSwgdHlwZVN0cmluZyhhKSlcbiAgICAgIGlmKHR5cGVTdHJpbmcoYSkgPT09ICdhcnJheScpe1xuICAgICAgICBhLmZvckVhY2gobWFwID0+IHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKG1hcClcbiAgICAgICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgbWFwLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGdldFByb21pc2VzKHByb21pc2VzLCBhLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KVxuICAgICAgfVxuICAgIH0pXG4gIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgIGxldCBrZXlcbiAgICBtYXBwaW5nLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlKXtcbiAgICAgIC8vIGtleSBpcyBkZWxpYmVyYXRlbHkgdW5kZWZpbmVkXG4gICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgLnRoZW4oKHZhbHVlcykgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZyh0eXBlLCB2YWx1ZXMpXG4gICAgICBpZih0eXBlID09PSAnb2JqZWN0Jyl7XG4gICAgICAgIG1hcHBpbmcgPSB7fVxuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgLy8gc3VwcG9ydCBmb3IgbXVsdGkgbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgICAgIGxldCBtYXAgPSBtYXBwaW5nW3ZhbHVlLmlkXVxuICAgICAgICAgIGxldCB0eXBlID0gdHlwZVN0cmluZyhtYXApXG4gICAgICAgICAgaWYodHlwZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgICAgICAgIG1hcC5wdXNoKHZhbHVlLmJ1ZmZlcilcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IFttYXAsIHZhbHVlLmJ1ZmZlcl1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gdmFsdWUuYnVmZmVyXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAvL2NvbnNvbGUubG9nKG1hcHBpbmcpXG4gICAgICAgIHJlc29sdmUobWFwcGluZylcbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICByZXNvbHZlKHZhbHVlcyk7XG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGVzKC4uLmRhdGEpe1xuICBpZihkYXRhLmxlbmd0aCA9PT0gMSAmJiB0eXBlU3RyaW5nKGRhdGFbMF0pICE9PSAnc3RyaW5nJyl7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhWzBdKVxuICAgIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGFbMF0pXG4gIH1cbiAgcmV0dXJuIHBhcnNlU2FtcGxlczIoZGF0YSlcbn1cbiIsImltcG9ydCB7Z2V0TmljZVRpbWV9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge01JRElOb3RlfSBmcm9tICcuL21pZGlfbm90ZSc7XG5cbmxldFxuICBwcHEsXG4gIGJwbSxcbiAgZmFjdG9yLFxuICBub21pbmF0b3IsXG4gIGRlbm9taW5hdG9yLFxuICBwbGF5YmFja1NwZWVkLFxuXG4gIGJhcixcbiAgYmVhdCxcbiAgc2l4dGVlbnRoLFxuICB0aWNrLFxuICB0aWNrcyxcbiAgbWlsbGlzLFxuXG4gIG1pbGxpc1BlclRpY2ssXG4gIHNlY29uZHNQZXJUaWNrLFxuXG4gIHRpY2tzUGVyQmVhdCxcbiAgdGlja3NQZXJCYXIsXG4gIHRpY2tzUGVyU2l4dGVlbnRoLFxuICBudW1TaXh0ZWVudGgsXG5cbiAgZGlmZlRpY2tzXG4gIC8vcHJldmlvdXNFdmVudFxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKXtcbiAgc2Vjb25kc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHE7XG4gIG1pbGxpc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljayAqIDEwMDA7XG4gIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljaywgYnBtLCBwcHEsIHBsYXliYWNrU3BlZWQsIChwcHEgKiBtaWxsaXNQZXJUaWNrKSk7XG4gIC8vY29uc29sZS5sb2cocHBxKTtcbn1cblxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKXtcbiAgZmFjdG9yID0gKDQgLyBkZW5vbWluYXRvcik7XG4gIG51bVNpeHRlZW50aCA9IGZhY3RvciAqIDQ7XG4gIHRpY2tzUGVyQmVhdCA9IHBwcSAqIGZhY3RvcjtcbiAgdGlja3NQZXJCYXIgPSB0aWNrc1BlckJlYXQgKiBub21pbmF0b3I7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gcHBxIC8gNDtcbiAgLy9jb25zb2xlLmxvZyhkZW5vbWluYXRvciwgZmFjdG9yLCBudW1TaXh0ZWVudGgsIHRpY2tzUGVyQmVhdCwgdGlja3NQZXJCYXIsIHRpY2tzUGVyU2l4dGVlbnRoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCwgZmFzdCA9IGZhbHNlKXtcbiAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgLy8gaWYoZGlmZlRpY2tzIDwgMCl7XG4gIC8vICAgY29uc29sZS5sb2coZGlmZlRpY2tzLCBldmVudC50aWNrcywgcHJldmlvdXNFdmVudC50aWNrcywgcHJldmlvdXNFdmVudC50eXBlKVxuICAvLyB9XG4gIHRpY2sgKz0gZGlmZlRpY2tzO1xuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICAvL3ByZXZpb3VzRXZlbnQgPSBldmVudFxuICAvL2NvbnNvbGUubG9nKGRpZmZUaWNrcywgbWlsbGlzUGVyVGljayk7XG4gIG1pbGxpcyArPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuXG4gIGlmKGZhc3QgPT09IGZhbHNlKXtcbiAgICB3aGlsZSh0aWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCsrO1xuICAgICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICAgIHdoaWxlKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICAgIGJlYXQrKztcbiAgICAgICAgd2hpbGUoYmVhdCA+IG5vbWluYXRvcil7XG4gICAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgICAgYmFyKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUaW1lRXZlbnRzKHNldHRpbmdzLCB0aW1lRXZlbnRzLCBpc1BsYXlpbmcgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlIHRpbWUgZXZlbnRzJylcbiAgbGV0IHR5cGU7XG4gIGxldCBldmVudDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuICBsZXQgZSA9IDA7XG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGUrKywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG4gICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcblxuICAgIHN3aXRjaCh0eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgc2V0VGlja0R1cmF0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBzZXRUaWNrc1BlckJlYXQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICB1cGRhdGVFdmVudChldmVudCwgaXNQbGF5aW5nKTtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJhcnNBc1N0cmluZyk7XG4gIH1cblxuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG4gIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAvL2NvbnNvbGUubG9nKHRpbWVFdmVudHMpO1xufVxuXG5cbi8vZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKHNvbmcsIGV2ZW50cyl7XG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoZXZlbnRzLCBpc1BsYXlpbmcgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlRXZlbnRzJylcbiAgbGV0IGV2ZW50O1xuICBsZXQgc3RhcnRFdmVudCA9IDA7XG4gIGxldCBsYXN0RXZlbnRUaWNrID0gMDtcbiAgbGV0IHJlc3VsdCA9IFtdXG5cbiAgdGljayA9IDBcbiAgdGlja3MgPSAwXG4gIGRpZmZUaWNrcyA9IDBcblxuICAvL2xldCBldmVudHMgPSBbXS5jb25jYXQoZXZ0cywgc29uZy5fdGltZUV2ZW50cyk7XG4gIGxldCBudW1FdmVudHMgPSBldmVudHMubGVuZ3RoXG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuXG4gIC8vIG5vdGVvZmYgY29tZXMgYmVmb3JlIG5vdGVvblxuXG4vKlxuICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gYS5zb3J0SW5kZXggLSBiLnNvcnRJbmRleDtcbiAgfSlcbiovXG5cbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICAvLyBpZihhLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAtMVxuICAgICAgLy8gfWVsc2UgaWYoYi50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gMVxuICAgICAgLy8gfVxuICAgICAgLy8gc2hvcnQ6XG4gICAgICBsZXQgciA9IGEudHlwZSAtIGIudHlwZTtcbiAgICAgIGlmKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgciA9IC0xXG4gICAgICB9XG4gICAgICByZXR1cm4gclxuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3NcbiAgfSlcbiAgZXZlbnQgPSBldmVudHNbMF1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcblxuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcblxuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuXG4gIGZvcihsZXQgaSA9IHN0YXJ0RXZlbnQ7IGkgPCBudW1FdmVudHM7IGkrKyl7XG5cbiAgICBldmVudCA9IGV2ZW50c1tpXTtcblxuICAgIHN3aXRjaChldmVudC50eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuICAgICAgICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgICAgICAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzXG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLGV2ZW50Lm1pbGxpc1BlclRpY2spO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICAgICAgICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzXG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub21pbmF0b3IsbnVtU2l4dGVlbnRoLHRpY2tzUGVyU2l4dGVlbnRoKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG5cblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgIC8vY2FzZSAxMjg6XG4gICAgICAvL2Nhc2UgMTQ0OlxuXG4gICAgICAgIHVwZGF0ZVBvc2l0aW9uKGV2ZW50LCBpc1BsYXlpbmcpO1xuICAgICAgICB1cGRhdGVFdmVudChldmVudCwgaXNQbGF5aW5nKTtcbi8qXG4gICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuKi9cbiAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXIpXG5cbiAgICAgICAgLy8gaWYoZXZlbnQudHlwZSA9PT0gMTc2ICYmIGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQuZGF0YTIsIGV2ZW50LmJhcnNBc1N0cmluZylcbiAgICAgICAgLy8gfVxuXG4gICAgfVxuXG5cbiAgICAvLyBpZihpIDwgMTAwICYmIChldmVudC50eXBlID09PSA4MSB8fCBldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTI4KSl7XG4gICAgLy8gICAvL2NvbnNvbGUubG9nKGksIHRpY2tzLCBkaWZmVGlja3MsIG1pbGxpcywgbWlsbGlzUGVyVGljaylcbiAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50LnR5cGUsIGV2ZW50Lm1pbGxpcywgJ25vdGUnLCBldmVudC5kYXRhMSwgJ3ZlbG8nLCBldmVudC5kYXRhMilcbiAgICAvLyB9XG5cbiAgICBsYXN0RXZlbnRUaWNrID0gZXZlbnQudGlja3M7XG4gIH1cbiAgcGFyc2VNSURJTm90ZXMocmVzdWx0KVxuICByZXR1cm4gcmVzdWx0XG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVFdmVudChldmVudCwgZmFzdCA9IGZhbHNlKXtcbiAgLy9jb25zb2xlLmxvZyhiYXIsIGJlYXQsIHRpY2tzKVxuICAvL2NvbnNvbGUubG9nKGV2ZW50LCBicG0sIG1pbGxpc1BlclRpY2ssIHRpY2tzLCBtaWxsaXMpO1xuXG4gIGV2ZW50LmJwbSA9IGJwbTtcbiAgZXZlbnQubm9taW5hdG9yID0gbm9taW5hdG9yO1xuICBldmVudC5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuXG4gIGV2ZW50LnRpY2tzUGVyQmFyID0gdGlja3NQZXJCYXI7XG4gIGV2ZW50LnRpY2tzUGVyQmVhdCA9IHRpY2tzUGVyQmVhdDtcbiAgZXZlbnQudGlja3NQZXJTaXh0ZWVudGggPSB0aWNrc1BlclNpeHRlZW50aDtcblxuICBldmVudC5mYWN0b3IgPSBmYWN0b3I7XG4gIGV2ZW50Lm51bVNpeHRlZW50aCA9IG51bVNpeHRlZW50aDtcbiAgZXZlbnQuc2Vjb25kc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljaztcbiAgZXZlbnQubWlsbGlzUGVyVGljayA9IG1pbGxpc1BlclRpY2s7XG5cblxuICBldmVudC50aWNrcyA9IHRpY2tzO1xuXG4gIGV2ZW50Lm1pbGxpcyA9IG1pbGxpcztcbiAgZXZlbnQuc2Vjb25kcyA9IG1pbGxpcyAvIDEwMDA7XG5cbiAgaWYoZmFzdCl7XG4gICAgcmV0dXJuXG4gIH1cblxuICBldmVudC5iYXIgPSBiYXI7XG4gIGV2ZW50LmJlYXQgPSBiZWF0O1xuICBldmVudC5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gIGV2ZW50LnRpY2sgPSB0aWNrO1xuICAvL2V2ZW50LmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrO1xuICB2YXIgdGlja0FzU3RyaW5nID0gdGljayA9PT0gMCA/ICcwMDAnIDogdGljayA8IDEwID8gJzAwJyArIHRpY2sgOiB0aWNrIDwgMTAwID8gJzAnICsgdGljayA6IHRpY2s7XG4gIGV2ZW50LmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gIGV2ZW50LmJhcnNBc0FycmF5ID0gW2JhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXTtcblxuXG4gIHZhciB0aW1lRGF0YSA9IGdldE5pY2VUaW1lKG1pbGxpcyk7XG5cbiAgZXZlbnQuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gIGV2ZW50Lm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgZXZlbnQuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICBldmVudC5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICBldmVudC50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG4gIGV2ZW50LnRpbWVBc0FycmF5ID0gdGltZURhdGEudGltZUFzQXJyYXk7XG5cbiAgLy8gaWYobWlsbGlzIDwgMCl7XG4gIC8vICAgY29uc29sZS5sb2coZXZlbnQpXG4gIC8vIH1cblxuXG59XG5cblxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElOb3RlcyhldmVudHMpe1xuICBsZXQgbm90ZXMgPSB7fVxuICBsZXQgbm90ZXNJblRyYWNrXG4gIGxldCBuID0gMFxuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKHR5cGVvZiBldmVudC5fcGFydCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGV2ZW50Ll90cmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgY29uc29sZS5sb2coJ25vIHBhcnQgYW5kL29yIHRyYWNrIHNldCcsIGV2ZW50KVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50Ll90cmFjay5pZF1cbiAgICAgIGlmKHR5cGVvZiBub3Rlc0luVHJhY2sgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXSA9IHt9XG4gICAgICB9XG4gICAgICBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdID0gZXZlbnRcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBjb3JyZXNwb25kaW5nIG5vdGVvbiBldmVudCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlT24gPSBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdXG4gICAgICBsZXQgbm90ZU9mZiA9IGV2ZW50XG4gICAgICBpZih0eXBlb2Ygbm90ZU9uID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIG5vdGVvbiBldmVudCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50Ll90cmFjay5pZF1bZXZlbnQuZGF0YTFdXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBsZXQgbm90ZSA9IG5ldyBNSURJTm90ZShub3RlT24sIG5vdGVPZmYpXG4gICAgICBub3RlLl90cmFjayA9IG5vdGVPbi5fdHJhY2tcbiAgICAgIG5vdGUgPSBudWxsXG4gICAgICAvLyBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgICAgLy8gbm90ZU9uLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgLy8gbm90ZU9uLm9mZiA9IG5vdGVPZmYuaWRcbiAgICAgIC8vIG5vdGVPZmYubWlkaU5vdGVJZCA9IGlkXG4gICAgICAvLyBub3RlT2ZmLm9uID0gbm90ZU9uLmlkXG4gICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICB9XG4gIH1cbiAgT2JqZWN0LmtleXMobm90ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICBkZWxldGUgbm90ZXNba2V5XVxuICB9KVxuICBub3RlcyA9IHt9XG4gIC8vY29uc29sZS5sb2cobm90ZXMsIG5vdGVzSW5UcmFjaylcbn1cblxuXG4vLyBub3QgaW4gdXNlIVxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckV2ZW50cyhldmVudHMpe1xuICBsZXQgc3VzdGFpbiA9IHt9XG4gIGxldCB0bXBSZXN1bHQgPSB7fVxuICBsZXQgcmVzdWx0ID0gW11cbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICBpZih0eXBlb2Ygc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1lbHNlIGlmKHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09IGV2ZW50LnRpY2tzKXtcbiAgICAgICAgICBkZWxldGUgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50XG4gICAgICAgIGRlbGV0ZSBzdXN0YWluW2V2ZW50LnRyYWNrSWRdXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMTI3KXtcbiAgICAgICAgc3VzdGFpbltldmVudC50cmFja0lkXSA9IGV2ZW50LnRpY2tzXG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKHN1c3RhaW4pXG4gIE9iamVjdC5rZXlzKHRtcFJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGxldCBzdXN0YWluRXZlbnQgPSB0bXBSZXN1bHRba2V5XVxuICAgIGNvbnNvbGUubG9nKHN1c3RhaW5FdmVudClcbiAgICByZXN1bHQucHVzaChzdXN0YWluRXZlbnQpXG4gIH0pXG4gIHJldHVybiByZXN1bHRcbn1cbiIsIi8vIEAgZmxvd1xuXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBQYXJ0e1xuXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzID0ge30pe1xuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWA7XG5cbiAgICAoe1xuICAgICAgbmFtZTogdGhpcy5uYW1lID0gdGhpcy5pZCxcbiAgICAgIG11dGVkOiB0aGlzLm11dGVkID0gZmFsc2UsXG4gICAgfSA9IHNldHRpbmdzKTtcblxuICAgIHRoaXMuX3RyYWNrID0gbnVsbFxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG4gICAgdGhpcy5fZXZlbnRzID0gW11cbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuICAgIHRoaXMuX3N0YXJ0ID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gICAgdGhpcy5fZW5kID0ge21pbGxpczogMCwgdGlja3M6IDB9XG5cbiAgICBsZXQge2V2ZW50c30gPSBzZXR0aW5nc1xuICAgIGlmKHR5cGVvZiBldmVudHMgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICB9XG4gIH1cblxuICBjb3B5KCl7XG4gICAgbGV0IHAgPSBuZXcgUGFydCh0aGlzLm5hbWUgKyAnX2NvcHknKSAvLyBpbXBsZW1lbnQgZ2V0TmFtZU9mQ29weSgpIGluIHV0aWwgKHNlZSBoZWFydGJlYXQpXG4gICAgbGV0IGV2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgbGV0IGNvcHkgPSBldmVudC5jb3B5KClcbiAgICAgIGNvbnNvbGUubG9nKGNvcHkpXG4gICAgICBldmVudHMucHVzaChjb3B5KVxuICAgIH0pXG4gICAgcC5hZGRFdmVudHMoLi4uZXZlbnRzKVxuICAgIHAudXBkYXRlKClcbiAgICByZXR1cm4gcFxuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnRyYW5zcG9zZShhbW91bnQpXG4gICAgfSlcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmUodGlja3M6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlVG8odGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIGFkZEV2ZW50cyguLi5ldmVudHMpe1xuICAgIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICAgIGxldCB0cmFjayA9IHRoaXMuX3RyYWNrXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5fcGFydCA9IHRoaXNcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudClcbiAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdHJhY2tcbiAgICAgICAgaWYodHJhY2suX3Nvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gdHJhY2suX3NvbmdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuXG4gICAgaWYodHJhY2spe1xuICAgICAgdHJhY2suX2V2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRyYWNrLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICB9XG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9uZXdFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCh0aGlzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIHJlbW92ZUV2ZW50cyguLi5ldmVudHMpe1xuICAgIGxldCB0cmFjayA9IHRoaXMuX3RyYWNrXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5fcGFydCA9IG51bGxcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICAgICAgaWYodHJhY2spe1xuICAgICAgICBldmVudC5fdHJhY2sgPSBudWxsXG4gICAgICAgIHRyYWNrLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICAgICAgaWYodHJhY2suX3Nvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gbnVsbFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBpZih0cmFjayl7XG4gICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgICB0cmFjay5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgICB9XG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcylcbiAgICB9XG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHModGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKHRoaXMpXG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlRXZlbnRzVG8odGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcylcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKGZpbHRlcjogc3RyaW5nW10gPSBudWxsKXsgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c10gLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgfVxuXG4gIG11dGUoZmxhZzogYm9vbGVhbiA9IG51bGwpe1xuICAgIGlmKGZsYWcpe1xuICAgICAgdGhpcy5tdXRlZCA9IGZsYWdcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMubXV0ZWQgPSAhdGhpcy5tdXRlZFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYodGhpcy5fY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB9XG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIC8vQFRPRE86IGNhbGN1bGF0ZSBwYXJ0IHN0YXJ0IGFuZCBlbmQsIGFuZCBoaWdoZXN0IGFuZCBsb3dlc3Qgbm90ZVxuICB9XG59XG4iLCJpbXBvcnQge2dldFBvc2l0aW9uMn0gZnJvbSAnLi9wb3NpdGlvbi5qcydcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyLmpzJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwuanMnXG5cbmNvbnN0IHJhbmdlID0gMTAgLy8gbWlsbGlzZWNvbmRzIG9yIHRpY2tzXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFBsYXloZWFke1xuXG4gIGNvbnN0cnVjdG9yKHNvbmcsIHR5cGUgPSAnYWxsJyl7XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMuc29uZyA9IHNvbmdcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5sYXN0RXZlbnQgPSBudWxsXG4gICAgdGhpcy5kYXRhID0ge31cblxuICAgIHRoaXMuYWN0aXZlUGFydHMgPSBbXVxuICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbXVxuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW11cbiAgfVxuXG4gIC8vIHVuaXQgY2FuIGJlICdtaWxsaXMnIG9yICd0aWNrcydcbiAgc2V0KHVuaXQsIHZhbHVlKXtcbiAgICB0aGlzLnVuaXQgPSB1bml0XG4gICAgdGhpcy5jdXJyZW50VmFsdWUgPSB2YWx1ZVxuICAgIHRoaXMuZXZlbnRJbmRleCA9IDBcbiAgICB0aGlzLm5vdGVJbmRleCA9IDBcbiAgICB0aGlzLnBhcnRJbmRleCA9IDBcbiAgICB0aGlzLmNhbGN1bGF0ZSgpXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICBnZXQoKXtcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuXG4gIHVwZGF0ZSh1bml0LCBkaWZmKXtcbiAgICBpZihkaWZmID09PSAwKXtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFcbiAgICB9XG4gICAgdGhpcy51bml0ID0gdW5pdFxuICAgIHRoaXMuY3VycmVudFZhbHVlICs9IGRpZmZcbiAgICB0aGlzLmNhbGN1bGF0ZSgpXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cblxuICB1cGRhdGVTb25nKCl7XG4gICAgdGhpcy5ldmVudHMgPSBbLi4udGhpcy5zb25nLl9ldmVudHMsIC4uLnRoaXMuc29uZy5fdGltZUV2ZW50c11cbiAgICBzb3J0RXZlbnRzKHRoaXMuZXZlbnRzKVxuICAgIC8vY29uc29sZS5sb2coJ2V2ZW50cyAlTycsIHRoaXMuZXZlbnRzKVxuICAgIHRoaXMubm90ZXMgPSB0aGlzLnNvbmcuX25vdGVzXG4gICAgdGhpcy5wYXJ0cyA9IHRoaXMuc29uZy5fcGFydHNcbiAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aFxuICAgIHRoaXMubnVtTm90ZXMgPSB0aGlzLm5vdGVzLmxlbmd0aFxuICAgIHRoaXMubnVtUGFydHMgPSB0aGlzLnBhcnRzLmxlbmd0aFxuICAgIHRoaXMuc2V0KCdtaWxsaXMnLCB0aGlzLnNvbmcuX2N1cnJlbnRNaWxsaXMpXG4gIH1cblxuXG4gIGNhbGN1bGF0ZSgpe1xuICAgIGxldCBpXG4gICAgbGV0IHZhbHVlXG4gICAgbGV0IGV2ZW50XG4gICAgbGV0IG5vdGVcbiAgICBsZXQgcGFydFxuICAgIGxldCBwb3NpdGlvblxuICAgIGxldCBzdGlsbEFjdGl2ZU5vdGVzID0gW11cbiAgICBsZXQgc3RpbGxBY3RpdmVQYXJ0cyA9IFtdXG4gICAgbGV0IGNvbGxlY3RlZFBhcnRzID0gbmV3IFNldCgpXG4gICAgbGV0IGNvbGxlY3RlZE5vdGVzID0gbmV3IFNldCgpXG5cbiAgICB0aGlzLmRhdGEgPSB7fVxuICAgIHRoaXMuYWN0aXZlRXZlbnRzID0gW11cbiAgICBsZXQgc3VzdGFpbnBlZGFsRXZlbnRzID0gW11cblxuICAgIGZvcihpID0gdGhpcy5ldmVudEluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IHRoaXMuZXZlbnRzW2ldXG4gICAgICB2YWx1ZSA9IGV2ZW50W3RoaXMudW5pdF1cbiAgICAgIGlmKHZhbHVlIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgLy8gaWYgdGhlIHBsYXloZWFkIGlzIHNldCB0byBhIHBvc2l0aW9uIG9mIHNheSAzMDAwIG1pbGxpcywgd2UgZG9uJ3Qgd2FudCB0byBhZGQgZXZlbnRzIG1vcmUgdGhhdCAxMCB1bml0cyBiZWZvcmUgdGhlIHBsYXloZWFkXG4gICAgICAgIGlmKHZhbHVlID09PSAwIHx8IHZhbHVlID4gdGhpcy5jdXJyZW50VmFsdWUgLSByYW5nZSl7XG4gICAgICAgICAgdGhpcy5hY3RpdmVFdmVudHMucHVzaChldmVudClcbiAgICAgICAgICAvLyB0aGlzIGRvZXNuJ3Qgd29yayB0b28gd2VsbFxuICAgICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMilcbiAgICAgICAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwyJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBldmVudC5kYXRhMiA9PT0gMTI3ID8gJ2Rvd24nIDogJ3VwJ1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBzdXN0YWlucGVkYWxFdmVudHMucHVzaChldmVudClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAvLyB9ZWxzZXtcbiAgICAgICAgICAvLyAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgIC8vICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICAgIC8vICAgICBkYXRhOiBldmVudFxuICAgICAgICAgIC8vICAgfSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgICBkYXRhOiBldmVudFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0RXZlbnQgPSBldmVudFxuICAgICAgICB0aGlzLmV2ZW50SW5kZXgrK1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIC8vIGxldCBudW0gPSBzdXN0YWlucGVkYWxFdmVudHMubGVuZ3RoXG4gICAgLy8gaWYobnVtID4gMCl7XG4gICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLmN1cnJlbnRWYWx1ZSwgbnVtLCBzdXN0YWlucGVkYWxFdmVudHNbbnVtIC0gMV0uZGF0YTIsIHN1c3RhaW5wZWRhbEV2ZW50cylcbiAgICAvLyB9XG5cbiAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgdGhpcy5kYXRhLmFjdGl2ZUV2ZW50cyA9IHRoaXMuYWN0aXZlRXZlbnRzXG5cbiAgICAvLyBpZiBhIHNvbmcgaGFzIG5vIGV2ZW50cyB5ZXQsIHVzZSB0aGUgZmlyc3QgdGltZSBldmVudCBhcyByZWZlcmVuY2VcbiAgICBpZih0aGlzLmxhc3RFdmVudCA9PT0gbnVsbCl7XG4gICAgICB0aGlzLmxhc3RFdmVudCA9IHRoaXMuc29uZy5fdGltZUV2ZW50c1swXVxuICAgIH1cblxuICAgIHBvc2l0aW9uID0gZ2V0UG9zaXRpb24yKHRoaXMuc29uZywgdGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSwgJ2FsbCcsIHRoaXMubGFzdEV2ZW50KVxuICAgIHRoaXMuZGF0YS5ldmVudEluZGV4ID0gdGhpcy5ldmVudEluZGV4XG4gICAgdGhpcy5kYXRhLm1pbGxpcyA9IHBvc2l0aW9uLm1pbGxpc1xuICAgIHRoaXMuZGF0YS50aWNrcyA9IHBvc2l0aW9uLnRpY2tzXG4gICAgdGhpcy5kYXRhLnBvc2l0aW9uID0gcG9zaXRpb25cblxuICAgIGlmKHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpe1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmRhdGFcbiAgICAgIGZvcihsZXQga2V5IG9mIE9iamVjdC5rZXlzKHBvc2l0aW9uKSl7XG4gICAgICAgIGRhdGFba2V5XSA9IHBvc2l0aW9uW2tleV1cbiAgICAgIH1cbiAgICB9ZWxzZSBpZih0aGlzLnR5cGUuaW5kZXhPZignYmFyc2JlYXRzJykgIT09IC0xKXtcbiAgICAgIHRoaXMuZGF0YS5iYXIgPSBwb3NpdGlvbi5iYXJcbiAgICAgIHRoaXMuZGF0YS5iZWF0ID0gcG9zaXRpb24uYmVhdFxuICAgICAgdGhpcy5kYXRhLnNpeHRlZW50aCA9IHBvc2l0aW9uLnNpeHRlZW50aFxuICAgICAgdGhpcy5kYXRhLnRpY2sgPSBwb3NpdGlvbi50aWNrXG4gICAgICB0aGlzLmRhdGEuYmFyc0FzU3RyaW5nID0gcG9zaXRpb24uYmFyc0FzU3RyaW5nXG5cbiAgICAgIHRoaXMuZGF0YS50aWNrc1BlckJhciA9IHBvc2l0aW9uLnRpY2tzUGVyQmFyXG4gICAgICB0aGlzLmRhdGEudGlja3NQZXJCZWF0ID0gcG9zaXRpb24udGlja3NQZXJCZWF0XG4gICAgICB0aGlzLmRhdGEudGlja3NQZXJTaXh0ZWVudGggPSBwb3NpdGlvbi50aWNrc1BlclNpeHRlZW50aFxuICAgICAgdGhpcy5kYXRhLm51bVNpeHRlZW50aCA9IHBvc2l0aW9uLm51bVNpeHRlZW50aFxuXG4gICAgfWVsc2UgaWYodGhpcy50eXBlLmluZGV4T2YoJ3RpbWUnKSAhPT0gLTEpe1xuICAgICAgdGhpcy5kYXRhLmhvdXIgPSBwb3NpdGlvbi5ob3VyXG4gICAgICB0aGlzLmRhdGEubWludXRlID0gcG9zaXRpb24ubWludXRlXG4gICAgICB0aGlzLmRhdGEuc2Vjb25kID0gcG9zaXRpb24uc2Vjb25kXG4gICAgICB0aGlzLmRhdGEubWlsbGlzZWNvbmQgPSBwb3NpdGlvbi5taWxsaXNlY29uZFxuICAgICAgdGhpcy5kYXRhLnRpbWVBc1N0cmluZyA9IHBvc2l0aW9uLnRpbWVBc1N0cmluZ1xuXG4gICAgfWVsc2UgaWYodGhpcy50eXBlLmluZGV4T2YoJ3BlcmNlbnRhZ2UnKSAhPT0gLTEpe1xuICAgICAgdGhpcy5kYXRhLnBlcmNlbnRhZ2UgPSBwb3NpdGlvbi5wZXJjZW50YWdlXG4gICAgfVxuXG4gICAgLy8gZ2V0IGFjdGl2ZSBub3Rlc1xuICAgIGlmKHRoaXMudHlwZS5pbmRleE9mKCdub3RlcycpICE9PSAtMSB8fCB0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKXtcblxuICAgICAgLy8gZ2V0IGFsbCBub3RlcyBiZXR3ZWVuIHRoZSBub3RlSW5kZXggYW5kIHRoZSBjdXJyZW50IHBsYXloZWFkIHBvc2l0aW9uXG4gICAgICBmb3IoaSA9IHRoaXMubm90ZUluZGV4OyBpIDwgdGhpcy5udW1Ob3RlczsgaSsrKXtcbiAgICAgICAgbm90ZSA9IHRoaXMubm90ZXNbaV1cbiAgICAgICAgdmFsdWUgPSBub3RlLm5vdGVPblt0aGlzLnVuaXRdXG4gICAgICAgIGlmKHZhbHVlIDw9IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICB0aGlzLm5vdGVJbmRleCsrXG4gICAgICAgICAgaWYodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGlmIHRoZSBwbGF5aGVhZCBpcyBzZXQgdG8gYSBwb3NpdGlvbiBvZiBzYXkgMzAwMCBtaWxsaXMsIHdlIGRvbid0IHdhbnQgdG8gYWRkIG5vdGVzIGJlZm9yZSB0aGUgcGxheWhlYWRcbiAgICAgICAgICBpZih0aGlzLmN1cnJlbnRWYWx1ZSA9PT0gMCB8fCBub3RlLm5vdGVPZmZbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICAgIGNvbGxlY3RlZE5vdGVzLmFkZChub3RlKVxuICAgICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICAgIHR5cGU6ICdub3RlT24nLFxuICAgICAgICAgICAgICBkYXRhOiBub3RlLm5vdGVPblxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGZpbHRlciBub3RlcyB0aGF0IGFyZSBubyBsb25nZXIgYWN0aXZlXG4gICAgICBmb3IoaSA9IHRoaXMuYWN0aXZlTm90ZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgICBub3RlID0gdGhpcy5hY3RpdmVOb3Rlc1tpXTtcbiAgICAgICAgLy9pZihub3RlLm5vdGVPbi5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9ub3Rlc0J5SWQuZ2V0KG5vdGUuaWQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHRoaXMuc29uZy5fbm90ZXNCeUlkLmdldChub3RlLmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgbm90ZScsIG5vdGUuaWQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIG5vdGUubm90ZU9mZiA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnNvbGUud2Fybignbm90ZSB3aXRoIGlkJywgbm90ZS5pZCwgJ2hhcyBubyBub3RlT2ZmIGV2ZW50Jyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkTm90ZXMuaGFzKG5vdGUpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHN0aWxsQWN0aXZlTm90ZXMucHVzaChub3RlKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnbm90ZU9mZicsXG4gICAgICAgICAgICBkYXRhOiBub3RlLm5vdGVPZmZcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGFkZCB0aGUgc3RpbGwgYWN0aXZlIG5vdGVzIGFuZCB0aGUgbmV3bHkgYWN0aXZlIGV2ZW50cyB0byB0aGUgYWN0aXZlIG5vdGVzIGFycmF5XG4gICAgICB0aGlzLmFjdGl2ZU5vdGVzID0gWy4uLmNvbGxlY3RlZE5vdGVzLnZhbHVlcygpLCAuLi5zdGlsbEFjdGl2ZU5vdGVzXVxuICAgICAgdGhpcy5kYXRhLmFjdGl2ZU5vdGVzID0gdGhpcy5hY3RpdmVOb3Rlc1xuICAgIH1cblxuXG4gICAgLy8gZ2V0IGFjdGl2ZSBwYXJ0c1xuICAgIGlmKHRoaXMudHlwZS5pbmRleE9mKCdwYXJ0cycpICE9PSAtMSB8fCB0aGlzLnR5cGUuaW5kZXhPZignYWxsJykgIT09IC0xKXtcblxuICAgICAgZm9yKGkgPSB0aGlzLnBhcnRJbmRleDsgaSA8IHRoaXMubnVtUGFydHM7IGkrKyl7XG4gICAgICAgIHBhcnQgPSB0aGlzLnBhcnRzW2ldXG4gICAgICAgIC8vY29uc29sZS5sb2cocGFydCwgdGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIGlmKHBhcnQuX3N0YXJ0W3RoaXMudW5pdF0gPD0gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIGNvbGxlY3RlZFBhcnRzLmFkZChwYXJ0KVxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ3BhcnRPbicsXG4gICAgICAgICAgICBkYXRhOiBwYXJ0XG4gICAgICAgICAgfSlcbiAgICAgICAgICB0aGlzLnBhcnRJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuXG4gICAgICAvLyBmaWx0ZXIgcGFydHMgdGhhdCBhcmUgbm8gbG9uZ2VyIGFjdGl2ZVxuICAgICAgZm9yKGkgPSB0aGlzLmFjdGl2ZVBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcbiAgICAgICAgcGFydCA9IHRoaXMuYWN0aXZlUGFydHNbaV07XG4gICAgICAgIC8vaWYocGFydC5zdGF0ZS5pbmRleE9mKCdyZW1vdmVkJykgPT09IDAgfHwgdGhpcy5zb25nLl9wYXJ0c0J5SWQuZ2V0KHBhcnQuaWQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHRoaXMuc29uZy5fcGFydHNCeUlkLmdldChwYXJ0LmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NraXBwaW5nIHJlbW92ZWQgcGFydCcsIHBhcnQuaWQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZihwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlICYmIGNvbGxlY3RlZFBhcnRzLmhhcyhwYXJ0KSA9PT0gZmFsc2Upe1xuICAgICAgICBpZihwYXJ0Ll9lbmRbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICBzdGlsbEFjdGl2ZVBhcnRzLnB1c2gobm90ZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ3BhcnRPZmYnLFxuICAgICAgICAgICAgZGF0YTogcGFydFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hY3RpdmVQYXJ0cyA9IFsuLi5jb2xsZWN0ZWRQYXJ0cy52YWx1ZXMoKSwgLi4uc3RpbGxBY3RpdmVQYXJ0c11cbiAgICAgIHRoaXMuZGF0YS5hY3RpdmVQYXJ0cyA9IHRoaXMuYWN0aXZlUGFydHNcbiAgICB9XG5cbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICBkYXRhOiB0aGlzLmRhdGFcbiAgICB9KVxuXG4gIH1cblxuLypcbiAgc2V0VHlwZSh0KXtcbiAgICB0aGlzLnR5cGUgPSB0O1xuICAgIHRoaXMuc2V0KHRoaXMudW5pdCwgdGhpcy5jdXJyZW50VmFsdWUpO1xuICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gIH1cblxuXG4gIGFkZFR5cGUodCl7XG4gICAgdGhpcy50eXBlICs9ICcgJyArIHQ7XG4gICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgfVxuXG4gIHJlbW92ZVR5cGUodCl7XG4gICAgdmFyIGFyciA9IHRoaXMudHlwZS5zcGxpdCgnICcpO1xuICAgIHRoaXMudHlwZSA9ICcnO1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpe1xuICAgICAgaWYodHlwZSAhPT0gdCl7XG4gICAgICAgIHRoaXMudHlwZSArPSB0ICsgJyAnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMudHlwZS50cmltKCk7XG4gICAgdGhpcy5zZXQodGhpcy5jdXJyZW50VmFsdWUpO1xuICAgIC8vY29uc29sZS5sb2codHlwZSxhY3RpdmVQYXJ0cyk7XG4gIH1cbiovXG5cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtnZXROaWNlVGltZX0gZnJvbSAnLi91dGlsJztcblxuY29uc3RcbiAgc3VwcG9ydGVkVHlwZXMgPSAnYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBwZXJjIHBlcmNlbnRhZ2UnLFxuICBzdXBwb3J0ZWRSZXR1cm5UeXBlcyA9ICdiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIGFsbCcsXG4gIGZsb29yID0gTWF0aC5mbG9vcixcbiAgcm91bmQgPSBNYXRoLnJvdW5kO1xuXG5cbmxldFxuICAvL2xvY2FsXG4gIGJwbSxcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIHRpY2tzLFxuICBtaWxsaXMsXG4gIGRpZmZUaWNrcyxcbiAgZGlmZk1pbGxpcyxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcblxuLy8gIHR5cGUsXG4gIGluZGV4LFxuICByZXR1cm5UeXBlID0gJ2FsbCcsXG4gIGJleW9uZEVuZE9mU29uZyA9IHRydWU7XG5cblxuZnVuY3Rpb24gZ2V0VGltZUV2ZW50KHNvbmcsIHVuaXQsIHRhcmdldCl7XG4gIC8vIGZpbmRzIHRoZSB0aW1lIGV2ZW50IHRoYXQgY29tZXMgdGhlIGNsb3Nlc3QgYmVmb3JlIHRoZSB0YXJnZXQgcG9zaXRpb25cbiAgbGV0IHRpbWVFdmVudHMgPSBzb25nLl90aW1lRXZlbnRzXG4gIC8vY29uc29sZS5sb2coc29uZy5fdGltZUV2ZW50cywgdW5pdCwgdGFyZ2V0KVxuXG4gIGZvcihsZXQgaSA9IHRpbWVFdmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgIGxldCBldmVudCA9IHRpbWVFdmVudHNbaV07XG4gICAgLy9jb25zb2xlLmxvZyh1bml0LCB0YXJnZXQsIGV2ZW50KVxuICAgIGlmKGV2ZW50W3VuaXRdIDw9IHRhcmdldCl7XG4gICAgICBpbmRleCA9IGlcbiAgICAgIHJldHVybiBldmVudFxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNUb1RpY2tzKHNvbmcsIHRhcmdldE1pbGxpcywgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0TWlsbGlzKVxuICAvL3JldHVybiByb3VuZCh0aWNrcyk7XG4gIHJldHVybiB0aWNrc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrc1RvTWlsbGlzKHNvbmcsIHRhcmdldFRpY2tzLCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldFRpY2tzKVxuICByZXR1cm4gbWlsbGlzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGJhcnNUb01pbGxpcyhzb25nLCBwb3NpdGlvbiwgYmVvcyl7IC8vIGJlb3MgPSBiZXlvbmRFbmRPZlNvbmdcbiAgY2FsY3VsYXRlUG9zaXRpb24oc29uZywge1xuICAgIHR5cGU6ICdiYXJzYmVhdCcsXG4gICAgcG9zaXRpb24sXG4gICAgcmVzdWx0OiAnbWlsbGlzJyxcbiAgICBiZW9zLFxuICB9KVxuICByZXR1cm4gbWlsbGlzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGJhcnNUb1RpY2tzKHNvbmcsIHBvc2l0aW9uLCBiZW9zKXsgLy8gYmVvcyA9IGJleW9uZEVuZE9mU29uZ1xuICBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0cycsXG4gICAgcG9zaXRpb24sXG4gICAgcmVzdWx0OiAndGlja3MnLFxuICAgIGJlb3NcbiAgfSlcbiAgLy9yZXR1cm4gcm91bmQodGlja3MpO1xuICByZXR1cm4gdGlja3Ncbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdGlja3NUb0JhcnMoc29uZywgdGFyZ2V0LCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldClcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgcmV0dXJuVHlwZSA9ICdiYXJzYW5kYmVhdHMnXG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXNUb0JhcnMoc29uZywgdGFyZ2V0LCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQpXG4gIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJ1xuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKClcbn1cblxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciBtaWxsaXMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0TWlsbGlzLCBldmVudCl7XG4gIGxldCBsYXN0RXZlbnQgPSBzb25nLl9sYXN0RXZlbnQ7XG5cbiAgaWYoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSl7XG4gICAgaWYodGFyZ2V0TWlsbGlzID4gbGFzdEV2ZW50Lm1pbGxpcyl7XG4gICAgICB0YXJnZXRNaWxsaXMgPSBsYXN0RXZlbnQubWlsbGlzO1xuICAgIH1cbiAgfVxuXG4gIGlmKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdtaWxsaXMnLCB0YXJnZXRNaWxsaXMpO1xuICB9XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG4gIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuXG4gIC8vIGlmIHRoZSBldmVudCBpcyBub3QgZXhhY3RseSBhdCB0YXJnZXQgbWlsbGlzLCBjYWxjdWxhdGUgdGhlIGRpZmZcbiAgaWYoZXZlbnQubWlsbGlzID09PSB0YXJnZXRNaWxsaXMpe1xuICAgIGRpZmZNaWxsaXMgPSAwO1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gIH1lbHNle1xuICAgIGRpZmZNaWxsaXMgPSB0YXJnZXRNaWxsaXMgLSBldmVudC5taWxsaXM7XG4gICAgZGlmZlRpY2tzID0gZGlmZk1pbGxpcyAvIG1pbGxpc1BlclRpY2s7XG4gIH1cblxuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuXG4gIHJldHVybiB0aWNrcztcbn1cblxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciB0aWNrcyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbVRpY2tzKHNvbmcsIHRhcmdldFRpY2tzLCBldmVudCl7XG4gIGxldCBsYXN0RXZlbnQgPSBzb25nLl9sYXN0RXZlbnQ7XG5cbiAgaWYoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSl7XG4gICAgaWYodGFyZ2V0VGlja3MgPiBsYXN0RXZlbnQudGlja3Mpe1xuICAgICAgdGFyZ2V0VGlja3MgPSBsYXN0RXZlbnQudGlja3M7XG4gICAgfVxuICB9XG5cbiAgaWYodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ3RpY2tzJywgdGFyZ2V0VGlja3MpO1xuICB9XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG4gIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuXG4gIC8vIGlmIHRoZSBldmVudCBpcyBub3QgZXhhY3RseSBhdCB0YXJnZXQgdGlja3MsIGNhbGN1bGF0ZSB0aGUgZGlmZlxuICBpZihldmVudC50aWNrcyA9PT0gdGFyZ2V0VGlja3Mpe1xuICAgIGRpZmZUaWNrcyA9IDA7XG4gICAgZGlmZk1pbGxpcyA9IDA7XG4gIH1lbHNle1xuICAgIGRpZmZUaWNrcyA9IHRhcmdldFRpY2tzIC0gdGlja3M7XG4gICAgZGlmZk1pbGxpcyA9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG4gIH1cblxuICB0aWNrcyArPSBkaWZmVGlja3M7XG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuXG4gIHJldHVybiBtaWxsaXM7XG59XG5cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgYmFycyBhbmQgYmVhdHMgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21CYXJzKHNvbmcsIHRhcmdldEJhciwgdGFyZ2V0QmVhdCwgdGFyZ2V0U2l4dGVlbnRoLCB0YXJnZXRUaWNrLCBldmVudCA9IG51bGwpe1xuICAvL2NvbnNvbGUudGltZSgnZnJvbUJhcnMnKTtcbiAgbGV0IGkgPSAwLFxuICAgIGRpZmZCYXJzLFxuICAgIGRpZmZCZWF0cyxcbiAgICBkaWZmU2l4dGVlbnRoLFxuICAgIGRpZmZUaWNrLFxuICAgIGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRCYXIgPiBsYXN0RXZlbnQuYmFyKXtcbiAgICAgIHRhcmdldEJhciA9IGxhc3RFdmVudC5iYXI7XG4gICAgfVxuICB9XG5cbiAgaWYoZXZlbnQgPT09IG51bGwpe1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdiYXInLCB0YXJnZXRCYXIpO1xuICB9XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG4gIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuXG4gIC8vY29ycmVjdCB3cm9uZyBwb3NpdGlvbiBkYXRhLCBmb3IgaW5zdGFuY2U6ICczLDMsMiw3ODgnIGJlY29tZXMgJzMsNCw0LDA2OCcgaW4gYSA0LzQgbWVhc3VyZSBhdCBQUFEgNDgwXG4gIHdoaWxlKHRhcmdldFRpY2sgPj0gdGlja3NQZXJTaXh0ZWVudGgpe1xuICAgIHRhcmdldFNpeHRlZW50aCsrO1xuICAgIHRhcmdldFRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gIH1cblxuICB3aGlsZSh0YXJnZXRTaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgIHRhcmdldEJlYXQrKztcbiAgICB0YXJnZXRTaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICB9XG5cbiAgd2hpbGUodGFyZ2V0QmVhdCA+IG5vbWluYXRvcil7XG4gICAgdGFyZ2V0QmFyKys7XG4gICAgdGFyZ2V0QmVhdCAtPSBub21pbmF0b3I7XG4gIH1cblxuICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnYmFyJywgdGFyZ2V0QmFyLCBpbmRleCk7XG4gIGZvcihpID0gaW5kZXg7IGkgPj0gMDsgaS0tKXtcbiAgICBldmVudCA9IHNvbmcuX3RpbWVFdmVudHNbaV07XG4gICAgaWYoZXZlbnQuYmFyIDw9IHRhcmdldEJhcil7XG4gICAgICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIGdldCB0aGUgZGlmZmVyZW5jZXNcbiAgZGlmZlRpY2sgPSB0YXJnZXRUaWNrIC0gdGljaztcbiAgZGlmZlNpeHRlZW50aCA9IHRhcmdldFNpeHRlZW50aCAtIHNpeHRlZW50aDtcbiAgZGlmZkJlYXRzID0gdGFyZ2V0QmVhdCAtIGJlYXQ7XG4gIGRpZmZCYXJzID0gdGFyZ2V0QmFyIC0gYmFyOyAvL2JhciBpcyBhbHdheXMgbGVzcyB0aGVuIG9yIGVxdWFsIHRvIHRhcmdldEJhciwgc28gZGlmZkJhcnMgaXMgYWx3YXlzID49IDBcblxuICAvL2NvbnNvbGUubG9nKCdkaWZmJyxkaWZmQmFycyxkaWZmQmVhdHMsZGlmZlNpeHRlZW50aCxkaWZmVGljayk7XG4gIC8vY29uc29sZS5sb2coJ21pbGxpcycsbWlsbGlzLHRpY2tzUGVyQmFyLHRpY2tzUGVyQmVhdCx0aWNrc1BlclNpeHRlZW50aCxtaWxsaXNQZXJUaWNrKTtcblxuICAvLyBjb252ZXJ0IGRpZmZlcmVuY2VzIHRvIG1pbGxpc2Vjb25kcyBhbmQgdGlja3NcbiAgZGlmZk1pbGxpcyA9IChkaWZmQmFycyAqIHRpY2tzUGVyQmFyKSAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gKGRpZmZCZWF0cyAqIHRpY2tzUGVyQmVhdCkgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IChkaWZmU2l4dGVlbnRoICogdGlja3NQZXJTaXh0ZWVudGgpICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSBkaWZmVGljayAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZUaWNrcyA9IGRpZmZNaWxsaXMgLyBtaWxsaXNQZXJUaWNrO1xuICAvL2NvbnNvbGUubG9nKGRpZmZCYXJzLCB0aWNrc1BlckJhciwgbWlsbGlzUGVyVGljaywgZGlmZk1pbGxpcywgZGlmZlRpY2tzKTtcblxuICAvLyBzZXQgYWxsIGN1cnJlbnQgcG9zaXRpb24gZGF0YVxuICBiYXIgPSB0YXJnZXRCYXI7XG4gIGJlYXQgPSB0YXJnZXRCZWF0O1xuICBzaXh0ZWVudGggPSB0YXJnZXRTaXh0ZWVudGg7XG4gIHRpY2sgPSB0YXJnZXRUaWNrO1xuICAvL2NvbnNvbGUubG9nKHRpY2ssIHRhcmdldFRpY2spXG5cbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG4gIC8vY29uc29sZS5sb2codGFyZ2V0QmFyLCB0YXJnZXRCZWF0LCB0YXJnZXRTaXh0ZWVudGgsIHRhcmdldFRpY2ssICcgLT4gJywgbWlsbGlzKTtcbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuXG4gIC8vY29uc29sZS50aW1lRW5kKCdmcm9tQmFycycpO1xufVxuXG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpe1xuICAvLyBzcHJlYWQgdGhlIGRpZmZlcmVuY2UgaW4gdGljayBvdmVyIGJhcnMsIGJlYXRzIGFuZCBzaXh0ZWVudGhcbiAgbGV0IHRtcCA9IHJvdW5kKGRpZmZUaWNrcyk7XG4gIHdoaWxlKHRtcCA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgc2l4dGVlbnRoKys7XG4gICAgdG1wIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICAgIHdoaWxlKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgYmVhdCsrO1xuICAgICAgd2hpbGUoYmVhdCA+IG5vbWluYXRvcil7XG4gICAgICAgIGJlYXQgLT0gbm9taW5hdG9yO1xuICAgICAgICBiYXIrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdGljayA9IHJvdW5kKHRtcCk7XG59XG5cblxuLy8gc3RvcmUgcHJvcGVydGllcyBvZiBldmVudCBpbiBsb2NhbCBzY29wZVxuZnVuY3Rpb24gZ2V0RGF0YUZyb21FdmVudChldmVudCl7XG5cbiAgYnBtID0gZXZlbnQuYnBtO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG4gIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIC8vY29uc29sZS5sb2coYnBtLCBldmVudC50eXBlKTtcbiAgLy9jb25zb2xlLmxvZygndGlja3MnLCB0aWNrcywgJ21pbGxpcycsIG1pbGxpcywgJ2JhcicsIGJhcik7XG59XG5cblxuZnVuY3Rpb24gZ2V0UG9zaXRpb25EYXRhKHNvbmcpe1xuICBsZXQgdGltZURhdGEsXG4gICAgcG9zaXRpb25EYXRhID0ge307XG5cbiAgc3dpdGNoKHJldHVyblR5cGUpe1xuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIC8vcG9zaXRpb25EYXRhLm1pbGxpcyA9IG1pbGxpcztcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXMgPSByb3VuZChtaWxsaXMgKiAxMDAwKSAvIDEwMDA7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUm91bmRlZCA9IHJvdW5kKG1pbGxpcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzID0gdGlja3M7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3MgPSByb3VuZCh0aWNrcyk7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrc1Vucm91bmRlZCA9IHRpY2tzO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyID0gYmFyO1xuICAgICAgcG9zaXRpb25EYXRhLmJlYXQgPSBiZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrID0gdGljaztcbiAgICAgIC8vcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIGdldFRpY2tBc1N0cmluZyh0aWNrKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICB0aW1lRGF0YSA9IGdldE5pY2VUaW1lKG1pbGxpcyk7XG4gICAgICBwb3NpdGlvbkRhdGEuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gICAgICBwb3NpdGlvbkRhdGEubWludXRlID0gdGltZURhdGEubWludXRlO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIC8vIG1pbGxpc1xuICAgICAgLy9wb3NpdGlvbkRhdGEubWlsbGlzID0gbWlsbGlzO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpcyA9IHJvdW5kKG1pbGxpcyAqIDEwMDApIC8gMTAwMDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNSb3VuZGVkID0gcm91bmQobWlsbGlzKTtcblxuICAgICAgLy8gdGlja3NcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzID0gdGlja3M7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3MgPSByb3VuZCh0aWNrcyk7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrc1Vucm91bmRlZCA9IHRpY2tzO1xuXG4gICAgICAvLyBiYXJzYmVhdHNcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXIgPSBiYXI7XG4gICAgICBwb3NpdGlvbkRhdGEuYmVhdCA9IGJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2sgPSB0aWNrO1xuICAgICAgLy9wb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2tBc1N0cmluZztcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgZ2V0VGlja0FzU3RyaW5nKHRpY2spO1xuXG4gICAgICAvLyB0aW1lXG4gICAgICB0aW1lRGF0YSA9IGdldE5pY2VUaW1lKG1pbGxpcyk7XG4gICAgICBwb3NpdGlvbkRhdGEuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gICAgICBwb3NpdGlvbkRhdGEubWludXRlID0gdGltZURhdGEubWludXRlO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcblxuICAgICAgLy8gZXh0cmEgZGF0YVxuICAgICAgcG9zaXRpb25EYXRhLmJwbSA9IHJvdW5kKGJwbSAqIHNvbmcucGxheWJhY2tTcGVlZCwgMyk7XG4gICAgICBwb3NpdGlvbkRhdGEubm9taW5hdG9yID0gbm9taW5hdG9yO1xuICAgICAgcG9zaXRpb25EYXRhLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyQmVhdCA9IHRpY2tzUGVyQmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gICAgICBwb3NpdGlvbkRhdGEubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuICAgICAgcG9zaXRpb25EYXRhLnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgIC8vIHVzZSB0aWNrcyB0byBtYWtlIHRlbXBvIGNoYW5nZXMgdmlzaWJsZSBieSBhIGZhc3RlciBtb3ZpbmcgcGxheWhlYWRcbiAgICAgIHBvc2l0aW9uRGF0YS5wZXJjZW50YWdlID0gdGlja3MgLyBzb25nLl9kdXJhdGlvblRpY2tzO1xuICAgICAgLy9wb3NpdGlvbkRhdGEucGVyY2VudGFnZSA9IG1pbGxpcyAvIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiBwb3NpdGlvbkRhdGFcbn1cblxuXG5mdW5jdGlvbiBnZXRUaWNrQXNTdHJpbmcodCl7XG4gIGlmKHQgPT09IDApe1xuICAgIHQgPSAnMDAwJ1xuICB9ZWxzZSBpZih0IDwgMTApe1xuICAgIHQgPSAnMDAnICsgdFxuICB9ZWxzZSBpZih0IDwgMTAwKXtcbiAgICB0ID0gJzAnICsgdFxuICB9XG4gIHJldHVybiB0XG59XG5cblxuLy8gdXNlZCBieSBwbGF5aGVhZFxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvc2l0aW9uMihzb25nLCB1bml0LCB0YXJnZXQsIHR5cGUsIGV2ZW50KXtcbiAgaWYodW5pdCA9PT0gJ21pbGxpcycpe1xuICAgIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0LCBldmVudCk7XG4gIH1lbHNlIGlmKHVuaXQgPT09ICd0aWNrcycpe1xuICAgIGZyb21UaWNrcyhzb25nLCB0YXJnZXQsIGV2ZW50KTtcbiAgfVxuICByZXR1cm5UeXBlID0gdHlwZVxuICBpZihyZXR1cm5UeXBlID09PSAnYWxsJyl7XG4gICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gIH1cbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcbn1cblxuXG4vLyBpbXByb3ZlZCB2ZXJzaW9uIG9mIGdldFBvc2l0aW9uXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb24oc29uZywgc2V0dGluZ3Mpe1xuICBsZXQge1xuICAgIHR5cGUsIC8vIGFueSBvZiBiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIHBlcmMgcGVyY2VudGFnZVxuICAgIHRhcmdldCwgLy8gaWYgdHlwZSBpcyBiYXJzYmVhdHMgb3IgdGltZSwgdGFyZ2V0IG11c3QgYmUgYW4gYXJyYXksIGVsc2UgaWYgbXVzdCBiZSBhIG51bWJlclxuICAgIHJlc3VsdDogcmVzdWx0ID0gJ2FsbCcsIC8vIGFueSBvZiBiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIGFsbFxuICAgIGJlb3M6IGJlb3MgPSB0cnVlLFxuICAgIHNuYXA6IHNuYXAgPSAtMVxuICB9ID0gc2V0dGluZ3NcblxuICBpZihzdXBwb3J0ZWRSZXR1cm5UeXBlcy5pbmRleE9mKHJlc3VsdCkgPT09IC0xKXtcbiAgICBjb25zb2xlLndhcm4oYHVuc3VwcG9ydGVkIHJldHVybiB0eXBlLCAnYWxsJyB1c2VkIGluc3RlYWQgb2YgJyR7cmVzdWx0fSdgKVxuICAgIHJlc3VsdCA9ICdhbGwnXG4gIH1cblxuICByZXR1cm5UeXBlID0gcmVzdWx0XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcblxuICBpZihzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpID09PSAtMSl7XG4gICAgY29uc29sZS5lcnJvcihgdW5zdXBwb3J0ZWQgdHlwZSAke3R5cGV9YClcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG5cbiAgc3dpdGNoKHR5cGUpe1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgbGV0IFt0YXJnZXRiYXIgPSAxLCB0YXJnZXRiZWF0ID0gMSwgdGFyZ2V0c2l4dGVlbnRoID0gMSwgdGFyZ2V0dGljayA9IDBdID0gdGFyZ2V0XG4gICAgICAvL2NvbnNvbGUubG9nKHRhcmdldGJhciwgdGFyZ2V0YmVhdCwgdGFyZ2V0c2l4dGVlbnRoLCB0YXJnZXR0aWNrKVxuICAgICAgZnJvbUJhcnMoc29uZywgdGFyZ2V0YmFyLCB0YXJnZXRiZWF0LCB0YXJnZXRzaXh0ZWVudGgsIHRhcmdldHRpY2spXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIC8vIGNhbGN1bGF0ZSBtaWxsaXMgb3V0IG9mIHRpbWUgYXJyYXk6IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcbiAgICAgIGxldCBbdGFyZ2V0aG91ciA9IDAsIHRhcmdldG1pbnV0ZSA9IDAsIHRhcmdldHNlY29uZCA9IDAsIHRhcmdldG1pbGxpc2Vjb25kID0gMF0gPSB0YXJnZXRcbiAgICAgIGxldCBtaWxsaXMgPSAwXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0aG91ciAqIDYwICogNjAgKiAxMDAwIC8vaG91cnNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRtaW51dGUgKiA2MCAqIDEwMDAgLy9taW51dGVzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0c2Vjb25kICogMTAwMCAvL3NlY29uZHNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRtaWxsaXNlY29uZCAvL21pbGxpc2Vjb25kc1xuXG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIG1pbGxpcylcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgLy9jb25zb2xlLmxvZyhzb25nLCB0YXJnZXQpXG4gICAgICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHRhcmdldCAqIHNvbmcuX2R1cmF0aW9uVGlja3MgLy8gdGFyZ2V0IG11c3QgYmUgaW4gdGlja3MhXG4gICAgICAvL2NvbnNvbGUubG9nKHRpY2tzLCBzb25nLl9kdXJhdGlvblRpY2tzKVxuICAgICAgaWYoc25hcCAhPT0gLTEpe1xuICAgICAgICB0aWNrcyA9IGZsb29yKHRpY2tzIC8gc25hcCkgKiBzbmFwO1xuICAgICAgICAvL2Zyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGlja3MpO1xuICAgICAgfVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRpY2tzKVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIGxldCB0bXAgPSBnZXRQb3NpdGlvbkRhdGEoc29uZylcbiAgICAgIC8vY29uc29sZS5sb2coJ2RpZmYnLCBwb3NpdGlvblsxXSAtIHRtcC5wZXJjZW50YWdlKTtcbiAgICAgIHJldHVybiB0bXBcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG4vKlxuXG4vL0BwYXJhbTogJ21pbGxpcycsIDEwMDAsIFt0cnVlXVxuLy9AcGFyYW06ICd0aWNrcycsIDEwMDAsIFt0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCAxLCBbJ2FsbCcsIHRydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDYwLCA0LCAzLCAxMjAsIFsnYWxsJywgdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgNjAsIDQsIDMsIDEyMCwgW3RydWUsICdhbGwnXVxuXG5mdW5jdGlvbiBjaGVja1Bvc2l0aW9uKHR5cGUsIGFyZ3MsIHJldHVyblR5cGUgPSAnYWxsJyl7XG4gIGJleW9uZEVuZE9mU29uZyA9IHRydWU7XG4gIGNvbnNvbGUubG9nKCctLS0tPiBjaGVja1Bvc2l0aW9uOicsIGFyZ3MsIHR5cGVTdHJpbmcoYXJncykpO1xuXG4gIGlmKHR5cGVTdHJpbmcoYXJncykgPT09ICdhcnJheScpe1xuICAgIGxldFxuICAgICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoLFxuICAgICAgcG9zaXRpb24sXG4gICAgICBpLCBhLCBwb3NpdGlvbkxlbmd0aDtcblxuICAgIHR5cGUgPSBhcmdzWzBdO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgW1snbWlsbGlzJywgMzAwMF1dXG4gICAgaWYodHlwZVN0cmluZyhhcmdzWzBdKSA9PT0gJ2FycmF5Jyl7XG4gICAgICAvL2NvbnNvbGUud2FybigndGhpcyBzaG91bGRuXFwndCBoYXBwZW4hJyk7XG4gICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgIHR5cGUgPSBhcmdzWzBdO1xuICAgICAgbnVtQXJncyA9IGFyZ3MubGVuZ3RoO1xuICAgIH1cblxuICAgIHBvc2l0aW9uID0gW3R5cGVdO1xuXG4gICAgY29uc29sZS5sb2coJ2NoZWNrIHBvc2l0aW9uJywgYXJncywgbnVtQXJncywgc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSk7XG5cbiAgICAvL2NvbnNvbGUubG9nKCdhcmcnLCAwLCAnLT4nLCB0eXBlKTtcblxuICAgIGlmKHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkgIT09IC0xKXtcbiAgICAgIGZvcihpID0gMTsgaSA8IG51bUFyZ3M7IGkrKyl7XG4gICAgICAgIGEgPSBhcmdzW2ldO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdhcmcnLCBpLCAnLT4nLCBhKTtcbiAgICAgICAgaWYoYSA9PT0gdHJ1ZSB8fCBhID09PSBmYWxzZSl7XG4gICAgICAgICAgYmV5b25kRW5kT2ZTb25nID0gYTtcbiAgICAgICAgfWVsc2UgaWYoaXNOYU4oYSkpe1xuICAgICAgICAgIGlmKHN1cHBvcnRlZFJldHVyblR5cGVzLmluZGV4T2YoYSkgIT09IC0xKXtcbiAgICAgICAgICAgIHJldHVyblR5cGUgPSBhO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgIHBvc2l0aW9uLnB1c2goYSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vY2hlY2sgbnVtYmVyIG9mIGFyZ3VtZW50cyAtPiBlaXRoZXIgMSBudW1iZXIgb3IgNCBudW1iZXJzIGluIHBvc2l0aW9uLCBlLmcuIFsnYmFyc2JlYXRzJywgMV0gb3IgWydiYXJzYmVhdHMnLCAxLCAxLCAxLCAwXSxcbiAgICAgIC8vIG9yIFsncGVyYycsIDAuNTYsIG51bWJlck9mVGlja3NUb1NuYXBUb11cbiAgICAgIHBvc2l0aW9uTGVuZ3RoID0gcG9zaXRpb24ubGVuZ3RoO1xuICAgICAgaWYocG9zaXRpb25MZW5ndGggIT09IDIgJiYgcG9zaXRpb25MZW5ndGggIT09IDMgJiYgcG9zaXRpb25MZW5ndGggIT09IDUpe1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKHBvc2l0aW9uLCByZXR1cm5UeXBlLCBiZXlvbmRFbmRPZlNvbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQb3NpdGlvbihzb25nLCB0eXBlLCBhcmdzKXtcbiAgLy9jb25zb2xlLmxvZygnZ2V0UG9zaXRpb24nLCBhcmdzKTtcblxuICBpZih0eXBlb2YgYXJncyA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB7XG4gICAgICBtaWxsaXM6IDBcbiAgICB9XG4gIH1cblxuICBsZXQgcG9zaXRpb24gPSBjaGVja1Bvc2l0aW9uKHR5cGUsIGFyZ3MpLFxuICAgIG1pbGxpcywgdG1wLCBzbmFwO1xuXG5cbiAgaWYocG9zaXRpb24gPT09IGZhbHNlKXtcbiAgICBlcnJvcignd3JvbmcgcG9zaXRpb24gZGF0YScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN3aXRjaCh0eXBlKXtcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIGZyb21CYXJzKHNvbmcsIHBvc2l0aW9uWzFdLCBwb3NpdGlvblsyXSwgcG9zaXRpb25bM10sIHBvc2l0aW9uWzRdKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIC8vIGNhbGN1bGF0ZSBtaWxsaXMgb3V0IG9mIHRpbWUgYXJyYXk6IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcbiAgICAgIG1pbGxpcyA9IDA7XG4gICAgICB0bXAgPSBwb3NpdGlvblsxXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDYwICogNjAgKiAxMDAwOyAvL2hvdXJzXG4gICAgICB0bXAgPSBwb3NpdGlvblsyXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDYwICogMTAwMDsgLy9taW51dGVzXG4gICAgICB0bXAgPSBwb3NpdGlvblszXSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcCAqIDEwMDA7IC8vc2Vjb25kc1xuICAgICAgdG1wID0gcG9zaXRpb25bNF0gfHwgMDtcbiAgICAgIG1pbGxpcyArPSB0bXA7IC8vbWlsbGlzZWNvbmRzXG5cbiAgICAgIGZyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHBvc2l0aW9uWzFdKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIGZyb21UaWNrcyhzb25nLCBwb3NpdGlvblsxXSk7XG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG5cbiAgICBjYXNlICdwZXJjJzpcbiAgICBjYXNlICdwZXJjZW50YWdlJzpcbiAgICAgIHNuYXAgPSBwb3NpdGlvblsyXTtcblxuICAgICAgLy9taWxsaXMgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25NaWxsaXM7XG4gICAgICAvL2Zyb21NaWxsaXMoc29uZywgbWlsbGlzKTtcbiAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzKTtcblxuICAgICAgdGlja3MgPSBwb3NpdGlvblsxXSAqIHNvbmcuZHVyYXRpb25UaWNrcztcbiAgICAgIGlmKHNuYXAgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHRpY2tzID0gZmxvb3IodGlja3Mvc25hcCkgKiBzbmFwO1xuICAgICAgICAvL2Zyb21UaWNrcyhzb25nLCB0aWNrcyk7XG4gICAgICAgIC8vY29uc29sZS5sb2codGlja3MpO1xuICAgICAgfVxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgdG1wID0gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuICAgICAgLy9jb25zb2xlLmxvZygnZGlmZicsIHBvc2l0aW9uWzFdIC0gdG1wLnBlcmNlbnRhZ2UpO1xuICAgICAgcmV0dXJuIHRtcDtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbiovXG5cbiIsImNvbnN0IHZlcnNpb24gPSAnMS4wLjAtYmV0YTI4J1xuXG5pbXBvcnQge1xuICB1cGRhdGVTZXR0aW5ncyxcbiAgZ2V0U2V0dGluZ3MsXG59IGZyb20gJy4vc2V0dGluZ3MnXG5cbmltcG9ydCB7XG4gIGdldE5vdGVEYXRhLFxufSBmcm9tICcuL25vdGUnXG5cbmltcG9ydCB7XG4gIE1JRElFdmVudFxufSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmltcG9ydHtcbiAgTUlESU5vdGUsXG59IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnR7XG4gIFBhcnQsXG59IGZyb20gJy4vcGFydCdcblxuaW1wb3J0e1xuICBUcmFjayxcbn0gZnJvbSAnLi90cmFjaydcblxuaW1wb3J0IHtcbiAgU29uZyxcbn0gZnJvbSAnLi9zb25nJ1xuXG5pbXBvcnQge1xuICBJbnN0cnVtZW50LFxufSBmcm9tICcuL2luc3RydW1lbnQnXG5cbmltcG9ydCB7XG4gIFNhbXBsZXIsXG59IGZyb20gJy4vc2FtcGxlcidcblxuaW1wb3J0IHtcbiAgU2ltcGxlU3ludGgsXG59IGZyb20gJy4vc2ltcGxlX3N5bnRoJ1xuXG5pbXBvcnQge1xuICBDb252b2x1dGlvblJldmVyYixcbn0gZnJvbSAnLi9jb252b2x1dGlvbl9yZXZlcmInXG5cbmltcG9ydCB7XG4gIHBhcnNlTUlESUZpbGVcbn0gZnJvbSAnLi9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgaW5pdCxcbn0gZnJvbSAnLi9pbml0J1xuXG5pbXBvcnQge1xuICBjb250ZXh0LFxuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZSxcbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5pbXBvcnQge1xuICBnZXRNSURJQWNjZXNzLFxuICBnZXRNSURJSW5wdXRzLFxuICBnZXRNSURJT3V0cHV0cyxcbiAgZ2V0TUlESUlucHV0SWRzLFxuICBnZXRNSURJT3V0cHV0SWRzLFxuICBnZXRNSURJSW5wdXRzQnlJZCxcbiAgZ2V0TUlESU91dHB1dHNCeUlkLFxufSBmcm9tICcuL2luaXRfbWlkaSdcblxuaW1wb3J0IHtcbiAgcGFyc2VTYW1wbGVzLFxufSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuXG5pbXBvcnQge1xuICBNSURJRXZlbnRUeXBlcyxcbn0gZnJvbSAnLi9jb25zdGFudHMnXG5cbmltcG9ydCB7XG4gIHNldEJ1ZmZlclRpbWUsXG4gIGdldEluc3RydW1lbnRzLFxuICBnZXRHTUluc3RydW1lbnRzLFxufSBmcm9tICcuL3NldHRpbmdzJ1xuXG5pbXBvcnQge1xuICBhZGRFdmVudExpc3RlbmVyLFxuICByZW1vdmVFdmVudExpc3RlbmVyLFxuICBkaXNwYXRjaEV2ZW50XG59IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcblxuXG5jb25zdCBnZXRBdWRpb0NvbnRleHQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gY29udGV4dFxufVxuXG5jb25zdCBxYW1iaSA9IHtcbiAgdmVyc2lvbixcblxuICAvLyBmcm9tIC4vc2V0dGluZ3NcbiAgdXBkYXRlU2V0dGluZ3MsXG4gIGdldFNldHRpbmdzLFxuXG4gIC8vIGZyb20gLi9ub3RlXG4gIGdldE5vdGVEYXRhLFxuXG5cbiAgLy8gZnJvbSAuL2luaXRcbiAgaW5pdCxcblxuICAvLyBmcm9tIC4vc2V0dGluZ3NcbiAgc2V0QnVmZmVyVGltZSxcblxuICAvLyBmcm9tIC4vY29uc3RhbnRzXG4gIE1JRElFdmVudFR5cGVzLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vbWlkaWZpbGVcbiAgcGFyc2VNSURJRmlsZSxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgZ2V0SW5zdHJ1bWVudHMsXG4gIGdldEdNSW5zdHJ1bWVudHMsXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayl7XG4gICAgcmV0dXJuIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spXG4gIH0sXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZClcbiAgfSxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBNSURJRXZlbnQsXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBNSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBTb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBUcmFjayxcblxuICAvLyBmcm9tIC4vcGFydFxuICBQYXJ0LFxuXG4gIC8vIGZyb20gLi9pbnN0cnVtZW50XG4gIEluc3RydW1lbnQsXG5cbiAgLy8gZnJvbSAuL3NpbXBsZV9zeW50aFxuICBTaW1wbGVTeW50aCxcblxuICAvLyBmcm9tIC4vc2FtcGxlclxuICBTYW1wbGVyLFxuXG4gIC8vIGZyb20gLi9jb252b2x1dGlvbl9yZXZlcmJcbiAgQ29udm9sdXRpb25SZXZlcmIsXG5cbiAgbG9nKGlkKXtcbiAgICBzd2l0Y2goaWQpe1xuICAgICAgY2FzZSAnZnVuY3Rpb25zJzpcbiAgICAgICAgY29uc29sZS5sb2coYGZ1bmN0aW9uczpcbiAgICAgICAgICBnZXRBdWRpb0NvbnRleHRcbiAgICAgICAgICBnZXRNYXN0ZXJWb2x1bWVcbiAgICAgICAgICBzZXRNYXN0ZXJWb2x1bWVcbiAgICAgICAgICBnZXRNSURJQWNjZXNzXG4gICAgICAgICAgZ2V0TUlESUlucHV0c1xuICAgICAgICAgIGdldE1JRElPdXRwdXRzXG4gICAgICAgICAgZ2V0TUlESUlucHV0SWRzXG4gICAgICAgICAgZ2V0TUlESU91dHB1dElkc1xuICAgICAgICAgIGdldE1JRElJbnB1dHNCeUlkXG4gICAgICAgICAgZ2V0TUlESU91dHB1dHNCeUlkXG4gICAgICAgICAgcGFyc2VNSURJRmlsZVxuICAgICAgICAgIHNldEJ1ZmZlclRpbWVcbiAgICAgICAgICBnZXRJbnN0cnVtZW50c1xuICAgICAgICAgIGdldEdNSW5zdHJ1bWVudHNcbiAgICAgICAgYClcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBxYW1iaVxuXG5leHBvcnQge1xuICB2ZXJzaW9uLFxuXG4gIC8vIGZyb20gLi9pbml0XG4gIGluaXQsXG5cbiAgLy8gZnJvbSAuL3NldHRpbmdzXG4gIGdldEluc3RydW1lbnRzLFxuICBnZXRHTUluc3RydW1lbnRzLFxuICB1cGRhdGVTZXR0aW5ncyxcbiAgZ2V0U2V0dGluZ3MsXG5cbiAgLy8gZnJvbSAuL2NvbnN0YW50c1xuICBNSURJRXZlbnRUeXBlcyxcblxuICAvLyBmcm9tIC4vdXRpbFxuICBwYXJzZVNhbXBsZXMsXG5cbiAgLy8gZnJvbSAuL21pZGlmaWxlXG4gIHBhcnNlTUlESUZpbGUsXG5cbiAgLy8gZnJvbSAuL2luaXRfYXVkaW9cbiAgZ2V0QXVkaW9Db250ZXh0LFxuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZSxcblxuICAvLyBmcm9tIC4vaW5pdF9taWRpXG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG5cbiAgLy8gZnJvbSAuL25vdGVcbiAgZ2V0Tm90ZURhdGEsXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgTUlESUV2ZW50LFxuXG4gIC8vIGZyb20gLi9taWRpX25vdGVcbiAgTUlESU5vdGUsXG5cbiAgLy8gZnJvbSAuL3NvbmdcbiAgU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgVHJhY2ssXG5cbiAgLy8gZnJvbSAuL3BhcnRcbiAgUGFydCxcblxuICAvLyBmcm9tIC4vaW5zdHJ1bWVudFxuICBJbnN0cnVtZW50LFxuXG4gIC8vIGZyb20gLi9zaW1wbGVfc3ludGhcbiAgU2ltcGxlU3ludGgsXG5cbiAgLy8gZnJvbSAuL3NhbXBsZXJcbiAgU2FtcGxlcixcblxuICAvLyBmcm9tIC4vY29udm9sdXRpb25fcmV2ZXJiXG4gIENvbnZvbHV0aW9uUmV2ZXJiLFxufVxuIiwiaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8uanMnXG5pbXBvcnQge2dldEVxdWFsUG93ZXJDdXJ2ZX0gZnJvbSAnLi91dGlsLmpzJ1xuXG5leHBvcnQgY2xhc3MgU2FtcGxle1xuXG4gIGNvbnN0cnVjdG9yKHNhbXBsZURhdGEsIGV2ZW50KXtcbiAgICB0aGlzLmV2ZW50ID0gZXZlbnRcbiAgICB0aGlzLnNhbXBsZURhdGEgPSBzYW1wbGVEYXRhXG4gIH1cblxuICBzdGFydCh0aW1lKXtcbiAgICBsZXQge3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZH0gPSB0aGlzLnNhbXBsZURhdGFcbiAgICAvL2NvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZClcbiAgICBpZihzdXN0YWluU3RhcnQgJiYgc3VzdGFpbkVuZCl7XG4gICAgICB0aGlzLnNvdXJjZS5sb29wID0gdHJ1ZVxuICAgICAgdGhpcy5zb3VyY2UubG9vcFN0YXJ0ID0gc3VzdGFpblN0YXJ0XG4gICAgICB0aGlzLnNvdXJjZS5sb29wRW5kID0gc3VzdGFpbkVuZFxuICAgIH1cbiAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgY2Ipe1xuICAgIGxldCB7cmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUsIHJlbGVhc2VFbnZlbG9wZUFycmF5fSA9IHRoaXMuc2FtcGxlRGF0YVxuICAgIC8vY29uc29sZS5sb2cocmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUpXG4gICAgdGhpcy5zb3VyY2Uub25lbmRlZCA9IGNiXG5cbiAgICBpZihyZWxlYXNlRHVyYXRpb24gJiYgcmVsZWFzZUVudmVsb3BlKXtcbiAgICAgIHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UgPSB0aW1lXG4gICAgICB0aGlzLnJlbGVhc2VGdW5jdGlvbiA9ICgpID0+IHtcbiAgICAgICAgZmFkZU91dCh0aGlzLm91dHB1dCwge1xuICAgICAgICAgIHJlbGVhc2VEdXJhdGlvbixcbiAgICAgICAgICByZWxlYXNlRW52ZWxvcGUsXG4gICAgICAgICAgcmVsZWFzZUVudmVsb3BlQXJyYXksXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0cnl7XG4gICAgICAgIHRoaXMuc291cmNlLnN0b3AodGltZSArIHJlbGVhc2VEdXJhdGlvbilcbiAgICAgIH1jYXRjaChlKXtcbiAgICAgICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc3RvcCBtb3JlIHRoYW4gb25jZVxuICAgICAgfVxuICAgICAgdGhpcy5jaGVja1BoYXNlKClcbiAgICB9ZWxzZXtcbiAgICAgIHRyeXtcbiAgICAgICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lKVxuICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAvLyBpbiBGaXJlZm94IGFuZCBTYWZhcmkgeW91IGNhbiBub3QgY2FsbCBzdG9wIG1vcmUgdGhhbiBvbmNlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2hlY2tQaGFzZSgpe1xuICAgIC8vY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSwgdGhpcy5zdGFydFJlbGVhc2VQaGFzZSlcbiAgICBpZihjb250ZXh0LmN1cnJlbnRUaW1lID49IHRoaXMuc3RhcnRSZWxlYXNlUGhhc2Upe1xuICAgICAgdGhpcy5yZWxlYXNlRnVuY3Rpb24oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmNoZWNrUGhhc2UuYmluZCh0aGlzKSlcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBmYWRlT3V0KGdhaW5Ob2RlLCBzZXR0aW5ncyl7XG4gIGxldCBub3cgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gIGxldCB2YWx1ZXMsIGksIG1heGlcblxuICAvL2NvbnNvbGUubG9nKHNldHRpbmdzKVxuICB0cnl7XG4gICAgc3dpdGNoKHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZSl7XG5cbiAgICAgIGNhc2UgJ2xpbmVhcic6XG4gICAgICAgIGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSwgbm93KVxuICAgICAgICBnYWluTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgbm93ICsgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdlcXVhbCBwb3dlcic6XG4gICAgICBjYXNlICdlcXVhbF9wb3dlcic6XG4gICAgICAgIHZhbHVlcyA9IGdldEVxdWFsUG93ZXJDdXJ2ZSgxMDAsICdmYWRlT3V0JywgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSlcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgbWF4aSA9IHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZUFycmF5Lmxlbmd0aFxuICAgICAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG1heGkpXG4gICAgICAgIGZvcihpID0gMDsgaSA8IG1heGk7IGkrKyl7XG4gICAgICAgICAgdmFsdWVzW2ldID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXlbaV0gKiBnYWluTm9kZS5nYWluLnZhbHVlXG4gICAgICAgIH1cbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9Y2F0Y2goZSl7XG4gICAgLy8gaW4gRmlyZWZveCBhbmQgU2FmYXJpIHlvdSBjYW4gbm90IGNhbGwgc2V0VmFsdWVDdXJ2ZUF0VGltZSBhbmQgbGluZWFyUmFtcFRvVmFsdWVBdFRpbWUgbW9yZSB0aGFuIG9uY2VcblxuICAgIC8vY29uc29sZS5sb2codmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAvL2NvbnNvbGUubG9nKGUsIGdhaW5Ob2RlKVxuICB9XG59XG4iLCJpbXBvcnQge1NhbXBsZX0gZnJvbSAnLi9zYW1wbGUnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBTYW1wbGVCdWZmZXIgZXh0ZW5kcyBTYW1wbGV7XG5cbiAgY29uc3RydWN0b3Ioc2FtcGxlRGF0YSwgZXZlbnQpe1xuICAgIHN1cGVyKHNhbXBsZURhdGEsIGV2ZW50KVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcblxuICAgIGlmKHRoaXMuc2FtcGxlRGF0YSA9PT0gLTEgfHwgdHlwZW9mIHRoaXMuc2FtcGxlRGF0YS5idWZmZXIgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIC8vIGNyZWF0ZSBkdW1teSBzb3VyY2VcbiAgICAgIHRoaXMuc291cmNlID0ge1xuICAgICAgICBzdGFydCgpe30sXG4gICAgICAgIHN0b3AoKXt9LFxuICAgICAgICBjb25uZWN0KCl7fSxcbiAgICAgIH1cblxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZURhdGEpXG4gICAgICB0aGlzLnNvdXJjZS5idWZmZXIgPSBzYW1wbGVEYXRhLmJ1ZmZlcjtcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5zb3VyY2UuYnVmZmVyKVxuICAgIH1cbiAgICB0aGlzLm91dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy52b2x1bWUgPSBldmVudC5kYXRhMiAvIDEyN1xuICAgIHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuc291cmNlLmNvbm5lY3QodGhpcy5vdXRwdXQpXG4gICAgLy90aGlzLm91dHB1dC5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIH1cblxuICAvL0BvdmVycmlkZVxuICBzdGFydCh0aW1lKXtcbiAgICBsZXQge3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZCwgc2VnbWVudFN0YXJ0LCBzZWdtZW50RHVyYXRpb259ID0gdGhpcy5zYW1wbGVEYXRhXG4gICAgLy9jb25zb2xlLmxvZyhzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmQsIHNlZ21lbnRTdGFydCwgc2VnbWVudER1cmF0aW9uKVxuICAgIGlmKHN1c3RhaW5TdGFydCAmJiBzdXN0YWluRW5kKXtcbiAgICAgIHRoaXMuc291cmNlLmxvb3AgPSB0cnVlXG4gICAgICB0aGlzLnNvdXJjZS5sb29wU3RhcnQgPSBzdXN0YWluU3RhcnRcbiAgICAgIHRoaXMuc291cmNlLmxvb3BFbmQgPSBzdXN0YWluRW5kXG4gICAgfVxuICAgIGlmKHNlZ21lbnRTdGFydCAmJiBzZWdtZW50RHVyYXRpb24pe1xuICAgICAgY29uc29sZS5sb2coc2VnbWVudFN0YXJ0LCBzZWdtZW50RHVyYXRpb24pXG4gICAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lLCBzZWdtZW50U3RhcnQgLyAxMDAwLCBzZWdtZW50RHVyYXRpb24gLyAxMDAwKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb3VyY2Uuc3RhcnQodGltZSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQge1NhbXBsZX0gZnJvbSAnLi9zYW1wbGUnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBTYW1wbGVPc2NpbGxhdG9yIGV4dGVuZHMgU2FtcGxle1xuXG4gIGNvbnN0cnVjdG9yKHNhbXBsZURhdGEsIGV2ZW50KXtcbiAgICBzdXBlcihzYW1wbGVEYXRhLCBldmVudClcbiAgICB0aGlzLmlkID0gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV8ke2luc3RhbmNlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG5cbiAgICBpZih0aGlzLnNhbXBsZURhdGEgPT09IC0xKXtcbiAgICAgIC8vIGNyZWF0ZSBkdW1teSBzb3VyY2VcbiAgICAgIHRoaXMuc291cmNlID0ge1xuICAgICAgICBzdGFydCgpe30sXG4gICAgICAgIHN0b3AoKXt9LFxuICAgICAgICBjb25uZWN0KCl7fSxcbiAgICAgIH1cblxuICAgIH1lbHNle1xuXG4gICAgICAvLyBAVE9ETyBhZGQgdHlwZSAnY3VzdG9tJyA9PiBQZXJpb2RpY1dhdmVcbiAgICAgIGxldCB0eXBlID0gdGhpcy5zYW1wbGVEYXRhLnR5cGVcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKClcblxuICAgICAgc3dpdGNoKHR5cGUpe1xuICAgICAgICBjYXNlICdzaW5lJzpcbiAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgY2FzZSAnc2F3dG9vdGgnOlxuICAgICAgICBjYXNlICd0cmlhbmdsZSc6XG4gICAgICAgICAgdGhpcy5zb3VyY2UudHlwZSA9IHR5cGVcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRoaXMuc291cmNlLnR5cGUgPSAnc3F1YXJlJ1xuICAgICAgfVxuICAgICAgdGhpcy5zb3VyY2UuZnJlcXVlbmN5LnZhbHVlID0gZXZlbnQuZnJlcXVlbmN5XG4gICAgfVxuICAgIHRoaXMub3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLnZvbHVtZSA9IGV2ZW50LmRhdGEyIC8gMTI3XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5zb3VyY2UuY29ubmVjdCh0aGlzLm91dHB1dClcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgfVxufVxuIiwiaW1wb3J0IHtJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5pbXBvcnQge2dldE5vdGVEYXRhfSBmcm9tICcuL25vdGUnXG5pbXBvcnQge3BhcnNlU2FtcGxlc30gZnJvbSAnLi9wYXJzZV9hdWRpbydcbmltcG9ydCB7dHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtmZXRjaEpTT059IGZyb20gJy4vZmV0Y2hfaGVscGVycydcbmltcG9ydCB7U2FtcGxlQnVmZmVyfSBmcm9tICcuL3NhbXBsZV9idWZmZXInXG5cblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBTYW1wbGVyIGV4dGVuZHMgSW5zdHJ1bWVudHtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpe1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmlkID0gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV8ke2luc3RhbmNlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCB0aGlzLmlkXG4gICAgdGhpcy5jbGVhckFsbFNhbXBsZURhdGEoKVxuICB9XG5cbiAgY2xlYXJBbGxTYW1wbGVEYXRhKCl7XG4gICAgLy8gY3JlYXRlIGEgc2FtcGxlcyBkYXRhIG9iamVjdCBmb3IgYWxsIDEyOCB2ZWxvY2l0eSBsZXZlbHMgb2YgYWxsIDEyOCBub3Rlc1xuICAgIHRoaXMuc2FtcGxlc0RhdGEgPSBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKVxuICAgIHRoaXMuc2FtcGxlc0RhdGEgPSB0aGlzLnNhbXBsZXNEYXRhLm1hcChmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG5ldyBBcnJheSgxMjgpLmZpbGwoLTEpXG4gICAgfSlcbiAgfVxuXG4gIGNyZWF0ZVNhbXBsZShldmVudCl7XG4gICAgcmV0dXJuIG5ldyBTYW1wbGVCdWZmZXIodGhpcy5zYW1wbGVzRGF0YVtldmVudC5kYXRhMV1bZXZlbnQuZGF0YTJdLCBldmVudClcbiAgfVxuXG4gIF9sb2FkSlNPTihkYXRhKXtcbiAgICBpZih0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGRhdGEudXJsID09PSAnc3RyaW5nJyl7XG4gICAgICByZXR1cm4gZmV0Y2hKU09OKGRhdGEudXJsKVxuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRhdGEpXG4gIH1cblxuICAvLyBsb2FkIGFuZCBwYXJzZVxuICBwYXJzZVNhbXBsZURhdGEoZGF0YSl7XG5cbiAgICAvLyBjaGVjayBpZiB3ZSBoYXZlIHRvIGNsZWFyIHRoZSBjdXJyZW50bHkgbG9hZGVkIHNhbXBsZXNcbiAgICBsZXQgY2xlYXJBbGwgPSBkYXRhLmNsZWFyQWxsXG5cbiAgICAvLyBjaGVjayBpZiB3ZSBoYXZlIHRvIG92ZXJydWxlIHRoZSBiYXNlVXJsIG9mIHRoZSBzYW1wZWxzXG4gICAgbGV0IGJhc2VVcmwgPSBudWxsXG4gICAgaWYodHlwZW9mIGRhdGEuYmFzZVVybCA9PT0gJ3N0cmluZycpe1xuICAgICAgYmFzZVVybCA9IGRhdGEuYmFzZVVybFxuICAgIH1cblxuICAgIGlmKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuc2V0UmVsZWFzZShkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgIC8vY29uc29sZS5sb2coMSwgZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgfVxuXG4gICAgLy9yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9sb2FkSlNPTihkYXRhKVxuICAgICAgLnRoZW4oKGpzb24pID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhqc29uKVxuICAgICAgICBkYXRhID0ganNvblxuICAgICAgICBpZihiYXNlVXJsICE9PSBudWxsKXtcbiAgICAgICAgICBqc29uLmJhc2VVcmwgPSBiYXNlVXJsXG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIGRhdGEucmVsZWFzZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIHRoaXMuc2V0UmVsZWFzZShkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKDIsIGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJzZVNhbXBsZXMoZGF0YSlcbiAgICAgIH0pXG4gICAgICAudGhlbigocmVzdWx0KSA9PiB7XG5cbiAgICAgICAgaWYoY2xlYXJBbGwgPT09IHRydWUpe1xuICAgICAgICAgIHRoaXMuY2xlYXJBbGxTYW1wbGVEYXRhKClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnKXtcblxuICAgICAgICAgIC8vIHNpbmdsZSBjb25jYXRlbmF0ZWQgc2FtcGxlXG4gICAgICAgICAgaWYodHlwZW9mIHJlc3VsdC5zYW1wbGUgIT09ICd1bmRlZmluZWQnKXtcblxuICAgICAgICAgICAgbGV0IGJ1ZmZlciA9IHJlc3VsdC5zYW1wbGVcbiAgICAgICAgICAgIGZvcihsZXQgbm90ZUlkIG9mIE9iamVjdC5rZXlzKGRhdGEpKSB7XG5cbiAgICAgICAgICAgICAgaWYoXG4gICAgICAgICAgICAgICAgbm90ZUlkID09PSAnc2FtcGxlJyB8fFxuICAgICAgICAgICAgICAgIG5vdGVJZCA9PT0gJ3JlbGVhc2UnIHx8XG4gICAgICAgICAgICAgICAgbm90ZUlkID09PSAnYmFzZVVybCcgfHxcbiAgICAgICAgICAgICAgICBub3RlSWQgPT09ICdpbmZvJ1xuICAgICAgICAgICAgICApe1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBsZXQgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzZWdtZW50OiBkYXRhW25vdGVJZF0sXG4gICAgICAgICAgICAgICAgbm90ZTogcGFyc2VJbnQobm90ZUlkLCAxMCksXG4gICAgICAgICAgICAgICAgYnVmZmVyXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpXG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlRGF0YSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1lbHNle1xuXG4gICAgICAgICAgICBmb3IobGV0IG5vdGVJZCBvZiBPYmplY3Qua2V5cyhyZXN1bHQpKSB7XG4gICAgICAgICAgICAgIGxldCBidWZmZXIgPSByZXN1bHRbbm90ZUlkXVxuICAgICAgICAgICAgICBsZXQgc2FtcGxlRGF0YSA9IGRhdGFbbm90ZUlkXVxuXG5cbiAgICAgICAgICAgICAgaWYodHlwZW9mIHNhbXBsZURhdGEgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2FtcGxlRGF0YSBpcyB1bmRlZmluZWQnLCBub3RlSWQpXG4gICAgICAgICAgICAgIH1lbHNlIGlmKHR5cGVTdHJpbmcoYnVmZmVyKSA9PT0gJ2FycmF5Jyl7XG5cbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGJ1ZmZlciwgc2FtcGxlRGF0YSlcbiAgICAgICAgICAgICAgICBzYW1wbGVEYXRhLmZvckVhY2goKHNkLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKG5vdGVJZCwgYnVmZmVyW2ldKVxuICAgICAgICAgICAgICAgICAgaWYodHlwZW9mIHNkID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICAgICAgICAgIHNkID0ge1xuICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyW2ldXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBzZC5idWZmZXIgPSBidWZmZXJbaV1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHNkLm5vdGUgPSBwYXJzZUludChub3RlSWQsIDEwKVxuICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2FtcGxlRGF0YShzZClcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgIH1lbHNlIHtcblxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlclxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBidWZmZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5ub3RlID0gcGFyc2VJbnQobm90ZUlkLCAxMClcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpXG5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICB9ZWxzZXtcblxuICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKChzYW1wbGUpID0+IHtcbiAgICAgICAgICAgIGxldCBzYW1wbGVEYXRhID0gZGF0YVtzYW1wbGVdXG4gICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2FtcGxlRGF0YSBpcyB1bmRlZmluZWQnLCBzYW1wbGUpXG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogc2FtcGxlLmJ1ZmZlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBzYW1wbGUuYnVmZmVyXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2FtcGxlRGF0YS5ub3RlID0gc2FtcGxlXG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcbiAgICAgICAgICAgICAgLy90aGlzLnVwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuXG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyhuZXcgRGF0ZSgpLmdldFRpbWUoKSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKlxuICAgIEBwYXJhbSBjb25maWcgKG9wdGlvbmFsKVxuICAgICAge1xuICAgICAgICBub3RlOiBjYW4gYmUgbm90ZSBuYW1lIChDNCkgb3Igbm90ZSBudW1iZXIgKDYwKVxuICAgICAgICBidWZmZXI6IEF1ZGlvQnVmZmVyXG4gICAgICAgIHN1c3RhaW46IFtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmRdLCAvLyBvcHRpb25hbCwgaW4gbWlsbGlzXG4gICAgICAgIHJlbGVhc2U6IFtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZV0sIC8vIG9wdGlvbmFsXG4gICAgICAgIHBhbjogcGFuUG9zaXRpb24gLy8gb3B0aW9uYWxcbiAgICAgICAgdmVsb2NpdHk6IFt2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZF0gLy8gb3B0aW9uYWwsIGZvciBtdWx0aS1sYXllcmVkIGluc3RydW1lbnRzXG4gICAgICB9XG4gICovXG4gIHVwZGF0ZVNhbXBsZURhdGEoLi4uZGF0YSl7XG4gICAgZGF0YS5mb3JFYWNoKG5vdGVEYXRhID0+IHtcbiAgICAgIC8vIHN1cHBvcnQgZm9yIG11bHRpIGxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgIC8vY29uc29sZS5sb2cobm90ZURhdGEsIHR5cGVTdHJpbmcobm90ZURhdGEpKVxuICAgICAgaWYodHlwZVN0cmluZyhub3RlRGF0YSkgPT09ICdhcnJheScpe1xuICAgICAgICBub3RlRGF0YS5mb3JFYWNoKHZlbG9jaXR5TGF5ZXIgPT4ge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEodmVsb2NpdHlMYXllcilcbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKG5vdGVEYXRhKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBfdXBkYXRlU2FtcGxlRGF0YShkYXRhID0ge30pe1xuICAgIC8vY29uc29sZS5sb2coZGF0YSlcbiAgICBsZXQge1xuICAgICAgbm90ZSxcbiAgICAgIGJ1ZmZlciA9IG51bGwsXG4gICAgICBzdXN0YWluID0gW251bGwsIG51bGxdLFxuICAgICAgc2VnbWVudCA9IFtudWxsLCBudWxsXSxcbiAgICAgIHJlbGVhc2UgPSBbbnVsbCwgJ2xpbmVhciddLCAvLyByZWxlYXNlIGR1cmF0aW9uIGlzIGluIHNlY29uZHMhXG4gICAgICBwYW4gPSBudWxsLFxuICAgICAgdmVsb2NpdHkgPSBbMCwgMTI3XSxcbiAgICB9ID0gZGF0YVxuXG4gICAgaWYodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBub3RlbnVtYmVyIG9yIGEgbm90ZW5hbWUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZ2V0IG5vdGVudW1iZXIgZnJvbSBub3RlbmFtZSBhbmQgY2hlY2sgaWYgdGhlIG5vdGVudW1iZXIgaXMgdmFsaWRcbiAgICBsZXQgbiA9IGdldE5vdGVEYXRhKHtudW1iZXI6IG5vdGV9KVxuICAgIGlmKG4gPT09IGZhbHNlKXtcbiAgICAgIGNvbnNvbGUud2Fybignbm90IGEgdmFsaWQgbm90ZSBpZCcpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbm90ZSA9IG4ubnVtYmVyXG5cbiAgICBsZXQgW3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZF0gPSBzdXN0YWluXG4gICAgbGV0IFtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZV0gPSByZWxlYXNlXG4gICAgbGV0IFtzZWdtZW50U3RhcnQsIHNlZ21lbnREdXJhdGlvbl0gPSBzZWdtZW50XG4gICAgbGV0IFt2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZF0gPSB2ZWxvY2l0eVxuXG4gICAgaWYoc3VzdGFpbi5sZW5ndGggIT09IDIpe1xuICAgICAgc3VzdGFpblN0YXJ0ID0gc3VzdGFpbkVuZCA9IG51bGxcbiAgICB9XG5cbiAgICBpZihyZWxlYXNlRHVyYXRpb24gPT09IG51bGwpe1xuICAgICAgcmVsZWFzZUVudmVsb3BlID0gbnVsbFxuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKG5vdGUsIGJ1ZmZlcilcbiAgICAvLyBjb25zb2xlLmxvZyhzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmQpXG4gICAgLy8gY29uc29sZS5sb2cocmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUpXG4gICAgLy8gY29uc29sZS5sb2cocGFuKVxuICAgIC8vIGNvbnNvbGUubG9nKHZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kKVxuXG5cbiAgICB0aGlzLnNhbXBsZXNEYXRhW25vdGVdLmZvckVhY2goKHNhbXBsZURhdGEsIGkpID0+IHtcbiAgICAgIGlmKGkgPj0gdmVsb2NpdHlTdGFydCAmJiBpIDw9IHZlbG9jaXR5RW5kKXtcbiAgICAgICAgaWYoc2FtcGxlRGF0YSA9PT0gLTEpe1xuICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICBpZDogbm90ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gYnVmZmVyIHx8IHNhbXBsZURhdGEuYnVmZmVyXG4gICAgICAgIHNhbXBsZURhdGEuc3VzdGFpblN0YXJ0ID0gc3VzdGFpblN0YXJ0IHx8IHNhbXBsZURhdGEuc3VzdGFpblN0YXJ0XG4gICAgICAgIHNhbXBsZURhdGEuc3VzdGFpbkVuZCA9IHN1c3RhaW5FbmQgfHwgc2FtcGxlRGF0YS5zdXN0YWluRW5kXG4gICAgICAgIHNhbXBsZURhdGEuc2VnbWVudFN0YXJ0ID0gc2VnbWVudFN0YXJ0IHx8IHNhbXBsZURhdGEuc2VnbWVudFN0YXJ0XG4gICAgICAgIHNhbXBsZURhdGEuc2VnbWVudER1cmF0aW9uID0gc2VnbWVudER1cmF0aW9uIHx8IHNhbXBsZURhdGEuc2VnbWVudER1cmF0aW9uXG4gICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uID0gcmVsZWFzZUR1cmF0aW9uIHx8IHNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uXG4gICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gcmVsZWFzZUVudmVsb3BlIHx8IHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlXG4gICAgICAgIHNhbXBsZURhdGEucGFuID0gcGFuIHx8IHNhbXBsZURhdGEucGFuXG5cbiAgICAgICAgaWYodHlwZVN0cmluZyhzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSkgPT09ICdhcnJheScpe1xuICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXkgPSBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZVxuICAgICAgICAgIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gJ2FycmF5J1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBkZWxldGUgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVBcnJheVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV1baV0gPSBzYW1wbGVEYXRhXG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV0pXG4gICAgfSlcbiAgfVxuXG5cbiAgLy8gc3RlcmVvIHNwcmVhZFxuICBzZXRLZXlTY2FsaW5nUGFubmluZygpe1xuICAgIC8vIHNldHMgcGFubmluZyBiYXNlZCBvbiB0aGUga2V5IHZhbHVlLCBlLmcuIGhpZ2hlciBub3RlcyBhcmUgcGFubmVkIG1vcmUgdG8gdGhlIHJpZ2h0IGFuZCBsb3dlciBub3RlcyBtb3JlIHRvIHRoZSBsZWZ0XG4gIH1cblxuICBzZXRLZXlTY2FsaW5nUmVsZWFzZSgpe1xuICAgIC8vIHNldCByZWxlYXNlIGJhc2VkIG9uIGtleSB2YWx1ZVxuICB9XG5cbiAgLypcbiAgICBAZHVyYXRpb246IG1pbGxpc2Vjb25kc1xuICAgIEBlbnZlbG9wZTogbGluZWFyIHwgZXF1YWxfcG93ZXIgfCBhcnJheSBvZiBpbnQgdmFsdWVzXG4gICovXG4gIHNldFJlbGVhc2UoZHVyYXRpb246IG51bWJlciwgZW52ZWxvcGUpe1xuICAgIC8vIHNldCByZWxlYXNlIGZvciBhbGwga2V5cywgb3ZlcnJ1bGVzIHZhbHVlcyBzZXQgYnkgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKVxuICAgIHRoaXMuc2FtcGxlc0RhdGEuZm9yRWFjaChmdW5jdGlvbihzYW1wbGVzLCBpZCl7XG4gICAgICBzYW1wbGVzLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlLCBpKXtcbiAgICAgICAgaWYoc2FtcGxlID09PSAtMSl7XG4gICAgICAgICAgc2FtcGxlID0ge1xuICAgICAgICAgICAgaWQ6IGlkXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNhbXBsZS5yZWxlYXNlRHVyYXRpb24gPSBkdXJhdGlvblxuICAgICAgICBzYW1wbGUucmVsZWFzZUVudmVsb3BlID0gZW52ZWxvcGVcbiAgICAgICAgc2FtcGxlc1tpXSA9IHNhbXBsZVxuICAgICAgfSlcbiAgICB9KVxuICAgIC8vY29uc29sZS5sb2coJyVPJywgdGhpcy5zYW1wbGVzRGF0YSlcbiAgfVxufVxuIiwiY29uc3Qgc2FtcGxlcyA9IHtcbi8vICBlbXB0eU9nZzogJ1QyZG5Vd0FDQUFBQUFBQUFBQUJkeGQ0WEFBQUFBRGFTMGpRQkhnRjJiM0ppYVhNQUFBQUFBVVNzQUFBQUFBQUFnTHNBQUFBQUFBQzRBVTluWjFNQUFBQUFBQUFBQUFBQVhjWGVGd0VBQUFBYVhLK1FEejMvLy8vLy8vLy8vLy8vLy8vL01nTjJiM0ppYVhNdEFBQUFXR2x3YUM1UGNtY2diR2xpVm05eVltbHpJRWtnTWpBeE1ERXhNREVnS0ZOamFHRjFabVZ1ZFdkblpYUXBBQUFBQUFFRmRtOXlZbWx6SDBKRFZnRUFBQUVBR0dOVUtVYVpVdEpLaVJsemxERkdtV0tTU29tbGhCWkNTSjF6RkZPcE9kZWNhNnk1dFNDRUVCcFRVQ2tGbVZLT1Vta1pZNUFwQlpsU0VFdEpKWFFTT2llZFl4QmJTY0hXbUd1TFFiWWNoQTJhVWt3cHhKUlNpa0lJR1ZPTUtjV1VVa3BDQnlWMERqcm1IRk9PU2loQnVKeHpxN1dXbG1PTHFYU1NTdWNrWkV4Q1NDbUZra29IcFZOT1FrZzFsdFpTS1IxelVsSnFRZWdnaEJCQ3RpQ0VEWUxRa0ZVQUFBRUF3RUFRR3JJS0FGQUFBQkNLb1JpS0FvU0dyQUlBTWdBQUJLQW9qdUlvamlNNWttTkpGaEFhc2dvQUFBSUFFQUFBd0hBVVNaRVV5YkVrUzlJc1M5TkVVVlY5MVRaVlZmWjFYZGQxWGRkMUlEUmtGUUFBQVFCQVNLZVpwUm9nd2d4a0dBZ05XUVVBSUFBQUFFWW93aEFEUWtOV0FRQUFBUUFBWWlnNWlDYTA1bnh6am9ObU9XZ3F4ZVowY0NMVjVrbHVLdWJtbkhQT09TZWJjOFk0NTV4emluSm1NV2dtdE9hY2N4S0RaaWxvSnJUbW5IT2V4T1pCYTZxMDVweHp4am1uZzNGR0dPZWNjNXEwNWtGcU50Ym1uSE1XdEtZNWFpN0Y1cHh6SXVYbVNXMHUxZWFjYzg0NTU1eHp6am5ubkhPcUY2ZHpjRTQ0NTV4em92Ym1XbTVDRitlY2N6NFpwM3R6UWpqbm5IUE9PZWVjYzg0NTU1eHpndENRVlFBQUVBQUFRUmcyaG5HbklFaWZvNEVZUllocHlLUUgzYVBESkdnTWNncXBSNk9qa1ZMcUlKUlV4a2twblNBMFpCVUFBQWdBQUNHRUZGSklJWVVVVWtnaGhSUlNpQ0dHR0dMSUthZWNnZ29xcWFTaWlqTEtMTFBNTXNzc3M4d3k2N0N6empyc01NUVFRd3l0dEJKTFRiWFZXR090dWVlY2F3N1NXbW10dGRaS0thV1VVa29wQ0ExWkJRQ0FBQUFRQ0Jsa2tFRkdJWVVVVW9naHBweHl5aW1vb0FKQ1ExWUJBSUFBQUFJQUFBQTh5WE5FUjNSRVIzUkVSM1JFUjNSRXgzTThSNVJFU1pSRVNiUk15OVJNVHhWVjFaVmRXOVpsM2ZadFlSZDIzZmQxMy9kMTQ5ZUZZVm1XWlZtV1pWbVdaVm1XWlZtV1pWbUMwSkJWQUFBSUFBQ0FFRUlJSVlVVVVrZ2hwUmhqekRIbm9KTlFRaUEwWkJVQUFBZ0FJQUFBQU1CUkhNVnhKRWR5Sk1tU0xFbVRORXV6UE0zVFBFMzBSRkVVVGROVVJWZDBSZDIwUmRtVVRkZDBUZGwwVlZtMVhWbTJiZG5XYlYrV2JkLzNmZC8zZmQvM2ZkLzNmZC8zZFIwSURWa0ZBRWdBQU9oSWpxUklpcVJJanVNNGtpUUJvU0dyQUFBWkFBQUJBQ2lLb3ppTzQwaVNKRW1XcEVtZTVWbWlabXFtWjNxcXFBS2hJYXNBQUVBQUFBRUFBQUFBQUNpYTRpbW00aW1pNGptaUkwcWlaVnFpcG1xdUtKdXk2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3b3VFQnF5Q2dDUUFBRFFrUnpKa1J4SmtSUkprUnpKQVVKRFZnRUFNZ0FBQWdCd0RNZVFGTW14TEV2VFBNM1RQRTMwUkUvMFRFOFZYZEVGUWtOV0FRQ0FBQUFDQUFBQUFBQXdKTU5TTEVkek5FbVVWRXUxVkUyMVZFc1ZWVTlWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVTFUZE0wVFNBMFpDVUFBQVFBd0dLTndlVWdJU1VsNWQ0UXdoQ1RuakVtSWJWZUlRU1JrdDR4QmhXRG5qS2lESExlUXVNUWd4NElEVmtSQUVRQkFBREdJTWNRYzhnNVI2bVRFam5ucUhTVUd1Y2NwWTVTWnluRm1HTE5LSlhZVXF5TmM0NVNSNjJqbEdJc0xYYVVVbzJweGdJQUFBSWNBQUFDTElSQ1ExWUVBRkVBQUlReFNDbWtGR0tNT2FlY1E0d3A1NWh6aGpIbUhIT09PZWVnZEZJcTU1eDBUa3JFR0hPT09hZWNjMUk2SjVWelRrb25vUUFBZ0FBSEFJQUFDNkhRa0JVQlFKd0FnRUdTUEUveU5GR1VORThVUlZOMFhWRTBYZGZ5UE5YMFRGTlZQZEZVVlZOVmJkbFVWVm1XUE04MFBkTlVWYzgwVmRWVVZWazJWVldXUlZYVmJkTjFkZHQwVmQyV2JkdjNYVnNXZGxGVmJkMVVYZHMzVmRmMlhkbjJmVm5XZFdQeVBGWDFUTk4xUGROMFpkVjFiVnQxWFYzM1RGT1dUZGVWWmROMWJkdVZaVjEzWmRuM05kTjBYZE5WWmRsMFhkbDJaVmUzWFZuMmZkTjFoZCtWWlY5WFpWa1lkbDMzaFZ2WGxlVjBYZDFYWlZjM1ZsbjJmVnZYaGVIV2RXR1pQRTlWUGROMFhjODBYVmQxWFY5WFhkZldOZE9VWmROMWJkbFVYVmwyWmRuM1hWZldkYzgwWmRsMFhkczJYVmVXWFZuMmZWZVdkZDEwWFY5WFpWbjRWVmYyZFZuWGxlSFdiZUUzWGRmM1ZWbjJoVmVXZGVIV2RXRzVkVjBZUGxYMWZWTjJoZUYwWmQvWGhkOVpibDA0bHRGMWZXR1ZiZUZZWlZrNWZ1RllsdDMzbFdWMFhWOVliZGtZVmxrV2hsLzRuZVgyZmVONGRWMFpidDNuekxydkRNZnZwUHZLMDlWdFk1bDkzVmxtWDNlTzRSZzZ2L0RqcWFxdm02NHJES2NzQzcvdDY4YXorNzZ5aks3cis2b3NDNzhxMjhLeDY3N3ovTDZ3TEtQcytzSnF5OEt3MnJZeDNMNXVMTDl3SE10cjY4b3g2NzVSdG5WOFgzZ0t3L04wZFYxNVpsM0g5blYwNDBjNGZzb0FBSUFCQndDQUFCUEtRS0VoS3dLQU9BRUFqeVNKb21SWm9paFpsaWlLcHVpNm9taTZycVJwcHFscG5tbGFtbWVhcG1tcXNpbWFyaXhwbW1sYW5tYWFtcWVacG1pYXJtdWFwcXlLcGluTHBtcktzbW1hc3V5NnNtMjdybXpib21uS3NtbWFzbXlhcGl5N3NxdmJydXpxdXFSWnBxbDVubWxxbm1lYXBtcktzbW1hcnF0NW5tcDZubWlxbmlpcXFtcXFxcTJxcWl4Ym5tZWFtdWlwcGllS3FtcXFwcTJhcWlyTHBxcmFzbW1xdG15cXFtMjdxdXo2c20zcnVtbXFzbTJxcGkyYnFtcmJydXpxc2l6YnVpOXBtbWxxbm1lYW11ZVpwbW1hc215YXFpdGJucWVhbmlpcXF1YUpwbXFxcWl5YnBxcktsdWVacWllS3F1cUpubXVhcWlyTHBtcmFxbW1hdG15cXFpMmJwaXJMcm0zN3Z1dktzbTZxcW15YnFtcnJwbXJLc216THZ1L0txdTZLcGluTHBxcmFzbW1xc2kzYnN1L0xzcXo3b21uS3NtbXFzbTJxcWk3THNtMGJzMno3dW1pYXNtMnFwaTJicWlyYnNpMzd1aXpidXUvS3JtK3JxcXpyc2kzN3V1NzZybkRydWpDOHNtejdxcXo2dWl2YnVtL3JNdHYyZlVUVGxHVlROVzNiVkZWWmRtWFo5bVhiOW4zUk5HMWJWVlZiTmszVnRtVlo5bjFadG0xaE5FM1pObFZWMWszVnRHMVpsbTFodG1YaGRtWFp0MlZiOW5YWGxYVmYxMzNqMTJYZDVycXk3Y3V5cmZ1cXEvcTI3dnZDY091dThBb0FBQmh3QUFBSU1LRU1GQnF5RWdDSUFnQUFqR0dNTVFpTlVzNDVCNkZSeWpubklHVE9RUWdobGN3NUNDR1VramtIb1pTVU11Y2dsSkpTQ0tHVWxGb0xJWlNVVW1zRkFBQVVPQUFBQk5pZ0tiRTRRS0VoS3dHQVZBQUFnK05ZbHVlWm9tcmFzbU5KbmllS3FxbXF0dTFJbHVlSm9tbXFxbTFibmllS3BxbXFydXZybXVlSm9tbXFxdXZxdW1pYXBxbXFydXU2dWk2YW9xbXFxdXU2c3E2YnBxcXFyaXU3c3V6cnBxcXFxdXZLcml6N3dxcTZyaXZMc20zcndyQ3FydXZLc216YnRtL2N1cTdydnUvN3dwR3Q2N291L01JeERFY0JBT0FKRGdCQUJUYXNqbkJTTkJaWWFNaEtBQ0FEQUlBd0JpR0RFRUlHSVlTUVVrb2hwWlFTQUFBdzRBQUFFR0JDR1NnMFpFVUFFQ2NBQUJoREthU1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSklLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktxYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLWlZTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVnb0FrSXB3QUpCNk1LRU1GQnF5RWdCSUJRQUFqRkZLS2NhY2d4QXg1aGhqMEVrb0tXTE1PY1ljbEpKUzVSeUVFRkpwTGJmS09RZ2hwTlJTYlpselVscUxNZVlZTStla3BCUmJ6VG1IVWxLTHNlYWFhKzZrdEZacnJqWG5XbHFyTmRlY2M4MjV0QlpycmpuWG5IUExNZGVjYzg0NTV4aHp6am5ubkhQT0JRRGdORGdBZ0I3WXNEckNTZEZZWUtFaEt3R0FWQUFBQWhtbEdIUE9PZWdRVW93NTV4eUVFQ0tGR0hQT09RZ2hWSXc1NXh4MEVFS29HSFBNT1FnaGhKQTU1eHlFRUVJSUlYTU9PdWdnaEJCQ0J4MkVFRUlJb1pUT1FRZ2hoQkJLS0NHRUVFSUlJWVFRT2dnaGhCQkNDQ0dFRUVJSUlZUlNTZ2doaEJCQ0NhR1VVQUFBWUlFREFFQ0FEYXNqbkJTTkJSWWFzaElBQUFJQWdCeVdvRkxPaEVHT1FZOE5RY3BSTXcxQ1REblJtV0pPYWpNVlU1QTVFSjEwRWhscVFkbGVNZ3NBQUlBZ0FDREFCQkFZSUNqNFFnaUlNUUFBUVlqTUVBbUZWYkRBb0F3YUhPWUJ3QU5FaEVRQWtKaWdTTHU0Z0M0RFhOREZYUWRDQ0VJUWdsZ2NRQUVKT0RqaGhpZmU4SVFibktCVFZPb2dBQUFBQUFBTUFPQUJBT0NnQUNJaW1xdXd1TURJME5qZzZQQUlBQUFBQUFBV0FQZ0FBRGcrZ0lpSTVpb3NMakF5TkRZNE9qd0NBQUFBQUFBQUFBQ0FnSUFBQUFBQUFFQUFBQUNBZ0U5bloxTUFCQUVBQUFBQUFBQUFYY1hlRndJQUFBQnEybnB4QWdFQkFBbz0nLFxuLy8gIGVtcHR5TXAzOiAnLy91UXhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVNXNW1id0FBQUE4QUFBQUJBQUFEUWdELy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy84QUFBQTVURUZOUlRNdU9UbHlBYzBBQUFBQUFBQUFBQlNBSkFKQVFnQUFnQUFBQTBMMllMUXhBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQS8vdVF4QUFEd0FBQnBBQUFBQ0FBQURTQUFBQUVURUZOUlRNdU9Ua3VOVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYnLFxuICBoaWdodGljazogJ1VrbEdSa1FGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZU0FGQUFDeC94Zi9kQURPQUN3QnNQM3ArNkgrekFHb0JPa0NDd0JYL0VINU92eGxBNGtKMndjU0FyVDlFL3V0K0hUMmV2VXg5OG42T0FGNUNDVU13UXZmQ09zSnhBeDBEU0lNRUFxOUJpQUIzdmh6N21Ma1Q5c1IxMzNZeE4yczVRTHYwdnJVQm53Um54dVFKZUVzU0RDaU1kOHlGUzhhS0ZJaG9oVXNDS2o2NHU2MjVPcmFBOUh1eVBuRWxjUCt3eHZKV3RXMjU2MzdWUTBqSFBnbkJURERNMW8wQ3pLTEsrOGh6aGdGRE96OFNlNEo0N0RZVnRHMHo1ZlFxOUxCMTJyZkErajk5cm9IQWhlbEl5TXdJamRUT3VVOG1qd0lPR294aENiNUU1My9qKzNrMy9mVFk4cFR3NHkvVHIrZXc4RE12ZHNrOFJjSFJSa1NLTzR5R1RrSFBrVS9yenp5TmNnc3JSOTREcC81citaczE3ek9uY29EeGhmRTM4V0x5bi9UZU9NaTlyMElSeGxSS0lRenlUbE9QS285eWptV01jb2tEUkxjL1k3cnVkdGR6dS9EMkwxSXUrMjdKY0czeVlyVkx1amwrM1VPWngxVUs1UTBxem1OUERrOFpqZWVNUG9qemhIKy9qTHRQZDVtMGhITEhzWUl3NVRFTU1uQTBqdmo4ZlNPQml3WEFTWmdNek04ZFVCR1FiSStyempwS2tJWnlnWlQ5UWZsY2RhUnlxWEN6NytWd1VQSDc4NHIzSzdzK3YwS0R1OGJ2eWVMTWI0M05qcmhPSW8wZFN2UUhpMFBuUDZpN292ZzNOVHh5NC9HZjhYOHlIL1FCdHZYNTVQMllnYjBGY1Vqc3k0TE5tSTVlamlYTTM4cjdpQzhGSndIUHZvazdkRGdRZGFKemxUS0lzb0Z6c3JWa3VBODdkLzZxQWk3RlEwaDlDbEtNTEV6M1RPck1CY3FZU0Q4RTlBRmQvZFM2a1RmNmRiVTBYblF2OUlIMk1YZlorbG45REVBRnd3ZEZ5OGdpaWI2S2F3cWVDaGdJL1ViSEJPVENaai92dlhlN0lubEZ1RE4zUDNiMGQxRjRnenBpZkcyK3U0RDdRdzFGZndibkNEK0lsZ2pXeUhMSFBNVm9nMm1CTDM3cXZQKzdOdm5ZdVR2NHJ2amZ1Yk42azN3cFBaMC9Xa0VPd3RpRVVzV2N4bStHbDRhT2hoaUZEQVBJd21iQXRuN1RQVnk3N3pxY2VmcjVZSG1IdWxsN2VueWZQbWNBSGdIZXcxUkVyOFZoaGQvRitBVjFSSjBEaWtKV1FOYy9aUDNlZktkN2h2czJ1cjQ2ckhzNXU4ZTlOLzQ4LzBoQS84SEZnd3VEMDRSU0JJUkVxc1FPZzdtQ3NzR01BSlcvWG40Ry9USzhMYnV6dTBJN3FUdm5QSnk5c1g2YlA4NEJMWUliQXdkRDg0UVl4RzdFT2NPREF4d0NGTUVBUUM5KzdQM1N2VFg4WEh3K3U5UjhLVHhJdlNvOStYN1ZRQ1VCSjBJTXd6aURqNFFMaEFHRDlVTXJnblRCWmNCUnYxditYdjJVZlMrOHRmeCt2RVM4N3owK3ZiMytaZjlaZ0VRQlNFSVVBcldDOGtNMlF5ekM1RUpFQWR2QkhnQlhQNW4rK3I0QXZkODlXajA3Zk13OUQzMUp2ZnArVWo5eFFEOUE4UUc1UWhYQ2xFTHJBc3ZDOXdKN2dkNkJXSUMzdjZPKzdUNFBQWk45RUh6V3ZOZjlQejFGdml0K3FMOXJRQ0hBd0VHL3dlQ0NaVUtGd3ZEQ25JSmNBY1FCV2NDYWY4Wi9DRDU1dmFCOWREMHdQU1A5VUwzbS9rNy9NeitKd0V5QXc4RnpBWTdDQnNKYVFrNUNXa0kyZ2F0QkNJQ1lmK2ovRnI2dmZpVjk4NzJzZlpQOTF6NHAvbFIrM0g5emY4OUFyb0VGQWZqQ1AwSmN3bzhDakFKZFFkZ0JTRURrZ0RRL1ZqN1pmblI5NVQyOGZVZDl2MzJWdmcyK25iOCsvNnhBV29FNEFiRENQNEpwQXFiQ3FRSjB3ZUVCZmdDVEFDVC9SMzdNL20rOTY3MklQWTY5Z2IzYWZoVyt0VDhxZitNQWowRmdnY3VDU2NLWEFyaUNjTUlFQWZ5QkpZQ0Z3Q1AvUno3QS9sNzkzejJGL1puOW1IMzdmamQraTM5eWY5cEF0MEVGQWZSQ05rSkdBcXJDWllJdmdaUEJKOEI2UDQvL00zNTB2ZHo5cS8xbGZVcTltejNSUG1pKzNIK2JnRlZCT1FHM3dnSENrd0swQW03Q0NBSENnV21BakFBJyxcbiAgbG93dGljazogJ1VrbEdSbFFGQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZVEFGQUFCMC81ditVLzRULzNnQTB3RlRBdVVCK2Y4ZC9uVDkwZjFxL3ViK3RmNDYvbWIvOHdGUUE5Z0M3d0NkL21yK0ZBR1JBM2NFNndKZi9oMzZldm12Kzh2L053UkhCWlVDMi82MCsvLzVFdnVaL2FYL2JnRk9BcDhBenZ6aDl3ZnpMUEY2OHpUNHkvMkJBeWdJZlF3YUVqWVkweDMxSXJ3bDhTT1dIVkVTT2dQaDlOZnBSZUZ0MjJuWUhkZEQyQlhjWmVEYTVJbnFnUER4OW5QKzZnUzRDQllMbncwekVTMFdYeHY0SGtjZ0xoLzFHK0VYMVJOcEQ0d0tpZ1hILzZyNS9mTnU3bFRwaitadTVoSG9YT3RMNzFieXIvUXA5MUw2NHY2T0JPNEpvUTV6RXNrVStoVTFGaVFWZVJQN0VXZ1A0UXIwQklUK3RQaWQ5QzN5MXZDaDhGRHhKdksyOHZ2eXkvTEE4cEx6VS9YUDk1djZ4dnc0L3VEL1JBSzJCU2tLY2c2QkVTY1RaQk1lRXFrUFRReGpDS0VFVndGaS9udjdoL2hwOWFEeUF2SFA4TWZ4THZNKzlQWDB1UFcxOWcvNExmcjcvQzRBS2dOYUJYUUd5d2IwQmhJSFdRZldCMW9JekFqdENGOElId2R0QmFrRFZ3S0xBZVlBOHY5dy9rajgxL25ROTR2MjkvWFg5YnoxYlBVWTlVejFaL2FIK0hyN3lQNE1BaTRGK3djZkNuWUxOZ3lmRFBzTVN3MHNEVUFNZmdyY0I1SUVNd0ZiL2lYOFQvcFQrTy8xWC9NZjhjYnZyTysxOE1MeXZmVlArUmY5d2dBb0JDRUhwd25JQzVFTjRRNUFEM3dPMUF5MENwc0l2d2J2Qk5jQ2JRQXIvblg4T2ZzZit2YjRtdmRhOXJqMXovV1g5cEwzYS9oSCtaWDZSL3duL3ZQL2VRRVNBL0FFK3dZRENjd0tGQXlQRENrTUZRdVNDZTRIVlFiU0JIUURDd0k4QU5MOUpQdVkrSFgyOHZUcTgyUHpkUE1WOUF6MU1mWjQ5ekQ1Z2Z0eC9zUUJCUVhMQjhjSi9ncXBDdzhNaWd3V0RYRU5YUTJyRERVTDdRZ0RCc3dDZHY4Uy9LNzRXUFZrOGhYd291NFA3bXZ1MSs5VDhwejFVdmxpL1pvQndnV1JDY3NNUGcvQ0VFUVI0UkRBRHdvTzl3dXNDVk1INEFSU0Fwbi91ZnpkK1dqM2J2WDc4eHp6eC9MNjhxenoxdlNEOXFYNEdmdmQvYzBBaHdPL0JXd0htZ2h2Q1FFS1ZRb25DbHNKQ3dpSUJoMEYwZ09nQW0wQk93QXgvMDMrWFAwZy9MYjZjUG1YK0YvNHZmaCsrVEg2cy9vcys3LzdjdndML1p6OVhQNU8vM0lBM0FGOUF6c0Y5Z2FVQ0FBS0hndWVDemNMOXdudEIzc0Y0d0l6QUkzOTZmcDErR3YySXZXbjlOMzBwL1hpOW03NEcvcnUrOVA5ay84YUFZRUMxQU1UQlNJRzB3WXVCMWdIa2djQUNHRUlTQWhUQnpFRldBS3QvNUw5MmZ1VSt2WDUwZm1mK1NQNWkvZ2IrQmY0bXZpditTcjdrdnliL1VqK3IvNFgvOHIvK2dDaUFvMEVVQWFSQnp3SVN3anFCM0lIR1FmQ0J2OEZwZ1RNQXBRQUtmNjcrNW41L3ZmbjlqejJ5UFZuOVNMMVJQWHE5U1AzRHZtcis2ZitzUUdLQkFjSCt3aE9DaDBMYXdzM0MyOEtMQW1EQjVBRmZRTm9BVlAvWnYzZSs3UDZzZm5MK0N2NHZQZU05NWIzN2ZlVitKbjUxUG9xL0xMOW12K1lBVllEM2dRdUJtY0hTQWlrQ0lFSTdBZitCdUVGbmdRWEExc0J2Lzl2L3BmOU1QM1cvRmo4cS9zUis2SDZVL28zK21QNnkvcE4rL2Y3eHZ5ZS9XSCtKZjltQUQ0Q1FBUUpCaXNIdGdmNkJ3MEk4UWRzQjFzR3l3VDRBZ2dCQ1Avby9LWDZtUGcxOTU3MmpmYXo5dWYyUy9jTStFMzVFL3RXL2FmLzV3SDFBOEFGS2dma0IvQUhnd2Z4QmxBR2dRVklCTU1DSndHcy80Myt2UDBpL1pyOExmemwrOUg3NmZ2aSs5Zjc1ZnNmL0luOEJQMTAvZWo5Y2Y0Ty83Zi9kQUFjQWFVQkVnS01BaGdEcEFNRUJDRUVEd1RmQTNJRHhRTDhBU29CVXdDRy84NytKLzZoL1JyOXBQeGsvR2I4b1B3Si9YSDl3LzM5L1VEK3FQNDEvOUQvV3dEZUFHc0JBZ0tkQWhFRFFRTkFBMHNEYndPVkE1WURWd1BPQWhnQ1ZBR1JBQT09Jyxcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2FtcGxlc1xuIiwiLypcblxuXG5UaGlzIGNvZGUgaXMgYmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL3NlcmdpL2pzbWlkaVxuXG5pbmZvOiBodHRwOi8vd3d3LmRlbHVnZS5jby8/cT1taWRpLXRlbXBvLWJwbVxuXG4qL1xuXG5cbmltcG9ydCB7c2F2ZUFzfSBmcm9tICdmaWxlc2F2ZXJqcydcblxubGV0IFBQUSA9IDk2MFxubGV0IEhEUl9QUFEgPSBzdHIyQnl0ZXMoUFBRLnRvU3RyaW5nKDE2KSwgMilcblxuY29uc3QgSERSX0NIVU5LSUQgPSBbXG4gICdNJy5jaGFyQ29kZUF0KDApLFxuICAnVCcuY2hhckNvZGVBdCgwKSxcbiAgJ2gnLmNoYXJDb2RlQXQoMCksXG4gICdkJy5jaGFyQ29kZUF0KDApXG5dXG5jb25zdCBIRFJfQ0hVTktfU0laRSA9IFsweDAsIDB4MCwgMHgwLCAweDZdIC8vIEhlYWRlciBzaXplIGZvciBTTUZcbmNvbnN0IEhEUl9UWVBFMCA9IFsweDAsIDB4MF0gLy8gTWlkaSBUeXBlIDAgaWRcbmNvbnN0IEhEUl9UWVBFMSA9IFsweDAsIDB4MV0gLy8gTWlkaSBUeXBlIDEgaWRcbi8vSERSX1BQUSA9IFsweDAxLCAweEUwXSAvLyBEZWZhdWx0cyB0byA0ODAgdGlja3MgcGVyIGJlYXRcbi8vSERSX1BQUSA9IFsweDAwLCAweDgwXSAvLyBEZWZhdWx0cyB0byAxMjggdGlja3MgcGVyIGJlYXRcblxuY29uc3QgVFJLX0NIVU5LSUQgPSBbXG4gICdNJy5jaGFyQ29kZUF0KDApLFxuICAnVCcuY2hhckNvZGVBdCgwKSxcbiAgJ3InLmNoYXJDb2RlQXQoMCksXG4gICdrJy5jaGFyQ29kZUF0KDApXG5dXG5cbi8vIE1ldGEgZXZlbnQgY29kZXNcbmNvbnN0IE1FVEFfU0VRVUVOQ0UgPSAweDAwXG5jb25zdCBNRVRBX1RFWFQgPSAweDAxXG5jb25zdCBNRVRBX0NPUFlSSUdIVCA9IDB4MDJcbmNvbnN0IE1FVEFfVFJBQ0tfTkFNRSA9IDB4MDNcbmNvbnN0IE1FVEFfSU5TVFJVTUVOVCA9IDB4MDRcbmNvbnN0IE1FVEFfTFlSSUMgPSAweDA1XG5jb25zdCBNRVRBX01BUktFUiA9IDB4MDZcbmNvbnN0IE1FVEFfQ1VFX1BPSU5UID0gMHgwN1xuY29uc3QgTUVUQV9DSEFOTkVMX1BSRUZJWCA9IDB4MjBcbmNvbnN0IE1FVEFfRU5EX09GX1RSQUNLID0gMHgyZlxuY29uc3QgTUVUQV9URU1QTyA9IDB4NTFcbmNvbnN0IE1FVEFfU01QVEUgPSAweDU0XG5jb25zdCBNRVRBX1RJTUVfU0lHID0gMHg1OFxuY29uc3QgTUVUQV9LRVlfU0lHID0gMHg1OVxuY29uc3QgTUVUQV9TRVFfRVZFTlQgPSAweDdmXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVBc01JRElGaWxlKHNvbmcsIGZpbGVOYW1lID0gc29uZy5uYW1lLCBwcHEgPSA5NjApIHtcblxuICBQUFEgPSBwcHFcbiAgSERSX1BQUSA9IHN0cjJCeXRlcyhQUFEudG9TdHJpbmcoMTYpLCAyKVxuXG4gIGxldCBieXRlQXJyYXkgPSBbXS5jb25jYXQoSERSX0NIVU5LSUQsIEhEUl9DSFVOS19TSVpFLCBIRFJfVFlQRTEpXG4gIGxldCB0cmFja3MgPSBzb25nLmdldFRyYWNrcygpXG4gIGxldCBudW1UcmFja3MgPSB0cmFja3MubGVuZ3RoICsgMVxuICBsZXQgaSwgbWF4aSwgdHJhY2ssIG1pZGlGaWxlLCBkZXN0aW5hdGlvbiwgYjY0XG4gIGxldCBhcnJheUJ1ZmZlciwgZGF0YVZpZXcsIHVpbnRBcnJheVxuXG4gIGJ5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQoc3RyMkJ5dGVzKG51bVRyYWNrcy50b1N0cmluZygxNiksIDIpLCBIRFJfUFBRKVxuXG4gIC8vY29uc29sZS5sb2coYnl0ZUFycmF5KTtcbiAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdCh0cmFja1RvQnl0ZXMoc29uZy5fdGltZUV2ZW50cywgc29uZy5fZHVyYXRpb25UaWNrcywgJ3RlbXBvJykpXG5cbiAgZm9yKGkgPSAwLCBtYXhpID0gdHJhY2tzLmxlbmd0aDsgaSA8IG1heGk7IGkrKyl7XG4gICAgdHJhY2sgPSB0cmFja3NbaV07XG4gICAgbGV0IGluc3RydW1lbnRcbiAgICBpZih0cmFjay5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICBpbnN0cnVtZW50ID0gdHJhY2suX2luc3RydW1lbnQuaWRcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCB0cmFjay5fZXZlbnRzLmxlbmd0aCwgaW5zdHJ1bWVudClcbiAgICBieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHRyYWNrVG9CeXRlcyh0cmFjay5fZXZlbnRzLCBzb25nLl9kdXJhdGlvblRpY2tzLCB0cmFjay5uYW1lLCBpbnN0cnVtZW50KSlcbiAgICAvL2J5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQodHJhY2tUb0J5dGVzKHRyYWNrLl9ldmVudHMsIHNvbmcuX2xhc3RFdmVudC5pY2tzLCB0cmFjay5uYW1lLCBpbnN0cnVtZW50KSlcbiAgfVxuXG4gIC8vYjY0ID0gYnRvYShjb2RlczJTdHIoYnl0ZUFycmF5KSlcbiAgLy93aW5kb3cubG9jYXRpb24uYXNzaWduKFwiZGF0YTphdWRpby9taWRpO2Jhc2U2NCxcIiArIGI2NClcbiAgLy9jb25zb2xlLmxvZyhiNjQpLy8gc2VuZCB0byBzZXJ2ZXJcblxuICBtYXhpID0gYnl0ZUFycmF5Lmxlbmd0aFxuICBhcnJheUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihtYXhpKVxuICB1aW50QXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcilcbiAgZm9yKGkgPSAwOyBpIDwgbWF4aTsgaSsrKXtcbiAgICB1aW50QXJyYXlbaV0gPSBieXRlQXJyYXlbaV1cbiAgfVxuICBtaWRpRmlsZSA9IG5ldyBCbG9iKFt1aW50QXJyYXldLCB7dHlwZTogJ2FwcGxpY2F0aW9uL3gtbWlkaScsIGVuZGluZ3M6ICd0cmFuc3BhcmVudCd9KVxuICBmaWxlTmFtZSA9IGZpbGVOYW1lLnJlcGxhY2UoL1xcLm1pZGkkLywgJycpXG4gIC8vbGV0IHBhdHQgPSAvXFwubWlkW2ldezAsMX0kL1xuICBsZXQgcGF0dCA9IC9cXC5taWQkL1xuICBsZXQgaGFzRXh0ZW5zaW9uID0gcGF0dC50ZXN0KGZpbGVOYW1lKVxuICBpZihoYXNFeHRlbnNpb24gPT09IGZhbHNlKXtcbiAgICBmaWxlTmFtZSArPSAnLm1pZCdcbiAgfVxuICAvL2NvbnNvbGUubG9nKGZpbGVOYW1lLCBoYXNFeHRlbnNpb24pXG4gIHNhdmVBcyhtaWRpRmlsZSwgZmlsZU5hbWUpXG4gIC8vd2luZG93LmxvY2F0aW9uLmFzc2lnbih3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChtaWRpRmlsZSkpXG59XG5cblxuZnVuY3Rpb24gdHJhY2tUb0J5dGVzKGV2ZW50cywgbGFzdEV2ZW50VGlja3MsIHRyYWNrTmFtZSwgaW5zdHJ1bWVudE5hbWUgPSAnbm8gaW5zdHJ1bWVudCcpe1xuICB2YXIgbGVuZ3RoQnl0ZXMsXG4gICAgaSwgbWF4aSwgZXZlbnQsIHN0YXR1cyxcbiAgICB0cmFja0xlbmd0aCwgLy8gbnVtYmVyIG9mIGJ5dGVzIGluIHRyYWNrIGNodW5rXG4gICAgdGlja3MgPSAwLFxuICAgIGRlbHRhID0gMCxcbiAgICB0cmFja0J5dGVzID0gW107XG5cbiAgaWYodHJhY2tOYW1lKXtcbiAgICB0cmFja0J5dGVzLnB1c2goMHgwMCk7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAzKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKHRyYWNrTmFtZS5sZW5ndGgpKTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoc3RyaW5nVG9OdW1BcnJheSh0cmFja05hbWUpKTtcbiAgfVxuXG4gIGlmKGluc3RydW1lbnROYW1lKXtcbiAgICB0cmFja0J5dGVzLnB1c2goMHgwMCk7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDA0KTtcbiAgICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKGluc3RydW1lbnROYW1lLmxlbmd0aCkpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHJpbmdUb051bUFycmF5KGluc3RydW1lbnROYW1lKSk7XG4gIH1cblxuICBmb3IoaSA9IDAsIG1heGkgPSBldmVudHMubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKXtcbiAgICBldmVudCA9IGV2ZW50c1tpXTtcbiAgICBkZWx0YSA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gICAgZGVsdGEgPSBjb252ZXJ0VG9WTFEoZGVsdGEpO1xuICAgIC8vY29uc29sZS5sb2coZGVsdGEpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChkZWx0YSk7XG4gICAgLy90cmFja0J5dGVzLnB1c2guYXBwbHkodHJhY2tCeXRlcywgZGVsdGEpO1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDB4ODAgfHwgZXZlbnQudHlwZSA9PT0gMHg5MCl7IC8vIG5vdGUgb2ZmLCBub3RlIG9uXG4gICAgICAvL3N0YXR1cyA9IHBhcnNlSW50KGV2ZW50LnR5cGUudG9TdHJpbmcoMTYpICsgZXZlbnQuY2hhbm5lbC50b1N0cmluZygxNiksIDE2KTtcbiAgICAgIHN0YXR1cyA9IGV2ZW50LnR5cGUgKyAoZXZlbnQuY2hhbm5lbCB8fCAwKVxuICAgICAgdHJhY2tCeXRlcy5wdXNoKHN0YXR1cyk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQuZGF0YTEpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKGV2ZW50LmRhdGEyKTtcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAweDUxKXsgLy8gdGVtcG9cbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDUxKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDAzKTsvLyBsZW5ndGhcbiAgICAgIC8vdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUSgzKSk7Ly8gbGVuZ3RoXG4gICAgICB2YXIgbWljcm9TZWNvbmRzID0gTWF0aC5yb3VuZCg2MDAwMDAwMCAvIGV2ZW50LmJwbSk7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJwbSlcbiAgICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHIyQnl0ZXMobWljcm9TZWNvbmRzLnRvU3RyaW5nKDE2KSwgMykpO1xuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDB4NTgpeyAvLyB0aW1lIHNpZ25hdHVyZVxuICAgICAgdmFyIGRlbm9tID0gZXZlbnQuZGVub21pbmF0b3I7XG4gICAgICBpZihkZW5vbSA9PT0gMil7XG4gICAgICAgIGRlbm9tID0gMHgwMTtcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSA0KXtcbiAgICAgICAgZGVub20gPSAweDAyO1xuICAgICAgfWVsc2UgaWYoZGVub20gPT09IDgpe1xuICAgICAgICBkZW5vbSA9IDB4MDM7XG4gICAgICB9ZWxzZSBpZihkZW5vbSA9PT0gMTYpe1xuICAgICAgICBkZW5vbSA9IDB4MDQ7XG4gICAgICB9ZWxzZSBpZihkZW5vbSA9PT0gMzIpe1xuICAgICAgICBkZW5vbSA9IDB4MDU7XG4gICAgICB9XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRlbm9taW5hdG9yLCBldmVudC5ub21pbmF0b3IpXG4gICAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHg1OCk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHgwNCk7Ly8gbGVuZ3RoXG4gICAgICAvL3RyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoNCkpOy8vIGxlbmd0aFxuICAgICAgdHJhY2tCeXRlcy5wdXNoKGV2ZW50Lm5vbWluYXRvcik7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZGVub20pO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKFBQUSAvIGV2ZW50Lm5vbWluYXRvcik7XG4gICAgICB0cmFja0J5dGVzLnB1c2goMHgwOCk7IC8vIDMybmQgbm90ZXMgcGVyIGNyb3RjaGV0XG4gICAgICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgZXZlbnQubm9taW5hdG9yLCBldmVudC5kZW5vbWluYXRvciwgZGVub20sIFBQUS9ldmVudC5ub21pbmF0b3IpO1xuICAgIH1cbiAgICAvLyBzZXQgdGhlIG5ldyB0aWNrcyByZWZlcmVuY2VcbiAgICAvL2NvbnNvbGUubG9nKHN0YXR1cywgZXZlbnQudGlja3MsIHRpY2tzKTtcbiAgICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIGRlbHRhID0gbGFzdEV2ZW50VGlja3MgLSB0aWNrcztcbiAgLy9jb25zb2xlLmxvZygnZCcsIGRlbHRhLCAndCcsIHRpY2tzLCAnbCcsIGxhc3RFdmVudFRpY2tzKTtcbiAgZGVsdGEgPSBjb252ZXJ0VG9WTFEoZGVsdGEpO1xuICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgdGlja3MsIGRlbHRhKTtcbiAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGRlbHRhKTtcbiAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICB0cmFja0J5dGVzLnB1c2goMHgyRik7XG4gIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgLy9jb25zb2xlLmxvZyh0cmFja05hbWUsIHRyYWNrQnl0ZXMpO1xuICB0cmFja0xlbmd0aCA9IHRyYWNrQnl0ZXMubGVuZ3RoO1xuICBsZW5ndGhCeXRlcyA9IHN0cjJCeXRlcyh0cmFja0xlbmd0aC50b1N0cmluZygxNiksIDQpO1xuICByZXR1cm4gW10uY29uY2F0KFRSS19DSFVOS0lELCBsZW5ndGhCeXRlcywgdHJhY2tCeXRlcyk7XG59XG5cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuXG4vKlxuICogQ29udmVydHMgYW4gYXJyYXkgb2YgYnl0ZXMgdG8gYSBzdHJpbmcgb2YgaGV4YWRlY2ltYWwgY2hhcmFjdGVycy4gUHJlcGFyZXNcbiAqIGl0IHRvIGJlIGNvbnZlcnRlZCBpbnRvIGEgYmFzZTY0IHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gYnl0ZUFycmF5IHtBcnJheX0gYXJyYXkgb2YgYnl0ZXMgdGhhdCB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZ1xuICogQHJldHVybnMgaGV4YWRlY2ltYWwgc3RyaW5nXG4gKi9cblxuZnVuY3Rpb24gY29kZXMyU3RyKGJ5dGVBcnJheSkge1xuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBieXRlQXJyYXkpO1xufVxuXG4vKlxuICogQ29udmVydHMgYSBTdHJpbmcgb2YgaGV4YWRlY2ltYWwgdmFsdWVzIHRvIGFuIGFycmF5IG9mIGJ5dGVzLiBJdCBjYW4gYWxzb1xuICogYWRkIHJlbWFpbmluZyAnMCcgbmliYmxlcyBpbiBvcmRlciB0byBoYXZlIGVub3VnaCBieXRlcyBpbiB0aGUgYXJyYXkgYXMgdGhlXG4gKiB8ZmluYWxCeXRlc3wgcGFyYW1ldGVyLlxuICpcbiAqIEBwYXJhbSBzdHIge1N0cmluZ30gc3RyaW5nIG9mIGhleGFkZWNpbWFsIHZhbHVlcyBlLmcuICcwOTdCOEEnXG4gKiBAcGFyYW0gZmluYWxCeXRlcyB7SW50ZWdlcn0gT3B0aW9uYWwuIFRoZSBkZXNpcmVkIG51bWJlciBvZiBieXRlcyB0aGF0IHRoZSByZXR1cm5lZCBhcnJheSBzaG91bGQgY29udGFpblxuICogQHJldHVybnMgYXJyYXkgb2YgbmliYmxlcy5cbiAqL1xuXG5mdW5jdGlvbiBzdHIyQnl0ZXMoc3RyLCBmaW5hbEJ5dGVzKSB7XG4gIGlmIChmaW5hbEJ5dGVzKSB7XG4gICAgd2hpbGUgKChzdHIubGVuZ3RoIC8gMikgPCBmaW5hbEJ5dGVzKSB7XG4gICAgICBzdHIgPSAnMCcgKyBzdHI7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJ5dGVzID0gW107XG4gIGZvciAodmFyIGkgPSBzdHIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDIpIHtcbiAgICB2YXIgY2hhcnMgPSBpID09PSAwID8gc3RyW2ldIDogc3RyW2kgLSAxXSArIHN0cltpXTtcbiAgICBieXRlcy51bnNoaWZ0KHBhcnNlSW50KGNoYXJzLCAxNikpO1xuICB9XG5cbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG5cbi8qKlxuICogVHJhbnNsYXRlcyBudW1iZXIgb2YgdGlja3MgdG8gTUlESSB0aW1lc3RhbXAgZm9ybWF0LCByZXR1cm5pbmcgYW4gYXJyYXkgb2ZcbiAqIGJ5dGVzIHdpdGggdGhlIHRpbWUgdmFsdWVzLiBNaWRpIGhhcyBhIHZlcnkgcGFydGljdWxhciB0aW1lIHRvIGV4cHJlc3MgdGltZSxcbiAqIHRha2UgYSBnb29kIGxvb2sgYXQgdGhlIHNwZWMgYmVmb3JlIGV2ZXIgdG91Y2hpbmcgdGhpcyBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gdGlja3Mge0ludGVnZXJ9IE51bWJlciBvZiB0aWNrcyB0byBiZSB0cmFuc2xhdGVkXG4gKiBAcmV0dXJucyBBcnJheSBvZiBieXRlcyB0aGF0IGZvcm0gdGhlIE1JREkgdGltZSB2YWx1ZVxuICovXG5mdW5jdGlvbiBjb252ZXJ0VG9WTFEodGlja3MpIHtcbiAgdmFyIGJ1ZmZlciA9IHRpY2tzICYgMHg3RjtcblxuICB3aGlsZSh0aWNrcyA9IHRpY2tzID4+IDcpIHtcbiAgICBidWZmZXIgPDw9IDg7XG4gICAgYnVmZmVyIHw9ICgodGlja3MgJiAweDdGKSB8IDB4ODApO1xuICB9XG5cbiAgdmFyIGJMaXN0ID0gW107XG4gIHdoaWxlKHRydWUpIHtcbiAgICBiTGlzdC5wdXNoKGJ1ZmZlciAmIDB4ZmYpO1xuXG4gICAgaWYgKGJ1ZmZlciAmIDB4ODApIHtcbiAgICAgIGJ1ZmZlciA+Pj0gODtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyh0aWNrcywgYkxpc3QpO1xuICByZXR1cm4gYkxpc3Q7XG59XG5cblxuLypcbiAqIENvbnZlcnRzIGEgc3RyaW5nIGludG8gYW4gYXJyYXkgb2YgQVNDSUkgY2hhciBjb2RlcyBmb3IgZXZlcnkgY2hhcmFjdGVyIG9mXG4gKiB0aGUgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBzdHIge1N0cmluZ30gU3RyaW5nIHRvIGJlIGNvbnZlcnRlZFxuICogQHJldHVybnMgYXJyYXkgd2l0aCB0aGUgY2hhcmNvZGUgdmFsdWVzIG9mIHRoZSBzdHJpbmdcbiAqL1xuY29uc3QgQVAgPSBBcnJheS5wcm90b3R5cGVcbmZ1bmN0aW9uIHN0cmluZ1RvTnVtQXJyYXkoc3RyKSB7XG4gIC8vIHJldHVybiBzdHIuc3BsaXQoKS5mb3JFYWNoKGNoYXIgPT4ge1xuICAvLyAgIHJldHVybiBjaGFyLmNoYXJDb2RlQXQoMClcbiAgLy8gfSlcbiAgcmV0dXJuIEFQLm1hcC5jYWxsKHN0ciwgZnVuY3Rpb24oY2hhcikge1xuICAgIHJldHVybiBjaGFyLmNoYXJDb2RlQXQoMClcbiAgfSlcbn1cbiIsImltcG9ydCB7Z2V0TUlESU91dHB1dEJ5SWQsIGdldE1JRElPdXRwdXRzfSBmcm9tICcuL2luaXRfbWlkaSdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJyAvLyBtaWxsaXNcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXJ7XG5cbiAgY29uc3RydWN0b3Ioc29uZyl7XG4gICAgdGhpcy5zb25nID0gc29uZ1xuICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLmJ1ZmZlclRpbWUgPSBzb25nLmJ1ZmZlclRpbWVcbiAgfVxuXG5cbiAgaW5pdChtaWxsaXMpe1xuICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSBtaWxsaXNcbiAgICB0aGlzLnNvbmdTdGFydE1pbGxpcyA9IG1pbGxpc1xuICAgIHRoaXMuZXZlbnRzID0gdGhpcy5zb25nLl9hbGxFdmVudHNcbiAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aFxuICAgIHRoaXMuaW5kZXggPSAwXG4gICAgdGhpcy5tYXh0aW1lID0gMFxuICAgIHRoaXMucHJldk1heHRpbWUgPSAwXG4gICAgdGhpcy5iZXlvbmRMb29wID0gZmFsc2UgLy8gdGVsbHMgdXMgaWYgdGhlIHBsYXloZWFkIGhhcyBhbHJlYWR5IHBhc3NlZCB0aGUgbG9vcGVkIHNlY3Rpb25cbiAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlXG4gICAgdGhpcy5sb29wZWQgPSBmYWxzZVxuICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gIH1cblxuXG4gIHVwZGF0ZVNvbmcoKXtcbiAgICAvL3RoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSB0aGlzLnNvbmcuX2N1cnJlbnRNaWxsaXNcbiAgICB0aGlzLmV2ZW50cyA9IHRoaXMuc29uZy5fYWxsRXZlbnRzXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLmluZGV4ID0gMFxuICAgIHRoaXMubWF4dGltZSA9IDBcbiAgICAvL3RoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZy5fY3VycmVudE1pbGxpcylcbiAgfVxuXG5cbiAgc2V0VGltZVN0YW1wKHRpbWVTdGFtcCl7XG4gICAgdGhpcy50aW1lU3RhbXAgPSB0aW1lU3RhbXAgLy8gdGltZXN0YW1wIFdlYkF1ZGlvIGNvbnRleHQgLT4gZm9yIGludGVybmFsIGluc3RydW1lbnRzXG4gICAgdGhpcy50aW1lU3RhbXAyID0gcGVyZm9ybWFuY2Uubm93KCkgLy8gdGltZXN0YW1wIHNpbmNlIG9wZW5pbmcgd2VicGFnZSAtPiBmb3IgZXh0ZXJuYWwgaW5zdHJ1bWVudHNcbiAgfVxuXG4gIC8vIGdldCB0aGUgaW5kZXggb2YgdGhlIGV2ZW50IHRoYXQgaGFzIGl0cyBtaWxsaXMgdmFsdWUgYXQgb3IgcmlnaHQgYWZ0ZXIgdGhlIHByb3ZpZGVkIG1pbGxpcyB2YWx1ZVxuICBzZXRJbmRleChtaWxsaXMpe1xuICAgIGxldCBpID0gMFxuICAgIGxldCBldmVudFxuICAgIGZvcihldmVudCBvZiB0aGlzLmV2ZW50cyl7XG4gICAgICBpZihldmVudC5taWxsaXMgPj0gbWlsbGlzKXtcbiAgICAgICAgdGhpcy5pbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cblxuICAgIHRoaXMuYmV5b25kTG9vcCA9IG1pbGxpcyA+IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgIC8vIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICAvL3RoaXMubG9vcGVkID0gZmFsc2VcbiAgICB0aGlzLnByZWNvdW50aW5nRG9uZSA9IGZhbHNlXG4gIH1cblxuXG4gIGdldEV2ZW50cygpe1xuICAgIGxldCBldmVudHMgPSBbXVxuXG4gICAgaWYodGhpcy5zb25nLl9sb29wID09PSB0cnVlICYmIHRoaXMuc29uZy5fbG9vcER1cmF0aW9uIDwgdGhpcy5idWZmZXJUaW1lKXtcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ1N0YXJ0TWlsbGlzICsgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gLSAxXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5zb25nLmxvb3BEdXJhdGlvbik7XG4gICAgfVxuXG4gICAgaWYodGhpcy5zb25nLl9sb29wID09PSB0cnVlKXtcblxuICAgICAgaWYodGhpcy5tYXh0aW1lID49IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAmJiB0aGlzLmJleW9uZExvb3AgPT09IGZhbHNlKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnTE9PUCcsIHRoaXMubWF4dGltZSwgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKVxuXG4gICAgICAgIGxldCBkaWZmID0gdGhpcy5tYXh0aW1lIC0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzICsgZGlmZlxuXG4gICAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS1MT09QRUQnLCB0aGlzLm1heHRpbWUsIGRpZmYsIHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzLCB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMpO1xuXG4gICAgICAgIGlmKHRoaXMubG9vcGVkID09PSBmYWxzZSl7XG4gICAgICAgICAgdGhpcy5sb29wZWQgPSB0cnVlO1xuICAgICAgICAgIGxldCBsZWZ0TWlsbGlzID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXNcbiAgICAgICAgICBsZXQgcmlnaHRNaWxsaXMgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXNcblxuICAgICAgICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgICAgICAgIGxldCBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHJpZ2h0TWlsbGlzKXtcbiAgICAgICAgICAgICAgZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgICAgICAgZXZlbnQudGltZTIgPSB0aGlzLnRpbWVTdGFtcDIgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpc1xuICAgICAgICAgICAgICBldmVudHMucHVzaChldmVudClcblxuICAgICAgICAgICAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQudHlwZSlcbiAgICAgICAgICAgICAgdGhpcy5pbmRleCsrXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBzdG9wIG92ZXJmbG93aW5nIG5vdGVzLT4gYWRkIGEgbmV3IG5vdGUgb2ZmIGV2ZW50IGF0IHRoZSBwb3NpdGlvbiBvZiB0aGUgcmlnaHQgbG9jYXRvciAoZW5kIG9mIHRoZSBsb29wKVxuICAgICAgICAgIGxldCBlbmRUaWNrcyA9IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLnRpY2tzIC0gMVxuICAgICAgICAgIGxldCBlbmRNaWxsaXMgPSB0aGlzLnNvbmcuY2FsY3VsYXRlUG9zaXRpb24oe3R5cGU6ICd0aWNrcycsIHRhcmdldDogZW5kVGlja3MsIHJlc3VsdDogJ21pbGxpcyd9KS5taWxsaXNcblxuICAgICAgICAgIGZvcihsZXQgbm90ZSBvZiB0aGlzLm5vdGVzLnZhbHVlcygpKXtcbiAgICAgICAgICAgIGxldCBub3RlT24gPSBub3RlLm5vdGVPblxuICAgICAgICAgICAgbGV0IG5vdGVPZmYgPSBub3RlLm5vdGVPZmZcbiAgICAgICAgICAgIGlmKG5vdGVPZmYubWlsbGlzIDw9IHJpZ2h0TWlsbGlzKXtcbiAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBldmVudCA9IG5ldyBNSURJRXZlbnQoZW5kVGlja3MsIDEyOCwgbm90ZU9uLmRhdGExLCAwKVxuICAgICAgICAgICAgZXZlbnQubWlsbGlzID0gZW5kTWlsbGlzXG4gICAgICAgICAgICBldmVudC5fcGFydCA9IG5vdGVPbi5fcGFydFxuICAgICAgICAgICAgZXZlbnQuX3RyYWNrID0gbm90ZU9uLl90cmFja1xuICAgICAgICAgICAgZXZlbnQubWlkaU5vdGUgPSBub3RlXG4gICAgICAgICAgICBldmVudC5taWRpTm90ZUlkID0gbm90ZS5pZFxuICAgICAgICAgICAgZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgICAgIGV2ZW50LnRpbWUyID0gdGhpcy50aW1lU3RhbXAyICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2FkZGVkJywgZXZlbnQpXG4gICAgICAgICAgICBldmVudHMucHVzaChldmVudClcbiAgICAgICAgICB9XG5cbi8qXG4gICAgICAgICAgLy8gc3RvcCBvdmVyZmxvd2luZyBhdWRpbyBzYW1wbGVzXG4gICAgICAgICAgZm9yKGkgaW4gdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cyl7XG4gICAgICAgICAgICBpZih0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzLmhhc093blByb3BlcnR5KGkpKXtcbiAgICAgICAgICAgICAgYXVkaW9FdmVudCA9IHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbaV07XG4gICAgICAgICAgICAgIGlmKGF1ZGlvRXZlbnQuZW5kTWlsbGlzID4gdGhpcy5zb25nLmxvb3BFbmQpe1xuICAgICAgICAgICAgICAgIGF1ZGlvRXZlbnQuc3RvcFNhbXBsZSh0aGlzLnNvbmcubG9vcEVuZC8xMDAwKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50c1tpXTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wcGluZyBhdWRpbyBldmVudCcsIGkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuKi9cbiAgICAgICAgICB0aGlzLm5vdGVzID0gbmV3IE1hcCgpXG4gICAgICAgICAgdGhpcy5zZXRJbmRleChsZWZ0TWlsbGlzKVxuICAgICAgICAgIHRoaXMudGltZVN0YW1wICs9IHRoaXMuc29uZy5fbG9vcER1cmF0aW9uXG4gICAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyAtPSB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvblxuXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudHMubGVuZ3RoKVxuXG4gICAgICAgICAgLy8gZ2V0IHRoZSBhdWRpbyBldmVudHMgdGhhdCBzdGFydCBiZWZvcmUgc29uZy5sb29wU3RhcnRcbiAgICAgICAgICAvL3RoaXMuZ2V0RGFuZ2xpbmdBdWRpb0V2ZW50cyh0aGlzLnNvbmcubG9vcFN0YXJ0LCBldmVudHMpO1xuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5sb29wZWQgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxlcicsIHRoaXMubG9vcGVkKVxuXG4gICAgLy8gbWFpbiBsb29wXG4gICAgZm9yKGxldCBpID0gdGhpcy5pbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspe1xuICAgICAgbGV0IGV2ZW50ID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pbGxpcywgdGhpcy5tYXh0aW1lKVxuICAgICAgaWYoZXZlbnQubWlsbGlzIDwgdGhpcy5tYXh0aW1lKXtcblxuICAgICAgICAvL2V2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50LnRpbWUgPSAodGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgICAgICAgICBldmVudC50aW1lMiA9ICh0aGlzLnRpbWVTdGFtcDIgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXZlbnRzO1xuICB9XG5cblxuICB1cGRhdGUoZGlmZil7XG4gICAgdmFyIGksXG4gICAgICBldmVudCxcbiAgICAgIG51bUV2ZW50cyxcbiAgICAgIHRyYWNrLFxuICAgICAgZXZlbnRzXG5cbiAgICB0aGlzLnByZXZNYXh0aW1lID0gdGhpcy5tYXh0aW1lXG5cbiAgICBpZih0aGlzLnNvbmcucHJlY291bnRpbmcpe1xuICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyArPSBkaWZmXG4gICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgdGhpcy5idWZmZXJUaW1lXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMpXG4gICAgICBldmVudHMgPSB0aGlzLnNvbmcuX21ldHJvbm9tZS5nZXRQcmVjb3VudEV2ZW50cyh0aGlzLm1heHRpbWUpXG5cbiAgICAgIC8vIGlmKGV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAgIC8vICAgY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDApXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50cylcbiAgICAgIC8vIH1cblxuICAgICAgaWYodGhpcy5tYXh0aW1lID4gdGhpcy5zb25nLl9tZXRyb25vbWUuZW5kTWlsbGlzICYmIHRoaXMucHJlY291bnRpbmdEb25lID09PSBmYWxzZSl7XG4gICAgICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gdHJ1ZVxuICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX3ByZWNvdW50RHVyYXRpb25cblxuICAgICAgICAvLyBzdGFydCBzY2hlZHVsaW5nIGV2ZW50cyBvZiB0aGUgc29uZyAtPiBhZGQgdGhlIGZpcnN0IGV2ZW50cyBvZiB0aGUgc29uZ1xuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzID0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCB0aGlzLnNvbmdDdXJyZW50TWlsbGlzKVxuICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIHRoaXMuYnVmZmVyVGltZVxuICAgICAgICBldmVudHMucHVzaCguLi50aGlzLmdldEV2ZW50cygpKVxuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIHRoaXMuYnVmZmVyVGltZVxuICAgICAgZXZlbnRzID0gdGhpcy5nZXRFdmVudHMoKVxuICAgICAgLy9ldmVudHMgPSB0aGlzLnNvbmcuX2dldEV2ZW50czIodGhpcy5tYXh0aW1lLCAodGhpcy50aW1lU3RhbXAgLSB0aGlzLnNvbmdTdGFydE1pbGxpcykpXG4gICAgICAvL2V2ZW50cyA9IHRoaXMuZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAgIC8vY29uc29sZS5sb2coJ2RvbmUnLCB0aGlzLnNvbmdDdXJyZW50TWlsbGlzLCBkaWZmLCB0aGlzLmluZGV4LCBldmVudHMubGVuZ3RoKVxuICAgIH1cblxuICAgIC8vIGlmKHRoaXMuc29uZy51c2VNZXRyb25vbWUgPT09IHRydWUpe1xuICAgIC8vICAgbGV0IG1ldHJvbm9tZUV2ZW50cyA9IHRoaXMuc29uZy5fbWV0cm9ub21lLmdldEV2ZW50czIodGhpcy5tYXh0aW1lLCAodGhpcy50aW1lU3RhbXAgLSB0aGlzLnNvbmdTdGFydE1pbGxpcykpXG4gICAgLy8gICAvLyBpZihtZXRyb25vbWVFdmVudHMubGVuZ3RoID4gMCl7XG4gICAgLy8gICAvLyAgIGNvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgbWV0cm9ub21lRXZlbnRzKVxuICAgIC8vICAgLy8gfVxuICAgIC8vICAgLy8gbWV0cm9ub21lRXZlbnRzLmZvckVhY2goZSA9PiB7XG4gICAgLy8gICAvLyAgIGUudGltZSA9ICh0aGlzLnRpbWVTdGFtcCArIGUubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gICAgLy8gICAvLyB9KVxuICAgIC8vICAgZXZlbnRzLnB1c2goLi4ubWV0cm9ub21lRXZlbnRzKVxuICAgIC8vIH1cblxuICAgIG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGhcblxuXG4gICAgLy8gaWYobnVtRXZlbnRzID4gNSl7XG4gICAgLy8gICBjb25zb2xlLmxvZyhudW1FdmVudHMpXG4gICAgLy8gfVxuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLm1heHRpbWUsIHRoaXMuc29uZy5fY3VycmVudE1pbGxpcywgJ1tkaWZmXScsIHRoaXMubWF4dGltZSAtIHRoaXMucHJldk1heHRpbWUpXG5cbiAgICBmb3IoaSA9IDA7IGkgPCBudW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IGV2ZW50c1tpXVxuICAgICAgdHJhY2sgPSBldmVudC5fdHJhY2tcbiAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5wcmV2TWF4dGltZSwgZXZlbnQubWlsbGlzKVxuXG4gICAgICAvLyBpZihldmVudC5taWxsaXMgPiB0aGlzLm1heHRpbWUpe1xuICAgICAgLy8gICAvLyBza2lwIGV2ZW50cyB0aGF0IHdlcmUgaGFydmVzdCBhY2NpZGVudGx5IHdoaWxlIGp1bXBpbmcgdGhlIHBsYXloZWFkIC0+IHNob3VsZCBoYXBwZW4gdmVyeSByYXJlbHkgaWYgZXZlclxuICAgICAgLy8gICBjb25zb2xlLmxvZygnc2tpcCcsIGV2ZW50KVxuICAgICAgLy8gICBjb250aW51ZVxuICAgICAgLy8gfVxuXG4gICAgICBpZihldmVudC5fcGFydCA9PT0gbnVsbCB8fCB0cmFjayA9PT0gbnVsbCl7XG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAgICAgICB0aGlzLm5vdGVzLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYoZXZlbnQuX3BhcnQubXV0ZWQgPT09IHRydWUgfHwgdHJhY2subXV0ZWQgPT09IHRydWUgfHwgZXZlbnQubXV0ZWQgPT09IHRydWUpe1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZigoZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkgJiYgdHlwZW9mIGV2ZW50Lm1pZGlOb3RlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vIHRoaXMgaXMgdXN1YWxseSBjYXVzZWQgYnkgdGhlIHNhbWUgbm90ZSBvbiB0aGUgc2FtZSB0aWNrcyB2YWx1ZSwgd2hpY2ggaXMgcHJvYmFibHkgYSBidWcgaW4gdGhlIG1pZGkgZmlsZVxuICAgICAgICAvL2NvbnNvbGUuaW5mbygnbm8gbWlkaU5vdGVJZCcsIGV2ZW50KVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgLy8gL2NvbnNvbGUubG9nKGV2ZW50LnRpY2tzLCBldmVudC50aW1lLCBldmVudC5taWxsaXMsIGV2ZW50LnR5cGUsIGV2ZW50Ll90cmFjay5uYW1lKVxuXG4gICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1lbHNle1xuICAgICAgICB0cmFjay5wcm9jZXNzTUlESUV2ZW50KGV2ZW50KVxuICAgICAgICAvL2NvbnNvbGUubG9nKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwLCBldmVudC50aW1lLCB0aGlzLmluZGV4KVxuICAgICAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgICAgIHRoaXMubm90ZXMuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYodGhpcy5ub3Rlcy5zaXplID4gMCl7XG4gICAgICAgIC8vICAgY29uc29sZS5sb2codGhpcy5ub3RlcylcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuaW5kZXgsIHRoaXMubnVtRXZlbnRzKVxuICAgIC8vcmV0dXJuIHRoaXMuaW5kZXggPj0gMTBcbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLm51bUV2ZW50cyAvLyBsYXN0IGV2ZW50IG9mIHNvbmdcbiAgfVxuXG4vKlxuICB1bnNjaGVkdWxlKCl7XG5cbiAgICBsZXQgbWluID0gdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzXG4gICAgbGV0IG1heCA9IG1pbiArIChidWZmZXJUaW1lICogMTAwMClcblxuICAgIC8vY29uc29sZS5sb2coJ3Jlc2NoZWR1bGUnLCB0aGlzLm5vdGVzLnNpemUpXG4gICAgdGhpcy5ub3Rlcy5mb3JFYWNoKChub3RlLCBpZCkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2cobm90ZSlcbiAgICAgIC8vIGNvbnNvbGUubG9nKG5vdGUubm90ZU9uLm1pbGxpcywgbm90ZS5ub3RlT2ZmLm1pbGxpcywgbWluLCBtYXgpXG5cbiAgICAgIGlmKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJyB8fCBub3RlLnN0YXRlID09PSAncmVtb3ZlZCcpe1xuICAgICAgICAvL3NhbXBsZS51bnNjaGVkdWxlKDAsIHVuc2NoZWR1bGVDYWxsYmFjayk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ05PVEUgSVMgVU5ERUZJTkVEJylcbiAgICAgICAgLy9zYW1wbGUuc3RvcCgwKVxuICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShpZClcbiAgICAgIH1lbHNlIGlmKChub3RlLm5vdGVPbi5taWxsaXMgPj0gbWluIHx8IG5vdGUubm90ZU9mZi5taWxsaXMgPCBtYXgpID09PSBmYWxzZSl7XG4gICAgICAgIC8vc2FtcGxlLnN0b3AoMClcbiAgICAgICAgbGV0IG5vdGVPbiA9IG5vdGUubm90ZU9uXG4gICAgICAgIGxldCBub3RlT2ZmID0gbmV3IE1JRElFdmVudCgwLCAxMjgsIG5vdGVPbi5kYXRhMSwgMClcbiAgICAgICAgbm90ZU9mZi5taWRpTm90ZUlkID0gbm90ZS5pZFxuICAgICAgICBub3RlT2ZmLnRpbWUgPSAwLy9jb250ZXh0LmN1cnJlbnRUaW1lICsgbWluXG4gICAgICAgIG5vdGUuX3RyYWNrLnByb2Nlc3NNSURJRXZlbnQobm90ZU9mZilcbiAgICAgICAgdGhpcy5ub3Rlcy5kZWxldGUoaWQpXG4gICAgICAgIGNvbnNvbGUubG9nKCdTVE9QUElORycsIGlkLCBub3RlLl90cmFjay5uYW1lKVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZygnTk9URVMnLCB0aGlzLm5vdGVzLnNpemUpXG4gICAgLy90aGlzLm5vdGVzLmNsZWFyKClcbiAgfVxuKi9cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIGxldCB0aW1lU3RhbXAgPSBwZXJmb3JtYW5jZS5ub3coKVxuICAgIGxldCBvdXRwdXRzID0gZ2V0TUlESU91dHB1dHMoKVxuICAgIG91dHB1dHMuZm9yRWFjaCgob3V0cHV0KSA9PiB7XG4gICAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWVTdGFtcCArIHRoaXMuYnVmZmVyVGltZSkgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZVN0YW1wICsgdGhpcy5idWZmZXJUaW1lKSAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgICB9KVxuICB9XG59XG5cblxuLypcblxuICBnZXRFdmVudHMyKG1heHRpbWUsIHRpbWVzdGFtcCl7XG4gICAgbGV0IGxvb3AgPSB0cnVlXG4gICAgbGV0IGV2ZW50XG4gICAgbGV0IHJlc3VsdCA9IFtdXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnRpbWVFdmVudHNJbmRleCwgdGhpcy5zb25nRXZlbnRzSW5kZXgsIHRoaXMubWV0cm9ub21lRXZlbnRzSW5kZXgpXG4gICAgd2hpbGUobG9vcCl7XG5cbiAgICAgIGxldCBzdG9wID0gZmFsc2VcblxuICAgICAgaWYodGhpcy50aW1lRXZlbnRzSW5kZXggPCB0aGlzLm51bVRpbWVFdmVudHMpe1xuICAgICAgICBldmVudCA9IHRoaXMudGltZUV2ZW50c1t0aGlzLnRpbWVFdmVudHNJbmRleF1cbiAgICAgICAgaWYoZXZlbnQubWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgdGhpcy5taWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGlja1xuICAgICAgICAgIC8vY29uc29sZS5sb2codGhpcy5taWxsaXNQZXJUaWNrKVxuICAgICAgICAgIHRoaXMudGltZUV2ZW50c0luZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3RvcCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZih0aGlzLnNvbmdFdmVudHNJbmRleCA8IHRoaXMubnVtU29uZ0V2ZW50cyl7XG4gICAgICAgIGV2ZW50ID0gdGhpcy5zb25nRXZlbnRzW3RoaXMuc29uZ0V2ZW50c0luZGV4XVxuICAgICAgICBpZihldmVudC50eXBlID09PSAweDJGKXtcbiAgICAgICAgICBsb29wID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGxldCBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGlja1xuICAgICAgICBpZihtaWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZXN0YW1wXG4gICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgICAgICAgdGhpcy5zb25nRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHRoaXMuc29uZy51c2VNZXRyb25vbWUgPT09IHRydWUgJiYgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleCA8IHRoaXMubnVtTWV0cm9ub21lRXZlbnRzKXtcbiAgICAgICAgZXZlbnQgPSB0aGlzLm1ldHJvbm9tZUV2ZW50c1t0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4XVxuICAgICAgICBsZXQgbWlsbGlzID0gZXZlbnQudGlja3MgKiB0aGlzLm1pbGxpc1BlclRpY2tcbiAgICAgICAgaWYobWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgZXZlbnQudGltZSA9IG1pbGxpcyArIHRpbWVzdGFtcFxuICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IG1pbGxpc1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgICAgICAgIHRoaXMubWV0cm9ub21lRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHN0b3Ape1xuICAgICAgICBsb29wID0gZmFsc2VcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgc29ydEV2ZW50cyhyZXN1bHQpXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cblxuKi9cbiIsIi8vaW1wb3J0IGdtSW5zdHJ1bWVudHMgZnJvbSAnLi9nbV9pbnN0cnVtZW50cydcblxuLy9jb25zdCBwYXJhbXMgPSBbJ3BwcScsICdicG0nLCAnYmFycycsICdwaXRjaCcsICdidWZmZXJUaW1lJywgJ2xvd2VzdE5vdGUnLCAnaGlnaGVzdE5vdGUnLCAnbm90ZU5hbWVNb2RlJywgJ25vbWluYXRvcicsICdkZW5vbWluYXRvcicsICdxdWFudGl6ZVZhbHVlJywgJ2ZpeGVkTGVuZ3RoVmFsdWUnLCAncG9zaXRpb25UeXBlJywgJ3VzZU1ldHJvbm9tZScsICdhdXRvU2l6ZScsICdwbGF5YmFja1NwZWVkJywgJ2F1dG9RdWFudGl6ZScsIF1cblxubGV0IHNldHRpbmdzID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDE2LFxuICBwaXRjaDogNDQwLFxuICBidWZmZXJUaW1lOiAyMDAsXG4gIGxvd2VzdE5vdGU6IDAsXG4gIGhpZ2hlc3ROb3RlOiAxMjcsXG4gIG5vdGVOYW1lTW9kZTogJ3NoYXJwJyxcbiAgbm9taW5hdG9yOiA0LFxuICBkZW5vbWluYXRvcjogNCxcbiAgcXVhbnRpemVWYWx1ZTogOCxcbiAgZml4ZWRMZW5ndGhWYWx1ZTogZmFsc2UsXG4gIHBvc2l0aW9uVHlwZTogJ2FsbCcsXG4gIHVzZU1ldHJvbm9tZTogZmFsc2UsXG4gIGF1dG9TaXplOiB0cnVlLFxuICBwbGF5YmFja1NwZWVkOiAxLFxuICBhdXRvUXVhbnRpemU6IGZhbHNlLFxuICB2b2x1bWU6IDAuNSxcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2V0dGluZ3MoZGF0YSl7XG4gICh7XG4gICAgcHBxOiBzZXR0aW5ncy5wcHEgPSBzZXR0aW5ncy5wcHEsXG4gICAgYnBtOiBzZXR0aW5ncy5icG0gPSBzZXR0aW5ncy5icG0sXG4gICAgYmFyczogc2V0dGluZ3MuYmFycyA9IHNldHRpbmdzLmJhcnMsXG4gICAgcGl0Y2g6IHNldHRpbmdzLnBpdGNoID0gc2V0dGluZ3MucGl0Y2gsXG4gICAgYnVmZmVyVGltZTogc2V0dGluZ3MuYnVmZmVyVGltZSA9IHNldHRpbmdzLmJ1ZmZlclRpbWUsXG4gICAgbG93ZXN0Tm90ZTogc2V0dGluZ3MubG93ZXN0Tm90ZSA9IHNldHRpbmdzLmxvd2VzdE5vdGUsXG4gICAgaGlnaGVzdE5vdGU6IHNldHRpbmdzLmhpZ2hlc3ROb3RlID0gc2V0dGluZ3MuaGlnaGVzdE5vdGUsXG4gICAgbm90ZU5hbWVNb2RlOiBzZXR0aW5ncy5ub3RlTmFtZU1vZGUgPSBzZXR0aW5ncy5ub3RlTmFtZU1vZGUsXG4gICAgbm9taW5hdG9yOiBzZXR0aW5ncy5ub21pbmF0b3IgPSBzZXR0aW5ncy5ub21pbmF0b3IsXG4gICAgZGVub21pbmF0b3I6IHNldHRpbmdzLmRlbm9taW5hdG9yID0gc2V0dGluZ3MuZGVub21pbmF0b3IsXG4gICAgcXVhbnRpemVWYWx1ZTogc2V0dGluZ3MucXVhbnRpemVWYWx1ZSA9IHNldHRpbmdzLnF1YW50aXplVmFsdWUsXG4gICAgZml4ZWRMZW5ndGhWYWx1ZTogc2V0dGluZ3MuZml4ZWRMZW5ndGhWYWx1ZSA9IHNldHRpbmdzLmZpeGVkTGVuZ3RoVmFsdWUsXG4gICAgcG9zaXRpb25UeXBlOiBzZXR0aW5ncy5wb3NpdGlvblR5cGUgPSBzZXR0aW5ncy5wb3NpdGlvblR5cGUsXG4gICAgdXNlTWV0cm9ub21lOiBzZXR0aW5ncy51c2VNZXRyb25vbWUgPSBzZXR0aW5ncy51c2VNZXRyb25vbWUsXG4gICAgYXV0b1NpemU6IHNldHRpbmdzLmF1dG9TaXplID0gc2V0dGluZ3MuYXV0b1NpemUsXG4gICAgcGxheWJhY2tTcGVlZDogc2V0dGluZ3MucGxheWJhY2tTcGVlZCA9IHNldHRpbmdzLnBsYXliYWNrU3BlZWQsXG4gICAgYXV0b1F1YW50aXplOiBzZXR0aW5ncy5hdXRvUXVhbnRpemUgPSBzZXR0aW5ncy5hdXRvUXVhbnRpemUsXG4gICAgdm9sdW1lOiBzZXR0aW5ncy52b2x1bWUgPSBzZXR0aW5ncy52b2x1bWUsXG4gIH0gPSBkYXRhKVxuXG4gIGNvbnNvbGUubG9nKCdzZXR0aW5nczogJU8nLCBzZXR0aW5ncylcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2V0dGluZ3MoLi4ucGFyYW1zKXtcbiAgcmV0dXJuIHsuLi5zZXR0aW5nc31cbi8qXG4gIGxldCByZXN1bHQgPSB7fVxuICBwYXJhbXMuZm9yRWFjaChwYXJhbSA9PiB7XG4gICAgc3dpdGNoKHBhcmFtKXtcbiAgICAgIGNhc2UgJ3BpdGNoJzpcbiAgICAgICAgcmVzdWx0LnBpdGNoID0gcGl0Y2hcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ25vdGVOYW1lTW9kZSc6XG4gICAgICAgIHJlc3VsdC5ub3RlTmFtZU1vZGUgPSBub3RlTmFtZU1vZGVcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2J1ZmZlclRpbWUnOlxuICAgICAgICByZXN1bHQuYnVmZmVyVGltZSA9IGJ1ZmZlclRpbWVcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3BwcSc6XG4gICAgICAgIHJlc3VsdC5wcHEgPSBwcHFcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICB9XG4gIH0pXG4gIHJldHVybiByZXN1bHRcbiovXG59XG5cblxuLy9wb3J0ZWQgaGVhcnRiZWF0IGluc3RydW1lbnRzOiBodHRwOi8vZ2l0aHViLmNvbS9hYnVkYWFuL2hlYXJ0YmVhdFxuY29uc3QgaGVhcnRiZWF0SW5zdHJ1bWVudHMgPSBuZXcgTWFwKFtcbiAgWydjaXR5LXBpYW5vJywge1xuICAgIG5hbWU6ICdDaXR5IFBpYW5vIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyA0IHZlbG9jaXR5IGxheWVyczogMSAtIDQ4LCA0OSAtIDk2LCA5NyAtIDExMCBhbmQgMTEwIC0gMTI3LiBJbiB0b3RhbCBpdCB1c2VzIDQgKiA4OCA9IDM1MiBzYW1wbGVzJyxcbiAgfV0sXG4gIFsnY2l0eS1waWFuby1saWdodCcsIHtcbiAgICBuYW1lOiAnQ2l0eSBQaWFubyBMaWdodCAocGlhbm8pJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NpdHkgUGlhbm8gbGlnaHQgdXNlcyBzYW1wbGVzIGZyb20gYSBCYWxkd2luIHBpYW5vLCBpdCBoYXMgb25seSAxIHZlbG9jaXR5IGxheWVyIGFuZCB1c2VzIDg4IHNhbXBsZXMnLFxuICB9XSxcbiAgWydjay1pY2Vza2F0ZXMnLCB7XG4gICAgbmFtZTogJ0NLIEljZSBTa2F0ZXMgKHN5bnRoKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIERldHVuaXplZCBzYW1wbGVzJyxcbiAgfV0sXG4gIFsnc2hrMi1zcXVhcmVyb290Jywge1xuICAgIG5hbWU6ICdTSEsyIHNxdWFyZXJvb3QgKHN5bnRoKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIERldHVuaXplZCBzYW1wbGVzJyxcbiAgfV0sXG4gIFsncmhvZGVzJywge1xuICAgIG5hbWU6ICdSaG9kZXMgKHBpYW5vKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIEZyZWVzb3VuZCBzYW1wbGVzJyxcbiAgfV0sXG4gIFsncmhvZGVzMicsIHtcbiAgICBuYW1lOiAnUmhvZGVzIDIgKHBpYW5vKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIERldHVuaXplZCBzYW1wbGVzJyxcbiAgfV0sXG4gIFsndHJ1bXBldCcsIHtcbiAgICBuYW1lOiAnVHJ1bXBldCAoYnJhc3MpJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgU1NPIHNhbXBsZXMnLFxuICB9XSxcbiAgWyd2aW9saW4nLCB7XG4gICAgbmFtZTogJ1Zpb2xpbiAoc3RyaW5ncyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBTU08gc2FtcGxlcycsXG4gIH1dXG5dKVxuZXhwb3J0IGNvbnN0IGdldEluc3RydW1lbnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGhlYXJ0YmVhdEluc3RydW1lbnRzXG59XG5cbi8vIGdtIHNvdW5kcyBleHBvcnRlZCBmcm9tIEZsdWlkU3ludGggYnkgQmVuamFtaW4gR2xlaXR6bWFuOiBodHRwczovL2dpdGh1Yi5jb20vZ2xlaXR6L21pZGktanMtc291bmRmb250c1xuY29uc3QgZ21JbnN0cnVtZW50cyA9IHtcImFjb3VzdGljX2dyYW5kX3BpYW5vXCI6e1wibmFtZVwiOlwiMSBBY291c3RpYyBHcmFuZCBQaWFubyAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYnJpZ2h0X2Fjb3VzdGljX3BpYW5vXCI6e1wibmFtZVwiOlwiMiBCcmlnaHQgQWNvdXN0aWMgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX2dyYW5kX3BpYW5vXCI6e1wibmFtZVwiOlwiMyBFbGVjdHJpYyBHcmFuZCBQaWFubyAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiaG9ua3l0b25rX3BpYW5vXCI6e1wibmFtZVwiOlwiNCBIb25reS10b25rIFBpYW5vIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19waWFub18xXCI6e1wibmFtZVwiOlwiNSBFbGVjdHJpYyBQaWFubyAxIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19waWFub18yXCI6e1wibmFtZVwiOlwiNiBFbGVjdHJpYyBQaWFubyAyIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJoYXJwc2ljaG9yZFwiOntcIm5hbWVcIjpcIjcgSGFycHNpY2hvcmQgKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNsYXZpbmV0XCI6e1wibmFtZVwiOlwiOCBDbGF2aW5ldCAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2VsZXN0YVwiOntcIm5hbWVcIjpcIjkgQ2VsZXN0YSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJnbG9ja2Vuc3BpZWxcIjp7XCJuYW1lXCI6XCIxMCBHbG9ja2Vuc3BpZWwgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibXVzaWNfYm94XCI6e1wibmFtZVwiOlwiMTEgTXVzaWMgQm94IChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInZpYnJhcGhvbmVcIjp7XCJuYW1lXCI6XCIxMiBWaWJyYXBob25lIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm1hcmltYmFcIjp7XCJuYW1lXCI6XCIxMyBNYXJpbWJhIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInh5bG9waG9uZVwiOntcIm5hbWVcIjpcIjE0IFh5bG9waG9uZSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0dWJ1bGFyX2JlbGxzXCI6e1wibmFtZVwiOlwiMTUgVHVidWxhciBCZWxscyAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJkdWxjaW1lclwiOntcIm5hbWVcIjpcIjE2IER1bGNpbWVyIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImRyYXdiYXJfb3JnYW5cIjp7XCJuYW1lXCI6XCIxNyBEcmF3YmFyIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwZXJjdXNzaXZlX29yZ2FuXCI6e1wibmFtZVwiOlwiMTggUGVyY3Vzc2l2ZSBPcmdhbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicm9ja19vcmdhblwiOntcIm5hbWVcIjpcIjE5IFJvY2sgT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNodXJjaF9vcmdhblwiOntcIm5hbWVcIjpcIjIwIENodXJjaCBPcmdhbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicmVlZF9vcmdhblwiOntcIm5hbWVcIjpcIjIxIFJlZWQgT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFjY29yZGlvblwiOntcIm5hbWVcIjpcIjIyIEFjY29yZGlvbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiaGFybW9uaWNhXCI6e1wibmFtZVwiOlwiMjMgSGFybW9uaWNhIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0YW5nb19hY2NvcmRpb25cIjp7XCJuYW1lXCI6XCIyNCBUYW5nbyBBY2NvcmRpb24gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFjb3VzdGljX2d1aXRhcl9ueWxvblwiOntcIm5hbWVcIjpcIjI1IEFjb3VzdGljIEd1aXRhciAobnlsb24pIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWNvdXN0aWNfZ3VpdGFyX3N0ZWVsXCI6e1wibmFtZVwiOlwiMjYgQWNvdXN0aWMgR3VpdGFyIChzdGVlbCkgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ndWl0YXJfamF6elwiOntcIm5hbWVcIjpcIjI3IEVsZWN0cmljIEd1aXRhciAoamF6eikgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ndWl0YXJfY2xlYW5cIjp7XCJuYW1lXCI6XCIyOCBFbGVjdHJpYyBHdWl0YXIgKGNsZWFuKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX2d1aXRhcl9tdXRlZFwiOntcIm5hbWVcIjpcIjI5IEVsZWN0cmljIEd1aXRhciAobXV0ZWQpIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib3ZlcmRyaXZlbl9ndWl0YXJcIjp7XCJuYW1lXCI6XCIzMCBPdmVyZHJpdmVuIEd1aXRhciAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImRpc3RvcnRpb25fZ3VpdGFyXCI6e1wibmFtZVwiOlwiMzEgRGlzdG9ydGlvbiBHdWl0YXIgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJndWl0YXJfaGFybW9uaWNzXCI6e1wibmFtZVwiOlwiMzIgR3VpdGFyIEhhcm1vbmljcyAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFjb3VzdGljX2Jhc3NcIjp7XCJuYW1lXCI6XCIzMyBBY291c3RpYyBCYXNzIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX2Jhc3NfZmluZ2VyXCI6e1wibmFtZVwiOlwiMzQgRWxlY3RyaWMgQmFzcyAoZmluZ2VyKSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19iYXNzX3BpY2tcIjp7XCJuYW1lXCI6XCIzNSBFbGVjdHJpYyBCYXNzIChwaWNrKSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmcmV0bGVzc19iYXNzXCI6e1wibmFtZVwiOlwiMzYgRnJldGxlc3MgQmFzcyAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzbGFwX2Jhc3NfMVwiOntcIm5hbWVcIjpcIjM3IFNsYXAgQmFzcyAxIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNsYXBfYmFzc18yXCI6e1wibmFtZVwiOlwiMzggU2xhcCBCYXNzIDIgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfYmFzc18xXCI6e1wibmFtZVwiOlwiMzkgU3ludGggQmFzcyAxIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2Jhc3NfMlwiOntcIm5hbWVcIjpcIjQwIFN5bnRoIEJhc3MgMiAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2aW9saW5cIjp7XCJuYW1lXCI6XCI0MSBWaW9saW4gKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidmlvbGFcIjp7XCJuYW1lXCI6XCI0MiBWaW9sYSAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjZWxsb1wiOntcIm5hbWVcIjpcIjQzIENlbGxvIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNvbnRyYWJhc3NcIjp7XCJuYW1lXCI6XCI0NCBDb250cmFiYXNzIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRyZW1vbG9fc3RyaW5nc1wiOntcIm5hbWVcIjpcIjQ1IFRyZW1vbG8gU3RyaW5ncyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwaXp6aWNhdG9fc3RyaW5nc1wiOntcIm5hbWVcIjpcIjQ2IFBpenppY2F0byBTdHJpbmdzIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9yY2hlc3RyYWxfaGFycFwiOntcIm5hbWVcIjpcIjQ3IE9yY2hlc3RyYWwgSGFycCAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0aW1wYW5pXCI6e1wibmFtZVwiOlwiNDggVGltcGFuaSAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzdHJpbmdfZW5zZW1ibGVfMVwiOntcIm5hbWVcIjpcIjQ5IFN0cmluZyBFbnNlbWJsZSAxIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzdHJpbmdfZW5zZW1ibGVfMlwiOntcIm5hbWVcIjpcIjUwIFN0cmluZyBFbnNlbWJsZSAyIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9zdHJpbmdzXzFcIjp7XCJuYW1lXCI6XCI1MSBTeW50aCBTdHJpbmdzIDEgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX3N0cmluZ3NfMlwiOntcIm5hbWVcIjpcIjUyIFN5bnRoIFN0cmluZ3MgMiAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2hvaXJfYWFoc1wiOntcIm5hbWVcIjpcIjUzIENob2lyIEFhaHMgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInZvaWNlX29vaHNcIjp7XCJuYW1lXCI6XCI1NCBWb2ljZSBPb2hzIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9jaG9pclwiOntcIm5hbWVcIjpcIjU1IFN5bnRoIENob2lyIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJvcmNoZXN0cmFfaGl0XCI6e1wibmFtZVwiOlwiNTYgT3JjaGVzdHJhIEhpdCAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidHJ1bXBldFwiOntcIm5hbWVcIjpcIjU3IFRydW1wZXQgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRyb21ib25lXCI6e1wibmFtZVwiOlwiNTggVHJvbWJvbmUgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInR1YmFcIjp7XCJuYW1lXCI6XCI1OSBUdWJhIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJtdXRlZF90cnVtcGV0XCI6e1wibmFtZVwiOlwiNjAgTXV0ZWQgVHJ1bXBldCAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnJlbmNoX2hvcm5cIjp7XCJuYW1lXCI6XCI2MSBGcmVuY2ggSG9ybiAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYnJhc3Nfc2VjdGlvblwiOntcIm5hbWVcIjpcIjYyIEJyYXNzIFNlY3Rpb24gKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2JyYXNzXzFcIjp7XCJuYW1lXCI6XCI2MyBTeW50aCBCcmFzcyAxIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9icmFzc18yXCI6e1wibmFtZVwiOlwiNjQgU3ludGggQnJhc3MgMiAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic29wcmFub19zYXhcIjp7XCJuYW1lXCI6XCI2NSBTb3ByYW5vIFNheCAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhbHRvX3NheFwiOntcIm5hbWVcIjpcIjY2IEFsdG8gU2F4IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRlbm9yX3NheFwiOntcIm5hbWVcIjpcIjY3IFRlbm9yIFNheCAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiYXJpdG9uZV9zYXhcIjp7XCJuYW1lXCI6XCI2OCBCYXJpdG9uZSBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib2JvZVwiOntcIm5hbWVcIjpcIjY5IE9ib2UgKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZW5nbGlzaF9ob3JuXCI6e1wibmFtZVwiOlwiNzAgRW5nbGlzaCBIb3JuIChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJhc3Nvb25cIjp7XCJuYW1lXCI6XCI3MSBCYXNzb29uIChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNsYXJpbmV0XCI6e1wibmFtZVwiOlwiNzIgQ2xhcmluZXQgKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGljY29sb1wiOntcIm5hbWVcIjpcIjczIFBpY2NvbG8gKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZmx1dGVcIjp7XCJuYW1lXCI6XCI3NCBGbHV0ZSAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJyZWNvcmRlclwiOntcIm5hbWVcIjpcIjc1IFJlY29yZGVyIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhbl9mbHV0ZVwiOntcIm5hbWVcIjpcIjc2IFBhbiBGbHV0ZSAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJibG93bl9ib3R0bGVcIjp7XCJuYW1lXCI6XCI3NyBCbG93biBCb3R0bGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2hha3VoYWNoaVwiOntcIm5hbWVcIjpcIjc4IFNoYWt1aGFjaGkgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwid2hpc3RsZVwiOntcIm5hbWVcIjpcIjc5IFdoaXN0bGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib2NhcmluYVwiOntcIm5hbWVcIjpcIjgwIE9jYXJpbmEgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF8xX3NxdWFyZVwiOntcIm5hbWVcIjpcIjgxIExlYWQgMSAoc3F1YXJlKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfMl9zYXd0b290aFwiOntcIm5hbWVcIjpcIjgyIExlYWQgMiAoc2F3dG9vdGgpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF8zX2NhbGxpb3BlXCI6e1wibmFtZVwiOlwiODMgTGVhZCAzIChjYWxsaW9wZSkgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzRfY2hpZmZcIjp7XCJuYW1lXCI6XCI4NCBMZWFkIDQgKGNoaWZmKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfNV9jaGFyYW5nXCI6e1wibmFtZVwiOlwiODUgTGVhZCA1IChjaGFyYW5nKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfNl92b2ljZVwiOntcIm5hbWVcIjpcIjg2IExlYWQgNiAodm9pY2UpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF83X2ZpZnRoc1wiOntcIm5hbWVcIjpcIjg3IExlYWQgNyAoZmlmdGhzKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfOF9iYXNzX19sZWFkXCI6e1wibmFtZVwiOlwiODggTGVhZCA4IChiYXNzICsgbGVhZCkgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfMV9uZXdfYWdlXCI6e1wibmFtZVwiOlwiODkgUGFkIDEgKG5ldyBhZ2UpIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfMl93YXJtXCI6e1wibmFtZVwiOlwiOTAgUGFkIDIgKHdhcm0pIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfM19wb2x5c3ludGhcIjp7XCJuYW1lXCI6XCI5MSBQYWQgMyAocG9seXN5bnRoKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzRfY2hvaXJcIjp7XCJuYW1lXCI6XCI5MiBQYWQgNCAoY2hvaXIpIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfNV9ib3dlZFwiOntcIm5hbWVcIjpcIjkzIFBhZCA1IChib3dlZCkgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF82X21ldGFsbGljXCI6e1wibmFtZVwiOlwiOTQgUGFkIDYgKG1ldGFsbGljKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzdfaGFsb1wiOntcIm5hbWVcIjpcIjk1IFBhZCA3IChoYWxvKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzhfc3dlZXBcIjp7XCJuYW1lXCI6XCI5NiBQYWQgOCAoc3dlZXApIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF8xX3JhaW5cIjp7XCJuYW1lXCI6XCI5NyBGWCAxIChyYWluKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzJfc291bmR0cmFja1wiOntcIm5hbWVcIjpcIjk4IEZYIDIgKHNvdW5kdHJhY2spIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfM19jcnlzdGFsXCI6e1wibmFtZVwiOlwiOTkgRlggMyAoY3J5c3RhbCkgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF80X2F0bW9zcGhlcmVcIjp7XCJuYW1lXCI6XCIxMDAgRlggNCAoYXRtb3NwaGVyZSkgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF81X2JyaWdodG5lc3NcIjp7XCJuYW1lXCI6XCIxMDEgRlggNSAoYnJpZ2h0bmVzcykgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF82X2dvYmxpbnNcIjp7XCJuYW1lXCI6XCIxMDIgRlggNiAoZ29ibGlucykgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF83X2VjaG9lc1wiOntcIm5hbWVcIjpcIjEwMyBGWCA3IChlY2hvZXMpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfOF9zY2lmaVwiOntcIm5hbWVcIjpcIjEwNCBGWCA4IChzY2ktZmkpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2l0YXJcIjp7XCJuYW1lXCI6XCIxMDUgU2l0YXIgKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiYW5qb1wiOntcIm5hbWVcIjpcIjEwNiBCYW5qbyAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNoYW1pc2VuXCI6e1wibmFtZVwiOlwiMTA3IFNoYW1pc2VuIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwia290b1wiOntcIm5hbWVcIjpcIjEwOCBLb3RvIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwia2FsaW1iYVwiOntcIm5hbWVcIjpcIjEwOSBLYWxpbWJhIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFncGlwZVwiOntcIm5hbWVcIjpcIjExMCBCYWdwaXBlIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZmlkZGxlXCI6e1wibmFtZVwiOlwiMTExIEZpZGRsZSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNoYW5haVwiOntcIm5hbWVcIjpcIjExMiBTaGFuYWkgKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0aW5rbGVfYmVsbFwiOntcIm5hbWVcIjpcIjExMyBUaW5rbGUgQmVsbCAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhZ29nb1wiOntcIm5hbWVcIjpcIjExNCBBZ29nbyAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzdGVlbF9kcnVtc1wiOntcIm5hbWVcIjpcIjExNSBTdGVlbCBEcnVtcyAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ3b29kYmxvY2tcIjp7XCJuYW1lXCI6XCIxMTYgV29vZGJsb2NrIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRhaWtvX2RydW1cIjp7XCJuYW1lXCI6XCIxMTcgVGFpa28gRHJ1bSAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJtZWxvZGljX3RvbVwiOntcIm5hbWVcIjpcIjExOCBNZWxvZGljIFRvbSAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9kcnVtXCI6e1wibmFtZVwiOlwiMTE5IFN5bnRoIERydW0gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicmV2ZXJzZV9jeW1iYWxcIjp7XCJuYW1lXCI6XCIxMjAgUmV2ZXJzZSBDeW1iYWwgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJndWl0YXJfZnJldF9ub2lzZVwiOntcIm5hbWVcIjpcIjEyMSBHdWl0YXIgRnJldCBOb2lzZSAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJyZWF0aF9ub2lzZVwiOntcIm5hbWVcIjpcIjEyMiBCcmVhdGggTm9pc2UgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzZWFzaG9yZVwiOntcIm5hbWVcIjpcIjEyMyBTZWFzaG9yZSAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJpcmRfdHdlZXRcIjp7XCJuYW1lXCI6XCIxMjQgQmlyZCBUd2VldCAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRlbGVwaG9uZV9yaW5nXCI6e1wibmFtZVwiOlwiMTI1IFRlbGVwaG9uZSBSaW5nIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiaGVsaWNvcHRlclwiOntcIm5hbWVcIjpcIjEyNiBIZWxpY29wdGVyIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYXBwbGF1c2VcIjp7XCJuYW1lXCI6XCIxMjcgQXBwbGF1c2UgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJndW5zaG90XCI6e1wibmFtZVwiOlwiMTI4IEd1bnNob3QgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn19XG5sZXQgZ21NYXAgPSBuZXcgTWFwKClcbk9iamVjdC5rZXlzKGdtSW5zdHJ1bWVudHMpLmZvckVhY2goa2V5ID0+IHtcbiAgZ21NYXAuc2V0KGtleSwgZ21JbnN0cnVtZW50c1trZXldKVxufSlcbmV4cG9ydCBjb25zdCBnZXRHTUluc3RydW1lbnRzID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGdtTWFwXG59XG5cbiIsImltcG9ydCB7SW5zdHJ1bWVudH0gZnJvbSAnLi9pbnN0cnVtZW50J1xuaW1wb3J0IHtTYW1wbGVPc2NpbGxhdG9yfSBmcm9tICcuL3NhbXBsZV9vc2NpbGxhdG9yJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFNpbXBsZVN5bnRoIGV4dGVuZHMgSW5zdHJ1bWVudHtcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIG5hbWU6IHN0cmluZyl7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5zYW1wbGVEYXRhID0ge1xuICAgICAgdHlwZSxcbiAgICAgIHJlbGVhc2VEdXJhdGlvbjogMC4yLFxuICAgICAgcmVsZWFzZUVudmVsb3BlOiAnZXF1YWwgcG93ZXInXG4gICAgfVxuICB9XG5cbiAgY3JlYXRlU2FtcGxlKGV2ZW50KXtcbiAgICByZXR1cm4gbmV3IFNhbXBsZU9zY2lsbGF0b3IodGhpcy5zYW1wbGVEYXRhLCBldmVudClcbiAgfVxuXG4gIC8vIHN0ZXJlbyBzcHJlYWRcbiAgc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKXtcbiAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICB9XG5cbiAgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcbiAgfVxuXG4gIC8qXG4gICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAqL1xuICBzZXRSZWxlYXNlKGR1cmF0aW9uOiBudW1iZXIsIGVudmVsb3BlKXtcbiAgICB0aGlzLnNhbXBsZURhdGEucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb25cbiAgICB0aGlzLnNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlID0gZW52ZWxvcGVcbiAgfVxufVxuIiwiLy9AIGZsb3dcblxuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQge3BhcnNlRXZlbnRzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbmltcG9ydCB7Y29udGV4dCwgbWFzdGVyR2FpbiwgdW5sb2NrV2ViQXVkaW99IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi9zY2hlZHVsZXInXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtzb25nRnJvbU1JRElGaWxlLCBzb25nRnJvbU1JRElGaWxlU3luY30gZnJvbSAnLi9zb25nX2Zyb21fbWlkaWZpbGUnXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y2FsY3VsYXRlUG9zaXRpb259IGZyb20gJy4vcG9zaXRpb24nXG5pbXBvcnQge1BsYXloZWFkfSBmcm9tICcuL3BsYXloZWFkJ1xuaW1wb3J0IHtNZXRyb25vbWV9IGZyb20gJy4vbWV0cm9ub21lJ1xuaW1wb3J0IHthZGRFdmVudExpc3RlbmVyLCByZW1vdmVFdmVudExpc3RlbmVyLCBkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5pbXBvcnQge3NhdmVBc01JRElGaWxlfSBmcm9tICcuL3NhdmVfbWlkaWZpbGUnXG5pbXBvcnQge3VwZGF0ZSwgX3VwZGF0ZX0gZnJvbSAnLi9zb25nLnVwZGF0ZSdcbmltcG9ydCB7Z2V0U2V0dGluZ3N9IGZyb20gJy4vc2V0dGluZ3MnXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxubGV0IHJlY29yZGluZ0luZGV4ID0gMFxuXG5cbi8qXG50eXBlIHNvbmdTZXR0aW5ncyA9IHtcbiAgbmFtZTogc3RyaW5nLFxuICBwcHE6IG51bWJlcixcbiAgYnBtOiBudW1iZXIsXG4gIGJhcnM6IG51bWJlcixcbiAgbG93ZXN0Tm90ZTogbnVtYmVyLFxuICBoaWdoZXN0Tm90ZTogbnVtYmVyLFxuICBub21pbmF0b3I6IG51bWJlcixcbiAgZGVub21pbmF0b3I6IG51bWJlcixcbiAgcXVhbnRpemVWYWx1ZTogbnVtYmVyLFxuICBmaXhlZExlbmd0aFZhbHVlOiBudW1iZXIsXG4gIHBvc2l0aW9uVHlwZTogc3RyaW5nLFxuICB1c2VNZXRyb25vbWU6IGJvb2xlYW4sXG4gIGF1dG9TaXplOiBib29sZWFuLFxuICBsb29wOiBib29sZWFuLFxuICBwbGF5YmFja1NwZWVkOiBudW1iZXIsXG4gIGF1dG9RdWFudGl6ZTogYm9vbGVhbixcbiAgcGl0Y2g6IG51bWJlcixcbiAgYnVmZmVyVGltZTogbnVtYmVyLFxuICBub3RlTmFtZU1vZGU6IHN0cmluZ1xufVxuKi9cblxuLypcbiAgLy8gaW5pdGlhbGl6ZSBzb25nIHdpdGggdHJhY2tzIGFuZCBwYXJ0IHNvIHlvdSBkbyBub3QgaGF2ZSB0byBjcmVhdGUgdGhlbSBzZXBhcmF0ZWx5XG4gIHNldHVwOiB7XG4gICAgdGltZUV2ZW50czogW11cbiAgICB0cmFja3M6IFtcbiAgICAgIHBhcnRzIFtdXG4gICAgXVxuICB9XG4qL1xuXG5leHBvcnQgY2xhc3MgU29uZ3tcblxuICBzdGF0aWMgZnJvbU1JRElGaWxlKGRhdGEpe1xuICAgIHJldHVybiBzb25nRnJvbU1JRElGaWxlKGRhdGEpXG4gIH1cblxuICBzdGF0aWMgZnJvbU1JRElGaWxlU3luYyhkYXRhKXtcbiAgICByZXR1cm4gc29uZ0Zyb21NSURJRmlsZVN5bmMoZGF0YSlcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzOiB7fSA9IHt9KXtcblxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICBsZXQgZGVmYXVsdFNldHRpbmdzID0gZ2V0U2V0dGluZ3MoKTtcblxuICAgICh7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUgPSB0aGlzLmlkLFxuICAgICAgcHBxOiB0aGlzLnBwcSA9IGRlZmF1bHRTZXR0aW5ncy5wcHEsXG4gICAgICBicG06IHRoaXMuYnBtID0gZGVmYXVsdFNldHRpbmdzLmJwbSxcbiAgICAgIGJhcnM6IHRoaXMuYmFycyA9IGRlZmF1bHRTZXR0aW5ncy5iYXJzLFxuICAgICAgbm9taW5hdG9yOiB0aGlzLm5vbWluYXRvciA9IGRlZmF1bHRTZXR0aW5ncy5ub21pbmF0b3IsXG4gICAgICBkZW5vbWluYXRvcjogdGhpcy5kZW5vbWluYXRvciA9IGRlZmF1bHRTZXR0aW5ncy5kZW5vbWluYXRvcixcbiAgICAgIHF1YW50aXplVmFsdWU6IHRoaXMucXVhbnRpemVWYWx1ZSA9IGRlZmF1bHRTZXR0aW5ncy5xdWFudGl6ZVZhbHVlLFxuICAgICAgZml4ZWRMZW5ndGhWYWx1ZTogdGhpcy5maXhlZExlbmd0aFZhbHVlID0gZGVmYXVsdFNldHRpbmdzLmZpeGVkTGVuZ3RoVmFsdWUsXG4gICAgICB1c2VNZXRyb25vbWU6IHRoaXMudXNlTWV0cm9ub21lID0gZGVmYXVsdFNldHRpbmdzLnVzZU1ldHJvbm9tZSxcbiAgICAgIGF1dG9TaXplOiB0aGlzLmF1dG9TaXplID0gZGVmYXVsdFNldHRpbmdzLmF1dG9TaXplLFxuICAgICAgcGxheWJhY2tTcGVlZDogdGhpcy5wbGF5YmFja1NwZWVkID0gZGVmYXVsdFNldHRpbmdzLnBsYXliYWNrU3BlZWQsXG4gICAgICBhdXRvUXVhbnRpemU6IHRoaXMuYXV0b1F1YW50aXplID0gZGVmYXVsdFNldHRpbmdzLmF1dG9RdWFudGl6ZSxcbiAgICAgIHBpdGNoOiB0aGlzLnBpdGNoID0gZGVmYXVsdFNldHRpbmdzLnBpdGNoLFxuICAgICAgYnVmZmVyVGltZTogdGhpcy5idWZmZXJUaW1lID0gZGVmYXVsdFNldHRpbmdzLmJ1ZmZlclRpbWUsXG4gICAgICBub3RlTmFtZU1vZGU6IHRoaXMubm90ZU5hbWVNb2RlID0gZGVmYXVsdFNldHRpbmdzLm5vdGVOYW1lTW9kZSxcbiAgICAgIHZvbHVtZTogdGhpcy52b2x1bWUgPSBkZWZhdWx0U2V0dGluZ3Mudm9sdW1lLFxuICAgIH0gPSBzZXR0aW5ncyk7XG5cbiAgICB0aGlzLl90aW1lRXZlbnRzID0gW11cbiAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICAgIHRoaXMuX2xhc3RFdmVudCA9IG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuRU5EX09GX1RSQUNLKVxuXG4gICAgdGhpcy5fdHJhY2tzID0gW11cbiAgICB0aGlzLl90cmFja3NCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9wYXJ0cyA9IFtdXG4gICAgdGhpcy5fcGFydHNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX2FsbEV2ZW50cyA9IFtdIC8vIE1JREkgZXZlbnRzIGFuZCBtZXRyb25vbWUgZXZlbnRzXG5cbiAgICB0aGlzLl9ub3RlcyA9IFtdXG4gICAgdGhpcy5fbm90ZXNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9uZXdFdmVudHMgPSBbXVxuICAgIHRoaXMuX21vdmVkRXZlbnRzID0gW11cbiAgICB0aGlzLl9yZW1vdmVkRXZlbnRzID0gW11cbiAgICB0aGlzLl90cmFuc3Bvc2VkRXZlbnRzID0gW11cblxuICAgIHRoaXMuX25ld1BhcnRzID0gW11cbiAgICB0aGlzLl9jaGFuZ2VkUGFydHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdXG5cbiAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gMFxuICAgIHRoaXMuX3NjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIodGhpcylcbiAgICB0aGlzLl9wbGF5aGVhZCA9IG5ldyBQbGF5aGVhZCh0aGlzKVxuXG4gICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZVxuICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZVxuICAgIHRoaXMuc3RvcHBlZCA9IHRydWVcbiAgICB0aGlzLmxvb3BpbmcgPSBmYWxzZVxuXG4gICAgdGhpcy5fb3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLl9vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3QobWFzdGVyR2FpbilcblxuICAgIHRoaXMuX21ldHJvbm9tZSA9IG5ldyBNZXRyb25vbWUodGhpcylcbiAgICB0aGlzLl9tZXRyb25vbWVFdmVudHMgPSBbXVxuICAgIHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyA9IHRydWVcbiAgICB0aGlzLl9tZXRyb25vbWUubXV0ZSghdGhpcy51c2VNZXRyb25vbWUpXG5cbiAgICB0aGlzLl9sb29wID0gZmFsc2VcbiAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgIHRoaXMuX2lsbGVnYWxMb29wID0gZmFsc2VcbiAgICB0aGlzLl9sb29wRHVyYXRpb24gPSAwXG4gICAgdGhpcy5fcHJlY291bnRCYXJzID0gMFxuICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gMFxuXG4gICAgbGV0IHt0cmFja3MsIHRpbWVFdmVudHN9ID0gc2V0dGluZ3NcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrcywgdGltZUV2ZW50cylcbiAgICBpZih0eXBlb2YgdGltZUV2ZW50cyA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy5fdGltZUV2ZW50cyA9IFtcbiAgICAgICAgbmV3IE1JRElFdmVudCgwLCBNSURJRXZlbnRUeXBlcy5URU1QTywgdGhpcy5icG0pLFxuICAgICAgICBuZXcgTUlESUV2ZW50KDAsIE1JRElFdmVudFR5cGVzLlRJTUVfU0lHTkFUVVJFLCB0aGlzLm5vbWluYXRvciwgdGhpcy5kZW5vbWluYXRvciksXG4gICAgICBdXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmFkZFRpbWVFdmVudHMoLi4udGltZUV2ZW50cylcbiAgICB9XG5cbiAgICBpZih0eXBlb2YgdHJhY2tzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLmFkZFRyYWNrcyguLi50cmFja3MpXG4gICAgfVxuXG5cbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cblxuICBhZGRUaW1lRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgLy9AVE9ETzogZmlsdGVyIHRpbWUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2sgLT4gdXNlIHRoZSBsYXN0bHkgYWRkZWQgZXZlbnRzXG4gICAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUpe1xuICAgICAgICB0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlXG4gICAgICB9XG4gICAgICB0aGlzLl90aW1lRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgfSlcbiAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICB9XG5cbiAgYWRkVHJhY2tzKC4uLnRyYWNrcyl7XG4gICAgdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICB0cmFjay5fc29uZyA9IHRoaXNcbiAgICAgIHRyYWNrLmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgICAgdGhpcy5fdHJhY2tzLnB1c2godHJhY2spXG4gICAgICB0aGlzLl90cmFja3NCeUlkLnNldCh0cmFjay5pZCwgdHJhY2spXG4gICAgICB0aGlzLl9uZXdFdmVudHMucHVzaCguLi50cmFjay5fZXZlbnRzKVxuICAgICAgdGhpcy5fbmV3UGFydHMucHVzaCguLi50cmFjay5fcGFydHMpXG4gICAgfSlcbiAgfVxuXG4gIHVwZGF0ZSgpe1xuICAgIHVwZGF0ZS5jYWxsKHRoaXMpXG4gIH1cblxuICBwbGF5KHR5cGUsIC4uLmFyZ3MpOiB2b2lke1xuICAgIC8vdW5sb2NrV2ViQXVkaW8oKVxuICAgIHRoaXMuX3BsYXkodHlwZSwgLi4uYXJncylcbiAgICBpZih0aGlzLl9wcmVjb3VudEJhcnMgPiAwKXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwcmVjb3VudGluZycsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgIH1lbHNlIGlmKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID09PSB0cnVlKXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdGFydF9yZWNvcmRpbmcnLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzfSlcbiAgICB9ZWxzZXtcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgfVxuICB9XG5cbiAgX3BsYXkodHlwZSwgLi4uYXJncyl7XG4gICAgaWYodHlwZW9mIHR5cGUgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24odHlwZSwgLi4uYXJncylcbiAgICB9XG4gICAgaWYodGhpcy5wbGF5aW5nKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vY29uc29sZS5sb2codGhpcy5fY3VycmVudE1pbGxpcylcblxuICAgIHRoaXMuX3JlZmVyZW5jZSA9IHRoaXMuX3RpbWVTdGFtcCA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgdGhpcy5fc2NoZWR1bGVyLnNldFRpbWVTdGFtcCh0aGlzLl9yZWZlcmVuY2UpXG4gICAgdGhpcy5fc3RhcnRNaWxsaXMgPSB0aGlzLl9jdXJyZW50TWlsbGlzXG5cbiAgICBpZih0aGlzLl9wcmVjb3VudEJhcnMgPiAwICYmIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nKXtcblxuICAgICAgLy8gY3JlYXRlIHByZWNvdW50IGV2ZW50cywgdGhlIHBsYXloZWFkIHdpbGwgYmUgbW92ZWQgdG8gdGhlIGZpcnN0IGJlYXQgb2YgdGhlIGN1cnJlbnQgYmFyXG4gICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uKClcbiAgICAgIHRoaXMuX21ldHJvbm9tZS5jcmVhdGVQcmVjb3VudEV2ZW50cyhwb3NpdGlvbi5iYXIsIHBvc2l0aW9uLmJhciArIHRoaXMuX3ByZWNvdW50QmFycywgdGhpcy5fcmVmZXJlbmNlKVxuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKCdiYXJzYmVhdHMnLCBbcG9zaXRpb24uYmFyXSwgJ21pbGxpcycpLm1pbGxpc1xuICAgICAgdGhpcy5fcHJlY291bnREdXJhdGlvbiA9IHRoaXMuX21ldHJvbm9tZS5wcmVjb3VudER1cmF0aW9uXG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgKyB0aGlzLl9wcmVjb3VudER1cmF0aW9uXG5cbiAgICAgIC8vIGNvbnNvbGUuZ3JvdXAoJ3ByZWNvdW50JylcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdwb3NpdGlvbicsIHRoaXMuZ2V0UG9zaXRpb24oKSlcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdfY3VycmVudE1pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgICAvLyBjb25zb2xlLmxvZygnZW5kUHJlY291bnRNaWxsaXMnLCB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcylcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdfcHJlY291bnREdXJhdGlvbicsIHRoaXMuX3ByZWNvdW50RHVyYXRpb24pXG4gICAgICAvLyBjb25zb2xlLmdyb3VwRW5kKCdwcmVjb3VudCcpXG4gICAgICAvL2NvbnNvbGUubG9nKCdwcmVjb3VudER1cmF0aW9uJywgdGhpcy5fbWV0cm9ub21lLmNyZWF0ZVByZWNvdW50RXZlbnRzKHRoaXMuX3ByZWNvdW50QmFycywgdGhpcy5fcmVmZXJlbmNlKSlcbiAgICAgIHRoaXMucHJlY291bnRpbmcgPSB0cnVlXG4gICAgfWVsc2Uge1xuICAgICAgdGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPSAwXG4gICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlXG4gICAgICB0aGlzLnJlY29yZGluZyA9IHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nXG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fZW5kUHJlY291bnRNaWxsaXMpXG5cbiAgICBpZih0aGlzLnBhdXNlZCl7XG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgIHRoaXMuX3NjaGVkdWxlci5pbml0KHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgdGhpcy5fbG9vcCA9IHRoaXMubG9vcGluZyAmJiB0aGlzLl9jdXJyZW50TWlsbGlzIDw9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXNcbiAgICB0aGlzLl9wdWxzZSgpXG4gIH1cblxuICBfcHVsc2UoKTogdm9pZHtcbiAgICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlICYmIHRoaXMucHJlY291bnRpbmcgPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmKHRoaXMuX3BlcmZvcm1VcGRhdGUgPT09IHRydWUpe1xuICAgICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSA9IGZhbHNlXG4gICAgICAvL2NvbnNvbGUubG9nKCdwdWxzZSB1cGRhdGUnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgICAgX3VwZGF0ZS5jYWxsKHRoaXMpXG4gICAgfVxuXG4gICAgbGV0IG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgLy9jb25zb2xlLmxvZyhub3csIHBlcmZvcm1hbmNlLm5vdygpKVxuICAgIGxldCBkaWZmID0gbm93IC0gdGhpcy5fcmVmZXJlbmNlXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyArPSBkaWZmXG4gICAgdGhpcy5fcmVmZXJlbmNlID0gbm93XG5cbiAgICBpZih0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA+IDApe1xuICAgICAgaWYodGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPiB0aGlzLl9jdXJyZW50TWlsbGlzKXtcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZShkaWZmKVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcHVsc2UuYmluZCh0aGlzKSlcbiAgICAgICAgLy9yZXR1cm4gYmVjYXVzZSBkdXJpbmcgcHJlY291bnRpbmcgb25seSBwcmVjb3VudCBtZXRyb25vbWUgZXZlbnRzIGdldCBzY2hlZHVsZWRcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gMFxuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyAtPSB0aGlzLl9wcmVjb3VudER1cmF0aW9uXG4gICAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyl7XG4gICAgICAgIHRoaXMucGxheWluZyA9IHRydWVcbiAgICAgICAgdGhpcy5yZWNvcmRpbmcgPSB0cnVlXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZVxuICAgICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX3N0YXJ0TWlsbGlzfSlcbiAgICAgICAgLy9kaXNwYXRjaEV2ZW50KHt0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKHRoaXMuX2xvb3AgJiYgdGhpcy5fY3VycmVudE1pbGxpcyA+PSB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzKXtcbiAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgLT0gdGhpcy5fbG9vcER1cmF0aW9uXG4gICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgICAvL3RoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzKSAvLyBwbGF5aGVhZCBpcyBhIGJpdCBhaGVhZCBvbmx5IGR1cmluZyB0aGlzIGZyYW1lXG4gICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgdHlwZTogJ2xvb3AnLFxuICAgICAgICBkYXRhOiBudWxsXG4gICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5fcGxheWhlYWQudXBkYXRlKCdtaWxsaXMnLCBkaWZmKVxuICAgIH1cblxuICAgIHRoaXMuX3RpY2tzID0gdGhpcy5fcGxheWhlYWQuZ2V0KCkudGlja3NcblxuICAgIC8vY29uc29sZS5sb2codGhpcy5fY3VycmVudE1pbGxpcywgdGhpcy5fZHVyYXRpb25NaWxsaXMpXG5cbiAgICBpZih0aGlzLl9jdXJyZW50TWlsbGlzID49IHRoaXMuX2R1cmF0aW9uTWlsbGlzKXtcbiAgICAgIGlmKHRoaXMucmVjb3JkaW5nICE9PSB0cnVlIHx8IHRoaXMuYXV0b1NpemUgIT09IHRydWUpe1xuICAgICAgICB0aGlzLnN0b3AoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIGFkZCBhbiBleHRyYSBiYXIgdG8gdGhlIHNpemUgb2YgdGhpcyBzb25nXG4gICAgICBsZXQgZXZlbnRzID0gdGhpcy5fbWV0cm9ub21lLmFkZEV2ZW50cyh0aGlzLmJhcnMsIHRoaXMuYmFycyArIDEpXG4gICAgICBsZXQgdG9iZVBhcnNlZCA9IFsuLi5ldmVudHMsIC4uLnRoaXMuX3RpbWVFdmVudHNdXG4gICAgICBzb3J0RXZlbnRzKHRvYmVQYXJzZWQpXG4gICAgICBwYXJzZUV2ZW50cyh0b2JlUGFyc2VkKVxuICAgICAgdGhpcy5fc2NoZWR1bGVyLmV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NjaGVkdWxlci5udW1FdmVudHMgKz0gZXZlbnRzLmxlbmd0aFxuICAgICAgbGV0IGxhc3RFdmVudCA9IGV2ZW50c1tldmVudHMubGVuZ3RoIC0gMV1cbiAgICAgIGxldCBleHRyYU1pbGxpcyA9IGxhc3RFdmVudC50aWNrc1BlckJhciAqIGxhc3RFdmVudC5taWxsaXNQZXJUaWNrXG4gICAgICB0aGlzLl9sYXN0RXZlbnQudGlja3MgKz0gbGFzdEV2ZW50LnRpY2tzUGVyQmFyXG4gICAgICB0aGlzLl9sYXN0RXZlbnQubWlsbGlzICs9IGV4dHJhTWlsbGlzXG4gICAgICB0aGlzLl9kdXJhdGlvbk1pbGxpcyArPSBleHRyYU1pbGxpc1xuICAgICAgdGhpcy5iYXJzKytcbiAgICAgIHRoaXMuX3Jlc2l6ZWQgPSB0cnVlXG4gICAgICAvL2NvbnNvbGUubG9nKCdsZW5ndGgnLCB0aGlzLl9sYXN0RXZlbnQudGlja3MsIHRoaXMuX2xhc3RFdmVudC5taWxsaXMsIHRoaXMuYmFycywgbGFzdEV2ZW50KVxuICAgIH1cblxuICAgIHRoaXMuX3NjaGVkdWxlci51cGRhdGUoZGlmZilcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9wdWxzZS5iaW5kKHRoaXMpKVxuICB9XG5cbiAgcGF1c2UoKTogdm9pZHtcbiAgICB0aGlzLnBhdXNlZCA9ICF0aGlzLnBhdXNlZFxuICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZVxuICAgIGlmKHRoaXMucGF1c2VkKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLmFsbE5vdGVzT2ZmKClcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwYXVzZScsIGRhdGE6IHRoaXMucGF1c2VkfSlcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMucGxheSgpXG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGF1c2UnLCBkYXRhOiB0aGlzLnBhdXNlZH0pXG4gICAgfVxuICB9XG5cbiAgc3RvcCgpOiB2b2lke1xuICAgIC8vY29uc29sZS5sb2coJ1NUT1AnKVxuICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZVxuICAgIHRoaXMuYWxsTm90ZXNPZmYoKVxuICAgIGlmKHRoaXMucGxheWluZyB8fCB0aGlzLnBhdXNlZCl7XG4gICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZVxuICAgIH1cbiAgICBpZih0aGlzLl9jdXJyZW50TWlsbGlzICE9PSAwKXtcbiAgICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSAwXG4gICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgICBpZih0aGlzLnJlY29yZGluZyl7XG4gICAgICAgIHRoaXMuc3RvcFJlY29yZGluZygpXG4gICAgICB9XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAnc3RvcCd9KVxuICAgIH1cbiAgfVxuXG4gIHN0YXJ0UmVjb3JkaW5nKCl7XG4gICAgaWYodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IHRydWUpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX3JlY29yZElkID0gYHJlY29yZGluZ18ke3JlY29yZGluZ0luZGV4Kyt9JHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2suX3N0YXJ0UmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPSB0cnVlXG4gIH1cblxuICBzdG9wUmVjb3JkaW5nKCl7XG4gICAgaWYodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5fc3RvcFJlY29yZGluZyh0aGlzLl9yZWNvcmRJZClcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IGZhbHNlXG4gICAgdGhpcy5yZWNvcmRpbmcgPSBmYWxzZVxuICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdG9wX3JlY29yZGluZyd9KVxuICB9XG5cbiAgdW5kb1JlY29yZGluZygpe1xuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIHRyYWNrLnVuZG9SZWNvcmRpbmcodGhpcy5fcmVjb3JkSWQpXG4gICAgfSlcbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cblxuICByZWRvUmVjb3JkaW5nKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2sucmVkb1JlY29yZGluZyh0aGlzLl9yZWNvcmRJZClcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHNldE1ldHJvbm9tZShmbGFnKXtcbiAgICBpZih0eXBlb2YgZmxhZyA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy51c2VNZXRyb25vbWUgPSAhdGhpcy51c2VNZXRyb25vbWVcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMudXNlTWV0cm9ub21lID0gZmxhZ1xuICAgIH1cbiAgICB0aGlzLl9tZXRyb25vbWUubXV0ZSghdGhpcy51c2VNZXRyb25vbWUpXG4gIH1cblxuICBjb25maWd1cmVNZXRyb25vbWUoY29uZmlnKXtcbiAgICB0aGlzLl9tZXRyb25vbWUuY29uZmlndXJlKGNvbmZpZylcbiAgfVxuXG4gIGNvbmZpZ3VyZShjb25maWcpe1xuXG4gICAgaWYodHlwZW9mIGNvbmZpZy5waXRjaCAhPT0gJ3VuZGVmaW5lZCcpe1xuXG4gICAgICBpZihjb25maWcucGl0Y2ggPT09IHRoaXMucGl0Y2gpe1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMucGl0Y2ggPSBjb25maWcucGl0Y2hcbiAgICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgZXZlbnQudXBkYXRlUGl0Y2godGhpcy5waXRjaClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGNvbmZpZy5wcHEgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGlmKGNvbmZpZy5wcHEgPT09IHRoaXMucHBxKXtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBsZXQgcHBxRmFjdG9yID0gY29uZmlnLnBwcSAvIHRoaXMucHBxXG4gICAgICB0aGlzLnBwcSA9IGNvbmZpZy5wcHFcbiAgICAgIHRoaXMuX2FsbEV2ZW50cy5mb3JFYWNoKGUgPT4ge1xuICAgICAgICBlLnRpY2tzID0gZXZlbnQudGlja3MgKiBwcHFGYWN0b3JcbiAgICAgIH0pXG4gICAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gdHJ1ZVxuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cblxuICAgIGlmKHR5cGVvZiBjb25maWcucGxheWJhY2tTcGVlZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgaWYoY29uZmlnLnBsYXliYWNrU3BlZWQgPT09IHRoaXMucGxheWJhY2tTcGVlZCl7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5wbGF5YmFja1NwZWVkID0gY29uZmlnLnBsYXliYWNrU3BlZWRcbiAgICB9XG4gIH1cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKCh0cmFjaykgPT4ge1xuICAgICAgdHJhY2suYWxsTm90ZXNPZmYoKVxuICAgIH0pXG5cbiAgICB0aGlzLl9zY2hlZHVsZXIuYWxsTm90ZXNPZmYoKVxuICAgIHRoaXMuX21ldHJvbm9tZS5hbGxOb3Rlc09mZigpXG4gIH1cbi8qXG4gIHBhbmljKCl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5fdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICAgIHRyYWNrLmRpc2Nvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgICAgfSlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl90cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHtcbiAgICAgICAgICB0cmFjay5jb25uZWN0KHRoaXMuX291dHB1dClcbiAgICAgICAgfSlcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9LCAxMDApXG4gICAgfSlcbiAgfVxuKi9cbiAgZ2V0VHJhY2tzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl90cmFja3NdXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuICBnZXRFdmVudHMoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c11cbiAgfVxuXG4gIGdldE5vdGVzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ub3Rlc11cbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKGFyZ3Mpe1xuICAgIHJldHVybiBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCBhcmdzKVxuICB9XG5cbiAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuICBzZXRQb3NpdGlvbih0eXBlLCAuLi5hcmdzKXtcblxuICAgIGxldCB3YXNQbGF5aW5nID0gdGhpcy5wbGF5aW5nXG4gICAgaWYodGhpcy5wbGF5aW5nKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLmFsbE5vdGVzT2ZmKClcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJylcbiAgICAvL2xldCBtaWxsaXMgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnbWlsbGlzJylcbiAgICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IHBvc2l0aW9uLm1pbGxpc1xuICAgIC8vY29uc29sZS5sb2codGhpcy5fY3VycmVudE1pbGxpcylcblxuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgIGRhdGE6IHBvc2l0aW9uXG4gICAgfSlcblxuICAgIGlmKHdhc1BsYXlpbmcpe1xuICAgICAgdGhpcy5fcGxheSgpXG4gICAgfWVsc2V7XG4gICAgICAvL0B0b2RvOiBnZXQgdGhpcyBpbmZvcm1hdGlvbiBmcm9tIGxldCAncG9zaXRpb24nIC0+IHdlIGhhdmUganVzdCBjYWxjdWxhdGVkIHRoZSBwb3NpdGlvblxuICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCdzZXRQb3NpdGlvbicsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gIH1cblxuICBnZXRQb3NpdGlvbigpe1xuICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKS5wb3NpdGlvblxuICB9XG5cbiAgZ2V0UGxheWhlYWQoKXtcbiAgICByZXR1cm4gdGhpcy5fcGxheWhlYWQuZ2V0KClcbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0TGVmdExvY2F0b3IodHlwZSwgLi4uYXJncyl7XG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJylcblxuICAgIGlmKHRoaXMuX2xlZnRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcG9zaXRpb24gZm9yIGxvY2F0b3InKVxuICAgICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIC8vIEBhcmdzIC0+IHNlZSBfY2FsY3VsYXRlUG9zaXRpb25cbiAgc2V0UmlnaHRMb2NhdG9yKHR5cGUsIC4uLmFyZ3Mpe1xuICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKVxuXG4gICAgaWYodGhpcy5fcmlnaHRMb2NhdG9yID09PSBmYWxzZSl7XG4gICAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBwb3NpdGlvbiBmb3IgbG9jYXRvcicpXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICBzZXRMb29wKGZsYWcgPSBudWxsKXtcblxuICAgIHRoaXMubG9vcGluZyA9IGZsYWcgIT09IG51bGwgPyBmbGFnIDogIXRoaXMuX2xvb3BcblxuICAgIGlmKHRoaXMuX3JpZ2h0TG9jYXRvciA9PT0gZmFsc2UgfHwgdGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKXtcbiAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZVxuICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgICB0aGlzLmxvb3BpbmcgPSBmYWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gbG9jYXRvcnMgY2FuIG5vdCAoeWV0KSBiZSB1c2VkIHRvIGp1bXAgb3ZlciBhIHNlZ21lbnRcbiAgICBpZih0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzIDw9IHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcyl7XG4gICAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IHRydWVcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZVxuICAgICAgdGhpcy5sb29waW5nID0gZmFsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuX2xvb3BEdXJhdGlvbiA9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMgLSB0aGlzLl9sZWZ0TG9jYXRvci5taWxsaXNcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2xvb3AsIHRoaXMuX2xvb3BEdXJhdGlvbilcbiAgICB0aGlzLl9zY2hlZHVsZXIuYmV5b25kTG9vcCA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgPiB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgdGhpcy5fbG9vcCA9IHRoaXMubG9vcGluZyAmJiB0aGlzLl9jdXJyZW50TWlsbGlzIDw9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXNcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2xvb3AsIHRoaXMubG9vcGluZylcbiAgICByZXR1cm4gdGhpcy5sb29waW5nXG4gIH1cblxuICBzZXRQcmVjb3VudCh2YWx1ZSA9IDApe1xuICAgIHRoaXMuX3ByZWNvdW50QmFycyA9IHZhbHVlXG4gIH1cblxuICAvKlxuICAgIGhlbHBlciBtZXRob2Q6IGNvbnZlcnRzIHVzZXIgZnJpZW5kbHkgcG9zaXRpb24gZm9ybWF0IHRvIGludGVybmFsIGZvcm1hdFxuXG4gICAgcG9zaXRpb246XG4gICAgICAtICd0aWNrcycsIDk2MDAwXG4gICAgICAtICdtaWxsaXMnLCAxMjM0XG4gICAgICAtICdwZXJjZW50YWdlJywgNTVcbiAgICAgIC0gJ2JhcnNiZWF0cycsIDEsIDQsIDAsIDI1IC0+IGJhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXG4gICAgICAtICd0aW1lJywgMCwgMywgNDksIDU2NiAtPiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG5cbiAgKi9cbiAgX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsIHJlc3VsdFR5cGUpe1xuICAgIGxldCB0YXJnZXRcblxuICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBjYXNlICdwZXJjZW50YWdlJzpcbiAgICAgICAgLy90YXJnZXQgPSBhcmdzWzBdIHx8IDBcbiAgICAgICAgdGFyZ2V0ID0gYXJncyB8fCAwXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICAgIHRhcmdldCA9IGFyZ3NcbiAgICAgICAgYnJlYWtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5sb2coJ3Vuc3VwcG9ydGVkIHR5cGUnKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCB7XG4gICAgICB0eXBlLFxuICAgICAgdGFyZ2V0LFxuICAgICAgcmVzdWx0OiByZXN1bHRUeXBlLFxuICAgIH0pXG5cbiAgICByZXR1cm4gcG9zaXRpb25cbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spe1xuICAgIHJldHVybiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG4gICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZClcbiAgfVxuXG4gIHNhdmVBc01JRElGaWxlKG5hbWUpe1xuICAgIHNhdmVBc01JRElGaWxlKHRoaXMsIG5hbWUpXG4gIH1cblxuICBzZXRWb2x1bWUodmFsdWUpe1xuICAgIGlmKHZhbHVlIDwgMCB8fCB2YWx1ZSA+IDEpe1xuICAgICAgY29uc29sZS5sb2coJ1Nvbmcuc2V0Vm9sdW1lKCkgYWNjZXB0cyBhIHZhbHVlIGJldHdlZW4gMCBhbmQgMSwgeW91IGVudGVyZWQ6JywgdmFsdWUpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy52b2x1bWUgPSB2YWx1ZVxuICB9XG5cbiAgZ2V0Vm9sdW1lKCl7XG4gICAgcmV0dXJuIHRoaXMudm9sdW1lXG4gIH1cblxuICBzZXRQYW5uaW5nKHZhbHVlKXtcbiAgICBpZih2YWx1ZSA8IC0xIHx8IHZhbHVlID4gMSl7XG4gICAgICBjb25zb2xlLmxvZygnU29uZy5zZXRQYW5uaW5nKCkgYWNjZXB0cyBhIHZhbHVlIGJldHdlZW4gLTEgKGZ1bGwgbGVmdCkgYW5kIDEgKGZ1bGwgcmlnaHQpLCB5b3UgZW50ZXJlZDonLCB2YWx1ZSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5zZXRQYW5uaW5nKHZhbHVlKVxuICAgIH0pXG4gICAgdGhpcy5fcGFubmVyVmFsdWUgPSB2YWx1ZVxuICB9XG59XG4iLCIvLyBjYWxsZWQgYnkgc29uZ1xuaW1wb3J0IHtwYXJzZVRpbWVFdmVudHMsIHBhcnNlRXZlbnRzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQge2NhbGN1bGF0ZVBvc2l0aW9ufSBmcm9tICcuL3Bvc2l0aW9uJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGUoKTp2b2lke1xuICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlKXtcbiAgICBfdXBkYXRlLmNhbGwodGhpcylcbiAgfWVsc2V7XG4gICAgdGhpcy5fcGVyZm9ybVVwZGF0ZSA9IHRydWVcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX3VwZGF0ZSgpOnZvaWR7XG5cbiAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gZmFsc2VcbiAgICAmJiB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA9PT0gMFxuICAgICYmIHRoaXMuX25ld0V2ZW50cy5sZW5ndGggPT09IDBcbiAgICAmJiB0aGlzLl9tb3ZlZEV2ZW50cy5sZW5ndGggPT09IDBcbiAgICAmJiB0aGlzLl9uZXdQYXJ0cy5sZW5ndGggPT09IDBcbiAgICAmJiB0aGlzLl9yZW1vdmVkUGFydHMubGVuZ3RoID09PSAwXG4gICAgJiYgdGhpcy5fcmVzaXplZCA9PT0gZmFsc2VcbiAgKXtcbiAgICByZXR1cm5cbiAgfVxuICAvL2RlYnVnXG4gIC8vdGhpcy5pc1BsYXlpbmcgPSB0cnVlXG5cbiAgLy9jb25zb2xlLmdyb3VwQ29sbGFwc2VkKCd1cGRhdGUgc29uZycpXG4gIGNvbnNvbGUudGltZSgndXBkYXRpbmcgc29uZyB0b29rJylcblxuXG4vLyBUSU1FIEVWRU5UU1xuXG4gIC8vIGNoZWNrIGlmIHRpbWUgZXZlbnRzIGFyZSB1cGRhdGVkXG4gIGlmKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IHRydWUpe1xuICAgIC8vY29uc29sZS5sb2coJ3VwZGF0ZVRpbWVFdmVudHMnLCB0aGlzLl90aW1lRXZlbnRzLmxlbmd0aClcbiAgICBwYXJzZVRpbWVFdmVudHModGhpcywgdGhpcy5fdGltZUV2ZW50cywgdGhpcy5pc1BsYXlpbmcpXG4gICAgLy9jb25zb2xlLmxvZygndGltZSBldmVudHMgJU8nLCB0aGlzLl90aW1lRXZlbnRzKVxuICB9XG5cbiAgLy8gb25seSBwYXJzZSBuZXcgYW5kIG1vdmVkIGV2ZW50c1xuICBsZXQgdG9iZVBhcnNlZCA9IFtdXG5cbiAgLy8gYnV0IHBhcnNlIGFsbCBldmVudHMgaWYgdGhlIHRpbWUgZXZlbnRzIGhhdmUgYmVlbiB1cGRhdGVkXG4gIGlmKHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IHRydWUpe1xuICAgIHRvYmVQYXJzZWQgPSBbLi4udGhpcy5fZXZlbnRzXVxuICB9XG5cblxuLy8gUEFSVFNcblxuICAvLyBmaWx0ZXIgcmVtb3ZlZCBwYXJ0c1xuICAvL2NvbnNvbGUubG9nKCdyZW1vdmVkIHBhcnRzICVPJywgdGhpcy5fcmVtb3ZlZFBhcnRzKVxuICB0aGlzLl9yZW1vdmVkUGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZClcbiAgfSlcblxuXG4gIC8vIGFkZCBuZXcgcGFydHNcbiAgLy9jb25zb2xlLmxvZygnbmV3IHBhcnRzICVPJywgdGhpcy5fbmV3UGFydHMpXG4gIHRoaXMuX25ld1BhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICBwYXJ0Ll9zb25nID0gdGhpc1xuICAgIHRoaXMuX3BhcnRzQnlJZC5zZXQocGFydC5pZCwgcGFydClcbiAgICBwYXJ0LnVwZGF0ZSgpXG4gIH0pXG5cblxuICAvLyB1cGRhdGUgY2hhbmdlZCBwYXJ0c1xuICAvL2NvbnNvbGUubG9nKCdjaGFuZ2VkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKVxuICB0aGlzLl9jaGFuZ2VkUGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgIHBhcnQudXBkYXRlKClcbiAgfSlcblxuXG4gIC8vIHJlbW92ZWQgcGFydHNcbiAgLy9jb25zb2xlLmxvZygncmVtb3ZlZCBwYXJ0cyAlTycsIHRoaXMuX2NoYW5nZWRQYXJ0cylcbiAgdGhpcy5fcmVtb3ZlZFBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICB0aGlzLl9wYXJ0c0J5SWQuZGVsZXRlKHBhcnQuaWQpXG4gIH0pXG5cbiAgaWYodGhpcy5fcmVtb3ZlZFBhcnRzLmxlbmd0aCA+IDApe1xuICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpXG4gIH1cblxuXG4vLyBFVkVOVFNcblxuICAvLyBmaWx0ZXIgcmVtb3ZlZCBldmVudHNcbiAgLy9jb25zb2xlLmxvZygncmVtb3ZlZCBldmVudHMgJU8nLCB0aGlzLl9yZW1vdmVkRXZlbnRzKVxuICB0aGlzLl9yZW1vdmVkRXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgbGV0IHRyYWNrID0gZXZlbnQubWlkaU5vdGUuX3RyYWNrXG4gICAgLy8gdW5zY2hlZHVsZSBhbGwgcmVtb3ZlZCBldmVudHMgdGhhdCBhbHJlYWR5IGhhdmUgYmVlbiBzY2hlZHVsZWRcbiAgICBpZihldmVudC50aW1lID49IHRoaXMuX2N1cnJlbnRNaWxsaXMpe1xuICAgICAgdHJhY2sudW5zY2hlZHVsZShldmVudClcbiAgICB9XG4gICAgdGhpcy5fbm90ZXNCeUlkLmRlbGV0ZShldmVudC5taWRpTm90ZS5pZClcbiAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgfSlcblxuXG4gIC8vIGFkZCBuZXcgZXZlbnRzXG4gIC8vY29uc29sZS5sb2coJ25ldyBldmVudHMgJU8nLCB0aGlzLl9uZXdFdmVudHMpXG4gIHRoaXMuX25ld0V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgIHRoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudClcbiAgICB0aGlzLl9ldmVudHMucHVzaChldmVudClcbiAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpXG4gIH0pXG5cblxuICAvLyBtb3ZlZCBldmVudHMgbmVlZCB0byBiZSBwYXJzZWRcbiAgLy9jb25zb2xlLmxvZygnbW92ZWQgJU8nLCB0aGlzLl9tb3ZlZEV2ZW50cylcbiAgdGhpcy5fbW92ZWRFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAvLyBkb24ndCBhZGQgbW92ZWQgZXZlbnRzIGlmIHRoZSB0aW1lIGV2ZW50cyBoYXZlIGJlZW4gdXBkYXRlZCAtPiB0aGV5IGhhdmUgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIHRoZSB0b2JlUGFyc2VkIGFycmF5XG4gICAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gZmFsc2Upe1xuICAgICAgdG9iZVBhcnNlZC5wdXNoKGV2ZW50KVxuICAgIH1cbiAgfSlcblxuXG4gIC8vIHBhcnNlIGFsbCBuZXcgYW5kIG1vdmVkIGV2ZW50c1xuICBpZih0b2JlUGFyc2VkLmxlbmd0aCA+IDApe1xuICAgIC8vY29uc29sZS50aW1lKCdwYXJzZScpXG4gICAgLy9jb25zb2xlLmxvZygndG9iZVBhcnNlZCAlTycsIHRvYmVQYXJzZWQpXG4gICAgLy9jb25zb2xlLmxvZygncGFyc2VFdmVudHMnLCB0b2JlUGFyc2VkLmxlbmd0aClcblxuICAgIHRvYmVQYXJzZWQgPSBbLi4udG9iZVBhcnNlZCwgLi4udGhpcy5fdGltZUV2ZW50c11cbiAgICBwYXJzZUV2ZW50cyh0b2JlUGFyc2VkLCB0aGlzLmlzUGxheWluZylcblxuICAgIC8vIGFkZCBNSURJIG5vdGVzIHRvIHNvbmdcbiAgICB0b2JlUGFyc2VkLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5pZCwgZXZlbnQudHlwZSwgZXZlbnQubWlkaU5vdGUpXG4gICAgICBpZihldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5OT1RFX09OKXtcbiAgICAgICAgaWYoZXZlbnQubWlkaU5vdGUpe1xuICAgICAgICAgIHRoaXMuX25vdGVzQnlJZC5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkLCBldmVudC50eXBlKVxuICAgICAgICAgIC8vdGhpcy5fbm90ZXMucHVzaChldmVudC5taWRpTm90ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLnRpbWVFbmQoJ3BhcnNlJylcbiAgfVxuXG4gIGlmKHRvYmVQYXJzZWQubGVuZ3RoID4gMCB8fCB0aGlzLl9yZW1vdmVkRXZlbnRzLmxlbmd0aCA+IDApe1xuICAgIC8vY29uc29sZS50aW1lKCd0byBhcnJheScpXG4gICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgIHRoaXMuX25vdGVzID0gQXJyYXkuZnJvbSh0aGlzLl9ub3Rlc0J5SWQudmFsdWVzKCkpXG4gICAgLy9jb25zb2xlLnRpbWVFbmQoJ3RvIGFycmF5JylcbiAgfVxuXG5cbiAgLy9jb25zb2xlLnRpbWUoYHNvcnRpbmcgJHt0aGlzLl9ldmVudHMubGVuZ3RofSBldmVudHNgKVxuICBzb3J0RXZlbnRzKHRoaXMuX2V2ZW50cylcbiAgdGhpcy5fbm90ZXMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gYS5ub3RlT24udGlja3MgLSBiLm5vdGVPbi50aWNrc1xuICB9KVxuICAvL2NvbnNvbGUudGltZUVuZChgc29ydGluZyAke3RoaXMuX2V2ZW50cy5sZW5ndGh9IGV2ZW50c2ApXG5cbiAgLy9jb25zb2xlLmxvZygnbm90ZXMgJU8nLCB0aGlzLl9ub3RlcylcbiAgY29uc29sZS50aW1lRW5kKCd1cGRhdGluZyBzb25nIHRvb2snKVxuXG5cbi8vIFNPTkcgRFVSQVRJT05cblxuICAvLyBnZXQgdGhlIGxhc3QgZXZlbnQgb2YgdGhpcyBzb25nXG4gIGxldCBsYXN0RXZlbnQgPSB0aGlzLl9ldmVudHNbdGhpcy5fZXZlbnRzLmxlbmd0aCAtIDFdXG4gIGxldCBsYXN0VGltZUV2ZW50ID0gdGhpcy5fdGltZUV2ZW50c1t0aGlzLl90aW1lRXZlbnRzLmxlbmd0aCAtIDFdXG4gIC8vY29uc29sZS5sb2cobGFzdEV2ZW50LCBsYXN0VGltZUV2ZW50KVxuXG4gIC8vIGNoZWNrIGlmIHNvbmcgaGFzIGFscmVhZHkgYW55IGV2ZW50c1xuICBpZihsYXN0RXZlbnQgaW5zdGFuY2VvZiBNSURJRXZlbnQgPT09IGZhbHNlKXtcbiAgICBsYXN0RXZlbnQgPSBsYXN0VGltZUV2ZW50XG4gIH1lbHNlIGlmKGxhc3RUaW1lRXZlbnQudGlja3MgPiBsYXN0RXZlbnQudGlja3Mpe1xuICAgIGxhc3RFdmVudCA9IGxhc3RUaW1lRXZlbnRcbiAgfVxuICAvL2NvbnNvbGUubG9nKGxhc3RFdmVudCwgdGhpcy5iYXJzKVxuXG4gIC8vIGdldCB0aGUgcG9zaXRpb24gZGF0YSBvZiB0aGUgZmlyc3QgYmVhdCBpbiB0aGUgYmFyIGFmdGVyIHRoZSBsYXN0IGJhclxuICB0aGlzLmJhcnMgPSBNYXRoLm1heChsYXN0RXZlbnQuYmFyLCB0aGlzLmJhcnMpXG4gIGxldCB0aWNrcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICB0YXJnZXQ6IFt0aGlzLmJhcnMgKyAxXSxcbiAgICByZXN1bHQ6ICd0aWNrcydcbiAgfSkudGlja3NcblxuICAvLyB3ZSB3YW50IHRvIHB1dCB0aGUgRU5EX09GX1RSQUNLIGV2ZW50IGF0IHRoZSB2ZXJ5IGxhc3QgdGljayBvZiB0aGUgbGFzdCBiYXIsIHNvIHdlIGNhbGN1bGF0ZSB0aGF0IHBvc2l0aW9uXG4gIGxldCBtaWxsaXMgPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCB7XG4gICAgdHlwZTogJ3RpY2tzJyxcbiAgICB0YXJnZXQ6IHRpY2tzIC0gMSxcbiAgICByZXN1bHQ6ICdtaWxsaXMnXG4gIH0pLm1pbGxpc1xuXG4gIHRoaXMuX2xhc3RFdmVudC50aWNrcyA9IHRpY2tzIC0gMVxuICB0aGlzLl9sYXN0RXZlbnQubWlsbGlzID0gbWlsbGlzXG5cbiAgLy9jb25zb2xlLmxvZygnbGVuZ3RoJywgdGhpcy5fbGFzdEV2ZW50LnRpY2tzLCB0aGlzLl9sYXN0RXZlbnQubWlsbGlzLCB0aGlzLmJhcnMpXG5cbiAgdGhpcy5fZHVyYXRpb25UaWNrcyA9IHRoaXMuX2xhc3RFdmVudC50aWNrc1xuICB0aGlzLl9kdXJhdGlvbk1pbGxpcyA9IHRoaXMuX2xhc3RFdmVudC5taWxsaXNcblxuXG4vLyBNRVRST05PTUVcblxuICAvLyBhZGQgbWV0cm9ub21lIGV2ZW50c1xuICBpZih0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgfHwgdGhpcy5fbWV0cm9ub21lLmJhcnMgIT09IHRoaXMuYmFycyB8fCB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSB0cnVlKXtcbiAgICB0aGlzLl9tZXRyb25vbWVFdmVudHMgPSBwYXJzZUV2ZW50cyhbLi4udGhpcy5fdGltZUV2ZW50cywgLi4udGhpcy5fbWV0cm9ub21lLmdldEV2ZW50cygpXSlcbiAgfVxuICB0aGlzLl9hbGxFdmVudHMgPSBbLi4udGhpcy5fbWV0cm9ub21lRXZlbnRzLCAuLi50aGlzLl9ldmVudHNdXG4gIHNvcnRFdmVudHModGhpcy5fYWxsRXZlbnRzKVxuICAvL2NvbnNvbGUubG9nKCdhbGwgZXZlbnRzICVPJywgdGhpcy5fYWxsRXZlbnRzKVxuXG4vKlxuICB0aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKClcbiAgdGhpcy5fYWxsRXZlbnRzID0gWy4uLnRoaXMuX2V2ZW50c11cbiAgc29ydEV2ZW50cyh0aGlzLl9hbGxFdmVudHMpXG4qL1xuXG4gIC8vY29uc29sZS5sb2coJ2N1cnJlbnQgbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgdGhpcy5fcGxheWhlYWQudXBkYXRlU29uZygpXG4gIHRoaXMuX3NjaGVkdWxlci51cGRhdGVTb25nKClcblxuICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlKXtcbiAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgZGF0YTogdGhpcy5fcGxheWhlYWQuZ2V0KCkucG9zaXRpb25cbiAgICB9KVxuICB9XG5cbiAgLy8gcmVzZXRcbiAgdGhpcy5fbmV3UGFydHMgPSBbXVxuICB0aGlzLl9yZW1vdmVkUGFydHMgPSBbXVxuICB0aGlzLl9uZXdFdmVudHMgPSBbXVxuICB0aGlzLl9tb3ZlZEV2ZW50cyA9IFtdXG4gIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXVxuICB0aGlzLl9yZXNpemVkID0gZmFsc2VcbiAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IGZhbHNlXG5cbiAgLy9jb25zb2xlLmdyb3VwRW5kKCd1cGRhdGUgc29uZycpXG59XG4iLCJpbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCB7cGFyc2VNSURJRmlsZX0gZnJvbSAnLi9taWRpZmlsZSdcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7VHJhY2t9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge1Nvbmd9IGZyb20gJy4vc29uZydcbmltcG9ydCB7YmFzZTY0VG9CaW5hcnl9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7c3RhdHVzLCBqc29uLCBhcnJheUJ1ZmZlcn0gZnJvbSAnLi9mZXRjaF9oZWxwZXJzJ1xuaW1wb3J0IHtnZXRTZXR0aW5nc30gZnJvbSAnLi9zZXR0aW5ncydcblxuXG5mdW5jdGlvbiB0b1NvbmcocGFyc2VkLCBzZXR0aW5ncyl7XG5cbiAgbGV0IHRyYWNrcyA9IHBhcnNlZC50cmFja3NcbiAgbGV0IHBwcSA9IHBhcnNlZC5oZWFkZXIudGlja3NQZXJCZWF0IC8vIHRoZSBQUFEgYXMgc2V0IGluIHRoZSBsb2FkZWQgTUlESSBmaWxlXG4gIGxldCBwcHFGYWN0b3IgPSAxXG5cbiAgLy8gY2hlY2sgaWYgd2UgbmVlZCB0byBvdmVycnVsZSB0aGUgUFBRIG9mcyB0aGUgbG9hZGVkIE1JREkgZmlsZVxuICBpZih0eXBlb2Ygc2V0dGluZ3Mub3ZlcnJ1bGVQUFEgPT09ICd1bmRlZmluZWQnIHx8IHNldHRpbmdzLm92ZXJydWxlUFBRID09PSB0cnVlKXtcbiAgICBsZXQgbmV3UFBRID0gZ2V0U2V0dGluZ3MoKS5wcHFcbiAgICBwcHFGYWN0b3IgPSBuZXdQUFEgLyBwcHFcbiAgICBwcHEgPSBuZXdQUFFcbiAgfVxuXG4gIGxldCB0aW1lRXZlbnRzID0gW11cbiAgbGV0IGJwbSA9IC0xXG4gIGxldCBub21pbmF0b3IgPSAtMVxuICBsZXQgZGVub21pbmF0b3IgPSAtMVxuICBsZXQgbmV3VHJhY2tzID0gW11cblxuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcy52YWx1ZXMoKSl7XG4gICAgbGV0IGxhc3RUaWNrcywgbGFzdFR5cGVcbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IHR5cGVcbiAgICBsZXQgY2hhbm5lbCA9IC0xXG4gICAgbGV0IHRyYWNrTmFtZVxuICAgIGxldCB0cmFja0luc3RydW1lbnROYW1lXG4gICAgbGV0IGV2ZW50cyA9IFtdO1xuXG4gICAgZm9yKGxldCBldmVudCBvZiB0cmFjayl7XG4gICAgICB0aWNrcyArPSAoZXZlbnQuZGVsdGFUaW1lICogcHBxRmFjdG9yKTtcblxuICAgICAgaWYoY2hhbm5lbCA9PT0gLTEgJiYgdHlwZW9mIGV2ZW50LmNoYW5uZWwgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY2hhbm5lbCA9IGV2ZW50LmNoYW5uZWw7XG4gICAgICB9XG4gICAgICB0eXBlID0gZXZlbnQuc3VidHlwZTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVsdGFUaW1lLCB0aWNrcywgdHlwZSk7XG5cbiAgICAgIHN3aXRjaChldmVudC5zdWJ0eXBlKXtcblxuICAgICAgICBjYXNlICd0cmFja05hbWUnOlxuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnaW5zdHJ1bWVudE5hbWUnOlxuICAgICAgICAgIGlmKGV2ZW50LnRleHQpe1xuICAgICAgICAgICAgdHJhY2tJbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg5MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPZmYnOlxuICAgICAgICAgIGV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4ODAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSlcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdzZXRUZW1wbyc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGVtcG8gZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGxldCB0bXAgPSA2MDAwMDAwMCAvIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQ7XG5cbiAgICAgICAgICBpZih0aWNrcyA9PT0gbGFzdFRpY2tzICYmIHR5cGUgPT09IGxhc3RUeXBlKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKCd0ZW1wbyBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCB0bXApO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihicG0gPT09IC0xKXtcbiAgICAgICAgICAgIGJwbSA9IHRtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4NTEsIHRtcCkpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZVNpZ25hdHVyZSc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGlmKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpe1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCd0aW1lIHNpZ25hdHVyZSBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYobm9taW5hdG9yID09PSAtMSl7XG4gICAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5udW1lcmF0b3JcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3JcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKG5ldyBNSURJRXZlbnQodGlja3MsIDB4NTgsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpKVxuICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSAnY29udHJvbGxlcic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhCMCwgZXZlbnQuY29udHJvbGxlclR5cGUsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncHJvZ3JhbUNoYW5nZSc6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhDMCwgZXZlbnQucHJvZ3JhbU51bWJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3BpdGNoQmVuZCc6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHhFMCwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vY29uc29sZS5sb2codHJhY2submFtZSwgZXZlbnQudHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGxhc3RUeXBlID0gdHlwZVxuICAgICAgbGFzdFRpY2tzID0gdGlja3NcbiAgICB9XG5cbiAgICBpZihldmVudHMubGVuZ3RoID4gMCl7XG4gICAgICAvL2NvbnNvbGUuY291bnQoZXZlbnRzLmxlbmd0aClcbiAgICAgIG5ld1RyYWNrcy5wdXNoKG5ldyBUcmFjayh7XG4gICAgICAgIG5hbWU6IHRyYWNrTmFtZSxcbiAgICAgICAgcGFydHM6IFtcbiAgICAgICAgICBuZXcgUGFydCh7XG4gICAgICAgICAgICBldmVudHM6IGV2ZW50c1xuICAgICAgICAgIH0pXG4gICAgICAgIF1cbiAgICAgIH0pKVxuICAgIH1cbiAgfVxuXG4gIGxldCBzb25nID0gbmV3IFNvbmcoe1xuICAgIHBwcSxcbiAgICBicG0sXG4gICAgbm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yLFxuICAgIHRyYWNrczogbmV3VHJhY2tzLFxuICAgIHRpbWVFdmVudHM6IHRpbWVFdmVudHNcbiAgfSlcbiAgLy9zb25nLnVwZGF0ZSgpXG4gIHJldHVybiBzb25nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlU3luYyhkYXRhLCBzZXR0aW5ncyA9IHt9KXtcbiAgbGV0IHNvbmcgPSBudWxsO1xuXG4gIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgIHNvbmcgPSB0b1NvbmcocGFyc2VNSURJRmlsZShidWZmZXIpLCBzZXR0aW5ncyk7XG4gIH1lbHNlIGlmKHR5cGVvZiBkYXRhLmhlYWRlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRhdGEudHJhY2tzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgLy8gYSBNSURJIGZpbGUgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIHBhcnNlZFxuICAgIHNvbmcgPSB0b1NvbmcoZGF0YSwgc2V0dGluZ3MpO1xuICB9ZWxzZXtcbiAgICAvLyBhIGJhc2U2NCBlbmNvZGVkIE1JREkgZmlsZVxuICAgIGRhdGEgPSBiYXNlNjRUb0JpbmFyeShkYXRhKTtcbiAgICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgc29uZyA9IHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlciksIHNldHRpbmdzKTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3dyb25nIGRhdGEnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc29uZ1xuICAvLyB7XG4gIC8vICAgcHBxID0gbmV3UFBRLFxuICAvLyAgIGJwbSA9IG5ld0JQTSxcbiAgLy8gICBwbGF5YmFja1NwZWVkID0gbmV3UGxheWJhY2tTcGVlZCxcbiAgLy8gfSA9IHNldHRpbmdzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbmdGcm9tTUlESUZpbGUodXJsLCBzZXR0aW5ncyA9IHt9KXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBmZXRjaCh1cmwsIHtcbiAgICAvLyAgIG1vZGU6ICduby1jb3JzJ1xuICAgIC8vIH0pXG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihhcnJheUJ1ZmZlcilcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJlc29sdmUoc29uZ0Zyb21NSURJRmlsZVN5bmMoZGF0YSwgc2V0dGluZ3MpKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cbiIsImltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7TUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuaW1wb3J0IHtnZXRNSURJSW5wdXRCeUlkLCBnZXRNSURJT3V0cHV0QnlJZH0gZnJvbSAnLi9pbml0X21pZGknXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9xYW1iaSdcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5jb25zdCB6ZXJvVmFsdWUgPSAwLjAwMDAwMDAwMDAwMDAwMDAxXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFRyYWNre1xuXG4gIGNvbnN0cnVjdG9yKHNldHRpbmdzID0ge30pe1xuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWA7XG5cbiAgICAoe1xuICAgICAgbmFtZTogdGhpcy5uYW1lID0gdGhpcy5pZCxcbiAgICAgIGNoYW5uZWw6IHRoaXMuY2hhbm5lbCA9IDAsXG4gICAgICBtdXRlZDogdGhpcy5tdXRlZCA9IGZhbHNlLFxuICAgICAgdm9sdW1lOiB0aGlzLnZvbHVtZSA9IDAuNSxcbiAgICB9ID0gc2V0dGluZ3MpO1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLm5hbWUsIHRoaXMuY2hhbm5lbCwgdGhpcy5tdXRlZCwgdGhpcy52b2x1bWUpXG5cbiAgICB0aGlzLl9wYW5uZXIgPSBjb250ZXh0LmNyZWF0ZVBhbm5lcigpXG4gICAgdGhpcy5fcGFubmVyLnBhbm5pbmdNb2RlbCA9ICdlcXVhbHBvd2VyJ1xuICAgIHRoaXMuX3Bhbm5lci5zZXRQb3NpdGlvbih6ZXJvVmFsdWUsIHplcm9WYWx1ZSwgemVyb1ZhbHVlKVxuICAgIHRoaXMuX291dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5fb3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuX3Bhbm5lci5jb25uZWN0KHRoaXMuX291dHB1dClcbiAgICAvL3RoaXMuX291dHB1dC5jb25uZWN0KHRoaXMuX3Bhbm5lcilcbiAgICB0aGlzLl9taWRpSW5wdXRzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fbWlkaU91dHB1dHMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9zb25nID0gbnVsbFxuICAgIHRoaXMuX3BhcnRzID0gW11cbiAgICB0aGlzLl9wYXJ0c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgdGhpcy5faW5zdHJ1bWVudCA9IG51bGxcbiAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fcmVjb3JkZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICB0aGlzLm1vbml0b3IgPSBmYWxzZVxuICAgIHRoaXMuX3NvbmdJbnB1dCA9IG51bGxcbiAgICB0aGlzLl9lZmZlY3RzID0gW11cblxuICAgIGxldCB7cGFydHMsIGluc3RydW1lbnR9ID0gc2V0dGluZ3NcbiAgICBpZih0eXBlb2YgcGFydHMgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuYWRkUGFydHMoLi4ucGFydHMpXG4gICAgfVxuICAgIGlmKHR5cGVvZiBpbnN0cnVtZW50ICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnNldEluc3RydW1lbnQoaW5zdHJ1bWVudClcbiAgICB9XG4gIH1cblxuICBzZXRJbnN0cnVtZW50KGluc3RydW1lbnQgPSBudWxsKXtcbiAgICBpZihpbnN0cnVtZW50ICE9PSBudWxsXG4gICAgICAvLyBjaGVjayBpZiB0aGUgbWFuZGF0b3J5IGZ1bmN0aW9ucyBvZiBhbiBpbnN0cnVtZW50IGFyZSBwcmVzZW50IChJbnRlcmZhY2UgSW5zdHJ1bWVudClcbiAgICAgICYmIHR5cGVvZiBpbnN0cnVtZW50LmNvbm5lY3QgPT09ICdmdW5jdGlvbidcbiAgICAgICYmIHR5cGVvZiBpbnN0cnVtZW50LmRpc2Nvbm5lY3QgPT09ICdmdW5jdGlvbidcbiAgICAgICYmIHR5cGVvZiBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQgPT09ICdmdW5jdGlvbidcbiAgICAgICYmIHR5cGVvZiBpbnN0cnVtZW50LmFsbE5vdGVzT2ZmID09PSAnZnVuY3Rpb24nXG4gICAgICAmJiB0eXBlb2YgaW5zdHJ1bWVudC51bnNjaGVkdWxlID09PSAnZnVuY3Rpb24nXG4gICAgKXtcbiAgICAgIHRoaXMucmVtb3ZlSW5zdHJ1bWVudCgpXG4gICAgICB0aGlzLl9pbnN0cnVtZW50ID0gaW5zdHJ1bWVudFxuICAgICAgdGhpcy5faW5zdHJ1bWVudC5jb25uZWN0KHRoaXMuX3Bhbm5lcilcbiAgICB9ZWxzZSBpZihpbnN0cnVtZW50ID09PSBudWxsKXtcbiAgICAgIC8vIGlmIHlvdSBwYXNzIG51bGwgYXMgYXJndW1lbnQgdGhlIGN1cnJlbnQgaW5zdHJ1bWVudCB3aWxsIGJlIHJlbW92ZWQsIHNhbWUgYXMgcmVtb3ZlSW5zdHJ1bWVudFxuICAgICAgdGhpcy5yZW1vdmVJbnN0cnVtZW50KClcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIGluc3RydW1lbnQsIGFuZCBpbnN0cnVtZW50IHNob3VsZCBoYXZlIHRoZSBtZXRob2RzIFwiY29ubmVjdFwiLCBcImRpc2Nvbm5lY3RcIiwgXCJwcm9jZXNzTUlESUV2ZW50XCIsIFwidW5zY2hlZHVsZVwiIGFuZCBcImFsbE5vdGVzT2ZmXCInKVxuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUluc3RydW1lbnQoKXtcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICAgICAgdGhpcy5faW5zdHJ1bWVudC5kaXNjb25uZWN0KClcbiAgICAgIHRoaXMuX2luc3RydW1lbnQgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgZ2V0SW5zdHJ1bWVudCgpe1xuICAgIHJldHVybiB0aGlzLl9pbnN0cnVtZW50XG4gIH1cblxuICBjb25uZWN0TUlESU91dHB1dHMoLi4ub3V0cHV0cyl7XG4gICAgLy9jb25zb2xlLmxvZyhvdXRwdXRzKVxuICAgIG91dHB1dHMuZm9yRWFjaChvdXRwdXQgPT4ge1xuICAgICAgaWYodHlwZW9mIG91dHB1dCA9PT0gJ3N0cmluZycpe1xuICAgICAgICBvdXRwdXQgPSBnZXRNSURJT3V0cHV0QnlJZChvdXRwdXQpXG4gICAgICB9XG4gICAgICBpZihvdXRwdXQgaW5zdGFuY2VvZiBNSURJT3V0cHV0KXtcbiAgICAgICAgdGhpcy5fbWlkaU91dHB1dHMuc2V0KG91dHB1dC5pZCwgb3V0cHV0KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpT3V0cHV0cylcbiAgfVxuXG4gIGRpc2Nvbm5lY3RNSURJT3V0cHV0cyguLi5vdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gICAgaWYob3V0cHV0cy5sZW5ndGggPT09IDApe1xuICAgICAgdGhpcy5fbWlkaU91dHB1dHMuY2xlYXIoKVxuICAgIH1cbiAgICBvdXRwdXRzLmZvckVhY2gocG9ydCA9PiB7XG4gICAgICBpZihwb3J0IGluc3RhbmNlb2YgTUlESU91dHB1dCl7XG4gICAgICAgIHBvcnQgPSBwb3J0LmlkXG4gICAgICB9XG4gICAgICBpZih0aGlzLl9taWRpT3V0cHV0cy5oYXMocG9ydCkpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdyZW1vdmluZycsIHRoaXMuX21pZGlPdXRwdXRzLmdldChwb3J0KS5uYW1lKVxuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5kZWxldGUocG9ydClcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vdGhpcy5fbWlkaU91dHB1dHMgPSB0aGlzLl9taWRpT3V0cHV0cy5maWx0ZXIoLi4ub3V0cHV0cylcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlPdXRwdXRzKVxuICB9XG5cbiAgY29ubmVjdE1JRElJbnB1dHMoLi4uaW5wdXRzKXtcbiAgICBpbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgICBpZih0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaW5wdXQgPSBnZXRNSURJSW5wdXRCeUlkKGlucHV0KVxuICAgICAgfVxuICAgICAgaWYoaW5wdXQgaW5zdGFuY2VvZiBNSURJSW5wdXQpe1xuXG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuc2V0KGlucHV0LmlkLCBpbnB1dClcblxuICAgICAgICBpbnB1dC5vbm1pZGltZXNzYWdlID0gZSA9PiB7XG4gICAgICAgICAgaWYodGhpcy5tb25pdG9yID09PSB0cnVlKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coLi4uZS5kYXRhKVxuICAgICAgICAgICAgdGhpcy5fcHJlcHJvY2Vzc01JRElFdmVudChuZXcgTUlESUV2ZW50KHRoaXMuX3NvbmcuX3RpY2tzLCAuLi5lLmRhdGEpKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICB9XG5cbiAgLy8geW91IGNhbiBwYXNzIGJvdGggcG9ydCBhbmQgcG9ydCBpZHNcbiAgZGlzY29ubmVjdE1JRElJbnB1dHMoLi4uaW5wdXRzKXtcbiAgICBpZihpbnB1dHMubGVuZ3RoID09PSAwKXtcbiAgICAgIHRoaXMuX21pZGlJbnB1dHMuZm9yRWFjaChwb3J0ID0+IHtcbiAgICAgICAgcG9ydC5vbm1pZGltZXNzYWdlID0gbnVsbFxuICAgICAgfSlcbiAgICAgIHRoaXMuX21pZGlJbnB1dHMuY2xlYXIoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlucHV0cy5mb3JFYWNoKHBvcnQgPT4ge1xuICAgICAgaWYocG9ydCBpbnN0YW5jZW9mIE1JRElJbnB1dCl7XG4gICAgICAgIHBvcnQgPSBwb3J0LmlkXG4gICAgICB9XG4gICAgICBpZih0aGlzLl9taWRpSW5wdXRzLmhhcyhwb3J0KSl7XG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuZ2V0KHBvcnQpLm9ubWlkaW1lc3NhZ2UgPSBudWxsXG4gICAgICAgIHRoaXMuX21pZGlJbnB1dHMuZGVsZXRlKHBvcnQpXG4gICAgICB9XG4gICAgfSlcbiAgICAvL3RoaXMuX21pZGlPdXRwdXRzID0gdGhpcy5fbWlkaU91dHB1dHMuZmlsdGVyKC4uLm91dHB1dHMpXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9taWRpSW5wdXRzKVxuICB9XG5cbiAgZ2V0TUlESUlucHV0cygpe1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX21pZGlJbnB1dHMudmFsdWVzKCkpXG4gIH1cblxuICBnZXRNSURJT3V0cHV0cygpe1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKVxuICB9XG5cbiAgc2V0UmVjb3JkRW5hYmxlZCh0eXBlKXsgLy8gJ21pZGknLCAnYXVkaW8nLCBlbXB0eSBvciBhbnl0aGluZyB3aWxsIGRpc2FibGUgcmVjb3JkaW5nXG4gICAgdGhpcy5fcmVjb3JkRW5hYmxlZCA9IHR5cGVcbiAgfVxuXG4gIF9zdGFydFJlY29yZGluZyhyZWNvcmRJZCl7XG4gICAgaWYodGhpcy5fcmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKXtcbiAgICAgIC8vY29uc29sZS5sb2cocmVjb3JkSWQpXG4gICAgICB0aGlzLl9yZWNvcmRJZCA9IHJlY29yZElkXG4gICAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdXG4gICAgICB0aGlzLl9yZWNvcmRQYXJ0ID0gbmV3IFBhcnQodGhpcy5fcmVjb3JkSWQpXG4gICAgfVxuICB9XG5cbiAgX3N0b3BSZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYodGhpcy5fcmVjb3JkZWRFdmVudHMubGVuZ3RoID09PSAwKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLl9yZWNvcmRQYXJ0LmFkZEV2ZW50cyguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgICAvL3RoaXMuX3NvbmcuX25ld0V2ZW50cy5wdXNoKC4uLnRoaXMuX3JlY29yZGVkRXZlbnRzKVxuICAgIHRoaXMuYWRkUGFydHModGhpcy5fcmVjb3JkUGFydClcbiAgfVxuXG4gIHVuZG9SZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5yZW1vdmVQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KVxuICAgIC8vdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX3JlY29yZGVkRXZlbnRzKVxuICB9XG5cbiAgcmVkb1JlY29yZGluZyhyZWNvcmRJZCl7XG4gICAgaWYodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmFkZFBhcnRzKHRoaXMuX3JlY29yZFBhcnQpXG4gIH1cblxuICBjb3B5KCl7XG4gICAgbGV0IHQgPSBuZXcgVHJhY2sodGhpcy5uYW1lICsgJ19jb3B5JykgLy8gaW1wbGVtZW50IGdldE5hbWVPZkNvcHkoKSBpbiB1dGlsIChzZWUgaGVhcnRiZWF0KVxuICAgIGxldCBwYXJ0cyA9IFtdXG4gICAgdGhpcy5fcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIGxldCBjb3B5ID0gcGFydC5jb3B5KClcbiAgICAgIGNvbnNvbGUubG9nKGNvcHkpXG4gICAgICBwYXJ0cy5wdXNoKGNvcHkpXG4gICAgfSlcbiAgICB0LmFkZFBhcnRzKC4uLnBhcnRzKVxuICAgIHQudXBkYXRlKClcbiAgICByZXR1cm4gdFxuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnRyYW5zcG9zZShhbW91bnQpXG4gICAgfSlcbiAgfVxuXG4gIGFkZFBhcnRzKC4uLnBhcnRzKXtcbiAgICBsZXQgc29uZyA9IHRoaXMuX3NvbmdcblxuICAgIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcblxuICAgICAgcGFydC5fdHJhY2sgPSB0aGlzXG4gICAgICB0aGlzLl9wYXJ0cy5wdXNoKHBhcnQpXG4gICAgICB0aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpXG5cbiAgICAgIGxldCBldmVudHMgPSBwYXJ0Ll9ldmVudHNcbiAgICAgIHRoaXMuX2V2ZW50cy5wdXNoKC4uLmV2ZW50cylcblxuICAgICAgaWYoc29uZyl7XG4gICAgICAgIHBhcnQuX3NvbmcgPSBzb25nXG4gICAgICAgIHNvbmcuX25ld1BhcnRzLnB1c2gocGFydClcbiAgICAgICAgc29uZy5fbmV3RXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdGhpc1xuICAgICAgICBpZihzb25nKXtcbiAgICAgICAgICBldmVudC5fc29uZyA9IHNvbmdcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICByZW1vdmVQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG5cbiAgICBwYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0Ll90cmFjayA9IG51bGxcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCwgcGFydClcblxuICAgICAgbGV0IGV2ZW50cyA9IHBhcnQuX2V2ZW50c1xuXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgc29uZy5fcmVtb3ZlZFBhcnRzLnB1c2gocGFydClcbiAgICAgICAgc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIH1cblxuICAgICAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgICBldmVudC5fdHJhY2sgPSBudWxsXG4gICAgICAgIGlmKHNvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkLCBldmVudClcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZVxuICB9XG5cbiAgZ2V0UGFydHMoKXtcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSl7XG4gICAgICB0aGlzLl9wYXJ0cyA9IEFycmF5LmZyb20odGhpcy5fcGFydHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX3BhcnRzXVxuICB9XG5cblxuICB0cmFuc3Bvc2VQYXJ0cyhhbW91bnQ6IG51bWJlciwgLi4ucGFydHMpe1xuICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBwYXJ0LnRyYW5zcG9zZShhbW91bnQpXG4gICAgfSlcbiAgfVxuXG4gIG1vdmVQYXJ0cyh0aWNrczogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQubW92ZSh0aWNrcylcbiAgICB9KVxuICB9XG5cbiAgbW92ZVBhcnRzVG8odGlja3M6IG51bWJlciwgLi4ucGFydHMpe1xuICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBwYXJ0Lm1vdmVUbyh0aWNrcylcbiAgICB9KVxuICB9XG4vKlxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0KClcbiAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgdGhpcy5hZGRQYXJ0cyhwKVxuICB9XG4qL1xuICByZW1vdmVFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcGFydHMgPSBuZXcgU2V0KClcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIHBhcnRzLnNldChldmVudC5fcGFydClcbiAgICAgIGV2ZW50Ll9wYXJ0ID0gbnVsbFxuICAgICAgZXZlbnQuX3RyYWNrID0gbnVsbFxuICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHModGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBsZXQgcGFydHMgPSBuZXcgU2V0KClcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCguLi5BcnJheS5mcm9tKHBhcnRzLmVudHJpZXMoKSkpXG4gICAgfVxuICB9XG5cbiAgbW92ZUV2ZW50c1RvKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlVG8odGlja3MpXG4gICAgICBwYXJ0cy5zZXQoZXZlbnQucGFydClcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCguLi5BcnJheS5mcm9tKHBhcnRzLmVudHJpZXMoKSkpXG4gICAgfVxuICB9XG5cbiAgZ2V0RXZlbnRzKGZpbHRlcjogc3RyaW5nW10gPSBudWxsKXsgLy8gY2FuIGJlIHVzZSBhcyBmaW5kRXZlbnRzXG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c10gLy9AVE9ETyBpbXBsZW1lbnQgZmlsdGVyIC0+IGZpbHRlckV2ZW50cygpIHNob3VsZCBiZSBhIHV0aWxpdHkgZnVuY3Rpb24gKG5vdCBhIGNsYXNzIG1ldGhvZClcbiAgfVxuXG4gIG11dGUoZmxhZzogYm9vbGVhbiA9IG51bGwpe1xuICAgIGlmKGZsYWcpe1xuICAgICAgdGhpcy5fbXV0ZWQgPSBmbGFnXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9tdXRlZCA9ICF0aGlzLl9tdXRlZFxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSgpeyAvLyB5b3Ugc2hvdWxkIG9ubHkgdXNlIHRoaXMgaW4gaHVnZSBzb25ncyAoPjEwMCB0cmFja3MpXG4gICAgaWYodGhpcy5fY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB9XG4gICAgc29ydEV2ZW50cyh0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZVxuICB9XG5cbiAgLypcbiAgICByb3V0aW5nOiBzYW1wbGUgc291cmNlIC0+IHBhbm5lciAtPiBnYWluIC0+IFsuLi5meF0gLT4gc29uZyBvdXRwdXRcbiAgICBAVE9ETzogbmVlZHMgc29tZSByZXRoaW5raW5nIVxuICAqL1xuICBjb25uZWN0KHNvbmdPdXRwdXQpe1xuICAgIHRoaXMuX3NvbmdPdXRwdXQgPSBzb25nT3V0cHV0XG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3QodGhpcy5fc29uZ091dHB1dClcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKXtcbiAgICB0aGlzLl9vdXRwdXQuZGlzY29ubmVjdCh0aGlzLl9zb25nT3V0cHV0KVxuICAgIHRoaXMuX3NvbmdPdXRwdXQgPSBudWxsXG4gIH1cblxuICBfY2hlY2tFZmZlY3QoZWZmZWN0KXtcbiAgICBpZih0eXBlb2YgZWZmZWN0LnNldElucHV0ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlZmZlY3Quc2V0T3V0cHV0ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlZmZlY3QuZ2V0T3V0cHV0ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlZmZlY3QuZGlzY29ubmVjdCAhPT0gJ2Z1bmN0aW9uJyl7XG4gICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBjaGFubmVsIGZ4LCBhbmQgY2hhbm5lbCBmeCBzaG91bGQgaGF2ZSB0aGUgbWV0aG9kcyBcInNldElucHV0XCIsIFwic2V0T3V0cHV0XCIsIFwiZ2V0T3V0cHV0XCIgYW5kIFwiZGlzY29ubmVjdFwiJylcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gcm91dGluZzogYXVkaW9zb3VyY2UgLT4gcGFubmluZyAtPiB0cmFjayBvdXRwdXQgLT4gZWZmZWN0IC0+IHNvbmcgaW5wdXRcbiAgYWRkRWZmZWN0KGVmZmVjdCl7XG5cbiAgICAvL0BUT0RPOiBhZGQgZnggcmFjayAoY3VycmVudGx5IG9ubHkgMSBmeCBjYW4gYmUgYWRkZWQpXG5cbiAgICB0aGlzLl9vdXRwdXQuZGlzY29ubmVjdCh0aGlzLl9zb25nT3V0cHV0KVxuICAgIHRoaXMuX291dHB1dC5jb25uZWN0KGVmZmVjdC5pbnB1dClcbiAgICBlZmZlY3Qub3V0cHV0LmNvbm5lY3QodGhpcy5fc29uZ091dHB1dClcblxuICAgIC8vIGlmKHRoaXMuX2NoZWNrRWZmZWN0KGVmZmVjdCkgPT09IGZhbHNlKXtcbiAgICAvLyAgIHJldHVyblxuICAgIC8vIH1cbiAgICAvLyBsZXQgbnVtRlggPSB0aGlzLl9lZmZlY3RzLmxlbmd0aFxuICAgIC8vIGxldCBsYXN0RlhcbiAgICAvLyBsZXQgb3V0cHV0XG4gICAgLy8gaWYobnVtRlggPT09IDApe1xuICAgIC8vICAgbGFzdEZYID0gdGhpcy5fb3V0cHV0XG4gICAgLy8gICBsYXN0RlguZGlzY29ubmVjdCh0aGlzLl9zb25nT3V0cHV0KVxuICAgIC8vICAgb3V0cHV0ID0gdGhpcy5fb3V0cHV0XG4gICAgLy8gfWVsc2V7XG4gICAgLy8gICBsYXN0RlggPSB0aGlzLl9lZmZlY3RzW251bUZYIC0gMV1cbiAgICAvLyAgIGxhc3RGWC5kaXNjb25uZWN0KClcbiAgICAvLyAgIG91dHB1dCA9IGxhc3RGWC5nZXRPdXRwdXQoKVxuICAgIC8vIH1cblxuICAgIC8vIGVmZmVjdC5zZXRJbnB1dChvdXRwdXQpXG4gICAgLy8gZWZmZWN0LnNldE91dHB1dCh0aGlzLl9zb25nT3V0cHV0KVxuXG4gICAgLy8gdGhpcy5fZWZmZWN0cy5wdXNoKGVmZmVjdClcbiAgfVxuXG4gIGFkZEVmZmVjdEF0KGVmZmVjdCwgaW5kZXg6IG51bWJlcil7XG4gICAgaWYodGhpcy5fY2hlY2tFZmZlY3QoZWZmZWN0KSA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX2VmZmVjdHMuc3BsaWNlKGluZGV4LCAwLCBlZmZlY3QpXG4gIH1cblxuICAvL3JlbW92ZUVmZmVjdChpbmRleDogbnVtYmVyKXtcbiAgcmVtb3ZlRWZmZWN0KGVmZmVjdCl7XG4gICAgdGhpcy5fb3V0cHV0LmRpc2Nvbm5lY3QoZWZmZWN0LmlucHV0KVxuICAgIHRyeXtcbiAgICAgIGVmZmVjdC5vdXRwdXQuZGlzY29ubmVjdCh0aGlzLl9zb25nT3V0cHV0KVxuICAgIH1jYXRjaChlKXtcbiAgICAgIC8vIENocm9tZSB0aHJvd3MgYW4gZXJyb3IgaGVyZSwgd2hpY2ggaXMgd3JvbmdcbiAgICB9XG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3QodGhpcy5fc29uZ091dHB1dClcblxuICAgIC8vIGlmKGlzTmFOKGluZGV4KSl7XG4gICAgLy8gICByZXR1cm5cbiAgICAvLyB9XG4gICAgLy8gdGhpcy5fZWZmZWN0cy5mb3JFYWNoKGZ4ID0+IHtcbiAgICAvLyAgIGZ4LmRpc2Nvbm5lY3QoKVxuICAgIC8vIH0pXG4gICAgLy8gdGhpcy5fZWZmZWN0cy5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICAvLyBsZXQgbnVtRlggPSB0aGlzLl9lZmZlY3RzLmxlbmd0aFxuXG4gICAgLy8gaWYobnVtRlggPT09IDApe1xuICAgIC8vICAgdGhpcy5fb3V0cHV0LmNvbm5lY3QodGhpcy5fc29uZ091dHB1dClcbiAgICAvLyAgIHJldHVyblxuICAgIC8vIH1cblxuICAgIC8vIGxldCBsYXN0RlggPSB0aGlzLl9vdXRwdXRcbiAgICAvLyB0aGlzLl9lZmZlY3RzLmZvckVhY2goKGZ4LCBpKSA9PiB7XG4gICAgLy8gICBmeC5zZXRJbnB1dChsYXN0RlgpXG4gICAgLy8gICBpZihpID09PSBudW1GWCAtIDEpe1xuICAgIC8vICAgICBmeC5zZXRPdXRwdXQodGhpcy5fc29uZ091dHB1dClcbiAgICAvLyAgIH1lbHNle1xuICAgIC8vICAgICBmeC5zZXRPdXRwdXQodGhpcy5fZWZmZWN0c1tpICsgMV0pXG4gICAgLy8gICB9XG4gICAgLy8gICBsYXN0RlggPSBmeFxuICAgIC8vIH0pXG4gIH1cblxuICBnZXRFZmZlY3RzKCl7XG4gICAgcmV0dXJuIHRoaXMuX2VmZmVjdHNcbiAgfVxuXG4gIGdldEVmZmVjdEF0KGluZGV4OiBudW1iZXIpe1xuICAgIGlmKGlzTmFOKGluZGV4KSl7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZWZmZWN0c1tpbmRleF1cbiAgfVxuXG4gIGdldE91dHB1dCgpe1xuICAgIHJldHVybiB0aGlzLl9vdXRwdXRcbiAgfVxuXG4gIGdldElucHV0KCl7XG4gICAgcmV0dXJuIHRoaXMuX3NvbmdPdXRwdXRcbiAgfVxuXG4gIC8vIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiBhIE1JREkgZXZlbnRzIGlzIHNlbmQgYnkgYW4gZXh0ZXJuYWwgb3Igb24tc2NyZWVuIGtleWJvYXJkXG4gIF9wcmVwcm9jZXNzTUlESUV2ZW50KG1pZGlFdmVudCl7XG4gICAgbGV0IHRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuICAgIG1pZGlFdmVudC50aW1lID0gdGltZVxuICAgIG1pZGlFdmVudC50aW1lMiA9IDAvL3BlcmZvcm1hbmNlLm5vdygpIC0+IHBhc3NpbmcgMCBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzIHBlcmZvcm1hbmNlLm5vdygpIHNvIHdlIGNob29zZSB0aGUgZm9ybWVyXG4gICAgbWlkaUV2ZW50LnJlY29yZE1pbGxpcyA9IHRpbWVcbiAgICBsZXQgbm90ZVxuXG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT04pe1xuICAgICAgbm90ZSA9IG5ldyBNSURJTm90ZShtaWRpRXZlbnQpXG4gICAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLnNldChtaWRpRXZlbnQuZGF0YTEsIG5vdGUpXG4gICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgdHlwZTogJ25vdGVPbicsXG4gICAgICAgIGRhdGE6IG1pZGlFdmVudFxuICAgICAgfSlcbiAgICB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuTk9URV9PRkYpe1xuICAgICAgbm90ZSA9IHRoaXMuX3RtcFJlY29yZGVkTm90ZXMuZ2V0KG1pZGlFdmVudC5kYXRhMSlcbiAgICAgIGlmKHR5cGVvZiBub3RlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgbm90ZS5hZGROb3RlT2ZmKG1pZGlFdmVudClcbiAgICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMuZGVsZXRlKG1pZGlFdmVudC5kYXRhMSlcbiAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICB0eXBlOiAnbm90ZU9mZicsXG4gICAgICAgIGRhdGE6IG1pZGlFdmVudFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZih0aGlzLl9yZWNvcmRFbmFibGVkID09PSAnbWlkaScgJiYgdGhpcy5fc29uZy5yZWNvcmRpbmcgPT09IHRydWUpe1xuICAgICAgdGhpcy5fcmVjb3JkZWRFdmVudHMucHVzaChtaWRpRXZlbnQpXG4gICAgfVxuICAgIHRoaXMucHJvY2Vzc01JRElFdmVudChtaWRpRXZlbnQpXG4gIH1cblxuICAvLyBtZXRob2QgaXMgY2FsbGVkIGJ5IHNjaGVkdWxlciBkdXJpbmcgcGxheWJhY2tcbiAgcHJvY2Vzc01JRElFdmVudChldmVudCl7XG5cbiAgICBpZih0eXBlb2YgZXZlbnQudGltZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy5fcHJlcHJvY2Vzc01JRElFdmVudChldmVudClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIHNlbmQgdG8gamF2YXNjcmlwdCBpbnN0cnVtZW50XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMubmFtZSwgZXZlbnQpXG4gICAgICB0aGlzLl9pbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQoZXZlbnQpXG4gICAgfVxuXG4gICAgLy8gc2VuZCB0byBleHRlcm5hbCBoYXJkd2FyZSBvciBzb2Z0d2FyZSBpbnN0cnVtZW50XG4gICAgdGhpcy5fc2VuZFRvRXh0ZXJuYWxNSURJT3V0cHV0cyhldmVudClcbiAgfVxuXG4gIF9zZW5kVG9FeHRlcm5hbE1JRElPdXRwdXRzKGV2ZW50KXtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnRpbWUsIGV2ZW50Lm1pbGxpcylcbiAgICBmb3IobGV0IHBvcnQgb2YgdGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpe1xuICAgICAgaWYocG9ydCl7XG4gICAgICAgIGlmKGV2ZW50LmRhdGEyICE9PSAtMSl7XG4gICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCBldmVudC50aW1lMilcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMV0sIGV2ZW50LnRpbWUyKVxuICAgICAgICB9XG4gICAgICAgIC8vIGlmKGV2ZW50LnR5cGUgPT09IDEyOCB8fCBldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgICAgLy8gICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMl0sIGV2ZW50LnRpbWUgKyBsYXRlbmN5KVxuICAgICAgICAvLyB9ZWxzZSBpZihldmVudC50eXBlID09PSAxOTIgfHwgZXZlbnQudHlwZSA9PT0gMjI0KXtcbiAgICAgICAgLy8gICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUsIGV2ZW50LmRhdGExXSwgZXZlbnQudGltZSArIGxhdGVuY3kpXG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1bnNjaGVkdWxlKG1pZGlFdmVudCl7XG5cbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQudW5zY2hlZHVsZShtaWRpRXZlbnQpXG4gICAgfVxuXG4gICAgaWYodGhpcy5fbWlkaU91dHB1dHMuc2l6ZSA9PT0gMCl7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIGxldCBtaWRpTm90ZSA9IG1pZGlFdmVudC5taWRpTm90ZVxuICAgICAgbGV0IG5vdGVPZmYgPSBuZXcgTUlESUV2ZW50KDAsIDEyOCwgbWlkaUV2ZW50LmRhdGExLCAwKVxuICAgICAgbm90ZU9mZi5taWRpTm90ZUlkID0gbWlkaU5vdGUuaWRcbiAgICAgIG5vdGVPZmYudGltZSA9IGNvbnRleHQuY3VycmVudFRpbWVcbiAgICAgIHRoaXMuX3NlbmRUb0V4dGVybmFsTUlESU91dHB1dHMobm90ZU9mZiwgdHJ1ZSlcbiAgICB9XG4gIH1cblxuICBhbGxOb3Rlc09mZigpe1xuICAgIGlmKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpe1xuICAgICAgdGhpcy5faW5zdHJ1bWVudC5hbGxOb3Rlc09mZigpXG4gICAgfVxuXG4gICAgLy8gbGV0IHRpbWVTdGFtcCA9IChjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMCkgKyB0aGlzLmxhdGVuY3lcbiAgICAvLyBmb3IobGV0IG91dHB1dCBvZiB0aGlzLl9taWRpT3V0cHV0cy52YWx1ZXMoKSl7XG4gICAgLy8gICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWVTdGFtcCkgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICAvLyAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZVN0YW1wKSAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgICAvLyB9XG4gIH1cblxuICBzZXRQYW5uaW5nKHZhbHVlKXtcbiAgICBpZih2YWx1ZSA8IC0xIHx8IHZhbHVlID4gMSl7XG4gICAgICBjb25zb2xlLmxvZygnVHJhY2suc2V0UGFubmluZygpIGFjY2VwdHMgYSB2YWx1ZSBiZXR3ZWVuIC0xIChmdWxsIGxlZnQpIGFuZCAxIChmdWxsIHJpZ2h0KSwgeW91IGVudGVyZWQ6JywgdmFsdWUpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IHggPSB2YWx1ZVxuICAgIGxldCB5ID0gMFxuICAgIGxldCB6ID0gMSAtIE1hdGguYWJzKHgpXG5cbiAgICB4ID0geCA9PT0gMCA/IHplcm9WYWx1ZSA6IHhcbiAgICB5ID0geSA9PT0gMCA/IHplcm9WYWx1ZSA6IHlcbiAgICB6ID0geiA9PT0gMCA/IHplcm9WYWx1ZSA6IHpcblxuICAgIHRoaXMuX3Bhbm5lci5zZXRQb3NpdGlvbih4LCB5LCB6KVxuICAgIHRoaXMuX3Bhbm5pbmdWYWx1ZSA9IHZhbHVlXG4gIH1cblxuICBnZXRQYW5uaW5nKCl7XG4gICAgcmV0dXJuIHRoaXMuX3Bhbm5pbmdWYWx1ZVxuICB9XG5cbn1cbiIsImltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuXG5jb25zdFxuICBtUEkgPSBNYXRoLlBJLFxuICBtUG93ID0gTWF0aC5wb3csXG4gIG1Sb3VuZCA9IE1hdGgucm91bmQsXG4gIG1GbG9vciA9IE1hdGguZmxvb3IsXG4gIG1SYW5kb20gPSBNYXRoLnJhbmRvbVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROaWNlVGltZShtaWxsaXMpe1xuICBsZXQgaCwgbSwgcywgbXMsXG4gICAgc2Vjb25kcyxcbiAgICB0aW1lQXNTdHJpbmcgPSAnJztcblxuICBzZWNvbmRzID0gbWlsbGlzIC8gMTAwMDsgLy8g4oaSIG1pbGxpcyB0byBzZWNvbmRzXG4gIGggPSBtRmxvb3Ioc2Vjb25kcyAvICg2MCAqIDYwKSk7XG4gIG0gPSBtRmxvb3IoKHNlY29uZHMgJSAoNjAgKiA2MCkpIC8gNjApO1xuICBzID0gbUZsb29yKHNlY29uZHMgJSAoNjApKTtcbiAgbXMgPSBtUm91bmQoKHNlY29uZHMgLSAoaCAqIDM2MDApIC0gKG0gKiA2MCkgLSBzKSAqIDEwMDApO1xuXG4gIHRpbWVBc1N0cmluZyArPSBoICsgJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbSA8IDEwID8gJzAnICsgbSA6IG07XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBzIDwgMTAgPyAnMCcgKyBzIDogcztcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG1zID09PSAwID8gJzAwMCcgOiBtcyA8IDEwID8gJzAwJyArIG1zIDogbXMgPCAxMDAgPyAnMCcgKyBtcyA6IG1zO1xuXG4gIC8vY29uc29sZS5sb2coaCwgbSwgcywgbXMpO1xuICByZXR1cm4ge1xuICAgIGhvdXI6IGgsXG4gICAgbWludXRlOiBtLFxuICAgIHNlY29uZDogcyxcbiAgICBtaWxsaXNlY29uZDogbXMsXG4gICAgdGltZUFzU3RyaW5nOiB0aW1lQXNTdHJpbmcsXG4gICAgdGltZUFzQXJyYXk6IFtoLCBtLCBzLCBtc11cbiAgfTtcbn1cblxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CaW5hcnkoaW5wdXQpe1xuICBsZXQga2V5U3RyID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JyxcbiAgICBieXRlcywgdWFycmF5LCBidWZmZXIsXG4gICAgbGtleTEsIGxrZXkyLFxuICAgIGNocjEsIGNocjIsIGNocjMsXG4gICAgZW5jMSwgZW5jMiwgZW5jMywgZW5jNCxcbiAgICBpLCBqID0gMDtcblxuICBieXRlcyA9IE1hdGguY2VpbCgoMyAqIGlucHV0Lmxlbmd0aCkgLyA0LjApO1xuICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXMpO1xuICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gIGxrZXkxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aCAtIDEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBpZihsa2V5MSA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG4gIGlmKGxrZXkyID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcblxuICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXFw9XS9nLCAnJyk7XG5cbiAgZm9yKGkgPSAwOyBpIDwgYnl0ZXM7IGkgKz0gMykge1xuICAgIC8vZ2V0IHRoZSAzIG9jdGVjdHMgaW4gNCBhc2NpaSBjaGFyc1xuICAgIGVuYzEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMzID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzQgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cbiAgICBjaHIxID0gKGVuYzEgPDwgMikgfCAoZW5jMiA+PiA0KTtcbiAgICBjaHIyID0gKChlbmMyICYgMTUpIDw8IDQpIHwgKGVuYzMgPj4gMik7XG4gICAgY2hyMyA9ICgoZW5jMyAmIDMpIDw8IDYpIHwgZW5jNDtcblxuICAgIHVhcnJheVtpXSA9IGNocjE7XG4gICAgaWYoZW5jMyAhPSA2NCkgdWFycmF5W2krMV0gPSBjaHIyO1xuICAgIGlmKGVuYzQgIT0gNjQpIHVhcnJheVtpKzJdID0gY2hyMztcbiAgfVxuICAvL2NvbnNvbGUubG9nKGJ1ZmZlcik7XG4gIHJldHVybiBidWZmZXI7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVTdHJpbmcobyl7XG4gIGlmKHR5cGVvZiBvICE9ICdvYmplY3QnKXtcbiAgICByZXR1cm4gdHlwZW9mIG87XG4gIH1cblxuICBpZihvID09PSBudWxsKXtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG5cbiAgLy9vYmplY3QsIGFycmF5LCBmdW5jdGlvbiwgZGF0ZSwgcmVnZXhwLCBzdHJpbmcsIG51bWJlciwgYm9vbGVhbiwgZXJyb3JcbiAgbGV0IGludGVybmFsQ2xhc3MgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdFxccyhcXHcrKVxcXS8pWzFdO1xuICByZXR1cm4gaW50ZXJuYWxDbGFzcy50b0xvd2VyQ2FzZSgpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzb3J0RXZlbnRzKGV2ZW50cyl7XG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgbGV0IHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgIHIgPSAtMVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJcbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmQmFzZTY0KGRhdGEpe1xuICBsZXQgcGFzc2VkID0gdHJ1ZTtcbiAgdHJ5e1xuICAgIGF0b2IoZGF0YSk7XG4gIH1jYXRjaChlKXtcbiAgICBwYXNzZWQgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gcGFzc2VkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXF1YWxQb3dlckN1cnZlKG51bVN0ZXBzLCB0eXBlLCBtYXhWYWx1ZSkge1xuICBsZXQgaSwgdmFsdWUsIHBlcmNlbnQsXG4gICAgdmFsdWVzID0gbmV3IEZsb2F0MzJBcnJheShudW1TdGVwcylcblxuICBmb3IoaSA9IDA7IGkgPCBudW1TdGVwczsgaSsrKXtcbiAgICBwZXJjZW50ID0gaSAvIG51bVN0ZXBzXG4gICAgaWYodHlwZSA9PT0gJ2ZhZGVJbicpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcygoMS4wIC0gcGVyY2VudCkgKiAwLjUgKiBtUEkpICogbWF4VmFsdWVcbiAgICB9ZWxzZSBpZih0eXBlID09PSAnZmFkZU91dCcpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcyhwZXJjZW50ICogMC41ICogTWF0aC5QSSkgKiBtYXhWYWx1ZVxuICAgIH1cbiAgICB2YWx1ZXNbaV0gPSB2YWx1ZVxuICAgIGlmKGkgPT09IG51bVN0ZXBzIC0gMSl7XG4gICAgICB2YWx1ZXNbaV0gPSB0eXBlID09PSAnZmFkZUluJyA/IDEgOiAwXG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tNSURJTnVtYmVyKHZhbHVlKXtcbiAgLy9jb25zb2xlLmxvZyh2YWx1ZSk7XG4gIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZih2YWx1ZSA8IDAgfHwgdmFsdWUgPiAxMjcpe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxMjcnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5cbi8qXG4vL29sZCBzY2hvb2wgYWpheFxuXG5leHBvcnQgZnVuY3Rpb24gYWpheChjb25maWcpe1xuICBsZXRcbiAgICByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgbWV0aG9kID0gdHlwZW9mIGNvbmZpZy5tZXRob2QgPT09ICd1bmRlZmluZWQnID8gJ0dFVCcgOiBjb25maWcubWV0aG9kLFxuICAgIGZpbGVTaXplO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICByZWplY3QgPSByZWplY3QgfHwgZnVuY3Rpb24oKXt9O1xuICAgIHJlc29sdmUgPSByZXNvbHZlIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApe1xuICAgICAgICByZWplY3QocmVxdWVzdC5zdGF0dXMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgIGZpbGVTaXplID0gcmVxdWVzdC5yZXNwb25zZS5sZW5ndGg7XG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSwgZmlsZVNpemUpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICBjb25maWcub25FcnJvcihlKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgY29uZmlnLnVybCwgdHJ1ZSk7XG5cbiAgICBpZihjb25maWcub3ZlcnJpZGVNaW1lVHlwZSl7XG4gICAgICByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUpe1xuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKG1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcuZGF0YSl7XG4gICAgICByZXF1ZXN0LnNlbmQoY29uZmlnLmRhdGEpO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cbiovIl19
