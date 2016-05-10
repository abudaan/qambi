import {getMIDIOutputById, getMIDIOutputs} from './init_midi'
import {context} from './init_audio'


const BUFFER_TIME = 200 // millis
const PRE_BUFFER = 200

export default class Scheduler{

  constructor(song){
    this.song = song
  }


  start(position){
    this.timeStamp = context.currentTime * 1000
    this.songStartMillis = position
    this.events = this.song._events
    this.numEvents = this.events.length
    this.index = 0
    this.setIndex(this.songStartMillis)
    this.pulse()
  }


  stop(){
    this.stopAllSounds()
  }


  pulse(): void{
    if(this.song.playing === false){
      return
    }
    let now = context.currentTime * 1000
    this.maxtime = now - this.timeStamp + BUFFER_TIME

    // @TODO: implement a better end of song calculation!
    let endOfSong = this.update()
    if(endOfSong){
      this.song.stop()
    }
    //console.log('pulse', diff)
    requestAnimationFrame(this.pulse.bind(this))
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


  update(){
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
        let channel = track.channel
        let time = scheduledTime + (BUFFER_TIME * 2)

        // send to external hardware or software instrument
///*
        for(let portId of track._midiOutputIds){
          let port = getMIDIOutputById(portId)
          if(port){
            if(event.type === 128 || event.type === 144 || event.type === 176){
              port.send([event.type + channel, event.data1, event.data2], time)
            }else if(event.type === 192 || event.type === 224){
              port.send([event.type + channel, event.data1], time)
            }
          }
        }
//*/
        // send to javascript instrument
        if(typeof instrument !== 'undefined'){
          // convert to seconds because the audio context uses seconds for scheduling
          instrument.processMIDIEvent(event, scheduledTime / 1000, track._output)
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
    let outputs = getMIDIOutputs()
    outputs.forEach((output) => {
      output.send([0xB0, 0x7B, 0x00], this.timeStamp + (BUFFER_TIME * 2)); // stop all notes
      output.send([0xB0, 0x79, 0x00], this.timeStamp + (BUFFER_TIME * 2)); // reset all controllers
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

