import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import sequencerApp from './reducer'

const logger = createLogger();
const store = createStore(sequencerApp, {}, compose(
  applyMiddleware(logger),
  typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
));
export function getStore(){
  return store
}


