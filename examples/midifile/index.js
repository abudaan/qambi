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
    let btnPause = document.getElementById('pause')
    let btnStop = document.getElementById('stop')
    let divPosition = document.getElementById('position')
    let divPositionTime = document.getElementById('position_time')

    btnPlay.disabled = false
    btnPause.disabled = false
    btnStop.disabled = false

    btnPlay.addEventListener('click', function(){
      //song.play('barsbeats', 4, 1, 1, 0)
      //song.play('time', 0, 0, 15) // play from 15 seconds
      //song.play('millis', 34000) // play from 34 seconds
      song.play()
    });

    btnPause.addEventListener('click', function(){
      song.pause()
    })

    btnStop.addEventListener('click', function(){
      song.stop()
    })

    song.addEventListener('noteOn', event => {
      let note = event.data
      //console.log('noteOn', note.id, note.noteOn.id, note.noteOn.data1, note.noteOn.ticks)
    })

    song.addEventListener('noteOff', event => {
      let note = event.data
      //console.log('noteOff', note.id, note.noteOff.id, note.noteOff.data1, note.noteOff.ticks)
    })

    song.addEventListener('play', event => {
      console.log('started playing at position:', event.data)
    })

    song.addEventListener('stop', () => {
      console.log('stop')
    })

    song.addEventListener('pause', event => {
      console.log('paused:', event.data)
    })

    let position = song.getPosition()
    divPosition.innerHTML = position.barsAsString
    divPositionTime.innerHTML = position.timeAsString

    song.addEventListener('position', event => {
      divPosition.innerHTML = event.data.barsAsString
      divPositionTime.innerHTML = event.data.timeAsString
    })
  }

})
