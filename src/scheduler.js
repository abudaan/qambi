
const BUFFER_TIME = 350 // millis

export default class Scheduler{

  constructor(songData, timeStamp, startPosition){
    ({
      songId: this.songId,
      midiEvents: this.events,
      instruments: this.instrument,
      settings: {
        bars: this.bars,
        loop: this.loop
      }
    } = songData)
    this.numEvents = this.events.length
    this.songStartPosition = startPosition
    this.timeStamp = timeStamp
    this.index = 0
    this.setIndex(songData.position)
    debugger
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
      event = this.events[i];
      if(event.millis < this.maxtime){

        event.time = this.timeStamp + event.millis - this.songStartPosition;

        if(event.type === 144 || event.type === 128){
/*
          if(event.midiNote !== undefined && event.midiNote.endless === false){
            if(event.type === 144){
              //this.notes[event.midiNote.id] = event.midiNote;
              this.notes[event.id] = event.id;
            }else if(event.type === 128){
              delete this.notes[event.midiNote.id];
            }
            events.push(event);
          }
*/
          events.push(event);
        }else if(event.type === 'audio'){
          // to be implemented
        }else{
          // controller events
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
      track,
      channel;

    this.maxtime = position + BUFFER_TIME
    events = this.getEvents()
    numEvents = events.length

    for(i = 0; i < numEvents; i++){
      event = events[i]
      track = event.track
      console.log(position, event)
      /*

      if(event.type === 'audio'){
        // to be implemented
      }else{
        if(track.routeToMidiOut === false){
          // if(event.type === 144){
          //     console.log(event.time/1000, sequencer.getTime(), event.time/1000 - sequencer.getTime());
          // }
          event.time /= 1000;
          //console.log('scheduled', event.type, event.time, event.midiNote.id);
          //console.log(track.instrument.processEvent);
          track._instrument.processEvent(event);
        }else{
          channel = track.channel;
          if(channel === 'any' || channel === undefined || isNaN(channel) === true){
            channel = 0;
          }
          for(let key in Object.keys(track.midiOutputs)){
            let midiOutput = track.midiOutputs[key];
            if(event.type === 128 || event.type === 144 || event.type === 176){
              //midiOutput.send([event.type, event.data1, event.data2], event.time + sequencer.midiOutLatency);
              midiOutput.send([event.type + channel, event.data1, event.data2], event.time);
            }else if(event.type === 192 || event.type === 224){
              midiOutput.send([event.type + channel, event.data1], event.time);
            }
          }
          // needed for Song.resetExternalMidiDevices()
          this.lastEventTime = event.time;
        }
      }
      */
    }

    return this.index >= this.numEvents // end of song
  }
}