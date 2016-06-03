(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  // qambi is a global variable
  qambi.init().then(function () {

    // Song, Track, Part and so on are global variables as well because the globals.js script is embedded in the html
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsU0FBUyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVTs7O0FBR3RELFFBQU0sSUFBTixHQUNDLElBREQsQ0FDTSxZQUFVOzs7QUFHZCxRQUFJLE9BQU8sSUFBSSxJQUFKLEVBQVg7QUFDQSxRQUFJLFFBQVEsSUFBSSxLQUFKLEVBQVo7QUFDQSxRQUFJLE9BQU8sSUFBSSxJQUFKLEVBQVg7QUFDQSxRQUFJLFFBQVEsSUFBSSxXQUFKLEVBQVo7O0FBRUEsU0FBSyxTQUFMLENBQWUsSUFBSSxTQUFKLENBQWMsQ0FBZCxFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixHQUExQixDQUFmLEVBQStDLElBQUksU0FBSixDQUFjLEdBQWQsRUFBbUIsR0FBbkIsRUFBd0IsRUFBeEIsRUFBNEIsQ0FBNUIsQ0FBL0M7QUFDQSxVQUFNLGFBQU4sQ0FBb0IsS0FBcEI7QUFDQSxVQUFNLFFBQU4sQ0FBZSxJQUFmO0FBQ0EsU0FBSyxTQUFMLENBQWUsS0FBZjtBQUNBLFNBQUssTUFBTDtBQUNBLFNBQUssSUFBTDtBQUNELEdBZkQ7QUFnQkQsQ0FuQkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG5cbiAgLy8gcWFtYmkgaXMgYSBnbG9iYWwgdmFyaWFibGVcbiAgcWFtYmkuaW5pdCgpXG4gIC50aGVuKGZ1bmN0aW9uKCl7XG5cbiAgICAvLyBTb25nLCBUcmFjaywgUGFydCBhbmQgc28gb24gYXJlIGdsb2JhbCB2YXJpYWJsZXMgYXMgd2VsbCBiZWNhdXNlIHRoZSBnbG9iYWxzLmpzIHNjcmlwdCBpcyBlbWJlZGRlZCBpbiB0aGUgaHRtbFxuICAgIGxldCBzb25nID0gbmV3IFNvbmcoKVxuICAgIGxldCB0cmFjayA9IG5ldyBUcmFjaygpXG4gICAgbGV0IHBhcnQgPSBuZXcgUGFydCgpXG4gICAgdmFyIHN5bnRoID0gbmV3IFNpbXBsZVN5bnRoKClcblxuICAgIHBhcnQuYWRkRXZlbnRzKG5ldyBNSURJRXZlbnQoMCwgMTQ0LCA2MCwgMTAwKSwgbmV3IE1JRElFdmVudCg5NjAsIDEyOCwgNjAsIDApKVxuICAgIHRyYWNrLnNldEluc3RydW1lbnQoc3ludGgpXG4gICAgdHJhY2suYWRkUGFydHMocGFydClcbiAgICBzb25nLmFkZFRyYWNrcyh0cmFjaylcbiAgICBzb25nLnVwZGF0ZSgpXG4gICAgc29uZy5wbGF5KClcbiAgfSlcbn0pXG4iXX0=
