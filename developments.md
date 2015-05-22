####heartbeat

Heartbeat has become a more or less monolithic structure packed with functionality. This makes the code a bit hard to maintain, test and debug, and quite hard to extend with external or additional modules. Therefor I have decided to stop the further development of heartbeat and to start with a new codebase under a new name: qambi.


####qambi

Qambi is work in progress, I think (I hope) it will be finished by the end of this summer. Not all functionality of heartbeat will be ported to qambi. For instance heartbeat has a lot of functions to load assets such as instruments, assetpacks and samplepacks. All this functionality will be completely removed; qambi does not impose a certain format on your assets, you are free to choose a format that suits your needs the best, and write your own loading methods for your assets.

Qambi is written in es6 and takes full advantage of its [modules](http://www.2ality.com/2014/09/es6-modules-final.html). The change of the name was necessary because the term 'heartbeat' generally refers to the state of a program, see [wikipedia](http://en.wikipedia.org/wiki/Heartbeat_(computing)). Qambi is a Zulu word meaning creator, inventor or composer.

You can divide qambi in the following categories of functionality:

1. scheduling of MIDI and audio events
2. editing and manipulating the sequence
3. instruments / generating sound
4. routing, mixing and channel effects
5. recording
6. import and export
7. GUI components
8. utilities

Each of this categories consists of one or more modules. Some categories are more likely to be extended by third party modules than other, but all categories are open for additional modules. Moreover, the existing modules are easy to extend.

Apart from these categories, there are a few core modules that bundle all modules together.

#####1. scheduling of MIDI and audio events

This is the 'heartbeat' of qambi. The pulse can be controlled by `onEnterFrame()` (default) or `setTimeout()`. On every pulse or frame qambi calculates the following:

- the current position in bars and beats format and in time format
- the events that need to be scheduled (ie send events to instruments)
- the new events that are currently under the playhead
- the events that were under the playhead in the former frame
- the new notes and parts that are currently under the playhead
- the notes and parts that were under the playhead in the former frame and still are under the playhead
- the notes and parts that were under the playhead in the former frame, but aren't anymore in the current frame

Current modules are Scheduler, Heartbeat and Playhead.

#####2. editing and manipulating the sequence

This is the actual sequencing functionality and includes functions like `createAudioEvent()`, `addEvents()`, `movePart()`, `deleteTrack()`, and so on. Current modules are Song, Track, Part, MIDIEvent, MIDINote and AudioEvent.


#####3. instruments / generating sound

The scheduler (see category 1.) sends events to instruments. Instruments can be:

- internal qambi instruments
- external software instruments connected via virtual MIDI ports (virmidi on Linux, IAC on Mac, LoopBe on Windows)
- external hardware instruments connected via MIDI out

The internal qambi instruments can be divided in sample instruments and sound generating instruments. The former requires audio samples to be loaded into qambi, the latter requires computing power. Instruments that use both samples and sound synthesis are possible as well.

Some instruments require to be updated by the scheduler every frame, for instance instruments that have a release envelope and instruments that have effects like autopan.

Current modules are Instrument and Sample.

#####4. routing, mixing and effects

This includes the routing of the audio signal through effects. Every track has a separate output bus that can be mixed by the mixer of the song that the track belongs to.

Not yet implemented in qambi.

#####5. recording

This includes both MIDI and audio recording. When recording audio a waveform image of the recording will be generated. Optionally a mp3 or ogg version of the recording can be generated, see next category.

Not yet implemented in qambi.

#####6. import and export

Includes import of and export to the following formats:

- MIDI files (type 1.0)
- audio files (wav, mp3, ogg, samples in a Float32Array)
- MusicXML
- sfz files

And all these formats in base64 encoded form.

Current module: MIDIStream.


#####7. GUI components

The key editor, the waveform editor and the score editor. All GUI components will have the option to run headless, which means that you can use helper functions to generate your own GUI component. For instance an iterator function that helps you to generate a grid for your key editor: `getNextGridLine()`, `getPlayheadPostionAtX()`, and so on.

Not yet implemented in qambi.

#####8. utilities

This category contains any type of functionality that you may find handy. Currently there are for instance utility functions for loading files, decoding audio data, converting data from base64 to binary and so on.

Current modules: Note, Polyfill and Util (a collection of non-related utilities).

####native vs web

The border between web and native apps has become a bit blurry: you can use web technologies to create native apps and native technologies to create web apps. However when it comes to applications that rely on performance such as running complex waveshaping algorithms, native code holds the best cards.

There are 2 main lines of development that allow native code to run in a browser:

- asm.js (Mozilla)
- PNaCL (Google)

<!--
Both technologies run native code about 1,5 to 2 times slower compared to running the code directly on the OS (this is *very* fast because regular javascript is at least 5 times slower than native code).
-->

Asm.js is a subset of javascript and runs in every browser. PNaCL (Portable Native Client) is a bitcode executable that runs inside Chrome's native client (NaCL). NaCL is enabled by default since Chrome 31 but it only works in the desktop version of the browser.

Both technologies offer a toolchain for compiling C/C++ code, both technologies are open source.

PNaCL runs native code at near native speed. Asm.js is a bit behind: it runs native code at a factor of 1,3 - 2 slowdown over native speed, but browser vendors are working hard to make asm.js run faster.

The big advantage of PNaCL that it supports multi-threaded C/C++ code. You can make your asm.js code multi-threaded as well by using webworkers but you can not compile multi-threaded C/C++ code directly to multi-threaded asm.js.

The big advantage of asm.js is that it runs in any browser and that all major browser vendors are working on optimizations for asm.js to make it run faster. The fact that Microsoft has chosen to support asm.js in their new browser Edge will most likely stir up the competition between vendors and speed up further optimization of asm.js.

An additional advantage of code in C/C++ is that you can compile it to a native application as well. For instance: because there is no support for MIDI i/o in any browser on iOS, you could compile the full C/C++ codebase to a native iOS app that can interact with connected MIDI devices.


####asm.js and qambi

Because qambi has been set up in a modular way, it is very easy to integrate C/C++ modules. Actually, heartbeat already uses a C++ module for the conversion of wav files to mp3; this is done by an [asm.js port of libmp3lame](https://github.com/akrennmair/libmp3lame-js).

Modules that would benefit the most from being ported to C/C++ are modules that perform heavy operations. For instance instruments that transpose samples instead of loading a sample for every note from the server, or channel effect modules that perform real time audio manipulations. But also the Scheduler will probably be more efficient when written in C/C++.

Modules can be replaced by C/C++ versions on the way until at some point in the future the whole codebase is written in C/C++


####summary

Music applications perform better when written in native code. With asm.js you can run native code in a browser and mix it with regular javascript. All browsers support asm.js and the 3 major vendors are putting effort into making asm.js run faster in their browsers.

A C/C++ codebase has multiple compile targets: besides compiling to asm.js you can compile it to PNaCL and to a native application.


####links for further exploration

 - [asm.js vs pnacl](http://games.greggman.com/game/thoughts-on-asm-js-vs-pnacl/) (the comments are very interesting as well)
 - [asm.js official site](http://asmjs.org/)
 - [asm.js](http://mozakai.blogspot.nl/2013/06/what-asmjs-is-and-what-asmjs-isnt.html)
 - [asm.js AOT compiler benchmarks](https://blog.mozilla.org/luke/2014/01/14/asm-js-aot-compilation-and-startup-performance/)
 - [asm.js on Wikipedia](http://en.wikipedia.org/wiki/Asm.js)
 - [asm.js performance in all browsers](https://hacks.mozilla.org/2015/03/asm-speedups-everywhere/)
 - [asm.js support in Chrome and Edge](http://jaxenter.com/ie-chrome-set-support-asm-js-114783.html)
 - [JIT](http://en.wikipedia.org/wiki/Just-in-time_compilation)
 - [type interference](http://en.wikipedia.org/wiki/Type_inference)
 - [intermediate representation](http://cs.lmu.edu/~ray/notes/ir/)
 - [baseline compiler in Firefox](https://blog.mozilla.org/javascript/2013/04/05/the-baseline-compiler-has-landed/)
 - [crankshaft compiler in Chrome](http://jayconrod.com/posts/54/a-tour-of-v8-crankshaft-the-optimizing-compiler)
 - [javascript performance](http://www.javaworld.com/article/2078869/mobile-java/dan-bricklin--javascript-beats-native-code-for-mobile.html)


<!--

Firefox, Chrome and Edge even have a special directive `'use asm';` that instructs the JIT compiler of the browser to skip the bytecode optimization loop and to generate the intermediate representation (IR) directly, which is much faster.

For regular javascript the bytecode optimization loop performs type interference, which is necessary because javascipt is a dynamically typed language. Simply put: the compiler deducts the type of your variables by running the code a few times and then optimizes the code based on the deducted type. For a more in-depth explanation see the links below.

-->