// @flow
import {
  ADD_MIDI_NOTES,
  ADD_TIME_EVENTS
} from './action_types'


export default function addMIDINotes(notes){
  return {
    type: ADD_MIDI_NOTES,
    notes
  }
}

export default function addTimeEvents(events){
  return {
    type: ADD_MIDI_NOTES,
    events
  }
}
