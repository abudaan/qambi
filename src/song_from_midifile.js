
import fetch from 'isomorphic-fetch'
import parseMIDIFile from './midifile'
import {createMIDIEvent, getMIDIEventId} from './midi_event'
import {createPart, addMIDIEvents} from './part'
import {createTrack, addParts} from './track'
import {createSong, addTracks, updateSong} from './song'

export function songFromMIDIFile(data){

  if(data instanceof ArrayBuffer === true){
    let buffer = new Uint8Array(data);
    return toSong(parseMIDIFile(buffer));
  }else if(typeof data.header !== 'undefined' && typeof data.tracks !== 'undefined'){
    return toSong(data);
  // }else{
  //   data = base64ToBinary(data);
  //   if(data instanceof ArrayBuffer === true){
  //     let buffer = new Uint8Array(data);
  //     return toSong(parseMIDIFile(buffer));
  //   }else{
  //     error('wrong data');
  //   }
  }
}


function toSong(parsed){
  let tracks = parsed.tracks
  let ppq = parsed.header.ticksPerBeat
  let ppqFactor = 960 / ppq //@TODO: get ppq from config
  let timeEvents = []
  let eventIds
  let bpm = -1
  let nominator = -1
  let denominator = -1
  let trackIds = []
  let songId


  for(let track of tracks.values()){
    let lastTicks, lastType
    let ticks = 0
    let type
    let channel = -1
    let trackName
    let trackInstrumentName
    eventIds = [];

    for(let event of track){
      ticks += (event.deltaTime * ppqFactor);
      //console.log(event.deltaTime, ticks, ppq);

      if(channel === -1 && typeof event.channel !== 'undefined'){
        channel = event.channel;
      }
      type = event.subtype;

      switch(event.subtype){

        case 'trackName':
          trackName = event.text;
          break;

        case 'instrumentName':
          if(event.text){
            trackInstrumentName = event.text;
          }
          break;

        case 'noteOn':
          eventIds.push(createMIDIEvent(ticks, 0x90, event.noteNumber, event.velocity));
          break;

        case 'noteOff':
          eventIds.push(createMIDIEvent(ticks, 0x80, event.noteNumber, event.velocity));
          break;

        case 'setTempo':
          // sometimes 2 tempo events have the same position in ticks
          // we use the last in these cases (same as Cubase)
          let tmp = 60000000 / event.microsecondsPerBeat;

          if(ticks === lastTicks && type === lastType){
            //console.info('tempo events on the same tick', ticks, tmp);
            timeEvents.pop();
          }

          if(bpm === -1){
            bpm = tmp;
          }
          timeEvents.push({id: getMIDIEventId(), ticks, type: 0x51, data1: bpm});
          break;

        case 'timeSignature':
          // sometimes 2 time signature events have the same position in ticks
          // we use the last in these cases (same as Cubase)
          if(lastTicks === ticks && lastType === type){
            console.info('time signature events on the same tick', ticks, event.numerator, event.denominator);
            timeEvents.pop();
          }

          if(nominator === -1){
            nominator = event.numerator
            denominator = event.denominator
          }
          timeEvents.push({id: getMIDIEventId(), ticks, type: 0x58, data1: event.numerator, data2: event.denominator});
          break;


        case 'controller':
          eventIds.push(createMIDIEvent(ticks, 0xB0, event.controllerType, event.value));
          break;

        case 'programChange':
          eventIds.push(createMIDIEvent(ticks, 0xC0, event.programNumber));
          break;

        case 'pitchBend':
          eventIds.push(createMIDIEvent(ticks, 0xE0, event.value));
          break;

        default:
          //console.log(track.name, event.type);
      }

      lastType = type
      lastTicks = ticks
    }

    if(eventIds.length > 0){
      let trackId = createTrack({name: trackName})
      //let partId = createPart({trackId, midiEventIds: eventIds})
      let partId = createPart({trackId})
      addMIDIEvents(partId, ...eventIds)
      addParts(trackId, partId)
      //addTracks(songId, trackId)
      trackIds.push(trackId)
    }
  }

  songId = createSong({
    ppq,
    bpm,
    nominator,
    denominator,
    timeEvents,
  })
  addTracks(songId, ...trackIds)
  updateSong(songId)
  return songId
}
