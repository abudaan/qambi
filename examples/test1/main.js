window.onload = function() {

  'use strict';

  var
    // satisfy jslint
    sequencer = window.sequencer,
    console = window.console,
    song,
    track1, track2,
    event1, event2,
    btnPlay = document.getElementById('play'),
    btnStop = document.getElementById('stop');


  sequencer.init().then(

    function onFulFilled(){

      sequencer.unlockWebAudio();
      var i = sequencer.createInstrument();
      i.addSampleData(60, 'audioBuffer', {sustain: [0]});

      var e = sequencer.createMIDIEvent(0, 144, 60, 123);
      e.midiNote = {id:'aap'};
      i.processEvent(e);
      i.processEvent(e);
    },

    function onRejected(e){
      alert(e);
    }
  );
};
