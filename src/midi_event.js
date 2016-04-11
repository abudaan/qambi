// @flow

import {getStore} from './create_store'
import {updateMIDINote} from './midi_note'
//import {createNote} from './note.js';
import {
  CREATE_MIDI_EVENT,
  UPDATE_MIDI_EVENT,
} from './action_types'

const store = getStore()
let midiEventIndex = 0

export function createMIDIEvent(ticks: number, type: number, data1: number, data2: number = -1){
  let id = `ME_${midiEventIndex++}_${new Date().getTime()}`
  let sortIndex = ticks + type
  if(type === 144 || type === 128){
    sortIndex = ticks + type
  }
  store.dispatch({
    type: CREATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
      type,
      sortIndex,
      data1,
      data2,
      frequency: 440 * Math.pow(2, (data1 - 69) / 12),
    }
  })
  return id
}

export function getMIDIEventId(){
  return `ME_${midiEventIndex++}_${new Date().getTime()}`
}

export function moveMIDIEvent(id: string, ticks_to_move: number){
  let state = store.getState().editor
  let event = state.midiEvents[id]
  let ticks = event.ticks + ticks_to_move
  ticks = ticks < 0 ? 0 : ticks
  //console.log(ticks, event.ticks)
  store.dispatch({
    type: UPDATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
      sortIndex: ticks + event.type
    }
  })
  // if the event is part of a midi note, update it
  let note_id = event.note
  if(note_id){
    updateMIDINote(note_id, state)
  }
}

export function moveMIDIEventTo(id: string, ticks: number){
  let state = store.getState().editor
  let event = state.midiEvents[id]
  store.dispatch({
    type: UPDATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
      sortIndex: ticks + event.type
    }
  })
  if(typeof event === 'undefined'){
    console.error('event is undefined') //this should't happen!
  }
  // if the event is part of a midi note, update it
  let note_id = event.note
  if(note_id){
    updateMIDINote(note_id, state)
  }
}
