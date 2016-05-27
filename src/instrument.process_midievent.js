import {context} from './init_audio'


export function processMIDIEvent(event, time = 0){
  console.log(event, time)
  let sample
  let unschedule = false

  if(isNaN(time)){
    // this shouldn't happen
    console.error('invalid time value')
    return
    //time = context.currentTime
  }

  // two cases whereby the event neess to be processed immediately
  if(time === 0){
    // this is an event that is send from an external MIDI keyboard
    time = context.currentTime
  }else if(time === -1){
    // this is an event that has been unscheduled by the scheduler, for instance because the event has been deleted
    time = context.currentTime
    unschedule = true
  }

  if(event.type === 144){
    //console.log(144, ':', time, context.currentTime, event.millis)

    sample = this.createSample(event)
    this.scheduledSamples[event.midiNoteId] = sample
    //console.log(sample)
    sample.output.connect(this.output || context.destination)
    sample.start(time)
    //console.log('scheduling', event.id, event.midiNoteId)
    //console.log('start', event.midiNoteId)
  }else if(event.type === 128){
    //console.log(128, ':', time, context.currentTime, event.millis)
    sample = this.scheduledSamples[event.midiNoteId]
    if(typeof sample === 'undefined'){
      //console.info('sample not found for event', event.id, ' midiNote', event.midiNoteId, event)
      return
    }

    // we don't want that the sustain pedal prevents the an event to unscheduled
    if(this.sustainPedalDown === true && unschedule === false){
      //console.log(event.midiNoteId)
      this.sustainedSamples.push(event.midiNoteId)
    }else{
      sample.stop(time, () => {
        //console.log('stop', time, event.midiNoteId)
        delete this.scheduledSamples[event.midiNoteId]
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
          sample = this.scheduledSamples[midiNoteId]
          if(sample){
            //sample.stop(time)
            sample.stop(time, () => {
              //console.log('stop', midiNoteId)
              delete this.scheduledSamples[midiNoteId]
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


// allows you to call allNotesOff per track/instrument
export function allNotesOff(){
  this.sustainedSamples = []
  if(this.sustainPedalDown === true){
    dispatchEvent({
      type: 'sustainpedal',
      data: 'up'
    })
  }
  this.sustainPedalDown = false

  Object.keys(this.scheduledSamples).forEach((sampleId) => {
    //console.log('  stopping', sampleId, this.id)
    let sample = this.scheduledSamples[sampleId]
    //console.log(sample)
    this.scheduledSamples[sampleId].stop(context.currentTime, () => {
      //console.log('allNotesOff', sample.event.midiNoteId)
      delete this.scheduledSamples[sample.event.midiNoteId]
    })
  })
  this.scheduledSamples = {}

  //console.log('allNotesOff', this.sustainedSamples.length, this.scheduledSamples)
}
