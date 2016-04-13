import {getStore} from './create_store'
import {createSample} from './sample'
import {getAudioContext} from './init_audio'
import {
  CREATE_INSTRUMENT,
} from './action_types'

const store = getStore()
const context = getAudioContext()
let instrumentIndex = 0

class Instrument{

  constructor(id: string, type: string){
    this.id = id
    this.type = type
    this.scheduled = {}
    this.sustained = []
    this.sustainPedalDown = false
  }

  processMIDIEvent(event, time, output){
    let sample
    if(event.type === 144){
      //console.log(144, ':', time, context.currentTime, event.millis)
      sample = createSample(-1, event)
      this.scheduled[event.midiNoteId] = sample
      sample.output.connect(output)
      sample.start(time)
      //console.log('start', event.midiNoteId)
    }else if(event.type === 128){
      //console.log(128, ':', time, context.currentTime, event.millis)
      sample = this.scheduled[event.midiNoteId]
      if(typeof sample === 'undefined'){
        console.error('sample not found for event', event)
        return
      }
      if(this.sustainPedalDown === true){
        //console.log(event.midiNoteId)
        this.sustained.push(event.midiNoteId)
      }else{
        sample.stop(time, () => {
          //console.log('stop', event.midiNoteId)
          delete this.scheduled[event.midiNoteId]
        })
      }
    }else if(event.type === 176){
      // sustain pedal
      if(event.data1 === 64){
        if(event.data2 === 127){
          this.sustainPedalDown = true
          //console.log('sustain pedal down')
          //dispatchEvent(this.track.song, 'sustain_pedal', 'down');
        }else if(event.data2 === 0){
          this.sustainPedalDown = false
          this.sustained.forEach((midiNoteId) => {
            this.scheduled[midiNoteId].stop(event.time, () => {
              //console.log('stop', midiNoteId)
              delete this.scheduled[midiNoteId]
            })
          })
          //console.log('sustain pedal up', this.sustained)
          this.sustained = []
          //dispatchEvent(this.track.song, 'sustain_pedal', 'up');
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

  stopAllSounds(){
    Object.keys(this.scheduled).forEach((sampleId) => {
      this.scheduled[sampleId].stop(0, () => {
        delete this.scheduled[sampleId]
      })
    })
  }
}

export function createInstrument(type: string){
  let id = `IN_${instrumentIndex++}_${new Date().getTime()}`
  let instrument = new Instrument(id, type)
  store.dispatch({
    type: CREATE_INSTRUMENT,
    payload: {
      id,
      instrument
    }
  })
  return id
}


