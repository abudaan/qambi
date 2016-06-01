/*
  Requests MIDI access, queries all inputs and outputs and stores them in alphabetical order
*/

import {typeString} from './util'
import 'webmidiapishim' // you can also embed the shim as a stand-alone script in the html, then you can comment this line out


let MIDIAccess
let initialized = false
let inputs = []
let outputs = []
let inputIds = []
let outputIds = []
let inputsById = new Map()
let outputsById = new Map()

let songMidiEventListener
let midiEventListenerId = 0


function getMIDIports(){
  inputs = Array.from(MIDIAccess.inputs.values())

  //sort ports by name ascending
  inputs.sort((a, b) => a.name.toLowerCase() <= b.name.toLowerCase() ? 1 : -1)

  for(let port of inputs){
    inputsById.set(port.id, port)
    inputIds.push(port.id)
  }

  outputs = Array.from(MIDIAccess.outputs.values())

  //sort ports by name ascending
  outputs.sort((a, b) => a.name.toLowerCase() <= b.name.toLowerCase() ? 1 : -1)

  //console.log(outputs)
  for(let port of outputs){
    //console.log(port.id, port.name)
    outputsById.set(port.id, port)
    outputIds.push(port.id)
  }
  //console.log(outputsById)
}


export function initMIDI(){

  return new Promise(function executor(resolve, reject){

    if(typeof navigator === 'undefined'){
      initialized = true
      resolve({midi: false})
    }else if(typeof navigator.requestMIDIAccess !== 'undefined'){

      let jazz, midi, webmidi

      navigator.requestMIDIAccess().then(

        function onFulFilled(midiAccess){
          MIDIAccess = midiAccess
          if(typeof midiAccess._jazzInstances !== 'undefined'){
            jazz = midiAccess._jazzInstances[0]._Jazz.version
            midi = true
          }else{
            webmidi = true
            midi = true
          }

          getMIDIports()

          // onconnect and ondisconnect are not yet implemented in Chrome and Chromium
          midiAccess.onconnect = function(e){
            console.log('device connected', e)
            getMIDIports()
          }

          midiAccess.ondisconnect = function(e){
            console.log('device disconnected', e)
            getMIDIports()
          }

          initialized = true
          resolve({
            jazz,
            midi,
            webmidi,
            inputs,
            outputs,
            inputsById,
            outputsById,
          })
        },

        function onReject(e){
          //console.log(e)
          reject('Something went wrong while requesting MIDIAccess', e)
        }
      )
    // browsers without WebMIDI API
    }else{
      initialized = true
      resolve({midi: false})
    }
  })
}


export let getMIDIAccess = function(){
  if(initialized === false){
    console.warn('please call qambi.init() first')
  }else {
    getMIDIAccess = function(){
      return MIDIAccess
    }
    return getMIDIAccess()
  }
  return false
}


export let getMIDIOutputs = function(){
  if(initialized === false){
    console.warn('please call qambi.init() first')
  }else {
    getMIDIOutputs = function(){
      return outputs
    }
    return getMIDIOutputs()
  }
  return false
}


export let getMIDIInputs = function(){
  if(initialized === false){
    console.warn('please call qambi.init() first')
  }else {
    getMIDIInputs = function(){
      return inputs
    }
    return getMIDIInputs()
  }
  return false
}

export let getMIDIOutputIds = function(){
  if(initialized === false){
    console.warn('please call qambi.init() first')
  }else {
    getMIDIOutputIds = function(){
      return outputIds
    }
    return getMIDIOutputIds()
  }
  return false
}


export let getMIDIInputIds = function(){
  if(initialized === false){
    console.warn('please call qambi.init() first')
  }else {
    getMIDIInputIds = function(){
      return inputIds
    }
    return getMIDIInputIds()
  }
  return false
}


export let getMIDIOutputById = function(id: string){
  if(initialized === false){
    console.warn('please call qambi.init() first')
  }else {
    getMIDIOutputById = function(_id){
      return outputsById.get(_id)
    }
    return getMIDIOutputById(id)
  }
  return false
}


export let getMIDIInputById = function(id: string){
  if(initialized === false){
    console.warn('please call qambi.init() first')
  }else {
    getMIDIInputById = function(_id){
      return inputsById.get(_id)
    }
    return getMIDIInputById(id)
  }
  return false
}


/*
export function initMidiSong(song){

  songMidiEventListener = function(e){
    //console.log(e)
    handleMidiMessageSong(song, e, this);
  };

  // by default a song listens to all available midi-in ports
  inputs.forEach(function(port){
    port.addEventListener('midimessage', songMidiEventListener);
    song.midiInputs.set(port.id, port);
  });

  outputs.forEach(function(port){
    song.midiOutputs.set(port.id, port);
  });
}


export function setMidiInputSong(song, id, flag){
  let input = inputs.get(id);

  if(input === undefined){
    warn('no midi input with id', id, 'found');
    return;
  }

  if(flag === false){
    song.midiInputs.delete(id);
    input.removeEventListener('midimessage', songMidiEventListener);
  }else{
    song.midiInputs.set(id, input);
    input.addEventListener('midimessage', songMidiEventListener);
  }

  let tracks = song.tracks;
  for(let track of tracks){
    track.setMidiInput(id, flag);
  }
}


export function setMidiOutputSong(song, id, flag){
  let output = outputs.get(id);

  if(output === undefined){
    warn('no midi output with id', id, 'found');
    return;
  }

  if(flag === false){
    song.midiOutputs.delete(id);
    let time = song.scheduler.lastEventTime + 100;
    output.send([0xB0, 0x7B, 0x00], time); // stop all notes
    output.send([0xB0, 0x79, 0x00], time); // reset all controllers
  }else{
    song.midiOutputs.set(id, output);
  }

  let tracks = song.tracks;
  for(let track of tracks){
    track.setMidiOutput(id, flag);
  }
}


function handleMidiMessageSong(song, midiMessageEvent, input){
  let midiEvent = new MidiEvent(song.ticks, ...midiMessageEvent.data);

  //console.log(midiMessageEvent.data);

  let tracks = song.tracks;
  for(let track of tracks){
    //console.log(track.midiInputs, input);


    //if(midiEvent.channel === track.channel || track.channel === 0 || track.channel === 'any'){
    //  handleMidiMessageTrack(midiEvent, track);
    //}


    // like in Cubase, midi events from all devices, sent on any midi channel are forwarded to all tracks
    // set track.monitor to false if you don't want to receive midi events on a certain track
    // note that track.monitor is by default set to false and that track.monitor is automatically set to true
    // if you are recording on that track
    //console.log(track.monitor, track.id, input.id);
    if(track.monitor === true && track.midiInputs.get(input.id) !== undefined){
      handleMidiMessageTrack(midiEvent, track, input);
    }
  }

  let listeners = song.midiEventListeners.get(midiEvent.type);
  if(listeners !== undefined){
    for(let listener of listeners){
      listener(midiEvent, input);
    }
  }
}


function handleMidiMessageTrack(track, midiEvent, input){
  let song = track.song,
    note, listeners, channel;
    //data = midiMessageEvent.data,
    //midiEvent = createMidiEvent(song.ticks, data[0], data[1], data[2]);

  //midiEvent.source = midiMessageEvent.srcElement.name;
  //console.log(midiMessageEvent)
  //console.log('---->', midiEvent.type);

  // add the exact time of this event so we can calculate its ticks position
  midiEvent.recordMillis = context.currentTime * 1000; // millis
  midiEvent.state = 'recorded';

  if(midiEvent.type === 144){
    note = createMidiNote(midiEvent);
    track.recordingNotes[midiEvent.data1] = note;
    //track.song.recordingNotes[note.id] = note;
  }else if(midiEvent.type === 128){
    note = track.recordingNotes[midiEvent.data1];
    // check if the note exists: if the user plays notes on her keyboard before the midi system has
    // been fully initialized, it can happen that the first incoming midi event is a NOTE OFF event
    if(note === undefined){
      return;
    }
    note.addNoteOff(midiEvent);
    delete track.recordingNotes[midiEvent.data1];
    //delete track.song.recordingNotes[note.id];
  }

  //console.log(song.preroll, song.recording, track.recordEnabled);

  if((song.prerolling || song.recording) && track.recordEnabled === 'midi'){
    if(midiEvent.type === 144){
      track.song.recordedNotes.push(note);
    }
    track.recordPart.addEvent(midiEvent);
    // song.recordedEvents is used in the key editor
    track.song.recordedEvents.push(midiEvent);
  }else if(track.enableRetrospectiveRecording){
    track.retrospectiveRecording.push(midiEvent);
  }

  // call all midi event listeners
  listeners = track.midiEventListeners[midiEvent.type];
  if(listeners !== undefined){
    objectForEach(listeners, function(listener){
      listener(midiEvent, input);
    });
  }

  channel = track.channel;
  if(channel === 'any' || channel === undefined || isNaN(channel) === true){
    channel = 0;
  }

  objectForEach(track.midiOutputs, function(output){
    //console.log('midi out', output, midiEvent.type);
    if(midiEvent.type === 128 || midiEvent.type === 144 || midiEvent.type === 176){
      //console.log(midiEvent.type, midiEvent.data1, midiEvent.data2);
      output.send([midiEvent.type, midiEvent.data1, midiEvent.data2]);
    // }else if(midiEvent.type === 192){
    //     output.send([midiEvent.type + channel, midiEvent.data1]);
    }
    //output.send([midiEvent.status + channel, midiEvent.data1, midiEvent.data2]);
  });

  // @TODO: maybe a track should be able to send its event to both a midi-out port and an internal heartbeat song?
  //console.log(track.routeToMidiOut);
  if(track.routeToMidiOut === false){
    midiEvent.track = track;
    track.instrument.processEvent(midiEvent);
  }
}


function addMidiEventListener(...args){ // caller can be a track or a song

  let id = midiEventListenerId++;
  let listener;
    types = {},
    ids = [],
    loop;


  // should I inline this?
  loop = function(args){
    for(let arg of args){
      let type = typeString(arg);
      //console.log(type);
      if(type === 'array'){
        loop(arg);
      }else if(type === 'function'){
        listener = arg;
      }else if(isNaN(arg) === false){
        arg = parseInt(arg, 10);
        if(sequencer.checkEventType(arg) !== false){
          types[arg] = arg;
        }
      }else if(type === 'string'){
        if(sequencer.checkEventType(arg) !== false){
          arg = sequencer.midiEventNumberByName(arg);
          types[arg] = arg;
        }
      }
    }
  };

  loop(args, 0, args.length);
  //console.log('types', types, 'listener', listener);

  objectForEach(types, function(type){
    //console.log(type);
    if(obj.midiEventListeners[type] === undefined){
      obj.midiEventListeners[type] = {};
    }
    obj.midiEventListeners[type][id] = listener;
    ids.push(type + '_' + id);
  });

  //console.log(obj.midiEventListeners);
  return ids.length === 1 ? ids[0] : ids;
}


function removeMidiEventListener(id, obj){
  var type;
  id = id.split('_');
  type = id[0];
  id = id[1];
  delete obj.midiEventListeners[type][id];
}


function removeMidiEventListeners(){

}

*/
