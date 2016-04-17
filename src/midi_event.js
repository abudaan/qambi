// @ flow

import {getStore} from './create_store'
import {updateMIDINote} from './midi_note'

import {
  CREATE_MIDI_EVENT,
  UPDATE_MIDI_EVENT,
} from './action_types'

const store = getStore()
let midiEventIndex = 0

class MIDIEvent{
  constructor(ticks: number, type: number, data1: number, data2: number = -1){
    this.id = `ME_${midiEventIndex++}_${new Date().getTime()}`
    this.ticks = ticks
    this.type = type
    this.data1 = data1
    this.data2 = data2
    this.frequency = 440 * Math.pow(2, (data1 - 69) / 12)
  }
}


export function createMIDIEvent(ticks: number, type: number, data1: number, data2: number = -1): string{
  let midiEvent = new MIDIEvent(ticks, type, data1, data2)
  store.dispatch({
    type: CREATE_MIDI_EVENT,
    payload: [midiEvent]
  })
  return midiEvent.id
}


export function createMIDIEvents(...args): string[]{
  let events = []
  let eventIds = []
  args.forEach(function(arr){
    let event = new MIDIEvent(arr)
    events.push(event)
    eventIds.push(event.id)
  })
  store.dispatch({
    type: CREATE_MIDI_EVENT,
    payload: events
  })
  return eventIds
}


export function getMIDIEventId(): string{
  return `ME_${midiEventIndex++}_${new Date().getTime()}`
}

export function moveMIDIEvent(eventId: string, ticks_to_move: number): void{
  let state = store.getState().editor
  let event = state.entities[eventId]

  let ticks = event.ticks + ticks_to_move
  ticks = ticks < 0 ? 0 : ticks

  let songId = event.songId || false
  if(songId){
    songId = state.entities[songId] ? songId : false
  }

  store.dispatch({
    type: UPDATE_MIDI_EVENT,
    payload: {
      eventId,
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
