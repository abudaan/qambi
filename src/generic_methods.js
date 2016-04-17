
import {getStore} from './create_store'

const store = getStore()

export function getEvents(id: string, filter: string){
  let entities = store.getState().editor.entities
  let entity = entities[id]
}