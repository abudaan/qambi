'use strict';

import {log, info, warn, error} from './util';
import {getNoteNumber} from './note';
import createSample from './sample';

export class Instrument{

  constructor(){
    // create a samples data object for all 128 velocity levels of all 128 notes
    this.samplesData = new Array(128).fill(-1);
    this.samplesData = this.samplesData.map(function(){
      return new Array(128).fill(-1);
    });
    this.scheduledSamples = new Map();
  }

  processEvent(event){
    //console.log(event);
    if(event.type === 128){
      // stop sample
      if(event.midiNote === undefined){
        return;
      }
      let id = event.midiNote.id;
      let sample = this.scheduledSamples.get(id);
      sample.stop(event.time, () => this.scheduledSamples.delete(id));
      //console.log('stop', event.time);
    }else if(event.type === 144){
      // start sample
      if(event.midiNote === undefined){
        return;
      }
      let sampleData = this.samplesData[event.noteNumber][event.velocity];
      let sample = createSample(sampleData, event);
      this.scheduledSamples.set(event.midiNote.id, sample);
      //console.log('start', event.time);
      sample.start(event.time);
    }else if(event.type === 176){
      // @TODO: handle controller events
    }
  }

  /*
    @param noteId can be note name (C4) or note number (60)
    @param audio buffer
    @param config (optional)
      {
        sustain: [sustainStart, sustainEnd], // optional, in millis
        release: [releaseDuration, releaseEnvelope], // optional
        pan: panPosition // optional
        velocity: [velocityStart, velocityEnd] // optional, for multi-layered instruments
      }
  */
  addSampleData(noteId, audioBuffer,
    {
      sustain = [false, false],
      release = [false, 'default'],
      pan = false,
      velocity = [0, 127]
    } = {}){

    if(audioBuffer instanceof AudioBuffer === false){
      warn('not a valid AudioBuffer instance');
      return;
    }

    let [sustainStart, sustainEnd] = sustain;
    let [releaseDuration, releaseEnvelope] = release;
    let [velocityStart, velocityEnd] = velocity;

    if(sustain.length !== 2){
      sustainStart = sustainEnd = false;
    }

    if(releaseDuration === false){
      releaseEnvelope = false;
    }

    // log(sustainStart, sustainEnd);
    // log(releaseDuration, releaseEnvelope);
    // log(panPosition);
    // log(velocityStart, velocityEnd);

    if(isNaN(noteId)){
      noteId = getNoteNumber(noteId);
      if(isNaN(noteId)){
        warn(noteId);
      }
    }

    this.samplesData[noteId].fill({
      n: noteId,
      d: audioBuffer,
      s1: sustainStart,
      s2: sustainEnd,
      r: releaseDuration,
      e: releaseEnvelope,
      p: pan
    }, velocityStart, velocityEnd + 1);

    //console.log(this.samplesData[noteId]);
  }
}

export function createInstrument(){
  return new Instrument(...arguments);
}