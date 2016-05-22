import {context} from './init_audio.js'
import {getEqualPowerCurve} from './util.js'


class Sample{

  constructor(sampleData, event){
    this.event = event
    this.sampleData = sampleData

    if(this.sampleData === -1 || typeof this.sampleData.buffer === 'undefined'){
      // create simple synth sample
      //console.log(event.data1, event.data2)
      this.source = context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency
    }else{
      this.source = context.createBufferSource()
      //console.log(sampleData)
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
    let {sustainStart, sustainEnd, releaseEnvelopeArray} = this.sampleData
    //console.log(sustainStart, sustainEnd)
    if(sustainStart && sustainEnd){
      this.source.loop = true
      this.source.loopStart = sustainStart
      this.source.loopEnd = sustainEnd
    }
    this.source.start(time);
  }

  stop(time, cb){
    let {releaseDuration, releaseEnvelope, releaseEnvelopeArray} = this.sampleData

    this.source.onended = cb

    if(releaseDuration && releaseEnvelope){
      this.startReleasePhase = time
      this.releaseFunction = () => {
        fadeOut(this.output, {
          releaseDuration,
          releaseEnvelope,
          releaseEnvelopeArray,
        })
      }
      this.source.stop(time + releaseDuration)
      this.checkPhase()
    }else{
      this.source.stop(time)
    }
  }

  checkPhase(){
    //console.log(context.currentTime, this.startReleasePhase)
    if(context.currentTime >= this.startReleasePhase){
      this.releaseFunction()
      return
    }
    requestAnimationFrame(this.checkPhase.bind(this))
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


