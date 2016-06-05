import {context} from './init_audio'
import {parseSamples} from './parse_audio'
import {ChannelEffect} from './channel_fx'

export class ConvolutionReverb extends ChannelEffect{

  constructor(buffer){

    super()
    this._nodeFX = context.createConvolver()
    this.init()

    if(buffer instanceof AudioBuffer){
      this._nodeFX.buffer = buffer
    }
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
}
