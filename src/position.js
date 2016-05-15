'use strict';

import {getNiceTime} from './util';

const
  supportedTypes = 'barsandbeats barsbeats time millis ticks perc percentage',
  supportedReturnTypes = 'barsandbeats barsbeats time millis ticks all',
  floor = Math.floor,
  round = Math.round;


let
  //local
  bpm,
  nominator,
  denominator,

  ticksPerBeat,
  ticksPerBar,
  ticksPerSixteenth,

  millisPerTick,
  secondsPerTick,
  numSixteenth,

  ticks,
  millis,
  diffTicks,
  diffMillis,

  bar,
  beat,
  sixteenth,
  tick,

//  type,
  index,
  returnType = 'all',
  beyondEndOfSong = true;


function getTimeEvent(song, unit, target){
  // finds the time event that comes the closest before the target position
  let timeEvents = song._timeEvents

  for(let i = timeEvents.length - 1; i >= 0; i--){
    let event = timeEvents[i];
    //console.log(unit, target, event)
    if(event[unit] <= target){
      index = i
      return event
    }
  }
  return null
}


export function millisToTicks(song, targetMillis, beos = true){
  beyondEndOfSong = beos
  fromMillis(song, targetMillis)
  //return round(ticks);
  return ticks
}


export function ticksToMillis(song, targetTicks, beos = true){
  beyondEndOfSong = beos
  fromTicks(song, targetTicks)
  return millis
}


export function barsToMillis(song, position, beos){ // beos = beyondEndOfSong
  calculatePosition(song, {
    type: 'barsbeat',
    position,
    result: 'millis',
    beos,
  })
  return millis
}


export function barsToTicks(song, position, beos){ // beos = beyondEndOfSong
  calculatePosition(song, {
    type: 'barsbeats',
    position,
    result: 'ticks',
    beos
  })
  //return round(ticks);
  return ticks
}


export function ticksToBars(song, target, beos = true){
  beyondEndOfSong = beos
  fromTicks(song, target)
  calculateBarsAndBeats()
  returnType = 'barsandbeats'
  return getPositionData()
}


export function millisToBars(song, target, beos = true){
  beyondEndOfSong = beos
  fromMillis(song, target)
  calculateBarsAndBeats()
  returnType = 'barsandbeats'
  return getPositionData()
}


// main calculation function for millis position
function fromMillis(song, targetMillis, event){
  let lastEvent = song._lastEvent;

  if(beyondEndOfSong === false){
    if(targetMillis > lastEvent.millis){
      targetMillis = lastEvent.millis;
    }
  }

  if(typeof event === 'undefined'){
    event = getTimeEvent(song, 'millis', targetMillis);
  }
  //console.log(event)
  getDataFromEvent(event);

  // if the event is not exactly at target millis, calculate the diff
  if(event.millis === targetMillis){
    diffMillis = 0;
    diffTicks = 0;
  }else{
    diffMillis = targetMillis - event.millis;
    diffTicks = diffMillis / millisPerTick;
  }

  millis += diffMillis;
  ticks += diffTicks;

  return ticks;
}


// main calculation function for ticks position
function fromTicks(song, targetTicks, event){
  let lastEvent = song._lastEvent;

  if(beyondEndOfSong === false){
    if(targetTicks > lastEvent.ticks){
      targetTicks = lastEvent.ticks;
    }
  }

  if(typeof event === 'undefined'){
    event = getTimeEvent(song, 'ticks', targetTicks);
  }
  //console.log(event)
  getDataFromEvent(event);

  // if the event is not exactly at target ticks, calculate the diff
  if(event.ticks === targetTicks){
    diffTicks = 0;
    diffMillis = 0;
  }else{
    diffTicks = targetTicks - ticks;
    diffMillis = diffTicks * millisPerTick;
  }

  ticks += diffTicks;
  millis += diffMillis;

  return millis;
}


// main calculation function for bars and beats position
function fromBars(song, targetBar, targetBeat, targetSixteenth, targetTick, event = null){
  //console.time('fromBars');
  let i = 0,
    diffBars,
    diffBeats,
    diffSixteenth,
    diffTick,
    lastEvent = song._lastEvent;

  if(beyondEndOfSong === false){
    if(targetBar > lastEvent.bar){
      targetBar = lastEvent.bar;
    }
  }

  if(event === null){
    event = getTimeEvent(song, 'bar', targetBar);
  }
  //console.log(event)
  getDataFromEvent(event);

  //correct wrong position data, for instance: '3,3,2,788' becomes '3,4,4,068' in a 4/4 measure at PPQ 480
  while(targetTick >= ticksPerSixteenth){
    targetSixteenth++;
    targetTick -= ticksPerSixteenth;
  }

  while(targetSixteenth > numSixteenth){
    targetBeat++;
    targetSixteenth -= numSixteenth;
  }

  while(targetBeat > nominator){
    targetBar++;
    targetBeat -= nominator;
  }

  event = getTimeEvent(song, 'bar', targetBar, index);
  for(i = index; i >= 0; i--){
    event = song._timeEvents[i];
    if(event.bar <= targetBar){
      getDataFromEvent(event);
      break;
    }
  }

  // get the differences
  diffTick = targetTick - tick;
  diffSixteenth = targetSixteenth - sixteenth;
  diffBeats = targetBeat - beat;
  diffBars = targetBar - bar; //bar is always less then or equal to targetBar, so diffBars is always >= 0

  //console.log('diff',diffBars,diffBeats,diffSixteenth,diffTick);
  //console.log('millis',millis,ticksPerBar,ticksPerBeat,ticksPerSixteenth,millisPerTick);

  // convert differences to milliseconds and ticks
  diffMillis = (diffBars * ticksPerBar) * millisPerTick;
  diffMillis += (diffBeats * ticksPerBeat) * millisPerTick;
  diffMillis += (diffSixteenth * ticksPerSixteenth) * millisPerTick;
  diffMillis += diffTick * millisPerTick;
  diffTicks = diffMillis / millisPerTick;
  //console.log(diffBars, ticksPerBar, millisPerTick, diffMillis, diffTicks);

  // set all current position data
  bar = targetBar;
  beat = targetBeat;
  sixteenth = targetSixteenth;
  tick = targetTick;
  //console.log(tick, targetTick)

  millis += diffMillis;
  //console.log(targetBar, targetBeat, targetSixteenth, targetTick, ' -> ', millis);
  ticks += diffTicks;

  //console.timeEnd('fromBars');
}


function calculateBarsAndBeats(){
  // spread the difference in tick over bars, beats and sixteenth
  let tmp = round(diffTicks);
  while(tmp >= ticksPerSixteenth){
    sixteenth++;
    tmp -= ticksPerSixteenth;
    while(sixteenth > numSixteenth){
      sixteenth -= numSixteenth;
      beat++;
      while(beat > nominator){
        beat -= nominator;
        bar++;
      }
    }
  }
  tick = round(tmp);
}


// store properties of event in local scope
function getDataFromEvent(event){

  bpm = event.bpm;
  nominator = event.nominator;
  denominator = event.denominator;

  ticksPerBar = event.ticksPerBar;
  ticksPerBeat = event.ticksPerBeat;
  ticksPerSixteenth = event.ticksPerSixteenth;
  numSixteenth = event.numSixteenth;
  millisPerTick = event.millisPerTick;
  secondsPerTick = event.secondsPerTick;

  bar = event.bar;
  beat = event.beat;
  sixteenth = event.sixteenth;
  tick = event.tick;

  ticks = event.ticks;
  millis = event.millis;

  //console.log(bpm, event.type);
  //console.log('ticks', ticks, 'millis', millis, 'bar', bar);
}


function getPositionData(song){
  let timeData,
    positionData = {};

  switch(returnType){

    case 'millis':
      //positionData.millis = millis;
      positionData.millis = round(millis * 1000) / 1000;
      positionData.millisRounded = round(millis);
      break;

    case 'ticks':
      //positionData.ticks = ticks;
      positionData.ticks = round(ticks);
      //positionData.ticksUnrounded = ticks;
      break;

    case 'barsbeats':
    case 'barsandbeats':
      positionData.bar = bar;
      positionData.beat = beat;
      positionData.sixteenth = sixteenth;
      positionData.tick = tick;
      //positionData.barsAsString = (bar + 1) + ':' + (beat + 1) + ':' + (sixteenth + 1) + ':' + tickAsString;
      positionData.barsAsString = bar + ':' + beat + ':' + sixteenth + ':' + getTickAsString(tick);
      break;

    case 'time':
      timeData = getNiceTime(millis);
      positionData.hour = timeData.hour;
      positionData.minute = timeData.minute;
      positionData.second = timeData.second;
      positionData.millisecond = timeData.millisecond;
      positionData.timeAsString = timeData.timeAsString;
      break;

    case 'all':
      // millis
      //positionData.millis = millis;
      positionData.millis = round(millis * 1000) / 1000;
      positionData.millisRounded = round(millis);

      // ticks
      //positionData.ticks = ticks;
      positionData.ticks = round(ticks);
      //positionData.ticksUnrounded = ticks;

      // barsbeats
      positionData.bar = bar;
      positionData.beat = beat;
      positionData.sixteenth = sixteenth;
      positionData.tick = tick;
      //positionData.barsAsString = (bar + 1) + ':' + (beat + 1) + ':' + (sixteenth + 1) + ':' + tickAsString;
      positionData.barsAsString = bar + ':' + beat + ':' + sixteenth + ':' + getTickAsString(tick);

      // time
      timeData = getNiceTime(millis);
      positionData.hour = timeData.hour;
      positionData.minute = timeData.minute;
      positionData.second = timeData.second;
      positionData.millisecond = timeData.millisecond;
      positionData.timeAsString = timeData.timeAsString;

      // extra data
      positionData.bpm = round(bpm * song.playbackSpeed, 3);
      positionData.nominator = nominator;
      positionData.denominator = denominator;

      positionData.ticksPerBar = ticksPerBar;
      positionData.ticksPerBeat = ticksPerBeat;
      positionData.ticksPerSixteenth = ticksPerSixteenth;

      positionData.numSixteenth = numSixteenth;
      positionData.millisPerTick = millisPerTick;
      positionData.secondsPerTick = secondsPerTick;

      // use ticks to make tempo changes visible by a faster moving playhead
      positionData.percentage = ticks / song._durationTicks;
      //positionData.percentage = millis / song.durationMillis;
      break;
    default:
      return null
  }

  return positionData
}


function getTickAsString(t){
  if(t === 0){
    t = '000'
  }else if(t < 10){
    t = '00' + t
  }else if(t < 100){
    t = '0' + t
  }
  return t
}


// used by playhead
export function getPosition2(song, unit, target, type, event){
  if(unit === 'millis'){
    fromMillis(song, target, event);
  }else if(unit === 'ticks'){
    fromTicks(song, target, event);
  }
  returnType = type
  if(returnType === 'all'){
    calculateBarsAndBeats();
  }
  return getPositionData(song);
}


// improved version of getPosition
export function calculatePosition(song, settings){
  let {
    type, // any of barsandbeats barsbeats time millis ticks perc percentage
    target, // if type is barsbeats or time, target must be an array, else if must be a number
    result: result = 'all', // any of barsandbeats barsbeats time millis ticks all
    beos: beos = true,
    snap: snap = -1
  } = settings

  if(supportedReturnTypes.indexOf(result) === -1){
    console.warn(`unsupported return type, 'all' used instead of '${result}'`)
    result = 'all'
  }

  returnType = result
  beyondEndOfSong = beos

  if(supportedTypes.indexOf(type) === -1){
    console.error(`unsupported type ${type}`)
    return false
  }


  switch(type){

    case 'barsbeats':
    case 'barsandbeats':
      let [targetbar = 1, targetbeat = 1, targetsixteenth = 1, targettick = 0] = target
      //console.log(targetbar, targetbeat, targetsixteenth, targettick)
      fromBars(song, targetbar, targetbeat, targetsixteenth, targettick)
      return getPositionData(song)

    case 'time':
      // calculate millis out of time array: hours, minutes, seconds, millis
      let [targethour = 0, targetminute = 0, targetsecond = 0, targetmillisecond = 0] = target
      let millis = 0
      millis += targethour * 60 * 60 * 1000 //hours
      millis += targetminute * 60 * 1000 //minutes
      millis += targetsecond * 1000 //seconds
      millis += targetmillisecond //milliseconds

      fromMillis(song, millis)
      calculateBarsAndBeats()
      return getPositionData(song)

    case 'millis':
      fromMillis(song, target)
      calculateBarsAndBeats()
      return getPositionData(song)

    case 'ticks':
      fromTicks(song, target)
      calculateBarsAndBeats()
      return getPositionData(song)

    case 'perc':
    case 'percentage':

      //millis = position[1] * song.durationMillis;
      //fromMillis(song, millis);
      //console.log(millis);

      ticks = target * song._durationTicks // target must be in ticks!
      //console.log(ticks, song._durationTicks)
      if(snap !== -1){
        ticks = floor(ticks / snap) * snap;
        //fromTicks(song, ticks);
        //console.log(ticks);
      }
      fromTicks(song, ticks)
      calculateBarsAndBeats()
      let tmp = getPositionData(song)
      //console.log('diff', position[1] - tmp.percentage);
      return tmp

    default:
      return false
  }
}

/*

//@param: 'millis', 1000, [true]
//@param: 'ticks', 1000, [true]
//@param: 'barsandbeats', 1, ['all', true]
//@param: 'barsandbeats', 60, 4, 3, 120, ['all', true]
//@param: 'barsandbeats', 60, 4, 3, 120, [true, 'all']

function checkPosition(type, args, returnType = 'all'){
  beyondEndOfSong = true;
  console.log('----> checkPosition:', args, typeString(args));

  if(typeString(args) === 'array'){
    let
      numArgs = args.length,
      position,
      i, a, positionLength;

    type = args[0];

    // support for [['millis', 3000]]
    if(typeString(args[0]) === 'array'){
      //console.warn('this shouldn\'t happen!');
      args = args[0];
      type = args[0];
      numArgs = args.length;
    }

    position = [type];

    console.log('check position', args, numArgs, supportedTypes.indexOf(type));

    //console.log('arg', 0, '->', type);

    if(supportedTypes.indexOf(type) !== -1){
      for(i = 1; i < numArgs; i++){
        a = args[i];
        //console.log('arg', i, '->', a);
        if(a === true || a === false){
          beyondEndOfSong = a;
        }else if(isNaN(a)){
          if(supportedReturnTypes.indexOf(a) !== -1){
            returnType = a;
          }else{
            return false;
          }
        }else {
          position.push(a);
        }
      }
      //check number of arguments -> either 1 number or 4 numbers in position, e.g. ['barsbeats', 1] or ['barsbeats', 1, 1, 1, 0],
      // or ['perc', 0.56, numberOfTicksToSnapTo]
      positionLength = position.length;
      if(positionLength !== 2 && positionLength !== 3 && positionLength !== 5){
        return false;
      }
      //console.log(position, returnType, beyondEndOfSong);
      //console.log('------------------------------------')
      return position;
    }
  }
  return false;
}


export function getPosition(song, type, args){
  //console.log('getPosition', args);

  if(typeof args === 'undefined'){
    return {
      millis: 0
    }
  }

  let position = checkPosition(type, args),
    millis, tmp, snap;


  if(position === false){
    error('wrong position data');
    return false;
  }

  switch(type){

    case 'barsbeats':
    case 'barsandbeats':
      fromBars(song, position[1], position[2], position[3], position[4]);
      return getPositionData(song);

    case 'time':
      // calculate millis out of time array: hours, minutes, seconds, millis
      millis = 0;
      tmp = position[1] || 0;
      millis += tmp * 60 * 60 * 1000; //hours
      tmp = position[2] || 0;
      millis += tmp * 60 * 1000; //minutes
      tmp = position[3] || 0;
      millis += tmp * 1000; //seconds
      tmp = position[4] || 0;
      millis += tmp; //milliseconds

      fromMillis(song, millis);
      calculateBarsAndBeats();
      return getPositionData(song);

    case 'millis':
      fromMillis(song, position[1]);
      calculateBarsAndBeats();
      return getPositionData(song);

    case 'ticks':
      fromTicks(song, position[1]);
      calculateBarsAndBeats();
      return getPositionData(song);

    case 'perc':
    case 'percentage':
      snap = position[2];

      //millis = position[1] * song.durationMillis;
      //fromMillis(song, millis);
      //console.log(millis);

      ticks = position[1] * song.durationTicks;
      if(snap !== undefined){
        ticks = floor(ticks/snap) * snap;
        //fromTicks(song, ticks);
        //console.log(ticks);
      }
      fromTicks(song, ticks);
      calculateBarsAndBeats();
      tmp = getPositionData(song);
      //console.log('diff', position[1] - tmp.percentage);
      return tmp;
  }
  return false;
}

*/

