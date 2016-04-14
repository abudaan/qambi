//@ flow

import {getStore} from './create_store'
import {parseTimeEvents, parseEvents, parseMIDINotes, filterEvents} from './parse_events'
import {getMIDIEventId} from './midi_event'
import {addTask, removeTask} from './heartbeat'
import {context} from './init_audio'
import Scheduler from './scheduler'
import {
  CREATE_SONG,
  ADD_TRACKS,
  UPDATE_SONG,
  SONG_POSITION,
  ADD_MIDI_EVENTS_TO_SONG,
  START_SCHEDULER,
  STOP_SCHEDULER,
} from './action_types'
import qambi from './qambi'

const store = getStore()
let songIndex = 0

const defaultSong = {
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
  autoQuantize: false
}
/*
type songSettings = {
  name: string,
  ppq: number,
  bpm: number,
  bars: number,
  lowestNote: number,
  highestNote: number,
  nominator: number,
  denominator: number,
  quantizeValue: number,
  fixedLengthValue: number,
  positionType: string,
  useMetronome: boolean,
  autoSize: boolean,
  loop: boolean,
  playbackSpeed: number,
  autoQuantize: boolean
}
*/

export function createSong(settings: {} = {}): string{
  let id = `S_${songIndex++}_${new Date().getTime()}`
  let s = {};
  ({
    name: s.name = id,
    ppq: s.ppq = defaultSong.ppq,
    bpm: s.bpm = defaultSong.bpm,
    bars: s.bars = defaultSong.bars,
    lowestNote: s.lowestNote = defaultSong.lowestNote,
    highestNote: s.highestNote = defaultSong.highestNote,
    nominator: s.nominator = defaultSong.nominator,
    denominator: s.denominator = defaultSong.denominator,
    quantizeValue: s.quantizeValue = defaultSong.quantizeValue,
    fixedLengthValue: s.fixedLengthValue = defaultSong.fixedLengthValue,
    positionType: s.positionType = defaultSong.positionType,
    useMetronome: s.useMetronome = defaultSong.useMetronome,
    autoSize: s.autoSize = defaultSong.autoSize,
    loop: s.loop = defaultSong.loop,
    playbackSpeed: s.playbackSpeed = defaultSong.playbackSpeed,
    autoQuantize: s.autoQuantize = defaultSong.autoQuantize,
  } = settings)

  let{
    timeEvents: timeEvents = [
      {id: getMIDIEventId(), song: id, ticks: 0, type: qambi.TEMPO, data1: s.bpm},
      {id: getMIDIEventId(), song: id, ticks: 0, type: qambi.TIME_SIGNATURE, data1: s.nominator, data2: s.denominator}
    ],
    midiEventIds: midiEventIds = [],
    partIds: partIds = [],
    trackIds: trackIds = [],
  } = settings

  //parseTimeEvents(s, timeEvents)

  store.dispatch({
    type: CREATE_SONG,
    payload: {
      id,
      timeEvents,
      midiEventIds,
      partIds,
      trackIds,
      settings: s
    }
  })
  return id
}


export function addTracks(song_id: string, ...track_ids: string[]): void{
  store.dispatch({
    type: ADD_TRACKS,
    payload: {
      song_id,
      track_ids,
    }
  })
}


export function getTrackIds(song_id: string): string[]{
  let state = store.getState().editor
  let song = state.songs[song_id]
  if(typeof song === 'undefined'){
    console.warn(`no song found with id ${song_id}`)
    return []
  }
  return [...song.trackIds]
}


export function addTimeEvents(...time_events: string[]): void{

}


// prepare song events for playback
export function updateSong(song_id: string, filter_events: boolean = false): void{
  let state = store.getState().editor
  let song = state.songs[song_id]
  if(song){
    console.time('update song')
    //@TODO: check if time events are updated
    parseTimeEvents(song.settings, song.timeEvents)
    let midiEvents = [...song.timeEvents]
    song.midiEventIds.forEach(function(event_id){
      let event = state.midiEvents[event_id]
      if(event){
        midiEvents.push({...event})
      }
    })
    midiEvents = parseEvents(midiEvents)
    parseMIDINotes(midiEvents)
    // midiEvents.forEach((e) => {
    //   if(e.bar >= 5 && e.bar <= 6){
    //     console.log(e.barsAsString, e.data1, e.data2, e.type)
    //   }
    // })
    store.dispatch({
      type: UPDATE_SONG,
      payload: {
        song_id,
        midi_events: midiEvents,
        settings: song.settings // needed for the sequencer reducer
      }
    })
    console.timeEnd('update song')
  }else{
    console.warn(`no song found with id ${song_id}`)
  }
}


export function startSong(song_id: string, start_position: number = 0): void{

  function createScheduler(){
    let state = store.getState()
    let songData = state.sequencer.songs[song_id]
    let parts = {}
    let tracks = {}
    let i = 0
    let midiEvents = songData.midiEvents.filter(function(event){
      // if((event.type === 144 || event.type === 128) && typeof event.midiNoteId === 'undefined'){
      //   console.info(i++, 'no midiNoteId', event.ticks, event.type, event.data1, event.trackId)
      //   return false
      // }
      let part = parts[event.partId]
      let track = tracks[event.trackId]
      if(typeof part === 'undefined'){
        parts[event.partId] = part = state.editor.parts[event.partId]
      }
      if(typeof track === 'undefined'){
        tracks[event.trackId] = track = state.editor.tracks[event.trackId]
      }
      //return (!event.mute && !part.mute && !track.mute)
      // check if a note, part or track is muted should be done in the scheduler loop
      return true
    })

    let position = start_position
    let timeStamp = context.currentTime * 1000 // -> convert to millis
    let scheduler = new Scheduler({
      song_id,
      start_position,
      timeStamp,
      parts,
      tracks,
      settings: songData.settings,
      midiEvents: midiEvents,
    })

    store.dispatch({
      type: START_SCHEDULER,
      payload: {
        song_id,
        scheduler
      }
    })

    return function(){
      let
        now = context.currentTime * 1000,
        diff = now - timeStamp,
        endOfSong

      position += diff // position is in millis
      timeStamp = now
      endOfSong = scheduler.update(position)
      if(endOfSong){
        stopSong(song_id)
      }
      store.dispatch({
        type: SONG_POSITION,
        payload: {
          song_id,
          position
        }
      })
    }
  }

  addTask('repetitive', song_id, createScheduler())
}

export function stopSong(song_id: string): void{
  let state = store.getState()
  let songData = state.sequencer.songs[song_id]
  if(songData){
    if(songData.playing){
      removeTask('repetitive', song_id)
      songData.scheduler.stopAllSounds(context.currentTime)
      store.dispatch({
        type: STOP_SCHEDULER,
        payload: {
          song_id
        }
      })
    }
  }else{
    console.error(`no song found with id ${song_id}`)
  }
}


/*
export function addMIDIEvents(
  settings: {song_id: string, track_id: string, part_id: string},
  midi_events: Array<{ticks: number, type: number, data1: number, data2: number}>
){
  //@todo: create part, add events to part, create track, add part to track, add track to song
  store.dispatch({
    type: ADD_MIDI_EVENTS_TO_SONG,
    payload: {
//      id: song_id,
      midi_events
    }
  })
}

export function addMIDIEventsToSong(song_id: string, midi_events: Array<{ticks: number, type: number, data1: number, data2: number}>){
  //@todo: create part, add events to part, create track, add part to track, add track to song
  store.dispatch({
    type: ADD_MIDI_EVENTS_TO_SONG,
    payload: {
      id: song_id,
      midi_events
    }
  })
}
*/