import {getMIDIOutputById, getMIDIOutputs} from './init_midi'
import {context} from './init_audio'


const BUFFER_TIME = 200 // millis

export default class Scheduler{

  constructor(song){
    this.song = song
  }


  init(millis, timeStamp){
    this.songStartMillis = millis
    this.timeStamp = timeStamp
    this.events = this.song._events
    this.numEvents = this.events.length
    this.index = 0
    this.setIndex(this.songStartMillis)
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
  }


  getEvents(){
    let events = []
    // main loop
    for(let i = this.index; i < this.numEvents; i++){
      let event = this.events[i];
      //console.log(event.millis, this.maxtime)
      if(event.millis < this.maxtime){

        //event.time = this.timeStamp + event.millis - this.songStartMillis;

        if(event.type === 'audio'){
          // to be implemented
        }else{
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


      if((event.type === 144 || event.type === 128) && typeof event.midiNoteId === 'undefined'){
        // this is usually caused by the same note on the same ticks value, which is probably a bug in the midi file
        console.info('no midiNoteId', event)
        continue
      }

      // debug minute_waltz double events
      // if(event.ticks > 40300){
      //   console.info(event)
      // }

      scheduledTime = (this.timeStamp + event.millis - this.songStartMillis)
      //console.log('scheduled', scheduledTime, 'current', context.currentTime * 1000)

      if(event.type === 'audio'){
        // to be implemented
      }else{

        // send to javascript instrument
        if(typeof instrument !== 'undefined'){
          // convert to seconds because the audio context uses seconds for scheduling
          instrument.processMIDIEvent(event, scheduledTime / 1000, track._output)
        }

        // send to external hardware or software instrument
        let channel = track.channel
        let offset = (BUFFER_TIME * 2) // why does this work?

        for(let portId of track._midiOutputIds){
          let port = getMIDIOutputById(portId)
          if(port){
            if(event.type === 128 || event.type === 144 || event.type === 176){
              port.send([event.type + channel, event.data1, event.data2], scheduledTime + offset)
            }else if(event.type === 192 || event.type === 224){
              port.send([event.type + channel, event.data1], scheduledTime + offset)
            }
          }
        }
      }
    }
    //console.log(this.index, this.numEvents)
    //return this.index >= 10
    return this.index >= this.numEvents // end of song
  }


  stopAllSounds(){
    console.log('STOP')
///*

    let timeStamp = context.currentTime * 1000
    let outputs = getMIDIOutputs()
    outputs.forEach((output) => {
      output.send([0xB0, 0x7B, 0x00], timeStamp + (BUFFER_TIME * 2)); // stop all notes
      output.send([0xB0, 0x79, 0x00], timeStamp + (BUFFER_TIME * 2)); // reset all controllers
    })
//*/
    let tracks = this.song._tracks
    tracks.forEach((track) => {
      let instrument = track._instrument
      if(typeof instrument !== 'undefined'){
        instrument.stopAllSounds()
      }
    })
  }
}

