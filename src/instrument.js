import {context} from './init_audio'
import {dispatchEvent} from './eventlistener'

export class Instrument{

  constructor(){
    this.scheduledSamples = new Map()
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
  processMIDIEvent(event){
    let time = event.time / 1000
    let sample

    if(isNaN(time)){
      // this shouldn't happen
      console.error('invalid time value')
      return
      //time = context.currentTime
    }

    if(time === 0){
      // this shouldn't happen -> external MIDI keyboards
      console.error('should not happen')
      time = context.currentTime
    }

    if(event.type === 144){
      //console.log(144, ':', time, context.currentTime, event.millis)

      sample = this.createSample(event)
      this.scheduledSamples.set(event.midiNoteId, sample)
      //console.log(sample)
      sample.output.connect(this.output)
      sample.start(time)
      //console.log('scheduling', event.id, event.midiNoteId)
      //console.log('start', event.midiNoteId)
    }else if(event.type === 128){
      //console.log(128, ':', time, context.currentTime, event.millis)
      sample = this.scheduledSamples.get(event.midiNoteId)
      if(typeof sample === 'undefined'){
        //console.info('sample not found for event', event.id, ' midiNote', event.midiNoteId, event)
        return
      }

      // we don't want that the sustain pedal prevents the an event to unscheduled
      if(this.sustainPedalDown === true){
        //console.log(event.midiNoteId)
        this.sustainedSamples.push(event.midiNoteId)
      }else{
        sample.stop(time, () => {
          // console.log('stop', time, event.midiNoteId)
          sample.output.disconnect()
          this.scheduledSamples.delete(event.midiNoteId)
        })
        //sample.stop(time)
      }
    }else if(event.type === 176){
      // sustain pedal
      if(event.data1 === 64){
        if(event.data2 === 127){
          this.sustainPedalDown = true
          ///*
          dispatchEvent({
            type: 'sustainpedal',
            data: 'down'
          })
          //*/
          //console.log('sustain pedal down')
        }else if(event.data2 === 0){
          this.sustainPedalDown = false
          this.sustainedSamples.forEach((midiNoteId) => {
            sample = this.scheduledSamples.get(midiNoteId)
            if(sample){
              //sample.stop(time)
              sample.stop(time, () => {
                //console.log('stop', midiNoteId)
                sample.output.disconnect()
                this.scheduledSamples.delete(midiNoteId)
              })
            }
          })
          //console.log('sustain pedal up', this.sustainedSamples)
          this.sustainedSamples = []
          ///*
          dispatchEvent({
            type: 'sustainpedal',
            data: 'up'
          })
          //*/
          //this.stopSustain(time);
        }

      // panning
      }else if(event.data1 === 10){
        // panning is *not* exactly timed -> not possible (yet) with WebAudio
        //console.log(data2, remap(data2, 0, 127, -1, 1));
        //track.setPanning(remap(data2, 0, 127, -1, 1));

      // volume
      }else if(event.data1 === 7){
        // to be implemented
      }
    }
  }

  // mandatory
  allNotesOff(){
    this.sustainedSamples = []
    if(this.sustainPedalDown === true){
      dispatchEvent({
        type: 'sustainpedal',
        data: 'up'
      })
    }
    this.sustainPedalDown = false

    this.scheduledSamples.forEach(sample => {
      sample.stop(context.currentTime)
      sample.output.disconnect()
    })
    this.scheduledSamples.clear()
  }

  // mandatory
  unschedule(midiEvent){
    let sample = this.scheduledSamples.get(midiEvent.midiNoteId)
    if(sample){
      sample.stop(context.currentTime)
      sample.output.disconnect()
      this.scheduledSamples.delete(midiEvent.midiNoteId)
    }
  }
}
