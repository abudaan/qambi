import {getMIDIOutputById, getMIDIOutputs} from './init_midi'
import {context} from './init_audio'
import {MIDIEvent} from './midi_event'


const BUFFER_TIME = 200 // millis

export default class Scheduler{

  constructor(song){
    this.song = song
  }


  init(millis){
    this.songStartMillis = millis
    this.events = this.song._allEvents
    this.numEvents = this.events.length
    this.index = 0
    this.beyondLoop = false // tells us if the playhead has already passed the looped section
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
  }


  getEvents(){
    let events = []

    if(this.song._loop === true && this.song._loopDuration < BUFFER_TIME){
      this.maxtime = this.songStartMillis + this.song._loopDuration - 1;
      //console.log(maxtime, this.song.loopDuration);
    }

    if(this.song._loop === true){

      if(this.maxtime >= this.song._rightLocator.millis && this.beyondLoop === false){


        let diff = this.maxtime - this.song._rightLocator.millis
        this.maxtime = this.song._leftLocator.millis + diff

        //console.log('-------LOOPED', this.maxtime, this.song._leftLocator.millis, diff);

        if(this.looped === false){
          this.looped = true;
          for(let i = this.index; i < this.numEvents; i++){
            let event = this.events[i];
            if(event.millis < this.song._rightLocator.millis){
              event.time = this.timeStamp + event.millis - this.songStartMillis;
              events.push(event);
              this.index++;
            }else{
              break;
            }
          }

          // stop overflowing notes-> move the note off event to the position of the right locator (end of the loop)
          let endTicks = this.song._rightLocator.ticks - 1
          let endMillis = this.song.calculatePosition({type: 'ticks', target: endTicks, result: 'millis'}).millis

          let updated = []
          let leftMillis = this.song._leftLocator.millis
          let rightMillis = this.song._rightLocator.millis

          events.forEach(event => {
            if(event.type === 128 && event.millis > rightMillis){
              let clone = new MIDIEvent(endTicks, 128, event.data1, 0)
              clone.millis = endMillis
              clone.midiNote = event.midiNote
              clone._track = event._track
              clone.time = this.timeStamp + clone.millis - this.songStartMillis
              updated.push(clone)
            }else{
              updated.push(event)
            }
          })

          events = [...updated]
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
          this.setIndex(leftMillis)
          this.timeStamp += this.song._loopDuration

          // get the audio events that start before song.loopStart
          //this.getDanglingAudioEvents(this.song.loopStart, events);
        }
      }else{
        this.looped = false
      }
    }

    //console.log(this.looped)

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


  update(millis){
    var i,
      event,
      numEvents,
      track,
      events,
      instrument,
      scheduledTime

    //console.log(position, this.maxtime)
    events = this.getEvents()
    numEvents = events.length
    this.maxtime = millis + BUFFER_TIME
    //console.log(millis)

    //console.log('update', this.maxtime, numEvents)

    for(i = 0; i < numEvents; i++){
      event = events[i]
      track = event._track
      instrument = track._instrument

      //console.log(event.ticks)

      // if(typeof instrument === 'undefined'){
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

      // debug minute_waltz double events
      // if(event.ticks > 40300){
      //   console.info(event)
      // }

      //scheduledTime = (this.timeStamp + event.millis - this.songStartMillis)
      //console.log('scheduled', scheduledTime, 'current', context.currentTime * 1000)

      if(event.type === 'audio'){
        // to be implemented
      }else{

        // send to javascript instrument
        if(typeof instrument !== 'undefined'){
          // convert to seconds because the audio context uses seconds for scheduling
          //instrument.processMIDIEvent(event, scheduledTime / 1000, track._output)
          instrument.processMIDIEvent(event, event.time / 1000, track._output)
        }

        // send to external hardware or software instrument
        let channel = track.channel
        let offset = (BUFFER_TIME * 2) // why does this work?

        for(let portId of track._midiOutputIds){
          let port = getMIDIOutputById(portId)
          if(port){
            if(event.type === 128 || event.type === 144 || event.type === 176){
              // port.send([event.type + channel, event.data1, event.data2], scheduledTime + offset)
              port.send([event.type + channel, event.data1, event.data2], event.time + offset)
            }else if(event.type === 192 || event.type === 224){
              // port.send([event.type + channel, event.data1], scheduledTime + offset)
              port.send([event.type + channel, event.data1], event.time + offset)
            }
          }
        }
      }
    }
    //console.log(this.index, this.numEvents)
    //return this.index >= 10
    return this.index >= this.numEvents // end of song
  }


  allNotesOff(){
    let timeStamp = context.currentTime * 1000
    let outputs = getMIDIOutputs()
    outputs.forEach((output) => {
      output.send([0xB0, 0x7B, 0x00], timeStamp + (BUFFER_TIME * 2)); // stop all notes
      output.send([0xB0, 0x79, 0x00], timeStamp + (BUFFER_TIME * 2)); // reset all controllers
    })
  }
}

