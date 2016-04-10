import {getStore} from './create_store'
import {createSample} from './sample'
import {context} from './io'
import {
  CREATE_INSTRUMENT,
} from './action_types'

const store = getStore()
let instrumentIndex = 0

class Instrument{

  constructor(id: string, type: string){
    this.id = id
    this.type = type
    this.scheduled = {}
  }

  processMIDIEvent(event, time, output){
    //console.log(event)
    let sample
    if(event.type === 144){
      sample = createSample(-1, event, this.output)
      this.scheduled[event.midiNoteId] = sample
      sample.output.connect(output)
      sample.start(time)
    }else if(event.type === 128){
      sample = this.scheduled[event.midiNoteId]
      sample.stop(time, () => {
        //console.log('stop!')
        delete this.scheduled[event.midiNoteId]
      })
    }
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


