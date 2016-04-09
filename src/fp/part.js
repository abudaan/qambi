import {getStore} from './create_store'
import {
  CREATE_PART,
  ADD_MIDI_EVENTS,
} from './action_types'

const store = getStore()
let partIndex = 0

export function createPart(
  settings: {
    name: string,
    track: string,
    midiEvents:Array<string>,
    midiNotes:Array<string>,
  } = {}
){
  let id = `MP_${partIndex++}_${new Date().getTime()}`
  let {
    name = id,
    midiEvents = [],
    midiNotes = [],
    track = 'none'
  } = settings

  store.dispatch({
    type: CREATE_PART,
    payload: {
      id,
      name,
      midiEvents,
      midiNotes,
      track
    }
  })
  return id
}