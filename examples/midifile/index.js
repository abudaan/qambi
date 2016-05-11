import qambi, {
  Song,
} from '../../src/qambi'


import fetch from 'isomorphic-fetch'

document.addEventListener('DOMContentLoaded', function(){

  let song

  qambi.init()
  .then(() => {

    let test = 2

    if(test === 1){

      //console.time('song')
      fetch('../../data/mozk545a.mid')
      .then(response => {
        return response.arrayBuffer()
      })
      .then(data => {
        song = Song.fromMIDIFile(data)
        initUI()
        //console.timeEnd('song')
      })

    }else if(test === 2){

      //console.time('song')
      Song.fromMIDIFileAsync('../../data/minute_waltz.mid')
      .then(s => {
        song = s
        //console.timeEnd('song')
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
      song.playFrom('barsbeats', 4, 1, 1, 0)
      //song.playFrom('time', 0, 0, 15) // play from 15 seconds
      //song.playFrom('millis', 34000) // play from 34 seconds
      //song.play()
    });

    btnStop.addEventListener('click', function(){
      song.stop();
    });
  }

})
