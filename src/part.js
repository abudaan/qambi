// @ flow

import {getStore} from './create_store'
import {
  CREATE_PART,
  ADD_MIDI_EVENTS,
} from './action_types'

const store = getStore()
let partIndex = 0

class Part{
  //id: string;
  constructor(settings: {name: string, trackId: string, midiEventIds: Array<string>} = {}){
    this.id = `MP_${partIndex++}_${new Date().getTime()}`;
    ({
      name: this.name = this.id,
      trackId: this.trackId = false,
      midiEventIds: this.midiEventIds = []
    } = settings)
    this.mute = false
  }
}


export function createPart(settings: {name: string, trackId: string, midiEventIds: Array<string>} = {}): string{
  let part = new Part(settings)
  store.dispatch({
    type: CREATE_PART,
    payload: [part]
  })
  return part.id
}

export function createParts(...args): string[]{
  let parts = []
  let partIds = []
  // allow to pass a number: createParts(5) --> creates 5 default parts
  if(args.length === 1 && typeof args[0] === 'number'){
    args = new Array(args[0]).fill({});
  }
  args.forEach(function(settings){
    let part = new Part(settings)
    parts.push(part)
    partIds.push(part.id)
  })
  store.dispatch({
    type: CREATE_PART,
    payload: parts
  })
  return partIds
}


export function addMIDIEvents(partId: string, ...midiEventIds: string[]): void{
  store.dispatch({
    type: ADD_MIDI_EVENTS,
    payload: {
      partId,
      midiEventIds
    }
  })
}
