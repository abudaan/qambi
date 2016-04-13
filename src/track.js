

import {context} from './init_audio'
import {getStore} from './create_store'
import {createInstrument} from './instrument'
import {masterGain} from './init_audio'
import {
  CREATE_TRACK,
  ADD_PARTS,
  SET_INSTRUMENT,
} from './action_types'

const store = getStore()
let trackIndex = 0

export function createTrack(
  settings: {name: string, partIds:Array<string>, songId: string} = {}
  //settings: {name: string, parts:Array<string>, song: string} = {name: 'aap', parts: [], song: 'no song'}
  //settings = {name: name = 'aap', parts: parts = [], song: song = 'no song'}
  //settings = {name: name = 'aap', parts: parts = [], song: song = 'no song'}
){
  let id = `MT_${trackIndex++}_${new Date().getTime()}`
  let {
    name = id,
    partIds = [],
    songId = 'none'
  } = settings
  let volume = 0.5
  let output = context.createGain()
  output.gain.value = volume
  output.connect(masterGain)

  store.dispatch({
    type: CREATE_TRACK,
    payload: {
      id,
      name,
      partIds,
      songId,
      volume,
      output,
      mute: false,
      //instrumentId: createInstrument('sinewave'),
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


export function setInstrument(trackId: string, instrumentId: string){
  store.dispatch({
    type: SET_INSTRUMENT,
    payload: {
      trackId,
      instrumentId,
    }
  })
}

export function muteTrack(flag: boolean){

}


export function setVolumeTrack(flag: boolean){

}


export function setPanningTrack(flag: boolean){

}
