/*
  Requests MIDI access, queries all inputs and outputs and stores them in alphabetical order
*/

'use strict';

let data = {};
let inputs = [];
let outputs = [];
let inputById = [];
let outputById = [];
let numInputs = 0;
let numOutputs = 0;

function initMidi(){

  return new Promise(function executor(resolve, reject){

    let iterator, item, port;

    if(navigator.requestMIDIAccess !== undefined){

      navigator.requestMIDIAccess().then(

        function onFulFilled(midi){
          if(midi._jazzInstances !== undefined){
            data.jazz = midi._jazzInstances[0]._Jazz.version;
            data.midi = true;
          }else{
            data.webmidi = true;
            data.midi = true;
          }

          // old implementation of WebMIDI
          if(typeof midi.inputs.values !== 'function'){
            reject('You browser is using an old implementation of the WebMIDI API, please update your browser.');
            return;
          }


          // inputs

          iterator = midi.inputs.values();

          while((item = iterator.next()).done === false){
            port = item.value;
            inputs.push(port);
          }

          inputs.sort(function(a, b){
            let nameA = a.name.toLowerCase(),
              nameB = b.name.toLowerCase();
            if(nameA < nameB){ //sort string ascending
              return -1;
            }else if (nameA > nameB){
              return 1;
            }
            return 0; //default return value (no sorting)
          });

          numInputs = inputs.length;


          // outputs

          iterator = midi.outputs.values();

          while((item = iterator.next()).done === false){
            port = item.value;
            outputs.push(port);
          }

          outputs.sort(function(a, b){
            let nameA = a.name.toLowerCase(),
              nameB = b.name.toLowerCase();
            if(nameA < nameB){ //sort string ascending
              return -1;
            }else if (nameA > nameB){
              return 1;
            }
            return 0; //default return value (no sorting)
          });

          numOutputs = outputs.length;


          // onconnect and ondisconnect are not yet implemented in Chrome and Chromium
          midi.addEventListener('onconnect', function(e){
            console.log('device connected', e);
          }, false);

          midi.addEventListener('ondisconnect', function(e){
            console.log('device disconnected', e);
          }, false);


          // export
          data.inputs = inputs;
          data.outputs = outputs;
          data.numInputs = numInputs;
          data.numOutputs = numOutputs;

          resolve(data);
        },

        function onReject(e){
          //console.log(e);
          reject('Something went wrong while requesting MIDIAccess');
        }
      );
    // browsers without WebMIDI API
    }else{
      data.midi = false;
      resolve(data);
    }
  });
}



function initMidiSong(song){
  songMidiEventListener = function(e){
    //console.log(e);
    handleMidiMessageSong(e, song, this);
  };

  // by default a song listens to all available midi-in ports
  midiInputs.forEach(function(port){
    port.addEventListener('midimessage', songMidiEventListener);
    song.midiInputs[port.id] = port;
    //console.log(port);
  });
  //console.log(sequencer.midiInputs);

  midiOutputs.forEach(function(port){
    song.midiOutputs[port.id] = port;
  });

  song.numMidiInputs = numMidiInputs;
  song.numMidiOutputs = numMidiOutputs;
}



function setMidiInputSong(id, flag, song){
  var input = sequencer.midiInputs[id],
    tracks = song.tracks,
    maxi = song.numTracks - 1,
    i, track;

  flag = flag === undefined ? true : flag;

  if(input === undefined){
    if(sequencer.debug === true){
      console.log('no midi input with id', id,'found');
    }
    return;
  }

  if(flag === false){
    delete song.midiInputs[id];
    input.removeEventListener('midimessage', songMidiEventListener);
    song.numMidiInputs--;
  }else if(input !== undefined){
    song.midiInputs[id] = input;
    input.addEventListener('midimessage', songMidiEventListener);
    song.numMidiInputs++;
  }

  for(i = maxi; i >= 0; i--){
    track = tracks[i];
    track.setMidiInput(id, flag);
    // if(flag === false){
    //     delete track.midiInputs[id];
    // }
  }
}

function setMidiOutputSong(id, flag, song){
  var output = sequencer.midiOutputs[id],
    tracks = song.tracks,
    maxi = song.numTracks - 1,
    i, track, time;

  flag = flag === undefined ? true : flag;

  if(output === undefined){
    if(sequencer.debug === true){
      console.log('no midi output with id', id,'found');
    }
    return;
  }

  if(flag === false){
    delete song.midiOutputs[id];
    song.numMidiOutputs--;
    time = song.scheduler.lastEventTime + 100;
    output.send([0xB0, 0x7B, 0x00], time); // stop all notes
    output.send([0xB0, 0x79, 0x00], time); // reset all controllers
  }else if(output !== undefined){
    song.midiOutputs[id] = output;
    song.numMidiOutputs++;
  }

  for(i = maxi; i >= 0; i--){
    track = tracks[i];
    track.setMidiOutput(id, flag);
    // if(flag === false){
    //     delete track.midiOutputs[id];
    // }
  }
}

function handleMidiMessageSong(midiMessageEvent, song, input){
  var data = midiMessageEvent.data,
    i, track,
    tracks = song.tracks,
    numTracks = song.numTracks,
    midiEvent,
    listeners;

  //console.log(midiMessageEvent.data);
  midiEvent = createMidiEvent(song.ticks, data[0], data[1], data[2]);

  for(i = 0; i < numTracks; i++){
    track = tracks[i];
    //console.log(track.midiInputs, input);
    /*
    if(midiEvent.channel === track.channel || track.channel === 0 || track.channel === 'any'){
      handleMidiMessageTrack(midiEvent, track);
    }
    */
    // like in Cubase, midi events from all devices, sent on any midi channel are forwarded to all tracks
    // set track.monitor to false if you don't want to receive midi events on a certain track
    // note that track.monitor is by default set to false and that track.monitor is automatically set to true
    // if you are recording on that track
    //console.log(track.monitor, track.id, input.id);
    if(track.monitor === true && track.midiInputs[input.id] !== undefined){
      handleMidiMessageTrack(midiEvent, track, input);
    }
  }

  listeners = song.midiEventListeners[midiEvent.type];
  if(listeners === undefined){
    return;
  }

  objectForEach(listeners, function(listener){
    listener(midiEvent, input);
  });
}


//function handleMidiMessageTrack(midiMessageEvent, track, input){
function handleMidiMessageTrack(midiEvent, track, input){
  var song = track.song,
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


function addMidiEventListener(args, obj){ // obj can be a track or a song
  args = slice.call(args);

  var id = midiEventListenerId++,
    types = {},
    ids = [],
    listener,
    loop;


  // should I inline this?
  loop = function(args, i, maxi){
    for(i = 0; i < maxi; i++){
      var arg = args[i],
        type = typeString(arg);
      //console.log(type);
      if(type === 'array'){
        loop(arg, 0, arg.length);
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



export default initMidi;