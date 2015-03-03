'use strict';

import Song from './song.js';

let sequencer = {
    name: 'qambi',
    ui: {},
    util: {},
    ua: '',
    os: '',
    browser: '',
    legacy: false, // true if the browser uses an older version of the WebAudio API, source.noteOn() and source.noteOff instead of source.start() and source.stop()
    record_audio: navigator.getUserMedia !== undefined,
    midi: false,
    webmidi: false,
    webaudio: true,
    jazz: false,
    ogg: false,
    mp3: false,
    bitrate_mp3_encoding: 128,
    debug: 4, // 0 = off, 1 = error, 2 = warn, 3 = info, 4 = log
    debugLevel: 4, // 0 = off, 1 = error, 2 = warn, 3 = info, 4 = log
    pitch: 440,
    bufferTime: 350/1000, //seconds
    autoAdjustBufferTime: false,
    noteNameMode: 'sharp',
    minimalSongLength: 60000, //millis
    pauseOnBlur: false,
    restartOnFocus: true,
    defaultPPQ: 960,
    overrulePPQ: true,
    precision: 3, // means float with precision 3, e.g. 10.437

    activeSongs: {}, // the songs that are currently loaded in memory
    midiInputs: [],
    midiOutputs: []
};

sequencer.createSong = function(config){
    return new Song(config);
}


export default sequencer;
