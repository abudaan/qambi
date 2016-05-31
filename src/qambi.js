const version = '1.0.0-beta24'

import {
  updateSettings,
  getSettings,
} from './settings'

import {
  getNoteData,
} from './note'

import {
  MIDIEvent
} from './midi_event'

import{
  MIDINote,
} from './midi_note'

import{
  Part,
} from './part'

import{
  Track,
} from './track'

import {
  Song,
} from './song'

import {
  Instrument,
} from './instrument'

import {
  Sampler,
} from './sampler'

import {
  SimpleSynth,
} from './simple_synth'

import {
  parseMIDIFile
} from './midifile'

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
} from './parse_audio'

import {
  MIDIEventTypes,
} from './constants'

import {
  setBufferTime,
  getInstruments,
  getGMInstruments,
} from './settings'

import {
  addEventListener,
  removeEventListener,
  dispatchEvent
} from './eventlistener'


const getAudioContext = function(){
  return context
}

const qambi = {
  version,

  // from ./settings
  updateSettings,
  getSettings,

  // from ./note
  getNoteData,


  // from ./init
  init,

  // from ./settings
  setBufferTime,

  // from ./constants
  MIDIEventTypes,

  // from ./util
  parseSamples,

  // from ./midifile
  parseMIDIFile,

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

  getInstruments,
  getGMInstruments,

  addEventListener(type, callback){
    return addEventListener(type, callback)
  },

  removeEventListener(type, id){
    removeEventListener(type, id)
  },

  // from ./midi_event
  MIDIEvent,

  // from ./midi_note
  MIDINote,

  // from ./song
  Song,

  // from ./track
  Track,

  // from ./part
  Part,

  // from ./instrument
  Instrument,

  // from ./simple_synth
  SimpleSynth,

  // from ./sampler
  Sampler,

  log(id){
    switch(id){
      case 'functions':
        console.log(`functions:
          getAudioContext
          getMasterVolume
          setMasterVolume
          getMIDIAccess
          getMIDIInputs
          getMIDIOutputs
          getMIDIInputIds
          getMIDIOutputIds
          getMIDIInputsById
          getMIDIOutputsById
          parseMIDIFile
          setBufferTime
          getInstruments
          getGMInstruments
        `)
        break
      default:
    }
  },
}

export default qambi

export {
  version,

  // from ./init
  init,

  // from ./settings
  getInstruments,
  getGMInstruments,
  updateSettings,
  getSettings,

  // from ./constants
  MIDIEventTypes,

  // from ./util
  parseSamples,

  // from ./midifile
  parseMIDIFile,

  // from ./init_audio
  getAudioContext,
  getMasterVolume,
  setMasterVolume,

  // from ./init_midi
  getMIDIAccess,
  getMIDIInputs,
  getMIDIOutputs,
  getMIDIInputIds,
  getMIDIOutputIds,
  getMIDIInputsById,
  getMIDIOutputsById,

  // from ./note
  getNoteData,

  // from ./midi_event
  MIDIEvent,

  // from ./midi_note
  MIDINote,

  // from ./song
  Song,

  // from ./track
  Track,

  // from ./part
  Part,

  // from ./instrument
  Instrument,

  // from ./simple_synth
  SimpleSynth,

  // from ./sampler
  Sampler,
}
