'use strict';

import getConfig from './config.js';


let config = getConfig();

class Sample{

  constructor(sampleData, event){
    if(sampleData === -1){
      // create simple synth sample
      this.source = config.context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency;
      //this.source.connect(config.destination);

      // tmp!
      let volume = config.context.createGain();
      volume.gain.value = 0.3;
      this.source.connect(volume);
      volume.connect(config.destination);
    }
  }

  start(time){
    //console.log(this.source);
    this.source.start(time);
  }

  stop(time, cb){
    this.source.stop(time);
    this.source.onended = cb;
  }
}


export default function createSample(sampleData, event){
  return new Sample(sampleData, event);
}