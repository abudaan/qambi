

event -> part -> track -> song

 - event.part
 - event.track
 - event.song
 - event.track.instrument
 - position data (song.millis, song.barsAsString, and so on)



instrument -> sample


**Scheduler**

- schedules events -> adds a key 'time' which is the real time in milliseconds that an event should be processed
- call instrument.processEvent(event) or midiOutput.send(event)
- needs reference to song for:
  - looping (song.loopStart, song.loopEnd, song.doLoop)
  - song.startTime
  - song.metronome (for precounting)




instrument

 - parse samples, create mapping


sample types

 - sinewave
 - simple
 - sustained
 - with release
 - autopanning

sample API

 - start
 - stop
 - update (called every frame, needed for release and autopan)




routing

sequencer.masterGainNode -> song._gainNode [song.setVolume()] -> track.