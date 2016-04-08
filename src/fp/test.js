import {getStore} from './create_store'
import {createMIDIEvent} from './midi_event'

const store = getStore()

let event1 = createMIDIEvent(120, 144, 60, 100)
let event2 = createMIDIEvent(240, 128, 60, 100)
console.log(event1, event2)
