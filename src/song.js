//@ flow

import {MIDIEventTypes} from './qambi'
import {parseTimeEvents, parseEvents} from './parse_events'
//import {addTask, removeTask} from './heartbeat'
import {context, masterGain} from './init_audio'
import Scheduler from './scheduler'
import {MIDIEvent} from './midi_event'
import {songFromMIDIFile, songFromMIDIFileAsync} from './song_from_midifile'
import qambi from './qambi'
import {sortEvents} from './util'
import {calculatePosition} from './position'
import {Playhead} from './playhead'
import {Metronome} from './metronome'
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
      new MIDIEvent(0, MIDIEventTypes.TEMPO, this.bpm),
      new MIDIEvent(0, MIDIEventTypes.TIME_SIGNATURE, this.nominator, this.denominator),
    ]

    //this._timeEvents = []
    this._updateTimeEvents = true
    this._lastEvent = new MIDIEvent(0, MIDIEventTypes.END_OF_TRACK)

    this._tracks = []
    this._tracksById = new Map()

    this._parts = []
    this._partsById = new Map()

    this._events = []
    this._eventsById = new Map()

    this._allEvents = [] // MIDI events and metronome events

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

    this.volume = 0.5
    this._output = context.createGain()
    this._output.gain.value = this.volume
    this._output.connect(masterGain)

    this._metronome = new Metronome(this)
    this._metronomeEvents = []
    this._updateMetronomeEvents = true
  }


  addTimeEvents(...events){
    //@TODO: filter time events on the same tick -> use the lastly added events
    events.forEach(event => {
      if(event.type === MIDIEventTypes.TIME_SIGNATURE){
        this._updateMetronomeEvents = true
      }
      this._timeEvents.push(event)
    })
    this._updateTimeEvents = true
  }

  addTracks(...tracks){
    tracks.forEach((track) => {
      track._song = this
      track.connect(this._output)
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


    // get the last event of this song
    let lastEvent = this._events[this._events.length - 1]
    let lastTimeEvent = this._timeEvents[this._timeEvents.length - 1]
    if(lastEvent.ticks > lastTimeEvent.ticks){
      lastEvent = lastTimeEvent
    }

    // get the position data of the first beat in the bar after the last bar
    this.bars = lastEvent.bar
    console.log('num bars', this.bars)
    let ticks = calculatePosition(this, {
      type: 'barsbeats',
      target: [this.bars + 1],
      result: 'ticks'
    }).ticks

    // we want to put the END_OF_TRACK event at the very last tick of the last bar, so we calculate that position
    let millis = calculatePosition(this, {
      type: 'ticks',
      target: ticks - 1,
      result: 'millis'
    }).millis


    this._lastEvent.ticks = ticks - 1
    this._lastEvent.millis = millis

    console.log('last tick', this._lastEvent.ticks, this._lastEvent.millis)
    this._durationTicks = this._lastEvent.ticks
    this._durationMillis = this._lastEvent.millis
    this._playhead.updateSong()

    // add metronome events
    if(this._updateMetronomeEvents || this._metronome.bars !== this.bars){
      this._metronomeEvents = parseEvents([...this._timeEvents, ...this._metronome.getEvents()])
    }
    this._allEvents = [...this._metronomeEvents, ...this._events]
    sortEvents(this._allEvents)

  }

  play(type, ...args): void{
    this._play(type, ...args)
    dispatchEvent({type: 'play', data: this._millis})
  }

  _play(type, ...args){
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
    }

    this._playing = true
    this._scheduler.init(this._millis)
    this._playhead.set('millis', this._millis)
    this._pulse()
  }


  pause(): void{
    this._paused = !this._paused
    if(this._paused){
      this._playing = false
      this.allNotesOff()
      dispatchEvent({type: 'pause', data: this._paused})
    }else{
      this.play()
      dispatchEvent({type: 'pause', data: this._paused})
    }
  }

  stop(): void{
    this.allNotesOff()
    if(this._playing || this._paused){
      this._playing = false
      this._paused = false
    }
    if(this._millis !== 0){
      this._millis = 0
      this._playhead.set('millis', this._millis)
      dispatchEvent({type: 'stop'})
    }
  }

  allNotesOff(){
    this._tracks.forEach((track) => {
      let instrument = track._instrument
      if(typeof instrument !== 'undefined'){
        instrument.allNotesOff()
      }
    })

    this._scheduler.allNotesOff()
    this._metronome.allNotesOff()
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

    let wasPlaying = this._playing
    if(this._playing){
      this._playing = false
      this.allNotesOff()
    }

    let target
    let position

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

    // millis = calculatePosition(this, {
    //   type,
    //   target,
    //   result: 'millis'
    // }).millis

    position = calculatePosition(this, {
      type,
      target,
      result: 'all'
    })

    this._millis = position.millis

    dispatchEvent({
      type: 'position',
      data: position
    })

    if(wasPlaying){
      this._play()
    }
    //console.log('setPosition', this._millis)
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

    this._playhead.update('millis', diff)

    if(this._millis >= this._durationMillis){
      this.stop()
      return
    }

    this._scheduler.update(this._millis)

    //console.log('pulse', diff)
    requestAnimationFrame(this._pulse.bind(this))
  }

  addEventListener(type, callback){
    return addEventListener(type, callback)
  }

  removeEventListener(type, id){
    removeEventListener(type, id)
  }
}
