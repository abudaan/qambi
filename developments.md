####heartbeat

Heartbeat is a more or less monolithic structure packed with functionality. This makes the code hard to maintain, test and debug, and to extend with external or additional modules. Therefor I have decided to stop the further development of heartbeat and to start with a new codebase under a new name: qambi.


####qambi

Qambi is written in es6 and takes full advantage of the [modules](http://www.2ality.com/2014/09/es6-modules-final.html). The change of the name was necessary because the term 'heartbeat' generally refers to the state of a program, see [wikipedia](http://en.wikipedia.org/wiki/Heartbeat_(computing)). Qambi is a Zulu word meaning creator, inventor or composer.

You can divide qambi into the following functional modules:

1. scheduling of MIDI and audio events
2. editing and manipulating the sequence
3. instruments / generating sound
4. recording
5. import and export
6. GUI components


#####1. scheduling of MIDI and audio event

This is the 'heartbeat' of qambi. The pulse can be controlled by `onEnterFrame()` (default) or `setTimeout()`. On every pulse (frame) qambi calculates the following:

- the current position in bars and beats format and in time format
- the new events that are currently under the playhead
- the events that were under the playhead in the former frame
- the new notes and parts that are currently under the playhead
- the notes and parts that were under the playhead in the former frame and still are under the playhead
- the notes and parts that were under the playhead in the former frame, but aren't in the current frame


#####2. editing and manipulating the sequence

This is the actual sequencing part and includes functions like `createAudioEvent()`, `addEvents()`, `movePart()`, `deleteTrack()`, and so on.


#####3. instruments / generating sound

The scheduler (see point 1.) sends events to instruments. Instruments can be:

- internal qambi instruments
- external software instruments connected via virtual MIDI ports (virmidi on Linux, IAC on Mac, LoopBe on Windows)
- external hardware instruments connected via MIDI out

The internal qambi instrument can be divided in sample instruments and sound generating instruments. The former require audio samples to be loaded into qambi, the latter requires computing power. Instruments that use both samples and sound synthesis are possible as well.

Some instruments type require to be update by the scheduler every frame, for instance instruments that have a release envelope and instruments that have effects like autopan.


#####4. recording

This includes both MIDI and audio recording. When recording audio a waveform image of the recording will be generated. Optionally a mp3 or ogg version of the recording can be generated, see next point.


#####5. import and export

Includes import of and export to the following formats:

- MIDI files (type 1.0)
- audio files (wav, mp3, ogg, samples in a Float32Array)
- MusicXML
- sfz files

And all these formats in base64 encoded form.


#####6. GUI components

The key editor, the waveform editor and a score editor. All GUI components will have the option to run headless, which means that you can use helper functions to generate your own GUI component. For instance an iterator function that helps you to generate a grid for your key editor: `getNextGridLine()`.