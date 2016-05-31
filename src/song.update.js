// called by song
import {parseTimeEvents, parseEvents} from './parse_events'
import {sortEvents} from './util'
import {MIDIEventTypes} from './constants'
import {calculatePosition} from './position'
import {MIDIEvent} from './midi_event'
import {dispatchEvent} from './eventlistener'


export function update():void{
  if(this.playing === false){
    _update.call(this)
  }else{
    this._performUpdate = true
  }
}

export function _update():void{

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

  //console.groupCollapsed('update song')
  console.time('updating song took')


// TIME EVENTS

  // check if time events are updated
  if(this._updateTimeEvents === true){
    //console.log('updateTimeEvents', this._timeEvents.length)
    parseTimeEvents(this, this._timeEvents, this.isPlaying)
    //console.log('time events %O', this._timeEvents)
  }

  // only parse new and moved events
  let tobeParsed = []

  // but parse all events if the time events have been updated
  if(this._updateTimeEvents === true){
    tobeParsed = [...this._events]
  }


// PARTS

  // filter removed parts
  //console.log('removed parts %O', this._removedParts)
  this._removedParts.forEach((part) => {
    this._partsById.delete(part.id)
  })


  // add new parts
  //console.log('new parts %O', this._newParts)
  this._newParts.forEach((part) => {
    part._song = this
    this._partsById.set(part.id, part)
    part.update()
  })


  // update changed parts
  //console.log('changed parts %O', this._changedParts)
  this._changedParts.forEach((part) => {
    part.update()
  })


  // removed parts
  //console.log('removed parts %O', this._changedParts)
  this._removedParts.forEach((part) => {
    this._partsById.delete(part.id)
  })

  if(this._removedParts.length > 0){
    this._parts = Array.from(this._partsById.values())
  }


// EVENTS

  // filter removed events
  //console.log('removed events %O', this._removedEvents)
  this._removedEvents.forEach((event) => {
    let track = event.midiNote._track
    // unschedule all removed events that already have been scheduled
    if(event.time >= this._currentMillis){
      track.unschedule(event)
    }
    this._notesById.delete(event.midiNote.id)
    this._eventsById.delete(event.id)
  })


  // add new events
  //console.log('new events %O', this._newEvents)
  this._newEvents.forEach((event) => {
    this._eventsById.set(event.id, event)
    this._events.push(event)
    tobeParsed.push(event)
  })


  // moved events need to be parsed
  //console.log('moved %O', this._movedEvents)
  this._movedEvents.forEach((event) => {
    // don't add moved events if the time events have been updated -> they have already been added to the tobeParsed array
    if(this._updateTimeEvents === false){
      tobeParsed.push(event)
    }
  })


  // parse all new and moved events
  if(tobeParsed.length > 0){
    //console.time('parse')
    //console.log('tobeParsed %O', tobeParsed)
    //console.log('parseEvents', tobeParsed.length)

    tobeParsed = [...tobeParsed, ...this._timeEvents]
    parseEvents(tobeParsed, this.isPlaying)

    // add MIDI notes to song
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
    //console.timeEnd('parse')
  }


  if(tobeParsed.length > 0 || this._removedEvents.length > 0){
    //console.time('to array')
    this._events = Array.from(this._eventsById.values())
    this._notes = Array.from(this._notesById.values())
    //console.timeEnd('to array')
  }


  //console.time(`sorting ${this._events.length} events`)
  sortEvents(this._events)
  this._notes.sort(function(a, b){
    return a.noteOn.ticks - b.noteOn.ticks
  })
  //console.timeEnd(`sorting ${this._events.length} events`)

  //console.log('notes %O', this._notes)
  console.timeEnd('updating song took')


// SONG DURATION

  // get the last event of this song
  let lastEvent = this._events[this._events.length - 1]
  let lastTimeEvent = this._timeEvents[this._timeEvents.length - 1]

  // check if song has already any events
  if(lastEvent instanceof MIDIEvent === false){
    lastEvent = lastTimeEvent
  }else if(lastTimeEvent.ticks > lastEvent.ticks){
    lastEvent = lastTimeEvent
  }
  //console.log(lastEvent)

  // get the position data of the first beat in the bar after the last bar
  this.bars = Math.max(lastEvent.bar, this.bars)
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

  //console.log('length', this._lastEvent.ticks, this._lastEvent.millis, this.bars)

  this._durationTicks = this._lastEvent.ticks
  this._durationMillis = this._lastEvent.millis


// METRONOME

  // add metronome events
  if(this._updateMetronomeEvents || this._metronome.bars !== this.bars || this._updateTimeEvents === true){
    this._metronomeEvents = parseEvents([...this._timeEvents, ...this._metronome.getEvents()])
  }
  this._allEvents = [...this._metronomeEvents, ...this._events]
  sortEvents(this._allEvents)
  //console.log('all events %O', this._allEvents)

/*
  this._metronome.getEvents()
  this._allEvents = [...this._events]
  sortEvents(this._allEvents)
*/

  //console.log('current millis', this._currentMillis)
  this._playhead.updateSong()
  this._scheduler.updateSong()

  if(this.playing === false){
    this._playhead.set('millis', this._currentMillis)
    dispatchEvent({
      type: 'position',
      data: this._playhead.get().position
    })
  }

  // reset
  this._newParts = []
  this._removedParts = []
  this._newEvents = []
  this._movedEvents = []
  this._removedEvents = []
  this._resized = false
  this._updateTimeEvents = false

  //console.groupEnd('update song')
}
