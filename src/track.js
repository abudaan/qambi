import {context} from './init_audio'
import {getStore} from './create_store'
import {masterGain} from './init_audio'
import Instrument from './instrument'
import {
  CREATE_TRACK,
  ADD_PARTS,
  SET_INSTRUMENT,
  SET_MIDI_OUTPUT_IDS,
} from './action_types'

const store = getStore()
let trackIndex = 0

function checkTrack(trackId: string){
  let track = store.getState().editor.tracks[trackId]
  if(typeof track === 'undefined'){
    console.warn(`No track found with id ${trackId}`)
    return false
  }
  return track
}


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
      channel: 0,
      mute: false,
      MIDIOutputIds: [],
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


export function setInstrument(trackId: string, instrument: Instrument){
  let track = checkTrack(trackId)
  if(track === false){
    return
  }

  if(typeof instrument.connect !== 'function' || typeof instrument.processMIDIEvent !== 'function' || typeof instrument.stopAllSounds !== 'function'){
    console.warn('An instrument should implement the methods processMIDIEvent() and stopAllSounds()')
    return
  }

  instrument.connect(track.output)

  store.dispatch({
    type: SET_INSTRUMENT,
    payload: {
      trackId,
      instrument,
    }
  })
}

export function setMIDIOutputIds(trackId: string, ...outputIds: string){
  if(checkTrack(trackId) === false){
    return
  }
  store.dispatch({
    type: SET_MIDI_OUTPUT_IDS,
    payload: {
      trackId,
      outputIds,
    }
  })
  //console.log(trackId, outputIds)
}


export function muteTrack(flag: boolean){

}


export function setVolumeTrack(flag: boolean){

}


export function setPanningTrack(flag: boolean){

}
