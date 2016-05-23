//@ flow

import {MIDIEventTypes} from './constants'
import {parseTimeEvents, parseEvents, parseMIDINotes} from './parse_events'
//import {addTask, removeTask} from './heartbeat'
import {context, masterGain} from './init_audio'
import Scheduler from './scheduler'
import {MIDIEvent} from './midi_event'
import {songFromMIDIFile, songFromMIDIFileAsync} from './song_from_midifile'
import {sortEvents} from './util'
import {calculatePosition} from './position'
import {Playhead} from './playhead'
import {Metronome} from './metronome'
import {addEventListener, removeEventListener, dispatchEvent} from './eventlistener'
import {defaultSong} from './settings'
import {saveAsMIDIFile} from './save_midifile'

let songIndex = 0
let recordingIndex = 0


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

    this._currentMillis = 0
    this._scheduler = new Scheduler(this)
    this._playhead = new Playhead(this)

    this.playing = false
    this.paused = false
    this.recording = false
    this.precounting = false
    this.stopped = true

    this.volume = 0.5
    this._output = context.createGain()
    this._output.gain.value = this.volume
    this._output.connect(masterGain)

    this._metronome = new Metronome(this)
    this._metronomeEvents = []
    this._updateMetronomeEvents = true
    this._metronome.mute(!this.useMetronome)

    this._loop = false
    this._leftLocator = {millis: 0, ticks: 0}
    this._rightLocator = {millis: 0, ticks: 0}
    this._illegalLoop = false
    this._loopDuration = 0
    this._precountBars = 0
    this._endPrecountMillis = 0
    //this.update()

    this._index = 0
  }


  _getEvents(maxtime, timeStamp){
    let result = []

    //console.log(maxtime)
    for(let i = this._index, maxi = this._allEvents.length; i < maxi; i++){

      let event = this._allEvents[i]
      //console.log(this._index, event)

      if(event.type === MIDIEventTypes.TEMPO || event.type === MIDIEventTypes.TIME_SIGNATURE){
        if(event.millis < maxtime){
          this.millisPerTick = event.millisPerTick
          this._index++
        }else{
          break
        }

      }else{
        let millis = event.ticks * this.millisPerTick
        if(millis < maxtime){
          event.time = millis + timeStamp
          event.millis = millis
          result.push(event)
          this._index++
        }else{
          break
        }
      }
    }
    return result

  }

  _prepare(){
    //console.log(this._events)
    parseTimeEvents(this, this._timeEvents)
    parseMIDINotes(this._events)
    this._allEvents.push(...this._events, ...this._timeEvents)
    sortEvents(this._allEvents)
    this._durationMillis = 4000
    this._metronome.getEvents()
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
      && this._newParts.length === 0
      && this._removedParts.length === 0
      && this._resized === false
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
      this._partsById.delete(part.id)
      this._removedEvents.push(...part._events)
    })


    // add new parts
    console.log('new parts %O', this._newParts)
    this._newParts.forEach((part) => {
      part._song = this
      this._partsById.set(part.id, part)
      //this._newEvents.push(...part._events)
      part.update()
    })


    // update changed parts
    console.log('changed parts %O', this._changedParts)
    this._changedParts.forEach((part) => {
      part.update()
    })

    // remove events from removed parts
    console.log('changed parts %O', this._changedParts)
    this._removedParts.forEach((part) => {
      this._removedEvents.push(...part._events)
      this._partsById.delete(part.id)
      part.update()
    })

    if(this._removedParts.length > 0){
      this._parts = Array.from(this._partsById.values())
    }


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
        //console.log(event.id, event.type, event.midiNote)
        if(event.type === MIDIEventTypes.NOTE_ON){
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
    //debugger

    console.time(`sorting ${this._events.length} events`)
    sortEvents(this._events)
    this._notes.sort(function(a, b){
      return a.noteOn.ticks - b.noteOn.ticks
    })
    console.timeEnd(`sorting ${this._events.length} events`)

    console.log('notes %O', this._notes)

    console.timeEnd('total')
    console.timeEnd('update song')


    // get the last event of this song
    let lastEvent = this._events[this._events.length - 1]
    let lastTimeEvent = this._timeEvents[this._timeEvents.length - 1]
    if(lastEvent instanceof MIDIEvent === false){
      lastEvent = lastTimeEvent
    }else if(lastTimeEvent.ticks > lastEvent.ticks){
      lastEvent = lastTimeEvent
    }

    // get the position data of the first beat in the bar after the last bar
    this.bars = Math.max(lastEvent.bar, this.bars)
    //console.log('num bars', this.bars, lastEvent)
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

    console.log('length', this._lastEvent.ticks, this._lastEvent.millis, this.bars)


    this._durationTicks = this._lastEvent.ticks
    this._durationMillis = this._lastEvent.millis
    console.log(this._durationTicks)
    this._playhead.updateSong()

    if(this.playing === false){
      this._playhead.set('millis', this._currentMillis)
    }
/*
    // add metronome events
    if(this._updateMetronomeEvents || this._metronome.bars !== this.bars){
      this._metronomeEvents = parseEvents([...this._timeEvents, ...this._metronome.getEvents()])
    }
    this._allEvents = [...this._metronomeEvents, ...this._events]
    sortEvents(this._allEvents)
    //console.log('all events %O', this._allEvents)
*/

    this._metronome.getEvents()
    this._allEvents = [...this._timeEvents, ...this._events]
    sortEvents(this._allEvents)


    this._newParts = []
    this._removedParts = []
    this._newEvents = []
    this._movedEvents = []
    this._removedEvents = []
    this._resized = false

    console.groupEnd('update song')
  }

  play(type, ...args): void{
    this._play(type, ...args)
    if(this._precountBars > 0){
      dispatchEvent({type: 'precounting', data: this._currentMillis})
    }else if(this._preparedForRecording === true){
      dispatchEvent({type: 'start_recording', data: this._currentMillis})
    }else{
      dispatchEvent({type: 'play', data: this._currentMillis})
    }
  }

  _play(type, ...args){
    if(typeof type !== 'undefined'){
      this.setPosition(type, ...args)
    }
    if(this.playing){
      return
    }

    //console.log(this._currentMillis)

    this._reference = this._timeStamp = context.currentTime * 1000
    this._scheduler.setTimeStamp(this._reference)
    this._startMillis = this._currentMillis

    if(this._precountBars > 0 && this._preparedForRecording){
      let position = this.getPosition()
      // create precount events, the playhead will be moved to the first beat of the current bar
      this._metronome.createPrecountEvents(position.bar, position.bar + this._precountBars, this._reference)
      this._currentMillis = this._calculatePosition('barsbeats', [position.bar], 'millis').millis
      this._precountDuration = this._metronome.precountDuration
      this._endPrecountMillis = this._currentMillis + this._precountDuration

      console.group('precount')
      console.log('position', this.getPosition())
      console.log('_currentMillis', this._currentMillis)
      console.log('endPrecountMillis', this._endPrecountMillis)
      console.log('_precountDuration', this._precountDuration)
      console.groupEnd('precount')
      //console.log('precountDuration', this._metronome.createPrecountEvents(this._precountBars, this._reference))
      this.precounting = true
    }else {
      this._endPrecountMillis = 0
      this.playing = true
      this.recording = this._preparedForRecording
    }
    //console.log(this._endPrecountMillis)

    if(this.paused){
      this.paused = false
    }

    this._playhead.set('millis', this._currentMillis)
    this._scheduler.init(this._currentMillis)
    this._pulse()
  }


  pause(): void{
    this.paused = !this.paused
    this.precounting = false
    if(this.paused){
      this.playing = false
      this.allNotesOff()
      dispatchEvent({type: 'pause', data: this.paused})
    }else{
      this.play()
      dispatchEvent({type: 'pause', data: this.paused})
    }
  }

  stop(): void{
    console.log('STOP')
    this.precounting = false
    this.allNotesOff()
    if(this.playing || this.paused){
      this.playing = false
      this.paused = false
    }
    if(this._currentMillis !== 0){
      this._currentMillis = 0
      this._playhead.set('millis', this._currentMillis)
      if(this.recording){
        this.stopRecording()
      }
      dispatchEvent({type: 'stop'})
    }
  }

  startRecording(){
    if(this._preparedForRecording === true){
      return
    }
    this._recordId = `recording_${recordingIndex++}${new Date().getTime()}`
    this._tracks.forEach(track => {
      track._startRecording(this._recordId)
    })
    this._preparedForRecording = true
  }

  stopRecording(){
    if(this._preparedForRecording === false){
      return
    }
    this._tracks.forEach(track => {
      track._stopRecording(this._recordId)
    })
    this.update()
    this._preparedForRecording = false
    this.recording = false
    dispatchEvent({type: 'stop_recording'})
  }

  undoRecording(){
    this._tracks.forEach(track => {
      track.undoRecording(this._recordId)
    })
    this.update()
  }

  redoRecording(){
    this._tracks.forEach(track => {
      track.redoRecording(this._recordId)
    })
    this.update()
  }

  setMetronome(flag){
    if(typeof flag === 'undefined'){
      this.useMetronome = !this.useMetronome
    }else{
      this.useMetronome = flag
    }
    this._metronome.mute(!this.useMetronome)
  }

  configureMetronome(config){
    this._metronome.configure(config)
  }

  configure(config){

  }

  allNotesOff(){
    this._tracks.forEach((track) => {
      track.allNotesOff()
    })

    //this._scheduler.allNotesOff()
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

  // @args -> see _calculatePosition
  setPosition(type, ...args){

    let wasPlaying = this.playing
    if(this.playing){
      this.playing = false
      this.allNotesOff()
    }

    let position = this._calculatePosition(type, args, 'all')
    //let millis = this._calculatePosition(type, args, 'millis')
    if(position === false){
      return
    }

    this._currentMillis = position.millis
    //console.log(this._currentMillis)

    dispatchEvent({
      type: 'position',
      data: position
    })

    if(wasPlaying){
      this._play()
    }else{
      //@todo: get this information from let 'position' -> we have just calculated the position
      this._playhead.set('millis', this._currentMillis)
    }
    //console.log('setPosition', this._currentMillis)
  }

  getPosition(){
    return this._playhead.get().position
  }

  getPlayhead(){
    return this._playhead.get()
  }

  // @args -> see _calculatePosition
  setLeftLocator(type, ...args){
    this._leftLocator = this._calculatePosition(type, args, 'all')

    if(this._leftLocator === false){
      console.warn('invalid position for locator')
      this._leftLocator = {millis: 0, ticks: 0}
      return
    }
  }

  // @args -> see _calculatePosition
  setRightLocator(type, ...args){
    this._rightLocator = this._calculatePosition(type, args, 'all')

    if(this._rightLocator === false){
      this._rightLocator = {millis: 0, ticks: 0}
      console.warn('invalid position for locator')
      return
    }
  }

  setLoop(flag = null){

    this._loop = flag !== null ? flag : !this._loop

    if(this._rightLocator === false || this._leftLocator === false){
      this._illegalLoop = true
      this._loop = false
      return false
    }

    // locators can not (yet) be used to jump over a segment
    if(this._rightLocator.millis <= this._leftLocator.millis){
      this._illegalLoop = true
      this._loop = false
      return false
    }

    this._loopDuration = this._rightLocator.millis - this._leftLocator.millis
    //console.log(this._loop, this._loopDuration)
    this._scheduler.beyondLoop = this._currentMillis > this._rightLocator.millis
    return this._loop
  }

  setPrecount(value = 0){
    this._precountBars = value
  }

  _pulse(): void{
    if(this.playing === false && this.precounting === false){
      return
    }
    let now = context.currentTime * 1000
    let diff = now - this._reference
    this._currentMillis += diff
    this._reference = now

    if(this._endPrecountMillis > 0){
      if(this._endPrecountMillis > this._currentMillis){
        this._scheduler.update(diff)
        requestAnimationFrame(this._pulse.bind(this))
        //return because during precounting only precount metronome events get scheduled
        return
      }
      this.precounting = false
      this._endPrecountMillis = 0
      this._currentMillis -= this._precountDuration
      if(this._preparedForRecording){
        this.playing = true
        this.recording = true
      }else{
        this.playing = true
        dispatchEvent({type: 'play', data: this._startMillis})
        //dispatchEvent({type: 'play', data: this._currentMillis})
      }
    }

    if(this._loop && this._currentMillis >= this._rightLocator.millis){
      this._currentMillis -= this._loopDuration
      this._playhead.set('millis', this._currentMillis)
      //this._playhead.set('millis', this._leftLocator.millis) // playhead is a bit ahead only during this frame
      dispatchEvent({
        type: 'loop',
        data: null
      })
    }else{
      this._playhead.update('millis', diff)
    }

    this._ticks = this._playhead.get().ticks

    //console.log(this._currentMillis, this._durationMillis)

    if(this._currentMillis >= this._durationMillis){
      if(this.recording !== true){
        this.stop()
        return
      }else if(this.autoSize !== true){
        this.stop()
        return
      }
      let events = this._metronome.addEvents(this.bars, this.bars + 1)
      let tobeParsed = [...events, ...this._timeEvents]
      sortEvents(tobeParsed)
      parseEvents(tobeParsed)
      this._scheduler.events.push(...events)
      this._scheduler.numEvents += events.length
      let lastEvent = events[events.length - 1]
      let extraMillis = lastEvent.ticksPerBar * lastEvent.millisPerTick
      this._lastEvent.ticks += lastEvent.ticksPerBar
      this._lastEvent.millis += extraMillis
      this._durationMillis += extraMillis
      this.bars++
      this._resized = true
      //console.log('length', this._lastEvent.ticks, this._lastEvent.millis, this.bars, lastEvent)
    }

    this._scheduler.update(diff)

    requestAnimationFrame(this._pulse.bind(this))
  }

  /*
    helper method: converts user friendly position format to internal format

    position:
      - 'ticks', 96000
      - 'millis', 1234
      - 'percentage', 55
      - 'barsbeats', 1, 4, 0, 25 -> bar, beat, sixteenth, tick
      - 'time', 0, 3, 49, 566 -> hours, minutes, seconds, millis

  */
  _calculatePosition(type, args, resultType){
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
        return false
    }

    let position = calculatePosition(this, {
      type,
      target,
      result: resultType,
    })

    return position
  }

  addEventListener(type, callback){
    return addEventListener(type, callback)
  }

  removeEventListener(type, id){
    removeEventListener(type, id)
  }

  saveAsMIDIFile(name){
    saveAsMIDIFile(this, name)
  }
}
