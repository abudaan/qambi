'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.getData = getData;
exports.getEvents = getEvents;

var _create_store = require('./create_store');

var _song = require('./song');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var store = (0, _create_store.getStore)();

function getData(id) {
  var entities = store.getState().editor.entities;
  var entity = entities[id];
  var result = {};

  for (var _len = arguments.length, keys = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    keys[_key - 1] = arguments[_key];
  }

  keys.forEach(function (key) {
    if (typeof entity[key] !== 'undefined') {
      result[key] = entity[key];
    }
  });
  return result;
}

function getEvents(id, filters) {
  var entities = store.getState().editor.entities;
  var entity = entities[id];
  var midiEventIds = entity.midiEventIds;
  var midiEvents = entity.midiEvents;

  if (entity instanceof _song.Song) {
    midiEventIds = Array.from(entity.midiEventsMap.keys());
  }

  if (typeof filters === 'undefined') {
    return [].concat(_toConsumableArray(midiEventIds));
  }

  if (!entity instanceof _song.Song) {
    midiEvents = [];
    midiEventIds.forEach(function (eventId) {
      midiEvents.push(entities[eventId]);
    });
  }

  var result = entity.midiEvents.filter(function (event) {
    return runFilters(event, filters);
  });
  return result.map(function (event) {
    return event.id;
  });
}

//@TODO: implement more filters
function runFilters(event, filters) {
  var _filters$0$split = filters[0].split(' ');

  var _filters$0$split2 = _slicedToArray(_filters$0$split, 3);

  var key = _filters$0$split2[0];
  var operator = _filters$0$split2[1];
  var value = _filters$0$split2[2];

  var result = false;

  switch (operator) {
    case '<':
      result = event[key] < value;
      break;

    case '>':
      result = event[key] > value;
      break;

    default:
  }

  return result;
}