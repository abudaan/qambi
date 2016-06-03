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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsVUFBVSxNQUFWLENBQWlCO0FBQ2YsU0FBTztBQUNMLFdBQU87QUFERjtBQURRLENBQWpCOztBQU1BLFFBQVEsQ0FBQyxPQUFELENBQVIsRUFBbUIsVUFBUyxLQUFULEVBQWU7O0FBRWhDLFFBQU0sSUFBTixHQUNDLElBREQsQ0FDTSxZQUFXO0FBQ2YsUUFBSSxPQUFPLElBQUksTUFBTSxJQUFWLEVBQVg7QUFDQSxRQUFJLFFBQVEsSUFBSSxNQUFNLEtBQVYsRUFBWjtBQUNBLFFBQUksT0FBTyxJQUFJLE1BQU0sSUFBVixFQUFYO0FBQ0EsUUFBSSxRQUFRLElBQUksTUFBTSxXQUFWLEVBQVo7O0FBRUEsU0FBSyxTQUFMLENBQWUsSUFBSSxNQUFNLFNBQVYsQ0FBb0IsQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEIsRUFBNUIsRUFBZ0MsR0FBaEMsQ0FBZixFQUFxRCxJQUFJLE1BQU0sU0FBVixDQUFvQixHQUFwQixFQUF5QixHQUF6QixFQUE4QixFQUE5QixFQUFrQyxDQUFsQyxDQUFyRDtBQUNBLFVBQU0sYUFBTixDQUFvQixLQUFwQjtBQUNBLFVBQU0sUUFBTixDQUFlLElBQWY7QUFDQSxTQUFLLFNBQUwsQ0FBZSxLQUFmO0FBQ0EsU0FBSyxNQUFMO0FBQ0EsU0FBSyxJQUFMO0FBQ0QsR0FiRDtBQWNELENBaEJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmVqcy5jb25maWcoe1xuICBwYXRoczoge1xuICAgIHFhbWJpOiAnLy9xYW1iaS5vcmcvZGlzdC9xYW1iaS11bWQubWluJ1xuICB9XG59KVxuXG5yZXF1aXJlKFsncWFtYmknXSwgZnVuY3Rpb24ocWFtYmkpe1xuXG4gIHFhbWJpLmluaXQoKVxuICAudGhlbihmdW5jdGlvbigpIHtcbiAgICBsZXQgc29uZyA9IG5ldyBxYW1iaS5Tb25nKClcbiAgICBsZXQgdHJhY2sgPSBuZXcgcWFtYmkuVHJhY2soKVxuICAgIGxldCBwYXJ0ID0gbmV3IHFhbWJpLlBhcnQoKVxuICAgIHZhciBzeW50aCA9IG5ldyBxYW1iaS5TaW1wbGVTeW50aCgpXG5cbiAgICBwYXJ0LmFkZEV2ZW50cyhuZXcgcWFtYmkuTUlESUV2ZW50KDAsIDE0NCwgNjAsIDEwMCksIG5ldyBxYW1iaS5NSURJRXZlbnQoOTYwLCAxMjgsIDYwLCAwKSlcbiAgICB0cmFjay5zZXRJbnN0cnVtZW50KHN5bnRoKVxuICAgIHRyYWNrLmFkZFBhcnRzKHBhcnQpXG4gICAgc29uZy5hZGRUcmFja3ModHJhY2spXG4gICAgc29uZy51cGRhdGUoKVxuICAgIHNvbmcucGxheSgpXG4gIH0pXG59KVxuXG4iXX0=
