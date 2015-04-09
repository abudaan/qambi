'use strict';

require('babelify/polyfill');
import {ajax} from '../src/util';
import parseMIDIFile from '../src/midi_parse';
import createSongFromMIDIFile from '../src/song_from_midifile';

window.onload = function() {
/*
  ajax({url:'../data/JN-3-44.mid', responseType: 'arraybuffer'}).then(
    function onFulfilled(data){
      //console.log(data);
      let result = parseMIDIFile(data);
      console.log(result);
    },

    function onRejected(e){
      console.error(e);
    }
  );
*/


  ajax({url:'../data/JN-3-44.mid', responseType: 'arraybuffer'}).then(
    function onFulfilled(data){
      //console.log(data);
      let song = createSongFromMIDIFile({arraybuffer:data});
      console.log(song);
    },

    function onRejected(e){
      console.error(e);
    }
  );
};