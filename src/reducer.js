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

const initialState = {
  entities: {},
}


function editor(state = initialState, action){

  let
    event, eventId,
    song, songId,
    midiEvents

  switch(action.type){

    case CREATE_SONG:
    case CREATE_TRACK:
    case CREATE_PART:
    case CREATE_MIDI_EVENT:
    case CREATE_MIDI_NOTE:
      state = {...state}
      state.entities[action.payload.id] = action.payload
      break


    case ADD_TRACKS:
      state = {...state}
      songId = action.payload.song_id
      song = state.entities[songId]
      if(song){
        let trackIds = action.payload.track_ids
        trackIds.forEach(function(trackId){
          let track = state.entities[trackId]
          if(track){
            song.trackIds.push(trackId)
            track.songId = songId
            let midiEventIds = []
            track.partIds.forEach(function(partId){
              let part = state.entities[partId]
              song.partIds.push(partId)
              midiEventIds.push(...part.midiEventIds)
            })
            midiEventIds.forEach(function(eventId){
              event = state.entities[eventId]
              event.songId = songId
              song.newEvents.set(eventId, event)
            })
            //song.newEventIds.push(...midiEventIds)
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
      let track = state.entities[trackId]
      if(track){
        //track.parts.push(...action.payload.part_ids)
        let partIds = action.payload.part_ids
        partIds.forEach(function(id){
          let part = state.entities[id]
          if(part){
            track.partIds.push(id)
            part.trackId = trackId
            part.midiEventIds.forEach(function(id){
              event = state.entities[id]
              event.trackId = trackId
              //event.instrumentId = track.instrumentId
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
      let part = state.entities[partId]
      if(part){
        //part.midiEvents.push(...action.payload.midi_event_ids)
        let midiEventIds = action.payload.midi_event_ids
        midiEventIds.forEach(function(id){
          let midiEvent = state.entities[id]
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
      eventId = action.payload.eventId
      event = state.entities[eventId];
      if(event){
        event.ticks = action.payload.ticks || event.ticks
        event.data1 = action.payload.data1 || event.data1
        event.data2 = action.payload.data2 || event.data2
        // ({
        //   ticks: event.ticks = event.ticks,
        //   data1: event.data1 = event.data1,
        //   data2: event.data2 = event.data2,
        // } = action.payload)
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
      song = state.entities[action.payload.songId];
      ({
        updateTimeEvents: song.updateTimeEvents,
        midiEvents: song.midiEvents,
        midiEventsMap: song.midiEventsMap,
        newEvents: song.newEvents,
        movedEvents: song.movedEvents,
        newEventIds: song.newEventIds,
        movedEventIds: song.movedEventIds,
        removedEventIds: song.removedEventIds,
      } = action.payload)

      // song.midiEventsMap.forEach(function(eventId, event){
      //   // replace event with updated event
      //   state.entities[eventId] = event;
      // })
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
      state.songs[action.payload.songId] = {
        songId: action.payload.songId,
        midiEvents: action.payload.midiEvents,
        settings: action.payload.settings,
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
