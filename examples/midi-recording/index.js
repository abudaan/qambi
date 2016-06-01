import qambi, {
  Song,
  Track,
  SimpleSynth,
  getMIDIInputs,
} from '../../src/qambi'


document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {
    main()
  })
})


function main(){
  let song = new Song({bars: 4, autoSize: false})
  let track = new Track()
  track.setRecordEnabled('midi')
  track.monitor = true
  track.setInstrument(new SimpleSynth('square'))
  song.addTracks(track)
  song.update()

  let btnPlay = document.getElementById('play')
  let btnPause = document.getElementById('pause')
  let btnStop = document.getElementById('stop')
  let btnRecord = document.getElementById('record')
  let btnUndoRecord = document.getElementById('record-undo')
  let btnMetronome = document.getElementById('metronome')
  let divTempo = document.getElementById('tempo')
  let divPosition = document.getElementById('position')
  let divPositionTime = document.getElementById('position_time')
  let rangePosition = document.getElementById('playhead')
  let selectMIDIIn = document.getElementById('midiin')
  let selectPrecount = document.getElementById('precount')
  let userInteraction = false

  btnPlay.disabled = false
  btnPause.disabled = false
  btnStop.disabled = false
  btnRecord.disabled = false
  btnMetronome.disabled = false


  let MIDIInputs = getMIDIInputs()
  let html = '<option id="-1">select MIDI in</option>'
  MIDIInputs.forEach(port => {
    html += `<option id="${port.id}">${port.name}</option>`
  })
  selectMIDIIn.innerHTML = html

  selectMIDIIn.addEventListener('change', e => {
    let portId = selectMIDIIn.options[selectMIDIIn.selectedIndex].id
    track.disconnectMIDIInputs() // no arguments means disconnect from all inputs
    track.connectMIDIInputs(portId)
  })

  selectPrecount.addEventListener('change', e => {
    let numBars = parseInt(selectPrecount.options[selectPrecount.selectedIndex].id, 10)
    song.setPrecount(numBars)
  })

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

  btnRecord.addEventListener('click', function(){
    if(btnRecord.className === 'neutral'){
      song.startRecording()
      btnRecord.className = 'recording'
    }else if(btnRecord.className === 'recording'){
      song.stopRecording()
      btnRecord.className = 'neutral'
    }
  })

  btnUndoRecord.addEventListener('click', function(){
    if(btnUndoRecord.innerHTML === 'undo record'){
      song.undoRecording()
      btnUndoRecord.innerHTML = 'redo record'
    }else{
      song.redoRecording()
      btnUndoRecord.innerHTML = 'undo record'
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

  song.addEventListener('stop_recording', e => {
    btnUndoRecord.disabled = false
    btnRecord.className = 'neutral'
  })

  song.addEventListener('start_recording', e => {
    btnUndoRecord.disabled = true
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
