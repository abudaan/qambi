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

function track(state = {}, action){
  return state
}

function midiEvent(state = initialState, action){
  switch(action.type){
    case CREATE_MIDI_EVENT:
      //console.log('create MIDI event', action.payload)
      state = Object.assign(
        {},
        state,
        {
          midievents: Object.assign({}, state.midievents, {[action.payload.id]: action.payload})
        }
      )
      //state.midievents = Object.assign({}, state.midievents, {[action.payload.id]: action.payload})
      //console.log(action.payload.id, state.midievents)
      break
    default:
      // do nothing
  }
  return state
}

const sequencerApp = combineReducers({
  song,
  track,
  midiEvent,
})

export default sequencerApp
