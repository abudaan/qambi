
import {getMIDIOutputs} from './init_midi'

const BUFFER_TIME = 400 // millis
const PRE_BUFFER = 400

export default class Scheduler{

  constructor(data){
    ({
      song_id: this.songId,
      start_position: this.songStartPosition,
      timeStamp: this.timeStamp,
      midiEvents: this.events,
      instruments: this.instruments,
      parts: this.parts,
      tracks: this.tracks,
      settings: {
        bars: this.bars,
        loop: this.loop
      }
    } = data)
    this.numEvents = this.events.length
    this.index = 0
    this.setIndex(this.songStartPosition)
    this.outputs = getMIDIOutputs()
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
    var i,
      event,
      numEvents,
      events,
      instrument

    this.maxtime = position + BUFFER_TIME
    events = this.getEvents()
    numEvents = events.length

    for(i = 0; i < numEvents; i++){
      event = events[i]
      instrument = this.instruments[event.instrumentId]

      if(typeof instrument === 'undefined'){
        continue
      }

      if(this.parts[event.partId].mute === true || this.tracks[event.trackId].mute === true || event.mute === true){
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

      let time = (this.timeStamp + event.millis - this.songStartPosition) + PRE_BUFFER

      if(event.type === 'audio'){
        // to be implemented
      }else if(instrument.type === 'external'){
        // to be implemented: route to external midi instrument
        let channel = 0
        for(let [id, port] of this.outputs){
          if(event.type === 128 || event.type === 144 || event.type === 176){
            //midiOutput.send([event.type, event.data1, event.data2], event.time + sequencer.midiOutLatency);
            port.send([event.type + channel, event.data1, event.data2], time)
          }else if(event.type === 192 || event.type === 224){
            port.send([event.type + channel, event.data1], time)
          }
        }

      }else{
        time /= 1000 // convert to seconds because the audio context uses seconds for scheduling
        instrument.processMIDIEvent(event, time, this.tracks[event.trackId].output)
      }
    }
    //console.log(this.index, this.numEvents)
    //return this.index >= 10
    return this.index >= this.numEvents // end of song
  }


  stopAllSounds(time){
    Object.keys(this.instruments).forEach((instrumentId) => {
      if(instrumentId !== 'undefined'){
        this.instruments[instrumentId].stopAllSounds()
      }
    })
    for(let [id, port] of this.outputs){
      port.send([0xB0, 0x7B, 0x00], time + 0.5); // stop all notes
      port.send([0xB0, 0x79, 0x00], time + 0.5); // reset all controllers
    }
  }

}

