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