window.onload = function() {

  'use strict';

  var
    sequencer = window.sequencer,
    noteOn,
    noteOff,
    instrument,
    btnPlay = document.getElementById('play'),
    btnStop = document.getElementById('stop'),
    btnLoad = document.getElementById('load');


  sequencer.init().then(

    function onFulFilled(){

      sequencer.unlockWebAudio();

      instrument = sequencer.createInstrument();

      noteOn = sequencer.createMIDIEvent(0, 144, 60, 123);
      noteOff = sequencer.createMIDIEvent(500, 128, 60, 0);

      sequencer.createMIDINote(noteOn, noteOff);

      initUI();
    },

    function onRejected(e){
      window.alert(e);
    }
  );


  function initUI(){
    btnPlay.addEventListener('click', function(){
      instrument.processEvent(noteOn);
    });

    btnStop.addEventListener('click', function(){
      instrument.processEvent(noteOff);
    });

    btnLoad.addEventListener('click', function(){
      sequencer.util.parseSamples({
        'c4': '../../data/TP01d-ElectricPiano-000-060-c3.wav'
      }).then(
        function onFulfilled(buffers){
          //console.log(buffers);
          instrument.addSampleData(60, buffers.c4, {sustain: [0]});
        },
        function onRejected(e){
          window.alert(e);
        }
      );
    });
  }
};
