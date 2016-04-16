// @flow

import {getStore} from './create_store'
import {updateMIDINote} from './midi_note'

import {
  CREATE_MIDI_EVENT,
  UPDATE_MIDI_EVENT,
} from './action_types'

const store = getStore()
let midiEventIndex = 0

export function createMIDIEvent(ticks: number, type: number, data1: number, data2: number = -1): string{
  let id = `ME_${midiEventIndex++}_${new Date().getTime()}`
  store.dispatch({
    type: CREATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
      type,
      data1,
      data2,
      state: 0,
      frequency: 440 * Math.pow(2, (data1 - 69) / 12),
    }
  })
  return id
}

export function getMIDIEventId(): string{
  return `ME_${midiEventIndex++}_${new Date().getTime()}`
}

export function moveMIDIEvent(eventId: string, ticks_to_move: number): void{
  let state = store.getState().editor
  //let event = state.entities[id]

  let song = state.entities[eventId]
  let event = song.midiEvents[0]
  //console.log(event)

  let ticks = event.ticks + ticks_to_move
  ticks = ticks < 0 ? 0 : ticks
  let songId = event.songId || false
  if(songId){
    songId = state.entities[songId] ? songId : false
  }

  store.dispatch({
    type: UPDATE_MIDI_EVENT,
    payload: {
      eventId: event.id,
      ticks,
      songId,
    }
  })
  // if the event is part of a midi note, update it
  let note_id = event.note
  if(note_id){
    updateMIDINote(note_id, state)
  }
}

export function moveMIDIEventTo(id: string, ticks: number): void{
  let state = store.getState().editor
  let event = state.entities[id]
  store.dispatch({
    type: UPDATE_MIDI_EVENT,
    payload: {
      id,
      ticks,
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
