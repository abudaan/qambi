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
  var state = store.getState().sequencer;
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
  var state = store.getState().sequencer;
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
  var events = store.getState().sequencer.midiEvents;
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

},{"./util":28}],22:[function(require,module,exports){
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

},{"./midi_event":19,"./midi_note":20,"./part":22,"./song":25,"./track":27}],24:[function(require,module,exports){
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

function sequencer() {
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

var sequencerApp = (0, _redux.combineReducers)({
  sequencer: sequencer
});

exports.default = sequencerApp;

},{"./action_types":15,"redux":13}],25:[function(require,module,exports){
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

var _action_types = require('./action_types');

var _qambi = require('./qambi');

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

function createSong(settings) {
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
  var state = store.getState().sequencer;
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
          midi_events: midiEvents
        }
      });
    })();
  } else {
    console.warn('no song found with id ' + song_id);
  }
}

function startSong(song_id) {
  var position = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var timeStamp = _io.context.currentTime;
  var millis = position;

  (0, _heartbeat.addTask)('repetitive', song_id, function () {
    var now = _io.context.currentTime * 1000,
        diff = now - timeStamp;

    millis += diff;
    timeStamp = now;
    console.log(diff);
    //@TODO: how to connect a scheduler to a song?
    //song._scheduler.update();
  });
}

function stopSong(song_id) {
  (0, _heartbeat.removeTask)('repetitive', song_id);
}

},{"./action_types":15,"./create_store":16,"./heartbeat":17,"./io":18,"./midi_event":19,"./parse_events":21,"./qambi":23}],26:[function(require,module,exports){
'use strict';

var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_qambi2.default.version);
_qambi2.default.log('functions');

document.addEventListener('DOMContentLoaded', function () {

  var button = document.getElementById('next');
  var buttonClicked = 0;
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
  noteoff = (0, _qambi.createMIDIEvent)(240, 128, 60, 0);

  note = (0, _qambi.createMIDINote)(noteon, noteoff);

  (0, _qambi.addMIDIEvents)(part1, noteon, noteoff, 'beer', 'konijn');
  (0, _qambi.addParts)(track, part1, part2);
  (0, _qambi.addTracks)(song, track);
  (0, _qambi.updateSong)(song);
  (0, _qambi.startSong)(song);

  setTimeout(function () {
    (0, _qambi.stopSong)(song);
  }, 1000);

  button.addEventListener('click', function () {
    switch (buttonClicked) {
      case 0:
        noteon = (0, _qambi.createMIDIEvent)(120, 144, 60, 100);
        break;
      case 1:
        noteoff = (0, _qambi.createMIDIEvent)(240, 128, 60, 100);
        break;
      case 2:
        note = (0, _qambi.createMIDINote)(noteon, noteoff);
        break;
      case 3:
        (0, _qambi.moveMIDIEvent)(noteon, -100);
        break;
      case 4:
        (0, _qambi.moveMIDIEventTo)(noteoff, 260);
        break;
      default:
    }
    buttonClicked++;
  });
});

},{"./qambi":23}],27:[function(require,module,exports){
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

},{"./action_types":15,"./create_store":16}],28:[function(require,module,exports){
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

},{}]},{},[26])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19pc0hvc3RPYmplY3QuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNQbGFpbk9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcmVkdXgtbG9nZ2VyL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC10aHVuay9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2FwcGx5TWlkZGxld2FyZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvYmluZEFjdGlvbkNyZWF0b3JzLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9jb21iaW5lUmVkdWNlcnMuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NvbXBvc2UuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NyZWF0ZVN0b3JlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvdXRpbHMvd2FybmluZy5qcyIsInNyYy9hY3Rpb25fdHlwZXMuanMiLCJzcmMvY3JlYXRlX3N0b3JlLmpzIiwic3JjL2hlYXJ0YmVhdC5qcyIsInNyYy9pby5qcyIsInNyYy9taWRpX2V2ZW50LmpzIiwic3JjL21pZGlfbm90ZS5qcyIsInNyYy9wYXJzZV9ldmVudHMuanMiLCJzcmMvcGFydC5qcyIsInNyYy9xYW1iaS5qcyIsInNyYy9yZWR1Y2VyLmpzIiwic3JjL3NvbmcuanMiLCJzcmMvdGVzdF93ZWIuanMiLCJzcmMvdHJhY2suanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUN2Qk8sSUFBTSwwQ0FBaUIsZ0JBQWpCO0FBQ04sSUFBTSw0Q0FBa0IsaUJBQWxCOzs7O0FBSU4sSUFBTSxzQ0FBZSxjQUFmO0FBQ04sSUFBTSxnQ0FBWSxXQUFaO0FBQ04sSUFBTSxrQ0FBYSxZQUFiOztBQUVOLElBQU0sb0NBQWMsYUFBZDtBQUNOLElBQU0sNENBQWtCLGlCQUFsQjs7QUFFTixJQUFNLG9DQUFjLGFBQWQ7QUFDTixJQUFNLDREQUEwQix5QkFBMUI7O0FBRU4sSUFBTSxnREFBb0IsbUJBQXBCO0FBQ04sSUFBTSw4Q0FBbUIsa0JBQW5CO0FBQ04sSUFBTSxrREFBcUIsb0JBQXJCO0FBQ04sSUFBTSxnREFBb0IsbUJBQXBCO0FBQ04sSUFBTSw4Q0FBbUIsa0JBQW5COztBQUVOLElBQU0sb0NBQWMsYUFBZDs7Ozs7Ozs7Ozs7UUNYRzs7QUFWaEI7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNLFNBQVMsNEJBQVQ7QUFDTixJQUFNLFFBQVEsMkNBQTBCLEVBQTFCLEVBQThCOztBQUUxQyxRQUFPLHVEQUFQLEtBQWtCLFFBQWxCLElBQThCLE9BQU8sT0FBTyxpQkFBUCxLQUE2QixXQUFwQyxHQUFrRCxPQUFPLGlCQUFQLEVBQWhGLEdBQTZHO1NBQUs7Q0FBTCxDQUZqRyxDQUFSO0FBSUMsU0FBUyxRQUFULEdBQW1CO0FBQ3hCLFNBQU8sS0FBUCxDQUR3QjtDQUFuQjs7Ozs7Ozs7Ozs7UUM2QlM7UUFLQTs7QUEzQ2hCOztBQUVBLElBQUksYUFBYSxJQUFJLEdBQUosRUFBYjtBQUNKLElBQUksa0JBQWtCLElBQUksR0FBSixFQUFsQjtBQUNKLElBQUksaUJBQWlCLElBQUksR0FBSixFQUFqQjtBQUNKLElBQUksUUFBUSxJQUFJLEdBQUosRUFBUjtBQUNKLElBQUksc0JBQUo7O0FBRUEsU0FBUyxTQUFULENBQW1CLFNBQW5CLEVBQTZCO0FBQzNCLE1BQUksTUFBTSxZQUFRLElBQVI7OztBQURpQjs7Ozs7QUFJM0IseUJBQXVCLG9DQUF2QixvR0FBa0M7OztVQUF6QixxQkFBeUI7VUFBcEIsc0JBQW9COztBQUNoQyxVQUFHLEtBQUssSUFBTCxJQUFhLEdBQWIsRUFBaUI7QUFDbEIsYUFBSyxPQUFMLENBQWEsR0FBYixFQURrQjtBQUVsQixtQkFBVyxNQUFYLENBQWtCLEdBQWxCLEVBRmtCO09BQXBCO0tBREY7Ozs7Ozs7Ozs7Ozs7Ozs7R0FKMkI7Ozs7Ozs7QUFhM0IsMEJBQWdCLGVBQWUsTUFBZiw2QkFBaEIsd0dBQXdDO1VBQWhDLG9CQUFnQzs7QUFDdEMsV0FBSyxHQUFMLEVBRHNDO0tBQXhDOzs7Ozs7Ozs7Ozs7Ozs7O0dBYjJCOzs7Ozs7O0FBa0IzQiwwQkFBZ0IsZ0JBQWdCLE1BQWhCLDZCQUFoQix3R0FBeUM7VUFBakMscUJBQWlDOztBQUN2QyxZQUFLLEdBQUwsRUFEdUM7S0FBekM7Ozs7Ozs7Ozs7Ozs7O0dBbEIyQjs7QUFzQjNCLGtCQUFnQixTQUFoQixDQXRCMkI7QUF1QjNCLGlCQUFlLEtBQWY7OztBQXZCMkIsUUEwQjNCLENBQU8scUJBQVAsQ0FBNkIsU0FBN0IsRUExQjJCO0NBQTdCOztBQThCTyxTQUFTLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUIsRUFBdkIsRUFBMkIsSUFBM0IsRUFBZ0M7QUFDckMsTUFBSSxNQUFNLE1BQU0sR0FBTixDQUFVLElBQVYsQ0FBTixDQURpQztBQUVyQyxNQUFJLEdBQUosQ0FBUSxFQUFSLEVBQVksSUFBWixFQUZxQztDQUFoQzs7QUFLQSxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEIsRUFBMUIsRUFBNkI7QUFDbEMsTUFBSSxNQUFNLE1BQU0sR0FBTixDQUFVLElBQVYsQ0FBTixDQUQ4QjtBQUVsQyxNQUFJLE1BQUosQ0FBVyxFQUFYLEVBRmtDO0NBQTdCOztBQUtQLENBQUMsU0FBUyxLQUFULEdBQWdCO0FBQ2YsUUFBTSxHQUFOLENBQVUsT0FBVixFQUFtQixVQUFuQixFQURlO0FBRWYsUUFBTSxHQUFOLENBQVUsWUFBVixFQUF3QixlQUF4QixFQUZlO0FBR2YsUUFBTSxHQUFOLENBQVUsV0FBVixFQUF1QixjQUF2QixFQUhlO0FBSWYsY0FKZTtDQUFoQixHQUFEOzs7Ozs7Ozs7O0FDL0NBLElBQU0sVUFBVSxJQUFJLE9BQU8sWUFBUCxFQUFkOztRQUVFOzs7Ozs7OztRQ1FRO1FBZ0JBO1FBSUE7UUFxQkE7O0FBbkRoQjs7QUFDQTs7QUFDQTs7QUFLQSxJQUFNLFFBQVEsNkJBQVI7QUFDTixJQUFJLGlCQUFpQixDQUFqQjs7QUFFRyxTQUFTLGVBQVQsQ0FBeUIsS0FBekIsRUFBd0MsSUFBeEMsRUFBc0QsS0FBdEQsRUFBd0Y7TUFBbkIsOERBQWdCLENBQUMsQ0FBRCxnQkFBRzs7QUFDN0YsTUFBSSxhQUFXLHlCQUFvQixJQUFJLElBQUosR0FBVyxPQUFYLEVBQS9CLENBRHlGO0FBRTdGLFFBQU0sUUFBTixDQUFlO0FBQ2IseUNBRGE7QUFFYixhQUFTO0FBQ1AsWUFETztBQUVQLGtCQUZPO0FBR1AsZ0JBSE87QUFJUCxrQkFKTztBQUtQLGtCQUxPO0FBTVAsaUJBQVcsUUFBUSxJQUFSO0tBTmI7R0FGRixFQUY2RjtBQWE3RixTQUFPLEVBQVAsQ0FiNkY7Q0FBeEY7O0FBZ0JBLFNBQVMsY0FBVCxHQUF5QjtBQUM5QixpQkFBYSx5QkFBb0IsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUFqQyxDQUQ4QjtDQUF6Qjs7QUFJQSxTQUFTLGFBQVQsQ0FBdUIsRUFBdkIsRUFBbUMsYUFBbkMsRUFBeUQ7QUFDOUQsTUFBSSxRQUFRLE1BQU0sUUFBTixHQUFpQixTQUFqQixDQURrRDtBQUU5RCxNQUFJLFFBQVEsTUFBTSxVQUFOLENBQWlCLEVBQWpCLENBQVIsQ0FGMEQ7QUFHOUQsTUFBSSxRQUFRLE1BQU0sS0FBTixHQUFjLGFBQWQsQ0FIa0Q7QUFJOUQsVUFBUSxRQUFRLENBQVIsR0FBWSxDQUFaLEdBQWdCLEtBQWhCOztBQUpzRCxPQU05RCxDQUFNLFFBQU4sQ0FBZTtBQUNiLHlDQURhO0FBRWIsYUFBUztBQUNQLFlBRE87QUFFUCxrQkFGTztBQUdQLGlCQUFXLFFBQVEsTUFBTSxJQUFOO0tBSHJCO0dBRkY7O0FBTjhELE1BZTFELFVBQVUsTUFBTSxJQUFOLENBZmdEO0FBZ0I5RCxNQUFHLE9BQUgsRUFBVztBQUNULG1DQUFlLE9BQWYsRUFBd0IsS0FBeEIsRUFEUztHQUFYO0NBaEJLOztBQXFCQSxTQUFTLGVBQVQsQ0FBeUIsRUFBekIsRUFBcUMsS0FBckMsRUFBbUQ7QUFDeEQsTUFBSSxRQUFRLE1BQU0sUUFBTixHQUFpQixTQUFqQixDQUQ0QztBQUV4RCxNQUFJLFFBQVEsTUFBTSxVQUFOLENBQWlCLEVBQWpCLENBQVIsQ0FGb0Q7QUFHeEQsUUFBTSxRQUFOLENBQWU7QUFDYix5Q0FEYTtBQUViLGFBQVM7QUFDUCxZQURPO0FBRVAsa0JBRk87QUFHUCxpQkFBVyxRQUFRLE1BQU0sSUFBTjtLQUhyQjtHQUZGLEVBSHdEO0FBV3hELE1BQUcsT0FBTyxLQUFQLEtBQWlCLFdBQWpCLEVBQTZCO0FBQzlCLFlBQVEsS0FBUixDQUFjLG9CQUFkO0FBRDhCLEdBQWhDOztBQVh3RCxNQWVwRCxVQUFVLE1BQU0sSUFBTixDQWYwQztBQWdCeEQsTUFBRyxPQUFILEVBQVc7QUFDVCxtQ0FBZSxPQUFmLEVBQXdCLEtBQXhCLEVBRFM7R0FBWDtDQWhCSzs7Ozs7Ozs7UUMxQ1M7UUFpQkE7O0FBMUJoQjs7QUFDQTs7QUFLQSxJQUFNLFFBQVEsNkJBQVI7QUFDTixJQUFJLGdCQUFnQixDQUFoQjs7QUFFRyxTQUFTLGNBQVQsQ0FBd0IsRUFBeEIsRUFBcUQ7TUFBekIsOERBQVEsTUFBTSxRQUFOLGtCQUFpQjs7QUFDMUQsTUFBSSxPQUFPLE1BQU0sU0FBTixDQUFnQixFQUFoQixDQUFQLENBRHNEO0FBRTFELE1BQUksU0FBUyxNQUFNLFVBQU4sQ0FGNkM7QUFHMUQsTUFBSSxRQUFRLE9BQU8sS0FBSyxNQUFMLENBQWYsQ0FIc0Q7QUFJMUQsTUFBSSxNQUFNLE9BQU8sS0FBSyxPQUFMLENBQWIsQ0FKc0Q7O0FBTTFELFFBQU0sUUFBTixDQUFlO0FBQ2Isd0NBRGE7QUFFYixhQUFTO0FBQ1AsWUFETztBQUVQLGFBQU8sTUFBTSxLQUFOO0FBQ1AsV0FBSyxJQUFJLEtBQUo7QUFDTCxxQkFBZSxJQUFJLEtBQUosR0FBWSxNQUFNLEtBQU47S0FKN0I7R0FGRixFQU4wRDtDQUFyRDs7QUFpQkEsU0FBUyxjQUFULENBQXdCLE1BQXhCLEVBQXdDLE9BQXhDLEVBQXdEO0FBQzdELE1BQUksU0FBUyxNQUFNLFFBQU4sR0FBaUIsU0FBakIsQ0FBMkIsVUFBM0IsQ0FEZ0Q7QUFFN0QsTUFBSSxLQUFLLE9BQU8sTUFBUCxDQUFMLENBRnlEO0FBRzdELE1BQUksTUFBTSxPQUFPLE9BQVAsQ0FBTixDQUh5RDtBQUk3RCxNQUFHLEdBQUcsS0FBSCxLQUFhLElBQUksS0FBSixFQUFVO0FBQ3hCLFlBQVEsS0FBUixDQUFjLHFGQUFkLEVBRHdCO0FBRXhCLFdBQU8sQ0FBQyxDQUFELENBRmlCO0dBQTFCOztBQUtBLE1BQUksYUFBVyx3QkFBbUIsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUE5QixDQVR5RDtBQVU3RCxRQUFNLFFBQU4sQ0FBZTtBQUNiLHdDQURhO0FBRWIsYUFBUztBQUNQLFlBRE87QUFFUCxvQkFGTztBQUdQLHNCQUhPO0FBSVAsYUFBTyxHQUFHLEtBQUg7QUFDUCxXQUFLLElBQUksS0FBSjtBQUNMLHFCQUFlLElBQUksS0FBSixHQUFZLEdBQUcsS0FBSDtLQU43QjtHQUZGLEVBVjZEO0FBcUI3RCxTQUFPLEVBQVAsQ0FyQjZEO0NBQXhEOzs7QUM1QlA7Ozs7O1FBc0VnQjtRQXdEQTs7QUE1SGhCOztBQUVBLElBQ0UsWUFERjtJQUVFLFlBRkY7SUFHRSxlQUhGO0lBSUUsa0JBSkY7SUFLRSxvQkFMRjtJQU1FLHNCQU5GO0lBUUUsWUFSRjtJQVNFLGFBVEY7SUFVRSxrQkFWRjtJQVdFLGFBWEY7SUFZRSxjQVpGO0lBYUUsZUFiRjtJQWVFLHNCQWZGO0lBZ0JFLHVCQWhCRjtJQWtCRSxxQkFsQkY7SUFtQkUsb0JBbkJGO0lBb0JFLDBCQXBCRjtJQXFCRSxxQkFyQkY7SUF1QkUsa0JBdkJGOztBQTBCQSxTQUFTLGVBQVQsR0FBMEI7QUFDeEIsbUJBQWlCLENBQUMsR0FBSSxhQUFKLEdBQW9CLEVBQXBCLEdBQTBCLEdBQTNCLEdBQWlDLEdBQWpDLENBRE87QUFFeEIsa0JBQWdCLGlCQUFpQixJQUFqQjs7O0FBRlEsQ0FBMUI7O0FBUUEsU0FBUyxlQUFULEdBQTBCO0FBQ3hCLFdBQVUsSUFBSSxXQUFKLENBRGM7QUFFeEIsaUJBQWUsU0FBUyxDQUFULENBRlM7QUFHeEIsaUJBQWUsTUFBTSxNQUFOLENBSFM7QUFJeEIsZ0JBQWMsZUFBZSxTQUFmLENBSlU7QUFLeEIsc0JBQW9CLE1BQU0sQ0FBTjs7QUFMSSxDQUExQjs7QUFVQSxTQUFTLGNBQVQsQ0FBd0IsS0FBeEIsRUFBOEI7QUFDNUIsY0FBWSxNQUFNLEtBQU4sR0FBYyxLQUFkLENBRGdCO0FBRTVCLFVBQVEsU0FBUixDQUY0QjtBQUc1QixVQUFRLE1BQU0sS0FBTjs7QUFIb0IsUUFLNUIsSUFBVSxZQUFZLGFBQVosQ0FMa0I7O0FBTzVCLFNBQU0sUUFBUSxpQkFBUixFQUEwQjtBQUM5QixnQkFEOEI7QUFFOUIsWUFBUSxpQkFBUixDQUY4QjtBQUc5QixXQUFNLFlBQVksWUFBWixFQUF5QjtBQUM3QixtQkFBYSxZQUFiLENBRDZCO0FBRTdCLGFBRjZCO0FBRzdCLGFBQU0sT0FBTyxTQUFQLEVBQWlCO0FBQ3JCLGdCQUFRLFNBQVIsQ0FEcUI7QUFFckIsY0FGcUI7T0FBdkI7S0FIRjtHQUhGO0NBUEY7O0FBc0JPLFNBQVMsZUFBVCxDQUF5QixRQUF6QixFQUFtQyxVQUFuQyxFQUE4Qzs7QUFFbkQsTUFBSSxhQUFKLENBRm1EO0FBR25ELE1BQUksY0FBSixDQUhtRDs7QUFLbkQsUUFBTSxTQUFTLEdBQVQsQ0FMNkM7QUFNbkQsUUFBTSxTQUFTLEdBQVQsQ0FONkM7QUFPbkQsY0FBWSxTQUFTLFNBQVQsQ0FQdUM7QUFRbkQsZ0JBQWMsU0FBUyxXQUFULENBUnFDO0FBU25ELGtCQUFnQixTQUFTLGFBQVQsQ0FUbUM7QUFVbkQsUUFBTSxDQUFOLENBVm1EO0FBV25ELFNBQU8sQ0FBUCxDQVhtRDtBQVluRCxjQUFZLENBQVosQ0FabUQ7QUFhbkQsU0FBTyxDQUFQLENBYm1EO0FBY25ELFVBQVEsQ0FBUixDQWRtRDtBQWVuRCxXQUFTLENBQVQsQ0FmbUQ7O0FBaUJuRCxvQkFqQm1EO0FBa0JuRCxvQkFsQm1EOztBQW9CbkQsYUFBVyxJQUFYLENBQWdCLFVBQUMsQ0FBRCxFQUFJLENBQUo7V0FBVSxDQUFDLENBQUUsS0FBRixJQUFXLEVBQUUsS0FBRixHQUFXLENBQUMsQ0FBRCxHQUFLLENBQTVCO0dBQVYsQ0FBaEIsQ0FwQm1EOzs7Ozs7O0FBc0JuRCx5QkFBYSxvQ0FBYixvR0FBd0I7QUFBcEIsMEJBQW9COzs7QUFFdEIsYUFBTyxNQUFNLElBQU4sQ0FGZTtBQUd0QixxQkFBZSxLQUFmLEVBSHNCOztBQUt0QixjQUFPLElBQVA7O0FBRUUsYUFBSyxJQUFMO0FBQ0UsZ0JBQU0sTUFBTSxLQUFOLENBRFI7QUFFRSw0QkFGRjtBQUdFLGdCQUhGOztBQUZGLGFBT08sSUFBTDtBQUNFLHNCQUFZLE1BQU0sS0FBTixDQURkO0FBRUUsd0JBQWMsTUFBTSxLQUFOLENBRmhCO0FBR0UsNEJBSEY7QUFJRSxnQkFKRjs7QUFQRjtBQWNJLG1CQURGO0FBYkY7OztBQUxzQixpQkF1QnRCLENBQVksS0FBWjs7QUF2QnNCLEtBQXhCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F0Qm1EO0NBQTlDOzs7QUF3REEsU0FBUyxXQUFULENBQXFCLE1BQXJCLEVBQTRCO0FBQ2pDLE1BQUksY0FBSixDQURpQztBQUVqQyxNQUFJLGFBQWEsQ0FBYixDQUY2QjtBQUdqQyxNQUFJLGdCQUFnQixDQUFoQixDQUg2QjtBQUlqQyxNQUFJLFNBQVMsRUFBVDs7O0FBSjZCLE1BTzdCLFlBQVksT0FBTyxNQUFQOztBQVBpQixRQVNqQyxDQUFPLElBQVAsQ0FBWSxVQUFTLENBQVQsRUFBWSxDQUFaLEVBQWM7QUFDeEIsV0FBTyxFQUFFLFVBQUYsR0FBZSxFQUFFLFVBQUYsQ0FERTtHQUFkLENBQVosQ0FUaUM7QUFZakMsVUFBUSxPQUFPLENBQVAsQ0FBUixDQVppQzs7QUFjakMsUUFBTSxNQUFNLEdBQU4sQ0FkMkI7QUFlakMsV0FBUyxNQUFNLE1BQU4sQ0Fmd0I7QUFnQmpDLGNBQVksTUFBTSxTQUFOLENBaEJxQjtBQWlCakMsZ0JBQWMsTUFBTSxXQUFOLENBakJtQjs7QUFtQmpDLGdCQUFjLE1BQU0sV0FBTixDQW5CbUI7QUFvQmpDLGlCQUFlLE1BQU0sWUFBTixDQXBCa0I7QUFxQmpDLHNCQUFvQixNQUFNLGlCQUFOLENBckJhOztBQXVCakMsaUJBQWUsTUFBTSxZQUFOLENBdkJrQjs7QUF5QmpDLGtCQUFnQixNQUFNLGFBQU4sQ0F6QmlCO0FBMEJqQyxtQkFBaUIsTUFBTSxjQUFOLENBMUJnQjs7QUE0QmpDLFdBQVMsTUFBTSxNQUFOLENBNUJ3Qjs7QUE4QmpDLFFBQU0sTUFBTSxHQUFOLENBOUIyQjtBQStCakMsU0FBTyxNQUFNLElBQU4sQ0EvQjBCO0FBZ0NqQyxjQUFZLE1BQU0sU0FBTixDQWhDcUI7QUFpQ2pDLFNBQU8sTUFBTSxJQUFOLENBakMwQjs7QUFvQ2pDLE9BQUksSUFBSSxJQUFJLFVBQUosRUFBZ0IsSUFBSSxTQUFKLEVBQWUsR0FBdkMsRUFBMkM7O0FBRXpDLFlBQVEsT0FBTyxDQUFQLENBQVI7OztBQUZ5QyxZQUtsQyxNQUFNLElBQU47O0FBRUwsV0FBSyxJQUFMO0FBQ0UsY0FBTSxNQUFNLEtBQU4sQ0FEUjtBQUVFLGlCQUFTLE1BQU0sTUFBTixDQUZYO0FBR0Usd0JBQWdCLE1BQU0sYUFBTixDQUhsQjtBQUlFLHlCQUFpQixNQUFNLGNBQU47OztBQUpuQjs7QUFGRixXQVdPLElBQUw7QUFDRSxpQkFBUyxNQUFNLE1BQU4sQ0FEWDtBQUVFLG9CQUFZLE1BQU0sS0FBTixDQUZkO0FBR0Usc0JBQWMsTUFBTSxLQUFOLENBSGhCO0FBSUUsdUJBQWUsTUFBTSxZQUFOLENBSmpCO0FBS0Usc0JBQWMsTUFBTSxXQUFOLENBTGhCO0FBTUUsdUJBQWUsTUFBTSxZQUFOLENBTmpCO0FBT0UsNEJBQW9CLE1BQU0saUJBQU4sQ0FQdEI7QUFRRSxpQkFBUyxNQUFNLE1BQU47OztBQVJYOztBQVhGO0FBeUJJLHVCQUFlLEtBQWYsRUFERjtBQUVFLG9CQUFZLEtBQVosRUFGRjtBQUdFLGVBQU8sSUFBUCxDQUFZLEtBQVosRUFIRjtBQXhCRixLQUx5Qzs7QUFtQ3pDLG9CQUFnQixNQUFNLEtBQU4sQ0FuQ3lCO0dBQTNDO0FBcUNBLFNBQU8sTUFBUDs7QUF6RWlDLENBQTVCOztBQThFUCxTQUFTLFdBQVQsQ0FBcUIsS0FBckIsRUFBMkI7Ozs7QUFJekIsUUFBTSxHQUFOLEdBQVksR0FBWixDQUp5QjtBQUt6QixRQUFNLFNBQU4sR0FBa0IsU0FBbEIsQ0FMeUI7QUFNekIsUUFBTSxXQUFOLEdBQW9CLFdBQXBCLENBTnlCOztBQVF6QixRQUFNLFdBQU4sR0FBb0IsV0FBcEIsQ0FSeUI7QUFTekIsUUFBTSxZQUFOLEdBQXFCLFlBQXJCLENBVHlCO0FBVXpCLFFBQU0saUJBQU4sR0FBMEIsaUJBQTFCLENBVnlCOztBQVl6QixRQUFNLE1BQU4sR0FBZSxNQUFmLENBWnlCO0FBYXpCLFFBQU0sWUFBTixHQUFxQixZQUFyQixDQWJ5QjtBQWN6QixRQUFNLGNBQU4sR0FBdUIsY0FBdkIsQ0FkeUI7QUFlekIsUUFBTSxhQUFOLEdBQXNCLGFBQXRCLENBZnlCOztBQWtCekIsUUFBTSxLQUFOLEdBQWMsS0FBZCxDQWxCeUI7O0FBb0J6QixRQUFNLE1BQU4sR0FBZSxNQUFmLENBcEJ5QjtBQXFCekIsUUFBTSxPQUFOLEdBQWdCLFNBQVMsSUFBVCxDQXJCUzs7QUF3QnpCLFFBQU0sR0FBTixHQUFZLEdBQVosQ0F4QnlCO0FBeUJ6QixRQUFNLElBQU4sR0FBYSxJQUFiLENBekJ5QjtBQTBCekIsUUFBTSxTQUFOLEdBQWtCLFNBQWxCLENBMUJ5QjtBQTJCekIsUUFBTSxJQUFOLEdBQWEsSUFBYjs7QUEzQnlCLE1BNkJyQixlQUFlLFNBQVMsQ0FBVCxHQUFhLEtBQWIsR0FBcUIsT0FBTyxFQUFQLEdBQVksT0FBTyxJQUFQLEdBQWMsT0FBTyxHQUFQLEdBQWEsTUFBTSxJQUFOLEdBQWEsSUFBMUIsQ0E3QnpDO0FBOEJ6QixRQUFNLFlBQU4sR0FBcUIsTUFBTSxHQUFOLEdBQVksSUFBWixHQUFtQixHQUFuQixHQUF5QixTQUF6QixHQUFxQyxHQUFyQyxHQUEyQyxZQUEzQyxDQTlCSTtBQStCekIsUUFBTSxXQUFOLEdBQW9CLENBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxTQUFaLEVBQXVCLElBQXZCLENBQXBCLENBL0J5Qjs7QUFrQ3pCLE1BQUksV0FBVyx1QkFBWSxNQUFaLENBQVgsQ0FsQ3FCOztBQW9DekIsUUFBTSxJQUFOLEdBQWEsU0FBUyxJQUFULENBcENZO0FBcUN6QixRQUFNLE1BQU4sR0FBZSxTQUFTLE1BQVQsQ0FyQ1U7QUFzQ3pCLFFBQU0sTUFBTixHQUFlLFNBQVMsTUFBVCxDQXRDVTtBQXVDekIsUUFBTSxXQUFOLEdBQW9CLFNBQVMsV0FBVCxDQXZDSztBQXdDekIsUUFBTSxZQUFOLEdBQXFCLFNBQVMsWUFBVCxDQXhDSTtBQXlDekIsUUFBTSxXQUFOLEdBQW9CLFNBQVMsV0FBVCxDQXpDSztDQUEzQjs7Ozs7Ozs7UUNuTWdCO1FBNkJBOztBQXRDaEI7O0FBQ0E7O0FBS0EsSUFBTSxRQUFRLDZCQUFSO0FBQ04sSUFBSSxZQUFZLENBQVo7O0FBRUcsU0FBUyxVQUFULEdBT047TUFOQyxpRUFLSSxrQkFDTDs7QUFDQyxNQUFJLGFBQVcsb0JBQWUsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUExQixDQURMO3VCQU9LLFNBSkYsS0FISDtNQUdHLHNDQUFPLG9CQUhWOzhCQU9LLFNBSEYsYUFKSDtNQUlHLHFEQUFlLDJCQUpsQjs4QkFPSyxTQUZGLFlBTEg7TUFLRyxvREFBYywyQkFMakI7MEJBT0ssU0FERixRQU5IO01BTUcsNENBQVUsMkJBTmI7OztBQVNDLFFBQU0sUUFBTixDQUFlO0FBQ2IsbUNBRGE7QUFFYixhQUFTO0FBQ1AsWUFETztBQUVQLGdCQUZPO0FBR1AsZ0NBSE87QUFJUCw4QkFKTztBQUtQLHNCQUxPO0tBQVQ7R0FGRixFQVREO0FBbUJDLFNBQU8sRUFBUCxDQW5CRDtDQVBNOztBQTZCQSxTQUFTLGFBQVQsQ0FBdUIsT0FBdkIsRUFBa0U7b0NBQXZCOztHQUF1Qjs7QUFDdkUsUUFBTSxRQUFOLENBQWU7QUFDYix1Q0FEYTtBQUViLGFBQVM7QUFDUCxzQkFETztBQUVQLG9DQUZPO0tBQVQ7R0FGRixFQUR1RTtDQUFsRTs7Ozs7Ozs7OztBQ3RDUDs7QUFLQTs7QUFHQTs7QUFPQTs7QUFJQTs7QUFLQSxJQUFNLFFBQVE7QUFDWixXQUFTLE9BQVQ7OztBQUdBLDhDQUpZO0FBS1osMENBTFk7QUFNWiw4Q0FOWTs7O0FBU1osMkNBVFk7OztBQVlaLDhCQVpZO0FBYVosNEJBYlk7QUFjWiw4QkFkWTtBQWVaLDRCQWZZO0FBZ0JaLDBCQWhCWTs7O0FBbUJaLGlDQW5CWTtBQW9CWiwyQkFwQlk7OztBQXVCWiw4QkF2Qlk7QUF3Qlosb0NBeEJZOztBQTBCWixPQUFLLGFBQVMsRUFBVCxFQUFZO0FBQ2YsUUFBRyxPQUFPLFdBQVAsRUFBbUI7QUFDcEIsY0FBUSxHQUFSLGlQQURvQjtLQUF0QjtHQURHO0NBMUJEOzs7QUE2Q04sSUFBTSxPQUFPLEVBQVA7QUFDTixPQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsVUFBNUIsRUFBd0MsRUFBQyxPQUFPLElBQVAsRUFBekM7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsU0FBNUIsRUFBdUMsRUFBQyxPQUFPLElBQVAsRUFBeEM7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsZUFBNUIsRUFBNkMsRUFBQyxPQUFPLElBQVAsRUFBOUM7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsZ0JBQTVCLEVBQThDLEVBQUMsT0FBTyxJQUFQLEVBQS9DO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLGdCQUE1QixFQUE4QyxFQUFDLE9BQU8sSUFBUCxFQUEvQztBQUNBLE9BQU8sY0FBUCxDQUFzQixJQUF0QixFQUE0QixrQkFBNUIsRUFBZ0QsRUFBQyxPQUFPLElBQVAsRUFBakQ7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsWUFBNUIsRUFBMEMsRUFBQyxPQUFPLElBQVAsRUFBM0M7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsa0JBQTVCLEVBQWdELEVBQUMsT0FBTyxJQUFQLEVBQWpEO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLGVBQTVCLEVBQTZDLEVBQUMsT0FBTyxHQUFQLEVBQTlDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLGVBQTVCLEVBQTZDLEVBQUMsT0FBTyxHQUFQLEVBQTlDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLGFBQTVCLEVBQTJDLEVBQUMsT0FBTyxHQUFQLEVBQTVDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLGNBQTVCLEVBQTRDLEVBQUMsT0FBTyxHQUFQLEVBQTdDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLEtBQTVCLEVBQW1DLEVBQUMsT0FBTyxHQUFQLEVBQXBDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLGNBQTVCLEVBQTRDLEVBQUMsT0FBTyxHQUFQLEVBQTdDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLE9BQTVCLEVBQXFDLEVBQUMsT0FBTyxHQUFQLEVBQXRDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLFVBQTVCLEVBQXdDLEVBQUMsT0FBTyxHQUFQLEVBQXpDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLE1BQTVCLEVBQW9DLEVBQUMsT0FBTyxHQUFQLEVBQXJDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLGdCQUE1QixFQUE4QyxFQUFDLE9BQU8sR0FBUCxFQUEvQztBQUNBLE9BQU8sY0FBUCxDQUFzQixJQUF0QixFQUE0QixjQUE1QixFQUE0QyxFQUFDLE9BQU8sR0FBUCxFQUE3Qzs7QUFHQSxPQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsT0FBNUIsRUFBcUMsRUFBQyxPQUFPLElBQVAsRUFBdEM7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsZ0JBQTVCLEVBQThDLEVBQUMsT0FBTyxJQUFQLEVBQS9DO0FBQ0EsT0FBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLGNBQTVCLEVBQTRDLEVBQUMsT0FBTyxJQUFQLEVBQTdDOztrQkFFZTs7O0FBSWI7UUFDQTtRQUNBOzs7O0FBR0E7Ozs7QUFHQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOzs7O0FBR0E7UUFDQTs7OztBQUdBO1FBQ0E7UUFFQTs7Ozs7Ozs7Ozs7QUN6SEY7O0FBQ0E7Ozs7QUFpQkEsSUFBTSxlQUFlO0FBQ25CLFNBQU8sRUFBUDtBQUNBLFVBQVEsRUFBUjtBQUNBLFNBQU8sRUFBUDtBQUNBLGNBQVksRUFBWjtBQUNBLGFBQVcsRUFBWDtDQUxJOztBQVNOLFNBQVMsU0FBVCxHQUFnRDtNQUE3Qiw4REFBUSw0QkFBcUI7TUFBUCxzQkFBTzs7O0FBRTlDLE1BQ0UsY0FERjtNQUNTLGdCQURUO01BRUUsYUFGRjtNQUVRLGVBRlI7TUFHRSxtQkFIRixDQUY4Qzs7QUFPOUMsVUFBTyxPQUFPLElBQVA7O0FBRUw7QUFDRSwyQkFBWSxNQUFaLENBREY7QUFFRSxZQUFNLEtBQU4sQ0FBWSxPQUFPLE9BQVAsQ0FBZSxFQUFmLENBQVosR0FBaUMsT0FBTyxPQUFQLENBRm5DO0FBR0UsWUFIRjs7QUFGRixtQ0FRRTtBQUNFLDJCQUFZLE1BQVosQ0FERjtBQUVFLFlBQU0sTUFBTixDQUFhLE9BQU8sT0FBUCxDQUFlLEVBQWYsQ0FBYixHQUFrQyxPQUFPLE9BQVAsQ0FGcEM7QUFHRSxZQUhGOztBQVJGLGtDQWNFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsWUFBTSxLQUFOLENBQVksT0FBTyxPQUFQLENBQWUsRUFBZixDQUFaLEdBQWlDLE9BQU8sT0FBUCxDQUZuQztBQUdFLFlBSEY7O0FBZEYsd0NBb0JFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsWUFBTSxVQUFOLENBQWlCLE9BQU8sT0FBUCxDQUFlLEVBQWYsQ0FBakIsR0FBc0MsT0FBTyxPQUFQLENBRnhDO0FBR0UsWUFIRjs7QUFwQkYsdUNBMEJFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsWUFBTSxTQUFOLENBQWdCLE9BQU8sT0FBUCxDQUFlLEVBQWYsQ0FBaEIsR0FBcUMsT0FBTyxPQUFQLENBRnZDO0FBR0UsWUFIRjs7QUExQkYsaUNBZ0NFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsZUFBUyxPQUFPLE9BQVAsQ0FBZSxPQUFmLENBRlg7QUFHRSxhQUFPLE1BQU0sS0FBTixDQUFZLE1BQVosQ0FBUCxDQUhGO0FBSUUsVUFBRyxJQUFILEVBQVE7QUFDTixZQUFJLFdBQVcsT0FBTyxPQUFQLENBQWUsU0FBZixDQURUO0FBRU4saUJBQVMsT0FBVCxDQUFpQixVQUFTLE9BQVQsRUFBaUI7QUFDaEMsY0FBSSxRQUFRLE1BQU0sTUFBTixDQUFhLE9BQWIsQ0FBUixDQUQ0QjtBQUVoQyxjQUFHLEtBQUgsRUFBUzs7OztBQUNQLG1CQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLE9BQW5CO0FBQ0Esb0JBQU0sTUFBTixHQUFlLE1BQWY7QUFDQSxrQkFBSSxlQUFlLEVBQWY7QUFDSixvQkFBTSxPQUFOLENBQWMsT0FBZCxDQUFzQixVQUFTLE1BQVQsRUFBZ0I7QUFDcEMsb0JBQUksT0FBTyxNQUFNLEtBQU4sQ0FBWSxNQUFaLENBQVAsQ0FEZ0M7QUFFcEMscUJBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsTUFBbEIsRUFGb0M7QUFHcEMsNkJBQWEsSUFBYix3Q0FBcUIsS0FBSyxZQUFMLENBQXJCLEVBSG9DO2VBQWhCLENBQXRCO0FBS0EseUNBQUssWUFBTCxFQUFrQixJQUFsQiwyQkFBMEIsWUFBMUI7aUJBVE87V0FBVCxNQVVLO0FBQ0gsb0JBQVEsSUFBUix1QkFBaUMsT0FBakMsRUFERztXQVZMO1NBRmUsQ0FBakIsQ0FGTTtPQUFSLE1Ba0JLO0FBQ0gsZ0JBQVEsSUFBUiw0QkFBc0MsTUFBdEMsRUFERztPQWxCTDtBQXFCQSxZQXpCRjs7QUFoQ0YsZ0NBNERFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsVUFBSSxVQUFVLE9BQU8sT0FBUCxDQUFlLFFBQWYsQ0FGaEI7QUFHRSxVQUFJLFFBQVEsTUFBTSxNQUFOLENBQWEsT0FBYixDQUFSLENBSE47QUFJRSxVQUFHLEtBQUgsRUFBUzs7QUFFUCxZQUFJLFVBQVUsT0FBTyxPQUFQLENBQWUsUUFBZixDQUZQO0FBR1AsZ0JBQVEsT0FBUixDQUFnQixVQUFTLEVBQVQsRUFBWTtBQUMxQixjQUFJLE9BQU8sTUFBTSxLQUFOLENBQVksRUFBWixDQUFQLENBRHNCO0FBRTFCLGNBQUcsSUFBSCxFQUFRO0FBQ04sa0JBQU0sT0FBTixDQUFjLElBQWQsQ0FBbUIsRUFBbkIsRUFETTtBQUVOLGlCQUFLLE9BQUwsR0FBZSxPQUFmLENBRk07V0FBUixNQUdLO0FBQ0gsb0JBQVEsSUFBUixzQkFBZ0MsRUFBaEMsRUFERztXQUhMO1NBRmMsQ0FBaEIsQ0FITztPQUFULE1BWUs7QUFDSCxnQkFBUSxJQUFSLDZCQUF1QyxPQUF2QyxFQURHO09BWkw7QUFlQSxZQW5CRjs7QUE1REYsc0NBa0ZFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsVUFBSSxTQUFTLE9BQU8sT0FBUCxDQUFlLE9BQWYsQ0FGZjtBQUdFLFVBQUksT0FBTyxNQUFNLEtBQU4sQ0FBWSxNQUFaLENBQVAsQ0FITjtBQUlFLFVBQUcsSUFBSCxFQUFROztBQUVOLFlBQUksZUFBZSxPQUFPLE9BQVAsQ0FBZSxjQUFmLENBRmI7QUFHTixxQkFBYSxPQUFiLENBQXFCLFVBQVMsRUFBVCxFQUFZO0FBQy9CLGNBQUksWUFBWSxNQUFNLFVBQU4sQ0FBaUIsRUFBakIsQ0FBWixDQUQyQjtBQUUvQixjQUFHLFNBQUgsRUFBYTtBQUNYLGlCQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsRUFBdkIsRUFEVztBQUVYLHNCQUFVLE1BQVYsR0FBbUIsTUFBbkIsQ0FGVztXQUFiLE1BR0s7QUFDSCxvQkFBUSxJQUFSLGtDQUE0QyxFQUE1QyxFQURHO1dBSEw7U0FGbUIsQ0FBckIsQ0FITTtPQUFSLE1BWUs7QUFDSCxnQkFBUSxJQUFSLDRCQUFzQyxNQUF0QyxFQURHO09BWkw7QUFlQSxZQW5CRjs7QUFsRkYsd0NBd0dFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsZ0JBQVUsT0FBTyxPQUFQLENBQWUsRUFBZixDQUZaO0FBR0UsY0FBUSxNQUFNLFVBQU4sQ0FBaUIsT0FBakIsQ0FBUixDQUhGO0FBSUUsVUFBRyxLQUFILEVBQVM7OEJBS0gsT0FBTyxPQUFQLENBTEc7b0RBRUwsTUFGSztBQUVFLGNBQU0sS0FBTix5Q0FBYyxNQUFNLEtBQU4seUJBRmhCO21EQUdMLE1BSEs7QUFHRSxjQUFNLEtBQU4sd0NBQWMsTUFBTSxLQUFOLHdCQUhoQjtvREFJTCxNQUpLO0FBSUUsY0FBTSxLQUFOLHlDQUFjLE1BQU0sS0FBTix5QkFKaEI7T0FBVCxNQU1LO0FBQ0gsZ0JBQVEsSUFBUixrQ0FBNEMsT0FBNUMsRUFERztPQU5MO0FBU0EsWUFiRjs7QUF4R0YsdUNBd0hFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsVUFBSSxPQUFPLE1BQU0sU0FBTixDQUFnQixPQUFPLE9BQVAsQ0FBZSxFQUFmLENBQXZCLENBRk47NkJBUU0sT0FBTyxPQUFQLENBUk47bURBS0ksTUFMSjtBQUtXLFdBQUssS0FBTCx5Q0FBYSxLQUFLLEtBQUwseUJBTHhCO2tEQU1JLElBTko7QUFNUyxXQUFLLEdBQUwsd0NBQVcsS0FBSyxHQUFMLHdCQU5wQjttREFPSSxjQVBKO0FBT21CLFdBQUssYUFBTCx5Q0FBcUIsS0FBSyxhQUFMLHlCQVB4Qzs7QUFTRSxZQVRGOztBQXhIRixrQ0FvSUU7QUFDRSwyQkFBWSxNQUFaLENBREY7NkJBRWdELE9BQU8sT0FBUCxDQUZoRDtBQUVhLGdDQUFULFFBRko7QUFFa0Msb0NBQWIsWUFGckI7O0FBR0UsYUFBTyxNQUFNLEtBQU4sQ0FBWSxNQUFaLENBQVAsQ0FIRjtBQUlFLFdBQUssWUFBTCxHQUFvQixFQUFwQixDQUpGO0FBS0UsaUJBQVcsT0FBWCxDQUFtQixVQUFTLEtBQVQsRUFBZTtBQUNoQyxhQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsTUFBTSxFQUFOLENBQXZCLENBRGdDO0FBRWhDLGNBQU0sVUFBTixDQUFpQixNQUFNLEVBQU4sQ0FBakIsR0FBNkIsS0FBN0IsQ0FGZ0M7T0FBZixDQUFuQixDQUxGO0FBU0UsWUFURjs7QUFwSUY7O0dBUDhDO0FBMEo5QyxTQUFPLEtBQVAsQ0ExSjhDO0NBQWhEOztBQThKQSxJQUFNLGVBQWUsNEJBQWdCO0FBQ25DLHNCQURtQztDQUFoQixDQUFmOztrQkFLUzs7Ozs7Ozs7Ozs7UUN6SkM7UUFpREE7UUFXQTtRQUlBO1FBY0E7UUFXQTtRQXlCQTtRQWlCQTs7QUF0S2hCOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU1BOzs7O0FBRUEsSUFBTSxRQUFRLDZCQUFSO0FBQ04sSUFBSSxZQUFZLENBQVo7O0FBRUosSUFBTSxjQUFjO0FBQ2xCLE9BQUssR0FBTDtBQUNBLE9BQUssR0FBTDtBQUNBLFFBQU0sRUFBTjtBQUNBLGNBQVksQ0FBWjtBQUNBLGVBQWEsR0FBYjtBQUNBLGFBQVcsQ0FBWDtBQUNBLGVBQWEsQ0FBYjtBQUNBLGlCQUFlLENBQWY7QUFDQSxvQkFBa0IsS0FBbEI7QUFDQSxnQkFBYyxLQUFkO0FBQ0EsZ0JBQWMsS0FBZDtBQUNBLFlBQVUsSUFBVjtBQUNBLFFBQU0sS0FBTjtBQUNBLGlCQUFlLENBQWY7QUFDQSxnQkFBYyxLQUFkO0NBZkk7O0FBbUJDLFNBQVMsVUFBVCxDQUFvQixRQUFwQixFQUE2QjtBQUNsQyxNQUFJLFlBQVUsb0JBQWUsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUF6QixDQUQ4QjtBQUVsQyxNQUFJLElBQUksRUFBSixDQUY4Qjt1QkFvQjlCLFNBaEJGLEtBSmdDO0FBSTFCLElBQUUsSUFBRixrQ0FBUyxvQkFKaUI7c0JBb0I5QixTQWZGLElBTGdDO0FBSzNCLElBQUUsR0FBRixpQ0FBUSxZQUFZLEdBQVosaUJBTG1CO3NCQW9COUIsU0FkRixJQU5nQztBQU0zQixJQUFFLEdBQUYsaUNBQVEsWUFBWSxHQUFaLGlCQU5tQjt1QkFvQjlCLFNBYkYsS0FQZ0M7QUFPMUIsSUFBRSxJQUFGLGtDQUFTLFlBQVksSUFBWixrQkFQaUI7NkJBb0I5QixTQVpGLFdBUmdDO0FBUXBCLElBQUUsVUFBRix3Q0FBZSxZQUFZLFVBQVosd0JBUks7OEJBb0I5QixTQVhGLFlBVGdDO0FBU25CLElBQUUsV0FBRix5Q0FBZ0IsWUFBWSxXQUFaLHlCQVRHOzRCQW9COUIsU0FWRixVQVZnQztBQVVyQixJQUFFLFNBQUYsdUNBQWMsWUFBWSxTQUFaLHVCQVZPOzhCQW9COUIsU0FURixZQVhnQztBQVduQixJQUFFLFdBQUYseUNBQWdCLFlBQVksV0FBWix5QkFYRzs4QkFvQjlCLFNBUkYsY0FaZ0M7QUFZakIsSUFBRSxhQUFGLHlDQUFrQixZQUFZLGFBQVoseUJBWkQ7OEJBb0I5QixTQVBGLGlCQWJnQztBQWFkLElBQUUsZ0JBQUYseUNBQXFCLFlBQVksZ0JBQVoseUJBYlA7OEJBb0I5QixTQU5GLGFBZGdDO0FBY2xCLElBQUUsWUFBRix5Q0FBaUIsWUFBWSxZQUFaLHlCQWRDOzhCQW9COUIsU0FMRixhQWZnQztBQWVsQixJQUFFLFlBQUYseUNBQWlCLFlBQVksWUFBWix5QkFmQzsyQkFvQjlCLFNBSkYsU0FoQmdDO0FBZ0J0QixJQUFFLFFBQUYsc0NBQWEsWUFBWSxRQUFaLHNCQWhCUzt1QkFvQjlCLFNBSEYsS0FqQmdDO0FBaUIxQixJQUFFLElBQUYsa0NBQVMsWUFBWSxJQUFaLGtCQWpCaUI7OEJBb0I5QixTQUZGLGNBbEJnQztBQWtCakIsSUFBRSxhQUFGLHlDQUFrQixZQUFZLGFBQVoseUJBbEJEOzhCQW9COUIsU0FERixhQW5CZ0M7QUFtQmxCLElBQUUsWUFBRix5Q0FBaUIsWUFBWSxZQUFaLHlCQW5CQzs2QkE4QjlCLFNBUEYsV0F2QmdDO01BdUJwQixrREFBYSxDQUN2QixFQUFDLElBQUksaUNBQUosRUFBc0IsTUFBTSxFQUFOLEVBQVUsT0FBTyxDQUFQLEVBQVUsTUFBTSxZQUFLLEtBQUwsRUFBWSxPQUFPLEVBQUUsR0FBRixFQUQ3QyxFQUV2QixFQUFDLElBQUksaUNBQUosRUFBc0IsTUFBTSxFQUFOLEVBQVUsT0FBTyxDQUFQLEVBQVUsTUFBTSxZQUFLLGNBQUwsRUFBcUIsT0FBTyxFQUFFLFNBQUYsRUFBYSxPQUFPLEVBQUUsV0FBRixFQUYxRSx5QkF2Qk87OEJBOEI5QixTQUhGLGFBM0JnQztNQTJCbEIscURBQWUsMkJBM0JHOzBCQThCOUIsU0FGRixRQTVCZ0M7TUE0QnZCLDRDQUFVLHVCQTVCYTsyQkE4QjlCLFNBREYsU0E3QmdDO01BNkJ0Qiw4Q0FBVyx3QkE3Qlc7OztBQWdDbEMscUNBQWdCLENBQWhCLEVBQW1CLFVBQW5CLEVBaENrQzs7QUFrQ2xDLFFBQU0sUUFBTixDQUFlO0FBQ2IsbUNBRGE7QUFFYixhQUFTO0FBQ1AsWUFETztBQUVQLDRCQUZPO0FBR1AsZ0NBSE87QUFJUCxzQkFKTztBQUtQLHdCQUxPO0FBTVAsZ0JBQVUsQ0FBVjtLQU5GO0dBRkYsRUFsQ2tDO0FBNkNsQyxTQUFPLEVBQVAsQ0E3Q2tDO0NBQTdCOztBQWlEQSxTQUFTLFNBQVQsQ0FBbUIsT0FBbkIsRUFBd0Q7b0NBQWpCOztHQUFpQjs7QUFDN0QsUUFBTSxRQUFOLENBQWU7QUFDYixrQ0FEYTtBQUViLGFBQVM7QUFDUCxzQkFETztBQUVQLDBCQUZPO0tBQVQ7R0FGRixFQUQ2RDtDQUF4RDs7QUFXQSxTQUFTLGFBQVQsR0FBc0MsRUFBdEM7O0FBSUEsU0FBUyxhQUFULENBQ0wsUUFESyxFQUVMLFdBRkssRUFHTjs7QUFFQyxRQUFNLFFBQU4sQ0FBZTtBQUNiLCtDQURhO0FBRWIsYUFBUzs7QUFFUCw4QkFGTztLQUFUO0dBRkYsRUFGRDtDQUhNOztBQWNBLFNBQVMsbUJBQVQsQ0FBNkIsT0FBN0IsRUFBOEMsV0FBOUMsRUFBOEg7O0FBRW5JLFFBQU0sUUFBTixDQUFlO0FBQ2IsK0NBRGE7QUFFYixhQUFTO0FBQ1AsVUFBSSxPQUFKO0FBQ0EsOEJBRk87S0FBVDtHQUZGLEVBRm1JO0NBQTlIOztBQVdBLFNBQVMsVUFBVCxDQUFvQixPQUFwQixFQUFvQztBQUN6QyxNQUFJLFFBQVEsTUFBTSxRQUFOLEdBQWlCLFNBQWpCLENBRDZCO0FBRXpDLE1BQUksT0FBTyxNQUFNLEtBQU4sQ0FBWSxPQUFaLENBQVAsQ0FGcUM7QUFHekMsTUFBRyxJQUFILEVBQVE7O0FBQ04sVUFBSSwwQ0FBaUIsS0FBSyxVQUFMLEVBQWpCO0FBQ0osV0FBSyxZQUFMLENBQWtCLE9BQWxCLENBQTBCLFVBQVMsUUFBVCxFQUFrQjtBQUMxQyxZQUFJLFFBQVEsTUFBTSxVQUFOLENBQWlCLFFBQWpCLENBQVIsQ0FEc0M7QUFFMUMsWUFBRyxLQUFILEVBQVM7QUFDUCxxQkFBVyxJQUFYLGNBQW9CLE1BQXBCLEVBRE87U0FBVDtPQUZ3QixDQUExQjtBQU1BLG1CQUFhLCtCQUFZLFVBQVosQ0FBYjtBQUNBLFlBQU0sUUFBTixDQUFlO0FBQ2IsdUNBRGE7QUFFYixpQkFBUztBQUNQLDBCQURPO0FBRVAsdUJBQWEsVUFBYjtTQUZGO09BRkY7U0FUTTtHQUFSLE1BZ0JLO0FBQ0gsWUFBUSxJQUFSLDRCQUFzQyxPQUF0QyxFQURHO0dBaEJMO0NBSEs7O0FBeUJBLFNBQVMsU0FBVCxDQUFtQixPQUFuQixFQUF5RDtNQUFyQixpRUFBbUIsaUJBQUU7O0FBQzlELE1BQUksWUFBWSxZQUFRLFdBQVIsQ0FEOEM7QUFFOUQsTUFBSSxTQUFTLFFBQVQsQ0FGMEQ7O0FBSTlELDBCQUFRLFlBQVIsRUFBc0IsT0FBdEIsRUFBK0IsWUFBVTtBQUN2QyxRQUNFLE1BQU0sWUFBUSxXQUFSLEdBQXNCLElBQXRCO1FBQ04sT0FBTyxNQUFNLFNBQU4sQ0FIOEI7O0FBS3ZDLGNBQVUsSUFBVixDQUx1QztBQU12QyxnQkFBWSxHQUFaLENBTnVDO0FBT3ZDLFlBQVEsR0FBUixDQUFZLElBQVo7OztBQVB1QyxHQUFWLENBQS9CLENBSjhEO0NBQXpEOztBQWlCQSxTQUFTLFFBQVQsQ0FBa0IsT0FBbEIsRUFBa0M7QUFDdkMsNkJBQVcsWUFBWCxFQUF5QixPQUF6QixFQUR1QztDQUFsQzs7Ozs7QUN2S1A7Ozs7OztBQWdCQSxRQUFRLEdBQVIsQ0FBWSxnQkFBTSxPQUFOLENBQVo7QUFDQSxnQkFBTSxHQUFOLENBQVUsV0FBVjs7QUFFQSxTQUFTLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFVOztBQUV0RCxNQUFJLFNBQVMsU0FBUyxjQUFULENBQXdCLE1BQXhCLENBQVQsQ0FGa0Q7QUFHdEQsTUFBSSxnQkFBZ0IsQ0FBaEIsQ0FIa0Q7QUFJdEQsTUFBSSxlQUFKO01BQVksZ0JBQVo7TUFBcUIsYUFBckI7TUFBMkIsYUFBM0I7TUFBaUMsY0FBakM7TUFBd0MsY0FBeEM7TUFBK0MsY0FBL0MsQ0FKc0Q7O0FBTXRELFNBQU8sdUJBQVcsRUFBQyxNQUFNLGVBQU4sRUFBdUIsZUFBZSxHQUFmLEVBQW9CLE1BQU0sSUFBTixFQUFZLEtBQUssRUFBTCxFQUFuRSxDQUFQLENBTnNEO0FBT3RELFVBQVEsd0JBQVksRUFBQyxNQUFNLFFBQU4sRUFBZ0IsVUFBakIsRUFBWixDQUFSLENBUHNEO0FBUXRELFVBQVEsdUJBQVcsRUFBQyxNQUFNLE9BQU4sRUFBZSxZQUFoQixFQUFYLENBQVIsQ0FSc0Q7QUFTdEQsVUFBUSx1QkFBVyxFQUFDLE1BQU0sT0FBTixFQUFlLFlBQWhCLEVBQVgsQ0FBUixDQVRzRDtBQVV0RCxXQUFTLDRCQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixFQUExQixFQUE4QixHQUE5QixDQUFULENBVnNEO0FBV3RELFlBQVUsNEJBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLEVBQTFCLEVBQThCLENBQTlCLENBQVYsQ0FYc0Q7O0FBYXRELFNBQU8sMkJBQWUsTUFBZixFQUF1QixPQUF2QixDQUFQLENBYnNEOztBQWV0RCw0QkFBYyxLQUFkLEVBQXFCLE1BQXJCLEVBQTZCLE9BQTdCLEVBQXNDLE1BQXRDLEVBQThDLFFBQTlDLEVBZnNEO0FBZ0J0RCx1QkFBUyxLQUFULEVBQWdCLEtBQWhCLEVBQXVCLEtBQXZCLEVBaEJzRDtBQWlCdEQsd0JBQVUsSUFBVixFQUFnQixLQUFoQixFQWpCc0Q7QUFrQnRELHlCQUFXLElBQVgsRUFsQnNEO0FBbUJ0RCx3QkFBVSxJQUFWLEVBbkJzRDs7QUFxQnRELGFBQVcsWUFBVTtBQUNuQix5QkFBUyxJQUFULEVBRG1CO0dBQVYsRUFFUixJQUZILEVBckJzRDs7QUF5QnRELFNBQU8sZ0JBQVAsQ0FBd0IsT0FBeEIsRUFBaUMsWUFBVTtBQUN6QyxZQUFPLGFBQVA7QUFDRSxXQUFLLENBQUw7QUFDRSxpQkFBUyw0QkFBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEIsRUFBMUIsRUFBOEIsR0FBOUIsQ0FBVCxDQURGO0FBRUUsY0FGRjtBQURGLFdBSU8sQ0FBTDtBQUNFLGtCQUFVLDRCQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixFQUExQixFQUE4QixHQUE5QixDQUFWLENBREY7QUFFRSxjQUZGO0FBSkYsV0FPTyxDQUFMO0FBQ0UsZUFBTywyQkFBZSxNQUFmLEVBQXVCLE9BQXZCLENBQVAsQ0FERjtBQUVFLGNBRkY7QUFQRixXQVVPLENBQUw7QUFDRSxrQ0FBYyxNQUFkLEVBQXNCLENBQUMsR0FBRCxDQUF0QixDQURGO0FBRUUsY0FGRjtBQVZGLFdBYU8sQ0FBTDtBQUNFLG9DQUFnQixPQUFoQixFQUF5QixHQUF6QixFQURGO0FBRUUsY0FGRjtBQWJGO0tBRHlDO0FBbUJ6QyxvQkFuQnlDO0dBQVYsQ0FBakMsQ0F6QnNEO0NBQVYsQ0FBOUM7Ozs7Ozs7O1FDVGdCO1FBeUJBOztBQWxDaEI7O0FBQ0E7O0FBS0EsSUFBTSxRQUFRLDZCQUFSO0FBQ04sSUFBSSxhQUFhLENBQWI7O0FBRUcsU0FBUyxXQUFUOzs7O0FBS047TUFKQyxpRUFBa0Usa0JBSW5FOztBQUNDLE1BQUksYUFBVyxxQkFBZ0IsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUEzQixDQURMO3VCQU1LLFNBSEYsS0FISDtNQUdHLHNDQUFPLG9CQUhWOzBCQU1LLFNBRkYsUUFKSDtNQUlHLDRDQUFVLHVCQUpiO3lCQU1LLFNBREYsT0FMSDtNQUtHLDBDQUFTLDBCQUxaOztBQU9DLFFBQU0sUUFBTixDQUFlO0FBQ2Isb0NBRGE7QUFFYixhQUFTO0FBQ1AsWUFETztBQUVQLGdCQUZPO0FBR1Asc0JBSE87QUFJUCxvQkFKTztLQUFUO0dBRkYsRUFQRDtBQWdCQyxTQUFPLEVBQVAsQ0FoQkQ7Q0FMTTs7QUF5QkEsU0FBUyxRQUFULENBQWtCLFFBQWxCLEVBQXVEO29DQUFoQjs7R0FBZ0I7O0FBQzVELFFBQU0sUUFBTixDQUFlO0FBQ2IsaUNBRGE7QUFFYixhQUFTO0FBQ1Asd0JBRE87QUFFUCx3QkFGTztLQUFUO0dBRkYsRUFENEQ7Q0FBdkQ7Ozs7Ozs7O1FDOUJTO0FBTmhCLElBQ0UsT0FBTyxLQUFLLEdBQUw7SUFDUCxTQUFTLEtBQUssS0FBTDtJQUNULFNBQVMsS0FBSyxLQUFMO0lBQ1QsVUFBVSxLQUFLLE1BQUw7O0FBRUwsU0FBUyxXQUFULENBQXFCLE1BQXJCLEVBQTRCO0FBQ2pDLE1BQUksVUFBSjtNQUFPLFVBQVA7TUFBVSxVQUFWO01BQWEsV0FBYjtNQUNFLGdCQURGO01BRUUsZUFBZSxFQUFmLENBSCtCOztBQUtqQyxZQUFVLFNBQU8sSUFBUDtBQUx1QixHQU1qQyxHQUFJLE9BQU8sV0FBVyxLQUFLLEVBQUwsQ0FBWCxDQUFYLENBTmlDO0FBT2pDLE1BQUksT0FBTyxPQUFDLElBQVcsS0FBSyxFQUFMLENBQVgsR0FBdUIsRUFBeEIsQ0FBWCxDQVBpQztBQVFqQyxNQUFJLE9BQU8sVUFBVyxFQUFYLENBQVgsQ0FSaUM7QUFTakMsT0FBSyxPQUFPLENBQUMsVUFBVyxJQUFJLElBQUosR0FBYSxJQUFJLEVBQUosR0FBVSxDQUFsQyxDQUFELEdBQXdDLElBQXhDLENBQVosQ0FUaUM7O0FBV2pDLGtCQUFnQixJQUFJLEdBQUosQ0FYaUI7QUFZakMsa0JBQWdCLElBQUksRUFBSixHQUFTLE1BQU0sQ0FBTixHQUFVLENBQW5CLENBWmlCO0FBYWpDLGtCQUFnQixHQUFoQixDQWJpQztBQWNqQyxrQkFBZ0IsSUFBSSxFQUFKLEdBQVMsTUFBTSxDQUFOLEdBQVUsQ0FBbkIsQ0FkaUI7QUFlakMsa0JBQWdCLEdBQWhCLENBZmlDO0FBZ0JqQyxrQkFBZ0IsT0FBTyxDQUFQLEdBQVcsS0FBWCxHQUFtQixLQUFLLEVBQUwsR0FBVSxPQUFPLEVBQVAsR0FBWSxLQUFLLEdBQUwsR0FBVyxNQUFNLEVBQU4sR0FBVyxFQUF0Qjs7O0FBaEJ4QixTQW1CMUI7QUFDTCxVQUFNLENBQU47QUFDQSxZQUFRLENBQVI7QUFDQSxZQUFRLENBQVI7QUFDQSxpQkFBYSxFQUFiO0FBQ0Esa0JBQWMsWUFBZDtBQUNBLGlCQUFhLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsRUFBVixDQUFiO0dBTkYsQ0FuQmlDO0NBQTVCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG5cbi8qKlxuICogR2V0cyB0aGUgYFtbUHJvdG90eXBlXV1gIG9mIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge251bGx8T2JqZWN0fSBSZXR1cm5zIHRoZSBgW1tQcm90b3R5cGVdXWAuXG4gKi9cbmZ1bmN0aW9uIGdldFByb3RvdHlwZSh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlR2V0UHJvdG90eXBlKE9iamVjdCh2YWx1ZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFByb3RvdHlwZTtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCBpbiBJRSA8IDkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0hvc3RPYmplY3QodmFsdWUpIHtcbiAgLy8gTWFueSBob3N0IG9iamVjdHMgYXJlIGBPYmplY3RgIG9iamVjdHMgdGhhdCBjYW4gY29lcmNlIHRvIHN0cmluZ3NcbiAgLy8gZGVzcGl0ZSBoYXZpbmcgaW1wcm9wZXJseSBkZWZpbmVkIGB0b1N0cmluZ2AgbWV0aG9kcy5cbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICBpZiAodmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSAhISh2YWx1ZSArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNIb3N0T2JqZWN0O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGlzSG9zdE9iamVjdCA9IHJlcXVpcmUoJy4vX2lzSG9zdE9iamVjdCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gaW5mZXIgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLiAqL1xudmFyIG9iamVjdEN0b3JTdHJpbmcgPSBmdW5jVG9TdHJpbmcuY2FsbChPYmplY3QpO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiB9XG4gKlxuICogXy5pc1BsYWluT2JqZWN0KG5ldyBGb28pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KHsgJ3gnOiAwLCAneSc6IDAgfSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KE9iamVjdC5jcmVhdGUobnVsbCkpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSB8fFxuICAgICAgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgIT0gb2JqZWN0VGFnIHx8IGlzSG9zdE9iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHByb3RvID0gZ2V0UHJvdG90eXBlKHZhbHVlKTtcbiAgaWYgKHByb3RvID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIEN0b3IgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCAnY29uc3RydWN0b3InKSAmJiBwcm90by5jb25zdHJ1Y3RvcjtcbiAgcmV0dXJuICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmXG4gICAgQ3RvciBpbnN0YW5jZW9mIEN0b3IgJiYgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNQbGFpbk9iamVjdDtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfVxuXG52YXIgcmVwZWF0ID0gZnVuY3Rpb24gcmVwZWF0KHN0ciwgdGltZXMpIHtcbiAgcmV0dXJuIG5ldyBBcnJheSh0aW1lcyArIDEpLmpvaW4oc3RyKTtcbn07XG52YXIgcGFkID0gZnVuY3Rpb24gcGFkKG51bSwgbWF4TGVuZ3RoKSB7XG4gIHJldHVybiByZXBlYXQoXCIwXCIsIG1heExlbmd0aCAtIG51bS50b1N0cmluZygpLmxlbmd0aCkgKyBudW07XG59O1xudmFyIGZvcm1hdFRpbWUgPSBmdW5jdGlvbiBmb3JtYXRUaW1lKHRpbWUpIHtcbiAgcmV0dXJuIFwiQCBcIiArIHBhZCh0aW1lLmdldEhvdXJzKCksIDIpICsgXCI6XCIgKyBwYWQodGltZS5nZXRNaW51dGVzKCksIDIpICsgXCI6XCIgKyBwYWQodGltZS5nZXRTZWNvbmRzKCksIDIpICsgXCIuXCIgKyBwYWQodGltZS5nZXRNaWxsaXNlY29uZHMoKSwgMyk7XG59O1xuXG4vLyBVc2UgdGhlIG5ldyBwZXJmb3JtYW5jZSBhcGkgdG8gZ2V0IGJldHRlciBwcmVjaXNpb24gaWYgYXZhaWxhYmxlXG52YXIgdGltZXIgPSB0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyA9PT0gXCJmdW5jdGlvblwiID8gcGVyZm9ybWFuY2UgOiBEYXRlO1xuXG4vKipcbiAqIHBhcnNlIHRoZSBsZXZlbCBvcHRpb24gb2YgY3JlYXRlTG9nZ2VyXG4gKlxuICogQHByb3BlcnR5IHtzdHJpbmcgfCBmdW5jdGlvbiB8IG9iamVjdH0gbGV2ZWwgLSBjb25zb2xlW2xldmVsXVxuICogQHByb3BlcnR5IHtvYmplY3R9IGFjdGlvblxuICogQHByb3BlcnR5IHthcnJheX0gcGF5bG9hZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHR5cGVcbiAqL1xuXG5mdW5jdGlvbiBnZXRMb2dMZXZlbChsZXZlbCwgYWN0aW9uLCBwYXlsb2FkLCB0eXBlKSB7XG4gIHN3aXRjaCAodHlwZW9mIGxldmVsID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2YobGV2ZWwpKSB7XG4gICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgcmV0dXJuIHR5cGVvZiBsZXZlbFt0eXBlXSA9PT0gXCJmdW5jdGlvblwiID8gbGV2ZWxbdHlwZV0uYXBwbHkobGV2ZWwsIF90b0NvbnN1bWFibGVBcnJheShwYXlsb2FkKSkgOiBsZXZlbFt0eXBlXTtcbiAgICBjYXNlIFwiZnVuY3Rpb25cIjpcbiAgICAgIHJldHVybiBsZXZlbChhY3Rpb24pO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbGV2ZWw7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGxvZ2dlciB3aXRoIGZvbGxvd2VkIG9wdGlvbnNcbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAcHJvcGVydHkge29iamVjdH0gb3B0aW9ucyAtIG9wdGlvbnMgZm9yIGxvZ2dlclxuICogQHByb3BlcnR5IHtzdHJpbmcgfCBmdW5jdGlvbiB8IG9iamVjdH0gb3B0aW9ucy5sZXZlbCAtIGNvbnNvbGVbbGV2ZWxdXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9wdGlvbnMuZHVyYXRpb24gLSBwcmludCBkdXJhdGlvbiBvZiBlYWNoIGFjdGlvbj9cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb3B0aW9ucy50aW1lc3RhbXAgLSBwcmludCB0aW1lc3RhbXAgd2l0aCBlYWNoIGFjdGlvbj9cbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBvcHRpb25zLmNvbG9ycyAtIGN1c3RvbSBjb2xvcnNcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBvcHRpb25zLmxvZ2dlciAtIGltcGxlbWVudGF0aW9uIG9mIHRoZSBgY29uc29sZWAgQVBJXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9wdGlvbnMubG9nRXJyb3JzIC0gc2hvdWxkIGVycm9ycyBpbiBhY3Rpb24gZXhlY3V0aW9uIGJlIGNhdWdodCwgbG9nZ2VkLCBhbmQgcmUtdGhyb3duP1xuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLmNvbGxhcHNlZCAtIGlzIGdyb3VwIGNvbGxhcHNlZD9cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb3B0aW9ucy5wcmVkaWNhdGUgLSBjb25kaXRpb24gd2hpY2ggcmVzb2x2ZXMgbG9nZ2VyIGJlaGF2aW9yXG4gKiBAcHJvcGVydHkge2Z1bmN0aW9ufSBvcHRpb25zLnN0YXRlVHJhbnNmb3JtZXIgLSB0cmFuc2Zvcm0gc3RhdGUgYmVmb3JlIHByaW50XG4gKiBAcHJvcGVydHkge2Z1bmN0aW9ufSBvcHRpb25zLmFjdGlvblRyYW5zZm9ybWVyIC0gdHJhbnNmb3JtIGFjdGlvbiBiZWZvcmUgcHJpbnRcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IG9wdGlvbnMuZXJyb3JUcmFuc2Zvcm1lciAtIHRyYW5zZm9ybSBlcnJvciBiZWZvcmUgcHJpbnRcbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVMb2dnZXIoKSB7XG4gIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG4gIHZhciBfb3B0aW9ucyRsZXZlbCA9IG9wdGlvbnMubGV2ZWw7XG4gIHZhciBsZXZlbCA9IF9vcHRpb25zJGxldmVsID09PSB1bmRlZmluZWQgPyBcImxvZ1wiIDogX29wdGlvbnMkbGV2ZWw7XG4gIHZhciBfb3B0aW9ucyRsb2dnZXIgPSBvcHRpb25zLmxvZ2dlcjtcbiAgdmFyIGxvZ2dlciA9IF9vcHRpb25zJGxvZ2dlciA9PT0gdW5kZWZpbmVkID8gY29uc29sZSA6IF9vcHRpb25zJGxvZ2dlcjtcbiAgdmFyIF9vcHRpb25zJGxvZ0Vycm9ycyA9IG9wdGlvbnMubG9nRXJyb3JzO1xuICB2YXIgbG9nRXJyb3JzID0gX29wdGlvbnMkbG9nRXJyb3JzID09PSB1bmRlZmluZWQgPyB0cnVlIDogX29wdGlvbnMkbG9nRXJyb3JzO1xuICB2YXIgY29sbGFwc2VkID0gb3B0aW9ucy5jb2xsYXBzZWQ7XG4gIHZhciBwcmVkaWNhdGUgPSBvcHRpb25zLnByZWRpY2F0ZTtcbiAgdmFyIF9vcHRpb25zJGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbjtcbiAgdmFyIGR1cmF0aW9uID0gX29wdGlvbnMkZHVyYXRpb24gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX29wdGlvbnMkZHVyYXRpb247XG4gIHZhciBfb3B0aW9ucyR0aW1lc3RhbXAgPSBvcHRpb25zLnRpbWVzdGFtcDtcbiAgdmFyIHRpbWVzdGFtcCA9IF9vcHRpb25zJHRpbWVzdGFtcCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IF9vcHRpb25zJHRpbWVzdGFtcDtcbiAgdmFyIHRyYW5zZm9ybWVyID0gb3B0aW9ucy50cmFuc2Zvcm1lcjtcbiAgdmFyIF9vcHRpb25zJHN0YXRlVHJhbnNmbyA9IG9wdGlvbnMuc3RhdGVUcmFuc2Zvcm1lcjtcbiAgdmFyIC8vIGRlcHJlY2F0ZWRcbiAgc3RhdGVUcmFuc2Zvcm1lciA9IF9vcHRpb25zJHN0YXRlVHJhbnNmbyA9PT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9IDogX29wdGlvbnMkc3RhdGVUcmFuc2ZvO1xuICB2YXIgX29wdGlvbnMkYWN0aW9uVHJhbnNmID0gb3B0aW9ucy5hY3Rpb25UcmFuc2Zvcm1lcjtcbiAgdmFyIGFjdGlvblRyYW5zZm9ybWVyID0gX29wdGlvbnMkYWN0aW9uVHJhbnNmID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoYWN0bikge1xuICAgIHJldHVybiBhY3RuO1xuICB9IDogX29wdGlvbnMkYWN0aW9uVHJhbnNmO1xuICB2YXIgX29wdGlvbnMkZXJyb3JUcmFuc2ZvID0gb3B0aW9ucy5lcnJvclRyYW5zZm9ybWVyO1xuICB2YXIgZXJyb3JUcmFuc2Zvcm1lciA9IF9vcHRpb25zJGVycm9yVHJhbnNmbyA9PT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9IDogX29wdGlvbnMkZXJyb3JUcmFuc2ZvO1xuICB2YXIgX29wdGlvbnMkY29sb3JzID0gb3B0aW9ucy5jb2xvcnM7XG4gIHZhciBjb2xvcnMgPSBfb3B0aW9ucyRjb2xvcnMgPT09IHVuZGVmaW5lZCA/IHtcbiAgICB0aXRsZTogZnVuY3Rpb24gdGl0bGUoKSB7XG4gICAgICByZXR1cm4gXCIjMDAwMDAwXCI7XG4gICAgfSxcbiAgICBwcmV2U3RhdGU6IGZ1bmN0aW9uIHByZXZTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBcIiM5RTlFOUVcIjtcbiAgICB9LFxuICAgIGFjdGlvbjogZnVuY3Rpb24gYWN0aW9uKCkge1xuICAgICAgcmV0dXJuIFwiIzAzQTlGNFwiO1xuICAgIH0sXG4gICAgbmV4dFN0YXRlOiBmdW5jdGlvbiBuZXh0U3RhdGUoKSB7XG4gICAgICByZXR1cm4gXCIjNENBRjUwXCI7XG4gICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24gZXJyb3IoKSB7XG4gICAgICByZXR1cm4gXCIjRjIwNDA0XCI7XG4gICAgfVxuICB9IDogX29wdGlvbnMkY29sb3JzO1xuXG4gIC8vIGV4aXQgaWYgY29uc29sZSB1bmRlZmluZWRcblxuICBpZiAodHlwZW9mIGxvZ2dlciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHRyYW5zZm9ybWVyKSB7XG4gICAgY29uc29sZS5lcnJvcihcIk9wdGlvbiAndHJhbnNmb3JtZXInIGlzIGRlcHJlY2F0ZWQsIHVzZSBzdGF0ZVRyYW5zZm9ybWVyIGluc3RlYWRcIik7XG4gIH1cblxuICB2YXIgbG9nQnVmZmVyID0gW107XG4gIGZ1bmN0aW9uIHByaW50QnVmZmVyKCkge1xuICAgIGxvZ0J1ZmZlci5mb3JFYWNoKGZ1bmN0aW9uIChsb2dFbnRyeSwga2V5KSB7XG4gICAgICB2YXIgc3RhcnRlZCA9IGxvZ0VudHJ5LnN0YXJ0ZWQ7XG4gICAgICB2YXIgc3RhcnRlZFRpbWUgPSBsb2dFbnRyeS5zdGFydGVkVGltZTtcbiAgICAgIHZhciBhY3Rpb24gPSBsb2dFbnRyeS5hY3Rpb247XG4gICAgICB2YXIgcHJldlN0YXRlID0gbG9nRW50cnkucHJldlN0YXRlO1xuICAgICAgdmFyIGVycm9yID0gbG9nRW50cnkuZXJyb3I7XG4gICAgICB2YXIgdG9vayA9IGxvZ0VudHJ5LnRvb2s7XG4gICAgICB2YXIgbmV4dFN0YXRlID0gbG9nRW50cnkubmV4dFN0YXRlO1xuXG4gICAgICB2YXIgbmV4dEVudHJ5ID0gbG9nQnVmZmVyW2tleSArIDFdO1xuICAgICAgaWYgKG5leHRFbnRyeSkge1xuICAgICAgICBuZXh0U3RhdGUgPSBuZXh0RW50cnkucHJldlN0YXRlO1xuICAgICAgICB0b29rID0gbmV4dEVudHJ5LnN0YXJ0ZWQgLSBzdGFydGVkO1xuICAgICAgfVxuICAgICAgLy8gbWVzc2FnZVxuICAgICAgdmFyIGZvcm1hdHRlZEFjdGlvbiA9IGFjdGlvblRyYW5zZm9ybWVyKGFjdGlvbik7XG4gICAgICB2YXIgaXNDb2xsYXBzZWQgPSB0eXBlb2YgY29sbGFwc2VkID09PSBcImZ1bmN0aW9uXCIgPyBjb2xsYXBzZWQoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV4dFN0YXRlO1xuICAgICAgfSwgYWN0aW9uKSA6IGNvbGxhcHNlZDtcblxuICAgICAgdmFyIGZvcm1hdHRlZFRpbWUgPSBmb3JtYXRUaW1lKHN0YXJ0ZWRUaW1lKTtcbiAgICAgIHZhciB0aXRsZUNTUyA9IGNvbG9ycy50aXRsZSA/IFwiY29sb3I6IFwiICsgY29sb3JzLnRpdGxlKGZvcm1hdHRlZEFjdGlvbikgKyBcIjtcIiA6IG51bGw7XG4gICAgICB2YXIgdGl0bGUgPSBcImFjdGlvbiBcIiArICh0aW1lc3RhbXAgPyBmb3JtYXR0ZWRUaW1lIDogXCJcIikgKyBcIiBcIiArIGZvcm1hdHRlZEFjdGlvbi50eXBlICsgXCIgXCIgKyAoZHVyYXRpb24gPyBcIihpbiBcIiArIHRvb2sudG9GaXhlZCgyKSArIFwiIG1zKVwiIDogXCJcIik7XG5cbiAgICAgIC8vIHJlbmRlclxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGlzQ29sbGFwc2VkKSB7XG4gICAgICAgICAgaWYgKGNvbG9ycy50aXRsZSkgbG9nZ2VyLmdyb3VwQ29sbGFwc2VkKFwiJWMgXCIgKyB0aXRsZSwgdGl0bGVDU1MpO2Vsc2UgbG9nZ2VyLmdyb3VwQ29sbGFwc2VkKHRpdGxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY29sb3JzLnRpdGxlKSBsb2dnZXIuZ3JvdXAoXCIlYyBcIiArIHRpdGxlLCB0aXRsZUNTUyk7ZWxzZSBsb2dnZXIuZ3JvdXAodGl0bGUpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGxvZ2dlci5sb2codGl0bGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJldlN0YXRlTGV2ZWwgPSBnZXRMb2dMZXZlbChsZXZlbCwgZm9ybWF0dGVkQWN0aW9uLCBbcHJldlN0YXRlXSwgXCJwcmV2U3RhdGVcIik7XG4gICAgICB2YXIgYWN0aW9uTGV2ZWwgPSBnZXRMb2dMZXZlbChsZXZlbCwgZm9ybWF0dGVkQWN0aW9uLCBbZm9ybWF0dGVkQWN0aW9uXSwgXCJhY3Rpb25cIik7XG4gICAgICB2YXIgZXJyb3JMZXZlbCA9IGdldExvZ0xldmVsKGxldmVsLCBmb3JtYXR0ZWRBY3Rpb24sIFtlcnJvciwgcHJldlN0YXRlXSwgXCJlcnJvclwiKTtcbiAgICAgIHZhciBuZXh0U3RhdGVMZXZlbCA9IGdldExvZ0xldmVsKGxldmVsLCBmb3JtYXR0ZWRBY3Rpb24sIFtuZXh0U3RhdGVdLCBcIm5leHRTdGF0ZVwiKTtcblxuICAgICAgaWYgKHByZXZTdGF0ZUxldmVsKSB7XG4gICAgICAgIGlmIChjb2xvcnMucHJldlN0YXRlKSBsb2dnZXJbcHJldlN0YXRlTGV2ZWxdKFwiJWMgcHJldiBzdGF0ZVwiLCBcImNvbG9yOiBcIiArIGNvbG9ycy5wcmV2U3RhdGUocHJldlN0YXRlKSArIFwiOyBmb250LXdlaWdodDogYm9sZFwiLCBwcmV2U3RhdGUpO2Vsc2UgbG9nZ2VyW3ByZXZTdGF0ZUxldmVsXShcInByZXYgc3RhdGVcIiwgcHJldlN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFjdGlvbkxldmVsKSB7XG4gICAgICAgIGlmIChjb2xvcnMuYWN0aW9uKSBsb2dnZXJbYWN0aW9uTGV2ZWxdKFwiJWMgYWN0aW9uXCIsIFwiY29sb3I6IFwiICsgY29sb3JzLmFjdGlvbihmb3JtYXR0ZWRBY3Rpb24pICsgXCI7IGZvbnQtd2VpZ2h0OiBib2xkXCIsIGZvcm1hdHRlZEFjdGlvbik7ZWxzZSBsb2dnZXJbYWN0aW9uTGV2ZWxdKFwiYWN0aW9uXCIsIGZvcm1hdHRlZEFjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIGlmIChlcnJvciAmJiBlcnJvckxldmVsKSB7XG4gICAgICAgIGlmIChjb2xvcnMuZXJyb3IpIGxvZ2dlcltlcnJvckxldmVsXShcIiVjIGVycm9yXCIsIFwiY29sb3I6IFwiICsgY29sb3JzLmVycm9yKGVycm9yLCBwcmV2U3RhdGUpICsgXCI7IGZvbnQtd2VpZ2h0OiBib2xkXCIsIGVycm9yKTtlbHNlIGxvZ2dlcltlcnJvckxldmVsXShcImVycm9yXCIsIGVycm9yKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5leHRTdGF0ZUxldmVsKSB7XG4gICAgICAgIGlmIChjb2xvcnMubmV4dFN0YXRlKSBsb2dnZXJbbmV4dFN0YXRlTGV2ZWxdKFwiJWMgbmV4dCBzdGF0ZVwiLCBcImNvbG9yOiBcIiArIGNvbG9ycy5uZXh0U3RhdGUobmV4dFN0YXRlKSArIFwiOyBmb250LXdlaWdodDogYm9sZFwiLCBuZXh0U3RhdGUpO2Vsc2UgbG9nZ2VyW25leHRTdGF0ZUxldmVsXShcIm5leHQgc3RhdGVcIiwgbmV4dFN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgbG9nZ2VyLmdyb3VwRW5kKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGxvZ2dlci5sb2coXCLigJTigJQgbG9nIGVuZCDigJTigJRcIik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgbG9nQnVmZmVyLmxlbmd0aCA9IDA7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKF9yZWYpIHtcbiAgICB2YXIgZ2V0U3RhdGUgPSBfcmVmLmdldFN0YXRlO1xuICAgIHJldHVybiBmdW5jdGlvbiAobmV4dCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgLy8gZXhpdCBlYXJseSBpZiBwcmVkaWNhdGUgZnVuY3Rpb24gcmV0dXJucyBmYWxzZVxuICAgICAgICBpZiAodHlwZW9mIHByZWRpY2F0ZSA9PT0gXCJmdW5jdGlvblwiICYmICFwcmVkaWNhdGUoZ2V0U3RhdGUsIGFjdGlvbikpIHtcbiAgICAgICAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvZ0VudHJ5ID0ge307XG4gICAgICAgIGxvZ0J1ZmZlci5wdXNoKGxvZ0VudHJ5KTtcblxuICAgICAgICBsb2dFbnRyeS5zdGFydGVkID0gdGltZXIubm93KCk7XG4gICAgICAgIGxvZ0VudHJ5LnN0YXJ0ZWRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgbG9nRW50cnkucHJldlN0YXRlID0gc3RhdGVUcmFuc2Zvcm1lcihnZXRTdGF0ZSgpKTtcbiAgICAgICAgbG9nRW50cnkuYWN0aW9uID0gYWN0aW9uO1xuXG4gICAgICAgIHZhciByZXR1cm5lZFZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAobG9nRXJyb3JzKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybmVkVmFsdWUgPSBuZXh0KGFjdGlvbik7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nRW50cnkuZXJyb3IgPSBlcnJvclRyYW5zZm9ybWVyKGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm5lZFZhbHVlID0gbmV4dChhY3Rpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nRW50cnkudG9vayA9IHRpbWVyLm5vdygpIC0gbG9nRW50cnkuc3RhcnRlZDtcbiAgICAgICAgbG9nRW50cnkubmV4dFN0YXRlID0gc3RhdGVUcmFuc2Zvcm1lcihnZXRTdGF0ZSgpKTtcblxuICAgICAgICBwcmludEJ1ZmZlcigpO1xuXG4gICAgICAgIGlmIChsb2dFbnRyeS5lcnJvcikgdGhyb3cgbG9nRW50cnkuZXJyb3I7XG4gICAgICAgIHJldHVybiByZXR1cm5lZFZhbHVlO1xuICAgICAgfTtcbiAgICB9O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUxvZ2dlcjsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzWydkZWZhdWx0J10gPSB0aHVua01pZGRsZXdhcmU7XG5mdW5jdGlvbiB0aHVua01pZGRsZXdhcmUoX3JlZikge1xuICB2YXIgZGlzcGF0Y2ggPSBfcmVmLmRpc3BhdGNoO1xuICB2YXIgZ2V0U3RhdGUgPSBfcmVmLmdldFN0YXRlO1xuXG4gIHJldHVybiBmdW5jdGlvbiAobmV4dCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gYWN0aW9uKGRpc3BhdGNoLCBnZXRTdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gICAgfTtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGFwcGx5TWlkZGxld2FyZTtcblxudmFyIF9jb21wb3NlID0gcmVxdWlyZSgnLi9jb21wb3NlJyk7XG5cbnZhciBfY29tcG9zZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0b3JlIGVuaGFuY2VyIHRoYXQgYXBwbGllcyBtaWRkbGV3YXJlIHRvIHRoZSBkaXNwYXRjaCBtZXRob2RcbiAqIG9mIHRoZSBSZWR1eCBzdG9yZS4gVGhpcyBpcyBoYW5keSBmb3IgYSB2YXJpZXR5IG9mIHRhc2tzLCBzdWNoIGFzIGV4cHJlc3NpbmdcbiAqIGFzeW5jaHJvbm91cyBhY3Rpb25zIGluIGEgY29uY2lzZSBtYW5uZXIsIG9yIGxvZ2dpbmcgZXZlcnkgYWN0aW9uIHBheWxvYWQuXG4gKlxuICogU2VlIGByZWR1eC10aHVua2AgcGFja2FnZSBhcyBhbiBleGFtcGxlIG9mIHRoZSBSZWR1eCBtaWRkbGV3YXJlLlxuICpcbiAqIEJlY2F1c2UgbWlkZGxld2FyZSBpcyBwb3RlbnRpYWxseSBhc3luY2hyb25vdXMsIHRoaXMgc2hvdWxkIGJlIHRoZSBmaXJzdFxuICogc3RvcmUgZW5oYW5jZXIgaW4gdGhlIGNvbXBvc2l0aW9uIGNoYWluLlxuICpcbiAqIE5vdGUgdGhhdCBlYWNoIG1pZGRsZXdhcmUgd2lsbCBiZSBnaXZlbiB0aGUgYGRpc3BhdGNoYCBhbmQgYGdldFN0YXRlYCBmdW5jdGlvbnNcbiAqIGFzIG5hbWVkIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBtaWRkbGV3YXJlcyBUaGUgbWlkZGxld2FyZSBjaGFpbiB0byBiZSBhcHBsaWVkLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHN0b3JlIGVuaGFuY2VyIGFwcGx5aW5nIHRoZSBtaWRkbGV3YXJlLlxuICovXG5mdW5jdGlvbiBhcHBseU1pZGRsZXdhcmUoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBtaWRkbGV3YXJlcyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIG1pZGRsZXdhcmVzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjcmVhdGVTdG9yZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAocmVkdWNlciwgaW5pdGlhbFN0YXRlLCBlbmhhbmNlcikge1xuICAgICAgdmFyIHN0b3JlID0gY3JlYXRlU3RvcmUocmVkdWNlciwgaW5pdGlhbFN0YXRlLCBlbmhhbmNlcik7XG4gICAgICB2YXIgX2Rpc3BhdGNoID0gc3RvcmUuZGlzcGF0Y2g7XG4gICAgICB2YXIgY2hhaW4gPSBbXTtcblxuICAgICAgdmFyIG1pZGRsZXdhcmVBUEkgPSB7XG4gICAgICAgIGdldFN0YXRlOiBzdG9yZS5nZXRTdGF0ZSxcbiAgICAgICAgZGlzcGF0Y2g6IGZ1bmN0aW9uIGRpc3BhdGNoKGFjdGlvbikge1xuICAgICAgICAgIHJldHVybiBfZGlzcGF0Y2goYWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNoYWluID0gbWlkZGxld2FyZXMubWFwKGZ1bmN0aW9uIChtaWRkbGV3YXJlKSB7XG4gICAgICAgIHJldHVybiBtaWRkbGV3YXJlKG1pZGRsZXdhcmVBUEkpO1xuICAgICAgfSk7XG4gICAgICBfZGlzcGF0Y2ggPSBfY29tcG9zZTJbXCJkZWZhdWx0XCJdLmFwcGx5KHVuZGVmaW5lZCwgY2hhaW4pKHN0b3JlLmRpc3BhdGNoKTtcblxuICAgICAgcmV0dXJuIF9leHRlbmRzKHt9LCBzdG9yZSwge1xuICAgICAgICBkaXNwYXRjaDogX2Rpc3BhdGNoXG4gICAgICB9KTtcbiAgICB9O1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gYmluZEFjdGlvbkNyZWF0b3JzO1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2goYWN0aW9uQ3JlYXRvci5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvbiBjcmVhdG9ycywgaW50byBhbiBvYmplY3Qgd2l0aCB0aGVcbiAqIHNhbWUga2V5cywgYnV0IHdpdGggZXZlcnkgZnVuY3Rpb24gd3JhcHBlZCBpbnRvIGEgYGRpc3BhdGNoYCBjYWxsIHNvIHRoZXlcbiAqIG1heSBiZSBpbnZva2VkIGRpcmVjdGx5LiBUaGlzIGlzIGp1c3QgYSBjb252ZW5pZW5jZSBtZXRob2QsIGFzIHlvdSBjYW4gY2FsbFxuICogYHN0b3JlLmRpc3BhdGNoKE15QWN0aW9uQ3JlYXRvcnMuZG9Tb21ldGhpbmcoKSlgIHlvdXJzZWxmIGp1c3QgZmluZS5cbiAqXG4gKiBGb3IgY29udmVuaWVuY2UsIHlvdSBjYW4gYWxzbyBwYXNzIGEgc2luZ2xlIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCxcbiAqIGFuZCBnZXQgYSBmdW5jdGlvbiBpbiByZXR1cm4uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IGFjdGlvbkNyZWF0b3JzIEFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvblxuICogY3JlYXRvciBmdW5jdGlvbnMuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluIGl0IGlzIHRvIHVzZSBFUzYgYGltcG9ydCAqIGFzYFxuICogc3ludGF4LiBZb3UgbWF5IGFsc28gcGFzcyBhIHNpbmdsZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkaXNwYXRjaCBUaGUgYGRpc3BhdGNoYCBmdW5jdGlvbiBhdmFpbGFibGUgb24geW91ciBSZWR1eFxuICogc3RvcmUuXG4gKlxuICogQHJldHVybnMge0Z1bmN0aW9ufE9iamVjdH0gVGhlIG9iamVjdCBtaW1pY2tpbmcgdGhlIG9yaWdpbmFsIG9iamVjdCwgYnV0IHdpdGhcbiAqIGV2ZXJ5IGFjdGlvbiBjcmVhdG9yIHdyYXBwZWQgaW50byB0aGUgYGRpc3BhdGNoYCBjYWxsLiBJZiB5b3UgcGFzc2VkIGFcbiAqIGZ1bmN0aW9uIGFzIGBhY3Rpb25DcmVhdG9yc2AsIHRoZSByZXR1cm4gdmFsdWUgd2lsbCBhbHNvIGJlIGEgc2luZ2xlXG4gKiBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3JzKGFjdGlvbkNyZWF0b3JzLCBkaXNwYXRjaCkge1xuICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3JzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3JzLCBkaXNwYXRjaCk7XG4gIH1cblxuICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3JzICE9PSAnb2JqZWN0JyB8fCBhY3Rpb25DcmVhdG9ycyA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYmluZEFjdGlvbkNyZWF0b3JzIGV4cGVjdGVkIGFuIG9iamVjdCBvciBhIGZ1bmN0aW9uLCBpbnN0ZWFkIHJlY2VpdmVkICcgKyAoYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YgYWN0aW9uQ3JlYXRvcnMpICsgJy4gJyArICdEaWQgeW91IHdyaXRlIFwiaW1wb3J0IEFjdGlvbkNyZWF0b3JzIGZyb21cIiBpbnN0ZWFkIG9mIFwiaW1wb3J0ICogYXMgQWN0aW9uQ3JlYXRvcnMgZnJvbVwiPycpO1xuICB9XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhY3Rpb25DcmVhdG9ycyk7XG4gIHZhciBib3VuZEFjdGlvbkNyZWF0b3JzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIHZhciBhY3Rpb25DcmVhdG9yID0gYWN0aW9uQ3JlYXRvcnNba2V5XTtcbiAgICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGJvdW5kQWN0aW9uQ3JlYXRvcnNba2V5XSA9IGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3IsIGRpc3BhdGNoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJvdW5kQWN0aW9uQ3JlYXRvcnM7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjb21iaW5lUmVkdWNlcnM7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxudmFyIF93YXJuaW5nID0gcmVxdWlyZSgnLi91dGlscy93YXJuaW5nJyk7XG5cbnZhciBfd2FybmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXJuaW5nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGdldFVuZGVmaW5lZFN0YXRlRXJyb3JNZXNzYWdlKGtleSwgYWN0aW9uKSB7XG4gIHZhciBhY3Rpb25UeXBlID0gYWN0aW9uICYmIGFjdGlvbi50eXBlO1xuICB2YXIgYWN0aW9uTmFtZSA9IGFjdGlvblR5cGUgJiYgJ1wiJyArIGFjdGlvblR5cGUudG9TdHJpbmcoKSArICdcIicgfHwgJ2FuIGFjdGlvbic7XG5cbiAgcmV0dXJuICdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgaGFuZGxpbmcgJyArIGFjdGlvbk5hbWUgKyAnLiAnICsgJ1RvIGlnbm9yZSBhbiBhY3Rpb24sIHlvdSBtdXN0IGV4cGxpY2l0bHkgcmV0dXJuIHRoZSBwcmV2aW91cyBzdGF0ZS4nO1xufVxuXG5mdW5jdGlvbiBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKGlucHV0U3RhdGUsIHJlZHVjZXJzLCBhY3Rpb24pIHtcbiAgdmFyIHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICB2YXIgYXJndW1lbnROYW1lID0gYWN0aW9uICYmIGFjdGlvbi50eXBlID09PSBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCA/ICdpbml0aWFsU3RhdGUgYXJndW1lbnQgcGFzc2VkIHRvIGNyZWF0ZVN0b3JlJyA6ICdwcmV2aW91cyBzdGF0ZSByZWNlaXZlZCBieSB0aGUgcmVkdWNlcic7XG5cbiAgaWYgKHJlZHVjZXJLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnU3RvcmUgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIHJlZHVjZXIuIE1ha2Ugc3VyZSB0aGUgYXJndW1lbnQgcGFzc2VkICcgKyAndG8gY29tYmluZVJlZHVjZXJzIGlzIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIHJlZHVjZXJzLic7XG4gIH1cblxuICBpZiAoISgwLCBfaXNQbGFpbk9iamVjdDJbXCJkZWZhdWx0XCJdKShpbnB1dFN0YXRlKSkge1xuICAgIHJldHVybiAnVGhlICcgKyBhcmd1bWVudE5hbWUgKyAnIGhhcyB1bmV4cGVjdGVkIHR5cGUgb2YgXCInICsge30udG9TdHJpbmcuY2FsbChpbnB1dFN0YXRlKS5tYXRjaCgvXFxzKFthLXp8QS1aXSspLylbMV0gKyAnXCIuIEV4cGVjdGVkIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgJyArICgna2V5czogXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCInKTtcbiAgfVxuXG4gIHZhciB1bmV4cGVjdGVkS2V5cyA9IE9iamVjdC5rZXlzKGlucHV0U3RhdGUpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuICFyZWR1Y2Vycy5oYXNPd25Qcm9wZXJ0eShrZXkpO1xuICB9KTtcblxuICBpZiAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiAnVW5leHBlY3RlZCAnICsgKHVuZXhwZWN0ZWRLZXlzLmxlbmd0aCA+IDEgPyAna2V5cycgOiAna2V5JykgKyAnICcgKyAoJ1wiJyArIHVuZXhwZWN0ZWRLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiIGZvdW5kIGluICcgKyBhcmd1bWVudE5hbWUgKyAnLiAnKSArICdFeHBlY3RlZCB0byBmaW5kIG9uZSBvZiB0aGUga25vd24gcmVkdWNlciBrZXlzIGluc3RlYWQ6ICcgKyAoJ1wiJyArIHJlZHVjZXJLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiLiBVbmV4cGVjdGVkIGtleXMgd2lsbCBiZSBpZ25vcmVkLicpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFJlZHVjZXJTYW5pdHkocmVkdWNlcnMpIHtcbiAgT2JqZWN0LmtleXMocmVkdWNlcnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciByZWR1Y2VyID0gcmVkdWNlcnNba2V5XTtcbiAgICB2YXIgaW5pdGlhbFN0YXRlID0gcmVkdWNlcih1bmRlZmluZWQsIHsgdHlwZTogX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgfSk7XG5cbiAgICBpZiAodHlwZW9mIGluaXRpYWxTdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIGR1cmluZyBpbml0aWFsaXphdGlvbi4gJyArICdJZiB0aGUgc3RhdGUgcGFzc2VkIHRvIHRoZSByZWR1Y2VyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgJyArICdleHBsaWNpdGx5IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS4gVGhlIGluaXRpYWwgc3RhdGUgbWF5ICcgKyAnbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9ICdAQHJlZHV4L1BST0JFX1VOS05PV05fQUNUSU9OXycgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNykuc3BsaXQoJycpLmpvaW4oJy4nKTtcbiAgICBpZiAodHlwZW9mIHJlZHVjZXIodW5kZWZpbmVkLCB7IHR5cGU6IHR5cGUgfSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCB3aGVuIHByb2JlZCB3aXRoIGEgcmFuZG9tIHR5cGUuICcgKyAoJ0RvblxcJ3QgdHJ5IHRvIGhhbmRsZSAnICsgX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgKyAnIG9yIG90aGVyIGFjdGlvbnMgaW4gXCJyZWR1eC8qXCIgJykgKyAnbmFtZXNwYWNlLiBUaGV5IGFyZSBjb25zaWRlcmVkIHByaXZhdGUuIEluc3RlYWQsIHlvdSBtdXN0IHJldHVybiB0aGUgJyArICdjdXJyZW50IHN0YXRlIGZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB1bmxlc3MgaXQgaXMgdW5kZWZpbmVkLCAnICsgJ2luIHdoaWNoIGNhc2UgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLCByZWdhcmRsZXNzIG9mIHRoZSAnICsgJ2FjdGlvbiB0eXBlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGRpZmZlcmVudCByZWR1Y2VyIGZ1bmN0aW9ucywgaW50byBhIHNpbmdsZVxuICogcmVkdWNlciBmdW5jdGlvbi4gSXQgd2lsbCBjYWxsIGV2ZXJ5IGNoaWxkIHJlZHVjZXIsIGFuZCBnYXRoZXIgdGhlaXIgcmVzdWx0c1xuICogaW50byBhIHNpbmdsZSBzdGF0ZSBvYmplY3QsIHdob3NlIGtleXMgY29ycmVzcG9uZCB0byB0aGUga2V5cyBvZiB0aGUgcGFzc2VkXG4gKiByZWR1Y2VyIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVkdWNlcnMgQW4gb2JqZWN0IHdob3NlIHZhbHVlcyBjb3JyZXNwb25kIHRvIGRpZmZlcmVudFxuICogcmVkdWNlciBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlIGNvbWJpbmVkIGludG8gb25lLiBPbmUgaGFuZHkgd2F5IHRvIG9idGFpblxuICogaXQgaXMgdG8gdXNlIEVTNiBgaW1wb3J0ICogYXMgcmVkdWNlcnNgIHN5bnRheC4gVGhlIHJlZHVjZXJzIG1heSBuZXZlciByZXR1cm5cbiAqIHVuZGVmaW5lZCBmb3IgYW55IGFjdGlvbi4gSW5zdGVhZCwgdGhleSBzaG91bGQgcmV0dXJuIHRoZWlyIGluaXRpYWwgc3RhdGVcbiAqIGlmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlbSB3YXMgdW5kZWZpbmVkLCBhbmQgdGhlIGN1cnJlbnQgc3RhdGUgZm9yIGFueVxuICogdW5yZWNvZ25pemVkIGFjdGlvbi5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgcmVkdWNlciBmdW5jdGlvbiB0aGF0IGludm9rZXMgZXZlcnkgcmVkdWNlciBpbnNpZGUgdGhlXG4gKiBwYXNzZWQgb2JqZWN0LCBhbmQgYnVpbGRzIGEgc3RhdGUgb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUuXG4gKi9cbmZ1bmN0aW9uIGNvbWJpbmVSZWR1Y2VycyhyZWR1Y2Vycykge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBmaW5hbFJlZHVjZXJzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gcmVkdWNlcktleXNbaV07XG4gICAgaWYgKHR5cGVvZiByZWR1Y2Vyc1trZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmaW5hbFJlZHVjZXJzW2tleV0gPSByZWR1Y2Vyc1trZXldO1xuICAgIH1cbiAgfVxuICB2YXIgZmluYWxSZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKGZpbmFsUmVkdWNlcnMpO1xuXG4gIHZhciBzYW5pdHlFcnJvcjtcbiAgdHJ5IHtcbiAgICBhc3NlcnRSZWR1Y2VyU2FuaXR5KGZpbmFsUmVkdWNlcnMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc2FuaXR5RXJyb3IgPSBlO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbWJpbmF0aW9uKCkge1xuICAgIHZhciBzdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHNbMV07XG5cbiAgICBpZiAoc2FuaXR5RXJyb3IpIHtcbiAgICAgIHRocm93IHNhbml0eUVycm9yO1xuICAgIH1cblxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB2YXIgd2FybmluZ01lc3NhZ2UgPSBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKHN0YXRlLCBmaW5hbFJlZHVjZXJzLCBhY3Rpb24pO1xuICAgICAgaWYgKHdhcm5pbmdNZXNzYWdlKSB7XG4gICAgICAgICgwLCBfd2FybmluZzJbXCJkZWZhdWx0XCJdKSh3YXJuaW5nTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGhhc0NoYW5nZWQgPSBmYWxzZTtcbiAgICB2YXIgbmV4dFN0YXRlID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaW5hbFJlZHVjZXJLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0gZmluYWxSZWR1Y2VyS2V5c1tpXTtcbiAgICAgIHZhciByZWR1Y2VyID0gZmluYWxSZWR1Y2Vyc1trZXldO1xuICAgICAgdmFyIHByZXZpb3VzU3RhdGVGb3JLZXkgPSBzdGF0ZVtrZXldO1xuICAgICAgdmFyIG5leHRTdGF0ZUZvcktleSA9IHJlZHVjZXIocHJldmlvdXNTdGF0ZUZvcktleSwgYWN0aW9uKTtcbiAgICAgIGlmICh0eXBlb2YgbmV4dFN0YXRlRm9yS2V5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gZ2V0VW5kZWZpbmVkU3RhdGVFcnJvck1lc3NhZ2Uoa2V5LCBhY3Rpb24pO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIG5leHRTdGF0ZVtrZXldID0gbmV4dFN0YXRlRm9yS2V5O1xuICAgICAgaGFzQ2hhbmdlZCA9IGhhc0NoYW5nZWQgfHwgbmV4dFN0YXRlRm9yS2V5ICE9PSBwcmV2aW91c1N0YXRlRm9yS2V5O1xuICAgIH1cbiAgICByZXR1cm4gaGFzQ2hhbmdlZCA/IG5leHRTdGF0ZSA6IHN0YXRlO1xuICB9O1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjb21wb3NlO1xuLyoqXG4gKiBDb21wb3NlcyBzaW5nbGUtYXJndW1lbnQgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jcyBUaGUgZnVuY3Rpb25zIHRvIGNvbXBvc2UuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gb2J0YWluZWQgYnkgY29tcG9zaW5nIGZ1bmN0aW9ucyBmcm9tIHJpZ2h0IHRvXG4gKiBsZWZ0LiBGb3IgZXhhbXBsZSwgY29tcG9zZShmLCBnLCBoKSBpcyBpZGVudGljYWwgdG8gYXJnID0+IGYoZyhoKGFyZykpKS5cbiAqL1xuZnVuY3Rpb24gY29tcG9zZSgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGZ1bmNzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgZnVuY3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGlmIChmdW5jcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDw9IDAgPyB1bmRlZmluZWQgOiBhcmd1bWVudHNbMF07XG4gICAgfVxuXG4gICAgdmFyIGxhc3QgPSBmdW5jc1tmdW5jcy5sZW5ndGggLSAxXTtcbiAgICB2YXIgcmVzdCA9IGZ1bmNzLnNsaWNlKDAsIC0xKTtcblxuICAgIHJldHVybiByZXN0LnJlZHVjZVJpZ2h0KGZ1bmN0aW9uIChjb21wb3NlZCwgZikge1xuICAgICAgcmV0dXJuIGYoY29tcG9zZWQpO1xuICAgIH0sIGxhc3QuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLkFjdGlvblR5cGVzID0gdW5kZWZpbmVkO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjcmVhdGVTdG9yZTtcblxudmFyIF9pc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoL2lzUGxhaW5PYmplY3QnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzUGxhaW5PYmplY3QpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLyoqXG4gKiBUaGVzZSBhcmUgcHJpdmF0ZSBhY3Rpb24gdHlwZXMgcmVzZXJ2ZWQgYnkgUmVkdXguXG4gKiBGb3IgYW55IHVua25vd24gYWN0aW9ucywgeW91IG11c3QgcmV0dXJuIHRoZSBjdXJyZW50IHN0YXRlLlxuICogSWYgdGhlIGN1cnJlbnQgc3RhdGUgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUuXG4gKiBEbyBub3QgcmVmZXJlbmNlIHRoZXNlIGFjdGlvbiB0eXBlcyBkaXJlY3RseSBpbiB5b3VyIGNvZGUuXG4gKi9cbnZhciBBY3Rpb25UeXBlcyA9IGV4cG9ydHMuQWN0aW9uVHlwZXMgPSB7XG4gIElOSVQ6ICdAQHJlZHV4L0lOSVQnXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBSZWR1eCBzdG9yZSB0aGF0IGhvbGRzIHRoZSBzdGF0ZSB0cmVlLlxuICogVGhlIG9ubHkgd2F5IHRvIGNoYW5nZSB0aGUgZGF0YSBpbiB0aGUgc3RvcmUgaXMgdG8gY2FsbCBgZGlzcGF0Y2goKWAgb24gaXQuXG4gKlxuICogVGhlcmUgc2hvdWxkIG9ubHkgYmUgYSBzaW5nbGUgc3RvcmUgaW4geW91ciBhcHAuIFRvIHNwZWNpZnkgaG93IGRpZmZlcmVudFxuICogcGFydHMgb2YgdGhlIHN0YXRlIHRyZWUgcmVzcG9uZCB0byBhY3Rpb25zLCB5b3UgbWF5IGNvbWJpbmUgc2V2ZXJhbCByZWR1Y2Vyc1xuICogaW50byBhIHNpbmdsZSByZWR1Y2VyIGZ1bmN0aW9uIGJ5IHVzaW5nIGBjb21iaW5lUmVkdWNlcnNgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlZHVjZXIgQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIG5leHQgc3RhdGUgdHJlZSwgZ2l2ZW5cbiAqIHRoZSBjdXJyZW50IHN0YXRlIHRyZWUgYW5kIHRoZSBhY3Rpb24gdG8gaGFuZGxlLlxuICpcbiAqIEBwYXJhbSB7YW55fSBbaW5pdGlhbFN0YXRlXSBUaGUgaW5pdGlhbCBzdGF0ZS4gWW91IG1heSBvcHRpb25hbGx5IHNwZWNpZnkgaXRcbiAqIHRvIGh5ZHJhdGUgdGhlIHN0YXRlIGZyb20gdGhlIHNlcnZlciBpbiB1bml2ZXJzYWwgYXBwcywgb3IgdG8gcmVzdG9yZSBhXG4gKiBwcmV2aW91c2x5IHNlcmlhbGl6ZWQgdXNlciBzZXNzaW9uLlxuICogSWYgeW91IHVzZSBgY29tYmluZVJlZHVjZXJzYCB0byBwcm9kdWNlIHRoZSByb290IHJlZHVjZXIgZnVuY3Rpb24sIHRoaXMgbXVzdCBiZVxuICogYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUgYXMgYGNvbWJpbmVSZWR1Y2Vyc2Aga2V5cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlbmhhbmNlciBUaGUgc3RvcmUgZW5oYW5jZXIuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBlbmhhbmNlIHRoZSBzdG9yZSB3aXRoIHRoaXJkLXBhcnR5IGNhcGFiaWxpdGllcyBzdWNoIGFzIG1pZGRsZXdhcmUsXG4gKiB0aW1lIHRyYXZlbCwgcGVyc2lzdGVuY2UsIGV0Yy4gVGhlIG9ubHkgc3RvcmUgZW5oYW5jZXIgdGhhdCBzaGlwcyB3aXRoIFJlZHV4XG4gKiBpcyBgYXBwbHlNaWRkbGV3YXJlKClgLlxuICpcbiAqIEByZXR1cm5zIHtTdG9yZX0gQSBSZWR1eCBzdG9yZSB0aGF0IGxldHMgeW91IHJlYWQgdGhlIHN0YXRlLCBkaXNwYXRjaCBhY3Rpb25zXG4gKiBhbmQgc3Vic2NyaWJlIHRvIGNoYW5nZXMuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVN0b3JlKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSwgZW5oYW5jZXIpIHtcbiAgaWYgKHR5cGVvZiBpbml0aWFsU3RhdGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGVuaGFuY2VyID09PSAndW5kZWZpbmVkJykge1xuICAgIGVuaGFuY2VyID0gaW5pdGlhbFN0YXRlO1xuICAgIGluaXRpYWxTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBlbmhhbmNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgZW5oYW5jZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW5oYW5jZXIoY3JlYXRlU3RvcmUpKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIHJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSByZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgY3VycmVudFJlZHVjZXIgPSByZWR1Y2VyO1xuICB2YXIgY3VycmVudFN0YXRlID0gaW5pdGlhbFN0YXRlO1xuICB2YXIgY3VycmVudExpc3RlbmVycyA9IFtdO1xuICB2YXIgbmV4dExpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnM7XG4gIHZhciBpc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpIHtcbiAgICBpZiAobmV4dExpc3RlbmVycyA9PT0gY3VycmVudExpc3RlbmVycykge1xuICAgICAgbmV4dExpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnMuc2xpY2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIHN0YXRlIHRyZWUgbWFuYWdlZCBieSB0aGUgc3RvcmUuXG4gICAqXG4gICAqIEByZXR1cm5zIHthbnl9IFRoZSBjdXJyZW50IHN0YXRlIHRyZWUgb2YgeW91ciBhcHBsaWNhdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIGdldFN0YXRlKCkge1xuICAgIHJldHVybiBjdXJyZW50U3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGNoYW5nZSBsaXN0ZW5lci4gSXQgd2lsbCBiZSBjYWxsZWQgYW55IHRpbWUgYW4gYWN0aW9uIGlzIGRpc3BhdGNoZWQsXG4gICAqIGFuZCBzb21lIHBhcnQgb2YgdGhlIHN0YXRlIHRyZWUgbWF5IHBvdGVudGlhbGx5IGhhdmUgY2hhbmdlZC4gWW91IG1heSB0aGVuXG4gICAqIGNhbGwgYGdldFN0YXRlKClgIHRvIHJlYWQgdGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBpbnNpZGUgdGhlIGNhbGxiYWNrLlxuICAgKlxuICAgKiBZb3UgbWF5IGNhbGwgYGRpc3BhdGNoKClgIGZyb20gYSBjaGFuZ2UgbGlzdGVuZXIsIHdpdGggdGhlIGZvbGxvd2luZ1xuICAgKiBjYXZlYXRzOlxuICAgKlxuICAgKiAxLiBUaGUgc3Vic2NyaXB0aW9ucyBhcmUgc25hcHNob3R0ZWQganVzdCBiZWZvcmUgZXZlcnkgYGRpc3BhdGNoKClgIGNhbGwuXG4gICAqIElmIHlvdSBzdWJzY3JpYmUgb3IgdW5zdWJzY3JpYmUgd2hpbGUgdGhlIGxpc3RlbmVycyBhcmUgYmVpbmcgaW52b2tlZCwgdGhpc1xuICAgKiB3aWxsIG5vdCBoYXZlIGFueSBlZmZlY3Qgb24gdGhlIGBkaXNwYXRjaCgpYCB0aGF0IGlzIGN1cnJlbnRseSBpbiBwcm9ncmVzcy5cbiAgICogSG93ZXZlciwgdGhlIG5leHQgYGRpc3BhdGNoKClgIGNhbGwsIHdoZXRoZXIgbmVzdGVkIG9yIG5vdCwgd2lsbCB1c2UgYSBtb3JlXG4gICAqIHJlY2VudCBzbmFwc2hvdCBvZiB0aGUgc3Vic2NyaXB0aW9uIGxpc3QuXG4gICAqXG4gICAqIDIuIFRoZSBsaXN0ZW5lciBzaG91bGQgbm90IGV4cGVjdCB0byBzZWUgYWxsIHN0YXRlcyBjaGFuZ2VzLCBhcyB0aGUgc3RhdGVcbiAgICogbWlnaHQgaGF2ZSBiZWVuIHVwZGF0ZWQgbXVsdGlwbGUgdGltZXMgZHVyaW5nIGEgbmVzdGVkIGBkaXNwYXRjaCgpYCBiZWZvcmVcbiAgICogdGhlIGxpc3RlbmVyIGlzIGNhbGxlZC4gSXQgaXMsIGhvd2V2ZXIsIGd1YXJhbnRlZWQgdGhhdCBhbGwgc3Vic2NyaWJlcnNcbiAgICogcmVnaXN0ZXJlZCBiZWZvcmUgdGhlIGBkaXNwYXRjaCgpYCBzdGFydGVkIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGxhdGVzdFxuICAgKiBzdGF0ZSBieSB0aGUgdGltZSBpdCBleGl0cy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgQSBjYWxsYmFjayB0byBiZSBpbnZva2VkIG9uIGV2ZXJ5IGRpc3BhdGNoLlxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoaXMgY2hhbmdlIGxpc3RlbmVyLlxuICAgKi9cbiAgZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBsaXN0ZW5lciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHZhciBpc1N1YnNjcmliZWQgPSB0cnVlO1xuXG4gICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgIG5leHRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gdW5zdWJzY3JpYmUoKSB7XG4gICAgICBpZiAoIWlzU3Vic2NyaWJlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlzU3Vic2NyaWJlZCA9IGZhbHNlO1xuXG4gICAgICBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCk7XG4gICAgICB2YXIgaW5kZXggPSBuZXh0TGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgbmV4dExpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhbiBhY3Rpb24uIEl0IGlzIHRoZSBvbmx5IHdheSB0byB0cmlnZ2VyIGEgc3RhdGUgY2hhbmdlLlxuICAgKlxuICAgKiBUaGUgYHJlZHVjZXJgIGZ1bmN0aW9uLCB1c2VkIHRvIGNyZWF0ZSB0aGUgc3RvcmUsIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlXG4gICAqIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGdpdmVuIGBhY3Rpb25gLiBJdHMgcmV0dXJuIHZhbHVlIHdpbGxcbiAgICogYmUgY29uc2lkZXJlZCB0aGUgKipuZXh0Kiogc3RhdGUgb2YgdGhlIHRyZWUsIGFuZCB0aGUgY2hhbmdlIGxpc3RlbmVyc1xuICAgKiB3aWxsIGJlIG5vdGlmaWVkLlxuICAgKlxuICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvbmx5IHN1cHBvcnRzIHBsYWluIG9iamVjdCBhY3Rpb25zLiBJZiB5b3Ugd2FudCB0b1xuICAgKiBkaXNwYXRjaCBhIFByb21pc2UsIGFuIE9ic2VydmFibGUsIGEgdGh1bmssIG9yIHNvbWV0aGluZyBlbHNlLCB5b3UgbmVlZCB0b1xuICAgKiB3cmFwIHlvdXIgc3RvcmUgY3JlYXRpbmcgZnVuY3Rpb24gaW50byB0aGUgY29ycmVzcG9uZGluZyBtaWRkbGV3YXJlLiBGb3JcbiAgICogZXhhbXBsZSwgc2VlIHRoZSBkb2N1bWVudGF0aW9uIGZvciB0aGUgYHJlZHV4LXRodW5rYCBwYWNrYWdlLiBFdmVuIHRoZVxuICAgKiBtaWRkbGV3YXJlIHdpbGwgZXZlbnR1YWxseSBkaXNwYXRjaCBwbGFpbiBvYmplY3QgYWN0aW9ucyB1c2luZyB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGFjdGlvbiBBIHBsYWluIG9iamVjdCByZXByZXNlbnRpbmcg4oCcd2hhdCBjaGFuZ2Vk4oCdLiBJdCBpc1xuICAgKiBhIGdvb2QgaWRlYSB0byBrZWVwIGFjdGlvbnMgc2VyaWFsaXphYmxlIHNvIHlvdSBjYW4gcmVjb3JkIGFuZCByZXBsYXkgdXNlclxuICAgKiBzZXNzaW9ucywgb3IgdXNlIHRoZSB0aW1lIHRyYXZlbGxpbmcgYHJlZHV4LWRldnRvb2xzYC4gQW4gYWN0aW9uIG11c3QgaGF2ZVxuICAgKiBhIGB0eXBlYCBwcm9wZXJ0eSB3aGljaCBtYXkgbm90IGJlIGB1bmRlZmluZWRgLiBJdCBpcyBhIGdvb2QgaWRlYSB0byB1c2VcbiAgICogc3RyaW5nIGNvbnN0YW50cyBmb3IgYWN0aW9uIHR5cGVzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBGb3IgY29udmVuaWVuY2UsIHRoZSBzYW1lIGFjdGlvbiBvYmplY3QgeW91IGRpc3BhdGNoZWQuXG4gICAqXG4gICAqIE5vdGUgdGhhdCwgaWYgeW91IHVzZSBhIGN1c3RvbSBtaWRkbGV3YXJlLCBpdCBtYXkgd3JhcCBgZGlzcGF0Y2goKWAgdG9cbiAgICogcmV0dXJuIHNvbWV0aGluZyBlbHNlIChmb3IgZXhhbXBsZSwgYSBQcm9taXNlIHlvdSBjYW4gYXdhaXQpLlxuICAgKi9cbiAgZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgaWYgKCEoMCwgX2lzUGxhaW5PYmplY3QyW1wiZGVmYXVsdFwiXSkoYWN0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3Rpb25zIG11c3QgYmUgcGxhaW4gb2JqZWN0cy4gJyArICdVc2UgY3VzdG9tIG1pZGRsZXdhcmUgZm9yIGFzeW5jIGFjdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhY3Rpb24udHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aW9ucyBtYXkgbm90IGhhdmUgYW4gdW5kZWZpbmVkIFwidHlwZVwiIHByb3BlcnR5LiAnICsgJ0hhdmUgeW91IG1pc3NwZWxsZWQgYSBjb25zdGFudD8nKTtcbiAgICB9XG5cbiAgICBpZiAoaXNEaXNwYXRjaGluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VycyBtYXkgbm90IGRpc3BhdGNoIGFjdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGlzRGlzcGF0Y2hpbmcgPSB0cnVlO1xuICAgICAgY3VycmVudFN0YXRlID0gY3VycmVudFJlZHVjZXIoY3VycmVudFN0YXRlLCBhY3Rpb24pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGxpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnMgPSBuZXh0TGlzdGVuZXJzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsaXN0ZW5lcnNbaV0oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSByZWR1Y2VyIGN1cnJlbnRseSB1c2VkIGJ5IHRoZSBzdG9yZSB0byBjYWxjdWxhdGUgdGhlIHN0YXRlLlxuICAgKlxuICAgKiBZb3UgbWlnaHQgbmVlZCB0aGlzIGlmIHlvdXIgYXBwIGltcGxlbWVudHMgY29kZSBzcGxpdHRpbmcgYW5kIHlvdSB3YW50IHRvXG4gICAqIGxvYWQgc29tZSBvZiB0aGUgcmVkdWNlcnMgZHluYW1pY2FsbHkuIFlvdSBtaWdodCBhbHNvIG5lZWQgdGhpcyBpZiB5b3VcbiAgICogaW1wbGVtZW50IGEgaG90IHJlbG9hZGluZyBtZWNoYW5pc20gZm9yIFJlZHV4LlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0UmVkdWNlciBUaGUgcmVkdWNlciBmb3IgdGhlIHN0b3JlIHRvIHVzZSBpbnN0ZWFkLlxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGZ1bmN0aW9uIHJlcGxhY2VSZWR1Y2VyKG5leHRSZWR1Y2VyKSB7XG4gICAgaWYgKHR5cGVvZiBuZXh0UmVkdWNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgbmV4dFJlZHVjZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICBjdXJyZW50UmVkdWNlciA9IG5leHRSZWR1Y2VyO1xuICAgIGRpc3BhdGNoKHsgdHlwZTogQWN0aW9uVHlwZXMuSU5JVCB9KTtcbiAgfVxuXG4gIC8vIFdoZW4gYSBzdG9yZSBpcyBjcmVhdGVkLCBhbiBcIklOSVRcIiBhY3Rpb24gaXMgZGlzcGF0Y2hlZCBzbyB0aGF0IGV2ZXJ5XG4gIC8vIHJlZHVjZXIgcmV0dXJucyB0aGVpciBpbml0aWFsIHN0YXRlLiBUaGlzIGVmZmVjdGl2ZWx5IHBvcHVsYXRlc1xuICAvLyB0aGUgaW5pdGlhbCBzdGF0ZSB0cmVlLlxuICBkaXNwYXRjaCh7IHR5cGU6IEFjdGlvblR5cGVzLklOSVQgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXG4gICAgc3Vic2NyaWJlOiBzdWJzY3JpYmUsXG4gICAgZ2V0U3RhdGU6IGdldFN0YXRlLFxuICAgIHJlcGxhY2VSZWR1Y2VyOiByZXBsYWNlUmVkdWNlclxuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuY29tcG9zZSA9IGV4cG9ydHMuYXBwbHlNaWRkbGV3YXJlID0gZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBleHBvcnRzLmNvbWJpbmVSZWR1Y2VycyA9IGV4cG9ydHMuY3JlYXRlU3RvcmUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfY3JlYXRlU3RvcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlU3RvcmUpO1xuXG52YXIgX2NvbWJpbmVSZWR1Y2VycyA9IHJlcXVpcmUoJy4vY29tYmluZVJlZHVjZXJzJyk7XG5cbnZhciBfY29tYmluZVJlZHVjZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbWJpbmVSZWR1Y2Vycyk7XG5cbnZhciBfYmluZEFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9iaW5kQWN0aW9uQ3JlYXRvcnMnKTtcblxudmFyIF9iaW5kQWN0aW9uQ3JlYXRvcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYmluZEFjdGlvbkNyZWF0b3JzKTtcblxudmFyIF9hcHBseU1pZGRsZXdhcmUgPSByZXF1aXJlKCcuL2FwcGx5TWlkZGxld2FyZScpO1xuXG52YXIgX2FwcGx5TWlkZGxld2FyZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcHBseU1pZGRsZXdhcmUpO1xuXG52YXIgX2NvbXBvc2UgPSByZXF1aXJlKCcuL2NvbXBvc2UnKTtcblxudmFyIF9jb21wb3NlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2UpO1xuXG52YXIgX3dhcm5pbmcgPSByZXF1aXJlKCcuL3V0aWxzL3dhcm5pbmcnKTtcblxudmFyIF93YXJuaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dhcm5pbmcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLypcbiogVGhpcyBpcyBhIGR1bW15IGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBmdW5jdGlvbiBuYW1lIGhhcyBiZWVuIGFsdGVyZWQgYnkgbWluaWZpY2F0aW9uLlxuKiBJZiB0aGUgZnVuY3Rpb24gaGFzIGJlZW4gbWluaWZpZWQgYW5kIE5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsIHdhcm4gdGhlIHVzZXIuXG4qL1xuZnVuY3Rpb24gaXNDcnVzaGVkKCkge31cblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdHlwZW9mIGlzQ3J1c2hlZC5uYW1lID09PSAnc3RyaW5nJyAmJiBpc0NydXNoZWQubmFtZSAhPT0gJ2lzQ3J1c2hlZCcpIHtcbiAgKDAsIF93YXJuaW5nMltcImRlZmF1bHRcIl0pKCdZb3UgYXJlIGN1cnJlbnRseSB1c2luZyBtaW5pZmllZCBjb2RlIG91dHNpZGUgb2YgTk9ERV9FTlYgPT09IFxcJ3Byb2R1Y3Rpb25cXCcuICcgKyAnVGhpcyBtZWFucyB0aGF0IHlvdSBhcmUgcnVubmluZyBhIHNsb3dlciBkZXZlbG9wbWVudCBidWlsZCBvZiBSZWR1eC4gJyArICdZb3UgY2FuIHVzZSBsb29zZS1lbnZpZnkgKGh0dHBzOi8vZ2l0aHViLmNvbS96ZXJ0b3NoL2xvb3NlLWVudmlmeSkgZm9yIGJyb3dzZXJpZnkgJyArICdvciBEZWZpbmVQbHVnaW4gZm9yIHdlYnBhY2sgKGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzAwMzAwMzEpICcgKyAndG8gZW5zdXJlIHlvdSBoYXZlIHRoZSBjb3JyZWN0IGNvZGUgZm9yIHlvdXIgcHJvZHVjdGlvbiBidWlsZC4nKTtcbn1cblxuZXhwb3J0cy5jcmVhdGVTdG9yZSA9IF9jcmVhdGVTdG9yZTJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5jb21iaW5lUmVkdWNlcnMgPSBfY29tYmluZVJlZHVjZXJzMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmJpbmRBY3Rpb25DcmVhdG9ycyA9IF9iaW5kQWN0aW9uQ3JlYXRvcnMyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuYXBwbHlNaWRkbGV3YXJlID0gX2FwcGx5TWlkZGxld2FyZTJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5jb21wb3NlID0gX2NvbXBvc2UyW1wiZGVmYXVsdFwiXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHdhcm5pbmc7XG4vKipcbiAqIFByaW50cyBhIHdhcm5pbmcgaW4gdGhlIGNvbnNvbGUgaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIFRoZSB3YXJuaW5nIG1lc3NhZ2UuXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gd2FybmluZyhtZXNzYWdlKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG4gIHRyeSB7XG4gICAgLy8gVGhpcyBlcnJvciB3YXMgdGhyb3duIGFzIGEgY29udmVuaWVuY2Ugc28gdGhhdCB5b3UgY2FuIHVzZSB0aGlzIHN0YWNrXG4gICAgLy8gdG8gZmluZCB0aGUgY2FsbHNpdGUgdGhhdCBjYXVzZWQgdGhpcyB3YXJuaW5nIHRvIGZpcmUuXG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG4gIH0gY2F0Y2ggKGUpIHt9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cbn0iLCJleHBvcnQgY29uc3QgQUREX01JRElfTk9URVMgPSAnYWRkX21pZGlfbm90ZXMnXG5leHBvcnQgY29uc3QgQUREX01JRElfRVZFTlRTID0gJ2FkZF9taWRpX2V2ZW50cydcbi8vZXhwb3J0IGNvbnN0IEFERF9UUkFDSyA9ICdhZGRfdHJhY2snXG4vL2V4cG9ydCBjb25zdCBBRERfUEFSVCA9ICdhZGRfcGFydCdcblxuZXhwb3J0IGNvbnN0IENSRUFURV9UUkFDSyA9ICdjcmVhdGVfdHJhY2snXG5leHBvcnQgY29uc3QgQUREX1BBUlRTID0gJ2FkZF9wYXJ0cydcbmV4cG9ydCBjb25zdCBBRERfVFJBQ0tTID0gJ2FkZF90cmFja3MnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfUEFSVCA9ICdjcmVhdGVfcGFydCdcbmV4cG9ydCBjb25zdCBBRERfVElNRV9FVkVOVFMgPSAnYWRkX3RpbWVfZXZlbnRzJ1xuXG5leHBvcnQgY29uc3QgQ1JFQVRFX1NPTkcgPSAnY3JlYXRlX3NvbmcnXG5leHBvcnQgY29uc3QgQUREX01JRElfRVZFTlRTX1RPX1NPTkcgPSAnYWRkX21pZGlfZXZlbnRzX3RvX3NvbmcnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfTUlESV9FVkVOVCA9ICdjcmVhdGVfbWlkaV9ldmVudCdcbmV4cG9ydCBjb25zdCBDUkVBVEVfTUlESV9OT1RFID0gJ2NyZWF0ZV9taWRpX25vdGUnXG5leHBvcnQgY29uc3QgQUREX0VWRU5UU19UT19TT05HID0gJ2FkZF9ldmVudHNfdG9fc29uZydcbmV4cG9ydCBjb25zdCBVUERBVEVfTUlESV9FVkVOVCA9ICd1cGRhdGVfbWlkaV9ldmVudCdcbmV4cG9ydCBjb25zdCBVUERBVEVfTUlESV9OT1RFID0gJ3VwZGF0ZV9taWRpX25vdGUnXG5cbmV4cG9ydCBjb25zdCBVUERBVEVfU09ORyA9ICd1cGRhdGVfc29uZydcblxuXG4iLCJpbXBvcnQge2NyZWF0ZVN0b3JlLCBhcHBseU1pZGRsZXdhcmUsIGNvbXBvc2V9IGZyb20gJ3JlZHV4J1xuaW1wb3J0IHRodW5rIGZyb20gJ3JlZHV4LXRodW5rJztcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAncmVkdXgtbG9nZ2VyJztcbmltcG9ydCBzZXF1ZW5jZXJBcHAgZnJvbSAnLi9yZWR1Y2VyJ1xuXG5jb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoKTtcbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoc2VxdWVuY2VyQXBwLCB7fSwgY29tcG9zZShcbiAgLy9hcHBseU1pZGRsZXdhcmUobG9nZ2VyKSxcbiAgdHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHdpbmRvdy5kZXZUb29sc0V4dGVuc2lvbiAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZGV2VG9vbHNFeHRlbnNpb24oKSA6IGYgPT4gZlxuKSk7XG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RvcmUoKXtcbiAgcmV0dXJuIHN0b3JlXG59XG5cblxuIiwiXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW8uanMnO1xuXG5sZXQgdGltZWRUYXNrcyA9IG5ldyBNYXAoKTtcbmxldCByZXBldGl0aXZlVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgc2NoZWR1bGVkVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgdGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgbGFzdFRpbWVTdGFtcDtcblxuZnVuY3Rpb24gaGVhcnRiZWF0KHRpbWVzdGFtcCl7XG4gIGxldCBub3cgPSBjb250ZXh0LnRpbWU7XG5cbiAgLy8gZm9yIGluc3RhbmNlOiB0aGUgY2FsbGJhY2sgb2Ygc2FtcGxlLnVuc2NoZWR1bGU7XG4gIGZvcihsZXQgW2tleSwgdGFza10gb2YgdGltZWRUYXNrcyl7XG4gICAgaWYodGFzay50aW1lID49IG5vdyl7XG4gICAgICB0YXNrLmV4ZWN1dGUobm93KTtcbiAgICAgIHRpbWVkVGFza3MuZGVsZXRlKGtleSk7XG4gICAgfVxuICB9XG5cblxuICAvLyBmb3IgaW5zdGFuY2U6IHNvbmcudXBkYXRlKCk7XG4gIGZvcihsZXQgdGFzayBvZiBzY2hlZHVsZWRUYXNrcy52YWx1ZXMoKSl7XG4gICAgdGFzayhub3cpO1xuICB9XG5cbiAgLy8gZm9yIGluc3RhbmNlOiBzb25nLnB1bHNlKCk7XG4gIGZvcihsZXQgdGFzayBvZiByZXBldGl0aXZlVGFza3MudmFsdWVzKCkpe1xuICAgIHRhc2sobm93KTtcbiAgfVxuXG4gIGxhc3RUaW1lU3RhbXAgPSB0aW1lc3RhbXA7XG4gIHNjaGVkdWxlZFRhc2tzLmNsZWFyKCk7XG5cbiAgLy9zZXRUaW1lb3V0KGhlYXJ0YmVhdCwgMTAwKTtcbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShoZWFydGJlYXQpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUYXNrKHR5cGUsIGlkLCB0YXNrKXtcbiAgbGV0IG1hcCA9IHRhc2tzLmdldCh0eXBlKTtcbiAgbWFwLnNldChpZCwgdGFzayk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVUYXNrKHR5cGUsIGlkKXtcbiAgbGV0IG1hcCA9IHRhc2tzLmdldCh0eXBlKTtcbiAgbWFwLmRlbGV0ZShpZCk7XG59XG5cbihmdW5jdGlvbiBzdGFydCgpe1xuICB0YXNrcy5zZXQoJ3RpbWVkJywgdGltZWRUYXNrcyk7XG4gIHRhc2tzLnNldCgncmVwZXRpdGl2ZScsIHJlcGV0aXRpdmVUYXNrcyk7XG4gIHRhc2tzLnNldCgnc2NoZWR1bGVkJywgc2NoZWR1bGVkVGFza3MpO1xuICBoZWFydGJlYXQoKTtcbn0oKSlcbiIsIlxuXG5jb25zdCBjb250ZXh0ID0gbmV3IHdpbmRvdy5BdWRpb0NvbnRleHQoKVxuXG5leHBvcnQge2NvbnRleHR9XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7dXBkYXRlTUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX01JRElfRVZFTlQsXG4gIFVQREFURV9NSURJX0VWRU5ULFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpXG5sZXQgbWlkaUV2ZW50SW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNSURJRXZlbnQodGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyID0gLTEpe1xuICBsZXQgaWQgPSBgTUVfJHttaWRpRXZlbnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IENSRUFURV9NSURJX0VWRU5ULFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgdGlja3MsXG4gICAgICB0eXBlLFxuICAgICAgZGF0YTEsXG4gICAgICBkYXRhMixcbiAgICAgIHNvcnRJbmRleDogdGlja3MgKyB0eXBlXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1JRElFdmVudElkKCl7XG4gIHJldHVybiBgTUVfJHttaWRpRXZlbnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVNSURJRXZlbnQoaWQ6IHN0cmluZywgdGlja3NfdG9fbW92ZTogbnVtYmVyKXtcbiAgbGV0IHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKS5zZXF1ZW5jZXJcbiAgbGV0IGV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tpZF1cbiAgbGV0IHRpY2tzID0gZXZlbnQudGlja3MgKyB0aWNrc190b19tb3ZlXG4gIHRpY2tzID0gdGlja3MgPCAwID8gMCA6IHRpY2tzXG4gIC8vY29uc29sZS5sb2codGlja3MsIGV2ZW50LnRpY2tzKVxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogVVBEQVRFX01JRElfRVZFTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aWNrcyxcbiAgICAgIHNvcnRJbmRleDogdGlja3MgKyBldmVudC50eXBlXG4gICAgfVxuICB9KVxuICAvLyBpZiB0aGUgZXZlbnQgaXMgcGFydCBvZiBhIG1pZGkgbm90ZSwgdXBkYXRlIGl0XG4gIGxldCBub3RlX2lkID0gZXZlbnQubm90ZVxuICBpZihub3RlX2lkKXtcbiAgICB1cGRhdGVNSURJTm90ZShub3RlX2lkLCBzdGF0ZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZU1JRElFdmVudFRvKGlkOiBzdHJpbmcsIHRpY2tzOiBudW1iZXIpe1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLnNlcXVlbmNlclxuICBsZXQgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2lkXVxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogVVBEQVRFX01JRElfRVZFTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aWNrcyxcbiAgICAgIHNvcnRJbmRleDogdGlja3MgKyBldmVudC50eXBlXG4gICAgfVxuICB9KVxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb25zb2xlLmVycm9yKCdldmVudCBpcyB1bmRlZmluZWQnKSAvL3RoaXMgc2hvdWxkJ3QgaGFwcGVuIVxuICB9XG4gIC8vIGlmIHRoZSBldmVudCBpcyBwYXJ0IG9mIGEgbWlkaSBub3RlLCB1cGRhdGUgaXRcbiAgbGV0IG5vdGVfaWQgPSBldmVudC5ub3RlXG4gIGlmKG5vdGVfaWQpe1xuICAgIHVwZGF0ZU1JRElOb3RlKG5vdGVfaWQsIHN0YXRlKVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7XG4gIFVQREFURV9NSURJX05PVEUsXG4gIENSRUFURV9NSURJX05PVEUsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBtaWRpTm90ZUluZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlTUlESU5vdGUoaWQsIHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKSl7XG4gIGxldCBub3RlID0gc3RhdGUubWlkaU5vdGVzW2lkXVxuICBsZXQgZXZlbnRzID0gc3RhdGUubWlkaUV2ZW50c1xuICBsZXQgc3RhcnQgPSBldmVudHNbbm90ZS5ub3Rlb25dXG4gIGxldCBlbmQgPSBldmVudHNbbm90ZS5ub3Rlb2ZmXVxuXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBVUERBVEVfTUlESV9OT1RFLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgc3RhcnQ6IHN0YXJ0LnRpY2tzLFxuICAgICAgZW5kOiBlbmQudGlja3MsXG4gICAgICBkdXJhdGlvblRpY2tzOiBlbmQudGlja3MgLSBzdGFydC50aWNrc1xuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1JRElOb3RlKG5vdGVvbjogc3RyaW5nLCBub3Rlb2ZmOiBzdHJpbmcpe1xuICBsZXQgZXZlbnRzID0gc3RvcmUuZ2V0U3RhdGUoKS5zZXF1ZW5jZXIubWlkaUV2ZW50c1xuICBsZXQgb24gPSBldmVudHNbbm90ZW9uXVxuICBsZXQgb2ZmID0gZXZlbnRzW25vdGVvZmZdXG4gIGlmKG9uLmRhdGExICE9PSBvZmYuZGF0YTEpe1xuICAgIGNvbnNvbGUuZXJyb3IoJ2NhblxcJ3QgY3JlYXRlIE1JREkgbm90ZTogZXZlbnRzIG11c3QgaGF2ZSB0aGUgc2FtZSBkYXRhMSB2YWx1ZSwgaS5lLiB0aGUgc2FtZSBwaXRjaCcpXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgbGV0IGlkID0gYE1OXyR7bWlkaU5vdGVJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IENSRUFURV9NSURJX05PVEUsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBub3Rlb24sXG4gICAgICBub3Rlb2ZmLFxuICAgICAgc3RhcnQ6IG9uLnRpY2tzLFxuICAgICAgZW5kOiBvZmYudGlja3MsXG4gICAgICBkdXJhdGlvblRpY2tzOiBvZmYudGlja3MgLSBvbi50aWNrc1xuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7Z2V0TmljZVRpbWV9IGZyb20gJy4vdXRpbCc7XG5cbmxldFxuICBwcHEsXG4gIGJwbSxcbiAgZmFjdG9yLFxuICBub21pbmF0b3IsXG4gIGRlbm9taW5hdG9yLFxuICBwbGF5YmFja1NwZWVkLFxuXG4gIGJhcixcbiAgYmVhdCxcbiAgc2l4dGVlbnRoLFxuICB0aWNrLFxuICB0aWNrcyxcbiAgbWlsbGlzLFxuXG4gIG1pbGxpc1BlclRpY2ssXG4gIHNlY29uZHNQZXJUaWNrLFxuXG4gIHRpY2tzUGVyQmVhdCxcbiAgdGlja3NQZXJCYXIsXG4gIHRpY2tzUGVyU2l4dGVlbnRoLFxuICBudW1TaXh0ZWVudGgsXG5cbiAgZGlmZlRpY2tzO1xuXG5cbmZ1bmN0aW9uIHNldFRpY2tEdXJhdGlvbigpe1xuICBzZWNvbmRzUGVyVGljayA9ICgxIC8gcGxheWJhY2tTcGVlZCAqIDYwKSAvIGJwbSAvIHBwcTtcbiAgbWlsbGlzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrICogMTAwMDtcbiAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLCBicG0sIHBwcSwgcGxheWJhY2tTcGVlZCwgKHBwcSAqIG1pbGxpc1BlclRpY2spKTtcbiAgLy9jb25zb2xlLmxvZyhwcHEpO1xufVxuXG5cbmZ1bmN0aW9uIHNldFRpY2tzUGVyQmVhdCgpe1xuICBmYWN0b3IgPSAoNCAvIGRlbm9taW5hdG9yKTtcbiAgbnVtU2l4dGVlbnRoID0gZmFjdG9yICogNDtcbiAgdGlja3NQZXJCZWF0ID0gcHBxICogZmFjdG9yO1xuICB0aWNrc1BlckJhciA9IHRpY2tzUGVyQmVhdCAqIG5vbWluYXRvcjtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBwcHEgLyA0O1xuICAvL2NvbnNvbGUubG9nKGRlbm9taW5hdG9yLCBmYWN0b3IsIG51bVNpeHRlZW50aCwgdGlja3NQZXJCZWF0LCB0aWNrc1BlckJhciwgdGlja3NQZXJTaXh0ZWVudGgpO1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZVBvc2l0aW9uKGV2ZW50KXtcbiAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgdGljayArPSBkaWZmVGlja3M7XG4gIHRpY2tzID0gZXZlbnQudGlja3M7XG4gIC8vY29uc29sZS5sb2coZGlmZlRpY2tzLCBtaWxsaXNQZXJUaWNrKTtcbiAgbWlsbGlzICs9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG5cbiAgd2hpbGUodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgc2l4dGVlbnRoKys7XG4gICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgIGJlYXQrKztcbiAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgYmFyKys7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGltZUV2ZW50cyhzZXR0aW5ncywgdGltZUV2ZW50cyl7XG4gIC8vY29uc29sZS50aW1lKCdwYXJzZSB0aW1lIGV2ZW50cyAnICsgc29uZy5uYW1lKTtcbiAgbGV0IHR5cGU7XG4gIGxldCBldmVudDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuXG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICAvL2V2ZW50LnNvbmcgPSBzb25nO1xuICAgIHR5cGUgPSBldmVudC50eXBlO1xuICAgIHVwZGF0ZVBvc2l0aW9uKGV2ZW50KTtcblxuICAgIHN3aXRjaCh0eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgc2V0VGlja0R1cmF0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBzZXRUaWNrc1BlckJlYXQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICB1cGRhdGVFdmVudChldmVudCk7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXJzQXNTdHJpbmcpO1xuICB9XG5cbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xuICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgLy9jb25zb2xlLmxvZyh0aW1lRXZlbnRzKTtcbn1cblxuXG4vL2V4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhzb25nLCBldmVudHMpe1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKGV2ZW50cyl7XG4gIGxldCBldmVudDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG4gIGxldCByZXN1bHQgPSBbXVxuXG4gIC8vbGV0IGV2ZW50cyA9IFtdLmNvbmNhdChldnRzLCBzb25nLl90aW1lRXZlbnRzKTtcbiAgbGV0IG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGg7XG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gYS5fc29ydEluZGV4IC0gYi5fc29ydEluZGV4O1xuICB9KTtcbiAgZXZlbnQgPSBldmVudHNbMF07XG5cbiAgYnBtID0gZXZlbnQuYnBtO1xuICBmYWN0b3IgPSBldmVudC5mYWN0b3I7XG4gIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcblxuICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuXG4gIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICBiYXIgPSBldmVudC5iYXI7XG4gIGJlYXQgPSBldmVudC5iZWF0O1xuICBzaXh0ZWVudGggPSBldmVudC5zaXh0ZWVudGg7XG4gIHRpY2sgPSBldmVudC50aWNrO1xuXG5cbiAgZm9yKGxldCBpID0gc3RhcnRFdmVudDsgaSA8IG51bUV2ZW50czsgaSsrKXtcblxuICAgIGV2ZW50ID0gZXZlbnRzW2ldO1xuICAgIC8vY29uc29sZS5sb2coZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG5cbiAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcbiAgICAgICAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gICAgICAgIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG4gICAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljayxldmVudC5taWxsaXNQZXJUaWNrKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgICAgICAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICAgICAgICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG4gICAgICAgIC8vY29uc29sZS5sb2cobm9taW5hdG9yLG51bVNpeHRlZW50aCx0aWNrc1BlclNpeHRlZW50aCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQpO1xuICAgICAgICB1cGRhdGVFdmVudChldmVudCk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgIH1cblxuICAgIGxhc3RFdmVudFRpY2sgPSBldmVudC50aWNrcztcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnQoZXZlbnQpe1xuICAvL2NvbnNvbGUubG9nKGJhciwgYmVhdCwgdGlja3MpXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuXG4gIGV2ZW50LnRpY2tzID0gdGlja3M7XG5cbiAgZXZlbnQubWlsbGlzID0gbWlsbGlzO1xuICBldmVudC5zZWNvbmRzID0gbWlsbGlzIC8gMTAwMDtcblxuXG4gIGV2ZW50LmJhciA9IGJhcjtcbiAgZXZlbnQuYmVhdCA9IGJlYXQ7XG4gIGV2ZW50LnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgZXZlbnQudGljayA9IHRpY2s7XG4gIC8vZXZlbnQuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2s7XG4gIHZhciB0aWNrQXNTdHJpbmcgPSB0aWNrID09PSAwID8gJzAwMCcgOiB0aWNrIDwgMTAgPyAnMDAnICsgdGljayA6IHRpY2sgPCAxMDAgPyAnMCcgKyB0aWNrIDogdGljaztcbiAgZXZlbnQuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIHRpY2tBc1N0cmluZztcbiAgZXZlbnQuYmFyc0FzQXJyYXkgPSBbYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tdO1xuXG5cbiAgdmFyIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcblxuICBldmVudC5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgZXZlbnQubWludXRlID0gdGltZURhdGEubWludXRlO1xuICBldmVudC5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gIGV2ZW50Lm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gIGV2ZW50LnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgZXZlbnQudGltZUFzQXJyYXkgPSB0aW1lRGF0YS50aW1lQXNBcnJheTtcbn1cbiIsImltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX1BBUlQsXG4gIEFERF9NSURJX0VWRU5UUyxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IHBhcnRJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhcnQoXG4gIHNldHRpbmdzOiB7XG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHRyYWNrSWQ6IHN0cmluZyxcbiAgICBtaWRpRXZlbnRJZHM6QXJyYXk8c3RyaW5nPixcbiAgICBtaWRpTm90ZUlkczpBcnJheTxzdHJpbmc+LFxuICB9ID0ge31cbil7XG4gIGxldCBpZCA9IGBNUF8ke3BhcnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHtcbiAgICBuYW1lID0gaWQsXG4gICAgbWlkaUV2ZW50SWRzID0gW10sXG4gICAgbWlkaU5vdGVJZHMgPSBbXSxcbiAgICB0cmFja0lkID0gJ25vbmUnXG4gIH0gPSBzZXR0aW5nc1xuXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfUEFSVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5hbWUsXG4gICAgICBtaWRpRXZlbnRJZHMsXG4gICAgICBtaWRpTm90ZUlkcyxcbiAgICAgIHRyYWNrSWRcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkTUlESUV2ZW50cyhwYXJ0X2lkOiBzdHJpbmcsIC4uLm1pZGlfZXZlbnRfaWRzOiBzdHJpbmcpe1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHBhcnRfaWQsXG4gICAgICBtaWRpX2V2ZW50X2lkc1xuICAgIH1cbiAgfSlcbn1cbiIsImltcG9ydCB7XG4gIGNyZWF0ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudFRvLFxufSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnR7XG4gIGNyZWF0ZU1JRElOb3RlLFxufSBmcm9tICcuL21pZGlfbm90ZSdcbmltcG9ydHtcbiAgY3JlYXRlU29uZyxcbiAgYWRkVHJhY2tzLFxuICB1cGRhdGVTb25nLFxuICBzdGFydFNvbmcsXG4gIHN0b3BTb25nLFxufSBmcm9tICcuL3NvbmcnXG5pbXBvcnR7XG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcbn0gZnJvbSAnLi90cmFjaydcbmltcG9ydHtcbiAgY3JlYXRlUGFydCxcbiAgYWRkTUlESUV2ZW50cyxcbn0gZnJvbSAnLi9wYXJ0J1xuXG5jb25zdCBxYW1iaSA9IHtcbiAgdmVyc2lvbjogJzAuMC4xJyxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIGNyZWF0ZU1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgY3JlYXRlVHJhY2ssXG4gIGFkZFBhcnRzLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIGNyZWF0ZVBhcnQsXG4gIGFkZE1JRElFdmVudHMsXG5cbiAgbG9nOiBmdW5jdGlvbihpZCl7XG4gICAgaWYoaWQgPT09ICdmdW5jdGlvbnMnKXtcbiAgICAgIGNvbnNvbGUubG9nKGBmdW5jdGlvbnM6XG4gICAgICAgIGNyZWF0ZU1JRElFdmVudFxuICAgICAgICBtb3ZlTUlESUV2ZW50XG4gICAgICAgIG1vdmVNSURJRXZlbnRUb1xuICAgICAgICBjcmVhdGVNSURJTm90ZVxuICAgICAgICBjcmVhdGVTb25nXG4gICAgICAgIGFkZFRyYWNrc1xuICAgICAgICBjcmVhdGVUcmFja1xuICAgICAgICBhZGRQYXJ0c1xuICAgICAgICBjcmVhdGVQYXJ0XG4gICAgICAgIGFkZE1JRElFdmVudHNcbiAgICAgIGApXG4gICAgfVxuICB9XG59XG5cbi8vIHN0YW5kYXJkIE1JREkgZXZlbnRzXG5jb25zdCBNSURJID0ge31cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnTk9URV9PRkYnLCB7dmFsdWU6IDB4ODB9KTsgLy8xMjhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnTk9URV9PTicsIHt2YWx1ZTogMHg5MH0pOyAvLzE0NFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdQT0xZX1BSRVNTVVJFJywge3ZhbHVlOiAweEEwfSk7IC8vMTYwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ0NPTlRST0xfQ0hBTkdFJywge3ZhbHVlOiAweEIwfSk7IC8vMTc2XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ1BST0dSQU1fQ0hBTkdFJywge3ZhbHVlOiAweEMwfSk7IC8vMTkyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ0NIQU5ORUxfUFJFU1NVUkUnLCB7dmFsdWU6IDB4RDB9KTsgLy8yMDhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnUElUQ0hfQkVORCcsIHt2YWx1ZTogMHhFMH0pOyAvLzIyNFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdTWVNURU1fRVhDTFVTSVZFJywge3ZhbHVlOiAweEYwfSk7IC8vMjQwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ01JRElfVElNRUNPREUnLCB7dmFsdWU6IDI0MX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdTT05HX1BPU0lUSU9OJywge3ZhbHVlOiAyNDJ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnU09OR19TRUxFQ1QnLCB7dmFsdWU6IDI0M30pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdUVU5FX1JFUVVFU1QnLCB7dmFsdWU6IDI0Nn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdFT1gnLCB7dmFsdWU6IDI0N30pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdUSU1JTkdfQ0xPQ0snLCB7dmFsdWU6IDI0OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1JREksICdTVEFSVCcsIHt2YWx1ZTogMjUwfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ0NPTlRJTlVFJywge3ZhbHVlOiAyNTF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnU1RPUCcsIHt2YWx1ZTogMjUyfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ0FDVElWRV9TRU5TSU5HJywge3ZhbHVlOiAyNTR9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNSURJLCAnU1lTVEVNX1JFU0VUJywge3ZhbHVlOiAyNTV9KTtcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ1RFTVBPJywge3ZhbHVlOiAweDUxfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ1RJTUVfU0lHTkFUVVJFJywge3ZhbHVlOiAweDU4fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTUlESSwgJ0VORF9PRl9UUkFDSycsIHt2YWx1ZTogMHgyRn0pO1xuXG5leHBvcnQgZGVmYXVsdCBxYW1iaVxuXG5leHBvcnQge1xuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIGNyZWF0ZU1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgY3JlYXRlVHJhY2ssXG4gIGFkZFBhcnRzLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIGNyZWF0ZVBhcnQsXG4gIGFkZE1JRElFdmVudHMsXG5cbiAgTUlESSxcbn1cbiIsImltcG9ydCB7Y29tYmluZVJlZHVjZXJzfSBmcm9tICdyZWR1eCdcbmltcG9ydCB7XG4gIENSRUFURV9TT05HLFxuICBDUkVBVEVfVFJBQ0ssXG4gIENSRUFURV9QQVJULFxuICBBRERfUEFSVFMsXG4gIEFERF9UUkFDS1MsXG4gIEFERF9NSURJX05PVEVTLFxuICBBRERfTUlESV9FVkVOVFMsXG4gIEFERF9USU1FX0VWRU5UUyxcbiAgQ1JFQVRFX01JRElfRVZFTlQsXG4gIENSRUFURV9NSURJX05PVEUsXG4gIEFERF9FVkVOVFNfVE9fU09ORyxcbiAgVVBEQVRFX01JRElfRVZFTlQsXG4gIFVQREFURV9NSURJX05PVEUsXG4gIFVQREFURV9TT05HLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3QgaW5pdGlhbFN0YXRlID0ge1xuICBzb25nczoge30sXG4gIHRyYWNrczoge30sXG4gIHBhcnRzOiB7fSxcbiAgbWlkaUV2ZW50czoge30sXG4gIG1pZGlOb3Rlczoge30sXG59XG5cblxuZnVuY3Rpb24gc2VxdWVuY2VyKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pe1xuXG4gIGxldFxuICAgIGV2ZW50LCBldmVudElkLFxuICAgIHNvbmcsIHNvbmdJZCxcbiAgICBtaWRpRXZlbnRzXG5cbiAgc3dpdGNoKGFjdGlvbi50eXBlKXtcblxuICAgIGNhc2UgQ1JFQVRFX1NPTkc6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIENSRUFURV9UUkFDSzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUudHJhY2tzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIENSRUFURV9QQVJUOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5wYXJ0c1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfTUlESV9FVkVOVDpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUubWlkaUV2ZW50c1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfTUlESV9OT1RFOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5taWRpTm90ZXNbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQUREX1RSQUNLUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc29uZ0lkID0gYWN0aW9uLnBheWxvYWQuc29uZ19pZFxuICAgICAgc29uZyA9IHN0YXRlLnNvbmdzW3NvbmdJZF1cbiAgICAgIGlmKHNvbmcpe1xuICAgICAgICBsZXQgdHJhY2tJZHMgPSBhY3Rpb24ucGF5bG9hZC50cmFja19pZHNcbiAgICAgICAgdHJhY2tJZHMuZm9yRWFjaChmdW5jdGlvbih0cmFja0lkKXtcbiAgICAgICAgICBsZXQgdHJhY2sgPSBzdGF0ZS50cmFja3NbdHJhY2tJZF1cbiAgICAgICAgICBpZih0cmFjayl7XG4gICAgICAgICAgICBzb25nLnRyYWNrSWRzLnB1c2godHJhY2tJZClcbiAgICAgICAgICAgIHRyYWNrLnNvbmdJZCA9IHNvbmdJZFxuICAgICAgICAgICAgbGV0IG1pZGlFdmVudElkcyA9IFtdXG4gICAgICAgICAgICB0cmFjay5wYXJ0SWRzLmZvckVhY2goZnVuY3Rpb24ocGFydElkKXtcbiAgICAgICAgICAgICAgbGV0IHBhcnQgPSBzdGF0ZS5wYXJ0c1twYXJ0SWRdXG4gICAgICAgICAgICAgIHNvbmcucGFydElkcy5wdXNoKHBhcnRJZClcbiAgICAgICAgICAgICAgbWlkaUV2ZW50SWRzLnB1c2goLi4ucGFydC5taWRpRXZlbnRJZHMpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgc29uZy5taWRpRXZlbnRJZHMucHVzaCguLi5taWRpRXZlbnRJZHMpXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIHRyYWNrIHdpdGggaWQgJHt0cmFja0lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gc29uZyBmb3VuZCB3aXRoIGlkICR7c29uZ0lkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIEFERF9QQVJUUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgbGV0IHRyYWNrSWQgPSBhY3Rpb24ucGF5bG9hZC50cmFja19pZFxuICAgICAgbGV0IHRyYWNrID0gc3RhdGUudHJhY2tzW3RyYWNrSWRdXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIC8vdHJhY2sucGFydHMucHVzaCguLi5hY3Rpb24ucGF5bG9hZC5wYXJ0X2lkcylcbiAgICAgICAgbGV0IHBhcnRJZHMgPSBhY3Rpb24ucGF5bG9hZC5wYXJ0X2lkc1xuICAgICAgICBwYXJ0SWRzLmZvckVhY2goZnVuY3Rpb24oaWQpe1xuICAgICAgICAgIGxldCBwYXJ0ID0gc3RhdGUucGFydHNbaWRdXG4gICAgICAgICAgaWYocGFydCl7XG4gICAgICAgICAgICB0cmFjay5wYXJ0SWRzLnB1c2goaWQpXG4gICAgICAgICAgICBwYXJ0LnRyYWNrSWQgPSB0cmFja0lkXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIHBhcnQgd2l0aCBpZCAke2lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gdHJhY2sgZm91bmQgd2l0aCBpZCAke3RyYWNrSWR9YClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQUREX01JRElfRVZFTlRTOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBsZXQgcGFydElkID0gYWN0aW9uLnBheWxvYWQucGFydF9pZFxuICAgICAgbGV0IHBhcnQgPSBzdGF0ZS5wYXJ0c1twYXJ0SWRdXG4gICAgICBpZihwYXJ0KXtcbiAgICAgICAgLy9wYXJ0Lm1pZGlFdmVudHMucHVzaCguLi5hY3Rpb24ucGF5bG9hZC5taWRpX2V2ZW50X2lkcylcbiAgICAgICAgbGV0IG1pZGlFdmVudElkcyA9IGFjdGlvbi5wYXlsb2FkLm1pZGlfZXZlbnRfaWRzXG4gICAgICAgIG1pZGlFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICBsZXQgbWlkaUV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tpZF1cbiAgICAgICAgICBpZihtaWRpRXZlbnQpe1xuICAgICAgICAgICAgcGFydC5taWRpRXZlbnRJZHMucHVzaChpZClcbiAgICAgICAgICAgIG1pZGlFdmVudC5wYXJ0SWQgPSBwYXJ0SWRcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgbm8gTUlESSBldmVudCBmb3VuZCB3aXRoIGlkICR7aWR9YClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS53YXJuKGBubyBwYXJ0IGZvdW5kIHdpdGggaWQgJHtwYXJ0SWR9YClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgVVBEQVRFX01JRElfRVZFTlQ6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGV2ZW50SWQgPSBhY3Rpb24ucGF5bG9hZC5pZFxuICAgICAgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2V2ZW50SWRdO1xuICAgICAgaWYoZXZlbnQpe1xuICAgICAgICAoe1xuICAgICAgICAgIHRpY2tzOiBldmVudC50aWNrcyA9IGV2ZW50LnRpY2tzLFxuICAgICAgICAgIGRhdGExOiBldmVudC5kYXRhMSA9IGV2ZW50LmRhdGExLFxuICAgICAgICAgIGRhdGEyOiBldmVudC5kYXRhMiA9IGV2ZW50LmRhdGEyLFxuICAgICAgICB9ID0gYWN0aW9uLnBheWxvYWQpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS53YXJuKGBubyBNSURJIGV2ZW50IGZvdW5kIHdpdGggaWQgJHtldmVudElkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9NSURJX05PVEU6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGxldCBub3RlID0gc3RhdGUubWlkaU5vdGVzW2FjdGlvbi5wYXlsb2FkLmlkXTtcbiAgICAgICh7XG4gICAgICAgIC8vIGlmIHRoZSBwYXlsb2FkIGhhcyBhIHZhbHVlIGZvciAnc3RhcnQnIGl0IHdpbGwgYmUgYXNzaWduZWQgdG8gbm90ZS5zdGFydCwgb3RoZXJ3aXNlIG5vdGUuc3RhcnQgd2lsbCBrZWVwIGl0cyBjdXJyZW50IHZhbHVlXG4gICAgICAgIHN0YXJ0OiBub3RlLnN0YXJ0ID0gbm90ZS5zdGFydCxcbiAgICAgICAgZW5kOiBub3RlLmVuZCA9IG5vdGUuZW5kLFxuICAgICAgICBkdXJhdGlvblRpY2tzOiBub3RlLmR1cmF0aW9uVGlja3MgPSBub3RlLmR1cmF0aW9uVGlja3NcbiAgICAgIH0gPSBhY3Rpb24ucGF5bG9hZClcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgVVBEQVRFX1NPTkc6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX07XG4gICAgICAoe3NvbmdfaWQ6IHNvbmdJZCwgbWlkaV9ldmVudHM6IG1pZGlFdmVudHN9ID0gYWN0aW9uLnBheWxvYWQpXG4gICAgICBzb25nID0gc3RhdGUuc29uZ3Nbc29uZ0lkXVxuICAgICAgc29uZy5taWRpRXZlbnRJZHMgPSBbXVxuICAgICAgbWlkaUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgc29uZy5taWRpRXZlbnRJZHMucHVzaChldmVudC5pZClcbiAgICAgICAgc3RhdGUubWlkaUV2ZW50c1tldmVudC5pZF0gPSBldmVudFxuICAgICAgfSlcbiAgICAgIGJyZWFrXG5cblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBkbyBub3RoaW5nXG4gIH1cbiAgcmV0dXJuIHN0YXRlXG59XG5cblxuY29uc3Qgc2VxdWVuY2VyQXBwID0gY29tYmluZVJlZHVjZXJzKHtcbiAgc2VxdWVuY2VyLFxufSlcblxuXG5leHBvcnQgZGVmYXVsdCBzZXF1ZW5jZXJBcHBcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtwYXJzZVRpbWVFdmVudHMsIHBhcnNlRXZlbnRzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbmltcG9ydCB7Z2V0TUlESUV2ZW50SWR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7YWRkVGFzaywgcmVtb3ZlVGFza30gZnJvbSAnLi9oZWFydGJlYXQnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW8nXG5pbXBvcnQge1xuICBDUkVBVEVfU09ORyxcbiAgQUREX1RSQUNLUyxcbiAgVVBEQVRFX1NPTkcsXG4gIEFERF9NSURJX0VWRU5UU19UT19TT05HLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcbmltcG9ydCB7TUlESX0gZnJvbSAnLi9xYW1iaSdcblxuY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpXG5sZXQgc29uZ0luZGV4ID0gMFxuXG5jb25zdCBkZWZhdWx0U29uZyA9IHtcbiAgcHBxOiA5NjAsXG4gIGJwbTogMTIwLFxuICBiYXJzOiAzMCxcbiAgbG93ZXN0Tm90ZTogMCxcbiAgaGlnaGVzdE5vdGU6IDEyNyxcbiAgbm9taW5hdG9yOiA0LFxuICBkZW5vbWluYXRvcjogNCxcbiAgcXVhbnRpemVWYWx1ZTogOCxcbiAgZml4ZWRMZW5ndGhWYWx1ZTogZmFsc2UsXG4gIHBvc2l0aW9uVHlwZTogJ2FsbCcsXG4gIHVzZU1ldHJvbm9tZTogZmFsc2UsXG4gIGF1dG9TaXplOiB0cnVlLFxuICBsb29wOiBmYWxzZSxcbiAgcGxheWJhY2tTcGVlZDogMSxcbiAgYXV0b1F1YW50aXplOiBmYWxzZVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTb25nKHNldHRpbmdzKXtcbiAgbGV0IGlkID0gYFNfJHtzb25nSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIGxldCBzID0ge307XG4gICh7XG4gICAgbmFtZTogcy5uYW1lID0gaWQsXG4gICAgcHBxOiBzLnBwcSA9IGRlZmF1bHRTb25nLnBwcSxcbiAgICBicG06IHMuYnBtID0gZGVmYXVsdFNvbmcuYnBtLFxuICAgIGJhcnM6IHMuYmFycyA9IGRlZmF1bHRTb25nLmJhcnMsXG4gICAgbG93ZXN0Tm90ZTogcy5sb3dlc3ROb3RlID0gZGVmYXVsdFNvbmcubG93ZXN0Tm90ZSxcbiAgICBoaWdoZXN0Tm90ZTogcy5oaWdoZXN0Tm90ZSA9IGRlZmF1bHRTb25nLmhpZ2hlc3ROb3RlLFxuICAgIG5vbWluYXRvcjogcy5ub21pbmF0b3IgPSBkZWZhdWx0U29uZy5ub21pbmF0b3IsXG4gICAgZGVub21pbmF0b3I6IHMuZGVub21pbmF0b3IgPSBkZWZhdWx0U29uZy5kZW5vbWluYXRvcixcbiAgICBxdWFudGl6ZVZhbHVlOiBzLnF1YW50aXplVmFsdWUgPSBkZWZhdWx0U29uZy5xdWFudGl6ZVZhbHVlLFxuICAgIGZpeGVkTGVuZ3RoVmFsdWU6IHMuZml4ZWRMZW5ndGhWYWx1ZSA9IGRlZmF1bHRTb25nLmZpeGVkTGVuZ3RoVmFsdWUsXG4gICAgcG9zaXRpb25UeXBlOiBzLnBvc2l0aW9uVHlwZSA9IGRlZmF1bHRTb25nLnBvc2l0aW9uVHlwZSxcbiAgICB1c2VNZXRyb25vbWU6IHMudXNlTWV0cm9ub21lID0gZGVmYXVsdFNvbmcudXNlTWV0cm9ub21lLFxuICAgIGF1dG9TaXplOiBzLmF1dG9TaXplID0gZGVmYXVsdFNvbmcuYXV0b1NpemUsXG4gICAgbG9vcDogcy5sb29wID0gZGVmYXVsdFNvbmcubG9vcCxcbiAgICBwbGF5YmFja1NwZWVkOiBzLnBsYXliYWNrU3BlZWQgPSBkZWZhdWx0U29uZy5wbGF5YmFja1NwZWVkLFxuICAgIGF1dG9RdWFudGl6ZTogcy5hdXRvUXVhbnRpemUgPSBkZWZhdWx0U29uZy5hdXRvUXVhbnRpemUsXG4gIH0gPSBzZXR0aW5ncylcblxuICBsZXR7XG4gICAgdGltZUV2ZW50czogdGltZUV2ZW50cyA9IFtcbiAgICAgIHtpZDogZ2V0TUlESUV2ZW50SWQoKSwgc29uZzogaWQsIHRpY2tzOiAwLCB0eXBlOiBNSURJLlRFTVBPLCBkYXRhMTogcy5icG19LFxuICAgICAge2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb25nOiBpZCwgdGlja3M6IDAsIHR5cGU6IE1JREkuVElNRV9TSUdOQVRVUkUsIGRhdGExOiBzLm5vbWluYXRvciwgZGF0YTI6IHMuZGVub21pbmF0b3J9XG4gICAgXSxcbiAgICBtaWRpRXZlbnRJZHM6IG1pZGlFdmVudElkcyA9IFtdLFxuICAgIHBhcnRJZHM6IHBhcnRJZHMgPSBbXSxcbiAgICB0cmFja0lkczogdHJhY2tJZHMgPSBbXSxcbiAgfSA9IHNldHRpbmdzXG5cbiAgcGFyc2VUaW1lRXZlbnRzKHMsIHRpbWVFdmVudHMpXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IENSRUFURV9TT05HLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgdGltZUV2ZW50cyxcbiAgICAgIG1pZGlFdmVudElkcyxcbiAgICAgIHBhcnRJZHMsXG4gICAgICB0cmFja0lkcyxcbiAgICAgIHNldHRpbmdzOiBzXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkVHJhY2tzKHNvbmdfaWQ6IHN0cmluZywgLi4udHJhY2tfaWRzOnN0cmluZyl7XG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfVFJBQ0tTLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHNvbmdfaWQsXG4gICAgICB0cmFja19pZHMsXG4gICAgfVxuICB9KVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUaW1lRXZlbnRzKC4uLnRpbWVfZXZlbnRzKXtcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkTUlESUV2ZW50cyhcbiAgc2V0dGluZ3M6IHtzb25nX2lkOiBzdHJpbmcsIHRyYWNrX2lkOiBzdHJpbmcsIHBhcnRfaWQ6IHN0cmluZ30sXG4gIG1pZGlfZXZlbnRzOiBBcnJheTx7dGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyfT5cbil7XG4gIC8vQHRvZG86IGNyZWF0ZSBwYXJ0LCBhZGQgZXZlbnRzIHRvIHBhcnQsIGNyZWF0ZSB0cmFjaywgYWRkIHBhcnQgdG8gdHJhY2ssIGFkZCB0cmFjayB0byBzb25nXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfTUlESV9FVkVOVFNfVE9fU09ORyxcbiAgICBwYXlsb2FkOiB7XG4vLyAgICAgIGlkOiBzb25nX2lkLFxuICAgICAgbWlkaV9ldmVudHNcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRNSURJRXZlbnRzVG9Tb25nKHNvbmdfaWQ6IHN0cmluZywgbWlkaV9ldmVudHM6IEFycmF5PHt0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXJ9Pil7XG4gIC8vQHRvZG86IGNyZWF0ZSBwYXJ0LCBhZGQgZXZlbnRzIHRvIHBhcnQsIGNyZWF0ZSB0cmFjaywgYWRkIHBhcnQgdG8gdHJhY2ssIGFkZCB0cmFjayB0byBzb25nXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfTUlESV9FVkVOVFNfVE9fU09ORyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZDogc29uZ19pZCxcbiAgICAgIG1pZGlfZXZlbnRzXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU29uZyhzb25nX2lkOiBzdHJpbmcpe1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLnNlcXVlbmNlclxuICBsZXQgc29uZyA9IHN0YXRlLnNvbmdzW3NvbmdfaWRdXG4gIGlmKHNvbmcpe1xuICAgIGxldCBtaWRpRXZlbnRzID0gWy4uLnNvbmcudGltZUV2ZW50c11cbiAgICBzb25nLm1pZGlFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50X2lkKXtcbiAgICAgIGxldCBldmVudCA9IHN0YXRlLm1pZGlFdmVudHNbZXZlbnRfaWRdXG4gICAgICBpZihldmVudCl7XG4gICAgICAgIG1pZGlFdmVudHMucHVzaCh7Li4uZXZlbnR9KVxuICAgICAgfVxuICAgIH0pXG4gICAgbWlkaUV2ZW50cyA9IHBhcnNlRXZlbnRzKG1pZGlFdmVudHMpXG4gICAgc3RvcmUuZGlzcGF0Y2goe1xuICAgICAgdHlwZTogVVBEQVRFX1NPTkcsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIHNvbmdfaWQsXG4gICAgICAgIG1pZGlfZXZlbnRzOiBtaWRpRXZlbnRzXG4gICAgICB9XG4gICAgfSlcbiAgfWVsc2V7XG4gICAgY29uc29sZS53YXJuKGBubyBzb25nIGZvdW5kIHdpdGggaWQgJHtzb25nX2lkfWApXG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRTb25nKHNvbmdfaWQ6IHN0cmluZywgcG9zaXRpb246IG51bWJlciA9IDApe1xuICBsZXQgdGltZVN0YW1wID0gY29udGV4dC5jdXJyZW50VGltZVxuICBsZXQgbWlsbGlzID0gcG9zaXRpb25cblxuICBhZGRUYXNrKCdyZXBldGl0aXZlJywgc29uZ19pZCwgZnVuY3Rpb24oKXtcbiAgICBsZXRcbiAgICAgIG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwLFxuICAgICAgZGlmZiA9IG5vdyAtIHRpbWVTdGFtcFxuXG4gICAgbWlsbGlzICs9IGRpZmZcbiAgICB0aW1lU3RhbXAgPSBub3dcbiAgICBjb25zb2xlLmxvZyhkaWZmKVxuICAgIC8vQFRPRE86IGhvdyB0byBjb25uZWN0IGEgc2NoZWR1bGVyIHRvIGEgc29uZz9cbiAgICAvL3NvbmcuX3NjaGVkdWxlci51cGRhdGUoKTtcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0b3BTb25nKHNvbmdfaWQ6IHN0cmluZyl7XG4gIHJlbW92ZVRhc2soJ3JlcGV0aXRpdmUnLCBzb25nX2lkKVxufVxuIiwiXG5pbXBvcnQgcWFtYmksIHtcbiAgY3JlYXRlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50VG8sXG4gIGNyZWF0ZU1JRElOb3RlLFxuICBjcmVhdGVTb25nLFxuICBhZGRUcmFja3MsXG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcbiAgY3JlYXRlUGFydCxcbiAgYWRkTUlESUV2ZW50cyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcbn0gZnJvbSAnLi9xYW1iaSdcblxuY29uc29sZS5sb2cocWFtYmkudmVyc2lvbilcbnFhbWJpLmxvZygnZnVuY3Rpb25zJylcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG5cbiAgbGV0IGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXh0JylcbiAgbGV0IGJ1dHRvbkNsaWNrZWQgPSAwXG4gIGxldCBub3Rlb24sIG5vdGVvZmYsIG5vdGUsIHNvbmcsIHRyYWNrLCBwYXJ0MSwgcGFydDJcblxuICBzb25nID0gY3JlYXRlU29uZyh7bmFtZTogJ015IEZpcnN0IFNvbmcnLCBwbGF5YmFja1NwZWVkOiAxMDAsIGxvb3A6IHRydWUsIGJwbTogOTB9KVxuICB0cmFjayA9IGNyZWF0ZVRyYWNrKHtuYW1lOiAnZ3VpdGFyJywgc29uZ30pXG4gIHBhcnQxID0gY3JlYXRlUGFydCh7bmFtZTogJ3NvbG8xJywgdHJhY2t9KVxuICBwYXJ0MiA9IGNyZWF0ZVBhcnQoe25hbWU6ICdzb2xvMicsIHRyYWNrfSlcbiAgbm90ZW9uID0gY3JlYXRlTUlESUV2ZW50KDEyMCwgMTQ0LCA2MCwgMTAwKVxuICBub3Rlb2ZmID0gY3JlYXRlTUlESUV2ZW50KDI0MCwgMTI4LCA2MCwgMClcblxuICBub3RlID0gY3JlYXRlTUlESU5vdGUobm90ZW9uLCBub3Rlb2ZmKVxuXG4gIGFkZE1JRElFdmVudHMocGFydDEsIG5vdGVvbiwgbm90ZW9mZiwgJ2JlZXInLCAna29uaWpuJylcbiAgYWRkUGFydHModHJhY2ssIHBhcnQxLCBwYXJ0MilcbiAgYWRkVHJhY2tzKHNvbmcsIHRyYWNrKVxuICB1cGRhdGVTb25nKHNvbmcpXG4gIHN0YXJ0U29uZyhzb25nKVxuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICBzdG9wU29uZyhzb25nKVxuICB9LCAxMDAwKVxuXG4gIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgc3dpdGNoKGJ1dHRvbkNsaWNrZWQpe1xuICAgICAgY2FzZSAwOlxuICAgICAgICBub3Rlb24gPSBjcmVhdGVNSURJRXZlbnQoMTIwLCAxNDQsIDYwLCAxMDApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICBub3Rlb2ZmID0gY3JlYXRlTUlESUV2ZW50KDI0MCwgMTI4LCA2MCwgMTAwKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgbm90ZSA9IGNyZWF0ZU1JRElOb3RlKG5vdGVvbiwgbm90ZW9mZilcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIG1vdmVNSURJRXZlbnQobm90ZW9uLCAtMTAwKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgbW92ZU1JRElFdmVudFRvKG5vdGVvZmYsIDI2MClcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgICBidXR0b25DbGlja2VkKytcbiAgfSlcbn0pXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7XG4gIENSRUFURV9UUkFDSyxcbiAgQUREX1BBUlRTLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpXG5sZXQgdHJhY2tJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYWNrKFxuICBzZXR0aW5nczoge25hbWU6IHN0cmluZywgcGFydElkczpBcnJheTxzdHJpbmc+LCBzb25nSWQ6IHN0cmluZ30gPSB7fVxuICAvL3NldHRpbmdzOiB7bmFtZTogc3RyaW5nLCBwYXJ0czpBcnJheTxzdHJpbmc+LCBzb25nOiBzdHJpbmd9ID0ge25hbWU6ICdhYXAnLCBwYXJ0czogW10sIHNvbmc6ICdubyBzb25nJ31cbiAgLy9zZXR0aW5ncyA9IHtuYW1lOiBuYW1lID0gJ2FhcCcsIHBhcnRzOiBwYXJ0cyA9IFtdLCBzb25nOiBzb25nID0gJ25vIHNvbmcnfVxuICAvL3NldHRpbmdzID0ge25hbWU6IG5hbWUgPSAnYWFwJywgcGFydHM6IHBhcnRzID0gW10sIHNvbmc6IHNvbmcgPSAnbm8gc29uZyd9XG4pe1xuICBsZXQgaWQgPSBgTVRfJHt0cmFja0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBsZXQge1xuICAgIG5hbWUgPSBpZCxcbiAgICBwYXJ0SWRzID0gW10sXG4gICAgc29uZ0lkID0gJ25vbmUnXG4gIH0gPSBzZXR0aW5nc1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX1RSQUNLLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgbmFtZSxcbiAgICAgIHBhcnRJZHMsXG4gICAgICBzb25nSWRcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRQYXJ0cyh0cmFja19pZDogc3RyaW5nLCAuLi5wYXJ0X2lkczpzdHJpbmcpe1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX1BBUlRTLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHRyYWNrX2lkLFxuICAgICAgcGFydF9pZHMsXG4gICAgfVxuICB9KVxufVxuIiwibGV0XG4gIG1Qb3cgPSBNYXRoLnBvdyxcbiAgbVJvdW5kID0gTWF0aC5yb3VuZCxcbiAgbUZsb29yID0gTWF0aC5mbG9vcixcbiAgbVJhbmRvbSA9IE1hdGgucmFuZG9tXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROaWNlVGltZShtaWxsaXMpe1xuICBsZXQgaCwgbSwgcywgbXMsXG4gICAgc2Vjb25kcyxcbiAgICB0aW1lQXNTdHJpbmcgPSAnJztcblxuICBzZWNvbmRzID0gbWlsbGlzLzEwMDA7IC8vIOKGkiBtaWxsaXMgdG8gc2Vjb25kc1xuICBoID0gbUZsb29yKHNlY29uZHMgLyAoNjAgKiA2MCkpO1xuICBtID0gbUZsb29yKChzZWNvbmRzICUgKDYwICogNjApKSAvIDYwKTtcbiAgcyA9IG1GbG9vcihzZWNvbmRzICUgKDYwKSk7XG4gIG1zID0gbVJvdW5kKChzZWNvbmRzIC0gKGggKiAzNjAwKSAtIChtICogNjApIC0gcykgKiAxMDAwKTtcblxuICB0aW1lQXNTdHJpbmcgKz0gaCArICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG0gPCAxMCA/ICcwJyArIG0gOiBtO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gcyA8IDEwID8gJzAnICsgcyA6IHM7XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtcyA9PT0gMCA/ICcwMDAnIDogbXMgPCAxMCA/ICcwMCcgKyBtcyA6IG1zIDwgMTAwID8gJzAnICsgbXMgOiBtcztcblxuICAvL2NvbnNvbGUubG9nKGgsIG0sIHMsIG1zKTtcbiAgcmV0dXJuIHtcbiAgICBob3VyOiBoLFxuICAgIG1pbnV0ZTogbSxcbiAgICBzZWNvbmQ6IHMsXG4gICAgbWlsbGlzZWNvbmQ6IG1zLFxuICAgIHRpbWVBc1N0cmluZzogdGltZUFzU3RyaW5nLFxuICAgIHRpbWVBc0FycmF5OiBbaCwgbSwgcywgbXNdXG4gIH07XG59Il19
