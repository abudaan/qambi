import {processMIDIEvent} from './instrument.process_midievent'
import {SampleOscillator} from './sample_oscillator'

let synthIndex = 0

export class SimpleSynth{

  constructor(type: string){
    this.id = this.id = `SYNTH_${synthIndex++}_${new Date().getTime()}`
    this.type = type
    this.scheduledSamples = {}
    this.sustainedSamples = []
    this.sustainPedalDown = false
    this.sampleData = {
      type,
      releaseDuration: 0.4,
      releaseEnvelope: 'equal power'
    }
  }

  // mandatory
  connect(output){
    this.output = output
  }

  // mandatory
  disconnect(){
    this.output = null
  }

  // mandatory
  processMIDIEvent(event, time){
    processMIDIEvent.call(this, event, time)
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
