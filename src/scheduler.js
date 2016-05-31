import {getMIDIOutputById, getMIDIOutputs} from './init_midi'
import {context} from './init_audio'
import {MIDIEvent} from './midi_event'
import {sortEvents} from './util' // millis


export default class Scheduler{

  constructor(song){
    this.song = song
    this.notes = new Map()
    this.bufferTime = song.bufferTime
  }


  init(millis){
    this.songCurrentMillis = millis
    this.songStartMillis = millis
    this.events = this.song._allEvents
    this.numEvents = this.events.length
    this.index = 0
    this.maxtime = 0
    this.prevMaxtime = 0
    this.beyondLoop = false // tells us if the playhead has already passed the looped section
    this.precountingDone = false
    this.looped = false
    this.setIndex(this.songStartMillis)
  }


  updateSong(){
    //this.songCurrentMillis = this.song._currentMillis
    this.events = this.song._allEvents
    this.numEvents = this.events.length
    this.index = 0
    this.maxtime = 0
    //this.precountingDone = false
    this.setIndex(this.song._currentMillis)
  }


  setTimeStamp(timeStamp){
    this.timeStamp = timeStamp
  }

  // get the index of the event that has its millis value at or right after the provided millis value
  setIndex(millis){
    let i = 0
    let event
    for(event of this.events){
      if(event.millis >= millis){
        this.index = i;
        break;
      }
      i++;
    }

    this.beyondLoop = millis > this.song._rightLocator.millis
    // this.notes = new Map()
    //this.looped = false
    this.precountingDone = false
  }


  getEvents(){
    let events = []

    if(this.song._loop === true && this.song._loopDuration < this.bufferTime){
      this.maxtime = this.songStartMillis + this.song._loopDuration - 1
      //console.log(this.maxtime, this.song.loopDuration);
    }

    if(this.song._loop === true){

      if(this.maxtime >= this.song._rightLocator.millis && this.beyondLoop === false){
        //console.log('LOOP', this.maxtime, this.song._rightLocator.millis)

        let diff = this.maxtime - this.song._rightLocator.millis
        this.maxtime = this.song._leftLocator.millis + diff

        //console.log('-------LOOPED', this.maxtime, diff, this.song._leftLocator.millis, this.song._rightLocator.millis);

        if(this.looped === false){
          this.looped = true;
          let leftMillis = this.song._leftLocator.millis
          let rightMillis = this.song._rightLocator.millis

          for(let i = this.index; i < this.numEvents; i++){
            let event = this.events[i];
            //console.log(event)
            if(event.millis < rightMillis){
              event.time = this.timeStamp + event.millis - this.songStartMillis
              events.push(event)

              if(event.type === 144){
                this.notes.set(event.midiNoteId, event.midiNote)
              }
              //console.log(event.midiNoteId, event.type)
              this.index++
            }else{
              break
            }
          }

          // stop overflowing notes-> add a new note off event at the position of the right locator (end of the loop)
          let endTicks = this.song._rightLocator.ticks - 1
          let endMillis = this.song.calculatePosition({type: 'ticks', target: endTicks, result: 'millis'}).millis

          for(let note of this.notes.values()){
            let noteOn = note.noteOn
            let noteOff = note.noteOff
            if(noteOff.millis <= rightMillis){
              continue
            }
            let event = new MIDIEvent(endTicks, 128, noteOn.data1, 0)
            event.millis = endMillis
            event._part = noteOn._part
            event._track = noteOn._track
            event.midiNote = note
            event.midiNoteId = note.id
            event.time = this.timeStamp + event.millis - this.songStartMillis
            //console.log('added', event)
            events.push(event)
          }

/*
          // stop overflowing audio samples
          for(i in this.scheduledAudioEvents){
            if(this.scheduledAudioEvents.hasOwnProperty(i)){
              audioEvent = this.scheduledAudioEvents[i];
              if(audioEvent.endMillis > this.song.loopEnd){
                audioEvent.stopSample(this.song.loopEnd/1000);
                delete this.scheduledAudioEvents[i];
                //console.log('stopping audio event', i);
              }
            }
          }
*/
          this.notes = new Map()
          this.setIndex(leftMillis)
          this.timeStamp += this.song._loopDuration
          this.songCurrentMillis -= this.song._loopDuration

          //console.log(events.length)

          // get the audio events that start before song.loopStart
          //this.getDanglingAudioEvents(this.song.loopStart, events);
        }
      }else{
        this.looped = false
      }
    }

    //console.log('scheduler', this.looped)

    // main loop
    for(let i = this.index; i < this.numEvents; i++){
      let event = this.events[i];
      //console.log(event.millis, this.maxtime)
      if(event.millis < this.maxtime){

        //event.time = this.timeStamp + event.millis - this.songStartMillis;

        if(event.type === 'audio'){
          // to be implemented
        }else{
          event.time = (this.timeStamp + event.millis - this.songStartMillis)
          events.push(event);
        }
        this.index++;
      }else{
        break;
      }
    }
    return events;
  }


  update(diff){
    var i,
      event,
      numEvents,
      track,
      events

    this.prevMaxtime = this.maxtime

    if(this.song.precounting){
      this.songCurrentMillis += diff
      this.maxtime = this.songCurrentMillis + this.bufferTime
      //console.log(this.songCurrentMillis)
      events = this.song._metronome.getPrecountEvents(this.maxtime)

      // if(events.length > 0){
      //   console.log(context.currentTime * 1000)
      //   console.log(events)
      // }

      if(this.maxtime > this.song._metronome.endMillis && this.precountingDone === false){
        this.precountingDone = true
        this.timeStamp += this.song._precountDuration

        // start scheduling events of the song -> add the first events of the song
        this.songCurrentMillis = this.songStartMillis
        //console.log('---->', this.songCurrentMillis)
        this.songCurrentMillis += diff
        this.maxtime = this.songCurrentMillis + this.bufferTime
        events.push(...this.getEvents())
        //console.log(events)
      }
    }else{
      this.songCurrentMillis += diff
      this.maxtime = this.songCurrentMillis + this.bufferTime
      events = this.getEvents()
      //events = this.song._getEvents2(this.maxtime, (this.timeStamp - this.songStartMillis))
      //events = this.getEvents2(this.maxtime, (this.timeStamp - this.songStartMillis))
      //console.log('done', this.songCurrentMillis, diff, this.index, events.length)
    }

    // if(this.song.useMetronome === true){
    //   let metronomeEvents = this.song._metronome.getEvents2(this.maxtime, (this.timeStamp - this.songStartMillis))
    //   // if(metronomeEvents.length > 0){
    //   //   console.log(this.maxtime, metronomeEvents)
    //   // }
    //   // metronomeEvents.forEach(e => {
    //   //   e.time = (this.timeStamp + e.millis - this.songStartMillis)
    //   // })
    //   events.push(...metronomeEvents)
    // }

    numEvents = events.length


    // if(numEvents > 5){
    //   console.log(numEvents)
    // }

    //console.log(this.maxtime, this.song._currentMillis, '[diff]', this.maxtime - this.prevMaxtime)

    for(i = 0; i < numEvents; i++){
      event = events[i]
      track = event._track
      // console.log(this.maxtime, this.prevMaxtime, event.millis)

      // if(event.millis > this.maxtime){
      //   // skip events that were harvest accidently while jumping the playhead -> should happen very rarely if ever
      //   console.log('skip', event)
      //   continue
      // }

      if(event._part === null || track === null){
        console.log(event)
        this.notes.set(event.midiNoteId, event.midiNote)
        continue
      }

      if(event._part.muted === true || track.muted === true || event.muted === true){
        continue
      }

      if((event.type === 144 || event.type === 128) && typeof event.midiNote === 'undefined'){
        // this is usually caused by the same note on the same ticks value, which is probably a bug in the midi file
        //console.info('no midiNoteId', event)
        continue
      }
      // /console.log(event.ticks, event.time, event.millis, event.type, event._track.name)

      if(event.type === 'audio'){
        // to be implemented
      }else{
        // convert to seconds because the audio context uses seconds for scheduling
        track.processMIDIEvent(event, true) // true means: use latency to compensate timing for external MIDI devices, see Track.processMIDIEvent
        //console.log(context.currentTime * 1000, event.time, this.index)
        if(event.type === 144){
          this.notes.set(event.midiNoteId, event.midiNote)
        }else if(event.type === 128){
          this.notes.delete(event.midiNoteId)
        }
        // if(this.notes.size > 0){
        //   console.log(this.notes)
        // }
      }
    }
    //console.log(this.index, this.numEvents)
    //return this.index >= 10
    return this.index >= this.numEvents // last event of song
  }

/*
  unschedule(){

    let min = this.song._currentMillis
    let max = min + (bufferTime * 1000)

    //console.log('reschedule', this.notes.size)
    this.notes.forEach((note, id) => {
      // console.log(note)
      // console.log(note.noteOn.millis, note.noteOff.millis, min, max)

      if(typeof note === 'undefined' || note.state === 'removed'){
        //sample.unschedule(0, unscheduleCallback);
        //console.log('NOTE IS UNDEFINED')
        //sample.stop(0)
        this.notes.delete(id)
      }else if((note.noteOn.millis >= min || note.noteOff.millis < max) === false){
        //sample.stop(0)
        let noteOn = note.noteOn
        let noteOff = new MIDIEvent(0, 128, noteOn.data1, 0)
        noteOff.midiNoteId = note.id
        noteOff.time = 0//context.currentTime + min
        note._track.processMIDIEvent(noteOff)
        this.notes.delete(id)
        console.log('STOPPING', id, note._track.name)
      }
    })
    //console.log('NOTES', this.notes.size)
    //this.notes.clear()
  }
*/

  allNotesOff(){
    let timeStamp = context.currentTime * 1000
    let outputs = getMIDIOutputs()
    outputs.forEach((output) => {
      output.send([0xB0, 0x7B, 0x00], timeStamp) // stop all notes
      output.send([0xB0, 0x79, 0x00], timeStamp) // reset all controllers
    })
  }
}


/*

  getEvents2(maxtime, timestamp){
    let loop = true
    let event
    let result = []
    //console.log(this.timeEventsIndex, this.songEventsIndex, this.metronomeEventsIndex)
    while(loop){

      let stop = false

      if(this.timeEventsIndex < this.numTimeEvents){
        event = this.timeEvents[this.timeEventsIndex]
        if(event.millis < maxtime){
          this.millisPerTick = event.millisPerTick
          //console.log(this.millisPerTick)
          this.timeEventsIndex++
        }else{
          stop = true
        }
      }

      if(this.songEventsIndex < this.numSongEvents){
        event = this.songEvents[this.songEventsIndex]
        if(event.type === 0x2F){
          loop = false
          break
        }
        let millis = event.ticks * this.millisPerTick
        if(millis < maxtime){
          event.time = millis + timestamp
          event.millis = millis
          result.push(event)
          this.songEventsIndex++
        }else{
          stop = true
        }
      }

      if(this.song.useMetronome === true && this.metronomeEventsIndex < this.numMetronomeEvents){
        event = this.metronomeEvents[this.metronomeEventsIndex]
        let millis = event.ticks * this.millisPerTick
        if(millis < maxtime){
          event.time = millis + timestamp
          event.millis = millis
          result.push(event)
          this.metronomeEventsIndex++
        }else{
          stop = true
        }
      }

      if(stop){
        loop = false
        break
      }
    }
    sortEvents(result)
    return result
  }


*/
