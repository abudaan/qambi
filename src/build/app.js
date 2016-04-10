(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetPrototype = Object.getPrototypeOf;

/**
 * Gets the `[[Prototype]]` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {null|Object} Returns the `[[Prototype]]`.
 */
function getPrototype(value) {
  return nativeGetPrototype(Object(value));
}

module.exports = getPrototype;

},{}],2:[function(require,module,exports){
/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

module.exports = isHostObject;

},{}],3:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],4:[function(require,module,exports){
var getPrototype = require('./_getPrototype'),
    isHostObject = require('./_isHostObject'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object,
 *  else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

module.exports = isPlainObject;

},{"./_getPrototype":1,"./_isHostObject":2,"./isObjectLike":3}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var repeat = function repeat(str, times) {
  return new Array(times + 1).join(str);
};
var pad = function pad(num, maxLength) {
  return repeat("0", maxLength - num.toString().length) + num;
};
var formatTime = function formatTime(time) {
  return "@ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
};

// Use the new performance api to get better precision if available
var timer = typeof performance !== "undefined" && typeof performance.now === "function" ? performance : Date;

/**
 * parse the level option of createLogger
 *
 * @property {string | function | object} level - console[level]
 * @property {object} action
 * @property {array} payload
 * @property {string} type
 */

function getLogLevel(level, action, payload, type) {
  switch (typeof level === "undefined" ? "undefined" : _typeof(level)) {
    case "object":
      return typeof level[type] === "function" ? level[type].apply(level, _toConsumableArray(payload)) : level[type];
    case "function":
      return level(action);
    default:
      return level;
  }
}

/**
 * Creates logger with followed options
 *
 * @namespace
 * @property {object} options - options for logger
 * @property {string | function | object} options.level - console[level]
 * @property {boolean} options.duration - print duration of each action?
 * @property {boolean} options.timestamp - print timestamp with each action?
 * @property {object} options.colors - custom colors
 * @property {object} options.logger - implementation of the `console` API
 * @property {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
 * @property {boolean} options.collapsed - is group collapsed?
 * @property {boolean} options.predicate - condition which resolves logger behavior
 * @property {function} options.stateTransformer - transform state before print
 * @property {function} options.actionTransformer - transform action before print
 * @property {function} options.errorTransformer - transform error before print
 */

function createLogger() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _options$level = options.level;
  var level = _options$level === undefined ? "log" : _options$level;
  var _options$logger = options.logger;
  var logger = _options$logger === undefined ? console : _options$logger;
  var _options$logErrors = options.logErrors;
  var logErrors = _options$logErrors === undefined ? true : _options$logErrors;
  var collapsed = options.collapsed;
  var predicate = options.predicate;
  var _options$duration = options.duration;
  var duration = _options$duration === undefined ? false : _options$duration;
  var _options$timestamp = options.timestamp;
  var timestamp = _options$timestamp === undefined ? true : _options$timestamp;
  var transformer = options.transformer;
  var _options$stateTransfo = options.stateTransformer;
  var // deprecated
  stateTransformer = _options$stateTransfo === undefined ? function (state) {
    return state;
  } : _options$stateTransfo;
  var _options$actionTransf = options.actionTransformer;
  var actionTransformer = _options$actionTransf === undefined ? function (actn) {
    return actn;
  } : _options$actionTransf;
  var _options$errorTransfo = options.errorTransformer;
  var errorTransformer = _options$errorTransfo === undefined ? function (error) {
    return error;
  } : _options$errorTransfo;
  var _options$colors = options.colors;
  var colors = _options$colors === undefined ? {
    title: function title() {
      return "#000000";
    },
    prevState: function prevState() {
      return "#9E9E9E";
    },
    action: function action() {
      return "#03A9F4";
    },
    nextState: function nextState() {
      return "#4CAF50";
    },
    error: function error() {
      return "#F20404";
    }
  } : _options$colors;

  // exit if console undefined

  if (typeof logger === "undefined") {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }

  if (transformer) {
    console.error("Option 'transformer' is deprecated, use stateTransformer instead");
  }

  var logBuffer = [];
  function printBuffer() {
    logBuffer.forEach(function (logEntry, key) {
      var started = logEntry.started;
      var startedTime = logEntry.startedTime;
      var action = logEntry.action;
      var prevState = logEntry.prevState;
      var error = logEntry.error;
      var took = logEntry.took;
      var nextState = logEntry.nextState;

      var nextEntry = logBuffer[key + 1];
      if (nextEntry) {
        nextState = nextEntry.prevState;
        took = nextEntry.started - started;
      }
      // message
      var formattedAction = actionTransformer(action);
      var isCollapsed = typeof collapsed === "function" ? collapsed(function () {
        return nextState;
      }, action) : collapsed;

      var formattedTime = formatTime(startedTime);
      var titleCSS = colors.title ? "color: " + colors.title(formattedAction) + ";" : null;
      var title = "action " + (timestamp ? formattedTime : "") + " " + formattedAction.type + " " + (duration ? "(in " + took.toFixed(2) + " ms)" : "");

      // render
      try {
        if (isCollapsed) {
          if (colors.title) logger.groupCollapsed("%c " + title, titleCSS);else logger.groupCollapsed(title);
        } else {
          if (colors.title) logger.group("%c " + title, titleCSS);else logger.group(title);
        }
      } catch (e) {
        logger.log(title);
      }

      var prevStateLevel = getLogLevel(level, formattedAction, [prevState], "prevState");
      var actionLevel = getLogLevel(level, formattedAction, [formattedAction], "action");
      var errorLevel = getLogLevel(level, formattedAction, [error, prevState], "error");
      var nextStateLevel = getLogLevel(level, formattedAction, [nextState], "nextState");

      if (prevStateLevel) {
        if (colors.prevState) logger[prevStateLevel]("%c prev state", "color: " + colors.prevState(prevState) + "; font-weight: bold", prevState);else logger[prevStateLevel]("prev state", prevState);
      }

      if (actionLevel) {
        if (colors.action) logger[actionLevel]("%c action", "color: " + colors.action(formattedAction) + "; font-weight: bold", formattedAction);else logger[actionLevel]("action", formattedAction);
      }

      if (error && errorLevel) {
        if (colors.error) logger[errorLevel]("%c error", "color: " + colors.error(error, prevState) + "; font-weight: bold", error);else logger[errorLevel]("error", error);
      }

      if (nextStateLevel) {
        if (colors.nextState) logger[nextStateLevel]("%c next state", "color: " + colors.nextState(nextState) + "; font-weight: bold", nextState);else logger[nextStateLevel]("next state", nextState);
      }

      try {
        logger.groupEnd();
      } catch (e) {
        logger.log("—— log end ——");
      }
    });
    logBuffer.length = 0;
  }

  return function (_ref) {
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        // exit early if predicate function returns false
        if (typeof predicate === "function" && !predicate(getState, action)) {
          return next(action);
        }

        var logEntry = {};
        logBuffer.push(logEntry);

        logEntry.started = timer.now();
        logEntry.startedTime = new Date();
        logEntry.prevState = stateTransformer(getState());
        logEntry.action = action;

        var returnedValue = undefined;
        if (logErrors) {
          try {
            returnedValue = next(action);
          } catch (e) {
            logEntry.error = errorTransformer(e);
          }
        } else {
          returnedValue = next(action);
        }

        logEntry.took = timer.now() - logEntry.started;
        logEntry.nextState = stateTransformer(getState());

        printBuffer();

        if (logEntry.error) throw logEntry.error;
        return returnedValue;
      };
    };
  };
}

module.exports = createLogger;
},{}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = thunkMiddleware;
function thunkMiddleware(_ref) {
  var dispatch = _ref.dispatch;
  var getState = _ref.getState;

  return function (next) {
    return function (action) {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      return next(action);
    };
  };
}
},{}],8:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.__esModule = true;
exports["default"] = applyMiddleware;

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, initialState, enhancer) {
      var store = createStore(reducer, initialState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose2["default"].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
},{"./compose":11}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
},{}],10:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports["default"] = combineReducers;

var _createStore = require('./createStore');

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Reducer "' + key + '" returned undefined handling ' + actionName + '. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject2["default"])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key);
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    if (sanityError) {
      throw sanityError;
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action);
      if (warningMessage) {
        (0, _warning2["default"])(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
}).call(this,require('_process'))

},{"./createStore":12,"./utils/warning":14,"_process":5,"lodash/isPlainObject":4}],11:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = compose;
/**
 * Composes single-argument functions from right to left.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing functions from right to
 * left. For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
 */
function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  return function () {
    if (funcs.length === 0) {
      return arguments.length <= 0 ? undefined : arguments[0];
    }

    var last = funcs[funcs.length - 1];
    var rest = funcs.slice(0, -1);

    return rest.reduceRight(function (composed, f) {
      return f(composed);
    }, last.apply(undefined, arguments));
  };
}
},{}],12:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.ActionTypes = undefined;
exports["default"] = createStore;

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = exports.ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [initialState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
function createStore(reducer, initialState, enhancer) {
  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
    enhancer = initialState;
    initialState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, initialState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = initialState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all states changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!(0, _isPlainObject2["default"])(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  };
}
},{"lodash/isPlainObject":4}],13:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

var _createStore = require('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _combineReducers = require('./combineReducers');

var _combineReducers2 = _interopRequireDefault(_combineReducers);

var _bindActionCreators = require('./bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _applyMiddleware = require('./applyMiddleware');

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2["default"])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2["default"];
exports.combineReducers = _combineReducers2["default"];
exports.bindActionCreators = _bindActionCreators2["default"];
exports.applyMiddleware = _applyMiddleware2["default"];
exports.compose = _compose2["default"];
}).call(this,require('_process'))

},{"./applyMiddleware":8,"./bindActionCreators":9,"./combineReducers":10,"./compose":11,"./createStore":12,"./utils/warning":14,"_process":5}],14:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that you can use this stack
    // to find the callsite that caused this warning to fire.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}
},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ADD_MIDI_NOTES = exports.ADD_MIDI_NOTES = 'add_midi_notes';
var ADD_MIDI_EVENTS = exports.ADD_MIDI_EVENTS = 'add_midi_events';
//export const ADD_TRACK = 'add_track'
//export const ADD_PART = 'add_part'

var CREATE_TRACK = exports.CREATE_TRACK = 'create_track';
var ADD_PARTS = exports.ADD_PARTS = 'add_parts';
var ADD_TRACKS = exports.ADD_TRACKS = 'add_tracks';

var CREATE_PART = exports.CREATE_PART = 'create_part';
var ADD_TIME_EVENTS = exports.ADD_TIME_EVENTS = 'add_time_events';

var CREATE_SONG = exports.CREATE_SONG = 'create_song';
var ADD_MIDI_EVENTS_TO_SONG = exports.ADD_MIDI_EVENTS_TO_SONG = 'add_midi_events_to_song';

var CREATE_MIDI_EVENT = exports.CREATE_MIDI_EVENT = 'create_midi_event';
var CREATE_MIDI_NOTE = exports.CREATE_MIDI_NOTE = 'create_midi_note';
var ADD_EVENTS_TO_SONG = exports.ADD_EVENTS_TO_SONG = 'add_events_to_song';
var UPDATE_MIDI_EVENT = exports.UPDATE_MIDI_EVENT = 'update_midi_event';
var UPDATE_MIDI_NOTE = exports.UPDATE_MIDI_NOTE = 'update_midi_note';

var UPDATE_SONG = exports.UPDATE_SONG = 'update_song';

// sequencer actions
var SONG_POSITION = exports.SONG_POSITION = 'song_position';
var PLAY_SONG = exports.PLAY_SONG = 'play_song';
var PAUSE_SONG = exports.PAUSE_SONG = 'pause_song';
var STOP_SONG = exports.STOP_SONG = 'stop_song';

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.getStore = getStore;

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _reduxLogger = require('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = (0, _reduxLogger2.default)();
var store = (0, _redux.createStore)(_reducer2.default, {}, (0, _redux.compose)(
//applyMiddleware(logger),
(typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : function (f) {
  return f;
}));
function getStore() {
  return store;
}

},{"./reducer":24,"redux":13,"redux-logger":6,"redux-thunk":7}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.addTask = addTask;
exports.removeTask = removeTask;

var _io = require('./io.js');

var timedTasks = new Map();
var repetitiveTasks = new Map();
var scheduledTasks = new Map();
var tasks = new Map();
var lastTimeStamp = void 0;

function heartbeat(timestamp) {
  var now = _io.context.time;

  // for instance: the callback of sample.unschedule;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = timedTasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2);

      var key = _step$value[0];
      var task = _step$value[1];

      if (task.time >= now) {
        task.execute(now);
        timedTasks.delete(key);
      }
    }

    // for instance: song.update();
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = scheduledTasks.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var task = _step2.value;

      task(now);
    }

    // for instance: song.pulse();
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = repetitiveTasks.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _task = _step3.value;

      _task(now);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  lastTimeStamp = timestamp;
  scheduledTasks.clear();

  //setTimeout(heartbeat, 100);
  window.requestAnimationFrame(heartbeat);
}

function addTask(type, id, task) {
  var map = tasks.get(type);
  map.set(id, task);
}

function removeTask(type, id) {
  var map = tasks.get(type);
  map.delete(id);
}

(function start() {
  tasks.set('timed', timedTasks);
  tasks.set('repetitive', repetitiveTasks);
  tasks.set('scheduled', scheduledTasks);
  heartbeat();
})();

},{"./io.js":18}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});


var context = new window.AudioContext();

exports.context = context;

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMIDIEvent = createMIDIEvent;
exports.getMIDIEventId = getMIDIEventId;
exports.moveMIDIEvent = moveMIDIEvent;
exports.moveMIDIEventTo = moveMIDIEventTo;

var _create_store = require('./create_store');

var _midi_note = require('./midi_note');

var _action_types = require('./action_types');

var store = (0, _create_store.getStore)();
var midiEventIndex = 0;

function createMIDIEvent(ticks, type, data1) {
  var data2 = arguments.length <= 3 || arguments[3] === undefined ? -1 : arguments[3];

  var id = 'ME_' + midiEventIndex++ + '_' + new Date().getTime();
  store.dispatch({
    type: _action_types.CREATE_MIDI_EVENT,
    payload: {
      id: id,
      ticks: ticks,
      type: type,
      data1: data1,
      data2: data2,
      sortIndex: ticks + type
    }
  });
  return id;
}

function getMIDIEventId() {
  return 'ME_' + midiEventIndex++ + '_' + new Date().getTime();
}

function moveMIDIEvent(id, ticks_to_move) {
  var state = store.getState().editor;
  var event = state.midiEvents[id];
  var ticks = event.ticks + ticks_to_move;
  ticks = ticks < 0 ? 0 : ticks;
  //console.log(ticks, event.ticks)
  store.dispatch({
    type: _action_types.UPDATE_MIDI_EVENT,
    payload: {
      id: id,
      ticks: ticks,
      sortIndex: ticks + event.type
    }
  });
  // if the event is part of a midi note, update it
  var note_id = event.note;
  if (note_id) {
    (0, _midi_note.updateMIDINote)(note_id, state);
  }
}

function moveMIDIEventTo(id, ticks) {
  var state = store.getState().editor;
  var event = state.midiEvents[id];
  store.dispatch({
    type: _action_types.UPDATE_MIDI_EVENT,
    payload: {
      id: id,
      ticks: ticks,
      sortIndex: ticks + event.type
    }
  });
  if (typeof event === 'undefined') {
    console.error('event is undefined'); //this should't happen!
  }
  // if the event is part of a midi note, update it
  var note_id = event.note;
  if (note_id) {
    (0, _midi_note.updateMIDINote)(note_id, state);
  }
}

},{"./action_types":15,"./create_store":16,"./midi_note":20}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateMIDINote = updateMIDINote;
exports.createMIDINote = createMIDINote;

var _create_store = require('./create_store');

var _action_types = require('./action_types');

var store = (0, _create_store.getStore)();
var midiNoteIndex = 0;

function updateMIDINote(id) {
  var state = arguments.length <= 1 || arguments[1] === undefined ? store.getState() : arguments[1];

  var note = state.midiNotes[id];
  var events = state.midiEvents;
  var start = events[note.noteon];
  var end = events[note.noteoff];

  store.dispatch({
    type: _action_types.UPDATE_MIDI_NOTE,
    payload: {
      id: id,
      start: start.ticks,
      end: end.ticks,
      durationTicks: end.ticks - start.ticks
    }
  });
}

function createMIDINote(noteon, noteoff) {
  var events = store.getState().editor.midiEvents;
  var on = events[noteon];
  var off = events[noteoff];
  if (on.data1 !== off.data1) {
    console.error('can\'t create MIDI note: events must have the same data1 value, i.e. the same pitch');
    return -1;
  }

  var id = 'MN_' + midiNoteIndex++ + '_' + new Date().getTime();
  store.dispatch({
    type: _action_types.CREATE_MIDI_NOTE,
    payload: {
      id: id,
      noteon: noteon,
      noteoff: noteoff,
      start: on.ticks,
      end: off.ticks,
      durationTicks: off.ticks - on.ticks
    }
  });
  return id;
}

},{"./action_types":15,"./create_store":16}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTimeEvents = parseTimeEvents;
exports.parseEvents = parseEvents;

var _util = require('./util');

var ppq = void 0,
    bpm = void 0,
    factor = void 0,
    nominator = void 0,
    denominator = void 0,
    playbackSpeed = void 0,
    bar = void 0,
    beat = void 0,
    sixteenth = void 0,
    tick = void 0,
    ticks = void 0,
    millis = void 0,
    millisPerTick = void 0,
    secondsPerTick = void 0,
    ticksPerBeat = void 0,
    ticksPerBar = void 0,
    ticksPerSixteenth = void 0,
    numSixteenth = void 0,
    diffTicks = void 0;

function setTickDuration() {
  secondsPerTick = 1 / playbackSpeed * 60 / bpm / ppq;
  millisPerTick = secondsPerTick * 1000;
  //console.log(millisPerTick, bpm, ppq, playbackSpeed, (ppq * millisPerTick));
  //console.log(ppq);
}

function setTicksPerBeat() {
  factor = 4 / denominator;
  numSixteenth = factor * 4;
  ticksPerBeat = ppq * factor;
  ticksPerBar = ticksPerBeat * nominator;
  ticksPerSixteenth = ppq / 4;
  //console.log(denominator, factor, numSixteenth, ticksPerBeat, ticksPerBar, ticksPerSixteenth);
}

function updatePosition(event) {
  diffTicks = event.ticks - ticks;
  tick += diffTicks;
  ticks = event.ticks;
  //console.log(diffTicks, millisPerTick);
  millis += diffTicks * millisPerTick;

  while (tick >= ticksPerSixteenth) {
    sixteenth++;
    tick -= ticksPerSixteenth;
    while (sixteenth > numSixteenth) {
      sixteenth -= numSixteenth;
      beat++;
      while (beat > nominator) {
        beat -= nominator;
        bar++;
      }
    }
  }
}

function parseTimeEvents(settings, timeEvents) {
  //console.time('parse time events ' + song.name);
  var type = void 0;
  var event = void 0;

  ppq = settings.ppq;
  bpm = settings.bpm;
  nominator = settings.nominator;
  denominator = settings.denominator;
  playbackSpeed = settings.playbackSpeed;
  bar = 1;
  beat = 1;
  sixteenth = 1;
  tick = 0;
  ticks = 0;
  millis = 0;

  setTickDuration();
  setTicksPerBeat();

  timeEvents.sort(function (a, b) {
    return a.ticks <= b.ticks ? -1 : 1;
  });

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = timeEvents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      event = _step.value;

      //event.song = song;
      type = event.type;
      updatePosition(event);

      switch (type) {

        case 0x51:
          bpm = event.data1;
          setTickDuration();
          break;

        case 0x58:
          nominator = event.data1;
          denominator = event.data2;
          setTicksPerBeat();
          break;

        default:
          continue;
      }

      //time data of time event is valid from (and included) the position of the time event
      updateEvent(event);
      //console.log(event.barsAsString);
    }

    //song.lastEventTmp = event;
    //console.log(event);
    //console.log(timeEvents);
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

//export function parseEvents(song, events){
function parseEvents(events) {
  var event = void 0;
  var startEvent = 0;
  var lastEventTick = 0;
  var result = [];

  //let events = [].concat(evts, song._timeEvents);
  var numEvents = events.length;
  //console.log(events)
  events.sort(function (a, b) {
    return a._sortIndex - b._sortIndex;
  });
  event = events[0];

  bpm = event.bpm;
  factor = event.factor;
  nominator = event.nominator;
  denominator = event.denominator;

  ticksPerBar = event.ticksPerBar;
  ticksPerBeat = event.ticksPerBeat;
  ticksPerSixteenth = event.ticksPerSixteenth;

  numSixteenth = event.numSixteenth;

  millisPerTick = event.millisPerTick;
  secondsPerTick = event.secondsPerTick;

  millis = event.millis;

  bar = event.bar;
  beat = event.beat;
  sixteenth = event.sixteenth;
  tick = event.tick;

  for (var i = startEvent; i < numEvents; i++) {

    event = events[i];
    //console.log(event.ticks, event.type)

    switch (event.type) {

      case 0x51:
        bpm = event.data1;
        millis = event.millis;
        millisPerTick = event.millisPerTick;
        secondsPerTick = event.secondsPerTick;
        //console.log(millisPerTick,event.millisPerTick);
        //console.log(event);
        break;

      case 0x58:
        factor = event.factor;
        nominator = event.data1;
        denominator = event.data2;
        numSixteenth = event.numSixteenth;
        ticksPerBar = event.ticksPerBar;
        ticksPerBeat = event.ticksPerBeat;
        ticksPerSixteenth = event.ticksPerSixteenth;
        millis = event.millis;
        //console.log(nominator,numSixteenth,ticksPerSixteenth);
        //console.log(event);
        break;

      default:
        updatePosition(event);
        updateEvent(event);
        result.push(event);
    }

    lastEventTick = event.ticks;
  }
  return result;
  //song.lastEventTmp = event;
}

function updateEvent(event) {
  //console.log(bar, beat, ticks)
  //console.log(event, bpm, millisPerTick, ticks, millis);

  event.bpm = bpm;
  event.nominator = nominator;
  event.denominator = denominator;

  event.ticksPerBar = ticksPerBar;
  event.ticksPerBeat = ticksPerBeat;
  event.ticksPerSixteenth = ticksPerSixteenth;

  event.factor = factor;
  event.numSixteenth = numSixteenth;
  event.secondsPerTick = secondsPerTick;
  event.millisPerTick = millisPerTick;

  event.ticks = ticks;

  event.millis = millis;
  event.seconds = millis / 1000;

  event.bar = bar;
  event.beat = beat;
  event.sixteenth = sixteenth;
  event.tick = tick;
  //event.barsAsString = (bar + 1) + ':' + (beat + 1) + ':' + (sixteenth + 1) + ':' + tick;
  var tickAsString = tick === 0 ? '000' : tick < 10 ? '00' + tick : tick < 100 ? '0' + tick : tick;
  event.barsAsString = bar + ':' + beat + ':' + sixteenth + ':' + tickAsString;
  event.barsAsArray = [bar, beat, sixteenth, tick];

  var timeData = (0, _util.getNiceTime)(millis);

  event.hour = timeData.hour;
  event.minute = timeData.minute;
  event.second = timeData.second;
  event.millisecond = timeData.millisecond;
  event.timeAsString = timeData.timeAsString;
  event.timeAsArray = timeData.timeAsArray;
}

},{"./util":29}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPart = createPart;
exports.addMIDIEvents = addMIDIEvents;

var _create_store = require('./create_store');

var _action_types = require('./action_types');

var store = (0, _create_store.getStore)();
var partIndex = 0;

function createPart() {
  var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var id = 'MP_' + partIndex++ + '_' + new Date().getTime();
  var _settings$name = settings.name;
  var name = _settings$name === undefined ? id : _settings$name;
  var _settings$midiEventId = settings.midiEventIds;
  var midiEventIds = _settings$midiEventId === undefined ? [] : _settings$midiEventId;
  var _settings$midiNoteIds = settings.midiNoteIds;
  var midiNoteIds = _settings$midiNoteIds === undefined ? [] : _settings$midiNoteIds;
  var _settings$trackId = settings.trackId;
  var trackId = _settings$trackId === undefined ? 'none' : _settings$trackId;


  store.dispatch({
    type: _action_types.CREATE_PART,
    payload: {
      id: id,
      name: name,
      midiEventIds: midiEventIds,
      midiNoteIds: midiNoteIds,
      trackId: trackId
    }
  });
  return id;
}

function addMIDIEvents(part_id) {
  for (var _len = arguments.length, midi_event_ids = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    midi_event_ids[_key - 1] = arguments[_key];
  }

  store.dispatch({
    type: _action_types.ADD_MIDI_EVENTS,
    payload: {
      part_id: part_id,
      midi_event_ids: midi_event_ids
    }
  });
}

},{"./action_types":15,"./create_store":16}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIDI = exports.addMIDIEvents = exports.createPart = exports.addParts = exports.createTrack = exports.stopSong = exports.startSong = exports.updateSong = exports.addTracks = exports.createSong = exports.createMIDINote = exports.moveMIDIEventTo = exports.moveMIDIEvent = exports.createMIDIEvent = undefined;

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _song = require('./song');

var _track = require('./track');

var _part = require('./part');

var qambi = {
  version: '0.0.1',

  // from ./midi_event
  createMIDIEvent: _midi_event.createMIDIEvent,
  moveMIDIEvent: _midi_event.moveMIDIEvent,
  moveMIDIEventTo: _midi_event.moveMIDIEventTo,

  // from ./midi_note
  createMIDINote: _midi_note.createMIDINote,

  // from ./song
  createSong: _song.createSong,
  addTracks: _song.addTracks,
  updateSong: _song.updateSong,
  startSong: _song.startSong,
  stopSong: _song.stopSong,

  // from ./track
  createTrack: _track.createTrack,
  addParts: _track.addParts,

  // from ./part
  createPart: _part.createPart,
  addMIDIEvents: _part.addMIDIEvents,

  log: function log(id) {
    if (id === 'functions') {
      console.log('functions:\n        createMIDIEvent\n        moveMIDIEvent\n        moveMIDIEventTo\n        createMIDINote\n        createSong\n        addTracks\n        createTrack\n        addParts\n        createPart\n        addMIDIEvents\n      ');
    }
  }
};

// standard MIDI events
var MIDI = {};
Object.defineProperty(MIDI, 'NOTE_OFF', { value: 0x80 }); //128
Object.defineProperty(MIDI, 'NOTE_ON', { value: 0x90 }); //144
Object.defineProperty(MIDI, 'POLY_PRESSURE', { value: 0xA0 }); //160
Object.defineProperty(MIDI, 'CONTROL_CHANGE', { value: 0xB0 }); //176
Object.defineProperty(MIDI, 'PROGRAM_CHANGE', { value: 0xC0 }); //192
Object.defineProperty(MIDI, 'CHANNEL_PRESSURE', { value: 0xD0 }); //208
Object.defineProperty(MIDI, 'PITCH_BEND', { value: 0xE0 }); //224
Object.defineProperty(MIDI, 'SYSTEM_EXCLUSIVE', { value: 0xF0 }); //240
Object.defineProperty(MIDI, 'MIDI_TIMECODE', { value: 241 });
Object.defineProperty(MIDI, 'SONG_POSITION', { value: 242 });
Object.defineProperty(MIDI, 'SONG_SELECT', { value: 243 });
Object.defineProperty(MIDI, 'TUNE_REQUEST', { value: 246 });
Object.defineProperty(MIDI, 'EOX', { value: 247 });
Object.defineProperty(MIDI, 'TIMING_CLOCK', { value: 248 });
Object.defineProperty(MIDI, 'START', { value: 250 });
Object.defineProperty(MIDI, 'CONTINUE', { value: 251 });
Object.defineProperty(MIDI, 'STOP', { value: 252 });
Object.defineProperty(MIDI, 'ACTIVE_SENSING', { value: 254 });
Object.defineProperty(MIDI, 'SYSTEM_RESET', { value: 255 });

Object.defineProperty(MIDI, 'TEMPO', { value: 0x51 });
Object.defineProperty(MIDI, 'TIME_SIGNATURE', { value: 0x58 });
Object.defineProperty(MIDI, 'END_OF_TRACK', { value: 0x2F });

exports.default = qambi;
exports.
// from ./midi_event
createMIDIEvent = _midi_event.createMIDIEvent;
exports.moveMIDIEvent = _midi_event.moveMIDIEvent;
exports.moveMIDIEventTo = _midi_event.moveMIDIEventTo;
exports.

// from ./midi_note
createMIDINote = _midi_note.createMIDINote;
exports.

// from ./song
createSong = _song.createSong;
exports.addTracks = _song.addTracks;
exports.updateSong = _song.updateSong;
exports.startSong = _song.startSong;
exports.stopSong = _song.stopSong;
exports.

// from ./track
createTrack = _track.createTrack;
exports.addParts = _track.addParts;
exports.

// from ./part
createPart = _part.createPart;
exports.addMIDIEvents = _part.addMIDIEvents;
exports.MIDI = MIDI;

},{"./midi_event":19,"./midi_note":20,"./part":22,"./song":26,"./track":28}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _redux = require('redux');

var _action_types = require('./action_types');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var initialState = {
  songs: {},
  tracks: {},
  parts: {},
  midiEvents: {},
  midiNotes: {}
};

function editor() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
  var action = arguments[1];


  var event = void 0,
      eventId = void 0,
      song = void 0,
      songId = void 0,
      midiEvents = void 0;

  switch (action.type) {

    case _action_types.CREATE_SONG:
      state = _extends({}, state);
      state.songs[action.payload.id] = action.payload;
      break;

    case _action_types.CREATE_TRACK:
      state = _extends({}, state);
      state.tracks[action.payload.id] = action.payload;
      break;

    case _action_types.CREATE_PART:
      state = _extends({}, state);
      state.parts[action.payload.id] = action.payload;
      break;

    case _action_types.CREATE_MIDI_EVENT:
      state = _extends({}, state);
      state.midiEvents[action.payload.id] = action.payload;
      break;

    case _action_types.CREATE_MIDI_NOTE:
      state = _extends({}, state);
      state.midiNotes[action.payload.id] = action.payload;
      break;

    case _action_types.ADD_TRACKS:
      state = _extends({}, state);
      songId = action.payload.song_id;
      song = state.songs[songId];
      if (song) {
        var trackIds = action.payload.track_ids;
        trackIds.forEach(function (trackId) {
          var track = state.tracks[trackId];
          if (track) {
            (function () {
              var _song$midiEventIds;

              song.trackIds.push(trackId);
              track.songId = songId;
              var midiEventIds = [];
              track.partIds.forEach(function (partId) {
                var part = state.parts[partId];
                song.partIds.push(partId);
                midiEventIds.push.apply(midiEventIds, _toConsumableArray(part.midiEventIds));
              });
              (_song$midiEventIds = song.midiEventIds).push.apply(_song$midiEventIds, midiEventIds);
            })();
          } else {
            console.warn('no track with id ' + trackId);
          }
        });
      } else {
        console.warn('no song found with id ' + songId);
      }
      break;

    case _action_types.ADD_PARTS:
      state = _extends({}, state);
      var trackId = action.payload.track_id;
      var track = state.tracks[trackId];
      if (track) {
        //track.parts.push(...action.payload.part_ids)
        var partIds = action.payload.part_ids;
        partIds.forEach(function (id) {
          var part = state.parts[id];
          if (part) {
            track.partIds.push(id);
            part.trackId = trackId;
          } else {
            console.warn('no part with id ' + id);
          }
        });
      } else {
        console.warn('no track found with id ' + trackId);
      }
      break;

    case _action_types.ADD_MIDI_EVENTS:
      state = _extends({}, state);
      var partId = action.payload.part_id;
      var part = state.parts[partId];
      if (part) {
        //part.midiEvents.push(...action.payload.midi_event_ids)
        var midiEventIds = action.payload.midi_event_ids;
        midiEventIds.forEach(function (id) {
          var midiEvent = state.midiEvents[id];
          if (midiEvent) {
            part.midiEventIds.push(id);
            midiEvent.partId = partId;
          } else {
            console.warn('no MIDI event found with id ' + id);
          }
        });
      } else {
        console.warn('no part found with id ' + partId);
      }
      break;

    case _action_types.UPDATE_MIDI_EVENT:
      state = _extends({}, state);
      eventId = action.payload.id;
      event = state.midiEvents[eventId];
      if (event) {
        var _action$payload = action.payload;
        var _action$payload$ticks = _action$payload.ticks;
        event.ticks = _action$payload$ticks === undefined ? event.ticks : _action$payload$ticks;
        var _action$payload$data = _action$payload.data1;
        event.data1 = _action$payload$data === undefined ? event.data1 : _action$payload$data;
        var _action$payload$data2 = _action$payload.data2;
        event.data2 = _action$payload$data2 === undefined ? event.data2 : _action$payload$data2;
      } else {
        console.warn('no MIDI event found with id ' + eventId);
      }
      break;

    case _action_types.UPDATE_MIDI_NOTE:
      state = _extends({}, state);
      var note = state.midiNotes[action.payload.id];
      var _action$payload2 = action.payload;
      var _action$payload2$star = _action$payload2.start;
      note.start = _action$payload2$star === undefined ? note.start : _action$payload2$star;
      var _action$payload2$end = _action$payload2.end;
      note.end = _action$payload2$end === undefined ? note.end : _action$payload2$end;
      var _action$payload2$dura = _action$payload2.durationTicks;
      note.durationTicks = _action$payload2$dura === undefined ? note.durationTicks : _action$payload2$dura;

      break;

    case _action_types.UPDATE_SONG:
      state = _extends({}, state);
      var _action$payload3 = action.payload;
      songId = _action$payload3.song_id;
      midiEvents = _action$payload3.midi_events;

      song = state.songs[songId];
      song.midiEventIds = [];
      midiEvents.forEach(function (event) {
        song.midiEventIds.push(event.id);
        state.midiEvents[event.id] = event;
      });
      break;

    default:
    // do nothing
  }
  return state;
}

// state when a song is playing
function sequencer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? { songs: {} } : arguments[0];
  var action = arguments[1];

  switch (action.type) {

    case _action_types.UPDATE_SONG:
      state = _extends({}, state);
      state.songs[action.payload.song_id] = action.payload;
      break;

    case _action_types.SONG_POSITION:
      state = _extends({}, state);
      state.songs[action.payload.song_id].position = action.payload.position;
      break;

    default:
    // do nothing
  }
  return state;
}

function gui() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments[1];

  return state;
}

var sequencerApp = (0, _redux.combineReducers)({
  gui: gui,
  editor: editor,
  sequencer: sequencer
});

exports.default = sequencerApp;

},{"./action_types":15,"redux":13}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BUFFER_TIME = 350; // millis

var Scheduler = function () {
  function Scheduler(songData, timeStamp, startPosition) {
    _classCallCheck(this, Scheduler);

    this.songId = songData.song_id;
    this.events = songData.midi_events;
    var _songData$settings = songData.settings;
    this.bars = _songData$settings.bars;
    this.loop = _songData$settings.loop;

    this.numEvents = this.events.length;
    this.songStartPosition = startPosition;
    this.timeStamp = timeStamp;
    this.index = 0;
    this.setIndex(songData.position);
  }

  // get the index of the event that has its millis value at or right after the provided millis value


  _createClass(Scheduler, [{
    key: 'setIndex',
    value: function setIndex(millis) {
      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _event = _step.value;

          if (_event.millis >= millis) {
            this.index = i;
            break;
          }
          i++;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var events = [];
      // main loop
      for (var i = this.index; i < this.numEvents; i++) {
        event = this.events[i];
        if (event.millis < this.maxtime) {

          event.time = this.timeStamp + event.millis - this.songStartPosition;

          if (event.type === 144 || event.type === 128) {
            /*
                      if(event.midiNote !== undefined && event.midiNote.endless === false){
                        if(event.type === 144){
                          //this.notes[event.midiNote.id] = event.midiNote;
                          this.notes[event.id] = event.id;
                        }else if(event.type === 128){
                          delete this.notes[event.midiNote.id];
                        }
                        events.push(event);
                      }
            */
            events.push(event);
          } else if (event.type === 'audio') {
            // to be implemented
          } else {
              // controller events
              events.push(event);
            }
          this.index++;
        } else {
          break;
        }
      }
      return events;
    }
  }, {
    key: 'update',
    value: function update(position) {
      var i, event, numEvents, events, track, channel;

      this.maxtime = position + BUFFER_TIME;
      events = this.getEvents();
      numEvents = events.length;

      for (i = 0; i < numEvents; i++) {
        event = events[i];
        track = event.track;
        console.log(position, event);
        /*
        if(
          track === undefined ||
          event.mute === true ||
          event.part.mute === true ||
          event.track.mute === true ||
          (event.track.type === 'metronome' && this.song.useMetronome === false)
          )
        {
          continue;
        }
         if(event.type === 'audio'){
          // to be implemented
        }else{
          if(track.routeToMidiOut === false){
            // if(event.type === 144){
            //     console.log(event.time/1000, sequencer.getTime(), event.time/1000 - sequencer.getTime());
            // }
            event.time /= 1000;
            //console.log('scheduled', event.type, event.time, event.midiNote.id);
            //console.log(track.instrument.processEvent);
            track._instrument.processEvent(event);
          }else{
            channel = track.channel;
            if(channel === 'any' || channel === undefined || isNaN(channel) === true){
              channel = 0;
            }
            for(let key in Object.keys(track.midiOutputs)){
              let midiOutput = track.midiOutputs[key];
              if(event.type === 128 || event.type === 144 || event.type === 176){
                //midiOutput.send([event.type, event.data1, event.data2], event.time + sequencer.midiOutLatency);
                midiOutput.send([event.type + channel, event.data1, event.data2], event.time);
              }else if(event.type === 192 || event.type === 224){
                midiOutput.send([event.type + channel, event.data1], event.time);
              }
            }
            // needed for Song.resetExternalMidiDevices()
            this.lastEventTime = event.time;
          }
        }
        */
      }

      return this.index >= this.numEvents; // end of song
    }
  }]);

  return Scheduler;
}();

exports.default = Scheduler;

},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createSong = createSong;
exports.addTracks = addTracks;
exports.addTimeEvents = addTimeEvents;
exports.addMIDIEvents = addMIDIEvents;
exports.addMIDIEventsToSong = addMIDIEventsToSong;
exports.updateSong = updateSong;
exports.startSong = startSong;
exports.stopSong = stopSong;

var _create_store = require('./create_store');

var _parse_events = require('./parse_events');

var _midi_event = require('./midi_event');

var _heartbeat = require('./heartbeat');

var _io = require('./io');

var _scheduler = require('./scheduler');

var _scheduler2 = _interopRequireDefault(_scheduler);

var _action_types = require('./action_types');

var _qambi = require('./qambi');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var store = (0, _create_store.getStore)();
var songIndex = 0;

var defaultSong = {
  ppq: 960,
  bpm: 120,
  bars: 30,
  lowestNote: 0,
  highestNote: 127,
  nominator: 4,
  denominator: 4,
  quantizeValue: 8,
  fixedLengthValue: false,
  positionType: 'all',
  useMetronome: false,
  autoSize: true,
  loop: false,
  playbackSpeed: 1,
  autoQuantize: false
};

function createSong() {
  var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var id = 'S_' + songIndex++ + '_' + new Date().getTime();
  var s = {};
  var _settings$name = settings.name;
  s.name = _settings$name === undefined ? id : _settings$name;
  var _settings$ppq = settings.ppq;
  s.ppq = _settings$ppq === undefined ? defaultSong.ppq : _settings$ppq;
  var _settings$bpm = settings.bpm;
  s.bpm = _settings$bpm === undefined ? defaultSong.bpm : _settings$bpm;
  var _settings$bars = settings.bars;
  s.bars = _settings$bars === undefined ? defaultSong.bars : _settings$bars;
  var _settings$lowestNote = settings.lowestNote;
  s.lowestNote = _settings$lowestNote === undefined ? defaultSong.lowestNote : _settings$lowestNote;
  var _settings$highestNote = settings.highestNote;
  s.highestNote = _settings$highestNote === undefined ? defaultSong.highestNote : _settings$highestNote;
  var _settings$nominator = settings.nominator;
  s.nominator = _settings$nominator === undefined ? defaultSong.nominator : _settings$nominator;
  var _settings$denominator = settings.denominator;
  s.denominator = _settings$denominator === undefined ? defaultSong.denominator : _settings$denominator;
  var _settings$quantizeVal = settings.quantizeValue;
  s.quantizeValue = _settings$quantizeVal === undefined ? defaultSong.quantizeValue : _settings$quantizeVal;
  var _settings$fixedLength = settings.fixedLengthValue;
  s.fixedLengthValue = _settings$fixedLength === undefined ? defaultSong.fixedLengthValue : _settings$fixedLength;
  var _settings$positionTyp = settings.positionType;
  s.positionType = _settings$positionTyp === undefined ? defaultSong.positionType : _settings$positionTyp;
  var _settings$useMetronom = settings.useMetronome;
  s.useMetronome = _settings$useMetronom === undefined ? defaultSong.useMetronome : _settings$useMetronom;
  var _settings$autoSize = settings.autoSize;
  s.autoSize = _settings$autoSize === undefined ? defaultSong.autoSize : _settings$autoSize;
  var _settings$loop = settings.loop;
  s.loop = _settings$loop === undefined ? defaultSong.loop : _settings$loop;
  var _settings$playbackSpe = settings.playbackSpeed;
  s.playbackSpeed = _settings$playbackSpe === undefined ? defaultSong.playbackSpeed : _settings$playbackSpe;
  var _settings$autoQuantiz = settings.autoQuantize;
  s.autoQuantize = _settings$autoQuantiz === undefined ? defaultSong.autoQuantize : _settings$autoQuantiz;
  var _settings$timeEvents = settings.timeEvents;
  var timeEvents = _settings$timeEvents === undefined ? [{ id: (0, _midi_event.getMIDIEventId)(), song: id, ticks: 0, type: _qambi.MIDI.TEMPO, data1: s.bpm }, { id: (0, _midi_event.getMIDIEventId)(), song: id, ticks: 0, type: _qambi.MIDI.TIME_SIGNATURE, data1: s.nominator, data2: s.denominator }] : _settings$timeEvents;
  var _settings$midiEventId = settings.midiEventIds;
  var midiEventIds = _settings$midiEventId === undefined ? [] : _settings$midiEventId;
  var _settings$partIds = settings.partIds;
  var partIds = _settings$partIds === undefined ? [] : _settings$partIds;
  var _settings$trackIds = settings.trackIds;
  var trackIds = _settings$trackIds === undefined ? [] : _settings$trackIds;


  (0, _parse_events.parseTimeEvents)(s, timeEvents);

  store.dispatch({
    type: _action_types.CREATE_SONG,
    payload: {
      id: id,
      timeEvents: timeEvents,
      midiEventIds: midiEventIds,
      partIds: partIds,
      trackIds: trackIds,
      settings: s
    }
  });
  return id;
}

function addTracks(song_id) {
  for (var _len = arguments.length, track_ids = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    track_ids[_key - 1] = arguments[_key];
  }

  store.dispatch({
    type: _action_types.ADD_TRACKS,
    payload: {
      song_id: song_id,
      track_ids: track_ids
    }
  });
}

function addTimeEvents() {}

function addMIDIEvents(settings, midi_events) {
  //@todo: create part, add events to part, create track, add part to track, add track to song
  store.dispatch({
    type: _action_types.ADD_MIDI_EVENTS_TO_SONG,
    payload: {
      //      id: song_id,
      midi_events: midi_events
    }
  });
}

function addMIDIEventsToSong(song_id, midi_events) {
  //@todo: create part, add events to part, create track, add part to track, add track to song
  store.dispatch({
    type: _action_types.ADD_MIDI_EVENTS_TO_SONG,
    payload: {
      id: song_id,
      midi_events: midi_events
    }
  });
}

function updateSong(song_id) {
  var state = store.getState().editor;
  var song = state.songs[song_id];
  if (song) {
    (function () {
      var midiEvents = [].concat(_toConsumableArray(song.timeEvents));
      song.midiEventIds.forEach(function (event_id) {
        var event = state.midiEvents[event_id];
        if (event) {
          midiEvents.push(_extends({}, event));
        }
      });
      midiEvents = (0, _parse_events.parseEvents)(midiEvents);
      store.dispatch({
        type: _action_types.UPDATE_SONG,
        payload: {
          song_id: song_id,
          midi_events: midiEvents,
          settings: song.settings // needed for the sequencer reducer
        }
      });
    })();
  } else {
      console.warn('no song found with id ' + song_id);
    }
}

function startSong(song_id) {
  var start_position = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];


  function createScheduler() {
    var timeStamp = _io.context.currentTime; // -> should be performance.now()
    var songData = store.getState().sequencer.songs[song_id];
    var scheduler = new _scheduler2.default(songData, timeStamp, start_position);
    var position = start_position;

    return function () {
      var now = _io.context.currentTime * 1000,
          diff = now - timeStamp,
          endOfSong = void 0;

      position += diff; // position is in millis
      timeStamp = now;
      endOfSong = scheduler.update(position);
      if (endOfSong) {
        stopSong(song_id);
      }
      store.dispatch({
        type: _action_types.SONG_POSITION,
        payload: {
          song_id: song_id,
          position: position
        }
      });
    };
  }

  (0, _heartbeat.addTask)('repetitive', song_id, createScheduler());
}

function stopSong(song_id) {
  console.log('stop song', song_id);
  (0, _heartbeat.removeTask)('repetitive', song_id);
}

},{"./action_types":15,"./create_store":16,"./heartbeat":17,"./io":18,"./midi_event":19,"./parse_events":21,"./qambi":23,"./scheduler":25}],27:[function(require,module,exports){
'use strict';

var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_qambi2.default.version);
_qambi2.default.log('functions');

document.addEventListener('DOMContentLoaded', function () {

  var button = document.getElementById('start');
  var noteon = void 0,
      noteoff = void 0,
      note = void 0,
      song = void 0,
      track = void 0,
      part1 = void 0,
      part2 = void 0;

  song = (0, _qambi.createSong)({ name: 'My First Song', playbackSpeed: 100, loop: true, bpm: 90 });
  track = (0, _qambi.createTrack)({ name: 'guitar', song: song });
  part1 = (0, _qambi.createPart)({ name: 'solo1', track: track });
  part2 = (0, _qambi.createPart)({ name: 'solo2', track: track });
  noteon = (0, _qambi.createMIDIEvent)(120, 144, 60, 100);
  noteoff = (0, _qambi.createMIDIEvent)(100000, 128, 60, 0);

  note = (0, _qambi.createMIDINote)(noteon, noteoff);

  (0, _qambi.addMIDIEvents)(part1, noteon, noteoff);
  (0, _qambi.addParts)(track, part1, part2);
  (0, _qambi.addTracks)(song, track);
  (0, _qambi.updateSong)(song);

  //startSong(song)
  // let song2 = createSong()

  // setTimeout(function(){
  //   startSong(song2, 5000)
  // }, 1000)

  //   setTimeout(function(){
  //     stopSong(song)
  // //    stopSong(song2)
  //   }, 200)

  button.addEventListener('click', function () {
    (0, _qambi.startSong)(song);
  });
});

},{"./qambi":23}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTrack = createTrack;
exports.addParts = addParts;

var _create_store = require('./create_store');

var _action_types = require('./action_types');

var store = (0, _create_store.getStore)();
var trackIndex = 0;

function createTrack()
//settings: {name: string, parts:Array<string>, song: string} = {name: 'aap', parts: [], song: 'no song'}
//settings = {name: name = 'aap', parts: parts = [], song: song = 'no song'}
//settings = {name: name = 'aap', parts: parts = [], song: song = 'no song'}
{
  var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var id = 'MT_' + trackIndex++ + '_' + new Date().getTime();
  var _settings$name = settings.name;
  var name = _settings$name === undefined ? id : _settings$name;
  var _settings$partIds = settings.partIds;
  var partIds = _settings$partIds === undefined ? [] : _settings$partIds;
  var _settings$songId = settings.songId;
  var songId = _settings$songId === undefined ? 'none' : _settings$songId;

  store.dispatch({
    type: _action_types.CREATE_TRACK,
    payload: {
      id: id,
      name: name,
      partIds: partIds,
      songId: songId
    }
  });
  return id;
}

function addParts(track_id) {
  for (var _len = arguments.length, part_ids = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    part_ids[_key - 1] = arguments[_key];
  }

  store.dispatch({
    type: _action_types.ADD_PARTS,
    payload: {
      track_id: track_id,
      part_ids: part_ids
    }
  });
}

},{"./action_types":15,"./create_store":16}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNiceTime = getNiceTime;
var mPow = Math.pow,
    mRound = Math.round,
    mFloor = Math.floor,
    mRandom = Math.random;

function getNiceTime(millis) {
  var h = void 0,
      m = void 0,
      s = void 0,
      ms = void 0,
      seconds = void 0,
      timeAsString = '';

  seconds = millis / 1000; // → millis to seconds
  h = mFloor(seconds / (60 * 60));
  m = mFloor(seconds % (60 * 60) / 60);
  s = mFloor(seconds % 60);
  ms = mRound((seconds - h * 3600 - m * 60 - s) * 1000);

  timeAsString += h + ':';
  timeAsString += m < 10 ? '0' + m : m;
  timeAsString += ':';
  timeAsString += s < 10 ? '0' + s : s;
  timeAsString += ':';
  timeAsString += ms === 0 ? '000' : ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : ms;

  //console.log(h, m, s, ms);
  return {
    hour: h,
    minute: m,
    second: s,
    millisecond: ms,
    timeAsString: timeAsString,
    timeAsArray: [h, m, s, ms]
  };
}

},{}]},{},[27])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19pc0hvc3RPYmplY3QuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNQbGFpbk9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcmVkdXgtbG9nZ2VyL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC10aHVuay9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2FwcGx5TWlkZGxld2FyZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvYmluZEFjdGlvbkNyZWF0b3JzLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9jb21iaW5lUmVkdWNlcnMuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NvbXBvc2UuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NyZWF0ZVN0b3JlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvdXRpbHMvd2FybmluZy5qcyIsInNyYy9hY3Rpb25fdHlwZXMuanMiLCJzcmMvY3JlYXRlX3N0b3JlLmpzIiwic3JjL2hlYXJ0YmVhdC5qcyIsInNyYy9pby5qcyIsInNyYy9taWRpX2V2ZW50LmpzIiwic3JjL21pZGlfbm90ZS5qcyIsInNyYy9wYXJzZV9ldmVudHMuanMiLCJzcmMvcGFydC5qcyIsInNyYy9xYW1iaS5qcyIsInNyYy9yZWR1Y2VyLmpzIiwic3JjL3NjaGVkdWxlci5qcyIsInNyYy9zb25nLmpzIiwic3JjL3Rlc3Rfd2ViLmpzIiwic3JjL3RyYWNrLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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akMsa0JBQWdCLElBQUksRUFBSixHQUFTLE1BQU0sQ0FBTixHQUFVLENBQW5CLENBZGlCO0FBZWpDLGtCQUFnQixHQUFoQixDQWZpQztBQWdCakMsa0JBQWdCLE9BQU8sQ0FBUCxHQUFXLEtBQVgsR0FBbUIsS0FBSyxFQUFMLEdBQVUsT0FBTyxFQUFQLEdBQVksS0FBSyxHQUFMLEdBQVcsTUFBTSxFQUFOLEdBQVcsRUFBdEI7OztBQWhCeEIsU0FtQjFCO0FBQ0wsVUFBTSxDQUFOO0FBQ0EsWUFBUSxDQUFSO0FBQ0EsWUFBUSxDQUFSO0FBQ0EsaUJBQWEsRUFBYjtBQUNBLGtCQUFjLFlBQWQ7QUFDQSxpQkFBYSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLEVBQVYsQ0FBYjtHQU5GLENBbkJpQztDQUE1QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlR2V0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuXG4vKipcbiAqIEdldHMgdGhlIGBbW1Byb3RvdHlwZV1dYCBvZiBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtudWxsfE9iamVjdH0gUmV0dXJucyB0aGUgYFtbUHJvdG90eXBlXV1gLlxuICovXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZUdldFByb3RvdHlwZShPYmplY3QodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRQcm90b3R5cGU7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgaG9zdCBvYmplY3QgaW4gSUUgPCA5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgaG9zdCBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNIb3N0T2JqZWN0KHZhbHVlKSB7XG4gIC8vIE1hbnkgaG9zdCBvYmplY3RzIGFyZSBgT2JqZWN0YCBvYmplY3RzIHRoYXQgY2FuIGNvZXJjZSB0byBzdHJpbmdzXG4gIC8vIGRlc3BpdGUgaGF2aW5nIGltcHJvcGVybHkgZGVmaW5lZCBgdG9TdHJpbmdgIG1ldGhvZHMuXG4gIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgaWYgKHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlLnRvU3RyaW5nICE9ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gISEodmFsdWUgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSG9zdE9iamVjdDtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsInZhciBnZXRQcm90b3R5cGUgPSByZXF1aXJlKCcuL19nZXRQcm90b3R5cGUnKSxcbiAgICBpc0hvc3RPYmplY3QgPSByZXF1aXJlKCcuL19pc0hvc3RPYmplY3QnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIHRoYXQgaXMsIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZVxuICogYE9iamVjdGAgY29uc3RydWN0b3Igb3Igb25lIHdpdGggYSBgW1tQcm90b3R5cGVdXWAgb2YgYG51bGxgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC44LjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHxcbiAgICAgIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpICE9IG9iamVjdFRhZyB8fCBpc0hvc3RPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJlxuICAgIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmIGZ1bmNUb1N0cmluZy5jYWxsKEN0b3IpID09IG9iamVjdEN0b3JTdHJpbmcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUGxhaW5PYmplY3Q7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH1cblxudmFyIHJlcGVhdCA9IGZ1bmN0aW9uIHJlcGVhdChzdHIsIHRpbWVzKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodGltZXMgKyAxKS5qb2luKHN0cik7XG59O1xudmFyIHBhZCA9IGZ1bmN0aW9uIHBhZChudW0sIG1heExlbmd0aCkge1xuICByZXR1cm4gcmVwZWF0KFwiMFwiLCBtYXhMZW5ndGggLSBudW0udG9TdHJpbmcoKS5sZW5ndGgpICsgbnVtO1xufTtcbnZhciBmb3JtYXRUaW1lID0gZnVuY3Rpb24gZm9ybWF0VGltZSh0aW1lKSB7XG4gIHJldHVybiBcIkAgXCIgKyBwYWQodGltZS5nZXRIb3VycygpLCAyKSArIFwiOlwiICsgcGFkKHRpbWUuZ2V0TWludXRlcygpLCAyKSArIFwiOlwiICsgcGFkKHRpbWUuZ2V0U2Vjb25kcygpLCAyKSArIFwiLlwiICsgcGFkKHRpbWUuZ2V0TWlsbGlzZWNvbmRzKCksIDMpO1xufTtcblxuLy8gVXNlIHRoZSBuZXcgcGVyZm9ybWFuY2UgYXBpIHRvIGdldCBiZXR0ZXIgcHJlY2lzaW9uIGlmIGF2YWlsYWJsZVxudmFyIHRpbWVyID0gdHlwZW9mIHBlcmZvcm1hbmNlICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09IFwiZnVuY3Rpb25cIiA/IHBlcmZvcm1hbmNlIDogRGF0ZTtcblxuLyoqXG4gKiBwYXJzZSB0aGUgbGV2ZWwgb3B0aW9uIG9mIGNyZWF0ZUxvZ2dlclxuICpcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nIHwgZnVuY3Rpb24gfCBvYmplY3R9IGxldmVsIC0gY29uc29sZVtsZXZlbF1cbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7YXJyYXl9IHBheWxvYWRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlXG4gKi9cblxuZnVuY3Rpb24gZ2V0TG9nTGV2ZWwobGV2ZWwsIGFjdGlvbiwgcGF5bG9hZCwgdHlwZSkge1xuICBzd2l0Y2ggKHR5cGVvZiBsZXZlbCA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKGxldmVsKSkge1xuICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgIHJldHVybiB0eXBlb2YgbGV2ZWxbdHlwZV0gPT09IFwiZnVuY3Rpb25cIiA/IGxldmVsW3R5cGVdLmFwcGx5KGxldmVsLCBfdG9Db25zdW1hYmxlQXJyYXkocGF5bG9hZCkpIDogbGV2ZWxbdHlwZV07XG4gICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICByZXR1cm4gbGV2ZWwoYWN0aW9uKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGxldmVsO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBsb2dnZXIgd2l0aCBmb2xsb3dlZCBvcHRpb25zXG4gKlxuICogQG5hbWVzcGFjZVxuICogQHByb3BlcnR5IHtvYmplY3R9IG9wdGlvbnMgLSBvcHRpb25zIGZvciBsb2dnZXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nIHwgZnVuY3Rpb24gfCBvYmplY3R9IG9wdGlvbnMubGV2ZWwgLSBjb25zb2xlW2xldmVsXVxuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLmR1cmF0aW9uIC0gcHJpbnQgZHVyYXRpb24gb2YgZWFjaCBhY3Rpb24/XG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9wdGlvbnMudGltZXN0YW1wIC0gcHJpbnQgdGltZXN0YW1wIHdpdGggZWFjaCBhY3Rpb24/XG4gKiBAcHJvcGVydHkge29iamVjdH0gb3B0aW9ucy5jb2xvcnMgLSBjdXN0b20gY29sb3JzXG4gKiBAcHJvcGVydHkge29iamVjdH0gb3B0aW9ucy5sb2dnZXIgLSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgYGNvbnNvbGVgIEFQSVxuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLmxvZ0Vycm9ycyAtIHNob3VsZCBlcnJvcnMgaW4gYWN0aW9uIGV4ZWN1dGlvbiBiZSBjYXVnaHQsIGxvZ2dlZCwgYW5kIHJlLXRocm93bj9cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb3B0aW9ucy5jb2xsYXBzZWQgLSBpcyBncm91cCBjb2xsYXBzZWQ/XG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9wdGlvbnMucHJlZGljYXRlIC0gY29uZGl0aW9uIHdoaWNoIHJlc29sdmVzIGxvZ2dlciBiZWhhdmlvclxuICogQHByb3BlcnR5IHtmdW5jdGlvbn0gb3B0aW9ucy5zdGF0ZVRyYW5zZm9ybWVyIC0gdHJhbnNmb3JtIHN0YXRlIGJlZm9yZSBwcmludFxuICogQHByb3BlcnR5IHtmdW5jdGlvbn0gb3B0aW9ucy5hY3Rpb25UcmFuc2Zvcm1lciAtIHRyYW5zZm9ybSBhY3Rpb24gYmVmb3JlIHByaW50XG4gKiBAcHJvcGVydHkge2Z1bmN0aW9ufSBvcHRpb25zLmVycm9yVHJhbnNmb3JtZXIgLSB0cmFuc2Zvcm0gZXJyb3IgYmVmb3JlIHByaW50XG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlTG9nZ2VyKCkge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuICB2YXIgX29wdGlvbnMkbGV2ZWwgPSBvcHRpb25zLmxldmVsO1xuICB2YXIgbGV2ZWwgPSBfb3B0aW9ucyRsZXZlbCA9PT0gdW5kZWZpbmVkID8gXCJsb2dcIiA6IF9vcHRpb25zJGxldmVsO1xuICB2YXIgX29wdGlvbnMkbG9nZ2VyID0gb3B0aW9ucy5sb2dnZXI7XG4gIHZhciBsb2dnZXIgPSBfb3B0aW9ucyRsb2dnZXIgPT09IHVuZGVmaW5lZCA/IGNvbnNvbGUgOiBfb3B0aW9ucyRsb2dnZXI7XG4gIHZhciBfb3B0aW9ucyRsb2dFcnJvcnMgPSBvcHRpb25zLmxvZ0Vycm9ycztcbiAgdmFyIGxvZ0Vycm9ycyA9IF9vcHRpb25zJGxvZ0Vycm9ycyA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IF9vcHRpb25zJGxvZ0Vycm9ycztcbiAgdmFyIGNvbGxhcHNlZCA9IG9wdGlvbnMuY29sbGFwc2VkO1xuICB2YXIgcHJlZGljYXRlID0gb3B0aW9ucy5wcmVkaWNhdGU7XG4gIHZhciBfb3B0aW9ucyRkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb247XG4gIHZhciBkdXJhdGlvbiA9IF9vcHRpb25zJGR1cmF0aW9uID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IF9vcHRpb25zJGR1cmF0aW9uO1xuICB2YXIgX29wdGlvbnMkdGltZXN0YW1wID0gb3B0aW9ucy50aW1lc3RhbXA7XG4gIHZhciB0aW1lc3RhbXAgPSBfb3B0aW9ucyR0aW1lc3RhbXAgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBfb3B0aW9ucyR0aW1lc3RhbXA7XG4gIHZhciB0cmFuc2Zvcm1lciA9IG9wdGlvbnMudHJhbnNmb3JtZXI7XG4gIHZhciBfb3B0aW9ucyRzdGF0ZVRyYW5zZm8gPSBvcHRpb25zLnN0YXRlVHJhbnNmb3JtZXI7XG4gIHZhciAvLyBkZXByZWNhdGVkXG4gIHN0YXRlVHJhbnNmb3JtZXIgPSBfb3B0aW9ucyRzdGF0ZVRyYW5zZm8gPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfSA6IF9vcHRpb25zJHN0YXRlVHJhbnNmbztcbiAgdmFyIF9vcHRpb25zJGFjdGlvblRyYW5zZiA9IG9wdGlvbnMuYWN0aW9uVHJhbnNmb3JtZXI7XG4gIHZhciBhY3Rpb25UcmFuc2Zvcm1lciA9IF9vcHRpb25zJGFjdGlvblRyYW5zZiA9PT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKGFjdG4pIHtcbiAgICByZXR1cm4gYWN0bjtcbiAgfSA6IF9vcHRpb25zJGFjdGlvblRyYW5zZjtcbiAgdmFyIF9vcHRpb25zJGVycm9yVHJhbnNmbyA9IG9wdGlvbnMuZXJyb3JUcmFuc2Zvcm1lcjtcbiAgdmFyIGVycm9yVHJhbnNmb3JtZXIgPSBfb3B0aW9ucyRlcnJvclRyYW5zZm8gPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfSA6IF9vcHRpb25zJGVycm9yVHJhbnNmbztcbiAgdmFyIF9vcHRpb25zJGNvbG9ycyA9IG9wdGlvbnMuY29sb3JzO1xuICB2YXIgY29sb3JzID0gX29wdGlvbnMkY29sb3JzID09PSB1bmRlZmluZWQgPyB7XG4gICAgdGl0bGU6IGZ1bmN0aW9uIHRpdGxlKCkge1xuICAgICAgcmV0dXJuIFwiIzAwMDAwMFwiO1xuICAgIH0sXG4gICAgcHJldlN0YXRlOiBmdW5jdGlvbiBwcmV2U3RhdGUoKSB7XG4gICAgICByZXR1cm4gXCIjOUU5RTlFXCI7XG4gICAgfSxcbiAgICBhY3Rpb246IGZ1bmN0aW9uIGFjdGlvbigpIHtcbiAgICAgIHJldHVybiBcIiMwM0E5RjRcIjtcbiAgICB9LFxuICAgIG5leHRTdGF0ZTogZnVuY3Rpb24gbmV4dFN0YXRlKCkge1xuICAgICAgcmV0dXJuIFwiIzRDQUY1MFwiO1xuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uIGVycm9yKCkge1xuICAgICAgcmV0dXJuIFwiI0YyMDQwNFwiO1xuICAgIH1cbiAgfSA6IF9vcHRpb25zJGNvbG9ycztcblxuICAvLyBleGl0IGlmIGNvbnNvbGUgdW5kZWZpbmVkXG5cbiAgaWYgKHR5cGVvZiBsb2dnZXIgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfTtcbiAgfVxuXG4gIGlmICh0cmFuc2Zvcm1lcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJPcHRpb24gJ3RyYW5zZm9ybWVyJyBpcyBkZXByZWNhdGVkLCB1c2Ugc3RhdGVUcmFuc2Zvcm1lciBpbnN0ZWFkXCIpO1xuICB9XG5cbiAgdmFyIGxvZ0J1ZmZlciA9IFtdO1xuICBmdW5jdGlvbiBwcmludEJ1ZmZlcigpIHtcbiAgICBsb2dCdWZmZXIuZm9yRWFjaChmdW5jdGlvbiAobG9nRW50cnksIGtleSkge1xuICAgICAgdmFyIHN0YXJ0ZWQgPSBsb2dFbnRyeS5zdGFydGVkO1xuICAgICAgdmFyIHN0YXJ0ZWRUaW1lID0gbG9nRW50cnkuc3RhcnRlZFRpbWU7XG4gICAgICB2YXIgYWN0aW9uID0gbG9nRW50cnkuYWN0aW9uO1xuICAgICAgdmFyIHByZXZTdGF0ZSA9IGxvZ0VudHJ5LnByZXZTdGF0ZTtcbiAgICAgIHZhciBlcnJvciA9IGxvZ0VudHJ5LmVycm9yO1xuICAgICAgdmFyIHRvb2sgPSBsb2dFbnRyeS50b29rO1xuICAgICAgdmFyIG5leHRTdGF0ZSA9IGxvZ0VudHJ5Lm5leHRTdGF0ZTtcblxuICAgICAgdmFyIG5leHRFbnRyeSA9IGxvZ0J1ZmZlcltrZXkgKyAxXTtcbiAgICAgIGlmIChuZXh0RW50cnkpIHtcbiAgICAgICAgbmV4dFN0YXRlID0gbmV4dEVudHJ5LnByZXZTdGF0ZTtcbiAgICAgICAgdG9vayA9IG5leHRFbnRyeS5zdGFydGVkIC0gc3RhcnRlZDtcbiAgICAgIH1cbiAgICAgIC8vIG1lc3NhZ2VcbiAgICAgIHZhciBmb3JtYXR0ZWRBY3Rpb24gPSBhY3Rpb25UcmFuc2Zvcm1lcihhY3Rpb24pO1xuICAgICAgdmFyIGlzQ29sbGFwc2VkID0gdHlwZW9mIGNvbGxhcHNlZCA9PT0gXCJmdW5jdGlvblwiID8gY29sbGFwc2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgICAgIH0sIGFjdGlvbikgOiBjb2xsYXBzZWQ7XG5cbiAgICAgIHZhciBmb3JtYXR0ZWRUaW1lID0gZm9ybWF0VGltZShzdGFydGVkVGltZSk7XG4gICAgICB2YXIgdGl0bGVDU1MgPSBjb2xvcnMudGl0bGUgPyBcImNvbG9yOiBcIiArIGNvbG9ycy50aXRsZShmb3JtYXR0ZWRBY3Rpb24pICsgXCI7XCIgOiBudWxsO1xuICAgICAgdmFyIHRpdGxlID0gXCJhY3Rpb24gXCIgKyAodGltZXN0YW1wID8gZm9ybWF0dGVkVGltZSA6IFwiXCIpICsgXCIgXCIgKyBmb3JtYXR0ZWRBY3Rpb24udHlwZSArIFwiIFwiICsgKGR1cmF0aW9uID8gXCIoaW4gXCIgKyB0b29rLnRvRml4ZWQoMikgKyBcIiBtcylcIiA6IFwiXCIpO1xuXG4gICAgICAvLyByZW5kZXJcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChpc0NvbGxhcHNlZCkge1xuICAgICAgICAgIGlmIChjb2xvcnMudGl0bGUpIGxvZ2dlci5ncm91cENvbGxhcHNlZChcIiVjIFwiICsgdGl0bGUsIHRpdGxlQ1NTKTtlbHNlIGxvZ2dlci5ncm91cENvbGxhcHNlZCh0aXRsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGNvbG9ycy50aXRsZSkgbG9nZ2VyLmdyb3VwKFwiJWMgXCIgKyB0aXRsZSwgdGl0bGVDU1MpO2Vsc2UgbG9nZ2VyLmdyb3VwKHRpdGxlKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dnZXIubG9nKHRpdGxlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHByZXZTdGF0ZUxldmVsID0gZ2V0TG9nTGV2ZWwobGV2ZWwsIGZvcm1hdHRlZEFjdGlvbiwgW3ByZXZTdGF0ZV0sIFwicHJldlN0YXRlXCIpO1xuICAgICAgdmFyIGFjdGlvbkxldmVsID0gZ2V0TG9nTGV2ZWwobGV2ZWwsIGZvcm1hdHRlZEFjdGlvbiwgW2Zvcm1hdHRlZEFjdGlvbl0sIFwiYWN0aW9uXCIpO1xuICAgICAgdmFyIGVycm9yTGV2ZWwgPSBnZXRMb2dMZXZlbChsZXZlbCwgZm9ybWF0dGVkQWN0aW9uLCBbZXJyb3IsIHByZXZTdGF0ZV0sIFwiZXJyb3JcIik7XG4gICAgICB2YXIgbmV4dFN0YXRlTGV2ZWwgPSBnZXRMb2dMZXZlbChsZXZlbCwgZm9ybWF0dGVkQWN0aW9uLCBbbmV4dFN0YXRlXSwgXCJuZXh0U3RhdGVcIik7XG5cbiAgICAgIGlmIChwcmV2U3RhdGVMZXZlbCkge1xuICAgICAgICBpZiAoY29sb3JzLnByZXZTdGF0ZSkgbG9nZ2VyW3ByZXZTdGF0ZUxldmVsXShcIiVjIHByZXYgc3RhdGVcIiwgXCJjb2xvcjogXCIgKyBjb2xvcnMucHJldlN0YXRlKHByZXZTdGF0ZSkgKyBcIjsgZm9udC13ZWlnaHQ6IGJvbGRcIiwgcHJldlN0YXRlKTtlbHNlIGxvZ2dlcltwcmV2U3RhdGVMZXZlbF0oXCJwcmV2IHN0YXRlXCIsIHByZXZTdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhY3Rpb25MZXZlbCkge1xuICAgICAgICBpZiAoY29sb3JzLmFjdGlvbikgbG9nZ2VyW2FjdGlvbkxldmVsXShcIiVjIGFjdGlvblwiLCBcImNvbG9yOiBcIiArIGNvbG9ycy5hY3Rpb24oZm9ybWF0dGVkQWN0aW9uKSArIFwiOyBmb250LXdlaWdodDogYm9sZFwiLCBmb3JtYXR0ZWRBY3Rpb24pO2Vsc2UgbG9nZ2VyW2FjdGlvbkxldmVsXShcImFjdGlvblwiLCBmb3JtYXR0ZWRBY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXJyb3IgJiYgZXJyb3JMZXZlbCkge1xuICAgICAgICBpZiAoY29sb3JzLmVycm9yKSBsb2dnZXJbZXJyb3JMZXZlbF0oXCIlYyBlcnJvclwiLCBcImNvbG9yOiBcIiArIGNvbG9ycy5lcnJvcihlcnJvciwgcHJldlN0YXRlKSArIFwiOyBmb250LXdlaWdodDogYm9sZFwiLCBlcnJvcik7ZWxzZSBsb2dnZXJbZXJyb3JMZXZlbF0oXCJlcnJvclwiLCBlcnJvcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXh0U3RhdGVMZXZlbCkge1xuICAgICAgICBpZiAoY29sb3JzLm5leHRTdGF0ZSkgbG9nZ2VyW25leHRTdGF0ZUxldmVsXShcIiVjIG5leHQgc3RhdGVcIiwgXCJjb2xvcjogXCIgKyBjb2xvcnMubmV4dFN0YXRlKG5leHRTdGF0ZSkgKyBcIjsgZm9udC13ZWlnaHQ6IGJvbGRcIiwgbmV4dFN0YXRlKTtlbHNlIGxvZ2dlcltuZXh0U3RhdGVMZXZlbF0oXCJuZXh0IHN0YXRlXCIsIG5leHRTdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxvZ2dlci5ncm91cEVuZCgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dnZXIubG9nKFwi4oCU4oCUIGxvZyBlbmQg4oCU4oCUXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGxvZ0J1ZmZlci5sZW5ndGggPSAwO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIGdldFN0YXRlID0gX3JlZi5nZXRTdGF0ZTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIC8vIGV4aXQgZWFybHkgaWYgcHJlZGljYXRlIGZ1bmN0aW9uIHJldHVybnMgZmFsc2VcbiAgICAgICAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgPT09IFwiZnVuY3Rpb25cIiAmJiAhcHJlZGljYXRlKGdldFN0YXRlLCBhY3Rpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsb2dFbnRyeSA9IHt9O1xuICAgICAgICBsb2dCdWZmZXIucHVzaChsb2dFbnRyeSk7XG5cbiAgICAgICAgbG9nRW50cnkuc3RhcnRlZCA9IHRpbWVyLm5vdygpO1xuICAgICAgICBsb2dFbnRyeS5zdGFydGVkVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGxvZ0VudHJ5LnByZXZTdGF0ZSA9IHN0YXRlVHJhbnNmb3JtZXIoZ2V0U3RhdGUoKSk7XG4gICAgICAgIGxvZ0VudHJ5LmFjdGlvbiA9IGFjdGlvbjtcblxuICAgICAgICB2YXIgcmV0dXJuZWRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGxvZ0Vycm9ycykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm5lZFZhbHVlID0gbmV4dChhY3Rpb24pO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ0VudHJ5LmVycm9yID0gZXJyb3JUcmFuc2Zvcm1lcihlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuZWRWYWx1ZSA9IG5leHQoYWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ0VudHJ5LnRvb2sgPSB0aW1lci5ub3coKSAtIGxvZ0VudHJ5LnN0YXJ0ZWQ7XG4gICAgICAgIGxvZ0VudHJ5Lm5leHRTdGF0ZSA9IHN0YXRlVHJhbnNmb3JtZXIoZ2V0U3RhdGUoKSk7XG5cbiAgICAgICAgcHJpbnRCdWZmZXIoKTtcblxuICAgICAgICBpZiAobG9nRW50cnkuZXJyb3IpIHRocm93IGxvZ0VudHJ5LmVycm9yO1xuICAgICAgICByZXR1cm4gcmV0dXJuZWRWYWx1ZTtcbiAgICAgIH07XG4gICAgfTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVMb2dnZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1snZGVmYXVsdCddID0gdGh1bmtNaWRkbGV3YXJlO1xuZnVuY3Rpb24gdGh1bmtNaWRkbGV3YXJlKF9yZWYpIHtcbiAgdmFyIGRpc3BhdGNoID0gX3JlZi5kaXNwYXRjaDtcbiAgdmFyIGdldFN0YXRlID0gX3JlZi5nZXRTdGF0ZTtcblxuICByZXR1cm4gZnVuY3Rpb24gKG5leHQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgaWYgKHR5cGVvZiBhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbihkaXNwYXRjaCwgZ2V0U3RhdGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICAgIH07XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBhcHBseU1pZGRsZXdhcmU7XG5cbnZhciBfY29tcG9zZSA9IHJlcXVpcmUoJy4vY29tcG9zZScpO1xuXG52YXIgX2NvbXBvc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzdG9yZSBlbmhhbmNlciB0aGF0IGFwcGxpZXMgbWlkZGxld2FyZSB0byB0aGUgZGlzcGF0Y2ggbWV0aG9kXG4gKiBvZiB0aGUgUmVkdXggc3RvcmUuIFRoaXMgaXMgaGFuZHkgZm9yIGEgdmFyaWV0eSBvZiB0YXNrcywgc3VjaCBhcyBleHByZXNzaW5nXG4gKiBhc3luY2hyb25vdXMgYWN0aW9ucyBpbiBhIGNvbmNpc2UgbWFubmVyLCBvciBsb2dnaW5nIGV2ZXJ5IGFjdGlvbiBwYXlsb2FkLlxuICpcbiAqIFNlZSBgcmVkdXgtdGh1bmtgIHBhY2thZ2UgYXMgYW4gZXhhbXBsZSBvZiB0aGUgUmVkdXggbWlkZGxld2FyZS5cbiAqXG4gKiBCZWNhdXNlIG1pZGRsZXdhcmUgaXMgcG90ZW50aWFsbHkgYXN5bmNocm9ub3VzLCB0aGlzIHNob3VsZCBiZSB0aGUgZmlyc3RcbiAqIHN0b3JlIGVuaGFuY2VyIGluIHRoZSBjb21wb3NpdGlvbiBjaGFpbi5cbiAqXG4gKiBOb3RlIHRoYXQgZWFjaCBtaWRkbGV3YXJlIHdpbGwgYmUgZ2l2ZW4gdGhlIGBkaXNwYXRjaGAgYW5kIGBnZXRTdGF0ZWAgZnVuY3Rpb25zXG4gKiBhcyBuYW1lZCBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gbWlkZGxld2FyZXMgVGhlIG1pZGRsZXdhcmUgY2hhaW4gdG8gYmUgYXBwbGllZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBzdG9yZSBlbmhhbmNlciBhcHBseWluZyB0aGUgbWlkZGxld2FyZS5cbiAqL1xuZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgbWlkZGxld2FyZXMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBtaWRkbGV3YXJlc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoY3JlYXRlU3RvcmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSwgZW5oYW5jZXIpIHtcbiAgICAgIHZhciBzdG9yZSA9IGNyZWF0ZVN0b3JlKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSwgZW5oYW5jZXIpO1xuICAgICAgdmFyIF9kaXNwYXRjaCA9IHN0b3JlLmRpc3BhdGNoO1xuICAgICAgdmFyIGNoYWluID0gW107XG5cbiAgICAgIHZhciBtaWRkbGV3YXJlQVBJID0ge1xuICAgICAgICBnZXRTdGF0ZTogc3RvcmUuZ2V0U3RhdGUsXG4gICAgICAgIGRpc3BhdGNoOiBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gX2Rpc3BhdGNoKGFjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjaGFpbiA9IG1pZGRsZXdhcmVzLm1hcChmdW5jdGlvbiAobWlkZGxld2FyZSkge1xuICAgICAgICByZXR1cm4gbWlkZGxld2FyZShtaWRkbGV3YXJlQVBJKTtcbiAgICAgIH0pO1xuICAgICAgX2Rpc3BhdGNoID0gX2NvbXBvc2UyW1wiZGVmYXVsdFwiXS5hcHBseSh1bmRlZmluZWQsIGNoYWluKShzdG9yZS5kaXNwYXRjaCk7XG5cbiAgICAgIHJldHVybiBfZXh0ZW5kcyh7fSwgc3RvcmUsIHtcbiAgICAgICAgZGlzcGF0Y2g6IF9kaXNwYXRjaFxuICAgICAgfSk7XG4gICAgfTtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGJpbmRBY3Rpb25DcmVhdG9ycztcbmZ1bmN0aW9uIGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3IsIGRpc3BhdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoKGFjdGlvbkNyZWF0b3IuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBhY3Rpb24gY3JlYXRvcnMsIGludG8gYW4gb2JqZWN0IHdpdGggdGhlXG4gKiBzYW1lIGtleXMsIGJ1dCB3aXRoIGV2ZXJ5IGZ1bmN0aW9uIHdyYXBwZWQgaW50byBhIGBkaXNwYXRjaGAgY2FsbCBzbyB0aGV5XG4gKiBtYXkgYmUgaW52b2tlZCBkaXJlY3RseS4gVGhpcyBpcyBqdXN0IGEgY29udmVuaWVuY2UgbWV0aG9kLCBhcyB5b3UgY2FuIGNhbGxcbiAqIGBzdG9yZS5kaXNwYXRjaChNeUFjdGlvbkNyZWF0b3JzLmRvU29tZXRoaW5nKCkpYCB5b3Vyc2VsZiBqdXN0IGZpbmUuXG4gKlxuICogRm9yIGNvbnZlbmllbmNlLCB5b3UgY2FuIGFsc28gcGFzcyBhIHNpbmdsZSBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQsXG4gKiBhbmQgZ2V0IGEgZnVuY3Rpb24gaW4gcmV0dXJuLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fSBhY3Rpb25DcmVhdG9ycyBBbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBhY3Rpb25cbiAqIGNyZWF0b3IgZnVuY3Rpb25zLiBPbmUgaGFuZHkgd2F5IHRvIG9idGFpbiBpdCBpcyB0byB1c2UgRVM2IGBpbXBvcnQgKiBhc2BcbiAqIHN5bnRheC4gWW91IG1heSBhbHNvIHBhc3MgYSBzaW5nbGUgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZGlzcGF0Y2ggVGhlIGBkaXNwYXRjaGAgZnVuY3Rpb24gYXZhaWxhYmxlIG9uIHlvdXIgUmVkdXhcbiAqIHN0b3JlLlxuICpcbiAqIEByZXR1cm5zIHtGdW5jdGlvbnxPYmplY3R9IFRoZSBvYmplY3QgbWltaWNraW5nIHRoZSBvcmlnaW5hbCBvYmplY3QsIGJ1dCB3aXRoXG4gKiBldmVyeSBhY3Rpb24gY3JlYXRvciB3cmFwcGVkIGludG8gdGhlIGBkaXNwYXRjaGAgY2FsbC4gSWYgeW91IHBhc3NlZCBhXG4gKiBmdW5jdGlvbiBhcyBgYWN0aW9uQ3JlYXRvcnNgLCB0aGUgcmV0dXJuIHZhbHVlIHdpbGwgYWxzbyBiZSBhIHNpbmdsZVxuICogZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJpbmRBY3Rpb25DcmVhdG9ycyhhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9ycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9ycyAhPT0gJ29iamVjdCcgfHwgYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBY3Rpb25DcmVhdG9ycyBleHBlY3RlZCBhbiBvYmplY3Qgb3IgYSBmdW5jdGlvbiwgaW5zdGVhZCByZWNlaXZlZCAnICsgKGFjdGlvbkNyZWF0b3JzID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIGFjdGlvbkNyZWF0b3JzKSArICcuICcgKyAnRGlkIHlvdSB3cml0ZSBcImltcG9ydCBBY3Rpb25DcmVhdG9ycyBmcm9tXCIgaW5zdGVhZCBvZiBcImltcG9ydCAqIGFzIEFjdGlvbkNyZWF0b3JzIGZyb21cIj8nKTtcbiAgfVxuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWN0aW9uQ3JlYXRvcnMpO1xuICB2YXIgYm91bmRBY3Rpb25DcmVhdG9ycyA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICB2YXIgYWN0aW9uQ3JlYXRvciA9IGFjdGlvbkNyZWF0b3JzW2tleV07XG4gICAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBib3VuZEFjdGlvbkNyZWF0b3JzW2tleV0gPSBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9yLCBkaXNwYXRjaCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBib3VuZEFjdGlvbkNyZWF0b3JzO1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gY29tYmluZVJlZHVjZXJzO1xuXG52YXIgX2NyZWF0ZVN0b3JlID0gcmVxdWlyZSgnLi9jcmVhdGVTdG9yZScpO1xuXG52YXIgX2lzUGxhaW5PYmplY3QgPSByZXF1aXJlKCdsb2Rhc2gvaXNQbGFpbk9iamVjdCcpO1xuXG52YXIgX2lzUGxhaW5PYmplY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNQbGFpbk9iamVjdCk7XG5cbnZhciBfd2FybmluZyA9IHJlcXVpcmUoJy4vdXRpbHMvd2FybmluZycpO1xuXG52YXIgX3dhcm5pbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2FybmluZyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBnZXRVbmRlZmluZWRTdGF0ZUVycm9yTWVzc2FnZShrZXksIGFjdGlvbikge1xuICB2YXIgYWN0aW9uVHlwZSA9IGFjdGlvbiAmJiBhY3Rpb24udHlwZTtcbiAgdmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25UeXBlICYmICdcIicgKyBhY3Rpb25UeXBlLnRvU3RyaW5nKCkgKyAnXCInIHx8ICdhbiBhY3Rpb24nO1xuXG4gIHJldHVybiAnUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIGhhbmRsaW5nICcgKyBhY3Rpb25OYW1lICsgJy4gJyArICdUbyBpZ25vcmUgYW4gYWN0aW9uLCB5b3UgbXVzdCBleHBsaWNpdGx5IHJldHVybiB0aGUgcHJldmlvdXMgc3RhdGUuJztcbn1cblxuZnVuY3Rpb24gZ2V0VW5leHBlY3RlZFN0YXRlU2hhcGVXYXJuaW5nTWVzc2FnZShpbnB1dFN0YXRlLCByZWR1Y2VycywgYWN0aW9uKSB7XG4gIHZhciByZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKHJlZHVjZXJzKTtcbiAgdmFyIGFyZ3VtZW50TmFtZSA9IGFjdGlvbiAmJiBhY3Rpb24udHlwZSA9PT0gX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgPyAnaW5pdGlhbFN0YXRlIGFyZ3VtZW50IHBhc3NlZCB0byBjcmVhdGVTdG9yZScgOiAncHJldmlvdXMgc3RhdGUgcmVjZWl2ZWQgYnkgdGhlIHJlZHVjZXInO1xuXG4gIGlmIChyZWR1Y2VyS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJ1N0b3JlIGRvZXMgbm90IGhhdmUgYSB2YWxpZCByZWR1Y2VyLiBNYWtlIHN1cmUgdGhlIGFyZ3VtZW50IHBhc3NlZCAnICsgJ3RvIGNvbWJpbmVSZWR1Y2VycyBpcyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSByZWR1Y2Vycy4nO1xuICB9XG5cbiAgaWYgKCEoMCwgX2lzUGxhaW5PYmplY3QyW1wiZGVmYXVsdFwiXSkoaW5wdXRTdGF0ZSkpIHtcbiAgICByZXR1cm4gJ1RoZSAnICsgYXJndW1lbnROYW1lICsgJyBoYXMgdW5leHBlY3RlZCB0eXBlIG9mIFwiJyArIHt9LnRvU3RyaW5nLmNhbGwoaW5wdXRTdGF0ZSkubWF0Y2goL1xccyhbYS16fEEtWl0rKS8pWzFdICsgJ1wiLiBFeHBlY3RlZCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nICcgKyAoJ2tleXM6IFwiJyArIHJlZHVjZXJLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiJyk7XG4gIH1cblxuICB2YXIgdW5leHBlY3RlZEtleXMgPSBPYmplY3Qua2V5cyhpbnB1dFN0YXRlKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiAhcmVkdWNlcnMuaGFzT3duUHJvcGVydHkoa2V5KTtcbiAgfSk7XG5cbiAgaWYgKHVuZXhwZWN0ZWRLZXlzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gJ1VuZXhwZWN0ZWQgJyArICh1bmV4cGVjdGVkS2V5cy5sZW5ndGggPiAxID8gJ2tleXMnIDogJ2tleScpICsgJyAnICsgKCdcIicgKyB1bmV4cGVjdGVkS2V5cy5qb2luKCdcIiwgXCInKSArICdcIiBmb3VuZCBpbiAnICsgYXJndW1lbnROYW1lICsgJy4gJykgKyAnRXhwZWN0ZWQgdG8gZmluZCBvbmUgb2YgdGhlIGtub3duIHJlZHVjZXIga2V5cyBpbnN0ZWFkOiAnICsgKCdcIicgKyByZWR1Y2VyS2V5cy5qb2luKCdcIiwgXCInKSArICdcIi4gVW5leHBlY3RlZCBrZXlzIHdpbGwgYmUgaWdub3JlZC4nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRSZWR1Y2VyU2FuaXR5KHJlZHVjZXJzKSB7XG4gIE9iamVjdC5rZXlzKHJlZHVjZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgcmVkdWNlciA9IHJlZHVjZXJzW2tleV07XG4gICAgdmFyIGluaXRpYWxTdGF0ZSA9IHJlZHVjZXIodW5kZWZpbmVkLCB7IHR5cGU6IF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUIH0pO1xuXG4gICAgaWYgKHR5cGVvZiBpbml0aWFsU3RhdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24uICcgKyAnSWYgdGhlIHN0YXRlIHBhc3NlZCB0byB0aGUgcmVkdWNlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0ICcgKyAnZXhwbGljaXRseSByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUuIFRoZSBpbml0aWFsIHN0YXRlIG1heSAnICsgJ25vdCBiZSB1bmRlZmluZWQuJyk7XG4gICAgfVxuXG4gICAgdmFyIHR5cGUgPSAnQEByZWR1eC9QUk9CRV9VTktOT1dOX0FDVElPTl8nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpLnNwbGl0KCcnKS5qb2luKCcuJyk7XG4gICAgaWYgKHR5cGVvZiByZWR1Y2VyKHVuZGVmaW5lZCwgeyB0eXBlOiB0eXBlIH0pID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgd2hlbiBwcm9iZWQgd2l0aCBhIHJhbmRvbSB0eXBlLiAnICsgKCdEb25cXCd0IHRyeSB0byBoYW5kbGUgJyArIF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUICsgJyBvciBvdGhlciBhY3Rpb25zIGluIFwicmVkdXgvKlwiICcpICsgJ25hbWVzcGFjZS4gVGhleSBhcmUgY29uc2lkZXJlZCBwcml2YXRlLiBJbnN0ZWFkLCB5b3UgbXVzdCByZXR1cm4gdGhlICcgKyAnY3VycmVudCBzdGF0ZSBmb3IgYW55IHVua25vd24gYWN0aW9ucywgdW5sZXNzIGl0IGlzIHVuZGVmaW5lZCwgJyArICdpbiB3aGljaCBjYXNlIHlvdSBtdXN0IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZSwgcmVnYXJkbGVzcyBvZiB0aGUgJyArICdhY3Rpb24gdHlwZS4gVGhlIGluaXRpYWwgc3RhdGUgbWF5IG5vdCBiZSB1bmRlZmluZWQuJyk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBkaWZmZXJlbnQgcmVkdWNlciBmdW5jdGlvbnMsIGludG8gYSBzaW5nbGVcbiAqIHJlZHVjZXIgZnVuY3Rpb24uIEl0IHdpbGwgY2FsbCBldmVyeSBjaGlsZCByZWR1Y2VyLCBhbmQgZ2F0aGVyIHRoZWlyIHJlc3VsdHNcbiAqIGludG8gYSBzaW5nbGUgc3RhdGUgb2JqZWN0LCB3aG9zZSBrZXlzIGNvcnJlc3BvbmQgdG8gdGhlIGtleXMgb2YgdGhlIHBhc3NlZFxuICogcmVkdWNlciBmdW5jdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlZHVjZXJzIEFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgY29ycmVzcG9uZCB0byBkaWZmZXJlbnRcbiAqIHJlZHVjZXIgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZSBjb21iaW5lZCBpbnRvIG9uZS4gT25lIGhhbmR5IHdheSB0byBvYnRhaW5cbiAqIGl0IGlzIHRvIHVzZSBFUzYgYGltcG9ydCAqIGFzIHJlZHVjZXJzYCBzeW50YXguIFRoZSByZWR1Y2VycyBtYXkgbmV2ZXIgcmV0dXJuXG4gKiB1bmRlZmluZWQgZm9yIGFueSBhY3Rpb24uIEluc3RlYWQsIHRoZXkgc2hvdWxkIHJldHVybiB0aGVpciBpbml0aWFsIHN0YXRlXG4gKiBpZiB0aGUgc3RhdGUgcGFzc2VkIHRvIHRoZW0gd2FzIHVuZGVmaW5lZCwgYW5kIHRoZSBjdXJyZW50IHN0YXRlIGZvciBhbnlcbiAqIHVucmVjb2duaXplZCBhY3Rpb24uXG4gKlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHJlZHVjZXIgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGV2ZXJ5IHJlZHVjZXIgaW5zaWRlIHRoZVxuICogcGFzc2VkIG9iamVjdCwgYW5kIGJ1aWxkcyBhIHN0YXRlIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNoYXBlLlxuICovXG5mdW5jdGlvbiBjb21iaW5lUmVkdWNlcnMocmVkdWNlcnMpIHtcbiAgdmFyIHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICB2YXIgZmluYWxSZWR1Y2VycyA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZHVjZXJLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IHJlZHVjZXJLZXlzW2ldO1xuICAgIGlmICh0eXBlb2YgcmVkdWNlcnNba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZmluYWxSZWR1Y2Vyc1trZXldID0gcmVkdWNlcnNba2V5XTtcbiAgICB9XG4gIH1cbiAgdmFyIGZpbmFsUmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhmaW5hbFJlZHVjZXJzKTtcblxuICB2YXIgc2FuaXR5RXJyb3I7XG4gIHRyeSB7XG4gICAgYXNzZXJ0UmVkdWNlclNhbml0eShmaW5hbFJlZHVjZXJzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHNhbml0eUVycm9yID0gZTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBjb21iaW5hdGlvbigpIHtcbiAgICB2YXIgc3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgYWN0aW9uID0gYXJndW1lbnRzWzFdO1xuXG4gICAgaWYgKHNhbml0eUVycm9yKSB7XG4gICAgICB0aHJvdyBzYW5pdHlFcnJvcjtcbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgdmFyIHdhcm5pbmdNZXNzYWdlID0gZ2V0VW5leHBlY3RlZFN0YXRlU2hhcGVXYXJuaW5nTWVzc2FnZShzdGF0ZSwgZmluYWxSZWR1Y2VycywgYWN0aW9uKTtcbiAgICAgIGlmICh3YXJuaW5nTWVzc2FnZSkge1xuICAgICAgICAoMCwgX3dhcm5pbmcyW1wiZGVmYXVsdFwiXSkod2FybmluZ01lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBoYXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgdmFyIG5leHRTdGF0ZSA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmluYWxSZWR1Y2VyS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGZpbmFsUmVkdWNlcktleXNbaV07XG4gICAgICB2YXIgcmVkdWNlciA9IGZpbmFsUmVkdWNlcnNba2V5XTtcbiAgICAgIHZhciBwcmV2aW91c1N0YXRlRm9yS2V5ID0gc3RhdGVba2V5XTtcbiAgICAgIHZhciBuZXh0U3RhdGVGb3JLZXkgPSByZWR1Y2VyKHByZXZpb3VzU3RhdGVGb3JLZXksIGFjdGlvbik7XG4gICAgICBpZiAodHlwZW9mIG5leHRTdGF0ZUZvcktleSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IGdldFVuZGVmaW5lZFN0YXRlRXJyb3JNZXNzYWdlKGtleSwgYWN0aW9uKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBuZXh0U3RhdGVba2V5XSA9IG5leHRTdGF0ZUZvcktleTtcbiAgICAgIGhhc0NoYW5nZWQgPSBoYXNDaGFuZ2VkIHx8IG5leHRTdGF0ZUZvcktleSAhPT0gcHJldmlvdXNTdGF0ZUZvcktleTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc0NoYW5nZWQgPyBuZXh0U3RhdGUgOiBzdGF0ZTtcbiAgfTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gY29tcG9zZTtcbi8qKlxuICogQ29tcG9zZXMgc2luZ2xlLWFyZ3VtZW50IGZ1bmN0aW9ucyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKlxuICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gZnVuY3MgVGhlIGZ1bmN0aW9ucyB0byBjb21wb3NlLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIG9idGFpbmVkIGJ5IGNvbXBvc2luZyBmdW5jdGlvbnMgZnJvbSByaWdodCB0b1xuICogbGVmdC4gRm9yIGV4YW1wbGUsIGNvbXBvc2UoZiwgZywgaCkgaXMgaWRlbnRpY2FsIHRvIGFyZyA9PiBmKGcoaChhcmcpKSkuXG4gKi9cbmZ1bmN0aW9uIGNvbXBvc2UoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBmdW5jcyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGZ1bmNzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoZnVuY3MubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8PSAwID8gdW5kZWZpbmVkIDogYXJndW1lbnRzWzBdO1xuICAgIH1cblxuICAgIHZhciBsYXN0ID0gZnVuY3NbZnVuY3MubGVuZ3RoIC0gMV07XG4gICAgdmFyIHJlc3QgPSBmdW5jcy5zbGljZSgwLCAtMSk7XG5cbiAgICByZXR1cm4gcmVzdC5yZWR1Y2VSaWdodChmdW5jdGlvbiAoY29tcG9zZWQsIGYpIHtcbiAgICAgIHJldHVybiBmKGNvbXBvc2VkKTtcbiAgICB9LCBsYXN0LmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSk7XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5BY3Rpb25UeXBlcyA9IHVuZGVmaW5lZDtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gY3JlYXRlU3RvcmU7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qKlxuICogVGhlc2UgYXJlIHByaXZhdGUgYWN0aW9uIHR5cGVzIHJlc2VydmVkIGJ5IFJlZHV4LlxuICogRm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHlvdSBtdXN0IHJldHVybiB0aGUgY3VycmVudCBzdGF0ZS5cbiAqIElmIHRoZSBjdXJyZW50IHN0YXRlIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLlxuICogRG8gbm90IHJlZmVyZW5jZSB0aGVzZSBhY3Rpb24gdHlwZXMgZGlyZWN0bHkgaW4geW91ciBjb2RlLlxuICovXG52YXIgQWN0aW9uVHlwZXMgPSBleHBvcnRzLkFjdGlvblR5cGVzID0ge1xuICBJTklUOiAnQEByZWR1eC9JTklUJ1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgUmVkdXggc3RvcmUgdGhhdCBob2xkcyB0aGUgc3RhdGUgdHJlZS5cbiAqIFRoZSBvbmx5IHdheSB0byBjaGFuZ2UgdGhlIGRhdGEgaW4gdGhlIHN0b3JlIGlzIHRvIGNhbGwgYGRpc3BhdGNoKClgIG9uIGl0LlxuICpcbiAqIFRoZXJlIHNob3VsZCBvbmx5IGJlIGEgc2luZ2xlIHN0b3JlIGluIHlvdXIgYXBwLiBUbyBzcGVjaWZ5IGhvdyBkaWZmZXJlbnRcbiAqIHBhcnRzIG9mIHRoZSBzdGF0ZSB0cmVlIHJlc3BvbmQgdG8gYWN0aW9ucywgeW91IG1heSBjb21iaW5lIHNldmVyYWwgcmVkdWNlcnNcbiAqIGludG8gYSBzaW5nbGUgcmVkdWNlciBmdW5jdGlvbiBieSB1c2luZyBgY29tYmluZVJlZHVjZXJzYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWR1Y2VyIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBuZXh0IHN0YXRlIHRyZWUsIGdpdmVuXG4gKiB0aGUgY3VycmVudCBzdGF0ZSB0cmVlIGFuZCB0aGUgYWN0aW9uIHRvIGhhbmRsZS5cbiAqXG4gKiBAcGFyYW0ge2FueX0gW2luaXRpYWxTdGF0ZV0gVGhlIGluaXRpYWwgc3RhdGUuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBoeWRyYXRlIHRoZSBzdGF0ZSBmcm9tIHRoZSBzZXJ2ZXIgaW4gdW5pdmVyc2FsIGFwcHMsIG9yIHRvIHJlc3RvcmUgYVxuICogcHJldmlvdXNseSBzZXJpYWxpemVkIHVzZXIgc2Vzc2lvbi5cbiAqIElmIHlvdSB1c2UgYGNvbWJpbmVSZWR1Y2Vyc2AgdG8gcHJvZHVjZSB0aGUgcm9vdCByZWR1Y2VyIGZ1bmN0aW9uLCB0aGlzIG11c3QgYmVcbiAqIGFuIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNoYXBlIGFzIGBjb21iaW5lUmVkdWNlcnNgIGtleXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZW5oYW5jZXIgVGhlIHN0b3JlIGVuaGFuY2VyLiBZb3UgbWF5IG9wdGlvbmFsbHkgc3BlY2lmeSBpdFxuICogdG8gZW5oYW5jZSB0aGUgc3RvcmUgd2l0aCB0aGlyZC1wYXJ0eSBjYXBhYmlsaXRpZXMgc3VjaCBhcyBtaWRkbGV3YXJlLFxuICogdGltZSB0cmF2ZWwsIHBlcnNpc3RlbmNlLCBldGMuIFRoZSBvbmx5IHN0b3JlIGVuaGFuY2VyIHRoYXQgc2hpcHMgd2l0aCBSZWR1eFxuICogaXMgYGFwcGx5TWlkZGxld2FyZSgpYC5cbiAqXG4gKiBAcmV0dXJucyB7U3RvcmV9IEEgUmVkdXggc3RvcmUgdGhhdCBsZXRzIHlvdSByZWFkIHRoZSBzdGF0ZSwgZGlzcGF0Y2ggYWN0aW9uc1xuICogYW5kIHN1YnNjcmliZSB0byBjaGFuZ2VzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVTdG9yZShyZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGVuaGFuY2VyKSB7XG4gIGlmICh0eXBlb2YgaW5pdGlhbFN0YXRlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBlbmhhbmNlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBlbmhhbmNlciA9IGluaXRpYWxTdGF0ZTtcbiAgICBpbml0aWFsU3RhdGUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGVuaGFuY2VyICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIGVuaGFuY2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVuaGFuY2VyKGNyZWF0ZVN0b3JlKShyZWR1Y2VyLCBpbml0aWFsU3RhdGUpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiByZWR1Y2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgcmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIGN1cnJlbnRSZWR1Y2VyID0gcmVkdWNlcjtcbiAgdmFyIGN1cnJlbnRTdGF0ZSA9IGluaXRpYWxTdGF0ZTtcbiAgdmFyIGN1cnJlbnRMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzO1xuICB2YXIgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKG5leHRMaXN0ZW5lcnMgPT09IGN1cnJlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzLnNsaWNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBzdGF0ZSB0cmVlIG1hbmFnZWQgYnkgdGhlIHN0b3JlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7YW55fSBUaGUgY3VycmVudCBzdGF0ZSB0cmVlIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gICAqL1xuICBmdW5jdGlvbiBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4gY3VycmVudFN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBjaGFuZ2UgbGlzdGVuZXIuIEl0IHdpbGwgYmUgY2FsbGVkIGFueSB0aW1lIGFuIGFjdGlvbiBpcyBkaXNwYXRjaGVkLFxuICAgKiBhbmQgc29tZSBwYXJ0IG9mIHRoZSBzdGF0ZSB0cmVlIG1heSBwb3RlbnRpYWxseSBoYXZlIGNoYW5nZWQuIFlvdSBtYXkgdGhlblxuICAgKiBjYWxsIGBnZXRTdGF0ZSgpYCB0byByZWFkIHRoZSBjdXJyZW50IHN0YXRlIHRyZWUgaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICpcbiAgICogWW91IG1heSBjYWxsIGBkaXNwYXRjaCgpYCBmcm9tIGEgY2hhbmdlIGxpc3RlbmVyLCB3aXRoIHRoZSBmb2xsb3dpbmdcbiAgICogY2F2ZWF0czpcbiAgICpcbiAgICogMS4gVGhlIHN1YnNjcmlwdGlvbnMgYXJlIHNuYXBzaG90dGVkIGp1c3QgYmVmb3JlIGV2ZXJ5IGBkaXNwYXRjaCgpYCBjYWxsLlxuICAgKiBJZiB5b3Ugc3Vic2NyaWJlIG9yIHVuc3Vic2NyaWJlIHdoaWxlIHRoZSBsaXN0ZW5lcnMgYXJlIGJlaW5nIGludm9rZWQsIHRoaXNcbiAgICogd2lsbCBub3QgaGF2ZSBhbnkgZWZmZWN0IG9uIHRoZSBgZGlzcGF0Y2goKWAgdGhhdCBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MuXG4gICAqIEhvd2V2ZXIsIHRoZSBuZXh0IGBkaXNwYXRjaCgpYCBjYWxsLCB3aGV0aGVyIG5lc3RlZCBvciBub3QsIHdpbGwgdXNlIGEgbW9yZVxuICAgKiByZWNlbnQgc25hcHNob3Qgb2YgdGhlIHN1YnNjcmlwdGlvbiBsaXN0LlxuICAgKlxuICAgKiAyLiBUaGUgbGlzdGVuZXIgc2hvdWxkIG5vdCBleHBlY3QgdG8gc2VlIGFsbCBzdGF0ZXMgY2hhbmdlcywgYXMgdGhlIHN0YXRlXG4gICAqIG1pZ2h0IGhhdmUgYmVlbiB1cGRhdGVkIG11bHRpcGxlIHRpbWVzIGR1cmluZyBhIG5lc3RlZCBgZGlzcGF0Y2goKWAgYmVmb3JlXG4gICAqIHRoZSBsaXN0ZW5lciBpcyBjYWxsZWQuIEl0IGlzLCBob3dldmVyLCBndWFyYW50ZWVkIHRoYXQgYWxsIHN1YnNjcmliZXJzXG4gICAqIHJlZ2lzdGVyZWQgYmVmb3JlIHRoZSBgZGlzcGF0Y2goKWAgc3RhcnRlZCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBsYXRlc3RcbiAgICogc3RhdGUgYnkgdGhlIHRpbWUgaXQgZXhpdHMuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIEEgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCBvbiBldmVyeSBkaXNwYXRjaC5cbiAgICogQHJldHVybnMge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGlzIGNoYW5nZSBsaXN0ZW5lci5cbiAgICovXG4gIGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgbGlzdGVuZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICB2YXIgaXNTdWJzY3JpYmVkID0gdHJ1ZTtcblxuICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICBuZXh0TGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKCkge1xuICAgICAgaWYgKCFpc1N1YnNjcmliZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpc1N1YnNjcmliZWQgPSBmYWxzZTtcblxuICAgICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgICAgdmFyIGluZGV4ID0gbmV4dExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIG5leHRMaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYW4gYWN0aW9uLiBJdCBpcyB0aGUgb25seSB3YXkgdG8gdHJpZ2dlciBhIHN0YXRlIGNoYW5nZS5cbiAgICpcbiAgICogVGhlIGByZWR1Y2VyYCBmdW5jdGlvbiwgdXNlZCB0byBjcmVhdGUgdGhlIHN0b3JlLCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZVxuICAgKiBjdXJyZW50IHN0YXRlIHRyZWUgYW5kIHRoZSBnaXZlbiBgYWN0aW9uYC4gSXRzIHJldHVybiB2YWx1ZSB3aWxsXG4gICAqIGJlIGNvbnNpZGVyZWQgdGhlICoqbmV4dCoqIHN0YXRlIG9mIHRoZSB0cmVlLCBhbmQgdGhlIGNoYW5nZSBsaXN0ZW5lcnNcbiAgICogd2lsbCBiZSBub3RpZmllZC5cbiAgICpcbiAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb25seSBzdXBwb3J0cyBwbGFpbiBvYmplY3QgYWN0aW9ucy4gSWYgeW91IHdhbnQgdG9cbiAgICogZGlzcGF0Y2ggYSBQcm9taXNlLCBhbiBPYnNlcnZhYmxlLCBhIHRodW5rLCBvciBzb21ldGhpbmcgZWxzZSwgeW91IG5lZWQgdG9cbiAgICogd3JhcCB5b3VyIHN0b3JlIGNyZWF0aW5nIGZ1bmN0aW9uIGludG8gdGhlIGNvcnJlc3BvbmRpbmcgbWlkZGxld2FyZS4gRm9yXG4gICAqIGV4YW1wbGUsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgdGhlIGByZWR1eC10aHVua2AgcGFja2FnZS4gRXZlbiB0aGVcbiAgICogbWlkZGxld2FyZSB3aWxsIGV2ZW50dWFsbHkgZGlzcGF0Y2ggcGxhaW4gb2JqZWN0IGFjdGlvbnMgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gQSBwbGFpbiBvYmplY3QgcmVwcmVzZW50aW5nIOKAnHdoYXQgY2hhbmdlZOKAnS4gSXQgaXNcbiAgICogYSBnb29kIGlkZWEgdG8ga2VlcCBhY3Rpb25zIHNlcmlhbGl6YWJsZSBzbyB5b3UgY2FuIHJlY29yZCBhbmQgcmVwbGF5IHVzZXJcbiAgICogc2Vzc2lvbnMsIG9yIHVzZSB0aGUgdGltZSB0cmF2ZWxsaW5nIGByZWR1eC1kZXZ0b29sc2AuIEFuIGFjdGlvbiBtdXN0IGhhdmVcbiAgICogYSBgdHlwZWAgcHJvcGVydHkgd2hpY2ggbWF5IG5vdCBiZSBgdW5kZWZpbmVkYC4gSXQgaXMgYSBnb29kIGlkZWEgdG8gdXNlXG4gICAqIHN0cmluZyBjb25zdGFudHMgZm9yIGFjdGlvbiB0eXBlcy5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gRm9yIGNvbnZlbmllbmNlLCB0aGUgc2FtZSBhY3Rpb24gb2JqZWN0IHlvdSBkaXNwYXRjaGVkLlxuICAgKlxuICAgKiBOb3RlIHRoYXQsIGlmIHlvdSB1c2UgYSBjdXN0b20gbWlkZGxld2FyZSwgaXQgbWF5IHdyYXAgYGRpc3BhdGNoKClgIHRvXG4gICAqIHJldHVybiBzb21ldGhpbmcgZWxzZSAoZm9yIGV4YW1wbGUsIGEgUHJvbWlzZSB5b3UgY2FuIGF3YWl0KS5cbiAgICovXG4gIGZ1bmN0aW9uIGRpc3BhdGNoKGFjdGlvbikge1xuICAgIGlmICghKDAsIF9pc1BsYWluT2JqZWN0MltcImRlZmF1bHRcIl0pKGFjdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aW9ucyBtdXN0IGJlIHBsYWluIG9iamVjdHMuICcgKyAnVXNlIGN1c3RvbSBtaWRkbGV3YXJlIGZvciBhc3luYyBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYWN0aW9uLnR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGlvbnMgbWF5IG5vdCBoYXZlIGFuIHVuZGVmaW5lZCBcInR5cGVcIiBwcm9wZXJ0eS4gJyArICdIYXZlIHlvdSBtaXNzcGVsbGVkIGEgY29uc3RhbnQ/Jyk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGlzcGF0Y2hpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlcnMgbWF5IG5vdCBkaXNwYXRjaCBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgICAgIGN1cnJlbnRTdGF0ZSA9IGN1cnJlbnRSZWR1Y2VyKGN1cnJlbnRTdGF0ZSwgYWN0aW9uKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBsaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzID0gbmV4dExpc3RlbmVycztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyB0aGUgcmVkdWNlciBjdXJyZW50bHkgdXNlZCBieSB0aGUgc3RvcmUgdG8gY2FsY3VsYXRlIHRoZSBzdGF0ZS5cbiAgICpcbiAgICogWW91IG1pZ2h0IG5lZWQgdGhpcyBpZiB5b3VyIGFwcCBpbXBsZW1lbnRzIGNvZGUgc3BsaXR0aW5nIGFuZCB5b3Ugd2FudCB0b1xuICAgKiBsb2FkIHNvbWUgb2YgdGhlIHJlZHVjZXJzIGR5bmFtaWNhbGx5LiBZb3UgbWlnaHQgYWxzbyBuZWVkIHRoaXMgaWYgeW91XG4gICAqIGltcGxlbWVudCBhIGhvdCByZWxvYWRpbmcgbWVjaGFuaXNtIGZvciBSZWR1eC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dFJlZHVjZXIgVGhlIHJlZHVjZXIgZm9yIHRoZSBzdG9yZSB0byB1c2UgaW5zdGVhZC5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBmdW5jdGlvbiByZXBsYWNlUmVkdWNlcihuZXh0UmVkdWNlcikge1xuICAgIGlmICh0eXBlb2YgbmV4dFJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIG5leHRSZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgY3VycmVudFJlZHVjZXIgPSBuZXh0UmVkdWNlcjtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IEFjdGlvblR5cGVzLklOSVQgfSk7XG4gIH1cblxuICAvLyBXaGVuIGEgc3RvcmUgaXMgY3JlYXRlZCwgYW4gXCJJTklUXCIgYWN0aW9uIGlzIGRpc3BhdGNoZWQgc28gdGhhdCBldmVyeVxuICAvLyByZWR1Y2VyIHJldHVybnMgdGhlaXIgaW5pdGlhbCBzdGF0ZS4gVGhpcyBlZmZlY3RpdmVseSBwb3B1bGF0ZXNcbiAgLy8gdGhlIGluaXRpYWwgc3RhdGUgdHJlZS5cbiAgZGlzcGF0Y2goeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuXG4gIHJldHVybiB7XG4gICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxuICAgIHN1YnNjcmliZTogc3Vic2NyaWJlLFxuICAgIGdldFN0YXRlOiBnZXRTdGF0ZSxcbiAgICByZXBsYWNlUmVkdWNlcjogcmVwbGFjZVJlZHVjZXJcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmNvbXBvc2UgPSBleHBvcnRzLmFwcGx5TWlkZGxld2FyZSA9IGV4cG9ydHMuYmluZEFjdGlvbkNyZWF0b3JzID0gZXhwb3J0cy5jb21iaW5lUmVkdWNlcnMgPSBleHBvcnRzLmNyZWF0ZVN0b3JlID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZVN0b3JlID0gcmVxdWlyZSgnLi9jcmVhdGVTdG9yZScpO1xuXG52YXIgX2NyZWF0ZVN0b3JlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NyZWF0ZVN0b3JlKTtcblxudmFyIF9jb21iaW5lUmVkdWNlcnMgPSByZXF1aXJlKCcuL2NvbWJpbmVSZWR1Y2VycycpO1xuXG52YXIgX2NvbWJpbmVSZWR1Y2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21iaW5lUmVkdWNlcnMpO1xuXG52YXIgX2JpbmRBY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4vYmluZEFjdGlvbkNyZWF0b3JzJyk7XG5cbnZhciBfYmluZEFjdGlvbkNyZWF0b3JzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2JpbmRBY3Rpb25DcmVhdG9ycyk7XG5cbnZhciBfYXBwbHlNaWRkbGV3YXJlID0gcmVxdWlyZSgnLi9hcHBseU1pZGRsZXdhcmUnKTtcblxudmFyIF9hcHBseU1pZGRsZXdhcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBwbHlNaWRkbGV3YXJlKTtcblxudmFyIF9jb21wb3NlID0gcmVxdWlyZSgnLi9jb21wb3NlJyk7XG5cbnZhciBfY29tcG9zZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NlKTtcblxudmFyIF93YXJuaW5nID0gcmVxdWlyZSgnLi91dGlscy93YXJuaW5nJyk7XG5cbnZhciBfd2FybmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXJuaW5nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qXG4qIFRoaXMgaXMgYSBkdW1teSBmdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgZnVuY3Rpb24gbmFtZSBoYXMgYmVlbiBhbHRlcmVkIGJ5IG1pbmlmaWNhdGlvbi5cbiogSWYgdGhlIGZ1bmN0aW9uIGhhcyBiZWVuIG1pbmlmaWVkIGFuZCBOT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nLCB3YXJuIHRoZSB1c2VyLlxuKi9cbmZ1bmN0aW9uIGlzQ3J1c2hlZCgpIHt9XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHR5cGVvZiBpc0NydXNoZWQubmFtZSA9PT0gJ3N0cmluZycgJiYgaXNDcnVzaGVkLm5hbWUgIT09ICdpc0NydXNoZWQnKSB7XG4gICgwLCBfd2FybmluZzJbXCJkZWZhdWx0XCJdKSgnWW91IGFyZSBjdXJyZW50bHkgdXNpbmcgbWluaWZpZWQgY29kZSBvdXRzaWRlIG9mIE5PREVfRU5WID09PSBcXCdwcm9kdWN0aW9uXFwnLiAnICsgJ1RoaXMgbWVhbnMgdGhhdCB5b3UgYXJlIHJ1bm5pbmcgYSBzbG93ZXIgZGV2ZWxvcG1lbnQgYnVpbGQgb2YgUmVkdXguICcgKyAnWW91IGNhbiB1c2UgbG9vc2UtZW52aWZ5IChodHRwczovL2dpdGh1Yi5jb20vemVydG9zaC9sb29zZS1lbnZpZnkpIGZvciBicm93c2VyaWZ5ICcgKyAnb3IgRGVmaW5lUGx1Z2luIGZvciB3ZWJwYWNrIChodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMwMDMwMDMxKSAnICsgJ3RvIGVuc3VyZSB5b3UgaGF2ZSB0aGUgY29ycmVjdCBjb2RlIGZvciB5b3VyIHByb2R1Y3Rpb24gYnVpbGQuJyk7XG59XG5cbmV4cG9ydHMuY3JlYXRlU3RvcmUgPSBfY3JlYXRlU3RvcmUyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuY29tYmluZVJlZHVjZXJzID0gX2NvbWJpbmVSZWR1Y2VyczJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBfYmluZEFjdGlvbkNyZWF0b3JzMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmFwcGx5TWlkZGxld2FyZSA9IF9hcHBseU1pZGRsZXdhcmUyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuY29tcG9zZSA9IF9jb21wb3NlMltcImRlZmF1bHRcIl07IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB3YXJuaW5nO1xuLyoqXG4gKiBQcmludHMgYSB3YXJuaW5nIGluIHRoZSBjb25zb2xlIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBUaGUgd2FybmluZyBtZXNzYWdlLlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIHdhcm5pbmcobWVzc2FnZSkge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICB0cnkge1xuICAgIC8vIFRoaXMgZXJyb3Igd2FzIHRocm93biBhcyBhIGNvbnZlbmllbmNlIHNvIHRoYXQgeW91IGNhbiB1c2UgdGhpcyBzdGFja1xuICAgIC8vIHRvIGZpbmQgdGhlIGNhbGxzaXRlIHRoYXQgY2F1c2VkIHRoaXMgd2FybmluZyB0byBmaXJlLlxuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1lbXB0eSAqL1xuICB9IGNhdGNoIChlKSB7fVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWVtcHR5ICovXG59IiwiZXhwb3J0IGNvbnN0IEFERF9NSURJX05PVEVTID0gJ2FkZF9taWRpX25vdGVzJ1xuZXhwb3J0IGNvbnN0IEFERF9NSURJX0VWRU5UUyA9ICdhZGRfbWlkaV9ldmVudHMnXG4vL2V4cG9ydCBjb25zdCBBRERfVFJBQ0sgPSAnYWRkX3RyYWNrJ1xuLy9leHBvcnQgY29uc3QgQUREX1BBUlQgPSAnYWRkX3BhcnQnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfVFJBQ0sgPSAnY3JlYXRlX3RyYWNrJ1xuZXhwb3J0IGNvbnN0IEFERF9QQVJUUyA9ICdhZGRfcGFydHMnXG5leHBvcnQgY29uc3QgQUREX1RSQUNLUyA9ICdhZGRfdHJhY2tzJ1xuXG5leHBvcnQgY29uc3QgQ1JFQVRFX1BBUlQgPSAnY3JlYXRlX3BhcnQnXG5leHBvcnQgY29uc3QgQUREX1RJTUVfRVZFTlRTID0gJ2FkZF90aW1lX2V2ZW50cydcblxuZXhwb3J0IGNvbnN0IENSRUFURV9TT05HID0gJ2NyZWF0ZV9zb25nJ1xuZXhwb3J0IGNvbnN0IEFERF9NSURJX0VWRU5UU19UT19TT05HID0gJ2FkZF9taWRpX2V2ZW50c190b19zb25nJ1xuXG5leHBvcnQgY29uc3QgQ1JFQVRFX01JRElfRVZFTlQgPSAnY3JlYXRlX21pZGlfZXZlbnQnXG5leHBvcnQgY29uc3QgQ1JFQVRFX01JRElfTk9URSA9ICdjcmVhdGVfbWlkaV9ub3RlJ1xuZXhwb3J0IGNvbnN0IEFERF9FVkVOVFNfVE9fU09ORyA9ICdhZGRfZXZlbnRzX3RvX3NvbmcnXG5leHBvcnQgY29uc3QgVVBEQVRFX01JRElfRVZFTlQgPSAndXBkYXRlX21pZGlfZXZlbnQnXG5leHBvcnQgY29uc3QgVVBEQVRFX01JRElfTk9URSA9ICd1cGRhdGVfbWlkaV9ub3RlJ1xuXG5leHBvcnQgY29uc3QgVVBEQVRFX1NPTkcgPSAndXBkYXRlX3NvbmcnXG5cbi8vIHNlcXVlbmNlciBhY3Rpb25zXG5leHBvcnQgY29uc3QgU09OR19QT1NJVElPTiA9ICdzb25nX3Bvc2l0aW9uJ1xuZXhwb3J0IGNvbnN0IFBMQVlfU09ORyA9ICdwbGF5X3NvbmcnXG5leHBvcnQgY29uc3QgUEFVU0VfU09ORyA9ICdwYXVzZV9zb25nJ1xuZXhwb3J0IGNvbnN0IFNUT1BfU09ORyA9ICdzdG9wX3NvbmcnXG5cblxuIiwiaW1wb3J0IHtjcmVhdGVTdG9yZSwgYXBwbHlNaWRkbGV3YXJlLCBjb21wb3NlfSBmcm9tICdyZWR1eCdcbmltcG9ydCB0aHVuayBmcm9tICdyZWR1eC10aHVuayc7XG5pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJ3JlZHV4LWxvZ2dlcic7XG5pbXBvcnQgc2VxdWVuY2VyQXBwIGZyb20gJy4vcmVkdWNlcidcblxuY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKCk7XG5jb25zdCBzdG9yZSA9IGNyZWF0ZVN0b3JlKHNlcXVlbmNlckFwcCwge30sIGNvbXBvc2UoXG4gIC8vYXBwbHlNaWRkbGV3YXJlKGxvZ2dlciksXG4gIHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHR5cGVvZiB3aW5kb3cuZGV2VG9vbHNFeHRlbnNpb24gIT09ICd1bmRlZmluZWQnID8gd2luZG93LmRldlRvb2xzRXh0ZW5zaW9uKCkgOiBmID0+IGZcbikpO1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN0b3JlKCl7XG4gIHJldHVybiBzdG9yZVxufVxuXG5cbiIsIlxuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2lvLmpzJztcblxubGV0IHRpbWVkVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgcmVwZXRpdGl2ZVRhc2tzID0gbmV3IE1hcCgpO1xubGV0IHNjaGVkdWxlZFRhc2tzID0gbmV3IE1hcCgpO1xubGV0IHRhc2tzID0gbmV3IE1hcCgpO1xubGV0IGxhc3RUaW1lU3RhbXA7XG5cbmZ1bmN0aW9uIGhlYXJ0YmVhdCh0aW1lc3RhbXApe1xuICBsZXQgbm93ID0gY29udGV4dC50aW1lO1xuXG4gIC8vIGZvciBpbnN0YW5jZTogdGhlIGNhbGxiYWNrIG9mIHNhbXBsZS51bnNjaGVkdWxlO1xuICBmb3IobGV0IFtrZXksIHRhc2tdIG9mIHRpbWVkVGFza3Mpe1xuICAgIGlmKHRhc2sudGltZSA+PSBub3cpe1xuICAgICAgdGFzay5leGVjdXRlKG5vdyk7XG4gICAgICB0aW1lZFRhc2tzLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gZm9yIGluc3RhbmNlOiBzb25nLnVwZGF0ZSgpO1xuICBmb3IobGV0IHRhc2sgb2Ygc2NoZWR1bGVkVGFza3MudmFsdWVzKCkpe1xuICAgIHRhc2sobm93KTtcbiAgfVxuXG4gIC8vIGZvciBpbnN0YW5jZTogc29uZy5wdWxzZSgpO1xuICBmb3IobGV0IHRhc2sgb2YgcmVwZXRpdGl2ZVRhc2tzLnZhbHVlcygpKXtcbiAgICB0YXNrKG5vdyk7XG4gIH1cblxuICBsYXN0VGltZVN0YW1wID0gdGltZXN0YW1wO1xuICBzY2hlZHVsZWRUYXNrcy5jbGVhcigpO1xuXG4gIC8vc2V0VGltZW91dChoZWFydGJlYXQsIDEwMCk7XG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaGVhcnRiZWF0KTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkVGFzayh0eXBlLCBpZCwgdGFzayl7XG4gIGxldCBtYXAgPSB0YXNrcy5nZXQodHlwZSk7XG4gIG1hcC5zZXQoaWQsIHRhc2spO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlVGFzayh0eXBlLCBpZCl7XG4gIGxldCBtYXAgPSB0YXNrcy5nZXQodHlwZSk7XG4gIG1hcC5kZWxldGUoaWQpO1xufVxuXG4oZnVuY3Rpb24gc3RhcnQoKXtcbiAgdGFza3Muc2V0KCd0aW1lZCcsIHRpbWVkVGFza3MpO1xuICB0YXNrcy5zZXQoJ3JlcGV0aXRpdmUnLCByZXBldGl0aXZlVGFza3MpO1xuICB0YXNrcy5zZXQoJ3NjaGVkdWxlZCcsIHNjaGVkdWxlZFRhc2tzKTtcbiAgaGVhcnRiZWF0KCk7XG59KCkpXG4iLCJcblxuY29uc3QgY29udGV4dCA9IG5ldyB3aW5kb3cuQXVkaW9Db250ZXh0KClcblxuZXhwb3J0IHtjb250ZXh0fVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge3VwZGF0ZU1JRElOb3RlfSBmcm9tICcuL21pZGlfbm90ZSdcbmltcG9ydCB7XG4gIENSRUFURV9NSURJX0VWRU5ULFxuICBVUERBVEVfTUlESV9FVkVOVCxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IG1pZGlFdmVudEluZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTUlESUV2ZW50KHRpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlciA9IC0xKXtcbiAgbGV0IGlkID0gYE1FXyR7bWlkaUV2ZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfTUlESV9FVkVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpY2tzLFxuICAgICAgdHlwZSxcbiAgICAgIGRhdGExLFxuICAgICAgZGF0YTIsXG4gICAgICBzb3J0SW5kZXg6IHRpY2tzICsgdHlwZVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNSURJRXZlbnRJZCgpe1xuICByZXR1cm4gYE1FXyR7bWlkaUV2ZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlTUlESUV2ZW50KGlkOiBzdHJpbmcsIHRpY2tzX3RvX21vdmU6IG51bWJlcil7XG4gIGxldCBzdGF0ZSA9IHN0b3JlLmdldFN0YXRlKCkuZWRpdG9yXG4gIGxldCBldmVudCA9IHN0YXRlLm1pZGlFdmVudHNbaWRdXG4gIGxldCB0aWNrcyA9IGV2ZW50LnRpY2tzICsgdGlja3NfdG9fbW92ZVxuICB0aWNrcyA9IHRpY2tzIDwgMCA/IDAgOiB0aWNrc1xuICAvL2NvbnNvbGUubG9nKHRpY2tzLCBldmVudC50aWNrcylcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFVQREFURV9NSURJX0VWRU5ULFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgdGlja3MsXG4gICAgICBzb3J0SW5kZXg6IHRpY2tzICsgZXZlbnQudHlwZVxuICAgIH1cbiAgfSlcbiAgLy8gaWYgdGhlIGV2ZW50IGlzIHBhcnQgb2YgYSBtaWRpIG5vdGUsIHVwZGF0ZSBpdFxuICBsZXQgbm90ZV9pZCA9IGV2ZW50Lm5vdGVcbiAgaWYobm90ZV9pZCl7XG4gICAgdXBkYXRlTUlESU5vdGUobm90ZV9pZCwgc3RhdGUpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVNSURJRXZlbnRUbyhpZDogc3RyaW5nLCB0aWNrczogbnVtYmVyKXtcbiAgbGV0IHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKS5lZGl0b3JcbiAgbGV0IGV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tpZF1cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFVQREFURV9NSURJX0VWRU5ULFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgdGlja3MsXG4gICAgICBzb3J0SW5kZXg6IHRpY2tzICsgZXZlbnQudHlwZVxuICAgIH1cbiAgfSlcbiAgaWYodHlwZW9mIGV2ZW50ID09PSAndW5kZWZpbmVkJyl7XG4gICAgY29uc29sZS5lcnJvcignZXZlbnQgaXMgdW5kZWZpbmVkJykgLy90aGlzIHNob3VsZCd0IGhhcHBlbiFcbiAgfVxuICAvLyBpZiB0aGUgZXZlbnQgaXMgcGFydCBvZiBhIG1pZGkgbm90ZSwgdXBkYXRlIGl0XG4gIGxldCBub3RlX2lkID0gZXZlbnQubm90ZVxuICBpZihub3RlX2lkKXtcbiAgICB1cGRhdGVNSURJTm90ZShub3RlX2lkLCBzdGF0ZSlcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge1xuICBVUERBVEVfTUlESV9OT1RFLFxuICBDUkVBVEVfTUlESV9OT1RFLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpXG5sZXQgbWlkaU5vdGVJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZU1JRElOb3RlKGlkLCBzdGF0ZSA9IHN0b3JlLmdldFN0YXRlKCkpe1xuICBsZXQgbm90ZSA9IHN0YXRlLm1pZGlOb3Rlc1tpZF1cbiAgbGV0IGV2ZW50cyA9IHN0YXRlLm1pZGlFdmVudHNcbiAgbGV0IHN0YXJ0ID0gZXZlbnRzW25vdGUubm90ZW9uXVxuICBsZXQgZW5kID0gZXZlbnRzW25vdGUubm90ZW9mZl1cblxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogVVBEQVRFX01JRElfTk9URSxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHN0YXJ0OiBzdGFydC50aWNrcyxcbiAgICAgIGVuZDogZW5kLnRpY2tzLFxuICAgICAgZHVyYXRpb25UaWNrczogZW5kLnRpY2tzIC0gc3RhcnQudGlja3NcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNSURJTm90ZShub3Rlb246IHN0cmluZywgbm90ZW9mZjogc3RyaW5nKXtcbiAgbGV0IGV2ZW50cyA9IHN0b3JlLmdldFN0YXRlKCkuZWRpdG9yLm1pZGlFdmVudHNcbiAgbGV0IG9uID0gZXZlbnRzW25vdGVvbl1cbiAgbGV0IG9mZiA9IGV2ZW50c1tub3Rlb2ZmXVxuICBpZihvbi5kYXRhMSAhPT0gb2ZmLmRhdGExKXtcbiAgICBjb25zb2xlLmVycm9yKCdjYW5cXCd0IGNyZWF0ZSBNSURJIG5vdGU6IGV2ZW50cyBtdXN0IGhhdmUgdGhlIHNhbWUgZGF0YTEgdmFsdWUsIGkuZS4gdGhlIHNhbWUgcGl0Y2gnKVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGxldCBpZCA9IGBNTl8ke21pZGlOb3RlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfTUlESV9OT1RFLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgbm90ZW9uLFxuICAgICAgbm90ZW9mZixcbiAgICAgIHN0YXJ0OiBvbi50aWNrcyxcbiAgICAgIGVuZDogb2ZmLnRpY2tzLFxuICAgICAgZHVyYXRpb25UaWNrczogb2ZmLnRpY2tzIC0gb24udGlja3NcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuXG5sZXRcbiAgcHBxLFxuICBicG0sXG4gIGZhY3RvcixcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcbiAgcGxheWJhY2tTcGVlZCxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcbiAgdGlja3MsXG4gIG1pbGxpcyxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIGRpZmZUaWNrcztcblxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKXtcbiAgc2Vjb25kc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHE7XG4gIG1pbGxpc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljayAqIDEwMDA7XG4gIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljaywgYnBtLCBwcHEsIHBsYXliYWNrU3BlZWQsIChwcHEgKiBtaWxsaXNQZXJUaWNrKSk7XG4gIC8vY29uc29sZS5sb2cocHBxKTtcbn1cblxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKXtcbiAgZmFjdG9yID0gKDQgLyBkZW5vbWluYXRvcik7XG4gIG51bVNpeHRlZW50aCA9IGZhY3RvciAqIDQ7XG4gIHRpY2tzUGVyQmVhdCA9IHBwcSAqIGZhY3RvcjtcbiAgdGlja3NQZXJCYXIgPSB0aWNrc1BlckJlYXQgKiBub21pbmF0b3I7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gcHBxIC8gNDtcbiAgLy9jb25zb2xlLmxvZyhkZW5vbWluYXRvciwgZmFjdG9yLCBudW1TaXh0ZWVudGgsIHRpY2tzUGVyQmVhdCwgdGlja3NQZXJCYXIsIHRpY2tzUGVyU2l4dGVlbnRoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCl7XG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIHRpY2sgKz0gZGlmZlRpY2tzO1xuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICAvL2NvbnNvbGUubG9nKGRpZmZUaWNrcywgbWlsbGlzUGVyVGljayk7XG4gIG1pbGxpcyArPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuXG4gIHdoaWxlKHRpY2sgPj0gdGlja3NQZXJTaXh0ZWVudGgpe1xuICAgIHNpeHRlZW50aCsrO1xuICAgIHRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgd2hpbGUoc2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICBiZWF0Kys7XG4gICAgICB3aGlsZShiZWF0ID4gbm9taW5hdG9yKXtcbiAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgIGJhcisrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpbWVFdmVudHMoc2V0dGluZ3MsIHRpbWVFdmVudHMpe1xuICAvL2NvbnNvbGUudGltZSgncGFyc2UgdGltZSBldmVudHMgJyArIHNvbmcubmFtZSk7XG4gIGxldCB0eXBlO1xuICBsZXQgZXZlbnQ7XG5cbiAgcHBxID0gc2V0dGluZ3MucHBxO1xuICBicG0gPSBzZXR0aW5ncy5icG07XG4gIG5vbWluYXRvciA9IHNldHRpbmdzLm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBzZXR0aW5ncy5kZW5vbWluYXRvcjtcbiAgcGxheWJhY2tTcGVlZCA9IHNldHRpbmdzLnBsYXliYWNrU3BlZWQ7XG4gIGJhciA9IDE7XG4gIGJlYXQgPSAxO1xuICBzaXh0ZWVudGggPSAxO1xuICB0aWNrID0gMDtcbiAgdGlja3MgPSAwO1xuICBtaWxsaXMgPSAwO1xuXG4gIHNldFRpY2tEdXJhdGlvbigpO1xuICBzZXRUaWNrc1BlckJlYXQoKTtcblxuICB0aW1lRXZlbnRzLnNvcnQoKGEsIGIpID0+IChhLnRpY2tzIDw9IGIudGlja3MpID8gLTEgOiAxKTtcblxuICBmb3IoZXZlbnQgb2YgdGltZUV2ZW50cyl7XG4gICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCk7XG5cbiAgICBzd2l0Y2godHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgc2V0VGlja3NQZXJCZWF0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvL3RpbWUgZGF0YSBvZiB0aW1lIGV2ZW50IGlzIHZhbGlkIGZyb20gKGFuZCBpbmNsdWRlZCkgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aW1lIGV2ZW50XG4gICAgdXBkYXRlRXZlbnQoZXZlbnQpO1xuICAgIC8vY29uc29sZS5sb2coZXZlbnQuYmFyc0FzU3RyaW5nKTtcbiAgfVxuXG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbiAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gIC8vY29uc29sZS5sb2codGltZUV2ZW50cyk7XG59XG5cblxuLy9leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoc29uZywgZXZlbnRzKXtcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhldmVudHMpe1xuICBsZXQgZXZlbnQ7XG4gIGxldCBzdGFydEV2ZW50ID0gMDtcbiAgbGV0IGxhc3RFdmVudFRpY2sgPSAwO1xuICBsZXQgcmVzdWx0ID0gW11cblxuICAvL2xldCBldmVudHMgPSBbXS5jb25jYXQoZXZ0cywgc29uZy5fdGltZUV2ZW50cyk7XG4gIGxldCBudW1FdmVudHMgPSBldmVudHMubGVuZ3RoO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEuX3NvcnRJbmRleCAtIGIuX3NvcnRJbmRleDtcbiAgfSk7XG4gIGV2ZW50ID0gZXZlbnRzWzBdO1xuXG4gIGJwbSA9IGV2ZW50LmJwbTtcbiAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICBub21pbmF0b3IgPSBldmVudC5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG5cbiAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcblxuICBtaWxsaXNQZXJUaWNrID0gZXZlbnQubWlsbGlzUGVyVGljaztcbiAgc2Vjb25kc1BlclRpY2sgPSBldmVudC5zZWNvbmRzUGVyVGljaztcblxuICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgYmFyID0gZXZlbnQuYmFyO1xuICBiZWF0ID0gZXZlbnQuYmVhdDtcbiAgc2l4dGVlbnRoID0gZXZlbnQuc2l4dGVlbnRoO1xuICB0aWNrID0gZXZlbnQudGljaztcblxuXG4gIGZvcihsZXQgaSA9IHN0YXJ0RXZlbnQ7IGkgPCBudW1FdmVudHM7IGkrKyl7XG5cbiAgICBldmVudCA9IGV2ZW50c1tpXTtcbiAgICAvL2NvbnNvbGUubG9nKGV2ZW50LnRpY2tzLCBldmVudC50eXBlKVxuXG4gICAgc3dpdGNoKGV2ZW50LnR5cGUpe1xuXG4gICAgICBjYXNlIDB4NTE6XG4gICAgICAgIGJwbSA9IGV2ZW50LmRhdGExO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG4gICAgICAgIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICAgICAgICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuICAgICAgICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssZXZlbnQubWlsbGlzUGVyVGljayk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBmYWN0b3IgPSBldmVudC5mYWN0b3I7XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG4gICAgICAgIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gICAgICAgIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgICAgICAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuICAgICAgICAvL2NvbnNvbGUubG9nKG5vbWluYXRvcixudW1TaXh0ZWVudGgsdGlja3NQZXJTaXh0ZWVudGgpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHVwZGF0ZVBvc2l0aW9uKGV2ZW50KTtcbiAgICAgICAgdXBkYXRlRXZlbnQoZXZlbnQpO1xuICAgICAgICByZXN1bHQucHVzaChldmVudClcbiAgICB9XG5cbiAgICBsYXN0RXZlbnRUaWNrID0gZXZlbnQudGlja3M7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50KGV2ZW50KXtcbiAgLy9jb25zb2xlLmxvZyhiYXIsIGJlYXQsIHRpY2tzKVxuICAvL2NvbnNvbGUubG9nKGV2ZW50LCBicG0sIG1pbGxpc1BlclRpY2ssIHRpY2tzLCBtaWxsaXMpO1xuXG4gIGV2ZW50LmJwbSA9IGJwbTtcbiAgZXZlbnQubm9taW5hdG9yID0gbm9taW5hdG9yO1xuICBldmVudC5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuXG4gIGV2ZW50LnRpY2tzUGVyQmFyID0gdGlja3NQZXJCYXI7XG4gIGV2ZW50LnRpY2tzUGVyQmVhdCA9IHRpY2tzUGVyQmVhdDtcbiAgZXZlbnQudGlja3NQZXJTaXh0ZWVudGggPSB0aWNrc1BlclNpeHRlZW50aDtcblxuICBldmVudC5mYWN0b3IgPSBmYWN0b3I7XG4gIGV2ZW50Lm51bVNpeHRlZW50aCA9IG51bVNpeHRlZW50aDtcbiAgZXZlbnQuc2Vjb25kc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljaztcbiAgZXZlbnQubWlsbGlzUGVyVGljayA9IG1pbGxpc1BlclRpY2s7XG5cblxuICBldmVudC50aWNrcyA9IHRpY2tzO1xuXG4gIGV2ZW50Lm1pbGxpcyA9IG1pbGxpcztcbiAgZXZlbnQuc2Vjb25kcyA9IG1pbGxpcyAvIDEwMDA7XG5cblxuICBldmVudC5iYXIgPSBiYXI7XG4gIGV2ZW50LmJlYXQgPSBiZWF0O1xuICBldmVudC5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gIGV2ZW50LnRpY2sgPSB0aWNrO1xuICAvL2V2ZW50LmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrO1xuICB2YXIgdGlja0FzU3RyaW5nID0gdGljayA9PT0gMCA/ICcwMDAnIDogdGljayA8IDEwID8gJzAwJyArIHRpY2sgOiB0aWNrIDwgMTAwID8gJzAnICsgdGljayA6IHRpY2s7XG4gIGV2ZW50LmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gIGV2ZW50LmJhcnNBc0FycmF5ID0gW2JhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXTtcblxuXG4gIHZhciB0aW1lRGF0YSA9IGdldE5pY2VUaW1lKG1pbGxpcyk7XG5cbiAgZXZlbnQuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gIGV2ZW50Lm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgZXZlbnQuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICBldmVudC5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICBldmVudC50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG4gIGV2ZW50LnRpbWVBc0FycmF5ID0gdGltZURhdGEudGltZUFzQXJyYXk7XG59XG4iLCJpbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7XG4gIENSRUFURV9QQVJULFxuICBBRERfTUlESV9FVkVOVFMsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBwYXJ0SW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQYXJ0KFxuICBzZXR0aW5nczoge1xuICAgIG5hbWU6IHN0cmluZyxcbiAgICB0cmFja0lkOiBzdHJpbmcsXG4gICAgbWlkaUV2ZW50SWRzOkFycmF5PHN0cmluZz4sXG4gICAgbWlkaU5vdGVJZHM6QXJyYXk8c3RyaW5nPixcbiAgfSA9IHt9XG4pe1xuICBsZXQgaWQgPSBgTVBfJHtwYXJ0SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIGxldCB7XG4gICAgbmFtZSA9IGlkLFxuICAgIG1pZGlFdmVudElkcyA9IFtdLFxuICAgIG1pZGlOb3RlSWRzID0gW10sXG4gICAgdHJhY2tJZCA9ICdub25lJ1xuICB9ID0gc2V0dGluZ3NcblxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX1BBUlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBuYW1lLFxuICAgICAgbWlkaUV2ZW50SWRzLFxuICAgICAgbWlkaU5vdGVJZHMsXG4gICAgICB0cmFja0lkXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1JRElFdmVudHMocGFydF9pZDogc3RyaW5nLCAuLi5taWRpX2V2ZW50X2lkczogc3RyaW5nKXtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9NSURJX0VWRU5UUyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBwYXJ0X2lkLFxuICAgICAgbWlkaV9ldmVudF9pZHNcbiAgICB9XG4gIH0pXG59XG4iLCJpbXBvcnQge1xuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcbn0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0e1xuICBjcmVhdGVNSURJTm90ZSxcbn0gZnJvbSAnLi9taWRpX25vdGUnXG5pbXBvcnR7XG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcbn0gZnJvbSAnLi9zb25nJ1xuaW1wb3J0e1xuICBjcmVhdGVUcmFjayxcbiAgYWRkUGFydHMsXG59IGZyb20gJy4vdHJhY2snXG5pbXBvcnR7XG4gIGNyZWF0ZVBhcnQsXG4gIGFkZE1JRElFdmVudHMsXG59IGZyb20gJy4vcGFydCdcblxuY29uc3QgcWFtYmkgPSB7XG4gIHZlcnNpb246ICcwLjAuMScsXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgY3JlYXRlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50VG8sXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBjcmVhdGVNSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBjcmVhdGVTb25nLFxuICBhZGRUcmFja3MsXG4gIHVwZGF0ZVNvbmcsXG4gIHN0YXJ0U29uZyxcbiAgc3RvcFNvbmcsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcblxuICAvLyBmcm9tIC4vcGFydFxuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzLFxuXG4gIGxvZzogZnVuY3Rpb24oaWQpe1xuICAgIGlmKGlkID09PSAnZnVuY3Rpb25zJyl7XG4gICAgICBjb25zb2xlLmxvZyhgZnVuY3Rpb25zOlxuICAgICAgICBjcmVhdGVNSURJRXZlbnRcbiAgICAgICAgbW92ZU1JRElFdmVudFxuICAgICAgICBtb3ZlTUlESUV2ZW50VG9cbiAgICAgICAgY3JlYXRlTUlESU5vdGVcbiAgICAgICAgY3JlYXRlU29uZ1xuICAgICAgICBhZGRUcmFja3NcbiAgICAgICAgY3JlYXRlVHJhY2tcbiAgICAgICAgYWRkUGFydHNcbiAgICAgICAgY3JlYXRlUGFydFxuICAgICAgICBhZGRNSURJRXZlbnRzXG4gICAgICBgKVxuICAgIH1cbiAgfVxufVxuXG4vLyBzdGFuZGFyZCBNSURJIGV2ZW50c1xuY29uc3QgTUlESSA9IHt9XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ05PVEVfT0ZGJywge3ZhbHVlOiAweDgwfSk7IC8vMTI4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ05PVEVfT04nLCB7dmFsdWU6IDB4OTB9KTsgLy8xNDRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnUE9MWV9QUkVTU1VSRScsIHt2YWx1ZTogMHhBMH0pOyAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdDT05UUk9MX0NIQU5HRScsIHt2YWx1ZTogMHhCMH0pOyAvLzE3NlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdQUk9HUkFNX0NIQU5HRScsIHt2YWx1ZTogMHhDMH0pOyAvLzE5MlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdDSEFOTkVMX1BSRVNTVVJFJywge3ZhbHVlOiAweEQwfSk7IC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ1BJVENIX0JFTkQnLCB7dmFsdWU6IDB4RTB9KTsgLy8yMjRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnU1lTVEVNX0VYQ0xVU0lWRScsIHt2YWx1ZTogMHhGMH0pOyAvLzI0MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdNSURJX1RJTUVDT0RFJywge3ZhbHVlOiAyNDF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnU09OR19QT1NJVElPTicsIHt2YWx1ZTogMjQyfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ1NPTkdfU0VMRUNUJywge3ZhbHVlOiAyNDN9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnVFVORV9SRVFVRVNUJywge3ZhbHVlOiAyNDZ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnRU9YJywge3ZhbHVlOiAyNDd9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnVElNSU5HX0NMT0NLJywge3ZhbHVlOiAyNDh9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnU1RBUlQnLCB7dmFsdWU6IDI1MH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdDT05USU5VRScsIHt2YWx1ZTogMjUxfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ1NUT1AnLCB7dmFsdWU6IDI1Mn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdBQ1RJVkVfU0VOU0lORycsIHt2YWx1ZTogMjU0fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ1NZU1RFTV9SRVNFVCcsIHt2YWx1ZTogMjU1fSk7XG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdURU1QTycsIHt2YWx1ZTogMHg1MX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdUSU1FX1NJR05BVFVSRScsIHt2YWx1ZTogMHg1OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdFTkRfT0ZfVFJBQ0snLCB7dmFsdWU6IDB4MkZ9KTtcblxuZXhwb3J0IGRlZmF1bHQgcWFtYmlcblxuZXhwb3J0IHtcbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgY3JlYXRlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50VG8sXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBjcmVhdGVNSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBjcmVhdGVTb25nLFxuICBhZGRUcmFja3MsXG4gIHVwZGF0ZVNvbmcsXG4gIHN0YXJ0U29uZyxcbiAgc3RvcFNvbmcsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcblxuICAvLyBmcm9tIC4vcGFydFxuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzLFxuXG4gIE1JREksXG59XG4iLCJpbXBvcnQge2NvbWJpbmVSZWR1Y2Vyc30gZnJvbSAncmVkdXgnXG5pbXBvcnQge1xuICAvLyBmb3IgZWRpdG9yXG4gIENSRUFURV9TT05HLFxuICBDUkVBVEVfVFJBQ0ssXG4gIENSRUFURV9QQVJULFxuICBBRERfUEFSVFMsXG4gIEFERF9UUkFDS1MsXG4gIEFERF9NSURJX05PVEVTLFxuICBBRERfTUlESV9FVkVOVFMsXG4gIEFERF9USU1FX0VWRU5UUyxcbiAgQ1JFQVRFX01JRElfRVZFTlQsXG4gIENSRUFURV9NSURJX05PVEUsXG4gIEFERF9FVkVOVFNfVE9fU09ORyxcbiAgVVBEQVRFX01JRElfRVZFTlQsXG4gIFVQREFURV9NSURJX05PVEUsXG4gIFVQREFURV9TT05HLFxuICAvLyBmb3Igc2VxdWVuY2VyIG9ubHlcbiAgU09OR19QT1NJVElPTixcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcbiAgc29uZ3M6IHt9LFxuICB0cmFja3M6IHt9LFxuICBwYXJ0czoge30sXG4gIG1pZGlFdmVudHM6IHt9LFxuICBtaWRpTm90ZXM6IHt9LFxufVxuXG5cbmZ1bmN0aW9uIGVkaXRvcihzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKXtcblxuICBsZXRcbiAgICBldmVudCwgZXZlbnRJZCxcbiAgICBzb25nLCBzb25nSWQsXG4gICAgbWlkaUV2ZW50c1xuXG4gIHN3aXRjaChhY3Rpb24udHlwZSl7XG5cbiAgICBjYXNlIENSRUFURV9TT05HOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfVFJBQ0s6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnRyYWNrc1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfUEFSVDpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUucGFydHNbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQ1JFQVRFX01JRElfRVZFTlQ6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLm1pZGlFdmVudHNbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQ1JFQVRFX01JRElfTk9URTpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUubWlkaU5vdGVzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIEFERF9UUkFDS1M6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHNvbmdJZCA9IGFjdGlvbi5wYXlsb2FkLnNvbmdfaWRcbiAgICAgIHNvbmcgPSBzdGF0ZS5zb25nc1tzb25nSWRdXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgbGV0IHRyYWNrSWRzID0gYWN0aW9uLnBheWxvYWQudHJhY2tfaWRzXG4gICAgICAgIHRyYWNrSWRzLmZvckVhY2goZnVuY3Rpb24odHJhY2tJZCl7XG4gICAgICAgICAgbGV0IHRyYWNrID0gc3RhdGUudHJhY2tzW3RyYWNrSWRdXG4gICAgICAgICAgaWYodHJhY2spe1xuICAgICAgICAgICAgc29uZy50cmFja0lkcy5wdXNoKHRyYWNrSWQpXG4gICAgICAgICAgICB0cmFjay5zb25nSWQgPSBzb25nSWRcbiAgICAgICAgICAgIGxldCBtaWRpRXZlbnRJZHMgPSBbXVxuICAgICAgICAgICAgdHJhY2sucGFydElkcy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnRJZCl7XG4gICAgICAgICAgICAgIGxldCBwYXJ0ID0gc3RhdGUucGFydHNbcGFydElkXVxuICAgICAgICAgICAgICBzb25nLnBhcnRJZHMucHVzaChwYXJ0SWQpXG4gICAgICAgICAgICAgIG1pZGlFdmVudElkcy5wdXNoKC4uLnBhcnQubWlkaUV2ZW50SWRzKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHNvbmcubWlkaUV2ZW50SWRzLnB1c2goLi4ubWlkaUV2ZW50SWRzKVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBubyB0cmFjayB3aXRoIGlkICR7dHJhY2tJZH1gKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLndhcm4oYG5vIHNvbmcgZm91bmQgd2l0aCBpZCAke3NvbmdJZH1gKVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBBRERfUEFSVFM6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGxldCB0cmFja0lkID0gYWN0aW9uLnBheWxvYWQudHJhY2tfaWRcbiAgICAgIGxldCB0cmFjayA9IHN0YXRlLnRyYWNrc1t0cmFja0lkXVxuICAgICAgaWYodHJhY2spe1xuICAgICAgICAvL3RyYWNrLnBhcnRzLnB1c2goLi4uYWN0aW9uLnBheWxvYWQucGFydF9pZHMpXG4gICAgICAgIGxldCBwYXJ0SWRzID0gYWN0aW9uLnBheWxvYWQucGFydF9pZHNcbiAgICAgICAgcGFydElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICBsZXQgcGFydCA9IHN0YXRlLnBhcnRzW2lkXVxuICAgICAgICAgIGlmKHBhcnQpe1xuICAgICAgICAgICAgdHJhY2sucGFydElkcy5wdXNoKGlkKVxuICAgICAgICAgICAgcGFydC50cmFja0lkID0gdHJhY2tJZFxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBubyBwYXJ0IHdpdGggaWQgJHtpZH1gKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLndhcm4oYG5vIHRyYWNrIGZvdW5kIHdpdGggaWQgJHt0cmFja0lkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIEFERF9NSURJX0VWRU5UUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgbGV0IHBhcnRJZCA9IGFjdGlvbi5wYXlsb2FkLnBhcnRfaWRcbiAgICAgIGxldCBwYXJ0ID0gc3RhdGUucGFydHNbcGFydElkXVxuICAgICAgaWYocGFydCl7XG4gICAgICAgIC8vcGFydC5taWRpRXZlbnRzLnB1c2goLi4uYWN0aW9uLnBheWxvYWQubWlkaV9ldmVudF9pZHMpXG4gICAgICAgIGxldCBtaWRpRXZlbnRJZHMgPSBhY3Rpb24ucGF5bG9hZC5taWRpX2V2ZW50X2lkc1xuICAgICAgICBtaWRpRXZlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihpZCl7XG4gICAgICAgICAgbGV0IG1pZGlFdmVudCA9IHN0YXRlLm1pZGlFdmVudHNbaWRdXG4gICAgICAgICAgaWYobWlkaUV2ZW50KXtcbiAgICAgICAgICAgIHBhcnQubWlkaUV2ZW50SWRzLnB1c2goaWQpXG4gICAgICAgICAgICBtaWRpRXZlbnQucGFydElkID0gcGFydElkXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIE1JREkgZXZlbnQgZm91bmQgd2l0aCBpZCAke2lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gcGFydCBmb3VuZCB3aXRoIGlkICR7cGFydElkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9NSURJX0VWRU5UOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBldmVudElkID0gYWN0aW9uLnBheWxvYWQuaWRcbiAgICAgIGV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tldmVudElkXTtcbiAgICAgIGlmKGV2ZW50KXtcbiAgICAgICAgKHtcbiAgICAgICAgICB0aWNrczogZXZlbnQudGlja3MgPSBldmVudC50aWNrcyxcbiAgICAgICAgICBkYXRhMTogZXZlbnQuZGF0YTEgPSBldmVudC5kYXRhMSxcbiAgICAgICAgICBkYXRhMjogZXZlbnQuZGF0YTIgPSBldmVudC5kYXRhMixcbiAgICAgICAgfSA9IGFjdGlvbi5wYXlsb2FkKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gTUlESSBldmVudCBmb3VuZCB3aXRoIGlkICR7ZXZlbnRJZH1gKVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBVUERBVEVfTUlESV9OT1RFOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBsZXQgbm90ZSA9IHN0YXRlLm1pZGlOb3Rlc1thY3Rpb24ucGF5bG9hZC5pZF07XG4gICAgICAoe1xuICAgICAgICAvLyBpZiB0aGUgcGF5bG9hZCBoYXMgYSB2YWx1ZSBmb3IgJ3N0YXJ0JyBpdCB3aWxsIGJlIGFzc2lnbmVkIHRvIG5vdGUuc3RhcnQsIG90aGVyd2lzZSBub3RlLnN0YXJ0IHdpbGwga2VlcCBpdHMgY3VycmVudCB2YWx1ZVxuICAgICAgICBzdGFydDogbm90ZS5zdGFydCA9IG5vdGUuc3RhcnQsXG4gICAgICAgIGVuZDogbm90ZS5lbmQgPSBub3RlLmVuZCxcbiAgICAgICAgZHVyYXRpb25UaWNrczogbm90ZS5kdXJhdGlvblRpY2tzID0gbm90ZS5kdXJhdGlvblRpY2tzXG4gICAgICB9ID0gYWN0aW9uLnBheWxvYWQpXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9TT05HOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9O1xuICAgICAgKHtzb25nX2lkOiBzb25nSWQsIG1pZGlfZXZlbnRzOiBtaWRpRXZlbnRzfSA9IGFjdGlvbi5wYXlsb2FkKVxuICAgICAgc29uZyA9IHN0YXRlLnNvbmdzW3NvbmdJZF1cbiAgICAgIHNvbmcubWlkaUV2ZW50SWRzID0gW11cbiAgICAgIG1pZGlFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudCl7XG4gICAgICAgIHNvbmcubWlkaUV2ZW50SWRzLnB1c2goZXZlbnQuaWQpXG4gICAgICAgIHN0YXRlLm1pZGlFdmVudHNbZXZlbnQuaWRdID0gZXZlbnRcbiAgICAgIH0pXG4gICAgICBicmVha1xuXG5cbiAgICBkZWZhdWx0OlxuICAgICAgLy8gZG8gbm90aGluZ1xuICB9XG4gIHJldHVybiBzdGF0ZVxufVxuXG4vLyBzdGF0ZSB3aGVuIGEgc29uZyBpcyBwbGF5aW5nXG5mdW5jdGlvbiBzZXF1ZW5jZXIoc3RhdGUgPSB7c29uZ3M6IHt9fSwgYWN0aW9uKXtcbiAgc3dpdGNoKGFjdGlvbi50eXBlKXtcblxuICAgIGNhc2UgVVBEQVRFX1NPTkc6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLnNvbmdfaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgU09OR19QT1NJVElPTjpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuc29uZ19pZF0ucG9zaXRpb24gPSBhY3Rpb24ucGF5bG9hZC5wb3NpdGlvblxuICAgICAgYnJlYWtcblxuXG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIGRvIG5vdGhpbmdcbiAgfVxuICByZXR1cm4gc3RhdGU7XG59XG5cblxuZnVuY3Rpb24gZ3VpKHN0YXRlID0ge30sIGFjdGlvbil7XG4gIHJldHVybiBzdGF0ZTtcbn1cblxuXG5jb25zdCBzZXF1ZW5jZXJBcHAgPSBjb21iaW5lUmVkdWNlcnMoe1xuICBndWksXG4gIGVkaXRvcixcbiAgc2VxdWVuY2VyLFxufSlcblxuXG5leHBvcnQgZGVmYXVsdCBzZXF1ZW5jZXJBcHBcbiIsIlxuY29uc3QgQlVGRkVSX1RJTUUgPSAzNTAgLy8gbWlsbGlzXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjaGVkdWxlcntcblxuICBjb25zdHJ1Y3Rvcihzb25nRGF0YSwgdGltZVN0YW1wLCBzdGFydFBvc2l0aW9uKXtcbiAgICAoe1xuICAgICAgc29uZ19pZDogdGhpcy5zb25nSWQsXG4gICAgICBtaWRpX2V2ZW50czogdGhpcy5ldmVudHMsXG4gICAgICBzZXR0aW5nczp7XG4gICAgICAgIGJhcnM6IHRoaXMuYmFycyxcbiAgICAgICAgbG9vcDogdGhpcy5sb29wXG4gICAgICB9XG4gICAgfSA9IHNvbmdEYXRhKVxuICAgIHRoaXMubnVtRXZlbnRzID0gdGhpcy5ldmVudHMubGVuZ3RoXG4gICAgdGhpcy5zb25nU3RhcnRQb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb25cbiAgICB0aGlzLnRpbWVTdGFtcCA9IHRpbWVTdGFtcFxuICAgIHRoaXMuaW5kZXggPSAwXG4gICAgdGhpcy5zZXRJbmRleChzb25nRGF0YS5wb3NpdGlvbilcbiAgfVxuXG4gIC8vIGdldCB0aGUgaW5kZXggb2YgdGhlIGV2ZW50IHRoYXQgaGFzIGl0cyBtaWxsaXMgdmFsdWUgYXQgb3IgcmlnaHQgYWZ0ZXIgdGhlIHByb3ZpZGVkIG1pbGxpcyB2YWx1ZVxuICBzZXRJbmRleChtaWxsaXMpe1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IobGV0IGV2ZW50IG9mIHRoaXMuZXZlbnRzKXtcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpe1xuICAgICAgICB0aGlzLmluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9XG5cblxuICBnZXRFdmVudHMoKXtcbiAgICBsZXQgZXZlbnRzID0gW11cbiAgICAvLyBtYWluIGxvb3BcbiAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgaWYoZXZlbnQubWlsbGlzIDwgdGhpcy5tYXh0aW1lKXtcblxuICAgICAgICBldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydFBvc2l0aW9uO1xuXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpe1xuLypcbiAgICAgICAgICBpZihldmVudC5taWRpTm90ZSAhPT0gdW5kZWZpbmVkICYmIGV2ZW50Lm1pZGlOb3RlLmVuZGxlc3MgPT09IGZhbHNlKXtcbiAgICAgICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAgICAgICAgIC8vdGhpcy5ub3Rlc1tldmVudC5taWRpTm90ZS5pZF0gPSBldmVudC5taWRpTm90ZTtcbiAgICAgICAgICAgICAgdGhpcy5ub3Rlc1tldmVudC5pZF0gPSBldmVudC5pZDtcbiAgICAgICAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm5vdGVzW2V2ZW50Lm1pZGlOb3RlLmlkXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICB9XG4qL1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJyl7XG4gICAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy8gY29udHJvbGxlciBldmVudHNcbiAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXZlbnRzO1xuICB9XG5cblxuICB1cGRhdGUocG9zaXRpb24pe1xuICAgIHZhciBpLFxuICAgICAgZXZlbnQsXG4gICAgICBudW1FdmVudHMsXG4gICAgICBldmVudHMsXG4gICAgICB0cmFjayxcbiAgICAgIGNoYW5uZWw7XG5cbiAgICB0aGlzLm1heHRpbWUgPSBwb3NpdGlvbiArIEJVRkZFUl9USU1FXG4gICAgZXZlbnRzID0gdGhpcy5nZXRFdmVudHMoKVxuICAgIG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGhcblxuICAgIGZvcihpID0gMDsgaSA8IG51bUV2ZW50czsgaSsrKXtcbiAgICAgIGV2ZW50ID0gZXZlbnRzW2ldXG4gICAgICB0cmFjayA9IGV2ZW50LnRyYWNrXG4gICAgICBjb25zb2xlLmxvZyhwb3NpdGlvbiwgZXZlbnQpXG4gICAgICAvKlxuICAgICAgaWYoXG4gICAgICAgIHRyYWNrID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgZXZlbnQubXV0ZSA9PT0gdHJ1ZSB8fFxuICAgICAgICBldmVudC5wYXJ0Lm11dGUgPT09IHRydWUgfHxcbiAgICAgICAgZXZlbnQudHJhY2subXV0ZSA9PT0gdHJ1ZSB8fFxuICAgICAgICAoZXZlbnQudHJhY2sudHlwZSA9PT0gJ21ldHJvbm9tZScgJiYgdGhpcy5zb25nLnVzZU1ldHJvbm9tZSA9PT0gZmFsc2UpXG4gICAgICAgIClcbiAgICAgIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKHRyYWNrLnJvdXRlVG9NaWRpT3V0ID09PSBmYWxzZSl7XG4gICAgICAgICAgLy8gaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZXZlbnQudGltZS8xMDAwLCBzZXF1ZW5jZXIuZ2V0VGltZSgpLCBldmVudC50aW1lLzEwMDAgLSBzZXF1ZW5jZXIuZ2V0VGltZSgpKTtcbiAgICAgICAgICAvLyB9XG4gICAgICAgICAgZXZlbnQudGltZSAvPSAxMDAwO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxlZCcsIGV2ZW50LnR5cGUsIGV2ZW50LnRpbWUsIGV2ZW50Lm1pZGlOb3RlLmlkKTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKHRyYWNrLmluc3RydW1lbnQucHJvY2Vzc0V2ZW50KTtcbiAgICAgICAgICB0cmFjay5faW5zdHJ1bWVudC5wcm9jZXNzRXZlbnQoZXZlbnQpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBjaGFubmVsID0gdHJhY2suY2hhbm5lbDtcbiAgICAgICAgICBpZihjaGFubmVsID09PSAnYW55JyB8fCBjaGFubmVsID09PSB1bmRlZmluZWQgfHwgaXNOYU4oY2hhbm5lbCkgPT09IHRydWUpe1xuICAgICAgICAgICAgY2hhbm5lbCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvcihsZXQga2V5IGluIE9iamVjdC5rZXlzKHRyYWNrLm1pZGlPdXRwdXRzKSl7XG4gICAgICAgICAgICBsZXQgbWlkaU91dHB1dCA9IHRyYWNrLm1pZGlPdXRwdXRzW2tleV07XG4gICAgICAgICAgICBpZihldmVudC50eXBlID09PSAxMjggfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAgICAgICAgIC8vbWlkaU91dHB1dC5zZW5kKFtldmVudC50eXBlLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCBldmVudC50aW1lICsgc2VxdWVuY2VyLm1pZGlPdXRMYXRlbmN5KTtcbiAgICAgICAgICAgICAgbWlkaU91dHB1dC5zZW5kKFtldmVudC50eXBlICsgY2hhbm5lbCwgZXZlbnQuZGF0YTEsIGV2ZW50LmRhdGEyXSwgZXZlbnQudGltZSk7XG4gICAgICAgICAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxOTIgfHwgZXZlbnQudHlwZSA9PT0gMjI0KXtcbiAgICAgICAgICAgICAgbWlkaU91dHB1dC5zZW5kKFtldmVudC50eXBlICsgY2hhbm5lbCwgZXZlbnQuZGF0YTFdLCBldmVudC50aW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gbmVlZGVkIGZvciBTb25nLnJlc2V0RXh0ZXJuYWxNaWRpRGV2aWNlcygpXG4gICAgICAgICAgdGhpcy5sYXN0RXZlbnRUaW1lID0gZXZlbnQudGltZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgKi9cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLm51bUV2ZW50cyAvLyBlbmQgb2Ygc29uZ1xuICB9XG59IiwiLy8gQGZsb3dcblxuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge3BhcnNlVGltZUV2ZW50cywgcGFyc2VFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtnZXRNSURJRXZlbnRJZH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHthZGRUYXNrLCByZW1vdmVUYXNrfSBmcm9tICcuL2hlYXJ0YmVhdCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbydcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi9zY2hlZHVsZXInXG5pbXBvcnQge1xuICBDUkVBVEVfU09ORyxcbiAgQUREX1RSQUNLUyxcbiAgVVBEQVRFX1NPTkcsXG4gIFNPTkdfUE9TSVRJT04sXG4gIEFERF9NSURJX0VWRU5UU19UT19TT05HLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcbmltcG9ydCB7TUlESX0gZnJvbSAnLi9xYW1iaSdcblxuY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpXG5sZXQgc29uZ0luZGV4ID0gMFxuXG5jb25zdCBkZWZhdWx0U29uZyA9IHtcbiAgcHBxOiA5NjAsXG4gIGJwbTogMTIwLFxuICBiYXJzOiAzMCxcbiAgbG93ZXN0Tm90ZTogMCxcbiAgaGlnaGVzdE5vdGU6IDEyNyxcbiAgbm9taW5hdG9yOiA0LFxuICBkZW5vbWluYXRvcjogNCxcbiAgcXVhbnRpemVWYWx1ZTogOCxcbiAgZml4ZWRMZW5ndGhWYWx1ZTogZmFsc2UsXG4gIHBvc2l0aW9uVHlwZTogJ2FsbCcsXG4gIHVzZU1ldHJvbm9tZTogZmFsc2UsXG4gIGF1dG9TaXplOiB0cnVlLFxuICBsb29wOiBmYWxzZSxcbiAgcGxheWJhY2tTcGVlZDogMSxcbiAgYXV0b1F1YW50aXplOiBmYWxzZVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTb25nKHNldHRpbmdzID0ge30pe1xuICBsZXQgaWQgPSBgU18ke3NvbmdJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHMgPSB7fTtcbiAgKHtcbiAgICBuYW1lOiBzLm5hbWUgPSBpZCxcbiAgICBwcHE6IHMucHBxID0gZGVmYXVsdFNvbmcucHBxLFxuICAgIGJwbTogcy5icG0gPSBkZWZhdWx0U29uZy5icG0sXG4gICAgYmFyczogcy5iYXJzID0gZGVmYXVsdFNvbmcuYmFycyxcbiAgICBsb3dlc3ROb3RlOiBzLmxvd2VzdE5vdGUgPSBkZWZhdWx0U29uZy5sb3dlc3ROb3RlLFxuICAgIGhpZ2hlc3ROb3RlOiBzLmhpZ2hlc3ROb3RlID0gZGVmYXVsdFNvbmcuaGlnaGVzdE5vdGUsXG4gICAgbm9taW5hdG9yOiBzLm5vbWluYXRvciA9IGRlZmF1bHRTb25nLm5vbWluYXRvcixcbiAgICBkZW5vbWluYXRvcjogcy5kZW5vbWluYXRvciA9IGRlZmF1bHRTb25nLmRlbm9taW5hdG9yLFxuICAgIHF1YW50aXplVmFsdWU6IHMucXVhbnRpemVWYWx1ZSA9IGRlZmF1bHRTb25nLnF1YW50aXplVmFsdWUsXG4gICAgZml4ZWRMZW5ndGhWYWx1ZTogcy5maXhlZExlbmd0aFZhbHVlID0gZGVmYXVsdFNvbmcuZml4ZWRMZW5ndGhWYWx1ZSxcbiAgICBwb3NpdGlvblR5cGU6IHMucG9zaXRpb25UeXBlID0gZGVmYXVsdFNvbmcucG9zaXRpb25UeXBlLFxuICAgIHVzZU1ldHJvbm9tZTogcy51c2VNZXRyb25vbWUgPSBkZWZhdWx0U29uZy51c2VNZXRyb25vbWUsXG4gICAgYXV0b1NpemU6IHMuYXV0b1NpemUgPSBkZWZhdWx0U29uZy5hdXRvU2l6ZSxcbiAgICBsb29wOiBzLmxvb3AgPSBkZWZhdWx0U29uZy5sb29wLFxuICAgIHBsYXliYWNrU3BlZWQ6IHMucGxheWJhY2tTcGVlZCA9IGRlZmF1bHRTb25nLnBsYXliYWNrU3BlZWQsXG4gICAgYXV0b1F1YW50aXplOiBzLmF1dG9RdWFudGl6ZSA9IGRlZmF1bHRTb25nLmF1dG9RdWFudGl6ZSxcbiAgfSA9IHNldHRpbmdzKVxuXG4gIGxldHtcbiAgICB0aW1lRXZlbnRzOiB0aW1lRXZlbnRzID0gW1xuICAgICAge2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb25nOiBpZCwgdGlja3M6IDAsIHR5cGU6IE1JREkuVEVNUE8sIGRhdGExOiBzLmJwbX0sXG4gICAgICB7aWQ6IGdldE1JRElFdmVudElkKCksIHNvbmc6IGlkLCB0aWNrczogMCwgdHlwZTogTUlESS5USU1FX1NJR05BVFVSRSwgZGF0YTE6IHMubm9taW5hdG9yLCBkYXRhMjogcy5kZW5vbWluYXRvcn1cbiAgICBdLFxuICAgIG1pZGlFdmVudElkczogbWlkaUV2ZW50SWRzID0gW10sXG4gICAgcGFydElkczogcGFydElkcyA9IFtdLFxuICAgIHRyYWNrSWRzOiB0cmFja0lkcyA9IFtdLFxuICB9ID0gc2V0dGluZ3NcblxuICBwYXJzZVRpbWVFdmVudHMocywgdGltZUV2ZW50cylcblxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aW1lRXZlbnRzLFxuICAgICAgbWlkaUV2ZW50SWRzLFxuICAgICAgcGFydElkcyxcbiAgICAgIHRyYWNrSWRzLFxuICAgICAgc2V0dGluZ3M6IHNcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUcmFja3Moc29uZ19pZDogc3RyaW5nLCAuLi50cmFja19pZHM6c3RyaW5nKXtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9UUkFDS1MsXG4gICAgcGF5bG9hZDoge1xuICAgICAgc29uZ19pZCxcbiAgICAgIHRyYWNrX2lkcyxcbiAgICB9XG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRpbWVFdmVudHMoLi4udGltZV9ldmVudHMpe1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRNSURJRXZlbnRzKFxuICBzZXR0aW5nczoge3NvbmdfaWQ6IHN0cmluZywgdHJhY2tfaWQ6IHN0cmluZywgcGFydF9pZDogc3RyaW5nfSxcbiAgbWlkaV9ldmVudHM6IEFycmF5PHt0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXJ9PlxuKXtcbiAgLy9AdG9kbzogY3JlYXRlIHBhcnQsIGFkZCBldmVudHMgdG8gcGFydCwgY3JlYXRlIHRyYWNrLCBhZGQgcGFydCB0byB0cmFjaywgYWRkIHRyYWNrIHRvIHNvbmdcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9NSURJX0VWRU5UU19UT19TT05HLFxuICAgIHBheWxvYWQ6IHtcbi8vICAgICAgaWQ6IHNvbmdfaWQsXG4gICAgICBtaWRpX2V2ZW50c1xuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1JRElFdmVudHNUb1Nvbmcoc29uZ19pZDogc3RyaW5nLCBtaWRpX2V2ZW50czogQXJyYXk8e3RpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlcn0+KXtcbiAgLy9AdG9kbzogY3JlYXRlIHBhcnQsIGFkZCBldmVudHMgdG8gcGFydCwgY3JlYXRlIHRyYWNrLCBhZGQgcGFydCB0byB0cmFjaywgYWRkIHRyYWNrIHRvIHNvbmdcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9NSURJX0VWRU5UU19UT19TT05HLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkOiBzb25nX2lkLFxuICAgICAgbWlkaV9ldmVudHNcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTb25nKHNvbmdfaWQ6IHN0cmluZyl7XG4gIGxldCBzdGF0ZSA9IHN0b3JlLmdldFN0YXRlKCkuZWRpdG9yXG4gIGxldCBzb25nID0gc3RhdGUuc29uZ3Nbc29uZ19pZF1cbiAgaWYoc29uZyl7XG4gICAgbGV0IG1pZGlFdmVudHMgPSBbLi4uc29uZy50aW1lRXZlbnRzXVxuICAgIHNvbmcubWlkaUV2ZW50SWRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnRfaWQpe1xuICAgICAgbGV0IGV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tldmVudF9pZF1cbiAgICAgIGlmKGV2ZW50KXtcbiAgICAgICAgbWlkaUV2ZW50cy5wdXNoKHsuLi5ldmVudH0pXG4gICAgICB9XG4gICAgfSlcbiAgICBtaWRpRXZlbnRzID0gcGFyc2VFdmVudHMobWlkaUV2ZW50cylcbiAgICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgICB0eXBlOiBVUERBVEVfU09ORyxcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgc29uZ19pZCxcbiAgICAgICAgbWlkaV9ldmVudHM6IG1pZGlFdmVudHMsXG4gICAgICAgIHNldHRpbmdzOiBzb25nLnNldHRpbmdzIC8vIG5lZWRlZCBmb3IgdGhlIHNlcXVlbmNlciByZWR1Y2VyXG4gICAgICB9XG4gICAgfSlcbiAgfWVsc2V7XG4gICAgY29uc29sZS53YXJuKGBubyBzb25nIGZvdW5kIHdpdGggaWQgJHtzb25nX2lkfWApXG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRTb25nKHNvbmdfaWQ6IHN0cmluZywgc3RhcnRfcG9zaXRpb246IG51bWJlciA9IDApe1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNjaGVkdWxlcigpe1xuICAgIGxldCB0aW1lU3RhbXAgPSBjb250ZXh0LmN1cnJlbnRUaW1lIC8vIC0+IHNob3VsZCBiZSBwZXJmb3JtYW5jZS5ub3coKVxuICAgIGxldCBzb25nRGF0YSA9IHN0b3JlLmdldFN0YXRlKCkuc2VxdWVuY2VyLnNvbmdzW3NvbmdfaWRdXG4gICAgbGV0IHNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoc29uZ0RhdGEsIHRpbWVTdGFtcCwgc3RhcnRfcG9zaXRpb24pXG4gICAgbGV0IHBvc2l0aW9uID0gc3RhcnRfcG9zaXRpb25cblxuICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgbGV0XG4gICAgICAgIG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwLFxuICAgICAgICBkaWZmID0gbm93IC0gdGltZVN0YW1wLFxuICAgICAgICBlbmRPZlNvbmdcblxuICAgICAgcG9zaXRpb24gKz0gZGlmZiAvLyBwb3NpdGlvbiBpcyBpbiBtaWxsaXNcbiAgICAgIHRpbWVTdGFtcCA9IG5vd1xuICAgICAgZW5kT2ZTb25nID0gc2NoZWR1bGVyLnVwZGF0ZShwb3NpdGlvbilcbiAgICAgIGlmKGVuZE9mU29uZyl7XG4gICAgICAgIHN0b3BTb25nKHNvbmdfaWQpXG4gICAgICB9XG4gICAgICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgICAgIHR5cGU6IFNPTkdfUE9TSVRJT04sXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBzb25nX2lkLFxuICAgICAgICAgIHBvc2l0aW9uXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgYWRkVGFzaygncmVwZXRpdGl2ZScsIHNvbmdfaWQsIGNyZWF0ZVNjaGVkdWxlcigpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcFNvbmcoc29uZ19pZDogc3RyaW5nKXtcbiAgY29uc29sZS5sb2coJ3N0b3Agc29uZycsIHNvbmdfaWQpXG4gIHJlbW92ZVRhc2soJ3JlcGV0aXRpdmUnLCBzb25nX2lkKVxufVxuIiwiXG5pbXBvcnQgcWFtYmksIHtcbiAgY3JlYXRlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50VG8sXG4gIGNyZWF0ZU1JRElOb3RlLFxuICBjcmVhdGVTb25nLFxuICBhZGRUcmFja3MsXG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcbiAgY3JlYXRlUGFydCxcbiAgYWRkTUlESUV2ZW50cyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcbn0gZnJvbSAnLi9xYW1iaSdcblxuY29uc29sZS5sb2cocWFtYmkudmVyc2lvbilcbnFhbWJpLmxvZygnZnVuY3Rpb25zJylcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG5cbiAgbGV0IGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFydCcpXG4gIGxldCBub3Rlb24sIG5vdGVvZmYsIG5vdGUsIHNvbmcsIHRyYWNrLCBwYXJ0MSwgcGFydDJcblxuICBzb25nID0gY3JlYXRlU29uZyh7bmFtZTogJ015IEZpcnN0IFNvbmcnLCBwbGF5YmFja1NwZWVkOiAxMDAsIGxvb3A6IHRydWUsIGJwbTogOTB9KVxuICB0cmFjayA9IGNyZWF0ZVRyYWNrKHtuYW1lOiAnZ3VpdGFyJywgc29uZ30pXG4gIHBhcnQxID0gY3JlYXRlUGFydCh7bmFtZTogJ3NvbG8xJywgdHJhY2t9KVxuICBwYXJ0MiA9IGNyZWF0ZVBhcnQoe25hbWU6ICdzb2xvMicsIHRyYWNrfSlcbiAgbm90ZW9uID0gY3JlYXRlTUlESUV2ZW50KDEyMCwgMTQ0LCA2MCwgMTAwKVxuICBub3Rlb2ZmID0gY3JlYXRlTUlESUV2ZW50KDEwMDAwMCwgMTI4LCA2MCwgMClcblxuICBub3RlID0gY3JlYXRlTUlESU5vdGUobm90ZW9uLCBub3Rlb2ZmKVxuXG4gIGFkZE1JRElFdmVudHMocGFydDEsIG5vdGVvbiwgbm90ZW9mZilcbiAgYWRkUGFydHModHJhY2ssIHBhcnQxLCBwYXJ0MilcbiAgYWRkVHJhY2tzKHNvbmcsIHRyYWNrKVxuICB1cGRhdGVTb25nKHNvbmcpXG5cblxuICAvL3N0YXJ0U29uZyhzb25nKVxuICAvLyBsZXQgc29uZzIgPSBjcmVhdGVTb25nKClcblxuICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gIC8vICAgc3RhcnRTb25nKHNvbmcyLCA1MDAwKVxuICAvLyB9LCAxMDAwKVxuXG4vLyAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbi8vICAgICBzdG9wU29uZyhzb25nKVxuLy8gLy8gICAgc3RvcFNvbmcoc29uZzIpXG4vLyAgIH0sIDIwMClcblxuICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHN0YXJ0U29uZyhzb25nKVxuICB9KVxufSlcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX1RSQUNLLFxuICBBRERfUEFSVFMsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCB0cmFja0luZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJhY2soXG4gIHNldHRpbmdzOiB7bmFtZTogc3RyaW5nLCBwYXJ0SWRzOkFycmF5PHN0cmluZz4sIHNvbmdJZDogc3RyaW5nfSA9IHt9XG4gIC8vc2V0dGluZ3M6IHtuYW1lOiBzdHJpbmcsIHBhcnRzOkFycmF5PHN0cmluZz4sIHNvbmc6IHN0cmluZ30gPSB7bmFtZTogJ2FhcCcsIHBhcnRzOiBbXSwgc29uZzogJ25vIHNvbmcnfVxuICAvL3NldHRpbmdzID0ge25hbWU6IG5hbWUgPSAnYWFwJywgcGFydHM6IHBhcnRzID0gW10sIHNvbmc6IHNvbmcgPSAnbm8gc29uZyd9XG4gIC8vc2V0dGluZ3MgPSB7bmFtZTogbmFtZSA9ICdhYXAnLCBwYXJ0czogcGFydHMgPSBbXSwgc29uZzogc29uZyA9ICdubyBzb25nJ31cbil7XG4gIGxldCBpZCA9IGBNVF8ke3RyYWNrSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIGxldCB7XG4gICAgbmFtZSA9IGlkLFxuICAgIHBhcnRJZHMgPSBbXSxcbiAgICBzb25nSWQgPSAnbm9uZSdcbiAgfSA9IHNldHRpbmdzXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfVFJBQ0ssXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBuYW1lLFxuICAgICAgcGFydElkcyxcbiAgICAgIHNvbmdJZFxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFBhcnRzKHRyYWNrX2lkOiBzdHJpbmcsIC4uLnBhcnRfaWRzOnN0cmluZyl7XG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfUEFSVFMsXG4gICAgcGF5bG9hZDoge1xuICAgICAgdHJhY2tfaWQsXG4gICAgICBwYXJ0X2lkcyxcbiAgICB9XG4gIH0pXG59XG4iLCJsZXRcbiAgbVBvdyA9IE1hdGgucG93LFxuICBtUm91bmQgPSBNYXRoLnJvdW5kLFxuICBtRmxvb3IgPSBNYXRoLmZsb29yLFxuICBtUmFuZG9tID0gTWF0aC5yYW5kb21cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5pY2VUaW1lKG1pbGxpcyl7XG4gIGxldCBoLCBtLCBzLCBtcyxcbiAgICBzZWNvbmRzLFxuICAgIHRpbWVBc1N0cmluZyA9ICcnO1xuXG4gIHNlY29uZHMgPSBtaWxsaXMvMTAwMDsgLy8g4oaSIG1pbGxpcyB0byBzZWNvbmRzXG4gIGggPSBtRmxvb3Ioc2Vjb25kcyAvICg2MCAqIDYwKSk7XG4gIG0gPSBtRmxvb3IoKHNlY29uZHMgJSAoNjAgKiA2MCkpIC8gNjApO1xuICBzID0gbUZsb29yKHNlY29uZHMgJSAoNjApKTtcbiAgbXMgPSBtUm91bmQoKHNlY29uZHMgLSAoaCAqIDM2MDApIC0gKG0gKiA2MCkgLSBzKSAqIDEwMDApO1xuXG4gIHRpbWVBc1N0cmluZyArPSBoICsgJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbSA8IDEwID8gJzAnICsgbSA6IG07XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBzIDwgMTAgPyAnMCcgKyBzIDogcztcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG1zID09PSAwID8gJzAwMCcgOiBtcyA8IDEwID8gJzAwJyArIG1zIDogbXMgPCAxMDAgPyAnMCcgKyBtcyA6IG1zO1xuXG4gIC8vY29uc29sZS5sb2coaCwgbSwgcywgbXMpO1xuICByZXR1cm4ge1xuICAgIGhvdXI6IGgsXG4gICAgbWludXRlOiBtLFxuICAgIHNlY29uZDogcyxcbiAgICBtaWxsaXNlY29uZDogbXMsXG4gICAgdGltZUFzU3RyaW5nOiB0aW1lQXNTdHJpbmcsXG4gICAgdGltZUFzQXJyYXk6IFtoLCBtLCBzLCBtc11cbiAgfTtcbn0iXX0=
