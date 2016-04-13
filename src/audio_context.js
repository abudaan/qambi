
let context

(function(){
  context = new window.AudioContext()
  if(typeof context === 'undefined'){
    context = {
      createGain: function(){
        return {
          gain: 1
        }
      },
      createOscillator: function(){},
    }
  }
  return context
}())

export {context}
