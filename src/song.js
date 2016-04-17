//@ flow

import {getStore} from './create_store'
import {parseTimeEvents, parseEvents} from './parse_events'
import {getMIDIEventId} from './midi_event'
import {addTask, removeTask} from './heartbeat'
import {context} from './init_audio'
import Scheduler from './scheduler'
import {
  CREATE_SONG,
  ADD_TRACKS,
  UPDATE_SONG,
  SONG_POSITION,
  ADD_MIDI_EVENTS_TO_SONG,
  START_SCHEDULER,
  STOP_SCHEDULER,
} from './action_types'
import qambi from './qambi'

const store = getStore()
let songIndex = 0

const defaultSong = {
  ppq: 960,
  bpm: 120,
  bars: 30,
  lowestNote: 0,
  highestNote: 127,
  nominator: 4,
  denominator: 4,
  quantizeValue: 8,
  fixedLengthValue: false,
  positionType: 'all',
  useMetronome: false,
  autoSize: true,
  loop: false,
  playbackSpeed: 1,
  autoQuantize: false
}
/*
type songSettings = {
  name: string,
  ppq: number,
  bpm: number,
  bars: number,
  lowestNote: number,
  highestNote: number,
  nominator: number,
  denominator: number,
  quantizeValue: number,
  fixedLengthValue: number,
  positionType: string,
  useMetronome: boolean,
  autoSize: boolean,
  loop: boolean,
  playbackSpeed: number,
  autoQuantize: boolean
}
*/

function getSong(songId: string){
  let state = store.getState().editor
  let song = state.entities[songId]
  if(typeof song === 'undefined'){
    return false
  }
  return song
}


export class Song{
  constructor(settings: {} = {}){

    this.id = `S_${songIndex++}_${new Date().getTime()}`

    this.settings = {};
    ({
      name: this.settings.name = this.id,
      ppq: this.settings.ppq = defaultSong.ppq,
      bpm: this.settings.bpm = defaultSong.bpm,
      bars: this.settings.bars = defaultSong.bars,
      lowestNote: this.settings.lowestNote = defaultSong.lowestNote,
      highestNote: this.settings.highestNote = defaultSong.highestNote,
      nominator: this.settings.nominator = defaultSong.nominator,
      denominator: this.settings.denominator = defaultSong.denominator,
      quantizeValue: this.settings.quantizeValue = defaultSong.quantizeValue,
      fixedLengthValue: this.settings.fixedLengthValue = defaultSong.fixedLengthValue,
      positionType: this.settings.positionType = defaultSong.positionType,
      useMetronome: this.settings.useMetronome = defaultSong.useMetronome,
      autoSize: this.settings.autoSize = defaultSong.autoSize,
      loop: this.settings.loop = defaultSong.loop,
      playbackSpeed: this.settings.playbackSpeed = defaultSong.playbackSpeed,
      autoQuantize: this.settings.autoQuantize = defaultSong.autoQuantize,
    } = settings);

    ({
      timeEvents: this.timeEvents = [
        {id: getMIDIEventId(), song: this.id, ticks: 0, type: qambi.TEMPO, data1: this.settings.bpm},
        {id: getMIDIEventId(), song: this.id, ticks: 0, type: qambi.TIME_SIGNATURE, data1: this.settings.nominator, data2: this.settings.denominator}
      ],
      midiEventIds: this.midiEventIds = [], // @TODO: convert array to object if MIDIEvent ids are provided
      partIds: this.partIds = [],
      trackIds: this.trackIds = [],
    } = settings);


    this.updateTimeEvents = true
    this.midiEvents = []
    this.midiEventsMap = new Map()
    this.newEventIds = []
    //this.newEvents = new Map()
    //this.movedEvents = new Map()
    this.movedEventIds = []
    this.transposedEventIds = []
    this.removedEventIds = []
  }
}


export function createSong(settings: {} = {}): string{
  let song = new Song(settings)
  store.dispatch({
    type: CREATE_SONG,
    payload: [song]
  })
  //console.log(song)
  return song.id
}


export function addTracks(songId: string, ...trackIds: string[]): void{
  store.dispatch({
    type: ADD_TRACKS,
    payload: {
      songId,
      trackIds,
    }
  })
}


export function getTrackIds(songId: string): string[]{
  let song = getSong(songId)
  if(song === false){
    console.warn(`no song found with id ${songId}`)
    return []
  }
  return [...song.trackIds]
}


export function addTimeEvents(...time_events: string[]): void{
}

let newEvents = true

// prepare song events for playback
export function updateSong(songId: string, filter_events: boolean = false): void{
  let state = store.getState().editor
  // let song = {...state.entities[songId]} // clone!
  let song = state.entities[songId] // dangerous!
  if(typeof song !== 'undefined'){

    let {updateTimeEvents, removedEventIds, newEventIds, movedEventIds, transposedEventIds} = song
    if(updateTimeEvents === false && removedEventIds.length === 0 && newEventIds.length === 0 && movedEventIds.length === 0 && transposedEventIds.length === 0){
      return
    }
    //debug
    //song.isPlaying = true

    console.group('update song')
    console.time('total')

    // check if time events are updated
    if(updateTimeEvents === true){
      console.log('updateTimeEvents', song.timeEvents.length)
      parseTimeEvents(song.settings, song.timeEvents, song.isPlaying)
      song.updateTimeEvents = false
    }

    // only parse new and moved events
    let tobeParsed = []

    // filter removed events
    console.log('removed %O', removedEventIds)
    removedEventIds.forEach(function(eventId){
      song.midiEventsMap.delete(eventId)
      //delete song.midiEventsMap[eventId]
    })


    // add new events
    console.log('new %O', newEventIds)
    newEventIds.forEach(function(eventId){
      let event = state.entities[eventId]
      song.midiEventsMap.set(eventId, event)
      //song.midiEventsMap[eventId] = event
      tobeParsed.push(event)
    })


    // song.newEvents.forEach(function(event, eventId){
    //   song.midiEventsMap.set(eventId, event)
    //   tobeParsed.push(event)
    // })

    // moved events need to be parsed
    console.log('moved %O', movedEventIds)
    song.movedEventIds.forEach(function(eventId){
      let event = state.entities[eventId]
      tobeParsed.push(event)
    })

    //tobeParsed = [...tobeParsed, ...Array.from(song.movedEvents.values())]

    console.time('parse')
    if(tobeParsed.length > 0){
      tobeParsed = [...tobeParsed, ...song.timeEvents]
      console.log('parseEvents', tobeParsed.length - song.timeEvents.length)
      parseEvents(tobeParsed, song.isPlaying)
    }
    console.timeEnd('parse')

    console.time('to array')
    let midiEvents = Array.from(song.midiEventsMap.values())
    //let midiEventIds = Array.from(song.midiEventsMap.keys())
    let midiEventIds = []
    console.timeEnd('to array')
/*
    let midiEvents = []
    let midiEventsMap = song.midiEventsMap
    Object.keys(midiEventsMap).forEach(function(key){
     midiEvents.push(midiEventsMap[key])
    })
*/
/*
    let midiEvents = [...Array.from(song.newEvents.values())]

    if(midiEvents.length > 0){
      newEvents = false
      console.time('get')
      midiEvents = [...song.timeEvents]
      Object.keys(state.entities).forEach(function(id){
        let e = state.entities[id]
        if(e && e.id.startsWith('ME_') && e.songId === songId ){
          midiEvents.push(e)
        }
      })
      midiEvents = parseEvents(midiEvents)
      console.timeEnd('get')
    }
*/

    console.time(`sorting ${midiEvents.length} events`)
    midiEvents.sort(function(a, b){
      if(a.ticks === b.ticks){
        let r = a.type - b.type;
        if(a.type === 176 && b.type === 144){
          r = -1
        }
        return r
      }
      return a.ticks - b.ticks
    })
    console.timeEnd(`sorting ${midiEvents.length} events`)

    song.midiEvents = midiEvents
    song.midiEventIds = midiEventIds

    console.timeEnd('total')
    console.groupEnd('update song')


/*
    let midiEvents = parseEvents(song.midiEvents)
    console.timeEnd('update song')
*/
    store.dispatch({
      type: UPDATE_SONG,
      payload: song
    })
    console.timeEnd('update song')
  }else{
    console.warn(`no song found with id ${songId}`)
  }
}


export function startSong(songId: string, startPosition: number = 0): void{

  function createScheduler(){
    let entities = store.getState().editor.entities
    let songData = entities[songId]
    // console.log(songData)
    let parts = {}
    songData.partIds.forEach(function(partId){
      parts[partId] = entities[partId]
    })
    let tracks = {}
    songData.trackIds.forEach(function(trackId){
      tracks[trackId] = entities[trackId]
    })

    let midiEvents = songData.midiEvents
    let position = startPosition
    let timeStamp = context.currentTime * 1000 // -> convert to millis
    let scheduler = new Scheduler({
      songId,
      startPosition,
      timeStamp,
      parts,
      tracks,
      midiEvents,
      settings: songData.settings,
    })

    store.dispatch({
      type: START_SCHEDULER,
      payload: {
        songId,
        scheduler
      }
    })

    return function(){
      let
        now = context.currentTime * 1000,
        diff = now - timeStamp,
        endOfSong

      position += diff // position is in millis
      timeStamp = now
      endOfSong = scheduler.update(position)
      if(endOfSong){
        stopSong(songId)
      }
      store.dispatch({
        type: SONG_POSITION,
        payload: {
          songId,
          position
        }
      })
    }
  }

  addTask('repetitive', songId, createScheduler())
}

export function stopSong(songId: string): void{
  let state = store.getState()
  let songData = state.sequencer.songs[songId]
  if(songData){
    if(songData.playing){
      removeTask('repetitive', songId)
      songData.scheduler.stopAllSounds(context.currentTime)
      store.dispatch({
        type: STOP_SCHEDULER,
        payload: {
          songId
        }
      })
    }
  }else{
    console.error(`no song found with id ${songId}`)
  }
}


/*
export function addMIDIEvents(
  settings: {song_id: string, track_id: string, part_id: string},
  midi_events: Array<{ticks: number, type: number, data1: number, data2: number}>
){
  //@todo: create part, add events to part, create track, add part to track, add track to song
  store.dispatch({
    type: ADD_MIDI_EVENTS_TO_SONG,
    payload: {
//      id: song_id,
      midi_events
    }
  })
}

export function addMIDIEventsToSong(song_id: string, midi_events: Array<{ticks: number, type: number, data1: number, data2: number}>){
  //@todo: create part, add events to part, create track, add part to track, add track to song
  store.dispatch({
    type: ADD_MIDI_EVENTS_TO_SONG,
    payload: {
      id: song_id,
      midi_events
    }
  })
}
*/