window.onload = function() {

  'use strict';

  var
    // satisfy jslint
    sequencer = window.sequencer,
    console = window.console,
    song,
    track1, track2,
    btnPlay = document.getElementById('play'),
    btnStop = document.getElementById('stop');


  console.log(sequencer);

  sequencer.init().then(

    function onFulFilled(){

      song = sequencer.createSong();

      track1 = sequencer.createTrack();
      track2 = sequencer.createTrack();

      song.addEventListener('stop', function(){
        console.log('song has stopped');
      });

      song.addEventListener('play', function(){
        console.log('song starts playing');
      });

      btnPlay.addEventListener('click', function(){
        song.play();
      });

      btnStop.addEventListener('click', function(){
        song.stop();
        song.removeEventListener('stop');
      });
    },

    function onRejected(e){
      alert(e);
    }
  );
};
