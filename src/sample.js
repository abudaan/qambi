import {context} from './init_audio.js'
//import {getEqualPowerCurve} from './util.js'


class Sample{

  constructor(sampleData, event){
    this.event = event
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
    this.volume = event.data2 / 127
    this.output.gain.value = this.volume
    this.source.connect(this.output)
    //this.output.connect(context.destination)
  }

  start(time){
    //console.log(this.source);
    this.source.start(time);
  }

  stop(time, cb){
    this.source.stop(time + 0.5);
    fadeOut(this.output, {
      releaseEnvelope: 'equal power',
      releaseDuration: 0.5,
    })
    this.source.onended = cb;
  }
}


export function fadeOut(gainNode, settings){
  let now = context.currentTime
  let values, i, maxi

  //console.log(settings.releaseEnvelope)
  switch(settings.releaseEnvelope){

    case 'linear':
      gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, now)
      gainNode.gain.linearRampToValueAtTime(0, now + settings.releaseDuration)
      break

    case 'equal power':
      values = getEqualPowerCurve(100, 'fadeOut', gainNode.gain.value)
      gainNode.gain.setValueCurveAtTime(values, now, settings.releaseDuration)
      break

    case 'array':
      maxi = settings.releaseEnvelopeArray.length
      values = new Float32Array(maxi)
      for(i = 0; i < maxi; i++){
        values[i] = settings.releaseEnvelopeArray[i] * gainNode.gain.value
      }
      gainNode.gain.setValueCurveAtTime(values, now, settings.releaseDuration)
      break

    default:
  }
}


export function getEqualPowerCurve(numSteps, type, maxValue) {
  let i, value, percent,
    values = new Float32Array(numSteps);

  for(i = 0; i < numSteps; i++){
    percent = i / numSteps;
    if(type === 'fadeIn'){
      value = Math.cos((1.0 - percent) * 0.5 * Math.PI) * maxValue;
    }else if(type === 'fadeOut'){
      value = Math.cos(percent * 0.5 * Math.PI) * maxValue;
    }
    values[i] = value;
    if(i === numSteps - 1){
      values[i] = type === 'fadeIn' ? 1 : 0;
    }
  }
  return values;
}


export function createSample(...args){
  return new Sample(...args)
}


