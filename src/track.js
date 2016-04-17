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

function getTrack(trackId: string){
  let track = store.getState().editor.entities[trackId]
  if(typeof track === 'undefined'){
    console.warn(`No track found with id ${trackId}`)
    return false
  }
  return track
}


class Track{
  constructor(settings: {name: string, partIds:Array<string>, songId: string} = {}){
    this.id = `MT_${trackIndex++}_${new Date().getTime()}`;
    ({
      name: this.name = this.id,
      partIds: this.partIds = [],
      midiEventIds: this.midiEventIds = [],
      songId: this.songId = false
    } = settings)
    this.channel = 0
    this.mute = false
    this.volume = 0.5
    this.output = context.createGain()
    this.output.gain.value = this.volume
    this.output.connect(masterGain)
    this.midiOutputIds = []
  }
}


export function createTrack(settings: {name: string, partIds:Array<string>, songId: string} = {}){
  let track = new Track(settings)
  store.dispatch({
    type: CREATE_TRACK,
    payload: [track]
  })
  return track.id
}


export function addParts(trackId: string, ...partIds:string){
  store.dispatch({
    type: ADD_PARTS,
    payload: {
      trackId,
      partIds,
    }
  })
}


export function setInstrument(trackId: string, instrument: Instrument){
  let track = getTrack(trackId)
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
  if(getTrack(trackId) === false){
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
