'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instrument = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sample = require('./sample');

var _init_audio = require('./init_audio');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Instrument = exports.Instrument = function () {
  function Instrument(id, type) {
    _classCallCheck(this, Instrument);

    this.id = id;
    this.type = type;
    this.scheduled = {};
    this.sustained = [];
    this.sustainPedalDown = false;
  }

  _createClass(Instrument, [{
    key: 'connect',
    value: function connect(output) {
      this.output = output;
    }
  }, {
    key: 'processMIDIEvent',
    value: function processMIDIEvent(event, time) {
      var _this = this;

      var sample = void 0;
      if (event.type === 144) {
        //console.log(144, ':', time, context.currentTime, event.millis)
        sample = (0, _sample.createSample)(-1, event);
        this.scheduled[event.midiNoteId] = sample;
        sample.output.connect(this.output);
        sample.start(time);
        //console.log('start', event.midiNoteId)
      } else if (event.type === 128) {
          //console.log(128, ':', time, context.currentTime, event.millis)
          sample = this.scheduled[event.midiNoteId];
          if (typeof sample === 'undefined') {
            console.error('sample not found for event', event);
            return;
          }
          if (this.sustainPedalDown === true) {
            //console.log(event.midiNoteId)
            this.sustained.push(event.midiNoteId);
          } else {
            sample.stop(time, function () {
              //console.log('stop', event.midiNoteId)
              delete _this.scheduled[event.midiNoteId];
            });
          }
        } else if (event.type === 176) {
          // sustain pedal
          if (event.data1 === 64) {
            if (event.data2 === 127) {
              this.sustainPedalDown = true;
              //console.log('sustain pedal down')
              //dispatchEvent(this.track.song, 'sustain_pedal', 'down');
            } else if (event.data2 === 0) {
                this.sustainPedalDown = false;
                this.sustained.forEach(function (midiNoteId) {
                  _this.scheduled[midiNoteId].stop(event.time, function () {
                    //console.log('stop', midiNoteId)
                    delete _this.scheduled[midiNoteId];
                  });
                });
                //console.log('sustain pedal up', this.sustained)
                this.sustained = [];
                //dispatchEvent(this.track.song, 'sustain_pedal', 'up');
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
    key: 'stopAllSounds',
    value: function stopAllSounds() {
      var _this2 = this;

      console.log('stopAllSounds');
      Object.keys(this.scheduled).forEach(function (sampleId) {
        _this2.scheduled[sampleId].stop(0, function () {
          delete _this2.scheduled[sampleId];
        });
      });
    }
  }]);

  return Instrument;
}();