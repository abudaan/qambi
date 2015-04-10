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
      sequencer.util.ajax({url:'../../data/mozk545a.mid', responseType: 'arraybuffer'}).then(
        function onFulfilled(data){
          song = sequencer.createSongFromMIDIFile(data);
          song.update();
          console.log(song);
        },
        function onRejected(e){
          console.error(e);
        }
      );

    },

    function onRejected(e){
      alert(e);
    }
  );
};
