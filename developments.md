####heartbeat

Heartbeat is a more or less monolithic structure packed with functionality. This makes the code hard to maintain, test and debug, and to extend with external or additional modules. Therefor I have decided to stop the further development of heartbeat and to start with a new codebase under a new name: qambi.


####qambi

Qambi is written in es6 and takes full advantage of the [modules](http://www.2ality.com/2014/09/es6-modules-final.html). The change of the name was necessary because the term 'heartbeat' generally refers to the state of a program, see [wikipedia](http://en.wikipedia.org/wiki/Heartbeat_(computing)). Qambi is a Zulu word meaning creator, inventor or composer.

You can divide qambi in the following categories of functional modules:

1. scheduling of MIDI and audio events
2. editing and manipulating the sequence
3. instruments / generating sound
4. routing, mixing and effects
5. recording
6. import and export
7. GUI components


#####1. scheduling of MIDI and audio events

This is the 'heartbeat' of qambi. The pulse can be controlled by `onEnterFrame()` (default) or `setTimeout()`. On every pulse or frame qambi calculates the following:

- the current position in bars and beats format and in time format
- the new events that are currently under the playhead
- the events that were under the playhead in the former frame
- the new notes and parts that are currently under the playhead
- the notes and parts that were under the playhead in the former frame and still are under the playhead
- the notes and parts that were under the playhead in the former frame, but aren't anymore in the current frame


#####2. editing and manipulating the sequence

This is the actual sequencing functionality and includes functions like `createAudioEvent()`, `addEvents()`, `movePart()`, `deleteTrack()`, and so on.


#####3. instruments / generating sound

The scheduler (see category 1.) sends events to instruments. Instruments can be:

- internal qambi instruments
- external software instruments connected via virtual MIDI ports (virmidi on Linux, IAC on Mac, LoopBe on Windows)
- external hardware instruments connected via MIDI out

The internal qambi instruments can be divided in sample instruments and sound generating instruments. The former requires audio samples to be loaded into qambi, the latter requires computing power. Instruments that use both samples and sound synthesis are possible as well.

Some instruments require to be updated by the scheduler every frame, for instance instruments that have a release envelope and instruments that have effects like autopan.


#####4. routing, mixing and effects

This includes the routing of the audio signal through effects. Every track has a separate output bus that can be mixed by the mixer of the song that the track belongs to.


#####5. recording

This includes both MIDI and audio recording. When recording audio a waveform image of the recording will be generated. Optionally a mp3 or ogg version of the recording can be generated, see next category.


#####6. import and export

Includes import of and export to the following formats:

- MIDI files (type 1.0)
- audio files (wav, mp3, ogg, samples in a Float32Array)
- MusicXML
- sfz files

And all these formats in base64 encoded form.


#####7. GUI components

The key editor, the waveform editor and a score editor. All GUI components will have the option to run headless, which means that you can use helper functions to generate your own GUI component. For instance an iterator function that helps you to generate a grid for your key editor: `getNextGridLine()`, `getPlayheadPostionAtX()`, and so on.


####native vs web

You can use web technologies to create native apps and vice versa, use native technologies to create web apps. However if it comes to apps that rely on performance, native code still holds the best cards.

Techniques:

- PNaCL
- asm.js

Write native, compile to asm.js for Firefox and Edge, compile to PNaCL for Chrome.

Browsers that don't support asm.js and PNaCL (Opera, Safari) can still run the asm.js code albeit slower compared to asm.js enabled browsers.
