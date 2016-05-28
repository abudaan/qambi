//@ flow

import {MIDIEventTypes} from './constants'
import {parseEvents} from './parse_events'
import {context, masterGain, unlockWebAudio} from './init_audio'
import Scheduler from './scheduler'
import {MIDIEvent} from './midi_event'
import {songFromMIDIFile, songFromMIDIFileSync} from './song_from_midifile'
import {sortEvents} from './util'
import {calculatePosition} from './position'
import {Playhead} from './playhead'
import {Metronome} from './metronome'
import {addEventListener, removeEventListener, dispatchEvent} from './eventlistener'
import {defaultSong} from './settings'
import {saveAsMIDIFile} from './save_midifile'
import {update, _update} from './song.update'

let instanceIndex = 0
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
  autoQuantize: boolean,
}
*/

/*
  // initialize song with tracks and part so you do not have to create them separately
  setup: {
    timeEvents: []
    tracks: [
      parts []
    ]
  }
*/

export class Song{

  static fromMIDIFile(data){
    return songFromMIDIFile(data)
  }

  static fromMIDIFileSync(data){
    return songFromMIDIFileSync(data)
  }

  constructor(settings: {} = {}){

    this.id = `${this.constructor.name}_${instanceIndex++}_${new Date().getTime()}`;

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
    this.looping = false

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
    this.update()
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

  update(){
    update.call(this)
  }

  play(type, ...args): void{
    //unlockWebAudio()
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

      // create precount events, the playhead will be moved to the first beat of the current bar
      let position = this.getPosition()
      this._metronome.createPrecountEvents(position.bar, position.bar + this._precountBars, this._reference)
      this._currentMillis = this._calculatePosition('barsbeats', [position.bar], 'millis').millis
      this._precountDuration = this._metronome.precountDuration
      this._endPrecountMillis = this._currentMillis + this._precountDuration

      // console.group('precount')
      // console.log('position', this.getPosition())
      // console.log('_currentMillis', this._currentMillis)
      // console.log('endPrecountMillis', this._endPrecountMillis)
      // console.log('_precountDuration', this._precountDuration)
      // console.groupEnd('precount')
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
    this._loop = this.looping && this._currentMillis <= this._rightLocator.millis
    this._pulse()
  }

  _pulse(): void{
    if(this.playing === false && this.precounting === false){
      return
    }

    if(this._performUpdate === true){
      this._performUpdate = false
      //console.log('pulse update', this._currentMillis)
      _update.call(this)
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
      if(this.recording !== true || this.autoSize !== true){
        this.stop()
        return
      }
      // add an extra bar to the size of this song
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
    //console.log('STOP')
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

    this._scheduler.allNotesOff()
    this._metronome.allNotesOff()
  }

  panic(){
    return new Promise(resolve => {
      this._tracks.forEach((track) => {
        track.disconnect(this._output)
      })
      setTimeout(() => {
        this._tracks.forEach((track) => {
          track.connect(this._output)
        })
        resolve()
      }, 100)
    })
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

    this.looping = flag !== null ? flag : !this._loop

    if(this._rightLocator === false || this._leftLocator === false){
      this._illegalLoop = true
      this._loop = false
      this.looping = false
      return false
    }

    // locators can not (yet) be used to jump over a segment
    if(this._rightLocator.millis <= this._leftLocator.millis){
      this._illegalLoop = true
      this._loop = false
      this.looping = false
      return false
    }

    this._loopDuration = this._rightLocator.millis - this._leftLocator.millis
    //console.log(this._loop, this._loopDuration)
    this._scheduler.beyondLoop = this._currentMillis > this._rightLocator.millis
    this._loop = this.looping && this._currentMillis <= this._rightLocator.millis
    //console.log(this._loop, this.looping)
    return this.looping
  }

  setPrecount(value = 0){
    this._precountBars = value
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
        //target = args[0] || 0
        target = args || 0
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
