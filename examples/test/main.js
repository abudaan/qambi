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

  console.log(sequencer);
  //console.log(sequencer.createNote(0, 'aap'));
  //console.log(sequencer.createNote('P'));
  //console.log(sequencer.createNote('C', 4));
  //console.log(sequencer.getNoteNumber('C#4'));
  //console.log(sequencer.getNoteNumber('Bbb4'));
  //console.log(sequencer.getNoteNumber('F4'));
  //console.log(sequencer.getNoteNumber('A-1'));

  sequencer.init().then(

    function onFulFilled(){

      sequencer.unlockWebAudio();
      sequencer.unlockWebAudio();

      // song = sequencer.createSong({
      //   name: 'apenliedje',
      //   ppq: 480
      // });

      song = sequencer.createSong(new Map().set('name', 'apenliedje').set('ppq', 480));
      //console.log(song);

      track1 = sequencer.createTrack();
      track2 = sequencer.createTrack();
      //console.log(track1);

      event1 = sequencer.createMidiEvent(0, sequencer.NOTE_ON, 60, 100);
      //console.log(event1);
      event1 = sequencer.createMidiEvent([0, sequencer.NOTE_ON, 72, 100]);
      //event1.move(100);
      //console.log(event1);
      event2 = event1.clone();
      //console.log(event2);

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
