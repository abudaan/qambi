(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

requirejs.config({
  paths: {
    qambi: '//qambi.org/dist/qambi-umd.min'
  }
});

require(['qambi'], function (qambi) {

  qambi.init().then(function () {
    var song = new qambi.Song();
    var track = new qambi.Track();
    var part = new qambi.Part();
    var synth = new qambi.SimpleSynth();

    part.addEvents(new qambi.MIDIEvent(0, 144, 60, 100), new qambi.MIDIEvent(960, 128, 60, 0));
    track.setInstrument(synth);
    track.addParts(part);
    song.addTracks(track);
    song.update();
    song.play();
  });
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxVQUFVLE1BQVYsQ0FBaUI7QUFDZixTQUFPO0FBQ0wsV0FBTztBQURGO0FBRFEsQ0FBakI7O0FBTUEsUUFBUSxDQUFDLE9BQUQsQ0FBUixFQUFtQixVQUFTLEtBQVQsRUFBZTs7QUFFaEMsUUFBTSxJQUFOLEdBQ0MsSUFERCxDQUNNLFlBQVc7QUFDZixRQUFJLE9BQU8sSUFBSSxNQUFNLElBQVYsRUFBWDtBQUNBLFFBQUksUUFBUSxJQUFJLE1BQU0sS0FBVixFQUFaO0FBQ0EsUUFBSSxPQUFPLElBQUksTUFBTSxJQUFWLEVBQVg7QUFDQSxRQUFJLFFBQVEsSUFBSSxNQUFNLFdBQVYsRUFBWjs7QUFFQSxTQUFLLFNBQUwsQ0FBZSxJQUFJLE1BQU0sU0FBVixDQUFvQixDQUFwQixFQUF1QixHQUF2QixFQUE0QixFQUE1QixFQUFnQyxHQUFoQyxDQUFmLEVBQXFELElBQUksTUFBTSxTQUFWLENBQW9CLEdBQXBCLEVBQXlCLEdBQXpCLEVBQThCLEVBQTlCLEVBQWtDLENBQWxDLENBQXJEO0FBQ0EsVUFBTSxhQUFOLENBQW9CLEtBQXBCO0FBQ0EsVUFBTSxRQUFOLENBQWUsSUFBZjtBQUNBLFNBQUssU0FBTCxDQUFlLEtBQWY7QUFDQSxTQUFLLE1BQUw7QUFDQSxTQUFLLElBQUw7QUFDRCxHQWJEO0FBY0QsQ0FoQkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZWpzLmNvbmZpZyh7XG4gIHBhdGhzOiB7XG4gICAgcWFtYmk6ICcvL3FhbWJpLm9yZy9kaXN0L3FhbWJpLXVtZC5taW4nXG4gIH1cbn0pXG5cbnJlcXVpcmUoWydxYW1iaSddLCBmdW5jdGlvbihxYW1iaSl7XG5cbiAgcWFtYmkuaW5pdCgpXG4gIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgIGxldCBzb25nID0gbmV3IHFhbWJpLlNvbmcoKVxuICAgIGxldCB0cmFjayA9IG5ldyBxYW1iaS5UcmFjaygpXG4gICAgbGV0IHBhcnQgPSBuZXcgcWFtYmkuUGFydCgpXG4gICAgbGV0IHN5bnRoID0gbmV3IHFhbWJpLlNpbXBsZVN5bnRoKClcblxuICAgIHBhcnQuYWRkRXZlbnRzKG5ldyBxYW1iaS5NSURJRXZlbnQoMCwgMTQ0LCA2MCwgMTAwKSwgbmV3IHFhbWJpLk1JRElFdmVudCg5NjAsIDEyOCwgNjAsIDApKVxuICAgIHRyYWNrLnNldEluc3RydW1lbnQoc3ludGgpXG4gICAgdHJhY2suYWRkUGFydHMocGFydClcbiAgICBzb25nLmFkZFRyYWNrcyh0cmFjaylcbiAgICBzb25nLnVwZGF0ZSgpXG4gICAgc29uZy5wbGF5KClcbiAgfSlcbn0pXG5cbiJdfQ==
