'use strict'

let partId = 0;


class Part{

  constructor(...args){
    let id = 'P' + partId++ + Date.now();

  }



}

export default function createPart(){
  return new Part(...arguments);
}