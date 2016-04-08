import {getStore} from './create_store'
import {
  createMIDIEvent,
  moveMIDIEvent,
  moveMIDIEventTo,
} from './midi_event'
import{
  createMIDINote
} from './midi_note'

const store = getStore()

let noteon = createMIDIEvent(120, 144, 60, 100)
let noteoff = createMIDIEvent(240, 128, 60, 100)
//console.log(noteon, noteoff)

let note = createMIDINote(noteon, noteoff)
//console.log(note)


console.log('events', store.getState().midiEvents)
console.log('notes', store.getState().midiNotes[note])


moveMIDIEvent(noteon, -100)
moveMIDIEventTo(noteoff, 260)

console.log('events', store.getState().midiEvents)
console.log('notes', store.getState().midiNotes[note])
