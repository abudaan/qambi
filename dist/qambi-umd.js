(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.qambi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"whatwg-fetch":13}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{"./midi/midi_access":5,"./midi/midi_input":6,"./midi/midi_output":7,"./midi/midimessage_event":9,"./util/util":12}],5:[function(require,module,exports){
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

},{"../util/jazz_instance":10,"../util/store":11,"../util/util":12,"./midi_input":6,"./midi_output":7,"./midiconnection_event":8}],6:[function(require,module,exports){
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

},{"../util/store":11,"../util/util":12,"./midi_access":5,"./midiconnection_event":8,"./midimessage_event":9}],7:[function(require,module,exports){
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

},{"../util/store":11,"../util/util":12,"./midi_access":5}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"./store":11,"./util":12}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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
},{"_process":3}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './init_audio'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./init_audio'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.init_audio);
    global.channel_fx = mod.exports;
  }
})(this, function (exports, _init_audio) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ChannelEffect = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
});

},{"./init_audio":21}],15:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.constants = mod.exports;
  }
})(this, function (exports) {
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
});

},{}],16:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './init_audio', './parse_audio', './channel_fx'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./init_audio'), require('./parse_audio'), require('./channel_fx'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.init_audio, global.parse_audio, global.channel_fx);
    global.convolution_reverb = mod.exports;
  }
})(this, function (exports, _init_audio, _parse_audio, _channel_fx) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ConvolutionReverb = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

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
});

},{"./channel_fx":14,"./init_audio":21,"./parse_audio":30}],17:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './init_audio', './channel_fx'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./init_audio'), require('./channel_fx'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.init_audio, global.channel_fx);
    global.delay_fx = mod.exports;
  }
})(this, function (exports, _init_audio, _channel_fx) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Delay = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

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
});

},{"./channel_fx":14,"./init_audio":21}],18:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.eventlistener = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.dispatchEvent = dispatchEvent;
  exports.addEventListener = addEventListener;
  exports.removeEventListener = removeEventListener;

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

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
});

},{}],19:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.fetch_helpers = mod.exports;
  }
})(this, function (exports) {
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
});

},{}],20:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './qambi', './song', './sampler', './init_audio', './init_midi', './settings'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./qambi'), require('./song'), require('./sampler'), require('./init_audio'), require('./init_midi'), require('./settings'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.qambi, global.song, global.sampler, global.init_audio, global.init_midi, global.settings);
    global.init = mod.exports;
  }
})(this, function (exports, _qambi, _song, _sampler, _init_audio, _init_midi, _settings) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Blob = exports.rAF = exports.getUserMedia = undefined;
  exports.init = init;

  var _qambi2 = _interopRequireDefault(_qambi);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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
});

},{"./init_audio":21,"./init_midi":22,"./qambi":35,"./sampler":39,"./settings":43,"./song":45}],21:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './samples', './parse_audio'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./samples'), require('./parse_audio'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.samples, global.parse_audio);
    global.init_audio = mod.exports;
  }
})(this, function (exports, _samples, _parse_audio) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configureMasterCompressor = exports.enableMasterCompressor = exports.getCompressionReduction = exports.getMasterVolume = exports.setMasterVolume = exports.masterCompressor = exports.unlockWebAudio = exports.masterGain = exports.context = undefined;
  exports.initAudio = initAudio;
  exports.getInitData = getInitData;

  var _samples2 = _interopRequireDefault(_samples);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

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
});

},{"./parse_audio":30,"./samples":40}],22:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './util', 'web-midi-api-shim'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./util'), require('web-midi-api-shim'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.util, global.webMidiApiShim);
    global.init_midi = mod.exports;
  }
})(this, function (exports, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getMIDIInputById = exports.getMIDIOutputById = exports.getMIDIInputIds = exports.getMIDIOutputIds = exports.getMIDIInputs = exports.getMIDIOutputs = exports.getMIDIAccess = undefined;
  exports.initMIDI = initMIDI;
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
});

},{"./util":49,"web-midi-api-shim":4}],23:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './init_audio', './eventlistener'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./init_audio'), require('./eventlistener'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.init_audio, global.eventlistener);
    global.instrument = mod.exports;
  }
})(this, function (exports, _init_audio, _eventlistener) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Instrument = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
});

},{"./eventlistener":18,"./init_audio":21}],24:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './track', './part', './parse_events', './midi_event', './util', './position', './sampler', './init_audio', './constants'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./track'), require('./part'), require('./parse_events'), require('./midi_event'), require('./util'), require('./position'), require('./sampler'), require('./init_audio'), require('./constants'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.track, global.part, global.parse_events, global.midi_event, global.util, global.position, global.sampler, global.init_audio, global.constants);
    global.metronome = mod.exports;
  }
})(this, function (exports, _track, _part3, _parse_events, _midi_event, _util, _position, _sampler, _init_audio, _constants) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Metronome = undefined;

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
});

},{"./constants":15,"./init_audio":21,"./midi_event":25,"./parse_events":31,"./part":32,"./position":34,"./sampler":39,"./track":48,"./util":49}],25:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './note', './settings'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./note'), require('./settings'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.note, global.settings);
    global.midi_event = mod.exports;
  }
})(this, function (exports, _note, _settings) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MIDIEvent = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
});

},{"./note":29,"./settings":43}],26:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './midi_event'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./midi_event'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.midi_event);
    global.midi_note = mod.exports;
  }
})(this, function (exports, _midi_event) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MIDINote = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
});

},{"./midi_event":25}],27:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.midi_stream = mod.exports;
  }
})(this, function (exports) {
  /*
    Wrapper for accessing bytes through sequential reads
  
    based on: https://github.com/gasman/jasmid
    adapted to work with ArrayBuffer -> Uint8Array
  */

  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
    }, {
      key: 'readInt32',
      value: function readInt32() {
        var result = (this.buffer[this.position] << 24) + (this.buffer[this.position + 1] << 16) + (this.buffer[this.position + 2] << 8) + this.buffer[this.position + 3];
        this.position += 4;
        return result;
      }
    }, {
      key: 'readInt16',
      value: function readInt16() {
        var result = (this.buffer[this.position] << 8) + this.buffer[this.position + 1];
        this.position += 2;
        return result;
      }
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
});

},{}],28:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './midi_stream'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./midi_stream'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.midi_stream);
    global.midifile = mod.exports;
  }
})(this, function (exports, _midi_stream) {
  /*
    Extracts all midi events from a binary midi file, uses midi_stream.js
  
    based on: https://github.com/gasman/jasmid
  */

  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.parseMIDIFile = parseMIDIFile;

  var _midi_stream2 = _interopRequireDefault(_midi_stream);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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
});

},{"./midi_stream":27}],29:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './settings'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./settings'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.settings);
    global.note = mod.exports;
  }
})(this, function (exports, _settings) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getNoteData = getNoteData;


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
});

},{"./settings":43}],30:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'isomorphic-fetch', './init_audio', './util', './eventlistener'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('isomorphic-fetch'), require('./init_audio'), require('./util'), require('./eventlistener'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.isomorphicFetch, global.init_audio, global.util, global.eventlistener);
    global.parse_audio = mod.exports;
  }
})(this, function (exports, _isomorphicFetch, _init_audio, _util, _eventlistener) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.decodeSample = decodeSample;
  exports.parseSamples2 = parseSamples2;
  exports.parseSamples = parseSamples;

  var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

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
});

},{"./eventlistener":18,"./init_audio":21,"./util":49,"isomorphic-fetch":2}],31:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './util', './midi_note'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./util'), require('./midi_note'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.util, global.midi_note);
    global.parse_events = mod.exports;
  }
})(this, function (exports, _util, _midi_note) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.parseTimeEvents = parseTimeEvents;
  exports.parseEvents = parseEvents;
  exports.parseMIDINotes = parseMIDINotes;
  exports.filterEvents = filterEvents;


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
});

},{"./midi_note":26,"./util":49}],32:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './util'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./util'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.util);
    global.part = mod.exports;
  }
})(this, function (exports, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Part = undefined;

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
});

},{"./util":49}],33:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './position.js', './eventlistener.js', './util.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./position.js'), require('./eventlistener.js'), require('./util.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.position, global.eventlistener, global.util);
    global.playhead = mod.exports;
  }
})(this, function (exports, _position, _eventlistener, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Playhead = undefined;

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
});

},{"./eventlistener.js":18,"./position.js":34,"./util.js":49}],34:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './util'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./util'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.util);
    global.position = mod.exports;
  }
})(this, function (exports, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.millisToTicks = millisToTicks;
  exports.ticksToMillis = ticksToMillis;
  exports.barsToMillis = barsToMillis;
  exports.barsToTicks = barsToTicks;
  exports.ticksToBars = ticksToBars;
  exports.millisToBars = millisToBars;
  exports.getPosition2 = getPosition2;
  exports.calculatePosition = calculatePosition;

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

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
});

},{"./util":49}],35:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './settings', './note', './midi_event', './midi_note', './part', './track', './song', './instrument', './sampler', './simple_synth', './convolution_reverb', './delay_fx', './midifile', './init', './init_audio', './init_midi', './parse_audio', './constants', './eventlistener'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./settings'), require('./note'), require('./midi_event'), require('./midi_note'), require('./part'), require('./track'), require('./song'), require('./instrument'), require('./sampler'), require('./simple_synth'), require('./convolution_reverb'), require('./delay_fx'), require('./midifile'), require('./init'), require('./init_audio'), require('./init_midi'), require('./parse_audio'), require('./constants'), require('./eventlistener'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.settings, global.note, global.midi_event, global.midi_note, global.part, global.track, global.song, global.instrument, global.sampler, global.simple_synth, global.convolution_reverb, global.delay_fx, global.midifile, global.init, global.init_audio, global.init_midi, global.parse_audio, global.constants, global.eventlistener);
    global.qambi = mod.exports;
  }
})(this, function (exports, _settings, _note, _midi_event, _midi_note, _part, _track, _song, _instrument, _sampler, _simple_synth, _convolution_reverb, _delay_fx, _midifile, _init, _init_audio, _init_midi, _parse_audio, _constants, _eventlistener) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Delay = exports.ConvolutionReverb = exports.Sampler = exports.SimpleSynth = exports.Instrument = exports.Part = exports.Track = exports.Song = exports.MIDINote = exports.MIDIEvent = exports.getNoteData = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.parseMIDIFile = exports.parseSamples = exports.MIDIEventTypes = exports.getSettings = exports.updateSettings = exports.getGMInstruments = exports.getInstruments = exports.init = exports.version = undefined;
  var version = '1.0.0-beta36';

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
});

},{"./constants":15,"./convolution_reverb":16,"./delay_fx":17,"./eventlistener":18,"./init":20,"./init_audio":21,"./init_midi":22,"./instrument":23,"./midi_event":25,"./midi_note":26,"./midifile":28,"./note":29,"./parse_audio":30,"./part":32,"./sampler":39,"./settings":43,"./simple_synth":44,"./song":45,"./track":48}],36:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './init_audio.js', './util.js'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./init_audio.js'), require('./util.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.init_audio, global.util);
    global.sample = mod.exports;
  }
})(this, function (exports, _init_audio, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Sample = undefined;
  exports.fadeOut = fadeOut;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
});

},{"./init_audio.js":21,"./util.js":49}],37:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './sample', './init_audio'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./sample'), require('./init_audio'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.sample, global.init_audio);
    global.sample_buffer = mod.exports;
  }
})(this, function (exports, _sample, _init_audio) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SampleBuffer = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

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
});

},{"./init_audio":21,"./sample":36}],38:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './sample', './init_audio'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./sample'), require('./init_audio'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.sample, global.init_audio);
    global.sample_oscillator = mod.exports;
  }
})(this, function (exports, _sample, _init_audio) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SampleOscillator = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

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
});

},{"./init_audio":21,"./sample":36}],39:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './instrument', './note', './parse_audio', './util', './fetch_helpers', './sample_buffer'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./instrument'), require('./note'), require('./parse_audio'), require('./util'), require('./fetch_helpers'), require('./sample_buffer'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.instrument, global.note, global.parse_audio, global.util, global.fetch_helpers, global.sample_buffer);
    global.sampler = mod.exports;
  }
})(this, function (exports, _instrument, _note, _parse_audio, _util, _fetch_helpers, _sample_buffer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Sampler = undefined;

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

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
});

},{"./fetch_helpers":19,"./instrument":23,"./note":29,"./parse_audio":30,"./sample_buffer":37,"./util":49}],40:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.samples = mod.exports;
  }
})(this, function (exports) {
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
});

},{}],41:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'filesaverjs'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('filesaverjs'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.filesaverjs);
    global.save_midifile = mod.exports;
  }
})(this, function (exports, _filesaverjs) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.saveAsMIDIFile = saveAsMIDIFile;


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
});

},{"filesaverjs":1}],42:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './init_midi', './init_audio', './midi_event', './util'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./init_midi'), require('./init_audio'), require('./midi_event'), require('./util'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.init_midi, global.init_audio, global.midi_event, global.util);
    global.scheduler = mod.exports;
  }
})(this, function (exports, _init_midi, _init_audio, _midi_event, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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

  exports.default = Scheduler;
});

},{"./init_audio":21,"./init_midi":22,"./midi_event":25,"./util":49}],43:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.settings = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.updateSettings = updateSettings;
  exports.getSettings = getSettings;

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

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
});

},{}],44:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './instrument', './sample_oscillator'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./instrument'), require('./sample_oscillator'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.instrument, global.sample_oscillator);
    global.simple_synth = mod.exports;
  }
})(this, function (exports, _instrument, _sample_oscillator) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SimpleSynth = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

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
});

},{"./instrument":23,"./sample_oscillator":38}],45:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './constants', './parse_events', './init_audio', './scheduler', './midi_event', './song_from_midifile', './util', './position', './playhead', './metronome', './eventlistener', './save_midifile', './song.update', './settings'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./constants'), require('./parse_events'), require('./init_audio'), require('./scheduler'), require('./midi_event'), require('./song_from_midifile'), require('./util'), require('./position'), require('./playhead'), require('./metronome'), require('./eventlistener'), require('./save_midifile'), require('./song.update'), require('./settings'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.constants, global.parse_events, global.init_audio, global.scheduler, global.midi_event, global.song_from_midifile, global.util, global.position, global.playhead, global.metronome, global.eventlistener, global.save_midifile, global.song, global.settings);
    global.song = mod.exports;
  }
})(this, function (exports, _constants, _parse_events, _init_audio, _scheduler, _midi_event, _song_from_midifile, _util, _position, _playhead, _metronome, _eventlistener, _save_midifile, _song, _settings) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Song = undefined;

  var _scheduler2 = _interopRequireDefault(_scheduler);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
});

},{"./constants":15,"./eventlistener":18,"./init_audio":21,"./metronome":24,"./midi_event":25,"./parse_events":31,"./playhead":33,"./position":34,"./save_midifile":41,"./scheduler":42,"./settings":43,"./song.update":46,"./song_from_midifile":47,"./util":49}],46:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './parse_events', './util', './constants', './position', './midi_event', './eventlistener'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./parse_events'), require('./util'), require('./constants'), require('./position'), require('./midi_event'), require('./eventlistener'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.parse_events, global.util, global.constants, global.position, global.midi_event, global.eventlistener);
    global.songUpdate = mod.exports;
  }
})(this, function (exports, _parse_events, _util, _constants, _position, _midi_event, _eventlistener) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.update = update;
  exports._update = _update;

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

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
});

},{"./constants":15,"./eventlistener":18,"./midi_event":25,"./parse_events":31,"./position":34,"./util":49}],47:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'isomorphic-fetch', './midifile', './midi_event', './part', './track', './song', './util', './fetch_helpers', './settings'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('isomorphic-fetch'), require('./midifile'), require('./midi_event'), require('./part'), require('./track'), require('./song'), require('./util'), require('./fetch_helpers'), require('./settings'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.isomorphicFetch, global.midifile, global.midi_event, global.part, global.track, global.song, global.util, global.fetch_helpers, global.settings);
    global.song_from_midifile = mod.exports;
  }
})(this, function (exports, _isomorphicFetch, _midifile, _midi_event, _part, _track, _song, _util, _fetch_helpers, _settings) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.songFromMIDIFileSync = songFromMIDIFileSync;
  exports.songFromMIDIFile = songFromMIDIFile;

  var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

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
});

},{"./fetch_helpers":19,"./midi_event":25,"./midifile":28,"./part":32,"./settings":43,"./song":45,"./track":48,"./util":49,"isomorphic-fetch":2}],48:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './part', './midi_event', './midi_note', './init_midi', './util', './init_audio', './qambi', './eventlistener'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./part'), require('./midi_event'), require('./midi_note'), require('./init_midi'), require('./util'), require('./init_audio'), require('./qambi'), require('./eventlistener'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.part, global.midi_event, global.midi_note, global.init_midi, global.util, global.init_audio, global.qambi, global.eventlistener);
    global.track = mod.exports;
  }
})(this, function (exports, _part, _midi_event, _midi_note, _init_midi, _util, _init_audio, _qambi, _eventlistener) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Track = undefined;

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
});

},{"./eventlistener":18,"./init_audio":21,"./init_midi":22,"./midi_event":25,"./midi_note":26,"./part":32,"./qambi":35,"./util":49}],49:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'isomorphic-fetch'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('isomorphic-fetch'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.isomorphicFetch);
    global.util = mod.exports;
  }
})(this, function (exports, _isomorphicFetch) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getNiceTime = getNiceTime;
  exports.base64ToBinary = base64ToBinary;
  exports.typeString = typeString;
  exports.sortEvents = sortEvents;
  exports.checkIfBase64 = checkIfBase64;
  exports.getEqualPowerCurve = getEqualPowerCurve;
  exports.checkMIDINumber = checkMIDINumber;

  var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

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
});

},{"isomorphic-fetch":2}]},{},[35])(35)
});