// @flow

import {getStore} from './create_store'
import {
  UPDATE_MIDI_NOTE,
  CREATE_MIDI_NOTE,
} from './action_types'

const store = getStore()
let midiNoteIndex = 0

export function updateMIDINote(id, state = store.getState()){
  let note = state.midiNotes[id]
  let events = state.midiEvents
  let start = events[note.noteon]
  let end = events[note.noteoff]

  store.dispatch({
    type: UPDATE_MIDI_NOTE,
    payload: {
      id,
      start: start.ticks,
      end: end.ticks,
      durationTicks: end.ticks - start.ticks
    }
  })
}

export function createMIDINote(noteon: string, noteoff: string){
  let events = store.getState().editor.midiEvents
  let on = events[noteon]
  let off = events[noteoff]
  if(on.data1 !== off.data1){
    console.error('can\'t create MIDI note: events must have the same data1 value, i.e. the same pitch')
    return -1;
  }

  let id = `MN_${midiNoteIndex++}_${new Date().getTime()}`
  store.dispatch({
    type: CREATE_MIDI_NOTE,
    payload: {
      id,
      noteon,
      noteoff,
      start: on.ticks,
      end: off.ticks,
      durationTicks: off.ticks - on.ticks
    }
  })
  return id
}
