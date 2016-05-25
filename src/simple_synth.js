import {processMIDIEvent} from './instrument.process_midievent'
import {typeString} from './util'


export class SimpleSynth{

  constructor(id: string, type: string){
    this.id = id
    this.type = type
    this.scheduledSamples = {}
    this.sustainedSamples = []
    this.sustainPedalDown = false
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

  createSample(sampleData, event){
    return new Sample(sampleData, event)
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
  }
}
