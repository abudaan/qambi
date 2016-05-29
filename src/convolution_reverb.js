import {context} from './init_audio'
import {ChannelFX} from './channel_fx'
import {parseSamples} from './parse_audio'

export class ConvolutionReverb extends ChannelFX{

  static load(url){
    return new Promise((resolve, reject) => {
      parseSamples(url)
      .then(
        buffer => {
          buffer = buffer[0]
          if(buffer instanceof AudioBuffer){
            resolve(new ConvolutionReverb(buffer))
          }else{
            reject('could not parse to AudioBuffer', url)
          }
        }
      )
    })
  }

  constructor(buffer){
    super()
    if(buffer instanceof AudioBuffer === false && typeof buffer !== 'undefined'){
      console.log('argument is not an instance of AudioBuffer', buffer)
      return
    }
    this._nodeFX = context.createConvolver()
    this._nodeFX.buffer = buffer
  }
}
