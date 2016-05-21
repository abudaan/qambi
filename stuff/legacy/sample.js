'use strict';

import getConfig from './config.js';


let config = getConfig();

class Sample{

  constructor(sampleData, event, output){
    if(sampleData === -1){
      // create simple synth sample
      this.source = config.context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency;
    }else{
      this.source = config.context.createBufferSource()
      this.source.buffer = sampleData.d;
    }
    output.gain.value = event.velocity/127;
    this.source.connect(output);
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


export default function createSample(...args){
  return new Sample(...args);
}