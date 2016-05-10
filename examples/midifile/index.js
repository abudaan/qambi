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

    let test = 2

    if(test === 1){
      fetch('../../data/mozk545a.mid')
      .then(response => {
        return response.arrayBuffer()
      })
      .then(data => {
        song = songFromMIDIFile(data)
        initUI()
      })
    }else if(test === 2){

      songFromMIDIFileAsync('../../data/minute_waltz.mid')
      .then(s => {
        song = s
        initUI()
      }, e => console.log(e))
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
