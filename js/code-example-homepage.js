import qambi from 'qambi'

qambi.init({
    song: {
      type: 'Song',
      url: '//qambi.org/midi/minute_waltz.mid'
    },
    piano: {
      type: 'Instrument',
      url: '//qambi.org/instruments/heartbeat/city-piano-light.json'
    }
  })
  .then(data => {

    let {song, piano} = data

    song.getTracks().forEach(track => {
      track.setInstrument(piano)
    })

    song.play()
  })
