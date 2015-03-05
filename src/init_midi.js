'use strict';

function initMidi(){

  return new Promise(function executor(resolve, reject){

    let iterator, item, doubleNames;
    let name, port;
    let midiInputsOrder = [];
    let midiOutputsOrder = [];
    let data = {
      midiInputs: {},
      midiOutputs: {}
    };

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
          if(typeof midi.inputs.values !== 'function'){
            reject('Please update your browser for MIDI support');
            return;
          }
          iterator = midi.inputs.values();
          doubleNames = {};

          while((item = iterator.next()).done === false){
            port = item.value;
            name = port.name;
            if(doubleNames[name] === undefined){
              doubleNames[name] = [];
            }
            doubleNames[name].push(port);
          }

          for(name of Reflect.ownKeys(doubleNames)){
            let obj = doubleNames[name];
            let i, port, numPorts = obj.length;
            //console.log(numPorts);
            if(numPorts === 1){
              port = obj[0];
              port.label = name;
              midiInputsOrder.push({label: port.label, id: port.id});
              data.midiInputs[port.id] = port;
            }else{
              for(i = 0; i < numPorts; i++){
                port = obj[i];
                port.label = name + ' port ' + i;//(i + 1);
                //console.log(port.id, port.label, name);
                midiInputsOrder.push({label: port.label, id: port.id});
                data.midiInputs[port.id] = port;
              }
            }
          }


          midiInputsOrder.sort(function(a, b){
            let nameA = a.label.toLowerCase(),
              nameB = b.label.toLowerCase();
            if(nameA < nameB){ //sort string ascending
              return -1;
            }else if (nameA > nameB){
              return 1;
            }
            return 0; //default return value (no sorting)
          });

          data.numMidiInputs = midiInputsOrder.length;



          iterator = midi.outputs.values();
          doubleNames = {};

          while((item = iterator.next()).done === false){
            port = item.value;
            name = port.name;
            if(doubleNames[name] === undefined){
              doubleNames[name] = [];
            }
            doubleNames[name].push(port);
          }


          for(name of Reflect.ownKeys(doubleNames)){
            let obj = doubleNames[name];
            let i, port, numPorts = obj.length;
            //console.log(numPorts);
            if(numPorts === 1){
              port = obj[0];
              port.label = name;
              midiOutputsOrder.push({label: port.label, id: port.id});
              data.midiOutputs[port.id] = port;
            }else{
              for(i = 0; i < numPorts; i++){
                port = obj[i];
                port.label = name + ' port ' + i;//(i + 1);
                //console.log(port.id, port.label, name);
                midiOutputsOrder.push({label: port.label, id: port.id});
                data.midiOutputs[port.id] = port;
              }
            }
          }


          midiOutputsOrder.sort(function(a, b){
            let nameA = a.label.toLowerCase(),
              nameB = b.label.toLowerCase();
            if(nameA < nameB){ //sort string ascending
              return -1;
            }else if (nameA > nameB){
              return 1;
            }
            return 0; //default return value (no sorting)
          });

          data.numMidiOutputs = midiOutputsOrder.length;

          // onconnect and ondisconnect are not yet implemented in Chrome and Chromium
          midi.addEventListener('onconnect', function(e){
            console.log('device connected', e);
          }, false);

          midi.addEventListener('ondisconnect', function(e){
            console.log('device disconnected', e);
          }, false);

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