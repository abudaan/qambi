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
      this.source.connect(config.destination);
    }
  }

  start(){
    console.log(this.source);
    this.source.start();
  }
}


export default function createSample(sampleData, event){
  return new Sample(sampleData, event);
}