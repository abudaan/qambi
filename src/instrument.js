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
    this.output = context.createGain() // quick and dirty -> set up proper routing via track
    this.output.connect(context.destination)
    this.scheduled = {}
  }

  processMIDIEvent(event, time){
    //console.log(event)
    if(event.type === 144){
      let sample = createSample(-1, event, this.output)
      //this.scheduled[event.id]
      //console.log(time)
      sample.start(time)
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


