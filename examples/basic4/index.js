import qambi from '../../src/qambi'

document.addEventListener('DOMContentLoaded', function(){

  console.time('loading and parsing assets took')

  qambi.init({
    song: {
      type: 'Song',
      url: '../data/minute_waltz.mid'
    },
    piano: {
      type: 'Instrument',
      url: 'https://raw.githubusercontent.com/abudaan/qambi-instruments/master/heartbeat/city-piano.json',
      //url: 'http://qambi.org/instruments/heartbeat/city-piano.json',
      //url: 'http://qambi.org/instruments/fluidsynth/drawbar_organ.json',
      //url: 'http://qambi.org/instruments/fluidsynth/dulcimer.json',
      //baseUrl: '../../samples/city-piano/'
    }
  })
  .then((data) => {

    let {song, piano} = data

    song.getTracks().forEach(track => {
      track.setInstrument(piano)
    })

    // turn off metronome
    song.setMetronome(false)

    initUI(song)

  })


  function initUI(song){
    console.timeEnd('loading and parsing assets took')

    let btnPlay = document.getElementById('play')
    let btnPause = document.getElementById('pause')
    let btnStop = document.getElementById('stop')

    btnPlay.disabled = false
    btnPause.disabled = false
    btnStop.disabled = false

    btnPlay.addEventListener('click', function(){
      song.play()
    })

    btnPause.addEventListener('click', function(){
      song.pause()
    })

    btnStop.addEventListener('click', function(){
      song.stop()
    })
  }
})
