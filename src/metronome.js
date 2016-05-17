import {Track} from './track'
import {Part} from './part'
import {parseEvents} from './parse_events'
import {MIDIEvent} from './midi_event'
import {checkMIDINumber} from './util'
import {calculatePosition} from './position'
import {Instrument} from './instrument'
import {getInitData} from './init_audio'
import {bufferTime} from './settings' // millis


let
  methodMap = new Map([
    ['volume', 'setVolume'],
    ['instrument', 'setInstrument'],
    ['noteNumberAccentedTick', 'setNoteNumberAccentedTick'],
    ['noteNumberNonAccentedTick', 'setNoteNumberNonAccentedTick'],
    ['velocityAccentedTick', 'setVelocityAccentedTick'],
    ['velocityNonAccentedTick', 'setVelocityNonAccentedTick'],
    ['noteLengthAccentedTick', 'setNoteLengthAccentedTick'],
    ['noteLengthNonAccentedTick', 'setNoteLengthNonAccentedTick']
  ]);

export class Metronome{

  constructor(song){
    this.song = song
    this.track = new Track(this.song.id + '_metronome')
    this.part = new Part()
    this.track.addParts(this.part)
    this.track.connect(this.song._output)

    this.events = []
    this.precountEvents = []
    this.precountDurationInMillis = 0
    this.bars = 0
    this.index = 0
    this.precountIndex = 0
    this.reset();
  }


  reset(){

    let data = getInitData()
    let instrument = new Instrument('metronome')
    instrument.updateSampleData({
      note: 60,
      buffer: data.lowtick,
    }, {
      note: 61,
      buffer: data.hightick,
    })
    this.track.setInstrument(instrument)

    this.volume = 1

    this.noteNumberAccented = 61
    this.noteNumberNonAccented = 60

    this.velocityAccented = 100
    this.velocityNonAccented = 100

    this.noteLengthAccented = this.song.ppq / 4 // sixteenth notes -> don't make this too short if your sample has a long attack!
    this.noteLengthNonAccented = this.song.ppq / 4
  }

  createEvents(startBar, endBar, id = 'init'){
    let i, j
    let position
    let velocity
    let noteLength
    let noteNumber
    let beatsPerBar
    let ticksPerBeat
    let ticks = 0
    let noteOn, noteOff
    let events = []

    //console.log(startBar, endBar);

    for(i = startBar; i <= endBar; i++){
      position = calculatePosition(this.song, {
        type: 'barsbeats',
        target: [i],
      })

      beatsPerBar = position.nominator
      ticksPerBeat = position.ticksPerBeat

      for(j = 0; j < beatsPerBar; j++){

        noteNumber = j === 0 ? this.noteNumberAccented : this.noteNumberNonAccented
        noteLength = j === 0 ? this.noteLengthAccented : this.noteLengthNonAccented
        velocity = j === 0 ? this.velocityAccented : this.velocityNonAccented

        noteOn = new MIDIEvent(ticks, 144, noteNumber, velocity)
        noteOff = new MIDIEvent(ticks + noteLength, 128, noteNumber, 0)

        if(id === 'precount'){
          noteOn._track = this.track
          noteOff._track = this.track
          noteOn._part = {}
          noteOff._part = {}
        }

        events.push(noteOn, noteOff)
        ticks += ticksPerBeat
      }
    }

    return events
  }


  getEvents(startBar = 1, endBar = this.song.bars, id = 'init'){
    this.part.removeEvents(this.part.getEvents())
    this.events = this.createEvents(startBar, endBar, id)
    this.part.addEvents(...this.events)
    this.bars = this.song.bars
    //console.log('getEvents %O', this.events)
    return this.events
  }


  createPrecountEvents(precount, timeStamp){
    if(precount <= 0){
      return -1
    }

    this.timeStamp = timeStamp

    let songStartPosition = this.song.getPosition()

    let endPos = calculatePosition(this.song, {
      type: 'barsbeats',
      target: [songStartPosition.bar + precount],
      result: 'all',
    })

    //console.log(this.songStartPosition, endPos)

    this.precountIndex = 0
    this.millis = songStartPosition.millis
    this.startMillis = songStartPosition.millis
    this.endMillis = endPos.millis
    this.precountDurationInMillis = endPos.millis - this.startMillis

    //console.log(this.precountDurationInMillis)

    this.precountEvents = this.createEvents(songStartPosition.bar, endPos.bar - 1, 'precount');
    this.precountEvents = parseEvents([...this.song._timeEvents, ...this.precountEvents])

    //console.log(songStartPosition.bar, endPos.bar, precount, this.precountEvents.length);
    //console.log(this.precountEvents, this.precountDurationInMillis);
    return this.precountDurationInMillis
  }


  // called by scheduler.js
  getPrecountEvents(diff){
    let events = this.precountEvents,
      maxi = events.length, i, evt,
      result = [];

    this.millis += diff
    let maxtime = this.millis + bufferTime
    //console.log(maxtime, maxi, this.precountIndex, this.millis)

    for(i = this.precountIndex; i < maxi; i++){
      evt = events[i];
      //console.log(event.millis, maxtime, this.millis);
      if(evt.millis < maxtime){
        evt.time = this.timeStamp + evt.millis
        result.push(evt)
        this.precountIndex++
      }else{
        break;
      }
    }
    //console.log(result.length);
    return result;
  }


  mute(flag){
    this.track.muted = flag
  }


  allNotesOff(){
    this.track._instrument.allNotesOff()
  }


  // =========== CONFIGURATION ===========

  updateConfig(){
    this.init(1, this.bars, 'update');
    this.allNotesOff();
    this.song._scheduler.updateSong();
  }

  // added to public API: Song.configureMetronome({})
  configure(config){

    Object.keys(config).forEach(function(key){
      this[methodMap.get(key)](config.key);
    }, this);

    this.updateConfig();
  }


  setInstrument(instrument){
    if(!instrument instanceof Instrument){
      console.warn('not an instance of Instrument')
      return
    }
    this.track.setInstrument(instrument)
    this.updateConfig();
  }


  setNoteLengthAccentedTick(value){
    if(isNaN(value)){
      console.warn('please provide a number');
    }
    this.noteLengthAccented = value;
    this.updateConfig();
  }


  setNoteLengthNonAccentedTick(value){
    if(isNaN(value)){
      console.warn('please provide a number');
    }
    this.noteLengthNonAccented = value;
    this.updateConfig();
  }


  setVelocityAccentedTick(value){
    value = checkMIDINumber(value);
    if(value !== false){
      this.velocityAccented = value;
    }else{
      console.warn('please provide a number');
    }
    this.updateConfig();
  }


  setVelocityNonAccentedTick(value){
    value = checkMIDINumber(value);
    if(value !== false){
      this.velocityNonAccented = value;
    }else{
      console.warn('please provide a number');
    }
    this.updateConfig();
  }


  setNoteNumberAccentedTick(value){
    value = checkMIDINumber(value);
    if(value !== false){
      this.noteNumberAccented = value;
    }else{
      console.warn('please provide a number');
    }
    this.updateConfig();
  }


  setNoteNumberNonAccentedTick(value){
    value = checkMIDINumber(value);
    if(value !== false){
      this.noteNumberNonAccented = value;
    }else{
      console.warn('please provide a number');
    }
    this.updateConfig();
  }


  setVolume(value){
    this.track.setVolume(value);
  }
}

