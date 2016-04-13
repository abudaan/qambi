import {initAudio} from './init_audio';

export const context = new window.AudioContext()

export function init(){
  initAudio().then((e) => {
    console.log(e)
  })
}

