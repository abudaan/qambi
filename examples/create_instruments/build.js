(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var base64 = exports.base64 = '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Mw0KCQICYnM3X3B+ukyVjw3/+xBEmo/wjwlUgekoSg9BKjA9JwlCCBlWBjEiaDkEqUDEiFTxMSICQTIxNt7jProHwkEZbUKS5AgUalEwU1raJmchG0+Ki4IQYalBYUWofATbEIbLNkYTQkbrDQ1pR1BNWYi9CfTj/f/7EEScj/CHCVSBiRC6DkEqQDDFFwH0JVIHpGEgOQTpAPMIXEmp4VxWqooO5RjcdQqPQsI2zU3jeWmP2icKtpRp1PSYIty7mL549i8QS4Mlyu5JSrDhRYewoaK0hIESg8afYKAUIQx9//sQRKAP8JEJ1QHpMJoPYTpAMGVDAgglUgekQSA9BKjA9JQkQ1tFKkkzK/R7rSTVT8Ll4qCdVCSzOJk0DbOHRMu+3iqCtASEoMQ4HYtrTZYfNnkqQbtIAAsMQ4HY3WlowPkxnmOLUhD/+xBEoY/wjAbUgeZgmA7hGjA9IxdCBB9UB7Bg4D8EqMD0jFSF6xqQeQjInMhROrPcq9s2HRbWEMYiBg8kHbq4k42bDbTQ8MAWRyAUo5iHhXEGvuqO9NMy8J22BaKiPCuYjooQTMMgSP/7EESjD/CICVUBhhBAEAE6MDEnJQIcGVQHpSJoPoSpAPSMVHg0RD7J5deh4YQpywlMyiDZIKJBxqnvHwwyqygL4hJECF4XNWQNSC8GdxxQIh6pDCryMTRCNCHw900sYxTIDgRaXbDJ//sQRKQP8IAI1QGJEEoOwSowPSUJAfAjVAYkQShBBKiAxhhUaEswQdw43iThj91bZrklQgbi7aYCNcGlWQ/DjaiRwl9iQwKyRJJdIEmTiTngqILQfl9aeGn4aO4tAD0zqUaLgAmVKy3/+xBEpo/whwlVAewwGA8BOjA8wSkCKCVSBjBBIDoE6QCTFJRi/oDJJiHKOoIcVww15SmQoVLKbzIYapkCn18pGYaS02Lv88AAVCopJUOBQS78grIKttoAAFCgIL4VTEFNRTMuOTlVVf/7EESoj/CGCVUB5hIIDmEqQD0iCQIQI1QGMEEgQASowJYYHFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQRKqP8IcI1IGGSAgPIRpAMMYBAiQjUgekwKg5hKkA9JhEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBErI/wiAlVAYkQuA8BKkAwwxUB/CNUB6RhIDsEqQD0jFRVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EESvAACzCdQFPCAKFOE6IKeEAQSoM0gZhAAAeIZoAx5gAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQRJmP8IADTMckwAoI4Dp04YABwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

},{}],2:[function(require,module,exports){
'use strict';

var _qambi = require('../../src/qambi');

var _qambi2 = _interopRequireDefault(_qambi);

var _parse_audio = require('../../src/parse_audio');

var _sample = require('./sample');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import a base64 encoded audio file

document.addEventListener('DOMContentLoaded', function () {

  var test = 5;
  var instrument = new _qambi.Instrument();

  if (test === 1) {

    (0, _parse_audio.parseSamples)({ 50: _sample.base64 })
    //parseSamples(base64)
    .then(function (data) {
      var buffer = data['50']; // sample is stored in the result object with the same key, so '50' in this case
      //let buffer = data[0]
      if (typeof buffer === 'undefined') {
        console.log('error loading sample');
      }

      instrument.updateSampleData({
        note: 50,
        buffer: buffer,
        release: [0, 'linear']
      }, {
        note: 52,
        buffer: buffer,
        release: [5, 'linear']
      });
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 0, 144, 50, 100));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 1, 128, 50, 0));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 2, 144, 52, 100));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 3, 128, 52, 0));
    });
  } else if (test === 2) {

    (0, _parse_audio.parseSamples)({ 50: '../data/B0-49-96.wav' }).then(function (data) {

      var buffer = data['50']; // sample is stored in the result object with the same key, so '50' in this case
      if (typeof buffer === 'undefined') {
        console.log('error loading sample 50');
      }

      instrument.updateSampleData({
        note: 50,
        buffer: buffer,
        release: [4, 'linear']
      });
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 0, 144, 50, 100));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 1, 128, 50, 0));

      setTimeout(function () {
        var envelope = new Array(100).fill(1);
        envelope = envelope.map(function (value, index) {
          if (index % 2 === 0) {
            return 0.3;
          }
          return value;
        });

        // update envelope of note 50
        instrument.updateSampleData({
          note: 50,
          release: [4, envelope]
        });
        instrument.processMIDIEvent(new _qambi.MIDIEvent(0, 144, 50, 100));
        instrument.processMIDIEvent(new _qambi.MIDIEvent(200, 128, 50, 0));
      }, 2000);
    });
  } else if (test === 3) {

    (0, _parse_audio.parseSamples)('../data/B0-49-96.wav', '../data/TP01d-ElectricPiano-000-060-c3.wav')
    //parseSamples(['../../data/B0-49-96.wav', '../../data/TP01d-ElectricPiano-000-060-c3.wav']) -> not recommended
    //parseSamples({40: '../../data/B0-49-96.wav'})
    //parseSamples('../../data/B0-49-96.wav')
    .then(function (data) {
      //console.log(data)
      data.forEach(function (d) {
        if (typeof d === 'undefined') {
          console.log('error loading sample');
        }
      });

      var buffer1 = data[0];
      var buffer2 = data[1];

      instrument.updateSampleData({
        note: 60,
        buffer: buffer1,
        sustain: [0],
        release: [4, 'equal_power'],
        velocity: [0, 101],
        pan: -1
      });

      instrument.updateSampleData({
        note: 60,
        sustain: [25, 2500],
        velocity: [0, 1]
      });

      instrument.updateSampleData({
        note: 60,
        buffer: buffer2,
        velocity: [101, 127]
      });

      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 0, 144, 60, 100));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 1, 128, 60, 0));

      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 2, 144, 60, 101));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 3, 128, 60, 0));
    });
  } else if (test === 4) {

    var json = {
      60: {
        url: '../data/TP01d-ElectricPiano-000-060-c3.wav',
        sustain: [0],
        release: [20, 'equal_power']
      },
      62: '../data/TP01d-ElectricPiano-000-060-c3.wav',
      64: _sample.base64,
      release: [2, 'equal_power']
    };

    instrument.parseSampleData(json).then(function () {
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 0, 144, 60, 100));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 1, 128, 60, 0));

      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 2, 144, 62, 100));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 3, 128, 62, 0));

      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 4, 144, 64, 100));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 5, 128, 64, 0));
    });
  } else if (test === 5) {

    var rhodes = {
      release: [4, 'equal_power'],
      baseUrl: 'https://raw.githubusercontent.com/abudaan/qambi-instruments/master/samples/rhodes/', // tells us where to find the samples
      28: 'FreesoundRhodes-000-028-e0.mp3',
      29: 'FreesoundRhodes-000-029-f0.mp3',
      30: 'FreesoundRhodes-000-030-f#0.mp3',
      31: 'FreesoundRhodes-000-031-g0.mp3',
      32: 'FreesoundRhodes-000-032-g#0.mp3',
      33: 'FreesoundRhodes-000-033-a0.mp3',
      34: 'FreesoundRhodes-000-034-a#0.mp3',
      35: 'FreesoundRhodes-000-035-h0.mp3',
      36: 'FreesoundRhodes-000-036-c1.mp3',
      37: 'FreesoundRhodes-000-037-c#1.mp3',
      38: 'FreesoundRhodes-000-038-d1.mp3',
      39: 'FreesoundRhodes-000-039-d#1.mp3',
      40: 'FreesoundRhodes-000-040-e1.mp3',
      41: 'FreesoundRhodes-000-041-f1.mp3',
      42: 'FreesoundRhodes-000-042-f#1.mp3',
      43: 'FreesoundRhodes-000-043-g1.mp3',
      44: 'FreesoundRhodes-000-044-g#1.mp3',
      45: 'FreesoundRhodes-000-045-a1.mp3',
      46: 'FreesoundRhodes-000-046-a#1.mp3',
      47: 'FreesoundRhodes-000-047-h1.mp3',
      48: 'FreesoundRhodes-000-048-c2.mp3',
      49: 'FreesoundRhodes-000-049-c#2.mp3',
      50: 'FreesoundRhodes-000-050-d2.mp3',
      51: 'FreesoundRhodes-000-051-d#2.mp3',
      52: 'FreesoundRhodes-000-052-e2.mp3',
      53: 'FreesoundRhodes-000-053-f2.mp3',
      54: 'FreesoundRhodes-000-054-f#2.mp3',
      55: 'FreesoundRhodes-000-055-g2.mp3',
      56: 'FreesoundRhodes-000-056-g#2.mp3',
      57: 'FreesoundRhodes-000-057-a2.mp3',
      58: 'FreesoundRhodes-000-058-a#2.mp3',
      59: 'FreesoundRhodes-000-059-h2.mp3',
      60: 'FreesoundRhodes-000-060-c3.mp3',
      61: 'FreesoundRhodes-000-061-c#3.mp3',
      62: 'FreesoundRhodes-000-062-d3.mp3',
      63: 'FreesoundRhodes-000-063-d#3.mp3',
      64: 'FreesoundRhodes-000-064-e3.mp3',
      65: 'FreesoundRhodes-000-065-f3.mp3',
      66: 'FreesoundRhodes-000-066-f#3.mp3',
      67: 'FreesoundRhodes-000-067-g3.mp3',
      68: 'FreesoundRhodes-000-068-g#3.mp3',
      69: 'FreesoundRhodes-000-069-a3.mp3',
      70: 'FreesoundRhodes-000-070-a#3.mp3',
      71: 'FreesoundRhodes-000-071-h3.mp3',
      72: 'FreesoundRhodes-000-072-c4.mp3',
      73: 'FreesoundRhodes-000-073-c#4.mp3',
      74: 'FreesoundRhodes-000-074-d4.mp3',
      75: 'FreesoundRhodes-000-075-d#4.mp3',
      76: 'FreesoundRhodes-000-076-e4.mp3',
      77: 'FreesoundRhodes-000-077-f4.mp3',
      78: 'FreesoundRhodes-000-078-f#4.mp3',
      79: 'FreesoundRhodes-000-079-g4.mp3',
      80: 'FreesoundRhodes-000-080-g#4.mp3',
      81: 'FreesoundRhodes-000-081-a4.mp3',
      82: 'FreesoundRhodes-000-082-a#4.mp3',
      83: 'FreesoundRhodes-000-083-h4.mp3',
      84: 'FreesoundRhodes-000-084-c5.mp3',
      85: 'FreesoundRhodes-000-085-c#5.mp3',
      86: 'FreesoundRhodes-000-086-d5.mp3',
      87: 'FreesoundRhodes-000-087-d#5.mp3',
      88: 'FreesoundRhodes-000-088-e5.mp3',
      89: 'FreesoundRhodes-000-089-f5.mp3',
      90: 'FreesoundRhodes-000-090-f#5.mp3',
      91: 'FreesoundRhodes-000-091-g5.mp3',
      92: 'FreesoundRhodes-000-092-g#5.mp3',
      93: 'FreesoundRhodes-000-093-a5.mp3',
      94: 'FreesoundRhodes-000-094-a#5.mp3',
      95: 'FreesoundRhodes-000-095-h5.mp3',
      96: 'FreesoundRhodes-000-096-c6.mp3',
      97: 'FreesoundRhodes-000-097-c#6.mp3',
      98: 'FreesoundRhodes-000-098-d6.mp3',
      99: 'FreesoundRhodes-000-099-d#6.mp3',
      100: 'FreesoundRhodes-000-100-e6.mp3'
    };

    instrument.parseSampleData(rhodes).then(function () {
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 0, 144, 60, 100));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 1, 128, 60, 0));

      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 2, 144, 62, 100));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 3, 128, 62, 0));

      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 4, 144, 64, 100));
      instrument.processMIDIEvent(new _qambi.MIDIEvent(960 * 5, 128, 64, 0));
    });
  }
});

},{"../../src/parse_audio":19,"../../src/qambi":24,"./sample":1}],3:[function(require,module,exports){
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

},{"whatwg-fetch":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./init_audio":10,"./init_midi":11,"./instrument":12,"./qambi":24,"./song":30}],10:[function(require,module,exports){
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

},{"./parse_audio":19,"./samples":26}],11:[function(require,module,exports){
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

},{"./util":33}],12:[function(require,module,exports){
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

},{"./eventlistener":7,"./fetch_helpers":8,"./init_audio":10,"./note":18,"./parse_audio":19,"./sample":25,"./util":33}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Metronome = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _track = require('./track');

var _part2 = require('./part');

var _parse_events = require('./parse_events');

var _midi_event = require('./midi_event');

var _util = require('./util');

var _position = require('./position');

var _instrument = require('./instrument');

var _init_audio = require('./init_audio');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var methodMap = new Map([['volume', 'setVolume'], ['instrument', 'setInstrument'], ['noteNumberAccentedTick', 'setNoteNumberAccentedTick'], ['noteNumberNonAccentedTick', 'setNoteNumberNonAccentedTick'], ['velocityAccentedTick', 'setVelocityAccentedTick'], ['velocityNonAccentedTick', 'setVelocityNonAccentedTick'], ['noteLengthAccentedTick', 'setNoteLengthAccentedTick'], ['noteLengthNonAccentedTick', 'setNoteLengthNonAccentedTick']]);

var Metronome = exports.Metronome = function () {
  function Metronome(song) {
    _classCallCheck(this, Metronome);

    this.song = song;
    this.track = new _track.Track(this.song.id + '_metronome');
    this.part = new _part2.Part();
    this.track.addParts(this.part);
    this.track.connect(this.song._output);

    this.events = [];
    this.precountEvents = [];
    this.precountDuration = 0;
    this.bars = 0;
    this.index = 0;
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
      return this.events;
    }
  }, {
    key: 'createPrecountEvents',
    value: function createPrecountEvents(precount, timeStamp) {
      if (precount <= 0) {
        return -1;
      }

      this.timeStamp = timeStamp;

      //   let songStartPosition = this.song.getPosition()

      var songStartPosition = (0, _position.calculatePosition)(this.song, {
        type: 'millis',
        target: this.song._currentMillis,
        result: 'all'
      });

      var endPos = (0, _position.calculatePosition)(this.song, {
        type: 'barsbeats',
        target: [songStartPosition.bar + precount],
        result: 'all'
      });

      //console.log(songStartPosition, endPos)

      this.precountIndex = 0;
      this.startMillis = songStartPosition.millis;
      this.endMillis = endPos.millis;
      this.precountDuration = endPos.millis - this.startMillis;

      //console.log(this.precountDuration)

      this.precountEvents = this.createEvents(songStartPosition.bar, endPos.bar - 1, 'precount');
      this.precountEvents = (0, _parse_events.parseEvents)([].concat(_toConsumableArray(this.song._timeEvents), _toConsumableArray(this.precountEvents)));

      //console.log(songStartPosition.bar, endPos.bar, precount, this.precountEvents.length);
      //console.log(this.precountEvents, this.precountDuration);
      return this.precountDuration;
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
      this.song._scheduler.updateSong();
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

},{"./init_audio":10,"./instrument":12,"./midi_event":14,"./parse_events":20,"./part":21,"./position":23,"./track":32,"./util":33}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{"./util":33}],19:[function(require,module,exports){
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

},{"./eventlistener":7,"./init_audio":10,"./qambi":24,"./util":33,"isomorphic-fetch":4}],20:[function(require,module,exports){
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
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = events[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var event = _step2.value;

      if (typeof event._part === 'undefined' || typeof event._track === 'undefined') {
        console.log('no part and/or track set');
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

},{"./midi_note":15,"./util":33}],21:[function(require,module,exports){
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
        var _song$_newEvents;

        (_song$_newEvents = this._song._newEvents).push.apply(_song$_newEvents, events);
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

},{"./util":33}],22:[function(require,module,exports){
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

},{"./eventlistener.js":7,"./position.js":23,"./util.js":33}],23:[function(require,module,exports){
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

},{"./util":33}],24:[function(require,module,exports){
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
  version: '1.0.0-beta15',

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

},{"./constants":6,"./eventlistener":7,"./init":9,"./init_audio":10,"./init_midi":11,"./instrument":12,"./midi_event":14,"./midi_note":15,"./midifile":17,"./parse_audio":19,"./part":21,"./settings":29,"./song":30,"./track":32}],25:[function(require,module,exports){
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

},{"./init_audio.js":10,"./util.js":33}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{"filesaverjs":3}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_midi = require('./init_midi');

var _init_audio = require('./init_audio');

var _midi_event = require('./midi_event');

var _settings = require('./settings');

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
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var event = _step.value;

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
        events = this.song._metronome.getPrecountEvents(this.maxtime);

        if (this.maxtime > this.song._metronome.endMillis && this.precountingDone === false) {
          var _events;

          this.precountingDone = true;
          this.timeStamp += this.song._metronome.precountDuration;

          // start scheduling events of the song -> add the first events of the song
          this.songCurrentMillis = this.songStartMillis;
          this.songCurrentMillis += diff;
          this.maxtime = this.songCurrentMillis + _settings.bufferTime;
          (_events = events).push.apply(_events, _toConsumableArray(this.getEvents()));
        }
      } else {
        this.songCurrentMillis += diff;
        this.maxtime = this.songCurrentMillis + _settings.bufferTime;
        events = this.getEvents();
        //console.log('done', this.songCurrentMillis, diff, this.index, events.length)
      }

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

},{"./init_audio":10,"./init_midi":11,"./midi_event":14,"./settings":29}],29:[function(require,module,exports){
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
  loop: false,
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

},{}],30:[function(require,module,exports){
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
    var _settings$loop = settings.loop;
    this.loop = _settings$loop === undefined ? _settings.defaultSong.loop : _settings$loop;
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

    // prepare song events for playback

  }, {
    key: 'update',
    value: function update() {
      var _this3 = this;

      var createEventArray = false;

      if (this._updateTimeEvents === false && this._removedEvents.length === 0 && this._newEvents.length === 0 && this._movedEvents.length === 0 && this._newParts.length === 0 && this._removedParts.length === 0) {
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

      console.log('last tick', this._lastEvent.ticks, this._lastEvent.millis);

      this._durationTicks = this._lastEvent.ticks;
      this._durationMillis = this._lastEvent.millis;
      this._playhead.updateSong();

      if (this.playing === false) {
        this._playhead.set('millis', this._currentMillis);
      }

      // add metronome events
      if (this._updateMetronomeEvents || this._metronome.bars !== this.bars) {
        this._metronomeEvents = (0, _parse_events.parseEvents)([].concat(_toConsumableArray(this._timeEvents), _toConsumableArray(this._metronome.getEvents())));
      }
      this._allEvents = [].concat(_toConsumableArray(this._metronomeEvents), _toConsumableArray(this._events));
      (0, _util.sortEvents)(this._allEvents);
      //console.log('all events %O', this._allEvents)

      this._newParts = [];
      this._removedParts = [];
      this._newEvents = [];
      this._movedEvents = [];
      this._removedEvents = [];

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

      this._reference = this._timeStamp = _init_audio.context.currentTime * 1000;
      this._scheduler.setTimeStamp(this._reference);
      this._startMillis = this._currentMillis;

      if (this._precountBars > 0 && this._preparedForRecording) {
        this._endPrecountMillis = this._currentMillis + this._metronome.createPrecountEvents(this._precountBars, this._reference);
        //console.log('endPrecountMillis', this._endPrecountMillis)
        this.precounting = true;
      } else {
        this._endPrecountMillis = 0;
        this.playing = true;
        this.recording = this._preparedForRecording;
      }

      if (this.paused) {
        this.paused = false;
      }

      this._scheduler.init(this._currentMillis);
      this._playhead.set('millis', this._currentMillis);
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

      (0, _eventlistener.dispatchEvent)({
        type: 'position',
        data: position
      });

      if (wasPlaying) {
        this._play();
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

      if (this._currentMillis >= this._durationMillis) {
        this.stop();
        return;
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
          target = args[0] || 0;
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

},{"./constants":6,"./eventlistener":7,"./init_audio":10,"./metronome":13,"./midi_event":14,"./parse_events":20,"./playhead":22,"./position":23,"./save_midifile":27,"./scheduler":28,"./settings":29,"./song_from_midifile":31,"./util":33}],31:[function(require,module,exports){
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

},{"./fetch_helpers":8,"./midi_event":14,"./midifile":17,"./part":21,"./song":30,"./track":32,"./util":33,"isomorphic-fetch":4}],32:[function(require,module,exports){
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

},{"./init_audio":10,"./init_midi":11,"./instrument":12,"./midi_event":14,"./midi_note":15,"./part":21,"./qambi":24,"./util":33}],33:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjcmVhdGVfaW5zdHJ1bWVudHMvc2FtcGxlLmpzIiwiaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZmlsZXNhdmVyanMvRmlsZVNhdmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtZmV0Y2gvZmV0Y2gtbnBtLWJyb3dzZXJpZnkuanMiLCIuLi9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwiLi4vc3JjL2NvbnN0YW50cy5qcyIsIi4uL3NyYy9ldmVudGxpc3RlbmVyLmpzIiwiLi4vc3JjL2ZldGNoX2hlbHBlcnMuanMiLCIuLi9zcmMvaW5pdC5qcyIsIi4uL3NyYy9pbml0X2F1ZGlvLmpzIiwiLi4vc3JjL2luaXRfbWlkaS5qcyIsIi4uL3NyYy9pbnN0cnVtZW50LmpzIiwiLi4vc3JjL21ldHJvbm9tZS5qcyIsIi4uL3NyYy9taWRpX2V2ZW50LmpzIiwiLi4vc3JjL21pZGlfbm90ZS5qcyIsIi4uL3NyYy9taWRpX3N0cmVhbS5qcyIsIi4uL3NyYy9taWRpZmlsZS5qcyIsIi4uL3NyYy9ub3RlLmpzIiwiLi4vc3JjL3BhcnNlX2F1ZGlvLmpzIiwiLi4vc3JjL3BhcnNlX2V2ZW50cy5qcyIsIi4uL3NyYy9wYXJ0LmpzIiwiLi4vc3JjL3BsYXloZWFkLmpzIiwiLi4vc3JjL3Bvc2l0aW9uLmpzIiwiLi4vc3JjL3FhbWJpLmpzIiwiLi4vc3JjL3NhbXBsZS5qcyIsIi4uL3NyYy9zYW1wbGVzLmpzIiwiLi4vc3JjL3NhdmVfbWlkaWZpbGUuanMiLCIuLi9zcmMvc2NoZWR1bGVyLmpzIiwiLi4vc3JjL3NldHRpbmdzLmpzIiwiLi4vc3JjL3NvbmcuanMiLCIuLi9zcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwiLi4vc3JjL3RyYWNrLmpzIiwiLi4vc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0FPLElBQU0sMEJB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QUE0QixFQUE1QixFQUFnQyxHQUFoQyxDQUE1QjtBQUNBLGlCQUFXLGdCQUFYLENBQTRCLHFCQUFjLE1BQU0sQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEIsRUFBNUIsRUFBZ0MsQ0FBaEMsQ0FBNUI7QUFDRCxLQVZIO0FBWUQ7QUFFRixDQTVPRDs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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NUM7QUFDRDtBQUNELFdBQU8sQ0FBUCxJQUFZLEtBQVo7QUFDQSxRQUFHLE1BQU0sV0FBVyxDQUFwQixFQUFzQjtBQUNwQixhQUFPLENBQVAsSUFBWSxTQUFTLFFBQVQsR0FBb0IsQ0FBcEIsR0FBd0IsQ0FBcEM7QUFDRDtBQUNGO0FBQ0QsU0FBTyxNQUFQO0FBQ0Q7O0FBR00sU0FBUyxlQUFULENBQXlCLEtBQXpCLEVBQStCOztBQUVwQyxNQUFHLE1BQU0sS0FBTixDQUFILEVBQWdCO0FBQ2QsWUFBUSxJQUFSLENBQWEseUJBQWI7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNELE1BQUcsUUFBUSxDQUFSLElBQWEsUUFBUSxHQUF4QixFQUE0QjtBQUMxQixZQUFRLElBQVIsQ0FBYSwyQ0FBYjtBQUNBLFdBQU8sS0FBUDtBQUNEO0FBQ0QsU0FBTyxLQUFQO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGNvbnN0IGJhc2U2NCA9ICcvL3VRUkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFXR2x1WndBQUFBOEFBQUJ3QUFBdklRQUVCZ2tMRFJBU0ZCa2JIU0FpSkNZcExUQXlORFk1T3oxQ1JFWkpTMDFRVWxSWlcxMWdZbVJtYVcxd2NuUjJlWHQ5Z29TR2lZdU5rSktVbVp1ZG9LS2twcW10c0xLMHRybTd2Y0xFeHNuTHpkRFMxTm5iM2VEaTVPYnA3ZkR5OVBiNSsvMEFBQUE4VEVGTlJUTXVPVGtnQks4QUFBQUFMSHNBQURVZ0pBVUFUUUFCekFBQUx5SHIzNkdYQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBLy9zUVJBQUFBQzhBejZVRUFBZ0FBQW13b0FBQkFweERZaGlDZ0FCT0NDcURFRkFBbzJBQUFBOGc3N0ZoLzI0TXlGMHgxRTNrUVVFdVFjZ0tESjQyYjJMRC8zQm1RdW5WRTNrUVVFdXpJQ2d6T2hXQjR1Q3dCQ2xWYUJDai9sL3ByV0VXNFpvcWc0di8reEJFQ28vd21BOVpCeVNnQUJEaDZzRGtpQUFDVERGbUJKaEN3RGVHYTBDVENDU0lnb3BWV2dpai9yL1RkaXR4dEZRS0pCWXFFbzJXZUE2SlkwRXljd0ZVNm1YR0VnRVdSblhQSjFXTlJ2TUt5Q29haDFMU05HNmlhZEh6RHpnZFBFWWpxZmFOQ2YvN0VFUUtEL0NSQjltQmhoZ3dFRUNxMENSRElBSkFPMllFaEV4QVFvUHJBR1NZU0ZOcFZseGdyQ05KOUJaU3FteU5jeTVBOEtLMmkxR1NyZGMrek50bkwwRlNtaXdSTUtSdEZwNFRYc09zbWJhNklwUkFMQWlTb3hKYmhGdndOYmdrdWtQWDlVQlkvL3NRUkFtUDhJa0lXWUVtTUtBUTRRckFKTVVVQWtRbFpnV2tZTUJDQStzQXd5QVFLbVVZa3ZoQ3JDeDZna0wwaDYvcUZSSEtYY2NZYkM1emNSc1BPS0pGMlFlM0RRYmlMZWNJSGdyZU56Q3oxUkc0TFYxRUNoR1hGRFNjQ0VVZXlsN0d5dnRSQ0JmLyt4QkVDUS93ZWdmYWdTRXhBQTVBK3VBa0ppQUNXRHRrQktSa3dFQUhhd0NVaUJoY2dlbkFpWjdLWHNDVnZ0RDRCeFZyREdwb3d6ZnN0bURqMHVIRDRJcUd3dWlmakdxekRKY00wR24zUjZDS2xWZ3lPMjE2dGtjRWh5cEtvUWVBaTUrbXB3U1Jwdi83RUVRS2ovQ01CMW1CaURFUUQ0REswQ1JwSUFJUURXWUVwTUFBUUFTckFKTU1HTnRzRTBlZTRXb1JLRGJhYWl3Q2lnUWdsQlVFQXdYUEVBSXU3azZob0JRUUZNcXJoVUxjVndZQ2JsWk9wUldIenEvRi9RajBoRGd4OEVUYVN0ekZiNlFYQXB5OC8vc1FSQXVQOEpZUFdRR0RFZEFRZ2VyQUpHSWFBZlFkYUFTWVFRQS9CQ3RBa3dBb2NsRm1RMUJueFRVM3BqNzZSQ0dCZ09GcFpESkpYQm5PWUhyYjFncUdCZ09GMWhUYlQ4dEE1bUI2L0tvb0VnR2pseStCakk4REdqdTVRbWNMZUdTZ3V1NURDYVQvK3hCRURBL3dqZ25aQVNZUVVBOUJPdEFrSmhRQ0ZFMW9CQVJOQUQ4RXEwQ1JpVUJYOEJzWmUxS2kzaGtPd0lIS3gxa3VOTWVTRGQ1YjhQTmNFakJoRkY3V3hleXh0QkxqNVpWMGxWVWFSTkk2VWQ0ck9nNzF4UVgyRzk4UXY0ZUZZdEgxUWJ5eVVmLzdFRVFORC9DU0ROa0JoaGt3RUdENndDMG1BZ0pNVFdRRW9FTUFRb1NyQUpHY3lGTzg0ZXM4ZmhIOGtGQW9nTlNmWmJrc2ZraGFIYlo1Wjllbmd4UU1JR3JiMWR4TFBLaHFWekpVRDlsYUhvS1Z0ZmM1YjVzNjlDeVZHY2xvN3NMZVJHb2RRbHJRLy9zUVJBd1A4SllNMlFHRkVvQVJRWnJBTU1JS0FqZ2paZ1NZNUVBN2hLdUFZd2dvNk5qODNnY1ZHZHJSN0MzcEVaRUVDUVRxeFVERmVhSFNnd1ZoR0wrd0hKRENBZVlyRUozeUdvTmxHcjlWR0FGYXp6TUYwVEhwUWgwQ3BlUUd6azNXU2lWZEZ4ai8reEJFQzQvd2p3ZFpBTVlRUUEvaE9zQWt3QTFCN0I5bUJZeEF3RHVENndEQkNFQUdrbW5YS1I5SXJzSWI4Q2daRHNnMEV3UmFDRnJOcGpvbDlvV0RkNWRHaUVFTzBJTG0weDByN1VZK0RjcEJ0Qi9KcHZHZFpCOHZTbU5rRFFrRnl4cW0xS1hpb2YvN0VFUU5qL0NLRDFrQmlCRFFEcUVxMENRaUlBSTBHV0lIbU1CQVBnU3JBTU1NVUFYcVZkUldiSkowRWNHNkxzT21vdWVCcDdpcHRYbEJyQ3R4WmlPZ2QwNWRGYkNzcWxYcUZBcVFDQUlQdERER3hqYzR1M21DNjdhYWhJS2tBUkM3TVUxZGpWY1cvL3NRUkE4UDhKSUpXSUVtTUtBUUlTcXdKTVlBQWp3aFpBU01DZ0E2aEt0QWt3Z1FuTUYvVFVJZ2ZCa1ZFekRQcE04NlVRZER6cFMrK3NhRDQwa2RtWFVacWlJV2FvVmYxaDNud21ZWThpNEFVeklNd0toSGJicC9oWEJjdlB3T2IwT0xrcEJMQW1MLyt4QkVENC93bEJQWWdlWVFRQTZCS3NBd0lrQUNIQ1ZrQktCRXdEZ0Vxd0NURkNnZjZ3RlBMakE0aVVwUXF5WlJjY1NsNnFmVUFwbXhBWTdEcFZVYzY3Z3VuOVVGQVNEVm5QcWVMaDJLRHdhVzNTVmVIQVVEUk53VG0rOHRBMk5NdHVjUzlqbVRWLy83RUVRUmovQ0lDTmtCSmhEQUR5RWF3Q1JsRmdJSUlXUUhtQUZBT3dTckFNR0lHRG9EMEpWRTF6MWdtdVhxZFJMcWdoMkVEc0FvVFljZUVPdXR5dldxRTBjemlJZDV4ejJsYkhobU9ZUW5ubGF0bzFsZGg0OTFnMXE3Wnd6Q3R5eWJyS3dvREFaTS8vc1FSQk9QOEpNSTJRR0pNQkFRWVNyQU1HWWlBaHdsWkFTVXdnQTloR3NBa29sQXdmRDFCNjN5RzU3bHBCcXZVU0JnbFp3M2krUGEzREljKytDZjdBZXVzY1NFSlVNUmVGU284THhkaEgyQmRlanJtZEU3RU04TXNLUHhkaEgyRXNIQnNWaG1jdEQvK3hCRUZBL3dnd1haQVlNd2tBL0JHc0F3UWtBQ0lDTmlCaVRBUUQyRWFzREJtTXllcjVRL1RIMkRxZmFaaWhzN01iODFCNmZZZnBqNHFCS2FRZ09GVVdTczlBZzZYRkpjeU1hVDMyaUVGelRaWjFpeUJnL2NHdU8wTFcvckJRSkJ0ZUVTYUJaRUovLzdFRVFWai9DRkI5a0JKaEF3RUdFcXNDVEZGQUlFSldJRnBNQWdQWVNxd01NVUdIdXpnZFRxekFvRndXV2hLY0Z5SzZvb1dTNWFQb29tQUtIZ3FBZDdJaFV4eTBBUmE4c1o3YWhVQ0lnQWd1N1Uwam5zWUNPV0kvVUZZTklyUERZZXFGdTdETU9nLy9zUVJCY1A4STRJV0lFbUFNQVBZUXF3Sk1BS0Fpd2xZZ1dZd0VBN2hLckFzeGd0Q0dpai9xQ3NUS1BKbzRlcUUvMkdjVWdzdGhVOElCWVN4VW9GTURob29HZ2Q1cS9yRW9VQmdMbkxZT1NJNjRwQzFabWxQdnJMRDRzTVJDTU9RSkt6MG1kV2pYdi8reEJFR0Evd2dBVllnU3d3QUJGQktwQWtJMEFCK0NGa0JKZ0JRRDJFS3NDVEFDaHJCNFRpMFRRaktRSkt6MEhEWmVuOWFpWmxnUktvMlVsWWlVMUM0ajFLUGpWdG51b0J3SWFRbzhwV0xMWGNjeGk3cmIrb2NSUEdaVEsyUE1WZmFoNGRLT3RXM3YvN0VFUVpqL0NZQ1ZnQjZVZ3dEOEVxc0NRbVFBSVlIV0lHQkVnQVJJT3FnTVNJRUtGSW5oTVBrU2pSeWNVME93T2xIV3p2VlFVQlFnT2dKMGtNVU0yd2RLbkNsVzdyRGdnTEZWQk9yQ0ZFTTBPaWNrS1ZNczZ6SURMclorL3FrMkpVQlNzM2M5RzYvL3NRUkJrUDhJZ0pXSUVtT0VBUmdTcVFNTWNVQWdBZllnWUVwa0JBaEdxQXdKVEkwbEFaVzNMYitxWHFnTEVadUdubzNXb0gyZ2daQm9VSXdjdllJK0lIdlNHL3FGWjhFRHdpeHh6RFQ5Z2dPZ2g3eTRML1VDQU0wc1FuSWRFSVYrNGZjYU83QUVqLyt4QkVHWS93aGdkWkFTWVFzQkhoS3FBeElnZ0I1Q2RnQkpoaGFENkVxa0NUSEZBUjNUbHlGaEtCbW9mUEdDRVcvVlVxa2NtVEFaSXVJTFEraXBrbEFUTzYwZXlXZThUclhDVDNiVVZqUGNnS1g5Wm1KQXlRZ1ltc0NJRUU0YVVrMU5pY0RBZE9Fdi83RUVRYWovQ0VCOWlCNWhnZ0VHRXFvRDBpQ0FIWUYySUdHTUlnUllTcWdKTUlVRTlGRURCZUZFUVUyNGkvNjBTUDlGRXdkU1pZTE80SkNiSSt1NllVZ0hpVU1Lbm00V1hmQklHSHE3SEVnVU5LSUJYR1NqaUpDTWtkeVBpUlJUdW9LRTBFQXQ2Sy8vc1FSQndQOElBSDJBSG1LRW9RUVRxUU1LTkRBakF4WWdTTVJJQTRCS3JBa3dnZ3ZWTkNOY2RWSDZrbkJhTFIrUm01Z0dHb2V1ejlITk1QVURrS1NLZmVqY1RPMFhEQzQwTnBuM29HV1Q3V1FJSVRRT2Z1R3hHUGlZNnIxZytTck9WRUcwZW52NGYvK3hCRUhnL3dod25YZ1lnWktCQmhPcEF3UlVNQ0ZDVmVCNWloQURvRWFzRERDQ2lGSTQvOXFneVFFSUtDT2ZVU1JJSTlOcWNPeHNPZ2lnVkVBcmI2aVRURndZcW9pM0dYOUlIQWFBcWE2VFlpbU91ZEd1SmV0aE8vcUJ3VENiM1UxazNWSExESHJmLzdFRVFmai9DREI5Z0JLVWdJRU1HYWtDVWlDQUkwSldBRWhHZ0FQZ1Nxd0pBVkFJRzcrcW8veDBwbkJBU1RSdElMeXdZMEJQWUhQelNqSGpxSWNaSmtVNkM4K0JuNGFuMkdBNkhaMFNnZU5CR0RHYkRIUkdMMEkrc3FUZmhKNG5HZ2lBYUhnbHdsLy9zUVJDQVA4SThIMkFIbUtFQVFRVHFRUFNZRFFod2RZQVlZUXNCRGhLcEE4d3hRQitoSDF3NENnTW1WeDFrVE43VEVFTGhqZVRvOXdDQWdHWFNOa2N2eEhaUGlsdnJmZDBBc2FpUVNBSXRuTkhnZC9ZZjJ0UTFKSDZnZVVyRHdKS002a2UvdGYwUC8reEJFSUEvd2l3allBWWtRUUJCQktxQWt4aFFDUkNWZUJpVENnRUNFcW9ERG1FQ29iSS9VRllPRlUzNGt3UUl6Q0RZWEhFNkgxUlg2UTdGQ1ZYUWtnTUhYVWpTUXNlL21xU1FiQ3Exemswa3lFK1ZHYjZQck1qWnByckFiT0FYb3dMZFgxeXlRUVAvN0VFUWdEL0NTQ1ZlQmlUQ2dEOEVxa0RFbEZVSEFJV0lFbUFGQU00UXFnSkdBWUZsZ0lTYWtzZ0Rwd2JnbDQ2ZHZLaExLK1FJQ0RrSVNwd2JnbEE3K3NmQWtSRXFpR2lBZkt6d2p3WkswRlI0R1N4S29ySTRiVlp4anhvWldncW85U3VWU3g3RzIvL3NRUkNPUDhJZ0pXQUhwR0RnUGdTcWdQUU1VQWZBbFlBU2tRcUE5aEtxQWtKVUVzQ3Iwc0ppN2sxK28yUzFEWFNmRTNaVmVnL2swZlQrbzBFd09nNndZY3BxWnVwNG9rN0RDUE5qUmlZWGhZVHdoRjBEck5rVWxDalBkeXFvTEFXRG80b1BKa1FuLyt4QkVKWS93ZmdoWUFlWUFVQThCS3BBOHhnQUNVQ1ZhQjdFQzZFQUVxZ0RFbkZXRmFOOEdHQXFVT2tOM1dDd3JPdUtIU1NDajA5NWNjNjFVZnJIZWhoSkVtY1dKT0pCVFZER0Mra21PODVHWmxXVVdKTUpIZnlHa0RUMGcvU1NoaThUeDBuZTRmUC83RUVRbWovQ2RCMWVCS1JCQUQrRXFvQ1RHRUFIMEpWNEhtS0RnUWdTcUFQTVlWSmFMNHZCMXZUK29LblI4Nk5UMkNja2ZGMEZYcC9VVUI2SEJOaE5vbVBvZy9uV2JvczZmcElGQ0ZBajFyUjU2eGVjcE5oVjl2SkpXQTAwSEN6ZUxUREZKMEZ3Ni8vc1FSQ2FQOElZSldBR0pHS0FPWVNxd0pNTVVBaVFqWEFlbElDZzloR29BeEpoVlhMS3I5YW9QVnJZOWc0enZRZUhKckMwL0NBZFRGVTRvTm4rY2pzWVVmcDR3TlQ4ZkNhUXRNSUJOc1I3cmlaOVBHUWtHMkp5RUlFZk5ETStteHlnUU5RaFI3QXIvK3hCRUtJL3dpUWxZQVlZUVFBdWhLckF3WWhFQ0lDTmVCakJoS0VDRWFrREVtRlVPUjJnZ25pUnY3b2NRY05SbEF1eWV3ekU3NWpZYllTUzY1bnlaSmJ4YjRVVE5aVGkrOHFSNWJkeHZPVlNzZWh6QkFJMkNxZVJuaTQ3YVd5VGdhbm43dmtGd1FQLzdFRVFyai9DUUNOZUJoa2dRRG1FYW9DUW1BUUpJSlZ3SHJTQm9QQVNxUVBTWVZCdWhJUXNFSkhsVFJvV1oxcWtXT1FXU0tZa3dJQlk3QjNNVzhmWWtrZ0g1YVROVEVoQ0V4NkR1UVNTbXFpQUpjK0pvdVdhUXc2SVZFUFdQODRzMjNTRGh0WmFQLy9zUVJDeVA4Sk1KVndHQk1vb09nUnFRSk1VWEFod25YQWVZQWFBL0JLb0F3eGhVempraFltVm1EWVVQdFN4UWpZalhEMWE4eThWb0RvS2diYUYvV1RnNUhCZVlsWlJLWWFkQllHeUNkZFVOY1c2Syt0RW9mTG1VSm5ybU1Pdlp4V2dhWnBXMDNKbi8reEJFTFkvd2t3alhBZXhJS0E1aEdwQXhCU1VDUENWYUI3QmhLRDRFcWdERWpCUTZIM1FqN0dZQnByRGd3T29nQlVXT0hra0h3YzdqY01yczQ2Y0pRb0JveGhDUmJLVDhieks3T2hVSHdWUXJMb2hjZ0N3UFV1NldaRis2UGdYRDhXdUsyaHhBR1AvN0VFUXVEL0NRQ2RhQjZRaG9EcUVxZ0QwbUIwSVlKVndFc01Db1BRU3FBSlNZVlF1czhZYmFBMUN6aTBqNWJuRFFMbXgxYzM2SCtkWURtejZnekJsWjFtSkN3dWFYUU5oWTRaVUZRN0hZSmdiSjRDYWlTQ2F1UFJERW5ybWJCMGV6NGxHVFp3M0svL3NRUkMrUDhKRUpWb0dKUUtvUGdTcUFNTU1WQWx3bFdnZWxJQUEzaEtwQXN4UWxBZFI0aHRJNG1CTERwV1RnNWx4Rml4UGZZczVodFVmOVlLQ0FUVHd4Y2FpR2crZE1NS2JWSGhLRm9rQkl0MTBlMmw2OWl3S0prcGhLMEF3TWtnQ0twc2paRXV6Lyt4QkVNQS93bUFqWEFZWVptZzdCS3BBd3dpTUNWQ1ZjQjVraVFENEVxZ0RESUZTc0N4bDEvSkJxWENhYkh4R2hSS1ZaaTJzVGFQZXNVR3N1SHA4dU5wSUJreU4zRTJqdnJnQ0FxVEVVRkxWVFlRSERUeDVidUlZR1RSRVlVdE1qZ3lsVHdhMlBHZi83RUVRd0QvQ01COWNCakNoSUVDRDZnQ1FsUVVJa0pWNEdDR29nUEFTcVFNTU1sRWpnckV3U1MyckhzOFB6OWJZTlFPYmRoT1ZTcVVhOEtUYllmWWJmSERjeHMxVUV3aUFZbHNrZVNHQkFMSGhKaTFGRlJPRVFZTk5XRERFSGl3cURHZVp1TjBVYi8vc1FSREVQOEhrSjF3RWhFb29ONFRxQUpDVlJBbXdoWEFld29TZzdBK3BBOUpSZHBlRWhEaDFSVWdKWW9TS0lvTGp4U0Via0NpR0hBcVFuVk5Sc0ZRNFhCNGJDUzA0VlN5bUhRMEdrRjY0Q0loSWFGS3pDRWxXRmRCcEJMMHFINFF3NUxDVTBXSHovK3hCRU13L3dnZ2xYQVNZd3FnN0JLcEFrd2drQ01DdGFCNlJpNERNRXFrREJESVZ5NjJhMkJZUjA5dGhZTGlGaFZ5QkVkYzkwZ21FR2pyMGphUVdRQ1RlakVqeUI2UjFQYS9RUU5JTkhoSkxrWW8xQnNnK0NQM3BvRXJ3L0lZNmo0OFdUUTZGREd2LzdFRVEyRC9CL0NGZUJoaG9LRDJFcWtDUkRRUUlzSTFvR0ZFb29QSVNxQUpTSUpFZjdUUTZSQU5pY2JKVERSNHdpVXlVSHhkR1JGUWpFUTlaVnBKUXl1YmpuYUt1cytvTENzU0MzTFNLU21rMmVuY2RkL1VYOFRGT1N4SVBOTXhhdUxGcEJCZHRFLy9zUVJEZ1A4SGtIMTRIcEVFZ1A0UnFBUFNNSkFrQWxYQVN3d09BOEJLcEFaSlFrOEVNd01xa1pJeFpHT3lkNnhnbnpDZ1ZKWWVDS2dGazVQRnFBd2Y0a0hGWjM2d2RPeElHWElWVUNaNWh1Z21IT2FDWUdJNWR0cGtvR0d3YzduVHk1UEdwb0pCLy8reEJFT2cvd2dnbFhBV2tZUUE4aEtvQXd4Z0FDUkNGYUI3QmhLRGVFS2tERWdDd1VCcnBFb0hIUGJLWEdtdFVPa2pnZGpCaTBZNitpMng4QUEvNFlMSkdCektPc3VPdG5wMTFzWUdMMUErRWdmdUlEN3hFOFFEZE5Oam5UMjFzT3hJTGVuSkxGQmYvN0VFUThEL0NRQ0ZjQmdnS0FEd0Vha0RFaUNRSVlKVndIcE1EZ05vVHFBTU1nRk9aWHRiQVVtOUlTQURzWkhsVUJCeHNqWkdrUTlwU1pBUG9LUFptRFRnNnRnL214N0t0TEhLREFNQ1JRQUFzNzZnOHBhU29jejRWUkU2U0hHRWRYRVNqOU5ST0EvL3NRUkQ0UDhIMEgxNEdKR0tvUGdTcUFNU1lWQWh3bFdnWWt3bWc3aEtvQXd4aFVvNEwwT1VFUlJVb1p0Sm5xYW1nWENvd2Vra1lLQ2FVTjROeUQ5QlFrdWlxYzQ1WERRWkxBMDI2T3pGcVNwTXAxZUwyNG1peTB4SnNXekVnUUNzRUk2QzRGV0VILyt4QkVRSS93ZVFaWGdTWkltQXhncXBBa3lBTUNFQ2RjQjVnRFlEbUU2a0QwaUNRYmt4MjVIN08zRVdXREJZZEpENU5FV0FhRmpmUzFFS29wRlFkRTF3RFJnY1BqRzJtOUJETUFzTGp6cHcwb0pOQ1ljZU1jekZVTnNwVXZjZjZyWnpxZ2lVSEp5Zi83RUVSRkQvQ0FDVmNCSmtpSURpRXFnQ1RJQlFJTUkxd0hwR1JnT1lScUFQWUlIQWtaVDBEdlFLcXdmcXlZNVNSQlh1T0tWdW9LaGNHZ3NGd2VRSlNlbllhSEdwZ2NCUXVQQlpIaTZBbXV2U0d5d3pKajFTZ0p3SktKMUx3b0VyeHBhTW1laGZ1bC8vc1FSRWlQOEpJSTFvR0pTS29Qd1NxQUpNYzFBY3dmWEFTSklpQTNCR29BbEloVUdEaElMSmhGUEJnU3ZhVmhPQXYxbTRla3dRQUxLT0Z6WVJPSStaYkNFa3JSNENTUUVCT293VGs1bFJ1QnNJWFZJQzJBWkZ5OGl1RDB3WmphS2RtK2lPRW84TmIvK3hCRVN3L3dqUWpXQWVrcG1BOWhPbkE5aGdNQitDZGVCSmhDNEQ0RTZnQ1JtUXdDeWZPTmdVSXV0Y2ZETVFNQTZWVWlqUnJ3Y1J2YURmdVdsZFVOckFJU253c1pTd3dUWjU5WGhZOFdaUEZ6SHNxR0JrcEh1aUZYVll0elZYRzVRZVhING5VR292LzdFRVJNai9DTkNOYUI3RWdxRG9FYWdERWpGUUlzSTF3R0pNTGdPd1JxQUpDWlJTSDlWVVJLSzRzSFkrQUNKYU9vaHBVK00zWU5oZzZtb0xqZ3FNTUp0SEVPaGJZTkRTN1ZaU2J1R0FZUVlJaE1LRjBValE1R1BRU1Fac0hBZ3c0TU9JSDE0em5xLy9zUVJFNFA4SlFJMWdIc1NEZ000UnFBTU1NVkFpd2xXQWV4SW1BMUJLb0FsQlNVMEVBZm9RWlJRaFFod2lWSkRmU1hFd2ZiWW9qUEQ1aG1xbE5yVkI0VlZRYkFjQlJ4UkU0UUN0WUZ6TVNZckhzYmFFdzJJV0NCU2hBSFU1OFd4aG13YUpkbUNRSC8reEJFVVEvd21nbFdBZXhJbWczaE9wQXd3aGNDRENOYUJpUmhJRGNFYWtDUmlRMERyWTdFZDFhZ1N5QmhGeUNyVTBpUUlScytQdVZkVklZYTVDb1NDb05pTWdDUk9KQ3dhZHhUQTc2eUE0VEU1ZEFKa2VIa2JWMkVFRHB2UUN3aUZSTXBCb0tBMVAvN0VFUlREL0NEQ1ZjQjZSQklEb0VxZ0RFbUF3SXdKVm9IcE1Lb01JUnFRTUNKQmRnY3FKa0hQeWFoY1NpUThoaVFJT3N3TmlaQjMwMG1aQ1RNL0dKUFNGc3laRTJTNElWbklCRHNEcmE4aW44QitkYU5vc0VPNk5DVWN4SUNsUVZDdzI4aVUrTjIvL3NRUkZhUDhJNEpWb0VwTUtvT0FScUFKU1lCQWlBbFdnZXdZU0E1aEtwQTlJZ2t2di9XU0ZQcUE2WE5RMFB2U2o4ZTU2OWhkUjJFa2NucTVnS0JJSWtTLzAvWjJoOHNDZzZPSzB1d1VGekswN2o0V1IzazR3TEFkaVNaVUM4bWlrUjJNeG9oSGg3Lyt4QkVXSS93Z3dsV2dTWVJPQTlCS25Ba1ExRUNIQ1ZhQktSQklEaUVxZ0N6Q0NRSFppWk1DaER4VVV2R21OVU5Sd0pkRXJrYll6YVNKK3hub05jMmtvMDRuNGIram9CTm5QdUxJOEhiclVoSUU3WXlmTms2SVRhVEUxQm9iUHdNR0FEdkVMejVNdi83RUVSYkQvQ01DZGNCN0JnNER3RTZnREJBUlFJTUpWb0dHU0pBUG9TcGdQU1lWRU9wSktnMkpjL05xaE9uNXRqNUFVV09naUxEZ0U5NFdGYUlVSTFPMG42Vk1yaWtRdHE1NzRLMENHU1RBb3IwdkhJZkdDMVZnMEVQSVJZTmlrZ0U1T3ZtQTBnUS8vc1FSRnlQOEljSlZvSHBTQ2dPZ1JxQU1TVUpBZEFiWEFZWUpLQTZoT25Bd3d5VXRZTkJEMlJhTjBreWtPeCtNRDBqd0pYKzZyMkxzY2dIUVpMU1dXangwM0trSjlSVkFlZ21DdUsxQUpoRmtiQXVpR3Qxam9XUHNoRGhjUlVCdFRXRXo5VXhFR0wvK3hCRVlBL3doQW5XZ1lZQ0tCQWhPbUE5QnlVQ0NCOWFCaVJCSUQwRTZjQ1RDSlN4dFE2RFltVlJyU0RKb2xESmp3TWMyNm9hSnh5SVdVd3djaUVxb0dScjBqVFdIYTdDb2luUm1sVmg1OUl6S0ZOWkEzQTBYQTBPb2tZUXU5YkxrbVVxTlZZWkV2LzdFRVJoai9DT0JsWUI2VENZRG1FcWNEMGpGUUljSjFvR0ZFb2dQd1Rwd0pLSlJKRXUwQTROVGVZejRpbS9NTWs0ZEZUVTJpNE5UYVl6MEREYXd1RUF4ZGZQS0lCd3lpZHFHMHhuT1Nrc2o4SlVBK1lnU0NCZFUrdzdzTnhGQWNBSklHQUJMdUVLLy9zUVJHTVA4SWdKMW9Ic0VGZ1BBU3B3TUVWREFqQWZXQWVsSW1nM2hPbkF3UUVVT1N6R09UVnBFc0JwSUJBQWtiaENOdFV4VWV3ZHBCV0VJUitUSFRvUHJpSWZNMkdnSitYeEtHNlZWeHhKa1BpWWNDbjdxWXBQUWlZSlZJa1RjV2tFa3dpdlF4ai8reEJFWlEvd2Z3aldBU2t3U2c0QkduQWt4UWtDR0NWYUI3RENvRHNFcWNEMG9CU3F2WCtvQ2lBc0JFN1RSQzFxVjZQVXMxZXNueVFUNVVJY2VUOUVqZ0lJdWdtRFBuOUlIU0V2RTVjV2p4SWNwQzZGZ3grcUI4bUEyTlVHTkFxWWVPRC9VNk5QWnYvN0VFUm9EL0I4QnRhQmlRQzZEc0U2Y0NVbEpRSVlKVm9HRkdvZ1BvVHBnUFNZSEFGeVFCQkJDVWlKbGF1N3VGUGFGQUxIcEVMazQ0Q1BCUStYVURSQ2hBQWV3TUhRYlNGd1ZmVjl4M01hSTAzc0JsUFJPRVpSQU9uK20xZXNKRkkwSDd3NnZaZ2IvL3NRUkdxUDhIZ0lWd0VpQW9nUHdRcGdNU0lKQWlnbFdBWUlhaWcraEttQTlKaFVGVEJsOGFhNFkya0RZUGdGRWhoY2tBa0lLbzZvQ1F0TDZRYkdRcVFEaU5BTEF3bW5MQklXT1hvWFVieXNId0VwS0ZBNmRCYStVTXd4eWF5TWx1b2NnVkxGV0YzLyt4QkViSS93aGdsV2dlWXdJQThCS25Bd3lRTUNSQ05ZQjVoR2FEdUU2Z0REQ0pRUDNsRE9ZZDFoSUpSZk0xVHp3SENJcENZNXhlQ29CQVZMcm9YYU5zSVdjaGx3YXFvTklnMEtoeDVzY0JFK3JpNHVCek5vdUZtaVkwTFNiSkFyb1ZqdzdpZGs1Zi83RUVSdUQvQ0NDTllCaVRDb0RnRWFnQ1RDQ1FIb0kxZ0htS1pnT1FTcGdNU1lIQTlSSFNsWWlrUUpHM2RkK29xNkNablMvWmxhc3VhRE1IeWNWQ2pySnAyWEE5WlE2ajJNTDRqM3ZpRmhtVUJGR29KWXB4TGlTY3RWaEI5UkdoK0xFUTZEb1ZxZS8vc1FSSElQOEljSjFvSHBDTmdQSVRwZ1BTVWxBaUFqV0FTa29TQStCS21BbEpRbHkzT29uOHlXWXdxRG9XSHFNVkQxaVk0VHJYODNub3BXMUkxTElXT0Z4S0JMcGtxaGpOVkFvaG5FWkxBVUJQdUJsQlNUZk02cDlFb3BFcE1OZ0FlUnhESWZ3NkwvK3hCRWM0L3dqZ2pWZ2V3d2lBK2hHbUE5SmhFQjlDVllCaVRDb0RVRXFZQ1JKVVJ4ckNQRVJhV1hPWVVLQmVzRkR0eXdoSlJBa1ZBamplYmkyZzNUblZ6N0s2VXJhc01SS0pTZ2tkQlVHOVNiY1RpejBYSEZVdGo4RGErSlIyWmhGWWdhcGdrVkJmLzdFRVIyRC9DRkNOWUJLUmhJREVFcWNDUWlRUUlzSjFnSHBHVGdPb1Rwd1BNSWxBcnZzZ2dTa1FtVVNCTzdqSE1wQ1E3Zk9UeDFjZkgyQ09PNElScEhORUs4bEpZUDQ0eGEvUzNOSE9lcXFYRHlaVVM1eXNOdExoemMyMDJxNHphVkJka3FFZFVvLy9zUVJIbVA4SVFKMWdHR0FpZ05JVHB3SkVCRkFoUWZWaFR4Z0NBOGhLbUNuakFFT0JnSkRoN3cya25tLzlCMnRTR1pwbFFTRGJ6K3diUlZTUEpaSldNQnRBb0JnOE1UOElZSVgyNVF4R1NrbHdINGlDS1EzNGh4RzZFakRPVnA5T0VUSThKVlhTMy8reEJFZklBQS9BNVVCbURBQUIwQldxVEdEQUFEVERGS0hQR0FBR0lHSjhPd01BUlJ5RHVreVFCMmdWblN5RkdPcGpZUm1BaDh1a0UwYnlFZlhMaFJFa1Q3UThHT3R5UWJYZUtRNmpPa0FtU0IvS3ZpMWcrVnd0Rm1mQjhyRWdJVEY2OHI2Zzdrby8vN0VFUm1qL0I0Q05hQmlTaW9Ea0U2Y0RCQVJRSklKMVlIc01Lb1BBVHBnUFNNWkVVMkFxa21hRXpiQWNRdWF3cUpIMEdnaHhhblVteWJFNGZFenM2YjlORG9UaG1QdytSNE9CN1RzNmIrQ1FHRWhDSHdMRThRc1FKQmJOTTg5U2hVZUxhZzJQOGkvL3NRUkdrUDhJVUhWWUdNTUpvTTRQcGdNU0lYUWtnalZnZWt3cWc0QktuQXdSaUVHa240cFljWWQ1S1dRMVZ0NDRZSFp0eGhEYWlhU00wVEFjTnVja0hHdzgvRmVSc1JUa2JJTUtHWUhwODBCTUJMaERPYkFLcU9OTHJvRUkvSVJvV0VHZWtQZzRILyt4QkViQS93aFFoVmdla0l5QStoS2xBOUloVUI4Q1ZZQktSQklEaUVxVUNTbVFUaTJCc1Rrd2hJQStVUkpURFhwRWdVRTYwY2E0T0JZU0VpT00xNktkVWZnS0hZMElKcjVXVHIxZTU3eng4TkNNRWhtSmg4eTlvWm1iOWEwOGVvcVVNWWRpeTY4di83RUVSdkQvQ1NDZFVCN0RDb0QyRXFVRDBpRlFIZ0lWUUhwQU1vT1lQcEFNTWtUYUNCQ29lVXlGN0IrYURTc1RDUlZZK0VBdGpGVW5Ld2Z0TktBb0ErUVVDWU0wVVFvMkxFWndUYWhBQ3VBcUc1WjlJYXRpTXFSeFdvbVNSUWdxUGs5VFpCVkZ2Ty8vc1FSSEdQOEg0SlZnRXBNS2dOQVNwZ01TTVZBZVFuVmdla1pLQTRCS2xBOUpnY0NJMnRCQWx6SWRTeThTY1R0QzV3UkFiYUtpUnh3cWdNQmdRa0NBekhqRVZHVXBLTHdMK1lsSndrSVVDQmszakZoUnFrbHRJTWxCZ05JV1FvalFrRlF6NGhNT24vK3hCRWRvL3dnQWpWZ1lVYUNBNEJPbUFrUVVVQ0dDVlVCN0JnNEQ0RXFRRDBtSXdoTGM2SjVUb2lEVFE1bWZCR1ZTQUhVcWpMRVV4T0FoQURuMmwyUmMvUzQ1RGlORUFlMFZnYU9JODgydW9aZFFiQk1sRFFpRWhLMEZpcUZ0cU53U1R2NlBrb21QLzdFRVI1RC9DQkNkV0JnZ01JRDRFcVFERWlHUUg4SjFRSHNLRmdQNFRwQU5TY0xGUTRoU0JnbEZPcDNnbVRXZ2RwTVM5a0dXR2J3VUFzSkJSeXdDRGVrS2MzVWVXNWdYYU9BbWZJTXFOREM5SUlLSkJGUndnRktCQW5xYXhTM0lCaFpRSUJDSWdBLy9zUVJIc1A4SG9HVllHSlNBZ09nU3BRTUVOQkFmUWhWZ2V3WVNBN2hLbEE5SXhVZ2hpUHlsWU0yaW9keFlDd0lBc0o2dzZWcnpQckY0UGNLa0NPQlVLQkFLc2dLTlRKNVF1RGFpUUxsZ1lEdUVpa1NRQ29FVEp0Q3lwYjlRVGxnZkNlWk9NdkRVai8reEJFZm8vd2lnbFZnZWtZT0E3aEtsQXhJeFVDRUNkVUI2UkM0RGtFcVFEekZGUVQxbnc4eXhnR3B5SjZiazZjTVVJY2M1WTl3dnByRGdTc3AxVGkrRWltcUpSeXg5QTRSS0tHUS9MY0F4TFQwQW5YSXo1TTA2OUl1ak9XK0dKaytrTTlQdHk5MmYvN0VFU0JEL0NMQ1ZVQjZUQXFFT0VxTUR3cEFRSU1KVllFaEVvb1BBU3BRSk1JbEExTjlSR0h3TWdSTVZKK080aUNpbGtnamlhUVNId1pBaWVyVDhkeTVFS2xxUW9FMGp5clM2NGFicXNUQU9Ea0pzSW5HVHIyU2pWWXdLOE5ycUtsd0RZUk1KUzgvL3NRUklJUDhJd0dWSUhyU0lnUVlTb3dQU0lYQWRRbFZnU0VTaUE3QktrQWt4UmthaWNGY05nQXhpYUhpUU5Cb2JxMGhvTFpmY0dnU0tBRXdpZVlVQ1JNclZwTW90NnpKa2Y0ZWtWYW5QQ1dHR3BINUc4eDk2QmxKOUNWU21qSkJHTE9UdVkzaUEvLyt4QkVoQS93aHdsVkFld1lTQkFCT2tBOHhTVUNLQmxXQmhqQ1FEK0VxUURFakZSTmRRWjhKVUlKK0tHaU1FYkpBZ3RISVVHbXBZeUFMWWVDS1lKQklMa3B1NitrbFFna0ttYVNNakFtZ1FRUUVvM080WG9zckV0RlM1bVNnSEtNczNIY0Q3ODBKdi83RUVTRkQvQ0pDVlNCaVNtYUVDRXFRREJHVVFIc0YxWUhzU0JnUHdTcEFQWVlIQVg1Tm82d29WQWlkUW8yc1hJcjZqQVVFcEJJNlp4SUFncUpPc1hDNzZ5UVpKVnlUTVpDMXBzampJRGgyaHFGY2NnUmdZbFFYQ1FsYW9HelMyYUNZR1JGRlE3ei8vc1FSSWFQOElRSTFRR0dFWmdSUVNvd01HVkRBaEFuVkFlWVJLZzloT2tBOUlnY0JQQU13R2RUNUFjZHlRc09OVFNKMmRyZ1htUlBab0lPUWJ4UFBEY2NCd1dqQW54a3dTUXBOMVpUNk01Z0s4MkVEdzR1Zk1FSktqYlR5aDRDN05vWlJ5SUJtRW4vK3hCRWg0L3drd2RVZ2V4SUdCQ2c2akF0aVFGQ0dDTlVCN0RBb0VLRXFNRDBtRlEzSGhoSXMzOGZwek5DeHBKekJMR1Q4U3d2V3JmSzlFVG9XVzhmREdtRlJLVGpNNU5VR3diR0JPVXRNSTRJRVkwYU9MaE1Nc3FaR3ZBWjJTb0FvR3pRWmVoUnpQLzdFRVNIRC9DYkROT0I3QmhJRHFFcVFERW1BUUhjSlZRSG1NS2dRQVRvd1BTQWJFNjRPbHNxWklmUkFsSWNrcytMSDFUOEk1SmVGckduNlIySFdxTkJ1Z3ZIaG93MW0wZytvY2lGdkZnWktuamdzVWRNZElHNktnYkJ5bUQ1NVNYRE5lbk90a29ZLy9zUVJJaVA4SVVHVlFIbVNJb1BvTXBBTU1ZVFFqZ2xVQWV4QXFCQmhLakF4SXdrZm1Bb1FZQjJlUFFJSFBGZzF3VFF3OVluWmxBRm14T29iTEJvUXBWVzh2c2NsUTcxRUVneVk4eWdvY2JGSGhQVlNoZmo2SkFNeW9vSkI2cGk4M2VKbXg5RW8xRC8reEJFaVEvd2dRblZBZXdRU0EvQktqQTlKaFVDS0NOUUJqQmhJRG9FYVFDVWlDU1FYUU1GQks0cDk0UkU2S2FUZUpzRktESWhRWkM5MEVUR3g0MkVGcEk1ZkF5UDhCTXhkY3dNeTZVVDg0VWNleEVHVzRRZ0NtMFhtVUdjeUFzV2xvZWxxWitoSWYvN0VFU0xEL0NDQ1ZVQjYwZ1lEMkVxUUQyR0J3SkFJMUlIc0dLb1A0Um93TVNVSk1DR2F3NE5XTEtpelhHOHRLbFhuTURvb3BZekZFcDZpQXJzb2drOHRYbVRmTGJZMVJJWUJmS2l4d3RvWlo4WEVxS0Fsd2ptYXdHQWdlR1FRRmo2NkUrYWF5UmMvL3NRUkl3UDhJOEkxSUVwUUtnT0lTcEFNU2dEQWRBbFZnZXdRU0E3QktrQTloUWNJL1NKUVlsZ0JCRlFFQmdTZ2ZVd3VHSG5LQW1HSllFQWRNNGdKWGJYWlBpazZpQnhCc1IybDZJWkh5dGJ6T1BVZXVHR0lKbkVTanRSRzRlUHRrY2JWK3craFFYLyt4QkVqdy93ZXduVkFZRVNpZytCT2pBd3dpVUNLQ1ZTQjVrZ0lEY0VxUUR6RkNRQ0NuSEljQlNMWVVLQXk0UGJUVnVRa09FS01OQkFneGNISlI0ZE9KRHVwaFRtSlJvb0lveUJCR1N0bnZicnpNREJTSzVDMGtFTGJRZ0N5S1N1NnVuS3ZURHVGUC83RUVTU0QvQ0FDTlVCN0RDb0RVRWFRREVsRlFJY0pVNEhtWUJnUG9Ub2dQU1lIQU1ncGNKeEtNNDE1aS9qVkdUcGtqaDRQdzZqQW9HQng3a2J4MVF4MUZVdW84eWhFR0JLMGJRb0NqRVN4b1pUdW5aUWw3SUZ3WVF0V1pZY3hLWlVPcDJDaGJMQS8vc1FSSlVQOElVSlZJSG1NS29QQVNvd01DWkRBalFsVWdlWVJtZzJoS2tBOWdna2ppMHQ4VkJjamFqVStDWTdZY0lLZ25neWI1USt1SzBlZ2xsS0JzRDRpbENLQXlHU0FORlZMaW9MeFhRZEY4eFd5cEVBaUFwNHVhRk1sSWJhS29Va2lOeTRiTW4vK3hCRWw0L3drUWxVQWV3WVNBOEJLakF4SXdrQ0hDTlVCaGhFb0R3RXFRREVtRlVFK3RzTExiaDNycmFkQ0U1d1hLcnFrTUxucUVKVHpPVUlFalJjTkRxQ2luTHpOU3pONndnbVNzYVNha2hQamJBS1dqWWEyYUxJdndtQ1M2RWpRc0hpNTNHWUdQLzdFRVNaRC9DT0NkVUI3QkJJRDJFcVFEMG1GUUlzSlZBR0pNS2dQUVNvd0pFWkRQZW9nQ0hFd0Z0MnVxU09iVHgwYURYcUpXT0ZUay9PSExDUm15b1B0RlJvcVQ2VHJINjNtK3MwOWdKeGMxWlNCak5qdE84d0NrOUgxZ2pXTmcxc0Z6aUpZWktMLy9zUVJKb1A4SU1IMVFIclNJZ1JRUG9nUFlZVFFod25VZ1lJS21BK2hLakF3eFJjWkRKVkVxUWRXTkk5Z3Zvamgyb0Nnc0dDd3NMd21EcUZwV0hxSlE2LzZ3RURvb0lKYmZndU11YmFxWHFHWmlrbnlHTWhNdzBLQ1FJQ1luTTNYM0IrdWt5Vmp3My8reEJFbW8vd2p3bFVnZWtvU2c5QktqQTlKd2xDQ0JsV0JqRWlhRGtFcVVERWlGVHhNU0lDUVRJeE50N2pQcm9Id2tFWmJVS1M1QWdVYWxFd1UxcmFKbWNoRzArS2k0SVFZYWxCWVVXb2ZBVGJFSWJMTmtZVFFrYnJEUTFwUjFCTldZaTlDZlRqL2YvN0VFU2NqL0NIQ1ZTQmlSQzZEa0VxUURERkZ3SDBKVklIcEdFZ09RVHBBUE1JWEVtcDRWeFdxb29PNVJqY2RRcVBRc0kyelUzamVXbVAyaWNLdHBScDFQU1lJdHk3bUw1NDlpOFFTNE1seXU1SlNyRGhSWWV3b2FLMGhJRVNnOGFmWUtBVUlReDkvL3NRUktBUDhKRUoxUUhwTUpvUFlUcEFNR1ZEQWdnbFVnZWtRU0E5QktqQTlKUWtRMXRGS2treksvUjdyU1RWVDhMbDRxQ2RWQ1N6T0prMERiT0hSTXUrM2lxQ3RBU0VvTVE0SFl0clRaWWZObmtxUWJ0SUFBc01RNEhZM1dsb3dQa3hubU9MVWhELyt4QkVvWS93akFiVWdlWmdtQTdoR2pBOUl4ZENCQjlVQjdCZzREOEVxTUQwakZTRjZ4cVFlUWpJbk1oUk9yUGNxOXMySFJiV0VNWWlCZzhrSGJxNGs0MmJEYlRROE1BV1J5QVVvNWlIaFhFR3Z1cU85Tk15OEoyMkJhS2lQQ3VZam9vUVRNTWdTUC83RUVTakQvQ0lDVlVCaGhCQUVBRTZNREVuSlFJY0dWUUhwU0pvUG9TcEFQU01WSGcwUkQ3SjVkZWg0WVFweXdsTXlpRFpJS0pCeHFudkh3d3lxeWdMNGhKRUNGNFhOV1FOU0M4R2R4eFFJaDZwRENyeU1UUkNOQ0h3OTAwc1l4VElEZ1JhWGJESi8vc1FSS1FQOElBSTFRR0pFRW9Pd1Nvd1BTVUpBZkFqVkFZa1FTaEJCS2lBeGhoVWFFc3dRZHc0M2lUaGo5MWJacmtsUWdiaTdhWUNOY0dsV1EvRGphaVJ3bDlpUXdLeVJKSmRJRW1UaVRuZ3FJTFFmbDlhZUduNGFPNHRBRDB6cVVhTGdBbVZLeTMvK3hCRXBvL3dod2xWQWV3d0dBOEJPakE4d1NrQ0tDVlNCakJCSURvRTZRQ1RGSlJpL29ESkppSEtPb0ljVnd3MTVTbVFvVkxLYnpJWWFwa0NuMThwR1lhUzAyTHY4OEFBVkNvcEpVT0JRUzc4Z3JJS3R0b0FBRkNnSUw0VlRFRk5SVE11T1RsVlZmLzdFRVNvai9DR0NWVUI1aElJRG1FcVFEMGlDUUlRSTFRR01FRWdRQVNvd0pZWUhGVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWLy9zUVJLcVA4SWNJMUlHR1NBZ1BJUnBBTU1ZQkFpUWpVZ2Vrd0tnNWhLa0E5SmhFVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWWC8reEJFckkvd2lBbFZBWWtRdUE4QktrQXd3eFVCL0NOVUI2UmhJRHNFcVFEMGpGUlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVmYvN0VFU3ZBQUN6Q2RRRlBDQUtGT0U2SUtlRUFRU29NMGdaaEFBQWVJWm9BeDVnQUZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYvL3NRUkptUDhJQURUTWNrd0FvSTREcDA0WUFCd0FBQnBBQUFBQ0FBQURTQUFBQUVWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVPSciLCJpbXBvcnQgcWFtYmksIHtcbiAgTUlESUV2ZW50LFxuICBJbnN0cnVtZW50LFxufSBmcm9tICcuLi8uLi9zcmMvcWFtYmknXG5cblxuaW1wb3J0IHtcbiAgcGFyc2VTYW1wbGVzLFxufSBmcm9tICcuLi8uLi9zcmMvcGFyc2VfYXVkaW8nXG5cbmltcG9ydCB7XG4gIGJhc2U2NFxufSBmcm9tICcuL3NhbXBsZScgLy8gaW1wb3J0IGEgYmFzZTY0IGVuY29kZWQgYXVkaW8gZmlsZVxuXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xuXG4gIGxldCB0ZXN0ID0gNVxuICBsZXQgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50KClcblxuXG4gIGlmKHRlc3QgPT09IDEpe1xuXG4gICAgcGFyc2VTYW1wbGVzKHs1MDogYmFzZTY0fSlcbiAgICAvL3BhcnNlU2FtcGxlcyhiYXNlNjQpXG4gICAgLnRoZW4oZGF0YSA9PiB7XG4gICAgICBsZXQgYnVmZmVyID0gZGF0YVsnNTAnXSAvLyBzYW1wbGUgaXMgc3RvcmVkIGluIHRoZSByZXN1bHQgb2JqZWN0IHdpdGggdGhlIHNhbWUga2V5LCBzbyAnNTAnIGluIHRoaXMgY2FzZVxuICAgICAgLy9sZXQgYnVmZmVyID0gZGF0YVswXVxuICAgICAgaWYodHlwZW9mIGJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBjb25zb2xlLmxvZygnZXJyb3IgbG9hZGluZyBzYW1wbGUnKVxuICAgICAgfVxuXG4gICAgICBpbnN0cnVtZW50LnVwZGF0ZVNhbXBsZURhdGEoe1xuICAgICAgICBub3RlOiA1MCxcbiAgICAgICAgYnVmZmVyLFxuICAgICAgICByZWxlYXNlOiBbMCwgJ2xpbmVhciddLFxuICAgICAgfSwge1xuICAgICAgICBub3RlOiA1MixcbiAgICAgICAgYnVmZmVyLFxuICAgICAgICByZWxlYXNlOiBbNSwgJ2xpbmVhciddLFxuICAgICAgfSlcbiAgICAgIGluc3RydW1lbnQucHJvY2Vzc01JRElFdmVudChuZXcgTUlESUV2ZW50KDk2MCAqIDAsIDE0NCwgNTAsIDEwMCkpXG4gICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiAxLCAxMjgsIDUwLCAwKSlcbiAgICAgIGluc3RydW1lbnQucHJvY2Vzc01JRElFdmVudChuZXcgTUlESUV2ZW50KDk2MCAqIDIsIDE0NCwgNTIsIDEwMCkpXG4gICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiAzLCAxMjgsIDUyLCAwKSlcbiAgICB9KVxuXG5cbiAgfWVsc2UgaWYodGVzdCA9PT0gMil7XG5cbiAgICBwYXJzZVNhbXBsZXMoezUwOiAnLi4vZGF0YS9CMC00OS05Ni53YXYnfSlcbiAgICAudGhlbihkYXRhID0+IHtcblxuICAgICAgbGV0IGJ1ZmZlciA9IGRhdGFbJzUwJ10gLy8gc2FtcGxlIGlzIHN0b3JlZCBpbiB0aGUgcmVzdWx0IG9iamVjdCB3aXRoIHRoZSBzYW1lIGtleSwgc28gJzUwJyBpbiB0aGlzIGNhc2VcbiAgICAgIGlmKHR5cGVvZiBidWZmZXIgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yIGxvYWRpbmcgc2FtcGxlIDUwJylcbiAgICAgIH1cblxuICAgICAgaW5zdHJ1bWVudC51cGRhdGVTYW1wbGVEYXRhKHtcbiAgICAgICAgbm90ZTogNTAsXG4gICAgICAgIGJ1ZmZlcixcbiAgICAgICAgcmVsZWFzZTogWzQsICdsaW5lYXInXSxcbiAgICAgIH0pXG4gICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiAwLCAxNDQsIDUwLCAxMDApKVxuICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoOTYwICogMSwgMTI4LCA1MCwgMCkpXG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsZXQgZW52ZWxvcGUgPSBuZXcgQXJyYXkoMTAwKS5maWxsKDEpXG4gICAgICAgIGVudmVsb3BlID0gZW52ZWxvcGUubWFwKGZ1bmN0aW9uKHZhbHVlLCBpbmRleCl7XG4gICAgICAgICAgaWYoaW5kZXggJSAyID09PSAwKXtcbiAgICAgICAgICAgIHJldHVybiAwLjNcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gdXBkYXRlIGVudmVsb3BlIG9mIG5vdGUgNTBcbiAgICAgICAgaW5zdHJ1bWVudC51cGRhdGVTYW1wbGVEYXRhKHtcbiAgICAgICAgICBub3RlOiA1MCxcbiAgICAgICAgICByZWxlYXNlOiBbNCwgZW52ZWxvcGVdLFxuICAgICAgICB9KVxuICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCgwLCAxNDQsIDUwLCAxMDApKVxuICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCgyMDAsIDEyOCwgNTAsIDApKVxuXG4gICAgICB9LCAyMDAwKVxuICAgIH0pXG5cbiAgfWVsc2UgaWYodGVzdCA9PT0gMyl7XG5cbiAgICBwYXJzZVNhbXBsZXMoJy4uL2RhdGEvQjAtNDktOTYud2F2JywgJy4uL2RhdGEvVFAwMWQtRWxlY3RyaWNQaWFuby0wMDAtMDYwLWMzLndhdicpXG4gICAgLy9wYXJzZVNhbXBsZXMoWycuLi8uLi9kYXRhL0IwLTQ5LTk2LndhdicsICcuLi8uLi9kYXRhL1RQMDFkLUVsZWN0cmljUGlhbm8tMDAwLTA2MC1jMy53YXYnXSkgLT4gbm90IHJlY29tbWVuZGVkXG4gICAgLy9wYXJzZVNhbXBsZXMoezQwOiAnLi4vLi4vZGF0YS9CMC00OS05Ni53YXYnfSlcbiAgICAvL3BhcnNlU2FtcGxlcygnLi4vLi4vZGF0YS9CMC00OS05Ni53YXYnKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZyhkYXRhKVxuICAgICAgZGF0YS5mb3JFYWNoKGQgPT4ge1xuICAgICAgICBpZih0eXBlb2YgZCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvciBsb2FkaW5nIHNhbXBsZScpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGxldCBidWZmZXIxID0gZGF0YVswXVxuICAgICAgbGV0IGJ1ZmZlcjIgPSBkYXRhWzFdXG5cbiAgICAgIGluc3RydW1lbnQudXBkYXRlU2FtcGxlRGF0YSh7XG4gICAgICAgIG5vdGU6IDYwLFxuICAgICAgICBidWZmZXI6IGJ1ZmZlcjEsXG4gICAgICAgIHN1c3RhaW46IFswXSxcbiAgICAgICAgcmVsZWFzZTogWzQsICdlcXVhbF9wb3dlciddLFxuICAgICAgICB2ZWxvY2l0eTogWzAsIDEwMV0sXG4gICAgICAgIHBhbjogLTFcbiAgICAgIH0pXG5cbiAgICAgIGluc3RydW1lbnQudXBkYXRlU2FtcGxlRGF0YSh7XG4gICAgICAgIG5vdGU6IDYwLFxuICAgICAgICBzdXN0YWluOiBbMjUsIDI1MDBdLFxuICAgICAgICB2ZWxvY2l0eTogWzAsIDFdLFxuICAgICAgfSlcblxuICAgICAgaW5zdHJ1bWVudC51cGRhdGVTYW1wbGVEYXRhKHtcbiAgICAgICAgbm90ZTogNjAsXG4gICAgICAgIGJ1ZmZlcjogYnVmZmVyMixcbiAgICAgICAgdmVsb2NpdHk6IFsxMDEsIDEyN10sXG4gICAgICB9KVxuXG4gICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiAwLCAxNDQsIDYwLCAxMDApKVxuICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoOTYwICogMSwgMTI4LCA2MCwgMCkpXG5cbiAgICAgIGluc3RydW1lbnQucHJvY2Vzc01JRElFdmVudChuZXcgTUlESUV2ZW50KDk2MCAqIDIsIDE0NCwgNjAsIDEwMSkpXG4gICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiAzLCAxMjgsIDYwLCAwKSlcbiAgICB9KVxuXG4gIH1lbHNlIGlmKHRlc3QgPT09IDQpe1xuXG4gICAgbGV0IGpzb24gPSB7XG4gICAgICA2MDoge1xuICAgICAgICB1cmw6ICcuLi9kYXRhL1RQMDFkLUVsZWN0cmljUGlhbm8tMDAwLTA2MC1jMy53YXYnLFxuICAgICAgICBzdXN0YWluOiBbMF0sXG4gICAgICAgIHJlbGVhc2U6IFsyMCwgJ2VxdWFsX3Bvd2VyJ10sXG4gICAgICB9LFxuICAgICAgNjI6ICcuLi9kYXRhL1RQMDFkLUVsZWN0cmljUGlhbm8tMDAwLTA2MC1jMy53YXYnLFxuICAgICAgNjQ6IGJhc2U2NCxcbiAgICAgIHJlbGVhc2U6IFsyLCAnZXF1YWxfcG93ZXInXVxuICAgIH1cblxuICAgIGluc3RydW1lbnQucGFyc2VTYW1wbGVEYXRhKGpzb24pLnRoZW4oXG4gICAgICBmdW5jdGlvbigpe1xuICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiAwLCAxNDQsIDYwLCAxMDApKVxuICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiAxLCAxMjgsIDYwLCAwKSlcblxuICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiAyLCAxNDQsIDYyLCAxMDApKVxuICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiAzLCAxMjgsIDYyLCAwKSlcblxuICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiA0LCAxNDQsIDY0LCAxMDApKVxuICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQobmV3IE1JRElFdmVudCg5NjAgKiA1LCAxMjgsIDY0LCAwKSlcbiAgICAgIH1cbiAgICApXG5cbiAgfWVsc2UgaWYodGVzdCA9PT0gNSl7XG5cbiAgICBsZXQgcmhvZGVzID0ge1xuICAgICAgcmVsZWFzZTogWzQsICdlcXVhbF9wb3dlciddLFxuICAgICAgYmFzZVVybDogJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9hYnVkYWFuL3FhbWJpLWluc3RydW1lbnRzL21hc3Rlci9zYW1wbGVzL3Job2Rlcy8nLCAvLyB0ZWxscyB1cyB3aGVyZSB0byBmaW5kIHRoZSBzYW1wbGVzXG4gICAgICAyODogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDI4LWUwLm1wMycsXG4gICAgICAyOTogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDI5LWYwLm1wMycsXG4gICAgICAzMDogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDMwLWYjMC5tcDMnLFxuICAgICAgMzE6ICdGcmVlc291bmRSaG9kZXMtMDAwLTAzMS1nMC5tcDMnLFxuICAgICAgMzI6ICdGcmVlc291bmRSaG9kZXMtMDAwLTAzMi1nIzAubXAzJyxcbiAgICAgIDMzOiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wMzMtYTAubXAzJyxcbiAgICAgIDM0OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wMzQtYSMwLm1wMycsXG4gICAgICAzNTogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDM1LWgwLm1wMycsXG4gICAgICAzNjogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDM2LWMxLm1wMycsXG4gICAgICAzNzogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDM3LWMjMS5tcDMnLFxuICAgICAgMzg6ICdGcmVlc291bmRSaG9kZXMtMDAwLTAzOC1kMS5tcDMnLFxuICAgICAgMzk6ICdGcmVlc291bmRSaG9kZXMtMDAwLTAzOS1kIzEubXAzJyxcbiAgICAgIDQwOiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNDAtZTEubXAzJyxcbiAgICAgIDQxOiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNDEtZjEubXAzJyxcbiAgICAgIDQyOiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNDItZiMxLm1wMycsXG4gICAgICA0MzogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDQzLWcxLm1wMycsXG4gICAgICA0NDogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDQ0LWcjMS5tcDMnLFxuICAgICAgNDU6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA0NS1hMS5tcDMnLFxuICAgICAgNDY6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA0Ni1hIzEubXAzJyxcbiAgICAgIDQ3OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNDctaDEubXAzJyxcbiAgICAgIDQ4OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNDgtYzIubXAzJyxcbiAgICAgIDQ5OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNDktYyMyLm1wMycsXG4gICAgICA1MDogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDUwLWQyLm1wMycsXG4gICAgICA1MTogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDUxLWQjMi5tcDMnLFxuICAgICAgNTI6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA1Mi1lMi5tcDMnLFxuICAgICAgNTM6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA1My1mMi5tcDMnLFxuICAgICAgNTQ6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA1NC1mIzIubXAzJyxcbiAgICAgIDU1OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNTUtZzIubXAzJyxcbiAgICAgIDU2OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNTYtZyMyLm1wMycsXG4gICAgICA1NzogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDU3LWEyLm1wMycsXG4gICAgICA1ODogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDU4LWEjMi5tcDMnLFxuICAgICAgNTk6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA1OS1oMi5tcDMnLFxuICAgICAgNjA6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA2MC1jMy5tcDMnLFxuICAgICAgNjE6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA2MS1jIzMubXAzJyxcbiAgICAgIDYyOiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNjItZDMubXAzJyxcbiAgICAgIDYzOiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNjMtZCMzLm1wMycsXG4gICAgICA2NDogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDY0LWUzLm1wMycsXG4gICAgICA2NTogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDY1LWYzLm1wMycsXG4gICAgICA2NjogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDY2LWYjMy5tcDMnLFxuICAgICAgNjc6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA2Ny1nMy5tcDMnLFxuICAgICAgNjg6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA2OC1nIzMubXAzJyxcbiAgICAgIDY5OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNjktYTMubXAzJyxcbiAgICAgIDcwOiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNzAtYSMzLm1wMycsXG4gICAgICA3MTogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDcxLWgzLm1wMycsXG4gICAgICA3MjogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDcyLWM0Lm1wMycsXG4gICAgICA3MzogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDczLWMjNC5tcDMnLFxuICAgICAgNzQ6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA3NC1kNC5tcDMnLFxuICAgICAgNzU6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA3NS1kIzQubXAzJyxcbiAgICAgIDc2OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNzYtZTQubXAzJyxcbiAgICAgIDc3OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNzctZjQubXAzJyxcbiAgICAgIDc4OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wNzgtZiM0Lm1wMycsXG4gICAgICA3OTogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDc5LWc0Lm1wMycsXG4gICAgICA4MDogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDgwLWcjNC5tcDMnLFxuICAgICAgODE6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA4MS1hNC5tcDMnLFxuICAgICAgODI6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA4Mi1hIzQubXAzJyxcbiAgICAgIDgzOiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wODMtaDQubXAzJyxcbiAgICAgIDg0OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wODQtYzUubXAzJyxcbiAgICAgIDg1OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wODUtYyM1Lm1wMycsXG4gICAgICA4NjogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDg2LWQ1Lm1wMycsXG4gICAgICA4NzogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDg3LWQjNS5tcDMnLFxuICAgICAgODg6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA4OC1lNS5tcDMnLFxuICAgICAgODk6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA4OS1mNS5tcDMnLFxuICAgICAgOTA6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA5MC1mIzUubXAzJyxcbiAgICAgIDkxOiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wOTEtZzUubXAzJyxcbiAgICAgIDkyOiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wOTItZyM1Lm1wMycsXG4gICAgICA5MzogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDkzLWE1Lm1wMycsXG4gICAgICA5NDogJ0ZyZWVzb3VuZFJob2Rlcy0wMDAtMDk0LWEjNS5tcDMnLFxuICAgICAgOTU6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA5NS1oNS5tcDMnLFxuICAgICAgOTY6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA5Ni1jNi5tcDMnLFxuICAgICAgOTc6ICdGcmVlc291bmRSaG9kZXMtMDAwLTA5Ny1jIzYubXAzJyxcbiAgICAgIDk4OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wOTgtZDYubXAzJyxcbiAgICAgIDk5OiAnRnJlZXNvdW5kUmhvZGVzLTAwMC0wOTktZCM2Lm1wMycsXG4gICAgICAxMDA6ICdGcmVlc291bmRSaG9kZXMtMDAwLTEwMC1lNi5tcDMnXG4gICAgfVxuXG4gICAgaW5zdHJ1bWVudC5wYXJzZVNhbXBsZURhdGEocmhvZGVzKS50aGVuKFxuICAgICAgZnVuY3Rpb24oKXtcbiAgICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoOTYwICogMCwgMTQ0LCA2MCwgMTAwKSlcbiAgICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoOTYwICogMSwgMTI4LCA2MCwgMCkpXG5cbiAgICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoOTYwICogMiwgMTQ0LCA2MiwgMTAwKSlcbiAgICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoOTYwICogMywgMTI4LCA2MiwgMCkpXG5cbiAgICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoOTYwICogNCwgMTQ0LCA2NCwgMTAwKSlcbiAgICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KG5ldyBNSURJRXZlbnQoOTYwICogNSwgMTI4LCA2NCwgMCkpXG4gICAgICB9XG4gICAgKVxuICB9XG5cbn0pXG4iLCIvKiBGaWxlU2F2ZXIuanNcbiAqIEEgc2F2ZUFzKCkgRmlsZVNhdmVyIGltcGxlbWVudGF0aW9uLlxuICogMS4xLjIwMTYwMzI4XG4gKlxuICogQnkgRWxpIEdyZXksIGh0dHA6Ly9lbGlncmV5LmNvbVxuICogTGljZW5zZTogTUlUXG4gKiAgIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZWxpZ3JleS9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuICovXG5cbi8qZ2xvYmFsIHNlbGYgKi9cbi8qanNsaW50IGJpdHdpc2U6IHRydWUsIGluZGVudDogNCwgbGF4YnJlYWs6IHRydWUsIGxheGNvbW1hOiB0cnVlLCBzbWFydHRhYnM6IHRydWUsIHBsdXNwbHVzOiB0cnVlICovXG5cbi8qISBAc291cmNlIGh0dHA6Ly9wdXJsLmVsaWdyZXkuY29tL2dpdGh1Yi9GaWxlU2F2ZXIuanMvYmxvYi9tYXN0ZXIvRmlsZVNhdmVyLmpzICovXG5cbnZhciBzYXZlQXMgPSBzYXZlQXMgfHwgKGZ1bmN0aW9uKHZpZXcpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdC8vIElFIDwxMCBpcyBleHBsaWNpdGx5IHVuc3VwcG9ydGVkXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIC9NU0lFIFsxLTldXFwuLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhclxuXHRcdCAgZG9jID0gdmlldy5kb2N1bWVudFxuXHRcdCAgLy8gb25seSBnZXQgVVJMIHdoZW4gbmVjZXNzYXJ5IGluIGNhc2UgQmxvYi5qcyBoYXNuJ3Qgb3ZlcnJpZGRlbiBpdCB5ZXRcblx0XHQsIGdldF9VUkwgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2aWV3LlVSTCB8fCB2aWV3LndlYmtpdFVSTCB8fCB2aWV3O1xuXHRcdH1cblx0XHQsIHNhdmVfbGluayA9IGRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsIFwiYVwiKVxuXHRcdCwgY2FuX3VzZV9zYXZlX2xpbmsgPSBcImRvd25sb2FkXCIgaW4gc2F2ZV9saW5rXG5cdFx0LCBjbGljayA9IGZ1bmN0aW9uKG5vZGUpIHtcblx0XHRcdHZhciBldmVudCA9IG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIik7XG5cdFx0XHRub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuXHRcdH1cblx0XHQsIGlzX3NhZmFyaSA9IC9WZXJzaW9uXFwvW1xcZFxcLl0rLipTYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcblx0XHQsIHdlYmtpdF9yZXFfZnMgPSB2aWV3LndlYmtpdFJlcXVlc3RGaWxlU3lzdGVtXG5cdFx0LCByZXFfZnMgPSB2aWV3LnJlcXVlc3RGaWxlU3lzdGVtIHx8IHdlYmtpdF9yZXFfZnMgfHwgdmlldy5tb3pSZXF1ZXN0RmlsZVN5c3RlbVxuXHRcdCwgdGhyb3dfb3V0c2lkZSA9IGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHQodmlldy5zZXRJbW1lZGlhdGUgfHwgdmlldy5zZXRUaW1lb3V0KShmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhyb3cgZXg7XG5cdFx0XHR9LCAwKTtcblx0XHR9XG5cdFx0LCBmb3JjZV9zYXZlYWJsZV90eXBlID0gXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIlxuXHRcdCwgZnNfbWluX3NpemUgPSAwXG5cdFx0Ly8gdGhlIEJsb2IgQVBJIGlzIGZ1bmRhbWVudGFsbHkgYnJva2VuIGFzIHRoZXJlIGlzIG5vIFwiZG93bmxvYWRmaW5pc2hlZFwiIGV2ZW50IHRvIHN1YnNjcmliZSB0b1xuXHRcdCwgYXJiaXRyYXJ5X3Jldm9rZV90aW1lb3V0ID0gMTAwMCAqIDQwIC8vIGluIG1zXG5cdFx0LCByZXZva2UgPSBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHR2YXIgcmV2b2tlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0Z2V0X1VSTCgpLnJldm9rZU9iamVjdFVSTChmaWxlKTtcblx0XHRcdFx0fSBlbHNlIHsgLy8gZmlsZSBpcyBhIEZpbGVcblx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0LyogLy8gVGFrZSBub3RlIFczQzpcblx0XHRcdHZhclxuXHRcdFx0ICB1cmkgPSB0eXBlb2YgZmlsZSA9PT0gXCJzdHJpbmdcIiA/IGZpbGUgOiBmaWxlLnRvVVJMKClcblx0XHRcdCwgcmV2b2tlciA9IGZ1bmN0aW9uKGV2dCkge1xuXHRcdFx0XHQvLyBpZGVhbHkgRG93bmxvYWRGaW5pc2hlZEV2ZW50LmRhdGEgd291bGQgYmUgdGhlIFVSTCByZXF1ZXN0ZWRcblx0XHRcdFx0aWYgKGV2dC5kYXRhID09PSB1cmkpIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGZpbGUgPT09IFwic3RyaW5nXCIpIHsgLy8gZmlsZSBpcyBhbiBvYmplY3QgVVJMXG5cdFx0XHRcdFx0XHRnZXRfVVJMKCkucmV2b2tlT2JqZWN0VVJMKGZpbGUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIGZpbGUgaXMgYSBGaWxlXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0O1xuXHRcdFx0dmlldy5hZGRFdmVudExpc3RlbmVyKFwiZG93bmxvYWRmaW5pc2hlZFwiLCByZXZva2VyKTtcblx0XHRcdCovXG5cdFx0XHRzZXRUaW1lb3V0KHJldm9rZXIsIGFyYml0cmFyeV9yZXZva2VfdGltZW91dCk7XG5cdFx0fVxuXHRcdCwgZGlzcGF0Y2ggPSBmdW5jdGlvbihmaWxlc2F2ZXIsIGV2ZW50X3R5cGVzLCBldmVudCkge1xuXHRcdFx0ZXZlbnRfdHlwZXMgPSBbXS5jb25jYXQoZXZlbnRfdHlwZXMpO1xuXHRcdFx0dmFyIGkgPSBldmVudF90eXBlcy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdHZhciBsaXN0ZW5lciA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF90eXBlc1tpXV07XG5cdFx0XHRcdGlmICh0eXBlb2YgbGlzdGVuZXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRsaXN0ZW5lci5jYWxsKGZpbGVzYXZlciwgZXZlbnQgfHwgZmlsZXNhdmVyKTtcblx0XHRcdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRcdFx0dGhyb3dfb3V0c2lkZShleCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCwgYXV0b19ib20gPSBmdW5jdGlvbihibG9iKSB7XG5cdFx0XHQvLyBwcmVwZW5kIEJPTSBmb3IgVVRGLTggWE1MIGFuZCB0ZXh0LyogdHlwZXMgKGluY2x1ZGluZyBIVE1MKVxuXHRcdFx0aWYgKC9eXFxzKig/OnRleHRcXC9cXFMqfGFwcGxpY2F0aW9uXFwveG1sfFxcUypcXC9cXFMqXFwreG1sKVxccyo7LipjaGFyc2V0XFxzKj1cXHMqdXRmLTgvaS50ZXN0KGJsb2IudHlwZSkpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBCbG9iKFtcIlxcdWZlZmZcIiwgYmxvYl0sIHt0eXBlOiBibG9iLnR5cGV9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBibG9iO1xuXHRcdH1cblx0XHQsIEZpbGVTYXZlciA9IGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdC8vIEZpcnN0IHRyeSBhLmRvd25sb2FkLCB0aGVuIHdlYiBmaWxlc3lzdGVtLCB0aGVuIG9iamVjdCBVUkxzXG5cdFx0XHR2YXJcblx0XHRcdFx0ICBmaWxlc2F2ZXIgPSB0aGlzXG5cdFx0XHRcdCwgdHlwZSA9IGJsb2IudHlwZVxuXHRcdFx0XHQsIGJsb2JfY2hhbmdlZCA9IGZhbHNlXG5cdFx0XHRcdCwgb2JqZWN0X3VybFxuXHRcdFx0XHQsIHRhcmdldF92aWV3XG5cdFx0XHRcdCwgZGlzcGF0Y2hfYWxsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgd3JpdGVlbmRcIi5zcGxpdChcIiBcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIG9uIGFueSBmaWxlc3lzIGVycm9ycyByZXZlcnQgdG8gc2F2aW5nIHdpdGggb2JqZWN0IFVSTHNcblx0XHRcdFx0LCBmc19lcnJvciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICh0YXJnZXRfdmlldyAmJiBpc19zYWZhcmkgJiYgdHlwZW9mIEZpbGVSZWFkZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRcdC8vIFNhZmFyaSBkb2Vzbid0IGFsbG93IGRvd25sb2FkaW5nIG9mIGJsb2IgdXJsc1xuXHRcdFx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdFx0XHRyZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBiYXNlNjREYXRhID0gcmVhZGVyLnJlc3VsdDtcblx0XHRcdFx0XHRcdFx0dGFyZ2V0X3ZpZXcubG9jYXRpb24uaHJlZiA9IFwiZGF0YTphdHRhY2htZW50L2ZpbGVcIiArIGJhc2U2NERhdGEuc2xpY2UoYmFzZTY0RGF0YS5zZWFyY2goL1ssO10vKSk7XG5cdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xuXHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuSU5JVDtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZG9uJ3QgY3JlYXRlIG1vcmUgb2JqZWN0IFVSTHMgdGhhbiBuZWVkZWRcblx0XHRcdFx0XHRpZiAoYmxvYl9jaGFuZ2VkIHx8ICFvYmplY3RfdXJsKSB7XG5cdFx0XHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRhcmdldF92aWV3KSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRfdmlldy5sb2NhdGlvbi5ocmVmID0gb2JqZWN0X3VybDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dmFyIG5ld190YWIgPSB2aWV3Lm9wZW4ob2JqZWN0X3VybCwgXCJfYmxhbmtcIik7XG5cdFx0XHRcdFx0XHRpZiAobmV3X3RhYiA9PT0gdW5kZWZpbmVkICYmIGlzX3NhZmFyaSkge1xuXHRcdFx0XHRcdFx0XHQvL0FwcGxlIGRvIG5vdCBhbGxvdyB3aW5kb3cub3Blbiwgc2VlIGh0dHA6Ly9iaXQubHkvMWtaZmZSSVxuXHRcdFx0XHRcdFx0XHR2aWV3LmxvY2F0aW9uLmhyZWYgPSBvYmplY3RfdXJsXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLkRPTkU7XG5cdFx0XHRcdFx0ZGlzcGF0Y2hfYWxsKCk7XG5cdFx0XHRcdFx0cmV2b2tlKG9iamVjdF91cmwpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCwgYWJvcnRhYmxlID0gZnVuY3Rpb24oZnVuYykge1xuXHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmIChmaWxlc2F2ZXIucmVhZHlTdGF0ZSAhPT0gZmlsZXNhdmVyLkRPTkUpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdCwgY3JlYXRlX2lmX25vdF9mb3VuZCA9IHtjcmVhdGU6IHRydWUsIGV4Y2x1c2l2ZTogZmFsc2V9XG5cdFx0XHRcdCwgc2xpY2Vcblx0XHRcdDtcblx0XHRcdGZpbGVzYXZlci5yZWFkeVN0YXRlID0gZmlsZXNhdmVyLklOSVQ7XG5cdFx0XHRpZiAoIW5hbWUpIHtcblx0XHRcdFx0bmFtZSA9IFwiZG93bmxvYWRcIjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5fdXNlX3NhdmVfbGluaykge1xuXHRcdFx0XHRvYmplY3RfdXJsID0gZ2V0X1VSTCgpLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzYXZlX2xpbmsuaHJlZiA9IG9iamVjdF91cmw7XG5cdFx0XHRcdFx0c2F2ZV9saW5rLmRvd25sb2FkID0gbmFtZTtcblx0XHRcdFx0XHRjbGljayhzYXZlX2xpbmspO1xuXHRcdFx0XHRcdGRpc3BhdGNoX2FsbCgpO1xuXHRcdFx0XHRcdHJldm9rZShvYmplY3RfdXJsKTtcblx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Ly8gT2JqZWN0IGFuZCB3ZWIgZmlsZXN5c3RlbSBVUkxzIGhhdmUgYSBwcm9ibGVtIHNhdmluZyBpbiBHb29nbGUgQ2hyb21lIHdoZW5cblx0XHRcdC8vIHZpZXdlZCBpbiBhIHRhYiwgc28gSSBmb3JjZSBzYXZlIHdpdGggYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXG5cdFx0XHQvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD05MTE1OFxuXHRcdFx0Ly8gVXBkYXRlOiBHb29nbGUgZXJyYW50bHkgY2xvc2VkIDkxMTU4LCBJIHN1Ym1pdHRlZCBpdCBhZ2Fpbjpcblx0XHRcdC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0zODk2NDJcblx0XHRcdGlmICh2aWV3LmNocm9tZSAmJiB0eXBlICYmIHR5cGUgIT09IGZvcmNlX3NhdmVhYmxlX3R5cGUpIHtcblx0XHRcdFx0c2xpY2UgPSBibG9iLnNsaWNlIHx8IGJsb2Iud2Via2l0U2xpY2U7XG5cdFx0XHRcdGJsb2IgPSBzbGljZS5jYWxsKGJsb2IsIDAsIGJsb2Iuc2l6ZSwgZm9yY2Vfc2F2ZWFibGVfdHlwZSk7XG5cdFx0XHRcdGJsb2JfY2hhbmdlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHQvLyBTaW5jZSBJIGNhbid0IGJlIHN1cmUgdGhhdCB0aGUgZ3Vlc3NlZCBtZWRpYSB0eXBlIHdpbGwgdHJpZ2dlciBhIGRvd25sb2FkXG5cdFx0XHQvLyBpbiBXZWJLaXQsIEkgYXBwZW5kIC5kb3dubG9hZCB0byB0aGUgZmlsZW5hbWUuXG5cdFx0XHQvLyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NjU0NDBcblx0XHRcdGlmICh3ZWJraXRfcmVxX2ZzICYmIG5hbWUgIT09IFwiZG93bmxvYWRcIikge1xuXHRcdFx0XHRuYW1lICs9IFwiLmRvd25sb2FkXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZSA9PT0gZm9yY2Vfc2F2ZWFibGVfdHlwZSB8fCB3ZWJraXRfcmVxX2ZzKSB7XG5cdFx0XHRcdHRhcmdldF92aWV3ID0gdmlldztcblx0XHRcdH1cblx0XHRcdGlmICghcmVxX2ZzKSB7XG5cdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGZzX21pbl9zaXplICs9IGJsb2Iuc2l6ZTtcblx0XHRcdHJlcV9mcyh2aWV3LlRFTVBPUkFSWSwgZnNfbWluX3NpemUsIGFib3J0YWJsZShmdW5jdGlvbihmcykge1xuXHRcdFx0XHRmcy5yb290LmdldERpcmVjdG9yeShcInNhdmVkXCIsIGNyZWF0ZV9pZl9ub3RfZm91bmQsIGFib3J0YWJsZShmdW5jdGlvbihkaXIpIHtcblx0XHRcdFx0XHR2YXIgc2F2ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZGlyLmdldEZpbGUobmFtZSwgY3JlYXRlX2lmX25vdF9mb3VuZCwgYWJvcnRhYmxlKGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRcdFx0ZmlsZS5jcmVhdGVXcml0ZXIoYWJvcnRhYmxlKGZ1bmN0aW9uKHdyaXRlcikge1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci5vbndyaXRlZW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRhcmdldF92aWV3LmxvY2F0aW9uLmhyZWYgPSBmaWxlLnRvVVJMKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGlzcGF0Y2goZmlsZXNhdmVyLCBcIndyaXRlZW5kXCIsIGV2ZW50KTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldm9rZShmaWxlKTtcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdHdyaXRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgZXJyb3IgPSB3cml0ZXIuZXJyb3I7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZXJyb3IuY29kZSAhPT0gZXJyb3IuQUJPUlRfRVJSKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZzX2Vycm9yKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcIndyaXRlc3RhcnQgcHJvZ3Jlc3Mgd3JpdGUgYWJvcnRcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0d3JpdGVyW1wib25cIiArIGV2ZW50XSA9IGZpbGVzYXZlcltcIm9uXCIgKyBldmVudF07XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0d3JpdGVyLndyaXRlKGJsb2IpO1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVzYXZlci5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0d3JpdGVyLmFib3J0KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlc2F2ZXIucmVhZHlTdGF0ZSA9IGZpbGVzYXZlci5ET05FO1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuV1JJVElORztcblx0XHRcdFx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdFx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRkaXIuZ2V0RmlsZShuYW1lLCB7Y3JlYXRlOiBmYWxzZX0sIGFib3J0YWJsZShmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdFx0XHQvLyBkZWxldGUgZmlsZSBpZiBpdCBhbHJlYWR5IGV4aXN0c1xuXHRcdFx0XHRcdFx0ZmlsZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdHNhdmUoKTtcblx0XHRcdFx0XHR9KSwgYWJvcnRhYmxlKGZ1bmN0aW9uKGV4KSB7XG5cdFx0XHRcdFx0XHRpZiAoZXguY29kZSA9PT0gZXguTk9UX0ZPVU5EX0VSUikge1xuXHRcdFx0XHRcdFx0XHRzYXZlKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmc19lcnJvcigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0fSksIGZzX2Vycm9yKTtcblx0XHRcdH0pLCBmc19lcnJvcik7XG5cdFx0fVxuXHRcdCwgRlNfcHJvdG8gPSBGaWxlU2F2ZXIucHJvdG90eXBlXG5cdFx0LCBzYXZlQXMgPSBmdW5jdGlvbihibG9iLCBuYW1lLCBub19hdXRvX2JvbSkge1xuXHRcdFx0cmV0dXJuIG5ldyBGaWxlU2F2ZXIoYmxvYiwgbmFtZSwgbm9fYXV0b19ib20pO1xuXHRcdH1cblx0O1xuXHQvLyBJRSAxMCsgKG5hdGl2ZSBzYXZlQXMpXG5cdGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIG5hdmlnYXRvci5tc1NhdmVPck9wZW5CbG9iKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGJsb2IsIG5hbWUsIG5vX2F1dG9fYm9tKSB7XG5cdFx0XHRpZiAoIW5vX2F1dG9fYm9tKSB7XG5cdFx0XHRcdGJsb2IgPSBhdXRvX2JvbShibG9iKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuYXZpZ2F0b3IubXNTYXZlT3JPcGVuQmxvYihibG9iLCBuYW1lIHx8IFwiZG93bmxvYWRcIik7XG5cdFx0fTtcblx0fVxuXG5cdEZTX3Byb3RvLmFib3J0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZpbGVzYXZlciA9IHRoaXM7XG5cdFx0ZmlsZXNhdmVyLnJlYWR5U3RhdGUgPSBmaWxlc2F2ZXIuRE9ORTtcblx0XHRkaXNwYXRjaChmaWxlc2F2ZXIsIFwiYWJvcnRcIik7XG5cdH07XG5cdEZTX3Byb3RvLnJlYWR5U3RhdGUgPSBGU19wcm90by5JTklUID0gMDtcblx0RlNfcHJvdG8uV1JJVElORyA9IDE7XG5cdEZTX3Byb3RvLkRPTkUgPSAyO1xuXG5cdEZTX3Byb3RvLmVycm9yID1cblx0RlNfcHJvdG8ub253cml0ZXN0YXJ0ID1cblx0RlNfcHJvdG8ub25wcm9ncmVzcyA9XG5cdEZTX3Byb3RvLm9ud3JpdGUgPVxuXHRGU19wcm90by5vbmFib3J0ID1cblx0RlNfcHJvdG8ub25lcnJvciA9XG5cdEZTX3Byb3RvLm9ud3JpdGVlbmQgPVxuXHRcdG51bGw7XG5cblx0cmV0dXJuIHNhdmVBcztcbn0oXG5cdCAgIHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiICYmIHNlbGZcblx0fHwgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3dcblx0fHwgdGhpcy5jb250ZW50XG4pKTtcbi8vIGBzZWxmYCBpcyB1bmRlZmluZWQgaW4gRmlyZWZveCBmb3IgQW5kcm9pZCBjb250ZW50IHNjcmlwdCBjb250ZXh0XG4vLyB3aGlsZSBgdGhpc2AgaXMgbnNJQ29udGVudEZyYW1lTWVzc2FnZU1hbmFnZXJcbi8vIHdpdGggYW4gYXR0cmlidXRlIGBjb250ZW50YCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB3aW5kb3dcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMuc2F2ZUFzID0gc2F2ZUFzO1xufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkZWZpbmUgIT09IG51bGwpICYmIChkZWZpbmUuYW1kICE9PSBudWxsKSkge1xuICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzYXZlQXM7XG4gIH0pO1xufVxuIiwiLy8gdGhlIHdoYXR3Zy1mZXRjaCBwb2x5ZmlsbCBpbnN0YWxscyB0aGUgZmV0Y2goKSBmdW5jdGlvblxuLy8gb24gdGhlIGdsb2JhbCBvYmplY3QgKHdpbmRvdyBvciBzZWxmKVxuLy9cbi8vIFJldHVybiB0aGF0IGFzIHRoZSBleHBvcnQgZm9yIHVzZSBpbiBXZWJwYWNrLCBCcm93c2VyaWZ5IGV0Yy5cbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xubW9kdWxlLmV4cG9ydHMgPSBzZWxmLmZldGNoLmJpbmQoc2VsZik7XG4iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG5cbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgbGlzdCA9IHRoaXMubWFwW25hbWVdXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICBsaXN0ID0gW11cbiAgICAgIHRoaXMubWFwW25hbWVdID0gbGlzdFxuICAgIH1cbiAgICBsaXN0LnB1c2godmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gICAgcmV0dXJuIHZhbHVlcyA/IHZhbHVlc1swXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gfHwgW11cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBbbm9ybWFsaXplVmFsdWUodmFsdWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5tYXApLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGhpcy5tYXBbbmFtZV0uZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBuYW1lLCB0aGlzKVxuICAgICAgfSwgdGhpcylcbiAgICB9LCB0aGlzKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgLy8gT25seSBzdXBwb3J0IEFycmF5QnVmZmVycyBmb3IgUE9TVCBtZXRob2QuXG4gICAgICAgIC8vIFJlY2VpdmluZyBBcnJheUJ1ZmZlcnMgaGFwcGVucyB2aWEgQmxvYnMsIGluc3RlYWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcbiAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBpbnB1dFxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9ICh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpLnRyaW0oKS5zcGxpdCgnXFxuJylcbiAgICBwYWlycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgdmFyIHNwbGl0ID0gaGVhZGVyLnRyaW0oKS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gc3BsaXQuc2hpZnQoKS50cmltKClcbiAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJzonKS50cmltKClcbiAgICAgIGhlYWQuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfSlcbiAgICByZXR1cm4gaGVhZFxuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9IG9wdGlvbnMuc3RhdHVzVGV4dFxuICAgIHRoaXMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMgPyBvcHRpb25zLmhlYWRlcnMgOiBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVyc1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZVxuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0XG4gICAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkgJiYgIWluaXQpIHtcbiAgICAgICAgcmVxdWVzdCA9IGlucHV0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB9XG5cbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBmdW5jdGlvbiByZXNwb25zZVVSTCgpIHtcbiAgICAgICAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgICAgIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyh4aHIpLFxuICAgICAgICAgIHVybDogcmVzcG9uc2VVUkwoKVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCJcbi8vIHN0YW5kYXJkIE1JREkgZXZlbnRzXG5jb25zdCBNSURJRXZlbnRUeXBlcyA9IHt9XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ05PVEVfT0ZGJywge3ZhbHVlOiAweDgwfSkgLy8xMjhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ05PVEVfT04nLCB7dmFsdWU6IDB4OTB9KSAvLzE0NFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnUE9MWV9QUkVTU1VSRScsIHt2YWx1ZTogMHhBMH0pIC8vMTYwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDT05UUk9MX0NIQU5HRScsIHt2YWx1ZTogMHhCMH0pIC8vMTc2XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdQUk9HUkFNX0NIQU5HRScsIHt2YWx1ZTogMHhDMH0pIC8vMTkyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDSEFOTkVMX1BSRVNTVVJFJywge3ZhbHVlOiAweEQwfSkgLy8yMDhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1BJVENIX0JFTkQnLCB7dmFsdWU6IDB4RTB9KSAvLzIyNFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1lTVEVNX0VYQ0xVU0lWRScsIHt2YWx1ZTogMHhGMH0pIC8vMjQwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdNSURJX1RJTUVDT0RFJywge3ZhbHVlOiAyNDF9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU09OR19QT1NJVElPTicsIHt2YWx1ZTogMjQyfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NPTkdfU0VMRUNUJywge3ZhbHVlOiAyNDN9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVFVORV9SRVFVRVNUJywge3ZhbHVlOiAyNDZ9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnRU9YJywge3ZhbHVlOiAyNDd9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnVElNSU5HX0NMT0NLJywge3ZhbHVlOiAyNDh9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JRElFdmVudFR5cGVzLCAnU1RBUlQnLCB7dmFsdWU6IDI1MH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdDT05USU5VRScsIHt2YWx1ZTogMjUxfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NUT1AnLCB7dmFsdWU6IDI1Mn0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdBQ1RJVkVfU0VOU0lORycsIHt2YWx1ZTogMjU0fSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJRXZlbnRUeXBlcywgJ1NZU1RFTV9SRVNFVCcsIHt2YWx1ZTogMjU1fSlcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdURU1QTycsIHt2YWx1ZTogMHg1MX0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdUSU1FX1NJR05BVFVSRScsIHt2YWx1ZTogMHg1OH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESUV2ZW50VHlwZXMsICdFTkRfT0ZfVFJBQ0snLCB7dmFsdWU6IDB4MkZ9KVxuXG5leHBvcnQge01JRElFdmVudFR5cGVzfVxuIiwibGV0IGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2ZW50KXtcbiAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlKVxuICBsZXQgbWFwXG5cbiAgaWYoZXZlbnQudHlwZSA9PT0gJ2V2ZW50Jyl7XG4gICAgbGV0IG1pZGlFdmVudCA9IGV2ZW50LmRhdGFcbiAgICBsZXQgbWlkaUV2ZW50VHlwZSA9IG1pZGlFdmVudC50eXBlXG4gICAgLy9jb25zb2xlLmxvZyhtaWRpRXZlbnRUeXBlKVxuICAgIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyhtaWRpRXZlbnRUeXBlKSl7XG4gICAgICBtYXAgPSBldmVudExpc3RlbmVycy5nZXQobWlkaUV2ZW50VHlwZSlcbiAgICAgIGZvcihsZXQgY2Igb2YgbWFwLnZhbHVlcygpKXtcbiAgICAgICAgY2IobWlkaUV2ZW50KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnRMaXN0ZW5lcnMuaGFzKGV2ZW50LnR5cGUpKVxuICBpZihldmVudExpc3RlbmVycy5oYXMoZXZlbnQudHlwZSkgPT09IGZhbHNlKXtcbiAgICByZXR1cm5cbiAgfVxuXG4gIG1hcCA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudC50eXBlKVxuICBmb3IobGV0IGNiIG9mIG1hcC52YWx1ZXMoKSl7XG4gICAgY2IoZXZlbnQpXG4gIH1cblxuXG4gIC8vIEB0b2RvOiBydW4gZmlsdGVycyBoZXJlLCBmb3IgaW5zdGFuY2UgaWYgYW4gZXZlbnRsaXN0ZW5lciBoYXMgYmVlbiBhZGRlZCB0byBhbGwgTk9URV9PTiBldmVudHMsIGNoZWNrIHRoZSB0eXBlIG9mIHRoZSBpbmNvbWluZyBldmVudFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgY2FsbGJhY2spe1xuXG4gIGxldCBtYXBcbiAgbGV0IGlkID0gYCR7dHlwZX1fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG5cbiAgaWYoZXZlbnRMaXN0ZW5lcnMuaGFzKHR5cGUpID09PSBmYWxzZSl7XG4gICAgbWFwID0gbmV3IE1hcCgpXG4gICAgZXZlbnRMaXN0ZW5lcnMuc2V0KHR5cGUsIG1hcClcbiAgfWVsc2V7XG4gICAgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpXG4gIH1cblxuICBtYXAuc2V0KGlkLCBjYWxsYmFjaylcbiAgLy9jb25zb2xlLmxvZyhldmVudExpc3RlbmVycylcbiAgcmV0dXJuIGlkXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaWQpe1xuXG4gIGlmKGV2ZW50TGlzdGVuZXJzLmhhcyh0eXBlKSA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUubG9nKCdubyBldmVudGxpc3RlbmVycyBvZiB0eXBlJyArIHR5cGUpXG4gICAgcmV0dXJuXG4gIH1cblxuICBsZXQgbWFwID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KHR5cGUpXG5cbiAgaWYodHlwZW9mIGlkID09PSAnZnVuY3Rpb24nKXtcbiAgICBmb3IobGV0IFtrZXksIHZhbHVlXSBvZiBtYXAuZW50cmllcygpKSB7XG4gICAgICBjb25zb2xlLmxvZyhrZXksIHZhbHVlKVxuICAgICAgaWYodmFsdWUgPT09IGlkKXtcbiAgICAgICAgY29uc29sZS5sb2coa2V5KVxuICAgICAgICBpZCA9IGtleVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBpZih0eXBlb2YgaWQgPT09ICdzdHJpbmcnKXtcbiAgICAgIG1hcC5kZWxldGUoaWQpXG4gICAgfVxuICB9ZWxzZSBpZih0eXBlb2YgaWQgPT09ICdzdHJpbmcnKXtcbiAgICBtYXAuZGVsZXRlKGlkKVxuICB9ZWxzZXtcbiAgICBjb25zb2xlLmxvZygnY291bGQgbm90IHJlbW92ZSBldmVudGxpc3RlbmVyJylcbiAgfVxufVxuXG4iLCIvLyBmZXRjaCBoZWxwZXJzXG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0dXMocmVzcG9uc2UpIHtcbiAgaWYocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApe1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2UpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0KSlcblxufVxuXG5leHBvcnQgZnVuY3Rpb24ganNvbihyZXNwb25zZSl7XG4gIHJldHVybiByZXNwb25zZS5qc29uKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFycmF5QnVmZmVyKHJlc3BvbnNlKXtcbiAgcmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKClcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hKU09OKHVybCl7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihqc29uKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgcmVzb2x2ZShkYXRhKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoQXJyYXlidWZmZXIodXJsKXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBmZXRjaCh1cmwpXG4gICAgLnRoZW4oc3RhdHVzKVxuICAgIC50aGVuKGFycmF5QnVmZmVyKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgcmVzb2x2ZShkYXRhKVxuICAgIH0pXG4gICAgLmNhdGNoKGUgPT4ge1xuICAgICAgcmVqZWN0KGUpXG4gICAgfSlcbiAgfSlcbn1cbiIsImltcG9ydCBxYW1iaSBmcm9tICcuL3FhbWJpJ1xuaW1wb3J0IHtTb25nfSBmcm9tICcuL3NvbmcnXG5pbXBvcnQge0luc3RydW1lbnR9IGZyb20gJy4vaW5zdHJ1bWVudCdcbmltcG9ydCB7aW5pdEF1ZGlvfSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge2luaXRNSURJfSBmcm9tICcuL2luaXRfbWlkaSdcblxuZXhwb3J0IGxldCBnZXRVc2VyTWVkaWEgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybignZ2V0VXNlck1lZGlhIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZXhwb3J0IGxldCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybigncmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZXhwb3J0IGxldCBCbG9iID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB3aW5kb3cuQmxvYiB8fCB3aW5kb3cud2Via2l0QmxvYlxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybignQmxvYiBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmZ1bmN0aW9uIGxvYWRJbnN0cnVtZW50KGRhdGEpe1xuICBsZXQgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50KClcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpbnN0cnVtZW50LnBhcnNlU2FtcGxlRGF0YShkYXRhKVxuICAgIC50aGVuKCgpID0+IHJlc29sdmUoaW5zdHJ1bWVudCkpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KHNldHRpbmdzID0gbnVsbCk6IHZvaWR7XG5cbiAgLy8gbG9hZCBzZXR0aW5ncy5pbnN0cnVtZW50cyAoYXJyYXkgb3Igb2JqZWN0KVxuICAvLyBsb2FkIHNldHRpbmdzLm1pZGlmaWxlcyAoYXJyYXkgb3Igb2JqZWN0KVxuICAvKlxuXG4gIHFhbWJpLmluaXQoe1xuICAgIHNvbmc6IHtcbiAgICAgIHR5cGU6ICdTb25nJyxcbiAgICAgIHVybDogJy4uL2RhdGEvbWludXRlX3dhbHR6Lm1pZCdcbiAgICB9LFxuICAgIHBpYW5vOiB7XG4gICAgICB0eXBlOiAnSW5zdHJ1bWVudCcsXG4gICAgICB1cmw6ICcuLi8uLi9pbnN0cnVtZW50cy9lbGVjdHJpYy1waWFuby5qc29uJ1xuICAgIH1cbiAgfSlcblxuICBxYW1iaS5pbml0KHtcbiAgICBpbnN0cnVtZW50czogWycuLi9pbnN0cnVtZW50cy9waWFubycsICcuLi9pbnN0cnVtZW50cy92aW9saW4nXSxcbiAgICBtaWRpZmlsZXM6IFsnLi4vbWlkaS9tb3phcnQubWlkJ11cbiAgfSlcbiAgLnRoZW4oKGxvYWRlZCkgPT4ge1xuICAgIGxldCBbcGlhbm8sIHZpb2xpbl0gPSBsb2FkZWQuaW5zdHJ1bWVudHNcbiAgICBsZXQgW21vemFydF0gPSBsb2FkZWQubWlkaWZpbGVzXG4gIH0pXG5cbiAgKi9cblxuICBsZXQgcHJvbWlzZXMgPSBbaW5pdEF1ZGlvKCksIGluaXRNSURJKCldXG4gIGxldCBsb2FkS2V5c1xuXG4gIGlmKHNldHRpbmdzICE9PSBudWxsKXtcbiAgICBsb2FkS2V5cyA9IE9iamVjdC5rZXlzKHNldHRpbmdzKVxuICAgIGZvcihsZXQga2V5IG9mIGxvYWRLZXlzKXtcbiAgICAgIGxldCBkYXRhID0gc2V0dGluZ3Nba2V5XVxuXG4gICAgICBpZihkYXRhLnR5cGUgPT09ICdTb25nJyl7XG4gICAgICAgIHByb21pc2VzLnB1c2goU29uZy5mcm9tTUlESUZpbGVBc3luYyhkYXRhLnVybCkpXG4gICAgICB9ZWxzZSBpZihkYXRhLnR5cGUgPT09ICdJbnN0cnVtZW50Jyl7XG4gICAgICAgIHByb21pc2VzLnB1c2gobG9hZEluc3RydW1lbnQoZGF0YSkpXG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgLnRoZW4oXG4gICAgKHJlc3VsdCkgPT4ge1xuXG4gICAgICBsZXQgcmV0dXJuT2JqID0ge31cblxuICAgICAgcmVzdWx0LmZvckVhY2goKGRhdGEsIGkpID0+IHtcbiAgICAgICAgaWYoaSA9PT0gMCl7XG4gICAgICAgICAgLy8gcGFyc2VBdWRpb1xuICAgICAgICAgIHJldHVybk9iai5sZWdhY3kgPSBkYXRhLmxlZ2FjeVxuICAgICAgICAgIHJldHVybk9iai5tcDMgPSBkYXRhLm1wM1xuICAgICAgICAgIHJldHVybk9iai5vZ2cgPSBkYXRhLm9nZ1xuICAgICAgICB9ZWxzZSBpZihpID09PSAxKXtcbiAgICAgICAgICAvLyBwYXJzZU1JRElcbiAgICAgICAgICByZXR1cm5PYmoubWlkaSA9IGRhdGEubWlkaVxuICAgICAgICAgIHJldHVybk9iai53ZWJtaWRpID0gZGF0YS53ZWJtaWRpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIC8vIEluc3RydW1lbnRzLCBzYW1wbGVzIG9yIE1JREkgZmlsZXMgdGhhdCBnb3QgbG9hZGVkIGR1cmluZyBpbml0aWFsaXphdGlvblxuICAgICAgICAgIHJlc3VsdFtsb2FkS2V5c1tpIC0gMl1dID0gZGF0YVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBjb25zb2xlLmxvZygncWFtYmknLCBxYW1iaS52ZXJzaW9uKVxuICAgICAgcmVzb2x2ZShyZXN1bHQpXG4gICAgfSxcbiAgICAoZXJyb3IpID0+IHtcbiAgICAgIHJlamVjdChlcnJvcilcbiAgICB9KVxuICB9KVxuXG5cbi8qXG4gIFByb21pc2UuYWxsKFtpbml0QXVkaW8oKSwgaW5pdE1JREkoKV0pXG4gIC50aGVuKFxuICAoZGF0YSkgPT4ge1xuICAgIC8vIHBhcnNlQXVkaW9cbiAgICBsZXQgZGF0YUF1ZGlvID0gZGF0YVswXVxuXG4gICAgLy8gcGFyc2VNSURJXG4gICAgbGV0IGRhdGFNaWRpID0gZGF0YVsxXVxuXG4gICAgY2FsbGJhY2soe1xuICAgICAgbGVnYWN5OiBkYXRhQXVkaW8ubGVnYWN5LFxuICAgICAgbXAzOiBkYXRhQXVkaW8ubXAzLFxuICAgICAgb2dnOiBkYXRhQXVkaW8ub2dnLFxuICAgICAgbWlkaTogZGF0YU1pZGkubWlkaSxcbiAgICAgIHdlYm1pZGk6IGRhdGFNaWRpLndlYm1pZGksXG4gICAgfSlcbiAgfSxcbiAgKGVycm9yKSA9PiB7XG4gICAgY2FsbGJhY2soZXJyb3IpXG4gIH0pXG4qL1xufVxuIiwiLypcbiAgU2V0cyB1cCB0aGUgYmFzaWMgYXVkaW8gcm91dGluZywgdGVzdHMgd2hpY2ggYXVkaW8gZm9ybWF0cyBhcmUgc3VwcG9ydGVkIGFuZCBwYXJzZXMgdGhlIHNhbXBsZXMgZm9yIHRoZSBtZXRyb25vbWUgdGlja3MuXG4qL1xuXG5pbXBvcnQgc2FtcGxlcyBmcm9tICcuL3NhbXBsZXMnXG5pbXBvcnQge3BhcnNlU2FtcGxlc30gZnJvbSAnLi9wYXJzZV9hdWRpbydcblxubGV0XG4gIG1hc3RlckdhaW4sXG4gIGNvbXByZXNzb3IsXG4gIGluaXRpYWxpemVkID0gZmFsc2UsXG4gIGRhdGFcblxuZXhwb3J0IGxldCBjb250ZXh0ID0gKGZ1bmN0aW9uKCl7XG4gIC8vY29uc29sZS5sb2coJ2luaXQgQXVkaW9Db250ZXh0JylcbiAgbGV0IGN0eFxuICBpZih0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jyl7XG4gICAgbGV0IEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dFxuICAgIGlmKEF1ZGlvQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpXG4gICAgfVxuICB9XG4gIGlmKHR5cGVvZiBjdHggPT09ICd1bmRlZmluZWQnKXtcbiAgICAvL0BUT0RPOiBjcmVhdGUgZHVtbXkgQXVkaW9Db250ZXh0IGZvciB1c2UgaW4gbm9kZSwgc2VlOiBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9hdWRpby1jb250ZXh0XG4gICAgY29udGV4dCA9IHtcbiAgICAgIGNyZWF0ZUdhaW46IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2FpbjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY3JlYXRlT3NjaWxsYXRvcjogZnVuY3Rpb24oKXt9LFxuICAgIH1cbiAgfVxuICByZXR1cm4gY3R4XG59KCkpXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRBdWRpbygpe1xuXG4gIGlmKHR5cGVvZiBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID09PSAndW5kZWZpbmVkJyl7XG4gICAgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpblxuICB9XG4gIC8vIGNoZWNrIGZvciBvbGRlciBpbXBsZW1lbnRhdGlvbnMgb2YgV2ViQXVkaW9cbiAgZGF0YSA9IHt9XG4gIGxldCBzb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gIGRhdGEubGVnYWN5ID0gZmFsc2VcbiAgaWYodHlwZW9mIHNvdXJjZS5zdGFydCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGRhdGEubGVnYWN5ID0gdHJ1ZVxuICB9XG5cbiAgLy8gc2V0IHVwIHRoZSBlbGVtZW50YXJ5IGF1ZGlvIG5vZGVzXG4gIGNvbXByZXNzb3IgPSBjb250ZXh0LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvcigpXG4gIGNvbXByZXNzb3IuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICBtYXN0ZXJHYWluID0gY29udGV4dC5jcmVhdGVHYWluTm9kZSgpXG4gIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSAwLjVcbiAgaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgIHBhcnNlU2FtcGxlcyhzYW1wbGVzKS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQoYnVmZmVycyl7XG4gICAgICAgIC8vY29uc29sZS5sb2coYnVmZmVycylcbiAgICAgICAgZGF0YS5vZ2cgPSB0eXBlb2YgYnVmZmVycy5lbXB0eU9nZyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgZGF0YS5tcDMgPSB0eXBlb2YgYnVmZmVycy5lbXB0eU1wMyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgZGF0YS5sb3d0aWNrID0gYnVmZmVycy5sb3d0aWNrXG4gICAgICAgIGRhdGEuaGlnaHRpY2sgPSBidWZmZXJzLmhpZ2h0aWNrXG4gICAgICAgIGlmKGRhdGEub2dnID09PSBmYWxzZSAmJiBkYXRhLm1wMyA9PT0gZmFsc2Upe1xuICAgICAgICAgIHJlamVjdCgnTm8gc3VwcG9ydCBmb3Igb2dnIG5vciBtcDMhJylcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZShkYXRhKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25SZWplY3RlZCgpe1xuICAgICAgICByZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIGluaXRpYWxpemluZyBBdWRpbycpXG4gICAgICB9XG4gICAgKVxuICB9KVxufVxuXG5cbmxldCBzZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbih2YWx1ZTogbnVtYmVyID0gMC41KTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBzZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbih2YWx1ZTogbnVtYmVyID0gMC41KXtcbiAgICAgIGlmKHZhbHVlID4gMSl7XG4gICAgICAgIGNvbnNvbGUuaW5mbygnbWF4aW1hbCB2b2x1bWUgaXMgMS4wLCB2b2x1bWUgaXMgc2V0IHRvIDEuMCcpO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB2YWx1ZSA8IDAgPyAwIDogdmFsdWUgPiAxID8gMSA6IHZhbHVlXG4gICAgICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0TWFzdGVyVm9sdW1lKHZhbHVlKVxuICB9XG59XG5cblxubGV0IGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBtYXN0ZXJHYWluLmdhaW4udmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIGdldE1hc3RlclZvbHVtZSgpXG4gIH1cbn1cblxuXG5sZXQgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBjb21wcmVzc29yLnJlZHVjdGlvbi52YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24oKVxuICB9XG59XG5cblxubGV0IGVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbigpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihmbGFnOiBib29sZWFuKXtcbiAgICAgIGlmKGZsYWcpe1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb21wcmVzc29yKTtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZW5hYmxlTWFzdGVyQ29tcHJlc3NvcigpXG4gIH1cbn1cblxuXG5sZXQgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGNmZyk6IHZvaWR7XG4gIC8qXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gYXR0YWNrOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0ga25lZTsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByYXRpbzsgLy8gdW5pdC1sZXNzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVkdWN0aW9uOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlbGVhc2U7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSB0aHJlc2hvbGQ7IC8vIGluIERlY2liZWxzXG5cbiAgICBAc2VlOiBodHRwOi8vd2ViYXVkaW8uZ2l0aHViLmlvL3dlYi1hdWRpby1hcGkvI3RoZS1keW5hbWljc2NvbXByZXNzb3Jub2RlLWludGVyZmFjZVxuICAqL1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihjZmc6IHt9KXtcbiAgICAgICh7XG4gICAgICAgIGF0dGFjazogY29tcHJlc3Nvci5hdHRhY2sgPSAwLjAwMyxcbiAgICAgICAga25lZTogY29tcHJlc3Nvci5rbmVlID0gMzAsXG4gICAgICAgIHJhdGlvOiBjb21wcmVzc29yLnJhdGlvID0gMTIsXG4gICAgICAgIHJlZHVjdGlvbjogY29tcHJlc3Nvci5yZWR1Y3Rpb24gPSAwLFxuICAgICAgICByZWxlYXNlOiBjb21wcmVzc29yLnJlbGVhc2UgPSAwLjI1MCxcbiAgICAgICAgdGhyZXNob2xkOiBjb21wcmVzc29yLnRocmVzaG9sZCA9IC0yNCxcbiAgICAgIH0gPSBjZmcpXG4gICAgfVxuICAgIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IoY2ZnKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbml0RGF0YSgpe1xuICByZXR1cm4gZGF0YVxufVxuXG5leHBvcnQge21hc3RlckdhaW4sIGNvbXByZXNzb3IgYXMgbWFzdGVyQ29tcHJlc3Nvciwgc2V0TWFzdGVyVm9sdW1lLCBnZXRNYXN0ZXJWb2x1bWUsIGdldENvbXByZXNzaW9uUmVkdWN0aW9uLCBlbmFibGVNYXN0ZXJDb21wcmVzc29yLCBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yfVxuIiwiLypcbiAgUmVxdWVzdHMgTUlESSBhY2Nlc3MsIHF1ZXJpZXMgYWxsIGlucHV0cyBhbmQgb3V0cHV0cyBhbmQgc3RvcmVzIHRoZW0gaW4gYWxwaGFiZXRpY2FsIG9yZGVyXG4qL1xuXG5pbXBvcnQge3R5cGVTdHJpbmd9IGZyb20gJy4vdXRpbCdcblxuXG5sZXQgTUlESUFjY2Vzc1xubGV0IGluaXRpYWxpemVkID0gZmFsc2VcbmxldCBpbnB1dHMgPSBbXVxubGV0IG91dHB1dHMgPSBbXVxubGV0IGlucHV0SWRzID0gW11cbmxldCBvdXRwdXRJZHMgPSBbXVxubGV0IGlucHV0c0J5SWQgPSBuZXcgTWFwKClcbmxldCBvdXRwdXRzQnlJZCA9IG5ldyBNYXAoKVxuXG5sZXQgc29uZ01pZGlFdmVudExpc3RlbmVyXG5sZXQgbWlkaUV2ZW50TGlzdGVuZXJJZCA9IDBcblxuXG5mdW5jdGlvbiBnZXRNSURJcG9ydHMoKXtcbiAgaW5wdXRzID0gQXJyYXkuZnJvbShNSURJQWNjZXNzLmlucHV0cy52YWx1ZXMoKSlcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgaW5wdXRzLnNvcnQoKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xKVxuXG4gIGZvcihsZXQgcG9ydCBvZiBpbnB1dHMpe1xuICAgIGlucHV0c0J5SWQuc2V0KHBvcnQuaWQsIHBvcnQpXG4gICAgaW5wdXRJZHMucHVzaChwb3J0LmlkKVxuICB9XG5cbiAgb3V0cHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5vdXRwdXRzLnZhbHVlcygpKVxuXG4gIC8vc29ydCBwb3J0cyBieSBuYW1lIGFzY2VuZGluZ1xuICBvdXRwdXRzLnNvcnQoKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDw9IGIubmFtZS50b0xvd2VyQ2FzZSgpID8gMSA6IC0xKVxuXG4gIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgZm9yKGxldCBwb3J0IG9mIG91dHB1dHMpe1xuICAgIC8vY29uc29sZS5sb2cocG9ydC5pZCwgcG9ydC5uYW1lKVxuICAgIG91dHB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KVxuICAgIG91dHB1dElkcy5wdXNoKHBvcnQuaWQpXG4gIH1cbiAgLy9jb25zb2xlLmxvZyhvdXRwdXRzQnlJZClcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdE1JREkoKXtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIGlmKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgcmVzb2x2ZSh7bWlkaTogZmFsc2V9KVxuICAgIH1lbHNlIGlmKHR5cGVvZiBuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MgIT09ICd1bmRlZmluZWQnKXtcblxuICAgICAgbGV0IGphenosIG1pZGksIHdlYm1pZGlcblxuICAgICAgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzKCkudGhlbihcblxuICAgICAgICBmdW5jdGlvbiBvbkZ1bEZpbGxlZChtaWRpQWNjZXNzKXtcbiAgICAgICAgICBNSURJQWNjZXNzID0gbWlkaUFjY2Vzc1xuICAgICAgICAgIGlmKHR5cGVvZiBtaWRpQWNjZXNzLl9qYXp6SW5zdGFuY2VzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBqYXp6ID0gbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlc1swXS5fSmF6ei52ZXJzaW9uXG4gICAgICAgICAgICBtaWRpID0gdHJ1ZVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgd2VibWlkaSA9IHRydWVcbiAgICAgICAgICAgIG1pZGkgPSB0cnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZ2V0TUlESXBvcnRzKClcblxuICAgICAgICAgIC8vIG9uY29ubmVjdCBhbmQgb25kaXNjb25uZWN0IGFyZSBub3QgeWV0IGltcGxlbWVudGVkIGluIENocm9tZSBhbmQgQ2hyb21pdW1cbiAgICAgICAgICBtaWRpQWNjZXNzLm9uY29ubmVjdCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBjb25uZWN0ZWQnLCBlKVxuICAgICAgICAgICAgZ2V0TUlESXBvcnRzKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtaWRpQWNjZXNzLm9uZGlzY29ubmVjdCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RldmljZSBkaXNjb25uZWN0ZWQnLCBlKVxuICAgICAgICAgICAgZ2V0TUlESXBvcnRzKClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgIGphenosXG4gICAgICAgICAgICBtaWRpLFxuICAgICAgICAgICAgd2VibWlkaSxcbiAgICAgICAgICAgIGlucHV0cyxcbiAgICAgICAgICAgIG91dHB1dHMsXG4gICAgICAgICAgICBpbnB1dHNCeUlkLFxuICAgICAgICAgICAgb3V0cHV0c0J5SWQsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGUpXG4gICAgICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSByZXF1ZXN0aW5nIE1JRElBY2Nlc3MnLCBlKVxuICAgICAgICB9XG4gICAgICApXG4gICAgLy8gYnJvd3NlcnMgd2l0aG91dCBXZWJNSURJIEFQSVxuICAgIH1lbHNle1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICByZXNvbHZlKHttaWRpOiBmYWxzZX0pXG4gICAgfVxuICB9KVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUFjY2VzcyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUFjY2VzcyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gTUlESUFjY2Vzc1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUFjY2VzcygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESU91dHB1dHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG91dHB1dHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElPdXRwdXRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElJbnB1dHMgPSBmdW5jdGlvbigpe1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1JRElJbnB1dHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGlucHV0c1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0cygpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESU91dHB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0SWRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJT3V0cHV0SWRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElJbnB1dElkcyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBpbnB1dElkc1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0SWRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRCeUlkID0gZnVuY3Rpb24oaWQ6IHN0cmluZyl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbihfaWQpe1xuICAgICAgcmV0dXJuIG91dHB1dHNCeUlkLmdldChfaWQpXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJT3V0cHV0QnlJZChpZClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElJbnB1dEJ5SWQgPSBmdW5jdGlvbihpZDogc3RyaW5nKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24oX2lkKXtcbiAgICAgIHJldHVybiBpbnB1dHNCeUlkLmdldChfaWQpXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRCeUlkKGlkKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gaW5pdE1pZGlTb25nKHNvbmcpe1xuXG4gIHNvbmdNaWRpRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGUpe1xuICAgIC8vY29uc29sZS5sb2coZSlcbiAgICBoYW5kbGVNaWRpTWVzc2FnZVNvbmcoc29uZywgZSwgdGhpcyk7XG4gIH07XG5cbiAgLy8gYnkgZGVmYXVsdCBhIHNvbmcgbGlzdGVucyB0byBhbGwgYXZhaWxhYmxlIG1pZGktaW4gcG9ydHNcbiAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgcG9ydC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gICAgc29uZy5taWRpSW5wdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG5cbiAgb3V0cHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaUlucHV0U29uZyhzb25nLCBpZCwgZmxhZyl7XG4gIGxldCBpbnB1dCA9IGlucHV0cy5nZXQoaWQpO1xuXG4gIGlmKGlucHV0ID09PSB1bmRlZmluZWQpe1xuICAgIHdhcm4oJ25vIG1pZGkgaW5wdXQgd2l0aCBpZCcsIGlkLCAnZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihmbGFnID09PSBmYWxzZSl7XG4gICAgc29uZy5taWRpSW5wdXRzLmRlbGV0ZShpZCk7XG4gICAgaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICB9ZWxzZXtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KGlkLCBpbnB1dCk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaUlucHV0KGlkLCBmbGFnKTtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpT3V0cHV0U29uZyhzb25nLCBpZCwgZmxhZyl7XG4gIGxldCBvdXRwdXQgPSBvdXRwdXRzLmdldChpZCk7XG5cbiAgaWYob3V0cHV0ID09PSB1bmRlZmluZWQpe1xuICAgIHdhcm4oJ25vIG1pZGkgb3V0cHV0IHdpdGggaWQnLCBpZCwgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoZmxhZyA9PT0gZmFsc2Upe1xuICAgIHNvbmcubWlkaU91dHB1dHMuZGVsZXRlKGlkKTtcbiAgICBsZXQgdGltZSA9IHNvbmcuc2NoZWR1bGVyLmxhc3RFdmVudFRpbWUgKyAxMDA7XG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aW1lKTsgLy8gc3RvcCBhbGwgbm90ZXNcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3OSwgMHgwMF0sIHRpbWUpOyAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgfWVsc2V7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQoaWQsIG91dHB1dCk7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpT3V0cHV0KGlkLCBmbGFnKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBtaWRpTWVzc2FnZUV2ZW50LCBpbnB1dCl7XG4gIGxldCBtaWRpRXZlbnQgPSBuZXcgTWlkaUV2ZW50KHNvbmcudGlja3MsIC4uLm1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIC8vY29uc29sZS5sb2codHJhY2subWlkaUlucHV0cywgaW5wdXQpO1xuXG5cbiAgICAvL2lmKG1pZGlFdmVudC5jaGFubmVsID09PSB0cmFjay5jaGFubmVsIHx8IHRyYWNrLmNoYW5uZWwgPT09IDAgfHwgdHJhY2suY2hhbm5lbCA9PT0gJ2FueScpe1xuICAgIC8vICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2spO1xuICAgIC8vfVxuXG5cbiAgICAvLyBsaWtlIGluIEN1YmFzZSwgbWlkaSBldmVudHMgZnJvbSBhbGwgZGV2aWNlcywgc2VudCBvbiBhbnkgbWlkaSBjaGFubmVsIGFyZSBmb3J3YXJkZWQgdG8gYWxsIHRyYWNrc1xuICAgIC8vIHNldCB0cmFjay5tb25pdG9yIHRvIGZhbHNlIGlmIHlvdSBkb24ndCB3YW50IHRvIHJlY2VpdmUgbWlkaSBldmVudHMgb24gYSBjZXJ0YWluIHRyYWNrXG4gICAgLy8gbm90ZSB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYnkgZGVmYXVsdCBzZXQgdG8gZmFsc2UgYW5kIHRoYXQgdHJhY2subW9uaXRvciBpcyBhdXRvbWF0aWNhbGx5IHNldCB0byB0cnVlXG4gICAgLy8gaWYgeW91IGFyZSByZWNvcmRpbmcgb24gdGhhdCB0cmFja1xuICAgIC8vY29uc29sZS5sb2codHJhY2subW9uaXRvciwgdHJhY2suaWQsIGlucHV0LmlkKTtcbiAgICBpZih0cmFjay5tb25pdG9yID09PSB0cnVlICYmIHRyYWNrLm1pZGlJbnB1dHMuZ2V0KGlucHV0LmlkKSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjaywgaW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBsaXN0ZW5lcnMgPSBzb25nLm1pZGlFdmVudExpc3RlbmVycy5nZXQobWlkaUV2ZW50LnR5cGUpO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgZm9yKGxldCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpe1xuICAgICAgbGlzdGVuZXIobWlkaUV2ZW50LCBpbnB1dCk7XG4gICAgfVxuICB9XG59XG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayh0cmFjaywgbWlkaUV2ZW50LCBpbnB1dCl7XG4gIGxldCBzb25nID0gdHJhY2suc29uZyxcbiAgICBub3RlLCBsaXN0ZW5lcnMsIGNoYW5uZWw7XG4gICAgLy9kYXRhID0gbWlkaU1lc3NhZ2VFdmVudC5kYXRhLFxuICAgIC8vbWlkaUV2ZW50ID0gY3JlYXRlTWlkaUV2ZW50KHNvbmcudGlja3MsIGRhdGFbMF0sIGRhdGFbMV0sIGRhdGFbMl0pO1xuXG4gIC8vbWlkaUV2ZW50LnNvdXJjZSA9IG1pZGlNZXNzYWdlRXZlbnQuc3JjRWxlbWVudC5uYW1lO1xuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQpXG4gIC8vY29uc29sZS5sb2coJy0tLS0+JywgbWlkaUV2ZW50LnR5cGUpO1xuXG4gIC8vIGFkZCB0aGUgZXhhY3QgdGltZSBvZiB0aGlzIGV2ZW50IHNvIHdlIGNhbiBjYWxjdWxhdGUgaXRzIHRpY2tzIHBvc2l0aW9uXG4gIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMDsgLy8gbWlsbGlzXG4gIG1pZGlFdmVudC5zdGF0ZSA9ICdyZWNvcmRlZCc7XG5cbiAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgbm90ZSA9IGNyZWF0ZU1pZGlOb3RlKG1pZGlFdmVudCk7XG4gICAgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXSA9IG5vdGU7XG4gICAgLy90cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdID0gbm90ZTtcbiAgfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgbm90ZSA9IHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy8gY2hlY2sgaWYgdGhlIG5vdGUgZXhpc3RzOiBpZiB0aGUgdXNlciBwbGF5cyBub3RlcyBvbiBoZXIga2V5Ym9hcmQgYmVmb3JlIHRoZSBtaWRpIHN5c3RlbSBoYXNcbiAgICAvLyBiZWVuIGZ1bGx5IGluaXRpYWxpemVkLCBpdCBjYW4gaGFwcGVuIHRoYXQgdGhlIGZpcnN0IGluY29taW5nIG1pZGkgZXZlbnQgaXMgYSBOT1RFIE9GRiBldmVudFxuICAgIGlmKG5vdGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5vdGUuYWRkTm90ZU9mZihtaWRpRXZlbnQpO1xuICAgIGRlbGV0ZSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vZGVsZXRlIHRyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF07XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKHNvbmcucHJlcm9sbCwgc29uZy5yZWNvcmRpbmcsIHRyYWNrLnJlY29yZEVuYWJsZWQpO1xuXG4gIGlmKChzb25nLnByZXJvbGxpbmcgfHwgc29uZy5yZWNvcmRpbmcpICYmIHRyYWNrLnJlY29yZEVuYWJsZWQgPT09ICdtaWRpJyl7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICB0cmFjay5zb25nLnJlY29yZGVkTm90ZXMucHVzaChub3RlKTtcbiAgICB9XG4gICAgdHJhY2sucmVjb3JkUGFydC5hZGRFdmVudChtaWRpRXZlbnQpO1xuICAgIC8vIHNvbmcucmVjb3JkZWRFdmVudHMgaXMgdXNlZCBpbiB0aGUga2V5IGVkaXRvclxuICAgIHRyYWNrLnNvbmcucmVjb3JkZWRFdmVudHMucHVzaChtaWRpRXZlbnQpO1xuICB9ZWxzZSBpZih0cmFjay5lbmFibGVSZXRyb3NwZWN0aXZlUmVjb3JkaW5nKXtcbiAgICB0cmFjay5yZXRyb3NwZWN0aXZlUmVjb3JkaW5nLnB1c2gobWlkaUV2ZW50KTtcbiAgfVxuXG4gIC8vIGNhbGwgYWxsIG1pZGkgZXZlbnQgbGlzdGVuZXJzXG4gIGxpc3RlbmVycyA9IHRyYWNrLm1pZGlFdmVudExpc3RlbmVyc1ttaWRpRXZlbnQudHlwZV07XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBvYmplY3RGb3JFYWNoKGxpc3RlbmVycywgZnVuY3Rpb24obGlzdGVuZXIpe1xuICAgICAgbGlzdGVuZXIobWlkaUV2ZW50LCBpbnB1dCk7XG4gICAgfSk7XG4gIH1cblxuICBjaGFubmVsID0gdHJhY2suY2hhbm5lbDtcbiAgaWYoY2hhbm5lbCA9PT0gJ2FueScgfHwgY2hhbm5lbCA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKGNoYW5uZWwpID09PSB0cnVlKXtcbiAgICBjaGFubmVsID0gMDtcbiAgfVxuXG4gIG9iamVjdEZvckVhY2godHJhY2subWlkaU91dHB1dHMsIGZ1bmN0aW9uKG91dHB1dCl7XG4gICAgLy9jb25zb2xlLmxvZygnbWlkaSBvdXQnLCBvdXRwdXQsIG1pZGlFdmVudC50eXBlKTtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4IHx8IG1pZGlFdmVudC50eXBlID09PSAxNDQgfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMik7XG4gICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gICAgLy8gfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE5Mil7XG4gICAgLy8gICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMV0pO1xuICAgIH1cbiAgICAvL291dHB1dC5zZW5kKFttaWRpRXZlbnQuc3RhdHVzICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgfSk7XG5cbiAgLy8gQFRPRE86IG1heWJlIGEgdHJhY2sgc2hvdWxkIGJlIGFibGUgdG8gc2VuZCBpdHMgZXZlbnQgdG8gYm90aCBhIG1pZGktb3V0IHBvcnQgYW5kIGFuIGludGVybmFsIGhlYXJ0YmVhdCBzb25nP1xuICAvL2NvbnNvbGUubG9nKHRyYWNrLnJvdXRlVG9NaWRpT3V0KTtcbiAgaWYodHJhY2sucm91dGVUb01pZGlPdXQgPT09IGZhbHNlKXtcbiAgICBtaWRpRXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICB0cmFjay5pbnN0cnVtZW50LnByb2Nlc3NFdmVudChtaWRpRXZlbnQpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gYWRkTWlkaUV2ZW50TGlzdGVuZXIoLi4uYXJncyl7IC8vIGNhbGxlciBjYW4gYmUgYSB0cmFjayBvciBhIHNvbmdcblxuICBsZXQgaWQgPSBtaWRpRXZlbnRMaXN0ZW5lcklkKys7XG4gIGxldCBsaXN0ZW5lcjtcbiAgICB0eXBlcyA9IHt9LFxuICAgIGlkcyA9IFtdLFxuICAgIGxvb3A7XG5cblxuICAvLyBzaG91bGQgSSBpbmxpbmUgdGhpcz9cbiAgbG9vcCA9IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgIGZvcihsZXQgYXJnIG9mIGFyZ3Mpe1xuICAgICAgbGV0IHR5cGUgPSB0eXBlU3RyaW5nKGFyZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgICAgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgIGxvb3AoYXJnKTtcbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdmdW5jdGlvbicpe1xuICAgICAgICBsaXN0ZW5lciA9IGFyZztcbiAgICAgIH1lbHNlIGlmKGlzTmFOKGFyZykgPT09IGZhbHNlKXtcbiAgICAgICAgYXJnID0gcGFyc2VJbnQoYXJnLCAxMCk7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpe1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIGFyZyA9IHNlcXVlbmNlci5taWRpRXZlbnROdW1iZXJCeU5hbWUoYXJnKTtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGxvb3AoYXJncywgMCwgYXJncy5sZW5ndGgpO1xuICAvL2NvbnNvbGUubG9nKCd0eXBlcycsIHR5cGVzLCAnbGlzdGVuZXInLCBsaXN0ZW5lcik7XG5cbiAgb2JqZWN0Rm9yRWFjaCh0eXBlcywgZnVuY3Rpb24odHlwZSl7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICBpZihvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID09PSB1bmRlZmluZWQpe1xuICAgICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9IHt9O1xuICAgIH1cbiAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdW2lkXSA9IGxpc3RlbmVyO1xuICAgIGlkcy5wdXNoKHR5cGUgKyAnXycgKyBpZCk7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2cob2JqLm1pZGlFdmVudExpc3RlbmVycyk7XG4gIHJldHVybiBpZHMubGVuZ3RoID09PSAxID8gaWRzWzBdIDogaWRzO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVyKGlkLCBvYmope1xuICB2YXIgdHlwZTtcbiAgaWQgPSBpZC5zcGxpdCgnXycpO1xuICB0eXBlID0gaWRbMF07XG4gIGlkID0gaWRbMV07XG4gIGRlbGV0ZSBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdW2lkXTtcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcnMoKXtcblxufVxuXG4qL1xuIiwiaW1wb3J0IHtjcmVhdGVTYW1wbGV9IGZyb20gJy4vc2FtcGxlJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge2NyZWF0ZU5vdGV9IGZyb20gJy4vbm90ZSdcbmltcG9ydCB7cGFyc2VTYW1wbGVzLCBwYXJzZVNhbXBsZXMyfSBmcm9tICcuL3BhcnNlX2F1ZGlvJ1xuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2Rpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcbmltcG9ydCB7ZmV0Y2hKU09OfSBmcm9tICcuL2ZldGNoX2hlbHBlcnMnXG5cblxuY29uc3QgcHBxID0gNDgwXG5jb25zdCBicG0gPSAxMjBcbmNvbnN0IHBsYXliYWNrU3BlZWQgPSAxXG5jb25zdCBtaWxsaXNQZXJUaWNrID0gKDEgLyBwbGF5YmFja1NwZWVkICogNjApIC8gYnBtIC8gcHBxXG5cbmV4cG9ydCBjbGFzcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHR5cGU6IHN0cmluZyl7XG4gICAgdGhpcy5pZCA9IGlkXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIC8vIGNyZWF0ZSBhIHNhbXBsZXMgZGF0YSBvYmplY3QgZm9yIGFsbCAxMjggdmVsb2NpdHkgbGV2ZWxzIG9mIGFsbCAxMjggbm90ZXNcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSk7XG4gICAgdGhpcy5zYW1wbGVzRGF0YSA9IHRoaXMuc2FtcGxlc0RhdGEubWFwKGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbmV3IEFycmF5KDEyOCkuZmlsbCgtMSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSB7fVxuICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcyA9IFtdXG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgfVxuXG4gIGNvbm5lY3Qob3V0cHV0KXtcbiAgICB0aGlzLm91dHB1dCA9IG91dHB1dFxuICB9XG5cbiAgZGlzY29ubmVjdCgpe1xuICAgIHRoaXMub3V0cHV0ID0gbnVsbFxuICB9XG5cbiAgcHJvY2Vzc01JRElFdmVudChldmVudCwgdGltZSl7XG4gICAgbGV0IHNhbXBsZSwgc2FtcGxlRGF0YVxuICAgIGlmKGlzTmFOKHRpbWUpKXtcbiAgICAgIHRpbWUgPSBjb250ZXh0LmN1cnJlbnRUaW1lICsgKGV2ZW50LnRpY2tzICogbWlsbGlzUGVyVGljaylcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0aW1lKVxuXG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIC8vY29uc29sZS5sb2coMTQ0LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcblxuICAgICAgc2FtcGxlRGF0YSA9IHRoaXMuc2FtcGxlc0RhdGFbZXZlbnQuZGF0YTFdW2V2ZW50LmRhdGEyXTtcbiAgICAgIHNhbXBsZSA9IGNyZWF0ZVNhbXBsZShzYW1wbGVEYXRhLCBldmVudClcbiAgICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tldmVudC5taWRpTm90ZUlkXSA9IHNhbXBsZVxuICAgICAgc2FtcGxlLm91dHB1dC5jb25uZWN0KHRoaXMub3V0cHV0IHx8IGNvbnRleHQuZGVzdGluYXRpb24pXG4gICAgICAvLyBzYW1wbGUuc291cmNlLm9uZW5kZWQgPSAoKSA9PiB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCcgICAgZGVsZXRpbmcnLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgLy8gICBkZWxldGUgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICAvLyB9XG4gICAgICBzYW1wbGUuc3RhcnQodGltZSlcbiAgICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxpbmcnLCBldmVudC5pZCwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIC8vY29uc29sZS5sb2coJ3N0YXJ0JywgZXZlbnQubWlkaU5vdGVJZClcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgLy9jb25zb2xlLmxvZygxMjgsICc6JywgdGltZSwgY29udGV4dC5jdXJyZW50VGltZSwgZXZlbnQubWlsbGlzKVxuICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICBpZih0eXBlb2Ygc2FtcGxlID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKCdzYW1wbGUgbm90IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkLCAnIG1pZGlOb3RlJywgZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYodGhpcy5zdXN0YWluUGVkYWxEb3duID09PSB0cnVlKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWRpTm90ZUlkKVxuICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMucHVzaChldmVudC5taWRpTm90ZUlkKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsICgpID0+IHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wJywgdGltZSwgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICAgIH0pXG4gICAgICAgIC8vc2FtcGxlLnN0b3AodGltZSlcbiAgICAgIH1cbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgLy8gc3VzdGFpbiBwZWRhbFxuICAgICAgaWYoZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDEyNyl7XG4gICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gdHJ1ZVxuICAgICAgICAgIC8vLypcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgICAgZGF0YTogJ2Rvd24nXG4gICAgICAgICAgfSlcbiAgICAgICAgICAvLyovXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc3VzdGFpbiBwZWRhbCBkb3duJylcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzLmZvckVhY2goKG1pZGlOb3RlSWQpID0+IHtcbiAgICAgICAgICAgIHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlc1ttaWRpTm90ZUlkXVxuICAgICAgICAgICAgaWYoc2FtcGxlKXtcbiAgICAgICAgICAgICAgLy9zYW1wbGUuc3RvcCh0aW1lKVxuICAgICAgICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIG1pZGlOb3RlSWQpXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1ttaWRpTm90ZUlkXVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc3VzdGFpbiBwZWRhbCB1cCcsIHRoaXMuc3VzdGFpbmVkU2FtcGxlcylcbiAgICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMgPSBbXVxuICAgICAgICAgIC8vLypcbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICAgICAgZGF0YTogJ3VwJ1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8qL1xuICAgICAgICAgIC8vdGhpcy5zdG9wU3VzdGFpbih0aW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBwYW5uaW5nXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gMTApe1xuICAgICAgICAvLyBwYW5uaW5nIGlzICpub3QqIGV4YWN0bHkgdGltZWQgLT4gbm90IHBvc3NpYmxlICh5ZXQpIHdpdGggV2ViQXVkaW9cbiAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhMiwgcmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcbiAgICAgICAgLy90cmFjay5zZXRQYW5uaW5nKHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG5cbiAgICAgIC8vIHZvbHVtZVxuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTEgPT09IDcpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9sb2FkSlNPTihkYXRhKXtcbiAgICBpZih0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGRhdGEudXJsID09PSAnc3RyaW5nJyl7XG4gICAgICByZXR1cm4gZmV0Y2hKU09OKGRhdGEudXJsKVxuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRhdGEpXG4gIH1cblxuICAvLyBsb2FkIGFuZCBwYXJzZVxuICBwYXJzZVNhbXBsZURhdGEoZGF0YSl7XG5cbiAgICAvLyBjaGVjayBpZiB3ZSBoYXZlIHRvIG92ZXJydWxlIHRoZSBiYXNlVXJsIG9mIHRoZSBzYW1wZWxzXG4gICAgbGV0IGJhc2VVcmwgPSBudWxsXG4gICAgaWYodHlwZW9mIGRhdGEuYmFzZVVybCA9PT0gJ3N0cmluZycpe1xuICAgICAgYmFzZVVybCA9IGRhdGEuYmFzZVVybFxuICAgIH1cblxuICAgIGlmKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHRoaXMuc2V0UmVsZWFzZShkYXRhLnJlbGVhc2VbMF0sIGRhdGEucmVsZWFzZVsxXSlcbiAgICAgIGNvbnNvbGUubG9nKDEsIGRhdGEucmVsZWFzZVswXSwgZGF0YS5yZWxlYXNlWzFdKVxuICAgIH1cblxuICAgIC8vcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fbG9hZEpTT04oZGF0YSlcbiAgICAgIC50aGVuKChqc29uKSA9PiB7XG4gICAgICAgIC8vY29uc29sZS5sb2coanNvbilcbiAgICAgICAgZGF0YSA9IGpzb25cbiAgICAgICAgaWYoYmFzZVVybCAhPT0gbnVsbCl7XG4gICAgICAgICAganNvbi5iYXNlVXJsID0gYmFzZVVybFxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBkYXRhLnJlbGVhc2UgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICB0aGlzLnNldFJlbGVhc2UoZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgICAgY29uc29sZS5sb2coMiwgZGF0YS5yZWxlYXNlWzBdLCBkYXRhLnJlbGVhc2VbMV0pXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnNlU2FtcGxlcyhkYXRhKVxuICAgICAgfSlcbiAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgaWYodHlwZW9mIHJlc3VsdCA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgIGZvcihsZXQgbm90ZUlkIG9mIE9iamVjdC5rZXlzKHJlc3VsdCkpIHtcbiAgICAgICAgICAgIGxldCBidWZmZXIgPSByZXN1bHRbbm90ZUlkXVxuICAgICAgICAgICAgbGV0IHNhbXBsZURhdGEgPSBkYXRhW25vdGVJZF1cblxuXG4gICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2FtcGxlRGF0YSBpcyB1bmRlZmluZWQnLCBub3RlSWQpXG4gICAgICAgICAgICB9ZWxzZSBpZih0eXBlU3RyaW5nKGJ1ZmZlcikgPT09ICdhcnJheScpe1xuXG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYnVmZmVyLCBzYW1wbGVEYXRhKVxuICAgICAgICAgICAgICBzYW1wbGVEYXRhLmZvckVhY2goKHNkLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhub3RlSWQsIGJ1ZmZlcltpXSlcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Ygc2QgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgICAgICAgIHNkID0ge1xuICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlcltpXVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgc2QuYnVmZmVyID0gYnVmZmVyW2ldXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNkLm5vdGUgPSBwYXJzZUludChub3RlSWQsIDEwKVxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNhbXBsZURhdGEoc2QpXG4gICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIH1lbHNlIHtcblxuICAgICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgc2FtcGxlRGF0YS5idWZmZXIgPSBidWZmZXJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzYW1wbGVEYXRhLm5vdGUgPSBwYXJzZUludChub3RlSWQsIDEwKVxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgfWVsc2V7XG5cbiAgICAgICAgICByZXN1bHQuZm9yRWFjaCgoc2FtcGxlKSA9PiB7XG4gICAgICAgICAgICBsZXQgc2FtcGxlRGF0YSA9IGRhdGFbc2FtcGxlXVxuICAgICAgICAgICAgaWYodHlwZW9mIHNhbXBsZURhdGEgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NhbXBsZURhdGEgaXMgdW5kZWZpbmVkJywgc2FtcGxlKVxuICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICBpZih0eXBlb2Ygc2FtcGxlRGF0YSA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICBidWZmZXI6IHNhbXBsZS5idWZmZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHNhbXBsZURhdGEuYnVmZmVyID0gc2FtcGxlLmJ1ZmZlclxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNhbXBsZURhdGEubm90ZSA9IHNhbXBsZVxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpXG4gICAgICAgICAgICAgIC8vdGhpcy51cGRhdGVTYW1wbGVEYXRhKHNhbXBsZURhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcblxuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2cobmV3IERhdGUoKS5nZXRUaW1lKCkpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgLypcbiAgICBAcGFyYW0gY29uZmlnIChvcHRpb25hbClcbiAgICAgIHtcbiAgICAgICAgbm90ZTogY2FuIGJlIG5vdGUgbmFtZSAoQzQpIG9yIG5vdGUgbnVtYmVyICg2MClcbiAgICAgICAgYnVmZmVyOiBBdWRpb0J1ZmZlclxuICAgICAgICBzdXN0YWluOiBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSwgLy8gb3B0aW9uYWwsIGluIG1pbGxpc1xuICAgICAgICByZWxlYXNlOiBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdLCAvLyBvcHRpb25hbFxuICAgICAgICBwYW46IHBhblBvc2l0aW9uIC8vIG9wdGlvbmFsXG4gICAgICAgIHZlbG9jaXR5OiBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdIC8vIG9wdGlvbmFsLCBmb3IgbXVsdGktbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgfVxuICAqL1xuICB1cGRhdGVTYW1wbGVEYXRhKC4uLmRhdGEpe1xuICAgIGRhdGEuZm9yRWFjaChub3RlRGF0YSA9PiB7XG4gICAgICAvLyBzdXBwb3J0IGZvciBtdWx0aSBsYXllcmVkIGluc3RydW1lbnRzXG4gICAgICAvL2NvbnNvbGUubG9nKG5vdGVEYXRhLCB0eXBlU3RyaW5nKG5vdGVEYXRhKSlcbiAgICAgIGlmKHR5cGVTdHJpbmcobm90ZURhdGEpID09PSAnYXJyYXknKXtcbiAgICAgICAgbm90ZURhdGEuZm9yRWFjaCh2ZWxvY2l0eUxheWVyID0+IHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVTYW1wbGVEYXRhKHZlbG9jaXR5TGF5ZXIpXG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2FtcGxlRGF0YShub3RlRGF0YSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgX3VwZGF0ZVNhbXBsZURhdGEoZGF0YSA9IHt9KXtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gICAgbGV0IHtcbiAgICAgIG5vdGUsXG4gICAgICBidWZmZXIgPSBudWxsLFxuICAgICAgc3VzdGFpbiA9IFtudWxsLCBudWxsXSxcbiAgICAgIHJlbGVhc2UgPSBbbnVsbCwgJ2xpbmVhciddLCAvLyByZWxlYXNlIGR1cmF0aW9uIGlzIGluIHNlY29uZHMhXG4gICAgICBwYW4gPSBudWxsLFxuICAgICAgdmVsb2NpdHkgPSBbMCwgMTI3XSxcbiAgICB9ID0gZGF0YVxuXG4gICAgaWYodHlwZW9mIG5vdGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBub3RlbnVtYmVyIG9yIGEgbm90ZW5hbWUnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZ2V0IG5vdGVudW1iZXIgZnJvbSBub3RlbmFtZSBhbmQgY2hlY2sgaWYgdGhlIG5vdGVudW1iZXIgaXMgdmFsaWRcbiAgICBsZXQgbiA9IGNyZWF0ZU5vdGUobm90ZSlcbiAgICBpZihuID09PSBmYWxzZSl7XG4gICAgICBjb25zb2xlLndhcm4oJ25vdCBhIHZhbGlkIG5vdGUgaWQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG5vdGUgPSBuLm51bWJlclxuXG4gICAgbGV0IFtzdXN0YWluU3RhcnQsIHN1c3RhaW5FbmRdID0gc3VzdGFpblxuICAgIGxldCBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdID0gcmVsZWFzZVxuICAgIGxldCBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdID0gdmVsb2NpdHlcblxuICAgIGlmKHN1c3RhaW4ubGVuZ3RoICE9PSAyKXtcbiAgICAgIHN1c3RhaW5TdGFydCA9IHN1c3RhaW5FbmQgPSBudWxsXG4gICAgfVxuXG4gICAgaWYocmVsZWFzZUR1cmF0aW9uID09PSBudWxsKXtcbiAgICAgIHJlbGVhc2VFbnZlbG9wZSA9IG51bGxcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhub3RlLCBidWZmZXIpXG4gICAgLy8gY29uc29sZS5sb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKVxuICAgIC8vIGNvbnNvbGUubG9nKHJlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlKVxuICAgIC8vIGNvbnNvbGUubG9nKHBhbilcbiAgICAvLyBjb25zb2xlLmxvZyh2ZWxvY2l0eVN0YXJ0LCB2ZWxvY2l0eUVuZClcblxuXG4gICAgdGhpcy5zYW1wbGVzRGF0YVtub3RlXS5mb3JFYWNoKChzYW1wbGVEYXRhLCBpKSA9PiB7XG4gICAgICBpZihpID49IHZlbG9jaXR5U3RhcnQgJiYgaSA8PSB2ZWxvY2l0eUVuZCl7XG4gICAgICAgIGlmKHNhbXBsZURhdGEgPT09IC0xKXtcbiAgICAgICAgICBzYW1wbGVEYXRhID0ge1xuICAgICAgICAgICAgaWQ6IG5vdGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzYW1wbGVEYXRhLmJ1ZmZlciA9IGJ1ZmZlciB8fCBzYW1wbGVEYXRhLmJ1ZmZlclxuICAgICAgICBzYW1wbGVEYXRhLnN1c3RhaW5TdGFydCA9IHN1c3RhaW5TdGFydCB8fCBzYW1wbGVEYXRhLnN1c3RhaW5TdGFydFxuICAgICAgICBzYW1wbGVEYXRhLnN1c3RhaW5FbmQgPSBzdXN0YWluRW5kIHx8IHNhbXBsZURhdGEuc3VzdGFpbkVuZFxuICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VEdXJhdGlvbiA9IHJlbGVhc2VEdXJhdGlvbiB8fCBzYW1wbGVEYXRhLnJlbGVhc2VEdXJhdGlvblxuICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSA9IHJlbGVhc2VFbnZlbG9wZSB8fCBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZVxuICAgICAgICBzYW1wbGVEYXRhLnBhbiA9IHBhbiB8fCBzYW1wbGVEYXRhLnBhblxuXG4gICAgICAgIGlmKHR5cGVTdHJpbmcoc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGUpID09PSAnYXJyYXknKXtcbiAgICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZUFycmF5ID0gc2FtcGxlRGF0YS5yZWxlYXNlRW52ZWxvcGVcbiAgICAgICAgICBzYW1wbGVEYXRhLnJlbGVhc2VFbnZlbG9wZSA9ICdhcnJheSdcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGVsZXRlIHNhbXBsZURhdGEucmVsZWFzZUVudmVsb3BlQXJyYXlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNhbXBsZXNEYXRhW25vdGVdW2ldID0gc2FtcGxlRGF0YVxuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZygnJU8nLCB0aGlzLnNhbXBsZXNEYXRhW25vdGVdKVxuICAgIH0pXG4gIH1cblxuXG4gIC8vIHN0ZXJlbyBzcHJlYWRcbiAgc2V0S2V5U2NhbGluZ1Bhbm5pbmcoKXtcbiAgICAvLyBzZXRzIHBhbm5pbmcgYmFzZWQgb24gdGhlIGtleSB2YWx1ZSwgZS5nLiBoaWdoZXIgbm90ZXMgYXJlIHBhbm5lZCBtb3JlIHRvIHRoZSByaWdodCBhbmQgbG93ZXIgbm90ZXMgbW9yZSB0byB0aGUgbGVmdFxuICB9XG5cbiAgc2V0S2V5U2NhbGluZ1JlbGVhc2UoKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBiYXNlZCBvbiBrZXkgdmFsdWVcbiAgfVxuXG4gIC8qXG4gICAgQGR1cmF0aW9uOiBtaWxsaXNlY29uZHNcbiAgICBAZW52ZWxvcGU6IGxpbmVhciB8IGVxdWFsX3Bvd2VyIHwgYXJyYXkgb2YgaW50IHZhbHVlc1xuICAqL1xuICBzZXRSZWxlYXNlKGR1cmF0aW9uOiBudW1iZXIsIGVudmVsb3BlKXtcbiAgICAvLyBzZXQgcmVsZWFzZSBmb3IgYWxsIGtleXMsIG92ZXJydWxlcyB2YWx1ZXMgc2V0IGJ5IHNldEtleVNjYWxpbmdSZWxlYXNlKClcbiAgICB0aGlzLnNhbXBsZXNEYXRhLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlcywgaWQpe1xuICAgICAgc2FtcGxlcy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSwgaSl7XG4gICAgICAgIGlmKHNhbXBsZSA9PT0gLTEpe1xuICAgICAgICAgIHNhbXBsZSA9IHtcbiAgICAgICAgICAgIGlkOiBpZFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzYW1wbGUucmVsZWFzZUR1cmF0aW9uID0gZHVyYXRpb25cbiAgICAgICAgc2FtcGxlLnJlbGVhc2VFbnZlbG9wZSA9IGVudmVsb3BlXG4gICAgICAgIHNhbXBsZXNbaV0gPSBzYW1wbGVcbiAgICAgIH0pXG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKCclTycsIHRoaXMuc2FtcGxlc0RhdGEpXG4gIH1cblxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICBpZih0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpe1xuICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgIHR5cGU6ICdzdXN0YWlucGVkYWwnLFxuICAgICAgICBkYXRhOiAndXAnXG4gICAgICB9KVxuICAgIH1cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuXG4gICAgT2JqZWN0LmtleXModGhpcy5zY2hlZHVsZWRTYW1wbGVzKS5mb3JFYWNoKChzYW1wbGVJZCkgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZygnICBzdG9wcGluZycsIHNhbXBsZUlkLCB0aGlzLmlkKVxuICAgICAgbGV0IHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tzYW1wbGVJZF1cbiAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlKVxuICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW3NhbXBsZUlkXS5zdG9wKGNvbnRleHQuY3VycmVudFRpbWUsICgpID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnYWxsTm90ZXNPZmYnLCBzYW1wbGUuZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tzYW1wbGUuZXZlbnQubWlkaU5vdGVJZF1cbiAgICAgIH0pXG4gICAgfSlcbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSB7fVxuXG4gICAgLy9jb25zb2xlLmxvZygnYWxsTm90ZXNPZmYnLCB0aGlzLnN1c3RhaW5lZFNhbXBsZXMubGVuZ3RoLCB0aGlzLnNjaGVkdWxlZFNhbXBsZXMpXG4gIH1cbn1cbiIsImltcG9ydCB7VHJhY2t9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7cGFyc2VFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7Y2hlY2tNSURJTnVtYmVyfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2NhbGN1bGF0ZVBvc2l0aW9ufSBmcm9tICcuL3Bvc2l0aW9uJ1xuaW1wb3J0IHtJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5pbXBvcnQge2dldEluaXREYXRhfSBmcm9tICcuL2luaXRfYXVkaW8nXG5cblxubGV0XG4gIG1ldGhvZE1hcCA9IG5ldyBNYXAoW1xuICAgIFsndm9sdW1lJywgJ3NldFZvbHVtZSddLFxuICAgIFsnaW5zdHJ1bWVudCcsICdzZXRJbnN0cnVtZW50J10sXG4gICAgWydub3RlTnVtYmVyQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVOdW1iZXJBY2NlbnRlZFRpY2snXSxcbiAgICBbJ25vdGVOdW1iZXJOb25BY2NlbnRlZFRpY2snLCAnc2V0Tm90ZU51bWJlck5vbkFjY2VudGVkVGljayddLFxuICAgIFsndmVsb2NpdHlBY2NlbnRlZFRpY2snLCAnc2V0VmVsb2NpdHlBY2NlbnRlZFRpY2snXSxcbiAgICBbJ3ZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrJywgJ3NldFZlbG9jaXR5Tm9uQWNjZW50ZWRUaWNrJ10sXG4gICAgWydub3RlTGVuZ3RoQWNjZW50ZWRUaWNrJywgJ3NldE5vdGVMZW5ndGhBY2NlbnRlZFRpY2snXSxcbiAgICBbJ25vdGVMZW5ndGhOb25BY2NlbnRlZFRpY2snLCAnc2V0Tm90ZUxlbmd0aE5vbkFjY2VudGVkVGljayddXG4gIF0pO1xuXG5leHBvcnQgY2xhc3MgTWV0cm9ub21le1xuXG4gIGNvbnN0cnVjdG9yKHNvbmcpe1xuICAgIHRoaXMuc29uZyA9IHNvbmdcbiAgICB0aGlzLnRyYWNrID0gbmV3IFRyYWNrKHRoaXMuc29uZy5pZCArICdfbWV0cm9ub21lJylcbiAgICB0aGlzLnBhcnQgPSBuZXcgUGFydCgpXG4gICAgdGhpcy50cmFjay5hZGRQYXJ0cyh0aGlzLnBhcnQpXG4gICAgdGhpcy50cmFjay5jb25uZWN0KHRoaXMuc29uZy5fb3V0cHV0KVxuXG4gICAgdGhpcy5ldmVudHMgPSBbXVxuICAgIHRoaXMucHJlY291bnRFdmVudHMgPSBbXVxuICAgIHRoaXMucHJlY291bnREdXJhdGlvbiA9IDBcbiAgICB0aGlzLmJhcnMgPSAwXG4gICAgdGhpcy5pbmRleCA9IDBcbiAgICB0aGlzLnByZWNvdW50SW5kZXggPSAwXG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cblxuICByZXNldCgpe1xuXG4gICAgbGV0IGRhdGEgPSBnZXRJbml0RGF0YSgpXG4gICAgbGV0IGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudCgnbWV0cm9ub21lJylcbiAgICBpbnN0cnVtZW50LnVwZGF0ZVNhbXBsZURhdGEoe1xuICAgICAgbm90ZTogNjAsXG4gICAgICBidWZmZXI6IGRhdGEubG93dGljayxcbiAgICB9LCB7XG4gICAgICBub3RlOiA2MSxcbiAgICAgIGJ1ZmZlcjogZGF0YS5oaWdodGljayxcbiAgICB9KVxuICAgIHRoaXMudHJhY2suc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KVxuXG4gICAgdGhpcy52b2x1bWUgPSAxXG5cbiAgICB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA9IDYxXG4gICAgdGhpcy5ub3RlTnVtYmVyTm9uQWNjZW50ZWQgPSA2MFxuXG4gICAgdGhpcy52ZWxvY2l0eUFjY2VudGVkID0gMTAwXG4gICAgdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkID0gMTAwXG5cbiAgICB0aGlzLm5vdGVMZW5ndGhBY2NlbnRlZCA9IHRoaXMuc29uZy5wcHEgLyA0IC8vIHNpeHRlZW50aCBub3RlcyAtPiBkb24ndCBtYWtlIHRoaXMgdG9vIHNob3J0IGlmIHlvdXIgc2FtcGxlIGhhcyBhIGxvbmcgYXR0YWNrIVxuICAgIHRoaXMubm90ZUxlbmd0aE5vbkFjY2VudGVkID0gdGhpcy5zb25nLnBwcSAvIDRcbiAgfVxuXG4gIGNyZWF0ZUV2ZW50cyhzdGFydEJhciwgZW5kQmFyLCBpZCA9ICdpbml0Jyl7XG4gICAgbGV0IGksIGpcbiAgICBsZXQgcG9zaXRpb25cbiAgICBsZXQgdmVsb2NpdHlcbiAgICBsZXQgbm90ZUxlbmd0aFxuICAgIGxldCBub3RlTnVtYmVyXG4gICAgbGV0IGJlYXRzUGVyQmFyXG4gICAgbGV0IHRpY2tzUGVyQmVhdFxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgbm90ZU9uLCBub3RlT2ZmXG4gICAgbGV0IGV2ZW50cyA9IFtdXG5cbiAgICAvL2NvbnNvbGUubG9nKHN0YXJ0QmFyLCBlbmRCYXIpO1xuXG4gICAgZm9yKGkgPSBzdGFydEJhcjsgaSA8PSBlbmRCYXI7IGkrKyl7XG4gICAgICBwb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgICB0eXBlOiAnYmFyc2JlYXRzJyxcbiAgICAgICAgdGFyZ2V0OiBbaV0sXG4gICAgICB9KVxuXG4gICAgICBiZWF0c1BlckJhciA9IHBvc2l0aW9uLm5vbWluYXRvclxuICAgICAgdGlja3NQZXJCZWF0ID0gcG9zaXRpb24udGlja3NQZXJCZWF0XG5cbiAgICAgIGZvcihqID0gMDsgaiA8IGJlYXRzUGVyQmFyOyBqKyspe1xuXG4gICAgICAgIG5vdGVOdW1iZXIgPSBqID09PSAwID8gdGhpcy5ub3RlTnVtYmVyQWNjZW50ZWQgOiB0aGlzLm5vdGVOdW1iZXJOb25BY2NlbnRlZFxuICAgICAgICBub3RlTGVuZ3RoID0gaiA9PT0gMCA/IHRoaXMubm90ZUxlbmd0aEFjY2VudGVkIDogdGhpcy5ub3RlTGVuZ3RoTm9uQWNjZW50ZWRcbiAgICAgICAgdmVsb2NpdHkgPSBqID09PSAwID8gdGhpcy52ZWxvY2l0eUFjY2VudGVkIDogdGhpcy52ZWxvY2l0eU5vbkFjY2VudGVkXG5cbiAgICAgICAgbm90ZU9uID0gbmV3IE1JRElFdmVudCh0aWNrcywgMTQ0LCBub3RlTnVtYmVyLCB2ZWxvY2l0eSlcbiAgICAgICAgbm90ZU9mZiA9IG5ldyBNSURJRXZlbnQodGlja3MgKyBub3RlTGVuZ3RoLCAxMjgsIG5vdGVOdW1iZXIsIDApXG5cbiAgICAgICAgaWYoaWQgPT09ICdwcmVjb3VudCcpe1xuICAgICAgICAgIG5vdGVPbi5fdHJhY2sgPSB0aGlzLnRyYWNrXG4gICAgICAgICAgbm90ZU9mZi5fdHJhY2sgPSB0aGlzLnRyYWNrXG4gICAgICAgICAgbm90ZU9uLl9wYXJ0ID0ge31cbiAgICAgICAgICBub3RlT2ZmLl9wYXJ0ID0ge31cbiAgICAgICAgfVxuXG4gICAgICAgIGV2ZW50cy5wdXNoKG5vdGVPbiwgbm90ZU9mZilcbiAgICAgICAgdGlja3MgKz0gdGlja3NQZXJCZWF0XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2ZW50c1xuICB9XG5cblxuICBnZXRFdmVudHMoc3RhcnRCYXIgPSAxLCBlbmRCYXIgPSB0aGlzLnNvbmcuYmFycywgaWQgPSAnaW5pdCcpe1xuICAgIHRoaXMucGFydC5yZW1vdmVFdmVudHModGhpcy5wYXJ0LmdldEV2ZW50cygpKVxuICAgIHRoaXMuZXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc3RhcnRCYXIsIGVuZEJhciwgaWQpXG4gICAgdGhpcy5wYXJ0LmFkZEV2ZW50cyguLi50aGlzLmV2ZW50cylcbiAgICB0aGlzLmJhcnMgPSB0aGlzLnNvbmcuYmFyc1xuICAgIC8vY29uc29sZS5sb2coJ2dldEV2ZW50cyAlTycsIHRoaXMuZXZlbnRzKVxuICAgIHJldHVybiB0aGlzLmV2ZW50c1xuICB9XG5cblxuICBjcmVhdGVQcmVjb3VudEV2ZW50cyhwcmVjb3VudCwgdGltZVN0YW1wKXtcbiAgICBpZihwcmVjb3VudCA8PSAwKXtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cblxuICAgIHRoaXMudGltZVN0YW1wID0gdGltZVN0YW1wXG5cbi8vICAgbGV0IHNvbmdTdGFydFBvc2l0aW9uID0gdGhpcy5zb25nLmdldFBvc2l0aW9uKClcblxuICAgIGxldCBzb25nU3RhcnRQb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMuc29uZywge1xuICAgICAgdHlwZTogJ21pbGxpcycsXG4gICAgICB0YXJnZXQ6IHRoaXMuc29uZy5fY3VycmVudE1pbGxpcyxcbiAgICAgIHJlc3VsdDogJ2FsbCcsXG4gICAgfSlcblxuICAgIGxldCBlbmRQb3MgPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLnNvbmcsIHtcbiAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgdGFyZ2V0OiBbc29uZ1N0YXJ0UG9zaXRpb24uYmFyICsgcHJlY291bnRdLFxuICAgICAgcmVzdWx0OiAnYWxsJyxcbiAgICB9KVxuXG4gICAgLy9jb25zb2xlLmxvZyhzb25nU3RhcnRQb3NpdGlvbiwgZW5kUG9zKVxuXG4gICAgdGhpcy5wcmVjb3VudEluZGV4ID0gMFxuICAgIHRoaXMuc3RhcnRNaWxsaXMgPSBzb25nU3RhcnRQb3NpdGlvbi5taWxsaXNcbiAgICB0aGlzLmVuZE1pbGxpcyA9IGVuZFBvcy5taWxsaXNcbiAgICB0aGlzLnByZWNvdW50RHVyYXRpb24gPSBlbmRQb3MubWlsbGlzIC0gdGhpcy5zdGFydE1pbGxpc1xuXG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnByZWNvdW50RHVyYXRpb24pXG5cbiAgICB0aGlzLnByZWNvdW50RXZlbnRzID0gdGhpcy5jcmVhdGVFdmVudHMoc29uZ1N0YXJ0UG9zaXRpb24uYmFyLCBlbmRQb3MuYmFyIC0gMSwgJ3ByZWNvdW50Jyk7XG4gICAgdGhpcy5wcmVjb3VudEV2ZW50cyA9IHBhcnNlRXZlbnRzKFsuLi50aGlzLnNvbmcuX3RpbWVFdmVudHMsIC4uLnRoaXMucHJlY291bnRFdmVudHNdKVxuXG4gICAgLy9jb25zb2xlLmxvZyhzb25nU3RhcnRQb3NpdGlvbi5iYXIsIGVuZFBvcy5iYXIsIHByZWNvdW50LCB0aGlzLnByZWNvdW50RXZlbnRzLmxlbmd0aCk7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnByZWNvdW50RXZlbnRzLCB0aGlzLnByZWNvdW50RHVyYXRpb24pO1xuICAgIHJldHVybiB0aGlzLnByZWNvdW50RHVyYXRpb25cbiAgfVxuXG5cbiAgLy8gY2FsbGVkIGJ5IHNjaGVkdWxlci5qc1xuICBnZXRQcmVjb3VudEV2ZW50cyhtYXh0aW1lKXtcbiAgICBsZXQgZXZlbnRzID0gdGhpcy5wcmVjb3VudEV2ZW50cyxcbiAgICAgIG1heGkgPSBldmVudHMubGVuZ3RoLCBpLCBldnQsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICAgIGZvcihpID0gdGhpcy5wcmVjb3VudEluZGV4OyBpIDwgbWF4aTsgaSsrKXtcbiAgICAgIGV2dCA9IGV2ZW50c1tpXTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCBtYXh0aW1lLCB0aGlzLm1pbGxpcyk7XG4gICAgICBpZihldnQubWlsbGlzIDwgbWF4dGltZSl7XG4gICAgICAgIGV2dC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldnQubWlsbGlzXG4gICAgICAgIHJlc3VsdC5wdXNoKGV2dClcbiAgICAgICAgdGhpcy5wcmVjb3VudEluZGV4KytcbiAgICAgIH1lbHNle1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyhyZXN1bHQubGVuZ3RoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cblxuICBtdXRlKGZsYWcpe1xuICAgIHRoaXMudHJhY2subXV0ZWQgPSBmbGFnXG4gIH1cblxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy50cmFjay5faW5zdHJ1bWVudC5hbGxOb3Rlc09mZigpXG4gIH1cblxuXG4gIC8vID09PT09PT09PT09IENPTkZJR1VSQVRJT04gPT09PT09PT09PT1cblxuICB1cGRhdGVDb25maWcoKXtcbiAgICB0aGlzLmluaXQoMSwgdGhpcy5iYXJzLCAndXBkYXRlJyk7XG4gICAgdGhpcy5hbGxOb3Rlc09mZigpO1xuICAgIHRoaXMuc29uZy5fc2NoZWR1bGVyLnVwZGF0ZVNvbmcoKTtcbiAgfVxuXG4gIC8vIGFkZGVkIHRvIHB1YmxpYyBBUEk6IFNvbmcuY29uZmlndXJlTWV0cm9ub21lKHt9KVxuICBjb25maWd1cmUoY29uZmlnKXtcblxuICAgIE9iamVjdC5rZXlzKGNvbmZpZykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgdGhpc1ttZXRob2RNYXAuZ2V0KGtleSldKGNvbmZpZy5rZXkpO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0SW5zdHJ1bWVudChpbnN0cnVtZW50KXtcbiAgICBpZighaW5zdHJ1bWVudCBpbnN0YW5jZW9mIEluc3RydW1lbnQpe1xuICAgICAgY29uc29sZS53YXJuKCdub3QgYW4gaW5zdGFuY2Ugb2YgSW5zdHJ1bWVudCcpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy50cmFjay5zZXRJbnN0cnVtZW50KGluc3RydW1lbnQpXG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZUxlbmd0aEFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgaWYoaXNOYU4odmFsdWUpKXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy5ub3RlTGVuZ3RoQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXROb3RlTGVuZ3RoTm9uQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICBpZihpc05hTih2YWx1ZSkpe1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLm5vdGVMZW5ndGhOb25BY2NlbnRlZCA9IHZhbHVlO1xuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldFZlbG9jaXR5QWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICB2YWx1ZSA9IGNoZWNrTUlESU51bWJlcih2YWx1ZSk7XG4gICAgaWYodmFsdWUgIT09IGZhbHNlKXtcbiAgICAgIHRoaXMudmVsb2NpdHlBY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXRWZWxvY2l0eU5vbkFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLnZlbG9jaXR5Tm9uQWNjZW50ZWQgPSB2YWx1ZTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVDb25maWcoKTtcbiAgfVxuXG5cbiAgc2V0Tm90ZU51bWJlckFjY2VudGVkVGljayh2YWx1ZSl7XG4gICAgdmFsdWUgPSBjaGVja01JRElOdW1iZXIodmFsdWUpO1xuICAgIGlmKHZhbHVlICE9PSBmYWxzZSl7XG4gICAgICB0aGlzLm5vdGVOdW1iZXJBY2NlbnRlZCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZUNvbmZpZygpO1xuICB9XG5cblxuICBzZXROb3RlTnVtYmVyTm9uQWNjZW50ZWRUaWNrKHZhbHVlKXtcbiAgICB2YWx1ZSA9IGNoZWNrTUlESU51bWJlcih2YWx1ZSk7XG4gICAgaWYodmFsdWUgIT09IGZhbHNlKXtcbiAgICAgIHRoaXMubm90ZU51bWJlck5vbkFjY2VudGVkID0gdmFsdWU7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBwcm92aWRlIGEgbnVtYmVyJyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQ29uZmlnKCk7XG4gIH1cblxuXG4gIHNldFZvbHVtZSh2YWx1ZSl7XG4gICAgdGhpcy50cmFjay5zZXRWb2x1bWUodmFsdWUpO1xuICB9XG59XG5cbiIsIi8vIEAgZmxvd1xuXG5sZXQgbWlkaUV2ZW50SW5kZXggPSAwXG5cbmV4cG9ydCBjbGFzcyBNSURJRXZlbnR7XG5cbiAgY29uc3RydWN0b3IodGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyID0gLTEpe1xuICAgIHRoaXMuaWQgPSBgTUVfJHttaWRpRXZlbnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLnRpY2tzID0gdGlja3NcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5kYXRhMSA9IGRhdGExXG4gICAgdGhpcy5kYXRhMiA9IGRhdGEyXG4gICAgdGhpcy5mcmVxdWVuY3kgPSA0NDAgKiBNYXRoLnBvdygyLCAoZGF0YTEgLSA2OSkgLyAxMilcblxuICAgIGlmKGRhdGExID09PSAxNDQgJiYgZGF0YTIgPT09IDApe1xuICAgICAgdGhpcy5kYXRhMSA9IDEyOFxuICAgIH1cblxuICAgIHRoaXMuX3BhcnQgPSBudWxsXG4gICAgdGhpcy5fdHJhY2sgPSBudWxsXG4gICAgdGhpcy5fc29uZyA9IG51bGxcbiAgICAvL0BUT0RPOiBhZGQgYWxsIG90aGVyIHByb3BlcnRpZXNcbiAgfVxuXG4gIGNvcHkoKXtcbiAgICBsZXQgbSA9IG5ldyBNSURJRXZlbnQodGhpcy50aWNrcywgdGhpcy50eXBlLCB0aGlzLmRhdGExLCB0aGlzLmRhdGEyKVxuICAgIHJldHVybiBtXG4gIH1cblxuICB0cmFuc3Bvc2UoYW1vdW50OiBudW1iZXIpeyAvLyBtYXkgYmUgYmV0dGVyIGlmIG5vdCBhIHB1YmxpYyBtZXRob2Q/XG4gICAgdGhpcy5kYXRhMSArPSBhbW91bnRcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IDQ0MCAqIE1hdGgucG93KDIsICh0aGlzLmRhdGExIC0gNjkpIC8gMTIpXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMudGlja3MgKz0gdGlja3NcbiAgICBpZih0aGlzLm1pZGlOb3RlKXtcbiAgICAgIHRoaXMubWlkaU5vdGUudXBkYXRlKClcbiAgICB9XG4gIH1cblxuICBtb3ZlVG8odGlja3M6IG51bWJlcil7XG4gICAgdGhpcy50aWNrcyA9IHRpY2tzXG4gICAgaWYodGhpcy5taWRpTm90ZSl7XG4gICAgICB0aGlzLm1pZGlOb3RlLnVwZGF0ZSgpXG4gICAgfVxuICB9XG59XG5cblxuLypcbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVNSURJRXZlbnQoZXZlbnQpe1xuICAvL2V2ZW50Lm5vdGUgPSBudWxsXG4gIGV2ZW50Lm5vdGUgPSBudWxsXG4gIGV2ZW50ID0gbnVsbFxufVxuKi9cbiIsImltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmxldCBtaWRpTm90ZUluZGV4ID0gMFxuXG5leHBvcnQgY2xhc3MgTUlESU5vdGV7XG5cbiAgY29uc3RydWN0b3Iobm90ZW9uOiBNSURJRXZlbnQsIG5vdGVvZmY6IE1JRElFdmVudCl7XG4gICAgLy9pZihub3Rlb24udHlwZSAhPT0gMTQ0IHx8IG5vdGVvZmYudHlwZSAhPT0gMTI4KXtcbiAgICBpZihub3Rlb24udHlwZSAhPT0gMTQ0KXtcbiAgICAgIGNvbnNvbGUud2FybignY2Fubm90IGNyZWF0ZSBNSURJTm90ZScpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5pZCA9IGBNTl8ke21pZGlOb3RlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5ub3RlT24gPSBub3Rlb25cbiAgICBub3Rlb24ubWlkaU5vdGUgPSB0aGlzXG4gICAgbm90ZW9uLm1pZGlOb3RlSWQgPSB0aGlzLmlkXG5cbiAgICBpZihub3Rlb2ZmIGluc3RhbmNlb2YgTUlESUV2ZW50KXtcbiAgICAgIHRoaXMubm90ZU9mZiA9IG5vdGVvZmZcbiAgICAgIG5vdGVvZmYubWlkaU5vdGUgPSB0aGlzXG4gICAgICBub3Rlb2ZmLm1pZGlOb3RlSWQgPSB0aGlzLmlkXG4gICAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSBub3Rlb2ZmLnRpY2tzIC0gbm90ZW9uLnRpY2tzXG4gICAgICB0aGlzLmR1cmF0aW9uTWlsbGlzID0gLTFcbiAgICB9XG4gIH1cblxuICBhZGROb3RlT2ZmKG5vdGVvZmYpe1xuICAgIHRoaXMubm90ZU9mZiA9IG5vdGVvZmZcbiAgICBub3Rlb2ZmLm1pZGlOb3RlID0gdGhpc1xuICAgIG5vdGVvZmYubWlkaU5vdGVJZCA9IHRoaXMuaWRcbiAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSBub3Rlb2ZmLnRpY2tzIC0gdGhpcy5ub3RlT24udGlja3NcbiAgICB0aGlzLmR1cmF0aW9uTWlsbGlzID0gLTFcbiAgfVxuXG4gIGNvcHkoKXtcbiAgICByZXR1cm4gbmV3IE1JRElOb3RlKHRoaXMubm90ZU9uLmNvcHkoKSwgdGhpcy5ub3RlT2ZmLmNvcHkoKSlcbiAgfVxuXG4gIHVwZGF0ZSgpeyAvLyBtYXkgdXNlIGFub3RoZXIgbmFtZSBmb3IgdGhpcyBtZXRob2RcbiAgICB0aGlzLmR1cmF0aW9uVGlja3MgPSB0aGlzLm5vdGVPZmYudGlja3MgLSB0aGlzLm5vdGVPbi50aWNrc1xuICB9XG5cbiAgdHJhbnNwb3NlKGFtb3VudDogbnVtYmVyKTogdm9pZHtcbiAgICB0aGlzLm5vdGVPbi50cmFuc3Bvc2UoYW1vdW50KVxuICAgIHRoaXMubm90ZU9mZi50cmFuc3Bvc2UoYW1vdW50KVxuICB9XG5cbiAgbW92ZSh0aWNrczogbnVtYmVyKTogdm9pZHtcbiAgICB0aGlzLm5vdGVPbi5tb3ZlKHRpY2tzKVxuICAgIHRoaXMubm90ZU9mZi5tb3ZlKHRpY2tzKVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICAgIHRoaXMubm90ZU9uLm1vdmVUbyh0aWNrcylcbiAgICB0aGlzLm5vdGVPZmYubW92ZVRvKHRpY2tzKVxuICB9XG5cbiAgdW5yZWdpc3Rlcigpe1xuICAgIGlmKHRoaXMucGFydCl7XG4gICAgICB0aGlzLnBhcnQucmVtb3ZlRXZlbnRzKHRoaXMpXG4gICAgICB0aGlzLnBhcnQgPSBudWxsXG4gICAgfVxuICAgIGlmKHRoaXMudHJhY2spe1xuICAgICAgdGhpcy50cmFjay5yZW1vdmVFdmVudHModGhpcylcbiAgICAgIHRoaXMudHJhY2sgPSBudWxsXG4gICAgfVxuICAgIGlmKHRoaXMuc29uZyl7XG4gICAgICB0aGlzLnNvbmcucmVtb3ZlRXZlbnRzKHRoaXMpXG4gICAgICB0aGlzLnNvbmcgPSBudWxsXG4gICAgfVxuICB9XG59XG5cbiIsIi8qXG4gIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBieXRlcyB0aHJvdWdoIHNlcXVlbnRpYWwgcmVhZHNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiAgYWRhcHRlZCB0byB3b3JrIHdpdGggQXJyYXlCdWZmZXIgLT4gVWludDhBcnJheVxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElTdHJlYW17XG5cbiAgLy8gYnVmZmVyIGlzIFVpbnQ4QXJyYXlcbiAgY29uc3RydWN0b3IoYnVmZmVyKXtcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIC8qIHJlYWQgc3RyaW5nIG9yIGFueSBudW1iZXIgb2YgYnl0ZXMgKi9cbiAgcmVhZChsZW5ndGgsIHRvU3RyaW5nID0gdHJ1ZSkge1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICBpZih0b1N0cmluZyl7XG4gICAgICByZXN1bHQgPSAnJztcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0ICs9IGZjYyh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1lbHNle1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMzItYml0IGludGVnZXIgKi9cbiAgcmVhZEludDMyKCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgMjQpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV0gPDwgMTYpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDNdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDE2LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQxNigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGFuIDgtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDgoc2lnbmVkKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dO1xuICAgIGlmKHNpZ25lZCAmJiByZXN1bHQgPiAxMjcpe1xuICAgICAgcmVzdWx0IC09IDI1NjtcbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbiArPSAxO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBlb2YoKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPj0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICB9XG5cbiAgLyogcmVhZCBhIE1JREktc3R5bGUgbGV0aWFibGUtbGVuZ3RoIGludGVnZXJcbiAgICAoYmlnLWVuZGlhbiB2YWx1ZSBpbiBncm91cHMgb2YgNyBiaXRzLFxuICAgIHdpdGggdG9wIGJpdCBzZXQgdG8gc2lnbmlmeSB0aGF0IGFub3RoZXIgYnl0ZSBmb2xsb3dzKVxuICAqL1xuICByZWFkVmFySW50KCkge1xuICAgIGxldCByZXN1bHQgPSAwO1xuICAgIHdoaWxlKHRydWUpIHtcbiAgICAgIGxldCBiID0gdGhpcy5yZWFkSW50OCgpO1xuICAgICAgaWYgKGIgJiAweDgwKSB7XG4gICAgICAgIHJlc3VsdCArPSAoYiAmIDB4N2YpO1xuICAgICAgICByZXN1bHQgPDw9IDc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBiIGlzIHRoZSBsYXN0IGJ5dGUgKi9cbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIGI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIHNldFBvc2l0aW9uKHApe1xuICAgIHRoaXMucG9zaXRpb24gPSBwO1xuICB9XG59XG4iLCIvKlxuICBFeHRyYWN0cyBhbGwgbWlkaSBldmVudHMgZnJvbSBhIGJpbmFyeSBtaWRpIGZpbGUsIHVzZXMgbWlkaV9zdHJlYW0uanNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE1JRElTdHJlYW0gZnJvbSAnLi9taWRpX3N0cmVhbSc7XG5cbmxldFxuICBsYXN0RXZlbnRUeXBlQnl0ZSxcbiAgdHJhY2tOYW1lO1xuXG5cbmZ1bmN0aW9uIHJlYWRDaHVuayhzdHJlYW0pe1xuICBsZXQgaWQgPSBzdHJlYW0ucmVhZCg0LCB0cnVlKTtcbiAgbGV0IGxlbmd0aCA9IHN0cmVhbS5yZWFkSW50MzIoKTtcbiAgLy9jb25zb2xlLmxvZyhsZW5ndGgpO1xuICByZXR1cm57XG4gICAgJ2lkJzogaWQsXG4gICAgJ2xlbmd0aCc6IGxlbmd0aCxcbiAgICAnZGF0YSc6IHN0cmVhbS5yZWFkKGxlbmd0aCwgZmFsc2UpXG4gIH07XG59XG5cblxuZnVuY3Rpb24gcmVhZEV2ZW50KHN0cmVhbSl7XG4gIHZhciBldmVudCA9IHt9O1xuICB2YXIgbGVuZ3RoO1xuICBldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICBsZXQgZXZlbnRUeXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50VHlwZUJ5dGUsIGV2ZW50VHlwZUJ5dGUgJiAweDgwLCAxNDYgJiAweDBmKTtcbiAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweGYwKSA9PSAweGYwKXtcbiAgICAvKiBzeXN0ZW0gLyBtZXRhIGV2ZW50ICovXG4gICAgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGZmKXtcbiAgICAgIC8qIG1ldGEgZXZlbnQgKi9cbiAgICAgIGV2ZW50LnR5cGUgPSAnbWV0YSc7XG4gICAgICBsZXQgc3VidHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBzd2l0Y2goc3VidHlwZUJ5dGUpe1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNlcXVlbmNlTnVtYmVyIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1iZXIgPSBzdHJlYW0ucmVhZEludDE2KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvcHlyaWdodE5vdGljZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDM6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0cmFja05hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdpbnN0cnVtZW50TmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDU6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdseXJpY3MnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA2OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWFya2VyJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2N1ZVBvaW50JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21pZGlDaGFubmVsUHJlZml4JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDEpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgbWlkaUNoYW5uZWxQcmVmaXggZXZlbnQgaXMgMSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmNoYW5uZWwgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2VuZE9mVHJhY2snO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NldFRlbXBvJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDMpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2V0VGVtcG8gZXZlbnQgaXMgMywgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQgPSAoXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgMTYpICtcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCA4KSArXG4gICAgICAgICAgICBzdHJlYW0ucmVhZEludDgoKVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzbXB0ZU9mZnNldCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA1KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNtcHRlT2Zmc2V0IGV2ZW50IGlzIDUsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgaG91ckJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZVJhdGUgPXtcbiAgICAgICAgICAgIDB4MDA6IDI0LCAweDIwOiAyNSwgMHg0MDogMjksIDB4NjA6IDMwXG4gICAgICAgICAgfVtob3VyQnl0ZSAmIDB4NjBdO1xuICAgICAgICAgIGV2ZW50LmhvdXIgPSBob3VyQnl0ZSAmIDB4MWY7XG4gICAgICAgICAgZXZlbnQubWluID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc2VjID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zdWJmcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU4OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGltZVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA0KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWVyYXRvciA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmRlbm9taW5hdG9yID0gTWF0aC5wb3coMiwgc3RyZWFtLnJlYWRJbnQ4KCkpO1xuICAgICAgICAgIGV2ZW50Lm1ldHJvbm9tZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnRoaXJ0eXNlY29uZHMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1OTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2tleVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQua2V5ID0gc3RyZWFtLnJlYWRJbnQ4KHRydWUpO1xuICAgICAgICAgIGV2ZW50LnNjYWxlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4N2Y6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZXJTcGVjaWZpYyc7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vaWYoc2VxdWVuY2VyLmRlYnVnID49IDIpe1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUud2FybignVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogJyArIHN1YnR5cGVCeXRlKTtcbiAgICAgICAgICAvL31cbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmMCl7XG4gICAgICBldmVudC50eXBlID0gJ3N5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4Zjcpe1xuICAgICAgZXZlbnQudHlwZSA9ICdkaXZpZGVkU3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogJyArIGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICB9ZWxzZXtcbiAgICAvKiBjaGFubmVsIGV2ZW50ICovXG4gICAgbGV0IHBhcmFtMTtcbiAgICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ODApID09PSAwKXtcbiAgICAgIC8qIHJ1bm5pbmcgc3RhdHVzIC0gcmV1c2UgbGFzdEV2ZW50VHlwZUJ5dGUgYXMgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgIGV2ZW50VHlwZUJ5dGUgaXMgYWN0dWFsbHkgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgKi9cbiAgICAgIC8vY29uc29sZS5sb2coJ3J1bm5pbmcgc3RhdHVzJyk7XG4gICAgICBwYXJhbTEgPSBldmVudFR5cGVCeXRlO1xuICAgICAgZXZlbnRUeXBlQnl0ZSA9IGxhc3RFdmVudFR5cGVCeXRlO1xuICAgIH1lbHNle1xuICAgICAgcGFyYW0xID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdsYXN0JywgZXZlbnRUeXBlQnl0ZSk7XG4gICAgICBsYXN0RXZlbnRUeXBlQnl0ZSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICAgIGxldCBldmVudFR5cGUgPSBldmVudFR5cGVCeXRlID4+IDQ7XG4gICAgZXZlbnQuY2hhbm5lbCA9IGV2ZW50VHlwZUJ5dGUgJiAweDBmO1xuICAgIGV2ZW50LnR5cGUgPSAnY2hhbm5lbCc7XG4gICAgc3dpdGNoIChldmVudFR5cGUpe1xuICAgICAgY2FzZSAweDA4OlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MDk6XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmKGV2ZW50LnZlbG9jaXR5ID09PSAwKXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBhOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYjpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb250cm9sbGVyJztcbiAgICAgICAgZXZlbnQuY29udHJvbGxlclR5cGUgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYzpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwcm9ncmFtQ2hhbmdlJztcbiAgICAgICAgZXZlbnQucHJvZ3JhbU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBkOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NoYW5uZWxBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gcGFyYW0xO1xuICAgICAgICAvL2lmKHRyYWNrTmFtZSA9PT0gJ1NILVMxLTQ0LUMwOSBMPVNNTCBJTj0zJyl7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCdjaGFubmVsIHByZXNzdXJlJywgdHJhY2tOYW1lLCBwYXJhbTEpO1xuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBlOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3BpdGNoQmVuZCc7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gcGFyYW0xICsgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDcpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvKlxuICAgICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgY29uc29sZS5sb2coJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuLypcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICBjb25zb2xlLmxvZygnd2VpcmRvJywgdHJhY2tOYW1lLCBwYXJhbTEsIGV2ZW50LnZlbG9jaXR5KTtcbiovXG5cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElGaWxlKGJ1ZmZlcil7XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPT09IGZhbHNlICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcignYnVmZmVyIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiBVaW50OEFycmF5IG9mIEFycmF5QnVmZmVyJylcbiAgICByZXR1cm5cbiAgfVxuICBpZihidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICB9XG4gIGxldCB0cmFja3MgPSBuZXcgTWFwKCk7XG4gIGxldCBzdHJlYW0gPSBuZXcgTUlESVN0cmVhbShidWZmZXIpO1xuXG4gIGxldCBoZWFkZXJDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICBpZihoZWFkZXJDaHVuay5pZCAhPT0gJ01UaGQnIHx8IGhlYWRlckNodW5rLmxlbmd0aCAhPT0gNil7XG4gICAgdGhyb3cgJ0JhZCAubWlkIGZpbGUgLSBoZWFkZXIgbm90IGZvdW5kJztcbiAgfVxuXG4gIGxldCBoZWFkZXJTdHJlYW0gPSBuZXcgTUlESVN0cmVhbShoZWFkZXJDaHVuay5kYXRhKTtcbiAgbGV0IGZvcm1hdFR5cGUgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0cmFja0NvdW50ID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG4gIGlmKHRpbWVEaXZpc2lvbiAmIDB4ODAwMCl7XG4gICAgdGhyb3cgJ0V4cHJlc3NpbmcgdGltZSBkaXZpc2lvbiBpbiBTTVRQRSBmcmFtZXMgaXMgbm90IHN1cHBvcnRlZCB5ZXQnO1xuICB9XG5cbiAgbGV0IGhlYWRlciA9e1xuICAgICdmb3JtYXRUeXBlJzogZm9ybWF0VHlwZSxcbiAgICAndHJhY2tDb3VudCc6IHRyYWNrQ291bnQsXG4gICAgJ3RpY2tzUGVyQmVhdCc6IHRpbWVEaXZpc2lvblxuICB9O1xuXG4gIGZvcihsZXQgaSA9IDA7IGkgPCB0cmFja0NvdW50OyBpKyspe1xuICAgIHRyYWNrTmFtZSA9ICd0cmFja18nICsgaTtcbiAgICBsZXQgdHJhY2sgPSBbXTtcbiAgICBsZXQgdHJhY2tDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICAgIGlmKHRyYWNrQ2h1bmsuaWQgIT09ICdNVHJrJyl7XG4gICAgICB0aHJvdyAnVW5leHBlY3RlZCBjaHVuayAtIGV4cGVjdGVkIE1UcmssIGdvdCAnKyB0cmFja0NodW5rLmlkO1xuICAgIH1cbiAgICBsZXQgdHJhY2tTdHJlYW0gPSBuZXcgTUlESVN0cmVhbSh0cmFja0NodW5rLmRhdGEpO1xuICAgIHdoaWxlKCF0cmFja1N0cmVhbS5lb2YoKSl7XG4gICAgICBsZXQgZXZlbnQgPSByZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuICAgICAgdHJhY2sucHVzaChldmVudCk7XG4gICAgfVxuICAgIHRyYWNrcy5zZXQodHJhY2tOYW1lLCB0cmFjayk7XG4gIH1cblxuICByZXR1cm57XG4gICAgJ2hlYWRlcic6IGhlYWRlcixcbiAgICAndHJhY2tzJzogdHJhY2tzXG4gIH07XG59IiwiLypcbiAgQWRkcyBhIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5vdGUgb2JqZWN0IHRoYXQgY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgYSBtdXNpY2FsIG5vdGU6XG4gICAgLSBuYW1lLCBlLmcuICdDJ1xuICAgIC0gb2N0YXZlLCAgLTEgLSA5XG4gICAgLSBmdWxsTmFtZTogJ0MxJ1xuICAgIC0gZnJlcXVlbmN5OiAyMzQuMTYsIGJhc2VkIG9uIHRoZSBiYXNpYyBwaXRjaFxuICAgIC0gbnVtYmVyOiA2MCBtaWRpIG5vdGUgbnVtYmVyXG5cbiAgQWRkcyBzZXZlcmFsIHV0aWxpdHkgbWV0aG9kcyBvcmdhbmlzZWQgYXJvdW5kIHRoZSBub3RlIG9iamVjdFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge3R5cGVTdHJpbmd9IGZyb20gJy4vdXRpbCc7XG5cbmxldFxuICBlcnJvck1zZyxcbiAgd2FybmluZ01zZyxcbiAgcG93ID0gTWF0aC5wb3csXG4gIGZsb29yID0gTWF0aC5mbG9vcjtcblxuY29uc3Qgbm90ZU5hbWVzID0ge1xuICAnc2hhcnAnIDogWydDJywgJ0MjJywgJ0QnLCAnRCMnLCAnRScsICdGJywgJ0YjJywgJ0cnLCAnRyMnLCAnQScsICdBIycsICdCJ10sXG4gICdmbGF0JyA6IFsnQycsICdEYicsICdEJywgJ0ViJywgJ0UnLCAnRicsICdHYicsICdHJywgJ0FiJywgJ0EnLCAnQmInLCAnQiddLFxuICAnZW5oYXJtb25pYy1zaGFycCcgOiBbJ0IjJywgJ0MjJywgJ0MjIycsICdEIycsICdEIyMnLCAnRSMnLCAnRiMnLCAnRiMjJywgJ0cjJywgJ0cjIycsICdBIycsICdBIyMnXSxcbiAgJ2VuaGFybW9uaWMtZmxhdCcgOiBbJ0RiYicsICdEYicsICdFYmInLCAnRWInLCAnRmInLCAnR2JiJywgJ0diJywgJ0FiYicsICdBYicsICdCYmInLCAnQmInLCAnQ2InXVxufTtcblxuXG4vKlxuICBhcmd1bWVudHNcbiAgLSBub3RlTnVtYmVyOiA2MFxuICAtIG5vdGVOdW1iZXIgYW5kIG5vdGVuYW1lIG1vZGU6IDYwLCAnc2hhcnAnXG4gIC0gbm90ZU5hbWU6ICdDIzQnXG4gIC0gbmFtZSBhbmQgb2N0YXZlOiAnQyMnLCA0XG4gIC0gbm90ZSBuYW1lLCBvY3RhdmUsIG5vdGUgbmFtZSBtb2RlOiAnRCcsIDQsICdzaGFycCdcbiAgLSBkYXRhIG9iamVjdDpcbiAgICB7XG4gICAgICBuYW1lOiAnQycsXG4gICAgICBvY3RhdmU6IDRcbiAgICB9XG4gICAgb3JcbiAgICB7XG4gICAgICBmcmVxdWVuY3k6IDIzNC4xNlxuICAgIH1cbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOb3RlKC4uLmFyZ3Mpe1xuICBsZXRcbiAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgZGF0YSxcbiAgICBvY3RhdmUsXG4gICAgbm90ZU5hbWUsXG4gICAgbm90ZU51bWJlcixcbiAgICBub3RlTmFtZU1vZGUsXG4gICAgYXJnMCA9IGFyZ3NbMF0sXG4gICAgYXJnMSA9IGFyZ3NbMV0sXG4gICAgYXJnMiA9IGFyZ3NbMl0sXG4gICAgdHlwZTAgPSB0eXBlU3RyaW5nKGFyZzApLFxuICAgIHR5cGUxID0gdHlwZVN0cmluZyhhcmcxKSxcbiAgICB0eXBlMiA9IHR5cGVTdHJpbmcoYXJnMik7XG5cbiAgZXJyb3JNc2cgPSAnJztcbiAgd2FybmluZ01zZyA9ICcnO1xuXG4gIC8vIGFyZ3VtZW50OiBub3RlIG51bWJlclxuICAvL2NvbnNvbGUubG9nKG51bUFyZ3MsIHR5cGUwKVxuICBpZihudW1BcmdzID09PSAxICYmIHR5cGUwID09PSAnbnVtYmVyJyl7XG4gICAgaWYoYXJnMCA8IDAgfHwgYXJnMCA+IDEyNyl7XG4gICAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgbnVtYmVyID49IDAgYW5kIDw9IDEyNyAnICsgIGFyZzA7XG4gICAgfWVsc2V7XG4gICAgICBub3RlTnVtYmVyID0gYXJnMDtcbiAgICAgIGRhdGEgPSBfZ2V0Tm90ZU5hbWUobm90ZU51bWJlcik7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgIH1cblxuXG4gIC8vIGFyZ3VtZW50czogZnVsbCBub3RlIG5hbWVcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMSAmJiB0eXBlMCA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cbiAgLy8gYXJndW1lbnRzOiBub3RlIG5hbWUsIG9jdGF2ZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ251bWJlcicpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwLCBhcmcxKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cbiAgLy8gYXJndW1lbnRzOiBmdWxsIG5vdGUgbmFtZSwgbm90ZSBuYW1lIG1vZGUgLT4gZm9yIGNvbnZlcnRpbmcgYmV0d2VlbiBub3RlIG5hbWUgbW9kZXNcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMiAmJiB0eXBlMCA9PT0gJ3N0cmluZycgJiYgdHlwZTEgPT09ICdzdHJpbmcnKXtcbiAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCk7XG4gICAgaWYoZXJyb3JNc2cgPT09ICcnKXtcbiAgICAgIG5vdGVOYW1lTW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShhcmcxKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsIG9jdGF2ZSk7XG4gICAgfVxuXG5cbiAgLy8gYXJndW1lbnRzOiBub3RlIG51bWJlciwgbm90ZSBuYW1lIG1vZGVcbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMiAmJiB0eXBlU3RyaW5nKGFyZzApID09PSAnbnVtYmVyJyAmJiB0eXBlU3RyaW5nKGFyZzEpID09PSAnc3RyaW5nJyl7XG4gICAgaWYoYXJnMCA8IDAgfHwgYXJnMCA+IDEyNyl7XG4gICAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgbnVtYmVyID49IDAgYW5kIDw9IDEyNyAnICsgYXJnMDtcbiAgICB9ZWxzZXtcbiAgICAgIG5vdGVOYW1lTW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShhcmcxKTtcbiAgICAgIG5vdGVOdW1iZXIgPSBhcmcwO1xuICAgICAgZGF0YSA9IF9nZXROb3RlTmFtZShub3RlTnVtYmVyLCBub3RlTmFtZU1vZGUpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICB9XG5cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbmFtZSwgb2N0YXZlLCBub3RlIG5hbWUgbW9kZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAzICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ251bWJlcicgJiYgdHlwZTIgPT09ICdzdHJpbmcnKXtcbiAgICBkYXRhID0gX2NoZWNrTm90ZU5hbWUoYXJnMCwgYXJnMSk7XG4gICAgaWYoZXJyb3JNc2cgPT09ICcnKXtcbiAgICAgIG5vdGVOYW1lTW9kZSA9IF9jaGVja05vdGVOYW1lTW9kZShhcmcyKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgICBub3RlTnVtYmVyID0gX2dldE5vdGVOdW1iZXIobm90ZU5hbWUsb2N0YXZlKTtcbiAgICB9XG5cbiAgfWVsc2V7XG4gICAgZXJyb3JNc2cgPSAnd3JvbmcgYXJndW1lbnRzLCBwbGVhc2UgY29uc3VsdCBkb2N1bWVudGF0aW9uJztcbiAgfVxuXG4gIGlmKGVycm9yTXNnKXtcbiAgICBjb25zb2xlLmVycm9yKGVycm9yTXNnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZih3YXJuaW5nTXNnKXtcbiAgICBjb25zb2xlLndhcm4od2FybmluZ01zZyk7XG4gIH1cblxuICBsZXQgbm90ZSA9IHtcbiAgICBuYW1lOiBub3RlTmFtZSxcbiAgICBvY3RhdmU6IG9jdGF2ZSxcbiAgICBmdWxsTmFtZTogbm90ZU5hbWUgKyBvY3RhdmUsXG4gICAgbnVtYmVyOiBub3RlTnVtYmVyLFxuICAgIGZyZXF1ZW5jeTogX2dldEZyZXF1ZW5jeShub3RlTnVtYmVyKSxcbiAgICBibGFja0tleTogX2lzQmxhY2tLZXkobm90ZU51bWJlcilcbiAgfVxuICBPYmplY3QuZnJlZXplKG5vdGUpO1xuICByZXR1cm4gbm90ZTtcbn1cblxuXG4vL2Z1bmN0aW9uIF9nZXROb3RlTmFtZShudW1iZXIsIG1vZGUgPSBjb25maWcuZ2V0KCdub3RlTmFtZU1vZGUnKSkge1xuZnVuY3Rpb24gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSA9ICdzaGFycCcpIHtcbiAgLy9sZXQgb2N0YXZlID0gTWF0aC5mbG9vcigobnVtYmVyIC8gMTIpIC0gMiksIC8vIOKGkiBpbiBDdWJhc2UgY2VudHJhbCBDID0gQzMgaW5zdGVhZCBvZiBDNFxuICBsZXQgb2N0YXZlID0gZmxvb3IoKG51bWJlciAvIDEyKSAtIDEpO1xuICBsZXQgbm90ZU5hbWUgPSBub3RlTmFtZXNbbW9kZV1bbnVtYmVyICUgMTJdO1xuICByZXR1cm4gW25vdGVOYW1lLCBvY3RhdmVdO1xufVxuXG5cbmZ1bmN0aW9uIF9nZXROb3RlTnVtYmVyKG5hbWUsIG9jdGF2ZSkge1xuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIGxldCBpbmRleDtcblxuICBmb3IobGV0IGtleSBvZiBrZXlzKXtcbiAgICBsZXQgbW9kZSA9IG5vdGVOYW1lc1trZXldO1xuICAgIGluZGV4ID0gbW9kZS5maW5kSW5kZXgoeCA9PiB4ID09PSBuYW1lKTtcbiAgICBpZihpbmRleCAhPT0gLTEpe1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy9udW1iZXIgPSAoaW5kZXggKyAxMikgKyAob2N0YXZlICogMTIpICsgMTI7IC8vIOKGkiBpbiBDdWJhc2UgY2VudHJhbCBDID0gQzMgaW5zdGVhZCBvZiBDNFxuICBsZXQgbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKTsvLyDihpIgbWlkaSBzdGFuZGFyZCArIHNjaWVudGlmaWMgbmFtaW5nLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWlkZGxlX0MgYW5kIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU2NpZW50aWZpY19waXRjaF9ub3RhdGlvblxuXG4gIGlmKG51bWJlciA8IDAgfHwgbnVtYmVyID4gMTI3KXtcbiAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhIG5vdGUgYmV0d2VlbiBDMCBhbmQgRzEwJztcbiAgICByZXR1cm47XG4gIH1cbiAgcmV0dXJuIG51bWJlcjtcbn1cblxuXG5mdW5jdGlvbiBfZ2V0RnJlcXVlbmN5KG51bWJlcil7XG4gIC8vcmV0dXJuIGNvbmZpZy5nZXQoJ3BpdGNoJykgKiBwb3coMiwobnVtYmVyIC0gNjkpLzEyKTsgLy8gbWlkaSBzdGFuZGFyZCwgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01JRElfVHVuaW5nX1N0YW5kYXJkXG4gIHJldHVybiA0NDAgKiBwb3coMiwobnVtYmVyIC0gNjkpLzEyKTsgLy8gbWlkaSBzdGFuZGFyZCwgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01JRElfVHVuaW5nX1N0YW5kYXJkXG59XG5cblxuLy8gVE9ETzogY2FsY3VsYXRlIG5vdGUgZnJvbSBmcmVxdWVuY3lcbmZ1bmN0aW9uIF9nZXRQaXRjaChoZXJ0eil7XG4gIC8vZm0gID0gIDIobeKIkjY5KS8xMig0NDAgSHopLlxufVxuXG5cbmZ1bmN0aW9uIF9jaGVja05vdGVOYW1lTW9kZShtb2RlKXtcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgcmVzdWx0ID0ga2V5cy5maW5kKHggPT4geCA9PT0gbW9kZSkgIT09IHVuZGVmaW5lZDtcbiAgaWYocmVzdWx0ID09PSBmYWxzZSl7XG4gICAgLy9tb2RlID0gY29uZmlnLmdldCgnbm90ZU5hbWVNb2RlJyk7XG4gICAgbW9kZSA9ICdzaGFycCc7XG4gICAgd2FybmluZ01zZyA9IG1vZGUgKyAnIGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSBtb2RlLCB1c2luZyBcIicgKyBtb2RlICsgJ1wiIGluc3RlYWQnO1xuICB9XG4gIHJldHVybiBtb2RlO1xufVxuXG5cbmZ1bmN0aW9uIF9jaGVja05vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXRcbiAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgYXJnMCA9IGFyZ3NbMF0sXG4gICAgYXJnMSA9IGFyZ3NbMV0sXG4gICAgY2hhcixcbiAgICBuYW1lID0gJycsXG4gICAgb2N0YXZlID0gJyc7XG5cbiAgLy8gZXh0cmFjdCBvY3RhdmUgZnJvbSBub3RlIG5hbWVcbiAgaWYobnVtQXJncyA9PT0gMSl7XG4gICAgZm9yKGNoYXIgb2YgYXJnMCl7XG4gICAgICBpZihpc05hTihjaGFyKSAmJiBjaGFyICE9PSAnLScpe1xuICAgICAgICBuYW1lICs9IGNoYXI7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgb2N0YXZlICs9IGNoYXI7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKG9jdGF2ZSA9PT0gJycpe1xuICAgICAgb2N0YXZlID0gMDtcbiAgICB9XG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIpe1xuICAgIG5hbWUgPSBhcmcwO1xuICAgIG9jdGF2ZSA9IGFyZzE7XG4gIH1cblxuICAvLyBjaGVjayBpZiBub3RlIG5hbWUgaXMgdmFsaWRcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgaW5kZXggPSAtMTtcblxuICBmb3IobGV0IGtleSBvZiBrZXlzKXtcbiAgICBsZXQgbW9kZSA9IG5vdGVOYW1lc1trZXldO1xuICAgIGluZGV4ID0gbW9kZS5maW5kSW5kZXgoeCA9PiB4ID09PSBuYW1lKTtcbiAgICBpZihpbmRleCAhPT0gLTEpe1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYoaW5kZXggPT09IC0xKXtcbiAgICBlcnJvck1zZyA9IGFyZzAgKyAnIGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSwgcGxlYXNlIHVzZSBsZXR0ZXJzIEEgLSBHIGFuZCBpZiBuZWNlc3NhcnkgYW4gYWNjaWRlbnRhbCBsaWtlICMsICMjLCBiIG9yIGJiLCBmb2xsb3dlZCBieSBhIG51bWJlciBmb3IgdGhlIG9jdGF2ZSc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYob2N0YXZlIDwgLTEgfHwgb2N0YXZlID4gOSl7XG4gICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYW4gb2N0YXZlIGJldHdlZW4gLTEgYW5kIDknO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG9jdGF2ZSA9IHBhcnNlSW50KG9jdGF2ZSwgMTApO1xuICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMCwgMSkudG9VcHBlckNhc2UoKSArIG5hbWUuc3Vic3RyaW5nKDEpO1xuXG4gIC8vY29uc29sZS5sb2cobmFtZSwnfCcsb2N0YXZlKTtcbiAgcmV0dXJuIFtuYW1lLCBvY3RhdmVdO1xufVxuXG5cblxuZnVuY3Rpb24gX2lzQmxhY2tLZXkobm90ZU51bWJlcil7XG4gIGxldCBibGFjaztcblxuICBzd2l0Y2godHJ1ZSl7XG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDE6Ly9DI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAzOi8vRCNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gNjovL0YjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDg6Ly9HI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxMDovL0EjXG4gICAgICBibGFjayA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYmxhY2sgPSBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBibGFjaztcbn1cblxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVOdW1iZXIoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUubnVtYmVyO1xuICB9XG4gIHJldHVybiBlcnJvck1zZztcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZU5hbWUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUubmFtZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVPY3RhdmUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUub2N0YXZlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnVsbE5vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmZ1bGxOYW1lO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnJlcXVlbmN5KC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmZyZXF1ZW5jeTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQmxhY2tLZXkoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUuYmxhY2tLZXk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuIiwiaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge3R5cGVTdHJpbmcsIGNoZWNrSWZCYXNlNjQsIGJhc2U2NFRvQmluYXJ5fSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCB7ZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuaW1wb3J0IHtxYW1iaX0gZnJvbSAnLi9xYW1iaSdcblxuXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU2FtcGxlKHNhbXBsZSwgaWQsIGV2ZXJ5KXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xuICAgIHRyeXtcbiAgICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSxcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MoYnVmZmVyKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBidWZmZXIpO1xuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWQsIGJ1ZmZlcn0pXG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KHtpZCwgYnVmZmVyfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoYnVmZmVyKTtcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25FcnJvcihlKXtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhICR7ZX0gW0lEOiAke2lkfV1gKTtcbiAgICAgICAgICAvL3JlamVjdChlKTsgLy8gZG9uJ3QgdXNlIHJlamVjdCBiZWNhdXNlIHdlIHVzZSB0aGlzIGFzIGEgbmVzdGVkIHByb21pc2UgYW5kIHdlIGRvbid0IHdhbnQgdGhlIHBhcmVudCBwcm9taXNlIHRvIHJlamVjdFxuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgfWNhdGNoKGUpe1xuICAgICAgY29uc29sZS53YXJuKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSlcbiAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZXNvbHZlKHtpZH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5cbmZ1bmN0aW9uIGxvYWRBbmRQYXJzZVNhbXBsZSh1cmwsIGlkLCBldmVyeSl7XG4gIC8vY29uc29sZS5sb2coaWQsIHVybClcbiAgLypcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAnbG9hZGluZycsXG4gICAgICBkYXRhOiB1cmxcbiAgICB9KVxuICB9LCAwKVxuICAqL1xuICBkaXNwYXRjaEV2ZW50KHtcbiAgICB0eXBlOiAnbG9hZGluZycsXG4gICAgZGF0YTogdXJsXG4gIH0pXG5cbiAgbGV0IGV4ZWN1dG9yID0gZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgZmV0Y2godXJsLCB7XG4gICAgICBtZXRob2Q6ICdHRVQnXG4gICAgfSkudGhlbihcbiAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgaWYocmVzcG9uc2Uub2spe1xuICAgICAgICAgIHJlc3BvbnNlLmFycmF5QnVmZmVyKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coaWQsIGRhdGEpXG4gICAgICAgICAgICBkZWNvZGVTYW1wbGUoZGF0YSwgaWQsIGV2ZXJ5KS50aGVuKHJlc29sdmUpXG4gICAgICAgICAgfSlcbiAgICAgICAgfWVsc2UgaWYodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgcmVzb2x2ZSh7aWR9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIClcbiAgfVxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpXG59XG5cblxuZnVuY3Rpb24gZ2V0UHJvbWlzZXMocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSl7XG5cbiAgY29uc3QgZ2V0U2FtcGxlID0gZnVuY3Rpb24oKXtcbiAgICBpZihrZXkgIT09ICdyZWxlYXNlJyAmJiBrZXkgIT09ICdpbmZvJyAmJiBrZXkgIT09ICdzdXN0YWluJyl7XG4gICAgICAvL2NvbnNvbGUubG9nKGtleSlcbiAgICAgIGlmKHNhbXBsZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXtcbiAgICAgICAgcHJvbWlzZXMucHVzaChkZWNvZGVTYW1wbGUoc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KSlcbiAgICAgIH1lbHNlIGlmKHR5cGVvZiBzYW1wbGUgPT09ICdzdHJpbmcnKXtcbiAgICAgICAgaWYoY2hlY2tJZkJhc2U2NChzYW1wbGUpKXtcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGRlY29kZVNhbXBsZShiYXNlNjRUb0JpbmFyeShzYW1wbGUpLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhiYXNlVXJsICsgc2FtcGxlKVxuICAgICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKGJhc2VVcmwgKyBlc2NhcGUoc2FtcGxlKSwga2V5LCBldmVyeSkpXG4gICAgICAgIH1cbiAgICAgIH1lbHNlIGlmKHR5cGVvZiBzYW1wbGUgPT09ICdvYmplY3QnKXtcbiAgICAgICAgc2FtcGxlID0gc2FtcGxlLnNhbXBsZSB8fCBzYW1wbGUuYnVmZmVyIHx8IHNhbXBsZS5iYXNlNjQgfHwgc2FtcGxlLnVybFxuICAgICAgICBnZXRTYW1wbGUocHJvbWlzZXMsIHNhbXBsZSwga2V5LCBiYXNlVXJsLCBldmVyeSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhrZXksIHNhbXBsZSlcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzYW1wbGUsIHByb21pc2VzLmxlbmd0aClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRTYW1wbGUoKVxufVxuXG5cbi8vIG9ubHkgZm9yIGludGVybmFsbHkgdXNlIGluIHFhbWJpXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGVzMihtYXBwaW5nLCBldmVyeSA9IGZhbHNlKXtcbiAgbGV0IHR5cGUgPSB0eXBlU3RyaW5nKG1hcHBpbmcpLFxuICAgIHByb21pc2VzID0gW10sXG4gICAgYmFzZVVybCA9ICcnXG5cbiAgaWYodHlwZW9mIG1hcHBpbmcuYmFzZVVybCA9PT0gJ3N0cmluZycpe1xuICAgIGJhc2VVcmwgPSBtYXBwaW5nLmJhc2VVcmxcbiAgICBkZWxldGUgbWFwcGluZy5iYXNlVXJsXG4gIH1cblxuICAvL2NvbnNvbGUubG9nKG1hcHBpbmcsIGJhc2VVcmwpXG5cbiAgZXZlcnkgPSB0eXBlb2YgZXZlcnkgPT09ICdmdW5jdGlvbicgPyBldmVyeSA6IGZhbHNlXG4gIC8vY29uc29sZS5sb2codHlwZSwgbWFwcGluZylcbiAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgIE9iamVjdC5rZXlzKG1hcHBpbmcpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgIC8vIGlmKGlzTmFOKGtleSkgPT09IGZhbHNlKXtcbiAgICAgIC8vICAga2V5ID0gcGFyc2VJbnQoa2V5LCAxMClcbiAgICAgIC8vIH1cbiAgICAgIGxldCBhID0gbWFwcGluZ1trZXldXG4gICAgICAvL2NvbnNvbGUubG9nKGtleSwgYSwgdHlwZVN0cmluZyhhKSlcbiAgICAgIGlmKHR5cGVTdHJpbmcoYSkgPT09ICdhcnJheScpe1xuICAgICAgICBhLmZvckVhY2gobWFwID0+IHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKG1hcClcbiAgICAgICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgbWFwLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGdldFByb21pc2VzKHByb21pc2VzLCBhLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KVxuICAgICAgfVxuICAgIH0pXG4gIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgIGxldCBrZXlcbiAgICBtYXBwaW5nLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlKXtcbiAgICAgIC8vIGtleSBpcyBkZWxpYmVyYXRlbHkgdW5kZWZpbmVkXG4gICAgICBnZXRQcm9taXNlcyhwcm9taXNlcywgc2FtcGxlLCBrZXksIGJhc2VVcmwsIGV2ZXJ5KVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgLnRoZW4oKHZhbHVlcykgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZyh0eXBlLCB2YWx1ZXMpXG4gICAgICBpZih0eXBlID09PSAnb2JqZWN0Jyl7XG4gICAgICAgIG1hcHBpbmcgPSB7fVxuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgLy8gc3VwcG9ydCBmb3IgbXVsdGkgbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgICAgIGxldCBtYXAgPSBtYXBwaW5nW3ZhbHVlLmlkXVxuICAgICAgICAgIGxldCB0eXBlID0gdHlwZVN0cmluZyhtYXApXG4gICAgICAgICAgaWYodHlwZSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgICAgICAgIG1hcC5wdXNoKHZhbHVlLmJ1ZmZlcilcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IFttYXAsIHZhbHVlLmJ1ZmZlcl1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gdmFsdWUuYnVmZmVyXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAvL2NvbnNvbGUubG9nKG1hcHBpbmcpXG4gICAgICAgIHJlc29sdmUobWFwcGluZylcbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgICByZXNvbHZlKHZhbHVlcyk7XG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGVzKC4uLmRhdGEpe1xuICBpZihkYXRhLmxlbmd0aCA9PT0gMSAmJiB0eXBlU3RyaW5nKGRhdGFbMF0pICE9PSAnc3RyaW5nJyl7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhWzBdKVxuICAgIHJldHVybiBwYXJzZVNhbXBsZXMyKGRhdGFbMF0pXG4gIH1cbiAgcmV0dXJuIHBhcnNlU2FtcGxlczIoZGF0YSlcbn1cbiIsImltcG9ydCB7Z2V0TmljZVRpbWV9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge01JRElOb3RlfSBmcm9tICcuL21pZGlfbm90ZSc7XG5cbmxldFxuICBwcHEsXG4gIGJwbSxcbiAgZmFjdG9yLFxuICBub21pbmF0b3IsXG4gIGRlbm9taW5hdG9yLFxuICBwbGF5YmFja1NwZWVkLFxuXG4gIGJhcixcbiAgYmVhdCxcbiAgc2l4dGVlbnRoLFxuICB0aWNrLFxuICB0aWNrcyxcbiAgbWlsbGlzLFxuXG4gIG1pbGxpc1BlclRpY2ssXG4gIHNlY29uZHNQZXJUaWNrLFxuXG4gIHRpY2tzUGVyQmVhdCxcbiAgdGlja3NQZXJCYXIsXG4gIHRpY2tzUGVyU2l4dGVlbnRoLFxuICBudW1TaXh0ZWVudGgsXG5cbiAgZGlmZlRpY2tzXG4gIC8vcHJldmlvdXNFdmVudFxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKXtcbiAgc2Vjb25kc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHE7XG4gIG1pbGxpc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljayAqIDEwMDA7XG4gIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljaywgYnBtLCBwcHEsIHBsYXliYWNrU3BlZWQsIChwcHEgKiBtaWxsaXNQZXJUaWNrKSk7XG4gIC8vY29uc29sZS5sb2cocHBxKTtcbn1cblxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKXtcbiAgZmFjdG9yID0gKDQgLyBkZW5vbWluYXRvcik7XG4gIG51bVNpeHRlZW50aCA9IGZhY3RvciAqIDQ7XG4gIHRpY2tzUGVyQmVhdCA9IHBwcSAqIGZhY3RvcjtcbiAgdGlja3NQZXJCYXIgPSB0aWNrc1BlckJlYXQgKiBub21pbmF0b3I7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gcHBxIC8gNDtcbiAgLy9jb25zb2xlLmxvZyhkZW5vbWluYXRvciwgZmFjdG9yLCBudW1TaXh0ZWVudGgsIHRpY2tzUGVyQmVhdCwgdGlja3NQZXJCYXIsIHRpY2tzUGVyU2l4dGVlbnRoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCwgZmFzdCA9IGZhbHNlKXtcbiAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgLy8gaWYoZGlmZlRpY2tzIDwgMCl7XG4gIC8vICAgY29uc29sZS5sb2coZGlmZlRpY2tzLCBldmVudC50aWNrcywgcHJldmlvdXNFdmVudC50aWNrcywgcHJldmlvdXNFdmVudC50eXBlKVxuICAvLyB9XG4gIHRpY2sgKz0gZGlmZlRpY2tzO1xuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICAvL3ByZXZpb3VzRXZlbnQgPSBldmVudFxuICAvL2NvbnNvbGUubG9nKGRpZmZUaWNrcywgbWlsbGlzUGVyVGljayk7XG4gIG1pbGxpcyArPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuXG4gIGlmKGZhc3QgPT09IGZhbHNlKXtcbiAgICB3aGlsZSh0aWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCsrO1xuICAgICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICAgIHdoaWxlKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICAgIGJlYXQrKztcbiAgICAgICAgd2hpbGUoYmVhdCA+IG5vbWluYXRvcil7XG4gICAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgICAgYmFyKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUaW1lRXZlbnRzKHNldHRpbmdzLCB0aW1lRXZlbnRzLCBpc1BsYXlpbmcgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlIHRpbWUgZXZlbnRzJylcbiAgbGV0IHR5cGU7XG4gIGxldCBldmVudDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuICBsZXQgZSA9IDA7XG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGUrKywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG4gICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcblxuICAgIHN3aXRjaCh0eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgc2V0VGlja0R1cmF0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBzZXRUaWNrc1BlckJlYXQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICB1cGRhdGVFdmVudChldmVudCwgaXNQbGF5aW5nKTtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmJhcnNBc1N0cmluZyk7XG4gIH1cblxuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG4gIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAvL2NvbnNvbGUubG9nKHRpbWVFdmVudHMpO1xufVxuXG5cbi8vZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKHNvbmcsIGV2ZW50cyl7XG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoZXZlbnRzLCBpc1BsYXlpbmcgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlRXZlbnRzJylcbiAgbGV0IGV2ZW50O1xuICBsZXQgc3RhcnRFdmVudCA9IDA7XG4gIGxldCBsYXN0RXZlbnRUaWNrID0gMDtcbiAgbGV0IHJlc3VsdCA9IFtdXG5cbiAgdGljayA9IDBcbiAgdGlja3MgPSAwXG4gIGRpZmZUaWNrcyA9IDBcblxuICAvL2xldCBldmVudHMgPSBbXS5jb25jYXQoZXZ0cywgc29uZy5fdGltZUV2ZW50cyk7XG4gIGxldCBudW1FdmVudHMgPSBldmVudHMubGVuZ3RoXG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuXG4gIC8vIG5vdGVvZmYgY29tZXMgYmVmb3JlIG5vdGVvblxuXG4vKlxuICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gYS5zb3J0SW5kZXggLSBiLnNvcnRJbmRleDtcbiAgfSlcbiovXG5cbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICAvLyBpZihhLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAtMVxuICAgICAgLy8gfWVsc2UgaWYoYi50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gMVxuICAgICAgLy8gfVxuICAgICAgLy8gc2hvcnQ6XG4gICAgICBsZXQgciA9IGEudHlwZSAtIGIudHlwZTtcbiAgICAgIGlmKGEudHlwZSA9PT0gMTc2ICYmIGIudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgciA9IC0xXG4gICAgICB9XG4gICAgICByZXR1cm4gclxuICAgIH1cbiAgICByZXR1cm4gYS50aWNrcyAtIGIudGlja3NcbiAgfSlcbiAgZXZlbnQgPSBldmVudHNbMF1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcblxuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcblxuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuXG4gIGZvcihsZXQgaSA9IHN0YXJ0RXZlbnQ7IGkgPCBudW1FdmVudHM7IGkrKyl7XG5cbiAgICBldmVudCA9IGV2ZW50c1tpXTtcblxuICAgIHN3aXRjaChldmVudC50eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuICAgICAgICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgICAgICAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzXG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLGV2ZW50Lm1pbGxpc1BlclRpY2spO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICAgICAgICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAgICAgICBkaWZmVGlja3MgPSBldmVudC50aWNrcyAtIHRpY2tzXG4gICAgICAgIHRpY2sgKz0gZGlmZlRpY2tzXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub21pbmF0b3IsbnVtU2l4dGVlbnRoLHRpY2tzUGVyU2l4dGVlbnRoKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG5cblxuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgIC8vY2FzZSAxMjg6XG4gICAgICAvL2Nhc2UgMTQ0OlxuICAgICAgICB1cGRhdGVQb3NpdGlvbihldmVudCwgaXNQbGF5aW5nKTtcbiAgICAgICAgdXBkYXRlRXZlbnQoZXZlbnQsIGlzUGxheWluZyk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuXG4gICAgICAgIC8vIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50LmRhdGEyLCBldmVudC5iYXJzQXNTdHJpbmcpXG4gICAgICAgIC8vIH1cblxuICAgIH1cblxuXG4gICAgLy8gaWYoaSA8IDEwMCAmJiAoZXZlbnQudHlwZSA9PT0gODEgfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkpe1xuICAgIC8vICAgLy9jb25zb2xlLmxvZyhpLCB0aWNrcywgZGlmZlRpY2tzLCBtaWxsaXMsIG1pbGxpc1BlclRpY2spXG4gICAgLy8gICBjb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5taWxsaXMsICdub3RlJywgZXZlbnQuZGF0YTEsICd2ZWxvJywgZXZlbnQuZGF0YTIpXG4gICAgLy8gfVxuXG4gICAgbGFzdEV2ZW50VGljayA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIHBhcnNlTUlESU5vdGVzKHJlc3VsdClcbiAgcmV0dXJuIHJlc3VsdFxuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnQoZXZlbnQsIGZhc3QgPSBmYWxzZSl7XG4gIC8vY29uc29sZS5sb2coYmFyLCBiZWF0LCB0aWNrcylcbiAgLy9jb25zb2xlLmxvZyhldmVudCwgYnBtLCBtaWxsaXNQZXJUaWNrLCB0aWNrcywgbWlsbGlzKTtcblxuICBldmVudC5icG0gPSBicG07XG4gIGV2ZW50Lm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgZXZlbnQuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICBldmVudC50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICBldmVudC50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gIGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgZXZlbnQuZmFjdG9yID0gZmFjdG9yO1xuICBldmVudC5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gIGV2ZW50LnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG4gIGV2ZW50Lm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuXG5cbiAgZXZlbnQudGlja3MgPSB0aWNrcztcblxuICBldmVudC5taWxsaXMgPSBtaWxsaXM7XG4gIGV2ZW50LnNlY29uZHMgPSBtaWxsaXMgLyAxMDAwO1xuXG4gIGlmKGZhc3Qpe1xuICAgIHJldHVyblxuICB9XG5cbiAgZXZlbnQuYmFyID0gYmFyO1xuICBldmVudC5iZWF0ID0gYmVhdDtcbiAgZXZlbnQuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICBldmVudC50aWNrID0gdGljaztcbiAgLy9ldmVudC5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGljaztcbiAgdmFyIHRpY2tBc1N0cmluZyA9IHRpY2sgPT09IDAgPyAnMDAwJyA6IHRpY2sgPCAxMCA/ICcwMCcgKyB0aWNrIDogdGljayA8IDEwMCA/ICcwJyArIHRpY2sgOiB0aWNrO1xuICBldmVudC5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgdGlja0FzU3RyaW5nO1xuICBldmVudC5iYXJzQXNBcnJheSA9IFtiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja107XG5cblxuICB2YXIgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuXG4gIGV2ZW50LmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICBldmVudC5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gIGV2ZW50LnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgZXZlbnQubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgZXZlbnQudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICBldmVudC50aW1lQXNBcnJheSA9IHRpbWVEYXRhLnRpbWVBc0FycmF5O1xuXG4gIC8vIGlmKG1pbGxpcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAvLyB9XG5cblxufVxuXG5cbmxldCBtaWRpTm90ZUluZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNSURJTm90ZXMoZXZlbnRzKXtcbiAgbGV0IG5vdGVzID0ge31cbiAgbGV0IG5vdGVzSW5UcmFja1xuICBsZXQgbiA9IDBcbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKHR5cGVvZiBldmVudC5fcGFydCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGV2ZW50Ll90cmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgY29uc29sZS5sb2coJ25vIHBhcnQgYW5kL29yIHRyYWNrIHNldCcpXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdID0ge31cbiAgICAgIH1cbiAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudFxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC5fdHJhY2suaWRdXG4gICAgICBpZih0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIGNvcnJlc3BvbmRpbmcgbm90ZW9uIGV2ZW50IGZvdW5kIGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbGV0IG5vdGVPbiA9IG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV1cbiAgICAgIGxldCBub3RlT2ZmID0gZXZlbnRcbiAgICAgIGlmKHR5cGVvZiBub3RlT24gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy9jb25zb2xlLmluZm8obisrLCAnbm8gbm90ZW9uIGV2ZW50IGZvciBldmVudCcsIGV2ZW50LmlkKVxuICAgICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlID0gbmV3IE1JRElOb3RlKG5vdGVPbiwgbm90ZU9mZilcbiAgICAgIG5vdGUgPSBudWxsXG4gICAgICAvLyBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgICAgLy8gbm90ZU9uLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgLy8gbm90ZU9uLm9mZiA9IG5vdGVPZmYuaWRcbiAgICAgIC8vIG5vdGVPZmYubWlkaU5vdGVJZCA9IGlkXG4gICAgICAvLyBub3RlT2ZmLm9uID0gbm90ZU9uLmlkXG4gICAgICBkZWxldGUgbm90ZXNbZXZlbnQuX3RyYWNrLmlkXVtldmVudC5kYXRhMV1cbiAgICB9XG4gIH1cbiAgT2JqZWN0LmtleXMobm90ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICBkZWxldGUgbm90ZXNba2V5XVxuICB9KVxuICBub3RlcyA9IHt9XG4gIC8vY29uc29sZS5sb2cobm90ZXMsIG5vdGVzSW5UcmFjaylcbn1cblxuXG4vLyBub3QgaW4gdXNlIVxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckV2ZW50cyhldmVudHMpe1xuICBsZXQgc3VzdGFpbiA9IHt9XG4gIGxldCB0bXBSZXN1bHQgPSB7fVxuICBsZXQgcmVzdWx0ID0gW11cbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICBpZih0eXBlb2Ygc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1lbHNlIGlmKHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09IGV2ZW50LnRpY2tzKXtcbiAgICAgICAgICBkZWxldGUgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50XG4gICAgICAgIGRlbGV0ZSBzdXN0YWluW2V2ZW50LnRyYWNrSWRdXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMTI3KXtcbiAgICAgICAgc3VzdGFpbltldmVudC50cmFja0lkXSA9IGV2ZW50LnRpY2tzXG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKHN1c3RhaW4pXG4gIE9iamVjdC5rZXlzKHRtcFJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGxldCBzdXN0YWluRXZlbnQgPSB0bXBSZXN1bHRba2V5XVxuICAgIGNvbnNvbGUubG9nKHN1c3RhaW5FdmVudClcbiAgICByZXN1bHQucHVzaChzdXN0YWluRXZlbnQpXG4gIH0pXG4gIHJldHVybiByZXN1bHRcbn1cbiIsIi8vIEAgZmxvd1xuXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbCdcblxubGV0IHBhcnRJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFBhcnR7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gbnVsbCl7XG4gICAgdGhpcy5pZCA9IGBNUF8ke3BhcnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IHRoaXMuaWRcbiAgICB0aGlzLm11dGVkID0gZmFsc2VcbiAgICB0aGlzLl90cmFjayA9IG51bGxcbiAgICB0aGlzLl9zb25nID0gbnVsbFxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB0aGlzLl9zdGFydCA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICAgIHRoaXMuX2VuZCA9IHttaWxsaXM6IDAsIHRpY2tzOiAwfVxuICB9XG5cbiAgY29weSgpe1xuICAgIGxldCBwID0gbmV3IFBhcnQodGhpcy5uYW1lICsgJ19jb3B5JykgLy8gaW1wbGVtZW50IGdldE5hbWVPZkNvcHkoKSBpbiB1dGlsIChzZWUgaGVhcnRiZWF0KVxuICAgIGxldCBldmVudHMgPSBbXVxuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIGxldCBjb3B5ID0gZXZlbnQuY29weSgpXG4gICAgICBjb25zb2xlLmxvZyhjb3B5KVxuICAgICAgZXZlbnRzLnB1c2goY29weSlcbiAgICB9KVxuICAgIHAuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICBwLnVwZGF0ZSgpXG4gICAgcmV0dXJuIHBcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZSh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cbiAgbW92ZVRvKHRpY2tzOiBudW1iZXIpe1xuICAgIHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgICBsZXQgdHJhY2sgPSB0aGlzLl90cmFja1xuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQuX3BhcnQgPSB0aGlzXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB0aGlzLl9ldmVudHMucHVzaChldmVudClcbiAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdHJhY2tcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmKHRyYWNrKXtcbiAgICAgIHRyYWNrLl9ldmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgICB0cmFjay5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgfVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbmV3RXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgfVxuXG4gIHJlbW92ZUV2ZW50cyguLi5ldmVudHMpe1xuICAgIGxldCB0cmFjayA9IHRoaXMuX3RyYWNrXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5fcGFydCA9IG51bGxcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuZGVsZXRlKGV2ZW50LmlkKVxuICAgICAgaWYodHJhY2spe1xuICAgICAgICBldmVudC5fdHJhY2sgPSBudWxsXG4gICAgICAgIHRyYWNrLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmKHRyYWNrKXtcbiAgICAgIHRyYWNrLl9uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICAgIHRyYWNrLl9jcmVhdGVFdmVudEFycmF5ID0gdHJ1ZVxuICAgIH1cbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlRXZlbnRzKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gICAgaWYodGhpcy5fc29uZyl7XG4gICAgICB0aGlzLl9zb25nLl9tb3ZlZEV2ZW50cy5wdXNoKC4uLnRoaXMuX2V2ZW50cylcbiAgICB9XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICBtb3ZlRXZlbnRzVG8odGlja3M6IG51bWJlciwgLi4uZXZlbnRzKXtcbiAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50Lm1vdmVUbyh0aWNrcylcbiAgICB9KVxuICAgIGlmKHRoaXMuX3Nvbmcpe1xuICAgICAgdGhpcy5fc29uZy5fbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICB9XG5cblxuICBnZXRFdmVudHMoZmlsdGVyOiBzdHJpbmdbXSA9IG51bGwpeyAvLyBjYW4gYmUgdXNlIGFzIGZpbmRFdmVudHNcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSl7XG4gICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgfVxuICAgIHJldHVybiBbLi4udGhpcy5fZXZlbnRzXSAvL0BUT0RPIGltcGxlbWVudCBmaWx0ZXIgLT4gZmlsdGVyRXZlbnRzKCkgc2hvdWxkIGJlIGEgdXRpbGl0eSBmdW5jdGlvbiAobm90IGEgY2xhc3MgbWV0aG9kKVxuICB9XG5cbiAgbXV0ZShmbGFnOiBib29sZWFuID0gbnVsbCl7XG4gICAgaWYoZmxhZyl7XG4gICAgICB0aGlzLm11dGVkID0gZmxhZ1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5tdXRlZCA9ICF0aGlzLm11dGVkXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKCl7XG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUgPT09IGZhbHNlKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZih0aGlzLl9jcmVhdGVFdmVudEFycmF5KXtcbiAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSlcbiAgICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSBmYWxzZVxuICAgIH1cbiAgICBzb3J0RXZlbnRzKHRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgLy9AVE9ETzogY2FsY3VsYXRlIHBhcnQgc3RhcnQgYW5kIGVuZCwgYW5kIGhpZ2hlc3QgYW5kIGxvd2VzdCBub3RlXG4gIH1cbn1cbiIsImltcG9ydCB7Z2V0UG9zaXRpb24yfSBmcm9tICcuL3Bvc2l0aW9uLmpzJ1xuaW1wb3J0IHtkaXNwYXRjaEV2ZW50fSBmcm9tICcuL2V2ZW50bGlzdGVuZXIuanMnXG5pbXBvcnQge3NvcnRFdmVudHN9IGZyb20gJy4vdXRpbC5qcydcblxuY29uc3QgcmFuZ2UgPSAxMCAvLyBtaWxsaXNlY29uZHMgb3IgdGlja3NcbmxldCBpbnN0YW5jZUlkID0gMFxuXG5leHBvcnQgY2xhc3MgUGxheWhlYWR7XG5cbiAgY29uc3RydWN0b3Ioc29uZywgdHlwZSA9ICdhbGwnKXtcbiAgICB0aGlzLmlkID0gYFBPUyAke2luc3RhbmNlSWQrK30gJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgdGhpcy5zb25nID0gc29uZ1xuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLmxhc3RFdmVudCA9IG51bGxcbiAgICB0aGlzLmRhdGEgPSB7fVxuXG4gICAgdGhpcy5hY3RpdmVQYXJ0cyA9IFtdXG4gICAgdGhpcy5hY3RpdmVOb3RlcyA9IFtdXG4gICAgdGhpcy5hY3RpdmVFdmVudHMgPSBbXVxuICB9XG5cbiAgLy8gdW5pdCBjYW4gYmUgJ21pbGxpcycgb3IgJ3RpY2tzJ1xuICBzZXQodW5pdCwgdmFsdWUpe1xuICAgIHRoaXMudW5pdCA9IHVuaXRcbiAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9IHZhbHVlXG4gICAgdGhpcy5ldmVudEluZGV4ID0gMFxuICAgIHRoaXMubm90ZUluZGV4ID0gMFxuICAgIHRoaXMucGFydEluZGV4ID0gMFxuICAgIHRoaXMuY2FsY3VsYXRlKClcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuXG4gIGdldCgpe1xuICAgIHJldHVybiB0aGlzLmRhdGFcbiAgfVxuXG5cbiAgdXBkYXRlKHVuaXQsIGRpZmYpe1xuICAgIGlmKGRpZmYgPT09IDApe1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YVxuICAgIH1cbiAgICB0aGlzLnVuaXQgPSB1bml0XG4gICAgdGhpcy5jdXJyZW50VmFsdWUgKz0gZGlmZlxuICAgIHRoaXMuY2FsY3VsYXRlKClcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuXG4gIHVwZGF0ZVNvbmcoKXtcbiAgICB0aGlzLmV2ZW50cyA9IFsuLi50aGlzLnNvbmcuX2V2ZW50cywgLi4udGhpcy5zb25nLl90aW1lRXZlbnRzXVxuICAgIHNvcnRFdmVudHModGhpcy5ldmVudHMpXG4gICAgLy9jb25zb2xlLmxvZygnZXZlbnRzICVPJywgdGhpcy5ldmVudHMpXG4gICAgdGhpcy5ub3RlcyA9IHRoaXMuc29uZy5fbm90ZXNcbiAgICB0aGlzLnBhcnRzID0gdGhpcy5zb25nLl9wYXJ0c1xuICAgIHRoaXMubnVtRXZlbnRzID0gdGhpcy5ldmVudHMubGVuZ3RoXG4gICAgdGhpcy5udW1Ob3RlcyA9IHRoaXMubm90ZXMubGVuZ3RoXG4gICAgdGhpcy5udW1QYXJ0cyA9IHRoaXMucGFydHMubGVuZ3RoXG4gICAgdGhpcy5zZXQoJ21pbGxpcycsIHRoaXMuc29uZy5fbWlsbGlzKVxuICB9XG5cblxuICBjYWxjdWxhdGUoKXtcbiAgICBsZXQgaVxuICAgIGxldCB2YWx1ZVxuICAgIGxldCBldmVudFxuICAgIGxldCBub3RlXG4gICAgbGV0IHBhcnRcbiAgICBsZXQgcG9zaXRpb25cbiAgICBsZXQgc3RpbGxBY3RpdmVOb3RlcyA9IFtdXG4gICAgbGV0IHN0aWxsQWN0aXZlUGFydHMgPSBbXVxuICAgIGxldCBjb2xsZWN0ZWRQYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGxldCBjb2xsZWN0ZWROb3RlcyA9IG5ldyBTZXQoKVxuXG4gICAgdGhpcy5kYXRhID0ge31cbiAgICB0aGlzLmFjdGl2ZUV2ZW50cyA9IFtdXG5cbiAgICBmb3IoaSA9IHRoaXMuZXZlbnRJbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspe1xuICAgICAgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXVxuICAgICAgdmFsdWUgPSBldmVudFt0aGlzLnVuaXRdXG4gICAgICBpZih2YWx1ZSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgIC8vIGlmIHRoZSBwbGF5aGVhZCBpcyBzZXQgdG8gYSBwb3NpdGlvbiBvZiBzYXkgMzAwMCBtaWxsaXMsIHdlIGRvbid0IHdhbnQgdG8gYWRkIGV2ZW50cyBtb3JlIHRoYXQgMTAgdW5pdHMgYmVmb3JlIHRoZSBwbGF5aGVhZFxuICAgICAgICBpZih2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA+IHRoaXMuY3VycmVudFZhbHVlIC0gcmFuZ2Upe1xuICAgICAgICAgIHRoaXMuYWN0aXZlRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgICAgLy8gdGhpcyBkb2Vzbid0IHdvcmsgdG9vIHdlbGxcbiAgICAgICAgICBpZihldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTIpXG4gICAgICAgICAgICBpZihldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnc3VzdGFpbnBlZGFsMicsXG4gICAgICAgICAgICAgICAgZGF0YTogZXZlbnQuZGF0YTIgPT09IDEyNyA/ICdkb3duJyA6ICd1cCdcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAvLyB9ZWxzZXtcbiAgICAgICAgICAvLyAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgIC8vICAgICB0eXBlOiAnZXZlbnQnLFxuICAgICAgICAgIC8vICAgICBkYXRhOiBldmVudFxuICAgICAgICAgIC8vICAgfSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGU6ICdldmVudCcsXG4gICAgICAgICAgICBkYXRhOiBldmVudFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0RXZlbnQgPSBldmVudFxuICAgICAgICB0aGlzLmV2ZW50SW5kZXgrK1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tJylcbiAgICB0aGlzLmRhdGEuYWN0aXZlRXZlbnRzID0gdGhpcy5hY3RpdmVFdmVudHNcblxuICAgIC8vIGlmIGEgc29uZyBoYXMgbm8gZXZlbnRzIHlldCwgdXNlIHRoZSBmaXJzdCB0aW1lIGV2ZW50IGFzIHJlZmVyZW5jZVxuICAgIGlmKHRoaXMubGFzdEV2ZW50ID09PSBudWxsKXtcbiAgICAgIHRoaXMubGFzdEV2ZW50ID0gdGhpcy5zb25nLl90aW1lRXZlbnRzWzBdXG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBnZXRQb3NpdGlvbjIodGhpcy5zb25nLCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlLCAnYWxsJywgdGhpcy5sYXN0RXZlbnQpXG4gICAgdGhpcy5kYXRhLmV2ZW50SW5kZXggPSB0aGlzLmV2ZW50SW5kZXhcbiAgICB0aGlzLmRhdGEubWlsbGlzID0gcG9zaXRpb24ubWlsbGlzXG4gICAgdGhpcy5kYXRhLnRpY2tzID0gcG9zaXRpb24udGlja3NcbiAgICB0aGlzLmRhdGEucG9zaXRpb24gPSBwb3NpdGlvblxuXG4gICAgaWYodGhpcy50eXBlLmluZGV4T2YoJ2FsbCcpICE9PSAtMSl7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YVxuICAgICAgZm9yKGxldCBrZXkgb2YgT2JqZWN0LmtleXMocG9zaXRpb24pKXtcbiAgICAgICAgZGF0YVtrZXldID0gcG9zaXRpb25ba2V5XVxuICAgICAgfVxuICAgIH1lbHNlIGlmKHRoaXMudHlwZS5pbmRleE9mKCdiYXJzYmVhdHMnKSAhPT0gLTEpe1xuICAgICAgdGhpcy5kYXRhLmJhciA9IHBvc2l0aW9uLmJhclxuICAgICAgdGhpcy5kYXRhLmJlYXQgPSBwb3NpdGlvbi5iZWF0XG4gICAgICB0aGlzLmRhdGEuc2l4dGVlbnRoID0gcG9zaXRpb24uc2l4dGVlbnRoXG4gICAgICB0aGlzLmRhdGEudGljayA9IHBvc2l0aW9uLnRpY2tcbiAgICAgIHRoaXMuZGF0YS5iYXJzQXNTdHJpbmcgPSBwb3NpdGlvbi5iYXJzQXNTdHJpbmdcblxuICAgICAgdGhpcy5kYXRhLnRpY2tzUGVyQmFyID0gcG9zaXRpb24udGlja3NQZXJCYXJcbiAgICAgIHRoaXMuZGF0YS50aWNrc1BlckJlYXQgPSBwb3NpdGlvbi50aWNrc1BlckJlYXRcbiAgICAgIHRoaXMuZGF0YS50aWNrc1BlclNpeHRlZW50aCA9IHBvc2l0aW9uLnRpY2tzUGVyU2l4dGVlbnRoXG4gICAgICB0aGlzLmRhdGEubnVtU2l4dGVlbnRoID0gcG9zaXRpb24ubnVtU2l4dGVlbnRoXG5cbiAgICB9ZWxzZSBpZih0aGlzLnR5cGUuaW5kZXhPZigndGltZScpICE9PSAtMSl7XG4gICAgICB0aGlzLmRhdGEuaG91ciA9IHBvc2l0aW9uLmhvdXJcbiAgICAgIHRoaXMuZGF0YS5taW51dGUgPSBwb3NpdGlvbi5taW51dGVcbiAgICAgIHRoaXMuZGF0YS5zZWNvbmQgPSBwb3NpdGlvbi5zZWNvbmRcbiAgICAgIHRoaXMuZGF0YS5taWxsaXNlY29uZCA9IHBvc2l0aW9uLm1pbGxpc2Vjb25kXG4gICAgICB0aGlzLmRhdGEudGltZUFzU3RyaW5nID0gcG9zaXRpb24udGltZUFzU3RyaW5nXG5cbiAgICB9ZWxzZSBpZih0aGlzLnR5cGUuaW5kZXhPZigncGVyY2VudGFnZScpICE9PSAtMSl7XG4gICAgICB0aGlzLmRhdGEucGVyY2VudGFnZSA9IHBvc2l0aW9uLnBlcmNlbnRhZ2VcbiAgICB9XG5cbiAgICAvLyBnZXQgYWN0aXZlIG5vdGVzXG4gICAgaWYodGhpcy50eXBlLmluZGV4T2YoJ25vdGVzJykgIT09IC0xIHx8IHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpe1xuXG4gICAgICAvLyBnZXQgYWxsIG5vdGVzIGJldHdlZW4gdGhlIG5vdGVJbmRleCBhbmQgdGhlIGN1cnJlbnQgcGxheWhlYWQgcG9zaXRpb25cbiAgICAgIGZvcihpID0gdGhpcy5ub3RlSW5kZXg7IGkgPCB0aGlzLm51bU5vdGVzOyBpKyspe1xuICAgICAgICBub3RlID0gdGhpcy5ub3Rlc1tpXVxuICAgICAgICB2YWx1ZSA9IG5vdGUubm90ZU9uW3RoaXMudW5pdF1cbiAgICAgICAgaWYodmFsdWUgPD0gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHRoaXMubm90ZUluZGV4KytcbiAgICAgICAgICBpZih0eXBlb2Ygbm90ZS5ub3RlT2ZmID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gaWYgdGhlIHBsYXloZWFkIGlzIHNldCB0byBhIHBvc2l0aW9uIG9mIHNheSAzMDAwIG1pbGxpcywgd2UgZG9uJ3Qgd2FudCB0byBhZGQgbm90ZXMgYmVmb3JlIHRoZSBwbGF5aGVhZFxuICAgICAgICAgIGlmKHRoaXMuY3VycmVudFZhbHVlID09PSAwIHx8IG5vdGUubm90ZU9mZlt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgICAgY29sbGVjdGVkTm90ZXMuYWRkKG5vdGUpXG4gICAgICAgICAgICBkaXNwYXRjaEV2ZW50KHtcbiAgICAgICAgICAgICAgdHlwZTogJ25vdGVPbicsXG4gICAgICAgICAgICAgIGRhdGE6IG5vdGVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBmaWx0ZXIgbm90ZXMgdGhhdCBhcmUgbm8gbG9uZ2VyIGFjdGl2ZVxuICAgICAgZm9yKGkgPSB0aGlzLmFjdGl2ZU5vdGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcbiAgICAgICAgbm90ZSA9IHRoaXMuYWN0aXZlTm90ZXNbaV07XG4gICAgICAgIC8vaWYobm90ZS5ub3RlT24uc3RhdGUuaW5kZXhPZigncmVtb3ZlZCcpID09PSAwIHx8IHRoaXMuc29uZy5fbm90ZXNCeUlkLmdldChub3RlLmlkKSA9PT0gZmFsc2Upe1xuICAgICAgICBpZih0aGlzLnNvbmcuX25vdGVzQnlJZC5nZXQobm90ZS5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdza2lwcGluZyByZW1vdmVkIG5vdGUnLCBub3RlLmlkKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHR5cGVvZiBub3RlLm5vdGVPZmYgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ25vdGUgd2l0aCBpZCcsIG5vdGUuaWQsICdoYXMgbm8gbm90ZU9mZiBldmVudCcpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZihub3RlLm5vdGVPZmZbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlICYmIGNvbGxlY3RlZE5vdGVzLmhhcyhub3RlKSA9PT0gZmFsc2Upe1xuICAgICAgICBpZihub3RlLm5vdGVPZmZbdGhpcy51bml0XSA+IHRoaXMuY3VycmVudFZhbHVlKXtcbiAgICAgICAgICBzdGlsbEFjdGl2ZU5vdGVzLnB1c2gobm90ZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgICAgICAgdHlwZTogJ25vdGVPZmYnLFxuICAgICAgICAgICAgZGF0YTogbm90ZVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHRoZSBzdGlsbCBhY3RpdmUgbm90ZXMgYW5kIHRoZSBuZXdseSBhY3RpdmUgZXZlbnRzIHRvIHRoZSBhY3RpdmUgbm90ZXMgYXJyYXlcbiAgICAgIHRoaXMuYWN0aXZlTm90ZXMgPSBbLi4uY29sbGVjdGVkTm90ZXMudmFsdWVzKCksIC4uLnN0aWxsQWN0aXZlTm90ZXNdXG4gICAgICB0aGlzLmRhdGEuYWN0aXZlTm90ZXMgPSB0aGlzLmFjdGl2ZU5vdGVzXG4gICAgfVxuXG5cbiAgICAvLyBnZXQgYWN0aXZlIHBhcnRzXG4gICAgaWYodGhpcy50eXBlLmluZGV4T2YoJ3BhcnRzJykgIT09IC0xIHx8IHRoaXMudHlwZS5pbmRleE9mKCdhbGwnKSAhPT0gLTEpe1xuXG4gICAgICBmb3IoaSA9IHRoaXMucGFydEluZGV4OyBpIDwgdGhpcy5udW1QYXJ0czsgaSsrKXtcbiAgICAgICAgcGFydCA9IHRoaXMucGFydHNbaV1cbiAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJ0LCB0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAgICAgaWYocGFydC5fc3RhcnRbdGhpcy51bml0XSA8PSB0aGlzLmN1cnJlbnRWYWx1ZSl7XG4gICAgICAgICAgY29sbGVjdGVkUGFydHMuYWRkKHBhcnQpXG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAncGFydE9uJyxcbiAgICAgICAgICAgIGRhdGE6IHBhcnRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRoaXMucGFydEluZGV4KytcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIC8vIGZpbHRlciBwYXJ0cyB0aGF0IGFyZSBubyBsb25nZXIgYWN0aXZlXG4gICAgICBmb3IoaSA9IHRoaXMuYWN0aXZlUGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgICBwYXJ0ID0gdGhpcy5hY3RpdmVQYXJ0c1tpXTtcbiAgICAgICAgLy9pZihwYXJ0LnN0YXRlLmluZGV4T2YoJ3JlbW92ZWQnKSA9PT0gMCB8fCB0aGlzLnNvbmcuX3BhcnRzQnlJZC5nZXQocGFydC5pZCkgPT09IGZhbHNlKXtcbiAgICAgICAgaWYodGhpcy5zb25nLl9wYXJ0c0J5SWQuZ2V0KHBhcnQuaWQpID09PSBmYWxzZSl7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc2tpcHBpbmcgcmVtb3ZlZCBwYXJ0JywgcGFydC5pZCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmKHBhcnQuX2VuZFt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUgJiYgY29sbGVjdGVkUGFydHMuaGFzKHBhcnQpID09PSBmYWxzZSl7XG4gICAgICAgIGlmKHBhcnQuX2VuZFt0aGlzLnVuaXRdID4gdGhpcy5jdXJyZW50VmFsdWUpe1xuICAgICAgICAgIHN0aWxsQWN0aXZlUGFydHMucHVzaChub3RlKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgICAgICB0eXBlOiAncGFydE9mZicsXG4gICAgICAgICAgICBkYXRhOiBwYXJ0XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFjdGl2ZVBhcnRzID0gWy4uLmNvbGxlY3RlZFBhcnRzLnZhbHVlcygpLCAuLi5zdGlsbEFjdGl2ZVBhcnRzXVxuICAgICAgdGhpcy5kYXRhLmFjdGl2ZVBhcnRzID0gdGhpcy5hY3RpdmVQYXJ0c1xuICAgIH1cblxuICAgIGRpc3BhdGNoRXZlbnQoe1xuICAgICAgdHlwZTogJ3Bvc2l0aW9uJyxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YVxuICAgIH0pXG5cbiAgfVxuXG4vKlxuICBzZXRUeXBlKHQpe1xuICAgIHRoaXMudHlwZSA9IHQ7XG4gICAgdGhpcy5zZXQodGhpcy51bml0LCB0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgfVxuXG5cbiAgYWRkVHlwZSh0KXtcbiAgICB0aGlzLnR5cGUgKz0gJyAnICsgdDtcbiAgICB0aGlzLnNldCh0aGlzLnVuaXQsIHRoaXMuY3VycmVudFZhbHVlKTtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUsYWN0aXZlUGFydHMpO1xuICB9XG5cbiAgcmVtb3ZlVHlwZSh0KXtcbiAgICB2YXIgYXJyID0gdGhpcy50eXBlLnNwbGl0KCcgJyk7XG4gICAgdGhpcy50eXBlID0gJyc7XG4gICAgYXJyLmZvckVhY2goZnVuY3Rpb24odHlwZSl7XG4gICAgICBpZih0eXBlICE9PSB0KXtcbiAgICAgICAgdGhpcy50eXBlICs9IHQgKyAnICc7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy50eXBlLnRyaW0oKTtcbiAgICB0aGlzLnNldCh0aGlzLmN1cnJlbnRWYWx1ZSk7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlLGFjdGl2ZVBhcnRzKTtcbiAgfVxuKi9cblxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdFxuICBzdXBwb3J0ZWRUeXBlcyA9ICdiYXJzYW5kYmVhdHMgYmFyc2JlYXRzIHRpbWUgbWlsbGlzIHRpY2tzIHBlcmMgcGVyY2VudGFnZScsXG4gIHN1cHBvcnRlZFJldHVyblR5cGVzID0gJ2JhcnNhbmRiZWF0cyBiYXJzYmVhdHMgdGltZSBtaWxsaXMgdGlja3MgYWxsJyxcbiAgZmxvb3IgPSBNYXRoLmZsb29yLFxuICByb3VuZCA9IE1hdGgucm91bmQ7XG5cblxubGV0XG4gIC8vbG9jYWxcbiAgYnBtLFxuICBub21pbmF0b3IsXG4gIGRlbm9taW5hdG9yLFxuXG4gIHRpY2tzUGVyQmVhdCxcbiAgdGlja3NQZXJCYXIsXG4gIHRpY2tzUGVyU2l4dGVlbnRoLFxuXG4gIG1pbGxpc1BlclRpY2ssXG4gIHNlY29uZHNQZXJUaWNrLFxuICBudW1TaXh0ZWVudGgsXG5cbiAgdGlja3MsXG4gIG1pbGxpcyxcbiAgZGlmZlRpY2tzLFxuICBkaWZmTWlsbGlzLFxuXG4gIGJhcixcbiAgYmVhdCxcbiAgc2l4dGVlbnRoLFxuICB0aWNrLFxuXG4vLyAgdHlwZSxcbiAgaW5kZXgsXG4gIHJldHVyblR5cGUgPSAnYWxsJyxcbiAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcblxuXG5mdW5jdGlvbiBnZXRUaW1lRXZlbnQoc29uZywgdW5pdCwgdGFyZ2V0KXtcbiAgLy8gZmluZHMgdGhlIHRpbWUgZXZlbnQgdGhhdCBjb21lcyB0aGUgY2xvc2VzdCBiZWZvcmUgdGhlIHRhcmdldCBwb3NpdGlvblxuICBsZXQgdGltZUV2ZW50cyA9IHNvbmcuX3RpbWVFdmVudHNcblxuICBmb3IobGV0IGkgPSB0aW1lRXZlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKXtcbiAgICBsZXQgZXZlbnQgPSB0aW1lRXZlbnRzW2ldO1xuICAgIC8vY29uc29sZS5sb2codW5pdCwgdGFyZ2V0LCBldmVudClcbiAgICBpZihldmVudFt1bml0XSA8PSB0YXJnZXQpe1xuICAgICAgaW5kZXggPSBpXG4gICAgICByZXR1cm4gZXZlbnRcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9UaWNrcyhzb25nLCB0YXJnZXRNaWxsaXMsIGJlb3MgPSB0cnVlKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gYmVvc1xuICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldE1pbGxpcylcbiAgLy9yZXR1cm4gcm91bmQodGlja3MpO1xuICByZXR1cm4gdGlja3Ncbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdGlja3NUb01pbGxpcyhzb25nLCB0YXJnZXRUaWNrcywgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21UaWNrcyhzb25nLCB0YXJnZXRUaWNrcylcbiAgcmV0dXJuIG1pbGxpc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBiYXJzVG9NaWxsaXMoc29uZywgcG9zaXRpb24sIGJlb3MpeyAvLyBiZW9zID0gYmV5b25kRW5kT2ZTb25nXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHtcbiAgICB0eXBlOiAnYmFyc2JlYXQnLFxuICAgIHBvc2l0aW9uLFxuICAgIHJlc3VsdDogJ21pbGxpcycsXG4gICAgYmVvcyxcbiAgfSlcbiAgcmV0dXJuIG1pbGxpc1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBiYXJzVG9UaWNrcyhzb25nLCBwb3NpdGlvbiwgYmVvcyl7IC8vIGJlb3MgPSBiZXlvbmRFbmRPZlNvbmdcbiAgY2FsY3VsYXRlUG9zaXRpb24oc29uZywge1xuICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgIHBvc2l0aW9uLFxuICAgIHJlc3VsdDogJ3RpY2tzJyxcbiAgICBiZW9zXG4gIH0pXG4gIC8vcmV0dXJuIHJvdW5kKHRpY2tzKTtcbiAgcmV0dXJuIHRpY2tzXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tzVG9CYXJzKHNvbmcsIHRhcmdldCwgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21UaWNrcyhzb25nLCB0YXJnZXQpXG4gIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpXG4gIHJldHVyblR5cGUgPSAnYmFyc2FuZGJlYXRzJ1xuICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKClcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzVG9CYXJzKHNvbmcsIHRhcmdldCwgYmVvcyA9IHRydWUpe1xuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG4gIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0KVxuICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICByZXR1cm5UeXBlID0gJ2JhcnNhbmRiZWF0cydcbiAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YSgpXG59XG5cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgbWlsbGlzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldE1pbGxpcywgZXZlbnQpe1xuICBsZXQgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2Upe1xuICAgIGlmKHRhcmdldE1pbGxpcyA+IGxhc3RFdmVudC5taWxsaXMpe1xuICAgICAgdGFyZ2V0TWlsbGlzID0gbGFzdEV2ZW50Lm1pbGxpcztcbiAgICB9XG4gIH1cblxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnbWlsbGlzJywgdGFyZ2V0TWlsbGlzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IG1pbGxpcywgY2FsY3VsYXRlIHRoZSBkaWZmXG4gIGlmKGV2ZW50Lm1pbGxpcyA9PT0gdGFyZ2V0TWlsbGlzKXtcbiAgICBkaWZmTWlsbGlzID0gMDtcbiAgICBkaWZmVGlja3MgPSAwO1xuICB9ZWxzZXtcbiAgICBkaWZmTWlsbGlzID0gdGFyZ2V0TWlsbGlzIC0gZXZlbnQubWlsbGlzO1xuICAgIGRpZmZUaWNrcyA9IGRpZmZNaWxsaXMgLyBtaWxsaXNQZXJUaWNrO1xuICB9XG5cbiAgbWlsbGlzICs9IGRpZmZNaWxsaXM7XG4gIHRpY2tzICs9IGRpZmZUaWNrcztcblxuICByZXR1cm4gdGlja3M7XG59XG5cblxuLy8gbWFpbiBjYWxjdWxhdGlvbiBmdW5jdGlvbiBmb3IgdGlja3MgcG9zaXRpb25cbmZ1bmN0aW9uIGZyb21UaWNrcyhzb25nLCB0YXJnZXRUaWNrcywgZXZlbnQpe1xuICBsZXQgbGFzdEV2ZW50ID0gc29uZy5fbGFzdEV2ZW50O1xuXG4gIGlmKGJleW9uZEVuZE9mU29uZyA9PT0gZmFsc2Upe1xuICAgIGlmKHRhcmdldFRpY2tzID4gbGFzdEV2ZW50LnRpY2tzKXtcbiAgICAgIHRhcmdldFRpY2tzID0gbGFzdEV2ZW50LnRpY2tzO1xuICAgIH1cbiAgfVxuXG4gIGlmKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGV2ZW50ID0gZ2V0VGltZUV2ZW50KHNvbmcsICd0aWNrcycsIHRhcmdldFRpY2tzKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvLyBpZiB0aGUgZXZlbnQgaXMgbm90IGV4YWN0bHkgYXQgdGFyZ2V0IHRpY2tzLCBjYWxjdWxhdGUgdGhlIGRpZmZcbiAgaWYoZXZlbnQudGlja3MgPT09IHRhcmdldFRpY2tzKXtcbiAgICBkaWZmVGlja3MgPSAwO1xuICAgIGRpZmZNaWxsaXMgPSAwO1xuICB9ZWxzZXtcbiAgICBkaWZmVGlja3MgPSB0YXJnZXRUaWNrcyAtIHRpY2tzO1xuICAgIGRpZmZNaWxsaXMgPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuICB9XG5cbiAgdGlja3MgKz0gZGlmZlRpY2tzO1xuICBtaWxsaXMgKz0gZGlmZk1pbGxpcztcblxuICByZXR1cm4gbWlsbGlzO1xufVxuXG5cbi8vIG1haW4gY2FsY3VsYXRpb24gZnVuY3Rpb24gZm9yIGJhcnMgYW5kIGJlYXRzIHBvc2l0aW9uXG5mdW5jdGlvbiBmcm9tQmFycyhzb25nLCB0YXJnZXRCYXIsIHRhcmdldEJlYXQsIHRhcmdldFNpeHRlZW50aCwgdGFyZ2V0VGljaywgZXZlbnQgPSBudWxsKXtcbiAgLy9jb25zb2xlLnRpbWUoJ2Zyb21CYXJzJyk7XG4gIGxldCBpID0gMCxcbiAgICBkaWZmQmFycyxcbiAgICBkaWZmQmVhdHMsXG4gICAgZGlmZlNpeHRlZW50aCxcbiAgICBkaWZmVGljayxcbiAgICBsYXN0RXZlbnQgPSBzb25nLl9sYXN0RXZlbnQ7XG5cbiAgaWYoYmV5b25kRW5kT2ZTb25nID09PSBmYWxzZSl7XG4gICAgaWYodGFyZ2V0QmFyID4gbGFzdEV2ZW50LmJhcil7XG4gICAgICB0YXJnZXRCYXIgPSBsYXN0RXZlbnQuYmFyO1xuICAgIH1cbiAgfVxuXG4gIGlmKGV2ZW50ID09PSBudWxsKXtcbiAgICBldmVudCA9IGdldFRpbWVFdmVudChzb25nLCAnYmFyJywgdGFyZ2V0QmFyKTtcbiAgfVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuICBnZXREYXRhRnJvbUV2ZW50KGV2ZW50KTtcblxuICAvL2NvcnJlY3Qgd3JvbmcgcG9zaXRpb24gZGF0YSwgZm9yIGluc3RhbmNlOiAnMywzLDIsNzg4JyBiZWNvbWVzICczLDQsNCwwNjgnIGluIGEgNC80IG1lYXN1cmUgYXQgUFBRIDQ4MFxuICB3aGlsZSh0YXJnZXRUaWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICB0YXJnZXRTaXh0ZWVudGgrKztcbiAgICB0YXJnZXRUaWNrIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICB9XG5cbiAgd2hpbGUodGFyZ2V0U2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKXtcbiAgICB0YXJnZXRCZWF0Kys7XG4gICAgdGFyZ2V0U2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgfVxuXG4gIHdoaWxlKHRhcmdldEJlYXQgPiBub21pbmF0b3Ipe1xuICAgIHRhcmdldEJhcisrO1xuICAgIHRhcmdldEJlYXQgLT0gbm9taW5hdG9yO1xuICB9XG5cbiAgZXZlbnQgPSBnZXRUaW1lRXZlbnQoc29uZywgJ2JhcicsIHRhcmdldEJhciwgaW5kZXgpO1xuICBmb3IoaSA9IGluZGV4OyBpID49IDA7IGktLSl7XG4gICAgZXZlbnQgPSBzb25nLl90aW1lRXZlbnRzW2ldO1xuICAgIGlmKGV2ZW50LmJhciA8PSB0YXJnZXRCYXIpe1xuICAgICAgZ2V0RGF0YUZyb21FdmVudChldmVudCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBnZXQgdGhlIGRpZmZlcmVuY2VzXG4gIGRpZmZUaWNrID0gdGFyZ2V0VGljayAtIHRpY2s7XG4gIGRpZmZTaXh0ZWVudGggPSB0YXJnZXRTaXh0ZWVudGggLSBzaXh0ZWVudGg7XG4gIGRpZmZCZWF0cyA9IHRhcmdldEJlYXQgLSBiZWF0O1xuICBkaWZmQmFycyA9IHRhcmdldEJhciAtIGJhcjsgLy9iYXIgaXMgYWx3YXlzIGxlc3MgdGhlbiBvciBlcXVhbCB0byB0YXJnZXRCYXIsIHNvIGRpZmZCYXJzIGlzIGFsd2F5cyA+PSAwXG5cbiAgLy9jb25zb2xlLmxvZygnZGlmZicsZGlmZkJhcnMsZGlmZkJlYXRzLGRpZmZTaXh0ZWVudGgsZGlmZlRpY2spO1xuICAvL2NvbnNvbGUubG9nKCdtaWxsaXMnLG1pbGxpcyx0aWNrc1BlckJhcix0aWNrc1BlckJlYXQsdGlja3NQZXJTaXh0ZWVudGgsbWlsbGlzUGVyVGljayk7XG5cbiAgLy8gY29udmVydCBkaWZmZXJlbmNlcyB0byBtaWxsaXNlY29uZHMgYW5kIHRpY2tzXG4gIGRpZmZNaWxsaXMgPSAoZGlmZkJhcnMgKiB0aWNrc1BlckJhcikgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmTWlsbGlzICs9IChkaWZmQmVhdHMgKiB0aWNrc1BlckJlYXQpICogbWlsbGlzUGVyVGljaztcbiAgZGlmZk1pbGxpcyArPSAoZGlmZlNpeHRlZW50aCAqIHRpY2tzUGVyU2l4dGVlbnRoKSAqIG1pbGxpc1BlclRpY2s7XG4gIGRpZmZNaWxsaXMgKz0gZGlmZlRpY2sgKiBtaWxsaXNQZXJUaWNrO1xuICBkaWZmVGlja3MgPSBkaWZmTWlsbGlzIC8gbWlsbGlzUGVyVGljaztcbiAgLy9jb25zb2xlLmxvZyhkaWZmQmFycywgdGlja3NQZXJCYXIsIG1pbGxpc1BlclRpY2ssIGRpZmZNaWxsaXMsIGRpZmZUaWNrcyk7XG5cbiAgLy8gc2V0IGFsbCBjdXJyZW50IHBvc2l0aW9uIGRhdGFcbiAgYmFyID0gdGFyZ2V0QmFyO1xuICBiZWF0ID0gdGFyZ2V0QmVhdDtcbiAgc2l4dGVlbnRoID0gdGFyZ2V0U2l4dGVlbnRoO1xuICB0aWNrID0gdGFyZ2V0VGljaztcbiAgLy9jb25zb2xlLmxvZyh0aWNrLCB0YXJnZXRUaWNrKVxuXG4gIG1pbGxpcyArPSBkaWZmTWlsbGlzO1xuICAvL2NvbnNvbGUubG9nKHRhcmdldEJhciwgdGFyZ2V0QmVhdCwgdGFyZ2V0U2l4dGVlbnRoLCB0YXJnZXRUaWNrLCAnIC0+ICcsIG1pbGxpcyk7XG4gIHRpY2tzICs9IGRpZmZUaWNrcztcblxuICAvL2NvbnNvbGUudGltZUVuZCgnZnJvbUJhcnMnKTtcbn1cblxuXG5mdW5jdGlvbiBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKXtcbiAgLy8gc3ByZWFkIHRoZSBkaWZmZXJlbmNlIGluIHRpY2sgb3ZlciBiYXJzLCBiZWF0cyBhbmQgc2l4dGVlbnRoXG4gIGxldCB0bXAgPSByb3VuZChkaWZmVGlja3MpO1xuICB3aGlsZSh0bXAgPj0gdGlja3NQZXJTaXh0ZWVudGgpe1xuICAgIHNpeHRlZW50aCsrO1xuICAgIHRtcCAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgIGJlYXQrKztcbiAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgYmFyKys7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHRpY2sgPSByb3VuZCh0bXApO1xufVxuXG5cbi8vIHN0b3JlIHByb3BlcnRpZXMgb2YgZXZlbnQgaW4gbG9jYWwgc2NvcGVcbmZ1bmN0aW9uIGdldERhdGFGcm9tRXZlbnQoZXZlbnQpe1xuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcbiAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBiYXIgPSBldmVudC5iYXI7XG4gIGJlYXQgPSBldmVudC5iZWF0O1xuICBzaXh0ZWVudGggPSBldmVudC5zaXh0ZWVudGg7XG4gIHRpY2sgPSBldmVudC50aWNrO1xuXG4gIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAvL2NvbnNvbGUubG9nKGJwbSwgZXZlbnQudHlwZSk7XG4gIC8vY29uc29sZS5sb2coJ3RpY2tzJywgdGlja3MsICdtaWxsaXMnLCBtaWxsaXMsICdiYXInLCBiYXIpO1xufVxuXG5cbmZ1bmN0aW9uIGdldFBvc2l0aW9uRGF0YShzb25nKXtcbiAgbGV0IHRpbWVEYXRhLFxuICAgIHBvc2l0aW9uRGF0YSA9IHt9O1xuXG4gIHN3aXRjaChyZXR1cm5UeXBlKXtcblxuICAgIGNhc2UgJ21pbGxpcyc6XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5taWxsaXMgPSBtaWxsaXM7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzID0gcm91bmQobWlsbGlzICogMTAwMCkgLyAxMDAwO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbGxpc1JvdW5kZWQgPSByb3VuZChtaWxsaXMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICd0aWNrcyc6XG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrcyA9IHRpY2tzO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzID0gcm91bmQodGlja3MpO1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3NVbnJvdW5kZWQgPSB0aWNrcztcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgcG9zaXRpb25EYXRhLmJhciA9IGJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5iZWF0ID0gYmVhdDtcbiAgICAgIHBvc2l0aW9uRGF0YS5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gICAgICBwb3NpdGlvbkRhdGEudGljayA9IHRpY2s7XG4gICAgICAvL3Bvc2l0aW9uRGF0YS5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGlja0FzU3RyaW5nO1xuICAgICAgcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyBnZXRUaWNrQXNTdHJpbmcodGljayk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuICAgICAgcG9zaXRpb25EYXRhLmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2FsbCc6XG4gICAgICAvLyBtaWxsaXNcbiAgICAgIC8vcG9zaXRpb25EYXRhLm1pbGxpcyA9IG1pbGxpcztcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXMgPSByb3VuZChtaWxsaXMgKiAxMDAwKSAvIDEwMDA7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzUm91bmRlZCA9IHJvdW5kKG1pbGxpcyk7XG5cbiAgICAgIC8vIHRpY2tzXG4gICAgICAvL3Bvc2l0aW9uRGF0YS50aWNrcyA9IHRpY2tzO1xuICAgICAgcG9zaXRpb25EYXRhLnRpY2tzID0gcm91bmQodGlja3MpO1xuICAgICAgLy9wb3NpdGlvbkRhdGEudGlja3NVbnJvdW5kZWQgPSB0aWNrcztcblxuICAgICAgLy8gYmFyc2JlYXRzXG4gICAgICBwb3NpdGlvbkRhdGEuYmFyID0gYmFyO1xuICAgICAgcG9zaXRpb25EYXRhLmJlYXQgPSBiZWF0O1xuICAgICAgcG9zaXRpb25EYXRhLnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrID0gdGljaztcbiAgICAgIC8vcG9zaXRpb25EYXRhLmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gICAgICBwb3NpdGlvbkRhdGEuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIGdldFRpY2tBc1N0cmluZyh0aWNrKTtcblxuICAgICAgLy8gdGltZVxuICAgICAgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuICAgICAgcG9zaXRpb25EYXRhLmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICAgICAgcG9zaXRpb25EYXRhLm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gICAgICBwb3NpdGlvbkRhdGEubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgICAgIHBvc2l0aW9uRGF0YS50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG5cbiAgICAgIC8vIGV4dHJhIGRhdGFcbiAgICAgIHBvc2l0aW9uRGF0YS5icG0gPSByb3VuZChicG0gKiBzb25nLnBsYXliYWNrU3BlZWQsIDMpO1xuICAgICAgcG9zaXRpb25EYXRhLm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgICAgIHBvc2l0aW9uRGF0YS5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuXG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgICAgIHBvc2l0aW9uRGF0YS50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gICAgICBwb3NpdGlvbkRhdGEudGlja3NQZXJTaXh0ZWVudGggPSB0aWNrc1BlclNpeHRlZW50aDtcblxuICAgICAgcG9zaXRpb25EYXRhLm51bVNpeHRlZW50aCA9IG51bVNpeHRlZW50aDtcbiAgICAgIHBvc2l0aW9uRGF0YS5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcbiAgICAgIHBvc2l0aW9uRGF0YS5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuXG4gICAgICAvLyB1c2UgdGlja3MgdG8gbWFrZSB0ZW1wbyBjaGFuZ2VzIHZpc2libGUgYnkgYSBmYXN0ZXIgbW92aW5nIHBsYXloZWFkXG4gICAgICBwb3NpdGlvbkRhdGEucGVyY2VudGFnZSA9IHRpY2tzIC8gc29uZy5fZHVyYXRpb25UaWNrcztcbiAgICAgIC8vcG9zaXRpb25EYXRhLnBlcmNlbnRhZ2UgPSBtaWxsaXMgLyBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsXG4gIH1cblxuICByZXR1cm4gcG9zaXRpb25EYXRhXG59XG5cblxuZnVuY3Rpb24gZ2V0VGlja0FzU3RyaW5nKHQpe1xuICBpZih0ID09PSAwKXtcbiAgICB0ID0gJzAwMCdcbiAgfWVsc2UgaWYodCA8IDEwKXtcbiAgICB0ID0gJzAwJyArIHRcbiAgfWVsc2UgaWYodCA8IDEwMCl7XG4gICAgdCA9ICcwJyArIHRcbiAgfVxuICByZXR1cm4gdFxufVxuXG5cbi8vIHVzZWQgYnkgcGxheWhlYWRcbmV4cG9ydCBmdW5jdGlvbiBnZXRQb3NpdGlvbjIoc29uZywgdW5pdCwgdGFyZ2V0LCB0eXBlLCBldmVudCl7XG4gIGlmKHVuaXQgPT09ICdtaWxsaXMnKXtcbiAgICBmcm9tTWlsbGlzKHNvbmcsIHRhcmdldCwgZXZlbnQpO1xuICB9ZWxzZSBpZih1bml0ID09PSAndGlja3MnKXtcbiAgICBmcm9tVGlja3Moc29uZywgdGFyZ2V0LCBldmVudCk7XG4gIH1cbiAgcmV0dXJuVHlwZSA9IHR5cGVcbiAgaWYocmV0dXJuVHlwZSA9PT0gJ2FsbCcpe1xuICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICB9XG4gIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG59XG5cblxuLy8gaW1wcm92ZWQgdmVyc2lvbiBvZiBnZXRQb3NpdGlvblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uKHNvbmcsIHNldHRpbmdzKXtcbiAgbGV0IHtcbiAgICB0eXBlLCAvLyBhbnkgb2YgYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBwZXJjIHBlcmNlbnRhZ2VcbiAgICB0YXJnZXQsIC8vIGlmIHR5cGUgaXMgYmFyc2JlYXRzIG9yIHRpbWUsIHRhcmdldCBtdXN0IGJlIGFuIGFycmF5LCBlbHNlIGlmIG11c3QgYmUgYSBudW1iZXJcbiAgICByZXN1bHQ6IHJlc3VsdCA9ICdhbGwnLCAvLyBhbnkgb2YgYmFyc2FuZGJlYXRzIGJhcnNiZWF0cyB0aW1lIG1pbGxpcyB0aWNrcyBhbGxcbiAgICBiZW9zOiBiZW9zID0gdHJ1ZSxcbiAgICBzbmFwOiBzbmFwID0gLTFcbiAgfSA9IHNldHRpbmdzXG5cbiAgaWYoc3VwcG9ydGVkUmV0dXJuVHlwZXMuaW5kZXhPZihyZXN1bHQpID09PSAtMSl7XG4gICAgY29uc29sZS53YXJuKGB1bnN1cHBvcnRlZCByZXR1cm4gdHlwZSwgJ2FsbCcgdXNlZCBpbnN0ZWFkIG9mICcke3Jlc3VsdH0nYClcbiAgICByZXN1bHQgPSAnYWxsJ1xuICB9XG5cbiAgcmV0dXJuVHlwZSA9IHJlc3VsdFxuICBiZXlvbmRFbmRPZlNvbmcgPSBiZW9zXG5cbiAgaWYoc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSA9PT0gLTEpe1xuICAgIGNvbnNvbGUuZXJyb3IoYHVuc3VwcG9ydGVkIHR5cGUgJHt0eXBlfWApXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuXG4gIHN3aXRjaCh0eXBlKXtcblxuICAgIGNhc2UgJ2JhcnNiZWF0cyc6XG4gICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgIGxldCBbdGFyZ2V0YmFyID0gMSwgdGFyZ2V0YmVhdCA9IDEsIHRhcmdldHNpeHRlZW50aCA9IDEsIHRhcmdldHRpY2sgPSAwXSA9IHRhcmdldFxuICAgICAgLy9jb25zb2xlLmxvZyh0YXJnZXRiYXIsIHRhcmdldGJlYXQsIHRhcmdldHNpeHRlZW50aCwgdGFyZ2V0dGljaylcbiAgICAgIGZyb21CYXJzKHNvbmcsIHRhcmdldGJhciwgdGFyZ2V0YmVhdCwgdGFyZ2V0c2l4dGVlbnRoLCB0YXJnZXR0aWNrKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAndGltZSc6XG4gICAgICAvLyBjYWxjdWxhdGUgbWlsbGlzIG91dCBvZiB0aW1lIGFycmF5OiBob3VycywgbWludXRlcywgc2Vjb25kcywgbWlsbGlzXG4gICAgICBsZXQgW3RhcmdldGhvdXIgPSAwLCB0YXJnZXRtaW51dGUgPSAwLCB0YXJnZXRzZWNvbmQgPSAwLCB0YXJnZXRtaWxsaXNlY29uZCA9IDBdID0gdGFyZ2V0XG4gICAgICBsZXQgbWlsbGlzID0gMFxuICAgICAgbWlsbGlzICs9IHRhcmdldGhvdXIgKiA2MCAqIDYwICogMTAwMCAvL2hvdXJzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0bWludXRlICogNjAgKiAxMDAwIC8vbWludXRlc1xuICAgICAgbWlsbGlzICs9IHRhcmdldHNlY29uZCAqIDEwMDAgLy9zZWNvbmRzXG4gICAgICBtaWxsaXMgKz0gdGFyZ2V0bWlsbGlzZWNvbmQgLy9taWxsaXNlY29uZHNcblxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGZyb21NaWxsaXMoc29uZywgdGFyZ2V0KVxuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKClcbiAgICAgIHJldHVybiBnZXRQb3NpdGlvbkRhdGEoc29uZylcblxuICAgIGNhc2UgJ3RpY2tzJzpcbiAgICAgIGZyb21UaWNrcyhzb25nLCB0YXJnZXQpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKVxuXG4gICAgY2FzZSAncGVyYyc6XG4gICAgY2FzZSAncGVyY2VudGFnZSc6XG5cbiAgICAgIC8vbWlsbGlzID0gcG9zaXRpb25bMV0gKiBzb25nLmR1cmF0aW9uTWlsbGlzO1xuICAgICAgLy9mcm9tTWlsbGlzKHNvbmcsIG1pbGxpcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pbGxpcyk7XG5cbiAgICAgIHRpY2tzID0gdGFyZ2V0ICogc29uZy5fZHVyYXRpb25UaWNrcyAvLyB0YXJnZXQgbXVzdCBiZSBpbiB0aWNrcyFcbiAgICAgIC8vY29uc29sZS5sb2codGlja3MsIHNvbmcuX2R1cmF0aW9uVGlja3MpXG4gICAgICBpZihzbmFwICE9PSAtMSl7XG4gICAgICAgIHRpY2tzID0gZmxvb3IodGlja3MgLyBzbmFwKSAqIHNuYXA7XG4gICAgICAgIC8vZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcyk7XG4gICAgICB9XG4gICAgICBmcm9tVGlja3Moc29uZywgdGlja3MpXG4gICAgICBjYWxjdWxhdGVCYXJzQW5kQmVhdHMoKVxuICAgICAgbGV0IHRtcCA9IGdldFBvc2l0aW9uRGF0YShzb25nKVxuICAgICAgLy9jb25zb2xlLmxvZygnZGlmZicsIHBvc2l0aW9uWzFdIC0gdG1wLnBlcmNlbnRhZ2UpO1xuICAgICAgcmV0dXJuIHRtcFxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbi8qXG5cbi8vQHBhcmFtOiAnbWlsbGlzJywgMTAwMCwgW3RydWVdXG4vL0BwYXJhbTogJ3RpY2tzJywgMTAwMCwgW3RydWVdXG4vL0BwYXJhbTogJ2JhcnNhbmRiZWF0cycsIDEsIFsnYWxsJywgdHJ1ZV1cbi8vQHBhcmFtOiAnYmFyc2FuZGJlYXRzJywgNjAsIDQsIDMsIDEyMCwgWydhbGwnLCB0cnVlXVxuLy9AcGFyYW06ICdiYXJzYW5kYmVhdHMnLCA2MCwgNCwgMywgMTIwLCBbdHJ1ZSwgJ2FsbCddXG5cbmZ1bmN0aW9uIGNoZWNrUG9zaXRpb24odHlwZSwgYXJncywgcmV0dXJuVHlwZSA9ICdhbGwnKXtcbiAgYmV5b25kRW5kT2ZTb25nID0gdHJ1ZTtcbiAgY29uc29sZS5sb2coJy0tLS0+IGNoZWNrUG9zaXRpb246JywgYXJncywgdHlwZVN0cmluZyhhcmdzKSk7XG5cbiAgaWYodHlwZVN0cmluZyhhcmdzKSA9PT0gJ2FycmF5Jyl7XG4gICAgbGV0XG4gICAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIGksIGEsIHBvc2l0aW9uTGVuZ3RoO1xuXG4gICAgdHlwZSA9IGFyZ3NbMF07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBbWydtaWxsaXMnLCAzMDAwXV1cbiAgICBpZih0eXBlU3RyaW5nKGFyZ3NbMF0pID09PSAnYXJyYXknKXtcbiAgICAgIC8vY29uc29sZS53YXJuKCd0aGlzIHNob3VsZG5cXCd0IGhhcHBlbiEnKTtcbiAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgdHlwZSA9IGFyZ3NbMF07XG4gICAgICBudW1BcmdzID0gYXJncy5sZW5ndGg7XG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBbdHlwZV07XG5cbiAgICBjb25zb2xlLmxvZygnY2hlY2sgcG9zaXRpb24nLCBhcmdzLCBudW1BcmdzLCBzdXBwb3J0ZWRUeXBlcy5pbmRleE9mKHR5cGUpKTtcblxuICAgIC8vY29uc29sZS5sb2coJ2FyZycsIDAsICctPicsIHR5cGUpO1xuXG4gICAgaWYoc3VwcG9ydGVkVHlwZXMuaW5kZXhPZih0eXBlKSAhPT0gLTEpe1xuICAgICAgZm9yKGkgPSAxOyBpIDwgbnVtQXJnczsgaSsrKXtcbiAgICAgICAgYSA9IGFyZ3NbaV07XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2FyZycsIGksICctPicsIGEpO1xuICAgICAgICBpZihhID09PSB0cnVlIHx8IGEgPT09IGZhbHNlKXtcbiAgICAgICAgICBiZXlvbmRFbmRPZlNvbmcgPSBhO1xuICAgICAgICB9ZWxzZSBpZihpc05hTihhKSl7XG4gICAgICAgICAgaWYoc3VwcG9ydGVkUmV0dXJuVHlwZXMuaW5kZXhPZihhKSAhPT0gLTEpe1xuICAgICAgICAgICAgcmV0dXJuVHlwZSA9IGE7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgcG9zaXRpb24ucHVzaChhKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9jaGVjayBudW1iZXIgb2YgYXJndW1lbnRzIC0+IGVpdGhlciAxIG51bWJlciBvciA0IG51bWJlcnMgaW4gcG9zaXRpb24sIGUuZy4gWydiYXJzYmVhdHMnLCAxXSBvciBbJ2JhcnNiZWF0cycsIDEsIDEsIDEsIDBdLFxuICAgICAgLy8gb3IgWydwZXJjJywgMC41NiwgbnVtYmVyT2ZUaWNrc1RvU25hcFRvXVxuICAgICAgcG9zaXRpb25MZW5ndGggPSBwb3NpdGlvbi5sZW5ndGg7XG4gICAgICBpZihwb3NpdGlvbkxlbmd0aCAhPT0gMiAmJiBwb3NpdGlvbkxlbmd0aCAhPT0gMyAmJiBwb3NpdGlvbkxlbmd0aCAhPT0gNSl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2cocG9zaXRpb24sIHJldHVyblR5cGUsIGJleW9uZEVuZE9mU29uZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvc2l0aW9uKHNvbmcsIHR5cGUsIGFyZ3Mpe1xuICAvL2NvbnNvbGUubG9nKCdnZXRQb3NpdGlvbicsIGFyZ3MpO1xuXG4gIGlmKHR5cGVvZiBhcmdzID09PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1pbGxpczogMFxuICAgIH1cbiAgfVxuXG4gIGxldCBwb3NpdGlvbiA9IGNoZWNrUG9zaXRpb24odHlwZSwgYXJncyksXG4gICAgbWlsbGlzLCB0bXAsIHNuYXA7XG5cblxuICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgIGVycm9yKCd3cm9uZyBwb3NpdGlvbiBkYXRhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3dpdGNoKHR5cGUpe1xuXG4gICAgY2FzZSAnYmFyc2JlYXRzJzpcbiAgICBjYXNlICdiYXJzYW5kYmVhdHMnOlxuICAgICAgZnJvbUJhcnMoc29uZywgcG9zaXRpb25bMV0sIHBvc2l0aW9uWzJdLCBwb3NpdGlvblszXSwgcG9zaXRpb25bNF0pO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgLy8gY2FsY3VsYXRlIG1pbGxpcyBvdXQgb2YgdGltZSBhcnJheTogaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIG1pbGxpc1xuICAgICAgbWlsbGlzID0gMDtcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzFdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogNjAgKiA2MCAqIDEwMDA7IC8vaG91cnNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzJdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogNjAgKiAxMDAwOyAvL21pbnV0ZXNcbiAgICAgIHRtcCA9IHBvc2l0aW9uWzNdIHx8IDA7XG4gICAgICBtaWxsaXMgKz0gdG1wICogMTAwMDsgLy9zZWNvbmRzXG4gICAgICB0bXAgPSBwb3NpdGlvbls0XSB8fCAwO1xuICAgICAgbWlsbGlzICs9IHRtcDsgLy9taWxsaXNlY29uZHNcblxuICAgICAgZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGZyb21NaWxsaXMoc29uZywgcG9zaXRpb25bMV0pO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICByZXR1cm4gZ2V0UG9zaXRpb25EYXRhKHNvbmcpO1xuXG4gICAgY2FzZSAndGlja3MnOlxuICAgICAgZnJvbVRpY2tzKHNvbmcsIHBvc2l0aW9uWzFdKTtcbiAgICAgIGNhbGN1bGF0ZUJhcnNBbmRCZWF0cygpO1xuICAgICAgcmV0dXJuIGdldFBvc2l0aW9uRGF0YShzb25nKTtcblxuICAgIGNhc2UgJ3BlcmMnOlxuICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgc25hcCA9IHBvc2l0aW9uWzJdO1xuXG4gICAgICAvL21pbGxpcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvbk1pbGxpcztcbiAgICAgIC8vZnJvbU1pbGxpcyhzb25nLCBtaWxsaXMpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuXG4gICAgICB0aWNrcyA9IHBvc2l0aW9uWzFdICogc29uZy5kdXJhdGlvblRpY2tzO1xuICAgICAgaWYoc25hcCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdGlja3MgPSBmbG9vcih0aWNrcy9zbmFwKSAqIHNuYXA7XG4gICAgICAgIC8vZnJvbVRpY2tzKHNvbmcsIHRpY2tzKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aWNrcyk7XG4gICAgICB9XG4gICAgICBmcm9tVGlja3Moc29uZywgdGlja3MpO1xuICAgICAgY2FsY3VsYXRlQmFyc0FuZEJlYXRzKCk7XG4gICAgICB0bXAgPSBnZXRQb3NpdGlvbkRhdGEoc29uZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdkaWZmJywgcG9zaXRpb25bMV0gLSB0bXAucGVyY2VudGFnZSk7XG4gICAgICByZXR1cm4gdG1wO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuKi9cblxuIiwiaW1wb3J0IHtcbiAgTUlESUV2ZW50XG59IGZyb20gJy4vbWlkaV9ldmVudCdcblxuaW1wb3J0e1xuICBNSURJTm90ZSxcbn0gZnJvbSAnLi9taWRpX25vdGUnXG5cbmltcG9ydHtcbiAgUGFydCxcbn0gZnJvbSAnLi9wYXJ0J1xuXG5pbXBvcnR7XG4gIFRyYWNrLFxufSBmcm9tICcuL3RyYWNrJ1xuXG5pbXBvcnQge1xuICBTb25nLFxufSBmcm9tICcuL3NvbmcnXG5cbmltcG9ydCB7XG4gIEluc3RydW1lbnQsXG59IGZyb20gJy4vaW5zdHJ1bWVudCdcblxuaW1wb3J0IHtcbiAgcGFyc2VNSURJRmlsZVxufSBmcm9tICcuL21pZGlmaWxlJ1xuXG5pbXBvcnQge1xuICBpbml0LFxufSBmcm9tICcuL2luaXQnXG5cbmltcG9ydCB7XG4gIGNvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgc2V0TWFzdGVyVm9sdW1lLFxufSBmcm9tICcuL2luaXRfYXVkaW8nXG5cbmltcG9ydCB7XG4gIGdldE1JRElBY2Nlc3MsXG4gIGdldE1JRElJbnB1dHMsXG4gIGdldE1JRElPdXRwdXRzLFxuICBnZXRNSURJSW5wdXRJZHMsXG4gIGdldE1JRElPdXRwdXRJZHMsXG4gIGdldE1JRElJbnB1dHNCeUlkLFxuICBnZXRNSURJT3V0cHV0c0J5SWQsXG59IGZyb20gJy4vaW5pdF9taWRpJ1xuXG5pbXBvcnQge1xuICBwYXJzZVNhbXBsZXMsXG59IGZyb20gJy4vcGFyc2VfYXVkaW8nXG5cbmltcG9ydCB7XG4gIE1JRElFdmVudFR5cGVzLFxufSBmcm9tICcuL2NvbnN0YW50cydcblxuaW1wb3J0IHtcbiAgc2V0QnVmZmVyVGltZSxcbiAgZ2V0SW5zdHJ1bWVudHMsXG4gIGdldEdNSW5zdHJ1bWVudHMsXG59IGZyb20gJy4vc2V0dGluZ3MnXG5cbmltcG9ydCB7XG4gIGFkZEV2ZW50TGlzdGVuZXIsXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIsXG4gIGRpc3BhdGNoRXZlbnRcbn0gZnJvbSAnLi9ldmVudGxpc3RlbmVyJ1xuXG5cbmNvbnN0IGdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBjb250ZXh0XG59XG5cbmNvbnN0IHFhbWJpID0ge1xuICB2ZXJzaW9uOiAnMS4wLjAtYmV0YTE1JyxcblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9zZXR0aW5nc1xuICBzZXRCdWZmZXJUaW1lLFxuXG4gIC8vIGZyb20gLi9jb25zdGFudHNcbiAgTUlESUV2ZW50VHlwZXMsXG5cbiAgLy8gZnJvbSAuL3V0aWxcbiAgcGFyc2VTYW1wbGVzLFxuXG4gIC8vIGZyb20gLi9taWRpZmlsZVxuICBwYXJzZU1JRElGaWxlLFxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG5cbiAgLy8gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICBnZXRJbnN0cnVtZW50cyxcbiAgZ2V0R01JbnN0cnVtZW50cyxcblxuICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKXtcbiAgICByZXR1cm4gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaylcbiAgfSxcblxuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKVxuICB9LFxuXG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIE1JRElFdmVudCxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIE1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIFNvbmcsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIFRyYWNrLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIFBhcnQsXG5cbiAgLy8gZnJvbSAuL2luc3RydW1lbnRcbiAgSW5zdHJ1bWVudCxcblxuICBsb2coaWQpe1xuICAgIHN3aXRjaChpZCl7XG4gICAgICBjYXNlICdmdW5jdGlvbnMnOlxuICAgICAgICBjb25zb2xlLmxvZyhgZnVuY3Rpb25zOlxuICAgICAgICAgIGdldEF1ZGlvQ29udGV4dFxuICAgICAgICAgIGdldE1hc3RlclZvbHVtZVxuICAgICAgICAgIHNldE1hc3RlclZvbHVtZVxuICAgICAgICAgIGdldE1JRElBY2Nlc3NcbiAgICAgICAgICBnZXRNSURJSW5wdXRzXG4gICAgICAgICAgZ2V0TUlESU91dHB1dHNcbiAgICAgICAgICBnZXRNSURJSW5wdXRJZHNcbiAgICAgICAgICBnZXRNSURJT3V0cHV0SWRzXG4gICAgICAgICAgZ2V0TUlESUlucHV0c0J5SWRcbiAgICAgICAgICBnZXRNSURJT3V0cHV0c0J5SWRcbiAgICAgICAgICBwYXJzZU1JRElGaWxlXG4gICAgICAgICAgc2V0QnVmZmVyVGltZVxuICAgICAgICAgIGdldEluc3RydW1lbnRzXG4gICAgICAgICAgZ2V0R01JbnN0cnVtZW50c1xuICAgICAgICBgKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IHFhbWJpXG5cbmV4cG9ydCB7XG4gIC8vIGZyb20gLi9pbml0XG4gIGluaXQsXG5cbiAgLy8gZnJvbSAuL3NldHRpbmdzXG4gIHNldEJ1ZmZlclRpbWUsXG4gIGdldEluc3RydW1lbnRzLFxuICBnZXRHTUluc3RydW1lbnRzLFxuXG4gIC8vIGZyb20gLi9jb25zdGFudHNcbiAgTUlESUV2ZW50VHlwZXMsXG5cbiAgLy8gZnJvbSAuL3V0aWxcbiAgcGFyc2VTYW1wbGVzLFxuXG4gIC8vIGZyb20gLi9taWRpZmlsZVxuICBwYXJzZU1JRElGaWxlLFxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG5cbiAgLy8gZnJvbSAuL2luaXRfbWlkaVxuICBnZXRNSURJQWNjZXNzLFxuICBnZXRNSURJSW5wdXRzLFxuICBnZXRNSURJT3V0cHV0cyxcbiAgZ2V0TUlESUlucHV0SWRzLFxuICBnZXRNSURJT3V0cHV0SWRzLFxuICBnZXRNSURJSW5wdXRzQnlJZCxcbiAgZ2V0TUlESU91dHB1dHNCeUlkLFxuXG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIE1JRElFdmVudCxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIE1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIFNvbmcsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIFRyYWNrLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIFBhcnQsXG5cbiAgLy8gZnJvbSAuL2luc3RydW1lbnRcbiAgSW5zdHJ1bWVudCxcbn1cbiIsImltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvLmpzJ1xuaW1wb3J0IHtnZXRFcXVhbFBvd2VyQ3VydmV9IGZyb20gJy4vdXRpbC5qcydcblxuXG5jbGFzcyBTYW1wbGV7XG5cbiAgY29uc3RydWN0b3Ioc2FtcGxlRGF0YSwgZXZlbnQpe1xuICAgIHRoaXMuZXZlbnQgPSBldmVudFxuICAgIHRoaXMuc2FtcGxlRGF0YSA9IHNhbXBsZURhdGFcblxuICAgIGlmKHRoaXMuc2FtcGxlRGF0YSA9PT0gLTEgfHwgdHlwZW9mIHRoaXMuc2FtcGxlRGF0YS5idWZmZXIgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIC8vIGNyZWF0ZSBzaW1wbGUgc3ludGggc2FtcGxlXG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRhdGExLCBldmVudC5kYXRhMilcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICB0aGlzLnNvdXJjZS50eXBlID0gJ3NpbmUnO1xuICAgICAgdGhpcy5zb3VyY2UuZnJlcXVlbmN5LnZhbHVlID0gZXZlbnQuZnJlcXVlbmN5XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgIC8vY29uc29sZS5sb2coc2FtcGxlRGF0YSlcbiAgICAgIHRoaXMuc291cmNlLmJ1ZmZlciA9IHNhbXBsZURhdGEuYnVmZmVyO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvdXJjZS5idWZmZXIpXG4gICAgfVxuICAgIHRoaXMub3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgICB0aGlzLnZvbHVtZSA9IGV2ZW50LmRhdGEyIC8gMTI3XG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IHRoaXMudm9sdW1lXG4gICAgdGhpcy5zb3VyY2UuY29ubmVjdCh0aGlzLm91dHB1dClcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgfVxuXG4gIHN0YXJ0KHRpbWUpe1xuICAgIGxldCB7c3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kLCByZWxlYXNlRW52ZWxvcGVBcnJheX0gPSB0aGlzLnNhbXBsZURhdGFcbiAgICAvL2NvbnNvbGUubG9nKHN1c3RhaW5TdGFydCwgc3VzdGFpbkVuZClcbiAgICBpZihzdXN0YWluU3RhcnQgJiYgc3VzdGFpbkVuZCl7XG4gICAgICB0aGlzLnNvdXJjZS5sb29wID0gdHJ1ZVxuICAgICAgdGhpcy5zb3VyY2UubG9vcFN0YXJ0ID0gc3VzdGFpblN0YXJ0XG4gICAgICB0aGlzLnNvdXJjZS5sb29wRW5kID0gc3VzdGFpbkVuZFxuICAgIH1cbiAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgY2Ipe1xuICAgIGxldCB7cmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUsIHJlbGVhc2VFbnZlbG9wZUFycmF5fSA9IHRoaXMuc2FtcGxlRGF0YVxuXG4gICAgdGhpcy5zb3VyY2Uub25lbmRlZCA9IGNiXG5cbiAgICBpZihyZWxlYXNlRHVyYXRpb24gJiYgcmVsZWFzZUVudmVsb3BlKXtcbiAgICAgIHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UgPSB0aW1lXG4gICAgICB0aGlzLnJlbGVhc2VGdW5jdGlvbiA9ICgpID0+IHtcbiAgICAgICAgZmFkZU91dCh0aGlzLm91dHB1dCwge1xuICAgICAgICAgIHJlbGVhc2VEdXJhdGlvbixcbiAgICAgICAgICByZWxlYXNlRW52ZWxvcGUsXG4gICAgICAgICAgcmVsZWFzZUVudmVsb3BlQXJyYXksXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUgKyByZWxlYXNlRHVyYXRpb24pXG4gICAgICB0aGlzLmNoZWNrUGhhc2UoKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lKVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrUGhhc2UoKXtcbiAgICAvL2NvbnNvbGUubG9nKGNvbnRleHQuY3VycmVudFRpbWUsIHRoaXMuc3RhcnRSZWxlYXNlUGhhc2UpXG4gICAgaWYoY29udGV4dC5jdXJyZW50VGltZSA+PSB0aGlzLnN0YXJ0UmVsZWFzZVBoYXNlKXtcbiAgICAgIHRoaXMucmVsZWFzZUZ1bmN0aW9uKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5jaGVja1BoYXNlLmJpbmQodGhpcykpXG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZmFkZU91dChnYWluTm9kZSwgc2V0dGluZ3Mpe1xuICBsZXQgbm93ID0gY29udGV4dC5jdXJyZW50VGltZVxuICBsZXQgdmFsdWVzLCBpLCBtYXhpXG5cbiAgLy9jb25zb2xlLmxvZyhzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpXG4gIHN3aXRjaChzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpe1xuXG4gICAgY2FzZSAnbGluZWFyJzpcbiAgICAgIGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSwgbm93KVxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBub3cgKyBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnZXF1YWwgcG93ZXInOlxuICAgIGNhc2UgJ2VxdWFsX3Bvd2VyJzpcbiAgICAgIHZhbHVlcyA9IGdldEVxdWFsUG93ZXJDdXJ2ZSgxMDAsICdmYWRlT3V0JywgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSlcbiAgICAgIGdhaW5Ob2RlLmdhaW4uc2V0VmFsdWVDdXJ2ZUF0VGltZSh2YWx1ZXMsIG5vdywgc2V0dGluZ3MucmVsZWFzZUR1cmF0aW9uKVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIG1heGkgPSBzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGVBcnJheS5sZW5ndGhcbiAgICAgIHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkobWF4aSlcbiAgICAgIGZvcihpID0gMDsgaSA8IG1heGk7IGkrKyl7XG4gICAgICAgIHZhbHVlc1tpXSA9IHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZUFycmF5W2ldICogZ2Fpbk5vZGUuZ2Fpbi52YWx1ZVxuICAgICAgfVxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTYW1wbGUoLi4uYXJncyl7XG4gIHJldHVybiBuZXcgU2FtcGxlKC4uLmFyZ3MpXG59XG5cblxuIiwiY29uc3Qgc2FtcGxlcyA9IHtcbiAgZW1wdHlPZ2c6ICdUMmRuVXdBQ0FBQUFBQUFBQUFCZHhkNFhBQUFBQURhUzBqUUJIZ0YyYjNKaWFYTUFBQUFBQVVTc0FBQUFBQUFBZ0xzQUFBQUFBQUM0QVU5bloxTUFBQUFBQUFBQUFBQUFYY1hlRndFQUFBQWFYSytRRHozLy8vLy8vLy8vLy8vLy8vLy9NZ04yYjNKaWFYTXRBQUFBV0dsd2FDNVBjbWNnYkdsaVZtOXlZbWx6SUVrZ01qQXhNREV4TURFZ0tGTmphR0YxWm1WdWRXZG5aWFFwQUFBQUFBRUZkbTl5WW1sekgwSkRWZ0VBQUFFQUdHTlVLVWFaVXRKS2lSbHpsREZHbVdLU1NvbWxoQlpDU0oxekZGT3BPZGVjYTZ5NXRTQ0VFQnBUVUNrRm1WS09VbWtaWTVBcEJabFNFRXRKSlhRU09pZWRZeEJiU2NIV21HdUxRYlljaEEyYVVrd3B4SlJTaWtJSUdWT01LY1dVVWtwQ0J5VjBEanJtSEZPT1NpaEJ1Snh6cTdXV2xtT0xxWFNTU3Vja1pFeENTQ21Ga2tvSHBWTk9Ra2cxbHRaU0tSMXpVbEpxUWVnZ2hCQkN0aUNFRFlMUWtGVUFBQUVBd0VBUUdySUtBRkFBQUJDS29SaUtBb1NHckFJQU1nQUFCS0FvanVJb2ppTTVrbU5KRmhBYXNnb0FBQUlBRUFBQXdIQVVTWkVVeWJFa1M5SXNTOU5FVVZWOTFUWlZWZloxWGRkMVhkZDFJRFJrRlFBQUFRQkFTS2VacFJvZ3dneGtHQWdOV1FVQUlBQUFBRVlvd2hBRFFrTldBUUFBQVFBQVlpZzVpQ2EwNW54empvTm1PV2dxeGVaMGNDTFY1a2x1S3VibW5IUE9PU2ViYzhZNDU1eHppbkptTVdnbXRPYWNjeEtEWmlsb0pyVG1uSE9leE9aQmE2cTA1cHh6eGptbmczRkdHT2VjYzVxMDVrRnFOdGJtbkhNV3RLWTVhaTdGNXB4ekl1WG1TVzB1MWVhY2M4NDU1NXh6empubm5IT3FGNmR6Y0U0NDU1eHpvdmJtV201Q0YrZWNjejRacDN0elFqam5uSFBPT2VlY2M4NDU1NXh6Z3RDUVZRQUFFQUFBUVJnMmhuR25JRWlmbzRFWVJZaHB5S1FIM2FQREpHZ01jZ3FwUjZPamtWTHFJSlJVeGtrcG5TQTBaQlVBQUFnQUFDR0VGRkpJSVlVVVVrZ2hoUlJTaUNHR0dHTElLYWVjZ2dvcXFhU2lpakxLTExQTU1zc3NzOHd5NjdDenpqcnNNTVFRUXd5dHRCSkxUYlhWV0dPdHVlZWNhdzdTV21tdHRkWktLYVdVVWtvcENBMVpCUUNBQUFBUUNCbGtrRUZHSVlVVVVvZ2hwcHh5eWltb29BSkNRMVlCQUlBQUFBSUFBQUE4eVhORVIzUkVSM1JFUjNSRVIzUkV4M004UjVSRVNaUkVTYlJNeTlSTVR4VlYxWlZkVzlabDNmWnRZUmQyM2ZkMTMvZDE0OWVGWVZtV1pWbVdaVm1XWlZtV1pWbVdaVm1DMEpCVkFBQUlBQUNBRUVJSUlZVVVVa2docFJoanpESG5vSk5RUWlBMFpCVUFBQWdBSUFBQUFNQlJITVZ4SkVkeUpNbVNMRW1UTkV1elBNM1RQRTMwUkZFVVRkTlVSVmQwUmQyMFJkbVVUZGQwVGRsMFZWbTFYVm0yYmRuV2JWK1diZC8zZmQvM2ZkLzNmZC8zZmQvM2RSMElEVmtGQUVnQUFPaElqcVJJaXFSSWp1TTRraVFCb1NHckFBQVpBQUFCQUNpS296aU80MGlTSkVtV3BFbWU1Vm1pWm1xbVozcXFxQUtoSWFzQUFFQUFBQUVBQUFBQUFDaWE0aW1tNGltaTRqbWlJMHFpWlZxaXBtcXVLSnV5NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N291RUJxeUNnQ1FBQURRa1J6SmtSeEprUlJKa1J6SkFVSkRWZ0VBTWdBQUFnQndETWVRRk1teExFdlRQTTNUUEUzMFJFLzBURThWWGRFRlFrTldBUUNBQUFBQ0FBQUFBQUF3Sk1OU0xFZHpORW1VVkV1MVZFMjFWRXNWVlU5VlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlUxVGRNMFRTQTBaQ1VBQUFRQXdHS053ZVVnSVNVbDVkNFF3aENUbmpFbUliVmVJUVNSa3Q0eEJoV0RuaktpREhMZVF1TVFneDRJRFZrUkFFUUJBQURHSU1jUWM4ZzVSNm1URWpubnFIU1VHdWNjcFk1U1p5bkZtR0xOS0pYWVVxeU5jNDVTUjYyamxHSXNMWGFVVW8ycHhnSUFBQUljQUFBQ0xJUkNRMVlFQUZFQUFJUXhTQ21rRkdLTU9hZWNRNHdwNTVoemhqSG1ISE9PT2VlZ2RGSXE1NXgwVGtyRUdIT09PYWVjYzFJNko1VnpUa29ub1FBQWdBQUhBSUFBQzZIUWtCVUJRSndBZ0VHU1BFL3lORkdVTkU4VVJWTjBYVkUwWGRmeVBOWDBURk5WUGRGVVZWTlZiZGxVVlZtV1BNODBQZE5VVmM4MFZkVlVWVmsyVlZXV1JWWFZiZE4xZGR0MFZkMldiZHYzWFZzV2RsRlZiZDFVWGRzM1ZkZjJYZG4yZlZuV2RXUHlQRlgxVE5OMVBkTjBaZFYxYlZ0MVhWMzNURk9XVGRlVlpkTjFiZHVWWlYxM1pkbjNOZE4wWGROVlpkbDBYZGwyWlZlM1hWbjJmZE4xaGQrVlpWOVhaVmtZZGwzM2hWdlhsZVYwWGQxWFpWYzNWbG4yZlZ2WGhlSFdkV0daUEU5VlBkTjBYYzgwWFZkMVhWOVhYZGZXTmRPVVpkTjFiZGxVWFZsMlpkbjNYVmZXZGM4MFpkbDBYZHMyWFZlV1hWbjJmVmVXZGQxMFhWOVhaVm40VlZmMmRWblhsZUhXYmVFM1hkZjNWVm4yaFZlV2RlSFdkV0c1ZFYwWVBsWDFmVk4yaGVGMFpkL1hoZDlaYmwwNGx0RjFmV0dWYmVGWVpWazVmdUZZbHQzM2xXVjBYVjlZYmRrWVZsa1dobC80bmVYMmZlTjRkVjBaYnQzbnpMcnZETWZ2cFB2SzA5VnRZNWw5M1ZsbVgzZU80Umc2di9EanFhcXZtNjRyREtjc0M3L3Q2OGF6Kzc2eWpLN3IrNm9zQzc4cTI4S3g2Nzd6L0w2d0xLUHMrc0pxeThLdzJyWXgzTDV1TEw5d0hNdHI2OG94Njc1UnRuVjhYM2dLdy9OMGRWMTVabDNIOW5WMDQwYzRmc29BQUlBQkJ3Q0FBQlBLUUtFaEt3S0FPQUVBanlTSm9tUlpvaWhabGlpS3B1aTZvbWk2cnFScHBxbHBubWxhbW1lYXBtbXFzaW1hcml4cG1tbGFubWFhbXFlWnBtaWFybXVhcHF5S3BpbkxwbXJLc21tYXN1eTZzbTI3cm16Ym9tbktzbW1hc215YXBpeTdzcXZicnV6cXVxUlpwcWw1bm1scW5tZWFwbXJLc21tYXJxdDVubXA2bm1pcW5paXFxbXFxcXEycXFpeGJubWVhbXVpcHBpZUtxbXFxcHEyYXFpckxwcXJhc21tcXRteXFxbTI3cXV6NnNtM3J1bW1xc20ycXBpMmJxbXJicnV6cXNpemJ1aTlwbW1scW5tZWFtdWVacG1tYXNteWFxaXRibnFlYW5paXFxdWFKcG1xcXFpeWJwcXJLbHVlWnFpZUtxdXFKbm11YXFpckxwbXJhcW1tYXRteXFxaTJicGlyTHJtMzd2dXZLc202cXFteWJxbXJycG1yS3Ntekx2dS9LcXU2S3BpbkxwcXJhc21tcXNpM2JzdS9Mc3F6N29tbktzbW1xc20ycXFpN0xzbTBiczJ6N3VtaWFzbTJxcGkyYnFpcmJzaTM3dWl6YnV1L0tybStycXF6cnNpMzd1dTc2cm5EcnVqQzhzbXo3cXF6NnVpdmJ1bS9yTXR2MmZVVFRsR1ZUTlczYlZGVlpkbVhaOW1YYjluM1JORzFiVlZWYk5rM1Z0bVZaOW4xWnRtMWhORTNaTmxWVjFrM1Z0RzFabG0xaHRtWGhkbVhadDJWYjluWFhsWFZmMTMzajEyWGQ1cnF5N2N1eXJmdXFxL3EyN3Z2Q2NPdXU4QW9BQUJod0FBQUlNS0VNRkJxeUVnQ0lBZ0FBakdHTU1RaU5VczQ1QjZGUnlqbm5JR1RPUVFnaGxjdzVDQ0dVa2prSG9aU1VNdWNnbEpKU0NLR1VsRm9MSVpTVVVtc0ZBQUFVT0FBQUJOaWdLYkU0UUtFaEt3R0FWQUFBZytOWWx1ZVpvbXJhc21OSm5pZUtxcW1xdHUxSWx1ZUpvbW1xcW0xYm5pZUtwcW1xcnV2cm11ZUpvbW1xcXV2cXVtaWFwcW1xcnV1NnVpNmFvcW1xcXV1NnNxNmJwcXFxcml1N3N1enJwcXFxcXV2S3Jpejd3cXE2cml2THNtM3J3ckNxcnV2S3NtemJ0bS9jdXE3cnZ1Lzd3cEd0NjdvdS9NSXhERWNCQU9BSkRnQkFCVGFzam5CU05CWllhTWhLQUNBREFJQXdCaUdERUVJR0lZU1FVa29ocFpRU0FBQXc0QUFBRUdCQ0dTZzBaRVVBRUNjQUFCaERLYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpJS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLcWFTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS1pWU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVZ29Ba0lwd0FKQjZNS0VNRkJxeUVnQklCUUFBakZGS0tjYWNneEF4NWhoajBFa29LV0xNT2NZY2xKSlM1UnlFRUZKcExiZktPUWdocE5SU2JabHpVbHFMTWVZWU0rZWtwQlJielRtSFVsS0xzZWFhYSs2a3RGWnJyalhuV2xxck5kZWNjODI1dEJacnJqblhuSFBMTWRlY2M4NDU1eGh6empubm5IUE9CUURnTkRnQWdCN1lzRHJDU2RGWVlLRWhLd0dBVkFBQUFobWxHSFBPT2VnUVVvdzU1eHlFRUNLRkdIUE9PUWdoVkl3NTV4eDBFRUtvR0hQTU9RZ2hoSkE1NXh5RUVFSUlJWE1PT3VnZ2hCQkNCeDJFRUVJSW9aVE9RUWdoaEJCS0tDR0VFRUlJSVlRUU9nZ2hoQkJDQ0NHRUVFSUlJWVJTU2dnaGhCQkNDYUdVVUFBQVlJRURBRUNBRGFzam5CU05CUllhc2hJQUFBSUFnQnlXb0ZMT2hFR09RWThOUWNwUk13MUNURG5SbVdKT2FqTVZVNUE1RUoxMEVobHFRZGxlTWdzQUFJQWdBQ0RBQkJBWUlDajRRZ2lJTVFBQVFZak1FQW1GVmJEQW9Bd2FIT1lCd0FORWhFUUFrSmlnU0x1NGdDNERYTkRGWFFkQ0NFSVFnbGdjUUFFSk9EamhoaWZlOElRYm5LQlRWT29nQUFBQUFBQU1BT0FCQU9DZ0FDSWltcXV3dU1ESTBOamc2UEFJQUFBQUFBQVdBUGdBQURnK2dJaUk1aW9zTGpBeU5EWTRPandDQUFBQUFBQUFBQUNBZ0lBQUFBQUFBRUFBQUFDQWdFOW5aMU1BQkFFQUFBQUFBQUFBWGNYZUZ3SUFBQUJxMm5weEFnRUJBQW89JyxcbiAgZW1wdHlNcDM6ICcvL3NReEFBRHdBQUJwQUFBQUNBQUFEU0FBQUFFVEVGTlJUTXVPVGt1TlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVPScsXG4gIGhpZ2h0aWNrOiAnVWtsR1JrUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlTQUZBQUN4L3hmL2RBRE9BQ3dCc1AzcCs2SCt6QUdvQk9rQ0N3QlgvRUg1T3Z4bEE0a0oyd2NTQXJUOUUvdXQrSFQyZXZVeDk4bjZPQUY1Q0NVTXdRdmZDT3NKeEF4MERTSU1FQXE5QmlBQjN2aHo3bUxrVDlzUjEzM1l4TjJzNVFMdjB2clVCbndSbnh1UUplRXNTRENpTWQ4eUZTOGFLRklob2hVc0NLajY0dTYyNU9yYUE5SHV5UG5FbGNQK3d4dkpXdFcyNTYzN1ZRMGpIUGduQlRERE0xbzBDektMSys4aHpoZ0ZET3o4U2U0SjQ3RFlWdEcwejVmUXE5TEIxMnJmQStqOTlyb0hBaGVsSXlNd0lqZFRPdVU4bWp3SU9Hb3hoQ2I1RTUzL2orM2szL2ZUWThwVHc0eS9UcitldzhETXZkc2s4UmNIUlJrU0tPNHlHVGtIUGtVL3J6enlOY2dzclI5NERwLzVyK1pzMTd6T25jb0R4aGZFMzhXTHluL1RlT01pOXIwSVJ4bFJLSVF6eVRsT1BLbzl5am1XTWNva0RSTGMvWTdydWR0ZHp1L0QyTDFJdSsyN0pjRzN5WXJWTHVqbCszVU9aeDFVSzVRMHF6bU5QRGs4WmplZU1Qb2p6aEgrL2pMdFBkNW0waEhMSHNZSXc1VEVNTW5BMGp2ajhmU09CaXdYQVNaZ016TThkVUJHUWJJK3J6anBLa0laeWdaVDlRZmxjZGFSeXFYQ3o3K1Z3VVBINzg0cjNLN3MrdjBLRHU4YnZ5ZUxNYjQzTmpyaE9JbzBkU3ZRSGkwUG5QNmk3b3ZnM05UeHk0L0dmOFg4eUgvUUJ0dlg1NVAyWWdiMEZjVWpzeTRMTm1JNWVqaVhNMzhyN2lDOEZKd0hQdm9rN2REZ1FkYUp6bFRLSXNvRnpzclZrdUE4N2QvNnFBaTdGUTBoOUNsS01MRXozVE9yTUJjcVlTRDhFOUFGZC9kUzZrVGY2ZGJVMFhuUXY5SUgyTVhmWitsbjlERUFGd3dkRnk4Z2lpYjZLYXdxZUNoZ0kvVWJIQk9UQ1pqL3Z2WGU3SW5sRnVETjNQM2IwZDFGNGd6cGlmRzIrdTREN1F3MUZmd2JuQ0QrSWxnald5SExIUE1Wb2cybUJMMzdxdlArN052bll1VHY0cnZqZnViTjZrM3dwUFowL1drRU93dGlFVXNXY3htK0dsNGFPaGhpRkRBUEl3bWJBdG43VFBWeTc3enFjZWZyNVlIbUh1bGw3ZW55ZlBtY0FIZ0hldzFSRXI4VmhoZC9GK0FWMVJKMERpa0pXUU5jL1pQM2VmS2Q3aHZzMnVyNDZySHM1dThlOU4vNDgvMGhBLzhIRmd3dUQwNFJTQklSRXFzUU9nN21Dc3NHTUFKVy9YbjRHL1RLOExidXp1MEk3cVR2blBKeTlzWDZiUDg0QkxZSWJBd2REODRRWXhHN0VPY09EQXh3Q0ZNRUFRQzkrN1AzU3ZUWDhYSHcrdTlSOEtUeEl2U285K1g3VlFDVUJKMElNd3ppRGo0UUxoQUdEOVVNcmduVEJaY0JSdjF2K1h2MlVmUys4dGZ4K3ZFUzg3ejArdmIzK1pmOVpnRVFCU0VJVUFyV0M4a00yUXl6QzVFSkVBZHZCSGdCWFA1bisrcjRBdmQ4OVdqMDdmTXc5RDMxSnZmcCtVajl4UUQ5QThRRzVRaFhDbEVMckFzdkM5d0o3Z2Q2QldJQzN2Nk8rN1Q0UFBaTjlFSHpXdk5mOVB6MUZ2aXQrcUw5clFDSEF3RUcvd2VDQ1pVS0Z3dkRDbklKY0FjUUJXY0NhZjhaL0NENTV2YUI5ZEQwd1BTUDlVTDNtL2s3L016K0p3RXlBdzhGekFZN0NCc0phUWs1Q1drSTJnYXRCQ0lDWWYrai9GcjZ2ZmlWOTg3MnNmWlA5MXo0cC9sUiszSDl6Zjg5QXJvRUZBZmpDUDBKY3dvOENqQUpkUWRnQlNFRGtnRFEvVmo3WmZuUjk1VDI4ZlVkOXYzMlZ2ZzIrbmI4Ky82eEFXb0U0QWJEQ1A0SnBBcWJDcVFKMHdlRUJmZ0NUQUNUL1IzN00vbSs5NjcySVBZNjlnYjNhZmhXK3RUOHFmK01BajBGZ2djdUNTY0tYQXJpQ2NNSUVBZnlCSllDRndDUC9SejdBL2w3OTN6MkYvWm45bUgzN2ZqZCtpMzl5ZjlwQXQwRUZBZlJDTmtKR0FxckNaWUl2Z1pQQko4QjZQNC8vTTM1MHZkejlxLzFsZlVxOW16M1JQbWkrM0grYmdGVkJPUUczd2dIQ2t3SzBBbTdDQ0FIQ2dXbUFqQUEnLFxuICBsb3d0aWNrOiAnVWtsR1JsUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlUQUZBQUIwLzV2K1UvNFQvM2dBMHdGVEF1VUIrZjhkL25UOTBmMXEvdWIrdGY0Ni9tYi84d0ZRQTlnQzd3Q2QvbXIrRkFHUkEzY0U2d0pmL2gzNmV2bXYrOHYvTndSSEJaVUMyLzYwKy8vNUV2dVovYVgvYmdGT0FwOEF6dnpoOXdmekxQRjY4elQ0eS8yQkF5Z0lmUXdhRWpZWTB4MzFJcndsOFNPV0hWRVNPZ1BoOU5mcFJlRnQyMm5ZSGRkRDJCWGNaZURhNUlucWdQRHg5blArNmdTNENCWUxudzB6RVMwV1h4djRIa2NnTGgvMUcrRVgxUk5wRDR3S2lnWEgvNnI1L2ZOdTdsVHBqK1p1NWhIb1hPdEw3MWJ5ci9RcDkxTDY0djZPQk80Sm9RNXpFc2tVK2hVMUZpUVZlUlA3RVdnUDRRcjBCSVQrdFBpZDlDM3kxdkNoOEZEeEp2SzI4dnZ5eS9MQThwTHpVL1hQOTV2Nnh2dzQvdUQvUkFLMkJTa0tjZzZCRVNjVFpCTWVFcWtQVFF4akNLRUVWd0ZpL252N2gvaHA5YUR5QXZIUDhNZnhMdk0rOVBYMHVQVzE5Zy80TGZyNy9DNEFLZ05hQlhRR3l3YjBCaElIV1FmV0Ixb0l6QWp0Q0Y4SUh3ZHRCYWtEVndLTEFlWUE4djl3L2tqODEvblE5NHYyOS9YWDliejFiUFVZOVV6MVovYUgrSHI3eVA0TUFpNEYrd2NmQ25ZTE5neWZEUHNNU3cwc0RVQU1mZ3JjQjVJRU13RmIvaVg4VC9wVCtPLzFYL01mOGNidnJPKzE4TUx5dmZWUCtSZjl3Z0FvQkNFSHB3bklDNUVONFE1QUQzd08xQXkwQ3BzSXZ3YnZCTmNDYlFBci9uWDhPZnNmK3ZiNG12ZGE5cmoxei9XWDlwTDNhL2hIK1pYNlIvd24vdlAvZVFFU0EvQUUrd1lEQ2N3S0ZBeVBEQ2tNRlF1U0NlNEhWUWJTQkhRREN3SThBTkw5SlB1WStIWDI4dlRxODJQemRQTVY5QXoxTWZaNDl6RDVnZnR4L3NRQkJRWExCOGNKL2dxcEN3OE1pZ3dXRFhFTlhRMnJERFVMN1FnREJzd0NkdjhTL0s3NFdQVms4aFh3b3U0UDdtdnUxKzlUOHB6MVV2bGkvWm9Cd2dXUkNjc01QZy9DRUVRUjRSREFEd29POXd1c0NWTUg0QVJTQXBuL3VmemQrV2ozYnZYNzh4enp4L0w2OHF6ejF2U0Q5cVg0R2Z2ZC9jMEFod08vQld3SG1naHZDUUVLVlFvbkNsc0pDd2lJQmgwRjBnT2dBbTBCT3dBeC8wMytYUDBnL0xiNmNQbVgrRi80dmZoKytUSDZzL29zKzcvN2N2d0wvWno5WFA1Ty8zSUEzQUY5QXpzRjlnYVVDQUFLSGd1ZUN6Y0w5d250QjNzRjR3SXpBSTM5NmZwMStHdjJJdlduOU4zMHAvWGk5bTc0Ry9ydSs5UDlrLzhhQVlFQzFBTVRCU0lHMHdZdUIxZ0hrZ2NBQ0dFSVNBaFRCekVGV0FLdC81TDkyZnVVK3ZYNTBmbWYrU1A1aS9nYitCZjRtdml2K1NyN2t2eWIvVWorci80WC84ci8rZ0NpQW8wRVVBYVJCendJU3dqcUIzSUhHUWZDQnY4RnBnVE1BcFFBS2Y2Nys1bjUvdmZuOWp6MnlQVm45U0wxUlBYcTlTUDNEdm1yKzZmK3NRR0tCQWNIK3doT0NoMExhd3MzQzI4S0xBbURCNUFGZlFOb0FWUC9adjNlKzdQNnNmbkwrQ3Y0dlBlTTk1YjM3ZmVWK0puNTFQb3EvTEw5bXYrWUFWWUQzZ1F1Qm1jSFNBaWtDSUVJN0FmK0J1RUZuZ1FYQTFzQnYvOXYvcGY5TVAzVy9GajhxL3NSKzZINlUvbzMrbVA2eS9wTisvZjd4dnllL1dIK0pmOW1BRDRDUUFRSkJpc0h0Z2Y2QncwSThRZHNCMXNHeXdUNEFnZ0JDUC9vL0tYNm1QZzE5NTcyamZhejl1ZjJTL2NNK0UzNUUvdFcvYWYvNXdIMUE4QUZLZ2ZrQi9BSGd3ZnhCbEFHZ1FWSUJNTUNKd0dzLzQzK3ZQMGkvWnI4TGZ6bCs5SDc2ZnZpKzlmNzVmc2YvSW44QlAxMC9lajljZjRPLzdmL2RBQWNBYVVCRWdLTUFoZ0RwQU1FQkNFRUR3VGZBM0lEeFFMOEFTb0JVd0NHLzg3K0ovNmgvUnI5cFB4ay9HYjhvUHdKL1hIOXcvMzkvVUQrcVA0MS85RC9Xd0RlQUdzQkFnS2RBaEVEUVFOQUEwc0Rid09WQTVZRFZ3UE9BaGdDVkFHUkFBPT0nLFxufVxuXG5leHBvcnQgZGVmYXVsdCBzYW1wbGVzXG4iLCIvKlxuXG5cblRoaXMgY29kZSBpcyBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vc2VyZ2kvanNtaWRpXG5cbmluZm86IGh0dHA6Ly93d3cuZGVsdWdlLmNvLz9xPW1pZGktdGVtcG8tYnBtXG5cbiovXG5cblxuaW1wb3J0IHtzYXZlQXN9IGZyb20gJ2ZpbGVzYXZlcmpzJ1xuXG5sZXQgUFBRID0gOTYwXG5sZXQgSERSX1BQUSA9IHN0cjJCeXRlcyhQUFEudG9TdHJpbmcoMTYpLCAyKVxuXG5jb25zdCBIRFJfQ0hVTktJRCA9IFtcbiAgJ00nLmNoYXJDb2RlQXQoMCksXG4gICdUJy5jaGFyQ29kZUF0KDApLFxuICAnaCcuY2hhckNvZGVBdCgwKSxcbiAgJ2QnLmNoYXJDb2RlQXQoMClcbl1cbmNvbnN0IEhEUl9DSFVOS19TSVpFID0gWzB4MCwgMHgwLCAweDAsIDB4Nl0gLy8gSGVhZGVyIHNpemUgZm9yIFNNRlxuY29uc3QgSERSX1RZUEUwID0gWzB4MCwgMHgwXSAvLyBNaWRpIFR5cGUgMCBpZFxuY29uc3QgSERSX1RZUEUxID0gWzB4MCwgMHgxXSAvLyBNaWRpIFR5cGUgMSBpZFxuLy9IRFJfUFBRID0gWzB4MDEsIDB4RTBdIC8vIERlZmF1bHRzIHRvIDQ4MCB0aWNrcyBwZXIgYmVhdFxuLy9IRFJfUFBRID0gWzB4MDAsIDB4ODBdIC8vIERlZmF1bHRzIHRvIDEyOCB0aWNrcyBwZXIgYmVhdFxuXG5jb25zdCBUUktfQ0hVTktJRCA9IFtcbiAgJ00nLmNoYXJDb2RlQXQoMCksXG4gICdUJy5jaGFyQ29kZUF0KDApLFxuICAncicuY2hhckNvZGVBdCgwKSxcbiAgJ2snLmNoYXJDb2RlQXQoMClcbl1cblxuLy8gTWV0YSBldmVudCBjb2Rlc1xuY29uc3QgTUVUQV9TRVFVRU5DRSA9IDB4MDBcbmNvbnN0IE1FVEFfVEVYVCA9IDB4MDFcbmNvbnN0IE1FVEFfQ09QWVJJR0hUID0gMHgwMlxuY29uc3QgTUVUQV9UUkFDS19OQU1FID0gMHgwM1xuY29uc3QgTUVUQV9JTlNUUlVNRU5UID0gMHgwNFxuY29uc3QgTUVUQV9MWVJJQyA9IDB4MDVcbmNvbnN0IE1FVEFfTUFSS0VSID0gMHgwNlxuY29uc3QgTUVUQV9DVUVfUE9JTlQgPSAweDA3XG5jb25zdCBNRVRBX0NIQU5ORUxfUFJFRklYID0gMHgyMFxuY29uc3QgTUVUQV9FTkRfT0ZfVFJBQ0sgPSAweDJmXG5jb25zdCBNRVRBX1RFTVBPID0gMHg1MVxuY29uc3QgTUVUQV9TTVBURSA9IDB4NTRcbmNvbnN0IE1FVEFfVElNRV9TSUcgPSAweDU4XG5jb25zdCBNRVRBX0tFWV9TSUcgPSAweDU5XG5jb25zdCBNRVRBX1NFUV9FVkVOVCA9IDB4N2ZcblxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUFzTUlESUZpbGUoc29uZywgZmlsZU5hbWUgPSBzb25nLm5hbWUsIHBwcSA9IDk2MCkge1xuXG4gIFBQUSA9IHBwcVxuICBIRFJfUFBRID0gc3RyMkJ5dGVzKFBQUS50b1N0cmluZygxNiksIDIpXG5cbiAgbGV0IGJ5dGVBcnJheSA9IFtdLmNvbmNhdChIRFJfQ0hVTktJRCwgSERSX0NIVU5LX1NJWkUsIEhEUl9UWVBFMSlcbiAgbGV0IHRyYWNrcyA9IHNvbmcuZ2V0VHJhY2tzKClcbiAgbGV0IG51bVRyYWNrcyA9IHRyYWNrcy5sZW5ndGggKyAxXG4gIGxldCBpLCBtYXhpLCB0cmFjaywgbWlkaUZpbGUsIGRlc3RpbmF0aW9uLCBiNjRcbiAgbGV0IGFycmF5QnVmZmVyLCBkYXRhVmlldywgdWludEFycmF5XG5cbiAgYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdChzdHIyQnl0ZXMobnVtVHJhY2tzLnRvU3RyaW5nKDE2KSwgMiksIEhEUl9QUFEpXG5cbiAgLy9jb25zb2xlLmxvZyhieXRlQXJyYXkpO1xuICBieXRlQXJyYXkgPSBieXRlQXJyYXkuY29uY2F0KHRyYWNrVG9CeXRlcyhzb25nLl90aW1lRXZlbnRzLCBzb25nLl9kdXJhdGlvblRpY2tzLCAndGVtcG8nKSlcblxuICBmb3IoaSA9IDAsIG1heGkgPSB0cmFja3MubGVuZ3RoOyBpIDwgbWF4aTsgaSsrKXtcbiAgICB0cmFjayA9IHRyYWNrc1tpXTtcbiAgICBsZXQgaW5zdHJ1bWVudFxuICAgIGlmKHRyYWNrLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIGluc3RydW1lbnQgPSB0cmFjay5faW5zdHJ1bWVudC5pZFxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIHRyYWNrLl9ldmVudHMubGVuZ3RoLCBpbnN0cnVtZW50KVxuICAgIGJ5dGVBcnJheSA9IGJ5dGVBcnJheS5jb25jYXQodHJhY2tUb0J5dGVzKHRyYWNrLl9ldmVudHMsIHNvbmcuX2R1cmF0aW9uVGlja3MsIHRyYWNrLm5hbWUsIGluc3RydW1lbnQpKVxuICAgIC8vYnl0ZUFycmF5ID0gYnl0ZUFycmF5LmNvbmNhdCh0cmFja1RvQnl0ZXModHJhY2suX2V2ZW50cywgc29uZy5fbGFzdEV2ZW50Lmlja3MsIHRyYWNrLm5hbWUsIGluc3RydW1lbnQpKVxuICB9XG5cbiAgLy9iNjQgPSBidG9hKGNvZGVzMlN0cihieXRlQXJyYXkpKVxuICAvL3dpbmRvdy5sb2NhdGlvbi5hc3NpZ24oXCJkYXRhOmF1ZGlvL21pZGk7YmFzZTY0LFwiICsgYjY0KVxuICAvL2NvbnNvbGUubG9nKGI2NCkvLyBzZW5kIHRvIHNlcnZlclxuXG4gIG1heGkgPSBieXRlQXJyYXkubGVuZ3RoXG4gIGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKG1heGkpXG4gIHVpbnRBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKVxuICBmb3IoaSA9IDA7IGkgPCBtYXhpOyBpKyspe1xuICAgIHVpbnRBcnJheVtpXSA9IGJ5dGVBcnJheVtpXVxuICB9XG4gIG1pZGlGaWxlID0gbmV3IEJsb2IoW3VpbnRBcnJheV0sIHt0eXBlOiAnYXBwbGljYXRpb24veC1taWRpJywgZW5kaW5nczogJ3RyYW5zcGFyZW50J30pXG4gIGZpbGVOYW1lID0gZmlsZU5hbWUucmVwbGFjZSgvXFwubWlkaSQvLCAnJylcbiAgLy9sZXQgcGF0dCA9IC9cXC5taWRbaV17MCwxfSQvXG4gIGxldCBwYXR0ID0gL1xcLm1pZCQvXG4gIGxldCBoYXNFeHRlbnNpb24gPSBwYXR0LnRlc3QoZmlsZU5hbWUpXG4gIGlmKGhhc0V4dGVuc2lvbiA9PT0gZmFsc2Upe1xuICAgIGZpbGVOYW1lICs9ICcubWlkJ1xuICB9XG4gIC8vY29uc29sZS5sb2coZmlsZU5hbWUsIGhhc0V4dGVuc2lvbilcbiAgc2F2ZUFzKG1pZGlGaWxlLCBmaWxlTmFtZSlcbiAgLy93aW5kb3cubG9jYXRpb24uYXNzaWduKHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKG1pZGlGaWxlKSlcbn1cblxuXG5mdW5jdGlvbiB0cmFja1RvQnl0ZXMoZXZlbnRzLCBsYXN0RXZlbnRUaWNrcywgdHJhY2tOYW1lLCBpbnN0cnVtZW50TmFtZSA9ICdubyBpbnN0cnVtZW50Jyl7XG4gIHZhciBsZW5ndGhCeXRlcyxcbiAgICBpLCBtYXhpLCBldmVudCwgc3RhdHVzLFxuICAgIHRyYWNrTGVuZ3RoLCAvLyBudW1iZXIgb2YgYnl0ZXMgaW4gdHJhY2sgY2h1bmtcbiAgICB0aWNrcyA9IDAsXG4gICAgZGVsdGEgPSAwLFxuICAgIHRyYWNrQnl0ZXMgPSBbXTtcblxuICBpZih0cmFja05hbWUpe1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDMpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEodHJhY2tOYW1lLmxlbmd0aCkpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChzdHJpbmdUb051bUFycmF5KHRyYWNrTmFtZSkpO1xuICB9XG5cbiAgaWYoaW5zdHJ1bWVudE5hbWUpe1xuICAgIHRyYWNrQnl0ZXMucHVzaCgweDAwKTtcbiAgICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gICAgdHJhY2tCeXRlcy5wdXNoKDB4MDQpO1xuICAgIHRyYWNrQnl0ZXMgPSB0cmFja0J5dGVzLmNvbmNhdChjb252ZXJ0VG9WTFEoaW5zdHJ1bWVudE5hbWUubGVuZ3RoKSk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KHN0cmluZ1RvTnVtQXJyYXkoaW5zdHJ1bWVudE5hbWUpKTtcbiAgfVxuXG4gIGZvcihpID0gMCwgbWF4aSA9IGV2ZW50cy5sZW5ndGg7IGkgPCBtYXhpOyBpKyspe1xuICAgIGV2ZW50ID0gZXZlbnRzW2ldO1xuICAgIGRlbHRhID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgICBkZWx0YSA9IGNvbnZlcnRUb1ZMUShkZWx0YSk7XG4gICAgLy9jb25zb2xlLmxvZyhkZWx0YSk7XG4gICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGRlbHRhKTtcbiAgICAvL3RyYWNrQnl0ZXMucHVzaC5hcHBseSh0cmFja0J5dGVzLCBkZWx0YSk7XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMHg4MCB8fCBldmVudC50eXBlID09PSAweDkwKXsgLy8gbm90ZSBvZmYsIG5vdGUgb25cbiAgICAgIC8vc3RhdHVzID0gcGFyc2VJbnQoZXZlbnQudHlwZS50b1N0cmluZygxNikgKyBldmVudC5jaGFubmVsLnRvU3RyaW5nKDE2KSwgMTYpO1xuICAgICAgc3RhdHVzID0gZXZlbnQudHlwZSArIChldmVudC5jaGFubmVsIHx8IDApXG4gICAgICB0cmFja0J5dGVzLnB1c2goc3RhdHVzKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChldmVudC5kYXRhMSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQuZGF0YTIpO1xuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDB4NTEpeyAvLyB0ZW1wb1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4RkYpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4NTEpO1xuICAgICAgdHJhY2tCeXRlcy5wdXNoKDB4MDMpOy8vIGxlbmd0aFxuICAgICAgLy90cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoY29udmVydFRvVkxRKDMpKTsvLyBsZW5ndGhcbiAgICAgIHZhciBtaWNyb1NlY29uZHMgPSBNYXRoLnJvdW5kKDYwMDAwMDAwIC8gZXZlbnQuYnBtKTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuYnBtKVxuICAgICAgdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KHN0cjJCeXRlcyhtaWNyb1NlY29uZHMudG9TdHJpbmcoMTYpLCAzKSk7XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMHg1OCl7IC8vIHRpbWUgc2lnbmF0dXJlXG4gICAgICB2YXIgZGVub20gPSBldmVudC5kZW5vbWluYXRvcjtcbiAgICAgIGlmKGRlbm9tID09PSAyKXtcbiAgICAgICAgZGVub20gPSAweDAxO1xuICAgICAgfWVsc2UgaWYoZGVub20gPT09IDQpe1xuICAgICAgICBkZW5vbSA9IDB4MDI7XG4gICAgICB9ZWxzZSBpZihkZW5vbSA9PT0gOCl7XG4gICAgICAgIGRlbm9tID0gMHgwMztcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSAxNil7XG4gICAgICAgIGRlbm9tID0gMHgwNDtcbiAgICAgIH1lbHNlIGlmKGRlbm9tID09PSAzMil7XG4gICAgICAgIGRlbm9tID0gMHgwNTtcbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVub21pbmF0b3IsIGV2ZW50Lm5vbWluYXRvcilcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweEZGKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDU4KTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDA0KTsvLyBsZW5ndGhcbiAgICAgIC8vdHJhY2tCeXRlcyA9IHRyYWNrQnl0ZXMuY29uY2F0KGNvbnZlcnRUb1ZMUSg0KSk7Ly8gbGVuZ3RoXG4gICAgICB0cmFja0J5dGVzLnB1c2goZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaChkZW5vbSk7XG4gICAgICB0cmFja0J5dGVzLnB1c2goUFBRIC8gZXZlbnQubm9taW5hdG9yKTtcbiAgICAgIHRyYWNrQnl0ZXMucHVzaCgweDA4KTsgLy8gMzJuZCBub3RlcyBwZXIgY3JvdGNoZXRcbiAgICAgIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCBldmVudC5ub21pbmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yLCBkZW5vbSwgUFBRL2V2ZW50Lm5vbWluYXRvcik7XG4gICAgfVxuICAgIC8vIHNldCB0aGUgbmV3IHRpY2tzIHJlZmVyZW5jZVxuICAgIC8vY29uc29sZS5sb2coc3RhdHVzLCBldmVudC50aWNrcywgdGlja3MpO1xuICAgIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIH1cbiAgZGVsdGEgPSBsYXN0RXZlbnRUaWNrcyAtIHRpY2tzO1xuICAvL2NvbnNvbGUubG9nKCdkJywgZGVsdGEsICd0JywgdGlja3MsICdsJywgbGFzdEV2ZW50VGlja3MpO1xuICBkZWx0YSA9IGNvbnZlcnRUb1ZMUShkZWx0YSk7XG4gIC8vY29uc29sZS5sb2codHJhY2tOYW1lLCB0aWNrcywgZGVsdGEpO1xuICB0cmFja0J5dGVzID0gdHJhY2tCeXRlcy5jb25jYXQoZGVsdGEpO1xuICB0cmFja0J5dGVzLnB1c2goMHhGRik7XG4gIHRyYWNrQnl0ZXMucHVzaCgweDJGKTtcbiAgdHJhY2tCeXRlcy5wdXNoKDB4MDApO1xuICAvL2NvbnNvbGUubG9nKHRyYWNrTmFtZSwgdHJhY2tCeXRlcyk7XG4gIHRyYWNrTGVuZ3RoID0gdHJhY2tCeXRlcy5sZW5ndGg7XG4gIGxlbmd0aEJ5dGVzID0gc3RyMkJ5dGVzKHRyYWNrTGVuZ3RoLnRvU3RyaW5nKDE2KSwgNCk7XG4gIHJldHVybiBbXS5jb25jYXQoVFJLX0NIVU5LSUQsIGxlbmd0aEJ5dGVzLCB0cmFja0J5dGVzKTtcbn1cblxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5cbi8qXG4gKiBDb252ZXJ0cyBhbiBhcnJheSBvZiBieXRlcyB0byBhIHN0cmluZyBvZiBoZXhhZGVjaW1hbCBjaGFyYWN0ZXJzLiBQcmVwYXJlc1xuICogaXQgdG8gYmUgY29udmVydGVkIGludG8gYSBiYXNlNjQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBieXRlQXJyYXkge0FycmF5fSBhcnJheSBvZiBieXRlcyB0aGF0IHdpbGwgYmUgY29udmVydGVkIHRvIGEgc3RyaW5nXG4gKiBAcmV0dXJucyBoZXhhZGVjaW1hbCBzdHJpbmdcbiAqL1xuXG5mdW5jdGlvbiBjb2RlczJTdHIoYnl0ZUFycmF5KSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGJ5dGVBcnJheSk7XG59XG5cbi8qXG4gKiBDb252ZXJ0cyBhIFN0cmluZyBvZiBoZXhhZGVjaW1hbCB2YWx1ZXMgdG8gYW4gYXJyYXkgb2YgYnl0ZXMuIEl0IGNhbiBhbHNvXG4gKiBhZGQgcmVtYWluaW5nICcwJyBuaWJibGVzIGluIG9yZGVyIHRvIGhhdmUgZW5vdWdoIGJ5dGVzIGluIHRoZSBhcnJheSBhcyB0aGVcbiAqIHxmaW5hbEJ5dGVzfCBwYXJhbWV0ZXIuXG4gKlxuICogQHBhcmFtIHN0ciB7U3RyaW5nfSBzdHJpbmcgb2YgaGV4YWRlY2ltYWwgdmFsdWVzIGUuZy4gJzA5N0I4QSdcbiAqIEBwYXJhbSBmaW5hbEJ5dGVzIHtJbnRlZ2VyfSBPcHRpb25hbC4gVGhlIGRlc2lyZWQgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgdGhlIHJldHVybmVkIGFycmF5IHNob3VsZCBjb250YWluXG4gKiBAcmV0dXJucyBhcnJheSBvZiBuaWJibGVzLlxuICovXG5cbmZ1bmN0aW9uIHN0cjJCeXRlcyhzdHIsIGZpbmFsQnl0ZXMpIHtcbiAgaWYgKGZpbmFsQnl0ZXMpIHtcbiAgICB3aGlsZSAoKHN0ci5sZW5ndGggLyAyKSA8IGZpbmFsQnl0ZXMpIHtcbiAgICAgIHN0ciA9ICcwJyArIHN0cjtcbiAgICB9XG4gIH1cblxuICB2YXIgYnl0ZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHN0ci5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMikge1xuICAgIHZhciBjaGFycyA9IGkgPT09IDAgPyBzdHJbaV0gOiBzdHJbaSAtIDFdICsgc3RyW2ldO1xuICAgIGJ5dGVzLnVuc2hpZnQocGFyc2VJbnQoY2hhcnMsIDE2KSk7XG4gIH1cblxuICByZXR1cm4gYnl0ZXM7XG59XG5cblxuLyoqXG4gKiBUcmFuc2xhdGVzIG51bWJlciBvZiB0aWNrcyB0byBNSURJIHRpbWVzdGFtcCBmb3JtYXQsIHJldHVybmluZyBhbiBhcnJheSBvZlxuICogYnl0ZXMgd2l0aCB0aGUgdGltZSB2YWx1ZXMuIE1pZGkgaGFzIGEgdmVyeSBwYXJ0aWN1bGFyIHRpbWUgdG8gZXhwcmVzcyB0aW1lLFxuICogdGFrZSBhIGdvb2QgbG9vayBhdCB0aGUgc3BlYyBiZWZvcmUgZXZlciB0b3VjaGluZyB0aGlzIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB0aWNrcyB7SW50ZWdlcn0gTnVtYmVyIG9mIHRpY2tzIHRvIGJlIHRyYW5zbGF0ZWRcbiAqIEByZXR1cm5zIEFycmF5IG9mIGJ5dGVzIHRoYXQgZm9ybSB0aGUgTUlESSB0aW1lIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRUb1ZMUSh0aWNrcykge1xuICB2YXIgYnVmZmVyID0gdGlja3MgJiAweDdGO1xuXG4gIHdoaWxlKHRpY2tzID0gdGlja3MgPj4gNykge1xuICAgIGJ1ZmZlciA8PD0gODtcbiAgICBidWZmZXIgfD0gKCh0aWNrcyAmIDB4N0YpIHwgMHg4MCk7XG4gIH1cblxuICB2YXIgYkxpc3QgPSBbXTtcbiAgd2hpbGUodHJ1ZSkge1xuICAgIGJMaXN0LnB1c2goYnVmZmVyICYgMHhmZik7XG5cbiAgICBpZiAoYnVmZmVyICYgMHg4MCkge1xuICAgICAgYnVmZmVyID4+PSA4O1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKHRpY2tzLCBiTGlzdCk7XG4gIHJldHVybiBiTGlzdDtcbn1cblxuXG4vKlxuICogQ29udmVydHMgYSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBBU0NJSSBjaGFyIGNvZGVzIGZvciBldmVyeSBjaGFyYWN0ZXIgb2ZcbiAqIHRoZSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHN0ciB7U3RyaW5nfSBTdHJpbmcgdG8gYmUgY29udmVydGVkXG4gKiBAcmV0dXJucyBhcnJheSB3aXRoIHRoZSBjaGFyY29kZSB2YWx1ZXMgb2YgdGhlIHN0cmluZ1xuICovXG5jb25zdCBBUCA9IEFycmF5LnByb3RvdHlwZVxuZnVuY3Rpb24gc3RyaW5nVG9OdW1BcnJheShzdHIpIHtcbiAgLy8gcmV0dXJuIHN0ci5zcGxpdCgpLmZvckVhY2goY2hhciA9PiB7XG4gIC8vICAgcmV0dXJuIGNoYXIuY2hhckNvZGVBdCgwKVxuICAvLyB9KVxuICByZXR1cm4gQVAubWFwLmNhbGwoc3RyLCBmdW5jdGlvbihjaGFyKSB7XG4gICAgcmV0dXJuIGNoYXIuY2hhckNvZGVBdCgwKVxuICB9KVxufVxuIiwiaW1wb3J0IHtnZXRNSURJT3V0cHV0QnlJZCwgZ2V0TUlESU91dHB1dHN9IGZyb20gJy4vaW5pdF9taWRpJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtidWZmZXJUaW1lfSBmcm9tICcuL3NldHRpbmdzJyAvLyBtaWxsaXNcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXJ7XG5cbiAgY29uc3RydWN0b3Ioc29uZyl7XG4gICAgdGhpcy5zb25nID0gc29uZ1xuICB9XG5cblxuICBpbml0KG1pbGxpcyl7XG4gICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyA9IG1pbGxpc1xuICAgIHRoaXMuc29uZ1N0YXJ0TWlsbGlzID0gbWlsbGlzXG4gICAgdGhpcy5ldmVudHMgPSB0aGlzLnNvbmcuX2FsbEV2ZW50c1xuICAgIHRoaXMubnVtRXZlbnRzID0gdGhpcy5ldmVudHMubGVuZ3RoXG4gICAgdGhpcy5pbmRleCA9IDBcbiAgICB0aGlzLm1heHRpbWUgPSAwXG4gICAgdGhpcy5wcmV2TWF4dGltZSA9IDBcbiAgICB0aGlzLmJleW9uZExvb3AgPSBmYWxzZSAvLyB0ZWxscyB1cyBpZiB0aGUgcGxheWhlYWQgaGFzIGFscmVhZHkgcGFzc2VkIHRoZSBsb29wZWQgc2VjdGlvblxuICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZ1N0YXJ0TWlsbGlzKVxuICB9XG5cblxuICBzZXRUaW1lU3RhbXAodGltZVN0YW1wKXtcbiAgICB0aGlzLnRpbWVTdGFtcCA9IHRpbWVTdGFtcFxuICB9XG5cbiAgLy8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgZXZlbnQgdGhhdCBoYXMgaXRzIG1pbGxpcyB2YWx1ZSBhdCBvciByaWdodCBhZnRlciB0aGUgcHJvdmlkZWQgbWlsbGlzIHZhbHVlXG4gIHNldEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvcihsZXQgZXZlbnQgb2YgdGhpcy5ldmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgICAgIHRoaXMuaW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gICAgdGhpcy5iZXlvbmRMb29wID0gbWlsbGlzID4gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgdGhpcy5ub3RlcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gZmFsc2VcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKCl7XG4gICAgbGV0IGV2ZW50cyA9IFtdXG5cbiAgICBpZih0aGlzLnNvbmcuX2xvb3AgPT09IHRydWUgJiYgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gPCBidWZmZXJUaW1lKXtcbiAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZ1N0YXJ0TWlsbGlzICsgdGhpcy5zb25nLl9sb29wRHVyYXRpb24gLSAxXG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMubWF4dGltZSwgdGhpcy5zb25nLmxvb3BEdXJhdGlvbik7XG4gICAgfVxuXG4gICAgaWYodGhpcy5zb25nLl9sb29wID09PSB0cnVlKXtcblxuICAgICAgaWYodGhpcy5tYXh0aW1lID49IHRoaXMuc29uZy5fcmlnaHRMb2NhdG9yLm1pbGxpcyAmJiB0aGlzLmJleW9uZExvb3AgPT09IGZhbHNlKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnTE9PUCcsIHRoaXMubWF4dGltZSwgdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzKVxuXG4gICAgICAgIGxldCBkaWZmID0gdGhpcy5tYXh0aW1lIC0gdGhpcy5zb25nLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzICsgZGlmZlxuXG4gICAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tLS1MT09QRUQnLCB0aGlzLm1heHRpbWUsIGRpZmYsIHRoaXMuc29uZy5fbGVmdExvY2F0b3IubWlsbGlzLCB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXMpO1xuXG4gICAgICAgIGlmKHRoaXMubG9vcGVkID09PSBmYWxzZSl7XG4gICAgICAgICAgdGhpcy5sb29wZWQgPSB0cnVlO1xuICAgICAgICAgIGxldCBsZWZ0TWlsbGlzID0gdGhpcy5zb25nLl9sZWZ0TG9jYXRvci5taWxsaXNcbiAgICAgICAgICBsZXQgcmlnaHRNaWxsaXMgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci5taWxsaXNcblxuICAgICAgICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgICAgICAgIGxldCBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHJpZ2h0TWlsbGlzKXtcbiAgICAgICAgICAgICAgZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXNcbiAgICAgICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpXG5cbiAgICAgICAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGVzLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQsIGV2ZW50LnR5cGUpXG4gICAgICAgICAgICAgIHRoaXMuaW5kZXgrK1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gc3RvcCBvdmVyZmxvd2luZyBub3Rlcy0+IGFkZCBhIG5ldyBub3RlIG9mZiBldmVudCBhdCB0aGUgcG9zaXRpb24gb2YgdGhlIHJpZ2h0IGxvY2F0b3IgKGVuZCBvZiB0aGUgbG9vcClcbiAgICAgICAgICBsZXQgZW5kVGlja3MgPSB0aGlzLnNvbmcuX3JpZ2h0TG9jYXRvci50aWNrcyAtIDFcbiAgICAgICAgICBsZXQgZW5kTWlsbGlzID0gdGhpcy5zb25nLmNhbGN1bGF0ZVBvc2l0aW9uKHt0eXBlOiAndGlja3MnLCB0YXJnZXQ6IGVuZFRpY2tzLCByZXN1bHQ6ICdtaWxsaXMnfSkubWlsbGlzXG5cbiAgICAgICAgICBmb3IobGV0IG5vdGUgb2YgdGhpcy5ub3Rlcy52YWx1ZXMoKSl7XG4gICAgICAgICAgICBsZXQgbm90ZU9uID0gbm90ZS5ub3RlT25cbiAgICAgICAgICAgIGxldCBub3RlT2ZmID0gbm90ZS5ub3RlT2ZmXG4gICAgICAgICAgICBpZihub3RlT2ZmLm1pbGxpcyA8PSByaWdodE1pbGxpcyl7XG4gICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZXZlbnQgPSBuZXcgTUlESUV2ZW50KGVuZFRpY2tzLCAxMjgsIG5vdGVPbi5kYXRhMSwgMClcbiAgICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IGVuZE1pbGxpc1xuICAgICAgICAgICAgZXZlbnQuX3BhcnQgPSBub3RlT24uX3BhcnRcbiAgICAgICAgICAgIGV2ZW50Ll90cmFjayA9IG5vdGVPbi5fdHJhY2tcbiAgICAgICAgICAgIGV2ZW50Lm1pZGlOb3RlID0gbm90ZVxuICAgICAgICAgICAgZXZlbnQubWlkaU5vdGVJZCA9IG5vdGUuaWRcbiAgICAgICAgICAgIGV2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdhZGRlZCcsIGV2ZW50KVxuICAgICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgICAgfVxuXG4vKlxuICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgYXVkaW8gc2FtcGxlc1xuICAgICAgICAgIGZvcihpIGluIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHMpe1xuICAgICAgICAgICAgaWYodGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cy5oYXNPd25Qcm9wZXJ0eShpKSl7XG4gICAgICAgICAgICAgIGF1ZGlvRXZlbnQgPSB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzW2ldO1xuICAgICAgICAgICAgICBpZihhdWRpb0V2ZW50LmVuZE1pbGxpcyA+IHRoaXMuc29uZy5sb29wRW5kKXtcbiAgICAgICAgICAgICAgICBhdWRpb0V2ZW50LnN0b3BTYW1wbGUodGhpcy5zb25nLmxvb3BFbmQvMTAwMCk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbaV07XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcHBpbmcgYXVkaW8gZXZlbnQnLCBpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiovXG4gICAgICAgICAgdGhpcy5ub3RlcyA9IG5ldyBNYXAoKVxuICAgICAgICAgIHRoaXMuc2V0SW5kZXgobGVmdE1pbGxpcylcbiAgICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX2xvb3BEdXJhdGlvblxuICAgICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgLT0gdGhpcy5zb25nLl9sb29wRHVyYXRpb25cblxuICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnRzLmxlbmd0aClcblxuICAgICAgICAgIC8vIGdldCB0aGUgYXVkaW8gZXZlbnRzIHRoYXQgc3RhcnQgYmVmb3JlIHNvbmcubG9vcFN0YXJ0XG4gICAgICAgICAgLy90aGlzLmdldERhbmdsaW5nQXVkaW9FdmVudHModGhpcy5zb25nLmxvb3BTdGFydCwgZXZlbnRzKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMubG9vcGVkID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKCdzY2hlZHVsZXInLCB0aGlzLmxvb3BlZClcblxuICAgIC8vIG1haW4gbG9vcFxuICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgIGxldCBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5taWxsaXMsIHRoaXMubWF4dGltZSlcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHRoaXMubWF4dGltZSl7XG5cbiAgICAgICAgLy9ldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydE1pbGxpcztcblxuICAgICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC50aW1lID0gKHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXMpXG4gICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIH1lbHNle1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50cztcbiAgfVxuXG5cbiAgdXBkYXRlKGRpZmYpe1xuICAgIHZhciBpLFxuICAgICAgZXZlbnQsXG4gICAgICBudW1FdmVudHMsXG4gICAgICB0cmFjayxcbiAgICAgIGV2ZW50c1xuXG4gICAgdGhpcy5wcmV2TWF4dGltZSA9IHRoaXMubWF4dGltZVxuXG4gICAgaWYodGhpcy5zb25nLnByZWNvdW50aW5nKXtcbiAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nQ3VycmVudE1pbGxpcyArIGJ1ZmZlclRpbWVcbiAgICAgIGV2ZW50cyA9IHRoaXMuc29uZy5fbWV0cm9ub21lLmdldFByZWNvdW50RXZlbnRzKHRoaXMubWF4dGltZSlcblxuICAgICAgaWYodGhpcy5tYXh0aW1lID4gdGhpcy5zb25nLl9tZXRyb25vbWUuZW5kTWlsbGlzICYmIHRoaXMucHJlY291bnRpbmdEb25lID09PSBmYWxzZSl7XG4gICAgICAgIHRoaXMucHJlY291bnRpbmdEb25lID0gdHJ1ZVxuICAgICAgICB0aGlzLnRpbWVTdGFtcCArPSB0aGlzLnNvbmcuX21ldHJvbm9tZS5wcmVjb3VudER1cmF0aW9uXG5cbiAgICAgICAgLy8gc3RhcnQgc2NoZWR1bGluZyBldmVudHMgb2YgdGhlIHNvbmcgLT4gYWRkIHRoZSBmaXJzdCBldmVudHMgb2YgdGhlIHNvbmdcbiAgICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyA9IHRoaXMuc29uZ1N0YXJ0TWlsbGlzXG4gICAgICAgIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMgKz0gZGlmZlxuICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgYnVmZmVyVGltZVxuICAgICAgICBldmVudHMucHVzaCguLi50aGlzLmdldEV2ZW50cygpKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb25nQ3VycmVudE1pbGxpcyArPSBkaWZmXG4gICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdDdXJyZW50TWlsbGlzICsgYnVmZmVyVGltZVxuICAgICAgZXZlbnRzID0gdGhpcy5nZXRFdmVudHMoKVxuICAgICAgLy9jb25zb2xlLmxvZygnZG9uZScsIHRoaXMuc29uZ0N1cnJlbnRNaWxsaXMsIGRpZmYsIHRoaXMuaW5kZXgsIGV2ZW50cy5sZW5ndGgpXG4gICAgfVxuXG4gICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuXG5cbiAgICAvLyBpZihudW1FdmVudHMgPiA1KXtcbiAgICAvLyAgIGNvbnNvbGUubG9nKG51bUV2ZW50cylcbiAgICAvLyB9XG5cbiAgICBmb3IoaSA9IDA7IGkgPCBudW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IGV2ZW50c1tpXVxuICAgICAgdHJhY2sgPSBldmVudC5fdHJhY2tcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlsbGlzLCB0aGlzLm1heHRpbWUsIHRoaXMucHJldk1heHRpbWUpXG5cbiAgICAgIC8vIGlmKGV2ZW50Lm1pbGxpcyA+IHRoaXMubWF4dGltZSl7XG4gICAgICAvLyAgIC8vIHNraXAgZXZlbnRzIHRoYXQgd2VyZSBoYXJ2ZXN0IGFjY2lkZW50bHkgd2hpbGUganVtcGluZyB0aGUgcGxheWhlYWQgLT4gc2hvdWxkIGhhcHBlbiB2ZXJ5IHJhcmVseSBpZiBldmVyXG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdza2lwJywgZXZlbnQpXG4gICAgICAvLyAgIGNvbnRpbnVlXG4gICAgICAvLyB9XG5cbiAgICAgIGlmKGV2ZW50Ll9wYXJ0Lm11dGVkID09PSB0cnVlIHx8IHRyYWNrLm11dGVkID09PSB0cnVlIHx8IGV2ZW50Lm11dGVkID09PSB0cnVlKXtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvLyB0aGlzIGlzIHVzdWFsbHkgY2F1c2VkIGJ5IHRoZSBzYW1lIG5vdGUgb24gdGhlIHNhbWUgdGlja3MgdmFsdWUsIHdoaWNoIGlzIHByb2JhYmx5IGEgYnVnIGluIHRoZSBtaWRpIGZpbGVcbiAgICAgICAgLy9jb25zb2xlLmluZm8oJ25vIG1pZGlOb3RlSWQnLCBldmVudClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuXG4gICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyBjb252ZXJ0IHRvIHNlY29uZHMgYmVjYXVzZSB0aGUgYXVkaW8gY29udGV4dCB1c2VzIHNlY29uZHMgZm9yIHNjaGVkdWxpbmdcbiAgICAgICAgdHJhY2sucHJvY2Vzc01JRElFdmVudChldmVudCwgdHJ1ZSkgLy8gdHJ1ZSBtZWFuczogdXNlIGxhdGVuY3kgdG8gY29tcGVuc2F0ZSB0aW1pbmcgZm9yIGV4dGVybmFsIE1JREkgZGV2aWNlcywgc2VlIFRyYWNrLnByb2Nlc3NNSURJRXZlbnRcbiAgICAgICAgLy9jb25zb2xlLmxvZyhjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMCwgZXZlbnQudGltZSwgdGhpcy5pbmRleClcbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgICB0aGlzLm5vdGVzLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICAgICAgICB0aGlzLm5vdGVzLmRlbGV0ZShldmVudC5taWRpTm90ZUlkKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5pbmRleCwgdGhpcy5udW1FdmVudHMpXG4gICAgLy9yZXR1cm4gdGhpcy5pbmRleCA+PSAxMFxuICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubnVtRXZlbnRzIC8vIGxhc3QgZXZlbnQgb2Ygc29uZ1xuICB9XG5cbi8qXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgbGV0IHRpbWVTdGFtcCA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwXG4gICAgbGV0IG91dHB1dHMgPSBnZXRNSURJT3V0cHV0cygpXG4gICAgb3V0cHV0cy5mb3JFYWNoKChvdXRwdXQpID0+IHtcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXApIC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgIH0pXG4gIH1cbiovXG59XG5cbiIsIi8vaW1wb3J0IGdtSW5zdHJ1bWVudHMgZnJvbSAnLi9nbV9pbnN0cnVtZW50cydcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRTb25nID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDE2LFxuICBsb3dlc3ROb3RlOiAwLFxuICBoaWdoZXN0Tm90ZTogMTI3LFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIGxvb3A6IGZhbHNlLFxuICBwbGF5YmFja1NwZWVkOiAxLFxuICBhdXRvUXVhbnRpemU6IGZhbHNlXG59XG5cbmV4cG9ydCBsZXQgYnVmZmVyVGltZSA9IDIwMFxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QnVmZmVyVGltZSh0aW1lKXtcbiAgYnVmZmVyVGltZSA9IHRpbWVcbn1cblxuLy9wb3J0ZWQgaGVhcnRiZWF0IGluc3RydW1lbnRzOiBodHRwOi8vZ2l0aHViLmNvbS9hYnVkYWFuL2hlYXJ0YmVhdFxuY29uc3QgaGVhcnRiZWF0SW5zdHJ1bWVudHMgPSBuZXcgTWFwKFtcbiAgWydjaXR5LXBpYW5vJywge1xuICAgIG5hbWU6ICdDaXR5IFBpYW5vIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2l0eSBQaWFubyB1c2VzIHNhbXBsZXMgZnJvbSBhIEJhbGR3aW4gcGlhbm8sIGl0IGhhcyA0IHZlbG9jaXR5IGxheWVyczogMSAtIDQ4LCA0OSAtIDk2LCA5NyAtIDExMCBhbmQgMTEwIC0gMTI3LiBJbiB0b3RhbCBpdCB1c2VzIDQgKiA4OCA9IDM1MiBzYW1wbGVzJyxcbiAgfV0sXG4gIFsnY2l0eS1waWFuby1saWdodCcsIHtcbiAgICBuYW1lOiAnQ2l0eSBQaWFubyBMaWdodCAocGlhbm8pJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NpdHkgUGlhbm8gbGlnaHQgdXNlcyBzYW1wbGVzIGZyb20gYSBCYWxkd2luIHBpYW5vLCBpdCBoYXMgb25seSAxIHZlbG9jaXR5IGxheWVyIGFuZCB1c2VzIDg4IHNhbXBsZXMnLFxuICB9XSxcbiAgWydjay1pY2Vza2F0ZXMnLCB7XG4gICAgbmFtZTogJ0NLIEljZSBTa2F0ZXMgKHN5bnRoKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIERldHVuaXplZCBzYW1wbGVzJyxcbiAgfV0sXG4gIFsnc2hrLXNxdWFyZXJvb3QnLCB7XG4gICAgbmFtZTogJ1NISyBzcXVhcmVyb290IChzeW50aCknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3Job2RlcycsIHtcbiAgICBuYW1lOiAnUmhvZGVzIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBGcmVlc291bmQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3Job2RlczInLCB7XG4gICAgbmFtZTogJ1Job2RlcyAyIChwaWFubyknLFxuICAgIGRlc2NyaXB0aW9uOiAndXNlcyBEZXR1bml6ZWQgc2FtcGxlcycsXG4gIH1dLFxuICBbJ3RydW1wZXQnLCB7XG4gICAgbmFtZTogJ1RydW1wZXQgKGJyYXNzKScsXG4gICAgZGVzY3JpcHRpb246ICd1c2VzIFNTTyBzYW1wbGVzJyxcbiAgfV0sXG4gIFsndmlvbGluJywge1xuICAgIG5hbWU6ICdWaW9saW4gKHN0cmluZ3MpJyxcbiAgICBkZXNjcmlwdGlvbjogJ3VzZXMgU1NPIHNhbXBsZXMnLFxuICB9XVxuXSlcbmV4cG9ydCBjb25zdCBnZXRJbnN0cnVtZW50cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBoZWFydGJlYXRJbnN0cnVtZW50c1xufVxuXG4vLyBnbSBzb3VuZHMgZXhwb3J0ZWQgZnJvbSBGbHVpZFN5bnRoIGJ5IEJlbmphbWluIEdsZWl0em1hbjogaHR0cHM6Ly9naXRodWIuY29tL2dsZWl0ei9taWRpLWpzLXNvdW5kZm9udHNcbmNvbnN0IGdtSW5zdHJ1bWVudHMgPSB7XCJhY291c3RpY19ncmFuZF9waWFub1wiOntcIm5hbWVcIjpcIjEgQWNvdXN0aWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJyaWdodF9hY291c3RpY19waWFub1wiOntcIm5hbWVcIjpcIjIgQnJpZ2h0IEFjb3VzdGljIFBpYW5vIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ncmFuZF9waWFub1wiOntcIm5hbWVcIjpcIjMgRWxlY3RyaWMgR3JhbmQgUGlhbm8gKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhvbmt5dG9ua19waWFub1wiOntcIm5hbWVcIjpcIjQgSG9ua3ktdG9uayBQaWFubyAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfcGlhbm9fMVwiOntcIm5hbWVcIjpcIjUgRWxlY3RyaWMgUGlhbm8gMSAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfcGlhbm9fMlwiOntcIm5hbWVcIjpcIjYgRWxlY3RyaWMgUGlhbm8gMiAocGlhbm8pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiaGFycHNpY2hvcmRcIjp7XCJuYW1lXCI6XCI3IEhhcnBzaWNob3JkIChwaWFubylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjbGF2aW5ldFwiOntcIm5hbWVcIjpcIjggQ2xhdmluZXQgKHBpYW5vKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNlbGVzdGFcIjp7XCJuYW1lXCI6XCI5IENlbGVzdGEgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ2xvY2tlbnNwaWVsXCI6e1wibmFtZVwiOlwiMTAgR2xvY2tlbnNwaWVsIChjaHJvbWF0aWNwZXJjdXNzaW9uKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm11c2ljX2JveFwiOntcIm5hbWVcIjpcIjExIE11c2ljIEJveCAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2aWJyYXBob25lXCI6e1wibmFtZVwiOlwiMTIgVmlicmFwaG9uZSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJtYXJpbWJhXCI6e1wibmFtZVwiOlwiMTMgTWFyaW1iYSAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ4eWxvcGhvbmVcIjp7XCJuYW1lXCI6XCIxNCBYeWxvcGhvbmUgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidHVidWxhcl9iZWxsc1wiOntcIm5hbWVcIjpcIjE1IFR1YnVsYXIgQmVsbHMgKGNocm9tYXRpY3BlcmN1c3Npb24pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZHVsY2ltZXJcIjp7XCJuYW1lXCI6XCIxNiBEdWxjaW1lciAoY2hyb21hdGljcGVyY3Vzc2lvbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJkcmF3YmFyX29yZ2FuXCI6e1wibmFtZVwiOlwiMTcgRHJhd2JhciBPcmdhbiAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGVyY3Vzc2l2ZV9vcmdhblwiOntcIm5hbWVcIjpcIjE4IFBlcmN1c3NpdmUgT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJvY2tfb3JnYW5cIjp7XCJuYW1lXCI6XCIxOSBSb2NrIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjaHVyY2hfb3JnYW5cIjp7XCJuYW1lXCI6XCIyMCBDaHVyY2ggT3JnYW4gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJlZWRfb3JnYW5cIjp7XCJuYW1lXCI6XCIyMSBSZWVkIE9yZ2FuIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY2NvcmRpb25cIjp7XCJuYW1lXCI6XCIyMiBBY2NvcmRpb24gKG9yZ2FuKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhhcm1vbmljYVwiOntcIm5hbWVcIjpcIjIzIEhhcm1vbmljYSAob3JnYW4pXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGFuZ29fYWNjb3JkaW9uXCI6e1wibmFtZVwiOlwiMjQgVGFuZ28gQWNjb3JkaW9uIChvcmdhbilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY291c3RpY19ndWl0YXJfbnlsb25cIjp7XCJuYW1lXCI6XCIyNSBBY291c3RpYyBHdWl0YXIgKG55bG9uKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFjb3VzdGljX2d1aXRhcl9zdGVlbFwiOntcIm5hbWVcIjpcIjI2IEFjb3VzdGljIEd1aXRhciAoc3RlZWwpIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfZ3VpdGFyX2phenpcIjp7XCJuYW1lXCI6XCIyNyBFbGVjdHJpYyBHdWl0YXIgKGphenopIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfZ3VpdGFyX2NsZWFuXCI6e1wibmFtZVwiOlwiMjggRWxlY3RyaWMgR3VpdGFyIChjbGVhbikgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19ndWl0YXJfbXV0ZWRcIjp7XCJuYW1lXCI6XCIyOSBFbGVjdHJpYyBHdWl0YXIgKG11dGVkKSAoZ3VpdGFyKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm92ZXJkcml2ZW5fZ3VpdGFyXCI6e1wibmFtZVwiOlwiMzAgT3ZlcmRyaXZlbiBHdWl0YXIgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJkaXN0b3J0aW9uX2d1aXRhclwiOntcIm5hbWVcIjpcIjMxIERpc3RvcnRpb24gR3VpdGFyIChndWl0YXIpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3VpdGFyX2hhcm1vbmljc1wiOntcIm5hbWVcIjpcIjMyIEd1aXRhciBIYXJtb25pY3MgKGd1aXRhcilcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJhY291c3RpY19iYXNzXCI6e1wibmFtZVwiOlwiMzMgQWNvdXN0aWMgQmFzcyAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJlbGVjdHJpY19iYXNzX2ZpbmdlclwiOntcIm5hbWVcIjpcIjM0IEVsZWN0cmljIEJhc3MgKGZpbmdlcikgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZWxlY3RyaWNfYmFzc19waWNrXCI6e1wibmFtZVwiOlwiMzUgRWxlY3RyaWMgQmFzcyAocGljaykgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnJldGxlc3NfYmFzc1wiOntcIm5hbWVcIjpcIjM2IEZyZXRsZXNzIEJhc3MgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2xhcF9iYXNzXzFcIjp7XCJuYW1lXCI6XCIzNyBTbGFwIEJhc3MgMSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzbGFwX2Jhc3NfMlwiOntcIm5hbWVcIjpcIjM4IFNsYXAgQmFzcyAyIChiYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInN5bnRoX2Jhc3NfMVwiOntcIm5hbWVcIjpcIjM5IFN5bnRoIEJhc3MgMSAoYmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9iYXNzXzJcIjp7XCJuYW1lXCI6XCI0MCBTeW50aCBCYXNzIDIgKGJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidmlvbGluXCI6e1wibmFtZVwiOlwiNDEgVmlvbGluIChzdHJpbmdzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInZpb2xhXCI6e1wibmFtZVwiOlwiNDIgVmlvbGEgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiY2VsbG9cIjp7XCJuYW1lXCI6XCI0MyBDZWxsbyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjb250cmFiYXNzXCI6e1wibmFtZVwiOlwiNDQgQ29udHJhYmFzcyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0cmVtb2xvX3N0cmluZ3NcIjp7XCJuYW1lXCI6XCI0NSBUcmVtb2xvIFN0cmluZ3MgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGl6emljYXRvX3N0cmluZ3NcIjp7XCJuYW1lXCI6XCI0NiBQaXp6aWNhdG8gU3RyaW5ncyAoc3RyaW5ncylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJvcmNoZXN0cmFsX2hhcnBcIjp7XCJuYW1lXCI6XCI0NyBPcmNoZXN0cmFsIEhhcnAgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGltcGFuaVwiOntcIm5hbWVcIjpcIjQ4IFRpbXBhbmkgKHN0cmluZ3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RyaW5nX2Vuc2VtYmxlXzFcIjp7XCJuYW1lXCI6XCI0OSBTdHJpbmcgRW5zZW1ibGUgMSAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RyaW5nX2Vuc2VtYmxlXzJcIjp7XCJuYW1lXCI6XCI1MCBTdHJpbmcgRW5zZW1ibGUgMiAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfc3RyaW5nc18xXCI6e1wibmFtZVwiOlwiNTEgU3ludGggU3RyaW5ncyAxIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9zdHJpbmdzXzJcIjp7XCJuYW1lXCI6XCI1MiBTeW50aCBTdHJpbmdzIDIgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImNob2lyX2FhaHNcIjp7XCJuYW1lXCI6XCI1MyBDaG9pciBBYWhzIChlbnNlbWJsZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ2b2ljZV9vb2hzXCI6e1wibmFtZVwiOlwiNTQgVm9pY2UgT29ocyAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfY2hvaXJcIjp7XCJuYW1lXCI6XCI1NSBTeW50aCBDaG9pciAoZW5zZW1ibGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwib3JjaGVzdHJhX2hpdFwiOntcIm5hbWVcIjpcIjU2IE9yY2hlc3RyYSBIaXQgKGVuc2VtYmxlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInRydW1wZXRcIjp7XCJuYW1lXCI6XCI1NyBUcnVtcGV0IChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0cm9tYm9uZVwiOntcIm5hbWVcIjpcIjU4IFRyb21ib25lIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0dWJhXCI6e1wibmFtZVwiOlwiNTkgVHViYSAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibXV0ZWRfdHJ1bXBldFwiOntcIm5hbWVcIjpcIjYwIE11dGVkIFRydW1wZXQgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZyZW5jaF9ob3JuXCI6e1wibmFtZVwiOlwiNjEgRnJlbmNoIEhvcm4gKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJyYXNzX3NlY3Rpb25cIjp7XCJuYW1lXCI6XCI2MiBCcmFzcyBTZWN0aW9uIChicmFzcylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzeW50aF9icmFzc18xXCI6e1wibmFtZVwiOlwiNjMgU3ludGggQnJhc3MgMSAoYnJhc3MpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfYnJhc3NfMlwiOntcIm5hbWVcIjpcIjY0IFN5bnRoIEJyYXNzIDIgKGJyYXNzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNvcHJhbm9fc2F4XCI6e1wibmFtZVwiOlwiNjUgU29wcmFubyBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWx0b19zYXhcIjp7XCJuYW1lXCI6XCI2NiBBbHRvIFNheCAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0ZW5vcl9zYXhcIjp7XCJuYW1lXCI6XCI2NyBUZW5vciBTYXggKHJlZWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFyaXRvbmVfc2F4XCI6e1wibmFtZVwiOlwiNjggQmFyaXRvbmUgU2F4IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9ib2VcIjp7XCJuYW1lXCI6XCI2OSBPYm9lIChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImVuZ2xpc2hfaG9yblwiOntcIm5hbWVcIjpcIjcwIEVuZ2xpc2ggSG9ybiAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiYXNzb29uXCI6e1wibmFtZVwiOlwiNzEgQmFzc29vbiAocmVlZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJjbGFyaW5ldFwiOntcIm5hbWVcIjpcIjcyIENsYXJpbmV0IChyZWVkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBpY2NvbG9cIjp7XCJuYW1lXCI6XCI3MyBQaWNjb2xvIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZsdXRlXCI6e1wibmFtZVwiOlwiNzQgRmx1dGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicmVjb3JkZXJcIjp7XCJuYW1lXCI6XCI3NSBSZWNvcmRlciAocGlwZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYW5fZmx1dGVcIjp7XCJuYW1lXCI6XCI3NiBQYW4gRmx1dGUgKHBpcGUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmxvd25fYm90dGxlXCI6e1wibmFtZVwiOlwiNzcgQmxvd24gQm90dGxlIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNoYWt1aGFjaGlcIjp7XCJuYW1lXCI6XCI3OCBTaGFrdWhhY2hpIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIndoaXN0bGVcIjp7XCJuYW1lXCI6XCI3OSBXaGlzdGxlIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcIm9jYXJpbmFcIjp7XCJuYW1lXCI6XCI4MCBPY2FyaW5hIChwaXBlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfMV9zcXVhcmVcIjp7XCJuYW1lXCI6XCI4MSBMZWFkIDEgKHNxdWFyZSkgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzJfc2F3dG9vdGhcIjp7XCJuYW1lXCI6XCI4MiBMZWFkIDIgKHNhd3Rvb3RoKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfM19jYWxsaW9wZVwiOntcIm5hbWVcIjpcIjgzIExlYWQgMyAoY2FsbGlvcGUpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibGVhZF80X2NoaWZmXCI6e1wibmFtZVwiOlwiODQgTGVhZCA0IChjaGlmZikgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzVfY2hhcmFuZ1wiOntcIm5hbWVcIjpcIjg1IExlYWQgNSAoY2hhcmFuZykgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzZfdm9pY2VcIjp7XCJuYW1lXCI6XCI4NiBMZWFkIDYgKHZvaWNlKSAoc3ludGhsZWFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImxlYWRfN19maWZ0aHNcIjp7XCJuYW1lXCI6XCI4NyBMZWFkIDcgKGZpZnRocykgKHN5bnRobGVhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJsZWFkXzhfYmFzc19fbGVhZFwiOntcIm5hbWVcIjpcIjg4IExlYWQgOCAoYmFzcyArIGxlYWQpIChzeW50aGxlYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzFfbmV3X2FnZVwiOntcIm5hbWVcIjpcIjg5IFBhZCAxIChuZXcgYWdlKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzJfd2FybVwiOntcIm5hbWVcIjpcIjkwIFBhZCAyICh3YXJtKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzNfcG9seXN5bnRoXCI6e1wibmFtZVwiOlwiOTEgUGFkIDMgKHBvbHlzeW50aCkgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF80X2Nob2lyXCI6e1wibmFtZVwiOlwiOTIgUGFkIDQgKGNob2lyKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwicGFkXzVfYm93ZWRcIjp7XCJuYW1lXCI6XCI5MyBQYWQgNSAoYm93ZWQpIChzeW50aHBhZClcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJwYWRfNl9tZXRhbGxpY1wiOntcIm5hbWVcIjpcIjk0IFBhZCA2IChtZXRhbGxpYykgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF83X2hhbG9cIjp7XCJuYW1lXCI6XCI5NSBQYWQgNyAoaGFsbykgKHN5bnRocGFkKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInBhZF84X3N3ZWVwXCI6e1wibmFtZVwiOlwiOTYgUGFkIDggKHN3ZWVwKSAoc3ludGhwYWQpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfMV9yYWluXCI6e1wibmFtZVwiOlwiOTcgRlggMSAocmFpbikgKHN5bnRoZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJmeF8yX3NvdW5kdHJhY2tcIjp7XCJuYW1lXCI6XCI5OCBGWCAyIChzb3VuZHRyYWNrKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4XzNfY3J5c3RhbFwiOntcIm5hbWVcIjpcIjk5IEZYIDMgKGNyeXN0YWwpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNF9hdG1vc3BoZXJlXCI6e1wibmFtZVwiOlwiMTAwIEZYIDQgKGF0bW9zcGhlcmUpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNV9icmlnaHRuZXNzXCI6e1wibmFtZVwiOlwiMTAxIEZYIDUgKGJyaWdodG5lc3MpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfNl9nb2JsaW5zXCI6e1wibmFtZVwiOlwiMTAyIEZYIDYgKGdvYmxpbnMpIChzeW50aGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZnhfN19lY2hvZXNcIjp7XCJuYW1lXCI6XCIxMDMgRlggNyAoZWNob2VzKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZ4Xzhfc2NpZmlcIjp7XCJuYW1lXCI6XCIxMDQgRlggOCAoc2NpLWZpKSAoc3ludGhlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInNpdGFyXCI6e1wibmFtZVwiOlwiMTA1IFNpdGFyIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYmFuam9cIjp7XCJuYW1lXCI6XCIxMDYgQmFuam8gKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzaGFtaXNlblwiOntcIm5hbWVcIjpcIjEwNyBTaGFtaXNlbiAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImtvdG9cIjp7XCJuYW1lXCI6XCIxMDggS290byAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImthbGltYmFcIjp7XCJuYW1lXCI6XCIxMDkgS2FsaW1iYSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImJhZ3BpcGVcIjp7XCJuYW1lXCI6XCIxMTAgQmFncGlwZSAoZXRobmljKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImZpZGRsZVwiOntcIm5hbWVcIjpcIjExMSBGaWRkbGUgKGV0aG5pYylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJzaGFuYWlcIjp7XCJuYW1lXCI6XCIxMTIgU2hhbmFpIChldGhuaWMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwidGlua2xlX2JlbGxcIjp7XCJuYW1lXCI6XCIxMTMgVGlua2xlIEJlbGwgKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiYWdvZ29cIjp7XCJuYW1lXCI6XCIxMTQgQWdvZ28gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3RlZWxfZHJ1bXNcIjp7XCJuYW1lXCI6XCIxMTUgU3RlZWwgRHJ1bXMgKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwid29vZGJsb2NrXCI6e1wibmFtZVwiOlwiMTE2IFdvb2RibG9jayAocGVyY3Vzc2l2ZSlcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0YWlrb19kcnVtXCI6e1wibmFtZVwiOlwiMTE3IFRhaWtvIERydW0gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwibWVsb2RpY190b21cIjp7XCJuYW1lXCI6XCIxMTggTWVsb2RpYyBUb20gKHBlcmN1c3NpdmUpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic3ludGhfZHJ1bVwiOntcIm5hbWVcIjpcIjExOSBTeW50aCBEcnVtIChwZXJjdXNzaXZlKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcInJldmVyc2VfY3ltYmFsXCI6e1wibmFtZVwiOlwiMTIwIFJldmVyc2UgQ3ltYmFsIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3VpdGFyX2ZyZXRfbm9pc2VcIjp7XCJuYW1lXCI6XCIxMjEgR3VpdGFyIEZyZXQgTm9pc2UgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJicmVhdGhfbm9pc2VcIjp7XCJuYW1lXCI6XCIxMjIgQnJlYXRoIE5vaXNlIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwic2Vhc2hvcmVcIjp7XCJuYW1lXCI6XCIxMjMgU2Vhc2hvcmUgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJiaXJkX3R3ZWV0XCI6e1wibmFtZVwiOlwiMTI0IEJpcmQgVHdlZXQgKHNvdW5kZWZmZWN0cylcIixcImRlc2NyaXB0aW9uXCI6XCJGbHVpZHN5bnRoIHNhbXBsZXNcIn0sXCJ0ZWxlcGhvbmVfcmluZ1wiOntcIm5hbWVcIjpcIjEyNSBUZWxlcGhvbmUgUmluZyAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImhlbGljb3B0ZXJcIjp7XCJuYW1lXCI6XCIxMjYgSGVsaWNvcHRlciAoc291bmRlZmZlY3RzKVwiLFwiZGVzY3JpcHRpb25cIjpcIkZsdWlkc3ludGggc2FtcGxlc1wifSxcImFwcGxhdXNlXCI6e1wibmFtZVwiOlwiMTI3IEFwcGxhdXNlIChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9LFwiZ3Vuc2hvdFwiOntcIm5hbWVcIjpcIjEyOCBHdW5zaG90IChzb3VuZGVmZmVjdHMpXCIsXCJkZXNjcmlwdGlvblwiOlwiRmx1aWRzeW50aCBzYW1wbGVzXCJ9fVxubGV0IGdtTWFwID0gbmV3IE1hcCgpXG5PYmplY3Qua2V5cyhnbUluc3RydW1lbnRzKS5mb3JFYWNoKGtleSA9PiB7XG4gIGdtTWFwLnNldChrZXksIGdtSW5zdHJ1bWVudHNba2V5XSlcbn0pXG5leHBvcnQgY29uc3QgZ2V0R01JbnN0cnVtZW50cyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBnbU1hcFxufVxuIiwiLy9AIGZsb3dcblxuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQge3BhcnNlVGltZUV2ZW50cywgcGFyc2VFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuLy9pbXBvcnQge2FkZFRhc2ssIHJlbW92ZVRhc2t9IGZyb20gJy4vaGVhcnRiZWF0J1xuaW1wb3J0IHtjb250ZXh0LCBtYXN0ZXJHYWlufSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQgU2NoZWR1bGVyIGZyb20gJy4vc2NoZWR1bGVyJ1xuaW1wb3J0IHtNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7c29uZ0Zyb21NSURJRmlsZSwgc29uZ0Zyb21NSURJRmlsZUFzeW5jfSBmcm9tICcuL3NvbmdfZnJvbV9taWRpZmlsZSdcbmltcG9ydCB7c29ydEV2ZW50c30gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtjYWxjdWxhdGVQb3NpdGlvbn0gZnJvbSAnLi9wb3NpdGlvbidcbmltcG9ydCB7UGxheWhlYWR9IGZyb20gJy4vcGxheWhlYWQnXG5pbXBvcnQge01ldHJvbm9tZX0gZnJvbSAnLi9tZXRyb25vbWUnXG5pbXBvcnQge2FkZEV2ZW50TGlzdGVuZXIsIHJlbW92ZUV2ZW50TGlzdGVuZXIsIGRpc3BhdGNoRXZlbnR9IGZyb20gJy4vZXZlbnRsaXN0ZW5lcidcbmltcG9ydCB7ZGVmYXVsdFNvbmd9IGZyb20gJy4vc2V0dGluZ3MnXG5pbXBvcnQge3NhdmVBc01JRElGaWxlfSBmcm9tICcuL3NhdmVfbWlkaWZpbGUnXG5cbmxldCBzb25nSW5kZXggPSAwXG5sZXQgcmVjb3JkaW5nSW5kZXggPSAwXG5cblxuLypcbnR5cGUgc29uZ1NldHRpbmdzID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIHBwcTogbnVtYmVyLFxuICBicG06IG51bWJlcixcbiAgYmFyczogbnVtYmVyLFxuICBsb3dlc3ROb3RlOiBudW1iZXIsXG4gIGhpZ2hlc3ROb3RlOiBudW1iZXIsXG4gIG5vbWluYXRvcjogbnVtYmVyLFxuICBkZW5vbWluYXRvcjogbnVtYmVyLFxuICBxdWFudGl6ZVZhbHVlOiBudW1iZXIsXG4gIGZpeGVkTGVuZ3RoVmFsdWU6IG51bWJlcixcbiAgcG9zaXRpb25UeXBlOiBzdHJpbmcsXG4gIHVzZU1ldHJvbm9tZTogYm9vbGVhbixcbiAgYXV0b1NpemU6IGJvb2xlYW4sXG4gIGxvb3A6IGJvb2xlYW4sXG4gIHBsYXliYWNrU3BlZWQ6IG51bWJlcixcbiAgYXV0b1F1YW50aXplOiBib29sZWFuXG59XG4qL1xuXG5leHBvcnQgY2xhc3MgU29uZ3tcblxuICBzdGF0aWMgZnJvbU1JRElGaWxlKGRhdGEpe1xuICAgIHJldHVybiBzb25nRnJvbU1JRElGaWxlKGRhdGEpXG4gIH1cblxuICBzdGF0aWMgZnJvbU1JRElGaWxlQXN5bmMoZGF0YSl7XG4gICAgcmV0dXJuIHNvbmdGcm9tTUlESUZpbGVBc3luYyhkYXRhKVxuICB9XG5cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3M6IHt9ID0ge30pe1xuXG4gICAgdGhpcy5pZCA9IGBTXyR7c29uZ0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YDtcblxuICAgICh7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUgPSB0aGlzLmlkLFxuICAgICAgcHBxOiB0aGlzLnBwcSA9IGRlZmF1bHRTb25nLnBwcSxcbiAgICAgIGJwbTogdGhpcy5icG0gPSBkZWZhdWx0U29uZy5icG0sXG4gICAgICBiYXJzOiB0aGlzLmJhcnMgPSBkZWZhdWx0U29uZy5iYXJzLFxuICAgICAgbm9taW5hdG9yOiB0aGlzLm5vbWluYXRvciA9IGRlZmF1bHRTb25nLm5vbWluYXRvcixcbiAgICAgIGRlbm9taW5hdG9yOiB0aGlzLmRlbm9taW5hdG9yID0gZGVmYXVsdFNvbmcuZGVub21pbmF0b3IsXG4gICAgICBxdWFudGl6ZVZhbHVlOiB0aGlzLnF1YW50aXplVmFsdWUgPSBkZWZhdWx0U29uZy5xdWFudGl6ZVZhbHVlLFxuICAgICAgZml4ZWRMZW5ndGhWYWx1ZTogdGhpcy5maXhlZExlbmd0aFZhbHVlID0gZGVmYXVsdFNvbmcuZml4ZWRMZW5ndGhWYWx1ZSxcbiAgICAgIHVzZU1ldHJvbm9tZTogdGhpcy51c2VNZXRyb25vbWUgPSBkZWZhdWx0U29uZy51c2VNZXRyb25vbWUsXG4gICAgICBhdXRvU2l6ZTogdGhpcy5hdXRvU2l6ZSA9IGRlZmF1bHRTb25nLmF1dG9TaXplLFxuICAgICAgbG9vcDogdGhpcy5sb29wID0gZGVmYXVsdFNvbmcubG9vcCxcbiAgICAgIHBsYXliYWNrU3BlZWQ6IHRoaXMucGxheWJhY2tTcGVlZCA9IGRlZmF1bHRTb25nLnBsYXliYWNrU3BlZWQsXG4gICAgICBhdXRvUXVhbnRpemU6IHRoaXMuYXV0b1F1YW50aXplID0gZGVmYXVsdFNvbmcuYXV0b1F1YW50aXplLFxuICAgIH0gPSBzZXR0aW5ncyk7XG5cbiAgICB0aGlzLl90aW1lRXZlbnRzID0gW1xuICAgICAgbmV3IE1JRElFdmVudCgwLCBNSURJRXZlbnRUeXBlcy5URU1QTywgdGhpcy5icG0pLFxuICAgICAgbmV3IE1JRElFdmVudCgwLCBNSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSwgdGhpcy5ub21pbmF0b3IsIHRoaXMuZGVub21pbmF0b3IpLFxuICAgIF1cblxuICAgIC8vdGhpcy5fdGltZUV2ZW50cyA9IFtdXG4gICAgdGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9IHRydWVcbiAgICB0aGlzLl9sYXN0RXZlbnQgPSBuZXcgTUlESUV2ZW50KDAsIE1JRElFdmVudFR5cGVzLkVORF9PRl9UUkFDSylcblxuICAgIHRoaXMuX3RyYWNrcyA9IFtdXG4gICAgdGhpcy5fdHJhY2tzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fZXZlbnRzID0gW11cbiAgICB0aGlzLl9ldmVudHNCeUlkID0gbmV3IE1hcCgpXG5cbiAgICB0aGlzLl9hbGxFdmVudHMgPSBbXSAvLyBNSURJIGV2ZW50cyBhbmQgbWV0cm9ub21lIGV2ZW50c1xuXG4gICAgdGhpcy5fbm90ZXMgPSBbXVxuICAgIHRoaXMuX25vdGVzQnlJZCA9IG5ldyBNYXAoKVxuXG4gICAgdGhpcy5fbmV3RXZlbnRzID0gW11cbiAgICB0aGlzLl9tb3ZlZEV2ZW50cyA9IFtdXG4gICAgdGhpcy5fcmVtb3ZlZEV2ZW50cyA9IFtdXG4gICAgdGhpcy5fdHJhbnNwb3NlZEV2ZW50cyA9IFtdXG5cbiAgICB0aGlzLl9uZXdQYXJ0cyA9IFtdXG4gICAgdGhpcy5fY2hhbmdlZFBhcnRzID0gW11cbiAgICB0aGlzLl9yZW1vdmVkUGFydHMgPSBbXVxuXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDBcbiAgICB0aGlzLl9zY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKHRoaXMpXG4gICAgdGhpcy5fcGxheWhlYWQgPSBuZXcgUGxheWhlYWQodGhpcylcblxuICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZVxuICAgIHRoaXMucmVjb3JkaW5nID0gZmFsc2VcbiAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2VcbiAgICB0aGlzLnN0b3BwZWQgPSB0cnVlXG5cbiAgICB0aGlzLnZvbHVtZSA9IDAuNVxuICAgIHRoaXMuX291dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5fb3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuX291dHB1dC5jb25uZWN0KG1hc3RlckdhaW4pXG5cbiAgICB0aGlzLl9tZXRyb25vbWUgPSBuZXcgTWV0cm9ub21lKHRoaXMpXG4gICAgdGhpcy5fbWV0cm9ub21lRXZlbnRzID0gW11cbiAgICB0aGlzLl91cGRhdGVNZXRyb25vbWVFdmVudHMgPSB0cnVlXG4gICAgdGhpcy5fbWV0cm9ub21lLm11dGUoIXRoaXMudXNlTWV0cm9ub21lKVxuXG4gICAgdGhpcy5fbG9vcCA9IGZhbHNlXG4gICAgdGhpcy5fbGVmdExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB7bWlsbGlzOiAwLCB0aWNrczogMH1cbiAgICB0aGlzLl9pbGxlZ2FsTG9vcCA9IGZhbHNlXG4gICAgdGhpcy5fbG9vcER1cmF0aW9uID0gMFxuICAgIHRoaXMuX3ByZWNvdW50QmFycyA9IDBcbiAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cblxuXG4gIGFkZFRpbWVFdmVudHMoLi4uZXZlbnRzKXtcbiAgICAvL0BUT0RPOiBmaWx0ZXIgdGltZSBldmVudHMgb24gdGhlIHNhbWUgdGljayAtPiB1c2UgdGhlIGxhc3RseSBhZGRlZCBldmVudHNcbiAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBpZihldmVudC50eXBlID09PSBNSURJRXZlbnRUeXBlcy5USU1FX1NJR05BVFVSRSl7XG4gICAgICAgIHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyA9IHRydWVcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RpbWVFdmVudHMucHVzaChldmVudClcbiAgICB9KVxuICAgIHRoaXMuX3VwZGF0ZVRpbWVFdmVudHMgPSB0cnVlXG4gIH1cblxuICBhZGRUcmFja3MoLi4udHJhY2tzKXtcbiAgICB0cmFja3MuZm9yRWFjaCgodHJhY2spID0+IHtcbiAgICAgIHRyYWNrLl9zb25nID0gdGhpc1xuICAgICAgdHJhY2suY29ubmVjdCh0aGlzLl9vdXRwdXQpXG4gICAgICB0aGlzLl90cmFja3MucHVzaCh0cmFjaylcbiAgICAgIHRoaXMuX3RyYWNrc0J5SWQuc2V0KHRyYWNrLmlkLCB0cmFjaylcbiAgICAgIHRoaXMuX25ld0V2ZW50cy5wdXNoKC4uLnRyYWNrLl9ldmVudHMpXG4gICAgICB0aGlzLl9uZXdQYXJ0cy5wdXNoKC4uLnRyYWNrLl9wYXJ0cylcbiAgICB9KVxuICB9XG5cbiAgLy8gcHJlcGFyZSBzb25nIGV2ZW50cyBmb3IgcGxheWJhY2tcbiAgdXBkYXRlKCk6IHZvaWR7XG5cbiAgICBsZXQgY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG5cbiAgICBpZih0aGlzLl91cGRhdGVUaW1lRXZlbnRzID09PSBmYWxzZVxuICAgICAgJiYgdGhpcy5fcmVtb3ZlZEV2ZW50cy5sZW5ndGggPT09IDBcbiAgICAgICYmIHRoaXMuX25ld0V2ZW50cy5sZW5ndGggPT09IDBcbiAgICAgICYmIHRoaXMuX21vdmVkRXZlbnRzLmxlbmd0aCA9PT0gMFxuICAgICAgJiYgdGhpcy5fbmV3UGFydHMubGVuZ3RoID09PSAwXG4gICAgICAmJiB0aGlzLl9yZW1vdmVkUGFydHMubGVuZ3RoID09PSAwXG4gICAgKXtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvL2RlYnVnXG4gICAgLy90aGlzLmlzUGxheWluZyA9IHRydWVcblxuICAgIGNvbnNvbGUuZ3JvdXAoJ3VwZGF0ZSBzb25nJylcbiAgICBjb25zb2xlLnRpbWUoJ3RvdGFsJylcblxuICAgIC8vIGNoZWNrIGlmIHRpbWUgZXZlbnRzIGFyZSB1cGRhdGVkXG4gICAgaWYodGhpcy5fdXBkYXRlVGltZUV2ZW50cyA9PT0gdHJ1ZSl7XG4gICAgICAvL2NvbnNvbGUubG9nKCd1cGRhdGVUaW1lRXZlbnRzJywgdGhpcy5fdGltZUV2ZW50cy5sZW5ndGgpXG4gICAgICBwYXJzZVRpbWVFdmVudHModGhpcywgdGhpcy5fdGltZUV2ZW50cywgdGhpcy5pc1BsYXlpbmcpXG4gICAgICB0aGlzLl91cGRhdGVUaW1lRXZlbnRzID0gZmFsc2VcbiAgICAgIGNvbnNvbGUubG9nKCd0aW1lIGV2ZW50cyAlTycsIHRoaXMuX3RpbWVFdmVudHMpXG4gICAgfVxuXG4gICAgLy8gb25seSBwYXJzZSBuZXcgYW5kIG1vdmVkIGV2ZW50c1xuICAgIGxldCB0b2JlUGFyc2VkID0gW11cblxuXG4gICAgLy8gZmlsdGVyIHJlbW92ZWQgcGFydHNcbiAgICBjb25zb2xlLmxvZygncmVtb3ZlZCBwYXJ0cyAlTycsIHRoaXMuX3JlbW92ZWRQYXJ0cylcbiAgICB0aGlzLl9yZW1vdmVkUGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgdGhpcy5fcGFydHNCeUlkLmRlbGV0ZShwYXJ0LmlkKVxuICAgICAgdGhpcy5fcmVtb3ZlZEV2ZW50cy5wdXNoKC4uLnBhcnQuX2V2ZW50cylcbiAgICB9KVxuXG5cbiAgICAvLyBhZGQgbmV3IHBhcnRzXG4gICAgY29uc29sZS5sb2coJ25ldyBwYXJ0cyAlTycsIHRoaXMuX25ld1BhcnRzKVxuICAgIHRoaXMuX25ld1BhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIHBhcnQuX3NvbmcgPSB0aGlzXG4gICAgICB0aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpXG4gICAgICAvL3RoaXMuX25ld0V2ZW50cy5wdXNoKC4uLnBhcnQuX2V2ZW50cylcbiAgICAgIHBhcnQudXBkYXRlKClcbiAgICB9KVxuXG5cbiAgICAvLyB1cGRhdGUgY2hhbmdlZCBwYXJ0c1xuICAgIGNvbnNvbGUubG9nKCdjaGFuZ2VkIHBhcnRzICVPJywgdGhpcy5fY2hhbmdlZFBhcnRzKVxuICAgIHRoaXMuX2NoYW5nZWRQYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0LnVwZGF0ZSgpXG4gICAgfSlcblxuICAgIC8vIHJlbW92ZSBldmVudHMgZnJvbSByZW1vdmVkIHBhcnRzXG4gICAgY29uc29sZS5sb2coJ2NoYW5nZWQgcGFydHMgJU8nLCB0aGlzLl9jaGFuZ2VkUGFydHMpXG4gICAgdGhpcy5fcmVtb3ZlZFBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIHRoaXMuX3JlbW92ZWRFdmVudHMucHVzaCguLi5wYXJ0Ll9ldmVudHMpXG4gICAgICB0aGlzLl9wYXJ0c0J5SWQuZGVsZXRlKHBhcnQuaWQpXG4gICAgICBwYXJ0LnVwZGF0ZSgpXG4gICAgfSlcblxuICAgIGlmKHRoaXMuX3JlbW92ZWRQYXJ0cy5sZW5ndGggPiAwKXtcbiAgICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpXG4gICAgfVxuXG5cbiAgICAvLyBmaWx0ZXIgcmVtb3ZlZCBldmVudHNcbiAgICBjb25zb2xlLmxvZygncmVtb3ZlZCBldmVudHMgJU8nLCB0aGlzLl9yZW1vdmVkRXZlbnRzKVxuICAgIHRoaXMuX3JlbW92ZWRFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMuX25vdGVzQnlJZC5kZWxldGUoZXZlbnQubWlkaU5vdGUuaWQpXG4gICAgICB0aGlzLl9ldmVudHNCeUlkLmRlbGV0ZShldmVudC5pZClcbiAgICB9KVxuXG4gICAgY3JlYXRlRXZlbnRBcnJheSA9IHRoaXMuX3JlbW92ZWRFdmVudHMubGVuZ3RoID4gMFxuXG4gICAgLy8gYWRkIG5ldyBldmVudHNcbiAgICBjb25zb2xlLmxvZygnbmV3IGV2ZW50cyAlTycsIHRoaXMuX25ld0V2ZW50cylcbiAgICB0aGlzLl9uZXdFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMuX2V2ZW50c0J5SWQuc2V0KGV2ZW50LmlkLCBldmVudClcbiAgICAgIHRoaXMuX2V2ZW50cy5wdXNoKGV2ZW50KVxuICAgICAgdG9iZVBhcnNlZC5wdXNoKGV2ZW50KVxuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5pZClcbiAgICB9KVxuXG4gICAgLy8gbW92ZWQgZXZlbnRzIG5lZWQgdG8gYmUgcGFyc2VkXG4gICAgY29uc29sZS5sb2coJ21vdmVkICVPJywgdGhpcy5fbW92ZWRFdmVudHMpXG4gICAgdGhpcy5fbW92ZWRFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIHRvYmVQYXJzZWQucHVzaChldmVudClcbiAgICB9KVxuXG4gICAgLy90b2JlUGFyc2VkID0gWy4uLnRvYmVQYXJzZWQsIC4uLkFycmF5LmZyb20oc29uZy5tb3ZlZEV2ZW50cy52YWx1ZXMoKSldXG5cbiAgICBjb25zb2xlLnRpbWUoJ3BhcnNlJylcbiAgICBpZih0b2JlUGFyc2VkLmxlbmd0aCA+IDApe1xuICAgICAgLy9jb25zb2xlLmxvZygndG9iZVBhcnNlZCAlTycsIHRvYmVQYXJzZWQpXG4gICAgICB0b2JlUGFyc2VkID0gWy4uLnRvYmVQYXJzZWQsIC4uLnRoaXMuX3RpbWVFdmVudHNdXG4gICAgICBjb25zb2xlLmxvZygncGFyc2VFdmVudHMnLCB0b2JlUGFyc2VkLmxlbmd0aCAtIHRoaXMuX3RpbWVFdmVudHMubGVuZ3RoKVxuICAgICAgcGFyc2VFdmVudHModG9iZVBhcnNlZCwgdGhpcy5pc1BsYXlpbmcpXG4gICAgICB0b2JlUGFyc2VkLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmlkLCBldmVudC50eXBlLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gTUlESUV2ZW50VHlwZXMuTk9URV9PTil7XG4gICAgICAgICAgaWYoZXZlbnQubWlkaU5vdGUpe1xuICAgICAgICAgICAgdGhpcy5fbm90ZXNCeUlkLnNldChldmVudC5taWRpTm90ZUlkLCBldmVudC5taWRpTm90ZSlcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZCwgZXZlbnQudHlwZSlcbiAgICAgICAgICAgIC8vdGhpcy5fbm90ZXMucHVzaChldmVudC5taWRpTm90ZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0aGlzLl9ub3RlcyA9IEFycmF5LmZyb20odGhpcy5fbm90ZXNCeUlkLnZhbHVlcygpKVxuICAgIH1cbiAgICBjb25zb2xlLnRpbWVFbmQoJ3BhcnNlJylcblxuXG4gICAgaWYoY3JlYXRlRXZlbnRBcnJheSl7XG4gICAgICBjb25zb2xlLnRpbWUoJ3RvIGFycmF5JylcbiAgICAgIHRoaXMuX2V2ZW50cyA9IEFycmF5LmZyb20odGhpcy5fZXZlbnRzQnlJZC52YWx1ZXMoKSlcbiAgICAgIHRoaXMuX25vdGVzID0gQXJyYXkuZnJvbSh0aGlzLl9ub3Rlc0J5SWQudmFsdWVzKCkpXG4gICAgICBjb25zb2xlLnRpbWVFbmQoJ3RvIGFycmF5JylcbiAgICB9XG4gICAgLy9kZWJ1Z2dlclxuXG4gICAgY29uc29sZS50aW1lKGBzb3J0aW5nICR7dGhpcy5fZXZlbnRzLmxlbmd0aH0gZXZlbnRzYClcbiAgICBzb3J0RXZlbnRzKHRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ub3Rlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGEubm90ZU9uLnRpY2tzIC0gYi5ub3RlT24udGlja3NcbiAgICB9KVxuICAgIGNvbnNvbGUudGltZUVuZChgc29ydGluZyAke3RoaXMuX2V2ZW50cy5sZW5ndGh9IGV2ZW50c2ApXG5cbiAgICBjb25zb2xlLmxvZygnbm90ZXMgJU8nLCB0aGlzLl9ub3RlcylcblxuICAgIGNvbnNvbGUudGltZUVuZCgndG90YWwnKVxuICAgIGNvbnNvbGUudGltZUVuZCgndXBkYXRlIHNvbmcnKVxuXG5cbiAgICAvLyBnZXQgdGhlIGxhc3QgZXZlbnQgb2YgdGhpcyBzb25nXG4gICAgbGV0IGxhc3RFdmVudCA9IHRoaXMuX2V2ZW50c1t0aGlzLl9ldmVudHMubGVuZ3RoIC0gMV1cbiAgICBsZXQgbGFzdFRpbWVFdmVudCA9IHRoaXMuX3RpbWVFdmVudHNbdGhpcy5fdGltZUV2ZW50cy5sZW5ndGggLSAxXVxuICAgIGlmKGxhc3RFdmVudCBpbnN0YW5jZW9mIE1JRElFdmVudCA9PT0gZmFsc2Upe1xuICAgICAgbGFzdEV2ZW50ID0gbGFzdFRpbWVFdmVudFxuICAgIH1lbHNlIGlmKGxhc3RUaW1lRXZlbnQudGlja3MgPiBsYXN0RXZlbnQudGlja3Mpe1xuICAgICAgbGFzdEV2ZW50ID0gbGFzdFRpbWVFdmVudFxuICAgIH1cblxuICAgIC8vIGdldCB0aGUgcG9zaXRpb24gZGF0YSBvZiB0aGUgZmlyc3QgYmVhdCBpbiB0aGUgYmFyIGFmdGVyIHRoZSBsYXN0IGJhclxuICAgIHRoaXMuYmFycyA9IE1hdGgubWF4KGxhc3RFdmVudC5iYXIsIHRoaXMuYmFycylcbiAgICAvL2NvbnNvbGUubG9nKCdudW0gYmFycycsIHRoaXMuYmFycywgbGFzdEV2ZW50KVxuICAgIGxldCB0aWNrcyA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIHtcbiAgICAgIHR5cGU6ICdiYXJzYmVhdHMnLFxuICAgICAgdGFyZ2V0OiBbdGhpcy5iYXJzICsgMV0sXG4gICAgICByZXN1bHQ6ICd0aWNrcydcbiAgICB9KS50aWNrc1xuXG4gICAgLy8gd2Ugd2FudCB0byBwdXQgdGhlIEVORF9PRl9UUkFDSyBldmVudCBhdCB0aGUgdmVyeSBsYXN0IHRpY2sgb2YgdGhlIGxhc3QgYmFyLCBzbyB3ZSBjYWxjdWxhdGUgdGhhdCBwb3NpdGlvblxuICAgIGxldCBtaWxsaXMgPSBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCB7XG4gICAgICB0eXBlOiAndGlja3MnLFxuICAgICAgdGFyZ2V0OiB0aWNrcyAtIDEsXG4gICAgICByZXN1bHQ6ICdtaWxsaXMnXG4gICAgfSkubWlsbGlzXG5cblxuICAgIHRoaXMuX2xhc3RFdmVudC50aWNrcyA9IHRpY2tzIC0gMVxuICAgIHRoaXMuX2xhc3RFdmVudC5taWxsaXMgPSBtaWxsaXNcblxuICAgIGNvbnNvbGUubG9nKCdsYXN0IHRpY2snLCB0aGlzLl9sYXN0RXZlbnQudGlja3MsIHRoaXMuX2xhc3RFdmVudC5taWxsaXMpXG5cbiAgICB0aGlzLl9kdXJhdGlvblRpY2tzID0gdGhpcy5fbGFzdEV2ZW50LnRpY2tzXG4gICAgdGhpcy5fZHVyYXRpb25NaWxsaXMgPSB0aGlzLl9sYXN0RXZlbnQubWlsbGlzXG4gICAgdGhpcy5fcGxheWhlYWQudXBkYXRlU29uZygpXG5cbiAgICBpZih0aGlzLnBsYXlpbmcgPT09IGZhbHNlKXtcbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICB9XG5cbiAgICAvLyBhZGQgbWV0cm9ub21lIGV2ZW50c1xuICAgIGlmKHRoaXMuX3VwZGF0ZU1ldHJvbm9tZUV2ZW50cyB8fCB0aGlzLl9tZXRyb25vbWUuYmFycyAhPT0gdGhpcy5iYXJzKXtcbiAgICAgIHRoaXMuX21ldHJvbm9tZUV2ZW50cyA9IHBhcnNlRXZlbnRzKFsuLi50aGlzLl90aW1lRXZlbnRzLCAuLi50aGlzLl9tZXRyb25vbWUuZ2V0RXZlbnRzKCldKVxuICAgIH1cbiAgICB0aGlzLl9hbGxFdmVudHMgPSBbLi4udGhpcy5fbWV0cm9ub21lRXZlbnRzLCAuLi50aGlzLl9ldmVudHNdXG4gICAgc29ydEV2ZW50cyh0aGlzLl9hbGxFdmVudHMpXG4gICAgLy9jb25zb2xlLmxvZygnYWxsIGV2ZW50cyAlTycsIHRoaXMuX2FsbEV2ZW50cylcblxuICAgIHRoaXMuX25ld1BhcnRzID0gW11cbiAgICB0aGlzLl9yZW1vdmVkUGFydHMgPSBbXVxuICAgIHRoaXMuX25ld0V2ZW50cyA9IFtdXG4gICAgdGhpcy5fbW92ZWRFdmVudHMgPSBbXVxuICAgIHRoaXMuX3JlbW92ZWRFdmVudHMgPSBbXVxuXG4gICAgY29uc29sZS5ncm91cEVuZCgndXBkYXRlIHNvbmcnKVxuICB9XG5cbiAgcGxheSh0eXBlLCAuLi5hcmdzKTogdm9pZHtcbiAgICB0aGlzLl9wbGF5KHR5cGUsIC4uLmFyZ3MpXG4gICAgaWYodGhpcy5fcHJlY291bnRCYXJzID4gMCl7XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncHJlY291bnRpbmcnLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzfSlcbiAgICB9ZWxzZSBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAnc3RhcnRfcmVjb3JkaW5nJywgZGF0YTogdGhpcy5fY3VycmVudE1pbGxpc30pXG4gICAgfWVsc2V7XG4gICAgICBkaXNwYXRjaEV2ZW50KHt0eXBlOiAncGxheScsIGRhdGE6IHRoaXMuX2N1cnJlbnRNaWxsaXN9KVxuICAgIH1cbiAgfVxuXG4gIF9wbGF5KHR5cGUsIC4uLmFyZ3Mpe1xuICAgIGlmKHR5cGVvZiB0eXBlICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnNldFBvc2l0aW9uKHR5cGUsIC4uLmFyZ3MpXG4gICAgfVxuICAgIGlmKHRoaXMucGxheWluZyl7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9yZWZlcmVuY2UgPSB0aGlzLl90aW1lU3RhbXAgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuICAgIHRoaXMuX3NjaGVkdWxlci5zZXRUaW1lU3RhbXAodGhpcy5fcmVmZXJlbmNlKVxuICAgIHRoaXMuX3N0YXJ0TWlsbGlzID0gdGhpcy5fY3VycmVudE1pbGxpc1xuXG4gICAgaWYodGhpcy5fcHJlY291bnRCYXJzID4gMCAmJiB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyl7XG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgKyB0aGlzLl9tZXRyb25vbWUuY3JlYXRlUHJlY291bnRFdmVudHModGhpcy5fcHJlY291bnRCYXJzLCB0aGlzLl9yZWZlcmVuY2UpXG4gICAgICAvL2NvbnNvbGUubG9nKCdlbmRQcmVjb3VudE1pbGxpcycsIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzKVxuICAgICAgdGhpcy5wcmVjb3VudGluZyA9IHRydWVcbiAgICB9ZWxzZSB7XG4gICAgICB0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMucGxheWluZyA9IHRydWVcbiAgICAgIHRoaXMucmVjb3JkaW5nID0gdGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmdcbiAgICB9XG5cbiAgICBpZih0aGlzLnBhdXNlZCl7XG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5fc2NoZWR1bGVyLmluaXQodGhpcy5fY3VycmVudE1pbGxpcylcbiAgICB0aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2N1cnJlbnRNaWxsaXMpXG4gICAgdGhpcy5fcHVsc2UoKVxuICB9XG5cblxuICBwYXVzZSgpOiB2b2lke1xuICAgIHRoaXMucGF1c2VkID0gIXRoaXMucGF1c2VkXG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgaWYodGhpcy5wYXVzZWQpe1xuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuYWxsTm90ZXNPZmYoKVxuICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BhdXNlJywgZGF0YTogdGhpcy5wYXVzZWR9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5wbGF5KClcbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdwYXVzZScsIGRhdGE6IHRoaXMucGF1c2VkfSlcbiAgICB9XG4gIH1cblxuICBzdG9wKCk6IHZvaWR7XG4gICAgdGhpcy5wcmVjb3VudGluZyA9IGZhbHNlXG4gICAgdGhpcy5hbGxOb3Rlc09mZigpXG4gICAgaWYodGhpcy5wbGF5aW5nIHx8IHRoaXMucGF1c2VkKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlXG4gICAgfVxuICAgIGlmKHRoaXMuX2N1cnJlbnRNaWxsaXMgIT09IDApe1xuICAgICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IDBcbiAgICAgIHRoaXMuX3BsYXloZWFkLnNldCgnbWlsbGlzJywgdGhpcy5fY3VycmVudE1pbGxpcylcbiAgICAgIGlmKHRoaXMucmVjb3JkaW5nKXtcbiAgICAgICAgdGhpcy5zdG9wUmVjb3JkaW5nKClcbiAgICAgIH1cbiAgICAgIGRpc3BhdGNoRXZlbnQoe3R5cGU6ICdzdG9wJ30pXG4gICAgfVxuICB9XG5cbiAgc3RhcnRSZWNvcmRpbmcoKXtcbiAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fcmVjb3JkSWQgPSBgcmVjb3JkaW5nXyR7cmVjb3JkaW5nSW5kZXgrK30ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5fc3RhcnRSZWNvcmRpbmcodGhpcy5fcmVjb3JkSWQpXG4gICAgfSlcbiAgICB0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9IHRydWVcbiAgfVxuXG4gIHN0b3BSZWNvcmRpbmcoKXtcbiAgICBpZih0aGlzLl9wcmVwYXJlZEZvclJlY29yZGluZyA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuX3RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcbiAgICAgIHRyYWNrLl9zdG9wUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICAgIHRoaXMuX3ByZXBhcmVkRm9yUmVjb3JkaW5nID0gZmFsc2VcbiAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlXG4gICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3N0b3BfcmVjb3JkaW5nJ30pXG4gIH1cblxuICB1bmRvUmVjb3JkaW5nKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2godHJhY2sgPT4ge1xuICAgICAgdHJhY2sudW5kb1JlY29yZGluZyh0aGlzLl9yZWNvcmRJZClcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIHJlZG9SZWNvcmRpbmcoKXtcbiAgICB0aGlzLl90cmFja3MuZm9yRWFjaCh0cmFjayA9PiB7XG4gICAgICB0cmFjay5yZWRvUmVjb3JkaW5nKHRoaXMuX3JlY29yZElkKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGUoKVxuICB9XG5cbiAgc2V0TWV0cm9ub21lKGZsYWcpe1xuICAgIGlmKHR5cGVvZiBmbGFnID09PSAndW5kZWZpbmVkJyl7XG4gICAgICB0aGlzLnVzZU1ldHJvbm9tZSA9ICF0aGlzLnVzZU1ldHJvbm9tZVxuICAgIH1lbHNle1xuICAgICAgdGhpcy51c2VNZXRyb25vbWUgPSBmbGFnXG4gICAgfVxuICAgIHRoaXMuX21ldHJvbm9tZS5tdXRlKCF0aGlzLnVzZU1ldHJvbm9tZSlcbiAgfVxuXG4gIGNvbmZpZ3VyZU1ldHJvbm9tZShjb25maWcpe1xuICAgIHRoaXMuX21ldHJvbm9tZS5jb25maWd1cmUoY29uZmlnKVxuICB9XG5cbiAgY29uZmlndXJlKGNvbmZpZyl7XG5cbiAgfVxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgdGhpcy5fdHJhY2tzLmZvckVhY2goKHRyYWNrKSA9PiB7XG4gICAgICB0cmFjay5hbGxOb3Rlc09mZigpXG4gICAgfSlcblxuICAgIC8vdGhpcy5fc2NoZWR1bGVyLmFsbE5vdGVzT2ZmKClcbiAgICB0aGlzLl9tZXRyb25vbWUuYWxsTm90ZXNPZmYoKVxuICB9XG5cbiAgZ2V0VHJhY2tzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl90cmFja3NdXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuICBnZXRFdmVudHMoKXtcbiAgICByZXR1cm4gWy4uLnRoaXMuX2V2ZW50c11cbiAgfVxuXG4gIGdldE5vdGVzKCl7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ub3Rlc11cbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9uKGFyZ3Mpe1xuICAgIHJldHVybiBjYWxjdWxhdGVQb3NpdGlvbih0aGlzLCBhcmdzKVxuICB9XG5cbiAgLy8gQGFyZ3MgLT4gc2VlIF9jYWxjdWxhdGVQb3NpdGlvblxuICBzZXRQb3NpdGlvbih0eXBlLCAuLi5hcmdzKXtcblxuICAgIGxldCB3YXNQbGF5aW5nID0gdGhpcy5wbGF5aW5nXG4gICAgaWYodGhpcy5wbGF5aW5nKXtcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXG4gICAgICB0aGlzLmFsbE5vdGVzT2ZmKClcbiAgICB9XG5cbiAgICBsZXQgcG9zaXRpb24gPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJylcbiAgICAvL2xldCBtaWxsaXMgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnbWlsbGlzJylcbiAgICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyA9IHBvc2l0aW9uLm1pbGxpc1xuXG4gICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICB0eXBlOiAncG9zaXRpb24nLFxuICAgICAgZGF0YTogcG9zaXRpb25cbiAgICB9KVxuXG4gICAgaWYod2FzUGxheWluZyl7XG4gICAgICB0aGlzLl9wbGF5KClcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZygnc2V0UG9zaXRpb24nLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICB9XG5cbiAgZ2V0UG9zaXRpb24oKXtcbiAgICByZXR1cm4gdGhpcy5fcGxheWhlYWQuZ2V0KCkucG9zaXRpb25cbiAgfVxuXG4gIGdldFBsYXloZWFkKCl7XG4gICAgcmV0dXJuIHRoaXMuX3BsYXloZWFkLmdldCgpXG4gIH1cblxuICAvLyBAYXJncyAtPiBzZWUgX2NhbGN1bGF0ZVBvc2l0aW9uXG4gIHNldExlZnRMb2NhdG9yKHR5cGUsIC4uLmFyZ3Mpe1xuICAgIHRoaXMuX2xlZnRMb2NhdG9yID0gdGhpcy5fY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgJ2FsbCcpXG5cbiAgICBpZih0aGlzLl9sZWZ0TG9jYXRvciA9PT0gZmFsc2Upe1xuICAgICAgY29uc29sZS53YXJuKCdpbnZhbGlkIHBvc2l0aW9uIGZvciBsb2NhdG9yJylcbiAgICAgIHRoaXMuX2xlZnRMb2NhdG9yID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICAvLyBAYXJncyAtPiBzZWUgX2NhbGN1bGF0ZVBvc2l0aW9uXG4gIHNldFJpZ2h0TG9jYXRvcih0eXBlLCAuLi5hcmdzKXtcbiAgICB0aGlzLl9yaWdodExvY2F0b3IgPSB0aGlzLl9jYWxjdWxhdGVQb3NpdGlvbih0eXBlLCBhcmdzLCAnYWxsJylcblxuICAgIGlmKHRoaXMuX3JpZ2h0TG9jYXRvciA9PT0gZmFsc2Upe1xuICAgICAgdGhpcy5fcmlnaHRMb2NhdG9yID0ge21pbGxpczogMCwgdGlja3M6IDB9XG4gICAgICBjb25zb2xlLndhcm4oJ2ludmFsaWQgcG9zaXRpb24gZm9yIGxvY2F0b3InKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgc2V0TG9vcChmbGFnID0gbnVsbCl7XG5cbiAgICB0aGlzLl9sb29wID0gZmxhZyAhPT0gbnVsbCA/IGZsYWcgOiAhdGhpcy5fbG9vcFxuXG4gICAgaWYodGhpcy5fcmlnaHRMb2NhdG9yID09PSBmYWxzZSB8fCB0aGlzLl9sZWZ0TG9jYXRvciA9PT0gZmFsc2Upe1xuICAgICAgdGhpcy5faWxsZWdhbExvb3AgPSB0cnVlXG4gICAgICB0aGlzLl9sb29wID0gZmFsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8vIGxvY2F0b3JzIGNhbiBub3QgKHlldCkgYmUgdXNlZCB0byBqdW1wIG92ZXIgYSBzZWdtZW50XG4gICAgaWYodGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcyA8PSB0aGlzLl9sZWZ0TG9jYXRvci5taWxsaXMpe1xuICAgICAgdGhpcy5faWxsZWdhbExvb3AgPSB0cnVlXG4gICAgICB0aGlzLl9sb29wID0gZmFsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuX2xvb3BEdXJhdGlvbiA9IHRoaXMuX3JpZ2h0TG9jYXRvci5taWxsaXMgLSB0aGlzLl9sZWZ0TG9jYXRvci5taWxsaXNcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX2xvb3AsIHRoaXMuX2xvb3BEdXJhdGlvbilcbiAgICB0aGlzLl9zY2hlZHVsZXIuYmV5b25kTG9vcCA9IHRoaXMuX2N1cnJlbnRNaWxsaXMgPiB0aGlzLl9yaWdodExvY2F0b3IubWlsbGlzXG4gICAgcmV0dXJuIHRoaXMuX2xvb3BcbiAgfVxuXG4gIHNldFByZWNvdW50KHZhbHVlID0gMCl7XG4gICAgdGhpcy5fcHJlY291bnRCYXJzID0gdmFsdWVcbiAgfVxuXG4gIF9wdWxzZSgpOiB2b2lke1xuICAgIGlmKHRoaXMucGxheWluZyA9PT0gZmFsc2UgJiYgdGhpcy5wcmVjb3VudGluZyA9PT0gZmFsc2Upe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBub3cgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuICAgIGxldCBkaWZmID0gbm93IC0gdGhpcy5fcmVmZXJlbmNlXG4gICAgdGhpcy5fY3VycmVudE1pbGxpcyArPSBkaWZmXG4gICAgdGhpcy5fcmVmZXJlbmNlID0gbm93XG5cbiAgICBpZih0aGlzLl9lbmRQcmVjb3VudE1pbGxpcyA+IDApe1xuICAgICAgaWYodGhpcy5fZW5kUHJlY291bnRNaWxsaXMgPiB0aGlzLl9jdXJyZW50TWlsbGlzKXtcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVyLnVwZGF0ZShkaWZmKVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcHVsc2UuYmluZCh0aGlzKSlcbiAgICAgICAgLy9yZXR1cm4gYmVjYXVzZSBkdXJpbmcgcHJlY291bnRpbmcgb25seSBwcmVjb3VudCBtZXRyb25vbWUgZXZlbnRzIGdldCBzY2hlZHVsZWRcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLnByZWNvdW50aW5nID0gZmFsc2VcbiAgICAgIHRoaXMuX2VuZFByZWNvdW50TWlsbGlzID0gMFxuICAgICAgaWYodGhpcy5fcHJlcGFyZWRGb3JSZWNvcmRpbmcpe1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlXG4gICAgICAgIHRoaXMucmVjb3JkaW5nID0gdHJ1ZVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMucGxheWluZyA9IHRydWVcbiAgICAgICAgZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BsYXknLCBkYXRhOiB0aGlzLl9zdGFydE1pbGxpc30pXG4gICAgICAgIC8vZGlzcGF0Y2hFdmVudCh7dHlwZTogJ3BsYXknLCBkYXRhOiB0aGlzLl9jdXJyZW50TWlsbGlzfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZih0aGlzLl9sb29wICYmIHRoaXMuX2N1cnJlbnRNaWxsaXMgPj0gdGhpcy5fcmlnaHRMb2NhdG9yLm1pbGxpcyl7XG4gICAgICB0aGlzLl9jdXJyZW50TWlsbGlzIC09IHRoaXMuX2xvb3BEdXJhdGlvblxuICAgICAgdGhpcy5fcGxheWhlYWQuc2V0KCdtaWxsaXMnLCB0aGlzLl9jdXJyZW50TWlsbGlzKVxuICAgICAgLy90aGlzLl9wbGF5aGVhZC5zZXQoJ21pbGxpcycsIHRoaXMuX2xlZnRMb2NhdG9yLm1pbGxpcykgLy8gcGxheWhlYWQgaXMgYSBiaXQgYWhlYWQgb25seSBkdXJpbmcgdGhpcyBmcmFtZVxuICAgICAgZGlzcGF0Y2hFdmVudCh7XG4gICAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgICAgZGF0YTogbnVsbFxuICAgICAgfSlcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuX3BsYXloZWFkLnVwZGF0ZSgnbWlsbGlzJywgZGlmZilcbiAgICB9XG5cbiAgICB0aGlzLl90aWNrcyA9IHRoaXMuX3BsYXloZWFkLmdldCgpLnRpY2tzXG5cbiAgICBpZih0aGlzLl9jdXJyZW50TWlsbGlzID49IHRoaXMuX2R1cmF0aW9uTWlsbGlzKXtcbiAgICAgIHRoaXMuc3RvcCgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlKGRpZmYpXG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcHVsc2UuYmluZCh0aGlzKSlcbiAgfVxuXG4gIC8qXG4gICAgaGVscGVyIG1ldGhvZDogY29udmVydHMgdXNlciBmcmllbmRseSBwb3NpdGlvbiBmb3JtYXQgdG8gaW50ZXJuYWwgZm9ybWF0XG5cbiAgICBwb3NpdGlvbjpcbiAgICAgIC0gJ3RpY2tzJywgOTYwMDBcbiAgICAgIC0gJ21pbGxpcycsIDEyMzRcbiAgICAgIC0gJ3BlcmNlbnRhZ2UnLCA1NVxuICAgICAgLSAnYmFyc2JlYXRzJywgMSwgNCwgMCwgMjUgLT4gYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tcbiAgICAgIC0gJ3RpbWUnLCAwLCAzLCA0OSwgNTY2IC0+IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBtaWxsaXNcblxuICAqL1xuICBfY2FsY3VsYXRlUG9zaXRpb24odHlwZSwgYXJncywgcmVzdWx0VHlwZSl7XG4gICAgbGV0IHRhcmdldFxuXG4gICAgc3dpdGNoKHR5cGUpe1xuICAgICAgY2FzZSAndGlja3MnOlxuICAgICAgY2FzZSAnbWlsbGlzJzpcbiAgICAgIGNhc2UgJ3BlcmNlbnRhZ2UnOlxuICAgICAgICB0YXJnZXQgPSBhcmdzWzBdIHx8IDBcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAndGltZSc6XG4gICAgICBjYXNlICdiYXJzYmVhdHMnOlxuICAgICAgY2FzZSAnYmFyc2FuZGJlYXRzJzpcbiAgICAgICAgdGFyZ2V0ID0gYXJnc1xuICAgICAgICBicmVha1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zb2xlLmxvZygndW5zdXBwb3J0ZWQgdHlwZScpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGxldCBwb3NpdGlvbiA9IGNhbGN1bGF0ZVBvc2l0aW9uKHRoaXMsIHtcbiAgICAgIHR5cGUsXG4gICAgICB0YXJnZXQsXG4gICAgICByZXN1bHQ6IHJlc3VsdFR5cGUsXG4gICAgfSlcblxuICAgIHJldHVybiBwb3NpdGlvblxuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayl7XG4gICAgcmV0dXJuIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spXG4gIH1cblxuICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKXtcbiAgICByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGlkKVxuICB9XG5cbiAgc2F2ZUFzTUlESUZpbGUobmFtZSl7XG4gICAgc2F2ZUFzTUlESUZpbGUodGhpcywgbmFtZSlcbiAgfVxufVxuIiwiXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCB7cGFyc2VNSURJRmlsZX0gZnJvbSAnLi9taWRpZmlsZSdcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7VHJhY2t9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge1Nvbmd9IGZyb20gJy4vc29uZydcbmltcG9ydCB7YmFzZTY0VG9CaW5hcnl9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7c3RhdHVzLCBqc29uLCBhcnJheUJ1ZmZlcn0gZnJvbSAnLi9mZXRjaF9oZWxwZXJzJ1xuXG5jb25zdCBQUFEgPSA5NjBcblxuXG5mdW5jdGlvbiB0b1NvbmcocGFyc2VkKXtcbiAgbGV0IHRyYWNrcyA9IHBhcnNlZC50cmFja3NcbiAgbGV0IHBwcSA9IHBhcnNlZC5oZWFkZXIudGlja3NQZXJCZWF0XG4gIGxldCBwcHFGYWN0b3IgPSBQUFEgLyBwcHEgLy9AVE9ETzogZ2V0IHBwcSBmcm9tIGNvbmZpZyAtPiBvbmx5IG5lY2Vzc2FyeSBpZiB5b3Ugd2FudCB0byBjaGFuZ2UgdGhlIHBwcSBvZiB0aGUgTUlESSBmaWxlICFcbiAgbGV0IHRpbWVFdmVudHMgPSBbXVxuICBsZXQgYnBtID0gLTFcbiAgbGV0IG5vbWluYXRvciA9IC0xXG4gIGxldCBkZW5vbWluYXRvciA9IC0xXG4gIGxldCBuZXdUcmFja3MgPSBbXVxuXG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzLnZhbHVlcygpKXtcbiAgICBsZXQgbGFzdFRpY2tzLCBsYXN0VHlwZVxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgdHlwZVxuICAgIGxldCBjaGFubmVsID0gLTFcbiAgICBsZXQgdHJhY2tOYW1lXG4gICAgbGV0IHRyYWNrSW5zdHJ1bWVudE5hbWVcbiAgICBsZXQgZXZlbnRzID0gW107XG5cbiAgICBmb3IobGV0IGV2ZW50IG9mIHRyYWNrKXtcbiAgICAgIHRpY2tzICs9IChldmVudC5kZWx0YVRpbWUgKiBwcHFGYWN0b3IpO1xuXG4gICAgICBpZihjaGFubmVsID09PSAtMSAmJiB0eXBlb2YgZXZlbnQuY2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBjaGFubmVsID0gZXZlbnQuY2hhbm5lbDtcbiAgICAgIH1cbiAgICAgIHR5cGUgPSBldmVudC5zdWJ0eXBlO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5kZWx0YVRpbWUsIHRpY2tzLCB0eXBlKTtcblxuICAgICAgc3dpdGNoKGV2ZW50LnN1YnR5cGUpe1xuXG4gICAgICAgIGNhc2UgJ3RyYWNrTmFtZSc6XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdpbnN0cnVtZW50TmFtZSc6XG4gICAgICAgICAgaWYoZXZlbnQudGV4dCl7XG4gICAgICAgICAgICB0cmFja0luc3RydW1lbnROYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9uJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweDkwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9mZic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg4MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3NldFRlbXBvJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0ZW1wbyBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgbGV0IHRtcCA9IDYwMDAwMDAwIC8gZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdDtcblxuICAgICAgICAgIGlmKHRpY2tzID09PSBsYXN0VGlja3MgJiYgdHlwZSA9PT0gbGFzdFR5cGUpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oJ3RlbXBvIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIHRtcCk7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGJwbSA9PT0gLTEpe1xuICAgICAgICAgICAgYnBtID0gdG1wO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg1MSwgdG1wKSlcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0aW1lU2lnbmF0dXJlJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0aW1lIHNpZ25hdHVyZSBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgaWYobGFzdFRpY2tzID09PSB0aWNrcyAmJiBsYXN0VHlwZSA9PT0gdHlwZSl7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ3RpbWUgc2lnbmF0dXJlIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihub21pbmF0b3IgPT09IC0xKXtcbiAgICAgICAgICAgIG5vbWluYXRvciA9IGV2ZW50Lm51bWVyYXRvclxuICAgICAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvclxuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg1OCwgZXZlbnQubnVtZXJhdG9yLCBldmVudC5kZW5vbWluYXRvcikpXG4gICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlICdjb250cm9sbGVyJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEIwLCBldmVudC5jb250cm9sbGVyVHlwZSwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwcm9ncmFtQ2hhbmdlJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEMwLCBldmVudC5wcm9ncmFtTnVtYmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncGl0Y2hCZW5kJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEUwLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCBldmVudC50eXBlKTtcbiAgICAgIH1cblxuICAgICAgbGFzdFR5cGUgPSB0eXBlXG4gICAgICBsYXN0VGlja3MgPSB0aWNrc1xuICAgIH1cblxuICAgIGlmKGV2ZW50cy5sZW5ndGggPiAwKXtcbiAgICAgIC8vY29uc29sZS5jb3VudChldmVudHMubGVuZ3RoKVxuICAgICAgbGV0IG5ld1RyYWNrID0gbmV3IFRyYWNrKHRyYWNrTmFtZSlcbiAgICAgIGxldCBwYXJ0ID0gbmV3IFBhcnQoKVxuICAgICAgbmV3VHJhY2suYWRkUGFydHMocGFydClcbiAgICAgIHBhcnQuYWRkRXZlbnRzKC4uLmV2ZW50cylcbiAgICAgIG5ld1RyYWNrcy5wdXNoKG5ld1RyYWNrKVxuICAgIH1cbiAgfVxuXG4gIGxldCBzb25nID0gbmV3IFNvbmcoe1xuICAgIHBwcTogUFBRLFxuICAgIHBsYXliYWNrU3BlZWQ6IDEsXG4gICAgLy9wcHEsXG4gICAgYnBtLFxuICAgIG5vbWluYXRvcixcbiAgICBkZW5vbWluYXRvclxuICB9KVxuICBzb25nLmFkZFRyYWNrcyguLi5uZXdUcmFja3MpXG4gIHNvbmcuYWRkVGltZUV2ZW50cyguLi50aW1lRXZlbnRzKVxuICBzb25nLnVwZGF0ZSgpXG4gIHJldHVybiBzb25nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlKGRhdGEsIHNldHRpbmdzID0ge30pe1xuICBsZXQgc29uZyA9IG51bGw7XG5cbiAgaWYoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKXtcbiAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgc29uZyA9IHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICB9ZWxzZSBpZih0eXBlb2YgZGF0YS5oZWFkZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkYXRhLnRyYWNrcyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHNvbmcgPSB0b1NvbmcoZGF0YSk7XG4gIH1lbHNle1xuICAgIGRhdGEgPSBiYXNlNjRUb0JpbmFyeShkYXRhKTtcbiAgICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgc29uZyA9IHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcignd3JvbmcgZGF0YScpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzb25nXG4gIC8vIHtcbiAgLy8gICBwcHEgPSBuZXdQUFEsXG4gIC8vICAgYnBtID0gbmV3QlBNLFxuICAvLyAgIHBsYXliYWNrU3BlZWQgPSBuZXdQbGF5YmFja1NwZWVkLFxuICAvLyB9ID0gc2V0dGluZ3Ncbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZUFzeW5jKHVybCl7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZmV0Y2godXJsKVxuICAgIC50aGVuKHN0YXR1cylcbiAgICAudGhlbihhcnJheUJ1ZmZlcilcbiAgICAudGhlbihkYXRhID0+IHtcbiAgICAgIHJlc29sdmUoc29uZ0Zyb21NSURJRmlsZShkYXRhKSlcbiAgICB9KVxuICAgIC5jYXRjaChlID0+IHtcbiAgICAgIHJlamVjdChlKVxuICAgIH0pXG4gIH0pXG59XG4iLCJpbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge01JRElOb3RlfSBmcm9tICcuL21pZGlfbm90ZSdcbmltcG9ydCB7Z2V0TUlESUlucHV0QnlJZCwgZ2V0TUlESU91dHB1dEJ5SWR9IGZyb20gJy4vaW5pdF9taWRpJ1xuaW1wb3J0IHtzb3J0RXZlbnRzfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7SW5zdHJ1bWVudH0gZnJvbSAnLi9pbnN0cnVtZW50J1xuaW1wb3J0IHtNSURJRXZlbnRUeXBlc30gZnJvbSAnLi9xYW1iaSdcblxuXG5sZXQgdHJhY2tJbmRleCA9IDBcblxuZXhwb3J0IGNsYXNzIFRyYWNre1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IG51bGwpe1xuICAgIHRoaXMuaWQgPSBgVFJfJHt0cmFja0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgdGhpcy5pZFxuICAgIHRoaXMuY2hhbm5lbCA9IDBcbiAgICB0aGlzLm11dGVkID0gZmFsc2VcbiAgICB0aGlzLnZvbHVtZSA9IDAuNVxuICAgIHRoaXMuX291dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5fb3V0cHV0LmdhaW4udmFsdWUgPSB0aGlzLnZvbHVtZVxuICAgIHRoaXMuX21pZGlJbnB1dHMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9taWRpT3V0cHV0cyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX3NvbmcgPSBudWxsXG4gICAgdGhpcy5fcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX2V2ZW50cyA9IFtdXG4gICAgdGhpcy5fZXZlbnRzQnlJZCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgICB0aGlzLl9jcmVhdGVFdmVudEFycmF5ID0gZmFsc2VcbiAgICB0aGlzLmxhdGVuY3kgPSAxMDBcbiAgICB0aGlzLl9pbnN0cnVtZW50ID0gbnVsbFxuICAgIHRoaXMuX3RtcFJlY29yZGVkTm90ZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdXG4gICAgLy90aGlzLnNldEluc3RydW1lbnQobmV3IEluc3RydW1lbnQoJ3NpbmV3YXZlJykpXG4gIH1cblxuICBzZXRJbnN0cnVtZW50KGluc3RydW1lbnQgPSBudWxsKXtcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuYWxsTm90ZXNPZmYoKVxuICAgICAgdGhpcy5faW5zdHJ1bWVudC5kaXNjb25uZWN0KClcbiAgICB9XG4gICAgdGhpcy5faW5zdHJ1bWVudCA9IGluc3RydW1lbnRcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQuY29ubmVjdCh0aGlzLl9vdXRwdXQpXG4gICAgfVxuICB9XG5cbiAgZ2V0SW5zdHJ1bWVudCgpe1xuICAgIHJldHVybiB0aGlzLl9pbnN0cnVtZW50XG4gIH1cblxuICBjb25uZWN0KG91dHB1dCl7XG4gICAgdGhpcy5fb3V0cHV0LmNvbm5lY3Qob3V0cHV0KVxuICB9XG5cbiAgZGlzY29ubmVjdCgpe1xuICAgIHRoaXMuX291dHB1dC5kaXNjb25uZWN0KClcbiAgfVxuXG4gIGNvbm5lY3RNSURJT3V0cHV0cyguLi5vdXRwdXRzKXtcbiAgICAvL2NvbnNvbGUubG9nKG91dHB1dHMpXG4gICAgb3V0cHV0cy5mb3JFYWNoKG91dHB1dCA9PiB7XG4gICAgICBpZih0eXBlb2Ygb3V0cHV0ID09PSAnc3RyaW5nJyl7XG4gICAgICAgIG91dHB1dCA9IGdldE1JRElPdXRwdXRCeUlkKG91dHB1dClcbiAgICAgIH1cbiAgICAgIGlmKG91dHB1dCBpbnN0YW5jZW9mIE1JRElPdXRwdXQpe1xuICAgICAgICB0aGlzLl9taWRpT3V0cHV0cy5zZXQob3V0cHV0LmlkLCBvdXRwdXQpXG4gICAgICB9XG4gICAgfSlcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuX21pZGlPdXRwdXRzKVxuICB9XG5cbiAgZGlzY29ubmVjdE1JRElPdXRwdXRzKC4uLm91dHB1dHMpe1xuICAgIC8vY29uc29sZS5sb2cob3V0cHV0cylcbiAgICBpZihvdXRwdXRzLmxlbmd0aCA9PT0gMCl7XG4gICAgICB0aGlzLl9taWRpT3V0cHV0cy5jbGVhcigpXG4gICAgfVxuICAgIG91dHB1dHMuZm9yRWFjaChwb3J0ID0+IHtcbiAgICAgIGlmKHBvcnQgaW5zdGFuY2VvZiBNSURJT3V0cHV0KXtcbiAgICAgICAgcG9ydCA9IHBvcnQuaWRcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuX21pZGlPdXRwdXRzLmhhcyhwb3J0KSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3JlbW92aW5nJywgdGhpcy5fbWlkaU91dHB1dHMuZ2V0KHBvcnQpLm5hbWUpXG4gICAgICAgIHRoaXMuX21pZGlPdXRwdXRzLmRlbGV0ZShwb3J0KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy90aGlzLl9taWRpT3V0cHV0cyA9IHRoaXMuX21pZGlPdXRwdXRzLmZpbHRlciguLi5vdXRwdXRzKVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaU91dHB1dHMpXG4gIH1cblxuICBjb25uZWN0TUlESUlucHV0cyguLi5pbnB1dHMpe1xuICAgIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgIGlmKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpe1xuICAgICAgICBpbnB1dCA9IGdldE1JRElJbnB1dEJ5SWQoaW5wdXQpXG4gICAgICB9XG4gICAgICBpZihpbnB1dCBpbnN0YW5jZW9mIE1JRElJbnB1dCl7XG5cbiAgICAgICAgdGhpcy5fbWlkaUlucHV0cy5zZXQoaW5wdXQuaWQsIGlucHV0KVxuXG4gICAgICAgIGxldCBub3RlLCBtaWRpRXZlbnRcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBlID0+IHtcblxuICAgICAgICAgIG1pZGlFdmVudCA9IG5ldyBNSURJRXZlbnQodGhpcy5fc29uZy5fdGlja3MsIC4uLmUuZGF0YSlcbiAgICAgICAgICBtaWRpRXZlbnQudGltZSA9IDAgLy8gcGxheSBpbW1lZGlhdGVseVxuICAgICAgICAgIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMFxuXG4gICAgICAgICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT04pe1xuICAgICAgICAgICAgbm90ZSA9IG5ldyBNSURJTm90ZShtaWRpRXZlbnQpXG4gICAgICAgICAgICB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLnNldChtaWRpRXZlbnQuZGF0YTEsIG5vdGUpXG4gICAgICAgICAgfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IE1JRElFdmVudFR5cGVzLk5PVEVfT0ZGKXtcbiAgICAgICAgICAgIG5vdGUgPSB0aGlzLl90bXBSZWNvcmRlZE5vdGVzLmdldChtaWRpRXZlbnQuZGF0YTEpXG4gICAgICAgICAgICBub3RlLmFkZE5vdGVPZmYobWlkaUV2ZW50KVxuICAgICAgICAgICAgdGhpcy5fdG1wUmVjb3JkZWROb3Rlcy5kZWxldGUobWlkaUV2ZW50LmRhdGExKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKHRoaXMuX3JlY29yZEVuYWJsZWQgPT09ICdtaWRpJyAmJiB0aGlzLl9zb25nLnJlY29yZGluZyA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cy5wdXNoKG1pZGlFdmVudClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wcm9jZXNzTUlESUV2ZW50KG1pZGlFdmVudClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaUlucHV0cylcbiAgfVxuXG4gIGRpc2Nvbm5lY3RNSURJSW5wdXRzKC4uLmlucHV0cyl7XG4gICAgaWYoaW5wdXRzLmxlbmd0aCA9PT0gMCl7XG4gICAgICB0aGlzLl9taWRpSW5wdXRzLmNsZWFyKClcbiAgICB9XG4gICAgaW5wdXRzLmZvckVhY2gocG9ydCA9PiB7XG4gICAgICBpZihwb3J0IGluc3RhbmNlb2YgTUlESUlucHV0KXtcbiAgICAgICAgcG9ydCA9IHBvcnQuaWRcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuX21pZGlPdXRwdXRzLmhhcyhwb3J0KSl7XG4gICAgICAgIHRoaXMuX21pZGlPdXRwdXRzLmRlbGV0ZShwb3J0KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy90aGlzLl9taWRpT3V0cHV0cyA9IHRoaXMuX21pZGlPdXRwdXRzLmZpbHRlciguLi5vdXRwdXRzKVxuICAgIC8vY29uc29sZS5sb2codGhpcy5fbWlkaUlucHV0cylcbiAgfVxuXG4gIGdldE1JRElJbnB1dHMoKXtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9taWRpSW5wdXRzLnZhbHVlcygpKVxuICB9XG5cbiAgZ2V0TUlESU91dHB1dHMoKXtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9taWRpT3V0cHV0cy52YWx1ZXMoKSlcbiAgfVxuXG4gIHNldFJlY29yZEVuYWJsZWQodHlwZSl7IC8vICdtaWRpJywgJ2F1ZGlvJywgZW1wdHkgb3IgYW55dGhpbmcgd2lsbCBkaXNhYmxlIHJlY29yZGluZ1xuICAgIHRoaXMuX3JlY29yZEVuYWJsZWQgPSB0eXBlXG4gIH1cblxuICBfc3RhcnRSZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZEVuYWJsZWQgPT09ICdtaWRpJyl7XG4gICAgICB0aGlzLl9yZWNvcmRJZCA9IHJlY29yZElkXG4gICAgICB0aGlzLl9yZWNvcmRlZEV2ZW50cyA9IFtdXG4gICAgICB0aGlzLl9yZWNvcmRQYXJ0ID0gbmV3IFBhcnQodGhpcy5fcmVjb3JkSWQpXG4gICAgfVxuICB9XG5cbiAgX3N0b3BSZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fcmVjb3JkUGFydC5hZGRFdmVudHMoLi4udGhpcy5fcmVjb3JkZWRFdmVudHMpXG4gICAgLy90aGlzLl9zb25nLl9uZXdFdmVudHMucHVzaCguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgICB0aGlzLmFkZFBhcnRzKHRoaXMuX3JlY29yZFBhcnQpXG4gIH1cblxuICB1bmRvUmVjb3JkaW5nKHJlY29yZElkKXtcbiAgICBpZih0aGlzLl9yZWNvcmRJZCAhPT0gcmVjb3JkSWQpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMucmVtb3ZlUGFydHModGhpcy5fcmVjb3JkUGFydClcbiAgICAvL3RoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi50aGlzLl9yZWNvcmRlZEV2ZW50cylcbiAgfVxuXG4gIHJlZG9SZWNvcmRpbmcocmVjb3JkSWQpe1xuICAgIGlmKHRoaXMuX3JlY29yZElkICE9PSByZWNvcmRJZCl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5hZGRQYXJ0cyh0aGlzLl9yZWNvcmRQYXJ0KVxuICB9XG5cbiAgY29weSgpe1xuICAgIGxldCB0ID0gbmV3IFRyYWNrKHRoaXMubmFtZSArICdfY29weScpIC8vIGltcGxlbWVudCBnZXROYW1lT2ZDb3B5KCkgaW4gdXRpbCAoc2VlIGhlYXJ0YmVhdClcbiAgICBsZXQgcGFydHMgPSBbXVxuICAgIHRoaXMuX3BhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCl7XG4gICAgICBsZXQgY29weSA9IHBhcnQuY29weSgpXG4gICAgICBjb25zb2xlLmxvZyhjb3B5KVxuICAgICAgcGFydHMucHVzaChjb3B5KVxuICAgIH0pXG4gICAgdC5hZGRQYXJ0cyguLi5wYXJ0cylcbiAgICB0LnVwZGF0ZSgpXG4gICAgcmV0dXJuIHRcbiAgfVxuXG4gIHRyYW5zcG9zZShhbW91bnQ6IG51bWJlcil7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC50cmFuc3Bvc2UoYW1vdW50KVxuICAgIH0pXG4gIH1cblxuICBhZGRQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG4gICAgcGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgcGFydC5fdHJhY2sgPSB0aGlzXG4gICAgICB0aGlzLl9wYXJ0c0J5SWQuc2V0KHBhcnQuaWQsIHBhcnQpXG4gICAgICB0aGlzLl9wYXJ0cy5wdXNoKHBhcnQpXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgcGFydC5fc29uZyA9IHNvbmdcbiAgICAgICAgc29uZy5fbmV3UGFydHMucHVzaChwYXJ0KVxuICAgICAgfVxuXG4gICAgICBsZXQgZXZlbnRzID0gcGFydC5fZXZlbnRzXG4gICAgICBldmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQuX3RyYWNrID0gdGhpc1xuICAgICAgICBpZihzb25nKXtcbiAgICAgICAgICBldmVudC5fc29uZyA9IHNvbmdcbiAgICAgICAgICBzb25nLl9uZXdFdmVudHMucHVzaChldmVudClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmVudHNCeUlkLnNldChldmVudC5pZCwgZXZlbnQpXG4gICAgICB9KVxuICAgICAgdGhpcy5fZXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH0pXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlXG4gIH1cblxuICByZW1vdmVQYXJ0cyguLi5wYXJ0cyl7XG4gICAgbGV0IHNvbmcgPSB0aGlzLl9zb25nXG5cbiAgICBwYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBwYXJ0Ll90cmFjayA9IG51bGxcbiAgICAgIHRoaXMuX3BhcnRzQnlJZC5kZWxldGUocGFydC5pZCwgcGFydClcbiAgICAgIGlmKHNvbmcpe1xuICAgICAgICBzb25nLl9yZW1vdmVkUGFydHMucHVzaChwYXJ0KVxuICAgICAgfVxuXG4gICAgICBsZXQgZXZlbnRzID0gcGFydC5fZXZlbnRzXG4gICAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgICAgaWYoc29uZyl7XG4gICAgICAgICAgZXZlbnQuX3NvbmcgPSBudWxsXG4gICAgICAgICAgLy9zb25nLl9kZWxldGVkRXZlbnRzLnB1c2goZXZlbnQpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQsIGV2ZW50KVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gIH1cblxuICBnZXRQYXJ0cygpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMuX3BhcnRzID0gQXJyYXkuZnJvbSh0aGlzLl9wYXJ0c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9ldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuX2V2ZW50c0J5SWQudmFsdWVzKCkpXG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiBbLi4udGhpcy5fcGFydHNdXG4gIH1cblxuXG4gIHRyYW5zcG9zZVBhcnRzKGFtb3VudDogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQudHJhbnNwb3NlKGFtb3VudClcbiAgICB9KVxuICB9XG5cbiAgbW92ZVBhcnRzKHRpY2tzOiBudW1iZXIsIC4uLnBhcnRzKXtcbiAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpe1xuICAgICAgcGFydC5tb3ZlKHRpY2tzKVxuICAgIH0pXG4gIH1cblxuICBtb3ZlUGFydHNUbyh0aWNrczogbnVtYmVyLCAuLi5wYXJ0cyl7XG4gICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KXtcbiAgICAgIHBhcnQubW92ZVRvKHRpY2tzKVxuICAgIH0pXG4gIH1cblxuICBhZGRFdmVudHMoLi4uZXZlbnRzKXtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0KClcbiAgICBwLmFkZEV2ZW50cyguLi5ldmVudHMpXG4gICAgdGhpcy5hZGRQYXJ0cyhwKVxuICB9XG5cbiAgcmVtb3ZlRXZlbnRzKC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBwYXJ0cy5zZXQoZXZlbnQuX3BhcnQpXG4gICAgICBldmVudC5fcGFydCA9IG51bGxcbiAgICAgIGV2ZW50Ll90cmFjayA9IG51bGxcbiAgICAgIGV2ZW50Ll9zb25nID0gbnVsbFxuICAgICAgdGhpcy5fZXZlbnRzQnlJZC5kZWxldGUoZXZlbnQuaWQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX3JlbW92ZWRFdmVudHMucHVzaCguLi5ldmVudHMpXG4gICAgfVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZVxuICAgIHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkgPSB0cnVlXG4gIH1cblxuICBtb3ZlRXZlbnRzKHRpY2tzOiBudW1iZXIsIC4uLmV2ZW50cyl7XG4gICAgbGV0IHBhcnRzID0gbmV3IFNldCgpXG4gICAgZXZlbnRzLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5tb3ZlKHRpY2tzKVxuICAgICAgcGFydHMuc2V0KGV2ZW50LnBhcnQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgfVxuXG4gIG1vdmVFdmVudHNUbyh0aWNrczogbnVtYmVyLCAuLi5ldmVudHMpe1xuICAgIGxldCBwYXJ0cyA9IG5ldyBTZXQoKVxuICAgIGV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgZXZlbnQubW92ZVRvKHRpY2tzKVxuICAgICAgcGFydHMuc2V0KGV2ZW50LnBhcnQpXG4gICAgfSlcbiAgICBpZih0aGlzLl9zb25nKXtcbiAgICAgIHRoaXMuX3NvbmcuX2NoYW5nZWRQYXJ0cy5wdXNoKC4uLkFycmF5LmZyb20ocGFydHMuZW50cmllcygpKSlcbiAgICAgIHRoaXMuX3NvbmcuX21vdmVkRXZlbnRzLnB1c2goLi4uZXZlbnRzKVxuICAgIH1cbiAgfVxuXG4gIGdldEV2ZW50cyhmaWx0ZXI6IHN0cmluZ1tdID0gbnVsbCl7IC8vIGNhbiBiZSB1c2UgYXMgZmluZEV2ZW50c1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG4gICAgcmV0dXJuIFsuLi50aGlzLl9ldmVudHNdIC8vQFRPRE8gaW1wbGVtZW50IGZpbHRlciAtPiBmaWx0ZXJFdmVudHMoKSBzaG91bGQgYmUgYSB1dGlsaXR5IGZ1bmN0aW9uIChub3QgYSBjbGFzcyBtZXRob2QpXG4gIH1cblxuICBtdXRlKGZsYWc6IGJvb2xlYW4gPSBudWxsKXtcbiAgICBpZihmbGFnKXtcbiAgICAgIHRoaXMuX211dGVkID0gZmxhZ1xuICAgIH1lbHNle1xuICAgICAgdGhpcy5fbXV0ZWQgPSAhdGhpcy5fbXV0ZWRcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKXsgLy8geW91IHNob3VsZCBvbmx5IHVzZSB0aGlzIGluIGh1Z2Ugc29uZ3MgKD4xMDAgdHJhY2tzKVxuICAgIGlmKHRoaXMuX2NyZWF0ZUV2ZW50QXJyYXkpe1xuICAgICAgdGhpcy5fZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNCeUlkLnZhbHVlcygpKVxuICAgICAgdGhpcy5fY3JlYXRlRXZlbnRBcnJheSA9IGZhbHNlXG4gICAgfVxuICAgIHNvcnRFdmVudHModGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2VcbiAgfVxuXG4gIGFsbE5vdGVzT2ZmKCl7XG4gICAgaWYodGhpcy5faW5zdHJ1bWVudCAhPT0gbnVsbCl7XG4gICAgICB0aGlzLl9pbnN0cnVtZW50LmFsbE5vdGVzT2ZmKClcbiAgICB9XG5cbiAgICBsZXQgdGltZVN0YW1wID0gKGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwKSArIHRoaXMubGF0ZW5jeVxuICAgIGZvcihsZXQgb3V0cHV0IG9mIHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKXtcbiAgICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZVN0YW1wKSAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lU3RhbXApIC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHVzZUxhdGVuY3kgPSBmYWxzZSl7XG5cbiAgICBsZXQgbGF0ZW5jeSA9IHVzZUxhdGVuY3kgPyB0aGlzLmxhdGVuY3kgOiAwXG4gICAgLy9jb25zb2xlLmxvZyhsYXRlbmN5KVxuXG4gICAgLy8gc2VuZCB0byBqYXZhc2NyaXB0IGluc3RydW1lbnRcbiAgICBpZih0aGlzLl9pbnN0cnVtZW50ICE9PSBudWxsKXtcbiAgICAgIHRoaXMuX2luc3RydW1lbnQucHJvY2Vzc01JRElFdmVudChldmVudCwgZXZlbnQudGltZSAvIDEwMDApXG4gICAgfVxuXG4gICAgLy8gc2VuZCB0byBleHRlcm5hbCBoYXJkd2FyZSBvciBzb2Z0d2FyZSBpbnN0cnVtZW50XG4gICAgZm9yKGxldCBwb3J0IG9mIHRoaXMuX21pZGlPdXRwdXRzLnZhbHVlcygpKXtcbiAgICAgIGlmKHBvcnQpe1xuICAgICAgICBpZihldmVudC50eXBlID09PSAxMjggfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCBldmVudC50aW1lICsgbGF0ZW5jeSlcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTkyIHx8IGV2ZW50LnR5cGUgPT09IDIyNCl7XG4gICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgdGhpcy5jaGFubmVsLCBldmVudC5kYXRhMV0sIGV2ZW50LnRpbWUgKyBsYXRlbmN5KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbiIsImltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuXG5jb25zdFxuICBtUEkgPSBNYXRoLlBJLFxuICBtUG93ID0gTWF0aC5wb3csXG4gIG1Sb3VuZCA9IE1hdGgucm91bmQsXG4gIG1GbG9vciA9IE1hdGguZmxvb3IsXG4gIG1SYW5kb20gPSBNYXRoLnJhbmRvbVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROaWNlVGltZShtaWxsaXMpe1xuICBsZXQgaCwgbSwgcywgbXMsXG4gICAgc2Vjb25kcyxcbiAgICB0aW1lQXNTdHJpbmcgPSAnJztcblxuICBzZWNvbmRzID0gbWlsbGlzIC8gMTAwMDsgLy8g4oaSIG1pbGxpcyB0byBzZWNvbmRzXG4gIGggPSBtRmxvb3Ioc2Vjb25kcyAvICg2MCAqIDYwKSk7XG4gIG0gPSBtRmxvb3IoKHNlY29uZHMgJSAoNjAgKiA2MCkpIC8gNjApO1xuICBzID0gbUZsb29yKHNlY29uZHMgJSAoNjApKTtcbiAgbXMgPSBtUm91bmQoKHNlY29uZHMgLSAoaCAqIDM2MDApIC0gKG0gKiA2MCkgLSBzKSAqIDEwMDApO1xuXG4gIHRpbWVBc1N0cmluZyArPSBoICsgJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbSA8IDEwID8gJzAnICsgbSA6IG07XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBzIDwgMTAgPyAnMCcgKyBzIDogcztcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG1zID09PSAwID8gJzAwMCcgOiBtcyA8IDEwID8gJzAwJyArIG1zIDogbXMgPCAxMDAgPyAnMCcgKyBtcyA6IG1zO1xuXG4gIC8vY29uc29sZS5sb2coaCwgbSwgcywgbXMpO1xuICByZXR1cm4ge1xuICAgIGhvdXI6IGgsXG4gICAgbWludXRlOiBtLFxuICAgIHNlY29uZDogcyxcbiAgICBtaWxsaXNlY29uZDogbXMsXG4gICAgdGltZUFzU3RyaW5nOiB0aW1lQXNTdHJpbmcsXG4gICAgdGltZUFzQXJyYXk6IFtoLCBtLCBzLCBtc11cbiAgfTtcbn1cblxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CaW5hcnkoaW5wdXQpe1xuICBsZXQga2V5U3RyID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JyxcbiAgICBieXRlcywgdWFycmF5LCBidWZmZXIsXG4gICAgbGtleTEsIGxrZXkyLFxuICAgIGNocjEsIGNocjIsIGNocjMsXG4gICAgZW5jMSwgZW5jMiwgZW5jMywgZW5jNCxcbiAgICBpLCBqID0gMDtcblxuICBieXRlcyA9IE1hdGguY2VpbCgoMyAqIGlucHV0Lmxlbmd0aCkgLyA0LjApO1xuICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXMpO1xuICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gIGxrZXkxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aCAtIDEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoIC0gMSkpO1xuICBpZihsa2V5MSA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG4gIGlmKGxrZXkyID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcblxuICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXFw9XS9nLCAnJyk7XG5cbiAgZm9yKGkgPSAwOyBpIDwgYnl0ZXM7IGkgKz0gMykge1xuICAgIC8vZ2V0IHRoZSAzIG9jdGVjdHMgaW4gNCBhc2NpaSBjaGFyc1xuICAgIGVuYzEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMiA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMzID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzQgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG5cbiAgICBjaHIxID0gKGVuYzEgPDwgMikgfCAoZW5jMiA+PiA0KTtcbiAgICBjaHIyID0gKChlbmMyICYgMTUpIDw8IDQpIHwgKGVuYzMgPj4gMik7XG4gICAgY2hyMyA9ICgoZW5jMyAmIDMpIDw8IDYpIHwgZW5jNDtcblxuICAgIHVhcnJheVtpXSA9IGNocjE7XG4gICAgaWYoZW5jMyAhPSA2NCkgdWFycmF5W2krMV0gPSBjaHIyO1xuICAgIGlmKGVuYzQgIT0gNjQpIHVhcnJheVtpKzJdID0gY2hyMztcbiAgfVxuICAvL2NvbnNvbGUubG9nKGJ1ZmZlcik7XG4gIHJldHVybiBidWZmZXI7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVTdHJpbmcobyl7XG4gIGlmKHR5cGVvZiBvICE9ICdvYmplY3QnKXtcbiAgICByZXR1cm4gdHlwZW9mIG87XG4gIH1cblxuICBpZihvID09PSBudWxsKXtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG5cbiAgLy9vYmplY3QsIGFycmF5LCBmdW5jdGlvbiwgZGF0ZSwgcmVnZXhwLCBzdHJpbmcsIG51bWJlciwgYm9vbGVhbiwgZXJyb3JcbiAgbGV0IGludGVybmFsQ2xhc3MgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdFxccyhcXHcrKVxcXS8pWzFdO1xuICByZXR1cm4gaW50ZXJuYWxDbGFzcy50b0xvd2VyQ2FzZSgpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzb3J0RXZlbnRzKGV2ZW50cyl7XG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgbGV0IHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgIHIgPSAtMVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJcbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lmQmFzZTY0KGRhdGEpe1xuICBsZXQgcGFzc2VkID0gdHJ1ZTtcbiAgdHJ5e1xuICAgIGF0b2IoZGF0YSk7XG4gIH1jYXRjaChlKXtcbiAgICBwYXNzZWQgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gcGFzc2VkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXF1YWxQb3dlckN1cnZlKG51bVN0ZXBzLCB0eXBlLCBtYXhWYWx1ZSkge1xuICBsZXQgaSwgdmFsdWUsIHBlcmNlbnQsXG4gICAgdmFsdWVzID0gbmV3IEZsb2F0MzJBcnJheShudW1TdGVwcylcblxuICBmb3IoaSA9IDA7IGkgPCBudW1TdGVwczsgaSsrKXtcbiAgICBwZXJjZW50ID0gaSAvIG51bVN0ZXBzXG4gICAgaWYodHlwZSA9PT0gJ2ZhZGVJbicpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcygoMS4wIC0gcGVyY2VudCkgKiAwLjUgKiBtUEkpICogbWF4VmFsdWVcbiAgICB9ZWxzZSBpZih0eXBlID09PSAnZmFkZU91dCcpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcyhwZXJjZW50ICogMC41ICogTWF0aC5QSSkgKiBtYXhWYWx1ZVxuICAgIH1cbiAgICB2YWx1ZXNbaV0gPSB2YWx1ZVxuICAgIGlmKGkgPT09IG51bVN0ZXBzIC0gMSl7XG4gICAgICB2YWx1ZXNbaV0gPSB0eXBlID09PSAnZmFkZUluJyA/IDEgOiAwXG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZXNcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tNSURJTnVtYmVyKHZhbHVlKXtcbiAgLy9jb25zb2xlLmxvZyh2YWx1ZSk7XG4gIGlmKGlzTmFOKHZhbHVlKSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZih2YWx1ZSA8IDAgfHwgdmFsdWUgPiAxMjcpe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxMjcnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5cbi8qXG4vL29sZCBzY2hvb2wgYWpheFxuXG5leHBvcnQgZnVuY3Rpb24gYWpheChjb25maWcpe1xuICBsZXRcbiAgICByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgbWV0aG9kID0gdHlwZW9mIGNvbmZpZy5tZXRob2QgPT09ICd1bmRlZmluZWQnID8gJ0dFVCcgOiBjb25maWcubWV0aG9kLFxuICAgIGZpbGVTaXplO1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICByZWplY3QgPSByZWplY3QgfHwgZnVuY3Rpb24oKXt9O1xuICAgIHJlc29sdmUgPSByZXNvbHZlIHx8IGZ1bmN0aW9uKCl7fTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApe1xuICAgICAgICByZWplY3QocmVxdWVzdC5zdGF0dXMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICdqc29uJyl7XG4gICAgICAgIGZpbGVTaXplID0gcmVxdWVzdC5yZXNwb25zZS5sZW5ndGg7XG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSwgZmlsZVNpemUpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZSl7XG4gICAgICBjb25maWcub25FcnJvcihlKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vcGVuKG1ldGhvZCwgY29uZmlnLnVybCwgdHJ1ZSk7XG5cbiAgICBpZihjb25maWcub3ZlcnJpZGVNaW1lVHlwZSl7XG4gICAgICByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUpe1xuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKG1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB9XG5cbiAgICBpZihjb25maWcuZGF0YSl7XG4gICAgICByZXF1ZXN0LnNlbmQoY29uZmlnLmRhdGEpO1xuICAgIH1lbHNle1xuICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cbiovIl19
