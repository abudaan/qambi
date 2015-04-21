window.onload = function() {

  'use strict';

  var
    sequencer = window.sequencer,
    song,
    btnPlay = document.getElementById('play'),
    btnStop = document.getElementById('stop');


  sequencer.init().then(

    function onFulFilled(){

      song = sequencer.createSong()
        .addTrack(sequencer.createTrack() // song.addTrack() returns song
          .addPart(sequencer.createPart() // track.addPart() returns track
            .addEvents([                  // part.addEvents() returns part
              sequencer.createMIDIEvent(0, 144, 60, 123),
              sequencer.createMIDIEvent(400, 128, 60, 0)
            ])
          )
        ).update(); // song.update() returns song

      initUI();
      //debugger;
    },

    function onRejected(e){
      window.alert(e);
    }
  );

  function initUI(){
    btnPlay.addEventListener('click', function(){
      song.play();
    });

    btnStop.addEventListener('click', function(){
      song.stop();
    });
  }
};
