import qambi, {
  Song,
  MIDIEventTypes,
} from '../../src/qambi'


import fetch from 'isomorphic-fetch'

document.addEventListener('DOMContentLoaded', function(){

  let song

  qambi.init()
  .then(() => {

    let test = 1

    if(test === 1){

      //console.time('song')
      fetch('../../data/mozk545a.mid')
      //fetch('../../data/minute_waltz.mid')
      .then(response => {
        return response.arrayBuffer()
      })
      .then(data => {
        song = Song.fromMIDIFile(data)
        initUI()
        //console.timeEnd('song')
      })

    }else if(test === 2){

      //console.time('song')
      Song.fromMIDIFileAsync('../../data/minute_waltz.mid')
      .then(s => {
        song = s
        //console.timeEnd('song')
        initUI()
      }, e => console.log(e))
    }
  })


  function initUI(){

    let btnPlay = document.getElementById('play')
    let btnPause = document.getElementById('pause')
    let btnStop = document.getElementById('stop')
    let btnLoop = document.getElementById('loop')
    let divTempo = document.getElementById('tempo')
    let divSustain = document.getElementById('sustain')
    let divSustain2 = document.getElementById('sustain2')
    let divSustain3 = document.getElementById('sustain3')
    let divPosition = document.getElementById('position')
    let divPositionTime = document.getElementById('position_time')
    let rangePosition = document.getElementById('playhead')
    let userInteraction = false

    btnPlay.disabled = false
    btnPause.disabled = false
    btnStop.disabled = false
    btnLoop.disabled = false

    btnPlay.addEventListener('click', function(){
      //song.play('barsbeats', 4, 1, 1, 0)
      //song.play('time', 0, 0, 15) // play from 15 seconds
      //song.play('millis', 34000) // play from 34 seconds
      song.play()
    });

    btnPause.addEventListener('click', function(){
      song.pause()
    })

    btnStop.addEventListener('click', function(){
      song.stop()
    })

    btnLoop.addEventListener('click', function(){
      let loop = song.setLoop()
      console.log(loop)
      btnLoop.innerHTML = loop ? 'stop loop' : 'start loop'
    })

    // song.addEventListener(MIDIEventTypes.TEMPO, event => {
    //   divTempo.innerHTML = `tempo: ${event.bpm} bpm`
    // })

    song.addEventListener('sustainpedal', event => {
      divSustain.innerHTML = 'sustainpedal ' + event.data
    })

    song.addEventListener('sustainpedal2', event => {
      divSustain2.innerHTML = 'sustainpedal2 ' + event.data
    })

    song.addEventListener(MIDIEventTypes.CONTROL_CHANGE, event => {
      if(event.data1 !== 64){
        return
      }
      if(event.data2 === 127){
        divSustain3.innerHTML = 'sustainpedal3 down'
      }else if(event.data2 === 0){
        divSustain3.innerHTML = 'sustainpedal3 up'
      }
    })

    song.addEventListener('noteOn', event => {
      let note = event.data
      //console.log('noteOn', note.id, note.noteOn.id, note.noteOn.data1, note.noteOn.ticks)
    })

    song.addEventListener('noteOff', event => {
      let note = event.data
      //console.log('noteOff', note.id, note.noteOff.id, note.noteOff.data1, note.noteOff.ticks)
    })

    song.addEventListener('play', event => {
      console.log('started playing at position:', event.data)
    })

    song.addEventListener('stop', () => {
      console.log('stop')
      rangePosition.value = 0
    })

    song.addEventListener('pause', event => {
      console.log('paused:', event.data)
      //console.log(song.getPosition())
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


    song.setPosition('barsbeats', 2)
    song.setLeftLocator('barsbeats', 2)
    song.setRightLocator('barsbeats', 3, 2)
    song.setLoop()

    //console.log(song.getPosition())
  }

})
