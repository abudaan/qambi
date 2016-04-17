import {
  getStore
} from './create_store'

import {
  getEvents,
  getData,
} from './generic_methods'

import {
  createMIDIEvent,createMIDIEvents,
  moveMIDIEvent,
  moveMIDIEventTo,
} from './midi_event'

import{
  createMIDINote,
} from './midi_note'

import{
  createSong,
  addTracks,
  updateSong,
  startSong,
  stopSong,
  getTrackIds,
} from './song'

import{
  createTrack,
  addParts,
  setInstrument,
  setMIDIOutputIds,
} from './track'

import{
  createPart,
  addMIDIEvents,
} from './part'

import {
  parseMIDIFile
} from './midifile'

import {
  songFromMIDIFile
} from './song_from_midifile'

import {
  Instrument,
} from './instrument'

import {
  init,
} from './init'

import {
  context,
  getMasterVolume,
  setMasterVolume,
} from './init_audio'

import {
  getMIDIAccess,
  getMIDIInputs,
  getMIDIOutputs,
  getMIDIInputIds,
  getMIDIOutputIds,
  getMIDIInputsById,
  getMIDIOutputsById,
} from './init_midi'

import {
  parseSamples,
} from './util'


const getAudioContext = function(){
  return context
}

const store = getStore()

const qambi = {
  version: '0.0.1',

  // from ./generic_methods
  getEvents,
  getData,

  // from ./util
  parseSamples,

  // from ./init
  init,

  // from ./init_audio
  getAudioContext,
  getMasterVolume,
  setMasterVolume,

  // ./init_midi
  getMIDIAccess,
  getMIDIInputs,
  getMIDIOutputs,
  getMIDIInputIds,
  getMIDIOutputIds,
  getMIDIInputsById,
  getMIDIOutputsById,

  // from ./midi_event
  createMIDIEvent,
  createMIDIEvents,
  moveMIDIEvent,
  moveMIDIEventTo,

  // from ./midi_note
  createMIDINote,

  // from ./song
  createSong,
  addTracks,
  updateSong,
  startSong,
  stopSong,
  getTrackIds,

  // from ./track
  createTrack,
  addParts,
  setInstrument,
  setMIDIOutputIds,

  // from ./part
  createPart,
  addMIDIEvents,

  // from ./instrument
  Instrument,

  parseMIDIFile,
  songFromMIDIFile,

  log: function(id){
    switch(id){
      case 'functions':
        console.log(`functions:
          createMIDIEvent
          moveMIDIEvent
          moveMIDIEventTo
          createMIDINote
          createSong
          addTracks
          createTrack
          addParts
          createPart
          addMIDIEvents
        `)
        break
      case 'state':
        console.log('%O', store.getState())
        //console.log(getStore().getState())
        break
      default:
    }
  },
}

// standard MIDI events
//const MIDI = {}
Object.defineProperty(qambi, 'NOTE_OFF', {value: 0x80}); //128
Object.defineProperty(qambi, 'NOTE_ON', {value: 0x90}); //144
Object.defineProperty(qambi, 'POLY_PRESSURE', {value: 0xA0}); //160
Object.defineProperty(qambi, 'CONTROL_CHANGE', {value: 0xB0}); //176
Object.defineProperty(qambi, 'PROGRAM_CHANGE', {value: 0xC0}); //192
Object.defineProperty(qambi, 'CHANNEL_PRESSURE', {value: 0xD0}); //208
Object.defineProperty(qambi, 'PITCH_BEND', {value: 0xE0}); //224
Object.defineProperty(qambi, 'SYSTEM_EXCLUSIVE', {value: 0xF0}); //240
Object.defineProperty(qambi, 'MIDI_TIMECODE', {value: 241});
Object.defineProperty(qambi, 'SONG_POSITION', {value: 242});
Object.defineProperty(qambi, 'SONG_SELECT', {value: 243});
Object.defineProperty(qambi, 'TUNE_REQUEST', {value: 246});
Object.defineProperty(qambi, 'EOX', {value: 247});
Object.defineProperty(qambi, 'TIMING_CLOCK', {value: 248});
Object.defineProperty(qambi, 'START', {value: 250});
Object.defineProperty(qambi, 'CONTINUE', {value: 251});
Object.defineProperty(qambi, 'STOP', {value: 252});
Object.defineProperty(qambi, 'ACTIVE_SENSING', {value: 254});
Object.defineProperty(qambi, 'SYSTEM_RESET', {value: 255});


Object.defineProperty(qambi, 'TEMPO', {value: 0x51});
Object.defineProperty(qambi, 'TIME_SIGNATURE', {value: 0x58});
Object.defineProperty(qambi, 'END_OF_TRACK', {value: 0x2F});

export default qambi

export {
  // from ./util
  parseSamples,

  // from ./generic_methods
  getEvents,
  getData,

  // from ./init
  init,

  // from ./init_audio
  getAudioContext,
  getMasterVolume,
  setMasterVolume,

  // ./init_midi
  getMIDIAccess,
  getMIDIInputs,
  getMIDIOutputs,
  getMIDIInputIds,
  getMIDIOutputIds,
  getMIDIInputsById,
  getMIDIOutputsById,

  // from ./midi_event
  createMIDIEvent,
  createMIDIEvents,
  moveMIDIEvent,
  moveMIDIEventTo,

  // from ./midi_note
  createMIDINote,

  // from ./song
  createSong,
  addTracks,
  updateSong,
  startSong,
  stopSong,
  getTrackIds,

  // from ./track
  createTrack,
  addParts,
  setInstrument,
  setMIDIOutputIds,

  // from ./part
  createPart,
  addMIDIEvents,

  // from ./instrument
  Instrument,

//  MIDI,

  parseMIDIFile,
  songFromMIDIFile,
}
