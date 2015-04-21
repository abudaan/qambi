window.onload = function() {

  'use strict';

  var
    sequencer = window.sequencer;


  sequencer.init().then(

    function onFulFilled(){

      sequencer.unlockWebAudio();

      var instrument = sequencer.createInstrument();
      instrument.addSampleData(60, 'audioBuffer', {sustain: [0]});

      var event = sequencer.createMIDIEvent(0, 144, 60, 123);
      instrument.processEvent(event);
    },

    function onRejected(e){
      alert(e);
    }
  );
};
