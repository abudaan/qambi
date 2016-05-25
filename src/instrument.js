import {processMIDIEvent, allNotesOff} from './instrument.process_midievent'

export class Instrument{

  constructor(){
    this.scheduledSamples = {}
    this.sustainedSamples = []
    this.sustainPedalDown = false
    this.output = null
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

  // mandatory
  allNotesOff(){
    allNotesOff.call(this)
  }
}
