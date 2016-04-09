import {
  createMIDIEvent,
  moveMIDIEvent,
  moveMIDIEventTo,
} from './midi_event'
import{
  createMIDINote
} from './midi_note'
import{
  createSong,
  addTracks
} from './song'
import{
  createTrack,
  addParts
} from './track'
import{
  createPart,
  addMIDIEvents
} from './part'

const sequencer = {
  id: 'qambi',
  createMIDIEvent,
  moveMIDIEvent,
  moveMIDIEventTo,
  createMIDINote,
  createSong,
  addTracks,
  createTrack,
  addParts,
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

  // from ./track
  createTrack,
  addParts,

  // from ./part
  createPart,
  addMIDIEvents
}
