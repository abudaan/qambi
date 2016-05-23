import qambi, {
  Instrument,
  Song,
} from '../../src/qambi'

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {

    Song.fromMIDIFileAsync('../data/minute_waltz.mid')
    //Song.fromMIDIFileAsync('../data/mozk545a.mid')
    .then(song => {

      let piano = new Instrument()
      song.getTracks().forEach(track => {
        track.setInstrument(piano)
      })

      song.setMetronome(true)
      song.play()
      // piano.parseSampleData({url: 'https://raw.githubusercontent.com/abudaan/qambi/gh-pages/instruments/heartbeat/city-piano-light.json'})
      // .then(() => {
      //   song.play()
      // })
    })
  })
})
