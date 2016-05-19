import qambi, {
  Instrument,
  Song,
} from '../../src/qambi'

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {

    Song.fromMIDIFileAsync('../data/minute_waltz.mid')
    .then(song => {

      let piano = new Instrument()
      song.getTracks().forEach(track => {
        track.setInstrument(piano)
      })

      piano.parseSampleData({url: '../../instruments/electric-piano.json'})
      .then(() => {
        song.play()
      })

    })

  })

})
