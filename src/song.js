//@ flow

import {parseTimeEvents, parseEvents} from './parse_events'
import {addTask, removeTask} from './heartbeat'
import {context} from './init_audio'
import Scheduler from './scheduler'
import {MIDIEvent} from './midi_event'
import {songFromMIDIFile} from './song_from_midifile'
import qambi from './qambi'
import {sortEvents} from './util'

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


export class Song{

  static fromMIDIFile(data){
    return songFromMIDIFile(data)
  }

  constructor(settings: {} = {}){

    this.id = `S_${songIndex++}_${new Date().getTime()}`;

    ({
      name: this.name = this.id,
      ppq: this.ppq = defaultSong.ppq,
      bpm: this.bpm = defaultSong.bpm,
      bars: this.bars = defaultSong.bars,
      nominator: this.nominator = defaultSong.nominator,
      denominator: this.denominator = defaultSong.denominator,
      quantizeValue: this.quantizeValue = defaultSong.quantizeValue,
      fixedLengthValue: this.fixedLengthValue = defaultSong.fixedLengthValue,
      useMetronome: this.useMetronome = defaultSong.useMetronome,
      autoSize: this.autoSize = defaultSong.autoSize,
      loop: this.loop = defaultSong.loop,
      playbackSpeed: this.playbackSpeed = defaultSong.playbackSpeed,
      autoQuantize: this.autoQuantize = defaultSong.autoQuantize,
    } = settings);

    this._timeEvents = [
      new MIDIEvent(0, qambi.TEMPO, this.bpm),
      new MIDIEvent(0, qambi.TIME_SIGNATURE, this.nominator, this.denominator),
    ]

    //this._timeEvents = []
    this._updateTimeEvents = true

    this._tracks = []
    this._tracksById = new Map()

    this._parts = []
    this._partsById = new Map()

    this._events = []
    this._eventsById = new Map()

    this._notes = []
    this._notesById = new Map()

    this._newEvents = []
    this._movedEvents = []
    this._removedEvents = []
    this._transposedEvents = []

    this._newParts = []
    this._changedParts = []
    this._removedParts = []

    this._scheduler = new Scheduler(this)
  }


  addTimeEvents(...events){
    this._timeEvents.push(...events)
    this._updateTimeEvents = true
  }

  addTracks(...tracks){
    tracks.forEach((track) => {
      track._song = this
      this._tracks.push(track)
      this._tracksById.set(track.id, track)
      this._newEvents.push(...track._events)
      this._newParts.push(...track._parts)
    })
  }

  // prepare song events for playback
  update(): void{

    let createEventArray = false

    if(this._updateTimeEvents === false
      && this._removedEvents.length === 0
      && this._newEvents.length === 0
      && this._movedEvents.length === 0
    ){
      return
    }
    //debug
    //this.isPlaying = true

    console.group('update song')
    console.time('total')

    // check if time events are updated
    if(this._updateTimeEvents === true){
      console.log('updateTimeEvents', this._timeEvents.length)
      parseTimeEvents(this, this._timeEvents, this.isPlaying)
      this._updateTimeEvents = false
    }

    // only parse new and moved events
    let tobeParsed = []


    // filter removed parts
    console.log('removed parts %O', this._removedParts)
    this._removedParts.forEach((part) => {
      this.partsById.delete(part.id)
      this._removedEvents.push(...part._events)
    })


    // add new parts
    console.log('new parts %O', this._newParts)
    this._newParts.forEach((part) => {
      part._song = this
      this._partsById.set(part.id, part)
      tobeParsed.push(...part._events)
      part.update()
    })


    // update changed parts
    console.log('changed parts %O', this._changedParts)
    this._changedParts.forEach((part) => {
      part.update()
    })


    // filter removed events
    console.log('removed events %O', this._removedEvents)
    this._removedEvents.forEach((event) => {
      this._eventsById.delete(event.id)
    })

    createEventArray = this._removedEvents.length > 0

    // add new events
    console.log('new events %O', this._newEvents)
    this._newEvents.forEach((event) => {
      this._eventsById.set(event.id, event)
      this._events.push(event)
      tobeParsed.push(event)
    })


    // moved events need to be parsed
    console.log('moved %O', this._movedEvents)
    this._movedEvents.forEach((event) => {
      tobeParsed.push(event)
    })

    //tobeParsed = [...tobeParsed, ...Array.from(song.movedEvents.values())]

    console.time('parse')
    if(tobeParsed.length > 0){
      tobeParsed = [...tobeParsed, ...this._timeEvents]
      console.log('parseEvents', tobeParsed.length - this._timeEvents.length)
      parseEvents(tobeParsed, this.isPlaying)
    }
    console.timeEnd('parse')

    if(createEventArray){
      console.time('to array')
      this._events = Array.from(this._eventsById.values())
      console.timeEnd('to array')
    }
/*
    console.time('filter parts')
    let partEvents = this._events.filter((e) => {
      return (e._part === this._parts[0])
    })
    console.log(partEvents.length)
    console.timeEnd('filter parts')

    console.time('filter events to tracks and parts')
    console.log(this._tracks[0]._events.length)
    console.log(this._tracks[1]._events.length)
    this._events.forEach((e) => {
      this._tracksById.get(e._track.id)._events.push(e)
      this._partsById.get(e._part.id)._events.push(e)
    })
    console.log(this._tracks[0]._events.length)
    console.log(this._tracks[1]._events.length)
    //console.log(trackEvents.length)
    console.timeEnd('filter events to tracks and parts')
*/
    console.time(`sorting ${this._events.length} events`)
    sortEvents(this._events)
    console.timeEnd(`sorting ${this._events.length} events`)

    console.timeEnd('total')
    console.groupEnd('update song')
    console.timeEnd('update song')
  }

  start(startPosition: number = 0): void{
    this._timeStamp = context.currentTime * 1000
    this._position = this._timeStamp
    this._scheduler.setStartPosition(startPosition, this._timeStamp)
    this.playing = true
    addTask('repetitive', this.id, this._pulse.bind(this))
  }

  stop(): void{
    if(this.playing){
      removeTask('repetitive', this.id)
      this._scheduler.stopAllSounds(context.currentTime)
      this.playing = false
    }
  }

  _pulse(): void{
    let
      now = context.currentTime * 1000,
      diff = now - this._timeStamp,
      endOfSong

    this._position += diff // position is in millis
    this._timeStamp = now
    endOfSong = this._scheduler.update(this._position)
    if(endOfSong){
      this.stop()
    }
  }

  getTracks(){
    return [...this._tracks]
  }

  getParts(){
    return [...this._parts]
  }

  getEvents(){
    return [...this._events]
  }

  getNotes(){
    return [...this._notes]
  }
}
