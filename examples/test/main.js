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

  song = sequencer.createSong();
  song.addSamples({48:'base64data'});

  track1 = sequencer.createTrack();
  track2 = sequencer.createTrack();

  // id of Track is now read only so this yields an error
  try{
    track2.id = 'another id';
  }catch(e){
    console.log(e);
  }
  console.log(track1.id, track2.id);


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
