import {combineReducers} from 'redux'
import {
  ADD_MIDI_NOTES,
  ADD_TIME_EVENTS,
  CREATE_MIDI_EVENT,
  CREATE_MIDI_NOTE,
} from './action_types'

const initialState = {
  default_song: {
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
  },
  songs: {},
  tracks: {},
  parts: {},
  midinotes: {},
  midievents: {},
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

function tracks(state = {}, action){
  return state
}

function midiEvents(state = {}, action){
  switch(action.type){
    case CREATE_MIDI_EVENT:
      state = Object.assign({}, state, {[action.payload.id]: action.payload})
      break

    case CREATE_MIDI_NOTE:
      let noteon = action.payload.noteon
      let noteoff = action.payload.noteoff
      state = Object.assign({}, state)
      delete state[noteon]
      delete state[noteoff]
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
