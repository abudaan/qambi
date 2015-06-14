window.onload = function() {

  'use strict';

  var
    // satisfy jslint
    sequencer = window.sequencer,
    console = window.console,
    song,
    instrument,
    track1, track2,
    event1, event2,
    btnPlay = document.getElementById('play'),
    btnStop = document.getElementById('stop');


  sequencer.init().then(
    function onFulFilled(){
      init();
    },
    function onRejected(e){
      alert(e);
    }
  );

  function init(){

    sequencer.somethingVeryUseful('it sure is!');

    sequencer.util.ajax({url:'../../data/mozk545a.mid', responseType: 'arraybuffer'}).then(
      function onFulfilled(data){
        //song = sequencer.parseMIDIFile(data);
        song = sequencer.createSongFromMIDIFile(data);
        console.log(sequencer.volume, song.volume);
        initUI();
      },
      function onRejected(e){
        console.error(e);
      }
    );

  }

  function initUI(){
    btnPlay.addEventListener('click', function(){
      song.play();
    });

    btnStop.addEventListener('click', function(){
      song.stop();
    });
  }
};
