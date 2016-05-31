(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var sequencer = window.sequencer;

document.addEventListener('DOMContentLoaded', function () {

  // load a midi file
  sequencer.addMidiFile({ url: 'http://abumarkub.net/heartbeatjs/assets/minute_waltz.mid' });
  // load an asset pack, this pack contains a piano
  sequencer.addAssetPack({ url: 'http://abumarkub.net/heartbeatjs/assets/asset_pack_basic.json' }, init);

  function init() {

    var midiFile = sequencer.getMidiFile('minute_waltz');
    var song = sequencer.createSong(midiFile);
    var piano = sequencer.createInstrument('piano');

    // set all tracks of the song to use 'piano'
    song.tracks.forEach(function (track) {
      track.setInstrument(piano);
    });

    // transport controls
    var btnPlay = document.getElementById('play');
    var btnPause = document.getElementById('pause');
    var btnStop = document.getElementById('stop');

    btnPlay.disabled = false;
    btnPause.disabled = false;
    btnStop.disabled = false;

    btnPlay.addEventListener('click', function () {
      song.play();
    });

    btnPause.addEventListener('click', function () {
      song.pause();
    });

    btnStop.addEventListener('click', function () {
      song.stop();
    });

    // very rudimental on-screen keyboard
    var keys = {};
    var keyNames = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
    keyNames.forEach(function (key) {

      var btnKey = document.getElementById(key);
      btnKey.disabled = false;
      keys[key] = btnKey;

      btnKey.addEventListener('mousedown', startNote, false);
      btnKey.addEventListener('mouseup', stopNote, false);
      btnKey.addEventListener('mouseout', stopNote, false);
    });

    // both the on-screen keyboard and the connected external MIDI devices play back over the first track of the song (could be any track btw)
    var track = song.tracks[0];
    track.monitor = true;
    track.setMidiInput('all');
    track.setInstrument('piano');

    function startNote() {
      var noteNumber = sequencer.getNoteNumber(this.id);
      track.processMidiEvent(sequencer.createMidiEvent(0, sequencer.NOTE_ON, noteNumber, 100));
      //sequencer.processEvent(sequencer.createMidiEvent(0, sequencer.NOTE_ON, noteNumber, 100), 120, 'piano')
    }

    function stopNote() {
      var noteNumber = sequencer.getNoteNumber(this.id);
      track.processMidiEvent(sequencer.createMidiEvent(0, sequencer.NOTE_OFF, noteNumber));
      //sequencer.processEvent(sequencer.createMidiEvent(0, sequencer.NOTE_OFF, noteNumber), 120, 'piano')
    }

    function updateOnScreenKeyboard(event) {
      var btn = keys[event.note.fullName];
      // check if this key exists on the on-screen keyboard
      if (btn) {
        btn.className = event.type === 144 ? 'key-down' : 'key-up';
      }
    }

    // add listeners for all noteon and noteoff events when an external MIDI keyboard or the on-screen keyboard is played
    track.addMidiEventListener(sequencer.NOTE_ON, updateOnScreenKeyboard);
    track.addMidiEventListener(sequencer.NOTE_OFF, updateOnScreenKeyboard);

    // add listeners for all noteon and noteoff events during playback
    song.addEventListener('event', 'type = 144', updateOnScreenKeyboard);
    song.addEventListener('event', 'type = 128', updateOnScreenKeyboard);

    // set all keys of the on-screen keyboard to the up state when the song stops or pauses
    song.addEventListener('stop', function () {
      for (var key in keys) {
        if (keys.hasOwnProperty(key)) {
          key.className = 'key-up';
        }
      }
    });

    song.addEventListener('pause', function () {
      for (var key in keys) {
        if (keys.hasOwnProperty(key)) {
          key.className = 'key-up';
        }
      }
    });
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxZQUFZLE9BQU8sU0FBdkI7O0FBRUEsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVTs7O0FBR3RELFlBQVUsV0FBVixDQUFzQixFQUFDLEtBQUssMERBQU4sRUFBdEI7O0FBRUEsWUFBVSxZQUFWLENBQXVCLEVBQUMsS0FBSywrREFBTixFQUF2QixFQUErRixJQUEvRjs7QUFFQSxXQUFTLElBQVQsR0FBZTs7QUFFYixRQUFJLFdBQVcsVUFBVSxXQUFWLENBQXNCLGNBQXRCLENBQWY7QUFDQSxRQUFJLE9BQU8sVUFBVSxVQUFWLENBQXFCLFFBQXJCLENBQVg7QUFDQSxRQUFJLFFBQVEsVUFBVSxnQkFBVixDQUEyQixPQUEzQixDQUFaOzs7QUFHQSxTQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLFVBQVMsS0FBVCxFQUFlO0FBQ2pDLFlBQU0sYUFBTixDQUFvQixLQUFwQjtBQUNELEtBRkQ7OztBQUtBLFFBQUksVUFBVSxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBZDtBQUNBLFFBQUksV0FBVyxTQUFTLGNBQVQsQ0FBd0IsT0FBeEIsQ0FBZjtBQUNBLFFBQUksVUFBVSxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBZDs7QUFFQSxZQUFRLFFBQVIsR0FBbUIsS0FBbkI7QUFDQSxhQUFTLFFBQVQsR0FBb0IsS0FBcEI7QUFDQSxZQUFRLFFBQVIsR0FBbUIsS0FBbkI7O0FBRUEsWUFBUSxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxZQUFVO0FBQzFDLFdBQUssSUFBTDtBQUNELEtBRkQ7O0FBSUEsYUFBUyxnQkFBVCxDQUEwQixPQUExQixFQUFtQyxZQUFVO0FBQzNDLFdBQUssS0FBTDtBQUNELEtBRkQ7O0FBSUEsWUFBUSxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxZQUFVO0FBQzFDLFdBQUssSUFBTDtBQUNELEtBRkQ7OztBQU1BLFFBQUksT0FBTyxFQUFYO0FBQ0EsUUFBSSxXQUFXLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxJQUFiLEVBQW1CLElBQW5CLEVBQXlCLElBQXpCLEVBQStCLElBQS9CLEVBQXFDLElBQXJDLENBQWY7QUFDQSxhQUFTLE9BQVQsQ0FBaUIsVUFBUyxHQUFULEVBQWE7O0FBRTVCLFVBQUksU0FBUyxTQUFTLGNBQVQsQ0FBd0IsR0FBeEIsQ0FBYjtBQUNBLGFBQU8sUUFBUCxHQUFrQixLQUFsQjtBQUNBLFdBQUssR0FBTCxJQUFZLE1BQVo7O0FBRUEsYUFBTyxnQkFBUCxDQUF3QixXQUF4QixFQUFxQyxTQUFyQyxFQUFnRCxLQUFoRDtBQUNBLGFBQU8sZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUMsUUFBbkMsRUFBNkMsS0FBN0M7QUFDQSxhQUFPLGdCQUFQLENBQXdCLFVBQXhCLEVBQW9DLFFBQXBDLEVBQThDLEtBQTlDO0FBQ0QsS0FURDs7O0FBYUEsUUFBSSxRQUFRLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBWjtBQUNBLFVBQU0sT0FBTixHQUFnQixJQUFoQjtBQUNBLFVBQU0sWUFBTixDQUFtQixLQUFuQjtBQUNBLFVBQU0sYUFBTixDQUFvQixPQUFwQjs7QUFFQSxhQUFTLFNBQVQsR0FBb0I7QUFDbEIsVUFBSSxhQUFhLFVBQVUsYUFBVixDQUF3QixLQUFLLEVBQTdCLENBQWpCO0FBQ0EsWUFBTSxnQkFBTixDQUF1QixVQUFVLGVBQVYsQ0FBMEIsQ0FBMUIsRUFBNkIsVUFBVSxPQUF2QyxFQUFnRCxVQUFoRCxFQUE0RCxHQUE1RCxDQUF2Qjs7QUFFRDs7QUFFRCxhQUFTLFFBQVQsR0FBbUI7QUFDakIsVUFBSSxhQUFhLFVBQVUsYUFBVixDQUF3QixLQUFLLEVBQTdCLENBQWpCO0FBQ0EsWUFBTSxnQkFBTixDQUF1QixVQUFVLGVBQVYsQ0FBMEIsQ0FBMUIsRUFBNkIsVUFBVSxRQUF2QyxFQUFpRCxVQUFqRCxDQUF2Qjs7QUFFRDs7QUFFRCxhQUFTLHNCQUFULENBQWdDLEtBQWhDLEVBQXNDO0FBQ3BDLFVBQUksTUFBTSxLQUFLLE1BQU0sSUFBTixDQUFXLFFBQWhCLENBQVY7O0FBRUEsVUFBRyxHQUFILEVBQU87QUFDTCxZQUFJLFNBQUosR0FBZ0IsTUFBTSxJQUFOLEtBQWUsR0FBZixHQUFxQixVQUFyQixHQUFrQyxRQUFsRDtBQUNEO0FBQ0Y7OztBQUdELFVBQU0sb0JBQU4sQ0FBMkIsVUFBVSxPQUFyQyxFQUE4QyxzQkFBOUM7QUFDQSxVQUFNLG9CQUFOLENBQTJCLFVBQVUsUUFBckMsRUFBK0Msc0JBQS9DOzs7QUFHQSxTQUFLLGdCQUFMLENBQXNCLE9BQXRCLEVBQStCLFlBQS9CLEVBQTZDLHNCQUE3QztBQUNBLFNBQUssZ0JBQUwsQ0FBc0IsT0FBdEIsRUFBK0IsWUFBL0IsRUFBNkMsc0JBQTdDOzs7QUFHQSxTQUFLLGdCQUFMLENBQXNCLE1BQXRCLEVBQThCLFlBQVU7QUFDdEMsV0FBSSxJQUFJLEdBQVIsSUFBZSxJQUFmLEVBQW9CO0FBQ2xCLFlBQUcsS0FBSyxjQUFMLENBQW9CLEdBQXBCLENBQUgsRUFBNEI7QUFDMUIsY0FBSSxTQUFKLEdBQWdCLFFBQWhCO0FBQ0Q7QUFDRjtBQUNGLEtBTkQ7O0FBUUEsU0FBSyxnQkFBTCxDQUFzQixPQUF0QixFQUErQixZQUFVO0FBQ3ZDLFdBQUksSUFBSSxHQUFSLElBQWUsSUFBZixFQUFvQjtBQUNsQixZQUFHLEtBQUssY0FBTCxDQUFvQixHQUFwQixDQUFILEVBQTRCO0FBQzFCLGNBQUksU0FBSixHQUFnQixRQUFoQjtBQUNEO0FBQ0Y7QUFDRixLQU5EO0FBT0Q7QUFDRixDQTFHRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgc2VxdWVuY2VyID0gd2luZG93LnNlcXVlbmNlclxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblxuICAvLyBsb2FkIGEgbWlkaSBmaWxlXG4gIHNlcXVlbmNlci5hZGRNaWRpRmlsZSh7dXJsOiAnaHR0cDovL2FidW1hcmt1Yi5uZXQvaGVhcnRiZWF0anMvYXNzZXRzL21pbnV0ZV93YWx0ei5taWQnfSlcbiAgLy8gbG9hZCBhbiBhc3NldCBwYWNrLCB0aGlzIHBhY2sgY29udGFpbnMgYSBwaWFub1xuICBzZXF1ZW5jZXIuYWRkQXNzZXRQYWNrKHt1cmw6ICdodHRwOi8vYWJ1bWFya3ViLm5ldC9oZWFydGJlYXRqcy9hc3NldHMvYXNzZXRfcGFja19iYXNpYy5qc29uJ30sIGluaXQpXG5cbiAgZnVuY3Rpb24gaW5pdCgpe1xuXG4gICAgdmFyIG1pZGlGaWxlID0gc2VxdWVuY2VyLmdldE1pZGlGaWxlKCdtaW51dGVfd2FsdHonKVxuICAgIHZhciBzb25nID0gc2VxdWVuY2VyLmNyZWF0ZVNvbmcobWlkaUZpbGUpXG4gICAgdmFyIHBpYW5vID0gc2VxdWVuY2VyLmNyZWF0ZUluc3RydW1lbnQoJ3BpYW5vJylcblxuICAgIC8vIHNldCBhbGwgdHJhY2tzIG9mIHRoZSBzb25nIHRvIHVzZSAncGlhbm8nXG4gICAgc29uZy50cmFja3MuZm9yRWFjaChmdW5jdGlvbih0cmFjayl7XG4gICAgICB0cmFjay5zZXRJbnN0cnVtZW50KHBpYW5vKVxuICAgIH0pXG5cbiAgICAvLyB0cmFuc3BvcnQgY29udHJvbHNcbiAgICB2YXIgYnRuUGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5JylcbiAgICB2YXIgYnRuUGF1c2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGF1c2UnKVxuICAgIHZhciBidG5TdG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3AnKVxuXG4gICAgYnRuUGxheS5kaXNhYmxlZCA9IGZhbHNlXG4gICAgYnRuUGF1c2UuZGlzYWJsZWQgPSBmYWxzZVxuICAgIGJ0blN0b3AuZGlzYWJsZWQgPSBmYWxzZVxuXG4gICAgYnRuUGxheS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICBzb25nLnBsYXkoKVxuICAgIH0pXG5cbiAgICBidG5QYXVzZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICBzb25nLnBhdXNlKClcbiAgICB9KVxuXG4gICAgYnRuU3RvcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICBzb25nLnN0b3AoKVxuICAgIH0pXG5cblxuICAgIC8vIHZlcnkgcnVkaW1lbnRhbCBvbi1zY3JlZW4ga2V5Ym9hcmRcbiAgICBsZXQga2V5cyA9IHt9XG4gICAgbGV0IGtleU5hbWVzID0gWydDNCcsICdENCcsICdFNCcsICdGNCcsICdHNCcsICdBNCcsICdCNCddXG4gICAga2V5TmFtZXMuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuXG4gICAgICB2YXIgYnRuS2V5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoa2V5KVxuICAgICAgYnRuS2V5LmRpc2FibGVkID0gZmFsc2VcbiAgICAgIGtleXNba2V5XSA9IGJ0bktleVxuXG4gICAgICBidG5LZXkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgc3RhcnROb3RlLCBmYWxzZSlcbiAgICAgIGJ0bktleS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcE5vdGUsIGZhbHNlKVxuICAgICAgYnRuS2V5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0Jywgc3RvcE5vdGUsIGZhbHNlKVxuICAgIH0pXG5cblxuICAgIC8vIGJvdGggdGhlIG9uLXNjcmVlbiBrZXlib2FyZCBhbmQgdGhlIGNvbm5lY3RlZCBleHRlcm5hbCBNSURJIGRldmljZXMgcGxheSBiYWNrIG92ZXIgdGhlIGZpcnN0IHRyYWNrIG9mIHRoZSBzb25nIChjb3VsZCBiZSBhbnkgdHJhY2sgYnR3KVxuICAgIHZhciB0cmFjayA9IHNvbmcudHJhY2tzWzBdXG4gICAgdHJhY2subW9uaXRvciA9IHRydWVcbiAgICB0cmFjay5zZXRNaWRpSW5wdXQoJ2FsbCcpXG4gICAgdHJhY2suc2V0SW5zdHJ1bWVudCgncGlhbm8nKVxuXG4gICAgZnVuY3Rpb24gc3RhcnROb3RlKCl7XG4gICAgICB2YXIgbm90ZU51bWJlciA9IHNlcXVlbmNlci5nZXROb3RlTnVtYmVyKHRoaXMuaWQpXG4gICAgICB0cmFjay5wcm9jZXNzTWlkaUV2ZW50KHNlcXVlbmNlci5jcmVhdGVNaWRpRXZlbnQoMCwgc2VxdWVuY2VyLk5PVEVfT04sIG5vdGVOdW1iZXIsIDEwMCkpXG4gICAgICAvL3NlcXVlbmNlci5wcm9jZXNzRXZlbnQoc2VxdWVuY2VyLmNyZWF0ZU1pZGlFdmVudCgwLCBzZXF1ZW5jZXIuTk9URV9PTiwgbm90ZU51bWJlciwgMTAwKSwgMTIwLCAncGlhbm8nKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0b3BOb3RlKCl7XG4gICAgICB2YXIgbm90ZU51bWJlciA9IHNlcXVlbmNlci5nZXROb3RlTnVtYmVyKHRoaXMuaWQpXG4gICAgICB0cmFjay5wcm9jZXNzTWlkaUV2ZW50KHNlcXVlbmNlci5jcmVhdGVNaWRpRXZlbnQoMCwgc2VxdWVuY2VyLk5PVEVfT0ZGLCBub3RlTnVtYmVyKSlcbiAgICAgIC8vc2VxdWVuY2VyLnByb2Nlc3NFdmVudChzZXF1ZW5jZXIuY3JlYXRlTWlkaUV2ZW50KDAsIHNlcXVlbmNlci5OT1RFX09GRiwgbm90ZU51bWJlciksIDEyMCwgJ3BpYW5vJylcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVPblNjcmVlbktleWJvYXJkKGV2ZW50KXtcbiAgICAgIHZhciBidG4gPSBrZXlzW2V2ZW50Lm5vdGUuZnVsbE5hbWVdXG4gICAgICAvLyBjaGVjayBpZiB0aGlzIGtleSBleGlzdHMgb24gdGhlIG9uLXNjcmVlbiBrZXlib2FyZFxuICAgICAgaWYoYnRuKXtcbiAgICAgICAgYnRuLmNsYXNzTmFtZSA9IGV2ZW50LnR5cGUgPT09IDE0NCA/ICdrZXktZG93bicgOiAna2V5LXVwJ1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGFkZCBsaXN0ZW5lcnMgZm9yIGFsbCBub3Rlb24gYW5kIG5vdGVvZmYgZXZlbnRzIHdoZW4gYW4gZXh0ZXJuYWwgTUlESSBrZXlib2FyZCBvciB0aGUgb24tc2NyZWVuIGtleWJvYXJkIGlzIHBsYXllZFxuICAgIHRyYWNrLmFkZE1pZGlFdmVudExpc3RlbmVyKHNlcXVlbmNlci5OT1RFX09OLCB1cGRhdGVPblNjcmVlbktleWJvYXJkKVxuICAgIHRyYWNrLmFkZE1pZGlFdmVudExpc3RlbmVyKHNlcXVlbmNlci5OT1RFX09GRiwgdXBkYXRlT25TY3JlZW5LZXlib2FyZClcblxuICAgIC8vIGFkZCBsaXN0ZW5lcnMgZm9yIGFsbCBub3Rlb24gYW5kIG5vdGVvZmYgZXZlbnRzIGR1cmluZyBwbGF5YmFja1xuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignZXZlbnQnLCAndHlwZSA9IDE0NCcsIHVwZGF0ZU9uU2NyZWVuS2V5Ym9hcmQpXG4gICAgc29uZy5hZGRFdmVudExpc3RlbmVyKCdldmVudCcsICd0eXBlID0gMTI4JywgdXBkYXRlT25TY3JlZW5LZXlib2FyZClcblxuICAgIC8vIHNldCBhbGwga2V5cyBvZiB0aGUgb24tc2NyZWVuIGtleWJvYXJkIHRvIHRoZSB1cCBzdGF0ZSB3aGVuIHRoZSBzb25nIHN0b3BzIG9yIHBhdXNlc1xuICAgIHNvbmcuYWRkRXZlbnRMaXN0ZW5lcignc3RvcCcsIGZ1bmN0aW9uKCl7XG4gICAgICBmb3IodmFyIGtleSBpbiBrZXlzKXtcbiAgICAgICAgaWYoa2V5cy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgICAgICBrZXkuY2xhc3NOYW1lID0gJ2tleS11cCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBzb25nLmFkZEV2ZW50TGlzdGVuZXIoJ3BhdXNlJywgZnVuY3Rpb24oKXtcbiAgICAgIGZvcih2YXIga2V5IGluIGtleXMpe1xuICAgICAgICBpZihrZXlzLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgICAgIGtleS5jbGFzc05hbWUgPSAna2V5LXVwJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufSlcbiJdfQ==
