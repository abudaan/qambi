let eventListeners = new Map();


export function dispatchEvent(event){
  //console.log(event.type)
  let map

  if(event.type === 'event'){
    let midiEvent = event.data
    let midiEventType = midiEvent.type
    //console.log(midiEventType)
    if(eventListeners.has(midiEventType)){
      map = eventListeners.get(midiEventType)
      for(let cb of map.values()){
        cb(midiEvent)
      }
    }
  }


  if(eventListeners.has(event.type) === false){
    return
  }

  map = eventListeners.get(event.type)
  for(let cb of map.values()){
    cb(event)
  }


  // @todo: run filters here, for instance if an eventlistener has been added to all NOTE_ON events, check the type of the incoming event
}


export function addEventListener(type: string, callback){

  let map
  let id = `${type}_${new Date().getTime()}`

  if(eventListeners.has(type) === false){
    map = new Map()
    eventListeners.set(type, map)
  }else{
    map = eventListeners.get(type)
  }

  map.set(id, callback)
  //console.log(eventListeners)
  return id
}


export function removeEventListener(type, id){

  if(eventListeners.has(type) === false){
    console.log('no eventlisteners of type' + type)
    return
  }

  let map = eventListeners.get(type)

  if(typeof id === 'function'){
    for(let [key, value] of map.entries()) {
      console.log(key, value)
      if(value === id){
        console.log(key)
        id = key
        break
      }
    }
    if(typeof id === 'string'){
      map.delete(id)
    }
  }else if(typeof id === 'string'){
    map.delete(id)
  }else{
    console.log('could not remove eventlistener')
  }
}

