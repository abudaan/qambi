let eventListeners = new Map();


export function dispatchEvent(event){
  if(eventListeners.has(event.type) === false){
    return
  }
  let map = eventListeners.get(event.type)
  for(let cb of map.values()){
    cb(event.data)
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

