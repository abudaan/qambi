(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  // qambi is a global variable
  qambi.init().then(function () {

    var song = new Song();
    var track = new Track();
    var part = new Part();
    var synth = new SimpleSynth();

    part.addEvents(new MIDIEvent(0, 144, 60, 100), new MIDIEvent(960, 128, 60, 0));
    track.setInstrument(synth);
    track.addParts(part);
    song.addTracks(track);
    song.update();
    song.play();
  });
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVTs7O0FBR3RELFFBQU0sSUFBTixHQUNDLElBREQsQ0FDTSxZQUFVOztBQUVkLFFBQUksT0FBTyxJQUFJLElBQUosRUFBWDtBQUNBLFFBQUksUUFBUSxJQUFJLEtBQUosRUFBWjtBQUNBLFFBQUksT0FBTyxJQUFJLElBQUosRUFBWDtBQUNBLFFBQUksUUFBUSxJQUFJLFdBQUosRUFBWjs7QUFFQSxTQUFLLFNBQUwsQ0FBZSxJQUFJLFNBQUosQ0FBYyxDQUFkLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEdBQTFCLENBQWYsRUFBK0MsSUFBSSxTQUFKLENBQWMsR0FBZCxFQUFtQixHQUFuQixFQUF3QixFQUF4QixFQUE0QixDQUE1QixDQUEvQztBQUNBLFVBQU0sYUFBTixDQUFvQixLQUFwQjtBQUNBLFVBQU0sUUFBTixDQUFlLElBQWY7QUFDQSxTQUFLLFNBQUwsQ0FBZSxLQUFmO0FBQ0EsU0FBSyxNQUFMO0FBQ0EsU0FBSyxJQUFMO0FBRUQsR0FmRDtBQWlCRCxDQXBCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblxuICAvLyBxYW1iaSBpcyBhIGdsb2JhbCB2YXJpYWJsZVxuICBxYW1iaS5pbml0KClcbiAgLnRoZW4oZnVuY3Rpb24oKXtcblxuICAgIGxldCBzb25nID0gbmV3IFNvbmcoKVxuICAgIGxldCB0cmFjayA9IG5ldyBUcmFjaygpXG4gICAgbGV0IHBhcnQgPSBuZXcgUGFydCgpXG4gICAgdmFyIHN5bnRoID0gbmV3IFNpbXBsZVN5bnRoKClcblxuICAgIHBhcnQuYWRkRXZlbnRzKG5ldyBNSURJRXZlbnQoMCwgMTQ0LCA2MCwgMTAwKSwgbmV3IE1JRElFdmVudCg5NjAsIDEyOCwgNjAsIDApKVxuICAgIHRyYWNrLnNldEluc3RydW1lbnQoc3ludGgpXG4gICAgdHJhY2suYWRkUGFydHMocGFydClcbiAgICBzb25nLmFkZFRyYWNrcyh0cmFjaylcbiAgICBzb25nLnVwZGF0ZSgpXG4gICAgc29uZy5wbGF5KClcblxuICB9KVxuXG59KVxuIl19
