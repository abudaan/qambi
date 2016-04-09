let listeners = {};

function addEventListener(id, callback){
  listeners[id] = callback;
}

function removeEventListener(id, callback){
  delete listeners[id];
}

function dispatchEvent(id){
  for(let key in listeners){
    if(key === id && listeners.hasOwnProperty(key)){
      listeners[key](id);
    }
  }
}

export {addEventListener as addEventListener};
export {removeEventListener as removeEventListener};
export {dispatchEvent as dispatchEvent};