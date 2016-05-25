import {getPosition2} from './position.js'
import {dispatchEvent} from './eventlistener.js'
import {sortEvents} from './util.js'

const range = 10 // milliseconds or ticks
let instanceIndex = 0

export class Playhead{

  constructor(song, type = 'all'){
    this.id = `${this.constructor.name}_${instanceIndex++}_${new Date().getTime()}`
    this.song = song
    this.type = type
    this.lastEvent = null
    this.data = {}

    this.activeParts = []
    this.activeNotes = []
    this.activeEvents = []
  }

  // unit can be 'millis' or 'ticks'
  set(unit, value){
    this.unit = unit
    this.currentValue = value
    this.eventIndex = 0
    this.noteIndex = 0
    this.partIndex = 0
    this.calculate()
    return this.data
  }


  get(){
    return this.data
  }


  update(unit, diff){
    if(diff === 0){
      return this.data
    }
    this.unit = unit
    this.currentValue += diff
    this.calculate()
    return this.data
  }


  updateSong(){
    this.events = [...this.song._events, ...this.song._timeEvents]
    sortEvents(this.events)
    //console.log('events %O', this.events)
    this.notes = this.song._notes
    this.parts = this.song._parts
    this.numEvents = this.events.length
    this.numNotes = this.notes.length
    this.numParts = this.parts.length
    //this.set('millis', this.song._millis)
  }


  calculate(){
    let i
    let value
    let event
    let note
    let part
    let position
    let stillActiveNotes = []
    let stillActiveParts = []
    let collectedParts = new Set()
    let collectedNotes = new Set()

    this.data = {}
    this.activeEvents = []

    for(i = this.eventIndex; i < this.numEvents; i++){
      event = this.events[i]
      value = event[this.unit]
      if(value <= this.currentValue){
        // if the playhead is set to a position of say 3000 millis, we don't want to add events more that 10 units before the playhead
        if(value === 0 || value > this.currentValue - range){
          this.activeEvents.push(event)
          // this doesn't work too well
          if(event.type === 176){
            //console.log(event.type, event.data1, event.data2)
            if(event.data1 === 64){
              dispatchEvent({
                type: 'sustainpedal2',
                data: event.data2 === 127 ? 'down' : 'up'
              })
            }
          // }else{
          //   dispatchEvent({
          //     type: 'event',
          //     data: event
          //   })
          }

          dispatchEvent({
            type: 'event',
            data: event
          })
        }
        this.lastEvent = event
        this.eventIndex++
      }else{
        break
      }
    }
    //console.log('-----------------')
    this.data.activeEvents = this.activeEvents

    // if a song has no events yet, use the first time event as reference
    if(this.lastEvent === null){
      this.lastEvent = this.song._timeEvents[0]
    }

    position = getPosition2(this.song, this.unit, this.currentValue, 'all', this.lastEvent)
    this.data.eventIndex = this.eventIndex
    this.data.millis = position.millis
    this.data.ticks = position.ticks
    this.data.position = position

    if(this.type.indexOf('all') !== -1){
      var data = this.data
      for(let key of Object.keys(position)){
        data[key] = position[key]
      }
    }else if(this.type.indexOf('barsbeats') !== -1){
      this.data.bar = position.bar
      this.data.beat = position.beat
      this.data.sixteenth = position.sixteenth
      this.data.tick = position.tick
      this.data.barsAsString = position.barsAsString

      this.data.ticksPerBar = position.ticksPerBar
      this.data.ticksPerBeat = position.ticksPerBeat
      this.data.ticksPerSixteenth = position.ticksPerSixteenth
      this.data.numSixteenth = position.numSixteenth

    }else if(this.type.indexOf('time') !== -1){
      this.data.hour = position.hour
      this.data.minute = position.minute
      this.data.second = position.second
      this.data.millisecond = position.millisecond
      this.data.timeAsString = position.timeAsString

    }else if(this.type.indexOf('percentage') !== -1){
      this.data.percentage = position.percentage
    }

    // get active notes
    if(this.type.indexOf('notes') !== -1 || this.type.indexOf('all') !== -1){

      // get all notes between the noteIndex and the current playhead position
      for(i = this.noteIndex; i < this.numNotes; i++){
        note = this.notes[i]
        value = note.noteOn[this.unit]
        if(value <= this.currentValue){
          this.noteIndex++
          if(typeof note.noteOff === 'undefined'){
            continue;
          }
          // if the playhead is set to a position of say 3000 millis, we don't want to add notes before the playhead
          if(this.currentValue === 0 || note.noteOff[this.unit] > this.currentValue){
            collectedNotes.add(note)
            dispatchEvent({
              type: 'noteOn',
              data: note
            })
          }
        }else{
          break;
        }
      }

      // filter notes that are no longer active
      for(i = this.activeNotes.length - 1; i >= 0; i--){
        note = this.activeNotes[i];
        //if(note.noteOn.state.indexOf('removed') === 0 || this.song._notesById.get(note.id) === false){
        if(this.song._notesById.get(note.id) === false){
          //console.log('skipping removed note', note.id);
          continue;
        }

        if(typeof note.noteOff === 'undefined'){
          console.warn('note with id', note.id, 'has no noteOff event');
          continue;
        }

        //if(note.noteOff[this.unit] > this.currentValue && collectedNotes.has(note) === false){
        if(note.noteOff[this.unit] > this.currentValue){
          stillActiveNotes.push(note);
        }else{
          dispatchEvent({
            type: 'noteOff',
            data: note
          })
        }
      }

      // add the still active notes and the newly active events to the active notes array
      this.activeNotes = [...collectedNotes.values(), ...stillActiveNotes]
      this.data.activeNotes = this.activeNotes
    }


    // get active parts
    if(this.type.indexOf('parts') !== -1 || this.type.indexOf('all') !== -1){

      for(i = this.partIndex; i < this.numParts; i++){
        part = this.parts[i]
        //console.log(part, this.unit, this.currentValue);
        if(part._start[this.unit] <= this.currentValue){
          collectedParts.add(part)
          dispatchEvent({
            type: 'partOn',
            data: part
          })
          this.partIndex++
        }else{
          break
        }
      }


      // filter parts that are no longer active
      for(i = this.activeParts.length - 1; i >= 0; i--){
        part = this.activeParts[i];
        //if(part.state.indexOf('removed') === 0 || this.song._partsById.get(part.id) === false){
        if(this.song._partsById.get(part.id) === false){
          //console.log('skipping removed part', part.id);
          continue;
        }

        //if(part._end[this.unit] > this.currentValue && collectedParts.has(part) === false){
        if(part._end[this.unit] > this.currentValue){
          stillActiveParts.push(note);
        }else{
          dispatchEvent({
            type: 'partOff',
            data: part
          })
        }
      }

      this.activeParts = [...collectedParts.values(), ...stillActiveParts]
      this.data.activeParts = this.activeParts
    }

    dispatchEvent({
      type: 'position',
      data: this.data
    })

  }

/*
  setType(t){
    this.type = t;
    this.set(this.unit, this.currentValue);
    //console.log(type,activeParts);
  }


  addType(t){
    this.type += ' ' + t;
    this.set(this.unit, this.currentValue);
    //console.log(type,activeParts);
  }

  removeType(t){
    var arr = this.type.split(' ');
    this.type = '';
    arr.forEach(function(type){
      if(type !== t){
        this.type += t + ' ';
      }
    });
    this.type.trim();
    this.set(this.currentValue);
    //console.log(type,activeParts);
  }
*/

}
