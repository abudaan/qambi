import qambi, {
  SimpleSynth,
  updateSettings,
} from '../../src/qambi' // use "from 'qambi'" in your own code! so without the extra "../../"

document.addEventListener('DOMContentLoaded', function(){

  qambi.init({
    settings: {
      pitch: 440,
      useMetronome: true
    },
    song: {
      type: 'Song',
      url: '../data/minute_waltz.mid'
    },
  })
  .then(main)
})


function main(data){

  //console.log(data)

  let {song} = data
  let synth = new SimpleSynth('sine')

  song.getTracks().forEach(track => {
    track.setInstrument(synth)
  })

  let btnPlay = document.getElementById('play')
  let btnPause = document.getElementById('pause')
  let btnStop = document.getElementById('stop')
  let rangePitch = document.getElementById('pitch')
  let divPitch = document.getElementById('pitch-label')


  btnPlay.disabled = false
  btnPause.disabled = false
  btnStop.disabled = false
  rangePitch.disabled = false

  btnPlay.addEventListener('click', function(){
    song.play()
  })

  btnPause.addEventListener('click', function(){
    song.pause()
  })

  btnStop.addEventListener('click', function(){
    song.stop()
  })

  rangePitch.addEventListener('mouseup', () => {
    rangePitch.removeEventListener('mousemove', rangeListener)
  })

  rangePitch.addEventListener('mousedown', () => {
    rangePitch.addEventListener('mousemove', rangeListener)
  })

  const rangeListener = function(e){
    let pitch = e.target.valueAsNumber
    song.configure({pitch})
    divPitch.innerHTML = `pitch: ${pitch}Hz`
  }
}
