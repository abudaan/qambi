import {createStore, applyMiddleware, compose} from 'redux'
//import thunk from 'redux-thunk';
//import createLogger from 'redux-logger';
import sequencerApp from './reducer'

const store = createStore(sequencerApp);

/*
// don't use the redux dev tool because it use too much CPU and memory!
const logger = createLogger();
const store = createStore(sequencerApp, {}, compose(
  applyMiddleware(logger),
  typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
));
*/

export function getStore(){
  return store
}


