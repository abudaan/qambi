import {context} from './init_audio.js'
import {getEqualPowerCurve} from './util.js'


class Sample{

  constructor(sampleData, event){
    this.event = event
    this.sampleData = sampleData

    if(this.sampleData === -1 || typeof this.sampleData.buffer === 'undefined'){
      // create simple synth sample
      this.source = context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency
    }else{
      this.source = context.createBufferSource()
      this.source.buffer = sampleData.buffer;
      //console.log(this.source.buffer)
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
    let {releaseDuration, releaseEnvelope, releaseEnvelopeArray} = this.sampleData
    if(releaseDuration && releaseEnvelope){
      this.source.stop(time + releaseDuration)
      fadeOut(this.output, {
        releaseDuration,
        releaseEnvelope,
        releaseEnvelopeArray,
      })
    }else{
      this.source.stop(time);
    }

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

    case 'equal_power':
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


export function createSample(...args){
  return new Sample(...args)
}


