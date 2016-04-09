// @flow

import {getStore} from './create_store'
import {parseTimeEvents, parseEvents} from './parse_events'
import {getMIDIEventId} from './midi_event'
import {addTask, removeTask} from './heartbeat'
import {context} from './io'
import {
  CREATE_SONG,
  ADD_TRACKS,
  UPDATE_SONG,
  ADD_MIDI_EVENTS_TO_SONG,
} from './action_types'
import {MIDI} from './qambi'

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


export function createSong(settings){
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
      {id: getMIDIEventId(), song: id, ticks: 0, type: MIDI.TEMPO, data1: s.bpm},
      {id: getMIDIEventId(), song: id, ticks: 0, type: MIDI.TIME_SIGNATURE, data1: s.nominator, data2: s.denominator}
    ],
    midiEventIds: midiEventIds = [],
    partIds: partIds = [],
    trackIds: trackIds = [],
  } = settings

  parseTimeEvents(s, timeEvents)

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


export function addTracks(song_id: string, ...track_ids:string){
  store.dispatch({
    type: ADD_TRACKS,
    payload: {
      song_id,
      track_ids,
    }
  })
}


export function addTimeEvents(...time_events){

}

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

export function updateSong(song_id: string){
  let state = store.getState().sequencer
  let song = state.songs[song_id]
  if(song){
    let midiEvents = [...song.timeEvents]
    song.midiEventIds.forEach(function(event_id){
      let event = state.midiEvents[event_id]
      if(event){
        midiEvents.push({...event})
      }
    })
    midiEvents = parseEvents(midiEvents)
    store.dispatch({
      type: UPDATE_SONG,
      payload: {
        song_id,
        midi_events: midiEvents
      }
    })
  }else{
    console.warn(`no song found with id ${song_id}`)
  }
}


export function startSong(song_id: string, position: number = 0){
  let timeStamp = context.currentTime
  let millis = position

  addTask('repetitive', song_id, function(){
    let
      now = context.currentTime * 1000,
      diff = now - timeStamp

    millis += diff
    timeStamp = now
    console.log(diff)
    //@TODO: how to connect a scheduler to a song?
    //song._scheduler.update();
  })
}

export function stopSong(song_id: string){
  removeTask('repetitive', song_id)
}
