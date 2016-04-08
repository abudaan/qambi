// @flow

import {getStore} from './create_store'
import {
  CREATE_MIDI_EVENT,
  CREATE_MIDI_NOTE,
} from './action_types'

const store = getStore()
let midiEventIndex = 0
let midiNoteIndex = 0

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


export function createMIDINote(noteon:string, noteoff:string){
  let id = `MN_${midiNoteIndex++}_${new Date().getTime()}`
  const events = store.getState().midiEvents
  let on = events[noteon]
  let off = events[noteoff]
  store.dispatch({
    type: CREATE_MIDI_NOTE,
    payload: {
      id,
      noteon,
      noteoff,
      durationTicks: off.ticks - on.ticks
    }
  })
  return id
}
