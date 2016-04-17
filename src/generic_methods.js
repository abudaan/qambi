
import {getStore} from './create_store'
import {Song} from './song'

const store = getStore()

export function getEvents(id: string, filters: string[]){
  let entities = store.getState().editor.entities
  let entity = entities[id]
  let midiEventIds = entity.midiEventIds
  let midiEvents = entity.midiEvents

  if(entity instanceof Song){
    midiEventIds = Array.from(entity.midiEventsMap.keys())
  }

  if(typeof filters === 'undefined'){
    return [...midiEventIds]
  }

  if(!entity instanceof Song){
    midiEvents = []
    midiEventIds.forEach(function(eventId){
      midiEvents.push(entities[eventId])
    })
  }

  let result = entity.midiEvents.filter(function(event){
    return runFilters(event, filters)
  })
  return result.map(function(event){
    return event.id
  })
}

//@TODO: implement more filters
function runFilters(event, filters){
  let [key, operator, value] = filters[0].split(' ')
  let result = false

  switch(operator){
    case '<':
      result = event[key] < value
      break

    case '>':
      result = event[key] > value
      break

    default:
  }

  return result
}
