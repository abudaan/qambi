import qambi from '../../src/qambi'

document.addEventListener('DOMContentLoaded', function(){

  console.time('loading and parsing assets took')

  qambi.init({
    song: {
      type: 'Song',
      url: '../data/mozk545a.mid'
    },
    piano: {
      type: 'Instrument',
      url: 'http://abumarkub.net/qambi/instruments/city-piano.json',
      //url: 'http://abumarkub.net/qambi/instruments/drawbar_organ.json',
      //url: 'http://abumarkub.net/qambi/instruments/dulcimer.json',
      //baseUrl: '../../instruments/city-piano/'
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
