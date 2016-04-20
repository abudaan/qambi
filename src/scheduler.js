import {getMIDIOutputById, getMIDIOutputs} from './init_midi'

const BUFFER_TIME = 200 // millis
const PRE_BUFFER = 200

export default class Scheduler{

  constructor(song){
    this.song = song
  }

  setStartPosition(position, timeStamp){
    this.timeStamp = timeStamp
    this.songStartPosition = position
    this.events = this.song._events
    this.numEvents = this.events.length
    this.time = 0
    this.index = 0
    this.setIndex(this.songStartPosition)
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

        //event.time = this.timeStamp + event.millis - this.songStartPosition;

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


  update(position){
    //console.log('update')
    var i,
      event,
      numEvents,
      track,
      events,
      instrument

    this.maxtime = position + BUFFER_TIME
    //console.log(position, this.maxtime)
    events = this.getEvents()
    numEvents = events.length

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

      this.time = (this.timeStamp + event.millis - this.songStartPosition)

      if(event.type === 'audio'){
        // to be implemented
      }else{
        let channel = track.channel
        let time = this.time + (BUFFER_TIME * 2)

        // send to external hardware or software instrument
///*
        for(let portId of track._midiOutputIds){
          let port = getMIDIOutputById(portId)
          if(port){
            if(event.type === 128 || event.type === 144 || event.type === 176){
              //midiOutput.send([event.type, event.data1, event.data2], this.time + sequencer.midiOutLatency);
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
          instrument.processMIDIEvent(event, this.time / 1000, track._output)
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
      output.send([0xB0, 0x7B, 0x00], this.time + (BUFFER_TIME * 2)); // stop all notes
      output.send([0xB0, 0x79, 0x00], this.time + (BUFFER_TIME * 2)); // reset all controllers
    })
//*/
    let tracks = this.song._tracks
    tracks.forEach((track) => {
      let instrument = track._instrument
      if(typeof instrument !== 'undefined'){
        instrument.stopAllSounds()
      }
      // for(let portId of track._midiOutputIds){
      //   let port = getMIDIOutputById(portId)
      //   if(port){
      //     port.send([0xB0, 0x7B, 0x00], this.time + BUFFER_TIME); // stop all notes
      //     port.send([0xB0, 0x79, 0x00], this.time + BUFFER_TIME); // reset all controllers
      //   }else{
      //     console.warn(`port unavailable ${port.name}`)
      //   }
      // }
    })
  }
}

