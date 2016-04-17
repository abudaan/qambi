import {combineReducers} from 'redux'
import {
  // for editor
  CREATE_SONG,
  CREATE_TRACK,
  CREATE_PART,
  ADD_PARTS,
  ADD_TRACKS,
  ADD_MIDI_NOTES,
  ADD_MIDI_EVENTS,
  ADD_TIME_EVENTS,
  CREATE_MIDI_EVENT,
  CREATE_MIDI_NOTE,
  ADD_EVENTS_TO_SONG,
  UPDATE_MIDI_EVENT,
  UPDATE_MIDI_NOTE,
  UPDATE_SONG,
  SET_INSTRUMENT,
  SET_MIDI_OUTPUT_IDS,

  // for sequencer only
  SONG_POSITION,
  START_SCHEDULER,
  STOP_SCHEDULER,

  // for instrument only
  CREATE_INSTRUMENT,
  STORE_SAMPLES,
} from './action_types'

import{
  addTracks,
  addParts,
  addMIDIEvents,
} from './reducer_helpers'

const initialState = {
  entities: {},
}


function editor(state = initialState, action){

  let
    eventId,
    song

  switch(action.type){

    case CREATE_SONG:
    case CREATE_TRACK:
    case CREATE_PART:
    case CREATE_MIDI_EVENT:
    case CREATE_MIDI_NOTE:
      state = {...state}
      action.payload.forEach(function(entity){
        state.entities[entity.id] = entity
      })
      break

    case ADD_TRACKS:
      state = addTracks(state, action)
      break

    case ADD_PARTS:
      state = addParts(state, action)
      break

    case ADD_MIDI_EVENTS:
      state = addMIDIEvents(state, action)
      break


    case UPDATE_MIDI_EVENT:
      state = {...state}
      eventId = action.payload.eventId
      let event = state.entities[eventId];
      if(event){
        ({
          ticks: event.ticks = event.ticks,
          data1: event.data1 = event.data1,
          data2: event.data2 = event.data2,
        } = action.payload)
      }else{
        console.warn(`no MIDI event found with id ${eventId}`)
      }
      if(action.payload.songId !== false){
        song = state.entities[action.payload.songId]
        song.movedEvents.set(eventId, event)
        //song.movedEventIds.push(eventId)
      }
      break


    case UPDATE_MIDI_NOTE:
      state = {...state}
      let note = state.entities[action.payload.id];
      ({
        // if the payload has a value for 'start' it will be assigned to note.start, otherwise note.start will keep its current value
        start: note.start = note.start,
        end: note.end = note.end,
        durationTicks: note.durationTicks = note.durationTicks
      } = action.payload)
      break


    case UPDATE_SONG:
      state = {...state};
      song = action.payload
      state.entities[song.id] = song
      song.midiEvents.forEach(function(event){
        // replace event with updated event
        state.entities[event.id] = event;
      })
      break


    case SET_INSTRUMENT:
      state = {...state};
      state.entities[action.payload.trackId].instrument = action.payload.instrument
      break


    case SET_MIDI_OUTPUT_IDS:
      state = {...state};
      state.entities[action.payload.trackId].MIDIOutputIds = action.payload.outputIds
      break

    default:
      // do nothing
  }
  return state
}

// state when a song is playing
function sequencer(state = {songs: {}}, action){
  switch(action.type){

    case UPDATE_SONG:
      state = {...state}
      let song = action.payload
      state.songs[song.id] = {
        songId: song.id,
        midiEvents: song.midiEvents,
        settings: song.settings,
        playing: false,
      }
      break


    case START_SCHEDULER:
      state = {...state}
      state.songs[action.payload.songId].scheduler = action.payload.scheduler
      state.songs[action.payload.songId].playing = true
      break


    case STOP_SCHEDULER:
      state = {...state}
      delete state.songs[action.payload.songId].scheduler
      state.songs[action.payload.songId].playing = false
      break


    case SONG_POSITION:
      state = {...state}
      state.songs[action.payload.songId].position = action.payload.position
      break


    default:
      // do nothing
  }
  return state;
}


function gui(state = {}, action){
  return state;
}


function instruments(state = {}, action){
  switch(action.type){
    case CREATE_INSTRUMENT:
      state = {...state}
      state[action.payload.id] = action.payload.instrument
      //state = {...state, ...{[action.payload.id]: action.payload.instrument}}
      break

    case STORE_SAMPLES:
      state = {...state}
      console.log(action.payload)
      break

    default:
  }
  return state;
}


const sequencerApp = combineReducers({
  gui,
  editor,
  sequencer,
  instruments,
})


export default sequencerApp
