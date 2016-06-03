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

// use "from 'qambi'" in your own code! so without the extra "../../"

document.addEventListener('DOMContentLoaded', function () {

  _qambi2.default.init().then(function () {

    var song = new _qambi.Song({
      bars: 1,
      tracks: [new _qambi.Track({
        parts: [new _qambi.Part({
          events: [new _qambi.MIDIEvent(960 * 0, 144, 60, 100), new _qambi.MIDIEvent(960 * 1, 128, 60, 0), new _qambi.MIDIEvent(960 * 1, 144, 62, 100), new _qambi.MIDIEvent(960 * 2, 128, 62, 0), new _qambi.MIDIEvent(960 * 2, 144, 64, 100), new _qambi.MIDIEvent(960 * 3, 128, 64, 0), new _qambi.MIDIEvent(960 * 3, 144, 65, 100), new _qambi.MIDIEvent(960 * 4, 128, 65, 0), new _qambi.MIDIEvent(960 * 4, 144, 67, 100), new _qambi.MIDIEvent(960 * 6, 128, 67, 0)]
        })],
        instrument: new _qambi.SimpleSynth('sine')
      })],
      useMetronome: true
    });

    song.play();
  });
});

},{"../../src/qambi":33}],3:[function(require,module,exports){
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

},{"isomorphic-fetch":4}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZmlsZXNhdmVyanMvRmlsZVNhdmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtZmV0Y2gvZmV0Y2gtbnBtLWJyb3dzZXJpZnkuanMiLCIuLi9ub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9qYXp6X2luc3RhbmNlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3QvbWlkaV9hY2Nlc3MuanMiLCIuLi9ub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9taWRpX2lucHV0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3QvbWlkaV9vdXRwdXQuanMiLCIuLi9ub2RlX21vZHVsZXMvd2VibWlkaWFwaXNoaW0vZGlzdC9taWRpY29ubmVjdGlvbl9ldmVudC5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L21pZGltZXNzYWdlX2V2ZW50LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYm1pZGlhcGlzaGltL2Rpc3Qvc2hpbS5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWJtaWRpYXBpc2hpbS9kaXN0L3V0aWwuanMiLCIuLi9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwiLi4vc3JjL2NvbnN0YW50cy5qcyIsIi4uL3NyYy9jb252b2x1dGlvbl9yZXZlcmIuanMiLCIuLi9zcmMvZXZlbnRsaXN0ZW5lci5qcyIsIi4uL3NyYy9mZXRjaF9oZWxwZXJzLmpzIiwiLi4vc3JjL2luaXQuanMiLCIuLi9zcmMvaW5pdF9hdWRpby5qcyIsIi4uL3NyYy9pbml0X21pZGkuanMiLCIuLi9zcmMvaW5zdHJ1bWVudC5qcyIsIi4uL3NyYy9tZXRyb25vbWUuanMiLCIuLi9zcmMvbWlkaV9ldmVudC5qcyIsIi4uL3NyYy9taWRpX25vdGUuanMiLCIuLi9zcmMvbWlkaV9zdHJlYW0uanMiLCIuLi9zcmMvbWlkaWZpbGUuanMiLCIuLi9zcmMvbm90ZS5qcyIsIi4uL3NyYy9wYXJzZV9hdWRpby5qcyIsIi4uL3NyYy9wYXJzZV9ldmVudHMuanMiLCIuLi9zcmMvcGFydC5qcyIsIi4uL3NyYy9wbGF5aGVhZC5qcyIsIi4uL3NyYy9wb3NpdGlvbi5qcyIsIi4uL3NyYy9xYW1iaS5qcyIsIi4uL3NyYy9zYW1wbGUuanMiLCIuLi9zcmMvc2FtcGxlX2J1ZmZlci5qcyIsIi4uL3NyYy9zYW1wbGVfb3NjaWxsYXRvci5qcyIsIi4uL3NyYy9zYW1wbGVyLmpzIiwiLi4vc3JjL3NhbXBsZXMuanMiLCIuLi9zcmMvc2F2ZV9taWRpZmlsZS5qcyIsIi4uL3NyYy9zY2hlZHVsZXIuanMiLCIuLi9zcmMvc2V0dGluZ3MuanMiLCIuLi9zcmMvc2ltcGxlX3N5bnRoLmpzIiwiLi4vc3JjL3NvbmcuanMiLCIuLi9zcmMvc29uZy51cGRhdGUuanMiLCIuLi9zcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwiLi4vc3JjL3RyYWNrLmpzIiwiLi4vc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QixRQUE1QixFQUFzQyxJQUF0QyxFQUE0QyxRQUE1QyxFQUFzRDtBQUMzRCxNQUFJLFVBQUo7TUFBTyxjQUFQO01BQWMsZ0JBQWQ7TUFDRSxTQUFTLElBQUksWUFBSixDQUFpQixRQUFqQixDQURYOztBQUdBLE9BQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxRQUFmLEVBQXlCLEdBQXpCLEVBQTZCO0FBQzNCLGNBQVUsSUFBSSxRQUFkO0FBQ0EsUUFBRyxTQUFTLFFBQVosRUFBcUI7QUFDbkIsY0FBUSxLQUFLLEdBQUwsQ0FBUyxDQUFDLE1BQU0sT0FBUCxJQUFrQixHQUFsQixHQUF3QixHQUFqQyxJQUF3QyxRQUFoRDtBQUNELEtBRkQsTUFFTSxJQUFHLFNBQVMsU0FBWixFQUFzQjtBQUMxQixjQUFRLEtBQUssR0FBTCxDQUFTLFVBQVUsR0FBVixHQUFnQixLQUFLLEVBQTlCLElBQW9DLFFBQTVDO0FBQ0Q7QUFDRCxXQUFPLENBQVAsSUFBWSxLQUFaO0FBQ0EsUUFBRyxNQUFNLFdBQVcsQ0FBcEIsRUFBc0I7QUFDcEIsYUFBTyxDQUFQLElBQVksU0FBUyxRQUFULEdBQW9CLENBQXBCLEdBQXdCLENBQXBDO0FBQ0Q7QUFDRjtBQUNELFNBQU8sTUFBUDtBQUNEOztBQUdNLFNBQVMsZUFBVCxDQUF5QixLQUF6QixFQUErQjs7QUFFcEMsTUFBRyxNQUFNLEtBQU4sQ0FBSCxFQUFnQjtBQUNkLFlBQVEsSUFBUixDQUFhLHlCQUFiO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7QUFDRCxNQUFHLFFBQVEsQ0FBUixJQUFhLFFBQVEsR0FBeEIsRUFBNEI7QUFDMUIsWUFBUSxJQUFSLENBQWEsMkNBQWI7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNELFNBQU8sS0FBUDtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiaW1wb3J0IHFhbWJpLCB7XG4gIFNpbXBsZVN5bnRoLFxuICBNSURJRXZlbnQsXG4gIFNvbmcsXG4gIFRyYWNrLFxuICBQYXJ0LFxufSBmcm9tICcuLi8uLi9zcmMvcWFtYmknIC8vIHVzZSBcImZyb20gJ3FhbWJpJ1wiIGluIHlvdXIgb3duIGNvZGUhIHNvIHdpdGhvdXQgdGhlIGV4dHJhIFwiLi4vLi4vXCJcblxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblxuICBxYW1iaS5pbml0KClcbiAgLnRoZW4oKCkgPT4ge1xuXG4gICAgbGV0IHNvbmcgPSBuZXcgU29uZyh7XG4gICAgICBiYXJzOiAxLFxuICAgICAgdHJhY2tzOiBbXG4gICAgICAgIG5ldyBUcmFjayh7XG4gICAgICAgICAgcGFydHM6IFtcbiAgICAgICAgICAgIG5ldyBQYXJ0KHtcbiAgICAgICAgICAgICAgZXZlbnRzOiBbXG4gICAgICAgICAgICAgICAgbmV3IE1JRElFdmVudCg5NjAgKiAwLCAxNDQsIDYwLCAxMDApLFxuICAgICAgICAgICAgICAgIG5ldyBNSURJRXZlbnQoOTYwICogMSwgMTI4LCA2MCwgMCksXG4gICAgICAgICAgICAgICAgbmV3IE1JRElFdmVudCg5NjAgKiAxLCAxNDQsIDYyLCAxMDApLFxuICAgICAgICAgICAgICAgIG5ldyBNSURJRXZlbnQoOTYwICogMiwgMTI4LCA2MiwgMCksXG4gICAgICAgICAgICAgICAgbmV3IE1JRElFdmVudCg5NjAgKiAyLCAxNDQsIDY0LCAxMDApLFxuICAgICAgICAgICAgICAgIG5ldyBNSURJRXZlbnQoOTYwICogMywgMTI4LCA2NCwgMCksXG4gICAgICAgICAgICAgICAgbmV3IE1JRElFdmVudCg5NjAgKiAzLCAxNDQsIDY1LCAxMDApLFxuICAgICAgICAgICAgICAgIG5ldyBNSURJRXZlbnQoOTYwICogNCwgMTI4LCA2NSwgMCksXG4gICAgICAgICAgICAgICAgbmV3IE1JRElFdmVudCg5NjAgKiA0LCAxNDQsIDY3LCAxMDApLFxuICAgICAgICAgICAgICAgIG5ldyBNSURJRXZlbnQoOTYwICogNiwgMTI4LCA2NywgMCksXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXSxcbiAgICAgICAgICBpbnN0cnVtZW50OiBuZXcgU2ltcGxlU3ludGgoJ3NpbmUnKVxuICAgICAgICB9KVxuICAgICAgXSxcbiAgICAgIHVzZU1ldHJvbm9tZTogdHJ1ZVxuICAgIH0pXG5cbiAgICBzb25nLnBsYXkoKVxuICB9KVxufSlcbiIsIi8qIEZpbGVTYXZlci5qc1xuICogQSBzYXZlQXMoKSBGaWxlU2F2ZXIgaW1wbGVtZW50YXRpb24uXG4gKiAxLjEuMjAxNjAzMjhcbiAqXG4gKiBCeSBFbGkgR3JleSwgaHR0cDovL2VsaWdyZXkuY29tXG4gKiBMaWNlbnNlOiBNSVRcbiAqICAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbGlncmV5L0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4gKi9cblxuLypnbG9iYWwgc2VsZiAqL1xuLypqc2xpbnQgYml0d2lzZTogdHJ1ZSwgaW5kZW50OiA0LCBsYXhicmVhazogdHJ1ZSwgbGF4Y29tbWE6IHRydWUsIHNtYXJ0dGFiczogdHJ1ZSwgcGx1c3BsdXM6IHRydWUgKi9cblxuLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL0ZpbGVTYXZlci5qcy9ibG9iL21hc3Rlci9GaWxlU2F2ZXIuanMgKi9cblxudmFyIHNhdmVBcyA9IHNhdmVBcyB8fCAoZnVuY3Rpb24odmlldykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0Ly8gSUUgPDEwIGlzIGV4cGxpY2l0bHkgdW5zdXBwb3J0ZWRcblx0aWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgL01TSUUgWzEtOV1cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyXG5cdFx0ICBkb2MgPSB2aWV3LmRvY3VtZW50XG5cdFx0ICAvLyBvbmx5IGdldCBVUkwgd2hlbiBuZWNlc3NhcnkgaW4gY2FzZSBCbG9iLmpzIGhhc24ndCBvdmVycmlkZGVuIGl0IHlldFxuXHRcdCwgZ2V0X1VSTCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHZpZXcuVVJMIHx8IHZpZXcud2Via2l0VVJMIHx8IHZpZXc7XG5cdFx0fVxuXHRcdCwgc2F2ZV9saW5rID0gZG9jLmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIiwgXCJhXCIpXG5cdFx0LCBjYW5fdXNlX3NhdmVfbGluayA9IFwiZG93bmxvYWRcIiBpbiBzYXZlX2xpbmtcblx0XHQsIGNsaWNrID0gZnVuY3Rpb24obm9kZSkge1xuXHRcdFx0dmFyIGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKTtcblx0XHRcdG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG5cdFx0fVxuXHRcdCwgaXNfc2FmYXJpID0gL1ZlcnNpb25cXC9bXFxkXFwuXSsuKlNhZmFyaS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KVxuXHRcdCwgd2Via2l0X3JlcV9mcyA9IHZpZXcud2Via2l0UmVxdWVzdEZpbGVTeXN0ZW1cblx0XHQsIHJlcV9mcyA9IHZpZXcucmVxdWVzdEZpbGVTeXN0ZW0gfHwgd2Via2l0X3JlcV9mcyB8fCB2aWV3Lm1velJlcXVlc3RGaWxlU3lzdGVtXG5cdFx0LCB0aHJvd19vdXRzaWRlID0gZnVuY3Rpb24oZXgpIHtcblx0XHRcdCh2aWV3LnNldEltbWVkaWF0ZSB8fCB2aWV3LnNldFRpbWVvdXQpKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aHJvdyBleDtcblx0XHRcdH0sIDApO1xuXHRcdH1cblx0XHQsIGZvcmNlX3NhdmVhYmxlX3R5cGUgPSBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiXG5cdFx0LCBmc19taW5fc2l6ZSA9IDBcblx0XHQvLyB0aGUgQmxvYiBBUEkgaXMgZnVuZGFtZW50YWxseSBicm9rZW4gYXMgdGhlcmUgaXMgbm8gXCJkb3dubG9hZGZpbmlzaGVkXCIgZXZlbnQgdG8gc3Vic2NyaWJlIHRvXG5cdFx0LCBhcmJpdHJhcnlfcmV2b2tlX3RpbWVvdXQgPSAxMDAwICogNDAgLy8gaW4gbXNcblx0XHQsIHJldm9rZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdHZhciByZXZva2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHR9IGVsc2UgeyAvLyBmaWxlIGlzIGEgRmlsZVxuXHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHQvKiAvLyBUYWtlIG5vdGUgVzNDOlxuXHRcdFx0dmFyXG5cdFx0XHQgIHVyaSA9IHR5cGVvZiBmaWxlID09PSBcInN0cmluZ1wiID8gZmlsZSA6IGZpbGUudG9VUkwoKVxuXHRcdFx0LCByZXZva2VyID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdC8vIGlkZWFseSBEb3dubG9hZEZpbmlzaGVkRXZlbnQuZGF0YSB3b3VsZCBiZSB0aGUgVVJMIHJlcXVlc3RlZFxuXHRcdFx0XHRpZiAoZXZ0LmRhdGEgPT09IHVyaSkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIikgeyAvLyBmaWxlIGlzIGFuIG9iamVjdCBVUkxcblx0XHRcdFx0XHRcdGdldF9VUkwoKS5yZXZva2VPYmplY3RVUkwoZmlsZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHsgLy8gZmlsZSBpcyBhIEZpbGVcblx0XHRcdFx0XHRcdGZpbGUucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQ7XG5cdFx0XHR2aWV3LmFkZEV2ZW50TGlzdGVuZXIoXCJkb3dubG9hZGZpbmlzaGVkXCIsIHJldm9rZXIpO1xuXHRcdFx0Ki9cblx0XHRcdHNldFRpbWVvdXQocmV2b2tlciwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0KTtcblx0XHR9XG5cdFx0LCBkaXNwYXRjaCA9IGZ1bmN0aW9uKGZpbGVzYXZlciwgZXZlbnRfdHlwZXMsIGV2ZW50KSB7XG5cdFx0XHRldmVudF90eXBlcyA9IFtdLmNvbmNhdChldmVudF90eXBlcyk7XG5cdFx0XHR2YXIgaSA9IGV2ZW50X3R5cGVzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0dmFyIGxpc3RlbmVyID0gZmlsZXNhdmVyW1wib25cIiArIGV2ZW50X3R5cGVzW2ldXTtcblx0XHRcdFx0aWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGxpc3RlbmVyLmNhbGwoZmlsZXNhdmVyLCBldmVudCB8fCBmaWxlc2F2ZXIpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGV4KSB7XG5cdFx0XHRcdFx0XHR0aHJvd19vdXRzaWRlKGV4KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0LCBhdXRvX2JvbSA9IGZ1bmN0aW9uKGJsb2IpIHtcblx0XHRcdC8vIHByZXBlbmQgQk9NIGZvciBVVEYtOCBYTUwgYW5kIHRleHQvKiB0eXBlcyAoaW5jbHVkaW5nIEhUTUwpXG5cdFx0XHRpZiAoL15cXHMqKD86dGV4dFxcL1xcUyp8YXBwbGljYXRpb25cXC94bWx8XFxTKlxcL1xcUypcXCt4bWwpXFxzKjsuKmNoYXJzZXRcXHMqPVxccyp1dGYtOC9pLnRlc3QoYmxvYi50eXBlKSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IEJsb2IoW1wiXFx1ZmVmZlwiLCBibG9iXSwge3R5cGU6IGJsb2IudHlwZX0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGJsb2I7XG5cdFx0fVxuXHRcdCwgRmlsZVNhdmVyID0gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRmlyc3QgdHJ5IGEuZG93bmxvYWQsIHRoZW4gd2ViIGZpbGVzeXN0ZW0sIHRoZW4gb2JqZWN0IFVSTHNcblx0XHRcdHZhclxuXHRcdFx0XHQgIGZpbGVzYXZlciA9IHRoaXNcblx0XHRcdFx0LCB0eXBlID0gYmxvYi50eXBlXG5cdFx0XHRcdCwgYmxvYl9jaGFuZ2VkID0gZmFsc2Vcblx0XHRcdFx0LCBvYmplY3RfdXJsXG5cdFx0XHRcdCwgdGFyZ2V0X3ZpZXdcblx0XHRcdFx0LCBkaXNwYXRjaF9hbGwgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSB3cml0ZWVuZFwiLnNwbGl0KFwiIFwiKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gb24gYW55IGZpbGVzeXMgZXJyb3JzIHJldmVydCB0byBzYXZpbmcgd2l0aCBvYmplY3QgVVJMc1xuXHRcdFx0XHQsIGZzX2Vycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKHRhcmdldF92aWV3ICYmIGlzX3NhZmFyaSAmJiB0eXBlb2YgRmlsZVJlYWRlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRcdFx0Ly8gU2FmYXJpIGRvZXNuJ3QgYWxsb3cgZG93bmxvYWRpbmcgb2YgYmxvYiB1cmxzXG5cdFx0XHRcdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdFx0XHRcdHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0dmFyIGJhc2U2NERhdGEgPSByZWFkZXIucmVzdWx0O1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gXCJkYXRhOmF0dGFjaG1lbnQvZmlsZVwiICsgYmFzZTY0RGF0YS5zbGljZShiYXNlNjREYXRhLnNlYXJjaCgvWyw7XS8pKTtcblx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYik7XG5cdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5JTklUO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBkb24ndCBjcmVhdGUgbW9yZSBvYmplY3QgVVJMcyB0aGFuIG5lZWRlZFxuXHRcdFx0XHRcdGlmIChibG9iX2NoYW5nZWQgfHwgIW9iamVjdF91cmwpIHtcblx0XHRcdFx0XHRcdG9iamVjdF91cmwgPSBnZXRfVVJMKCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGFyZ2V0X3ZpZXcpIHtcblx0XHRcdFx0XHRcdHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgbmV3X3RhYiA9IHZpZXcub3BlbihvYmplY3RfdXJsLCBcIl9ibGFua1wiKTtcblx0XHRcdFx0XHRcdGlmIChuZXdfdGFiID09PSB1bmRlZmluZWQgJiYgaXNfc2FmYXJpKSB7XG5cdFx0XHRcdFx0XHRcdC8vQXBwbGUgZG8gbm90IGFsbG93IHdpbmRvdy5vcGVuLCBzZWUgaHR0cDovL2JpdC5seS8xa1pmZlJJXG5cdFx0XHRcdFx0XHRcdHZpZXcubG9jYXRpb24uaHJlZiA9IG9iamVjdF91cmxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRcdFx0XHRkaXNwYXRjaF9hbGwoKTtcblx0XHRcdFx0XHRyZXZva2Uob2JqZWN0X3VybCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0LCBhYm9ydGFibGUgPSBmdW5jdGlvbihmdW5jKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKGZpbGVzYXZlci5yZWFkeVN0YXRlICE9PSBmaWxlc2F2ZXIuRE9ORSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0LCBjcmVhdGVfaWZfbm90X2ZvdW5kID0ge2NyZWF0ZTogdHJ1ZSwgZXhjbHVzaXZlOiBmYWxzZX1cblx0XHRcdFx0LCBzbGljZVxuXHRcdFx0O1xuXHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblx0XHRcdGlmICghbmFtZSkge1xuXHRcdFx0XHRuYW1lID0gXCJkb3dubG9hZFwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbl91c2Vfc2F2ZV9saW5rKSB7XG5cdFx0XHRcdG9iamVjdF91cmwgPSBnZXRfVVJMKCkuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHNhdmVfbGluay5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHRzYXZlX2xpbmsuZG93bmxvYWQgPSBuYW1lO1xuXHRcdFx0XHRcdGNsaWNrKHNhdmVfbGluayk7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHQvLyBPYmplY3QgYW5kIHdlYiBmaWxlc3lzdGVtIFVSTHMgaGF2ZSBhIHByb2JsZW0gc2F2aW5nIGluIEdvb2dsZSBDaHJvbWUgd2hlblxuXHRcdFx0Ly8gdmlld2VkIGluIGEgdGFiLCBzbyBJIGZvcmNlIHNhdmUgd2l0aCBhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cblx0XHRcdC8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTkxMTU4XG5cdFx0XHQvLyBVcGRhdGU6IEdvb2dsZSBlcnJhbnRseSBjbG9zZWQgOTExNTgsIEkgc3VibWl0dGVkIGl0IGFnYWluOlxuXHRcdFx0Ly8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTM4OTY0MlxuXHRcdFx0aWYgKHZpZXcuY2hyb21lICYmIHR5cGUgJiYgdHlwZSAhPT0gZm9yY2Vfc2F2ZWFibGVfdHlwZSkge1xuXHRcdFx0XHRzbGljZSA9IGJsb2Iuc2xpY2UgfHwgYmxvYi53ZWJraXRTbGljZTtcblx0XHRcdFx0YmxvYiA9IHNsaWNlLmNhbGwoYmxvYiwgMCwgYmxvYi5zaXplLCBmb3JjZV9zYXZlYWJsZV90eXBlKTtcblx0XHRcdFx0YmxvYl9jaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdC8vIFNpbmNlIEkgY2FuJ3QgYmUgc3VyZSB0aGF0IHRoZSBndWVzc2VkIG1lZGlhIHR5cGUgd2lsbCB0cmlnZ2VyIGEgZG93bmxvYWRcblx0XHRcdC8vIGluIFdlYktpdCwgSSBhcHBlbmQgLmRvd25sb2FkIHRvIHRoZSBmaWxlbmFtZS5cblx0XHRcdC8vIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD02NTQ0MFxuXHRcdFx0aWYgKHdlYmtpdF9yZXFfZnMgJiYgbmFtZSAhPT0gXCJkb3dubG9hZFwiKSB7XG5cdFx0XHRcdG5hbWUgKz0gXCIuZG93bmxvYWRcIjtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlID09PSBmb3JjZV9zYXZlYWJsZV90eXBlIHx8IHdlYmtpdF9yZXFfZnMpIHtcblx0XHRcdFx0dGFyZ2V0X3ZpZXcgPSB2aWV3O1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFyZXFfZnMpIHtcblx0XHRcdFx0ZnNfZXJyb3IoKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0ZnNfbWluX3NpemUgKz0gYmxvYi5zaXplO1xuXHRcdFx0cmVxX2ZzKHZpZXcuVEVNUE9SQVJZLCBmc19taW5fc2l6ZSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZzKSB7XG5cdFx0XHRcdGZzLnJvb3QuZ2V0RGlyZWN0b3J5KFwic2F2ZWRcIiwgY3JlYXRlX2lmX25vdF9mb3VuZCwgYWJvcnRhYmxlKGZ1bmN0aW9uKGRpcikge1xuXHRcdFx0XHRcdHZhciBzYXZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRkaXIuZ2V0RmlsZShuYW1lLCBjcmVhdGVfaWZfbm90X2ZvdW5kLCBhYm9ydGFibGUoZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHRcdFx0XHRmaWxlLmNyZWF0ZVdyaXRlcihhYm9ydGFibGUoZnVuY3Rpb24od3JpdGVyKSB7XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLm9ud3JpdGVlbmQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZiA9IGZpbGUudG9VUkwoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdFx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwid3JpdGVlbmRcIiwgZXZlbnQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV2b2tlKGZpbGUpO1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBlcnJvciA9IHdyaXRlci5lcnJvcjtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChlcnJvci5jb2RlICE9PSBlcnJvci5BQk9SVF9FUlIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZnNfZXJyb3IoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFwid3JpdGVzdGFydCBwcm9ncmVzcyB3cml0ZSBhYm9ydFwiLnNwbGl0KFwiIFwiKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR3cml0ZXJbXCJvblwiICsgZXZlbnRdID0gZmlsZXNhdmVyW1wib25cIiArIGV2ZW50XTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR3cml0ZXIud3JpdGUoYmxvYik7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR3cml0ZXIuYWJvcnQoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5XUklUSU5HO1xuXHRcdFx0XHRcdFx0XHR9KSwgZnNfZXJyb3IpO1xuXHRcdFx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGRpci5nZXRGaWxlKG5hbWUsIHtjcmVhdGU6IGZhbHNlfSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdC8vIGRlbGV0ZSBmaWxlIGlmIGl0IGFscmVhZHkgZXhpc3RzXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0c2F2ZSgpO1xuXHRcdFx0XHRcdH0pLCBhYm9ydGFibGUoZnVuY3Rpb24oZXgpIHtcblx0XHRcdFx0XHRcdGlmIChleC5jb2RlID09PSBleC5OT1RfRk9VTkRfRVJSKSB7XG5cdFx0XHRcdFx0XHRcdHNhdmUoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSkpO1xuXHRcdFx0XHR9KSwgZnNfZXJyb3IpO1xuXHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHR9XG5cdFx0LCBGU19wcm90byA9IEZpbGVTYXZlci5wcm90b3R5cGVcblx0XHQsIHNhdmVBcyA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZpbGVTYXZlcihibG9iLCBuYW1lLCBub19hdXRvX2JvbSk7XG5cdFx0fVxuXHQ7XG5cdC8vIElFIDEwKyAobmF0aXZlIHNhdmVBcylcblx0aWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgbmF2aWdhdG9yLm1zU2F2ZU9yT3BlbkJsb2IpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pIHtcblx0XHRcdGlmICghbm9fYXV0b19ib20pIHtcblx0XHRcdFx0YmxvYiA9IGF1dG9fYm9tKGJsb2IpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKGJsb2IsIG5hbWUgfHwgXCJkb3dubG9hZFwiKTtcblx0XHR9O1xuXHR9XG5cblx0RlNfcHJvdG8uYWJvcnQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZmlsZXNhdmVyID0gdGhpcztcblx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdGRpc3BhdGNoKGZpbGVzYXZlciwgXCJhYm9ydFwiKTtcblx0fTtcblx0RlNfcHJvdG8ucmVhZHlTdGF0ZSA9IEZTX3Byb3RvLklOSVQgPSAwO1xuXHRGU19wcm90by5XUklUSU5HID0gMTtcblx0RlNfcHJvdG8uRE9ORSA9IDI7XG5cblx0RlNfcHJvdG8uZXJyb3IgPVxuXHRGU19wcm90by5vbndyaXRlc3RhcnQgPVxuXHRGU19wcm90by5vbnByb2dyZXNzID1cblx0RlNfcHJvdG8ub253cml0ZSA9XG5cdEZTX3Byb3RvLm9uYWJvcnQgPVxuXHRGU19wcm90by5vbmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZWVuZCA9XG5cdFx0bnVsbDtcblxuXHRyZXR1cm4gc2F2ZUFzO1xufShcblx0ICAgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgJiYgc2VsZlxuXHR8fCB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvd1xuXHR8fCB0aGlzLmNvbnRlbnRcbikpO1xuLy8gYHNlbGZgIGlzIHVuZGVmaW5lZCBpbiBGaXJlZm94IGZvciBBbmRyb2lkIGNvbnRlbnQgc2NyaXB0IGNvbnRleHRcbi8vIHdoaWxlIGB0aGlzYCBpcyBuc0lDb250ZW50RnJhbWVNZXNzYWdlTWFuYWdlclxuLy8gd2l0aCBhbiBhdHRyaWJ1dGUgYGNvbnRlbnRgIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHdpbmRvd1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cy5zYXZlQXMgPSBzYXZlQXM7XG59IGVsc2UgaWYgKCh0eXBlb2YgZGVmaW5lICE9PSBcInVuZGVmaW5lZFwiICYmIGRlZmluZSAhPT0gbnVsbCkgJiYgKGRlZmluZS5hbWQgIT09IG51bGwpKSB7XG4gIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNhdmVBcztcbiAgfSk7XG59XG4iLCIvLyB0aGUgd2hhdHdnLWZldGNoIHBvbHlmaWxsIGluc3RhbGxzIHRoZSBmZXRjaCgpIGZ1bmN0aW9uXG4vLyBvbiB0aGUgZ2xvYmFsIG9iamVjdCAod2luZG93IG9yIHNlbGYpXG4vL1xuLy8gUmV0dXJuIHRoYXQgYXMgdGhlIGV4cG9ydCBmb3IgdXNlIGluIFdlYnBhY2ssIEJyb3dzZXJpZnkgZXRjLlxucmVxdWlyZSgnd2hhdHdnLWZldGNoJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHNlbGYuZmV0Y2guYmluZChzZWxmKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuY3JlYXRlSmF6ekluc3RhbmNlID0gY3JlYXRlSmF6ekluc3RhbmNlO1xuZXhwb3J0cy5nZXRKYXp6SW5zdGFuY2UgPSBnZXRKYXp6SW5zdGFuY2U7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgamF6elBsdWdpbkluaXRUaW1lID0gMTAwOyAvLyBtaWxsaXNlY29uZHNcblxuLypcbiAgQ3JlYXRlcyBpbnN0YW5jZXMgb2YgdGhlIEphenogcGx1Z2luIGlmIG5lY2Vzc2FyeS4gSW5pdGlhbGx5IHRoZSBNSURJQWNjZXNzIGNyZWF0ZXMgb25lIG1haW4gSmF6eiBpbnN0YW5jZSB0aGF0IGlzIHVzZWRcbiAgdG8gcXVlcnkgYWxsIGluaXRpYWxseSBjb25uZWN0ZWQgZGV2aWNlcywgYW5kIHRvIHRyYWNrIHRoZSBkZXZpY2VzIHRoYXQgYXJlIGJlaW5nIGNvbm5lY3RlZCBvciBkaXNjb25uZWN0ZWQgYXQgcnVudGltZS5cblxuICBGb3IgZXZlcnkgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0IHRoYXQgaXMgY3JlYXRlZCwgTUlESUFjY2VzcyBxdWVyaWVzIHRoZSBnZXRKYXp6SW5zdGFuY2UoKSBtZXRob2QgZm9yIGEgSmF6eiBpbnN0YW5jZVxuICB0aGF0IHN0aWxsIGhhdmUgYW4gYXZhaWxhYmxlIGlucHV0IG9yIG91dHB1dC4gQmVjYXVzZSBKYXp6IG9ubHkgYWxsb3dzIG9uZSBpbnB1dCBhbmQgb25lIG91dHB1dCBwZXIgaW5zdGFuY2UsIHdlXG4gIG5lZWQgdG8gY3JlYXRlIG5ldyBpbnN0YW5jZXMgaWYgbW9yZSB0aGFuIG9uZSBNSURJIGlucHV0IG9yIG91dHB1dCBkZXZpY2UgZ2V0cyBjb25uZWN0ZWQuXG5cbiAgTm90ZSB0aGF0IGFuIGV4aXN0aW5nIEphenogaW5zdGFuY2UgZG9lc24ndCBnZXQgZGVsZXRlZCB3aGVuIGJvdGggaXRzIGlucHV0IGFuZCBvdXRwdXQgZGV2aWNlIGFyZSBkaXNjb25uZWN0ZWQ7IGluc3RlYWQgaXRcbiAgd2lsbCBiZSByZXVzZWQgaWYgYSBuZXcgZGV2aWNlIGdldHMgY29ubmVjdGVkLlxuKi9cblxudmFyIGphenpJbnN0YW5jZU51bWJlciA9IDA7XG52YXIgamF6ekluc3RhbmNlcyA9IG5ldyBNYXAoKTtcblxuZnVuY3Rpb24gY3JlYXRlSmF6ekluc3RhbmNlKGNhbGxiYWNrKSB7XG5cbiAgdmFyIGlkID0gJ2phenpfJyArIGphenpJbnN0YW5jZU51bWJlcisrICsgJycgKyBEYXRlLm5vdygpO1xuICB2YXIgaW5zdGFuY2UgPSB2b2lkIDA7XG4gIHZhciBvYmpSZWYgPSB2b2lkIDAsXG4gICAgICBhY3RpdmVYID0gdm9pZCAwO1xuXG4gIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLm5vZGVqcyA9PT0gdHJ1ZSkge1xuICAgIG9ialJlZiA9IG5ldyBqYXp6TWlkaS5NSURJKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG8xID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2JqZWN0Jyk7XG4gICAgbzEuaWQgPSBpZCArICdpZSc7XG4gICAgbzEuY2xhc3NpZCA9ICdDTFNJRDoxQUNFMTYxOC0xQzdELTQ1NjEtQUVFMS0zNDg0MkFBODVFOTAnO1xuICAgIGFjdGl2ZVggPSBvMTtcblxuICAgIHZhciBvMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29iamVjdCcpO1xuICAgIG8yLmlkID0gaWQ7XG4gICAgbzIudHlwZSA9ICdhdWRpby94LWphenonO1xuICAgIG8xLmFwcGVuZENoaWxkKG8yKTtcbiAgICBvYmpSZWYgPSBvMjtcblxuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ1RoaXMgcGFnZSByZXF1aXJlcyB0aGUgJykpO1xuXG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnSmF6eiBwbHVnaW4nKSk7XG4gICAgYS5ocmVmID0gJ2h0dHA6Ly9qYXp6LXNvZnQubmV0Lyc7XG5cbiAgICBlLmFwcGVuZENoaWxkKGEpO1xuICAgIGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJy4nKSk7XG4gICAgbzIuYXBwZW5kQ2hpbGQoZSk7XG5cbiAgICB2YXIgaW5zZXJ0aW9uUG9pbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnTUlESVBsdWdpbicpO1xuICAgIGlmICghaW5zZXJ0aW9uUG9pbnQpIHtcbiAgICAgIC8vIENyZWF0ZSBoaWRkZW4gZWxlbWVudFxuICAgICAgaW5zZXJ0aW9uUG9pbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGluc2VydGlvblBvaW50LmlkID0gJ01JRElQbHVnaW4nO1xuICAgICAgaW5zZXJ0aW9uUG9pbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgaW5zZXJ0aW9uUG9pbnQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgaW5zZXJ0aW9uUG9pbnQuc3R5bGUubGVmdCA9ICctOTk5OXB4JztcbiAgICAgIGluc2VydGlvblBvaW50LnN0eWxlLnRvcCA9ICctOTk5OXB4JztcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW5zZXJ0aW9uUG9pbnQpO1xuICAgIH1cbiAgICBpbnNlcnRpb25Qb2ludC5hcHBlbmRDaGlsZChvMSk7XG4gIH1cblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBpZiAob2JqUmVmLmlzSmF6eiA9PT0gdHJ1ZSkge1xuICAgICAgaW5zdGFuY2UgPSBvYmpSZWY7XG4gICAgfSBlbHNlIGlmIChhY3RpdmVYLmlzSmF6eiA9PT0gdHJ1ZSkge1xuICAgICAgaW5zdGFuY2UgPSBhY3RpdmVYO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGluc3RhbmNlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgaW5zdGFuY2UuX3BlcmZUaW1lWmVybyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgamF6ekluc3RhbmNlcy5zZXQoaWQsIGluc3RhbmNlKTtcbiAgICB9XG4gICAgY2FsbGJhY2soaW5zdGFuY2UpO1xuICB9LCBqYXp6UGx1Z2luSW5pdFRpbWUpO1xufVxuXG5mdW5jdGlvbiBnZXRKYXp6SW5zdGFuY2UodHlwZSwgY2FsbGJhY2spIHtcbiAgdmFyIGluc3RhbmNlID0gbnVsbDtcbiAgdmFyIGtleSA9IHR5cGUgPT09ICdpbnB1dCcgPyAnaW5wdXRJblVzZScgOiAnb3V0cHV0SW5Vc2UnO1xuXG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGphenpJbnN0YW5jZXMudmFsdWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICB2YXIgaW5zdCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICBpZiAoaW5zdFtrZXldICE9PSB0cnVlKSB7XG4gICAgICAgIGluc3RhbmNlID0gaW5zdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbnN0YW5jZSA9PT0gbnVsbCkge1xuICAgIGNyZWF0ZUphenpJbnN0YW5jZShjYWxsYmFjayk7XG4gIH0gZWxzZSB7XG4gICAgY2FsbGJhY2soaW5zdGFuY2UpO1xuICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpOyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3JlYXRlcyBhIE1JRElBY2Nlc3MgaW5zdGFuY2U6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIENyZWF0ZXMgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0IGluc3RhbmNlcyBmb3IgdGhlIGluaXRpYWxseSBjb25uZWN0ZWQgTUlESSBkZXZpY2VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBLZWVwcyB0cmFjayBvZiBuZXdseSBjb25uZWN0ZWQgZGV2aWNlcyBhbmQgY3JlYXRlcyB0aGUgbmVjZXNzYXJ5IGluc3RhbmNlcyBvZiBNSURJSW5wdXQgYW5kIE1JRElPdXRwdXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIEtlZXBzIHRyYWNrIG9mIGRpc2Nvbm5lY3RlZCBkZXZpY2VzIGFuZCByZW1vdmVzIHRoZW0gZnJvbSB0aGUgaW5wdXRzIGFuZC9vciBvdXRwdXRzIG1hcC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gQ3JlYXRlcyBhIHVuaXF1ZSBpZCBmb3IgZXZlcnkgZGV2aWNlIGFuZCBzdG9yZXMgdGhlc2UgaWRzIGJ5IHRoZSBuYW1lIG9mIHRoZSBkZXZpY2U6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvIHdoZW4gYSBkZXZpY2UgZ2V0cyBkaXNjb25uZWN0ZWQgYW5kIHJlY29ubmVjdGVkIGFnYWluLCBpdCB3aWxsIHN0aWxsIGhhdmUgdGhlIHNhbWUgaWQuIFRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXMgaW4gbGluZSB3aXRoIHRoZSBiZWhhdmlvdXIgb2YgdGhlIG5hdGl2ZSBNSURJQWNjZXNzIG9iamVjdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG5leHBvcnRzLmNyZWF0ZU1JRElBY2Nlc3MgPSBjcmVhdGVNSURJQWNjZXNzO1xuZXhwb3J0cy5kaXNwYXRjaEV2ZW50ID0gZGlzcGF0Y2hFdmVudDtcbmV4cG9ydHMuY2xvc2VBbGxNSURJSW5wdXRzID0gY2xvc2VBbGxNSURJSW5wdXRzO1xuZXhwb3J0cy5nZXRNSURJRGV2aWNlSWQgPSBnZXRNSURJRGV2aWNlSWQ7XG5cbnZhciBfamF6el9pbnN0YW5jZSA9IHJlcXVpcmUoJy4vamF6el9pbnN0YW5jZScpO1xuXG52YXIgX21pZGlfaW5wdXQgPSByZXF1aXJlKCcuL21pZGlfaW5wdXQnKTtcblxudmFyIF9taWRpX291dHB1dCA9IHJlcXVpcmUoJy4vbWlkaV9vdXRwdXQnKTtcblxudmFyIF9taWRpY29ubmVjdGlvbl9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaWNvbm5lY3Rpb25fZXZlbnQnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBtaWRpQWNjZXNzID0gdm9pZCAwO1xudmFyIGphenpJbnN0YW5jZSA9IHZvaWQgMDtcbnZhciBtaWRpSW5wdXRzID0gbmV3IE1hcCgpO1xudmFyIG1pZGlPdXRwdXRzID0gbmV3IE1hcCgpO1xudmFyIG1pZGlJbnB1dElkcyA9IG5ldyBNYXAoKTtcbnZhciBtaWRpT3V0cHV0SWRzID0gbmV3IE1hcCgpO1xudmFyIGxpc3RlbmVycyA9IG5ldyBTZXQoKTtcblxudmFyIE1JRElBY2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1JRElBY2Nlc3MoaW5wdXRzLCBvdXRwdXRzKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1JRElBY2Nlc3MpO1xuXG4gICAgdGhpcy5zeXNleEVuYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMuaW5wdXRzID0gaW5wdXRzO1xuICAgIHRoaXMub3V0cHV0cyA9IG91dHB1dHM7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTUlESUFjY2VzcywgW3tcbiAgICBrZXk6ICdhZGRFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgaWYgKHR5cGUgIT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGxpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICBsaXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgaWYgKHR5cGUgIT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGxpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSB0cnVlKSB7XG4gICAgICAgIGxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNSURJQWNjZXNzO1xufSgpO1xuXG5mdW5jdGlvbiBjcmVhdGVNSURJQWNjZXNzKCkge1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3QpIHtcblxuICAgIGlmICh0eXBlb2YgbWlkaUFjY2VzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJlc29sdmUobWlkaUFjY2Vzcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkuYnJvd3NlciA9PT0gJ2llOScpIHtcbiAgICAgIHJlamVjdCh7IG1lc3NhZ2U6ICdXZWJNSURJQVBJU2hpbSBzdXBwb3J0cyBJbnRlcm5ldCBFeHBsb3JlciAxMCBhbmQgYWJvdmUuJyB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAoMCwgX2phenpfaW5zdGFuY2UuY3JlYXRlSmF6ekluc3RhbmNlKShmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgIGlmICh0eXBlb2YgaW5zdGFuY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlamVjdCh7IG1lc3NhZ2U6ICdObyBhY2Nlc3MgdG8gTUlESSBkZXZpY2VzOiBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgdGhlIFdlYk1JREkgQVBJIGFuZCB0aGUgSmF6eiBwbHVnaW4gaXMgbm90IGluc3RhbGxlZC4nIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGphenpJbnN0YW5jZSA9IGluc3RhbmNlO1xuXG4gICAgICBjcmVhdGVNSURJUG9ydHMoZnVuY3Rpb24gKCkge1xuICAgICAgICBzZXR1cExpc3RlbmVycygpO1xuICAgICAgICBtaWRpQWNjZXNzID0gbmV3IE1JRElBY2Nlc3MobWlkaUlucHV0cywgbWlkaU91dHB1dHMpO1xuICAgICAgICByZXNvbHZlKG1pZGlBY2Nlc3MpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vLyBjcmVhdGUgTUlESUlucHV0IGFuZCBNSURJT3V0cHV0IGluc3RhbmNlcyBmb3IgYWxsIGluaXRpYWxseSBjb25uZWN0ZWQgTUlESSBkZXZpY2VzXG5mdW5jdGlvbiBjcmVhdGVNSURJUG9ydHMoY2FsbGJhY2spIHtcbiAgdmFyIGlucHV0cyA9IGphenpJbnN0YW5jZS5NaWRpSW5MaXN0KCk7XG4gIHZhciBvdXRwdXRzID0gamF6ekluc3RhbmNlLk1pZGlPdXRMaXN0KCk7XG4gIHZhciBudW1JbnB1dHMgPSBpbnB1dHMubGVuZ3RoO1xuICB2YXIgbnVtT3V0cHV0cyA9IG91dHB1dHMubGVuZ3RoO1xuXG4gIGxvb3BDcmVhdGVNSURJUG9ydCgwLCBudW1JbnB1dHMsICdpbnB1dCcsIGlucHV0cywgZnVuY3Rpb24gKCkge1xuICAgIGxvb3BDcmVhdGVNSURJUG9ydCgwLCBudW1PdXRwdXRzLCAnb3V0cHV0Jywgb3V0cHV0cywgY2FsbGJhY2spO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbG9vcENyZWF0ZU1JRElQb3J0KGluZGV4LCBtYXgsIHR5cGUsIGxpc3QsIGNhbGxiYWNrKSB7XG4gIGlmIChpbmRleCA8IG1heCkge1xuICAgIHZhciBuYW1lID0gbGlzdFtpbmRleCsrXTtcbiAgICBjcmVhdGVNSURJUG9ydCh0eXBlLCBuYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICBsb29wQ3JlYXRlTUlESVBvcnQoaW5kZXgsIG1heCwgdHlwZSwgbGlzdCwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlTUlESVBvcnQodHlwZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgKDAsIF9qYXp6X2luc3RhbmNlLmdldEphenpJbnN0YW5jZSkodHlwZSwgZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgdmFyIHBvcnQgPSB2b2lkIDA7XG4gICAgdmFyIGluZm8gPSBbbmFtZSwgJycsICcnXTtcbiAgICBpZiAodHlwZSA9PT0gJ2lucHV0Jykge1xuICAgICAgaWYgKGluc3RhbmNlLlN1cHBvcnQoJ01pZGlJbkluZm8nKSkge1xuICAgICAgICBpbmZvID0gaW5zdGFuY2UuTWlkaUluSW5mbyhuYW1lKTtcbiAgICAgIH1cbiAgICAgIHBvcnQgPSBuZXcgX21pZGlfaW5wdXQuTUlESUlucHV0KGluZm8sIGluc3RhbmNlKTtcbiAgICAgIG1pZGlJbnB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ291dHB1dCcpIHtcbiAgICAgIGlmIChpbnN0YW5jZS5TdXBwb3J0KCdNaWRpT3V0SW5mbycpKSB7XG4gICAgICAgIGluZm8gPSBpbnN0YW5jZS5NaWRpT3V0SW5mbyhuYW1lKTtcbiAgICAgIH1cbiAgICAgIHBvcnQgPSBuZXcgX21pZGlfb3V0cHV0Lk1JRElPdXRwdXQoaW5mbywgaW5zdGFuY2UpO1xuICAgICAgbWlkaU91dHB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICAgIH1cbiAgICBjYWxsYmFjayhwb3J0KTtcbiAgfSk7XG59XG5cbi8vIGxvb2t1cCBmdW5jdGlvbjogSmF6eiBnaXZlcyB1cyB0aGUgbmFtZSBvZiB0aGUgY29ubmVjdGVkL2Rpc2Nvbm5lY3RlZCBNSURJIGRldmljZXMgYnV0IHdlIGhhdmUgc3RvcmVkIHRoZW0gYnkgaWRcbmZ1bmN0aW9uIGdldFBvcnRCeU5hbWUocG9ydHMsIG5hbWUpIHtcbiAgdmFyIHBvcnQgPSB2b2lkIDA7XG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHBvcnRzLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgcG9ydCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICBpZiAocG9ydC5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcG9ydDtcbn1cblxuLy8ga2VlcCB0cmFjayBvZiBjb25uZWN0ZWQvZGlzY29ubmVjdGVkIE1JREkgZGV2aWNlc1xuZnVuY3Rpb24gc2V0dXBMaXN0ZW5lcnMoKSB7XG4gIGphenpJbnN0YW5jZS5PbkRpc2Nvbm5lY3RNaWRpSW4oZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgcG9ydCA9IGdldFBvcnRCeU5hbWUobWlkaUlucHV0cywgbmFtZSk7XG4gICAgaWYgKHR5cGVvZiBwb3J0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcG9ydC5zdGF0ZSA9ICdkaXNjb25uZWN0ZWQnO1xuICAgICAgcG9ydC5jbG9zZSgpO1xuICAgICAgcG9ydC5famF6ekluc3RhbmNlLmlucHV0SW5Vc2UgPSBmYWxzZTtcbiAgICAgIG1pZGlJbnB1dHMuZGVsZXRlKHBvcnQuaWQpO1xuICAgICAgZGlzcGF0Y2hFdmVudChwb3J0KTtcbiAgICB9XG4gIH0pO1xuXG4gIGphenpJbnN0YW5jZS5PbkRpc2Nvbm5lY3RNaWRpT3V0KGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIHBvcnQgPSBnZXRQb3J0QnlOYW1lKG1pZGlPdXRwdXRzLCBuYW1lKTtcbiAgICBpZiAodHlwZW9mIHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwb3J0LnN0YXRlID0gJ2Rpc2Nvbm5lY3RlZCc7XG4gICAgICBwb3J0LmNsb3NlKCk7XG4gICAgICBwb3J0Ll9qYXp6SW5zdGFuY2Uub3V0cHV0SW5Vc2UgPSBmYWxzZTtcbiAgICAgIG1pZGlPdXRwdXRzLmRlbGV0ZShwb3J0LmlkKTtcbiAgICAgIGRpc3BhdGNoRXZlbnQocG9ydCk7XG4gICAgfVxuICB9KTtcblxuICBqYXp6SW5zdGFuY2UuT25Db25uZWN0TWlkaUluKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgY3JlYXRlTUlESVBvcnQoJ2lucHV0JywgbmFtZSwgZnVuY3Rpb24gKHBvcnQpIHtcbiAgICAgIGRpc3BhdGNoRXZlbnQocG9ydCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGphenpJbnN0YW5jZS5PbkNvbm5lY3RNaWRpT3V0KGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgY3JlYXRlTUlESVBvcnQoJ291dHB1dCcsIG5hbWUsIGZ1bmN0aW9uIChwb3J0KSB7XG4gICAgICBkaXNwYXRjaEV2ZW50KHBvcnQpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gd2hlbiBhIGRldmljZSBnZXRzIGNvbm5lY3RlZC9kaXNjb25uZWN0ZWQgYm90aCB0aGUgcG9ydCBhbmQgTUlESUFjY2VzcyBkaXNwYXRjaCBhIE1JRElDb25uZWN0aW9uRXZlbnRcbi8vIHRoZXJlZm9yIHdlIGNhbGwgdGhlIHBvcnRzIGRpc3BhdGNoRXZlbnQgZnVuY3Rpb24gaGVyZSBhcyB3ZWxsXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KHBvcnQpIHtcbiAgcG9ydC5kaXNwYXRjaEV2ZW50KG5ldyBfbWlkaWNvbm5lY3Rpb25fZXZlbnQuTUlESUNvbm5lY3Rpb25FdmVudChwb3J0LCBwb3J0KSk7XG5cbiAgdmFyIGV2dCA9IG5ldyBfbWlkaWNvbm5lY3Rpb25fZXZlbnQuTUlESUNvbm5lY3Rpb25FdmVudChtaWRpQWNjZXNzLCBwb3J0KTtcblxuICBpZiAodHlwZW9mIG1pZGlBY2Nlc3Mub25zdGF0ZWNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG1pZGlBY2Nlc3Mub25zdGF0ZWNoYW5nZShldnQpO1xuICB9XG4gIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBsaXN0ZW5lcnNbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgIHZhciBsaXN0ZW5lciA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgbGlzdGVuZXIoZXZ0KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgIF9pdGVyYXRvcjIucmV0dXJuKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjbG9zZUFsbE1JRElJbnB1dHMoKSB7XG4gIG1pZGlJbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAvL2lucHV0LmNsb3NlKCk7XG4gICAgaW5wdXQuX2phenpJbnN0YW5jZS5NaWRpSW5DbG9zZSgpO1xuICB9KTtcbn1cblxuLy8gY2hlY2sgaWYgd2UgaGF2ZSBhbHJlYWR5IGNyZWF0ZWQgYSB1bmlxdWUgaWQgZm9yIHRoaXMgZGV2aWNlLCBpZiBzbzogcmV1c2UgaXQsIGlmIG5vdDogY3JlYXRlIGEgbmV3IGlkIGFuZCBzdG9yZSBpdFxuZnVuY3Rpb24gZ2V0TUlESURldmljZUlkKG5hbWUsIHR5cGUpIHtcbiAgdmFyIGlkID0gdm9pZCAwO1xuICBpZiAodHlwZSA9PT0gJ2lucHV0Jykge1xuICAgIGlkID0gbWlkaUlucHV0SWRzLmdldChuYW1lKTtcbiAgICBpZiAodHlwZW9mIGlkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgaWQgPSAoMCwgX3V0aWwuZ2VuZXJhdGVVVUlEKSgpO1xuICAgICAgbWlkaUlucHV0SWRzLnNldChuYW1lLCBpZCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdvdXRwdXQnKSB7XG4gICAgaWQgPSBtaWRpT3V0cHV0SWRzLmdldChuYW1lKTtcbiAgICBpZiAodHlwZW9mIGlkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgaWQgPSAoMCwgX3V0aWwuZ2VuZXJhdGVVVUlEKSgpO1xuICAgICAgbWlkaU91dHB1dElkcy5zZXQobmFtZSwgaWQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaWQ7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5NSURJSW5wdXQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNSURJSW5wdXQgaXMgYSB3cmFwcGVyIGFyb3VuZCBhbiBpbnB1dCBvZiBhIEphenogaW5zdGFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIF9taWRpbWVzc2FnZV9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaW1lc3NhZ2VfZXZlbnQnKTtcblxudmFyIF9taWRpY29ubmVjdGlvbl9ldmVudCA9IHJlcXVpcmUoJy4vbWlkaWNvbm5lY3Rpb25fZXZlbnQnKTtcblxudmFyIF9taWRpX2FjY2VzcyA9IHJlcXVpcmUoJy4vbWlkaV9hY2Nlc3MnKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIG1pZGlQcm9jID0gdm9pZCAwO1xudmFyIG5vZGVqcyA9ICgwLCBfdXRpbC5nZXREZXZpY2UpKCkubm9kZWpzO1xuXG52YXIgTUlESUlucHV0ID0gZXhwb3J0cy5NSURJSW5wdXQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1JRElJbnB1dChpbmZvLCBpbnN0YW5jZSkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJSW5wdXQpO1xuXG4gICAgdGhpcy5pZCA9ICgwLCBfbWlkaV9hY2Nlc3MuZ2V0TUlESURldmljZUlkKShpbmZvWzBdLCAnaW5wdXQnKTtcbiAgICB0aGlzLm5hbWUgPSBpbmZvWzBdO1xuICAgIHRoaXMubWFudWZhY3R1cmVyID0gaW5mb1sxXTtcbiAgICB0aGlzLnZlcnNpb24gPSBpbmZvWzJdO1xuICAgIHRoaXMudHlwZSA9ICdpbnB1dCc7XG4gICAgdGhpcy5zdGF0ZSA9ICdjb25uZWN0ZWQnO1xuICAgIHRoaXMuY29ubmVjdGlvbiA9ICdwZW5kaW5nJztcblxuICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgdGhpcy5fb25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGltcGxpY2l0bHkgb3BlbiB0aGUgZGV2aWNlIHdoZW4gYW4gb25taWRpbWVzc2FnZSBoYW5kbGVyIGdldHMgYWRkZWRcbiAgICAvLyB3ZSBkZWZpbmUgYSBzZXR0ZXIgdGhhdCBvcGVucyB0aGUgZGV2aWNlIGlmIHRoZSBzZXQgdmFsdWUgaXMgYSBmdW5jdGlvblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnb25taWRpbWVzc2FnZScsIHtcbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBuZXcgTWFwKCkuc2V0KCdtaWRpbWVzc2FnZScsIG5ldyBTZXQoKSkuc2V0KCdzdGF0ZWNoYW5nZScsIG5ldyBTZXQoKSk7XG4gICAgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlID0gZmFsc2U7XG4gICAgdGhpcy5fc3lzZXhCdWZmZXIgPSBuZXcgVWludDhBcnJheSgpO1xuXG4gICAgdGhpcy5famF6ekluc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgdGhpcy5famF6ekluc3RhbmNlLmlucHV0SW5Vc2UgPSB0cnVlO1xuXG4gICAgLy8gb24gTGludXggb3BlbmluZyBhbmQgY2xvc2luZyBKYXp6IGluc3RhbmNlcyBjYXVzZXMgdGhlIHBsdWdpbiB0byBjcmFzaCBhIGxvdCBzbyB3ZSBvcGVuXG4gICAgLy8gdGhlIGRldmljZSBoZXJlIGFuZCBkb24ndCBjbG9zZSBpdCB3aGVuIGNsb3NlKCkgaXMgY2FsbGVkLCBzZWUgYmVsb3dcbiAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5wbGF0Zm9ybSA9PT0gJ2xpbnV4Jykge1xuICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlJbk9wZW4odGhpcy5uYW1lLCBtaWRpUHJvYy5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTUlESUlucHV0LCBbe1xuICAgIGtleTogJ2FkZEV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzLmdldCh0eXBlKTtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChsaXN0ZW5lcnMuaGFzKGxpc3RlbmVyKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KHR5cGUpO1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lcnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGxpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICBsaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaXNwYXRjaEV2ZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldnQpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGV2dC50eXBlKTtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICBsaXN0ZW5lcihldnQpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChldnQudHlwZSA9PT0gJ21pZGltZXNzYWdlJykge1xuICAgICAgICBpZiAodGhpcy5fb25taWRpbWVzc2FnZSAhPT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UoZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChldnQudHlwZSA9PT0gJ3N0YXRlY2hhbmdlJykge1xuICAgICAgICBpZiAodGhpcy5vbnN0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlKGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdvcGVuJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb24gPT09ICdvcGVuJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5wbGF0Zm9ybSAhPT0gJ2xpbnV4Jykge1xuICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaUluT3Blbih0aGlzLm5hbWUsIG1pZGlQcm9jLmJpbmQodGhpcykpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb25uZWN0aW9uID0gJ29wZW4nO1xuICAgICAgKDAsIF9taWRpX2FjY2Vzcy5kaXNwYXRjaEV2ZW50KSh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Nsb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnY2xvc2VkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5wbGF0Zm9ybSAhPT0gJ2xpbnV4Jykge1xuICAgICAgICB0aGlzLl9qYXp6SW5zdGFuY2UuTWlkaUluQ2xvc2UoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdjbG9zZWQnO1xuICAgICAgKDAsIF9taWRpX2FjY2Vzcy5kaXNwYXRjaEV2ZW50KSh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgICAgdGhpcy5fb25taWRpbWVzc2FnZSA9IG51bGw7XG4gICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLmdldCgnbWlkaW1lc3NhZ2UnKS5jbGVhcigpO1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLmdldCgnc3RhdGVjaGFuZ2UnKS5jbGVhcigpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19hcHBlbmRUb1N5c2V4QnVmZmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2FwcGVuZFRvU3lzZXhCdWZmZXIoZGF0YSkge1xuICAgICAgdmFyIG9sZExlbmd0aCA9IHRoaXMuX3N5c2V4QnVmZmVyLmxlbmd0aDtcbiAgICAgIHZhciB0bXBCdWZmZXIgPSBuZXcgVWludDhBcnJheShvbGRMZW5ndGggKyBkYXRhLmxlbmd0aCk7XG4gICAgICB0bXBCdWZmZXIuc2V0KHRoaXMuX3N5c2V4QnVmZmVyKTtcbiAgICAgIHRtcEJ1ZmZlci5zZXQoZGF0YSwgb2xkTGVuZ3RoKTtcbiAgICAgIHRoaXMuX3N5c2V4QnVmZmVyID0gdG1wQnVmZmVyO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19idWZmZXJMb25nU3lzZXgnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfYnVmZmVyTG9uZ1N5c2V4KGRhdGEsIGluaXRpYWxPZmZzZXQpIHtcbiAgICAgIHZhciBqID0gaW5pdGlhbE9mZnNldDtcbiAgICAgIHdoaWxlIChqIDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGRhdGFbal0gPT0gMHhGNykge1xuICAgICAgICAgIC8vIGVuZCBvZiBzeXNleCFcbiAgICAgICAgICBqKys7XG4gICAgICAgICAgdGhpcy5fYXBwZW5kVG9TeXNleEJ1ZmZlcihkYXRhLnNsaWNlKGluaXRpYWxPZmZzZXQsIGopKTtcbiAgICAgICAgICByZXR1cm4gajtcbiAgICAgICAgfVxuICAgICAgICBqKys7XG4gICAgICB9XG4gICAgICAvLyBkaWRuJ3QgcmVhY2ggdGhlIGVuZDsganVzdCB0YWNrIGl0IG9uLlxuICAgICAgdGhpcy5fYXBwZW5kVG9TeXNleEJ1ZmZlcihkYXRhLnNsaWNlKGluaXRpYWxPZmZzZXQsIGopKTtcbiAgICAgIHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSA9IHRydWU7XG4gICAgICByZXR1cm4gajtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTUlESUlucHV0O1xufSgpO1xuXG5taWRpUHJvYyA9IGZ1bmN0aW9uIG1pZGlQcm9jKHRpbWVzdGFtcCwgZGF0YSkge1xuICB2YXIgbGVuZ3RoID0gMDtcbiAgdmFyIGkgPSB2b2lkIDA7XG4gIHZhciBpc1N5c2V4TWVzc2FnZSA9IGZhbHNlO1xuXG4gIC8vIEphenogc29tZXRpbWVzIHBhc3NlcyB1cyBtdWx0aXBsZSBtZXNzYWdlcyBhdCBvbmNlLCBzbyB3ZSBuZWVkIHRvIHBhcnNlIHRoZW0gb3V0IGFuZCBwYXNzIHRoZW0gb25lIGF0IGEgdGltZS5cblxuICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkgKz0gbGVuZ3RoKSB7XG4gICAgdmFyIGlzVmFsaWRNZXNzYWdlID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlKSB7XG4gICAgICBpID0gdGhpcy5fYnVmZmVyTG9uZ1N5c2V4KGRhdGEsIGkpO1xuICAgICAgaWYgKGRhdGFbaSAtIDFdICE9IDB4ZjcpIHtcbiAgICAgICAgLy8gcmFuIG9mZiB0aGUgZW5kIHdpdGhvdXQgaGl0dGluZyB0aGUgZW5kIG9mIHRoZSBzeXNleCBtZXNzYWdlXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlzU3lzZXhNZXNzYWdlID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNTeXNleE1lc3NhZ2UgPSBmYWxzZTtcbiAgICAgIHN3aXRjaCAoZGF0YVtpXSAmIDB4RjApIHtcbiAgICAgICAgY2FzZSAweDAwOlxuICAgICAgICAgIC8vIENoZXcgdXAgc3B1cmlvdXMgMHgwMCBieXRlcy4gIEZpeGVzIGEgV2luZG93cyBwcm9ibGVtLlxuICAgICAgICAgIGxlbmd0aCA9IDE7XG4gICAgICAgICAgaXNWYWxpZE1lc3NhZ2UgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDB4ODA6IC8vIG5vdGUgb2ZmXG4gICAgICAgIGNhc2UgMHg5MDogLy8gbm90ZSBvblxuICAgICAgICBjYXNlIDB4QTA6IC8vIHBvbHlwaG9uaWMgYWZ0ZXJ0b3VjaFxuICAgICAgICBjYXNlIDB4QjA6IC8vIGNvbnRyb2wgY2hhbmdlXG4gICAgICAgIGNhc2UgMHhFMDpcbiAgICAgICAgICAvLyBjaGFubmVsIG1vZGVcbiAgICAgICAgICBsZW5ndGggPSAzO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMHhDMDogLy8gcHJvZ3JhbSBjaGFuZ2VcbiAgICAgICAgY2FzZSAweEQwOlxuICAgICAgICAgIC8vIGNoYW5uZWwgYWZ0ZXJ0b3VjaFxuICAgICAgICAgIGxlbmd0aCA9IDI7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAweEYwOlxuICAgICAgICAgIHN3aXRjaCAoZGF0YVtpXSkge1xuICAgICAgICAgICAgY2FzZSAweGYwOlxuICAgICAgICAgICAgICAvLyBsZXRpYWJsZS1sZW5ndGggc3lzZXguXG4gICAgICAgICAgICAgIGkgPSB0aGlzLl9idWZmZXJMb25nU3lzZXgoZGF0YSwgaSk7XG4gICAgICAgICAgICAgIGlmIChkYXRhW2kgLSAxXSAhPSAweGY3KSB7XG4gICAgICAgICAgICAgICAgLy8gcmFuIG9mZiB0aGUgZW5kIHdpdGhvdXQgaGl0dGluZyB0aGUgZW5kIG9mIHRoZSBzeXNleCBtZXNzYWdlXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlzU3lzZXhNZXNzYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMHhGMTogLy8gTVRDIHF1YXJ0ZXIgZnJhbWVcbiAgICAgICAgICAgIGNhc2UgMHhGMzpcbiAgICAgICAgICAgICAgLy8gc29uZyBzZWxlY3RcbiAgICAgICAgICAgICAgbGVuZ3RoID0gMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMHhGMjpcbiAgICAgICAgICAgICAgLy8gc29uZyBwb3NpdGlvbiBwb2ludGVyXG4gICAgICAgICAgICAgIGxlbmd0aCA9IDM7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICBsZW5ndGggPSAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghaXNWYWxpZE1lc3NhZ2UpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHZhciBldnQgPSB7fTtcbiAgICBldnQucmVjZWl2ZWRUaW1lID0gcGFyc2VGbG9hdCh0aW1lc3RhbXAudG9TdHJpbmcoKSkgKyB0aGlzLl9qYXp6SW5zdGFuY2UuX3BlcmZUaW1lWmVybztcblxuICAgIGlmIChpc1N5c2V4TWVzc2FnZSB8fCB0aGlzLl9pbkxvbmdTeXNleE1lc3NhZ2UpIHtcbiAgICAgIGV2dC5kYXRhID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5fc3lzZXhCdWZmZXIpO1xuICAgICAgdGhpcy5fc3lzZXhCdWZmZXIgPSBuZXcgVWludDhBcnJheSgwKTtcbiAgICAgIHRoaXMuX2luTG9uZ1N5c2V4TWVzc2FnZSA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBldnQuZGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEuc2xpY2UoaSwgbGVuZ3RoICsgaSkpO1xuICAgIH1cblxuICAgIGlmIChub2RlanMpIHtcbiAgICAgIGlmICh0aGlzLl9vbm1pZGltZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuX29ubWlkaW1lc3NhZ2UoZXZ0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGUgPSBuZXcgX21pZGltZXNzYWdlX2V2ZW50Lk1JRElNZXNzYWdlRXZlbnQodGhpcywgZXZ0LmRhdGEsIGV2dC5yZWNlaXZlZFRpbWUpO1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH1cbiAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLk1JRElPdXRwdXQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNSURJT3V0cHV0IGlzIGEgd3JhcHBlciBhcm91bmQgYW4gb3V0cHV0IG9mIGEgSmF6eiBpbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgX21pZGlfYWNjZXNzID0gcmVxdWlyZSgnLi9taWRpX2FjY2VzcycpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgTUlESU91dHB1dCA9IGV4cG9ydHMuTUlESU91dHB1dCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTUlESU91dHB1dChpbmZvLCBpbnN0YW5jZSkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJT3V0cHV0KTtcblxuICAgIHRoaXMuaWQgPSAoMCwgX21pZGlfYWNjZXNzLmdldE1JRElEZXZpY2VJZCkoaW5mb1swXSwgJ291dHB1dCcpO1xuICAgIHRoaXMubmFtZSA9IGluZm9bMF07XG4gICAgdGhpcy5tYW51ZmFjdHVyZXIgPSBpbmZvWzFdO1xuICAgIHRoaXMudmVyc2lvbiA9IGluZm9bMl07XG4gICAgdGhpcy50eXBlID0gJ291dHB1dCc7XG4gICAgdGhpcy5zdGF0ZSA9ICdjb25uZWN0ZWQnO1xuICAgIHRoaXMuY29ubmVjdGlvbiA9ICdwZW5kaW5nJztcbiAgICB0aGlzLm9ubWlkaW1lc3NhZ2UgPSBudWxsO1xuICAgIHRoaXMub25zdGF0ZWNoYW5nZSA9IG51bGw7XG5cbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5faW5Mb25nU3lzZXhNZXNzYWdlID0gZmFsc2U7XG4gICAgdGhpcy5fc3lzZXhCdWZmZXIgPSBuZXcgVWludDhBcnJheSgpO1xuXG4gICAgdGhpcy5famF6ekluc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgdGhpcy5famF6ekluc3RhbmNlLm91dHB1dEluVXNlID0gdHJ1ZTtcbiAgICBpZiAoKDAsIF91dGlsLmdldERldmljZSkoKS5wbGF0Zm9ybSA9PT0gJ2xpbnV4Jykge1xuICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlPdXRPcGVuKHRoaXMubmFtZSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1JRElPdXRwdXQsIFt7XG4gICAga2V5OiAnb3BlbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICBpZiAodGhpcy5jb25uZWN0aW9uID09PSAnb3BlbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCgwLCBfdXRpbC5nZXREZXZpY2UpKCkucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcbiAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlPdXRPcGVuKHRoaXMubmFtZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSAnb3Blbic7XG4gICAgICAoMCwgX21pZGlfYWNjZXNzLmRpc3BhdGNoRXZlbnQpKHRoaXMpOyAvLyBkaXNwYXRjaCBNSURJQ29ubmVjdGlvbkV2ZW50IHZpYSBNSURJQWNjZXNzXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY2xvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb24gPT09ICdjbG9zZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICgoMCwgX3V0aWwuZ2V0RGV2aWNlKSgpLnBsYXRmb3JtICE9PSAnbGludXgnKSB7XG4gICAgICAgIHRoaXMuX2phenpJbnN0YW5jZS5NaWRpT3V0Q2xvc2UoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9ICdjbG9zZWQnO1xuICAgICAgKDAsIF9taWRpX2FjY2Vzcy5kaXNwYXRjaEV2ZW50KSh0aGlzKTsgLy8gZGlzcGF0Y2ggTUlESUNvbm5lY3Rpb25FdmVudCB2aWEgTUlESUFjY2Vzc1xuICAgICAgdGhpcy5vbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5jbGVhcigpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NlbmQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZW5kKGRhdGEsIHRpbWVzdGFtcCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIGRlbGF5QmVmb3JlU2VuZCA9IDA7XG5cbiAgICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgZGVsYXlCZWZvcmVTZW5kID0gTWF0aC5mbG9vcih0aW1lc3RhbXAgLSBwZXJmb3JtYW5jZS5ub3coKSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lc3RhbXAgJiYgZGVsYXlCZWZvcmVTZW5kID4gMSkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBfdGhpcy5famF6ekluc3RhbmNlLk1pZGlPdXRMb25nKGRhdGEpO1xuICAgICAgICB9LCBkZWxheUJlZm9yZVNlbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5famF6ekluc3RhbmNlLk1pZGlPdXRMb25nKGRhdGEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY2xlYXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYWRkRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgIGlmICh0eXBlICE9PSAnc3RhdGVjaGFuZ2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2xpc3RlbmVycy5oYXMobGlzdGVuZXIpID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgaWYgKHR5cGUgIT09ICdzdGF0ZWNoYW5nZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fbGlzdGVuZXJzLmhhcyhsaXN0ZW5lcikgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Rpc3BhdGNoRXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2dCkge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIGxpc3RlbmVyKGV2dCk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHRoaXMub25zdGF0ZWNoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLm9uc3RhdGVjaGFuZ2UoZXZ0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTUlESU91dHB1dDtcbn0oKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBNSURJQ29ubmVjdGlvbkV2ZW50ID0gZXhwb3J0cy5NSURJQ29ubmVjdGlvbkV2ZW50ID0gZnVuY3Rpb24gTUlESUNvbm5lY3Rpb25FdmVudChtaWRpQWNjZXNzLCBwb3J0KSB7XG4gIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNSURJQ29ubmVjdGlvbkV2ZW50KTtcblxuICB0aGlzLmJ1YmJsZXMgPSBmYWxzZTtcbiAgdGhpcy5jYW5jZWxCdWJibGUgPSBmYWxzZTtcbiAgdGhpcy5jYW5jZWxhYmxlID0gZmFsc2U7XG4gIHRoaXMuY3VycmVudFRhcmdldCA9IG1pZGlBY2Nlc3M7XG4gIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuICB0aGlzLmV2ZW50UGhhc2UgPSAwO1xuICB0aGlzLnBhdGggPSBbXTtcbiAgdGhpcy5wb3J0ID0gcG9ydDtcbiAgdGhpcy5yZXR1cm5WYWx1ZSA9IHRydWU7XG4gIHRoaXMuc3JjRWxlbWVudCA9IG1pZGlBY2Nlc3M7XG4gIHRoaXMudGFyZ2V0ID0gbWlkaUFjY2VzcztcbiAgdGhpcy50aW1lU3RhbXAgPSBEYXRlLm5vdygpO1xuICB0aGlzLnR5cGUgPSAnc3RhdGVjaGFuZ2UnO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBNSURJTWVzc2FnZUV2ZW50ID0gZXhwb3J0cy5NSURJTWVzc2FnZUV2ZW50ID0gZnVuY3Rpb24gTUlESU1lc3NhZ2VFdmVudChwb3J0LCBkYXRhLCByZWNlaXZlZFRpbWUpIHtcbiAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1JRElNZXNzYWdlRXZlbnQpO1xuXG4gIHRoaXMuYnViYmxlcyA9IGZhbHNlO1xuICB0aGlzLmNhbmNlbEJ1YmJsZSA9IGZhbHNlO1xuICB0aGlzLmNhbmNlbGFibGUgPSBmYWxzZTtcbiAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gcG9ydDtcbiAgdGhpcy5kYXRhID0gZGF0YTtcbiAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gIHRoaXMucGF0aCA9IFtdO1xuICB0aGlzLnJlY2VpdmVkVGltZSA9IHJlY2VpdmVkVGltZTtcbiAgdGhpcy5yZXR1cm5WYWx1ZSA9IHRydWU7XG4gIHRoaXMuc3JjRWxlbWVudCA9IHBvcnQ7XG4gIHRoaXMudGFyZ2V0ID0gcG9ydDtcbiAgdGhpcy50aW1lU3RhbXAgPSBEYXRlLm5vdygpO1xuICB0aGlzLnR5cGUgPSAnbWlkaW1lc3NhZ2UnO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfbWlkaV9hY2Nlc3MgPSByZXF1aXJlKCcuL21pZGlfYWNjZXNzJyk7XG5cbnZhciBfbWlkaV9pbnB1dCA9IHJlcXVpcmUoJy4vbWlkaV9pbnB1dCcpO1xuXG52YXIgX21pZGlfb3V0cHV0ID0gcmVxdWlyZSgnLi9taWRpX291dHB1dCcpO1xuXG52YXIgX21pZGltZXNzYWdlX2V2ZW50ID0gcmVxdWlyZSgnLi9taWRpbWVzc2FnZV9ldmVudCcpO1xuXG4vKlxuICBtYWluIGVudHJ5IHBvaW50XG4qL1xuLy9pbXBvcnQge2NyZWF0ZU1JRElBY2Nlc3MsIGNsb3NlQWxsTUlESUlucHV0c30gZnJvbSAnLi9taWRpX2FjY2Vzcydcbi8vaW1wb3J0IHtwb2x5ZmlsbCwgZ2V0RGV2aWNlfSBmcm9tICcuL3V0aWwnXG5cblxuKGZ1bmN0aW9uIGluaXRTaGltKCkge1xuXG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzID09PSAndW5kZWZpbmVkJykge1xuXG4gICAgZ2xvYmFsLk1JRElJbnB1dCA9IF9taWRpX2lucHV0Lk1JRElJbnB1dDtcbiAgICBnbG9iYWwuTUlESU91dHB1dCA9IF9taWRpX291dHB1dC5NSURJT3V0cHV0O1xuICAgIGdsb2JhbC5NSURJTWVzc2FnZUV2ZW50ID0gX21pZGltZXNzYWdlX2V2ZW50Lk1JRElNZXNzYWdlRXZlbnQ7XG5cbiAgICAvL3BvbHlmaWxsKClcblxuICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd3ZWJtaWRpYXBpc2hpbSAxLjAuMScsIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2Vzcyk7XG4gICAgICByZXR1cm4gKDAsIF9taWRpX2FjY2Vzcy5jcmVhdGVNSURJQWNjZXNzKSgpO1xuICAgIH07XG4gICAgLypcbiAgICAgICAgaWYoZ2V0RGV2aWNlKCkubm9kZWpzID09PSB0cnVlKXtcbiAgICAgICAgICBuYXZpZ2F0b3IuY2xvc2UgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLy8gTmVlZCB0byBjbG9zZSBNSURJIGlucHV0IHBvcnRzLCBvdGhlcndpc2UgTm9kZS5qcyB3aWxsIHdhaXQgZm9yIE1JREkgaW5wdXQgZm9yZXZlci5cbiAgICAgICAgICAgIGNsb3NlQWxsTUlESUlucHV0cygpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgKi9cbiAgfVxufSkoKTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdlbmVyYXRlVVVJRCA9IGdlbmVyYXRlVVVJRDtcbmV4cG9ydHMuZ2V0RGV2aWNlID0gZ2V0RGV2aWNlO1xuZXhwb3J0cy5wb2x5ZmlsbFBlcmZvcm1hbmNlID0gcG9seWZpbGxQZXJmb3JtYW5jZTtcbmV4cG9ydHMucG9seWZpbGxQcm9taXNlID0gcG9seWZpbGxQcm9taXNlO1xuZXhwb3J0cy5wb2x5ZmlsbCA9IHBvbHlmaWxsO1xuLypcbiAgQSBjb2xsZWN0aW9uIG9mIGhhbmR5IHV0aWwgbWV0aG9kc1xuKi9cblxuZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB2YXIgdXVpZCA9IG5ldyBBcnJheSg2NCkuam9pbigneCcpOyAvLyd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnO1xuICB1dWlkID0gdXVpZC5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgdmFyIHIgPSAoZCArIE1hdGgucmFuZG9tKCkgKiAxNikgJSAxNiB8IDA7XG4gICAgZCA9IE1hdGguZmxvb3IoZCAvIDE2KTtcbiAgICByZXR1cm4gKGMgPT0gJ3gnID8gciA6IHIgJiAweDMgfCAweDgpLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICB9KTtcbiAgcmV0dXJuIHV1aWQ7XG59XG5cbnZhciBkZXZpY2UgPSB2b2lkIDA7XG5cbi8vIGNoZWNrIG9uIHdoYXQgdHlwZSBvZiBkZXZpY2Ugd2UgYXJlIHJ1bm5pbmcsIG5vdGUgdGhhdCBpbiB0aGlzIGNvbnRleHQgYSBkZXZpY2UgaXMgYSBjb21wdXRlciBub3QgYSBNSURJIGRldmljZVxuZnVuY3Rpb24gZ2V0RGV2aWNlKCkge1xuXG4gIGlmICh0eXBlb2YgZGV2aWNlICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBkZXZpY2U7XG4gIH1cblxuICB2YXIgcGxhdGZvcm0gPSAndW5kZXRlY3RlZCcsXG4gICAgICBicm93c2VyID0gJ3VuZGV0ZWN0ZWQnLFxuICAgICAgbm9kZWpzID0gZmFsc2U7XG5cbiAgaWYgKG5hdmlnYXRvci5ub2RlanMpIHtcbiAgICBwbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm07XG4gICAgZGV2aWNlID0ge1xuICAgICAgcGxhdGZvcm06IHBsYXRmb3JtLFxuICAgICAgbm9kZWpzOiB0cnVlLFxuICAgICAgbW9iaWxlOiBwbGF0Zm9ybSA9PT0gJ2lvcycgfHwgcGxhdGZvcm0gPT09ICdhbmRyb2lkJ1xuICAgIH07XG4gICAgcmV0dXJuIGRldmljZTtcbiAgfVxuXG4gIHZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG5cbiAgaWYgKHVhLm1hdGNoKC8oaVBhZHxpUGhvbmV8aVBvZCkvZykpIHtcbiAgICBwbGF0Zm9ybSA9ICdpb3MnO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0FuZHJvaWQnKSAhPT0gLTEpIHtcbiAgICBwbGF0Zm9ybSA9ICdhbmRyb2lkJztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdMaW51eCcpICE9PSAtMSkge1xuICAgIHBsYXRmb3JtID0gJ2xpbnV4JztcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdNYWNpbnRvc2gnKSAhPT0gLTEpIHtcbiAgICBwbGF0Zm9ybSA9ICdvc3gnO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1dpbmRvd3MnKSAhPT0gLTEpIHtcbiAgICBwbGF0Zm9ybSA9ICd3aW5kb3dzJztcbiAgfVxuXG4gIGlmICh1YS5pbmRleE9mKCdDaHJvbWUnKSAhPT0gLTEpIHtcbiAgICAvLyBjaHJvbWUsIGNocm9taXVtIGFuZCBjYW5hcnlcbiAgICBicm93c2VyID0gJ2Nocm9tZSc7XG5cbiAgICBpZiAodWEuaW5kZXhPZignT1BSJykgIT09IC0xKSB7XG4gICAgICBicm93c2VyID0gJ29wZXJhJztcbiAgICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0Nocm9taXVtJykgIT09IC0xKSB7XG4gICAgICBicm93c2VyID0gJ2Nocm9taXVtJztcbiAgICB9XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignU2FmYXJpJykgIT09IC0xKSB7XG4gICAgYnJvd3NlciA9ICdzYWZhcmknO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSAhPT0gLTEpIHtcbiAgICBicm93c2VyID0gJ2ZpcmVmb3gnO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1RyaWRlbnQnKSAhPT0gLTEpIHtcbiAgICBicm93c2VyID0gJ2llJztcbiAgICBpZiAodWEuaW5kZXhPZignTVNJRSA5JykgIT09IC0xKSB7XG4gICAgICBicm93c2VyID0gJ2llOSc7XG4gICAgfVxuICB9XG5cbiAgaWYgKHBsYXRmb3JtID09PSAnaW9zJykge1xuICAgIGlmICh1YS5pbmRleE9mKCdDcmlPUycpICE9PSAtMSkge1xuICAgICAgYnJvd3NlciA9ICdjaHJvbWUnO1xuICAgIH1cbiAgfVxuXG4gIGRldmljZSA9IHtcbiAgICBwbGF0Zm9ybTogcGxhdGZvcm0sXG4gICAgYnJvd3NlcjogYnJvd3NlcixcbiAgICBtb2JpbGU6IHBsYXRmb3JtID09PSAnaW9zJyB8fCBwbGF0Zm9ybSA9PT0gJ2FuZHJvaWQnLFxuICAgIG5vZGVqczogZmFsc2VcbiAgfTtcbiAgcmV0dXJuIGRldmljZTtcbn1cblxuZnVuY3Rpb24gcG9seWZpbGxQZXJmb3JtYW5jZSgpIHtcbiAgaWYgKHR5cGVvZiBwZXJmb3JtYW5jZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBwZXJmb3JtYW5jZSA9IHt9O1xuICB9XG4gIERhdGUubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfTtcblxuICBpZiAodHlwZW9mIHBlcmZvcm1hbmNlLm5vdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG5vd09mZnNldCA9IERhdGUubm93KCk7XG4gICAgICBpZiAodHlwZW9mIHBlcmZvcm1hbmNlLnRpbWluZyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG5vd09mZnNldCA9IHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQ7XG4gICAgICB9XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbiBub3coKSB7XG4gICAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbm93T2Zmc2V0O1xuICAgICAgfTtcbiAgICB9KSgpO1xuICB9XG59XG5cbi8vIGEgdmVyeSBzaW1wbGUgaW1wbGVtZW50YXRpb24gb2YgYSBQcm9taXNlIGZvciBJbnRlcm5ldCBFeHBsb3JlciBhbmQgTm9kZWpzXG5mdW5jdGlvbiBwb2x5ZmlsbFByb21pc2Uoc2NvcGUpIHtcbiAgaWYgKHR5cGVvZiBzY29wZS5Qcm9taXNlICE9PSAnZnVuY3Rpb24nKSB7XG5cbiAgICBzY29wZS5Qcm9taXNlID0gZnVuY3Rpb24gKGV4ZWN1dG9yKSB7XG4gICAgICB0aGlzLmV4ZWN1dG9yID0gZXhlY3V0b3I7XG4gICAgfTtcblxuICAgIHNjb3BlLlByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpZiAodHlwZW9mIHJlc29sdmUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmVzb2x2ZSA9IGZ1bmN0aW9uIHJlc29sdmUoKSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcmVqZWN0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlamVjdCA9IGZ1bmN0aW9uIHJlamVjdCgpIHt9O1xuICAgICAgfVxuICAgICAgdGhpcy5leGVjdXRvcihyZXNvbHZlLCByZWplY3QpO1xuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gcG9seWZpbGwoKSB7XG4gIHZhciBkZXZpY2UgPSBnZXREZXZpY2UoKTtcbiAgaWYgKGRldmljZS5icm93c2VyID09PSAnaWUnKSB7XG4gICAgcG9seWZpbGxQcm9taXNlKHdpbmRvdyk7XG4gIH0gZWxzZSBpZiAoZGV2aWNlLm5vZGVqcyA9PT0gdHJ1ZSkge1xuICAgIHBvbHlmaWxsUHJvbWlzZShnbG9iYWwpO1xuICB9XG4gIHBvbHlmaWxsUGVyZm9ybWFuY2UoKTtcbn0iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG5cbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgbGlzdCA9IHRoaXMubWFwW25hbWVdXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICBsaXN0ID0gW11cbiAgICAgIHRoaXMubWFwW25hbWVdID0gbGlzdFxuICAgIH1cbiAgICBsaXN0LnB1c2godmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gICAgcmV0dXJuIHZhbHVlcyA/IHZhbHVlc1swXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gfHwgW11cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBbbm9ybWFsaXplVmFsdWUodmFsdWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5tYXApLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGhpcy5tYXBbbmFtZV0uZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBuYW1lLCB0aGlzKVxuICAgICAgfSwgdGhpcylcbiAgICB9LCB0aGlzKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgLy8gT25seSBzdXBwb3J0IEFycmF5QnVmZmVycyBmb3IgUE9TVCBtZXRob2QuXG4gICAgICAgIC8vIFJlY2VpdmluZyBBcnJheUJ1ZmZlcnMgaGFwcGVucyB2aWEgQmxvYnMsIGluc3RlYWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcbiAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBpbnB1dFxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9ICh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpLnRyaW0oKS5zcGxpdCgnXFxuJylcbiAgICBwYWlycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgdmFyIHNwbGl0ID0gaGVhZGVyLnRyaW0oKS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gc3BsaXQuc2hpZnQoKS50cmltKClcbiAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJzonKS50cmltKClcbiAgICAgIGhlYWQuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfSlcbiAgICByZXR1cm4gaGVhZFxuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9IG9wdGlvbnMuc3RhdHVzVGV4dFxuICAgIHRoaXMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMgPyBvcHRpb25zLmhlYWRlcnMgOiBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVyc1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZVxuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0XG4gICAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkgJiYgIWluaXQpIHtcbiAgICAgICAgcmVxdWVzdCA9IGlucHV0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB9XG5cbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBmdW5jdGlvbiByZXNwb25zZVVSTCgpIHtcbiAgICAgICAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgICAgIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyh4aHIpLFxuICAgICAgICAgIHVybDogcmVzcG9uc2VVUkwoKVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCJcbi8vIHN0YW5kYXJkIE1JREkgZXZlbnRzXG5jb25zdCBNSURJRXZlbnRUeXBlcyA9IHt9XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ05PVEVfT0ZGJywge3ZhbHVlOiAweDgwfSkgLy8xMjhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ05PVEVfT04nLCB7dmFsdWU6IDB4OTB9KSAvLzE0NFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUE9MWV9QUkVTU1VSRScsIHt2YWx1ZTogMHhBMH0pIC8vMTYwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDT05UUk9MX0NIQU5HRScsIHt2YWx1ZTogMHhCMH0pIC8vMTc2XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQUk9HUkFNX0NIQU5HRScsIHt2YWx1ZTogMHhDMH0pIC8vMTkyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDSEFOTkVMX1BSRVNTVVJFJywge3ZhbHVlOiAweEQwfSkgLy8yMDhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BJVENIX0JFTkQnLCB7dmFsdWU6IDB4RTB9KSAvLzIyNFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1lTVEVNX0VYQ0xVU0lWRScsIHt2YWx1ZTogMHhGMH0pIC8vMjQwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdNSURJX1RJTUVDT0RFJywge3ZhbHVlOiAyNDF9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU09OR19QT1NJVElPTicsIHt2YWx1ZTogMjQyfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfU0VMRUNUJywge3ZhbHVlOiAyNDN9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVFVORV9SRVFVRVNUJywge3ZhbHVlOiAyNDZ9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU9YJywge3ZhbHVlOiAyNDd9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNSU5HX0NMT0NLJywge3ZhbHVlOiAyNDh9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1RBUlQnLCB7dmFsdWU6IDI1MH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDT05USU5VRScsIHt2YWx1ZTogMjUxfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NUT1AnLCB7dmFsdWU6IDI1Mn0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdBQ1RJVkVfU0VOU0lORycsIHt2YWx1ZTogMjU0fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NZU1RFTV9SRVNFVCcsIHt2YWx1ZTogMjU1fSlcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdURU1QTycsIHt2YWx1ZTogMHg1MX0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdUSU1FX1NJR05BVFVSRScsIHt2YWx1ZTogMHg1OH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdFTkRfT0ZfVFJBQ0snLCB7dmFsdWU6IDB4MkZ9KVxuXG5leHBvcnQge01JRElFdmVudFR5cGVzfVxuIiwiaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge3BhcnNlU2FtcGxlc30gZnJvbSAnLi9wYXJzZV9hdWRpbydcblxuZXhwb3J0IGNsYXNzIENvbnZvbHV0aW9uUmV2ZXJie1xuXG4gIGNvbnN0cnVjdG9yKGJ1ZmZlcil7XG4gICAgdGhpcy5fbm9kZUZYID0gY29udGV4dC5jcmVhdGVDb252b2x2ZXIoKVxuXG4gICAgaWYoYnVmZmVyIGluc3RhbmNlb2YgQXVkaW9CdWZmZXIpe1xuICAgICAgdGhpcy5fbm9kZUZYLmJ1ZmZlciA9IGJ1ZmZlclxuICAgIH1cbiAgICB0aGlzLmlucHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLm91dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG5cbiAgICB0aGlzLl9kcnkgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMuX3dldCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG5cbiAgICB0aGlzLl9kcnkuZ2Fpbi52YWx1ZSA9IDFcbiAgICB0aGlzLl93ZXQuZ2Fpbi52YWx1ZSA9IDBcblxuICAgIHRoaXMuaW5wdXQuY29ubmVjdCh0aGlzLl9kcnkpXG4gICAgdGhpcy5fZHJ5LmNvbm5lY3QodGhpcy5vdXRwdXQpXG5cbiAgICB0aGlzLmlucHV0LmNvbm5lY3QodGhpcy5fbm9kZUZYKVxuICAgIHRoaXMuX25vZGVGWC5jb25uZWN0KHRoaXMuX3dldClcbiAgICB0aGlzLl93ZXQuY29ubmVjdCh0aGlzLm91dHB1dClcblxuICAgIHRoaXMuYW1vdW50ID0gMFxuICB9XG5cbiAgYWRkQnVmZmVyKGJ1ZmZlcil7XG4gICAgaWYoYnVmZmVyIGluc3RhbmNlb2YgQXVkaW9CdWZmZXIgPT09IGZhbHNlKXtcbiAgICAgIGNvbnNvbGUubG9nKCdhcmd1bWVudCBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgQXVkaW9CdWZmZXInLCBidWZmZXIpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fbm9kZUZYLmJ1ZmZlciA9IGJ1ZmZlclxuICB9XG5cbiAgbG9hZEJ1ZmZlcih1cmwpe1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBwYXJzZVNhbXBsZXModXJsKVxuICAgICAgLnRoZW4oXG4gICAgICAgIGJ1ZmZlciA9PiB7XG4gICAgICAgICAgYnVmZmVyID0gYnVmZmVyWzBdXG4gICAgICAgICAgaWYoYnVmZmVyIGluc3RhbmNlb2YgQXVkaW9CdWZmZXIpe1xuICAgICAgICAgICAgdGhpcy5fbm9kZUZYLmJ1ZmZlciA9IGJ1ZmZlclxuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZWplY3QoJ2NvdWxkIG5vdCBwYXJzZSB0byBBdWRpb0J1ZmZlcicsIHVybClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuICB9XG5cbiAgc2V0QW1vdW50KHZhbHVlKXtcbiAgICAvKlxuICAgIHRoaXMuYW1vdW50ID0gdmFsdWUgPCAwID8gMCA6IHZhbHVlID4gMSA/IDEgOiB2YWx1ZTtcbiAgICB2YXIgZ2FpbjEgPSBNYXRoLmNvcyh0aGlzLmFtb3VudCAqIDAuNSAqIE1hdGguUEkpLFxuICAgICAgICBnYWluMiA9IE1hdGguY29zKCgxLjAgLSB0aGlzLmFtb3VudCkgKiAwLjUgKiBNYXRoLlBJKTtcbiAgICB0aGlzLmdhaW5Ob2RlLmdhaW4udmFsdWUgPSBnYWluMiAqIHRoaXMucmF0aW87XG4gICAgKi9cblxuICAgIGlmKHZhbHVlIDwgMCl7XG4gICAgICB2YWx1ZSA9IDBcbiAgICB9ZWxzZSBpZih2YWx1ZSA+IDEpe1xuICAgICAgdmFsdWUgPSAxXG4gICAgfVxuXG4gICAgdGhpcy5hbW91bnQgPSB2YWx1ZVxuICAgIHRoaXMuX3dldC5nYWluLnZhbHVlID0gdGhpcy5hbW91bnRcbiAgICB0aGlzLl9kcnkuZ2Fpbi52YWx1ZSA9IDEgLSB0aGlzLmFtb3VudFxuICAgIC8vY29uc29sZS5sb2coJ3dldCcsdGhpcy53ZXRHYWluLmdhaW4udmFsdWUsJ2RyeScsdGhpcy5kcnlHYWluLmdhaW4udmFsdWUpO1xuICB9XG59XG4iLCJsZXQgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpe1xuICAvL2NvbnNvbGUubG9nKGV2ZW50LnR5cGUpXG4gIGxldCBtYXBcblxuICBpZihldmVudC50eXBlID09PSAnZXZlbnQnKXtcbiAgICBsZXQgbWlkaUV2ZW50ID0gZXZlbnQuZGF0YVxuICAgIGxldCBtaWRpRXZlbnRUeXBlID0gbWlkaUV2ZW50LnR5cGVcbiAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudFR5cGUpXG4gICAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKG1pZGlFdmVudFR5cGUpKXtcbiAgICAgIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldChtaWRpRXZlbnRUeXBlKVxuICAgICAgZm9yKGxldCBjYiBvZiBtYXAudmFsdWVzKCkpe1xuICAgICAgICBjYihtaWRpRXZlbnQpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudExpc3RlbmVycy5oYXMoZXZlbnQudHlwZSkpXG4gIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyhldmVudC50eXBlKSA9PT0gZmFsc2Upe1xuICAgIHJldHVyblxuICB9XG5cbiAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50LnR5cGUpXG4gIGZvcihsZXQgY2Igb2YgbWFwLnZhbHVlcygpKXtcbiAgICBjYihldmVudClcbiAgfVxuXG5cbiAgLy8gQHRvZG86IHJ1biBmaWx0ZXJzIGhlcmUsIGZvciBpbnN0YW5jZSBpZiBhbiBldmVudGxpc3RlbmVyIGhhcyBiZWVuIGFkZGVkIHRvIGFsbCBOT1RFX09OIGV2ZW50cywgY2hlY2sgdGhlIHR5cGUgb2YgdGhlIGluY29taW5nIGV2ZW50XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBjYWxsYmFjayl7XG5cbiAgbGV0IG1hcFxuICBsZXQgaWQgPSBgJHt0eXBlfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcblxuICBpZihldmVudExpc3RlbmVycy5oYXModHlwZSkgPT09IGZhbHNlKXtcbiAgICBtYXAgPSBuZXcgTWFwKClcbiAgICBldmVudExpc3RlbmVycy5zZXQodHlwZSwgbWFwKVxuICB9ZWxzZXtcbiAgICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQodHlwZSlcbiAgfVxuXG4gIG1hcC5zZXQoaWQsIGNhbGxiYWNrKVxuICAvL2NvbnNvbGUubG9nKGV2ZW50TGlzdGVuZXJzKVxuICByZXR1cm4gaWRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBpZCl7XG5cbiAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5sb2coJ25vIGV2ZW50bGlzdGVuZXJzIG9mIHR5cGUnICsgdHlwZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGxldCBtYXAgPSBldmVudExpc3RlbmVycy5nZXQodHlwZSlcblxuICBpZih0eXBlb2YgaWQgPT09ICdmdW5jdGlvbicpe1xuICAgIGZvcihsZXQgW2tleSwgdmFsdWVdIG9mIG1hcC5lbnRyaWVzKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKGtleSwgdmFsdWUpXG4gICAgICBpZih2YWx1ZSA9PT0gaWQpe1xuICAgICAgICBjb25zb2xlLmxvZyhrZXkpXG4gICAgICAgIGlkID0ga2V5XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpe1xuICAgICAgbWFwLmRlbGV0ZShpZClcbiAgICB9XG4gIH1lbHNlIGlmKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpe1xuICAgIG1hcC5kZWxldGUoaWQpXG4gIH1lbHNle1xuICAgIGNvbnNvbGUubG9nKCdjb3VsZCBub3QgcmVtb3ZlIGV2ZW50bGlzdGVuZXInKVxuICB9XG59XG5cbiIsIi8vIGZldGNoIGhlbHBlcnNcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXR1cyhyZXNwb25zZSkge1xuICBpZihyZXNwb25zZS5zdGF0dXMgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1cyA8IDMwMCl7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpKVxuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBqc29uKHJlc3BvbnNlKXtcbiAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlCdWZmZXIocmVzcG9uc2Upe1xuICByZXR1cm4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaEpTT04odXJsKXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBmZXRjaCh1cmwsIHtcbiAgICAvLyAgIG1vZGU6ICduby1jb3JzJ1xuICAgIC8vIH0pXG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihqc29uKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgcmVzb2x2ZShkYXRhKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoQXJyYXlidWZmZXIodXJsKXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBmZXRjaCh1cmwsIHtcbiAgICAvLyAgIG1vZGU6ICduby1jb3JzJ1xuICAgIC8vIH0pXG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihhcnJheUJ1ZmZlcilcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJlc29sdmUoZGF0YSlcbiAgICB9KVxuICAgIC5jYXRjaChlID0+IHtcbiAgICAgIHJlamVjdChlKVxuICAgIH0pXG4gIH0pXG59XG4iLCJpbXBvcnQgcWFtYmkgZnJvbSAnLi9xYW1iaSdcbmltcG9ydCB7U29uZ30gZnJvbSAnLi9zb25nJ1xuaW1wb3J0IHtTYW1wbGVyfSBmcm9tICcuL3NhbXBsZXInXG5pbXBvcnQge2luaXRBdWRpb30gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtpbml0TUlESX0gZnJvbSAnLi9pbml0X21pZGknXG5pbXBvcnQge3VwZGF0ZVNldHRpbmdzfSBmcm9tICcuL3NldHRpbmdzJ1xuXG5leHBvcnQgbGV0IGdldFVzZXJNZWRpYSA9ICgoKSA9PiB7XG4gIGlmKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gbmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhXG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS53YXJuKCdnZXRVc2VyTWVkaWEgaXMgbm90IGF2YWlsYWJsZScpXG4gIH1cbn0pKClcblxuXG5leHBvcnQgbGV0IHJBRiA9ICgoKSA9PiB7XG4gIGlmKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS53YXJuKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgaXMgbm90IGF2YWlsYWJsZScpXG4gIH1cbn0pKClcblxuXG5leHBvcnQgbGV0IEJsb2IgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHdpbmRvdy5CbG9iIHx8IHdpbmRvdy53ZWJraXRCbG9iXG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS53YXJuKCdCbG9iIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZnVuY3Rpb24gbG9hZEluc3RydW1lbnQoZGF0YSl7XG4gIGxldCBzYW1wbGVyID0gbmV3IFNhbXBsZXIoKVxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHNhbXBsZXIucGFyc2VTYW1wbGVEYXRhKGRhdGEpXG4gICAgLnRoZW4oKCkgPT4gcmVzb2x2ZShzYW1wbGVyKSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoc2V0dGluZ3MgPSBudWxsKTogdm9pZHtcblxuICAvLyBsb2FkIHNldHRpbmdzLmluc3RydW1lbnRzIChhcnJheSBvciBvYmplY3QpXG4gIC8vIGxvYWQgc2V0dGluZ3MubWlkaWZpbGVzIChhcnJheSBvciBvYmplY3QpXG4gIC8qXG5cbiAgcWFtYmkuaW5pdCh7XG4gICAgc29uZzoge1xuICAgICAgdHlwZTogJ1NvbmcnLFxuICAgICAgdXJsOiAnLi4vZGF0YS9taW51dGVfd2FsdHoubWlkJ1xuICAgIH0sXG4gICAgcGlhbm86IHtcbiAgICAgIHR5cGU6ICdJbnN0cnVtZW50JyxcbiAgICAgIHVybDogJy4uLy4uL2luc3RydW1lbnRzL2VsZWN0cmljLXBpYW5vLmpzb24nXG4gICAgfVxuICB9KVxuXG4gIHFhbWJpLmluaXQoe1xuICAgIGluc3RydW1lbnRzOiBbJy4uL2luc3RydW1lbnRzL3BpYW5vJywgJy4uL2luc3RydW1lbnRzL3Zpb2xpbiddLFxuICAgIG1pZGlmaWxlczogWycuLi9taWRpL21vemFydC5taWQnXVxuICB9KVxuICAudGhlbigobG9hZGVkKSA9PiB7XG4gICAgbGV0IFtwaWFubywgdmlvbGluXSA9IGxvYWRlZC5pbnN0cnVtZW50c1xuICAgIGxldCBbbW96YXJ0XSA9IGxvYWRlZC5taWRpZmlsZXNcbiAgfSlcblxuICAqL1xuXG4gIGxldCBwcm9taXNlcyA9IFtpbml0QXVkaW8oKSwgaW5pdE1JREkoKV1cbiAgbGV0IGxvYWRLZXlzXG5cbiAgaWYoc2V0dGluZ3MgIT09IG51bGwpe1xuXG4gICAgbG9hZEtleXMgPSBPYmplY3Qua2V5cyhzZXR0aW5ncylcbiAgICBsZXQgaSA9IGxvYWRLZXlzLmluZGV4T2YoJ3NldHRpbmdzJylcbiAgICBpZihpICE9PSAtMSl7XG4gICAgICB1cGRhdGVTZXR0aW5ncyhzZXR0aW5ncy5zZXR0aW5ncylcbiAgICAgIGxvYWRLZXlzLnNwbGljZShpLCAxKVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKGxvYWRLZXlzKVxuXG4gICAgZm9yKGxldCBrZXkgb2YgbG9hZEtleXMpe1xuXG4gICAgICBsZXQgZGF0YSA9IHNldHRpbmdzW2tleV1cblxuICAgICAgaWYoZGF0YS50eXBlID09PSAnU29uZycpe1xuICAgICAgICBwcm9taXNlcy5wdXNoKFNvbmcuZnJvbU1JRElGaWxlKGRhdGEudXJsKSlcbiAgICAgIH1lbHNlIGlmKGRhdGEudHlwZSA9PT0gJ0luc3RydW1lbnQnKXtcbiAgICAgICAgcHJvbWlzZXMucHVzaChsb2FkSW5zdHJ1bWVudChkYXRhKSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICBQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICAudGhlbihcbiAgICAocmVzdWx0KSA9PiB7XG5cbiAgICAgIGxldCByZXR1cm5PYmogPSB7fVxuXG4gICAgICByZXN1bHQuZm9yRWFjaCgoZGF0YSwgaSkgPT4ge1xuICAgICAgICBpZihpID09PSAwKXtcbiAgICAgICAgICAvLyBpbml0QXVkaW9cbiAgICAgICAgICByZXR1cm5PYmoubGVnYWN5ID0gZGF0YS5sZWdhY3lcbiAgICAgICAgICByZXR1cm5PYmoubXAzID0gZGF0YS5tcDNcbiAgICAgICAgICByZXR1cm5PYmoub2dnID0gZGF0YS5vZ2dcbiAgICAgICAgfWVsc2UgaWYoaSA9PT0gMSl7XG4gICAgICAgICAgLy8gaW5pdE1JRElcbiAgICAgICAgICByZXR1cm5PYmouamF6eiA9IGRhdGEuamF6elxuICAgICAgICAgIHJldHVybk9iai5taWRpID0gZGF0YS5taWRpXG4gICAgICAgICAgcmV0dXJuT2JqLndlYm1pZGkgPSBkYXRhLndlYm1pZGlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy8gSW5zdHJ1bWVudHMsIHNhbXBsZXMgb3IgTUlESSBmaWxlcyB0aGF0IGdvdCBsb2FkZWQgZHVyaW5nIGluaXRpYWxpemF0aW9uXG4gICAgICAgICAgLy9yZXN1bHRbbG9hZEtleXNbaSAtIDJdXSA9IGRhdGFcbiAgICAgICAgICByZXR1cm5PYmpbbG9hZEtleXNbaSAtIDJdXSA9IGRhdGFcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy9jb25zb2xlLmxvZyhyZXR1cm5PYmouamF6eilcblxuICAgICAgaWYocmV0dXJuT2JqLm1pZGkgPT09IGZhbHNlKXtcbiAgICAgICAgY29uc29sZS5sb2coJ3FhbWJpJywgcWFtYmkudmVyc2lvbiwgJ1t5b3VyIGJyb3dzZXIgaGFzIG5vIHN1cHBvcnQgZm9yIE1JREldJylcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLmxvZygncWFtYmknLCBxYW1iaS52ZXJzaW9uKVxuICAgICAgfVxuICAgICAgcmVzb2x2ZShyZXR1cm5PYmopXG4gICAgfSxcbiAgICAoZXJyb3IpID0+IHtcbiAgICAgIHJlamVjdChlcnJvcilcbiAgICB9KVxuICB9KVxuXG5cbi8qXG4gIFByb21pc2UuYWxsKFtpbml0QXVkaW8oKSwgaW5pdE1JREkoKV0pXG4gIC50aGVuKFxuICAoZGF0YSkgPT4ge1xuICAgIC8vIHBhcnNlQXVkaW9cbiAgICBsZXQgZGF0YUF1ZGlvID0gZGF0YVswXVxuXG4gICAgLy8gcGFyc2VNSURJXG4gICAgbGV0IGRhdGFNaWRpID0gZGF0YVsxXVxuXG4gICAgY2FsbGJhY2soe1xuICAgICAgbGVnYWN5OiBkYXRhQXVkaW8ubGVnYWN5LFxuICAgICAgbXAzOiBkYXRhQXVkaW8ubXAzLFxuICAgICAgb2dnOiBkYXRhQXVkaW8ub2dnLFxuICAgICAgbWlkaTogZGF0YU1pZGkubWlkaSxcbiAgICAgIHdlYm1pZGk6IGRhdGFNaWRpLndlYm1pZGksXG4gICAgfSlcbiAgfSxcbiAgKGVycm9yKSA9PiB7XG4gICAgY2FsbGJhY2soZXJyb3IpXG4gIH0pXG4qL1xufVxuXG4iLCIvKlxuICBTZXRzIHVwIHRoZSBiYXNpYyBhdWRpbyByb3V0aW5nLCB0ZXN0cyB3aGljaCBhdWRpbyBmb3JtYXRzIGFyZSBzdXBwb3J0ZWQgYW5kIHBhcnNlcyB0aGUgc2FtcGxlcyBmb3IgdGhlIG1ldHJvbm9tZSB0aWNrcy5cbiovXG5cbmltcG9ydCBzYW1wbGVzIGZyb20gJy4vc2FtcGxlcydcbmltcG9ydCB7cGFyc2VTYW1wbGVzfSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuXG5sZXQgZGF0YVxubGV0IG1hc3RlckdhaW5cbmxldCBjb21wcmVzc29yXG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZVxuXG5cbmV4cG9ydCBsZXQgY29udGV4dCA9IChmdW5jdGlvbigpe1xuICAvL2NvbnNvbGUubG9nKCdpbml0IEF1ZGlvQ29udGV4dCcpXG4gIGxldCBjdHhcbiAgaWYodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpe1xuICAgIGxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHRcbiAgICBpZihBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKVxuICAgIH1cbiAgfVxuICBpZih0eXBlb2YgY3R4ID09PSAndW5kZWZpbmVkJyl7XG4gICAgLy9AVE9ETzogY3JlYXRlIGR1bW15IEF1ZGlvQ29udGV4dCBmb3IgdXNlIGluIG5vZGUsIHNlZTogaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvYXVkaW8tY29udGV4dFxuICAgIGNvbnRleHQgPSB7XG4gICAgICBjcmVhdGVHYWluOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGdhaW46IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZU9zY2lsbGF0b3I6IGZ1bmN0aW9uKCl7fSxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN0eFxufSgpKVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0QXVkaW8oKXtcblxuICBpZih0eXBlb2YgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW5cbiAgfVxuICAvLyBjaGVjayBmb3Igb2xkZXIgaW1wbGVtZW50YXRpb25zIG9mIFdlYkF1ZGlvXG4gIGRhdGEgPSB7fVxuICBsZXQgc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICBkYXRhLmxlZ2FjeSA9IGZhbHNlXG4gIGlmKHR5cGVvZiBzb3VyY2Uuc3RhcnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBkYXRhLmxlZ2FjeSA9IHRydWVcbiAgfVxuXG4gIC8vIHNldCB1cCB0aGUgZWxlbWVudGFyeSBhdWRpbyBub2Rlc1xuICBjb21wcmVzc29yID0gY29udGV4dC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKVxuICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgbWFzdGVyR2FpbiA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSAwLjVcbiAgaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgIHBhcnNlU2FtcGxlcyhzYW1wbGVzKS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQoYnVmZmVycyl7XG4gICAgICAgIC8vY29uc29sZS5sb2coYnVmZmVycylcbiAgICAgICAgLy8gZGF0YS5vZ2cgPSB0eXBlb2YgYnVmZmVycy5lbXB0eU9nZyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgLy8gZGF0YS5tcDMgPSB0eXBlb2YgYnVmZmVycy5lbXB0eU1wMyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgZGF0YS5sb3d0aWNrID0gYnVmZmVycy5sb3d0aWNrXG4gICAgICAgIGRhdGEuaGlnaHRpY2sgPSBidWZmZXJzLmhpZ2h0aWNrXG4gICAgICAgIGlmKGRhdGEub2dnID09PSBmYWxzZSAmJiBkYXRhLm1wMyA9PT0gZmFsc2Upe1xuICAgICAgICAgIHJlamVjdCgnTm8gc3VwcG9ydCBmb3Igb2dnIG5vciBtcDMhJylcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZShkYXRhKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25SZWplY3RlZCgpe1xuICAgICAgICByZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIGluaXRpYWxpemluZyBBdWRpbycpXG4gICAgICB9XG4gICAgKVxuICB9KVxufVxuXG5cbmxldCBzZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbih2YWx1ZTogbnVtYmVyID0gMC41KTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBzZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbih2YWx1ZTogbnVtYmVyID0gMC41KXtcbiAgICAgIGlmKHZhbHVlID4gMSl7XG4gICAgICAgIGNvbnNvbGUuaW5mbygnbWF4aW1hbCB2b2x1bWUgaXMgMS4wLCB2b2x1bWUgaXMgc2V0IHRvIDEuMCcpO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB2YWx1ZSA8IDAgPyAwIDogdmFsdWUgPiAxID8gMSA6IHZhbHVlXG4gICAgICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0TWFzdGVyVm9sdW1lKHZhbHVlKVxuICB9XG59XG5cblxubGV0IGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBtYXN0ZXJHYWluLmdhaW4udmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIGdldE1hc3RlclZvbHVtZSgpXG4gIH1cbn1cblxuXG5sZXQgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBjb21wcmVzc29yLnJlZHVjdGlvbi52YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24oKVxuICB9XG59XG5cblxubGV0IGVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihmbGFnOiBib29sZWFuKXtcbiAgICAgIGlmKGZsYWcpe1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb21wcmVzc29yKTtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZW5hYmxlTWFzdGVyQ29tcHJlc3NvcigpXG4gIH1cbn1cblxuXG5sZXQgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGNmZyk6IHZvaWR7XG4gIC8qXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gYXR0YWNrOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0ga25lZTsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByYXRpbzsgLy8gdW5pdC1sZXNzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVkdWN0aW9uOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlbGVhc2U7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSB0aHJlc2hvbGQ7IC8vIGluIERlY2liZWxzXG5cbiAgICBAc2VlOiBodHRwOi8vd2ViYXVkaW8uZ2l0aHViLmlvL3dlYi1hdWRpby1hcGkvI3RoZS1keW5hbWljc2NvbXByZXNzb3Jub2RlLWludGVyZmFjZVxuICAqL1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihjZmc6IHt9KXtcbiAgICAgICh7XG4gICAgICAgIGF0dGFjazogY29tcHJlc3Nvci5hdHRhY2sgPSAwLjAwMyxcbiAgICAgICAga25lZTogY29tcHJlc3Nvci5rbmVlID0gMzAsXG4gICAgICAgIHJhdGlvOiBjb21wcmVzc29yLnJhdGlvID0gMTIsXG4gICAgICAgIHJlZHVjdGlvbjogY29tcHJlc3Nvci5yZWR1Y3Rpb24gPSAwLFxuICAgICAgICByZWxlYXNlOiBjb21wcmVzc29yLnJlbGVhc2UgPSAwLjI1MCxcbiAgICAgICAgdGhyZXNob2xkOiBjb21wcmVzc29yLnRocmVzaG9sZCA9IC0yNCxcbiAgICAgIH0gPSBjZmcpXG4gICAgfVxuICAgIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IoY2ZnKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbml0RGF0YSgpe1xuICByZXR1cm4gZGF0YVxufVxuXG4vLyB0aGlzIGRvZXNuJ3Qgc2VlbSB0byBiZSBuZWNlc3NhcnkgYW55bW9yZSBvbiBpT1MgYW55bW9yZVxubGV0IHVubG9ja1dlYkF1ZGlvID0gZnVuY3Rpb24oKXtcbiAgbGV0IHNyYyA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpXG4gIGxldCBnYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gIGdhaW5Ob2RlLmdhaW4udmFsdWUgPSAwXG4gIHNyYy5jb25uZWN0KGdhaW5Ob2RlKVxuICBnYWluTm9kZS5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIGlmKHR5cGVvZiBzcmMubm90ZU9uICE9PSAndW5kZWZpbmVkJyl7XG4gICAgc3JjLnN0YXJ0ID0gc3JjLm5vdGVPblxuICAgIHNyYy5zdG9wID0gc3JjLm5vdGVPZmZcbiAgfVxuICBzcmMuc3RhcnQoMClcbiAgc3JjLnN0b3AoMC4wMDEpXG4gIHVubG9ja1dlYkF1ZGlvID0gZnVuY3Rpb24oKXtcbiAgICAvL2NvbnNvbGUubG9nKCdhbHJlYWR5IGRvbmUnKVxuICB9XG59XG5cbmV4cG9ydCB7bWFzdGVyR2FpbiwgdW5sb2NrV2ViQXVkaW8sIGNvbXByZXNzb3IgYXMgbWFzdGVyQ29tcHJlc3Nvciwgc2V0TWFzdGVyVm9sdW1lLCBnZXRNYXN0ZXJWb2x1bWUsIGdldENvbXByZXNzaW9uUmVkdWN0aW9uLCBlbmFibGVNYXN0ZXJDb21wcmVzc29yLCBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yfVxuIiwiLypcbiAgUmVxdWVzdHMgTUlESSBhY2Nlc3MsIHF1ZXJpZXMgYWxsIGlucHV0cyBhbmQgb3V0cHV0cyBhbmQgc3RvcmVzIHRoZW0gaW4gYWxwaGFiZXRpY2FsIG9yZGVyXG4qL1xuXG5pbXBvcnQge3R5cGVTdHJpbmd9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAnd2VibWlkaWFwaXNoaW0nIC8vIHlvdSBjYW4gYWxzbyBlbWJlZCB0aGUgc2hpbSBhcyBhIHN0YW5kLWFsb25lIHNjcmlwdCBpbiB0aGUgaHRtbCwgdGhlbiB5b3UgY2FuIGNvbW1lbnQgdGhpcyBsaW5lIG91dFxuXG5sZXQgTUlESUFjY2Vzc1xubGV0IGluaXRpYWxpemVkID0gZmFsc2VcbmxldCBpbnB1dHMgPSBbXVxubGV0IG91dHB1dHMgPSBbXVxubGV0IGlucHV0SWRzID0gW11cbmxldCBvdXRwdXRJZHMgPSBbXVxubGV0IGlucHV0c0J5SWQgPSBuZXcgTWFwKClcbmxldCBvdXRwdXRzQnlJZCA9IG5ldyBNYXAoKVxuXG5sZXQgc29uZ01pZGlFdmVudExpc3RlbmVyXG5sZXQgbWlkaUV2ZW50TGlzdGVuZXJJZCA9IDBcblxuXG5mdW5jdGlvbiBnZXRNSURJcG9ydHMoKXtcbiAgaW5wdXRzID0gQXJyYXkuZnJvbShNSURJQWNjZXNzLmlucHV0cy52YWx1ZXMoKSlcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgaW5wdXRzLnNvcnQoKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xKVxuXG4gIGZvcihsZXQgcG9ydCBvZiBpbnB1dHMpe1xuICAgIGlucHV0c0J5SWQuc2V0KHBvcnQuaWQsIHBvcnQpXG4gICAgaW5wdXRJZHMucHVzaChwb3J0LmlkKVxuICB9XG5cbiAgb3V0cHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5vdXRwdXRzLnZhbHVlcygpKVxuXG4gIC8vc29ydCBwb3J0cyBieSBuYW1lIGFzY2VuZGluZ1xuICBvdXRwdXRzLnNvcnQoKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xKVxuXG4gIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgZm9yKGxldCBwb3J0IG9mIG91dHB1dHMpe1xuICAgIC8vY29uc29sZS5sb2cocG9ydC5pZCwgcG9ydC5uYW1lKVxuICAgIG91dHB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KVxuICAgIG91dHB1dElkcy5wdXNoKHBvcnQuaWQpXG4gIH1cbiAgLy9jb25zb2xlLmxvZyhvdXRwdXRzQnlJZClcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdE1JREkoKXtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIGxldCBqYXp6ID0gZmFsc2VcbiAgICBsZXQgbWlkaSA9IGZhbHNlXG4gICAgbGV0IHdlYm1pZGkgPSBmYWxzZVxuXG4gICAgaWYodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICByZXNvbHZlKHttaWRpfSlcbiAgICB9ZWxzZSBpZih0eXBlb2YgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzICE9PSAndW5kZWZpbmVkJyl7XG5cblxuICAgICAgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzKCkudGhlbihcblxuICAgICAgICBmdW5jdGlvbiBvbkZ1bEZpbGxlZChtaWRpQWNjZXNzKXtcbiAgICAgICAgICBNSURJQWNjZXNzID0gbWlkaUFjY2Vzc1xuICAgICAgICAgIC8vIEBUT0RPOiBpbXBsZW1lbnQgc29tZXRoaW5nIGluIHdlYm1pZGlhcGlzaGltIHRoYXQgYWxsb3dzIHVzIHRvIGRldGVjdCB0aGUgSmF6eiBwbHVnaW4gdmVyc2lvblxuICAgICAgICAgIGlmKHR5cGVvZiBtaWRpQWNjZXNzLl9qYXp6SW5zdGFuY2VzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnamF6eicpXG4gICAgICAgICAgICBqYXp6ID0gbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlc1swXS5fSmF6ei52ZXJzaW9uXG4gICAgICAgICAgICBtaWRpID0gdHJ1ZVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgd2VibWlkaSA9IHRydWVcbiAgICAgICAgICAgIG1pZGkgPSB0cnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZ2V0TUlESXBvcnRzKClcblxuICAgICAgICAgIC8vIG9uY29ubmVjdCBhbmQgb25kaXNjb25uZWN0IGFyZSBub3QgeWV0IGltcGxlbWVudGVkIGluIENocm9tZSBhbmQgQ2hyb21pdW1cbiAgICAgICAgICBtaWRpQWNjZXNzLm9uY29ubmVjdCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBjb25uZWN0ZWQnLCBlKVxuICAgICAgICAgICAgZ2V0TUlESXBvcnRzKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtaWRpQWNjZXNzLm9uZGlzY29ubmVjdCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBkaXNjb25uZWN0ZWQnLCBlKVxuICAgICAgICAgICAgZ2V0TUlESXBvcnRzKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgIGphenosXG4gICAgICAgICAgICBtaWRpLFxuICAgICAgICAgICAgd2VibWlkaSxcbiAgICAgICAgICAgIGlucHV0cyxcbiAgICAgICAgICAgIG91dHB1dHMsXG4gICAgICAgICAgICBpbnB1dHNCeUlkLFxuICAgICAgICAgICAgb3V0cHV0c0J5SWQsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGUpXG4gICAgICAgICAgLy9yZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIHJlcXVlc3RpbmcgTUlESUFjY2VzcycsIGUpXG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICAgICAgcmVzb2x2ZSh7bWlkaSwgamF6en0pXG4gICAgICAgIH1cbiAgICAgIClcbiAgICAvLyBicm93c2VycyB3aXRob3V0IFdlYk1JREkgQVBJXG4gICAgfWVsc2V7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgIHJlc29sdmUoe21pZGl9KVxuICAgIH1cbiAgfSlcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElBY2Nlc3MgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElBY2Nlc3MgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIE1JRElBY2Nlc3NcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElBY2Nlc3MoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBvdXRwdXRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJT3V0cHV0cygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBpbnB1dHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElJbnB1dHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRJZHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRJZHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG91dHB1dElkc1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dElkcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElJbnB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gaW5wdXRJZHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElJbnB1dElkcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0QnlJZCA9IGZ1bmN0aW9uKGlkOiBzdHJpbmcpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElPdXRwdXRCeUlkID0gZnVuY3Rpb24oX2lkKXtcbiAgICAgIHJldHVybiBvdXRwdXRzQnlJZC5nZXQoX2lkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dEJ5SWQoaWQpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24oaWQ6IHN0cmluZyl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uKF9pZCl7XG4gICAgICByZXR1cm4gaW5wdXRzQnlJZC5nZXQoX2lkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0QnlJZChpZClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNaWRpU29uZyhzb25nKXtcblxuICBzb25nTWlkaUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKXtcbiAgICAvL2NvbnNvbGUubG9nKGUpXG4gICAgaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIGUsIHRoaXMpO1xuICB9O1xuXG4gIC8vIGJ5IGRlZmF1bHQgYSBzb25nIGxpc3RlbnMgdG8gYWxsIGF2YWlsYWJsZSBtaWRpLWluIHBvcnRzXG4gIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHBvcnQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xuXG4gIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlJbnB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgaW5wdXQgPSBpbnB1dHMuZ2V0KGlkKTtcblxuICBpZihpbnB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIGlucHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaUlucHV0cy5kZWxldGUoaWQpO1xuICAgIGlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChpZCwgaW5wdXQpO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlJbnB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaU91dHB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgb3V0cHV0ID0gb3V0cHV0cy5nZXQoaWQpO1xuXG4gIGlmKG91dHB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIG91dHB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLmRlbGV0ZShpZCk7XG4gICAgbGV0IHRpbWUgPSBzb25nLnNjaGVkdWxlci5sYXN0RXZlbnRUaW1lICsgMTAwO1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZSk7IC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lKTsgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gIH1lbHNle1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KGlkLCBvdXRwdXQpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaU91dHB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVNvbmcoc29uZywgbWlkaU1lc3NhZ2VFdmVudCwgaW5wdXQpe1xuICBsZXQgbWlkaUV2ZW50ID0gbmV3IE1pZGlFdmVudChzb25nLnRpY2tzLCAuLi5taWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1pZGlJbnB1dHMsIGlucHV0KTtcblxuXG4gICAgLy9pZihtaWRpRXZlbnQuY2hhbm5lbCA9PT0gdHJhY2suY2hhbm5lbCB8fCB0cmFjay5jaGFubmVsID09PSAwIHx8IHRyYWNrLmNoYW5uZWwgPT09ICdhbnknKXtcbiAgICAvLyAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrKTtcbiAgICAvL31cblxuXG4gICAgLy8gbGlrZSBpbiBDdWJhc2UsIG1pZGkgZXZlbnRzIGZyb20gYWxsIGRldmljZXMsIHNlbnQgb24gYW55IG1pZGkgY2hhbm5lbCBhcmUgZm9yd2FyZGVkIHRvIGFsbCB0cmFja3NcbiAgICAvLyBzZXQgdHJhY2subW9uaXRvciB0byBmYWxzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byByZWNlaXZlIG1pZGkgZXZlbnRzIG9uIGEgY2VydGFpbiB0cmFja1xuICAgIC8vIG5vdGUgdGhhdCB0cmFjay5tb25pdG9yIGlzIGJ5IGRlZmF1bHQgc2V0IHRvIGZhbHNlIGFuZCB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYXV0b21hdGljYWxseSBzZXQgdG8gdHJ1ZVxuICAgIC8vIGlmIHlvdSBhcmUgcmVjb3JkaW5nIG9uIHRoYXQgdHJhY2tcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1vbml0b3IsIHRyYWNrLmlkLCBpbnB1dC5pZCk7XG4gICAgaWYodHJhY2subW9uaXRvciA9PT0gdHJ1ZSAmJiB0cmFjay5taWRpSW5wdXRzLmdldChpbnB1dC5pZCkgIT09IHVuZGVmaW5lZCl7XG4gICAgICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2ssIGlucHV0KTtcbiAgICB9XG4gIH1cblxuICBsZXQgbGlzdGVuZXJzID0gc29uZy5taWRpRXZlbnRMaXN0ZW5lcnMuZ2V0KG1pZGlFdmVudC50eXBlKTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIGZvcihsZXQgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH1cbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sodHJhY2ssIG1pZGlFdmVudCwgaW5wdXQpe1xuICBsZXQgc29uZyA9IHRyYWNrLnNvbmcsXG4gICAgbm90ZSwgbGlzdGVuZXJzLCBjaGFubmVsO1xuICAgIC8vZGF0YSA9IG1pZGlNZXNzYWdlRXZlbnQuZGF0YSxcbiAgICAvL21pZGlFdmVudCA9IGNyZWF0ZU1pZGlFdmVudChzb25nLnRpY2tzLCBkYXRhWzBdLCBkYXRhWzFdLCBkYXRhWzJdKTtcblxuICAvL21pZGlFdmVudC5zb3VyY2UgPSBtaWRpTWVzc2FnZUV2ZW50LnNyY0VsZW1lbnQubmFtZTtcbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50KVxuICAvL2NvbnNvbGUubG9nKCctLS0tPicsIG1pZGlFdmVudC50eXBlKTtcblxuICAvLyBhZGQgdGhlIGV4YWN0IHRpbWUgb2YgdGhpcyBldmVudCBzbyB3ZSBjYW4gY2FsY3VsYXRlIGl0cyB0aWNrcyBwb3NpdGlvblxuICBtaWRpRXZlbnQucmVjb3JkTWlsbGlzID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDA7IC8vIG1pbGxpc1xuICBtaWRpRXZlbnQuc3RhdGUgPSAncmVjb3JkZWQnO1xuXG4gIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgIG5vdGUgPSBjcmVhdGVNaWRpTm90ZShtaWRpRXZlbnQpO1xuICAgIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV0gPSBub3RlO1xuICAgIC8vdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXSA9IG5vdGU7XG4gIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjgpe1xuICAgIG5vdGUgPSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vIGNoZWNrIGlmIHRoZSBub3RlIGV4aXN0czogaWYgdGhlIHVzZXIgcGxheXMgbm90ZXMgb24gaGVyIGtleWJvYXJkIGJlZm9yZSB0aGUgbWlkaSBzeXN0ZW0gaGFzXG4gICAgLy8gYmVlbiBmdWxseSBpbml0aWFsaXplZCwgaXQgY2FuIGhhcHBlbiB0aGF0IHRoZSBmaXJzdCBpbmNvbWluZyBtaWRpIGV2ZW50IGlzIGEgTk9URSBPRkYgZXZlbnRcbiAgICBpZihub3RlID09PSB1bmRlZmluZWQpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KTtcbiAgICBkZWxldGUgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvL2RlbGV0ZSB0cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdO1xuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhzb25nLnByZXJvbGwsIHNvbmcucmVjb3JkaW5nLCB0cmFjay5yZWNvcmRFbmFibGVkKTtcblxuICBpZigoc29uZy5wcmVyb2xsaW5nIHx8IHNvbmcucmVjb3JkaW5nKSAmJiB0cmFjay5yZWNvcmRFbmFibGVkID09PSAnbWlkaScpe1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgICAgdHJhY2suc29uZy5yZWNvcmRlZE5vdGVzLnB1c2gobm90ZSk7XG4gICAgfVxuICAgIHRyYWNrLnJlY29yZFBhcnQuYWRkRXZlbnQobWlkaUV2ZW50KTtcbiAgICAvLyBzb25nLnJlY29yZGVkRXZlbnRzIGlzIHVzZWQgaW4gdGhlIGtleSBlZGl0b3JcbiAgICB0cmFjay5zb25nLnJlY29yZGVkRXZlbnRzLnB1c2gobWlkaUV2ZW50KTtcbiAgfWVsc2UgaWYodHJhY2suZW5hYmxlUmV0cm9zcGVjdGl2ZVJlY29yZGluZyl7XG4gICAgdHJhY2sucmV0cm9zcGVjdGl2ZVJlY29yZGluZy5wdXNoKG1pZGlFdmVudCk7XG4gIH1cblxuICAvLyBjYWxsIGFsbCBtaWRpIGV2ZW50IGxpc3RlbmVyc1xuICBsaXN0ZW5lcnMgPSB0cmFjay5taWRpRXZlbnRMaXN0ZW5lcnNbbWlkaUV2ZW50LnR5cGVdO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgb2JqZWN0Rm9yRWFjaChsaXN0ZW5lcnMsIGZ1bmN0aW9uKGxpc3RlbmVyKXtcbiAgICAgIGxpc3RlbmVyKG1pZGlFdmVudCwgaW5wdXQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhbm5lbCA9IHRyYWNrLmNoYW5uZWw7XG4gIGlmKGNoYW5uZWwgPT09ICdhbnknIHx8IGNoYW5uZWwgPT09IHVuZGVmaW5lZCB8fCBpc05hTihjaGFubmVsKSA9PT0gdHJ1ZSl7XG4gICAgY2hhbm5lbCA9IDA7XG4gIH1cblxuICBvYmplY3RGb3JFYWNoKHRyYWNrLm1pZGlPdXRwdXRzLCBmdW5jdGlvbihvdXRwdXQpe1xuICAgIC8vY29uc29sZS5sb2coJ21pZGkgb3V0Jywgb3V0cHV0LCBtaWRpRXZlbnQudHlwZSk7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTQ0IHx8IG1pZGlFdmVudC50eXBlID09PSAxNzYpe1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTIpO1xuICAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICAgIC8vIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSAxOTIpe1xuICAgIC8vICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTFdKTtcbiAgICB9XG4gICAgLy9vdXRwdXQuc2VuZChbbWlkaUV2ZW50LnN0YXR1cyArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gIH0pO1xuXG4gIC8vIEBUT0RPOiBtYXliZSBhIHRyYWNrIHNob3VsZCBiZSBhYmxlIHRvIHNlbmQgaXRzIGV2ZW50IHRvIGJvdGggYSBtaWRpLW91dCBwb3J0IGFuZCBhbiBpbnRlcm5hbCBoZWFydGJlYXQgc29uZz9cbiAgLy9jb25zb2xlLmxvZyh0cmFjay5yb3V0ZVRvTWlkaU91dCk7XG4gIGlmKHRyYWNrLnJvdXRlVG9NaWRpT3V0ID09PSBmYWxzZSl7XG4gICAgbWlkaUV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgdHJhY2suaW5zdHJ1bWVudC5wcm9jZXNzRXZlbnQobWlkaUV2ZW50KTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGFkZE1pZGlFdmVudExpc3RlbmVyKC4uLmFyZ3MpeyAvLyBjYWxsZXIgY2FuIGJlIGEgdHJhY2sgb3IgYSBzb25nXG5cbiAgbGV0IGlkID0gbWlkaUV2ZW50TGlzdGVuZXJJZCsrO1xuICBsZXQgbGlzdGVuZXI7XG4gICAgdHlwZXMgPSB7fSxcbiAgICBpZHMgPSBbXSxcbiAgICBsb29wO1xuXG5cbiAgLy8gc2hvdWxkIEkgaW5saW5lIHRoaXM/XG4gIGxvb3AgPSBmdW5jdGlvbihhcmdzKXtcbiAgICBmb3IobGV0IGFyZyBvZiBhcmdzKXtcbiAgICAgIGxldCB0eXBlID0gdHlwZVN0cmluZyhhcmcpO1xuICAgICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICAgIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICBsb29wKGFyZyk7XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgbGlzdGVuZXIgPSBhcmc7XG4gICAgICB9ZWxzZSBpZihpc05hTihhcmcpID09PSBmYWxzZSl7XG4gICAgICAgIGFyZyA9IHBhcnNlSW50KGFyZywgMTApO1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICBhcmcgPSBzZXF1ZW5jZXIubWlkaUV2ZW50TnVtYmVyQnlOYW1lKGFyZyk7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBsb29wKGFyZ3MsIDAsIGFyZ3MubGVuZ3RoKTtcbiAgLy9jb25zb2xlLmxvZygndHlwZXMnLCB0eXBlcywgJ2xpc3RlbmVyJywgbGlzdGVuZXIpO1xuXG4gIG9iamVjdEZvckVhY2godHlwZXMsIGZ1bmN0aW9uKHR5cGUpe1xuICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgaWYob2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPSB7fTtcbiAgICB9XG4gICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF0gPSBsaXN0ZW5lcjtcbiAgICBpZHMucHVzaCh0eXBlICsgJ18nICsgaWQpO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKG9iai5taWRpRXZlbnRMaXN0ZW5lcnMpO1xuICByZXR1cm4gaWRzLmxlbmd0aCA9PT0gMSA/IGlkc1swXSA6IGlkcztcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcihpZCwgb2JqKXtcbiAgdmFyIHR5cGU7XG4gIGlkID0gaWQuc3BsaXQoJ18nKTtcbiAgdHlwZSA9IGlkWzBdO1xuICBpZCA9IGlkWzFdO1xuICBkZWxldGUgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXVtpZF07XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXJzKCl7XG5cbn1cblxuKi9cbiIsImltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5cbmV4cG9ydCBjbGFzcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICAgIHRoaXMub3V0cHV0ID0gbnVsbFxuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG4gIGNvbm5lY3Qob3V0cHV0KXtcbiAgICB0aGlzLm91dHB1dCA9IG91dHB1dFxuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG4gIGRpc2Nvbm5lY3QoKXtcbiAgICB0aGlzLm91dHB1dCA9IG51bGxcbiAgfVxuXG4gIC8vIG1hbmRhdG9yeVxuICBwcm9jZXNzTUlESUV2ZW50KGV2ZW50KXtcbiAgICBsZXQgdGltZSA9IGV2ZW50LnRpbWUgLyAxMDAwXG4gICAgbGV0IHNhbXBsZVxuXG4gICAgaWYoaXNOYU4odGltZSkpe1xuICAgICAgLy8gdGhpcyBzaG91bGRuJ3QgaGFwcGVuXG4gICAgICBjb25zb2xlLmVycm9yKCdpbnZhbGlkIHRpbWUgdmFsdWUnKVxuICAgICAgcmV0dXJuXG4gICAgICAvL3RpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gICAgfVxuXG4gICAgaWYodGltZSA9PT0gMCl7XG4gICAgICAvLyB0aGlzIHNob3VsZG4ndCBoYXBwZW4gLT4gZXh0ZXJuYWwgTUlESSBrZXlib2FyZHNcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3Nob3VsZCBub3QgaGFwcGVuJylcbiAgICAgIHRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lXG4gICAgfVxuXG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIC8vY29uc29sZS5sb2coMTQ0LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcblxuICAgICAgc2FtcGxlID0gdGhpcy5jcmVhdGVTYW1wbGUoZXZlbnQpXG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIHNhbXBsZSlcbiAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlKVxuICAgICAgc2FtcGxlLm91dHB1dC5jb25uZWN0KHRoaXMub3V0cHV0KVxuICAgICAgc2FtcGxlLnN0YXJ0KHRpbWUpXG4gICAgICAvL2NvbnNvbGUubG9nKCdzY2hlZHVsaW5nJywgZXZlbnQuaWQsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAvL2NvbnNvbGUubG9nKCdzdGFydCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vY29uc29sZS5sb2coMTI4LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcbiAgICAgIHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5nZXQoZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIGlmKHR5cGVvZiBzYW1wbGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy9jb25zb2xlLmluZm8oJ3NhbXBsZSBub3QgZm91bmQgZm9yIGV2ZW50JywgZXZlbnQuaWQsICcgbWlkaU5vdGUnLCBldmVudC5taWRpTm90ZUlkLCBldmVudClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIHdlIGRvbid0IHdhbnQgdGhhdCB0aGUgc3VzdGFpbiBwZWRhbCBwcmV2ZW50cyB0aGUgYW4gZXZlbnQgdG8gdW5zY2hlZHVsZWRcbiAgICAgIGlmKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLnB1c2goZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIH1lbHNle1xuICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ3N0b3AnLCB0aW1lLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgICAgIHNhbXBsZS5vdXRwdXQuZGlzY29ubmVjdCgpXG4gICAgICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmRlbGV0ZShldmVudC5taWRpTm90ZUlkKVxuICAgICAgICB9KVxuICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICB9XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vIHN1c3RhaW4gcGVkYWxcbiAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IHRydWVcbiAgICAgICAgICAvLy8qXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgIGRhdGE6ICdkb3duJ1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8qL1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgZG93bicpXG4gICAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICAgICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5mb3JFYWNoKChtaWRpTm90ZUlkKSA9PiB7XG4gICAgICAgICAgICBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZ2V0KG1pZGlOb3RlSWQpXG4gICAgICAgICAgICBpZihzYW1wbGUpe1xuICAgICAgICAgICAgICAvL3NhbXBsZS5zdG9wKHRpbWUpXG4gICAgICAgICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wJywgbWlkaU5vdGVJZClcbiAgICAgICAgICAgICAgICBzYW1wbGUub3V0cHV0LmRpc2Nvbm5lY3QoKVxuICAgICAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5kZWxldGUobWlkaU5vdGVJZClcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgdXAnLCB0aGlzLnN1c3RhaW5lZFNhbXBsZXMpXG4gICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICAgICAgICAvLy8qXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsJyxcbiAgICAgICAgICAgIGRhdGE6ICd1cCdcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vKi9cbiAgICAgICAgICAvL3RoaXMuc3RvcFN1c3RhaW4odGltZSk7XG4gICAgICAgIH1cblxuICAgICAgLy8gcGFubmluZ1xuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTEgPT09IDEwKXtcbiAgICAgICAgLy8gcGFubmluZyBpcyAqbm90KiBleGFjdGx5IHRpbWVkIC0+IG5vdCBwb3NzaWJsZSAoeWV0KSB3aXRoIFdlYkF1ZGlvXG4gICAgICAgIC8vY29uc29sZS5sb2coZGF0YTIsIHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG4gICAgICAgIC8vdHJhY2suc2V0UGFubmluZyhyZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuXG4gICAgICAvLyB2b2x1bWVcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGExID09PSA3KXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBtYW5kYXRvcnlcbiAgYWxsTm90ZXNPZmYoKXtcbiAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXVxuICAgIGlmKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSl7XG4gICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbCcsXG4gICAgICAgIGRhdGE6ICd1cCdcbiAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG5cbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZm9yRWFjaChzYW1wbGUgPT4ge1xuICAgICAgc2FtcGxlLnN0b3AoY29udGV4dC5jdXJyZW50VGltZSlcbiAgICAgIHNhbXBsZS5vdXRwdXQuZGlzY29ubmVjdCgpXG4gICAgfSlcbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuY2xlYXIoKVxuICB9XG5cbiAgLy8gbWFuZGF0b3J5XG4gIHVuc2NoZWR1bGUobWlkaUV2ZW50KXtcbiAgICBsZXQgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmdldChtaWRpRXZlbnQubWlkaU5vdGVJZClcbiAgICBpZihzYW1wbGUpe1xuICAgICAgc2FtcGxlLnN0b3AoY29udGV4dC5jdXJyZW50VGltZSlcbiAgICAgIHNhbXBsZS5vdXRwdXQuZGlzY29ubmVjdCgpXG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuZGVsZXRlKG1pZGlFdmVudC5taWRpTm90ZUlkKVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHtUcmFja30gZnJvbSAnLi90cmFjaydcbmltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtwYXJzZUV2ZW50cywgcGFyc2VNSURJTm90ZXN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7Y2hlY2tNSURJTnVtYmVyfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2NhbGN1bGF0ZVBvc2l0aW9ufSBmcm9tICcuL3Bvc2l0aW9uJ1xuaW1wb3J0IHtTYW1wbGVyfSBmcm9tICcuL3NhbXBsZXInXG5pbXBvcnQge2dldEluaXREYXRhfSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge01JRElFdmVudFR5cGVzfSBmcm9tICcuL2NvbnN0YW50cydcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuXG5cbmxldFxuICBtZXRob2RNYXAgPSBuZXcgTWFwKFtcbiAgICBbJ3ZvbHVtZScsICdzZXRWb2x1bWUnXSxcbiAgICBbJ2luc3RydW1lbnQnLCAnc2V0SW5zdHJ1bWVudCddLFxuICAgIFsnbm90ZU51bWJlckFjY2VudGVkVGljaycsICdzZXROb3RlTnVtYmVyQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2snXSxcbiAgICBbJ3ZlbG9jaXR5QWNjZW50ZWRUaWNrJywgJ3NldFZlbG9jaXR5QWNjZW50ZWRUaWNrJ10sXG4gICAgWyd2ZWxvY2l0eU5vbkFjY2VudGVkVGljaycsICdzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljayddLFxuICAgIFsnbm90ZUxlbmd0aEFjY2VudGVkVGljaycsICdzZXROb3RlTGVuZ3RoQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snXVxuICBdKTtcblxuZXhwb3J0IGNsYXNzIE1ldHJvbm9tZXtcblxuICBjb25zdHJ1Y3Rvcihzb25nKXtcbiAgICB0aGlzLnNvbmcgPSBzb25nXG4gICAgdGhpcy50cmFjayA9IG5ldyBUcmFjayh7bmFtZTogdGhpcy5zb25nLmlkICsgJ19tZXRyb25vbWUnfSlcbiAgICB0aGlzLnBhcnQgPSBuZXcgUGFydCgpXG4gICAgdGhpcy50cmFjay5hZGRQYXJ0cyh0aGlzLnBhcnQpXG4gICAgdGhpcy50cmFjay5jb25uZWN0KHRoaXMuc29uZy5fb3V0cHV0KVxuXG4gICAgdGhpcy5ldmVudHMgPSBbXVxuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSBbXVxuICAgIHRoaXMucHJlY291bnREdXJhdGlvbiA9IDBcbiAgICB0aGlzLmJhcnMgPSAwXG4gICAgdGhpcy5pbmRleCA9IDBcbiAgICB0aGlzLmluZGV4MiA9IDBcbiAgICB0aGlzLnByZWNvdW50SW5kZXggPSAwXG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cblxuICByZXNldCgpe1xuXG4gICAgbGV0IGRhdGEgPSBnZXRJbml0RGF0YSgpXG4gICAgbGV0IGluc3RydW1lbnQgPSBuZXcgU2FtcGxlcignbWV0cm9ub21lJylcbiAgICBpbnN0cnVtZW50LnVwZGF0ZVNhbXBsZURhdGEoe1xuICAgICAgbm90ZTogNjAsXG4gICAgICBidWZmZXI6IGRhdGEubG93dGljayxcbiAgICB9LCB7XG4gICAgICBub3RlOiA2MSxcbiAgICAgIGJ1ZmZlcjogZGF0YS5oaWdodGljayxcbiAgICB9KVxuICAgIHRoaXMudHJhY2suc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KVxuXG4gICAgdGhpcy52b2x1bWUgPSAxXG5cbiAgICB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA9IDYxXG4gICAgdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWQgPSA2MFxuXG4gICAgdGhpcy52ZWxvY2l0eUFjY2VudGVkID0gMTAwXG4gICAgdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkID0gMTAwXG5cbiAgICB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA9IHRoaXMuc29uZy5wcHEgLyA0IC8vIHNpeHRlZW50aCBub3RlcyAtPiBkb24ndCBtYWtlIHRoaXMgdG9vIHNob3J0IGlmIHlvdXIgc2FtcGxlIGhhcyBhIGxvbmcgYXR0YWNrIVxuICAgIHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkID0gdGhpcy5zb25nLnBwcSAvIDRcbiAgfVxuXG4gIGNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZCA9ICdpbml0Jyl7XG4gICAgbGV0IGksIGpcbiAgICBsZXQgcG9zaXRpb25cbiAgICBsZXQgdmVsb2NpdHlcbiAgICBsZXQgbm90ZUxlbmd0aFxuICAgIGxldCBub3RlTnVtYmVyXG4gICAgbGV0IGJlYXRzUGVyQmFyXG4gICAgbGV0IHRpY2tzUGVyQmVhdFxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgbm90ZU9uLCBub3RlT2ZmXG4gICAgbGV0IGV2ZW50cyA9IFtdXG5cbiAgICAvL2NvbnNvbGUubG9nKHN0YXJ0QmFyLCBlbmRCYXIpO1xuXG4gICAgZm9yKGkgPSBzdGFydEJhcjsgaSA8PSBlbmRCYXI7IGkrKyl7XG4gICAgICBwb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgICAgdGFyZ2V0OiBbaV0sXG4gICAgICB9KVxuXG4gICAgICBiZWF0c1BlckJhciA9IHBvc2l0aW9uLm5vbWluYXRvclxuICAgICAgdGlja3NQZXJCZWF0ID0gcG9zaXRpb24udGlja3NQZXJCZWF0XG4gICAgICB0aWNrcyA9IHBvc2l0aW9uLnRpY2tzXG5cbiAgICAgIGZvcihqID0gMDsgaiA8IGJlYXRzUGVyQmFyOyBqKyspe1xuXG4gICAgICAgIG5vdGVOdW1iZXIgPSBqID09PSAwID8gdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgOiB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZFxuICAgICAgICBub3RlTGVuZ3RoID0gaiA9PT0gMCA/IHRoaXMubm90ZUxlbmd0aEFjY2VudGVkIDogdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWRcbiAgICAgICAgdmVsb2NpdHkgPSBqID09PSAwID8gdGhpcy52ZWxvY2l0eUFjY2VudGVkIDogdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkXG5cbiAgICAgICAgbm90ZU9uID0gbmV3IE1JRElFdmVudCh0aWNrcywgMTQ0LCBub3RlTnVtYmVyLCB2ZWxvY2l0eSlcbiAgICAgICAgbm90ZU9mZiA9IG5ldyBNSURJRXZlbnQodGlja3MgKyBub3RlTGVuZ3RoLCAxMjgsIG5vdGVOdW1iZXIsIDApXG5cbiAgICAgICAgaWYoaWQgPT09ICdwcmVjb3VudCcpe1xuICAgICAgICAgIG5vdGVPbi5fdHJhY2sgPSB0aGlzLnRyYWNrXG4gICAgICAgICAgbm90ZU9mZi5fdHJhY2sgPSB0aGlzLnRyYWNrXG4gICAgICAgICAgbm90ZU9uLl9wYXJ0ID0ge31cbiAgICAgICAgICBub3RlT2ZmLl9wYXJ0ID0ge31cbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50cy5wdXNoKG5vdGVPbiwgbm90ZU9mZilcbiAgICAgICAgdGlja3MgKz0gdGlja3NQZXJCZWF0XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2ZW50c1xuICB9XG5cblxuICBnZXRFdmVudHMoc3RhcnRCYXIgPSAxLCBlbmRCYXIgPSB0aGlzLnNvbmcuYmFycywgaWQgPSAnaW5pdCcpe1xuICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcy5wYXJ0LmdldEV2ZW50cygpKVxuICAgIHRoaXMuZXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgaWQpXG4gICAgdGhpcy5wYXJ0LmFkZEV2ZW50cyguLi50aGlzLmV2ZW50cylcbiAgICB0aGlzLmJhcnMgPSB0aGlzLnNvbmcuYmFyc1xuICAgIC8vY29uc29sZS5sb2coJ2dldEV2ZW50cyAlTycsIHRoaXMuZXZlbnRzKVxuICAgIHRoaXMuYWxsRXZlbnRzID0gWy4uLnRoaXMuZXZlbnRzLCAuLi50aGlzLnNvbmcuX3RpbWVFdmVudHNdXG4gICAgLy8gY29uc29sZS5sb2codGhpcy5hbGxFdmVudHMpXG4gICAgc29ydEV2ZW50cyh0aGlzLmFsbEV2ZW50cylcbiAgICBwYXJzZU1JRElOb3Rlcyh0aGlzLmV2ZW50cylcbiAgICByZXR1cm4gdGhpcy5ldmVudHNcbiAgfVxuXG5cbiAgc2V0SW5kZXgyKG1pbGxpcyl7XG4gICAgdGhpcy5pbmRleDIgPSAwXG4gIH1cblxuICBnZXRFdmVudHMyKG1heHRpbWUsIHRpbWVTdGFtcCl7XG4gICAgbGV0IHJlc3VsdCA9IFtdXG5cbiAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4MiwgbWF4aSA9IHRoaXMuYWxsRXZlbnRzLmxlbmd0aDsgaSA8IG1heGk7IGkrKyl7XG5cbiAgICAgIGxldCBldmVudCA9IHRoaXMuYWxsRXZlbnRzW2ldXG5cbiAgICAgIGlmKGV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLlRFTVBPIHx8IGV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLlRJTUVfU0lHTkFUVVJFKXtcbiAgICAgICAgaWYoZXZlbnQubWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgICAgdGhpcy5taWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGlja1xuICAgICAgICAgIHRoaXMuaW5kZXgyKytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuXG4gICAgICB9ZWxzZXtcbiAgICAgICAgbGV0IG1pbGxpcyA9IGV2ZW50LnRpY2tzICogdGhpcy5taWxsaXNQZXJUaWNrXG4gICAgICAgIGlmKG1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIGV2ZW50LnRpbWUgPSBtaWxsaXMgKyB0aW1lU3RhbXBcbiAgICAgICAgICBldmVudC5taWxsaXMgPSBtaWxsaXNcbiAgICAgICAgICByZXN1bHQucHVzaChldmVudClcbiAgICAgICAgICB0aGlzLmluZGV4MisrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cblxuICBhZGRFdmVudHMoc3RhcnRCYXIgPSAxLCBlbmRCYXIgPSB0aGlzLnNvbmcuYmFycywgaWQgPSAnYWRkJyl7XG4gICAgLy8gY29uc29sZS5sb2coc3RhcnRCYXIsIGVuZEJhcilcbiAgICBsZXQgZXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgaWQpXG4gICAgdGhpcy5ldmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgdGhpcy5wYXJ0LmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgdGhpcy5iYXJzID0gZW5kQmFyXG4gICAgLy9jb25zb2xlLmxvZygnZ2V0RXZlbnRzICVPJywgdGhpcy5ldmVudHMsIGVuZEJhcilcbiAgICByZXR1cm4gZXZlbnRzXG4gIH1cblxuXG4gIGNyZWF0ZVByZWNvdW50RXZlbnRzKHN0YXJ0QmFyLCBlbmRCYXIsIHRpbWVTdGFtcCl7XG5cbiAgICB0aGlzLnRpbWVTdGFtcCA9IHRpbWVTdGFtcFxuXG4vLyAgIGxldCBzb25nU3RhcnRQb3NpdGlvbiA9IHRoaXMuc29uZy5nZXRQb3NpdGlvbigpXG5cbiAgICBsZXQgc29uZ1N0YXJ0UG9zaXRpb24gPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLnNvbmcsIHtcbiAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgdGFyZ2V0OiBbc3RhcnRCYXJdLFxuICAgICAgcmVzdWx0OiAnbWlsbGlzJyxcbiAgICB9KVxuICAgIC8vY29uc29sZS5sb2coJ3N0YXJCYXInLCBzb25nU3RhcnRQb3NpdGlvbi5iYXIpXG5cbiAgICBsZXQgZW5kUG9zID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcy5zb25nLCB7XG4gICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgIC8vdGFyZ2V0OiBbc29uZ1N0YXJ0UG9zaXRpb24uYmFyICsgcHJlY291bnQsIHNvbmdTdGFydFBvc2l0aW9uLmJlYXQsIHNvbmdTdGFydFBvc2l0aW9uLnNpeHRlZW50aCwgc29uZ1N0YXJ0UG9zaXRpb24udGlja10sXG4gICAgICB0YXJnZXQ6IFtlbmRCYXJdLFxuICAgICAgcmVzdWx0OiAnbWlsbGlzJyxcbiAgICB9KVxuXG4gICAgLy9jb25zb2xlLmxvZyhzb25nU3RhcnRQb3NpdGlvbiwgZW5kUG9zKVxuXG4gICAgdGhpcy5wcmVjb3VudEluZGV4ID0gMFxuICAgIHRoaXMuc3RhcnRNaWxsaXMgPSBzb25nU3RhcnRQb3NpdGlvbi5taWxsaXNcbiAgICB0aGlzLmVuZE1pbGxpcyA9IGVuZFBvcy5taWxsaXNcbiAgICB0aGlzLnByZWNvdW50RHVyYXRpb24gPSBlbmRQb3MubWlsbGlzIC0gdGhpcy5zdGFydE1pbGxpc1xuXG4gICAgLy8gZG8gdGhpcyBzbyB5b3UgY2FuIHN0YXJ0IHByZWNvdW50aW5nIGF0IGFueSBwb3NpdGlvbiBpbiB0aGUgc29uZ1xuICAgIHRoaXMudGltZVN0YW1wIC09IHRoaXMuc3RhcnRNaWxsaXNcblxuICAgIC8vY29uc29sZS5sb2codGhpcy5wcmVjb3VudER1cmF0aW9uLCB0aGlzLnN0YXJ0TWlsbGlzLCB0aGlzLmVuZE1pbGxpcylcblxuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSB0aGlzLmNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyIC0gMSwgJ3ByZWNvdW50Jyk7XG4gICAgdGhpcy5wcmVjb3VudEV2ZW50cyA9IHBhcnNlRXZlbnRzKFsuLi50aGlzLnNvbmcuX3RpbWVFdmVudHMsIC4uLnRoaXMucHJlY291bnRFdmVudHNdKVxuXG4gICAgLy9jb25zb2xlLmxvZyhzb25nU3RhcnRQb3NpdGlvbi5iYXIsIGVuZFBvcy5iYXIsIHByZWNvdW50LCB0aGlzLnByZWNvdW50RXZlbnRzLmxlbmd0aCk7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnByZWNvdW50RXZlbnRzLmxlbmd0aCwgdGhpcy5wcmVjb3VudER1cmF0aW9uKTtcbiAgICByZXR1cm4gdGhpcy5wcmVjb3VudER1cmF0aW9uXG4gIH1cblxuXG4gIHNldFByZWNvdW50SW5kZXgobWlsbGlzKXtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yKGxldCBldmVudCBvZiB0aGlzLmV2ZW50cyl7XG4gICAgICBpZihldmVudC5taWxsaXMgPj0gbWlsbGlzKXtcbiAgICAgICAgdGhpcy5wcmVjb3VudEluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRoaXMucHJlY291bnRJbmRleClcbiAgfVxuXG5cbiAgLy8gY2FsbGVkIGJ5IHNjaGVkdWxlci5qc1xuICBnZXRQcmVjb3VudEV2ZW50cyhtYXh0aW1lKXtcbiAgICBsZXQgZXZlbnRzID0gdGhpcy5wcmVjb3VudEV2ZW50cyxcbiAgICAgIG1heGkgPSBldmVudHMubGVuZ3RoLCBpLCBldnQsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICAgIC8vbWF4dGltZSArPSB0aGlzLnByZWNvdW50RHVyYXRpb25cblxuICAgIGZvcihpID0gdGhpcy5wcmVjb3VudEluZGV4OyBpIDwgbWF4aTsgaSsrKXtcbiAgICAgIGV2dCA9IGV2ZW50c1tpXTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCBtYXh0aW1lLCB0aGlzLm1pbGxpcyk7XG4gICAgICBpZihldnQubWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgIGV2dC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldnQubWlsbGlzXG4gICAgICAgIHJlc3VsdC5wdXNoKGV2dClcbiAgICAgICAgdGhpcy5wcmVjb3VudEluZGV4KytcbiAgICAgIH1lbHNle1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyhyZXN1bHQubGVuZ3RoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cblxuICBtdXRlKGZsYWcpe1xuICAgIHRoaXMudHJhY2subXV0ZWQgPSBmbGFnXG4gIH1cblxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy50cmFjay5faW5zdHJ1bWVudC5hbGxOb3Rlc09mZigpXG4gIH1cblxuXG4gIC8vID09PT09PT09PT09IENPTkZJR1VSQVRJT04gPT09PT09PT09PT1cblxuICB1cGRhdGVDb25maWcoKXtcbiAgICB0aGlzLmluaXQoMSwgdGhpcy5iYXJzLCAndXBkYXRlJylcbiAgICB0aGlzLmFsbE5vdGVzT2ZmKClcbiAgICB0aGlzLnNvbmcudXBkYXRlKClcbiAgfVxuXG4gIC8vIGFkZGVkIHRvIHB1YmxpYyBBUEk6IFNvbmcuY29uZmlndXJlTWV0cm9ub21lKHt9KVxuICBjb25maWd1cmUoY29uZmlnKXtcblxuICAgIE9iamVjdC5rZXlzKGNvbmZpZykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgdGhpc1ttZXRob2RNYXAuZ2V0KGtleSldKGNvbmZpZy5rZXkpO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KXtcbiAgICBpZighaW5zdHJ1bWVudCBpbnN0YW5jZW9mIEluc3RydW1lbnQpe1xuICAgICAgY29uc29sZS53YXJuKCdub3QgYW4gaW5zdGFuY2Ugb2YgSW5zdHJ1bWVudCcpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy50cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpXG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZUxlbmd0aEFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgaWYoaXNOYU4odmFsdWUpKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy5ub3RlTGVuZ3RoQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXROb3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICBpZihpc05hTih2YWx1ZSkpe1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldFZlbG9jaXR5QWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICB2YWx1ZSA9IGNoZWNrTUlESU51bWJlcih2YWx1ZSk7XG4gICAgaWYodmFsdWUgIT09IGZhbHNlKXtcbiAgICAgIHRoaXMudmVsb2NpdHlBY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZU51bWJlckFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXROb3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICB2YWx1ZSA9IGNoZWNrTUlESU51bWJlcih2YWx1ZSk7XG4gICAgaWYodmFsdWUgIT09IGZhbHNlKXtcbiAgICAgIHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldFZvbHVtZSh2YWx1ZSl7XG4gICAgdGhpcy50cmFjay5zZXRWb2x1bWUodmFsdWUpO1xuICB9XG59XG5cbiIsIi8vIEAgZmxvd1xuaW1wb3J0IHtnZXROb3RlRGF0YX0gZnJvbSAnLi9ub3RlJ1xuaW1wb3J0IHtnZXRTZXR0aW5nc30gZnJvbSAnLi9zZXR0aW5ncydcblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBNSURJRXZlbnR7XG5cbiAgY29uc3RydWN0b3IodGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyID0gLTEsIGNoYW5uZWw6bnVtYmVyID0gMCl7XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMudGlja3MgPSB0aWNrc1xuICAgIHRoaXMuZGF0YTEgPSBkYXRhMVxuICAgIHRoaXMuZGF0YTIgPSBkYXRhMlxuICAgIHRoaXMucGl0Y2ggPSBnZXRTZXR0aW5ncygpLnBpdGNoXG5cbiAgICAvKiB0ZXN0IHdoZXRoZXIgdHlwZSBpcyBhIHN0YXR1cyBieXRlIG9yIGEgY29tbWFuZDogKi9cblxuICAgIC8vIDEuIHRoZSBoaWdoZXIgNCBiaXRzIG9mIHRoZSBzdGF0dXMgYnl0ZSBmb3JtIHRoZSBjb21tYW5kXG4gICAgdGhpcy50eXBlID0gKHR5cGUgPj4gNCkgKiAxNlxuICAgIC8vdGhpcy50eXBlID0gdGhpcy5jb21tYW5kID0gKHR5cGUgPj4gNCkgKiAxNlxuXG4gICAgLy8gMi4gZmlsdGVyIGNoYW5uZWwgZXZlbnRzXG4gICAgaWYodGhpcy50eXBlID49IDB4ODAgJiYgdGhpcy50eXBlIDw9IDB4RTApe1xuICAgICAgLy8gMy4gZ2V0IHRoZSBjaGFubmVsIG51bWJlclxuICAgICAgaWYoY2hhbm5lbCA+IDApe1xuICAgICAgICAvLyBhIGNoYW5uZWwgaXMgc2V0LCB0aGlzIG92ZXJydWxlcyB0aGUgY2hhbm5lbCBudW1iZXIgaW4gdGhlIHN0YXR1cyBieXRlXG4gICAgICAgIHRoaXMuY2hhbm5lbCA9IGNoYW5uZWxcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyBleHRyYWN0IHRoZSBjaGFubmVsIGZyb20gdGhlIHN0YXR1cyBieXRlOiB0aGUgbG93ZXIgNCBiaXRzIG9mIHRoZSBzdGF0dXMgYnl0ZSBmb3JtIHRoZSBjaGFubmVsIG51bWJlclxuICAgICAgICB0aGlzLmNoYW5uZWwgPSAodHlwZSAmIDB4RilcbiAgICAgIH1cbiAgICAgIC8vdGhpcy5zdGF0dXMgPSB0aGlzLmNvbW1hbmQgKyB0aGlzLmNoYW5uZWxcbiAgICB9ZWxzZXtcbiAgICAgIC8vIDQuIG5vdCBhIGNoYW5uZWwgZXZlbnQsIHNldCB0aGUgdHlwZSBhbmQgY29tbWFuZCB0byB0aGUgdmFsdWUgb2YgdHlwZSBhcyBwcm92aWRlZCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICAgIC8vdGhpcy50eXBlID0gdGhpcy5jb21tYW5kID0gdHlwZVxuICAgICAgdGhpcy5jaGFubmVsID0gMCAvLyBhbnlcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLCB0aGlzLnR5cGUsIHRoaXMuY29tbWFuZCwgdGhpcy5zdGF0dXMsIHRoaXMuY2hhbm5lbCwgdGhpcy5pZClcblxuICAgIC8vIHNvbWV0aW1lcyBOT1RFX09GRiBldmVudHMgYXJlIHNlbnQgYXMgTk9URV9PTiBldmVudHMgd2l0aCBhIDAgdmVsb2NpdHkgdmFsdWVcbiAgICBpZih0eXBlID09PSAxNDQgJiYgZGF0YTIgPT09IDApe1xuICAgICAgdGhpcy50eXBlID0gMTI4XG4gICAgfVxuXG4gICAgdGhpcy5fcGFydCA9IG51bGxcbiAgICB0aGlzLl90cmFjayA9IG51bGxcbiAgICB0aGlzLl9zb25nID0gbnVsbFxuXG4gICAgaWYodHlwZSA9PT0gMTQ0IHx8IHR5cGUgPT09IDEyOCl7XG4gICAgICAoe1xuICAgICAgICBuYW1lOiB0aGlzLm5vdGVOYW1lLFxuICAgICAgICBmdWxsTmFtZTogdGhpcy5mdWxsTm90ZU5hbWUsXG4gICAgICAgIGZyZXF1ZW5jeTogdGhpcy5mcmVxdWVuY3ksXG4gICAgICAgIG9jdGF2ZTogdGhpcy5vY3RhdmVcbiAgICAgIH0gPSBnZXROb3RlRGF0YSh7bnVtYmVyOiBkYXRhMX0pKVxuICAgIH1cbiAgICAvL0BUT0RPOiBhZGQgYWxsIG90aGVyIHByb3BlcnRpZXNcbiAgfVxuXG4gIGNvcHkoKXtcbiAgICBsZXQgbSA9IG5ldyBNSURJRXZlbnQodGhpcy50aWNrcywgdGhpcy50eXBlLCB0aGlzLmRhdGExLCB0aGlzLmRhdGEyKVxuICAgIHJldHVybiBtXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpeyAvLyBtYXkgYmUgYmV0dGVyIGlmIG5vdCBhIHB1YmxpYyBtZXRob2Q/XG4gICAgdGhpcy5kYXRhMSArPSBhbW91bnRcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IHRoaXMucGl0Y2ggKiBNYXRoLnBvdygyLCAodGhpcy5kYXRhMSAtIDY5KSAvIDEyKVxuICB9XG5cbiAgdXBkYXRlUGl0Y2gobmV3UGl0Y2gpe1xuICAgIGlmKG5ld1BpdGNoID09PSB0aGlzLnBpdGNoKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnBpdGNoID0gbmV3UGl0Y2hcbiAgICB0aGlzLnRyYW5zcG9zZSgwKVxuICB9XG5cbiAgbW92ZSh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLnRpY2tzICs9IHRpY2tzXG4gICAgaWYodGhpcy5taWRpTm90ZSl7XG4gICAgICB0aGlzLm1pZGlOb3RlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMudGlja3MgPSB0aWNrc1xuICAgIGlmKHRoaXMubWlkaU5vdGUpe1xuICAgICAgdGhpcy5taWRpTm90ZS51cGRhdGUoKVxuICAgIH1cbiAgfVxufVxuXG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlTUlESUV2ZW50KGV2ZW50KXtcbiAgLy9ldmVudC5ub3RlID0gbnVsbFxuICBldmVudC5ub3RlID0gbnVsbFxuICBldmVudCA9IG51bGxcbn1cbiovXG4iLCJpbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIE1JRElOb3Rle1xuXG4gIGNvbnN0cnVjdG9yKG5vdGVvbjogTUlESUV2ZW50LCBub3Rlb2ZmOiBNSURJRXZlbnQpe1xuICAgIC8vaWYobm90ZW9uLnR5cGUgIT09IDE0NCB8fCBub3Rlb2ZmLnR5cGUgIT09IDEyOCl7XG4gICAgaWYobm90ZW9uLnR5cGUgIT09IDE0NCl7XG4gICAgICBjb25zb2xlLndhcm4oJ2Nhbm5vdCBjcmVhdGUgTUlESU5vdGUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5vdGVPbiA9IG5vdGVvblxuICAgIG5vdGVvbi5taWRpTm90ZSA9IHRoaXNcbiAgICBub3Rlb24ubWlkaU5vdGVJZCA9IHRoaXMuaWRcblxuICAgIGlmKG5vdGVvZmYgaW5zdGFuY2VvZiBNSURJRXZlbnQpe1xuICAgICAgdGhpcy5ub3RlT2ZmID0gbm90ZW9mZlxuICAgICAgbm90ZW9mZi5taWRpTm90ZSA9IHRoaXNcbiAgICAgIG5vdGVvZmYubWlkaU5vdGVJZCA9IHRoaXMuaWRcbiAgICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IG5vdGVvZmYudGlja3MgLSBub3Rlb24udGlja3NcbiAgICAgIHRoaXMuZHVyYXRpb25NaWxsaXMgPSAtMVxuICAgIH1cbiAgfVxuXG4gIGFkZE5vdGVPZmYobm90ZW9mZil7XG4gICAgdGhpcy5ub3RlT2ZmID0gbm90ZW9mZlxuICAgIG5vdGVvZmYubWlkaU5vdGUgPSB0aGlzXG4gICAgbm90ZW9mZi5taWRpTm90ZUlkID0gdGhpcy5pZFxuICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IG5vdGVvZmYudGlja3MgLSB0aGlzLm5vdGVPbi50aWNrc1xuICAgIHRoaXMuZHVyYXRpb25NaWxsaXMgPSAtMVxuICB9XG5cbiAgY29weSgpe1xuICAgIHJldHVybiBuZXcgTUlESU5vdGUodGhpcy5ub3RlT24uY29weSgpLCB0aGlzLm5vdGVPZmYuY29weSgpKVxuICB9XG5cbiAgdXBkYXRlKCl7IC8vIG1heSB1c2UgYW5vdGhlciBuYW1lIGZvciB0aGlzIG1ldGhvZFxuICAgIHRoaXMuZHVyYXRpb25UaWNrcyA9IHRoaXMubm90ZU9mZi50aWNrcyAtIHRoaXMubm90ZU9uLnRpY2tzXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLnRyYW5zcG9zZShhbW91bnQpXG4gICAgdGhpcy5ub3RlT2ZmLnRyYW5zcG9zZShhbW91bnQpXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLm1vdmUodGlja3MpXG4gICAgdGhpcy5ub3RlT2ZmLm1vdmUodGlja3MpXG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcik6IHZvaWR7XG4gICAgdGhpcy5ub3RlT24ubW92ZVRvKHRpY2tzKVxuICAgIHRoaXMubm90ZU9mZi5tb3ZlVG8odGlja3MpXG4gIH1cblxuICB1bnJlZ2lzdGVyKCl7XG4gICAgaWYodGhpcy5wYXJ0KXtcbiAgICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMucGFydCA9IG51bGxcbiAgICB9XG4gICAgaWYodGhpcy50cmFjayl7XG4gICAgICB0aGlzLnRyYWNrLnJlbW92ZUV2ZW50cyh0aGlzKVxuICAgICAgdGhpcy50cmFjayA9IG51bGxcbiAgICB9XG4gICAgaWYodGhpcy5zb25nKXtcbiAgICAgIHRoaXMuc29uZy5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMuc29uZyA9IG51bGxcbiAgICB9XG4gIH1cbn1cblxuIiwiLypcbiAgV3JhcHBlciBmb3IgYWNjZXNzaW5nIGJ5dGVzIHRocm91Z2ggc2VxdWVudGlhbCByZWFkc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuICBhZGFwdGVkIHRvIHdvcmsgd2l0aCBBcnJheUJ1ZmZlciAtPiBVaW50OEFycmF5XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgZmNjID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUlESVN0cmVhbXtcblxuICAvLyBidWZmZXIgaXMgVWludDhBcnJheVxuICBjb25zdHJ1Y3RvcihidWZmZXIpe1xuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgLyogcmVhZCBzdHJpbmcgb3IgYW55IG51bWJlciBvZiBieXRlcyAqL1xuICByZWFkKGxlbmd0aCwgdG9TdHJpbmcgPSB0cnVlKSB7XG4gICAgbGV0IHJlc3VsdDtcblxuICAgIGlmKHRvU3RyaW5nKXtcbiAgICAgIHJlc3VsdCA9ICcnO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQgKz0gZmNjKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfWVsc2V7XG4gICAgICByZXN1bHQgPSBbXTtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAzMi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MzIoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCAyNCkgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXSA8PCAxNikgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAyXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgM11cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gNDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMTYtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDE2KCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYW4gOC1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50OChzaWduZWQpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl07XG4gICAgaWYoc2lnbmVkICYmIHJlc3VsdCA+IDEyNyl7XG4gICAgICByZXN1bHQgLT0gMjU2O1xuICAgIH1cbiAgICB0aGlzLnBvc2l0aW9uICs9IDE7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGVvZigpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbiA+PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICAvKiByZWFkIGEgTUlESS1zdHlsZSBsZXRpYWJsZS1sZW5ndGggaW50ZWdlclxuICAgIChiaWctZW5kaWFuIHZhbHVlIGluIGdyb3VwcyBvZiA3IGJpdHMsXG4gICAgd2l0aCB0b3AgYml0IHNldCB0byBzaWduaWZ5IHRoYXQgYW5vdGhlciBieXRlIGZvbGxvd3MpXG4gICovXG4gIHJlYWRWYXJJbnQoKSB7XG4gICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgbGV0IGIgPSB0aGlzLnJlYWRJbnQ4KCk7XG4gICAgICBpZiAoYiAmIDB4ODApIHtcbiAgICAgICAgcmVzdWx0ICs9IChiICYgMHg3Zik7XG4gICAgICAgIHJlc3VsdCA8PD0gNztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGIgaXMgdGhlIGxhc3QgYnl0ZSAqL1xuICAgICAgICByZXR1cm4gcmVzdWx0ICsgYjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNldCgpe1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgc2V0UG9zaXRpb24ocCl7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHA7XG4gIH1cbn1cbiIsIi8qXG4gIEV4dHJhY3RzIGFsbCBtaWRpIGV2ZW50cyBmcm9tIGEgYmluYXJ5IG1pZGkgZmlsZSwgdXNlcyBtaWRpX3N0cmVhbS5qc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTUlESVN0cmVhbSBmcm9tICcuL21pZGlfc3RyZWFtJztcblxubGV0XG4gIGxhc3RFdmVudFR5cGVCeXRlLFxuICB0cmFja05hbWU7XG5cblxuZnVuY3Rpb24gcmVhZENodW5rKHN0cmVhbSl7XG4gIGxldCBpZCA9IHN0cmVhbS5yZWFkKDQsIHRydWUpO1xuICBsZXQgbGVuZ3RoID0gc3RyZWFtLnJlYWRJbnQzMigpO1xuICAvL2NvbnNvbGUubG9nKGxlbmd0aCk7XG4gIHJldHVybntcbiAgICAnaWQnOiBpZCxcbiAgICAnbGVuZ3RoJzogbGVuZ3RoLFxuICAgICdkYXRhJzogc3RyZWFtLnJlYWQobGVuZ3RoLCBmYWxzZSlcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiByZWFkRXZlbnQoc3RyZWFtKXtcbiAgdmFyIGV2ZW50ID0ge307XG4gIHZhciBsZW5ndGg7XG4gIGV2ZW50LmRlbHRhVGltZSA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gIGxldCBldmVudFR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gIC8vY29uc29sZS5sb2coZXZlbnRUeXBlQnl0ZSwgZXZlbnRUeXBlQnl0ZSAmIDB4ODAsIDE0NiAmIDB4MGYpO1xuICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ZjApID09IDB4ZjApe1xuICAgIC8qIHN5c3RlbSAvIG1ldGEgZXZlbnQgKi9cbiAgICBpZihldmVudFR5cGVCeXRlID09IDB4ZmYpe1xuICAgICAgLyogbWV0YSBldmVudCAqL1xuICAgICAgZXZlbnQudHlwZSA9ICdtZXRhJztcbiAgICAgIGxldCBzdWJ0eXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIHN3aXRjaChzdWJ0eXBlQnl0ZSl7XG4gICAgICAgIGNhc2UgMHgwMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlTnVtYmVyJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2VxdWVuY2VOdW1iZXIgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWJlciA9IHN0cmVhbS5yZWFkSW50MTYoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RleHQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAyOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29weXJpZ2h0Tm90aWNlJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RyYWNrTmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2luc3RydW1lbnROYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2x5cmljcyc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtYXJrZXInO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA3OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY3VlUG9pbnQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDIwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWlkaUNoYW5uZWxQcmVmaXgnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMSl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBtaWRpQ2hhbm5lbFByZWZpeCBldmVudCBpcyAxLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQuY2hhbm5lbCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDJmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnZW5kT2ZUcmFjayc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAwKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGVuZE9mVHJhY2sgZXZlbnQgaXMgMCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDUxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2V0VGVtcG8nO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMyl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXRUZW1wbyBldmVudCBpcyAzLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdCA9IChcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCAxNikgK1xuICAgICAgICAgICAgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDgpICtcbiAgICAgICAgICAgIHN0cmVhbS5yZWFkSW50OCgpXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1NDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NtcHRlT2Zmc2V0JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDUpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc21wdGVPZmZzZXQgZXZlbnQgaXMgNSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBob3VyQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lUmF0ZSA9e1xuICAgICAgICAgICAgMHgwMDogMjQsIDB4MjA6IDI1LCAweDQwOiAyOSwgMHg2MDogMzBcbiAgICAgICAgICB9W2hvdXJCeXRlICYgMHg2MF07XG4gICAgICAgICAgZXZlbnQuaG91ciA9IGhvdXJCeXRlICYgMHgxZjtcbiAgICAgICAgICBldmVudC5taW4gPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zZWMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnN1YmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTg6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0aW1lU2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDQpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgdGltZVNpZ25hdHVyZSBldmVudCBpcyA0LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtZXJhdG9yID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZGVub21pbmF0b3IgPSBNYXRoLnBvdygyLCBzdHJlYW0ucmVhZEludDgoKSk7XG4gICAgICAgICAgZXZlbnQubWV0cm9ub21lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQudGhpcnR5c2Vjb25kcyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU5OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAna2V5U2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Iga2V5U2lnbmF0dXJlIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5rZXkgPSBzdHJlYW0ucmVhZEludDgodHJ1ZSk7XG4gICAgICAgICAgZXZlbnQuc2NhbGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg3ZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlclNwZWNpZmljJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9pZihzZXF1ZW5jZXIuZGVidWcgPj0gMil7XG4gICAgICAgICAgLy8gICAgY29uc29sZS53YXJuKCdVbnJlY29nbmlzZWQgbWV0YSBldmVudCBzdWJ0eXBlOiAnICsgc3VidHlwZUJ5dGUpO1xuICAgICAgICAgIC8vfVxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfVxuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2UgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGYwKXtcbiAgICAgIGV2ZW50LnR5cGUgPSAnc3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmNyl7XG4gICAgICBldmVudC50eXBlID0gJ2RpdmlkZWRTeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZSBieXRlOiAnICsgZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gIH1lbHNle1xuICAgIC8qIGNoYW5uZWwgZXZlbnQgKi9cbiAgICBsZXQgcGFyYW0xO1xuICAgIGlmKChldmVudFR5cGVCeXRlICYgMHg4MCkgPT09IDApe1xuICAgICAgLyogcnVubmluZyBzdGF0dXMgLSByZXVzZSBsYXN0RXZlbnRUeXBlQnl0ZSBhcyB0aGUgZXZlbnQgdHlwZS5cbiAgICAgICAgZXZlbnRUeXBlQnl0ZSBpcyBhY3R1YWxseSB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gICAgICAqL1xuICAgICAgLy9jb25zb2xlLmxvZygncnVubmluZyBzdGF0dXMnKTtcbiAgICAgIHBhcmFtMSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgICBldmVudFR5cGVCeXRlID0gbGFzdEV2ZW50VHlwZUJ5dGU7XG4gICAgfWVsc2V7XG4gICAgICBwYXJhbTEgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2xhc3QnLCBldmVudFR5cGVCeXRlKTtcbiAgICAgIGxhc3RFdmVudFR5cGVCeXRlID0gZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gICAgbGV0IGV2ZW50VHlwZSA9IGV2ZW50VHlwZUJ5dGUgPj4gNDtcbiAgICBldmVudC5jaGFubmVsID0gZXZlbnRUeXBlQnl0ZSAmIDB4MGY7XG4gICAgZXZlbnQudHlwZSA9ICdjaGFubmVsJztcbiAgICBzd2l0Y2ggKGV2ZW50VHlwZSl7XG4gICAgICBjYXNlIDB4MDg6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwOTpcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgaWYoZXZlbnQudmVsb2NpdHkgPT09IDApe1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdub3RlT24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGE6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZUFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC5hbW91bnQgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBiOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvbnRyb2xsZXInO1xuICAgICAgICBldmVudC5jb250cm9sbGVyVHlwZSA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBjOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Byb2dyYW1DaGFuZ2UnO1xuICAgICAgICBldmVudC5wcm9ncmFtTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGQ6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY2hhbm5lbEFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5hbW91bnQgPSBwYXJhbTE7XG4gICAgICAgIC8vaWYodHJhY2tOYW1lID09PSAnU0gtUzEtNDQtQzA5IEw9U01MIElOPTMnKXtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ2NoYW5uZWwgcHJlc3N1cmUnLCB0cmFja05hbWUsIHBhcmFtMSk7XG4gICAgICAgIC8vfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGU6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncGl0Y2hCZW5kJztcbiAgICAgICAgZXZlbnQudmFsdWUgPSBwYXJhbTEgKyAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgNyk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8qXG4gICAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlO1xuICAgICAgICBjb25zb2xlLmxvZygnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZSk7XG4gICAgICAgICovXG5cbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4vKlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgIGNvbnNvbGUubG9nKCd3ZWlyZG8nLCB0cmFja05hbWUsIHBhcmFtMSwgZXZlbnQudmVsb2NpdHkpO1xuKi9cblxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESUZpbGUoYnVmZmVyKXtcbiAgaWYoYnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSA9PT0gZmFsc2UgJiYgYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmVycm9yKCdidWZmZXIgc2hvdWxkIGJlIGFuIGluc3RhbmNlIG9mIFVpbnQ4QXJyYXkgb2YgQXJyYXlCdWZmZXInKVxuICAgIHJldHVyblxuICB9XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gIH1cbiAgbGV0IHRyYWNrcyA9IG5ldyBNYXAoKTtcbiAgbGV0IHN0cmVhbSA9IG5ldyBNSURJU3RyZWFtKGJ1ZmZlcik7XG5cbiAgbGV0IGhlYWRlckNodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gIGlmKGhlYWRlckNodW5rLmlkICE9PSAnTVRoZCcgfHwgaGVhZGVyQ2h1bmsubGVuZ3RoICE9PSA2KXtcbiAgICB0aHJvdyAnQmFkIC5taWQgZmlsZSAtIGhlYWRlciBub3QgZm91bmQnO1xuICB9XG5cbiAgbGV0IGhlYWRlclN0cmVhbSA9IG5ldyBNSURJU3RyZWFtKGhlYWRlckNodW5rLmRhdGEpO1xuICBsZXQgZm9ybWF0VHlwZSA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgbGV0IHRyYWNrQ291bnQgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0aW1lRGl2aXNpb24gPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG5cbiAgaWYodGltZURpdmlzaW9uICYgMHg4MDAwKXtcbiAgICB0aHJvdyAnRXhwcmVzc2luZyB0aW1lIGRpdmlzaW9uIGluIFNNVFBFIGZyYW1lcyBpcyBub3Qgc3VwcG9ydGVkIHlldCc7XG4gIH1cblxuICBsZXQgaGVhZGVyID17XG4gICAgJ2Zvcm1hdFR5cGUnOiBmb3JtYXRUeXBlLFxuICAgICd0cmFja0NvdW50JzogdHJhY2tDb3VudCxcbiAgICAndGlja3NQZXJCZWF0JzogdGltZURpdmlzaW9uXG4gIH07XG5cbiAgZm9yKGxldCBpID0gMDsgaSA8IHRyYWNrQ291bnQ7IGkrKyl7XG4gICAgdHJhY2tOYW1lID0gJ3RyYWNrXycgKyBpO1xuICAgIGxldCB0cmFjayA9IFtdO1xuICAgIGxldCB0cmFja0NodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gICAgaWYodHJhY2tDaHVuay5pZCAhPT0gJ01UcmsnKXtcbiAgICAgIHRocm93ICdVbmV4cGVjdGVkIGNodW5rIC0gZXhwZWN0ZWQgTVRyaywgZ290ICcrIHRyYWNrQ2h1bmsuaWQ7XG4gICAgfVxuICAgIGxldCB0cmFja1N0cmVhbSA9IG5ldyBNSURJU3RyZWFtKHRyYWNrQ2h1bmsuZGF0YSk7XG4gICAgd2hpbGUoIXRyYWNrU3RyZWFtLmVvZigpKXtcbiAgICAgIGxldCBldmVudCA9IHJlYWRFdmVudCh0cmFja1N0cmVhbSk7XG4gICAgICB0cmFjay5wdXNoKGV2ZW50KTtcbiAgICB9XG4gICAgdHJhY2tzLnNldCh0cmFja05hbWUsIHRyYWNrKTtcbiAgfVxuXG4gIHJldHVybntcbiAgICAnaGVhZGVyJzogaGVhZGVyLFxuICAgICd0cmFja3MnOiB0cmFja3NcbiAgfTtcbn0iLCJpbXBvcnQge2dldFNldHRpbmdzfSBmcm9tICcuL3NldHRpbmdzJ1xuXG5jb25zdCBwb3cgPSBNYXRoLnBvd1xuY29uc3QgZmxvb3IgPSBNYXRoLmZsb29yXG4vL2NvbnN0IGNoZWNrTm90ZU5hbWUgPSAvXltBLUddezF9KGJ7MCwyfX18I3swLDJ9KVtcXC1dezAsMX1bMC05XXsxfSQvXG5jb25zdCByZWdleENoZWNrTm90ZU5hbWUgPSAvXltBLUddezF9KGJ8YmJ8I3wjIyl7MCwxfSQvXG5jb25zdCByZWdleENoZWNrRnVsbE5vdGVOYW1lID0gL15bQS1HXXsxfShifGJifCN8IyMpezAsMX0oXFwtMXxbMC05XXsxfSkkL1xuY29uc3QgcmVnZXhTcGxpdEZ1bGxOYW1lID0gL14oW0EtR117MX0oYnxiYnwjfCMjKXswLDF9KShcXC0xfFswLTldezF9KSQvXG5jb25zdCByZWdleEdldE9jdGF2ZSA9IC8oXFwtMXxbMC05XXsxfSkkL1xuXG5jb25zdCBub3RlTmFtZXMgPSB7XG4gIHNoYXJwOiBbJ0MnLCAnQyMnLCAnRCcsICdEIycsICdFJywgJ0YnLCAnRiMnLCAnRycsICdHIycsICdBJywgJ0EjJywgJ0InXSxcbiAgZmxhdDogWydDJywgJ0RiJywgJ0QnLCAnRWInLCAnRScsICdGJywgJ0diJywgJ0cnLCAnQWInLCAnQScsICdCYicsICdCJ10sXG4gICdlbmhhcm1vbmljLXNoYXJwJzogWydCIycsICdDIycsICdDIyMnLCAnRCMnLCAnRCMjJywgJ0UjJywgJ0YjJywgJ0YjIycsICdHIycsICdHIyMnLCAnQSMnLCAnQSMjJ10sXG4gICdlbmhhcm1vbmljLWZsYXQnOiBbJ0RiYicsICdEYicsICdFYmInLCAnRWInLCAnRmInLCAnR2JiJywgJ0diJywgJ0FiYicsICdBYicsICdCYmInLCAnQmInLCAnQ2InXVxufVxuXG5sZXQgbm90ZU5hbWVNb2RlXG5sZXQgcGl0Y2hcblxuLypcbiAgc2V0dGluZ3MgPSB7XG4gICAgbmFtZTogJ0MnLFxuICAgIG9jdGF2ZTogNCxcbiAgICBmdWxsTmFtZTogJ0M0JyxcbiAgICBudW1iZXI6IDYwLFxuICAgIGZyZXF1ZW5jeTogMjM0LjE2IC8vIG5vdCB5ZXQgaW1wbGVtZW50ZWRcbiAgfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlRGF0YShzZXR0aW5ncyl7XG4gIGxldCB7XG4gICAgZnVsbE5hbWUsXG4gICAgbmFtZSxcbiAgICBvY3RhdmUsXG4gICAgbW9kZSxcbiAgICBudW1iZXIsXG4gICAgZnJlcXVlbmN5LFxuICB9ID0gc2V0dGluZ3M7XG5cbiAgKHtub3RlTmFtZU1vZGUsIHBpdGNofSA9IGdldFNldHRpbmdzKCkpXG5cbiAgaWYoXG4gICAgICAgdHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnXG4gICAgJiYgdHlwZW9mIGZ1bGxOYW1lICE9PSAnc3RyaW5nJ1xuICAgICYmIHR5cGVvZiBudW1iZXIgIT09ICdudW1iZXInXG4gICAgJiYgdHlwZW9mIGZyZXF1ZW5jeSAhPT0gJ251bWJlcicpe1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBpZihudW1iZXIgPCAwIHx8IG51bWJlciA+IDEyNyl7XG4gICAgY29uc29sZS5sb2coJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBiZXR3ZWVuIDAgKEMtMSkgYW5kIDEyNyAoRzkpJylcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgbW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShtb2RlKVxuICAvL2NvbnNvbGUubG9nKG1vZGUpXG5cbiAgaWYodHlwZW9mIG51bWJlciA9PT0gJ251bWJlcicpe1xuICAgICh7XG4gICAgICBmdWxsTmFtZSxcbiAgICAgIG5hbWUsXG4gICAgICBvY3RhdmVcbiAgICB9ID0gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSkpXG5cbiAgfWVsc2UgaWYodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKXtcblxuICAgIGlmKHJlZ2V4Q2hlY2tOb3RlTmFtZS50ZXN0KG5hbWUpKXtcbiAgICAgIGZ1bGxOYW1lID0gYCR7bmFtZX0ke29jdGF2ZX1gXG4gICAgICBudW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpXG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmxvZyhgaW52YWxpZCBuYW1lICR7bmFtZX1gKVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgfWVsc2UgaWYodHlwZW9mIGZ1bGxOYW1lID09PSAnc3RyaW5nJyl7XG5cbiAgICBpZihyZWdleENoZWNrRnVsbE5vdGVOYW1lLnRlc3QoZnVsbE5hbWUpKXtcbiAgICAgICh7XG4gICAgICAgIG9jdGF2ZSxcbiAgICAgICAgbmFtZSxcbiAgICAgICB9ID0gX3NwbGl0RnVsbE5hbWUoZnVsbE5hbWUpKVxuICAgICAgbnVtYmVyID0gX2dldE5vdGVOdW1iZXIobmFtZSwgb2N0YXZlKVxuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5sb2coYGludmFsaWQgZnVsbG5hbWUgJHtmdWxsTmFtZX1gKVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICBsZXQgZGF0YSA9IHtcbiAgICBuYW1lLFxuICAgIG9jdGF2ZSxcbiAgICBmdWxsTmFtZSxcbiAgICBudW1iZXIsXG4gICAgZnJlcXVlbmN5OiBfZ2V0RnJlcXVlbmN5KG51bWJlciksXG4gICAgYmxhY2tLZXk6IF9pc0JsYWNrS2V5KG51bWJlciksXG4gIH1cbiAgLy9jb25zb2xlLmxvZyhkYXRhKVxuICByZXR1cm4gZGF0YVxufVxuXG5cbmZ1bmN0aW9uIF9nZXROb3RlTmFtZShudW1iZXIsIG1vZGUgPSBub3RlTmFtZU1vZGUpIHtcbiAgLy9sZXQgb2N0YXZlID0gTWF0aC5mbG9vcigobnVtYmVyIC8gMTIpIC0gMiksIC8vIOKGkiBpbiBDdWJhc2UgY2VudHJhbCBDID0gQzMgaW5zdGVhZCBvZiBDNFxuICBsZXQgb2N0YXZlID0gZmxvb3IoKG51bWJlciAvIDEyKSAtIDEpXG4gIGxldCBuYW1lID0gbm90ZU5hbWVzW21vZGVdW251bWJlciAlIDEyXVxuICByZXR1cm4ge1xuICAgIGZ1bGxOYW1lOiBgJHtuYW1lfSR7b2N0YXZlfWAsXG4gICAgbmFtZSxcbiAgICBvY3RhdmUsXG4gIH1cbn1cblxuXG5mdW5jdGlvbiBfZ2V0T2N0YXZlKGZ1bGxOYW1lKXtcbiAgcmV0dXJuIHBhcnNlSW50KGZ1bGxOYW1lLm1hdGNoKHJlZ2V4R2V0T2N0YXZlKVswXSwgMTApXG59XG5cblxuZnVuY3Rpb24gX3NwbGl0RnVsbE5hbWUoZnVsbE5hbWUpe1xuICBsZXQgb2N0YXZlID0gX2dldE9jdGF2ZShmdWxsTmFtZSlcbiAgcmV0dXJue1xuICAgIG9jdGF2ZSxcbiAgICBuYW1lOiBmdWxsTmFtZS5yZXBsYWNlKG9jdGF2ZSwgJycpXG4gIH1cbn1cblxuXG5mdW5jdGlvbiBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpIHtcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpXG4gIGxldCBpbmRleFxuXG4gIGZvcihsZXQga2V5IG9mIGtleXMpe1xuICAgIGxldCBtb2RlID0gbm90ZU5hbWVzW2tleV1cbiAgICBpbmRleCA9IG1vZGUuZmluZEluZGV4KHggPT4geCA9PT0gbmFtZSlcbiAgICBpZihpbmRleCAhPT0gLTEpe1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICAvL251bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMikgKyAxMiAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgbGV0IG51bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMikvLyDihpIgbWlkaSBzdGFuZGFyZCArIHNjaWVudGlmaWMgbmFtaW5nLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWlkZGxlX0MgYW5kIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU2NpZW50aWZpY19waXRjaF9ub3RhdGlvblxuXG4gIGlmKG51bWJlciA8IDAgfHwgbnVtYmVyID4gMTI3KXtcbiAgICBjb25zb2xlLmxvZygncGxlYXNlIHByb3ZpZGUgYSBub3RlIGJldHdlZW4gMCAoQy0xKSBhbmQgMTI3IChHOSknKVxuICAgIHJldHVybiAtMVxuICB9XG4gIHJldHVybiBudW1iZXJcbn1cblxuXG5mdW5jdGlvbiBfZ2V0RnJlcXVlbmN5KG51bWJlcil7XG4gIHJldHVybiBwaXRjaCAqIHBvdygyLCAobnVtYmVyIC0gNjkpIC8gMTIpIC8vIG1pZGkgc3RhbmRhcmQsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NSURJX1R1bmluZ19TdGFuZGFyZFxufVxuXG5cbi8vQFRPRE86IGNhbGN1bGF0ZSBub3RlIGZyb20gZnJlcXVlbmN5XG5mdW5jdGlvbiBfZ2V0UGl0Y2goaGVydHope1xuICAvL2ZtICA9ICAyKG3iiJI2OSkvMTIoNDQwIEh6KS5cbn1cblxuXG5mdW5jdGlvbiBfY2hlY2tOb3RlTmFtZU1vZGUobW9kZSl7XG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKVxuICBsZXQgcmVzdWx0ID0ga2V5cy5pbmNsdWRlcyhtb2RlKVxuICAvL2NvbnNvbGUubG9nKHJlc3VsdClcbiAgaWYocmVzdWx0ID09PSBmYWxzZSl7XG4gICAgaWYodHlwZW9mIG1vZGUgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUubG9nKGAke21vZGV9IGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSBtb2RlLCB1c2luZyBcIiR7bm90ZU5hbWVNb2RlfVwiIGluc3RlYWRgKVxuICAgIH1cbiAgICBtb2RlID0gbm90ZU5hbWVNb2RlXG4gIH1cbiAgcmV0dXJuIG1vZGVcbn1cblxuXG5mdW5jdGlvbiBfaXNCbGFja0tleShub3RlTnVtYmVyKXtcbiAgbGV0IGJsYWNrXG5cbiAgc3dpdGNoKHRydWUpe1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxOi8vQyNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMzovL0QjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDY6Ly9GI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSA4Oi8vRyNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTA6Ly9BI1xuICAgICAgYmxhY2sgPSB0cnVlXG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYmxhY2sgPSBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIGJsYWNrXG59XG4iLCJpbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHt0eXBlU3RyaW5nLCBjaGVja0lmQmFzZTY0LCBiYXNlNjRUb0JpbmFyeX0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZVNhbXBsZShzYW1wbGUsIGlkLCBldmVyeSl7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcbiAgICB0cnl7XG4gICAgICBjb250ZXh0LmRlY29kZUF1ZGlvRGF0YShzYW1wbGUsXG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzKGJ1ZmZlcil7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhpZCwgYnVmZmVyKTtcbiAgICAgICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHJlc29sdmUoe2lkLCBidWZmZXJ9KVxuICAgICAgICAgICAgaWYoZXZlcnkpe1xuICAgICAgICAgICAgICBldmVyeSh7aWQsIGJ1ZmZlcn0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXNvbHZlKGJ1ZmZlcik7XG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KGJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uRXJyb3IoKXtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhIFtJRDogJHtpZH1dYCk7XG4gICAgICAgICAgLy9yZWplY3QoZSk7IC8vIGRvbid0IHVzZSByZWplY3QgYmVjYXVzZSB3ZSB1c2UgdGhpcyBhcyBhIG5lc3RlZCBwcm9taXNlIGFuZCB3ZSBkb24ndCB3YW50IHRoZSBwYXJlbnQgcHJvbWlzZSB0byByZWplY3RcbiAgICAgICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKVxuICAgIH1jYXRjaChlKXtcbiAgICAgIGNvbnNvbGUud2FybignZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpXG4gICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cblxuXG5mdW5jdGlvbiBsb2FkQW5kUGFyc2VTYW1wbGUodXJsLCBpZCwgZXZlcnkpe1xuICAvL2NvbnNvbGUubG9nKGlkLCB1cmwpXG4gIC8qXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ2xvYWRpbmcnLFxuICAgICAgZGF0YTogdXJsXG4gICAgfSlcbiAgfSwgMClcbiAgKi9cbiAgZGlzcGF0Y2hFdmVudCh7XG4gICAgdHlwZTogJ2xvYWRpbmcnLFxuICAgIGRhdGE6IHVybFxuICB9KVxuXG4gIGxldCBleGVjdXRvciA9IGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIC8vIGNvbnNvbGUubG9nKHVybClcbiAgICBmZXRjaCh1cmwsIHtcbiAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICB9KS50aGVuKFxuICAgICAgZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBpZihyZXNwb25zZS5vayl7XG4gICAgICAgICAgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhpZCwgZGF0YSlcbiAgICAgICAgICAgIGRlY29kZVNhbXBsZShkYXRhLCBpZCwgZXZlcnkpLnRoZW4ocmVzb2x2ZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9ZWxzZSBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICByZXNvbHZlKHtpZH0pXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgKVxuICB9XG4gIHJldHVybiBuZXcgUHJvbWlzZShleGVjdXRvcilcbn1cblxuXG5mdW5jdGlvbiBnZXRQcm9taXNlcyhwcm9taXNlcywgc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KXtcblxuICBjb25zdCBnZXRTYW1wbGUgPSBmdW5jdGlvbigpe1xuICAgIGlmKGtleSAhPT0gJ3JlbGVhc2UnICYmIGtleSAhPT0gJ2luZm8nICYmIGtleSAhPT0gJ3N1c3RhaW4nKXtcbiAgICAgIC8vY29uc29sZS5sb2coa2V5KVxuICAgICAgaWYoc2FtcGxlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe1xuICAgICAgICBwcm9taXNlcy5wdXNoKGRlY29kZVNhbXBsZShzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpKVxuICAgICAgfWVsc2UgaWYodHlwZW9mIHNhbXBsZSA9PT0gJ3N0cmluZycpe1xuICAgICAgICBpZihjaGVja0lmQmFzZTY0KHNhbXBsZSkpe1xuICAgICAgICAgIHByb21pc2VzLnB1c2goZGVjb2RlU2FtcGxlKGJhc2U2NFRvQmluYXJ5KHNhbXBsZSksIGtleSwgYmFzZVVybCwgZXZlcnkpKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGJhc2VVcmwgKyBzYW1wbGUpXG4gICAgICAgICAgcHJvbWlzZXMucHVzaChsb2FkQW5kUGFyc2VTYW1wbGUoYmFzZVVybCArIGVzY2FwZShzYW1wbGUpLCBrZXksIGV2ZXJ5KSlcbiAgICAgICAgfVxuICAgICAgfWVsc2UgaWYodHlwZW9mIHNhbXBsZSA9PT0gJ29iamVjdCcpe1xuICAgICAgICBzYW1wbGUgPSBzYW1wbGUuc2FtcGxlIHx8IHNhbXBsZS5idWZmZXIgfHwgc2FtcGxlLmJhc2U2NCB8fCBzYW1wbGUudXJsXG4gICAgICAgIGdldFNhbXBsZShwcm9taXNlcywgc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KVxuICAgICAgICAvL2NvbnNvbGUubG9nKGtleSwgc2FtcGxlKVxuICAgICAgICAvL2NvbnNvbGUubG9nKHNhbXBsZSwgcHJvbWlzZXMubGVuZ3RoKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFNhbXBsZSgpXG59XG5cblxuLy8gb25seSBmb3IgaW50ZXJuYWxseSB1c2UgaW4gcWFtYmlcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNhbXBsZXMyKG1hcHBpbmcsIGV2ZXJ5ID0gZmFsc2Upe1xuICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcobWFwcGluZyksXG4gICAgcHJvbWlzZXMgPSBbXSxcbiAgICBiYXNlVXJsID0gJydcblxuICBpZih0eXBlb2YgbWFwcGluZy5iYXNlVXJsID09PSAnc3RyaW5nJyl7XG4gICAgYmFzZVVybCA9IG1hcHBpbmcuYmFzZVVybFxuICAgIGRlbGV0ZSBtYXBwaW5nLmJhc2VVcmxcbiAgfVxuXG4gIC8vY29uc29sZS5sb2cobWFwcGluZywgYmFzZVVybClcblxuICBldmVyeSA9IHR5cGVvZiBldmVyeSA9PT0gJ2Z1bmN0aW9uJyA/IGV2ZXJ5IDogZmFsc2VcbiAgLy9jb25zb2xlLmxvZyh0eXBlLCBtYXBwaW5nKVxuICBpZih0eXBlID09PSAnb2JqZWN0Jyl7XG4gICAgT2JqZWN0LmtleXMobWFwcGluZykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgLy8gaWYoaXNOYU4oa2V5KSA9PT0gZmFsc2Upe1xuICAgICAgLy8gICBrZXkgPSBwYXJzZUludChrZXksIDEwKVxuICAgICAgLy8gfVxuICAgICAgbGV0IGEgPSBtYXBwaW5nW2tleV1cbiAgICAgIC8vY29uc29sZS5sb2coa2V5LCBhLCB0eXBlU3RyaW5nKGEpKVxuICAgICAgaWYodHlwZVN0cmluZyhhKSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgIGEuZm9yRWFjaChtYXAgPT4ge1xuICAgICAgICAgIC8vY29uc29sZS5sb2cobWFwKVxuICAgICAgICAgIGdldFByb21pc2VzKHByb21pc2VzLCBtYXAsIGtleSwgYmFzZVVybCwgZXZlcnkpXG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZ2V0UHJvbWlzZXMocHJvbWlzZXMsIGEsIGtleSwgYmFzZVVybCwgZXZlcnkpXG4gICAgICB9XG4gICAgfSlcbiAgfWVsc2UgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgbGV0IGtleVxuICAgIG1hcHBpbmcuZm9yRWFjaChmdW5jdGlvbihzYW1wbGUpe1xuICAgICAgLy8ga2V5IGlzIGRlbGliZXJhdGVseSB1bmRlZmluZWRcbiAgICAgIGdldFByb21pc2VzKHByb21pc2VzLCBzYW1wbGUsIGtleSwgYmFzZVVybCwgZXZlcnkpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcbiAgICBQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICAudGhlbigodmFsdWVzKSA9PiB7XG4gICAgICAvL2NvbnNvbGUubG9nKHR5cGUsIHZhbHVlcylcbiAgICAgIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICAgICAgbWFwcGluZyA9IHt9XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICAvLyBzdXBwb3J0IGZvciBtdWx0aSBsYXllcmVkIGluc3RydW1lbnRzXG4gICAgICAgICAgbGV0IG1hcCA9IG1hcHBpbmdbdmFsdWUuaWRdXG4gICAgICAgICAgbGV0IHR5cGUgPSB0eXBlU3RyaW5nKG1hcClcbiAgICAgICAgICBpZih0eXBlICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgICAgICAgbWFwLnB1c2godmFsdWUuYnVmZmVyKVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gW21hcCwgdmFsdWUuYnVmZmVyXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbWFwcGluZ1t2YWx1ZS5pZF0gPSB2YWx1ZS5idWZmZXJcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC8vY29uc29sZS5sb2cobWFwcGluZylcbiAgICAgICAgcmVzb2x2ZShtYXBwaW5nKVxuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgIHJlc29sdmUodmFsdWVzKTtcbiAgICAgIH1cbiAgICB9KVxuICB9KVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNhbXBsZXMoLi4uZGF0YSl7XG4gIGlmKGRhdGEubGVuZ3RoID09PSAxICYmIHR5cGVTdHJpbmcoZGF0YVswXSkgIT09ICdzdHJpbmcnKXtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGFbMF0pXG4gICAgcmV0dXJuIHBhcnNlU2FtcGxlczIoZGF0YVswXSlcbiAgfVxuICByZXR1cm4gcGFyc2VTYW1wbGVzMihkYXRhKVxufVxuIiwiaW1wb3J0IHtnZXROaWNlVGltZX0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7TUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJztcblxubGV0XG4gIHBwcSxcbiAgYnBtLFxuICBmYWN0b3IsXG4gIG5vbWluYXRvcixcbiAgZGVub21pbmF0b3IsXG4gIHBsYXliYWNrU3BlZWQsXG5cbiAgYmFyLFxuICBiZWF0LFxuICBzaXh0ZWVudGgsXG4gIHRpY2ssXG4gIHRpY2tzLFxuICBtaWxsaXMsXG5cbiAgbWlsbGlzUGVyVGljayxcbiAgc2Vjb25kc1BlclRpY2ssXG5cbiAgdGlja3NQZXJCZWF0LFxuICB0aWNrc1BlckJhcixcbiAgdGlja3NQZXJTaXh0ZWVudGgsXG4gIG51bVNpeHRlZW50aCxcblxuICBkaWZmVGlja3NcbiAgLy9wcmV2aW91c0V2ZW50XG5cbmZ1bmN0aW9uIHNldFRpY2tEdXJhdGlvbigpe1xuICBzZWNvbmRzUGVyVGljayA9ICgxIC8gcGxheWJhY2tTcGVlZCAqIDYwKSAvIGJwbSAvIHBwcTtcbiAgbWlsbGlzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrICogMTAwMDtcbiAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLCBicG0sIHBwcSwgcGxheWJhY2tTcGVlZCwgKHBwcSAqIG1pbGxpc1BlclRpY2spKTtcbiAgLy9jb25zb2xlLmxvZyhwcHEpO1xufVxuXG5cbmZ1bmN0aW9uIHNldFRpY2tzUGVyQmVhdCgpe1xuICBmYWN0b3IgPSAoNCAvIGRlbm9taW5hdG9yKTtcbiAgbnVtU2l4dGVlbnRoID0gZmFjdG9yICogNDtcbiAgdGlja3NQZXJCZWF0ID0gcHBxICogZmFjdG9yO1xuICB0aWNrc1BlckJhciA9IHRpY2tzUGVyQmVhdCAqIG5vbWluYXRvcjtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBwcHEgLyA0O1xuICAvL2NvbnNvbGUubG9nKGRlbm9taW5hdG9yLCBmYWN0b3IsIG51bVNpeHRlZW50aCwgdGlja3NQZXJCZWF0LCB0aWNrc1BlckJhciwgdGlja3NQZXJTaXh0ZWVudGgpO1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZVBvc2l0aW9uKGV2ZW50LCBmYXN0ID0gZmFsc2Upe1xuICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzO1xuICAvLyBpZihkaWZmVGlja3MgPCAwKXtcbiAgLy8gICBjb25zb2xlLmxvZyhkaWZmVGlja3MsIGV2ZW50LnRpY2tzLCBwcmV2aW91c0V2ZW50LnRpY2tzLCBwcmV2aW91c0V2ZW50LnR5cGUpXG4gIC8vIH1cbiAgdGljayArPSBkaWZmVGlja3M7XG4gIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIC8vcHJldmlvdXNFdmVudCA9IGV2ZW50XG4gIC8vY29uc29sZS5sb2coZGlmZlRpY2tzLCBtaWxsaXNQZXJUaWNrKTtcbiAgbWlsbGlzICs9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG5cbiAgaWYoZmFzdCA9PT0gZmFsc2Upe1xuICAgIHdoaWxlKHRpY2sgPj0gdGlja3NQZXJTaXh0ZWVudGgpe1xuICAgICAgc2l4dGVlbnRoKys7XG4gICAgICB0aWNrIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgd2hpbGUoc2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKXtcbiAgICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgICAgYmVhdCsrO1xuICAgICAgICB3aGlsZShiZWF0ID4gbm9taW5hdG9yKXtcbiAgICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgICBiYXIrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpbWVFdmVudHMoc2V0dGluZ3MsIHRpbWVFdmVudHMsIGlzUGxheWluZyA9IGZhbHNlKXtcbiAgLy9jb25zb2xlLmxvZygncGFyc2UgdGltZSBldmVudHMnKVxuICBsZXQgdHlwZTtcbiAgbGV0IGV2ZW50O1xuXG4gIHBwcSA9IHNldHRpbmdzLnBwcTtcbiAgYnBtID0gc2V0dGluZ3MuYnBtO1xuICBub21pbmF0b3IgPSBzZXR0aW5ncy5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gc2V0dGluZ3MuZGVub21pbmF0b3I7XG4gIHBsYXliYWNrU3BlZWQgPSBzZXR0aW5ncy5wbGF5YmFja1NwZWVkO1xuICBiYXIgPSAxO1xuICBiZWF0ID0gMTtcbiAgc2l4dGVlbnRoID0gMTtcbiAgdGljayA9IDA7XG4gIHRpY2tzID0gMDtcbiAgbWlsbGlzID0gMDtcblxuICBzZXRUaWNrRHVyYXRpb24oKTtcbiAgc2V0VGlja3NQZXJCZWF0KCk7XG5cbiAgdGltZUV2ZW50cy5zb3J0KChhLCBiKSA9PiAoYS50aWNrcyA8PSBiLnRpY2tzKSA/IC0xIDogMSk7XG4gIGxldCBlID0gMDtcbiAgZm9yKGV2ZW50IG9mIHRpbWVFdmVudHMpe1xuICAgIC8vY29uc29sZS5sb2coZSsrLCBldmVudC50aWNrcywgZXZlbnQudHlwZSlcbiAgICAvL2V2ZW50LnNvbmcgPSBzb25nO1xuICAgIHR5cGUgPSBldmVudC50eXBlO1xuICAgIHVwZGF0ZVBvc2l0aW9uKGV2ZW50LCBpc1BsYXlpbmcpO1xuXG4gICAgc3dpdGNoKHR5cGUpe1xuXG4gICAgICBjYXNlIDB4NTE6XG4gICAgICAgIGJwbSA9IGV2ZW50LmRhdGExO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICAgICAgICBzZXRUaWNrRHVyYXRpb24oKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgIHNldFRpY2tzUGVyQmVhdCgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy90aW1lIGRhdGEgb2YgdGltZSBldmVudCBpcyB2YWxpZCBmcm9tIChhbmQgaW5jbHVkZWQpIHRoZSBwb3NpdGlvbiBvZiB0aGUgdGltZSBldmVudFxuICAgIHVwZGF0ZUV2ZW50KGV2ZW50LCBpc1BsYXlpbmcpO1xuICAgIC8vY29uc29sZS5sb2coZXZlbnQuYmFyc0FzU3RyaW5nKTtcbiAgfVxuXG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbiAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gIC8vY29uc29sZS5sb2codGltZUV2ZW50cyk7XG59XG5cblxuLy9leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoc29uZywgZXZlbnRzKXtcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhldmVudHMsIGlzUGxheWluZyA9IGZhbHNlKXtcbiAgLy9jb25zb2xlLmxvZygncGFyc2VFdmVudHMnKVxuICBsZXQgZXZlbnQ7XG4gIGxldCBzdGFydEV2ZW50ID0gMDtcbiAgbGV0IGxhc3RFdmVudFRpY2sgPSAwO1xuICBsZXQgcmVzdWx0ID0gW11cblxuICB0aWNrID0gMFxuICB0aWNrcyA9IDBcbiAgZGlmZlRpY2tzID0gMFxuXG4gIC8vbGV0IGV2ZW50cyA9IFtdLmNvbmNhdChldnRzLCBzb25nLl90aW1lRXZlbnRzKTtcbiAgbGV0IG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGhcbiAgLy9jb25zb2xlLmxvZyhldmVudHMpXG5cbiAgLy8gbm90ZW9mZiBjb21lcyBiZWZvcmUgbm90ZW9uXG5cbi8qXG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIHJldHVybiBhLnNvcnRJbmRleCAtIGIuc29ydEluZGV4O1xuICB9KVxuKi9cblxuICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICBpZihhLnRpY2tzID09PSBiLnRpY2tzKXtcbiAgICAgIC8vIGlmKGEudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vICAgcmV0dXJuIC0xXG4gICAgICAvLyB9ZWxzZSBpZihiLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAxXG4gICAgICAvLyB9XG4gICAgICAvLyBzaG9ydDpcbiAgICAgIGxldCByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgaWYoYS50eXBlID09PSAxNzYgJiYgYi50eXBlID09PSAxNDQpe1xuICAgICAgICByID0gLTFcbiAgICAgIH1cbiAgICAgIHJldHVybiByXG4gICAgfVxuICAgIHJldHVybiBhLnRpY2tzIC0gYi50aWNrc1xuICB9KVxuICBldmVudCA9IGV2ZW50c1swXVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuXG5cbiAgYnBtID0gZXZlbnQuYnBtO1xuICBmYWN0b3IgPSBldmVudC5mYWN0b3I7XG4gIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcblxuICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuXG4gIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICBiYXIgPSBldmVudC5iYXI7XG4gIGJlYXQgPSBldmVudC5iZWF0O1xuICBzaXh0ZWVudGggPSBldmVudC5zaXh0ZWVudGg7XG4gIHRpY2sgPSBldmVudC50aWNrO1xuXG5cbiAgZm9yKGxldCBpID0gc3RhcnRFdmVudDsgaSA8IG51bUV2ZW50czsgaSsrKXtcblxuICAgIGV2ZW50ID0gZXZlbnRzW2ldO1xuXG4gICAgc3dpdGNoKGV2ZW50LnR5cGUpe1xuXG4gICAgICBjYXNlIDB4NTE6XG4gICAgICAgIGJwbSA9IGV2ZW50LmRhdGExO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG4gICAgICAgIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICAgICAgICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gICAgICAgIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3NcbiAgICAgICAgdGljayArPSBkaWZmVGlja3NcbiAgICAgICAgdGlja3MgPSBldmVudC50aWNrc1xuICAgICAgICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssZXZlbnQubWlsbGlzUGVyVGljayk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBmYWN0b3IgPSBldmVudC5mYWN0b3I7XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG4gICAgICAgIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gICAgICAgIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgICAgICAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gICAgICAgIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3NcbiAgICAgICAgdGljayArPSBkaWZmVGlja3NcbiAgICAgICAgdGlja3MgPSBldmVudC50aWNrc1xuICAgICAgICAvL2NvbnNvbGUubG9nKG5vbWluYXRvcixudW1TaXh0ZWVudGgsdGlja3NQZXJTaXh0ZWVudGgpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcblxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgLy9jYXNlIDEyODpcbiAgICAgIC8vY2FzZSAxNDQ6XG5cbiAgICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAgIHVwZGF0ZUV2ZW50KGV2ZW50LCBpc1BsYXlpbmcpO1xuLypcbiAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4qL1xuICAgICAgICByZXN1bHQucHVzaChldmVudClcblxuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJhcilcblxuICAgICAgICAvLyBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhldmVudC5kYXRhMiwgZXZlbnQuYmFyc0FzU3RyaW5nKVxuICAgICAgICAvLyB9XG5cbiAgICB9XG5cblxuICAgIC8vIGlmKGkgPCAxMDAgJiYgKGV2ZW50LnR5cGUgPT09IDgxIHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpKXtcbiAgICAvLyAgIC8vY29uc29sZS5sb2coaSwgdGlja3MsIGRpZmZUaWNrcywgbWlsbGlzLCBtaWxsaXNQZXJUaWNrKVxuICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQubWlsbGlzLCAnbm90ZScsIGV2ZW50LmRhdGExLCAndmVsbycsIGV2ZW50LmRhdGEyKVxuICAgIC8vIH1cblxuICAgIGxhc3RFdmVudFRpY2sgPSBldmVudC50aWNrcztcbiAgfVxuICBwYXJzZU1JRElOb3RlcyhyZXN1bHQpXG4gIHJldHVybiByZXN1bHRcbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGV2ZW50LCBmYXN0ID0gZmFsc2Upe1xuICAvL2NvbnNvbGUubG9nKGJhciwgYmVhdCwgdGlja3MpXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuXG4gIGV2ZW50LnRpY2tzID0gdGlja3M7XG5cbiAgZXZlbnQubWlsbGlzID0gbWlsbGlzO1xuICBldmVudC5zZWNvbmRzID0gbWlsbGlzIC8gMTAwMDtcblxuICBpZihmYXN0KXtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGV2ZW50LmJhciA9IGJhcjtcbiAgZXZlbnQuYmVhdCA9IGJlYXQ7XG4gIGV2ZW50LnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgZXZlbnQudGljayA9IHRpY2s7XG4gIC8vZXZlbnQuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2s7XG4gIHZhciB0aWNrQXNTdHJpbmcgPSB0aWNrID09PSAwID8gJzAwMCcgOiB0aWNrIDwgMTAgPyAnMDAnICsgdGljayA6IHRpY2sgPCAxMDAgPyAnMCcgKyB0aWNrIDogdGljaztcbiAgZXZlbnQuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIHRpY2tBc1N0cmluZztcbiAgZXZlbnQuYmFyc0FzQXJyYXkgPSBbYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tdO1xuXG5cbiAgdmFyIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcblxuICBldmVudC5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgZXZlbnQubWludXRlID0gdGltZURhdGEubWludXRlO1xuICBldmVudC5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gIGV2ZW50Lm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gIGV2ZW50LnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgZXZlbnQudGltZUFzQXJyYXkgPSB0aW1lRGF0YS50aW1lQXNBcnJheTtcblxuICAvLyBpZihtaWxsaXMgPCAwKXtcbiAgLy8gICBjb25zb2xlLmxvZyhldmVudClcbiAgLy8gfVxuXG5cbn1cblxuXG5sZXQgbWlkaU5vdGVJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESU5vdGVzKGV2ZW50cyl7XG4gIGxldCBub3RlcyA9IHt9XG4gIGxldCBub3Rlc0luVHJhY2tcbiAgbGV0IG4gPSAwXG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgaWYodHlwZW9mIGV2ZW50Ll9wYXJ0ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZXZlbnQuX3RyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBjb25zb2xlLmxvZygnbm8gcGFydCBhbmQvb3IgdHJhY2sgc2V0JywgZXZlbnQpXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdID0ge31cbiAgICAgIH1cbiAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudFxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdXG4gICAgICBpZih0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIGNvcnJlc3BvbmRpbmcgbm90ZW9uIGV2ZW50IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbGV0IG5vdGVPbiA9IG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV1cbiAgICAgIGxldCBub3RlT2ZmID0gZXZlbnRcbiAgICAgIGlmKHR5cGVvZiBub3RlT24gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy9jb25zb2xlLmluZm8obisrLCAnbm8gbm90ZW9uIGV2ZW50IGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlID0gbmV3IE1JRElOb3RlKG5vdGVPbiwgbm90ZU9mZilcbiAgICAgIG5vdGUuX3RyYWNrID0gbm90ZU9uLl90cmFja1xuICAgICAgbm90ZSA9IG51bGxcbiAgICAgIC8vIGxldCBpZCA9IGBNTl8ke21pZGlOb3RlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgICAvLyBub3RlT24ubWlkaU5vdGVJZCA9IGlkXG4gICAgICAvLyBub3RlT24ub2ZmID0gbm90ZU9mZi5pZFxuICAgICAgLy8gbm90ZU9mZi5taWRpTm90ZUlkID0gaWRcbiAgICAgIC8vIG5vdGVPZmYub24gPSBub3RlT24uaWRcbiAgICAgIGRlbGV0ZSBub3Rlc1tldmVudC5fdHJhY2suaWRdW2V2ZW50LmRhdGExXVxuICAgIH1cbiAgfVxuICBPYmplY3Qua2V5cyhub3RlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGRlbGV0ZSBub3Rlc1trZXldXG4gIH0pXG4gIG5vdGVzID0ge31cbiAgLy9jb25zb2xlLmxvZyhub3Rlcywgbm90ZXNJblRyYWNrKVxufVxuXG5cbi8vIG5vdCBpbiB1c2UhXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyRXZlbnRzKGV2ZW50cyl7XG4gIGxldCBzdXN0YWluID0ge31cbiAgbGV0IHRtcFJlc3VsdCA9IHt9XG4gIGxldCByZXN1bHQgPSBbXVxuICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTc2ICYmIGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICBpZihldmVudC5kYXRhMiA9PT0gMCl7XG4gICAgICAgIGlmKHR5cGVvZiBzdXN0YWluW2V2ZW50LnRyYWNrSWRdID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfWVsc2UgaWYoc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gZXZlbnQudGlja3Mpe1xuICAgICAgICAgIGRlbGV0ZSB0bXBSZXN1bHRbZXZlbnQudGlja3NdXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICB0bXBSZXN1bHRbZXZlbnQudGlja3NdID0gZXZlbnRcbiAgICAgICAgZGVsZXRlIHN1c3RhaW5bZXZlbnQudHJhY2tJZF1cbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICBzdXN0YWluW2V2ZW50LnRyYWNrSWRdID0gZXZlbnQudGlja3NcbiAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICByZXN1bHQucHVzaChldmVudClcbiAgICB9XG4gIH1cbiAgY29uc29sZS5sb2coc3VzdGFpbilcbiAgT2JqZWN0LmtleXModG1wUmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgbGV0IHN1c3RhaW5FdmVudCA9IHRtcFJlc3VsdFtrZXldXG4gICAgY29uc29sZS5sb2coc3VzdGFpbkV2ZW50KVxuICAgIHJlc3VsdC5wdXNoKHN1c3RhaW5FdmVudClcbiAgfSlcbiAgcmV0dXJuIHJlc3VsdFxufVxuIiwiLy8gQCBmbG93XG5cbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFBhcnR7XG5cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3MgPSB7fSl7XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YDtcblxuICAgICh7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUgPSB0aGlzLmlkLFxuICAgICAgbXV0ZWQ6IHRoaXMubXV0ZWQgPSBmYWxzZSxcbiAgICB9ID0gc2V0dGluZ3MpO1xuXG4gICAgdGhpcy5fdHJhY2sgPSBudWxsXG4gICAgdGhpcy5fc29uZyA9IG51bGxcbiAgICB0aGlzLl9ldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50c0J5SWQgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgdGhpcy5fc3RhcnQgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9lbmQgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cblxuICAgIGxldCB7ZXZlbnRzfSA9IHNldHRpbmdzXG4gICAgaWYodHlwZW9mIGV2ZW50cyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy5hZGRFdmVudHMoLi4uZXZlbnRzKVxuICAgIH1cbiAgfVxuXG4gIGNvcHkoKXtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0KHRoaXMubmFtZSArICdfY29weScpIC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICBsZXQgZXZlbnRzID0gW11cbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudCl7XG4gICAgICBsZXQgY29weSA9IGV2ZW50LmNvcHkoKVxuICAgICAgY29uc29sZS5sb2coY29weSlcbiAgICAgIGV2ZW50cy5wdXNoKGNvcHkpXG4gICAgfSlcbiAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgcC51cGRhdGUoKVxuICAgIHJldHVybiBwXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZSh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVUbyh0aWNrczogbnVtYmVyKXtcbiAgICB0aGlzLl9ldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgYWRkRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudHMpXG4gICAgbGV0IHRyYWNrID0gdGhpcy5fdHJhY2tcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Ll9wYXJ0ID0gdGhpc1xuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5zZXQoZXZlbnQuaWQsIGV2ZW50KVxuICAgICAgaWYodHJhY2spe1xuICAgICAgICBldmVudC5fdHJhY2sgPSB0cmFja1xuICAgICAgICBpZih0cmFjay5fc29uZyl7XG4gICAgICAgICAgZXZlbnQuX3NvbmcgPSB0cmFjay5fc29uZ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLl9ldmVudHMucHVzaCguLi5ldmVudHMpXG5cbiAgICBpZih0cmFjayl7XG4gICAgICB0cmFjay5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdHJhY2suX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIH1cbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX25ld0V2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKHRoaXMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgbGV0IHRyYWNrID0gdGhpcy5fdHJhY2tcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Ll9wYXJ0ID0gbnVsbFxuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgICAgdHJhY2suX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICAgICAgICBpZih0cmFjay5fc29uZyl7XG4gICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIGlmKHRyYWNrKXtcbiAgICAgIHRyYWNrLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICAgIHRyYWNrLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZVxuICAgIH1cbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCh0aGlzKVxuICAgIH1cbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZUV2ZW50cyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZSh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2godGhpcylcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIG1vdmVFdmVudHNUbyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9jaGFuZ2VkUGFydHMucHVzaCh0aGlzKVxuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cblxuICBnZXRFdmVudHMoZmlsdGVyOiBzdHJpbmdbXSA9IG51bGwpeyAvLyBjYW4gYmUgdXNlIGFzIGZpbmRFdmVudHNcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSl7XG4gICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgfVxuICAgIHJldHVybiBbLi4udGhpcy5fZXZlbnRzXSAvL0BUT0RPIGltcGxlbWVudCBmaWx0ZXIgLT4gZmlsdGVyRXZlbnRzKCkgc2hvdWxkIGJlIGEgdXRpbGl0eSBmdW5jdGlvbiAobm90IGEgY2xhc3MgbWV0aG9kKVxuICB9XG5cbiAgbXV0ZShmbGFnOiBib29sZWFuID0gbnVsbCl7XG4gICAgaWYoZmxhZyl7XG4gICAgICB0aGlzLm11dGVkID0gZmxhZ1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5tdXRlZCA9ICF0aGlzLm11dGVkXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCl7XG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUgPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZih0aGlzLl9jcmVhdGVFdmVudEFycmF5KXtcbiAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSlcbiAgICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuICAgIH1cbiAgICBzb3J0RXZlbnRzKHRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgLy9AVE9ETzogY2FsY3VsYXRlIHBhcnQgc3RhcnQgYW5kIGVuZCwgYW5kIGhpZ2hlc3QgYW5kIGxvd2VzdCBub3RlXG4gIH1cbn1cbiIsImltcG9ydCB7Z2V0UG9zaXRpb24yfSBmcm9tICcuL3Bvc2l0aW9uLmpzJ1xuaW1wb3J0IHtkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXIuanMnXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbC5qcydcblxuY29uc3QgcmFuZ2UgPSAxMCAvLyBtaWxsaXNlY29uZHMgb3IgdGlja3NcbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgUGxheWhlYWR7XG5cbiAgY29uc3RydWN0b3Ioc29uZywgdHlwZSA9ICdhbGwnKXtcbiAgICB0aGlzLmlkID0gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV8ke2luc3RhbmNlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5zb25nID0gc29uZ1xuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLmxhc3RFdmVudCA9IG51bGxcbiAgICB0aGlzLmRhdGEgPSB7fVxuXG4gICAgdGhpcy5hY3RpdmVQYXJ0cyA9IFtdXG4gICAgdGhpcy5hY3RpdmVOb3RlcyA9IFtdXG4gICAgdGhpcy5hY3RpdmVFdmVudHMgPSBbXVxuICB9XG5cbiAgLy8gdW5pdCBjYW4gYmUgJ21pbGxpcycgb3IgJ3RpY2tzJ1xuICBzZXQodW5pdCwgdmFsdWUpe1xuICAgIHRoaXMudW5pdCA9IHVuaXRcbiAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9IHZhbHVlXG4gICAgdGhpcy5ldmVudEluZGV4ID0gMFxuICAgIHRoaXMubm90ZUluZGV4ID0gMFxuICAgIHRoaXMucGFydEluZGV4ID0gMFxuICAgIHRoaXMuY2FsY3VsYXRlKClcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuXG4gIGdldCgpe1xuICAgIHJldHVybiB0aGlzLmRhdGFcbiAgfVxuXG5cbiAgdXBkYXRlKHVuaXQsIGRpZmYpe1xuICAgIGlmKGRpZmYgPT09IDApe1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YVxuICAgIH1cbiAgICB0aGlzLnVuaXQgPSB1bml0XG4gICAgdGhpcy5jdXJyZW50VmFsdWUgKz0gZGlmZlxuICAgIHRoaXMuY2FsY3VsYXRlKClcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuXG4gIHVwZGF0ZVNvbmcoKXtcbiAgICB0aGlzLmV2ZW50cyA9IFsuLi50aGlzLnNvbmcuX2V2ZW50cywgLi4udGhpcy5zb25nLl90aW1lRXZlbnRzXVxuICAgIHNvcnRFdmVudHModGhpcy5ldmVudHMpXG4gICAgLy9jb25zb2xlLmxvZygnZXZlbnRzICVPJywgdGhpcy5ldmVudHMpXG4gICAgdGhpcy5ub3RlcyA9IHRoaXMuc29uZy5fbm90ZXNcbiAgICB0aGlzLnBhcnRzID0gdGhpcy5zb25nLl9wYXJ0c1xuICAgIHRoaXMubnVtRXZlbnRzID0gdGhpcy5ldmVudHMubGVuZ3RoXG4gICAgdGhpcy5udW1Ob3RlcyA9IHRoaXMubm90ZXMubGVuZ3RoXG4gICAgdGhpcy5udW1QYXJ0cyA9IHRoaXMucGFydHMubGVuZ3RoXG4gICAgdGhpcy5zZXQoJ21pbGxpcycsIHRoaXMuc29uZy5fY3VycmVudE1pbGxpcylcbiAgfVxuXG5cbiAgY2FsY3VsYXRlKCl7XG4gICAgbGV0IGlcbiAgICBsZXQgdmFsdWVcbiAgICBsZXQgZXZlbnRcbiAgICBsZXQgbm90ZVxuICAgIGxldCBwYXJ0XG4gICAgbGV0IHBvc2l0aW9uXG4gICAgbGV0IHN0aWxsQWN0aXZlTm90ZXMgPSBbXVxuICAgIGxldCBzdGlsbEFjdGl2ZVBhcnRzID0gW11cbiAgICBsZXQgY29sbGVjdGVkUGFydHMgPSBuZXcgU2V0KClcbiAgICBsZXQgY29sbGVjdGVkTm90ZXMgPSBuZXcgU2V0KClcblxuICAgIHRoaXMuZGF0YSA9IHt9XG4gICAgdGhpcy5hY3RpdmVFdmVudHMgPSBbXVxuICAgIGxldCBzdXN0YWlucGVkYWxFdmVudHMgPSBbXVxuXG4gICAgZm9yKGkgPSB0aGlzLmV2ZW50SW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgIGV2ZW50ID0gdGhpcy5ldmVudHNbaV1cbiAgICAgIHZhbHVlID0gZXZlbnRbdGhpcy51bml0XVxuICAgICAgaWYodmFsdWUgPD0gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAvLyBpZiB0aGUgcGxheWhlYWQgaXMgc2V0IHRvIGEgcG9zaXRpb24gb2Ygc2F5IDMwMDAgbWlsbGlzLCB3ZSBkb24ndCB3YW50IHRvIGFkZCBldmVudHMgbW9yZSB0aGF0IDEwIHVuaXRzIGJlZm9yZSB0aGUgcGxheWhlYWRcbiAgICAgICAgaWYodmFsdWUgPT09IDAgfHwgdmFsdWUgPiB0aGlzLmN1cnJlbnRWYWx1ZSAtIHJhbmdlKXtcbiAgICAgICAgICB0aGlzLmFjdGl2ZUV2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgICAgIC8vIHRoaXMgZG9lc24ndCB3b3JrIHRvbyB3ZWxsXG4gICAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQuZGF0YTEsIGV2ZW50LmRhdGEyKVxuICAgICAgICAgICAgaWYoZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3N1c3RhaW5wZWRhbDInLFxuICAgICAgICAgICAgICAgIGRhdGE6IGV2ZW50LmRhdGEyID09PSAxMjcgPyAnZG93bicgOiAndXAnXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIHN1c3RhaW5wZWRhbEV2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIC8vIH1lbHNle1xuICAgICAgICAgIC8vICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgLy8gICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgLy8gICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgLy8gICB9KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ2V2ZW50JyxcbiAgICAgICAgICAgIGRhdGE6IGV2ZW50XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIHRoaXMuZXZlbnRJbmRleCsrXG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gbGV0IG51bSA9IHN1c3RhaW5wZWRhbEV2ZW50cy5sZW5ndGhcbiAgICAvLyBpZihudW0gPiAwKXtcbiAgICAvLyAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFZhbHVlLCBudW0sIHN1c3RhaW5wZWRhbEV2ZW50c1tudW0gLSAxXS5kYXRhMiwgc3VzdGFpbnBlZGFsRXZlbnRzKVxuICAgIC8vIH1cblxuICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tJylcbiAgICB0aGlzLmRhdGEuYWN0aXZlRXZlbnRzID0gdGhpcy5hY3RpdmVFdmVudHNcblxuICAgIC8vIGlmIGEgc29uZyBoYXMgbm8gZXZlbnRzIHlldCwgdXNlIHRoZSBmaXJzdCB0aW1lIGV2ZW50IGFzIHJlZmVyZW5jZVxuICAgIGlmKHRoaXMubGFzdEV2ZW50ID09PSBudWxsKXtcbiAgICAgIHRoaXMubGFzdEV2ZW50ID0gdGhpcy5zb25nLl90aW1lRXZlbnRzWzBdXG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBnZXRQb3NpdGlvbjIodGhpcy5zb25nLCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlLCAnYWxsJywgdGhpcy5sYXN0RXZlbnQpXG4gICAgdGhpcy5kYXRhLmV2ZW50SW5kZXggPSB0aGlzLmV2ZW50SW5kZXhcbiAgICB0aGlzLmRhdGEubWlsbGlzID0gcG9zaXRpb24ubWlsbGlzXG4gICAgdGhpcy5kYXRhLnRpY2tzID0gcG9zaXRpb24udGlja3NcbiAgICB0aGlzLmRhdGEucG9zaXRpb24gPSBwb3NpdGlvblxuXG4gICAgaWYodGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVxuICAgICAgZm9yKGxldCBrZXkgb2YgT2JqZWN0LmtleXMocG9zaXRpb24pKXtcbiAgICAgICAgZGF0YVtrZXldID0gcG9zaXRpb25ba2V5XVxuICAgICAgfVxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCdiYXJzYmVhdHMnKSAhPT0gLTEpe1xuICAgICAgdGhpcy5kYXRhLmJhciA9IHBvc2l0aW9uLmJhclxuICAgICAgdGhpcy5kYXRhLmJlYXQgPSBwb3NpdGlvbi5iZWF0XG4gICAgICB0aGlzLmRhdGEuc2l4dGVlbnRoID0gcG9zaXRpb24uc2l4dGVlbnRoXG4gICAgICB0aGlzLmRhdGEudGljayA9IHBvc2l0aW9uLnRpY2tcbiAgICAgIHRoaXMuZGF0YS5iYXJzQXNTdHJpbmcgPSBwb3NpdGlvbi5iYXJzQXNTdHJpbmdcblxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmFyID0gcG9zaXRpb24udGlja3NQZXJCYXJcbiAgICAgIHRoaXMuZGF0YS50aWNrc1BlckJlYXQgPSBwb3NpdGlvbi50aWNrc1BlckJlYXRcbiAgICAgIHRoaXMuZGF0YS50aWNrc1BlclNpeHRlZW50aCA9IHBvc2l0aW9uLnRpY2tzUGVyU2l4dGVlbnRoXG4gICAgICB0aGlzLmRhdGEubnVtU2l4dGVlbnRoID0gcG9zaXRpb24ubnVtU2l4dGVlbnRoXG5cbiAgICB9ZWxzZSBpZih0aGlzLnR5cGUuaW5kZXhPZigndGltZScpICE9PSAtMSl7XG4gICAgICB0aGlzLmRhdGEuaG91ciA9IHBvc2l0aW9uLmhvdXJcbiAgICAgIHRoaXMuZGF0YS5taW51dGUgPSBwb3NpdGlvbi5taW51dGVcbiAgICAgIHRoaXMuZGF0YS5zZWNvbmQgPSBwb3NpdGlvbi5zZWNvbmRcbiAgICAgIHRoaXMuZGF0YS5taWxsaXNlY29uZCA9IHBvc2l0aW9uLm1pbGxpc2Vjb25kXG4gICAgICB0aGlzLmRhdGEudGltZUFzU3RyaW5nID0gcG9zaXRpb24udGltZUFzU3RyaW5nXG5cbiAgICB9ZWxzZSBpZih0aGlzLnR5cGUuaW5kZXhPZigncGVyY2VudGFnZScpICE9PSAtMSl7XG4gICAgICB0aGlzLmRhdGEucGVyY2VudGFnZSA9IHBvc2l0aW9uLnBlcmNlbnRhZ2VcbiAgICB9XG5cbiAgICAvLyBnZXQgYWN0aXZlIG5vdGVzXG4gICAgaWYodGhpcy50eXBlLmluZGV4T2YoJ25vdGVzJykgIT09IC0xIHx8IHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpe1xuXG4gICAgICAvLyBnZXQgYWxsIG5vdGVzIGJldHdlZW4gdGhlIG5vdGVJbmRleCBhbmQgdGhlIGN1cnJlbnQgcGxheWhlYWQgcG9zaXRpb25cbiAgICAgIGZvcihpID0gdGhpcy5ub3RlSW5kZXg7IGkgPCB0aGlzLm51bU5vdGVzOyBpKyspe1xuICAgICAgICBub3RlID0gdGhpcy5ub3Rlc1tpXVxuICAgICAgICB2YWx1ZSA9IG5vdGUubm90ZU9uW3RoaXMudW5pdF1cbiAgICAgICAgaWYodmFsdWUgPD0gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHRoaXMubm90ZUluZGV4KytcbiAgICAgICAgICBpZih0eXBlb2Ygbm90ZS5ub3RlT2ZmID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gaWYgdGhlIHBsYXloZWFkIGlzIHNldCB0byBhIHBvc2l0aW9uIG9mIHNheSAzMDAwIG1pbGxpcywgd2UgZG9uJ3Qgd2FudCB0byBhZGQgbm90ZXMgYmVmb3JlIHRoZSBwbGF5aGVhZFxuICAgICAgICAgIGlmKHRoaXMuY3VycmVudFZhbHVlID09PSAwIHx8IG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgICAgY29sbGVjdGVkTm90ZXMuYWRkKG5vdGUpXG4gICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgICAgdHlwZTogJ25vdGVPbicsXG4gICAgICAgICAgICAgIGRhdGE6IG5vdGUubm90ZU9uXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZmlsdGVyIG5vdGVzIHRoYXQgYXJlIG5vIGxvbmdlciBhY3RpdmVcbiAgICAgIGZvcihpID0gdGhpcy5hY3RpdmVOb3Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgICAgIG5vdGUgPSB0aGlzLmFjdGl2ZU5vdGVzW2ldO1xuICAgICAgICAvL2lmKG5vdGUubm90ZU9uLnN0YXRlLmluZGV4T2YoJ3JlbW92ZWQnKSA9PT0gMCB8fCB0aGlzLnNvbmcuX25vdGVzQnlJZC5nZXQobm90ZS5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYodGhpcy5zb25nLl9ub3Rlc0J5SWQuZ2V0KG5vdGUuaWQpID09PSBmYWxzZSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc2tpcHBpbmcgcmVtb3ZlZCBub3RlJywgbm90ZS5pZCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0eXBlb2Ygbm90ZS5ub3RlT2ZmID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdub3RlIHdpdGggaWQnLCBub3RlLmlkLCAnaGFzIG5vIG5vdGVPZmYgZXZlbnQnKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYobm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSAmJiBjb2xsZWN0ZWROb3Rlcy5oYXMobm90ZSkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYobm90ZS5ub3RlT2ZmW3RoaXMudW5pdF0gPiB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgc3RpbGxBY3RpdmVOb3Rlcy5wdXNoKG5vdGUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdub3RlT2ZmJyxcbiAgICAgICAgICAgIGRhdGE6IG5vdGUubm90ZU9mZlxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHRoZSBzdGlsbCBhY3RpdmUgbm90ZXMgYW5kIHRoZSBuZXdseSBhY3RpdmUgZXZlbnRzIHRvIHRoZSBhY3RpdmUgbm90ZXMgYXJyYXlcbiAgICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbLi4uY29sbGVjdGVkTm90ZXMudmFsdWVzKCksIC4uLnN0aWxsQWN0aXZlTm90ZXNdXG4gICAgICB0aGlzLmRhdGEuYWN0aXZlTm90ZXMgPSB0aGlzLmFjdGl2ZU5vdGVzXG4gICAgfVxuXG5cbiAgICAvLyBnZXQgYWN0aXZlIHBhcnRzXG4gICAgaWYodGhpcy50eXBlLmluZGV4T2YoJ3BhcnRzJykgIT09IC0xIHx8IHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpe1xuXG4gICAgICBmb3IoaSA9IHRoaXMucGFydEluZGV4OyBpIDwgdGhpcy5udW1QYXJ0czsgaSsrKXtcbiAgICAgICAgcGFydCA9IHRoaXMucGFydHNbaV1cbiAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJ0LCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgaWYocGFydC5fc3RhcnRbdGhpcy51bml0XSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgY29sbGVjdGVkUGFydHMuYWRkKHBhcnQpXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAncGFydE9uJyxcbiAgICAgICAgICAgIGRhdGE6IHBhcnRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRoaXMucGFydEluZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIC8vIGZpbHRlciBwYXJ0cyB0aGF0IGFyZSBubyBsb25nZXIgYWN0aXZlXG4gICAgICBmb3IoaSA9IHRoaXMuYWN0aXZlUGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgICBwYXJ0ID0gdGhpcy5hY3RpdmVQYXJ0c1tpXTtcbiAgICAgICAgLy9pZihwYXJ0LnN0YXRlLmluZGV4T2YoJ3JlbW92ZWQnKSA9PT0gMCB8fCB0aGlzLnNvbmcuX3BhcnRzQnlJZC5nZXQocGFydC5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYodGhpcy5zb25nLl9wYXJ0c0J5SWQuZ2V0KHBhcnQuaWQpID09PSBmYWxzZSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc2tpcHBpbmcgcmVtb3ZlZCBwYXJ0JywgcGFydC5pZCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmKHBhcnQuX2VuZFt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkUGFydHMuaGFzKHBhcnQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHBhcnQuX2VuZFt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHN0aWxsQWN0aXZlUGFydHMucHVzaChub3RlKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAncGFydE9mZicsXG4gICAgICAgICAgICBkYXRhOiBwYXJ0XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFjdGl2ZVBhcnRzID0gWy4uLmNvbGxlY3RlZFBhcnRzLnZhbHVlcygpLCAuLi5zdGlsbEFjdGl2ZVBhcnRzXVxuICAgICAgdGhpcy5kYXRhLmFjdGl2ZVBhcnRzID0gdGhpcy5hY3RpdmVQYXJ0c1xuICAgIH1cblxuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YVxuICAgIH0pXG5cbiAgfVxuXG4vKlxuICBzZXRUeXBlKHQpe1xuICAgIHRoaXMudHlwZSA9IHQ7XG4gICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgfVxuXG5cbiAgYWRkVHlwZSh0KXtcbiAgICB0aGlzLnR5cGUgKz0gJyAnICsgdDtcbiAgICB0aGlzLnNldCh0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG5cbiAgcmVtb3ZlVHlwZSh0KXtcbiAgICB2YXIgYXJyID0gdGhpcy50eXBlLnNwbGl0KCcgJyk7XG4gICAgdGhpcy50eXBlID0gJyc7XG4gICAgYXJyLmZvckVhY2goZnVuY3Rpb24odHlwZSl7XG4gICAgICBpZih0eXBlICE9PSB0KXtcbiAgICAgICAgdGhpcy50eXBlICs9IHQgKyAnICc7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy50eXBlLnRyaW0oKTtcbiAgICB0aGlzLnNldCh0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgfVxuKi9cblxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdFxuICBzdXBwb3J0ZWRUeXBlcyA9ICdiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIHBlcmMgcGVyY2VudGFnZScsXG4gIHN1cHBvcnRlZFJldHVyblR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgYWxsJyxcbiAgZmxvb3IgPSBNYXRoLmZsb29yLFxuICByb3VuZCA9IE1hdGgucm91bmQ7XG5cblxubGV0XG4gIC8vbG9jYWxcbiAgYnBtLFxuICBub21pbmF0b3IsXG4gIGRlbm9taW5hdG9yLFxuXG4gIHRpY2tzUGVyQmVhdCxcbiAgdGlja3NQZXJCYXIsXG4gIHRpY2tzUGVyU2l4dGVlbnRoLFxuXG4gIG1pbGxpc1BlclRpY2ssXG4gIHNlY29uZHNQZXJUaWNrLFxuICBudW1TaXh0ZWVudGgsXG5cbiAgdGlja3MsXG4gIG1pbGxpcyxcbiAgZGlmZlRpY2tzLFxuICBkaWZmTWlsbGlzLFxuXG4gIGJhcixcbiAgYmVhdCxcbiAgc2l4dGVlbnRoLFxuICB0aWNrLFxuXG4vLyAgdHlwZSxcbiAgaW5kZXgsXG4gIHJldHVyblR5cGUgPSAnYWxsJyxcbiAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcblxuXG5mdW5jdGlvbiBnZXRUaW1lRXZlbnQoc29uZywgdW5pdCwgdGFyZ2V0KXtcbiAgLy8gZmluZHMgdGhlIHRpbWUgZXZlbnQgdGhhdCBjb21lcyB0aGUgY2xvc2VzdCBiZWZvcmUgdGhlIHRhcmdldCBwb3NpdGlvblxuICBsZXQgdGltZUV2ZW50cyA9IHNvbmcuX3RpbWVFdmVudHNcbiAgLy9jb25zb2xlLmxvZyhzb25nLl90aW1lRXZlbnRzLCB1bml0LCB0YXJnZXQpXG5cbiAgZm9yKGxldCBpID0gdGltZUV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgbGV0IGV2ZW50ID0gdGltZUV2ZW50c1tpXTtcbiAgICAvL2NvbnNvbGUubG9nKHVuaXQsIHRhcmdldCwgZXZlbnQpXG4gICAgaWYoZXZlbnRbdW5pdF0gPD0gdGFyZ2V0KXtcbiAgICAgIGluZGV4ID0gaVxuICAgICAgcmV0dXJuIGV2ZW50XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc1RvVGlja3Moc29uZywgdGFyZ2V0TWlsbGlzLCBiZW9zID0gdHJ1ZSl7XG4gIGJleW9uZEVuZE9mU29uZyA9IGJlb3NcbiAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXRNaWxsaXMpXG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tzVG9NaWxsaXMoc29uZywgdGFyZ2V0VGlja3MsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0VGlja3MpXG4gIHJldHVybiBtaWxsaXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYmFyc1RvTWlsbGlzKHNvbmcsIHBvc2l0aW9uLCBiZW9zKXsgLy8gYmVvcyA9IGJleW9uZEVuZE9mU29uZ1xuICBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCB7XG4gICAgdHlwZTogJ2JhcnNiZWF0JyxcbiAgICBwb3NpdGlvbixcbiAgICByZXN1bHQ6ICdtaWxsaXMnLFxuICAgIGJlb3MsXG4gIH0pXG4gIHJldHVybiBtaWxsaXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYmFyc1RvVGlja3Moc29uZywgcG9zaXRpb24sIGJlb3MpeyAvLyBiZW9zID0gYmV5b25kRW5kT2ZTb25nXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICBwb3NpdGlvbixcbiAgICByZXN1bHQ6ICd0aWNrcycsXG4gICAgYmVvc1xuICB9KVxuICAvL3JldHVybiByb3VuZCh0aWNrcyk7XG4gIHJldHVybiB0aWNrc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrc1RvQmFycyhzb25nLCB0YXJnZXQsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tVGlja3Moc29uZywgdGFyZ2V0KVxuICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICByZXR1cm5UeXBlID0gJ2JhcnNhbmRiZWF0cydcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbGxpc1RvQmFycyhzb25nLCB0YXJnZXQsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldClcbiAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgcmV0dXJuVHlwZSA9ICdiYXJzYW5kYmVhdHMnXG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoKVxufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIG1pbGxpcyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbU1pbGxpcyhzb25nLCB0YXJnZXRNaWxsaXMsIGV2ZW50KXtcbiAgbGV0IGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRNaWxsaXMgPiBsYXN0RXZlbnQubWlsbGlzKXtcbiAgICAgIHRhcmdldE1pbGxpcyA9IGxhc3RFdmVudC5taWxsaXM7XG4gICAgfVxuICB9XG5cbiAgaWYodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ21pbGxpcycsIHRhcmdldE1pbGxpcyk7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBleGFjdGx5IGF0IHRhcmdldCBtaWxsaXMsIGNhbGN1bGF0ZSB0aGUgZGlmZlxuICBpZihldmVudC5taWxsaXMgPT09IHRhcmdldE1pbGxpcyl7XG4gICAgZGlmZk1pbGxpcyA9IDA7XG4gICAgZGlmZlRpY2tzID0gMDtcbiAgfWVsc2V7XG4gICAgZGlmZk1pbGxpcyA9IHRhcmdldE1pbGxpcyAtIGV2ZW50Lm1pbGxpcztcbiAgICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgcmV0dXJuIHRpY2tzO1xufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIHRpY2tzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tVGlja3Moc29uZywgdGFyZ2V0VGlja3MsIGV2ZW50KXtcbiAgbGV0IGxhc3RFdmVudCA9IHNvbmcuX2xhc3RFdmVudDtcblxuICBpZihiZXlvbmRFbmRPZlNvbmcgPT09IGZhbHNlKXtcbiAgICBpZih0YXJnZXRUaWNrcyA+IGxhc3RFdmVudC50aWNrcyl7XG4gICAgICB0YXJnZXRUaWNrcyA9IGxhc3RFdmVudC50aWNrcztcbiAgICB9XG4gIH1cblxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAndGlja3MnLCB0YXJnZXRUaWNrcyk7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBleGFjdGx5IGF0IHRhcmdldCB0aWNrcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmKGV2ZW50LnRpY2tzID09PSB0YXJnZXRUaWNrcyl7XG4gICAgZGlmZlRpY2tzID0gMDtcbiAgICBkaWZmTWlsbGlzID0gMDtcbiAgfWVsc2V7XG4gICAgZGlmZlRpY2tzID0gdGFyZ2V0VGlja3MgLSB0aWNrcztcbiAgICBkaWZmTWlsbGlzID0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcbiAgfVxuXG4gIHRpY2tzICs9IGRpZmZUaWNrcztcbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG5cbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuXG4vLyBtYWluIGNhbGN1bGF0aW9uIGZ1bmN0aW9uIGZvciBiYXJzIGFuZCBiZWF0cyBwb3NpdGlvblxuZnVuY3Rpb24gZnJvbUJhcnMoc29uZywgdGFyZ2V0QmFyLCB0YXJnZXRCZWF0LCB0YXJnZXRTaXh0ZWVudGgsIHRhcmdldFRpY2ssIGV2ZW50ID0gbnVsbCl7XG4gIC8vY29uc29sZS50aW1lKCdmcm9tQmFycycpO1xuICBsZXQgaSA9IDAsXG4gICAgZGlmZkJhcnMsXG4gICAgZGlmZkJlYXRzLFxuICAgIGRpZmZTaXh0ZWVudGgsXG4gICAgZGlmZlRpY2ssXG4gICAgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2Upe1xuICAgIGlmKHRhcmdldEJhciA+IGxhc3RFdmVudC5iYXIpe1xuICAgICAgdGFyZ2V0QmFyID0gbGFzdEV2ZW50LmJhcjtcbiAgICB9XG4gIH1cblxuICBpZihldmVudCA9PT0gbnVsbCl7XG4gICAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ2JhcicsIHRhcmdldEJhcik7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG5cbiAgLy9jb3JyZWN0IHdyb25nIHBvc2l0aW9uIGRhdGEsIGZvciBpbnN0YW5jZTogJzMsMywyLDc4OCcgYmVjb21lcyAnMyw0LDQsMDY4JyBpbiBhIDQvNCBtZWFzdXJlIGF0IFBQUSA0ODBcbiAgd2hpbGUodGFyZ2V0VGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgdGFyZ2V0U2l4dGVlbnRoKys7XG4gICAgdGFyZ2V0VGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgfVxuXG4gIHdoaWxlKHRhcmdldFNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgdGFyZ2V0QmVhdCsrO1xuICAgIHRhcmdldFNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gIH1cblxuICB3aGlsZSh0YXJnZXRCZWF0ID4gbm9taW5hdG9yKXtcbiAgICB0YXJnZXRCYXIrKztcbiAgICB0YXJnZXRCZWF0IC09IG5vbWluYXRvcjtcbiAgfVxuXG4gIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICdiYXInLCB0YXJnZXRCYXIsIGluZGV4KTtcbiAgZm9yKGkgPSBpbmRleDsgaSA+PSAwOyBpLS0pe1xuICAgIGV2ZW50ID0gc29uZy5fdGltZUV2ZW50c1tpXTtcbiAgICBpZihldmVudC5iYXIgPD0gdGFyZ2V0QmFyKXtcbiAgICAgIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gZ2V0IHRoZSBkaWZmZXJlbmNlc1xuICBkaWZmVGljayA9IHRhcmdldFRpY2sgLSB0aWNrO1xuICBkaWZmU2l4dGVlbnRoID0gdGFyZ2V0U2l4dGVlbnRoIC0gc2l4dGVlbnRoO1xuICBkaWZmQmVhdHMgPSB0YXJnZXRCZWF0IC0gYmVhdDtcbiAgZGlmZkJhcnMgPSB0YXJnZXRCYXIgLSBiYXI7IC8vYmFyIGlzIGFsd2F5cyBsZXNzIHRoZW4gb3IgZXF1YWwgdG8gdGFyZ2V0QmFyLCBzbyBkaWZmQmFycyBpcyBhbHdheXMgPj0gMFxuXG4gIC8vY29uc29sZS5sb2coJ2RpZmYnLGRpZmZCYXJzLGRpZmZCZWF0cyxkaWZmU2l4dGVlbnRoLGRpZmZUaWNrKTtcbiAgLy9jb25zb2xlLmxvZygnbWlsbGlzJyxtaWxsaXMsdGlja3NQZXJCYXIsdGlja3NQZXJCZWF0LHRpY2tzUGVyU2l4dGVlbnRoLG1pbGxpc1BlclRpY2spO1xuXG4gIC8vIGNvbnZlcnQgZGlmZmVyZW5jZXMgdG8gbWlsbGlzZWNvbmRzIGFuZCB0aWNrc1xuICBkaWZmTWlsbGlzID0gKGRpZmZCYXJzICogdGlja3NQZXJCYXIpICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSAoZGlmZkJlYXRzICogdGlja3NQZXJCZWF0KSAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gKGRpZmZTaXh0ZWVudGggKiB0aWNrc1BlclNpeHRlZW50aCkgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IGRpZmZUaWNrICogbWlsbGlzUGVyVGljaztcbiAgZGlmZlRpY2tzID0gZGlmZk1pbGxpcyAvIG1pbGxpc1BlclRpY2s7XG4gIC8vY29uc29sZS5sb2coZGlmZkJhcnMsIHRpY2tzUGVyQmFyLCBtaWxsaXNQZXJUaWNrLCBkaWZmTWlsbGlzLCBkaWZmVGlja3MpO1xuXG4gIC8vIHNldCBhbGwgY3VycmVudCBwb3NpdGlvbiBkYXRhXG4gIGJhciA9IHRhcmdldEJhcjtcbiAgYmVhdCA9IHRhcmdldEJlYXQ7XG4gIHNpeHRlZW50aCA9IHRhcmdldFNpeHRlZW50aDtcbiAgdGljayA9IHRhcmdldFRpY2s7XG4gIC8vY29uc29sZS5sb2codGljaywgdGFyZ2V0VGljaylcblxuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcbiAgLy9jb25zb2xlLmxvZyh0YXJnZXRCYXIsIHRhcmdldEJlYXQsIHRhcmdldFNpeHRlZW50aCwgdGFyZ2V0VGljaywgJyAtPiAnLCBtaWxsaXMpO1xuICB0aWNrcyArPSBkaWZmVGlja3M7XG5cbiAgLy9jb25zb2xlLnRpbWVFbmQoJ2Zyb21CYXJzJyk7XG59XG5cblxuZnVuY3Rpb24gY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCl7XG4gIC8vIHNwcmVhZCB0aGUgZGlmZmVyZW5jZSBpbiB0aWNrIG92ZXIgYmFycywgYmVhdHMgYW5kIHNpeHRlZW50aFxuICBsZXQgdG1wID0gcm91bmQoZGlmZlRpY2tzKTtcbiAgd2hpbGUodG1wID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICBzaXh0ZWVudGgrKztcbiAgICB0bXAgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgd2hpbGUoc2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICBiZWF0Kys7XG4gICAgICB3aGlsZShiZWF0ID4gbm9taW5hdG9yKXtcbiAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgIGJhcisrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB0aWNrID0gcm91bmQodG1wKTtcbn1cblxuXG4vLyBzdG9yZSBwcm9wZXJ0aWVzIG9mIGV2ZW50IGluIGxvY2FsIHNjb3BlXG5mdW5jdGlvbiBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KXtcblxuICBicG0gPSBldmVudC5icG07XG4gIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcblxuICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgLy9jb25zb2xlLmxvZyhicG0sIGV2ZW50LnR5cGUpO1xuICAvL2NvbnNvbGUubG9nKCd0aWNrcycsIHRpY2tzLCAnbWlsbGlzJywgbWlsbGlzLCAnYmFyJywgYmFyKTtcbn1cblxuXG5mdW5jdGlvbiBnZXRQb3NpdGlvbkRhdGEoc29uZyl7XG4gIGxldCB0aW1lRGF0YSxcbiAgICBwb3NpdGlvbkRhdGEgPSB7fTtcblxuICBzd2l0Y2gocmV0dXJuVHlwZSl7XG5cbiAgICBjYXNlICdtaWxsaXMnOlxuICAgICAgLy9wb3NpdGlvbkRhdGEubWlsbGlzID0gbWlsbGlzO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpcyA9IHJvdW5kKG1pbGxpcyAqIDEwMDApIC8gMTAwMDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNSb3VuZGVkID0gcm91bmQobWlsbGlzKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3MgPSB0aWNrcztcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrcyA9IHJvdW5kKHRpY2tzKTtcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzVW5yb3VuZGVkID0gdGlja3M7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXIgPSBiYXI7XG4gICAgICBwb3NpdGlvbkRhdGEuYmVhdCA9IGJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2sgPSB0aWNrO1xuICAgICAgLy9wb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2tBc1N0cmluZztcbiAgICAgIHBvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgZ2V0VGlja0FzU3RyaW5nKHRpY2spO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd0aW1lJzpcbiAgICAgIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhbGwnOlxuICAgICAgLy8gbWlsbGlzXG4gICAgICAvL3Bvc2l0aW9uRGF0YS5taWxsaXMgPSBtaWxsaXM7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzID0gcm91bmQobWlsbGlzICogMTAwMCkgLyAxMDAwO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1JvdW5kZWQgPSByb3VuZChtaWxsaXMpO1xuXG4gICAgICAvLyB0aWNrc1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3MgPSB0aWNrcztcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrcyA9IHJvdW5kKHRpY2tzKTtcbiAgICAgIC8vcG9zaXRpb25EYXRhLnRpY2tzVW5yb3VuZGVkID0gdGlja3M7XG5cbiAgICAgIC8vIGJhcnNiZWF0c1xuICAgICAgcG9zaXRpb25EYXRhLmJhciA9IGJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5iZWF0ID0gYmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEudGljayA9IHRpY2s7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGlja0FzU3RyaW5nO1xuICAgICAgcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyBnZXRUaWNrQXNTdHJpbmcodGljayk7XG5cbiAgICAgIC8vIHRpbWVcbiAgICAgIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgICAgIHBvc2l0aW9uRGF0YS5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuXG4gICAgICAvLyBleHRyYSBkYXRhXG4gICAgICBwb3NpdGlvbkRhdGEuYnBtID0gcm91bmQoYnBtICogc29uZy5wbGF5YmFja1NwZWVkLCAzKTtcbiAgICAgIHBvc2l0aW9uRGF0YS5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gICAgICBwb3NpdGlvbkRhdGEuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyQmFyID0gdGlja3NQZXJCYXI7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgICAgIHBvc2l0aW9uRGF0YS5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUGVyVGljayA9IG1pbGxpc1BlclRpY2s7XG4gICAgICBwb3NpdGlvbkRhdGEuc2Vjb25kc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljaztcblxuICAgICAgLy8gdXNlIHRpY2tzIHRvIG1ha2UgdGVtcG8gY2hhbmdlcyB2aXNpYmxlIGJ5IGEgZmFzdGVyIG1vdmluZyBwbGF5aGVhZFxuICAgICAgcG9zaXRpb25EYXRhLnBlcmNlbnRhZ2UgPSB0aWNrcyAvIHNvbmcuX2R1cmF0aW9uVGlja3M7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5wZXJjZW50YWdlID0gbWlsbGlzIC8gc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIHBvc2l0aW9uRGF0YVxufVxuXG5cbmZ1bmN0aW9uIGdldFRpY2tBc1N0cmluZyh0KXtcbiAgaWYodCA9PT0gMCl7XG4gICAgdCA9ICcwMDAnXG4gIH1lbHNlIGlmKHQgPCAxMCl7XG4gICAgdCA9ICcwMCcgKyB0XG4gIH1lbHNlIGlmKHQgPCAxMDApe1xuICAgIHQgPSAnMCcgKyB0XG4gIH1cbiAgcmV0dXJuIHRcbn1cblxuXG4vLyB1c2VkIGJ5IHBsYXloZWFkXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9zaXRpb24yKHNvbmcsIHVuaXQsIHRhcmdldCwgdHlwZSwgZXZlbnQpe1xuICBpZih1bml0ID09PSAnbWlsbGlzJyl7XG4gICAgZnJvbU1pbGxpcyhzb25nLCB0YXJnZXQsIGV2ZW50KTtcbiAgfWVsc2UgaWYodW5pdCA9PT0gJ3RpY2tzJyl7XG4gICAgZnJvbVRpY2tzKHNvbmcsIHRhcmdldCwgZXZlbnQpO1xuICB9XG4gIHJldHVyblR5cGUgPSB0eXBlXG4gIGlmKHJldHVyblR5cGUgPT09ICdhbGwnKXtcbiAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKTtcbiAgfVxuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xufVxuXG5cbi8vIGltcHJvdmVkIHZlcnNpb24gb2YgZ2V0UG9zaXRpb25cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVQb3NpdGlvbihzb25nLCBzZXR0aW5ncyl7XG4gIGxldCB7XG4gICAgdHlwZSwgLy8gYW55IG9mIGJhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgcGVyYyBwZXJjZW50YWdlXG4gICAgdGFyZ2V0LCAvLyBpZiB0eXBlIGlzIGJhcnNiZWF0cyBvciB0aW1lLCB0YXJnZXQgbXVzdCBiZSBhbiBhcnJheSwgZWxzZSBpZiBtdXN0IGJlIGEgbnVtYmVyXG4gICAgcmVzdWx0OiByZXN1bHQgPSAnYWxsJywgLy8gYW55IG9mIGJhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgYWxsXG4gICAgYmVvczogYmVvcyA9IHRydWUsXG4gICAgc25hcDogc25hcCA9IC0xXG4gIH0gPSBzZXR0aW5nc1xuXG4gIGlmKHN1cHBvcnRlZFJldHVyblR5cGVzLmluZGV4T2YocmVzdWx0KSA9PT0gLTEpe1xuICAgIGNvbnNvbGUud2FybihgdW5zdXBwb3J0ZWQgcmV0dXJuIHR5cGUsICdhbGwnIHVzZWQgaW5zdGVhZCBvZiAnJHtyZXN1bHR9J2ApXG4gICAgcmVzdWx0ID0gJ2FsbCdcbiAgfVxuXG4gIHJldHVyblR5cGUgPSByZXN1bHRcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuXG4gIGlmKHN1cHBvcnRlZFR5cGVzLmluZGV4T2YodHlwZSkgPT09IC0xKXtcbiAgICBjb25zb2xlLmVycm9yKGB1bnN1cHBvcnRlZCB0eXBlICR7dHlwZX1gKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cblxuICBzd2l0Y2godHlwZSl7XG5cbiAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgIGNhc2UgJ2JhcnNhbmRiZWF0cyc6XG4gICAgICBsZXQgW3RhcmdldGJhciA9IDEsIHRhcmdldGJlYXQgPSAxLCB0YXJnZXRzaXh0ZWVudGggPSAxLCB0YXJnZXR0aWNrID0gMF0gPSB0YXJnZXRcbiAgICAgIC8vY29uc29sZS5sb2codGFyZ2V0YmFyLCB0YXJnZXRiZWF0LCB0YXJnZXRzaXh0ZWVudGgsIHRhcmdldHRpY2spXG4gICAgICBmcm9tQmFycyhzb25nLCB0YXJnZXRiYXIsIHRhcmdldGJlYXQsIHRhcmdldHNpeHRlZW50aCwgdGFyZ2V0dGljaylcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAgbGV0IFt0YXJnZXRob3VyID0gMCwgdGFyZ2V0bWludXRlID0gMCwgdGFyZ2V0c2Vjb25kID0gMCwgdGFyZ2V0bWlsbGlzZWNvbmQgPSAwXSA9IHRhcmdldFxuICAgICAgbGV0IG1pbGxpcyA9IDBcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRob3VyICogNjAgKiA2MCAqIDEwMDAgLy9ob3Vyc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbnV0ZSAqIDYwICogMTAwMCAvL21pbnV0ZXNcbiAgICAgIG1pbGxpcyArPSB0YXJnZXRzZWNvbmQgKiAxMDAwIC8vc2Vjb25kc1xuICAgICAgbWlsbGlzICs9IHRhcmdldG1pbGxpc2Vjb25kIC8vbWlsbGlzZWNvbmRzXG5cbiAgICAgIGZyb21NaWxsaXMoc29uZywgbWlsbGlzKVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldClcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpXG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICAvL2NvbnNvbGUubG9nKHNvbmcsIHRhcmdldClcbiAgICAgIGZyb21UaWNrcyhzb25nLCB0YXJnZXQpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAncGVyYyc6XG4gICAgY2FzZSAncGVyY2VudGFnZSc6XG5cbiAgICAgIC8vbWlsbGlzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgLy9mcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pbGxpcyk7XG5cbiAgICAgIHRpY2tzID0gdGFyZ2V0ICogc29uZy5fZHVyYXRpb25UaWNrcyAvLyB0YXJnZXQgbXVzdCBiZSBpbiB0aWNrcyFcbiAgICAgIC8vY29uc29sZS5sb2codGlja3MsIHNvbmcuX2R1cmF0aW9uVGlja3MpXG4gICAgICBpZihzbmFwICE9PSAtMSl7XG4gICAgICAgIHRpY2tzID0gZmxvb3IodGlja3MgLyBzbmFwKSAqIHNuYXA7XG4gICAgICAgIC8vZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcyk7XG4gICAgICB9XG4gICAgICBmcm9tVGlja3Moc29uZywgdGlja3MpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgbGV0IHRtcCA9IGdldFBvc2l0aW9uRGF0YShzb25nKVxuICAgICAgLy9jb25zb2xlLmxvZygnZGlmZicsIHBvc2l0aW9uWzFdIC0gdG1wLnBlcmNlbnRhZ2UpO1xuICAgICAgcmV0dXJuIHRtcFxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbi8qXG5cbi8vQHBhcmFtOiAnbWlsbGlzJywgMTAwMCwgW3RydWVdXG4vL0BwYXJhbTogJ3RpY2tzJywgMTAwMCwgW3RydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDEsIFsnYWxsJywgdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgNjAsIDQsIDMsIDEyMCwgWydhbGwnLCB0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCA2MCwgNCwgMywgMTIwLCBbdHJ1ZSwgJ2FsbCddXG5cbmZ1bmN0aW9uIGNoZWNrUG9zaXRpb24odHlwZSwgYXJncywgcmV0dXJuVHlwZSA9ICdhbGwnKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcbiAgY29uc29sZS5sb2coJy0tLS0+IGNoZWNrUG9zaXRpb246JywgYXJncywgdHlwZVN0cmluZyhhcmdzKSk7XG5cbiAgaWYodHlwZVN0cmluZyhhcmdzKSA9PT0gJ2FycmF5Jyl7XG4gICAgbGV0XG4gICAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIGksIGEsIHBvc2l0aW9uTGVuZ3RoO1xuXG4gICAgdHlwZSA9IGFyZ3NbMF07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBbWydtaWxsaXMnLCAzMDAwXV1cbiAgICBpZih0eXBlU3RyaW5nKGFyZ3NbMF0pID09PSAnYXJyYXknKXtcbiAgICAgIC8vY29uc29sZS53YXJuKCd0aGlzIHNob3VsZG5cXCd0IGhhcHBlbiEnKTtcbiAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgdHlwZSA9IGFyZ3NbMF07XG4gICAgICBudW1BcmdzID0gYXJncy5sZW5ndGg7XG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBbdHlwZV07XG5cbiAgICBjb25zb2xlLmxvZygnY2hlY2sgcG9zaXRpb24nLCBhcmdzLCBudW1BcmdzLCBzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpKTtcblxuICAgIC8vY29uc29sZS5sb2coJ2FyZycsIDAsICctPicsIHR5cGUpO1xuXG4gICAgaWYoc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSAhPT0gLTEpe1xuICAgICAgZm9yKGkgPSAxOyBpIDwgbnVtQXJnczsgaSsrKXtcbiAgICAgICAgYSA9IGFyZ3NbaV07XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2FyZycsIGksICctPicsIGEpO1xuICAgICAgICBpZihhID09PSB0cnVlIHx8IGEgPT09IGZhbHNlKXtcbiAgICAgICAgICBiZXlvbmRFbmRPZlNvbmcgPSBhO1xuICAgICAgICB9ZWxzZSBpZihpc05hTihhKSl7XG4gICAgICAgICAgaWYoc3VwcG9ydGVkUmV0dXJuVHlwZXMuaW5kZXhPZihhKSAhPT0gLTEpe1xuICAgICAgICAgICAgcmV0dXJuVHlwZSA9IGE7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgcG9zaXRpb24ucHVzaChhKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jaGVjayBudW1iZXIgb2YgYXJndW1lbnRzIC0+IGVpdGhlciAxIG51bWJlciBvciA0IG51bWJlcnMgaW4gcG9zaXRpb24sIGUuZy4gWydiYXJzYmVhdHMnLCAxXSBvciBbJ2JhcnNiZWF0cycsIDEsIDEsIDEsIDBdLFxuICAgICAgLy8gb3IgWydwZXJjJywgMC41NiwgbnVtYmVyT2ZUaWNrc1RvU25hcFRvXVxuICAgICAgcG9zaXRpb25MZW5ndGggPSBwb3NpdGlvbi5sZW5ndGg7XG4gICAgICBpZihwb3NpdGlvbkxlbmd0aCAhPT0gMiAmJiBwb3NpdGlvbkxlbmd0aCAhPT0gMyAmJiBwb3NpdGlvbkxlbmd0aCAhPT0gNSl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2cocG9zaXRpb24sIHJldHVyblR5cGUsIGJleW9uZEVuZE9mU29uZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvc2l0aW9uKHNvbmcsIHR5cGUsIGFyZ3Mpe1xuICAvL2NvbnNvbGUubG9nKCdnZXRQb3NpdGlvbicsIGFyZ3MpO1xuXG4gIGlmKHR5cGVvZiBhcmdzID09PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1pbGxpczogMFxuICAgIH1cbiAgfVxuXG4gIGxldCBwb3NpdGlvbiA9IGNoZWNrUG9zaXRpb24odHlwZSwgYXJncyksXG4gICAgbWlsbGlzLCB0bXAsIHNuYXA7XG5cblxuICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgIGVycm9yKCd3cm9uZyBwb3NpdGlvbiBkYXRhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3dpdGNoKHR5cGUpe1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgZnJvbUJhcnMoc29uZywgcG9zaXRpb25bMV0sIHBvc2l0aW9uWzJdLCBwb3NpdGlvblszXSwgcG9zaXRpb25bNF0pO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAgbWlsbGlzID0gMDtcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzFdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogNjAgKiA2MCAqIDEwMDA7IC8vaG91cnNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzJdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogNjAgKiAxMDAwOyAvL21pbnV0ZXNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzNdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogMTAwMDsgLy9zZWNvbmRzXG4gICAgICB0bXAgPSBwb3NpdGlvbls0XSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcDsgLy9taWxsaXNlY29uZHNcblxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGZyb21NaWxsaXMoc29uZywgcG9zaXRpb25bMV0pO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHBvc2l0aW9uWzFdKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgc25hcCA9IHBvc2l0aW9uWzJdO1xuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvblRpY2tzO1xuICAgICAgaWYoc25hcCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdGlja3MgPSBmbG9vcih0aWNrcy9zbmFwKSAqIHNuYXA7XG4gICAgICAgIC8vZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcyk7XG4gICAgICB9XG4gICAgICBmcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICB0bXAgPSBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdkaWZmJywgcG9zaXRpb25bMV0gLSB0bXAucGVyY2VudGFnZSk7XG4gICAgICByZXR1cm4gdG1wO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuKi9cblxuIiwiY29uc3QgdmVyc2lvbiA9ICcxLjAuMC1iZXRhMjgnXG5cbmltcG9ydCB7XG4gIHVwZGF0ZVNldHRpbmdzLFxuICBnZXRTZXR0aW5ncyxcbn0gZnJvbSAnLi9zZXR0aW5ncydcblxuaW1wb3J0IHtcbiAgZ2V0Tm90ZURhdGEsXG59IGZyb20gJy4vbm90ZSdcblxuaW1wb3J0IHtcbiAgTUlESUV2ZW50XG59IGZyb20gJy4vbWlkaV9ldmVudCdcblxuaW1wb3J0e1xuICBNSURJTm90ZSxcbn0gZnJvbSAnLi9taWRpX25vdGUnXG5cbmltcG9ydHtcbiAgUGFydCxcbn0gZnJvbSAnLi9wYXJ0J1xuXG5pbXBvcnR7XG4gIFRyYWNrLFxufSBmcm9tICcuL3RyYWNrJ1xuXG5pbXBvcnQge1xuICBTb25nLFxufSBmcm9tICcuL3NvbmcnXG5cbmltcG9ydCB7XG4gIEluc3RydW1lbnQsXG59IGZyb20gJy4vaW5zdHJ1bWVudCdcblxuaW1wb3J0IHtcbiAgU2FtcGxlcixcbn0gZnJvbSAnLi9zYW1wbGVyJ1xuXG5pbXBvcnQge1xuICBTaW1wbGVTeW50aCxcbn0gZnJvbSAnLi9zaW1wbGVfc3ludGgnXG5cbmltcG9ydCB7XG4gIENvbnZvbHV0aW9uUmV2ZXJiLFxufSBmcm9tICcuL2NvbnZvbHV0aW9uX3JldmVyYidcblxuaW1wb3J0IHtcbiAgcGFyc2VNSURJRmlsZVxufSBmcm9tICcuL21pZGlmaWxlJ1xuXG5pbXBvcnQge1xuICBpbml0LFxufSBmcm9tICcuL2luaXQnXG5cbmltcG9ydCB7XG4gIGNvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxufSBmcm9tICcuL2luaXRfYXVkaW8nXG5cbmltcG9ydCB7XG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG59IGZyb20gJy4vaW5pdF9taWRpJ1xuXG5pbXBvcnQge1xuICBwYXJzZVNhbXBsZXMsXG59IGZyb20gJy4vcGFyc2VfYXVkaW8nXG5cbmltcG9ydCB7XG4gIE1JRElFdmVudFR5cGVzLFxufSBmcm9tICcuL2NvbnN0YW50cydcblxuaW1wb3J0IHtcbiAgc2V0QnVmZmVyVGltZSxcbiAgZ2V0SW5zdHJ1bWVudHMsXG4gIGdldEdNSW5zdHJ1bWVudHMsXG59IGZyb20gJy4vc2V0dGluZ3MnXG5cbmltcG9ydCB7XG4gIGFkZEV2ZW50TGlzdGVuZXIsXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIsXG4gIGRpc3BhdGNoRXZlbnRcbn0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5cbmNvbnN0IGdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBjb250ZXh0XG59XG5cbmNvbnN0IHFhbWJpID0ge1xuICB2ZXJzaW9uLFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICB1cGRhdGVTZXR0aW5ncyxcbiAgZ2V0U2V0dGluZ3MsXG5cbiAgLy8gZnJvbSAuL25vdGVcbiAgZ2V0Tm90ZURhdGEsXG5cblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICBzZXRCdWZmZXJUaW1lLFxuXG4gIC8vIGZyb20gLi9jb25zdGFudHNcbiAgTUlESUV2ZW50VHlwZXMsXG5cbiAgLy8gZnJvbSAuL3V0aWxcbiAgcGFyc2VTYW1wbGVzLFxuXG4gIC8vIGZyb20gLi9taWRpZmlsZVxuICBwYXJzZU1JRElGaWxlLFxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG5cbiAgLy8gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICBnZXRJbnN0cnVtZW50cyxcbiAgZ2V0R01JbnN0cnVtZW50cyxcblxuICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKXtcbiAgICByZXR1cm4gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaylcbiAgfSxcblxuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKVxuICB9LFxuXG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIE1JRElFdmVudCxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIE1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIFNvbmcsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIFRyYWNrLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIFBhcnQsXG5cbiAgLy8gZnJvbSAuL2luc3RydW1lbnRcbiAgSW5zdHJ1bWVudCxcblxuICAvLyBmcm9tIC4vc2ltcGxlX3N5bnRoXG4gIFNpbXBsZVN5bnRoLFxuXG4gIC8vIGZyb20gLi9zYW1wbGVyXG4gIFNhbXBsZXIsXG5cbiAgLy8gZnJvbSAuL2NvbnZvbHV0aW9uX3JldmVyYlxuICBDb252b2x1dGlvblJldmVyYixcblxuICBsb2coaWQpe1xuICAgIHN3aXRjaChpZCl7XG4gICAgICBjYXNlICdmdW5jdGlvbnMnOlxuICAgICAgICBjb25zb2xlLmxvZyhgZnVuY3Rpb25zOlxuICAgICAgICAgIGdldEF1ZGlvQ29udGV4dFxuICAgICAgICAgIGdldE1hc3RlclZvbHVtZVxuICAgICAgICAgIHNldE1hc3RlclZvbHVtZVxuICAgICAgICAgIGdldE1JRElBY2Nlc3NcbiAgICAgICAgICBnZXRNSURJSW5wdXRzXG4gICAgICAgICAgZ2V0TUlESU91dHB1dHNcbiAgICAgICAgICBnZXRNSURJSW5wdXRJZHNcbiAgICAgICAgICBnZXRNSURJT3V0cHV0SWRzXG4gICAgICAgICAgZ2V0TUlESUlucHV0c0J5SWRcbiAgICAgICAgICBnZXRNSURJT3V0cHV0c0J5SWRcbiAgICAgICAgICBwYXJzZU1JRElGaWxlXG4gICAgICAgICAgc2V0QnVmZmVyVGltZVxuICAgICAgICAgIGdldEluc3RydW1lbnRzXG4gICAgICAgICAgZ2V0R01JbnN0cnVtZW50c1xuICAgICAgICBgKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IHFhbWJpXG5cbmV4cG9ydCB7XG4gIHZlcnNpb24sXG5cbiAgLy8gZnJvbSAuL2luaXRcbiAgaW5pdCxcblxuICAvLyBmcm9tIC4vc2V0dGluZ3NcbiAgZ2V0SW5zdHJ1bWVudHMsXG4gIGdldEdNSW5zdHJ1bWVudHMsXG4gIHVwZGF0ZVNldHRpbmdzLFxuICBnZXRTZXR0aW5ncyxcblxuICAvLyBmcm9tIC4vY29uc3RhbnRzXG4gIE1JRElFdmVudFR5cGVzLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vbWlkaWZpbGVcbiAgcGFyc2VNSURJRmlsZSxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIGZyb20gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICAvLyBmcm9tIC4vbm90ZVxuICBnZXROb3RlRGF0YSxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBNSURJRXZlbnQsXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBNSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBTb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBUcmFjayxcblxuICAvLyBmcm9tIC4vcGFydFxuICBQYXJ0LFxuXG4gIC8vIGZyb20gLi9pbnN0cnVtZW50XG4gIEluc3RydW1lbnQsXG5cbiAgLy8gZnJvbSAuL3NpbXBsZV9zeW50aFxuICBTaW1wbGVTeW50aCxcblxuICAvLyBmcm9tIC4vc2FtcGxlclxuICBTYW1wbGVyLFxuXG4gIC8vIGZyb20gLi9jb252b2x1dGlvbl9yZXZlcmJcbiAgQ29udm9sdXRpb25SZXZlcmIsXG59XG4iLCJpbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpby5qcydcbmltcG9ydCB7Z2V0RXF1YWxQb3dlckN1cnZlfSBmcm9tICcuL3V0aWwuanMnXG5cbmV4cG9ydCBjbGFzcyBTYW1wbGV7XG5cbiAgY29uc3RydWN0b3Ioc2FtcGxlRGF0YSwgZXZlbnQpe1xuICAgIHRoaXMuZXZlbnQgPSBldmVudFxuICAgIHRoaXMuc2FtcGxlRGF0YSA9IHNhbXBsZURhdGFcbiAgfVxuXG4gIHN0YXJ0KHRpbWUpe1xuICAgIGxldCB7c3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kfSA9IHRoaXMuc2FtcGxlRGF0YVxuICAgIC8vY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKVxuICAgIGlmKHN1c3RhaW5TdGFydCAmJiBzdXN0YWluRW5kKXtcbiAgICAgIHRoaXMuc291cmNlLmxvb3AgPSB0cnVlXG4gICAgICB0aGlzLnNvdXJjZS5sb29wU3RhcnQgPSBzdXN0YWluU3RhcnRcbiAgICAgIHRoaXMuc291cmNlLmxvb3BFbmQgPSBzdXN0YWluRW5kXG4gICAgfVxuICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBjYil7XG4gICAgbGV0IHtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZSwgcmVsZWFzZUVudmVsb3BlQXJyYXl9ID0gdGhpcy5zYW1wbGVEYXRhXG4gICAgLy9jb25zb2xlLmxvZyhyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZSlcbiAgICB0aGlzLnNvdXJjZS5vbmVuZGVkID0gY2JcblxuICAgIGlmKHJlbGVhc2VEdXJhdGlvbiAmJiByZWxlYXNlRW52ZWxvcGUpe1xuICAgICAgdGhpcy5zdGFydFJlbGVhc2VQaGFzZSA9IHRpbWVcbiAgICAgIHRoaXMucmVsZWFzZUZ1bmN0aW9uID0gKCkgPT4ge1xuICAgICAgICBmYWRlT3V0KHRoaXMub3V0cHV0LCB7XG4gICAgICAgICAgcmVsZWFzZUR1cmF0aW9uLFxuICAgICAgICAgIHJlbGVhc2VFbnZlbG9wZSxcbiAgICAgICAgICByZWxlYXNlRW52ZWxvcGVBcnJheSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHRyeXtcbiAgICAgICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lICsgcmVsZWFzZUR1cmF0aW9uKVxuICAgICAgfWNhdGNoKGUpe1xuICAgICAgICAvLyBpbiBGaXJlZm94IGFuZCBTYWZhcmkgeW91IGNhbiBub3QgY2FsbCBzdG9wIG1vcmUgdGhhbiBvbmNlXG4gICAgICB9XG4gICAgICB0aGlzLmNoZWNrUGhhc2UoKVxuICAgIH1lbHNle1xuICAgICAgdHJ5e1xuICAgICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUpXG4gICAgICB9Y2F0Y2goZSl7XG4gICAgICAgIC8vIGluIEZpcmVmb3ggYW5kIFNhZmFyaSB5b3UgY2FuIG5vdCBjYWxsIHN0b3AgbW9yZSB0aGFuIG9uY2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjaGVja1BoYXNlKCl7XG4gICAgLy9jb25zb2xlLmxvZyhjb250ZXh0LmN1cnJlbnRUaW1lLCB0aGlzLnN0YXJ0UmVsZWFzZVBoYXNlKVxuICAgIGlmKGNvbnRleHQuY3VycmVudFRpbWUgPj0gdGhpcy5zdGFydFJlbGVhc2VQaGFzZSl7XG4gICAgICB0aGlzLnJlbGVhc2VGdW5jdGlvbigpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuY2hlY2tQaGFzZS5iaW5kKHRoaXMpKVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGZhZGVPdXQoZ2Fpbk5vZGUsIHNldHRpbmdzKXtcbiAgbGV0IG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWVcbiAgbGV0IHZhbHVlcywgaSwgbWF4aVxuXG4gIC8vY29uc29sZS5sb2coc2V0dGluZ3MpXG4gIHRyeXtcbiAgICBzd2l0Y2goc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlKXtcblxuICAgICAgY2FzZSAnbGluZWFyJzpcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShnYWluTm9kZS5nYWluLnZhbHVlLCBub3cpXG4gICAgICAgIGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4wLCBub3cgKyBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ2VxdWFsIHBvd2VyJzpcbiAgICAgIGNhc2UgJ2VxdWFsX3Bvd2VyJzpcbiAgICAgICAgdmFsdWVzID0gZ2V0RXF1YWxQb3dlckN1cnZlKDEwMCwgJ2ZhZGVPdXQnLCBnYWluTm9kZS5nYWluLnZhbHVlKVxuICAgICAgICBnYWluTm9kZS5nYWluLnNldFZhbHVlQ3VydmVBdFRpbWUodmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnYXJyYXknOlxuICAgICAgICBtYXhpID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXkubGVuZ3RoXG4gICAgICAgIHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkobWF4aSlcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgbWF4aTsgaSsrKXtcbiAgICAgICAgICB2YWx1ZXNbaV0gPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheVtpXSAqIGdhaW5Ob2RlLmdhaW4udmFsdWVcbiAgICAgICAgfVxuICAgICAgICBnYWluTm9kZS5nYWluLnNldFZhbHVlQ3VydmVBdFRpbWUodmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAgICAgYnJlYWtcblxuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH1jYXRjaChlKXtcbiAgICAvLyBpbiBGaXJlZm94IGFuZCBTYWZhcmkgeW91IGNhbiBub3QgY2FsbCBzZXRWYWx1ZUN1cnZlQXRUaW1lIGFuZCBsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSBtb3JlIHRoYW4gb25jZVxuXG4gICAgLy9jb25zb2xlLmxvZyh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgIC8vY29uc29sZS5sb2coZSwgZ2Fpbk5vZGUpXG4gIH1cbn1cbiIsImltcG9ydCB7U2FtcGxlfSBmcm9tICcuL3NhbXBsZSdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFNhbXBsZUJ1ZmZlciBleHRlbmRzIFNhbXBsZXtcblxuICBjb25zdHJ1Y3RvcihzYW1wbGVEYXRhLCBldmVudCl7XG4gICAgc3VwZXIoc2FtcGxlRGF0YSwgZXZlbnQpXG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuXG4gICAgaWYodGhpcy5zYW1wbGVEYXRhID09PSAtMSB8fCB0eXBlb2YgdGhpcy5zYW1wbGVEYXRhLmJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgLy8gY3JlYXRlIGR1bW15IHNvdXJjZVxuICAgICAgdGhpcy5zb3VyY2UgPSB7XG4gICAgICAgIHN0YXJ0KCl7fSxcbiAgICAgICAgc3RvcCgpe30sXG4gICAgICAgIGNvbm5lY3QoKXt9LFxuICAgICAgfVxuXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlRGF0YSlcbiAgICAgIHRoaXMuc291cmNlLmJ1ZmZlciA9IHNhbXBsZURhdGEuYnVmZmVyO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvdXJjZS5idWZmZXIpXG4gICAgfVxuICAgIHRoaXMub3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLnZvbHVtZSA9IGV2ZW50LmRhdGEyIC8gMTI3XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5zb3VyY2UuY29ubmVjdCh0aGlzLm91dHB1dClcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgfVxuXG4gIC8vQG92ZXJyaWRlXG4gIHN0YXJ0KHRpbWUpe1xuICAgIGxldCB7c3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kLCBzZWdtZW50U3RhcnQsIHNlZ21lbnREdXJhdGlvbn0gPSB0aGlzLnNhbXBsZURhdGFcbiAgICAvL2NvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZCwgc2VnbWVudFN0YXJ0LCBzZWdtZW50RHVyYXRpb24pXG4gICAgaWYoc3VzdGFpblN0YXJ0ICYmIHN1c3RhaW5FbmQpe1xuICAgICAgdGhpcy5zb3VyY2UubG9vcCA9IHRydWVcbiAgICAgIHRoaXMuc291cmNlLmxvb3BTdGFydCA9IHN1c3RhaW5TdGFydFxuICAgICAgdGhpcy5zb3VyY2UubG9vcEVuZCA9IHN1c3RhaW5FbmRcbiAgICB9XG4gICAgaWYoc2VnbWVudFN0YXJ0ICYmIHNlZ21lbnREdXJhdGlvbil7XG4gICAgICBjb25zb2xlLmxvZyhzZWdtZW50U3RhcnQsIHNlZ21lbnREdXJhdGlvbilcbiAgICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUsIHNlZ21lbnRTdGFydCAvIDEwMDAsIHNlZ21lbnREdXJhdGlvbiAvIDEwMDApXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7U2FtcGxlfSBmcm9tICcuL3NhbXBsZSdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFNhbXBsZU9zY2lsbGF0b3IgZXh0ZW5kcyBTYW1wbGV7XG5cbiAgY29uc3RydWN0b3Ioc2FtcGxlRGF0YSwgZXZlbnQpe1xuICAgIHN1cGVyKHNhbXBsZURhdGEsIGV2ZW50KVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcblxuICAgIGlmKHRoaXMuc2FtcGxlRGF0YSA9PT0gLTEpe1xuICAgICAgLy8gY3JlYXRlIGR1bW15IHNvdXJjZVxuICAgICAgdGhpcy5zb3VyY2UgPSB7XG4gICAgICAgIHN0YXJ0KCl7fSxcbiAgICAgICAgc3RvcCgpe30sXG4gICAgICAgIGNvbm5lY3QoKXt9LFxuICAgICAgfVxuXG4gICAgfWVsc2V7XG5cbiAgICAgIC8vIEBUT0RPIGFkZCB0eXBlICdjdXN0b20nID0+IFBlcmlvZGljV2F2ZVxuICAgICAgbGV0IHR5cGUgPSB0aGlzLnNhbXBsZURhdGEudHlwZVxuICAgICAgdGhpcy5zb3VyY2UgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKVxuXG4gICAgICBzd2l0Y2godHlwZSl7XG4gICAgICAgIGNhc2UgJ3NpbmUnOlxuICAgICAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgICBjYXNlICdzYXd0b290aCc6XG4gICAgICAgIGNhc2UgJ3RyaWFuZ2xlJzpcbiAgICAgICAgICB0aGlzLnNvdXJjZS50eXBlID0gdHlwZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5zb3VyY2UudHlwZSA9ICdzcXVhcmUnXG4gICAgICB9XG4gICAgICB0aGlzLnNvdXJjZS5mcmVxdWVuY3kudmFsdWUgPSBldmVudC5mcmVxdWVuY3lcbiAgICB9XG4gICAgdGhpcy5vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMudm9sdW1lID0gZXZlbnQuZGF0YTIgLyAxMjdcbiAgICB0aGlzLm91dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLnNvdXJjZS5jb25uZWN0KHRoaXMub3V0cHV0KVxuICAgIC8vdGhpcy5vdXRwdXQuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICB9XG59XG4iLCJpbXBvcnQge0luc3RydW1lbnR9IGZyb20gJy4vaW5zdHJ1bWVudCdcbmltcG9ydCB7Z2V0Tm90ZURhdGF9IGZyb20gJy4vbm90ZSdcbmltcG9ydCB7cGFyc2VTYW1wbGVzfSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2ZldGNoSlNPTn0gZnJvbSAnLi9mZXRjaF9oZWxwZXJzJ1xuaW1wb3J0IHtTYW1wbGVCdWZmZXJ9IGZyb20gJy4vc2FtcGxlX2J1ZmZlcidcblxuXG5sZXQgaW5zdGFuY2VJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFNhbXBsZXIgZXh0ZW5kcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyl7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaWQgPSBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9XyR7aW5zdGFuY2VJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcbiAgICB0aGlzLmNsZWFyQWxsU2FtcGxlRGF0YSgpXG4gIH1cblxuICBjbGVhckFsbFNhbXBsZURhdGEoKXtcbiAgICAvLyBjcmVhdGUgYSBzYW1wbGVzIGRhdGEgb2JqZWN0IGZvciBhbGwgMTI4IHZlbG9jaXR5IGxldmVscyBvZiBhbGwgMTI4IG5vdGVzXG4gICAgdGhpcy5zYW1wbGVzRGF0YSA9IG5ldyBBcnJheSgxMjgpLmZpbGwoLTEpXG4gICAgdGhpcy5zYW1wbGVzRGF0YSA9IHRoaXMuc2FtcGxlc0RhdGEubWFwKGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSlcbiAgICB9KVxuICB9XG5cbiAgY3JlYXRlU2FtcGxlKGV2ZW50KXtcbiAgICByZXR1cm4gbmV3IFNhbXBsZUJ1ZmZlcih0aGlzLnNhbXBsZXNEYXRhW2V2ZW50LmRhdGExXVtldmVudC5kYXRhMl0sIGV2ZW50KVxuICB9XG5cbiAgX2xvYWRKU09OKGRhdGEpe1xuICAgIGlmKHR5cGVvZiBkYXRhID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgZGF0YS51cmwgPT09ICdzdHJpbmcnKXtcbiAgICAgIHJldHVybiBmZXRjaEpTT04oZGF0YS51cmwpXG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGF0YSlcbiAgfVxuXG4gIC8vIGxvYWQgYW5kIHBhcnNlXG4gIHBhcnNlU2FtcGxlRGF0YShkYXRhKXtcblxuICAgIC8vIGNoZWNrIGlmIHdlIGhhdmUgdG8gY2xlYXIgdGhlIGN1cnJlbnRseSBsb2FkZWQgc2FtcGxlc1xuICAgIGxldCBjbGVhckFsbCA9IGRhdGEuY2xlYXJBbGxcblxuICAgIC8vIGNoZWNrIGlmIHdlIGhhdmUgdG8gb3ZlcnJ1bGUgdGhlIGJhc2VVcmwgb2YgdGhlIHNhbXBlbHNcbiAgICBsZXQgYmFzZVVybCA9IG51bGxcbiAgICBpZih0eXBlb2YgZGF0YS5iYXNlVXJsID09PSAnc3RyaW5nJyl7XG4gICAgICBiYXNlVXJsID0gZGF0YS5iYXNlVXJsXG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGRhdGEucmVsZWFzZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy5zZXRSZWxlYXNlKGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgICAgLy9jb25zb2xlLmxvZygxLCBkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICB9XG5cbiAgICAvL3JldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2xvYWRKU09OKGRhdGEpXG4gICAgICAudGhlbigoanNvbikgPT4ge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGpzb24pXG4gICAgICAgIGRhdGEgPSBqc29uXG4gICAgICAgIGlmKGJhc2VVcmwgIT09IG51bGwpe1xuICAgICAgICAgIGpzb24uYmFzZVVybCA9IGJhc2VVcmxcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2YgZGF0YS5yZWxlYXNlICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgdGhpcy5zZXRSZWxlYXNlKGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgICAgICAgIC8vY29uc29sZS5sb2coMiwgZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnNlU2FtcGxlcyhkYXRhKVxuICAgICAgfSlcbiAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcblxuICAgICAgICBpZihjbGVhckFsbCA9PT0gdHJ1ZSl7XG4gICAgICAgICAgdGhpcy5jbGVhckFsbFNhbXBsZURhdGEoKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIHJlc3VsdCA9PT0gJ29iamVjdCcpe1xuXG4gICAgICAgICAgLy8gc2luZ2xlIGNvbmNhdGVuYXRlZCBzYW1wbGVcbiAgICAgICAgICBpZih0eXBlb2YgcmVzdWx0LnNhbXBsZSAhPT0gJ3VuZGVmaW5lZCcpe1xuXG4gICAgICAgICAgICBsZXQgYnVmZmVyID0gcmVzdWx0LnNhbXBsZVxuICAgICAgICAgICAgZm9yKGxldCBub3RlSWQgb2YgT2JqZWN0LmtleXMoZGF0YSkpIHtcblxuICAgICAgICAgICAgICBpZihcbiAgICAgICAgICAgICAgICBub3RlSWQgPT09ICdzYW1wbGUnIHx8XG4gICAgICAgICAgICAgICAgbm90ZUlkID09PSAncmVsZWFzZScgfHxcbiAgICAgICAgICAgICAgICBub3RlSWQgPT09ICdiYXNlVXJsJyB8fFxuICAgICAgICAgICAgICAgIG5vdGVJZCA9PT0gJ2luZm8nXG4gICAgICAgICAgICAgICl7XG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGxldCBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgICAgIHNlZ21lbnQ6IGRhdGFbbm90ZUlkXSxcbiAgICAgICAgICAgICAgICBub3RlOiBwYXJzZUludChub3RlSWQsIDEwKSxcbiAgICAgICAgICAgICAgICBidWZmZXJcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGVEYXRhKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfWVsc2V7XG5cbiAgICAgICAgICAgIGZvcihsZXQgbm90ZUlkIG9mIE9iamVjdC5rZXlzKHJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgbGV0IGJ1ZmZlciA9IHJlc3VsdFtub3RlSWRdXG4gICAgICAgICAgICAgIGxldCBzYW1wbGVEYXRhID0gZGF0YVtub3RlSWRdXG5cblxuICAgICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzYW1wbGVEYXRhIGlzIHVuZGVmaW5lZCcsIG5vdGVJZClcbiAgICAgICAgICAgICAgfWVsc2UgaWYodHlwZVN0cmluZyhidWZmZXIpID09PSAnYXJyYXknKXtcblxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYnVmZmVyLCBzYW1wbGVEYXRhKVxuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEuZm9yRWFjaCgoc2QsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobm90ZUlkLCBidWZmZXJbaV0pXG4gICAgICAgICAgICAgICAgICBpZih0eXBlb2Ygc2QgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgICAgICAgICAgc2QgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgYnVmZmVyOiBidWZmZXJbaV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHNkLmJ1ZmZlciA9IGJ1ZmZlcltpXVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgc2Qubm90ZSA9IHBhcnNlSW50KG5vdGVJZCwgMTApXG4gICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHNkKVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgfWVsc2Uge1xuXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHNhbXBsZURhdGEgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IGJ1ZmZlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzYW1wbGVEYXRhLm5vdGUgPSBwYXJzZUludChub3RlSWQsIDEwKVxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEoc2FtcGxlRGF0YSlcblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgIH1lbHNle1xuXG4gICAgICAgICAgcmVzdWx0LmZvckVhY2goKHNhbXBsZSkgPT4ge1xuICAgICAgICAgICAgbGV0IHNhbXBsZURhdGEgPSBkYXRhW3NhbXBsZV1cbiAgICAgICAgICAgIGlmKHR5cGVvZiBzYW1wbGVEYXRhID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzYW1wbGVEYXRhIGlzIHVuZGVmaW5lZCcsIHNhbXBsZSlcbiAgICAgICAgICAgIH1lbHNlIHtcbiAgICAgICAgICAgICAgaWYodHlwZW9mIHNhbXBsZURhdGEgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgYnVmZmVyOiBzYW1wbGUuYnVmZmVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IHNhbXBsZS5idWZmZXJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzYW1wbGVEYXRhLm5vdGUgPSBzYW1wbGVcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2FtcGxlRGF0YShzYW1wbGVEYXRhKVxuICAgICAgICAgICAgICAvL3RoaXMudXBkYXRlU2FtcGxlRGF0YShzYW1wbGVEYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKG5ldyBEYXRlKCkuZ2V0VGltZSgpKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qXG4gICAgQHBhcmFtIGNvbmZpZyAob3B0aW9uYWwpXG4gICAgICB7XG4gICAgICAgIG5vdGU6IGNhbiBiZSBub3RlIG5hbWUgKEM0KSBvciBub3RlIG51bWJlciAoNjApXG4gICAgICAgIGJ1ZmZlcjogQXVkaW9CdWZmZXJcbiAgICAgICAgc3VzdGFpbjogW3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZF0sIC8vIG9wdGlvbmFsLCBpbiBtaWxsaXNcbiAgICAgICAgcmVsZWFzZTogW3JlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlXSwgLy8gb3B0aW9uYWxcbiAgICAgICAgcGFuOiBwYW5Qb3NpdGlvbiAvLyBvcHRpb25hbFxuICAgICAgICB2ZWxvY2l0eTogW3ZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kXSAvLyBvcHRpb25hbCwgZm9yIG11bHRpLWxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgIH1cbiAgKi9cbiAgdXBkYXRlU2FtcGxlRGF0YSguLi5kYXRhKXtcbiAgICBkYXRhLmZvckVhY2gobm90ZURhdGEgPT4ge1xuICAgICAgLy8gc3VwcG9ydCBmb3IgbXVsdGkgbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgLy9jb25zb2xlLmxvZyhub3RlRGF0YSwgdHlwZVN0cmluZyhub3RlRGF0YSkpXG4gICAgICBpZih0eXBlU3RyaW5nKG5vdGVEYXRhKSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgIG5vdGVEYXRhLmZvckVhY2godmVsb2NpdHlMYXllciA9PiB7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlU2FtcGxlRGF0YSh2ZWxvY2l0eUxheWVyKVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEobm90ZURhdGEpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIF91cGRhdGVTYW1wbGVEYXRhKGRhdGEgPSB7fSl7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhKVxuICAgIGxldCB7XG4gICAgICBub3RlLFxuICAgICAgYnVmZmVyID0gbnVsbCxcbiAgICAgIHN1c3RhaW4gPSBbbnVsbCwgbnVsbF0sXG4gICAgICBzZWdtZW50ID0gW251bGwsIG51bGxdLFxuICAgICAgcmVsZWFzZSA9IFtudWxsLCAnbGluZWFyJ10sIC8vIHJlbGVhc2UgZHVyYXRpb24gaXMgaW4gc2Vjb25kcyFcbiAgICAgIHBhbiA9IG51bGwsXG4gICAgICB2ZWxvY2l0eSA9IFswLCAxMjddLFxuICAgIH0gPSBkYXRhXG5cbiAgICBpZih0eXBlb2Ygbm90ZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG5vdGVudW1iZXIgb3IgYSBub3RlbmFtZScpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBnZXQgbm90ZW51bWJlciBmcm9tIG5vdGVuYW1lIGFuZCBjaGVjayBpZiB0aGUgbm90ZW51bWJlciBpcyB2YWxpZFxuICAgIGxldCBuID0gZ2V0Tm90ZURhdGEoe251bWJlcjogbm90ZX0pXG4gICAgaWYobiA9PT0gZmFsc2Upe1xuICAgICAgY29uc29sZS53YXJuKCdub3QgYSB2YWxpZCBub3RlIGlkJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBub3RlID0gbi5udW1iZXJcblxuICAgIGxldCBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSA9IHN1c3RhaW5cbiAgICBsZXQgW3JlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlXSA9IHJlbGVhc2VcbiAgICBsZXQgW3NlZ21lbnRTdGFydCwgc2VnbWVudER1cmF0aW9uXSA9IHNlZ21lbnRcbiAgICBsZXQgW3ZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kXSA9IHZlbG9jaXR5XG5cbiAgICBpZihzdXN0YWluLmxlbmd0aCAhPT0gMil7XG4gICAgICBzdXN0YWluU3RhcnQgPSBzdXN0YWluRW5kID0gbnVsbFxuICAgIH1cblxuICAgIGlmKHJlbGVhc2VEdXJhdGlvbiA9PT0gbnVsbCl7XG4gICAgICByZWxlYXNlRW52ZWxvcGUgPSBudWxsXG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2cobm90ZSwgYnVmZmVyKVxuICAgIC8vIGNvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZClcbiAgICAvLyBjb25zb2xlLmxvZyhyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZSlcbiAgICAvLyBjb25zb2xlLmxvZyhwYW4pXG4gICAgLy8gY29uc29sZS5sb2codmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmQpXG5cblxuICAgIHRoaXMuc2FtcGxlc0RhdGFbbm90ZV0uZm9yRWFjaCgoc2FtcGxlRGF0YSwgaSkgPT4ge1xuICAgICAgaWYoaSA+PSB2ZWxvY2l0eVN0YXJ0ICYmIGkgPD0gdmVsb2NpdHlFbmQpe1xuICAgICAgICBpZihzYW1wbGVEYXRhID09PSAtMSl7XG4gICAgICAgICAgc2FtcGxlRGF0YSA9IHtcbiAgICAgICAgICAgIGlkOiBub3RlXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBidWZmZXIgfHwgc2FtcGxlRGF0YS5idWZmZXJcbiAgICAgICAgc2FtcGxlRGF0YS5zdXN0YWluU3RhcnQgPSBzdXN0YWluU3RhcnQgfHwgc2FtcGxlRGF0YS5zdXN0YWluU3RhcnRcbiAgICAgICAgc2FtcGxlRGF0YS5zdXN0YWluRW5kID0gc3VzdGFpbkVuZCB8fCBzYW1wbGVEYXRhLnN1c3RhaW5FbmRcbiAgICAgICAgc2FtcGxlRGF0YS5zZWdtZW50U3RhcnQgPSBzZWdtZW50U3RhcnQgfHwgc2FtcGxlRGF0YS5zZWdtZW50U3RhcnRcbiAgICAgICAgc2FtcGxlRGF0YS5zZWdtZW50RHVyYXRpb24gPSBzZWdtZW50RHVyYXRpb24gfHwgc2FtcGxlRGF0YS5zZWdtZW50RHVyYXRpb25cbiAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb24gPSByZWxlYXNlRHVyYXRpb24gfHwgc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb25cbiAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSByZWxlYXNlRW52ZWxvcGUgfHwgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVcbiAgICAgICAgc2FtcGxlRGF0YS5wYW4gPSBwYW4gfHwgc2FtcGxlRGF0YS5wYW5cblxuICAgICAgICBpZih0eXBlU3RyaW5nKHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlKSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVBcnJheSA9IHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlXG4gICAgICAgICAgc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSAnYXJyYXknXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGRlbGV0ZSBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZUFycmF5XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zYW1wbGVzRGF0YVtub3RlXVtpXSA9IHNhbXBsZURhdGFcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coJyVPJywgdGhpcy5zYW1wbGVzRGF0YVtub3RlXSlcbiAgICB9KVxuICB9XG5cblxuICAvLyBzdGVyZW8gc3ByZWFkXG4gIHNldEtleVNjYWxpbmdQYW5uaW5nKCl7XG4gICAgLy8gc2V0cyBwYW5uaW5nIGJhc2VkIG9uIHRoZSBrZXkgdmFsdWUsIGUuZy4gaGlnaGVyIG5vdGVzIGFyZSBwYW5uZWQgbW9yZSB0byB0aGUgcmlnaHQgYW5kIGxvd2VyIG5vdGVzIG1vcmUgdG8gdGhlIGxlZnRcbiAgfVxuXG4gIHNldEtleVNjYWxpbmdSZWxlYXNlKCl7XG4gICAgLy8gc2V0IHJlbGVhc2UgYmFzZWQgb24ga2V5IHZhbHVlXG4gIH1cblxuICAvKlxuICAgIEBkdXJhdGlvbjogbWlsbGlzZWNvbmRzXG4gICAgQGVudmVsb3BlOiBsaW5lYXIgfCBlcXVhbF9wb3dlciB8IGFycmF5IG9mIGludCB2YWx1ZXNcbiAgKi9cbiAgc2V0UmVsZWFzZShkdXJhdGlvbjogbnVtYmVyLCBlbnZlbG9wZSl7XG4gICAgLy8gc2V0IHJlbGVhc2UgZm9yIGFsbCBrZXlzLCBvdmVycnVsZXMgdmFsdWVzIHNldCBieSBzZXRLZXlTY2FsaW5nUmVsZWFzZSgpXG4gICAgdGhpcy5zYW1wbGVzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZXMsIGlkKXtcbiAgICAgIHNhbXBsZXMuZm9yRWFjaChmdW5jdGlvbihzYW1wbGUsIGkpe1xuICAgICAgICBpZihzYW1wbGUgPT09IC0xKXtcbiAgICAgICAgICBzYW1wbGUgPSB7XG4gICAgICAgICAgICBpZDogaWRcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2FtcGxlLnJlbGVhc2VEdXJhdGlvbiA9IGR1cmF0aW9uXG4gICAgICAgIHNhbXBsZS5yZWxlYXNlRW52ZWxvcGUgPSBlbnZlbG9wZVxuICAgICAgICBzYW1wbGVzW2ldID0gc2FtcGxlXG4gICAgICB9KVxuICAgIH0pXG4gICAgLy9jb25zb2xlLmxvZygnJU8nLCB0aGlzLnNhbXBsZXNEYXRhKVxuICB9XG59XG4iLCJjb25zdCBzYW1wbGVzID0ge1xuLy8gIGVtcHR5T2dnOiAnVDJkblV3QUNBQUFBQUFBQUFBQmR4ZDRYQUFBQUFEYVMwalFCSGdGMmIzSmlhWE1BQUFBQUFVU3NBQUFBQUFBQWdMc0FBQUFBQUFDNEFVOW5aMU1BQUFBQUFBQUFBQUFBWGNYZUZ3RUFBQUFhWEsrUUR6My8vLy8vLy8vLy8vLy8vLy8vTWdOMmIzSmlhWE10QUFBQVdHbHdhQzVQY21jZ2JHbGlWbTl5WW1seklFa2dNakF4TURFeE1ERWdLRk5qYUdGMVptVnVkV2RuWlhRcEFBQUFBQUVGZG05eVltbHpIMEpEVmdFQUFBRUFHR05VS1VhWlV0SktpUmx6bERGR21XS1NTb21saEJaQ1NKMXpGRk9wT2RlY2E2eTV0U0NFRUJwVFVDa0ZtVktPVW1rWlk1QXBCWmxTRUV0SkpYUVNPaWVkWXhCYlNjSFdtR3VMUWJZY2hBMmFVa3dweEpSU2lrSUlHVk9NS2NXVVVrcENCeVYwRGpybUhGT09TaWhCdUp4enE3V1dsbU9McVhTU1N1Y2taRXhDU0NtRmtrb0hwVk5PUWtnMWx0WlNLUjF6VWxKcVFlZ2doQkJDdGlDRURZTFFrRlVBQUFFQXdFQVFHcklLQUZBQUFCQ0tvUmlLQW9TR3JBSUFNZ0FBQktBb2p1SW9qaU01a21OSkZoQWFzZ29BQUFJQUVBQUF3SEFVU1pFVXliRWtTOUlzUzlORVVWVjkxVFpWVmZaMVhkZDFYZGQxSURSa0ZRQUFBUUJBU0tlWnBSb2d3Z3hrR0FnTldRVUFJQUFBQUVZb3doQURRa05XQVFBQUFRQUFZaWc1aUNhMDVueHpqb05tT1dncXhlWjBjQ0xWNWtsdUt1Ym1uSFBPT1NlYmM4WTQ1NXh6aW5KbU1XZ210T2FjY3hLRFppbG9KclRtbkhPZXhPWkJhNnEwNXB4enhqbW5nM0ZHR09lY2M1cTA1a0ZxTnRibW5ITVd0S1k1YWk3RjVweHpJdVhtU1cwdTFlYWNjODQ1NTV4enpqbm5uSE9xRjZkemNFNDQ1NXh6b3ZibVdtNUNGK2VjY3o0WnAzdHpRampubkhQT09lZWNjODQ1NTV4emd0Q1FWUUFBRUFBQVFSZzJobkduSUVpZm80RVlSWWhweUtRSDNhUERKR2dNY2dxcFI2T2prVkxxSUpSVXhra3BuU0EwWkJVQUFBZ0FBQ0dFRkZKSUlZVVVVa2doaFJSU2lDR0dHR0xJS2FlY2dnb3FxYVNpaWpMS0xMUE1Nc3Nzczh3eTY3Q3p6anJzTU1RUVF3eXR0QkpMVGJYVldHT3R1ZWVjYXc3U1dtbXR0ZFpLS2FXVVVrb3BDQTFaQlFDQUFBQVFDQmxra0VGR0lZVVVVb2docHB4eXlpbW9vQUpDUTFZQkFJQUFBQUlBQUFBOHlYTkVSM1JFUjNSRVIzUkVSM1JFeDNNOFI1UkVTWlJFU2JSTXk5Uk1UeFZWMVpWZFc5WmwzZlp0WVJkMjNmZDEzL2QxNDllRllWbVdaVm1XWlZtV1pWbVdaVm1XWlZtQzBKQlZBQUFJQUFDQUVFSUlJWVVVVWtnaHBSaGp6REhub0pOUVFpQTBaQlVBQUFnQUlBQUFBTUJSSE1WeEpFZHlKTW1TTEVtVE5FdXpQTTNUUEUzMFJGRVVUZE5VUlZkMFJkMjBSZG1VVGRkMFRkbDBWVm0xWFZtMmJkbldiVitXYmQvM2ZkLzNmZC8zZmQvM2ZkLzNkUjBJRFZrRkFFZ0FBT2hJanFSSWlxUklqdU00a2lRQm9TR3JBQUFaQUFBQkFDaUtvemlPNDBpU0pFbVdwRW1lNVZtaVptcW1aM3FxcUFLaElhc0FBRUFBQUFFQUFBQUFBQ2lhNGltbTRpbWk0am1pSTBxaVpWcWlwbXF1S0p1eTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdvdUVCcXlDZ0NRQUFEUWtSekprUnhKa1JSSmtSekpBVUpEVmdFQU1nQUFBZ0J3RE1lUUZNbXhMRXZUUE0zVFBFMzBSRS8wVEU4VlhkRUZRa05XQVFDQUFBQUNBQUFBQUFBd0pNTlNMRWR6TkVtVVZFdTFWRTIxVkVzVlZVOVZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVMVRkTTBUU0EwWkNVQUFBUUF3R0tOd2VVZ0lTVWw1ZDRRd2hDVG5qRW1JYlZlSVFTUmt0NHhCaFdEbmpLaURITGVRdU1RZ3g0SURWa1JBRVFCQUFER0lNY1FjOGc1UjZtVEVqbm5xSFNVR3VjY3BZNVNaeW5GbUdMTktKWFlVcXlOYzQ1U1I2MmpsR0lzTFhhVVVvMnB4Z0lBQUFJY0FBQUNMSVJDUTFZRUFGRUFBSVF4U0Nta0ZHS01PYWVjUTR3cDU1aHpoakhtSEhPT09lZWdkRklxNTV4MFRrckVHSE9PT2FlY2MxSTZKNVZ6VGtvbm9RQUFnQUFIQUlBQUM2SFFrQlVCUUp3QWdFR1NQRS95TkZHVU5FOFVSVk4wWFZFMFhkZnlQTlgwVEZOVlBkRlVWVk5WYmRsVVZWbVdQTTgwUGROVVZjODBWZFZVVlZrMlZWV1dSVlhWYmROMWRkdDBWZDJXYmR2M1hWc1dkbEZWYmQxVVhkczNWZGYyWGRuMmZWbldkV1B5UEZYMVROTjFQZE4wWmRWMWJWdDFYVjMzVEZPV1RkZVZaZE4xYmR1VlpWMTNaZG4zTmROMFhkTlZaZGwwWGRsMlpWZTNYVm4yZmROMWhkK1ZaVjlYWlZrWWRsMzNoVnZYbGVWMFhkMVhaVmMzVmxuMmZWdlhoZUhXZFdHWlBFOVZQZE4wWGM4MFhWZDFYVjlYWGRmV05kT1VaZE4xYmRsVVhWbDJaZG4zWFZmV2RjODBaZGwwWGRzMlhWZVdYVm4yZlZlV2RkMTBYVjlYWlZuNFZWZjJkVm5YbGVIV2JlRTNYZGYzVlZuMmhWZVdkZUhXZFdHNWRWMFlQbFgxZlZOMmhlRjBaZC9YaGQ5WmJsMDRsdEYxZldHVmJlRllaVms1ZnVGWWx0MzNsV1YwWFY5WWJka1lWbGtXaGwvNG5lWDJmZU40ZFYwWmJ0M256THJ2RE1mdnBQdkswOVZ0WTVsOTNWbG1YM2VPNFJnNnYvRGpxYXF2bTY0ckRLY3NDNy90Njhheis3NnlqSzdyKzZvc0M3OHEyOEt4Njc3ei9MNndMS1BzK3NKcXk4S3cycll4M0w1dUxMOXdITXRyNjhveDY3NVJ0blY4WDNnS3cvTjBkVjE1WmwzSDluVjA0MGM0ZnNvQUFJQUJCd0NBQUJQS1FLRWhLd0tBT0FFQWp5U0pvbVJab2loWmxpaUtwdWk2b21pNnJxUnBwcWxwbm1sYW1tZWFwbW1xc2ltYXJpeHBtbWxhbm1hYW1xZVpwbWlhcm11YXBxeUtwaW5McG1yS3NtbWFzdXk2c20yN3JtemJvbW5Lc21tYXNteWFwaXk3c3F2YnJ1enF1cVJacHFsNW5tbHFubWVhcG1yS3NtbWFycXQ1bm1wNm5taXFuaWlxcW1xcXFxMnFxaXhibm1lYW11aXBwaWVLcW1xcXBxMmFxaXJMcHFyYXNtbXF0bXlxcW0yN3F1ejZzbTNydW1tcXNtMnFwaTJicW1yYnJ1enFzaXpidWk5cG1tbHFubWVhbXVlWnBtbWFzbXlhcWl0Ym5xZWFuaWlxcXVhSnBtcXFxaXlicHFyS2x1ZVpxaWVLcXVxSm5tdWFxaXJMcG1yYXFtbWF0bXlxcWkyYnBpckxybTM3dnV2S3NtNnFxbXlicW1ycnBtcktzbXpMdnUvS3F1NktwaW5McHFyYXNtbXFzaTNic3UvTHNxejdvbW5Lc21tcXNtMnFxaTdMc20wYnMyejd1bWlhc20ycXBpMmJxaXJic2kzN3VpemJ1dS9Lcm0rcnFxenJzaTM3dXU3NnJuRHJ1akM4c216N3FxejZ1aXZidW0vck10djJmVVRUbEdWVE5XM2JWRlZaZG1YWjltWGI5bjNSTkcxYlZWVmJOazNWdG1WWjluMVp0bTFoTkUzWk5sVlYxazNWdEcxWmxtMWh0bVhoZG1YWnQyVmI5blhYbFhWZjEzM2oxMlhkNXJxeTdjdXlyZnVxcS9xMjd2dkNjT3V1OEFvQUFCaHdBQUFJTUtFTUZCcXlFZ0NJQWdBQWpHR01NUWlOVXM0NUI2RlJ5am5uSUdUT1FRZ2hsY3c1Q0NHVWtqa0hvWlNVTXVjZ2xKSlNDS0dVbEZvTElaU1VVbXNGQUFBVU9BQUFCTmlnS2JFNFFLRWhLd0dBVkFBQWcrTllsdWVab21yYXNtTkpuaWVLcXFtcXR1MUlsdWVKb21tcXFtMWJuaWVLcHFtcXJ1dnJtdWVKb21tcXF1dnF1bWlhcHFtcXJ1dTZ1aTZhb3FtcXF1dTZzcTZicHFxcXJpdTdzdXpycHFxcXF1dktyaXo3d3FxNnJpdkxzbTNyd3JDcXJ1dktzbXpidG0vY3VxN3J2dS83d3BHdDY3b3UvTUl4REVjQkFPQUpEZ0JBQlRhc2puQlNOQlpZYU1oS0FDQURBSUF3QmlHREVFSUdJWVNRVWtvaHBaUVNBQUF3NEFBQUVHQkNHU2cwWkVVQUVDY0FBQmhES2FTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKSUthV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS3FhU1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0taVlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWdvQWtJcHdBSkI2TUtFTUZCcXlFZ0JJQlFBQWpGRktLY2FjZ3hBeDVoaGowRWtvS1dMTU9jWWNsSkpTNVJ5RUVGSnBMYmZLT1FnaHBOUlNiWmx6VWxxTE1lWVlNK2VrcEJSYnpUbUhVbEtMc2VhYWErNmt0RlpycmpYbldscXJOZGVjYzgyNXRCWnJyam5YbkhQTE1kZWNjODQ1NXhoenpqbm5uSFBPQlFEZ05EZ0FnQjdZc0RyQ1NkRllZS0VoS3dHQVZBQUFBaG1sR0hQT09lZ1FVb3c1NXh5RUVDS0ZHSFBPT1FnaFZJdzU1eHgwRUVLb0dIUE1PUWdoaEpBNTV4eUVFRUlJSVhNT091Z2doQkJDQngyRUVFSUlvWlRPUVFnaGhCQktLQ0dFRUVJSUlZUVFPZ2doaEJCQ0NDR0VFRUlJSVlSU1NnZ2hoQkJDQ2FHVVVBQUFZSUVEQUVDQURhc2puQlNOQlJZYXNoSUFBQUlBZ0J5V29GTE9oRUdPUVk4TlFjcFJNdzFDVERuUm1XSk9hak1WVTVBNUVKMTBFaGxxUWRsZU1nc0FBSUFnQUNEQUJCQVlJQ2o0UWdpSU1RQUFRWWpNRUFtRlZiREFvQXdhSE9ZQndBTkVoRVFBa0ppZ1NMdTRnQzREWE5ERlhRZENDRUlRZ2xnY1FBRUpPRGpoaGlmZThJUWJuS0JUVk9vZ0FBQUFBQUFNQU9BQkFPQ2dBQ0lpbXF1d3VNREkwTmpnNlBBSUFBQUFBQUFXQVBnQUFEZytnSWlJNWlvc0xqQXlORFk0T2p3Q0FBQUFBQUFBQUFDQWdJQUFBQUFBQUVBQUFBQ0FnRTluWjFNQUJBRUFBQUFBQUFBQVhjWGVGd0lBQUFCcTJucHhBZ0VCQUFvPScsXG4vLyAgZW1wdHlNcDM6ICcvL3VReEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBU1c1bWJ3QUFBQThBQUFBQkFBQURRZ0QvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzhBQUFBNVRFRk5SVE11T1RseUFjMEFBQUFBQUFBQUFCU0FKQUpBUWdBQWdBQUFBMEwyWUxReEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBLy91UXhBQUR3QUFCcEFBQUFDQUFBRFNBQUFBRVRFRk5SVE11T1RrdU5WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVicsXG4gIGhpZ2h0aWNrOiAnVWtsR1JrUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlTQUZBQUN4L3hmL2RBRE9BQ3dCc1AzcCs2SCt6QUdvQk9rQ0N3QlgvRUg1T3Z4bEE0a0oyd2NTQXJUOUUvdXQrSFQyZXZVeDk4bjZPQUY1Q0NVTXdRdmZDT3NKeEF4MERTSU1FQXE5QmlBQjN2aHo3bUxrVDlzUjEzM1l4TjJzNVFMdjB2clVCbndSbnh1UUplRXNTRENpTWQ4eUZTOGFLRklob2hVc0NLajY0dTYyNU9yYUE5SHV5UG5FbGNQK3d4dkpXdFcyNTYzN1ZRMGpIUGduQlRERE0xbzBDektMSys4aHpoZ0ZET3o4U2U0SjQ3RFlWdEcwejVmUXE5TEIxMnJmQStqOTlyb0hBaGVsSXlNd0lqZFRPdVU4bWp3SU9Hb3hoQ2I1RTUzL2orM2szL2ZUWThwVHc0eS9UcitldzhETXZkc2s4UmNIUlJrU0tPNHlHVGtIUGtVL3J6enlOY2dzclI5NERwLzVyK1pzMTd6T25jb0R4aGZFMzhXTHluL1RlT01pOXIwSVJ4bFJLSVF6eVRsT1BLbzl5am1XTWNva0RSTGMvWTdydWR0ZHp1L0QyTDFJdSsyN0pjRzN5WXJWTHVqbCszVU9aeDFVSzVRMHF6bU5QRGs4WmplZU1Qb2p6aEgrL2pMdFBkNW0waEhMSHNZSXc1VEVNTW5BMGp2ajhmU09CaXdYQVNaZ016TThkVUJHUWJJK3J6anBLa0laeWdaVDlRZmxjZGFSeXFYQ3o3K1Z3VVBINzg0cjNLN3MrdjBLRHU4YnZ5ZUxNYjQzTmpyaE9JbzBkU3ZRSGkwUG5QNmk3b3ZnM05UeHk0L0dmOFg4eUgvUUJ0dlg1NVAyWWdiMEZjVWpzeTRMTm1JNWVqaVhNMzhyN2lDOEZKd0hQdm9rN2REZ1FkYUp6bFRLSXNvRnpzclZrdUE4N2QvNnFBaTdGUTBoOUNsS01MRXozVE9yTUJjcVlTRDhFOUFGZC9kUzZrVGY2ZGJVMFhuUXY5SUgyTVhmWitsbjlERUFGd3dkRnk4Z2lpYjZLYXdxZUNoZ0kvVWJIQk9UQ1pqL3Z2WGU3SW5sRnVETjNQM2IwZDFGNGd6cGlmRzIrdTREN1F3MUZmd2JuQ0QrSWxnald5SExIUE1Wb2cybUJMMzdxdlArN052bll1VHY0cnZqZnViTjZrM3dwUFowL1drRU93dGlFVXNXY3htK0dsNGFPaGhpRkRBUEl3bWJBdG43VFBWeTc3enFjZWZyNVlIbUh1bGw3ZW55ZlBtY0FIZ0hldzFSRXI4VmhoZC9GK0FWMVJKMERpa0pXUU5jL1pQM2VmS2Q3aHZzMnVyNDZySHM1dThlOU4vNDgvMGhBLzhIRmd3dUQwNFJTQklSRXFzUU9nN21Dc3NHTUFKVy9YbjRHL1RLOExidXp1MEk3cVR2blBKeTlzWDZiUDg0QkxZSWJBd2REODRRWXhHN0VPY09EQXh3Q0ZNRUFRQzkrN1AzU3ZUWDhYSHcrdTlSOEtUeEl2U285K1g3VlFDVUJKMElNd3ppRGo0UUxoQUdEOVVNcmduVEJaY0JSdjF2K1h2MlVmUys4dGZ4K3ZFUzg3ejArdmIzK1pmOVpnRVFCU0VJVUFyV0M4a00yUXl6QzVFSkVBZHZCSGdCWFA1bisrcjRBdmQ4OVdqMDdmTXc5RDMxSnZmcCtVajl4UUQ5QThRRzVRaFhDbEVMckFzdkM5d0o3Z2Q2QldJQzN2Nk8rN1Q0UFBaTjlFSHpXdk5mOVB6MUZ2aXQrcUw5clFDSEF3RUcvd2VDQ1pVS0Z3dkRDbklKY0FjUUJXY0NhZjhaL0NENTV2YUI5ZEQwd1BTUDlVTDNtL2s3L016K0p3RXlBdzhGekFZN0NCc0phUWs1Q1drSTJnYXRCQ0lDWWYrai9GcjZ2ZmlWOTg3MnNmWlA5MXo0cC9sUiszSDl6Zjg5QXJvRUZBZmpDUDBKY3dvOENqQUpkUWRnQlNFRGtnRFEvVmo3WmZuUjk1VDI4ZlVkOXYzMlZ2ZzIrbmI4Ky82eEFXb0U0QWJEQ1A0SnBBcWJDcVFKMHdlRUJmZ0NUQUNUL1IzN00vbSs5NjcySVBZNjlnYjNhZmhXK3RUOHFmK01BajBGZ2djdUNTY0tYQXJpQ2NNSUVBZnlCSllDRndDUC9SejdBL2w3OTN6MkYvWm45bUgzN2ZqZCtpMzl5ZjlwQXQwRUZBZlJDTmtKR0FxckNaWUl2Z1pQQko4QjZQNC8vTTM1MHZkejlxLzFsZlVxOW16M1JQbWkrM0grYmdGVkJPUUczd2dIQ2t3SzBBbTdDQ0FIQ2dXbUFqQUEnLFxuICBsb3d0aWNrOiAnVWtsR1JsUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlUQUZBQUIwLzV2K1UvNFQvM2dBMHdGVEF1VUIrZjhkL25UOTBmMXEvdWIrdGY0Ni9tYi84d0ZRQTlnQzd3Q2QvbXIrRkFHUkEzY0U2d0pmL2gzNmV2bXYrOHYvTndSSEJaVUMyLzYwKy8vNUV2dVovYVgvYmdGT0FwOEF6dnpoOXdmekxQRjY4elQ0eS8yQkF5Z0lmUXdhRWpZWTB4MzFJcndsOFNPV0hWRVNPZ1BoOU5mcFJlRnQyMm5ZSGRkRDJCWGNaZURhNUlucWdQRHg5blArNmdTNENCWUxudzB6RVMwV1h4djRIa2NnTGgvMUcrRVgxUk5wRDR3S2lnWEgvNnI1L2ZOdTdsVHBqK1p1NWhIb1hPdEw3MWJ5ci9RcDkxTDY0djZPQk80Sm9RNXpFc2tVK2hVMUZpUVZlUlA3RVdnUDRRcjBCSVQrdFBpZDlDM3kxdkNoOEZEeEp2SzI4dnZ5eS9MQThwTHpVL1hQOTV2Nnh2dzQvdUQvUkFLMkJTa0tjZzZCRVNjVFpCTWVFcWtQVFF4akNLRUVWd0ZpL252N2gvaHA5YUR5QXZIUDhNZnhMdk0rOVBYMHVQVzE5Zy80TGZyNy9DNEFLZ05hQlhRR3l3YjBCaElIV1FmV0Ixb0l6QWp0Q0Y4SUh3ZHRCYWtEVndLTEFlWUE4djl3L2tqODEvblE5NHYyOS9YWDliejFiUFVZOVV6MVovYUgrSHI3eVA0TUFpNEYrd2NmQ25ZTE5neWZEUHNNU3cwc0RVQU1mZ3JjQjVJRU13RmIvaVg4VC9wVCtPLzFYL01mOGNidnJPKzE4TUx5dmZWUCtSZjl3Z0FvQkNFSHB3bklDNUVONFE1QUQzd08xQXkwQ3BzSXZ3YnZCTmNDYlFBci9uWDhPZnNmK3ZiNG12ZGE5cmoxei9XWDlwTDNhL2hIK1pYNlIvd24vdlAvZVFFU0EvQUUrd1lEQ2N3S0ZBeVBEQ2tNRlF1U0NlNEhWUWJTQkhRREN3SThBTkw5SlB1WStIWDI4dlRxODJQemRQTVY5QXoxTWZaNDl6RDVnZnR4L3NRQkJRWExCOGNKL2dxcEN3OE1pZ3dXRFhFTlhRMnJERFVMN1FnREJzd0NkdjhTL0s3NFdQVms4aFh3b3U0UDdtdnUxKzlUOHB6MVV2bGkvWm9Cd2dXUkNjc01QZy9DRUVRUjRSREFEd29POXd1c0NWTUg0QVJTQXBuL3VmemQrV2ozYnZYNzh4enp4L0w2OHF6ejF2U0Q5cVg0R2Z2ZC9jMEFod08vQld3SG1naHZDUUVLVlFvbkNsc0pDd2lJQmgwRjBnT2dBbTBCT3dBeC8wMytYUDBnL0xiNmNQbVgrRi80dmZoKytUSDZzL29zKzcvN2N2d0wvWno5WFA1Ty8zSUEzQUY5QXpzRjlnYVVDQUFLSGd1ZUN6Y0w5d250QjNzRjR3SXpBSTM5NmZwMStHdjJJdlduOU4zMHAvWGk5bTc0Ry9ydSs5UDlrLzhhQVlFQzFBTVRCU0lHMHdZdUIxZ0hrZ2NBQ0dFSVNBaFRCekVGV0FLdC81TDkyZnVVK3ZYNTBmbWYrU1A1aS9nYitCZjRtdml2K1NyN2t2eWIvVWorci80WC84ci8rZ0NpQW8wRVVBYVJCendJU3dqcUIzSUhHUWZDQnY4RnBnVE1BcFFBS2Y2Nys1bjUvdmZuOWp6MnlQVm45U0wxUlBYcTlTUDNEdm1yKzZmK3NRR0tCQWNIK3doT0NoMExhd3MzQzI4S0xBbURCNUFGZlFOb0FWUC9adjNlKzdQNnNmbkwrQ3Y0dlBlTTk1YjM3ZmVWK0puNTFQb3EvTEw5bXYrWUFWWUQzZ1F1Qm1jSFNBaWtDSUVJN0FmK0J1RUZuZ1FYQTFzQnYvOXYvcGY5TVAzVy9GajhxL3NSKzZINlUvbzMrbVA2eS9wTisvZjd4dnllL1dIK0pmOW1BRDRDUUFRSkJpc0h0Z2Y2QncwSThRZHNCMXNHeXdUNEFnZ0JDUC9vL0tYNm1QZzE5NTcyamZhejl1ZjJTL2NNK0UzNUUvdFcvYWYvNXdIMUE4QUZLZ2ZrQi9BSGd3ZnhCbEFHZ1FWSUJNTUNKd0dzLzQzK3ZQMGkvWnI4TGZ6bCs5SDc2ZnZpKzlmNzVmc2YvSW44QlAxMC9lajljZjRPLzdmL2RBQWNBYVVCRWdLTUFoZ0RwQU1FQkNFRUR3VGZBM0lEeFFMOEFTb0JVd0NHLzg3K0ovNmgvUnI5cFB4ay9HYjhvUHdKL1hIOXcvMzkvVUQrcVA0MS85RC9Xd0RlQUdzQkFnS2RBaEVEUVFOQUEwc0Rid09WQTVZRFZ3UE9BaGdDVkFHUkFBPT0nLFxufVxuXG5leHBvcnQgZGVmYXVsdCBzYW1wbGVzXG4iLCIvKlxuXG5cblRoaXMgY29kZSBpcyBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vc2VyZ2kvanNtaWRpXG5cbmluZm86IGh0dHA6Ly93d3cuZGVsdWdlLmNvLz9xPW1pZGktdGVtcG8tYnBtXG5cbiovXG5cblxuaW1wb3J0IHtzYXZlQXN9IGZyb20gJ2ZpbGVzYXZlcmpzJ1xuXG5sZXQgUFBRID0gOTYwXG5sZXQgSERSX1BQUSA9IHN0cjJCeXRlcyhQUFEudG9TdHJpbmcoMTYpLCAyKVxuXG5jb25zdCBIRFJfQ0hVTktJRCA9IFtcbiAgJ00nLmNoYXJDb2RlQXQoMCksXG4gICdUJy5jaGFyQ29kZUF0KDApLFxuICAnaCcuY2hhckNvZGVBdCgwKSxcbiAgJ2QnLmNoYXJDb2RlQXQoMClcbl1cbmNvbnN0IEhEUl9DSFVOS19TSVpFID0gWzB4MCwgMHgwLCAweDAsIDB4Nl0gLy8gSGVhZGVyIHNpemUgZm9yIFNNRlxuY29uc3QgSERSX1RZUEUwID0gWzB4MCwgMHgwXSAvLyBNaWRpIFR5cGUgMCBpZFxuY29uc3QgSERSX1RZUEUxID0gWzB4MCwgMHgxXSAvLyBNaWRpIFR5cGUgMSBpZFxuLy9IRFJfUFBRID0gWzB4MDEsIDB4RTBdIC8vIERlZmF1bHRzIHRvIDQ4MCB0aWNrcyBwZXIgYmVhdFxuLy9IRFJfUFBRID0gWzB4MDAsIDB4ODBdIC8vIERlZmF1bHRzIHRvIDEyOCB0aWNrcyBwZXIgYmVhdFxuXG5jb25zdCBUUktfQ0hVTktJRCA9IFtcbiAgJ00nLmNoYXJDb2RlQXQoMCksXG4gICdUJy5jaGFyQ29kZUF0KDApLFxuICAncicuY2hhckNvZGVBdCgwKSxcbiAgJ2snLmNoYXJDb2RlQXQoMClcbl1cblxuLy8gTWV0YSBldmVudCBjb2Rlc1xuY29uc3QgTUVUQV9TRVFVRU5DRSA9IDB4MDBcbmNvbnN0IE1FVEFfVEVYVCA9IDB4MDFcbmNvbnN0IE1FVEFfQ09QWVJJR0hUID0gMHgwMlxuY29uc3QgTUVUQV9UUkFDS19OQU1FID0gMHgwM1xuY29uc3QgTUVUQV9JTlNUUlVNRU5UID0gMHgwNFxuY29uc3QgTUVUQV9MWVJJQyA9IDB4MDVcbmNvbnN0IE1FVEFfTUFSS0VSID0gMHgwNlxuY29uc3QgTUVUQV9DVUVfUE9JTlQgPSAweDA3XG5jb25zdCBNRVRBX0NIQU5ORUxfUFJFRklYID0gMHgyMFxuY29uc3QgTUVUQV9FTkRfT0ZfVFJBQ0sgPSAweDJmXG5jb25zdCBNRVRBX1RFTVBPID0gMHg1MVxuY29uc3QgTUVUQV9TTVBURSA9IDB4NTRcbmNvbnN0IE1FVEFfVElNRV9TSUcgPSAweDU4XG5jb25zdCBNRVRBX0tFWV9TSUcgPSAweDU5XG5jb25zdCBNRVRBX1NFUV9FVkVOVCA9IDB4N2ZcblxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUFzTUlESUZpbGUoc29uZywgZmlsZU5hbWUgPSBzb25nLm5hbWUsIHBwcSA9IDk2MCkge1xuXG4gIFBQUSA9IHBwcVxuICBIRFJfUFBRID0gc3RyMkJ5dGVzKFBQUS50b1N0cmluZygxNiksIDIpXG5cbiAgbGV0IGJ5dGVBcnJheSA9IFtdLmNvbmNhdChIRFJfQ0hVTktJRCwgSERSX0NIVU5LX1NJWkUsIEhEUl9UWVBFMSlcbiAgbGV0IHRyYWNrcyA9IHNvbmcuZ2V0VHJhY2tzKClcbiAgbGV0IG51bVRyYWNrcyA9IHRyYWNrcy5sZW5ndGggKyAxXG4gIGxldCBpLCBtYXhpLCB0cmFjaywgbWlkaUZpbGUsIGRlc3RpbmF0aW9uLCBiNjRcbiAgbGV0IGFycmF5QnVmZmVyLCBkYXRhVmlldywgdWludEFycmF5XG5cbiAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdChzdHIyQnl0ZXMobnVtVHJhY2tzLnRvU3RyaW5nKDE2KSwgMiksIEhEUl9QUFEpXG5cbiAgLy9jb25zb2xlLmxvZyhieXRlQXJyYXkpO1xuICBieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHRyYWNrVG9CeXRlcyhzb25nLl90aW1lRXZlbnRzLCBzb25nLl9kdXJhdGlvblRpY2tzLCAndGVtcG8nKSlcblxuICBmb3IoaSA9IDAsIG1heGkgPSB0cmFja3MubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKXtcbiAgICB0cmFjayA9IHRyYWNrc1tpXTtcbiAgICBsZXQgaW5zdHJ1bWVudFxuICAgIGlmKHRyYWNrLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIGluc3RydW1lbnQgPSB0cmFjay5faW5zdHJ1bWVudC5pZFxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIHRyYWNrLl9ldmVudHMubGVuZ3RoLCBpbnN0cnVtZW50KVxuICAgIGJ5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQodHJhY2tUb0J5dGVzKHRyYWNrLl9ldmVudHMsIHNvbmcuX2R1cmF0aW9uVGlja3MsIHRyYWNrLm5hbWUsIGluc3RydW1lbnQpKVxuICAgIC8vYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdCh0cmFja1RvQnl0ZXModHJhY2suX2V2ZW50cywgc29uZy5fbGFzdEV2ZW50Lmlja3MsIHRyYWNrLm5hbWUsIGluc3RydW1lbnQpKVxuICB9XG5cbiAgLy9iNjQgPSBidG9hKGNvZGVzMlN0cihieXRlQXJyYXkpKVxuICAvL3dpbmRvdy5sb2NhdGlvbi5hc3NpZ24oXCJkYXRhOmF1ZGlvL21pZGk7YmFzZTY0LFwiICsgYjY0KVxuICAvL2NvbnNvbGUubG9nKGI2NCkvLyBzZW5kIHRvIHNlcnZlclxuXG4gIG1heGkgPSBieXRlQXJyYXkubGVuZ3RoXG4gIGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG1heGkpXG4gIHVpbnRBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKVxuICBmb3IoaSA9IDA7IGkgPCBtYXhpOyBpKyspe1xuICAgIHVpbnRBcnJheVtpXSA9IGJ5dGVBcnJheVtpXVxuICB9XG4gIG1pZGlGaWxlID0gbmV3IEJsb2IoW3VpbnRBcnJheV0sIHt0eXBlOiAnYXBwbGljYXRpb24veC1taWRpJywgZW5kaW5nczogJ3RyYW5zcGFyZW50J30pXG4gIGZpbGVOYW1lID0gZmlsZU5hbWUucmVwbGFjZSgvXFwubWlkaSQvLCAnJylcbiAgLy9sZXQgcGF0dCA9IC9cXC5taWRbaV17MCwxfSQvXG4gIGxldCBwYXR0ID0gL1xcLm1pZCQvXG4gIGxldCBoYXNFeHRlbnNpb24gPSBwYXR0LnRlc3QoZmlsZU5hbWUpXG4gIGlmKGhhc0V4dGVuc2lvbiA9PT0gZmFsc2Upe1xuICAgIGZpbGVOYW1lICs9ICcubWlkJ1xuICB9XG4gIC8vY29uc29sZS5sb2coZmlsZU5hbWUsIGhhc0V4dGVuc2lvbilcbiAgc2F2ZUFzKG1pZGlGaWxlLCBmaWxlTmFtZSlcbiAgLy93aW5kb3cubG9jYXRpb24uYXNzaWduKHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKG1pZGlGaWxlKSlcbn1cblxuXG5mdW5jdGlvbiB0cmFja1RvQnl0ZXMoZXZlbnRzLCBsYXN0RXZlbnRUaWNrcywgdHJhY2tOYW1lLCBpbnN0cnVtZW50TmFtZSA9ICdubyBpbnN0cnVtZW50Jyl7XG4gIHZhciBsZW5ndGhCeXRlcyxcbiAgICBpLCBtYXhpLCBldmVudCwgc3RhdHVzLFxuICAgIHRyYWNrTGVuZ3RoLCAvLyBudW1iZXIgb2YgYnl0ZXMgaW4gdHJhY2sgY2h1bmtcbiAgICB0aWNrcyA9IDAsXG4gICAgZGVsdGEgPSAwLFxuICAgIHRyYWNrQnl0ZXMgPSBbXTtcblxuICBpZih0cmFja05hbWUpe1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDMpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEodHJhY2tOYW1lLmxlbmd0aCkpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHJpbmdUb051bUFycmF5KHRyYWNrTmFtZSkpO1xuICB9XG5cbiAgaWYoaW5zdHJ1bWVudE5hbWUpe1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDQpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoaW5zdHJ1bWVudE5hbWUubGVuZ3RoKSk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KHN0cmluZ1RvTnVtQXJyYXkoaW5zdHJ1bWVudE5hbWUpKTtcbiAgfVxuXG4gIGZvcihpID0gMCwgbWF4aSA9IGV2ZW50cy5sZW5ndGg7IGkgPCBtYXhpOyBpKyspe1xuICAgIGV2ZW50ID0gZXZlbnRzW2ldO1xuICAgIGRlbHRhID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgICBkZWx0YSA9IGNvbnZlcnRUb1ZMUShkZWx0YSk7XG4gICAgLy9jb25zb2xlLmxvZyhkZWx0YSk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGRlbHRhKTtcbiAgICAvL3RyYWNrQnl0ZXMucHVzaC5hcHBseSh0cmFja0J5dGVzLCBkZWx0YSk7XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMHg4MCB8fCBldmVudC50eXBlID09PSAweDkwKXsgLy8gbm90ZSBvZmYsIG5vdGUgb25cbiAgICAgIC8vc3RhdHVzID0gcGFyc2VJbnQoZXZlbnQudHlwZS50b1N0cmluZygxNikgKyBldmVudC5jaGFubmVsLnRvU3RyaW5nKDE2KSwgMTYpO1xuICAgICAgc3RhdHVzID0gZXZlbnQudHlwZSArIChldmVudC5jaGFubmVsIHx8IDApXG4gICAgICB0cmFja0J5dGVzLnB1c2goc3RhdHVzKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChldmVudC5kYXRhMSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQuZGF0YTIpO1xuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDB4NTEpeyAvLyB0ZW1wb1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4NTEpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4MDMpOy8vIGxlbmd0aFxuICAgICAgLy90cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKDMpKTsvLyBsZW5ndGhcbiAgICAgIHZhciBtaWNyb1NlY29uZHMgPSBNYXRoLnJvdW5kKDYwMDAwMDAwIC8gZXZlbnQuYnBtKTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuYnBtKVxuICAgICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KHN0cjJCeXRlcyhtaWNyb1NlY29uZHMudG9TdHJpbmcoMTYpLCAzKSk7XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMHg1OCl7IC8vIHRpbWUgc2lnbmF0dXJlXG4gICAgICB2YXIgZGVub20gPSBldmVudC5kZW5vbWluYXRvcjtcbiAgICAgIGlmKGRlbm9tID09PSAyKXtcbiAgICAgICAgZGVub20gPSAweDAxO1xuICAgICAgfWVsc2UgaWYoZGVub20gPT09IDQpe1xuICAgICAgICBkZW5vbSA9IDB4MDI7XG4gICAgICB9ZWxzZSBpZihkZW5vbSA9PT0gOCl7XG4gICAgICAgIGRlbm9tID0gMHgwMztcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSAxNil7XG4gICAgICAgIGRlbm9tID0gMHgwNDtcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSAzMil7XG4gICAgICAgIGRlbm9tID0gMHgwNTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVub21pbmF0b3IsIGV2ZW50Lm5vbWluYXRvcilcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDU4KTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDA0KTsvLyBsZW5ndGhcbiAgICAgIC8vdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUSg0KSk7Ly8gbGVuZ3RoXG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChkZW5vbSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goUFBRIC8gZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDA4KTsgLy8gMzJuZCBub3RlcyBwZXIgY3JvdGNoZXRcbiAgICAgIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCBldmVudC5ub21pbmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yLCBkZW5vbSwgUFBRL2V2ZW50Lm5vbWluYXRvcik7XG4gICAgfVxuICAgIC8vIHNldCB0aGUgbmV3IHRpY2tzIHJlZmVyZW5jZVxuICAgIC8vY29uc29sZS5sb2coc3RhdHVzLCBldmVudC50aWNrcywgdGlja3MpO1xuICAgIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIH1cbiAgZGVsdGEgPSBsYXN0RXZlbnRUaWNrcyAtIHRpY2tzO1xuICAvL2NvbnNvbGUubG9nKCdkJywgZGVsdGEsICd0JywgdGlja3MsICdsJywgbGFzdEV2ZW50VGlja3MpO1xuICBkZWx0YSA9IGNvbnZlcnRUb1ZMUShkZWx0YSk7XG4gIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCB0aWNrcywgZGVsdGEpO1xuICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoZGVsdGEpO1xuICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gIHRyYWNrQnl0ZXMucHVzaCgweDJGKTtcbiAgdHJhY2tCeXRlcy5wdXNoKDB4MDApO1xuICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgdHJhY2tCeXRlcyk7XG4gIHRyYWNrTGVuZ3RoID0gdHJhY2tCeXRlcy5sZW5ndGg7XG4gIGxlbmd0aEJ5dGVzID0gc3RyMkJ5dGVzKHRyYWNrTGVuZ3RoLnRvU3RyaW5nKDE2KSwgNCk7XG4gIHJldHVybiBbXS5jb25jYXQoVFJLX0NIVU5LSUQsIGxlbmd0aEJ5dGVzLCB0cmFja0J5dGVzKTtcbn1cblxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5cbi8qXG4gKiBDb252ZXJ0cyBhbiBhcnJheSBvZiBieXRlcyB0byBhIHN0cmluZyBvZiBoZXhhZGVjaW1hbCBjaGFyYWN0ZXJzLiBQcmVwYXJlc1xuICogaXQgdG8gYmUgY29udmVydGVkIGludG8gYSBiYXNlNjQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBieXRlQXJyYXkge0FycmF5fSBhcnJheSBvZiBieXRlcyB0aGF0IHdpbGwgYmUgY29udmVydGVkIHRvIGEgc3RyaW5nXG4gKiBAcmV0dXJucyBoZXhhZGVjaW1hbCBzdHJpbmdcbiAqL1xuXG5mdW5jdGlvbiBjb2RlczJTdHIoYnl0ZUFycmF5KSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGJ5dGVBcnJheSk7XG59XG5cbi8qXG4gKiBDb252ZXJ0cyBhIFN0cmluZyBvZiBoZXhhZGVjaW1hbCB2YWx1ZXMgdG8gYW4gYXJyYXkgb2YgYnl0ZXMuIEl0IGNhbiBhbHNvXG4gKiBhZGQgcmVtYWluaW5nICcwJyBuaWJibGVzIGluIG9yZGVyIHRvIGhhdmUgZW5vdWdoIGJ5dGVzIGluIHRoZSBhcnJheSBhcyB0aGVcbiAqIHxmaW5hbEJ5dGVzfCBwYXJhbWV0ZXIuXG4gKlxuICogQHBhcmFtIHN0ciB7U3RyaW5nfSBzdHJpbmcgb2YgaGV4YWRlY2ltYWwgdmFsdWVzIGUuZy4gJzA5N0I4QSdcbiAqIEBwYXJhbSBmaW5hbEJ5dGVzIHtJbnRlZ2VyfSBPcHRpb25hbC4gVGhlIGRlc2lyZWQgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgdGhlIHJldHVybmVkIGFycmF5IHNob3VsZCBjb250YWluXG4gKiBAcmV0dXJucyBhcnJheSBvZiBuaWJibGVzLlxuICovXG5cbmZ1bmN0aW9uIHN0cjJCeXRlcyhzdHIsIGZpbmFsQnl0ZXMpIHtcbiAgaWYgKGZpbmFsQnl0ZXMpIHtcbiAgICB3aGlsZSAoKHN0ci5sZW5ndGggLyAyKSA8IGZpbmFsQnl0ZXMpIHtcbiAgICAgIHN0ciA9ICcwJyArIHN0cjtcbiAgICB9XG4gIH1cblxuICB2YXIgYnl0ZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHN0ci5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMikge1xuICAgIHZhciBjaGFycyA9IGkgPT09IDAgPyBzdHJbaV0gOiBzdHJbaSAtIDFdICsgc3RyW2ldO1xuICAgIGJ5dGVzLnVuc2hpZnQocGFyc2VJbnQoY2hhcnMsIDE2KSk7XG4gIH1cblxuICByZXR1cm4gYnl0ZXM7XG59XG5cblxuLyoqXG4gKiBUcmFuc2xhdGVzIG51bWJlciBvZiB0aWNrcyB0byBNSURJIHRpbWVzdGFtcCBmb3JtYXQsIHJldHVybmluZyBhbiBhcnJheSBvZlxuICogYnl0ZXMgd2l0aCB0aGUgdGltZSB2YWx1ZXMuIE1pZGkgaGFzIGEgdmVyeSBwYXJ0aWN1bGFyIHRpbWUgdG8gZXhwcmVzcyB0aW1lLFxuICogdGFrZSBhIGdvb2QgbG9vayBhdCB0aGUgc3BlYyBiZWZvcmUgZXZlciB0b3VjaGluZyB0aGlzIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB0aWNrcyB7SW50ZWdlcn0gTnVtYmVyIG9mIHRpY2tzIHRvIGJlIHRyYW5zbGF0ZWRcbiAqIEByZXR1cm5zIEFycmF5IG9mIGJ5dGVzIHRoYXQgZm9ybSB0aGUgTUlESSB0aW1lIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRUb1ZMUSh0aWNrcykge1xuICB2YXIgYnVmZmVyID0gdGlja3MgJiAweDdGO1xuXG4gIHdoaWxlKHRpY2tzID0gdGlja3MgPj4gNykge1xuICAgIGJ1ZmZlciA8PD0gODtcbiAgICBidWZmZXIgfD0gKCh0aWNrcyAmIDB4N0YpIHwgMHg4MCk7XG4gIH1cblxuICB2YXIgYkxpc3QgPSBbXTtcbiAgd2hpbGUodHJ1ZSkge1xuICAgIGJMaXN0LnB1c2goYnVmZmVyICYgMHhmZik7XG5cbiAgICBpZiAoYnVmZmVyICYgMHg4MCkge1xuICAgICAgYnVmZmVyID4+PSA4O1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKHRpY2tzLCBiTGlzdCk7XG4gIHJldHVybiBiTGlzdDtcbn1cblxuXG4vKlxuICogQ29udmVydHMgYSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBBU0NJSSBjaGFyIGNvZGVzIGZvciBldmVyeSBjaGFyYWN0ZXIgb2ZcbiAqIHRoZSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHN0ciB7U3RyaW5nfSBTdHJpbmcgdG8gYmUgY29udmVydGVkXG4gKiBAcmV0dXJucyBhcnJheSB3aXRoIHRoZSBjaGFyY29kZSB2YWx1ZXMgb2YgdGhlIHN0cmluZ1xuICovXG5jb25zdCBBUCA9IEFycmF5LnByb3RvdHlwZVxuZnVuY3Rpb24gc3RyaW5nVG9OdW1BcnJheShzdHIpIHtcbiAgLy8gcmV0dXJuIHN0ci5zcGxpdCgpLmZvckVhY2goY2hhciA9PiB7XG4gIC8vICAgcmV0dXJuIGNoYXIuY2hhckNvZGVBdCgwKVxuICAvLyB9KVxuICByZXR1cm4gQVAubWFwLmNhbGwoc3RyLCBmdW5jdGlvbihjaGFyKSB7XG4gICAgcmV0dXJuIGNoYXIuY2hhckNvZGVBdCgwKVxuICB9KVxufVxuIiwiaW1wb3J0IHtnZXRNSURJT3V0cHV0QnlJZCwgZ2V0TUlESU91dHB1dHN9IGZyb20gJy4vaW5pdF9taWRpJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwnIC8vIG1pbGxpc1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjaGVkdWxlcntcblxuICBjb25zdHJ1Y3Rvcihzb25nKXtcbiAgICB0aGlzLnNvbmcgPSBzb25nXG4gICAgdGhpcy5ub3RlcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuYnVmZmVyVGltZSA9IHNvbmcuYnVmZmVyVGltZVxuICB9XG5cblxuICBpbml0KG1pbGxpcyl7XG4gICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyA9IG1pbGxpc1xuICAgIHRoaXMuc29uZ1N0YXJ0TWlsbGlzID0gbWlsbGlzXG4gICAgdGhpcy5ldmVudHMgPSB0aGlzLnNvbmcuX2FsbEV2ZW50c1xuICAgIHRoaXMubnVtRXZlbnRzID0gdGhpcy5ldmVudHMubGVuZ3RoXG4gICAgdGhpcy5pbmRleCA9IDBcbiAgICB0aGlzLm1heHRpbWUgPSAwXG4gICAgdGhpcy5wcmV2TWF4dGltZSA9IDBcbiAgICB0aGlzLmJleW9uZExvb3AgPSBmYWxzZSAvLyB0ZWxscyB1cyBpZiB0aGUgcGxheWhlYWQgaGFzIGFscmVhZHkgcGFzc2VkIHRoZSBsb29wZWQgc2VjdGlvblxuICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgICB0aGlzLmxvb3BlZCA9IGZhbHNlXG4gICAgdGhpcy5zZXRJbmRleCh0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgfVxuXG5cbiAgdXBkYXRlU29uZygpe1xuICAgIC8vdGhpcy5zb25nQ3VycmVudE1pbGxpcyA9IHRoaXMuc29uZy5fY3VycmVudE1pbGxpc1xuICAgIHRoaXMuZXZlbnRzID0gdGhpcy5zb25nLl9hbGxFdmVudHNcbiAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aFxuICAgIHRoaXMuaW5kZXggPSAwXG4gICAgdGhpcy5tYXh0aW1lID0gMFxuICAgIC8vdGhpcy5wcmVjb3VudGluZ0RvbmUgPSBmYWxzZVxuICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nLl9jdXJyZW50TWlsbGlzKVxuICB9XG5cblxuICBzZXRUaW1lU3RhbXAodGltZVN0YW1wKXtcbiAgICB0aGlzLnRpbWVTdGFtcCA9IHRpbWVTdGFtcCAvLyB0aW1lc3RhbXAgV2ViQXVkaW8gY29udGV4dCAtPiBmb3IgaW50ZXJuYWwgaW5zdHJ1bWVudHNcbiAgICB0aGlzLnRpbWVTdGFtcDIgPSBwZXJmb3JtYW5jZS5ub3coKSAvLyB0aW1lc3RhbXAgc2luY2Ugb3BlbmluZyB3ZWJwYWdlIC0+IGZvciBleHRlcm5hbCBpbnN0cnVtZW50c1xuICB9XG5cbiAgLy8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgZXZlbnQgdGhhdCBoYXMgaXRzIG1pbGxpcyB2YWx1ZSBhdCBvciByaWdodCBhZnRlciB0aGUgcHJvdmlkZWQgbWlsbGlzIHZhbHVlXG4gIHNldEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwXG4gICAgbGV0IGV2ZW50XG4gICAgZm9yKGV2ZW50IG9mIHRoaXMuZXZlbnRzKXtcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpe1xuICAgICAgICB0aGlzLmluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgdGhpcy5iZXlvbmRMb29wID0gbWlsbGlzID4gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgLy8gdGhpcy5ub3RlcyA9IG5ldyBNYXAoKVxuICAgIC8vdGhpcy5sb29wZWQgPSBmYWxzZVxuICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKCl7XG4gICAgbGV0IGV2ZW50cyA9IFtdXG5cbiAgICBpZih0aGlzLnNvbmcuX2xvb3AgPT09IHRydWUgJiYgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gPCB0aGlzLmJ1ZmZlclRpbWUpe1xuICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nU3RhcnRNaWxsaXMgKyB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvbiAtIDFcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCB0aGlzLnNvbmcubG9vcER1cmF0aW9uKTtcbiAgICB9XG5cbiAgICBpZih0aGlzLnNvbmcuX2xvb3AgPT09IHRydWUpe1xuXG4gICAgICBpZih0aGlzLm1heHRpbWUgPj0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzICYmIHRoaXMuYmV5b25kTG9vcCA9PT0gZmFsc2Upe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdMT09QJywgdGhpcy5tYXh0aW1lLCB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMpXG5cbiAgICAgICAgbGV0IGRpZmYgPSB0aGlzLm1heHRpbWUgLSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXNcbiAgICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXMgKyBkaWZmXG5cbiAgICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0tLUxPT1BFRCcsIHRoaXMubWF4dGltZSwgZGlmZiwgdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXMsIHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyk7XG5cbiAgICAgICAgaWYodGhpcy5sb29wZWQgPT09IGZhbHNlKXtcbiAgICAgICAgICB0aGlzLmxvb3BlZCA9IHRydWU7XG4gICAgICAgICAgbGV0IGxlZnRNaWxsaXMgPSB0aGlzLnNvbmcuX2xlZnRMb2NhdG9yLm1pbGxpc1xuICAgICAgICAgIGxldCByaWdodE1pbGxpcyA9IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuXG4gICAgICAgICAgZm9yKGxldCBpID0gdGhpcy5pbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspe1xuICAgICAgICAgICAgbGV0IGV2ZW50ID0gdGhpcy5ldmVudHNbaV07XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICAgICAgICAgICAgaWYoZXZlbnQubWlsbGlzIDwgcmlnaHRNaWxsaXMpe1xuICAgICAgICAgICAgICBldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpc1xuICAgICAgICAgICAgICBldmVudC50aW1lMiA9IHRoaXMudGltZVN0YW1wMiArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzXG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KVxuXG4gICAgICAgICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3Rlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkLCBldmVudC50eXBlKVxuICAgICAgICAgICAgICB0aGlzLmluZGV4KytcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgbm90ZXMtPiBhZGQgYSBuZXcgbm90ZSBvZmYgZXZlbnQgYXQgdGhlIHBvc2l0aW9uIG9mIHRoZSByaWdodCBsb2NhdG9yIChlbmQgb2YgdGhlIGxvb3ApXG4gICAgICAgICAgbGV0IGVuZFRpY2tzID0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IudGlja3MgLSAxXG4gICAgICAgICAgbGV0IGVuZE1pbGxpcyA9IHRoaXMuc29uZy5jYWxjdWxhdGVQb3NpdGlvbih7dHlwZTogJ3RpY2tzJywgdGFyZ2V0OiBlbmRUaWNrcywgcmVzdWx0OiAnbWlsbGlzJ30pLm1pbGxpc1xuXG4gICAgICAgICAgZm9yKGxldCBub3RlIG9mIHRoaXMubm90ZXMudmFsdWVzKCkpe1xuICAgICAgICAgICAgbGV0IG5vdGVPbiA9IG5vdGUubm90ZU9uXG4gICAgICAgICAgICBsZXQgbm90ZU9mZiA9IG5vdGUubm90ZU9mZlxuICAgICAgICAgICAgaWYobm90ZU9mZi5taWxsaXMgPD0gcmlnaHRNaWxsaXMpe1xuICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGV2ZW50ID0gbmV3IE1JRElFdmVudChlbmRUaWNrcywgMTI4LCBub3RlT24uZGF0YTEsIDApXG4gICAgICAgICAgICBldmVudC5taWxsaXMgPSBlbmRNaWxsaXNcbiAgICAgICAgICAgIGV2ZW50Ll9wYXJ0ID0gbm90ZU9uLl9wYXJ0XG4gICAgICAgICAgICBldmVudC5fdHJhY2sgPSBub3RlT24uX3RyYWNrXG4gICAgICAgICAgICBldmVudC5taWRpTm90ZSA9IG5vdGVcbiAgICAgICAgICAgIGV2ZW50Lm1pZGlOb3RlSWQgPSBub3RlLmlkXG4gICAgICAgICAgICBldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpc1xuICAgICAgICAgICAgZXZlbnQudGltZTIgPSB0aGlzLnRpbWVTdGFtcDIgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpc1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnYWRkZWQnLCBldmVudClcbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgICAgIH1cblxuLypcbiAgICAgICAgICAvLyBzdG9wIG92ZXJmbG93aW5nIGF1ZGlvIHNhbXBsZXNcbiAgICAgICAgICBmb3IoaSBpbiB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzKXtcbiAgICAgICAgICAgIGlmKHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHMuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgICBhdWRpb0V2ZW50ID0gdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50c1tpXTtcbiAgICAgICAgICAgICAgaWYoYXVkaW9FdmVudC5lbmRNaWxsaXMgPiB0aGlzLnNvbmcubG9vcEVuZCl7XG4gICAgICAgICAgICAgICAgYXVkaW9FdmVudC5zdG9wU2FtcGxlKHRoaXMuc29uZy5sb29wRW5kLzEwMDApO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3BwaW5nIGF1ZGlvIGV2ZW50JywgaSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4qL1xuICAgICAgICAgIHRoaXMubm90ZXMgPSBuZXcgTWFwKClcbiAgICAgICAgICB0aGlzLnNldEluZGV4KGxlZnRNaWxsaXMpXG4gICAgICAgICAgdGhpcy50aW1lU3RhbXAgKz0gdGhpcy5zb25nLl9sb29wRHVyYXRpb25cbiAgICAgICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzIC09IHRoaXMuc29uZy5fbG9vcER1cmF0aW9uXG5cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50cy5sZW5ndGgpXG5cbiAgICAgICAgICAvLyBnZXQgdGhlIGF1ZGlvIGV2ZW50cyB0aGF0IHN0YXJ0IGJlZm9yZSBzb25nLmxvb3BTdGFydFxuICAgICAgICAgIC8vdGhpcy5nZXREYW5nbGluZ0F1ZGlvRXZlbnRzKHRoaXMuc29uZy5sb29wU3RhcnQsIGV2ZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmxvb3BlZCA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZygnc2NoZWR1bGVyJywgdGhpcy5sb29wZWQpXG5cbiAgICAvLyBtYWluIGxvb3BcbiAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBsZXQgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCB0aGlzLm1heHRpbWUpXG4gICAgICBpZihldmVudC5taWxsaXMgPCB0aGlzLm1heHRpbWUpe1xuXG4gICAgICAgIC8vZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG5cbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJyl7XG4gICAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZXZlbnQudGltZSA9ICh0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKVxuICAgICAgICAgIGV2ZW50LnRpbWUyID0gKHRoaXMudGltZVN0YW1wMiArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKVxuICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBldmVudHM7XG4gIH1cblxuXG4gIHVwZGF0ZShkaWZmKXtcbiAgICB2YXIgaSxcbiAgICAgIGV2ZW50LFxuICAgICAgbnVtRXZlbnRzLFxuICAgICAgdHJhY2ssXG4gICAgICBldmVudHNcblxuICAgIHRoaXMucHJldk1heHRpbWUgPSB0aGlzLm1heHRpbWVcblxuICAgIGlmKHRoaXMuc29uZy5wcmVjb3VudGluZyl7XG4gICAgICB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKyB0aGlzLmJ1ZmZlclRpbWVcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5zb25nQ3VycmVudE1pbGxpcylcbiAgICAgIGV2ZW50cyA9IHRoaXMuc29uZy5fbWV0cm9ub21lLmdldFByZWNvdW50RXZlbnRzKHRoaXMubWF4dGltZSlcblxuICAgICAgLy8gaWYoZXZlbnRzLmxlbmd0aCA+IDApe1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMClcbiAgICAgIC8vICAgY29uc29sZS5sb2coZXZlbnRzKVxuICAgICAgLy8gfVxuXG4gICAgICBpZih0aGlzLm1heHRpbWUgPiB0aGlzLnNvbmcuX21ldHJvbm9tZS5lbmRNaWxsaXMgJiYgdGhpcy5wcmVjb3VudGluZ0RvbmUgPT09IGZhbHNlKXtcbiAgICAgICAgdGhpcy5wcmVjb3VudGluZ0RvbmUgPSB0cnVlXG4gICAgICAgIHRoaXMudGltZVN0YW1wICs9IHRoaXMuc29uZy5fcHJlY291bnREdXJhdGlvblxuXG4gICAgICAgIC8vIHN0YXJ0IHNjaGVkdWxpbmcgZXZlbnRzIG9mIHRoZSBzb25nIC0+IGFkZCB0aGUgZmlyc3QgZXZlbnRzIG9mIHRoZSBzb25nXG4gICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgPSB0aGlzLnNvbmdTdGFydE1pbGxpc1xuICAgICAgICAvL2NvbnNvbGUubG9nKCctLS0tPicsIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMpXG4gICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgdGhpcy5idWZmZXJUaW1lXG4gICAgICAgIGV2ZW50cy5wdXNoKC4uLnRoaXMuZ2V0RXZlbnRzKCkpXG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyArPSBkaWZmXG4gICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgdGhpcy5idWZmZXJUaW1lXG4gICAgICBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpXG4gICAgICAvL2V2ZW50cyA9IHRoaXMuc29uZy5fZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAgIC8vZXZlbnRzID0gdGhpcy5nZXRFdmVudHMyKHRoaXMubWF4dGltZSwgKHRoaXMudGltZVN0YW1wIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpKVxuICAgICAgLy9jb25zb2xlLmxvZygnZG9uZScsIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMsIGRpZmYsIHRoaXMuaW5kZXgsIGV2ZW50cy5sZW5ndGgpXG4gICAgfVxuXG4gICAgLy8gaWYodGhpcy5zb25nLnVzZU1ldHJvbm9tZSA9PT0gdHJ1ZSl7XG4gICAgLy8gICBsZXQgbWV0cm9ub21lRXZlbnRzID0gdGhpcy5zb25nLl9tZXRyb25vbWUuZ2V0RXZlbnRzMih0aGlzLm1heHRpbWUsICh0aGlzLnRpbWVTdGFtcCAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzKSlcbiAgICAvLyAgIC8vIGlmKG1ldHJvbm9tZUV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAvLyAgIC8vICAgY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCBtZXRyb25vbWVFdmVudHMpXG4gICAgLy8gICAvLyB9XG4gICAgLy8gICAvLyBtZXRyb25vbWVFdmVudHMuZm9yRWFjaChlID0+IHtcbiAgICAvLyAgIC8vICAgZS50aW1lID0gKHRoaXMudGltZVN0YW1wICsgZS5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcylcbiAgICAvLyAgIC8vIH0pXG4gICAgLy8gICBldmVudHMucHVzaCguLi5tZXRyb25vbWVFdmVudHMpXG4gICAgLy8gfVxuXG4gICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuXG5cbiAgICAvLyBpZihudW1FdmVudHMgPiA1KXtcbiAgICAvLyAgIGNvbnNvbGUubG9nKG51bUV2ZW50cylcbiAgICAvLyB9XG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5zb25nLl9jdXJyZW50TWlsbGlzLCAnW2RpZmZdJywgdGhpcy5tYXh0aW1lIC0gdGhpcy5wcmV2TWF4dGltZSlcblxuICAgIGZvcihpID0gMDsgaSA8IG51bUV2ZW50czsgaSsrKXtcbiAgICAgIGV2ZW50ID0gZXZlbnRzW2ldXG4gICAgICB0cmFjayA9IGV2ZW50Ll90cmFja1xuICAgICAgLy8gY29uc29sZS5sb2codGhpcy5tYXh0aW1lLCB0aGlzLnByZXZNYXh0aW1lLCBldmVudC5taWxsaXMpXG5cbiAgICAgIC8vIGlmKGV2ZW50Lm1pbGxpcyA+IHRoaXMubWF4dGltZSl7XG4gICAgICAvLyAgIC8vIHNraXAgZXZlbnRzIHRoYXQgd2VyZSBoYXJ2ZXN0IGFjY2lkZW50bHkgd2hpbGUganVtcGluZyB0aGUgcGxheWhlYWQgLT4gc2hvdWxkIGhhcHBlbiB2ZXJ5IHJhcmVseSBpZiBldmVyXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdza2lwJywgZXZlbnQpXG4gICAgICAvLyAgIGNvbnRpbnVlXG4gICAgICAvLyB9XG5cbiAgICAgIGlmKGV2ZW50Ll9wYXJ0ID09PSBudWxsIHx8IHRyYWNrID09PSBudWxsKXtcbiAgICAgICAgY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIHRoaXMubm90ZXMuc2V0KGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZihldmVudC5fcGFydC5tdXRlZCA9PT0gdHJ1ZSB8fCB0cmFjay5tdXRlZCA9PT0gdHJ1ZSB8fCBldmVudC5tdXRlZCA9PT0gdHJ1ZSl7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmKChldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTI4KSAmJiB0eXBlb2YgZXZlbnQubWlkaU5vdGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy8gdGhpcyBpcyB1c3VhbGx5IGNhdXNlZCBieSB0aGUgc2FtZSBub3RlIG9uIHRoZSBzYW1lIHRpY2tzIHZhbHVlLCB3aGljaCBpcyBwcm9iYWJseSBhIGJ1ZyBpbiB0aGUgbWlkaSBmaWxlXG4gICAgICAgIC8vY29uc29sZS5pbmZvKCdubyBtaWRpTm90ZUlkJywgZXZlbnQpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICAvLyAvY29uc29sZS5sb2coZXZlbnQudGlja3MsIGV2ZW50LnRpbWUsIGV2ZW50Lm1pbGxpcywgZXZlbnQudHlwZSwgZXZlbnQuX3RyYWNrLm5hbWUpXG5cbiAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfWVsc2V7XG4gICAgICAgIHRyYWNrLnByb2Nlc3NNSURJRXZlbnQoZXZlbnQpXG4gICAgICAgIC8vY29uc29sZS5sb2coY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAsIGV2ZW50LnRpbWUsIHRoaXMuaW5kZXgpXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAgICAgdGhpcy5ub3Rlcy5zZXQoZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQubWlkaU5vdGUpXG4gICAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAgICAgdGhpcy5ub3Rlcy5kZWxldGUoZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgfVxuICAgICAgICAvLyBpZih0aGlzLm5vdGVzLnNpemUgPiAwKXtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyh0aGlzLm5vdGVzKVxuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5pbmRleCwgdGhpcy5udW1FdmVudHMpXG4gICAgLy9yZXR1cm4gdGhpcy5pbmRleCA+PSAxMFxuICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubnVtRXZlbnRzIC8vIGxhc3QgZXZlbnQgb2Ygc29uZ1xuICB9XG5cbi8qXG4gIHVuc2NoZWR1bGUoKXtcblxuICAgIGxldCBtaW4gPSB0aGlzLnNvbmcuX2N1cnJlbnRNaWxsaXNcbiAgICBsZXQgbWF4ID0gbWluICsgKGJ1ZmZlclRpbWUgKiAxMDAwKVxuXG4gICAgLy9jb25zb2xlLmxvZygncmVzY2hlZHVsZScsIHRoaXMubm90ZXMuc2l6ZSlcbiAgICB0aGlzLm5vdGVzLmZvckVhY2goKG5vdGUsIGlkKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhub3RlKVxuICAgICAgLy8gY29uc29sZS5sb2cobm90ZS5ub3RlT24ubWlsbGlzLCBub3RlLm5vdGVPZmYubWlsbGlzLCBtaW4sIG1heClcblxuICAgICAgaWYodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnIHx8IG5vdGUuc3RhdGUgPT09ICdyZW1vdmVkJyl7XG4gICAgICAgIC8vc2FtcGxlLnVuc2NoZWR1bGUoMCwgdW5zY2hlZHVsZUNhbGxiYWNrKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnTk9URSBJUyBVTkRFRklORUQnKVxuICAgICAgICAvL3NhbXBsZS5zdG9wKDApXG4gICAgICAgIHRoaXMubm90ZXMuZGVsZXRlKGlkKVxuICAgICAgfWVsc2UgaWYoKG5vdGUubm90ZU9uLm1pbGxpcyA+PSBtaW4gfHwgbm90ZS5ub3RlT2ZmLm1pbGxpcyA8IG1heCkgPT09IGZhbHNlKXtcbiAgICAgICAgLy9zYW1wbGUuc3RvcCgwKVxuICAgICAgICBsZXQgbm90ZU9uID0gbm90ZS5ub3RlT25cbiAgICAgICAgbGV0IG5vdGVPZmYgPSBuZXcgTUlESUV2ZW50KDAsIDEyOCwgbm90ZU9uLmRhdGExLCAwKVxuICAgICAgICBub3RlT2ZmLm1pZGlOb3RlSWQgPSBub3RlLmlkXG4gICAgICAgIG5vdGVPZmYudGltZSA9IDAvL2NvbnRleHQuY3VycmVudFRpbWUgKyBtaW5cbiAgICAgICAgbm90ZS5fdHJhY2sucHJvY2Vzc01JRElFdmVudChub3RlT2ZmKVxuICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShpZClcbiAgICAgICAgY29uc29sZS5sb2coJ1NUT1BQSU5HJywgaWQsIG5vdGUuX3RyYWNrLm5hbWUpXG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKCdOT1RFUycsIHRoaXMubm90ZXMuc2l6ZSlcbiAgICAvL3RoaXMubm90ZXMuY2xlYXIoKVxuICB9XG4qL1xuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgbGV0IHRpbWVTdGFtcCA9IHBlcmZvcm1hbmNlLm5vdygpXG4gICAgbGV0IG91dHB1dHMgPSBnZXRNSURJT3V0cHV0cygpXG4gICAgb3V0cHV0cy5mb3JFYWNoKChvdXRwdXQpID0+IHtcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wICsgdGhpcy5idWZmZXJUaW1lKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXAgKyB0aGlzLmJ1ZmZlclRpbWUpIC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgIH0pXG4gIH1cbn1cblxuXG4vKlxuXG4gIGdldEV2ZW50czIobWF4dGltZSwgdGltZXN0YW1wKXtcbiAgICBsZXQgbG9vcCA9IHRydWVcbiAgICBsZXQgZXZlbnRcbiAgICBsZXQgcmVzdWx0ID0gW11cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMudGltZUV2ZW50c0luZGV4LCB0aGlzLnNvbmdFdmVudHNJbmRleCwgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleClcbiAgICB3aGlsZShsb29wKXtcblxuICAgICAgbGV0IHN0b3AgPSBmYWxzZVxuXG4gICAgICBpZih0aGlzLnRpbWVFdmVudHNJbmRleCA8IHRoaXMubnVtVGltZUV2ZW50cyl7XG4gICAgICAgIGV2ZW50ID0gdGhpcy50aW1lRXZlbnRzW3RoaXMudGltZUV2ZW50c0luZGV4XVxuICAgICAgICBpZihldmVudC5taWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICB0aGlzLm1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLm1pbGxpc1BlclRpY2spXG4gICAgICAgICAgdGhpcy50aW1lRXZlbnRzSW5kZXgrK1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdG9wID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKHRoaXMuc29uZ0V2ZW50c0luZGV4IDwgdGhpcy5udW1Tb25nRXZlbnRzKXtcbiAgICAgICAgZXZlbnQgPSB0aGlzLnNvbmdFdmVudHNbdGhpcy5zb25nRXZlbnRzSW5kZXhdXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDB4MkYpe1xuICAgICAgICAgIGxvb3AgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgbGV0IG1pbGxpcyA9IGV2ZW50LnRpY2tzICogdGhpcy5taWxsaXNQZXJUaWNrXG4gICAgICAgIGlmKG1pbGxpcyA8IG1heHRpbWUpe1xuICAgICAgICAgIGV2ZW50LnRpbWUgPSBtaWxsaXMgKyB0aW1lc3RhbXBcbiAgICAgICAgICBldmVudC5taWxsaXMgPSBtaWxsaXNcbiAgICAgICAgICByZXN1bHQucHVzaChldmVudClcbiAgICAgICAgICB0aGlzLnNvbmdFdmVudHNJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN0b3AgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYodGhpcy5zb25nLnVzZU1ldHJvbm9tZSA9PT0gdHJ1ZSAmJiB0aGlzLm1ldHJvbm9tZUV2ZW50c0luZGV4IDwgdGhpcy5udW1NZXRyb25vbWVFdmVudHMpe1xuICAgICAgICBldmVudCA9IHRoaXMubWV0cm9ub21lRXZlbnRzW3RoaXMubWV0cm9ub21lRXZlbnRzSW5kZXhdXG4gICAgICAgIGxldCBtaWxsaXMgPSBldmVudC50aWNrcyAqIHRoaXMubWlsbGlzUGVyVGlja1xuICAgICAgICBpZihtaWxsaXMgPCBtYXh0aW1lKXtcbiAgICAgICAgICBldmVudC50aW1lID0gbWlsbGlzICsgdGltZXN0YW1wXG4gICAgICAgICAgZXZlbnQubWlsbGlzID0gbWlsbGlzXG4gICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgICAgICAgdGhpcy5tZXRyb25vbWVFdmVudHNJbmRleCsrXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN0b3AgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYoc3RvcCl7XG4gICAgICAgIGxvb3AgPSBmYWxzZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBzb3J0RXZlbnRzKHJlc3VsdClcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuXG4qL1xuIiwiLy9pbXBvcnQgZ21JbnN0cnVtZW50cyBmcm9tICcuL2dtX2luc3RydW1lbnRzJ1xuXG4vL2NvbnN0IHBhcmFtcyA9IFsncHBxJywgJ2JwbScsICdiYXJzJywgJ3BpdGNoJywgJ2J1ZmZlclRpbWUnLCAnbG93ZXN0Tm90ZScsICdoaWdoZXN0Tm90ZScsICdub3RlTmFtZU1vZGUnLCAnbm9taW5hdG9yJywgJ2Rlbm9taW5hdG9yJywgJ3F1YW50aXplVmFsdWUnLCAnZml4ZWRMZW5ndGhWYWx1ZScsICdwb3NpdGlvblR5cGUnLCAndXNlTWV0cm9ub21lJywgJ2F1dG9TaXplJywgJ3BsYXliYWNrU3BlZWQnLCAnYXV0b1F1YW50aXplJywgXVxuXG5sZXQgc2V0dGluZ3MgPSB7XG4gIHBwcTogOTYwLFxuICBicG06IDEyMCxcbiAgYmFyczogMTYsXG4gIHBpdGNoOiA0NDAsXG4gIGJ1ZmZlclRpbWU6IDIwMCxcbiAgbG93ZXN0Tm90ZTogMCxcbiAgaGlnaGVzdE5vdGU6IDEyNyxcbiAgbm90ZU5hbWVNb2RlOiAnc2hhcnAnLFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIHBsYXliYWNrU3BlZWQ6IDEsXG4gIGF1dG9RdWFudGl6ZTogZmFsc2UsXG4gIHZvbHVtZTogMC41LFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTZXR0aW5ncyhkYXRhKXtcbiAgKHtcbiAgICBwcHE6IHNldHRpbmdzLnBwcSA9IHNldHRpbmdzLnBwcSxcbiAgICBicG06IHNldHRpbmdzLmJwbSA9IHNldHRpbmdzLmJwbSxcbiAgICBiYXJzOiBzZXR0aW5ncy5iYXJzID0gc2V0dGluZ3MuYmFycyxcbiAgICBwaXRjaDogc2V0dGluZ3MucGl0Y2ggPSBzZXR0aW5ncy5waXRjaCxcbiAgICBidWZmZXJUaW1lOiBzZXR0aW5ncy5idWZmZXJUaW1lID0gc2V0dGluZ3MuYnVmZmVyVGltZSxcbiAgICBsb3dlc3ROb3RlOiBzZXR0aW5ncy5sb3dlc3ROb3RlID0gc2V0dGluZ3MubG93ZXN0Tm90ZSxcbiAgICBoaWdoZXN0Tm90ZTogc2V0dGluZ3MuaGlnaGVzdE5vdGUgPSBzZXR0aW5ncy5oaWdoZXN0Tm90ZSxcbiAgICBub3RlTmFtZU1vZGU6IHNldHRpbmdzLm5vdGVOYW1lTW9kZSA9IHNldHRpbmdzLm5vdGVOYW1lTW9kZSxcbiAgICBub21pbmF0b3I6IHNldHRpbmdzLm5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcixcbiAgICBkZW5vbWluYXRvcjogc2V0dGluZ3MuZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcixcbiAgICBxdWFudGl6ZVZhbHVlOiBzZXR0aW5ncy5xdWFudGl6ZVZhbHVlID0gc2V0dGluZ3MucXVhbnRpemVWYWx1ZSxcbiAgICBmaXhlZExlbmd0aFZhbHVlOiBzZXR0aW5ncy5maXhlZExlbmd0aFZhbHVlID0gc2V0dGluZ3MuZml4ZWRMZW5ndGhWYWx1ZSxcbiAgICBwb3NpdGlvblR5cGU6IHNldHRpbmdzLnBvc2l0aW9uVHlwZSA9IHNldHRpbmdzLnBvc2l0aW9uVHlwZSxcbiAgICB1c2VNZXRyb25vbWU6IHNldHRpbmdzLnVzZU1ldHJvbm9tZSA9IHNldHRpbmdzLnVzZU1ldHJvbm9tZSxcbiAgICBhdXRvU2l6ZTogc2V0dGluZ3MuYXV0b1NpemUgPSBzZXR0aW5ncy5hdXRvU2l6ZSxcbiAgICBwbGF5YmFja1NwZWVkOiBzZXR0aW5ncy5wbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZCxcbiAgICBhdXRvUXVhbnRpemU6IHNldHRpbmdzLmF1dG9RdWFudGl6ZSA9IHNldHRpbmdzLmF1dG9RdWFudGl6ZSxcbiAgICB2b2x1bWU6IHNldHRpbmdzLnZvbHVtZSA9IHNldHRpbmdzLnZvbHVtZSxcbiAgfSA9IGRhdGEpXG5cbiAgY29uc29sZS5sb2coJ3NldHRpbmdzOiAlTycsIHNldHRpbmdzKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXR0aW5ncyguLi5wYXJhbXMpe1xuICByZXR1cm4gey4uLnNldHRpbmdzfVxuLypcbiAgbGV0IHJlc3VsdCA9IHt9XG4gIHBhcmFtcy5mb3JFYWNoKHBhcmFtID0+IHtcbiAgICBzd2l0Y2gocGFyYW0pe1xuICAgICAgY2FzZSAncGl0Y2gnOlxuICAgICAgICByZXN1bHQucGl0Y2ggPSBwaXRjaFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnbm90ZU5hbWVNb2RlJzpcbiAgICAgICAgcmVzdWx0Lm5vdGVOYW1lTW9kZSA9IG5vdGVOYW1lTW9kZVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnYnVmZmVyVGltZSc6XG4gICAgICAgIHJlc3VsdC5idWZmZXJUaW1lID0gYnVmZmVyVGltZVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncHBxJzpcbiAgICAgICAgcmVzdWx0LnBwcSA9IHBwcVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgIH1cbiAgfSlcbiAgcmV0dXJuIHJlc3VsdFxuKi9cbn1cblxuXG4vL3BvcnRlZCBoZWFydGJlYXQgaW5zdHJ1bWVudHM6IGh0dHA6Ly9naXRodWIuY29tL2FidWRhYW4vaGVhcnRiZWF0XG5jb25zdCBoZWFydGJlYXRJbnN0cnVtZW50cyA9IG5ldyBNYXAoW1xuICBbJ2NpdHktcGlhbm8nLCB7XG4gICAgbmFtZTogJ0NpdHkgUGlhbm8gKHBpYW5vKScsXG4gICAgZGVzY3JpcHRpb246ICdDaXR5IFBpYW5vIHVzZXMgc2FtcGxlcyBmcm9tIGEgQmFsZHdpbiBwaWFubywgaXQgaGFzIDQgdmVsb2NpdHkgbGF5ZXJzOiAxIC0gNDgsIDQ5IC0gOTYsIDk3IC0gMTEwIGFuZCAxMTAgLSAxMjcuIEluIHRvdGFsIGl0IHVzZXMgNCAqIDg4ID0gMzUyIHNhbXBsZXMnLFxuICB9XSxcbiAgWydjaXR5LXBpYW5vLWxpZ2h0Jywge1xuICAgIG5hbWU6ICdDaXR5IFBpYW5vIExpZ2h0IChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyBsaWdodCB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyBvbmx5IDEgdmVsb2NpdHkgbGF5ZXIgYW5kIHVzZXMgODggc2FtcGxlcycsXG4gIH1dLFxuICBbJ2NrLWljZXNrYXRlcycsIHtcbiAgICBuYW1lOiAnQ0sgSWNlIFNrYXRlcyAoc3ludGgpJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgRGV0dW5pemVkIHNhbXBsZXMnLFxuICB9XSxcbiAgWydzaGsyLXNxdWFyZXJvb3QnLCB7XG4gICAgbmFtZTogJ1NISzIgc3F1YXJlcm9vdCAoc3ludGgpJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgRGV0dW5pemVkIHNhbXBsZXMnLFxuICB9XSxcbiAgWydyaG9kZXMnLCB7XG4gICAgbmFtZTogJ1Job2RlcyAocGlhbm8pJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgRnJlZXNvdW5kIHNhbXBsZXMnLFxuICB9XSxcbiAgWydyaG9kZXMyJywge1xuICAgIG5hbWU6ICdSaG9kZXMgMiAocGlhbm8pJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgRGV0dW5pemVkIHNhbXBsZXMnLFxuICB9XSxcbiAgWyd0cnVtcGV0Jywge1xuICAgIG5hbWU6ICdUcnVtcGV0IChicmFzcyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBTU08gc2FtcGxlcycsXG4gIH1dLFxuICBbJ3Zpb2xpbicsIHtcbiAgICBuYW1lOiAnVmlvbGluIChzdHJpbmdzKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIFNTTyBzYW1wbGVzJyxcbiAgfV1cbl0pXG5leHBvcnQgY29uc3QgZ2V0SW5zdHJ1bWVudHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gaGVhcnRiZWF0SW5zdHJ1bWVudHNcbn1cblxuLy8gZ20gc291bmRzIGV4cG9ydGVkIGZyb20gRmx1aWRTeW50aCBieSBCZW5qYW1pbiBHbGVpdHptYW46IGh0dHBzOi8vZ2l0aHViLmNvbS9nbGVpdHovbWlkaS1qcy1zb3VuZGZvbnRzXG5jb25zdCBnbUluc3RydW1lbnRzID0ge1wiYWNvdXN0aWNfZ3JhbmRfcGlhbm9cIjp7XCJuYW1lXCI6XCIxIEFjb3VzdGljIEdyYW5kIFBpYW5vIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJicmlnaHRfYWNvdXN0aWNfcGlhbm9cIjp7XCJuYW1lXCI6XCIyIEJyaWdodCBBY291c3RpYyBQaWFubyAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfZ3JhbmRfcGlhbm9cIjp7XCJuYW1lXCI6XCIzIEVsZWN0cmljIEdyYW5kIFBpYW5vIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJob25reXRvbmtfcGlhbm9cIjp7XCJuYW1lXCI6XCI0IEhvbmt5LXRvbmsgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX3BpYW5vXzFcIjp7XCJuYW1lXCI6XCI1IEVsZWN0cmljIFBpYW5vIDEgKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX3BpYW5vXzJcIjp7XCJuYW1lXCI6XCI2IEVsZWN0cmljIFBpYW5vIDIgKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhhcnBzaWNob3JkXCI6e1wibmFtZVwiOlwiNyBIYXJwc2ljaG9yZCAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2xhdmluZXRcIjp7XCJuYW1lXCI6XCI4IENsYXZpbmV0IChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjZWxlc3RhXCI6e1wibmFtZVwiOlwiOSBDZWxlc3RhIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImdsb2NrZW5zcGllbFwiOntcIm5hbWVcIjpcIjEwIEdsb2NrZW5zcGllbCAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJtdXNpY19ib3hcIjp7XCJuYW1lXCI6XCIxMSBNdXNpYyBCb3ggKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidmlicmFwaG9uZVwiOntcIm5hbWVcIjpcIjEyIFZpYnJhcGhvbmUgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibWFyaW1iYVwiOntcIm5hbWVcIjpcIjEzIE1hcmltYmEgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwieHlsb3Bob25lXCI6e1wibmFtZVwiOlwiMTQgWHlsb3Bob25lIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInR1YnVsYXJfYmVsbHNcIjp7XCJuYW1lXCI6XCIxNSBUdWJ1bGFyIEJlbGxzIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImR1bGNpbWVyXCI6e1wibmFtZVwiOlwiMTYgRHVsY2ltZXIgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZHJhd2Jhcl9vcmdhblwiOntcIm5hbWVcIjpcIjE3IERyYXdiYXIgT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBlcmN1c3NpdmVfb3JnYW5cIjp7XCJuYW1lXCI6XCIxOCBQZXJjdXNzaXZlIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJyb2NrX29yZ2FuXCI6e1wibmFtZVwiOlwiMTkgUm9jayBPcmdhbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2h1cmNoX29yZ2FuXCI6e1wibmFtZVwiOlwiMjAgQ2h1cmNoIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJyZWVkX29yZ2FuXCI6e1wibmFtZVwiOlwiMjEgUmVlZCBPcmdhbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWNjb3JkaW9uXCI6e1wibmFtZVwiOlwiMjIgQWNjb3JkaW9uIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJoYXJtb25pY2FcIjp7XCJuYW1lXCI6XCIyMyBIYXJtb25pY2EgKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRhbmdvX2FjY29yZGlvblwiOntcIm5hbWVcIjpcIjI0IFRhbmdvIEFjY29yZGlvbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWNvdXN0aWNfZ3VpdGFyX255bG9uXCI6e1wibmFtZVwiOlwiMjUgQWNvdXN0aWMgR3VpdGFyIChueWxvbikgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY291c3RpY19ndWl0YXJfc3RlZWxcIjp7XCJuYW1lXCI6XCIyNiBBY291c3RpYyBHdWl0YXIgKHN0ZWVsKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX2d1aXRhcl9qYXp6XCI6e1wibmFtZVwiOlwiMjcgRWxlY3RyaWMgR3VpdGFyIChqYXp6KSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX2d1aXRhcl9jbGVhblwiOntcIm5hbWVcIjpcIjI4IEVsZWN0cmljIEd1aXRhciAoY2xlYW4pIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfZ3VpdGFyX211dGVkXCI6e1wibmFtZVwiOlwiMjkgRWxlY3RyaWMgR3VpdGFyIChtdXRlZCkgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJvdmVyZHJpdmVuX2d1aXRhclwiOntcIm5hbWVcIjpcIjMwIE92ZXJkcml2ZW4gR3VpdGFyIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZGlzdG9ydGlvbl9ndWl0YXJcIjp7XCJuYW1lXCI6XCIzMSBEaXN0b3J0aW9uIEd1aXRhciAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImd1aXRhcl9oYXJtb25pY3NcIjp7XCJuYW1lXCI6XCIzMiBHdWl0YXIgSGFybW9uaWNzIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWNvdXN0aWNfYmFzc1wiOntcIm5hbWVcIjpcIjMzIEFjb3VzdGljIEJhc3MgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfYmFzc19maW5nZXJcIjp7XCJuYW1lXCI6XCIzNCBFbGVjdHJpYyBCYXNzIChmaW5nZXIpIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVsZWN0cmljX2Jhc3NfcGlja1wiOntcIm5hbWVcIjpcIjM1IEVsZWN0cmljIEJhc3MgKHBpY2spIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZyZXRsZXNzX2Jhc3NcIjp7XCJuYW1lXCI6XCIzNiBGcmV0bGVzcyBCYXNzIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNsYXBfYmFzc18xXCI6e1wibmFtZVwiOlwiMzcgU2xhcCBCYXNzIDEgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2xhcF9iYXNzXzJcIjp7XCJuYW1lXCI6XCIzOCBTbGFwIEJhc3MgMiAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9iYXNzXzFcIjp7XCJuYW1lXCI6XCIzOSBTeW50aCBCYXNzIDEgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfYmFzc18yXCI6e1wibmFtZVwiOlwiNDAgU3ludGggQmFzcyAyIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInZpb2xpblwiOntcIm5hbWVcIjpcIjQxIFZpb2xpbiAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2aW9sYVwiOntcIm5hbWVcIjpcIjQyIFZpb2xhIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNlbGxvXCI6e1wibmFtZVwiOlwiNDMgQ2VsbG8gKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY29udHJhYmFzc1wiOntcIm5hbWVcIjpcIjQ0IENvbnRyYWJhc3MgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidHJlbW9sb19zdHJpbmdzXCI6e1wibmFtZVwiOlwiNDUgVHJlbW9sbyBTdHJpbmdzIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBpenppY2F0b19zdHJpbmdzXCI6e1wibmFtZVwiOlwiNDYgUGl6emljYXRvIFN0cmluZ3MgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib3JjaGVzdHJhbF9oYXJwXCI6e1wibmFtZVwiOlwiNDcgT3JjaGVzdHJhbCBIYXJwIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRpbXBhbmlcIjp7XCJuYW1lXCI6XCI0OCBUaW1wYW5pIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN0cmluZ19lbnNlbWJsZV8xXCI6e1wibmFtZVwiOlwiNDkgU3RyaW5nIEVuc2VtYmxlIDEgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN0cmluZ19lbnNlbWJsZV8yXCI6e1wibmFtZVwiOlwiNTAgU3RyaW5nIEVuc2VtYmxlIDIgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX3N0cmluZ3NfMVwiOntcIm5hbWVcIjpcIjUxIFN5bnRoIFN0cmluZ3MgMSAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfc3RyaW5nc18yXCI6e1wibmFtZVwiOlwiNTIgU3ludGggU3RyaW5ncyAyIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjaG9pcl9hYWhzXCI6e1wibmFtZVwiOlwiNTMgQ2hvaXIgQWFocyAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidm9pY2Vfb29oc1wiOntcIm5hbWVcIjpcIjU0IFZvaWNlIE9vaHMgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2Nob2lyXCI6e1wibmFtZVwiOlwiNTUgU3ludGggQ2hvaXIgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9yY2hlc3RyYV9oaXRcIjp7XCJuYW1lXCI6XCI1NiBPcmNoZXN0cmEgSGl0IChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0cnVtcGV0XCI6e1wibmFtZVwiOlwiNTcgVHJ1bXBldCAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidHJvbWJvbmVcIjp7XCJuYW1lXCI6XCI1OCBUcm9tYm9uZSAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidHViYVwiOntcIm5hbWVcIjpcIjU5IFR1YmEgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm11dGVkX3RydW1wZXRcIjp7XCJuYW1lXCI6XCI2MCBNdXRlZCBUcnVtcGV0IChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmcmVuY2hfaG9yblwiOntcIm5hbWVcIjpcIjYxIEZyZW5jaCBIb3JuIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJicmFzc19zZWN0aW9uXCI6e1wibmFtZVwiOlwiNjIgQnJhc3MgU2VjdGlvbiAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfYnJhc3NfMVwiOntcIm5hbWVcIjpcIjYzIFN5bnRoIEJyYXNzIDEgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2JyYXNzXzJcIjp7XCJuYW1lXCI6XCI2NCBTeW50aCBCcmFzcyAyIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzb3ByYW5vX3NheFwiOntcIm5hbWVcIjpcIjY1IFNvcHJhbm8gU2F4IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFsdG9fc2F4XCI6e1wibmFtZVwiOlwiNjYgQWx0byBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGVub3Jfc2F4XCI6e1wibmFtZVwiOlwiNjcgVGVub3IgU2F4IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJhcml0b25lX3NheFwiOntcIm5hbWVcIjpcIjY4IEJhcml0b25lIFNheCAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJvYm9lXCI6e1wibmFtZVwiOlwiNjkgT2JvZSAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbmdsaXNoX2hvcm5cIjp7XCJuYW1lXCI6XCI3MCBFbmdsaXNoIEhvcm4gKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFzc29vblwiOntcIm5hbWVcIjpcIjcxIEJhc3Nvb24gKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2xhcmluZXRcIjp7XCJuYW1lXCI6XCI3MiBDbGFyaW5ldCAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwaWNjb2xvXCI6e1wibmFtZVwiOlwiNzMgUGljY29sbyAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmbHV0ZVwiOntcIm5hbWVcIjpcIjc0IEZsdXRlIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJlY29yZGVyXCI6e1wibmFtZVwiOlwiNzUgUmVjb3JkZXIgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFuX2ZsdXRlXCI6e1wibmFtZVwiOlwiNzYgUGFuIEZsdXRlIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJsb3duX2JvdHRsZVwiOntcIm5hbWVcIjpcIjc3IEJsb3duIEJvdHRsZSAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzaGFrdWhhY2hpXCI6e1wibmFtZVwiOlwiNzggU2hha3VoYWNoaSAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ3aGlzdGxlXCI6e1wibmFtZVwiOlwiNzkgV2hpc3RsZSAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJvY2FyaW5hXCI6e1wibmFtZVwiOlwiODAgT2NhcmluYSAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzFfc3F1YXJlXCI6e1wibmFtZVwiOlwiODEgTGVhZCAxIChzcXVhcmUpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF8yX3Nhd3Rvb3RoXCI6e1wibmFtZVwiOlwiODIgTGVhZCAyIChzYXd0b290aCkgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzNfY2FsbGlvcGVcIjp7XCJuYW1lXCI6XCI4MyBMZWFkIDMgKGNhbGxpb3BlKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfNF9jaGlmZlwiOntcIm5hbWVcIjpcIjg0IExlYWQgNCAoY2hpZmYpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF81X2NoYXJhbmdcIjp7XCJuYW1lXCI6XCI4NSBMZWFkIDUgKGNoYXJhbmcpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF82X3ZvaWNlXCI6e1wibmFtZVwiOlwiODYgTGVhZCA2ICh2b2ljZSkgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzdfZmlmdGhzXCI6e1wibmFtZVwiOlwiODcgTGVhZCA3IChmaWZ0aHMpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF84X2Jhc3NfX2xlYWRcIjp7XCJuYW1lXCI6XCI4OCBMZWFkIDggKGJhc3MgKyBsZWFkKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF8xX25ld19hZ2VcIjp7XCJuYW1lXCI6XCI4OSBQYWQgMSAobmV3IGFnZSkgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF8yX3dhcm1cIjp7XCJuYW1lXCI6XCI5MCBQYWQgMiAod2FybSkgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF8zX3BvbHlzeW50aFwiOntcIm5hbWVcIjpcIjkxIFBhZCAzIChwb2x5c3ludGgpIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfNF9jaG9pclwiOntcIm5hbWVcIjpcIjkyIFBhZCA0IChjaG9pcikgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF81X2Jvd2VkXCI6e1wibmFtZVwiOlwiOTMgUGFkIDUgKGJvd2VkKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzZfbWV0YWxsaWNcIjp7XCJuYW1lXCI6XCI5NCBQYWQgNiAobWV0YWxsaWMpIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfN19oYWxvXCI6e1wibmFtZVwiOlwiOTUgUGFkIDcgKGhhbG8pIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfOF9zd2VlcFwiOntcIm5hbWVcIjpcIjk2IFBhZCA4IChzd2VlcCkgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzFfcmFpblwiOntcIm5hbWVcIjpcIjk3IEZYIDEgKHJhaW4pIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfMl9zb3VuZHRyYWNrXCI6e1wibmFtZVwiOlwiOTggRlggMiAoc291bmR0cmFjaykgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF8zX2NyeXN0YWxcIjp7XCJuYW1lXCI6XCI5OSBGWCAzIChjcnlzdGFsKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzRfYXRtb3NwaGVyZVwiOntcIm5hbWVcIjpcIjEwMCBGWCA0IChhdG1vc3BoZXJlKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzVfYnJpZ2h0bmVzc1wiOntcIm5hbWVcIjpcIjEwMSBGWCA1IChicmlnaHRuZXNzKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzZfZ29ibGluc1wiOntcIm5hbWVcIjpcIjEwMiBGWCA2IChnb2JsaW5zKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzdfZWNob2VzXCI6e1wibmFtZVwiOlwiMTAzIEZYIDcgKGVjaG9lcykgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF84X3NjaWZpXCI6e1wibmFtZVwiOlwiMTA0IEZYIDggKHNjaS1maSkgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzaXRhclwiOntcIm5hbWVcIjpcIjEwNSBTaXRhciAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJhbmpvXCI6e1wibmFtZVwiOlwiMTA2IEJhbmpvIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2hhbWlzZW5cIjp7XCJuYW1lXCI6XCIxMDcgU2hhbWlzZW4gKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJrb3RvXCI6e1wibmFtZVwiOlwiMTA4IEtvdG8gKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJrYWxpbWJhXCI6e1wibmFtZVwiOlwiMTA5IEthbGltYmEgKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiYWdwaXBlXCI6e1wibmFtZVwiOlwiMTEwIEJhZ3BpcGUgKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmaWRkbGVcIjp7XCJuYW1lXCI6XCIxMTEgRmlkZGxlIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2hhbmFpXCI6e1wibmFtZVwiOlwiMTEyIFNoYW5haSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRpbmtsZV9iZWxsXCI6e1wibmFtZVwiOlwiMTEzIFRpbmtsZSBCZWxsIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFnb2dvXCI6e1wibmFtZVwiOlwiMTE0IEFnb2dvIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN0ZWVsX2RydW1zXCI6e1wibmFtZVwiOlwiMTE1IFN0ZWVsIERydW1zIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIndvb2RibG9ja1wiOntcIm5hbWVcIjpcIjExNiBXb29kYmxvY2sgKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGFpa29fZHJ1bVwiOntcIm5hbWVcIjpcIjExNyBUYWlrbyBEcnVtIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm1lbG9kaWNfdG9tXCI6e1wibmFtZVwiOlwiMTE4IE1lbG9kaWMgVG9tIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2RydW1cIjp7XCJuYW1lXCI6XCIxMTkgU3ludGggRHJ1bSAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJyZXZlcnNlX2N5bWJhbFwiOntcIm5hbWVcIjpcIjEyMCBSZXZlcnNlIEN5bWJhbCAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImd1aXRhcl9mcmV0X25vaXNlXCI6e1wibmFtZVwiOlwiMTIxIEd1aXRhciBGcmV0IE5vaXNlIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYnJlYXRoX25vaXNlXCI6e1wibmFtZVwiOlwiMTIyIEJyZWF0aCBOb2lzZSAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNlYXNob3JlXCI6e1wibmFtZVwiOlwiMTIzIFNlYXNob3JlIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmlyZF90d2VldFwiOntcIm5hbWVcIjpcIjEyNCBCaXJkIFR3ZWV0IChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGVsZXBob25lX3JpbmdcIjp7XCJuYW1lXCI6XCIxMjUgVGVsZXBob25lIFJpbmcgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJoZWxpY29wdGVyXCI6e1wibmFtZVwiOlwiMTI2IEhlbGljb3B0ZXIgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhcHBsYXVzZVwiOntcIm5hbWVcIjpcIjEyNyBBcHBsYXVzZSAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImd1bnNob3RcIjp7XCJuYW1lXCI6XCIxMjggR3Vuc2hvdCAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifX1cbmxldCBnbU1hcCA9IG5ldyBNYXAoKVxuT2JqZWN0LmtleXMoZ21JbnN0cnVtZW50cykuZm9yRWFjaChrZXkgPT4ge1xuICBnbU1hcC5zZXQoa2V5LCBnbUluc3RydW1lbnRzW2tleV0pXG59KVxuZXhwb3J0IGNvbnN0IGdldEdNSW5zdHJ1bWVudHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gZ21NYXBcbn1cblxuIiwiaW1wb3J0IHtJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5pbXBvcnQge1NhbXBsZU9zY2lsbGF0b3J9IGZyb20gJy4vc2FtcGxlX29zY2lsbGF0b3InXG5cbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgU2ltcGxlU3ludGggZXh0ZW5kcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgbmFtZTogc3RyaW5nKXtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgdGhpcy5pZFxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLnNhbXBsZURhdGEgPSB7XG4gICAgICB0eXBlLFxuICAgICAgcmVsZWFzZUR1cmF0aW9uOiAwLjIsXG4gICAgICByZWxlYXNlRW52ZWxvcGU6ICdlcXVhbCBwb3dlcidcbiAgICB9XG4gIH1cblxuICBjcmVhdGVTYW1wbGUoZXZlbnQpe1xuICAgIHJldHVybiBuZXcgU2FtcGxlT3NjaWxsYXRvcih0aGlzLnNhbXBsZURhdGEsIGV2ZW50KVxuICB9XG5cbiAgLy8gc3RlcmVvIHNwcmVhZFxuICBzZXRLZXlTY2FsaW5nUGFubmluZygpe1xuICAgIC8vIHNldHMgcGFubmluZyBiYXNlZCBvbiB0aGUga2V5IHZhbHVlLCBlLmcuIGhpZ2hlciBub3RlcyBhcmUgcGFubmVkIG1vcmUgdG8gdGhlIHJpZ2h0IGFuZCBsb3dlciBub3RlcyBtb3JlIHRvIHRoZSBsZWZ0XG4gIH1cblxuICBzZXRLZXlTY2FsaW5nUmVsZWFzZSgpe1xuICAgIC8vIHNldCByZWxlYXNlIGJhc2VkIG9uIGtleSB2YWx1ZVxuICB9XG5cbiAgLypcbiAgICBAZHVyYXRpb246IG1pbGxpc2Vjb25kc1xuICAgIEBlbnZlbG9wZTogbGluZWFyIHwgZXF1YWxfcG93ZXIgfCBhcnJheSBvZiBpbnQgdmFsdWVzXG4gICovXG4gIHNldFJlbGVhc2UoZHVyYXRpb246IG51bWJlciwgZW52ZWxvcGUpe1xuICAgIHRoaXMuc2FtcGxlRGF0YS5yZWxlYXNlRHVyYXRpb24gPSBkdXJhdGlvblxuICAgIHRoaXMuc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUgPSBlbnZlbG9wZVxuICB9XG59XG4iLCIvL0AgZmxvd1xuXG5pbXBvcnQge01JRElFdmVudFR5cGVzfSBmcm9tICcuL2NvbnN0YW50cydcbmltcG9ydCB7cGFyc2VFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtjb250ZXh0LCBtYXN0ZXJHYWluLCB1bmxvY2tXZWJBdWRpb30gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlcidcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge3NvbmdGcm9tTUlESUZpbGUsIHNvbmdGcm9tTUlESUZpbGVTeW5jfSBmcm9tICcuL3NvbmdfZnJvbV9taWRpZmlsZSdcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtjYWxjdWxhdGVQb3NpdGlvbn0gZnJvbSAnLi9wb3NpdGlvbidcbmltcG9ydCB7UGxheWhlYWR9IGZyb20gJy4vcGxheWhlYWQnXG5pbXBvcnQge01ldHJvbm9tZX0gZnJvbSAnLi9tZXRyb25vbWUnXG5pbXBvcnQge2FkZEV2ZW50TGlzdGVuZXIsIHJlbW92ZUV2ZW50TGlzdGVuZXIsIGRpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcbmltcG9ydCB7c2F2ZUFzTUlESUZpbGV9IGZyb20gJy4vc2F2ZV9taWRpZmlsZSdcbmltcG9ydCB7dXBkYXRlLCBfdXBkYXRlfSBmcm9tICcuL3NvbmcudXBkYXRlJ1xuaW1wb3J0IHtnZXRTZXR0aW5nc30gZnJvbSAnLi9zZXR0aW5ncydcblxubGV0IGluc3RhbmNlSW5kZXggPSAwXG5sZXQgcmVjb3JkaW5nSW5kZXggPSAwXG5cblxuLypcbnR5cGUgc29uZ1NldHRpbmdzID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIHBwcTogbnVtYmVyLFxuICBicG06IG51bWJlcixcbiAgYmFyczogbnVtYmVyLFxuICBsb3dlc3ROb3RlOiBudW1iZXIsXG4gIGhpZ2hlc3ROb3RlOiBudW1iZXIsXG4gIG5vbWluYXRvcjogbnVtYmVyLFxuICBkZW5vbWluYXRvcjogbnVtYmVyLFxuICBxdWFudGl6ZVZhbHVlOiBudW1iZXIsXG4gIGZpeGVkTGVuZ3RoVmFsdWU6IG51bWJlcixcbiAgcG9zaXRpb25UeXBlOiBzdHJpbmcsXG4gIHVzZU1ldHJvbm9tZTogYm9vbGVhbixcbiAgYXV0b1NpemU6IGJvb2xlYW4sXG4gIGxvb3A6IGJvb2xlYW4sXG4gIHBsYXliYWNrU3BlZWQ6IG51bWJlcixcbiAgYXV0b1F1YW50aXplOiBib29sZWFuLFxuICBwaXRjaDogbnVtYmVyLFxuICBidWZmZXJUaW1lOiBudW1iZXIsXG4gIG5vdGVOYW1lTW9kZTogc3RyaW5nXG59XG4qL1xuXG4vKlxuICAvLyBpbml0aWFsaXplIHNvbmcgd2l0aCB0cmFja3MgYW5kIHBhcnQgc28geW91IGRvIG5vdCBoYXZlIHRvIGNyZWF0ZSB0aGVtIHNlcGFyYXRlbHlcbiAgc2V0dXA6IHtcbiAgICB0aW1lRXZlbnRzOiBbXVxuICAgIHRyYWNrczogW1xuICAgICAgcGFydHMgW11cbiAgICBdXG4gIH1cbiovXG5cbmV4cG9ydCBjbGFzcyBTb25ne1xuXG4gIHN0YXRpYyBmcm9tTUlESUZpbGUoZGF0YSl7XG4gICAgcmV0dXJuIHNvbmdGcm9tTUlESUZpbGUoZGF0YSlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tTUlESUZpbGVTeW5jKGRhdGEpe1xuICAgIHJldHVybiBzb25nRnJvbU1JRElGaWxlU3luYyhkYXRhKVxuICB9XG5cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3M6IHt9ID0ge30pe1xuXG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIGxldCBkZWZhdWx0U2V0dGluZ3MgPSBnZXRTZXR0aW5ncygpO1xuXG4gICAgKHtcbiAgICAgIG5hbWU6IHRoaXMubmFtZSA9IHRoaXMuaWQsXG4gICAgICBwcHE6IHRoaXMucHBxID0gZGVmYXVsdFNldHRpbmdzLnBwcSxcbiAgICAgIGJwbTogdGhpcy5icG0gPSBkZWZhdWx0U2V0dGluZ3MuYnBtLFxuICAgICAgYmFyczogdGhpcy5iYXJzID0gZGVmYXVsdFNldHRpbmdzLmJhcnMsXG4gICAgICBub21pbmF0b3I6IHRoaXMubm9taW5hdG9yID0gZGVmYXVsdFNldHRpbmdzLm5vbWluYXRvcixcbiAgICAgIGRlbm9taW5hdG9yOiB0aGlzLmRlbm9taW5hdG9yID0gZGVmYXVsdFNldHRpbmdzLmRlbm9taW5hdG9yLFxuICAgICAgcXVhbnRpemVWYWx1ZTogdGhpcy5xdWFudGl6ZVZhbHVlID0gZGVmYXVsdFNldHRpbmdzLnF1YW50aXplVmFsdWUsXG4gICAgICBmaXhlZExlbmd0aFZhbHVlOiB0aGlzLmZpeGVkTGVuZ3RoVmFsdWUgPSBkZWZhdWx0U2V0dGluZ3MuZml4ZWRMZW5ndGhWYWx1ZSxcbiAgICAgIHVzZU1ldHJvbm9tZTogdGhpcy51c2VNZXRyb25vbWUgPSBkZWZhdWx0U2V0dGluZ3MudXNlTWV0cm9ub21lLFxuICAgICAgYXV0b1NpemU6IHRoaXMuYXV0b1NpemUgPSBkZWZhdWx0U2V0dGluZ3MuYXV0b1NpemUsXG4gICAgICBwbGF5YmFja1NwZWVkOiB0aGlzLnBsYXliYWNrU3BlZWQgPSBkZWZhdWx0U2V0dGluZ3MucGxheWJhY2tTcGVlZCxcbiAgICAgIGF1dG9RdWFudGl6ZTogdGhpcy5hdXRvUXVhbnRpemUgPSBkZWZhdWx0U2V0dGluZ3MuYXV0b1F1YW50aXplLFxuICAgICAgcGl0Y2g6IHRoaXMucGl0Y2ggPSBkZWZhdWx0U2V0dGluZ3MucGl0Y2gsXG4gICAgICBidWZmZXJUaW1lOiB0aGlzLmJ1ZmZlclRpbWUgPSBkZWZhdWx0U2V0dGluZ3MuYnVmZmVyVGltZSxcbiAgICAgIG5vdGVOYW1lTW9kZTogdGhpcy5ub3RlTmFtZU1vZGUgPSBkZWZhdWx0U2V0dGluZ3Mubm90ZU5hbWVNb2RlLFxuICAgICAgdm9sdW1lOiB0aGlzLnZvbHVtZSA9IGRlZmF1bHRTZXR0aW5ncy52b2x1bWUsXG4gICAgfSA9IHNldHRpbmdzKTtcblxuICAgIHRoaXMuX3RpbWVFdmVudHMgPSBbXVxuICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlXG4gICAgdGhpcy5fbGFzdEV2ZW50ID0gbmV3IE1JRElFdmVudCgwLCBNSURJRXZlbnRUeXBlcy5FTkRfT0ZfVFJBQ0spXG5cbiAgICB0aGlzLl90cmFja3MgPSBbXVxuICAgIHRoaXMuX3RyYWNrc0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX3BhcnRzID0gW11cbiAgICB0aGlzLl9wYXJ0c0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fYWxsRXZlbnRzID0gW10gLy8gTUlESSBldmVudHMgYW5kIG1ldHJvbm9tZSBldmVudHNcblxuICAgIHRoaXMuX25vdGVzID0gW11cbiAgICB0aGlzLl9ub3Rlc0J5SWQgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuX25ld0V2ZW50cyA9IFtdXG4gICAgdGhpcy5fbW92ZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuX3RyYW5zcG9zZWRFdmVudHMgPSBbXVxuXG4gICAgdGhpcy5fbmV3UGFydHMgPSBbXVxuICAgIHRoaXMuX2NoYW5nZWRQYXJ0cyA9IFtdXG4gICAgdGhpcy5fcmVtb3ZlZFBhcnRzID0gW11cblxuICAgIHRoaXMuX2N1cnJlbnRNaWxsaXMgPSAwXG4gICAgdGhpcy5fc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcih0aGlzKVxuICAgIHRoaXMuX3BsYXloZWFkID0gbmV3IFBsYXloZWFkKHRoaXMpXG5cbiAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZVxuICAgIHRoaXMucGF1c2VkID0gZmFsc2VcbiAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlXG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgdGhpcy5zdG9wcGVkID0gdHJ1ZVxuICAgIHRoaXMubG9vcGluZyA9IGZhbHNlXG5cbiAgICB0aGlzLl9vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMuX291dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLl9vdXRwdXQuY29ubmVjdChtYXN0ZXJHYWluKVxuXG4gICAgdGhpcy5fbWV0cm9ub21lID0gbmV3IE1ldHJvbm9tZSh0aGlzKVxuICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9IFtdXG4gICAgdGhpcy5fdXBkYXRlTWV0cm9ub21lRXZlbnRzID0gdHJ1ZVxuICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKCF0aGlzLnVzZU1ldHJvbm9tZSlcblxuICAgIHRoaXMuX2xvb3AgPSBmYWxzZVxuICAgIHRoaXMuX2xlZnRMb2NhdG9yID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gICAgdGhpcy5fcmlnaHRMb2NhdG9yID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gICAgdGhpcy5faWxsZWdhbExvb3AgPSBmYWxzZVxuICAgIHRoaXMuX2xvb3BEdXJhdGlvbiA9IDBcbiAgICB0aGlzLl9wcmVjb3VudEJhcnMgPSAwXG4gICAgdGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPSAwXG5cbiAgICBsZXQge3RyYWNrcywgdGltZUV2ZW50c30gPSBzZXR0aW5nc1xuICAgIC8vY29uc29sZS5sb2codHJhY2tzLCB0aW1lRXZlbnRzKVxuICAgIGlmKHR5cGVvZiB0aW1lRXZlbnRzID09PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLl90aW1lRXZlbnRzID0gW1xuICAgICAgICBuZXcgTUlESUV2ZW50KDAsIE1JRElFdmVudFR5cGVzLlRFTVBPLCB0aGlzLmJwbSksXG4gICAgICAgIG5ldyBNSURJRXZlbnQoMCwgTUlESUV2ZW50VHlwZXMuVElNRV9TSUdOQVRVUkUsIHRoaXMubm9taW5hdG9yLCB0aGlzLmRlbm9taW5hdG9yKSxcbiAgICAgIF1cbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuYWRkVGltZUV2ZW50cyguLi50aW1lRXZlbnRzKVxuICAgIH1cblxuICAgIGlmKHR5cGVvZiB0cmFja3MgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuYWRkVHJhY2tzKC4uLnRyYWNrcylcbiAgICB9XG5cblxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIGFkZFRpbWVFdmVudHMoLi4uZXZlbnRzKXtcbiAgICAvL0BUT0RPOiBmaWx0ZXIgdGltZSBldmVudHMgb24gdGhlIHNhbWUgdGljayAtPiB1c2UgdGhlIGxhc3RseSBhZGRlZCBldmVudHNcbiAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBpZihldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSl7XG4gICAgICAgIHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyA9IHRydWVcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RpbWVFdmVudHMucHVzaChldmVudClcbiAgICB9KVxuICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlXG4gIH1cblxuICBhZGRUcmFja3MoLi4udHJhY2tzKXtcbiAgICB0cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHtcbiAgICAgIHRyYWNrLl9zb25nID0gdGhpc1xuICAgICAgdHJhY2suY29ubmVjdCh0aGlzLl9vdXRwdXQpXG4gICAgICB0aGlzLl90cmFja3MucHVzaCh0cmFjaylcbiAgICAgIHRoaXMuX3RyYWNrc0J5SWQuc2V0KHRyYWNrLmlkLCB0cmFjaylcbiAgICAgIHRoaXMuX25ld0V2ZW50cy5wdXNoKC4uLnRyYWNrLl9ldmVudHMpXG4gICAgICB0aGlzLl9uZXdQYXJ0cy5wdXNoKC4uLnRyYWNrLl9wYXJ0cylcbiAgICB9KVxuICB9XG5cbiAgdXBkYXRlKCl7XG4gICAgdXBkYXRlLmNhbGwodGhpcylcbiAgfVxuXG4gIHBsYXkodHlwZSwgLi4uYXJncyk6IHZvaWR7XG4gICAgLy91bmxvY2tXZWJBdWRpbygpXG4gICAgdGhpcy5fcGxheSh0eXBlLCAuLi5hcmdzKVxuICAgIGlmKHRoaXMuX3ByZWNvdW50QmFycyA+IDApe1xuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3ByZWNvdW50aW5nJywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgfWVsc2UgaWYodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcgPT09IHRydWUpe1xuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3N0YXJ0X3JlY29yZGluZycsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgIH1lbHNle1xuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BsYXknLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzfSlcbiAgICB9XG4gIH1cblxuICBfcGxheSh0eXBlLCAuLi5hcmdzKXtcbiAgICBpZih0eXBlb2YgdHlwZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy5zZXRQb3NpdGlvbih0eXBlLCAuLi5hcmdzKVxuICAgIH1cbiAgICBpZih0aGlzLnBsYXlpbmcpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzKVxuXG4gICAgdGhpcy5fcmVmZXJlbmNlID0gdGhpcy5fdGltZVN0YW1wID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDBcbiAgICB0aGlzLl9zY2hlZHVsZXIuc2V0VGltZVN0YW1wKHRoaXMuX3JlZmVyZW5jZSlcbiAgICB0aGlzLl9zdGFydE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXNcblxuICAgIGlmKHRoaXMuX3ByZWNvdW50QmFycyA+IDAgJiYgdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcpe1xuXG4gICAgICAvLyBjcmVhdGUgcHJlY291bnQgZXZlbnRzLCB0aGUgcGxheWhlYWQgd2lsbCBiZSBtb3ZlZCB0byB0aGUgZmlyc3QgYmVhdCBvZiB0aGUgY3VycmVudCBiYXJcbiAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb24oKVxuICAgICAgdGhpcy5fbWV0cm9ub21lLmNyZWF0ZVByZWNvdW50RXZlbnRzKHBvc2l0aW9uLmJhciwgcG9zaXRpb24uYmFyICsgdGhpcy5fcHJlY291bnRCYXJzLCB0aGlzLl9yZWZlcmVuY2UpXG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24oJ2JhcnNiZWF0cycsIFtwb3NpdGlvbi5iYXJdLCAnbWlsbGlzJykubWlsbGlzXG4gICAgICB0aGlzLl9wcmVjb3VudER1cmF0aW9uID0gdGhpcy5fbWV0cm9ub21lLnByZWNvdW50RHVyYXRpb25cbiAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gdGhpcy5fY3VycmVudE1pbGxpcyArIHRoaXMuX3ByZWNvdW50RHVyYXRpb25cblxuICAgICAgLy8gY29uc29sZS5ncm91cCgncHJlY291bnQnKVxuICAgICAgLy8gY29uc29sZS5sb2coJ3Bvc2l0aW9uJywgdGhpcy5nZXRQb3NpdGlvbigpKVxuICAgICAgLy8gY29uc29sZS5sb2coJ19jdXJyZW50TWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdlbmRQcmVjb3VudE1pbGxpcycsIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzKVxuICAgICAgLy8gY29uc29sZS5sb2coJ19wcmVjb3VudER1cmF0aW9uJywgdGhpcy5fcHJlY291bnREdXJhdGlvbilcbiAgICAgIC8vIGNvbnNvbGUuZ3JvdXBFbmQoJ3ByZWNvdW50JylcbiAgICAgIC8vY29uc29sZS5sb2coJ3ByZWNvdW50RHVyYXRpb24nLCB0aGlzLl9tZXRyb25vbWUuY3JlYXRlUHJlY291bnRFdmVudHModGhpcy5fcHJlY291bnRCYXJzLCB0aGlzLl9yZWZlcmVuY2UpKVxuICAgICAgdGhpcy5wcmVjb3VudGluZyA9IHRydWVcbiAgICB9ZWxzZSB7XG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMucGxheWluZyA9IHRydWVcbiAgICAgIHRoaXMucmVjb3JkaW5nID0gdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmdcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9lbmRQcmVjb3VudE1pbGxpcylcblxuICAgIGlmKHRoaXMucGF1c2VkKXtcbiAgICAgIHRoaXMucGF1c2VkID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgdGhpcy5fc2NoZWR1bGVyLmluaXQodGhpcy5fY3VycmVudE1pbGxpcylcbiAgICB0aGlzLl9sb29wID0gdGhpcy5sb29waW5nICYmIHRoaXMuX2N1cnJlbnRNaWxsaXMgPD0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgIHRoaXMuX3B1bHNlKClcbiAgfVxuXG4gIF9wdWxzZSgpOiB2b2lke1xuICAgIGlmKHRoaXMucGxheWluZyA9PT0gZmFsc2UgJiYgdGhpcy5wcmVjb3VudGluZyA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYodGhpcy5fcGVyZm9ybVVwZGF0ZSA9PT0gdHJ1ZSl7XG4gICAgICB0aGlzLl9wZXJmb3JtVXBkYXRlID0gZmFsc2VcbiAgICAgIC8vY29uc29sZS5sb2coJ3B1bHNlIHVwZGF0ZScsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgICBfdXBkYXRlLmNhbGwodGhpcylcbiAgICB9XG5cbiAgICBsZXQgbm93ID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDBcbiAgICAvL2NvbnNvbGUubG9nKG5vdywgcGVyZm9ybWFuY2Uubm93KCkpXG4gICAgbGV0IGRpZmYgPSBub3cgLSB0aGlzLl9yZWZlcmVuY2VcbiAgICB0aGlzLl9jdXJyZW50TWlsbGlzICs9IGRpZmZcbiAgICB0aGlzLl9yZWZlcmVuY2UgPSBub3dcblxuICAgIGlmKHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID4gMCl7XG4gICAgICBpZih0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA+IHRoaXMuX2N1cnJlbnRNaWxsaXMpe1xuICAgICAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKGRpZmYpXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9wdWxzZS5iaW5kKHRoaXMpKVxuICAgICAgICAvL3JldHVybiBiZWNhdXNlIGR1cmluZyBwcmVjb3VudGluZyBvbmx5IHByZWNvdW50IG1ldHJvbm9tZSBldmVudHMgZ2V0IHNjaGVkdWxlZFxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMucHJlY291bnRpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPSAwXG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzIC09IHRoaXMuX3ByZWNvdW50RHVyYXRpb25cbiAgICAgIGlmKHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nKXtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZVxuICAgICAgICB0aGlzLnJlY29yZGluZyA9IHRydWVcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlXG4gICAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fc3RhcnRNaWxsaXN9KVxuICAgICAgICAvL2Rpc3BhdGNoRXZlbnQoe3R5cGU6ICdwbGF5JywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYodGhpcy5fbG9vcCAmJiB0aGlzLl9jdXJyZW50TWlsbGlzID49IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMpe1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyAtPSB0aGlzLl9sb29wRHVyYXRpb25cbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIC8vdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9sZWZ0TG9jYXRvci5taWxsaXMpIC8vIHBsYXloZWFkIGlzIGEgYml0IGFoZWFkIG9ubHkgZHVyaW5nIHRoaXMgZnJhbWVcbiAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICB0eXBlOiAnbG9vcCcsXG4gICAgICAgIGRhdGE6IG51bGxcbiAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9wbGF5aGVhZC51cGRhdGUoJ21pbGxpcycsIGRpZmYpXG4gICAgfVxuXG4gICAgdGhpcy5fdGlja3MgPSB0aGlzLl9wbGF5aGVhZC5nZXQoKS50aWNrc1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzLCB0aGlzLl9kdXJhdGlvbk1pbGxpcylcblxuICAgIGlmKHRoaXMuX2N1cnJlbnRNaWxsaXMgPj0gdGhpcy5fZHVyYXRpb25NaWxsaXMpe1xuICAgICAgaWYodGhpcy5yZWNvcmRpbmcgIT09IHRydWUgfHwgdGhpcy5hdXRvU2l6ZSAhPT0gdHJ1ZSl7XG4gICAgICAgIHRoaXMuc3RvcCgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgLy8gYWRkIGFuIGV4dHJhIGJhciB0byB0aGUgc2l6ZSBvZiB0aGlzIHNvbmdcbiAgICAgIGxldCBldmVudHMgPSB0aGlzLl9tZXRyb25vbWUuYWRkRXZlbnRzKHRoaXMuYmFycywgdGhpcy5iYXJzICsgMSlcbiAgICAgIGxldCB0b2JlUGFyc2VkID0gWy4uLmV2ZW50cywgLi4udGhpcy5fdGltZUV2ZW50c11cbiAgICAgIHNvcnRFdmVudHModG9iZVBhcnNlZClcbiAgICAgIHBhcnNlRXZlbnRzKHRvYmVQYXJzZWQpXG4gICAgICB0aGlzLl9zY2hlZHVsZXIuZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdGhpcy5fc2NoZWR1bGVyLm51bUV2ZW50cyArPSBldmVudHMubGVuZ3RoXG4gICAgICBsZXQgbGFzdEV2ZW50ID0gZXZlbnRzW2V2ZW50cy5sZW5ndGggLSAxXVxuICAgICAgbGV0IGV4dHJhTWlsbGlzID0gbGFzdEV2ZW50LnRpY2tzUGVyQmFyICogbGFzdEV2ZW50Lm1pbGxpc1BlclRpY2tcbiAgICAgIHRoaXMuX2xhc3RFdmVudC50aWNrcyArPSBsYXN0RXZlbnQudGlja3NQZXJCYXJcbiAgICAgIHRoaXMuX2xhc3RFdmVudC5taWxsaXMgKz0gZXh0cmFNaWxsaXNcbiAgICAgIHRoaXMuX2R1cmF0aW9uTWlsbGlzICs9IGV4dHJhTWlsbGlzXG4gICAgICB0aGlzLmJhcnMrK1xuICAgICAgdGhpcy5fcmVzaXplZCA9IHRydWVcbiAgICAgIC8vY29uc29sZS5sb2coJ2xlbmd0aCcsIHRoaXMuX2xhc3RFdmVudC50aWNrcywgdGhpcy5fbGFzdEV2ZW50Lm1pbGxpcywgdGhpcy5iYXJzLCBsYXN0RXZlbnQpXG4gICAgfVxuXG4gICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZShkaWZmKVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX3B1bHNlLmJpbmQodGhpcykpXG4gIH1cblxuICBwYXVzZSgpOiB2b2lke1xuICAgIHRoaXMucGF1c2VkID0gIXRoaXMucGF1c2VkXG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgaWYodGhpcy5wYXVzZWQpe1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BhdXNlJywgZGF0YTogdGhpcy5wYXVzZWR9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5wbGF5KClcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwYXVzZScsIGRhdGE6IHRoaXMucGF1c2VkfSlcbiAgICB9XG4gIH1cblxuICBzdG9wKCk6IHZvaWR7XG4gICAgLy9jb25zb2xlLmxvZygnU1RPUCcpXG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgaWYodGhpcy5wbGF5aW5nIHx8IHRoaXMucGF1c2VkKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgfVxuICAgIGlmKHRoaXMuX2N1cnJlbnRNaWxsaXMgIT09IDApe1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIGlmKHRoaXMucmVjb3JkaW5nKXtcbiAgICAgICAgdGhpcy5zdG9wUmVjb3JkaW5nKClcbiAgICAgIH1cbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdG9wJ30pXG4gICAgfVxuICB9XG5cbiAgc3RhcnRSZWNvcmRpbmcoKXtcbiAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fcmVjb3JkSWQgPSBgcmVjb3JkaW5nXyR7cmVjb3JkaW5nSW5kZXgrK30ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5fc3RhcnRSZWNvcmRpbmcodGhpcy5fcmVjb3JkSWQpXG4gICAgfSlcbiAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IHRydWVcbiAgfVxuXG4gIHN0b3BSZWNvcmRpbmcoKXtcbiAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIHRyYWNrLl9zdG9wUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID0gZmFsc2VcbiAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlXG4gICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3N0b3BfcmVjb3JkaW5nJ30pXG4gIH1cblxuICB1bmRvUmVjb3JkaW5nKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2sudW5kb1JlY29yZGluZyh0aGlzLl9yZWNvcmRJZClcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHJlZG9SZWNvcmRpbmcoKXtcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5yZWRvUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICB9XG5cbiAgc2V0TWV0cm9ub21lKGZsYWcpe1xuICAgIGlmKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9ICF0aGlzLnVzZU1ldHJvbm9tZVxuICAgIH1lbHNle1xuICAgICAgdGhpcy51c2VNZXRyb25vbWUgPSBmbGFnXG4gICAgfVxuICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKCF0aGlzLnVzZU1ldHJvbm9tZSlcbiAgfVxuXG4gIGNvbmZpZ3VyZU1ldHJvbm9tZShjb25maWcpe1xuICAgIHRoaXMuX21ldHJvbm9tZS5jb25maWd1cmUoY29uZmlnKVxuICB9XG5cbiAgY29uZmlndXJlKGNvbmZpZyl7XG5cbiAgICBpZih0eXBlb2YgY29uZmlnLnBpdGNoICE9PSAndW5kZWZpbmVkJyl7XG5cbiAgICAgIGlmKGNvbmZpZy5waXRjaCA9PT0gdGhpcy5waXRjaCl7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5waXRjaCA9IGNvbmZpZy5waXRjaFxuICAgICAgdGhpcy5fZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgICBldmVudC51cGRhdGVQaXRjaCh0aGlzLnBpdGNoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZih0eXBlb2YgY29uZmlnLnBwcSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgaWYoY29uZmlnLnBwcSA9PT0gdGhpcy5wcHEpe1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGxldCBwcHFGYWN0b3IgPSBjb25maWcucHBxIC8gdGhpcy5wcHFcbiAgICAgIHRoaXMucHBxID0gY29uZmlnLnBwcVxuICAgICAgdGhpcy5fYWxsRXZlbnRzLmZvckVhY2goZSA9PiB7XG4gICAgICAgIGUudGlja3MgPSBldmVudC50aWNrcyAqIHBwcUZhY3RvclxuICAgICAgfSlcbiAgICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlXG4gICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGNvbmZpZy5wbGF5YmFja1NwZWVkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICBpZihjb25maWcucGxheWJhY2tTcGVlZCA9PT0gdGhpcy5wbGF5YmFja1NwZWVkKXtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLnBsYXliYWNrU3BlZWQgPSBjb25maWcucGxheWJhY2tTcGVlZFxuICAgIH1cbiAgfVxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICB0cmFjay5hbGxOb3Rlc09mZigpXG4gICAgfSlcblxuICAgIHRoaXMuX3NjaGVkdWxlci5hbGxOb3Rlc09mZigpXG4gICAgdGhpcy5fbWV0cm9ub21lLmFsbE5vdGVzT2ZmKClcbiAgfVxuLypcbiAgcGFuaWMoKXtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLl90cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHtcbiAgICAgICAgdHJhY2suZGlzY29ubmVjdCh0aGlzLl9vdXRwdXQpXG4gICAgICB9KVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKCh0cmFjaykgPT4ge1xuICAgICAgICAgIHRyYWNrLmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgICAgICB9KVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0sIDEwMClcbiAgICB9KVxuICB9XG4qL1xuICBnZXRUcmFja3MoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX3RyYWNrc11cbiAgfVxuXG4gIGdldFBhcnRzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9wYXJ0c11cbiAgfVxuXG4gIGdldEV2ZW50cygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fZXZlbnRzXVxuICB9XG5cbiAgZ2V0Tm90ZXMoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX25vdGVzXVxuICB9XG5cbiAgY2FsY3VsYXRlUG9zaXRpb24oYXJncyl7XG4gICAgcmV0dXJuIGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIGFyZ3MpXG4gIH1cblxuICAvLyBAYXJncyAtPiBzZWUgX2NhbGN1bGF0ZVBvc2l0aW9uXG4gIHNldFBvc2l0aW9uKHR5cGUsIC4uLmFyZ3Mpe1xuXG4gICAgbGV0IHdhc1BsYXlpbmcgPSB0aGlzLnBsYXlpbmdcbiAgICBpZih0aGlzLnBsYXlpbmcpe1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKVxuICAgIH1cblxuICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKVxuICAgIC8vbGV0IG1pbGxpcyA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdtaWxsaXMnKVxuICAgIGlmKHBvc2l0aW9uID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9jdXJyZW50TWlsbGlzID0gcG9zaXRpb24ubWlsbGlzXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLl9jdXJyZW50TWlsbGlzKVxuXG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgZGF0YTogcG9zaXRpb25cbiAgICB9KVxuXG4gICAgaWYod2FzUGxheWluZyl7XG4gICAgICB0aGlzLl9wbGF5KClcbiAgICB9ZWxzZXtcbiAgICAgIC8vQHRvZG86IGdldCB0aGlzIGluZm9ybWF0aW9uIGZyb20gbGV0ICdwb3NpdGlvbicgLT4gd2UgaGF2ZSBqdXN0IGNhbGN1bGF0ZWQgdGhlIHBvc2l0aW9uXG4gICAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coJ3NldFBvc2l0aW9uJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgfVxuXG4gIGdldFBvc2l0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXloZWFkLmdldCgpLnBvc2l0aW9uXG4gIH1cblxuICBnZXRQbGF5aGVhZCgpe1xuICAgIHJldHVybiB0aGlzLl9wbGF5aGVhZC5nZXQoKVxuICB9XG5cbiAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuICBzZXRMZWZ0TG9jYXRvcih0eXBlLCAuLi5hcmdzKXtcbiAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9uKHR5cGUsIGFyZ3MsICdhbGwnKVxuXG4gICAgaWYodGhpcy5fbGVmdExvY2F0b3IgPT09IGZhbHNlKXtcbiAgICAgIGNvbnNvbGUud2FybignaW52YWxpZCBwb3NpdGlvbiBmb3IgbG9jYXRvcicpXG4gICAgICB0aGlzLl9sZWZ0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuICBzZXRSaWdodExvY2F0b3IodHlwZSwgLi4uYXJncyl7XG4gICAgdGhpcy5fcmlnaHRMb2NhdG9yID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpXG5cbiAgICBpZih0aGlzLl9yaWdodExvY2F0b3IgPT09IGZhbHNlKXtcbiAgICAgIHRoaXMuX3JpZ2h0TG9jYXRvciA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIHBvc2l0aW9uIGZvciBsb2NhdG9yJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIHNldExvb3AoZmxhZyA9IG51bGwpe1xuXG4gICAgdGhpcy5sb29waW5nID0gZmxhZyAhPT0gbnVsbCA/IGZsYWcgOiAhdGhpcy5fbG9vcFxuXG4gICAgaWYodGhpcy5fcmlnaHRMb2NhdG9yID09PSBmYWxzZSB8fCB0aGlzLl9sZWZ0TG9jYXRvciA9PT0gZmFsc2Upe1xuICAgICAgdGhpcy5faWxsZWdhbExvb3AgPSB0cnVlXG4gICAgICB0aGlzLl9sb29wID0gZmFsc2VcbiAgICAgIHRoaXMubG9vcGluZyA9IGZhbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBsb2NhdG9ycyBjYW4gbm90ICh5ZXQpIGJlIHVzZWQgdG8ganVtcCBvdmVyIGEgc2VnbWVudFxuICAgIGlmKHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMgPD0gdGhpcy5fbGVmdExvY2F0b3IubWlsbGlzKXtcbiAgICAgIHRoaXMuX2lsbGVnYWxMb29wID0gdHJ1ZVxuICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgICB0aGlzLmxvb3BpbmcgPSBmYWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5fbG9vcER1cmF0aW9uID0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAtIHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpc1xuICAgIC8vY29uc29sZS5sb2codGhpcy5fbG9vcCwgdGhpcy5fbG9vcER1cmF0aW9uKVxuICAgIHRoaXMuX3NjaGVkdWxlci5iZXlvbmRMb29wID0gdGhpcy5fY3VycmVudE1pbGxpcyA+IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXNcbiAgICB0aGlzLl9sb29wID0gdGhpcy5sb29waW5nICYmIHRoaXMuX2N1cnJlbnRNaWxsaXMgPD0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpc1xuICAgIC8vY29uc29sZS5sb2codGhpcy5fbG9vcCwgdGhpcy5sb29waW5nKVxuICAgIHJldHVybiB0aGlzLmxvb3BpbmdcbiAgfVxuXG4gIHNldFByZWNvdW50KHZhbHVlID0gMCl7XG4gICAgdGhpcy5fcHJlY291bnRCYXJzID0gdmFsdWVcbiAgfVxuXG4gIC8qXG4gICAgaGVscGVyIG1ldGhvZDogY29udmVydHMgdXNlciBmcmllbmRseSBwb3NpdGlvbiBmb3JtYXQgdG8gaW50ZXJuYWwgZm9ybWF0XG5cbiAgICBwb3NpdGlvbjpcbiAgICAgIC0gJ3RpY2tzJywgOTYwMDBcbiAgICAgIC0gJ21pbGxpcycsIDEyMzRcbiAgICAgIC0gJ3BlcmNlbnRhZ2UnLCA1NVxuICAgICAgLSAnYmFyc2JlYXRzJywgMSwgNCwgMCwgMjUgLT4gYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tcbiAgICAgIC0gJ3RpbWUnLCAwLCAzLCA0OSwgNTY2IC0+IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcblxuICAqL1xuICBfY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgcmVzdWx0VHlwZSl7XG4gICAgbGV0IHRhcmdldFxuXG4gICAgc3dpdGNoKHR5cGUpe1xuICAgICAgY2FzZSAndGlja3MnOlxuICAgICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgICAvL3RhcmdldCA9IGFyZ3NbMF0gfHwgMFxuICAgICAgICB0YXJnZXQgPSBhcmdzIHx8IDBcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAndGltZSc6XG4gICAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgICAgdGFyZ2V0ID0gYXJnc1xuICAgICAgICBicmVha1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zb2xlLmxvZygndW5zdXBwb3J0ZWQgdHlwZScpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGxldCBwb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIHtcbiAgICAgIHR5cGUsXG4gICAgICB0YXJnZXQsXG4gICAgICByZXN1bHQ6IHJlc3VsdFR5cGUsXG4gICAgfSlcblxuICAgIHJldHVybiBwb3NpdGlvblxuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayl7XG4gICAgcmV0dXJuIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spXG4gIH1cblxuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKVxuICB9XG5cbiAgc2F2ZUFzTUlESUZpbGUobmFtZSl7XG4gICAgc2F2ZUFzTUlESUZpbGUodGhpcywgbmFtZSlcbiAgfVxuXG4gIHNldFZvbHVtZSh2YWx1ZSl7XG4gICAgaWYodmFsdWUgPCAwIHx8IHZhbHVlID4gMSl7XG4gICAgICBjb25zb2xlLmxvZygnU29uZy5zZXRWb2x1bWUoKSBhY2NlcHRzIGEgdmFsdWUgYmV0d2VlbiAwIGFuZCAxLCB5b3UgZW50ZXJlZDonLCB2YWx1ZSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnZvbHVtZSA9IHZhbHVlXG4gIH1cblxuICBnZXRWb2x1bWUoKXtcbiAgICByZXR1cm4gdGhpcy52b2x1bWVcbiAgfVxuXG4gIHNldFBhbm5pbmcodmFsdWUpe1xuICAgIGlmKHZhbHVlIDwgLTEgfHwgdmFsdWUgPiAxKXtcbiAgICAgIGNvbnNvbGUubG9nKCdTb25nLnNldFBhbm5pbmcoKSBhY2NlcHRzIGEgdmFsdWUgYmV0d2VlbiAtMSAoZnVsbCBsZWZ0KSBhbmQgMSAoZnVsbCByaWdodCksIHlvdSBlbnRlcmVkOicsIHZhbHVlKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIHRyYWNrLnNldFBhbm5pbmcodmFsdWUpXG4gICAgfSlcbiAgICB0aGlzLl9wYW5uZXJWYWx1ZSA9IHZhbHVlXG4gIH1cbn1cbiIsIi8vIGNhbGxlZCBieSBzb25nXG5pbXBvcnQge3BhcnNlVGltZUV2ZW50cywgcGFyc2VFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge01JRElFdmVudFR5cGVzfSBmcm9tICcuL2NvbnN0YW50cydcbmltcG9ydCB7Y2FsY3VsYXRlUG9zaXRpb259IGZyb20gJy4vcG9zaXRpb24nXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZSgpOnZvaWR7XG4gIGlmKHRoaXMucGxheWluZyA9PT0gZmFsc2Upe1xuICAgIF91cGRhdGUuY2FsbCh0aGlzKVxuICB9ZWxzZXtcbiAgICB0aGlzLl9wZXJmb3JtVXBkYXRlID0gdHJ1ZVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfdXBkYXRlKCk6dm9pZHtcblxuICBpZih0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSBmYWxzZVxuICAgICYmIHRoaXMuX3JlbW92ZWRFdmVudHMubGVuZ3RoID09PSAwXG4gICAgJiYgdGhpcy5fbmV3RXZlbnRzLmxlbmd0aCA9PT0gMFxuICAgICYmIHRoaXMuX21vdmVkRXZlbnRzLmxlbmd0aCA9PT0gMFxuICAgICYmIHRoaXMuX25ld1BhcnRzLmxlbmd0aCA9PT0gMFxuICAgICYmIHRoaXMuX3JlbW92ZWRQYXJ0cy5sZW5ndGggPT09IDBcbiAgICAmJiB0aGlzLl9yZXNpemVkID09PSBmYWxzZVxuICApe1xuICAgIHJldHVyblxuICB9XG4gIC8vZGVidWdcbiAgLy90aGlzLmlzUGxheWluZyA9IHRydWVcblxuICAvL2NvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ3VwZGF0ZSBzb25nJylcbiAgY29uc29sZS50aW1lKCd1cGRhdGluZyBzb25nIHRvb2snKVxuXG5cbi8vIFRJTUUgRVZFTlRTXG5cbiAgLy8gY2hlY2sgaWYgdGltZSBldmVudHMgYXJlIHVwZGF0ZWRcbiAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gdHJ1ZSl7XG4gICAgLy9jb25zb2xlLmxvZygndXBkYXRlVGltZUV2ZW50cycsIHRoaXMuX3RpbWVFdmVudHMubGVuZ3RoKVxuICAgIHBhcnNlVGltZUV2ZW50cyh0aGlzLCB0aGlzLl90aW1lRXZlbnRzLCB0aGlzLmlzUGxheWluZylcbiAgICAvL2NvbnNvbGUubG9nKCd0aW1lIGV2ZW50cyAlTycsIHRoaXMuX3RpbWVFdmVudHMpXG4gIH1cblxuICAvLyBvbmx5IHBhcnNlIG5ldyBhbmQgbW92ZWQgZXZlbnRzXG4gIGxldCB0b2JlUGFyc2VkID0gW11cblxuICAvLyBidXQgcGFyc2UgYWxsIGV2ZW50cyBpZiB0aGUgdGltZSBldmVudHMgaGF2ZSBiZWVuIHVwZGF0ZWRcbiAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gdHJ1ZSl7XG4gICAgdG9iZVBhcnNlZCA9IFsuLi50aGlzLl9ldmVudHNdXG4gIH1cblxuXG4vLyBQQVJUU1xuXG4gIC8vIGZpbHRlciByZW1vdmVkIHBhcnRzXG4gIC8vY29uc29sZS5sb2coJ3JlbW92ZWQgcGFydHMgJU8nLCB0aGlzLl9yZW1vdmVkUGFydHMpXG4gIHRoaXMuX3JlbW92ZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgdGhpcy5fcGFydHNCeUlkLmRlbGV0ZShwYXJ0LmlkKVxuICB9KVxuXG5cbiAgLy8gYWRkIG5ldyBwYXJ0c1xuICAvL2NvbnNvbGUubG9nKCduZXcgcGFydHMgJU8nLCB0aGlzLl9uZXdQYXJ0cylcbiAgdGhpcy5fbmV3UGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgIHBhcnQuX3NvbmcgPSB0aGlzXG4gICAgdGhpcy5fcGFydHNCeUlkLnNldChwYXJ0LmlkLCBwYXJ0KVxuICAgIHBhcnQudXBkYXRlKClcbiAgfSlcblxuXG4gIC8vIHVwZGF0ZSBjaGFuZ2VkIHBhcnRzXG4gIC8vY29uc29sZS5sb2coJ2NoYW5nZWQgcGFydHMgJU8nLCB0aGlzLl9jaGFuZ2VkUGFydHMpXG4gIHRoaXMuX2NoYW5nZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgcGFydC51cGRhdGUoKVxuICB9KVxuXG5cbiAgLy8gcmVtb3ZlZCBwYXJ0c1xuICAvL2NvbnNvbGUubG9nKCdyZW1vdmVkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKVxuICB0aGlzLl9yZW1vdmVkUGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZClcbiAgfSlcblxuICBpZih0aGlzLl9yZW1vdmVkUGFydHMubGVuZ3RoID4gMCl7XG4gICAgdGhpcy5fcGFydHMgPSBBcnJheS5mcm9tKHRoaXMuX3BhcnRzQnlJZC52YWx1ZXMoKSlcbiAgfVxuXG5cbi8vIEVWRU5UU1xuXG4gIC8vIGZpbHRlciByZW1vdmVkIGV2ZW50c1xuICAvL2NvbnNvbGUubG9nKCdyZW1vdmVkIGV2ZW50cyAlTycsIHRoaXMuX3JlbW92ZWRFdmVudHMpXG4gIHRoaXMuX3JlbW92ZWRFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICBsZXQgdHJhY2sgPSBldmVudC5taWRpTm90ZS5fdHJhY2tcbiAgICAvLyB1bnNjaGVkdWxlIGFsbCByZW1vdmVkIGV2ZW50cyB0aGF0IGFscmVhZHkgaGF2ZSBiZWVuIHNjaGVkdWxlZFxuICAgIGlmKGV2ZW50LnRpbWUgPj0gdGhpcy5fY3VycmVudE1pbGxpcyl7XG4gICAgICB0cmFjay51bnNjaGVkdWxlKGV2ZW50KVxuICAgIH1cbiAgICB0aGlzLl9ub3Rlc0J5SWQuZGVsZXRlKGV2ZW50Lm1pZGlOb3RlLmlkKVxuICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICB9KVxuXG5cbiAgLy8gYWRkIG5ldyBldmVudHNcbiAgLy9jb25zb2xlLmxvZygnbmV3IGV2ZW50cyAlTycsIHRoaXMuX25ld0V2ZW50cylcbiAgdGhpcy5fbmV3RXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgdGhpcy5fZXZlbnRzQnlJZC5zZXQoZXZlbnQuaWQsIGV2ZW50KVxuICAgIHRoaXMuX2V2ZW50cy5wdXNoKGV2ZW50KVxuICAgIHRvYmVQYXJzZWQucHVzaChldmVudClcbiAgfSlcblxuXG4gIC8vIG1vdmVkIGV2ZW50cyBuZWVkIHRvIGJlIHBhcnNlZFxuICAvL2NvbnNvbGUubG9nKCdtb3ZlZCAlTycsIHRoaXMuX21vdmVkRXZlbnRzKVxuICB0aGlzLl9tb3ZlZEV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgIC8vIGRvbid0IGFkZCBtb3ZlZCBldmVudHMgaWYgdGhlIHRpbWUgZXZlbnRzIGhhdmUgYmVlbiB1cGRhdGVkIC0+IHRoZXkgaGF2ZSBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gdGhlIHRvYmVQYXJzZWQgYXJyYXlcbiAgICBpZih0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSBmYWxzZSl7XG4gICAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpXG4gICAgfVxuICB9KVxuXG5cbiAgLy8gcGFyc2UgYWxsIG5ldyBhbmQgbW92ZWQgZXZlbnRzXG4gIGlmKHRvYmVQYXJzZWQubGVuZ3RoID4gMCl7XG4gICAgLy9jb25zb2xlLnRpbWUoJ3BhcnNlJylcbiAgICAvL2NvbnNvbGUubG9nKCd0b2JlUGFyc2VkICVPJywgdG9iZVBhcnNlZClcbiAgICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycsIHRvYmVQYXJzZWQubGVuZ3RoKVxuXG4gICAgdG9iZVBhcnNlZCA9IFsuLi50b2JlUGFyc2VkLCAuLi50aGlzLl90aW1lRXZlbnRzXVxuICAgIHBhcnNlRXZlbnRzKHRvYmVQYXJzZWQsIHRoaXMuaXNQbGF5aW5nKVxuXG4gICAgLy8gYWRkIE1JREkgbm90ZXMgdG8gc29uZ1xuICAgIHRvYmVQYXJzZWQuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmlkLCBldmVudC50eXBlLCBldmVudC5taWRpTm90ZSlcbiAgICAgIGlmKGV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT04pe1xuICAgICAgICBpZihldmVudC5taWRpTm90ZSl7XG4gICAgICAgICAgdGhpcy5fbm90ZXNCeUlkLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50LnR5cGUpXG4gICAgICAgICAgLy90aGlzLl9ub3Rlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUudGltZUVuZCgncGFyc2UnKVxuICB9XG5cbiAgaWYodG9iZVBhcnNlZC5sZW5ndGggPiAwIHx8IHRoaXMuX3JlbW92ZWRFdmVudHMubGVuZ3RoID4gMCl7XG4gICAgLy9jb25zb2xlLnRpbWUoJ3RvIGFycmF5JylcbiAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgdGhpcy5fbm90ZXMgPSBBcnJheS5mcm9tKHRoaXMuX25vdGVzQnlJZC52YWx1ZXMoKSlcbiAgICAvL2NvbnNvbGUudGltZUVuZCgndG8gYXJyYXknKVxuICB9XG5cblxuICAvL2NvbnNvbGUudGltZShgc29ydGluZyAke3RoaXMuX2V2ZW50cy5sZW5ndGh9IGV2ZW50c2ApXG4gIHNvcnRFdmVudHModGhpcy5fZXZlbnRzKVxuICB0aGlzLl9ub3Rlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIHJldHVybiBhLm5vdGVPbi50aWNrcyAtIGIubm90ZU9uLnRpY2tzXG4gIH0pXG4gIC8vY29uc29sZS50aW1lRW5kKGBzb3J0aW5nICR7dGhpcy5fZXZlbnRzLmxlbmd0aH0gZXZlbnRzYClcblxuICAvL2NvbnNvbGUubG9nKCdub3RlcyAlTycsIHRoaXMuX25vdGVzKVxuICBjb25zb2xlLnRpbWVFbmQoJ3VwZGF0aW5nIHNvbmcgdG9vaycpXG5cblxuLy8gU09ORyBEVVJBVElPTlxuXG4gIC8vIGdldCB0aGUgbGFzdCBldmVudCBvZiB0aGlzIHNvbmdcbiAgbGV0IGxhc3RFdmVudCA9IHRoaXMuX2V2ZW50c1t0aGlzLl9ldmVudHMubGVuZ3RoIC0gMV1cbiAgbGV0IGxhc3RUaW1lRXZlbnQgPSB0aGlzLl90aW1lRXZlbnRzW3RoaXMuX3RpbWVFdmVudHMubGVuZ3RoIC0gMV1cbiAgLy9jb25zb2xlLmxvZyhsYXN0RXZlbnQsIGxhc3RUaW1lRXZlbnQpXG5cbiAgLy8gY2hlY2sgaWYgc29uZyBoYXMgYWxyZWFkeSBhbnkgZXZlbnRzXG4gIGlmKGxhc3RFdmVudCBpbnN0YW5jZW9mIE1JRElFdmVudCA9PT0gZmFsc2Upe1xuICAgIGxhc3RFdmVudCA9IGxhc3RUaW1lRXZlbnRcbiAgfWVsc2UgaWYobGFzdFRpbWVFdmVudC50aWNrcyA+IGxhc3RFdmVudC50aWNrcyl7XG4gICAgbGFzdEV2ZW50ID0gbGFzdFRpbWVFdmVudFxuICB9XG4gIC8vY29uc29sZS5sb2cobGFzdEV2ZW50LCB0aGlzLmJhcnMpXG5cbiAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBkYXRhIG9mIHRoZSBmaXJzdCBiZWF0IGluIHRoZSBiYXIgYWZ0ZXIgdGhlIGxhc3QgYmFyXG4gIHRoaXMuYmFycyA9IE1hdGgubWF4KGxhc3RFdmVudC5iYXIsIHRoaXMuYmFycylcbiAgbGV0IHRpY2tzID0gY2FsY3VsYXRlUG9zaXRpb24odGhpcywge1xuICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgIHRhcmdldDogW3RoaXMuYmFycyArIDFdLFxuICAgIHJlc3VsdDogJ3RpY2tzJ1xuICB9KS50aWNrc1xuXG4gIC8vIHdlIHdhbnQgdG8gcHV0IHRoZSBFTkRfT0ZfVFJBQ0sgZXZlbnQgYXQgdGhlIHZlcnkgbGFzdCB0aWNrIG9mIHRoZSBsYXN0IGJhciwgc28gd2UgY2FsY3VsYXRlIHRoYXQgcG9zaXRpb25cbiAgbGV0IG1pbGxpcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIHtcbiAgICB0eXBlOiAndGlja3MnLFxuICAgIHRhcmdldDogdGlja3MgLSAxLFxuICAgIHJlc3VsdDogJ21pbGxpcydcbiAgfSkubWlsbGlzXG5cbiAgdGhpcy5fbGFzdEV2ZW50LnRpY2tzID0gdGlja3MgLSAxXG4gIHRoaXMuX2xhc3RFdmVudC5taWxsaXMgPSBtaWxsaXNcblxuICAvL2NvbnNvbGUubG9nKCdsZW5ndGgnLCB0aGlzLl9sYXN0RXZlbnQudGlja3MsIHRoaXMuX2xhc3RFdmVudC5taWxsaXMsIHRoaXMuYmFycylcblxuICB0aGlzLl9kdXJhdGlvblRpY2tzID0gdGhpcy5fbGFzdEV2ZW50LnRpY2tzXG4gIHRoaXMuX2R1cmF0aW9uTWlsbGlzID0gdGhpcy5fbGFzdEV2ZW50Lm1pbGxpc1xuXG5cbi8vIE1FVFJPTk9NRVxuXG4gIC8vIGFkZCBtZXRyb25vbWUgZXZlbnRzXG4gIGlmKHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyB8fCB0aGlzLl9tZXRyb25vbWUuYmFycyAhPT0gdGhpcy5iYXJzIHx8IHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPT09IHRydWUpe1xuICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9IHBhcnNlRXZlbnRzKFsuLi50aGlzLl90aW1lRXZlbnRzLCAuLi50aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKCldKVxuICB9XG4gIHRoaXMuX2FsbEV2ZW50cyA9IFsuLi50aGlzLl9tZXRyb25vbWVFdmVudHMsIC4uLnRoaXMuX2V2ZW50c11cbiAgc29ydEV2ZW50cyh0aGlzLl9hbGxFdmVudHMpXG4gIC8vY29uc29sZS5sb2coJ2FsbCBldmVudHMgJU8nLCB0aGlzLl9hbGxFdmVudHMpXG5cbi8qXG4gIHRoaXMuX21ldHJvbm9tZS5nZXRFdmVudHMoKVxuICB0aGlzLl9hbGxFdmVudHMgPSBbLi4udGhpcy5fZXZlbnRzXVxuICBzb3J0RXZlbnRzKHRoaXMuX2FsbEV2ZW50cylcbiovXG5cbiAgLy9jb25zb2xlLmxvZygnY3VycmVudCBtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICB0aGlzLl9wbGF5aGVhZC51cGRhdGVTb25nKClcbiAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZVNvbmcoKVxuXG4gIGlmKHRoaXMucGxheWluZyA9PT0gZmFsc2Upe1xuICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgIHR5cGU6ICdwb3NpdGlvbicsXG4gICAgICBkYXRhOiB0aGlzLl9wbGF5aGVhZC5nZXQoKS5wb3NpdGlvblxuICAgIH0pXG4gIH1cblxuICAvLyByZXNldFxuICB0aGlzLl9uZXdQYXJ0cyA9IFtdXG4gIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdXG4gIHRoaXMuX25ld0V2ZW50cyA9IFtdXG4gIHRoaXMuX21vdmVkRXZlbnRzID0gW11cbiAgdGhpcy5fcmVtb3ZlZEV2ZW50cyA9IFtdXG4gIHRoaXMuX3Jlc2l6ZWQgPSBmYWxzZVxuICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gZmFsc2VcblxuICAvL2NvbnNvbGUuZ3JvdXBFbmQoJ3VwZGF0ZSBzb25nJylcbn1cbiIsImltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuaW1wb3J0IHtwYXJzZU1JRElGaWxlfSBmcm9tICcuL21pZGlmaWxlJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtUcmFja30gZnJvbSAnLi90cmFjaydcbmltcG9ydCB7U29uZ30gZnJvbSAnLi9zb25nJ1xuaW1wb3J0IHtiYXNlNjRUb0JpbmFyeX0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtzdGF0dXMsIGpzb24sIGFycmF5QnVmZmVyfSBmcm9tICcuL2ZldGNoX2hlbHBlcnMnXG5pbXBvcnQge2dldFNldHRpbmdzfSBmcm9tICcuL3NldHRpbmdzJ1xuXG5cbmZ1bmN0aW9uIHRvU29uZyhwYXJzZWQsIHNldHRpbmdzKXtcblxuICBsZXQgdHJhY2tzID0gcGFyc2VkLnRyYWNrc1xuICBsZXQgcHBxID0gcGFyc2VkLmhlYWRlci50aWNrc1BlckJlYXQgLy8gdGhlIFBQUSBhcyBzZXQgaW4gdGhlIGxvYWRlZCBNSURJIGZpbGVcbiAgbGV0IHBwcUZhY3RvciA9IDFcblxuICAvLyBjaGVjayBpZiB3ZSBuZWVkIHRvIG92ZXJydWxlIHRoZSBQUFEgb2ZzIHRoZSBsb2FkZWQgTUlESSBmaWxlXG4gIGlmKHR5cGVvZiBzZXR0aW5ncy5vdmVycnVsZVBQUSA9PT0gJ3VuZGVmaW5lZCcgfHwgc2V0dGluZ3Mub3ZlcnJ1bGVQUFEgPT09IHRydWUpe1xuICAgIGxldCBuZXdQUFEgPSBnZXRTZXR0aW5ncygpLnBwcVxuICAgIHBwcUZhY3RvciA9IG5ld1BQUSAvIHBwcVxuICAgIHBwcSA9IG5ld1BQUVxuICB9XG5cbiAgbGV0IHRpbWVFdmVudHMgPSBbXVxuICBsZXQgYnBtID0gLTFcbiAgbGV0IG5vbWluYXRvciA9IC0xXG4gIGxldCBkZW5vbWluYXRvciA9IC0xXG4gIGxldCBuZXdUcmFja3MgPSBbXVxuXG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzLnZhbHVlcygpKXtcbiAgICBsZXQgbGFzdFRpY2tzLCBsYXN0VHlwZVxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgdHlwZVxuICAgIGxldCBjaGFubmVsID0gLTFcbiAgICBsZXQgdHJhY2tOYW1lXG4gICAgbGV0IHRyYWNrSW5zdHJ1bWVudE5hbWVcbiAgICBsZXQgZXZlbnRzID0gW107XG5cbiAgICBmb3IobGV0IGV2ZW50IG9mIHRyYWNrKXtcbiAgICAgIHRpY2tzICs9IChldmVudC5kZWx0YVRpbWUgKiBwcHFGYWN0b3IpO1xuXG4gICAgICBpZihjaGFubmVsID09PSAtMSAmJiB0eXBlb2YgZXZlbnQuY2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBjaGFubmVsID0gZXZlbnQuY2hhbm5lbDtcbiAgICAgIH1cbiAgICAgIHR5cGUgPSBldmVudC5zdWJ0eXBlO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5kZWx0YVRpbWUsIHRpY2tzLCB0eXBlKTtcblxuICAgICAgc3dpdGNoKGV2ZW50LnN1YnR5cGUpe1xuXG4gICAgICAgIGNhc2UgJ3RyYWNrTmFtZSc6XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdpbnN0cnVtZW50TmFtZSc6XG4gICAgICAgICAgaWYoZXZlbnQudGV4dCl7XG4gICAgICAgICAgICB0cmFja0luc3RydW1lbnROYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9uJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweDkwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9mZic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg4MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3NldFRlbXBvJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0ZW1wbyBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgbGV0IHRtcCA9IDYwMDAwMDAwIC8gZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdDtcblxuICAgICAgICAgIGlmKHRpY2tzID09PSBsYXN0VGlja3MgJiYgdHlwZSA9PT0gbGFzdFR5cGUpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oJ3RlbXBvIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIHRtcCk7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGJwbSA9PT0gLTEpe1xuICAgICAgICAgICAgYnBtID0gdG1wO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg1MSwgdG1wKSlcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0aW1lU2lnbmF0dXJlJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0aW1lIHNpZ25hdHVyZSBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgaWYobGFzdFRpY2tzID09PSB0aWNrcyAmJiBsYXN0VHlwZSA9PT0gdHlwZSl7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ3RpbWUgc2lnbmF0dXJlIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihub21pbmF0b3IgPT09IC0xKXtcbiAgICAgICAgICAgIG5vbWluYXRvciA9IGV2ZW50Lm51bWVyYXRvclxuICAgICAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvclxuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg1OCwgZXZlbnQubnVtZXJhdG9yLCBldmVudC5kZW5vbWluYXRvcikpXG4gICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlICdjb250cm9sbGVyJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEIwLCBldmVudC5jb250cm9sbGVyVHlwZSwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwcm9ncmFtQ2hhbmdlJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEMwLCBldmVudC5wcm9ncmFtTnVtYmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncGl0Y2hCZW5kJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEUwLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCBldmVudC50eXBlKTtcbiAgICAgIH1cblxuICAgICAgbGFzdFR5cGUgPSB0eXBlXG4gICAgICBsYXN0VGlja3MgPSB0aWNrc1xuICAgIH1cblxuICAgIGlmKGV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAgIC8vY29uc29sZS5jb3VudChldmVudHMubGVuZ3RoKVxuICAgICAgbmV3VHJhY2tzLnB1c2gobmV3IFRyYWNrKHtcbiAgICAgICAgbmFtZTogdHJhY2tOYW1lLFxuICAgICAgICBwYXJ0czogW1xuICAgICAgICAgIG5ldyBQYXJ0KHtcbiAgICAgICAgICAgIGV2ZW50czogZXZlbnRzXG4gICAgICAgICAgfSlcbiAgICAgICAgXVxuICAgICAgfSkpXG4gICAgfVxuICB9XG5cbiAgbGV0IHNvbmcgPSBuZXcgU29uZyh7XG4gICAgcHBxLFxuICAgIGJwbSxcbiAgICBub21pbmF0b3IsXG4gICAgZGVub21pbmF0b3IsXG4gICAgdHJhY2tzOiBuZXdUcmFja3MsXG4gICAgdGltZUV2ZW50czogdGltZUV2ZW50c1xuICB9KVxuICAvL3NvbmcudXBkYXRlKClcbiAgcmV0dXJuIHNvbmdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvbmdGcm9tTUlESUZpbGVTeW5jKGRhdGEsIHNldHRpbmdzID0ge30pe1xuICBsZXQgc29uZyA9IG51bGw7XG5cbiAgaWYoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKXtcbiAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgc29uZyA9IHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlciksIHNldHRpbmdzKTtcbiAgfWVsc2UgaWYodHlwZW9mIGRhdGEuaGVhZGVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZGF0YS50cmFja3MgIT09ICd1bmRlZmluZWQnKXtcbiAgICAvLyBhIE1JREkgZmlsZSB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gcGFyc2VkXG4gICAgc29uZyA9IHRvU29uZyhkYXRhLCBzZXR0aW5ncyk7XG4gIH1lbHNle1xuICAgIC8vIGEgYmFzZTY0IGVuY29kZWQgTUlESSBmaWxlXG4gICAgZGF0YSA9IGJhc2U2NFRvQmluYXJ5KGRhdGEpO1xuICAgIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gICAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgICBzb25nID0gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSwgc2V0dGluZ3MpO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcignd3JvbmcgZGF0YScpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzb25nXG4gIC8vIHtcbiAgLy8gICBwcHEgPSBuZXdQUFEsXG4gIC8vICAgYnBtID0gbmV3QlBNLFxuICAvLyAgIHBsYXliYWNrU3BlZWQgPSBuZXdQbGF5YmFja1NwZWVkLFxuICAvLyB9ID0gc2V0dGluZ3Ncbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZSh1cmwsIHNldHRpbmdzID0ge30pe1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIGZldGNoKHVybCwge1xuICAgIC8vICAgbW9kZTogJ25vLWNvcnMnXG4gICAgLy8gfSlcbiAgICBmZXRjaCh1cmwpXG4gICAgLnRoZW4oc3RhdHVzKVxuICAgIC50aGVuKGFycmF5QnVmZmVyKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgcmVzb2x2ZShzb25nRnJvbU1JRElGaWxlU3luYyhkYXRhLCBzZXR0aW5ncykpXG4gICAgfSlcbiAgICAuY2F0Y2goZSA9PiB7XG4gICAgICByZWplY3QoZSlcbiAgICB9KVxuICB9KVxufVxuIiwiaW1wb3J0IHtQYXJ0fSBmcm9tICcuL3BhcnQnXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtNSURJTm90ZX0gZnJvbSAnLi9taWRpX25vdGUnXG5pbXBvcnQge2dldE1JRElJbnB1dEJ5SWQsIGdldE1JRElPdXRwdXRCeUlkfSBmcm9tICcuL2luaXRfbWlkaSdcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge01JRElFdmVudFR5cGVzfSBmcm9tICcuL3FhbWJpJ1xuaW1wb3J0IHtkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXInXG5cbmNvbnN0IHplcm9WYWx1ZSA9IDAuMDAwMDAwMDAwMDAwMDAwMDFcbmxldCBpbnN0YW5jZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgVHJhY2t7XG5cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3MgPSB7fSl7XG4gICAgdGhpcy5pZCA9IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX1fJHtpbnN0YW5jZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YDtcblxuICAgICh7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUgPSB0aGlzLmlkLFxuICAgICAgY2hhbm5lbDogdGhpcy5jaGFubmVsID0gMCxcbiAgICAgIG11dGVkOiB0aGlzLm11dGVkID0gZmFsc2UsXG4gICAgICB2b2x1bWU6IHRoaXMudm9sdW1lID0gMC41LFxuICAgIH0gPSBzZXR0aW5ncyk7XG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMubmFtZSwgdGhpcy5jaGFubmVsLCB0aGlzLm11dGVkLCB0aGlzLnZvbHVtZSlcblxuICAgIHRoaXMuX3Bhbm5lciA9IGNvbnRleHQuY3JlYXRlUGFubmVyKClcbiAgICB0aGlzLl9wYW5uZXIucGFubmluZ01vZGVsID0gJ2VxdWFscG93ZXInXG4gICAgdGhpcy5fcGFubmVyLnNldFBvc2l0aW9uKHplcm9WYWx1ZSwgemVyb1ZhbHVlLCB6ZXJvVmFsdWUpXG4gICAgdGhpcy5fb3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLl9vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5fcGFubmVyLmNvbm5lY3QodGhpcy5fb3V0cHV0KVxuICAgIC8vdGhpcy5fb3V0cHV0LmNvbm5lY3QodGhpcy5fcGFubmVyKVxuICAgIHRoaXMuX21pZGlJbnB1dHMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9taWRpT3V0cHV0cyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG4gICAgdGhpcy5fcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB0aGlzLl9pbnN0cnVtZW50ID0gbnVsbFxuICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdXG4gICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICAgIHRoaXMubW9uaXRvciA9IGZhbHNlXG4gICAgdGhpcy5fc29uZ0lucHV0ID0gbnVsbFxuICAgIHRoaXMuX2VmZmVjdHMgPSBbXVxuXG4gICAgbGV0IHtwYXJ0cywgaW5zdHJ1bWVudH0gPSBzZXR0aW5nc1xuICAgIGlmKHR5cGVvZiBwYXJ0cyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgdGhpcy5hZGRQYXJ0cyguLi5wYXJ0cylcbiAgICB9XG4gICAgaWYodHlwZW9mIGluc3RydW1lbnQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KVxuICAgIH1cbiAgfVxuXG4gIHNldEluc3RydW1lbnQoaW5zdHJ1bWVudCA9IG51bGwpe1xuICAgIGlmKGluc3RydW1lbnQgIT09IG51bGxcbiAgICAgIC8vIGNoZWNrIGlmIHRoZSBtYW5kYXRvcnkgZnVuY3Rpb25zIG9mIGFuIGluc3RydW1lbnQgYXJlIHByZXNlbnQgKEludGVyZmFjZSBJbnN0cnVtZW50KVxuICAgICAgJiYgdHlwZW9mIGluc3RydW1lbnQuY29ubmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgJiYgdHlwZW9mIGluc3RydW1lbnQuZGlzY29ubmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgJiYgdHlwZW9mIGluc3RydW1lbnQucHJvY2Vzc01JRElFdmVudCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgJiYgdHlwZW9mIGluc3RydW1lbnQuYWxsTm90ZXNPZmYgPT09ICdmdW5jdGlvbidcbiAgICAgICYmIHR5cGVvZiBpbnN0cnVtZW50LnVuc2NoZWR1bGUgPT09ICdmdW5jdGlvbidcbiAgICApe1xuICAgICAgdGhpcy5yZW1vdmVJbnN0cnVtZW50KClcbiAgICAgIHRoaXMuX2luc3RydW1lbnQgPSBpbnN0cnVtZW50XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmNvbm5lY3QodGhpcy5fcGFubmVyKVxuICAgIH1lbHNlIGlmKGluc3RydW1lbnQgPT09IG51bGwpe1xuICAgICAgLy8gaWYgeW91IHBhc3MgbnVsbCBhcyBhcmd1bWVudCB0aGUgY3VycmVudCBpbnN0cnVtZW50IHdpbGwgYmUgcmVtb3ZlZCwgc2FtZSBhcyByZW1vdmVJbnN0cnVtZW50XG4gICAgICB0aGlzLnJlbW92ZUluc3RydW1lbnQoKVxuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5sb2coJ0ludmFsaWQgaW5zdHJ1bWVudCwgYW5kIGluc3RydW1lbnQgc2hvdWxkIGhhdmUgdGhlIG1ldGhvZHMgXCJjb25uZWN0XCIsIFwiZGlzY29ubmVjdFwiLCBcInByb2Nlc3NNSURJRXZlbnRcIiwgXCJ1bnNjaGVkdWxlXCIgYW5kIFwiYWxsTm90ZXNPZmZcIicpXG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlSW5zdHJ1bWVudCgpe1xuICAgIGlmKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpe1xuICAgICAgdGhpcy5faW5zdHJ1bWVudC5hbGxOb3Rlc09mZigpXG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmRpc2Nvbm5lY3QoKVxuICAgICAgdGhpcy5faW5zdHJ1bWVudCA9IG51bGxcbiAgICB9XG4gIH1cblxuICBnZXRJbnN0cnVtZW50KCl7XG4gICAgcmV0dXJuIHRoaXMuX2luc3RydW1lbnRcbiAgfVxuXG4gIGNvbm5lY3RNSURJT3V0cHV0cyguLi5vdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gICAgb3V0cHV0cy5mb3JFYWNoKG91dHB1dCA9PiB7XG4gICAgICBpZih0eXBlb2Ygb3V0cHV0ID09PSAnc3RyaW5nJyl7XG4gICAgICAgIG91dHB1dCA9IGdldE1JRElPdXRwdXRCeUlkKG91dHB1dClcbiAgICAgIH1cbiAgICAgIGlmKG91dHB1dCBpbnN0YW5jZW9mIE1JRElPdXRwdXQpe1xuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5zZXQob3V0cHV0LmlkLCBvdXRwdXQpXG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlPdXRwdXRzKVxuICB9XG5cbiAgZGlzY29ubmVjdE1JRElPdXRwdXRzKC4uLm91dHB1dHMpe1xuICAgIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgICBpZihvdXRwdXRzLmxlbmd0aCA9PT0gMCl7XG4gICAgICB0aGlzLl9taWRpT3V0cHV0cy5jbGVhcigpXG4gICAgfVxuICAgIG91dHB1dHMuZm9yRWFjaChwb3J0ID0+IHtcbiAgICAgIGlmKHBvcnQgaW5zdGFuY2VvZiBNSURJT3V0cHV0KXtcbiAgICAgICAgcG9ydCA9IHBvcnQuaWRcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuX21pZGlPdXRwdXRzLmhhcyhwb3J0KSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3JlbW92aW5nJywgdGhpcy5fbWlkaU91dHB1dHMuZ2V0KHBvcnQpLm5hbWUpXG4gICAgICAgIHRoaXMuX21pZGlPdXRwdXRzLmRlbGV0ZShwb3J0KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy90aGlzLl9taWRpT3V0cHV0cyA9IHRoaXMuX21pZGlPdXRwdXRzLmZpbHRlciguLi5vdXRwdXRzKVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaU91dHB1dHMpXG4gIH1cblxuICBjb25uZWN0TUlESUlucHV0cyguLi5pbnB1dHMpe1xuICAgIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgIGlmKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpe1xuICAgICAgICBpbnB1dCA9IGdldE1JRElJbnB1dEJ5SWQoaW5wdXQpXG4gICAgICB9XG4gICAgICBpZihpbnB1dCBpbnN0YW5jZW9mIE1JRElJbnB1dCl7XG5cbiAgICAgICAgdGhpcy5fbWlkaUlucHV0cy5zZXQoaW5wdXQuaWQsIGlucHV0KVxuXG4gICAgICAgIGlucHV0Lm9ubWlkaW1lc3NhZ2UgPSBlID0+IHtcbiAgICAgICAgICBpZih0aGlzLm1vbml0b3IgPT09IHRydWUpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyguLi5lLmRhdGEpXG4gICAgICAgICAgICB0aGlzLl9wcmVwcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQodGhpcy5fc29uZy5fdGlja3MsIC4uLmUuZGF0YSkpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlJbnB1dHMpXG4gIH1cblxuICAvLyB5b3UgY2FuIHBhc3MgYm90aCBwb3J0IGFuZCBwb3J0IGlkc1xuICBkaXNjb25uZWN0TUlESUlucHV0cyguLi5pbnB1dHMpe1xuICAgIGlmKGlucHV0cy5sZW5ndGggPT09IDApe1xuICAgICAgdGhpcy5fbWlkaUlucHV0cy5mb3JFYWNoKHBvcnQgPT4ge1xuICAgICAgICBwb3J0Lm9ubWlkaW1lc3NhZ2UgPSBudWxsXG4gICAgICB9KVxuICAgICAgdGhpcy5fbWlkaUlucHV0cy5jbGVhcigpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaW5wdXRzLmZvckVhY2gocG9ydCA9PiB7XG4gICAgICBpZihwb3J0IGluc3RhbmNlb2YgTUlESUlucHV0KXtcbiAgICAgICAgcG9ydCA9IHBvcnQuaWRcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuX21pZGlJbnB1dHMuaGFzKHBvcnQpKXtcbiAgICAgICAgdGhpcy5fbWlkaUlucHV0cy5nZXQocG9ydCkub25taWRpbWVzc2FnZSA9IG51bGxcbiAgICAgICAgdGhpcy5fbWlkaUlucHV0cy5kZWxldGUocG9ydClcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vdGhpcy5fbWlkaU91dHB1dHMgPSB0aGlzLl9taWRpT3V0cHV0cy5maWx0ZXIoLi4ub3V0cHV0cylcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlJbnB1dHMpXG4gIH1cblxuICBnZXRNSURJSW5wdXRzKCl7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fbWlkaUlucHV0cy52YWx1ZXMoKSlcbiAgfVxuXG4gIGdldE1JRElPdXRwdXRzKCl7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fbWlkaU91dHB1dHMudmFsdWVzKCkpXG4gIH1cblxuICBzZXRSZWNvcmRFbmFibGVkKHR5cGUpeyAvLyAnbWlkaScsICdhdWRpbycsIGVtcHR5IG9yIGFueXRoaW5nIHdpbGwgZGlzYWJsZSByZWNvcmRpbmdcbiAgICB0aGlzLl9yZWNvcmRFbmFibGVkID0gdHlwZVxuICB9XG5cbiAgX3N0YXJ0UmVjb3JkaW5nKHJlY29yZElkKXtcbiAgICBpZih0aGlzLl9yZWNvcmRFbmFibGVkID09PSAnbWlkaScpe1xuICAgICAgLy9jb25zb2xlLmxvZyhyZWNvcmRJZClcbiAgICAgIHRoaXMuX3JlY29yZElkID0gcmVjb3JkSWRcbiAgICAgIHRoaXMuX3JlY29yZGVkRXZlbnRzID0gW11cbiAgICAgIHRoaXMuX3JlY29yZFBhcnQgPSBuZXcgUGFydCh0aGlzLl9yZWNvcmRJZClcbiAgICB9XG4gIH1cblxuICBfc3RvcFJlY29yZGluZyhyZWNvcmRJZCl7XG4gICAgaWYodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZih0aGlzLl9yZWNvcmRlZEV2ZW50cy5sZW5ndGggPT09IDApe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX3JlY29yZFBhcnQuYWRkRXZlbnRzKC4uLnRoaXMuX3JlY29yZGVkRXZlbnRzKVxuICAgIC8vdGhpcy5fc29uZy5fbmV3RXZlbnRzLnB1c2goLi4udGhpcy5fcmVjb3JkZWRFdmVudHMpXG4gICAgdGhpcy5hZGRQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KVxuICB9XG5cbiAgdW5kb1JlY29yZGluZyhyZWNvcmRJZCl7XG4gICAgaWYodGhpcy5fcmVjb3JkSWQgIT09IHJlY29yZElkKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnJlbW92ZVBhcnRzKHRoaXMuX3JlY29yZFBhcnQpXG4gICAgLy90aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4udGhpcy5fcmVjb3JkZWRFdmVudHMpXG4gIH1cblxuICByZWRvUmVjb3JkaW5nKHJlY29yZElkKXtcbiAgICBpZih0aGlzLl9yZWNvcmRJZCAhPT0gcmVjb3JkSWQpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuYWRkUGFydHModGhpcy5fcmVjb3JkUGFydClcbiAgfVxuXG4gIGNvcHkoKXtcbiAgICBsZXQgdCA9IG5ldyBUcmFjayh0aGlzLm5hbWUgKyAnX2NvcHknKSAvLyBpbXBsZW1lbnQgZ2V0TmFtZU9mQ29weSgpIGluIHV0aWwgKHNlZSBoZWFydGJlYXQpXG4gICAgbGV0IHBhcnRzID0gW11cbiAgICB0aGlzLl9wYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgbGV0IGNvcHkgPSBwYXJ0LmNvcHkoKVxuICAgICAgY29uc29sZS5sb2coY29weSlcbiAgICAgIHBhcnRzLnB1c2goY29weSlcbiAgICB9KVxuICAgIHQuYWRkUGFydHMoLi4ucGFydHMpXG4gICAgdC51cGRhdGUoKVxuICAgIHJldHVybiB0XG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICB9XG5cbiAgYWRkUGFydHMoLi4ucGFydHMpe1xuICAgIGxldCBzb25nID0gdGhpcy5fc29uZ1xuXG4gICAgcGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuXG4gICAgICBwYXJ0Ll90cmFjayA9IHRoaXNcbiAgICAgIHRoaXMuX3BhcnRzLnB1c2gocGFydClcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5zZXQocGFydC5pZCwgcGFydClcblxuICAgICAgbGV0IGV2ZW50cyA9IHBhcnQuX2V2ZW50c1xuICAgICAgdGhpcy5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgcGFydC5fc29uZyA9IHNvbmdcbiAgICAgICAgc29uZy5fbmV3UGFydHMucHVzaChwYXJ0KVxuICAgICAgICBzb25nLl9uZXdFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB9XG5cbiAgICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5fdHJhY2sgPSB0aGlzXG4gICAgICAgIGlmKHNvbmcpe1xuICAgICAgICAgIGV2ZW50Ll9zb25nID0gc29uZ1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudClcbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIHJlbW92ZVBhcnRzKC4uLnBhcnRzKXtcbiAgICBsZXQgc29uZyA9IHRoaXMuX3NvbmdcblxuICAgIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIHBhcnQuX3RyYWNrID0gbnVsbFxuICAgICAgdGhpcy5fcGFydHNCeUlkLmRlbGV0ZShwYXJ0LmlkLCBwYXJ0KVxuXG4gICAgICBsZXQgZXZlbnRzID0gcGFydC5fZXZlbnRzXG5cbiAgICAgIGlmKHNvbmcpe1xuICAgICAgICBzb25nLl9yZW1vdmVkUGFydHMucHVzaChwYXJ0KVxuICAgICAgICBzb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgfVxuXG4gICAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgICAgaWYoc29uZyl7XG4gICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQsIGV2ZW50KVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuXG4gIHRyYW5zcG9zZVBhcnRzKGFtb3VudDogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICB9XG5cbiAgbW92ZVBhcnRzKHRpY2tzOiBudW1iZXIsIC4uLnBhcnRzKXtcbiAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgcGFydC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gIH1cblxuICBtb3ZlUGFydHNUbyh0aWNrczogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gIH1cbi8qXG4gIGFkZEV2ZW50cyguLi5ldmVudHMpe1xuICAgIGxldCBwID0gbmV3IFBhcnQoKVxuICAgIHAuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICB0aGlzLmFkZFBhcnRzKHApXG4gIH1cbiovXG4gIHJlbW92ZUV2ZW50cyguLi5ldmVudHMpe1xuICAgIGxldCBwYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgcGFydHMuc2V0KGV2ZW50Ll9wYXJ0KVxuICAgICAgZXZlbnQuX3BhcnQgPSBudWxsXG4gICAgICBldmVudC5fdHJhY2sgPSBudWxsXG4gICAgICBldmVudC5fc29uZyA9IG51bGxcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9yZW1vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgICAgdGhpcy5fc29uZy5fY2hhbmdlZFBhcnRzLnB1c2goLi4uQXJyYXkuZnJvbShwYXJ0cy5lbnRyaWVzKCkpKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZVxuICB9XG5cbiAgbW92ZUV2ZW50cyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGxldCBwYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZSh0aWNrcylcbiAgICAgIHBhcnRzLnNldChldmVudC5wYXJ0KVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICB9XG4gIH1cblxuICBtb3ZlRXZlbnRzVG8odGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBsZXQgcGFydHMgPSBuZXcgU2V0KClcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcylcbiAgICAgIHBhcnRzLnNldChldmVudC5wYXJ0KVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLmV2ZW50cylcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICB9XG4gIH1cblxuICBnZXRFdmVudHMoZmlsdGVyOiBzdHJpbmdbXSA9IG51bGwpeyAvLyBjYW4gYmUgdXNlIGFzIGZpbmRFdmVudHNcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSl7XG4gICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgfVxuICAgIHJldHVybiBbLi4udGhpcy5fZXZlbnRzXSAvL0BUT0RPIGltcGxlbWVudCBmaWx0ZXIgLT4gZmlsdGVyRXZlbnRzKCkgc2hvdWxkIGJlIGEgdXRpbGl0eSBmdW5jdGlvbiAobm90IGEgY2xhc3MgbWV0aG9kKVxuICB9XG5cbiAgbXV0ZShmbGFnOiBib29sZWFuID0gbnVsbCl7XG4gICAgaWYoZmxhZyl7XG4gICAgICB0aGlzLl9tdXRlZCA9IGZsYWdcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuX211dGVkID0gIXRoaXMuX211dGVkXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCl7IC8vIHlvdSBzaG91bGQgb25seSB1c2UgdGhpcyBpbiBodWdlIHNvbmdzICg+MTAwIHRyYWNrcylcbiAgICBpZih0aGlzLl9jcmVhdGVFdmVudEFycmF5KXtcbiAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSlcbiAgICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuICAgIH1cbiAgICBzb3J0RXZlbnRzKHRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gIH1cblxuICAvKlxuICAgIHJvdXRpbmc6IHNhbXBsZSBzb3VyY2UgLT4gcGFubmVyIC0+IGdhaW4gLT4gWy4uLmZ4XSAtPiBzb25nIG91dHB1dFxuICAgIEBUT0RPOiBuZWVkcyBzb21lIHJldGhpbmtpbmchXG4gICovXG4gIGNvbm5lY3Qoc29uZ091dHB1dCl7XG4gICAgdGhpcy5fc29uZ091dHB1dCA9IHNvbmdPdXRwdXRcbiAgICB0aGlzLl9vdXRwdXQuY29ubmVjdCh0aGlzLl9zb25nT3V0cHV0KVxuICB9XG5cbiAgZGlzY29ubmVjdCgpe1xuICAgIHRoaXMuX291dHB1dC5kaXNjb25uZWN0KHRoaXMuX3NvbmdPdXRwdXQpXG4gICAgdGhpcy5fc29uZ091dHB1dCA9IG51bGxcbiAgfVxuXG4gIF9jaGVja0VmZmVjdChlZmZlY3Qpe1xuICAgIGlmKHR5cGVvZiBlZmZlY3Quc2V0SW5wdXQgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGVmZmVjdC5zZXRPdXRwdXQgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGVmZmVjdC5nZXRPdXRwdXQgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGVmZmVjdC5kaXNjb25uZWN0ICE9PSAnZnVuY3Rpb24nKXtcbiAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIGNoYW5uZWwgZngsIGFuZCBjaGFubmVsIGZ4IHNob3VsZCBoYXZlIHRoZSBtZXRob2RzIFwic2V0SW5wdXRcIiwgXCJzZXRPdXRwdXRcIiwgXCJnZXRPdXRwdXRcIiBhbmQgXCJkaXNjb25uZWN0XCInKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyByb3V0aW5nOiBhdWRpb3NvdXJjZSAtPiBwYW5uaW5nIC0+IHRyYWNrIG91dHB1dCAtPiBlZmZlY3QgLT4gc29uZyBpbnB1dFxuICBhZGRFZmZlY3QoZWZmZWN0KXtcblxuICAgIC8vQFRPRE86IGFkZCBmeCByYWNrIChjdXJyZW50bHkgb25seSAxIGZ4IGNhbiBiZSBhZGRlZClcblxuICAgIHRoaXMuX291dHB1dC5kaXNjb25uZWN0KHRoaXMuX3NvbmdPdXRwdXQpXG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3QoZWZmZWN0LmlucHV0KVxuICAgIGVmZmVjdC5vdXRwdXQuY29ubmVjdCh0aGlzLl9zb25nT3V0cHV0KVxuXG4gICAgLy8gaWYodGhpcy5fY2hlY2tFZmZlY3QoZWZmZWN0KSA9PT0gZmFsc2Upe1xuICAgIC8vICAgcmV0dXJuXG4gICAgLy8gfVxuICAgIC8vIGxldCBudW1GWCA9IHRoaXMuX2VmZmVjdHMubGVuZ3RoXG4gICAgLy8gbGV0IGxhc3RGWFxuICAgIC8vIGxldCBvdXRwdXRcbiAgICAvLyBpZihudW1GWCA9PT0gMCl7XG4gICAgLy8gICBsYXN0RlggPSB0aGlzLl9vdXRwdXRcbiAgICAvLyAgIGxhc3RGWC5kaXNjb25uZWN0KHRoaXMuX3NvbmdPdXRwdXQpXG4gICAgLy8gICBvdXRwdXQgPSB0aGlzLl9vdXRwdXRcbiAgICAvLyB9ZWxzZXtcbiAgICAvLyAgIGxhc3RGWCA9IHRoaXMuX2VmZmVjdHNbbnVtRlggLSAxXVxuICAgIC8vICAgbGFzdEZYLmRpc2Nvbm5lY3QoKVxuICAgIC8vICAgb3V0cHV0ID0gbGFzdEZYLmdldE91dHB1dCgpXG4gICAgLy8gfVxuXG4gICAgLy8gZWZmZWN0LnNldElucHV0KG91dHB1dClcbiAgICAvLyBlZmZlY3Quc2V0T3V0cHV0KHRoaXMuX3NvbmdPdXRwdXQpXG5cbiAgICAvLyB0aGlzLl9lZmZlY3RzLnB1c2goZWZmZWN0KVxuICB9XG5cbiAgYWRkRWZmZWN0QXQoZWZmZWN0LCBpbmRleDogbnVtYmVyKXtcbiAgICBpZih0aGlzLl9jaGVja0VmZmVjdChlZmZlY3QpID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fZWZmZWN0cy5zcGxpY2UoaW5kZXgsIDAsIGVmZmVjdClcbiAgfVxuXG4gIC8vcmVtb3ZlRWZmZWN0KGluZGV4OiBudW1iZXIpe1xuICByZW1vdmVFZmZlY3QoZWZmZWN0KXtcbiAgICB0aGlzLl9vdXRwdXQuZGlzY29ubmVjdChlZmZlY3QuaW5wdXQpXG4gICAgdHJ5e1xuICAgICAgZWZmZWN0Lm91dHB1dC5kaXNjb25uZWN0KHRoaXMuX3NvbmdPdXRwdXQpXG4gICAgfWNhdGNoKGUpe1xuICAgICAgLy8gQ2hyb21lIHRocm93cyBhbiBlcnJvciBoZXJlLCB3aGljaCBpcyB3cm9uZ1xuICAgIH1cbiAgICB0aGlzLl9vdXRwdXQuY29ubmVjdCh0aGlzLl9zb25nT3V0cHV0KVxuXG4gICAgLy8gaWYoaXNOYU4oaW5kZXgpKXtcbiAgICAvLyAgIHJldHVyblxuICAgIC8vIH1cbiAgICAvLyB0aGlzLl9lZmZlY3RzLmZvckVhY2goZnggPT4ge1xuICAgIC8vICAgZnguZGlzY29ubmVjdCgpXG4gICAgLy8gfSlcbiAgICAvLyB0aGlzLl9lZmZlY3RzLnNwbGljZShpbmRleCwgMSlcblxuICAgIC8vIGxldCBudW1GWCA9IHRoaXMuX2VmZmVjdHMubGVuZ3RoXG5cbiAgICAvLyBpZihudW1GWCA9PT0gMCl7XG4gICAgLy8gICB0aGlzLl9vdXRwdXQuY29ubmVjdCh0aGlzLl9zb25nT3V0cHV0KVxuICAgIC8vICAgcmV0dXJuXG4gICAgLy8gfVxuXG4gICAgLy8gbGV0IGxhc3RGWCA9IHRoaXMuX291dHB1dFxuICAgIC8vIHRoaXMuX2VmZmVjdHMuZm9yRWFjaCgoZngsIGkpID0+IHtcbiAgICAvLyAgIGZ4LnNldElucHV0KGxhc3RGWClcbiAgICAvLyAgIGlmKGkgPT09IG51bUZYIC0gMSl7XG4gICAgLy8gICAgIGZ4LnNldE91dHB1dCh0aGlzLl9zb25nT3V0cHV0KVxuICAgIC8vICAgfWVsc2V7XG4gICAgLy8gICAgIGZ4LnNldE91dHB1dCh0aGlzLl9lZmZlY3RzW2kgKyAxXSlcbiAgICAvLyAgIH1cbiAgICAvLyAgIGxhc3RGWCA9IGZ4XG4gICAgLy8gfSlcbiAgfVxuXG4gIGdldEVmZmVjdHMoKXtcbiAgICByZXR1cm4gdGhpcy5fZWZmZWN0c1xuICB9XG5cbiAgZ2V0RWZmZWN0QXQoaW5kZXg6IG51bWJlcil7XG4gICAgaWYoaXNOYU4oaW5kZXgpKXtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lZmZlY3RzW2luZGV4XVxuICB9XG5cbiAgZ2V0T3V0cHV0KCl7XG4gICAgcmV0dXJuIHRoaXMuX291dHB1dFxuICB9XG5cbiAgZ2V0SW5wdXQoKXtcbiAgICByZXR1cm4gdGhpcy5fc29uZ091dHB1dFxuICB9XG5cbiAgLy8gbWV0aG9kIGlzIGNhbGxlZCB3aGVuIGEgTUlESSBldmVudHMgaXMgc2VuZCBieSBhbiBleHRlcm5hbCBvciBvbi1zY3JlZW4ga2V5Ym9hcmRcbiAgX3ByZXByb2Nlc3NNSURJRXZlbnQobWlkaUV2ZW50KXtcbiAgICBsZXQgdGltZSA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgbWlkaUV2ZW50LnRpbWUgPSB0aW1lXG4gICAgbWlkaUV2ZW50LnRpbWUyID0gMC8vcGVyZm9ybWFuY2Uubm93KCkgLT4gcGFzc2luZyAwIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXMgcGVyZm9ybWFuY2Uubm93KCkgc28gd2UgY2hvb3NlIHRoZSBmb3JtZXJcbiAgICBtaWRpRXZlbnQucmVjb3JkTWlsbGlzID0gdGltZVxuICAgIGxldCBub3RlXG5cbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuTk9URV9PTil7XG4gICAgICBub3RlID0gbmV3IE1JRElOb3RlKG1pZGlFdmVudClcbiAgICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMuc2V0KG1pZGlFdmVudC5kYXRhMSwgbm90ZSlcbiAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICB0eXBlOiAnbm90ZU9uJyxcbiAgICAgICAgZGF0YTogbWlkaUV2ZW50XG4gICAgICB9KVxuICAgIH1lbHNlIGlmKG1pZGlFdmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5OT1RFX09GRil7XG4gICAgICBub3RlID0gdGhpcy5fdG1wUmVjb3JkZWROb3Rlcy5nZXQobWlkaUV2ZW50LmRhdGExKVxuICAgICAgaWYodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KVxuICAgICAgdGhpcy5fdG1wUmVjb3JkZWROb3Rlcy5kZWxldGUobWlkaUV2ZW50LmRhdGExKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgIHR5cGU6ICdub3RlT2ZmJyxcbiAgICAgICAgZGF0YTogbWlkaUV2ZW50XG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmKHRoaXMuX3JlY29yZEVuYWJsZWQgPT09ICdtaWRpJyAmJiB0aGlzLl9zb25nLnJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cy5wdXNoKG1pZGlFdmVudClcbiAgICB9XG4gICAgdGhpcy5wcm9jZXNzTUlESUV2ZW50KG1pZGlFdmVudClcbiAgfVxuXG4gIC8vIG1ldGhvZCBpcyBjYWxsZWQgYnkgc2NoZWR1bGVyIGR1cmluZyBwbGF5YmFja1xuICBwcm9jZXNzTUlESUV2ZW50KGV2ZW50KXtcblxuICAgIGlmKHR5cGVvZiBldmVudC50aW1lID09PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLl9wcmVwcm9jZXNzTUlESUV2ZW50KGV2ZW50KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gc2VuZCB0byBqYXZhc2NyaXB0IGluc3RydW1lbnRcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIC8vY29uc29sZS5sb2codGhpcy5uYW1lLCBldmVudClcbiAgICAgIHRoaXMuX2luc3RydW1lbnQucHJvY2Vzc01JRElFdmVudChldmVudClcbiAgICB9XG5cbiAgICAvLyBzZW5kIHRvIGV4dGVybmFsIGhhcmR3YXJlIG9yIHNvZnR3YXJlIGluc3RydW1lbnRcbiAgICB0aGlzLl9zZW5kVG9FeHRlcm5hbE1JRElPdXRwdXRzKGV2ZW50KVxuICB9XG5cbiAgX3NlbmRUb0V4dGVybmFsTUlESU91dHB1dHMoZXZlbnQpe1xuICAgIC8vY29uc29sZS5sb2coZXZlbnQudGltZSwgZXZlbnQubWlsbGlzKVxuICAgIGZvcihsZXQgcG9ydCBvZiB0aGlzLl9taWRpT3V0cHV0cy52YWx1ZXMoKSl7XG4gICAgICBpZihwb3J0KXtcbiAgICAgICAgaWYoZXZlbnQuZGF0YTIgIT09IC0xKXtcbiAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMl0sIGV2ZW50LnRpbWUyKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyB0aGlzLmNoYW5uZWwsIGV2ZW50LmRhdGExXSwgZXZlbnQudGltZTIpXG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYoZXZlbnQudHlwZSA9PT0gMTI4IHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgICAvLyAgIHBvcnQuc2VuZChbZXZlbnQudHlwZSArIHRoaXMuY2hhbm5lbCwgZXZlbnQuZGF0YTEsIGV2ZW50LmRhdGEyXSwgZXZlbnQudGltZSArIGxhdGVuY3kpXG4gICAgICAgIC8vIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDE5MiB8fCBldmVudC50eXBlID09PSAyMjQpe1xuICAgICAgICAvLyAgIHBvcnQuc2VuZChbZXZlbnQudHlwZSwgZXZlbnQuZGF0YTFdLCBldmVudC50aW1lICsgbGF0ZW5jeSlcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVuc2NoZWR1bGUobWlkaUV2ZW50KXtcblxuICAgIGlmKHRoaXMuX2luc3RydW1lbnQgIT09IG51bGwpe1xuICAgICAgdGhpcy5faW5zdHJ1bWVudC51bnNjaGVkdWxlKG1pZGlFdmVudClcbiAgICB9XG5cbiAgICBpZih0aGlzLl9taWRpT3V0cHV0cy5zaXplID09PSAwKXtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxNDQpe1xuICAgICAgbGV0IG1pZGlOb3RlID0gbWlkaUV2ZW50Lm1pZGlOb3RlXG4gICAgICBsZXQgbm90ZU9mZiA9IG5ldyBNSURJRXZlbnQoMCwgMTI4LCBtaWRpRXZlbnQuZGF0YTEsIDApXG4gICAgICBub3RlT2ZmLm1pZGlOb3RlSWQgPSBtaWRpTm90ZS5pZFxuICAgICAgbm90ZU9mZi50aW1lID0gY29udGV4dC5jdXJyZW50VGltZVxuICAgICAgdGhpcy5fc2VuZFRvRXh0ZXJuYWxNSURJT3V0cHV0cyhub3RlT2ZmLCB0cnVlKVxuICAgIH1cbiAgfVxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgICB9XG5cbiAgICAvLyBsZXQgdGltZVN0YW1wID0gKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwKSArIHRoaXMubGF0ZW5jeVxuICAgIC8vIGZvcihsZXQgb3V0cHV0IG9mIHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKXtcbiAgICAvLyAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgIC8vICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXApIC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgIC8vIH1cbiAgfVxuXG4gIHNldFBhbm5pbmcodmFsdWUpe1xuICAgIGlmKHZhbHVlIDwgLTEgfHwgdmFsdWUgPiAxKXtcbiAgICAgIGNvbnNvbGUubG9nKCdUcmFjay5zZXRQYW5uaW5nKCkgYWNjZXB0cyBhIHZhbHVlIGJldHdlZW4gLTEgKGZ1bGwgbGVmdCkgYW5kIDEgKGZ1bGwgcmlnaHQpLCB5b3UgZW50ZXJlZDonLCB2YWx1ZSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgeCA9IHZhbHVlXG4gICAgbGV0IHkgPSAwXG4gICAgbGV0IHogPSAxIC0gTWF0aC5hYnMoeClcblxuICAgIHggPSB4ID09PSAwID8gemVyb1ZhbHVlIDogeFxuICAgIHkgPSB5ID09PSAwID8gemVyb1ZhbHVlIDogeVxuICAgIHogPSB6ID09PSAwID8gemVyb1ZhbHVlIDogelxuXG4gICAgdGhpcy5fcGFubmVyLnNldFBvc2l0aW9uKHgsIHksIHopXG4gICAgdGhpcy5fcGFubmluZ1ZhbHVlID0gdmFsdWVcbiAgfVxuXG4gIGdldFBhbm5pbmcoKXtcbiAgICByZXR1cm4gdGhpcy5fcGFubmluZ1ZhbHVlXG4gIH1cblxufVxuIiwiaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5cbmNvbnN0XG4gIG1QSSA9IE1hdGguUEksXG4gIG1Qb3cgPSBNYXRoLnBvdyxcbiAgbVJvdW5kID0gTWF0aC5yb3VuZCxcbiAgbUZsb29yID0gTWF0aC5mbG9vcixcbiAgbVJhbmRvbSA9IE1hdGgucmFuZG9tXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5pY2VUaW1lKG1pbGxpcyl7XG4gIGxldCBoLCBtLCBzLCBtcyxcbiAgICBzZWNvbmRzLFxuICAgIHRpbWVBc1N0cmluZyA9ICcnO1xuXG4gIHNlY29uZHMgPSBtaWxsaXMgLyAxMDAwOyAvLyDihpIgbWlsbGlzIHRvIHNlY29uZHNcbiAgaCA9IG1GbG9vcihzZWNvbmRzIC8gKDYwICogNjApKTtcbiAgbSA9IG1GbG9vcigoc2Vjb25kcyAlICg2MCAqIDYwKSkgLyA2MCk7XG4gIHMgPSBtRmxvb3Ioc2Vjb25kcyAlICg2MCkpO1xuICBtcyA9IG1Sb3VuZCgoc2Vjb25kcyAtIChoICogMzYwMCkgLSAobSAqIDYwKSAtIHMpICogMTAwMCk7XG5cbiAgdGltZUFzU3RyaW5nICs9IGggKyAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtIDwgMTAgPyAnMCcgKyBtIDogbTtcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IHMgPCAxMCA/ICcwJyArIHMgOiBzO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbXMgPT09IDAgPyAnMDAwJyA6IG1zIDwgMTAgPyAnMDAnICsgbXMgOiBtcyA8IDEwMCA/ICcwJyArIG1zIDogbXM7XG5cbiAgLy9jb25zb2xlLmxvZyhoLCBtLCBzLCBtcyk7XG4gIHJldHVybiB7XG4gICAgaG91cjogaCxcbiAgICBtaW51dGU6IG0sXG4gICAgc2Vjb25kOiBzLFxuICAgIG1pbGxpc2Vjb25kOiBtcyxcbiAgICB0aW1lQXNTdHJpbmc6IHRpbWVBc1N0cmluZyxcbiAgICB0aW1lQXNBcnJheTogW2gsIG0sIHMsIG1zXVxuICB9O1xufVxuXG5cbi8vIGFkYXB0ZWQgdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vZGFuZ3Vlci9ibG9nLWV4YW1wbGVzL2Jsb2IvbWFzdGVyL2pzL2Jhc2U2NC1iaW5hcnkuanNcbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0JpbmFyeShpbnB1dCl7XG4gIGxldCBrZXlTdHIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nLFxuICAgIGJ5dGVzLCB1YXJyYXksIGJ1ZmZlcixcbiAgICBsa2V5MSwgbGtleTIsXG4gICAgY2hyMSwgY2hyMiwgY2hyMyxcbiAgICBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0LFxuICAgIGksIGogPSAwO1xuXG4gIGJ5dGVzID0gTWF0aC5jZWlsKCgzICogaW5wdXQubGVuZ3RoKSAvIDQuMCk7XG4gIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihieXRlcyk7XG4gIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgbGtleTEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBsa2V5MiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpbnB1dC5sZW5ndGggLSAxKSk7XG4gIGlmKGxrZXkxID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcbiAgaWYobGtleTIgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuXG4gIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csICcnKTtcblxuICBmb3IoaSA9IDA7IGkgPCBieXRlczsgaSArPSAzKSB7XG4gICAgLy9nZXQgdGhlIDMgb2N0ZWN0cyBpbiA0IGFzY2lpIGNoYXJzXG4gICAgZW5jMSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzMgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jNCA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcblxuICAgIGNocjEgPSAoZW5jMSA8PCAyKSB8IChlbmMyID4+IDQpO1xuICAgIGNocjIgPSAoKGVuYzIgJiAxNSkgPDwgNCkgfCAoZW5jMyA+PiAyKTtcbiAgICBjaHIzID0gKChlbmMzICYgMykgPDwgNikgfCBlbmM0O1xuXG4gICAgdWFycmF5W2ldID0gY2hyMTtcbiAgICBpZihlbmMzICE9IDY0KSB1YXJyYXlbaSsxXSA9IGNocjI7XG4gICAgaWYoZW5jNCAhPSA2NCkgdWFycmF5W2krMl0gPSBjaHIzO1xuICB9XG4gIC8vY29uc29sZS5sb2coYnVmZmVyKTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdHlwZVN0cmluZyhvKXtcbiAgaWYodHlwZW9mIG8gIT0gJ29iamVjdCcpe1xuICAgIHJldHVybiB0eXBlb2YgbztcbiAgfVxuXG4gIGlmKG8gPT09IG51bGwpe1xuICAgIHJldHVybiAnbnVsbCc7XG4gIH1cblxuICAvL29iamVjdCwgYXJyYXksIGZ1bmN0aW9uLCBkYXRlLCByZWdleHAsIHN0cmluZywgbnVtYmVyLCBib29sZWFuLCBlcnJvclxuICBsZXQgaW50ZXJuYWxDbGFzcyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5tYXRjaCgvXFxbb2JqZWN0XFxzKFxcdyspXFxdLylbMV07XG4gIHJldHVybiBpbnRlcm5hbENsYXNzLnRvTG93ZXJDYXNlKCk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRFdmVudHMoZXZlbnRzKXtcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICBsZXQgciA9IGEudHlwZSAtIGIudHlwZTtcbiAgICAgIGlmKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgciA9IC0xXG4gICAgICB9XG4gICAgICByZXR1cm4gclxuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3NcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrSWZCYXNlNjQoZGF0YSl7XG4gIGxldCBwYXNzZWQgPSB0cnVlO1xuICB0cnl7XG4gICAgYXRvYihkYXRhKTtcbiAgfWNhdGNoKGUpe1xuICAgIHBhc3NlZCA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBwYXNzZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFcXVhbFBvd2VyQ3VydmUobnVtU3RlcHMsIHR5cGUsIG1heFZhbHVlKSB7XG4gIGxldCBpLCB2YWx1ZSwgcGVyY2VudCxcbiAgICB2YWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KG51bVN0ZXBzKVxuXG4gIGZvcihpID0gMDsgaSA8IG51bVN0ZXBzOyBpKyspe1xuICAgIHBlcmNlbnQgPSBpIC8gbnVtU3RlcHNcbiAgICBpZih0eXBlID09PSAnZmFkZUluJyl7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKCgxLjAgLSBwZXJjZW50KSAqIDAuNSAqIG1QSSkgKiBtYXhWYWx1ZVxuICAgIH1lbHNlIGlmKHR5cGUgPT09ICdmYWRlT3V0Jyl7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKHBlcmNlbnQgKiAwLjUgKiBNYXRoLlBJKSAqIG1heFZhbHVlXG4gICAgfVxuICAgIHZhbHVlc1tpXSA9IHZhbHVlXG4gICAgaWYoaSA9PT0gbnVtU3RlcHMgLSAxKXtcbiAgICAgIHZhbHVlc1tpXSA9IHR5cGUgPT09ICdmYWRlSW4nID8gMSA6IDBcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja01JRElOdW1iZXIodmFsdWUpe1xuICAvL2NvbnNvbGUubG9nKHZhbHVlKTtcbiAgaWYoaXNOYU4odmFsdWUpKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmKHZhbHVlIDwgMCB8fCB2YWx1ZSA+IDEyNyl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEyNycpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cblxuLypcbi8vb2xkIHNjaG9vbCBhamF4XG5cbmV4cG9ydCBmdW5jdGlvbiBhamF4KGNvbmZpZyl7XG4gIGxldFxuICAgIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcbiAgICBtZXRob2QgPSB0eXBlb2YgY29uZmlnLm1ldGhvZCA9PT0gJ3VuZGVmaW5lZCcgPyAnR0VUJyA6IGNvbmZpZy5tZXRob2QsXG4gICAgZmlsZVNpemU7XG5cbiAgZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIHJlamVjdCA9IHJlamVjdCB8fCBmdW5jdGlvbigpe307XG4gICAgcmVzb2x2ZSA9IHJlc29sdmUgfHwgZnVuY3Rpb24oKXt9O1xuXG4gICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgaWYocmVxdWVzdC5zdGF0dXMgIT09IDIwMCl7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LnN0YXR1cyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgZmlsZVNpemUgPSByZXF1ZXN0LnJlc3BvbnNlLmxlbmd0aDtcbiAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpLCBmaWxlU2l6ZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKXtcbiAgICAgIGNvbmZpZy5vbkVycm9yKGUpO1xuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCBjb25maWcudXJsLCB0cnVlKTtcblxuICAgIGlmKGNvbmZpZy5vdmVycmlkZU1pbWVUeXBlKXtcbiAgICAgIHJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZShjb25maWcub3ZlcnJpZGVNaW1lVHlwZSk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSl7XG4gICAgICBpZihjb25maWcucmVzcG9uc2VUeXBlID09PSAnanNvbicpe1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICAgIH1lbHNle1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYobWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5kYXRhKXtcbiAgICAgIHJlcXVlc3Quc2VuZChjb25maWcuZGF0YSk7XG4gICAgfWVsc2V7XG4gICAgICByZXF1ZXN0LnNlbmQoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xufVxuKi8iXX0=
