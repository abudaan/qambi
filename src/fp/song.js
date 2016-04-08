// @flow

import {getStore} from './create_store'
import {
  CREATE_SONG,
  ADD_MIDI_EVENTS_TO_SONG,
} from './action_types'

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
  autoQuantize: false,
  timeEvents: [],
  midiEvents: [],
  parts: [],
  tracks: [],
}

export function createSong(settings){
  let id = `S_${songIndex++}_${new Date().getTime()}`
  let s = {};
  ({
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
    timeEvents: s.timeEvents = defaultSong.timeEvents,
    midiEvents: s.midiEvents = defaultSong.midiEvents,
    parts: s.parts = defaultSong.parts,
    tracks: s.tracks = defaultSong.tracks,
  } = settings)

  store.dispatch({
    type: CREATE_SONG,
    payload: {
      id,
      settings: s
    }
  })
  return id
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

