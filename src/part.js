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
    trackId: string,
    midiEventIds:Array<string>,
  } = {}
){
  let id = `MP_${partIndex++}_${new Date().getTime()}`
  let {
    name = id,
    midiEventIds = [],
    trackId
  } = settings

  store.dispatch({
    type: CREATE_PART,
    payload: {
      id,
      name,
      midiEventIds,
      trackId,
      mute: false
    }
  })
  return id
}

export function addMIDIEvents(partId: string, ...midiEventIds){
  store.dispatch({
    type: ADD_MIDI_EVENTS,
    payload: {
      partId,
      midiEventIds
    }
  })
}
