import qambi, {
  getMIDIInputs
} from 'qambi'

document.addEventListener('DOMContentLoaded', function(){

  console.time('loading and parsing assets took')

  qambi.init({
    song: {
      type: 'Song',
      url: '../data/minute_waltz.mid'
    },
    piano: {
      type: 'Instrument',
      url: '../../instruments/heartbeat/city-piano-light-concat.json'
    }
  })
  .then(main)
})


function main(data){
  console.timeEnd('loading and parsing assets took')

  let {song, piano} = data

  song.getTracks().forEach(track => {
    track.setInstrument(piano)
    track.monitor = true
    track.connectMIDIInputs(...getMIDIInputs())
  })

  let btnPlay = document.getElementById('play')
  let btnPause = document.getElementById('pause')
  let btnStop = document.getElementById('stop')
  let divLoading = document.getElementById('loading')
  divLoading.innerHTML = ''

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
