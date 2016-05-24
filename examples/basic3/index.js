import qambi, {
  Instrument,
  Song,
} from '../../src/qambi'

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {

    Song.fromMIDIFile('../data/minute_waltz.mid')
    //Song.fromMIDIFile('../data/mozk545a.mid')
    .then(song => {

      let piano = new Instrument()
      song.getTracks().forEach(track => {
        track.setInstrument(piano)
      })

      song.setMetronome(true)

      piano.parseSampleData({url: 'https://raw.githubusercontent.com/abudaan/qambi/gh-pages/instruments/heartbeat/city-piano-light.json'})
      .then(() => {
        song.play()
      })
    })
  })
})
