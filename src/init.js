import {initAudio} from './init_audio'
import {initMIDI} from './init_midi'
import {getStore} from './create_store'
import {STORE_SAMPLES} from './action_types'

const store = getStore()

export function init(cb): void{
  initAudio().then((data) => {

    store.dispatch({
      type: STORE_SAMPLES,
      payload: {
        lowTick: data.lowtick,
        highTick: data.hightick,
      }
    })

    cb({
      legacy: data.legacy,
      mp3: data.mp3,
      ogg: data.ogg
    })
  })

  initMIDI().then(function(data){
    console.log(data)
  })
}


