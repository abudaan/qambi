'use strict';

let trackId = 0;


export class Track{

  constructor(...args){
    let id = 'P' + trackId++ + Date.now();
    this.events = [];
    this.newEventsMap = new Map();
    this.removedEventsMap = new Map();
  }


  update(){
    // do stuff
    this.newEventsMap.clear();
    this.removedEventsMap.clear();
  }
}

export function createTrack(){
  return new Track(...arguments);
}


/*
let Track = {
    init: function(){
        let id = 'T' + trackId++ + new Date().getTime();
        Object.defineProperty(this, 'id', {
            value: id
        });
    }
};

export default function createTrack(){
  var t = Object.create(Track);
  t.init(arguments);
  return t;
}

*/