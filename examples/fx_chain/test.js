
document.addEventListener('DOMContentLoaded', function(){

  var context = new window.AudioContext()
  var source = context.createOscillator()
  source.type = 'sine'
  source.frequency.value = 440

  let output = context.createGain()
  output.gain.value = 0.5
  source.connect(output)

  let panner = context.createPanner()
  panner.panningModel = 'equalpower'
  //panner.setPosition(0, 0, zeroValue)

  output.connect(panner)
  panner.connect(context.destination)

  source.start()
})
