import {
  createMIDIEvent,
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
} from './song'
import{
  createTrack,
  addParts,
} from './track'
import{
  createPart,
  addMIDIEvents,
} from './part'

const qambi = {
  version: '0.0.1',

  // from ./midi_event
  createMIDIEvent,
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

  // from ./track
  createTrack,
  addParts,

  // from ./part
  createPart,
  addMIDIEvents,

  log: function(id){
    if(id === 'functions'){
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
    }
  }
}

// standard MIDI events
const MIDI = {}
Object.defineProperty(MIDI, 'NOTE_OFF', {value: 0x80}); //128
Object.defineProperty(MIDI, 'NOTE_ON', {value: 0x90}); //144
Object.defineProperty(MIDI, 'POLY_PRESSURE', {value: 0xA0}); //160
Object.defineProperty(MIDI, 'CONTROL_CHANGE', {value: 0xB0}); //176
Object.defineProperty(MIDI, 'PROGRAM_CHANGE', {value: 0xC0}); //192
Object.defineProperty(MIDI, 'CHANNEL_PRESSURE', {value: 0xD0}); //208
Object.defineProperty(MIDI, 'PITCH_BEND', {value: 0xE0}); //224
Object.defineProperty(MIDI, 'SYSTEM_EXCLUSIVE', {value: 0xF0}); //240
Object.defineProperty(MIDI, 'MIDI_TIMECODE', {value: 241});
Object.defineProperty(MIDI, 'SONG_POSITION', {value: 242});
Object.defineProperty(MIDI, 'SONG_SELECT', {value: 243});
Object.defineProperty(MIDI, 'TUNE_REQUEST', {value: 246});
Object.defineProperty(MIDI, 'EOX', {value: 247});
Object.defineProperty(MIDI, 'TIMING_CLOCK', {value: 248});
Object.defineProperty(MIDI, 'START', {value: 250});
Object.defineProperty(MIDI, 'CONTINUE', {value: 251});
Object.defineProperty(MIDI, 'STOP', {value: 252});
Object.defineProperty(MIDI, 'ACTIVE_SENSING', {value: 254});
Object.defineProperty(MIDI, 'SYSTEM_RESET', {value: 255});


Object.defineProperty(MIDI, 'TEMPO', {value: 0x51});
Object.defineProperty(MIDI, 'TIME_SIGNATURE', {value: 0x58});
Object.defineProperty(MIDI, 'END_OF_TRACK', {value: 0x2F});

export default qambi

export {
  // from ./midi_event
  createMIDIEvent,
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

  // from ./track
  createTrack,
  addParts,

  // from ./part
  createPart,
  addMIDIEvents,

  MIDI,
}
