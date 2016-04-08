import {combineReducers} from 'redux'
import {
  CREATE_SONG,
  ADD_MIDI_NOTES,
  ADD_TIME_EVENTS,
  CREATE_MIDI_EVENT,
  CREATE_MIDI_NOTE,
  ADD_EVENTS_TO_SONG,
  UPDATE_MIDI_EVENT,
  UPDATE_MIDI_NOTE,
} from './action_types'


function songs(state = {}, action){
  switch(action.type){
    case CREATE_SONG:
      state = {...state, [action.payload.id]: action.payload.settings}
      break
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

function parts(state = {}, action){
  return state
}

function midiEvents(state = {}, action){
  switch(action.type){
    case CREATE_MIDI_EVENT:
      state = {...state, [action.payload.id]: action.payload}
      //state = Object.assign({}, state, {[action.payload.id]: action.payload})
      break

    case UPDATE_MIDI_EVENT:
      state = {...state}
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
      state = {...state}
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
      state = {...state, [action.payload.id]: action.payload}
      //console.log(state)
      break

    case UPDATE_MIDI_NOTE:
      state = {...state}
      let note = state[action.payload.id];
      ({
        // if the payload has a value for 'start' it will be assigned to note.start, otherwise note.start will keep its current value
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
  songs,
  tracks,
  midiEvents,
  midiNotes,
})

export default sequencerApp
