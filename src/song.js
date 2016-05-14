//@ flow

import {parseTimeEvents, parseEvents} from './parse_events'
//import {addTask, removeTask} from './heartbeat'
import {context} from './init_audio'
import Scheduler from './scheduler'
import {MIDIEvent} from './midi_event'
import {songFromMIDIFile, songFromMIDIFileAsync} from './song_from_midifile'
import qambi from './qambi'
import {sortEvents} from './util'
import {calculatePosition} from './position'
import {Playhead} from './playhead'
import {addEventListener, removeEventListener, dispatchEvent} from './eventlistener'

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

  static fromMIDIFileAsync(data){
    return songFromMIDIFileAsync(data)
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
    this._lastEvent = new MIDIEvent(0, qambi.END_OF_TRACK)

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
    this._playhead = new Playhead(this)
    this._millis = 0

    this._playing = false
    this._paused = false
  }


  addTimeEvents(...events){
    //@TODO: filter time events on the same tick -> use the lastly added events
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
      //console.log('updateTimeEvents', this._timeEvents.length)
      parseTimeEvents(this, this._timeEvents, this.isPlaying)
      this._updateTimeEvents = false
      console.log('time events %O', this._timeEvents)
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
      this._notesById.delete(event.midiNote.id)
      this._eventsById.delete(event.id)
    })

    createEventArray = this._removedEvents.length > 0

    // add new events
    console.log('new events %O', this._newEvents)
    this._newEvents.forEach((event) => {
      this._eventsById.set(event.id, event)
      this._events.push(event)
      tobeParsed.push(event)
      //console.log(event.id)
    })


    // moved events need to be parsed
    console.log('moved %O', this._movedEvents)
    this._movedEvents.forEach((event) => {
      tobeParsed.push(event)
    })

    //tobeParsed = [...tobeParsed, ...Array.from(song.movedEvents.values())]

    console.time('parse')
    if(tobeParsed.length > 0){
      //console.log('tobeParsed %O', tobeParsed)
      tobeParsed = [...tobeParsed, ...this._timeEvents]
      console.log('parseEvents', tobeParsed.length - this._timeEvents.length)
      parseEvents(tobeParsed, this.isPlaying)
      tobeParsed.forEach(event => {
        //console.log(event.id, event.type)
        if(event.type === qambi.NOTE_ON){
          if(event.midiNote){
            this._notesById.set(event.midiNoteId, event.midiNote)
            //console.log(event.midiNoteId, event.type)
            //this._notes.push(event.midiNote)
          }
        }
      })
      this._notes = Array.from(this._notesById.values())
    }
    console.timeEnd('parse')

    if(createEventArray){
      console.time('to array')
      this._events = Array.from(this._eventsById.values())
      this._notes = Array.from(this._notesById.values())
      console.timeEnd('to array')
    }

    console.time(`sorting ${this._events.length} events`)
    sortEvents(this._events)
    this._notes.sort(function(a, b){
      return a.noteOn.ticks - b.noteOn.ticks
    })
    console.timeEnd(`sorting ${this._events.length} events`)

    console.log('notes %O', this._notes)

    console.timeEnd('total')
    console.groupEnd('update song')
    console.timeEnd('update song')

    let lastEvent = this._events[this._events.length - 1]
    let lastTimeEvent = this._timeEvents[this._timeEvents.length - 1]
    if(lastTimeEvent.ticks > lastTimeEvent.ticks){
      lastTimeEvent = lastTimeEvent
    }
    ({
      bar: this._lastEvent.bar,
      beat: this._lastEvent.beat,
      sixteenth: this._lastEvent.sixteenth,
      tick: this._lastEvent.tick,
      ticks: this._lastEvent.ticks,
      millis: this._lastEvent.millis,
    } = lastEvent)
    //console.log('last tick', lastTicks)

    this._playhead.updateSong()
  }

  play(type, ...args): void{
    if(typeof type !== 'undefined'){
      this.setPosition(type, ...args)
    }
    if(this._playing){
      return
    }

    this._timeStamp = context.currentTime * 1000
    this._scheduler.setTimeStamp(this._timeStamp)

    if(this._paused){
      this._paused = false
      this._playing = true
    }else{
      this._playing = true
      this._scheduler.init(this._millis)
    }
    this._playhead.set('millis', this._millis)
    this._pulse()
    dispatchEvent({type: 'play', data: this._millis})
  }

  pause(): void{
    this._paused = !this._paused
    if(this._paused){
      this._playing = false
      this._scheduler.allNotesOff()
      dispatchEvent({type: 'pause', data: this._paused})
    }else{
      this.play()
      dispatchEvent({type: 'pause', data: this._paused})
    }
  }

  stop(): void{
    if(this._playing || this._paused){
      this._playing = false
      this._paused = false
      this._scheduler.allNotesOff()
      this._millis = 0
      this._playhead.set('millis', this._millis)
      dispatchEvent({type: 'stop'})
    }
  }

  allNotesOff(){
    if(this._playing){
      this._scheduler.allNotesOff()
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

  calculatePosition(args){
    return calculatePosition(this, args)
  }

  /*
    position:
      - 'ticks', 96000
      - 'millis', 1234
      - 'percentage', 55
      - 'barsbeats', 1, 4, 0, 25 -> bar, beat, sixteenth, tick
      - 'time', 0, 3, 49, 566 -> hours, minutes, seconds, millis
  */
  setPosition(type, ...args){

    let target

    switch(type){
      case 'ticks':
      case 'millis':
      case 'percentage':
        target = args[0] || 0
        break

      case 'time':
      case 'barsbeats':
      case 'barsandbeats':
        target = args
        break

      default:
        console.log('unsupported type')
        return
    }

    this._millis = calculatePosition(this, {
      type,
      target,
      result: 'millis'
    }).millis

    console.log('setPosition', this._millis)
  }

  getPosition(){
    return this._playhead.get().position
  }

  getPlayhead(){
    return this._playhead.get()
  }

  _pulse(): void{
    if(this._playing === false){
      return
    }
    let now = context.currentTime * 1000
    let diff = now - this._timeStamp
    this._millis += diff
    this._timeStamp = now
    //console.log(diff, this.millis)

    // @TODO: implement a better end of song calculation!
    let endOfSong = this._scheduler.update(this._millis)
    if(endOfSong){
      this.song.stop()
    }
    //console.log('pulse', diff)
    this._playhead.update('millis', diff)
    requestAnimationFrame(this._pulse.bind(this))
  }

  addEventListener(type, callback){
    return addEventListener(type, callback)
  }

  removeEventListener(type, id){
    removeEventListener(type, id)
  }
}
