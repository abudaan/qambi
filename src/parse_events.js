'use strict';

import {getNiceTime} from './util';

let
  ppq,
  bpm,
  factor,
  nominator,
  denominator,
  playbackSpeed,

  bar,
  beat,
  sixteenth,
  tick,
  ticks,
  millis,

  millisPerTick,
  secondsPerTick,

  ticksPerBeat,
  ticksPerBar,
  ticksPerSixteenth,
  numSixteenth;


function setTickDuration(){
  secondsPerTick = (1/playbackSpeed * 60)/bpm/ppq;
  millisPerTick = secondsPerTick * 1000;
  //console.log(millisPerTick, bpm, ppq, playbackSpeed, (ppq * millisPerTick));
  //console.log(ppq);
}


function setTicksPerBeat(){
  factor = (4/denominator);
  numSixteenth = factor * 4;
  ticksPerBeat = ppq * factor;
  ticksPerBar = ticksPerBeat * nominator;
  ticksPerSixteenth = ppq/4;
  //console.log(denominator, factor, numSixteenth, ticksPerBeat, ticksPerBar, ticksPerSixteenth);
}


export function parseTimeEvents(song){
  //console.time('parse time events ' + song.name);
  let timeEvents = song.timeEvents;
  let bpm = song.bpm;
  let nominator = song.nominator;
  let denominator = song.denominator;

  let bar = 1;
  let beat = 1;
  let sixteenth = 1;
  let tick = 0;
  let ticks = 0;
  let millis = 0;
  let diffTicks;
  let type;
  let event;

  setTickDuration();
  setTicksPerBeat();

  timeEvents.sort((a, b) => (a.ticks <= b.ticks) ? 1 : -1);

  for(event of timeEvents){
    event.song = song;
    diffTicks = event.ticks - ticks;
    tick += diffTicks;
    ticks = event.ticks;
    type = event.type;
    //console.log(diffTicks, millisPerTick);
    millis += diffTicks * millisPerTick;

    while(tick >= ticksPerSixteenth){
      sixteenth++;
      tick -= ticksPerSixteenth;
      while(sixteenth > numSixteenth){
        sixteenth -= numSixteenth;
        beat++;
        while(beat > nominator){
          beat -= nominator;
          bar++;
        }
      }
    }

    switch(type){

      case 0x51:
        bpm = event.bpm;
        setTickDuration();
        break;

      case 0x58:
        nominator = event.nominator;
        denominator = event.denominator;
        setTicksPerBeat();
        break;

      default:
        continue;
    }

    //time data of time event is valid from (and included) the position of the time event
    updateEvent(event);
    //console.log(event.barsAsString);
  }

  song.lastEventTmp = event;
  //console.log(event);
  //console.log(timeEvents);
}



function updateEvent(event){

  //console.log(event, bpm, millisPerTick, ticks, millis);

  event.bpm = bpm;
  event.nominator = nominator;
  event.denominator = denominator;

  event.ticksPerBar = ticksPerBar;
  event.ticksPerBeat = ticksPerBeat;
  event.ticksPerSixteenth = ticksPerSixteenth;

  event.factor = factor;
  event.numSixteenth = numSixteenth;
  event.secondsPerTick = secondsPerTick;
  event.millisPerTick = millisPerTick;


  event.ticks = ticks;

  event.millis = millis;
  event.seconds = millis/1000;


  event.bar = bar;
  event.beat = beat;
  event.sixteenth = sixteenth;
  event.tick = tick;
  //event.barsAsString = (bar + 1) + ':' + (beat + 1) + ':' + (sixteenth + 1) + ':' + tick;
  var tickAsString = tick === 0 ? '000' : tick < 10 ? '00' + tick : tick < 100 ? '0' + tick : tick;
  event.barsAsString = bar + ':' + beat + ':' + sixteenth + ':' + tickAsString;
  event.barsAsArray = [bar, beat, sixteenth, tick];


  var timeData = getNiceTime(millis);

  event.hour = timeData.hour;
  event.minute = timeData.minute;
  event.second = timeData.second;
  event.millisecond = timeData.millisecond;
  event.timeAsString = timeData.timeAsString;
  event.timeAsArray = timeData.timeAsArray;
}


