import {getMIDIOutputById, getMIDIOutputs} from './init_midi'
import {context} from './init_audio'
import {MIDIEvent} from './midi_event'
import {bufferTime} from './settings' // millis


export default class Scheduler{

  constructor(song){
    this.song = song
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
    this.setIndex(this.songStartMillis)
  }


  setTimeStamp(timeStamp){
    this.timeStamp = timeStamp
  }

  // get the index of the event that has its millis value at or right after the provided millis value
  setIndex(millis){
    let i = 0;
    for(let event of this.events){
      if(event.millis >= millis){
        this.index = i;
        break;
      }
      i++;
    }
    this.beyondLoop = millis > this.song._rightLocator.millis
    this.notes = new Map()
    this.precountingDone = false
  }


  getEvents(){
    let events = []

    if(this.song._loop === true && this.song._loopDuration < bufferTime){
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
      this.maxtime = this.songCurrentMillis + bufferTime
      events = this.song._metronome.getPrecountEvents(this.maxtime)

      if(this.maxtime > this.song._metronome.endMillis && this.precountingDone === false){
        this.precountingDone = true
        this.timeStamp += this.song._metronome.precountDuration

        // start scheduling events of the song -> add the first events of the song
        this.songCurrentMillis = this.songStartMillis
        this.songCurrentMillis += diff
        this.maxtime = this.songCurrentMillis + bufferTime
        events.push(...this.getEvents())
      }
    }else{
      this.songCurrentMillis += diff
      this.maxtime = this.songCurrentMillis + bufferTime
      events = this.getEvents()
      //console.log('done', this.songCurrentMillis, diff, this.index, events.length)
    }

    numEvents = events.length


    // if(numEvents > 5){
    //   console.log(numEvents)
    // }

    for(i = 0; i < numEvents; i++){
      event = events[i]
      track = event._track
      //console.log(event.millis, this.maxtime, this.prevMaxtime)

      // if(event.millis > this.maxtime){
      //   // skip events that were harvest accidently while jumping the playhead -> should happen very rarely if ever
      //   console.log('skip', event)
      //   continue
      // }

      if(event._part.muted === true || track.muted === true || event.muted === true){
        continue
      }

      if((event.type === 144 || event.type === 128) && typeof event.midiNote === 'undefined'){
        // this is usually caused by the same note on the same ticks value, which is probably a bug in the midi file
        //console.info('no midiNoteId', event)
        continue
      }


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
      }
    }
    //console.log(this.index, this.numEvents)
    //return this.index >= 10
    return this.index >= this.numEvents // last event of song
  }

/*
  allNotesOff(){
    let timeStamp = context.currentTime * 1000
    let outputs = getMIDIOutputs()
    outputs.forEach((output) => {
      output.send([0xB0, 0x7B, 0x00], timeStamp) // stop all notes
      output.send([0xB0, 0x79, 0x00], timeStamp) // reset all controllers
    })
  }
*/
}

