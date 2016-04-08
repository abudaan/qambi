// @flow

import {getStore} from './create_store'
import {updateMIDINote} from './midi_note'
import {
  CREATE_MIDI_EVENT,
  UPDATE_MIDI_EVENT,
} from './action_types'

const store = getStore()
let midiEventIndex = 0

export function createMIDIEvent(ticks: number, type: number, data1: number, data2: number = -1){
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

export function moveMIDIEvent(id: string, ticks_to_move: number){
  let state = store.getState()
  let event = state.midiEvents[id]
  let ticks = event.ticks + ticks_to_move
  ticks = ticks < 0 ? 0 : ticks
  //console.log(ticks, event.ticks)
  store.dispatch({
    type: UPDATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
    }
  })
  // if the event is part of a midi note, update it
  let note_id = event.note
  if(note_id){
    updateMIDINote(note_id, state)
  }
}

export function moveMIDIEventTo(id: string, ticks: number){
  let state = store.getState()
  let event = state.midiEvents[id]
  store.dispatch({
    type: UPDATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
    }
  })
  // if the event is part of a midi note, update it
  let note_id = event.note
  if(note_id){
    updateMIDINote(note_id, state)
  }
}
