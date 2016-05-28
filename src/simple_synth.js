import {Instrument} from './instrument'
import {SampleOscillator} from './sample_oscillator'

let instanceIndex = 0

export class SimpleSynth extends Instrument{

  constructor(type: string, name: string){
    super()
    this.id = `${this.constructor.name}_${instanceIndex++}_${new Date().getTime()}`
    this.name = name || this.id
    this.type = type
    this.sampleData = {
      type,
      releaseDuration: 0.2,
      releaseEnvelope: 'equal power'
    }
  }

  createSample(event){
    return new SampleOscillator(this.sampleData, event)
  }

  // stereo spread
  setKeyScalingPanning(){
    // sets panning based on the key value, e.g. higher notes are panned more to the right and lower notes more to the left
  }

  setKeyScalingRelease(){
    // set release based on key value
  }

  /*
    @duration: milliseconds
    @envelope: linear | equal_power | array of int values
  */
  setRelease(duration: number, envelope){
    this.sampleData.releaseDuration = duration
    this.sampleData.releaseEnvelope = envelope
  }
}
