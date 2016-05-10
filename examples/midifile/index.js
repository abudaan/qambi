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
      song.play();
    });

    btnStop.addEventListener('click', function(){
      song.stop();
    });
  }

})
