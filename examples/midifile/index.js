import qambi, {
  MIDIEvent,
  Instrument,
} from '../../src/qambi'

import {
  songFromMIDIFile,
  songFromMIDIFileAsync,
} from '../../src/song_from_midifile'

import fetch from 'isomorphic-fetch'

document.addEventListener('DOMContentLoaded', function(){

  let song

  qambi.init()
  .then(() => {
    let test = 1

    if(test === 1){
      fetch('../../data/mozk545a.mid')
      .then(response => {
        return response.arrayBuffer()
      })
      .then(data => {
        song = songFromMIDIFile(data)
        initUI()
      })
    }
  })


  function initUI(){

    let btnPlay = document.getElementById('play')
    let btnStop = document.getElementById('stop')

    btnPlay.disabled = false
    btnStop.disabled = false

    btnPlay.addEventListener('click', function(){
      song.play();
    });

    btnStop.addEventListener('click', function(){
      song.stop();
    });
  }

})
