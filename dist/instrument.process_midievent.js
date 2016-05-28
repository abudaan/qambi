'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processMIDIEvent = processMIDIEvent;
exports.allNotesOff = allNotesOff;

var _init_audio = require('./init_audio');

var _eventlistener = require('./eventlistener');

function processMIDIEvent(event) {
  var _this = this;

  var time = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  //console.log(event, time)
  var sample = void 0;

  if (isNaN(time)) {
    // this shouldn't happen
    console.error('invalid time value');
    return;
    //time = context.currentTime
  }

  // this is an event that is send from an external MIDI keyboard
  if (time === 0) {
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

// allows you to call allNotesOff per track/instrument
function allNotesOff() {
  this.sustainedSamples = [];
  if (this.sustainPedalDown === true) {
    (0, _eventlistener.dispatchEvent)({
      type: 'sustainpedal',
      data: 'up'
    });
  }
  this.sustainPedalDown = false;

  this.scheduledSamples.forEach(function (sample) {
    //console.log('  stopping', sampleId, this.id)
    //let sample = this.scheduledSamples[sampleId]
    // try{
    //   sample.source.stop()
    // }catch(e){
    //   //
    // }
    //sample.sampleData = {releaseDuration: 0} // remove release and such -> we need to stop the sound immediately
    //console.log(sample)

    // sample.stop(context.currentTime, () => {
    //   //console.log('allNotesOff', sample.event.midiNoteId)
    //   this.scheduledSamples.delete(sample.event.midiNoteId)
    // })
    sample.stop(_init_audio.context.currentTime);
  });

  this.scheduledSamples.clear();

  //console.log('allNotesOff', this.scheduledSamples.size)
}