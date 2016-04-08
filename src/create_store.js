import {createStore} from 'redux'
import sequencerApp from './reducer'

const store = createStore(sequencerApp)

export function getStore(){
  return store
}
