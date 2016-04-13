import {context} from './init_audio.js';

class Sample{

  constructor(sampleData, event){
    if(sampleData === -1){
      // create simple synth sample
      this.source = context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency
    }else{
      this.source = context.createBufferSource()
      this.source.buffer = sampleData.d;
    }
    this.output = context.createGain()
    this.output.gain.value = event.data2 / 127
    this.source.connect(this.output)
    //this.output.connect(context.destination)
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


export function createSample(...args){
  return new Sample(...args);
}
