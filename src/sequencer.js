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
} from './song'
import{
  createTrack,
  addParts,
} from './track'
import{
  createPart,
  addMIDIEvents,
} from './part'

const sequencer = {
  id: 'qambi',

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
Object.defineProperty(sequencer, 'NOTE_OFF', {value: 0x80}); //128
Object.defineProperty(sequencer, 'NOTE_ON', {value: 0x90}); //144
Object.defineProperty(sequencer, 'POLY_PRESSURE', {value: 0xA0}); //160
Object.defineProperty(sequencer, 'CONTROL_CHANGE', {value: 0xB0}); //176
Object.defineProperty(sequencer, 'PROGRAM_CHANGE', {value: 0xC0}); //192
Object.defineProperty(sequencer, 'CHANNEL_PRESSURE', {value: 0xD0}); //208
Object.defineProperty(sequencer, 'PITCH_BEND', {value: 0xE0}); //224
Object.defineProperty(sequencer, 'SYSTEM_EXCLUSIVE', {value: 0xF0}); //240
Object.defineProperty(sequencer, 'MIDI_TIMECODE', {value: 241});
Object.defineProperty(sequencer, 'SONG_POSITION', {value: 242});
Object.defineProperty(sequencer, 'SONG_SELECT', {value: 243});
Object.defineProperty(sequencer, 'TUNE_REQUEST', {value: 246});
Object.defineProperty(sequencer, 'EOX', {value: 247});
Object.defineProperty(sequencer, 'TIMING_CLOCK', {value: 248});
Object.defineProperty(sequencer, 'START', {value: 250});
Object.defineProperty(sequencer, 'CONTINUE', {value: 251});
Object.defineProperty(sequencer, 'STOP', {value: 252});
Object.defineProperty(sequencer, 'ACTIVE_SENSING', {value: 254});
Object.defineProperty(sequencer, 'SYSTEM_RESET', {value: 255});


Object.defineProperty(sequencer, 'TEMPO', {value: 0x51});
Object.defineProperty(sequencer, 'TIME_SIGNATURE', {value: 0x58});
Object.defineProperty(sequencer, 'END_OF_TRACK', {value: 0x2F});

export default sequencer

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

  // from ./track
  createTrack,
  addParts,

  // from ./part
  createPart,
  addMIDIEvents
}
