import qambi, {
  Song,
  Track,
  Part,
  MIDIEvent,
  SimpleSynth,
  getMIDIOutputs,
} from '../../src/qambi'


document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {
    main()
  })
})


function main(){
  let song = new Song({bars: 2, autoSize: false})
  let track = new Track()
  let part = new Part()
  let velocity = 10
  part.addEvents(
    new MIDIEvent(960 * 0, 144, 60, velocity),
    new MIDIEvent(960 * 1, 128, 60, 0),
    new MIDIEvent(960 * 1, 144, 62, velocity),
    new MIDIEvent(960 * 2, 128, 62, 0),
    new MIDIEvent(960 * 2, 144, 64, velocity),
    new MIDIEvent(960 * 3, 128, 64, 0),
    new MIDIEvent(960 * 3, 144, 65, velocity),
    new MIDIEvent(960 * 4, 128, 65, 0),
    new MIDIEvent(960 * 4, 144, 67, velocity),
    new MIDIEvent(960 * 5, 128, 67, 0),
    new MIDIEvent(960 * 5, 144, 65, velocity),
    new MIDIEvent(960 * 6, 128, 65, 0),
    new MIDIEvent(960 * 6, 144, 64, velocity),
    new MIDIEvent(960 * 7, 128, 64, 0),
    new MIDIEvent(960 * 7, 144, 62, velocity),
    new MIDIEvent(960 * 8, 128, 62, 0),
  )

  track.addParts(part)
  track.setInstrument(new SimpleSynth('sine'))
  track.connectMIDIOutputs(...getMIDIOutputs())
  song.addTracks(track)
  song.update()
  song.setLeftLocator('barsbeats', 1)
  song.setRightLocator('barsbeats', 3)

  let btnPlay = document.getElementById('play')
  let btnPause = document.getElementById('pause')
  let btnStop = document.getElementById('stop')
  let btnDelete = document.getElementById('delete')
  let btnLoop = document.getElementById('loop')
  let btnMetronome = document.getElementById('metronome')
  let divTempo = document.getElementById('tempo')
  let divPosition = document.getElementById('position')
  let divPositionTime = document.getElementById('position_time')
  let rangePosition = document.getElementById('playhead')
  let userInteraction = false
  let deleted = false
  let looped = false

  btnPlay.disabled = false
  btnPause.disabled = false
  btnStop.disabled = false
  btnLoop.disabled = false
  btnDelete.disabled = false
  btnMetronome.disabled = false


  btnMetronome.addEventListener('click', function(){
    song.setMetronome() // if no arguments are provided it simply toggles
    btnMetronome.innerHTML = song.useMetronome ? 'metronome off' : 'metronome on'
  })

  btnPlay.addEventListener('click', function(){
    song.play()
  })

  btnPause.addEventListener('click', function(){
    song.pause()
  })

  btnStop.addEventListener('click', function(){
    song.stop()
  })

  btnLoop.addEventListener('click', function(){
    looped = !looped
    if(looped){
      btnLoop.innerHTML = 'loop off'
    }else {
      btnLoop.innerHTML = 'loop on'
    }
    song.setLoop(looped)
  })

  btnDelete.addEventListener('click', function(){
    deleted = !deleted
    if(deleted){
      btnDelete.innerHTML = 'undo remove'
      track.removeParts(part)
      song.update()
    }else {
      btnDelete.innerHTML = 'remove part'
      track.addParts(part)
      song.update()
    }
  })

  let position = song.getPosition()
  divPosition.innerHTML = position.barsAsString
  divPositionTime.innerHTML = position.timeAsString
  divTempo.innerHTML = `tempo: ${position.bpm} bpm`

  song.addEventListener('position', event => {
    divPosition.innerHTML = event.data.barsAsString
    divPositionTime.innerHTML = event.data.timeAsString
    divTempo.innerHTML = `tempo: ${event.data.bpm} bpm`
    if(!userInteraction){
      rangePosition.value = event.data.percentage
    }
  })


  rangePosition.addEventListener('mouseup', e => {
    rangePosition.removeEventListener('mousemove', rangeListener)
    userInteraction = false
  })

  rangePosition.addEventListener('mousedown', e => {
    setTimeout(function(){
      song.setPosition('percentage', e.target.valueAsNumber)
    }, 0)
    rangePosition.addEventListener('mousemove', rangeListener)
    userInteraction = true
  })

  const rangeListener = function(e){
    song.setPosition('percentage', e.target.valueAsNumber)
  }
}
