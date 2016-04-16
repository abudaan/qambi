//@ flow

import {getStore} from './create_store'
import {parseTimeEvents, parseEvents, parseMIDINotes, filterEvents} from './parse_events'
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


export function createSong(settings: {} = {}): string{
  let id = `S_${songIndex++}_${new Date().getTime()}`
  let s = {};
  ({
    name: s.name = id,
    ppq: s.ppq = defaultSong.ppq,
    bpm: s.bpm = defaultSong.bpm,
    bars: s.bars = defaultSong.bars,
    lowestNote: s.lowestNote = defaultSong.lowestNote,
    highestNote: s.highestNote = defaultSong.highestNote,
    nominator: s.nominator = defaultSong.nominator,
    denominator: s.denominator = defaultSong.denominator,
    quantizeValue: s.quantizeValue = defaultSong.quantizeValue,
    fixedLengthValue: s.fixedLengthValue = defaultSong.fixedLengthValue,
    positionType: s.positionType = defaultSong.positionType,
    useMetronome: s.useMetronome = defaultSong.useMetronome,
    autoSize: s.autoSize = defaultSong.autoSize,
    loop: s.loop = defaultSong.loop,
    playbackSpeed: s.playbackSpeed = defaultSong.playbackSpeed,
    autoQuantize: s.autoQuantize = defaultSong.autoQuantize,
  } = settings)

  let{
    timeEvents: timeEvents = [
      {id: getMIDIEventId(), song: id, ticks: 0, type: qambi.TEMPO, data1: s.bpm},
      {id: getMIDIEventId(), song: id, ticks: 0, type: qambi.TIME_SIGNATURE, data1: s.nominator, data2: s.denominator}
    ],
    midiEventIds: midiEventIds = {}, // @TODO: convert array to object if MIDIEvent ids are provided
    partIds: partIds = [],
    trackIds: trackIds = [],
  } = settings

  //parseTimeEvents(s, timeEvents)

  store.dispatch({
    type: CREATE_SONG,
    payload: {
      id,
      timeEvents,
      midiEvents: [],
      // midiEventsMap: {},
      midiEventsMap: new Map(),
      partIds,
      trackIds,
      dirty: false,
      updateTimeEvents: true,
      settings: s,
      newEventIds: [],
      movedEventIds: [],
      transposedEventIds: [],
      removedEventIds: [],
    }
  })
  return id
}


export function addTracks(song_id: string, ...track_ids: string[]): void{
  store.dispatch({
    type: ADD_TRACKS,
    payload: {
      song_id,
      track_ids,
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


// prepare song events for playback
export function updateSong(songId: string, filter_events: boolean = false): void{
  let state = store.getState().editor
  let song = {...state.entities[songId]} // clone!
  if(typeof song !== 'undefined'){
    console.time('update song')

    // check if time events are updated
    if(song.updateTimeEvents === true){
      console.log('updateTimeEvents', song.timeEvents.length)
      parseTimeEvents(song.settings, song.timeEvents)
      song.updateTimeEvents = false
    }

    // only parse new and moved events
    let tobeParsed = []


    // filter removed events
    song.removedEventIds.forEach(function(eventId){
      song.midiEventsMap.delete(eventId)
      //delete song.midiEventsMap[eventId]
    })


    // add new events
    song.newEventIds.forEach(function(eventId){
      let event = state.entities[eventId]
      song.midiEventsMap.set(eventId, event)
      //song.midiEventsMap[eventId] = event
      tobeParsed.push(event)
    })


    // moved events need to be parsed
    song.movedEventIds.forEach(function(eventId){
      let event = state.entities[eventId]
      tobeParsed.push(event)
    })


    //console.time('parse')
    if(tobeParsed.length > 0){
      tobeParsed = [...tobeParsed, ...song.timeEvents]
      console.log('parseEvents', tobeParsed.length - song.timeEvents.length)
      tobeParsed = parseEvents(tobeParsed)
      parseMIDINotes(tobeParsed)
    }
    //console.timeEnd('parse')

    //console.time('sort')
    let midiEvents = Array.from(song.midiEventsMap.values())
    /*
    let midiEvents = []
    let midiEventsMap = song.midiEventsMap
    Object.keys(midiEventsMap).forEach(function(key){
      midiEvents.push(midiEventsMap[key])
    })
    */

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
    //console.timeEnd('sort')

    store.dispatch({
      type: UPDATE_SONG,
      payload: {
        songId,
        midiEvents,
        midiEventsMap: song.midiEventsMap,
        newEventIds: [],
        movedEventIds: [],
        removedEventIds: [],
        updateTimeEvents: false,
        settings: song.settings // needed for the sequencer reducer
      }
    })
    console.timeEnd('update song')
  }else{
    console.warn(`no song found with id ${songId}`)
  }
}

function getParts(songId: string){
  let entities = store.getState().editor.entities

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

    let midiEvents = songData.midiEvents//Array.from(store.getState().sequencer.songs[songId].midiEvents.values())
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