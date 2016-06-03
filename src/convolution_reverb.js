import {context} from './init_audio'
import {parseSamples} from './parse_audio'

export class ConvolutionReverb{

  constructor(buffer){
    this._nodeFX = context.createConvolver()

    if(buffer instanceof AudioBuffer){
      this._nodeFX.buffer = buffer
    }
    this.input = context.createGain()
    this.output = context.createGain()

    this._dry = context.createGain()
    this._wet = context.createGain()

    this._dry.gain.value = 1
    this._wet.gain.value = 0

    this.input.connect(this._dry)
    this._dry.connect(this.output)

    this.input.connect(this._nodeFX)
    this._nodeFX.connect(this._wet)
    this._wet.connect(this.output)

    this.amount = 0
  }

  addBuffer(buffer){
    if(buffer instanceof AudioBuffer === false){
      console.log('argument is not an instance of AudioBuffer', buffer)
      return
    }
    this._nodeFX.buffer = buffer
  }

  loadBuffer(url){
    return new Promise((resolve, reject) => {
      parseSamples(url)
      .then(
        buffer => {
          buffer = buffer[0]
          if(buffer instanceof AudioBuffer){
            this._nodeFX.buffer = buffer
            resolve()
          }else{
            reject('could not parse to AudioBuffer', url)
          }
        }
      )
    })
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
    this._wet.gain.value = this.amount
    this._dry.gain.value = 1 - this.amount
    //console.log('wet',this.wetGain.gain.value,'dry',this.dryGain.gain.value);
  }
}
