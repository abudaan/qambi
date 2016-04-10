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

  // for sequencer only
  SONG_POSITION,

  // for instrument only
  CREATE_INSTRUMENT,
} from './action_types'

const initialState = {
  songs: {},
  tracks: {},
  parts: {},
  midiEvents: {},
  midiNotes: {},
}


function editor(state = initialState, action){

  let
    event, eventId,
    song, songId,
    midiEvents

  switch(action.type){

    case CREATE_SONG:
      state = {...state}
      state.songs[action.payload.id] = action.payload
      break


    case CREATE_TRACK:
      state = {...state}
      state.tracks[action.payload.id] = action.payload
      break


    case CREATE_PART:
      state = {...state}
      state.parts[action.payload.id] = action.payload
      break


    case CREATE_MIDI_EVENT:
      state = {...state}
      state.midiEvents[action.payload.id] = action.payload
      break


    case CREATE_MIDI_NOTE:
      state = {...state}
      state.midiNotes[action.payload.id] = action.payload
      break


    case ADD_TRACKS:
      state = {...state}
      songId = action.payload.song_id
      song = state.songs[songId]
      if(song){
        let trackIds = action.payload.track_ids
        trackIds.forEach(function(trackId){
          let track = state.tracks[trackId]
          if(track){
            song.trackIds.push(trackId)
            track.songId = songId
            let midiEventIds = []
            track.partIds.forEach(function(partId){
              let part = state.parts[partId]
              song.partIds.push(partId)
              midiEventIds.push(...part.midiEventIds)
            })
            song.midiEventIds.push(...midiEventIds)
          }else{
            console.warn(`no track with id ${trackId}`)
          }
        })
      }else{
        console.warn(`no song found with id ${songId}`)
      }
      break


    case ADD_PARTS:
      state = {...state}
      let trackId = action.payload.track_id
      let track = state.tracks[trackId]
      if(track){
        //track.parts.push(...action.payload.part_ids)
        let partIds = action.payload.part_ids
        partIds.forEach(function(id){
          let part = state.parts[id]
          if(part){
            track.partIds.push(id)
            part.trackId = trackId
            part.midiEventIds.forEach(function(id){
              event = state.midiEvents[id]
              event.trackId = trackId
            })
          }else{
            console.warn(`no part with id ${id}`)
          }
        })
      }else{
        console.warn(`no track found with id ${trackId}`)
      }
      break


    case ADD_MIDI_EVENTS:
      state = {...state}
      let partId = action.payload.part_id
      let part = state.parts[partId]
      if(part){
        //part.midiEvents.push(...action.payload.midi_event_ids)
        let midiEventIds = action.payload.midi_event_ids
        midiEventIds.forEach(function(id){
          let midiEvent = state.midiEvents[id]
          if(midiEvent){
            part.midiEventIds.push(id)
            midiEvent.partId = partId
          }else{
            console.warn(`no MIDI event found with id ${id}`)
          }
        })
      }else{
        console.warn(`no part found with id ${partId}`)
      }
      break


    case UPDATE_MIDI_EVENT:
      state = {...state}
      eventId = action.payload.id
      event = state.midiEvents[eventId];
      if(event){
        ({
          ticks: event.ticks = event.ticks,
          data1: event.data1 = event.data1,
          data2: event.data2 = event.data2,
        } = action.payload)
      }else{
        console.warn(`no MIDI event found with id ${eventId}`)
      }
      break


    case UPDATE_MIDI_NOTE:
      state = {...state}
      let note = state.midiNotes[action.payload.id];
      ({
        // if the payload has a value for 'start' it will be assigned to note.start, otherwise note.start will keep its current value
        start: note.start = note.start,
        end: note.end = note.end,
        durationTicks: note.durationTicks = note.durationTicks
      } = action.payload)
      break


    case UPDATE_SONG:
      state = {...state};
      ({song_id: songId, midi_events: midiEvents} = action.payload)
      song = state.songs[songId]
      song.midiEventIds = []
      midiEvents.forEach(function(event){
        // put midi event ids in correct order
        song.midiEventIds.push(event.id)
        // let midiEvent = state.midiEvents[event.id];
        // ({
        //   millis: midiEvent.millis
        // } = event)
      })
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
      state.songs[action.payload.song_id] = action.payload
      break


    case SONG_POSITION:
      state = {...state}
      state.songs[action.payload.song_id].position = action.payload.position
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
