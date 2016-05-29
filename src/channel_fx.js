import {context} from './init_audio'

export class ChannelFX{

  constructor(){
    this.bypass = false
    this.amount = 0//0.5

    this._output = context.createGainNode()
    this._wetGain = context.createGainNode()
    this._dryGain = context.createGainNode()

    this._output.gain.value = 1
    this._wetGain.gain.value = this.amount
    this._dryGain.gain.value = 1 - this.amount

    this._wetGain.connect(this._output)
    this._dryGain.connect(this._output)
  }

  // mandatory
  setInput(input){
    if(input instanceof AudioNode === false){
      console.log('argument is not an instance of AudioNode', input)
      return
    }

    this._input = input

    // dry channel
    this._input.connect(this._dryGain)

    // wet channel
    this._input.connect(this._nodeFX)
    this._nodeFX.connect(this._wetGain)
  }

  // mandatory
  setOutput(output){
    if(output instanceof AudioNode === false){
      console.log('argument is not an instance of AudioNode', output)
      return
    }
    this._output.disconnect()
    this._output.connect(output)
  }

  // mandatory
  disconnect(){
    this._output.disconnect()
    this._nodeFX.disconnect()
    //console.log(this._input)
    try{
      this._input.disconnect(this._dryGain)
      this._input.disconnect(this._nodeFX)
    }catch(e){
      console.log(e)
    }
  }

  // mandatory
  getOutput(){
    return this._output
  }

  setAmount(value){
    /*
    this.amount = value < 0 ? 0 : value > 1 ? 1 : value;
    var gain1 = Math.cos(this.amount * 0.5 * Math.PI),
        gain2 = Math.cos((1.0 - this.amount) * 0.5 * Math.PI);
    this.gainNode.gain.value = gain2 * this.ratio;
    */

    if(value < 0){
      value = 0
    }else if(value > 1){
      value = 1
    }

    this.amount = value
    this._wetGain.gain.value = this.amount
    this._dryGain.gain.value = 1 - this.amount
    //console.log('wet',this.wetGain.gain.value,'dry',this.dryGain.gain.value);
  }
}
