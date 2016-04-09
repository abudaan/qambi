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

},{"./reducer":20,"redux":13,"redux-logger":6,"redux-thunk":7}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMIDIEvent = createMIDIEvent;
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
      data2: data2
    }
  });
  return id;
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
      ticks: ticks
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
      ticks: ticks
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

},{"./action_types":15,"./create_store":16,"./midi_note":18}],18:[function(require,module,exports){
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

},{"./action_types":15,"./create_store":16}],19:[function(require,module,exports){
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
  var _settings$midiEvents = settings.midiEvents;
  var midiEvents = _settings$midiEvents === undefined ? [] : _settings$midiEvents;
  var _settings$midiNotes = settings.midiNotes;
  var midiNotes = _settings$midiNotes === undefined ? [] : _settings$midiNotes;
  var _settings$track = settings.track;
  var track = _settings$track === undefined ? 'none' : _settings$track;


  store.dispatch({
    type: _action_types.CREATE_PART,
    payload: {
      id: id,
      name: name,
      midiEvents: midiEvents,
      midiNotes: midiNotes,
      track: track
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

},{"./action_types":15,"./create_store":16}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _redux = require('redux');

var _action_types = require('./action_types');

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
      var songId = action.payload.song_id;
      var song = state.songs[songId];
      if (song) {
        var trackIds = action.payload.track_ids;
        trackIds.forEach(function (id) {
          var track = state.tracks[id];
          if (track) {
            song.tracks.push(id);
            track.song = songId;
          } else {
            console.warn('no track with id ' + id);
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
            track.parts.push(id);
            part.track = trackId;
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
            part.midiEvents.push(id);
            midiEvent.part = partId;
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
      var eventId = action.payload.id;
      var event = state.midiEvents[eventId];
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

    default:
    // do nothing
  }
  return state;
}

var sequencerApp = (0, _redux.combineReducers)({
  sequencer: sequencer
});

exports.default = sequencerApp;

},{"./action_types":15,"redux":13}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSong = createSong;
exports.addTracks = addTracks;
exports.addMIDIEvents = addMIDIEvents;
exports.addMIDIEventsToSong = addMIDIEventsToSong;

var _create_store = require('./create_store');

var _action_types = require('./action_types');

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
  autoQuantize: false,
  timeEvents: [],
  midiEvents: [],
  parts: [],
  tracks: []
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
  var timeEvents = _settings$timeEvents === undefined ? defaultSong.timeEvents : _settings$timeEvents;
  var _settings$midiEvents = settings.midiEvents;
  var midiEvents = _settings$midiEvents === undefined ? defaultSong.midiEvents : _settings$midiEvents;
  var _settings$parts = settings.parts;
  var parts = _settings$parts === undefined ? defaultSong.parts : _settings$parts;
  var _settings$tracks = settings.tracks;
  var tracks = _settings$tracks === undefined ? defaultSong.tracks : _settings$tracks;


  store.dispatch({
    type: _action_types.CREATE_SONG,
    payload: {
      id: id,
      timeEvents: timeEvents,
      midiEvents: midiEvents,
      parts: parts,
      tracks: tracks,
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

},{"./action_types":15,"./create_store":16}],22:[function(require,module,exports){
'use strict';

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _song = require('./song');

var _track = require('./track');

var _part = require('./part');

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

  song = (0, _song.createSong)({ name: 'My First Song', playbackSpeed: 100, loop: true });
  track = (0, _track.createTrack)({ name: 'guitar', song: song });
  part1 = (0, _part.createPart)({ name: 'solo1', track: track });
  part2 = (0, _part.createPart)({ name: 'solo2', track: track });
  noteon = (0, _midi_event.createMIDIEvent)(120, 144, 60, 100);
  noteoff = (0, _midi_event.createMIDIEvent)(240, 128, 60, 0);

  note = (0, _midi_note.createMIDINote)(noteon, noteoff);

  (0, _part.addMIDIEvents)(part1, noteon, noteoff, 'beer', 'konijn');
  (0, _track.addParts)(track, part1, part2);
  (0, _song.addTracks)(song, track);

  button.addEventListener('click', function () {
    switch (buttonClicked) {
      case 0:
        noteon = (0, _midi_event.createMIDIEvent)(120, 144, 60, 100);
        break;
      case 1:
        noteoff = (0, _midi_event.createMIDIEvent)(240, 128, 60, 100);
        break;
      case 2:
        note = (0, _midi_note.createMIDINote)(noteon, noteoff);
        break;
      case 3:
        (0, _midi_event.moveMIDIEvent)(noteon, -100);
        break;
      case 4:
        (0, _midi_event.moveMIDIEventTo)(noteoff, 260);
        break;
      default:
    }
    buttonClicked++;
  });
});

},{"./midi_event":17,"./midi_note":18,"./part":19,"./song":21,"./track":23}],23:[function(require,module,exports){
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
  var _settings$parts = settings.parts;
  var parts = _settings$parts === undefined ? [] : _settings$parts;
  var _settings$song = settings.song;
  var song = _settings$song === undefined ? 'none' : _settings$song;

  store.dispatch({
    type: _action_types.CREATE_TRACK,
    payload: {
      id: id,
      name: name,
      parts: parts,
      song: song
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

},{"./action_types":15,"./create_store":16}]},{},[22])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19pc0hvc3RPYmplY3QuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNQbGFpbk9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcmVkdXgtbG9nZ2VyL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC10aHVuay9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2FwcGx5TWlkZGxld2FyZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvYmluZEFjdGlvbkNyZWF0b3JzLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9jb21iaW5lUmVkdWNlcnMuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NvbXBvc2UuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NyZWF0ZVN0b3JlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvdXRpbHMvd2FybmluZy5qcyIsInNyYy9mcC9hY3Rpb25fdHlwZXMuanMiLCJzcmMvZnAvY3JlYXRlX3N0b3JlLmpzIiwic3JjL2ZwL21pZGlfZXZlbnQuanMiLCJzcmMvZnAvbWlkaV9ub3RlLmpzIiwic3JjL2ZwL3BhcnQuanMiLCJzcmMvZnAvcmVkdWNlci5qcyIsInNyYy9mcC9zb25nLmpzIiwic3JjL2ZwL3Rlc3Rfd2ViLmpzIiwic3JjL2ZwL3RyYWNrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFUO0dBRkYsRUFQRDtBQWdCQyxTQUFPLEVBQVAsQ0FoQkQ7Q0FMTTs7QUF5QkEsU0FBUyxRQUFULENBQWtCLFFBQWxCLEVBQXVEO29DQUFoQjs7R0FBZ0I7O0FBQzVELFFBQU0sUUFBTixDQUFlO0FBQ2IsaUNBRGE7QUFFYixhQUFTO0FBQ1Asd0JBRE87QUFFUCx3QkFGTztLQUFUO0dBRkYsRUFENEQ7Q0FBdkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUdldFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcblxuLyoqXG4gKiBHZXRzIHRoZSBgW1tQcm90b3R5cGVdXWAgb2YgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7bnVsbHxPYmplY3R9IFJldHVybnMgdGhlIGBbW1Byb3RvdHlwZV1dYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UHJvdG90eXBlKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVHZXRQcm90b3R5cGUoT2JqZWN0KHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGhvc3Qgb2JqZWN0IGluIElFIDwgOS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGhvc3Qgb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSG9zdE9iamVjdCh2YWx1ZSkge1xuICAvLyBNYW55IGhvc3Qgb2JqZWN0cyBhcmUgYE9iamVjdGAgb2JqZWN0cyB0aGF0IGNhbiBjb2VyY2UgdG8gc3RyaW5nc1xuICAvLyBkZXNwaXRlIGhhdmluZyBpbXByb3Blcmx5IGRlZmluZWQgYHRvU3RyaW5nYCBtZXRob2RzLlxuICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gIGlmICh2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZS50b1N0cmluZyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9ICEhKHZhbHVlICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0hvc3RPYmplY3Q7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG4iLCJ2YXIgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgaXNIb3N0T2JqZWN0ID0gcmVxdWlyZSgnLi9faXNIb3N0T2JqZWN0JyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBpbmZlciB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IuICovXG52YXIgb2JqZWN0Q3RvclN0cmluZyA9IGZ1bmNUb1N0cmluZy5jYWxsKE9iamVjdCk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCB0aGF0IGlzLCBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGVcbiAqIGBPYmplY3RgIGNvbnN0cnVjdG9yIG9yIG9uZSB3aXRoIGEgYFtbUHJvdG90eXBlXV1gIG9mIGBudWxsYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuOC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqIH1cbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QobmV3IEZvbyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoeyAneCc6IDAsICd5JzogMCB9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpIHx8XG4gICAgICBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSAhPSBvYmplY3RUYWcgfHwgaXNIb3N0T2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcHJvdG8gPSBnZXRQcm90b3R5cGUodmFsdWUpO1xuICBpZiAocHJvdG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgQ3RvciA9IGhhc093blByb3BlcnR5LmNhbGwocHJvdG8sICdjb25zdHJ1Y3RvcicpICYmIHByb3RvLmNvbnN0cnVjdG9yO1xuICByZXR1cm4gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiZcbiAgICBDdG9yIGluc3RhbmNlb2YgQ3RvciAmJiBmdW5jVG9TdHJpbmcuY2FsbChDdG9yKSA9PSBvYmplY3RDdG9yU3RyaW5nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1BsYWluT2JqZWN0O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9XG5cbnZhciByZXBlYXQgPSBmdW5jdGlvbiByZXBlYXQoc3RyLCB0aW1lcykge1xuICByZXR1cm4gbmV3IEFycmF5KHRpbWVzICsgMSkuam9pbihzdHIpO1xufTtcbnZhciBwYWQgPSBmdW5jdGlvbiBwYWQobnVtLCBtYXhMZW5ndGgpIHtcbiAgcmV0dXJuIHJlcGVhdChcIjBcIiwgbWF4TGVuZ3RoIC0gbnVtLnRvU3RyaW5nKCkubGVuZ3RoKSArIG51bTtcbn07XG52YXIgZm9ybWF0VGltZSA9IGZ1bmN0aW9uIGZvcm1hdFRpbWUodGltZSkge1xuICByZXR1cm4gXCJAIFwiICsgcGFkKHRpbWUuZ2V0SG91cnMoKSwgMikgKyBcIjpcIiArIHBhZCh0aW1lLmdldE1pbnV0ZXMoKSwgMikgKyBcIjpcIiArIHBhZCh0aW1lLmdldFNlY29uZHMoKSwgMikgKyBcIi5cIiArIHBhZCh0aW1lLmdldE1pbGxpc2Vjb25kcygpLCAzKTtcbn07XG5cbi8vIFVzZSB0aGUgbmV3IHBlcmZvcm1hbmNlIGFwaSB0byBnZXQgYmV0dGVyIHByZWNpc2lvbiBpZiBhdmFpbGFibGVcbnZhciB0aW1lciA9IHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgcGVyZm9ybWFuY2Uubm93ID09PSBcImZ1bmN0aW9uXCIgPyBwZXJmb3JtYW5jZSA6IERhdGU7XG5cbi8qKlxuICogcGFyc2UgdGhlIGxldmVsIG9wdGlvbiBvZiBjcmVhdGVMb2dnZXJcbiAqXG4gKiBAcHJvcGVydHkge3N0cmluZyB8IGZ1bmN0aW9uIHwgb2JqZWN0fSBsZXZlbCAtIGNvbnNvbGVbbGV2ZWxdXG4gKiBAcHJvcGVydHkge29iamVjdH0gYWN0aW9uXG4gKiBAcHJvcGVydHkge2FycmF5fSBwYXlsb2FkXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdHlwZVxuICovXG5cbmZ1bmN0aW9uIGdldExvZ0xldmVsKGxldmVsLCBhY3Rpb24sIHBheWxvYWQsIHR5cGUpIHtcbiAgc3dpdGNoICh0eXBlb2YgbGV2ZWwgPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogX3R5cGVvZihsZXZlbCkpIHtcbiAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICByZXR1cm4gdHlwZW9mIGxldmVsW3R5cGVdID09PSBcImZ1bmN0aW9uXCIgPyBsZXZlbFt0eXBlXS5hcHBseShsZXZlbCwgX3RvQ29uc3VtYWJsZUFycmF5KHBheWxvYWQpKSA6IGxldmVsW3R5cGVdO1xuICAgIGNhc2UgXCJmdW5jdGlvblwiOlxuICAgICAgcmV0dXJuIGxldmVsKGFjdGlvbik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBsZXZlbDtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgbG9nZ2VyIHdpdGggZm9sbG93ZWQgb3B0aW9uc1xuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBvcHRpb25zIC0gb3B0aW9ucyBmb3IgbG9nZ2VyXG4gKiBAcHJvcGVydHkge3N0cmluZyB8IGZ1bmN0aW9uIHwgb2JqZWN0fSBvcHRpb25zLmxldmVsIC0gY29uc29sZVtsZXZlbF1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb3B0aW9ucy5kdXJhdGlvbiAtIHByaW50IGR1cmF0aW9uIG9mIGVhY2ggYWN0aW9uP1xuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLnRpbWVzdGFtcCAtIHByaW50IHRpbWVzdGFtcCB3aXRoIGVhY2ggYWN0aW9uP1xuICogQHByb3BlcnR5IHtvYmplY3R9IG9wdGlvbnMuY29sb3JzIC0gY3VzdG9tIGNvbG9yc1xuICogQHByb3BlcnR5IHtvYmplY3R9IG9wdGlvbnMubG9nZ2VyIC0gaW1wbGVtZW50YXRpb24gb2YgdGhlIGBjb25zb2xlYCBBUElcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb3B0aW9ucy5sb2dFcnJvcnMgLSBzaG91bGQgZXJyb3JzIGluIGFjdGlvbiBleGVjdXRpb24gYmUgY2F1Z2h0LCBsb2dnZWQsIGFuZCByZS10aHJvd24/XG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9wdGlvbnMuY29sbGFwc2VkIC0gaXMgZ3JvdXAgY29sbGFwc2VkP1xuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLnByZWRpY2F0ZSAtIGNvbmRpdGlvbiB3aGljaCByZXNvbHZlcyBsb2dnZXIgYmVoYXZpb3JcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IG9wdGlvbnMuc3RhdGVUcmFuc2Zvcm1lciAtIHRyYW5zZm9ybSBzdGF0ZSBiZWZvcmUgcHJpbnRcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IG9wdGlvbnMuYWN0aW9uVHJhbnNmb3JtZXIgLSB0cmFuc2Zvcm0gYWN0aW9uIGJlZm9yZSBwcmludFxuICogQHByb3BlcnR5IHtmdW5jdGlvbn0gb3B0aW9ucy5lcnJvclRyYW5zZm9ybWVyIC0gdHJhbnNmb3JtIGVycm9yIGJlZm9yZSBwcmludFxuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUxvZ2dlcigpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcbiAgdmFyIF9vcHRpb25zJGxldmVsID0gb3B0aW9ucy5sZXZlbDtcbiAgdmFyIGxldmVsID0gX29wdGlvbnMkbGV2ZWwgPT09IHVuZGVmaW5lZCA/IFwibG9nXCIgOiBfb3B0aW9ucyRsZXZlbDtcbiAgdmFyIF9vcHRpb25zJGxvZ2dlciA9IG9wdGlvbnMubG9nZ2VyO1xuICB2YXIgbG9nZ2VyID0gX29wdGlvbnMkbG9nZ2VyID09PSB1bmRlZmluZWQgPyBjb25zb2xlIDogX29wdGlvbnMkbG9nZ2VyO1xuICB2YXIgX29wdGlvbnMkbG9nRXJyb3JzID0gb3B0aW9ucy5sb2dFcnJvcnM7XG4gIHZhciBsb2dFcnJvcnMgPSBfb3B0aW9ucyRsb2dFcnJvcnMgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBfb3B0aW9ucyRsb2dFcnJvcnM7XG4gIHZhciBjb2xsYXBzZWQgPSBvcHRpb25zLmNvbGxhcHNlZDtcbiAgdmFyIHByZWRpY2F0ZSA9IG9wdGlvbnMucHJlZGljYXRlO1xuICB2YXIgX29wdGlvbnMkZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uO1xuICB2YXIgZHVyYXRpb24gPSBfb3B0aW9ucyRkdXJhdGlvbiA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBfb3B0aW9ucyRkdXJhdGlvbjtcbiAgdmFyIF9vcHRpb25zJHRpbWVzdGFtcCA9IG9wdGlvbnMudGltZXN0YW1wO1xuICB2YXIgdGltZXN0YW1wID0gX29wdGlvbnMkdGltZXN0YW1wID09PSB1bmRlZmluZWQgPyB0cnVlIDogX29wdGlvbnMkdGltZXN0YW1wO1xuICB2YXIgdHJhbnNmb3JtZXIgPSBvcHRpb25zLnRyYW5zZm9ybWVyO1xuICB2YXIgX29wdGlvbnMkc3RhdGVUcmFuc2ZvID0gb3B0aW9ucy5zdGF0ZVRyYW5zZm9ybWVyO1xuICB2YXIgLy8gZGVwcmVjYXRlZFxuICBzdGF0ZVRyYW5zZm9ybWVyID0gX29wdGlvbnMkc3RhdGVUcmFuc2ZvID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH0gOiBfb3B0aW9ucyRzdGF0ZVRyYW5zZm87XG4gIHZhciBfb3B0aW9ucyRhY3Rpb25UcmFuc2YgPSBvcHRpb25zLmFjdGlvblRyYW5zZm9ybWVyO1xuICB2YXIgYWN0aW9uVHJhbnNmb3JtZXIgPSBfb3B0aW9ucyRhY3Rpb25UcmFuc2YgPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uIChhY3RuKSB7XG4gICAgcmV0dXJuIGFjdG47XG4gIH0gOiBfb3B0aW9ucyRhY3Rpb25UcmFuc2Y7XG4gIHZhciBfb3B0aW9ucyRlcnJvclRyYW5zZm8gPSBvcHRpb25zLmVycm9yVHJhbnNmb3JtZXI7XG4gIHZhciBlcnJvclRyYW5zZm9ybWVyID0gX29wdGlvbnMkZXJyb3JUcmFuc2ZvID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH0gOiBfb3B0aW9ucyRlcnJvclRyYW5zZm87XG4gIHZhciBfb3B0aW9ucyRjb2xvcnMgPSBvcHRpb25zLmNvbG9ycztcbiAgdmFyIGNvbG9ycyA9IF9vcHRpb25zJGNvbG9ycyA9PT0gdW5kZWZpbmVkID8ge1xuICAgIHRpdGxlOiBmdW5jdGlvbiB0aXRsZSgpIHtcbiAgICAgIHJldHVybiBcIiMwMDAwMDBcIjtcbiAgICB9LFxuICAgIHByZXZTdGF0ZTogZnVuY3Rpb24gcHJldlN0YXRlKCkge1xuICAgICAgcmV0dXJuIFwiIzlFOUU5RVwiO1xuICAgIH0sXG4gICAgYWN0aW9uOiBmdW5jdGlvbiBhY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXCIjMDNBOUY0XCI7XG4gICAgfSxcbiAgICBuZXh0U3RhdGU6IGZ1bmN0aW9uIG5leHRTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBcIiM0Q0FGNTBcIjtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbiBlcnJvcigpIHtcbiAgICAgIHJldHVybiBcIiNGMjA0MDRcIjtcbiAgICB9XG4gIH0gOiBfb3B0aW9ucyRjb2xvcnM7XG5cbiAgLy8gZXhpdCBpZiBjb25zb2xlIHVuZGVmaW5lZFxuXG4gIGlmICh0eXBlb2YgbG9nZ2VyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAobmV4dCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH07XG4gIH1cblxuICBpZiAodHJhbnNmb3JtZXIpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiT3B0aW9uICd0cmFuc2Zvcm1lcicgaXMgZGVwcmVjYXRlZCwgdXNlIHN0YXRlVHJhbnNmb3JtZXIgaW5zdGVhZFwiKTtcbiAgfVxuXG4gIHZhciBsb2dCdWZmZXIgPSBbXTtcbiAgZnVuY3Rpb24gcHJpbnRCdWZmZXIoKSB7XG4gICAgbG9nQnVmZmVyLmZvckVhY2goZnVuY3Rpb24gKGxvZ0VudHJ5LCBrZXkpIHtcbiAgICAgIHZhciBzdGFydGVkID0gbG9nRW50cnkuc3RhcnRlZDtcbiAgICAgIHZhciBzdGFydGVkVGltZSA9IGxvZ0VudHJ5LnN0YXJ0ZWRUaW1lO1xuICAgICAgdmFyIGFjdGlvbiA9IGxvZ0VudHJ5LmFjdGlvbjtcbiAgICAgIHZhciBwcmV2U3RhdGUgPSBsb2dFbnRyeS5wcmV2U3RhdGU7XG4gICAgICB2YXIgZXJyb3IgPSBsb2dFbnRyeS5lcnJvcjtcbiAgICAgIHZhciB0b29rID0gbG9nRW50cnkudG9vaztcbiAgICAgIHZhciBuZXh0U3RhdGUgPSBsb2dFbnRyeS5uZXh0U3RhdGU7XG5cbiAgICAgIHZhciBuZXh0RW50cnkgPSBsb2dCdWZmZXJba2V5ICsgMV07XG4gICAgICBpZiAobmV4dEVudHJ5KSB7XG4gICAgICAgIG5leHRTdGF0ZSA9IG5leHRFbnRyeS5wcmV2U3RhdGU7XG4gICAgICAgIHRvb2sgPSBuZXh0RW50cnkuc3RhcnRlZCAtIHN0YXJ0ZWQ7XG4gICAgICB9XG4gICAgICAvLyBtZXNzYWdlXG4gICAgICB2YXIgZm9ybWF0dGVkQWN0aW9uID0gYWN0aW9uVHJhbnNmb3JtZXIoYWN0aW9uKTtcbiAgICAgIHZhciBpc0NvbGxhcHNlZCA9IHR5cGVvZiBjb2xsYXBzZWQgPT09IFwiZnVuY3Rpb25cIiA/IGNvbGxhcHNlZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgICB9LCBhY3Rpb24pIDogY29sbGFwc2VkO1xuXG4gICAgICB2YXIgZm9ybWF0dGVkVGltZSA9IGZvcm1hdFRpbWUoc3RhcnRlZFRpbWUpO1xuICAgICAgdmFyIHRpdGxlQ1NTID0gY29sb3JzLnRpdGxlID8gXCJjb2xvcjogXCIgKyBjb2xvcnMudGl0bGUoZm9ybWF0dGVkQWN0aW9uKSArIFwiO1wiIDogbnVsbDtcbiAgICAgIHZhciB0aXRsZSA9IFwiYWN0aW9uIFwiICsgKHRpbWVzdGFtcCA/IGZvcm1hdHRlZFRpbWUgOiBcIlwiKSArIFwiIFwiICsgZm9ybWF0dGVkQWN0aW9uLnR5cGUgKyBcIiBcIiArIChkdXJhdGlvbiA/IFwiKGluIFwiICsgdG9vay50b0ZpeGVkKDIpICsgXCIgbXMpXCIgOiBcIlwiKTtcblxuICAgICAgLy8gcmVuZGVyXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoaXNDb2xsYXBzZWQpIHtcbiAgICAgICAgICBpZiAoY29sb3JzLnRpdGxlKSBsb2dnZXIuZ3JvdXBDb2xsYXBzZWQoXCIlYyBcIiArIHRpdGxlLCB0aXRsZUNTUyk7ZWxzZSBsb2dnZXIuZ3JvdXBDb2xsYXBzZWQodGl0bGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjb2xvcnMudGl0bGUpIGxvZ2dlci5ncm91cChcIiVjIFwiICsgdGl0bGUsIHRpdGxlQ1NTKTtlbHNlIGxvZ2dlci5ncm91cCh0aXRsZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmxvZyh0aXRsZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcmV2U3RhdGVMZXZlbCA9IGdldExvZ0xldmVsKGxldmVsLCBmb3JtYXR0ZWRBY3Rpb24sIFtwcmV2U3RhdGVdLCBcInByZXZTdGF0ZVwiKTtcbiAgICAgIHZhciBhY3Rpb25MZXZlbCA9IGdldExvZ0xldmVsKGxldmVsLCBmb3JtYXR0ZWRBY3Rpb24sIFtmb3JtYXR0ZWRBY3Rpb25dLCBcImFjdGlvblwiKTtcbiAgICAgIHZhciBlcnJvckxldmVsID0gZ2V0TG9nTGV2ZWwobGV2ZWwsIGZvcm1hdHRlZEFjdGlvbiwgW2Vycm9yLCBwcmV2U3RhdGVdLCBcImVycm9yXCIpO1xuICAgICAgdmFyIG5leHRTdGF0ZUxldmVsID0gZ2V0TG9nTGV2ZWwobGV2ZWwsIGZvcm1hdHRlZEFjdGlvbiwgW25leHRTdGF0ZV0sIFwibmV4dFN0YXRlXCIpO1xuXG4gICAgICBpZiAocHJldlN0YXRlTGV2ZWwpIHtcbiAgICAgICAgaWYgKGNvbG9ycy5wcmV2U3RhdGUpIGxvZ2dlcltwcmV2U3RhdGVMZXZlbF0oXCIlYyBwcmV2IHN0YXRlXCIsIFwiY29sb3I6IFwiICsgY29sb3JzLnByZXZTdGF0ZShwcmV2U3RhdGUpICsgXCI7IGZvbnQtd2VpZ2h0OiBib2xkXCIsIHByZXZTdGF0ZSk7ZWxzZSBsb2dnZXJbcHJldlN0YXRlTGV2ZWxdKFwicHJldiBzdGF0ZVwiLCBwcmV2U3RhdGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWN0aW9uTGV2ZWwpIHtcbiAgICAgICAgaWYgKGNvbG9ycy5hY3Rpb24pIGxvZ2dlclthY3Rpb25MZXZlbF0oXCIlYyBhY3Rpb25cIiwgXCJjb2xvcjogXCIgKyBjb2xvcnMuYWN0aW9uKGZvcm1hdHRlZEFjdGlvbikgKyBcIjsgZm9udC13ZWlnaHQ6IGJvbGRcIiwgZm9ybWF0dGVkQWN0aW9uKTtlbHNlIGxvZ2dlclthY3Rpb25MZXZlbF0oXCJhY3Rpb25cIiwgZm9ybWF0dGVkQWN0aW9uKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVycm9yICYmIGVycm9yTGV2ZWwpIHtcbiAgICAgICAgaWYgKGNvbG9ycy5lcnJvcikgbG9nZ2VyW2Vycm9yTGV2ZWxdKFwiJWMgZXJyb3JcIiwgXCJjb2xvcjogXCIgKyBjb2xvcnMuZXJyb3IoZXJyb3IsIHByZXZTdGF0ZSkgKyBcIjsgZm9udC13ZWlnaHQ6IGJvbGRcIiwgZXJyb3IpO2Vsc2UgbG9nZ2VyW2Vycm9yTGV2ZWxdKFwiZXJyb3JcIiwgZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmV4dFN0YXRlTGV2ZWwpIHtcbiAgICAgICAgaWYgKGNvbG9ycy5uZXh0U3RhdGUpIGxvZ2dlcltuZXh0U3RhdGVMZXZlbF0oXCIlYyBuZXh0IHN0YXRlXCIsIFwiY29sb3I6IFwiICsgY29sb3JzLm5leHRTdGF0ZShuZXh0U3RhdGUpICsgXCI7IGZvbnQtd2VpZ2h0OiBib2xkXCIsIG5leHRTdGF0ZSk7ZWxzZSBsb2dnZXJbbmV4dFN0YXRlTGV2ZWxdKFwibmV4dCBzdGF0ZVwiLCBuZXh0U3RhdGUpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBsb2dnZXIuZ3JvdXBFbmQoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmxvZyhcIuKAlOKAlCBsb2cgZW5kIOKAlOKAlFwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBsb2dCdWZmZXIubGVuZ3RoID0gMDtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciBnZXRTdGF0ZSA9IF9yZWYuZ2V0U3RhdGU7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICAvLyBleGl0IGVhcmx5IGlmIHByZWRpY2F0ZSBmdW5jdGlvbiByZXR1cm5zIGZhbHNlXG4gICAgICAgIGlmICh0eXBlb2YgcHJlZGljYXRlID09PSBcImZ1bmN0aW9uXCIgJiYgIXByZWRpY2F0ZShnZXRTdGF0ZSwgYWN0aW9uKSkge1xuICAgICAgICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9nRW50cnkgPSB7fTtcbiAgICAgICAgbG9nQnVmZmVyLnB1c2gobG9nRW50cnkpO1xuXG4gICAgICAgIGxvZ0VudHJ5LnN0YXJ0ZWQgPSB0aW1lci5ub3coKTtcbiAgICAgICAgbG9nRW50cnkuc3RhcnRlZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBsb2dFbnRyeS5wcmV2U3RhdGUgPSBzdGF0ZVRyYW5zZm9ybWVyKGdldFN0YXRlKCkpO1xuICAgICAgICBsb2dFbnRyeS5hY3Rpb24gPSBhY3Rpb247XG5cbiAgICAgICAgdmFyIHJldHVybmVkVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChsb2dFcnJvcnMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuZWRWYWx1ZSA9IG5leHQoYWN0aW9uKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dFbnRyeS5lcnJvciA9IGVycm9yVHJhbnNmb3JtZXIoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybmVkVmFsdWUgPSBuZXh0KGFjdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dFbnRyeS50b29rID0gdGltZXIubm93KCkgLSBsb2dFbnRyeS5zdGFydGVkO1xuICAgICAgICBsb2dFbnRyeS5uZXh0U3RhdGUgPSBzdGF0ZVRyYW5zZm9ybWVyKGdldFN0YXRlKCkpO1xuXG4gICAgICAgIHByaW50QnVmZmVyKCk7XG5cbiAgICAgICAgaWYgKGxvZ0VudHJ5LmVycm9yKSB0aHJvdyBsb2dFbnRyeS5lcnJvcjtcbiAgICAgICAgcmV0dXJuIHJldHVybmVkVmFsdWU7XG4gICAgICB9O1xuICAgIH07XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlTG9nZ2VyOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHRodW5rTWlkZGxld2FyZTtcbmZ1bmN0aW9uIHRodW5rTWlkZGxld2FyZShfcmVmKSB7XG4gIHZhciBkaXNwYXRjaCA9IF9yZWYuZGlzcGF0Y2g7XG4gIHZhciBnZXRTdGF0ZSA9IF9yZWYuZ2V0U3RhdGU7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBhY3Rpb24oZGlzcGF0Y2gsIGdldFN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbiAgICB9O1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gYXBwbHlNaWRkbGV3YXJlO1xuXG52YXIgX2NvbXBvc2UgPSByZXF1aXJlKCcuL2NvbXBvc2UnKTtcblxudmFyIF9jb21wb3NlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLyoqXG4gKiBDcmVhdGVzIGEgc3RvcmUgZW5oYW5jZXIgdGhhdCBhcHBsaWVzIG1pZGRsZXdhcmUgdG8gdGhlIGRpc3BhdGNoIG1ldGhvZFxuICogb2YgdGhlIFJlZHV4IHN0b3JlLiBUaGlzIGlzIGhhbmR5IGZvciBhIHZhcmlldHkgb2YgdGFza3MsIHN1Y2ggYXMgZXhwcmVzc2luZ1xuICogYXN5bmNocm9ub3VzIGFjdGlvbnMgaW4gYSBjb25jaXNlIG1hbm5lciwgb3IgbG9nZ2luZyBldmVyeSBhY3Rpb24gcGF5bG9hZC5cbiAqXG4gKiBTZWUgYHJlZHV4LXRodW5rYCBwYWNrYWdlIGFzIGFuIGV4YW1wbGUgb2YgdGhlIFJlZHV4IG1pZGRsZXdhcmUuXG4gKlxuICogQmVjYXVzZSBtaWRkbGV3YXJlIGlzIHBvdGVudGlhbGx5IGFzeW5jaHJvbm91cywgdGhpcyBzaG91bGQgYmUgdGhlIGZpcnN0XG4gKiBzdG9yZSBlbmhhbmNlciBpbiB0aGUgY29tcG9zaXRpb24gY2hhaW4uXG4gKlxuICogTm90ZSB0aGF0IGVhY2ggbWlkZGxld2FyZSB3aWxsIGJlIGdpdmVuIHRoZSBgZGlzcGF0Y2hgIGFuZCBgZ2V0U3RhdGVgIGZ1bmN0aW9uc1xuICogYXMgbmFtZWQgYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IG1pZGRsZXdhcmVzIFRoZSBtaWRkbGV3YXJlIGNoYWluIHRvIGJlIGFwcGxpZWQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgc3RvcmUgZW5oYW5jZXIgYXBwbHlpbmcgdGhlIG1pZGRsZXdhcmUuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZSgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIG1pZGRsZXdhcmVzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgbWlkZGxld2FyZXNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGNyZWF0ZVN0b3JlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChyZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGVuaGFuY2VyKSB7XG4gICAgICB2YXIgc3RvcmUgPSBjcmVhdGVTdG9yZShyZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGVuaGFuY2VyKTtcbiAgICAgIHZhciBfZGlzcGF0Y2ggPSBzdG9yZS5kaXNwYXRjaDtcbiAgICAgIHZhciBjaGFpbiA9IFtdO1xuXG4gICAgICB2YXIgbWlkZGxld2FyZUFQSSA9IHtcbiAgICAgICAgZ2V0U3RhdGU6IHN0b3JlLmdldFN0YXRlLFxuICAgICAgICBkaXNwYXRjaDogZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIF9kaXNwYXRjaChhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2hhaW4gPSBtaWRkbGV3YXJlcy5tYXAoZnVuY3Rpb24gKG1pZGRsZXdhcmUpIHtcbiAgICAgICAgcmV0dXJuIG1pZGRsZXdhcmUobWlkZGxld2FyZUFQSSk7XG4gICAgICB9KTtcbiAgICAgIF9kaXNwYXRjaCA9IF9jb21wb3NlMltcImRlZmF1bHRcIl0uYXBwbHkodW5kZWZpbmVkLCBjaGFpbikoc3RvcmUuZGlzcGF0Y2gpO1xuXG4gICAgICByZXR1cm4gX2V4dGVuZHMoe30sIHN0b3JlLCB7XG4gICAgICAgIGRpc3BhdGNoOiBfZGlzcGF0Y2hcbiAgICAgIH0pO1xuICAgIH07XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBiaW5kQWN0aW9uQ3JlYXRvcnM7XG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9yLCBkaXNwYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkaXNwYXRjaChhY3Rpb25DcmVhdG9yLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbi8qKlxuICogVHVybnMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgYWN0aW9uIGNyZWF0b3JzLCBpbnRvIGFuIG9iamVjdCB3aXRoIHRoZVxuICogc2FtZSBrZXlzLCBidXQgd2l0aCBldmVyeSBmdW5jdGlvbiB3cmFwcGVkIGludG8gYSBgZGlzcGF0Y2hgIGNhbGwgc28gdGhleVxuICogbWF5IGJlIGludm9rZWQgZGlyZWN0bHkuIFRoaXMgaXMganVzdCBhIGNvbnZlbmllbmNlIG1ldGhvZCwgYXMgeW91IGNhbiBjYWxsXG4gKiBgc3RvcmUuZGlzcGF0Y2goTXlBY3Rpb25DcmVhdG9ycy5kb1NvbWV0aGluZygpKWAgeW91cnNlbGYganVzdCBmaW5lLlxuICpcbiAqIEZvciBjb252ZW5pZW5jZSwgeW91IGNhbiBhbHNvIHBhc3MgYSBzaW5nbGUgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50LFxuICogYW5kIGdldCBhIGZ1bmN0aW9uIGluIHJldHVybi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gYWN0aW9uQ3JlYXRvcnMgQW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgYWN0aW9uXG4gKiBjcmVhdG9yIGZ1bmN0aW9ucy4gT25lIGhhbmR5IHdheSB0byBvYnRhaW4gaXQgaXMgdG8gdXNlIEVTNiBgaW1wb3J0ICogYXNgXG4gKiBzeW50YXguIFlvdSBtYXkgYWxzbyBwYXNzIGEgc2luZ2xlIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGRpc3BhdGNoIFRoZSBgZGlzcGF0Y2hgIGZ1bmN0aW9uIGF2YWlsYWJsZSBvbiB5b3VyIFJlZHV4XG4gKiBzdG9yZS5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb258T2JqZWN0fSBUaGUgb2JqZWN0IG1pbWlja2luZyB0aGUgb3JpZ2luYWwgb2JqZWN0LCBidXQgd2l0aFxuICogZXZlcnkgYWN0aW9uIGNyZWF0b3Igd3JhcHBlZCBpbnRvIHRoZSBgZGlzcGF0Y2hgIGNhbGwuIElmIHlvdSBwYXNzZWQgYVxuICogZnVuY3Rpb24gYXMgYGFjdGlvbkNyZWF0b3JzYCwgdGhlIHJldHVybiB2YWx1ZSB3aWxsIGFsc28gYmUgYSBzaW5nbGVcbiAqIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcnMoYWN0aW9uQ3JlYXRvcnMsIGRpc3BhdGNoKSB7XG4gIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvcnMsIGRpc3BhdGNoKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvcnMgIT09ICdvYmplY3QnIHx8IGFjdGlvbkNyZWF0b3JzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWN0aW9uQ3JlYXRvcnMgZXhwZWN0ZWQgYW4gb2JqZWN0IG9yIGEgZnVuY3Rpb24sIGluc3RlYWQgcmVjZWl2ZWQgJyArIChhY3Rpb25DcmVhdG9ycyA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZiBhY3Rpb25DcmVhdG9ycykgKyAnLiAnICsgJ0RpZCB5b3Ugd3JpdGUgXCJpbXBvcnQgQWN0aW9uQ3JlYXRvcnMgZnJvbVwiIGluc3RlYWQgb2YgXCJpbXBvcnQgKiBhcyBBY3Rpb25DcmVhdG9ycyBmcm9tXCI/Jyk7XG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFjdGlvbkNyZWF0b3JzKTtcbiAgdmFyIGJvdW5kQWN0aW9uQ3JlYXRvcnMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgdmFyIGFjdGlvbkNyZWF0b3IgPSBhY3Rpb25DcmVhdG9yc1trZXldO1xuICAgIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYm91bmRBY3Rpb25DcmVhdG9yc1trZXldID0gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYm91bmRBY3Rpb25DcmVhdG9ycztcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNvbWJpbmVSZWR1Y2VycztcblxudmFyIF9jcmVhdGVTdG9yZSA9IHJlcXVpcmUoJy4vY3JlYXRlU3RvcmUnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoL2lzUGxhaW5PYmplY3QnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzUGxhaW5PYmplY3QpO1xuXG52YXIgX3dhcm5pbmcgPSByZXF1aXJlKCcuL3V0aWxzL3dhcm5pbmcnKTtcblxudmFyIF93YXJuaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dhcm5pbmcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gZ2V0VW5kZWZpbmVkU3RhdGVFcnJvck1lc3NhZ2Uoa2V5LCBhY3Rpb24pIHtcbiAgdmFyIGFjdGlvblR5cGUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGU7XG4gIHZhciBhY3Rpb25OYW1lID0gYWN0aW9uVHlwZSAmJiAnXCInICsgYWN0aW9uVHlwZS50b1N0cmluZygpICsgJ1wiJyB8fCAnYW4gYWN0aW9uJztcblxuICByZXR1cm4gJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCBoYW5kbGluZyAnICsgYWN0aW9uTmFtZSArICcuICcgKyAnVG8gaWdub3JlIGFuIGFjdGlvbiwgeW91IG11c3QgZXhwbGljaXRseSByZXR1cm4gdGhlIHByZXZpb3VzIHN0YXRlLic7XG59XG5cbmZ1bmN0aW9uIGdldFVuZXhwZWN0ZWRTdGF0ZVNoYXBlV2FybmluZ01lc3NhZ2UoaW5wdXRTdGF0ZSwgcmVkdWNlcnMsIGFjdGlvbikge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBhcmd1bWVudE5hbWUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGUgPT09IF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUID8gJ2luaXRpYWxTdGF0ZSBhcmd1bWVudCBwYXNzZWQgdG8gY3JlYXRlU3RvcmUnIDogJ3ByZXZpb3VzIHN0YXRlIHJlY2VpdmVkIGJ5IHRoZSByZWR1Y2VyJztcblxuICBpZiAocmVkdWNlcktleXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICdTdG9yZSBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgcmVkdWNlci4gTWFrZSBzdXJlIHRoZSBhcmd1bWVudCBwYXNzZWQgJyArICd0byBjb21iaW5lUmVkdWNlcnMgaXMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgcmVkdWNlcnMuJztcbiAgfVxuXG4gIGlmICghKDAsIF9pc1BsYWluT2JqZWN0MltcImRlZmF1bHRcIl0pKGlucHV0U3RhdGUpKSB7XG4gICAgcmV0dXJuICdUaGUgJyArIGFyZ3VtZW50TmFtZSArICcgaGFzIHVuZXhwZWN0ZWQgdHlwZSBvZiBcIicgKyB7fS50b1N0cmluZy5jYWxsKGlucHV0U3RhdGUpLm1hdGNoKC9cXHMoW2EtenxBLVpdKykvKVsxXSArICdcIi4gRXhwZWN0ZWQgYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyAnICsgKCdrZXlzOiBcIicgKyByZWR1Y2VyS2V5cy5qb2luKCdcIiwgXCInKSArICdcIicpO1xuICB9XG5cbiAgdmFyIHVuZXhwZWN0ZWRLZXlzID0gT2JqZWN0LmtleXMoaW5wdXRTdGF0ZSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gIXJlZHVjZXJzLmhhc093blByb3BlcnR5KGtleSk7XG4gIH0pO1xuXG4gIGlmICh1bmV4cGVjdGVkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuICdVbmV4cGVjdGVkICcgKyAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMSA/ICdrZXlzJyA6ICdrZXknKSArICcgJyArICgnXCInICsgdW5leHBlY3RlZEtleXMuam9pbignXCIsIFwiJykgKyAnXCIgZm91bmQgaW4gJyArIGFyZ3VtZW50TmFtZSArICcuICcpICsgJ0V4cGVjdGVkIHRvIGZpbmQgb25lIG9mIHRoZSBrbm93biByZWR1Y2VyIGtleXMgaW5zdGVhZDogJyArICgnXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCIuIFVuZXhwZWN0ZWQga2V5cyB3aWxsIGJlIGlnbm9yZWQuJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0UmVkdWNlclNhbml0eShyZWR1Y2Vycykge1xuICBPYmplY3Qua2V5cyhyZWR1Y2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHJlZHVjZXIgPSByZWR1Y2Vyc1trZXldO1xuICAgIHZhciBpbml0aWFsU3RhdGUgPSByZWR1Y2VyKHVuZGVmaW5lZCwgeyB0eXBlOiBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCB9KTtcblxuICAgIGlmICh0eXBlb2YgaW5pdGlhbFN0YXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgZHVyaW5nIGluaXRpYWxpemF0aW9uLiAnICsgJ0lmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlIHJlZHVjZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCAnICsgJ2V4cGxpY2l0bHkgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgJyArICdub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgIH1cblxuICAgIHZhciB0eXBlID0gJ0BAcmVkdXgvUFJPQkVfVU5LTk9XTl9BQ1RJT05fJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KS5zcGxpdCgnJykuam9pbignLicpO1xuICAgIGlmICh0eXBlb2YgcmVkdWNlcih1bmRlZmluZWQsIHsgdHlwZTogdHlwZSB9KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIHdoZW4gcHJvYmVkIHdpdGggYSByYW5kb20gdHlwZS4gJyArICgnRG9uXFwndCB0cnkgdG8gaGFuZGxlICcgKyBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCArICcgb3Igb3RoZXIgYWN0aW9ucyBpbiBcInJlZHV4LypcIiAnKSArICduYW1lc3BhY2UuIFRoZXkgYXJlIGNvbnNpZGVyZWQgcHJpdmF0ZS4gSW5zdGVhZCwgeW91IG11c3QgcmV0dXJuIHRoZSAnICsgJ2N1cnJlbnQgc3RhdGUgZm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHVubGVzcyBpdCBpcyB1bmRlZmluZWQsICcgKyAnaW4gd2hpY2ggY2FzZSB5b3UgbXVzdCByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUsIHJlZ2FyZGxlc3Mgb2YgdGhlICcgKyAnYWN0aW9uIHR5cGUuIFRoZSBpbml0aWFsIHN0YXRlIG1heSBub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVHVybnMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgZGlmZmVyZW50IHJlZHVjZXIgZnVuY3Rpb25zLCBpbnRvIGEgc2luZ2xlXG4gKiByZWR1Y2VyIGZ1bmN0aW9uLiBJdCB3aWxsIGNhbGwgZXZlcnkgY2hpbGQgcmVkdWNlciwgYW5kIGdhdGhlciB0aGVpciByZXN1bHRzXG4gKiBpbnRvIGEgc2luZ2xlIHN0YXRlIG9iamVjdCwgd2hvc2Uga2V5cyBjb3JyZXNwb25kIHRvIHRoZSBrZXlzIG9mIHRoZSBwYXNzZWRcbiAqIHJlZHVjZXIgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZWR1Y2VycyBBbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGNvcnJlc3BvbmQgdG8gZGlmZmVyZW50XG4gKiByZWR1Y2VyIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmUgY29tYmluZWQgaW50byBvbmUuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluXG4gKiBpdCBpcyB0byB1c2UgRVM2IGBpbXBvcnQgKiBhcyByZWR1Y2Vyc2Agc3ludGF4LiBUaGUgcmVkdWNlcnMgbWF5IG5ldmVyIHJldHVyblxuICogdW5kZWZpbmVkIGZvciBhbnkgYWN0aW9uLiBJbnN0ZWFkLCB0aGV5IHNob3VsZCByZXR1cm4gdGhlaXIgaW5pdGlhbCBzdGF0ZVxuICogaWYgdGhlIHN0YXRlIHBhc3NlZCB0byB0aGVtIHdhcyB1bmRlZmluZWQsIGFuZCB0aGUgY3VycmVudCBzdGF0ZSBmb3IgYW55XG4gKiB1bnJlY29nbml6ZWQgYWN0aW9uLlxuICpcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSByZWR1Y2VyIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBldmVyeSByZWR1Y2VyIGluc2lkZSB0aGVcbiAqIHBhc3NlZCBvYmplY3QsIGFuZCBidWlsZHMgYSBzdGF0ZSBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzaGFwZS5cbiAqL1xuZnVuY3Rpb24gY29tYmluZVJlZHVjZXJzKHJlZHVjZXJzKSB7XG4gIHZhciByZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKHJlZHVjZXJzKTtcbiAgdmFyIGZpbmFsUmVkdWNlcnMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWR1Y2VyS2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSByZWR1Y2VyS2V5c1tpXTtcbiAgICBpZiAodHlwZW9mIHJlZHVjZXJzW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZpbmFsUmVkdWNlcnNba2V5XSA9IHJlZHVjZXJzW2tleV07XG4gICAgfVxuICB9XG4gIHZhciBmaW5hbFJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMoZmluYWxSZWR1Y2Vycyk7XG5cbiAgdmFyIHNhbml0eUVycm9yO1xuICB0cnkge1xuICAgIGFzc2VydFJlZHVjZXJTYW5pdHkoZmluYWxSZWR1Y2Vycyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzYW5pdHlFcnJvciA9IGU7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gY29tYmluYXRpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50c1sxXTtcblxuICAgIGlmIChzYW5pdHlFcnJvcikge1xuICAgICAgdGhyb3cgc2FuaXR5RXJyb3I7XG4gICAgfVxuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIHZhciB3YXJuaW5nTWVzc2FnZSA9IGdldFVuZXhwZWN0ZWRTdGF0ZVNoYXBlV2FybmluZ01lc3NhZ2Uoc3RhdGUsIGZpbmFsUmVkdWNlcnMsIGFjdGlvbik7XG4gICAgICBpZiAod2FybmluZ01lc3NhZ2UpIHtcbiAgICAgICAgKDAsIF93YXJuaW5nMltcImRlZmF1bHRcIl0pKHdhcm5pbmdNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaGFzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHZhciBuZXh0U3RhdGUgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbmFsUmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBmaW5hbFJlZHVjZXJLZXlzW2ldO1xuICAgICAgdmFyIHJlZHVjZXIgPSBmaW5hbFJlZHVjZXJzW2tleV07XG4gICAgICB2YXIgcHJldmlvdXNTdGF0ZUZvcktleSA9IHN0YXRlW2tleV07XG4gICAgICB2YXIgbmV4dFN0YXRlRm9yS2V5ID0gcmVkdWNlcihwcmV2aW91c1N0YXRlRm9yS2V5LCBhY3Rpb24pO1xuICAgICAgaWYgKHR5cGVvZiBuZXh0U3RhdGVGb3JLZXkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSBnZXRVbmRlZmluZWRTdGF0ZUVycm9yTWVzc2FnZShrZXksIGFjdGlvbik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgbmV4dFN0YXRlW2tleV0gPSBuZXh0U3RhdGVGb3JLZXk7XG4gICAgICBoYXNDaGFuZ2VkID0gaGFzQ2hhbmdlZCB8fCBuZXh0U3RhdGVGb3JLZXkgIT09IHByZXZpb3VzU3RhdGVGb3JLZXk7XG4gICAgfVxuICAgIHJldHVybiBoYXNDaGFuZ2VkID8gbmV4dFN0YXRlIDogc3RhdGU7XG4gIH07XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNvbXBvc2U7XG4vKipcbiAqIENvbXBvc2VzIHNpbmdsZS1hcmd1bWVudCBmdW5jdGlvbnMgZnJvbSByaWdodCB0byBsZWZ0LlxuICpcbiAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IGZ1bmNzIFRoZSBmdW5jdGlvbnMgdG8gY29tcG9zZS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiBvYnRhaW5lZCBieSBjb21wb3NpbmcgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG9cbiAqIGxlZnQuIEZvciBleGFtcGxlLCBjb21wb3NlKGYsIGcsIGgpIGlzIGlkZW50aWNhbCB0byBhcmcgPT4gZihnKGgoYXJnKSkpLlxuICovXG5mdW5jdGlvbiBjb21wb3NlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZnVuY3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBmdW5jc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPD0gMCA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1swXTtcbiAgICB9XG5cbiAgICB2YXIgbGFzdCA9IGZ1bmNzW2Z1bmNzLmxlbmd0aCAtIDFdO1xuICAgIHZhciByZXN0ID0gZnVuY3Muc2xpY2UoMCwgLTEpO1xuXG4gICAgcmV0dXJuIHJlc3QucmVkdWNlUmlnaHQoZnVuY3Rpb24gKGNvbXBvc2VkLCBmKSB7XG4gICAgICByZXR1cm4gZihjb21wb3NlZCk7XG4gICAgfSwgbGFzdC5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuQWN0aW9uVHlwZXMgPSB1bmRlZmluZWQ7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNyZWF0ZVN0b3JlO1xuXG52YXIgX2lzUGxhaW5PYmplY3QgPSByZXF1aXJlKCdsb2Rhc2gvaXNQbGFpbk9iamVjdCcpO1xuXG52YXIgX2lzUGxhaW5PYmplY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNQbGFpbk9iamVjdCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKipcbiAqIFRoZXNlIGFyZSBwcml2YXRlIGFjdGlvbiB0eXBlcyByZXNlcnZlZCBieSBSZWR1eC5cbiAqIEZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB5b3UgbXVzdCByZXR1cm4gdGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBJZiB0aGUgY3VycmVudCBzdGF0ZSBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS5cbiAqIERvIG5vdCByZWZlcmVuY2UgdGhlc2UgYWN0aW9uIHR5cGVzIGRpcmVjdGx5IGluIHlvdXIgY29kZS5cbiAqL1xudmFyIEFjdGlvblR5cGVzID0gZXhwb3J0cy5BY3Rpb25UeXBlcyA9IHtcbiAgSU5JVDogJ0BAcmVkdXgvSU5JVCdcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIFJlZHV4IHN0b3JlIHRoYXQgaG9sZHMgdGhlIHN0YXRlIHRyZWUuXG4gKiBUaGUgb25seSB3YXkgdG8gY2hhbmdlIHRoZSBkYXRhIGluIHRoZSBzdG9yZSBpcyB0byBjYWxsIGBkaXNwYXRjaCgpYCBvbiBpdC5cbiAqXG4gKiBUaGVyZSBzaG91bGQgb25seSBiZSBhIHNpbmdsZSBzdG9yZSBpbiB5b3VyIGFwcC4gVG8gc3BlY2lmeSBob3cgZGlmZmVyZW50XG4gKiBwYXJ0cyBvZiB0aGUgc3RhdGUgdHJlZSByZXNwb25kIHRvIGFjdGlvbnMsIHlvdSBtYXkgY29tYmluZSBzZXZlcmFsIHJlZHVjZXJzXG4gKiBpbnRvIGEgc2luZ2xlIHJlZHVjZXIgZnVuY3Rpb24gYnkgdXNpbmcgYGNvbWJpbmVSZWR1Y2Vyc2AuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVkdWNlciBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgbmV4dCBzdGF0ZSB0cmVlLCBnaXZlblxuICogdGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGFjdGlvbiB0byBoYW5kbGUuXG4gKlxuICogQHBhcmFtIHthbnl9IFtpbml0aWFsU3RhdGVdIFRoZSBpbml0aWFsIHN0YXRlLiBZb3UgbWF5IG9wdGlvbmFsbHkgc3BlY2lmeSBpdFxuICogdG8gaHlkcmF0ZSB0aGUgc3RhdGUgZnJvbSB0aGUgc2VydmVyIGluIHVuaXZlcnNhbCBhcHBzLCBvciB0byByZXN0b3JlIGFcbiAqIHByZXZpb3VzbHkgc2VyaWFsaXplZCB1c2VyIHNlc3Npb24uXG4gKiBJZiB5b3UgdXNlIGBjb21iaW5lUmVkdWNlcnNgIHRvIHByb2R1Y2UgdGhlIHJvb3QgcmVkdWNlciBmdW5jdGlvbiwgdGhpcyBtdXN0IGJlXG4gKiBhbiBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzaGFwZSBhcyBgY29tYmluZVJlZHVjZXJzYCBrZXlzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVuaGFuY2VyIFRoZSBzdG9yZSBlbmhhbmNlci4gWW91IG1heSBvcHRpb25hbGx5IHNwZWNpZnkgaXRcbiAqIHRvIGVuaGFuY2UgdGhlIHN0b3JlIHdpdGggdGhpcmQtcGFydHkgY2FwYWJpbGl0aWVzIHN1Y2ggYXMgbWlkZGxld2FyZSxcbiAqIHRpbWUgdHJhdmVsLCBwZXJzaXN0ZW5jZSwgZXRjLiBUaGUgb25seSBzdG9yZSBlbmhhbmNlciB0aGF0IHNoaXBzIHdpdGggUmVkdXhcbiAqIGlzIGBhcHBseU1pZGRsZXdhcmUoKWAuXG4gKlxuICogQHJldHVybnMge1N0b3JlfSBBIFJlZHV4IHN0b3JlIHRoYXQgbGV0cyB5b3UgcmVhZCB0aGUgc3RhdGUsIGRpc3BhdGNoIGFjdGlvbnNcbiAqIGFuZCBzdWJzY3JpYmUgdG8gY2hhbmdlcy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU3RvcmUocmVkdWNlciwgaW5pdGlhbFN0YXRlLCBlbmhhbmNlcikge1xuICBpZiAodHlwZW9mIGluaXRpYWxTdGF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZW5oYW5jZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZW5oYW5jZXIgPSBpbml0aWFsU3RhdGU7XG4gICAgaW5pdGlhbFN0YXRlID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBlbmhhbmNlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIGVuaGFuY2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSBlbmhhbmNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHJldHVybiBlbmhhbmNlcihjcmVhdGVTdG9yZSkocmVkdWNlciwgaW5pdGlhbFN0YXRlKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcmVkdWNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIHJlZHVjZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciBjdXJyZW50UmVkdWNlciA9IHJlZHVjZXI7XG4gIHZhciBjdXJyZW50U3RhdGUgPSBpbml0aWFsU3RhdGU7XG4gIHZhciBjdXJyZW50TGlzdGVuZXJzID0gW107XG4gIHZhciBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycztcbiAgdmFyIGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCkge1xuICAgIGlmIChuZXh0TGlzdGVuZXJzID09PSBjdXJyZW50TGlzdGVuZXJzKSB7XG4gICAgICBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycy5zbGljZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyB0aGUgc3RhdGUgdHJlZSBtYW5hZ2VkIGJ5IHRoZSBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybnMge2FueX0gVGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgY2hhbmdlIGxpc3RlbmVyLiBJdCB3aWxsIGJlIGNhbGxlZCBhbnkgdGltZSBhbiBhY3Rpb24gaXMgZGlzcGF0Y2hlZCxcbiAgICogYW5kIHNvbWUgcGFydCBvZiB0aGUgc3RhdGUgdHJlZSBtYXkgcG90ZW50aWFsbHkgaGF2ZSBjaGFuZ2VkLiBZb3UgbWF5IHRoZW5cbiAgICogY2FsbCBgZ2V0U3RhdGUoKWAgdG8gcmVhZCB0aGUgY3VycmVudCBzdGF0ZSB0cmVlIGluc2lkZSB0aGUgY2FsbGJhY2suXG4gICAqXG4gICAqIFlvdSBtYXkgY2FsbCBgZGlzcGF0Y2goKWAgZnJvbSBhIGNoYW5nZSBsaXN0ZW5lciwgd2l0aCB0aGUgZm9sbG93aW5nXG4gICAqIGNhdmVhdHM6XG4gICAqXG4gICAqIDEuIFRoZSBzdWJzY3JpcHRpb25zIGFyZSBzbmFwc2hvdHRlZCBqdXN0IGJlZm9yZSBldmVyeSBgZGlzcGF0Y2goKWAgY2FsbC5cbiAgICogSWYgeW91IHN1YnNjcmliZSBvciB1bnN1YnNjcmliZSB3aGlsZSB0aGUgbGlzdGVuZXJzIGFyZSBiZWluZyBpbnZva2VkLCB0aGlzXG4gICAqIHdpbGwgbm90IGhhdmUgYW55IGVmZmVjdCBvbiB0aGUgYGRpc3BhdGNoKClgIHRoYXQgaXMgY3VycmVudGx5IGluIHByb2dyZXNzLlxuICAgKiBIb3dldmVyLCB0aGUgbmV4dCBgZGlzcGF0Y2goKWAgY2FsbCwgd2hldGhlciBuZXN0ZWQgb3Igbm90LCB3aWxsIHVzZSBhIG1vcmVcbiAgICogcmVjZW50IHNuYXBzaG90IG9mIHRoZSBzdWJzY3JpcHRpb24gbGlzdC5cbiAgICpcbiAgICogMi4gVGhlIGxpc3RlbmVyIHNob3VsZCBub3QgZXhwZWN0IHRvIHNlZSBhbGwgc3RhdGVzIGNoYW5nZXMsIGFzIHRoZSBzdGF0ZVxuICAgKiBtaWdodCBoYXZlIGJlZW4gdXBkYXRlZCBtdWx0aXBsZSB0aW1lcyBkdXJpbmcgYSBuZXN0ZWQgYGRpc3BhdGNoKClgIGJlZm9yZVxuICAgKiB0aGUgbGlzdGVuZXIgaXMgY2FsbGVkLiBJdCBpcywgaG93ZXZlciwgZ3VhcmFudGVlZCB0aGF0IGFsbCBzdWJzY3JpYmVyc1xuICAgKiByZWdpc3RlcmVkIGJlZm9yZSB0aGUgYGRpc3BhdGNoKClgIHN0YXJ0ZWQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgbGF0ZXN0XG4gICAqIHN0YXRlIGJ5IHRoZSB0aW1lIGl0IGV4aXRzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBBIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgb24gZXZlcnkgZGlzcGF0Y2guXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiB0byByZW1vdmUgdGhpcyBjaGFuZ2UgbGlzdGVuZXIuXG4gICAqL1xuICBmdW5jdGlvbiBzdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGxpc3RlbmVyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgdmFyIGlzU3Vic2NyaWJlZCA9IHRydWU7XG5cbiAgICBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCk7XG4gICAgbmV4dExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiB1bnN1YnNjcmliZSgpIHtcbiAgICAgIGlmICghaXNTdWJzY3JpYmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaXNTdWJzY3JpYmVkID0gZmFsc2U7XG5cbiAgICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICAgIHZhciBpbmRleCA9IG5leHRMaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICBuZXh0TGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGFuIGFjdGlvbi4gSXQgaXMgdGhlIG9ubHkgd2F5IHRvIHRyaWdnZXIgYSBzdGF0ZSBjaGFuZ2UuXG4gICAqXG4gICAqIFRoZSBgcmVkdWNlcmAgZnVuY3Rpb24sIHVzZWQgdG8gY3JlYXRlIHRoZSBzdG9yZSwgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGVcbiAgICogY3VycmVudCBzdGF0ZSB0cmVlIGFuZCB0aGUgZ2l2ZW4gYGFjdGlvbmAuIEl0cyByZXR1cm4gdmFsdWUgd2lsbFxuICAgKiBiZSBjb25zaWRlcmVkIHRoZSAqKm5leHQqKiBzdGF0ZSBvZiB0aGUgdHJlZSwgYW5kIHRoZSBjaGFuZ2UgbGlzdGVuZXJzXG4gICAqIHdpbGwgYmUgbm90aWZpZWQuXG4gICAqXG4gICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9ubHkgc3VwcG9ydHMgcGxhaW4gb2JqZWN0IGFjdGlvbnMuIElmIHlvdSB3YW50IHRvXG4gICAqIGRpc3BhdGNoIGEgUHJvbWlzZSwgYW4gT2JzZXJ2YWJsZSwgYSB0aHVuaywgb3Igc29tZXRoaW5nIGVsc2UsIHlvdSBuZWVkIHRvXG4gICAqIHdyYXAgeW91ciBzdG9yZSBjcmVhdGluZyBmdW5jdGlvbiBpbnRvIHRoZSBjb3JyZXNwb25kaW5nIG1pZGRsZXdhcmUuIEZvclxuICAgKiBleGFtcGxlLCBzZWUgdGhlIGRvY3VtZW50YXRpb24gZm9yIHRoZSBgcmVkdXgtdGh1bmtgIHBhY2thZ2UuIEV2ZW4gdGhlXG4gICAqIG1pZGRsZXdhcmUgd2lsbCBldmVudHVhbGx5IGRpc3BhdGNoIHBsYWluIG9iamVjdCBhY3Rpb25zIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uIEEgcGxhaW4gb2JqZWN0IHJlcHJlc2VudGluZyDigJx3aGF0IGNoYW5nZWTigJ0uIEl0IGlzXG4gICAqIGEgZ29vZCBpZGVhIHRvIGtlZXAgYWN0aW9ucyBzZXJpYWxpemFibGUgc28geW91IGNhbiByZWNvcmQgYW5kIHJlcGxheSB1c2VyXG4gICAqIHNlc3Npb25zLCBvciB1c2UgdGhlIHRpbWUgdHJhdmVsbGluZyBgcmVkdXgtZGV2dG9vbHNgLiBBbiBhY3Rpb24gbXVzdCBoYXZlXG4gICAqIGEgYHR5cGVgIHByb3BlcnR5IHdoaWNoIG1heSBub3QgYmUgYHVuZGVmaW5lZGAuIEl0IGlzIGEgZ29vZCBpZGVhIHRvIHVzZVxuICAgKiBzdHJpbmcgY29uc3RhbnRzIGZvciBhY3Rpb24gdHlwZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IEZvciBjb252ZW5pZW5jZSwgdGhlIHNhbWUgYWN0aW9uIG9iamVjdCB5b3UgZGlzcGF0Y2hlZC5cbiAgICpcbiAgICogTm90ZSB0aGF0LCBpZiB5b3UgdXNlIGEgY3VzdG9tIG1pZGRsZXdhcmUsIGl0IG1heSB3cmFwIGBkaXNwYXRjaCgpYCB0b1xuICAgKiByZXR1cm4gc29tZXRoaW5nIGVsc2UgKGZvciBleGFtcGxlLCBhIFByb21pc2UgeW91IGNhbiBhd2FpdCkuXG4gICAqL1xuICBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICBpZiAoISgwLCBfaXNQbGFpbk9iamVjdDJbXCJkZWZhdWx0XCJdKShhY3Rpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGlvbnMgbXVzdCBiZSBwbGFpbiBvYmplY3RzLiAnICsgJ1VzZSBjdXN0b20gbWlkZGxld2FyZSBmb3IgYXN5bmMgYWN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFjdGlvbi50eXBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3Rpb25zIG1heSBub3QgaGF2ZSBhbiB1bmRlZmluZWQgXCJ0eXBlXCIgcHJvcGVydHkuICcgKyAnSGF2ZSB5b3UgbWlzc3BlbGxlZCBhIGNvbnN0YW50PycpO1xuICAgIH1cblxuICAgIGlmIChpc0Rpc3BhdGNoaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXJzIG1heSBub3QgZGlzcGF0Y2ggYWN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IHRydWU7XG4gICAgICBjdXJyZW50U3RhdGUgPSBjdXJyZW50UmVkdWNlcihjdXJyZW50U3RhdGUsIGFjdGlvbik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycyA9IG5leHRMaXN0ZW5lcnM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXSgpO1xuICAgIH1cblxuICAgIHJldHVybiBhY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIHJlZHVjZXIgY3VycmVudGx5IHVzZWQgYnkgdGhlIHN0b3JlIHRvIGNhbGN1bGF0ZSB0aGUgc3RhdGUuXG4gICAqXG4gICAqIFlvdSBtaWdodCBuZWVkIHRoaXMgaWYgeW91ciBhcHAgaW1wbGVtZW50cyBjb2RlIHNwbGl0dGluZyBhbmQgeW91IHdhbnQgdG9cbiAgICogbG9hZCBzb21lIG9mIHRoZSByZWR1Y2VycyBkeW5hbWljYWxseS4gWW91IG1pZ2h0IGFsc28gbmVlZCB0aGlzIGlmIHlvdVxuICAgKiBpbXBsZW1lbnQgYSBob3QgcmVsb2FkaW5nIG1lY2hhbmlzbSBmb3IgUmVkdXguXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHRSZWR1Y2VyIFRoZSByZWR1Y2VyIGZvciB0aGUgc3RvcmUgdG8gdXNlIGluc3RlYWQuXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgZnVuY3Rpb24gcmVwbGFjZVJlZHVjZXIobmV4dFJlZHVjZXIpIHtcbiAgICBpZiAodHlwZW9mIG5leHRSZWR1Y2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSBuZXh0UmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIGN1cnJlbnRSZWR1Y2VyID0gbmV4dFJlZHVjZXI7XG4gICAgZGlzcGF0Y2goeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuICB9XG5cbiAgLy8gV2hlbiBhIHN0b3JlIGlzIGNyZWF0ZWQsIGFuIFwiSU5JVFwiIGFjdGlvbiBpcyBkaXNwYXRjaGVkIHNvIHRoYXQgZXZlcnlcbiAgLy8gcmVkdWNlciByZXR1cm5zIHRoZWlyIGluaXRpYWwgc3RhdGUuIFRoaXMgZWZmZWN0aXZlbHkgcG9wdWxhdGVzXG4gIC8vIHRoZSBpbml0aWFsIHN0YXRlIHRyZWUuXG4gIGRpc3BhdGNoKHsgdHlwZTogQWN0aW9uVHlwZXMuSU5JVCB9KTtcblxuICByZXR1cm4ge1xuICAgIGRpc3BhdGNoOiBkaXNwYXRjaCxcbiAgICBzdWJzY3JpYmU6IHN1YnNjcmliZSxcbiAgICBnZXRTdGF0ZTogZ2V0U3RhdGUsXG4gICAgcmVwbGFjZVJlZHVjZXI6IHJlcGxhY2VSZWR1Y2VyXG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5jb21wb3NlID0gZXhwb3J0cy5hcHBseU1pZGRsZXdhcmUgPSBleHBvcnRzLmJpbmRBY3Rpb25DcmVhdG9ycyA9IGV4cG9ydHMuY29tYmluZVJlZHVjZXJzID0gZXhwb3J0cy5jcmVhdGVTdG9yZSA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVTdG9yZSA9IHJlcXVpcmUoJy4vY3JlYXRlU3RvcmUnKTtcblxudmFyIF9jcmVhdGVTdG9yZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jcmVhdGVTdG9yZSk7XG5cbnZhciBfY29tYmluZVJlZHVjZXJzID0gcmVxdWlyZSgnLi9jb21iaW5lUmVkdWNlcnMnKTtcblxudmFyIF9jb21iaW5lUmVkdWNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tYmluZVJlZHVjZXJzKTtcblxudmFyIF9iaW5kQWN0aW9uQ3JlYXRvcnMgPSByZXF1aXJlKCcuL2JpbmRBY3Rpb25DcmVhdG9ycycpO1xuXG52YXIgX2JpbmRBY3Rpb25DcmVhdG9yczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9iaW5kQWN0aW9uQ3JlYXRvcnMpO1xuXG52YXIgX2FwcGx5TWlkZGxld2FyZSA9IHJlcXVpcmUoJy4vYXBwbHlNaWRkbGV3YXJlJyk7XG5cbnZhciBfYXBwbHlNaWRkbGV3YXJlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwcGx5TWlkZGxld2FyZSk7XG5cbnZhciBfY29tcG9zZSA9IHJlcXVpcmUoJy4vY29tcG9zZScpO1xuXG52YXIgX2NvbXBvc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zZSk7XG5cbnZhciBfd2FybmluZyA9IHJlcXVpcmUoJy4vdXRpbHMvd2FybmluZycpO1xuXG52YXIgX3dhcm5pbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2FybmluZyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKlxuKiBUaGlzIGlzIGEgZHVtbXkgZnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGZ1bmN0aW9uIG5hbWUgaGFzIGJlZW4gYWx0ZXJlZCBieSBtaW5pZmljYXRpb24uXG4qIElmIHRoZSBmdW5jdGlvbiBoYXMgYmVlbiBtaW5pZmllZCBhbmQgTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJywgd2FybiB0aGUgdXNlci5cbiovXG5mdW5jdGlvbiBpc0NydXNoZWQoKSB7fVxuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB0eXBlb2YgaXNDcnVzaGVkLm5hbWUgPT09ICdzdHJpbmcnICYmIGlzQ3J1c2hlZC5uYW1lICE9PSAnaXNDcnVzaGVkJykge1xuICAoMCwgX3dhcm5pbmcyW1wiZGVmYXVsdFwiXSkoJ1lvdSBhcmUgY3VycmVudGx5IHVzaW5nIG1pbmlmaWVkIGNvZGUgb3V0c2lkZSBvZiBOT0RFX0VOViA9PT0gXFwncHJvZHVjdGlvblxcJy4gJyArICdUaGlzIG1lYW5zIHRoYXQgeW91IGFyZSBydW5uaW5nIGEgc2xvd2VyIGRldmVsb3BtZW50IGJ1aWxkIG9mIFJlZHV4LiAnICsgJ1lvdSBjYW4gdXNlIGxvb3NlLWVudmlmeSAoaHR0cHM6Ly9naXRodWIuY29tL3plcnRvc2gvbG9vc2UtZW52aWZ5KSBmb3IgYnJvd3NlcmlmeSAnICsgJ29yIERlZmluZVBsdWdpbiBmb3Igd2VicGFjayAoaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMDAzMDAzMSkgJyArICd0byBlbnN1cmUgeW91IGhhdmUgdGhlIGNvcnJlY3QgY29kZSBmb3IgeW91ciBwcm9kdWN0aW9uIGJ1aWxkLicpO1xufVxuXG5leHBvcnRzLmNyZWF0ZVN0b3JlID0gX2NyZWF0ZVN0b3JlMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmNvbWJpbmVSZWR1Y2VycyA9IF9jb21iaW5lUmVkdWNlcnMyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuYmluZEFjdGlvbkNyZWF0b3JzID0gX2JpbmRBY3Rpb25DcmVhdG9yczJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5hcHBseU1pZGRsZXdhcmUgPSBfYXBwbHlNaWRkbGV3YXJlMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmNvbXBvc2UgPSBfY29tcG9zZTJbXCJkZWZhdWx0XCJdOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gd2FybmluZztcbi8qKlxuICogUHJpbnRzIGEgd2FybmluZyBpbiB0aGUgY29uc29sZSBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIHdhcm5pbmcgbWVzc2FnZS5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiB3YXJuaW5nKG1lc3NhZ2UpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgdHJ5IHtcbiAgICAvLyBUaGlzIGVycm9yIHdhcyB0aHJvd24gYXMgYSBjb252ZW5pZW5jZSBzbyB0aGF0IHlvdSBjYW4gdXNlIHRoaXMgc3RhY2tcbiAgICAvLyB0byBmaW5kIHRoZSBjYWxsc2l0ZSB0aGF0IGNhdXNlZCB0aGlzIHdhcm5pbmcgdG8gZmlyZS5cbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tZW1wdHkgKi9cbiAgfSBjYXRjaCAoZSkge31cbiAgLyogZXNsaW50LWVuYWJsZSBuby1lbXB0eSAqL1xufSIsImV4cG9ydCBjb25zdCBBRERfTUlESV9OT1RFUyA9ICdhZGRfbWlkaV9ub3RlcydcbmV4cG9ydCBjb25zdCBBRERfTUlESV9FVkVOVFMgPSAnYWRkX21pZGlfZXZlbnRzJ1xuLy9leHBvcnQgY29uc3QgQUREX1RSQUNLID0gJ2FkZF90cmFjaydcbi8vZXhwb3J0IGNvbnN0IEFERF9QQVJUID0gJ2FkZF9wYXJ0J1xuXG5leHBvcnQgY29uc3QgQ1JFQVRFX1RSQUNLID0gJ2NyZWF0ZV90cmFjaydcbmV4cG9ydCBjb25zdCBBRERfUEFSVFMgPSAnYWRkX3BhcnRzJ1xuZXhwb3J0IGNvbnN0IEFERF9UUkFDS1MgPSAnYWRkX3RyYWNrcydcblxuZXhwb3J0IGNvbnN0IENSRUFURV9QQVJUID0gJ2NyZWF0ZV9wYXJ0J1xuZXhwb3J0IGNvbnN0IEFERF9USU1FX0VWRU5UUyA9ICdhZGRfdGltZV9ldmVudHMnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfU09ORyA9ICdjcmVhdGVfc29uZydcbmV4cG9ydCBjb25zdCBBRERfTUlESV9FVkVOVFNfVE9fU09ORyA9ICdhZGRfbWlkaV9ldmVudHNfdG9fc29uZydcblxuZXhwb3J0IGNvbnN0IENSRUFURV9NSURJX0VWRU5UID0gJ2NyZWF0ZV9taWRpX2V2ZW50J1xuZXhwb3J0IGNvbnN0IENSRUFURV9NSURJX05PVEUgPSAnY3JlYXRlX21pZGlfbm90ZSdcbmV4cG9ydCBjb25zdCBBRERfRVZFTlRTX1RPX1NPTkcgPSAnYWRkX2V2ZW50c190b19zb25nJ1xuZXhwb3J0IGNvbnN0IFVQREFURV9NSURJX0VWRU5UID0gJ3VwZGF0ZV9taWRpX2V2ZW50J1xuZXhwb3J0IGNvbnN0IFVQREFURV9NSURJX05PVEUgPSAndXBkYXRlX21pZGlfbm90ZSdcblxuXG4iLCJpbXBvcnQge2NyZWF0ZVN0b3JlLCBhcHBseU1pZGRsZXdhcmUsIGNvbXBvc2V9IGZyb20gJ3JlZHV4J1xuaW1wb3J0IHRodW5rIGZyb20gJ3JlZHV4LXRodW5rJztcbmltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAncmVkdXgtbG9nZ2VyJztcbmltcG9ydCBzZXF1ZW5jZXJBcHAgZnJvbSAnLi9yZWR1Y2VyJ1xuXG5jb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoKTtcbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoc2VxdWVuY2VyQXBwLCB7fSwgY29tcG9zZShcbiAgLy9hcHBseU1pZGRsZXdhcmUobG9nZ2VyKSxcbiAgdHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHdpbmRvdy5kZXZUb29sc0V4dGVuc2lvbiAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZGV2VG9vbHNFeHRlbnNpb24oKSA6IGYgPT4gZlxuKSk7XG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RvcmUoKXtcbiAgcmV0dXJuIHN0b3JlXG59XG5cblxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge3VwZGF0ZU1JRElOb3RlfSBmcm9tICcuL21pZGlfbm90ZSdcbmltcG9ydCB7XG4gIENSRUFURV9NSURJX0VWRU5ULFxuICBVUERBVEVfTUlESV9FVkVOVCxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IG1pZGlFdmVudEluZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTUlESUV2ZW50KHRpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlciA9IC0xKXtcbiAgbGV0IGlkID0gYE1FXyR7bWlkaUV2ZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfTUlESV9FVkVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpY2tzLFxuICAgICAgdHlwZSxcbiAgICAgIGRhdGExLFxuICAgICAgZGF0YTJcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZU1JRElFdmVudChpZDogc3RyaW5nLCB0aWNrc190b19tb3ZlOiBudW1iZXIpe1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLnNlcXVlbmNlclxuICBsZXQgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2lkXVxuICBsZXQgdGlja3MgPSBldmVudC50aWNrcyArIHRpY2tzX3RvX21vdmVcbiAgdGlja3MgPSB0aWNrcyA8IDAgPyAwIDogdGlja3NcbiAgLy9jb25zb2xlLmxvZyh0aWNrcywgZXZlbnQudGlja3MpXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBVUERBVEVfTUlESV9FVkVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpY2tzLFxuICAgIH1cbiAgfSlcbiAgLy8gaWYgdGhlIGV2ZW50IGlzIHBhcnQgb2YgYSBtaWRpIG5vdGUsIHVwZGF0ZSBpdFxuICBsZXQgbm90ZV9pZCA9IGV2ZW50Lm5vdGVcbiAgaWYobm90ZV9pZCl7XG4gICAgdXBkYXRlTUlESU5vdGUobm90ZV9pZCwgc3RhdGUpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVNSURJRXZlbnRUbyhpZDogc3RyaW5nLCB0aWNrczogbnVtYmVyKXtcbiAgbGV0IHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKS5zZXF1ZW5jZXJcbiAgbGV0IGV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tpZF1cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFVQREFURV9NSURJX0VWRU5ULFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgdGlja3MsXG4gICAgfVxuICB9KVxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb25zb2xlLmVycm9yKCdldmVudCBpcyB1bmRlZmluZWQnKSAvL3RoaXMgc2hvdWxkJ3QgaGFwcGVuIVxuICB9XG4gIC8vIGlmIHRoZSBldmVudCBpcyBwYXJ0IG9mIGEgbWlkaSBub3RlLCB1cGRhdGUgaXRcbiAgbGV0IG5vdGVfaWQgPSBldmVudC5ub3RlXG4gIGlmKG5vdGVfaWQpe1xuICAgIHVwZGF0ZU1JRElOb3RlKG5vdGVfaWQsIHN0YXRlKVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7XG4gIFVQREFURV9NSURJX05PVEUsXG4gIENSRUFURV9NSURJX05PVEUsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBtaWRpTm90ZUluZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlTUlESU5vdGUoaWQsIHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKSl7XG4gIGxldCBub3RlID0gc3RhdGUubWlkaU5vdGVzW2lkXVxuICBsZXQgZXZlbnRzID0gc3RhdGUubWlkaUV2ZW50c1xuICBsZXQgc3RhcnQgPSBldmVudHNbbm90ZS5ub3Rlb25dXG4gIGxldCBlbmQgPSBldmVudHNbbm90ZS5ub3Rlb2ZmXVxuXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBVUERBVEVfTUlESV9OT1RFLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgc3RhcnQ6IHN0YXJ0LnRpY2tzLFxuICAgICAgZW5kOiBlbmQudGlja3MsXG4gICAgICBkdXJhdGlvblRpY2tzOiBlbmQudGlja3MgLSBzdGFydC50aWNrc1xuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1JRElOb3RlKG5vdGVvbjogc3RyaW5nLCBub3Rlb2ZmOiBzdHJpbmcpe1xuICBsZXQgZXZlbnRzID0gc3RvcmUuZ2V0U3RhdGUoKS5zZXF1ZW5jZXIubWlkaUV2ZW50c1xuICBsZXQgb24gPSBldmVudHNbbm90ZW9uXVxuICBsZXQgb2ZmID0gZXZlbnRzW25vdGVvZmZdXG4gIGlmKG9uLmRhdGExICE9PSBvZmYuZGF0YTEpe1xuICAgIGNvbnNvbGUuZXJyb3IoJ2NhblxcJ3QgY3JlYXRlIE1JREkgbm90ZTogZXZlbnRzIG11c3QgaGF2ZSB0aGUgc2FtZSBkYXRhMSB2YWx1ZSwgaS5lLiB0aGUgc2FtZSBwaXRjaCcpXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgbGV0IGlkID0gYE1OXyR7bWlkaU5vdGVJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IENSRUFURV9NSURJX05PVEUsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBub3Rlb24sXG4gICAgICBub3Rlb2ZmLFxuICAgICAgc3RhcnQ6IG9uLnRpY2tzLFxuICAgICAgZW5kOiBvZmYudGlja3MsXG4gICAgICBkdXJhdGlvblRpY2tzOiBvZmYudGlja3MgLSBvbi50aWNrc1xuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG4iLCJpbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7XG4gIENSRUFURV9QQVJULFxuICBBRERfTUlESV9FVkVOVFMsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBwYXJ0SW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQYXJ0KFxuICBzZXR0aW5nczoge1xuICAgIG5hbWU6IHN0cmluZyxcbiAgICB0cmFjazogc3RyaW5nLFxuICAgIG1pZGlFdmVudHM6QXJyYXk8c3RyaW5nPixcbiAgICBtaWRpTm90ZXM6QXJyYXk8c3RyaW5nPixcbiAgfSA9IHt9XG4pe1xuICBsZXQgaWQgPSBgTVBfJHtwYXJ0SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIGxldCB7XG4gICAgbmFtZSA9IGlkLFxuICAgIG1pZGlFdmVudHMgPSBbXSxcbiAgICBtaWRpTm90ZXMgPSBbXSxcbiAgICB0cmFjayA9ICdub25lJ1xuICB9ID0gc2V0dGluZ3NcblxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX1BBUlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBuYW1lLFxuICAgICAgbWlkaUV2ZW50cyxcbiAgICAgIG1pZGlOb3RlcyxcbiAgICAgIHRyYWNrXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1JRElFdmVudHMocGFydF9pZDogc3RyaW5nLCAuLi5taWRpX2V2ZW50X2lkczogc3RyaW5nKXtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9NSURJX0VWRU5UUyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBwYXJ0X2lkLFxuICAgICAgbWlkaV9ldmVudF9pZHNcbiAgICB9XG4gIH0pXG59IiwiaW1wb3J0IHtjb21iaW5lUmVkdWNlcnN9IGZyb20gJ3JlZHV4J1xuaW1wb3J0IHtcbiAgQ1JFQVRFX1NPTkcsXG4gIENSRUFURV9UUkFDSyxcbiAgQ1JFQVRFX1BBUlQsXG4gIEFERF9QQVJUUyxcbiAgQUREX1RSQUNLUyxcbiAgQUREX01JRElfTk9URVMsXG4gIEFERF9NSURJX0VWRU5UUyxcbiAgQUREX1RJTUVfRVZFTlRTLFxuICBDUkVBVEVfTUlESV9FVkVOVCxcbiAgQ1JFQVRFX01JRElfTk9URSxcbiAgQUREX0VWRU5UU19UT19TT05HLFxuICBVUERBVEVfTUlESV9FVkVOVCxcbiAgVVBEQVRFX01JRElfTk9URSxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcbiAgc29uZ3M6IHt9LFxuICB0cmFja3M6IHt9LFxuICBwYXJ0czoge30sXG4gIG1pZGlFdmVudHM6IHt9LFxuICBtaWRpTm90ZXM6IHt9LFxufVxuXG5cbmZ1bmN0aW9uIHNlcXVlbmNlcihzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKXtcbiAgc3dpdGNoKGFjdGlvbi50eXBlKXtcblxuICAgIGNhc2UgQ1JFQVRFX1NPTkc6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIENSRUFURV9UUkFDSzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUudHJhY2tzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIENSRUFURV9QQVJUOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5wYXJ0c1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfTUlESV9FVkVOVDpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUubWlkaUV2ZW50c1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfTUlESV9OT1RFOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5taWRpTm90ZXNbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQUREX1RSQUNLUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgbGV0IHNvbmdJZCA9IGFjdGlvbi5wYXlsb2FkLnNvbmdfaWRcbiAgICAgIGxldCBzb25nID0gc3RhdGUuc29uZ3Nbc29uZ0lkXVxuICAgICAgaWYoc29uZyl7XG4gICAgICAgIGxldCB0cmFja0lkcyA9IGFjdGlvbi5wYXlsb2FkLnRyYWNrX2lkc1xuICAgICAgICB0cmFja0lkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICBsZXQgdHJhY2sgPSBzdGF0ZS50cmFja3NbaWRdXG4gICAgICAgICAgaWYodHJhY2spe1xuICAgICAgICAgICAgc29uZy50cmFja3MucHVzaChpZClcbiAgICAgICAgICAgIHRyYWNrLnNvbmcgPSBzb25nSWRcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgbm8gdHJhY2sgd2l0aCBpZCAke2lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gc29uZyBmb3VuZCB3aXRoIGlkICR7c29uZ0lkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIEFERF9QQVJUUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgbGV0IHRyYWNrSWQgPSBhY3Rpb24ucGF5bG9hZC50cmFja19pZFxuICAgICAgbGV0IHRyYWNrID0gc3RhdGUudHJhY2tzW3RyYWNrSWRdXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIC8vdHJhY2sucGFydHMucHVzaCguLi5hY3Rpb24ucGF5bG9hZC5wYXJ0X2lkcylcbiAgICAgICAgbGV0IHBhcnRJZHMgPSBhY3Rpb24ucGF5bG9hZC5wYXJ0X2lkc1xuICAgICAgICBwYXJ0SWRzLmZvckVhY2goZnVuY3Rpb24oaWQpe1xuICAgICAgICAgIGxldCBwYXJ0ID0gc3RhdGUucGFydHNbaWRdXG4gICAgICAgICAgaWYocGFydCl7XG4gICAgICAgICAgICB0cmFjay5wYXJ0cy5wdXNoKGlkKVxuICAgICAgICAgICAgcGFydC50cmFjayA9IHRyYWNrSWRcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgbm8gcGFydCB3aXRoIGlkICR7aWR9YClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS53YXJuKGBubyB0cmFjayBmb3VuZCB3aXRoIGlkICR7dHJhY2tJZH1gKVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBBRERfTUlESV9FVkVOVFM6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGxldCBwYXJ0SWQgPSBhY3Rpb24ucGF5bG9hZC5wYXJ0X2lkXG4gICAgICBsZXQgcGFydCA9IHN0YXRlLnBhcnRzW3BhcnRJZF1cbiAgICAgIGlmKHBhcnQpe1xuICAgICAgICAvL3BhcnQubWlkaUV2ZW50cy5wdXNoKC4uLmFjdGlvbi5wYXlsb2FkLm1pZGlfZXZlbnRfaWRzKVxuICAgICAgICBsZXQgbWlkaUV2ZW50SWRzID0gYWN0aW9uLnBheWxvYWQubWlkaV9ldmVudF9pZHNcbiAgICAgICAgbWlkaUV2ZW50SWRzLmZvckVhY2goZnVuY3Rpb24oaWQpe1xuICAgICAgICAgIGxldCBtaWRpRXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2lkXVxuICAgICAgICAgIGlmKG1pZGlFdmVudCl7XG4gICAgICAgICAgICBwYXJ0Lm1pZGlFdmVudHMucHVzaChpZClcbiAgICAgICAgICAgIG1pZGlFdmVudC5wYXJ0ID0gcGFydElkXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIE1JREkgZXZlbnQgZm91bmQgd2l0aCBpZCAke2lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gcGFydCBmb3VuZCB3aXRoIGlkICR7cGFydElkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9NSURJX0VWRU5UOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBsZXQgZXZlbnRJZCA9IGFjdGlvbi5wYXlsb2FkLmlkXG4gICAgICBsZXQgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2V2ZW50SWRdO1xuICAgICAgaWYoZXZlbnQpe1xuICAgICAgICAoe1xuICAgICAgICAgIHRpY2tzOiBldmVudC50aWNrcyA9IGV2ZW50LnRpY2tzLFxuICAgICAgICAgIGRhdGExOiBldmVudC5kYXRhMSA9IGV2ZW50LmRhdGExLFxuICAgICAgICAgIGRhdGEyOiBldmVudC5kYXRhMiA9IGV2ZW50LmRhdGEyLFxuICAgICAgICB9ID0gYWN0aW9uLnBheWxvYWQpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS53YXJuKGBubyBNSURJIGV2ZW50IGZvdW5kIHdpdGggaWQgJHtldmVudElkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9NSURJX05PVEU6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGxldCBub3RlID0gc3RhdGUubWlkaU5vdGVzW2FjdGlvbi5wYXlsb2FkLmlkXTtcbiAgICAgICh7XG4gICAgICAgIC8vIGlmIHRoZSBwYXlsb2FkIGhhcyBhIHZhbHVlIGZvciAnc3RhcnQnIGl0IHdpbGwgYmUgYXNzaWduZWQgdG8gbm90ZS5zdGFydCwgb3RoZXJ3aXNlIG5vdGUuc3RhcnQgd2lsbCBrZWVwIGl0cyBjdXJyZW50IHZhbHVlXG4gICAgICAgIHN0YXJ0OiBub3RlLnN0YXJ0ID0gbm90ZS5zdGFydCxcbiAgICAgICAgZW5kOiBub3RlLmVuZCA9IG5vdGUuZW5kLFxuICAgICAgICBkdXJhdGlvblRpY2tzOiBub3RlLmR1cmF0aW9uVGlja3MgPSBub3RlLmR1cmF0aW9uVGlja3NcbiAgICAgIH0gPSBhY3Rpb24ucGF5bG9hZClcbiAgICAgIGJyZWFrXG5cblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBkbyBub3RoaW5nXG4gIH1cbiAgcmV0dXJuIHN0YXRlXG59XG5cblxuY29uc3Qgc2VxdWVuY2VyQXBwID0gY29tYmluZVJlZHVjZXJzKHtcbiAgc2VxdWVuY2VyLFxufSlcblxuZXhwb3J0IGRlZmF1bHQgc2VxdWVuY2VyQXBwXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7XG4gIENSRUFURV9TT05HLFxuICBBRERfVFJBQ0tTLFxuICBBRERfTUlESV9FVkVOVFNfVE9fU09ORyxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IHNvbmdJbmRleCA9IDBcblxuY29uc3QgZGVmYXVsdFNvbmcgPSB7XG4gIHBwcTogOTYwLFxuICBicG06IDEyMCxcbiAgYmFyczogMzAsXG4gIGxvd2VzdE5vdGU6IDAsXG4gIGhpZ2hlc3ROb3RlOiAxMjcsXG4gIG5vbWluYXRvcjogNCxcbiAgZGVub21pbmF0b3I6IDQsXG4gIHF1YW50aXplVmFsdWU6IDgsXG4gIGZpeGVkTGVuZ3RoVmFsdWU6IGZhbHNlLFxuICBwb3NpdGlvblR5cGU6ICdhbGwnLFxuICB1c2VNZXRyb25vbWU6IGZhbHNlLFxuICBhdXRvU2l6ZTogdHJ1ZSxcbiAgbG9vcDogZmFsc2UsXG4gIHBsYXliYWNrU3BlZWQ6IDEsXG4gIGF1dG9RdWFudGl6ZTogZmFsc2UsXG4gIHRpbWVFdmVudHM6IFtdLFxuICBtaWRpRXZlbnRzOiBbXSxcbiAgcGFydHM6IFtdLFxuICB0cmFja3M6IFtdLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU29uZyhzZXR0aW5ncyl7XG4gIGxldCBpZCA9IGBTXyR7c29uZ0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBsZXQgcyA9IHt9O1xuICAoe1xuICAgIG5hbWU6IHMubmFtZSA9IGlkLFxuICAgIHBwcTogcy5wcHEgPSBkZWZhdWx0U29uZy5wcHEsXG4gICAgYnBtOiBzLmJwbSA9IGRlZmF1bHRTb25nLmJwbSxcbiAgICBiYXJzOiBzLmJhcnMgPSBkZWZhdWx0U29uZy5iYXJzLFxuICAgIGxvd2VzdE5vdGU6IHMubG93ZXN0Tm90ZSA9IGRlZmF1bHRTb25nLmxvd2VzdE5vdGUsXG4gICAgaGlnaGVzdE5vdGU6IHMuaGlnaGVzdE5vdGUgPSBkZWZhdWx0U29uZy5oaWdoZXN0Tm90ZSxcbiAgICBub21pbmF0b3I6IHMubm9taW5hdG9yID0gZGVmYXVsdFNvbmcubm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yOiBzLmRlbm9taW5hdG9yID0gZGVmYXVsdFNvbmcuZGVub21pbmF0b3IsXG4gICAgcXVhbnRpemVWYWx1ZTogcy5xdWFudGl6ZVZhbHVlID0gZGVmYXVsdFNvbmcucXVhbnRpemVWYWx1ZSxcbiAgICBmaXhlZExlbmd0aFZhbHVlOiBzLmZpeGVkTGVuZ3RoVmFsdWUgPSBkZWZhdWx0U29uZy5maXhlZExlbmd0aFZhbHVlLFxuICAgIHBvc2l0aW9uVHlwZTogcy5wb3NpdGlvblR5cGUgPSBkZWZhdWx0U29uZy5wb3NpdGlvblR5cGUsXG4gICAgdXNlTWV0cm9ub21lOiBzLnVzZU1ldHJvbm9tZSA9IGRlZmF1bHRTb25nLnVzZU1ldHJvbm9tZSxcbiAgICBhdXRvU2l6ZTogcy5hdXRvU2l6ZSA9IGRlZmF1bHRTb25nLmF1dG9TaXplLFxuICAgIGxvb3A6IHMubG9vcCA9IGRlZmF1bHRTb25nLmxvb3AsXG4gICAgcGxheWJhY2tTcGVlZDogcy5wbGF5YmFja1NwZWVkID0gZGVmYXVsdFNvbmcucGxheWJhY2tTcGVlZCxcbiAgICBhdXRvUXVhbnRpemU6IHMuYXV0b1F1YW50aXplID0gZGVmYXVsdFNvbmcuYXV0b1F1YW50aXplLFxuICB9ID0gc2V0dGluZ3MpXG5cbiAgbGV0e1xuICAgIHRpbWVFdmVudHM6IHRpbWVFdmVudHMgPSBkZWZhdWx0U29uZy50aW1lRXZlbnRzLFxuICAgIG1pZGlFdmVudHM6IG1pZGlFdmVudHMgPSBkZWZhdWx0U29uZy5taWRpRXZlbnRzLFxuICAgIHBhcnRzOiBwYXJ0cyA9IGRlZmF1bHRTb25nLnBhcnRzLFxuICAgIHRyYWNrczogdHJhY2tzID0gZGVmYXVsdFNvbmcudHJhY2tzLFxuICB9ID0gc2V0dGluZ3NcblxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aW1lRXZlbnRzLFxuICAgICAgbWlkaUV2ZW50cyxcbiAgICAgIHBhcnRzLFxuICAgICAgdHJhY2tzLFxuICAgICAgc2V0dGluZ3M6IHNcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUcmFja3Moc29uZ19pZDogc3RyaW5nLCAuLi50cmFja19pZHM6c3RyaW5nKXtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9UUkFDS1MsXG4gICAgcGF5bG9hZDoge1xuICAgICAgc29uZ19pZCxcbiAgICAgIHRyYWNrX2lkcyxcbiAgICB9XG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1JRElFdmVudHMoXG4gIHNldHRpbmdzOiB7c29uZ19pZDogc3RyaW5nLCB0cmFja19pZDogc3RyaW5nLCBwYXJ0X2lkOiBzdHJpbmd9LFxuICBtaWRpX2V2ZW50czogQXJyYXk8e3RpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlcn0+XG4pe1xuICAvL0B0b2RvOiBjcmVhdGUgcGFydCwgYWRkIGV2ZW50cyB0byBwYXJ0LCBjcmVhdGUgdHJhY2ssIGFkZCBwYXJ0IHRvIHRyYWNrLCBhZGQgdHJhY2sgdG8gc29uZ1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTX1RPX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuLy8gICAgICBpZDogc29uZ19pZCxcbiAgICAgIG1pZGlfZXZlbnRzXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkTUlESUV2ZW50c1RvU29uZyhzb25nX2lkOiBzdHJpbmcsIG1pZGlfZXZlbnRzOiBBcnJheTx7dGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyfT4pe1xuICAvL0B0b2RvOiBjcmVhdGUgcGFydCwgYWRkIGV2ZW50cyB0byBwYXJ0LCBjcmVhdGUgdHJhY2ssIGFkZCBwYXJ0IHRvIHRyYWNrLCBhZGQgdHJhY2sgdG8gc29uZ1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTX1RPX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQ6IHNvbmdfaWQsXG4gICAgICBtaWRpX2V2ZW50c1xuICAgIH1cbiAgfSlcbn1cblxuIiwiaW1wb3J0IHtcbiAgY3JlYXRlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50VG8sXG59IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydHtcbiAgY3JlYXRlTUlESU5vdGVcbn0gZnJvbSAnLi9taWRpX25vdGUnXG5pbXBvcnR7XG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrc1xufSBmcm9tICcuL3NvbmcnXG5pbXBvcnR7XG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0c1xufSBmcm9tICcuL3RyYWNrJ1xuaW1wb3J0e1xuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzXG59IGZyb20gJy4vcGFydCdcblxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblxuICBsZXQgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25leHQnKVxuICBsZXQgYnV0dG9uQ2xpY2tlZCA9IDBcbiAgbGV0IG5vdGVvbiwgbm90ZW9mZiwgbm90ZSwgc29uZywgdHJhY2ssIHBhcnQxLCBwYXJ0MlxuXG4gIHNvbmcgPSBjcmVhdGVTb25nKHtuYW1lOiAnTXkgRmlyc3QgU29uZycsIHBsYXliYWNrU3BlZWQ6IDEwMCwgbG9vcDogdHJ1ZX0pXG4gIHRyYWNrID0gY3JlYXRlVHJhY2soe25hbWU6ICdndWl0YXInLCBzb25nfSlcbiAgcGFydDEgPSBjcmVhdGVQYXJ0KHtuYW1lOiAnc29sbzEnLCB0cmFja30pXG4gIHBhcnQyID0gY3JlYXRlUGFydCh7bmFtZTogJ3NvbG8yJywgdHJhY2t9KVxuICBub3Rlb24gPSBjcmVhdGVNSURJRXZlbnQoMTIwLCAxNDQsIDYwLCAxMDApXG4gIG5vdGVvZmYgPSBjcmVhdGVNSURJRXZlbnQoMjQwLCAxMjgsIDYwLCAwKVxuXG4gIG5vdGUgPSBjcmVhdGVNSURJTm90ZShub3Rlb24sIG5vdGVvZmYpXG5cbiAgYWRkTUlESUV2ZW50cyhwYXJ0MSwgbm90ZW9uLCBub3Rlb2ZmLCAnYmVlcicsICdrb25pam4nKVxuICBhZGRQYXJ0cyh0cmFjaywgcGFydDEsIHBhcnQyKVxuICBhZGRUcmFja3Moc29uZywgdHJhY2spXG5cbiAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzd2l0Y2goYnV0dG9uQ2xpY2tlZCl7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIG5vdGVvbiA9IGNyZWF0ZU1JRElFdmVudCgxMjAsIDE0NCwgNjAsIDEwMClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIG5vdGVvZmYgPSBjcmVhdGVNSURJRXZlbnQoMjQwLCAxMjgsIDYwLCAxMDApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBub3RlID0gY3JlYXRlTUlESU5vdGUobm90ZW9uLCBub3Rlb2ZmKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgbW92ZU1JRElFdmVudChub3Rlb24sIC0xMDApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICBtb3ZlTUlESUV2ZW50VG8obm90ZW9mZiwgMjYwKVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICAgIGJ1dHRvbkNsaWNrZWQrK1xuICB9KVxufSlcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX1RSQUNLLFxuICBBRERfUEFSVFMsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCB0cmFja0luZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJhY2soXG4gIHNldHRpbmdzOiB7bmFtZTogc3RyaW5nLCBwYXJ0czpBcnJheTxzdHJpbmc+LCBzb25nOiBzdHJpbmd9ID0ge31cbiAgLy9zZXR0aW5nczoge25hbWU6IHN0cmluZywgcGFydHM6QXJyYXk8c3RyaW5nPiwgc29uZzogc3RyaW5nfSA9IHtuYW1lOiAnYWFwJywgcGFydHM6IFtdLCBzb25nOiAnbm8gc29uZyd9XG4gIC8vc2V0dGluZ3MgPSB7bmFtZTogbmFtZSA9ICdhYXAnLCBwYXJ0czogcGFydHMgPSBbXSwgc29uZzogc29uZyA9ICdubyBzb25nJ31cbiAgLy9zZXR0aW5ncyA9IHtuYW1lOiBuYW1lID0gJ2FhcCcsIHBhcnRzOiBwYXJ0cyA9IFtdLCBzb25nOiBzb25nID0gJ25vIHNvbmcnfVxuKXtcbiAgbGV0IGlkID0gYE1UXyR7dHJhY2tJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHtcbiAgICBuYW1lID0gaWQsXG4gICAgcGFydHMgPSBbXSxcbiAgICBzb25nID0gJ25vbmUnXG4gIH0gPSBzZXR0aW5nc1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX1RSQUNLLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgbmFtZSxcbiAgICAgIHBhcnRzLFxuICAgICAgc29uZ1xuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFBhcnRzKHRyYWNrX2lkOiBzdHJpbmcsIC4uLnBhcnRfaWRzOnN0cmluZyl7XG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfUEFSVFMsXG4gICAgcGF5bG9hZDoge1xuICAgICAgdHJhY2tfaWQsXG4gICAgICBwYXJ0X2lkcyxcbiAgICB9XG4gIH0pXG59Il19
