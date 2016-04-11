'use strict';

import {getNiceTime} from './util';

var
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
  numSixteenth,

  diffTicks,
  previousEvent;


function setTickDuration(){
  secondsPerTick = (1 / playbackSpeed * 60) / bpm / ppq;
  //secondsPerTick = bpm / 60 / ppq;
  millisPerTick = secondsPerTick * 1000;
  //console.log(millisPerTick, bpm, ppq, playbackSpeed, (ppq * millisPerTick));
  //console.log(ppq);
}


function setTicksPerBeat(){
  factor = (4 / denominator);
  numSixteenth = factor * 4;
  ticksPerBeat = ppq * factor;
  ticksPerBar = ticksPerBeat * nominator;
  ticksPerSixteenth = ppq / 4;
  //console.log(denominator, factor, numSixteenth, ticksPerBeat, ticksPerBar, ticksPerSixteenth);
}


function updatePosition(event){
  diffTicks = event.ticks - ticks;
  if(diffTicks < 0){
    console.log(diffTicks, event.ticks, previousEvent.ticks, previousEvent.type)
  }
  tick += diffTicks;
  ticks = event.ticks;
  previousEvent = event
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
}


export function parseTimeEvents(settings, timeEvents){
  //console.time('parse time events ' + song.name);
  let type;
  let event;

  ppq = settings.ppq;
  bpm = settings.bpm;
  nominator = settings.nominator;
  denominator = settings.denominator;
  playbackSpeed = settings.playbackSpeed;
  bar = 1;
  beat = 1;
  sixteenth = 1;
  tick = 0;
  ticks = 0;
  millis = 0;

  setTickDuration();
  setTicksPerBeat();

  timeEvents.sort((a, b) => (a.ticks <= b.ticks) ? -1 : 1);
  let e = 0;
  for(event of timeEvents){
    //console.log(e++, event.ticks, event.type)
    //event.song = song;
    type = event.type;
    updatePosition(event);

    switch(type){

      case 0x51:
        bpm = event.data1;
        //console.log(event)
        setTickDuration();
        break;

      case 0x58:
        nominator = event.data1;
        denominator = event.data2;
        setTicksPerBeat();
        break;

      default:
        continue;
    }

    //time data of time event is valid from (and included) the position of the time event
    updateEvent(event);
    //console.log(event.barsAsString);
  }

  //song.lastEventTmp = event;
  //console.log(event);
  //console.log(timeEvents);
}


//export function parseEvents(song, events){
export function parseEvents(events){
  console.log('parseEvents')
  let event;
  let startEvent = 0;
  let lastEventTick = 0;
  let result = []

  ticks = 0

  //let events = [].concat(evts, song._timeEvents);
  let numEvents = events.length;
  //console.log(events)
  events.sort(function(a, b){
    return a.sortIndex - b.sortIndex;
/*
    // noteoff comes before noteon
    if(a.ticks === b.ticks){
      // if(a.type === 128){
      //   return -1
      // }else if(b.type === 128){
      //   return 1
      // }
      // short:
      return a.type - b.type
    }
    return a.ticks - b.ticks;
*/
  });
  event = events[0];
  //console.log(event)

  bpm = event.bpm;
  factor = event.factor;
  nominator = event.nominator;
  denominator = event.denominator;

  ticksPerBar = event.ticksPerBar;
  ticksPerBeat = event.ticksPerBeat;
  ticksPerSixteenth = event.ticksPerSixteenth;

  numSixteenth = event.numSixteenth;

  millisPerTick = event.millisPerTick;
  secondsPerTick = event.secondsPerTick;

  millis = event.millis;

  bar = event.bar;
  beat = event.beat;
  sixteenth = event.sixteenth;
  tick = event.tick;


  for(let i = startEvent; i < numEvents; i++){

    event = events[i];

    switch(event.type){

      case 0x51:
        bpm = event.data1;
        millis = event.millis;
        millisPerTick = event.millisPerTick;
        secondsPerTick = event.secondsPerTick;

        ticks = event.ticks
        //console.log(millisPerTick,event.millisPerTick);
        //console.log(event);
        break;

      case 0x58:
        factor = event.factor;
        nominator = event.data1;
        denominator = event.data2;
        numSixteenth = event.numSixteenth;
        ticksPerBar = event.ticksPerBar;
        ticksPerBeat = event.ticksPerBeat;
        ticksPerSixteenth = event.ticksPerSixteenth;
        millis = event.millis;

        ticks = event.ticks
        //console.log(nominator,numSixteenth,ticksPerSixteenth);
        //console.log(event);


        break;

      default:
      //case 128:
      //case 144:
        updatePosition(event);
        updateEvent(event);
        result.push(event)
    }


    // if(i < 100 && (event.type === 81 || event.type === 144 || event.type === 128)){
    //   //console.log(i, ticks, diffTicks, millis, millisPerTick)
    //   console.log(event.type, event.millis, 'note', event.data1, 'velo', event.data2)
    // }

    lastEventTick = event.ticks;
  }
  return result;
  //song.lastEventTmp = event;
}


function updateEvent(event){
  //console.log(bar, beat, ticks)
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
  event.seconds = millis / 1000;


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

  // if(millis < 0){
  //   console.log(event)
  // }
}


let midiNoteIndex = 0

export function parseMIDINotes(events){
  let notes = {}
  let n = 0
  for(let event of events){
    if(event.type === 144){
      if(!notes[event.trackId]){
        notes[event.trackId] = {}
      }
      notes[event.trackId][event.data1] = event
    }else if(event.type === 128){
      // let notesInTrack = notes[event.trackId]
      // if(typeof notesInTrack === 'undefined'){
      //   console.info('no note on found event for ', event)
      //   delete notesInTrack[event.data1]
      //   continue
      // }
      let noteOn = notes[event.trackId][event.data1]
      //console.log(event.noteNumber, noteOn);
      let noteOff = event
      if(typeof noteOn === 'undefined'){
        console.info(n++, 'no note on event', event)
        delete notes[event.trackId][event.data1]
        continue
      }
      //let midiNote = new MIDINote(noteOn, noteOff);
      //this._notesMap.set(midiNote.id, midiNote);
      let id = `MN_${midiNoteIndex++}_${new Date().getTime()}`
      noteOn.midiNoteId = id
      noteOn.off = noteOff
      noteOff.midiNoteId = id
      noteOff.on = noteOn
      delete notes[event.trackId][event.data1]
    }
  }
  console.log(notes)
}
