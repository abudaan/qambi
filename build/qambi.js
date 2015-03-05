(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sequencer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var config = undefined,
    ua = "NA",
    os = "unknown",
    browser = "NA";

function getConfig() {
  if (config !== undefined) {
    return config;
  }

  config = {
    legacy: false, // true if the browser uses an older version of the WebAudio API, source.noteOn() and source.noteOff instead of source.start() and source.stop()
    midi: false,
    webmidi: false,
    webaudio: true,
    jazz: false,
    ogg: false,
    mp3: false,
    bitrate_mp3_encoding: 128,
    debug: 4, // 0 = off, 1 = error, 2 = warn, 3 = info, 4 = log
    debugLevel: 4, // 0 = off, 1 = error, 2 = warn, 3 = info, 4 = log
    pitch: 440,
    bufferTime: 350 / 1000, //seconds
    autoAdjustBufferTime: false,
    noteNameMode: "sharp",
    minimalSongLength: 60000, //millis
    pauseOnBlur: false,
    restartOnFocus: true,
    defaultPPQ: 960,
    overrulePPQ: true,
    precision: 3 };

  // get browser and os
  if (navigator !== undefined) {
    ua = navigator.userAgent;

    if (ua.match(/(iPad|iPhone|iPod)/g)) {
      os = "ios";
    } else if (ua.indexOf("Android") !== -1) {
      os = "android";
    } else if (ua.indexOf("Linux") !== -1) {
      os = "linux";
    } else if (ua.indexOf("Macintosh") !== -1) {
      os = "osx";
    } else if (ua.indexOf("Windows") !== -1) {
      os = "windows";
    }

    if (ua.indexOf("Chrome") !== -1) {
      // chrome, chromium and canary
      browser = "chrome";

      if (ua.indexOf("OPR") !== -1) {
        browser = "opera";
      } else if (ua.indexOf("Chromium") !== -1) {
        browser = "chromium";
      }
    } else if (ua.indexOf("Safari") !== -1) {
      browser = "safari";
    } else if (ua.indexOf("Firefox") !== -1) {
      browser = "firefox";
    } else if (ua.indexOf("Trident") !== -1) {
      browser = "Internet Explorer";
    }

    if (os === "ios") {
      if (ua.indexOf("CriOS") !== -1) {
        browser = "chrome";
      }
    }
  } else {}
  config.ua = ua;
  config.os = os;
  config.browser = browser;

  // check if we have an audio context
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.oAudioContext || window.msAudioContext;
  config.record_audio = navigator.getUserMedia !== undefined;

  // no webaudio, return
  if (config.audio_context === false) {
    return false;
  }

  // check if audio can be recorded
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  config.audio_context = window.AudioContext !== undefined;

  // check for other 'modern' API's
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  window.Blob = window.Blob || window.webkitBlob || window.mozBlob;
  //console.log('iOS', os, context, window.Blob, window.requestAnimationFrame);

  return config;
}

module.exports = getConfig;
// means float with precision 3, e.g. 10.437

// TODO: check os here with Nodejs' require('os')

},{}],2:[function(require,module,exports){
"use strict";

var parseSamples = require("./util").parseSamples;

var context = undefined,
    frame = 0,
    lastTimeStamp = undefined,
    source = undefined,
    gainNode = undefined,
    compressor = undefined,
    compressorParams = ["threshold", "knee", "ratio", "reduction", "attack", "release"],
    emptyOgg = "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Y5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=",
    emptyMp3 = "//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=",
    hightick = "UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAACx/xf/dADOACwBsP3p+6H+zAGoBOkCCwBX/EH5OvxlA4kJ2wcSArT9E/ut+HT2evUx98n6OAF5CCUMwQvfCOsJxAx0DSIMEAq9BiAB3vhz7mLkT9sR133YxN2s5QLv0vrUBnwRnxuQJeEsSDCiMd8yFS8aKFIhohUsCKj64u625OraA9HuyPnElcP+wxvJWtW25637VQ0jHPgnBTDDM1o0CzKLK+8hzhgFDOz8Se4J47DYVtG0z5fQq9LB12rfA+j99roHAhelIyMwIjdTOuU8mjwIOGoxhCb5E53/j+3k3/fTY8pTw4y/Tr+ew8DMvdsk8RcHRRkSKO4yGTkHPkU/rzzyNcgsrR94Dp/5r+Zs17zOncoDxhfE38WLyn/TeOMi9r0IRxlRKIQzyTlOPKo9yjmWMcokDRLc/Y7rudtdzu/D2L1Iu+27JcG3yYrVLujl+3UOZx1UK5Q0qzmNPDk8ZjeeMPojzhH+/jLtPd5m0hHLHsYIw5TEMMnA0jvj8fSOBiwXASZgMzM8dUBGQbI+rzjpKkIZygZT9QflcdaRyqXCz7+VwUPH784r3K7s+v0KDu8bvyeLMb43NjrhOIo0dSvQHi0PnP6i7ovg3NTxy4/Gf8X8yH/QBtvX55P2Ygb0FcUjsy4LNmI5ejiXM38r7iC8FJwHPvok7dDgQdaJzlTKIsoFzsrVkuA87d/6qAi7FQ0h9ClKMLEz3TOrMBcqYSD8E9AFd/dS6kTf6dbU0XnQv9IH2MXfZ+ln9DEAFwwdFy8giib6KawqeChgI/UbHBOTCZj/vvXe7InlFuDN3P3b0d1F4gzpifG2+u4D7Qw1FfwbnCD+IlgjWyHLHPMVog2mBL37qvP+7NvnYuTv4rvjfubN6k3wpPZ0/WkEOwtiEUsWcxm+Gl4aOhhiFDAPIwmbAtn7TPVy77zqcefr5YHmHull7enyfPmcAHgHew1REr8Vhhd/F+AV1RJ0DikJWQNc/ZP3efKd7hvs2ur46rHs5u8e9N/48/0hA/8HFgwuD04RSBIREqsQOg7mCssGMAJW/Xn4G/TK8Lbuzu0I7qTvnPJy9sX6bP84BLYIbAwdD84QYxG7EOcODAxwCFMEAQC9+7P3SvTX8XHw+u9R8KTxIvSo9+X7VQCUBJ0IMwziDj4QLhAGD9UMrgnTBZcBRv1v+Xv2UfS+8tfx+vES87z0+vb3+Zf9ZgEQBSEIUArWC8kM2QyzC5EJEAdvBHgBXP5n++r4Avd89Wj07fMw9D31Jvfp+Uj9xQD9A8QG5QhXClELrAsvC9wJ7gd6BWIC3v6O+7T4PPZN9EHzWvNf9Pz1Fvit+qL9rQCHAwEG/weCCZUKFwvDCnIJcAcQBWcCaf8Z/CD55vaB9dD0wPSP9UL3m/k7/Mz+JwEyAw8FzAY7CBsJaQk5CWkI2gatBCICYf+j/Fr6vfiV9872sfZP91z4p/lR+3H9zf89AroEFAfjCP0Jcwo8CjAJdQdgBSEDkgDQ/Vj7ZfnR95T28fUd9v32Vvg2+nb8+/6xAWoE4AbDCP4JpAqbCqQJ0weEBfgCTACT/R37M/m+9672IPY69gb3afhW+tT8qf+MAj0FggcuCScKXAriCcMIEAfyBJYCFwCP/Rz7A/l793z2F/Zn9mH37fjd+i39yf9pAt0EFAfRCNkJGAqrCZYIvgZPBJ8B6P4//M350vdz9q/1lfUq9mz3RPmi+3H+bgFVBOQG3wgHCkwK0Am7CCAHCgWmAjAA",
    lowtick = "UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAAB0/5v+U/4T/3gA0wFTAuUB+f8d/nT90f1q/ub+tf46/mb/8wFQA9gC7wCd/mr+FAGRA3cE6wJf/h36evmv+8v/NwRHBZUC2/60+//5EvuZ/aX/bgFOAp8Azvzh9wfzLPF68zT4y/2BAygIfQwaEjYY0x31Irwl8SOWHVESOgPh9NfpReFt22nYHddD2BXcZeDa5InqgPDx9nP+6gS4CBYLnw0zES0WXxv4HkcgLh/1G+EX1RNpD4wKigXH/6r5/fNu7lTpj+Zu5hHoXOtL71byr/Qp91L64v6OBO4JoQ5zEskU+hU1FiQVeRP7EWgP4Qr0BIT+tPid9C3y1vCh8FDxJvK28vvyy/LA8pLzU/XP95v6xvw4/uD/RAK2BSkKcg6BEScTZBMeEqkPTQxjCKEEVwFi/nv7h/hp9aDyAvHP8MfxLvM+9PX0uPW19g/4Lfr7/C4AKgNaBXQGywb0BhIHWQfWB1oIzAjtCF8IHwdtBakDVwKLAeYA8v9w/kj81/nQ94v29/XX9bz1bPUY9Uz1Z/aH+Hr7yP4MAi4F+wcfCnYLNgyfDPsMSw0sDUAMfgrcB5IEMwFb/iX8T/pT+O/1X/Mf8cbvrO+18MLyvfVP+Rf9wgAoBCEHpwnIC5EN4Q5AD3wO1Ay0CpsIvwbvBNcCbQAr/nX8Ofsf+vb4mvda9rj1z/WX9pL3a/hH+ZX6R/wn/vP/eQESA/AE+wYDCcwKFAyPDCkMFQuSCe4HVQbSBHQDCwI8ANL9JPuY+HX28vTq82PzdPMV9Az1MfZ49zD5gftx/sQBBQXLB8cJ/gqpCw8MigwWDXENXQ2rDDUL7QgDBswCdv8S/K74WPVk8hXwou4P7mvu1+9T8pz1Uvli/ZoBwgWRCcsMPg/CEEQR4RDADwoO9wusCVMH4ARSApn/ufzd+Wj3bvX78xzzx/L68qzz1vSD9qX4Gfvd/c0AhwO/BWwHmghvCQEKVQonClsJCwiIBh0F0gOgAm0BOwAx/03+XP0g/Lb6cPmX+F/4vfh++TH6s/os+7/7cvwL/Zz9XP5O/3IA3AF9AzsF9gaUCAAKHgueCzcL9wntB3sF4wIzAI396fp1+Gv2IvWn9N30p/Xi9m74G/ru+9P9k/8aAYEC1AMTBSIG0wYuB1gHkgcACGEISAhTBzEFWAKt/5L92fuU+vX50fmf+SP5i/gb+Bf4mviv+Sr7kvyb/Uj+r/4X/8r/+gCiAo0EUAaRBzwISwjqB3IHGQfCBv8FpgTMApQAKf67+5n5/vfn9jz2yPVn9SL1RPXq9SP3Dvmr+6f+sQGKBAcH+whOCh0Laws3C28KLAmDB5AFfQNoAVP/Zv3e+7P6sfnL+Cv4vPeM95b37feV+Jn51Poq/LL9mv+YAVYD3gQuBmcHSAikCIEI7Af+BuEFngQXA1sBv/9v/pf9MP3W/Fj8q/sR+6H6U/o3+mP6y/pN+/f7xvye/WH+Jf9mAD4CQAQJBisHtgf6Bw0I8QdsB1sGywT4AggBCP/o/KX6mPg19572jfaz9uf2S/cM+E35E/tW/af/5wH1A8AFKgfkB/AHgwfxBlAGgQVIBMMCJwGs/43+vP0i/Zr8Lfzl+9H76fvi+9f75fsf/In8BP10/ej9cf4O/7f/dAAcAaUBEgKMAhgDpAMEBCEEDwTfA3IDxQL8ASoBUwCG/87+J/6h/Rr9pPxk/Gb8oPwJ/XH9w/39/UD+qP41/9D/WwDeAGsBAgKdAhEDQQNAA0sDbwOVA5YDVwPOAhgCVAGRAA==";

function initAudio(config) {
  return new Promise(function executor(resolve, reject) {
    context = new window.AudioContext();
    config.context = context;

    if (context.createGainNode === undefined) {
      context.createGainNode = context.createGain;
    }
    // check for older implementations of WebAudio
    source = context.createBufferSource();
    config.legacy = false;
    if (source.start === undefined) {
      config.legacy = true;
    }

    // set up the elementary audio nodes
    compressor = context.createDynamicsCompressor();
    compressor.connect(context.destination);
    gainNode = context.createGainNode();
    gainNode.connect(context.destination);
    gainNode.gain.value = 1;

    config.masterGainNode = gainNode;
    config.masterCompressor = compressor;

    parseSamples({
      ogg: emptyOgg,
      mp3: emptyMp3,
      lowtick: lowtick,
      hightick: hightick
    }).then(function onFulfilled(buffers) {
      config.ogg = buffers.ogg !== undefined;
      config.mp3 = buffers.mp3 !== undefined;
      config.lowtick = buffers.lowtick;
      config.hightick = buffers.hightick;
      if (config.ogg === false && config.mp3 === false) {
        reject("No support for ogg nor mp3!");
      } else {
        resolve(config);
      }
    }, function onRejected() {
      reject("Something went wrong while initializing Audio");
    });
  });
}

module.exports = initAudio;

},{"./util":8}],3:[function(require,module,exports){
"use strict";

function initMidi() {

    return new Promise(function executor(resolve, reject) {
        var iterator = undefined,
            data = undefined,
            port = undefined,
            name = undefined,
            doubleNames = undefined;

        //console.log(midiInitialized, navigator.requestMIDIAccess);

        if (midiInitialized === true) {
            resolve();
            return;
        }

        midiInitialized = true;
        sequencer.midiInputs = [];
        sequencer.midiOutputs = [];

        if (navigator.requestMIDIAccess !== undefined) {
            navigator.requestMIDIAccess().then(function onFulFilled(midi) {
                if (midi._jazzInstances !== undefined) {
                    sequencer.jazz = midi._jazzInstances[0]._Jazz.version;
                    sequencer.midi = true;
                } else {
                    sequencer.webmidi = true;
                    sequencer.midi = true;
                }
                iterator = midi.inputs.values();
                doubleNames = {};

                while ((data = iterator.next()).done === false) {
                    port = data.value;
                    name = port.name;
                    if (doubleNames[name] === undefined) {
                        doubleNames[name] = [];
                    }
                    doubleNames[name].push(port);
                }

                objectForEach(doubleNames, function (obj, name) {
                    var i = undefined,
                        port = undefined,
                        numPorts = obj.length;
                    //console.log(numPorts);
                    if (numPorts === 1) {
                        port = obj[0];
                        port.label = name;
                        midiInputsOrder.push({ label: port.label, id: port.id });
                        sequencer.midiInputs[port.id] = port;
                    } else {
                        for (i = 0; i < numPorts; i++) {
                            port = obj[i];
                            port.label = name + " port " + i; //(i + 1);
                            //console.log(port.id, port.label, name);
                            midiInputsOrder.push({ label: port.label, id: port.id });
                            sequencer.midiInputs[port.id] = port;
                        }
                    }
                });

                midiInputsOrder.sort(function (a, b) {
                    var nameA = a.label.toLowerCase(),
                        nameB = b.label.toLowerCase();
                    if (nameA < nameB) {
                        //sort string ascending
                        return -1;
                    } else if (nameA > nameB) {
                        return 1;
                    }
                    return 0; //default return value (no sorting)
                });

                sequencer.numMidiInputs = midiInputsOrder.length;

                iterator = midi.outputs.values();
                doubleNames = {};

                while ((data = iterator.next()).done === false) {
                    port = data.value;
                    name = port.name;
                    if (doubleNames[name] === undefined) {
                        doubleNames[name] = [];
                    }
                    doubleNames[name].push(port);
                }

                objectForEach(doubleNames, function (obj, name) {
                    var i = undefined,
                        port = undefined,
                        numPorts = obj.length;
                    //console.log(numPorts);
                    if (numPorts === 1) {
                        port = obj[0];
                        port.label = name;
                        midiOutputsOrder.push({ label: port.label, id: port.id });
                        sequencer.midiOutputs[port.id] = port;
                    } else {
                        for (i = 0; i < numPorts; i++) {
                            port = obj[i];
                            port.label = name + " port " + i; //(i + 1);
                            //console.log(port.id, port.label, name);
                            midiOutputsOrder.push({ label: port.label, id: port.id });
                            sequencer.midiOutputs[port.id] = port;
                        }
                    }
                });

                midiOutputsOrder.sort(function (a, b) {
                    var nameA = a.label.toLowerCase(),
                        nameB = b.label.toLowerCase();
                    if (nameA < nameB) {
                        //sort string ascending
                        return -1;
                    } else if (nameA > nameB) {
                        return 1;
                    }
                    return 0; //default return value (no sorting)
                });

                sequencer.numMidiOutputs = midiOutputsOrder.length;

                //console.log(sequencer.midiInputs, sequencer.midiOutputs);
                //console.log(midiInputsOrder, midiOutputsOrder);
                //console.timeEnd('parse ports');
                /*
                                    // onconnect and ondisconnect are not yet implemented in Chrome and Chromium
                                    midi.addEventListener('onconnect', function(e){
                                        console.log('device connected', e);
                                    }, false);
                
                                    midi.addEventListener('ondisconnect', function(e){
                                        console.log('device disconnected', e);
                                    }, false);
                */
                resolve();
            }, function onReject(e) {
                reject("MIDI could not be initialized:", e);
            });

            // browsers without WebMIDI API
        } else {
            if (sequencer.browser === "chrome") {
                reject("Web MIDI API not enabled");
            } else {
                reject("Web MIDI API not supported");
            }
        }
    });
}

module.exports = initMidi;

},{}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var getConfig = _interopRequire(require("./config.js"));

var initAudio = _interopRequire(require("./init_audio.js"));

var initMidi = _interopRequire(require("./init_midi.js"));

var Song = _interopRequire(require("./song.js"));

var Track = _interopRequire(require("./track.js"));

var sequencer = {
  name: "qambi",
  ui: {}, // ui functions
  util: {}, // util functions
  activeSongs: {}, // the songs that are currently loaded in memory
  midiInputs: [],
  midiOutputs: [],
  init: function init() {
    return new Promise(executor);
  }
};

function executor(resolve, reject) {
  var config = getConfig();

  if (config === false) {
    reject("The WebAudio API hasn't been implemented in " + config.browser + ", please use any other browser");
  } else {
    // add unlock method for ios devices
    // unlockWebAudio is called when the user called Song.play(), because we assume that the user presses a button to start the song.
    if (sequencer.os === "ios") {
      sequencer.unlockWebAudio = function () {};
    } else {
      sequencer.unlockWebAudio = function () {
        var src = config.context.createOscillator(),
            gainNode = config.context.createGainNode();
        gainNode.gain.value = 0;
        src.connect(gainNode);
        gainNode.connect(config.context.destination);
        if (src.noteOn !== undefined) {
          src.start = src.noteOn;
          src.stop = src.noteOff;
        }
        src.start(0);
        src.stop(0.001);
        // remove function after first use
        sequencer.unlockWebAudio = function () {};
      };
    }

    initAudio(config).then(function onFulfilled() {
      console.log(config);
      resolve();
    }, function onRejected(e) {
      reject(e);
    });
    /*
        initAudio().then(
          function onFulfilled(audio){
            settings.context = audio.context;
            initMidi().then(
              function onFulfilled(midi){
                sequencer.midiInputs = midi.inputs;
                sequencer.midiOutputs = midi.outputs;
              },
              function onRejected(e){
                //'Something went wrong while initializing MIDI'
                reject(e);
              }
            );
          },
          function onRejected(e){
            reject(e);
          }
        );
    */
  }
}

sequencer.createSong = function (config) {
  return new Song(config);
};

sequencer.createTrack = function () {
  var t = Object.create(Track);
  t.init();
  return t;
};

module.exports = sequencer;

},{"./config.js":1,"./init_audio.js":2,"./init_midi.js":3,"./song.js":5,"./track.js":7}],5:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _song_add_eventlistener = require("./song_add_eventlistener");

var addEventListener = _song_add_eventlistener.addEventListener;
var removeEventListener = _song_add_eventlistener.removeEventListener;
var dispatchEvent = _song_add_eventlistener.dispatchEvent;

var getConfig = _interopRequire(require("./config"));

var songId = 0,
    config = getConfig();

var Song = (function () {
  function Song(data) {
    _classCallCheck(this, Song);

    this.id = "S" + songId++ + new Date().getTime();
    this.data = data;
  }

  _prototypeProperties(Song, null, {
    addSamples: {

      // add samples to the instrument after it has been created, this allows you to jit load the samples of an instrument

      value: function addSamples(samples) {},
      writable: true,
      configurable: true
    },
    stop: {
      value: function stop() {
        dispatchEvent("stop");
      },
      writable: true,
      configurable: true
    },
    play: {
      value: function play() {
        dispatchEvent("play");
      },
      writable: true,
      configurable: true
    }
  });

  return Song;
})();

Song.prototype.addEventListener = addEventListener;
Song.prototype.removeEventListener = removeEventListener;
Song.prototype.dispatchEvent = dispatchEvent;

module.exports = Song;

//console.log('added', samples);

},{"./config":1,"./song_add_eventlistener":6}],6:[function(require,module,exports){
"use strict";

var listeners = {};

function addEventListener(id, callback) {
  listeners[id] = callback;
}

function removeEventListener(id, callback) {
  delete listeners[id];
}

function dispatchEvent(id) {
  for (var key in listeners) {
    if (key === id && listeners.hasOwnProperty(key)) {
      listeners[key](id);
    }
  }
}

exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
exports.dispatchEvent = dispatchEvent;
Object.defineProperty(exports, "__esModule", {
  value: true
});

},{}],7:[function(require,module,exports){
"use strict";

var trackId = 0;

var Track = {
    init: function init() {
        var id = "T" + trackId++ + new Date().getTime();
        Object.defineProperty(this, "id", {
            value: id
        });
    }
};

module.exports = Track;

},{}],8:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.typeString = typeString;
exports.ajax = ajax;
exports.parseSamples = parseSamples;

var getConfig = _interopRequire(require("./config"));

var slice = Array.prototype.slice,
    mPow = Math.pow,
    mRound = Math.round,
    mFloor = Math.floor,
    mRandom = Math.random,
    config = getConfig(),

// context = config.context,
// floor = function(value){
//  return value | 0;
// },

noteLengthNames = {
  1: "quarter",
  2: "eighth",
  4: "sixteenth",
  8: "32th",
  16: "64th"
};

function typeString(o) {
  if (typeof o != "object") {
    return typeof o;
  }

  if (o === null) {
    return "null";
  }

  //object, array, function, date, regexp, string, number, boolean, error
  var internalClass = Object.prototype.toString.call(o).match(/\[object\s(\w+)\]/)[1];
  return internalClass.toLowerCase();
}

function ajax(config) {
  var request = new XMLHttpRequest(),
      method = config.method === undefined ? "GET" : config.method,
      fileSize = undefined;

  function executor(resolve, reject) {

    reject = reject || function () {};
    resolve = resolve || function () {};

    request.onload = function () {
      if (request.status !== 200) {
        reject(request.status);
        return;
      }

      if (config.responseType === "json") {
        fileSize = request.response.length;
        request = null;
        resolve(JSON.parse(request.response), fileSize);
      } else {
        request = null;
        resolve(request.response);
      }
    };

    request.onerror = function (e) {
      config.onError(e);
    };

    request.open(method, config.url, true);

    if (config.overrideMimeType) {
      request.overrideMimeType(config.overrideMimeType);
    }

    if (config.responseType) {
      if (config.responseType === "json") {
        request.responseType = "text";
      } else {
        request.responseType = config.responseType;
      }
    }

    if (method === "POST") {
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }

    if (config.data) {
      request.send(config.data);
    } else {
      request.send();
    }
  }

  return new Promise(executor);
}

function parseSample(sample, id, every) {
  return new Promise(function (resolve, reject) {
    try {
      config.context.decodeAudioData(sample, function onSuccess(buffer) {
        //console.log(id, buffer);
        if (id !== undefined) {
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
        console.log("error decoding audiodata", id, e);
        //reject(e); // don't use reject because we use this as a nested promise and we don't want the parent promise to reject
        if (id !== undefined) {
          resolve({ id: id, buffer: undefined });
        } else {
          resolve(undefined);
        }
      });
    } catch (e) {
      console.log("error decoding audiodata", id, e);
      //reject(e);
      if (id !== undefined) {
        resolve({ id: id, buffer: undefined });
      } else {
        resolve(undefined);
      }
    }
  });
}

function loadAndParseSample(url, id, every) {
  return new Promise(function executor(resolve, reject) {
    ajax({ url: url, responseType: "arraybuffer" }).then(function onFulfilled(data) {
      parseSample(data, id, every).then(resolve, reject);
    }, function onRejected() {
      if (id !== undefined) {
        resolve({ id: id, buffer: undefined });
      } else {
        resolve(undefined);
      }
    });
  });
}

function parseSamples(mapping, every) {
  var key = undefined,
      sample = undefined,
      promises = [],
      type = typeString(mapping);

  every = typeString(every) === "function" ? every : false;
  //console.log(type, mapping)
  if (type === "object") {
    for (key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        sample = mapping[key];
        if (sample.indexOf("http://") === -1) {
          promises.push(parseSample(base64ToBinary(sample), key, every));
        } else {
          promises.push(loadAndParseSample(sample, key, every));
        }
      }
    }
  } else if (type === "array") {
    mapping.forEach(function (sample) {
      if (sample.indexOf("http://") === -1) {
        promises.push(parseSample(base64ToBinary(sample), every));
      } else {
        promises.push(loadAndParseSample(sample, every));
      }
    });
  }

  return new Promise(function (resolve, reject) {
    Promise.all(promises).then(function onFulfilled(values) {
      if (type === "object") {
        (function () {
          var mapping = {};
          values.forEach(function (value) {
            mapping[value.id] = value.buffer;
          });
          //console.log(mapping);
          resolve(mapping);
        })();
      } else if (type === "array") {
        resolve(values);
      }
    }, function onRejected(e) {
      reject(e);
    });
  });
}

// adapted version of https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js
function base64ToBinary(input) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      bytes = undefined,
      uarray = undefined,
      buffer = undefined,
      lkey1 = undefined,
      lkey2 = undefined,
      chr1 = undefined,
      chr2 = undefined,
      chr3 = undefined,
      enc1 = undefined,
      enc2 = undefined,
      enc3 = undefined,
      enc4 = undefined,
      i = undefined,
      j = 0;

  bytes = Math.ceil(3 * input.length / 4);
  buffer = new ArrayBuffer(bytes);
  uarray = new Uint8Array(buffer);

  lkey1 = keyStr.indexOf(input.charAt(input.length - 1));
  lkey2 = keyStr.indexOf(input.charAt(input.length - 1));
  if (lkey1 == 64) bytes--; //padding chars, so skip
  if (lkey2 == 64) bytes--; //padding chars, so skip

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

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
Object.defineProperty(exports, "__esModule", {
  value: true
});

},{"./config":1}]},{},[4])(4)
});


//# sourceMappingURL=qambi.js.map