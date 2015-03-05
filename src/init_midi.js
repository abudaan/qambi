'use strict';


function initMidi(){

    return new Promise(function executor(resolve, reject){
        let iterator, data, port, name, doubleNames;

        //console.log(midiInitialized, navigator.requestMIDIAccess);

        if(midiInitialized === true){
            resolve();
            return;
        }

        midiInitialized = true;
        sequencer.midiInputs = [];
        sequencer.midiOutputs = [];

        if(navigator.requestMIDIAccess !== undefined){
            navigator.requestMIDIAccess().then(

                function onFulFilled(midi){
                    if(midi._jazzInstances !== undefined){
                        sequencer.jazz = midi._jazzInstances[0]._Jazz.version;
                        sequencer.midi = true;
                    }else{
                        sequencer.webmidi = true;
                        sequencer.midi = true;
                    }
                    iterator = midi.inputs.values();
                    doubleNames = {};

                    while((data = iterator.next()).done === false){
                        port = data.value;
                        name = port.name;
                        if(doubleNames[name] === undefined){
                            doubleNames[name] = [];
                        }
                        doubleNames[name].push(port);
                    }

                    objectForEach(doubleNames, function(obj, name){
                        let i, port, numPorts = obj.length;
                        //console.log(numPorts);
                        if(numPorts === 1){
                            port = obj[0];
                            port.label = name;
                            midiInputsOrder.push({label: port.label, id: port.id});
                            sequencer.midiInputs[port.id] = port;
                        }else{
                            for(i = 0; i < numPorts; i++){
                                port = obj[i];
                                port.label = name + ' port ' + i;//(i + 1);
                                //console.log(port.id, port.label, name);
                                midiInputsOrder.push({label: port.label, id: port.id});
                                sequencer.midiInputs[port.id] = port;
                            }
                        }
                    });


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

                    sequencer.numMidiInputs = midiInputsOrder.length;



                    iterator = midi.outputs.values();
                    doubleNames = {};

                    while((data = iterator.next()).done === false){
                        port = data.value;
                        name = port.name;
                        if(doubleNames[name] === undefined){
                            doubleNames[name] = [];
                        }
                        doubleNames[name].push(port);
                    }


                    objectForEach(doubleNames, function(obj, name){
                        let i, port, numPorts = obj.length;
                        //console.log(numPorts);
                        if(numPorts === 1){
                            port = obj[0];
                            port.label = name;
                            midiOutputsOrder.push({label: port.label, id: port.id});
                            sequencer.midiOutputs[port.id] = port;
                        }else{
                            for(i = 0; i < numPorts; i++){
                                port = obj[i];
                                port.label = name + ' port ' + i;//(i + 1);
                                //console.log(port.id, port.label, name);
                                midiOutputsOrder.push({label: port.label, id: port.id});
                                sequencer.midiOutputs[port.id] = port;
                            }
                        }
                    });


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

                    sequencer.numMidiOutputs = midiOutputsOrder.length;

                    //console.log(sequencer.midiInputs, sequencer.midiOutputs);
                    //console.log(midiInputsOrder, midiOutputsOrder);
                    //console.timeEnd('parse ports');
/*
                    // onconnect and ondisconnect are not yet implemented in Chrome and Chromium
                    midi.addEventListener('onconnect', function(e){
                        console.log('device connected', e);
                    }, false);

                    midi.addEventListener('ondisconnect', function(e){
                        console.log('device disconnected', e);
                    }, false);
*/
                    resolve();
                },


                function onReject(e){
                    reject('MIDI could not be initialized:', e);
                }
            );

        // browsers without WebMIDI API
        }else{
            if(sequencer.browser === 'chrome'){
                reject('Web MIDI API not enabled');
            }else{
                reject('Web MIDI API not supported');
            }
        }
    });
}


export default initMidi;