import {getStore} from './create_store'
import {
  createMIDIEvent,
  createMIDINote,
  moveMIDIEvent,
  moveMIDIEventTo,
} from './midi_event'

const store = getStore()

let noteon = createMIDIEvent(120, 144, 60, 100)
let noteoff = createMIDIEvent(240, 128, 60, 100)
//console.log(noteon, noteoff)

let note = createMIDINote(noteon, noteoff)
//console.log(note)


console.log('events', store.getState().midiEvents[noteoff])
console.log('notes', store.getState().midiNotes[note])


moveMIDIEventTo(noteoff, 260)
console.log('events', store.getState().midiEvents[noteoff])
console.log('notes', store.getState().midiNotes[note])
