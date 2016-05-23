import qambi, {
  Instrument,
  MIDIEvent,
  Song,
  Track,
  Part,
} from '../../src/qambi' // use "from 'qambi'" in your own code! so without the extra "../../"


import {sortEvents} from '../../src/util'

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {
/*
    let song = new Song({bars: 1})
    let track = new Track()
    let part = new Part()

    part.addEvents(
      new MIDIEvent(960 * 0, 144, 60, 100),
      new MIDIEvent(960 * 1, 128, 60, 0),
      new MIDIEvent(960 * 1, 144, 62, 100),
      new MIDIEvent(960 * 2, 128, 62, 0),
      new MIDIEvent(960 * 2, 144, 64, 100),
      new MIDIEvent(960 * 3, 128, 64, 0),
      new MIDIEvent(960 * 3, 144, 65, 100),
      new MIDIEvent(960 * 4, 128, 65, 0),
      new MIDIEvent(960 * 4, 144, 67, 100),
      new MIDIEvent(960 * 6, 128, 67, 0),
    )

    track.addParts(part)
    track.setInstrument(new Instrument())

    song.addTracks(track)
    song.update()

    song.play()
    song.saveAsMIDIFile('test.midi')

*/
    let song = new Song({bars: 1})
    let track = new Track('song')
    track.setInstrument(new Instrument())

    song._events.push(
      new MIDIEvent(960 * 0, 144, 60, 100),
      new MIDIEvent(960 * 1, 128, 60, 0),
      new MIDIEvent(960 * 1, 144, 62, 100),
      new MIDIEvent(960 * 2, 128, 62, 0),
      new MIDIEvent(960 * 2, 144, 64, 100),
      new MIDIEvent(960 * 3, 128, 64, 0),
      new MIDIEvent(960 * 3, 144, 65, 100),
      new MIDIEvent(960 * 4, 128, 65, 0),
      new MIDIEvent(960 * 4, 144, 67, 100),
      new MIDIEvent(960 * 6, 128, 67, 0),
    )
    song.addTracks(track)
    song.setMetronome(true)
    song._events.forEach(event => {
      event._track = track
      event._part = {muted: false}
    })
    song._prepare()
    song.play()
  })

})
