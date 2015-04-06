'use strict';

import getConfig from './config.js';


let timedTasks = new Map();
let repetitiveTasks = new Map();
let scheduledTasks = new Map();
let tasks = new Map();
let config = getConfig();
let lastTimeStamp;


function heartbeat(timestamp){
  let now = config.getTime();

  // for instance: the callback of sample.unschedule;
  for(let [key, task] in timedTasks){
    if(task.time >= now){
      task.execute(now);
      timedTasks.delete(key);
    }
  }


  // for instance: song.update();
  for(let task in scheduledTasks.values){
    task(now);
  }

  // for instance: song.pulse();
  for(let task in repetitiveTasks.values){
    task(now);
  }
/*
  // skip the first 10 frames because they tend to have weird intervals
  if(r >= 10){
    let diff = (timestamp - lastTimeStamp)/1000;
    sequencer.diff = diff;
    // if(r < 40){
    //     console.log(diff);
    //     r++;
    // }
    if(diff > sequencer.bufferTime && sequencer.autoAdjustBufferTime === true){
      if(sequencer.debug){
        console.log('adjusted buffertime:' + sequencer.bufferTime + ' -> ' +  diff);
      }
      sequencer.bufferTime = diff;
    }
  }else{
    r++;
  }
*/
  lastTimeStamp = timestamp;
  scheduledTasks.clear();

  //setTimeout(heartbeat, 100);
  window.requestAnimationFrame(heartbeat);
}


export function addTask(type, id, task){
  let map = tasks.get(type);
  map.set(id, task);
}

export function removeTask(type, id){
  let map = tasks.get(type);
  map.delete(id);
}

export function start(){
  tasks.set('timed', timedTasks);
  tasks.set('repetitive', repetitiveTasks);
  tasks.set('scheduled', scheduledTasks);
  heartbeat();
}