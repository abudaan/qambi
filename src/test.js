import {getStore} from './create_store'
import {createMIDIEvent_fp} from './midi_event_fp'

const store = getStore()
console.log(store)

let event1 = createMIDIEvent_fp(120, 144, 60, 100)
let event2 = createMIDIEvent_fp(240, 128, 60, 100)
console.log(event1, event2)
