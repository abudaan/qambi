(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require(['qambi-umd.min'], function (qambi) {

  console.log(qambi);

  qambi.init().then(function () {
    var synth = new qambi.Instrument();
    synth.processMIDIEvent(new qambi.MIDIEvent(0, 144, 60, 100));
    synth.processMIDIEvent(new qambi.MIDIEvent(960, 128, 60, 0));
  });
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsUUFBUSxDQUFDLGVBQUQsQ0FBUixFQUEyQixVQUFTLEtBQVQsRUFBZTs7QUFFeEMsVUFBUSxHQUFSLENBQVksS0FBWjs7QUFFQSxRQUFNLElBQU4sR0FDQyxJQURELENBQ00sWUFBVztBQUNmLFFBQUksUUFBUSxJQUFJLE1BQU0sVUFBVixFQUFaO0FBQ0EsVUFBTSxnQkFBTixDQUF1QixJQUFJLE1BQU0sU0FBVixDQUFvQixDQUFwQixFQUF1QixHQUF2QixFQUE0QixFQUE1QixFQUFnQyxHQUFoQyxDQUF2QjtBQUNBLFVBQU0sZ0JBQU4sQ0FBdUIsSUFBSSxNQUFNLFNBQVYsQ0FBb0IsR0FBcEIsRUFBeUIsR0FBekIsRUFBOEIsRUFBOUIsRUFBa0MsQ0FBbEMsQ0FBdkI7QUFDRCxHQUxEO0FBT0QsQ0FYRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKFsncWFtYmktdW1kLm1pbiddLCBmdW5jdGlvbihxYW1iaSl7XG5cbiAgY29uc29sZS5sb2cocWFtYmkpXG5cbiAgcWFtYmkuaW5pdCgpXG4gIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzeW50aCA9IG5ldyBxYW1iaS5JbnN0cnVtZW50KClcbiAgICBzeW50aC5wcm9jZXNzTUlESUV2ZW50KG5ldyBxYW1iaS5NSURJRXZlbnQoMCwgMTQ0LCA2MCwgMTAwKSlcbiAgICBzeW50aC5wcm9jZXNzTUlESUV2ZW50KG5ldyBxYW1iaS5NSURJRXZlbnQoOTYwLCAxMjgsIDYwLCAwKSlcbiAgfSlcblxufSlcblxuIl19
