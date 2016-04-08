// @flow

import {getStore} from './create_store'
import {CREATE_MIDI_EVENT} from './action_types'

const store = getStore()
let midiEventIndex = 0

export function createMIDIEvent(ticks:number, type:number, data1:number, data2:number = -1){
  let id = `ME_${midiEventIndex++}_${new Date().getTime()}`
  store.dispatch({
    type: CREATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
      type,
      data1,
      data2
    }
  })
  return id
}
