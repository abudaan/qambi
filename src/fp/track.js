// @flow

import {getStore} from './create_store'
import {
  CREATE_TRACK,
  ADD_PARTS,
} from './action_types'

const store = getStore()
let trackIndex = 0

export function createTrack(
  settings: {name: string, parts:Array<string>, song: string} = {}
  //settings: {name: string, parts:Array<string>, song: string} = {name: 'aap', parts: [], song: 'no song'}
  //settings = {name: name = 'aap', parts: parts = [], song: song = 'no song'}
  //settings = {name: name = 'aap', parts: parts = [], song: song = 'no song'}
){
  let id = `MT_${trackIndex++}_${new Date().getTime()}`
  let {
    name = id,
    parts = [],
    song = 'none'
  } = settings
  store.dispatch({
    type: CREATE_TRACK,
    payload: {
      id,
      name,
      parts,
      song
    }
  })
  return id
}


export function addParts(track_id: string, ...part_ids:string){
  store.dispatch({
    type: ADD_PARTS,
    payload: {
      track_id,
      part_ids,
    }
  })
}