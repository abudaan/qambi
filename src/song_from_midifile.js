import fetch from 'isomorphic-fetch'
import {parseMIDIFile} from './midifile'
import {MIDIEvent} from './midi_event'
import {Part} from './part'
import {Track} from './track'
import {Song} from './song'
import {base64ToBinary} from './util'
import {status, json, arrayBuffer} from './fetch_helpers'

const PPQ = 960


function toSong(parsed){
  let tracks = parsed.tracks
  let ppq = parsed.header.ticksPerBeat
  let ppqFactor = PPQ / ppq //@TODO: get ppq from config -> only necessary if you want to change the ppq of the MIDI file !
  let timeEvents = []
  let bpm = -1
  let nominator = -1
  let denominator = -1
  let newTracks = []

  for(let track of tracks.values()){
    let lastTicks, lastType
    let ticks = 0
    let type
    let channel = -1
    let trackName
    let trackInstrumentName
    let events = [];

    for(let event of track){
      ticks += (event.deltaTime * ppqFactor);

      if(channel === -1 && typeof event.channel !== 'undefined'){
        channel = event.channel;
      }
      type = event.subtype;
      //console.log(event.deltaTime, ticks, type);

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
          events.push(new MIDIEvent(ticks, 0x90, event.noteNumber, event.velocity))
          break;

        case 'noteOff':
          events.push(new MIDIEvent(ticks, 0x80, event.noteNumber, event.velocity))
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
          timeEvents.push(new MIDIEvent(ticks, 0x51, tmp))
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
          timeEvents.push(new MIDIEvent(ticks, 0x58, event.numerator, event.denominator))
          break;


        case 'controller':
          events.push(new MIDIEvent(ticks, 0xB0, event.controllerType, event.value));
          break;

        case 'programChange':
          events.push(new MIDIEvent(ticks, 0xC0, event.programNumber));
          break;

        case 'pitchBend':
          events.push(new MIDIEvent(ticks, 0xE0, event.value));
          break;

        default:
          //console.log(track.name, event.type);
      }

      lastType = type
      lastTicks = ticks
    }

    if(events.length > 0){
      //console.count(events.length)
      let newTrack = new Track(trackName)
      let part = new Part()
      newTrack.addParts(part)
      part.addEvents(...events)
      newTracks.push(newTrack)
    }
  }

  let song = new Song({
    ppq: PPQ,
    playbackSpeed: 1,
    //ppq,
    bpm,
    nominator,
    denominator
  })
  song.addTracks(...newTracks)
  song.addTimeEvents(...timeEvents)
  song.update()
  return song
}

export function songFromMIDIFileSync(data, settings = {}){
  let song = null;

  if(data instanceof ArrayBuffer === true){
    let buffer = new Uint8Array(data);
    song = toSong(parseMIDIFile(buffer));
  }else if(typeof data.header !== 'undefined' && typeof data.tracks !== 'undefined'){
    song = toSong(data);
  }else{
    data = base64ToBinary(data);
    if(data instanceof ArrayBuffer === true){
      let buffer = new Uint8Array(data);
      song = toSong(parseMIDIFile(buffer));
    }else{
      console.error('wrong data');
    }
  }

  return song
  // {
  //   ppq = newPPQ,
  //   bpm = newBPM,
  //   playbackSpeed = newPlaybackSpeed,
  // } = settings
}


export function songFromMIDIFile(url){
  return new Promise((resolve, reject) => {
    // fetch(url, {
    //   mode: 'no-cors'
    // })
    fetch(url)
    .then(status)
    .then(arrayBuffer)
    .then(data => {
      resolve(songFromMIDIFileSync(data))
    })
    .catch(e => {
      reject(e)
    })
  })
}
