import {combineReducers} from 'redux'
import {
  ADD_MIDI_NOTES,
  ADD_TIME_EVENTS,
  CREATE_MIDI_EVENT,
  CREATE_MIDI_NOTE,
  ADD_EVENTS_TO_SONG,
  UPDATE_MIDI_EVENT,
  UPDATE_MIDI_NOTE,
} from './action_types'

const initialState = {
  ppq: 960,
  bpm: 120,
  bars: 30,
  lowestNote: 0,
  highestNote: 127,
  nominator: 4,
  denominator: 4,
  quantizeValue: 8,
  fixedLengthValue: false,
  positionType: 'all',
  useMetronome: false,
  autoSize: true,
  loop: false,
  playbackSpeed: 1,
  autoQuantize: false,
  timeEvents: [],
  midiEvents: [],
  parts: [],
  tracks: [],
}


function song(state = initialState, action){

  switch(action.type){
    case ADD_MIDI_NOTES:
      console.log('adding MIDI notes')
      break
    case ADD_TIME_EVENTS:
      console.log('adding time events')
      break
    default:
      // do nothing
  }
  return state
}

function songs(state = {}, action){
  return state
}

function tracks(state = {}, action){
  return state
}

function parts(state = {}, action){
  return state
}

function midiEvents(state = {}, action){
  switch(action.type){
    case CREATE_MIDI_EVENT:
      state = Object.assign({}, state, {[action.payload.id]: action.payload})
      break

    case UPDATE_MIDI_EVENT:
      state = Object.assign({}, state)
      let event = state[action.payload.id];
      ({
        ticks: event.ticks = event.ticks,
        data1: event.data1 = event.data1,
        data2: event.data2 = event.data2,
      } = action.payload)
      break

    case CREATE_MIDI_NOTE:
      let noteon = action.payload.noteon
      let noteoff = action.payload.noteoff
      state = Object.assign({}, state)
      state[noteon].note = action.payload.id
      state[noteoff].note = action.payload.id
      break

    default:
      // do nothing
  }
  return state
}

function midiNotes(state = {}, action){
  switch(action.type){
    case CREATE_MIDI_NOTE:
      state = Object.assign({}, state)
      state[action.payload.id] = action.payload
      //console.log(state)
      break

    case UPDATE_MIDI_NOTE:
      state = Object.assign({}, state)
      let note = state[action.payload.id];
      ({
        start: note.start = note.start,
        end: note.end = note.end,
        durationTicks: note.durationTicks = note.durationTicks
      } = action.payload)
      break

    default:
      // do nothing
  }
  return state
}

const sequencerApp = combineReducers({
  song,
  tracks,
  midiEvents,
  midiNotes,
})

export default sequencerApp
