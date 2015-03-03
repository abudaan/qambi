window.onload = function() {

  'use strict';

  var
    // satisfy jslint
    sequencer = window.sequencer,
    console = window.console,
    song,
    btnPlay = document.getElementById('play'),
    btnStop = document.getElementById('stop');


  console.log(sequencer);

  song = sequencer.createSong();
  song.addSamples({48:'base64data'});

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

};
