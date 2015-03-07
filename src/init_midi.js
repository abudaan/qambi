/*
  Requests MIDI access, queries all inputs and outputs and stores them in alphabetical order
*/

'use strict';

let data = {};
let inputs = [];
let outputs = [];
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


export default initMidi;